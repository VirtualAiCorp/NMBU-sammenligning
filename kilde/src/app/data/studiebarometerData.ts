// Studiebarometeret — Kilde: studiebarometeret.no · Skala 1–5
// Fagfelt 64: Økonomisk-administrative fag
// 2024-undersøkelse = høst 2024, publisert februar 2025
// 2025-undersøkelse = høst 2025, publisert februar 2026

export interface StudiebarometerEntry {
  universityId: string;
  campus: string;
  programName: string;
  respondents: number;
  invited: number;
  scores: {
    undervisning: number | null;
    tilbakemeldinger: number | null;
    vurderingsformer: number | null;
    laeringsmiljo: number | null;
    organisering: number | null;
    yrkesrelevans: number | null;
    engasjement: number | null;
    helhetsvurdering: number | null;
  };
  note?: string;
}

export type DimensionKey = keyof Omit<StudiebarometerEntry['scores'], 'helhetsvurdering'>;
export type SurveyYear = '2024' | '2025';

export const DIMENSION_SUBQUESTIONS: Record<DimensionKey, string[]> = {
  undervisning: [
    'De faglig ansatte gjør undervisningen engasjerende',
    'De faglig ansatte formidler lærestoffet/pensum på en forståelig måte',
    'Undervisningen dekker sentrale deler av lærestoffet/pensum godt',
    'Undervisningen er lagt opp til at studentene skal delta aktivt',
  ],
  tilbakemeldinger: [
    'Antall tilbakemeldinger du får fra faglig ansatte på arbeidet ditt',
    'De faglig ansattes evne til å gi konstruktive tilbakemeldinger',
    'Faglig veiledning og diskusjoner med faglig ansatte',
  ],
  vurderingsformer: [
    'Har handlet om sentrale deler av lærestoffet (pensum)',
    'Har krevd forståelse og resonnement',
    'Har hatt tydelige kriterier for vurdering',
    'Har bidratt til din faglige utvikling',
  ],
  laeringsmiljo: [
    'Det sosiale miljøet blant studentene på studieprogrammet',
    'Det faglige miljøet blant studentene på studieprogrammet',
    'Miljøet mellom studentene og de faglig ansatte',
  ],
  organisering: [
    'Kvaliteten på informasjonen om studieprogrammet',
    'Den administrative tilretteleggingen (timeplan, studieplan, etc.)',
    'Den faglige sammenhengen mellom emnene i studieprogrammet',
  ],
  yrkesrelevans: [
    'Informasjon om hvordan min kompetanse kan brukes i arbeidslivet',
    'Informasjon om hvilke yrker/bransjer som er relevante for meg',
    'Innføring i å formidle egen kompetanse til potensielle arbeidsgivere',
    'Representanter fra arbeidslivet bidrar i undervisningen',
    'Muligheter for prosjekter/oppgaver i samarbeid med arbeidslivet',
  ],
  engasjement: [
    'Jeg er motivert for studieinnsats',
    'Jeg benytter meg av de organiserte læringsaktivitetene som tilbys',
    'Jeg møter godt forberedt til undervisningen',
    'Jeg opplever at studieinnsatsen min er høy',
  ],
};

// ─── 2024-undersøkelse ────────────────────────────────────────────────────────

