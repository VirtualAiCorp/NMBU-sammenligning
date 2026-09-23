#!/usr/bin/env python3
"""Bolig og studentboliger per studiested → kilde/public/bolig/bolig.json (lastes først når visningen åpnes).

Oppskrift: «Boligmarked + Studentboliger per studiested» (fra sammenligningsportalen), tilpasset NMBU-appen:
alle studiestedene i fakultetenes programkart er med (NMBU og konkurrentene), ikke bare Ås.

Kilder:
  SSB 06035  Kvadratmeterpris og antall omsetninger for selveierboliger per kommune og boligtype (API, JSON-stat2).
             Kommuner som fikk nytt nummer ved fylkesdelingen 1.1.2024 har 2020–2023 under forgjengerkoden
             merket «(2020-2023)» med samme navn og område; de skjøtes sammen. Eldre år for kommuner som ble
             slått sammen i 2020 tas ikke med (annet område).
  SSB 09895  Gjennomsnittlig månedlig leie etter prissone og antall rom (API). Prissonene er brede og kobles
             IKKE til enkeltkommuner, bortsett fra der sonen per definisjon er kommunen eller fylket
             (Oslo og Bærum, Akershus utenom Bærum, Bergen, Trondheim, Stavanger).
  NSO        Studentboligundersøkelsen 2026 (dekningsgrad, hybelenheter), transkribert i portalen:
             data/nmbu/kilder/portalen/nso_studentbolig_2026.json
  Geografi   ~30 min / ~2 timer-nabolister fra portalen (data/nmbu/kilder/portalen/studiested_tiers.json),
             pluss Ås kuratert her (STUDIESTED_TIERS_EGNE). Fylke = alle kommuner med samme fylkesnummer.
             Steder uten kuratert liste får bare egen kommune (radius slås av i visningen).

Bruk:
  python3 scripts/build-bolig.py [--refresh]
"""
import argparse
import datetime as dt
import glob
import itertools
import json
import re
import ssl
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
K = ROOT / "data" / "nmbu" / "kilder"
P = K / "portalen"
OUT = ROOT / "kilde" / "public" / "bolig" / "bolig.json"
SSB = "https://data.ssb.no/api/v0/no/table/"
AAR_KJOP = [str(y) for y in range(2016, 2025)]
AAR_LEIE = [str(y) for y in range(2019, 2026)]

