#!/usr/bin/env python3
"""Gjennomgang av AJG-tallene for én skole: våre tall mot NHH Research Report, grunnlaget mot DBH, og artikkellisten.

Bruk:  /usr/local/bin/python3 scripts/rangering/ajg_gjennomgang.py nmbu [--aar 2024]
Skriver data/rangering/kontroll/ajg-gjennomgang/<skole>.md (gitignored: inneholder AJG-nivå per tidsskrift).
Krever at build-rangering.py er kjørt med --klartekst og at tidsskrift/ajg2024.csv finnes.
"""
import argparse
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RANG = ROOT / "data" / "rangering"
UT = RANG / "kontroll" / "ajg-gjennomgang"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("skole")
    ap.add_argument("--aar", default="2024", help="år for artikkellisten")
    a = ap.parse_args()
    ajg = {}
    for r in csv.DictReader(open(RANG / "tidsskrift" / "ajg2024.csv", encoding="utf-8")):
        for k in ("issn", "eissn"):
            if r[k]:
                ajg[r[k]] = r
    d = json.loads((RANG / "rangering-klartekst.json").read_text(encoding="utf-8"))
    s = next(x for x in d["skoler"] if x["id"] == a.skole)
    linjer = [f"# AJG-gjennomgang: {s['kort']}", "", f"Generert av `scripts/rangering/ajg_gjennomgang.py` fra {d['generert']}. "
              "NVI-rapporterte artikler, hel telling, AJG 2024 for alle år.", "",
              "## Grunnlag og tall per år", "",
              "| År | DBH publikasjoner | NVA NVI-artikler | Vår 4* / 4 / 3 | NHH-rapporten 4* / 4 / 3 |", "|---|---|---|---|---|"]
    for y in sorted(s["artikler"]):
        if int(y) < 2018:
            continue
        r = s["artikler"][y].get("rapport", {})
        n = (s.get("ajgNhh") or {}).get(y) or {}
        nn = " / ".join(str((n.get(k) or {}).get("n", "–")) for k in ("4*", "4", "3")) if n else "–"
        db = (s["dbh"].get(y) or {}).get("publikasjoner")
        linjer.append(f"| {y} | {db if db is not None else '–'} | {r.get('nvi', 0)} | {r.get('ajg4*', 0)} / {r.get('ajg4', 0)} / {r.get('ajg3', 0)} | {nn} |")
    linjer += ["", "DBH-publikasjoner omfatter også kapitler; NVA-kolonnen er bare artikler og oversiktsartikler.", "",
               f"## Artikler i AJG-tidsskrift, {a.aar}", "", "| AJG | Tidsskrift | Norsk nivå | Egne / alle forfattere | Tittel |", "|---|---|---|---|---|"]
    rader = []
    for x in json.loads((RANG / "nva" / a.skole / f"{a.aar}.json").read_text(encoding="utf-8"))["artikler"]:
        if not x.get("nvi"):
            continue
        r = ajg.get(x.get("issn")) or ajg.get(x.get("eissn"))
        if r:
            rader.append((r["ajg2024"], x))
    orden = {"4*": 0, "4": 1, "3": 2, "2": 3, "1": 4}
    for lv, x in sorted(rader, key=lambda t: (orden[t[0]], t[1].get("tidsskrift") or "")):
        niva = {"LevelTwo": "2", "LevelOne": "1"}.get(x.get("niva"), "–")
        linjer.append(f"| {lv} | {x.get('tidsskrift')} | {niva} | {x.get('egne')} / {x.get('forfattere')} | {(x.get('tittel') or '')[:90]} |")
    UT.mkdir(parents=True, exist_ok=True)
    f = UT / f"{a.skole}.md"
    f.write_text("\n".join(linjer) + "\n", encoding="utf-8")
    print(f"Skrev {f.relative_to(ROOT)} ({len(rader)} artikler i AJG-tidsskrift i {a.aar}).")


if __name__ == "__main__":
    main()
