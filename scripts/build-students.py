#!/usr/bin/env python3
"""«Studentene» per studieprogram: alder, utenlandske studenter og utveksling ut (DBH/HKDIR).

Kilder (høstsemester der ikke annet er sagt, per institusjon, cache i data/nmbu/kilder/dbh-studenter/):
  60   Studenter fordelt på alder. Hentes som fire aldersgrupper (≤ 21, 22–24, 25–29, 30+) ved å FILTRERE
       på alder (between) og gruppere bare på år × program. Enkeltårsalder skjermes hardt (1–2 blir 0), og
       det rammer nettopp de eldste; grupper via filter gir én stor celle per gruppe.
       Pluss totalen (uten aldersfilter) som nevner.
  135  Utenlandske studenter (utenlandsk statsborgerskap), høst.
  142  Utvekslingsstudenter, Type = NORSK: programmets egne studenter på utveksling ut, sum vår + høst.
       (Innreisende ligger på et eget UTVEKSLING-program og hører ikke til noe studieprogram.)
Landssnitt: de samme sju spørringene summert over alle institusjoner per år og nivåkode.

Bruk:
  python3 scripts/build-students.py [fakultet ...] [--refresh]
"""
import argparse
import datetime as dt
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("blc", ROOT / "scripts" / "build-landsam-courses.py")
blc = importlib.util.module_from_spec(spec); spec.loader.exec_module(blc)

YEARS = [str(y) for y in range(2019, 2026)]
CACHE = ROOT / "data" / "nmbu" / "kilder" / "dbh-studenter"
FAKULTETER = ["landsam", "realtek", "kbm", "mina", "biovit", "vet", "hh"]
NIVAA = ["B3", "M2", "M5", "PR"]
# (nøkkel, tabell, ekstra filtre)
SERIES = [
    ("total", 60, [("Semester", "item", ["3"])]),
    ("a21", 60, [("Semester", "item", ["3"]), ("Alder", "between", ["0", "21"])]),
    ("a24", 60, [("Semester", "item", ["3"]), ("Alder", "between", ["22", "24"])]),
    ("a29", 60, [("Semester", "item", ["3"]), ("Alder", "between", ["25", "29"])]),
    ("a30", 60, [("Semester", "item", ["3"]), ("Alder", "between", ["30", "99"])]),
    ("utenlandske", 135, [("Semester", "item", ["3"])]),
    ("utveksling", 142, [("Type", "item", ["NORSK"])]),
]


def body(tid, scope_filter, group_by, extra):
    f = [scope_filter, {"variabel": "Årstall", "selection": {"filter": "between", "values": [YEARS[0], YEARS[-1]]}}]
    f += [{"variabel": v, "selection": {"filter": kind, "values": vals}} for v, kind, vals in extra]
    return {"tabell_id": tid, "api_versjon": 1, "statuslinje": "J", "kodetekst": "N", "desimal_separator": ".",
            "groupBy": group_by, "sortBy": ["Årstall"], "filter": f}


def fetch_series(scope_name, scope_filter, group_by, refresh):
    out = {}
    for key, tid, extra in SERIES:
        path = CACHE / f"{scope_name}_{key}.json"
        try:
            out[key] = blc.fetch_dbh(body(tid, scope_filter, group_by, extra), path, refresh)
        except json.JSONDecodeError:
            out[key] = []
    return out


def n(r):
    try:
        return int(float(r.get("Antall totalt") or 0))
    except ValueError:
        return 0


def ts(s):
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def aggregate(rows_by_key, match):
    """rows_by_key: {nøkkel: [rader]}; match(rad) -> bool. Returnerer {år: {nøkkel: sum}}."""
    years = {}
    for key, rows in rows_by_key.items():
        for r in rows:
            if not match(r):
                continue
            y = years.setdefault(int(r["Årstall"]), {k: 0 for k, _, _ in SERIES} | {"_har": set()})
            y[key] += n(r); y["_har"].add(key)
    out = []
    for y in sorted(years):
        v = years[y]
        if not v["total"]:
            continue
        row = {"aar": y}
        for k, _, _ in SERIES:
            row[k] = v[k] if k in v["_har"] or k in ("a21", "a24", "a29", "a30") else None
        out.append(row)
    return out


