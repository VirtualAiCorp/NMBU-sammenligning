import { useState, useMemo } from 'react';
import {
  canonicalInstitution,
  type NMBUProgramId, type NMBUStudent, type NMBUProgramMeta, type NMBUAdmissionRecord,
} from '../data/nmbuMasterData';

const GRADE_LETTER: Record<number, string> = { 5: 'A', 4: 'B', 3: 'C', 2: 'D', 1: 'E', 0: 'F' };

const GRADE_COLOR: Record<string, string> = {
  A: '#025c4f', B: '#1a7a55', C: '#ca8a04', D: '#ea580c', E: '#dc2626', F: '#991b1b',
};

function emnerColor(v: number): string {
  if (v >= 4.5) return '#025c4f';
  if (v >= 3.5) return '#1a7a55';
  if (v >= 2.5) return '#ca8a04';
  if (v >= 1.5) return '#ea580c';
  return '#dc2626';
}

function diffColor(d: number): string {
  if (d >= 1.0) return '#025c4f';
  if (d >= 0.5) return '#1a7a55';
  if (d >= 0.1) return '#15803d';
  if (d >= -0.1) return '#6b7280';
  return '#dc2626';
}

function opptaksColor(v: number): string {
  if (v >= 4.5) return '#025c4f';
  if (v >= 4.0) return '#1a7a55';
  if (v >= 3.5) return '#15803d';
  if (v >= 3.0) return '#b45309';
  return '#6b7280';
}

type SortKey = 'id' | 'program' | 'opptakssnitt' | 'emnerAvg' | 'masterGrade' | 'diff';

interface Props {
  students: NMBUStudent[];
  admission: Record<number, NMBUAdmissionRecord>;
  programs: NMBUProgramMeta[];
}

