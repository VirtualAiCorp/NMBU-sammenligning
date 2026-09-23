import { FULL_ADMISSION_DATA, ALL_YEARS } from '../data/fullAdmissionData';
import { SAMF_DATA, SAMF_YEARS } from '../data/samfData';
import { ANNUAL_STUDIES_DATA, ANNUAL_YEARS } from '../data/annualStudiesData';
import type { FacultyData } from '../data/faculties';
import type { PlanCourse } from '../data/landsamStudyPlanData';
import type { SbDimension } from '../data/landsamStudiebarometerData';

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

// ─── Fakultet: opptakstall ───────────────────────────────────────────────────

export function exportFacultyAdmissionCsv(faculty: FacultyData) {
  const header = row(
    'Programgruppe', 'Nivå',
    'Institusjon', 'Kortname', 'Studiekode', 'Studiested', 'Type',
    'År',
    'Alle søkere', 'Førstevalgssøkere', 'Studieplasser', 'Søkerpress (fv/pl, lokale opptak: fv/tilbud)',
    'Kvinner % (1.valg)', 'Kvalifiserte', 'Tilbud', 'Ja-svar', 'Møtt', 'Oppmøteandel % (møtt/tilbud)',
    'Poenggrense FV', 'Poenggrense Ord.'
  );

  const lines: string[] = [header];

  for (const g of faculty.admissionGroups) {
    for (const e of g.entries) {
      for (const year of faculty.admissionYears) {
        const d = e.years[year];
        if (!d) continue;
        const sp = d.fvS !== null && d.plasser !== null && d.plasser > 0
          ? +(d.fvS / d.plasser).toFixed(2)
          : d.fvS !== null && d.tilbud !== null && d.tilbud > 0 ? +(d.fvS / d.tilbud).toFixed(2) : null;
        const opp = d.mott != null && d.tilbud != null && d.tilbud > 0 ? +((d.mott / d.tilbud) * 100).toFixed(1) : null;
        lines.push(row(
          g.label, g.level,
          e.institusjon, e.shortName, e.studiekode, e.studiested, e.type,
          year,
          d.alleS, d.fvS, d.plasser, sp,
          d.kvinner, d.kvalifiserte, d.tilbud, d.akseptert ?? null, d.mott ?? null, opp,
          d.pg_fv, d.pg_ord
        ));
      }
    }
  }

  const years = faculty.admissionYears;
  const spenn = years.length > 0 ? `${years[0]}-${years[years.length - 1]}` : 'tomt';
  downloadCsv(`${faculty.id}_opptak_${spenn}.csv`, lines);
}

// ─── Fakultet: emner og karakterer ───────────────────────────────────────────

/**
 * Eksporterer emnerader (ett emne per rad) for de valgte programmene i én
 * programgruppe og ett år. `entryIds` er id-ene fra opptaksdataene.
 */
export function exportFacultyCoursesCsv(
  faculty: FacultyData,
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
  const group = faculty.courseGroups.find((g) => g.id === groupId);

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

  downloadCsv(`${faculty.id}_emner_${groupId}_${year}.csv`, lines);
}

/**
 * Eksporterer sammenligningen av ÉN emnetype (samme fag) på tvers av programmene
 * i én programgruppe, for ett år. Er faget delt i flere emnekoder, summeres
 * karakterene. Program uten kobling tas med som tomme rader, slik at det går
 * fram hvem som mangler et tilsvarende emne.
 */
export function exportFacultyCourseTypeCsv(
  faculty: FacultyData,
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
  const group = faculty.courseGroups.find((g) => g.id === groupId);
  const mapping = faculty.courseMapping.find((m) => m.groupId === groupId);
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

  downloadCsv(`${faculty.id}_emnetype_${groupId}_${courseTypeId}_${year}.csv`, lines);
}

// ─── Fakultet: studieplan (obligatoriske emner) ──────────────────────────────

const STUDYPLAN_SEMESTER_ORDER = ['høst', 'januarblokk', 'vår', 'juniblokk', 'helår'];

function studyPlanSemesterRank(semester: string | null): number {
  if (!semester) return STUDYPLAN_SEMESTER_ORDER.length + 1;
  const i = STUDYPLAN_SEMESTER_ORDER.indexOf(semester.trim().toLowerCase());
  return i >= 0 ? i : STUDYPLAN_SEMESTER_ORDER.length;
}

/** Studieår først (emner uten årsplassering bakerst), deretter semester. */
function sortPlanCourses(courses: PlanCourse[]): PlanCourse[] {
  return [...courses].sort((a, b) => {
    const ay = a.aar ?? 99, by = b.aar ?? 99;
    if (ay !== by) return ay - by;
    const as = studyPlanSemesterRank(a.semester), bs = studyPlanSemesterRank(b.semester);
    if (as !== bs) return as - bs;
    return a.emnekode.localeCompare(b.emnekode, 'nb');
  });
}

/**
 * Eksporterer de obligatoriske emnene fra studieplanene til de valgte programmene
 * i én programgruppe, med DBH-karakterene for ett år. Emner uten karaktertall for
 * året (eller under kandidatterskelen) tas med med tomme tallkolonner, slik at hele
 * emnerekken i studieplanen går fram. Spesialiseringer kommer etter de felles
 * obligatoriske emnene, merket i kolonnen «Del».
 */
