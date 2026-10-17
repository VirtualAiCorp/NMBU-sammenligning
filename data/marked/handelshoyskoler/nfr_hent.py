#!/usr/bin/env python3
"""Forskningsrådets utbetalinger per enhet (fakultet/institutt) for handelshøyskoleprofilene (A3).

Kilde: Forskningsrådet, Prosjektbanken (samme REST-API som nettsiden bruker), åpent:
  https://prosjektbanken.forskningsradet.no/prosjektbanken/rest/explore/statistics
  ?Kilde=FORISS&calcType=funding&distribution=Organisasjon&Ar=<år>&Organisasjon.3=<institusjon>[&Organisasjon.4=<fakultet>]
Tallet er utbetalt beløp i kalenderåret til prosjekter der enheten er prosjektansvarlig (ikke EU, ikke andre BOA-kilder).
NB fra Prosjektbanken: utbetalingene fra 2024 er lavere enn før pga. overgang til bruttobudsjettering, og en stor del
av institusjonenes utbetalinger er ikke fordelt på enhet (ligger på institusjonsnivå). Enhetstallene er minimumstall.

Bruk:
  python3 data/marked/handelshoyskoler/nfr_hent.py [--refresh]
Cache: kilder/prosjektbanken/*.json (én fil per kall). Ett kall om gangen, med pause.
"""
import argparse
import json
import ssl
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

HER = Path(__file__).resolve().parent
CACHE = HER / "kilder" / "prosjektbanken"
REST = "https://prosjektbanken.forskningsradet.no/prosjektbanken/rest/explore/statistics"
AAR = [2021, 2022, 2023, 2024, 2025]

# Nivå 3-navn i Prosjektbanken → DBH-institusjonskode (samme navn som scripts/build-forskning.py bruker)
INST = {
    "NORGES HANDELSHØYSKOLE": "1240", "STIFTELSEN HANDELSHØYSKOLEN BI": "8241",
    "NORGES MILJØ- OG BIOVITENSKAPELIGE UNIVERSITET (NMBU)": "1173", "UNIVERSITETET I AGDER": "1171",
    "UNIVERSITETET I STAVANGER": "1160", "NORD UNIVERSITET": "1174",
    "NORGES TEKNISK-NATURVITENSKAPELIGE UNIVERSITET NTNU": "1150", "UNIVERSITETET I SØRØST-NORGE": "1176",
    "OSLOMET - STORBYUNIVERSITETET": "1175", "UNIVERSITETET I TROMSØ - NORGES ARKTISKE UNIVERSITET": "1130",
    "HØGSKULEN PÅ VESTLANDET": "0238", "UNIVERSITETET I INNLANDET": "1177", "HØGSKOLEN I MOLDE": "0232",
    "HØYSKOLEN KRISTIANIA - ERNST G MORTENSENS STIFTELSE": "8253", "HØGSKOLEN I ØSTFOLD": "0256",
    "NLA HØGSKOLEN AS": "8223", "UNIVERSITETET I OSLO": "1110", "UNIVERSITETET I BERGEN": "1120",
}


def ctx():
    try:
        return ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    except Exception:
        return ssl.create_default_context()


def url(**p):
    return REST + "?" + urllib.parse.urlencode({"Kilde": "FORISS", "calcType": "funding", "Sprak": "no", **p})


def hent(navn, u, refresh=False):
    f = CACHE / navn
    if f.exists() and not refresh:
        return json.loads(f.read_text(encoding="utf-8"))
    print(f"  [nett] {navn}", file=sys.stderr)
    req = urllib.request.Request(u, headers={"User-Agent": "NMBU-sammenligning/1.0 (handelshoyskoleprofiler)"})
    with urllib.request.urlopen(req, timeout=120, context=ctx()) as r:
        d = json.loads(r.read().decode("utf-8"))
    if d["calculations"].get("totalFunding", 0) > 5e10:
        raise SystemExit(f"Filteret ble ignorert for {navn}")
    d["_url"] = u
    CACHE.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps(d, ensure_ascii=False), encoding="utf-8")
    time.sleep(0.6)
    return d


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    for navn, inst in INST.items():
        for y in AAR:
            d = hent(f"niva4_{inst}_{y}.json", url(distribution="Organisasjon", Ar=y, **{"Organisasjon.3": navn}), a.refresh)
            # Nivå 5 for fakultetene (der et institutt bærer handelshøyskolen eller økonomimiljøet)
            for s in d["calculations"]["sums"]:
                if s.get("hasNextLevel") and s["displayName"].upper() in NIVA5.get(inst, set()):
                    slug = "".join(ch for ch in s["displayName"].lower() if ch.isalnum())[:40]
                    hent(f"niva5_{inst}_{slug}_{y}.json",
                         url(distribution="Organisasjon", Ar=y, **{"Organisasjon.3": navn, "Organisasjon.4": s["value"]}),
                         a.refresh)


# Fakulteter der vi også henter instituttnivået
NIVA5 = {
    "1175": {"FAKULTET FOR SAMFUNNSVITENSKAP"},
    "0238": {"FAKULTET FOR TEKNOLOGI, MILJØ- OG SAMFUNNSVITSKAP"},
    "1130": {"FAKULTET FOR BIOVITENSKAP, FISKERI OG ØKONOMI"},
    "0256": {"FAKULTET FOR INFORMASJONSTEKNOLOGI, INGENIØRFAG OG ØKONOMI"},
    "1150": {"FAKULTET FOR ØKONOMI"},
    "1177": {"HANDELSHØGSKOLEN INNLANDET", "FAKULTET FOR ØKONOMI OG SAMFUNNSVITENSKAP",
             "HANDELSHØGSKOLEN INNLANDET - FAKULTET FOR ØKONOMI OG SAMFUNNSVITENSKAP"},
    "1110": {"DET SAMFUNNSVITENSKAPELIGE FAKULTET"},
    "1120": {"DET SAMFUNNSVITENSKAPELIGE FAKULTET"},
    "0232": set(),
}

if __name__ == "__main__":
    main()
