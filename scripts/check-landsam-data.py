#!/usr/bin/env python3
"""
check-landsam-data.py

Enkel, eval-fri sanity-sjekk av dataene generert av build-landsam-data.py.
I stedet for å parse TypeScript, leser denne JSON-tvillingen som
build-landsam-data.py skriver ved siden av .ts-filen (samme filnavn,
.json-endelse i stedet for .ts).

Sjekker:
  - hver entries[].id er unik (globalt, på tvers av grupper)
  - hver nmbuIds/defaultIds-referanse peker på en id som faktisk finnes i
    samme gruppes entries
  - kvinner-verdier er innenfor 0–100
  - poenggrense-verdier (pg_fv/pg_ord) er innenfor 0–80

Bruk:
    python3 scripts/check-landsam-data.py [PATH_TIL_JSON]

Uten argument sjekkes JSON-tvillingen til standard-outputen til
build-landsam-data.py (kilde/src/app/data/landsamAdmissionData.json).
Exit code 0 = ingen feil, 1 = én eller flere feil funnet.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
DEFAULT_JSON = REPO_ROOT / "kilde/src/app/data/landsamAdmissionData.json"

KVINNER_MIN, KVINNER_MAX = 0.0, 100.0
POENG_MIN, POENG_MAX = 0.0, 80.0


def check(data: dict) -> list[str]:
    errors: list[str] = []
    all_ids: dict[str, str] = {}  # id -> group id (for duplicate reporting)

    groups = data.get("groups", [])
    if not groups:
        errors.append("Ingen grupper funnet i JSON-en.")
        return errors

    # Pass 1: samle alle ider og sjekk unikhet.
    for group in groups:
        gid = group.get("id", "?")
        for entry in group.get("entries", []):
            eid = entry.get("id")
            if not eid:
                errors.append(f"[{gid}] entry uten id.")
                continue
            if eid in all_ids:
                errors.append(f"Duplikat id '{eid}' (grupper '{all_ids[eid]}' og '{gid}').")
            else:
                all_ids[eid] = gid

    # Pass 2: sjekk nmbuIds/defaultIds og tallverdier per gruppe.
    for group in groups:
        gid = group.get("id", "?")
        entry_ids_in_group = {e.get("id") for e in group.get("entries", [])}

        for ref_field in ("nmbuIds", "defaultIds"):
            for ref_id in group.get(ref_field, []):
                if ref_id not in entry_ids_in_group:
                    errors.append(f"[{gid}] {ref_field} refererer til ukjent id '{ref_id}'.")

        for entry in group.get("entries", []):
            eid = entry.get("id", "?")
            for year, values in (entry.get("years") or {}).items():
                kvinner = values.get("kvinner")
                if kvinner is not None and not (KVINNER_MIN <= kvinner <= KVINNER_MAX):
                    errors.append(f"[{gid}/{eid}] kvinner={kvinner} utenfor {KVINNER_MIN}-{KVINNER_MAX} (år {year}).")
                for pg_field in ("pg_fv", "pg_ord"):
                    pg = values.get(pg_field)
                    if pg is not None and not (POENG_MIN <= pg <= POENG_MAX):
                        errors.append(
                            f"[{gid}/{eid}] {pg_field}={pg} utenfor {POENG_MIN}-{POENG_MAX} (år {year})."
                        )

    return errors


def main():
    parser = argparse.ArgumentParser(description="Sanity-sjekk av landsamAdmissionData.json")
    parser.add_argument("json_path", nargs="?", type=Path, default=DEFAULT_JSON)
    args = parser.parse_args()

    if not args.json_path.exists():
        print(f"FEIL: fant ikke {args.json_path}", file=sys.stderr)
        sys.exit(1)

    with open(args.json_path, encoding="utf-8") as f:
        data = json.load(f)

    errors = check(data)

    total_entries = sum(len(g.get("entries", [])) for g in data.get("groups", []))
    print(f"Sjekket {args.json_path}")
    print(f"{len(data.get('groups', []))} grupper, {total_entries} programmer totalt.")

    if errors:
        print(f"\n{len(errors)} FEIL funnet:")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)
    else:
        print("\nIngen feil funnet.")
        sys.exit(0)


if __name__ == "__main__":
    main()
