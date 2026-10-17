#!/usr/bin/env python3
"""Henter DBH-tabeller for handelshøyskoleprofilene (A3) til kilder/dbh/.

Kilde: DBH-API (HK-dir), https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData (POST, åpent).
Gjenbruker cachen i data/nmbu/kilder/dbh-fagmiljo/ (225/123/373/374/900/210/347) der den finnes; her hentes bare
det som mangler: tabell 211 (institusjoner), 101 (avlagte doktorgrader per avdeling og program), 347 (programnavn for
ph.d.-programmene) og fagmiljøtabellene for institusjoner som ikke er i cachen (ONH).

Bruk:
  python3 data/marked/handelshoyskoler/dbh_hent.py            # bruker cache
  python3 data/marked/handelshoyskoler/dbh_hent.py --refresh
Maks én forespørsel om gangen, med pause mellom kallene.
"""
import argparse
import json
import ssl
import sys
import time
import urllib.request
from pathlib import Path

HER = Path(__file__).resolve().parent
CACHE = HER / "kilder" / "dbh"
URL = "https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData"


def ctx():
    try:
        return ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    except Exception:
        return ssl.create_default_context()


def hent(navn, body, refresh=False):
    f = CACHE / navn
    if f.exists() and not refresh:
        return json.loads(f.read_text(encoding="utf-8"))
    req = urllib.request.Request(URL, data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
                                 headers={"Content-Type": "application/json"}, method="POST")
    print(f"  [nett] {navn}", file=sys.stderr)
    with urllib.request.urlopen(req, timeout=300, context=ctx()) as r:
        tekst = r.read().decode("utf-8")
    try:
        data = json.loads(tekst)
    except json.JSONDecodeError:
        # DBH svarer med tom kropp når spørringen ikke gir rader (f.eks. ingen doktorgrader)
        data = [{"status": {"melding": "Tomt svar fra DBH (ingen rader)", "tabell_id": body["tabell_id"]}}]
    CACHE.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    time.sleep(1.0)
    return data


def q(tid, inst=None, group_by=None, variabler=None, extra=None, aar=None, kodetekst="N"):
    f = []
    if inst:
        f.append({"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [inst]}})
    if aar:
        f.append({"variabel": "Årstall", "selection": {"filter": "between", "values": list(aar)}})
    f += extra or []
    b = {"tabell_id": tid, "api_versjon": 1, "statuslinje": "J", "kodetekst": kodetekst, "desimal_separator": ".",
         "filter": f}
    if group_by:
        b["groupBy"] = group_by
    if variabler:
        b["variabler"] = variabler
    return b


INST = ["1240", "8241", "1173", "1171", "1160", "1174", "1150", "1176", "1175", "1130", "0238", "1177", "0264",
        "0232", "8253", "0256", "8223", "1110", "1120"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    ap.add_argument("--ekstra", nargs="*", default=[], help="institusjonskoder som også skal ha fagmiljøtabellene")
    a = ap.parse_args()
    hent("211_institusjoner.json", q(211, variabler=["*"], kodetekst="J",
                                     extra=[{"variabel": "Institusjonskode", "selection": {"filter": "all", "values": ["*"]}}]),
         a.refresh)
    for inst in INST + a.ekstra:
        hent(f"101_{inst}.json", q(101, inst, ["Årstall", "Avdelingskode", "Studieprogramkode"], aar=("2016", "2025")),
             a.refresh)
    for inst in a.ekstra:
        hent(f"225_{inst}.json", q(225, inst, ["Årstall", "Avdelingskode", "Stillingskode"], aar=("2019", "2025")), a.refresh)
        hent(f"123_{inst}.json", q(123, inst, ["Årstall", "Avdelingskode"], aar=("2019", "2025"),
                                   extra=[{"variabel": "Semester", "selection": {"filter": "item", "values": ["3"]}}]), a.refresh)
        hent(f"373_{inst}.json", q(373, inst, ["Årstall", "Avdelingskode"], aar=("2019", "2025")), a.refresh)
        hent(f"374_{inst}.json", q(374, inst, ["Årstall", "Avdelingskode", "Kvalitetsniva"], aar=("2019", "2025")), a.refresh)
        hent(f"900_{inst}.json", q(900, inst, ["Årstall", "Avdkode emne"], aar=("2019", "2025")), a.refresh)
        hent(f"210_{inst}.json", q(210, inst, variabler=["Institusjonskode", "Avdelingskode", "Fakultetskode",
                                                         "Fakultetsnavn", "Gyldig fra", "Gyldig til"]), a.refresh)
    # Ph.d.-programmene (347, nivå FU = forskerutdanning, med kodetekst for program- og avdelingsnavn)
    for inst in INST + a.ekstra:
        hent(f"347fu_{inst}.json", q(347, inst, variabler=["Institusjonskode", "Avdelingskode", "Studieprogramkode",
                                                           "Nivåkode", "Årstall"], aar=("2016", "2026"), kodetekst="J",
                                     extra=[{"variabel": "Nivåkode", "selection": {"filter": "item", "values": ["FU"]}}]),
             a.refresh)


if __name__ == "__main__":
    main()
