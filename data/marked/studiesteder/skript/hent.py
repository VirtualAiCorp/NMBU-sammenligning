#!/usr/bin/env python3
"""Studiesteder: henter rådata fra DBH til ../kilder/ (gzip-cache, høyst to samtidige forespørsler).

  124  Registrerte studenter per studieprogram og campus, høst 2019–2025, alle institusjoner og alle nivå
       (gruppert på institusjon, år, program, stedkode/-navn, kommunenummer, nivå og organisering)  → kilder/124_<år>.json.gz
  123  Registrerte studenter per institusjon, høst 2019–2025 (kontrollsum)                              → kilder/123_inst.json.gz
  662  Campus-steder (bulk-CSV: institusjon, stedkode, stednavn, kommunenummer, land)                   → kilder/bulk_662.csv.gz
  347  Studieprogramregisteret (bulk-CSV, for navn, NUS og nivå på program uten Samordna-kode)          → gjenbrukes fra
       data/marked/studieresultater/kilder/bulk_347.csv.gz

Koordinatene (Kartverket) hentes av bygg.py, fordi stedsnavnene først er kjent etter sammenslåingen.

Bruk: python3 data/marked/studiesteder/skript/hent.py [--refresh]
"""
import argparse
import gzip
import json
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HER = Path(__file__).resolve().parent
KILDER = HER.parent / "kilder"
API = "https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData"
BULK = "https://dbh.hkdir.no/api/Tabeller/bulk-csv?rptNr={}"
AAR = [str(a) for a in range(2019, 2026)]
G124 = ["Institusjonskode", "Årstall", "Studieprogramkode", "Stedkode campus", "Stednavn campus",
        "Kommunenummer campus", "Nivåkode", "Organisering_kode"]


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def body(tid, group_by, filters):
    return {"tabell_id": tid, "api_versjon": 1, "statuslinje": "J", "kodetekst": "J", "desimal_separator": ".",
            "groupBy": group_by, "sortBy": [group_by[0]],
            "filter": [{"variabel": v, "selection": {"filter": k, "values": vals, "exclude": [""]}} for v, k, vals in filters]}


def hent(navn, q, refresh=False):
    sti = KILDER / f"{navn}.json.gz"
    if sti.exists() and not refresh:
        log(f"  [cache] {navn}")
        return
    data = json.dumps(q, ensure_ascii=False).encode("utf-8")
    for i in range(3):
        try:
            t0 = time.time()
            req = urllib.request.Request(API, data=data, headers={"Content-Type": "application/json"}, method="POST")
            with urllib.request.urlopen(req, timeout=600) as r:
                raw = r.read().decode("utf-8")
            d = json.loads(raw)
            KILDER.mkdir(parents=True, exist_ok=True)
            with gzip.open(sti, "wt", encoding="utf-8") as f:
                json.dump({"hentet": time.strftime("%Y-%m-%d"), "api": API, "sporring": q, "data": d}, f, ensure_ascii=False)
            log(f"  [nett] {navn}: {len(d) - 1} rader, {len(raw) / 1e6:.1f} MB på {time.time() - t0:.0f} s – {d[0].get('status', {}).get('melding')}")
            time.sleep(1.0)
            return
        except Exception as e:  # noqa: BLE001
            log(f"  [feil] {navn} forsøk {i + 1}: {e}")
            time.sleep(5 * (i + 1))
    sys.exit(f"FEIL: klarte ikke å hente {navn}")


def bulk(tid, refresh=False):
    sti = KILDER / f"bulk_{tid}.csv.gz"
    if sti.exists() and not refresh:
        log(f"  [cache] bulk {tid}")
        return
    with urllib.request.urlopen(BULK.format(tid), timeout=600) as r:
        raw = r.read().decode("utf-8-sig")
    KILDER.mkdir(parents=True, exist_ok=True)
    with gzip.open(sti, "wt", encoding="utf-8") as f:
        f.write(raw)
    log(f"  [nett] bulk {tid}: {raw.count(chr(10))} linjer")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    bulk(662, a.refresh)
    jobber = [(f"124_{y}", body(124, G124, [("Årstall", "item", [y]), ("Semester", "item", ["3"])])) for y in AAR]
    jobber.append(("123_inst", body(123, ["Institusjonskode", "Årstall"], [("Årstall", "between", [AAR[0], AAR[-1]]),
                                                                           ("Semester", "item", ["3"])])))
    with ThreadPoolExecutor(max_workers=2) as ex:
        list(ex.map(lambda j: hent(j[0], j[1], a.refresh), jobber))


if __name__ == "__main__":
    main()
