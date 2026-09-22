import { COURSE_MAPPING, UNIVERSITY_INFO, CourseId } from '../data/courseMapping';
import { TrendingUp, TrendingDown } from 'lucide-react';

function getUniversityName(id: string) {
  return UNIVERSITY_INFO[id]?.shortName ?? id;
}
function getCourseCodeForUniversity(courseType: string, universityId: string): string {
  const entry = COURSE_MAPPING[courseType as CourseId]?.[universityId];
  return entry ? entry.displayCode : '–';
}

interface ProgramComparisonProps {
  universities: string[];
}

const FIRST_YEAR_COURSES = [
  { code: 'finansregnskap', name: 'Finansregnskap', semester: 'Høst' },
  { code: 'okonomi1', name: 'Økonomi 1', semester: 'Høst' },
  { code: 'statistikk', name: 'Statistikk', semester: 'Vår' },
  { code: 'markedsforing', name: 'Markedsføring', semester: 'Vår' },
];

const SECOND_YEAR_COURSES = [
  { code: 'organisasjon', name: 'Organisasjon og ledelse', semester: 'Høst' },
  { code: 'makrookonomi', name: 'Makroøkonomi', semester: 'Høst' },
  { code: 'mikrookonomi', name: 'Mikroøkonomi', semester: 'Vår' },
];

const thStyle: React.CSSProperties = {
  color: 'var(--nmbu-neutral)',
  fontWeight: 600,
  borderBottom: '2px solid var(--nmbu-neutral-3)',
};

function CourseTable({ courses, universities }: { courses: typeof FIRST_YEAR_COURSES; universities: string[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
            <th className="px-4 py-3 text-left" style={thStyle}>Emne</th>
            <th className="px-4 py-3 text-center" style={thStyle}>Semester</th>
            {universities.map((uni) => (
              <th key={uni} className="px-4 py-3 text-center" style={thStyle}>
                {getUniversityName(uni)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr
              key={course.code}
              className="transition-colors"
              style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}
              onMouseOver={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--nmbu-beige-light)'; }}
              onMouseOut={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = ''; }}
            >
              <td className="px-4 py-3" style={{ color: 'var(--nmbu-neutral)', fontWeight: 500 }}>
                {course.name}
              </td>
              <td className="px-4 py-3 text-center" style={{ color: 'var(--nmbu-neutral-1)' }}>
                {course.semester}
              </td>
              {universities.map((uni) => {
                const courseCode = getCourseCodeForUniversity(course.code, uni);
                return (
                  <td key={uni} className="px-4 py-3 text-center">
                    <span className="font-mono text-sm px-2 py-1 rounded" style={{ backgroundColor: 'var(--nmbu-beige)', color: 'var(--nmbu-neutral)' }}>
                      {courseCode}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProgramComparison({ universities }: ProgramComparisonProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <h2 className="text-2xl mb-6" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
          Studieløp — Bachelor Økonomi og Administrasjon
        </h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl mb-4 flex items-center gap-2" style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>
              <span className="rounded-full w-8 h-8 flex items-center justify-center text-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', fontWeight: 700 }}>1</span>
              Første år
            </h3>
            <CourseTable courses={FIRST_YEAR_COURSES} universities={universities} />
          </div>

          <div>
            <h3 className="text-xl mb-4 flex items-center gap-2" style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>
              <span className="rounded-full w-8 h-8 flex items-center justify-center text-sm" style={{ backgroundColor: 'var(--nmbu-green-6)', color: '#fff', fontWeight: 700 }}>2</span>
              Andre år
            </h3>
            <CourseTable courses={SECOND_YEAR_COURSES} universities={universities} />
          </div>
        </div>
      </div>

      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--nmbu-green-light)', border: '1px solid var(--nmbu-green-3)' }}>
        <h3 className="text-lg mb-3" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Om studieløpet</h3>
        <ul className="space-y-2" style={{ color: 'var(--nmbu-neutral-1)' }}>
          <li className="flex items-start gap-2">
            <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--nmbu-green-6)' }} />
            <span>Alle universiteter tilbyr bachelor i økonomi og administrasjon, men med noe ulike emnekoder</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--nmbu-green-6)' }} />
            <span>Finansregnskap er et kjerneemne som tilbys ved alle institusjonene, vanligvis første semester</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingDown className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#c2963a' }} />
            <span>Tredje år inneholder ofte spesialisering og valgfrie emner, og varierer mer mellom universiteter</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
