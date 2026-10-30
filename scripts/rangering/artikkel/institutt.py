#!/usr/bin/env python3
"""Fagfelt etter tidsskrift mot etter institutt: NHH, BI, NTNU og UiS, 2021–2025. Henter bare artikkel-id per samfunnsøkonomisk institutt fra NVA
(ingen navn lagres) og krysser med AJG-felt og -nivå. Lagrer aggregater til argv[1]."""
import csv, json, ssl, sys, time, urllib.parse, urllib.request, collections
from pathlib import Path
sys.path.insert(0, str(Path.home() / "Desktop/BOA-sammenligning/scripts/rangering"))
from issn import normaliser as issn
RANG = Path.home() / "Desktop/BOA-sammenligning/data/rangering"; T = RANG / "tidsskrift"
API = "https://api.nva.unit.no/search/resources"; ORG = "https://api.nva.unit.no/cristin/organization/"
ctx = ssl.create_default_context(cafile="/etc/ssl/cert.pem")
INST = {"nhh": ("191.30.0.0", "Institutt for samfunnsøkonomi"), "bi": ("158.3.0.0", "Institutt for samfunnsøkonomi"),
        "ntnu": ("194.60.20.0", "Institutt for samfunnsøkonomi"), "uis": ("217.14.3.0", "Avdeling for samfunnsøkonomi og finans (blandet)")}
def hent(q):
    r = urllib.request.Request(API + "?" + urllib.parse.urlencode(q), headers={"Accept": "application/json"})
    for f in range(4):
        try: return json.load(urllib.request.urlopen(r, context=ctx, timeout=60))
        except Exception:
            if f == 3: raise
            time.sleep(3*(f+1))
def ider(e):
    s = set()
    for y in range(2021, 2026):
        fra = 0
        while True:
            d = hent({"unit": ORG + e, "publicationYear": y, "instanceType": "AcademicArticle,AcademicLiteratureReview", "results": 100, "from": fra, "sort": "identifier", "aggregation": "none"})
            s |= {h.get("identifier") for h in d.get("hits", [])}
            fra += 100
            if fra >= d.get("totalHits", 0) or not d.get("hits"): break
    return s
aj = list(csv.DictReader(open(T / "ajg2024.csv", encoding="utf-8-sig", newline="")))
ajg = {}
for i, r in enumerate(aj):
    for k in ("issn", "eissn"):
        n = issn(r[k])
        if n: ajg.setdefault(n, i)
for r in csv.DictReader(open(T / "alias.csv", encoding="utf-8-sig", newline="")):
    a, l = issn(r["alias_issn"]), issn(r["liste_issn"])
    if a and l in ajg: ajg.setdefault(a, ajg[l])
ut = {}
for s, (e, navn) in INST.items():
    dep = ider(e); arts = []
    for y in range(2021, 2026):
        for x in json.loads((RANG / "nva" / s / f"{y}.json").read_text())["artikler"]:
            if not x.get("nvi"): continue
            t = next((ajg[i] for i in (issn(x.get("issn")), issn(x.get("eissn"))) if i in ajg), None)
            if t is not None: arts.append((x["id"] in dep, aj[t]["fagfelt"], aj[t]["ajg2024"]))
    def m(v):
        n = len(v); return {"n": n, "a3": sum(a[2] in ("3", "4", "4*") for a in v)/n if n else None, "a4": sum(a[2] in ("4", "4*") for a in v)/n if n else None}
    E = [a for a in arts if a[1] == "ECON"]; D = [a for a in arts if a[0]]
    ut[s] = {"enhet": navn, "treffNVA": len(dep), "alle": len(arts), "econFelt": len(E), "depArt": len(D), "beggeDeler": sum(a[0] for a in E),
             "andelDepIEcon": sum(a[1] == "ECON" for a in D)/len(D) if D else None, "andelEconFraDep": sum(a[0] for a in E)/len(E) if E else None,
             "depFelt": collections.Counter(a[1] for a in D).most_common(6),
             "etterTidsskrift": {"econ": m(E), "andre": m([a for a in arts if a[1] != "ECON"])}, "etterInstitutt": {"econ": m(D), "andre": m([a for a in arts if not a[0]])},
             "kryss": {"inneEcon": m([a for a in arts if a[0] and a[1] == "ECON"]), "inneAndre": m([a for a in arts if a[0] and a[1] != "ECON"]), "utenforEcon": m([a for a in arts if not a[0] and a[1] == "ECON"])}}
    u = ut[s]; print(s, navn, "NVA", len(dep), "AJG-art", len(arts), "ECON-felt", len(E), "inst-art", len(D), f"inst→ECON {u['andelDepIEcon']:.2f}  ECON fra inst {u['andelEconFraDep']:.2f}", u["depFelt"][:4])
    print("   tidsskrift", {k: (v["n"], round(v["a3"], 3), round(v["a4"], 3)) for k, v in u["etterTidsskrift"].items()}, "institutt", {k: (v["n"], round(v["a3"], 3), round(v["a4"], 3)) for k, v in u["etterInstitutt"].items()})
    print("   kryss", {k: (v["n"], round(v["a3"] or 0, 3), round(v["a4"] or 0, 3)) for k, v in u["kryss"].items()})
json.dump(ut, open(sys.argv[1], "w"), ensure_ascii=False, indent=1)
