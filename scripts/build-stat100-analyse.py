#!/usr/bin/env python3
"""STAT100 – analyse (Handelshøyskolen, intern) → kryptert kilde/public/intern/stat100.json

Samler alt til møtet med fagmiljøet bak STAT100 i én kryptert fil (AES-256-GCM, PBKDF2-SHA256, 310 000 iterasjoner) med
eget passord STAT100_PASSORD i kilde/.env.local (ikke VITE_-prefiks, havner aldri i bunten). Vises under Handelshøyskolen →
«STAT100 – analyse».

Innhold og kilder (alle aggregerte tall, ingen personer):
  karakterer   STAT100 per år og semester, hele emnet: DBH 308 (data/nmbu/kilder/stat100/dbh/308_sem_*.json) + FS vår 2026
               (data/nmbu/kilder/fs-lokalt/stat100-2026-var.json, gitignored)
  programmer   per studieprogram og år (kilde/public/nmbu-emner.json) og per semester (DBH 308 programnivå, cache), med opptak
               (kilde/public/nmbu-opptak.json: kravkode, poenggrense, snitt opptakspoeng for dem som møtte)
  oa           ØA-studentene i statistikkemnet ved universitetene med handelshøyskole (data/nmbu/kilder/stat100/oa-studentene.json,
               scripts/stat100/samle_oa_studentene.py) med eierenhet og kategori (statistikkemner.json)
  emneinfo     pensum, læringsmål og studiepoeng per emne (data/nmbu/kilder/stat100/emneinfo.json, samlet fra emnesidene)
  andre        karakterer per studieprogram i statistikkemnene ved de andre institusjonene (DBH 308 programnivå, cache)
  fordeling    egenfinansierte studiepoeng i STAT100 per studentens program (DBH 900) × sats for kategorien til studentens program

Bruk:
  python3 scripts/build-stat100-analyse.py [--testpassord X]
"""
import argparse
import base64
import collections
import glob
import gzip
import json
import os
from pathlib import Path

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ROOT = Path(__file__).resolve().parent.parent
K = ROOT / "data" / "nmbu" / "kilder" / "stat100"
OUT = ROOT / "kilde" / "public" / "intern" / "stat100.json"
ENV = ROOT / "kilde" / ".env.local"
ITER = 310_000
KAR = "ABCDEFGH"
# Sats per 60 egenfinansierte studiepoeng (kategori 1/2/3) etter produksjonsår: produksjon i år Y gir uttelling i budsjett Y + 2.
# 2025/2026 fra DBH 908, 2027 fra statsbudsjettforslaget (orienteringen om forslaget, s. 19; data/nmbu/ledelse/statsbudsjett-2027.json).
SATSER = {"2023": {"budsjett": "2025", "1": 56600, "2": 84900, "3": 198150, "forslag": False},
          "2024": {"budsjett": "2026", "1": 58650, "2": 87950, "3": 205300, "forslag": False},
          "2025": {"budsjett": "2027", "1": 60850, "2": 91200, "3": 212900, "forslag": True}}
# Statistikkemnet i ØA-bacheloren per institusjon (samme utvalg som Excel-oversikten)
ANDRE = {"1150": ["SØK1004-1", "MET1002-A", "AR100219-1", "REA1154-1"], "1171": ["ME-111-1"], "1160": ["BØK356-1"],
         "1130": ["BED-2065-1", "BED-2011-1"], "1174": ["STT1001-1"], "1176": ["MET1010-1", "STA1000-1"], "1175": ["ØAMET1100-1"],
         "1177": ["ØKA1026-1"], "1240": ["MET2-1"], "8241": ["MET29201"]}
KORT = {"1173": "NMBU", "1150": "NTNU", "1171": "UiA", "1160": "UiS", "1130": "UiT", "1174": "Nord", "1176": "USN", "1175": "OsloMet",
        "1177": "INN", "1240": "NHH", "8241": "BI"}


def les(p):
    p = Path(p)
    return json.load(gzip.open(p, "rt", encoding="utf-8") if p.suffix == ".gz" else open(p, encoding="utf-8"))


def dbh(navn, inst):
    f = sorted(glob.glob(str(ROOT / "data" / "*" / "kilder" / "dbh-cache" / f"{navn}_{inst}_5y.json.gz")))[0]
    return les(f)[1:]


