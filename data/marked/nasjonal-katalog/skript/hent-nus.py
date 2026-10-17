#!/usr/bin/env python3
"""Henter NUS2000 (SSB Klass, klassifikasjon 36) med navn på alle nivåer -> kilder/nus_klass36.json.

Kilde: https://data.ssb.no/api/klass/v1/classifications/36/codes?from=2026-01-01&language=nb (åpent, ingen nøkkel).
NUS-koden i DBH 347 er sekssifret: siffer 1 = nivå (6 = lavere grad, 7 = høyere grad), siffer 2 = fagfelt,
siffer 2–3 = faggruppe, siffer 2–4 = fagområde.

Bruk: python3 data/marked/nasjonal-katalog/skript/hent-nus.py [--refresh]
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from felles import KILDER, http  # noqa: E402

URL = "https://data.ssb.no/api/klass/v1/classifications/36/codes?from=2026-01-01&language=nb"


def main(refresh: bool) -> None:
    f = KILDER / "nus_klass36.json"
    if f.exists() and not refresh:
        print("finnes allerede", f)
        return
    raw = http(URL, headers={"Accept": "application/json"})
    d = json.loads(raw.decode("utf-8"))
    f.write_text(json.dumps(d, ensure_ascii=False), encoding="utf-8")
    print(f"hentet {len(d.get('codes', []))} NUS-koder")


if __name__ == "__main__":
    main("--refresh" in sys.argv)