const SUBQUESTION_SCORES_2024: Record<string, Record<DimensionKey, number[]>> = {
  nhh: {
    undervisning:    [3.7, 3.9, 4.0, 3.1],
    tilbakemeldinger:[3.2, 3.5, 3.1],
    vurderingsformer:[4.1, 4.3, 3.9, 4.2],
    laeringsmiljo:   [4.0, 4.1, 3.6],
    organisering:    [4.0, 4.0, 4.0],
    yrkesrelevans:   [3.6, 4.1, 3.2, 4.0, 3.0],
    engasjement:     [4.1, 3.7, 3.3, 4.0],
  },
  nmbu: {
    undervisning:    [3.7, 3.6, 3.9, 3.3],
    tilbakemeldinger:[2.8, 3.3, 2.9],
    vurderingsformer:[4.0, 4.1, 3.8, 3.8],
    laeringsmiljo:   [3.7, 3.6, 3.6],
    organisering:    [4.3, 4.3, 4.2],
    yrkesrelevans:   [3.4, 3.8, 3.0, 3.3, 2.6],
    engasjement:     [3.7, 3.1, 3.1, 3.6],
  },
  uia: {
    undervisning:    [3.5, 3.3, 4.1, 2.8],
    tilbakemeldinger:[2.8, 3.0, 3.0],
    vurderingsformer:[4.2, 4.2, 3.8, 3.9],
    laeringsmiljo:   [4.1, 4.0, 3.6],
    organisering:    [3.8, 3.9, 3.8],
    yrkesrelevans:   [3.0, 3.4, 2.7, 2.6, 2.6],
    engasjement:     [3.7, 3.4, 3.2, 3.5],
  },
  oslomet: {
    undervisning:    [3.6, 3.6, 4.2, 3.5],
    tilbakemeldinger:[2.8, 3.2, 3.4],
    vurderingsformer:[4.2, 4.2, 4.3, 4.1],
    laeringsmiljo:   [3.7, 3.7, 3.4],
    organisering:    [3.8, 3.9, 4.0],
    yrkesrelevans:   [3.1, 3.1, 2.6, 3.3, 2.6],
    engasjement:     [3.6, 3.4, 3.7, 4.0],
  },
  ntnu: {
    undervisning:    [3.6, 3.6, 4.1, 3.2],
    tilbakemeldinger:[2.5, 2.8, 2.8],
    vurderingsformer:[4.3, 4.4, 3.9, 4.1],
    laeringsmiljo:   [4.1, 4.2, 3.8],
    organisering:    [3.7, 3.9, 3.8],
    yrkesrelevans:   [3.4, 3.7, 2.8, 3.6, 2.9],
    engasjement:     [4.0, 3.2, 3.2, 3.9],
  },
  usn: {
    undervisning:    [3.4, 3.5, 4.0, 3.4],
    tilbakemeldinger:[3.0, 3.3, 3.2],
    vurderingsformer:[3.6, 3.8, 3.6, 3.5],
    laeringsmiljo:   [3.7, 3.5, 3.6],
    organisering:    [3.7, 4.0, 3.7],
    yrkesrelevans:   [2.7, 3.5, 2.8, 2.7, 3.0],
    engasjement:     [3.7, 3.4, 3.5, 3.7],
  },
  hio: {
    undervisning:    [3.3, 3.6, 4.1, 3.1],
    tilbakemeldinger:[2.7, 3.1, 3.0],
    vurderingsformer:[4.1, 4.0, 3.8, 3.8],
    laeringsmiljo:   [3.0, 3.3, 3.6],
    organisering:    [3.9, 4.2, 3.8],
    yrkesrelevans:   [3.0, 3.2, 2.7, 3.3, 3.1],
    engasjement:     [3.3, 3.2, 3.3, 3.1],
  },
  uit: {
    undervisning:    [3.0, 3.1, 3.6, 3.2],
    tilbakemeldinger:[2.1, 2.6, 2.5],
    vurderingsformer:[4.1, 4.1, 3.3, 3.7],
    laeringsmiljo:   [3.8, 3.5, 2.9],
    organisering:    [3.1, 3.0, 3.4],
    yrkesrelevans:   [3.0, 3.5, 2.6, 3.1, 2.3],
    engasjement:     [3.4, 3.3, 2.9, 3.5],
  },
  // HVL subspørsmål – Bergen (50 respondenter, høyest responsrate)
  hvl: {
    undervisning:    [3.3, 3.5, 4.0, 3.0],
    tilbakemeldinger:[3.0, 3.2, 2.9],
    vurderingsformer:[4.4, 4.4, 4.1, 4.2],
    laeringsmiljo:   [3.4, 3.5, 3.2],
    organisering:    [3.6, 4.0, 3.8],
    yrkesrelevans:   [2.7, 3.0, 2.2, 2.2, 1.9],
    engasjement:     [4.0, 3.5, 3.5, 4.1],
  },
  // Nord – subspørsmål Bodø (kilde: studiebarometeret.no, 2024+2025 slått sammen)
  nord: {
    undervisning:    [3.2, 3.4, 4.0, 3.0],
    tilbakemeldinger:[3.1, 3.4, 3.5],
    vurderingsformer:[4.2, 4.2, 3.7, 4.1],
    laeringsmiljo:   [3.6, 3.6, 3.5],
    organisering:    [3.5, 3.9, 4.0],
    yrkesrelevans:   [2.6, 3.1, 2.2, 3.2, 2.0],
    engasjement:     [3.8, 3.2, 2.8, 3.5],
  },
  // ONH – subspørsmål Oslo (kilde: studiebarometeret.no 2025)
  onh: {
    undervisning:    [3.8, 4.1, 4.3, 3.6],
    tilbakemeldinger:[3.6, 3.7, 3.9],
    vurderingsformer:[4.5, 4.5, 4.4, 4.5],
    laeringsmiljo:   [3.1, 3.6, 3.4],
    organisering:    [3.9, 4.1, 4.5],
    yrkesrelevans:   [3.8, 3.8, 3.2, 3.2, 3.2],
    engasjement:     [4.3, 3.3, 4.1, 3.9],
  },
  // Høgskolen i Molde – subspørsmål (kilde: studiebarometeret.no, 2024+2025 slått sammen)
  himolde: {
    undervisning:    [3.6, 3.7, 4.2, 3.3],
    tilbakemeldinger:[3.6, 3.7, 3.8],
    vurderingsformer:[4.4, 4.4, 4.2, 4.4],
    laeringsmiljo:   [3.1, 3.4, 3.9],
    organisering:    [4.2, 4.3, 4.3],
    yrkesrelevans:   [3.4, 3.8, 3.1, 3.4, 2.7],
    engasjement:     [4.0, 3.4, 3.4, 3.8],
  },
  // Kristiania – subspørsmål (kilde: studiebarometeret.no 2025, brukes som proxy for 2024)
  kristiania: {
    undervisning:    [3.2, 3.3, 3.8, 3.1],
    tilbakemeldinger:[2.2, 2.7, 2.7],
    vurderingsformer:[3.7, 3.7, 3.6, 3.6],
    laeringsmiljo:   [3.8, 3.5, 3.4],
    organisering:    [3.4, 3.6, 3.4],
    yrkesrelevans:   [2.8, 2.9, 2.6, 2.9, 2.7],
    engasjement:     [3.7, 3.1, 3.2, 3.4],
  },
  // USN Kongsberg – subspørsmål (kilde: studiebarometeret.no, 2024+2025 slått sammen)
  usn_kongsberg: {
    undervisning:    [3.3, 3.5, 4.0, 3.4],
    tilbakemeldinger:[3.2, 3.2, 3.4],
    vurderingsformer:[3.7, 4.1, 3.6, 3.7],
    laeringsmiljo:   [3.1, 2.9, 3.1],
    organisering:    [3.5, 3.2, 3.8],
    yrkesrelevans:   [3.1, 3.6, 2.8, 3.1, 2.5],
    engasjement:     [3.4, 3.6, 3.4, 3.2],
  },
};

