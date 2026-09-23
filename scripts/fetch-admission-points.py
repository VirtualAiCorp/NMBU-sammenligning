#!/usr/bin/env python3
"""Henter gjennomsnittlige opptakspoeng fra DBH/HKDIR tabell 571 for alle Samordna-program (opptakstype N)
i fakultetenes dbh-programkart, og skriver data/<fakultet>/kilder/dbh571_opptakspoeng.json.

Tabell 571 gir SUMMER av opptakspoeng og karakterpoeng og antall søkere per celle. Snitt = sum / antall.
DBH skjermer antall søkere i små celler (1–2 vises som 0), men ikke poengsummene. Celler med antall 0
tas derfor ikke med i hverken teller eller nevner. Grove grupperinger gir minst skjerming, så det hentes
to spørringer per institusjon:
  A  Årstall × Studieprogramkode × Møtt til studiestart   -> op_mott, kp_mott, n_mott, op_alle, n_alle
  B  Årstall × Studieprogramkode × Prioritet (= 1)        -> op_fv, n_fv
Alle semestre summeres. Lokale opptak (toårige mastere) har ikke poeng i 571 og hoppes over.

«Søkere» i 571 er søkerne som ligger i institusjonens FS-opptak, ikke alle som har programmet på listen
hos Samordna (B-ØA 2025: 398 i DBH mot 1 417 hos SO). Snittet for dem som møtte er derfor det sikreste tallet.

Rådata caches i data/nmbu/kilder/dbh571/<inst>.json (felles for alle fakulteter).

Bruk:
  python3 scripts/fetch-admission-points.py [fakultet ...] [--refresh]
  (uten fakultet: alle med dbh-programkart.json)
"""
import json
import os
import ssl
import sys
import urllib.request
from collections import defaultdict
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData"
YEARS = ["2021", "2022", "2023", "2024", "2025", "2026"]
CACHE = os.path.join(ROOT, "data", "nmbu", "kilder", "dbh571")
KILDE = ("DBH/HKDIR tabell 571 «Gjennomsnittlige opptakspoeng for søkere», opptakstype N (Samordna opptak), "
         "https://dbh.hkdir.no/api/Tabeller/hentJSONTabellData")
FAKULTETER = ["landsam", "realtek", "kbm", "mina", "biovit", "vet"]


def ctx():
    try:
        return ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    except Exception:
        return ssl.create_default_context()


def fetch(inst, group_by, extra_filter=None):
    body = {
        "tabell_id": 571, "api_versjon": 1, "statuslinje": "N", "kodetekst": "N", "desimal_separator": ".",
        "groupBy": ["Årstall", "Studieprogramkode"] + group_by, "sortBy": ["Årstall"],
        "filter": [
            {"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [inst]}},
            {"variabel": "Årstall", "selection": {"filter": "item", "values": YEARS}},
            {"variabel": "Opptakstype", "selection": {"filter": "item", "values": ["N"]}},
        ] + (extra_filter or []),
    }
    req = urllib.request.Request(API, data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=180, context=ctx()) as r:
        raw = r.read().decode("utf-8").strip()
    return json.loads(raw) if raw else []


def load_inst(inst, refresh):
    path = os.path.join(CACHE, f"{inst}.json")
    if os.path.exists(path) and not refresh:
        return json.load(open(path, encoding="utf-8"))
    a = fetch(inst, ["Møtt til studiestart"])
    b = fetch(inst, ["Prioritet"], [{"variabel": "Prioritet", "selection": {"filter": "item", "values": ["1"]}}])
    data = {"hentet": date.today().isoformat(), "institusjonskode": inst, "kilde": KILDE, "motte": a, "forstevalg": b}
    os.makedirs(CACHE, exist_ok=True)
    json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"  hentet {inst}: {len(a)} + {len(b)} rader")
    return data


def f(r, k):
    try:
        return float(r.get(k) or 0)
    except ValueError:
        return 0.0


def avg(s, n):
    return round(s / n, 1) if n else None


