#!/usr/bin/env python3
"""Nasjonalt emnedatasett for «Sammenlignbare emner ved andre studiesteder».

Henter for hver institusjon (DBH, 5 år): tabell 208 (emnenavn, NUS-kode, studiepoeng, nivå),
308 på emnenivå (karakterfordeling) og 308-totaler uten karakter (for «skjult»).
Gjenbruker cache fra fakultetsmappene (data/*/kilder/dbh-cache/), ellers data/nmbu/kilder/dbh-cache/.

Skriver:
  kilde/public/emner/index.json          alle emner (kompakt): [inst, kode, navn, nus, sp, nivå, kand. sum]
  kilde/public/emner/nus/<xxx>.json       emner per NUS-fagfelt (siffer 2–4 i NUS-koden, uavhengig av nivå)
                                          med karakterer per år: [A,B,C,D,E,F,G,H,total,skjult]
  kilde/public/emner/meta.json            institusjoner, NUS-navn, år

Bruk:
  python3 scripts/build-national-courses.py [--refresh] [--only 1240,8253]
"""
import argparse
import collections
import datetime as dt
import glob
import importlib.util
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("blc", ROOT / "scripts" / "build-landsam-courses.py")
blc = importlib.util.module_from_spec(spec); spec.loader.exec_module(blc)

YEARS = 5
GRADES = ["A", "B", "C", "D", "E", "F", "G", "H"]
# Institusjoner med karakterer i DBH 2025, over ca. 3 000 kandidater, pluss AHO (arkitektur).
INSTITUSJONER = {
    "1150": ("NTNU", "Norges teknisk-naturvitenskapelige universitet"),
    "8241": ("BI", "Handelshøyskolen BI"),
    "1110": ("UiO", "Universitetet i Oslo"),
    "1175": ("OsloMet", "OsloMet – storbyuniversitetet"),
    "1120": ("UiB", "Universitetet i Bergen"),
    "1176": ("USN", "Universitetet i Sørøst-Norge"),
    "0238": ("HVL", "Høgskulen på Vestlandet"),
    "1171": ("UiA", "Universitetet i Agder"),
    "1130": ("UiT", "UiT Norges arktiske universitet"),
    "8253": ("Kristiania", "Høyskolen Kristiania"),
    "1160": ("UiS", "Universitetet i Stavanger"),
    "1177": ("INN", "Høgskolen i Innlandet"),
    "1173": ("NMBU", "Norges miljø- og biovitenskapelige universitet"),
    "1174": ("Nord", "Nord universitet"),
    "1240": ("NHH", "Norges handelshøyskole"),
    "0256": ("HiØ", "Høgskolen i Østfold"),
    "8208": ("VID", "VID vitenskapelige høgskole"),
    "1407": ("Oslo Nye", "Oslo Nye Høyskole"),
    "0232": ("HiMolde", "Høgskolen i Molde"),
    "8223": ("NLA", "NLA Høgskolen"),
    "0236": ("HVO", "Høgskulen i Volda"),
    "1260": ("NIH", "Norges idrettshøgskole"),
    "8202": ("LDH", "Lovisenberg diakonale høgskole"),
    "1220": ("AHO", "Arkitektur- og designhøgskolen i Oslo"),
}


def find_cache(name: str) -> Path:
    # Cachen kan være komprimert (<navn>.json.gz); fetch_dbh leser begge
    for p in glob.glob(str(ROOT / "data" / "*" / "kilder" / "dbh-cache" / name)) + glob.glob(str(ROOT / "data" / "*" / "kilder" / "dbh-cache" / (name + ".gz"))):
        return Path(p[:-3] if p.endswith(".gz") else p)
    return ROOT / "data" / "nmbu" / "kilder" / "dbh-cache" / name


