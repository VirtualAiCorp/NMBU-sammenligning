#!/usr/bin/env python3
"""Poenggrenser og ventelistetall fra Samordna opptak (SO-datavarehuset, Tableau) → data/nmbu/kilder/so_poenggrenser_venteliste.csv

Kilde: rapporten «Poenggrenser og ventelistetall hovedopptak/suppleringsopptak» på rapport-dv.educloud.no. Tableau gir
visningen som CSV når man legger «.csv» til adressen; filtrene i adressen (År, Opptaksrunde) henter alle år og begge
opptaksrundene. Én rad per studiekode × kvote × opptaksrunde × år × mål («Poenggrense» eller «Søkere på venteliste»).
build-landsam-data.py leser ventelistetallene herfra (vl_* etter hovedopptaket, vls_* etter suppleringsopptaket).

Bruk: python3 scripts/fetch-so-venteliste.py
"""
import csv
import collections
import io
import subprocess
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UT = ROOT / "data" / "nmbu" / "kilder" / "so_poenggrenser_venteliste.csv"
VISNING = ("https://rapport-dv.educloud.no/t/SO-datavarehus/views/"
           "Poenggrenserogventelistetallhovedopptaksuppleringsopptak_16275618215770/Poenggrenserogventelistetall.csv")
AAR = [str(y) for y in range(2020, 2027)]


def main():
    url = VISNING + "?" + urllib.parse.urlencode({"År": ",".join(AAR), "Opptaksrunde": "Hovedopptak,Suppleringsopptak"})
    raw = subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", url], capture_output=True, check=True).stdout.decode("utf-8-sig")
    rader = list(csv.DictReader(io.StringIO(raw), delimiter=";"))
    if not rader or "Measure Names" not in rader[0]:
        raise SystemExit("Uventet svar fra Tableau")
    UT.parent.mkdir(parents=True, exist_ok=True)
    UT.write_text(raw, encoding="utf-8")
    c = collections.Counter((r["År"], r["Opptaksrunde"]) for r in rader if r["Measure Names"] == "Søkere på venteliste")
    print(f"{len(rader)} rader. Ventelistetall per år/runde: " + ", ".join(f"{a} {o[:5]}: {n}" for (a, o), n in sorted(c.items())))
    print(f"Skrev {UT.relative_to(ROOT)} ({UT.stat().st_size // 1024} kB)")


if __name__ == "__main__":
    main()
