// DBH tabell 571 — gjennomsnittlige opptakspoeng for søkere
// Kilde: okadm_bruker_dbh571_2023_2025.csv
// snitt = gjennomsnittlige opptakspoeng for ALLE søkere (ikke bare de som ble tatt opp)

export interface DBHYearData {
  snitt: number | null;
  antall: number | null;
}

export interface DBHSokerpoengEntry {
  studiekode: string;
  altkode?: string;
  studienavn: string;
  institusjon: string;
  studiested: string;
  years: {
    '2023': DBHYearData;
    '2024': DBHYearData;
    '2025': DBHYearData;
  };
}

export const DBH_SOKERPOENG: DBHSokerpoengEntry[] = [
  {
    studiekode: '192369',
    studienavn: 'Økonomi og administrasjon',
    institusjon: 'NMBU',
    studiested: 'Ås',
    years: { '2023': { snitt: 49.5, antall: 293 }, '2024': { snitt: 49.6, antall: 387 }, '2025': { snitt: 48.9, antall: 398 } },
  },
  {
    studiekode: '194035',
    studienavn: 'Økonomi og administrasjon',
    institusjon: 'NTNU',
    studiested: 'Trondheim',
    years: { '2023': { snitt: 50.9, antall: 3179 }, '2024': { snitt: 51.2, antall: 3348 }, '2025': { snitt: 52.2, antall: 2496 } },
  },
  {
    studiekode: '194591',
    studienavn: 'Økonomi og ledelse, bachelor',
    institusjon: 'NTNU',
    studiested: 'Gjøvik',
    years: { '2023': { snitt: 48.0, antall: 284 }, '2024': { snitt: 52.3, antall: 688 }, '2025': { snitt: 52.4, antall: 737 } },
  },
  {
    studiekode: '194515',
    studienavn: 'Økonomi, administrasjon og internasjonal business',
    institusjon: 'NTNU',
    studiested: 'Ålesund',
    years: { '2023': { snitt: 56.2, antall: 975 }, '2024': { snitt: 56.9, antall: 1145 }, '2025': { snitt: 46.9, antall: 808 } },
  },
  {
    studiekode: '215369',
    studienavn: 'Økonomi og administrasjon',
    institusjon: 'OsloMet',
    studiested: 'Oslo',
    years: { '2023': { snitt: 49.0, antall: 1850 }, '2024': { snitt: 48.8, antall: 1953 }, '2025': { snitt: 48.7, antall: 1989 } },
  },
  {
    studiekode: '201369',
    studienavn: 'Økonomi og administrasjon',
    institusjon: 'UiA',
    studiested: 'Kristiansand',
    years: { '2023': { snitt: 48.2, antall: 1060 }, '2024': { snitt: 48.0, antall: 1152 }, '2025': { snitt: 48.0, antall: 1143 } },
  },
  {
    studiekode: '217369',
    studienavn: 'Økonomi og administrasjon',
    institusjon: 'UiS',
    studiested: 'Stavanger',
    years: { '2023': { snitt: 46.4, antall: 1003 }, '2024': { snitt: 46.8, antall: 1042 }, '2025': { snitt: 46.2, antall: 1087 } },
  },
  {
    studiekode: '203369',
    studienavn: 'Økonomi og administrasjon, Bergen',
    institusjon: 'HVL',
    studiested: 'Bergen',
    years: { '2023': { snitt: 48.5, antall: 932 }, '2024': { snitt: 48.8, antall: 1025 }, '2025': { snitt: 49.0, antall: 1136 } },
  },
  {
    studiekode: '203404',
    studienavn: 'Økonomi og administrasjon, Haugesund',
    institusjon: 'HVL',
    studiested: 'Haugesund',
    years: { '2023': { snitt: 44.4, antall: 220 }, '2024': { snitt: 44.8, antall: 266 }, '2025': { snitt: 43.7, antall: 231 } },
  },
  {
    studiekode: '203515',
    studienavn: 'Økonomi og administrasjon, Sogndal',
    institusjon: 'HVL',
    studiested: 'Sogndal',
    years: { '2023': { snitt: 44.7, antall: 181 }, '2024': { snitt: 44.9, antall: 241 }, '2025': { snitt: 46.2, antall: 219 } },
  },
  {
    studiekode: '222330',
    studienavn: 'Økonomi og ledelse, Drammen',
    institusjon: 'USN',
    studiested: 'Drammen',
    years: { '2023': { snitt: 43.5, antall: 1751 }, '2024': { snitt: 43.9, antall: 1796 }, '2025': { snitt: 43.5, antall: 1839 } },
  },
  {
    studiekode: '222097',
    studienavn: 'Økonomi og administrasjon, Hønefoss',
    institusjon: 'USN',
    studiested: 'Ringerike',
    years: { '2023': { snitt: null, antall: null }, '2024': { snitt: null, antall: null }, '2025': { snitt: 48.9, antall: 50 } },
  },
  {
    studiekode: '222164',
    studienavn: 'Økonomi og administrasjon, Bø',
    institusjon: 'USN',
    studiested: 'Midt-Telemark',
    years: { '2023': { snitt: null, antall: null }, '2024': { snitt: null, antall: null }, '2025': { snitt: 48.9, antall: 50 } },
  },
  {
    studiekode: '222625',
    studienavn: 'Økonomi og administrasjon, Kongsberg',
    institusjon: 'USN',
    studiested: 'Kongsberg',
    years: { '2023': { snitt: null, antall: null }, '2024': { snitt: null, antall: null }, '2025': { snitt: 48.9, antall: 50 } },
  },
  {
    studiekode: '209035',
    studienavn: 'Økonomi og administrasjon, Lillehammer, bachelor',
    institusjon: 'INN',
    studiested: 'Lillehammer',
    years: { '2023': { snitt: null, antall: null }, '2024': { snitt: null, antall: null }, '2025': { snitt: 50.3, antall: 707 } },
  },
  {
    studiekode: '209369',
    studienavn: 'Økonomi og administrasjon, Rena, bachelor',
    institusjon: 'INN',
    studiested: 'Åmot',
    years: { '2023': { snitt: null, antall: null }, '2024': { snitt: null, antall: null }, '2025': { snitt: 47.8, antall: 199 } },
  },
  {
    studiekode: '186369',
    studienavn: 'Økonomi og administrasjon, Tromsø',
    institusjon: 'UiT',
    studiested: 'Tromsø',
    years: { '2023': { snitt: 48.7, antall: 702 }, '2024': { snitt: 49.1, antall: 951 }, '2025': { snitt: 51.0, antall: 666 } },
  },
  {
    studiekode: '186468',
    studienavn: 'Økonomi og administrasjon, Alta',
    institusjon: 'UiT',
    studiested: 'Alta',
    years: { '2023': { snitt: 48.7, antall: 702 }, '2024': { snitt: 49.1, antall: 951 }, '2025': { snitt: 51.0, antall: 666 } },
  },
  {
    studiekode: '186035',
    altkode: '186404',
    studienavn: 'Økonomi og administrasjon, Harstad',
    institusjon: 'UiT',
    studiested: 'Harstad',
    years: { '2023': { snitt: 44.7, antall: 85 }, '2024': { snitt: 45.4, antall: 101 }, '2025': { snitt: 45.8, antall: 106 } },
  },
  {
    studiekode: '204342',
    studienavn: 'Økonomi og administrasjon, Bodø, bachelor',
    institusjon: 'Nord',
    studiested: 'Bodø',
    years: { '2023': { snitt: null, antall: null }, '2024': { snitt: 46.7, antall: 265 }, '2025': { snitt: 45.3, antall: 300 } },
  },
  {
    studiekode: '204404',
    studienavn: 'Økonomi og administrasjon, Steinkjer, bachelor',
    institusjon: 'Nord',
    studiested: 'Steinkjer',
    years: { '2023': { snitt: null, antall: null }, '2024': { snitt: 46.7, antall: 265 }, '2025': { snitt: 47.6, antall: 212 } },
  },
  {
    studiekode: '224035',
    studienavn: 'Økonomi og administrasjon',
    institusjon: 'HiØ',
    studiested: 'Halden',
    years: { '2023': { snitt: 43.3, antall: 315 }, '2024': { snitt: 43.3, antall: 332 }, '2025': { snitt: 43.7, antall: 284 } },
  },
  {
    studiekode: '211369',
    altkode: '207369',
    studienavn: 'Økonomi og administrasjon',
    institusjon: 'Høgskolen i Molde',
    studiested: 'Molde',
    years: { '2023': { snitt: 44.9, antall: 172 }, '2024': { snitt: 45.1, antall: 195 }, '2025': { snitt: 45.2, antall: 200 } },
  },
  {
    studiekode: '191345',
    studienavn: 'Økonomi og administrasjon – siviløkonom',
    institusjon: 'NHH',
    studiested: 'Bergen',
    years: { '2023': { snitt: 55.7, antall: 1863 }, '2024': { snitt: 55.2, antall: 1995 }, '2025': { snitt: 55.1, antall: 1940 } },
  },
  {
    studiekode: '215345',
    studienavn: 'Økonomi og administrasjon – siviløkonom',
    institusjon: 'OsloMet',
    studiested: 'Oslo',
    years: { '2023': { snitt: 49.0, antall: 1850 }, '2024': { snitt: 48.8, antall: 1953 }, '2025': { snitt: 48.7, antall: 1989 } },
  },
  {
    studiekode: '194345',
    studienavn: 'Økonomi og administrasjon, siviløkonom',
    institusjon: 'NTNU',
    studiested: 'Trondheim',
    years: { '2023': { snitt: 56.2, antall: 975 }, '2024': { snitt: 56.9, antall: 1145 }, '2025': { snitt: 56.8, antall: 1086 } },
  },
  {
    studiekode: '201345',
    studienavn: 'Økonomi og administrasjon – siviløkonom',
    institusjon: 'UiA',
    studiested: 'Kristiansand',
    years: { '2023': { snitt: 48.2, antall: 1060 }, '2024': { snitt: 48.0, antall: 1152 }, '2025': { snitt: 48.0, antall: 1143 } },
  },
];

// Lookup by normalized studiekode (no spaces). Includes both primary and alternative codes.
export const DBH_BY_CODE: Record<string, DBHSokerpoengEntry> = {};
for (const entry of DBH_SOKERPOENG) {
  DBH_BY_CODE[entry.studiekode] = entry;
  if (entry.altkode) DBH_BY_CODE[entry.altkode] = entry;
}

// Returns the best available DBH snitt for a given SO studyCode string
// (handles multi-code strings like "203 369 / 203 404 / 203 515")
export function getDBHSnitt(studyCode: string): { snitt: number; year: string; antall: number | null; studiested: string } | null {
  const codes = studyCode.split('/').map((s) => s.replace(/\s/g, '').trim());
  for (const code of codes) {
    const entry = DBH_BY_CODE[code];
    if (!entry) continue;
    for (const year of ['2025', '2024', '2023'] as const) {
      const d = entry.years[year];
      if (d.snitt !== null) return { snitt: d.snitt, year, antall: d.antall, studiested: entry.studiested };
    }
  }
  return null;
}
