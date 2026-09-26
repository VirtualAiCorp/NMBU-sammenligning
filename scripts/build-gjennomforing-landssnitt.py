#!/usr/bin/env python3
"""Nasjonal referanse for gjennomføringskortet: hvor stor andel som fullfører innen normert tid (og normert + 2 år),
per studium/fagfelt, hele landet → kilde/public/gjennomforing/landssnitt.json (lastes lat).

Kilder (SSB, JSON-stat2, cache i data/nmbu/kilder/ssb-gjennomforing/):
  14957  Gjennomføring for nye studenter på bachelorutdanninger, etter fagfelt, hele landet. Normert tid er 3 år.
  14958  Gjennomføring for nye studenter på 5-årige masterutdanninger, etter studium, hele landet. Normert tid er 5 år.
Begge tabeller har «FullforingStatus»-kategorier som IKKE er kumulative: «Fullført innen 3/5 år» er de som fullførte
innen normert tid, mens «Fullført innen 5/7 år» er BARE dem som fullførte i tillegg, i de to ekstra årene (kontrollert
mot 14958: 54M har 68,7 % innen 5 år og 3 % til innen 7 år – 3 % kan ikke være kumulativt med 68,7 %, siden 71,7 % <
68,7 % + 3 % er riktig og 3 % alene ville vært et fall fra 68,7 %). «andelNormertPluss» i utfila er derfor summen av
de to andelene.

Koblingen fra NMBUs programgrupper (kilde/src/app/data/<fak>AdmissionData.json, groups[].id) til riktig studium/
fagfelt er kuratert for hånd i data/nmbu/gjennomforing-landssnitt-kobling.json, med begrunnelse og kvalitetsmerking
(«sikker» / «grov» / «ikke dekket» for 2-årige masterprogrammer, som 14957/14958 ikke dekker).

Bruk: python3 scripts/build-gjennomforing-landssnitt.py [--refresh]
"""
import argparse
import datetime as dt
import itertools
import json
import ssl
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data" / "nmbu" / "kilder" / "ssb-gjennomforing"
KOBLING = ROOT / "data" / "nmbu" / "gjennomforing-landssnitt-kobling.json"
OUT = ROOT / "kilde" / "public" / "gjennomforing" / "landssnitt.json"

FAK = ["hh", "landsam", "realtek", "biovit", "kbm", "mina", "vet"]

# Normert tid per SSB-tabell: hvilken FullforingStatus-kode som er normert, og hvilken som er "normert + 2 år"-tillegget.
TABELLER = {
    "14957": {"normert_kode": "03", "normert_tekst": "3 år", "pluss_kode": "05", "pluss_tekst": "5 år (normert + 2 år)", "nivaa": "bachelor"},
    "14958": {"normert_kode": "05", "normert_tekst": "5 år", "pluss_kode": "07", "pluss_tekst": "7 år (normert + 2 år)", "nivaa": "master5"},
}


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
    """Returnerer (verdier, id_rekkefølge). Tabellene bruker ikke samme rekkefølge på dimensjonene (14957 har
    Studium først, 14958 har FullforingStatus først), så id-rekkefølgen må slås opp per tabell, ikke antas."""
    dims = [list(d["dimension"][i]["category"]["index"]) for i in d["id"]]
    return dict(zip(itertools.product(*dims), d["value"])), d["id"]


def slaa_opp(verdier, id_rekkefolge, **navngitt):
    """navngitt bruker dimensjonskodene i d['id'] som nøkler, f.eks. Studium='012b', FullforingStatus='03'."""
    nokkel = tuple(navngitt[i] for i in id_rekkefolge)
    return verdier.get(nokkel)


def sel(code, vals):
    return {"code": code, "selection": {"filter": "item", "values": vals}}


def siste_intervall(d):
    return list(d["dimension"]["Tid"]["category"]["index"])[-1]


