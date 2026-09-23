#!/usr/bin/env python3
"""Slår sammen data/nmbu/sammenlignbare/<emnekode>.json (agentkuraterte sammenlignbare emner ved andre
institusjoner) til kilde/public/emner/kuratert.json. Validerer at hvert oppgitt (inst, kode) finnes i
kilde/public/emner/index.json; ugyldige fjernes med advarsel.
Kontrakt per fil: {"kode","navn","hentet","merknad","sammenlignbare":[{"inst","kode","navn","sikkerhet","merknad"}]}
Bruk: python3 scripts/build-curated-courses.py
"""
import datetime as dt, glob, json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = json.load(open(os.path.join(ROOT, "kilde/public/emner/index.json"), encoding="utf-8"))["courses"]
known = {(r[0], r[1]) for r in idx}
out, n_ok, n_bad = {}, 0, 0
for f in sorted(glob.glob(os.path.join(ROOT, "data/nmbu/sammenlignbare/*.json"))):
    if os.path.basename(f).startswith("_"):
        continue
    d = json.load(open(f, encoding="utf-8"))
    rows = []
    for s in d.get("sammenlignbare", []):
        if (s.get("inst"), s.get("kode")) in known:
            rows.append({"inst": s["inst"], "kode": s["kode"], "sikkerhet": s.get("sikkerhet"), "merknad": s.get("merknad")}); n_ok += 1
        else:
            print(f"  [advarsel] {d.get('kode')}: ({s.get('inst')}, {s.get('kode')}) finnes ikke i indeksen", file=sys.stderr); n_bad += 1
    if rows:
        out[d["kode"]] = {"merknad": d.get("merknad"), "sammenlignbare": rows}
json.dump({"generert": dt.date.today().isoformat(), "courses": out},
          open(os.path.join(ROOT, "kilde/public/emner/kuratert.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(out)} NMBU-emner med kuraterte koblinger, {n_ok} gyldige, {n_bad} ugyldige -> kilde/public/emner/kuratert.json")
