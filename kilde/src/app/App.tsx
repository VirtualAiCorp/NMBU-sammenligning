import { useState } from 'react';
import { CourseSelector } from './components/CourseSelector';
import { CourseComparison } from './components/CourseComparison';
import { UniversityFilter } from './components/UniversityFilter';
import { CourseMappingTable } from './components/CourseMappingTable';
import { AdmissionStats } from './components/AdmissionStats';
import { StudiebarometerStats } from './components/StudiebarometerStats';
import { GradingHarshnessSummary } from './components/GradingHarshnessSummary';
import { GradeInflationDashboard } from './components/GradeInflationDashboard';
import { MapView } from './components/MapView';
import { FirstYearComparison } from './components/FirstYearComparison';
import { OnlineBachelorView } from './components/OnlineBachelorView';
import { MasterView } from './components/MasterView';
import { MasterComparisonChart } from './components/MasterComparisonChart';
import { NMBUMasterAnalysis } from './components/NMBUMasterAnalysis';
import { AdmissionAnalysis2026 } from './components/AdmissionAnalysis2026';
import { MarkedsstatusView } from './components/MarkedsstatusView';
import { FacultyLanding, type Faculty } from './components/FacultyLanding';
import { LandsamLanding } from './components/LandsamLanding';
import { LandsamAdmissionAnalysis } from './components/LandsamAdmissionAnalysis';
import { LandsamCourseAnalysis } from './components/LandsamCourseAnalysis';
import { FacultyMarketStatus } from './components/FacultyMarketStatus';
import { FACULTIES } from './data/faculties';
import { BookOpen, Table2, BarChart2, Star, Scale, Map, GraduationCap, GalleryVerticalEnd, Award, ScatterChart, TrendingUp, ArrowUpRight, Wifi, Globe2 } from 'lucide-react';

type ProgramLevel = 'bachelor' | 'master' | 'opptak2026' | 'markedsstatus';
type ViewMode = 'course' | 'mapping' | 'admission' | 'karakterindeks' | 'studiebarometer' | 'map' | 'firstyear' | 'online';
type MasterViewMode = 'masteroppgave' | 'sammenligning' | 'nmbu-emner';
type FacultyView = 'landing' | 'analyse' | 'emner' | 'markedsstatus';

