#!/usr/bin/env python3
"""Gjennomføring, studenter og kandidater per studieprogram (nytt lag «Gjennomføring»).

Kilder (DBH/HKDIR, per institusjon, cache i data/*/kilder/dbh-cache/):
  707  Gjennomføring og frafall (studieprogramnivå): per startkull (Årstall = startår, høst):
       Startkull, Fullført normert / +1 år / +2 år, Studerer, Frafalt (samme tre horisonter).
       Totalene hentes UTEN kjønnsdeling (grov gruppering = minst skjerming); kvinnetallene fra en egen
       spørring per kjønn.
  706  Samme kull, men gjennomført = grad på samme nivå ved samme institusjon (studiumnivå).
  705  Samme kull, men gjennomført = grad på samme nivå hvor som helst i sektoren; frafall = ute av
       høyere utdanning (sektornivå).
  Landssnitt: 707/706/705 summert over alle institusjoner per startår og nivåkode (én spørring per tabell).
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


NATIONAL_CACHE = ROOT / "data" / "nmbu" / "kilder" / "dbh-cache"
KULL_KEYS = [("fullfortNormert", "Fullført normert"), ("fullfort1", "Fullført normert1"), ("fullfort2", "Fullført normert2"),
             ("studerer", "Studerer"), ("studerer1", "Studerer1"), ("studerer2", "Studerer2"),
             ("frafalt", "Frafalt"), ("frafalt1", "Frafalt1"), ("frafalt2", "Frafalt2")]
REF_KEYS = [("fullfortNormert", "Fullført normert"), ("fullfort1", "Fullført normert1"), ("fullfort2", "Fullført normert2"),
            ("frafalt", "Frafalt"), ("frafalt2", "Frafalt2")]


def fetch_national(tid, refresh):
    """Alle institusjoner, per startår × nivåkode. Filteret må ha minst én variabel: bruker Nivåkode."""
    q = {"tabell_id": tid, "api_versjon": 1, "statuslinje": "J", "kodetekst": "J", "desimal_separator": ".",
         "groupBy": ["Årstall", "Nivåkode", "Årstall normert tid"], "sortBy": ["Årstall"],
         "filter": [{"variabel": "Nivåkode", "selection": {"filter": "item", "values": ["B3", "M2", "M5", "PR"], "exclude": [""]}},
                    {"variabel": "Årstall", "selection": {"filter": "top", "values": [YEARS_TOP], "exclude": [""]}}]}
    return blc.fetch_dbh(q, NATIONAL_CACHE / f"{tid}_nasjonalt_nivaa.json", refresh)


def fetch_tot(tid, inst, fak, refresh):
    """Kulltall uten kjønnsdeling (cache-navn <tid>t_<inst>.json)."""
    name = f"{tid}t_{inst}.json"
    path = find_cache(name) if not refresh else None
    if path is None:
        path = ROOT / "data" / fak / "kilder" / "dbh-cache" / name
    try:
        return blc.fetch_dbh(query(tid, inst, ["Institusjonskode", "Årstall", "Studieprogramkode", "Nivåkode", "Årstall normert tid"]), path, refresh)
    except json.JSONDecodeError:
        print(f"  [tomt]  tabell {tid} (total) inst={inst}", file=sys.stderr)
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
            "707t": fetch_tot(707, inst, fak, a.refresh),
            706: fetch_tot(706, inst, fak, a.refresh),
            705: fetch_tot(705, inst, fak, a.refresh),
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
            def kobj(row):
                y = int(row["Årstall"])
                return kull.setdefault(y, {"aar": y, "normertAar": int(row.get("Årstall normert tid") or 0) or None, "nivaa": row.get("Nivåkode"),
                                           "startkull": 0, "startkullKvinner": 0, "fullfortNormert": 0, "fullfortNormertKvinner": 0,
                                           "fullfort1": 0, "fullfort2": 0, "studerer": 0, "studerer1": 0, "studerer2": 0,
                                           "frafalt": 0, "frafalt1": 0, "frafalt2": 0,
                                           "inst": {kk: 0 for kk, _ in REF_KEYS}, "sektor": {kk: 0 for kk, _ in REF_KEYS}})
            tot = r.get("707t") or []
            for row in (tot or r.get(707, [])):
                if row.get("Studieprogramkode") not in codes:
                    continue
                k = kobj(row)
                k["startkull"] += n(row, "Startkull")
                for kk, dk_ in KULL_KEYS:
                    k[kk] += n(row, dk_)
            for row in r.get(707, []):
                if row.get("Studieprogramkode") in codes and row.get("Kjønnkode") == "1":
                    k = kobj(row)
                    k["startkullKvinner"] += n(row, "Startkull"); k["fullfortNormertKvinner"] += n(row, "Fullført normert")
            for tid, key in ((706, "inst"), (705, "sektor")):
                for row in r.get(tid, []):
                    if row.get("Studieprogramkode") in codes and int(row["Årstall"]) in kull:
                        for kk, dk_ in REF_KEYS:
                            kull[int(row["Årstall"])][key][kk] += n(row, dk_)
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
                "kull": [finish_kull(kull[y]) for y in sorted(kull) if kull[y]["startkull"] > 0], "aar": aar_out}

    def finish_kull(k):
        # 705/706 mangler for kullet (ingen rader): null i stedet for nuller
        for key in ("inst", "sektor"):
            if not any(k[key].values()):
                k[key] = None
        return k

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
         "  /** DBH 706: grad på samme nivå ved samme institusjon. */ inst: CompletionRef | null;",
         "  /** DBH 705: grad på samme nivå hvor som helst i sektoren; frafall = ute av høyere utdanning. */ sektor: CompletionRef | null;",
         "}",
         "export interface CompletionRef { fullfortNormert: number; fullfort1: number; fullfort2: number; frafalt: number; frafalt2: number; }",
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
                def val(key, v):
                    if key == "nivaa":
                        return ts(v) if v else "null"
                    if isinstance(v, dict):
                        return "{ " + ", ".join(f"{kk}: {num(vv)}" for kk, vv in v.items()) + " }"
                    return num(v)
                L.append("          { " + ", ".join(f"{key}: {val(key, k[key])}" for key in k) + " },")
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
    write_national(a.refresh)


def write_national(refresh):
    """Landssnitt per nivåkode og startår for 707 (program), 706 (institusjon) og 705 (sektor)."""
    nat = {}
    for tid, key in ((707, "program"), (706, "inst"), (705, "sektor")):
        try:
            rows = fetch_national(tid, refresh)
        except json.JSONDecodeError:
            rows = []
        for row in rows:
            niv = row.get("Nivåkode"); y = int(row["Årstall"])
            k = nat.setdefault(niv, {}).setdefault(y, {"aar": y, "normertAar": int(row.get("Årstall normert tid") or 0) or None})
            d = k.setdefault(key, {"startkull": 0, **{kk: 0 for kk, _ in REF_KEYS}})
            d["startkull"] += n(row, "Startkull")
            for kk, dk_ in REF_KEYS:
                d[kk] += n(row, dk_)
    today = dt.date.today().isoformat()
    out = ROOT / "kilde" / "src" / "app" / "data" / "completionNationalData.ts"
    L = [f"// GENERERT av scripts/build-completion.py {today} – ikke rediger for hånd.",
         "// Landssnitt: DBH/HKDIR 707 (studieprogramnivå), 706 (studiumnivå), 705 (sektornivå), summert over alle institusjoner per startår og nivåkode.",
         "export interface NationalRef { startkull: number; fullfortNormert: number; fullfort1: number; fullfort2: number; frafalt: number; frafalt2: number; }",
         "export interface NationalCohort { aar: number; normertAar: number | null; program?: NationalRef; inst?: NationalRef; sektor?: NationalRef; }",
         "export const NIVAA_NAVN: Record<string, string> = { B3: 'bachelor', M2: 'toårig master', M5: 'femårig master', PR: 'profesjonsstudium' };",
         "export const COMPLETION_NATIONAL: Record<string, NationalCohort[]> = {"]
    for niv in sorted(nat):
        L.append(f"  {niv}: [")
        for y in sorted(nat[niv]):
            k = nat[niv][y]
            parts = [f"aar: {y}", f"normertAar: {num(k['normertAar'])}"]
            for key in ("program", "inst", "sektor"):
                if key in k:
                    parts.append(f"{key}: {{ " + ", ".join(f"{kk}: {vv}" for kk, vv in k[key].items()) + " }")
            L.append("    { " + ", ".join(parts) + " },")
        L.append("  ],")
    L.append("};"); L.append("")
    out.write_text("\n".join(L), encoding="utf-8")
    print(f"landssnitt: {', '.join(f'{k} ({len(v)} kull)' for k, v in sorted(nat.items()))}. Skrev {out.name}")


if __name__ == "__main__":
    main()
