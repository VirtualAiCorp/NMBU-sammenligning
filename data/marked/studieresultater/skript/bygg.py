#!/usr/bin/env python3
"""B2 – studenter, kandidater, gjennomføring, studentsammensetning og anslått inntekt for ALLE studieprogram
ved ALLE institusjoner i DBH, 2019–2025. Leser cachen fra hent.py og skriver:

  data/marked/studieresultater/program/<inst>.json   ett objekt per institusjon, nøkkel = "<inst>_<programkode>"
  data/marked/studieresultater/program-indeks.json   kompakt indeks over alle program (navn, nivå, NUS, nøkkeltall)
  data/marked/studieresultater/aggregater.json       per institusjon, per nivå (nasjonalt) og per NUS-fagfelt/-faggruppe × nivå
  data/marked/studieresultater/alias.json            gamle nøkler (før institusjonssammenslåing) → nye nøkler

Kilder (DBH/HK-dir, se hent.py): 123, 110, 104, 335, 707, 60, 135, 142, 900, 907 (bulk), 347 (bulk), 211 (bulk), 908 (bulk).

Definisjoner:
  reg       registrerte studenter, høstsemesteret (123, Semester 3)
  nye       nye studenter, vår + høst (110)
  kand      ferdige kandidater, vår + høst (104)
  *KvAndel  kvinneandel, regnet bare over celler der kvinner + menn = totalt (DBH nuller kjønn i små celler)
  spPlan/spGjen  studiepoeng planlagt / gjennomført iht. utdanningsplan (335)
  aarsverk  studentårsverk = ny studiepoengproduksjon totalt / 60 (900, per studentens program)
  sp        egenfinansierte årsverk per finansieringskategori (900): fra 2023 «Finmodkode student» (1–3);
            2019–2022 «Finmodekode emne» (A–F), slik det gamle systemet regnet
  alder     [≤21, 22–24, 25–29, 30+, total], høst (60, aldersgrupper via filter)
  utl       utenlandske statsborgere, høst (135)
  utv       programmets studenter på utveksling ut, vår + høst (142 Type NORSK)
  p         liste over felt der minst én DBH-celle var prikket (vist som 0, egentlig 1–2)
  kull      707 per startår: se KULL_KOL. Feltene for normert+1/+2 er null når horisonten ikke er nådd (siste måleår 2025).
  inn       anslått resultatbasert uttelling (kr), se inntekt() nedenfor.

Bruk:
  python3 data/marked/studieresultater/skript/bygg.py
"""
import collections
import csv
import datetime as dt
import gzip
import json
import statistics
import sys
from pathlib import Path

import dbh

UT = dbh.KILDER.parent
REPO = UT.parent.parent.parent
AAR = list(range(2019, 2026))
SISTE_MAALEAAR = 2025
KULL_FRA = 2016
KULL_KOL = ["startaar", "normertAar", "nivaa", "startkull", "startkullKv", "fullfortNormert", "fullfortNormertKv",
            "fullfort1", "fullfort2", "studerer", "studerer1", "studerer2", "frafalt", "frafalt1", "frafalt2"]
G3_NIVAA = {"B3", "B4", "YU", "M2", "M5", "PR"}
NIVAA_TYPE = {"B3": "bachelor", "B4": "bachelor", "YU": "bachelor", "M2": "master", "M5": "master", "PR": "profesjon",
              "ME": "erfaringsmaster", "MX": "erfaringsmaster", "AR": "aarsstudium", "HK": "hoyskolekandidat",
              "LN": "annet_lavere", "HN": "annet_hoyere", "FU": "forskerutdanning", "VS": "vgs_nivaa"}


