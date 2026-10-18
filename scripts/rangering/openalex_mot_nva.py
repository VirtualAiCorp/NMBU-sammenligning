#!/usr/bin/env python3
"""Kontroll av OpenAlex-avgrensningen av de norske enhetene mot NVA (lagrer ingenting, bare stdout eller --rapport).

For hver norsk enhet i data/rangering/openalex/enheter-norge.json og hvert år sammenlignes verkene OpenAlex gir for enheten
(cache fra `hent_openalex.py norden`, data/rangering/openalex/norden/<enhet>/<år>.json) med NVA-artiklene for samme enhet
(data/rangering/nva/<skole>/<år>.json), koblet på DOI (data/rangering/openalex/nva-doi/) og OpenAlex-id (NVA-DOI →
OpenAlex i norge-doi.json, og for NVA-artikler uten DOI tittel + tidsskrift + år ±1 som i sitering.py).

  recall     andel NVA-artikler med DOI (alle i NVA, og NVI-rapporterte) som OpenAlex-enheten fanger (OpenAlex-år fritt);
             «i OA» = andel av dem som finnes i OpenAlex i det hele tatt (taket for recall)
  presisjon  andel OpenAlex-treff for enheten som finnes blant enhetens NVA-artikler (alle år, DOI eller OpenAlex-id)
  AJG        AJG 2024-nivå per tidsskrift (data/rangering/tidsskrift/ajg2024.csv): NVA på ISSN/eISSN, OpenAlex på kilde-id
             (data/rangering/openalex/ajg-kilder.json) eller issn_l. 3+ = 3, 4, 4*; 4 = 4 og 4*.

Regelen for «bare universitetsnavn» (hent_openalex.i_enheten, BARE_REGEL) brukes som standard; --uten-regel viser bare
mønstertreffene, --begge viser begge. --norden viser hvor mye regelen endrer de danske og svenske tekstenhetene, mot
rapportenes artikkeltall i data/rangering/norden/<land>.json.

Ingen titler, navn eller artikkel-id-er skrives ut, bare tellinger.

Bruk:
  python3 scripts/rangering/openalex_mot_nva.py [--fra 2021 --til 2025] [--enhet nmbu,uis] [--begge] [--rapport fil.md]
  python3 scripts/rangering/openalex_mot_nva.py --norden
"""
import argparse
import collections
import csv
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hent_openalex as h  # noqa: E402
from issn import normaliser  # noqa: E402
import sitering  # noqa: E402

RANG = h.RANG
OA = h.OA


def les(f, standard=None):
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else standard


