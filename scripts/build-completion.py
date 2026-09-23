#!/usr/bin/env python3
"""Gjennomføring, studenter og kandidater per studieprogram (nytt lag «Gjennomføring»).

Kilder (DBH/HKDIR, per institusjon, cache i data/*/kilder/dbh-cache/):
  707  Gjennomføring og frafall (studieprogramnivå): per startkull (Årstall = startår, høst):
       Startkull, Fullført normert / +1 år / +2 år, Studerer, Frafalt (samme tre horisonter), per kjønn.
  123  Registrerte studenter (høstsemester), totalt og kvinner.
  110  Nye studenter (sum vår+høst), totalt og kvinner.
  104  Ferdige kandidater (sum vår+høst), totalt og kvinner.
  335  Gjennomføring iht. avtalt utdanningsplan: studiepoeng planlagt og gjennomført.
Programkoder per entry fra data/<fakultet>/dbh-programkart.json; grupper fra programkart.json.

Bruk:
  python3 scripts/build-completion.py <fakultet> [--refresh]
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
YEARS_TOP = "10"


def find_cache(name):
    for p in glob.glob(str(ROOT / "data" / "*" / "kilder" / "dbh-cache" / name)):
        return Path(p)
    return None


def query(tid, inst, group_by, extra_filters=None):
    return {"tabell_id": tid, "api_versjon": 1, "statuslinje": "J", "kodetekst": "J", "desimal_separator": ".",
            "groupBy": group_by, "sortBy": ["Årstall"],
            "filter": [{"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [inst], "exclude": [""]}},
                       {"variabel": "Årstall", "selection": {"filter": "top", "values": [YEARS_TOP], "exclude": [""]}}] + (extra_filters or [])}


def fetch(tid, inst, group_by, fak, refresh):
    name = f"{tid}_{inst}.json"
    path = find_cache(name) if not refresh else None
    if path is None:
        path = ROOT / "data" / fak / "kilder" / "dbh-cache" / name
    try:
        return blc.fetch_dbh(query(tid, inst, group_by), path, refresh)
    except json.JSONDecodeError:
        # Tomt svar (f.eks. ny institusjonskode uten kull ennå): behandle som ingen rader.
        print(f"  [tomt]  tabell {tid} inst={inst}", file=sys.stderr)
        return []


def n(r, k):
    try:
        return int(float(r.get(k) or 0))
    except ValueError:
        return 0


def ts(s):
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def num(v):
    return "null" if v is None else (str(int(v)) if float(v).is_integer() else str(v))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("fakultet")
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    fak = a.fakultet
    pk = json.load(open(ROOT / "data" / fak / "programkart.json", encoding="utf-8"))
    dk = json.load(open(ROOT / "data" / fak / "dbh-programkart.json", encoding="utf-8"))
    dbh = {p["entryId"]: p for p in dk["programs"]}

    # per institusjon: hent alle fem tabellene (hele institusjonen, gjenbrukbar cache)
    insts = set()
    for p in dbh.values():
        insts.update(p.get("institusjonskoder") or [p["institusjonskode"]])
    raw = {}
    for inst in sorted(insts):
        print(f"== {inst}", file=sys.stderr)
        raw[inst] = {
            707: fetch(707, inst, ["Institusjonskode", "Årstall", "Studieprogramkode", "Nivåkode", "Årstall normert tid", "Kjønnkode"], fak, a.refresh),
            123: fetch(123, inst, ["Institusjonskode", "Årstall", "Semester", "Studieprogramkode"], fak, a.refresh),
            110: fetch(110, inst, ["Institusjonskode", "Årstall", "Semester", "Studieprogramkode"], fak, a.refresh),
            104: fetch(104, inst, ["Institusjonskode", "Årstall", "Semester", "Studieprogramkode"], fak, a.refresh),
            335: fetch(335, inst, ["Institusjonskode", "Årstall", "Studieprogramkode"], fak, a.refresh),
        }

    def build_program(entry):
        m = dbh.get(entry["id"])
        if not m or not m.get("studieprogramkoder"):
            return None
        codes = set(m["studieprogramkoder"])
        icodes = m.get("institusjonskoder") or [m["institusjonskode"]]
        kull = collections.OrderedDict()
        aar = collections.defaultdict(lambda: {"registrerte": 0, "registrerteKvinner": 0, "nye": 0, "nyeKvinner": 0,
                                               "kandidater": 0, "kandidaterKvinner": 0, "spPlanlagt": 0.0, "spGjennomfort": 0.0,
                                               "_reg": False, "_nye": False, "_kand": False, "_sp": False})
        for inst in icodes:
            r = raw.get(inst, {})
            for row in r.get(707, []):
                if row.get("Studieprogramkode") not in codes:
                    continue
                y = int(row["Årstall"])
                k = kull.setdefault(y, {"aar": y, "normertAar": int(row.get("Årstall normert tid") or 0) or None, "nivaa": row.get("Nivåkode"),
                                        "startkull": 0, "startkullKvinner": 0, "fullfortNormert": 0, "fullfortNormertKvinner": 0,
                                        "fullfort1": 0, "fullfort2": 0, "studerer": 0, "studerer1": 0, "studerer2": 0,
                                        "frafalt": 0, "frafalt1": 0, "frafalt2": 0})
                kv = row.get("Kjønnkode") == "1"
                k["startkull"] += n(row, "Startkull"); k["fullfortNormert"] += n(row, "Fullført normert")
                k["fullfort1"] += n(row, "Fullført normert1"); k["fullfort2"] += n(row, "Fullført normert2")
                k["studerer"] += n(row, "Studerer"); k["studerer1"] += n(row, "Studerer1"); k["studerer2"] += n(row, "Studerer2")
                k["frafalt"] += n(row, "Frafalt"); k["frafalt1"] += n(row, "Frafalt1"); k["frafalt2"] += n(row, "Frafalt2")
                if kv:
                    k["startkullKvinner"] += n(row, "Startkull"); k["fullfortNormertKvinner"] += n(row, "Fullført normert")
            for row in r.get(123, []):
                if row.get("Studieprogramkode") in codes and row.get("Semester") == "3":
                    y = aar[int(row["Årstall"])]; y["registrerte"] += n(row, "Antall totalt"); y["registrerteKvinner"] += n(row, "Antall kvinner"); y["_reg"] = True
            for row in r.get(110, []):
                if row.get("Studieprogramkode") in codes:
                    y = aar[int(row["Årstall"])]; y["nye"] += n(row, "Antall totalt"); y["nyeKvinner"] += n(row, "Antall kvinner"); y["_nye"] = True
            for row in r.get(104, []):
                if row.get("Studieprogramkode") in codes:
                    y = aar[int(row["Årstall"])]; y["kandidater"] += n(row, "Antall totalt"); y["kandidaterKvinner"] += n(row, "Antall kvinner"); y["_kand"] = True
            for row in r.get(335, []):
                if row.get("Studieprogramkode") in codes:
                    y = aar[int(row["Årstall"])]
                    try:
                        y["spPlanlagt"] += float(row.get("sp_planlagt") or 0); y["spGjennomfort"] += float(row.get("sp_gjennomfort") or 0); y["_sp"] = True
                    except ValueError:
                        pass
        aar_out = []
        for y in sorted(aar):
            v = aar[y]
            aar_out.append({"aar": y,
                            "registrerte": v["registrerte"] if v["_reg"] else None, "registrerteKvinner": v["registrerteKvinner"] if v["_reg"] else None,
                            "nye": v["nye"] if v["_nye"] else None, "nyeKvinner": v["nyeKvinner"] if v["_nye"] else None,
                            "kandidater": v["kandidater"] if v["_kand"] else None, "kandidaterKvinner": v["kandidaterKvinner"] if v["_kand"] else None,
                            "spPlanlagt": round(v["spPlanlagt"], 1) if v["_sp"] else None, "spGjennomfort": round(v["spGjennomfort"], 1) if v["_sp"] else None})
        return {"entryId": entry["id"], "shortName": entry["shortName"], "institusjon": entry["institusjon"], "isNmbu": bool(entry.get("isNmbu")),
                "programnavn": entry.get("programnavn", ""), "dbhKoder": sorted(codes),
                "kull": [kull[y] for y in sorted(kull) if kull[y]["startkull"] > 0], "aar": aar_out}

    groups = []
    n_prog = n_kull = 0
    for g in pk["groups"]:
        progs = []
        for p in g["programs"]:
            b = build_program(p)
            if b:
                progs.append(b); n_prog += 1; n_kull += len(b["kull"])
        groups.append({"id": g["id"], "label": g["label"], "level": g["level"], "nmbuIds": [p["id"] for p in g["programs"] if p.get("isNmbu")],
                       "defaultIds": [p["id"] for p in g["programs"] if p.get("default")], "programs": progs})

    today = dt.date.today().isoformat()
    out = ROOT / "kilde" / "src" / "app" / "data" / f"{fak}CompletionData.ts"
    L = [f"// GENERERT av scripts/build-completion.py {today} – ikke rediger for hånd.",
         "// Kilde: DBH/HKDIR tabell 707 (gjennomføring og frafall per startkull), 123 (registrerte, høst), 110 (nye), 104 (kandidater), 335 (studiepoeng iht. plan).",
         "import type { LandsamLevel } from './landsamAdmissionData';", "",
         "export interface CompletionCohort {",
         "  aar: number; normertAar: number | null; nivaa: string | null; startkull: number; startkullKvinner: number;",
         "  fullfortNormert: number; fullfortNormertKvinner: number; fullfort1: number; fullfort2: number;",
         "  studerer: number; studerer1: number; studerer2: number; frafalt: number; frafalt1: number; frafalt2: number;",
         "}",
         "export interface CompletionYear {",
         "  aar: number; registrerte: number | null; registrerteKvinner: number | null; nye: number | null; nyeKvinner: number | null;",
         "  kandidater: number | null; kandidaterKvinner: number | null; spPlanlagt: number | null; spGjennomfort: number | null;",
         "}",
         "export interface CompletionProgram {",
         "  entryId: string; shortName: string; institusjon: string; isNmbu: boolean; programnavn: string; dbhKoder: string[];",
         "  kull: CompletionCohort[]; aar: CompletionYear[];",
         "}",
         "export interface CompletionGroup { id: string; label: string; level: LandsamLevel; nmbuIds: string[]; defaultIds: string[]; programs: CompletionProgram[]; }",
         "", f"export const COMPLETION_HENTET = {ts(today)};", "", "export const COMPLETION_GROUPS: CompletionGroup[] = ["]
    for g in groups:
        L.append("  {")
        L.append(f"    id: {ts(g['id'])}, label: {ts(g['label'])}, level: {ts(g['level'])}, nmbuIds: [{', '.join(ts(x) for x in g['nmbuIds'])}], defaultIds: [{', '.join(ts(x) for x in g['defaultIds'])}],")
        L.append("    programs: [")
        for p in g["programs"]:
            L.append("      {")
            L.append(f"        entryId: {ts(p['entryId'])}, shortName: {ts(p['shortName'])}, institusjon: {ts(p['institusjon'])}, isNmbu: {'true' if p['isNmbu'] else 'false'}, programnavn: {ts(p['programnavn'])}, dbhKoder: [{', '.join(ts(x) for x in p['dbhKoder'])}],")
            L.append("        kull: [")
            for k in p["kull"]:
                L.append("          { " + ", ".join(f"{key}: {num(k[key])}" if key not in ('nivaa',) else f"{key}: {ts(k[key]) if k[key] else 'null'}" for key in k) + " },")
            L.append("        ],")
            L.append("        aar: [")
            for y in p["aar"]:
                L.append("          { " + ", ".join(f"{key}: {num(y[key])}" for key in y) + " },")
            L.append("        ],")
            L.append("      },")
        L.append("    ],")
        L.append("  },")
    L.append("];"); L.append("")
    out.write_text("\n".join(L), encoding="utf-8")
    json.dump({"generert": today, "groups": groups}, open(str(out)[:-3] + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{fak}: {n_prog} program, {n_kull} startkull med data. Skrev {out}")


if __name__ == "__main__":
    main()
