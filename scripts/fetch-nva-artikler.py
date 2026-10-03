#!/usr/bin/env python3
"""Vitenskapelige artikler per handelshøyskole fra NVA (Nasjonalt vitenarkiv, Sikt; etterfølgeren til Cristin).

Kilde: det åpne søke-API-et https://api.nva.unit.no/search/resources
  unit=<enhets-URL>         artikler der minst én forfatter er tilknyttet enheten (eller underenheter)
  publicationYear=<år>      publiseringsår
  instanceType=AcademicArticle,AcademicLiteratureReview
Per artikkel lagres tidsskrift (navn, printIssn, onlineIssn), norsk nivå (scientificValue: LevelZero/One/Two,
Unassigned), om artikkelen er rapportert til NVI (scientificIndex.status = Reported), antall forfattere og antall
forfattere tilknyttet enheten (forfatterandel). Ingen personnavn lagres.

Enhetene leses fra data/rangering/skoler.json (felt `id` og `nva`: liste av enhets-id-er, f.eks. "192.11.0.0").
Cache: data/rangering/nva/<skole>/<år>.json (rå minimum per artikkel). Utdata brukes av scripts/build-rangering.py.

Bruk:
  python3 scripts/fetch-nva-artikler.py [--fra 2016] [--til 2025] [--skole hh] [--refresh]
"""
import argparse
import json
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RANG = ROOT / "data" / "rangering"
CACHE = RANG / "nva"
API = "https://api.nva.unit.no/search/resources"
ORG = "https://api.nva.unit.no/cristin/organization/"
TYPER = "AcademicArticle,AcademicLiteratureReview"
SIDE = 100


def hent(url, forsok=4):
    for i in range(forsok):
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "NMBU-sammenligning (studierådgiverne HH)"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except Exception as e:  # noqa: BLE001
            if i == forsok - 1:
                raise
            time.sleep(2 * (i + 1))


def tilhorer(aff_id, enheter):
    """Enhets-id-er er hierarkiske (192.11.0.0 → 192.11.3.0). Sjekk om tilknytningen ligger under en av enhetene."""
    a = aff_id.rsplit("/", 1)[-1].split(".")
    for e in enheter:
        p = e.split(".")
        if a[0] != p[0]:
            continue
        if all(pp == "0" or (i < len(a) and a[i] == pp) for i, pp in enumerate(p)):
            return True
    return False


def forenkle(h, enheter):
    ed = h.get("entityDescription", {})
    ref = ed.get("reference", {})
    ctx = ref.get("publicationContext", {}) or {}
    bidrag = [c for c in ed.get("contributors", []) if (c.get("role") or {}).get("type") in ("Creator", None)]
    egne = sum(1 for c in bidrag if any(tilhorer(a.get("id", ""), enheter) for a in c.get("affiliations", []) if a.get("id")))
    return {
        "id": h.get("identifier"),
        "tittel": (ed.get("mainTitle") or "")[:300],
        "type": (ref.get("publicationInstance") or {}).get("type"),
        "tidsskrift": ctx.get("name"),
        "kanal": ctx.get("identifier"),
        "issn": ctx.get("printIssn"),
        "eissn": ctx.get("onlineIssn"),
        "niva": ctx.get("scientificValue"),
        "nvi": (h.get("scientificIndex") or {}).get("status") == "Reported",
        "forfattere": ed.get("contributorsCount") or len(bidrag),
        "egne": egne,
        # Utenlandske medforfattere: minst én tilknytning med landkode ulik NO.
        "intl": any(a.get("countryCode") not in (None, "NO") for c in bidrag for a in c.get("affiliations", [])),
    }


def hent_aar(skole, enheter, aar):
    ut, sett = [], set()
    for e in enheter:
        fra = 0
        while True:
            q = {"unit": ORG + e, "publicationYear": aar, "instanceType": TYPER, "results": SIDE, "from": fra,
                 "sort": "identifier", "aggregation": "none"}
            d = hent(API + "?" + urllib.parse.urlencode(q))
            for h in d.get("hits", []):
                if h.get("identifier") in sett:
                    continue
                sett.add(h.get("identifier"))
                ut.append(forenkle(h, enheter))
            fra += SIDE
            if fra >= d.get("totalHits", 0) or not d.get("hits"):
                if fra < d.get("totalHits", 0):
                    print(f"  ADVARSEL {skole} {aar} {e}: stoppet ved {fra} av {d.get('totalHits')} treff")
                break
    return ut


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fra", type=int, default=2016)
    ap.add_argument("--til", type=int, default=2025)
    ap.add_argument("--skole")
    ap.add_argument("--refresh", action="store_true")
    ap.add_argument("--skoler", default=str(RANG / "skoler.json"), help="annen skoleliste (test)")
    a = ap.parse_args()
    skoler = json.loads(Path(a.skoler).read_text(encoding="utf-8"))
    jobber = []
    for s in skoler:
        if a.skole and s["id"] != a.skole:
            continue
        nva = s.get("nva") or []
        if isinstance(nva, dict):  # skoler.json: {"enheter": [{"id": ...}], ...}
            nva = [e["id"] for e in nva.get("enheter", [])]
        enheter = [str(x).rsplit("/", 1)[-1] for x in nva]
        if not enheter:
            print(f"  {s['id']}: ingen NVA-enhet, hopper over")
            continue
        for aar in range(a.fra, a.til + 1):
            f = CACHE / s["id"] / f"{aar}.json"
            if f.exists() and not a.refresh:
                continue
            jobber.append((s["id"], enheter, aar, f))

    def kjor(j):
        sid, enheter, aar, f = j
        rader = hent_aar(sid, enheter, aar)
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(json.dumps({"skole": sid, "enheter": enheter, "aar": aar, "hentet": time.strftime("%Y-%m-%d"),
                                 "artikler": rader}, ensure_ascii=False))
        return sid, aar, len(rader)

    with ThreadPoolExecutor(4) as ex:
        for sid, aar, n in ex.map(kjor, jobber):
            print(f"  {sid} {aar}: {n} artikler")
    print(f"Ferdig: {len(jobber)} skole-år hentet.")


if __name__ == "__main__":
    main()
