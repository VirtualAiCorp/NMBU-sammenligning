import { useState } from 'react';
import { MASTER_THESIS_DATA, MASTER_ADMISSION, UNIVERSITY_NAMES, type ThesisGrades } from '../data/masterThesisData';
import { fullRegression, sigStars, fmtP, type RegressionResult } from '../utils/regression';

const GRADE_ORDER = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
const GRADE_VALUES: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

function gradeAvg(grades: ThesisGrades): number | null {
  const total = GRADE_ORDER.reduce((s, g) => s + grades[g], 0);
  if (total === 0) return null;
  return GRADE_ORDER.reduce((s, g) => s + grades[g] * GRADE_VALUES[g], 0) / total;
}

function avgToLetter(avg: number): string {
  return ['F', 'E', 'D', 'C', 'B', 'A'][Math.round(avg)] ?? '?';
}

function MasterRegressionStatsBox({ reg }: { reg: RegressionResult }) {
  const stars = sigStars(reg.pValue);
  const sigColor = reg.pValue < 0.05 ? '#025c4f' : reg.pValue < 0.1 ? '#b45309' : '#6b7280';
  const sigText  = reg.pValue < 0.05 ? 'Signifikant (p < 0,05)' : reg.pValue < 0.1 ? 'Grensetilfelle (p < 0,10)' : 'Ikke signifikant';

  const cell = (label: string, value: string, sub?: string) => (
    <div style={{ minWidth: 110 }}>
      <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', fontFamily: "ui-monospace, 'Courier New', monospace" }}>
        {value}
        {sub && <span style={{ fontSize: 10, fontWeight: 400, color: '#6b7280', marginLeft: 4 }}>{sub}</span>}
      </div>
    </div>
  );

  return (
    <div style={{
      border: '1px solid var(--nmbu-neutral-3)',
      borderRadius: 8,
      padding: '12px 16px',
      backgroundColor: '#f9fafb',
      marginBottom: 8,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--nmbu-green-dark)', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Regresjonsstatistikk — OLS (n={reg.n}, df={reg.df})
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px' }}>
        {cell('Stigningstall (β₁)', reg.slope.toFixed(4))}
        {cell('Konstantledd (β₀)', reg.intercept.toFixed(4))}
        {cell('SE(β₁)', reg.seBeta.toFixed(4))}
        {cell('t-statistikk', reg.tStat.toFixed(3), `df=${reg.df}`)}
        {cell('P-verdi', fmtP(reg.pValue), stars)}
        {cell('Pearson r', reg.r.toFixed(3))}
        {cell('R²', reg.r2.toFixed(3))}
      </div>
      <div style={{ marginTop: 8, fontSize: 11 }}>
        <span style={{ color: sigColor, fontWeight: 600 }}>{sigText}</span>
        <span style={{ color: '#9ca3af', marginLeft: 8 }}>
          y = {reg.slope.toFixed(4)}·(inntaksgrense) + {reg.intercept.toFixed(4)}
        </span>
      </div>
      <div style={{ marginTop: 4, fontSize: 10, color: '#9ca3af' }}>
        *** p&lt;0,001 · ** p&lt;0,01 · * p&lt;0,05 · . p&lt;0,10 · ns = ikke signifikant
      </div>
    </div>
  );
}

// Per-institution label offsets [dx, dy, toRight]
const OFFSETS: Record<string, [number, number, boolean]> = {
  nhh:       [-14,   4, false], // rightmost → flip left
  ntnu:      [ 14,  16, true],  // push down (isolated right-middle area)
  uia:       [ 14, -16, true],  // push up (UiT below)
  uit:       [ 14,  16, true],  // push down
  bi:        [ 14, -14, true],  // push up (OsloMet just below)
  oslomet:   [-14,   4, false], // flip left (BI very close in x)
  kristiania:[ 14,  14, true],  // push down (isolated bottom)
  nord:      [ 14, -12, true],  // push up
};

const THESIS_YEARS = ['2025', '2024', '2023'];

export function MasterComparisonChart() {
  const [thesisYear, setThesisYear] = useState('2025');

  // Build scatter data
  const points = Object.entries(MASTER_ADMISSION)
    .map(([uniId, admEntries]) => {
      const admission = admEntries[0];
      const program = MASTER_THESIS_DATA.find(
        (p) => p.universityId === uniId && p.isSivilokonom
      );
      if (!program) return null;
      const yearData = program.years.find((y) => y.year === thesisYear);
      if (!yearData) return null;
      const avg = gradeAvg(yearData.grades);
      if (avg === null) return null;
      return {
        uniId,
        label: UNIVERSITY_NAMES[uniId]?.shortName ?? uniId,
        x: admission.grade,
        y: avg,
        admissionYear: admission.year,
        admissionNote: admission.note ?? null,
        total: GRADE_ORDER.reduce((s, g) => s + yearData.grades[g], 0),
      };
    })
    .filter(Boolean) as {
      uniId: string; label: string;
      x: number; y: number;
      admissionYear: string; admissionNote: string | null; total: number;
    }[];

  const notes = points.filter((p) => p.admissionNote);

  // Chart geometry
  const W = 620, H = 420;
  const M = { top: 36, right: 30, bottom: 60, left: 62 };
  const PW = W - M.left - M.right;
  const PH = H - M.top - M.bottom;

  const X_MIN = 2.0, X_MAX = 4.4;
  const Y_MIN = 3.3, Y_MAX = 4.85;

  const sx = (v: number) => M.left + ((v - X_MIN) / (X_MAX - X_MIN)) * PW;
  const sy = (v: number) => M.top + PH - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * PH;

  // Regression line
  const reg = fullRegression(points.map((p) => ({ x: p.x, y: p.y })));
  const regX1 = X_MIN, regX2 = X_MAX;
  const regY1 = reg ? reg.slope * regX1 + reg.intercept : 0;
  const regY2 = reg ? reg.slope * regX2 + reg.intercept : 0;

  // Axis ticks
  const xTicks = [2.0, 2.5, 3.0, 3.5, 4.0];
  const yTicks = [3.5, 3.75, 4.0, 4.25, 4.5, 4.75];

  const DOT_R = 9;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
        <div>
          <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '18px' }}>
            Inntaksgrense vs. snittkarakter masteroppgave
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: 2 }}>
            Hvert punkt er én institusjon. Stiplet linje viser lineær regresjon.
          </div>
        </div>
        {/* Year selector */}
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.3)' }}>
          {THESIS_YEARS.map((y) => (
            <button
              key={y}
              onClick={() => setThesisYear(y)}
              className="px-3 py-1.5 text-xs transition-all"
              style={{
                backgroundColor: thesisYear === y ? 'rgba(255,255,255,0.25)' : 'transparent',
                color: '#fff',
                borderRight: y !== '2023' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                fontWeight: thesisYear === y ? 700 : 400,
              }}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>

          {/* Grid lines */}
          {xTicks.map((v) => (
            <line key={`gx${v}`} x1={sx(v)} y1={M.top} x2={sx(v)} y2={M.top + PH}
              stroke="#e8e8e8" strokeWidth={1} />
          ))}
          {yTicks.map((v) => (
            <line key={`gy${v}`} x1={M.left} y1={sy(v)} x2={M.left + PW} y2={sy(v)}
              stroke="#e8e8e8" strokeWidth={1} />
          ))}

          {/* Axes */}
          <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + PH} stroke="#ccc" strokeWidth={1.5} />
          <line x1={M.left} y1={M.top + PH} x2={M.left + PW} y2={M.top + PH} stroke="#ccc" strokeWidth={1.5} />

          {/* X ticks + labels */}
          {xTicks.map((v) => (
            <g key={`xt${v}`}>
              <line x1={sx(v)} y1={M.top + PH} x2={sx(v)} y2={M.top + PH + 5} stroke="#999" strokeWidth={1} />
              <text x={sx(v)} y={M.top + PH + 18} textAnchor="middle" fontSize={11} fill="#666">
                {v.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Y ticks + labels */}
          {yTicks.map((v) => (
            <g key={`yt${v}`}>
              <line x1={M.left - 5} y1={sy(v)} x2={M.left} y2={sy(v)} stroke="#999" strokeWidth={1} />
              <text x={M.left - 9} y={sy(v) + 4} textAnchor="end" fontSize={11} fill="#666">
                {v.toFixed(2)}
              </text>
              <text x={M.left - 9} y={sy(v) + 15} textAnchor="end" fontSize={8.5} fill="#aaa">
                {avgToLetter(v)}
              </text>
            </g>
          ))}

          {/* Axis labels */}
          <text
            x={M.left + PW / 2} y={H - 6}
            textAnchor="middle" fontSize={12} fill="#555"
            fontFamily="-apple-system, sans-serif"
          >
            Inntaksgrense (karaktersnitt fra bachelor)
          </text>
          <text
            x={-(M.top + PH / 2)} y={14}
            textAnchor="middle" fontSize={12} fill="#555"
            fontFamily="-apple-system, sans-serif"
            transform="rotate(-90)"
          >
            Snittkarakter masteroppgave (A=5)
          </text>

          {/* Regression line */}
          {reg && (
            <line
              x1={sx(regX1)} y1={sy(Math.max(Y_MIN, Math.min(Y_MAX, regY1)))}
              x2={sx(regX2)} y2={sy(Math.max(Y_MIN, Math.min(Y_MAX, regY2)))}
              stroke="#2d9b80" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.7}
            />
          )}

          {/* Points */}
          {points.map((p) => {
            const cx = sx(p.x);
            const cy = sy(p.y);
            const [odx, ody, toRight] = OFFSETS[p.uniId] ?? [14, 4, true];
            const lx1 = cx + (toRight ? DOT_R + 2 : -(DOT_R + 2));
            const ly1 = cy;
            const lx2 = cx + odx * 0.6;
            const ly2 = cy + ody * 0.6;
            const tx = cx + odx;
            const ty = cy + ody;
            const anchor = toRight ? 'start' : 'end';

            return (
              <g key={p.uniId}>
                {/* Leader line */}
                <line x1={lx1} y1={ly1} x2={tx} y2={ty}
                  stroke="#aaa" strokeWidth={1} />

                {/* Drop shadow */}
                <circle cx={cx + 0.5} cy={cy + 1.5} r={DOT_R} fill="rgba(0,0,0,0.10)" />
                {/* Dot */}
                <circle cx={cx} cy={cy} r={DOT_R}
                  fill="var(--nmbu-green-dark)" stroke="white" strokeWidth={2} />

                {/* Label */}
                <text
                  x={tx} y={ty + 4}
                  textAnchor={anchor}
                  fontSize={10} fontWeight={600}
                  fontFamily="-apple-system, sans-serif"
                  fill="#1a3a30"
                  paintOrder="stroke"
                  stroke="white" strokeWidth={3} strokeLinejoin="round"
                  style={{ userSelect: 'none' }}
                >
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* Regression annotation */}
          {reg && (
            <>
              <text x={M.left + PW - 4} y={M.top + 14} textAnchor="end" fontSize={10} fill="#2d9b80" fontFamily="-apple-system, sans-serif">
                {`β₁ = ${reg.slope.toFixed(3)}  R² = ${reg.r2.toFixed(3)}  p = ${fmtP(reg.pValue)} ${sigStars(reg.pValue)}`}
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Data table */}
      <div className="px-6 pb-6">
        {reg && <MasterRegressionStatsBox reg={reg} />}
        <div style={{ fontSize: '12px', color: 'var(--nmbu-neutral-2)', marginBottom: 8 }}>
          Datapunkter — masteroppgave {thesisYear} · inntaksgrense siste tilgjengelige år
        </div>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                {['Institusjon', 'Inntaksgrense', 'Snitt masteroppgave', 'Karakterfordeling', 'Antall'].map((h) => (
                  <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...points]
                .sort((a, b) => b.x - a.x)
                .map((p, i) => {
                  const prog = MASTER_THESIS_DATA.find(
                    (pr) => pr.universityId === p.uniId && pr.isSivilokonom
                  )!;
                  const yr = prog.years.find((y) => y.year === thesisYear)!;
                  const grades = yr.grades;
                  return (
                    <tr key={p.uniId} style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: i % 2 === 0 ? '#fff' : 'var(--nmbu-beige-light)' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>{p.label}</td>
                      <td style={{ padding: '7px 10px' }}>
                        {p.x.toFixed(2)}
                        {p.admissionNote && <sup style={{ color: 'var(--nmbu-green-dark)', fontWeight: 700, marginLeft: 1 }}>*</sup>}
                        <span style={{ fontSize: '10px', color: 'var(--nmbu-neutral-2)', marginLeft: 4 }}>({p.admissionYear})</span>
                      </td>
                      <td style={{ padding: '7px 10px' }}>
                        <span style={{ fontWeight: 700 }}>{p.y.toFixed(2)}</span>
                        <span style={{ color: 'var(--nmbu-neutral-2)', marginLeft: 4 }}>({avgToLetter(p.y)})</span>
                      </td>
                      <td style={{ padding: '7px 10px' }}>
                        {GRADE_ORDER.filter((g) => grades[g] > 0).map((g) => (
                          <span key={g} style={{ marginRight: 6, color: '#444' }}>
                            <span style={{ fontWeight: 600 }}>{g}</span>:{grades[g]}
                          </span>
                        ))}
                      </td>
                      <td style={{ padding: '7px 10px', color: 'var(--nmbu-neutral-2)' }}>{p.total}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {notes.length > 0 && (
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
            {notes.map((p) => (
              <div key={p.uniId}>
                <sup style={{ color: 'var(--nmbu-green-dark)', fontWeight: 700 }}>*</sup>
                {' '}{p.label}: {p.admissionNote}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
