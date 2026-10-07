#!/usr/bin/env python3
"""Aggregerte siteringsmål fra OpenAlex per enhet og år (fanen «Siteringer» og kartet i den interne rangeringen).

Leser cachene fra scripts/rangering/hent_nva_doi.py og scripts/rangering/hent_openalex.py (gitignored) og gir bare
aggregater per enhet og år: ingen artikkel-id-er, ingen titler og ingen navn. Brukes av scripts/build-rangering.py
(feltet `sitering`, kryptert som resten). Avhenger ikke av noen tidsskriftliste (AJG, ABDC osv.).

Norge: grunnlaget er NVA-artiklene i data/rangering/nva/ (samme som resten av rangeringen, uendret). Hver artikkel kobles
til OpenAlex på DOI fra NVA, ellers på normalisert tittel + tidsskrift (ISSN → OpenAlex-kilde) + år ±1 når treffet er
entydig. Tallene lagres for to grunnlag: NVI-rapporterte artikler («nvi») og alle i NVA («alle»).
Danmark, Sverige og Finland: verkene OpenAlex gir for enheten (enheter-norden.json), type article/review.

Per enhet, grunnlag og år: [n, d, m, mT, f, sF, p, t10, t1, sC] (se FELT) og et histogram over FWCI (for median).

Kjør alene for kontroll:  python3 scripts/rangering/sitering.py   (skriver treffrate og tabell, lagrer ingenting)
"""
import collections
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RANG = ROOT / "data" / "rangering"
OA = RANG / "openalex"
Y0, Y1 = 2016, 2025
FELT = ["n", "d", "m", "mT", "f", "sF", "p", "t10", "t1", "sC"]
FELT_FORKLARING = {
    "n": "artikler i grunnlaget", "d": "med DOI (Norge: fra NVA)", "m": "funnet i OpenAlex", "mT": "herav funnet på tittel",
    "f": "funnet og med FWCI", "sF": "sum FWCI", "p": "funnet og med siteringspersentil",
    "t10": "blant de 10 % mest siterte i felt og år", "t1": "blant de 1 % mest siterte", "sC": "sum siteringer (cited_by_count)",
}
# FWCI-histogram: kant k (nedre grense) for hver bøtte; siste bøtte er åpen. Median regnes i nettleseren med lineær
# interpolasjon innen bøtta (nøyaktig til ±0,025 under 3).
HIST = [round(i * 0.05, 2) for i in range(60)] + [3.0 + i * 0.25 for i in range(8)] + [5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 15.0, 20.0]


def bøtte(x):
    i = 0
    for k, g in enumerate(HIST):
        if x >= g:
            i = k
        else:
            break
    return i


def norm_tittel(t):
    t = unicodedata.normalize("NFKD", str(t or "")).lower()
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = re.sub(r"<[^>]+>", " ", t)  # html-merker i titler
    return re.sub(r"[^0-9a-zæøå]+", "", t)


def issn(s):
    s = re.sub(r"[^0-9Xx]", "", str(s or "")).upper()
    return f"{s[:4]}-{s[4:]}" if len(s) == 8 else None


class Akk:
    def __init__(self):
        self.v = [0, 0, 0, 0, 0, 0.0, 0, 0, 0, 0]
        self.h = collections.Counter()

    def legg(self, har_doi, w, tittel=False):
        v = self.v
        v[0] += 1; v[1] += bool(har_doi)
        if not w:
            return
        v[2] += 1; v[3] += bool(tittel)
        if w.get("fwci") is not None:
            v[4] += 1; v[5] += w["fwci"]; self.h[bøtte(w["fwci"])] += 1
        if w.get("pct") is not None:
            v[6] += 1; v[7] += bool(w.get("t10")); v[8] += bool(w.get("t1"))
        v[9] += w.get("sit") or 0

    def ut(self):
        v = self.v[:]
        v[5] = round(v[5], 3)
        return {"v": v, "h": {str(k): c for k, c in sorted(self.h.items())}}


def les(f, standard=None):
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else standard


