#!/usr/bin/env python3
"""Grunnlag for fagfeltprofilen i AJG-sammenligningen: hele AJG-lista og et internasjonalt referansesett (OpenAlex).

OpenAlex (https://openalex.org, data CC0), samme klient og kredittvakt som hent_openalex.py (1 000 kreditter per døgn
uten nøkkel). Tre deler, kjøres i denne rekkefølgen:

  kilder   AJG-tidsskriftene (tidsskrift/ajg2024.csv) slås opp på ISSN i bunter (filter=issn:a|b|…, 1 kreditt per
           kall). Cache: openalex/ajg-kilder.json {issn: kilde-id}. Bare koblingen ISSN → OpenAlex-kilde lagres.
  volum    Hvor mange artikler (type article/review) tidsskriftene i hvert AJG-fagfelt publiserer per år, delt i
           nivågruppene 1–2, 3 og 4/4* (filter på kilde-id-er, group_by=publication_year). Cache:
           openalex/ajg-volum.json {fagfelt: {gruppe: {år: antall}}}. Bare aggregater per fagfelt og nivågruppe.
  skoler   Skolene i openalex/hh-internasjonalt.json: artikler per tidsskrift og år (filter på institusjon inkl.
           underenheter; verkene listes sidevis med bare år og tidsskrift, fordi group_by og cursor ikke går forbi
           første side uten API-nøkkel). Hel telling: en artikkel teller én gang per skole uansett antall forfattere.
           Cache: openalex/hh-profil/<skole>/<år>.json {n, kilder: {kilde-id: antall}}.

Koblingen til AJG-fagfelt og -nivå gjøres i build-rangering.py; ut til nettleseren går bare aggregater per fagfelt.

Bruk:
  python3 scripts/rangering/hent_ajg_profil.py kilder
  python3 scripts/rangering/hent_ajg_profil.py volum [--fra 2016 --til 2025]
  python3 scripts/rangering/hent_ajg_profil.py skoler [--skole cbs] [--fra 2016 --til 2025]
"""
import argparse
import collections
import csv
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from hent_openalex import OA, RANG, Klient, TomForKreditt, kort_id, les_json, skriv_json  # noqa: E402
from issn import normaliser  # noqa: E402

AJG = RANG / "tidsskrift" / "ajg2024.csv"
KILDER = OA / "ajg-kilder.json"
VOLUM = OA / "ajg-volum.json"
SKOLER = OA / "hh-internasjonalt.json"
PROFIL = OA / "hh-profil"
TYPER = "type:article|review"


def gruppe(niva):
    return "4" if niva in ("4", "4*") else "3" if niva == "3" else "12"


def ajg_rader():
    with AJG.open(encoding="utf-8") as f:
        for r in csv.DictReader(f):
            iss = [i for i in (normaliser(r.get("issn")), normaliser(r.get("eissn"))) if i]
            yield r, iss


def kjor_kilder(k, a):
    kart = les_json(KILDER, {})
    mangler = sorted({i for _, iss in ajg_rader() for i in iss} - set(kart))
    print(f"{len(mangler)} ISSN-er å slå opp ({len(kart)} i cachen).")
    try:
        for i in range(0, len(mangler), 50):
            bunt = mangler[i:i + 50]
            d = k.hent("/sources", {"filter": "issn:" + "|".join(bunt), "select": "id,issn", "per-page": 200})
            for s in (d or {}).get("results", []):
                for x in s.get("issn") or []:
                    if x in bunt:
                        kart[x] = kort_id(s["id"])
            for x in bunt:
                kart.setdefault(x, None)  # slått opp, ikke funnet
            skriv_json(KILDER, kart)
            print(f"  {i + len(bunt)}/{len(mangler)}; kreditter igjen {k.igjen}")
    except TomForKreditt as e:
        print("Stopper:", e)
    rader = list(ajg_rader())
    funnet = sum(1 for _, iss in rader if any(kart.get(i) for i in iss))
    print(f"AJG-tidsskrift med OpenAlex-kilde: {funnet} av {len(rader)}.")


def kilder_per_fag():
    """{(fagfelt, nivågruppe): [kilde-id, …]} for AJG-tidsskriftene med OpenAlex-kilde."""
    kart = les_json(KILDER, {})
    ut = collections.defaultdict(set)
    for r, iss in ajg_rader():
        kid = next((kart[i] for i in iss if kart.get(i)), None)
        if kid and r.get("fagfelt") and r.get("ajg2024"):
            ut[(r["fagfelt"], gruppe(r["ajg2024"]))].add(kid)
    return {k: sorted(v) for k, v in ut.items()}


