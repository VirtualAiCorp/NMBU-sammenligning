#!/usr/bin/env python3
"""Vitenskapelige artikler for danske handelshøyskoler og økonomimiljøer fra universitetenes Pure-systemer (OAI-PMH).

Kilde: det åpne OAI-PMH-endepunktet til hvert universitets Pure (uten nøkkel og innlogging), formatet DDF-MXD
(Den Danske Forskningsdatabase sitt utvekslingsformat, som Pure fortsatt leverer):
  <oai>?verb=ListRecords&metadataPrefix=ddf-mxd&set=publications:year<år>
  <oai>?verb=ListRecords&resumptionToken=<token>          (100 poster per side)
Settet publications:year<år> følger Pure sitt publiseringsår (trykt utgave). Attributtet doc_year i posten kan være
tidligere (første publisering på nett); det lagres som aarPure.

Enhetene og OAI-adressene leses fra data/rangering/norden/pure-enheter.json. Hele universitetsåret må høstes for å
filtrere på enhet, så skriptet gjør det i to trinn:
  1. Høsting: råsvarene lagres komprimert i data/rangering/pure/raa/<univ>/<år>/side-NNNNN.xml.gz, med tilstand.json
     (neste resumptionToken). Et avbrutt år fortsetter der det slapp; avviser serveren tokenet, startes året på nytt.
     Ett kall om gangen per server, med pause mellom kallene. Universitetene høstes i parallell (ulike servere).
  2. Bygging: for hver enhet og hvert år skrives data/rangering/pure/<enhet>/<år>.json i samme artikkelformat som
     NVA-filene (scripts/fetch-nva-artikler.py): id, tittel, type, tidsskrift, kanal, issn, eissn, niva, nvi,
     forfattere, egne, intl. I tillegg doi, aarPure (doc_year) og nivaaDk (doc_level: sci/pop).

Utvalg: tidsskriftartikler (dja → AcademicArticle) og oversiktsartikler (djr → AcademicLiteratureReview) med
doc_review = pr (fagfellevurdert). Merk at pr er selvregistrert i Pure og ikke kontrollert nasjonalt som NVI (den
danske indikatoren BFI ble nedlagt i 2021). Derfor er nvi alltid false.

Feltene:
  forfattere  total_authors (alle forfattere), ellers antall forfattere i posten
  egne        antall forfattere (pers_role pau) med minst én tilknytning (aff_no) som treffer enheten
  intl        true hvis minst én tilknyttet organisasjon har land ulik DK; null hvis en ekstern organisasjon mangler
              land eller en forfatter mangler tilknytning (og ingen utenlandsk er funnet); ellers false
  niva        norsk kanalnivå (LevelOne/LevelTwo/LevelZero) slått opp på ISSN i de lokale NVA-filene
              (data/rangering/nva/*/*.json): samme år hvis mulig, ellers nærmeste år. null hvis ingen norsk
              institusjon har publisert i tidsskriftet (dekningen er derfor ufullstendig). kanal = NVA-kanal-ID.
Ingen personnavn lagres; råfilene inneholder dem, men ligger i en gitignorert mappe.

Bruk:
  python3 scripts/rangering/fetch-pure-oai.py [--aar 2021-2025] [--univ cbs,au] [--refresh]
  python3 scripts/rangering/fetch-pure-oai.py --bare-bygg          # bygg enhetsfilene på nytt fra råsvarene
  python3 scripts/rangering/fetch-pure-oai.py --vis-enheter --univ sdu   # enhetsnavn per år (for omorganiseringer)
  python3 scripts/rangering/fetch-pure-oai.py --bare-bygg --tell    # aggregerte AJG-tall hvis ajg2024.csv finnes lokalt
"""
import argparse
import collections
import gzip
import json
import re
import shutil
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RANG = ROOT / "data" / "rangering"
KONFIG = RANG / "norden" / "pure-enheter.json"
UT = RANG / "pure"
RAA = UT / "raa"
NVA = RANG / "nva"
AJG = RANG / "tidsskrift" / "ajg2024.csv"

UA = "NMBU-sammenligning (studierådgiverne HH)"
OAI = "{http://www.openarchives.org/OAI/2.0/}"
M = "{http://mx.forskningsdatabasen.dk/ns/documents/1.4}"
XL = "{http://www.w3.org/XML/1998/namespace}lang"
TYPER = {"dja": "AcademicArticle", "djr": "AcademicLiteratureReview"}
skrivelaas = threading.Lock()


def logg(*a):
    with skrivelaas:
        print(time.strftime("%H:%M:%S"), *a, flush=True)