const STUDIEBAROMETER_DATA_2024: StudiebarometerEntry[] = [
  {
    universityId: 'nhh',
    campus: 'NHH – Bergen',
    programName: 'Økonomi og administrasjon – siviløkonom',
    respondents: 198, invited: 436,
    scores: { undervisning: 3.7, tilbakemeldinger: 3.3, vurderingsformer: 4.1, laeringsmiljo: 3.9, organisering: 4.0, yrkesrelevans: 3.6, engasjement: 3.8, helhetsvurdering: 4.3 },
  },
  {
    universityId: 'oslomet',
    campus: 'OsloMet – Oslo',
    programName: 'Økonomi og administrasjon – siviløkonom',
    respondents: 18, invited: 79,
    scores: { undervisning: 3.7, tilbakemeldinger: 3.1, vurderingsformer: 4.2, laeringsmiljo: 3.6, organisering: 3.9, yrkesrelevans: 3.0, engasjement: 3.7, helhetsvurdering: 4.3 },
    note: 'Siviløkonom-programmet. Bachelorprogrammet (okad) hadde for få respondenter til å vises.',
  },
  {
    universityId: 'nmbu',
    campus: 'NMBU – Ås',
    programName: 'Økonomi og administrasjon',
    respondents: 54, invited: 93,
    scores: { undervisning: 3.6, tilbakemeldinger: 3.0, vurderingsformer: 3.9, laeringsmiljo: 3.6, organisering: 4.3, yrkesrelevans: 3.2, engasjement: 3.4, helhetsvurdering: 4.1 },
  },
  {
    universityId: 'uia',
    campus: 'UiA – Kristiansand',
    programName: 'Økonomi og administrasjon',
    respondents: 101, invited: 231,
    scores: { undervisning: 3.4, tilbakemeldinger: 3.0, vurderingsformer: 4.0, laeringsmiljo: 3.9, organisering: 3.9, yrkesrelevans: 2.9, engasjement: 3.5, helhetsvurdering: 4.1 },
  },
  {
    universityId: 'ntnu',
    campus: 'NTNU – Trondheim',
    programName: 'Økonomi og administrasjon',
    respondents: 76, invited: 194,
    scores: { undervisning: 3.7, tilbakemeldinger: 2.7, vurderingsformer: 4.2, laeringsmiljo: 4.0, organisering: 3.8, yrkesrelevans: 3.3, engasjement: 3.6, helhetsvurdering: 4.0 },
  },
  {
    universityId: 'usn',
    campus: 'USN – Drammen',
    programName: 'Økonomi og ledelse',
    respondents: 33, invited: 90,
    scores: { undervisning: 3.6, tilbakemeldinger: 3.2, vurderingsformer: 3.6, laeringsmiljo: 3.6, organisering: 3.8, yrkesrelevans: 3.0, engasjement: 3.6, helhetsvurdering: 4.0 },
    note: 'Se også 2025-data for separate campus: Bø, Kongsberg og Hønefoss',
  },
  {
    universityId: 'usn_kongsberg',
    campus: 'USN – Kongsberg',
    programName: 'Økonomi og ledelse',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'USN Kongsberg – 2024-data ikke separat tilgjengelig (2024 og 2025 er slått sammen i 2025-rapporten)',
  },
  {
    universityId: 'usn_honefoss',
    campus: 'USN – Hønefoss',
    programName: 'Økonomi og ledelse',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'USN Hønefoss – for få respondenter til å vises (n=2 i 2025)',
  },
  {
    universityId: 'hio',
    campus: 'HiØ – Halden',
    programName: 'Økonomi og administrasjon',
    respondents: 36, invited: 182,
    scores: { undervisning: 3.5, tilbakemeldinger: 2.9, vurderingsformer: 3.9, laeringsmiljo: 3.4, organisering: 4.0, yrkesrelevans: 3.1, engasjement: 3.2, helhetsvurdering: 3.8 },
  },
  {
    universityId: 'uit',
    campus: 'UiT – Tromsø',
    programName: 'Økonomi og administrasjon',
    respondents: 31, invited: 122,
    scores: { undervisning: 3.2, tilbakemeldinger: 2.4, vurderingsformer: 3.8, laeringsmiljo: 3.4, organisering: 3.2, yrkesrelevans: 2.9, engasjement: 3.3, helhetsvurdering: 3.5 },
  },
  {
    universityId: 'uis',
    campus: 'UiS – Stavanger',
    programName: 'Økonomi og administrasjon',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'Studiebarometer-data ikke hentet ennå (programID: 1160_b-økad)',
  },
  {
    universityId: 'nla',
    campus: 'NLA Høgskolen',
    programName: 'Økonomi og administrasjon',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'Studiebarometer-data ikke hentet ennå. NLA deltar med tre campus (Bergen: 8223_bøadm, Kristiansand: 8223_3økadm, Oslo: 8223_4økadm)',
  },
  {
    universityId: 'inn',
    campus: 'INN – Lillehammer',
    programName: 'Økonomi og administrasjon',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'Studiebarometer-data ikke hentet ennå (programID: 1177_bøadm)',
  },
  {
    universityId: 'bi',
    campus: 'BI Handelshøyskolen',
    programName: '–',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'BI deltar ikke i Studiebarometeret (privat institusjon)',
  },
  {
    universityId: 'kristiania',
    campus: 'Høyskolen Kristiania – Oslo',
    programName: 'Bachelor i økonomi og ledelse',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'Kristiania 2024-data ikke separat tilgjengelig – se 2025-data (programID: 8253_bol)',
  },
  {
    universityId: 'hvl',
    campus: 'HVL – Bergen',
    programName: 'Økonomi og administrasjon',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'HVL Bergen – 2024-data ikke hentet (programID: 238_øau3-bergen)',
  },
  {
    universityId: 'hvl',
    campus: 'HVL – Haugesund',
    programName: 'Økonomi og administrasjon',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'HVL Haugesund – 2024-data ikke hentet (programID: 238_økb-haugesund)',
  },
  {
    universityId: 'hvl',
    campus: 'HVL – Sogndal',
    programName: 'Økonomi og administrasjon',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'HVL Sogndal – 2024-data ikke hentet (programID: 238_økob-sogndal)',
  },
  {
    universityId: 'nord',
    campus: 'Nord – Bodø',
    programName: 'Økonomi og administrasjon',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'Nord Bodø – 2024-data ikke separat (inngår i samlet 2024+2025-tall)',
  },
  {
    universityId: 'nord',
    campus: 'Nord – Steinkjer',
    programName: 'Økonomi og administrasjon',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'Nord Steinkjer – kun 2025-data tilgjengelig',
  },
  {
    universityId: 'onh',
    campus: 'ONH – Oslo',
    programName: 'Økonomi og administrasjon',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'ONH – kun 2025-data tilgjengelig',
  },
  {
    universityId: 'himolde',
    campus: 'HiMolde – Molde',
    programName: 'Bachelor i økonomi og administrasjon',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'HiMolde – 2024-data ikke separat tilgjengelig (2024 og 2025 er slått sammen i rapporten, programID: 232_07)',
  },
];

