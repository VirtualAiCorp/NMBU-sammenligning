"""Kommuner og koordinater for studiestedene (cache i ../kilder/geo/).

  SSB Klass 131 (kommuneendringer 2017–2026): gamle kommunenummer i DBH 124 (f.eks. 0214 Ås, 3021 Ås) → dagens (3218).
  Kartverket kommuneinfo: kommunenavn, fylke og et punkt i kommunen (punktIOmrade) per kommunenummer.
  Kartverket stedsnavn: representasjonspunkt for selve stedet (by, tettsted, bydel) når det finnes i kommunen.

Alle svar caches som JSON; nettkall bare når noe mangler i cachen (høyst to samtidige).
"""
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

GEO = Path(__file__).resolve().parent.parent / "kilder" / "geo"
SSB = "https://data.ssb.no/api/klass/v1/classifications/131/changes?from=2017-01-01&to=2026-10-01"
KOMMUNE = "https://api.kartverket.no/kommuneinfo/v1/kommuner/{}"
STEDSNAVN = "https://api.kartverket.no/stedsnavn/v1/navn?sok={}&knr={}&treffPerSide=25&utkoordsys=4258"
STEDTYPER = ["By", "Tettsted", "Bydel", "Tettsteddel", "Tettbebyggelse", "Bygdelag (bygd)", "Grend", "Bygd", "Navnegard",
             "Gard", "Område", "Dal", "Landskapsområde", "Halvøy", "Øy"]
ALLE_KOMMUNER = "https://api.kartverket.no/kommuneinfo/v1/kommuner"
# Svalbard er ikke en kommune i kommuneinfo: Longyearbyen brukes.
SVALBARD = {"kommunenummer": "2100", "kommunenavn": "Svalbard", "fylkesnavn": "Svalbard", "punkt": [78.2232, 15.6267]}


def _hent(url, accept="application/json"):
    for i in range(3):
        try:
            req = urllib.request.Request(url, headers={"Accept": accept, "User-Agent": "nmbu-sammenligning/1.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            time.sleep(2 * (i + 1))
        except Exception:  # noqa: BLE001
            time.sleep(2 * (i + 1))
    return None


def _cache(navn, url):
    sti = GEO / f"{navn}.json"
    if sti.exists():
        return json.loads(sti.read_text(encoding="utf-8"))
    d = _hent(url)
    GEO.mkdir(parents=True, exist_ok=True)
    sti.write_text(json.dumps({"url": url, "hentet": time.strftime("%Y-%m-%d"), "data": d}, ensure_ascii=False), encoding="utf-8")
    time.sleep(0.3)
    print(f"  [nett] {navn}", file=sys.stderr)
    return {"data": d}


def kommuneendringer():
    """{gammelt nr: nytt nr}, fulgt til dagens kommune."""
    d = _cache("ssb_klass131_endringer", SSB)["data"] or {}
    gjeldende = {k["kommunenummer"] for k in (_cache("kommuner_alle", ALLE_KOMMUNER)["data"] or [])}
    steg = {}
    for c in d.get("codeChanges", []):
        # Bare nummer som ikke er i bruk i dag følges videre (Klass har også delinger og tilbakeføringer).
        if c["oldCode"] != c["newCode"] and c["oldCode"] not in gjeldende:
            steg.setdefault(c["oldCode"], c["newCode"])
    return steg


def dagens(knr, steg):
    seen = set()
    while knr in steg and knr not in seen:
        seen.add(knr)
        knr = steg[knr]
    return knr


def _rens_kommunenavn(n):
    return re.split(r" - ", n or "")[0].strip()


def kommuner(nummer):
    """{nr: {kommunenavn, fylkesnavn, punkt: [lat, lon]}} for dagens kommunenummer."""
    ut = {}
    nummer = sorted({n for n in nummer if n and n not in ("9999", "9899")})
    with ThreadPoolExecutor(max_workers=2) as ex:
        svar = list(ex.map(lambda n: (n, _cache(f"kommune_{n}", KOMMUNE.format(n))["data"]), nummer))
    for n, d in svar:
        if n == "2100":
            ut[n] = SVALBARD
            continue
        if not d:
            continue
        p = (d.get("punktIOmrade") or {}).get("coordinates")
        ut[n] = {"kommunenummer": n, "kommunenavn": _rens_kommunenavn(d.get("kommunenavnNorsk") or d.get("kommunenavn")),
                 "fylkesnavn": d.get("fylkesnavn"), "punkt": [round(p[1], 4), round(p[0], 4)] if p else None}
    return ut


def stedspunkt(par):
    """par: liste av (stedsnavn, kommunenr). Returnerer {(navn, knr): ([lat, lon], type) | None}."""
    def en(p):
        navn, knr = p
        if knr in ("9999", "9899", "2100", None):
            return p, None
        nokkel = re.sub(r"[^\w]+", "_", f"sted_{knr}_{navn}").lower()
        d = _cache(nokkel, STEDSNAVN.format(urllib.parse.quote(navn), knr))["data"] or {}
        treff = [t for t in d.get("navn", []) if (t.get("skrivemåte") or "").lower() == navn.lower()]
        for typ in STEDTYPER:
            for t in treff:
                if t.get("navneobjekttype") == typ and t.get("representasjonspunkt"):
                    rp = t["representasjonspunkt"]
                    return p, ([round(rp["nord"], 4), round(rp["øst"], 4)], typ)
        return p, None
    with ThreadPoolExecutor(max_workers=2) as ex:
        return dict(ex.map(en, sorted(set(par), key=str)))
