#!/usr/bin/env python3
"""Verdensgrunnlag per AJG-tidsskrift 2021–2025 (OpenAlex): antall article/review, antall i topp 10 % og topp 1 %.
Spørringene er bunter av kilde-id-er uten kobling til AJG-nivå. Lagrer {kilde-id: [n, t10, t1]} til argv[1]."""
import collections, json, sys
from pathlib import Path
sys.path.insert(0, str(Path.home() / "Desktop/BOA-sammenligning/scripts/rangering"))
from hent_openalex import OA, Klient
kilder = sorted({v for v in json.load(open(OA / "ajg-kilder.json")).values() if v})
print(len(kilder), "kilder")
k = Klient(40)
BAS = "publication_year:2021-2025,type:article|review"
ut = collections.defaultdict(lambda: [0, 0, 0])
for j, ekstra in enumerate(("", ",citation_normalized_percentile.is_in_top_10_percent:true", ",citation_normalized_percentile.is_in_top_1_percent:true")):
    for i in range(0, len(kilder), 100):
        d = k.hent("/works", {"filter": f"primary_location.source.id:{'|'.join(kilder[i:i+100])},{BAS}{ekstra}", "group_by": "primary_location.source.id", "per_page": 200})
        for x in (d or {}).get("group_by", []):
            ut[x["key"].rsplit("/", 1)[-1]][j] = x["count"]
    print(j, len(ut), "kreditter igjen", k.igjen)
json.dump(ut, open(sys.argv[1], "w"))
n, a, b = (sum(v[i] for v in ut.values()) for i in range(3))
print(f"Verden: {n} artikler, topp 10 % {a/n:.3f}, topp 1 % {b/n:.3f}")