# Ås (3218): kuratert etter kjent geografi. ~30 min: nabokommunene i Follo, Enebakk og Oslo (tog Ås–Oslo S ca. 22 min).
# ~2 timer: resten av Oslo-området, nordre Østfold og Drammen (E6/E18, Østfoldbanen). Anslag, ikke målte reisetider.
STUDIESTED_TIERS_EGNE = {
    "Ås": {
        "30min": ["3218", "3207", "3216", "3214", "3212", "3220", "0301"],
        "2hr_ekstra": ["3201", "3203", "3205", "3222", "3224", "3232", "3209", "3226", "3228",
                       "3103", "3112", "3114", "3105", "3107", "3118", "3301"],
    },
    # Studiestedene portalen ikke har nabolister for, kuratert på samme måte (vei, tog, ferje; anslag, ikke målte reisetider).
    "Alta": {"30min": ["5601"], "2hr_ekstra": ["5603", "5612", "5622"]},
    "Halden": {"30min": ["3101", "3124", "3105"],
               "2hr_ekstra": ["3107", "3110", "3112", "3114", "3116", "3118", "3120", "3122", "3103", "3216", "3218", "0301"]},
    "Hamar": {"30min": ["3403", "3411", "3412", "3413", "3420"],
              "2hr_ekstra": ["3405", "3407", "3401", "3419", "3418", "3422", "3442", "3443", "3440", "3441", "3240", "3209", "0301"]},
    "Horten": {"30min": ["3901", "3903", "3905"],
               "2hr_ekstra": ["3907", "3909", "3911", "3103", "3301", "3312", "3314", "3303", "4001", "4003", "3203", "3201", "0301"]},
    "Kongsberg": {"30min": ["3303", "3314", "3334"],
                  "2hr_ekstra": ["3301", "3312", "3316", "3336", "3332", "4005", "4020", "3901", "3903", "3905", "4003", "3203", "3201", "0301"]},
    "Lillehammer": {"30min": ["3405", "3440", "3441", "3411"],
                    "2hr_ekstra": ["3403", "3407", "3413", "3412", "3420", "3439", "3438", "3442", "3443", "3448", "3447"]},
    "Midt-Telemark": {"30min": ["4020", "4018", "4022"],
                      "2hr_ekstra": ["4003", "4001", "4005", "4012", "4010", "4014", "4016", "4024", "4026", "4028", "3303", "3909"]},
    "Ringerike": {"30min": ["3305", "3310"],
                  "2hr_ekstra": ["3446", "3236", "3234", "3316", "3318", "3447", "3301", "3312", "3201", "3203", "0301"]},
    "Sogndal": {"30min": ["4640", "4644"], "2hr_ekstra": ["4642", "4643", "4641", "4639", "4638", "4647"]},
    "Steinkjer": {"30min": ["5006", "5053", "5038"],
                  "2hr_ekstra": ["5037", "5035", "5036", "5041", "5007", "5047", "5054", "5001", "5031"]},
    "Stor-Elvdal": {"30min": ["3423"], "2hr_ekstra": ["3422", "3420", "3424", "3428", "3427", "3412", "3403"]},
    "Volda": {"30min": ["1577", "1520"],
              "2hr_ekstra": ["1508", "1516", "1517", "1515", "1514", "1511", "1525", "1528", "1531", "4649", "4651"]},
    "Åmot": {"30min": ["3422", "3420"], "2hr_ekstra": ["3403", "3412", "3413", "3411", "3423", "3419", "3418", "3421", "3424"]},
}
# Studiested i programkartet → nøkkel i portalens nabolister / NSO-tabellen der navnet avviker.
TIER_ALIAS = {"Oslo m.fl.": "Oslo"}
NSO_ALIAS = {"Oslo": "Oslo og Lillestrøm", "Oslo m.fl.": "Oslo og Lillestrøm", "Midt-Telemark": "Bø",
             "Stor-Elvdal": "Evenstad", "Åmot": "Rena"}
KOMMUNE_ALIAS = {"Oslo m.fl.": "Oslo"}
INST_KORT = {
    "Norges miljø- og biovitenskapelige universitet": "NMBU", "Norges teknisk-naturvitenskapelige universitet": "NTNU",
    "Universitetet i Oslo": "UiO", "Universitetet i Bergen": "UiB", "UiT Norges arktiske universitet": "UiT",
    "Universitetet i Stavanger": "UiS", "Universitetet i Agder": "UiA", "Nord universitet": "Nord",
    "OsloMet - storbyuniversitetet": "OsloMet", "Universitetet i Sørøst-Norge": "USN", "Universitetet i Innlandet": "INN",
    "Høgskulen på Vestlandet": "HVL", "Høgskolen i Østfold": "HiØ", "Høgskulen i Volda": "HVO",
    "Arkitektur- og designhøgskolen i Oslo": "AHO", "Handelshøyskolen BI": "BI", "Norges Handelshøyskole": "NHH",
}
# Prissoner i 09895 som per definisjon er en kommune eller et fylke (kommunenummer-prefiks).
SONE_DEFINISJON = {"01": ["0301", "3201"], "02": ["32"], "03": ["4601"], "04": ["5001"], "05": ["1103"]}


def ctx():
    try:
        return ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    except Exception:
        return ssl.create_default_context()


def ssb(table, query, cache, refresh):
    path = K / cache
    if path.exists() and not refresh:
        return json.load(open(path, encoding="utf-8"))
    body = json.dumps({"query": query, "response": {"format": "json-stat2"}}).encode()
    req = urllib.request.Request(SSB + table, data=body, headers={"Content-Type": "application/json", "User-Agent": "nmbu-sammenligning"})
    with urllib.request.urlopen(req, timeout=120, context=ctx()) as r:
        d = json.loads(r.read().decode("utf-8"))
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False)
    return d


