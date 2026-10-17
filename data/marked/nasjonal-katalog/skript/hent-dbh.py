#!/usr/bin/env python3
"""Henter DBH-tabellene den nasjonale programkatalogen bygger på, for ALLE institusjoner.

Kilde: DBHs åpne API (HK-dir), POST https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData.
Ingen nøkkel. Variabellisten per tabell står i kilder/dbh_tabellkatalog_variabler.csv (rptNr=002).

Tabeller (rådata caches gzip-komprimert i kilder/dbh/):
  211  Institusjon            institusjonsregister (navn, type, gyldig fra/til, sammenslått)   -> 211.json.gz
  210  Avdeling               avdeling -> fakultet (Fakultetskode/Fakultetsnavn)                -> 210.json.gz
  347  Studieprogram          alle program, alle institusjoner, vår+høst 2021–2026              -> 347_<år>_<sem>.json.gz
  370  Studieplasser          programmer i nasjonalt opptak (Opptakstype N): «Studietypekode» er
                              Samordnas studieprogramnummer. Gir koblingen DBH-kode <-> SO-studiekode
                              (SO-studiekode = SO-institusjonsnummer + studieprogramnummer).   -> 370_<år>.json.gz
  379  Søkertall og møtte     søknadsalternativer, kvalifiserte, tilbud, akseptert, møtt per program,
                              både lokale (L) og nasjonale (N) opptak, 2021–2025 (2026 kommer i DBH
                              i februar/mars 2027). To spørringer per år: alle prioriteter, og
                              prioritet 1 (førstevalg).                                          -> 379_<år>.json.gz, 379fv_<år>.json.gz

Høflighet: én spørring om gangen, ett sekunds pause mellom faktiske nettverkskall.

Bruk:
  python3 data/marked/nasjonal-katalog/skript/hent-dbh.py [--refresh]
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from felles import KILDER, dbh, flt  # noqa: E402

UT = KILDER / "dbh"
AAR_347 = ["2021", "2022", "2023", "2024", "2025", "2026"]
AAR_370 = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"]
AAR_379 = ["2021", "2022", "2023", "2024", "2025", "2026"]

V347 = ["Institusjonskode", "Avdelingskode", "Årstall", "Semester", "Studieprogramkode", "Studiumkode", "Nivåkode",
        "Studiepoeng", "NUS-kode", "Andel av heltid", "Videreutd.", "Tilbys fra", "Tilbys til", "Organisering_kode",
        "Underv.språk", "Prosent egenfinansiering", "Finansierings-kategori", "Nytt studietilbud"]


def base(tabell: int, kodetekst: str = "J") -> dict:
    return {"tabell_id": tabell, "api_versjon": 1, "statuslinje": "J", "kodetekst": kodetekst,
            "desimal_separator": "."}


def main(refresh: bool) -> None:
    n = 0
    # 211 institusjoner
    q = base(211) | {"variabler": ["*"], "filter": [flt("Institusjonskode", ["*"], "all")]}
    r = dbh(q, UT / "211.json.gz", refresh); n += 1
    print(f"211: {len(r)} institusjoner")
    # 210 avdelinger
    q = base(210) | {"variabler": ["*"], "filter": [flt("Institusjonskode", ["*"], "all")]}
    r = dbh(q, UT / "210.json.gz", refresh); n += 1
    print(f"210: {len(r)} avdelinger")
    # 347 studieprogram
    for aar in AAR_347:
        for sem in ("1", "3"):
            q = base(347) | {"variabler": V347,
                             "filter": [flt("Årstall", [aar]), flt("Semester", [sem])]}
            try:
                r = dbh(q, UT / f"347_{aar}_{sem}.json.gz", refresh)
            except RuntimeError as e:
                print(f"347 {aar}/{sem}: {e}")
                continue
            print(f"347 {aar}/{sem}: {len(r)} program")
    # 370 studieplasser, nasjonalt opptak
    for aar in AAR_370:
        q = base(370) | {"groupBy": ["Institusjonskode", "Årstall", "Semester", "Studieprogramkode", "Opptakstype",
                                     "Opptaksmodellkode", "Studietypekode", "Utdanningsområde"],
                         "filter": [flt("Årstall", [aar]), flt("Opptakstype", ["N"])]}
        r = dbh(q, UT / f"370_{aar}.json.gz", refresh)
        print(f"370 {aar}: {len(r)} rader")
    # 379 søkertall
    for aar in AAR_379:
        q = base(379, "N") | {"groupBy": ["Institusjonskode", "Årstall", "Semester", "Studieprogramkode", "Opptakstype",
                                          "Kvalifisert"],
                              "filter": [flt("Årstall", [aar])]}
        r = dbh(q, UT / f"379_{aar}.json.gz", refresh)
        q = base(379, "N") | {"groupBy": ["Institusjonskode", "Årstall", "Semester", "Studieprogramkode", "Opptakstype",
                                          "Kvalifisert"],
                              "filter": [flt("Årstall", [aar]), flt("Prioritet", ["1"])]}
        r2 = dbh(q, UT / f"379fv_{aar}.json.gz", refresh)
        print(f"379 {aar}: {len(r)} rader, førstevalg {len(r2)} rader")


if __name__ == "__main__":
    main("--refresh" in sys.argv)
