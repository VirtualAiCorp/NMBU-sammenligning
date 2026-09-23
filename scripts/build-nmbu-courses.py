#!/usr/bin/env python3
"""Bygger kilde/public/nmbu-emner.json: karakterfordeling for ALLE emner ved NMBU (DBH tabell 308),
både for hele emnet og per studieprogram som har studenter på emnet.

Kilder (DBH-cache fra build-landsam-courses.py, institusjon 1173, 5 år):
  308_1173_5y.json   karakter × studieprogram × emne × år (programnivå, skjermet for 1–2)
  308e_1173_5y.json  karakter × emne × år (emnenivå, lite skjermet)
  308et_1173_5y.json totaler per emne × år uten karakter (for «skjult»)
  308pt_1173_5y.json totaler per program × emne × år uten karakter (for «skjult»)
  208_1173_5y.json   emnenavn, studiepoeng, nivå
  data/nmbu/kilder/347_1173_*.json  studieprogram: navn, nivå, fakultet

Format (kompakt): tall per år = [A,B,C,D,E,F,G,H,total,skjult, A_kvinner…H_kvinner] (indeks 10–17 = kvinner per karakter).

Bruk:
  python3 scripts/build-nmbu-courses.py [--cache data/landsam/kilder/dbh-cache]
"""
import argparse
import collections
import datetime as dt
import glob
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GRADES = ["A", "B", "C", "D", "E", "F", "G", "H"]


def rows(path):
    d = json.load(open(path, encoding="utf-8"))
    return d[1:] if d and isinstance(d[0], dict) and "status" in d[0] else d


def n(r, k="Antall kandidater totalt"):
    try:
        return int(float(r.get(k) or 0))
    except ValueError:
        return 0


