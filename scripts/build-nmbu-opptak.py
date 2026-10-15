#!/usr/bin/env python3
"""Bygger kilde/public/nmbu-opptak.json: opptakskvalitet og kravkode per studieprogram ved NMBU, til fanen
«Opptak per studieprogram» i «Alle emner ved NMBU».

Kilder:
  DBH tabell 571 «Gjennomsnittlige opptakspoeng for søkere» (institusjon 1173, høstopptak): summer av opptakspoeng
    og karakterpoeng og antall søkere per program, opptakstype (N = Samordna opptak, L = lokalt) og om søkeren
    møtte til studiestart. Snitt = sum / antall. Lokalt opptak (toårige master) har ikke poeng i tabellen.
  Samordna opptak, poenggrenser i hovedopptaket: data/hh/kilder/so_poenggrenser_2020-2026_*.csv (Tableau-eksport).
  Samordna opptak, søkerportalens åpne søke-API (https://sok.samordnaopptak.no/api/v1/search): kravkode (reqCode),
    studiekode og poenggrenser (etter supplering; reserve) per studium og opptaksår, og forklaringen på hver kravkode
    (/api/v1/translations/kompetanseregelverk/<kode>/nb-NO).

SO-studiekoden kobles til DBHs studieprogramkode på navn og studienivå (B- = bachelor, M- = master, ellers
årsstudium/profesjonsstudium), med noen faste koblinger der navnene er ulike (KOBLING_MANUELL).

Bruk:
  python3 scripts/build-nmbu-opptak.py [--refresh]
"""
import argparse
import collections
import csv
import datetime as dt
import html
import importlib.util
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("blc", ROOT / "scripts" / "build-landsam-courses.py")
blc = importlib.util.module_from_spec(spec); spec.loader.exec_module(blc)

CACHE = ROOT / "data" / "nmbu" / "kilder" / "opptak-cache"
OUT = ROOT / "kilde" / "public" / "nmbu-opptak.json"
PG_CSV = ROOT / "data" / "hh" / "kilder" / "so_poenggrenser_2020-2026_hentet_2026-09-22.csv"
INST, SO_INST = "1173", 192
SO_API = "https://sok.samordnaopptak.no/api/v1"
# Opptak i søkerportalen: id → opptaksår (hovedopptak universitet og høgskole)
SO_OPPTAK = {6: "2020", 8: "2021", 10: "2022", 12: "2023", 14: "2024", 16: "2025", 18: "2026"}
# DBH-kode → SO-studiekode der navnet i DBH og hos SO ikke er likt
KOBLING_MANUELL = {"M-LUN": "192843", "M-GEOM": "192813", "M-MPP": "192766", "REALFAG": "192233", "B-MAT": "192203",
                   "VET": "192772"}


def hent_json(url, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method="POST" if body is not None else "GET",
                                 headers={"Content-Type": "application/json", "Accept": "application/json",
                                          "User-Agent": "NMBU-sammenligning (studierådgiverne HH)"})
    with blc._open_url(req, 60) as r:
        return json.load(r)


def cachet(navn, hent, refresh):
    p = CACHE / navn
    if p.exists() and not refresh:
        return json.loads(p.read_text(encoding="utf-8"))
    d = hent()
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, ensure_ascii=False), encoding="utf-8")
    return d


def norm(s):
    return re.sub(r"[^a-zæøå0-9]", "", (s or "").lower())


