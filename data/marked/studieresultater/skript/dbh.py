"""Felles hjelpere for B2 (studieresultater): DBH-API (POST) og bulk-CSV, med gzip-cache.

DBH-API: POST https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData (åpent, ingen nøkkel).
Bulk-CSV (bare tabeller merket «Bulk tabell» i katalogen): https://dbh.hkdir.no/api/Tabeller/bulk-csv?rptNr=<tabell>.
Cache: data/marked/studieresultater/kilder/ (rå svar, gzip). Kjør med --refresh i hovedskriptet for å hente på nytt.
Hold høyst 2–3 samtidige forespørsler mot DBH.
"""
import gzip
import json
import sys
import time
import urllib.request
from pathlib import Path

HER = Path(__file__).resolve().parent
KILDER = HER.parent / "kilder"
API = "https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData"
BULK = "https://dbh.hkdir.no/api/Tabeller/bulk-csv?rptNr={}"
TIMEOUT = 600


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def _les(path: Path):
    gz = path.with_suffix(path.suffix + ".gz")
    if gz.exists():
        with gzip.open(gz, "rt", encoding="utf-8") as f:
            return f.read()
    if path.exists():
        return path.read_text(encoding="utf-8")
    return None


def _skriv(path: Path, tekst: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    with gzip.open(path.with_suffix(path.suffix + ".gz"), "wt", encoding="utf-8", compresslevel=6) as f:
        f.write(tekst)


def body(tid, group_by, filters, kodetekst="N"):
    """filters: liste av (variabel, filtertype, verdier)."""
    return {"tabell_id": tid, "api_versjon": 1, "statuslinje": "J", "kodetekst": kodetekst, "desimal_separator": ".",
            "groupBy": group_by, "sortBy": [group_by[0]],
            "filter": [{"variabel": v, "selection": {"filter": k, "values": vals, "exclude": [""]}} for v, k, vals in filters]}


def hent(navn: str, q: dict, refresh=False, forsok=3):
    """Returnerer (rader, status). Cacher rått svar som kilder/<navn>.json.gz."""
    path = KILDER / f"{navn}.json"
    tekst = None if refresh else _les(path)
    if tekst is None:
        data = json.dumps(q, ensure_ascii=False).encode("utf-8")
        for i in range(forsok):
            try:
                t0 = time.time()
                req = urllib.request.Request(API, data=data, headers={"Content-Type": "application/json"}, method="POST")
                with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                    raw = r.read().decode("utf-8")
                log(f"  [nett] {navn}: {len(raw)/1e6:.1f} MB på {time.time()-t0:.0f} s")
                json.loads(raw)  # valider
                tekst = raw
                break
            except Exception as e:  # noqa: BLE001
                log(f"  [feil] {navn} forsøk {i+1}: {e}")
                time.sleep(5 * (i + 1))
        if tekst is None:
            return [], {"melding": "feilet"}
        _skriv(path, tekst)
    else:
        log(f"  [cache] {navn}")
    d = json.loads(tekst)
    if not isinstance(d, list) or not d:
        return [], {"melding": f"uventet svar: {str(d)[:200]}"}
    st = d[0].get("status", {})
    return d[1:], st


def bulk(tid: int, refresh=False) -> Path:
    """Laster ned bulk-CSV (gzip) og returnerer stien til .csv.gz."""
    path = KILDER / f"bulk_{tid}.csv.gz"
    if path.exists() and not refresh:
        return path
    t0 = time.time()
    with urllib.request.urlopen(BULK.format(tid), timeout=TIMEOUT) as r:
        raw = r.read()
    with gzip.open(path, "wb") as f:
        f.write(raw)
    log(f"  [bulk] {tid}: {len(raw)/1e6:.1f} MB på {time.time()-t0:.0f} s")
    return path


def tall(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0