def pack(counts, true_total, kvinner=None):
    arr = [counts.get(g, 0) for g in GRADES]
    vis = sum(arr)
    skjult = max(0, (true_total or 0) - vis)
    kv = [(kvinner or {}).get(g, 0) for g in GRADES]
    return arr + [vis + skjult, skjult] + kv


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", default=os.path.join(ROOT, "data", "landsam", "kilder", "dbh-cache"))
    ap.add_argument("--out", default=os.path.join(ROOT, "kilde", "public", "nmbu-emner.json"))
    a = ap.parse_args()
    C = lambda name: os.path.join(a.cache, f"{name}_1173_5y.json")

    # Emnenivå
    course = collections.defaultdict(lambda: collections.defaultdict(collections.Counter))  # kode -> år -> Counter
    course_kv = collections.defaultdict(lambda: collections.defaultdict(collections.Counter))
    for r in rows(C("308e")):
        if r.get("Karakter") in GRADES:
            course[r["Emnekode"]][r["Årstall"]][r["Karakter"]] += n(r)
            course_kv[r["Emnekode"]][r["Årstall"]][r["Karakter"]] += n(r, "Antall kandidater kvinner")
    course_tot = collections.defaultdict(dict)
    for r in rows(C("308et")):
        course_tot[r["Emnekode"]][r["Årstall"]] = course_tot[r["Emnekode"]].get(r["Årstall"], 0) + n(r)

    # Programnivå
    prog = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(collections.Counter)))
    prog_kv = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(collections.Counter)))
    prog_names, prog_fac = {}, {}
    for r in rows(C("308")):
        if r.get("Karakter") in GRADES:
            prog[r["Emnekode"]][r["Studieprogramkode"]][r["Årstall"]][r["Karakter"]] += n(r)
            prog_kv[r["Emnekode"]][r["Studieprogramkode"]][r["Årstall"]][r["Karakter"]] += n(r, "Antall kandidater kvinner")
        prog_names.setdefault(r["Studieprogramkode"], r.get("Studieprogramnavn"))
        if r.get("Avdelingsnavn") and "uspesifisert" not in r["Avdelingsnavn"]:
            prog_fac.setdefault(r["Studieprogramkode"], r["Avdelingsnavn"])
    prog_tot = collections.defaultdict(lambda: collections.defaultdict(dict))
    for r in rows(C("308pt")):
        d = prog_tot[r["Emnekode"]][r["Studieprogramkode"]]
        d[r["Årstall"]] = d.get(r["Årstall"], 0) + n(r)

    # Emnenavn, studiepoeng, nivå (siste år vinner)
    names, sp, nivaa, nus_by, course_fac = {}, {}, {}, {}, collections.defaultdict(collections.Counter)
    for r in sorted(rows(C("208")), key=lambda r: (r.get("Årstall", ""), r.get("Semester", ""))):
        k = r["Emnekode"]
        if r.get("Emnenavn"):
            names[k] = r["Emnenavn"]
        if r.get("Studiepoeng"):
            try:
                sp[k] = float(r["Studiepoeng"])
            except ValueError:
                pass
        if r.get("Nivånavn"):
            nivaa[k] = r["Nivånavn"]
        if r.get("NUS-kode"):
            nus_by[k] = r["NUS-kode"]
        if r.get("Avdelingsnavn") and "uspesifisert" not in r["Avdelingsnavn"]:
            course_fac[k][r["Avdelingsnavn"]] += 1

    # Studieprogramregister (347)
    programs = {}
    for f in sorted(glob.glob(os.path.join(ROOT, "data", "nmbu", "kilder", "347_1173_*.json"))):
        for r in sorted(rows(f), key=lambda r: r.get("Årstall", "")):
            programs[r["Studieprogramkode"]] = {
                "navn": r.get("Studieprogramnavn"), "nivaa": r.get("Nivånavn"),
                "fakultet": r.get("Avdelingsnavn") if "uspesifisert" not in (r.get("Avdelingsnavn") or "") else None,
            }
    for k, navn in prog_names.items():
        programs.setdefault(k, {"navn": navn, "nivaa": None, "fakultet": prog_fac.get(k)})
        programs[k]["navn"] = programs[k]["navn"] or navn
        programs[k]["fakultet"] = programs[k]["fakultet"] or prog_fac.get(k)

    years = sorted({y for k in course for y in course[k]} | {y for k in course_tot for y in course_tot[k]})
    out_courses = []
    for k in sorted(set(course) | set(course_tot)):
        yrs = {}
        for y in years:
            tot = course_tot.get(k, {}).get(y, 0)
            cnt = course.get(k, {}).get(y, collections.Counter())
            if tot == 0 and not sum(cnt.values()):
                continue
            yrs[y] = pack(cnt, tot, course_kv.get(k, {}).get(y))
        if not yrs:
            continue
        progs = {}
        for pk in set(prog.get(k, {})) | set(prog_tot.get(k, {})):
            py = {}
            for y in years:
                tot = prog_tot.get(k, {}).get(pk, {}).get(y, 0)
                cnt = prog.get(k, {}).get(pk, {}).get(y, collections.Counter())
                if tot == 0 and not sum(cnt.values()):
                    continue
                py[y] = pack(cnt, tot, prog_kv.get(k, {}).get(pk, {}).get(y))
            if py:
                progs[pk] = py
        fac = course_fac[k].most_common(1)[0][0] if course_fac.get(k) else None
        out_courses.append({"kode": k, "navn": names.get(k, ""), "studiepoeng": sp.get(k), "nivaa": nivaa.get(k),
                            "nus": nus_by.get(k), "fakultet": fac, "years": yrs, "programs": progs})

    used = {pk for c in out_courses for pk in c["programs"]}
    out = {"generert": dt.date.today().isoformat(), "kilde": "DBH/HKDIR tabell 308 (karakterer), 208 (emner), 347 (studieprogram); institusjon 1173",
           "years": years, "programs": {k: v for k, v in programs.items() if k in used}, "courses": out_courses}
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    json.dump(out, open(a.out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{len(out_courses)} emner, {len(out['programs'])} studieprogram, år {years[0]}–{years[-1]}, "
          f"{os.path.getsize(a.out) / 1e6:.1f} MB -> {a.out}")


if __name__ == "__main__":
    main()