def tekst(h):
    """HTML-beskrivelse fra SO → ren tekst med punktliste."""
    h = re.sub(r"<li>\s*", "\n• ", h or "")
    h = re.sub(r"<br\s*/?>|</p>", "\n", h)
    t = html.unescape(re.sub(r"<[^>]+>", "", h))
    return re.sub(r"\n\s*\n+", "\n", t).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()

    # ── DBH 571 ──
    q = {"tabell_id": 571, "api_versjon": 1, "statuslinje": "J", "kodetekst": "J", "desimal_separator": ".",
         "groupBy": ["Institusjonskode", "Årstall", "Semester", "Studieprogramkode", "Opptakstype", "Møtt til studiestart"],
         "filter": [{"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [INST]}},
                    {"variabel": "Årstall", "selection": {"filter": "top", "values": ["7"]}}]}
    r571 = blc.fetch_dbh(q, CACHE / "571_1173_7y.json", a.refresh)
    poeng = collections.defaultdict(lambda: collections.defaultdict(dict))  # program → år → {mott|alle: [n, opptak, karakter]}
    dbh_navn = collections.defaultdict(set)
    for x in r571:
        if x.get("Semester") != "3" or x.get("Opptakstype") != "N":
            continue
        pk, aar = x["Studieprogramkode"], x["Årstall"]
        dbh_navn[pk].add(x.get("Studieprogramnavn") or "")
        n = int(float(x.get("Søkere totalt") or 0))
        op, kp = float(x.get("Opptakspoeng totalt") or 0), float(x.get("Karakterpoeng") or 0)
        for nokkel in (["mott", "alle"] if x["Møtt til studiestart"] == "1" else ["alle"]):
            v = poeng[pk][aar].get(nokkel, [0, 0.0, 0.0])
            poeng[pk][aar][nokkel] = [v[0] + n, round(v[1] + op, 1), round(v[2] + kp, 1)]
    lokale = sorted({x["Studieprogramkode"] for x in r571 if x.get("Opptakstype") == "L"} - set(poeng))

    # ── Samordna opptak ──
    so = {}  # studiekode → {navn, type, url, krav: {år: kode}, grenser: {år: {ORD, ORDF}}}
    for oid, aar in SO_OPPTAK.items():
        d = cachet(f"so_{oid}_{SO_INST}.json", lambda: hent_json(f"{SO_API}/search", {
            "filter": [{"term": {"admission.id": oid}}, {"term": {"institution.institutionNumber": SO_INST}}],
            "from": 0, "size": 300}), a.refresh)
        for s in d.get("data", []):
            k = s["studyProgrammeInstitutionCode"]
            e = so.setdefault(k, {"navn": s["names"]["NB"], "type": s["studyProgrammeType"]["name"], "url": s.get("url"),
                                  "krav": {}, "grenser": {}})
            e["navn"], e["type"], e["url"] = s["names"]["NB"], s["studyProgrammeType"]["name"], s.get("url") or e["url"]
            e["krav"][aar] = s.get("reqCode")
            for kv in (s.get("quotaPointLimits") or {}).get("quotas", []):
                for g in kv.get("admissionsSorted", []):
                    ga = SO_OPPTAK.get(g["id_admission"])
                    if ga and kv["id_quota"] in ("ORD", "ORDF"):
                        e["grenser"].setdefault(ga, {})[kv["id_quota"]] = g.get("pointLimit")

    # Poenggrensene: hovedopptaket fra SOs Tableau-eksport (offisiell grense). Søkerportalens API gir grensen etter
    # suppleringsopptaket og brukes bare der eksporten mangler året. 0 = alle kvalifiserte, -1 = kvoten ikke brukt.
    hoved = collections.defaultdict(dict)
    with open(PG_CSV, encoding="utf-8") as fh:
        for rad in csv.DictReader(fh, delimiter=";"):
            if rad["Opptaksrunde"] == "Hovedopptak":
                v = float(rad["Poenggrense"].replace(",", "."))
                hoved[(rad["Studiekode"].replace(" ", ""), rad["År"])]["ORD" if rad["Kvote"] == "Ordinær kvote" else "ORDF"] = None if v == -1 else v
    for k, e in so.items():
        for (sk, y), g in hoved.items():
            if sk == k:
                e["grenser"][y] = g

    def niva_ok(pk, sotype):
        if pk.startswith("B-"):
            return sotype == "Bachelor"
        if pk.startswith("M-"):
            return sotype == "Master"
        return sotype not in ("Bachelor", "Master")

    kobling, ukoblet = {}, []
    for pk in sorted(poeng):
        if pk in KOBLING_MANUELL:
            kobling[pk] = KOBLING_MANUELL[pk]; continue
        treff = [k for k, e in so.items() if niva_ok(pk, e["type"]) and norm(e["navn"]) in {norm(n) for n in dbh_navn[pk]}]
        if len(treff) == 1:
            kobling[pk] = treff[0]
        else:
            ukoblet.append((pk, sorted(dbh_navn[pk]), treff))

    koder = sorted({k for e in so.values() for k in e["krav"].values() if k})
    forklaring = {}
    for k in koder:
        t = cachet(f"krav_{k}.json", lambda: hent_json(f"{SO_API}/translations/kompetanseregelverk/{urllib.parse.quote(k)}/nb-NO"), a.refresh)
        forklaring[k] = {"navn": t.get("navn") or k, "tekst": tekst(t.get("beskrivelse"))}

    programmer = {}
    for pk, aar in poeng.items():
        sk = kobling.get(pk)
        e = so.get(sk) if sk else None
        programmer[pk] = {
            "navn": sorted(dbh_navn[pk])[-1], "opptak": "N",
            "soKode": sk, "soNavn": e["navn"] if e else None, "url": e["url"] if e else None,
            "krav": e["krav"] if e else {}, "grenser": e["grenser"] if e else {},
            # per år: [antall, sum opptakspoeng, sum karakterpoeng] for dem som møtte og for alle søkere
            "poeng": {y: {"mott": v.get("mott"), "alle": v.get("alle")} for y, v in sorted(aar.items())},
        }
    for pk in lokale:
        programmer[pk] = {"opptak": "L"}

    ut = {"generert": dt.date.today().isoformat(),
          "kilde": "DBH/HKDIR tabell 571 (gjennomsnittlige opptakspoeng, høstopptak) og Samordna opptak (søkerportalen: kravkode, poenggrenser)",
          "aar": sorted({y for v in poeng.values() for y in v}), "kravkoder": forklaring, "programmer": programmer}
    OUT.write_text(json.dumps(ut, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)}: {len(poeng)} program med SO-opptak ({len(kobling)} koblet til SO), {len(lokale)} med lokalt opptak, "
          f"{len(koder)} kravkoder, {OUT.stat().st_size // 1024} kB")
    for pk, navn, treff in ukoblet:
        print(f"  ikke koblet: {pk} {navn} → {treff}")


if __name__ == "__main__":
    main()
