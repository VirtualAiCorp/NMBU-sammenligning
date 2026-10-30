#!/usr/bin/env python3
"""Data til nettstedet «AJG-Analyse HH» (ajg-analyse-hh.pages.dev): samfunnsøkonomi mot andre fagområder i AJG 2024.

Svarer på fire spørsmål fra en kollega (manuskript, 29.10.2026):
  1. fordelingen samfunnsøkonomi (AJG-feltet ECON) mot andre fagområder ved norske handelshøyskoler,
  2. trenden 2016–2025, 3. sammenligning med typiske og topp-skoler i Europa og verden,
  4. AJG-nivået i hvert fagområde (er samfunnsøkonomi bare mer kvantitet, eller også høyere nivå?),
og gjør samme nivåsjekk for alle 22 AJG-fagfelt. I tillegg kontroll av AJG-lista, tidsskriftoversikt og HH NMBUs artikler.

Kilder (allerede hentet av rangeringsskriptene): NVA (data/rangering/nva, NVI-rapporterte), OpenAlex
(data/rangering/openalex: hh-profil, ajg-kilder, ajg-volum) og AJG 2024 (tidsskrift/ajg2024.csv, lisensbelagt, gitignored).
Utdata kryptert med AJG_PASSORD (kilde/.env.local, lages første gang) til kilde/public/ajg-data.json; den inneholder AJG-nivå
per tidsskrift og skal aldri ligge ukryptert i repoet.

Bruk:  /usr/local/bin/python3 scripts/rangering/ajg_analyse.py [--klartekst sti.json] [--testpassord test]
"""
import argparse
import base64
import collections as C
import csv
import datetime
import json
import math
import os
import re
import secrets
import statistics
from pathlib import Path

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ROOT = Path(__file__).resolve().parents[2]
RANG = ROOT / "data" / "rangering"
ENV = ROOT / "kilde" / ".env.local"
UT = ROOT / "kilde" / "public" / "ajg-data.json"
ITER = 310_000
AAR = range(2016, 2026)
P = (2021, 2025)  # hovedperioden
PER = list(range(P[0], P[1] + 1))
NIV = ["1", "2", "3", "4", "4*"]
POENG = {"1": 1, "2": 2, "3": 3, "4": 4, "4*": 5}
NORGE = ["nhh", "bi", "nmbu", "uis", "uia", "nord", "ntnu", "uit", "usn", "inn", "oslomet", "himolde", "hvl", "kristiania", "hiof"]
REF = ["ntnu_hh", "uib_okon", "uio_okon"]
KORT = {"nhh": "NHH", "bi": "BI", "nmbu": "HH NMBU", "uis": "UiS", "uia": "UiA", "nord": "Nord", "ntnu": "NTNU", "uit": "UiT",
        "usn": "USN", "inn": "INN", "oslomet": "OsloMet", "himolde": "HiMolde", "hvl": "HVL", "kristiania": "Kristiania", "hiof": "HiØ",
        "ntnu_hh": "NTNU HH uten samf.øk./IØT", "uib_okon": "UiB økonomi (ref.)", "uio_okon": "UiO økonomi (ref.)"}
# Robusthet: samfunnsøkonomi i vid forstand
BRED = {"ECON", "BUS HIST & ECON HIST", "REGIONAL STUDIES, PLANNING AND ENVIRONMENT"}
# Offentlige tall om AJG 2024 til kontrollen (Chartered ABS 30.10.2024; CBS Library 13.12.2024)
OFFISIELT = {"n": 1822, "nye": 163, "nye4s": 4, "nye4": 6, "fjernet": 58,
             "kilder": ["https://charteredabs.org/insights/news/academic-journal-guide-2024-available-now",
                        "https://libguides.cbs.dk/newsletter/5426/The-2024-Edition-of-the-AJG-List-is-Now-Out",
                        "https://assets.charteredabs.org/ajg-2024-methodology.pdf"]}
