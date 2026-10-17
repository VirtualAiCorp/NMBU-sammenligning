#!/usr/bin/env python3
"""Henter Samordna opptak-kildene for ALLE program i det samordnede opptaket (universitet og høyskole, og
fagskole der Samordna publiserer det).

Kilder (rådata caches uendret i kilder/):
  1. HK-dir/Samordna, «Søker- og tilbudstall fra Samordna opptak til nedlasting»
     (https://hkdir.no/sokertall-fra-samordna-opptak-til-nedlasting, sist oppdatert 23.07.2026). Tabellene er
     statiske HTML-sider med dataene innebygd som JSON (variabelen allData):
       https://sokertallrapport.samordnaopptak.no/2026/figurer/side_0_grunntabeller_hoved/tabeller/<fil>.html
       grunndata_tabell_2_uhg_hoved_26  programnivå, UH, 2021–2026: alle søkere, førstevalg, studieplasser,
                                        andel kvinner blant førstevalg, kvalifiserte, tilbud
       grunndata_tabell_4_uhg_hoved_26  institusjonsnivå, UH (unike søkere per lærested)
       grunndata_tabell_6_uhg_hoved_26  utdanningsområde, UH (unike søkere per område)
       grunndata_tabell_{2,4,6}_hyu_hoved  tilsvarende for fagskolene (høyere yrkesfaglig utdanning)
     -> kilder/sokertallrapport/<fil>.html
  2. SO-datavarehuset (Tableau), «Poenggrenser og ventelistetall hovedopptak/suppleringsopptak», CSV med
     filtrene År=2020–2026 og Opptaksrunde=Hovedopptak,Suppleringsopptak (samme kall som
     scripts/fetch-so-venteliste.py).  -> kilder/so_poenggrenser_venteliste.csv
  3. Samordnas søke-API for søkerportalen, POST https://sok.samordnaopptak.no/api/v1/search (udokumentert,
     ingen innlogging; samme kall som scripts/fetch-samordna-katalog.py). Ett kall per opptaksår
     (admission.id, kontrollert 26.09.2026): gir studieprogramtype, studiepoeng, sektor, kommune, nytt/avlyst,
     planlagte plasser, ledigflagg (bare inneværende år) og SO-institusjonsnummer.
     -> kilder/samordna-sok/<år>.json.gz

Høflighet: ett kall om gangen, 1,5 sekunders pause mellom faktiske kall.

Bruk:
  python3 data/marked/nasjonal-katalog/skript/hent-samordna.py [--refresh]
"""
from __future__ import annotations

import gzip
import json
import sys
import time
import urllib.parse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from felles import KILDER, http  # noqa: E402

RAPPORT = "https://sokertallrapport.samordnaopptak.no/2026/figurer/side_0_grunntabeller_hoved/tabeller/"
TABELLER = ["grunndata_tabell_2_uhg_hoved_26", "grunndata_tabell_4_uhg_hoved_26", "grunndata_tabell_6_uhg_hoved_26",
            "grunndata_tabell_2_hyu_hoved", "grunndata_tabell_4_hyu_hoved", "grunndata_tabell_6_hyu_hoved"]
TABLEAU = ("https://rapport-dv.educloud.no/t/SO-datavarehus/views/"
           "Poenggrenserogventelistetallhovedopptaksuppleringsopptak_16275618215770/Poenggrenserogventelistetall.csv")
SOK_API = "https://sok.samordnaopptak.no/api/v1/search"
ID_TIL_AAR = {6: 2020, 8: 2021, 10: 2022, 12: 2023, 14: 2024, 16: 2025, 18: 2026}


def main(refresh: bool) -> None:
    # 1 søkertallrapporten
    d = KILDER / "sokertallrapport"
    d.mkdir(parents=True, exist_ok=True)
    for t in TABELLER:
        f = d / f"{t}.html"
        if f.exists() and not refresh:
            continue
        f.write_bytes(http(RAPPORT + t + ".html"))
        print(f"hentet {t} ({f.stat().st_size // 1024} kB)")
        time.sleep(1.5)
    # 2 Tableau-CSV
    f = KILDER / "so_poenggrenser_venteliste.csv"
    if refresh or not f.exists():
        url = TABLEAU + "?" + urllib.parse.urlencode({"År": ",".join(str(a) for a in range(2020, 2027)),
                                                      "Opptaksrunde": "Hovedopptak,Suppleringsopptak"})
        raw = http(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=300).decode("utf-8-sig")
        if "Measure Names" not in raw.splitlines()[0]:
            raise SystemExit("Uventet svar fra Tableau")
        f.write_text(raw, encoding="utf-8")
        print(f"hentet Tableau-CSV ({len(raw.splitlines())} linjer)")
        time.sleep(1.5)
    # 3 søke-API-et
    d = KILDER / "samordna-sok"
    d.mkdir(parents=True, exist_ok=True)
    for adm, aar in ID_TIL_AAR.items():
        f = d / f"{aar}.json.gz"
        if f.exists() and not refresh:
            continue
        body = json.dumps({"filter": [{"term": {"admission.id": adm}}], "size": 3000}).encode("utf-8")
        raw = http(SOK_API, body, {"Content-Type": "application/json"}, timeout=120)
        js = json.loads(raw.decode("utf-8"))
        navn = {(p.get("admission") or {}).get("name") for p in js.get("data", [])}
        if navn != {str(aar)}:
            raise SystemExit(f"admission.id {adm} ga opptak {navn}, ventet {aar}")
        with gzip.open(f, "wt", encoding="utf-8") as fh:
            json.dump(js, fh, ensure_ascii=False)
        print(f"hentet søke-API {aar}: {len(js.get('data', []))} program (hitsTotal {js.get('hitsTotal')})")
        time.sleep(1.5)


if __name__ == "__main__":
    main("--refresh" in sys.argv)
