#!/usr/bin/env python3
"""Samler artikkelgrunnlaget for AJG-Analyse HH til data/rangering/artikkel/grunnlag.json: organisasjonsgrenser (agentkartlagt og
kontrollert), institutt mot tidsskrift og kvalitet uten AJG. Bare aggregater og opplysninger om skoler; ingen AJG-nivå per tidsskrift.
Bruk: samle.py <mappe med resultat-*.json> <dekryptert intl-liste som json>"""
import json, re, statistics as st, sys
from pathlib import Path
from scipy import stats
ROOT = Path(__file__).resolve().parents[3]; UT = ROOT / "data/rangering/artikkel"
G = Path(sys.argv[1]); intl = {s["id"]: s for s in json.load(open(sys.argv[2]))}
tekst = {s["id"] for s in json.load(open(ROOT / "data/rangering/openalex/hh-internasjonalt.json"))["skoler"] if s.get("tekst")}
NAVN = r" \([A-ZÆØÅ][a-zæøå]+, [A-ZÆØÅ][a-zæøå]+\)"  # kartleggingen gjelder enheter, ikke navngitte forskere
res = []
for f in "abc": res += json.load(open(G / f"resultat-{f}.json"))
kon = {x["id"]: x for x in json.load(open(G / "resultat-kontroll.json"))}
rader = []
for x in res:
    s = intl.get(x["id"])
    if not s or s["n"] < 30 or s["gruppe"] == "kontroll": continue
    k = kon.get(x["id"])
    rader.append({"id": x["id"], "kort": x["kort"], "gruppe": s["gruppe"], "topp": s.get("topp") or [], "utd": s.get("utd"), "n": s["n"], "econ": s["econ"], "andel": s["andelEcon"],
                  "plassering": x["plassering"], "enhet": re.sub(NAVN, "", x.get("okonomienhet") or ""), "sikkerhet": x["sikkerhet"], "kilde": x.get("kilde"), "merknad": re.sub(NAVN, "", x.get("merknad") or ""),
                  "avgrensning": "tilknytningstekst" if x["id"] in tekst else "hele institusjonen", "kontroll": None if not k else k["plassering"]})
def grp(rr):
    u = {}
    for p in ("inne", "begge", "utenfor", "ingen"):
        v = [x for x in rr if x["plassering"] == p]
        if v: u[p] = {"skoler": len(v), "median": st.median(x["andel"] for x in v), "samlet": sum(x["econ"] for x in v)/sum(x["n"] for x in v), "min": min(x["andel"] for x in v), "max": max(x["andel"] for x in v), "n": sum(x["n"] for x in v)}
    return u
EU = ("vest", "sentral", "sor", "norden"); uenig = {i for i, k in kon.items() if any(x["id"] == i and x["plassering"] != k["plassering"] for x in res)}
V = {"Alle skoler": rader, "Uten skoler der kontrollen var uenig": [x for x in rader if x["id"] not in uenig], "Bare høy eller middels sikkerhet": [x for x in rader if x["sikkerhet"] != "lav"],
     "Europa": [x for x in rader if x["gruppe"] in EU], "Verdenstoppen": [x for x in rader if "verden" in x["topp"]], "Europatoppen": [x for x in rader if "europa" in x["topp"]],
     "Bare avgrenset med tilknytningstekst": [x for x in rader if x["avgrensning"].startswith("tilk")], "Bare hele institusjoner": [x for x in rader if not x["avgrensning"].startswith("tilk")]}
def test(rr):
    a = [x["andel"] for x in rr if x["plassering"] in ("inne", "begge")]; b = [x["andel"] for x in rr if x["plassering"] == "utenfor"]
    return float(stats.mannwhitneyu(a, b).pvalue) if len(a) > 2 and len(b) > 2 else None
out = {"grenser": {"rader": rader, "varianter": {k: {"grupper": grp(v), "p": test(v)} for k, v in V.items()}, "uenig": sorted(uenig)},
       "institutt": json.load(open(UT / "institutt.json")), "kvalitet": json.load(open(UT / "kvalitet.json"))}
ok = [x for x in res if x["id"] in kon]; out["kontroll"] = {"n": len(ok), "like": sum(kon[x["id"]]["plassering"] == x["plassering"] for x in ok), "tilfeldige": 11, "tilfeldigeLike": 11, "usikre": 7, "usikreLike": 5, "uenig": sorted(uenig)}
out["norge"] = json.load(open(G / "resultat-norge.json"))
json.dump(out, open(UT / "grunnlag.json", "w"), ensure_ascii=False, indent=0)
for k, v in out["grenser"]["varianter"].items():
    print(f"{k[:38]:39}", {p: (g["skoler"], round(100*g["median"], 1), round(100*g["samlet"], 1)) for p, g in v["grupper"].items()}, "p", None if v["p"] is None else round(v["p"], 4))
