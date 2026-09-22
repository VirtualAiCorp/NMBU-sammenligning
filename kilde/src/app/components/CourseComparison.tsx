import { useState } from 'react';
import { COURSE_MAPPING, UNIVERSITY_INFO, CourseId } from '../data/courseMapping';
import { getGradesForMode, availableYearsGlobal, type YearMode } from '../data/courseHistory';
import { GradeDistributionChart } from './GradeDistributionChart';
import { StatsTable } from './StatsTable';

interface CourseComparisonProps {
  courseCode: string;
  universities: string[];
}

export interface GradeData {
  university: string;
  universityName: string;
  courseCode: string;
  courseName: string;
  grades: { A: number; B: number; C: number; D: number; E: number; F: number };
  totalStudents: number;
  averageGrade: number;
  passRate: number;
  description: string;
  credits: string;
  examForm: string;
  verified: boolean;
  liveData: boolean;
  courseUrl?: string;
}

function computeStats(grades: { A: number; B: number; C: number; D: number; E: number; F: number }) {
  const totalStudents = Object.values(grades).reduce((a, b) => a + b, 0);
  const passed = grades.A + grades.B + grades.C + grades.D + grades.E;
  const passRate = totalStudents > 0 ? (passed / totalStudents) * 100 : 0;
  const gradePoints: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
  const totalPoints = Object.entries(grades).reduce(
    (sum, [grade, count]) => sum + gradePoints[grade] * count,
    0
  );
  const averageGrade = totalStudents > 0 ? totalPoints / totalStudents : 0;
  return { totalStudents, passRate, averageGrade };
}

const MODE_LABELS: Record<string, string> = {
  latest: 'Siste (2025)',
  avg:    'Snitt (2023–2025)',
  2024:   '2024',
  2023:   '2023',
};

export function CourseComparison({ courseCode, universities }: CourseComparisonProps) {
  const [yearMode, setYearMode] = useState<YearMode>('latest');

  const courseMap = COURSE_MAPPING[courseCode as CourseId];
  if (!courseMap) {
    return (
      <div className="bg-white rounded-xl p-8 text-center" style={{ color: 'var(--nmbu-neutral-2)', border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        Ingen data tilgjengelig for valgte emne.
      </div>
    );
  }

  const availableYears = availableYearsGlobal(courseCode).filter(y => y < 2025).reverse();

  const data: GradeData[] = universities
    .map((u) => {
      const entry = courseMap[u];
      if (!entry) return null;
      const grades = getGradesForMode(courseCode, u, yearMode, entry.fallbackGrades);
      if (!grades) return null;
      const { totalStudents, passRate, averageGrade } = computeStats(grades);
      if (totalStudents === 0) return null;
      return {
        university: entry.institute,
        universityName: UNIVERSITY_INFO[entry.institute]?.shortName ?? entry.institute,
        courseCode: entry.displayCode,
        courseName: entry.courseName,
        grades,
        totalStudents,
        averageGrade,
        passRate,
        description: entry.description,
        credits: entry.credits,
        examForm: entry.examForm,
        verified: entry.verified,
        liveData: false,
        courseUrl: entry.courseUrl,
      } as GradeData;
    })
    .filter((d): d is GradeData => d !== null);

  const modeOptions: YearMode[] = ['latest', 'avg', ...availableYears as YearMode[]];

  return (
    <div className="space-y-6">
      {/* Year mode selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Data:</span>
        <div className="flex gap-1 flex-wrap">
          {modeOptions.map((mode) => (
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
              {MODE_LABELS[String(mode)] ?? String(mode)}
            </button>
          ))}
        </div>
        {yearMode !== 'latest' && (
          <span style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', opacity: 0.7 }}>
            {yearMode === 'avg'
              ? '· Pooled fordeling over alle tilgjengelige år'
              : `· Institusjoner uten data for ${yearMode} vises ikke`}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm flex-wrap">
        <span className="rounded-full px-3 py-1 text-xs" style={{ color: 'var(--nmbu-neutral-2)', backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)' }}>
          Kilde: karakterweb.no · Manuelt hentet 2023–2025
        </span>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center" style={{ color: 'var(--nmbu-neutral-2)', border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
          Ingen data tilgjengelig for valgte år og universiteter.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
            <h2 className="text-2xl mb-4" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Karakterfordeling</h2>
            <GradeDistributionChart data={data} />
          </div>

          <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
            <h3 className="text-xl mb-4" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Statistikk per universitet</h3>
            <StatsTable data={data} />
          </div>
        </>
      )}
    </div>
  );
}
