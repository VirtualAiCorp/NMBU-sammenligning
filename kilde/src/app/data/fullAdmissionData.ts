// Søkertall og opptakstall fra Samordna Opptak / HKDIR
// Kilde: sokertallrapport.samordnaopptak.no + rapport-dv.educloud.no
// pg_fv / pg_ord = opptaksgrenser førstegangsvitnemål / ordinær kvote
// Kilde poenggrenser: CSV_OPPTAKSGRENSER_2020-2026.csv
// 0 = alle kvalifiserte kom inn · null = data ikke tilgjengelig

export interface FullYearData {
  alleS:        number | null; // alle søkere
  fvS:          number | null; // førstevalgssøkere
  plasser:      number | null; // studieplasser
  kvinner:      number | null; // kvinner % blant 1.valg-søkere
  kvalifiserte: number | null;
  tilbud:       number | null; // antall tilbud gitt
  pg_fv:        number | null; // poenggrense førstegangsvitnemål
  pg_ord:       number | null; // poenggrense ordinær kvote
  akseptert?:   number | null; // ja-svar på tilbud (DBH 379, lokale opptak)
  mott?:        number | null; // møtt til studiestart (DBH 379, lokale opptak)
  // DBH tabell 571, Samordna-program: snitt av opptakspoeng (med tilleggspoeng) og karakterpoeng
  op_mott?:     number | null; // snitt opptakspoeng, møtt til studiestart
  kp_mott?:     number | null; // snitt karakterpoeng (skolepoeng uten tilleggspoeng), møtt
  op_fv?:       number | null; // snitt opptakspoeng, førstevalgssøkere
  op_alle?:     number | null; // snitt opptakspoeng, alle søkere i institusjonens opptak
  n_mott?:      number | null; // antall som møtte (grunnlaget for op_mott/kp_mott)
}

// 'master2' = toårig master med lokalt opptak (ikke via Samordna opptak)
export type ProgramType = 'bachelor' | 'sivilokonom' | 'master' | 'master2' | 'arsstudium' | 'deltid' | 'nettbasert';

export interface CampusBreakdown {
  name: string;
  studiekode: string;
  alleS: number | null;
  fvS: number | null;
  plasser: number | null;
}

export interface FullAdmissionEntry {
  id: string;
  shortName: string;
  institusjon: string;
  studiekode: string;
  studiested: string;
  type: ProgramType;
  years: Partial<Record<string, FullYearData>>;
  campuses?: CampusBreakdown[];
  url?: string; // lenke til programsiden hos institusjonen
  stipulatedSokerpress?: number;
  poengFellesMed?: string[]; // andre oppføringer med samme DBH-program (felles opptakspoeng)
  lokaltOpptak?: boolean; // lokalt opptak (DBH 379), ikke Samordna – f.eks. BI og Kristiania i bachelorgruppene
  poengLokalt?: boolean; // karakterpoeng fra DBH 571 opptakstype L (lokalt opptak), ikke Samordna
}

const Y = (
  alleS: number | null, fvS: number | null, plasser: number | null,
  kvinner: number | null, kvalifiserte: number | null, tilbud: number | null,
  pg_fv: number | null = null, pg_ord: number | null = null
): FullYearData => ({ alleS, fvS, plasser, kvinner, kvalifiserte, tilbud, pg_fv, pg_ord });

