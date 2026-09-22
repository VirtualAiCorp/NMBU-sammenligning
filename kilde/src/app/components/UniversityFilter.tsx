import { useState } from 'react';
import { Building2, Wifi, ChevronDown, ChevronRight } from 'lucide-react';
import { UNIVERSITY_INFO } from '../data/courseMapping';
import { AccreditationBadge } from './AccreditationBadge';

interface UniversityFilterProps {
  selectedUniversities: string[];
  onUniversitiesChange: (universities: string[]) => void;
}

const UNIVERSITY_IDS = ['nmbu', 'hio', 'uia', 'usn', 'nhh', 'bi', 'kristiania', 'oslomet', 'ntnu', 'ntnu_gjovik', 'ntnu_alesund', 'uit', 'nla', 'uis', 'inn', 'onh', 'nord', 'hvl', 'himolde', 'inn_rena'];
const ONLINE_IDS = ['kristiania_nett', 'inn_nett', 'uit_nett'];

export function UniversityFilter({ selectedUniversities, onUniversitiesChange }: UniversityFilterProps) {
  const [showOnline, setShowOnline] = useState(false);

  const toggleUniversity = (universityId: string) => {
    if (selectedUniversities.includes(universityId)) {
      onUniversitiesChange(selectedUniversities.filter(id => id !== universityId));
    } else {
      onUniversitiesChange([...selectedUniversities, universityId]);
    }
  };

  const allSelected = UNIVERSITY_IDS.every((id) => selectedUniversities.includes(id));

  return (
    <div>
      {/* Campus institutions */}
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-4 h-4" style={{ color: 'var(--nmbu-green-dark)' }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--nmbu-neutral)' }}>Velg universiteter å sammenligne</h3>
        <button
          onClick={() => onUniversitiesChange(allSelected ? [] : [...UNIVERSITY_IDS])}
          className="ml-2 px-3 py-1 text-xs rounded-full border transition-all"
          style={{ borderColor: 'var(--nmbu-green-3)', color: 'var(--nmbu-green-6)', backgroundColor: 'var(--nmbu-green-light)' }}
        >
          {allSelected ? 'Fjern alle' : 'Velg alle'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {UNIVERSITY_IDS.map((id) => {
          const uni = UNIVERSITY_INFO[id];
          const selected = selectedUniversities.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggleUniversity(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all text-sm"
              style={selected
                ? { backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', borderColor: 'var(--nmbu-green-dark)' }
                : { backgroundColor: '#fff', color: 'var(--nmbu-neutral)', borderColor: 'var(--nmbu-neutral-3)' }
              }
            >
              <span>{uni?.shortName ?? id}</span>
              {uni?.accreditations && (
                <span className={selected ? 'opacity-80' : ''}>
                  <AccreditationBadge accreditations={uni.accreditations} size="xs" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Online toggle */}
      <button
        onClick={() => setShowOnline(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
        style={{
          border: '1.5px solid #93C5FD',
          backgroundColor: showOnline ? '#DBEAFE' : '#EFF6FF',
          color: '#1D4ED8',
        }}
      >
        <Wifi className="w-3.5 h-3.5" />
        <span style={{ fontWeight: 600 }}>Nettbaserte program</span>
        {ONLINE_IDS.some(id => selectedUniversities.includes(id)) && (
          <span className="px-1.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: '#1D4ED8', fontSize: 10 }}>
            {ONLINE_IDS.filter(id => selectedUniversities.includes(id)).length} valgt
          </span>
        )}
        {showOnline ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {showOnline && (
        <div className="mt-3 p-3 rounded-xl flex flex-wrap gap-2"
          style={{ backgroundColor: '#EFF6FF', border: '1px solid #93C5FD' }}>
          <div className="w-full mb-1 text-xs" style={{ color: '#1D4ED8', fontWeight: 600 }}>
            Legg nettbaserte program til sammenligning:
          </div>
          {ONLINE_IDS.map((id) => {
            const uni = UNIVERSITY_INFO[id];
            const selected = selectedUniversities.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleUniversity(id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all text-sm"
                style={selected
                  ? { backgroundColor: '#1D4ED8', color: '#fff', borderColor: '#1D4ED8' }
                  : { backgroundColor: 'white', color: '#1E3A8A', borderColor: '#93C5FD' }
                }
              >
                <Wifi className="w-3 h-3" />
                <span>{uni?.shortName ?? id}</span>
              </button>
            );
          })}
          <div className="w-full mt-1 text-xs" style={{ color: '#6B7280' }}>
            Disse vises kun som sammenligning — de tilbyr ikke campusundervisning.
          </div>
        </div>
      )}
    </div>
  );
}
