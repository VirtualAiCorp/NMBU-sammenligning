#!/usr/bin/env python3
"""Studieavgift og campusfordeling for de private konkurrentene (BI og Kristiania) → kilde/src/app/data/prisCampusData.ts/.json

Studieavgift: håndført i data/<fakultet>/kilder/studieavgift.json (fra programsidene, oppdateres hver vår).
Campus:       DBH/HKDIR tabell 124 «Registrerte studenter fordelt på studieretning og campus», høstsemesteret, alle årskull,
              for programmene til de private institusjonene i dbh-programkart. BIs opptakstall (DBH 379) gjelder alle campuser
              og nett samlet; tabellen viser hvor studentene faktisk går.

Bruk: python3 scripts/build-pris-campus.py [--refresh]
"""
import argparse
import datetime as dt
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("blc", ROOT / "scripts" / "build-landsam-courses.py")
blc = importlib.util.module_from_spec(spec); spec.loader.exec_module(blc)
CACHE = ROOT / "data" / "nmbu" / "kilder" / "dbh-campus"
FAKULTETER = ["hh"]
PRIVATE = {"8241": "Handelshøyskolen BI - ", "8253": "Høyskolen Kristiania - "}
Y0, Y1 = "2021", "2025"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    pris, campus = {}, {}
    for fak in FAKULTETER:
        f = ROOT / "data" / fak / "kilder" / "studieavgift.json"
        if f.exists():
            d = json.load(open(f, encoding="utf-8"))
            for k, v in d["programmer"].items():
                pris[k] = {**v, "hentet": d["hentet"]}
        dk = json.load(open(ROOT / "data" / fak / "dbh-programkart.json", encoding="utf-8"))["programs"]
        per_inst = {}
        for p in dk:
            if p["institusjonskode"] in PRIVATE:
                per_inst.setdefault(p["institusjonskode"], []).append(p)
        for inst, progs in per_inst.items():
            koder = sorted({c for p in progs for c in p["studieprogramkoder"]})
            body = {"tabell_id": 124, "api_versjon": 1, "statuslinje": "J", "kodetekst": "N", "desimal_separator": ".",
                    "groupBy": ["Årstall", "Studieprogramkode", "Stedkode campus", "Stednavn campus"],
                    "filter": [{"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [inst]}},
                               {"variabel": "Årstall", "selection": {"filter": "between", "values": [Y0, Y1]}},
                               {"variabel": "Semester", "selection": {"filter": "item", "values": ["3"]}},
                               {"variabel": "Studieprogramkode", "selection": {"filter": "item", "values": koder}}]}
            rows = blc.fetch_dbh(body, CACHE / f"124_{inst}.json", a.refresh)
            for p in progs:
                aar = {}
                for r in rows:
                    if r.get("Studieprogramkode") in p["studieprogramkoder"]:
                        navn = (r.get("Stednavn campus") or r.get("Stedkode campus") or "").replace(PRIVATE[inst], "").replace("campus ", "")
                        navn = {"Nettstudier": "Nett"}.get(navn, navn)
                        aar.setdefault(int(r["Årstall"]), {}).setdefault(navn, 0)
                        aar[int(r["Årstall"])][navn] += int(float(r.get("Antall") or 0))
                if aar:
                    campus[p["entryId"]] = [{"aar": y, "campuser": sorted(({"navn": n, "antall": v} for n, v in c.items()), key=lambda x: -x["antall"])}
                                            for y, c in sorted(aar.items())]
    today = dt.date.today().isoformat()
    L = [f"// GENERERT av scripts/build-pris-campus.py {today} – ikke rediger for hånd.",
         "// Kilder: programsidene (studieavgift, data/<fakultet>/kilder/studieavgift.json) og DBH/HKDIR tabell 124 (registrerte per campus, høst).",
         "export interface Studieavgift { perAar: number; perSemester?: number; internPerAar?: number; merknad?: string; url: string; hentet: string; }",
         "export interface CampusAar { aar: number; campuser: { navn: string; antall: number }[]; }",
         f"export const STUDIEAVGIFT: Record<string, Studieavgift> = {json.dumps(pris, ensure_ascii=False, indent=1)};",
         f"export const CAMPUS: Record<string, CampusAar[]> = {json.dumps(campus, ensure_ascii=False)};", ""]
    dest = ROOT / "kilde" / "src" / "app" / "data" / "prisCampusData.ts"
    dest.write_text("\n".join(L), encoding="utf-8")
    json.dump({"generert": today, "studieavgift": pris, "campus": campus}, open(str(dest)[:-3] + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for k, v in campus.items():
        print(k, v[-1]["aar"], ", ".join(f"{c['navn']} {c['antall']}" for c in v[-1]["campuser"]))
    print(f"{len(pris)} program med studieavgift, {len(campus)} med campusfordeling. Skrev {dest.name}")


if __name__ == "__main__":
    main()
