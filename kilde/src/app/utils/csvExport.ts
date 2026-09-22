import { FULL_ADMISSION_DATA, ALL_YEARS } from '../data/fullAdmissionData';
import { SAMF_DATA, SAMF_YEARS } from '../data/samfData';
import { ANNUAL_STUDIES_DATA, ANNUAL_YEARS } from '../data/annualStudiesData';
import { LANDSAM_GROUPS, LANDSAM_YEARS } from '../data/landsamAdmissionData';
import { LANDSAM_COURSE_GROUPS } from '../data/landsamCourseData';
import { LANDSAM_COURSE_MAPPING } from '../data/landsamCourseMapping';

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

// ─── LANDSAM: Emner og karakterer ────────────────────────────────────────────

/**
 * Eksporterer emnerader (ett emne per rad) for de valgte programmene i én
 * programgruppe og ett år. `entryIds` er id-ene fra opptaksdataene.
 */
export function exportLandsamCoursesCsv(
  groupId: string,
  entryIds: string[],
  year: number,
  minKandidater = 0,
) {
  const header = row(
    'Programgruppe', 'Nivå',
    'Institusjon', 'Kortnavn', 'NMBU',
    'DBH institusjonskode', 'DBH programkoder', 'DBH programnavn',
    'År', 'Emnekode', 'Emnenavn', 'Studiepoeng',
    'A', 'B', 'C', 'D', 'E', 'F', 'G (bestått)', 'H (ikke bestått)',
    'Kandidater', 'Bokstavkarakterer', 'Snitt (A=5…F=0)', 'Stryk %', 'Bestått %'
  );

  const lines: string[] = [header];
  const group = LANDSAM_COURSE_GROUPS.find((g) => g.id === groupId);

  if (group) {
    for (const p of group.programs) {
      if (entryIds.length > 0 && !entryIds.includes(p.entryId)) continue;
      for (const c of p.courses) {
        const d = c.years.find((yr) => yr.year === year);
        if (!d) continue;
        if (d.total < minKandidater) continue;
        const bokstav = d.A + d.B + d.C + d.D + d.E + d.F;
        lines.push(row(
          group.label, group.level,
          p.institusjon, p.shortName, p.isNmbu ? 'ja' : 'nei',
          p.dbhInstitusjonskode, p.dbhProgramkoder.join(' '), p.dbhProgramnavn,
          d.year, c.emnekode, c.emnenavn, c.studiepoeng,
          d.A, d.B, d.C, d.D, d.E, d.F, d.G, d.H,
          d.total, bokstav, d.snitt, d.strykprosent, d.bestattprosent
        ));
      }
    }
  }

  downloadCsv(`landsam_emner_${groupId}_${year}.csv`, lines);
}

/**
 * Eksporterer sammenligningen av ÉN emnetype (samme fag) på tvers av programmene
 * i én programgruppe, for ett år. Er faget delt i flere emnekoder, summeres
 * karakterene. Program uten kobling tas med som tomme rader, slik at det går
 * fram hvem som mangler et tilsvarende emne.
 */
export function exportLandsamCourseTypeCsv(
  groupId: string,
  courseTypeId: string,
  entryIds: string[],
  year: number,
  minKandidater = 0,
) {
  const header = row(
    'Programgruppe', 'Nivå', 'Emnetype', 'Kategori',
    'Institusjon', 'Kortnavn', 'NMBU',
    'DBH institusjonskode', 'DBH programnavn',
    'År', 'Emnekoder', 'Emnenavn', 'Studiepoeng (sum)',
    'A', 'B', 'C', 'D', 'E', 'F', 'G (bestått)', 'H (ikke bestått)',
    'Kandidater', 'Bokstavkarakterer', 'Snitt (A=5…F=0)', 'Stryk %', 'Bestått %',
    'Merknad'
  );

  const lines: string[] = [header];
  const group = LANDSAM_COURSE_GROUPS.find((g) => g.id === groupId);
  const mapping = LANDSAM_COURSE_MAPPING.find((m) => m.groupId === groupId);
  const courseType = mapping?.courseTypes.find((c) => c.id === courseTypeId);

  if (group && courseType) {
    for (const p of group.programs) {
      if (entryIds.length > 0 && !entryIds.includes(p.entryId)) continue;
      const link = courseType.links.find((l) => l.entryId === p.entryId);

      if (!link) {
        lines.push(row(
          group.label, group.level, courseType.label, courseType.kategori,
          p.institusjon, p.shortName, p.isNmbu ? 'ja' : 'nei',
          p.dbhInstitusjonskode, p.dbhProgramnavn,
          year, '', '', '',
          '', '', '', '', '', '', '', '',
          '', '', '', '', '',
          'Ingen tilsvarende emne kartlagt'
        ));
        continue;
      }

      const koder: string[] = [];
      const navn: string[] = [];
      let studiepoeng = 0;
      let A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, total = 0;

      for (const kode of link.emnekoder) {
        const c = p.courses.find((x) => x.emnekode === kode);
        if (!c) continue;
        const d = c.years.find((yr) => yr.year === year);
        if (!d || d.total <= 0 || d.total < minKandidater) continue;
        koder.push(c.emnekode);
        navn.push(c.emnenavn ?? c.emnekode);
        if (c.studiepoeng !== null) studiepoeng += c.studiepoeng;
        A += d.A; B += d.B; C += d.C; D += d.D; E += d.E; F += d.F;
        G += d.G; H += d.H; total += d.total;
      }

      const bokstav = A + B + C + D + E + F;
      const snitt = bokstav > 0
        ? +(((A * 5 + B * 4 + C * 3 + D * 2 + E * 1) / bokstav).toFixed(2)) : null;
      const stryk = bokstav > 0 ? +(((F / bokstav) * 100).toFixed(1)) : null;
      const bestatt = G + H > 0 ? +(((G / (G + H)) * 100).toFixed(1)) : null;

      lines.push(row(
        group.label, group.level, courseType.label, courseType.kategori,
        p.institusjon, p.shortName, p.isNmbu ? 'ja' : 'nei',
        p.dbhInstitusjonskode, p.dbhProgramnavn,
        year, koder.join(' '), navn.join(' + '), studiepoeng > 0 ? studiepoeng : null,
        A, B, C, D, E, F, G, H,
        total, bokstav, snitt, stryk, bestatt,
        koder.length === 0
          ? `Ingen emnetall for ${year} over terskelen (kartlagt: ${link.emnekoder.join(' ')})`
          : link.merknad ?? ''
      ));
    }
  }

  downloadCsv(`landsam_emnetype_${groupId}_${courseTypeId}_${year}.csv`, lines);
}
