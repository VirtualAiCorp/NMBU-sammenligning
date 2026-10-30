#!/usr/bin/env python3
"""Robusthet for AJG-analysen: er ECON også sterkere enn andre felt målt uten AJG-nivå?
Grunnlag som ajg_analyse.py: NVI-artikler 2021–2025 i AJG-tidsskrift, fagfelt = AJG-felt. Kvalitetsmål: FWCI og topp 10/1 % (OpenAlex),
ABDC, FT50, UTD24, norsk nivå 2. Bare aggregater. Lagrer JSON til argv[1]."""
import csv, json, re, sys, collections, math, random
from pathlib import Path
from scipy import stats
sys.path.insert(0, str(Path.home() / "Desktop/BOA-sammenligning/scripts/rangering"))
import sitering as S
ROOT = Path.home() / "Desktop/BOA-sammenligning"; RANG = ROOT / "data/rangering"; T = RANG / "tidsskrift"
PER = range(2021, 2026)
NORGE = ["nhh", "bi", "nmbu", "uis", "uia", "nord", "ntnu", "uit", "usn", "inn", "oslomet", "himolde", "hvl", "kristiania", "hiof"]
REF = ["ntnu_hh", "uib_okon", "uio_okon"]
issn = S.issn
def rader(f): return list(csv.DictReader(open(T / f, encoding="utf-8-sig", newline="")))
ajg = {}; aj = rader("ajg2024.csv")
for i, r in enumerate(aj):
    for k in ("issn", "eissn"):
        if issn(r[k]): ajg.setdefault(issn(r[k]), i)
for r in rader("alias.csv"):
    a, l = issn(r["alias_issn"]), issn(r["liste_issn"])
    if a and l in ajg: ajg.setdefault(a, ajg[l])
def tabell(f, verdi):
    d = {}
    for r in rader(f):
        for k in ("issn", "eissn"):
            if issn(r[k]): d[issn(r[k])] = verdi(r)
    return d
abdc = tabell("abdc.csv", lambda r: r["rating"]); ft50 = tabell("ft50.csv", lambda r: r["ft50_2026"] == "1"); utd = tabell("utd24.csv", lambda r: True)
doi_oa = (S.les(S.OA / "norge-doi.json", {}) or {}).get("doi", {}); tind, ik = S.tittel_indeks()
kart = json.load(open(RANG / "openalex/ajg-kilder.json")); verden = json.load(open(Path(sys.argv[1]).parent / "verden-sitering.json"))
def forv(ii):
    v = next((verden[kart[i]] for i in ii if kart.get(i) in verden), None)
    return (v[1]/v[0], v[2]/v[0]) if v and v[0] >= 20 else (None, None)
per_skole = collections.defaultdict(dict)
for sid in NORGE + REF:
    for y in PER:
        d = json.loads((RANG / "nva" / sid / f"{y}.json").read_text()); dd = (S.les(S.OA / "nva-doi" / sid / f"{y}.json", {}) or {}).get("doi", {})
        for x in d["artikler"]:
            if not x.get("nvi"): continue
            ii = [issn(x.get("issn")), issn(x.get("eissn"))]
            t = next((ajg[i] for i in ii if i in ajg), None)
            if t is None: continue
            doi = dd.get(x["id"]); w, _ = S.finn(x, y, doi, doi_oa, tind, ik)
            a = {"felt": aj[t]["fagfelt"], "aar": y, "niva": str(x.get("niva") or ""), "intl": x.get("intl"), "forf": x.get("forfattere"),
                 "fwci": (w or {}).get("fwci"), "t10": (w or {}).get("t10"), "t1": (w or {}).get("t1"), "pct": (w or {}).get("pct"),
                 "abdc": next((abdc[i] for i in ii if i in abdc), None), "ft50": any(ft50.get(i) for i in ii), "utd": any(utd.get(i) for i in ii),
                 "ajg": aj[t]["ajg2024"], "e10": forv(ii)[0], "e1": forv(ii)[1]}
            per_skole[sid][x["id"]] = a; 
def indeks(v):
    p = [a for a in v if a["pct"] is not None and a["e10"] is not None]
    if not p: return {"i10": None, "i1": None, "e10": None, "nI": 0}
    o10, f10 = sum(bool(a["t10"]) for a in p), sum(a["e10"] for a in p); o1, f1 = sum(bool(a["t1"]) for a in p), sum(a["e1"] for a in p)
    return {"i10": o10/f10, "i1": o1/f1 if f1 else None, "e10": f10/len(p), "e1": f1/len(p), "nI": len(p)}
