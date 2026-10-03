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
KLAR = RANG / "rangering-klartekst.json"
ENV = ROOT / "kilde" / ".env.local"
ITER = 310_000
Y0, Y1 = 2016, 2025

spec = importlib.util.spec_from_file_location("blc", ROOT / "scripts" / "build-landsam-courses.py")
blc = importlib.util.module_from_spec(spec); spec.loader.exec_module(blc)
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


def passord():
    for line in ENV.read_text(encoding="utf-8").splitlines() if ENV.exists() else []:
        if line.startswith("INTERN_PASSORD="):
            return line.split("=", 1)[1].strip()
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
    return ut


KORT = {"nhh": "NHH", "bi": "BI", "nmbu": "HH NMBU", "uis": "UiS", "uia": "UiA", "nord": "Nord", "ntnu": "NTNU",
        "uit": "UiT", "usn": "USN", "inn": "INN", "oslomet": "OsloMet", "himolde": "HiMolde", "hvl": "HVL",
        "kristiania": "Kristiania", "hiof": "HiØ", "ntnu_ok": "NTNU ØK (hele)", "uib_okon": "UiB økonomi", "uio_okon": "UiO økonomi"}
AJG_NIVAER = ["1", "2", "3", "4", "4*"]
ABDC_NIVAER = ["C", "B", "A", "A*"]


