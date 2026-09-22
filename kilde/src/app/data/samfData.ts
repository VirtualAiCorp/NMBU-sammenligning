// Søkertall og poenggrenser for Samfunnsøkonomi-programmer
// Kilde: CSV_samf_konomi_s_kertall___snitt.csv + CSV_OPPTAKSGRENSER

import type { FullAdmissionEntry, FullYearData } from './fullAdmissionData';

const Y = (
  alleS: number | null, fvS: number | null, plasser: number | null,
  kvinner: number | null, kvalifiserte: number | null, tilbud: number | null,
  pg_fv: number | null = null, pg_ord: number | null = null
): FullYearData => ({ alleS, fvS, plasser, kvinner, kvalifiserte, tilbud, pg_fv, pg_ord });

export const SAMF_DATA: FullAdmissionEntry[] = [
  // ── UiO bachelor ──────────────────────────────────────────────────────────
  {
    id: 'uio_samf', shortName: 'UiO', institusjon: 'Universitetet i Oslo',
    studiekode: '185898', studiested: 'Oslo', type: 'bachelor',
    years: {
      '2021': Y(1732, 224, 100, 33.9, 1659, 190, 48.7, 56.5),
      '2022': Y(1884, 249,  95, 36.5, 1830, 190, 49.5, 54.8),
      '2023': Y(2093, 237,  82, 36.3, 1988, 159, 50.0, 57.1),
      '2024': Y(2004, 255,  82, 36.5, 1926, 150, 50.0, 60.5),
      '2025': Y(1793, 270,  82, 41.9, 1603, 152, 50.3, 60.5),
      '2026': Y(1639, 218,  82, 40.8, 1483, 155, 50.5, 61.1),
    },
  },
  // ── UIB bachelor ──────────────────────────────────────────────────────────
  {
    id: 'uib_samf', shortName: 'UiB', institusjon: 'Universitetet i Bergen',
    studiekode: '184369', studiested: 'Bergen', type: 'bachelor',
    years: {
      '2021': Y(2008, 251, 108, 36.3, 1788, 266, 47.2, 49.7),
      '2022': Y(1829, 219, 113, 31.5, 1659, 281, 47.7, 49.4),
      '2023': Y(1949, 247, 107, 41.7, 1702, 261, 48.3, 50.5),
      '2024': Y(2123, 247, 101, 38.9, 1896, 246, 49.0, 51.8),
      '2025': Y(2021, 260, 101, 31.5, 1776, 247, 49.1, 52.4),
      '2026': Y(2294, 274, 101, 40.1, 2034, 242, 49.8, 53.1),
    },
  },
  // ── NMBU bachelor ─────────────────────────────────────────────────────────
  {
    id: 'nmbu_samf', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
    studiekode: '192468', studiested: 'Ås', type: 'bachelor',
    years: {
      '2021': Y(609,  58, 25, 41.4,  584, 60, 43.1, 52.3),
      '2022': Y(531,  41, 25, 46.3,  515, 56, 44.2, 48.8),
      '2023': Y(700,  68, 35, 38.2,  666, 68, 45.2, 48.4),
      '2024': Y(785,  56, 35, 26.8,  748, 80, 44.8, 48.0),
      '2025': Y(805,  63, 35, 22.2,  757, 102, 44.7, 47.5),
      '2026': Y(659,  48, 30, 33.3,  568, 68, 45.9, 48.4),
    },
  },
  // ── NTNU bachelor ─────────────────────────────────────────────────────────
  {
    id: 'ntnu_samf', shortName: 'NTNU', institusjon: 'NTNU',
    studiekode: '194898', studiested: 'Trondheim', type: 'bachelor',
    years: {
      '2021': Y(1971, 287, 100, 36.2, 1925, 220, 48.0, 52.6),
      '2022': Y(1879, 231, 100, 39.4, 1843, 200, 48.8, 54.2),
      '2023': Y(2104, 245, 100, 35.9, 2051, 200, 50.0, 55.6),
      '2024': Y(1963, 232, 100, 36.6, 1927, 200, 50.0, 56.5),
      '2025': Y(2191, 258, 100, 36.8, 2140, 200, 50.4, 57.0),
      '2026': Y(2369, 279, 100, 34.8, 2318, 200, 50.9, 56.7),
    },
  },
  // ── UiT (åpent opptak) ────────────────────────────────────────────────────
  {
    id: 'uit_samf', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet',
    studiekode: '186898', studiested: 'Tromsø', type: 'bachelor',
    years: {
      '2021': Y(464, 58, 60, 15.5, 432, 167, 0, 0),
      '2022': Y(401, 58, 60, 20.7, 366,  91, 0, 0),
      '2023': Y(314, 33, 60, 12.1, 281,  76, 0, 0),
      '2024': Y(380, 45, 60, 26.7, 352,  86, 0, 0),
      '2025': Y(299, 30, 50, 20.0, 283,  55, 0, 0),
      '2026': Y(292, 30, 50, 13.3, 272,  63, 0, 0),
    },
  },
  // ── UiO Økonomi og finans (185369) ───────────────────────────────────────
  {
    id: 'uio_finans', shortName: 'UiO Øk.Fin.', institusjon: 'Universitetet i Oslo',
    studiekode: '185369', studiested: 'Oslo', type: 'bachelor',
    years: {
      '2026': Y(3396, 583, 30, 26.6, null, null, 53.6, 63.4),
    },
  },
  // ── UiO Samfunnsøkonomisk analyse ─────────────────────────────────────────
  {
    id: 'uio_analyse', shortName: 'UiO Analyse', institusjon: 'Universitetet i Oslo',
    studiekode: '185698', studiested: 'Oslo', type: 'arsstudium',
    years: {
      '2021': Y(610, 114, 52, 43.0, 496, 100, 45.7, 55.5),
      '2022': Y(489,  93, 52, 46.2, 391, 100, 42.3, 52.6),
      '2023': Y(485,  76, 39, 46.1, 392,  81, 43.5, 54.5),
      '2024': Y(558,  85, 39, 48.2, 453,  84, 45.4, 57.4),
      '2025': Y(540,  93, 38, 40.9, 436,  80, 46.1, 57.5),
      '2026': Y(492,  72, 38, 43.1, 405,  75, 45.7, 57.6),
    },
  },
  // ── UIB master ────────────────────────────────────────────────────────────
  {
    id: 'uib_master', shortName: 'UiB Master', institusjon: 'Universitetet i Bergen',
    studiekode: '184698', studiested: 'Bergen', type: 'master',
    years: {
      '2021': Y(707, 60, 22, 35.0, 595, 72, 49.8, 53.3),
      '2022': Y(665, 41, 22, 34.1, 578, 75, 50.7, 52.5),
      '2023': Y(670, 45, 22, 42.2, 573, 76, 50.9, 53.9),
      '2024': Y(725, 53, 22, 39.6, 605, 70, 50.1, 53.5),
      '2025': Y(692, 51, 22, 47.1, 575, 69, 51.4, 53.1),
      '2026': Y(681, 47, 22, 48.9, 554, 57, 50.4, 53.2),
    },
  },
  // ── NTNU master ───────────────────────────────────────────────────────────
  {
    id: 'ntnu_master', shortName: 'NTNU Master', institusjon: 'NTNU',
    studiekode: '194818', studiested: 'Trondheim', type: 'master',
    years: {
      '2021': Y(736, 63, 25, 44.4, 591, 74, 48.4, 50.7),
      '2022': Y(706, 42, 25, 45.2, 592, 74, 49.4, 51.6),
      '2023': Y(776, 53, 25, 30.2, 657, 54, 51.9, 54.5),
      '2024': Y(767, 37, 25, 37.8, 664, 68, 51.2, 55.0),
      '2025': Y(900, 48, 25, 45.8, 774, 100, 49.8, 54.9),
      '2026': Y(944, 71, 25, 26.8, 802, 100, 50.2, 53.9),
    },
  },
];

export const SAMF_YEARS = ['2021', '2022', '2023', '2024', '2025', '2026'] as const;

export const BACHELOR_IDS = ['uio_samf', 'uib_samf', 'nmbu_samf', 'ntnu_samf', 'uit_samf', 'uio_finans'];
export const DEFAULT_SAMF_IDS = ['uio_samf', 'uib_samf', 'nmbu_samf', 'ntnu_samf', 'uio_finans'];
