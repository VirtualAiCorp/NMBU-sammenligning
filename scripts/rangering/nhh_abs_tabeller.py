#!/usr/bin/env python3
"""ABS/AJG 2024-nivåer for norske handelshøyskoler fra NHH Research Report 2024 (vedlegg til styresak 44/25,
styret ved NHH 17.06.2025), tabell 4 (ABS 4*), 5 (ABS 4) og 31 (ABS 3): antall og per årsverk (FTE uten
stipendiater, DBH) for NHH, BI, NMBU, Nord, NTNU, UiA, UiS og UiT, 2020–2024.

Dette er NHHs publiserte aggregater, ikke selve AJG-lista. Vi viser dem til Chartered ABS har gitt tillatelse til
å koble våre artikler mot lista. Kjent feil i kilden: i tabell 31 (ABS 3) er antallet for 2022 likt 2020 for
nesten alle skolene, mens tallene per årsverk er ulike. Det er trolig en kopifeil hos NHH; 2022 merkes usikker.

Kilde-PDF lagres i data/rangering/kontroll/kilde/ (gitignored). Utdata: data/rangering/ajg-nhh-rapport.json.

Bruk:
  /usr/local/bin/python3 scripts/rangering/nhh_abs_tabeller.py
"""
import json
import re
import urllib.request
from pathlib import Path

import pypdf

ROOT = Path(__file__).resolve().parents[2]
URL = ("https://www.nhh.no/globalassets/om-nhh/organisasjon/styret-ved-nhh/saksdokument/moteinkallingar/2025/"
       "offentlig-innkalling-styret-ved-norges-handelshoyskole-17.06.2025.pdf")
PDF = ROOT / "data" / "rangering" / "kontroll" / "kilde" / "nhh-styret-2025-06-17.pdf"
UT = ROOT / "data" / "rangering" / "ajg-nhh-rapport.json"
SKOLE = {"NHH": "nhh", "BI": "bi", "NMBU": "nmbu", "Nord University": "nord", "NTNU": "ntnu", "UiA": "uia", "UiS": "uis", "UiT": "uit"}
TABELL = {"4": "4*", "5": "4", "31": "3"}
AAR = [2020, 2021, 2022, 2023, 2024]


def main():
    if not PDF.exists():
        PDF.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(URL, PDF)
    tekst = {i + 1: (p.extract_text() or "") for i, p in enumerate(pypdf.PdfReader(PDF).pages)}
    ut = {"kilde": "NHH Research Report 2024, tabell 4, 5 og 31 (vedlegg til styresak 44/25, styret ved NHH 17.06.2025)",
          "url": URL, "liste": "AJG 2024 (Chartered ABS)", "nevner": "FTE uten stipendiater (DBH)",
          "usikker": {"3": [2022]}, "sider": {}, "skoler": {}}
    for side, t in tekst.items():
        for nr, niva in TABELL.items():
            m = re.search(rf"Table {nr} ABS [^\n]*Norwegian business schools[^\n]*\n(.*?)(?=\nTable|\n\s*\n|\Z)", t, re.S)
            if not m:
                continue
            ut["sider"][niva] = side
            for navn, sid in SKOLE.items():
                r = re.search(rf"^{re.escape(navn)} ((?:[\d.]+ ){{11}}[\d.]+)", m.group(1), re.M)
                if not r:
                    raise SystemExit(f"Fant ikke {navn} i tabell {nr} (side {side})")
                tall = [float(x) for x in r.group(1).split()]
                for k, aar in enumerate(AAR):
                    ut["skoler"].setdefault(sid, {}).setdefault(str(aar), {})[niva] = {"n": int(tall[2 * k]), "perFte": tall[2 * k + 1]}
    if set(ut["sider"]) != set(TABELL.values()):
        raise SystemExit(f"Fant bare tabellene {ut['sider']}")
    UT.write_text(json.dumps(ut, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Skrev {UT.relative_to(ROOT)}: {len(ut['skoler'])} skoler, sider {ut['sider']}")
    for sid, v in ut["skoler"].items():
        print(f"  {sid:5s}", {a: (x['4*']['n'], x['4']['n'], x['3']['n']) for a, x in v.items()})


if __name__ == "__main__":
    main()