export function NMBUStudentTable({ students, admission, programs }: Props) {
  const progMap = Object.fromEntries(programs.map(p => [p.id, p]));

  const [activePrograms, setActivePrograms] = useState<Set<NMBUProgramId>>(
    new Set(programs.map(p => p.id))
  );
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortAsc, setSortAsc] = useState(true);

  function toggleProg(id: NMBUProgramId) {
    setActivePrograms(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(key === 'id'); }
  }

  const rows = useMemo(() => {
    const filtered = students.filter(s => activePrograms.has(s.program));
    return [...filtered].sort((a, b) => {
      const admA = admission[a.id];
      const admB = admission[b.id];
      let v = 0;
      if (sortKey === 'id')           v = a.id - b.id;
      else if (sortKey === 'program') v = a.program.localeCompare(b.program);
      else if (sortKey === 'opptakssnitt') {
        const av = admA?.opptakssnitt ?? -1;
        const bv = admB?.opptakssnitt ?? -1;
        v = av - bv;
      }
      else if (sortKey === 'emnerAvg') {
        const av = a.emnerAvg ?? -1, bv = b.emnerAvg ?? -1;
        v = av - bv;
      }
      else if (sortKey === 'masterGrade') v = a.masterGrade - b.masterGrade;
      else if (sortKey === 'diff') {
        const ad = a.emnerAvg !== null ? a.masterGrade - a.emnerAvg : -99;
        const bd = b.emnerAvg !== null ? b.masterGrade - b.emnerAvg : -99;
        v = ad - bd;
      }
      return sortAsc ? v : -v;
    });
  }, [students, admission, activePrograms, sortKey, sortAsc]);

  function SortArrow({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span style={{ color: '#d1d5db', marginLeft: 4 }}>↕</span>;
    return <span style={{ color: '#025c4f', marginLeft: 4 }}>{sortAsc ? '↑' : '↓'}</span>;
  }

  const thBase: React.CSSProperties = {
    padding: '9px 12px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid var(--nmbu-neutral-3)',
    backgroundColor: '#f9fafb',
  };

  const thStyle = (k: SortKey): React.CSSProperties => ({
    ...thBase,
    color: sortKey === k ? '#025c4f' : '#6b7280',
    cursor: 'pointer',
    userSelect: 'none',
  });

  const thPlain: React.CSSProperties = {
    ...thBase,
    color: '#6b7280',
    cursor: 'default',
    textAlign: 'center',
  };

  return (
    <div>
      {/* Program filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {programs.map(p => (
          <button key={p.id} onClick={() => toggleProg(p.id)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
            border: `1.5px solid ${p.color}`,
            backgroundColor: activePrograms.has(p.id) ? p.color : 'transparent',
            color: activePrograms.has(p.id) ? '#fff' : p.color,
            transition: 'all 0.12s',
          }}>
            <span style={{ fontWeight: 700 }}>{p.shortName}</span>
            <span style={{ opacity: 0.85 }}>{p.name}</span>
          </button>
        ))}
        <span style={{ fontSize: 11, color: '#9ca3af', alignSelf: 'center', marginLeft: 8 }}>
          {rows.length} studenter vist
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--nmbu-neutral-3)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={thStyle('id')} onClick={() => handleSort('id')}>
                Studentnr <SortArrow k="id" />
              </th>
              <th style={thStyle('program')} onClick={() => handleSort('program')}>
                Program <SortArrow k="program" />
              </th>
              <th style={{ ...thBase, color: '#6b7280', cursor: 'default' }}>
                Bachelor-institusjon
              </th>
              <th style={{ ...thStyle('opptakssnitt'), textAlign: 'center' }} onClick={() => handleSort('opptakssnitt')}>
                Opptakssnitt <SortArrow k="opptakssnitt" />
              </th>
              <th style={{ ...thStyle('emnerAvg'), textAlign: 'center' }} onClick={() => handleSort('emnerAvg')}>
                Emner snitt <SortArrow k="emnerAvg" />
              </th>
              <th style={thPlain}>
                Ant. emner
              </th>
              <th style={{ ...thStyle('masterGrade'), textAlign: 'center' }} onClick={() => handleSort('masterGrade')}>
                Masteroppgave <SortArrow k="masterGrade" />
              </th>
              <th style={{ ...thStyle('diff'), textAlign: 'center' }} onClick={() => handleSort('diff')}>
                Differanse <SortArrow k="diff" />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, idx) => {
              const prog = progMap[s.program];
              const adm = admission[s.id];
              const diff = s.emnerAvg !== null ? s.masterGrade - s.emnerAvg : null;
              const dSign = diff !== null && diff > 0 ? '+' : '';
              const masterLetter = GRADE_LETTER[s.masterGrade] ?? '?';
              const instLabel = adm?.bachelorInstitusjon
                ? (canonicalInstitution(adm.bachelorInstitusjon) ?? adm.bachelorInstitusjon)
                : null;

              return (
                <tr key={s.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '7px 12px', color: '#6b7280', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                    {s.id}
                  </td>
                  <td style={{ padding: '7px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: prog?.color ?? '#9ca3af', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, color: prog?.color ?? '#6b7280', fontSize: 12 }}>{prog?.shortName ?? s.program}</span>
                    </div>
                  </td>
                  <td style={{ padding: '7px 12px', fontSize: 12, color: instLabel ? '#374151' : '#d1d5db' }}>
                    {instLabel ?? '—'}
                  </td>
                  <td style={{ padding: '7px 12px', textAlign: 'center' }}>
                    {adm?.opptakssnitt != null ? (
                      <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 600, fontSize: 12, color: opptaksColor(adm.opptakssnitt) }}>
                        {adm.opptakssnitt.toFixed(2)}
                      </span>
                    ) : (
                      <span style={{ color: '#d1d5db', fontSize: 11 }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '7px 12px', textAlign: 'center' }}>
                    {s.emnerAvg !== null ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <div style={{ width: 40, height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${(s.emnerAvg / 5) * 100}%`, height: '100%', backgroundColor: emnerColor(s.emnerAvg), borderRadius: 3 }} />
                        </div>
                        <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 600, color: emnerColor(s.emnerAvg), fontSize: 12, minWidth: 30 }}>
                          {s.emnerAvg.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: '#d1d5db', fontSize: 11 }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '7px 12px', textAlign: 'center', color: '#6b7280', fontSize: 12 }}>
                    {s.numEmner}
                  </td>
                  <td style={{ padding: '7px 12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      backgroundColor: GRADE_COLOR[masterLetter] + '18',
                      color: GRADE_COLOR[masterLetter],
                      fontWeight: 700, fontSize: 13,
                      padding: '2px 10px', borderRadius: 6,
                      border: `1px solid ${GRADE_COLOR[masterLetter]}40`,
                    }}>
                      {masterLetter}
                      <span style={{ fontWeight: 400, fontSize: 10, opacity: 0.75 }}>({s.masterGrade})</span>
                    </span>
                  </td>
                  <td style={{ padding: '7px 12px', textAlign: 'center' }}>
                    {diff !== null ? (
                      <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, fontSize: 12, color: diffColor(diff) }}>
                        {dSign}{diff.toFixed(2)}
                      </span>
                    ) : (
                      <span style={{ color: '#d1d5db', fontSize: 11 }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 10 }}>
        Opptakssnitt = bachelor GPA brukt ved opptak til master (kjerne/180 stp). M-EI mangler opptaksdata.
        Differanse = masteroppgavekarakter (tall) − emner snitt.
      </p>
    </div>
  );
}
