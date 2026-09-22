export interface ThesisGrades {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
}

export interface ThesisYear {
  year: string;
  grades: ThesisGrades;
}

export interface Specialization {
  code: string;
  name: string;
  years: ThesisYear[];
}

export interface MasterProgram {
  universityId: string;
  programCode: string;
  programName: string;
  isSivilokonom?: boolean;
  years: ThesisYear[];
  specializations?: Specialization[];
}

export interface AdmissionEntry {
  year: string;
  grade: number;
  estimated?: boolean;
  note?: string;
  url?: string;
}

export const MASTER_ADMISSION: Record<string, AdmissionEntry[]> = {
  nmbu: [
    { year: '2026', grade: 3.30 },
    { year: '2025', grade: 3.15, url: 'https://www.nmbu.no/studier/studieprogram/master-i-okonomi-og-administrasjon' },
  ],
  ntnu: [
    { year: '2025', grade: 3.70, url: 'https://www.ntnu.no/hhs/poenggrenser-ntnu-handelshøyskolen' },
  ],
  nhh: [
    { year: '2026', grade: 4.07, url: 'https://www.nhh.no/studier/soknad-og-opptak/opptak-master-i-okonomi-og-administrasjon/' },
    { year: '2025', grade: 3.90, url: 'https://www.nhh.no/studier/soknad-og-opptak/opptak-master-i-okonomi-og-administrasjon/' },
  ],
  uit: [
    { year: '2025', grade: 3.00, url: 'https://uit.no/utdanning/program/279753/okonomi_og_administrasjon_sivilokonom_-_master' },
  ],
  usn: [
    { year: '2025', grade: 2.30, note: 'Strategi og ledelse: 2,294 · Markedsføringsledelse: Alle · Bedriftsøkonomisk analyse: 2,579', url: 'https://www.usn.no/studier/master-i-okonomi-og-ledelse-sivilokonom/strategi-og-ledelse' },
  ],
  oslomet: [
    { year: '2025', grade: 3.48, url: 'https://www.oslomet.no/studier/sam/okonomi-administrasjon-sivilokonom' },
  ],
  uia: [
    { year: '2026', grade: 3.05, note: 'Bekreftet fra UiA per mail', url: 'https://www.uia.no/studier/program/okonomi-og-administrasjon-sivilokonom-master-2-ar/index.html' },
  ],
  bi: [
    { year: '2025', grade: 3.50, url: 'https://www.bi.no/en/programmes-and-individual-courses/admissions/admission-requirements/master-of-science/#id1-degree-and-grade-requirements' },
  ],
  kristiania: [
    { year: '2025', grade: 2.75, estimated: true, url: 'https://www.kristiania.no/studier/master/master-i-okonomi-og-ledelse/#ofte-stilte-sp-oslash-rsm-aring-l' },
  ],
  nord: [
    { year: '2025', grade: 2.50, url: 'https://www.nord.no/studier/okonomi-og-administrasjon-sivilokonom-master-2-ar#opptakskrav' },
  ],
  uis: [
    { year: '2025', grade: 3.00, note: '3,33 for spesialisering Finans. Alle inn på Ledelse og Økonomisk analyse.', url: 'https://www.uis.no/nb/studier/poenggrenser-for-lokalt-opptak#/' },
  ],
  inn: [
    { year: '2025', grade: 2.50, url: 'https://www.inn.no/studier/soknad-og-opptak/poengberegning-og-poenggrenser/oversikt-poenggrenser/master--og-videreutdanninger/' },
  ],
};

export interface ThesisInfo {
  skriveform: string;
  muntligForsvar: string;
  muntligNote?: string;
  muntligUrl?: string;
  eksternSensor: string;
  karaktervirkning: string;
}