def les_csv(tid):
    with gzip.open(dbh.KILDER / f"bulk_{tid}.csv.gz", "rt", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def rad(navn):
    r, st = dbh.hent(navn, None)
    if not r:
        sys.exit(f"Mangler cache for {navn}. Kjør hent.py først.")
    return r


def s(v):
    return (v or "").strip()


def n(v):
    return dbh.tall(v)


# ───────────────────────── institusjoner og sammenslåinger ─────────────────────────

def institusjoner():
    inst, flett = {}, {}
    for r in les_csv(211):
        k = s(r["Institusjonskode"])
        inst[k] = {"navn": s(r["Institusjonsnavn"]), "kortnavn": s(r["Kortnavn"]), "type": s(r["Typenavn"]),
                   "departement": s(r["Dep_navn"]), "kd": s(r["Departementid"]) == "1",
                   "privat": "rivat" in s(r["Typenavn"])}
        ny = s(r["Institusjonskode (sammenslått)"])
        til = s(r["Gyldig til"])
        if len(ny) == 4 and ny.isdigit() and ny != k and til.isdigit() and int(til) >= 20153 and int(til) < 99999:
            flett[k] = ny
    return inst, flett


# ───────────────────────── programregisteret (347) ─────────────────────────

def programregister(flett):
    meta = {}
    gammel = {}
    for r in les_csv(347):
        y = int(r["Årstall"])
        if y < 2012:
            continue
        i = s(r["Institusjonskode"]); i = flett.get(i, i)
        key = f"{i}_{s(r['Studieprogramkode'])}"
        sort = y * 10 + int(r["Semester"] or 0)
        kat = s(r["Finansierings-kategori"]).upper()
        if kat in "ABCDEF" and len(kat) == 1:
            g = gammel.get(key)
            if not g or sort > g[0]:
                gammel[key] = (sort, kat, s(r["Uttelling"]))
        m = meta.get(key)
        if m and m["_sort"] >= sort:
            m["forsteAar"] = min(m["forsteAar"], y)
            continue
        nus = s(r["NUS-kode"])
        meta[key] = {"_sort": sort, "navn": s(r["Studieprogramnavn"]), "avd": s(r["Avdelingskode"]), "avdNavn": s(r["Avdelingsnavn"]),
                     "nivaa": s(r["Nivåkode"]).upper(), "nivaaNavn": s(r["Nivånavn"]), "studiepoeng": n(r["Studiepoeng"]) or None,
                     "heltid": n(r["Andel av heltid"]), "nus": nus or None, "organisering": s(r["Organisering"]),
                     "sprak": s(r["Navn"]), "videreutd": s(r["Videreutd."]) == "1",
                     "kategori": kat or None, "uttelling": s(r["Uttelling"]) or None,
                     "tilbysFra": s(r["Tilbys fra"]), "tilbysTil": s(r["Tilbys til"]),
                     "sisteAar": y, "forsteAar": (m or {}).get("forsteAar", y)}
    for key, m in meta.items():
        m.pop("_sort")
        g = gammel.get(key)
        m["kategoriGammel"] = g[1] if g else None
        m["uttellingGammel"] = g[2] if g else None
        if m["kategori"] and m["kategori"] not in ("1", "2", "3"):
            # siste registrerte kategori er ikke 1–3 (DG, IS, 0 …): behold den som den er
            pass
    return meta


# ───────────────────────── serier per program × år ─────────────────────────

class Serie:
    """Summerer «Antall totalt» per (nøkkel, år) og holder rede på prikking og kjønn."""

    def __init__(self):
        self.tot = collections.Counter()
        self.kv = collections.Counter()
        self.kvbase = collections.Counter()
        self.prikk = set()
        self.har = set()

    def add(self, key, y, r):
        t = n(r.get("Antall totalt"))
        k, m_ = n(r.get("Antall kvinner")), n(r.get("Antall menn"))
        self.tot[(key, y)] += t
        self.har.add((key, y))
        if t == 0:
            self.prikk.add((key, y))
        elif k + m_ == t:
            self.kv[(key, y)] += k
            self.kvbase[(key, y)] += t

    def verdi(self, key, y):
        return int(self.tot[(key, y)]) if (key, y) in self.har else None

    def kvandel(self, key, y):
        b = self.kvbase[(key, y)]
        return round(self.kv[(key, y)] / b, 3) if b else None


ALIAS = {}


def nokkel(r, flett, felt="Studieprogramkode"):
    o = s(r["Institusjonskode"]); i = flett.get(o, o)
    if i != o:
        ALIAS[f"{o}_{s(r.get(felt))}"] = f"{i}_{s(r.get(felt))}"
    return f"{i}_{s(r.get(felt))}"


def les_serier(flett):
    ser = {}
    for navn, sem in (("r123", "3"), ("r110", None), ("r104", None), ("u135", None), ("x142ut", None),
                      ("a60_total", None), ("a60_a21", None), ("a60_a24", None), ("a60_a29", None), ("a60_a30", None)):
        S = Serie()
        for r in rad(navn):
            if sem and r.get("Semester") != sem:
                continue
            S.add(nokkel(r, flett), int(r["Årstall"]), r)
        ser[navn] = S
    # 335
    sp335 = {}
    for r in rad("r335"):
        d = sp335.setdefault((nokkel(r, flett), int(r["Årstall"])), [0.0, 0.0])
        d[0] += n(r.get("sp_planlagt")); d[1] += n(r.get("sp_gjennomfort"))
    # 900 (nytt system: studentens kategori; årsverk totalt fra samme spørring)
    sp900 = {}
    for r in rad("sp900"):
        key = nokkel(r, flett, "Progkode student"); y = int(r["Årstall"])
        d = sp900.setdefault((key, y), {"tot": 0.0, "kat": collections.Counter()})
        d["tot"] += n(r.get("Ny produksjon totalt"))
        k = s(r.get("Finmodkode student")).upper()
        if y >= 2023:
            d["kat"][k] += n(r.get("Ny produksjon egentfin"))
    for r in rad("sp900e"):
        key = nokkel(r, flett, "Progkode student"); y = int(r["Årstall"])
        d = sp900.setdefault((key, y), {"tot": 0.0, "kat": collections.Counter()})
        d["kat"][s(r.get("Finmodekode emne")).upper()] += n(r.get("Ny produksjon egentfin"))
    # 907 kandidater med uttelling (gammelt system)
    k907 = collections.defaultdict(lambda: collections.Counter())
    for r in les_csv(907):
        y = int(r["Årstall"])
        if y < 2019:
            continue
        i = s(r["Institusjonskode"]); i = flett.get(i, i)
        key = f"{i}_{s(r['Studieprogramkode'])}"
        k907[(key, y)][(s(r["Finansierings-kategori"]).upper(), s(r["Uttelling Kode:1=Enkel 2=dobbel"]))] += n(r["Totalt"])
    return ser, sp335, sp900, k907


def les_kull(flett):
    kull = {}
    for r in rad("k707t"):
        y = int(r["Årstall"])
        if y < KULL_FRA:
            continue
        key = nokkel(r, flett)
        nt = int(n(r.get("Årstall normert tid"))) or None
        k = kull.setdefault((key, y), {"startaar": y, "normertAar": nt, "nivaa": s(r.get("Nivåkode")).upper(),
                                       "startkull": 0, "startkullKv": None, "fullfortNormert": 0, "fullfortNormertKv": None,
                                       "fullfort1": 0, "fullfort2": 0, "studerer": 0, "studerer1": 0, "studerer2": 0,
                                       "frafalt": 0, "frafalt1": 0, "frafalt2": 0})
        for f, dbhf in (("startkull", "Startkull"), ("fullfortNormert", "Fullført normert"), ("fullfort1", "Fullført normert1"),
                        ("fullfort2", "Fullført normert2"), ("studerer", "Studerer"), ("studerer1", "Studerer1"), ("studerer2", "Studerer2"),
                        ("frafalt", "Frafalt"), ("frafalt1", "Frafalt1"), ("frafalt2", "Frafalt2")):
            k[f] += int(n(r.get(dbhf)))
    for r in rad("k707kv"):
        y = int(r["Årstall"])
        k = kull.get((nokkel(r, flett), y))
        if not k:
            continue
        k["startkullKv"] = (k["startkullKv"] or 0) + int(n(r.get("Startkull")))
        k["fullfortNormertKv"] = (k["fullfortNormertKv"] or 0) + int(n(r.get("Fullført normert")))
    for k in kull.values():
        nt = k["normertAar"]
        for h, felt in ((1, ("fullfort1", "studerer1", "frafalt1")), (2, ("fullfort2", "studerer2", "frafalt2"))):
            if nt is None or nt + h > SISTE_MAALEAAR:
                for f in felt:
                    k[f] = None
        if nt is not None and nt > SISTE_MAALEAAR:
            for f in ("fullfortNormert", "fullfortNormertKv", "studerer", "frafalt"):
                k[f] = None
    return kull


# ───────────────────────── satser og inntekt ─────────────────────────

def satser():
    st = {}
    for r in les_csv(908):
        y, k = int(r["Årstall"]), s(r["Finansierings-kategori"]).upper()
        d = st.setdefault(y, {})
        if r.get("Studiepoeng"):
            d[k] = n(r["Studiepoeng"])
        if k in "ABCDEF" and len(k) == 1:
            d[k + "_enkel"] = n(r.get("Kandidater-enkel"))
            d[k + "_dobbel"] = n(r.get("Kandidater-dobbel"))
        if k == "G3" and r.get("Belop"):
            d["G3"] = n(r["Belop"])
    return st


def inntekt(y, sp, k907, kand, meta, st, inst):
    """Anslått uttelling for produksjon i år y, utbetalt i budsjettår y + 2.
    Nytt system (y ≥ 2023): Σ egenfinansierte årsverk per kategori 1–3 × sats + kandidater (104) × G3 for heltids gradsprogram.
    Gammelt system (y ≤ 2022): Σ årsverk per emnekategori A–F × sats + kandidater med uttelling (907) × enkel/dobbel sats.
    Satser for budsjettåret fra DBH 908; finnes de ikke ennå, brukes siste kjente (forelopig = true)."""
    if not inst.get("kd"):
        return None
    budsjett = y + 2
    ny = y >= 2023
    kjente = sorted(a for a, d in st.items() if (all(k in d for k in ("1", "2", "3", "G3")) if ny else all(k in d for k in "ABCDEF")))
    if not kjente:
        return None
    sa = budsjett if budsjett in kjente else kjente[-1]
    sats = st[sa]
    kat = sp["kat"] if sp else {}
    if ny:
        innsp = sum(kat.get(k, 0) * sats[k] for k in ("1", "2", "3"))
        g3 = meta and meta.get("nivaa") in G3_NIVAA and (meta.get("heltid") or 0) >= 1
        innk = (kand or 0) * sats["G3"] if g3 else 0
    else:
        innsp = sum(kat.get(k, 0) * sats[k] for k in "ABCDEF")
        innk = 0
        for (k, utt), ant in (k907 or {}).items():
            if k in "ABCDEF" and len(k) == 1:
                innk += ant * sats.get(k + ("_dobbel" if utt == "2" else "_enkel"), 0)
    if not innsp and not innk:
        return None
    ut = {"system": "2025" if ny else "A-F", "budsjettaar": budsjett, "satsAar": sa, "forelopig": sa != budsjett,
          "sp": round(innsp), "kand": round(innk), "total": round(innsp + innk)}
    if inst.get("privat"):
        # Private institusjoner får et fast tilskudd for avtalte studieplasser, ikke full uttelling per studiepoeng.
        ut["hypotetisk"] = True
    return ut


# ───────────────────────── hovedløp ─────────────────────────

def andel(a, b):
    return round(a / b, 4) if a is not None and b else None


def pooled(kullrader, felt, fra, til, min_start=1):
    st = sum(k["startkull"] for k in kullrader if fra <= k["startaar"] <= til and k.get(felt) is not None)
    v = sum(k[felt] for k in kullrader if fra <= k["startaar"] <= til and k.get(felt) is not None)
    return (round(v / st, 4), st) if st >= min_start else (None, st)


def main():
    inst, flett = institusjoner()
    meta = programregister(flett)
    ser, sp335, sp900, k907 = les_serier(flett)
    kull = les_kull(flett)
    st = satser()

    keys = set()
    for S in ser.values():
        keys |= {k for k, y in S.har if 2019 <= y <= 2025}
    keys |= {k for k, y in sp335 if 2019 <= y <= 2025}
    keys |= {k for k, y in sp900 if 2019 <= y <= 2025}
    keys |= {k for k, y in kull}
    keys = {k for k in keys if not k.endswith("_")}

    programmer = {}
    for key in sorted(keys):
        i, kode = key.split("_", 1)
        m = meta.get(key, {})
        im = inst.get(i, {})
        aar = {}
        for y in AAR:
            d = {}
            prikk = []
            for felt, sn in (("reg", "r123"), ("nye", "r110"), ("kand", "r104")):
                v = ser[sn].verdi(key, y)
                if v is not None:
                    d[felt] = v
                    kv = ser[sn].kvandel(key, y)
                    if kv is not None:
                        d[felt + "KvAndel"] = kv
                    if (key, y) in ser[sn].prikk:
                        prikk.append(felt)
            if (key, y) in sp335:
                d["spPlan"], d["spGjen"] = round(sp335[(key, y)][0], 1), round(sp335[(key, y)][1], 1)
            spd = sp900.get((key, y))
            if spd:
                if spd["tot"]:
                    d["aarsverk"] = round(spd["tot"], 2)
                kat = {k: round(v, 2) for k, v in sorted(spd["kat"].items()) if v}
                if kat:
                    d["sp"] = kat
            al = [ser[a].verdi(key, y) for a in ("a60_a21", "a60_a24", "a60_a29", "a60_a30", "a60_total")]
            if al[4] is not None:
                d["alder"] = [v or 0 for v in al]
                if any((key, y) in ser[a].prikk for a in ("a60_a21", "a60_a24", "a60_a29", "a60_a30")):
                    prikk.append("alder")
            for felt, sn in (("utl", "u135"), ("utv", "x142ut")):
                v = ser[sn].verdi(key, y)
                if v is not None:
                    d[felt] = v
                    if (key, y) in ser[sn].prikk:
                        prikk.append(felt)
            inn = inntekt(y, spd, k907.get((key, y)), d.get("kand"), m, st, im)
            if inn:
                d["inn"] = inn
            if prikk:
                d["p"] = prikk
            if d:
                aar[str(y)] = d
        kr = sorted((v for (k, y), v in kull.items() if k == key), key=lambda x: x["startaar"])
        if not aar and not kr:
            continue
        nus = m.get("nus")
        programmer[key] = {
            "inst": i, "kode": kode, "navn": m.get("navn"), "nivaa": m.get("nivaa") or (kr[-1]["nivaa"] if kr else None),
            "type": ("enkeltemner" if kode.startswith("EE-") else "utveksling" if kode.upper().startswith("UTVEKSL") else
                     NIVAA_TYPE.get(m.get("nivaa") or "", "ukjent")),
            "studiepoeng": m.get("studiepoeng"), "heltid": m.get("heltid"), "nus": nus,
            "fagfelt": nus[1] if nus and len(nus) >= 2 else None, "faggruppe": nus[1:3] if nus and len(nus) >= 3 else None,
            "kategori": m.get("kategori"), "kategoriGammel": m.get("kategoriGammel"), "uttellingGammel": m.get("uttellingGammel"),
            "avd": m.get("avd"), "avdNavn": m.get("avdNavn"), "organisering": m.get("organisering"), "sprak": m.get("sprak"),
            "videreutd": m.get("videreutd"), "registerAar": [m.get("forsteAar"), m.get("sisteAar")] if m else None,
            "aar": aar,
            "kull": [[k[c] for c in KULL_KOL] for k in kr],
        }
        programmer[key]["nokkel"] = nokkeltall(programmer[key], kr)

    # ── aggregater ──
    agg = aggreger(programmer, kull, inst, flett)

    # ── skriv ──
    dato = dt.date.today().isoformat()
    meta_ut = {"generert": dato, "kilde": "DBH/HK-dir: 123, 110, 104, 335, 707, 60, 135, 142, 900, 907, 347, 211, 908",
               "skript": "data/marked/studieresultater/skript/hent.py + bygg.py", "aar": [AAR[0], AAR[-1]], "kullFra": KULL_FRA,
               "sisteMaaleaar": SISTE_MAALEAAR, "kullKolonner": KULL_KOL, "alderKolonner": ["a21", "a24", "a29", "a30", "total"],
               "nokkel": "<Institusjonskode>_<Studieprogramkode> (DBH, trimmet; sammenslåtte institusjoner ført til ny kode, se alias.json)",
               "satser": {str(a): d for a, d in sorted(st.items()) if a >= 2021}}
    pdir = UT / "program"
    pdir.mkdir(exist_ok=True)
    for gml in pdir.glob("*.json"):
        gml.unlink()  # genererte filer fra forrige kjøring (institusjoner kan falle ut)
    per_inst = collections.defaultdict(dict)
    for key, p in programmer.items():
        per_inst[p["inst"]][key] = p
    for i, d in per_inst.items():
        with open(pdir / f"{i}.json", "w", encoding="utf-8") as f:
            json.dump({"meta": meta_ut | {"institusjon": i, "institusjonsnavn": inst.get(i, {}).get("navn")}, "program": d},
                      f, ensure_ascii=False, separators=(",", ":"))
    indeks = {key: [p["inst"], p["kode"], p["navn"], p["nivaa"], p["type"], p["nus"], p["kategori"], p["kategoriGammel"],
                    p["nokkel"].get("reg"), p["nokkel"].get("kand"), p["nokkel"].get("fullfortNormertAndel"),
                    p["nokkel"].get("inn")] for key, p in programmer.items()}
    with open(UT / "program-indeks.json", "w", encoding="utf-8") as f:
        json.dump({"meta": meta_ut | {"kolonner": ["inst", "kode", "navn", "nivaa", "type", "nus", "kategori", "kategoriGammel",
                                                  "regSiste", "kandSiste", "fullfortNormertAndel", "innSiste"]},
                   "institusjoner": {i: inst[i] for i in per_inst if i in inst}, "program": indeks},
                  f, ensure_ascii=False, separators=(",", ":"))
    with open(UT / "aggregater.json", "w", encoding="utf-8") as f:
        json.dump({"meta": meta_ut | agg.pop("_meta")} | agg, f, ensure_ascii=False, separators=(",", ":"))
    alias = {g: k for g, k in sorted(ALIAS.items()) if k in programmer}
    with open(UT / "alias.json", "w", encoding="utf-8") as f:
        json.dump({"sammenslaatt": flett, "nokler": alias}, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(programmer)} program ved {len(per_inst)} institusjoner. Skrev program/, program-indeks.json, aggregater.json, alias.json")


def nokkeltall(p, kr):
    """Nøkkeltall for listevisning: siste år med verdi, og samlet gjennomføring for de tre siste kullene der
    normert tid er nådd (2020–2022 for bachelor, 2021–2023 for toårig master …)."""
    out = {}
    for felt in ("reg", "nye", "kand", "aarsverk"):
        for y in reversed(AAR):
            v = p["aar"].get(str(y), {}).get(felt)
            if v is not None:
                out[felt] = v; out[felt + "Aar"] = y
                break
    for y in reversed(AAR):
        inn = p["aar"].get(str(y), {}).get("inn")
        if inn:
            out["inn"] = inn["total"]; out["innAar"] = y
            reg = p["aar"].get(str(y), {}).get("reg")
            if reg:
                out["innPerReg"] = round(inn["total"] / reg)
            break
    ferdig = [k for k in kr if k["fullfortNormert"] is not None]
    if ferdig:
        sist = ferdig[-1]["startaar"]
        a, st = pooled(ferdig, "fullfortNormert", sist - 2, sist)
        out["fullfortNormertAndel"], out["kullGrunnlag"], out["kullAar"] = a, st, [sist - 2, sist]
        out["frafallNormertAndel"] = pooled(ferdig, "frafalt", sist - 2, sist)[0]
    to = [k for k in kr if k["fullfort2"] is not None]
    if to:
        sist = to[-1]["startaar"]
        out["fullfort2Andel"], out["kull2Grunnlag"] = pooled(to, "fullfort2", sist - 2, sist)
        out["frafall2Andel"] = pooled(to, "frafalt2", sist - 2, sist)[0]
        out["kull2Aar"] = [sist - 2, sist]
    return out


SUMFELT = ("reg", "nye", "kand", "aarsverk", "spPlan", "spGjen", "utl", "utv")


def tom_gruppe():
    return {"antallProgram": 0, "aar": {}, "kull": {}, "_prog": []}


def legg_til(g, p, kr, med_inn=True):
    g["antallProgram"] += 1
    g["_prog"].append(p)
    for y, d in p["aar"].items():
        a = g["aar"].setdefault(y, {"antallProgram": 0, "alder": [0, 0, 0, 0, 0], "inn": 0, "innProgram": 0, "_kv": {}})
        a["antallProgram"] += 1
        for f in SUMFELT:
            if d.get(f) is not None:
                a[f] = round(a.get(f, 0) + d[f], 2)
        for f in ("reg", "nye", "kand"):
            if d.get(f + "KvAndel") is not None and d.get(f):
                kv = a["_kv"].setdefault(f, [0.0, 0])
                kv[0] += d[f + "KvAndel"] * d[f]; kv[1] += d[f]
        if d.get("alder"):
            a["alder"] = [x + y_ for x, y_ in zip(a["alder"], d["alder"])]
        if d.get("inn") and med_inn:
            a["inn"] += d["inn"]["total"]; a["innProgram"] += 1
        for k, v in (d.get("sp") or {}).items():
            a.setdefault("sp", {})[k] = round(a.get("sp", {}).get(k, 0) + v, 2)
    for k in kr:
        nk = g["kull"].setdefault(k["nivaa"] or "?", {}).setdefault(str(k["startaar"]), {"startkull": 0, "program": 0})
        nk["startkull"] += k["startkull"]; nk["program"] += 1
        for f in ("fullfortNormert", "fullfort1", "fullfort2", "studerer", "studerer2", "frafalt", "frafalt2"):
            if k[f] is not None:
                nk[f] = nk.get(f, 0) + k[f]


def persentiler(verdier):
    v = sorted(x for x in verdier if x is not None)
    if len(v) < 5:
        return None
    q = statistics.quantiles(v, n=4)
    return {"n": len(v), "p25": round(q[0], 4), "median": round(q[1], 4), "p75": round(q[2], 4)}


def fullfor(g):
    for y, a in g["aar"].items():
        for f, (s_, b) in a.pop("_kv").items():
            a[f + "KvAndel"] = round(s_ / b, 3) if b else None
        if not a["innProgram"]:
            a.pop("inn"); a.pop("innProgram")
        if a.get("reg"):
            if a.get("utl") is not None:
                a["utlAndel"] = round(a["utl"] / a["reg"], 4)
            if a.get("utv") is not None:
                a["utvPer100"] = round(100 * a["utv"] / a["reg"], 2)
    for niv, ks in g["kull"].items():
        for y, k in ks.items():
            for f in ("fullfortNormert", "fullfort1", "fullfort2", "frafalt", "frafalt2"):
                if f in k and k["startkull"]:
                    k[f + "Andel"] = round(k[f] / k["startkull"], 4)
    progs = g.pop("_prog")
    progs_inn = [p for p in progs if not any((d.get("inn") or {}).get("hypotetisk") for d in p["aar"].values())]
    # Fordeling mellom program (bare program med minst 20 i kullgrunnlaget / 20 registrerte)
    g["fordeling"] = {
        "fullfortNormertAndel": persentiler([p["nokkel"].get("fullfortNormertAndel") for p in progs if (p["nokkel"].get("kullGrunnlag") or 0) >= 20]),
        "frafallNormertAndel": persentiler([p["nokkel"].get("frafallNormertAndel") for p in progs if (p["nokkel"].get("kullGrunnlag") or 0) >= 20]),
        "fullfort2Andel": persentiler([p["nokkel"].get("fullfort2Andel") for p in progs if (p["nokkel"].get("kull2Grunnlag") or 0) >= 20]),
        "innPerReg": persentiler([p["nokkel"].get("innPerReg") for p in progs_inn if (p["nokkel"].get("reg") or 0) >= 20]),
        "reg": persentiler([p["nokkel"].get("reg") for p in progs if p["nokkel"].get("reg")]),
    }
    return g


def nus_navn():
    p = REPO / "data" / "nmbu" / "kilder" / "nus2000_ssb_klass36_hentet_2026-09-23.json"
    ff, fg = {}, {}
    try:
        for c in json.load(open(p, encoding="utf-8"))["codes"]:
            if c["level"] == "2" and c["code"][0] in "67":
                ff.setdefault(c["code"][1], c["name"])
            if c["level"] == "3" and c["code"][0] in "67":
                fg.setdefault(c["code"][1:3], c["name"])
    except FileNotFoundError:
        pass
    return ff, fg


def aggreger(programmer, kull, inst, flett):
    per_inst = collections.defaultdict(tom_gruppe)
    per_niv = collections.defaultdict(tom_gruppe)
    per_ff = collections.defaultdict(tom_gruppe)
    per_fg = collections.defaultdict(tom_gruppe)
    kr_by = collections.defaultdict(list)
    for (key, y), k in kull.items():
        kr_by[key].append(k)
    for key, p in programmer.items():
        kr = kr_by.get(key, [])
        legg_til(per_inst[p["inst"]], p, kr)
        niv = p["nivaa"] or "?"
        med_inn = not inst.get(p["inst"], {}).get("privat")
        legg_til(per_niv[niv], p, kr, med_inn)
        if p["fagfelt"]:
            legg_til(per_ff[f"{niv}|{p['fagfelt']}"], p, kr, med_inn)
        if p["faggruppe"]:
            legg_til(per_fg[f"{niv}|{p['faggruppe']}"], p, kr, med_inn)
    # innreisende utvekslingsstudenter per institusjon (142 UTENL; ligger ikke på studieprogram)
    inn = collections.Counter()
    for r in rad("x142inn"):
        i = s(r["Institusjonskode"]); i = flett.get(i, i)
        inn[(i, r["Årstall"])] += n(r.get("Antall totalt"))
    ut_inst = {}
    for i, g in per_inst.items():
        fullfor(g)
        for y, a in g["aar"].items():
            if (i, y) in inn:
                a["innreisende"] = int(inn[(i, y)])
        ut_inst[i] = (inst.get(i, {}) | g)
    ff, fg = nus_navn()
    ut_ff = {}
    for k, g in per_ff.items():
        ut_ff[k] = {"nivaa": k.split("|")[0], "fagfelt": k.split("|")[1], "navn": ff.get(k.split("|")[1])} | fullfor(g)
    ut_fg = {}
    for k, g in per_fg.items():
        ut_fg[k] = {"nivaa": k.split("|")[0], "faggruppe": k.split("|")[1], "navn": fg.get(k.split("|")[1])} | fullfor(g)
    return {"_meta": {"forklaring": {
                "institusjoner": "Summer over alle program ved institusjonen (sammenslåtte institusjoner under ny kode).",
                "nasjonalt": "Summer per DBH-nivåkode over alle institusjoner.",
                "fagfelt": "Nøkkel «<nivåkode>|<NUS-fagfelt>» (NUS-kodens 2. siffer). Nasjonalt snitt for sammenligning av program.",
                "faggruppe": "Nøkkel «<nivåkode>|<NUS-faggruppe>» (NUS-kodens 2.–3. siffer).",
                "inn": "Anslått uttelling (kr). I nasjonalt/fagfelt/faggruppe er private institusjoner holdt utenfor inntektssummen og -fordelingen; i institusjoner er de med, men merket hypotetisk på programnivå.",
                "kull": "Per nivåkode og startår: summer og andeler (andel = tall / startkull).",
                "fordeling": "Kvartiler mellom program: gjennomføring/frafall for de tre siste kullene med nådd horisont (≥ 20 startende), inntekt per registrert (≥ 20 registrerte)."},
                "fagfeltNavn": ff, "faggruppeNavn": fg},
            "institusjoner": ut_inst,
            "nasjonalt": {k: fullfor(g) for k, g in per_niv.items()},
            "fagfelt": ut_ff, "faggruppe": ut_fg}


if __name__ == "__main__":
    main()
