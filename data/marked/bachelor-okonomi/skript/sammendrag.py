"""Markedstotaler fra programmer.json -> ../sammendrag.json (til forsiden av en markedsmodul og til rapporten)."""
import json
import os
from collections import defaultdict

from felles import UT

d = json.load(open(os.path.join(UT, "programmer.json"), encoding="utf-8"))["programmer"]
AAR = [str(y) for y in range(2021, 2027)]
ut = {"samordnaForstevalg": {}, "samordnaStudieplasser": {}, "lokaltOpptakAlle": {}, "lokaltOpptakMott": {},
      "registrerte": {}, "antallProgram": {}, "bøaForstevalg2026PerInstitusjon": {}}


def add(tab, nokkel, y, v):
    if v is None:
        return
    tab.setdefault(nokkel, {}).setdefault(y, 0)
    tab[nokkel][y] += v


for r in d:
    gk = r["type"] + ("" if r["nivaa"] == "bachelor" else " (femårig)") + (" grensetilfelle" if r["grensetilfelle"] else "")
    if r["opptak"] == "Samordna":
        for y in AAR:
            add(ut["samordnaForstevalg"], gk, y, r["sokere"]["forstevalg"].get(y))
            add(ut["samordnaStudieplasser"], gk, y, r["studieplasser"].get(y))
            if r["sokere"]["forstevalg"].get(y):
                add(ut["antallProgram"], "Samordna " + gk, y, 1)
    else:
        for y, v in (r["lokaltOpptak"] or {}).items():
            add(ut["lokaltOpptakAlle"], r["institusjonKort"] + " " + gk, y, v.get("alle"))
            add(ut["lokaltOpptakMott"], r["institusjonKort"] + " " + gk, y, v.get("mott"))
            if v.get("tilbud"):
                add(ut["antallProgram"], "lokalt " + gk, y, 1)
    for y, v in (r.get("registrerte") or {}).items():
        add(ut["registrerte"], r["sektor"] + " " + gk, y, v)
    if r["type"] == "BØA" and r["opptak"] == "Samordna" and r["sokere"]["forstevalg"].get("2026"):
        ut["bøaForstevalg2026PerInstitusjon"].setdefault(r["institusjonKort"], 0)
        ut["bøaForstevalg2026PerInstitusjon"][r["institusjonKort"]] += r["sokere"]["forstevalg"]["2026"]
ut["bøaForstevalg2026PerInstitusjon"] = dict(sorted(ut["bøaForstevalg2026PerInstitusjon"].items(), key=lambda kv: -kv[1]))
for k in list(ut):
    if isinstance(ut[k], dict):
        ut[k] = {a: (dict(sorted(b.items())) if isinstance(b, dict) else b) for a, b in sorted(ut[k].items(), key=lambda kv: kv[0])} \
            if k != "bøaForstevalg2026PerInstitusjon" else ut[k]
ut["merknad"] = ("Registrerte summerer bare rader med tall som kan knyttes til programmet (delte DBH-koder uten campusfordeling er "
                 "utelatt). Lokalt opptak 2026 er ikke rapportert i DBH ennå.")
json.dump(ut, open(os.path.join(UT, "sammendrag.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for k in ("samordnaForstevalg", "samordnaStudieplasser", "lokaltOpptakAlle", "lokaltOpptakMott"):
    print("==", k)
    for a, b in ut[k].items():
        print("  ", a.ljust(40), [b.get(y) for y in AAR])
print("== BØA FV 2026 per inst", ut["bøaForstevalg2026PerInstitusjon"])
