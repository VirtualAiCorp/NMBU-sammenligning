#!/usr/bin/env python3
"""Søkergrunnlaget: ungdomskullene per fylke, historisk og framskrevet → kilde/public/sokergrunnlag/ssb.json (lastes lat)

Kilder (SSB, JSON-stat2, cache i data/nmbu/kilder/ssb-sokergrunnlag/):
  07459  Befolkning 1. januar etter region og alder, 2016–2025. Fylkene som ble delt i 2024 (Østfold, Akershus, Buskerud,
         Vestfold, Telemark, Troms, Finnmark) har tall først fra 2024; eldre år er satt til null.
  14746  Framskrevet folkemengde 1. januar (befolkningsframskrivingene 2026), hovedalternativet (MMMM), 2026–2045.
  (09224 «studenter etter bosted ved 16 år» brukes ikke: i 2025 har 11 % ukjent bosted, og mange står fortsatt på fylkene
   fra før 2024 (Viken, Vestfold og Telemark, Troms og Finnmark), så fordelingen per fylke blir misvisende.)
Aldrene 16–24 tas med: 19 år er det typiske året for førstegangssøkere, 16–18 er kullene som kommer.
Studiestedene i fakultetenes sammenligninger kobles til fylke via kommunenummeret i kilde/public/bolig/bolig.json.

Bruk: python3 scripts/build-sokergrunnlag.py [--refresh]
"""
import argparse
import datetime as dt
import itertools
import json
import ssl
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data" / "nmbu" / "kilder" / "ssb-sokergrunnlag"
OUT = ROOT / "kilde" / "public" / "sokergrunnlag" / "ssb.json"
FYLKER = {"0": "Hele landet", "31": "Østfold", "32": "Akershus", "03": "Oslo", "34": "Innlandet", "33": "Buskerud", "39": "Vestfold",
          "40": "Telemark", "42": "Agder", "11": "Rogaland", "46": "Vestland", "15": "Møre og Romsdal", "50": "Trøndelag",
          "18": "Nordland", "55": "Troms", "56": "Finnmark"}
ALDER = [f"{a:03d}" for a in range(16, 25)]
HIST = [str(y) for y in range(2016, 2026)]
FRAM = [str(y) for y in range(2026, 2046)]


def ctx():
    return ssl.create_default_context(cafile="/etc/ssl/cert.pem")


def hent(tabell, query, fil, refresh):
    p = CACHE / fil
    if p.exists() and not refresh:
        return json.load(open(p))
    body = {"query": query, "response": {"format": "json-stat2"}}
    req = urllib.request.Request(f"https://data.ssb.no/api/v0/no/table/{tabell}", data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    d = json.loads(urllib.request.urlopen(req, context=ctx(), timeout=120).read())
    CACHE.mkdir(parents=True, exist_ok=True)
    json.dump(d, open(p, "w"), ensure_ascii=False)
    return d


def celler(d):
    dims = [list(d["dimension"][i]["category"]["index"]) for i in d["id"]]
    return dict(zip(itertools.product(*dims), d["value"]))


def sel(code, vals):
    return {"code": code, "selection": {"filter": "item", "values": vals}}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    regioner = list(FYLKER)
    h = celler(hent("07459", [sel("Region", regioner), sel("Alder", ALDER), sel("Tid", HIST)], "07459_folkemengde.json", a.refresh))
    f = celler(hent("14746", [sel("Region", regioner), sel("Alder", ALDER), sel("ContentsCode", ["Personer"]), sel("Tid", FRAM)], "14746_framskriving.json", a.refresh))
    aar = HIST + FRAM
    alder = {}
    for r in regioner:
        alder[r] = {}
        for al in ALDER:
            rad = [h.get((r, al, "Personer1", y)) for y in HIST] + [f.get((r, al, "Personer", y)) for y in FRAM]
            alder[r][str(int(al))] = [None if v in (None, 0) else v for v in rad]
    # Studiested → fylke via bolig.json (kommunenummer)
    bolig = json.load(open(ROOT / "kilde" / "public" / "bolig" / "bolig.json", encoding="utf-8"))
    stedFylke = {st["navn"]: st["kommune"][:2] for st in bolig["steder"] if st.get("kommune")}
    ut = {"hentet": dt.date.today().isoformat(),
          "kilder": [{"navn": "SSB 07459 Befolkning etter alder og region", "url": "https://www.ssb.no/statbank/table/07459"},
                     {"navn": "SSB 14746 Framskrevet folkemengde (befolkningsframskrivingene 2026), hovedalternativet", "url": "https://www.ssb.no/statbank/table/14746"},
                     ],
          "fylker": FYLKER, "rekkefolge": list(FYLKER), "aar": [int(y) for y in aar], "forsteFramskrevne": int(FRAM[0]), "alder": alder,
          "stedFylke": stedFylke}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    json.dump(ut, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    n19 = alder["0"]["19"]
    topp = max(range(len(aar)), key=lambda i: n19[i] or 0)
    print(f"19-åringer i Norge: {aar[aar.index('2025')]} {n19[aar.index('2025')]}, topp {aar[topp]} {n19[topp]}, 2040 {n19[aar.index('2040')]}. "
          f"{len(stedFylke)} studiesteder koblet. Skrev {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} kB)")


if __name__ == "__main__":
    main()
