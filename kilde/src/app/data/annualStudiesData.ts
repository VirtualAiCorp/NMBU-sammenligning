// Søkertall og poenggrenser for årsstudier / deltidsstudier innen ØKADM
// Kilde: Samordna Opptak / HKDIR · CSV: A_rsstudier_sammenligning_CSV.csv
// 0 = alle kvalifiserte kom inn · null = data ikke tilgjengelig

import { type FullYearData, type FullAdmissionEntry } from './fullAdmissionData';

const Y = (
  alleS: number | null, fvS: number | null, plasser: number | null,
  kvinner: number | null, kvalifiserte: number | null, tilbud: number | null,
  pg_fv: number | null = null, pg_ord: number | null = null
): FullYearData => ({ alleS, fvS, plasser, kvinner, kvalifiserte, tilbud, pg_fv, pg_ord });

export const ANNUAL_STUDIES_DATA: FullAdmissionEntry[] = [
  // ── NMBU · Bærekraftig økonomi og ledelse, deltid (FOKUS) ────────────────
  {
    id: 'nmbu_deltid',
    shortName: 'NMBU',
    institusjon: 'Norges miljø- og biovitenskapelige universitet',
    studiekode: '192253',
    studiested: 'Ås',
    type: 'deltid',
    years: {
      '2023': Y(3087, 1026, 200,  67.7, 2949, 1478, 0, 0),
      '2024': Y(3312, 1134, 950,  63.7, 3159, 1596, 0, 0),
      '2025': Y(2958, 1038, 950,  65.2, 2817, 1393, 0, 0),
      '2026': Y(3046,  986, 950,  64.6, 2899, 1391, 0, 0),
    },
  },
  // ── UiT · Ledelse, deltid (Alta) ─────────────────────────────────────────
  {
    id: 'uit_ledelse',
    shortName: 'UiT Ledelse',
    institusjon: 'UiT Norges arktiske universitet',
    studiekode: '186664',
    studiested: 'Alta',
    type: 'deltid',
    years: {
      '2021': Y(3053, 1228, 800, 62.9, 2907, 1100,  0, 45.6),
      '2022': Y(2801,  965, 800, 64.9, 2680, 1200,  0, 40.2),
      '2023': Y(3445, 1287, 800, 64.2, 3291, 1100,  0, 46.7),
      '2024': Y(3865, 1416, 800, 62.8, 3706, 1200,  0, 47.3),
      '2025': Y(3667, 1214, 700, 62.9, 3544, 1200,  0, 46.2),
      '2026': Y(3099,  668, 700, 61.8, 2979, 1200,  0, 39.2),
    },
  },
  // ── INN · Organisasjon og ledelse, deltid nettbasert (Åmot) ──────────────
  {
    id: 'inn_org_ledelse',
    shortName: 'INN Org.led.',
    institusjon: 'Universitetet i Innlandet',
    studiekode: '209583',
    studiested: 'Åmot',
    type: 'nettbasert',
    years: {
      '2022': Y(3299, 1417, 200, 69.3, 3138, 400,  0, 55.2),
      '2023': Y(3253, 1404, 220, 74.6, 3097, 440,  0, 55.2),
      '2024': Y(3479, 1295, 200, 71.2, 3331, 385,  0, 56.1),
      '2025': Y(3255, 1206, 250, 75.2, 3138, 600,  0, 53.5),
      '2026': Y(3227, 1007, 350, 71.8, 3078, 620,  0, 52.6),
    },
  },
  // ── NTNU · Økonomi og ledelse, deltid (Gjøvik) ───────────────────────────
  {
    id: 'ntnu_deltid',
    shortName: 'NTNU Gjøvik',
    institusjon: 'NTNU',
    studiekode: '194583',
    studiested: 'Gjøvik',
    type: 'deltid',
    years: {
      '2025': Y(3567, 846, 50, 55.2, 3409, 200, 0, 61.5),
      '2026': Y(2749, 703, 50, 54.6, 2633, 230, 0, 61.1),
    },
  },
  // ── Nord · HR-ledelse, deltid (Bodø) ─────────────────────────────────────
  {
    id: 'nord_hr',
    shortName: 'Nord HR',
    institusjon: 'Nord universitet',
    studiekode: '204158',
    studiested: 'Bodø',
    type: 'deltid',
    years: {
      '2026': Y(4030, 1396, 40, 83.1, 3838, 70, 37.0, 63.9),
    },
  },
  // ── INN · Bedriftsøkonomi, deltid (Åmot) ─────────────────────────────────
  {
    id: 'inn_bedrøk',
    shortName: 'INN Bedriftsøk.',
    institusjon: 'Universitetet i Innlandet',
    studiekode: '209207',
    studiested: 'Åmot',
    type: 'deltid',
    years: {
      '2022': Y(1353, 297,  50, 57.2, 1270, 130, 0, 54.1),
      '2023': Y(1243, 234,  65, 54.7, 1174, 140, 0, 52.9),
      '2024': Y(1811, 376,  65, 58.0, 1703, 120, 0, 58.6),
      '2025': Y(1344, 248,  65, 57.7, 1273, 130, 0, 53.8),
      '2026': Y(1586, 294,  65, 58.5, 1482, 135, 0, 57.6),
    },
  },
  // ── INN · Offentlig styring, ledelse og økonomi, deltid (Åmot) ───────────
  {
    id: 'inn_offentlig',
    shortName: 'INN Off.sty.',
    institusjon: 'Universitetet i Innlandet',
    studiekode: '209215',
    studiested: 'Åmot',
    type: 'deltid',
    years: {
      '2021': Y( 777, 153, 80, 64.1,  738, 190, 0, 43.9),
      '2022': Y( 519,  94, 80, 61.7,  491, 178, 0,  0.0),
      '2023': Y( 576, 114, 80, 57.0,  546, 202, 0,  0.0),
      '2024': Y( 657, 108, 80, 52.8,  627, 160, 0, 44.0),
      '2026': Y(2245, 334, 80, 68.6, 2167, 200, 0, 53.2),
    },
  },
  // ── UiT · Bedriftsøkonomi, deltid (Alta) ─────────────────────────────────
  {
    id: 'uit_bedrøk',
    shortName: 'UiT Bedriftsøk.',
    institusjon: 'UiT Norges arktiske universitet',
    studiekode: '186164',
    studiested: 'Alta',
    type: 'deltid',
    years: {
      '2021': Y(1662, 404, 400, 56.2, 1545,  659, 0, 0),
      '2022': Y(1339, 298, 400, 48.3, 1253,  448, 0, 0),
      '2023': Y(1756, 374, 400, 55.9, 1632,  549, 0, 0),
      '2024': Y(2073, 413, 400, 53.5, 1962,  761, 0, 0),
      '2025': Y(1729, 272, 400, 50.4, 1633,  564, 0, 0),
      '2026': Y(1505, 235, 400, 51.5, 1425,  482, 0, 0),
    },
  },
  // ── HiMolde · Logistikk (Molde) ──────────────────────────────────────────
  {
    id: 'him_logistikk',
    shortName: 'HiMolde',
    institusjon: 'Høgskolen i Molde',
    studiekode: '211627',
    studiested: 'Molde',
    type: 'arsstudium',
    years: {
      '2023': Y(1322, 321,  50, 55.8, 1231,  453, 0, 0),
      '2024': Y(1440, 404, 400, 55.0, 1355,  574, 0, 0),
      '2025': Y(1682, 554, 300, 47.7, 1590,  689, 0, 0),
      '2026': Y(1827, 585, 300, 48.0, 1732,  758, 0, 0),
    },
  },
  // ── NLA · Bærekraftig entreprenørskap og innovasjon (Oslo) ───────────────
  {
    id: 'nla_baerekraft',
    shortName: 'NLA',
    institusjon: 'NLA Høgskolen',
    studiekode: '254393',
    studiested: 'Oslo',
    type: 'arsstudium',
    years: {
      '2024': Y(1527, 158, 25, 57.0, 1409, 250, 0, 46.0),
      '2025': Y(1342, 153, 25, 58.8, 1266, 277, 0,  0.0),
      '2026': Y(1178, 108, 25, 56.5, 1104, 265, 0,  0.0),
    },
  },
  // ── UiS · Økonomi og jus (Stavanger) ─────────────────────────────────────
  {
    id: 'uis_okjus',
    shortName: 'UiS Øk.&jus',
    institusjon: 'Universitetet i Stavanger',
    studiekode: '217097',
    studiested: 'Stavanger',
    type: 'arsstudium',
    years: {
      '2026': Y(3513, 955, 90, 59.6, 3357, 400, 31.9, 59.2),
    },
  },
];

export const ANNUAL_YEARS = ['2021', '2022', '2023', '2024', '2025', '2026'];

export const ANNUAL_DEFAULT_IDS = [
  'nmbu_deltid', 'uit_ledelse', 'inn_org_ledelse', 'ntnu_deltid',
  'nord_hr', 'inn_bedrøk', 'uis_okjus',
];
