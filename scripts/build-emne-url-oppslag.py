#!/usr/bin/env python3
"""Oppslagsfil for Kristianias emnesider → kilde/public/emner/url-8253.json

Kristiania har ikke et fast URL-mønster: emnesiden ligger under fakultet og nivå,
https://www.kristiania.no/studieportal/{fakultet}/{nivå}/{kode}/ (siden videresender til full adresse med tittel).
Fakultet og nivå hentes fra sidekartet (https://www.kristiania.no/sitemap.xml, lagret av kartleggingen i
data/nmbu/kilder/bi-kristiania/kristiania_emne_url_fra_sitemap.json). Filen tar bare med emnekodene som finnes i det
nasjonale emneregisteret (kilde/public/emner/index.json), så den holder seg liten. emneUrl.ts laster den i bakgrunnen.

Bruk: python3 scripts/build-emne-url-oppslag.py [--refresh]   (--refresh henter sidekartet på nytt)
"""
import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITEMAP = ROOT / "data/nmbu/kilder/bi-kristiania/kristiania_emne_url_fra_sitemap.json"
INDEX = ROOT / "kilde/public/emner/index.json"
OUT = ROOT / "kilde/public/emner/url-8253.json"
RE_URL = re.compile(r"https://www\.kristiania\.no/studieportal/([^/]+/[^/]+)/([^/]+)/")


def hent_sidekart():
    xml = subprocess.run(["curl", "-s", "-A", "Mozilla/5.0", "https://www.kristiania.no/sitemap.xml"],
                         capture_output=True, text=True, check=True).stdout
    urls = re.findall(r"<loc>(https://www\.kristiania\.no/studieportal/[^<]+)</loc>", xml)
    kart = {}
    for u in urls:
        m = RE_URL.match(u)
        if m and "fagskole" not in m.group(1):
            kart.setdefault(m.group(2), u)
    json.dump({"kilde": "https://www.kristiania.no/sitemap.xml", "hentet": date.today().isoformat(), "antall": len(kart),
               "kode_til_url": kart}, open(SITEMAP, "w", encoding="utf-8"), ensure_ascii=False, indent=0)


def seg(kode):
    k = re.sub(r"-\d+$", "", kode).lower().replace(" ", "-")
    return k


def main():
    if "--refresh" in sys.argv:
        hent_sidekart()
    sk = json.load(open(SITEMAP, encoding="utf-8"))
    per_seg = {}
    for u in sk["kode_til_url"].values():
        m = RE_URL.match(u)
        if m and "fagskole" not in m.group(1):
            per_seg.setdefault(m.group(2), m.group(1))
    koder = [c[1] for c in json.load(open(INDEX, encoding="utf-8"))["courses"] if c[0] == "8253"]
    prefiks, k, mangler = [], {}, []
    for kode in koder:
        s = seg(kode)
        if s not in per_seg:
            s2 = re.sub(r"-(bed|b)$", "", s)
            if s2 in per_seg:
                s = s2
            else:
                mangler.append(kode)
                continue
        p = per_seg[s]
        if p not in prefiks:
            prefiks.append(p)
        i = prefiks.index(p)
        k[kode] = i if s == seg(kode) else [i, s]
    json.dump({"hentet": sk["hentet"], "kilde": sk["kilde"], "base": "https://www.kristiania.no/studieportal/",
               "p": prefiks, "k": k}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{len(k)} av {len(koder)} Kristiania-emner har lenke ({OUT.stat().st_size // 1024} kB). Uten treff: {', '.join(mangler[:12])}…")


if __name__ == "__main__":
    main()