def les_aar(s):
    ut = set()
    for del_ in s.split(","):
        if "-" in del_:
            a, b = del_.split("-")
            ut.update(range(int(a), int(b) + 1))
        elif del_:
            ut.add(int(del_))
    return sorted(ut)


def norm_issn(v):
    s = re.sub(r"[^0-9Xx]", "", v or "").upper()
    return f"{s[:4]}-{s[4:]}" if len(s) == 8 else None


# ---------------------------------------------------------------- 1. Høsting

def hent(url, pause):
    """Ett kall med gjentak og økende ventetid. Respekterer Retry-After ved 429/503."""
    vent = [10, 30, 60, 120, 300, 600]
    for i, v in enumerate(vent + [None]):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/xml"})
            with urllib.request.urlopen(req, timeout=180) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if v is None:
                raise
            ra = e.headers.get("Retry-After") if e.headers else None
            v = int(ra) if ra and ra.isdigit() else v
            logg(f"    HTTP {e.code}, prøver igjen om {v} s")
        except Exception as e:  # noqa: BLE001
            if v is None:
                raise
            logg(f"    feil ({e.__class__.__name__}: {e}), prøver igjen om {v} s")
        time.sleep(v)


def hoest_aar(univ, oai, aar, pause, refresh):
    mappe = RAA / univ / str(aar)
    tf = mappe / "tilstand.json"
    if refresh and mappe.exists():
        shutil.rmtree(mappe)
    mappe.mkdir(parents=True, exist_ok=True)
    t = json.loads(tf.read_text()) if tf.exists() else {}
    if t.get("ferdig"):
        return t
    if not t or not t.get("neste"):  # ny start
        for f in mappe.glob("side-*.xml.gz"):
            f.unlink()
        t = {"univ": univ, "aar": aar, "oai": oai, "sider": 0, "poster": 0, "neste": None, "ferdig": False,
             "start": time.strftime("%Y-%m-%dT%H:%M:%S"), "sekunder": 0}
        url = f"{oai}?verb=ListRecords&metadataPrefix=ddf-mxd&set=publications:year{aar}"
    else:
        logg(f"  {univ} {aar}: fortsetter etter side {t['sider']}")
        url = f"{oai}?verb=ListRecords&resumptionToken={urllib.parse.quote(t['neste'], safe='')}"
    t0 = time.time()
    while url:
        x = hent(url, pause)
        root = ET.fromstring(x)
        feil = root.find(OAI + "error")
        if feil is not None:
            kode = feil.get("code")
            if kode == "noRecordsMatch":
                t.update(neste=None, ferdig=True)
                break
            if kode == "badResumptionToken" and t["sider"]:
                logg(f"  {univ} {aar}: serveren avviste tokenet, starter året på nytt")
                tf.unlink(missing_ok=True)
                return hoest_aar(univ, oai, aar, pause, False)
            raise RuntimeError(f"{univ} {aar}: OAI-feil {kode}: {feil.text}")
        n = sum(1 for _ in root.iter(OAI + "record"))
        t["sider"] += 1
        t["poster"] += n
        with gzip.open(mappe / f"side-{t['sider']:05d}.xml.gz", "wb", compresslevel=6) as f:
            f.write(x)
        tok = root.find(f".//{OAI}resumptionToken")
        if tok is not None and tok.get("completeListSize"):
            t["storrelse"] = int(tok.get("completeListSize"))
        t["neste"] = tok.text.strip() if tok is not None and tok.text and tok.text.strip() else None
        t["ferdig"] = t["neste"] is None
        t["sekunder"] = round(t.get("sekunder", 0) + (time.time() - t0))
        t0 = time.time()
        if t["ferdig"]:
            t["slutt"] = time.strftime("%Y-%m-%dT%H:%M:%S")
        tf.write_text(json.dumps(t, ensure_ascii=False, indent=1))
        if t["sider"] % 20 == 0:
            logg(f"  {univ} {aar}: {t['poster']} av {t.get('storrelse', '?')} poster")
        url = None if t["ferdig"] else f"{oai}?verb=ListRecords&resumptionToken={urllib.parse.quote(t['neste'], safe='')}"
        if url:
            time.sleep(pause)
    t["ferdig"] = True
    tf.write_text(json.dumps(t, ensure_ascii=False, indent=1))
    return t


def hoest_univ(univ, oai, aarliste, pause, refresh):
    for aar in aarliste:
        t = hoest_aar(univ, oai, aar, pause, refresh)
        logg(f"  {univ} {aar}: ferdig, {t['poster']} poster på {t['sider']} sider, {t.get('sekunder', 0) // 60} min")


