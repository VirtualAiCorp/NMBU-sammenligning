import { useState, useMemo } from 'react';
import {
  NMBU_SEMESTERS_V25, NMBU_PROGRAM_SEMESTERS_V25,
  type NMBUProgramId, type NMBUStudent, type NMBUProgramMeta, type NMBUAdmissionRecord,
} from '../data/nmbuMasterData';

// ── Color helpers ──────────────────────────────────────────────────────────────
function semColor(v: number | null): string {
  if (v === null) return '#e5e7eb';
  if (v >= 4.5) return '#025c4f';
  if (v >= 3.75) return '#1a7a55';
  if (v >= 3.0) return '#ca8a04';
  if (v >= 2.0) return '#ea580c';
  return '#dc2626';
}

function semBg(v: number | null): string {
  if (v === null) return 'transparent';
  if (v >= 4.5) return '#e6f5f3';
  if (v >= 3.75) return '#dcfce7';
  if (v >= 3.0) return '#fef9c3';
  if (v >= 2.0) return '#ffedd5';
  return '#fee2e2';
}

// ── Reusable avg bar cell ──────────────────────────────────────────────────────
function SemCell({ v, bold }: { v: number | null; bold?: boolean }) {
  if (v === null) return <td style={{ padding: '6px 10px', textAlign: 'center', color: '#d1d5db', fontSize: 12 }}>—</td>;
  return (
    <td style={{ padding: '5px 8px', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
        <div style={{ width: 36, height: 5, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${(v / 5) * 100}%`, height: '100%', backgroundColor: semColor(v), borderRadius: 3 }} />
        </div>
        <span style={{
          fontFamily: 'ui-monospace, monospace', fontSize: bold ? 12 : 11.5, fontWeight: bold ? 700 : 500,
          color: semColor(v), minWidth: 30, textAlign: 'left',
        }}>
          {v.toFixed(2)}
        </span>
      </div>
    </td>
  );
}

// ── Trend arrow sem1 → sem3 ────────────────────────────────────────────────────
function Trend({ sem1, sem3 }: { sem1: number | null; sem3: number | null }) {
  if (sem1 === null || sem3 === null) return <span style={{ color: '#d1d5db' }}>—</span>;
  const diff = sem3 - sem1;
  const color = diff > 0.15 ? '#15803d' : diff < -0.15 ? '#dc2626' : '#6b7280';
  const arrow = diff > 0.15 ? '▲' : diff < -0.15 ? '▼' : '→';
  return <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 700, color }}>{arrow} {Math.abs(diff).toFixed(2)}</span>;
}

// ── Program summary matrix ─────────────────────────────────────────────────────
function ProgramSummaryMatrix({ programs }: { programs: NMBUProgramMeta[] }) {
  const progMap = Object.fromEntries(programs.map(p => [p.id, p]));
  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--nmbu-neutral-3)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
            {['Program', '1. sem · Høst 2023', '2. sem · Vår 2024', '3. sem · Høst 2024', 'Emnersnitt', 'Master', 'Trend H23→H24'].map(h => (
              <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#6b7280', textAlign: h === 'Program' ? 'left' : 'center', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {NMBU_PROGRAM_SEMESTERS_V25.map((ps, idx) => {
            const meta = progMap[ps.id];
            if (!meta) return null;
            return (
              <tr key={ps.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: meta.color }} />
                    <div>
                      <div style={{ fontWeight: 700, color: meta.color, fontSize: 12 }}>{meta.shortName}</div>
                      <div style={{ color: '#6b7280', fontSize: 11 }}>{meta.name}</div>
                    </div>
                  </div>
                </td>
                <SemCell v={ps.sem1} bold />
                <SemCell v={ps.sem2} bold />
                <SemCell v={ps.sem3} bold />
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 12, color: '#374151' }}>{meta.avgEmner.toFixed(2)}</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 12, color: meta.color }}>{meta.avgMaster.toFixed(2)}</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <Trend sem1={ps.sem1} sem3={ps.sem3} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Student detail table for one program ──────────────────────────────────────
type SortKey = 'id' | 'sem1' | 'sem2' | 'sem3' | 'emner' | 'master';

function StudentSemTable({
  students, admission, programMeta,
}: {
  students: NMBUStudent[];
  admission: Record<number, NMBUAdmissionRecord>;
  programMeta: NMBUProgramMeta;
}) {
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortAsc, setSortAsc] = useState(true);
  const hasSem2 = programMeta.id !== 'M30-EI';

  const ps = NMBU_PROGRAM_SEMESTERS_V25.find(p => p.id === programMeta.id);

  function handleSort(k: SortKey) {
    if (sortKey === k) setSortAsc(a => !a);
    else { setSortKey(k); setSortAsc(k === 'id'); }
  }

  const rows = useMemo(() => {
    const s = students.filter(s => s.program === programMeta.id);
    return [...s].sort((a, b) => {
      const sa = NMBU_SEMESTERS_V25[a.id];
      const sb = NMBU_SEMESTERS_V25[b.id];
      let v = 0;
      if (sortKey === 'id') v = a.id - b.id;
      else if (sortKey === 'sem1') v = (sa?.sem1 ?? -1) - (sb?.sem1 ?? -1);
      else if (sortKey === 'sem2') v = (sa?.sem2 ?? -1) - (sb?.sem2 ?? -1);
      else if (sortKey === 'sem3') v = (sa?.sem3 ?? -1) - (sb?.sem3 ?? -1);
      else if (sortKey === 'emner') v = (a.emnerAvg ?? -1) - (b.emnerAvg ?? -1);
      else if (sortKey === 'master') v = a.masterGrade - b.masterGrade;
      return sortAsc ? v : -v;
    });
  }, [students, programMeta.id, sortKey, sortAsc]);

  const thStyle = (k: SortKey): React.CSSProperties => ({
    padding: '8px 10px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
    whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none', textAlign: 'center',
    borderBottom: '2px solid var(--nmbu-neutral-3)', backgroundColor: '#f9fafb',
    color: sortKey === k ? programMeta.color : '#6b7280',
  });

  function Arrow({ k }: { k: SortKey }) {
    return sortKey === k ? <span style={{ marginLeft: 3 }}>{sortAsc ? '↑' : '↓'}</span> : <span style={{ color: '#d1d5db', marginLeft: 3 }}>↕</span>;
  }

  const GRADE: Record<number, string> = { 5: 'A', 4: 'B', 3: 'C', 2: 'D', 1: 'E', 0: 'F' };
  const GRADE_COLOR: Record<string, string> = { A: '#025c4f', B: '#1a7a55', C: '#ca8a04', D: '#ea580c', E: '#dc2626', F: '#991b1b' };

  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, border: `1px solid ${programMeta.color}30` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle('id'), textAlign: 'left' }} onClick={() => handleSort('id')}>
              Student <Arrow k="id" />
            </th>
            <th style={thStyle('sem1')} onClick={() => handleSort('sem1')}>
              1. sem · Høst 2023 <Arrow k="sem1" />
            </th>
            {hasSem2 && (
              <th style={thStyle('sem2')} onClick={() => handleSort('sem2')}>
                2. sem · Vår 2024 <Arrow k="sem2" />
              </th>
            )}
            <th style={thStyle('sem3')} onClick={() => handleSort('sem3')}>
              3. sem · Høst 2024 <Arrow k="sem3" />
            </th>
            <th style={thStyle('emner')} onClick={() => handleSort('emner')}>
              Emnersnitt <Arrow k="emner" />
            </th>
            <th style={thStyle('master')} onClick={() => handleSort('master')}>
              Master <Arrow k="master" />
            </th>
            <th style={{ ...thStyle('id'), cursor: 'default' }}>Trend H23→H24</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s, idx) => {
            const sem = NMBU_SEMESTERS_V25[s.id];
            const letter = GRADE[s.masterGrade] ?? '?';
            return (
              <tr key={s.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : programMeta.bgColor + '30', borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '6px 12px', color: '#6b7280', fontSize: 11.5, fontVariantNumeric: 'tabular-nums' }}>{s.id}</td>
                <SemCell v={sem?.sem1 ?? null} />
                {hasSem2 && <SemCell v={sem?.sem2 ?? null} />}
                <SemCell v={sem?.sem3 ?? null} />
                <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                  {s.emnerAvg !== null
                    ? <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, fontWeight: 600, color: semColor(s.emnerAvg) }}>{s.emnerAvg.toFixed(2)}</span>
                    : <span style={{ color: '#d1d5db' }}>—</span>}
                </td>
                <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, backgroundColor: (GRADE_COLOR[letter] ?? '#6b7280') + '18', color: GRADE_COLOR[letter] ?? '#6b7280', fontWeight: 700, fontSize: 12, padding: '2px 8px', borderRadius: 5, border: `1px solid ${(GRADE_COLOR[letter] ?? '#6b7280')}40` }}>
                    {letter}
                  </span>
                </td>
                <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                  <Trend sem1={sem?.sem1 ?? null} sem3={sem?.sem3 ?? null} />
                </td>
              </tr>
            );
          })}
          {/* Program average row */}
          {ps && (
            <tr style={{ backgroundColor: programMeta.bgColor, borderTop: '2px solid ' + programMeta.color + '40' }}>
              <td style={{ padding: '8px 12px', fontWeight: 700, color: programMeta.color, fontSize: 12 }}>Snitt program</td>
              <SemCell v={ps.sem1} bold />
              {hasSem2 && <SemCell v={ps.sem2} bold />}
              <SemCell v={ps.sem3} bold />
              <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 12, color: semColor(programMeta.avgEmner) }}>{programMeta.avgEmner.toFixed(2)}</span>
              </td>
              <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 12, color: programMeta.color }}>{programMeta.avgMaster.toFixed(2)}</span>
              </td>
              <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                <Trend sem1={ps.sem1} sem3={ps.sem3} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
interface Props {
  students: NMBUStudent[];
  admission: Record<number, NMBUAdmissionRecord>;
  programs: NMBUProgramMeta[];
  cohortLabel: string;
}

export function NMBUSemesterView({ students, admission, programs, cohortLabel }: Props) {
  const [activeProgram, setActiveProgram] = useState<NMBUProgramId | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const isV25 = cohortLabel.includes('2025');

  return (
    <div className="bg-white rounded-xl" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)', overflow: 'hidden' }}>
      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
        <h3 className="text-base mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
          Semesterutvikling — karaktersnitt per semester
        </h3>
        <p className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Vektet snitt per student per semester (Høst 2023 → Vår 2024 → Høst 2024) frem til masteroppgaven.
          {!isV25 && ' Semesterdata er kun tilgjengelig for vår 2025-kullet.'}
        </p>
      </div>

      {!isV25 ? (
        <div className="px-6 py-8 text-center" style={{ color: '#9ca3af', fontSize: 13 }}>
          Detaljert semesterdata er kun tilgjengelig for <strong>Vår 2025</strong>-kullet.
          Bytt kohort i toppen av siden for å se denne oversikten.
        </div>
      ) : (
        <div className="px-6 py-5 space-y-5">
          {/* Program summary matrix */}
          <ProgramSummaryMatrix programs={programs} />

          {/* Detail toggle */}
          <button
            className="w-full flex items-center justify-between px-5 py-3 rounded-lg text-left transition-colors"
            style={{ backgroundColor: showDetail ? '#f0fdf4' : '#f9fafb', border: '1px solid var(--nmbu-neutral-3)', cursor: 'pointer' }}
            onClick={() => setShowDetail(v => !v)}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>Per-student semestertabell</div>
              <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginTop: 2 }}>
                Sorterbar tabell med alle {students.filter(s => NMBU_SEMESTERS_V25[s.id] !== undefined).length} studenter · klikk for å vise
              </div>
            </div>
            <span style={{ fontSize: 18, color: 'var(--nmbu-green-dark)', transition: 'transform 0.2s', transform: showDetail ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>

          {showDetail && (
            <div className="space-y-4">
              {/* Program filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveProgram(null)}
                  style={{ padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${activeProgram === null ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)'}`, backgroundColor: activeProgram === null ? 'var(--nmbu-green-dark)' : '#fff', color: activeProgram === null ? '#fff' : 'var(--nmbu-neutral-1)', transition: 'all 0.12s' }}>
                  Alle
                </button>
                {programs.map(p => (
                  <button key={p.id} onClick={() => setActiveProgram(p.id === activeProgram ? null : p.id)}
                    style={{ padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${activeProgram === p.id ? p.color : '#d1d5db'}`, backgroundColor: activeProgram === p.id ? p.color : '#fff', color: activeProgram === p.id ? '#fff' : p.color, transition: 'all 0.12s' }}>
                    {p.shortName}
                  </button>
                ))}
              </div>

              {/* Tables */}
              {programs
                .filter(p => activeProgram === null || p.id === activeProgram)
                .map(prog => (
                  <div key={prog.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: prog.color }} />
                      <span style={{ fontWeight: 700, color: prog.color, fontSize: 13 }}>{prog.shortName}</span>
                      <span style={{ color: '#6b7280', fontSize: 12 }}>{prog.name}</span>
                      {prog.id === 'M30-EI' && (
                        <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 4 }}>· Vår 2024 ikke relevant for M-EI</span>
                      )}
                    </div>
                    <StudentSemTable students={students} admission={admission} programMeta={prog} />
                  </div>
                ))}

              <p style={{ fontSize: 10, color: '#9ca3af' }}>
                Kilde: NMBU interne karakterutskrifter · Vår 2025 · Vektet semestersnitt er institusjonens beregning fra CSV-eksport.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
