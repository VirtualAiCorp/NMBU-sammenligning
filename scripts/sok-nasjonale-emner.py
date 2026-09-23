#!/usr/bin/env python3
"""Søk i det nasjonale emneregisteret (kilde/public/emner/index.json).
Bruk:  python3 scripts/sok-nasjonale-emner.py "markedsføring" [--inst 1240,8241] [--nus 641] [--min 20] [--max 40]
Skriver: inst  kort  emnekode  navn  NUS  stp  nivå  kandidater(2021–2025). Treff sorteres etter kandidater.
"""
import argparse, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument("ord", nargs="+"); ap.add_argument("--inst", default=""); ap.add_argument("--nus", default="")
ap.add_argument("--min", type=int, default=10); ap.add_argument("--max", type=int, default=40); a = ap.parse_args()
idx = json.load(open(os.path.join(ROOT, "kilde/public/emner/index.json"), encoding="utf-8"))["courses"]
meta = json.load(open(os.path.join(ROOT, "kilde/public/emner/meta.json"), encoding="utf-8"))["institusjoner"]
insts = set(a.inst.split(",")) if a.inst else None
words = [w.lower() for w in a.ord]
hits = [r for r in idx if r[0] != "1173" and (not insts or r[0] in insts) and (not a.nus or (r[3] and r[3][1:].startswith(a.nus.lstrip("67"))))
        and all(w in (r[2] or "").lower() or w in r[1].lower() for w in words) and r[6] >= a.min]
for r in sorted(hits, key=lambda r: -r[6])[: a.max]:
    print(f"{r[0]}  {meta.get(r[0], {}).get('kort', ''):<10} {r[1]:<14} {r[2][:60]:<60} NUS {r[3] or '-':<7} {r[4] or '-':>5} {r[5] or '-':<3} {r[6]:>6}")
print(f"({len(hits)} treff)")
