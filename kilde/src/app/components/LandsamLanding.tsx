import { TrendingUp, Lock, BookOpen, Globe2 } from 'lucide-react';
import { INGEN_DATA_TEKST, type FacultyData } from '../data/faculties';
import {
  landsamHasComparison, landsamProgramsWithData,
  landsamCourseHasComparison, landsamCourseProgramsWithData,
} from '../data/landsamUtils';

interface Props {
  /** Fakultetet som skal vises — all data leses herfra. */
  faculty: FacultyData;
  /** Åpner opptaksanalysen. groupId = programgruppen som skal være valgt. */
  onOpenAnalysis: (groupId?: string) => void;
  /** Åpner emne- og karakteranalysen. groupId = emnegruppen som skal være valgt. */
  onOpenCourses: (groupId?: string) => void;
  /** Tilbake til fakultetsoversikten. */
  onBackToFaculties: () => void;
}

const LEVEL_LABEL: Record<string, string> = {
  bachelor: 'Bachelor',
  master5:  'Femårig master',
  master2:  'Toårig master',
};

export function LandsamLanding({ faculty, onOpenAnalysis, onOpenCourses, onBackToFaculties }: Props) {
  const admissionGroups = faculty.admissionGroups;
  const courseGroups = faculty.courseGroups;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
      <div className="max-w-3xl w-full">

        {/* Tilbake til fakulteter */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={onBackToFaculties}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}
          >
            ← Fakulteter
          </button>
        </div>

        <div className="flex flex-col items-center gap-1 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 rounded-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)' }} />
            <h1 style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '2rem', color: 'var(--nmbu-green-dark)' }}>
              {faculty.label}
            </h1>
          </div>
        </div>
        <p className="text-center mb-10" style={{ color: 'var(--nmbu-neutral-2)', fontSize: '14px', maxWidth: 560, margin: '0 auto 2.5rem' }}>
          Opptakstall og poenggrenser for fakultetets studieprogram sammenlignet med konkurrerende program
        </p>

        {/* Skillelinje — Analyse opptak */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: '#FFF3CD', border: '1px solid #F0C040' }}>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: '#856404' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#856404', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Analyse opptak
            </span>
          </div>
          <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
        </div>

        {/* Analyse opptak — hovedkort */}
        <div className="w-full rounded-2xl text-left" style={{ backgroundColor: '#fff', border: '2px solid #F0C040', boxShadow: '0 2px 8px rgba(133,100,4,0.10)' }}>
          <button
            onClick={() => onOpenAnalysis()}
            className="w-full p-8 text-left transition-all rounded-t-2xl"
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFBEE'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = ''; }}
          >
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#FFF3CD' }}>
                <TrendingUp className="w-6 h-6" style={{ color: '#856404' }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '20px', color: 'var(--nmbu-green-dark)' }}>
                    Analyse opptak
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FFF3CD', color: '#856404' }}>
                    Samordna opptak
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.6, maxWidth: 620 }}>
                  Sammenlign søkertall, søkerpress og poenggrenser 2020–2026 for fakultetets studieprogram mot
                  konkurrerende program ved andre institusjoner.
                </p>
              </div>
            </div>
          </button>

          {/* Hurtigvalg per programgruppe */}
          <div className="px-8 pb-6 flex items-center gap-3 flex-wrap" style={{ borderTop: '1px solid #F0C040' }}>
            {admissionGroups.length === 0 && (
              <span style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', paddingTop: 12 }}>{INGEN_DATA_TEKST}</span>
            )}
            {admissionGroups.length > 0 && (
              <span style={{ fontSize: 11, color: '#856404', fontWeight: 600, opacity: 0.7, whiteSpace: 'nowrap', paddingTop: 12 }}>Gå direkte til:</span>
            )}
            {admissionGroups.map((g) => {
              const ok = landsamHasComparison(g);
              if (!ok) return (
                <div key={g.id} title="Ikke nok data til sammenligning ennå"
                  className="flex flex-col items-start rounded-xl px-4 py-2.5 text-left"
                  style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1.5px dashed var(--nmbu-neutral-3)', marginTop: 12, minWidth: 170, cursor: 'not-allowed', opacity: 0.7 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-neutral-2)' }}>{g.label}</span>
                  <span style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginTop: 1 }}>
                    {LEVEL_LABEL[g.level] ?? g.level} · {landsamProgramsWithData(g) === 0 ? 'ingen tall ennå' : 'bare NMBU har tall'}
                  </span>
                </div>
              );
              return (
              <button
                key={g.id}
                onClick={() => onOpenAnalysis(g.id)}
                className="flex flex-col items-start rounded-xl px-4 py-2.5 text-left transition-all"
                style={{
                  backgroundColor: '#FFF3CD',
                  border: '1.5px solid #F0C040',
                  marginTop: 12,
                  minWidth: 170,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFE878'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c2963a'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFF3CD'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#F0C040'; }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#5a3d00' }}>{g.label}</span>
                <span style={{ fontSize: 10, color: '#856404', marginTop: 1 }}>
                  {LEVEL_LABEL[g.level] ?? g.level} · {g.entries.length} program
                </span>
              </button>
              );
            })}
          </div>
        </div>

        {/* Skillelinje — Emner og karakterer */}
        <div className="flex items-center gap-4 mt-8 mb-6">
          <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'var(--nmbu-green-4)', border: '1px solid var(--nmbu-green-3)' }}>
            <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--nmbu-green-dark)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--nmbu-green-dark)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Emner og karakterer
            </span>
          </div>
          <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
        </div>

        {/* Emner og karakterer — hovedkort */}
        <div className="w-full rounded-2xl text-left" style={{ backgroundColor: '#fff', border: '2px solid var(--nmbu-green-3)', boxShadow: '0 2px 8px rgba(2,92,79,0.10)' }}>
          <button
            onClick={() => onOpenCourses()}
            className="w-full p-8 text-left transition-all rounded-t-2xl"
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--nmbu-green-light)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = ''; }}
          >
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--nmbu-green-4)' }}>
                <BookOpen className="w-6 h-6" style={{ color: 'var(--nmbu-green-dark)' }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '20px', color: 'var(--nmbu-green-dark)' }}>
                    Emner og karakterer
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>
                    DBH/HKDIR
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.6, maxWidth: 620 }}>
                  Karakterindeks, karakterfordeling og emnetabeller for studentene på fakultetets program,
                  sammenlignet med de samme fagene ved andre institusjoner.
                </p>
              </div>
            </div>
          </button>

          {/* Hurtigvalg per emnegruppe */}
          <div className="px-8 pb-6 flex items-center gap-3 flex-wrap" style={{ borderTop: '1px solid var(--nmbu-green-3)' }}>
            {courseGroups.length === 0 && (
              <span style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', paddingTop: 12 }}>{INGEN_DATA_TEKST}</span>
            )}
            {courseGroups.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--nmbu-green-dark)', fontWeight: 600, opacity: 0.7, whiteSpace: 'nowrap', paddingTop: 12 }}>Gå direkte til:</span>
            )}
            {courseGroups.map((g) => {
              const ok = landsamCourseHasComparison(g);
              if (!ok) return (
                <div key={g.id} title="Ikke nok emnetall til sammenligning ennå"
                  className="flex flex-col items-start rounded-xl px-4 py-2.5 text-left"
                  style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1.5px dashed var(--nmbu-neutral-3)', marginTop: 12, minWidth: 170, cursor: 'not-allowed', opacity: 0.7 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-neutral-2)' }}>{g.label}</span>
                  <span style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginTop: 1 }}>
                    {LEVEL_LABEL[g.level] ?? g.level} · {landsamCourseProgramsWithData(g) === 0 ? 'ingen emnetall ennå' : 'bare NMBU har emnetall'}
                  </span>
                </div>
              );
              return (
                <button
                  key={g.id}
                  onClick={() => onOpenCourses(g.id)}
                  className="flex flex-col items-start rounded-xl px-4 py-2.5 text-left transition-all"
                  style={{
                    backgroundColor: 'var(--nmbu-green-4)',
                    border: '1.5px solid var(--nmbu-green-3)',
                    marginTop: 12,
                    minWidth: 170,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--nmbu-green-3)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--nmbu-green-2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--nmbu-green-4)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--nmbu-green-3)'; }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>{g.label}</span>
                  <span style={{ fontSize: 10, color: 'var(--nmbu-green-6)', marginTop: 1 }}>
                    {LEVEL_LABEL[g.level] ?? g.level} · {g.programs.length} program
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kommer-kort */}
        <div className="mt-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--nmbu-neutral-2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Under arbeid
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            {[
              {
                id: 'markedsstatus',
                icon: <Globe2 className="w-5 h-5" style={{ color: 'var(--nmbu-neutral-2)' }} />,
                title: 'Markedsstatus',
                desc: 'Status og utvikling hos konkurrerende institusjoner.',
              },
            ].map((card) => (
              <div key={card.id}
                className="rounded-2xl p-7 text-left"
                style={{ backgroundColor: '#fff', border: '1px dashed var(--nmbu-neutral-3)', opacity: 0.6, cursor: 'not-allowed' }}
                title="Kommer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
                    {card.icon}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-2)' }}>
                    <Lock className="w-3 h-3" /> Kommer
                  </div>
                </div>
                <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '18px', color: 'var(--nmbu-neutral-1)', marginBottom: 8 }}>{card.title}</div>
                <p style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.5 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer notice */}
        <div className="mt-10 text-center" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
          Feil, forslag til endringer eller utvidelse av datasett?{' '}
          Kontakt:{' '}
          <a
            href="mailto:mathias.sydtangen.smogeli@nmbu.no"
            style={{ color: 'var(--nmbu-green-dark)', fontWeight: 500, textDecoration: 'none' }}
          >
            mathias.sydtangen.smogeli@nmbu.no
          </a>
        </div>
      </div>
    </div>
  );
}
