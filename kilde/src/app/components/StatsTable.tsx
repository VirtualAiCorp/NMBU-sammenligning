import { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Award, ClipboardList, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import type { GradeData } from './CourseComparison';
import { UNIVERSITY_INFO } from '../data/courseMapping';
import { AccreditationBadge } from './AccreditationBadge';
import { ADMISSION_DATA } from '../data/admissionData';

interface StatsTableProps {
  data: GradeData[];
}

function admissionFor(universityId: string) {
  const entry = ADMISSION_DATA.find((d) => d.universityId === universityId);
  if (!entry) return null;
  return entry.years['2025'] ?? null;
}

function AdmissionCell({ universityId }: { universityId: string }) {
  const scores = admissionFor(universityId);
  if (!scores) return (
    <td className="px-4 py-3 text-center text-xs" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>–</td>
  );

  const { firstTimers, ordinary } = scores;

  if (firstTimers === null && ordinary === null) {
    return (
      <td className="px-4 py-3 text-center text-xs" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        Privat
      </td>
    );
  }

  const fmt = (v: number | null) => v === null ? '–' : v === 0
    ? <span className="text-xs" style={{ color: 'var(--nmbu-green-6)' }}>Alle inn</span>
    : <span>{v.toFixed(1)}</span>;

  return (
    <td className="px-4 py-3 text-center" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex flex-col items-center leading-tight">
        <span className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>FV</span>
        <span className="text-sm" style={{ color: 'var(--nmbu-neutral)', fontWeight: 500 }}>{fmt(firstTimers)}</span>
        <span className="text-xs mt-0.5" style={{ color: 'var(--nmbu-neutral-2)' }}>Ord</span>
        <span className="text-sm" style={{ color: 'var(--nmbu-neutral)', fontWeight: 500 }}>{fmt(ordinary)}</span>
      </div>
    </td>
  );
}

export function StatsTable({ data }: StatsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (university: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(university)) next.delete(university);
      else next.add(university);
      return next;
    });
  };

  const gradeToLetter = (avgGrade: number): string => {
    if (avgGrade >= 4.5) return 'A';
    if (avgGrade >= 3.5) return 'B';
    if (avgGrade >= 2.5) return 'C';
    if (avgGrade >= 1.5) return 'D';
    if (avgGrade >= 0.5) return 'E';
    return 'F';
  };

  const thStyle: React.CSSProperties = { color: 'var(--nmbu-neutral)', fontWeight: 600, borderBottom: '2px solid var(--nmbu-neutral-3)' };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
            <th className="px-4 py-3 w-8" style={thStyle} />
            <th className="px-4 py-3 text-left" style={thStyle}>Universitet</th>
            <th className="px-4 py-3 text-center" style={thStyle}>Emnekode</th>
            <th className="px-4 py-3 text-center" style={thStyle}>Studenter</th>
            <th className="px-4 py-3 text-center" style={thStyle}>Gjennomsnitt</th>
            <th className="px-4 py-3 text-center" style={thStyle}>Strykprosent</th>
            <th className="px-4 py-3 text-center text-xs leading-tight" style={thStyle}>
              Opptak 2025<br/>
              <span style={{ fontWeight: 400, color: 'var(--nmbu-neutral-2)' }}>FV / Ord</span>
            </th>
            {['A','B','C','D','E','F'].map((g) => (
              <th key={g} className="px-4 py-3 text-center" style={thStyle}>{g}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((uni) => {
            const isExpanded = expandedRows.has(uni.university);
            return (
              <>
                <tr
                  key={uni.university}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}
                  onClick={() => toggleRow(uni.university)}
                  onMouseOver={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--nmbu-beige-light)'; }}
                  onMouseOut={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = ''; }}
                >
                  <td className="px-3 py-3" style={{ color: 'var(--nmbu-neutral-2)' }}>
                    {isExpanded
                      ? <ChevronDown className="w-4 h-4" />
                      : <ChevronRight className="w-4 h-4" />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span style={{ color: 'var(--nmbu-neutral)', fontWeight: 500 }}>{uni.universityName}</span>
                      {(() => {
                        const acc = UNIVERSITY_INFO[uni.university]?.accreditations;
                        return acc ? <AccreditationBadge accreditations={acc} /> : null;
                      })()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-mono text-sm" style={{ color: 'var(--nmbu-neutral-1)' }}>{uni.courseCode}</span>
                      {uni.verified
                        ? <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--nmbu-green-6)' }} title="Emnekode verifisert mot karakterweb.no" />
                        : <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#c2963a' }} title="Emnekode ikke fullstendig verifisert" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center" style={{ color: 'var(--nmbu-neutral-1)' }}>
                    {uni.totalStudents}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-1 rounded" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>
                      {gradeToLetter(uni.averageGrade)} ({uni.averageGrade.toFixed(2)})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span style={{ fontWeight: 600, color: (100 - uni.passRate) > 20 ? '#9b3a3a' : 'var(--nmbu-neutral-1)' }}>
                      {(100 - uni.passRate).toFixed(1)}%
                    </span>
                  </td>
                  <AdmissionCell universityId={uni.university} />
                  {Object.entries(uni.grades).map(([grade, count]) => (
                    <td key={grade} className="px-4 py-3 text-center text-sm" style={{ color: 'var(--nmbu-neutral-1)' }}>
                      {count} ({((count / uni.totalStudents) * 100).toFixed(0)}%)
                    </td>
                  ))}
                </tr>

                {isExpanded && (
                  <tr key={`${uni.university}-desc`}>
                    <td />
                    <td colSpan={12} className="px-6 py-4" style={{ backgroundColor: 'var(--nmbu-green-light)', borderBottom: '1px solid var(--nmbu-green-3)' }}>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--nmbu-green-6)' }} />
                          <div>
                            <p className="text-sm mb-0.5" style={{ color: 'var(--nmbu-neutral)', fontWeight: 500 }}>{uni.courseName}</p>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--nmbu-neutral-1)' }}>{uni.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 pl-6">
                          <div className="flex items-center gap-1.5">
                            <Award className="w-4 h-4" style={{ color: 'var(--nmbu-green-2)' }} />
                            <span className="text-sm" style={{ color: 'var(--nmbu-neutral-1)' }}>
                              <span style={{ fontWeight: 500 }}>Studiepoeng:</span> {uni.credits}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ClipboardList className="w-4 h-4" style={{ color: 'var(--nmbu-green-2)' }} />
                            <span className="text-sm" style={{ color: 'var(--nmbu-neutral-1)' }}>
                              <span style={{ fontWeight: 500 }}>Vurderingsform:</span> {uni.examForm}
                            </span>
                          </div>
                          {uni.courseUrl && (
                            <a
                              href={uni.courseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
                              style={{ color: 'var(--nmbu-green-6)' }}
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              Emnesiden
                            </a>
                          )}
                          {!uni.verified && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#c2963a' }}>
                              <AlertCircle className="w-3.5 h-3.5" />
                              Emnekode ikke fullstendig verifisert – sjekk karakterweb.no
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
