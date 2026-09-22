import { useState } from 'react';
import { CheckCircle, AlertCircle, HelpCircle, ExternalLink, ChevronDown, ChevronUp, BookOpen, Lightbulb, GraduationCap, ClipboardList, X } from 'lucide-react';
import { COURSE_MAPPING, UNIVERSITY_INFO, CourseId, CourseEntry } from '../data/courseMapping';

const COURSE_LABELS: Record<CourseId, string> = {
  finansregnskap: 'Finansregnskap',
  okonomistyring: 'Økonomistyring',
  investering:    'Investering og finansiering',
  okonomi1:       'Bedriftsøkonomi (intro)',
  matematikk:     'Matematikk for økonomer',
  statistikk:     'Statistikk for økonomer',
  metode:         'Samfunnsvitenskapelig metode',
  markedsforing:  'Markedsføring',
  organisasjon:   'Organisasjon og ledelse',
  strategi:       'Foretaksstrategi',
  makrookonomi:   'Makroøkonomi',
  mikrookonomi:   'Mikroøkonomi',
};

const UNIVERSITY_ORDER: string[] = [
  'hio', 'nmbu', 'uia', 'usn', 'nhh', 'bi', 'kristiania', 'oslomet', 'ntnu', 'ntnu_gjovik', 'ntnu_alesund', 'uit', 'nla', 'uis', 'inn', 'onh', 'nord', 'hvl', 'himolde', 'inn_rena',
];

const COURSE_ORDER: CourseId[] = [
  'finansregnskap', 'okonomistyring', 'investering',
  'markedsforing', 'organisasjon', 'strategi',
  'makrookonomi', 'mikrookonomi',
  'matematikk', 'statistikk', 'metode',
  'okonomi1',
];

function karakterwebUrl(institute: string, codeShort: string) {
  return `https://karakterweb.no/${institute}/${codeShort}`;
}

type FilterMode = 'all' | 'verified' | 'unverified';

