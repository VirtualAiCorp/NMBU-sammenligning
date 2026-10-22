#!/usr/bin/env python3
"""Skandinavia-sammenligningen (fanen «Skandinavia» i den interne rangeringen, 18.10.2026).

Samme kilde og metode for alle land: artiklene (type article/review) OpenAlex knytter til enheten, per år, med AJG
2024-nivå satt per tidsskrift (OpenAlex-kilde → ISSN → ajg2024.csv). Norge er med på samme måte (ikke NVA), så tallene
kan sammenlignes på tvers av land; NVI-tallene vises ved siden av i fanen som kontroll (regnes i nettleseren).

Kilder (alle lokale, bygges av andre skript):
  data/rangering/openalex/norden/<enhet>/<år>.json   verk per enhet og år (scripts/rangering/hent_openalex.py norden),
                                                     med `kilde` (OpenAlex-kilde-id) per verk og `enhet` (ja/nei) for
                                                     enheter som avgrenses på tilknytningstekst
  data/rangering/openalex/enheter-norden.json (og ev. enheter-norge.json)   avgrensningen per enhet
  data/rangering/openalex/ajg-kilder.json            ISSN → OpenAlex-kilde for AJG-tidsskriftene
  data/rangering/norden/nevner/nevner.json           nevner per nordisk enhet og år med kvalitet (lag_nevner_norden.py)
  DBH (via build-rangering.py)                       nevner for de norske enhetene (UN1 + UN2 og UN1 + postdoktorer)

Ut går bare aggregater per enhet og år: [artikler, AJG 4*, 4, 3, 2, 1, i AJG-tidsskrift]. Ingen artikkel-id-er, ingen
navn og ingen AJG-nivå per tidsskrift.
"""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RANG = ROOT / "data" / "rangering"
OA = RANG / "openalex"
NIVAER = ["4*", "4", "3", "2", "1"]
LAND = {"dk": "DK", "se": "SE", "fi": "FI"}
# Hvem som hører til enheten avgjøres av hent_openalex.i_enheten (mønstertreff + «bare universitetsnavn»-regelen, likt i alle land)
_spec = importlib.util.spec_from_file_location("hent_openalex", Path(__file__).with_name("hent_openalex.py"))
hent_openalex = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(hent_openalex)


def _issn(x):
    """Samme form som build-rangering.issn: åtte tegn uten bindestrek."""
    x = "".join(c for c in str(x or "").upper() if c.isdigit() or c == "X")
    return x if len(x) == 8 else None


def _konfig():
    return {e["id"]: e for e in hent_openalex.enheter()}


def _nordiske_navn():
    ut = {}
    for land in ("danmark", "sverige", "finland"):
        f = RANG / "norden" / f"{land}.json"
        if f.exists():
            for e in json.loads(f.read_text(encoding="utf-8")).get("enheter", []):
                ut[e["id"]] = {"kort": e.get("kort") or e["id"], "navn": e.get("navn") or e["id"], "referanse": bool(e.get("referanse"))}
    return ut


def lag_skandinavia(skoler, ajg, aar):
    """skoler = de norske enhetene slik build-rangering.py skriver dem (med dbh per år); ajg = ISSN → (nivå, fagfelt, tittel)
    fra ajg2024.csv (None hvis lista mangler); aar = (første, siste)."""
    if not ajg:
        print("Skandinavia: AJG-lista mangler, fanen bygges ikke.")
        return None
    kilder_f = OA / "ajg-kilder.json"
    kilde_niva = {}
    if kilder_f.exists():
        for i, s in json.loads(kilder_f.read_text(encoding="utf-8")).items():
            n = ajg.get(_issn(i))
            if n and s:
                kilde_niva[s] = n[0]
    konfig = _konfig()
    navn = _nordiske_navn()
    nevner = json.loads((RANG / "norden" / "nevner" / "nevner.json").read_text(encoding="utf-8"))["enheter"] \
        if (RANG / "norden" / "nevner" / "nevner.json").exists() else {}
    norske = {s["id"]: s for s in skoler}
    y0, y1 = aar
    enheter, hentet, uten_kilde = [], set(), []
    for mappe in sorted((OA / "norden").iterdir()) if (OA / "norden").exists() else []:
        eid = mappe.name
        land = LAND.get(eid.split("_")[0], "NO")
        if land == "NO" and eid not in norske:
            continue
        if land != "NO" and eid not in navn:
            continue
        per = {}
        for y in range(y0, y1 + 1):
            f = mappe / f"{y}.json"
            if not f.exists():
                continue
            d = json.loads(f.read_text(encoding="utf-8"))
            hentet.add(d.get("hentet"))
            e_cfg = konfig.get(eid) or {"metode": d.get("metode")}
            verk = [w for w in d.get("verk", []) if hent_openalex.i_enheten(w, e_cfg)]
            if verk and not any("kilde" in w for w in d.get("verk", [])):
                uten_kilde.append(f"{eid} {y}")
                continue
            tell = {k: 0 for k in NIVAER}
            for w in verk:
                n = kilde_niva.get(w.get("kilde")) or (ajg.get(_issn(w.get("issn_l"))) or [None])[0]
                if n in tell:
                    tell[n] += 1
            v = [len(verk), *[tell[k] for k in NIVAER], sum(tell.values())]
            if land == "NO":
                db = (norske[eid].get("dbh") or {}).get(str(y)) or {}
                med, uten = db.get("uff"), db.get("utenStip")
            else:
                nv = (nevner.get(eid) or {}).get("aar", {}).get(str(y)) or {}
                med, uten = nv.get("med"), nv.get("uten")
            per[str(y)] = {"v": v, "med": med, "uten": uten}
        if not per:
            continue
        k = konfig.get(eid, {})
        if land == "NO":
            s = norske[eid]
            meta = {"kort": s["kort"], "navn": s["navn"], "referanse": s["referanse"], "meg": bool(s.get("isNmbu"))}
            nev = {"kvalitet": "god", "nivaa": "Enhetens avdelinger i DBH", "kilde": "DBH/HK-dir tabell 225 (årsverk)",
                   "forklaring": "Med = UN1 + stipendiater + postdoktorer (HK-dirs nevner), uten = UN1 + postdoktorer (NHHs nevner)."}
        else:
            meta = {**navn[eid], "meg": False}
            n = nevner.get(eid) or {}
            nev = {x: n.get(x) for x in ("kvalitet", "nivaa", "kilde", "forklaring", "eter") if n.get(x) is not None} or \
                  {"kvalitet": "mangler", "forklaring": "Ingen nevner funnet."}
        enheter.append({"id": eid, "land": land, **meta, "metode": k.get("metode"), "usikkerhet": k.get("usikkerhet"),
                        "nevner": nev, "aar": per})
    if uten_kilde:
        print(f"Skandinavia: {len(uten_kilde)} enhet-år i cachen mangler tidsskrift (`kilde`) og er hoppet over; "
              f"kjør hent_openalex.py norden --refresh. F.eks. {uten_kilde[:4]}")
    tell = {land: sum(1 for e in enheter if e["land"] == land) for land in ("NO", "SE", "DK", "FI")}
    print(f"Skandinavia: {len(enheter)} enheter {tell}, {len(kilde_niva)} AJG-tidsskrift koblet til OpenAlex")
    return {"kilde": "OpenAlex (CC0), artikler og oversiktsartikler per enhet og år; AJG 2024 per tidsskrift",
            "hentet": max((h for h in hentet if h), default=None), "aar": [y0, y1], "standard": [y1 - 2, y1],
            "enheter": enheter} if enheter else None