def mal(v):
    n = len(v); f = [a["fwci"] for a in v if a["fwci"] is not None]; p = [a for a in v if a["pct"] is not None]
    ab = [a for a in v if a["abdc"]]; nv = [a for a in v if a["niva"]]
    return {"n": n, "fwciN": len(f), "dekning": len(f)/n if n else None, "fwciSnitt": sum(f)/len(f) if f else None,
            "fwciMedian": sorted(f)[len(f)//2] if f else None, "t10": sum(bool(a["t10"]) for a in p)/len(p) if p else None, "t1": sum(bool(a["t1"]) for a in p)/len(p) if p else None,
            "abdcN": len(ab), "abdcAstar": sum(a["abdc"] == "A*" for a in ab)/len(ab) if ab else None, "abdcA": sum(a["abdc"] in ("A*", "A") for a in ab)/len(ab) if ab else None,
            "ft50": sum(a["ft50"] for a in v)/n if n else None, "utd": sum(a["utd"] for a in v)/n if n else None,
            "niva2": sum(a["niva"] == "LevelTwo" for a in nv)/len(nv) if nv else None,
            **indeks(v), "nivaVerdier": dict(collections.Counter(a["niva"] for a in v)),
            "a3": sum(a["ajg"] in ("3", "4", "4*") for a in v)/n if n else None, "a4": sum(a["ajg"] in ("4", "4*") for a in v)/n if n else None}
def z(a, b, na, nb):
    k = a*na + b*nb; p = k/(na+nb)
    if p in (0, 1) or not na or not nb: return None
    return float(2*(1-stats.norm.cdf(abs(a-b)/math.sqrt(p*(1-p)*(1/na+1/nb)))))
def sml(arts):
    e = [a for a in arts if a["felt"] == "ECON"]; r = [a for a in arts if a["felt"] != "ECON"]
    m = {"econ": mal(e), "andre": mal(r)}
    fe, fr = [a["fwci"] for a in e if a["fwci"] is not None], [a["fwci"] for a in r if a["fwci"] is not None]
    if len(fe) > 5 and len(fr) > 5: m["pFwci"] = float(stats.mannwhitneyu(fe, fr, alternative="two-sided").pvalue)
    for k in ("t10", "t1"):
        pe, pr = [a for a in e if a["pct"] is not None], [a for a in r if a["pct"] is not None]
        if pe and pr: m["p_"+k] = z(m["econ"][k], m["andre"][k], len(pe), len(pr))
    for k, g in (("abdcAstar", "abdcN"), ("abdcA", "abdcN")):
        if m["econ"][g] and m["andre"][g]: m["p_"+k] = z(m["econ"][k], m["andre"][k], m["econ"][g], m["andre"][g])
    for k in ("ft50", "a3", "a4"): m["p_"+k] = z(m["econ"][k], m["andre"][k], len(e), len(r))
    return m
def unik(ss): 
    d = {}
    for s in ss: d.update(per_skole[s])
    return list(d.values())
enh = {"norge": unik(NORGE), "utenNhhBi": unik([s for s in NORGE if s not in ("nhh", "bi")]), "nhh": unik(["nhh"]), "bi": unik(["bi"]), "nmbu": unik(["nmbu"]),
       "uio_okon": unik(["uio_okon"]), "uib_okon": unik(["uib_okon"])}
ut = {"sammenligning": {k: sml(v) for k, v in enh.items()}}
# Per fagfelt, Norge samlet
alle = enh["norge"]; felt = sorted({a["felt"] for a in alle})
ut["perFelt"] = {f: mal([a for a in alle if a["felt"] == f]) for f in felt}
ut["perFeltUtenNhhBi"] = {f: mal([a for a in enh["utenNhhBi"] if a["felt"] == f]) for f in felt}
# Verden: topp 10/1 % per AJG-fagfelt (alle tidsskrift, alle land), for å se om mønsteret er norsk eller gjelder feltet
vf = collections.defaultdict(lambda: [0, 0, 0])
sett = set()
for r in aj:
    k = next((kart[issn(r[x])] for x in ("issn", "eissn") if issn(r[x]) and kart.get(issn(r[x]))), None)
    if k and k in verden and k not in sett:
        sett.add(k)
        for j in range(3): vf[r["fagfelt"]][j] += verden[k][j]
ut["verdenFelt"] = {f: {"n": v[0], "t10": v[1]/v[0], "t1": v[2]/v[0]} for f, v in vf.items()}
e = vf["ECON"]; rr = [sum(v[j] for f, v in vf.items() if f != "ECON") for j in range(3)]
ut["verdenEcon"] = {"econ": {"n": e[0], "t10": e[1]/e[0], "t1": e[2]/e[0]}, "andre": {"n": rr[0], "t10": rr[1]/rr[0], "t1": rr[2]/rr[0]}}
# Dekning av fagfeltene i lista selv: hvor stor del av hvert felts AJG-tidsskrift står på FT50/UTD24/ABDC A*
tot = collections.Counter(r["fagfelt"] for r in aj); 
d = collections.defaultdict(collections.Counter)
for r in aj:
    ii = [issn(r["issn"]), issn(r["eissn"])]
    d[r["fagfelt"]]["ft50"] += any(ft50.get(i) for i in ii); d[r["fagfelt"]]["utd"] += any(utd.get(i) for i in ii)
    a = next((abdc[i] for i in ii if i in abdc), None); d[r["fagfelt"]]["abdc"] += bool(a); d[r["fagfelt"]]["astar"] += a == "A*"
ut["listeDekning"] = {f: {"n": tot[f], **d[f]} for f in tot}
# Organisasjonsgrense: hva skjer med Norge om vi legger til UiO/UiB økonomi, eller tar samfunnsøkonomene ut av NTNU?
def andel(v): return {"n": len(v), "econ": sum(a["felt"] == "ECON" for a in v), "andel": sum(a["felt"] == "ECON" for a in v)/len(v), "a4e": mal([a for a in v if a["felt"] == "ECON"])["a4"], "a4r": mal([a for a in v if a["felt"] != "ECON"])["a4"]}
ut["grense"] = {"Norge samlet": andel(unik(NORGE)), "+ UiO og UiB økonomi": andel(unik(NORGE + ["uio_okon", "uib_okon"])), "NTNU HH uten samf.øk./IØT i stedet for NTNU": andel(unik([s for s in NORGE if s != "ntnu"] + ["ntnu_hh"])),
                "Uten HH NMBU": andel(unik([s for s in NORGE if s != "nmbu"])), "Uten NHH": andel(unik([s for s in NORGE if s != "nhh"]))}
# Bootstrap (2 000 trekk over artikler) for indeksene: observert topp 10/1 % delt på forventet ut fra tidsskriftet
def boot(v, k, e, n=2000):
    p = [(bool(a[k]), a[e]) for a in v if a["pct"] is not None and a["e10"] is not None]
    r = random.Random(20261031); ut_ = []
    for _ in range(n):
        t = r.choices(p, k=len(p)); f = sum(x[1] for x in t)
        ut_.append(sum(x[0] for x in t)/f if f else 0)
    ut_.sort(); return [ut_[int(.025*n)], ut_[int(.975*n)]]
for k, v in enh.items():
    e = [a for a in v if a["felt"] == "ECON"]; r_ = [a for a in v if a["felt"] != "ECON"]
    ut["sammenligning"][k]["ci"] = {"econI10": boot(e, "t10", "e10"), "andreI10": boot(r_, "t10", "e10"), "econI1": boot(e, "t1", "e1"), "andreI1": boot(r_, "t1", "e1")}
    ut["sammenligning"][k]["antallT1"] = [sum(bool(a["t1"]) for a in e), sum(bool(a["t1"]) for a in r_)]
json.dump(ut, open(sys.argv[1], "w"), ensure_ascii=False, indent=1)
f = lambda x, d=3: "–" if x is None else f"{x:.{d}f}"
print(f"{'enhet':11}{'gr':6}{'n':>6}{'dekn':>6}{'FWCI':>7}{'med':>6}{'t10':>7}{'t1':>7}{'A*':>7}{'A*+A':>7}{'FT50':>7}{'UTD':>6}{'niv2':>6}{'AJG3+':>7}{'AJG4':>7}")
for k, m in ut["sammenligning"].items():
    for g in ("econ", "andre"):
        x = m[g]; print(f"{k:11}{g:6}{x['n']:>6}{f(x['dekning'],2):>6}{f(x['fwciSnitt'],2):>7}{f(x['fwciMedian'],2):>6}{f(x['t10']):>7}{f(x['t1']):>7}{f(x['abdcAstar']):>7}{f(x['abdcA']):>7}{f(x['ft50']):>7}{f(x['utd']):>6}{f(x['niva2'],2):>6}{f(x['a3']):>7}{f(x['a4']):>7}")
    print("   p:", {k2: round(v, 4) for k2, v in m.items() if k2.startswith("p") and v is not None})
print({k: (v["n"], round(v["andel"], 3), round(v["a4e"], 3), round(v["a4r"], 3)) for k, v in ut["grense"].items()})
print("ECON i lister:", ut["listeDekning"]["ECON"])
print("Verden:", {k: {a: round(b, 3) for a, b in v.items()} for k, v in ut["verdenEcon"].items()})
for k, m in ut["sammenligning"].items():
    print(f"{k:11} i10 econ {f(m['econ']['i10'],2)} (forv {f(m['econ']['e10'],3)}) andre {f(m['andre']['i10'],2)} (forv {f(m['andre']['e10'],3)}) | i1 econ {f(m['econ']['i1'],2)} andre {f(m['andre']['i1'],2)} | niv2 {f(m['econ']['niva2'],3)} {f(m['andre']['niva2'],3)}")
print("Felt, verden t10 og Norge i10:"); 
for fe, v in sorted(ut["verdenFelt"].items(), key=lambda x: -x[1]["t10"]):
    print(f"  {fe[:30]:31}{v['n']:>7}{v['t10']:>7.3f}  Norge n {ut['perFelt'].get(fe,{}).get('n',0):>5} i10 {f(ut['perFelt'].get(fe,{}).get('i10'),2)}")

print("CI:")
for k, m in ut["sammenligning"].items(): print(f"  {k:11}", {a: [round(x, 2) for x in b] for a, b in m["ci"].items()}, "topp 1 % antall", m["antallT1"])