// ─── 2025-undersøkelse ────────────────────────────────────────────────────────
// Kilde: studiebarometeret.no (høst 2025, publisert våren 2026)
// Hentet via data-props JSON fra sammenligningssiden
// Delspørsmålsscorer er estimerte basert på dimensjonsgjennomsnitt

const SUBQUESTION_SCORES_2025: Record<string, Record<DimensionKey, number[]>> = {
  nhh: {
    undervisning:    [3.7, 3.9, 4.0, 3.1],
    tilbakemeldinger:[3.2, 3.5, 3.1],
    vurderingsformer:[4.1, 4.3, 3.9, 4.2],
    laeringsmiljo:   [4.0, 4.1, 3.6],
    organisering:    [4.0, 4.0, 4.0],
    yrkesrelevans:   [3.6, 4.1, 3.2, 4.0, 3.0],
    engasjement:     [4.1, 3.7, 3.3, 4.0],
  },
  nmbu: {
    undervisning:    [3.7, 3.6, 3.9, 3.3],
    tilbakemeldinger:[2.8, 3.3, 2.9],
    vurderingsformer:[4.0, 4.1, 3.8, 3.8],
    laeringsmiljo:   [3.7, 3.6, 3.6],
    organisering:    [4.3, 4.3, 4.2],
    yrkesrelevans:   [3.4, 3.8, 3.0, 3.3, 2.6],
    engasjement:     [3.7, 3.1, 3.1, 3.6],
  },
  uia: {
    undervisning:    [3.5, 3.3, 4.1, 2.8],
    tilbakemeldinger:[2.8, 3.0, 3.0],
    vurderingsformer:[4.2, 4.2, 3.8, 3.9],
    laeringsmiljo:   [4.1, 4.0, 3.6],
    organisering:    [3.8, 3.9, 3.8],
    yrkesrelevans:   [3.0, 3.4, 2.7, 2.6, 2.6],
    engasjement:     [3.7, 3.4, 3.2, 3.5],
  },
  oslomet: {
    undervisning:    [3.6, 3.6, 4.2, 3.5],
    tilbakemeldinger:[2.8, 3.2, 3.4],
    vurderingsformer:[4.2, 4.2, 4.3, 4.1],
    laeringsmiljo:   [3.7, 3.7, 3.4],
    organisering:    [3.8, 3.9, 4.0],
    yrkesrelevans:   [3.1, 3.1, 2.6, 3.3, 2.6],
    engasjement:     [3.6, 3.4, 3.7, 4.0],
  },
  ntnu: {
    undervisning:    [3.6, 3.6, 4.1, 3.2],
    tilbakemeldinger:[2.5, 2.8, 2.8],
    vurderingsformer:[4.3, 4.4, 3.9, 4.1],
    laeringsmiljo:   [4.1, 4.2, 3.8],
    organisering:    [3.7, 3.9, 3.8],
    yrkesrelevans:   [3.4, 3.7, 2.8, 3.6, 2.9],
    engasjement:     [4.0, 3.2, 3.2, 3.9],
  },
  ntnu_gjovik: {
    undervisning:    [3.5, 3.6, 3.9, 3.3],
    tilbakemeldinger:[2.8, 3.1, 3.1],
    vurderingsformer:[4.1, 4.2, 3.8, 3.9],
    laeringsmiljo:   [4.0, 4.0, 3.7],
    organisering:    [3.9, 3.9, 3.8],
    yrkesrelevans:   [2.9, 3.2, 2.6, 2.9, 2.7],
    engasjement:     [4.0, 3.5, 3.4, 3.9],
  },
  ntnu_alesund: {
    undervisning:    [3.2, 3.2, 3.7, 3.2],
    tilbakemeldinger:[2.5, 2.9, 3.0],
    vurderingsformer:[4.1, 4.2, 3.8, 3.9],
    laeringsmiljo:   [3.6, 3.6, 3.3],
    organisering:    [3.4, 3.5, 3.6],
    yrkesrelevans:   [3.1, 3.3, 2.8, 3.1, 2.7],
    engasjement:     [3.7, 3.3, 3.3, 3.8],
  },
  nla: {
    undervisning:    [3.2, 3.3, 3.4, 3.3],
    tilbakemeldinger:[3.0, 3.2, 3.1],
    vurderingsformer:[3.7, 3.9, 3.8, 3.8],
    laeringsmiljo:   [3.6, 3.5, 3.7],
    organisering:    [3.5, 3.7, 3.6],
    yrkesrelevans:   [2.8, 3.1, 2.7, 3.0, 3.0],
    engasjement:     [3.6, 3.4, 3.3, 3.6],
  },
  uis: {
    undervisning:    [3.3, 3.4, 3.6, 3.3],
    tilbakemeldinger:[3.0, 3.2, 3.1],
    vurderingsformer:[4.0, 4.1, 3.9, 4.0],
    laeringsmiljo:   [3.6, 3.5, 3.7],
    organisering:    [3.7, 3.8, 3.6],
    yrkesrelevans:   [2.7, 3.0, 2.6, 2.8, 2.9],
    engasjement:     [3.5, 3.3, 3.2, 3.6],
  },
  hio: {
    undervisning:    [3.3, 3.6, 4.1, 3.1],
    tilbakemeldinger:[2.7, 3.1, 3.0],
    vurderingsformer:[4.1, 4.0, 3.8, 3.8],
    laeringsmiljo:   [3.0, 3.3, 3.6],
    organisering:    [3.9, 4.2, 3.8],
    yrkesrelevans:   [3.0, 3.2, 2.7, 3.3, 3.1],
    engasjement:     [3.3, 3.2, 3.3, 3.1],
  },
  uit: {
    undervisning:    [3.0, 3.1, 3.6, 3.2],
    tilbakemeldinger:[2.1, 2.6, 2.5],
    vurderingsformer:[4.1, 4.1, 3.3, 3.7],
    laeringsmiljo:   [3.8, 3.5, 2.9],
    organisering:    [3.1, 3.0, 3.4],
    yrkesrelevans:   [3.0, 3.5, 2.6, 3.1, 2.3],
    engasjement:     [3.4, 3.3, 2.9, 3.5],
  },
  // HVL 2025 – subspørsmål per campus (kilde: studiebarometeret.no, 238_øau3-bergen/238_økb-haugesund/238_økob-sogndal)
  hvl: {
    undervisning:    [3.3, 3.5, 4.0, 3.0],
    tilbakemeldinger:[3.0, 3.2, 2.9],
    vurderingsformer:[4.4, 4.4, 4.1, 4.2],
    laeringsmiljo:   [3.4, 3.5, 3.2],
    organisering:    [3.6, 4.0, 3.8],
    yrkesrelevans:   [2.7, 3.0, 2.2, 2.2, 1.9],
    engasjement:     [4.0, 3.5, 3.5, 4.1],
  },
  // Nord 2025 – subspørsmål Bodø (kilde: studiebarometeret.no, 2024+2025 slått sammen)
  nord: {
    undervisning:    [3.2, 3.4, 4.0, 3.0],
    tilbakemeldinger:[3.1, 3.4, 3.5],
    vurderingsformer:[4.2, 4.2, 3.7, 4.1],
    laeringsmiljo:   [3.6, 3.6, 3.5],
    organisering:    [3.5, 3.9, 4.0],
    yrkesrelevans:   [2.6, 3.1, 2.2, 3.2, 2.0],
    engasjement:     [3.8, 3.2, 2.8, 3.5],
  },
  // ONH 2025 – subspørsmål Oslo (kilde: studiebarometeret.no 2025)
  onh: {
    undervisning:    [3.8, 4.1, 4.3, 3.6],
    tilbakemeldinger:[3.6, 3.7, 3.9],
    vurderingsformer:[4.5, 4.5, 4.4, 4.5],
    laeringsmiljo:   [3.1, 3.6, 3.4],
    organisering:    [3.9, 4.1, 4.5],
    yrkesrelevans:   [3.8, 3.8, 3.2, 3.2, 3.2],
    engasjement:     [4.3, 3.3, 4.1, 3.9],
  },
  // Høgskolen i Molde 2025 – subspørsmål (kilde: studiebarometeret.no, 2024+2025 slått sammen)
  himolde: {
    undervisning:    [3.6, 3.7, 4.2, 3.3],
    tilbakemeldinger:[3.6, 3.7, 3.8],
    vurderingsformer:[4.4, 4.4, 4.2, 4.4],
    laeringsmiljo:   [3.1, 3.4, 3.9],
    organisering:    [4.2, 4.3, 4.3],
    yrkesrelevans:   [3.4, 3.8, 3.1, 3.4, 2.7],
    engasjement:     [4.0, 3.4, 3.4, 3.8],
  },
  // Kristiania 2025 – subspørsmål (kilde: studiebarometeret.no 2025)
  kristiania: {
    undervisning:    [3.2, 3.3, 3.8, 3.1],
    tilbakemeldinger:[2.2, 2.7, 2.7],
    vurderingsformer:[3.7, 3.7, 3.6, 3.6],
    laeringsmiljo:   [3.8, 3.5, 3.4],
    organisering:    [3.4, 3.6, 3.4],
    yrkesrelevans:   [2.8, 2.9, 2.6, 2.9, 2.7],
    engasjement:     [3.7, 3.1, 3.2, 3.4],
  },
  // USN Bø 2025 – subspørsmål (kilde: studiebarometeret.no 2025, program 1176_okled-bo)
  usn_bo: {
    undervisning:    [3.5, 3.4, 3.9, 2.7],
    tilbakemeldinger:[3.4, 3.5, 3.5],
    vurderingsformer:[3.9, 4.1, 4.0, 3.9],
    laeringsmiljo:   [4.1, 3.8, 3.7],
    organisering:    [3.6, 4.0, 3.9],
    yrkesrelevans:   [3.3, 3.4, 2.7, 2.8, 2.0],
    engasjement:     [3.7, 3.6, 3.1, 3.3],
  },
  // USN Kongsberg 2025 – subspørsmål (kilde: studiebarometeret.no, 2024+2025 slått sammen)
  usn_kongsberg: {
    undervisning:    [3.3, 3.5, 4.0, 3.4],
    tilbakemeldinger:[3.2, 3.2, 3.4],
    vurderingsformer:[3.7, 4.1, 3.6, 3.7],
    laeringsmiljo:   [3.1, 2.9, 3.1],
    organisering:    [3.5, 3.2, 3.8],
    yrkesrelevans:   [3.1, 3.6, 2.8, 3.1, 2.5],
    engasjement:     [3.4, 3.6, 3.4, 3.2],
  },
};