def emit_rows(rows):
    return ", ".join("{ " + ", ".join(f"{k}: {'null' if v is None else v}" for k, v in r.items()) + " }" for r in rows)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("fakultet", nargs="*")
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    faks = a.fakultet or [f for f in FAKULTETER if (ROOT / "data" / f / "dbh-programkart.json").exists()]

    plans = {}
    insts = set()
    for fak in faks:
        pk = json.load(open(ROOT / "data" / fak / "programkart.json", encoding="utf-8"))
        dk = {p["entryId"]: p for p in json.load(open(ROOT / "data" / fak / "dbh-programkart.json", encoding="utf-8"))["programs"]}
        plans[fak] = (pk, dk)
        for p in dk.values():
            insts.update(p.get("institusjonskoder") or [p["institusjonskode"]])

    raw = {}
    for inst in sorted(insts):
        raw[inst] = fetch_series(inst, {"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [inst]}},
                                 ["Årstall", "Studieprogramkode"], a.refresh)
    nat = fetch_series("nasjonalt_nivaa", {"variabel": "Nivåkode", "selection": {"filter": "item", "values": NIVAA}},
                       ["Årstall", "Nivåkode"], a.refresh)

    today = dt.date.today().isoformat()
    head = [f"// GENERERT av scripts/build-students.py {today} – ikke rediger for hånd.",
            "// Kilde: DBH/HKDIR tabell 60 (alder, høst; aldersgrupper via filter), 135 (utenlandske studenter, høst), 142 (utveksling ut, vår + høst)."]

    # Landssnitt (felles modul)
    L = head + [
        "export interface StudentYear { aar: number; total: number; a21: number; a24: number; a29: number; a30: number; utenlandske: number | null; utveksling: number | null; }",
        f"export const STUDENT_HENTET = {ts(today)};",
        "export const STUDENT_NATIONAL: Record<string, StudentYear[]> = {"]
    for niv in NIVAA:
        rows = aggregate(nat, lambda r, niv=niv: r.get("Nivåkode") == niv)
        L.append(f"  {niv}: [{emit_rows(rows)}],")
    L += ["};", ""]
    (ROOT / "kilde" / "src" / "app" / "data" / "studentNationalData.ts").write_text("\n".join(L), encoding="utf-8")

    for fak, (pk, dk) in plans.items():
        groups = []
        n_prog = 0
        for g in pk["groups"]:
            progs = []
            for p in g["programs"]:
                m = dk.get(p["id"])
                if not m or not m.get("studieprogramkoder"):
                    continue
                codes = set(m["studieprogramkoder"])
                icodes = m.get("institusjonskoder") or [m["institusjonskode"]]
                merged = {k: [r for i in icodes for r in raw[i][k]] for k, _, _ in SERIES}
                rows = aggregate(merged, lambda r, codes=codes: r.get("Studieprogramkode") in codes)
                if not rows:
                    continue
                progs.append({"entryId": p["id"], "shortName": p["shortName"], "institusjon": p["institusjon"],
                              "isNmbu": bool(p.get("isNmbu")), "programnavn": p.get("programnavn", ""),
                              "nivaa": m.get("nivaakode"), "aar": rows})
                n_prog += 1
            groups.append({"id": g["id"], "label": g["label"], "level": g["level"],
                           "nmbuIds": [p["id"] for p in g["programs"] if p.get("isNmbu")],
                           "defaultIds": [p["id"] for p in g["programs"] if p.get("default")], "programs": progs})
        out = ROOT / "kilde" / "src" / "app" / "data" / f"{fak}StudentData.ts"
        L = head + ["import type { LandsamLevel } from './landsamAdmissionData';",
                    "import type { StudentYear } from './studentNationalData';",
                    "export interface StudentProgram { entryId: string; shortName: string; institusjon: string; isNmbu: boolean; programnavn: string; nivaa: string | null; aar: StudentYear[]; }",
                    "export interface StudentGroup { id: string; label: string; level: LandsamLevel; nmbuIds: string[]; defaultIds: string[]; programs: StudentProgram[]; }",
                    "export const STUDENT_GROUPS: StudentGroup[] = ["]
        for g in groups:
            L.append(f"  {{ id: {ts(g['id'])}, label: {ts(g['label'])}, level: {ts(g['level'])}, "
                     f"nmbuIds: [{', '.join(ts(x) for x in g['nmbuIds'])}], defaultIds: [{', '.join(ts(x) for x in g['defaultIds'])}], programs: [")
            for p in g["programs"]:
                L.append(f"    {{ entryId: {ts(p['entryId'])}, shortName: {ts(p['shortName'])}, institusjon: {ts(p['institusjon'])}, "
                         f"isNmbu: {'true' if p['isNmbu'] else 'false'}, programnavn: {ts(p['programnavn'])}, "
                         f"nivaa: {ts(p['nivaa']) if p['nivaa'] else 'null'}, aar: [{emit_rows(p['aar'])}] }},")
            L.append("  ] },")
        L += ["];", ""]
        out.write_text("\n".join(L), encoding="utf-8")
        json.dump({"generert": today, "groups": groups}, open(str(out)[:-3] + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"{fak}: {n_prog} program med studentdata. Skrev {out.name}")


if __name__ == "__main__":
    main()
