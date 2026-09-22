// Poenggrenser fra Samordna Opptak, hentet via Tableau-API
// Kilde: rapport-dv.educloud.no / SO-datavarehus
// 0 = ingen nedre grense (alle kvalifiserte kom inn)
// null = ikke tilgjengelig / privat institusjon

// Søkertall 2026 fra sokertallrapport.samordnaopptak.no

export interface AdmissionYear {
  firstTimers: number | null; // førstegangsvitnemål
  ordinary: number | null;    // ordinær kvote
}

export interface Applicants2026 {
  total: number;        // alle søkere
  firstChoice: number;  // førstevalgssøkere
  spots: number;        // studieplasser
}

export interface CampusApplicants {
  name: string;
  studyCode: string;
  total: number | null;
  firstChoice: number | null;
  spots: number | null;
}

export interface AdmissionProgram {
  universityId: string;
  studyCode: string;
  programName: string;
  years: Record<string, AdmissionYear>;
  applicants2026?: Applicants2026;
  stipulatedOrdinary?: number;
  stipulatedSokerpress?: number;
  campuses?: CampusApplicants[];
  note?: string;
}

export const ADMISSION_DATA: AdmissionProgram[] = [
  {
    universityId: 'hio',
    studyCode: '224 035',
    programName: 'Økonomi og administrasjon',
    years: {
      '2023': { firstTimers: 36.8, ordinary: 37.7 },
      '2024': { firstTimers: 0,    ordinary: 0    },
      '2025': { firstTimers: 0,    ordinary: 0    },
      '2026': { firstTimers: 0,    ordinary: 0    },
    },
    applicants2026: { total: 755, firstChoice: 159, spots: 90 },
  },
  {
    universityId: 'nmbu',
    studyCode: '192 369',
    programName: 'Økonomi og administrasjon',
    years: {
      '2023': { firstTimers: 46.3, ordinary: 47.7 },
      '2024': { firstTimers: 45.8, ordinary: 48.6 },
      '2025': { firstTimers: 46.2, ordinary: 49.5 },
      '2026': { firstTimers: 47.5, ordinary: 50.4 },
    },
    applicants2026: { total: 1663, firstChoice: 296, spots: 95 },
  },
  {
    universityId: 'uia',
    studyCode: '201 369',
    programName: 'Økonomi og administrasjon',
    years: {
      '2023': { firstTimers: 47.4, ordinary: 49.0 },
      '2024': { firstTimers: 47.8, ordinary: 50.0 },
      '2025': { firstTimers: 48.4, ordinary: 50.0 },
      '2026': { firstTimers: 48.8, ordinary: 50.9 },
    },
    applicants2026: { total: 2603, firstChoice: 507, spots: 150 },
  },
  {
    universityId: 'usn',
    studyCode: '222 330 / 222 097 / 222 164 / 222 625',
    programName: 'Økonomi og administrasjon (Drammen, Hønefoss, Bø, Kongsberg)',
    years: {
      '2023': { firstTimers: 41.4, ordinary: 45.5 },
      '2024': { firstTimers: 40.1, ordinary: 44.5 },
      '2025': { firstTimers: 40.2, ordinary: 43.7 },
      '2026': { firstTimers: 40.8, ordinary: 46.0 },
    },
    applicants2026: { total: 535, firstChoice: 71, spots: 65 },
    stipulatedSokerpress: 3.8,
    campuses: [
      { name: 'Hønefoss',  studyCode: '222 097', total: 167,  firstChoice: 20,   spots: 20 },
      { name: 'Bø',        studyCode: '222 164', total: 144,  firstChoice: 29,   spots: 20 },
      { name: 'Drammen',   studyCode: '222 330', total: null, firstChoice: null, spots: null },
      { name: 'Kongsberg', studyCode: '222 625', total: 224,  firstChoice: 22,   spots: 25 },
    ],
    note: 'Poenggrenser gjelder Drammen (222330). Øvrige campuser er alle inn. Søkerpress stipulert til 3,8 som institusjonssnitt. Søkertall Drammen ikke tilgjengelig.',
  },
  {
    universityId: 'nhh',
    studyCode: '191 345',
    programName: 'Økonomi og administrasjon – siviløkonom',
    years: {
      '2023': { firstTimers: 55.6, ordinary: 59.5 },
      '2024': { firstTimers: 55.2, ordinary: 59.6 },
      '2025': { firstTimers: 55.3, ordinary: 59.9 },
      '2026': { firstTimers: 54.8, ordinary: 59.9 },
    },
    applicants2026: { total: 4749, firstChoice: 1899, spots: 425 },
  },
  {
    universityId: 'bi',
    studyCode: '–',
    programName: 'Privat institusjon',
    years: {
      '2023': { firstTimers: null, ordinary: null },
      '2024': { firstTimers: null, ordinary: null },
      '2025': { firstTimers: null, ordinary: null },
      '2026': { firstTimers: null, ordinary: null },
    },
    note: 'BI Handelshøyskolen bruker eget opptakssystem og er ikke i Samordna Opptak',
  },
  {
    universityId: 'kristiania',
    studyCode: '–',
    programName: 'Privat institusjon',
    years: {
      '2023': { firstTimers: null, ordinary: null },
      '2024': { firstTimers: null, ordinary: null },
      '2025': { firstTimers: null, ordinary: null },
      '2026': { firstTimers: null, ordinary: null },
    },
    note: 'Kristiania bruker eget opptakssystem og er ikke i Samordna Opptak',
  },
  {
    universityId: 'oslomet',
    studyCode: '215 369',
    programName: 'Økonomi og administrasjon',
    years: {
      '2023': { firstTimers: 48.6, ordinary: 52.8 },
      '2024': { firstTimers: 48.3, ordinary: 52.2 },
      '2025': { firstTimers: 47.6, ordinary: 52.7 },
      '2026': { firstTimers: 47.8, ordinary: 52.8 },
    },
    applicants2026: { total: 5357, firstChoice: 1205, spots: 280 },
  },
  {
    universityId: 'ntnu',
    studyCode: '194 035',
    programName: 'Økonomi og administrasjon (Trondheim)',
    years: {
      '2023': { firstTimers: 52.2, ordinary: 56.1 },
      '2024': { firstTimers: 52.3, ordinary: 57.0 },
      '2025': { firstTimers: 53.0, ordinary: 58.2 },
      '2026': { firstTimers: 52.7, ordinary: 58.2 },
    },
    applicants2026: { total: 4656, firstChoice: 1161, spots: 181 },
    note: 'Siviløkonom (194 345): 2023 53.6/59.1 · 2024 53.9/60.4 · 2025 54.3/61.3 · 2026 54.0/60.5',
  },
  {
    universityId: 'uit',
    studyCode: '186 369',
    programName: 'Økonomi og administrasjon (Tromsø)',
    years: {
      '2023': { firstTimers: 42.3, ordinary: 42.7 },
      '2024': { firstTimers: 38.5, ordinary: 38.5 },
      '2025': { firstTimers: 39.1, ordinary: 36.0 },
      '2026': { firstTimers: 40.3, ordinary: 38.6 },
    },
    applicants2026: { total: 1120, firstChoice: 186, spots: 140 },
  },
  {
    universityId: 'uis',
    studyCode: '217 369',
    programName: 'Økonomi og administrasjon',
    years: {
      '2023': { firstTimers: 46.1, ordinary: 48.0 },
      '2024': { firstTimers: 45.0, ordinary: 46.1 },
      '2025': { firstTimers: 44.9, ordinary: 46.3 },
      '2026': { firstTimers: 46.3, ordinary: 48.0 },
    },
    applicants2026: { total: 3178, firstChoice: 674, spots: 140 },
  },
  {
    universityId: 'nla',
    studyCode: '254 470',
    programName: 'Økonomi og administrasjon',
    years: {
      '2023': { firstTimers: 42.1, ordinary: 42.1 },
      '2024': { firstTimers: 40.7, ordinary: 41.2 },
      '2025': { firstTimers: 39.5, ordinary: 39.5 },
      '2026': { firstTimers: 38.9, ordinary: 40.4 },
    },
    applicants2026: { total: 1737, firstChoice: 160, spots: 70 },
    note: 'NLA har campus i Bergen, Kristiansand og Oslo. Opptak samlet for alle campus.',
  },
  {
    universityId: 'inn',
    studyCode: '209 035',
    programName: 'Økonomi og administrasjon, Lillehammer',
    years: {
      '2023': { firstTimers: 40.5, ordinary: 40.3 },
      '2024': { firstTimers: 41.9, ordinary: 42.4 },
      '2025': { firstTimers: 41.9, ordinary: 41.8 },
      '2026': { firstTimers: 43.3, ordinary: 44.6 },
    },
    applicants2026: { total: 992, firstChoice: 137, spots: 80 },
  },
  {
    universityId: 'onh',
    studyCode: '–',
    programName: 'Privat institusjon',
    years: {
      '2023': { firstTimers: null, ordinary: null },
      '2024': { firstTimers: null, ordinary: null },
      '2025': { firstTimers: null, ordinary: null },
      '2026': { firstTimers: null, ordinary: null },
    },
    stipulatedOrdinary: 35.0,
    note: 'Oslo nye høyskole bruker eget opptakssystem. Stipulert opptaksscore 35,0 brukes i regresjonsanalysen.',
  },
  {
    universityId: 'nord',
    studyCode: '204 342',
    programName: 'Økonomi og administrasjon, Bodø',
    years: {
      '2023': { firstTimers: 33.7, ordinary: 41.3 },
      '2024': { firstTimers: 0,    ordinary: 0    },
      '2025': { firstTimers: 0,    ordinary: 0    },
      '2026': { firstTimers: 0,    ordinary: 0    },
    },
    applicants2026: { total: 449, firstChoice: 76, spots: 60 },
    note: 'Søkertall 2026 gjelder Bodø (204342). Alle kvalifiserte kom inn 2024–2026.',
  },
  {
    universityId: 'hvl',
    studyCode: '203 369 / 203 404 / 203 515',
    programName: 'Økonomi og administrasjon (Bergen, Haugesund, Sogndal)',
    years: {
      '2023': { firstTimers: 51.0, ordinary: 54.4 },
      '2024': { firstTimers: 50.9, ordinary: 54.3 },
      '2025': { firstTimers: 51.7, ordinary: 55.8 },
      '2026': { firstTimers: 51.3, ordinary: 55.8 },
    },
    applicants2026: { total: 4729, firstChoice: 967, spots: 254 },
    stipulatedSokerpress: 4.3,
    campuses: [
      { name: 'Bergen',    studyCode: '203 369', total: 3629, firstChoice: 789, spots: 114 },
      { name: 'Haugesund', studyCode: '203 404', total:  613, firstChoice: 112, spots:  80 },
      { name: 'Sogndal',   studyCode: '203 515', total:  487, firstChoice:  66, spots:  60 },
    ],
    note: 'Poenggrenser gjelder Bergen (203369). Haugesund og Sogndal er alle inn. Søkerpress stipulert til 4,3 som institusjonssnitt.',
  },
  {
    universityId: 'himolde',
    studyCode: '211 369',
    programName: 'Økonomi og administrasjon',
    years: {
      '2023': { firstTimers: 0, ordinary: 0 },
      '2024': { firstTimers: 0, ordinary: 0 },
      '2025': { firstTimers: 0, ordinary: 0 },
      '2026': { firstTimers: 0, ordinary: 0 },
    },
    applicants2026: { total: 470, firstChoice: 79, spots: 60 },
    note: 'Åpent opptak. Søkertall 2026 fra Samordna Opptak (211369 Molde).',
  },
  {
    universityId: 'ntnu_gjovik',
    studyCode: '194 591',
    programName: 'Økonomi og ledelse, Gjøvik',
    years: {
      '2023': { firstTimers: null, ordinary: null },
      '2024': { firstTimers: null, ordinary: null },
      '2025': { firstTimers: 42.1, ordinary: 41.8 },
      '2026': { firstTimers: 42.2, ordinary: 41.5 },
    },
    applicants2026: { total: 802, firstChoice: 77, spots: 55 },
    note: 'Poenggrenser for 2023–2024 ikke tilgjengelig i SO-data. 2025–2026 fra CSV_OPPTAKSGRENSER.',
  },
  {
    universityId: 'ntnu_alesund',
    studyCode: '194 515',
    programName: 'Økonomi, administrasjon og internasjonal business, Ålesund',
    years: {
      '2023': { firstTimers: null, ordinary: null },
      '2024': { firstTimers: null, ordinary: null },
      '2025': { firstTimers: 46.5, ordinary: 49.1 },
      '2026': { firstTimers: 47.3, ordinary: 50.0 },
    },
    applicants2026: { total: 1713, firstChoice: 241, spots: 70 },
    note: 'Poenggrenser for 2023–2024 ikke tilgjengelig i SO-data. 2025–2026 fra CSV_OPPTAKSGRENSER.',
  },
  {
    universityId: 'inn_rena',
    studyCode: '209 369',
    programName: 'Økonomi og administrasjon, Rena',
    years: {
      '2023': { firstTimers: 0, ordinary: 0 },
      '2024': { firstTimers: 0, ordinary: 0 },
      '2025': { firstTimers: 0, ordinary: 0 },
      '2026': { firstTimers: 0, ordinary: 0 },
    },
    applicants2026: { total: 236, firstChoice: 27, spots: 40 },
    note: 'Åpent opptak alle år – alle kvalifiserte kom inn.',
  },
];

export const ADMISSION_YEARS = ['2023', '2024', '2025', '2026'];
