#!/usr/bin/env python3
"""DOI per NVA-artikkel for siteringsmålet (OpenAlex) i den interne rangeringen.

Den eksisterende NVA-cachen (data/rangering/nva/<skole>/<år>.json, scripts/fetch-nva-artikler.py) har ikke DOI, og den
skal ikke endres. Dette skriptet kjører det samme søket mot NVA (samme enheter, år og artikkeltyper) og tar bare vare på
NVA-id → DOI (entityDescription.reference.doi, normalisert til små bokstaver uten https://doi.org/). Ingen navn lagres.

Cache (gitignored): data/rangering/openalex/nva-doi/<skole>/<år>.json  {"skole", "aar", "hentet", "doi": {id: doi|null}}
Artikler som ikke finnes i søket lenger (slettet/flyttet i NVA etter at artikkelcachen ble hentet), mangler i fila og
regnes som «uten DOI».

Bruk:
  python3 scripts/rangering/hent_nva_doi.py [--fra 2016] [--til 2025] [--skole nmbu] [--refresh]
"""
import argparse
import json
import re
import sys
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RANG = ROOT / "data" / "rangering"
CACHE = RANG / "openalex" / "nva-doi"
sys.path.insert(0, str(ROOT / "scripts"))
import importlib.util  # noqa: E402

spec = importlib.util.spec_from_file_location("fna", ROOT / "scripts" / "fetch-nva-artikler.py")
fna = importlib.util.module_from_spec(spec); spec.loader.exec_module(fna)


def norm_doi(d):
    """'https://doi.org/10.1016/J.X' → '10.1016/j.x' (OpenAlex sammenligner DOI uten skille på store/små bokstaver)."""
    if not d:
        return None
    d = str(d).strip()
    d = re.sub(r"^(https?://)?(dx\.)?doi\.org/", "", d, flags=re.I)
    d = re.sub(r"^doi:\s*", "", d, flags=re.I).strip().lower()
    return d if d.startswith("10.") and "/" in d else None


def hent_aar(enheter, aar):
    ut = {}
    for e in enheter:
        fra = 0
        while True:
            q = {"unit": fna.ORG + e, "publicationYear": aar, "instanceType": fna.TYPER, "results": fna.SIDE, "from": fra,
                 "sort": "identifier", "aggregation": "none"}
            d = fna.hent(fna.API + "?" + urllib.parse.urlencode(q))
            for h in d.get("hits", []):
                ref = (h.get("entityDescription") or {}).get("reference") or {}
                i = h.get("identifier")
                if i and (i not in ut or ut[i] is None):
                    ut[i] = norm_doi(ref.get("doi"))
            fra += fna.SIDE
            if fra >= d.get("totalHits", 0) or not d.get("hits"):
                break
    return ut


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fra", type=int, default=2016)
    ap.add_argument("--til", type=int, default=2025)
    ap.add_argument("--skole")
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    skoler = json.loads((RANG / "skoler.json").read_text(encoding="utf-8"))
    jobber = []
    for s in skoler:
        if a.skole and s["id"] != a.skole:
            continue
        nva = s.get("nva") or []
        if isinstance(nva, dict):
            nva = [e["id"] for e in nva.get("enheter", [])]
        enheter = [str(x).rsplit("/", 1)[-1] for x in nva]
        for aar in range(a.fra, a.til + 1):
            f = CACHE / s["id"] / f"{aar}.json"
            if enheter and (a.refresh or not f.exists()):
                jobber.append((s["id"], enheter, aar, f))

    def kjor(j):
        sid, enheter, aar, f = j
        doi = hent_aar(enheter, aar)
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(json.dumps({"skole": sid, "aar": aar, "hentet": time.strftime("%Y-%m-%d"), "doi": doi}, ensure_ascii=False))
        return sid, aar, len(doi), sum(1 for v in doi.values() if v)

    with ThreadPoolExecutor(4) as ex:
        for sid, aar, n, m in ex.map(kjor, jobber):
            print(f"  {sid} {aar}: {n} artikler, {m} med DOI")
    print(f"Ferdig: {len(jobber)} skole-år.")


if __name__ == "__main__":
    main()