function LearningOutcomesPanel({ entry, universityName, onClose }: {
  entry: CourseEntry;
  universityName: string;
  onClose: () => void;
}) {
  const lo = entry.learningOutcomes;
  return (
    <div className="bg-white rounded-xl p-5 mt-3" style={{ border: '1px solid var(--nmbu-green-3)', boxShadow: '0 4px 20px rgba(2,92,79,0.10)' }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {entry.verified
              ? <CheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--nmbu-green-6)' }} />
              : <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#c2963a' }} />}
            <span style={{ color: 'var(--nmbu-neutral)', fontWeight: 700 }}>{universityName} — {entry.displayCode}</span>
          </div>
          <div className="text-sm" style={{ color: 'var(--nmbu-neutral-1)' }}>{entry.courseName} · {entry.credits}</div>
        </div>
        <button onClick={onClose} className="shrink-0" style={{ color: 'var(--nmbu-neutral-2)' }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {lo ? (
        <div className="space-y-4">
          {lo.kunnskap && (
            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide mb-1.5" style={{ color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>
                <BookOpen className="w-3.5 h-3.5" /> Kunnskap
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--nmbu-neutral-1)' }}>{lo.kunnskap}</p>
            </div>
          )}
          {lo.ferdigheter && (
            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide mb-1.5" style={{ color: 'var(--nmbu-green-6)', fontWeight: 600 }}>
                <Lightbulb className="w-3.5 h-3.5" /> Ferdigheter
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--nmbu-neutral-1)' }}>{lo.ferdigheter}</p>
            </div>
          )}
          {lo.generellKompetanse && (
            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide mb-1.5" style={{ color: 'var(--nmbu-purple)', fontWeight: 600 }}>
                <GraduationCap className="w-3.5 h-3.5" /> Generell kompetanse
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--nmbu-neutral-1)' }}>{lo.generellKompetanse}</p>
            </div>
          )}
          {entry.assessmentDetails && (
            <div className="pt-3" style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide mb-1.5" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 600 }}>
                <ClipboardList className="w-3.5 h-3.5" /> Vurderingsordning
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--nmbu-neutral-1)' }}>{entry.assessmentDetails}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--nmbu-neutral-1)' }}>{entry.description}</p>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
            <ClipboardList className="w-3.5 h-3.5" />
            <span><span style={{ fontWeight: 500 }}>Vurderingsform:</span> {entry.examForm}</span>
          </div>
          <p className="text-xs italic" style={{ color: 'var(--nmbu-neutral-3)' }}>
            Fullstendig læringsutbytte ikke lagt inn ennå.
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-4 pt-3" style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
        <a
          href={karakterwebUrl(entry.institute, entry.codeShort)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs hover:underline"
          style={{ color: 'var(--nmbu-green)' }}
        >
          <ExternalLink className="w-3 h-3" /> karakterweb.no
        </a>
        {entry.courseUrl && (
          <a
            href={entry.courseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs hover:underline"
            style={{ color: 'var(--nmbu-green)' }}
          >
            <ExternalLink className="w-3 h-3" /> Emneside
          </a>
        )}
      </div>
    </div>
  );
}

export function CourseMappingTable() {
  const [expandedCourse, setExpandedCourse] = useState<CourseId | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [selectedEntry, setSelectedEntry] = useState<{ u: string; courseId: CourseId } | null>(null);

  const totalCells = COURSE_ORDER.length * UNIVERSITY_ORDER.length;
  const verifiedCells = COURSE_ORDER.reduce((acc, course) => {
    return acc + UNIVERSITY_ORDER.filter(
      (u) => COURSE_MAPPING[course]?.[u]?.verified
    ).length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Emnekartlegging</h2>
            <p className="text-sm max-w-2xl" style={{ color: 'var(--nmbu-neutral-1)' }}>
              Sammenlignbare emner på tvers av universiteter. Samme faglige innhold
              har ulike emnekoder ved ulike institusjoner. Dette dokumentet viser
              kartleggingen, og skiller tydelig mellom verifiserte og uverifiserte koder.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="text-sm" style={{ color: 'var(--nmbu-neutral)', fontWeight: 500 }}>
              {verifiedCells} / {totalCells} verifisert
            </div>
            <div className="w-40 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(verifiedCells / totalCells) * 100}%`, backgroundColor: 'var(--nmbu-green-6)' }}
              />
            </div>
            <div className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>mot karakterweb.no API</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 text-sm" style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
          <span className="flex items-center gap-1.5" style={{ color: 'var(--nmbu-green-6)' }}>
            <CheckCircle className="w-4 h-4" /> Verifisert mot karakterweb.no API
          </span>
          <span className="flex items-center gap-1.5" style={{ color: '#c2963a' }}>
            <AlertCircle className="w-4 h-4" /> Ikke fullstendig verifisert
          </span>
          <span className="flex items-center gap-1.5" style={{ color: 'var(--nmbu-neutral-2)' }}>
            <HelpCircle className="w-4 h-4" /> Mangler / ikke kartlagt
          </span>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mt-4">
          {(['all', 'verified', 'unverified'] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-full text-xs transition-all"
              style={filter === f
                ? { backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', fontWeight: 500 }
                : { backgroundColor: 'var(--nmbu-beige)', color: 'var(--nmbu-neutral-1)' }
              }
            >
              {f === 'all' ? 'Alle emner' : f === 'verified' ? 'Kun verifiserte' : 'Kun uverifiserte'}
            </button>
          ))}
        </div>
      </div>

      {/* Main table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                <th className="px-4 py-3 text-left sticky left-0 z-10 min-w-[180px]" style={{ backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral)', fontWeight: 600 }}>
                  Emne
                </th>
                {UNIVERSITY_ORDER.map((u) => (
                  <th key={u} className="px-3 py-3 text-center min-w-[110px]" style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>
                    {UNIVERSITY_INFO[u]?.shortName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COURSE_ORDER.map((courseId) => {
                const courseMap = COURSE_MAPPING[courseId];
                const verifiedInCourse = UNIVERSITY_ORDER.filter(
                  (u) => courseMap?.[u]?.verified
                ).length;

                if (filter === 'verified' && verifiedInCourse === 0) return null;
                if (filter === 'unverified' && verifiedInCourse === UNIVERSITY_ORDER.length) return null;

                const isExpanded = expandedCourse === courseId;

                return (
                  <>
                    <tr
                      key={courseId}
                      className="cursor-pointer transition-colors"
                      style={{
                        borderBottom: '1px solid var(--nmbu-neutral-3)',
                        backgroundColor: isExpanded ? 'var(--nmbu-green-4)' : undefined,
                      }}
                      onMouseOver={(e) => { if (!isExpanded) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--nmbu-beige-light)'; }}
                      onMouseOut={(e) => { if (!isExpanded) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = ''; }}
                      onClick={() => {
                        setExpandedCourse(isExpanded ? null : courseId);
                        setSelectedEntry(null);
                      }}
                    >
                      <td className="px-4 py-3 sticky left-0 z-10" style={{ backgroundColor: isExpanded ? 'var(--nmbu-green-4)' : 'white' }}>
                        <div className="flex items-center gap-2">
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: 'var(--nmbu-neutral-2)' }} />
                            : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--nmbu-neutral-2)' }} />}
                          <div>
                            <div style={{ color: 'var(--nmbu-neutral)', fontWeight: 500 }}>{COURSE_LABELS[courseId]}</div>
                            <div className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
                              {verifiedInCourse}/{UNIVERSITY_ORDER.length} verifisert
                            </div>
                          </div>
                        </div>
                      </td>
                      {UNIVERSITY_ORDER.map((u) => {
                        const entry = courseMap?.[u];
                        if (!entry) {
                          return (
                            <td key={u} className="px-3 py-3 text-center">
                              <HelpCircle className="w-4 h-4 mx-auto" style={{ color: 'var(--nmbu-neutral-3)' }} />
                            </td>
                          );
                        }
                        return (
                          <td key={u} className="px-3 py-3 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-mono text-xs" style={{ color: 'var(--nmbu-neutral)' }}>{entry.displayCode}</span>
                              {entry.verified
                                ? <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--nmbu-green-6)' }} />
                                : <AlertCircle className="w-3.5 h-3.5" style={{ color: '#c2963a' }} />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {isExpanded && (
                      <tr key={`${courseId}-detail`}>
                        <td colSpan={UNIVERSITY_ORDER.length + 1} className="px-4 py-4" style={{ backgroundColor: 'var(--nmbu-green-light)', borderBottom: '1px solid var(--nmbu-green-3)' }}>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {UNIVERSITY_ORDER.map((u) => {
                              const entry = courseMap?.[u];
                              const isSelected = selectedEntry?.u === u && selectedEntry?.courseId === courseId;
                              if (!entry) return (
                                <div key={u} className="bg-white rounded-lg p-3 opacity-50" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
                                  <div className="text-xs mb-1" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 500 }}>
                                    {UNIVERSITY_INFO[u]?.shortName}
                                  </div>
                                  <div className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>Ikke kartlagt</div>
                                </div>
                              );
                              return (
                                <button
                                  key={u}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEntry(isSelected ? null : { u, courseId });
                                  }}
                                  className="bg-white rounded-lg p-3 text-left transition-all w-full"
                                  style={{
                                    border: isSelected
                                      ? '2px solid var(--nmbu-green-dark)'
                                      : entry.verified
                                        ? '1px solid var(--nmbu-green-3)'
                                        : '1px solid #d4b47a',
                                    boxShadow: isSelected ? '0 0 0 3px var(--nmbu-green-4)' : undefined,
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 500 }}>
                                      {UNIVERSITY_INFO[u]?.shortName}
                                    </span>
                                    {entry.verified
                                      ? <CheckCircle className="w-3 h-3" style={{ color: 'var(--nmbu-green-6)' }} />
                                      : <AlertCircle className="w-3 h-3" style={{ color: '#c2963a' }} />}
                                  </div>
                                  <div className="font-mono text-sm mb-0.5" style={{ color: 'var(--nmbu-neutral)', fontWeight: 700 }}>
                                    {entry.displayCode}
                                  </div>
                                  <div className="text-xs leading-tight mb-2" style={{ color: 'var(--nmbu-neutral-2)' }}>
                                    {entry.courseName}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
                                    <span>{entry.credits}</span>
                                    <span>·</span>
                                    <span>{entry.examForm}</span>
                                  </div>
                                  {entry.learningOutcomes && (
                                    <div className="mt-2 text-xs flex items-center gap-1" style={{ color: 'var(--nmbu-green-6)' }}>
                                      <BookOpen className="w-3 h-3" />
                                      Læringsutbytte tilgjengelig
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {selectedEntry?.courseId === courseId && (() => {
                            const e = courseMap?.[selectedEntry.u];
                            if (!e) return null;
                            return (
                              <LearningOutcomesPanel
                                entry={e}
                                universityName={UNIVERSITY_INFO[selectedEntry.u]?.shortName ?? selectedEntry.u}
                                onClose={() => setSelectedEntry(null)}
                              />
                            );
                          })()}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <div className="rounded-lg p-4 text-sm" style={{ backgroundColor: '#fef4e0', border: '1px solid #d4b47a', color: '#8a6200' }}>
        <strong>Merk:</strong> Uverifiserte emnekoder er basert på navnekonvensjoner og bør sjekkes mot
        universitetenes offisielle studieplaner eller{' '}
        <a href="https://karakterweb.no" target="_blank" rel="noopener noreferrer" className="underline">
          karakterweb.no
        </a>{' '}
        før de brukes som grunnlag for analyse.
      </div>
    </div>
  );
}
