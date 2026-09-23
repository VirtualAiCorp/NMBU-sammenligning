#!/usr/bin/env python3
"""Fyller localData for lokale opptak (toårige mastere m.m.) i data/<fakultet>/programkart.json
fra DBH/HKDIR tabell 379 (søkere og opptak, lokale opptak), for alle institusjoner.

DBH skjermer små celler (1–2) som 0, og jo finere grupperingen er, desto mer forsvinner.
Derfor tre spørringer med ulik grovhet, og hvert tall hentes fra den groveste som gir det:
  A  Årstall × Studieprogramkode × Kvalifisert          -> alleS, kvalifiserte, tilbud, akseptert, mott
  B  Årstall × Studieprogramkode × Prioritet            -> fvS (Prioritet = 1)
  C  Årstall × Studieprogramkode × Prioritet × Kjønn    -> kvinner = andel Kjønn=1 blant førstevalg (prosent)
Alle semestre summeres (årstotal). Studieplasser og poenggrenser finnes ikke i DBH for lokale
opptak og røres ikke. DBH-koden per program hentes fra data/<fakultet>/dbh-programkart.json.

Bruk:
  python3 scripts/fill-local-admissions.py <fakultet> [--dry-run]
"""
import json
import os
import ssl
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData"
YEARS = ["2021", "2022", "2023", "2024", "2025", "2026"]
# 2026 hoppes over til DBH har rapportert høstopptaket 2026 (bare våropptak ligger inne nå). Fjern da.
SKIP_YEARS = {"2026"}
EMPTY = {k: None for k in ["alleS", "fvS", "plasser", "kvinner", "kvalifiserte", "tilbud", "pg_fv", "pg_ord"]}
SRC = ("https://dbh.hkdir.no/api/Tabeller/hentJSONTabellData (tabell 379, lokalt opptak per studieprogram: "
       "søkere, kvalifiserte, tilbud; førstevalg = prioritet 1; kvinneandel blant førstevalgssøkere)")


def ctx():
    try:
        return ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    except Exception:
        return ssl.create_default_context()


def fetch(inst_codes, prog_codes, group_by):
    body = {
        "tabell_id": 379, "api_versjon": 1, "statuslinje": "N", "kodetekst": "J", "desimal_separator": ".",
        "groupBy": ["Årstall", "Studieprogramkode"] + group_by, "sortBy": ["Årstall"],
        "filter": [
            {"variabel": "Institusjonskode", "selection": {"filter": "item", "values": inst_codes}},
            {"variabel": "Årstall", "selection": {"filter": "item", "values": YEARS}},
            {"variabel": "Studieprogramkode", "selection": {"filter": "item", "values": prog_codes}},
        ],
    }
    req = urllib.request.Request(API, data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120, context=ctx()) as r:
        raw = r.read().decode("utf-8").strip()
    return json.loads(raw) if raw else []


def n(r, k):
    return int(r.get(k) or 0)


def aggregate(rows_a, rows_b, rows_c):
    out = {}
    for r in rows_a:
        a = out.setdefault(r["Årstall"], {"alleS": 0, "kvalifiserte": 0, "tilbud": 0, "akseptert": 0, "mott": 0,
                                          "fvS": 0, "_k": 0, "_m": 0})
        a["alleS"] += n(r, "Søknadsalternativer")
        if r.get("Kvalifisert") == "1":
            a["kvalifiserte"] += n(r, "Søknadsalternativer")
        a["tilbud"] += n(r, "Tilbud om opptak")
        a["akseptert"] += n(r, "Akseptert tilbud")
        a["mott"] += n(r, "Møtt til studiestart")
    for r in rows_b:
        if r.get("Prioritet") == "1" and r["Årstall"] in out:
            out[r["Årstall"]]["fvS"] += n(r, "Søknadsalternativer")
    for r in rows_c:
        if r.get("Prioritet") == "1" and r["Årstall"] in out:
            out[r["Årstall"]]["_k" if r.get("Kjønn") == "1" else "_m"] += n(r, "Søknadsalternativer")
    res = {}
    for y, a in out.items():
        if y in SKIP_YEARS or (a["alleS"] == 0 and a["tilbud"] == 0):
            continue
        tot = a["_k"] + a["_m"]
        # kvinneandel bare når kjønnsgrupperingen dekker det meste av førstevalgssøkerne (skjerming)
        kv = round(100 * a["_k"] / tot, 1) if tot and a["fvS"] and tot >= 0.8 * a["fvS"] else None
        res[y] = {"alleS": a["alleS"], "fvS": a["fvS"] or None, "kvinner": kv, "kvalifiserte": a["kvalifiserte"],
                  "tilbud": a["tilbud"], "akseptert": a["akseptert"], "mott": a["mott"]}
    return res


