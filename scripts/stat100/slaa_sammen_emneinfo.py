"""Slår sammen innsamlet emneinfo (pensum, læringsmål, studiepoeng) til data/nmbu/kilder/stat100/emneinfo.json.

Inndata: JSON-filer fra gjennomgangen av emnesidene ({"emner": [...]}, ett objekt per emne). Pensum hentet fra uoffisielle
kilder (bruktannonser o.l.) merkes «usikker», så siden kan vise det.
Bruk: python3 scripts/stat100/slaa_sammen_emneinfo.py fil1.json [fil2.json …]
"""
import json, re, sys
from pathlib import Path

UT = Path(__file__).resolve().parents[2] / "data" / "nmbu" / "kilder" / "stat100" / "emneinfo.json"
ALIAS = [("NMBU", r"^NMBU|miljø- og bio"), ("NTNU", r"^NTNU|teknisk-natur"), ("UiA", r"^UiA|Agder"), ("UiS", r"^UiS|Stavanger"),
         ("UiT", r"^UiT|arktiske"), ("Nord", r"^Nord"), ("USN", r"USN|Sørøst"), ("OsloMet", r"OsloMet"), ("INN", r"^INN|Innlandet"),
         ("NHH", r"^NHH|Norges handels"), ("BI", r"^BI\b|Handelshøyskolen BI")]
REKKE = ["NMBU", "NTNU", "UiA", "UiS", "UiT", "Nord", "USN", "OsloMet", "INN", "NHH", "BI"]

emner = []
for f in sys.argv[1:]:
    for e in json.load(open(f, encoding="utf-8"))["emner"]:
        for b in e.get("pensum") or []:
            b["usikker"] = bool(re.search(r"uoffisiell|finn|bruktannonse|educatly|ikke bekreftet|usikker", b.get("kilde") or "", re.I))
        navn = e["inst"]
        e["inst_kort"] = next((k for k, mønster in ALIAS if re.search(mønster, navn, re.I)), navn)
        sted = re.search(r"\((Ålesund|Gjøvik|Rena|Lillehammer)\)", navn)
        e["inst"] = e["inst_kort"] + (f" ({sted.group(1)})" if sted else "")
        emner.append(e)
def rens(v):
    """Fjerner personlige hjemmeområder (…/~brukernavn/…) som kan identifisere ansatte."""
    if isinstance(v, str): return re.sub(r",?\s*\S*~[a-z0-9]+\S*", "", v)
    if isinstance(v, list): return [rens(x) for x in v]
    if isinstance(v, dict): return {k: rens(x) for k, x in v.items()}
    return v
emner = [rens(e) for e in emner]
emner.sort(key=lambda e: (REKKE.index(e["inst_kort"]) if e["inst_kort"] in REKKE else 99, e["kode"]))
UT.write_text(json.dumps({"hentet": "2026-10-15", "emner": emner}, ensure_ascii=False, indent=1), encoding="utf-8")
print(UT, len(emner), "emner;", sum(1 for e in emner for b in e.get("pensum") or [] if not b["usikker"]), "sikre og",
      sum(1 for e in emner for b in e.get("pensum") or [] if b["usikker"]), "usikre bøker")
