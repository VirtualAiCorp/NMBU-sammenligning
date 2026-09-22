import { useState } from 'react';
import { MASTER_THESIS_DATA, MASTER_ADMISSION, UNIVERSITY_NAMES, THESIS_INFO, type MasterProgram, type ThesisGrades, type Specialization } from '../data/masterThesisData';

const UNIVERSITY_COLORS: Record<string, string> = {
  nmbu:      '#025C4F', // NMBU grønn
  ntnu:      '#00509E', // NTNU blå
  nhh:       '#C8DEDF', // NHH pastell turkis
  uit:       '#003349', // UiT mørk blå
  usn:       '#7800F0', // USN lilla
  oslomet:   '#FFD500', // OsloMet gul
  uia:       '#C8102E', // UiA rød
  bi:        '#0A223F', // BI mørk marineblå
  kristiania:'#C61932', // Kristiania rød
  nord:      '#9CA3AF', // Nord lysgrå
  uis:       '#004F9F', // UiS kongeblå
  inn:       '#2D5016', // INN mørkgrønn (brandfarge)
};

const GRADE_COLORS: Record<string, string> = {
  A: '#1a6b5a',
  B: '#2d9b80',
  C: '#6bbfa8',
  D: '#f0a040',
  E: '#e07030',
  F: '#c03030',
};

const GRADE_ORDER = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

function gradeAvg(grades: ThesisGrades): number {
  const values = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
  const total = GRADE_ORDER.reduce((s, g) => s + grades[g], 0);
  if (total === 0) return 0;
  return GRADE_ORDER.reduce((s, g) => s + grades[g] * values[g], 0) / total;
}

function GradeBar({ grades }: { grades: ThesisGrades }) {
  const total = GRADE_ORDER.reduce((s, g) => s + grades[g], 0);
  if (total === 0) return <div className="h-6 rounded" style={{ backgroundColor: 'var(--nmbu-neutral-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--nmbu-neutral-2)' }}>Ingen data</div>;

  return (
    <div style={{ display: 'flex', height: '24px', borderRadius: '6px', overflow: 'hidden', width: '100%' }}>
      {GRADE_ORDER.map((g) => {
        const count = grades[g];
        if (count === 0) return null;
        const pct = (count / total) * 100;
        return (
          <div
            key={g}
            title={`${g}: ${count} (${pct.toFixed(1)}%)`}
            style={{
              width: `${pct}%`,
              backgroundColor: GRADE_COLORS[g],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 600,
              color: '#fff',
            }}
          >
            {pct > 8 ? g : ''}
          </div>
        );
      })}
    </div>
  );
}