def kjor_volum(k, a):
    vol = les_json(VOLUM, {})
    aar = f"{a.fra}-{a.til}"
    try:
        for (fag, g), kilder in sorted(kilder_per_fag().items()):
            if vol.get(fag, {}).get(g, {}).get("_aar") == aar and not a.refresh:
                continue
            telt = collections.Counter()
            for i in range(0, len(kilder), 100):
                d = k.hent("/works", {"filter": f"primary_location.source.id:{'|'.join(kilder[i:i + 100])},publication_year:{aar},{TYPER}",
                                      "group_by": "publication_year"})
                for x in (d or {}).get("group_by", []):
                    telt[str(x["key"])] += x["count"]
            vol.setdefault(fag, {})[g] = {"_aar": aar, "_kilder": len(kilder), **dict(sorted(telt.items()))}
            skriv_json(VOLUM, vol)
            print(f"  {fag} / {g}: {len(kilder)} tidsskrift, {sum(telt.values())} artikler; kreditter igjen {k.igjen}")
    except TomForKreditt as e:
        print("Stopper:", e)


def kjor_skoler(k, a):
    """Uten API-nøkkel går verken cursor eller group_by forbi første side (200 grupper), så verkene listes sidevis
    (page=, 200 per side, høyst 10 000 treff per spørring) med bare år og tidsskrift, og telles her."""
    skoler = les_json(SKOLER, {})["skoler"]
    try:
        for s in skoler:
            if a.skole and s["id"] != a.skole:
                continue
            fra0 = max(a.fra, a.tekst_fra) if s.get("tekst") else a.fra  # tekstsøk er dyrt: bare de siste årene
            aar = [y for y in range(fra0, a.til + 1) if a.refresh or not (PROFIL / s["id"] / f"{y}.json").exists()]
            vinduer = [(min(aar), max(aar))] if aar else []
            while vinduer:
                fra, til = vinduer.pop(0)
                filt = f"authorships.institutions.lineage:{'|'.join(s['openalex'])},publication_year:{fra}-{til},{TYPER}"
                if s.get("tekst"):  # handelshøyskole som fakultet: universitetet + tilknytningstekst (søk, 10 kreditter per side)
                    filt += f",raw_affiliation_strings.search:{s['tekst']}"
                telt = collections.defaultdict(collections.Counter)
                n, side = None, 1
                while True:
                    d = k.hent("/works", {"filter": filt, "select": "publication_year,primary_location", "per-page": 200, "page": side},
                               kost=10 if s.get("tekst") else 1) or {}
                    n = d.get("meta", {}).get("count", n)
                    if n and n > 10000 and fra < til:  # basispaging stopper ved 10 000: del vinduet
                        m = (fra + til) // 2
                        vinduer[:0] = [(fra, m), (m + 1, til)]
                        telt = None
                        break
                    for w in d.get("results", []):
                        kid = kort_id(((w.get("primary_location") or {}).get("source") or {}).get("id"))
                        telt[w.get("publication_year")][kid or "-"] += 1
                    if not d.get("results") or side * 200 >= (n or 0):
                        break
                    side += 1
                if telt is None:
                    continue
                for y in range(fra, til + 1):
                    if y in aar:
                        t = telt.get(y, {})
                        skriv_json(PROFIL / s["id"] / f"{y}.json", {"skole": s["id"], "aar": y, "hentet": time.strftime("%Y-%m-%d"),
                                                                    "filter": filt, "n": sum(t.values()), "kilder": dict(t)})
                print(f"  {s['id']} {fra}–{til}: {n} artikler ({side} sider); kreditter igjen {k.igjen}")
    except TomForKreditt as e:
        print("Stopper:", e)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("del_", choices=["kilder", "volum", "skoler"])
    ap.add_argument("--reserve", type=int, default=40)
    ap.add_argument("--skole")
    ap.add_argument("--fra", type=int, default=2016)
    ap.add_argument("--til", type=int, default=2025)
    ap.add_argument("--tekst-fra", type=int, default=2023, help="første år for skoler som avgrenses på tilknytningstekst")
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    k = Klient(a.reserve)
    {"kilder": kjor_kilder, "volum": kjor_volum, "skoler": kjor_skoler}[a.del_](k, a)
    print(f"Kreditter brukt {k.brukt}, igjen {k.igjen}.")


if __name__ == "__main__":
    sys.exit(main())
