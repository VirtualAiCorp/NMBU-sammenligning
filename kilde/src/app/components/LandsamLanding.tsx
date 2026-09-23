import { TrendingUp, BookOpen, Globe2, Star, GraduationCap, Users, Microscope, Home, Landmark, Coins } from 'lucide-react';
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
  /** Åpner markedsstatusen for fakultetet. */
  onOpenMarketStatus: () => void;
  /** Åpner Studiebarometeret for fakultetet. */
  onOpenStudiebarometer: () => void;
  /** Åpner gjennomføring/frafall/studenttall for fakultetet. */
  onOpenCompletion: () => void;
  /** Åpner «Studentene» (alder, utenlandske, utveksling). */
  onOpenStudents: () => void;
  /** Åpner «Fagmiljøet» (tilsatte og publisering, fakultet mot fakultet). */
  onOpenStaff: () => void;
  /** Åpner «Bolig og studentboliger» for fakultetets studiesteder. */
  onOpenHousing: () => void;
  /** Åpner «Økonomi og styringsindikatorer» for institusjonene i fakultetets sammenligninger. */
  onOpenEconomy: () => void;
  /** Åpner «Inntekt per program» (anslått resultatbasert finansiering). */
  onOpenRevenue: () => void;
  /** Tilbake til fakultetsoversikten. */
  onBackToFaculties: () => void;
}

const LEVEL_LABEL: Record<string, string> = {
  bachelor: 'Bachelor',
  master5:  'Femårig master',
  master2:  'Toårig master',
};

