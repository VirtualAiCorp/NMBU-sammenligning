#!/usr/bin/env python3
"""Søkergrunnlaget, del 2: overgang fra videregående til høyere utdanning, og hvor studentene bor
→ kilde/public/sokergrunnlag/overgang.json (lastes lat, samme mappe som ssb.json)

Kilder (SSB, JSON-stat2, cache i data/nmbu/kilder/ssb-overgang/):
  11964  Direkte overgang fra videregående opplæring med studiekompetanse til høyere utdanning samme høst,
         andel (prosent) per fylke, 2016–2025.
  04478  Studenter i høyere utdanning (i Norge og i utlandet), etter bostedsfylke, 2016–2025. Tallet er summert
         over utdanningssted og foreldrenes utdanningsnivå (begge er «elimination»-dimensjoner i tabellen, så de
         summeres automatisk når de ikke velges i spørringen).

Fylkeskoder: samme koder og fylker (2024-inndelingen) som i kilde/public/sokergrunnlag/ssb.json. 11964 bruker en
egen geografi-klassifisering («KOKfylkesregion0000», Klass 232) med 4-sifrede fylkeskommune-koder i stedet for
Region-koden som 04478 og ssb.json bruker. For de nye fylkene (2024-koden) er sammenhengen enkel: Region-koden med
et ekstra «00» bakerst (f.eks. «32» → «3200»), og «Hele landet» er «EAFK» i stedet for «0».

Begge tabeller har bare tall for et fylke i de årene fylket fantes med akkurat den avgrensningen. Østfold, Akershus,
Buskerud, Vestfold, Telemark, Troms og Finnmark ble skilt ut igjen fra Viken/Vestfold og Telemark/Troms og Finnmark
først i 2024, så disse fylkene har bare reelle tall for 2024 og 2025 – tidligere år kommer tilbake som 0 fra SSB og
gjøres om til null her, samme håndtering som build-sokergrunnlag.py bruker for 07459.

Bruk: python3 scripts/build-overgang.py [--refresh]
"""
import argparse
import datetime as dt
import itertools
import json
import ssl
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data" / "nmbu" / "kilder" / "ssb-overgang"
OUT = ROOT / "kilde" / "public" / "sokergrunnlag" / "overgang.json"

# Samme fylker og koder som kilde/public/sokergrunnlag/ssb.json (2024-inndelingen).
FYLKER = {"0": "Hele landet", "31": "Østfold", "32": "Akershus", "03": "Oslo", "34": "Innlandet", "33": "Buskerud", "39": "Vestfold",
          "40": "Telemark", "42": "Agder", "11": "Rogaland", "46": "Vestland", "15": "Møre og Romsdal", "50": "Trøndelag",
          "18": "Nordland", "55": "Troms", "56": "Finnmark"}
AAR = [str(y) for y in range(2016, 2026)]


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


def kok_kode(region):
    """Fylkeskoden i 11964 sin egen geografi-klassifisering (Klass 232): Region-koden + «00», landet er «EAFK»."""
    return "EAFK" if region == "0" else region + "00"


def null_hvis_tomt(v):
    """0 fra SSB for et fylke som ikke fantes det året, betyr «ingen data», ikke et reelt null-tall."""
    return None if v in (None, 0) else v


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    regioner = list(FYLKER)

    # SSB 11964: andel direkte overgang fra videregående til høyere utdanning, per fylke (bosted).
    d11964 = hent("11964",
                  [sel("KOKdirekteoverg0000", ["vg_uh"]),
                   sel("KOKfylkesregion0000", [kok_kode(r) for r in regioner]),
                   sel("ContentsCode", ["KOSandmeddirover0000"]),
                   sel("Tid", AAR)],
                  "11964_overgang.json", a.refresh)
    c11964 = celler(d11964)

    # SSB 04478: studenter i høyere utdanning etter bostedsfylke (i Norge og i utlandet samlet).
    d04478 = hent("04478",
                  [sel("Region", regioner), sel("Tid", AAR)],
                  "04478_studenterBosted.json", a.refresh)
    c04478 = celler(d04478)

    overgang = {}
    studenterBosted = {}
    for r in regioner:
        overgang[r] = {}
        studenterBosted[r] = {}
        kok = kok_kode(r)
        for y in AAR:
            overgang[r][y] = null_hvis_tomt(c11964.get(("vg_uh", kok, "KOSandmeddirover0000", y)))
            studenterBosted[r][y] = null_hvis_tomt(c04478.get((r, "StudenterHoyereUt", y)))

    ut = {
        "hentet": dt.date.today().isoformat(),
        "kilder": [
            {"navn": "SSB 11964 Overganger til og fra videregående opplæring (direkte overgang vg → høyere utdanning)",
             "url": "https://www.ssb.no/statbank/table/11964"},
            {"navn": "SSB 04478 Studenter i høyere utdanning i Norge og i utlandet, etter bostedsfylke",
             "url": "https://www.ssb.no/statbank/table/04478"},
        ],
        "merknader": [
            "«overgang» er andelen (prosent) av avgangselever med studiekompetanse fra videregående som går direkte "
            "videre til høyere utdanning samme høst, målt etter bostedsfylke (SSB 11964).",
            "«studenterBosted» er antall studenter i høyere utdanning (i Norge og i utlandet til sammen) med bosted "
            "i fylket, uavhengig av foreldrenes utdanningsnivå (SSB 04478, summert over disse to variablene).",
            "Østfold, Akershus, Buskerud, Vestfold, Telemark, Troms og Finnmark har bare reelle tall fra 2024 (da "
            "fylkene ble skilt ut igjen fra Viken, Vestfold og Telemark, og Troms og Finnmark). Tidligere år er null.",
            "11964 bruker en egen fylkeskommune-klassifisering (Klass 232) med koder som «3200» i stedet for «32»; "
            "se kok_kode() i skriptet for oversettelsen til fylkeskodene i ssb.json.",
            "Lisens: SSB, CC BY 4.0. Oppgi Statistisk sentralbyrå som kilde.",
        ],
        "fylker": FYLKER,
        "aar": [int(y) for y in AAR],
        "overgang": overgang,
        "studenterBosted": studenterBosted,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    json.dump(ut, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

    dekket_overgang = sum(1 for r in regioner for y in AAR if overgang[r][y] is not None)
    dekket_bosted = sum(1 for r in regioner for y in AAR if studenterBosted[r][y] is not None)
    tot = len(regioner) * len(AAR)
    print(f"Akershus 2025 overgang: {overgang['32']['2025']} % (forventet ca. 30,4). Oslo 2025 studenter bosted: {studenterBosted['03']['2025']}.")
    print(f"Dekning: overgang {dekket_overgang}/{tot} celler, studenterBosted {dekket_bosted}/{tot} celler. "
          f"Skrev {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} kB)")


if __name__ == "__main__":
    main()