def main():
    fak = sys.argv[1]
    dry = "--dry-run" in sys.argv
    pk_path = os.path.join(ROOT, "data", fak, "programkart.json")
    pk = json.load(open(pk_path, encoding="utf-8"))
    dk = json.load(open(os.path.join(ROOT, "data", fak, "dbh-programkart.json"), encoding="utf-8"))
    dbh = {p["entryId"]: p for p in dk["programs"]}

    local = [(g, p) for g in pk["groups"] for p in g["programs"] if p.get("source") == "local"]
    by_inst = {}
    for g, p in local:
        m = dbh.get(p["id"])
        if not m or not m.get("studieprogramkoder"):
            print(f"  [advarsel] {p['id']}: ingen DBH-kobling/programkode", file=sys.stderr)
            continue
        codes = tuple(sorted(m.get("institusjonskoder") or [m["institusjonskode"]]))
        by_inst.setdefault(codes, set()).update(m["studieprogramkoder"])
    rows = {"a": {}, "b": {}, "c": {}}
    for codes, progs in by_inst.items():
        for key, gb in (("a", ["Kvalifisert"]), ("b", ["Prioritet"]), ("c", ["Prioritet", "Kjønn"])):
            for r in fetch(list(codes), sorted(progs), gb):
                rows[key].setdefault(r["Studieprogramkode"], []).append(r)
        print(f"  DBH {'/'.join(codes)}: {len(progs)} programkoder hentet")

    changed = filled = 0
    for g, p in local:
        m = dbh.get(p["id"])
        if not m or not m.get("studieprogramkoder"):
            continue
        pc = m["studieprogramkoder"]
        data = aggregate(*[[r for c in pc for r in rows[k].get(c, [])] for k in "abc"])
        if not data:
            print(f"  {g['id']}/{p['id']}: ingen rader i DBH 379")
            continue
        if not isinstance(p.get("localData"), dict):
            p["localData"] = {}
        ld = p["localData"]
        diffs = []
        for y, vals in data.items():
            row = ld.setdefault(y, dict(EMPTY))
            for k, v in vals.items():
                old = row.get(k)
                if old != v:
                    if old is not None and k in ("alleS", "kvalifiserte", "tilbud") and abs(old - (v or 0)) > 0.1 * max(old, 1):
                        diffs.append(f"{y} {k} {old}→{v}")
                    if old is None and v is not None:
                        filled += 1
                    row[k] = v
                    changed += 1
        srcs = ld.setdefault("localSource", [])
        if isinstance(srcs, list) and SRC not in srcs:
            srcs.insert(0, SRC)
        yrs = ", ".join(f"{y}: fvS={v['fvS']} kv={v['kvinner']}" for y, v in sorted(data.items()))
        print(f"  {g['id']}/{p['id']}: {yrs}" + (f"  [avvik >10 %: {'; '.join(diffs)}]" if diffs else ""))

    print(f"{fak}: {len(local)} lokale program, {changed} verdier oppdatert, {filled} tidligere tomme felt fylt")
    if not dry:
        json.dump(pk, open(pk_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        open(pk_path, "a").write("\n")


if __name__ == "__main__":
    main()
