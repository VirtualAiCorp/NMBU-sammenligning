#!/usr/bin/env python3
"""Slår sammen data/landsam/emnekobling/<gruppe>.json til kilde/src/app/data/landsamCourseMapping.ts.

Validerer at hver entryId finnes i gruppen og at hver emnekode finnes i landsamCourseData.json
for det programmet. Ugyldige koblinger fjernes med advarsel; tomme emnetyper fjernes.

Bruk:
  python3 scripts/build-landsam-course-mapping.py [--strict]
"""
import argparse
import datetime as dt
import glob
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_IN = os.path.join(ROOT, "data", "landsam", "emnekobling")
DEFAULT_COURSES = os.path.join(ROOT, "kilde", "src", "app", "data", "landsamCourseData.json")
DEFAULT_OUT = os.path.join(ROOT, "kilde", "src", "app", "data", "landsamCourseMapping.ts")


def ts_str(s: str) -> str:
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def load_courses(path):
    d = json.load(open(path, encoding="utf-8"))
    groups = d.get("LANDSAM_COURSE_GROUPS") or d.get("groups") or d
    index = {}  # groupId -> entryId -> set(emnekode)
    for g in groups:
        index[g["id"]] = {p["entryId"]: {c["emnekode"] for c in p["courses"]} for p in g["programs"]}
    return index


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in-dir", default=DEFAULT_IN)
    ap.add_argument("--courses", default=DEFAULT_COURSES)
    ap.add_argument("--out", default=DEFAULT_OUT)
    ap.add_argument("--strict", action="store_true", help="feil (exit 1) ved ugyldige koblinger")
    a = ap.parse_args()

    index = load_courses(a.courses)
    files = sorted(glob.glob(os.path.join(a.in_dir, "*.json")))
    if not files:
        print(f"Ingen koblingsfiler i {a.in_dir}", file=sys.stderr)
        sys.exit(1)

    out_groups, problems = [], []
    for f in files:
        m = json.load(open(f, encoding="utf-8"))
        gid = m["groupId"]
        if gid not in index:
            problems.append(f"{os.path.basename(f)}: ukjent groupId {gid}")
            continue
        entries = index[gid]
        types_out = []
        for t in m.get("emnetyper", []):
            links = []
            for l in t.get("koblinger", []):
                eid = l["entryId"]
                if eid not in entries:
                    problems.append(f"{gid}/{t['id']}: ukjent entryId {eid}")
                    continue
                codes = [c for c in l.get("emnekoder", []) if c in entries[eid]]
                missing = [c for c in l.get("emnekoder", []) if c not in entries[eid]]
                if missing:
                    problems.append(f"{gid}/{t['id']}/{eid}: emnekoder finnes ikke i DBH-data: {missing}")
                if codes:
                    links.append({"entryId": eid, "emnekoder": codes, "merknad": l.get("merknad")})
            if len(links) >= 2:
                types_out.append({**t, "links": links})
            else:
                problems.append(f"{gid}/{t['id']}: færre enn to gyldige koblinger, utelatt")
        out_groups.append({"groupId": gid, "note": m.get("note"), "courseTypes": types_out})
        print(f"{gid}: {len(types_out)} emnetyper, {sum(len(t['links']) for t in types_out)} koblinger")

    for p in problems:
        print("  [advarsel]", p, file=sys.stderr)
    if a.strict and problems:
        sys.exit(1)

    today = dt.date.today().isoformat()
    L = []
    L.append(f"// GENERERT av scripts/build-landsam-course-mapping.py {today} – ikke rediger for hånd.")
    L.append("// Kilde: data/landsam/emnekobling/*.json (manuelt kartlagt mot studieplanene).")
    L.append("export interface CourseTypeLink { entryId: string; emnekoder: string[]; merknad?: string; }")
    L.append("export interface CourseType { id: string; label: string; kategori?: string; desc?: string; note?: string; links: CourseTypeLink[]; }")
    L.append("export interface GroupCourseMapping { groupId: string; note?: string; courseTypes: CourseType[]; }")
    L.append("")
    L.append("export const LANDSAM_COURSE_MAPPING: GroupCourseMapping[] = [")
    for g in out_groups:
        L.append("  {")
        L.append(f"    groupId: {ts_str(g['groupId'])},")
        if g.get("note"):
            L.append(f"    note: {ts_str(g['note'])},")
        L.append("    courseTypes: [")
        for t in g["courseTypes"]:
            L.append("      {")
            L.append(f"        id: {ts_str(t['id'])}, label: {ts_str(t['label'])},"
                     + (f" kategori: {ts_str(t['kategori'])}," if t.get("kategori") else ""))
            if t.get("desc"):
                L.append(f"        desc: {ts_str(t['desc'])},")
            if t.get("note"):
                L.append(f"        note: {ts_str(t['note'])},")
            L.append("        links: [")
            for l in t["links"]:
                codes = ", ".join(ts_str(c) for c in l["emnekoder"])
                extra = f", merknad: {ts_str(l['merknad'])}" if l.get("merknad") else ""
                L.append(f"          {{ entryId: {ts_str(l['entryId'])}, emnekoder: [{codes}]{extra} }},")
            L.append("        ],")
            L.append("      },")
        L.append("    ],")
        L.append("  },")
    L.append("];")
    L.append("")
    open(a.out, "w", encoding="utf-8").write("\n".join(L))
    json.dump({"generert": today, "groups": out_groups},
              open(a.out[:-3] + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"Skrev {a.out}")


if __name__ == "__main__":
    main()
