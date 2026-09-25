// GENERERT av scripts/build-landsam-data.py 2026-09-25 – ikke rediger for hånd.
// Kilder: Samordna opptak programtabell 2026 (søkertall 2021–2026) og SO poenggrenserapport (Tableau) 2020–2026, hovedopptak; opptakspoeng (op_*/kp_*) fra DBH tabell 571.
// 0 i poenggrense = alle kvalifiserte kom inn · null = data ikke tilgjengelig
import type { FullAdmissionEntry, FullYearData } from './fullAdmissionData';

export type LandsamLevel = 'bachelor' | 'master5' | 'master2';

export interface LandsamGroup {
  id: string;
  label: string;
  level: LandsamLevel;
  desc: string;
  note?: string;
  nmbuIds: string[];
  defaultIds: string[];
  entries: FullAdmissionEntry[];
}

const Y = (
  alleS: number | null, fvS: number | null, plasser: number | null,
  kvinner: number | null, kvalifiserte: number | null, tilbud: number | null,
  pg_fv: number | null = null, pg_ord: number | null = null,
  akseptert: number | null = null, mott: number | null = null
): FullYearData => ({ alleS, fvS, plasser, kvinner, kvalifiserte, tilbud, pg_fv, pg_ord, akseptert, mott });

export const LANDSAM_YEARS = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'] as const;