# ── Norge ────────────────────────────────────────────────────────────────────
def tittel_indeks():
    """(kilde-id, normalisert tittel) → liste av (år, mål); og ISSN → kilde-id."""
    kilder = les(OA / "tittel" / "_kilder.json", {}) or {}
    issn_kilde = {i: v["id"] for i, v in kilder.items() if v}
    ind = collections.defaultdict(list)
    for f in (OA / "tittel").glob("S*.json"):
        sid = f.stem
        for w in les(f, {}).get("verk", []):
            nt = norm_tittel(w.get("tittel"))
            if len(nt) >= 12:
                ind[(sid, nt)].append(w)
    return ind, issn_kilde


def finn(x, aar, doi, doi_oa, tind, issn_kilde):
    """Gir (mål, på_tittel) for en NVA-artikkel, eller (None, False)."""
    if doi:
        return doi_oa.get(doi), False
    nt = norm_tittel(x.get("tittel"))
    if len(nt) < 12:
        return None, False
    kand = {}
    for i in (issn(x.get("issn")), issn(x.get("eissn"))):
        sid = issn_kilde.get(i)
        for w in tind.get((sid, nt), []) if sid else []:
            if w.get("aar") is not None and abs(int(w["aar"]) - aar) <= 1:
                kand[w["oa"]] = w
    return (next(iter(kand.values())), True) if len(kand) == 1 else (None, False)


def norge(skole_ider, hh=None):
    """Aggregater per skole: {sid: {"nvi": {år: {...}}, "alle": {...}}}. hh = skole-id som får mål per NVA-id (HH-lista)."""
    doi_oa = (les(OA / "norge-doi.json", {}) or {}).get("doi", {})
    if not doi_oa:
        return None, None, None
    tind, issn_kilde = tittel_indeks()
    ut, treff, per_art = {}, {}, {}
    for sid in skole_ider:
        grunn = {"nvi": {}, "alle": {}}
        tr = collections.Counter()
        for f in sorted((RANG / "nva" / sid).glob("*.json")):
            d = les(f)
            aar = int(d["aar"])
            if not (Y0 <= aar <= Y1):
                continue
            dd = (les(OA / "nva-doi" / sid / f"{aar}.json", {}) or {}).get("doi", {})
            akk = {"nvi": Akk(), "alle": Akk()}
            for x in d["artikler"]:
                doi = dd.get(x["id"])
                w, paa_tittel = finn(x, aar, doi, doi_oa, tind, issn_kilde)
                akk["alle"].legg(doi, w, paa_tittel)
                if x.get("nvi"):
                    akk["nvi"].legg(doi, w, paa_tittel)
                tr["n"] += 1; tr["doi"] += bool(doi); tr["m"] += bool(w); tr["mT"] += paa_tittel
                if x.get("nvi"):
                    tr["nvi"] += 1; tr["nviM"] += bool(w)
                if sid == hh and w:
                    per_art[x["id"]] = (None if w.get("fwci") is None else round(w["fwci"], 2),
                                        None if w.get("pct") is None else int(bool(w.get("t10"))))
            for g in ("nvi", "alle"):
                grunn[g][str(aar)] = akk[g].ut()
        ut[sid] = grunn
        treff[sid] = dict(tr)
    return ut, treff, per_art


# ── Danmark, Sverige og Finland ──────────────────────────────────────────────
def norden():
    cfg = les(OA / "enheter-norden.json", {"enheter": []})["enheter"]
    ut = {}
    for e in cfg:
        per = {}
        for f in sorted((OA / "norden" / e["id"]).glob("*.json")):
            d = les(f)
            akk = Akk(); sett = set()
            for w in d["verk"]:
                if w["oa"] in sett:
                    continue
                if e["metode"] == "tekst" and not w.get("enhet"):
                    continue
                if e["metode"] == "fag" and w.get("uf") in (e.get("utenUnderfelt") or []):
                    continue
                sett.add(w["oa"])
                akk.legg(True, w)
            per[str(d["aar"])] = akk.ut()
        if per:
            ut[e["id"]] = {"metode": e["metode"], "usikkerhet": e.get("usikkerhet"), "felt": e.get("felt"),
                           "aar": per, "hentet": max((les(f) or {}).get("hentet") or "" for f in (OA / "norden" / e["id"]).glob("*.json"))}
    return ut