def passord(a):
    if a.testpassord:
        return a.testpassord
    for line in ENV.read_text(encoding="utf-8").splitlines():
        if line.startswith("STAT100_PASSORD="):
            return line.split("=", 1)[1].strip()
    raise SystemExit("Mangler STAT100_PASSORD i kilde/.env.local")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--testpassord", help="krypter med et kastepassord for lokal test (aldri commit resultatet)")
    a = ap.parse_args()

    # ── 1. Hele emnet per år og semester ──
    kar = collections.defaultdict(lambda: collections.defaultdict(lambda: {k: 0 for k in KAR}))
    for x in les(K / "dbh" / "308_sem_kar.json")[1:]:
        kar[x["Årstall"]][x["Semester"]][x["Karakter"]] += int(float(x["Antall kandidater totalt"] or 0))
    tot = collections.defaultdict(dict)
    for x in les(K / "dbh" / "308_sem_tot.json")[1:]:
        tot[x["Årstall"]][x["Semester"]] = int(float(x["Antall kandidater totalt"] or 0))
    aar = sorted(y for y in kar if y >= "2021")
    karakterer = {y: {s: {**kar[y][s], "total": tot[y].get(s, 0)} for s in ("1", "3")} for y in aar}

    fs = None
    fsf = ROOT / "data" / "nmbu" / "kilder" / "fs-lokalt" / "stat100-2026-var.json"
    if fsf.exists():
        d = les(fsf)
        fs = {"termin": d["termin"], "kilde": d["kilde"].split(" (")[0], "hele": d["hele"],
              "programmer": {pk: {"eksMeldt": v[0], "bestatt": v[1], "stryk": v[2], "ikkeMott": v[3], "snitt": v[4]}
                             for pk, v in d["programmer"].items() if v[1] + v[2] >= 3}}

    # ── 2. Per studieprogram ──
    emner = les(ROOT / "kilde" / "public" / "nmbu-emner.json")
    stat = next(c for c in emner["courses"] if c["kode"] == "STAT100-1")
    opp = les(ROOT / "kilde" / "public" / "nmbu-opptak.json")
    sem = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(lambda: {k: 0 for k in KAR})))
    for x in dbh("308", "1173"):
        if x["Emnekode"] == "STAT100-1" and x["Årstall"] >= "2021":
            sem[x["Studieprogramkode"]][x["Årstall"]][x["Semester"]][x["Karakter"]] += int(float(x["Antall kandidater totalt"] or 0))
    programmer = {}
    for pk, by in stat["programs"].items():
        meta = emner["programs"].get(pk, {})
        o = opp["programmer"].get(pk, {})
        programmer[pk] = {"navn": meta.get("navn") or pk, "nivaa": meta.get("nivaa"), "fakultet": meta.get("fakultet"),
                          "aar": by, "sem": {y: dict(v) for y, v in sem.get(pk, {}).items()},
                          "opptak": o.get("opptak"), "krav": o.get("krav", {}), "grenser": o.get("grenser", {}), "poeng": o.get("poeng", {})}

    # ── 3. ØA-studentene ved universitetene ──
    stk = {(e["inst"], e["kode"]): e for e in les(K / "statistikkemner.json")}
    # Kategori som i Excel-oversikten: 1 = eies av handelshøyskolen, 2 = for økonomer (navnet eller ≥ 50 % av kandidatene med
    # studieprogram kommer fra økonomiprogram) men eies utenfor, 3 = ellers
    for e in stk.values():
        pl = [(c, ok) for _n, c, ok, upl in e.get("kand_prog", []) if not upl]
        t = sum(c for c, _ in pl); andel = sum(c for c, ok in pl if ok) / t if t else None
        e["kat"] = 1 if e.get("hh_eid") else 2 if (e.get("navn_ok") or (andel is not None and andel >= 0.5)) else 3
    oa = []
    UTELAT = {("1177", "3MET130-1")}  # INN Rena: ikke relevant for sammenligningen (Mathias 15.10)
    # Hvilket semester i studiet statistikkemnet ligger i (fra studieplanene, data/nmbu/kilder/stat100/semester.json)
    semplan = les(K / "semester.json")["program"] if (K / "semester.json").exists() else []
    TYPE_KODE = {"Bachelor ØA": None, "Bachelor ØLIT": "B-ØLIT", "Bachelor samfunnsøkonomi": "B-ECON", "Siviløkonom 5 år": "SIV"}
    # Emner som har byttet kode, men har samme plass i studieplanen
    SAMME_PLASS = [{"SØK1004", "MET1002"}, {"MET1010", "STA1000"}, {"BED-2065", "BED-2066", "BED-2011", "BED-2301"}]
    def normkode(k):
        return (k or "").replace(" ", "").upper()
    def studiesemester(r, kode):
        koder = next((g for g in SAMME_PLASS if normkode(kode) in g), {normkode(kode)})
        kand = [x for x in semplan if x.get("inst", "").split(" ")[0] == r["kort"] and normkode(x.get("emne")) in koder and x.get("semester")]
        # Femårig siviløkonom: programkoden har SIV (MSIVØK5, OKADSIV, SIVØKLEDR); «(bachelor, siviløkonom 3+2)» hos NHH er bachelor
        er_siv = lambda x: "SIV" in str(x.get("programkode") or "").upper()
        kand = [x for x in kand if er_siv(x) == (r["type"] == "Siviløkonom 5 år")]
        if r["kort"] == "NMBU":
            kode_t = TYPE_KODE.get(r["type"]) or "B-ØA"
            kand = [x for x in kand if (x.get("programkode") or "").upper() == kode_t] or kand
        sted = [x for x in kand if (x.get("studiested") or "").lower() == (r.get("studiested") or "").lower()]
        x = (sted or kand or [None])[0]
        return None if not x else {k: x.get(k) for k in ("semester", "termin", "studieaar", "sikkerhet", "kilde", "belegg", "kull")}
    for r in les(K / "oa-studentene.json"):
        if (r["inst"], r["emne"]) in UTELAT:
            continue
        e = stk.get((r["inst"], r["emne"]), {})
        oa.append({**{k: r[k] for k in ("inst", "kort", "prognavn", "type", "emne", "emnenavn", "aar", "karakterer", "total", "sem",
                                         "studiested", "grenser")},
                   "visningskode": e.get("visningskode", r["emne"]), "eier": e.get("avdnavn"), "fakultet": e.get("faknavn"),
                   "kategori": e.get("kat"), "sp": e.get("sp"), "emneurl": e.get("emneurl"),
                   "studiesemester": studiesemester(r, e.get("visningskode", r["emne"]))})

    # ── 5. Andre institusjoners statistikkemner: karakterer per studieprogram ──
    andre = []
    def grenser370(inst):
        """Poenggrenser i hovedopptaket per DBH-programkode og år (DBH tabell 370, høst, Samordna opptak). 0 = alle kvalifiserte."""
        f = K / "dbh370" / f"370_{inst}.json"
        ut = collections.defaultdict(dict)
        if f.exists():
            for x in les(f)[1:]:
                if x.get("Opptakstype") == "N" and x.get("Semester") == "3":
                    o, pr = x.get("Poenggrense ordinær kvote"), x.get("Poenggrense primærkvote")
                    if o is not None or pr is not None:
                        ut[x["Studieprogramkode"]][x["Årstall"]] = {"ord": float(o) if o is not None else None, "prim": float(pr) if pr is not None else None}
        return ut
    for inst, koder in ANDRE.items():
        pg = grenser370(inst)
        pr = collections.defaultdict(lambda: collections.defaultdict(lambda: {k: 0 for k in KAR}))
        pnavn = {}
        for x in dbh("308", inst):
            if x["Emnekode"] in koder and x["Årstall"] >= "2021":
                pr[(x["Emnekode"], x["Studieprogramkode"])][x["Årstall"]][x["Karakter"]] += int(float(x["Antall kandidater totalt"] or 0))
                pnavn[x["Studieprogramkode"]] = x.get("Studieprogramnavn") or x["Studieprogramkode"]
        ptot = collections.defaultdict(dict)
        for x in dbh("308pt", inst):
            if x["Emnekode"] in koder and x["Årstall"] >= "2021":
                ptot[(x["Emnekode"], x["Studieprogramkode"])][x["Årstall"]] = int(float(x["Antall kandidater totalt"] or 0))
                pnavn.setdefault(x["Studieprogramkode"], x.get("Studieprogramnavn") or x["Studieprogramkode"])
        hele = collections.defaultdict(lambda: collections.defaultdict(lambda: {k: 0 for k in KAR}))
        for x in dbh("308e", inst):
            if x["Emnekode"] in koder and x["Årstall"] >= "2021":
                hele[x["Emnekode"]][x["Årstall"]][x["Karakter"]] += int(float(x["Antall kandidater totalt"] or 0))
        htot = collections.defaultdict(dict)
        for x in dbh("308et", inst):
            if x["Emnekode"] in koder and x["Årstall"] >= "2021":
                htot[x["Emnekode"]][x["Årstall"]] = int(float(x["Antall kandidater totalt"] or 0))
        for kode in koder:
            e = stk.get((inst, kode), {})
            if not htot.get(kode):
                continue
            progs = {}
            for (k2, pk), by in pr.items():
                if k2 == kode:
                    progs[pk] = {"navn": pnavn[pk], "grenser": pg.get(pk, {}), "aar": {y: {**g, "total": ptot.get((kode, pk), {}).get(y, sum(g.values()))} for y, g in by.items()}}
            for (k2, pk), by in ptot.items():
                if k2 == kode and pk not in progs:
                    progs[pk] = {"navn": pnavn[pk], "grenser": pg.get(pk, {}), "aar": {y: {**{k: 0 for k in KAR}, "total": t} for y, t in by.items()}}
            andre.append({"inst": inst, "kort": KORT[inst], "kode": kode, "visningskode": e.get("visningskode", kode), "navn": e.get("navn"),
                          "eier": e.get("avdnavn"), "fakultet": e.get("faknavn"), "kategori": e.get("kat"), "sp": e.get("sp"),
                          "emneurl": e.get("emneurl"), "hele": {y: {**g, "total": htot[kode].get(y, 0)} for y, g in hele[kode].items()},
                          "programmer": progs})

    # ── 6. Fordeling: studiepoeng i STAT100 per studentens program × sats for kategorien til studentens program ──
    # Fra finansieringssystemet 2025 følger kategorien studentens studieprogram, ikke emnet (KD; se UiBs Analysegruppa nr. 51).
    # DBH 900 har begge: «Finmodkode student» (brukes) og «Finmodekode emne» (STAT100 = 2, vises bare til orientering).
    sp = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(float)))
    emnekat = {}
    for x in les(K / "dbh" / "900.json")[1:]:
        kat = x.get("Finmodkode student")
        if x["Årstall"] in SATSER and kat in ("1", "2", "3"):
            sp[x["Progkode student"]][x["Årstall"]][kat] += float(x.get("Ny produksjon egentfin") or 0)
            emnekat[x["Årstall"]] = x.get("Finmodekode emne")
            pn = x.get("Programnavn student")
            if pn and x["Progkode student"] not in programmer:
                programmer.setdefault(x["Progkode student"], {"navn": pn, "nivaa": None, "fakultet": None, "aar": {}, "sem": {},
                                                              "opptak": None, "krav": {}, "grenser": {}, "poeng": {}})
    stat_eier = stk.get(("1173", "STAT100-1"), {})
    fordeling = {"satser": SATSER, "emnekategori": emnekat,
                 "emneeier": stat_eier.get("faknavn") or stat_eier.get("avdnavn") or "Fakultet for kjemi, bioteknologi og matvitenskap",
                 # Intern fordeling av studiepoenginntekten ved NMBU, slik Handelshøyskolen har oppgitt den (15.10.2026)
                 "intern": {"sentralt": 0.6, "fakultet": 0.4},
                 "programmer": {pk: {y: {k: round(v, 3) for k, v in kk.items()} for y, kk in by.items()} for pk, by in sp.items()}}

    emneinfo = les(K / "emneinfo.json") if (K / "emneinfo.json").exists() else {"emner": []}
    emneinfo["emner"] = [e for e in emneinfo["emner"] if e.get("kode") != "3MET130"]

    ut = {"versjon": 1, "aar": aar, "karakterer": karakterer, "fs": fs, "programmer": programmer, "kravkoder": opp["kravkoder"],
          "oa": oa, "andre": andre, "fordeling": fordeling, "emneinfo": emneinfo,
          "kilder": {"dbh": "DBH/HK-dir tabell 308, 571 og 900", "so": "Samordna opptak (hovedopptak, kravkoder)", "hentet": "2026-10-15"}}

    raw = json.dumps(ut, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    pw = passord(a)
    salt, iv = os.urandom(16), os.urandom(12)
    key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITER).derive(pw.encode("utf-8"))
    ct = AESGCM(key).encrypt(iv, raw, None)
    json.dump({"v": 1, "alg": "AES-256-GCM/PBKDF2-SHA256", "iter": ITER, "salt": base64.b64encode(salt).decode(),
               "iv": base64.b64encode(iv).decode(), "data": base64.b64encode(ct).decode()}, open(OUT, "w", encoding="utf-8"))
    print(f"{OUT.relative_to(ROOT)}: {len(raw) // 1024} kB før kryptering; {len(programmer)} program, {len(oa)} ØA-rader, "
          f"{len(andre)} andre emner, {len(emneinfo.get('emner', []))} emner med pensum/læringsmål"
          + (" – TESTPASSORD, ikke commit" if a.testpassord else ""))


if __name__ == "__main__":
    main()