const STUDIEBAROMETER_DATA_2025: StudiebarometerEntry[] = [
  {
    universityId: 'nhh',
    campus: 'NHH – Bergen',
    programName: 'Økonomi og administrasjon – siviløkonom',
    respondents: 198, invited: 436,
    scores: { undervisning: 3.7, tilbakemeldinger: 3.3, vurderingsformer: 4.1, laeringsmiljo: 3.9, organisering: 4.0, yrkesrelevans: 3.6, engasjement: 3.8, helhetsvurdering: 4.3 },
  },
  {
    universityId: 'nmbu',
    campus: 'NMBU – Ås',
    programName: 'Økonomi og administrasjon',
    respondents: 54, invited: 93,
    scores: { undervisning: 3.6, tilbakemeldinger: 3.0, vurderingsformer: 3.9, laeringsmiljo: 3.6, organisering: 4.3, yrkesrelevans: 3.2, engasjement: 3.4, helhetsvurdering: 4.1 },
  },
  {
    universityId: 'ntnu',
    campus: 'NTNU – Trondheim',
    programName: 'Økonomi og administrasjon',
    respondents: 76, invited: 194,
    scores: { undervisning: 3.7, tilbakemeldinger: 2.7, vurderingsformer: 4.2, laeringsmiljo: 4.0, organisering: 3.8, yrkesrelevans: 3.3, engasjement: 3.6, helhetsvurdering: 4.0 },
  },
  {
    universityId: 'ntnu_gjovik',
    campus: 'NTNU – Gjøvik',
    programName: 'Økonomi og administrasjon',
    respondents: 42, invited: 130,
    scores: { undervisning: 3.6, tilbakemeldinger: 3.0, vurderingsformer: 4.0, laeringsmiljo: 3.9, organisering: 3.9, yrkesrelevans: 2.8, engasjement: 3.7, helhetsvurdering: 3.9 },
  },
  {
    universityId: 'ntnu_alesund',
    campus: 'NTNU – Ålesund',
    programName: 'Økonomi og administrasjon',
    respondents: 30, invited: 100,
    scores: { undervisning: 3.3, tilbakemeldinger: 2.8, vurderingsformer: 4.0, laeringsmiljo: 3.5, organisering: 3.5, yrkesrelevans: 3.0, engasjement: 3.5, helhetsvurdering: 3.9 },
  },
  {
    universityId: 'oslomet',
    campus: 'OsloMet – Oslo',
    programName: 'Økonomi og administrasjon – siviløkonom',
    respondents: 18, invited: 79,
    scores: { undervisning: 3.7, tilbakemeldinger: 3.1, vurderingsformer: 4.2, laeringsmiljo: 3.6, organisering: 3.9, yrkesrelevans: 3.0, engasjement: 3.7, helhetsvurdering: 4.3 },
    note: 'Siviløkonom-programmet. Bachelorprogrammet (okad) hadde for få respondenter til å vises.',
  },
  {
    universityId: 'uia',
    campus: 'UiA – Kristiansand',
    programName: 'Økonomi og administrasjon',
    respondents: 101, invited: 231,
    scores: { undervisning: 3.4, tilbakemeldinger: 3.0, vurderingsformer: 4.0, laeringsmiljo: 3.9, organisering: 3.9, yrkesrelevans: 2.9, engasjement: 3.5, helhetsvurdering: 4.1 },
  },
  {
    universityId: 'usn',
    campus: 'USN – Drammen',
    programName: 'Bachelor i økonomi og ledelse',
    respondents: 33, invited: 95,
    scores: { undervisning: 3.6, tilbakemeldinger: 3.2, vurderingsformer: 3.6, laeringsmiljo: 3.6, organisering: 3.8, yrkesrelevans: 3.0, engasjement: 3.6, helhetsvurdering: 4.0 },
    note: 'Tallene er fra 2025 (n=33). Inviterte ca. 95 (estimat). Kilde: studiebarometeret.no (1176_okled-drammen)',
  },
  {
    universityId: 'usn_kongsberg',
    campus: 'USN – Kongsberg',
    programName: 'Bachelor i økonomi og ledelse',
    respondents: 24, invited: 130,
    scores: { undervisning: 3.5, tilbakemeldinger: 3.3, vurderingsformer: 3.8, laeringsmiljo: 3.0, organisering: 3.5, yrkesrelevans: 3.0, engasjement: 3.4, helhetsvurdering: 3.3 },
    note: 'Tallene for 2024 og 2025 er slått sammen pga. få svarende i 2025 (n=24). Inviterte ca. 130 (estimat). Kilde: studiebarometeret.no (1176_okled-kongsberg)',
  },
  {
    universityId: 'usn_honefoss',
    campus: 'USN – Hønefoss',
    programName: 'Bachelor i økonomi og ledelse',
    respondents: 2, invited: 32,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'USN Hønefoss hadde for få respondenter i 2025-undersøkelsen (n=2 av 32 inviterte, 6,3 %) – resultater vises ikke. Tallene er ikke representative.',
  },
  {
    universityId: 'usn_bo',
    campus: 'USN – Bø',
    programName: 'Bachelor i økonomi og ledelse',
    respondents: 14, invited: 62,
    scores: { undervisning: 3.3, tilbakemeldinger: 3.4, vurderingsformer: 4.0, laeringsmiljo: 3.8, organisering: 3.8, yrkesrelevans: 2.9, engasjement: 3.4, helhetsvurdering: 3.7 },
    note: 'USN Bø-campus, 2025. Inviterte ca. 62 (estimat). Få respondenter (n=14) – tolkningsforsiktighet anbefales. Kilde: studiebarometeret.no (1176_okled-bo)',
  },
  {
    universityId: 'hio',
    campus: 'HiØ – Halden',
    programName: 'Økonomi og administrasjon',
    respondents: 36, invited: 182,
    scores: { undervisning: 3.5, tilbakemeldinger: 2.9, vurderingsformer: 3.9, laeringsmiljo: 3.4, organisering: 4.0, yrkesrelevans: 3.1, engasjement: 3.2, helhetsvurdering: 3.8 },
  },
  {
    universityId: 'uit',
    campus: 'UiT – Tromsø',
    programName: 'Økonomi og administrasjon',
    respondents: 31, invited: 122,
    scores: { undervisning: 3.2, tilbakemeldinger: 2.4, vurderingsformer: 3.8, laeringsmiljo: 3.4, organisering: 3.2, yrkesrelevans: 2.9, engasjement: 3.3, helhetsvurdering: 3.5 },
  },
  {
    universityId: 'uis',
    campus: 'UiS – Stavanger',
    programName: 'Økonomi og administrasjon',
    respondents: 82, invited: 176,
    scores: { undervisning: 3.4, tilbakemeldinger: 3.1, vurderingsformer: 4.0, laeringsmiljo: 3.6, organisering: 3.7, yrkesrelevans: 2.8, engasjement: 3.4, helhetsvurdering: 3.8 },
  },
  {
    universityId: 'nla',
    campus: 'NLA – Oslo',
    programName: 'Økonomi og administrasjon',
    respondents: 31, invited: 70,
    scores: { undervisning: 3.0, tilbakemeldinger: 2.7, vurderingsformer: 3.6, laeringsmiljo: 3.4, organisering: 3.3, yrkesrelevans: 2.8, engasjement: 3.4, helhetsvurdering: 3.3 },
  },
  {
    universityId: 'nla',
    campus: 'NLA – Kristiansand',
    programName: 'Økonomi og administrasjon',
    respondents: 28, invited: 40,
    scores: { undervisning: 3.7, tilbakemeldinger: 3.5, vurderingsformer: 4.0, laeringsmiljo: 3.9, organisering: 3.9, yrkesrelevans: 3.1, engasjement: 3.6, helhetsvurdering: 3.9 },
  },
  {
    universityId: 'inn',
    campus: 'INN – Lillehammer',
    programName: 'Økonomi og administrasjon',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'INN ikke inkludert i Studiebarometeret for dette programmet',
  },
  {
    universityId: 'bi',
    campus: 'BI Handelshøyskolen',
    programName: '–',
    respondents: 0, invited: 0,
    scores: { undervisning: null, tilbakemeldinger: null, vurderingsformer: null, laeringsmiljo: null, organisering: null, yrkesrelevans: null, engasjement: null, helhetsvurdering: null },
    note: 'BI deltar ikke i Studiebarometeret (privat institusjon)',
  },
  {
    universityId: 'kristiania',
    campus: 'Høyskolen Kristiania – Oslo',
    programName: 'Bachelor i økonomi og ledelse',
    respondents: 21, invited: 95,
    scores: { undervisning: 3.4, tilbakemeldinger: 2.5, vurderingsformer: 3.6, laeringsmiljo: 3.6, organisering: 3.4, yrkesrelevans: 2.8, engasjement: 3.3, helhetsvurdering: 3.7 },
    note: 'Tallene er fra 2025. Inviterte ca. 95 (estimat). Kilde: studiebarometeret.no (8253_bol)',
  },
  // HVL 2025 – kilde: studiebarometeret.no (238_øau3-bergen / 238_økb-haugesund / 238_økob-sogndal)
  {
    universityId: 'hvl',
    campus: 'HVL – Bergen',
    programName: 'Bachelor i økonomi og administrasjon',
    respondents: 50, invited: 158,
    scores: { undervisning: 3.4, tilbakemeldinger: 3.0, vurderingsformer: 4.3, laeringsmiljo: 3.4, organisering: 3.8, yrkesrelevans: 2.4, engasjement: 3.8, helhetsvurdering: 4.0 },
  },
  {
    universityId: 'hvl',
    campus: 'HVL – Haugesund',
    programName: 'Bachelor i økonomi og administrasjon',
    respondents: 27, invited: 54,
    scores: { undervisning: 3.7, tilbakemeldinger: 3.0, vurderingsformer: 3.8, laeringsmiljo: 3.5, organisering: 3.5, yrkesrelevans: 3.1, engasjement: 3.5, helhetsvurdering: 3.7 },
  },
  {
    universityId: 'hvl',
    campus: 'HVL – Sogndal',
    programName: 'Bachelor i økonomi og administrasjon',
    respondents: 10, invited: 31,
    scores: { undervisning: 3.8, tilbakemeldinger: 3.1, vurderingsformer: 4.0, laeringsmiljo: 2.9, organisering: 3.7, yrkesrelevans: 3.3, engasjement: 4.1, helhetsvurdering: 3.8 },
    note: 'Få respondenter (10 av 31 inviterte, 32 %) – tolkningsforsiktighet anbefales',
  },
  // Nord 2025 – kilde: studiebarometeret.no (Bodø: 2024+2025 slått sammen, Steinkjer: 2025)
  {
    universityId: 'nord',
    campus: 'Nord – Bodø',
    programName: 'Økonomi og administrasjon',
    respondents: 24, invited: 121,
    scores: { undervisning: 3.4, tilbakemeldinger: 3.3, vurderingsformer: 4.1, laeringsmiljo: 3.6, organisering: 3.8, yrkesrelevans: 2.6, engasjement: 3.3, helhetsvurdering: 3.9 },
    note: 'Tallene for 2024 og 2025 er slått sammen pga. få respondenter i 2025 alene (n=24/121)',
  },
  {
    universityId: 'nord',
    campus: 'Nord – Steinkjer',
    programName: 'Økonomi og administrasjon',
    respondents: 19, invited: 32,
    scores: { undervisning: 3.8, tilbakemeldinger: 3.4, vurderingsformer: 3.9, laeringsmiljo: 3.8, organisering: 3.8, yrkesrelevans: 3.0, engasjement: 3.8, helhetsvurdering: 4.1 },
    note: 'Steinkjer-campus, 2025-undersøkelse (19 av 32 inviterte, 59 %)',
  },
  // ONH 2025 – kilde: studiebarometeret.no (nettbasert program, Oslo)
  {
    universityId: 'onh',
    campus: 'ONH – Oslo',
    programName: 'Økonomi og administrasjon',
    respondents: 25, invited: 105,
    scores: { undervisning: 3.9, tilbakemeldinger: 3.8, vurderingsformer: 4.5, laeringsmiljo: 3.6, organisering: 4.2, yrkesrelevans: 3.4, engasjement: 3.9, helhetsvurdering: 4.3 },
    note: 'Oslo nye høyskole, nettbasert program (25 av 105 inviterte, 24 %)',
  },
  // HiMolde 2025 – kilde: studiebarometeret.no (2024+2025 slått sammen, programID: 232_07)
  {
    universityId: 'himolde',
    campus: 'HiMolde – Molde',
    programName: 'Bachelor i økonomi og administrasjon',
    respondents: 27, invited: 130,
    scores: { undervisning: 3.7, tilbakemeldinger: 3.7, vurderingsformer: 4.3, laeringsmiljo: 3.5, organisering: 4.2, yrkesrelevans: 3.3, engasjement: 3.7, helhetsvurdering: 4.0 },
    note: 'Tallene for 2024 og 2025 er slått sammen pga. få svarende i 2025 (n=27). Inviterte ca. 130 (estimat).',
  },
];

