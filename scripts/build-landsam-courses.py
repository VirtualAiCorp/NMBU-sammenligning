#!/usr/bin/env python3
"""
build-landsam-courses.py

Genererer TypeScript-modulen landsamCourseData.ts (+ en JSON-tvilling) med
karakterstatistikk per emne, per studieprogram, hentet fra DBH/HKDIR sitt
åpne API (tabell 308 «Karakterer (aggregert)» og tabell 208 «Emner»).

Se docs/oppskrift-dbh-karakterer.md for spørringsformat, feltnavn og kjente
fallgruver – denne skriptet følger den oppskriften.

Kilder (lest fra disk / hentet over nett):
  1. programkart.json        – hvilke programmer som skal vises, gruppert.
  2. dbh-programkart.json    – kobling entryId -> DBH institusjonskode +
                                studieprogramkoder (skrevet av en annen prosess).

Nettverk: ETT POST-kall mot 308 og ETT mot 208 PER institusjonskode i
dbh-programkart.json (ikke per program). Svarene mellomlagres i --cache slik
at gjentatte kjøringer er offline med mindre --refresh er satt.

Bruk:
    python3 scripts/build-landsam-courses.py
    python3 scripts/build-landsam-courses.py --programkart PATH --dbh-programkart PATH --out PATH --years 5

Kun standardbibliotek (json, urllib, argparse).
"""
from __future__ import annotations

import argparse
import json
import os
import ssl
import sys
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import date
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent

DEFAULT_PROGRAMKART = REPO_ROOT / "data/landsam/programkart.json"
DEFAULT_DBH_PROGRAMKART = REPO_ROOT / "data/landsam/dbh-programkart.json"
DEFAULT_OUT = REPO_ROOT / "kilde/src/app/data/landsamCourseData.ts"
DEFAULT_CACHE_DIR = REPO_ROOT / "data/landsam/kilder/dbh-cache"

DBH_URL = "https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData"
HTTP_TIMEOUT = 300  # sekunder – 308-svar kan bli titalls MB

# Enkelte python.org-installasjoner på macOS mangler et fylt CA-sertifikatlager
# (ssl.create_default_context() finner ingen "local issuer"). Faller da tilbake
# på systemets eget sertifikatlager i stedet for å slå av verifisering.
_FALLBACK_CA_BUNDLES = ["/etc/ssl/cert.pem", "/etc/ssl/certs/ca-certificates.crt"]


def _open_url(req: urllib.request.Request, timeout: int):
    try:
        return urllib.request.urlopen(req, timeout=timeout)
    except urllib.error.URLError as e:
        if isinstance(e.reason, ssl.SSLCertVerificationError) or "CERTIFICATE_VERIFY_FAILED" in str(e):
            for bundle in _FALLBACK_CA_BUNDLES:
                if os.path.exists(bundle):
                    ctx = ssl.create_default_context(cafile=bundle)
                    return urllib.request.urlopen(req, timeout=timeout, context=ctx)
        raise

LETTER_GRADES = ["A", "B", "C", "D", "E", "F"]
PASS_FAIL_GRADES = ["G", "H"]
KNOWN_GRADES = set(LETTER_GRADES) | set(PASS_FAIL_GRADES)
GRADE_POINTS = {"A": 5, "B": 4, "C": 3, "D": 2, "E": 1, "F": 0}


# ───────────────────────────── DBH-API ──────────────────────────────────────

