import { useState, useMemo, createContext, useContext } from 'react';
import {
  NMBU_PROGRAMS_V26, NMBU_STUDENTS_V26, NMBU_ADMISSION_V26,
  NMBU_PROGRAMS_V25, NMBU_STUDENTS_V25, NMBU_ADMISSION_V25,
  NMBU_PROGRAMS_SAMLET, NMBU_STUDENTS_SAMLET, NMBU_ADMISSION_SAMLET,
  canonicalInstitution,
  type NMBUProgramId, type NMBUStudent, type NMBUProgramMeta, type NMBUAdmissionRecord,
} from '../data/nmbuMasterData';
import { NMBUStudentTable } from './NMBUStudentTable';
import { NMBUSemesterView } from './NMBUSemesterView';

// ── Cohort context ─────────────────────────────────────────────────────────────
type CohortData = {
  students: NMBUStudent[];
  admission: Record<number, NMBUAdmissionRecord>;
  programs: NMBUProgramMeta[];
  label: string;
};

const CohortCtx = createContext<CohortData>({
  students: NMBU_STUDENTS_V26, admission: NMBU_ADMISSION_V26,
  programs: NMBU_PROGRAMS_V26, label: 'Vår 2026',
});
const useCohort = () => useContext(CohortCtx);

type CohortYear = '2025' | '2026' | 'samlet';

