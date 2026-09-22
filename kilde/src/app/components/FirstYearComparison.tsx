import { useState } from 'react';
import { ChevronRight, X, ExternalLink, Info } from 'lucide-react';
import { COURSE_MAPPING, UNIVERSITY_INFO } from '../data/courseMapping';
import { FIRST_YEAR_DATA, type UniversityFirstYear } from '../data/firstYearData';
import { ADMISSION_DATA } from '../data/admissionData';
import { getGradesForMode, type YearMode } from '../data/courseHistory';

const GRADE_PTS: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

const GRADE_COLORS: Record<string, string> = {
  A: '#025C4F', B: '#2D8A65', C: '#5BA67A',
  D: '#F59E0B', E: '#F97316', F: '#EF4444',
};

const GRADE_ORDER = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

type GradeDist = { A: number; B: number; C: number; D: number; E: number; F: number };

function gradeAvg(grades: GradeDist): number | null {
  const total = Object.values(grades).reduce((s, v) => s + v, 0);
  if (total === 0) return null;
  return (Object.entries(grades) as [string, number][])
    .reduce((s, [g, c]) => s + GRADE_PTS[g] * c, 0) / total;
}

function letterGrade(avg: number): string {
  if (avg >= 4.5) return 'A';
  if (avg >= 3.5) return 'B';
  if (avg >= 2.5) return 'C';
  if (avg >= 1.5) return 'D';
  if (avg >= 0.5) return 'E';
  return 'F';
}

function avgColor(avg: number): string {
  if (avg >= 4.5) return GRADE_COLORS.A;
  if (avg >= 3.5) return GRADE_COLORS.B;
  if (avg >= 2.5) return GRADE_COLORS.C;
  if (avg >= 1.5) return GRADE_COLORS.D;
  if (avg >= 0.5) return GRADE_COLORS.E;
  return GRADE_COLORS.F;
}

function computeUniversityAvg(uniData: UniversityFirstYear, yearMode: YearMode = 'latest') {
  let wPts = 0, wCredits = 0;
  for (const cfg of uniData.courses) {
    const entry = COURSE_MAPPING[cfg.courseId]?.[uniData.universityId];
    if (!entry) continue;
    const grades = getGradesForMode(cfg.courseId, uniData.universityId, yearMode, entry.fallbackGrades) ?? entry.fallbackGrades;
    const avg = gradeAvg(grades);
    if (avg === null) continue;
    wPts += avg * cfg.credits;
    wCredits += cfg.credits;
  }
  return wCredits > 0 ? wPts / wCredits : null;
}

function aggregateGrades(uniData: UniversityFirstYear, yearMode: YearMode = 'latest'): GradeDist {
  const agg: GradeDist = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  for (const cfg of uniData.courses) {
    const entry = COURSE_MAPPING[cfg.courseId]?.[uniData.universityId];
    if (!entry) continue;
    const grades = getGradesForMode(cfg.courseId, uniData.universityId, yearMode, entry.fallbackGrades) ?? entry.fallbackGrades;
    for (const g of GRADE_ORDER) agg[g] += grades[g];
  }
  return agg;
}

function admissionBadge(universityId: string) {
  const entry = ADMISSION_DATA.find(d => d.universityId === universityId);
  const yr = entry?.years['2025'];
  if (!entry || !yr) return null;

  const fmt = (v: number | null, stip?: number) => {
    const val = stip !== undefined ? stip : v;
    if (val === null) return null;
    if (val === 0) return 'Åpent';
    return `${val.toFixed(1)}p`;
  };

  const ord = fmt(yr.ordinary, entry.stipulatedOrdinary);
  const ft  = yr.firstTimers !== null && yr.firstTimers !== 0 ? fmt(yr.firstTimers) : null;

  return { ord, ft };
}

function AdmissionBox({ universityId }: { universityId: string }) {
  const badge = admissionBadge(universityId);
  if (!badge) return null;
  return (
    <div style={{
      position: 'absolute', top: 10, right: 10,
      background: 'white',
      border: '1px solid var(--nmbu-neutral-3)',
      borderRadius: 8,
      padding: '5px 9px',
      boxShadow: '0 1px 4px rgba(2,92,79,0.10)',
      fontSize: 10,
      lineHeight: 1.5,
      textAlign: 'right',
      minWidth: 80,
    }}>
      <div style={{ color: '#9ca3af', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 2 }}>
        Opptak 2025
      </div>
      <div style={{ color: '#1f2937' }}>
        <span style={{ color: '#6b7280' }}>Ord.: </span>
        <strong>{badge.ord}</strong>
      </div>
      {badge.ft && (
        <div style={{ color: '#1f2937' }}>
          <span style={{ color: '#6b7280' }}>1.g.: </span>
          <strong>{badge.ft}</strong>
        </div>
      )}
    </div>
  );
}

