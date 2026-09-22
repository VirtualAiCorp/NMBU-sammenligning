import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { COURSE_MAPPING, UNIVERSITY_INFO, CourseId } from '../data/courseMapping';
import { ADMISSION_DATA } from '../data/admissionData';
import { GradingHarshnessSummary } from './GradingHarshnessSummary';
import { fullRegression, sigStars, fmtP, type RegressionResult } from '../utils/regression';
import { getGradesForMode, type YearMode } from '../data/courseHistory';

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_COURSE_IDS: CourseId[] = [
  'finansregnskap', 'okonomistyring', 'investering',
  'markedsforing', 'organisasjon', 'strategi',
  'makrookonomi', 'mikrookonomi', 'matematikk',
  'statistikk', 'metode',
];
const GRADE_POINTS: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

// Default assumption for open-admission (ordinary = 0) institutions without a stipulated score.
const ASSUMED_OPEN_ADMISSION = 30.0;

// ─── Data helpers ─────────────────────────────────────────────────────────────
function computeWeightedGradeAvg(uniId: string, yearMode: YearMode): number | null {
  let totalPts = 0, totalN = 0;
  for (const cId of ALL_COURSE_IDS) {
    const e = COURSE_MAPPING[cId]?.[uniId];
    if (!e) continue;
    const grades = getGradesForMode(cId, uniId, yearMode, e.fallbackGrades);
    if (!grades) continue;
    const n = (Object.values(grades) as number[]).reduce((s, v) => s + v, 0);
    if (n === 0) continue;
    const pts = (Object.entries(grades) as [string, number][])
      .reduce((s, [g, c]) => s + GRADE_POINTS[g] * c, 0);
    totalPts += pts;
    totalN += n;
  }
  return totalN > 0 ? totalPts / totalN : null;
}

function linReg(pts: { x: number; y: number }[]): { a: number; b: number; r2: number } {
  const n = pts.length;
  if (n < 2) return { a: 0, b: 0, r2: 0 };
  const xM = pts.reduce((s, p) => s + p.x, 0) / n;
  const yM = pts.reduce((s, p) => s + p.y, 0) / n;
  const ssXX = pts.reduce((s, p) => s + (p.x - xM) ** 2, 0);
  const ssXY = pts.reduce((s, p) => s + (p.x - xM) * (p.y - yM), 0);
  const ssYY = pts.reduce((s, p) => s + (p.y - yM) ** 2, 0);
  if (ssXX === 0) return { a: yM, b: 0, r2: 0 };
  const b = ssXY / ssXX;
  const a = yM - b * xM;
  const r2 = ssYY > 0 ? ssXY ** 2 / (ssXX * ssYY) : 0;
  return { a, b, r2 };
}

// Effective admission score for regression.
// stipulatedOrdinary always wins when set (explicit campus-composite override).
// - null without stipulated → excluded from regression
// - 0 without stipulated → use ASSUMED_OPEN_ADMISSION (30.0)
// - positive ordinary without stipulated → use as-is
function effectiveScore(admScore: number | null, stipulated?: number): number | null {
  if (stipulated !== undefined) return stipulated;
  if (admScore === null) return null;
  if (admScore === 0) return ASSUMED_OPEN_ADMISSION;
  return admScore;
}

// ─── Colour helpers ───────────────────────────────────────────────────────────
function barFill(v: number): string {
  if (v > 0.15) return '#025c4f';
  if (v > 0.03) return '#46b4a0';
  if (v > -0.03) return '#9ca3af';
  if (v > -0.15) return '#f87171';
  return '#b91c1c';
}
function indexTextColor(v: number): string {
  if (v > 0.03) return '#025c4f';
  if (v > -0.03) return '#6b7280';
  return '#b91c1c';
}