def cells(d):
    dims = d["id"]
    cats = [list(d["dimension"][k]["category"]["index"].keys()) for k in dims]
    for i, combo in enumerate(itertools.product(*cats)):
        yield dict(zip(dims, combo)), d["value"][i]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    today = dt.date.today().isoformat()

    # ── Kjøp (06035) ──
    meta = json.loads(urllib.request.urlopen(urllib.request.Request(SSB + "06035", headers={"User-Agent": "nmbu-sammenligning"}), timeout=60, context=ctx()).read())
    reg = meta["variables"][0]
    labels = dict(zip(reg["values"], reg["valueTexts"]))
    kommunekoder = [c for c in reg["values"] if re.fullmatch(r"\d{4}", c) and c not in ("9999",) and not c.endswith("99")]
    d = ssb("06035", [{"code": "Region", "selection": {"filter": "item", "values": kommunekoder}},
                      {"code": "ContentsCode", "selection": {"filter": "item", "values": ["KvPris", "Omsetninger"]}},
                      {"code": "Tid", "selection": {"filter": "item", "values": AAR_KJOP}}],
            "ssb_06035_kommuner.json", a.refresh)
    TYPER = {"01": "enebolig", "02": "smahus", "03": "blokk"}
    raw = {}
    for c, v in cells(d):
        r = raw.setdefault(c["Region"], {})
        key = TYPER[c["Boligtype"]] + ("" if c["ContentsCode"] == "KvPris" else "Oms")
        # 0 omsetninger (og pris uten omsetninger) = kommunenummeret fantes ikke det året, eller ingen salg
        if v:
            r.setdefault(key, {})[c["Tid"]] = v
    periode = re.compile(r"^(.*) \((\d{4})?-(\d{4})?\)$")
    def rent(navn):
        return navn.split(" - ")[0].strip()
    gjeldende = {c: rent(labels[c]) for c in kommunekoder if not periode.match(labels[c])}
    forgjenger = {}
    for c in kommunekoder:
        m = periode.match(labels[c])
        if m and m.group(3) == "2023" and (m.group(2) or "") == "2020":
            forgjenger.setdefault(rent(m.group(1)), []).append(c)
    kommuner = {}
    skjott = 0
    for c, navn in gjeldende.items():
        serie = {k: dict(v) for k, v in raw.get(c, {}).items()}
        for f in forgjenger.get(navn, []):
            if f == c:
                continue
            for k, v in raw.get(f, {}).items():
                for y, val in v.items():
                    if "2020" <= y <= "2023":
                        serie.setdefault(k, {}).setdefault(y, val)
            skjott += 1
        if serie:
            kommuner[c] = {"navn": navn, **serie}

    # ── Leie (09895) ──
    dl = ssb("09895", [{"code": "Soner2", "selection": {"filter": "all", "values": ["*"]}},
                       {"code": "AntRom", "selection": {"filter": "all", "values": ["*"]}},
                       {"code": "ContentsCode", "selection": {"filter": "item", "values": ["Husleie"]}},
                       {"code": "Tid", "selection": {"filter": "item", "values": AAR_LEIE}}],
             "ssb_09895_leie.json", a.refresh)
    sonenavn = dl["dimension"]["Soner2"]["category"]["label"]
    romnavn = dl["dimension"]["AntRom"]["category"]["label"]
    rom = list(dl["dimension"]["AntRom"]["category"]["index"].keys())
    soner = {}
    for c, v in cells(dl):
        s = soner.setdefault(c["Soner2"], {"kode": c["Soner2"], "navn": sonenavn[c["Soner2"]], "definisjon": SONE_DEFINISJON.get(c["Soner2"]), "leie": {}})
        s["leie"].setdefault(c["Tid"], [None] * len(rom))[rom.index(c["AntRom"])] = v

    # ── Studiesteder fra programkartene ──
    steder = {}
    for f in glob.glob(str(ROOT / "data" / "*" / "programkart.json")):
        for g in json.load(open(f, encoding="utf-8"))["groups"]:
            for p in g["programs"]:
                s = p.get("studiested") or ""
                if not s:
                    continue
                e = steder.setdefault(s, {"insts": set(), "nmbu": False})
                e["insts"].add(INST_KORT.get(p["institusjon"], p["institusjon"]))
                e["nmbu"] |= bool(p.get("isNmbu"))
    kom = json.load(open(P / "studiested_kommune.json", encoding="utf-8"))["data"]
    tiers_portal = json.load(open(P / "studiested_tiers.json", encoding="utf-8"))["data"]
    nso = json.load(open(P / "nso_studentbolig_2026.json", encoding="utf-8"))["data"]

    def z(k):
        return str(k).zfill(4)

    ut_steder = []
    mangler = []
    for navn, e in sorted(steder.items(), key=lambda kv: (not kv[1]["nmbu"], kv[0])):
        kkey = KOMMUNE_ALIAS.get(navn, navn)
        knr = z(kom[kkey]["kommune"]) if kkey in kom else None
        if knr is None:
            mangler.append(navn)
            continue
        tkey = TIER_ALIAS.get(navn, navn)
        tiers, tkilde = None, None
        if navn in STUDIESTED_TIERS_EGNE:
            b = STUDIESTED_TIERS_EGNE[navn]
            tiers = {"30min": b["30min"], "2hr": list(dict.fromkeys(b["30min"] + b["2hr_ekstra"]))}
            tkilde = "kuratert i NMBU-sammenligning"
        elif tkey in tiers_portal:
            t = tiers_portal[tkey]
            tiers = {"30min": [z(x) for x in t["30min"]], "2hr": [z(x) for x in t["2hr"]]}
            tkilde = "sammenligningsportalen"
        fylke = [knr] + sorted(c for c in kommuner if c[:2] == knr[:2] and c != knr)
        nkey = NSO_ALIAS.get(navn, navn)
        n = nso["studiested"].get(nkey)
        ut_steder.append({
            "navn": navn, "kommune": knr, "kommunenavn": kommuner.get(knr, {}).get("navn", ""),
            "institusjoner": sorted(e["insts"], key=lambda x: (x != "NMBU", x)), "nmbu": e["nmbu"],
            "tiers": ({**tiers, "fylke": fylke} if tiers else None), "tierKilde": tkilde,
            "nsoNavn": nkey if n else None, "nso": n,
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    json.dump({
        "hentet": today,
        "kilder": {
            "kjop": "SSB tabell 06035, kvadratmeterpris og antall omsetninger for selveierboliger per kommune",
            "leie": "SSB tabell 09895, gjennomsnittlig månedlig leie etter prissone og antall rom",
            "studentbolig": "NSO Studentboligundersøkelsen 2026 (transkribert fra PDF i sammenligningsportalen)",
            "geografi": "Nabokommuner ~30 min / ~2 timer: kuraterte anslag (portalen; Ås kuratert her), ikke målte reisetider",
        },
        "kommuner": kommuner,
        "leie": {"rom": [romnavn[r] for r in rom], "soner": list(soner.values())},
        "nso": {"nasjonal_historikk": nso["nasjonal_historikk"], "samskipnad": nso["samskipnad"]},
        "steder": ut_steder,
    }, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{len(kommuner)} kommuner ({skjott} skjøtet med forgjengerkode 2020–2023), {len(soner)} prissoner, "
          f"{len(ut_steder)} studiesteder ({sum(1 for s in ut_steder if s['tiers'])} med naboliste, "
          f"{sum(1 for s in ut_steder if s['nso'])} med NSO-tall). Uten kommune: {mangler or 'ingen'}. "
          f"{OUT.stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()
