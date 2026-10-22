#!/usr/bin/env python3
"""Utkast til «Norwegian Business School Ranking»: forskning, utdanning og anerkjennelse per handelshøyskole.

Utforskende arbeid (oktober 2026). Resultatet krypteres (samme oppskrift og passord som scripts/build-opptak-intern.py,
INTERN_PASSORD i kilde/.env.local) til kilde/public/intern/rangering.json og vises under HH → «Rangering (intern)».
Grunnen er ikke at tallene er hemmelige (nesten alt er åpen statistikk), men at metoden er et utkast, og at
AJG-nivåene (Chartered ABS) er lisensbelagt og ikke skal publiseres som liste.

Kilder:
  data/rangering/skoler.json            Enhetene: NVA-enheter, DBH-institusjon og -avdelinger/fakultet, akkrediteringer.
  DBH/HK-dir 225 + 220                  Årsverk per avdeling og stillingskategori. «Faglige» = UN1+UN3+UN4,
                                        «rekruttering» = UN2 (stipendiat, postdoktor). Hovedmålet «poeng per faglig
                                        ansatt» bruker UFF-årsverk = faglige + rekruttering (gjenskaper HHs infografikk:
                                        BI 1,27 i 2023 og 2024).
  DBH/HK-dir 373, 374                   Publiseringspoeng og antall publikasjoner per avdeling; poeng per nivå.
  DBH/HK-dir 123, 210                   Registrerte studenter; avdeling → fakultet.
  NVA (scripts/fetch-nva-artikler.py)   Vitenskapelige artikler per enhet og år med tidsskrift og ISSN.
  data/rangering/norden/                Kartpunkt for de norske enhetene og foreløpige tall for Danmark, Sverige og
                                        Finland (fanen «Kart»; ikke del av rangeringen).
  data/rangering/openalex/              Siteringsmål fra OpenAlex (CC0): FWCI, topp 10 %/1 % og siteringer per enhet og år
                                        (scripts/rangering/hent_nva_doi.py, hent_openalex.py, sitering.py; cache gitignored).
                                        Bare aggregater ut. Uavhengig av tidsskriftlistene.
  data/rangering/norden/nevner/          Nevnere for nordiske enheter (scripts/rangering/lag_nevner_norden.py) til fanen
                                        «Skandinavia» (scripts/rangering/skandinavia.py: OpenAlex + AJG for alle land).
  data/rangering/ajg-nhh-rapport.json   ABS/AJG 4*/4/3 per skole 2020–2024 fra NHH Research Report 2024
                                        (scripts/rangering/nhh_abs_tabeller.py).
  data/rangering/tidsskrift/            ABDC (A*/A/B/C), FT50, UTD24, og AJG 2024 (1–4*) hvis ajg2024.csv finnes
                                        (lisensbelagt, gitignored; mal i ajg-mal.csv).
  kilde/src/app/data/hh*Data            Opptak (Samordna), Studiebarometeret og gjennomføring for ØA-bachelor/-master,
                                        allerede bygd for HH-sammenligningene.

Bruk:
  python3 scripts/fetch-nva-artikler.py            # først (cache)
  python3 scripts/build-rangering.py [--refresh] [--klartekst]
  --klartekst skriver også data/rangering/rangering-klartekst.json (gitignored) for kontroll.
"""
import argparse
import base64
import collections
import csv
import datetime as dt
import importlib.util
import json
import os
import re
from pathlib import Path

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ROOT = Path(__file__).resolve().parent.parent
RANG = ROOT / "data" / "rangering"
LISTER = RANG / "tidsskrift"
CACHE = RANG / "dbh"
APPDATA = ROOT / "kilde" / "src" / "app" / "data"
OUT = ROOT / "kilde" / "public" / "intern" / "rangering.json"
OUT_DELT = ROOT / "kilde" / "public" / "rangering-data.json"  # hh-rangering.pages.dev, RANGERING_PASSORD
KLAR = RANG / "rangering-klartekst.json"
ENV = ROOT / "kilde" / ".env.local"
ITER = 310_000
Y0, Y1 = 2016, 2025

spec = importlib.util.spec_from_file_location("blc", ROOT / "scripts" / "build-landsam-courses.py")
blc = importlib.util.module_from_spec(spec); spec.loader.exec_module(blc)
# Siteringsmål fra OpenAlex (scripts/rangering/sitering.py): bare aggregater per enhet og år
spec = importlib.util.spec_from_file_location("sitering", ROOT / "scripts" / "rangering" / "sitering.py")
sitering_mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(sitering_mod)
# Skandinavia-sammenligningen (scripts/rangering/skandinavia.py): OpenAlex + AJG for alle land, nordiske nevnere
spec = importlib.util.spec_from_file_location("skandinavia", ROOT / "scripts" / "rangering" / "skandinavia.py")
skandinavia_mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(skandinavia_mod)
FORSTE = re.compile(r"professor|førsteamanuensis|dosent|førstelektor", re.I)


# ── Hjelpere ────────────────────────────────────────────────────────────────
def fl(v):
    try:
        return float(v or 0)
    except (TypeError, ValueError):
        return 0.0


def r1(v, d=1):
    return None if v is None else round(v, d)


def issn(s):
    s = re.sub(r"[^0-9Xx]", "", str(s or "")).upper()
    return s if len(s) == 8 else None