def compute(rows_a, rows_b):
    """rows_* er allerede filtrert til programmets koder. Returnerer {år: {...}}."""
    acc = defaultdict(lambda: defaultdict(float))
    for r in rows_a:
        n = f(r, "Søkere totalt")
        if n <= 0:  # skjermet celle: poengsummen uten antall kan ikke brukes
            continue
        a = acc[r["Årstall"]]
        a["op_alle"] += f(r, "Opptakspoeng totalt"); a["n_alle"] += n
        if r.get("Møtt til studiestart") == "1":
            a["op_mott"] += f(r, "Opptakspoeng totalt"); a["kp_mott"] += f(r, "Karakterpoeng"); a["n_mott"] += n
    for r in rows_b:
        n = f(r, "Søkere totalt")
        if n <= 0 or r.get("Prioritet") != "1":
            continue
        a = acc[r["Årstall"]]
        a["op_fv"] += f(r, "Opptakspoeng totalt"); a["n_fv"] += n
    out = {}
    for y, a in sorted(acc.items()):
        row = {
            "op_mott": avg(a["op_mott"], a["n_mott"]), "kp_mott": avg(a["kp_mott"], a["n_mott"]),
            "n_mott": int(a["n_mott"]) or None,
            "op_fv": avg(a["op_fv"], a["n_fv"]), "n_fv": int(a["n_fv"]) or None,
            "op_alle": avg(a["op_alle"], a["n_alle"]), "n_alle": int(a["n_alle"]) or None,
        }
        if any(v is not None for v in row.values()):
            out[y] = row
    return out


def main():
    refresh = "--refresh" in sys.argv
    fak_args = [a for a in sys.argv[1:] if not a.startswith("--")]
    faks = fak_args or [x for x in FAKULTETER if os.path.exists(os.path.join(ROOT, "data", x, "dbh-programkart.json"))]

    plan = {}
    for fak in faks:
        pk = json.load(open(os.path.join(ROOT, "data", fak, "programkart.json"), encoding="utf-8"))
        src = {p["id"]: p.get("source", "SO") for g in pk["groups"] for p in g["programs"]}
        dk = json.load(open(os.path.join(ROOT, "data", fak, "dbh-programkart.json"), encoding="utf-8"))
        progs = [p for p in dk["programs"] if src.get(p["entryId"]) == "SO" and p.get("studieprogramkoder")]
        plan[fak] = progs

    insts = sorted({c for progs in plan.values() for p in progs
                    for c in (p.get("institusjonskoder") or [p["institusjonskode"]])})
    raw = {i: load_inst(i, refresh) for i in insts}

    for fak, progs in plan.items():
        shared = defaultdict(list)
        for p in progs:
            key = (tuple(sorted(p.get("institusjonskoder") or [p["institusjonskode"]])), tuple(sorted(p["studieprogramkoder"])))
            shared[key].append(p["entryId"])
        out = {}
        tom = []
        for p in progs:
            codes = set(p["studieprogramkoder"])
            icodes = p.get("institusjonskoder") or [p["institusjonskode"]]
            ra = [r for i in icodes for r in raw[i]["motte"] if r["Studieprogramkode"] in codes]
            rb = [r for i in icodes for r in raw[i]["forstevalg"] if r["Studieprogramkode"] in codes]
            years = compute(ra, rb)
            if not years:
                tom.append(p["entryId"])
                continue
            key = (tuple(sorted(icodes)), tuple(sorted(codes)))
            entry = {"studieprogramkoder": sorted(codes), "years": years}
            others = [e for e in shared[key] if e != p["entryId"]]
            if others:
                entry["delerDbhProgramMed"] = others
            out[p["entryId"]] = entry
        dest = os.path.join(ROOT, "data", fak, "kilder", "dbh571_opptakspoeng.json")
        json.dump({"hentet": min(raw[i]["hentet"] for i in insts), "kilde": KILDE,
                   "forklaring": "op_mott/kp_mott = snitt opptakspoeng/karakterpoeng for dem som møtte til studiestart; "
                                 "op_fv = snitt opptakspoeng for førstevalgssøkere; op_alle = snitt for alle søkere i DBH-utvalget; "
                                 "n_* = antall personer bak snittet (skjermede celler er utelatt).",
                   "programs": out}, open(dest, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        s25 = sum(1 for e in out.values() if (e["years"].get("2025") or {}).get("op_mott") is not None)
        print(f"{fak}: {len(out)} av {len(progs)} SO-program med poeng ({s25} med snitt for møtte 2025)"
              + (f"; uten rader: {', '.join(tom)}" if tom else ""))


if __name__ == "__main__":
    main()