# Table 3 i metodedokumentet (https://assets.charteredabs.org/ajg-2024-methodology.pdf): AJG 2024 per fagfelt, nivå 4 (inkl. 4*), 3, 2, 1
TABELL3 = {
    "ACCOUNT": (6, 22, 34, 27), "BUS HIST & ECON HIST": (3, 4, 14, 8), "ECON": (27, 67, 117, 144), "ENT-SBM": (3, 6, 10, 17),
    "FINANCE": (8, 32, 39, 47), "ETHICS-CSR-MAN": (8, 13, 30, 60), "HRM&EMP": (5, 9, 26, 18), "INFO MAN": (8, 11, 36, 48),
    "INNOV": (2, 5, 13, 23), "IB&AREA": (2, 9, 16, 29), "MDEV&EDU": (1, 2, 21, 33), "MKT": (8, 12, 19, 39), "OPS&TECH": (4, 9, 9, 52),
    "OR&MANSCI": (5, 22, 23, 27), "ORG STUD": (5, 6, 13, 14), "PSYCH (GENERAL)": (13, 19, 14, 26), "PSYCH (WOP-OB)": (8, 13, 17, 29),
    "PUB SEC": (5, 11, 28, 27), "REGIONAL STUDIES, PLANNING AND ENVIRONMENT": (3, 9, 9, 11), "SECTOR": (5, 10, 36, 57),
    "SOC SCI": (13, 30, 34, 38), "STRAT": (3, 2, 7, 15),
}
# Stikkprøve slått opp i AJG-portalen (innlogget, minst 70 s mellom oppslagene); lisensbelagt, gitignored
STIKKPROVE = RANG / "tidsskrift" / "ajg-stikkprove.csv"
STIKKPROVE_DATO = "2026-10-30"

GRUPPER = {
    "topp_verden": ("Verdenstoppen", "UTD Top 100 plass 1–25", lambda s: "verden" in (s.get("topp") or [])),
    "topp_europa": ("Europatoppen", "europeiske skoler på UTD Top 100", lambda s: "europa" in (s.get("topp") or [])),
    "europa": ("Europa, alle", "alle europeiske skoler i referansesettet (uten Norge)", lambda s: s["gruppe"] in ("norden", "vest", "sentral", "sor")),
    "usa": ("USA", "amerikanske handelshøyskoler", lambda s: s["gruppe"] == "usa"),
    "norden": ("Norden utenom Norge", "CBS, SSE og Hanken", lambda s: s["gruppe"] == "norden"),
    "kontroll": ("Kontroll: NHH og BI i OpenAlex", "samme skoler målt i OpenAlex i stedet for NVA", lambda s: s["gruppe"] == "kontroll"),
}


def issn(s):
    s = re.sub(r"[^0-9Xx]", "", str(s or "")).upper()
    return f"{s[:4]}-{s[4:]}" if len(s) == 8 else None


def passord():
    for line in ENV.read_text(encoding="utf-8").splitlines() if ENV.exists() else []:
        if line.startswith("AJG_PASSORD="):
            return line.split("=", 1)[1].strip()
    pw = "ajg-" + secrets.token_urlsafe(12)
    with open(ENV, "a", encoding="utf-8") as fh:
        fh.write(f"\n# Passord for ajg-analyse-hh.pages.dev, laget av scripts/rangering/ajg_analyse.py\nAJG_PASSORD={pw}\n")
    print(f"Laget nytt AJG_PASSORD i {ENV.relative_to(ROOT)}.")
    return pw


def krypter(obj, pw):
    salt, iv = os.urandom(16), os.urandom(12)
    key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITER).derive(pw.encode("utf-8"))
    ct = AESGCM(key).encrypt(iv, json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8"), None)
    return {"v": 1, "alg": "AES-256-GCM/PBKDF2-SHA256", "iter": ITER, "salt": base64.b64encode(salt).decode(),
            "iv": base64.b64encode(iv).decode(), "data": base64.b64encode(ct).decode()}


def rangering_med_ajg_passord(pw):
    """Siden «Rangeringen» i AJG-Analyse HH: samme data som hh-rangering (kilde/public/rangering-data.json, RANGERING_PASSORD),
    kryptert på nytt med AJG-passordet til kilde/public/ajg-rangering.json. Kjøres etter build-rangering.py og ved passordbytte."""
    kilde = ROOT / "kilde/public/rangering-data.json"
    rpw = next((l.split("=", 1)[1].strip() for l in ENV.read_text(encoding="utf-8").splitlines() if l.startswith("RANGERING_PASSORD=")), None)
    if not (kilde.exists() and rpw):
        print("Rangeringen ble ikke tatt med (mangler rangering-data.json eller RANGERING_PASSORD).")
        return
    e = json.loads(kilde.read_text())
    b = base64.b64decode
    nokkel = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=b(e["salt"]), iterations=e["iter"]).derive(rpw.encode("utf-8"))
    rangering = json.loads(AESGCM(nokkel).decrypt(b(e["iv"]), b(e["data"]), None))
    ut = ROOT / "kilde/public/ajg-rangering.json"
    ut.write_text(json.dumps(krypter(rangering, pw)))
    print(f"Rangeringen → {ut.relative_to(ROOT)} ({ut.stat().st_size // 1024} kB, kryptert med AJG-passordet)")