function GradeTable({ grades, year }: { grades: ThesisGrades; year: string }) {
  const total = GRADE_ORDER.reduce((s, g) => s + grades[g], 0);
  const avg = gradeAvg(grades);
  const avgLabel = ['F', 'E', 'D', 'C', 'B', 'A'][Math.round(avg)] ?? '–';

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
        <span style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '15px' }}>{year}</span>
        <span style={{ fontSize: '12px', opacity: 0.85 }}>
          {total} oppgaver · snitt {avg.toFixed(2)} ({avgLabel})
        </span>
      </div>
      <div className="p-4" style={{ backgroundColor: '#fff' }}>
        <GradeBar grades={grades} />
        <div className="mt-3 grid grid-cols-6 gap-1 text-center">
          {GRADE_ORDER.map((g) => {
            const count = grades[g];
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
            return (
              <div key={g} className="rounded-lg py-2" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
                <div style={{ color: GRADE_COLORS[g], fontWeight: 700, fontSize: '15px' }}>{g}</div>
                <div style={{ color: 'var(--nmbu-neutral-1)', fontSize: '18px', fontWeight: 600 }}>{count}</div>
                <div style={{ color: 'var(--nmbu-neutral-2)', fontSize: '11px' }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Group programs by university
function groupByUniversity(programs: MasterProgram[]): Map<string, MasterProgram[]> {
  const map = new Map<string, MasterProgram[]>();
  for (const p of programs) {
    if (!map.has(p.universityId)) map.set(p.universityId, []);
    map.get(p.universityId)!.push(p);
  }
  return map;
}

function UniversityCard({ uniId, programs, selected, onClick, showThesisFormat }: {
  uniId: string;
  programs: MasterProgram[];
  selected: boolean;
  onClick: () => void;
  showThesisFormat: boolean;
}) {
  const uniName = UNIVERSITY_NAMES[uniId];
  const primary = programs[0];
  const latestYear = primary.years[0] ?? null;
  const hasData = latestYear != null;
  const avg = hasData ? gradeAvg(latestYear.grades) : null;
  const total = hasData ? GRADE_ORDER.reduce((s, g) => s + latestYear.grades[g], 0) : 0;

  const admissionEntries = MASTER_ADMISSION[uniId] ?? [];
  const admissionPrimary = admissionEntries[0] ?? null;
  const admissionSecondary = admissionEntries[1] ?? null;
  const hasEstimated = admissionEntries.some((e) => e.estimated);

  const admissionContent = admissionPrimary && (
    <div style={{ paddingTop: 10, marginTop: 10, borderTop: '1.5px dashed var(--nmbu-neutral-3)' }}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div style={{ fontSize: '10px', color: 'var(--nmbu-neutral-2)', marginBottom: 3 }}>
            Inntaksgrense
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-2 py-0.5 rounded"
              style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', fontSize: '13px', fontWeight: 700 }}
            >
              {admissionPrimary.grade.toFixed(2)}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--nmbu-neutral-2)' }}>
              {admissionPrimary.year}{admissionPrimary.estimated ? '*' : ''}
            </span>
            {admissionSecondary && (
              <span style={{ fontSize: '11px', color: 'var(--nmbu-neutral-2)' }}>
                · {admissionSecondary.year}{admissionSecondary.estimated ? '*' : ''}: {admissionSecondary.grade.toFixed(2)}
              </span>
            )}
          </div>
          {admissionPrimary.note && (
            <div style={{ fontSize: '11px', color: 'var(--nmbu-neutral-2)', marginTop: 4, fontStyle: 'italic' }}>
              {admissionPrimary.note}
            </div>
          )}
          {hasEstimated && (
            <div style={{ fontSize: '10px', color: 'var(--nmbu-neutral-2)', marginTop: 3, fontStyle: 'italic' }}>
              * Estimert
            </div>
          )}
        </div>
        {admissionPrimary.url && (
          <a
            href={admissionPrimary.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ fontSize: '11px', color: 'var(--nmbu-green-dark)', textDecoration: 'underline', whiteSpace: 'nowrap' }}
          >
            Se krav →
          </a>
        )}
      </div>
    </div>
  );

  const uniColor = UNIVERSITY_COLORS[uniId] ?? 'var(--nmbu-green-dark)';

  return (
    <div
      onClick={onClick}
      className="rounded-xl cursor-pointer transition-all overflow-hidden"
      style={{
        border: selected ? '2px solid var(--nmbu-green-dark)' : '1px solid var(--nmbu-neutral-3)',
        backgroundColor: selected ? '#f0f7f5' : '#fff',
        boxShadow: selected ? '0 2px 8px rgba(2,92,79,0.12)' : '0 1px 4px rgba(2,92,79,0.06)',
      }}
    >
      {/* University colour bar */}
      <div style={{ height: 5, backgroundColor: uniColor }} />

      {/* Top section */}
      <div className="p-5">
        {/* Header row: name + avg */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '17px', color: 'var(--nmbu-green-dark)' }}>
              {uniName?.shortName ?? uniId.toUpperCase()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--nmbu-neutral-2)', marginTop: 2 }}>
              {uniName?.name}
            </div>
          </div>
          {avg !== null && (
            <div className="text-right">
              <div style={{ fontSize: '10px', color: 'var(--nmbu-neutral-2)' }}>Snitt {latestYear!.year}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--nmbu-green-dark)', lineHeight: 1.2 }}>
                {avg.toFixed(2)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--nmbu-neutral-2)' }}>{total} oppgaver</div>
            </div>
          )}
        </div>

        {/* Grade bar */}
        {hasData
          ? <GradeBar grades={latestYear!.grades} />
          : (
            <div className="h-6 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--nmbu-neutral-4)', fontSize: '11px', color: 'var(--nmbu-neutral-2)', fontStyle: 'italic' }}>
              Karakterdata kommer
            </div>
          )
        }

        {/* Program pills */}
        <div className="mt-3 flex gap-1 flex-wrap">
          {programs.map((p) => (
            <span
              key={p.programCode}
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor: p.isSivilokonom ? 'var(--nmbu-green-dark)' : 'var(--nmbu-green-4)',
                color: p.isSivilokonom ? '#fff' : 'var(--nmbu-green-dark)',
              }}
            >
              {p.programCode}
              {p.isSivilokonom && ' · Siviløkonom'}
            </span>
          ))}
        </div>

        {/* Admission info below dashed line */}
        {admissionContent}

        {/* Thesis format info below second dashed line */}
        {showThesisFormat && THESIS_INFO[uniId] && <ThesisInfoSection info={THESIS_INFO[uniId]} />}
      </div>
    </div>
  );
}

