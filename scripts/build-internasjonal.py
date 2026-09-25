#!/usr/bin/env python3
"""Internasjonalisering per program: undervisningsspråk og innreisende utvekslingsstudenter i programmets emner
→ kilde/src/app/data/internasjonalData.ts (brukes i kortet «Studentene»)

For hvert program i fakultetenes emnedata (<fakultet>CourseData.json, emnene programmets studenter tar eksamen i):
  eng  Andel av studiepoengene programmets studenter tar i emner undervist på engelsk: sum(kandidater × studiepoeng) for
       emner med undervisningsspråk ENG i DBH 208 «Emner», delt på det samme for alle emnene med kjent språk.
  inn  Andel innreisende utvekslingsstudenter blant alle kandidatene i programmets emner: DBH 308 «Karakterer» for hele
       institusjonen, der kandidater registrert på institusjonens utvekslingsprogram (kodene hentes fra DBH 142, Type UTENL,
       f.eks. «UTVEKSLING» ved NMBU) telles som innreisende. Innreisende registreres ikke på gradsprogrammene, så dette er
       det nærmeste målet per program: hvor internasjonalt klasserommet i programmets emner er.
DBH-hurtiglageret (208/308 per institusjon) fra build-landsam-courses.py gjenbrukes; 142 hentes til data/nmbu/kilder/dbh-internasjonal/.

Bruk: python3 scripts/build-internasjonal.py [--refresh]
"""
import argparse
import collections
import datetime as dt
import glob
import importlib.util
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("blc", ROOT / "scripts" / "build-landsam-courses.py")
blc = importlib.util.module_from_spec(spec); spec.loader.exec_module(blc)
CACHE = ROOT / "data" / "nmbu" / "kilder" / "dbh-internasjonal"
FAKULTETER = ["hh", "landsam", "realtek", "biovit", "kbm", "mina", "vet"]
# Kontrollert for hånd: BI registrerer innreisende sammen med norske enkeltemnestudenter («ENKEL»), så de kan ikke skilles ut
# (tom mengde = ikke målbart). NHHs «MSC23» er et masterkull, ikke et utvekslingsprogram.
UTV_OVERSTYR = {"8241": set(), "1240": {"BACHUTV", "MASTERUTV"}}


def rader(fil):
    d = json.loads(blc.les_cache(Path(fil)))
    return [r for r in (d if isinstance(d, list) else []) if isinstance(r, dict) and "Emnekode" in r]


def cache_for(tabell, inst):
    for fak in FAKULTETER:
        mappe = ROOT / "data" / fak / "kilder" / "dbh-cache"
        for f in sorted(glob.glob(str(mappe / f"{tabell}_{inst}_*.json")) + glob.glob(str(mappe / f"{tabell}_{inst}_*.json.gz"))):
            return f[:-3] if f.endswith(".gz") else f
    return None