export function LandsamLanding({ faculty, onOpenAnalysis, onOpenCourses, onOpenMarketStatus, onOpenStudiebarometer, onOpenCompletion, onOpenStudents, onOpenStaff, onOpenHousing, onOpenEconomy, onOpenRevenue, onBackToFaculties }: Props) {
  const admissionGroups = faculty.admissionGroups;
  const courseGroups = faculty.courseGroups;
  const markedsstatus = faculty.marketStatus;
  const antallDok = markedsstatus.reduce((sum, i) => sum + i.dokumenter.length, 0);
  const markedsstatusTekst = markedsstatus.length === 0
    ? ' Ingen styrepapirer samlet inn ennå for dette fakultetet.'
    : ` ${markedsstatus.length} institusjoner, ${antallDok} nedlastbare dokumenter.`;

  const sbEntries = faculty.studiebarometer;
  const sbMedTall = sbEntries.filter((e) => e.scores.helhetsvurdering != null).length;
  const sbTekst = sbEntries.length === 0
    ? ' Ingen tall hentet inn ennå for dette fakultetet.'
    : ` ${sbMedTall} av ${sbEntries.length} program har publiserte tall.`;

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

        {/* Markedsstatus */}
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: '#EFF6FF', border: '1px solid #93C5FD' }}>
              <Globe2 className="w-3.5 h-3.5" style={{ color: '#1D4ED8' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Markedsstatus
              </span>
            </div>
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
          </div>

          <button
            onClick={onOpenMarketStatus}
            className="w-full rounded-2xl p-7 text-left transition-all"
            style={{ backgroundColor: '#fff', border: '2px solid #93C5FD', boxShadow: '0 2px 8px rgba(29,78,216,0.08)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(29,78,216,0.14)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(29,78,216,0.08)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#DBEAFE' }}>
                <Globe2 className="w-6 h-6" style={{ color: '#1D4ED8' }} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '20px', color: 'var(--nmbu-green-dark)' }}>
                    Markedsstatus
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}>
                    Konkurrentanalyse
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.6, maxWidth: 580 }}>
                  Status og utvikling hos konkurrerende institusjoner — basert på styrepapirer og årsrapporter.
                  {markedsstatusTekst}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Studiebarometeret */}
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: '#F5F3FF', border: '1px solid #C4B5FD' }}>
              <Star className="w-3.5 h-3.5" style={{ color: '#6D28D9' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6D28D9', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Studiebarometeret
              </span>
            </div>
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
          </div>

          <button
            onClick={onOpenStudiebarometer}
            className="w-full rounded-2xl p-7 text-left transition-all"
            style={{ backgroundColor: '#fff', border: '2px solid #C4B5FD', boxShadow: '0 2px 8px rgba(109,40,217,0.08)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(109,40,217,0.14)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(109,40,217,0.08)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#EDE9FE' }}>
                <Star className="w-6 h-6" style={{ color: '#6D28D9' }} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '20px', color: 'var(--nmbu-green-dark)' }}>
                    Studiebarometeret
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }}>
                    NOKUT/HK-dir
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.6, maxWidth: 580 }}>
                  Studentenes vurdering av studieprogrammet — undervisning, læringsmiljø, yrkesrelevans og
                  helhetsvurdering på skala 1–5, mot konkurrerende program og fagfeltsnittet.
                  {sbTekst}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Gjennomføring */}
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7' }}>
              <GraduationCap className="w-3.5 h-3.5" style={{ color: '#047857' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#047857', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Gjennomføring
              </span>
            </div>
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
          </div>
          <button
            onClick={onOpenCompletion}
            className="w-full rounded-2xl p-7 text-left transition-all"
            style={{ backgroundColor: '#fff', border: '2px solid #6EE7B7', boxShadow: '0 2px 8px rgba(4,120,87,0.08)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(4,120,87,0.14)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(4,120,87,0.08)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#D1FAE5' }}>
                <GraduationCap className="w-6 h-6" style={{ color: '#047857' }} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '20px', color: 'var(--nmbu-green-dark)' }}>
                    Gjennomføring, frafall og studenttall
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#D1FAE5', color: '#047857' }}>
                    DBH/HK-dir
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.6, maxWidth: 580 }}>
                  Andel av hvert startkull som fullfører på normert tid, ett og to år etter, frafall, og registrerte,
                  nye studenter og kandidater per år, for NMBU og de konkurrerende programmene.
                  {faculty.completionHentet ? ` Hentet ${faculty.completionHentet}.` : ''}
                </p>
              </div>
            </div>
          </button>
          <button
            onClick={onOpenStudents}
            className="w-full rounded-2xl p-7 text-left transition-all mt-5"
            style={{ backgroundColor: '#fff', border: '2px solid #6EE7B7', boxShadow: '0 2px 8px rgba(4,120,87,0.08)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(4,120,87,0.14)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(4,120,87,0.08)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#D1FAE5' }}>
                <Users className="w-6 h-6" style={{ color: '#047857' }} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '20px', color: 'var(--nmbu-green-dark)' }}>
                    Studentene
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#D1FAE5', color: '#047857' }}>
                    DBH/HK-dir
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.6, maxWidth: 580 }}>
                  Hvem studentene er: aldersfordeling, andel utenlandske studenter og hvor mange som drar på utveksling,
                  per program for NMBU og de konkurrerende programmene, med landssnitt for samme gradsnivå.
                </p>
              </div>
            </div>
          </button>
          <button
            onClick={onOpenStaff}
            className="w-full rounded-2xl p-7 text-left transition-all mt-5"
            style={{ backgroundColor: '#fff', border: '2px solid #6EE7B7', boxShadow: '0 2px 8px rgba(4,120,87,0.08)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(4,120,87,0.14)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(4,120,87,0.08)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#D1FAE5' }}>
                <Microscope className="w-6 h-6" style={{ color: '#047857' }} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '20px', color: 'var(--nmbu-green-dark)' }}>
                    Fagmiljøet: tilsatte og publisering
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#D1FAE5', color: '#047857' }}>
                    DBH/HK-dir
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.6, maxWidth: 580 }}>
                  Studentårsverk per faglig årsverk, førstestillinger, rekruttering og publiseringspoeng for fakultetet mot
                  fakultetene som eier konkurrentprogrammene, og institusjon mot institusjon.
                </p>
              </div>
            </div>
          </button>
          <button
            onClick={onOpenHousing}
            className="w-full rounded-2xl p-7 text-left transition-all mt-5"
            style={{ backgroundColor: '#fff', border: '2px solid #6EE7B7', boxShadow: '0 2px 8px rgba(4,120,87,0.08)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(4,120,87,0.14)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(4,120,87,0.08)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#D1FAE5' }}>
                <Home className="w-6 h-6" style={{ color: '#047857' }} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '20px', color: 'var(--nmbu-green-dark)' }}>
                    Bolig og studentboliger
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#D1FAE5', color: '#047857' }}>
                    NSO/SSB
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.6, maxWidth: 580 }}>
                  Dekningsgrad for studentboliger, kvadratmeterpriser og leiepriser i Ås mot studiestedene til
                  konkurrentprogrammene i fakultetets sammenligninger, med nabokommuner rundt hvert studiested.
                </p>
              </div>
            </div>
          </button>
          <button
            onClick={onOpenEconomy}
            className="w-full rounded-2xl p-7 text-left transition-all mt-5"
            style={{ backgroundColor: '#fff', border: '2px solid #6EE7B7', boxShadow: '0 2px 8px rgba(4,120,87,0.08)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(4,120,87,0.14)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(4,120,87,0.08)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#D1FAE5' }}>
                <Landmark className="w-6 h-6" style={{ color: '#047857' }} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '20px', color: 'var(--nmbu-green-dark)' }}>
                    Økonomi og styringsindikatorer
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#D1FAE5', color: '#047857' }}>
                    DBH/HK-dir
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.6, maxWidth: 580 }}>
                  Driftsinntekter, statstilskudd, eksterne inntekter og KDs styringsindikatorer for NMBU mot institusjonene
                  i fakultetets sammenligninger (økonomi finnes bare per institusjon).
                </p>
              </div>
            </div>
          </button>
          <button
            onClick={onOpenRevenue}
            className="w-full rounded-2xl p-7 text-left transition-all mt-5"
            style={{ backgroundColor: '#fff', border: '2px solid #6EE7B7', boxShadow: '0 2px 8px rgba(4,120,87,0.08)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(4,120,87,0.14)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(4,120,87,0.08)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#D1FAE5' }}>
                <Coins className="w-6 h-6" style={{ color: '#047857' }} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '20px', color: 'var(--nmbu-green-dark)' }}>
                    Inntekt per program
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#D1FAE5', color: '#047857' }}>
                    DBH/HK-dir
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.6, maxWidth: 580 }}>
                  Anslått resultatbasert finansiering fra studiepoeng og fullførte grader, per program og per student,
                  for NMBU og de konkurrerende programmene (finansieringssystemet fra 2025).
                </p>
              </div>
            </div>
          </button>
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