function GradeBar({ grades, height = 14 }: { grades: GradeDist; height?: number }) {
  const total = Object.values(grades).reduce((s, v) => s + v, 0);
  if (total === 0) return <span style={{ fontSize: 11, color: '#9CA3AF' }}>–</span>;
  return (
    <div style={{ display: 'flex', height, borderRadius: 4, overflow: 'hidden', width: '100%' }}>
      {GRADE_ORDER.map(g => {
        const pct = (grades[g] / total) * 100;
        if (pct === 0) return null;
        return (
          <div key={g} title={`${g}: ${grades[g]} (${pct.toFixed(0)}%)`}
            style={{ width: `${pct}%`, background: GRADE_COLORS[g] }} />
        );
      })}
    </div>
  );
}

function GradeLegend() {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      {GRADE_ORDER.map(g => (
        <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 11, height: 11, borderRadius: 2, background: GRADE_COLORS[g] }} />
          <span style={{ fontSize: 11, color: '#6b7280' }}>{g}</span>
        </div>
      ))}
    </div>
  );
}

// ── Summary card (clickable) ──────────────────────────────────────────────────
function UniversitySummaryCard({
  uniData, isSelected, onClick, yearMode = 'latest',
}: {
  uniData: UniversityFirstYear;
  isSelected: boolean;
  onClick: () => void;
  yearMode?: YearMode;
}) {
  const info = UNIVERSITY_INFO[uniData.universityId];
  const avg = computeUniversityAvg(uniData, yearMode);
  const agg = aggregateGrades(uniData, yearMode);
  const totalN = Object.values(agg).reduce((s, v) => s + v, 0);
  const programUrl = info?.programUrl;

  if (uniData.missingData) {
    return (
      <div
        className="w-full rounded-xl overflow-hidden"
        style={{
          border: '1px dashed var(--nmbu-neutral-3)',
          boxShadow: '0 1px 4px rgba(2,92,79,0.04)',
          background: '#fafafa',
          position: 'relative',
        }}
      >
        {/* Top bar */}
        <div style={{
          background: '#f3f4f6',
          padding: '10px 16px',
          borderBottom: '1px dashed var(--nmbu-neutral-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Lora', serif", color: '#9ca3af' }}>
            {info?.shortName ?? uniData.universityId}
          </span>
          {programUrl && (
            <a
              href={programUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Åpne studieplan"
              style={{ color: '#9ca3af', display: 'flex', alignItems: 'center' }}
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
        {/* Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center' }}>
          <Info size={20} color="#d1d5db" />
          <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.5 }}>
            Emneinformasjon for 1. studieår<br />er ikke lagt inn ennå
          </div>
          {programUrl && (
            <a
              href={programUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11, color: 'var(--nmbu-green-dark)',
                display: 'flex', alignItems: 'center', gap: 4,
                textDecoration: 'none', fontWeight: 500,
              }}
            >
              Se studieplan <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl overflow-hidden transition-all"
      style={{
        border: isSelected
          ? '2px solid var(--nmbu-green-dark)'
          : '1px solid var(--nmbu-neutral-3)',
        boxShadow: isSelected
          ? '0 4px 16px rgba(2,92,79,0.18)'
          : '0 1px 4px rgba(2,92,79,0.07)',
        background: 'white',
        cursor: 'pointer',
        outline: 'none',
        position: 'relative',
      }}
    >
      <AdmissionBox universityId={uniData.universityId} />
      {/* Top bar */}
      <div style={{
        background: isSelected ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)',
        padding: '10px 16px',
        borderBottom: '1px solid var(--nmbu-neutral-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <span style={{
          fontWeight: 700, fontSize: 15,
          fontFamily: "'Lora', serif",
          color: isSelected ? 'white' : 'var(--nmbu-green-dark)',
        }}>
          {info?.shortName ?? uniData.universityId}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {programUrl && (
            <a
              href={programUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Åpne studieplan"
              onClick={e => e.stopPropagation()}
              style={{
                color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--nmbu-neutral-2)',
                display: 'flex', alignItems: 'center',
                padding: '2px',
              }}
            >
              <ExternalLink size={12} />
            </a>
          )}
          <ChevronRight
            size={16}
            style={{
              color: isSelected ? 'white' : 'var(--nmbu-green-dark)',
              transform: isSelected ? 'rotate(90deg)' : undefined,
              transition: 'transform 0.2s',
            }}
          />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Average badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {avg !== null ? (
            <div style={{
              width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
              background: avgColor(avg),
              color: 'white', fontWeight: 700, fontSize: 14,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span>{avg.toFixed(2)}</span>
              <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.85 }}>{letterGrade(avg)}</span>
            </div>
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e5e7eb', flexShrink: 0 }} />
          )}
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Vektet snitt 1. år</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>
              {uniData.courses.length} emner · {uniData.totalCredits} sp · n={totalN}
            </div>
          </div>
        </div>

        {/* Aggregate grade bar */}
        <div>
          <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Samlet karakterfordeling</div>
          <GradeBar grades={agg} height={12} />
        </div>

        <div style={{ fontSize: 11, color: isSelected ? 'var(--nmbu-green-dark)' : '#9ca3af', fontWeight: isSelected ? 600 : 400 }}>
          {isSelected ? 'Klikk for å lukke ↑' : 'Klikk for emnedetaljer →'}
        </div>
      </div>
    </button>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function UniversityDetailPanel({
  uniData, onClose, yearMode = 'latest',
}: {
  uniData: UniversityFirstYear;
  onClose: () => void;
  yearMode?: YearMode;
}) {
  const info = UNIVERSITY_INFO[uniData.universityId];

  const rows = uniData.courses.map(cfg => {
    const entry = COURSE_MAPPING[cfg.courseId]?.[uniData.universityId];
    const grades = entry ? (getGradesForMode(cfg.courseId, uniData.universityId, yearMode, entry.fallbackGrades) ?? entry.fallbackGrades) : null;
    const avg = grades ? gradeAvg(grades) : null;
    const total = grades ? Object.values(grades).reduce((s, v) => s + v, 0) : 0;
    return { cfg, entry, grades, avg, total };
  });

  let wPts = 0, wCredits = 0;
  for (const r of rows) {
    if (r.avg !== null) { wPts += r.avg * r.cfg.credits; wCredits += r.cfg.credits; }
  }
  const overallAvg = wCredits > 0 ? wPts / wCredits : null;

  return (
    <div
      className="bg-white rounded-xl overflow-hidden"
      style={{ border: '2px solid var(--nmbu-green-dark)', boxShadow: '0 4px 20px rgba(2,92,79,0.14)' }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: 'var(--nmbu-green-dark)' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'Lora', serif", fontSize: 18, color: 'white', fontWeight: 600 }}>
              {info?.name ?? uniData.universityId}
            </span>
            {info?.programUrl && (
              <a
                href={info.programUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Åpne studieplan"
                style={{ color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center' }}
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
            {uniData.programName} · {uniData.totalCredits} studiepoeng
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {overallAvg !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Vektet snitt
              </div>
              <div style={{
                width: 54, height: 54, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.5)',
                color: 'white', fontWeight: 700, fontSize: 15,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span>{overallAvg.toFixed(2)}</span>
                <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.85 }}>{letterGrade(overallAvg)}</span>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer',
              borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} color="white" />
          </button>
        </div>
      </div>

      {/* Course table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
              <th className="px-5 py-2 text-left" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 600, fontSize: 11, minWidth: 300 }}>Emne</th>
              <th className="px-3 py-2 text-center" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 600, fontSize: 11 }}>Sp</th>
              <th className="px-3 py-2 text-center" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 600, fontSize: 11 }}>n</th>
              <th className="px-5 py-2" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 600, fontSize: 11, minWidth: 200 }}>Karakterfordeling</th>
              <th className="px-3 py-2 text-center" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>Snitt</th>
              <th className="px-3 py-2 text-center" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 600, fontSize: 11 }}>Stryk%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const failPct = row.grades && row.total > 0
                ? (row.grades.F / row.total) * 100 : null;
              return (
                <tr key={row.cfg.courseId + i}
                  style={{
                    borderBottom: i < rows.length - 1 ? '1px solid #f3f4f6' : undefined,
                    background: i % 2 === 0 ? 'white' : '#fafafa',
                  }}
                >
                  <td className="px-5 py-3">
                    <div style={{ fontWeight: 500, fontSize: 12, color: '#1f2937' }}>
                      {row.cfg.overrideLabel ?? row.entry?.courseName ?? row.cfg.courseId}
                    </div>
                    {row.cfg.note && (
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>⚠ {row.cfg.note}</div>
                    )}
                    {row.entry?.examForm && !row.cfg.note && (
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{row.entry.examForm}</div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center" style={{ color: '#6b7280', fontSize: 12 }}>{row.cfg.credits}</td>
                  <td className="px-3 py-3 text-center" style={{ color: '#6b7280', fontSize: 12 }}>{row.total > 0 ? row.total : '–'}</td>
                  <td className="px-5 py-3">
                    {row.grades
                      ? <GradeBar grades={row.grades} />
                      : <span style={{ fontSize: 11, color: '#9CA3AF' }}>Ingen data</span>
                    }
                  </td>
                  <td className="px-3 py-3 text-center">
                    {row.avg !== null ? (
                      <span style={{ fontWeight: 700, fontSize: 13, color: avgColor(row.avg) }}>
                        {row.avg.toFixed(2)}
                        <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2, color: '#9ca3af' }}>
                          {letterGrade(row.avg)}
                        </span>
                      </span>
                    ) : <span style={{ color: '#9CA3AF' }}>–</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {failPct !== null ? (
                      <span style={{
                        fontSize: 12,
                        color: failPct >= 30 ? '#EF4444' : failPct >= 15 ? '#F59E0B' : '#6b7280',
                        fontWeight: failPct >= 30 ? 600 : 400,
                      }}>
                        {failPct.toFixed(0)}%
                      </span>
                    ) : <span style={{ color: '#9CA3AF' }}>–</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--nmbu-beige-light)', borderTop: '2px solid var(--nmbu-neutral-3)' }}>
              <td className="px-5 py-3" style={{ fontWeight: 600, fontSize: 12, color: 'var(--nmbu-green-dark)' }}>
                Vektet gjennomsnitt
              </td>
              <td className="px-3 py-3 text-center" style={{ fontWeight: 600, fontSize: 12, color: 'var(--nmbu-green-dark)' }}>
                {wCredits}
              </td>
              <td />
              <td className="px-5 py-3"><GradeLegend /></td>
              <td className="px-3 py-3 text-center">
                {overallAvg !== null ? (
                  <span style={{ fontWeight: 700, fontSize: 14, color: avgColor(overallAvg) }}>
                    {overallAvg.toFixed(2)}
                    <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2, color: '#9ca3af' }}>
                      {letterGrade(overallAvg)}
                    </span>
                  </span>
                ) : '–'}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const YEAR_MODE_LABELS: Record<string, string> = {
  latest: 'Siste (2025)',
  avg:    'Snitt (2023–2025)',
};

export function FirstYearComparison() {
  const [selected, setSelected] = useState<string | null>(null);
  const [yearMode, setYearMode] = useState<YearMode>('latest');
  const selectedData = FIRST_YEAR_DATA.find(u => u.universityId === selected) ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6"
        style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <h2 className="text-2xl mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
          Snittkarakterer – 1. studieår
        </h2>
        <p className="text-sm" style={{ color: 'var(--nmbu-neutral-1)' }}>
          Karakterfordeling og vektet snitt for første-årsemner. Klikk på et studiested for å se emneoversikt.
          Snittkarakter er vektet med studiepoeng. Datagrunnlag: karakterweb.no.
          {yearMode === 'avg' && ' · Viser poolet snitt over 2023–2025.'}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
          <span><strong>n</strong> = avlagte eksamener inkl. stryk</span>
          <span>·</span>
          <span><strong>Stryk%</strong> = andel F</span>
          <span>·</span>
          <span>Snitt: A=5, B=4, C=3, D=2, E=1, F=0</span>
        </div>
      </div>

      {/* Year mode selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Data:</span>
        <div className="flex gap-1">
          {(['latest', 'avg'] as YearMode[]).map((mode) => (
            <button
              key={String(mode)}
              onClick={() => { setYearMode(mode); setSelected(null); }}
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
              {YEAR_MODE_LABELS[String(mode)]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {FIRST_YEAR_DATA.map(u => (
          <UniversitySummaryCard
            key={u.universityId}
            uniData={u}
            isSelected={selected === u.universityId}
            onClick={() => setSelected(prev => prev === u.universityId ? null : u.universityId)}
            yearMode={yearMode}
          />
        ))}
      </div>

      {/* Detail panel */}
      {selectedData && (
        <UniversityDetailPanel
          uniData={selectedData}
          onClose={() => setSelected(null)}
          yearMode={yearMode}
        />
      )}
    </div>
  );
}
