#!/usr/bin/env python3
"""Genererer kilde/src/styles/tema-overrides.css: fargetemaene for faste NMBU-farger i komponentene.

Fargetemaene (tema.css) redefinerer var(--nmbu-…), men mange komponenter – også de originale HH-komponentene
som ikke skal endres – har NMBU-fargene skrevet rett inn (backgroundColor: '#025C4F', fill="#025C4F").
React skriver dem som «rgb(2, 92, 79)» i style-attributtet, og Recharts som fill/stroke-attributter, så de
kan overstyres med attributtselektorer når et fargetema er valgt (:root[data-farge]).

Bare NMBU-palettens egne koder byttes (kartet under). Semantiske farger (grønt = bedre, rødt = svakere)
og institusjonsfargene i grafene står urørt.

Kjør etter større endringer i komponentene:
  python3 scripts/build-tema-css.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "kilde" / "src" / "app"
OUT = ROOT / "kilde" / "src" / "styles" / "tema-overrides.css"

# NMBU-kode → temavariabel (se rollene i tema.css)
KART = {
    "#025c4f": "--nmbu-green-dark", "#0b4f43": "--nmbu-green-dark",
    "#247761": "--nmbu-green-6", "#009a81": "--nmbu-green",
    "#46b4a0": "--nmbu-green-2", "#8bcec0": "--nmbu-green-3", "#b8d8cf": "--nmbu-green-3",
    "#d1e8df": "--nmbu-green-4",
    "#dbf8f4": "--nmbu-green-light", "#e6f5f3": "--nmbu-green-light", "#e6f4f1": "--nmbu-green-light", "#f0f7f5": "--nmbu-green-light",
}
# Mørke roller blir lys aksenttekst i mørk modus
MORK_ROLLE = {"--nmbu-green-dark", "--nmbu-green-6", "--nmbu-green"}
T = ':root[data-farge]'
TD = ':root[data-farge][data-theme="dark"]'


def rgb(h):
    return "rgb(%d, %d, %d)" % tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def main():
    brukt = set()
    for f in list(SRC.rglob("*.tsx")) + list(SRC.rglob("*.ts")):
        for m in re.finditer(r"#[0-9a-fA-F]{6}\b", f.read_text(encoding="utf-8")):
            if m.group(0).lower() in KART:
                brukt.add(m.group(0).lower())
    linjer = ["/* GENERERT av scripts/build-tema-css.py – ikke rediger for hånd. */",
              "/* Faste NMBU-farger i komponentene følger valgt fargetema (tema.css). */", ""]
    for h in sorted(brukt):
        v, r = KART[h], rgb(h)
        farge = f"var({v})"
        linjer.append(f'{T} [style^="color: {r}"], {T} [style*=" color: {r}"] {{ color: {farge} !important; }}')
        linjer.append(f'{T} [style*="background-color: {r}"], {T} [style*="background: {r}"] {{ background-color: {farge} !important; }}')
        linjer.append(f'{T} [style*="border: 1px solid {r}"], {T} [style*="border-color: {r}"], {T} [style*="solid {r}"] {{ border-color: {farge} !important; }}')
        linjer.append(f'{T} [fill="{h}" i] {{ fill: {farge}; }} {T} [stroke="{h}" i] {{ stroke: {farge}; }}')
        if v in MORK_ROLLE:
            # Mørk modus: tekst i hovedfargen blir lys aksent, som dark.css gjør for var(--nmbu-green-dark)
            linjer.append(f'{TD} [style^="color: {r}"], {TD} [style*=" color: {r}"] {{ color: var(--dm-accent-text) !important; }}')
            linjer.append(f'{TD} [fill="{h}" i] {{ fill: var(--nmbu-green); }} {TD} [stroke="{h}" i] {{ stroke: var(--nmbu-green); }}')
    OUT.write_text("\n".join(linjer) + "\n", encoding="utf-8")
    print(f"{len(brukt)} NMBU-farger i bruk → {OUT.relative_to(ROOT)} ({len(linjer) - 3} regler)")


if __name__ == "__main__":
    main()
