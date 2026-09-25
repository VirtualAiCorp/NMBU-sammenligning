#!/usr/bin/env python3
"""Strategigjennomgangen for markedsstatus → kilde/public/markedsstatus/<fakultet>/strategier.json

Leser data/<fakultet>/strategier/<institusjon>.json (én fil per institusjon, research med kildelenker) og
data/<fakultet>/strategier/_syntese.json (funn på tvers: går igjen, skiller seg ut, aktuelt for fakultetet),
kontrollerer temaer, kildehenvisninger og sitatlengde, og skriver én fil som StrategierMot2030.tsx laster.
Rekkefølgen på institusjonene følger data/<fakultet>/markedsstatus.json.

Bruk: python3 scripts/build-strategier.py [fakultet]   (standard: hh)
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMAER = ["Bærekraft", "Digitalisering og KI", "Internasjonalisering", "Akkreditering og rangering", "Samspill med arbeidslivet",
          "Livslang læring og EVU", "Forskning", "Studiekvalitet og læringsmiljø", "Regional rolle", "Rekruttering og studietilbud",
          "Teknologi og tverrfaglighet", "Innovasjon og entreprenørskap", "Økonomi og ressurser", "Campus og infrastruktur",
          "Mangfold og likestilling", "Annet"]
# Markedsstatus-id → strategifil-id der de avviker
ALIAS = {"hiø": "hiof", "hiof": "hiof"}
# Korte navn i tabeller og merkelapper
KORTNAVN = {"hiof": "HiØ", "kristiania": "Kristiania"}


def main():
    fak = sys.argv[1] if len(sys.argv) > 1 else "hh"
    mappe = ROOT / "data" / fak / "strategier"
    rekke = [ALIAS.get(i["id"].lower(), i["id"].lower()) for i in json.load(open(ROOT / "data" / fak / "markedsstatus.json", encoding="utf-8"))["institusjoner"]]
    filer = {p.stem: json.load(open(p, encoding="utf-8")) for p in sorted(mappe.glob("*.json")) if not p.stem.startswith("_")}
    inst, avvik = [], []
    for iid in sorted(filer, key=lambda x: rekke.index(x) if x in rekke else 99):
        d = filer[iid]
        d["navn"] = KORTNAVN.get(iid, d["navn"])
        n = len(d.get("strategier", []))
        for s in d.get("satsinger", []):
            if s.get("tema") not in TEMAER:
                avvik.append(f"{iid}: ukjent tema «{s.get('tema')}» → Annet")
                s["tema"] = "Annet"
        for liste in (d.get("satsinger", []), d.get("maal", [])):
            for x in liste:
                if x.get("kilde") is not None and not (isinstance(x["kilde"], int) and 0 <= x["kilde"] < n):
                    avvik.append(f"{iid}: kilde {x.get('kilde')} finnes ikke")
                    x["kilde"] = None
        if d.get("sitat") and len(d["sitat"].get("tekst", "").split()) >= 15:
            avvik.append(f"{iid}: sitatet er 15 ord eller mer, tatt ut")
            d["sitat"] = None
        inst.append(d)
    syntese_p = mappe / "_syntese.json"
    syntese = json.load(open(syntese_p, encoding="utf-8")) if syntese_p.exists() else None
    if syntese:
        ids = {i["id"] for i in inst}
        for x in syntese.get("skillerSeg", []):
            if x["inst"] not in ids:
                avvik.append(f"syntese: ukjent institusjon {x['inst']}")
    hentet = max((i.get("hentet") or "" for i in inst), default="")
    ut = ROOT / "kilde" / "public" / "markedsstatus" / fak / "strategier.json"
    ut.parent.mkdir(parents=True, exist_ok=True)
    json.dump({"hentet": hentet, "temaer": TEMAER, "institusjoner": inst, "syntese": syntese}, open(ut, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{fak}: {len(inst)} institusjoner, {sum(len(i.get('satsinger', [])) for i in inst)} satsinger, "
          f"{sum(len(i.get('strategier', [])) for i in inst)} dokumenter → {ut.relative_to(ROOT)} ({ut.stat().st_size // 1024} kB)")
    for a in avvik:
        print("  !", a)


if __name__ == "__main__":
    main()