export const THESIS_INFO: Record<string, ThesisInfo> = {
  nmbu: {
    skriveform: 'Hovedsakelig par',
    muntligForsvar: 'Ja',
    eksternSensor: 'Ja',
    karaktervirkning: 'Justerende muntlig',
  },
  nhh: {
    skriveform: 'Hovedsakelig par',
    muntligForsvar: 'Nei (2025)',
    muntligNote: 'Foreligger forslag om endring',
    muntligUrl: 'https://www.nhh.no/contentassets/a693f6c0c5394b5594db5579b4839a2d/komplett-innkalling-uu-150426.pdf',
    eksternSensor: 'Ja',
    karaktervirkning: 'Skriftlig oppgave vurderes av veileder og ekstern sensor',
  },
  oslomet: {
    skriveform: 'Hovedsakelig par',
    muntligForsvar: 'Nei (2025)',
    eksternSensor: 'Ja',
    karaktervirkning: 'Skriftlig oppgave vurderes av én intern og én ekstern sensor. Ingen muntlig del inngår i karakteren.',
  },
  uia: {
    skriveform: 'Hovedsakelig par',
    muntligForsvar: 'Ja',
    eksternSensor: 'Ja',
    karaktervirkning: 'Skriftlig oppgave med muntlig presentasjon',
  },
  usn: {
    skriveform: 'Hovedsakelig par',
    muntligForsvar: 'Ja',
    eksternSensor: 'Ja',
    karaktervirkning: 'Skriftlig oppgave med justerende muntlig eksamen. 70/30 fordeling mellom skriftlig og muntlig.',
  },
  ntnu: {
    skriveform: 'Alene eller i par (maks to studenter)',
    muntligForsvar: 'Ja',
    eksternSensor: 'Ja – minst to sensorer, hvorav minst én ekstern. Veileder kan ikke være sensor.',
    karaktervirkning: 'Skriftlig oppgave med muntlig del',
  },
  kristiania: {
    skriveform: 'Hovedsakelig par',
    muntligForsvar: 'Ja',
    eksternSensor: 'Ja',
    karaktervirkning: 'Justerende muntlig',
  },
  bi: {
    skriveform: 'Hovedsakelig par',
    muntligForsvar: 'Mangler info',
    eksternSensor: 'Mangler info',
    karaktervirkning: 'Mangler info',
  },
  uis: {
    skriveform: 'Hovedsakelig par',
    muntligForsvar: 'Ja',
    eksternSensor: 'Ja',
    karaktervirkning: 'Skriftlig oppgave med justerende muntlig eksamen',
  },
  nord: {
    skriveform: 'Hovedsakelig grupper på 2–3 studenter',
    muntligForsvar: 'Nei',
    eksternSensor: 'Ja',
    karaktervirkning: 'Skriftlig oppgave vurderes av intern og ekstern sensor',
  },
  inn: {
    skriveform: 'Hovedsakelig par',
    muntligForsvar: 'Ja',
    eksternSensor: 'Ja',
    karaktervirkning: 'Justerende muntlig',
  },
};

export const UNIVERSITY_NAMES: Record<string, { name: string; shortName: string }> = {
  nmbu:      { name: 'NMBU – Handelshøyskolen',              shortName: 'NMBU' },
  ntnu:      { name: 'NTNU Handelshøyskolen (Trondheim)',    shortName: 'NTNU' },
  nhh:       { name: 'Norges Handelshøyskole',               shortName: 'NHH' },
  uit:       { name: 'UiT Norges arktiske universitet',      shortName: 'UiT' },
  usn:       { name: 'Universitetet i Sørøst-Norge',         shortName: 'USN' },
  oslomet:   { name: 'OsloMet',                              shortName: 'OsloMet' },
  uia:       { name: 'Universitetet i Agder',                shortName: 'UiA' },
  bi:        { name: 'BI Handelshøyskolen',                  shortName: 'BI' },
  kristiania:{ name: 'Kristiania',                           shortName: 'Kristiania' },
  nord:      { name: 'Nord universitet',                     shortName: 'NORD' },
  uis:       { name: 'Universitetet i Stavanger',            shortName: 'UiS' },
  inn:       { name: 'Universitetet i Innlandet',            shortName: 'INN' },
};