def utvekslingskoder(inst, refresh):
    if inst in UTV_OVERSTYR:
        return UTV_OVERSTYR[inst]
    body = {"tabell_id": 142, "api_versjon": 1, "statuslinje": "J", "kodetekst": "J", "desimal_separator": ".",
            "groupBy": ["Type", "Studieprogramkode"],
            "filter": [{"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [inst]}},
                       {"variabel": "Årstall", "selection": {"filter": "between", "values": ["2020", "2025"]}},
                       {"variabel": "Type", "selection": {"filter": "item", "values": ["UTENL"]}}]}
    try:
        rows = blc.fetch_dbh(body, CACHE / f"142_{inst}.json", refresh)
    except Exception:
        return set()
    utenl = collections.Counter()
    for r in rows:
        if r.get("Studieprogramkode"):
            utenl[r["Studieprogramkode"]] += int(float(r.get("Antall totalt") or 0))
    # Bare koder der innreisende utgjør det meste av programmet (rene utvekslings-/gjestestudentprogram). Mange institusjoner
    # registrerer noen innreisende på vanlige gradsprogram (f.eks. BIs MSc in Business); de skal ikke telles som innreisende.
    reg = collections.Counter()
    fil = ROOT / "data" / "nmbu" / "kilder" / "dbh-studenter" / f"{inst}_total.json"
    if fil.exists():
        for r in json.load(open(fil, encoding="utf-8")):
            if isinstance(r, dict) and r.get("Studieprogramkode") and "2020" <= str(r.get("Årstall")) <= "2025":
                reg[r["Studieprogramkode"]] += int(float(r.get("Antall totalt") or 0))
    ut = set()
    for kode, n in utenl.items():
        if n <= 0:
            continue
        if reg.get(kode):
            if n / reg[kode] >= 0.3:
                ut.add(kode)
        elif re.search(r"UTV|EXCH|ERASM|INTL|INT-|ISU|GJEST", kode, re.I):
            ut.add(kode)
    return ut


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    sprak_cache, k308_cache, utv_cache = {}, {}, {}
    ut = {}
    dekning = collections.Counter()
    for fak in FAKULTETER:
        f = ROOT / "kilde" / "src" / "app" / "data" / f"{fak}CourseData.json"
        if not f.exists():
            continue
        for g in json.load(open(f, encoding="utf-8"))["groups"]:
            for p in g["programs"]:
                inst = p.get("dbhInstitusjonskode")
                if not inst or not p.get("courses"):
                    continue
                if inst not in sprak_cache:
                    f208, f308 = cache_for(208, inst), cache_for(308, inst)
                    sprak = {}
                    if f208:
                        for r in sorted(rader(f208), key=lambda r: r.get("Årstall") or ""):
                            if r.get("Underv.språk"):
                                sprak[r["Emnekode"]] = r["Underv.språk"]
                    sprak_cache[inst] = sprak
                    utv_cache[inst] = utvekslingskoder(inst, a.refresh)
                    k = collections.defaultdict(lambda: [0, 0])  # (emne, år) -> [alle, innreisende]
                    if f308:
                        for r in rader(f308):
                            n = int(float(r.get("Antall kandidater totalt") or 0))
                            key = (r["Emnekode"], int(r["Årstall"]))
                            k[key][0] += n
                            if r.get("Studieprogramkode") in utv_cache[inst]:
                                k[key][1] += n
                    k308_cache[inst] = k
                sprak, k308 = sprak_cache[inst], k308_cache[inst]
                aar = {}
                for c in p["courses"]:
                    sp = float(c.get("studiepoeng") or 0)
                    for y in c.get("years", []):
                        n = y.get("total") or 0
                        if not n:
                            continue
                        a_ = aar.setdefault(y["year"], {"spKjent": 0.0, "spEng": 0.0, "emner": 0, "emnerEng": 0, "alle": 0, "inn": 0})
                        s = sprak.get(c["emnekode"])
                        if s:
                            a_["spKjent"] += n * sp; a_["emner"] += 1
                            if s == "ENG":
                                a_["spEng"] += n * sp; a_["emnerEng"] += 1
                        alle, inn = k308.get((c["emnekode"], y["year"]), (0, 0))
                        a_["alle"] += alle; a_["inn"] += inn
                res = {}
                for y, v in aar.items():
                    res[str(y)] = {"eng": round(100 * v["spEng"] / v["spKjent"], 1) if v["spKjent"] else None,
                                   "emnerEng": v["emnerEng"], "emner": v["emner"],
                                   "inn": round(100 * v["inn"] / v["alle"], 1) if v["alle"] and utv_cache[inst] else None}
                    dekning["med språk" if v["spKjent"] else "uten språk"] += 1
                ut[p["entryId"]] = res
    today = dt.date.today().isoformat()
    L = [f"// GENERERT av scripts/build-internasjonal.py {today} – ikke rediger for hånd.",
         "// Kilde: DBH/HKDIR 208 (emner, undervisningsspråk), 308 (karakterer per emne og program), 142 (utvekslingsprogram).",
         "/** eng = % av studiepoengene i emner på engelsk; inn = % innreisende utvekslingsstudenter blant kandidatene i programmets emner. */",
         "export interface InternasjonalAar { eng: number | null; emnerEng: number; emner: number; inn: number | null; }",
         f"export const INTERNASJONAL_HENTET = '{today}';",
         f"export const INTERNASJONAL: Record<string, Record<string, InternasjonalAar>> = {json.dumps(ut, ensure_ascii=False, separators=(',', ':'))};", ""]
    dest = ROOT / "kilde" / "src" / "app" / "data" / "internasjonalData.ts"
    dest.write_text("\n".join(L), encoding="utf-8")
    print(f"{len(ut)} program. Utvekslingskoder: " + "; ".join(f"{i}: {', '.join(sorted(c)) or '–'}" for i, c in sorted(utv_cache.items())))
    print(dict(dekning), f"Skrev {dest.name} ({dest.stat().st_size // 1024} kB)")
    for pid in ("nmbu_oa", "nhh_oa", "nmbu_mecon", "uio_mecon", "bi_oa"):
        if pid in ut:
            print(pid, ut[pid].get("2025") or ut[pid].get("2024"))


if __name__ == "__main__":
    main()
