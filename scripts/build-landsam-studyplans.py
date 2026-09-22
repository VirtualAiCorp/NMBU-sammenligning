#!/usr/bin/env python3
"""Kobler obligatoriske emner fra studieplanene (data/landsam/studieplaner/<entryId>.json)
til DBH-karakterene i kilde/src/app/data/landsamCourseData.json, og skriver
kilde/src/app/data/landsamStudyPlanData.ts (+ .json-tvilling).

Karakterer summeres over dbhEmnekoder per år; snitt (A=5…F=0), stryk- og beståttprosent
regnes på nytt av summene.

Bruk:
  python3 scripts/build-landsam-studyplans.py
"""
import argparse
import datetime as dt
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEF_PROGRAMKART = os.path.join(ROOT, "data", "landsam", "programkart.json")
DEF_PLANS = os.path.join(ROOT, "data", "landsam", "studieplaner")
DEF_COURSES = os.path.join(ROOT, "kilde", "src", "app", "data", "landsamCourseData.json")
DEF_OUT = os.path.join(ROOT, "kilde", "src", "app", "data", "landsamStudyPlanData.ts")

GRADES = ["A", "B", "C", "D", "E", "F", "G", "H"]
POINTS = {"A": 5, "B": 4, "C": 3, "D": 2, "E": 1, "F": 0}


def ts(s):
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def ts_or_null(v):
    return "null" if v is None else ts(v)


def num_or_null(v):
    return "null" if v is None else (str(int(v)) if float(v).is_integer() else str(v))


def sum_years(course_rows, codes):
    """course_rows: dict emnekode -> list[CourseGradeYear]; returns list of summed years."""
    by_year = {}
    for code in codes:
        for y in course_rows.get(code, []):
            acc = by_year.setdefault(y["year"], {g: 0 for g in GRADES + ["skjult"]})
            for g in GRADES:
                acc[g] += int(y.get(g) or 0)
            acc["skjult"] += int(y.get("skjult") or 0)
    out = []
    for year in sorted(by_year):
        c = by_year[year]
        letters = sum(c[g] for g in "ABCDEF")
        gh = c["G"] + c["H"]
        snitt = round(sum(POINTS[g] * c[g] for g in "ABCDEF") / letters, 2) if letters else None
        stryk = round(c["F"] / letters * 100, 1) if letters else None
        bestatt = round(c["G"] / gh * 100, 1) if gh else None
        out.append({"year": year, **{g: c[g] for g in GRADES}, "total": letters + gh, "snitt": snitt,
                    "strykprosent": stryk, "bestattprosent": bestatt, "skjult": c["skjult"]})
    return out


def render_year(y):
    return ("{ year: %d, A: %d, B: %d, C: %d, D: %d, E: %d, F: %d, G: %d, H: %d, total: %d, "
            "snitt: %s, strykprosent: %s, bestattprosent: %s, skjult: %d }") % (
        y["year"], y["A"], y["B"], y["C"], y["D"], y["E"], y["F"], y["G"], y["H"], y["total"],
        num_or_null(y["snitt"]), num_or_null(y["strykprosent"]), num_or_null(y["bestattprosent"]), y.get("skjult", 0))


def build_course(pc, course_rows, name_by_code):
    codes = [c for c in pc.get("dbhEmnekoder", []) if c in course_rows]
    missing = [c for c in pc.get("dbhEmnekoder", []) if c not in course_rows]
    if missing:
        print(f"    [advarsel] {pc.get('emnekode')}: dbh-koder uten data {missing}", file=sys.stderr)
    return {
        "emnekode": pc.get("emnekode") or (codes[0] if codes else ""),
        "emnenavn": pc.get("emnenavn") or (name_by_code.get(codes[0]) if codes else "") or "",
        "studiepoeng": pc.get("studiepoeng"),
        "aar": pc.get("aar"),
        "semester": pc.get("semester"),
        "dbhEmnekoder": codes,
        "merknad": pc.get("merknad") or None,
        "years": sum_years(course_rows, codes),
    }