# ---------------------------------------------------------------- 2. Lesing av råsvar

def navn_paa_nivaa(org):
    """{nivå: {navn i begge språk (små bokstaver)}} og visningsnavn (engelsk hvis mulig)."""
    niv = collections.defaultdict(set)
    vis = {}
    for nm in org.findall(M + "name"):
        lang = nm.get(XL)
        for k in range(1, 6):
            v = (nm.findtext(f"{M}level{k}") or "").strip()
            if v:
                niv[k].add(v.casefold())
                if lang == "en" or k not in vis:
                    vis[k] = v
    return niv, vis


def poster(univ, aar):
    """Gir (rec_id, ddf_doc) for alle poster i høstingen, uten duplikater."""
    mappe = RAA / univ / str(aar)
    sett = set()
    for f in sorted(mappe.glob("side-*.xml.gz")):
        with gzip.open(f, "rb") as fh:
            root = ET.fromstring(fh.read())
        for rec in root.iter(OAI + "record"):
            h = rec.find(OAI + "header")
            if h is not None and h.get("status") == "deleted":
                continue
            d = rec.find(f".//{M}ddf_doc")
            if d is None:
                continue
            rid = d.get("rec_id") or (h.findtext(OAI + "identifier") if h is not None else None)
            if rid in sett:
                continue
            sett.add(rid)
            yield rid, d


def treffer(niv, regel, egne):
    if not (niv.get(1, set()) & egne):
        return False
    k = regel["niva"]
    if not (niv.get(k, set()) & regel["navn_cf"]):
        return False
    if regel.get("forelder_cf") and not (niv.get(k - 1, set()) & regel["forelder_cf"]):
        return False
    return True


class Kanalnivaa:
    """Norsk kanalnivå per ISSN fra de lokale NVA-filene."""

    def __init__(self):
        self.m = collections.defaultdict(dict)  # issn -> {år: (niva, kanal, navn)}
        for f in NVA.glob("*/*.json"):
            try:
                d = json.loads(f.read_text(encoding="utf-8"))
            except Exception:  # noqa: BLE001
                continue
            aar = d.get("aar")
            for a in d.get("artikler", []):
                if a.get("niva") not in ("LevelOne", "LevelTwo", "LevelZero"):
                    continue
                for i in (a.get("issn"), a.get("eissn")):
                    i = norm_issn(i)
                    if i:
                        self.m[i][aar] = (a["niva"], a.get("kanal"))

    def slaa_opp(self, issner, aar):
        best = None
        for i in issner:
            for a, v in self.m.get(i, {}).items():
                avst = abs((a or aar) - aar)
                if best is None or avst < best[0]:
                    best = (avst, v)
        return best[1] if best else (None, None)


def les_post(d):
    """Felles uttrekk fra en ddf_doc (uten personnavn)."""
    tittel = ""
    o = d.find(f"{M}title/{M}original")
    if o is not None:
        tittel = (o.findtext(M + "main") or "").strip()
    j = d.find(f"{M}publication/{M}in_journal")
    issn = eissn = None
    tidsskrift = doi = None
    if j is not None:
        tidsskrift = (j.findtext(M + "title") or "").strip() or None
        doi = (j.findtext(M + "doi") or "").strip() or None
        for e in j.findall(M + "issn"):
            v = norm_issn(e.text)
            if not v:
                continue
            if e.get("type") == "ele" and not eissn:
                eissn = v
            elif not issn:
                issn = v
            elif not eissn and v != issn:
                eissn = v
    orgs = {}
    for org in d.findall(M + "organisation"):
        niv, vis = navn_paa_nivaa(org)
        ids = [i.text for i in org.findall(M + "id") if i.get("id_type") == "loc_org" and i.text]
        land = (org.findtext(M + "country") or "").strip().lower() or None
        for a in (org.get("aff_no") or "").split():
            orgs[a] = {"niv": niv, "vis": vis, "land": land, "locOrg": ids}
    pers = []
    andre_aff = set()
    for p in d.findall(M + "person"):
        aff = (p.get("aff_no") or "").split()
        if p.get("pers_role") == "pau":
            pers.append(aff)
        else:
            andre_aff.update(aff)
    return {"tittel": tittel, "tidsskrift": tidsskrift, "doi": doi, "issn": issn, "eissn": eissn,
            "orgs": orgs, "pers": pers, "andre_aff": andre_aff}