def n(r, k="Antall kandidater totalt"):
    try:
        return int(float(r.get(k) or 0))
    except ValueError:
        return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    ap.add_argument("--only", default="")
    ap.add_argument("--out", default=str(ROOT / "kilde" / "public" / "emner"))
    a = ap.parse_args()
    only = set(a.only.split(",")) if a.only else None
    nus = {c["code"]: c["name"] for c in json.load(open(glob.glob(str(ROOT / "data/nmbu/kilder/nus2000_*.json"))[0], encoding="utf-8"))["codes"]}

    index, groups, years_all = [], collections.defaultdict(list), set()
    for inst, (kort, navn) in INSTITUSJONER.items():
        if only and inst not in only:
            continue
        print(f"== {inst} {kort}", file=sys.stderr)
        r208 = blc.fetch_dbh(blc.dbh_query_208(inst, YEARS), find_cache(f"208_{inst}_5y.json"), a.refresh)
        r308e = blc.fetch_dbh(blc.dbh_query_308_emne(inst, YEARS), find_cache(f"308e_{inst}_5y.json"), a.refresh)
        r308et = blc.fetch_dbh(blc.dbh_query_308_emne_totals(inst, YEARS), find_cache(f"308et_{inst}_5y.json"), a.refresh)
        if not r308e:
            print(f"   [hopper over] ingen 308e for {inst}", file=sys.stderr)
            continue
        meta = {}
        for r in sorted(r208, key=lambda r: (r.get("Årstall", ""), r.get("Semester", ""))):
            k = r["Emnekode"]
            m = meta.setdefault(k, {})
            if r.get("Emnenavn"): m["navn"] = r["Emnenavn"]
            if r.get("NUS-kode"): m["nus"] = r["NUS-kode"]
            if r.get("Studiepoeng"):
                try: m["sp"] = float(r["Studiepoeng"])
                except ValueError: pass
            if r.get("Nivåkode"): m["nivaa"] = r["Nivåkode"]
        grades = collections.defaultdict(lambda: collections.defaultdict(collections.Counter))
        for r in r308e:
            if r.get("Karakter") in GRADES:
                grades[r["Emnekode"]][r["Årstall"]][r["Karakter"]] += n(r)
        totals = collections.defaultdict(dict)
        for r in r308et:
            totals[r["Emnekode"]][r["Årstall"]] = totals[r["Emnekode"]].get(r["Årstall"], 0) + n(r)
        cnt = 0
        for k in sorted(set(grades) | set(totals)):
            yrs = {}
            for y in sorted(set(grades.get(k, {})) | set(totals.get(k, {}))):
                c = grades.get(k, {}).get(y, collections.Counter())
                tot = totals.get(k, {}).get(y, 0)
                arr = [c.get(g, 0) for g in GRADES]
                vis = sum(arr)
                if vis == 0 and tot == 0:
                    continue
                yrs[y] = arr + [max(vis, tot), max(0, tot - vis)]
                years_all.add(y)
            if not yrs:
                continue
            m = meta.get(k, {})
            kand = sum(v[8] for v in yrs.values())
            code = m.get("nus") or ""
            grp = code[1:4] if len(code) >= 4 else "ukjent"
            index.append([inst, k, m.get("navn", ""), code, m.get("sp"), m.get("nivaa"), kand])
            groups[grp].append({"inst": inst, "kode": k, "navn": m.get("navn", ""), "nus": code, "sp": m.get("sp"),
                                "nivaa": m.get("nivaa"), "years": yrs})
            cnt += 1
        print(f"   {cnt} emner", file=sys.stderr)

    out = Path(a.out); (out / "nus").mkdir(parents=True, exist_ok=True)
    today = dt.date.today().isoformat()
    used_nus = {c[3] for c in index if c[3]}
    nus_names = {k: v for k, v in nus.items() if k in used_nus or (len(k) == 4 and any(u.startswith(k) for u in used_nus)) or len(k) <= 3}
    json.dump({"generert": today, "years": sorted(years_all),
               "institusjoner": {k: {"kort": v[0], "navn": v[1]} for k, v in INSTITUSJONER.items() if not only or k in only},
               "nus": nus_names, "kilde": "DBH/HKDIR tabell 208 og 308 (emnenivå); NUS2000 fra SSB (Klass 36)"},
              open(out / "meta.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump({"generert": today, "felter": ["inst", "kode", "navn", "nus", "sp", "nivaa", "kandidater"], "courses": index},
              open(out / "index.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    for grp, rows in groups.items():
        json.dump({"gruppe": grp, "courses": rows}, open(out / "nus" / f"{grp}.json", "w", encoding="utf-8"),
                  ensure_ascii=False, separators=(",", ":"))
    tot_mb = sum(os.path.getsize(p) for p in glob.glob(str(out / "**" / "*.json"), recursive=True)) / 1e6
    print(f"{len(index)} emner, {len(groups)} NUS-grupper, {tot_mb:.1f} MB -> {out}")


if __name__ == "__main__":
    main()
