#!/usr/bin/env python3
"""Bygger markedsstatus-modulen for ett fakultet.

Leser  data/<fakultet>/markedsstatus.json
Kopierer nedlastede PDF-er fra data/<fakultet>/pdf/ til
       kilde/public/markedsstatus/<fakultet>/
Skriver kilde/src/app/data/<fakultet>MarketStatusData.ts

Bruk:
    python3 scripts/build-markedsstatus.py landsam
    python3 scripts/build-markedsstatus.py realtek --dry-run

Bare standardbiblioteket brukes.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

FAKULTETER = ['landsam', 'realtek', 'biovit', 'kbm', 'mina']
GYLDIG_STATUS = {'complete', 'partial', 'none'}

TS_HEADER = """// GENERERT av scripts/build-markedsstatus.py {dato} – ikke rediger for hånd.
// Kilde: data/{fak}/markedsstatus.json · PDF-er i kilde/public/markedsstatus/{fak}/

export interface MarketDoc {{
  label: string;
  url: string;
  localPath: string | null;
  dato: string | null;
  storrelseMB: number | null;
}}

export interface MarketInstitution {{
  id: string;
  name: string;
  fullName: string;
  enhet: string | null;
  styresider: string[];
  status: 'complete' | 'partial' | 'none';
  dokumenter: MarketDoc[];
  punkter: string[];
  oppsummering: string | null;
  relevanteProgram: string[];
}}

