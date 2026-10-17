"""Felles innlesing for A1 (bachelorlandskapet i økonomi og administrasjon).

Leser
  - Samordna søkertall 2021–2026 (programnivå, grunndata tabell 2) og poenggrenser 2020–2026 (Tableau-CSV)
    fra den eksisterende cachen i data/hh/kilder/ (hentet 22.09.2026),
  - Samordnas programkatalog 2021–2026 (søke-API-et, cache i data/nmbu/kilder/samordna-katalog/),
  - DBH 347/379/123/104 fra ../kilder/dbh/ (hentet av hent_*.py i denne mappa).
Ingenting her skriver til repoet utenfor data/marked/bachelor-okonomi/.
"""
import csv
import glob
import gzip
import json
import os
import re
from collections import defaultdict

UT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(UT)))
KILDER = os.path.join(UT, "kilder")
SO_SOKER = os.path.join(ROOT, "data/hh/kilder/so_sokertall_programnivaa_2021-2026_hentet_2026-09-22.json")
SO_PG = os.path.join(ROOT, "data/hh/kilder/so_poenggrenser_2020-2026_hentet_2026-09-22.csv")
SO_KAT = os.path.join(ROOT, "data/nmbu/kilder/samordna-katalog")
AAR_SO = [str(y) for y in range(2021, 2027)]
AAR_PG = [str(y) for y in range(2020, 2027)]
AAR_DBH = [str(y) for y in range(2021, 2026)]  # 2026 er ikke rapportert for høsten ennå

# Samordnas institusjonsnummer (tre første siffer i studiekoden) -> DBH-institusjonskode(r)
SO_INST = {
    "150": ["1260"], "184": ["1120"], "185": ["1110"], "186": ["1130"], "190": ["8221"], "191": ["1240"],
    "192": ["1173"], "194": ["1150"], "201": ["1171"], "203": ["0238"], "204": ["1174"], "209": ["0264", "1177"],
    "211": ["0232"], "215": ["1175"], "217": ["1160"], "222": ["1176"], "223": ["0236"], "224": ["0256"],
    "251": ["8208"], "254": ["8223"],
}
# Kortnavn per DBH-institusjon (INN 0264 -> 1177 fra 2025 slås sammen)
KORT = {
    "1260": "NIH", "1120": "UiB", "1110": "UiO", "1130": "UiT", "1240": "NHH", "1173": "NMBU", "1150": "NTNU",
    "1171": "UiA", "0238": "HVL", "1174": "Nord", "0264": "INN", "1177": "INN", "0232": "HiMolde", "1175": "OsloMet",
    "1160": "UiS", "1176": "USN", "0236": "HVO", "0256": "HiØ", "8208": "VID", "8223": "NLA", "8241": "BI",
    "8253": "Kristiania", "1407": "ONH", "8247": "HGUt", "8221": "MF",
}
SAMME_INST = {"0264": "1177"}
PRIVATE = {"8241", "8253", "1407", "8247", "8223", "8208", "8221"}


def tall(v):
    if v is None:
        return None
    s = str(v).replace("\xa0", "").replace(" ", "").replace("%", "").replace(",", ".")
    if s in ("", "-"):
        return None
    try:
        f = float(s)
    except ValueError:
        return None
    return int(f) if f.is_integer() and "%" not in str(v) else f


def les_so_sokertall():
    """studiekode -> {institusjon, navn(er), sted, utdanningstype, maal: {nøkkeltall: {år: tall}}}"""
    rader = json.load(open(SO_SOKER, encoding="utf-8"))
    ut = {}
    for r in rader:
        k = r["Studie- kode"]
        p = ut.setdefault(k, {"studiekode": k, "institusjon": r["Institusjon"], "navn": [], "steder": [],
                              "utdanningstype": r["Utdannings- type"], "maal": defaultdict(dict)})
        if r["Studienavn"] not in p["navn"]:
            p["navn"].append(r["Studienavn"])
        if r["Studie- sted"] not in p["steder"]:
            p["steder"].append(r["Studie- sted"])
        for y in AAR_SO:
            v = tall(r.get(y))
            if v is not None:
                p["maal"][r["Nøkkeltall"]][y] = v
    return ut