def hent_tabell(tabellnr, studiekoder, refresh):
    t = TABELLER[tabellnr]
    # Hent metadata først for å finne alle årsintervall (tabellene bruker «2020-2025»-notasjon, ikke enkeltår),
    # og be så om data for alle intervall. Siste intervall i lista brukes.
    meta = json.loads(urllib.request.urlopen(urllib.request.Request(f"https://data.ssb.no/api/v0/no/table/{tabellnr}"), context=ctx(), timeout=60).read())
    alle_aar = [v["values"] for v in meta["variables"] if v["code"] == "Tid"][0]
    d = hent(tabellnr,
             [sel("FullforingStatus", [t["normert_kode"], t["pluss_kode"]]),
              sel("Kjonn", ["0"]),
              sel("Studium", studiekoder),
              sel("ContentsCode", ["StudenterProsent"]),
              sel("Tid", alle_aar)],
             f"{tabellnr}_data.json", refresh)
    intervall = siste_intervall(d)
    verdier, id_rekkefolge = celler(d)
    return verdier, id_rekkefolge, intervall


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()

    kobling = json.load(open(KOBLING, encoding="utf-8"))
    labels = kobling["ssbStudiumLabel"]

    # Hvilke studiekoder trengs fra hver tabell (unike, på tvers av alle fakulteter)?
    trengs = {"14957": set(), "14958": set()}
    for fak in FAK:
        for gid, rad in kobling["fakulteter"].get(fak, {}).items():
            if rad.get("ssbTabell") in trengs:
                trengs[rad["ssbTabell"]].add(rad["ssbStudium"])

    tabelldata = {}
    id_rekkefolge = {}
    intervall = {}
    for tabellnr, koder in trengs.items():
        if not koder:
            continue
        c, idr, iv = hent_tabell(tabellnr, sorted(koder), a.refresh)
        tabelldata[tabellnr] = c
        id_rekkefolge[tabellnr] = idr
        intervall[tabellnr] = iv

    fakulteter_ut = {}
    antall_sikker = antall_grov = antall_ikke_dekket = 0
    stikkprove = {}
    for fak in FAK:
        fakulteter_ut[fak] = {}
        for gid, rad in kobling["fakulteter"].get(fak, {}).items():
            tabellnr = rad.get("ssbTabell")
            studium = rad.get("ssbStudium")
            kvalitet = rad["kvalitet"]
            if kvalitet == "ikke dekket" or not tabellnr or not studium:
                antall_ikke_dekket += 1
                fakulteter_ut[fak][gid] = {
                    "ssbStudium": None, "ssbStudiumLabel": None, "nivaa": None,
                    "andelNormert": None, "andelNormertPluss": None, "andelNormertPlussDefinisjon": None,
                    "kull": None, "koblingKvalitet": kvalitet, "begrunnelse": rad["begrunnelse"],
                }
                continue
            if kvalitet == "sikker":
                antall_sikker += 1
            else:
                antall_grov += 1
            t = TABELLER[tabellnr]
            c = tabelldata[tabellnr]
            idr = id_rekkefolge[tabellnr]
            felles = dict(Studium=studium, Kjonn="0", ContentsCode="StudenterProsent", Tid=intervall[tabellnr])
            normert = slaa_opp(c, idr, FullforingStatus=t["normert_kode"], **felles)
            tillegg = slaa_opp(c, idr, FullforingStatus=t["pluss_kode"], **felles)
            pluss = None if normert is None or tillegg is None else round(normert + tillegg, 1)
            fakulteter_ut[fak][gid] = {
                "ssbStudium": studium,
                "ssbStudiumLabel": labels.get(studium),
                "nivaa": t["nivaa"],
                "andelNormert": normert,
                "andelNormertPluss": pluss,
                "andelNormertPlussDefinisjon": f"Andel fullført innen normert tid ({t['normert_tekst']}) pluss andel som "
                                               f"fullførte i tillegg innen {t['pluss_tekst']}. SSBs kategorier er ikke "
                                               "kumulative i utgangspunktet; de to andelene er lagt sammen her.",
                "kull": intervall[tabellnr],
                "koblingKvalitet": kvalitet,
                "begrunnelse": rad["begrunnelse"],
            }
            if gid in ("oa", "veterinaer", "bygg"):
                stikkprove[f"{fak}.{gid}"] = normert

    ut = {
        "hentet": dt.date.today().isoformat(),
        "kilder": [
            {"navn": "SSB 14957 Gjennomføring for bachelorutdanninger, etter fagfelt (hele landet)",
             "url": "https://www.ssb.no/statbank/table/14957"},
            {"navn": "SSB 14958 Gjennomføring for 5-årige masterutdanninger, etter studium (hele landet)",
             "url": "https://www.ssb.no/statbank/table/14958"},
        ],
        "merknader": [
            "Nasjonal referanse (hele landet), ikke NMBU-tall. Brukes som sammenligningslinje ved siden av DBH 705 "
            "i gjennomføringskortet.",
            "«andelNormert» = andel av nye studenter i kullet som fullførte innen normert tid (3 år for bachelor, "
            "5 år for 5-årig master). «andelNormertPluss» = andelNormert + andelen som fullførte i tillegg innen "
            "normert + 2 år. Se andelNormertPlussDefinisjon per oppføring.",
            "2-årige masterprogrammer er ikke dekket: SSB 14957 (bachelor) og 14958 (5-årig master) har ingen "
            "tilsvarende kategori for dem (koblingKvalitet = «ikke dekket»).",
            "Koblingen fra NMBU-programgruppe til SSB-studium/fagfelt er kuratert for hånd og av varierende "
            "presisjon; se koblingKvalitet og begrunnelse per oppføring, og "
            "data/nmbu/gjennomforing-landssnitt-kobling.json for hele koblingstabellen.",
            "Lisens: SSB, CC BY 4.0. Oppgi Statistisk sentralbyrå som kilde.",
        ],
        "fakulteter": fakulteter_ut,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    json.dump(ut, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

    tot = antall_sikker + antall_grov + antall_ikke_dekket
    print(f"Dekning: {antall_sikker} sikre, {antall_grov} grove, {antall_ikke_dekket} ikke dekket, av {tot} programgrupper totalt.")
    print(f"Stikkprøve andelNormert: {stikkprove}")
    print(f"Skrev {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} kB)")


if __name__ == "__main__":
    main()