function ThesisInfoSection({ info }: { info: NonNullable<typeof THESIS_INFO[string]> }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'Skriveform', value: info.skriveform },
    {
      label: 'Muntlig forsvar',
      value: (
        <span>
          {info.muntligForsvar}
          {info.muntligNote && (
            <>
              {' — '}
              {info.muntligUrl ? (
                <a
                  href={info.muntligUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: 'var(--nmbu-green-dark)', textDecoration: 'underline' }}
                >
                  {info.muntligNote}
                </a>
              ) : (
                <span style={{ fontStyle: 'italic' }}>{info.muntligNote}</span>
              )}
            </>
          )}
        </span>
      ),
    },
    { label: 'Ekstern sensor', value: info.eksternSensor },
    { label: 'Karaktervirkning', value: info.karaktervirkning },
  ];

  return (
    <div style={{ paddingTop: 10, marginTop: 10, borderTop: '1.5px dashed var(--nmbu-neutral-3)' }}>
      <div style={{ fontSize: '10px', color: 'var(--nmbu-neutral-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Oppgaveformat
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rows.map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', gap: 6, fontSize: '11px', lineHeight: 1.4 }}>
            <span style={{ color: 'var(--nmbu-neutral-2)', minWidth: 110, flexShrink: 0 }}>{label}:</span>
            <span style={{ color: 'var(--nmbu-neutral-1)' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UniversityDetail({ uniId, programs }: { uniId: string; programs: MasterProgram[] }) {
  const uniName = UNIVERSITY_NAMES[uniId];
  const [activeProgram, setActiveProgram] = useState(programs[0].programCode);
  const program = programs.find((p) => p.programCode === activeProgram) ?? programs[0];

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
      {/* Header */}
      <div className="px-6 py-4" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
        <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '20px' }}>
          {uniName?.name ?? uniId}
        </div>
        <div style={{ fontSize: '13px', opacity: 0.8, marginTop: 2 }}>
          Masteroppgavekarakterer
        </div>
      </div>

      {/* Program tabs */}
      {programs.length > 1 && (
        <div className="px-6 pt-4 pb-0 flex gap-2 flex-wrap" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
          {programs.map((p) => (
            <button
              key={p.programCode}
              onClick={() => setActiveProgram(p.programCode)}
              className="px-4 py-2 rounded-t-lg text-sm transition-all"
              style={{
                backgroundColor: activeProgram === p.programCode ? 'var(--nmbu-beige-light)' : 'transparent',
                color: activeProgram === p.programCode ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)',
                borderBottom: activeProgram === p.programCode ? '2px solid var(--nmbu-green-dark)' : '2px solid transparent',
                fontWeight: activeProgram === p.programCode ? 600 : 400,
                marginBottom: '-1px',
              }}
            >
              <span>{p.programCode}</span>
              {p.isSivilokonom && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
                  Siviløkonom
                </span>
              )}
              <span className="ml-1.5 text-xs" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 400 }}>
                — {p.programName.replace(/^Master\s/, '')}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Year cards */}
      {program.years.length > 0 ? (
        <div className="p-6 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {program.years.map((y) => (
            <GradeTable key={y.year} grades={y.grades} year={y.year} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center" style={{ color: 'var(--nmbu-neutral-2)', fontStyle: 'italic', fontSize: '14px' }}>
          Karakterdata for masteroppgaver er ikke lagt inn ennå.
        </div>
      )}

      {/* Specializations */}
      {program.specializations && program.specializations.length > 0 && (
        <SpecializationsSection specializations={program.specializations} />
      )}
    </div>
  );
}

function SpecializationsSection({ specializations }: { specializations: Specialization[] }) {
  const years = [...new Set(specializations.flatMap((s) => s.years.map((y) => y.year)))].sort((a, b) => b.localeCompare(a));
  const [activeYear, setActiveYear] = useState(years[0]);

  return (
    <div style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
      {/* Section header */}
      <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--nmbu-green-dark)' }}>
            Profileringer
          </div>
          <div style={{ fontSize: '12px', color: 'var(--nmbu-neutral-2)', marginTop: 2 }}>
            Karakterfordeling per profilering/spesialisering
          </div>
        </div>
        {/* Year selector */}
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setActiveYear(y)}
              className="px-3 py-1.5 text-xs transition-all"
              style={{
                backgroundColor: activeYear === y ? 'var(--nmbu-green-dark)' : '#fff',
                color: activeYear === y ? '#fff' : 'var(--nmbu-neutral-1)',
                borderRight: '1px solid var(--nmbu-neutral-3)',
              }}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Specialization rows */}
      <div className="px-6 py-4 flex flex-col gap-3">
        {specializations.map((spec) => {
          const yearData = spec.years.find((y) => y.year === activeYear);
          const grades = yearData?.grades ?? { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
          const total = GRADE_ORDER.reduce((s, g) => s + grades[g], 0);
          const avg = gradeAvg(grades);
          const avgLabel = total > 0 ? (['F', 'E', 'D', 'C', 'B', 'A'][Math.round(avg)] ?? '–') : '–';

          return (
            <div key={spec.code} className="rounded-xl p-4" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>
                    {spec.code}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--nmbu-neutral-1)' }}>{spec.name}</span>
                </div>
                <div className="flex items-center gap-3" style={{ fontSize: '12px', color: 'var(--nmbu-neutral-2)' }}>
                  {total > 0 ? (
                    <>
                      <span>{total} oppgaver</span>
                      <span style={{ fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>
                        snitt {avg.toFixed(2)} ({avgLabel})
                      </span>
                    </>
                  ) : (
                    <span style={{ fontStyle: 'italic' }}>Ingen data for {activeYear}</span>
                  )}
                </div>
              </div>
              {total > 0 ? (
                <>
                  <GradeBar grades={grades} />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {GRADE_ORDER.map((g) => {
                      const count = grades[g];
                      if (count === 0) return null;
                      const pct = ((count / total) * 100).toFixed(0);
                      return (
                        <span key={g} style={{ fontSize: '11px', color: 'var(--nmbu-neutral-2)' }}>
                          <span style={{ fontWeight: 600, color: GRADE_COLORS[g] }}>{g}</span>: {count} ({pct}%)
                        </span>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="h-6 rounded" style={{ backgroundColor: 'var(--nmbu-neutral-4)' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MasterView() {
  const grouped = groupByUniversity(MASTER_THESIS_DATA);
  const uniIds = [...grouped.keys()];
  const [selectedId, setSelectedId] = useState<string | null>(uniIds[0] ?? null);
  const [showThesisFormat, setShowThesisFormat] = useState(false);

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setShowThesisFormat((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
          style={{
            backgroundColor: showThesisFormat ? 'var(--nmbu-green-dark)' : '#fff',
            color: showThesisFormat ? '#fff' : 'var(--nmbu-neutral-1)',
            border: '1px solid var(--nmbu-neutral-3)',
            boxShadow: '0 1px 3px rgba(2,92,79,0.07)',
          }}
        >
          <span style={{ fontSize: '13px' }}>{showThesisFormat ? '▾' : '▸'}</span>
          Vis oppgaveformat
        </button>
      </div>

      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {uniIds.map((uniId) => (
          <UniversityCard
            key={uniId}
            uniId={uniId}
            programs={grouped.get(uniId)!}
            selected={selectedId === uniId}
            onClick={() => setSelectedId(uniId)}
            showThesisFormat={showThesisFormat}
          />
        ))}
      </div>

      {selectedId && grouped.has(selectedId) && (
        <UniversityDetail uniId={selectedId} programs={grouped.get(selectedId)!} />
      )}
    </div>
  );
}
