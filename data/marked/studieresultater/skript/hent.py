#!/usr/bin/env python3
"""B2 – henter rådata fra DBH for ALLE institusjoner og ALLE studieprogram (2019–2025) til kilder/.

Spørringene er nasjonale (ingen institusjonsfilter) og grupperer på institusjon × år × studieprogram.
Høyst to samtidige forespørsler. Rå svar caches som kilder/<navn>.json.gz; bulk-tabeller som kilder/bulk_<tabell>.csv.gz.

Tabeller:
  123  Registrerte studenter (vår og høst)                      → r123
  110  Nye studenter (vår og høst)                               → r110
  104  Ferdige kandidater (vår og høst)                          → r104
  335  Studiepoeng planlagt/gjennomført iht. utdanningsplan       → r335
  707  Gjennomføring og frafall per startkull, totalt og kvinner  → k707t, k707kv  (startår 2012–2024)
  60   Alder, høst: total + fire grupper via alder-FILTER         → a60_total, a60_a21, a60_a24, a60_a29, a60_a30
  135  Utenlandske studenter, høst                                → u135
  142  Utveksling ut (Type NORSK) per program; inn (UTENL) per institusjon → x142ut, x142inn
  900  Studiepoeng per studentens program og studentens finansieringskategori → sp900 (2019–2025)
       og per studentens program og EMNETS kategori → sp900e (2019–2022, gammelt system A–F)
  Bulk: 347 (studieprogramregisteret), 211 (institusjoner), 908 (satser), 252 (kategorier), 210 (avdelinger),
        907 (kandidater med uttelling i det gamle finansieringssystemet, t.o.m. 2022)

Bruk:
  python3 data/marked/studieresultater/skript/hent.py [--refresh] [navn ...]
"""
import argparse
import sys
from concurrent.futures import ThreadPoolExecutor

import dbh

AAR = ("2019", "2025")
KULL = ("2012", "2024")
P = ["Institusjonskode", "Årstall", "Studieprogramkode"]
PS = ["Institusjonskode", "Årstall", "Semester", "Studieprogramkode"]
H = ("Semester", "item", ["3"])


def yr(a=AAR):
    return ("Årstall", "between", list(a))


SPORRINGER = {
    "r123": dbh.body(123, PS, [yr()]),
    "r110": dbh.body(110, PS, [yr()]),
    "r104": dbh.body(104, PS, [yr()]),
    "r335": dbh.body(335, P, [yr()]),
    "k707t": dbh.body(707, ["Institusjonskode", "Årstall", "Studieprogramkode", "Nivåkode", "Årstall normert tid"], [yr(KULL)]),
    "k707kv": dbh.body(707, ["Institusjonskode", "Årstall", "Studieprogramkode", "Nivåkode", "Årstall normert tid"],
                       [yr(KULL), ("Kjønnkode", "item", ["1"])]),
    "a60_total": dbh.body(60, P, [yr(), H]),
    "a60_a21": dbh.body(60, P, [yr(), H, ("Alder", "between", ["0", "21"])]),
    "a60_a24": dbh.body(60, P, [yr(), H, ("Alder", "between", ["22", "24"])]),
    "a60_a29": dbh.body(60, P, [yr(), H, ("Alder", "between", ["25", "29"])]),
    "a60_a30": dbh.body(60, P, [yr(), H, ("Alder", "between", ["30", "99"])]),
    "u135": dbh.body(135, P, [yr(), H]),
    "x142ut": dbh.body(142, P, [yr(), ("Type", "item", ["NORSK"])]),
    "x142inn": dbh.body(142, ["Institusjonskode", "Årstall"], [yr(), ("Type", "item", ["UTENL"])]),
    "sp900": dbh.body(900, ["Institusjonskode", "Årstall", "Progkode student", "Finmodkode student"], [yr()]),
    # Gammelt system (til og med produksjonsår 2022): kategorien fulgte emnet
    "sp900e": dbh.body(900, ["Institusjonskode", "Årstall", "Progkode student", "Finmodekode emne"], [yr(("2019", "2022"))]),
}
BULK = [347, 211, 908, 252, 210, 907]


def kjor(navn, refresh):
    rader, st = dbh.hent(navn, SPORRINGER[navn], refresh)
    return navn, len(rader), st.get("melding")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("navn", nargs="*")
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    navn = a.navn or list(SPORRINGER)
    for t in BULK:
        dbh.bulk(t, a.refresh)
    with ThreadPoolExecutor(max_workers=2) as ex:
        for n, ant, mld in ex.map(lambda x: kjor(x, a.refresh), navn):
            print(f"{n}: {ant} rader – {mld}", file=sys.stderr)


if __name__ == "__main__":
    main()