export const FULL_ADMISSION_DATA: FullAdmissionEntry[] = [
  // ── NHH ──────────────────────────────────────────────────────────────────
  {
    id: 'nhh', shortName: 'NHH', institusjon: 'Norges Handelshøyskole',
    studiekode: '191345', studiested: 'Bergen', type: 'sivilokonom',
    years: {
      '2020': Y(null, null, null, null, null, null, 54.6, 57.8),
      '2021': Y(5048, 2179, 570, 35.7, 4586, 977,  54.5, 58.3),
      '2022': Y(4602, 2053, 500, 36.4, 4228, 904,  55.4, 58.9),
      '2023': Y(4930, 2157, 500, 36.4, 4448, 861,  55.6, 59.5),
      '2024': Y(4737, 1698, 430, 34.8, 4240, 827,  55.2, 59.6),
      '2025': Y(4480, 1823, 420, 35.1, 3984, 774,  55.3, 59.9),
      '2026': Y(4749, 1899, 425, 34.5, 4109, 838,  54.8, 59.9),
    },
  },
  // ── NMBU ─────────────────────────────────────────────────────────────────
  {
    id: 'nmbu', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
    studiekode: '192369', studiested: 'Ås', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null, 44.3, 49.3),
      '2021': Y(1132, 175, 96,  45.1, 1086, 190,  44.7, 50.8),
      '2022': Y( 895, 121, 60,  42.1,  859, 140,  44.5, 49.3),
      '2023': Y(1098, 153, 75,  33.3, 1015, 148,  46.3, 47.7),
      '2024': Y(1380, 231, 95,  36.4, 1317, 200,  45.8, 48.6),
      '2025': Y(1417, 247, 95,  38.5, 1343, 196,  46.2, 49.5),
      '2026': Y(1663, 296, 95,  34.1, 1582, 196,  47.5, 50.4),
    },
  },
  // ── NTNU ØA ───────────────────────────────────────────────────────────────
  {
    id: 'ntnu', shortName: 'NTNU', institusjon: 'NTNU',
    studiekode: '194035', studiested: 'Trondheim', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null, 50.1, 53.3),
      '2021': Y(4492, 1110, 310, 37.6, 4389, 580,  51.0, 54.3),
      '2022': Y(3910,  873, 205, 38.8, 3828, 376,  51.9, 55.9),
      '2023': Y(4344,  999, 205, 39.9, 4200, 420,  52.2, 56.1),
      '2024': Y(4443, 1059, 205, 38.7, 4322, 450,  52.3, 57.0),
      '2025': Y(4566, 1149, 190, 40.0, 4463, 390,  53.0, 58.2),
      '2026': Y(4656, 1161, 181, 43.2, 4541, 410,  52.7, 58.2),
    },
  },
  // ── NTNU Siv ─────────────────────────────────────────────────────────────
  {
    id: 'ntnu_siv', shortName: 'NTNU Siv.', institusjon: 'NTNU',
    studiekode: '194345', studiested: 'Trondheim', type: 'sivilokonom',
    years: {
      '2022': Y(1939, 450, 105, 36.0, 1683, 174,  53.5, 58.0),
      '2023': Y(2035, 439, 105, 42.8, 1811, 220,  53.6, 59.1),
      '2024': Y(2447, 496, 105, 49.0, 2225, 231,  53.9, 60.4),
      '2025': Y(2387, 492, 105, 47.2, 2153, 200,  54.3, 61.3),
      '2026': Y(2395, 416, 105, 51.2, 2137, 240,  54.0, 60.5),
    },
  },
  // ── NTNU Ålesund ─────────────────────────────────────────────────────────
  {
    id: 'ntnu_alesund', shortName: 'NTNU Ålesund', institusjon: 'NTNU',
    studiekode: '194515', studiested: 'Ålesund', type: 'bachelor',
    years: {
      '2025': Y(null, null, null, null, null, null, 46.5, 49.1),
      '2026': Y(1713,  241,  70,  null, null, null, 47.3, 50.0),
    },
  },
  // ── NTNU Gjøvik ──────────────────────────────────────────────────────────
  {
    id: 'ntnu_gjovik', shortName: 'NTNU Gjøvik', institusjon: 'NTNU',
    studiekode: '194591', studiested: 'Gjøvik', type: 'bachelor',
    years: {
      '2025': Y(null, null, null, null, null, null, 42.1, 41.8),
      '2026': Y( 802,   77,  55,  null, null, null, 42.2, 41.5),
    },
  },
  // ── OsloMet ØA ───────────────────────────────────────────────────────────
  {
    id: 'oslomet', shortName: 'OsloMet', institusjon: 'OsloMet – storbyuniversitetet',
    studiekode: '215369', studiested: 'Oslo', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null, 47.9, 53.6),
      '2021': Y(4385,  996, 245, 39.6, 4172, 500,  48.6, 53.7),
      '2022': Y(3948,  873, 245, 47.9, 3784, 520,  49.3, 52.3),
      '2023': Y(4404,  934, 240, 44.1, 4133, 580,  48.6, 52.8),
      '2024': Y(4769,  982, 290, 39.6, 4488, 600,  48.3, 52.2),
      '2025': Y(4800, 1056, 300, 40.5, 4509, 610,  47.6, 52.7),
      '2026': Y(5357, 1205, 280, 44.0, 4990, 590,  47.8, 52.8),
    },
  },
  // ── OsloMet Siv ──────────────────────────────────────────────────────────
  {
    id: 'oslomet_siv', shortName: 'OsloMet Siv.', institusjon: 'OsloMet – storbyuniversitetet',
    studiekode: '215345', studiested: 'Oslo', type: 'sivilokonom',
    years: {
      '2023': Y(1932, 392, 60,  41.6, 1435, 160,  50.9, 55.2),
      '2024': Y(1757, 343, 95,  45.8, 1364, 180,  50.3, 55.8),
      '2025': Y(1745, 336, 96,  47.3, 1319, 220,  49.3, 55.2),
      '2026': Y(1668, 338, 120, 49.4, 1226, 320,  46.8, 51.3),
    },
  },
  // ── UiA Siv ──────────────────────────────────────────────────────────────
  {
    id: 'uia_siv', shortName: 'UiA Siv.', institusjon: 'Universitetet i Agder',
    studiekode: '201345', studiested: 'Kristiansand', type: 'sivilokonom',
    years: {
      '2020': Y(null, null, null, null, null, null, 46.0, 47.2),
      '2021': Y(1046, 206, 100, 36.9,  829, 240,  46.0, 46.5),
      '2022': Y( 873, 135, 100, 38.5,  693, 220,  44.7, 44.2),
      '2023': Y( 937, 154, 100, 33.8,  701, 214,  45.6, 45.6),
      '2024': Y(1074, 172, 100, 43.6,  760, 250,  44.8, 46.0),
      '2025': Y(1051, 178, 100, 31.5,  800, 250,  45.2, 45.9),
      '2026': Y(1156, 199, 100, 34.2,  847, 260,  45.6, 46.5),
    },
  },
  // ── UiA ØA ───────────────────────────────────────────────────────────────
  {
    id: 'uia', shortName: 'UiA', institusjon: 'Universitetet i Agder',
    studiekode: '201369', studiested: 'Kristiansand', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null, 45.0, 47.1),
      '2021': Y(2226, 443, 150, 38.1, 2150, 328,  46.4, 48.0),
      '2022': Y(1872, 369, 150, 37.9, 1800, 300,  46.3, 47.2),
      '2023': Y(2108, 431, 150, 37.8, 2007, 300,  47.4, 49.0),
      '2024': Y(2394, 485, 150, 39.4, 2281, 300,  47.8, 50.0),
      '2025': Y(2320, 501, 150, 40.7, 2202, 300,  48.4, 50.0),
      '2026': Y(2603, 507, 150, 41.2, 2505, 290,  48.8, 50.9),
    },
  },
  // ── UiT Tromsø ───────────────────────────────────────────────────────────
  {
    id: 'uit', shortName: 'UiT Tromsø', institusjon: 'UiT Norges arktiske universitet',
    studiekode: '186369', studiested: 'Tromsø', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null, 40.0, 45.7),
      '2021': Y(1136, 242, 140, 32.6, 1080, 220,  41.5, 45.5),
      '2022': Y( 908, 168, 130, 32.1,  846, 230,  35.9, 37.7),
      '2023': Y(1014, 202, 130, 35.6,  936, 220,  42.3, 42.7),
      '2024': Y(1032, 190, 130, 33.7,  979, 300,  38.5, 38.5),
      '2025': Y(1047, 193, 140, 27.5,  990, 300,  39.1, 36.0),
      '2026': Y(1120, 186, 140, 30.1, 1051, 300,  40.3, 38.6),
    },
  },
  // ── UiT Alta ─────────────────────────────────────────────────────────────
  {
    id: 'uit_alta', shortName: 'UiT Alta', institusjon: 'UiT Norges arktiske universitet',
    studiekode: '186468', studiested: 'Alta', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null,  0.0,  0.0),
      '2021': Y(1951, 605, 300, 55.2, 1806, 500,   0.0, 46.6),
      '2022': Y(1489, 483, 300, 54.5, 1380, 500,   0.0, 44.0),
      '2023': Y(1911, 650, 300, 52.6, 1780, 500,   0.0, 47.6),
      '2024': Y(2523, 809, 300, 53.2, 2368, 500,   0.0, 50.0),
      '2025': Y(1827, 538, 350, 53.7, 1742, 600,   0.0, 47.0),
      '2026': Y(1813, 469, 350, 52.9, 1725, 550,   0.0, 45.8),
    },
  },
  // ── UiT Harstad ──────────────────────────────────────────────────────────
  {
    id: 'uit_harstad', shortName: 'UiT Harstad', institusjon: 'UiT Norges arktiske universitet',
    studiekode: '186035', studiested: 'Harstad', type: 'bachelor',
    years: {
      '2021': Y( 243,  43, 110, 44.2,  216,  66,  0, 0),
      '2022': Y( 186,  42, 110, 45.2,  158,  44,  0, 0),
      '2023': Y( 157,  30, 110, 46.7,  126,  38,  0, 0),
      '2024': Y( 181,  32, 110, 43.8,  157,  44,  0, 0),
      '2025': Y( 143,  41,  50, 53.7,  132,  45,  0, 0),
      '2026': Y( 328,  70,  60, 58.6,  290,  94,  0, 0),
    },
  },
  // ── UiS ──────────────────────────────────────────────────────────────────
  {
    id: 'uis', shortName: 'UiS', institusjon: 'Universitetet i Stavanger',
    studiekode: '217369', studiested: 'Stavanger', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null, 43.2, 46.4),
      '2021': Y(2807, 564, 228, 38.8, 2647, 500,  43.5, 46.5),
      '2022': Y(2389, 553, 211, 37.8, 2266, 475,  43.6, 46.5),
      '2023': Y(2361, 587, 191, 41.2, 2189, 400,  46.1, 48.0),
      '2024': Y(2477, 483, 180, 37.1, 2317, 480,  45.0, 46.1),
      '2025': Y(2624, 546, 180, 38.1, 2433, 490,  44.9, 46.3),
      '2026': Y(3178, 674, 140, 38.0, 2992, 460,  46.3, 48.0),
    },
  },
  // ── USN Drammen ──────────────────────────────────────────────────────────
  {
    id: 'usn', shortName: 'USN Drammen', institusjon: 'Universitetet i Sørøst-Norge',
    studiekode: '222330', studiested: 'Drammen', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null, 41.7, 47.0),
      '2021': Y(null, null, null, null, null, null, 42.0, 47.2),
      '2022': Y(null, null, null, null, null, null, 40.0, 46.6),
      '2023': Y(null, null, null, null, null, null, 41.4, 45.5),
      '2024': Y(null, null, null, null, null, null, 40.1, 44.5),
      '2025': Y(null, null, null, null, null, null, 40.2, 43.7),
      '2026': Y(null, null, null, null, null, null, 40.8, 46.0),
    },
  },
  // ── USN Hønefoss ─────────────────────────────────────────────────────────
  {
    id: 'usn_honefoss', shortName: 'USN Hønefoss', institusjon: 'Universitetet i Sørøst-Norge',
    studiekode: '222097', studiested: 'Hønefoss', type: 'bachelor',
    years: {
      '2024': Y(177, 22, 20, 72.7, 162, 42,  0, 0),
      '2025': Y(134, 13, 20, 30.8, 115, 27,  0, 0),
      '2026': Y(167, 20, 20, 45.0, 146, 35,  0, 0),
    },
  },
  // ── USN Bø ───────────────────────────────────────────────────────────────
  {
    id: 'usn_bo', shortName: 'USN Bø', institusjon: 'Universitetet i Sørøst-Norge',
    studiekode: '222164', studiested: 'Bø', type: 'bachelor',
    years: {
      '2024': Y(164, 25, 20, 44.0, 148, 38,  0, 0),
      '2025': Y(130, 22, 20, 54.5, 119, 20,  0, 0),
      '2026': Y(144, 29, 20, 44.8, 128, 45,  0, 0),
    },
  },
  // ── USN Kongsberg ─────────────────────────────────────────────────────────
  {
    id: 'usn_kongsberg', shortName: 'USN Kongsberg', institusjon: 'Universitetet i Sørøst-Norge',
    studiekode: '222625', studiested: 'Kongsberg', type: 'bachelor',
    years: {
      '2025': Y(201, 25, 25, 56.0, 175, 43,  0, 0),
      '2026': Y(224, 22, 25, 68.2, 191, 42,  0, 0),
    },
  },
  // ── INN Lillehammer ───────────────────────────────────────────────────────
  {
    id: 'inn', shortName: 'INN Lhm.', institusjon: 'Universitetet i Innlandet',
    studiekode: '209035', studiested: 'Lillehammer', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null, 38.4, 42.6),
      '2021': Y(1019, 132, 70, 37.9,  968, 180,  39.6, 42.2),
      '2022': Y( 907, 110, 80, 37.3,  847, 150,  39.5, 40.8),
      '2023': Y( 743, 114, 85, 39.5,  674, 157,  40.5, 40.3),
      '2024': Y( 974, 129, 80, 38.8,  881, 154,  41.9, 42.4),
      '2025': Y( 786, 120, 80, 36.7,  726, 165,  41.9, 41.8),
      '2026': Y( 992, 137, 80, 27.0,  920, 155,  43.3, 44.6),
    },
  },
  // ── INN Rena ─────────────────────────────────────────────────────────────
  {
    id: 'inn_rena', shortName: 'INN Rena', institusjon: 'Universitetet i Innlandet',
    studiekode: '209369', studiested: 'Rena', type: 'bachelor',
    years: {
      '2021': Y(384, 38, 45, 42.1, 344, 116,  0, 0),
      '2022': Y(279, 18, 40, 33.3, 238,  34,  0, 0),
      '2023': Y(213, 23, 40, 30.4, 182,  48,  0, 0),
      '2024': Y(240, 21, 40, 28.6, 198,  47,  0, 0),
      '2025': Y(210, 22, 40, 27.3, 184,  37,  0, 0),
      '2026': Y(236, 27, 40, 55.6, 204,  52,  0, 0),
    },
  },
  // ── Nord Bodø ─────────────────────────────────────────────────────────────
  {
    id: 'nord', shortName: 'Nord Bodø', institusjon: 'Nord universitet',
    studiekode: '204342', studiested: 'Bodø', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null, 35.7, 42.8),
      '2021': Y(533, 97, 60, 39.2, 495, 140,  35.7, 41.2),
      '2022': Y(459, 79, 70, 35.4, 419, 100,  34.7, 37.8),
      '2023': Y(437, 82, 70, 34.1, 398, 100,  33.7, 41.3),
      '2024': Y(510, 87, 60, 28.7, 455, 144,   0.0,  0.0),
      '2025': Y(381, 76, 50, 35.5, 351, 104,   0.0,  0.0),
      '2026': Y(449, 76, 60, 44.7, 403, 116,   0.0,  0.0),
    },
  },
  // ── Nord Steinkjer ────────────────────────────────────────────────────────
  {
    id: 'nord_steinkjer', shortName: 'Nord Stk.', institusjon: 'Nord universitet',
    studiekode: '204404', studiested: 'Steinkjer', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null,  0.0, 42.5),
      '2021': Y(279, 53, 50, 52.8, 255,  90,   0.0, 40.3),
      '2022': Y(256, 46, 50, 54.3, 235,  70,   0.0, 38.3),
      '2023': Y(197, 39, 50, 41.0, 176,  62,   0.0,  0.0),
      '2024': Y(286, 53, 40, 43.4, 253,  89,   0.0,  0.0),
      '2025': Y(223, 44, 40, 50.0, 197,  86,   0.0,  0.0),
      '2026': Y(240, 40, 40, 47.5, 211,  69,   0.0,  0.0),
    },
  },
  // ── HVL Bergen ───────────────────────────────────────────────────────────
  {
    id: 'hvl_bergen', shortName: 'HVL Bergen', institusjon: 'Høgskulen på Vestlandet',
    studiekode: '203369', studiested: 'Bergen', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null, 47.5, 50.9),
      '2021': Y(3147, 622, 165, 40.4, 3046, 325,  48.6, 52.6),
      '2022': Y(2813, 580, 145, 43.3, 2729, 350,  49.0, 52.2),
      '2023': Y(2938, 632, 124, 41.6, 2825, 260,  51.0, 54.4),
      '2024': Y(3359, 738, 124, 44.6, 3224, 340,  50.9, 54.3),
      '2025': Y(3580, 752, 114, 46.4, 3452, 244,  51.7, 55.8),
      '2026': Y(3629, 789, 114, 48.0, 3501, 320,  51.3, 55.8),
    },
  },
  // ── HVL Haugesund ─────────────────────────────────────────────────────────
  {
    id: 'hvl_haugesund', shortName: 'HVL Hgsd.', institusjon: 'Høgskulen på Vestlandet',
    studiekode: '203404', studiested: 'Haugesund', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null, 32.3, 39.5),
      '2021': Y(726, 125, 97, 48.8, 651, 236,  33.0, 38.5),
      '2022': Y(598, 111, 92, 55.0, 537, 189,   0.0,  0.0),
      '2023': Y(476,  86, 80, 51.2, 418, 160,   0.0,  0.0),
      '2024': Y(541,  88, 80, 47.7, 493, 182,   0.0,  0.0),
      '2025': Y(564, 114, 80, 46.5, 489, 173,   0.0,  0.0),
      '2026': Y(613, 112, 80, 56.2, 549, 215,  33.3, 28.7),
    },
  },
  // ── HVL Sogndal ───────────────────────────────────────────────────────────
  {
    id: 'hvl_sogndal', shortName: 'HVL Sogndal', institusjon: 'Høgskulen på Vestlandet',
    studiekode: '203515', studiested: 'Sogndal', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null, 37.5, 38.6),
      '2021': Y(517,  77,  55, 40.3, 481, 126, 36.0, 39.3),
      '2022': Y(446,  65,  50, 33.8, 402, 119,  0.0,  0.0),
      '2023': Y(381,  62,  50, 30.6, 344, 122,  0.0,  0.0),
      '2024': Y(432,  54,  50, 31.5, 406, 115,  0.0,  0.0),
      '2025': Y(465,  63,  50, 41.3, 435, 132,  0.0,  0.0),
      '2026': Y(487,  66,  60, 31.8, 445, 142,  0.0,  0.0),
    },
  },
  // ── NLA Oslo ──────────────────────────────────────────────────────────────
  {
    id: 'nla_oslo', shortName: 'NLA Oslo', institusjon: 'NLA Høgskolen',
    studiekode: '254470', studiested: 'Oslo', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null, 41.6, 46.0),
      '2021': Y(1626, 133, 45, 29.3, 1512, 220,  42.6, 45.8),
      '2022': Y(1696, 168, 50, 39.3, 1567, 230,  42.0, 44.8),
      '2023': Y(1892, 156, 76, 32.1, 1683, 360,  42.1, 42.1),
      '2024': Y(1760, 136, 70, 30.1, 1582, 350,  40.7, 41.2),
      '2025': Y(1753, 158, 70, 24.7, 1550, 360,  39.5, 39.5),
      '2026': Y(1737, 160, 70, 26.9, 1533, 360,  38.9, 40.4),
    },
  },
  // ── NLA Bergen ────────────────────────────────────────────────────────────
  {
    id: 'nla_bergen', shortName: 'NLA Bergen', institusjon: 'NLA Høgskolen',
    studiekode: '254515', studiested: 'Bergen', type: 'bachelor',
    years: {
      '2024': Y(1445, 124, 20, 27.4, 1332, 160,  46.4, 48.2),
      '2025': Y(1504, 102, 25, 40.2, 1435, 160,  46.8, 48.4),
      '2026': Y(1610, 117, 25, 36.8, 1524, 180,  46.4, 47.5),
    },
  },
  // ── NLA Kristiansand ──────────────────────────────────────────────────────
  {
    id: 'nla_krs', shortName: 'NLA Krs.', institusjon: 'NLA Høgskolen',
    studiekode: '254035', studiested: 'Kristiansand', type: 'bachelor',
    years: {
      '2021': Y(536, 31, 25, 25.8, 493, 120,  38.6, 38.0),
      '2022': Y(636, 32, 30, 18.8, 577, 150,  36.0, 33.5),
      '2023': Y(652, 37, 38, 54.1, 548, 130,  38.2, 36.2),
      '2024': Y(545, 40, 35, 25.0, 481, 150,  36.3, 32.4),
      '2025': Y(610, 38, 25, 23.7, 548, 150,  36.3, 30.4),
      '2026': Y(605, 38, 25, 23.7, 538, 150,  36.2, 32.5),
    },
  },
  // ── HiØ ──────────────────────────────────────────────────────────────────
  {
    id: 'hiof', shortName: 'HiØ Halden', institusjon: 'Høgskolen i Østfold',
    studiekode: '224035', studiested: 'Halden', type: 'bachelor',
    years: {
      '2020': Y(null, null, null, null, null, null, 35.0, 41.5),
      '2021': Y(923, 144, 85, 40.3, 833, 172,  37.9, 42.2),
      '2022': Y(746, 127, 80, 37.8, 666, 162,  36.1, 38.5),
      '2023': Y(752, 122, 75, 36.9, 663, 172,  36.8, 37.7),
      '2024': Y(858, 147, 75, 27.2, 728, 241,   0.0,  0.0),
      '2025': Y(776, 126, 90, 34.9, 665, 193,   0.0,  0.0),
      '2026': Y(755, 159, 90, 38.4, 646, 239,   0.0,  0.0),
    },
  },
  // ── Himolde ───────────────────────────────────────────────────────────────
  {
    id: 'himolde', shortName: 'HiMolde', institusjon: 'Høgskolen i Molde',
    studiekode: '211369', studiested: 'Molde', type: 'bachelor',
    years: {
      '2021': Y(560, 97, 60, 53.6, 500, 160,  0, 0),
      '2022': Y(458, 91, 60, 47.3, 412, 126,  0, 0),
      '2023': Y(354, 64, 60, 59.4, 317, 101,  0, 0),
      '2024': Y(479, 89, 60, 39.3, 419, 128,  0, 0),
      '2025': Y(474, 69, 60, 44.9, 423, 139,  0, 0),
      '2026': Y(470, 79, 60, 36.7, 427, 128,  0, 0),
    },
  },
  // ── USN Siv ──────────────────────────────────────────────────────────────
  {
    id: 'usn_siv', shortName: 'USN Siv.', institusjon: 'Universitetet i Sørøst-Norge',
    studiekode: '222345', studiested: 'Ringerike', type: 'sivilokonom',
    years: {
      '2021': Y(464, 73, 40, 50.7, 323, 131,  0, 0),
      '2022': Y(362, 59, 40, 40.7, 244,  83,  0, 0),
      '2023': Y(338, 31, 40, 35.5, 213,  74,  0, 0),
      '2024': Y(288, 33, 40, 36.4, 199,  82,  0, 0),
      '2025': Y(321, 41, 40, 39.0, 222,  76,  0, 0),
      '2026': Y(328, 42, 40, 52.4, 219,  93,  0, 0),
    },
  },

  // ── HVL (samlet — Bergen · Haugesund · Sogndal) ───────────────────────────
  // Søkertall summert på tvers av studiestedene.
  // Poenggrenser gjenspeiler Bergen (høyeste krav). Søkerpress = stipulert 4,3.
  {
    id: 'hvl_combined',
    shortName: 'HVL',
    institusjon: 'Høgskulen på Vestlandet',
    studiekode: '203369 · 203404 · 203515',
    studiested: 'Bergen · Haugesund · Sogndal',
    type: 'bachelor',
    stipulatedSokerpress: 4.3,
    campuses: [
      { name: 'Bergen',    studiekode: '203369', alleS: 3629, fvS: 789, plasser: 114 },
      { name: 'Haugesund', studiekode: '203404', alleS:  613, fvS: 112, plasser:  80 },
      { name: 'Sogndal',   studiekode: '203515', alleS:  487, fvS:  66, plasser:  60 },
    ],
    years: {
      '2020': Y(null, null, null, null,  null,  null,  47.5, 50.9),
      '2021': Y(4390, 824,  317, 41.7,  4178,  687,   48.6, 52.6),
      '2022': Y(3857, 756,  287, 44.2,  3668,  658,   49.0, 52.2),
      '2023': Y(3795, 780,  254, 41.8,  3587,  542,   51.0, 54.4),
      '2024': Y(4332, 880,  254, 44.1,  4123,  637,   50.9, 54.3),
      '2025': Y(4609, 929,  244, 46.1,  4376,  549,   51.7, 55.8),
      '2026': Y(4729, 967,  254, 47.8,  4495,  677,   51.3, 55.8),
    },
  },

  // ── USN (samlet — Drammen · Hønefoss · Bø · Kongsberg) ───────────────────
  // Poenggrenser fra Drammen (høyeste krav). Søkertall mangler for Drammen;
  // øvrige campus 2024–2026. Søkerpress = stipulert 3,8.
  {
    id: 'usn_combined',
    shortName: 'USN',
    institusjon: 'Universitetet i Sørøst-Norge',
    studiekode: '222330 · 222097 · 222164 · 222625',
    studiested: 'Drammen · Hønefoss · Bø · Kongsberg',
    type: 'bachelor',
    stipulatedSokerpress: 3.8,
    campuses: [
      { name: 'Hønefoss',  studiekode: '222097', alleS: 167, fvS: 20, plasser: 20 },
      { name: 'Bø',        studiekode: '222164', alleS: 144, fvS: 29, plasser: 20 },
      { name: 'Drammen',   studiekode: '222330', alleS: null, fvS: null, plasser: null },
      { name: 'Kongsberg', studiekode: '222625', alleS: 224, fvS: 22, plasser: 25 },
    ],
    years: {
      '2020': Y(null, null, null, null, null, null, 41.7, 47.0),
      '2021': Y(null, null, null, null, null, null, 42.0, 47.2),
      '2022': Y(null, null, null, null, null, null, 40.0, 46.6),
      '2023': Y(null, null, null, null, null, null, 41.4, 45.5),
      '2024': Y( 341,  47,   40, null,  null, null, 40.1, 44.5),
      '2025': Y( 465,  60,   65, null,  null, null, 40.2, 43.7),
      '2026': Y( 535,  71,   65, null,  null, null, 40.8, 46.0),
    },
  },
];

export const ALL_YEARS = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'] as const;

export const DEFAULT_IDS = [
  'nhh', 'nmbu', 'ntnu', 'ntnu_siv', 'oslomet', 'uia', 'uia_siv',
  'uit', 'uis', 'inn', 'hvl_bergen', 'nord',
];