def lag(skole_ider, hh=None):
    """Hele feltet `sitering` til rangeringsdataene, eller (None, {}) uten cache."""
    sk, treff, per_art = norge(skole_ider, hh)
    if sk is None:
        return None, {}
    nd = norden()
    hentet = (les(OA / "norge-doi.json", {}) or {}).get("hentet")
    return {
        "kilde": "OpenAlex (openalex.org), data under CC0. Hentet " + str(hentet) + ".",
        "hentet": hentet, "aar": [Y0, Y1], "felt": FELT, "feltForklaring": FELT_FORKLARING, "hist": HIST,
        # Ferske artikler har få siteringer: FWCI og persentil er normalisert på år, men usikre de første par årene.
        "forelopigFra": Y1 - 1, "standard": [Y1 - 4, Y1 - 2],
        "skoler": sk, "treff": treff, "norden": nd,
    }, per_art


# ── Kontroll fra kommandolinja ───────────────────────────────────────────────
def _median(h):
    n = sum(h.values())
    if not n:
        return None
    mål, acc = n / 2, 0
    for k in sorted(h, key=int):
        c = h[k]; k = int(k)
        if acc + c >= mål:
            lo = HIST[k]; hi = HIST[k + 1] if k + 1 < len(HIST) else lo + 5
            return lo + (hi - lo) * (mål - acc) / c
        acc += c
    return None


if __name__ == "__main__":
    skoler = json.loads((RANG / "skoler.json").read_text(encoding="utf-8"))
    data, per_art = lag([s["id"] for s in skoler], "nmbu")
    if not data:
        raise SystemExit("Mangler cache (kjør hent_nva_doi.py og hent_openalex.py norge).")
    print("Treffrate Norge 2016–2025 (alle i NVA / NVI):")
    tot = collections.Counter()
    for sid, t in data["treff"].items():
        tot.update(t)
        print(f"  {sid:11s} n {t['n']:5d}  DOI {100 * t['doi'] / t['n']:5.1f} %  funnet {100 * t['m'] / t['n']:5.1f} % "
              f"(tittel {t['mT']:3d})  NVI funnet {100 * t['nviM'] / max(t['nvi'], 1):5.1f} %")
    print(f"  {'SUM':11s} n {tot['n']:5d}  DOI {100 * tot['doi'] / tot['n']:5.1f} %  funnet {100 * tot['m'] / tot['n']:5.1f} % "
          f"(tittel {tot['mT']})  NVI funnet {100 * tot['nviM'] / tot['nvi']:5.1f} %")
    fra, til = data["standard"]
    print(f"\nStandardperiode {fra}–{til}, NVI-artikler:")
    for sid, g in data["skoler"].items():
        v = [0] * 10; h = collections.Counter()
        for y in range(fra, til + 1):
            x = g["nvi"].get(str(y))
            if x:
                v = [a + b for a, b in zip(v, x["v"])]; h.update({k: c for k, c in x["h"].items()})
        n, d, m, mT, f, sF, p, t10, t1, sC = v
        print(f"  {sid:11s} n {n:4d} dekning {100 * m / max(n, 1):5.1f} %  FWCI {sF / max(f, 1):5.2f} (median {_median(h) or 0:4.2f})  "
              f"topp10 {100 * t10 / max(p, 1):5.1f} % ({t10})  topp1 {t1}  sit/art {sC / max(m, 1):5.1f}")
    print("\nNorden:")
    for eid, e in data["norden"].items():
        v = [0] * 10
        for y in range(fra, til + 1):
            x = e["aar"].get(str(y))
            if x:
                v = [a + b for a, b in zip(v, x["v"])]
        n, d, m, mT, f, sF, p, t10, t1, sC = v
        print(f"  {eid:13s} n {n:5d} FWCI {sF / max(f, 1):5.2f} topp10 {100 * t10 / max(p, 1):5.1f} % ({t10}) år {sorted(e['aar'])[0]}–{sorted(e['aar'])[-1]}")
    print(f"\nHH-lista: {len(per_art)} artikler med OpenAlex-mål.")