// ─── Scatter plot label offsets [dx, dy] from dot centre ─────────────────────
const OFFSETS: Record<string, [number, number]> = {
  hio:          [ 16,  12],
  uit:          [ 16, -16],
  nla:          [ 16,  16],
  inn:          [ 16, -16],
  usn:          [ 16,  26],
  uis:          [ 21, -16],
  nmbu:         [ 16,   8],
  uia:          [ 16,  -12],
  oslomet:      [ 16,  12],
  ntnu:         [-14,  -18],
  nhh:          [ 16,  12],
  onh:          [ 16, -16],
  nord:         [ 16,  12],
  hvl:          [-16,  -47],
  himolde:      [ 16,  -3],
  inn_rena:     [ 16,   4],
  ntnu_gjovik:  [ 16,  12],
  ntnu_alesund: [ 16,  14],
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Row {
  uniId: string;
  name: string;
  gradeAvg: number;
  admScore: number | null;          // raw value: 0 = open admission, null = private/unknown
  effectiveAdmScore: number | null; // value used in regression (30 for open admission)
  predicted: number | null;
  inflation: number | null;
  rank: number | null;
}

// ─── Regression stats panel ───────────────────────────────────────────────────
function RegressionStatsBox({ reg, xLabel, yLabel }: { reg: RegressionResult; xLabel: string; yLabel: string }) {
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
      marginTop: 12,
      border: '1px solid var(--nmbu-neutral-3)',
      borderRadius: 8,
      padding: '12px 16px',
      backgroundColor: '#f9fafb',
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
          y = {reg.slope.toFixed(4)}·({xLabel}) + {reg.intercept.toFixed(4)}
        </span>
      </div>
      <div style={{ marginTop: 4, fontSize: 10, color: '#9ca3af' }}>
        *** p&lt;0,001 · ** p&lt;0,01 · * p&lt;0,05 · . p&lt;0,10 · ns = ikke signifikant
      </div>
    </div>
  );
}