def render_course(c, indent):
    pad = " " * indent
    L = [pad + "{"]
    L.append(pad + f"  emnekode: {ts(c['emnekode'])}, emnenavn: {ts(c['emnenavn'])}, "
             f"studiepoeng: {num_or_null(c['studiepoeng'])}, aar: {num_or_null(c['aar'])}, "
             f"semester: {ts_or_null(c['semester'])},")
    L.append(pad + f"  dbhEmnekoder: [{', '.join(ts(x) for x in c['dbhEmnekoder'])}],"
             + (f" merknad: {ts(c['merknad'])}," if c.get("merknad") else ""))
    if c["years"]:
        L.append(pad + "  years: [")
        for y in c["years"]:
            L.append(pad + "    " + render_year(y) + ",")
        L.append(pad + "  ],")
    else:
        L.append(pad + "  years: [],")
    L.append(pad + "},")
    return L


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--programkart", default=DEF_PROGRAMKART)
    ap.add_argument("--plans", default=DEF_PLANS)
    ap.add_argument("--courses", default=DEF_COURSES)
    ap.add_argument("--out", default=DEF_OUT)
    a = ap.parse_args()

    pk = json.load(open(a.programkart, encoding="utf-8"))
    cd = json.load(open(a.courses, encoding="utf-8"))
    course_index = {}   # entryId -> emnekode -> years
    name_index = {}     # entryId -> emnekode -> navn
    for g in cd["groups"]:
        for p in g["programs"]:
            course_index[p["entryId"]] = {c["emnekode"]: c["years"] for c in p["courses"]}
            name_index[p["entryId"]] = {c["emnekode"]: c["emnenavn"] for c in p["courses"]}

    groups_out = []
    n_files = n_courses = n_linked = 0
    for g in pk["groups"]:
        progs = []
        for p in g["programs"]:
            eid = p["id"]
            path = os.path.join(a.plans, eid + ".json")
            rows = course_index.get(eid, {})
            names = name_index.get(eid, {})
            base = {"entryId": eid, "shortName": p["shortName"], "institusjon": p["institusjon"],
                    "isNmbu": bool(p.get("isNmbu")), "programnavn": p.get("programnavn", "")}
            if not os.path.exists(path):
                progs.append({**base, "studieplanAar": None, "kilder": [], "totaltStudiepoeng": None,
                              "obligatoriskeStudiepoeng": None, "merknad": "Studieplan ikke hentet ennå.",
                              "obligatoriske": [], "spesialiseringer": []})
                continue
            plan = json.load(open(path, encoding="utf-8"))
            n_files += 1
            print(f"{g['id']}/{eid}: {len(plan.get('obligatoriske', []))} obligatoriske")
            oblig = [build_course(pc, rows, names) for pc in plan.get("obligatoriske", [])]
            specs = [{"navn": s.get("navn", ""),
                      "obligatoriske": [build_course(pc, rows, names) for pc in s.get("obligatoriske", [])]}
                     for s in plan.get("spesialiseringer", []) or []]
            n_courses += len(oblig)
            n_linked += sum(1 for c in oblig if c["years"])
            progs.append({**base, "studieplanAar": plan.get("studieplanAar"), "kilder": plan.get("kilder", []),
                          "totaltStudiepoeng": plan.get("totaltStudiepoeng"),
                          "obligatoriskeStudiepoeng": plan.get("obligatoriskeStudiepoeng"),
                          "merknad": plan.get("merknad") or None, "obligatoriske": oblig, "spesialiseringer": specs})
        groups_out.append({"id": g["id"], "label": g["label"], "level": g["level"], "programs": progs})

    today = dt.date.today().isoformat()
    L = [f"// GENERERT av scripts/build-landsam-studyplans.py {today} – ikke rediger for hånd.",
         "// Kilde: data/landsam/studieplaner/*.json (obligatoriske emner fra studieplanene) koblet til DBH tabell 308/208.",
         "// Karakterer er summert over dbhEmnekoder per år; snitt A=5…F=0 over bokstavkarakterer.",
         "import type { LandsamLevel } from './landsamAdmissionData';",
         "import type { CourseGradeYear } from './landsamCourseData';",
         "",
         "export interface PlanCourse {",
         "  emnekode: string; emnenavn: string; studiepoeng: number | null; aar: number | null; semester: string | null;",
         "  dbhEmnekoder: string[]; merknad?: string; years: CourseGradeYear[];",
         "}",
         "export interface PlanSpecialisation { navn: string; obligatoriske: PlanCourse[]; }",
         "export interface ProgramStudyPlan {",
         "  entryId: string; shortName: string; institusjon: string; isNmbu: boolean; programnavn: string;",
         "  studieplanAar: string | null; kilder: string[]; totaltStudiepoeng: number | null; obligatoriskeStudiepoeng: number | null;",
         "  merknad?: string; obligatoriske: PlanCourse[]; spesialiseringer: PlanSpecialisation[];",
         "}",
         "export interface LandsamStudyPlanGroup { id: string; label: string; level: LandsamLevel; programs: ProgramStudyPlan[]; }",
         "",
         "export const LANDSAM_STUDYPLAN_GROUPS: LandsamStudyPlanGroup[] = ["]
    for g in groups_out:
        L.append("  {")
        L.append(f"    id: {ts(g['id'])}, label: {ts(g['label'])}, level: {ts(g['level'])},")
        L.append("    programs: [")
        for p in g["programs"]:
            L.append("      {")
            L.append(f"        entryId: {ts(p['entryId'])}, shortName: {ts(p['shortName'])}, institusjon: {ts(p['institusjon'])}, "
                     f"isNmbu: {'true' if p['isNmbu'] else 'false'}, programnavn: {ts(p['programnavn'])},")
            L.append(f"        studieplanAar: {ts_or_null(p['studieplanAar'])}, kilder: [{', '.join(ts(k) for k in p['kilder'])}],")
            L.append(f"        totaltStudiepoeng: {num_or_null(p['totaltStudiepoeng'])}, obligatoriskeStudiepoeng: {num_or_null(p['obligatoriskeStudiepoeng'])},")
            if p.get("merknad"):
                L.append(f"        merknad: {ts(p['merknad'])},")
            L.append("        obligatoriske: [")
            for c in p["obligatoriske"]:
                L.extend(render_course(c, 10))
            L.append("        ],")
            L.append("        spesialiseringer: [")
            for s in p["spesialiseringer"]:
                L.append(f"          {{ navn: {ts(s['navn'])}, obligatoriske: [")
                for c in s["obligatoriske"]:
                    L.extend(render_course(c, 12))
                L.append("          ] },")
            L.append("        ],")
            L.append("      },")
        L.append("    ],")
        L.append("  },")
    L.append("];")
    L.append("")
    open(a.out, "w", encoding="utf-8").write("\n".join(L))
    json.dump({"generert": today, "groups": groups_out}, open(a.out[:-3] + ".json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n{n_files} studieplaner, {n_courses} obligatoriske emner, {n_linked} med karakterdata. Skrev {a.out}")


if __name__ == "__main__":
    main()