def r(v, d=6):
    return None if v is None else round(v, d)


# ── AJG-lista ──
rader, ajg = [], {}
with open(RANG / "tidsskrift/ajg2024.csv", encoding="utf-8-sig", newline="") as f:
    for i, rr in enumerate(csv.DictReader(f)):
        rader.append(rr)
        for x in (issn(rr["issn"]), issn(rr["eissn"])):
            if x:
                ajg.setdefault(x, i)
with open(RANG / "tidsskrift/alias.csv", encoding="utf-8-sig", newline="") as f:
    for rr in csv.DictReader(f):
        a, l = issn(rr["alias_issn"]), issn(rr["liste_issn"])
        if a and l in ajg:
            ajg.setdefault(a, ajg[l])
FELT = sorted({rr["fagfelt"] for rr in rader})

# ── Verdensgrunnlaget: artikler i hvert felts AJG-tidsskrift per år (OpenAlex), nivågruppe 1–2 / 3 / 4 og 4* ──
verden = {}
for fg, gr in json.loads((RANG / "openalex/ajg-volum.json").read_text()).items():
    for y in AAR:
        a = [gr.get(g, {}).get(str(y), 0) for g in ("12", "3", "4")]
        verden[(fg, y)] = [sum(a), a[1] + a[2], a[2]]


def forventet(felt, aarliste, k):
    t = sum(verden[(felt, y)][0] for y in aarliste)
    return sum(verden[(felt, y)][k] for y in aarliste) / t if t else 0


# ── Artikler: (nva-id, år, tidsskrift-indeks, forfatterandel) ──
def nva(sid):
    ut, alle = [], []
    for y in AAR:
        for x in json.loads((RANG / "nva" / sid / f"{y}.json").read_text())["artikler"]:
            if not x.get("nvi"):
                continue
            t = next((ajg[i] for i in (issn(x.get("issn")), issn(x.get("eissn"))) if i in ajg), None)
            alle.append((y, x, t))
            if t is not None:
                ut.append((x["id"], y, t, (x.get("egne") or 0) / max(x.get("forfattere") or 1, 1)))
    return ut, alle


kilde_til = {}
for i, kid in json.loads((RANG / "openalex/ajg-kilder.json").read_text()).items():
    if i in ajg:
        kilde_til.setdefault(kid, ajg[i])
oppsett = json.loads((RANG / "openalex/hh-internasjonalt.json").read_text())


def openalex(sid):
    ut = []
    for f in sorted((RANG / "openalex/hh-profil" / sid).glob("*.json")):
        d = json.loads(f.read_text())
        for kid, n in d["kilder"].items():
            if kid in kilde_til:
                ut += [(None, d["aar"], kilde_til[kid], 1.0)] * n
    return ut


felt_av = lambda x: rader[x[2]]["fagfelt"]  # noqa: E731
niva_av = lambda x: rader[x[2]]["ajg2024"]  # noqa: E731


def wilson(k, n, z=1.96):
    if not n:
        return None
    p = k / n; d = 1 + z * z / n; m = (p + z * z / (2 * n)) / d; h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return [r(m - h), r(m + h)]


def ztest(k1, n1, k2, n2):
    if not n1 or not n2:
        return None
    p = (k1 + k2) / (n1 + n2); se = math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2))
    return r(math.erfc(abs((k1 / n1 - k2 / n2) / se) / math.sqrt(2)), 6) if se else None


