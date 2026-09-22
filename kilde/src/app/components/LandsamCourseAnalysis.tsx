import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Info, ExternalLink, Filter, Users } from 'lucide-react';
import { CsvExportButton } from './CsvExportButton';
import { exportLandsamCoursesCsv } from '../utils/csvExport';
import {
  LANDSAM_COURSE_GROUPS, LANDSAM_COURSE_YEARS,
  type LandsamCourseGroup, type ProgramCourses, type CourseGradeYear,
} from '../data/landsamCourseData';
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

function MiniDistBar({ d, width = 130 }: { d: CourseGradeYear; width?: number }) {
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

  const rows = program.courses
    .map((c) => {
      const d = c.years.find((yr) => yr.year === year);
      return d ? { c, d } : null;
    })
    .filter((r): r is { c: (typeof program.courses)[number]; d: CourseGradeYear } => r !== null)
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
            return (
              <tr key={c.emnekode} style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: i % 2 === 0 ? '#fff' : 'var(--nmbu-beige-light)' }}>
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
                  ) : d.strykprosent !== null ? (
                    <span style={{ fontWeight: 600, color: d.strykprosent > 20 ? '#9b3a3a' : 'var(--nmbu-neutral-1)' }}>
                      {nf(d.strykprosent, 1)} %
                    </span>
                  ) : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                </td>
                <td className="px-3 py-2.5"><MiniDistBar d={d} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
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

type CourseTab = 'indeks' | 'fordeling' | 'emner';

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
    { id: 'indeks',    label: 'Karakterindeks' },
    { id: 'fordeling', label: 'Karakterfordeling' },
    { id: 'emner',     label: 'Emner' },
  ];

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
              onExport={() => exportLandsamCoursesCsv(group.id, selectedIds, year, minKandidater)}
              label="Last ned CSV"
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
                        <EmneTable program={activeCourseProgram} year={year} minKandidater={minKandidater} />
                        <div className="mt-3">
                          <GradeLegend />
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3"
        style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Kilde: DBH/HKDIR tabell 308 og 208. Snitt A=5…F=0 over bokstavkarakterer; bestått/ikke bestått
          holdes utenfor. Emner uten navn i DBH vises med emnekode.
        </span>
      </div>

    </div>
  );
}
