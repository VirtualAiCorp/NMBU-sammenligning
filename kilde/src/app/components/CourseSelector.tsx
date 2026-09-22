import { UHR_GROUPS } from '../data/courseMapping';

interface CourseSelectorProps {
  selectedCourse: string;
  onCourseSelect: (courseCode: string) => void;
}

// Four UHR groups mapped to NMBU brand colors
const GROUP_STYLES: Record<string, {
  bg: string;
  border: string;
  headerBg: string;
  headerText: string;
  dotActive: string;
  selectedBorder: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}> = {
  bedriftsokonomisk: {
    bg: 'var(--nmbu-green-4)',        // light green
    border: 'var(--nmbu-green-3)',
    headerBg: 'var(--nmbu-green-dark)',
    headerText: '#fff',
    dotActive: 'var(--nmbu-green-dark)',
    selectedBorder: 'var(--nmbu-green-dark)',
    badgeBg: 'var(--nmbu-green-light)',
    badgeText: 'var(--nmbu-green-6)',
    badgeBorder: 'var(--nmbu-green-3)',
  },
  administrasjon: {
    bg: '#f3edf0',                    // light purple tint
    border: '#c59aae',
    headerBg: 'var(--nmbu-purple)',
    headerText: '#fff',
    dotActive: 'var(--nmbu-purple)',
    selectedBorder: 'var(--nmbu-purple)',
    badgeBg: '#f9f0f4',
    badgeText: 'var(--nmbu-purple)',
    badgeBorder: '#c59aae',
  },
  samfunnsokonomi: {
    bg: 'var(--nmbu-green-light)',    // lightest teal
    border: 'var(--nmbu-green-2)',
    headerBg: 'var(--nmbu-green-6)',
    headerText: '#fff',
    dotActive: 'var(--nmbu-green-6)',
    selectedBorder: 'var(--nmbu-green-6)',
    badgeBg: 'var(--nmbu-green-light)',
    badgeText: 'var(--nmbu-green-6)',
    badgeBorder: 'var(--nmbu-green-3)',
  },
  metodefag: {
    bg: 'var(--nmbu-beige)',          // warm beige
    border: '#c2b99a',
    headerBg: '#5c4a1e',              // dark warm brown
    headerText: '#fff',
    dotActive: '#5c4a1e',
    selectedBorder: '#5c4a1e',
    badgeBg: 'var(--nmbu-beige-light)',
    badgeText: '#5c4a1e',
    badgeBorder: '#c2b99a',
  },
};

export function CourseSelector({ selectedCourse, onCourseSelect }: CourseSelectorProps) {
  return (
    <div className="mb-6">
      <p className="text-sm mb-4" style={{ color: 'var(--nmbu-neutral-1)' }}>
        Obligatoriske emner etter UHR-rammeplanen for Bachelor i økonomi og administrasjon.
        Velg et emne for å sammenligne karakterstatistikk på tvers av universiteter.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {UHR_GROUPS.map((group) => {
          const s = GROUP_STYLES[group.id];
          return (
            <div
              key={group.id}
              className="rounded-xl border-2 overflow-hidden"
              style={{ borderColor: s.border }}
            >
              {/* Group header */}
              <div
                className="px-4 py-2.5 flex items-center justify-between"
                style={{ backgroundColor: s.headerBg, color: s.headerText }}
              >
                <span className="text-sm" style={{ fontFamily: "'Lora', serif", fontWeight: 500 }}>
                  {group.label}
                </span>
                {group.credits && (
                  <span className="text-xs opacity-70">{group.credits}</span>
                )}
              </div>

              {/* Course buttons */}
              <div className="p-3 space-y-2" style={{ backgroundColor: s.bg }}>
                {group.courses.map((course) => {
                  const isSelected = selectedCourse === course.id;
                  return (
                    <button
                      key={course.id}
                      onClick={() => onCourseSelect(course.id)}
                      className="w-full text-left px-4 py-3 rounded-lg border-2 transition-all flex items-start gap-3 bg-white"
                      style={{ borderColor: isSelected ? s.selectedBorder : 'transparent' }}
                    >
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0 transition-colors"
                        style={{ backgroundColor: isSelected ? s.dotActive : 'var(--nmbu-neutral-3)' }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm" style={{ color: 'var(--nmbu-neutral)', fontWeight: isSelected ? 600 : 400 }}>
                          {course.label}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--nmbu-neutral-2)' }}>
                          {course.description}
                        </div>
                      </div>
                      {isSelected && (
                        <span
                          className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border"
                          style={{ backgroundColor: s.badgeBg, color: s.badgeText, borderColor: s.badgeBorder }}
                        >
                          Valgt
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