def bygg_univ(univ, ucfg, enheter, aarliste, kanal, ajg=None):
    egne_navn = {n.casefold() for n in ucfg["egneNavn"]}
    for e in enheter:
        for r in e["treff"]:
            r["navn_cf"] = {n.casefold() for n in r["navn"]}
            r["forelder_cf"] = {n.casefold() for n in r.get("forelder", [])}
    resultat = {}
    for aar in aarliste:
        tf = RAA / univ / str(aar) / "tilstand.json"
        if not tf.exists() or not json.loads(tf.read_text()).get("ferdig"):
            logg(f"  {univ} {aar}: høstingen er ikke ferdig, hopper over byggingen")
            continue
        tilst = json.loads(tf.read_text())
        ut = {e["id"]: [] for e in enheter}
        lok = {e["id"]: collections.Counter() for e in enheter}
        treffnavn = {e["id"]: collections.Counter() for e in enheter}
        stat = {"poster": 0, "artikler_pr": 0}
        for rid, d in poster(univ, aar):
            stat["poster"] += 1
            if d.get("doc_type") not in TYPER or d.get("doc_review") != "pr":
                continue
            stat["artikler_pr"] += 1
            p = les_post(d)
            # utenlandsk medforfatter
            intl = False
            ukjent = any(not aff for aff in p["pers"])
            for o in p["orgs"].values():
                intern = bool(o["niv"].get(1, set()) & egne_navn)
                if o["land"] and o["land"] != "dk":
                    intl = True
                elif not intern and not o["land"]:
                    ukjent = True
            if not intl and ukjent:
                intl = None
            try:
                forfattere = int(d.get("total_authors"))
            except (TypeError, ValueError):
                forfattere = len(p["pers"])
            forfattere = max(forfattere, len(p["pers"]))
            niva = kanalid = None
            issner = [i for i in (p["issn"], p["eissn"]) if i]
            if issner:
                niva, kanalid = kanal.slaa_opp(issner, aar)
            for e in enheter:
                mine = {a for a, o in p["orgs"].items() if any(treffer(o["niv"], r, egne_navn) for r in e["treff"])}
                if not mine:
                    continue
                egne = sum(1 for aff in p["pers"] if set(aff) & mine)
                # Organisasjon uten kobling til noen forfatter (sjelden): tell artikkelen, men med egne = 0.
                if egne == 0 and mine & p["andre_aff"]:
                    continue
                k = max(r["niva"] for r in e["treff"])
                for a in mine:
                    lok[e["id"]].update(p["orgs"][a]["locOrg"])
                # antall artikler per treffende enhetsnavn (for å se omorganiseringer over tid)
                treffnavn[e["id"]].update({p["orgs"][a]["vis"].get(k) or p["orgs"][a]["vis"].get(1, "?") for a in mine})
                ut[e["id"]].append({
                    "id": rid,
                    "tittel": p["tittel"][:300],
                    "type": TYPER[d.get("doc_type")],
                    "tidsskrift": p["tidsskrift"],
                    "kanal": kanalid,
                    "issn": p["issn"],
                    "eissn": p["eissn"],
                    "niva": niva,
                    "nvi": False,
                    "forfattere": forfattere,
                    "egne": egne,
                    "intl": intl,
                    "doi": p["doi"],
                    "aarPure": int(d.get("doc_year")) if (d.get("doc_year") or "").isdigit() else None,
                    "nivaaDk": d.get("doc_level"),
                })
        for e in enheter:
            f = UT / e["id"] / f"{aar}.json"
            f.parent.mkdir(parents=True, exist_ok=True)
            art = ut[e["id"]]
            f.write_text(json.dumps({
                "skole": e["id"], "kilde": "pure-oai-ddf-mxd", "univ": univ, "oai": ucfg["oai"],
                "enheter": e["treff"] and [{"niva": r["niva"], "navn": r["navn"], **({"forelder": r["forelder"]} if r.get("forelder") else {})} for r in e["treff"]],
                "aar": aar, "hentet": (tilst.get("slutt") or tilst.get("start") or "")[:10],
                "treffNavn": dict(treffnavn[e["id"]].most_common()),
                "locOrg": sorted(lok[e["id"]]),
                "merknad": "nvi er alltid false: fagfellevurdering (pr) er selvregistrert i Pure og ikke kontrollert nasjonalt. niva er norsk kanalnivå fra lokale NVA-filer (ufullstendig dekning).",
                "artikler": art,
            }, ensure_ascii=False))
            resultat[(e["id"], aar)] = art
            n_niva = sum(1 for a in art if a["niva"])
            n_intl = sum(1 for a in art if a["intl"])
            n_intl_ukjent = sum(1 for a in art if a["intl"] is None)
            logg(f"  {e['id']} {aar}: {len(art)} artikler (norsk nivå {n_niva}, intl {n_intl}, intl ukjent {n_intl_ukjent})")
    return resultat