def les_poenggrenser():
    """studiekode -> {'ord': {år: grense}, 'fv': {...}} (hovedopptak) + 'ord_s'/'fv_s' (suppleringsopptak)"""
    ut = defaultdict(lambda: defaultdict(dict))
    with open(SO_PG, encoding="utf-8") as f:
        for r in csv.DictReader(f, delimiter=";"):
            k = r["Studiekode"].replace(" ", "")
            kv = "ord" if r["Kvote"].startswith("Ordinær") else "fv"
            if r["Opptaksrunde"] != "Hovedopptak":
                kv += "_s"
            v = tall(r["Poenggrense"])
            if v is not None:
                ut[k][kv][r["År"]] = float(v)
    return ut


def les_katalog():
    """studiekode -> {år: post} fra Samordnas søke-API (cache)."""
    kat = defaultdict(dict)
    for y in range(2016, 2027):
        p = os.path.join(SO_KAT, f"{y}.json.gz")
        if not os.path.exists(p):
            continue
        for x in json.load(gzip.open(p, "rt", encoding="utf-8"))["data"]:
            kat[x["studyProgrammeInstitutionCode"]][str(y)] = x
    return kat


def _dbh(navn):
    return json.load(gzip.open(os.path.join(KILDER, "dbh", navn + ".json.gz"), "rt", encoding="utf-8"))["data"]


def les_347():
    """(inst, kode) -> siste rad (høyeste år/semester) + 'aar' (år med registrering). Alle nivå i cachen."""
    ut = {}
    for f in sorted(glob.glob(os.path.join(KILDER, "dbh", "347_*.json.gz"))):
        for r in json.load(gzip.open(f, "rt", encoding="utf-8"))["data"]:
            key = (r["Institusjonskode"], r["Studieprogramkode"])
            p = ut.get(key)
            if p is None:
                p = ut[key] = {"rad": r, "aar": set()}
            p["aar"].add(r["Årstall"])
            if (r["Årstall"], r["Semester"]) >= (p["rad"]["Årstall"], p["rad"]["Semester"]):
                p["rad"] = r
    return ut


def les_379():
    """(inst, kode) -> {år: {opptakstype: {...}}}"""
    ut = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(int))))
    for y in AAR_SO:
        for r in _dbh(f"379_tot_{y}"):
            a = ut[(r["Institusjonskode"], r["Studieprogramkode"])][y][r["Opptakstype"]]
            n = int(r.get("Søknadsalternativer") or 0)
            a["alle"] += n
            if r.get("Kvalifisert") == "1":
                a["kvalifiserte"] += n
            a["tilbud"] += int(r.get("Tilbud om opptak") or 0)
            a["akseptert"] += int(r.get("Akseptert tilbud") or 0)
            a["mott"] += int(r.get("Møtt til studiestart") or 0)
        for r in _dbh(f"379_prio1_{y}"):
            ut[(r["Institusjonskode"], r["Studieprogramkode"])][y][r["Opptakstype"]]["fv"] += int(r.get("Søknadsalternativer") or 0)
        for r in _dbh(f"379_prio1_kjonn_{y}"):
            a = ut[(r["Institusjonskode"], r["Studieprogramkode"])][y][r["Opptakstype"]]
            a["fv_k" if r.get("Kjønn") == "1" else "fv_m"] += int(r.get("Søknadsalternativer") or 0)
    return ut


def les_123_104():
    """(inst, kode) -> {'reg': {år: høst}, 'kand': {år: sum}}"""
    ut = defaultdict(lambda: {"reg": {}, "kand": defaultdict(int)})
    for y in AAR_SO:
        for r in _dbh(f"123_{y}"):
            if r.get("Semester") == "3":
                ut[(r["Institusjonskode"], r["Studieprogramkode"])]["reg"][y] = int(r.get("Antall totalt") or 0)
        for r in _dbh(f"104_{y}"):
            ut[(r["Institusjonskode"], r["Studieprogramkode"])]["kand"][y] += int(r.get("Antall totalt") or 0)
    return ut


def norm(s):
    s = s.lower()
    s = re.sub(r"\b(bachelor(studium|studiet|program|gradsstudium)?|bachelorprogram i|i|-|–|,|\(.*?\))\b", " ", s)
    s = re.sub(r"[^a-zæøå0-9 ]", " ", s)
    return " ".join(s.split())
