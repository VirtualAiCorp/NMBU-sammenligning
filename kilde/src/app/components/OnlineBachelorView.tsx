import { useState } from 'react';
import { Wifi } from 'lucide-react';
import { CourseSelector } from './CourseSelector';
import { CourseComparison } from './CourseComparison';
import { GradingHarshnessSummary } from './GradingHarshnessSummary';

const ONLINE_UNIVERSITIES = ['kristiania_nett', 'inn_nett', 'uit_nett'];

const ONLINE_INFO: Record<string, { shortName: string; fullName: string; note: string }> = {
  kristiania_nett: {
    shortName: 'Kristiania nett',
    fullName:  'Høyskolen Kristiania – nettstudier',
    note:      'Rullerende opptak, vår og høst. Helårsdata slått sammen.',
  },
  inn_nett: {
    shortName: 'INN nett',
    fullName:  'INN – Digital bachelor (BAØKAH)',
    note:      'Kun 2025-data tilgjengelig. Organisasjon og ledelse mangler (G/H-skala).',
  },
  uit_nett: {
    shortName: 'UiT nett',
    fullName:  'UiT Norges arktiske – nettbasert bachelor',
    note:      'Data 2023–2025. Noen emner renummerert i 2025.',
  },
};

export function OnlineBachelorView() {
  const [selectedCourse, setSelectedCourse] = useState('');

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="rounded-xl p-5 flex items-start gap-4"
        style={{ backgroundColor: '#EFF6FF', border: '1.5px solid #93C5FD' }}>
        <div className="mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#DBEAFE' }}>
          <Wifi className="w-4 h-4" style={{ color: '#1D4ED8' }} />
        </div>
        <div className="flex-1">
          <div style={{ fontFamily: "'Lora', serif", fontSize: 17, fontWeight: 600, color: '#1E3A8A', marginBottom: 4 }}>
            Nettbaserte bachelorprogrammer i økonomi og administrasjon
          </div>
          <p style={{ fontSize: 13, color: '#1D4ED8', lineHeight: 1.6, marginBottom: 8 }}>
            Disse tre programmene tilbys digitalt/nettbasert og skiller seg fra campusbaserte studier
            i karakterprofil og kandidattall. Datagrunnlag: karakterweb.no.
          </p>
          <div className="flex flex-wrap gap-3">
            {ONLINE_UNIVERSITIES.map(id => {
              const info = ONLINE_INFO[id];
              return (
                <div key={id} className="rounded-lg px-3 py-2"
                  style={{ backgroundColor: 'white', border: '1px solid #93C5FD', minWidth: 200 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1E3A8A' }}>{info.shortName}</div>
                  <div style={{ fontSize: 11, color: '#3B82F6', marginTop: 1 }}>{info.fullName}</div>
                  <div style={{ fontSize: 10, color: '#6B7280', marginTop: 3, lineHeight: 1.4 }}>{info.note}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Course selector */}
      <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <CourseSelector selectedCourse={selectedCourse} onCourseSelect={setSelectedCourse} />
      </div>

      {/* Summary across all 3 */}
      <GradingHarshnessSummary universities={ONLINE_UNIVERSITIES} />

      {/* Per-course comparison */}
      {selectedCourse && (
        <CourseComparison courseCode={selectedCourse} universities={ONLINE_UNIVERSITIES} />
      )}
    </div>
  );
}