def vis_enheter(univ, ucfg, aarliste):
    egne_navn = {n.casefold() for n in ucfg["egneNavn"]}
    k = ucfg.get("instituttNiva", 3)
    for aar in aarliste:
        c = collections.Counter()
        for rid, d in poster(univ, aar):
            if d.get("doc_type") not in TYPER or d.get("doc_review") != "pr":
                continue
            sett = set()
            for org in d.findall(M + "organisation"):
                niv, vis = navn_paa_nivaa(org)
                if not (niv.get(1, set()) & egne_navn):
                    continue
                sett.add(" > ".join(vis.get(i, "") for i in range(2, k + 1)))
            c.update(sett)
        print(f"== {univ} {aar}")
        for n, v in sorted(c.items(), key=lambda x: (-x[1], x[0])):
            print(f"  {v:5d}  {n}")


def tell(resultat):
    """Aggregerte tall mot lokal AJG 2024 (lisensbelagt fil; bare summer skrives ut)."""
    import csv
    if not AJG.exists():
        print("Fant ikke", AJG, "– hopper over AJG-tellingen")
        return
    ajg = {}
    for r in csv.DictReader(open(AJG, encoding="utf-8")):
        for i in (r.get("issn"), r.get("eissn")):
            i = norm_issn(i)
            if i and r.get("ajg2024"):
                ajg[i] = r["ajg2024"].strip()
    print("enhet\tår\tartikler\tajg4*\tajg4/4*\tajg3+\tnorsk nivå 2\tintl")
    for (eid, aar), art in sorted(resultat.items()):
        c = collections.Counter()
        for a in art:
            g = next((ajg[i] for i in (a["issn"], a["eissn"]) if i and i in ajg), None)
            c["4*"] += g == "4*"
            c["4p"] += g in ("4*", "4")
            c["3p"] += g in ("4*", "4", "3")
            c["n2"] += a["niva"] == "LevelTwo"
            c["intl"] += bool(a["intl"])
        print(f"{eid}\t{aar}\t{len(art)}\t{c['4*']}\t{c['4p']}\t{c['3p']}\t{c['n2']}\t{c['intl']}")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--aar", default="2021-2025", help="år, f.eks. 2021-2025 eller 2023,2024")
    ap.add_argument("--univ", help="universiteter, f.eks. cbs,au (standard: alle i konfigurasjonen)")
    ap.add_argument("--refresh", action="store_true", help="høst på nytt selv om råsvarene finnes")
    ap.add_argument("--pause", type=float, default=1.0, help="sekunder mellom kall mot samme server")
    ap.add_argument("--bare-bygg", action="store_true", help="ikke høst, bare bygg enhetsfilene fra råsvarene")
    ap.add_argument("--vis-enheter", action="store_true", help="list enhetsnavn i Pure per år (ingen filer skrives)")
    ap.add_argument("--tell", action="store_true", help="skriv ut aggregerte AJG-tall (krever lokal ajg2024.csv)")
    a = ap.parse_args()
    cfg = json.loads(KONFIG.read_text(encoding="utf-8"))
    aarliste = les_aar(a.aar)
    rekkefolge = ["cbs", "au", "ku", "sdu", "aau", "ruc"]
    univer = [u.strip() for u in a.univ.split(",")] if a.univ else [u for u in rekkefolge if u in cfg["universiteter"]]
    for u in univer:
        if u not in cfg["universiteter"]:
            sys.exit(f"Ukjent universitet: {u}")

    if a.vis_enheter:
        for u in univer:
            vis_enheter(u, cfg["universiteter"][u], aarliste)
        return

    if not a.bare_bygg:
        logg(f"Høster {', '.join(univer)} for {aarliste[0]}–{aarliste[-1]} (pause {a.pause} s)")
        with ThreadPoolExecutor(len(univer)) as ex:
            fut = [ex.submit(hoest_univ, u, cfg["universiteter"][u]["oai"], aarliste, a.pause, a.refresh) for u in univer]
            for f in fut:
                f.result()

    kanal = Kanalnivaa()
    logg(f"Norsk kanalnivå: {len(kanal.m)} ISSN fra lokale NVA-filer")
    resultat = {}
    for u in univer:
        enh = [e for e in cfg["enheter"] if e["univ"] == u]
        resultat.update(bygg_univ(u, cfg["universiteter"][u], enh, aarliste, kanal))
    if a.tell:
        tell(resultat)


if __name__ == "__main__":
    main()
