#!/usr/bin/env python3
"""
build-landsam-data.py

Genererer TypeScript-modulen landsamAdmissionData.ts (+ en JSON-tvilling for
validering) fra to Samordna opptak-kilder og et programkart:

  1. so_sokertall_programnivaa_2021-2026_hentet_2026-09-22.json
     – søkertall/kvinneandel/plasser/kvalifiserte/tilbud per programkode, 2021-2026.
  2. so_poenggrenser_2020-2026_hentet_2026-09-22.csv
     – poenggrenser (Tableau-eksport), 2020-2026, kun Hovedopptak.
  3. programkart.json
     – hvilke programmer som skal med, gruppert, med lokale data for
       programmer som ikke går via Samordna opptak.

Ingen nettverkstilgang – alt leses fra disk. Kun standardbibliotek.

Bruk:
    python3 scripts/build-landsam-data.py
    python3 scripts/build-landsam-data.py --programkart PATH --out PATH

Standardverdier for --programkart og --out peker på de virkelige kildene i
dette repoet (se DEFAULT_* under). Skriv til en annen --out for testkjøring.
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
from datetime import date
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent

DEFAULT_SOKERTALL = REPO_ROOT / "data/landsam/kilder/so_sokertall_programnivaa_2021-2026_hentet_2026-09-22.json"
DEFAULT_POENGGRENSER = REPO_ROOT / "data/landsam/kilder/so_poenggrenser_2020-2026_hentet_2026-09-22.csv"
DEFAULT_PROGRAMKART = REPO_ROOT / "data/landsam/programkart.json"
DEFAULT_OUT = REPO_ROOT / "kilde/src/app/data/landsamAdmissionData.ts"

YEARS = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"]
SOKERTALL_YEARS = ["2021", "2022", "2023", "2024", "2025", "2026"]

NK_ALLE = "Alle søkere"
NK_FVS = "Førstevalgssøkere"
NK_KVINNER = "Førstevalgssøkere (kvinner)"
NK_PLASSER = "Studieplasser"
NK_KVALIFISERTE = "Antall kvalifiserte"
NK_TILBUD = "Antall tilbud"

# Rekkefølgen feltene skal ha i Y(...)-kallene / FullYearData.
FIELD_ORDER = ["alleS", "fvS", "plasser", "kvinner", "kvalifiserte", "tilbud", "pg_fv", "pg_ord"]
# Bare for lokale opptak (DBH 379): ja-svar og møtt til studiestart. Skrives som valgfrie felt.
EXTRA_FIELDS = ["akseptert", "mott"]
# Opptakspoeng fra DBH 571 (Samordna-program): skrives som valgfrie felt ved siden av Y(...).
POINT_FIELDS = ["op_mott", "kp_mott", "op_fv", "op_alle", "n_mott"]

MISSING_TOKENS = {"", "-", "–", "NA"}


# ───────────────────────────── parsing helpers ──────────────────────────────

def normalise_code(code) -> str:
    """'192 230' / '192230' / None -> '192230' / ''."""
    if code is None:
        return ""
    return str(code).replace("\xa0", "").replace(" ", "").strip()


def clean_number(raw, is_percent: bool = False):
    """
    Parser en enkelt SO-søkertallcelle til float, eller None hvis ikke tilgjengelig.

    Kvirker observert i kilden:
      - tall kan ha mellomrom (\xa0, NBSP) som tusenskilletegn: '1\xa0132' -> 1132
      - manglende verdi kan være None, '', '-' eller 'NA'
      - 'Førstevalgssøkere (kvinner)' er ALLTID formatert som prosent med komma
        og NBSP før prosenttegnet, f.eks. '34,1\xa0%', eller 'NA\xa0%' når data
        mangler. Det er IKKE et antall (se avklaring i load_sokertall/dokstring
        i toppen av filen og oppsummeringen i README/rapport).
    """
    if raw is None:
        return None
    s = str(raw).strip()
    if is_percent:
        s = s.replace("%", "").strip()
    s = s.replace("\xa0", "").replace(" ", "")
    if s in MISSING_TOKENS:
        return None
    s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def parse_poenggrense(raw):
    """
    Parser en poenggrense-celle fra CSV-en til float, eller None.

    Kvirker:
      - desimaltegn kan være '.' eller ',' (kun '.' observert i denne kilden,
        men koden håndterer begge for robusthet)
      - tom streng -> None
      - '-1' er en sentinelverdi i SO/Tableau-eksporten (opptaksrunden fantes
        ikke / ble ikke avholdt for denne kvoten det året) -> tolkes som None,
        IKKE som et reelt poengtall
      - '0' beholdes som 0.0 – det betyr at alle kvalifiserte kom inn
    """
    if raw is None:
        return None
    s = str(raw).strip()
    if s in MISSING_TOKENS:
        return None
    s = s.replace(",", ".")
    try:
        v = float(s)
    except ValueError:
        return None
    if v == -1:
        return None
    return v


# ───────────────────────────── source loading ──────────────────────────────

def load_sokertall(path: Path):
    """
    Leser søkertall-JSON-en.

    Returnerer:
      index: dict[code] -> dict[nøkkeltall] -> dict[year] -> float|None
      names: dict[code] -> (institusjon, studienavn)  (til rapportering)
      conflicts: liste av (code, nøkkeltall, year, gammel_verdi, ny_verdi)

    Enkelte studiekoder har flere rader (programmet er omdøpt/omstrukturert
    midt i perioden, samme kode brukt både før og etter). Vi slår dem sammen
    ved å ta den første ikke-null-verdien per år; empirisk er det ALDRI to
    ulike ikke-null-verdier for samme (kode, nøkkeltall, år) i denne kilden,
    så sammenslåingen mister ikke informasjon – men vi logger det likevel
    hvis det skulle oppstå, i stedet for å anta.
    """
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    index: dict[str, dict[str, dict[str, float | None]]] = {}
    names: dict[str, tuple[str, str]] = {}
    conflicts = []

    for row in data:
        code = normalise_code(row.get("Studie- kode"))
        if not code:
            continue
        nk = row.get("Nøkkeltall")
        is_percent = nk == NK_KVINNER
        by_year = index.setdefault(code, {}).setdefault(nk, {})
        names.setdefault(code, (row.get("Institusjon", ""), row.get("Studienavn", "")))

        for y in SOKERTALL_YEARS:
            val = clean_number(row.get(y), is_percent=is_percent)
            if val is None:
                continue
            if y in by_year and by_year[y] is not None and by_year[y] != val:
                conflicts.append((code, nk, y, by_year[y], val))
                continue
            by_year[y] = val

    return index, names, conflicts


def load_poenggrenser(path: Path):
    """
    Leser poenggrense-CSV-en (semikolonseparert, UTF-8/BOM).

    Returnerer: dict[code] -> dict['pg_fv'|'pg_ord'] -> dict[year] -> float|None

    Kun Opptaksrunde == 'Hovedopptak' brukes (Suppleringsopptak ignoreres).
    Kvote 'Førstegangsvitnemålskvote' -> pg_fv, 'Ordinær kvote' -> pg_ord.
    Det finnes ingen duplikate (kode, kvote, år)-rader i kilden per i dag,
    men skulle det oppstå logges det som en konflikt i stedet for stille
    overskriving.
    """
    index: dict[str, dict[str, dict[str, float | None]]] = {}
    conflicts = []

    with open(path, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            if row.get("Opptaksrunde") != "Hovedopptak":
                continue
            kvote_raw = row.get("Kvote")
            if kvote_raw == "Førstegangsvitnemålskvote":
                kvote = "pg_fv"
            elif kvote_raw == "Ordinær kvote":
                kvote = "pg_ord"
            else:
                continue

            code = normalise_code(row.get("Studiekode"))
            if not code:
                continue
            year = (row.get("År") or "").strip()
            if year not in YEARS:
                continue

            val = parse_poenggrense(row.get("Poenggrense"))
            by_year = index.setdefault(code, {}).setdefault(kvote, {})
            if year in by_year and by_year[year] is not None and val is not None and by_year[year] != val:
                conflicts.append((code, kvote, year, by_year[year], val))
                continue
            by_year[year] = val

    return index, conflicts


# ───────────────────────────── data assembly ──────────────────────────────

def build_years_for_so_entry(code: str, sokertall_index, poenggrenser_index):
    """
    Bygger years-dict for et SO-program: {year: {field: value, ...}, ...}
    Et årstall tas kun med hvis minst ett felt er ikke-null det året.
    """
    sok = sokertall_index.get(code, {})
    pg = poenggrenser_index.get(code, {})

    field_sources = {
        "alleS": sok.get(NK_ALLE, {}),
        "fvS": sok.get(NK_FVS, {}),
        "plasser": sok.get(NK_PLASSER, {}),
        "kvinner": sok.get(NK_KVINNER, {}),
        "kvalifiserte": sok.get(NK_KVALIFISERTE, {}),
        "tilbud": sok.get(NK_TILBUD, {}),
        "pg_fv": pg.get("pg_fv", {}),
        "pg_ord": pg.get("pg_ord", {}),
    }

    years_out = {}
    for y in YEARS:
        values = {}
        for field in FIELD_ORDER:
            raw = field_sources[field].get(y)
            if raw is None:
                values[field] = None
                continue
            if field == "kvinner":
                values[field] = round(raw, 1)
            elif field in ("pg_fv", "pg_ord"):
                values[field] = round(raw, 1)
            else:
                values[field] = int(round(raw))
        if any(v is not None for v in values.values()):
            years_out[y] = values

    found_in_sokertall = code in sokertall_index
    found_in_poenggrenser = code in poenggrenser_index
    return years_out, found_in_sokertall, found_in_poenggrenser


def build_years_for_local_entry(local_data: dict):
    """
    Local-programmer har allerede ferdig utfylte år i programkartet.
    Vi normaliserer bare felt-rekkefølgen/typene og filtrerer bort år der
    absolutt alt er null.
    """
    years_out = {}
    for y in YEARS:
        row = local_data.get(y)
        if row is None:
            continue
        values = {}
        for field in FIELD_ORDER:
            raw = row.get(field)
            if raw is None:
                values[field] = None
            elif field == "kvinner" or field in ("pg_fv", "pg_ord"):
                values[field] = round(float(raw), 1)
            else:
                values[field] = int(round(float(raw)))
        for field in EXTRA_FIELDS:
            raw = row.get(field)
            values[field] = None if raw is None else int(round(float(raw)))
        if any(v is not None for v in values.values()):
            years_out[y] = values
    return years_out


def merge_points(years: dict, points: dict | None) -> None:
    """Legger DBH 571-snitt inn i årsradene (oppretter tomme rader der SO mangler året)."""
    if not points:
        return
    for y, row in (points.get("years") or {}).items():
        if y not in YEARS or not any(row.get(f) is not None for f in POINT_FIELDS):
            continue
        target = years.setdefault(y, {f: None for f in FIELD_ORDER})
        for f in POINT_FIELDS:
            target[f] = row.get(f)


def process_programkart(programkart, sokertall_index, poenggrenser_index, points_index=None):
    """
    Returnerer (groups_out, summary_lines, warnings) hvor groups_out er en
    liste av dicts klare til å skrives ut som TS/JSON.
    """
    groups_out = []
    summary_lines = []
    warnings = []

    for group in programkart.get("groups", []):
        group_id = group["id"]
        nmbu_ids = []
        default_ids = []
        entries_out = []

        summary_lines.append(f"\n=== Gruppe: {group_id} ({group.get('label', '')}) ===")

        for prog in group.get("programs", []):
            pid = prog["id"]
            source = prog.get("source", "SO")

            if prog.get("isNmbu"):
                nmbu_ids.append(pid)
            if prog.get("default"):
                default_ids.append(pid)

            if source == "local":
                local_data = prog.get("localData") or {}
                years = build_years_for_local_entry(local_data)
                studiekode = normalise_code(prog.get("studiekode")) or ""
                years_present = sorted(years.keys())
                summary_lines.append(
                    f"  - {pid} ({prog.get('shortName', '')}, lokal): år med data = {years_present or '(ingen)'}"
                )
            else:
                studiekode = normalise_code(prog.get("studiekode"))
                if not studiekode:
                    warnings.append(f"{pid}: SO-program uten studiekode i programkart.json")
                    years = {}
                    years_present = []
                else:
                    years, found_sok, found_pg = build_years_for_so_entry(
                        studiekode, sokertall_index, poenggrenser_index
                    )
                    if prog.get("poenggrenseSkala") == "opptaksprove":
                        # Opptaksprøve-poeng (f.eks. AHO) er på en annen skala og kan ikke sammenlignes.
                        for y in list(years.keys()):
                            years[y]["pg_fv"] = None
                            years[y]["pg_ord"] = None
                            if all(years[y][f] is None for f in FIELD_ORDER):
                                del years[y]
                    years_present = sorted(years.keys())
                    if not found_sok and not found_pg:
                        warnings.append(
                            f"{pid}: studiekode {studiekode} ble ikke funnet i søkertall- ELLER poenggrense-kilden"
                        )
                    elif not found_sok:
                        warnings.append(
                            f"{pid}: studiekode {studiekode} finnes i poenggrense-kilden men ikke i søkertall-kilden"
                        )
                    elif not found_pg:
                        warnings.append(
                            f"{pid}: studiekode {studiekode} finnes i søkertall-kilden men ikke i poenggrense-kilden (Hovedopptak)"
                        )
                merge_points(years, (points_index or {}).get(pid))
                summary_lines.append(
                    f"  - {pid} ({prog.get('shortName', '')}, SO {studiekode or '?'}): år med data = {years_present or '(ingen)'}"
                )

            entries_out.append(
                {
                    "id": pid,
                    "shortName": prog.get("shortName", ""),
                    "institusjon": prog.get("institusjon", ""),
                    "studiekode": studiekode,
                    "studiested": prog.get("studiested", ""),
                    "type": prog.get("type", "master"),
                    "url": prog.get("url") or None,
                    "years": years,
                    **({"poengFellesMed": (points_index or {})[pid]["delerDbhProgramMed"]}
                       if source != "local" and ((points_index or {}).get(pid) or {}).get("delerDbhProgramMed") else {}),
                }
            )

        groups_out.append(
            {
                "id": group_id,
                "label": group.get("label", ""),
                "level": group.get("level", "master5"),
                "desc": group.get("desc", ""),
                "note": group.get("note"),
                "nmbuIds": nmbu_ids,
                "defaultIds": default_ids,
                "entries": entries_out,
            }
        )

    return groups_out, summary_lines, warnings


# ───────────────────────────── TS rendering ──────────────────────────────

def ts_string(s: str) -> str:
    escaped = s.replace("\\", "\\\\").replace("'", "\\'")
    return f"'{escaped}'"


def fmt_int_or_null(v) -> str:
    return "null" if v is None else str(int(v))


def fmt_pg_or_null(v) -> str:
    """Poenggrense: én desimal, men 0 vises som bart '0' (alle kvalifiserte kom inn)."""
    if v is None:
        return "null"
    if v == 0:
        return "0"
    return f"{v:.1f}"


def fmt_kvinner_or_null(v) -> str:
    if v is None:
        return "null"
    return f"{v:.1f}"


def render_year_call(values: dict) -> str:
    parts = [
        fmt_int_or_null(values["alleS"]),
        fmt_int_or_null(values["fvS"]),
        fmt_int_or_null(values["plasser"]),
        fmt_kvinner_or_null(values["kvinner"]),
        fmt_int_or_null(values["kvalifiserte"]),
        fmt_int_or_null(values["tilbud"]),
        fmt_pg_or_null(values["pg_fv"]),
        fmt_pg_or_null(values["pg_ord"]),
    ]
    if any(values.get(f) is not None for f in EXTRA_FIELDS):
        parts += [fmt_int_or_null(values.get(f)) for f in EXTRA_FIELDS]
    call = "Y(" + ", ".join(parts) + ")"
    pts = [(f, values.get(f)) for f in POINT_FIELDS if values.get(f) is not None]
    if pts:
        call = "{ ..." + call + ", " + ", ".join(
            f"{f}: {int(v) if f.startswith('n_') else f'{v:.1f}'}" for f, v in pts) + " }"
    return call


def render_ts(groups_out, generated_date: str) -> str:
    lines = []
    lines.append(f"// GENERERT av scripts/build-landsam-data.py {generated_date} – ikke rediger for hånd.")
    lines.append(
        "// Kilder: Samordna opptak programtabell 2026 (søkertall 2021–2026) og SO poenggrenserapport (Tableau) 2020–2026, hovedopptak; opptakspoeng (op_*/kp_*) fra DBH tabell 571."
    )
    lines.append("// 0 i poenggrense = alle kvalifiserte kom inn · null = data ikke tilgjengelig")
    lines.append("import type { FullAdmissionEntry, FullYearData } from './fullAdmissionData';")
    lines.append("")
    lines.append("export type LandsamLevel = 'bachelor' | 'master5' | 'master2';")
    lines.append("")
    lines.append("export interface LandsamGroup {")
    lines.append("  id: string;")
    lines.append("  label: string;")
    lines.append("  level: LandsamLevel;")
    lines.append("  desc: string;")
    lines.append("  note?: string;")
    lines.append("  nmbuIds: string[];")
    lines.append("  defaultIds: string[];")
    lines.append("  entries: FullAdmissionEntry[];")
    lines.append("}")
    lines.append("")
    lines.append("const Y = (")
    lines.append("  alleS: number | null, fvS: number | null, plasser: number | null,")
    lines.append("  kvinner: number | null, kvalifiserte: number | null, tilbud: number | null,")
    lines.append("  pg_fv: number | null = null, pg_ord: number | null = null,")
    lines.append("  akseptert: number | null = null, mott: number | null = null")
    lines.append("): FullYearData => ({ alleS, fvS, plasser, kvinner, kvalifiserte, tilbud, pg_fv, pg_ord, akseptert, mott });")
    lines.append("")
    lines.append("export const LANDSAM_YEARS = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'] as const;")
    lines.append("")
    lines.append("export const LANDSAM_GROUPS: LandsamGroup[] = [")

    for group in groups_out:
        lines.append("  {")
        lines.append(f"    id: {ts_string(group['id'])}, label: {ts_string(group['label'])}, level: {ts_string(group['level'])},")
        lines.append(f"    desc: {ts_string(group['desc'])},")
        if group.get("note"):
            lines.append(f"    note: {ts_string(group['note'])},")
        nmbu_ids_str = ", ".join(ts_string(i) for i in group["nmbuIds"])
        default_ids_str = ", ".join(ts_string(i) for i in group["defaultIds"])
        lines.append(f"    nmbuIds: [{nmbu_ids_str}], defaultIds: [{default_ids_str}],")
        lines.append("    entries: [")
        for entry in group["entries"]:
            lines.append("      {")
            lines.append(
                f"        id: {ts_string(entry['id'])}, shortName: {ts_string(entry['shortName'])}, "
                f"institusjon: {ts_string(entry['institusjon'])},"
            )
            lines.append(
                f"        studiekode: {ts_string(entry['studiekode'])}, studiested: {ts_string(entry['studiested'])}, "
                f"type: {ts_string(entry['type'])},"
            )
            if entry.get("url"):
                lines.append(f"        url: {ts_string(entry['url'])},")
            if entry.get("poengFellesMed"):
                lines.append(f"        poengFellesMed: [{', '.join(ts_string(i) for i in entry['poengFellesMed'])}],")
            lines.append("        years: {")
            for y in YEARS:
                if y in entry["years"]:
                    lines.append(f"          '{y}': {render_year_call(entry['years'][y])},")
            lines.append("        },")
            lines.append("      },")
        lines.append("    ],")
        lines.append("  },")

    lines.append("];")
    lines.append("")
    return "\n".join(lines)


def groups_to_json_twin(groups_out, generated_date: str, programkart_hentet: str) -> dict:
    return {
        "generert": generated_date,
        "programkartHentet": programkart_hentet,
        "years": YEARS,
        "groups": groups_out,
    }


# ───────────────────────────── main ──────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Bygg landsamAdmissionData.ts fra SO-kilder + programkart.")
    parser.add_argument("--programkart", type=Path, default=DEFAULT_PROGRAMKART)
    parser.add_argument("--sokertall", type=Path, default=DEFAULT_SOKERTALL)
    parser.add_argument("--poenggrenser", type=Path, default=DEFAULT_POENGGRENSER)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--opptakspoeng", type=Path, default=None,
                        help="DBH 571-snitt (standard: kilder/dbh571_opptakspoeng.json ved siden av programkartet)")
    args = parser.parse_args()

    if not args.programkart.exists():
        print(f"FEIL: fant ikke programkart: {args.programkart}", file=sys.stderr)
        sys.exit(1)
    if not args.sokertall.exists():
        print(f"FEIL: fant ikke søkertall-kilde: {args.sokertall}", file=sys.stderr)
        sys.exit(1)
    if not args.poenggrenser.exists():
        print(f"FEIL: fant ikke poenggrense-kilde: {args.poenggrenser}", file=sys.stderr)
        sys.exit(1)

    with open(args.programkart, encoding="utf-8") as f:
        programkart = json.load(f)

    points_path = args.opptakspoeng or args.programkart.parent / "kilder" / "dbh571_opptakspoeng.json"
    points_index = json.loads(points_path.read_text(encoding="utf-8"))["programs"] if points_path.exists() else {}

    sokertall_index, sokertall_names, sokertall_conflicts = load_sokertall(args.sokertall)
    poenggrenser_index, poenggrenser_conflicts = load_poenggrenser(args.poenggrenser)

    groups_out, summary_lines, warnings = process_programkart(
        programkart, sokertall_index, poenggrenser_index, points_index
    )

    generated_date = date.today().isoformat()
    ts_content = render_ts(groups_out, generated_date)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(ts_content, encoding="utf-8")

    json_out_path = args.out.with_suffix(".json")
    json_twin = groups_to_json_twin(groups_out, generated_date, programkart.get("hentet", ""))
    json_out_path.write_text(json.dumps(json_twin, ensure_ascii=False, indent=2), encoding="utf-8")

    # ── stdout-oppsummering ──
    print(f"Skrev {args.out}")
    print(f"Skrev {json_out_path}")
    print(f"Opptakspoeng (DBH 571): {len(points_index)} program fra {points_path.name if points_index else '(ingen fil)'}")
    for line in summary_lines:
        print(line)

    if sokertall_conflicts:
        print(f"\nADVARSEL: {len(sokertall_conflicts)} motstridende verdier i søkertall-kilden (beholdt første funnet):")
        for c in sokertall_conflicts[:20]:
            print(f"  - kode={c[0]} nøkkeltall={c[1]} år={c[2]} gammel={c[3]} ny={c[4]}")

    if poenggrenser_conflicts:
        print(f"\nADVARSEL: {len(poenggrenser_conflicts)} motstridende verdier i poenggrense-kilden (beholdt første funnet):")
        for c in poenggrenser_conflicts[:20]:
            print(f"  - kode={c[0]} kvote={c[1]} år={c[2]} gammel={c[3]} ny={c[4]}")

    if warnings:
        print(f"\nADVARSLER ({len(warnings)}):")
        for w in warnings:
            print(f"  - {w}")
    else:
        print("\nIngen advarsler – alle SO-koder ble funnet i begge kilder.")


if __name__ == "__main__":
    main()