def ajg_oppslag():
    """ISSN → AJG 2024-nivå og OpenAlex-kilde → nivå."""
    nivaa = {}
    with open(RANG / "tidsskrift" / "ajg2024.csv", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            for i in (r.get("issn"), r.get("eissn")):
                i = normaliser(i)
                if i and r.get("ajg2024"):
                    nivaa[i] = r["ajg2024"].strip()
    kilde = {}
    for i, s in (les(OA / "ajg-kilder.json", {}) or {}).items():
        if s and normaliser(i) in nivaa:
            kilde[s] = nivaa[normaliser(i)]
    return nivaa, kilde


def gruppe(n):
    return "4" if n in ("4", "4*") else "3" if n == "3" else None


def nva_artikler(sid, fra, til, nivaa, kobling):
    """[(år, nvi, doi, ajg-nivå, OpenAlex-id)] for enheten. kobling = (doi_oa, tittelindeks, issn_kilde) fra sitering.py."""
    doi_oa, tind, issn_kilde = kobling
    ut = []
    for y in range(fra, til + 1):
        d = les(RANG / "nva" / sid / f"{y}.json")
        if not d:
            continue
        dd = (les(OA / "nva-doi" / sid / f"{y}.json", {}) or {}).get("doi", {})
        if not dd and sid == "ntnu_hh":  # NTNU HH er en del av NTNU; DOI-ene ligger under ntnu
            dd = (les(OA / "nva-doi" / "ntnu" / f"{y}.json", {}) or {}).get("doi", {})
        for x in d["artikler"]:
            n = nivaa.get(normaliser(x.get("issn"))) or nivaa.get(normaliser(x.get("eissn")))
            w, _ = sitering.finn(x, y, dd.get(x["id"]), doi_oa, tind, issn_kilde)
            ut.append((y, bool(x.get("nvi")), dd.get(x["id"]), n, (w or {}).get("oa")))
    return ut


def oa_verk(e, fra, til, kilde_niva, nivaa, oa_til_doi, regel):
    """[(år, doi, ajg-nivå, OpenAlex-id)] for verkene OpenAlex gir for enheten (unike på OpenAlex-id)."""
    ut, sett = [], set()
    for y in range(fra, til + 1):
        d = les(OA / "norden" / e["id"] / f"{y}.json")
        if not d:
            continue
        for w in d["verk"]:
            if w["oa"] in sett or not h.i_enheten(w, e, regel):
                continue
            sett.add(w["oa"])
            n = kilde_niva.get(w.get("kilde")) or nivaa.get(normaliser(w.get("issn_l")))
            ut.append((y, w.get("doi") or oa_til_doi.get(w["oa"]), n, w["oa"]))
    return ut


def tell(e, fra, til, ajg, kobling, oa_til_doi, regel):
    """Tellinger per år og samlet for én enhet."""
    nivaa, kilde_niva = ajg
    # NVA og OpenAlex hentes for hele 2016–2025, så en artikkel som har et annet år i OpenAlex enn i NVA, kobles likevel
    nva = nva_artikler(e["id"], H_FRA, H_TIL, nivaa, kobling)
    oa = oa_verk(e, H_FRA, H_TIL, kilde_niva, nivaa, oa_til_doi, regel)
    nva_doi = {x[2] for x in nva if x[2]}
    nva_oa = {x[4] for x in nva if x[4]}
    oa_doi = {x[1] for x in oa if x[1]}
    oa_oa = {x[3] for x in oa}
    per = {}
    for y in list(range(fra, til + 1)) + ["sum"]:
        i_aar = (lambda a: fra <= a <= til) if y == "sum" else (lambda a, y=y: a == y)
        c = collections.Counter()
        for a, nvi, d, n, o in nva:
            if not i_aar(a):
                continue
            g = gruppe(n)
            f = bool((d and d in oa_doi) or (o and o in oa_oa))
            c["nva"] += 1; c["nvaD"] += bool(d); c["nvaDO"] += bool(d and o); c["nvaDF"] += bool(d and f)
            c["nvi"] += nvi; c["nviD"] += bool(nvi and d); c["nviDF"] += bool(nvi and d and f)
            c["nva3"] += g in ("3", "4"); c["nva4"] += g == "4"
            c["nva3F"] += bool(g in ("3", "4") and f); c["nva4F"] += bool(g == "4" and f)
        for a, d, n, o in oa:
            if not i_aar(a):
                continue
            g = gruppe(n)
            c["oa"] += 1; c["oaU"] += not d; c["oaI"] += bool((d and d in nva_doi) or o in nva_oa)
            c["oa3"] += g in ("3", "4"); c["oa4"] += g == "4"
        per[y] = c
    return per


def pst(a, b):
    return f"{100 * a / b:5.1f}" if b else "    –"


def tabell(cfg, fra, til, ajg, kobling, oa_til_doi, regel, ut):
    navn = "med regelen" if regel else "bare mønster"
    ut.append(f"\n### OpenAlex-enheten mot NVA {fra}–{til} ({navn})\n")
    ut.append("| Enhet | NVA alle | med DOI | i OA | recall alle | recall NVI | OpenAlex | OA/NVA | presisjon | "
              "AJG 3+ NVA / OA / felles | AJG 4/4* NVA / OA / felles |")
    ut.append("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|")
    alle = {}
    for e in cfg:
        per = tell(e, fra, til, ajg, kobling, oa_til_doi, regel)
        alle[e["id"]] = per
        c = per["sum"]
        ut.append(f"| {e['id']} | {c['nva']} | {c['nvaD']} | {pst(c['nvaDO'], c['nvaD'])} | {pst(c['nvaDF'], c['nvaD'])} | "
                  f"{pst(c['nviDF'], c['nviD'])} | {c['oa']} | {c['oa'] / max(c['nva'], 1):.2f} | {pst(c['oaI'], c['oa'])} | "
                  f"{c['nva3']} / {c['oa3']} / {c['nva3F']} | {c['nva4']} / {c['oa4']} / {c['nva4F']} |")
    ut.append(f"\nPer år (recall alle / presisjon, %):\n")
    ut.append("| Enhet | " + " | ".join(str(y) for y in range(fra, til + 1)) + " |")
    ut.append("|---|" + "---:|" * (til - fra + 1))
    for sid, per in alle.items():
        ut.append(f"| {sid} | " + " | ".join(
            f"{pst(per[y]['nvaDF'], per[y]['nvaD']).strip()} / {pst(per[y]['oaI'], per[y]['oa']).strip()}"
            for y in range(fra, til + 1)) + " |")
    return alle


def norden_effekt(fra, til, ajg, ut):
    """Regelens effekt for de danske, svenske og finske enhetene, mot rapportenes artikkeltall (perioden fra–til, ellers
    den lengste perioden rapporten har, f.eks. Danmark 2024)."""
    nivaa, kilde_niva = ajg
    ref = {}
    for land in ("danmark", "sverige", "finland"):
        for e in (les(RANG / "norden" / f"{land}.json", {}) or {}).get("enheter", []):
            pp = [p for p in e.get("perioder") or [] if p.get("artikler")]
            if pp:
                ref[e["id"]] = next((p for p in pp if (p.get("fra"), p.get("til")) == (fra, til)),
                                    max(pp, key=lambda p: (p["til"] - p["fra"], p["til"])))
    ut.append(f"\n### Regelen for de andre landene (OpenAlex-artikler mot rapportenes tall, {fra}–{til} der rapporten har det)\n")
    ut.append("| Enhet | metode | periode | rapport artikler | OA mønster | OA med regel | endring | dekning før → etter | "
              "rapport AJG 4/4* | OA 4/4* før → etter |")
    ut.append("|---|---|---|---:|---:|---:|---:|---:|---:|---:|")
    for e in h.enheter(["dk", "se", "fi"]):
        r = ref.get(e["id"]) or {}
        f0, t0 = (r.get("fra") or fra), (r.get("til") or til)
        tall = []
        for regel in (False, True):
            v = oa_verk(e, f0, t0, kilde_niva, nivaa, {}, regel)
            tall.append((len(v), sum(1 for _, _, n, _ in v if gruppe(n) == "4")))
        ra = r.get("artikler")
        dek = (f"{pst(tall[0][0], ra).strip()} → {pst(tall[1][0], ra).strip()} %" if ra else "–")
        ut.append(f"| {e['id']} | {e['metode']} | {f0}–{t0} | {ra or '–'} | {tall[0][0]} | {tall[1][0]} | "
                  f"{pst(tall[1][0] - tall[0][0], tall[0][0]).strip()} % | {dek} | {r.get('ajg4', '–')} | "
                  f"{tall[0][1]} → {tall[1][1]} |")


H_FRA, H_TIL = 2016, 2025


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fra", type=int, default=2021)
    ap.add_argument("--til", type=int, default=2025)
    ap.add_argument("--enhet")
    ap.add_argument("--uten-regel", action="store_true")
    ap.add_argument("--begge", action="store_true")
    ap.add_argument("--norden", action="store_true", help="regelens effekt for Danmark og Sverige (mot rapportene)")
    ap.add_argument("--rapport", help="skriv tabellene som Markdown til denne fila (ellers bare stdout)")
    a = ap.parse_args()
    ajg = ajg_oppslag()
    ut = []
    if a.norden:
        norden_effekt(2023, 2025, ajg, ut)
    else:
        cfg = h.enheter(["no"])
        if a.enhet:
            cfg = [e for e in cfg if e["id"] in a.enhet.split(",")]
        doi_oa = (les(OA / "norge-doi.json", {}) or {}).get("doi") or {}
        oa_til_doi = {v["oa"]: d for d, v in doi_oa.items() if v}
        tind, issn_kilde = sitering.tittel_indeks()
        kobling = (doi_oa, tind, issn_kilde)
        for regel in ([False, True] if a.begge else [not a.uten_regel]):
            tabell(cfg, a.fra, a.til, ajg, kobling, oa_til_doi, regel, ut)
    tekst = "\n".join(ut) + "\n"
    print(tekst)
    if a.rapport:
        Path(a.rapport).write_text(tekst, encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())
