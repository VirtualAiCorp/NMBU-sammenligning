#!/usr/bin/env python3
"""Kalibrert AJG-anslag per tidsskrift, bygd bare på åpne kilder. Det er IKKE AJG-nivåer og skal aldri vises som det
for enkelttidsskrift; det brukes bare til tall på skolenivå («AJG 4/4*-anslag»).

Regler (kalibrert 03.10.2026 mot NHH Research Report 2024 tabell 4, 5 og 31: AJG 4/4* og 3 for NHH, BI, NMBU, Nord,
UiA, UiS og UiT 2020–2024, 35 skole-år; NTNU holdt utenfor fordi NHH teller bare NTNU Handelshøyskolen):
  Topp (≈ AJG 4/4*): FT50 eller UTD24, eller ABDC A* med OpenAlex 2-års gj.sn. sitering ≥ 5
      → r = 0,98 per skole-år, totalt 1,09 × fasit, rekkefølge mellom skolene Spearman 0,93.
  Nivå 3 (≈ AJG 3): ikke topp, ABDC A* eller A, og JUFO nivå ≥ 2
      → r = 0,92, totalt 1,15 × fasit, Spearman 0,91 (2022 utelatt: NHHs tabell 31 har feil antall det året).
  Resten: «≤ 2 / ikke vurdert».
Kjente avvik: anslaget gir flere toppartikler enn NHH-tabellen for UiS, UiT, UiA og NMBU (bl.a. reiseliv og
energi-/miljøøkonomi), dels fordi NHH avgrenser enhetene annerledes. Se data/rangering/tidsskrift/anslag/kalibrering.md.

Kilder: data/rangering/tidsskrift/abdc.csv, ft50.csv (ft50_2026), utd24.csv, anslag/maal.json
(scripts/rangering/hent_tidsskriftmaal.py: JUFO CC BY 4.0, OpenAlex CC0).
Utdata: data/rangering/tidsskrift/ajg-anslag.csv (issn, eissn, tittel, anslag ∈ {topp, 3, lav}).

Bruk:
  python3 scripts/rangering/hent_tidsskriftmaal.py
  python3 scripts/rangering/ajg_anslag.py
"""
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
T = ROOT / "data" / "rangering" / "tidsskrift"
SIT_TOPP = 5.0          # OpenAlex 2yr_mean_citedness for ABDC A* → topp
JUFO_TRE = ("2", "3")   # JUFO-nivå for A*/A → nivå 3


def issn(s):
    s = re.sub(r"[^0-9Xx]", "", str(s or "")).upper()
    return f"{s[:4]}-{s[4:]}" if len(s) == 8 else None


def les(navn, kol=None, krav=None):
    m = {}
    for r in csv.DictReader(open(T / navn, encoding="utf-8-sig")):
        if krav and r.get(krav) != "1":
            continue
        for k in ("issn", "eissn"):
            i = issn(r.get(k))
            if i:
                m[i] = r.get(kol) if kol else "1"
    return m


def main():
    abdc = les("abdc.csv", "rating")
    ft = {**les("ft50.csv", None, "ft50_2026"), **les("utd24.csv")}
    maal = json.loads((T / "anslag" / "maal.json").read_text(encoding="utf-8"))
    ut = []
    for v in maal.values():
        ii = [i for i in (v.get("issn"), v.get("eissn")) if i]
        a = next((abdc[i] for i in ii if i in abdc), None)
        f = any(i in ft for i in ii)
        sit = v.get("sit2") or 0
        jufo = str(v.get("jufo") or "")
        if f or (a == "A*" and sit >= SIT_TOPP):
            k = "topp"
        elif a in ("A*", "A") and jufo in JUFO_TRE:
            k = "3"
        else:
            k = "lav"
        ut.append({"issn": v.get("issn") or "", "eissn": v.get("eissn") or "", "tittel": v.get("tittel") or "", "anslag": k})
    with open(T / "ajg-anslag.csv", "w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["issn", "eissn", "tittel", "anslag"])
        w.writeheader(); w.writerows(sorted(ut, key=lambda r: r["tittel"].lower()))
    print(f"Skrev ajg-anslag.csv: {len(ut)} tidsskrift, topp {sum(r['anslag'] == 'topp' for r in ut)}, "
          f"3 {sum(r['anslag'] == '3' for r in ut)}")


if __name__ == "__main__":
    main()