export default function App() {
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [facultyView, setFacultyView] = useState<FacultyView>('landing');
  const [facultyGroup, setFacultyGroup] = useState<string | undefined>(undefined);
  const [facultyCourseGroup, setFacultyCourseGroup] = useState<string | undefined>(undefined);
  const [programLevel, setProgramLevel] = useState<ProgramLevel | null>(null);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(
    ['nmbu', 'hio', 'uia', 'usn', 'nhh', 'bi', 'kristiania', 'oslomet', 'ntnu', 'ntnu_gjovik', 'ntnu_alesund', 'uit', 'nla', 'uis', 'inn', 'onh', 'nord', 'hvl', 'himolde', 'inn_rena']
  );
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('course');
  const [masterViewMode, setMasterViewMode] = useState<MasterViewMode>('masteroppgave');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [analysisInitialTab, setAnalysisInitialTab] = useState<'oa' | 'samf' | 'arsstudier'>('oa');

  const goToAnalysis = (tab: 'oa' | 'samf' | 'arsstudier') => {
    setAnalysisInitialTab(tab);
    setProgramLevel('opptak2026');
  };

  const bachelorTabs: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'course',          label: 'Sammenlign emne',      icon: <BookOpen className="w-4 h-4" /> },
    { id: 'mapping',         label: 'Emnekartlegging',      icon: <Table2 className="w-4 h-4" /> },
    { id: 'admission',       label: 'Opptakstall',          icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'karakterindeks',  label: 'Karakterindeks',       icon: <Scale className="w-4 h-4" /> },
    { id: 'studiebarometer', label: 'Studiebarometeret',    icon: <Star className="w-4 h-4" /> },
    { id: 'map',             label: 'Kart',                 icon: <Map className="w-4 h-4" /> },
    { id: 'firstyear',       label: '1. studieår',          icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'online',          label: 'Nettbasert ØA',        icon: <Wifi className="w-4 h-4" /> },
  ];

  const masterTabs: { id: MasterViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'masteroppgave',  label: 'Masteroppgavekarakterer',          icon: <Award className="w-4 h-4" /> },
    { id: 'sammenligning',  label: 'Inntaksgrense vs. karaktersnitt',  icon: <ScatterChart className="w-4 h-4" /> },
    { id: 'nmbu-emner',     label: 'Emner + masteroppgave (NMBU)',     icon: <ArrowUpRight className="w-4 h-4" /> },
  ];

  const getBachelorTabStyle = (id: ViewMode): React.CSSProperties => {
    if (viewMode === id) return { backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' };
    if (hoveredTab === id) return { backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' };
    return { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' };
  };

  const getMasterTabStyle = (id: MasterViewMode): React.CSSProperties => {
    if (masterViewMode === id) return { backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' };
    if (hoveredTab === id) return { backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' };
    return { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' };
  };

  // ── Fakultetsnivå: NMBU-forside ──────────────────────────────────────────
  if (faculty === null) {
    return (
      <FacultyLanding
        onSelect={(f) => { setFaculty(f); setFacultyView('landing'); setFacultyGroup(undefined); setFacultyCourseGroup(undefined); }}
      />
    );
  }

  // ── Fakultetsskjermene (LANDSAM, REALTEK …) ───────────────────────────────
  if (faculty === 'landsam' || faculty === 'realtek' || faculty === 'biovit' || faculty === 'kbm' || faculty === 'mina') {
    const fac = FACULTIES[faculty];

    if (facultyView === 'landing') {
      return (
        <LandsamLanding
          faculty={fac}
          onOpenAnalysis={(g) => { setFacultyGroup(g); setFacultyView('analyse'); }}
          onOpenCourses={(g) => { setFacultyCourseGroup(g); setFacultyView('emner'); }}
          onOpenMarketStatus={() => setFacultyView('markedsstatus')}
          onBackToFaculties={() => setFaculty(null)}
        />
      );
    }

    if (facultyView === 'markedsstatus') {
      return (
        <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
          <div className="max-w-7xl mx-auto">

            {/* Top-level switcher */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setFacultyView('landing')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}
              >
                ← Tilbake
              </button>
              <span className="px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)' }}>
                {fac.label}
              </span>
            </div>

            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-9 rounded-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)' }} />
                <h1 className="text-4xl" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif", fontWeight: 500 }}>
                  Markedsstatus
                </h1>
              </div>
              <p className="text-sm pl-4" style={{ color: 'var(--nmbu-neutral-1)' }}>
                Status og utvikling hos konkurrerende institusjoner · Kilde: styrepapirer og årsrapporter
              </p>
            </header>

            <FacultyMarketStatus key={fac.id} faculty={fac} />
          </div>
        </div>
      );
    }

    if (facultyView === 'emner') {
      return (
        <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
          <div className="max-w-7xl mx-auto">

            {/* Top-level switcher */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setFacultyView('landing')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}
              >
                ← Tilbake
              </button>
              <span className="px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)' }}>
                {fac.label}
              </span>
            </div>

            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-9 rounded-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)' }} />
                <h1 className="text-4xl" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif", fontWeight: 500 }}>
                  Emner og karakterer
                </h1>
              </div>
              <p className="text-sm pl-4" style={{ color: 'var(--nmbu-neutral-1)' }}>
                Karakterindeks, karakterfordeling og emnetabeller per studieprogram · Kilde: DBH/HKDIR
              </p>
            </header>

            <LandsamCourseAnalysis
              key={`${fac.id}-${facultyCourseGroup ?? 'alle'}`}
              faculty={fac}
              initialGroup={facultyCourseGroup}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
        <div className="max-w-7xl mx-auto">

          {/* Top-level switcher */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setFacultyView('landing')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}
            >
              ← Tilbake
            </button>
            <span className="px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)' }}>
              {fac.label}
            </span>
          </div>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-9 rounded-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)' }} />
              <h1 className="text-4xl" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif", fontWeight: 500 }}>
                Analyse opptak
              </h1>
            </div>
            <p className="text-sm pl-4" style={{ color: 'var(--nmbu-neutral-1)' }}>
              Søkertall, poenggrenser og trender 2020–2026 · Kilde: Samordna opptak / HKDIR
            </p>
          </header>

          <LandsamAdmissionAnalysis
            key={`${fac.id}-${facultyGroup ?? 'alle'}`}
            faculty={fac}
            initialGroup={facultyGroup}
          />
        </div>
      </div>
    );
  }

  // Landing / program picker
  if (programLevel === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
        <div className="max-w-3xl w-full">
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setFaculty(null)}
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
                Handelshøyskolen NMBU
              </h1>
            </div>
          </div>
          <p className="text-center mb-10" style={{ color: 'var(--nmbu-neutral-2)', fontSize: '14px', maxWidth: 520, margin: '0 auto 2.5rem' }}>
            Sammenligning av opptaksgrenser, karakterstatistikk og studiekvalitet på tvers av norske universiteter
          </p>

          {/* Bachelor + Master */}
          <div className="grid grid-cols-2 gap-5 mb-8">
            {[
              {
                id: 'bachelor' as ProgramLevel,
                icon: <GalleryVerticalEnd className="w-5 h-5" style={{ color: 'var(--nmbu-green-dark)' }} />,
                badge: '3 år',
                title: 'Bachelor',
                subtitle: 'Økonomi og administrasjon',
                desc: 'Sammenlign emnekarakterer, opptakstall, studiebarometer og karakterindeks for bachelor-programmet på tvers av norske universiteter.',
              },
              {
                id: 'master' as ProgramLevel,
                icon: <Award className="w-5 h-5" style={{ color: 'var(--nmbu-green-dark)' }} />,
                badge: '2 år · Siviløkonom',
                title: 'Master',
                subtitle: 'Økonomi og administrasjon (siviløkonom)',
                desc: 'Karakterfordeling på masteroppgaver ved universiteter som tilbyr siviløkonomstudiet.',
              },
            ].map((card) => (
              <button key={card.id}
                onClick={() => setProgramLevel(card.id)}
                className="rounded-2xl p-8 text-left transition-all"
                style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 2px 8px rgba(2,92,79,0.08)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(2,92,79,0.16)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(2,92,79,0.08)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--nmbu-green-4)' }}>
                    {card.icon}
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>
                    {card.badge}
                  </div>
                </div>
                <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '20px', color: 'var(--nmbu-green-dark)', marginBottom: 6 }}>{card.title}</div>
                <div style={{ fontSize: '15px', color: 'var(--nmbu-neutral-1)', marginBottom: 12 }}>{card.subtitle}</div>
                <p style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.5 }}>{card.desc}</p>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: '#FFF3CD', border: '1px solid #F0C040' }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: '#856404' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#856404', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Analyse opptak høst 2026
              </span>
            </div>
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
          </div>

          {/* Opptak 2026 card — full width */}
          <div className="w-full rounded-2xl text-left" style={{ backgroundColor: '#fff', border: '2px solid #F0C040', boxShadow: '0 2px 8px rgba(133,100,4,0.10)' }}>
            {/* Card header — clickable */}
            <button
              onClick={() => goToAnalysis('oa')}
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
                      Analyse opptak høst 2026
                    </div>
                    <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FFF3CD', color: '#856404' }}>
                      Nye tall · 23. juli 2026
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.6, maxWidth: 620 }}>
                    Sammenlign søkertall, poenggrenser og trender 2020–2026 for <strong>Økonomi og administrasjon</strong>, <strong>Samfunnsøkonomi</strong> og <strong>Årsstudier</strong> på tvers av alle norske universiteter og høyskoler.
                  </p>
                </div>
              </div>
            </button>

            {/* Quick-access tab buttons */}
            <div className="px-8 pb-6 flex items-center gap-3 flex-wrap" style={{ borderTop: '1px solid #F0C040' }}>
              <span style={{ fontSize: 11, color: '#856404', fontWeight: 600, opacity: 0.7, whiteSpace: 'nowrap', paddingTop: 12 }}>Gå direkte til:</span>
              {([
                { tab: 'oa',         label: 'Økonomi og administrasjon', desc: '20+ institusjoner · bachelor' },
                { tab: 'samf',       label: 'Samfunnsøkonomi',           desc: 'Øk. bachelor · siviløk.' },
                { tab: 'arsstudier', label: 'Årsstudier',                desc: 'Deltid · nettbasert · 11 prog.' },
              ] as { tab: 'oa' | 'samf' | 'arsstudier'; label: string; desc: string }[]).map(({ tab, label, desc }) => (
                <button
                  key={tab}
                  onClick={() => goToAnalysis(tab)}
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
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#5a3d00' }}>{label}</span>
                  <span style={{ fontSize: 10, color: '#856404', marginTop: 1 }}>{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Markedsstatus card */}
          <div className="mt-5">
            <div className="flex items-center gap-4 mb-5">
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
              onClick={() => setProgramLevel('markedsstatus')}
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
                    Status og utvikling hos konkurrerende institusjoner — <strong>HiØ, OsloMet, UiS, USN, HVL, INN, NHH</strong> — basert på fakultetsstyrepapirer og årsrapporter. Nedlastbare PDF-rapporter for hvert lærested.
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

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Top-level switcher */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setProgramLevel(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}
          >
            ← Tilbake
          </button>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
            {([
              { id: 'bachelor',    label: 'Bachelor',         icon: <GalleryVerticalEnd className="w-3.5 h-3.5" /> },
              { id: 'master',      label: 'Master',           icon: <Award className="w-3.5 h-3.5" /> },
              { id: 'opptak2026',   label: 'Opptak 2026',      icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { id: 'markedsstatus', label: 'Markedsstatus',    icon: <Globe2 className="w-3.5 h-3.5" /> },
            ] as { id: ProgramLevel; label: string; icon: React.ReactNode }[]).map((tab, i) => (
              <button key={tab.id}
                onClick={() => setProgramLevel(tab.id)}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs transition-all"
                style={{
                  backgroundColor: programLevel === tab.id ? 'var(--nmbu-green-dark)' : '#fff',
                  color: programLevel === tab.id ? '#fff' : 'var(--nmbu-neutral-1)',
                  borderLeft: i > 0 ? '1px solid var(--nmbu-neutral-3)' : 'none',
                }}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-9 rounded-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)' }} />
            <h1 className="text-4xl" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif", fontWeight: 500 }}>
              {programLevel === 'bachelor'
                ? 'Bachelor Økonomi og Administrasjon'
                : programLevel === 'master'
                ? 'Master Økonomi og Administrasjon'
                : programLevel === 'markedsstatus'
                ? 'Markedsstatus'
                : 'Analyse opptak høst 2026'}
            </h1>
          </div>
          <p className="text-sm pl-4" style={{ color: 'var(--nmbu-neutral-1)' }}>
            {programLevel === 'bachelor'
              ? 'Sammenlign karakterstatistikk og studiekvalitet på tvers av norske universiteter'
              : programLevel === 'master'
              ? 'Karakterfordeling på masteroppgaver ved norske siviløkonomutdanninger'
              : programLevel === 'markedsstatus'
              ? 'Status og utvikling hos konkurrerende institusjoner · Basert på fakultetsstyrepapirer'
              : 'Søkertall, poenggrenser og trender 2021–2026 · Kilde: Samordna Opptak'}
          </p>
        </header>

        {/* ── BACHELOR ── */}
        {programLevel === 'bachelor' && (
          <>
            <div className="bg-white rounded-xl p-6 mb-6" style={{ boxShadow: '0 1px 4px rgba(2,92,79,0.08)', border: '1px solid var(--nmbu-neutral-3)' }}>
              <div className="flex gap-2 mb-6 flex-wrap pb-5" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
                {bachelorTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id)}
                    onMouseEnter={() => setHoveredTab(tab.id)}
                    onMouseLeave={() => setHoveredTab(null)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm"
                    style={getBachelorTabStyle(tab.id)}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {viewMode === 'course' && (
                <CourseSelector selectedCourse={selectedCourse} onCourseSelect={setSelectedCourse} />
              )}

              {viewMode !== 'mapping' && viewMode !== 'admission' && viewMode !== 'studiebarometer' && viewMode !== 'map' && viewMode !== 'firstyear' && viewMode !== 'online' && (
                <UniversityFilter selectedUniversities={selectedUniversities} onUniversitiesChange={setSelectedUniversities} />
              )}
            </div>

            {viewMode === 'course' && selectedUniversities.length > 0 && (
              <GradingHarshnessSummary universities={selectedUniversities} />
            )}
            {viewMode === 'course' && selectedCourse && selectedUniversities.length > 0 && (
              <CourseComparison courseCode={selectedCourse} universities={selectedUniversities} />
            )}
            {viewMode === 'mapping' && <CourseMappingTable />}
            {viewMode === 'admission' && <AdmissionStats />}
            {viewMode === 'karakterindeks' && selectedUniversities.length > 0 && (
              <GradeInflationDashboard universities={selectedUniversities} />
            )}
            {viewMode === 'studiebarometer' && <StudiebarometerStats />}
            {viewMode === 'map' && <MapView />}
            {viewMode === 'firstyear' && <FirstYearComparison />}
            {viewMode === 'online' && <OnlineBachelorView />}
          </>
        )}

        {/* ── MASTER ── */}
        {programLevel === 'master' && (
          <>
            <div className="bg-white rounded-xl p-6 mb-6" style={{ boxShadow: '0 1px 4px rgba(2,92,79,0.08)', border: '1px solid var(--nmbu-neutral-3)' }}>
              <div className="flex gap-2 flex-wrap pb-5" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
                {masterTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setMasterViewMode(tab.id)}
                    onMouseEnter={() => setHoveredTab(tab.id)}
                    onMouseLeave={() => setHoveredTab(null)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm"
                    style={getMasterTabStyle(tab.id)}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {masterViewMode === 'masteroppgave' && <MasterView />}
            {masterViewMode === 'sammenligning' && <MasterComparisonChart />}
            {masterViewMode === 'nmbu-emner' && <NMBUMasterAnalysis />}
          </>
        )}

        {/* ── OPPTAK 2026 ── */}
        {programLevel === 'opptak2026' && <AdmissionAnalysis2026 key={analysisInitialTab} initialTab={analysisInitialTab} />}

        {/* ── MARKEDSSTATUS ── */}
        {programLevel === 'markedsstatus' && <MarkedsstatusView />}

      </div>
    </div>
  );
}
