import { Fragment, useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Info, ExternalLink, Filter, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { CsvExportButton } from './CsvExportButton';
import { exportLandsamCoursesCsv, exportLandsamCourseTypeCsv, exportLandsamStudyPlanCsv } from '../utils/csvExport';
import {
  LANDSAM_COURSE_GROUPS, LANDSAM_COURSE_YEARS,
  type LandsamCourseGroup, type ProgramCourses, type CourseGradeYear, type CourseStats,
} from '../data/landsamCourseData';
import {
  LANDSAM_COURSE_MAPPING,
  type CourseType, type CourseTypeLink,
} from '../data/landsamCourseMapping';
import {
  LANDSAM_STUDYPLAN_GROUPS,
  type PlanCourse, type PlanSpecialisation, type ProgramStudyPlan,
} from '../data/landsamStudyPlanData';
import { LANDSAM_GROUPS, type LandsamLevel } from '../data/landsamAdmissionData';
import { landsamColorFor } from '../data/landsamPalette';
import { landsamCourseHasComparison } from '../data/landsamUtils';

// ─── Felles ───────────────────────────────────────────────────────────────────

const LEVEL_LABEL: Record<LandsamLevel, string> = {
  bachelor: 'Bachelor',
  master5:  'Femårig master',
  master2:  'Toårig master',
};

const GRADES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
type Grade = (typeof GRADES)[number];

// Samme palett som GradeDistributionChart bruker, ordnet A→F slik at fordelingen
// leses som en skala fra NMBU-grønn (A) til rosa-rød (F).
const GRADE_COLORS: Record<Grade, string> = {
  A: '#025c4f', // NMBU-grønn
  B: '#2ea87e', // mint-grønn
  C: '#c2963a', // amber
  D: '#c17a3a', // brun-oransje
  E: '#e05c2a', // rødoransje
  F: '#c13a5a', // rosa-rød
};

const BESTATT_COLOR = '#9ca3af';

/** Bokstav for et karaktersnitt på skalaen A=5 … F=0 (samme terskler som StatsTable). */
function letterFor(snitt: number): Grade {
  if (snitt >= 4.5) return 'A';
  if (snitt >= 3.5) return 'B';
  if (snitt >= 2.5) return 'C';
  if (snitt >= 1.5) return 'D';
  if (snitt >= 0.5) return 'E';
  return 'F';
}

function nf(v: number, dec = 0): string {
  return v.toLocaleString('nb-NO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ─── Aggregering ──────────────────────────────────────────────────────────────

interface ProgramAgg {
  /** Antall emner med tall dette året (over terskelen). */
  emner: number;
  /** Antall emner med bokstavkarakterer. */
  bokstavEmner: number;
  /** Alle kandidater, også bestått/ikke bestått. */
  kandidater: number;
  /** Kandidater med bokstavkarakter. */
  bokstav: number;
  grades: Record<Grade, number>;
  G: number;
  H: number;
  /** Karakterindeks: kandidatvektet snitt over emner med bokstavkarakter. */
  snitt: number | null;
  strykprosent: number | null;
  /** Andel bestått blant emner med bestått/ikke bestått. */
  bestattprosent: number | null;
}

const EMPTY_GRADES = (): Record<Grade, number> => ({ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 });

function aggregateProgram(p: ProgramCourses, year: number, minKandidater: number): ProgramAgg {
  const grades = EMPTY_GRADES();
  let emner = 0, bokstavEmner = 0, kandidater = 0, G = 0, H = 0;

  for (const c of p.courses) {
    const d = c.years.find((yr) => yr.year === year);
    if (!d || d.total <= 0 || d.total < minKandidater) continue;
    emner += 1;
    kandidater += d.total;
    const bokstav = d.A + d.B + d.C + d.D + d.E + d.F;
    if (bokstav > 0) bokstavEmner += 1;
    grades.A += d.A; grades.B += d.B; grades.C += d.C;
    grades.D += d.D; grades.E += d.E; grades.F += d.F;
    G += d.G; H += d.H;
  }

  const bokstav = GRADES.reduce((s, g) => s + grades[g], 0);
  // Kandidatvektet snitt = (5A + 4B + 3C + 2D + 1E + 0F) / antall bokstavkarakterer
  const snitt = bokstav > 0
    ? (grades.A * 5 + grades.B * 4 + grades.C * 3 + grades.D * 2 + grades.E * 1) / bokstav
    : null;
  const strykprosent = bokstav > 0 ? (grades.F / bokstav) * 100 : null;
  const bestattprosent = G + H > 0 ? (G / (G + H)) * 100 : null;

  return { emner, bokstavEmner, kandidater, bokstav, grades, G, H, snitt, strykprosent, bestattprosent };
}

function courseLetterTotal(d: CourseGradeYear): number {
  return d.A + d.B + d.C + d.D + d.E + d.F;
}

// ─── Trend-chip (samme som i opptaksanalysen) ────────────────────────────────

function TrendChip({ val, prev, dec = 2, unit = '' }: { val: number | null; prev: number | null; dec?: number; unit?: string }) {
  if (val === null || prev === null) return null;
  const diff = val - prev;
  const eps = dec >= 2 ? 0.005 : 0.05;
  if (Math.abs(diff) < eps) return <Minus className="w-3.5 h-3.5 inline" style={{ color: '#888' }} />;
  if (diff > 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs" style={{ color: '#2a7a55' }}>
      <TrendingUp className="w-3 h-3" />+{nf(Math.abs(diff), dec)}{unit}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs" style={{ color: '#9b3a3a' }}>
      <TrendingDown className="w-3 h-3" />−{nf(Math.abs(diff), dec)}{unit}
    </span>
  );
}

// ─── Programlenker fra opptaksdataene ────────────────────────────────────────

function programUrl(entryId: string): string | undefined {
  for (const g of LANDSAM_GROUPS) {
    const e = g.entries.find((x) => x.id === entryId);
    if (e) return e.url;
  }
  return undefined;
}

// ─── Institusjonsvelger ───────────────────────────────────────────────────────

function InstitutionPicker({
  group, selected, onChange, year, minKandidater,
}: {
  group: LandsamCourseGroup;
  selected: string[];
  onChange: (ids: string[]) => void;
  year: number;
  minKandidater: number;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
      <div className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)' }}>
        <div className="flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>
          <Filter className="w-3.5 h-3.5" /> Velg institusjoner
        </div>
        <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>
          {LEVEL_LABEL[group.level]}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        {group.programs.map((p) => {
          const active = selected.includes(p.entryId);
          const col = landsamColorFor(p.entryId);
          const agg = aggregateProgram(p, year, minKandidater);
          const url = programUrl(p.entryId);
          return (
            <button key={p.entryId} onClick={() => toggle(p.entryId)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all w-full"
              style={{
                backgroundColor: active ? col : 'var(--nmbu-beige-light)',
                color: active ? '#fff' : 'var(--nmbu-neutral-1)',
                border: `1.5px solid ${active ? col : p.isNmbu ? 'var(--nmbu-green-3)' : 'var(--nmbu-neutral-3)'}`,
                fontWeight: active ? 600 : 400,
              }}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: active ? '#fff' : col, opacity: active ? 0.9 : 1 }} />
              <div className="flex-1 min-w-0">
                <div>{p.shortName}{p.isNmbu ? ' ★' : ''}</div>
                <div style={{ fontSize: 10, opacity: 0.75, fontWeight: 400 }}>
                  {agg.emner > 0 ? `${agg.emner} emner · ${nf(agg.kandidater)} kand.` : `ingen emnetall ${year}`}
                </div>
              </div>
              {url && (
                <a href={url} target="_blank" rel="noopener noreferrer" title="Åpne programsiden"
                  onClick={(ev) => ev.stopPropagation()}
                  className="shrink-0 rounded-md p-1 hover:opacity-100"
                  style={{ opacity: 0.7, color: active ? '#fff' : 'var(--nmbu-green)' }}>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </button>
          );
        })}
      </div>
      <div className="px-3 pb-2.5 flex gap-2 flex-wrap">
        <button onClick={() => onChange(group.programs.map((p) => p.entryId))} className="text-xs hover:underline" style={{ color: 'var(--nmbu-green)' }}>Velg alle</button>
        <button onClick={() => onChange([])} className="text-xs hover:underline" style={{ color: 'var(--nmbu-neutral-2)' }}>Fjern alle</button>
      </div>
    </div>
  );
}

// ─── År og terskel ────────────────────────────────────────────────────────────

const THRESHOLDS = [0, 5, 10, 20, 50];

function YearAndThresholdPicker({
  group, year, onYear, minKandidater, onMinKandidater,
}: {
  group: LandsamCourseGroup;
  year: number;
  onYear: (y: number) => void;
  minKandidater: number;
  onMinKandidater: (n: number) => void;
}) {
  const yearHasData = (y: number) =>
    group.programs.some((p) => p.courses.some((c) => c.years.some((yr) => yr.year === y && yr.total > 0)));

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)', fontSize: 12, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>
        År og utvalg
      </div>
      <div className="p-3 flex flex-col gap-3">
        <div>
          <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginBottom: 5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>År</div>
          <div className="flex flex-wrap gap-1.5">
            {LANDSAM_COURSE_YEARS.map((y) => {
              const ok = yearHasData(y);
              return (
                <button key={y} onClick={() => ok && onYear(y)} disabled={!ok}
                  title={ok ? undefined : 'Ingen emnetall for dette året'}
                  className="px-2.5 py-1 rounded-full text-xs transition-all"
                  style={{
                    backgroundColor: year === y ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)',
                    color: year === y ? '#fff' : ok ? 'var(--nmbu-neutral-1)' : 'var(--nmbu-neutral-2)',
                    fontWeight: year === y ? 600 : 400,
                    opacity: ok ? 1 : 0.5,
                    cursor: ok ? 'pointer' : 'not-allowed',
                    textDecoration: ok ? 'none' : 'line-through',
                  }}
                >
                  {y}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginBottom: 5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <Users className="w-3 h-3" /> Minst {minKandidater} kandidater
          </div>
          <div className="flex flex-wrap gap-1.5">
            {THRESHOLDS.map((n) => (
              <button key={n} onClick={() => onMinKandidater(n)}
                title={n === 0 ? 'Vis alle emner' : `Skjul emner med færre enn ${n} kandidater`}
                className="px-2.5 py-1 rounded-full text-xs transition-all"
                style={{
                  backgroundColor: minKandidater === n ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)',
                  color: minKandidater === n ? '#fff' : 'var(--nmbu-neutral-1)',
                  fontWeight: minKandidater === n ? 600 : 400,
                }}
              >
                {n === 0 ? 'Alle' : `≥ ${n}`}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginTop: 6, lineHeight: 1.5 }}>
            Emner med få kandidater gir store utslag. Terskelen gjelder alle visningene.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mini-fordelingsstolpe ────────────────────────────────────────────────────

function MiniDistBar({ d, width = 130 }: { d: CourseGradeYear; width?: number | string }) {
  const bokstav = courseLetterTotal(d);
  if (bokstav === 0) {
    const bestatt = d.G + d.H;
    if (bestatt === 0) return <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>;
    const pct = (d.G / bestatt) * 100;
    return (
      <div className="flex rounded-sm overflow-hidden" style={{ width, height: 10, backgroundColor: 'var(--nmbu-neutral-3)' }}
        title={`Bestått ${d.G} · ikke bestått ${d.H}`}>
        <div style={{ width: `${pct}%`, backgroundColor: BESTATT_COLOR }} />
      </div>
    );
  }
  return (
    <div className="flex rounded-sm overflow-hidden" style={{ width, height: 10 }}>
      {GRADES.map((g) => {
        const n = d[g];
        if (n === 0) return null;
        return (
          <div key={g} title={`${g}: ${n} (${nf((n / bokstav) * 100, 1)} %)`}
            style={{ width: `${(n / bokstav) * 100}%`, backgroundColor: GRADE_COLORS[g] }} />
        );
      })}
    </div>
  );
}

// ─── Fane 1: Karakterindeks ───────────────────────────────────────────────────

function KarakterindeksView({
  programs, year, minKandidater,
}: {
  programs: ProgramCourses[];
  year: number;
  minKandidater: number;
}) {
  const prevYear = (() => {
    const i = LANDSAM_COURSE_YEARS.indexOf(year);
    return i > 0 ? LANDSAM_COURSE_YEARS[i - 1] : null;
  })();

  const rows = programs
    .map((p) => ({
      p,
      agg: aggregateProgram(p, year, minKandidater),
      prev: prevYear ? aggregateProgram(p, prevYear, minKandidater) : null,
    }))
    .filter((r) => r.agg.snitt !== null)
    .sort((a, b) => (b.agg.snitt ?? 0) - (a.agg.snitt ?? 0));

  // Trendlinje: karakterindeks per år
  const trendData = LANDSAM_COURSE_YEARS.map((y) => {
    const r: Record<string, number | string> = { year: String(y) };
    programs.forEach((p) => {
      const a = aggregateProgram(p, y, minKandidater);
      if (a.snitt !== null) r[p.entryId] = Number(a.snitt.toFixed(2));
    });
    return r;
  }).filter((r) => Object.keys(r).length > 1);

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-48" style={{ color: 'var(--nmbu-neutral-2)', fontSize: 13 }}>
        Ingen emner med bokstavkarakterer for {year} med denne terskelen.
      </div>
    );
  }

  const lastIdx = trendData.length - 1;

  return (
    <div className="space-y-7">
      <section>
        <h3 className="text-base mb-4" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
          1. Karakterindeks per program · {year}
        </h3>
        <div className="flex flex-col gap-3">
          {rows.map(({ p, agg, prev }) => {
            const col = landsamColorFor(p.entryId);
            const snitt = agg.snitt!;
            return (
              <div key={p.entryId} className="flex items-center gap-3">
                <div style={{ width: 110, fontSize: 12, fontWeight: 600, color: 'var(--nmbu-neutral)' }} className="shrink-0 text-right">
                  {p.shortName}
                  {p.isNmbu && (
                    <span className="ml-1 px-1.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>NMBU</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="rounded-sm" style={{ backgroundColor: 'var(--nmbu-beige-light)', height: 22, position: 'relative' }}>
                    <div className="rounded-sm" style={{ width: `${Math.max(2, (snitt / 5) * 100)}%`, height: '100%', backgroundColor: col, transition: 'width 0.2s' }} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginTop: 3 }}>
                    <span>
                      Strykprosent{' '}
                      <span style={{ fontWeight: 700, color: (agg.strykprosent ?? 0) > 20 ? '#9b3a3a' : 'var(--nmbu-neutral-1)' }}>
                        {agg.strykprosent !== null ? `${nf(agg.strykprosent, 1)} %` : '–'}
                      </span>
                    </span>
                    <span>· {agg.bokstavEmner} emner med bokstavkarakter · {nf(agg.bokstav)} karakterer</span>
                    {prev?.snitt != null && (
                      <span className="inline-flex items-center gap-1">
                        · <TrendChip val={snitt} prev={prev.snitt} /> vs. {prevYear}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right" style={{ width: 96 }}>
                  <span className="inline-block px-2 py-1 rounded" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 600, fontSize: 12 }}>
                    {nf(snitt, 2)} ({letterFor(snitt)})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs mt-4 leading-relaxed" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Karakterindeksen er et kandidatvektet snitt over alle emner med bokstavkarakter (A=5 … F=0).
          Emner med bestått / ikke bestått teller ikke med. Stolpen viser snittet på skalaen 0–5.
        </p>
      </section>

      {trendData.length > 1 && (
        <section>
          <h3 className="text-base mb-4" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
            2. Utvikling i karakterindeks
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData} margin={{ top: 12, right: 110, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-neutral-3)" />
              <XAxis dataKey="year" tick={{ fill: '#555', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                formatter={(v: number, key: string) => {
                  const p = programs.find((x) => x.entryId === key);
                  return [`${nf(v, 2)} (${letterFor(v)})`, p?.shortName ?? key];
                }}
                contentStyle={{ border: '1px solid var(--nmbu-green-3)', borderRadius: 8, fontSize: 12 }}
              />
              {programs.map((p) => {
                const col = landsamColorFor(p.entryId);
                return (
                  <Line key={p.entryId} type="monotone" dataKey={p.entryId}
                    stroke={col} strokeWidth={2.5} connectNulls
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: col }}
                    activeDot={{ r: 6 }}
                    label={(props: { x?: number; y?: number; index?: number; value?: number }) => {
                      const k = `lbl-${p.entryId}-${props.index ?? 0}`;
                      if (props.index !== lastIdx || props.value == null) return <g key={k} />;
                      return (
                        <text key={k} x={(props.x ?? 0) + 8} y={(props.y ?? 0) + 4} fontSize={11} fontWeight={700} fill={col} textAnchor="start">
                          {p.shortName}
                        </text>
                      );
                    }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
}

// ─── Fane 2: Karakterfordeling ────────────────────────────────────────────────

function GradeLegend() {
  return (
    <div className="flex flex-wrap gap-3 mb-4 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
      {GRADES.map((g) => (
        <span key={g} className="flex items-center gap-1.5">
          <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: GRADE_COLORS[g], display: 'inline-block', flexShrink: 0 }} />
          {g}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: BESTATT_COLOR, display: 'inline-block', flexShrink: 0 }} />
        Bestått / ikke bestått
      </span>
    </div>
  );
}

function KarakterfordelingView({
  programs, year, minKandidater,
}: {
  programs: ProgramCourses[];
  year: number;
  minKandidater: number;
}) {
  const rows = programs
    .map((p) => ({ p, agg: aggregateProgram(p, year, minKandidater) }))
    .filter((r) => r.agg.bokstav > 0 || r.agg.G + r.agg.H > 0);

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-48" style={{ color: 'var(--nmbu-neutral-2)', fontSize: 13 }}>
        Ingen emnetall for {year} med denne terskelen.
      </div>
    );
  }

  return (
    <div>
      <GradeLegend />
      <div className="flex flex-col gap-5">
        {rows.map(({ p, agg }) => {
          const bokstav = agg.bokstav;
          const bestatt = agg.G + agg.H;
          return (
            <div key={p.entryId}>
              <div className="flex items-center justify-between gap-3 flex-wrap mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: landsamColorFor(p.entryId) }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>{p.shortName}</span>
                  {p.isNmbu && (
                    <span className="px-1.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>NMBU</span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
                    · {p.dbhProgramnavn}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
                  {agg.emner} emner · {nf(agg.kandidater)} kandidater
                  {agg.snitt !== null && <> · snitt <strong style={{ color: 'var(--nmbu-neutral-1)' }}>{nf(agg.snitt, 2)} ({letterFor(agg.snitt)})</strong></>}
                </div>
              </div>

              {bokstav > 0 ? (
                <>
                  <div className="flex rounded-md overflow-hidden" style={{ height: 30 }}>
                    {GRADES.map((g) => {
                      const n = agg.grades[g];
                      if (n === 0) return null;
                      const pct = (n / bokstav) * 100;
                      return (
                        <div key={g}
                          title={`${g}: ${nf(n)} av ${nf(bokstav)} (${nf(pct, 1)} %)`}
                          className="flex items-center justify-center"
                          style={{ width: `${pct}%`, backgroundColor: GRADE_COLORS[g], color: '#fff', fontSize: 10, fontWeight: 700 }}>
                          {pct >= 7 ? `${g} ${nf(pct, 0)}%` : ''}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginTop: 4 }}>
                    {nf(bokstav)} bokstavkarakterer i {agg.bokstavEmner} emner · stryk {agg.strykprosent !== null ? `${nf(agg.strykprosent, 1)} %` : '–'}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
                  Ingen emner med bokstavkarakter dette året.
                </div>
              )}

              {bestatt > 0 && (
                <div className="flex items-center gap-2 mt-2" style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: BESTATT_COLOR, display: 'inline-block', flexShrink: 0 }} />
                  I tillegg {nf(bestatt)} resultater med bestått / ikke bestått ·{' '}
                  <strong style={{ color: 'var(--nmbu-neutral-1)' }}>
                    {agg.bestattprosent !== null ? `${nf(agg.bestattprosent, 1)} %` : '–'} bestått
                  </strong>{' '}
                  (holdt utenfor fordelingen over)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DBH-skjerming og fordelingspanel ────────────────────────────────────────

/**
 * DBH skjermer celler med 1–2 kandidater (de vises som 0). Generatoren legger
 * antallet skjermede kandidater i `skjult`, og hele emnets fordeling – alle
 * studenter ved institusjonen, ikke bare programmets – i `emnenivaa`.
 * Begge feltene er valgfrie: eldre datafiler har dem ikke.
 */
type CourseGradeYearX = CourseGradeYear & { skjult?: number };
type CourseStatsX = CourseStats & { emnenivaa?: CourseGradeYearX[] };

function skjultOf(d: CourseGradeYearX): number {
  return typeof d.skjult === 'number' && d.skjult > 0 ? d.skjult : 0;
}

/** Nedre og øvre grense for reell strykprosent når DBH har skjermet kandidater. */
function strykSpenn(d: CourseGradeYearX): { lav: number; hoy: number } | null {
  const skjult = skjultOf(d);
  if (skjult === 0) return null;
  const bokstav = courseLetterTotal(d);
  if (bokstav + skjult === 0) return null;
  return {
    lav: bokstav > 0 ? (d.F / bokstav) * 100 : 0,
    hoy: ((d.F + skjult) / (bokstav + skjult)) * 100,
  };
}

/** Strykprosent som tekst: «≥ 4,2 %» når noe er skjermet, ellers «4,2 %». */
function strykTekst(d: CourseGradeYearX): string | null {
  if (courseLetterTotal(d) > 0 && d.strykprosent !== null) {
    return `${skjultOf(d) > 0 ? '≥ ' : ''}${nf(d.strykprosent, 1)} %`;
  }
  const bestatt = d.G + d.H;
  if (bestatt > 0) return `${nf((d.H / bestatt) * 100, 1)} %`;
  return null;
}

function strykTittel(d: CourseGradeYearX): string | undefined {
  const spenn = strykSpenn(d);
  if (!spenn) return undefined;
  return `${nf(skjultOf(d))} ${skjultOf(d) === 1 ? 'kandidat' : 'kandidater'} er skjermet av DBH, så reell strykprosent ligger mellom ${nf(spenn.lav, 1)} % og ${nf(spenn.hoy, 1)} %.`;
}

const SKJULT_AMBER = '#c2963a';

function SkjultPrikk() {
  return (
    <span aria-hidden="true"
      style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: SKJULT_AMBER, display: 'inline-block', flexShrink: 0 }} />
  );
}

/** Strykprosenten slik den vises i tabellene, med «≥» og amber prikk når DBH har skjermet. */
function StrykVerdi({ d }: { d: CourseGradeYearX }) {
  const tekst = strykTekst(d);
  if (tekst === null) return <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>;
  const bokstav = courseLetterTotal(d);
  const skjult = skjultOf(d);
  if (bokstav === 0) return <span style={{ color: 'var(--nmbu-neutral-2)' }}>{tekst}</span>;
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap" title={strykTittel(d)}
      style={{ fontWeight: 600, color: d.strykprosent !== null && d.strykprosent > 20 ? '#9b3a3a' : 'var(--nmbu-neutral-1)' }}>
      {tekst}
      {skjult > 0 && <SkjultPrikk />}
    </span>
  );
}

/** A–F med antall og andel, og bestått / ikke bestått når emnet har det. */
function FordelingTabell({ d }: { d: CourseGradeYearX }) {
  const bokstav = courseLetterTotal(d);
  const bestatt = d.G + d.H;
  const celler: { key: string; label: string; n: number; pct: number | null; color: string }[] =
    GRADES.map((g) => ({
      key: g, label: g, n: d[g],
      pct: bokstav > 0 ? (d[g] / bokstav) * 100 : null,
      color: GRADE_COLORS[g],
    }));
  if (bestatt > 0) {
    celler.push({ key: 'G', label: 'Bestått',      n: d.G, pct: (d.G / bestatt) * 100, color: BESTATT_COLOR });
    celler.push({ key: 'H', label: 'Ikke bestått', n: d.H, pct: (d.H / bestatt) * 100, color: BESTATT_COLOR });
  }
  return (
    <table className="border-collapse" style={{ fontSize: 11 }}>
      <tbody>
        <tr>
          <th scope="row" className="pr-3 py-1 text-left whitespace-nowrap"
            style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Karakter</th>
          {celler.map((cell) => (
            <td key={cell.key} className="px-2 py-1 text-center whitespace-nowrap">
              <span className="inline-flex items-center gap-1" style={{ fontWeight: 700, color: 'var(--nmbu-neutral-1)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: cell.color, display: 'inline-block', flexShrink: 0 }} />
                {cell.label}
              </span>
            </td>
          ))}
        </tr>
        <tr style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
          <th scope="row" className="pr-3 py-1 text-left whitespace-nowrap"
            style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Kandidater</th>
          {celler.map((cell) => (
            <td key={cell.key} className="px-2 py-1 text-center whitespace-nowrap"
              style={{ color: cell.n === 0 ? 'var(--nmbu-neutral-3)' : 'var(--nmbu-neutral-1)', fontWeight: 600 }}>
              {nf(cell.n)}
            </td>
          ))}
        </tr>
        <tr>
          <th scope="row" className="pr-3 py-1 text-left whitespace-nowrap"
            style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Andel</th>
          {celler.map((cell) => (
            <td key={cell.key} className="px-2 py-1 text-center whitespace-nowrap" style={{ color: 'var(--nmbu-neutral-2)' }}>
              {cell.pct === null ? '–' : `${nf(cell.pct, 1)} %`}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

/** Én fordeling med stolpe, tabell, nøkkeltall og eventuell skjermingsnote. */
function FordelingBlokk({ tittel, d, undertittel }: { tittel: string; d: CourseGradeYearX; undertittel?: string }) {
  const bokstav = courseLetterTotal(d);
  const bestatt = d.G + d.H;
  const skjult = skjultOf(d);
  const spenn = strykSpenn(d);
  return (
    <div>
      <h5 className="text-sm mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>{tittel}</h5>
      {undertittel && (
        <p className="mb-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{undertittel}</p>
      )}
      <div className="mb-2" style={{ maxWidth: 520 }}>
        <MiniDistBar d={d} width="100%" />
      </div>
      <div className="overflow-x-auto">
        <FordelingTabell d={d} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
        <span>
          Kandidater <strong style={{ color: 'var(--nmbu-neutral-1)' }}>{nf(d.total)}</strong>
          {bokstav > 0 && bestatt > 0 ? ` (${nf(bokstav)} med bokstavkarakter)` : ''}
        </span>
        <span>
          Snitt{' '}
          <strong style={{ color: 'var(--nmbu-neutral-1)' }}>
            {d.snitt !== null ? `${nf(d.snitt, 2)} (${letterFor(d.snitt)})` : '–'}
          </strong>
        </span>
        <span className="inline-flex items-center gap-1">
          Stryk <strong style={{ color: 'var(--nmbu-neutral-1)' }}>{strykTekst(d) ?? '–'}</strong>
        </span>
        {skjult > 0 && (
          <span className="inline-flex items-center gap-1">
            <SkjultPrikk />Skjermet <strong style={{ color: 'var(--nmbu-neutral-1)' }}>{nf(skjult)}</strong>
          </span>
        )}
      </div>
      {bokstav > 0 && bestatt > 0 && (
        <p className="mt-1" style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>
          Andelen for A–F er av bokstavkarakterene, andelen for bestått / ikke bestått av de to kategoriene.
        </p>
      )}
      {spenn && (
        <div className="mt-2 flex items-start gap-2 rounded-lg px-3 py-2"
          style={{ backgroundColor: '#fdf4e0', border: `1px solid ${SKJULT_AMBER}`, color: '#7a5a14', fontSize: 11 }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            {nf(skjult)} {skjult === 1 ? 'kandidat' : 'kandidater'} er skjermet av DBH (celler med 1–2 kandidater vises som 0).
            Reell strykprosent ligger mellom {nf(spenn.lav, 1)} % og {nf(spenn.hoy, 1)} %.
          </span>
        </div>
      )}
    </div>
  );
}

/** Kandidater, snitt og stryk per år – programnivå, og emnenivå når det finnes. */
function EmneAarTabell({
  years, emnenivaa, valgtAar,
}: {
  years: CourseGradeYearX[];
  emnenivaa?: CourseGradeYearX[];
  valgtAar: number;
}) {
  const harEmnenivaa = !!emnenivaa && emnenivaa.length > 0;
  const rader = [...years].sort((a, b) => a.year - b.year);
  if (rader.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse" style={{ fontSize: 11 }}>
        <thead>
          <tr style={{ color: 'var(--nmbu-neutral-2)' }}>
            <th className="px-2 py-1" />
            <th className="px-2 py-1 text-center whitespace-nowrap" colSpan={3}
              style={{ fontWeight: 600, borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
              Programmets studenter
            </th>
            {harEmnenivaa && (
              <th className="px-2 py-1 text-center whitespace-nowrap" colSpan={3}
                style={{ fontWeight: 600, borderBottom: '1px solid var(--nmbu-neutral-3)', borderLeft: '1px solid var(--nmbu-neutral-3)' }}>
                Alle studenter på emnet
              </th>
            )}
          </tr>
          <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
            <th className="px-2 py-1 text-left whitespace-nowrap" style={{ fontWeight: 600 }}>År</th>
            <th className="px-2 py-1 text-center whitespace-nowrap" style={{ fontWeight: 600 }}>Kand.</th>
            <th className="px-2 py-1 text-center whitespace-nowrap" style={{ fontWeight: 600 }}>Snitt</th>
            <th className="px-2 py-1 text-center whitespace-nowrap" style={{ fontWeight: 600 }}>Stryk</th>
            {harEmnenivaa && (
              <>
                <th className="px-2 py-1 text-center whitespace-nowrap" style={{ fontWeight: 600, borderLeft: '1px solid var(--nmbu-neutral-3)' }}>Kand.</th>
                <th className="px-2 py-1 text-center whitespace-nowrap" style={{ fontWeight: 600 }}>Snitt</th>
                <th className="px-2 py-1 text-center whitespace-nowrap" style={{ fontWeight: 600 }}>Stryk</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rader.map((d) => {
            const e = harEmnenivaa ? emnenivaa!.find((x) => x.year === d.year) : undefined;
            const aktiv = d.year === valgtAar;
            return (
              <tr key={d.year} style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: aktiv ? 'var(--nmbu-green-4)' : 'transparent' }}>
                <td className="px-2 py-1 whitespace-nowrap" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: aktiv ? 700 : 600 }}>{d.year}</td>
                <td className="px-2 py-1 text-center" style={{ color: 'var(--nmbu-neutral-1)' }}>{nf(d.total)}</td>
                <td className="px-2 py-1 text-center whitespace-nowrap" style={{ color: 'var(--nmbu-neutral-1)' }}>
                  {d.snitt !== null ? `${nf(d.snitt, 2)} (${letterFor(d.snitt)})` : '–'}
                </td>
                <td className="px-2 py-1 text-center"><StrykVerdi d={d} /></td>
                {harEmnenivaa && (
                  <>
                    <td className="px-2 py-1 text-center" style={{ color: 'var(--nmbu-neutral-1)', borderLeft: '1px solid var(--nmbu-neutral-3)' }}>
                      {e ? nf(e.total) : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                    </td>
                    <td className="px-2 py-1 text-center whitespace-nowrap" style={{ color: 'var(--nmbu-neutral-1)' }}>
                      {e && e.snitt !== null ? `${nf(e.snitt, 2)} (${letterFor(e.snitt)})` : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {e ? <StrykVerdi d={e} /> : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Detaljpanelet under en emnerad. Rendres bare for den raden som er åpen. */
function EmneDetaljer({ c, d, year }: { c: CourseStatsX; d: CourseGradeYearX; year: number }) {
  const emnenivaa = c.emnenivaa;
  const e = emnenivaa?.find((x) => x.year === year);
  return (
    <div className="px-4 py-4" style={{ backgroundColor: 'var(--nmbu-beige-light)', borderTop: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex flex-col gap-5">
        <FordelingBlokk tittel={`Programmets studenter i ${year}`} d={d} />
        {e && (
          <FordelingBlokk
            tittel={`Alle studenter på emnet i ${year}`}
            d={e}
            undertittel="Tilsvarer tallene på karakterweb.no"
          />
        )}
        <div>
          <h5 className="text-sm mb-2" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
            År for år
          </h5>
          <EmneAarTabell years={c.years} emnenivaa={emnenivaa} valgtAar={year} />
        </div>
      </div>
    </div>
  );
}

// ─── Fane 3: Emner ────────────────────────────────────────────────────────────

type CourseSortKey = 'emnekode' | 'emnenavn' | 'studiepoeng' | 'kandidater' | 'snitt' | 'stryk';

function EmneTable({
  program, year, minKandidater,
}: {
  program: ProgramCourses;
  year: number;
  minKandidater: number;
}) {
  const [sortKey, setSortKey] = useState<CourseSortKey>('kandidater');
  const [sortAsc, setSortAsc] = useState(false);
  /** Emnekoden til raden som er åpen – bare én om gangen. */
  const [openKode, setOpenKode] = useState<string | null>(null);

  const rows = program.courses
    .map((c) => {
      const d = c.years.find((yr) => yr.year === year);
      return d ? { c, d } : null;
    })
    .filter((r): r is { c: CourseStatsX; d: CourseGradeYearX } => r !== null)
    .filter((r) => r.d.total > 0 && r.d.total >= minKandidater);

  const sorted = [...rows].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    switch (sortKey) {
      case 'emnekode':   return dir * a.c.emnekode.localeCompare(b.c.emnekode, 'nb');
      case 'emnenavn':   return dir * (a.c.emnenavn ?? a.c.emnekode).localeCompare(b.c.emnenavn ?? b.c.emnekode, 'nb');
      case 'studiepoeng': {
        const av = a.c.studiepoeng, bv = b.c.studiepoeng;
        if (av === null && bv === null) return 0;
        if (av === null) return 1;
        if (bv === null) return -1;
        return dir * (av - bv);
      }
      case 'kandidater': return dir * (a.d.total - b.d.total);
      case 'snitt': {
        const av = a.d.snitt, bv = b.d.snitt;
        if (av === null && bv === null) return 0;
        if (av === null) return 1;
        if (bv === null) return -1;
        return dir * (av - bv);
      }
      case 'stryk': {
        const av = a.d.strykprosent, bv = b.d.strykprosent;
        if (av === null && bv === null) return 0;
        if (av === null) return 1;
        if (bv === null) return -1;
        return dir * (av - bv);
      }
      default: return 0;
    }
  });

  if (sorted.length === 0) {
    return <p className="text-sm text-center py-8" style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen emner for {program.shortName} i {year} med denne terskelen.</p>;
  }

  const cols: { id: CourseSortKey | 'fordeling'; label: string; align: 'left' | 'center' | 'right' }[] = [
    { id: 'emnekode',    label: 'Emnekode',    align: 'left' },
    { id: 'emnenavn',    label: 'Emnenavn',    align: 'left' },
    { id: 'studiepoeng', label: 'Stp.',        align: 'center' },
    { id: 'kandidater',  label: 'Kandidater',  align: 'center' },
    { id: 'snitt',       label: 'Snitt',       align: 'center' },
    { id: 'stryk',       label: 'Stryk %',     align: 'center' },
    { id: 'fordeling',   label: 'Fordeling',   align: 'left' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
            <th className="px-2 py-2.5" style={{ width: 28 }}><span className="sr-only">Vis detaljer</span></th>
            {cols.map((col) => {
              const sortable = col.id !== 'fordeling';
              return (
                <th key={col.id}
                  className={`px-3 py-2.5 text-${col.align} whitespace-nowrap ${sortable ? 'cursor-pointer select-none hover:opacity-70' : ''}`}
                  style={{ color: sortKey === col.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', fontWeight: 600 }}
                  onClick={() => {
                    if (!sortable) return;
                    const k = col.id as CourseSortKey;
                    if (sortKey === k) setSortAsc((v) => !v);
                    else { setSortKey(k); setSortAsc(false); }
                  }}
                >
                  {col.label} {sortable && sortKey === col.id ? (sortAsc ? '↑' : '↓') : ''}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ c, d }, i) => {
            const bokstav = courseLetterTotal(d);
            const bestattOnly = bokstav === 0 && d.G + d.H > 0;
            const apen = openKode === c.emnekode;
            const toggle = () => setOpenKode((v) => (v === c.emnekode ? null : c.emnekode));
            return (
              <Fragment key={c.emnekode}>
              <tr
                onClick={toggle}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); }
                }}
                tabIndex={0}
                role="button"
                aria-expanded={apen}
                className="cursor-pointer"
                title={apen ? 'Skjul fordelingen' : 'Vis fordelingen'}
                style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: apen ? 'var(--nmbu-green-4)' : i % 2 === 0 ? '#fff' : 'var(--nmbu-beige-light)' }}>
                <td className="px-2 py-2.5 align-middle">
                  {apen
                    ? <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--nmbu-green)' }} />
                    : <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--nmbu-neutral-2)' }} />}
                </td>
                <td className="px-3 py-2.5 font-mono whitespace-nowrap" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 600 }}>{c.emnekode}</td>
                <td className="px-3 py-2.5">
                  {c.emnenavn
                    ? <span style={{ color: 'var(--nmbu-neutral)' }}>{c.emnenavn}</span>
                    : <span title="Emnet mangler navn i DBH" style={{ color: 'var(--nmbu-neutral-2)', fontStyle: 'italic' }}>{c.emnekode}</span>}
                </td>
                <td className="px-3 py-2.5 text-center" style={{ color: c.studiepoeng === null ? 'var(--nmbu-neutral-3)' : 'var(--nmbu-neutral-1)' }}>
                  {c.studiepoeng === null ? '–' : nf(c.studiepoeng, 0)}
                </td>
                <td className="px-3 py-2.5 text-center" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 600 }}>{nf(d.total)}</td>
                <td className="px-3 py-2.5 text-center whitespace-nowrap">
                  {d.snitt !== null ? (
                    <span className="inline-block px-2 py-1 rounded" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>
                      {nf(d.snitt, 2)} ({letterFor(d.snitt)})
                    </span>
                  ) : bestattOnly ? (
                    <span style={{ color: 'var(--nmbu-neutral-2)' }}>
                      bestått {d.bestattprosent !== null ? nf(d.bestattprosent, 1) : '–'} %
                    </span>
                  ) : (
                    <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {bestattOnly ? (
                    <span style={{ color: 'var(--nmbu-neutral-2)' }}>
                      {d.H > 0 ? `${nf((d.H / (d.G + d.H)) * 100, 1)} %` : '0,0 %'}
                    </span>
                  ) : <StrykVerdi d={d} />}
                </td>
                <td className="px-3 py-2.5"><MiniDistBar d={d} /></td>
              </tr>
              {apen && (
                <tr style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
                  <td colSpan={cols.length + 1} className="p-0">
                    <EmneDetaljer c={c} d={d} year={year} />
                  </td>
                </tr>
              )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Fane 4: Sammenlign emne ──────────────────────────────────────────────────

/** Summen av karaktertallene for de emnekodene som representerer ett fag. */
interface CourseTypeAgg {
  /** De emnene som faktisk hadde tall dette året (over terskelen). */
  parts: { c: CourseStats; d: CourseGradeYear }[];
  /** Emnekoder som er kartlagt, men som mangler tall dette året. */
  manglerKoder: string[];
  studiepoeng: number | null;
  kandidater: number;
  bokstav: number;
  grades: Record<Grade, number>;
  G: number;
  H: number;
  snitt: number | null;
  strykprosent: number | null;
  bestattprosent: number | null;
}

function aggregateCourseType(
  p: ProgramCourses, link: CourseTypeLink, year: number, minKandidater: number,
): CourseTypeAgg {
  const grades = EMPTY_GRADES();
  const parts: { c: CourseStats; d: CourseGradeYear }[] = [];
  const manglerKoder: string[] = [];
  let kandidater = 0, G = 0, H = 0, studiepoeng = 0, harStudiepoeng = false;

  for (const kode of link.emnekoder) {
    const c = p.courses.find((x) => x.emnekode === kode);
    const d = c?.years.find((yr) => yr.year === year);
    if (!c || !d || d.total <= 0 || d.total < minKandidater) {
      manglerKoder.push(kode);
      continue;
    }
    parts.push({ c, d });
    kandidater += d.total;
    if (c.studiepoeng !== null) { studiepoeng += c.studiepoeng; harStudiepoeng = true; }
    grades.A += d.A; grades.B += d.B; grades.C += d.C;
    grades.D += d.D; grades.E += d.E; grades.F += d.F;
    G += d.G; H += d.H;
  }

  const bokstav = GRADES.reduce((s, g) => s + grades[g], 0);
  const snitt = bokstav > 0
    ? (grades.A * 5 + grades.B * 4 + grades.C * 3 + grades.D * 2 + grades.E * 1) / bokstav
    : null;

  return {
    parts, manglerKoder,
    studiepoeng: harStudiepoeng ? studiepoeng : null,
    kandidater, bokstav, grades, G, H, snitt,
    strykprosent: bokstav > 0 ? (grades.F / bokstav) * 100 : null,
    bestattprosent: G + H > 0 ? (G / (G + H)) * 100 : null,
  };
}

/** Fagvelger: emnetyper gruppert på kategori, som chips. */
function CourseTypePicker({
  courseTypes, selected, onSelect,
}: {
  courseTypes: CourseType[];
  selected: CourseType;
  onSelect: (id: string) => void;
}) {
  const kategorier: { kategori: string; typer: CourseType[] }[] = [];
  for (const ct of courseTypes) {
    const k = ct.kategori ?? 'Øvrige fag';
    const bolk = kategorier.find((x) => x.kategori === k);
    if (bolk) bolk.typer.push(ct);
    else kategorier.push({ kategori: k, typer: [ct] });
  }

  return (
    <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
      <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)', fontSize: 12, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>
        Velg fag
      </div>
      <div className="p-3 flex flex-col gap-3">
        {kategorier.map((bolk) => (
          <div key={bolk.kategori}>
            <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginBottom: 5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {bolk.kategori}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {bolk.typer.map((ct) => {
                const active = ct.id === selected.id;
                return (
                  <button key={ct.id} onClick={() => onSelect(ct.id)}
                    className="px-3 py-1 rounded-full text-xs transition-all"
                    style={{
                      backgroundColor: active ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)',
                      color: active ? '#fff' : 'var(--nmbu-neutral-1)',
                      border: `1.5px solid ${active ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)'}`,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {ct.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {(selected.desc || selected.note) && (
        <div className="px-4 py-3 flex items-start gap-2" style={{ borderTop: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--nmbu-green)' }} />
          <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)', lineHeight: 1.6 }}>
            {selected.desc && <div>{selected.desc}</div>}
            {selected.note && (
              <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginTop: selected.desc ? 4 : 0 }}>
                {selected.note}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SammenlignEmneView({
  courseType, programs, year, minKandidater,
}: {
  courseType: CourseType;
  programs: ProgramCourses[];
  year: number;
  minKandidater: number;
}) {
  const rader = programs.map((p) => {
    const link = courseType.links.find((l) => l.entryId === p.entryId);
    return { p, link, agg: link ? aggregateCourseType(p, link, year, minKandidater) : null };
  });

  const medTall = rader
    .filter((r) => r.agg !== null && r.agg.snitt !== null)
    .sort((a, b) => (b.agg!.snitt ?? 0) - (a.agg!.snitt ?? 0));

  const utenKobling = rader.filter((r) => !r.link);

  return (
    <div className="space-y-6">

      {/* Sammenligningsstripe: snitt per program */}
      {medTall.length > 0 && (
        <section>
          <h3 className="text-base mb-3" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
            Snitt i {courseType.label.toLowerCase()} · {year}
          </h3>
          <div className="flex flex-col gap-2">
            {medTall.map(({ p, agg }) => {
              const col = landsamColorFor(p.entryId);
              const snitt = agg!.snitt!;
              return (
                <div key={p.entryId} className="flex items-center gap-3">
                  <div style={{ width: 110, fontSize: 12, fontWeight: 600, color: 'var(--nmbu-neutral)' }} className="shrink-0 text-right">
                    {p.shortName}
                    {p.isNmbu && (
                      <span className="ml-1 px-1.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>NMBU</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="rounded-sm" style={{ backgroundColor: 'var(--nmbu-beige-light)', height: 16 }}>
                      <div className="rounded-sm" style={{ width: `${Math.max(2, (snitt / 5) * 100)}%`, height: '100%', backgroundColor: col, transition: 'width 0.2s' }} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right" style={{ width: 96 }}>
                    <span className="inline-block px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 600, fontSize: 12 }}>
                      {nf(snitt, 2)} ({letterFor(snitt)})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <GradeLegend />

      {/* Ett kort per program */}
      <div className="flex flex-col gap-4">
        {rader.map(({ p, link, agg }) => {
          const col = landsamColorFor(p.entryId);

          if (!link || !agg) {
            return (
              <div key={p.entryId} className="rounded-xl px-4 py-3"
                style={{ border: '1px dashed var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col, opacity: 0.4 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-neutral-2)' }}>
                    {p.shortName}{p.isNmbu ? ' ★' : ''}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>· {p.dbhProgramnavn}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
                  Ingen tilsvarende emne kartlagt
                </div>
              </div>
            );
          }

          const bokstav = agg.bokstav;
          const bestatt = agg.G + agg.H;

          return (
            <div key={p.entryId} className="rounded-xl px-4 py-3"
              style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', borderLeft: `4px solid ${col}` }}>

              <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: p.isNmbu ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral)' }}>
                      {p.shortName}{p.isNmbu ? ' ★' : ''}
                    </span>
                    {p.isNmbu && (
                      <span className="px-1.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>NMBU</span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>· {p.dbhProgramnavn}</span>
                  </div>
                  <div className="mt-1.5 flex flex-col gap-0.5">
                    {agg.parts.map(({ c }) => (
                      <div key={c.emnekode} style={{ fontSize: 11, color: 'var(--nmbu-neutral-1)' }}>
                        <span className="font-mono" style={{ fontWeight: 600 }}>{c.emnekode}</span>
                        {' · '}{c.emnenavn ?? c.emnekode}
                        {c.studiepoeng !== null && <span style={{ color: 'var(--nmbu-neutral-2)' }}> · {nf(c.studiepoeng, 0)} stp.</span>}
                      </div>
                    ))}
                    {agg.parts.length === 0 && (
                      <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
                        Kartlagt til {link.emnekoder.join(', ')}, men uten tall for {year} over terskelen.
                      </div>
                    )}
                    {agg.parts.length > 0 && agg.manglerKoder.length > 0 && (
                      <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>
                        Uten tall for {year}: {agg.manglerKoder.join(', ')}
                      </div>
                    )}
                    {link.merknad && (
                      <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', fontStyle: 'italic' }}>
                        {link.merknad}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex gap-5 flex-wrap" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
                  <div>
                    <div style={{ fontSize: 10, marginBottom: 2 }}>Kandidater</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--nmbu-neutral)' }}>{nf(agg.kandidater)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, marginBottom: 2 }}>Snitt</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--nmbu-neutral)' }}>
                      {agg.snitt !== null ? `${nf(agg.snitt, 2)} (${letterFor(agg.snitt)})` : '–'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, marginBottom: 2 }}>Stryk</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: (agg.strykprosent ?? 0) > 20 ? '#9b3a3a' : 'var(--nmbu-neutral)' }}>
                      {agg.strykprosent !== null ? `${nf(agg.strykprosent, 1)} %` : '–'}
                    </div>
                  </div>
                  {agg.studiepoeng !== null && (
                    <div>
                      <div style={{ fontSize: 10, marginBottom: 2 }}>Studiepoeng</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--nmbu-neutral)' }}>{nf(agg.studiepoeng, 0)}</div>
                    </div>
                  )}
                </div>
              </div>

              {bokstav > 0 ? (
                <>
                  <div className="flex rounded-md overflow-hidden" style={{ height: 26 }}>
                    {GRADES.map((g) => {
                      const n = agg.grades[g];
                      if (n === 0) return null;
                      const pct = (n / bokstav) * 100;
                      return (
                        <div key={g}
                          title={`${g}: ${nf(n)} av ${nf(bokstav)} (${nf(pct, 1)} %)`}
                          className="flex items-center justify-center"
                          style={{ width: `${pct}%`, backgroundColor: GRADE_COLORS[g], color: '#fff', fontSize: 10, fontWeight: 700 }}>
                          {pct >= 8 ? `${g} ${nf(pct, 0)}%` : ''}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginTop: 4 }}>
                    {nf(bokstav)} bokstavkarakterer i {agg.parts.length} {agg.parts.length === 1 ? 'emne' : 'emner'}
                  </div>
                </>
              ) : agg.parts.length > 0 && bestatt === 0 ? (
                <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
                  Ingen bokstavkarakterer i {year}.
                </div>
              ) : null}

              {bestatt > 0 && (
                <div className="flex items-center gap-2 mt-2" style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: BESTATT_COLOR, display: 'inline-block', flexShrink: 0 }} />
                  {nf(bestatt)} resultater med bestått / ikke bestått ·{' '}
                  <strong style={{ color: 'var(--nmbu-neutral-1)' }}>
                    {agg.bestattprosent !== null ? `${nf(agg.bestattprosent, 1)} %` : '–'} bestått
                  </strong>{' '}
                  {bokstav > 0 ? '(holdt utenfor fordelingen over)' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {utenKobling.length > 0 && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--nmbu-neutral-2)' }}>
          {utenKobling.length} av de valgte programmene har ikke et emne som dekker{' '}
          {courseType.label.toLowerCase()} i kartleggingen. Det kan bety at faget ikke finnes i
          studieplanen, eller at koblingen ikke er laget ennå.
        </p>
      )}
    </div>
  );
}

// ─── Fane 5: Studieplan ───────────────────────────────────────────────────────

/** Rekkefølgen semestrene skal stå i innenfor ett studieår. */
const SEMESTER_ORDER = ['høst', 'januarblokk', 'vår', 'juniblokk', 'helår'];

function semesterRank(semester: string | null): number {
  if (!semester) return SEMESTER_ORDER.length + 1;
  const i = SEMESTER_ORDER.indexOf(semester.trim().toLowerCase());
  return i >= 0 ? i : SEMESTER_ORDER.length;
}

function storForbokstav(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

/** Studieår først (emner uten årsplassering bakerst), deretter semester, så emnekode. */
function sortPlanCourses(courses: PlanCourse[]): PlanCourse[] {
  return [...courses].sort((a, b) => {
    const ay = a.aar ?? 99, by = b.aar ?? 99;
    if (ay !== by) return ay - by;
    const as = semesterRank(a.semester), bs = semesterRank(b.semester);
    if (as !== bs) return as - bs;
    return a.emnekode.localeCompare(b.emnekode, 'nb');
  });
}

interface StudyYearBlock { aar: number | null; label: string; emner: PlanCourse[] }

function groupByStudyYear(courses: PlanCourse[]): StudyYearBlock[] {
  const bolker: StudyYearBlock[] = [];
  for (const c of sortPlanCourses(courses)) {
    let b = bolker.find((x) => x.aar === c.aar);
    if (!b) {
      b = { aar: c.aar, label: c.aar === null ? 'Uten årsplassering' : `${c.aar}. studieår`, emner: [] };
      bolker.push(b);
    }
    b.emner.push(c);
  }
  return bolker;
}

/** Karaktertallene for emnet i det valgte året, eller null når de mangler / er under terskelen. */
function planYear(c: PlanCourse, year: number, minKandidater: number): CourseGradeYear | null {
  const d = c.years.find((yr) => yr.year === year);
  if (!d || d.total <= 0 || d.total < minKandidater) return null;
  return d;
}

/** Sant når DBH-kodene er noe annet enn emnekoden selv, og derfor bør vises. */
function dbhKoderAvviker(c: PlanCourse): boolean {
  if (c.dbhEmnekoder.length === 0) return true;
  return c.dbhEmnekoder.length !== 1 || c.dbhEmnekoder[0] !== c.emnekode;
}

interface PlanAgg {
  /** Antall obligatoriske emner i studieplanen. */
  emner: number;
  /** Av disse: emner med karaktertall dette året, over terskelen. */
  medTall: number;
  kandidater: number;
  bokstav: number;
  grades: Record<Grade, number>;
  G: number;
  H: number;
  /** Kandidatvektet snitt over de obligatoriske emnene med bokstavkarakter. */
  snitt: number | null;
  strykprosent: number | null;
  bestattprosent: number | null;
}

function aggregatePlanCourses(courses: PlanCourse[], year: number, minKandidater: number): PlanAgg {
  const grades = EMPTY_GRADES();
  let medTall = 0, kandidater = 0, G = 0, H = 0;

  for (const c of courses) {
    const d = planYear(c, year, minKandidater);
    if (!d) continue;
    medTall += 1;
    kandidater += d.total;
    grades.A += d.A; grades.B += d.B; grades.C += d.C;
    grades.D += d.D; grades.E += d.E; grades.F += d.F;
    G += d.G; H += d.H;
  }

  const bokstav = GRADES.reduce((s, g) => s + grades[g], 0);
  const snitt = bokstav > 0
    ? (grades.A * 5 + grades.B * 4 + grades.C * 3 + grades.D * 2 + grades.E * 1) / bokstav
    : null;

  return {
    emner: courses.length, medTall, kandidater, bokstav, grades, G, H, snitt,
    strykprosent: bokstav > 0 ? (grades.F / bokstav) * 100 : null,
    bestattprosent: G + H > 0 ? (G / (G + H)) * 100 : null,
  };
}

function harStudieplan(p: ProgramStudyPlan): boolean {
  return p.obligatoriske.length > 0 || p.spesialiseringer.length > 0;
}

// ─── Toppstripe: ett nøkkeltallskort per program ──────────────────────────────

function StudyPlanTopStrip({
  plans, year, minKandidater,
}: {
  plans: ProgramStudyPlan[];
  year: number;
  minKandidater: number;
}) {
  const rader = plans.map((p) => ({ p, agg: aggregatePlanCourses(p.obligatoriske, year, minKandidater) }));

  const medPlan = rader
    .filter((r) => harStudieplan(r.p))
    .sort((a, b) => {
      if (a.agg.snitt === null && b.agg.snitt === null) return 0;
      if (a.agg.snitt === null) return 1;
      if (b.agg.snitt === null) return -1;
      return b.agg.snitt - a.agg.snitt;
    });
  const utenPlan = rader.filter((r) => !harStudieplan(r.p));

  return (
    <div className="flex flex-wrap gap-3">
      {medPlan.map(({ p, agg }) => {
        const col = landsamColorFor(p.entryId);
        return (
          <div key={p.entryId} className="rounded-xl px-4 py-3"
            style={{
              border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff',
              borderLeft: `4px solid ${col}`, minWidth: 230, flex: '1 1 230px',
            }}>
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: p.isNmbu ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral)' }}>
                {p.shortName}{p.isNmbu ? ' ★' : ''}
              </span>
              {p.isNmbu && (
                <span className="px-1.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>NMBU</span>
              )}
            </div>

            <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginBottom: 3 }}>
              Obligatorisk karakterindeks {year}
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span style={{ fontSize: 19, fontWeight: 700, lineHeight: 1, color: 'var(--nmbu-neutral)' }}>
                {agg.snitt !== null ? `${nf(agg.snitt, 2)} (${letterFor(agg.snitt)})` : '–'}
              </span>
              <span style={{ fontSize: 11, color: (agg.strykprosent ?? 0) > 20 ? '#9b3a3a' : 'var(--nmbu-neutral-2)' }}>
                stryk {agg.strykprosent !== null ? `${nf(agg.strykprosent, 1)} %` : '–'}
              </span>
            </div>

            <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginTop: 8, lineHeight: 1.6 }}>
              {p.obligatoriskeStudiepoeng !== null && p.totaltStudiepoeng !== null
                ? <>{nf(p.obligatoriskeStudiepoeng)} av {nf(p.totaltStudiepoeng)} sp obligatorisk</>
                : <>Studiepoeng ikke oppgitt</>}
              <br />
              {agg.emner} obligatoriske emner · {agg.medTall} med karaktertall i {year}
            </div>
          </div>
        );
      })}

      {utenPlan.map(({ p }) => {
        const col = landsamColorFor(p.entryId);
        return (
          <div key={p.entryId} className="rounded-xl px-4 py-3"
            style={{
              border: '1px dashed var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)',
              minWidth: 230, flex: '1 1 230px',
            }}>
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col, opacity: 0.4 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-neutral-2)' }}>
                {p.shortName}{p.isNmbu ? ' ★' : ''}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
              {p.merknad ?? 'Studieplan ikke hentet ennå'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Emnetabell for én studieplanbolk ─────────────────────────────────────────

type PlanTableRow =
  | { kind: 'bolk'; key: string; label: string }
  | { kind: 'emne'; key: string; c: PlanCourse; stripe: number };

function PlanCourseTable({
  courses, year, minKandidater,
}: {
  courses: PlanCourse[];
  year: number;
  minKandidater: number;
}) {
  if (courses.length === 0) {
    return (
      <p className="text-xs py-3" style={{ color: 'var(--nmbu-neutral-2)' }}>
        Ingen obligatoriske emner er listet her i studieplanen.
      </p>
    );
  }

  const rader: PlanTableRow[] = [];
  let stripe = 0;
  for (const b of groupByStudyYear(courses)) {
    rader.push({ kind: 'bolk', key: `bolk-${b.aar ?? 'ukjent'}`, label: b.label });
    for (const c of b.emner) {
      rader.push({ kind: 'emne', key: `emne-${b.aar ?? 'ukjent'}-${c.emnekode}`, c, stripe: stripe++ });
    }
  }

  const cols: { label: string; align: 'left' | 'center' }[] = [
    { label: 'Semester',  align: 'left' },
    { label: 'Emnekode',  align: 'left' },
    { label: 'Emnenavn',  align: 'left' },
    { label: 'Sp.',       align: 'center' },
    { label: 'Kandidater', align: 'center' },
    { label: 'Snitt',     align: 'center' },
    { label: 'Stryk %',   align: 'center' },
    { label: 'Fordeling', align: 'left' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
            {cols.map((col) => (
              <th key={col.label} className={`px-3 py-2.5 text-${col.align} whitespace-nowrap`}
                style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rader.map((r) => {
            if (r.kind === 'bolk') {
              return (
                <tr key={r.key}>
                  <td colSpan={cols.length} className="px-3 py-1.5"
                    style={{
                      backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)',
                      fontWeight: 700, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase',
                      borderBottom: '1px solid var(--nmbu-neutral-3)',
                    }}>
                    {r.label}
                  </td>
                </tr>
              );
            }

            const c = r.c;
            const raw = c.years.find((yr) => yr.year === year);
            const d = planYear(c, year, minKandidater);
            const bokstav = d ? courseLetterTotal(d) : 0;
            const bestattOnly = d !== null && bokstav === 0 && d.G + d.H > 0;
            const manglerTekst = raw
              ? `Under terskelen på ${minKandidater} kandidater (${nf(raw.total)} i ${year}).`
              : `Emnet har ingen karaktertall i DBH for ${year}.`;

            return (
              <tr key={r.key}
                style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: r.stripe % 2 === 0 ? '#fff' : 'var(--nmbu-beige-light)' }}>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--nmbu-neutral-2)' }}>
                  {c.semester ? storForbokstav(c.semester) : '–'}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="font-mono" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 600 }}>{c.emnekode}</div>
                  {dbhKoderAvviker(c) && (
                    <div className="font-mono" style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}
                      title={c.dbhEmnekoder.length > 0 ? 'Emnekode(r) i DBH' : 'Emnet er ikke koblet til en DBH-kode'}>
                      {c.dbhEmnekoder.length > 0 ? c.dbhEmnekoder.join(', ') : 'ingen DBH-kode'}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <span style={{ color: 'var(--nmbu-neutral)' }}>{c.emnenavn}</span>
                  {c.merknad && (
                    <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', fontStyle: 'italic' }}>{c.merknad}</div>
                  )}
                  {d === null && (
                    <div title={c.merknad ?? manglerTekst} style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>
                      {raw ? `Under terskelen (${nf(raw.total)} kandidater)` : `Ingen karaktertall i DBH for ${year}`}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center" style={{ color: c.studiepoeng === null ? 'var(--nmbu-neutral-3)' : 'var(--nmbu-neutral-1)' }}>
                  {c.studiepoeng === null ? '–' : nf(c.studiepoeng, 0)}
                </td>
                <td className="px-3 py-2.5 text-center" style={{ color: d ? 'var(--nmbu-neutral-1)' : 'var(--nmbu-neutral-3)', fontWeight: d ? 600 : 400 }}>
                  {d ? nf(d.total) : '–'}
                </td>
                <td className="px-3 py-2.5 text-center whitespace-nowrap">
                  {d && d.snitt !== null ? (
                    <span className="inline-block px-2 py-1 rounded" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>
                      {nf(d.snitt, 2)} ({letterFor(d.snitt)})
                    </span>
                  ) : bestattOnly && d ? (
                    <span style={{ color: 'var(--nmbu-neutral-2)' }}>
                      bestått {d.bestattprosent !== null ? nf(d.bestattprosent, 1) : '–'} %
                    </span>
                  ) : (
                    <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {bestattOnly && d ? (
                    <span style={{ color: 'var(--nmbu-neutral-2)' }}>
                      {d.H > 0 ? `${nf((d.H / (d.G + d.H)) * 100, 1)} %` : '0,0 %'}
                    </span>
                  ) : d && d.strykprosent !== null ? (
                    <span style={{ fontWeight: 600, color: d.strykprosent > 20 ? '#9b3a3a' : 'var(--nmbu-neutral-1)' }}>
                      {nf(d.strykprosent, 1)} %
                    </span>
                  ) : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                </td>
                <td className="px-3 py-2.5">
                  {d ? <MiniDistBar d={d} /> : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Spesialisering: sammenleggbar blokk ──────────────────────────────────────

function SpecialisationBlock({
  spes, year, minKandidater,
}: {
  spes: PlanSpecialisation;
  year: number;
  minKandidater: number;
}) {
  const [open, setOpen] = useState(false);
  const agg = aggregatePlanCourses(spes.obligatoriske, year, minKandidater);

  return (
    <div className="rounded-lg overflow-hidden mt-3" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left transition-all"
        style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
        {open
          ? <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--nmbu-green)' }} />
          : <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--nmbu-neutral-2)' }} />}
        <span className="flex-1 min-w-0" style={{ fontSize: 12, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>
          Spesialisering: {spes.navn}
        </span>
        <span className="shrink-0" style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>
          {spes.obligatoriske.length} {spes.obligatoriske.length === 1 ? 'emne' : 'emner'}
          {agg.snitt !== null ? ` · snitt ${nf(agg.snitt, 2)} (${letterFor(agg.snitt)})` : ''}
        </span>
      </button>
      {open && (
        <div style={{ backgroundColor: '#fff' }}>
          <PlanCourseTable courses={spes.obligatoriske} year={year} minKandidater={minKandidater} />
        </div>
      )}
    </div>
  );
}

// ─── Én seksjon per program ───────────────────────────────────────────────────

function StudyPlanProgramSection({
  plan, year, minKandidater,
}: {
  plan: ProgramStudyPlan;
  year: number;
  minKandidater: number;
}) {
  const col = landsamColorFor(plan.entryId);
  const finnes = harStudieplan(plan);

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', borderLeft: `4px solid ${col}` }}>

      <div className="px-4 py-3 flex items-start justify-between gap-3 flex-wrap"
        style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)' }}>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: plan.isNmbu ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral)' }}>
              {plan.shortName}{plan.isNmbu ? ' ★' : ''}
            </span>
            {plan.isNmbu && (
              <span className="px-1.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>NMBU</span>
            )}
            <span style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)' }}>· {plan.programnavn}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginTop: 3 }}>
            {plan.institusjon}
            {plan.obligatoriskeStudiepoeng !== null && plan.totaltStudiepoeng !== null && (
              <> · {nf(plan.obligatoriskeStudiepoeng)} av {nf(plan.totaltStudiepoeng)} sp obligatorisk</>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {plan.studieplanAar && (
            <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 600, backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>
              Studieplan {plan.studieplanAar}
            </span>
          )}
          {plan.kilder.map((url, i) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" title={url}
              className="flex items-center gap-1 text-xs hover:underline"
              style={{ color: 'var(--nmbu-green)' }}>
              <ExternalLink className="w-3.5 h-3.5" />
              {plan.kilder.length > 1 ? `Kilde ${i + 1}` : 'Kilde'}
            </a>
          ))}
        </div>
      </div>

      {plan.merknad && (
        <div className="px-4 py-3 flex items-start gap-2"
          style={{ borderBottom: finnes ? '1px solid var(--nmbu-neutral-3)' : 'none' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--nmbu-green)' }} />
          <span style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', lineHeight: 1.6 }}>{plan.merknad}</span>
        </div>
      )}

      {finnes ? (
        <>
          <PlanCourseTable courses={plan.obligatoriske} year={year} minKandidater={minKandidater} />
          {plan.spesialiseringer.length > 0 && (
            <div className="px-4 pb-4 pt-1">
              {plan.spesialiseringer.map((s) => (
                <SpecialisationBlock key={s.navn} spes={s} year={year} minKandidater={minKandidater} />
              ))}
            </div>
          )}
        </>
      ) : (
        !plan.merknad && (
          <div className="px-4 py-4" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
            Studieplan ikke hentet ennå.
          </div>
        )
      )}
    </div>
  );
}

// ─── Side ved side: ett studieår om gangen, ett program per kolonne ───────────

function StudyPlanSideBySide({
  plans, year, minKandidater,
}: {
  plans: ProgramStudyPlan[];
  year: number;
  minKandidater: number;
}) {
  // Alle studieårene som finnes hos minst ett av programmene, i rekkefølge.
  const aarene: (number | null)[] = [];
  for (const p of plans) {
    for (const b of groupByStudyYear(p.obligatoriske)) {
      if (!aarene.some((a) => a === b.aar)) aarene.push(b.aar);
    }
  }
  aarene.sort((a, b) => (a ?? 99) - (b ?? 99));

  if (aarene.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: 'var(--nmbu-neutral-2)' }}>
        Ingen av de valgte programmene har en studieplan i datasettet ennå.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {aarene.map((aar) => (
        <section key={aar ?? 'ukjent'}>
          <h4 className="text-sm mb-3" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
            {aar === null ? 'Uten årsplassering' : `${aar}. studieår`}
          </h4>
          <div className="overflow-x-auto">
            <div className="grid gap-3 items-start"
              style={{ gridTemplateColumns: `repeat(${plans.length}, minmax(240px, 1fr))`, minWidth: plans.length * 240 }}>
              {plans.map((p) => {
                const col = landsamColorFor(p.entryId);
                const bolk = groupByStudyYear(p.obligatoriske).find((b) => b.aar === aar);
                const emner = bolk?.emner ?? [];
                return (
                  <div key={p.entryId} className="rounded-lg overflow-hidden"
                    style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', borderTop: `3px solid ${col}` }}>
                    <div className="px-3 py-2 flex items-center gap-1.5"
                      style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: p.isNmbu ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral)' }}>
                        {p.shortName}{p.isNmbu ? ' ★' : ''}
                      </span>
                    </div>

                    {emner.length === 0 ? (
                      <div className="px-3 py-3" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
                        {harStudieplan(p) ? 'Ingen obligatoriske emner dette studieåret.' : 'Studieplan ikke hentet ennå.'}
                      </div>
                    ) : emner.map((c, i) => {
                      const d = planYear(c, year, minKandidater);
                      const bokstav = d ? courseLetterTotal(d) : 0;
                      const bestattOnly = d !== null && bokstav === 0 && d.G + d.H > 0;
                      return (
                        <div key={c.emnekode} className="px-3 py-2"
                          style={{ backgroundColor: i % 2 === 0 ? '#fff' : 'var(--nmbu-beige-light)', borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--nmbu-neutral-1)' }}>{c.emnekode}</span>
                            <span style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>
                              {c.studiepoeng === null ? '–' : `${nf(c.studiepoeng, 0)} sp`}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--nmbu-neutral)', lineHeight: 1.4, marginTop: 1 }}>{c.emnenavn}</div>
                          <div className="flex items-center justify-between gap-2 flex-wrap" style={{ marginTop: 4 }}>
                            <span style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>
                              {c.semester ? storForbokstav(c.semester) : '–'}
                              {d ? ` · ${nf(d.total)} kand.` : ''}
                            </span>
                            {d && d.snitt !== null ? (
                              <span className="inline-block px-1.5 rounded" style={{ fontSize: 10, fontWeight: 600, backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>
                                {nf(d.snitt, 2)} ({letterFor(d.snitt)})
                              </span>
                            ) : bestattOnly && d ? (
                              <span style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>
                                bestått {d.bestattprosent !== null ? nf(d.bestattprosent, 1) : '–'} %
                              </span>
                            ) : (
                              <span title={c.merknad ?? `Ingen karaktertall i DBH for ${year}`} style={{ fontSize: 10, color: 'var(--nmbu-neutral-3)' }}>–</span>
                            )}
                          </div>
                          {d && <div style={{ marginTop: 4 }}><MiniDistBar d={d} width="100%" /></div>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

// ─── Selve fanen ──────────────────────────────────────────────────────────────

function StudieplanView({
  plans, year, minKandidater, sideBySide, onSideBySide,
}: {
  plans: ProgramStudyPlan[];
  year: number;
  minKandidater: number;
  sideBySide: boolean;
  onSideBySide: (v: boolean) => void;
}) {
  const antallMedPlan = plans.filter(harStudieplan).length;
  const kanSideBySide = antallMedPlan >= 2;

  return (
    <div className="space-y-7">
      <section>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h3 className="text-base" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
            1. Obligatorisk karakterindeks · {year}
          </h3>
          <button
            onClick={() => kanSideBySide && onSideBySide(!sideBySide)}
            disabled={!kanSideBySide}
            title={kanSideBySide
              ? 'Vis studieårene i kolonner, ett program per kolonne'
              : 'Krever minst to valgte program med studieplan'}
            className="px-2.5 py-1 rounded-full text-xs transition-all"
            style={{
              backgroundColor: sideBySide && kanSideBySide ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)',
              color: sideBySide && kanSideBySide ? '#fff' : 'var(--nmbu-neutral-1)',
              border: `1.5px solid ${sideBySide && kanSideBySide ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)'}`,
              fontWeight: sideBySide && kanSideBySide ? 600 : 400,
              opacity: kanSideBySide ? 1 : 0.5,
              cursor: kanSideBySide ? 'pointer' : 'not-allowed',
            }}
          >
            Vis side ved side
          </button>
        </div>
        <StudyPlanTopStrip plans={plans} year={year} minKandidater={minKandidater} />
        <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Karakterindeksen er et kandidatvektet snitt (A=5 … F=0) over de obligatoriske emnene som har
          bokstavkarakterer i {year}. Emner med bestått / ikke bestått teller ikke med, og terskelen på
          minst {minKandidater} kandidater gjelder per emne.
        </p>
      </section>

      <section>
        <h3 className="text-base mb-4" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
          2. {sideBySide && kanSideBySide ? 'Obligatoriske emner side ved side' : 'Obligatorisk emnerekke per program'}
        </h3>
        <GradeLegend />
        {sideBySide && kanSideBySide ? (
          <StudyPlanSideBySide plans={plans.filter(harStudieplan)} year={year} minKandidater={minKandidater} />
        ) : (
          <div className="flex flex-col gap-4">
            {plans.map((p) => (
              <StudyPlanProgramSection key={p.entryId} plan={p} year={year} minKandidater={minKandidater} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── NMBU-nøkkeltall i toppkortet ─────────────────────────────────────────────

function NmbuKeyFigures({
  group, year, minKandidater,
}: {
  group: LandsamCourseGroup;
  year: number;
  minKandidater: number;
}) {
  const nmbuPrograms = group.programs.filter((p) => p.isNmbu);
  if (nmbuPrograms.length === 0) return null;

  const prevYear = (() => {
    const i = LANDSAM_COURSE_YEARS.indexOf(year);
    return i > 0 ? LANDSAM_COURSE_YEARS[i - 1] : null;
  })();

  const fmt = (d: number, dec = 0) => (d >= 0 ? '+' : '−') + nf(Math.abs(d), dec);

  return (
    <>
      {nmbuPrograms.map((p) => {
        const cur = aggregateProgram(p, year, minKandidater);
        const prev = prevYear ? aggregateProgram(p, prevYear, minKandidater) : null;

        const highlights: { label: string; value: string; delta: string | null }[] = [
          {
            label: 'Karakterindeks',
            value: cur.snitt !== null ? `${nf(cur.snitt, 2)} (${letterFor(cur.snitt)})` : '–',
            delta: cur.snitt !== null && prev?.snitt != null ? `${fmt(cur.snitt - prev.snitt, 2)} vs. ${prevYear}` : null,
          },
          {
            label: 'Strykprosent',
            value: cur.strykprosent !== null ? `${nf(cur.strykprosent, 1)} %` : '–',
            delta: cur.strykprosent !== null && prev?.strykprosent != null ? `${fmt(cur.strykprosent - prev.strykprosent, 1)} pp vs. ${prevYear}` : null,
          },
          {
            label: 'Antall emner',
            value: nf(cur.emner),
            delta: prev ? `${fmt(cur.emner - prev.emner)} vs. ${prevYear}` : null,
          },
          {
            label: 'Antall kandidater',
            value: nf(cur.kandidater),
            delta: prev ? `${fmt(cur.kandidater - prev.kandidater)} vs. ${prevYear}` : null,
          },
        ];

        return (
          <div key={p.entryId} className="mx-6 mb-5 rounded-xl px-5 py-4" style={{ backgroundColor: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6EE7B7' }} />
              <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                {p.shortName} · {p.dbhProgramnavn} · Nøkkeltall {year}
              </span>
            </div>
            <div className="flex gap-8 flex-wrap">
              {highlights.map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
                  {s.delta != null && (
                    <div style={{ fontSize: 10, marginTop: 3, fontWeight: 600, color: s.delta.startsWith('−') ? '#FCA5A5' : '#6EE7B7' }}>
                      {s.delta}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

// ─── Hovedkomponent ───────────────────────────────────────────────────────────

type CourseTab = 'indeks' | 'fordeling' | 'emner' | 'sammenlign' | 'studieplan';

/** Emnekoblingen for en programgruppe, eller undefined når den ikke er laget ennå. */
function courseMappingFor(groupId: string) {
  return LANDSAM_COURSE_MAPPING.find((m) => m.groupId === groupId);
}

/**
 * Studieplanene for de valgte programmene i en gruppe, i samme rekkefølge som i
 * institusjonsvelgeren, men med NMBU-programmene først.
 */
function studyPlansFor(groupId: string, selectedIds: string[]): ProgramStudyPlan[] {
  const planGroup = LANDSAM_STUDYPLAN_GROUPS.find((g) => g.id === groupId);
  if (!planGroup) return [];
  const valgte = planGroup.programs.filter((p) => selectedIds.includes(p.entryId));
  return [...valgte.filter((p) => p.isNmbu), ...valgte.filter((p) => !p.isNmbu)];
}

/** Nyeste år i gruppen som faktisk har emnetall. */
function latestYearWithData(g: LandsamCourseGroup): number {
  for (let i = LANDSAM_COURSE_YEARS.length - 1; i >= 0; i--) {
    const y = LANDSAM_COURSE_YEARS[i];
    if (g.programs.some((p) => p.courses.some((c) => c.years.some((yr) => yr.year === y && yr.total > 0)))) return y;
  }
  return LANDSAM_COURSE_YEARS[LANDSAM_COURSE_YEARS.length - 1];
}

function defaultProgramIds(g: LandsamCourseGroup): string[] {
  const withData = g.programs.filter((p) => p.courses.some((c) => c.years.some((yr) => yr.total > 0)));
  return (withData.length > 0 ? withData : g.programs).map((p) => p.entryId);
}

export function LandsamCourseAnalysis({ initialGroup }: { initialGroup?: string }) {
  const firstUsable =
    LANDSAM_COURSE_GROUPS.find((g) => landsamCourseHasComparison(g))
    ?? LANDSAM_COURSE_GROUPS[0];

  const [groupId, setGroupId] = useState<string>(
    initialGroup && LANDSAM_COURSE_GROUPS.some((g) => g.id === initialGroup && landsamCourseHasComparison(g))
      ? initialGroup
      : (firstUsable?.id ?? '')
  );

  const group = useMemo(
    () => LANDSAM_COURSE_GROUPS.find((g) => g.id === groupId) ?? firstUsable,
    [groupId, firstUsable]
  );

  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string[]>>(
    () => Object.fromEntries(LANDSAM_COURSE_GROUPS.map((g) => [g.id, defaultProgramIds(g)]))
  );
  const [yearByGroup, setYearByGroup] = useState<Record<string, number>>(
    () => Object.fromEntries(LANDSAM_COURSE_GROUPS.map((g) => [g.id, latestYearWithData(g)]))
  );
  const [minKandidater, setMinKandidater] = useState<number>(10);
  const [tab, setTab] = useState<CourseTab>('indeks');
  const [courseProgramId, setCourseProgramId] = useState<string | null>(null);
  const [courseTypeByGroup, setCourseTypeByGroup] = useState<Record<string, string>>({});
  const [planSideBySide, setPlanSideBySide] = useState(false);

  if (!group) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', color: 'var(--nmbu-neutral-2)', fontSize: 13 }}>
        Ingen emnegrupper er lagt inn ennå.
      </div>
    );
  }

  const selectedIds = selectedByGroup[group.id] ?? defaultProgramIds(group);
  const setSelectedIds = (ids: string[]) => setSelectedByGroup((prev) => ({ ...prev, [group.id]: ids }));

  const year = yearByGroup[group.id] ?? latestYearWithData(group);
  const setYear = (y: number) => setYearByGroup((prev) => ({ ...prev, [group.id]: y }));

  const selectedPrograms = group.programs.filter((p) => selectedIds.includes(p.entryId));
  const activeCourseProgram =
    selectedPrograms.find((p) => p.entryId === courseProgramId) ?? selectedPrograms[0] ?? null;

  const tabs: { id: CourseTab; label: string }[] = [
    { id: 'indeks',     label: 'Karakterindeks' },
    { id: 'fordeling',  label: 'Karakterfordeling' },
    { id: 'emner',      label: 'Emner' },
    { id: 'sammenlign', label: 'Sammenlign emne' },
    { id: 'studieplan',  label: 'Studieplan' },
  ];

  const selectedPlans = studyPlansFor(group.id, selectedIds);

  const mapping = courseMappingFor(group.id);
  const courseTypes = mapping?.courseTypes ?? [];
  const activeCourseType =
    courseTypes.find((ct) => ct.id === courseTypeByGroup[group.id]) ?? courseTypes[0] ?? null;
  const setCourseTypeId = (id: string) =>
    setCourseTypeByGroup((prev) => ({ ...prev, [group.id]: id }));

  return (
    <div className="space-y-5">

      {/* Programgruppe-faner */}
      <div className="flex items-center gap-1 rounded-xl p-1.5 flex-wrap" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', width: 'fit-content' }}>
        {LANDSAM_COURSE_GROUPS.map((g) => {
          const ok = landsamCourseHasComparison(g);
          return (
            <button key={g.id} onClick={() => ok && setGroupId(g.id)} disabled={!ok}
              title={ok ? undefined : 'Ikke nok emnetall til sammenligning ennå'}
              className="px-5 py-2 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: groupId === g.id ? 'var(--nmbu-green-dark)' : 'transparent',
                color: groupId === g.id ? '#fff' : ok ? 'var(--nmbu-neutral-1)' : 'var(--nmbu-neutral-2)',
                fontWeight: groupId === g.id ? 600 : 400,
                opacity: ok ? 1 : 0.55,
                cursor: ok ? 'pointer' : 'not-allowed',
                textDecoration: ok ? 'none' : 'line-through',
              }}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Header */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
          <div style={{ maxWidth: 620 }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8 }}>
              DBH/HKDIR · {group.label} · {LEVEL_LABEL[group.level]}
            </div>
            <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: 22, lineHeight: 1.3 }}>
              Hvordan karaktersettes {group.label.toLowerCase()}-studentene?
            </div>
            <p style={{ fontSize: 13, opacity: 0.82, marginTop: 10, lineHeight: 1.65 }}>
              Karakterfordelingen i emnene studentene på {group.label.toLowerCase()}-programmene faktisk tar,
              sammenlignet mellom NMBU og konkurrentene. Velg institusjoner, år og minstekrav til antall
              kandidater i filteret til venstre.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CsvExportButton
              onExport={() => {
                if (tab === 'studieplan') return exportLandsamStudyPlanCsv(group.id, selectedIds, year, minKandidater);
                if (tab === 'sammenlign' && activeCourseType) {
                  return exportLandsamCourseTypeCsv(group.id, activeCourseType.id, selectedIds, year, minKandidater);
                }
                return exportLandsamCoursesCsv(group.id, selectedIds, year, minKandidater);
              }}
              label={
                tab === 'studieplan' ? 'Last ned studieplanen som CSV'
                  : tab === 'sammenlign' && activeCourseType ? 'Last ned faget som CSV'
                  : 'Last ned CSV'
              }
              dark
            />
            <a href="https://dbh.hkdir.no" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <ExternalLink className="w-3.5 h-3.5" /> Kilde: DBH/HKDIR
            </a>
          </div>
        </div>

        <NmbuKeyFigures group={group} year={year} minKandidater={minKandidater} />
      </div>

      {/* Info-linje for gruppen */}
      {group.note && (
        <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3"
          style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{group.note}</span>
        </div>
      )}

      <div className="grid gap-5" style={{ gridTemplateColumns: '220px 1fr' }}>

        <div className="flex flex-col gap-4">
          <InstitutionPicker
            group={group} selected={selectedIds} onChange={setSelectedIds}
            year={year} minKandidater={minKandidater}
          />
          <YearAndThresholdPicker
            group={group} year={year} onYear={setYear}
            minKandidater={minKandidater} onMinKandidater={setMinKandidater}
          />
        </div>

        {/* Innholdspanel */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
          <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
            <div className="flex flex-wrap gap-1.5">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="px-3 py-1 rounded-full text-xs transition-all"
                  style={{
                    backgroundColor: tab === t.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)',
                    color: tab === t.id ? '#fff' : 'var(--nmbu-neutral-1)',
                    fontWeight: tab === t.id ? 600 : 400,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
              {year} · minst {minKandidater} kandidater per emne
            </div>
          </div>

          <div className="p-5">
            {selectedPrograms.length === 0 ? (
              <div className="flex items-center justify-center h-48" style={{ color: 'var(--nmbu-neutral-2)', fontSize: 13 }}>
                Velg minst ett program i filteret.
              </div>
            ) : (
              <>
                {tab === 'indeks' && (
                  <>
                    <div className="mb-4 flex items-start gap-2" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Kandidatvektet snitt over alle emner med bokstavkarakter, per program. Sortert fallende.</span>
                    </div>
                    <KarakterindeksView programs={selectedPrograms} year={year} minKandidater={minKandidater} />
                  </>
                )}

                {tab === 'fordeling' && (
                  <>
                    <div className="mb-4 flex items-start gap-2" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Andel A–F samlet over emnene til hvert program i {year}. Stolpene summerer til 100 %.</span>
                    </div>
                    <KarakterfordelingView programs={selectedPrograms} year={year} minKandidater={minKandidater} />
                  </>
                )}

                {tab === 'emner' && (
                  <>
                    <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Program:</span>
                        {selectedPrograms.map((p) => {
                          const active = activeCourseProgram?.entryId === p.entryId;
                          const col = landsamColorFor(p.entryId);
                          return (
                            <button key={p.entryId} onClick={() => setCourseProgramId(p.entryId)}
                              className="px-3 py-1 rounded-full text-xs transition-all"
                              style={{
                                backgroundColor: active ? col : 'var(--nmbu-beige-light)',
                                color: active ? '#fff' : 'var(--nmbu-neutral-1)',
                                border: `1.5px solid ${active ? col : 'var(--nmbu-neutral-3)'}`,
                                fontWeight: active ? 600 : 400,
                              }}
                            >
                              {p.shortName}{p.isNmbu ? ' ★' : ''}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
                        Klikk på en kolonneoverskrift for å sortere.
                      </div>
                    </div>

                    {activeCourseProgram && (
                      <>
                        <div className="mb-3" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                          {activeCourseProgram.dbhProgramnavn} · {activeCourseProgram.institusjon} ·{' '}
                          DBH {activeCourseProgram.dbhInstitusjonskode}
                          {activeCourseProgram.dbhProgramkoder.length > 0 ? ` / ${activeCourseProgram.dbhProgramkoder.join(', ')}` : ''}
                        </div>
                        <div className="mb-3 flex items-start gap-2" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>
                            DBH skjermer celler med 1–2 kandidater. Stryk på programnivå kan være
                            underestimert; åpne raden for fordeling og for tallene for alle studenter på emnet.
                          </span>
                        </div>
                        <EmneTable program={activeCourseProgram} year={year} minKandidater={minKandidater} />
                        <div className="mt-3">
                          <GradeLegend />
                        </div>
                      </>
                    )}
                  </>
                )}

                {tab === 'sammenlign' && (
                  !mapping || !activeCourseType ? (
                    <div className="flex items-start gap-2 rounded-lg px-4 py-3"
                      style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)', fontSize: 12 }}>
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Emnekobling for denne gruppen er ikke laget ennå.</span>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-start gap-2" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          Samme fag hos alle de valgte programmene i {year}. Er faget delt i flere emner,
                          summeres karakterene. Terskelen på minst {minKandidater} kandidater gjelder per emnekode.
                        </span>
                      </div>
                      {mapping.note && (
                        <p className="mb-4 text-xs leading-relaxed" style={{ color: 'var(--nmbu-neutral-2)' }}>
                          {mapping.note}
                        </p>
                      )}
                      <CourseTypePicker
                        courseTypes={courseTypes}
                        selected={activeCourseType}
                        onSelect={setCourseTypeId}
                      />
                      <SammenlignEmneView
                        courseType={activeCourseType}
                        programs={selectedPrograms}
                        year={year}
                        minKandidater={minKandidater}
                      />
                    </>
                  )
                )}

                {tab === 'studieplan' && (
                  selectedPlans.length === 0 ? (
                    <div className="flex items-start gap-2 rounded-lg px-4 py-3"
                      style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)', fontSize: 12 }}>
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Studieplaner for denne gruppen er ikke lagt inn ennå.</span>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-start gap-2" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          De obligatoriske emnene i studieplanen til hvert program, i den rekkefølgen
                          studentene tar dem, med karakterene DBH har for {year}. Valgemner og utveksling
                          er ikke med.
                        </span>
                      </div>
                      <StudieplanView
                        plans={selectedPlans}
                        year={year}
                        minKandidater={minKandidater}
                        sideBySide={planSideBySide}
                        onSideBySide={setPlanSideBySide}
                      />
                    </>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3"
        style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        {tab === 'studieplan' ? (
          <span>
            Kilde: studieplanene til hvert program (lenker i seksjonene) og DBH/HKDIR tabell 308/208.
            Obligatoriske emner per studieplanår; karakterer per valgt år.
          </span>
        ) : (
          <span>
            Kilde: DBH/HKDIR tabell 308 og 208. Snitt A=5…F=0 over bokstavkarakterer; bestått/ikke bestått
            holdes utenfor. Emner uten navn i DBH vises med emnekode.
            Emnekobling: manuelt kartlagt mot studieplanene.
          </span>
        )}
      </div>

    </div>
  );
}
