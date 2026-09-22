#!/usr/bin/env python3
"""Fyller inn dbhEmnekoder i studieplanfilene automatisk ut fra emnekode i planen og
emnekodene som finnes i DBH-dataene (<fakultet>CourseData.json) for samme program.

Regler (i rekkefølge): eksakt lik kode; DBH-kode = plankode + '-<tall>' (NMBU-versjonering);
DBH-kode lik plankode uten mellomrom/bindestrek (f.eks. «TBA 4110» ↔ «TBA4110»).
Eksisterende ikke-tomme dbhEmnekoder røres ikke. Skriver hva som ble koblet og hva som mangler.

Bruk:
  python3 scripts/link-studyplan-codes.py <fakultet>
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def norm(s):
    return re.sub(r"[\s\-_]", "", str(s or "")).upper()


def link(courses_by_entry, entry_id, plan_code):
    codes = courses_by_entry.get(entry_id, [])
    if not plan_code:
        return []
    if plan_code in codes:
        return [plan_code]
    ver = [c for c in codes if re.fullmatch(re.escape(plan_code) + r"-\d+", c)]
    if ver:
        return sorted(ver)
    n = norm(plan_code)
    same = [c for c in codes if norm(c) == n]
    if same:
        return sorted(same)
    ver2 = [c for c in codes if re.fullmatch(re.escape(n) + r"\d+", norm(c)) and "-" in c]
    return sorted(ver2)


def main():
    fak = sys.argv[1] if len(sys.argv) > 1 else "realtek"
    courses_path = os.path.join(ROOT, "kilde", "src", "app", "data", f"{fak}CourseData.json")
    plans_dir = os.path.join(ROOT, "data", fak, "studieplaner")
    cd = json.load(open(courses_path, encoding="utf-8"))
    courses_by_entry = {p["entryId"]: [c["emnekode"] for c in p["courses"]]
                        for g in cd["groups"] for p in g["programs"]}
    tot = linked = 0
    missing = []
    for f in sorted(glob.glob(os.path.join(plans_dir, "*.json"))):
        plan = json.load(open(f, encoding="utf-8"))
        eid = plan["entryId"]
        changed = False
        lists = [plan.get("obligatoriske", [])] + [s.get("obligatoriske", []) for s in plan.get("spesialiseringer", []) or []]
        for lst in lists:
            for pc in lst:
                tot += 1
                if pc.get("dbhEmnekoder"):
                    linked += 1
                    continue
                found = link(courses_by_entry, eid, pc.get("emnekode"))
                if found:
                    pc["dbhEmnekoder"] = found
                    linked += 1
                    changed = True
                else:
                    missing.append((eid, pc.get("emnekode"), pc.get("emnenavn")))
        if changed:
            json.dump(plan, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"{fak}: {linked} av {tot} obligatoriske emner koblet til DBH-koder")
    by_entry = {}
    for eid, code, name in missing:
        by_entry.setdefault(eid, []).append(f"{code} ({name})")
    for eid, items in by_entry.items():
        print(f"  uten DBH-tall: {eid}: {', '.join(items)}")


if __name__ == "__main__":
    main()
