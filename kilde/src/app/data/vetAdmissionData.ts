// GENERERT av scripts/build-landsam-data.py 2026-09-23 – ikke rediger for hånd.
// Kilder: Samordna opptak programtabell 2026 (søkertall 2021–2026) og SO poenggrenserapport (Tableau) 2020–2026, hovedopptak.
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
          '2020': Y(null, null, null, null, null, null, 57.2, 64.0),
          '2021': Y(1265, 600, 90, 90.3, 1035, 126, 57.3, 64.8),
          '2022': Y(1105, 514, 90, 91.4, 907, 144, 57.7, 64.4),
          '2023': Y(1005, 496, 90, 90.1, 784, 172, 56.3, 63.6),
          '2024': Y(973, 457, 80, 87.1, 793, 136, 55.7, 63.6),
          '2025': Y(897, 441, 90, 90.2, 729, 176, 53.5, 62.1),
          '2026': Y(1040, 460, 90, 87.6, 833, 165, 54.0, 63.0),
        },
      },
      {
        id: 'uio_medisin', shortName: 'UiO Medisin', institusjon: 'Universitetet i Oslo',
        studiekode: '185740', studiested: 'Oslo', type: 'master',
        url: 'https://www.uio.no/studier/program/medisin/',
        years: {
          '2020': Y(null, null, null, null, null, null, 61.6, 69.0),
          '2021': Y(3023, 1121, 120, 71.5, 2518, 135, 62.0, 69.5),
          '2022': Y(2697, 988, 120, 69.6, 2282, 135, 62.4, 69.6),
          '2023': Y(2512, 930, 120, 67.5, 2069, 135, 61.2, 70.2),
          '2024': Y(2111, 766, 115, 66.7, 1735, 145, 60.7, 69.7),
          '2025': Y(1800, 710, 110, 71.5, 1447, 150, 60.5, 69.6),
          '2026': Y(1733, 672, 117, 71.6, 1415, 170, 60.0, 69.0),
        },
      },
      {
        id: 'uib_medisin', shortName: 'UiB Medisin', institusjon: 'Universitetet i Bergen',
        studiekode: '184740', studiested: 'Bergen', type: 'master',
        url: 'https://www.uib.no/med',
        years: {
          '2020': Y(null, null, null, null, null, null, 60.1, 67.7),
          '2021': Y(3325, 838, 185, 74.1, 2848, 275, 60.5, 68.1),
          '2022': Y(3035, 749, 185, 76.0, 2662, 280, 60.8, 68.3),
          '2023': Y(2905, 705, 185, 73.5, 2510, 260, 60.1, 68.6),
          '2024': Y(2584, 629, 165, 75.2, 2240, 260, 59.4, 67.8),
          '2025': Y(2059, 493, 165, 77.3, 1761, 260, 58.5, 67.2),
          '2026': Y(2200, 567, 165, 72.7, 1926, 260, 59.0, 67.2),
        },
      },
      {
        id: 'ntnu_medisin', shortName: 'NTNU Medisin', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194740', studiested: 'Trondheim', type: 'master',
        url: 'https://www.ntnu.no/studier/cmed',
        years: {
          '2020': Y(null, null, null, null, null, null, 62.0, 67.9),
          '2021': Y(3161, 1027, 155, 71.1, 2692, 190, 62.0, 68.6),
          '2022': Y(2782, 802, 119, 73.3, 2442, 150, 62.5, 69.2),
          '2023': Y(2515, 777, 119, 71.4, 2144, 160, 62.2, 69.6),
          '2024': Y(1897, 574, 119, 75.8, 1660, 160, 61.7, 69.4),
          '2025': Y(1663, 571, 119, 73.6, 1416, 194, 61.0, 68.5),
          '2026': Y(1899, 671, 119, 75.9, 1640, 210, 60.8, 68.2),
        },
      },
      {
        id: 'uit_medisin', shortName: 'UiT Medisin', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '186740', studiested: 'Tromsø', type: 'master',
        url: 'https://uit.no/helsefak',
        years: {
          '2020': Y(null, null, null, null, null, null, 60.0, 67.6),
          '2021': Y(2965, 521, 136, 68.3, 2586, 180, 60.3, 68.0),
          '2022': Y(2684, 453, 151, 70.2, 2389, 220, 60.4, 68.2),
          '2023': Y(2590, 507, 181, 67.3, 2245, 240, 59.8, 68.2),
          '2024': Y(2047, 415, 181, 64.8, 1741, 260, 57.8, 66.8),
          '2025': Y(2167, 508, 181, 67.1, 1868, 260, 57.1, 66.0),
          '2026': Y(2158, 419, 151, 62.5, 1857, 250, 56.5, 65.8),
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
          '2020': Y(null, null, null, null, null, null, 46.4, 51.3),
          '2021': Y(682, 117, 30, 88.9, 390, 46, 48.9, 56.1),
          '2022': Y(550, 99, 30, 96.0, 313, 48, 48.5, 54.3),
          '2023': Y(509, 78, 30, 93.6, 286, 58, 45.1, 54.1),
          '2024': Y(522, 77, 30, 94.8, 263, 64, 40.5, 50.4),
          '2025': Y(456, 80, 34, 93.8, 236, 79, 0, 0),
          '2026': Y(453, 75, 30, 97.3, 215, 68, 0, 0),
        },
      },
      {
        id: 'nord_dyrepleie', shortName: 'Nord', institusjon: 'Nord universitet',
        studiekode: '204504', studiested: 'Bodø', type: 'bachelor',
        url: 'https://www.nord.no/studier/dyrepleie-bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 45.9, 51.8),
          '2021': Y(977, 228, 47, 94.7, 930, 114, 45.3, 50.8),
          '2022': Y(769, 181, 47, 96.1, 727, 150, 42.7, 46.3),
          '2023': Y(786, 173, 47, 95.4, 724, 170, 40.0, 45.7),
          '2024': Y(693, 138, 47, 95.7, 641, 170, 36.2, 43.1),
          '2025': Y(580, 119, 50, 94.1, 537, 187, 0, 0),
          '2026': Y(572, 125, 50, 95.2, 517, 187, 0, 0),
        },
      },
    ],
  },
];