const COHORT_DATA: Record<CohortYear, CohortData> = {
  '2026': { students: NMBU_STUDENTS_V26, admission: NMBU_ADMISSION_V26, programs: NMBU_PROGRAMS_V26, label: 'Vår 2026' },
  '2025': { students: NMBU_STUDENTS_V25, admission: NMBU_ADMISSION_V25, programs: NMBU_PROGRAMS_V25, label: 'Vår 2025' },
  'samlet': { students: NMBU_STUDENTS_SAMLET, admission: NMBU_ADMISSION_SAMLET, programs: NMBU_PROGRAMS_SAMLET, label: 'Samlet (2025 + 2026)' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const GRADE_LABELS: Record<number, string> = { 5: 'A', 4: 'B', 3: 'C', 2: 'D', 1: 'E', 0: 'F' };

function yJitter(id: number, progIdx: number): number {
  return (((id * 7 + progIdx * 31 + 17) % 100) / 100 - 0.5) * 0.36;
}

function diffSign(d: number) { return d >= 0 ? '+' : ''; }

// ── Slope chart ────────────────────────────────────────────────────────────────
function SlopeChart() {
  const { programs } = useCohort();
  const W = 520, H = 300;
  const leftX = 110, rightX = 410;
  const yMin = 2.8, yMax = 5.1;
  const sy = (v: number) => 24 + (H - 48) * (1 - (v - yMin) / (yMax - yMin));
  const yTicks = [3.0, 3.5, 4.0, 4.5, 5.0];

  // One fixed quadrant per program index: [xFrac along line, yOffset from line, above/below]
  const labelCfg = [
    { xFrac: 0.27, yOff: -34 }, // M-ØA:    upper-left
    { xFrac: 0.73, yOff: -34 }, // M-BIOEC: upper-right
    { xFrac: 0.27, yOff:  34 }, // M-EI:    lower-left
    { xFrac: 0.73, yOff:  34 }, // M-ECON:  lower-right
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
      {yTicks.map(t => (
        <g key={t}>
          <line x1={leftX - 60} y1={sy(t)} x2={rightX + 80} y2={sy(t)} stroke="#f0f0f0" strokeWidth={1} />
          <text x={leftX - 66} y={sy(t) + 4} textAnchor="end" fontSize={10} fill="#9ca3af" fontFamily="system-ui, sans-serif">{t.toFixed(1)}</text>
        </g>
      ))}
      <text x={leftX} y={12} textAnchor="middle" fontSize={11} fontWeight={600} fill="#6b7280" fontFamily="system-ui, sans-serif">Emner snitt</text>
      <text x={rightX} y={12} textAnchor="middle" fontSize={11} fontWeight={600} fill="#6b7280" fontFamily="system-ui, sans-serif">Masteroppgave</text>

      {programs.map((prog, i) => {
        const lx = sy(prog.avgEmner);
        const rx = sy(prog.avgMaster);
        const improving = prog.avgMaster > prog.avgEmner;
        const cfg = labelCfg[i] ?? { xFrac: 0.5, yOff: -30 };

        // Point on the slope line at xFrac
        const lineX = leftX + (rightX - leftX) * cfg.xFrac;
        const lineY = lx + (rx - lx) * cfg.xFrac;
        const labelCenterY = lineY + cfg.yOff;

        const labelText = `${improving ? '▲' : '▼'} ${diffSign(prog.diff)}${prog.diff.toFixed(2)} · ${prog.shortName}`;
        const boxW = labelText.length * 5.6 + 14;
        const boxH = 18;
        const boxX = lineX - boxW / 2;
        const boxY = labelCenterY - boxH / 2;
        // Leader connects line-point to nearest box edge
        const leaderEndY = cfg.yOff < 0 ? boxY + boxH : boxY;

        return (
          <g key={prog.id}>
            <line x1={leftX} y1={lx} x2={rightX} y2={rx} stroke={prog.color} strokeWidth={2} strokeOpacity={0.7} />
            {/* Thin leader from slope to label box */}
            <line x1={lineX} y1={lineY} x2={lineX} y2={leaderEndY}
              stroke={prog.color} strokeWidth={0.9} strokeOpacity={0.4} strokeDasharray="3 2" />
            {/* Left endpoint dot + value */}
            <circle cx={leftX} cy={lx} r={6} fill={prog.color} fillOpacity={0.85} />
            <text x={leftX - 10} y={lx + 4} textAnchor="end" fontSize={10.5} fontWeight={600} fill={prog.color} fontFamily="system-ui, sans-serif">{prog.avgEmner.toFixed(2)}</text>
            {/* Right endpoint dot + value */}
            <circle cx={rightX} cy={rx} r={7} fill={prog.color} />
            <text x={rightX + 10} y={rx + 4} textAnchor="start" fontSize={10.5} fontWeight={600} fill={prog.color} fontFamily="system-ui, sans-serif">{prog.avgMaster.toFixed(2)}</text>
            {/* Colored label box */}
            <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={4}
              fill={prog.bgColor} stroke={prog.color} strokeWidth={1.3} />
            <text x={lineX} y={boxY + boxH * 0.70} textAnchor="middle"
              fontSize={9.5} fontWeight={700} fill={prog.color} fontFamily="system-ui, sans-serif">
              {labelText}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Scatter plot ───────────────────────────────────────────────────────────────
function ScatterPlot({ activePrograms }: { activePrograms: Set<NMBUProgramId> }) {
  const { students, programs } = useCohort();
  const filtered = students.filter(s => s.emnerAvg !== null && activePrograms.has(s.program));
  const progIdx = Object.fromEntries(programs.map((p, i) => [p.id, i]));
  const colorOf = Object.fromEntries(programs.map(p => [p.id, p.color]));

  const W = 680, H = 400;
  const M = { top: 28, right: 28, bottom: 56, left: 72 };
  const PW = W - M.left - M.right;
  const PH = H - M.top - M.bottom;
  const X_MIN = 1.2, X_MAX = 5.4, Y_MIN = 1.6, Y_MAX = 5.6;
  const sx = (v: number) => ((v - X_MIN) / (X_MAX - X_MIN)) * PW;
  const sy = (v: number) => PH - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * PH;
  const xTicks = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
  const yGrades = [2, 3, 4, 5];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
      <g transform={`translate(${M.left},${M.top})`}>
        {yGrades.map((g, i) => (
          <rect key={g} x={0} y={sy(g + 0.5)} width={PW} height={sy(g - 0.5) - sy(g + 0.5)} fill={i % 2 === 0 ? '#fafafa' : '#f3f4f6'} />
        ))}
        {xTicks.map(t => <line key={t} x1={sx(t)} y1={0} x2={sx(t)} y2={PH} stroke="#e5e7eb" strokeWidth={1} />)}
        <line x1={sx(Math.max(X_MIN, Y_MIN))} y1={sy(Math.max(X_MIN, Y_MIN))} x2={sx(Math.min(X_MAX, Y_MAX))} y2={sy(Math.min(X_MAX, Y_MAX))} stroke="#d1d5db" strokeWidth={1.2} strokeDasharray="5 3" />
        <text x={sx(5.1)} y={sy(5.1) - 5} fontSize={9} fill="#9ca3af" fontFamily="system-ui, sans-serif" textAnchor="middle">y = x</text>

        {filtered.map(s => {
          const pIdx = progIdx[s.program] ?? 0;
          const jy = yJitter(s.id, pIdx);
          return <circle key={s.id} cx={sx(s.emnerAvg!)} cy={sy(s.masterGrade + jy)} r={4.5} fill={colorOf[s.program]} fillOpacity={0.65} stroke={colorOf[s.program]} strokeOpacity={0.9} strokeWidth={0.5} />;
        })}

        {programs.filter(p => activePrograms.has(p.id)).map(prog => {
          const cx = sx(prog.avgEmner), cy = sy(prog.avgMaster), s = 9;
          return <polygon key={prog.id} points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`} fill={prog.color} stroke="#fff" strokeWidth={1.5} />;
        })}

        <line x1={0} y1={PH} x2={PW} y2={PH} stroke="#d1d5db" strokeWidth={1.5} />
        <line x1={0} y1={0} x2={0} y2={PH} stroke="#d1d5db" strokeWidth={1.5} />
        {xTicks.map(t => (
          <g key={t}>
            <line x1={sx(t)} y1={PH} x2={sx(t)} y2={PH + 5} stroke="#d1d5db" />
            <text x={sx(t)} y={PH + 16} textAnchor="middle" fontSize={10} fill="#6b7280" fontFamily="system-ui, sans-serif">{t.toFixed(1)}</text>
          </g>
        ))}
        {yGrades.map(g => (
          <g key={g}>
            <line x1={-5} y1={sy(g)} x2={0} y2={sy(g)} stroke="#d1d5db" />
            <text x={-10} y={sy(g) + 4} textAnchor="end" fontSize={11} fontWeight={600} fill="#374151" fontFamily="system-ui, sans-serif">{GRADE_LABELS[g]}</text>
            <text x={-25} y={sy(g) + 4} textAnchor="end" fontSize={9} fill="#9ca3af" fontFamily="system-ui, sans-serif">({g})</text>
          </g>
        ))}
        <text x={PW / 2} y={PH + 42} textAnchor="middle" fontSize={11} fill="#6b7280" fontFamily="system-ui, sans-serif">Snitt emner på masternivå (vektet, A=5 … F=0)</text>
        <text transform={`translate(-58,${PH / 2}) rotate(-90)`} textAnchor="middle" fontSize={11} fill="#6b7280" fontFamily="system-ui, sans-serif">Masteroppgave</text>
      </g>
    </svg>
  );
}

// ── Grade distribution bars ────────────────────────────────────────────────────
function GradeDistBars() {
  const { students, programs } = useCohort();
  const gradeKeys = [5, 4, 3, 2, 1, 0];
  const gradeColors: Record<number, string> = { 5: '#025c4f', 4: '#2D8A65', 3: '#5BA67A', 2: '#F59E0B', 1: '#F97316', 0: '#EF4444' };

  return (
    <div className="grid grid-cols-2 gap-4">
      {programs.map(prog => {
        const progStudents = students.filter(s => s.program === prog.id);
        const total = progStudents.length;
        const counts = Object.fromEntries(gradeKeys.map(g => [g, 0]));
        progStudents.forEach(s => { counts[s.masterGrade] = (counts[s.masterGrade] ?? 0) + 1; });
        return (
          <div key={prog.id} style={{ border: `1px solid ${prog.color}30`, borderRadius: 10, padding: '12px 14px', backgroundColor: prog.bgColor + '60' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: prog.color, marginBottom: 10 }}>
              {prog.shortName} · {prog.name}<span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 6 }}>n={total}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {gradeKeys.filter(g => counts[g] > 0).map(g => {
                const pct = (counts[g] / total) * 100;
                return (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 18, fontSize: 11, fontWeight: 700, color: gradeColors[g], textAlign: 'right' }}>{GRADE_LABELS[g]}</div>
                    <div style={{ flex: 1, height: 16, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: gradeColors[g], borderRadius: 3 }} />
                    </div>
                    <div style={{ width: 36, fontSize: 10, color: '#6b7280', textAlign: 'right' }}>{counts[g]} ({pct.toFixed(0)}%)</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── OLS regression ─────────────────────────────────────────────────────────────
function linReg(pts: { x: number; y: number }[]) {
  const n = pts.length;
  if (n < 4) return null;
  const xM = pts.reduce((s, p) => s + p.x, 0) / n;
  const yM = pts.reduce((s, p) => s + p.y, 0) / n;
  const ssXX = pts.reduce((s, p) => s + (p.x - xM) ** 2, 0);
  const ssXY = pts.reduce((s, p) => s + (p.x - xM) * (p.y - yM), 0);
  const ssYY = pts.reduce((s, p) => s + (p.y - yM) ** 2, 0);
  if (ssXX === 0) return null;
  const slope = ssXY / ssXX;
  const intercept = yM - slope * xM;
  const r2 = ssYY > 0 ? (ssXY ** 2) / (ssXX * ssYY) : 0;
  return { slope, intercept, r2, r: Math.sign(slope) * Math.sqrt(r2), n };
}

// ── Opptakssnitt scatter ───────────────────────────────────────────────────────
function OpptaksScatter({ activePrograms }: { activePrograms: Set<NMBUProgramId> }) {
  const { students, admission, programs } = useCohort();
  const colorOf = Object.fromEntries(programs.map(p => [p.id, p.color]));
  const progIdx = Object.fromEntries(programs.map((p, i) => [p.id, i]));
  const filtered = students.filter(s => admission[s.id]?.opptakssnitt != null && activePrograms.has(s.program));

  const W = 680, H = 380;
  const M = { top: 28, right: 30, bottom: 56, left: 72 };
  const PW = W - M.left - M.right;
  const PH = H - M.top - M.bottom;
  const X_MIN = 2.45, X_MAX = 5.1, Y_MIN = 1.6, Y_MAX = 5.6;
  const sx = (v: number) => ((v - X_MIN) / (X_MAX - X_MIN)) * PW;
  const sy = (v: number) => PH - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * PH;
  const xTicks = [2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
  const yGrades = [2, 3, 4, 5];
  const regPts = filtered.map(s => ({ x: admission[s.id]!.opptakssnitt!, y: s.masterGrade }));
  const reg = linReg(regPts);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
      <g transform={`translate(${M.left},${M.top})`}>
        {yGrades.map((g, i) => <rect key={g} x={0} y={sy(g + 0.5)} width={PW} height={sy(g - 0.5) - sy(g + 0.5)} fill={i % 2 === 0 ? '#fafafa' : '#f3f4f6'} />)}
        {xTicks.map(t => <line key={t} x1={sx(t)} y1={0} x2={sx(t)} y2={PH} stroke="#e5e7eb" strokeWidth={1} />)}

        {reg && (() => {
          const x1 = X_MIN, x2 = X_MAX;
          const y1 = Math.max(Y_MIN, Math.min(Y_MAX, reg.slope * x1 + reg.intercept));
          const y2 = Math.max(Y_MIN, Math.min(Y_MAX, reg.slope * x2 + reg.intercept));
          return <line x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)} stroke="#374151" strokeWidth={1.5} strokeDasharray="6 3" strokeOpacity={0.55} />;
        })()}

        {filtered.map(s => {
          const adm = admission[s.id]!;
          const pIdx = progIdx[s.program] ?? 0;
          const jitter = (((s.id * 7 + pIdx * 31 + 17) % 100) / 100 - 0.5) * 0.36;
          return <circle key={s.id} cx={sx(adm.opptakssnitt!)} cy={sy(s.masterGrade + jitter)} r={4.5} fill={colorOf[s.program]} fillOpacity={0.7} stroke={colorOf[s.program]} strokeOpacity={0.9} strokeWidth={0.5} />;
        })}

        <line x1={0} y1={PH} x2={PW} y2={PH} stroke="#d1d5db" strokeWidth={1.5} />
        <line x1={0} y1={0} x2={0} y2={PH} stroke="#d1d5db" strokeWidth={1.5} />
        {xTicks.map(t => (
          <g key={t}>
            <line x1={sx(t)} y1={PH} x2={sx(t)} y2={PH + 5} stroke="#d1d5db" />
            <text x={sx(t)} y={PH + 16} textAnchor="middle" fontSize={10} fill="#6b7280" fontFamily="system-ui, sans-serif">{t.toFixed(1)}</text>
          </g>
        ))}
        {yGrades.map(g => (
          <g key={g}>
            <line x1={-5} y1={sy(g)} x2={0} y2={sy(g)} stroke="#d1d5db" />
            <text x={-10} y={sy(g) + 4} textAnchor="end" fontSize={11} fontWeight={600} fill="#374151" fontFamily="system-ui, sans-serif">{GRADE_LABELS[g]}</text>
            <text x={-25} y={sy(g) + 4} textAnchor="end" fontSize={9} fill="#9ca3af" fontFamily="system-ui, sans-serif">({g})</text>
          </g>
        ))}
        <text x={PW / 2} y={PH + 42} textAnchor="middle" fontSize={11} fill="#6b7280" fontFamily="system-ui, sans-serif">Opptakssnitt (bachelor GPA)</text>
        <text transform={`translate(-58,${PH / 2}) rotate(-90)`} textAnchor="middle" fontSize={11} fill="#6b7280" fontFamily="system-ui, sans-serif">Masteroppgave</text>
        {reg && <text x={PW - 4} y={12} textAnchor="end" fontSize={10} fill="#6b7280" fontFamily="system-ui, sans-serif">r = {reg.r >= 0 ? '+' : ''}{reg.r.toFixed(2)} · R² = {(reg.r2 * 100).toFixed(1)}% · n = {reg.n}</text>}
      </g>
    </svg>
  );
}

// ── Institution table ──────────────────────────────────────────────────────────
function InstitusjonTable({ activePrograms }: { activePrograms: Set<NMBUProgramId> }) {
  const { students, admission } = useCohort();
  const [sortBy, setSortBy] = useState<'inst' | 'n' | 'opptaks' | 'master' | 'emner'>('n');
  const [asc, setAsc] = useState(false);

  type InstRow = { inst: string; n: number; avgOpptaks: number | null; avgMaster: number; avgEmner: number | null; };

  const rows = useMemo<InstRow[]>(() => {
    const map = new Map<string, { opptaks: number[]; master: number[]; emner: number[] }>();
    students.filter(s => activePrograms.has(s.program)).forEach(s => {
      const adm = admission[s.id];
      const inst = adm?.bachelorInstitusjon ? canonicalInstitution(adm.bachelorInstitusjon) ?? 'Ukjent' : 'Ukjent';
      if (!map.has(inst)) map.set(inst, { opptaks: [], master: [], emner: [] });
      const e = map.get(inst)!;
      if (adm?.opptakssnitt != null) e.opptaks.push(adm.opptakssnitt);
      e.master.push(s.masterGrade);
      if (s.emnerAvg != null) e.emner.push(s.emnerAvg);
    });
    const result: InstRow[] = [];
    map.forEach((v, inst) => {
      const avgOpptaks = v.opptaks.length > 0 ? v.opptaks.reduce((a, b) => a + b, 0) / v.opptaks.length : null;
      const avgMaster = v.master.reduce((a, b) => a + b, 0) / v.master.length;
      const avgEmner = v.emner.length > 0 ? v.emner.reduce((a, b) => a + b, 0) / v.emner.length : null;
      result.push({ inst, n: v.master.length, avgOpptaks, avgMaster, avgEmner });
    });
    return result.sort((a, b) => {
      let v = 0;
      if (sortBy === 'inst') v = a.inst.localeCompare(b.inst);
      else if (sortBy === 'n') v = a.n - b.n;
      else if (sortBy === 'opptaks') v = (a.avgOpptaks ?? -1) - (b.avgOpptaks ?? -1);
      else if (sortBy === 'master') v = a.avgMaster - b.avgMaster;
      else if (sortBy === 'emner') v = (a.avgEmner ?? -1) - (b.avgEmner ?? -1);
      return asc ? v : -v;
    });
  }, [students, admission, activePrograms, sortBy, asc]);

  function th(label: string, key: typeof sortBy) {
    const active = sortBy === key;
    return (
      <th onClick={() => { if (sortBy === key) setAsc(a => !a); else { setSortBy(key); setAsc(false); } }}
        style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none', color: active ? '#025c4f' : '#6b7280', borderBottom: '2px solid var(--nmbu-neutral-3)', backgroundColor: '#f9fafb', textAlign: key === 'inst' ? 'left' : 'center' }}>
        {label} <span style={{ color: active ? '#025c4f' : '#d1d5db' }}>{active ? (asc ? '↑' : '↓') : '↕'}</span>
      </th>
    );
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--nmbu-neutral-3)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>{th('Bachelor-institusjon', 'inst')}{th('n', 'n')}{th('Avg opptakssnitt', 'opptaks')}{th('Avg masteroppgave', 'master')}{th('Avg emner', 'emner')}</tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const masterLetter = GRADE_LABELS[Math.round(row.avgMaster)] ?? '?';
            const masterColor = { A: '#025c4f', B: '#1a7a55', C: '#ca8a04', D: '#ea580c' }[masterLetter] ?? '#6b7280';
            return (
              <tr key={row.inst} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#374151', fontSize: 13 }}>{row.inst}</td>
                <td style={{ padding: '8px 12px', textAlign: 'center', color: '#6b7280', fontSize: 12 }}>{row.n}</td>
                <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#374151' }}>
                  {row.avgOpptaks != null ? row.avgOpptaks.toFixed(2) : <span style={{ color: '#d1d5db' }}>—</span>}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 12, color: masterColor }}>{row.avgMaster.toFixed(2)} ({masterLetter})</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#6b7280' }}>
                  {row.avgEmner != null ? row.avgEmner.toFixed(2) : <span style={{ color: '#d1d5db' }}>—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Inntak section ─────────────────────────────────────────────────────────────
function InntakSection({ activePrograms, toggleProgram }: { activePrograms: Set<NMBUProgramId>; toggleProgram: (id: NMBUProgramId) => void }) {
  const { students, admission, programs, label } = useCohort();
  const totalWithData = students.filter(s => admission[s.id]?.opptakssnitt != null && activePrograms.has(s.program)).length;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <h3 className="text-base mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
          Opptakskvalitet vs. masteroppgavekarakter
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Hvert punkt er én student med tilgjengelig opptakssnitt (n = {totalWithData}).
          Stiplet linje = lineær regresjon (OLS). M-EI mangler opptaksdata i enkelte kull.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {programs.map(p => (
            <button key={p.id} onClick={() => toggleProgram(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 11, border: `1.5px solid ${p.color}`, backgroundColor: activePrograms.has(p.id) ? p.color : 'transparent', color: activePrograms.has(p.id) ? '#fff' : p.color, cursor: 'pointer', transition: 'all 0.12s' }}>
              <span style={{ fontWeight: 700 }}>{p.shortName}</span>
              <span style={{ opacity: 0.8 }}>{p.name}</span>
            </button>
          ))}
        </div>
        <div style={{ border: '1px solid var(--nmbu-neutral-3)', borderRadius: 8, padding: '16px 8px 8px', backgroundColor: '#fafafa' }}>
          <OpptaksScatter activePrograms={activePrograms} />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--nmbu-neutral-2)' }}>Y-akse viser masteroppgavekarakter med liten deterministisk jitter (±0,18) for å skille overlappende punkter.</p>
      </div>

      <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <h3 className="text-base mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Masterresultat per bachelor-institusjon</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Studenter gruppert etter bachelor-institusjon. «Kombinert» = oppgitt to eller flere institusjoner. Klikk kolonneoverskrift for å sortere.
        </p>
        <InstitusjonTable activePrograms={activePrograms} />
        <p className="text-xs mt-3" style={{ color: '#9ca3af' }}>
          Kilde: NMBU opptaksdata · {label} · M-EI opptaksdata delvis utilgjengelig.
        </p>
      </div>
    </div>
  );
}

// ── Raw data section ───────────────────────────────────────────────────────────
function RawDataSection() {
  const { students, admission, programs, label } = useCohort();
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)', overflow: 'hidden' }}>
      <button className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors" style={{ backgroundColor: open ? '#f9fafb' : '#fff' }} onClick={() => setOpen(v => !v)}>
        <div>
          <div className="text-base" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Rådata — karakterer per student</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--nmbu-neutral-2)' }}>
            Sortérbar og filtrerbar tabell med alle {students.length} studenter ({label}) · klikk for å vise
          </div>
        </div>
        <span style={{ fontSize: 20, color: 'var(--nmbu-green-dark)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2">
          <NMBUStudentTable students={students} admission={admission} programs={programs} />
        </div>
      )}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export function NMBUMasterAnalysis() {
  const [cohort, setCohort] = useState<CohortYear>('2026');
  const cohortData = COHORT_DATA[cohort];
  const { programs } = cohortData;

  const [activePrograms, setActivePrograms] = useState<Set<NMBUProgramId>>(
    new Set(NMBU_PROGRAMS_V26.map(p => p.id))
  );

  function toggleProgram(id: NMBUProgramId) {
    setActivePrograms(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  }

  const scatterCount = cohortData.students.filter(s => s.emnerAvg !== null && activePrograms.has(s.program)).length;

  return (
    <CohortCtx.Provider value={cohortData}>
      <div className="space-y-6">

        {/* ── Year toggle ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--nmbu-neutral-2)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Kull
          </span>
          {(['2025', '2026', 'samlet'] as CohortYear[]).map(y => (
            <button
              key={y}
              onClick={() => setCohort(y)}
              style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${cohort === y ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)'}`,
                backgroundColor: cohort === y ? 'var(--nmbu-green-dark)' : '#fff',
                color: cohort === y ? '#fff' : 'var(--nmbu-neutral-1)',
                cursor: 'pointer', transition: 'all 0.12s',
              }}
            >
              {y === 'samlet' ? 'Samlet' : `Vår ${y}`}
            </button>
          ))}
          <span style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginLeft: 4 }}>
            — {cohortData.label} · {cohortData.students.length} studenter totalt
          </span>
        </div>

        {/* ── Summary cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          {programs.map(prog => (
            <div key={prog.id}
              style={{ border: `2px solid ${activePrograms.has(prog.id) ? prog.color : '#e5e7eb'}`, borderRadius: 12, padding: '16px 18px', backgroundColor: activePrograms.has(prog.id) ? prog.bgColor : '#f9fafb', cursor: 'pointer', transition: 'all 0.15s', opacity: activePrograms.has(prog.id) ? 1 : 0.45 }}
              onClick={() => toggleProgram(prog.id)}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: prog.color, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
                {prog.shortName} · {prog.name}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>n = {prog.n} studenter · {cohortData.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Emner snitt</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#374151', fontFamily: "ui-monospace, 'Courier New', monospace" }}>{prog.avgEmner.toFixed(2)}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>({['F','E','D','C','B','A'][Math.round(prog.avgEmner)] ?? '?'})</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#15803d', fontWeight: 700 }}>▶</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: prog.diff >= 0.5 ? '#15803d' : prog.diff >= 0.2 ? '#b45309' : prog.diff < 0 ? '#dc2626' : '#6b7280', fontFamily: "ui-monospace, 'Courier New', monospace" }}>
                    {diffSign(prog.diff)}{prog.diff.toFixed(2)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Masteroppgave</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: prog.color, fontFamily: "ui-monospace, 'Courier New', monospace" }}>{prog.avgMaster.toFixed(2)}</div>
                  <div style={{ fontSize: 10, color: prog.color }}>({['F','E','D','C','B','A'][Math.round(prog.avgMaster)] ?? '?'})</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: '#9ca3af' }}>Klikk på et program for å filtrere scatterplottet nedenfor.</p>

        {/* ── Slope chart ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
          <h3 className="text-base mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Karakterutvikling per studieprogram</h3>
          <p className="text-xs mb-5" style={{ color: 'var(--nmbu-neutral-2)' }}>
            Gjennomsnittlig snitt av emner (vektet, masternivå) → snittkarakter masteroppgave. Tall fra CSV (institusjonsberegnet).
          </p>
          <SlopeChart />
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
            {programs.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: p.color }} />
                <span style={{ fontSize: 11, color: '#374151' }}>{p.shortName} – {p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scatter plot ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
          <h3 className="text-base mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Individuelt: emner snitt vs. masteroppgavekarakter</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--nmbu-neutral-2)' }}>
            Hvert punkt er én student (n = {scatterCount} med tilgjengelig emnersnitt).
            ◆ = programgjennomsnitt. Stiplet linje: masteroppgave = emnersnitt (y = x).
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {programs.map(p => (
              <button key={p.id} onClick={() => toggleProgram(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 11, border: `1.5px solid ${p.color}`, backgroundColor: activePrograms.has(p.id) ? p.color : 'transparent', color: activePrograms.has(p.id) ? '#fff' : p.color, cursor: 'pointer', transition: 'all 0.12s' }}>
                <span style={{ fontWeight: 700 }}>{p.shortName}</span>
                <span style={{ opacity: 0.8 }}>{p.name}</span>
              </button>
            ))}
          </div>
          <div style={{ border: '1px solid var(--nmbu-neutral-3)', borderRadius: 8, padding: '16px 8px 8px', backgroundColor: '#fafafa' }}>
            <ScatterPlot activePrograms={activePrograms} />
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--nmbu-neutral-2)' }}>
            * Y-akse viser masteroppgavekarakter med liten deterministisk jitter (±0,18) for å skille overlappende punkter.
          </p>
        </div>

        {/* ── Grade distribution ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
          <h3 className="text-base mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Karakterfordeling masteroppgave</h3>
          <p className="text-xs mb-5" style={{ color: 'var(--nmbu-neutral-2)' }}>Andel studenter per karakter på masteroppgaven, fordelt per studieprogram.</p>
          <GradeDistBars />
        </div>

        {/* ── Summary table ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
          <h3 className="text-base mb-4" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Oppsummering per program</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                {['Program', 'n', 'Snitt masteremner', 'Snitt masteroppgave', 'Differanse'].map(h => (
                  <th key={h} style={{ padding: '6px 12px', textAlign: h === 'Program' ? 'left' : 'center', fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {programs.map((prog, i) => (
                <tr key={prog.id} style={{ backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: prog.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 13 }}>{prog.shortName}</div>
                        <div style={{ color: '#6b7280', fontSize: 11 }}>{prog.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#374151' }}>{prog.n}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: "ui-monospace, monospace", color: '#374151' }}>
                    {prog.avgEmner.toFixed(2)}<span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 4 }}>({['F','E','D','C','B','A'][Math.round(prog.avgEmner)] ?? '?'})</span>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: "ui-monospace, monospace", fontWeight: 700, color: prog.color }}>
                    {prog.avgMaster.toFixed(2)}<span style={{ fontSize: 10, fontWeight: 400, color: prog.color, marginLeft: 4 }}>({['F','E','D','C','B','A'][Math.round(prog.avgMaster)] ?? '?'})</span>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, fontFamily: "ui-monospace, monospace", color: prog.diff >= 0.5 ? '#15803d' : prog.diff >= 0.2 ? '#b45309' : prog.diff < 0 ? '#dc2626' : '#6b7280' }}>
                      {diffSign(prog.diff)}{prog.diff.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs" style={{ color: '#9ca3af' }}>
            Kilde: NMBU interne karakterutskrifter · {cohortData.label} ·
            Emnersnitt = institusjonens vektede gjennomsnitt av masternivåemner før masteroppgaven.
          </p>
        </div>

        {/* ── Inntak og institusjonsbakgrunn ─────────────────────────────────── */}
        <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
          <h3 className="text-base mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Inntakskvalitet og studiebakgrunn</h3>
          <p className="text-xs mb-5" style={{ color: 'var(--nmbu-neutral-2)' }}>
            Sammenstilling av opptakssnitt (bachelorkarakter) med masterresultater — og fordeling per bachelor-institusjon.
          </p>
          <InntakSection activePrograms={activePrograms} toggleProgram={toggleProgram} />
        </div>

        {/* ── Semesterutvikling ──────────────────────────────────────────────── */}
        <NMBUSemesterView
          students={cohortData.students}
          admission={cohortData.admission}
          programs={cohortData.programs}
          cohortLabel={cohortData.label}
        />

        {/* ── Rådata ─────────────────────────────────────────────────────────── */}
        <RawDataSection />

      </div>
    </CohortCtx.Provider>
  );
}
