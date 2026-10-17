"""Felles hjelpefunksjoner for den nasjonale programkatalogen (B1).

Brukes av hent-*.py og bygg-*.py i samme mappe. Bare standardbiblioteket.
"""
from __future__ import annotations

import gzip
import json
import re
import ssl
import time
import unicodedata
import urllib.error
import urllib.request
from pathlib import Path

SKRIPT = Path(__file__).resolve().parent
KATALOG = SKRIPT.parent                      # data/marked/nasjonal-katalog
KILDER = KATALOG / "kilder"                  # rådata-cache
REPO = KATALOG.parent.parent.parent          # ~/Desktop/BOA-sammenligning

DBH_URL = "https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData"
UA = ("NMBU-sammenligning-datainnsamling/1.0 (ikke-kommersiell studieanalyse; "
      "kontakt: mathias.sydtangen.smogeli@nmbu.no)")
AAR = [2021, 2022, 2023, 2024, 2025, 2026]


def ssl_ctx():
    try:
        return ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    except Exception:  # pragma: no cover
        return ssl.create_default_context()


def http(url: str, data: bytes | None = None, headers: dict | None = None, timeout: int = 180,
         forsok: int = 4) -> bytes:
    h = {"User-Agent": UA}
    h.update(headers or {})
    siste = None
    for i in range(forsok):
        try:
            req = urllib.request.Request(url, data=data, headers=h, method="POST" if data else "GET")
            with urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx()) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if 400 <= e.code < 500:
                raise RuntimeError(f"HTTP {e.code} fra {url}: {e.read()[:600]!r}") from e
            siste = e
            time.sleep(3 * (i + 1))
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:  # noqa: PERF203
            siste = e
            time.sleep(3 * (i + 1))
    raise RuntimeError(f"Klarte ikke hente {url}: {siste}")


def dbh(sporring: dict, cache: Path, refresh: bool = False) -> list[dict]:
    """POST mot DBH-API-et. Svaret caches gzip-komprimert. Returnerer radene (uten statuslinja)."""
    if cache.exists() and not refresh:
        rader = json.load(gzip.open(cache, "rt", encoding="utf-8"))
        return [r for r in rader if "status" not in r]
    body = json.dumps(sporring, ensure_ascii=False).encode("utf-8")  # æøå må sendes som UTF-8, ikke \u-escapes
    raw = http(DBH_URL, body, {"Content-Type": "application/json"}, timeout=600)
    txt = raw.decode("utf-8").strip()
    if not txt:  # DBH svarer med tom kropp når utvalget ikke har data (f.eks. et år som ikke er rapportert)
        time.sleep(1.0)
        return []
    d = json.loads(txt)
    status = None
    if d and isinstance(d[0], dict) and ("status" in d[0] or "melding" in d[0]):
        status = d[0].get("status", d[0])
    rader = d[1:] if status is not None else d
    if status and int(status.get("returkode", 0) or 0) != 0:
        raise RuntimeError(f"DBH-feil: {status}")
    cache.parent.mkdir(parents=True, exist_ok=True)
    with gzip.open(cache, "wt", encoding="utf-8") as f:
        json.dump(rader, f, ensure_ascii=False)
    time.sleep(1.0)
    return rader


def flt(variabel: str, verdier: list[str], typ: str = "item") -> dict:
    return {"variabel": variabel, "selection": {"filter": typ, "values": verdier, "exclude": [""]}}


def tall(x) -> float | None:
    """Tolker tall fra Samordna/DBH: «2 674», «1,435» (tusenskille), «28,6 %», «45.7», None/«-»."""
    if x is None:
        return None
    s = str(x).replace(" ", " ").strip()
    if s in ("", "-", "–", "..", "."):
        return None
    pros = s.endswith("%")
    s = s.replace("%", "").replace(" ", "")
    if pros:
        s = s.replace(",", ".")
    elif re.fullmatch(r"\d{1,3}(,\d{3})+", s):
        s = s.replace(",", "")
    else:
        s = s.replace(",", ".")
    try:
        v = float(s)
    except ValueError:
        return None
    return v


def heltall(x):
    v = tall(x)
    return None if v is None else (int(v) if float(v).is_integer() else v)


STOPP = {"bachelor", "bachelorprogram", "bachelorgrad", "master", "masterprogram", "masterstudium", "i", "og", "pa", "på",
         "for", "med", "studiet", "studium", "program", "programmet", "arsstudium", "årsstudium", "ettarig", "deltid",
         "heltid", "nettbasert", "samlingsbasert", "the", "of", "in", "and", "a", "aarig", "arig", "femarig",
         "femårig", "integrert", "grunnstudium", "profesjonsstudium", "studieprogram", "bachelorstudium", "-", "ba",
         "ma", "msc", "bsc", "grad", "utdanning", "fag", "studie", "fem", "tre", "to", "år", "ar", "kandidat",
         "cand", "sivilingeniør", "sivilingenior", "siv", "ing", "ingeniør", "ingenior"}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", (s or "").lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("ø", "o").replace("æ", "ae").replace("å", "a")
    return re.sub(r"[^a-z0-9 ]+", " ", s)


def ord_sett(s: str, behold_niva: bool = False) -> set[str]:
    o = [w for w in norm(s).split() if w]
    if behold_niva:
        return set(o)
    return {w for w in o if w not in STOPP and len(w) > 1}


def skriv_json(sti: Path, obj, kompakt: bool = True) -> None:
    sti.parent.mkdir(parents=True, exist_ok=True)
    with open(sti, "w", encoding="utf-8") as f:
        if kompakt:
            json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
        else:
            json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")


def les_cache(cache: Path) -> list[dict]:
    """Leser en DBH-cachefil (uten statuslinja). Tom liste hvis fila mangler."""
    if not cache.exists():
        return []
    rader = json.load(gzip.open(cache, "rt", encoding="utf-8"))
    return [r for r in rader if "status" not in r]