"""


def advarsel(melding: str) -> None:
    print(f'ADVARSEL: {melding}', file=sys.stderr)


def tekst_eller_none(verdi) -> str | None:
    """Tom streng behandles som «ikke utfylt»."""
    if verdi is None:
        return None
    tekst = str(verdi).strip()
    return tekst or None


def les_dokument(dok: dict, fakultet: str, pdf_dir: Path, public_dir: Path,
                 inst_id: str, dry_run: bool) -> dict:
    filnavn = tekst_eller_none(dok.get('filnavn'))
    lastet_ned = bool(dok.get('lastetNed'))
    local_path = None

    if lastet_ned and filnavn:
        kilde = pdf_dir / filnavn
        if kilde.is_file():
            if not dry_run:
                public_dir.mkdir(parents=True, exist_ok=True)
                shutil.copy2(kilde, public_dir / filnavn)
            local_path = f'/markedsstatus/{fakultet}/{filnavn}'
        else:
            advarsel(f'{inst_id}: fant ikke PDF-en {kilde} – kortet lenker til url-en i stedet')
    elif lastet_ned and not filnavn:
        advarsel(f'{inst_id}: dokumentet er markert lastetNed, men mangler filnavn')

    storrelse = dok.get('storrelseMB')
    try:
        storrelse = float(storrelse) if storrelse is not None else None
    except (TypeError, ValueError):
        advarsel(f'{inst_id}: ugyldig storrelseMB ({storrelse!r}) – satt til null')
        storrelse = None

    return {
        'label': tekst_eller_none(dok.get('label')) or filnavn or 'Dokument',
        'url': tekst_eller_none(dok.get('url')) or '',
        'localPath': local_path,
        'dato': tekst_eller_none(dok.get('dato')),
        'storrelseMB': storrelse,
    }


def les_institusjon(inst: dict, fakultet: str, pdf_dir: Path, public_dir: Path,
                    dry_run: bool) -> dict:
    inst_id = tekst_eller_none(inst.get('id')) or '(uten id)'
    status = tekst_eller_none(inst.get('status')) or 'none'
    if status not in GYLDIG_STATUS:
        advarsel(f'{inst_id}: ukjent status {status!r} – satt til «none»')
        status = 'none'

    dokumenter = [
        les_dokument(d, fakultet, pdf_dir, public_dir, inst_id, dry_run)
        for d in inst.get('dokumenter') or []
    ]

    return {
        'id': inst_id,
        'name': tekst_eller_none(inst.get('name')) or inst_id,
        'fullName': tekst_eller_none(inst.get('fullName')) or tekst_eller_none(inst.get('name')) or inst_id,
        'enhet': tekst_eller_none(inst.get('enhet')),
        'styresider': [s for s in (tekst_eller_none(x) for x in inst.get('styresider') or []) if s],
        'status': status,
        'dokumenter': dokumenter,
        'punkter': [p for p in (tekst_eller_none(x) for x in inst.get('punkter') or []) if p],
        'oppsummering': tekst_eller_none(inst.get('oppsummering')),
        'relevanteProgram': [p for p in (tekst_eller_none(x) for x in inst.get('relevanteProgram') or []) if p],
    }


def skriv_ts(ut_fil: Path, fakultet: str, hentet: str | None, institusjoner: list[dict]) -> None:
    body = TS_HEADER.format(dato=hentet or 'ukjent dato', fak=fakultet)
    body += 'export const MARKET_STATUS_HENTET: string | null = '
    body += (json.dumps(hentet, ensure_ascii=False) if hentet else 'null') + ';\n\n'
    body += 'export const MARKET_STATUS: MarketInstitution[] = '
    body += json.dumps(institusjoner, ensure_ascii=False, indent=2)
    body += ';\n'
    ut_fil.parent.mkdir(parents=True, exist_ok=True)
    ut_fil.write_text(body, encoding='utf-8')


def main() -> int:
    ap = argparse.ArgumentParser(description='Bygger <fakultet>MarketStatusData.ts fra markedsstatus.json')
    ap.add_argument('fakultet', help='landsam | realtek | biovit | kbm | mina')
    ap.add_argument('--inn', help='Sti til markedsstatus.json (standard: data/<fakultet>/markedsstatus.json)')
    ap.add_argument('--pdf-dir', help='Mappe med nedlastede PDF-er (standard: data/<fakultet>/pdf)')
    ap.add_argument('--out', help='Sti til TS-modulen som skrives')
    ap.add_argument('--dry-run', action='store_true', help='Ikke skriv eller kopier noe')
    args = ap.parse_args()

    fakultet = args.fakultet.strip().lower()
    if fakultet not in FAKULTETER:
        advarsel(f'«{fakultet}» er ikke i listen {FAKULTETER} – fortsetter likevel')

    inn_fil = Path(args.inn) if args.inn else ROOT / 'data' / fakultet / 'markedsstatus.json'
    pdf_dir = Path(args.pdf_dir) if args.pdf_dir else ROOT / 'data' / fakultet / 'pdf'
    ut_fil = Path(args.out) if args.out else ROOT / 'kilde' / 'src' / 'app' / 'data' / f'{fakultet}MarketStatusData.ts'
    public_dir = ROOT / 'kilde' / 'public' / 'markedsstatus' / fakultet

    if not inn_fil.is_file():
        print(f'FEIL: fant ikke {inn_fil}', file=sys.stderr)
        return 1

    data = json.loads(inn_fil.read_text(encoding='utf-8'))
    if data.get('fakultet') and str(data['fakultet']).lower() != fakultet:
        advarsel(f'{inn_fil} oppgir fakultet «{data["fakultet"]}», men bygges som «{fakultet}»')

    hentet = tekst_eller_none(data.get('hentet'))
    institusjoner = [
        les_institusjon(i, fakultet, pdf_dir, public_dir, args.dry_run)
        for i in data.get('institusjoner') or []
    ]

    ant_dok = sum(len(i['dokumenter']) for i in institusjoner)
    ant_lokale = sum(1 for i in institusjoner for d in i['dokumenter'] if d['localPath'])

    if args.dry_run:
        print(f'[tørrkjøring] {fakultet}: {len(institusjoner)} institusjoner, '
              f'{ant_dok} dokumenter ({ant_lokale} PDF-er ville blitt kopiert)')
        return 0

    skriv_ts(ut_fil, fakultet, hentet, institusjoner)
    print(f'{fakultet}: {len(institusjoner)} institusjoner, {ant_dok} dokumenter, '
          f'{ant_lokale} PDF-er kopiert til {public_dir}')
    print(f'Skrev {ut_fil}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