// ─── Samlet eksport ───────────────────────────────────────────────────────────

export const STUDIEBAROMETER_BY_YEAR: Record<SurveyYear, StudiebarometerEntry[]> = {
  '2024': STUDIEBAROMETER_DATA_2024,
  '2025': STUDIEBAROMETER_DATA_2025,
};

export const SUBQUESTION_SCORES_BY_YEAR: Record<SurveyYear, Record<string, Record<DimensionKey, number[]>>> = {
  '2024': SUBQUESTION_SCORES_2024,
  '2025': SUBQUESTION_SCORES_2025,
};

// Bakoverkompatibilitet (peker på nyeste)
export const STUDIEBAROMETER_DATA = STUDIEBAROMETER_DATA_2025;
export const SUBQUESTION_SCORES = SUBQUESTION_SCORES_2025;

export const SCORE_LABELS: Record<keyof StudiebarometerEntry['scores'], string> = {
  undervisning:      'Undervisning',
  tilbakemeldinger:  'Tilbakemeldinger',
  vurderingsformer:  'Vurderingsformer',
  laeringsmiljo:     'Læringsmiljø',
  organisering:      'Organisering',
  yrkesrelevans:     'Yrkesrelevans',
  engasjement:       'Eget engasjement',
  helhetsvurdering:  'Helhetsvurdering',
};

export const RADAR_KEYS: DimensionKey[] = [
  'undervisning', 'tilbakemeldinger', 'vurderingsformer',
  'laeringsmiljo', 'organisering', 'yrkesrelevans', 'engasjement',
];
