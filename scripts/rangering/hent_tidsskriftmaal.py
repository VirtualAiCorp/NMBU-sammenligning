#!/usr/bin/env python3
"""Henter åpne mål per tidsskrift som grunnlag for et kalibrert AJG-anslag (scripts/rangering/ajg_anslag.py).

Tidsskriftene er alle med ISSN i NVA-cachen (data/rangering/nva/). Kilder (åpne lisenser):
  JUFO (Julkaisufoorumi, Finland, CC BY 4.0): https://jufo-rest.csc.fi/v1.1/etsi.php?issn=… og /kanava/<id>
      → Level (0–3) og Denmark_Level.
  OpenAlex (CC0): https://api.openalex.org/sources?filter=issn:a|b|… → 2-års gjennomsnittlig sitering, h-indeks, i10.
Cache: data/rangering/tidsskrift/anslag/maal.json (gitignored via data/rangering/nva-regel? nei: liten, åpne data).

Bruk:
  python3 scripts/rangering/hent_tidsskriftmaal.py
"""
import json, re, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
UT = ROOT / "data" / "rangering" / "tidsskrift" / "anslag" / "maal.json"
HODE = {"User-Agent": "NMBU-sammenligning (studierådgiverne HH; mailto:post@nmbu.no)", "Accept": "application/json"}


def hent(url, forsok=3):
    for i in range(forsok):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=HODE), timeout=40) as r:
                return json.load(r)
        except Exception:
            if i == forsok - 1:
                return None
            time.sleep(1.5 * (i + 1))


def issn(s):
    s = re.sub(r"[^0-9Xx]", "", str(s or "")).upper()
    return f"{s[:4]}-{s[4:]}" if len(s) == 8 else None


def main():
    tids = {}
    for f in (ROOT / "data" / "rangering" / "nva").glob("*/*.json"):
        for a in json.loads(f.read_text())["artikler"]:
            p, e = issn(a.get("issn")), issn(a.get("eissn"))
            if not (p or e):
                continue
            nok = p or e
            t = tids.setdefault(nok, {"tittel": a.get("tidsskrift"), "issn": p, "eissn": e})
            t["issn"] = t["issn"] or p; t["eissn"] = t["eissn"] or e
    gammel = json.loads(UT.read_text()) if UT.exists() else {}
    mangler = [k for k in tids if k not in gammel]
    print(f"{len(tids)} tidsskrift, {len(mangler)} nye")

    # OpenAlex i bolker på 40 ISSN
    oa = {}
    alle_issn = sorted({i for k in mangler for i in (tids[k]["issn"], tids[k]["eissn"]) if i})
    for i in range(0, len(alle_issn), 40):
        b = alle_issn[i:i + 40]
        d = hent("https://api.openalex.org/sources?per-page=200&filter=issn:" + "|".join(b))
        for s in (d or {}).get("results", []):
            st = s.get("summary_stats") or {}
            v = {"oa_id": s.get("id"), "oa_navn": s.get("display_name"), "sit2": st.get("2yr_mean_citedness"),
                 "h": st.get("h_index"), "i10": st.get("i10_index"), "verk": s.get("works_count")}
            for x in s.get("issn") or []:
                oa[x] = v
        time.sleep(0.2)

    def jufo(k):
        t = tids[k]
        for x in (t["issn"], t["eissn"]):
            if not x:
                continue
            d = hent("https://jufo-rest.csc.fi/v1.1/etsi.php?issn=" + x)
            if d:
                kid = d[0].get("Jufo_ID")
                kd = hent(f"https://jufo-rest.csc.fi/v1.1/kanava/{kid}")
                if kd:
                    r = kd[0]
                    return {"jufo": r.get("Level"), "dk": r.get("Denmark_Level"), "jufo_id": kid}
        return {}

    with ThreadPoolExecutor(6) as ex:
        jr = dict(zip(mangler, ex.map(jufo, mangler)))
    for k in mangler:
        t = tids[k]
        o = oa.get(t["issn"]) or oa.get(t["eissn"]) or {}
        gammel[k] = {**t, **o, **jr.get(k, {})}
    UT.parent.mkdir(parents=True, exist_ok=True)
    UT.write_text(json.dumps(gammel, ensure_ascii=False, indent=0))
    n_oa = sum(1 for v in gammel.values() if v.get("sit2") is not None)
    n_j = sum(1 for v in gammel.values() if v.get("jufo") not in (None, ""))
    print(f"Skrev {UT.relative_to(ROOT)}: {len(gammel)} tidsskrift, OpenAlex {n_oa}, JUFO {n_j}")


if __name__ == "__main__":
    main()
