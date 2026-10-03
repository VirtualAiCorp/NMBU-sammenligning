#!/usr/bin/env python3
"""Gjør Chartered ABS' Academic Journal Guide 2024 (eksport fra charteredabs.org, xlsx eller csv) om til
data/rangering/tidsskrift/ajg2024.csv (tittel, issn, eissn, fagfelt, ajg2024), som scripts/build-rangering.py leser.

Lisens: Mathias har fått tillatelse fra Chartered ABS til å bruke lista i verktøyet i én uke fra 03.10.2026.
Fila er gitignored og skal aldri i repoet; nivåene vises bare i den krypterte rangeringen.
Kolonnene finnes automatisk (tittel/«Journal Title», «ISSN», «E-ISSN»/«Online ISSN», «Field», «AJG 2024»).

Bruk:
  /usr/local/bin/python3 scripts/rangering/ajg_til_csv.py "/sti/til/AJG2024.xlsx"
  /usr/local/bin/python3 scripts/build-rangering.py
"""
import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
UT = ROOT / "data" / "rangering" / "tidsskrift" / "ajg2024.csv"
NIVAER = {"1", "2", "3", "4", "4*"}


def issn(v):
    s = re.sub(r"[^0-9Xx]", "", str(v or "")).upper()
    return f"{s[:4]}-{s[4:]}" if len(s) == 8 else ""


def rader(sti: Path):
    if sti.suffix.lower() in (".xlsx", ".xlsm"):
        import openpyxl
        ws = openpyxl.load_workbook(sti, read_only=True, data_only=True).active
        it = ws.iter_rows(values_only=True)
        # Første rad som inneholder både ISSN og AJG/rating regnes som overskrift
        for hode in it:
            h = [str(c or "").strip() for c in hode]
            if any("issn" in c.lower() for c in h) and any(re.search(r"ajg|rating|2024", c, re.I) for c in h):
                break
        else:
            raise SystemExit("Fant ingen overskriftsrad med ISSN og AJG-nivå.")
        for r in it:
            yield dict(zip(h, ["" if c is None else str(c).strip() for c in r]))
    else:
        with open(sti, encoding="utf-8-sig", newline="") as f:
            yield from csv.DictReader(f)


def finn(kol, *mønstre, unntak=None):
    for m in mønstre:
        for k in kol:
            if re.search(m, k, re.I) and not (unntak and re.search(unntak, k, re.I)):
                return k
    return None


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    alle = list(rader(Path(sys.argv[1])))
    kol = list(alle[0].keys())
    k_t = finn(kol, r"journal.?title", r"^title$", r"tittel")
    k_e = finn(kol, r"e.?issn", r"online.?issn", r"eissn")
    k_p = finn(kol, r"^issn$", r"print.?issn", r"issn", unntak=r"e.?issn|online")
    k_f = finn(kol, r"^field$", r"subject", r"fagfelt", r"field")
    k_n = finn(kol, r"ajg.?2024", r"^ajg", r"rating")
    if not (k_p and k_n):
        sys.exit(f"Fant ikke ISSN- eller nivåkolonne i {kol}")
    print("Kolonner:", {"tittel": k_t, "issn": k_p, "eissn": k_e, "fagfelt": k_f, "nivå": k_n})
    ut, sett = [], set()
    for r in alle:
        niva = str(r.get(k_n, "")).strip().replace(" ", "")
        if niva not in NIVAER:
            continue
        p, e = issn(r.get(k_p)), issn(r.get(k_e)) if k_e else ""
        if not (p or e) or (p, e) in sett:
            continue
        sett.add((p, e))
        ut.append({"tittel": r.get(k_t, "") if k_t else "", "issn": p, "eissn": e, "fagfelt": r.get(k_f, "") if k_f else "", "ajg2024": niva})
    UT.parent.mkdir(parents=True, exist_ok=True)
    with open(UT, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["tittel", "issn", "eissn", "fagfelt", "ajg2024"])
        w.writeheader(); w.writerows(ut)
    fordeling = {n: sum(1 for x in ut if x["ajg2024"] == n) for n in sorted(NIVAER)}
    print(f"Skrev {UT.relative_to(ROOT)}: {len(ut)} tidsskrift {fordeling}")


if __name__ == "__main__":
    main()