export function exportFacultyStudyPlanCsv(
  faculty: FacultyData,
  groupId: string,
  entryIds: string[],
  year: number,
  minKandidater = 0,
) {
  const header = row(
    'Programgruppe', 'Nivå',
    'Institusjon', 'Kortnavn', 'NMBU', 'Program', 'Studieplanår', 'Del',
    'Studieår', 'Semester', 'Emnekode', 'DBH emnekoder', 'Emnenavn', 'Studiepoeng',
    'År', 'Kandidater', 'Snitt (A=5…F=0)', 'Stryk %',
    'A', 'B', 'C', 'D', 'E', 'F', 'G (bestått)', 'H (ikke bestått)', 'Bestått %',
    'Merknad'
  );

  const lines: string[] = [header];
  const group = faculty.studyPlanGroups.find((g) => g.id === groupId);

  if (group) {
    for (const p of group.programs) {
      if (entryIds.length > 0 && !entryIds.includes(p.entryId)) continue;

      const bolker: { del: string; emner: PlanCourse[] }[] = [
        { del: 'Obligatorisk', emner: p.obligatoriske },
        ...p.spesialiseringer.map((s) => ({ del: `Spesialisering: ${s.navn}`, emner: s.obligatoriske })),
      ];

      for (const bolk of bolker) {
        for (const c of sortPlanCourses(bolk.emner)) {
          const raw = c.years.find((yr) => yr.year === year);
          const d = raw && raw.total > 0 && raw.total >= minKandidater ? raw : null;
          lines.push(row(
            group.label, group.level,
            p.institusjon, p.shortName, p.isNmbu ? 'ja' : 'nei', p.programnavn, p.studieplanAar, bolk.del,
            c.aar, c.semester, c.emnekode, c.dbhEmnekoder.join(' '), c.emnenavn, c.studiepoeng,
            year, d ? d.total : null, d ? d.snitt : null, d ? d.strykprosent : null,
            d ? d.A : null, d ? d.B : null, d ? d.C : null, d ? d.D : null, d ? d.E : null, d ? d.F : null,
            d ? d.G : null, d ? d.H : null, d ? d.bestattprosent : null,
            c.merknad ?? (raw && !d ? `Under terskelen på ${minKandidater} kandidater` : '')
          ));
        }
      }
    }
  }

  downloadCsv(`${faculty.id}_studieplan_${groupId}_${year}.csv`, lines);
}

// ─── Studiebarometeret ────────────────────────────────────────────────────────

const SB_CSV_DIMENSIONS: SbDimension[] = [
  'undervisning', 'tilbakemeldinger', 'vurderingsformer', 'laeringsmiljo',
  'organisering', 'yrkesrelevans', 'engasjement', 'helhetsvurdering',
];

/**
 * Alle Studiebarometer-tall for fakultetet: én rad per program per år, pluss én
 * rad med fagfeltsnittet for siste år. `groupId` begrenser til én programgruppe.
 */
export function exportFacultyStudiebarometerCsv(faculty: FacultyData, groupId?: string) {
  const header = row(
    'Programgruppe', 'Institusjon', 'Kortnavn', 'NMBU', 'Program', 'Rad',
    'År', 'Respondenter', 'Svarprosent',
    'Undervisning', 'Tilbakemeldinger', 'Vurderingsformer', 'Læringsmiljø',
    'Organisering', 'Tilknytning til yrkeslivet', 'Eget engasjement', 'Helhetsvurdering',
    'Fagfelt', 'Merknad', 'Lenke'
  );

  const lines: string[] = [header];
  const entries = faculty.studiebarometer.filter((e) => !groupId || e.groupId === groupId);

  const gruppeNavn = (id: string): string =>
    faculty.admissionGroups.find((g) => g.id === id)?.label ?? id;

  for (const e of entries) {
    const gruppe = gruppeNavn(e.groupId);
    const base = [gruppe, e.institusjon, e.shortName, e.isNmbu ? 'ja' : 'nei', e.programnavn];

    for (const h of e.history) {
      const siste = h.year === e.latestYear;
      lines.push(row(
        ...base, 'Program',
        h.year,
        siste ? e.respondents : null,
        siste ? e.responseRate : null,
        ...SB_CSV_DIMENSIONS.map((d) => h.scores[d]),
        e.fieldLabel, siste ? e.warning : null, siste ? e.url : null
      ));
    }

    // Programmer uten tidsserie: ta med siste år likevel.
    if (e.history.length === 0) {
      lines.push(row(
        ...base, 'Program',
        e.latestYear, e.respondents, e.responseRate,
        ...SB_CSV_DIMENSIONS.map((d) => e.scores[d]),
        e.fieldLabel, e.warning, e.url
      ));
    }

    if (e.fieldLabel) {
      lines.push(row(
        ...base, 'Fagfeltsnitt',
        e.latestYear, null, null,
        ...SB_CSV_DIMENSIONS.map((d) => e.fieldAverage[d]),
        e.fieldLabel, null, null
      ));
    }
  }

  downloadCsv(`${faculty.id}_studiebarometeret${groupId ? `_${groupId}` : ''}.csv`, lines);
}
