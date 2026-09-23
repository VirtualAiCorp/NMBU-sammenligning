#!/usr/bin/env python3
"""Genererer kilde/src/styles/dark-overrides.css: mørk modus for faste fargekoder i komponentene.

Mange komponenter (også de originale HH-komponentene fra Figma, som ikke skal endres) har faste farger
i inline-stil, f.eks. backgroundColor: '#fff' eller color: '#555'. React skriver dem som
«background-color: rgb(255, 255, 255)» i style-attributtet, så de kan overstyres med attributtselektorer
under :root[data-theme="dark"] uten å røre komponentene.

Regler (etter relativ luminans L):
  bakgrunn  lys (L > 0,55)  → mørk flate med samme fargetone (blandes inn i --dm-surface)
            mørk            → uendret (mørke kort med hvit tekst fungerer i begge modi)
  tekst     mørk (L < 0,3)  → lys tekst (grå → --nmbu-neutral, farget → lysnet)
            middels         → lysnet så kontrasten holder mot mørk flate
            lys             → uendret
  kant      lys (L > 0,55)  → --nmbu-neutral-3 (mørk kant)
SVG (Recharts): fill/stroke-attributter med faste farger håndteres for grå rutenett, aksetekster og NMBU-grønt.

Kjør etter større endringer i komponentene:
  python3 scripts/build-dark-css.py
"""
import colorsys
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "kilde" / "src" / "app"
OUT = ROOT / "kilde" / "src" / "styles" / "dark-overrides.css"
SURFACE = (0x1a, 0x21, 0x1e)  # --dm-surface
TEXT = (0xe6, 0xeb, 0xe8)

NAMED = {"white": "#ffffff", "black": "#000000"}


def parse(c):
    c = NAMED.get(c.lower(), c).lower()
    m = re.fullmatch(r"#([0-9a-f]{3}|[0-9a-f]{6})", c)
    if not m:
        return None
    h = m.group(1)
    if len(h) == 3:
        h = "".join(x * 2 for x in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def lum(rgb):
    def ch(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def mix(a, b, t):
    return tuple(round(a[i] * (1 - t) + b[i] * t) for i in range(3))


def hexs(rgb):
    return "#%02x%02x%02x" % rgb


def css_rgb(rgb):
    return "rgb(%d, %d, %d)" % rgb


def chroma(rgb):
    return max(rgb) - min(rgb)


def dark_bg(rgb):
    if chroma(rgb) < 24:  # grå/hvit: flate, eller litt forsenket flate for lysegrå
        return SURFACE if lum(rgb) > 0.93 else mix(SURFACE, (0, 0, 0), 0.25)
    h, _, _ = colorsys.rgb_to_hls(*(x / 255 for x in rgb))  # farget tone: samme fargetone, mørk og dempet
    return tuple(round(x * 255) for x in colorsys.hls_to_rgb(h, 0.17, 0.38))


def light_text(rgb):
    if chroma(rgb) < 24:
        return TEXT if lum(rgb) < 0.12 else mix(TEXT, SURFACE, 0.22)
    t = 0.0
    out = rgb
    while contrast(out, SURFACE) < 4.5 and t < 1:
        t += 0.05
        out = mix(rgb, (255, 255, 255), t)
    return out


def main():
    bg, fg, border = {}, {}, {}
    ctx = re.compile(r"(backgroundColor|background|color|border(?:Top|Bottom|Left|Right)?(?:Color)?)\s*:\s*['\"`]([^'\"`]+)['\"`]")
    for f in SRC.rglob("*.tsx"):
        s = f.read_text(encoding="utf-8")
        for prop, val in ctx.findall(s):
            for tok in re.findall(r"#[0-9a-fA-F]{3,6}\b|\bwhite\b", val):
                rgb = parse(tok)
                if rgb is None:
                    continue
                if prop in ("backgroundColor", "background"):
                    bg[rgb] = bg.get(rgb, 0) + 1
                elif prop == "color":
                    fg[rgb] = fg.get(rgb, 0) + 1
                else:
                    border[rgb] = border.get(rgb, 0) + 1

    D = ':root[data-theme="dark"]'
    lines = ["/* GENERERT av scripts/build-dark-css.py – ikke rediger for hånd. */",
             "/* Mørk modus for faste inline-farger i komponentene (se skriptet for reglene). */", ""]
    n = 0
    for rgb in sorted(bg, key=lum, reverse=True):
        if lum(rgb) <= 0.55:
            continue
        sel = f'{D} [style*="background-color: {css_rgb(rgb)}"], {D} [style*="background: {css_rgb(rgb)}"]'
        lines.append(f"{sel} {{ background-color: {hexs(dark_bg(rgb))} !important; }}")
        n += 1
    for rgb in sorted(fg, key=lum):
        if contrast(rgb, SURFACE) >= 4.5:
            continue
        sel = f'{D} [style^="color: {css_rgb(rgb)}"], {D} [style*=" color: {css_rgb(rgb)}"]'
        lines.append(f"{sel} {{ color: {hexs(light_text(rgb))} !important; }}")
        n += 1
    for rgb in sorted(border, key=lum, reverse=True):
        if lum(rgb) <= 0.55:
            continue
        lines.append(f'{D} [style*="solid {css_rgb(rgb)}"], {D} [style*="dashed {css_rgb(rgb)}"] {{ border-color: var(--nmbu-neutral-3) !important; }}')
        n += 1
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"{n} regler ({len(bg)} bakgrunner, {len(fg)} tekstfarger, {len(border)} kantfarger funnet). Skrev {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