def dbh_query_308(institusjonskode: str, years: int) -> dict:
    return {
        "tabell_id": 308,
        "api_versjon": 1,
        "statuslinje": "J",
        "kodetekst": "J",
        "desimal_separator": ".",
        "groupBy": [
            "Institusjonskode", "Avdelingskode", "Årstall", "Semester",
            "Studieprogramkode", "Emnekode", "Karakter",
        ],
        "sortBy": ["Institusjonskode"],
        "filter": [
            {"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [institusjonskode], "exclude": [""]}},
            {"variabel": "Årstall", "selection": {"filter": "top", "values": [str(years)], "exclude": [""]}},
        ],
    }


def dbh_query_308_emne(institusjonskode: str, years: int) -> dict:
    """Karakterfordeling per EMNE (uten Semester/Studieprogramkode i groupBy) –
    ALLE studenter ved institusjonen som tok emnet, uavhengig av program.
    Cellene er større enn på programnivå og dermed langt mindre skjermet."""
    return {
        "tabell_id": 308,
        "api_versjon": 1,
        "statuslinje": "J",
        "kodetekst": "J",
        "desimal_separator": ".",
        "groupBy": ["Institusjonskode", "Årstall", "Emnekode", "Karakter"],
        "sortBy": ["Institusjonskode"],
        "filter": [
            {"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [institusjonskode], "exclude": [""]}},
            {"variabel": "Årstall", "selection": {"filter": "top", "values": [str(years)], "exclude": [""]}},
        ],
    }


def dbh_query_308_program_totals(institusjonskode: str, years: int) -> dict:
    """Reelle totaler per program+emne+år, UTEN Karakter i groupBy. Cellene er
    større enn i dbh_query_308 (ikke splittet på karakter/semester), og dermed
    lite eller ikke skjermet – brukes til å avdekke hvor mange kandidater som
    er skjult i karakterfordelingen på programnivå."""
    return {
        "tabell_id": 308,
        "api_versjon": 1,
        "statuslinje": "J",
        "kodetekst": "J",
        "desimal_separator": ".",
        "groupBy": ["Institusjonskode", "Årstall", "Studieprogramkode", "Emnekode"],
        "sortBy": ["Institusjonskode"],
        "filter": [
            {"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [institusjonskode], "exclude": [""]}},
            {"variabel": "Årstall", "selection": {"filter": "top", "values": [str(years)], "exclude": [""]}},
        ],
    }


def dbh_query_308_emne_totals(institusjonskode: str, years: int) -> dict:
    """Reelle totaler per emne+år, uten Karakter OG uten Studieprogramkode i
    groupBy – tilsvarende for emnenivå-tallene som dbh_query_308_program_totals
    er for programnivå-tallene."""
    return {
        "tabell_id": 308,
        "api_versjon": 1,
        "statuslinje": "J",
        "kodetekst": "J",
        "desimal_separator": ".",
        "groupBy": ["Institusjonskode", "Årstall", "Emnekode"],
        "sortBy": ["Institusjonskode"],
        "filter": [
            {"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [institusjonskode], "exclude": [""]}},
            {"variabel": "Årstall", "selection": {"filter": "top", "values": [str(years)], "exclude": [""]}},
        ],
    }


def dbh_query_208(institusjonskode: str, years: int) -> dict:
    return {
        "tabell_id": 208,
        "api_versjon": 1,
        "statuslinje": "J",
        "kodetekst": "J",
        "desimal_separator": ".",
        "variabler": ["*"],
        "sortBy": ["Institusjonskode"],
        "filter": [
            {"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [institusjonskode], "exclude": [""]}},
            {"variabel": "Avdelingskode", "selection": {"filter": "all", "values": ["*"], "exclude": [""]}},
            {"variabel": "Årstall", "selection": {"filter": "top", "values": [str(years)], "exclude": [""]}},
        ],
    }


def fetch_dbh(query: dict, cache_path: Path, refresh: bool) -> list:
    """POSTer mot DBH-API-et, eller leser fra cache. Returnerer raden-listen
    (uten status-elementet). Cacher alltid det RÅ svaret (inkl. status)."""
    if cache_path.exists() and not refresh:
        raw_text = cache_path.read_text(encoding="utf-8")
        size = cache_path.stat().st_size
        print(f"  [cache] {cache_path.name} ({size / 1_000_000:.1f} MB)", file=sys.stderr)
        data = json.loads(raw_text)
    else:
        body = json.dumps(query, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            DBH_URL, data=body, headers={"Content-Type": "application/json"}, method="POST",
        )
        print(f"  [nett]  POST tabell {query['tabell_id']} inst={query['filter'][0]['selection']['values']} ...", file=sys.stderr)
        import time
        t0 = time.time()
        try:
            with _open_url(req, HTTP_TIMEOUT) as resp:
                raw = resp.read()
        except urllib.error.URLError as e:
            print(f"  [FEIL]  {cache_path.name}: {e}", file=sys.stderr)
            return []
        dt = time.time() - t0
        print(f"  [nett]  {len(raw) / 1_000_000:.1f} MB på {dt:.1f}s", file=sys.stderr)
        data = json.loads(raw.decode("utf-8"))
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        cache_path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")

    if isinstance(data, dict):
        print(f"  [FEIL]  uventet svar (dict, ikke liste) for {cache_path.name}: {data}", file=sys.stderr)
        return []
    if not data:
        print(f"  [FEIL]  tomt svar for {cache_path.name}", file=sys.stderr)
        return []

    status = data[0].get("status", {})
    antall = status.get("antall")
    melding = status.get("melding")
    print(f"  [status] {cache_path.name}: antall={antall} melding={melding!r}", file=sys.stderr)
    return data[1:]


# ───────────────────────────── innlesing ────────────────────────────────────

def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def num(raw):
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        return float(raw)
    raw = str(raw).strip()
    if raw == "":
        return None
    return float(raw)


# ───────────────────────────── aggregering ──────────────────────────────────

def effective_institution_codes(prog: dict) -> list:
    """Et program peker normalt på én institusjonskode ("institusjonskode").
    Enkelte programmer har i stedet (eller i tillegg) "institusjonskoder": [...]
    – en liste – fordi institusjonen har byttet DBH-institusjonskode
    (f.eks. INN 0264 -> 1177) eller fordi programmet reelt sett er registrert
    under flere institusjonskoder. Når lista finnes brukes DEN, og 308/208
    hentes og slås sammen for hver kode i lista under samme entryId."""
    insts = prog.get("institusjonskoder")
    if insts:
        return [str(i) for i in insts]
    return [str(prog["institusjonskode"])]


def build_program_index(dbh_programkart: dict):
    """Returnerer:
    - progcode_to_entry: (institusjonskode, studieprogramkode) -> entryId
    - inst_progcodes: institusjonskode -> set(studieprogramkode) (for filtrering av 308-rader)
    - entry_meta: entryId -> dbh-programkart-oppføringen
    - inst_entries: institusjonskode -> [entryId, ...]
    - entry_insts: entryId -> [institusjonskode, ...] (én, eller flere ved kodebytte/duplisering)
    """
    progcode_to_entry: dict[tuple[str, str], list[str]] = {}
    inst_progcodes: dict[str, set] = defaultdict(set)
    entry_meta: dict[str, dict] = {}
    inst_entries: dict[str, list] = defaultdict(list)
    entry_insts: dict[str, list] = {}

    for prog in dbh_programkart.get("programs", []):
        entry_id = prog["entryId"]
        insts = effective_institution_codes(prog)
        codes = prog.get("studieprogramkoder") or []
        entry_meta[entry_id] = prog
        entry_insts[entry_id] = insts
        for inst in insts:
            inst_entries[inst].append(entry_id)
            for code in codes:
                key = (inst, code)
                # Samme DBH-program kan inngå i flere grupper (f.eks. HVL LANA);
                # da får alle oppføringene de samme radene.
                entries_for_key = progcode_to_entry.setdefault(key, [])
                if entries_for_key and entry_id not in entries_for_key:
                    print(
                        f"  [info] studieprogramkode {code} @ {inst} deles av "
                        f"{', '.join(entries_for_key)} og {entry_id} – alle får samme tall.",
                        file=sys.stderr,
                    )
                if entry_id not in entries_for_key:
                    entries_for_key.append(entry_id)
                inst_progcodes[inst].add(code)

    return progcode_to_entry, inst_progcodes, entry_meta, inst_entries, entry_insts


def aggregate_institution_308(rows: list, inst: str, progcodes: set, progcode_to_entry: dict,
                               grade_counter: dict, unknown_grades: dict):
    """Fyller agg[entryId][emnekode][year] = {A:.. H:..} in-place.
    grade_counter/unknown_grades brukes kun til logging."""
    agg: dict = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(int))))
    kept = 0
    for row in rows:
        progkode = row.get("Studieprogramkode")
        if progkode not in progcodes:
            continue
        entry_ids = progcode_to_entry.get((inst, progkode)) or []
        if not entry_ids:
            continue
        karakter = row.get("Karakter")
        antall_raw = row.get("Antall kandidater totalt")
        antall = int(round(num(antall_raw) or 0))
        if antall == 0:
            continue
        if karakter not in KNOWN_GRADES:
            unknown_grades[karakter] = unknown_grades.get(karakter, 0) + antall
            continue
        year = int(row["Årstall"])
        emnekode = row["Emnekode"]
        for entry_id in entry_ids:
            agg[entry_id][emnekode][year][karakter] += antall
        grade_counter[karakter] = grade_counter.get(karakter, 0) + antall
        kept += 1
    return agg, kept


def aggregate_program_totals(rows: list, inst: str, progcodes: set, progcode_to_entry: dict) -> dict:
    """Reelle totaler (UTEN Karakter-splitt) per (entryId, Emnekode, Årstall),
    fra dbh_query_308_program_totals. Brukes som fasit for å avdekke skjulte
    kandidater i den karakter-splittede programnivå-tellingen."""
    agg: dict = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    for row in rows:
        progkode = row.get("Studieprogramkode")
        if progkode not in progcodes:
            continue
        entry_ids = progcode_to_entry.get((inst, progkode)) or []
        if not entry_ids:
            continue
        total = int(round(num(row.get("Antall kandidater totalt")) or 0))
        year = int(row["Årstall"])
        emnekode = row["Emnekode"]
        for entry_id in entry_ids:
            agg[entry_id][emnekode][year] += total
    return agg


def aggregate_course_grades(rows: list, relevant_emnekoder: set, grade_counter: dict, unknown_grades: dict) -> dict:
    """Karakterfordeling per (Emnekode, Årstall), uavhengig av program (emnenivå,
    fra dbh_query_308_emne). `relevant_emnekoder` er emnekodene som inngår i
    minst ett av programmene våre ved denne institusjonen."""
    agg: dict = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    for row in rows:
        emnekode = row.get("Emnekode")
        if emnekode not in relevant_emnekoder:
            continue
        karakter = row.get("Karakter")
        antall = int(round(num(row.get("Antall kandidater totalt")) or 0))
        if antall == 0:
            continue
        if karakter not in KNOWN_GRADES:
            unknown_grades[karakter] = unknown_grades.get(karakter, 0) + antall
            continue
        year = int(row["Årstall"])
        agg[emnekode][year][karakter] += antall
        grade_counter[karakter] = grade_counter.get(karakter, 0) + antall
    return agg


def aggregate_course_totals(rows: list, relevant_emnekoder: set) -> dict:
    """Reelle totaler (UTEN Karakter-splitt) per (Emnekode, Årstall), fra
    dbh_query_308_emne_totals – fasit for emnenivå-tallene."""
    agg: dict = defaultdict(lambda: defaultdict(int))
    for row in rows:
        emnekode = row.get("Emnekode")
        if emnekode not in relevant_emnekoder:
            continue
        total = int(round(num(row.get("Antall kandidater totalt")) or 0))
        year = int(row["Årstall"])
        agg[emnekode][year] += total
    return agg


def build_course_name_lookups(rows_208: list, inst: str):
    """specific[(inst, progkode, emnekode)] = (year, navn, studiepoeng)
       fallback[(inst, emnekode)]            = (year, navn, studiepoeng)
    Beholder alltid nyeste år."""
    specific: dict = {}
    fallback: dict = {}
    for row in rows_208:
        emnekode = row.get("Emnekode")
        if not emnekode:
            continue
        try:
            year = int(row["Årstall"])
        except (TypeError, ValueError, KeyError):
            continue
        navn = row.get("Emnenavn")
        sp = num(row.get("Studiepoeng"))
        progkode = row.get("Studieprogramkode")

        fkey = (inst, emnekode)
        if fkey not in fallback or year > fallback[fkey][0]:
            fallback[fkey] = (year, navn, sp)

        if progkode:
            skey = (inst, progkode, emnekode)
            if skey not in specific or year > specific[skey][0]:
                specific[skey] = (year, navn, sp)
    return specific, fallback


def lookup_course_name(insts: list, progkoder: list, emnekode: str, specific_by_inst: dict, fallback_by_inst: dict):
    """Slår opp emnenavn/studiepoeng på tvers av ALLE institusjonskoder programmet
    er registrert under (normalt bare én). Prøver (institusjon, studieprogramkode,
    emnekode) først, så (institusjonskode, emnekode); beholder nyeste år på tvers
    av institusjonskodene."""
    best = None  # (year, navn, sp)
    for inst in insts:
        specific = specific_by_inst.get(inst, {})
        for progkode in progkoder:
            cand = specific.get((inst, progkode, emnekode))
            if cand and (best is None or cand[0] > best[0]):
                best = cand
    if best is None:
        for inst in insts:
            fallback = fallback_by_inst.get(inst, {})
            cand = fallback.get((inst, emnekode))
            if cand and (best is None or cand[0] > best[0]):
                best = cand
    if best is None:
        return None, None
    return best[1], best[2]


# ───────────────────────────── utregning ────────────────────────────────────

def compute_grade_year(year: int, counts: dict, skjult: int = 0) -> dict:
    A, B, C, D, E, F = (counts.get(g, 0) for g in LETTER_GRADES)
    G, H = counts.get("G", 0), counts.get("H", 0)
    letter_total = A + B + C + D + E + F
    total = letter_total + G + H
    if letter_total > 0:
        points = A * 5 + B * 4 + C * 3 + D * 2 + E * 1
        snitt = round(points / letter_total, 2)
        strykprosent = round(F / letter_total * 100, 1)
    else:
        snitt = None
        strykprosent = None
    bestattprosent = round(G / (G + H) * 100, 1) if (G + H) > 0 else None
    return {
        "year": year, "A": A, "B": B, "C": C, "D": D, "E": E, "F": F, "G": G, "H": H,
        "total": total, "snitt": snitt, "strykprosent": strykprosent, "bestattprosent": bestattprosent,
        "skjult": skjult,
    }


def grade_year_with_skjult(year: int, counts: dict, true_total, label: str, log_ctx: str) -> dict:
    """Bygger en CourseGradeYear og fyller `skjult` = fasit-total (uten
    Karakter-splitt, fra en egen mindre-skjermet spørring) minus synlig total
    (summen av A..H fra karakter-splittet spørring). Klipper til 0 og logger
    hvis fasiten er lavere enn synlig total (kan skje pga. uavhengig avrunding/
    skjerming i de to spørringene)."""
    gy = compute_grade_year(year, counts)
    visible = gy["total"]
    if true_total is None:
        skjult = 0
    else:
        skjult = true_total - visible
        if skjult < 0:
            print(
                f"  [ADVARSEL] {label} {log_ctx} {year}: fasit-total ({true_total}) < synlig total "
                f"({visible}) – setter skjult=0.",
                file=sys.stderr,
            )
            skjult = 0
    gy["skjult"] = skjult
    return gy


# ───────────────────────────── TS-utskrift ──────────────────────────────────

def ts_string(value) -> str:
    if value is None:
        return "null"
    return json.dumps(value, ensure_ascii=False)


def ts_number(value) -> str:
    if value is None:
        return "null"
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    if isinstance(value, float):
        s = f"{value:.2f}".rstrip("0").rstrip(".")
        return s if s else "0"
    return str(value)


def render_grade_year(gy: dict) -> str:
    fields = ["year", "A", "B", "C", "D", "E", "F", "G", "H", "total"]
    parts = [f"{k}: {gy[k]}" for k in fields]
    parts.append(f"snitt: {ts_number(gy['snitt'])}")
    parts.append(f"strykprosent: {ts_number(gy['strykprosent'])}")
    parts.append(f"bestattprosent: {ts_number(gy['bestattprosent'])}")
    parts.append(f"skjult: {gy.get('skjult', 0)}")
    return "{ " + ", ".join(parts) + " }"


def render_course(course: dict, indent: str) -> str:
    lines = [f"{indent}{{"]
    lines.append(f"{indent}  emnekode: {ts_string(course['emnekode'])},")
    lines.append(f"{indent}  emnenavn: {ts_string(course['emnenavn'])},")
    lines.append(f"{indent}  studiepoeng: {ts_number(course['studiepoeng'])},")
    lines.append(f"{indent}  years: [")
    for gy in course["years"]:
        lines.append(f"{indent}    {render_grade_year(gy)},")
    lines.append(f"{indent}  ],")
    lines.append(f"{indent}  emnenivaa: [")
    for gy in course.get("emnenivaa", []):
        lines.append(f"{indent}    {render_grade_year(gy)},")
    lines.append(f"{indent}  ],")
    lines.append(f"{indent}}},")
    return "\n".join(lines)


def render_program(prog: dict, indent: str) -> str:
    lines = [f"{indent}{{"]
    lines.append(f"{indent}  entryId: {ts_string(prog['entryId'])},")
    lines.append(f"{indent}  shortName: {ts_string(prog['shortName'])},")
    lines.append(f"{indent}  institusjon: {ts_string(prog['institusjon'])},")
    lines.append(f"{indent}  isNmbu: {'true' if prog['isNmbu'] else 'false'},")
    lines.append(f"{indent}  dbhInstitusjonskode: {ts_string(prog['dbhInstitusjonskode'])},")
    lines.append(f"{indent}  dbhProgramkoder: [{', '.join(ts_string(c) for c in prog['dbhProgramkoder'])}],")
    lines.append(f"{indent}  dbhProgramnavn: {ts_string(prog['dbhProgramnavn'])},")
    if prog["courses"]:
        lines.append(f"{indent}  courses: [")
        for c in prog["courses"]:
            lines.append(render_course(c, indent + "    "))
        lines.append(f"{indent}  ],")
    else:
        lines.append(f"{indent}  courses: [],")
    lines.append(f"{indent}}},")
    return "\n".join(lines)


def render_group(group: dict, indent: str) -> str:
    lines = [f"{indent}{{"]
    lines.append(f"{indent}  id: {ts_string(group['id'])},")
    lines.append(f"{indent}  label: {ts_string(group['label'])},")
    lines.append(f"{indent}  level: {ts_string(group['level'])},")
    if group.get("note"):
        lines.append(f"{indent}  note: {ts_string(group['note'])},")
    lines.append(f"{indent}  programs: [")
    for p in group["programs"]:
        lines.append(render_program(p, indent + "    "))
    lines.append(f"{indent}  ],")
    lines.append(f"{indent}}},")
    return "\n".join(lines)


def render_ts(groups: list, years: list, out_path: Path) -> str:
    today = date.today().isoformat()
    parts = []
    parts.append(f"// GENERERT av scripts/build-landsam-courses.py {today} – ikke rediger for hånd.")
    parts.append("// Kilde: DBH/HKDIR tabell 308 (karakterer, aggregert) og 208 (emner). Snitt: A=5…F=0, kun bokstavkarakterer.")
    parts.append("// DBH skjuler (setter til 0) celler med 1-2 kandidater i karakterfordelingen; dette rammer særlig")
    parts.append("// programnivå (mindre celler) og kan gi kunstig lav strykprosent. «skjult» er antall kandidater DBH")
    parts.append("// har skjult i akkurat den fordelingen, funnet ved å sammenligne med en uavhengig, mindre skjermet")
    parts.append("// sum uten Karakter-oppdeling. «emnenivaa» viser fordelingen for ALLE studenter ved institusjonen som")
    parts.append("// tok emnet det året, uavhengig av program – større celler, nærmere de reelle tallene på karakterweb.no.")
    parts.append("import type { LandsamLevel } from './landsamAdmissionData';")
    parts.append("")
    parts.append("export interface CourseGradeYear {")
    parts.append("  year: number; A: number; B: number; C: number; D: number; E: number; F: number; G: number; H: number;")
    parts.append("  total: number; snitt: number | null; strykprosent: number | null; bestattprosent: number | null;")
    parts.append("  skjult: number;  // antall kandidater DBH har skjult (skjermet) i denne fordelingen")
    parts.append("}")
    parts.append("export interface CourseStats {")
    parts.append("  emnekode: string; emnenavn: string | null; studiepoeng: number | null;")
    parts.append("  years: CourseGradeYear[];              // per program (kan ha skjulte kandidater)")
    parts.append("  emnenivaa: CourseGradeYear[];           // ALLE studenter ved institusjonen, uavhengig av program")
    parts.append("}")
    parts.append("export interface ProgramCourses {")
    parts.append("  entryId: string; shortName: string; institusjon: string; isNmbu: boolean;")
    parts.append("  dbhInstitusjonskode: string; dbhProgramkoder: string[]; dbhProgramnavn: string;")
    parts.append("  courses: CourseStats[];               // sortert på emnekode")
    parts.append("}")
    parts.append("export interface LandsamCourseGroup { id: string; label: string; level: LandsamLevel; note?: string; programs: ProgramCourses[]; }")
    parts.append("")
    parts.append(f"export const LANDSAM_COURSE_YEARS: number[] = [{', '.join(str(y) for y in years)}];")
    parts.append("")
    parts.append("export const LANDSAM_COURSE_GROUPS: LandsamCourseGroup[] = [")
    for g in groups:
        parts.append(render_group(g, "  "))
    parts.append("];")
    parts.append("")
    return "\n".join(parts)


# ───────────────────────────── hovedprogram ──────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--programkart", type=Path, default=DEFAULT_PROGRAMKART)
    ap.add_argument("--dbh-programkart", type=Path, default=DEFAULT_DBH_PROGRAMKART)
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--years", type=int, default=5, help="Antall (nyeste) år å hente («top» N).")
    ap.add_argument("--cache", type=Path, default=DEFAULT_CACHE_DIR)
    ap.add_argument("--refresh", action="store_true", help="Ignorer cache, hent alt på nytt.")
    args = ap.parse_args()

    programkart = load_json(args.programkart)
    dbh_programkart = load_json(args.dbh_programkart)

    progcode_to_entry, inst_progcodes, entry_meta, inst_entries, entry_insts = build_program_index(dbh_programkart)

    institutions = sorted(inst_progcodes.keys())
    print(f"Institusjoner i dbh-programkart: {institutions}", file=sys.stderr)

    all_course_agg: dict = {}  # entryId -> emnekode -> year -> counts
    all_prog_totals: dict = {}  # entryId -> emnekode -> year -> total (fasit, uten Karakter-splitt)
    course_counts_by_inst: dict = {}  # inst -> emnekode -> year -> counts (emnenivå)
    course_totals_by_inst: dict = {}  # inst -> emnekode -> year -> total (emnenivå-fasit)
    specific_by_inst: dict = {}
    fallback_by_inst: dict = {}
    inst_years_seen: dict = {}
    grade_counter: dict = {}
    unknown_grades: dict = {}
    total_308_rows = 0
    total_208_rows = 0

    args.cache.mkdir(parents=True, exist_ok=True)

    for inst in institutions:
        print(f"\n=== institusjon {inst} ===", file=sys.stderr)
        q308 = dbh_query_308(inst, args.years)
        cache_308 = args.cache / f"308_{inst}_{args.years}y.json"
        rows_308 = fetch_dbh(q308, cache_308, args.refresh)
        total_308_rows += len(rows_308)

        q208 = dbh_query_208(inst, args.years)
        cache_208 = args.cache / f"208_{inst}_{args.years}y.json"
        rows_208 = fetch_dbh(q208, cache_208, args.refresh)
        total_208_rows += len(rows_208)

        q308_emne = dbh_query_308_emne(inst, args.years)
        cache_308e = args.cache / f"308e_{inst}_{args.years}y.json"
        rows_308_emne = fetch_dbh(q308_emne, cache_308e, args.refresh)
        total_308_rows += len(rows_308_emne)

        q308_pt = dbh_query_308_program_totals(inst, args.years)
        cache_308pt = args.cache / f"308pt_{inst}_{args.years}y.json"
        rows_308_pt = fetch_dbh(q308_pt, cache_308pt, args.refresh)
        total_308_rows += len(rows_308_pt)

        q308_et = dbh_query_308_emne_totals(inst, args.years)
        cache_308et = args.cache / f"308et_{inst}_{args.years}y.json"
        rows_308_et = fetch_dbh(q308_et, cache_308et, args.refresh)
        total_308_rows += len(rows_308_et)

        agg, kept = aggregate_institution_308(
            rows_308, inst, inst_progcodes[inst], progcode_to_entry, grade_counter, unknown_grades,
        )
        print(f"  {len(rows_308)} 308-rader -> {kept} rader beholdt (mappede studieprogramkoder, kjente karakterer)", file=sys.stderr)
        for entry_id, courses in agg.items():
            all_course_agg.setdefault(entry_id, {})
            for emnekode, by_year in courses.items():
                all_course_agg[entry_id].setdefault(emnekode, {})
                for year, counts in by_year.items():
                    all_course_agg[entry_id][emnekode].setdefault(year, {})
                    for k, v in counts.items():
                        all_course_agg[entry_id][emnekode][year][k] = all_course_agg[entry_id][emnekode][year].get(k, 0) + v
                    inst_years_seen.setdefault(inst, set()).add(year)

        # Emnekodene som faktisk inngår i minst ett av programmene våre ved DENNE
        # institusjonen – brukes til å filtrere emnenivå-spørringene (b/d).
        relevant_emnekoder_inst = {emnekode for courses in agg.values() for emnekode in courses.keys()}

        prog_totals = aggregate_program_totals(rows_308_pt, inst, inst_progcodes[inst], progcode_to_entry)
        print(f"  {len(rows_308_pt)} 308pt-rader (programtotaler)", file=sys.stderr)
        for entry_id, courses in prog_totals.items():
            all_prog_totals.setdefault(entry_id, {})
            for emnekode, by_year in courses.items():
                all_prog_totals[entry_id].setdefault(emnekode, {})
                for year, total in by_year.items():
                    all_prog_totals[entry_id][emnekode][year] = all_prog_totals[entry_id][emnekode].get(year, 0) + total

        course_counts = aggregate_course_grades(rows_308_emne, relevant_emnekoder_inst, grade_counter, unknown_grades)
        course_counts_by_inst[inst] = course_counts
        print(
            f"  {len(rows_308_emne)} 308e-rader -> {sum(len(y) for y in course_counts.values())} emne-årganger "
            f"({len(relevant_emnekoder_inst)} relevante emnekoder)",
            file=sys.stderr,
        )

        course_totals = aggregate_course_totals(rows_308_et, relevant_emnekoder_inst)
        course_totals_by_inst[inst] = course_totals
        print(f"  {len(rows_308_et)} 308et-rader (emnetotaler)", file=sys.stderr)

        specific, fallback = build_course_name_lookups(rows_208, inst)
        specific_by_inst[inst] = specific
        fallback_by_inst[inst] = fallback

    if unknown_grades:
        print(f"\n[info] Ukjente/ignorerte Karakter-verdier (sum antall): {unknown_grades}", file=sys.stderr)
    print(f"[info] Kjente karakterer totalt: {grade_counter}", file=sys.stderr)
    print(f"[info] Totalt 308-rader hentet: {total_308_rows}, 208-rader hentet: {total_208_rows}", file=sys.stderr)

    for inst, yrs in sorted(inst_years_seen.items()):
        print(f"[info] institusjon {inst}: år funnet i data = {sorted(yrs)}", file=sys.stderr)
    all_years_union = sorted({y for yrs in inst_years_seen.values() for y in yrs})
    if len({tuple(sorted(y)) for y in inst_years_seen.values()}) > 1:
        print(
            "[ADVARSEL] Institusjonene har ulike årssett (etterslep i DBH) – se linjene over. "
            "LANDSAM_COURSE_YEARS blir unionen.",
            file=sys.stderr,
        )

    # ── bygg output-strukturen, i programkart.json sin rekkefølge ──
    out_groups = []
    total_courses = 0
    courses_without_name = 0
    summary_lines = []

    for group in programkart.get("groups", []):
        out_programs = []
        for prog in group.get("programs", []):
            entry_id = prog["id"]
            meta = entry_meta.get(entry_id)
            if meta is None:
                out_programs.append({
                    "entryId": entry_id, "shortName": prog["shortName"], "institusjon": prog["institusjon"],
                    "isNmbu": bool(prog.get("isNmbu")), "dbhInstitusjonskode": "", "dbhProgramkoder": [],
                    "dbhProgramnavn": "", "courses": [],
                })
                continue

            insts = entry_insts.get(entry_id) or [str(meta["institusjonskode"])]
            progkoder = meta.get("studieprogramkoder") or []
            course_agg = all_course_agg.get(entry_id, {})
            prog_totals_for_entry = all_prog_totals.get(entry_id, {})

            courses = []
            candidates_per_year: dict = defaultdict(int)
            prog_without_name = 0
            last_year_global = max(all_years_union) if all_years_union else None
            skjult_last_year_sum = 0
            courses_with_skjult_last_year = 0

            for emnekode in sorted(course_agg.keys()):
                by_year = course_agg[emnekode]
                prog_totals_by_year = prog_totals_for_entry.get(emnekode, {})
                all_years_this_course = sorted(set(by_year.keys()) | set(prog_totals_by_year.keys()))

                years_out = []
                for year in all_years_this_course:
                    counts = by_year.get(year, {})
                    true_total = prog_totals_by_year.get(year)
                    gy = grade_year_with_skjult(year, counts, true_total, "programnivå", f"{entry_id}/{emnekode}")
                    years_out.append(gy)
                    candidates_per_year[year] += gy["total"]
                    if year == last_year_global:
                        skjult_last_year_sum += gy["skjult"]
                        if gy["skjult"] > 0:
                            courses_with_skjult_last_year += 1

                # Emnenivå: slå sammen emnedata på tvers av ALLE institusjonskodene
                # programmet er registrert under (normalt bare én).
                merged_counts: dict = defaultdict(lambda: defaultdict(int))
                merged_totals: dict = defaultdict(int)
                for inst_code in insts:
                    for year, karakter_counts in course_counts_by_inst.get(inst_code, {}).get(emnekode, {}).items():
                        for k, v in karakter_counts.items():
                            merged_counts[year][k] += v
                    for year, total in course_totals_by_inst.get(inst_code, {}).get(emnekode, {}).items():
                        merged_totals[year] += total
                all_years_emnenivaa = sorted(set(merged_counts.keys()) | set(merged_totals.keys()))
                emnenivaa_out = []
                for year in all_years_emnenivaa:
                    counts = merged_counts.get(year, {})
                    true_total = merged_totals.get(year)
                    gy2 = grade_year_with_skjult(year, counts, true_total, "emnenivå", emnekode)
                    emnenivaa_out.append(gy2)

                navn, sp = lookup_course_name(insts, progkoder, emnekode, specific_by_inst, fallback_by_inst)
                if navn is None:
                    courses_without_name += 1
                    prog_without_name += 1
                total_courses += 1
                courses.append({
                    "emnekode": emnekode, "emnenavn": navn, "studiepoeng": sp,
                    "years": years_out, "emnenivaa": emnenivaa_out,
                })

            out_programs.append({
                "entryId": entry_id, "shortName": prog["shortName"], "institusjon": prog["institusjon"],
                "isNmbu": bool(prog.get("isNmbu")), "dbhInstitusjonskode": "+".join(insts),
                "dbhProgramkoder": progkoder, "dbhProgramnavn": meta.get("studieprogramnavn", ""),
                "courses": courses,
            })
            summary_lines.append(
                f"  {group['id']}/{entry_id}: {len(courses)} emner ({prog_without_name} uten navn), "
                f"kandidater per år = {dict(sorted(candidates_per_year.items()))}, "
                f"skjult (programnivå, {last_year_global}): sum={skjult_last_year_sum}, "
                f"emner med skjult>0: {courses_with_skjult_last_year}"
            )

        out_groups.append({
            "id": group["id"], "label": group["label"], "level": group["level"],
            "note": group.get("note"), "programs": out_programs,
        })

    years_out = all_years_union if all_years_union else list(range(date.today().year - args.years, date.today().year))

    ts_text = render_ts(out_groups, years_out, args.out)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(ts_text, encoding="utf-8")

    json_path = args.out.with_suffix(".json")
    json_path.write_text(
        json.dumps({"years": years_out, "groups": out_groups}, ensure_ascii=False, indent=1),
        encoding="utf-8",
    )

    print("\n=== OPPSUMMERING ===", file=sys.stderr)
    for line in summary_lines:
        print(line, file=sys.stderr)
    share = (courses_without_name / total_courses * 100) if total_courses else 0.0
    print(f"\nTotalt {total_courses} emner, {courses_without_name} uten navn ({share:.1f}%).", file=sys.stderr)
    print(f"Skrev {args.out}", file=sys.stderr)
    print(f"Skrev {json_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
