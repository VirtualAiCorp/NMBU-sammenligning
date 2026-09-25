import { lazy, Suspense, useState, type ComponentType, type ReactNode } from 'react';
import { FacultyLanding, type Faculty } from './components/FacultyLanding';
import { LandsamLanding } from './components/LandsamLanding';
import { FACULTY_META, useFacultyData, type FacultyData, type FacultyId } from './data/faculties';
import { useLayout } from './layoutStore';
import { DashboardShell, TopbarShell, ShellHome, ShellHeader } from './components/AppShells';
import { KiChatKnapp } from './components/KiChatKnapp';
import { BookOpen, Table2, BarChart2, Star, Scale, Map, GraduationCap, GalleryVerticalEnd, Award, ScatterChart, TrendingUp, ArrowUpRight, Wifi, Globe2 } from 'lucide-react';

// Sidene lastes først når de åpnes (egne JavaScript-biter), slik at forsiden laster raskt.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lazyNamed = <T extends ComponentType<any>>(last: () => Promise<Record<string, unknown>>, navn: string) =>
  lazy(() => last().then((m) => ({ default: m[navn] as T })));
const CourseSelector = lazyNamed<typeof import('./components/CourseSelector')['CourseSelector']>(() => import('./components/CourseSelector'), 'CourseSelector');
const CourseComparison = lazyNamed<typeof import('./components/CourseComparison')['CourseComparison']>(() => import('./components/CourseComparison'), 'CourseComparison');
const UniversityFilter = lazyNamed<typeof import('./components/UniversityFilter')['UniversityFilter']>(() => import('./components/UniversityFilter'), 'UniversityFilter');
const CourseMappingTable = lazyNamed<typeof import('./components/CourseMappingTable')['CourseMappingTable']>(() => import('./components/CourseMappingTable'), 'CourseMappingTable');
const AdmissionStats = lazyNamed<typeof import('./components/AdmissionStats')['AdmissionStats']>(() => import('./components/AdmissionStats'), 'AdmissionStats');
const StudiebarometerStats = lazyNamed<typeof import('./components/StudiebarometerStats')['StudiebarometerStats']>(() => import('./components/StudiebarometerStats'), 'StudiebarometerStats');
const GradingHarshnessSummary = lazyNamed<typeof import('./components/GradingHarshnessSummary')['GradingHarshnessSummary']>(() => import('./components/GradingHarshnessSummary'), 'GradingHarshnessSummary');
const GradeInflationDashboard = lazyNamed<typeof import('./components/GradeInflationDashboard')['GradeInflationDashboard']>(() => import('./components/GradeInflationDashboard'), 'GradeInflationDashboard');
const MapView = lazyNamed<typeof import('./components/MapView')['MapView']>(() => import('./components/MapView'), 'MapView');
const FirstYearComparison = lazyNamed<typeof import('./components/FirstYearComparison')['FirstYearComparison']>(() => import('./components/FirstYearComparison'), 'FirstYearComparison');
const OnlineBachelorView = lazyNamed<typeof import('./components/OnlineBachelorView')['OnlineBachelorView']>(() => import('./components/OnlineBachelorView'), 'OnlineBachelorView');
const MasterView = lazyNamed<typeof import('./components/MasterView')['MasterView']>(() => import('./components/MasterView'), 'MasterView');
const MasterComparisonChart = lazyNamed<typeof import('./components/MasterComparisonChart')['MasterComparisonChart']>(() => import('./components/MasterComparisonChart'), 'MasterComparisonChart');
const NMBUMasterAnalysis = lazyNamed<typeof import('./components/NMBUMasterAnalysis')['NMBUMasterAnalysis']>(() => import('./components/NMBUMasterAnalysis'), 'NMBUMasterAnalysis');
const AdmissionAnalysis2026 = lazyNamed<typeof import('./components/AdmissionAnalysis2026')['AdmissionAnalysis2026']>(() => import('./components/AdmissionAnalysis2026'), 'AdmissionAnalysis2026');
const MarkedsstatusView = lazyNamed<typeof import('./components/MarkedsstatusView')['MarkedsstatusView']>(() => import('./components/MarkedsstatusView'), 'MarkedsstatusView');
const PasswordGate = lazyNamed<typeof import('./components/PasswordGate')['PasswordGate']>(() => import('./components/PasswordGate'), 'PasswordGate');
const NmbuCourseExplorer = lazyNamed<typeof import('./components/NmbuCourseExplorer')['NmbuCourseExplorer']>(() => import('./components/NmbuCourseExplorer'), 'NmbuCourseExplorer');
const LandsamAdmissionAnalysis = lazyNamed<typeof import('./components/LandsamAdmissionAnalysis')['LandsamAdmissionAnalysis']>(() => import('./components/LandsamAdmissionAnalysis'), 'LandsamAdmissionAnalysis');
const LandsamCourseAnalysis = lazyNamed<typeof import('./components/LandsamCourseAnalysis')['LandsamCourseAnalysis']>(() => import('./components/LandsamCourseAnalysis'), 'LandsamCourseAnalysis');
const FacultyMarketStatus = lazyNamed<typeof import('./components/FacultyMarketStatus')['FacultyMarketStatus']>(() => import('./components/FacultyMarketStatus'), 'FacultyMarketStatus');
const FacultyStudiebarometer = lazyNamed<typeof import('./components/FacultyStudiebarometer')['FacultyStudiebarometer']>(() => import('./components/FacultyStudiebarometer'), 'FacultyStudiebarometer');
const FacultyCompletion = lazyNamed<typeof import('./components/FacultyCompletion')['FacultyCompletion']>(() => import('./components/FacultyCompletion'), 'FacultyCompletion');
const FacultyStudents = lazyNamed<typeof import('./components/FacultyStudents')['FacultyStudents']>(() => import('./components/FacultyStudents'), 'FacultyStudents');
const Sokergrunnlag = lazyNamed<typeof import('./components/Sokergrunnlag')['Sokergrunnlag']>(() => import('./components/Sokergrunnlag'), 'Sokergrunnlag');
const StudiestedBolig = lazyNamed<typeof import('./components/StudiestedBolig')['StudiestedBolig']>(() => import('./components/StudiestedBolig'), 'StudiestedBolig');
const LayoutLab = lazyNamed<typeof import('./components/LayoutLab')['LayoutLab']>(() => import('./components/LayoutLab'), 'LayoutLab');
const FacultyRevenue = lazyNamed<typeof import('./components/FacultyRevenue')['FacultyRevenue']>(() => import('./components/FacultyRevenue'), 'FacultyRevenue');
const InternOpptak = lazyNamed<typeof import('./components/InternOpptak')['InternOpptak']>(() => import('./components/InternOpptak'), 'InternOpptak');
const FacultyEconomyPage = lazyNamed<typeof import('./components/InstitusjonsSider')['FacultyEconomyPage']>(() => import('./components/InstitusjonsSider'), 'FacultyEconomyPage');
const FacultyStaffPage = lazyNamed<typeof import('./components/InstitusjonsSider')['FacultyStaffPage']>(() => import('./components/InstitusjonsSider'), 'FacultyStaffPage');
const NmbuEconomyPage = lazyNamed<typeof import('./components/InstitusjonsSider')['NmbuEconomyPage']>(() => import('./components/InstitusjonsSider'), 'NmbuEconomyPage');
const NmbuStaffPage = lazyNamed<typeof import('./components/InstitusjonsSider')['NmbuStaffPage']>(() => import('./components/InstitusjonsSider'), 'NmbuStaffPage');