def q(tid, inst, group_by=None, variabler=None, extra=None, years=True):
    f = [{"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [inst]}}]
    if years:
        f.append({"variabel": "Årstall", "selection": {"filter": "between", "values": [str(Y0), str(Y1)]}})
    f += extra or []
    b = {"tabell_id": tid, "api_versjon": 1, "statuslinje": "J", "kodetekst": "N", "desimal_separator": ".", "filter": f}
    if group_by:
        b["groupBy"] = group_by
    if variabler:
        b["variabler"] = variabler
    return b


def dbh(name, body, refresh):
    try:
        return blc.fetch_dbh(body, CACHE / name, refresh)
    except json.JSONDecodeError:
        return []


def passord(navn="INTERN_PASSORD"):
    for line in ENV.read_text(encoding="utf-8").splitlines() if ENV.exists() else []:
        if line.startswith(navn + "="):
            return line.split("=", 1)[1].strip()
    if navn == "RANGERING_PASSORD":
        # Eget passord for nettstedet med bare rangeringen, så kolleger ikke får det interne passordet.
        # Lages første gang og legges i kilde/.env.local (gitignored). Bytt ved å endre linja og bygge på nytt.
        import secrets
        pw = "hh-" + secrets.token_urlsafe(12)
        with open(ENV, "a", encoding="utf-8") as fh:
            fh.write(f"\n# Passord for hh-rangering.pages.dev (bare rangeringen), laget av build-rangering.py\n{navn}={pw}\n")
        print(f"Laget nytt {navn} i {ENV.relative_to(ROOT)}.")
        return pw
    raise SystemExit("Mangler INTERN_PASSORD i kilde/.env.local (lages av scripts/build-opptak-intern.py).")


def krypter(obj, pw):
    salt, iv = os.urandom(16), os.urandom(12)
    key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITER).derive(pw.encode("utf-8"))
    ct = AESGCM(key).encrypt(iv, json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8"), None)
    return {"v": 1, "alg": "AES-256-GCM/PBKDF2-SHA256", "iter": ITER, "salt": base64.b64encode(salt).decode(),
            "iv": base64.b64encode(iv).decode(), "data": base64.b64encode(ct).decode()}


# ── Tidsskriftlister ────────────────────────────────────────────────────────
def les_liste(navn, verdi_kol, fag_kol=None, krav=None):
    """ISSN → (verdi, fagfelt). Godtar kolonnenavn tittel/issn/eissn + verdi_kol."""
    f = LISTER / navn
    if not f.exists():
        return None
    ut = {}
    with open(f, encoding="utf-8-sig", newline="") as fh:
        for r in csv.DictReader(fh):
            r = {(k or "").strip().lower(): (v or "").strip() for k, v in r.items()}
            v = r.get(verdi_kol, "") if verdi_kol else "1"
            if not v or (krav and r.get(krav) not in ("1", "ja", "true", "True")):
                continue
            for k in ("issn", "eissn", "pissn", "issn_print", "issn_online"):
                i = issn(r.get(k))
                if i:
                    ut[i] = (v, r.get(fag_kol) if fag_kol else None, r.get("tittel") or r.get("title"))
    # Alias-ISSN: samme tidsskrift med annet ISSN i NVA enn på lista (nytt navn, nytt eISSN). Bare bekreftede par,
    # aldri tittelkobling (gir falske treff). Kontroll 22.10.2026.
    fa = LISTER / "alias.csv"
    if fa.exists():
        with open(fa, encoding="utf-8-sig", newline="") as fh:
            for r in csv.DictReader(fh):
                a_, l_ = issn(r.get("alias_issn")), issn(r.get("liste_issn"))
                if a_ and l_ in ut and a_ not in ut:
                    ut[a_] = ut[l_]
    return ut


KORT = {"nhh": "NHH", "bi": "BI", "nmbu": "HH NMBU", "uis": "UiS", "uia": "UiA", "nord": "Nord", "ntnu": "NTNU",
        "uit": "UiT", "usn": "USN", "inn": "INN", "oslomet": "OsloMet", "himolde": "HiMolde", "hvl": "HVL",
        "kristiania": "Kristiania", "hiof": "HiØ", "ntnu_ok": "NTNU ØK (hele)", "ntnu_hh": "NTNU HH", "uib_okon": "UiB økonomi", "uio_okon": "UiO økonomi"}
AJG_NIVAER = ["1", "2", "3", "4", "4*"]
ABDC_NIVAER = ["C", "B", "A", "A*"]


# ── Kontroll mot eksterne, publiserte tall ──────────────────────────────────
KONTROLL = RANG / "kontroll" / "eksterne-tall.json"
# Eksternt mål → (felt i DBH-årsdata, desimaler for sammenligning)
ALIAS = {"hh": "nmbu"}
MAAL = {"publiseringspoeng": "publPoeng", "poeng_per_faglig": "poengPerFaglig", "poeng_per_uff": "poengPerUff",
        "publikasjoner": "publikasjoner", "niva2_andel": "niva2Andel"}


def lag_forelopig(skoler, lister):
    """Foreløpige tall for inneværende år (fanen «2026 foreløpig»), fra data/rangering/nva-forelopig/<skole>/<år>.json
    (scripts/fetch-nva-artikler.py --mappe …). Alle registrerte artikler telles (NVI-rapporteringen for året er ikke
    lukket). For å ta høyde for ujevn registrering sammenlignes året med forrige år slik det var registrert på samme
    dato (NVAs createdDate), i tillegg til forrige år i alt. Bare aggregater per skole: antall (hel telling), sum
    forfatterandel, norsk nivå 2 og AJG 4*/4/3 (hel telling) og i AJG-tidsskrift."""
    mappe = RANG / "nva-forelopig"
    if not mappe.exists():
        return None
    filer = sorted(mappe.glob("*/*.json"))
    if not filer:
        return None
    aar = max(int(f.stem) for f in filer)

    def agg(artikler):
        a = {"n": 0, "andel": 0.0, "niva2": 0, "ajg": 0, "4*": 0, "4": 0, "3": 0, "nvi": 0}
        for x in artikler:
            a["n"] += 1
            a["nvi"] += bool(x.get("nvi"))
            a["andel"] += (x.get("egne") or 0) / max(x.get("forfattere") or 1, 1)
            a["niva2"] += x.get("niva") == "LevelTwo"
            iss = [i for i in (issn(x.get("issn")), issn(x.get("eissn"))) if i]
            tj = next((lister["ajg"][i] for i in iss if lister["ajg"] and i in lister["ajg"]), None)
            if tj and tj[0] in AJG_NIVAER:
                a["ajg"] += 1
                if tj[0] in ("4*", "4", "3"):
                    a[tj[0]] += 1
        a["andel"] = round(a["andel"], 2)
        return a

    ut, dato = {}, None
    for s in skoler:
        fn_, ff = mappe / s["id"] / f"{aar}.json", mappe / s["id"] / f"{aar - 1}.json"
        if not fn_.exists() or not ff.exists():
            continue
        dn, df = json.loads(fn_.read_text(encoding="utf-8")), json.loads(ff.read_text(encoding="utf-8"))
        hentet = dn["hentet"]
        dato = max(dato or hentet, hentet)
        fjor_dato = f"{int(hentet[:4]) - 1}{hentet[4:]}"
        samme = [x for x in df["artikler"] if x.get("reg") and x["reg"] <= fjor_dato]
        ut[s["id"]] = {"hentet": hentet, "naa": agg(dn["artikler"]), "fjorSamme": agg(samme), "fjorHele": agg(df["artikler"]),
                       "utenDato": sum(1 for x in df["artikler"] if not x.get("reg"))}
    if not ut:
        return None
    print(f"Foreløpig {aar}: {len(ut)} skoler, hentet {dato}")
    return {"aar": aar, "dato": dato, "skoler": ut, "lister": {"ajg": bool(lister["ajg"])}}


def lag_ajg_profil(lister):
    """Fagfeltprofilen: hele AJG-lista og internasjonale handelshøyskoler (scripts/rangering/hent_ajg_profil.py).

    Bare aggregater per AJG-fagfelt, som [alle, nivå 3+, nivå 4/4*]: antall tidsskrift på lista, artikler i
    tidsskriftene per år (OpenAlex) og artikler per skole og år i AJG-tidsskrift (OpenAlex, hel telling).
    Krever AJG-lista; ellers None."""
    if not lister["ajg"]:
        return None
    oa = RANG / "openalex"
    kart = json.loads((oa / "ajg-kilder.json").read_text(encoding="utf-8")) if (oa / "ajg-kilder.json").exists() else {}
    tids = collections.defaultdict(lambda: [0, 0, 0])
    kilde = {}  # OpenAlex-kilde → (nivå, fagfelt)
    with open(LISTER / "ajg2024.csv", encoding="utf-8-sig", newline="") as fh:
        for r in csv.DictReader(fh):
            niva, fag = r.get("ajg2024"), r.get("fagfelt")
            if niva not in AJG_NIVAER or not fag:
                continue
            t = tids[fag]; t[0] += 1; t[1] += niva in ("3", "4", "4*"); t[2] += niva in ("4", "4*")
            for i in (r.get("issn"), r.get("eissn")):
                i = issn(i)
                kid = kart.get(f"{i[:4]}-{i[4:]}") if i else None
                if kid:
                    kilde.setdefault(kid, (niva, fag))
    volum = {}
    f = oa / "ajg-volum.json"
    for fag, gr in (json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}).items():
        for g, per in gr.items():
            for y, n in per.items():
                if y.startswith("_"):
                    continue
                v = volum.setdefault(y, {}).setdefault(fag, [0, 0, 0])
                v[0] += n; v[1] += n if g in ("3", "4") else 0; v[2] += n if g == "4" else 0
    f = oa / "hh-internasjonalt.json"
    oppsett = json.loads(f.read_text(encoding="utf-8")) if f.exists() else {"skoler": []}
    skoler = []
    for s in oppsett["skoler"]:
        aar = {}
        for fy in sorted((oa / "hh-profil" / s["id"]).glob("*.json")):
            d = json.loads(fy.read_text(encoding="utf-8"))
            fag = collections.defaultdict(lambda: [0, 0, 0]); n_ajg = 0
            for kid, n in d["kilder"].items():
                if kid in kilde:
                    niva, fg = kilde[kid]; x = fag[fg]
                    x[0] += n; x[1] += n if niva in ("3", "4", "4*") else 0; x[2] += n if niva in ("4", "4*") else 0
                    n_ajg += n
            aar[str(d["aar"])] = {"n": d["n"], "ajg": n_ajg, "fag": dict(fag)}
        if aar:
            skoler.append({k: s[k] for k in ("id", "kort", "navn", "land", "gruppe")}
                          | {"metode": "tekst" if s.get("tekst") else "institusjon", "aar": aar,
                             "utd": s.get("utd"), "topp": s.get("topp") or []})
    print(f"AJG-profil: {len(tids)} fagfelt, {len(kilde)} tidsskrift koblet til OpenAlex, volum {sorted(volum)[:1]}–{sorted(volum)[-1:]}, "
          f"{len(skoler)} internasjonale skoler")
    return {"tidsskrift": dict(tids), "volum": volum, "skoler": skoler, "grupper": oppsett.get("grupper") or {}, "utd": oppsett.get("utd")}


def lag_kontroll(skoler):
    """Sammenligner hvert eksterne tall med vårt tall for samme skole, år og nivå (institusjon eller enhet).
    For «per faglig årsverk» der nevneren er uklar, vises begge våre varianter (faglige og UFF)."""
    if not KONTROLL.exists():
        return []
    ekst = json.loads(KONTROLL.read_text(encoding="utf-8"))
    per_id = {s["id"]: s for s in skoler}
    ut = []
    for e in ekst:
        s = per_id.get(ALIAS.get(e.get("skole"), e.get("skole")))
        felt = MAAL.get(e.get("maal"))
        # Nevneren avgjør definisjonen; merknaden brukes bare når nevneren mangler (den nevner ofte det som IKKE gjelder)
        nev = (e.get("nevner") or e.get("merknad") or "").lower()
        if e.get("maal") == "niva2_andel":
            felt = "niva2AndelFa" if "forfatterandel" in nev else "niva2AndelPubl" if "publikasjon" in nev else "niva2Andel"
        rad = {k: e.get(k) for k in ("skole", "enhet", "enhetNavn", "aar", "maal", "verdi", "nevner", "kilde", "url", "side", "merknad")}
        rad["skole"] = ALIAS.get(rad["skole"], rad["skole"])
        ulik = s and s.get("kontrollUlikAvgrensning") and (e.get("enhet") or "") != "institusjon"
        if ulik:
            rad["merknad"] = " ".join(x for x in (rad.get("merknad"), "Ikke sammenlignet: " + s["kontrollUlikAvgrensning"]) if x)
        if e.get("ikkeSammenlignbar"):  # avklart at kilden måler noe annet (kontroll 22.10.2026)
            ulik = True
            rad["merknad"] = " ".join(x for x in (rad.get("merknad"), "Ikke sammenlignet: " + e["ikkeSammenlignbar"]) if x)
        if s and felt and e.get("aar") is not None and not ulik:
            inst = (e.get("enhet") or "") == "institusjon" and not s.get("ren")
            kilde = s["dbhInst"] if inst else s["dbh"]
            y = kilde.get(str(e["aar"])) or {}
            vaar = y.get(felt)
            alt = None
            if e["maal"] in ("poeng_per_faglig", "poeng_per_uff"):
                # Nevneren styrer: «inkl. stipendiater» = UFF, «ekskl.» = faglige; ellers vises begge
                if "ekskl" in nev or "uten stip" in nev:
                    felt = "poengPerFaglig"
                elif "inkl" in nev or "uff" in nev:
                    felt = "poengPerUff"
                else:
                    alt = y.get("poengPerUff" if felt == "poengPerFaglig" else "poengPerFaglig")
                vaar = y.get(felt)
            rad.update({"vaar": vaar, "vaarAlt": alt, "vaarFelt": felt, "vaarNivaa": "institusjon" if inst else "enhet"})
            try:
                v = float(e["verdi"])
                kand = [x for x in (vaar, alt) if x is not None]
                if kand and v:
                    best = min(kand, key=lambda x: abs(x - v))
                    rad["avvikProsent"] = round(100 * (best - v) / v, 1)
                    rad["traff"] = "alt" if alt is not None and best == alt and best != vaar else "hoved"
            except (TypeError, ValueError):
                pass
        ut.append(rad)
    ut.sort(key=lambda r: (str(r.get("skole")), str(r.get("maal")), r.get("aar") or 0))
    n = [r for r in ut if r.get("avvikProsent") is not None]
    print(f"Kontroll: {len(ut)} eksterne tall, {len(n)} sammenlignbare, "
          f"{sum(abs(r['avvikProsent']) <= 2 for r in n)} innen ±2 %, {sum(abs(r['avvikProsent']) > 10 for r in n)} over ±10 %.")
    return ut


# Foreløpige tall for nordiske enheter (fanen «Kart»): data/rangering/norden/*.json, fylt fra rapportene i
# inspirasjon/norden-<land>.md (scripts/rangering/norden_til_json.py). Ikke del av den norske rangeringen.
NORDEN = RANG / "norden"
NORDEN_LAND = ["danmark", "sverige", "finland"]
NORDEN_TALL = {"artikler", "arsverk", "artiklerPer100", "ajg4", "ajg4Per100", "ajg4Per100UtenStip", "ajg3", "ajg3Per100",
               "ajgDekning", "niva2", "niva2Per100", "abdc", "abdcPer100", "ftUtd", "ftUtdPer100", "ajg4s", "ajg4sPer100",
               "abdcAs", "abdcAsPer100", "ft50", "ft50Per100", "arsverkUtenStip", "ajg3Per100UtenStip"}


def les_norden(norske_ider):
    f = NORDEN / "norge.json"
    steder = json.loads(f.read_text(encoding="utf-8"))["steder"] if f.exists() else {}
    mangler = sorted(norske_ider - set(steder))
    if mangler:
        print(f"Kart: mangler koordinater for {mangler} i {f.relative_to(ROOT)}")
    land = []
    for navn in NORDEN_LAND:
        f = NORDEN / f"{navn}.json"
        if not f.exists():
            continue
        d = json.loads(f.read_text(encoding="utf-8"))
        for x in d.get("enheter", []):
            x.pop("alias", None)
            for p in x.get("perioder", []):
                # Bare aggregerte tall per enhet; ukjente felt (f.eks. lister per tidsskrift) slippes ikke gjennom
                for k in [k for k in p if k not in NORDEN_TALL | {"fra", "til", "anslag", "telling", "kilde", "merknad"}]:
                    p.pop(k)
                beregnet = []
                # Per 100 årsverk og år = sum i perioden / sum årsverk i perioden × 100 (som i AJG-sammenligningen)
                for nev, hale in (("arsverk", ""), ("arsverkUtenStip", "UtenStip")):
                    for tell in (("artikler", "ajg4", "ajg3", "ajg4s") if not hale else ("ajg4", "ajg3")):
                        k100 = f"{tell}Per100{hale}"
                        if p.get(k100) is None and p.get(tell) is not None and p.get(nev):
                            p[k100] = round(100 * p[tell] / p[nev], 1)
                            beregnet.append(k100)
                if beregnet:
                    p["beregnet"] = beregnet
            if isinstance(x.get("enhetskontroll"), dict):
                x["enhetskontroll"] = {k: v for k, v in x["enhetskontroll"].items() if k in NORDEN_TALL | {"fra", "til"}}
        land.append(d)
        print(f"Kart: {d.get('landNavn')} {len(d.get('enheter', []))} enheter, {sum(1 for x in d.get('enheter', []) if x.get('perioder'))} med tall ({d.get('status')})")
    return {"merknad": "Foreløpige tall for enheter utenfor Norge fra utforskningsrapportene (data/rangering/inspirasjon/norden-*.md). "
                       "Ikke del av den norske rangeringen.", "steder": steder, "land": land}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    ap.add_argument("--skoler", default=str(RANG / "skoler.json"), help="annen skoleliste (test)")
    ap.add_argument("--klartekst", action="store_true")
    ap.add_argument("--testpassord", help="krypter med et kastepassord for lokal test (aldri commit resultatet)")
    a = ap.parse_args()

    skoler = json.loads(Path(a.skoler).read_text(encoding="utf-8"))
    lister = {
        "ajg": les_liste("ajg2024.csv", "ajg2024", "fagfelt"),
        "abdc": les_liste("abdc.csv", "rating", "fagfelt"),
        "ft50": les_liste("ft50.csv", None, krav="ft50_2026"),  # gjeldende FT50 (kolonnen ft50_2016 = gammel liste)
        "ft50gml": les_liste("ft50.csv", None, krav="ft50_2016"),  # FT50 før revisjonen i april 2026 (brukt av BI m.fl. t.o.m. 2025)
        "utd24": les_liste("utd24.csv", None),
        # Kalibrert AJG-anslag fra åpne kilder (scripts/rangering/ajg_anslag.py), ikke AJG
        "ajgA": les_liste("ajg-anslag.csv", "anslag"),
    }
    print("Tidsskriftlister:", {k: (len(v) if v else "mangler") for k, v in lister.items()})
    # Delvis AJG-liste: fylt inn for hånd (lag_ajg_oppslag.py) med «ikke» for sjekkede tidsskrift som ikke står på AJG.
    # Da betyr «ikke i fila» at tidsskriftet ikke er sjekket ennå, og det skal ikke telles som «ikke på AJG».
    ajg_delvis = bool(lister["ajg"]) and any(v[0] == "ikke" for v in lister["ajg"].values())
    if lister["ajg"]:
        print(f"AJG 2024: {sum(v[0] in AJG_NIVAER for v in lister['ajg'].values())} ISSN med nivå"
              + (f", {sum(v[0] == 'ikke' for v in lister['ajg'].values())} sjekket uten nivå (delvis liste)" if ajg_delvis else " (hel liste)"))

    # ── DBH ──
    st = blc.fetch_dbh({"tabell_id": 220, "api_versjon": 1, "statuslinje": "J", "kodetekst": "J", "desimal_separator": ".",
                        "variabler": ["Stillingskode", "Stillingsbenevnelse", "Stillingskategorikode"],
                        "filter": [{"variabel": "Stillingskode", "selection": {"filter": "all", "values": ["*"]}}]},
                       CACHE / "220_stillingskoder.json", a.refresh)
    kat = {r["Stillingskode"]: r.get("Stillingskategorikode") or "" for r in st}
    forste = {r["Stillingskode"] for r in st if r.get("Stillingskategorikode") == "UN1" and FORSTE.search(r.get("Stillingsbenevnelse") or "")}
    postdok = {r["Stillingskode"] for r in st if r.get("Stillingskategorikode") == "UN2" and "postdok" in (r.get("Stillingsbenevnelse") or "").lower()}
    # HK-dirs nevner har bare stipendiater og postdoktorer fra UN2, ikke vitenskapelige assistenter og spesialistkandidater
    # (treffer DBH-rapporten «publiseringspoeng per faglig årsverk» og Tilstandsrapporten eksakt, også BI 2025: 406,50).
    stip = {r["Stillingskode"] for r in st if r.get("Stillingskategorikode") == "UN2" and "stipendiat" in (r.get("Stillingsbenevnelse") or "").lower()}

    raw = {}

    def inst_raw(inst):
        if inst not in raw:
            raw[inst] = {
                "225": dbh(f"225_{inst}.json", q(225, inst, ["Årstall", "Avdelingskode", "Stillingskode"]), a.refresh),
                "123": dbh(f"123_{inst}.json", q(123, inst, ["Årstall", "Avdelingskode"], extra=[{"variabel": "Semester", "selection": {"filter": "item", "values": ["3"]}}]), a.refresh),
                # Kanaltype trengs for institusjonstotalen: se tot_rad() under.
                "373": dbh(f"373_{inst}.json", q(373, inst, ["Årstall", "Avdelingskode", "Kode for type publiseringskanal"]), a.refresh),
                "374": dbh(f"374_{inst}.json", q(374, inst, ["Årstall", "Avdelingskode", "Kvalitetsniva", "Kode for type publiseringskanal"]), a.refresh),
                # 457: navn på organisasjonsenhetene (enheten selv = laveste SSB-kode per avdelingskode)
                "457": dbh(f"457_{inst}.json", q(457, inst, variabler=["Årstall", "Semester", "Avdelingskode", "Avdelingskode_SSB", "Avdelingsnavn"], years=False), a.refresh),
                "210": dbh(f"210_{inst}.json", q(210, inst, variabler=["Institusjonskode", "Avdelingskode", "Fakultetskode", "Fakultetsnavn", "Gyldig fra", "Gyldig til"], years=False), a.refresh),
            }
        return raw[inst]

    def dbh_aar(spec_):
        """spec_: {inst: [...], fakultetskode?: str, avdelinger?: [...], hele?: bool}. Summerer per år."""
        acc = collections.defaultdict(lambda: collections.defaultdict(float))
        for inst in spec_["inst"]:
            r = inst_raw(inst)
            avd_ok = set(spec_.get("avdelinger") or [])
            fk = spec_.get("fakultetskode")
            fak = {x.get("Avdelingskode"): x.get("Fakultetskode") for x in r["210"]}
            hele = spec_.get("hele") or (not avd_ok and not fk)

            def inn(avd):
                if hele:
                    return True
                if avd_ok:
                    return avd in avd_ok or any(avd.startswith(p.rstrip("*")) for p in avd_ok if p.endswith("*"))
                return fak.get(avd) == fk

            for row in r["225"]:
                if not inn(row.get("Avdelingskode") or ""):
                    continue
                y = acc[int(row["Årstall"])]; k = kat.get(row.get("Stillingskode"), ""); aw = fl(row.get("Antall årsverk"))
                y["_225"] = 1; y["arsverk"] += aw
                if k in ("UN1", "UN3", "UN4"):
                    y["faglige"] += aw
                if k == "UN1":
                    y["un1"] += aw
                elif k == "UN2":
                    y["rekruttering"] += aw
                    if row.get("Stillingskode") in postdok:
                        y["postdok"] += aw
                    elif row.get("Stillingskode") in stip:
                        y["stip"] += aw
                if row.get("Stillingskode") in forste:
                    y["forste"] += aw
            for row in r["123"]:
                if inn(row.get("Avdelingskode") or ""):
                    y = acc[int(row["Årstall"])]; y["studenter"] += fl(row.get("Antall totalt")); y["_123"] = 1
            # Institusjonstotalen er avdelingene + publikasjoner registrert direkte på institusjonen (000000 med kjent
            # kanaltype). Radene 000000 med kanaltype 0 er en egen summering som ikke alltid stemmer med HK-dir
            # (BI 2025: 516,9 mot 507,3; avdelingene alene 497,8). Regelen treffer Tilstandsrapportens V15.2.
            avd_aar = {x["Årstall"] for x in r["373"] if (x.get("Avdelingskode") or "000000") != "000000"}

            def tot_rad(row, aar_med_avd):
                avd = row.get("Avdelingskode") or "000000"
                if avd != "000000":
                    return True
                if row["Årstall"] not in aar_med_avd:
                    return True  # år uten avdelingsrader: bare totalen finnes
                return str(row.get("Kode for type publiseringskanal") or "0") != "0"

            # Antall publikasjoner kan ikke summeres over avdelinger (en artikkel med forfattere fra to institutter telles
            # to ganger). For hele institusjonen telles de fra summeringsraden (000000, kanaltype 0), som treffer BIs og
            # NHHs egne tall eksakt. For fagmiljø med flere avdelinger blir antallet litt for høyt (poengene er brøkdelt).
            sumrad_aar = {x["Årstall"] for x in r["373"] if (x.get("Avdelingskode") or "") == "000000" and str(x.get("Kode for type publiseringskanal") or "0") == "0"}
            for row in r["373"]:
                avd = row.get("Avdelingskode") or ""
                if hele and row["Årstall"] in sumrad_aar and avd == "000000" and str(row.get("Kode for type publiseringskanal") or "0") == "0":
                    acc[int(row["Årstall"])]["publikasjoner"] += fl(row.get("Antall publikasjoner"))
                ok = tot_rad(row, avd_aar) if hele else (avd != "000000" and inn(avd))
                if ok:
                    y = acc[int(row["Årstall"])]; y["publPoeng"] += fl(row.get("Publiseringspoeng")); y["_373"] = 1
                    if not (hele and row["Årstall"] in sumrad_aar):
                        y["publikasjoner"] += fl(row.get("Antall publikasjoner"))
            # 374: totalraden 000000 er ufullstendig for noen institusjoner; bruk avdelingene, og totalraden bare
            # for år uten avdelingsrader.
            aar_med_avd = {x["Årstall"] for x in r["374"] if (x.get("Avdelingskode") or "000000") != "000000"}
            for row in r["374"]:
                avd = row.get("Avdelingskode") or ""
                if tot_rad(row, aar_med_avd) if hele else (avd != "000000" and inn(avd)):
                    y = acc[int(row["Årstall"])]; p = fl(row.get("Publiseringspoeng")); y["_p374"] += p
                    y["_fa374"] += fl(row.get("Forfatterandeler")); y["_pub374"] += fl(row.get("Antall publikasjoner"))
                    if str(row.get("Kvalitetsniva")) == "2":
                        y["niva2"] += p; y["niva2fa"] += fl(row.get("Forfatterandeler")); y["niva2pub"] += fl(row.get("Antall publikasjoner"))
        ut = {}
        for yr in sorted(acc):
            v = acc[yr]
            # HK-dirs nevner (Tilstandsrapporten V15.1, DBH-rapporten «faglige stillinger inkl. stipendiater»): UN1 +
            # stipendiater + postdoktorer, uten faglige ledere (UN3), andre undervisningsstillinger (UN4), vitenskapelige
            # assistenter og spesialistkandidater. Treffer DBHs egne tall eksakt (OsloMet og UiS 2020–2025, BI 2025).
            uff = v["un1"] + v["stip"] + v["postdok"]
            ut[str(yr)] = {
                "arsverk": r1(v["arsverk"]) if v["_225"] else None,
                "faglige": r1(v["faglige"]) if v["_225"] else None,
                "rekruttering": r1(v["rekruttering"]) if v["_225"] else None,
                "forsteAndel": r1(100 * v["forste"] / v["faglige"]) if v["_225"] and v["faglige"] else None,
                "studenter": int(v["studenter"]) if v["_123"] else None,
                "publPoeng": r1(v["publPoeng"], 2) if v["_373"] else None,  # to desimaler som DBH
                "publikasjoner": int(v["publikasjoner"]) if v["_373"] else None,
                "uff": r1(uff) if v["_225"] else None,  # UN1 + stipendiater + postdoktorer, HK-dirs nevner
                "utenStip": r1(v["un1"] + v["postdok"]) if v["_225"] else None,  # UN1 + postdoktorer, NHHs nevner
                "poengPerUff": r1(v["publPoeng"] / uff, 2) if v["_373"] and uff else None,
                # NHHs nevner i Research Report (åtte handelshøyskoler): UN1 + postdoktorer, uten stipendiater.
                # Treffer 50 av 53 tall ±2 %.
                "poengPerFaglig": r1(v["publPoeng"] / (v["un1"] + v["postdok"]), 2) if v["_373"] and v["un1"] else None,
                "niva2Andel": r1(100 * v["niva2"] / v["_p374"]) if v["_p374"] else None,
                # Samme andel målt på forfatterandeler (HK-dirs tilstandsrapport) og på publikasjoner, for kontroll
                "niva2AndelFa": r1(100 * v["niva2fa"] / v["_fa374"]) if v["_fa374"] else None,
                "niva2AndelPubl": r1(100 * v["niva2pub"] / v["_pub374"]) if v["_pub374"] else None,
                "studenterPerFaglig": r1(v["studenter"] / v["faglige"]) if v["_123"] and v["faglige"] else None,
            }
        return ut

    # ── NVA-artikler ──
    def dubletter(sid):
        """NVA-id-er som er samme artikkel registrert to ganger (lik tittel og tidsskrift-ISSN innen skolen). Den første
        NVI-rapporterte (ellers første) beholdes. Kontroll 22.10.2026: ca. 16 NVI-artikler, f.eks. samme artikkel i 2024 og 2025."""
        sett, kast = {}, set()
        poster = []
        for f in sorted((RANG / "nva" / sid).glob("*.json")):
            for x in json.loads(f.read_text(encoding="utf-8"))["artikler"]:
                t = re.sub(r"\W+", " ", (x.get("tittel") or "").lower()).strip()
                j = issn(x.get("issn")) or issn(x.get("eissn")) or (x.get("tidsskrift") or "").lower()
                if len(t) >= 25 and j:  # korte titler («Editorial», «Introduction») kan være ulike artikler
                    poster.append(((t, j), not x.get("nvi"), x["id"]))
        for nokkel, ikke_nvi, pid in sorted(poster):
            if nokkel in sett and sett[nokkel] != pid:
                kast.add(pid)
            else:
                sett.setdefault(nokkel, pid)
        return kast

    def artikler(sid):
        per_aar, topp, fag = {}, [], collections.Counter()
        kast = dubletter(sid)
        for f in sorted((RANG / "nva" / sid).glob("*.json")):
            d = json.loads(f.read_text(encoding="utf-8"))
            d["artikler"] = [x for x in d["artikler"] if x["id"] not in kast]
            aar = str(d["aar"])
            s = collections.Counter(); ajg = collections.Counter(); abdc = collections.Counter()
            # Lagdelt forskningsmål: per kombinasjon av norsk nivå, ABDC, FT50/UTD24 og AJG lagres antall artikler
            # og sum forfatterandel (enhetens forfattere / alle forfattere, dvs. 1/n per forfatter). Nettleseren
            # regner «høyeste nivå teller» med valgfrie vekter, tidsvindu og hel/brøk telling ut fra dette.
            komb = collections.defaultdict(lambda: [0, 0.0])
            toppKomb = collections.defaultdict(lambda: [0, 0.0])
            rap = collections.Counter()
            ajgA = collections.Counter()  # AJG-anslag, bare NVI-rapporterte artikler (som kalibreringen)
            # AJG-sammenligningen: per AJG-fagfelt, bare NVI-rapporterte artikler i AJG-tidsskrift:
            # [antall, antall nivå 3+, antall nivå 4/4*, forfatterandel, forfatterandel 3+, forfatterandel 4/4*].
            # Bare aggregater per skole og år; AJG-nivå per tidsskrift går ikke ut.
            ajgFag = collections.defaultdict(lambda: [0, 0, 0, 0.0, 0.0, 0.0])
            for x in d["artikler"]:
                s["n"] += 1
                s["nvi"] += x.get("nvi", False)
                s["intl"] += x.get("intl", False)
                s["andel"] += (x.get("egne") or 0) / max(x.get("forfattere") or 1, 1)
                niva = {"LevelTwo": "2", "LevelOne": "1", "LevelZero": "0"}.get(x.get("niva"), "u")
                s["niva" + niva] += 1
                iss = [i for i in (issn(x.get("issn")), issn(x.get("eissn"))) if i]
                treff = lambda L: next((L[i] for i in iss if L and i in L), None)  # noqa: E731
                tj = treff(lister["ajg"])
                # AJG-nivå: «1»–«4*», «ikke» (ikke på AJG 2024) eller «usjekket» (manuelt oppslag ikke kommet hit ennå)
                ajgv = None
                if lister["ajg"]:
                    ajgv = tj[0] if tj and tj[0] in AJG_NIVAER else "ikke" if tj or not ajg_delvis else "usjekket"
                    ajg[ajgv] += 1
                    if ajgv in AJG_NIVAER and tj[1] and int(aar) >= 2020:
                        fag[tj[1]] += 1
                tb = treff(lister["abdc"])
                abdc[tb[0] if tb else "ikke"] += 1
                ta = treff(lister["ajgA"])
                if x.get("nvi"):
                    ajgA["n"] += 1
                    if ta and ta[0] in ("topp", "3"):
                        ajgA[ta[0]] += 1
                ft = bool(treff(lister["ft50"])); ut = bool(treff(lister["utd24"]))
                s["ft50"] += ft; s["utd24"] += ut
                nvi = bool(x.get("nvi"))
                andel = (x.get("egne") or 0) / max(x.get("forfattere") or 1, 1)
                # Femte felt: «v» = rapportert til NVI (samme grunnlag som HK-dir/DBH teller), «x» = ikke rapportert
                nokkel = "|".join([niva, tb[0] if tb else "-", ("fu" if ft and ut else "f" if ft else "u" if ut else "-"),
                                   ((ajgv if ajgv in AJG_NIVAER else "?" if ajgv == "usjekket" else "-") if lister["ajg"] else "?"), "v" if nvi else "x"])
                k = komb[nokkel]; k[0] += 1; k[1] += andel
                # Slik skolene rapporterer: hel telling, bare NVI-rapporterte artikler
                if nvi:
                    rap["nvi"] += 1; rap["intl"] += x.get("intl", False)
                    rap["ft50"] += ft; rap["utd24"] += ut; rap["ftUtd"] += ft or ut
                    rap["ft50gml"] += bool(treff(lister["ft50gml"]))
                    if tb:
                        rap["abdc" + tb[0]] += 1
                    if ajgv in AJG_NIVAER:
                        rap["ajg" + ajgv] += 1
                        if tj[1]:
                            fg = ajgFag[tj[1]]; hoy = ajgv in ("3", "4", "4*"); topp4 = ajgv in ("4", "4*")
                            fg[0] += 1; fg[1] += hoy; fg[2] += topp4
                            fg[3] += andel; fg[4] += andel * hoy; fg[5] += andel * topp4
                    elif ajgv == "usjekket":
                        rap["ajgUsjekket"] += 1
                    if ta and ta[0] in ("topp", "3"):
                        rap["ajgA" + ta[0]] += 1
                    rap["niva" + niva] += 1
                # Hva som gir Topp-trinnet: FT50 (F), UTD24 (U), ABDC A* (A), AJG 4/4* (J); norsk nivå etter «|»
                fl_ = ("F" if ft else "-") + ("U" if ut else "-") + ("A" if tb and tb[0] == "A*" else "-") + ("J" if ajgv in ("4", "4*") else "-")
                if fl_ != "----":
                    tk = toppKomb[fl_ + "|" + niva + "|" + ("v" if nvi else "x")]; tk[0] += 1; tk[1] += andel
                if ft or ut or ajgv in ("4", "4*") or (tb and tb[0] == "A*"):
                    topp.append({"aar": int(aar), "tittel": x.get("tittel"), "tidsskrift": x.get("tidsskrift"),
                                 "ajg": ajgv if ajgv in AJG_NIVAER else None, "abdc": tb[0] if tb else None, "ft50": ft, "utd24": ut,
                                 "niva": niva, "nvi": bool(x.get("nvi"))})
            per_aar[aar] = {"n": s["n"], "nvi": s["nvi"], "intlAndel": r1(100 * s["intl"] / s["n"]) if s["n"] else None,
                            "forfatterandel": r1(s["andel"]),
                            "niva": {k: s["niva" + k] for k in ("0", "1", "2", "u")},
                            "ajg": dict(ajg) if lister["ajg"] else None, "abdc": dict(abdc),
                            "ft50": s["ft50"], "utd24": s["utd24"],
                            "komb": {kk: [v[0], round(v[1], 4)] for kk, v in sorted(komb.items())},
                            "ajgA": {"topp": ajgA["topp"], "3": ajgA["3"], "nvi": ajgA["n"]},
                            "toppKomb": {kk: [v[0], round(v[1], 4)] for kk, v in sorted(toppKomb.items())},
                            "ajgFag": {kk: v[:3] + [round(z, 4) for z in v[3:]] for kk, v in sorted(ajgFag.items())} if lister["ajg"] else None,
                            "rapport": {k: v for k, v in sorted(rap.items())} | {"harAjg": bool(lister["ajg"])}}
        topp.sort(key=lambda t: (-t["aar"], t["tidsskrift"] or ""))
        return per_aar, topp, dict(fag)

    # ── HH NMBUs egne artikler med AJG-nivå (fanen «HH NMBU etter AJG») ──
    # Bare HH NMBU, bare når AJG-lista finnes (avtalen med Chartered ABS). Kompakt: tidsskriftene én gang
    # (navn, AJG-nivå, AJG-fagfelt, ISSN), artiklene som rader med indeks til tidsskriftet. Ingen forfatternavn (lagres ikke).
    # Forsvinner når ajg2024.csv slettes og det bygges på nytt, og fanen skjules da.
    HH_FELT = ["id", "aar", "tittel", "tidsskrift", "niva", "nvi", "egne", "forfattere", "intl", "fwci", "topp10"]

    # Siteringsmål (OpenAlex) for alle enheter: aggregater per år; for HH NMBU også FWCI og topp 10 % per NVA-id (til HH-lista)
    sitering, sit_art = sitering_mod.lag([s["id"] for s in skoler], "nmbu")
    if sitering:
        t = collections.Counter()
        for x in sitering["treff"].values():
            t.update(x)
        print(f"Siteringer (OpenAlex): {t['m']} av {t['n']} NVA-artikler funnet ({100 * t['m'] / max(t['n'], 1):.1f} %, "
              f"{t['mT']} på tittel), NVI {100 * t['nviM'] / max(t['nvi'], 1):.1f} %; {len(sitering['norden'])} nordiske enheter")
    else:
        print("Siteringer (OpenAlex): cache mangler, feltet `sitering` blir null (kjør scripts/rangering/hent_openalex.py).")

    def hh_liste(sid):
        if not lister["ajg"]:
            return None
        tids, tix, rader = [], {}, []
        for f in sorted((RANG / "nva" / sid).glob("*.json")):
            d = json.loads(f.read_text(encoding="utf-8"))
            if not (Y0 <= int(d["aar"]) <= Y1):
                continue
            for x in d["artikler"]:
                iss = [i for i in (issn(x.get("issn")), issn(x.get("eissn"))) if i]
                tj = next((lister["ajg"][i] for i in iss if i in lister["ajg"]), None)
                # «4*»–«1», None = ikke på AJG 2024, «?» = usjekket (delvis liste fylt inn for hånd)
                nivaa = tj[0] if tj and tj[0] in AJG_NIVAER else None if (tj or not ajg_delvis) else "?"
                fagf = tj[1] if tj and nivaa in AJG_NIVAER else None
                navn = (x.get("tidsskrift") or "").strip() or "(uten tidsskrift)"
                nok = (x.get("kanal") or navn.lower(), nivaa, fagf)
                if nok not in tix:
                    tix[nok] = len(tids)
                    tids.append([navn, nivaa, fagf, x.get("issn") or x.get("eissn") or None])
                niva = {"LevelTwo": "2", "LevelOne": "1", "LevelZero": "0"}.get(x.get("niva"), "")
                fw, t10 = sit_art.get(x.get("id"), (None, None))  # OpenAlex: FWCI og topp 10 % (None = ikke funnet/ingen verdi)
                rader.append([x.get("id"), int(d["aar"]), x.get("tittel") or "", tix[nok], niva, int(bool(x.get("nvi"))),
                              int(x.get("egne") or 0), int(x.get("forfattere") or 0), int(bool(x.get("intl"))), fw, t10])
        rader.sort(key=lambda r: (-r[1], r[2]))
        print(f"HH-liste ({sid}): {len(rader)} artikler, {len(tids)} tidsskrift, "
              f"{sum(1 for t in tids if t[1] in AJG_NIVAER)} på AJG 2024")
        return {"skole": sid, "felt": HH_FELT, "tidsskrift": tids, "artikler": rader, "ajgDelvis": ajg_delvis,
                "nvaUrl": "https://nva.sikt.no/registration/",
                "merknad": "Artikler (AcademicArticle og AcademicLiteratureReview) med minst én forfatter tilknyttet NVA-enhet "
                           "192.11.0.0 Handelshøyskolen ved NMBU (inkludert underenheten 192.11.1.0 Skatteforsk), "
                           f"{Y0}–{Y1}, koblet på ISSN/eISSN mot AJG 2024 for alle år."}

    # ── Utdanning (gjenbruk av HH-sammenligningene) ──
    adm = json.loads((APPDATA / "hhAdmissionData.json").read_text(encoding="utf-8"))
    comp = json.loads((APPDATA / "hhCompletionData.json").read_text(encoding="utf-8"))
    sb_txt = (APPDATA / "hhStudiebarometerData.ts").read_text(encoding="utf-8")
    sb = {}
    for m in re.finditer(r'entryId: "([^"]+)",\s*groupId: "([^"]+)".*?respondents: (\w+),.*?scores: \{[^}]*helhetsvurdering: ([\d.]+|null)', sb_txt, re.S):
        sb[m.group(1)] = {"respondenter": None if m.group(3) == "null" else int(m.group(3)),
                          "helhet": None if m.group(4) == "null" else float(m.group(4))}

    # Opptaksgrense til toårig master i økonomi og administrasjon (siviløkonom): karaktersnitt fra bachelor, lokalt
    # opptak, fra HH-oversikten (MASTER_ADMISSION i masterThesisData.ts). Siste år per skole.
    ms_txt = (APPDATA / "masterThesisData.ts").read_text(encoding="utf-8")
    ms_blokk = ms_txt[ms_txt.index("MASTER_ADMISSION"):ms_txt.index("};", ms_txt.index("MASTER_ADMISSION"))]
    siv = {}
    for m in re.finditer(r"^\s{2}(\w+): \[\s*\{([^}]*)\}", ms_blokk, re.M):
        felt = m.group(2)
        g = re.search(r"grade: ([\d.]+)", felt); y = re.search(r"year: '(\d{4})'", felt)
        n = re.search(r"note: '([^']*)'", felt); u = re.search(r"url: '([^']*)'", felt)
        k = re.search(r"kind: '(\w+)'", felt)
        # type: grense (reell grense i siste opptak), minstekrav, alle (alle kvalifiserte inn) eller anslag. Bare grenser
        # brukes i rangeringen (kontroll 22.10.2026: BI og UiT oppga minstekrav, INN «alle», Nord og Kristiania uten kilde).
        siv[m.group(1)] = {"aar": int(y.group(1)) if y else None, "grense": float(g.group(1)) if g else None,
                           "type": k.group(1) if k else ("anslag" if "estimated: true" in felt else "grense"),
                           "estimert": "estimated: true" in felt, "merknad": n.group(1) if n else None, "url": u.group(1) if u else None}
    print("Siviløkonom-grenser:", {k: v["grense"] for k, v in siv.items()})

    def utdanning(prefikser):
        def mine(eid):
            return any(eid == p or eid.startswith(p + "_") for p in prefikser)
        NORMERT_KULL = 2022  # samme startkull for alle, så andelene kan sammenlignes
        ut = {}
        for gid in ("oa", "moa"):
            g = next((x for x in adm["groups"] if x["id"] == gid), None)
            if not g:
                continue
            # Bare riktig nivå: ØA-gruppen inneholder også femårige siviløkonomprogram (type master5), som skal ut.
            niva = "bachelor" if gid == "oa" else "master2"
            ent = [e for e in g["entries"] if mine(e["id"]) and (e.get("type") or g.get("level")) == niva]
            if not ent:
                continue
            aar = "2026" if any(e["years"].get("2026") for e in ent) else "2025"
            ys = [e["years"].get(aar) or {} for e in ent]
            plasser = sum((y.get("plasser") or 0) for y in ys); fv = sum((y.get("fvS") or 0) for y in ys)
            pg = [y.get("pg_ord") for y in ys if y.get("pg_ord")]
            # Studiebarometeret vektet med antall respondenter (programmer uten nok svar er ikke med)
            sbv = [(sb[e["id"]]["helhet"], sb[e["id"]]["respondenter"] or 1) for e in ent if e["id"] in sb and sb[e["id"]]["helhet"] is not None]
            ider = {e["id"] for e in ent}
            cg = next((x for x in comp["groups"] if x["id"] == gid), None)
            norm = []
            for p in (cg or {}).get("programs", []):
                if p["entryId"] in ider:
                    k = [k for k in p.get("kull", []) if k.get("aar") == NORMERT_KULL and k.get("startkull") and k.get("fullfortNormert") is not None]
                    if k:
                        norm.append((k[0]["fullfortNormert"], k[0]["startkull"], k[0]["aar"]))
            ut[gid] = {
                "aar": int(aar), "program": len(ent), "plasser": plasser or None, "forstevalg": fv or None,
                "fvPerPlass": r1(fv / plasser, 2) if plasser else None,
                "poenggrenseMaks": max(pg) if pg else None, "poenggrenseMin": min(pg) if pg else None,
                "studiebarometer": r1(sum(v * w for v, w in sbv) / sum(w for _, w in sbv), 2) if sbv else None,
                "studiebarometerResp": sum(w for _, w in sbv) if sbv else None,
                "entryIds": sorted(ider),
                "normertTid": r1(100 * sum(n for n, _, _ in norm) / sum(s for _, s, _ in norm)) if norm else None,
                "normertKull": max(a_ for _, _, a_ in norm) if norm else None,
            }
        return ut

    f = RANG / "ajg-nhh-rapport.json"  # scripts/rangering/nhh_abs_tabeller.py
    ajg_nhh = json.loads(f.read_text(encoding="utf-8")) if f.exists() else None

    # ── Sett sammen ──
    ut_skoler = []
    for s in skoler:
        sid = s["id"]
        d = s.get("dbh") or {}
        inst_koder = d.get("inst") if isinstance(d.get("inst"), list) else re.findall(r"\d{4}", str(d.get("inst") or d.get("institusjonskode") or ""))
        avd = [x for x in (d.get("avdelinger") or d.get("avdelingskoder") or []) if re.fullmatch(r"\d{6}\*?", str(x))]
        hele = bool(d.get("hele")) or any("alle" in str(x) for x in (d.get("avdelingskoder") or []))
        spec_ = {"inst": inst_koder, "fakultetskode": None if avd or hele else d.get("fakultetskode"), "avdelinger": avd, "hele": hele}
        aar = dbh_aar(spec_) if spec_["inst"] else {}
        # Hele institusjonen, for kontroll mot årsrapporter som oppgir institusjonstall
        inst_aar = dbh_aar({"inst": spec_["inst"], "hele": True}) if spec_["inst"] else {}
        per_aar, topp, fag = artikler(sid)
        # Navn på avdelingene som er med, til «Slik er tallene regnet ut» i Publisering
        navn = {}
        for i in spec_["inst"]:
            for x in sorted(inst_raw(i)["457"], key=lambda x: (x.get("Årstall") or "", x.get("Semester") or "", "".join(chr(0x10FFFF - ord(c)) for c in x.get("Avdelingskode_SSB") or ""))):
                if x.get("Avdelingskode") in set(avd) and x.get("Avdelingsnavn"):
                    navn[x["Avdelingskode"]] = x["Avdelingsnavn"]  # siste år vinner; innen året laveste SSB-kode (sortert sist)
        spec_["avdelingNavn"] = navn
        spec_["merknad"] = d.get("merknad")
        ut_skoler.append({
            "id": sid, "navn": s.get("navn"), "navnEn": s.get("navnEn"), "kort": s.get("kort") or KORT.get(sid) or s.get("navn"),
            "institusjon": s.get("institusjon"), "isNmbu": sid.startswith("nmbu") or sid == "hh", "type": s.get("type"),
            "ren": bool(s.get("ren_handelshoyskole")), "referanse": bool(s.get("referanse")),
            # Bare faktiske akkrediteringer (AACSB-medlemskap o.l. teller ikke)
            "akkreditering": [x for x in (s.get("akkreditering") or s.get("akkrediteringer") or [])
                              if isinstance(x, str) or "ikke" not in str(x.get("status", "")).lower()],
            "rangeringer": s.get("rangeringer") or s.get("internasjonale_rangeringer") or [],
            "enhetNotat": s.get("usikkerhet"), "kontrollUlikAvgrensning": s.get("kontrollUlikAvgrensning"), "dbhEnhet": spec_, "nva": s.get("nva"),
            "dbh": aar, "dbhInst": inst_aar, "artikler": per_aar, "topp": [x for x in topp if x["aar"] >= Y1 - 5][:600], "ajgFagfelt": fag,
            "utdanning": {**utdanning(s.get("programprefiks") or [sid.split("_")[0] if sid in ("ntnu_ok", "ntnu_hh") else sid]),
                          "siv": siv.get(sid.split("_")[0] if sid in ("ntnu_ok", "ntnu_hh") else sid)},
            # Variant av en annen enhet (ntnu_hh = bare NTNU Handelshøyskolen); vises bare der den velges i stedet for hovedenheten
            "variantAv": s.get("variantAv"),
            # ABS/AJG 4*, 4 og 3 fra NHHs forskningsrapport (åtte skoler, 2020–2024), til vi har lov å koble mot lista
            "ajgNhh": (ajg_nhh or {}).get("skoler", {}).get(sid),
        })
        sist = aar.get("2024") or {}
        print(f"  {sid:12s} poeng/UFF 2024 {sist.get('poengPerUff')}  artikler 2024 {per_aar.get('2024', {}).get('n')}  utd {list(ut_skoler[-1]['utdanning'])}")

    kontroll = lag_kontroll(ut_skoler)
    norden = les_norden({s["id"] for s in ut_skoler})
    data = {"versjon": 1, "generert": dt.date.today().isoformat(), "aar": [Y0, Y1], "kontroll": kontroll, "norden": norden,
            "ajgNhh": {k: v for k, v in (ajg_nhh or {}).items() if k != "skoler"} or None,
            "lister": {**{k: bool(v) for k, v in lister.items()}, "ajgDelvis": ajg_delvis}, "skoler": ut_skoler,
            # HH NMBUs egne artikler med AJG-nivå (bare når AJG-lista finnes; kryptert som resten)
            "hhAjg": hh_liste("nmbu"),
            # Fagfeltprofilen: AJG-lista per fagfelt og internasjonale handelshøyskoler (OpenAlex), bare aggregater
            "ajgProfil": lag_ajg_profil(lister),
            # Foreløpige tall for inneværende år (fanen «2026 foreløpig»), med forrige år på samme registreringsdato
            "forelopig": lag_forelopig(skoler, lister),
            # Siteringsmål fra OpenAlex (fanen «Siteringer» og kartet): bare aggregater per enhet og år
            "sitering": sitering,
            # Skandinavia-sammenligningen (fanen «Skandinavia»): OpenAlex + AJG per enhet og år i alle land, bare aggregater
            "skandinavia": skandinavia_mod.lag_skandinavia(ut_skoler, lister.get("ajg"), (Y0, Y1))}
    if a.klartekst:
        KLAR.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"Skrev {KLAR.relative_to(ROOT)} (klartekst, gitignored).")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(krypter(data, a.testpassord or passord())), encoding="utf-8")
    # Samme data til nettstedet med bare rangeringen (VITE_KUN_RANGERING=1), med eget passord
    OUT_DELT.write_text(json.dumps(krypter(data, a.testpassord or passord("RANGERING_PASSORD"))), encoding="utf-8")
    print(f"Skrev {OUT_DELT.relative_to(ROOT)} (kryptert med {'TESTPASSORD' if a.testpassord else 'RANGERING_PASSORD'}).")
    print(f"Skrev {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} kB, kryptert{', MED TESTPASSORD: bygg på nytt uten --testpassord før commit' if a.testpassord else ''}).")


if __name__ == "__main__":
    main()
