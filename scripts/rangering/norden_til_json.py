#!/usr/bin/env python3
"""Legger foreløpige publiseringstall fra de nordiske utforskningsrapportene inn i data/rangering/norden/<land>.json.

Rapportene (data/rangering/inspirasjon/norden-<land>.md) skrives av agenter og redigeres ikke her. Skriptet leser
markdown-tabellene i rapporten, kjenner igjen kolonnene på overskriften og radene på enhetenes «alias» i JSON-fila, og
skriver tallene inn som en periode. Bare aggregerte tall per enhet (antall og per 100 årsverk); aldri AJG-nivå per
tidsskrift.

Bruk:
  python3 scripts/rangering/norden_til_json.py les data/rangering/inspirasjon/norden-finland.md finland [--periode 2023-2025] [--skriv]
  python3 scripts/rangering/norden_til_json.py sjekk            # kontrollerer alle land-filene
  python3 scripts/rangering/norden_til_json.py mal danmark      # skriver en tom enhet til skjermen

«les» uten --skriv viser bare hva som ville blitt lagt inn (tørrkjøring). Tabeller med «/100» i overskriften blir
hovedperioden (fagfelt- eller enhetsavgrenset, som rapporten sier); tabeller med AJG-kolonner uten «/100» blir
«enhetskontroll» (antall med enhetsavgrensning). Rader som ikke passer noen enhet (f.eks. norske skoler regnet på samme
måte) listes og hoppes over. Kolonner som ikke kjennes igjen, listes også; legg dem inn for hånd ved behov.
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
NORDEN = ROOT / "data" / "rangering" / "norden"
LAND = ["danmark", "sverige", "finland"]
BOKS = (-2.0, 53.0, 40.0, 72.0)

# (mønster i overskriften, felt for per-100-kolonne, felt for antall-kolonne)
KOLONNER = [
    (r"ajg\s*4/4\*?.*(uten|ii[–-]iv)", "ajg4Per100UtenStip", None),
    (r"^ajg\s*4\*?$", "ajg4sPer100", "ajg4s"),  # norm() fjerner stjerna: «AJG 4*» → «AJG 4»
    (r"ajg\s*4/4\*?|ajg\s*4\+", "ajg4Per100", "ajg4"),
    (r"ajg\s*3\+", "ajg3Per100", "ajg3"),
    (r"dekning", "ajgDekning", "ajgDekning"),
    (r"^artikler\s*/\s*100", "artiklerPer100", None),
    (r"^artikler|^nvi-artikler|^publikasjoner", None, "artikler"),
    (r"^årsverk|^ÅV", None, "arsverk"),
    (r"jufo\s*2|bfi\s*2|nivå\s*2", "niva2Per100", "niva2"),
    (r"abdc\s*a\*?$", "abdcAsPer100", "abdcAs"),
    (r"abdc", "abdcPer100", "abdc"),
    (r"ft50\s*(∪|og|\+)\s*utd24", "ftUtdPer100", "ftUtd"),
    (r"^ft50", "ft50Per100", "ft50"),
]
TALLFELT = {"artikler", "arsverk", "artiklerPer100", "ajg4", "ajg4Per100", "ajg4Per100UtenStip", "ajg3", "ajg3Per100",
            "ajgDekning", "niva2", "niva2Per100", "abdc", "abdcPer100", "ftUtd", "ftUtdPer100", "ajg4s", "ajg4sPer100",
            "abdcAs", "abdcAsPer100", "ft50", "ft50Per100", "arsverkUtenStip", "ajg3Per100UtenStip"}


def norm(s):
    s = re.sub(r"[*_`\\]", "", s or "").strip()
    return re.sub(r"\s+", " ", s)


def tall(s):
    s = norm(s).replace(" ", "").replace(" ", "").replace(" ", "").replace("%", "").replace("−", "-")
    if not s or s in "–-":
        return None
    s = s.replace(",", ".")
    try:
        v = float(s)
    except ValueError:
        return None
    return int(v) if v.is_integer() else v


def tabeller(md):
    """Alle markdown-tabeller: (overskrifter, rader)."""
    ut, blokk = [], []
    for linje in md.splitlines() + [""]:
        if linje.strip().startswith("|"):
            blokk.append([c.strip() for c in linje.strip().strip("|").split("|")])
        elif blokk:
            if len(blokk) >= 3 and set("".join(blokk[1])) <= set("-: "):
                ut.append(([norm(h) for h in blokk[0]], blokk[2:]))
            blokk = []
    return ut


def felt_for(h, per100):
    hl = h.lower()
    for mon, f100, fant in KOLONNER:
        if re.search(mon, hl):
            if mon == "dekning":
                return "ajgDekning"
            return f100 if ("/100" in hl or "per 100" in hl) else fant
    return None


def enhet_for(etikett, enheter):
    e = norm(re.sub(r"\(.*?\)", "", norm(etikett))).lower()
    for x in enheter:
        for a in x.get("alias") or [x["kort"]]:
            if e == a.lower() or e.startswith(a.lower() + " ") or e.startswith(a.lower()):
                return x
    return None


def les(a):
    fil = NORDEN / f"{a.land}.json"
    d = json.loads(fil.read_text(encoding="utf-8"))
    fra, til = (int(x) for x in a.periode.split("-"))
    md = Path(a.rapport).read_text(encoding="utf-8")
    funnet = 0
    for hode, rader in tabeller(md):
        hl = " ".join(hode).lower()
        if "ajg" not in hl or not any(re.search(r"^artikler|nvi-artikler|publikasjoner", h.lower()) for h in hode):
            continue
        per100 = "/100" in hl or "per 100" in hl
        kol = {i: felt_for(h, per100) for i, h in enumerate(hode) if i}
        ukjent = [hode[i] for i, f in kol.items() if not f]
        print(f"\nTabell: {' | '.join(hode)}\n  → {'hovedperiode' if per100 else 'enhetskontroll'}; kolonner: "
              + ", ".join(f"{hode[i]} = {f}" for i, f in kol.items() if f) + (f"\n  ikke kjent igjen: {ukjent}" if ukjent else ""))
        for r in rader:
            if not r or not norm(r[0]):
                continue
            x = enhet_for(r[0], d["enheter"])
            if not x:
                print(f"  hopper over rad «{norm(r[0])}» (ingen enhet med det aliaset)")
                continue
            verdier = {f: tall(r[i]) for i, f in kol.items() if f and i < len(r) and tall(r[i]) is not None}
            if per100:
                p = next((p for p in x["perioder"] if p["fra"] == fra and p["til"] == til), None)
                if not p:
                    p = {"fra": fra, "til": til}
                    x["perioder"].append(p)
                p.update(verdier)
                p.setdefault("anslag", True)
                p.setdefault("telling", "hel")
            else:
                x["enhetskontroll"] = {"fra": fra, "til": til, **verdier}
            funnet += 1
            print(f"  {x['id']:16s} {verdier}")
    if not funnet:
        print("Fant ingen tabeller med artikler og AJG-kolonner. Legg tallene inn for hånd (se README.md).")
    if a.skriv:
        fil.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(f"\nSkrev {fil.relative_to(ROOT)}.")
    else:
        print("\n(Tørrkjøring. Bruk --skriv for å lagre.)")
    sjekk_land(a.land)


def sjekk_land(land):
    fil = NORDEN / f"{land}.json"
    if not fil.exists():
        print(f"{land}: mangler {fil.relative_to(ROOT)}"); return 1
    d = json.loads(fil.read_text(encoding="utf-8"))
    feil = 0
    ider = set()
    for x in d.get("enheter", []):
        for k in ("id", "navn", "kort", "by", "lat", "lon"):
            if x.get(k) in (None, ""):
                print(f"  {land}/{x.get('id')}: mangler {k}"); feil += 1
        if x.get("id") in ider:
            print(f"  {land}: dobbel id {x['id']}"); feil += 1
        ider.add(x.get("id"))
        if x.get("lat") is not None and not (BOKS[1] <= x["lat"] <= BOKS[3] and BOKS[0] <= x["lon"] <= BOKS[2]):
            print(f"  {land}/{x['id']}: koordinatene ligger utenfor kartet"); feil += 1
        for p in x.get("perioder", []):
            ukjent = set(p) - TALLFELT - {"fra", "til", "anslag", "telling", "avgrensning", "nevner", "merknad", "kilde"}
            if ukjent:
                print(f"  {land}/{x['id']}: ukjente felt {sorted(ukjent)} (tillatt: aggregerte tall)"); feil += 1
            if p.get("artiklerPer100") is None and p.get("artikler") and p.get("arsverk"):
                p["artiklerPer100"] = round(100 * p["artikler"] / p["arsverk"], 1)
    med = sum(1 for x in d.get("enheter", []) if x.get("perioder"))
    print(f"{land}: {len(d.get('enheter', []))} enheter, {med} med tall, status «{d.get('status')}»{'' if not feil else f', {feil} feil'}")
    return feil


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("les"); p.add_argument("rapport"); p.add_argument("land", choices=LAND)
    p.add_argument("--periode", default="2023-2025"); p.add_argument("--skriv", action="store_true")
    sub.add_parser("sjekk")
    m = sub.add_parser("mal"); m.add_argument("land", choices=LAND)
    a = ap.parse_args()
    if a.cmd == "les":
        les(a)
    elif a.cmd == "sjekk":
        sys.exit(1 if sum(sjekk_land(l) for l in LAND) else 0)
    else:
        print(json.dumps({"id": f"{a.land[:2]}_ny", "navn": "", "kort": "", "alias": [""], "by": "", "lat": None, "lon": None,
                          "referanse": False, "akkrediteringer": [], "forbehold": [],
                          "perioder": [{"fra": 2023, "til": 2025, "artikler": None, "arsverk": None, "ajg4Per100": None,
                                        "ajg3Per100": None, "anslag": True, "telling": "hel"}]}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