# ── Kontroll mot eksterne, publiserte tall ──────────────────────────────────
KONTROLL = RANG / "kontroll" / "eksterne-tall.json"
# Eksternt mål → (felt i DBH-årsdata, desimaler for sammenligning)
ALIAS = {"hh": "nmbu"}
MAAL = {"publiseringspoeng": "publPoeng", "poeng_per_faglig": "poengPerFaglig", "poeng_per_uff": "poengPerUff",
        "publikasjoner": "publikasjoner", "niva2_andel": "niva2Andel"}


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
        "utd24": les_liste("utd24.csv", None),
    }
    print("Tidsskriftlister:", {k: (len(v) if v else "mangler") for k, v in lister.items()})

    # ── DBH ──
    st = blc.fetch_dbh({"tabell_id": 220, "api_versjon": 1, "statuslinje": "J", "kodetekst": "J", "desimal_separator": ".",
                        "variabler": ["Stillingskode", "Stillingsbenevnelse", "Stillingskategorikode"],
                        "filter": [{"variabel": "Stillingskode", "selection": {"filter": "all", "values": ["*"]}}]},
                       CACHE / "220_stillingskoder.json", a.refresh)
    kat = {r["Stillingskode"]: r.get("Stillingskategorikode") or "" for r in st}
    forste = {r["Stillingskode"] for r in st if r.get("Stillingskategorikode") == "UN1" and FORSTE.search(r.get("Stillingsbenevnelse") or "")}
    postdok = {r["Stillingskode"] for r in st if r.get("Stillingskategorikode") == "UN2" and "postdok" in (r.get("Stillingsbenevnelse") or "").lower()}

    raw = {}

    def inst_raw(inst):
        if inst not in raw:
            raw[inst] = {
                "225": dbh(f"225_{inst}.json", q(225, inst, ["Årstall", "Avdelingskode", "Stillingskode"]), a.refresh),
                "123": dbh(f"123_{inst}.json", q(123, inst, ["Årstall", "Avdelingskode"], extra=[{"variabel": "Semester", "selection": {"filter": "item", "values": ["3"]}}]), a.refresh),
                "373": dbh(f"373_{inst}.json", q(373, inst, ["Årstall", "Avdelingskode"]), a.refresh),
                "374": dbh(f"374_{inst}.json", q(374, inst, ["Årstall", "Avdelingskode", "Kvalitetsniva"]), a.refresh),
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
                if row.get("Stillingskode") in forste:
                    y["forste"] += aw
            for row in r["123"]:
                if inn(row.get("Avdelingskode") or ""):
                    y = acc[int(row["Årstall"])]; y["studenter"] += fl(row.get("Antall totalt")); y["_123"] = 1
            har_total = any(x.get("Avdelingskode") == "000000" for x in r["373"])
            for row in r["373"]:
                avd = row.get("Avdelingskode") or ""
                ok = (avd == "000000") if (hele and har_total) else (avd != "000000" and inn(avd))
                if ok:
                    y = acc[int(row["Årstall"])]; y["publPoeng"] += fl(row.get("Publiseringspoeng")); y["publikasjoner"] += fl(row.get("Antall publikasjoner")); y["_373"] = 1
            # 374: totalraden 000000 er ufullstendig for noen institusjoner; bruk avdelingene, og totalraden bare
            # for år uten avdelingsrader.
            aar_med_avd = {x["Årstall"] for x in r["374"] if (x.get("Avdelingskode") or "000000") != "000000"}
            for row in r["374"]:
                avd = row.get("Avdelingskode") or ""
                if ((avd != "000000") if aar_med_avd and row["Årstall"] in aar_med_avd else True) if hele else (avd != "000000" and inn(avd)):
                    y = acc[int(row["Årstall"])]; p = fl(row.get("Publiseringspoeng")); y["_p374"] += p
                    y["_fa374"] += fl(row.get("Forfatterandeler")); y["_pub374"] += fl(row.get("Antall publikasjoner"))
                    if str(row.get("Kvalitetsniva")) == "2":
                        y["niva2"] += p; y["niva2fa"] += fl(row.get("Forfatterandeler")); y["niva2pub"] += fl(row.get("Antall publikasjoner"))
        ut = {}
        for yr in sorted(acc):
            v = acc[yr]
            # HK-dirs nevner (Tilstandsrapporten V15.1): UN1 faglige stillinger + UN2 rekrutteringsstillinger,
            # uten faglige ledere (UN3) og andre undervisningsstillinger (UN4). Treffer 36 av 39 institusjonstall ±2 %.
            uff = v["un1"] + v["rekruttering"]
            ut[str(yr)] = {
                "arsverk": r1(v["arsverk"]) if v["_225"] else None,
                "faglige": r1(v["faglige"]) if v["_225"] else None,
                "rekruttering": r1(v["rekruttering"]) if v["_225"] else None,
                "forsteAndel": r1(100 * v["forste"] / v["faglige"]) if v["_225"] and v["faglige"] else None,
                "studenter": int(v["studenter"]) if v["_123"] else None,
                "publPoeng": r1(v["publPoeng"]) if v["_373"] else None,
                "publikasjoner": int(v["publikasjoner"]) if v["_373"] else None,
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
    def artikler(sid):
        per_aar, topp, fag = {}, [], collections.Counter()
        for f in sorted((RANG / "nva" / sid).glob("*.json")):
            d = json.loads(f.read_text(encoding="utf-8"))
            aar = str(d["aar"])
            s = collections.Counter(); ajg = collections.Counter(); abdc = collections.Counter()
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
                if lister["ajg"]:
                    ajg[tj[0] if tj else "ikke"] += 1
                    if tj and tj[1] and int(aar) >= 2020:
                        fag[tj[1]] += 1
                tb = treff(lister["abdc"])
                abdc[tb[0] if tb else "ikke"] += 1
                ft = bool(treff(lister["ft50"])); ut = bool(treff(lister["utd24"]))
                s["ft50"] += ft; s["utd24"] += ut
                if ft or ut or (tj and tj[0] in ("4", "4*")) or (tb and tb[0] == "A*"):
                    topp.append({"aar": int(aar), "tittel": x.get("tittel"), "tidsskrift": x.get("tidsskrift"),
                                 "ajg": tj[0] if tj else None, "abdc": tb[0] if tb else None, "ft50": ft, "utd24": ut,
                                 "niva": niva})
            per_aar[aar] = {"n": s["n"], "nvi": s["nvi"], "intlAndel": r1(100 * s["intl"] / s["n"]) if s["n"] else None,
                            "forfatterandel": r1(s["andel"]),
                            "niva": {k: s["niva" + k] for k in ("0", "1", "2", "u")},
                            "ajg": dict(ajg) if lister["ajg"] else None, "abdc": dict(abdc),
                            "ft50": s["ft50"], "utd24": s["utd24"]}
        topp.sort(key=lambda t: (-t["aar"], t["tidsskrift"] or ""))
        return per_aar, topp, dict(fag)

    # ── Utdanning (gjenbruk av HH-sammenligningene) ──
    adm = json.loads((APPDATA / "hhAdmissionData.json").read_text(encoding="utf-8"))
    comp = json.loads((APPDATA / "hhCompletionData.json").read_text(encoding="utf-8"))
    sb_txt = (APPDATA / "hhStudiebarometerData.ts").read_text(encoding="utf-8")
    sb = {}
    for m in re.finditer(r'entryId: "([^"]+)",\s*groupId: "([^"]+)".*?respondents: (\w+),.*?scores: \{[^}]*helhetsvurdering: ([\d.]+|null)', sb_txt, re.S):
        sb[m.group(1)] = {"respondenter": None if m.group(3) == "null" else int(m.group(3)),
                          "helhet": None if m.group(4) == "null" else float(m.group(4))}

    def utdanning(prefikser):
        def mine(eid):
            return any(eid == p or eid.startswith(p + "_") for p in prefikser)
        ut = {}
        for gid in ("oa", "moa"):
            g = next((x for x in adm["groups"] if x["id"] == gid), None)
            if not g:
                continue
            ent = [e for e in g["entries"] if mine(e["id"])]
            if not ent:
                continue
            aar = "2026" if any(e["years"].get("2026") for e in ent) else "2025"
            ys = [e["years"].get(aar) or {} for e in ent]
            plasser = sum((y.get("plasser") or 0) for y in ys); fv = sum((y.get("fvS") or 0) for y in ys)
            pg = [y.get("pg_ord") for y in ys if y.get("pg_ord")]
            sbv = [sb[e["id"]]["helhet"] for e in ent if e["id"] in sb and sb[e["id"]]["helhet"] is not None]
            cg = next((x for x in comp["groups"] if x["id"] == gid), None)
            norm = []
            for p in (cg or {}).get("programs", []):
                if mine(p["entryId"]):
                    k = [k for k in p.get("kull", []) if k.get("startkull") and k.get("fullfortNormert") is not None]
                    if k:
                        sist = k[-1]; norm.append((sist["fullfortNormert"], sist["startkull"], sist["aar"]))
            ut[gid] = {
                "aar": int(aar), "program": len(ent), "plasser": plasser or None, "forstevalg": fv or None,
                "fvPerPlass": r1(fv / plasser, 2) if plasser else None,
                "poenggrenseMaks": max(pg) if pg else None, "poenggrenseMin": min(pg) if pg else None,
                "studiebarometer": r1(sum(sbv) / len(sbv), 2) if sbv else None,
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
        ut_skoler.append({
            "id": sid, "navn": s.get("navn"), "navnEn": s.get("navnEn"), "kort": s.get("kort") or KORT.get(sid) or s.get("navn"),
            "institusjon": s.get("institusjon"), "isNmbu": sid.startswith("nmbu") or sid == "hh", "type": s.get("type"),
            "ren": bool(s.get("ren_handelshoyskole")), "referanse": bool(s.get("referanse")),
            # Bare faktiske akkrediteringer (AACSB-medlemskap o.l. teller ikke)
            "akkreditering": [x for x in (s.get("akkreditering") or s.get("akkrediteringer") or [])
                              if isinstance(x, str) or "ikke" not in str(x.get("status", "")).lower()],
            "rangeringer": s.get("rangeringer") or s.get("internasjonale_rangeringer") or [],
            "enhetNotat": s.get("usikkerhet"), "kontrollUlikAvgrensning": s.get("kontrollUlikAvgrensning"), "dbhEnhet": spec_, "nva": s.get("nva"),
            "dbh": aar, "dbhInst": inst_aar, "artikler": per_aar, "topp": [x for x in topp if x["aar"] >= Y1 - 5][:150], "ajgFagfelt": fag,
            "utdanning": utdanning(s.get("programprefiks") or [sid.split("_")[0] if sid == "ntnu_ok" else sid]),
            # ABS/AJG 4*, 4 og 3 fra NHHs forskningsrapport (åtte skoler, 2020–2024), til vi har lov å koble mot lista
            "ajgNhh": (ajg_nhh or {}).get("skoler", {}).get(sid),
        })
        sist = aar.get("2024") or {}
        print(f"  {sid:12s} poeng/UFF 2024 {sist.get('poengPerUff')}  artikler 2024 {per_aar.get('2024', {}).get('n')}  utd {list(ut_skoler[-1]['utdanning'])}")

    kontroll = lag_kontroll(ut_skoler)
    data = {"versjon": 1, "generert": dt.date.today().isoformat(), "aar": [Y0, Y1], "kontroll": kontroll,
            "ajgNhh": {k: v for k, v in (ajg_nhh or {}).items() if k != "skoler"} or None,
            "lister": {k: bool(v) for k, v in lister.items()}, "skoler": ut_skoler}
    if a.klartekst:
        KLAR.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"Skrev {KLAR.relative_to(ROOT)} (klartekst, gitignored).")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(krypter(data, a.testpassord or passord())), encoding="utf-8")
    print(f"Skrev {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} kB, kryptert{', MED TESTPASSORD: bygg på nytt uten --testpassord før commit' if a.testpassord else ''}).")


if __name__ == "__main__":
    main()