export const LANDSAM_GROUPS: LandsamGroup[] = [
  {
    id: 'veterinaer', label: 'Veterinærmedisin', level: 'master5',
    desc: 'NMBUs seksårige profesjonsstudium i veterinærmedisin har ingen annen norsk veterinærutdanning å sammenligne seg med. Medisinstudiene ved UiO, UiB, NTNU og UiT er tatt med som referanse for søkertrykk og poenggrense på tilsvarende lange, konkurranseutsatte helsefagprofesjonsstudier.',
    note: 'NMBU er eneste tilbyder av veterinærmedisin i Norge, så programmet har ingen reell konkurrent i utdanningstilbudet. De fire medisinstudiene er lagt inn med default false og skal vises som referansepunkt for søkertrykk/poenggrense, ikke som konkurrenter – de er et annet fag med egne opptakskrav. Der en institusjon har flere studiesteder for medisin (f.eks. UiB Bergen/Stavanger, UiO Oslo/Innlandet, NTNU Trondheim/Levanger), er bare hovedstudiestedets studiekode tatt med.',
    nmbuIds: ['nmbu_veterinaermedisin'], defaultIds: ['nmbu_veterinaermedisin'],
    entries: [
      {
        id: 'nmbu_veterinaermedisin', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192772', studiested: 'Ås', type: 'master',
        url: 'https://www.nmbu.no/studier/veterinaermedisin-profesjonsstudium',
        years: {
          '2020': { ...Y(null, null, null, null, null, null, 57.2, 64.0), pgs_fv: 56.9, pgs_ord: 64.0, vl_fv: 344, vl_ord: 560, vls_fv: 222, vls_ord: 346 },
          '2021': { ...Y(1265, 600, 90, 90.3, 1035, 126, 57.3, 64.8), op_mott: 62.5, kp_mott: 54.3, op_fv: 57.3, op_alle: 57.4, n_mott: 77, pgs_fv: 56.9, pgs_ord: 64.6, vl_fv: 310, vl_ord: 551, vls_fv: 193, vls_ord: 340 },
          '2022': { ...Y(1105, 514, 90, 91.4, 907, 144, 57.7, 64.4), op_mott: 63.3, kp_mott: 54.2, op_fv: 57.9, op_alle: 58.0, n_mott: 81, pgs_fv: 57.7, pgs_ord: 64.4, vl_fv: 244, vl_ord: 420, vls_fv: 167, vls_ord: 283 },
          '2023': { ...Y(1005, 496, 90, 90.1, 784, 172, 56.3, 63.6), op_mott: 62.5, kp_mott: 53.7, op_fv: 57.6, op_alle: 57.5, n_mott: 82, pgs_fv: 56.3, pgs_ord: 63.6, vl_fv: 184, vl_ord: 341, vls_fv: 125, vls_ord: 236 },
          '2024': { ...Y(973, 457, 80, 87.1, 793, 136, 55.7, 63.6), op_mott: 62.6, kp_mott: 53.9, op_fv: 57.2, op_alle: 57.2, n_mott: 77, pgs_fv: 55.5, pgs_ord: 63.6, vl_fv: 184, vl_ord: 356, vls_fv: 101, vls_ord: 196 },
          '2025': { ...Y(897, 441, 90, 90.2, 729, 176, 53.5, 62.1), op_mott: 60.6, kp_mott: 52.6, op_fv: 56.4, op_alle: 56.3, n_mott: 82, pgs_fv: 53.4, pgs_ord: 62.1, vl_fv: 143, vl_ord: 284, vls_fv: 90, vls_ord: 181 },
          '2026': { ...Y(1040, 460, 90, 87.6, 833, 165, 54.0, 63.0), pgs_fv: 53.5, pgs_ord: 62.9, vl_fv: 196, vl_ord: 350, vls_fv: 114, vls_ord: 203 },
        },
      },
      {
        id: 'uio_medisin', shortName: 'UiO Medisin', institusjon: 'Universitetet i Oslo',
        studiekode: '185740', studiested: 'Oslo', type: 'master',
        url: 'https://www.uio.no/studier/program/medisin/',
        years: {
          '2020': { ...Y(null, null, null, null, null, null, 61.6, 69.0), pgs_fv: 61.6, pgs_ord: 69.0, vl_fv: 987, vl_ord: 1, vls_fv: 671, vls_ord: 1 },
          '2021': { ...Y(3023, 1121, 120, 71.5, 2518, 135, 62.0, 69.5), op_mott: 66.8, kp_mott: 57.8, op_fv: 61.5, op_alle: 61.6, n_mott: 93, pgs_fv: 62.0, pgs_ord: 69.5, vl_fv: 888, vl_ord: 1, vls_fv: 579, vls_ord: 1 },
          '2022': { ...Y(2697, 988, 120, 69.6, 2282, 135, 62.4, 69.6), op_mott: 66.8, kp_mott: 57.9, op_fv: 61.8, op_alle: 61.9, n_mott: 103, pgs_fv: 62.4, pgs_ord: 69.6, vl_fv: 793, vl_ord: 1, vls_fv: 528, vls_ord: 1 },
          '2023': { ...Y(2512, 930, 120, 67.5, 2069, 135, 61.2, 70.2), op_mott: 67.0, kp_mott: 57.6, op_fv: 61.6, op_alle: 61.8, n_mott: 97, pgs_fv: 60.8, pgs_ord: 70.1, vl_fv: 675, vl_ord: 1, vls_fv: 415, vls_ord: 878 },
          '2024': { ...Y(2111, 766, 115, 66.7, 1735, 145, 60.7, 69.7), op_mott: 66.7, kp_mott: 57.3, op_fv: 60.4, op_alle: 60.6, n_mott: 113, pgs_fv: 60.7, pgs_ord: 69.7, vl_fv: 497, vl_ord: 979, vls_fv: 324, vls_ord: 642 },
          '2025': { ...Y(1800, 710, 110, 71.5, 1447, 150, 60.5, 69.6), op_mott: 65.5, kp_mott: 56.7, op_fv: 60.4, op_alle: 60.8, n_mott: 126, pgs_fv: 60.5, pgs_ord: 69.6, vl_fv: 346, vl_ord: 741, vls_fv: 226, vls_ord: 497 },
          '2026': { ...Y(1733, 672, 117, 71.6, 1415, 170, 60.0, 69.0), pgs_fv: 60.0, pgs_ord: 69.0, vl_fv: 304, vl_ord: 670, vls_fv: 202, vls_ord: 441 },
        },
      },
      {
        id: 'uib_medisin', shortName: 'UiB Medisin', institusjon: 'Universitetet i Bergen',
        studiekode: '184740', studiested: 'Bergen', type: 'master',
        url: 'https://www.uib.no/med',
        years: {
          '2020': { ...Y(null, null, null, null, null, null, 60.1, 67.7), pgs_fv: 60.0, pgs_ord: 67.7, vl_fv: 1, vl_ord: 1, vls_fv: 702, vls_ord: 1 },
          '2021': { ...Y(3325, 838, 185, 74.1, 2848, 275, 60.5, 68.1), op_mott: 66.0, kp_mott: 56.9, op_fv: 61.2, op_alle: 61.1, n_mott: 127, pgs_fv: 60.4, pgs_ord: 68.1, vl_fv: 1, vl_ord: 1, vls_fv: 661, vls_ord: 1 },
          '2022': { ...Y(3035, 749, 185, 76.0, 2662, 280, 60.8, 68.3), op_mott: 66.4, kp_mott: 57.0, op_fv: 61.7, op_alle: 61.5, n_mott: 127, pgs_fv: 60.8, pgs_ord: 68.3, vl_fv: 951, vl_ord: 1, vls_fv: 631, vls_ord: 1 },
          '2023': { ...Y(2905, 705, 185, 73.5, 2510, 260, 60.1, 68.6), op_mott: 65.9, kp_mott: 56.7, op_fv: 61.9, op_alle: 61.5, n_mott: 134, pgs_fv: 59.8, pgs_ord: 68.3, vl_fv: 823, vl_ord: 1, vls_fv: 495, vls_ord: 905 },
          '2024': { ...Y(2584, 629, 165, 75.2, 2240, 260, 59.4, 67.8), op_mott: 65.6, kp_mott: 56.4, op_fv: 60.0, op_alle: 60.0, n_mott: 161, pgs_fv: 59.4, pgs_ord: 67.8, vl_fv: 670, vl_ord: 1, vls_fv: 436, vls_ord: 770 },
          '2025': { ...Y(2059, 493, 165, 77.3, 1761, 260, 58.5, 67.2), op_mott: 64.8, kp_mott: 55.7, op_fv: 60.7, op_alle: 60.6, n_mott: 189, pgs_fv: 58.4, pgs_ord: 67.2, vl_fv: 404, vl_ord: 808, vls_fv: 280, vls_ord: 556 },
          '2026': { ...Y(2200, 567, 165, 72.7, 1926, 260, 59.0, 67.2), pgs_fv: 58.9, pgs_ord: 67.2, vl_fv: 492, vl_ord: 934, vls_fv: 328, vls_ord: 622 },
        },
      },
      {
        id: 'ntnu_medisin', shortName: 'NTNU Medisin', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194740', studiested: 'Trondheim', type: 'master',
        url: 'https://www.ntnu.no/studier/cmed',
        years: {
          '2020': { ...Y(null, null, null, null, null, null, 62.0, 67.9), pgs_fv: 61.9, pgs_ord: 67.9, vl_fv: 1, vl_ord: 1, vls_fv: 687, vls_ord: 1 },
          '2021': { ...Y(3161, 1027, 155, 71.1, 2692, 190, 62.0, 68.6), op_mott: 66.9, kp_mott: 57.4, op_fv: 62.2, op_alle: 62.2, n_mott: 136, pgs_fv: 62.0, pgs_ord: 68.6, vl_fv: 928, vl_ord: 1, vls_fv: 606, vls_ord: 1 },
          '2022': { ...Y(2782, 802, 119, 73.3, 2442, 150, 62.5, 69.2), op_mott: 66.8, kp_mott: 57.7, op_fv: 60.4, op_alle: 60.4, n_mott: 134, pgs_fv: 62.5, pgs_ord: 69.2, vl_fv: 868, vl_ord: 1, vls_fv: 567, vls_ord: 994 },
          '2023': { ...Y(2515, 777, 119, 71.4, 2144, 160, 62.2, 69.6), op_mott: 67.1, kp_mott: 58.0, op_fv: 62.1, op_alle: 62.3, n_mott: 137, pgs_fv: 61.9, pgs_ord: 69.2, vl_fv: 720, vl_ord: 1, vls_fv: 426, vls_ord: 775 },
          '2024': { ...Y(1897, 574, 119, 75.8, 1660, 160, 61.7, 69.4), op_mott: 67.0, kp_mott: 57.2, op_fv: 62.3, op_alle: 62.6, n_mott: 161, pgs_fv: 61.6, pgs_ord: 69.4, vl_fv: 453, vl_ord: 852, vls_fv: 286, vls_ord: 548 },
          '2025': { ...Y(1663, 571, 119, 73.6, 1416, 194, 61.0, 68.5), op_mott: 66.2, kp_mott: 56.8, op_fv: 62.5, op_alle: 62.2, n_mott: 210, pgs_fv: 60.7, pgs_ord: 68.4, vl_fv: 350, vl_ord: 638, vls_fv: 202, vls_ord: 396 },
          '2026': { ...Y(1899, 671, 119, 75.9, 1640, 210, 60.8, 68.2), pgs_fv: 60.8, pgs_ord: 68.2, vl_fv: 410, vl_ord: 757, vls_fv: 242, vls_ord: 463 },
        },
      },
      {
        id: 'uit_medisin', shortName: 'UiT Medisin', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '186740', studiested: 'Tromsø', type: 'master',
        url: 'https://uit.no/helsefak',
        years: {
          '2020': { ...Y(null, null, null, null, null, null, 60.0, 67.6), pgs_fv: 60.0, pgs_ord: 67.6, vl_fv: 1, vl_ord: 1, vls_fv: 693, vls_ord: 1 },
          '2021': { ...Y(2965, 521, 136, 68.3, 2586, 180, 60.3, 68.0), op_mott: 62.5, kp_mott: 53.6, op_fv: 58.7, op_alle: 58.6, n_mott: 113, pgs_fv: 60.3, pgs_ord: 68.0, vl_fv: 873, vl_ord: 1, vls_fv: 590, vls_ord: 1 },
          '2022': { ...Y(2684, 453, 151, 70.2, 2389, 220, 60.4, 68.2), op_mott: 62.5, kp_mott: 53.4, op_fv: 59.3, op_alle: 59.2, n_mott: 103, pgs_fv: 60.4, pgs_ord: 68.2, vl_fv: 766, vl_ord: 1, vls_fv: 528, vls_ord: 933 },
          '2023': { ...Y(2590, 507, 181, 67.3, 2245, 240, 59.8, 68.2), op_mott: 60.9, kp_mott: 52.1, op_fv: 58.7, op_alle: 58.6, n_mott: 124, pgs_fv: 59.8, pgs_ord: 68.2, vl_fv: 671, vl_ord: 1, vls_fv: 444, vls_ord: 831 },
          '2024': { ...Y(2047, 415, 181, 64.8, 1741, 260, 57.8, 66.8), op_mott: 59.8, kp_mott: 51.4, op_fv: 58.0, op_alle: 58.4, n_mott: 130, pgs_fv: 57.8, pgs_ord: 66.8, vl_fv: 398, vl_ord: 817, vls_fv: 280, vls_ord: 556 },
          '2025': { ...Y(2167, 508, 181, 67.1, 1868, 260, 57.1, 66.0), op_mott: 58.4, kp_mott: 50.6, op_fv: 57.0, op_alle: 56.9, n_mott: 135, pgs_fv: 57.1, pgs_ord: 66.0, vl_fv: 472, vl_ord: 891, vls_fv: 339, vls_ord: 625 },
          '2026': { ...Y(2158, 419, 151, 62.5, 1857, 250, 56.5, 65.8), pgs_fv: 56.5, pgs_ord: 65.8, vl_fv: 443, vl_ord: 924, vls_fv: 323, vls_ord: 640 },
        },
      },
    ],
  },
  {
    id: 'dyrepleie', label: 'Dyrepleie', level: 'bachelor',
    desc: 'Sammenligner NMBUs bachelor i dyrepleie med Nord universitets bachelor i dyrepleie – de eneste to dyrepleieutdanningene i Norge.',
    note: 'Kontrollert mot SO-tabellen (utdanningstype «Helsefag - veterinær»): bare NMBU og Nord universitet tilbyr dyrepleie i Norge. Nord sitt program ligger i Bodø under Fakultet for biovitenskap og akvakultur (FBA), DBH-programkode BADYR.',
    nmbuIds: ['nmbu_dyrepleie'], defaultIds: ['nmbu_dyrepleie', 'nord_dyrepleie'],
    entries: [
      {
        id: 'nmbu_dyrepleie', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192504', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/dyrepleie',
        years: {
          '2020': { ...Y(null, null, null, null, null, null, 46.4, 51.3), pgs_fv: 45.0, pgs_ord: 50.6, vl_fv: 39, vl_ord: 73, vls_fv: 20, vls_ord: 40 },
          '2021': { ...Y(682, 117, 30, 88.9, 390, 46, 48.9, 56.1), op_mott: 55.8, kp_mott: 46.9, op_fv: 51.5, op_alle: 53.7, n_mott: 24, pgs_fv: 47.9, pgs_ord: 53.0, vl_fv: 56, vl_ord: 112, vls_fv: 25, vls_ord: 49 },
          '2022': { ...Y(550, 99, 30, 96.0, 313, 48, 48.5, 54.3), op_mott: 55.4, kp_mott: 47.3, op_fv: 53.1, op_alle: 54.1, n_mott: 28, pgs_fv: 48.5, pgs_ord: 53.6, vl_fv: 39, vl_ord: 61, vls_fv: 22, vls_ord: 35 },
          '2023': { ...Y(509, 78, 30, 93.6, 286, 58, 45.1, 54.1), op_mott: 52.0, kp_mott: 44.0, op_fv: 53.1, op_alle: 53.6, n_mott: 25, pgs_fv: 39.6, pgs_ord: 51.7, vl_fv: 14, vl_ord: 32, vls_fv: 2, vls_ord: 8 },
          '2024': { ...Y(522, 77, 30, 94.8, 263, 64, 40.5, 50.4), op_mott: 52.0, kp_mott: 44.8, op_fv: 51.0, op_alle: 54.4, n_mott: 27, pgs_fv: 0.0, pgs_ord: 0.0, vl_fv: 5, vl_ord: 17, vls_fv: 0, vls_ord: 0 },
          '2025': { ...Y(456, 80, 34, 93.8, 236, 79, 0, 0), op_mott: 49.9, kp_mott: 42.2, op_fv: 52.2, op_alle: 53.1, n_mott: 38, pgs_fv: 0.0, pgs_ord: 0.0, vl_fv: 0, vl_ord: 0, vls_fv: 0, vls_ord: 0 },
          '2026': { ...Y(453, 75, 30, 97.3, 215, 68, 0, 0), pgs_fv: 0.0, pgs_ord: 0.0, vl_fv: 0, vl_ord: 0, vls_fv: 0, vls_ord: 0 },
        },
      },
      {
        id: 'nord_dyrepleie', shortName: 'Nord', institusjon: 'Nord universitet',
        studiekode: '204504', studiested: 'Bodø', type: 'bachelor',
        url: 'https://www.nord.no/studier/dyrepleie-bachelor',
        years: {
          '2020': { ...Y(null, null, null, null, null, null, 45.9, 51.8), pgs_fv: 44.8, pgs_ord: 51.3, vl_fv: 194, vl_ord: 409, vls_fv: 93, vls_ord: 209 },
          '2021': { ...Y(977, 228, 47, 94.7, 930, 114, 45.3, 50.8), op_mott: 51.9, kp_mott: 46.2, op_fv: 46.1, op_alle: 46.2, n_mott: 32, pgs_fv: 45.0, pgs_ord: 50.6, vl_fv: 167, vl_ord: 361, vls_fv: 71, vls_ord: 155 },
          '2022': { ...Y(769, 181, 47, 96.1, 727, 150, 42.7, 46.3), op_mott: 49.0, kp_mott: 43.8, op_fv: 45.4, op_alle: 46.0, n_mott: 30, pgs_fv: 42.7, pgs_ord: 46.3, vl_fv: 77, vl_ord: 163, vls_fv: 36, vls_ord: 83 },
          '2023': { ...Y(786, 173, 47, 95.4, 724, 170, 40.0, 45.7), op_mott: 49.0, kp_mott: 43.7, op_fv: 46.0, op_alle: 46.3, n_mott: 39, pgs_fv: 40.0, pgs_ord: 45.7, vl_fv: 53, vl_ord: 116, vls_fv: 22, vls_ord: 61 },
          '2024': { ...Y(693, 138, 47, 95.7, 641, 170, 36.2, 43.1), op_mott: 48.5, kp_mott: 42.7, op_fv: 46.0, op_alle: 45.5, n_mott: 33, pgs_fv: 36.2, pgs_ord: 43.1, vl_fv: 24, vl_ord: 63, vls_fv: 6, vls_ord: 23 },
          '2025': { ...Y(580, 119, 50, 94.1, 537, 187, 0, 0), op_mott: 45.3, kp_mott: 40.2, op_fv: 46.4, op_alle: 45.8, n_mott: 43, pgs_fv: 0.0, pgs_ord: 0.0, vl_fv: 0, vl_ord: 0, vls_fv: 0, vls_ord: 0 },
          '2026': { ...Y(572, 125, 50, 95.2, 517, 187, 0, 0), pgs_fv: 0.0, pgs_ord: 0.0, vl_fv: 0, vl_ord: 0, vls_fv: 0, vls_ord: 0 },
        },
      },
    ],
  },
];