// Masteroppgavekarakterer
// Kilde: Årsrapporter og karakterstatistikk fra institusjonene
export const MASTER_THESIS_DATA: MasterProgram[] = [

  // ── NMBU ──────────────────────────────────────────────────────────────────
  {
    universityId: 'nmbu',
    programCode: 'M30-ØA',
    programName: 'Master Økonomi og administrasjon',
    isSivilokonom: true,
    years: [
      { year: '2026', grades: { A: 28, B: 40, C:  8, D: 0, E: 0, F: 0 } },
      { year: '2025', grades: { A: 25, B: 44, C: 14, D: 0, E: 0, F: 0 } },
      { year: '2024', grades: { A: 16, B: 27, C: 15, D: 3, E: 0, F: 0 } },
      { year: '2023', grades: { A: 20, B: 31, C: 16, D: 0, E: 0, F: 0 } },
    ],
  },
  {
    universityId: 'nmbu',
    programCode: 'M30-BIOEC',
    programName: 'Master Bioøkonomi',
    isSivilokonom: false,
    years: [
      { year: '2026', grades: { A: 14, B: 10, C: 2, D: 2, E: 0, F: 0 } },
      { year: '2025', grades: { A: 13, B:  7, C: 6, D: 2, E: 0, F: 0 } },
      { year: '2024', grades: { A:  0, B:  7, C: 5, D: 1, E: 1, F: 0 } },
      { year: '2023', grades: { A: 12, B:  9, C: 0, D: 0, E: 0, F: 0 } },
    ],
  },
  {
    universityId: 'nmbu',
    programCode: 'M30-EI',
    programName: 'Master Entreprenørskap og innovasjon',
    isSivilokonom: false,
    years: [
      { year: '2026', grades: { A: 10, B:  5, C: 3, D: 0, E: 0, F: 0 } },
      { year: '2025', grades: { A:  1, B: 12, C: 4, D: 1, E: 0, F: 0 } },
      { year: '2024', grades: { A:  2, B:  9, C: 5, D: 4, E: 0, F: 0 } },
      { year: '2023', grades: { A: 18, B:  7, C: 6, D: 0, E: 0, F: 0 } },
    ],
  },
  {
    universityId: 'nmbu',
    programCode: 'M30-ECON',
    programName: 'Master Samfunnsøkonomi',
    isSivilokonom: false,
    years: [
      { year: '2026', grades: { A:  6, B: 2, C: 2, D: 0, E: 0, F: 0 } },
      { year: '2025', grades: { A:  6, B: 9, C: 3, D: 0, E: 0, F: 0 } },
      { year: '2024', grades: { A: 10, B: 0, C: 6, D: 0, E: 0, F: 0 } },
      { year: '2023', grades: { A:  7, B: 6, C: 4, D: 0, E: 0, F: 0 } },
    ],
  },

  // ── NTNU ──────────────────────────────────────────────────────────────────
  {
    universityId: 'ntnu',
    programCode: 'Siviløkonom',
    programName: 'Master Økonomi og administrasjon',
    isSivilokonom: true,
    years: [
      { year: '2025', grades: { A: 15, B: 61, C: 26, D: 0, E: 0, F: 0 } },
      { year: '2024', grades: { A: 31, B: 36, C: 32, D: 0, E: 0, F: 0 } },
      { year: '2023', grades: { A: 16, B: 37, C: 25, D: 0, E: 0, F: 0 } },
    ],
    specializations: [
      {
        code: 'FI',
        name: 'Finansiering og investering',
        years: [
          { year: '2025', grades: { A: 11, B: 14, C: 13, D: 0, E: 0, F: 0 } },
          { year: '2024', grades: { A:  8, B: 15, C: 10, D: 0, E: 0, F: 0 } },
          { year: '2023', grades: { A:  5, B: 14, C:  5, D: 0, E: 0, F: 0 } },
        ],
      },
      {
        code: 'BOKO5000',
        name: 'Økonomistyring',
        years: [
          { year: '2025', grades: { A:  0, B: 25, C:  5, D: 0, E: 0, F: 0 } },
          { year: '2024', grades: { A:  7, B: 12, C: 10, D: 0, E: 0, F: 0 } },
          { year: '2023', grades: { A:  3, B: 11, C:  7, D: 0, E: 0, F: 0 } },
        ],
      },
      {
        code: 'BBAN5000',
        name: 'Business analytics',
        years: [
          { year: '2025', grades: { A:  0, B: 13, C:  5, D: 0, E: 0, F: 0 } },
          { year: '2024', grades: { A: 10, B:  9, C:  5, D: 0, E: 0, F: 0 } },
          { year: '2023', grades: { A:  5, B:  9, C:  4, D: 0, E: 0, F: 0 } },
        ],
      },
      {
        code: 'BSOL500',
        name: 'Strategi, organisasjon og ledelse',
        years: [
          { year: '2025', grades: { A: 4, B:  9, C: 3, D: 0, E: 0, F: 0 } },
          { year: '2024', grades: { A: 6, B:  0, C: 7, D: 0, E: 0, F: 0 } },
          { year: '2023', grades: { A: 3, B:  3, C: 9, D: 0, E: 0, F: 0 } },
        ],
      },
    ],
  },

  // ── NHH ───────────────────────────────────────────────────────────────────
  {
    universityId: 'nhh',
    programCode: 'Siviløkonom',
    programName: 'Master Økonomi og administrasjon',
    isSivilokonom: true,
    years: [
      { year: '2025', grades: { A: 420, B: 227, C: 13, D: 0, E: 0, F: 0 } },
      { year: '2024', grades: { A: 309, B: 270, C: 29, D: 0, E: 0, F: 0 } },
      { year: '2023', grades: { A: 288, B: 253, C: 26, D: 0, E: 0, F: 0 } },
    ],
    specializations: [
      {
        code: 'FIETHE',
        name: 'Finansiell økonomi',
        years: [
          { year: '2025', grades: { A: 252, B: 105, C:  4, D: 0, E: 0, F: 0 } },
          { year: '2024', grades: { A: 140, B: 114, C: 15, D: 0, E: 0, F: 0 } },
          { year: '2023', grades: { A: 149, B: 118, C:  8, D: 0, E: 0, F: 0 } },
        ],
      },
      {
        code: 'BUSTHE',
        name: 'Økonomisk styring',
        years: [
          { year: '2025', grades: { A:  54, B: 42, C: 3, D: 0, E: 0, F: 0 } },
          { year: '2024', grades: { A:  48, B: 67, C: 7, D: 0, E: 0, F: 0 } },
          { year: '2023', grades: { A:  59, B: 75, C: 9, D: 0, E: 0, F: 0 } },
        ],
      },
      {
        code: 'STRTHE',
        name: 'Strategi og ledelse',
        years: [
          { year: '2025', grades: { A: 40, B: 25, C: 3, D: 0, E: 0, F: 0 } },
          { year: '2024', grades: { A: 41, B: 33, C: 0, D: 0, E: 0, F: 0 } },
          { year: '2023', grades: { A: 41, B: 25, C: 9, D: 0, E: 0, F: 0 } },
        ],
      },
      {
        code: 'ENETHE',
        name: 'Energy, natural resources and the environment',
        years: [
          { year: '2025', grades: { A: 25, B: 24, C: 3, D: 0, E: 0, F: 0 } },
          { year: '2024', grades: { A: 25, B: 13, C: 7, D: 0, E: 0, F: 0 } },
          { year: '2023', grades: { A: 24, B: 17, C: 0, D: 0, E: 0, F: 0 } },
        ],
      },
      {
        code: 'BANTHE',
        name: 'Business analytics',
        years: [
          { year: '2025', grades: { A: 33, B: 31, C: 0, D: 0, E: 0, F: 0 } },
          { year: '2024', grades: { A: 51, B: 30, C: 0, D: 0, E: 0, F: 0 } },
          { year: '2023', grades: { A:  0, B:  0, C: 0, D: 0, E: 0, F: 0 } },
        ],
      },
      {
        code: 'ECNTHE',
        name: 'Independent work – Major in Economics',
        years: [
          { year: '2025', grades: { A: 13, B:  0, C: 0, D: 0, E: 0, F: 0 } },
          { year: '2024', grades: { A:  4, B:  4, C: 0, D: 0, E: 0, F: 0 } },
          { year: '2023', grades: { A: 10, B: 11, C: 0, D: 0, E: 0, F: 0 } },
        ],
      },
      {
        code: 'MBMTHE',
        name: 'Marketing and brand management',
        years: [
          { year: '2025', grades: { A: 3, B: 0, C: 0, D: 0, E: 0, F: 0 } },
          { year: '2024', grades: { A: 0, B: 9, C: 0, D: 0, E: 0, F: 0 } },
          { year: '2023', grades: { A: 5, B: 7, C: 0, D: 0, E: 0, F: 0 } },
        ],
      },
    ],
  },

  // ── UiT ───────────────────────────────────────────────────────────────────
  {
    universityId: 'uit',
    programCode: 'Siviløkonom',
    programName: 'Master Økonomi og administrasjon',
    isSivilokonom: true,
    years: [
      { year: '2025', grades: { A:  7, B: 16, C: 11, D: 0, E: 0, F: 0 } },
      { year: '2024', grades: { A: 12, B: 10, C: 11, D: 0, E: 0, F: 0 } },
      { year: '2023', grades: { A: 18, B: 23, C:  4, D: 0, E: 0, F: 0 } },
    ],
  },

  // ── USN ───────────────────────────────────────────────────────────────────
  {
    universityId: 'usn',
    programCode: 'AVH5000',
    programName: 'Master Økonomi og administrasjon',
    isSivilokonom: true,
    years: [
      { year: '2025', grades: { A: 15, B: 12, C: 15, D:  3, E: 0, F: 0 } },
      { year: '2024', grades: { A:  3, B: 21, C: 27, D:  8, E: 0, F: 0 } },
      { year: '2023', grades: { A: 10, B: 21, C: 20, D: 13, E: 3, F: 0 } },
    ],
  },

  // ── OsloMet ───────────────────────────────────────────────────────────────
  {
    universityId: 'oslomet',
    programCode: 'ØAMAS5900',
    programName: 'Master Økonomi og administrasjon',
    isSivilokonom: true,
    years: [
      { year: '2025', grades: { A: 29, B: 59, C:  0, D: 0, E: 0, F: 0 } },
      { year: '2024', grades: { A: 27, B: 51, C:  9, D: 0, E: 0, F: 0 } },
      { year: '2023', grades: { A: 40, B: 32, C:  6, D: 4, E: 0, F: 0 } },
    ],
  },

  // ── UiA ───────────────────────────────────────────────────────────────────
  {
    universityId: 'uia',
    programCode: 'BE-501',
    programName: 'Master Økonomi og administrasjon',
    isSivilokonom: true,
    years: [
      { year: '2025', grades: { A: 24, B: 33, C: 20, D: 3, E: 0, F: 0 } },
      { year: '2024', grades: { A: 18, B: 10, C: 16, D: 6, E: 0, F: 0 } },
      { year: '2023', grades: { A: 18, B: 37, C:  6, D: 0, E: 0, F: 3 } },
    ],
  },

  // ── BI ────────────────────────────────────────────────────────────────────
  {
    universityId: 'bi',
    programCode: 'GRA1970',
    programName: 'Master Økonomi og administrasjon',
    isSivilokonom: true,
    years: [
      { year: '2025', grades: { A: 377, B: 219, C: 44, D: 0, E: 0, F: 0 } },
      { year: '2024', grades: { A: 309, B: 241, C: 45, D: 0, E: 0, F: 0 } },
      { year: '2023', grades: { A: 356, B: 256, C: 65, D: 0, E: 0, F: 0 } },
    ],
  },

  // ── Kristiania ────────────────────────────────────────────────────────────
  {
    universityId: 'kristiania',
    programCode: 'MOG5100',
    programName: 'Master Økonomi og administrasjon',
    isSivilokonom: true,
    years: [
      { year: '2025', grades: { A:  9, B: 21, C: 19, D: 3, E: 0, F: 0 } },
      { year: '2024', grades: { A: 11, B: 19, C: 18, D: 9, E: 0, F: 0 } },
      { year: '2023', grades: { A:  9, B: 15, C: 19, D:15, E: 0, F: 0 } },
    ],
  },

  // ── UiS ───────────────────────────────────────────────────────────────────
  {
    universityId: 'uis',
    programCode: 'MSBMAS',
    programName: 'Master Økonomi og administrasjon',
    isSivilokonom: true,
    years: [
      { year: '2025', grades: { A: 44, B: 41, C: 18, D:  7, E: 0, F: 0 } },
      { year: '2024', grades: { A: 54, B: 50, C: 23, D:  3, E: 0, F: 0 } },
      { year: '2023', grades: { A: 42, B: 45, C: 42, D:  4, E: 4, F: 0 } },
    ],
  },

  // ── INN ───────────────────────────────────────────────────────────────────
  // Aggregert total: alle masteroppgaveprogram vår 2025
  {
    universityId: 'inn',
    programCode: 'Master ØA',
    programName: 'Master Økonomi og administrasjon',
    isSivilokonom: true,
    years: [
      // Sum av alle 6 spesialiseringer vår 2025
      { year: '2025', grades: { A: 8, B: 34, C: 18, D: 0, E: 0, F: 0 } },
    ],
    specializations: [
      {
        code: 'mølba4900',
        name: 'Business Analytics (Heltid)',
        years: [
          { year: '2025', grades: { A: 0, B: 6, C: 0, D: 0, E: 0, F: 0 } },
        ],
      },
      {
        code: '3mmf300',
        name: 'Markedsføringsledelse (Heltid)',
        years: [
          { year: '2025', grades: { A: 0, B: 7, C: 0, D: 0, E: 0, F: 0 } },
        ],
      },
      {
        code: '3mmø300',
        name: 'Økonomistyring (Heltid)',
        years: [
          { year: '2025', grades: { A: 0, B: 3, C: 4, D: 0, E: 0, F: 0 } },
        ],
      },
      {
        code: '3mmø350',
        name: 'Økonomistyring (Deltid)',
        years: [
          { year: '2025', grades: { A: 5, B: 8, C: 4, D: 0, E: 0, F: 0 } },
        ],
      },
      {
        code: 'kdba900',
        name: 'Digital ledelse og forretningsutvikling (Heltid)',
        years: [
          { year: '2025', grades: { A: 3, B: 0, C: 3, D: 0, E: 0, F: 0 } },
        ],
      },
      {
        code: 'kdba950',
        name: 'Digital ledelse og forretningsutvikling (Deltid)',
        years: [
          { year: '2025', grades: { A: 0, B: 10, C: 7, D: 0, E: 0, F: 0 } },
        ],
      },
    ],
  },

  // ── Nord ──────────────────────────────────────────────────────────────────
  {
    universityId: 'nord',
    programCode: 'LED5018',
    programName: 'Master Økonomi og administrasjon',
    isSivilokonom: true,
    years: [
      { year: '2025', grades: { A: 26, B: 31, C: 17, D: 4, E: 0, F: 0 } },
      { year: '2024', grades: { A: 19, B: 22, C: 16, D: 0, E: 0, F: 0 } },
      { year: '2023', grades: { A: 16, B: 26, C:  9, D: 7, E: 0, F: 0 } },
    ],
  },
];
