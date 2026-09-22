import { FULL_ADMISSION_DATA, ALL_YEARS } from '../data/fullAdmissionData';
import { SAMF_DATA, SAMF_YEARS } from '../data/samfData';
import { ANNUAL_STUDIES_DATA, ANNUAL_YEARS } from '../data/annualStudiesData';
import { LANDSAM_GROUPS, LANDSAM_YEARS } from '../data/landsamAdmissionData';

// ─── Core helpers ─────────────────────────────────────────────────────────────

function q(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const s = String(val);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"` : s;
}

function row(...cells: (string | number | null | undefined)[]): string {
  return cells.map(q).join(',');
}

function downloadCsv(filename: string, lines: string[]) {
  const bom = '﻿'; // UTF-8 BOM so Excel opens Norwegian chars correctly
  const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── ØA: Økonomi og administrasjon ───────────────────────────────────────────

export function exportOaCsv() {
  const header = row(
    'Institusjon', 'Kortname', 'Studiekode', 'Studiested', 'Type',
    'År',
    'Alle søkere', 'Førstevalgssøkere', 'Studieplasser', 'Søkerpress (fv/pl)',
    'Kvinner % (1.valg)', 'Kvalifiserte', 'Tilbud',
    'Poenggrense FV', 'Poenggrense Ord.'
  );

  const lines: string[] = [header];

  for (const e of FULL_ADMISSION_DATA) {
    for (const year of ALL_YEARS) {
      const d = e.years[year];
      if (!d) continue;
      const sp = d.fvS !== null && d.plasser !== null && d.plasser > 0
        ? +(d.fvS / d.plasser).toFixed(2) : null;
      lines.push(row(
        e.institusjon, e.shortName, e.studiekode, e.studiested, e.type,
        year,
        d.alleS, d.fvS, d.plasser, sp,
        d.kvinner, d.kvalifiserte, d.tilbud,
        d.pg_fv, d.pg_ord
      ));
    }
  }

  downloadCsv('oa_opptak_2020-2026.csv', lines);
}

// ─── Samfunnsøkonomi ──────────────────────────────────────────────────────────

export function exportSamfCsv() {
  const header = row(
    'Institusjon', 'Kortname', 'Studiekode', 'Studiested', 'Type',
    'År',
    'Alle søkere', 'Førstevalgssøkere', 'Studieplasser', 'Søkerpress (fv/pl)',
    'Kvinner % (1.valg)', 'Kvalifiserte', 'Tilbud',
    'Poenggrense FV', 'Poenggrense Ord.'
  );

  const lines: string[] = [header];

  for (const e of SAMF_DATA) {
    for (const year of SAMF_YEARS) {
      const d = e.years[year];
      if (!d) continue;
      const sp = d.fvS !== null && d.plasser !== null && d.plasser > 0
        ? +(d.fvS / d.plasser).toFixed(2) : null;
      lines.push(row(
        e.institusjon, e.shortName, e.studiekode, e.studiested, e.type,
        year,
        d.alleS, d.fvS, d.plasser, sp,
        d.kvinner, d.kvalifiserte, d.tilbud,
        d.pg_fv, d.pg_ord
      ));
    }
  }

  downloadCsv('samfokonomi_opptak_2020-2026.csv', lines);
}

// ─── Årsstudier ───────────────────────────────────────────────────────────────

export function exportAarsstudierCsv() {
  const header = row(
    'Institusjon', 'Kortname', 'Studiekode', 'Studiested', 'Type',
    'År',
    'Alle søkere', 'Førstevalgssøkere', 'Studieplasser', 'Søkerpress (fv/pl)',
    'Kvinner % (1.valg)', 'Kvalifiserte', 'Tilbud',
    'Poenggrense FV', 'Poenggrense Ord.'
  );

  const lines: string[] = [header];

  for (const e of ANNUAL_STUDIES_DATA) {
    for (const year of ANNUAL_YEARS) {
      const d = e.years[year];
      if (!d) continue;
      const sp = d.fvS !== null && d.plasser !== null && d.plasser > 0
        ? +(d.fvS / d.plasser).toFixed(2) : null;
      lines.push(row(
        e.institusjon, e.shortName, e.studiekode, e.studiested, e.type,
        year,
        d.alleS, d.fvS, d.plasser, sp,
        d.kvinner, d.kvalifiserte, d.tilbud,
        d.pg_fv, d.pg_ord
      ));
    }
  }

  downloadCsv('arsstudier_opptak_2021-2026.csv', lines);
}

// ─── LANDSAM: Fakultet for landskap og samfunn ───────────────────────────────

export function exportLandsamCsv() {
  const header = row(
    'Programgruppe', 'Nivå',
    'Institusjon', 'Kortname', 'Studiekode', 'Studiested', 'Type',
    'År',
    'Alle søkere', 'Førstevalgssøkere', 'Studieplasser', 'Søkerpress (fv/pl)',
    'Kvinner % (1.valg)', 'Kvalifiserte', 'Tilbud',
    'Poenggrense FV', 'Poenggrense Ord.'
  );

  const lines: string[] = [header];

  for (const g of LANDSAM_GROUPS) {
    for (const e of g.entries) {
      for (const year of LANDSAM_YEARS) {
        const d = e.years[year];
        if (!d) continue;
        const sp = d.fvS !== null && d.plasser !== null && d.plasser > 0
          ? +(d.fvS / d.plasser).toFixed(2) : null;
        lines.push(row(
          g.label, g.level,
          e.institusjon, e.shortName, e.studiekode, e.studiested, e.type,
          year,
          d.alleS, d.fvS, d.plasser, sp,
          d.kvinner, d.kvalifiserte, d.tilbud,
          d.pg_fv, d.pg_ord
        ));
      }
    }
  }

  downloadCsv('landsam_opptak_2020-2026.csv', lines);
}