def maal(art, aarliste):
    """Nivåmål for en gruppe artikler: fordeling 1–4*, andel 3+ og 4/4* med Wilson-intervall, snitt (4*=5) og
    feltjustert indeks (observert / forventet gitt artiklenes felt og år i verden)."""
    a = [x for x in art if x[1] in aarliste]
    n = len(a)
    if not n:
        return {"n": 0}
    c = C.Counter(niva_av(x) for x in a)
    k3 = c["3"] + c["4"] + c["4*"]; k4 = c["4"] + c["4*"]
    e3 = sum(forventet(felt_av(x), aarliste, 1) for x in a) / n; e4 = sum(forventet(felt_av(x), aarliste, 2) for x in a) / n
    return {"n": n, "brok": r(sum(x[3] for x in a), 2), "niva": {k: c[k] for k in NIV}, "k3": k3, "k4": k4,
            "a3": r(k3 / n), "a4": r(k4 / n), "ci3": wilson(k3, n), "ci4": wilson(k4, n), "snitt": r(sum(POENG[niva_av(x)] for x in a) / n, 3),
            "e3": r(e3), "e4": r(e4), "i3": r(k3 / n / e3, 3) if e3 else None, "i4": r(k4 / n / e4, 3) if e4 else None}


def profil(art):
    a = [x for x in art if x[1] in PER]
    eco = [x for x in a if felt_av(x) == "ECON"]; rest = [x for x in a if felt_av(x) != "ECON"]
    me, mr = maal(eco, PER), maal(rest, PER)
    n = len(a); brok = sum(x[3] for x in a)
    ut = {"n": n, "econ": len(eco), "andelEcon": r(len(eco) / n) if n else None,
          "andelEconBrok": r(sum(x[3] for x in eco) / brok) if brok else None,
          "andelBred": r(sum(1 for x in a if felt_av(x) in BRED) / n) if n else None,
          "felt": dict(C.Counter(felt_av(x) for x in a)), "econM": me, "restM": mr, "alle": maal(a, PER)}
    if me.get("n") and mr.get("n"):
        ut["p3"] = ztest(me["k3"], me["n"], mr["k3"], mr["n"]); ut["p4"] = ztest(me["k4"], me["n"], mr["k4"], mr["n"])
    return ut


def trend(art):
    ut = {}
    for y in AAR:
        a = [x for x in art if x[1] == y]
        eco = [x for x in a if felt_av(x) == "ECON"]; rest = [x for x in a if felt_av(x) != "ECON"]
        me, mr = maal(eco, [y]), maal(rest, [y])
        ut[str(y)] = {"n": len(a), "econ": len(eco), "andel": r(len(eco) / len(a)) if a else None,
                      "a4e": me.get("a4"), "a4r": mr.get("a4"), "a3e": me.get("a3"), "a3r": mr.get("a3"), "i4e": me.get("i4"), "i4r": mr.get("i4")}
    return ut


def feltsjekk(art):
    """Samme nivåsjekk for hvert AJG-fagfelt: feltet mot resten av enheten."""
    a = [x for x in art if x[1] in PER]
    ut = {}
    for fg in FELT:
        inn = [x for x in a if felt_av(x) == fg]; rest = [x for x in a if felt_av(x) != fg]
        m, rr = maal(inn, PER), maal(rest, PER)
        if m.get("n"):
            m |= {"p3": ztest(m["k3"], m["n"], rr["k3"], rr["n"]), "p4": ztest(m["k4"], m["n"], rr["k4"], rr["n"]),
                  "rest3": rr.get("a3"), "rest4": rr.get("a4")}
            ut[fg] = m
    return ut