// ─── Scatter Plot (manual SVG) ────────────────────────────────────────────────
function ScatterPlot({ rows, reg }: {
  rows: Row[];
  reg: { a: number; b: number; r2: number };
}) {
  // Include all rows with an effective admission score (i.e. not private)
  const pts = rows.filter(r => r.effectiveAdmScore !== null) as
    (Row & { effectiveAdmScore: number })[];

  if (pts.length < 3) {
    return (
      <p className="text-sm text-center py-8" style={{ color: 'var(--nmbu-neutral-2)' }}>
        Ikke nok data for scatterplot (velg minst 3 universiteter med opptakspoeng).
      </p>
    );
  }

  const W = 680, H = 380;
  const M = { top: 28, right: 95, bottom: 58, left: 64 };
  const PW = W - M.left - M.right;
  const PH = H - M.top - M.bottom;

  const xs = pts.map(p => p.effectiveAdmScore);
  const ys = pts.map(p => p.gradeAvg);
  const xPad = 3;
  const yPad = (Math.max(...ys) - Math.min(...ys)) * 0.20 + 0.07;
  const xMin = Math.min(...xs) - xPad, xMax = Math.max(...xs) + xPad;
  const yMin = Math.min(...ys) - yPad, yMax = Math.max(...ys) + yPad;

  const sx = (x: number) => ((x - xMin) / (xMax - xMin)) * PW;
  const sy = (y: number) => PH - ((y - yMin) / (yMax - yMin)) * PH;

  const xStep = 4, yStep = 0.2;
  const xTicks: number[] = [];
  for (let t = Math.ceil(xMin / xStep) * xStep; t <= xMax; t += xStep) xTicks.push(t);
  const yTicks: number[] = [];
  for (let t = Math.ceil(yMin / yStep) * yStep; t <= yMax + 0.001; t += yStep) {
    yTicks.push(Math.round(t * 100) / 100);
  }

  const rly1 = reg.a + reg.b * xMin;
  const rly2 = reg.a + reg.b * xMax;
  const eqSign = reg.a >= 0 ? '+' : '';
  const eq = `y = ${reg.b.toFixed(4)}x ${eqSign}${reg.a.toFixed(4)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <clipPath id="ki-plot">
          <rect x={0} y={0} width={PW} height={PH} />
        </clipPath>
      </defs>
      <g transform={`translate(${M.left},${M.top})`}>
        {/* Horizontal grid */}
        {yTicks.map(t => (
          <line key={`yg${t}`} x1={0} y1={sy(t)} x2={PW} y2={sy(t)}
            stroke="#e5e7eb" strokeWidth={1} />
        ))}

        {/* Regression line (clipped to plot area) */}
        <line clipPath="url(#ki-plot)"
          x1={sx(xMin)} y1={sy(rly1)} x2={sx(xMax)} y2={sy(rly2)}
          stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="5 3" />

        {/* Points + labels with leader lines and background boxes */}
        {pts.map(p => {
          const [dx, dy] = OFFSETS[p.uniId] ?? [16, 8];
          const isStipulated = p.admScore === 0 || p.admScore === null;
          const cx = sx(p.effectiveAdmScore);
          const cy = sy(p.gradeAvg);
          const label = `${p.name}${isStipulated ? '*' : ''}`;
          const toRight = dx >= 0;

          // Estimate label box dimensions
          const narrowBox = new Set(['himolde','ntnu_alesund','inn_rena','inn','ntnu','oslomet','ntnu_gjovik']);
          const charW = narrowBox.has(p.uniId) ? 6.0 : 7.2;
          const padX = 5, padY = 3;
          const textW = label.length * charW + padX * 2;
          const textH = 16;

          // Box top-left corner
          const bx = toRight ? cx + dx - padX : cx + dx - textW + padX;
          const by = cy + dy - 13;

          // Leader line: from dot edge to nearest box edge midpoint
          const lx1 = cx + (toRight ? 7 : -7);
          const ly1 = cy;
          const lx2 = toRight ? bx : bx + textW;
          const ly2 = by + textH / 2;

          return (
            <g key={p.uniId}>
              {/* Leader line */}
              <line
                x1={lx1} y1={ly1} x2={lx2} y2={ly2}
                stroke="#c4cad4" strokeWidth={1}
              />
              {/* Label background box */}
              <rect
                x={bx} y={by} width={textW} height={textH}
                rx={3}
                fill="white"
                stroke="#d1d5db"
                strokeWidth={0.8}
              />
              {/* Dot (on top of line and box) */}
              <circle
                cx={cx} cy={cy} r={6}
                fill={isStipulated ? '#47a882' : '#025c4f'}
                fillOpacity={isStipulated ? 0.65 : 0.88}
                stroke="#fff" strokeWidth={2}
                strokeDasharray={isStipulated ? '3 2' : undefined}
              />
              {/* Label text */}
              <text
                x={cx + dx} y={cy + dy}
                fontSize={11} fill="#1f2937"
                textAnchor={toRight ? 'start' : 'end'}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Equation + R² */}
        <text x={PW - 4} y={15} textAnchor="end" fontSize={11} fill="#4b5563"
          fontFamily="ui-monospace, 'Courier New', monospace">{eq}</text>
        <text x={PW - 4} y={31} textAnchor="end" fontSize={11} fill="#4b5563"
          fontFamily="ui-monospace, 'Courier New', monospace">R² = {reg.r2.toFixed(3)}</text>

        {/* X axis */}
        <line x1={0} y1={PH} x2={PW} y2={PH} stroke="#d1d5db" />
        {xTicks.map(t => (
          <g key={`xt${t}`}>
            <line x1={sx(t)} y1={PH} x2={sx(t)} y2={PH + 5} stroke="#d1d5db" />
            <text x={sx(t)} y={PH + 18} textAnchor="middle" fontSize={11} fill="#6b7280"
              fontFamily="system-ui, -apple-system, sans-serif">{t}</text>
          </g>
        ))}
        <text x={PW / 2} y={PH + 44} textAnchor="middle" fontSize={12} fill="#6b7280"
          fontFamily="system-ui, -apple-system, sans-serif">
          Opptakspoeng (ordinær kvote, 2025)
        </text>

        {/* Y axis */}
        <line x1={0} y1={0} x2={0} y2={PH} stroke="#d1d5db" />
        {yTicks.map(t => (
          <g key={`yt${t}`}>
            <line x1={-5} y1={sy(t)} x2={0} y2={sy(t)} stroke="#d1d5db" />
            <text x={-10} y={sy(t) + 4} textAnchor="end" fontSize={11} fill="#6b7280"
              fontFamily="system-ui, -apple-system, sans-serif">{t.toFixed(1)}</text>
          </g>
        ))}
        <text transform={`translate(-50,${PH / 2}) rotate(-90)`}
          textAnchor="middle" fontSize={12} fill="#6b7280"
          fontFamily="system-ui, -apple-system, sans-serif">
          Snittkarakter (A=5 … F=0)
        </text>
      </g>
    </svg>
  );
}

// ─── Bar chart label ──────────────────────────────────────────────────────────
// For POSITIVE bars: label is placed to the right of the bar end (outside).
// For NEGATIVE bars: label is placed to the right of the zero line (outside),
//   EXCEPT for USN (most negative) which is kept inside the bar with a beige
//   background rectangle so the text remains readable over the coloured bar.
function makeBarLabel(data: Row[]) {
  return (props: {
    x?: number; y?: number; width?: number; height?: number;
    value?: number; index?: number;
  }) => {
    const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props;
    const entry = data[index];
    if (!entry || entry.predicted === null || entry.inflation === null) return null;

    const my = y + height / 2;
    const sign = entry.inflation >= 0 ? '+' : '';

    // barRight / barLeft work regardless of whether Recharts passes signed or unsigned width.
    const barRight = Math.max(x, x + width);
    const lx = barRight + 10;

    return (
      <g>
        <text x={lx} y={my - 10} fontSize={10} fill="#374151"
          fontFamily="system-ui, sans-serif">
          Faktisk: {entry.gradeAvg.toFixed(2)}
        </text>
        <text x={lx} y={my + 2} fontSize={10} fill="#6b7280"
          fontFamily="system-ui, sans-serif">
          Forventet: {entry.predicted.toFixed(2)}
        </text>
        <text x={lx} y={my + 14} fontSize={10.5} fontWeight={700}
          fill={indexTextColor(entry.inflation)}
          fontFamily="system-ui, sans-serif">
          {sign}{entry.inflation.toFixed(3)}
        </text>
      </g>
    );
  };
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  universities: string[];
}

export function GradeInflationDashboard({ universities }: Props) {
  const [yearMode, setYearMode] = useState<YearMode>('latest');

  const { rows, reg, fullReg } = useMemo(() => {
    // Build 2025 ordinary admission score and stipulated score lookups
    const admMap: Record<string, number | null> = {};
    const stipMap: Record<string, number | undefined> = {};
    for (const prog of ADMISSION_DATA) {
      admMap[prog.universityId] = prog.years['2025']?.ordinary ?? null;
      stipMap[prog.universityId] = prog.stipulatedOrdinary;
    }

    // Grade averages per university
    const raw = universities
      .map(uid => ({
        uniId: uid,
        name: UNIVERSITY_INFO[uid]?.shortName ?? uid,
        gradeAvg: computeWeightedGradeAvg(uid, yearMode),
        admScore: admMap[uid] ?? null,
        stipulated: stipMap[uid],
      }))
      .filter(r => r.gradeAvg !== null) as Array<{
        uniId: string; name: string; gradeAvg: number;
        admScore: number | null; stipulated: number | undefined;
      }>;

    // Regression: include all universities with an effective score (non-null after stipulation).
    const regPts = raw
      .filter(r => effectiveScore(r.admScore, r.stipulated) !== null)
      .map(r => ({
        x: effectiveScore(r.admScore, r.stipulated) as number,
        y: r.gradeAvg,
      }));

    const reg = linReg(regPts);
    const fullReg = fullRegression(regPts);

    // Compute effective score, predicted grade, and inflation index for every row
    const enriched = raw.map(r => {
      const eff = effectiveScore(r.admScore, r.stipulated);
      const predicted = eff !== null ? reg.a + reg.b * eff : null;
      return {
        ...r,
        effectiveAdmScore: eff,
        predicted,
        inflation: predicted !== null ? r.gradeAvg - predicted : null,
      };
    });

    // Sort by inflation descending (nulls last), assign rank
    const sorted = [...enriched].sort((a, b) => {
      if (a.inflation === null && b.inflation === null) return 0;
      if (a.inflation === null) return 1;
      if (b.inflation === null) return -1;
      return b.inflation - a.inflation;
    });

    let rankCnt = 0;
    const rows: Row[] = sorted.map(r => ({
      ...r,
      rank: r.inflation !== null ? ++rankCnt : null,
    }));

    return { rows, reg, fullReg };
  }, [universities, yearMode]);

  const barData = useMemo(
    () => rows.filter(r => r.inflation !== null)
              .sort((a, b) => (b.inflation ?? 0) - (a.inflation ?? 0)),
    [rows]
  );

  const barLabel = useMemo(() => makeBarLabel(barData), [barData]);

  const inflMin = barData.length > 0 ? Math.min(...barData.map(d => d.inflation!)) : -0.2;
  const inflMax = barData.length > 0 ? Math.max(...barData.map(d => d.inflation!)) : 0.2;
  const domMin = Math.floor((inflMin - 0.06) * 20) / 20;
  const domMax = Math.ceil((inflMax + 0.06) * 20) / 20;

  const MODE_LABELS: Record<string, string> = {
    latest: 'Siste (2025)',
    avg:    'Snitt (2023–2025)',
    2024:   '2024',
    2023:   '2023',
  };

  return (
    <div className="space-y-6">
      {/* Year mode selector — applies to all sections */}
      <div className="flex items-center gap-3 flex-wrap">
        <span style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Data:</span>
        <div className="flex gap-1 flex-wrap">
          {(['latest', 'avg', 2024, 2023] as YearMode[]).map((mode) => (
            <button
              key={String(mode)}
              onClick={() => setYearMode(mode)}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                border: `1.5px solid ${yearMode === mode ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)'}`,
                backgroundColor: yearMode === mode ? 'var(--nmbu-green-dark)' : 'transparent',
                color: yearMode === mode ? '#fff' : 'var(--nmbu-neutral-2)',
                transition: 'all 0.12s',
              }}
            >
              {MODE_LABELS[String(mode)]}
            </button>
          ))}
        </div>
        {typeof yearMode === 'number' && (
          <span style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', opacity: 0.7 }}>
            · Institusjoner uten data for {yearMode} vises ikke
          </span>
        )}
      </div>

      <GradingHarshnessSummary universities={universities} yearMode={yearMode} />

      <div className="bg-white rounded-xl p-6 space-y-10"
        style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>

        <div>
          <h2 className="text-2xl mb-1"
            style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
            Karakterindeks
          </h2>
          <p className="text-sm" style={{ color: 'var(--nmbu-neutral-2)' }}>
            Lineær regresjon estimerer forventet snittkarakter basert på opptakspoeng (ordinær kvote, 2025).
            Karakterindeksen = faktisk − forventet: positivt tall indikerer at studenter oppnår høyere
            karakterer enn opptaksnivået alene tilsier.
            {yearMode === 'avg' && ' · Viser poolet snitt over 2023–2025.'}
          </p>
        </div>

        {/* ── 1. Scatter plot ──────────────────────────────────────────────── */}
        <section>
          <h3 className="text-base mb-4"
            style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
            1. Sammenheng mellom opptakspoeng og snittkarakter
          </h3>
          <div style={{
            border: '1px solid var(--nmbu-neutral-3)',
            borderRadius: 8,
            padding: '16px 4px 8px',
            backgroundColor: '#fafafa',
          }}>
            <ScatterPlot rows={rows} reg={reg} />
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--nmbu-neutral-2)' }}>
            Stiplet linje = regresjonstrendlinje. * Stipulert opptaksscore brukes der faktisk score ikke er tilgjengelig: HiØ=30,0, HiMolde=30,0, ONH=35,0 (privat), HVL=40,0 (Bergen~42–44, H+S åpent). BI og Kristiania er utelatt (privat, ingen stipulering).
          </p>
          {fullReg && <RegressionStatsBox reg={fullReg} xLabel="Opptakspoeng" yLabel="Snittkarakter" />}
        </section>

        {/* ── 2. Inflation ranking bar chart ───────────────────────────────── */}
        {barData.length > 0 && (
          <section>
            <h3 className="text-base mb-4"
              style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
              2. Karakterindeks per institusjon
            </h3>

            <div className="flex flex-wrap gap-4 mb-4 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
              {[
                { color: '#025c4f', label: 'Sterkt positiv (>0.15)' },
                { color: '#46b4a0', label: 'Svakt positiv (0.03–0.15)' },
                { color: '#9ca3af', label: 'Nær null (±0.03)' },
                { color: '#f87171', label: 'Svakt negativ (−0.03 til −0.15)' },
                { color: '#b91c1c', label: 'Sterkt negativ (<−0.15)' },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-1.5">
                  <span style={{
                    width: 12, height: 12, borderRadius: 2,
                    backgroundColor: item.color, display: 'inline-block', flexShrink: 0,
                  }} />
                  {item.label}
                </span>
              ))}
            </div>

            <div style={{ height: Math.max(200, barData.length * 54) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical"
                  margin={{ top: 4, right: 240, bottom: 4, left: 0 }}>
                  <CartesianGrid horizontal={false} stroke="var(--nmbu-neutral-3)" />
                  <XAxis
                    type="number"
                    domain={[domMin, domMax]}
                    tickFormatter={v => v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                    tick={{ fontSize: 11, fill: 'var(--nmbu-neutral-2)' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    type="category" dataKey="name" width={90}
                    tick={{ fontSize: 12, fill: 'var(--nmbu-neutral)', fontWeight: 500 }}
                    axisLine={false} tickLine={false}
                  />
                  <ReferenceLine x={0} stroke="var(--nmbu-neutral-2)" strokeWidth={1.5} />
                  <Tooltip
                    cursor={{ fill: 'rgba(2,92,79,0.06)' }}
                    contentStyle={{
                      border: '1px solid var(--nmbu-neutral-3)',
                      borderRadius: 8, fontSize: 12,
                    }}
                    formatter={(val: number) => [
                      `${val >= 0 ? '+' : ''}${val.toFixed(4)}`,
                      'Karakterindeks',
                    ]}
                  />
                  <Bar dataKey="inflation" radius={[0, 4, 4, 0]} label={barLabel}>
                    {barData.map(e => (
                      <Cell key={e.uniId} fill={barFill(e.inflation!)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* ── 3. Summary table ─────────────────────────────────────────────── */}
        <section>
          <h3 className="text-base mb-4"
            style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
            3. Sammendragstabell
          </h3>
          <div className="overflow-x-auto">
            <table className="border-collapse text-sm w-full" style={{ minWidth: '640px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
                  {[
                    { label: 'Nr.',               align: 'center', w: '44px' },
                    { label: 'Institusjon',        align: 'left',   w: 'auto' },
                    { label: 'Opptakspoeng',       align: 'right',  w: '130px' },
                    { label: 'Faktisk karakter',   align: 'right',  w: '140px' },
                    { label: 'Predikert karakter', align: 'right',  w: '150px' },
                    { label: 'Karakterindeks',     align: 'right',  w: '140px' },
                  ].map(col => (
                    <th key={col.label}
                      className={`px-3 py-2 text-${col.align}`}
                      style={{
                        color: 'var(--nmbu-neutral)', fontWeight: 600,
                        borderBottom: '2px solid var(--nmbu-neutral-3)',
                        width: col.w, whiteSpace: 'nowrap',
                      }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const icolor = row.inflation !== null ? indexTextColor(row.inflation) : '#6b7280';
                  const sign = row.inflation !== null && row.inflation >= 0 ? '+' : '';

                  const prog = ADMISSION_DATA.find(p => p.universityId === row.uniId);
                  const stipulated = prog?.stipulatedOrdinary;
                  let admDisplay = '–';
                  if (stipulated !== undefined) {
                    admDisplay = `${stipulated.toFixed(1)}*`;
                  } else if (row.admScore === null) {
                    admDisplay = 'Privat';
                  } else if (row.admScore === 0) {
                    admDisplay = `Alle inn (${ASSUMED_OPEN_ADMISSION}*)`;
                  } else {
                    admDisplay = row.admScore.toFixed(1);
                  }

                  return (
                    <tr key={row.uniId}
                      style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
                      <td className="px-3 py-2 text-center text-xs"
                        style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 500 }}>
                        {row.rank ?? '–'}
                      </td>
                      <td className="px-3 py-2"
                        style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>
                        {row.name}
                      </td>
                      <td className="px-3 py-2 text-right"
                        style={{ color: 'var(--nmbu-neutral)' }}>
                        {admDisplay}
                      </td>
                      <td className="px-3 py-2 text-right"
                        style={{ color: 'var(--nmbu-neutral)', fontWeight: 500 }}>
                        {row.gradeAvg.toFixed(3)}
                      </td>
                      <td className="px-3 py-2 text-right"
                        style={{ color: 'var(--nmbu-neutral)' }}>
                        {row.predicted !== null ? row.predicted.toFixed(3) : '–'}
                      </td>
                      <td className="px-3 py-2 text-right"
                        style={{ color: icolor, fontWeight: 700 }}>
                        {row.inflation !== null
                          ? `${sign}${row.inflation.toFixed(3)}`
                          : '–'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--nmbu-neutral-2)' }}>
            En positiv karakterindeks indikerer at studentene oppnår høyere karakterer enn det opptaksnivået alene skulle tilsi. En negativ karakterindeks indikerer at studentene oppnår lavere karakterer enn forventet basert på opptaksnivået.
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--nmbu-neutral-3)' }}>
            Regresjonsmodell: Snittkarakter = a + b × Opptakspoeng (ordinær kvote). * HiØ har åpent opptak; opptakspoeng 30.0 er antatt i regresjonsmodellen. Private institusjoner (BI, Kristiania) er utelatt. Kilde: karakterweb.no (manuelt hentet 2025–2026) og Samordna Opptak (poenggrenser 2025).
          </p>
        </section>
      </div>
    </div>
  );
}