type ProgramLevel = 'bachelor' | 'master' | 'opptak2026' | 'markedsstatus';
type ViewMode = 'course' | 'mapping' | 'admission' | 'karakterindeks' | 'studiebarometer' | 'map' | 'firstyear' | 'online';
type MasterViewMode = 'masteroppgave' | 'sammenligning' | 'nmbu-emner';
type FacultyView = 'landing' | 'analyse' | 'emner' | 'markedsstatus' | 'studiebarometer' | 'gjennomforing' | 'studentene' | 'fagmiljo' | 'bolig' | 'sokergrunnlag' | 'okonomi' | 'inntekt' | 'intern';

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

  // ── Oppsett og navigasjon ─────────────────────────────────────────────────
  const layout = useLayout();
  // Fakultetsdataene lastes når fakultetet åpnes. Emnedataene (den store delen) kreves bare på emnesiden;
  // på fakultetets forside lastes de i bakgrunnen, så hurtigvalgene for emner dukker opp når de er klare.
  const fakId = faculty && isFacultyIdAny(faculty) ? faculty : null;
  const fakData = useFacultyData(fakId, facultyView === 'emner' ? 'kreves' : facultyView === 'landing' ? 'bakgrunn' : 'nei');
  const goHome = () => { setFaculty(null); setFacultyView('landing'); };
  const navigate = (f: Faculty | null, view: FacultyView = 'landing', gruppe?: string) => {
    setFaculty(f);
    setFacultyView(view);
    setFacultyGroup(view === 'analyse' ? gruppe : undefined);
    setFacultyCourseGroup(view === 'emner' ? gruppe : undefined);
    if (f === 'hh-figma') setProgramLevel(null);
    window.scrollTo({ top: 0 });
  };

  // Innholdet i hver fakultetsmodul (samme i alle oppsett); rammen rundt velges av oppsettet.
  const FACULTY_MODULE_META: Record<Exclude<FacultyView, 'landing'>, { title: string; subtitle: string }> = {
    analyse: { title: 'Analyse opptak', subtitle: 'Søkertall, poenggrenser og trender 2020–2026 · Kilde: Samordna opptak / HKDIR' },
    emner: { title: 'Emner og karakterer', subtitle: 'Karakterindeks, karakterfordeling og emnetabeller per studieprogram · Kilde: DBH/HKDIR' },
    gjennomforing: { title: 'Gjennomføring, frafall og studenttall', subtitle: 'Startkull, fullført på normert tid, frafall, registrerte, nye studenter og kandidater · Kilde: DBH/HK-dir' },
    studentene: { title: 'Studentene', subtitle: 'Alder, utenlandske studenter og utveksling per program · Kilde: DBH/HK-dir' },
    studiebarometer: { title: 'Studiebarometeret', subtitle: 'Studentenes vurdering av studieprogrammet · skala 1–5 · Kilde: studiebarometeret.no' },
    markedsstatus: { title: 'Markedsstatus', subtitle: 'Status og utvikling hos konkurrerende institusjoner · Kilde: styrepapirer og årsrapporter' },
    fagmiljo: { title: 'Fagmiljøet: tilsatte og publisering', subtitle: 'Studentårsverk per faglig årsverk, førstestillinger og publisering, fakultet mot fakultet · Kilde: DBH/HK-dir' },
    sokergrunnlag: { title: 'Søkergrunnlaget', subtitle: 'Ungdomskullene per fylke fram mot 2045 og matematikk og gjennomføring i videregående · Kilde: SSB og Utdanningsdirektoratet' },
    bolig: { title: 'Bolig og studentboliger', subtitle: 'Studentboliger, kjøpspriser og leiepriser ved NMBU og konkurrentenes studiesteder · Kilde: NSO og SSB' },
    intern: { title: 'Opptak høsten 2026 (intern)', subtitle: 'Søkermassen rundt opptaksgrensen og simulering av større eller mindre opptaksrammer for bachelorprogrammene · Kilde: opptakskontoret (FS), aggregert og kryptert' },
    inntekt: { title: 'Inntekt per program', subtitle: 'Anslått resultatbasert finansiering fra studiepoeng og fullførte grader, NMBU mot konkurrentene · Kilde: DBH/HK-dir tabell 900, 908 og 104' },
    okonomi: { title: 'Økonomi og styringsindikatorer', subtitle: 'NMBU mot institusjonene i fakultetets sammenligninger · Kilde: DBH/HK-dir tabell 902 og 750' },
  };
  const facultyModuleBody = (fac: FacultyData, view: Exclude<FacultyView, 'landing'>): ReactNode => {
    switch (view) {
      case 'analyse': return <LandsamAdmissionAnalysis key={`${fac.id}-${facultyGroup ?? 'alle'}`} faculty={fac} initialGroup={facultyGroup} />;
      case 'emner': return <LandsamCourseAnalysis key={`${fac.id}-${facultyCourseGroup ?? 'alle'}`} faculty={fac} initialGroup={facultyCourseGroup} />;
      case 'gjennomforing': return <FacultyCompletion key={fac.id} faculty={fac} />;
      case 'studentene': return <FacultyStudents key={fac.id} faculty={fac} />;
      case 'inntekt': return <FacultyRevenue key={fac.id} faculty={fac} />;
      case 'intern': return <InternOpptak />;
      case 'studiebarometer': return <FacultyStudiebarometer key={fac.id} faculty={fac} />;
      case 'markedsstatus': return <FacultyMarketStatus key={fac.id} faculty={fac} />;
      case 'sokergrunnlag': return <Sokergrunnlag key={fac.id} steder={[...new Set(fac.admissionGroups.flatMap((g) => g.entries.map((e) => e.studiested)).filter(Boolean))]} />;
      case 'bolig': return <StudiestedBolig key={fac.id} steder={[...new Set(fac.admissionGroups.flatMap((g) => g.entries.map((e) => e.studiested)).filter(Boolean))]} />;
      case 'okonomi': return <FacultyEconomyPage key={fac.id} fac={fac} />;
      case 'fagmiljo': return <FacultyStaffPage key={fac.id} fac={fac} />;
    }
  };

  // Sider for hele NMBU
  type NmbuPage = 'nmbu-bolig' | 'nmbu-okonomi' | 'nmbu-fagmiljo' | 'nmbu-sokergrunnlag';
  const NMBU_PAGE_META: Record<NmbuPage, { title: string; subtitle: string }> = {
    'nmbu-sokergrunnlag': { title: 'Søkergrunnlaget', subtitle: 'Ungdomskullene per fylke fram mot 2045 og matematikk og gjennomføring i videregående · Kilde: SSB og Utdanningsdirektoratet' },
    'nmbu-bolig': { title: 'Bolig og studentboliger', subtitle: 'Ås mot studiestedene til institusjonene vi konkurrerer med · Kilde: NSO Studentboligundersøkelsen og SSB' },
    'nmbu-okonomi': { title: 'Økonomi og styringsindikatorer', subtitle: 'NMBU mot institusjonene vi konkurrerer med · Kilde: DBH/HK-dir tabell 902 og 750' },
    'nmbu-fagmiljo': { title: 'Fagmiljøet: tilsatte og publisering', subtitle: 'NMBU mot institusjonene vi konkurrerer med, og NMBUs fakulteter mot hverandre · Kilde: DBH/HK-dir' },
  };
  const nmbuPageBody = (page: NmbuPage): ReactNode => {
    if (page === 'nmbu-bolig') return <StudiestedBolig />;
    if (page === 'nmbu-sokergrunnlag') return <Sokergrunnlag />;
    if (page === 'nmbu-okonomi') return <NmbuEconomyPage />;
    return <NmbuStaffPage />;
  };
  const isNmbuPage = (f: Faculty | null): f is NmbuPage => f === 'nmbu-bolig' || f === 'nmbu-okonomi' || f === 'nmbu-fagmiljo' || f === 'nmbu-sokergrunnlag';
  const isFacultyId = (f: Faculty | null): f is FacultyId => f === 'hh' || f === 'landsam' || f === 'realtek' || f === 'biovit' || f === 'kbm' || f === 'mina' || f === 'vet';

  const facultyLanding = (fac: FacultyData) => (
    <LandsamLanding
      faculty={fac}
      onOpenAnalysis={(g) => { setFacultyGroup(g); setFacultyView('analyse'); }}
      onOpenCourses={(g) => { setFacultyCourseGroup(g); setFacultyView('emner'); }}
      onOpenMarketStatus={() => setFacultyView('markedsstatus')}
      onOpenStudiebarometer={() => setFacultyView('studiebarometer')}
      onOpenCompletion={() => setFacultyView('gjennomforing')}
      onOpenStudents={() => setFacultyView('studentene')}
      onOpenStaff={() => setFacultyView('fagmiljo')}
      onOpenHousing={() => setFacultyView('bolig')}
      onOpenApplicantBase={() => setFacultyView('sokergrunnlag')}
      onOpenEconomy={() => setFacultyView('okonomi')}
      onOpenRevenue={() => setFacultyView('inntekt')}
      onOpenIntern={fac.id === 'hh' ? () => setFacultyView('intern') : undefined}
      onOpenOriginalHH={fac.id === 'hh' ? () => { setFaculty('hh-figma'); setProgramLevel(null); } : undefined}
      onBackToFaculties={goHome}
    />
  );

  // ── Oppsett «oversikt» (dagens): egne sider med tilbakeknapp og smal innholdsbredde ──
  const classicPage = (opts: { title: string; subtitle: string; backLabel: string; onBack: () => void; chip?: string }, body: ReactNode) => (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={opts.onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>
            {opts.backLabel}
          </button>
          {opts.chip && (
            <span className="px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)' }}>
              {opts.chip}
            </span>
          )}
        </div>
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-9 rounded-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)' }} />
            <h1 className="text-4xl" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif", fontWeight: 500 }}>{opts.title}</h1>
          </div>
          <p className="text-sm pl-4" style={{ color: 'var(--nmbu-neutral-1)' }}>{opts.subtitle}</p>
        </header>
        {body}
      </div>
    </div>
  );

  const renderClassic = (): ReactNode => {
    if (faculty === null) {
      return <FacultyLanding onSelect={(f) => { setFaculty(f); setFacultyView('landing'); setFacultyGroup(undefined); setFacultyCourseGroup(undefined); }} />;
    }
    if (faculty === 'nmbu-emner') return <NmbuCourseExplorer onBack={goHome} />;
    if (faculty === 'nmbu-oppsett') return <LayoutLab onBack={goHome} />;
    if (isNmbuPage(faculty)) {
      const m = NMBU_PAGE_META[faculty];
      return classicPage({ ...m, backLabel: '← Fakulteter', onBack: goHome }, nmbuPageBody(faculty));
    }
    if (isFacultyId(faculty)) {
      if (facultyView === 'landing') return fakData ? facultyLanding(fakData) : <Laster tekst={`Laster ${FACULTY_META[faculty].label} …`} fullside />;
      const m = FACULTY_MODULE_META[facultyView];
      return classicPage({ ...m, backLabel: '← Tilbake', onBack: () => setFacultyView('landing'), chip: FACULTY_META[faculty].label },
        fakData ? facultyModuleBody(fakData, facultyView) : <Laster />);
    }
    return renderHH();
  };

  // ── Oppsett «dashboard» og «toppmeny»: samme moduler i full bredde inne i en fast ramme ──
  const renderShellContent = (): ReactNode => {
    if (faculty === null) return <ShellHome onNavigate={navigate} />;
    if (faculty === 'nmbu-emner') return <NmbuCourseExplorer onBack={goHome} />;
    if (faculty === 'nmbu-oppsett') return <LayoutLab onBack={goHome} />;
    if (isNmbuPage(faculty)) {
      const m = NMBU_PAGE_META[faculty];
      return <><ShellHeader title={m.title} subtitle={m.subtitle} eyebrow="Hele NMBU" />{nmbuPageBody(faculty)}</>;
    }
    if (isFacultyId(faculty)) {
      if (facultyView === 'landing') return fakData ? facultyLanding(fakData) : <Laster tekst={`Laster ${FACULTY_META[faculty].label} …`} />;
      const m = FACULTY_MODULE_META[facultyView];
      return <><ShellHeader title={m.title} subtitle={m.subtitle} eyebrow={FACULTY_META[faculty].label} />{fakData ? facultyModuleBody(fakData, facultyView) : <Laster />}</>;
    }
    return renderHH();
  };

  // ── Handelshøyskolen ──────────────────────────────────────────────────────
  // Bygget uten Handelshøyskolen (VITE_UTEN_HH=1, det åpne nettstedet): alt nedenfor er
  // død kode og fjernes av bundleren, sammen med HH-komponentene og HH-dataene.
  const renderHH = (): ReactNode => {
  if (import.meta.env.VITE_UTEN_HH === '1') return null;
  // I dashboard/toppmeny ligger siden inne i en ramme med egen navigasjon: full bredde, ingen «← Fakulteter».
  const innebygd = layout === 'dashboard' || layout === 'toppmeny';

  // Landing / program picker
  if (programLevel === null) {
    return (
      <div className={innebygd ? '' : 'min-h-screen flex flex-col items-center justify-center p-6'} style={innebygd ? undefined : { backgroundColor: 'var(--nmbu-beige-light)' }}>
        <div className={innebygd ? 'max-w-5xl w-full mx-auto' : 'max-w-3xl w-full'}>
          <div className="flex items-center gap-2 mb-6" style={innebygd ? { display: 'none' } : undefined}>
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
    <div className={innebygd ? '' : 'min-h-screen p-6'} style={innebygd ? undefined : { backgroundColor: 'var(--nmbu-beige-light)' }}>
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
            {masterViewMode === 'nmbu-emner' && (
              <PasswordGate storageKey="hh-studentdata-unlocked" title="Emner + masteroppgave (NMBU)" compact
                intro="Denne fanen viser karakterer på studentnivå (anonymiserte løpenummer) og er passordbeskyttet. Resten av nettstedet er åpent.">
                <NMBUMasterAnalysis />
              </PasswordGate>
            )}
          </>
        )}

        {/* ── OPPTAK 2026 ── */}
        {programLevel === 'opptak2026' && <AdmissionAnalysis2026 key={analysisInitialTab} initialTab={analysisInitialTab} />}

        {/* ── MARKEDSSTATUS ── */}
        {programLevel === 'markedsstatus' && <MarkedsstatusView />}

      </div>
    </div>
  );
  };

  // KI-chatten nede i hjørnet vet hvilket fakultet og hvilken side brukeren står på
  const chatFakultet: FacultyId | null = faculty && isFacultyIdAny(faculty) ? faculty : faculty === 'hh-figma' ? 'hh' : null;
  const chatSted = faculty === null ? 'forsiden (alle fakulteter)'
    : isFacultyIdAny(faculty) ? `${FACULTY_META[faculty].label} · ${facultyView === 'landing' ? 'oversikt' : FACULTY_MODULE_META[facultyView].title}`
    : faculty === 'hh-figma' ? 'Handelshøyskolen · opprinnelig HH-analyse'
    : isNmbuPage(faculty) ? `Hele NMBU · ${NMBU_PAGE_META[faculty].title}` : faculty === 'nmbu-emner' ? 'Hele NMBU · Alle emner' : 'Hele NMBU';
  const chat = <KiChatKnapp fakultet={chatFakultet} visning={facultyView} sted={chatSted} naviger={(f, v, g) => navigate(f, v as FacultyView, g)} gruppe={facultyView === 'analyse' ? facultyGroup : facultyView === 'emner' ? facultyCourseGroup : undefined} />;

  if (layout === 'dashboard') {
    return <><DashboardShell faculty={faculty} view={facultyView} onNavigate={navigate}><Suspense fallback={<Laster />}>{renderShellContent()}</Suspense></DashboardShell>{chat}</>;
  }
  if (layout === 'toppmeny') {
    return <><TopbarShell faculty={faculty} view={facultyView} onNavigate={navigate}><Suspense fallback={<Laster />}>{renderShellContent()}</Suspense></TopbarShell>{chat}</>;
  }
  return <><Suspense fallback={<Laster fullside />}>{renderClassic()}</Suspense>{chat}</>;
}

const FAKULTET_IDER = new Set<string>(['hh', 'landsam', 'realtek', 'biovit', 'kbm', 'mina', 'vet']);
function isFacultyIdAny(f: string): f is FacultyId { return FAKULTET_IDER.has(f); }

/** Vises mens en side eller fakultetsdataene lastes. */
function Laster({ tekst = 'Laster …', fullside }: { tekst?: string; fullside?: boolean }) {
  return (
    <div className={fullside ? 'min-h-screen p-8' : 'py-16'} style={{ backgroundColor: fullside ? 'var(--nmbu-beige-light)' : undefined }}>
      <div className="flex items-center justify-center gap-3 text-sm" style={{ color: 'var(--nmbu-neutral-2)' }}>
        <span className="inline-block w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid var(--nmbu-green-3)', borderTopColor: 'var(--nmbu-green-dark)' }} />
        {tekst}
      </div>
    </div>
  );
}