def unik(lister):
    sett = {}
    for art in lister:
        for x in art:
            sett.setdefault(x[0], x)  # samme NVA-publikasjon ved flere skoler telles én gang
    return list(sett.values())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--klartekst", help="skriv også ukryptert JSON hit (for kontroll; aldri i repoet)")
    ap.add_argument("--testpassord", help="krypter med dette passordet i stedet for AJG_PASSORD (lokal test; bygg på nytt uten før commit)")
    a = ap.parse_args()

    norske, alle_nva = {}, {}
    for s in NORGE + REF:
        norske[s], alle_nva[s] = nva(s)
    samlet = unik(norske[s] for s in NORGE)
    uten = unik(norske[s] for s in NORGE if s not in ("nhh", "bi"))
    intl = {s["id"]: openalex(s["id"]) for s in oppsett["skoler"]}
    intl = {k: v for k, v in intl.items() if v}
    grp = {g: [x for s in oppsett["skoler"] if f(s) and s["id"] in intl for x in intl[s["id"]]] for g, (_, _, f) in GRUPPER.items()}
    grp_ids = {g: [s["id"] for s in oppsett["skoler"] if f(s) and s["id"] in intl] for g, (_, _, f) in GRUPPER.items()}

    enheter = {"norge": {"kort": "Norge samlet", "navn": "15 norske handelshøyskoler, hver publikasjon én gang", "type": "samlet", **profil(samlet)},
               "utenNhhBi": {"kort": "Norge uten NHH og BI", "navn": "13 norske handelshøyskoler", "type": "samlet", **profil(uten)}}
    for s in NORGE:
        enheter[s] = {"kort": KORT[s], "type": "norge", **profil(norske[s])}
    for s in REF:
        enheter[s] = {"kort": KORT[s], "type": "ref", **profil(norske[s])}
    intl_prof = {s["id"]: profil(intl[s["id"]]) for s in oppsett["skoler"] if s["id"] in intl}
    for g, (kort, navn, _) in GRUPPER.items():
        andeler = [intl_prof[i]["andelEcon"] for i in grp_ids[g] if intl_prof[i]["n"] >= 30]
        enheter[g] = {"kort": kort, "navn": navn, "type": "gruppe", "antall": len(grp_ids[g]), "median": r(statistics.median(andeler)) if andeler else None,
                      "skoler": [next(s["kort"] for s in oppsett["skoler"] if s["id"] == i) for i in grp_ids[g]], **profil(grp[g])}
    andeler = [enheter[s]["andelEcon"] for s in NORGE if enheter[s]["n"] >= 30]
    enheter["norge"]["median"] = r(statistics.median(andeler))

    trender = {"norge": trend(samlet), "utenNhhBi": trend(uten), **{s: trend(norske[s]) for s in NORGE + REF}, **{g: trend(grp[g]) for g in GRUPPER}}
    trender["verden"] = {}
    for y in AAR:
        tot = sum(verden[(fg, y)][0] for fg in FELT if (fg, y) in verden)
        trender["verden"][str(y)] = {"n": tot, "econ": verden[("ECON", y)][0], "andel": r(verden[("ECON", y)][0] / tot)}

    # Tidsskriftoversikt: AJG-tidsskrift med minst én artikkel fra Norge eller toppskolene i hovedperioden
    per_skole = C.defaultdict(C.Counter); norge_ids = C.defaultdict(set)
    for s in NORGE:
        for x in norske[s]:
            if x[1] in PER:
                per_skole[x[2]][s] += 1; norge_ids[x[2]].add(x[0])
    topp = {g: C.Counter(x[2] for x in grp[g] if x[1] in PER) for g in ("topp_europa", "topp_verden")}
    med = set(norge_ids) | set(topp["topp_europa"]) | set(topp["topp_verden"])
    tidsskrift = []
    for t in sorted(med, key=lambda t: (rader[t]["fagfelt"], NIV[::-1].index(rader[t]["ajg2024"]), -len(norge_ids.get(t, ())), rader[t]["tittel"])):
        rr = rader[t]
        tidsskrift.append([rr["tittel"], rr["issn"], rr["eissn"], rr["fagfelt"], rr["ajg2024"], rr["ajg2021"] or None, len(norge_ids.get(t, ())),
                           [per_skole[t][s] for s in NORGE], topp["topp_europa"][t], topp["topp_verden"][t]])

    niva_no = {"LevelTwo": "2", "LevelOne": "1", "LevelZero": "0"}
    hh = [[y, x.get("tittel"), x.get("tidsskrift"), rader[t]["fagfelt"] if t is not None else None, rader[t]["ajg2024"] if t is not None else None,
           niva_no.get(x.get("niva"), ""), x.get("forfattere"), x.get("egne")]
          for y, x, t in sorted(alle_nva["nmbu"], key=lambda z: (-z[0], z[1].get("tidsskrift") or "")) if y in PER]

    liste = {"n": len(rader), "niva": {k: sum(1 for rr in rader if rr["ajg2024"] == k) for k in NIV},
             "felt": {fg: {k: sum(1 for rr in rader if rr["fagfelt"] == fg and rr["ajg2024"] == k) for k in NIV} for fg in FELT},
             "overgang": {f"{a_ or 'ny'}→{b}": n for (a_, b), n in C.Counter((rr["ajg2021"], rr["ajg2024"]) for rr in rader).items()},
             "nye": sum(1 for rr in rader if not rr["ajg2021"]),
             "nye4s": sum(1 for rr in rader if rr["ajg2024"] == "4*" and rr["ajg2021"] != "4*"),
             "nye4": sum(1 for rr in rader if rr["ajg2024"] == "4" and rr["ajg2021"] not in ("4", "4*")),
             "dubletterTittel": len(rader) - len({rr["tittel"].strip().lower() for rr in rader}),
             "dubletterIssn": sum(v - 1 for v in C.Counter(x for rr in rader for x in (rr["issn"], rr["eissn"]) if x).values() if v > 1),
             "utenIssn": sum(1 for rr in rader if not rr["issn"] and not rr["eissn"]),
             "utenFelt": sum(1 for rr in rader if not rr["fagfelt"]),
             "offisielt": OFFISIELT,
             "tabell3": {f: {"vaar": [sum(1 for rr in rader if rr["fagfelt"] == f and rr["ajg2024"] in g) for g in (("4", "4*"), ("3",), ("2",), ("1",))],
                             "off": list(t)} for f, t in TABELL3.items()},
             "stikkprove": {"dato": STIKKPROVE_DATO, "rader": [[s["tittel"], s["fagfelt"], s["ajg2024"], s["ajg2021"], s["portal_fagfelt"], s["portal_2024"], s["portal_2021"], s["grunn"]]
                            for s in csv.DictReader(open(STIKKPROVE, encoding="utf-8"))]} if STIKKPROVE.exists() else None}

    data = {"generert": datetime.date.today().isoformat(), "periode": list(P), "aar": [AAR[0], AAR[-1]], "felt": FELT, "norske": NORGE,
            "kort": KORT, "liste": liste, "verdenFelt": {fg: {"n": sum(verden[(fg, y)][0] for y in PER), "a3": r(forventet(fg, PER, 1)), "a4": r(forventet(fg, PER, 2))} for fg in FELT},
            "enheter": enheter, "trend": trender,
            "feltsjekk": {k: feltsjekk(v) for k, v in {"norge": samlet, "utenNhhBi": uten, "nhh": norske["nhh"], "bi": norske["bi"], "nmbu": norske["nmbu"],
                                                        "topp_verden": grp["topp_verden"], "topp_europa": grp["topp_europa"], "europa": grp["europa"]}.items()},
            "intl": [{"id": s["id"], "kort": s["kort"], "navn": s["navn"], "land": s["land"], "gruppe": s["gruppe"], "utd": s.get("utd"), "topp": s.get("topp") or [],
                      "n": intl_prof[s["id"]]["n"], "econ": intl_prof[s["id"]]["econ"], "andelEcon": intl_prof[s["id"]]["andelEcon"],
                      "a4e": intl_prof[s["id"]]["econM"].get("a4"), "a4r": intl_prof[s["id"]]["restM"].get("a4")}
                     for s in oppsett["skoler"] if s["id"] in intl_prof],
            "tidsskrift": tidsskrift, "hh": hh}

    if a.klartekst:
        Path(a.klartekst).write_text(json.dumps(data, ensure_ascii=False, indent=1))
    pw = a.testpassord or passord()
    UT.write_text(json.dumps(krypter(data, pw)))
    rangering_med_ajg_passord(pw)
    e = enheter
    print(f"AJG-analyse: {len(rader)} tidsskrift, Norge samlet {e['norge']['n']} artikler ({100*e['norge']['andelEcon']:.1f} % ECON), "
          f"HH NMBU {e['nmbu']['n']}, {len(tidsskrift)} tidsskrift i oversikten, {len(hh)} HH NMBU-artikler → {UT.relative_to(ROOT)} "
          f"({UT.stat().st_size // 1024} kB, kryptert)")


if __name__ == "__main__":
    main()
