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
  pg_fv: number | null = null, pg_ord: number | null = null
): FullYearData => ({ alleS, fvS, plasser, kvinner, kvalifiserte, tilbud, pg_fv, pg_ord });

export const LANDSAM_YEARS = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'] as const;

export const LANDSAM_GROUPS: LandsamGroup[] = [
  {
    id: 'biologi', label: 'Biologi', level: 'bachelor',
    desc: 'Sammenligner NMBUs bachelor i biologi med breddebiologiutdanningene ved de andre universitetene.',
    note: 'Alle programmene tas opp gjennom Samordna opptak. UiOs «Biovitenskap» er UiOs samlede biologiprogram og den klart største av konkurrentene (156 plasser i 2026 mot NMBUs 60). UiBs molekylærbiologi er tatt med som svakere sammenligning (default false) fordi den er smalere enn et breddebiologiprogram. UiS\' «Biologisk kjemi» (studiekode 217860) er vraket av samme grunn – den ligger nærmere kjemi og bioteknologi enn biologi. Årsstudier i biologi (Nord 204184, UiA 201184/201373, NTNU 194184) er ikke tatt med, og heller ikke NMBUs egen bachelor i bioteknologi (192299), som hører til KBM-fakultetet.',
    nmbuIds: ['nmbu_biologi'], defaultIds: ['nmbu_biologi', 'uio_biovitenskap', 'uib_biologi', 'ntnu_biologi', 'uit_biologi', 'nord_biologi', 'uia_biologi'],
    entries: [
      {
        id: 'nmbu_biologi', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192327', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/biologi',
        years: {
          '2020': Y(null, null, null, null, null, null, 50.0, 53.1),
          '2021': Y(678, 112, 50, 63.4, 575, 70, 52.9, 54.3),
          '2022': Y(522, 76, 50, 69.7, 457, 74, 49.7, 51.0),
          '2023': Y(580, 84, 50, 71.4, 503, 88, 48.3, 46.9),
          '2024': Y(566, 85, 50, 72.9, 478, 100, 41.9, 42.8),
          '2025': Y(583, 85, 60, 69.4, 495, 91, 0, 0),
          '2026': Y(515, 91, 60, 52.7, 403, 89, 0, 0),
        },
      },
      {
        id: 'uio_biovitenskap', shortName: 'UiO', institusjon: 'Universitetet i Oslo',
        studiekode: '185327', studiested: 'Oslo', type: 'bachelor',
        url: 'https://www.uio.no/studier/program/biovitenskap/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(706, 148, 148, 58.8, 420, 143, 0, 0),
          '2022': Y(1109, 243, 160, 67.5, 931, 245, 44.0, 44.4),
          '2023': Y(1074, 185, 160, 62.2, 892, 250, 41.9, 39.6),
          '2024': Y(1092, 224, 157, 65.2, 885, 260, 40.8, 42.6),
          '2025': Y(958, 200, 156, 68.5, 767, 235, 0, 0),
          '2026': Y(962, 186, 156, 62.9, 745, 206, 0, 0),
        },
      },
      {
        id: 'uib_biologi', shortName: 'UiB Biologi', institusjon: 'Universitetet i Bergen',
        studiekode: '184327', studiested: 'Bergen', type: 'bachelor',
        url: 'https://www4.uib.no/studier/program/biologi-bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 43.0, 42.7),
          '2021': Y(887, 124, 99, 56.5, 740, 190, 42.3, 41.7),
          '2022': Y(818, 128, 99, 73.4, 675, 179, 0, 0),
          '2023': Y(751, 131, 99, 66.4, 622, 167, 0, 0),
          '2024': Y(716, 127, 99, 60.6, 586, 158, 0, 0),
          '2025': Y(689, 131, 99, 60.3, 551, 129, 0, 0),
          '2026': Y(646, 96, 99, 47.9, 492, 115, 0, 0),
        },
      },
      {
        id: 'ntnu_biologi', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194327', studiested: 'Trondheim', type: 'bachelor',
        url: 'https://www.ntnu.no/studier/bbi',
        years: {
          '2020': Y(null, null, null, null, null, null, 52.0, 52.4),
          '2021': Y(1005, 180, 85, 71.1, 906, 140, 51.5, 53.5),
          '2022': Y(975, 171, 85, 70.2, 888, 138, 54.1, 53.5),
          '2023': Y(880, 157, 75, 69.4, 793, 140, 52.4, 52.7),
          '2024': Y(862, 155, 75, 73.5, 762, 124, 51.5, 53.7),
          '2025': Y(860, 168, 75, 65.5, 771, 134, 50.7, 51.8),
          '2026': Y(891, 141, 75, 66.7, 753, 122, 49.8, 50.0),
        },
      },
      {
        id: 'uit_biologi', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '186327', studiested: 'Tromsø', type: 'bachelor',
        url: 'https://uit.no/utdanning/program/271262/biologi_-_bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(377, 51, 60, 58.8, 290, 76, 0, 0),
          '2022': Y(313, 50, 60, 60.0, 249, 44, 0, 0),
          '2023': Y(266, 35, 60, 65.7, 206, 36, 0, 0),
          '2024': Y(261, 47, 60, 72.3, 207, 46, 0, 0),
          '2025': Y(234, 39, 35, 69.2, 189, 40, 0, 0),
          '2026': Y(231, 32, 35, 62.5, 183, 28, 0, 0),
        },
      },
      {
        id: 'nord_biologi', shortName: 'Nord', institusjon: 'Nord universitet',
        studiekode: '204327', studiested: 'Bodø', type: 'bachelor',
        url: 'https://www.nord.no/studier/biologi-bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(194, 22, 30, 31.8, 130, 28, 0, 0),
          '2022': Y(164, 23, 20, 43.5, 112, 15, 0, 0),
          '2023': Y(129, 25, 30, 56.0, 87, 16, 0, 0),
          '2024': Y(98, 11, 20, 36.4, 64, 7, 0, 0),
          '2025': Y(101, 8, 20, 25.0, 66, 5, 0, 0),
          '2026': Y(113, 18, 10, 44.4, 64, 8, 0, 0),
        },
      },
      {
        id: 'uia_biologi', shortName: 'UiA', institusjon: 'Universitetet i Agder',
        studiekode: '201327', studiested: 'Kristiansand', type: 'bachelor',
        url: 'https://www.uia.no/studier/program/biologi-bachelor/',
        years: {
          '2020': Y(null, null, null, null, null, null, 43.7, 48.9),
          '2021': Y(303, 39, 35, 43.6, 248, 60, 40.4, 43.8),
          '2022': Y(296, 47, 40, 66.0, 224, 45, 0, 0),
          '2023': Y(257, 40, 40, 65.0, 189, 45, 0, 0),
          '2024': Y(220, 35, 40, 54.3, 154, 28, 0, 0),
          '2025': Y(205, 25, 30, 68.0, 146, 22, 0, 0),
          '2026': Y(197, 18, 30, 77.8, 140, 19, 0, 0),
        },
      },
      {
        id: 'uib_molekylaerbiologi', shortName: 'UiB Molekylærbiologi', institusjon: 'Universitetet i Bergen',
        studiekode: '184865', studiested: 'Bergen', type: 'bachelor',
        url: 'https://www4.uib.no/studier/program/molekylaerbiologi-bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 48.0, 49.3),
          '2021': Y(692, 93, 50, 77.4, 634, 88, 52.1, 50.9),
          '2022': Y(506, 71, 55, 73.2, 473, 98, 48.5, 44.4),
          '2023': Y(495, 74, 40, 74.3, 443, 74, 50.0, 48.5),
          '2024': Y(520, 66, 40, 77.3, 488, 71, 47.9, 48.6),
          '2025': Y(559, 63, 40, 69.8, 501, 79, 0, 0),
          '2026': Y(584, 74, 40, 73.0, 502, 71, 46.5, 45.9),
        },
      },
    ],
  },
  {
    id: 'husdyr', label: 'Husdyrvitenskap', level: 'bachelor',
    desc: 'Sammenligner NMBUs bachelor i husdyrvitenskap med de andre husdyr- og landbruksutdanningene på bachelornivå.',
    note: 'Nord universitet (Steinkjer) er den eneste andre institusjonen med en egen bachelor i husdyrvitenskap. INNs agronomibachelor på Blæstad dekker både husdyr- og planteproduksjon og er derfor en delvis konkurrent; den går igjen i plantegruppen. Nords bachelor i dyrepleie er tatt med som svakere sammenligning (default false) fordi den trekker på den samme dyreinteresserte søkergruppen, men leder til et annet yrke. Nords husdyrvelferd (studiekode 204421) er vraket fordi det er et årsstudium, ikke en grad. NMBUs egen bachelor i dyrepleie (192504) hører til Veterinærhøgskolen, ikke BIOVIT, og er ikke med.',
    nmbuIds: ['nmbu_husdyr'], defaultIds: ['nmbu_husdyr', 'nord_husdyr', 'inn_agronomi_husdyr'],
    entries: [
      {
        id: 'nmbu_husdyr', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192321', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/husdyrvitenskap',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(246, 30, 30, 80.0, 171, 49, 0, 0),
          '2022': Y(195, 33, 30, 84.8, 138, 39, 0, 0),
          '2023': Y(196, 26, 35, 80.8, 140, 27, 0, 0),
          '2024': Y(179, 23, 35, 78.3, 108, 21, 0, 0),
          '2025': Y(192, 21, 25, 85.7, 122, 17, 0, 0),
          '2026': Y(214, 36, 25, 75.0, 123, 19, 0, 0),
        },
      },
      {
        id: 'nord_husdyr', shortName: 'Nord Husdyrvitenskap', institusjon: 'Nord universitet',
        studiekode: '204321', studiested: 'Steinkjer', type: 'bachelor',
        url: 'https://www.nord.no/studier/husdyrvitenskap-bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(191, 21, 32, 71.4, 174, 46, 0, 0),
          '2022': Y(136, 22, 32, 72.7, 127, 34, 0, 0),
          '2023': Y(156, 20, 32, 70.0, 139, 26, 0, 0),
          '2024': Y(156, 26, 32, 84.6, 142, 32, 0, 0),
          '2025': Y(133, 31, 25, 80.6, 126, 36, 0, 0),
          '2026': Y(155, 33, 20, 72.7, 145, 35, 0, 0),
        },
      },
      {
        id: 'inn_agronomi_husdyr', shortName: 'INN Agronomi', institusjon: 'Universitetet i Innlandet',
        studiekode: '209320', studiested: 'Hamar', type: 'bachelor',
        url: 'https://www.inn.no/studier/vare-studier/bachelor-i-agronomi/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(329, 62, 25, 66.1, 287, 60, 41.3, 45.8),
          '2022': Y(266, 43, 25, 41.9, 247, 50, 36.3, 39.0),
          '2023': Y(254, 46, 25, 71.7, 224, 54, 0, 0),
          '2024': Y(233, 40, 25, 57.5, 200, 47, 0, 0),
          '2025': Y(237, 42, 25, 45.2, 214, 42, 0, 0),
          '2026': Y(245, 28, 25, 60.7, 217, 29, 0, 0),
        },
      },
      {
        id: 'nord_dyrepleie', shortName: 'Nord Dyrepleie', institusjon: 'Nord universitet',
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
  {
    id: 'plante', label: 'Plantevitenskap', level: 'bachelor',
    desc: 'Sammenligner NMBUs bachelor i plantevitenskap med agronomi- og landbruksutdanningene på bachelornivå.',
    note: 'Ingen andre institusjoner har et rent plantevitenskapsprogram; de nærmeste er Blæstad-utdanningene ved Universitetet i Innlandet, der agronomi dekker planteproduksjon som en av flere deler. Landbruksteknikk er tatt med som svakere sammenligning (default false) fordi den er teknisk og har en helt annen kjønnsfordeling (6,7–31 % kvinner blant førstevalgssøkerne). INNs «Jordbruk» (209730), «Jordbruk, deltid» (209733) og «Økologisk landbruk, deltid» (209409) er vraket fordi de er nettbaserte årsstudier, ikke bachelorgrader – deltidstilbudene har dessuten 120 og 300 plasser og en helt annen søkergruppe. Nords «Sirkulær bioøkonomi» (Steinkjer, 204738) er vraket fordi den bare hadde opptak i 2022 og 2023 og ikke lenger har en programside.',
    nmbuIds: ['nmbu_plante'], defaultIds: ['nmbu_plante', 'inn_agronomi'],
    entries: [
      {
        id: 'nmbu_plante', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192842', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/plantevitenskap',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(231, 44, 30, 56.8, 160, 45, 0, 0),
          '2022': Y(196, 34, 30, 52.9, 146, 32, 0, 0),
          '2023': Y(180, 25, 25, 44.0, 130, 19, 0, 0),
          '2024': Y(165, 24, 25, 58.3, 107, 13, 0, 0),
          '2025': Y(171, 31, 25, 61.3, 121, 26, 0, 0),
          '2026': Y(135, 26, 25, 73.1, 95, 22, 0, 0),
        },
      },
      {
        id: 'inn_agronomi', shortName: 'INN Agronomi', institusjon: 'Universitetet i Innlandet',
        studiekode: '209320', studiested: 'Hamar', type: 'bachelor',
        url: 'https://www.inn.no/studier/vare-studier/bachelor-i-agronomi/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(329, 62, 25, 66.1, 287, 60, 41.3, 45.8),
          '2022': Y(266, 43, 25, 41.9, 247, 50, 36.3, 39.0),
          '2023': Y(254, 46, 25, 71.7, 224, 54, 0, 0),
          '2024': Y(233, 40, 25, 57.5, 200, 47, 0, 0),
          '2025': Y(237, 42, 25, 45.2, 214, 42, 0, 0),
          '2026': Y(245, 28, 25, 60.7, 217, 29, 0, 0),
        },
      },
      {
        id: 'inn_landbruksteknikk', shortName: 'INN Landbruksteknikk', institusjon: 'Universitetet i Innlandet',
        studiekode: '209311', studiested: 'Hamar', type: 'bachelor',
        url: 'https://www.inn.no/studier/vare-studier/bachelor-i-landbruksteknikk/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(110, 17, 20, 17.6, 105, 31, 0, 0),
          '2022': Y(80, 13, 25, 15.4, 74, 17, 0, 0),
          '2023': Y(97, 21, 25, 4.8, 86, 20, 0, 0),
          '2024': Y(96, 15, 25, 26.7, 88, 20, 0, 0),
          '2025': Y(83, 15, 25, 6.7, 77, 19, 0, 0),
          '2026': Y(85, 16, 25, 31.2, 78, 16, 0, 0),
        },
      },
    ],
  },
  {
    id: 'akvakultur', label: 'Akvakultur', level: 'bachelor',
    desc: 'Sammenligner NMBUs bachelor i akvakultur med havbruks- og fiskeriutdanningene ved de andre institusjonene.',
    note: 'Nords «Havbruksdrift og ledelse» og NTNUs «Biomarin innovasjon» i Ålesund er de nærmeste bachelorkonkurrentene. UiTs fiskeri- og havbruksvitenskap og UiBs havbruk (sivilingeniør) og fiskehelse/akvamedisin er femårige integrerte mastere med andre opptakskrav og er derfor svakere sammenligninger (default false); det samme gjelder NTNUs havbruksingeniør, som krever R2 og fysikk. HVL har ingen akvakultur- eller havbruksutdanning i Samordna opptak i perioden 2021–2026.',
    nmbuIds: ['nmbu_akvakultur'], defaultIds: ['nmbu_akvakultur', 'nord_havbruksdrift', 'ntnu_biomarin'],
    entries: [
      {
        id: 'nmbu_akvakultur', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192298', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/akvakultur',
        years: {
          '2021': Y(466, 53, 25, 52.8, 331, 50, 44.9, 46.6),
          '2022': Y(395, 39, 25, 41.0, 262, 49, 0, 0),
          '2023': Y(369, 37, 30, 56.8, 255, 35, 0, 0),
          '2024': Y(363, 51, 30, 54.9, 247, 41, 0, 0),
          '2025': Y(337, 34, 30, 50.0, 234, 33, 0, 0),
          '2026': Y(338, 43, 30, 55.8, 205, 31, 0, 0),
        },
      },
      {
        id: 'nord_havbruksdrift', shortName: 'Nord', institusjon: 'Nord universitet',
        studiekode: '204867', studiested: 'Bodø', type: 'bachelor',
        url: 'https://www.nord.no/studier/havbruksdrift-og-ledelse-bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 44.4, 50.3),
          '2021': Y(874, 219, 50, 38.4, 844, 110, 44.2, 49.4),
          '2022': Y(716, 174, 50, 43.1, 688, 140, 42.2, 46.6),
          '2023': Y(795, 202, 50, 43.1, 740, 150, 42.2, 47.5),
          '2024': Y(692, 139, 50, 46.0, 654, 150, 39.2, 44.1),
          '2025': Y(582, 136, 50, 50.7, 546, 186, 0, 0),
          '2026': Y(633, 137, 50, 43.8, 588, 165, 35.0, 36.0),
        },
      },
      {
        id: 'ntnu_biomarin', shortName: 'NTNU Biomarin innovasjon', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194298', studiested: 'Ålesund', type: 'bachelor',
        url: 'https://www.ntnu.no/studier/298bmi',
        years: {
          '2020': Y(null, null, null, null, null, null, 44.6, 48.3),
          '2021': Y(995, 147, 40, 53.1, 970, 98, 46.7, 49.5),
          '2022': Y(782, 125, 35, 55.2, 753, 80, 49.5, 50.5),
          '2023': Y(742, 126, 35, 58.7, 703, 90, 48.1, 49.9),
          '2024': Y(835, 130, 40, 62.3, 805, 120, 46.8, 48.0),
          '2025': Y(784, 107, 43, 67.3, 751, 118, 45.9, 46.1),
          '2026': Y(733, 92, 43, 57.6, 698, 120, 42.4, 45.7),
        },
      },
      {
        id: 'ntnu_ing_havbruk', shortName: 'NTNU Ing. havbruk', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194021', studiested: 'Trondheim', type: 'bachelor',
        url: 'https://www.ntnu.no/studier/bihav',
        years: {
          '2020': Y(null, null, null, null, null, null, 49.2, 56.4),
          '2021': Y(554, 57, 35, 42.1, 445, 52, 49.2, 53.5),
          '2022': Y(627, 63, 35, 50.8, 486, 55, 48.7, 53.6),
          '2023': Y(627, 63, 35, 49.2, 480, 67, 49.8, 53.2),
          '2024': Y(715, 73, 45, 46.6, 550, 77, 49.3, 53.0),
          '2025': Y(741, 57, 45, 50.9, 581, 77, 47.6, 49.5),
          '2026': Y(733, 76, 45, 59.2, 560, 85, 46.9, 50.5),
        },
      },
      {
        id: 'uit_fiskeri_havbruk', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '186331', studiested: 'Tromsø', type: 'bachelor',
        url: 'https://uit.no/utdanning/program/269552/fiskeri-_og_havbruksvitenskap_-_master',
        years: {
          '2020': Y(null, null, null, null, null, null, 45.3, 50.0),
          '2021': Y(1067, 190, 45, 41.6, 1032, 115, 45.5, 50.0),
          '2022': Y(909, 164, 65, 44.5, 870, 110, 45.6, 49.8),
          '2023': Y(902, 135, 60, 50.4, 863, 140, 42.0, 48.0),
          '2024': Y(860, 142, 60, 57.0, 813, 150, 41.8, 44.6),
          '2025': Y(812, 142, 60, 50.0, 759, 160, 37.5, 43.3),
          '2026': Y(864, 125, 60, 47.2, 810, 160, 38.7, 42.9),
        },
      },
      {
        id: 'uib_havbruk', shortName: 'UiB Havbruk', institusjon: 'Universitetet i Bergen',
        studiekode: '184711', studiested: 'Bergen', type: 'master',
        url: 'https://www4.uib.no/studier/program/havbruk-integrert-masterprogram-sivilingenior',
        years: {
          '2020': Y(null, null, null, null, null, null, 42.4, 49.2),
          '2021': Y(235, 43, 20, 62.8, 137, 30, 0, 52.6),
          '2022': Y(430, 62, 20, 53.2, 270, 30, 48.2, 55.7),
          '2023': Y(398, 57, 20, 59.6, 263, 33, 51.9, 56.0),
          '2024': Y(388, 44, 20, 52.3, 264, 34, 49.7, 55.5),
          '2025': Y(373, 36, 20, 58.3, 246, 35, 46.4, 52.2),
          '2026': Y(390, 43, 20, 55.8, 239, 36, 47.3, 55.0),
        },
      },
      {
        id: 'uib_fiskehelse', shortName: 'UiB Fiskehelse', institusjon: 'Universitetet i Bergen',
        studiekode: '184827', studiested: 'Bergen', type: 'master',
        url: 'https://www4.uib.no/studier/program/fiskehelse-akvamedisin-profesjon',
        years: {
          '2020': Y(null, null, null, null, null, null, 46.3, 49.8),
          '2021': Y(364, 81, 28, 74.1, 324, 48, 47.2, 53.1),
          '2022': Y(464, 91, 28, 69.2, 417, 48, 50.5, 57.7),
          '2023': Y(421, 76, 25, 68.4, 369, 45, 52.0, 58.0),
          '2024': Y(420, 82, 25, 74.4, 373, 50, 50.1, 56.4),
          '2025': Y(370, 57, 25, 73.7, 301, 53, 44.0, 56.3),
          '2026': Y(401, 78, 25, 79.5, 337, 57, 45.8, 57.7),
        },
      },
    ],
  },
  {
    id: 'biologi2', label: 'Biologi (2-årig master)', level: 'master2',
    desc: 'Sammenligner de toårige masterne i biologi og biovitenskap med lokalt opptak.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere» (søknadsalternativer), kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (alle søknadsalternativer uansett prioritet; kvalifiserte = søknadsalternativer merket kvalifisert); tabellen svarte med serverfeil 22.09.2026 og ble hentet på nytt 23.09.2026. Studieplasser, førstevalgssøkere, kvinneandel og poenggrenser publiseres ikke per program i denne tabellen og står derfor som null. DBH har ikke rapportert høstopptaket 2026 ennå, så 2026 er tomt for alle programmene. UiO hadde våropptak i tillegg til høstopptaket til og med 2023, UiB har våropptak hvert år i perioden, og UiT hadde våropptak i 2021 og 2022; tallene for de årene er summen av vår- og høstopptaket. NMBUs biologimaster undervises på norsk; NTNUs og Nords tilsvarende mastere er engelskspråklige, og Nords «Biovitenskap» tas opp per studieretning (akvakultur, genomikk og marin økologi i Bodø, husdyrvitenskap og terrestrisk økologi i Steinkjer). UiOs biovitenskapsmaster er den største av konkurrentene.',
    nmbuIds: ['nmbu_biologi2'], defaultIds: ['nmbu_biologi2', 'uio_biovitenskap2', 'uib_biologi2', 'ntnu_biologi2', 'uit_biologi2', 'nord_biovitenskap2'],
    entries: [
      {
        id: 'nmbu_biologi2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/biologi',
        years: {
          '2021': Y(109, 39, null, 69.2, 83, 42, null, null),
          '2022': Y(115, 31, null, 77.4, 88, 41, null, null),
          '2023': Y(135, 47, null, 68.1, 107, 49, null, null),
          '2024': Y(121, 40, null, 72.5, 94, 50, null, null),
          '2025': Y(124, 35, null, 77.1, 105, 49, null, null),
        },
      },
      {
        id: 'uio_biovitenskap2', shortName: 'UiO', institusjon: 'Universitetet i Oslo',
        studiekode: '', studiested: 'Oslo', type: 'master2',
        url: 'https://www.uio.no/studier/program/biovitenskap-master/',
        years: {
          '2021': Y(1630, 743, null, 60.6, 452, 188, null, null),
          '2022': Y(1428, 649, null, 64.9, 373, 172, null, null),
          '2023': Y(1599, 707, null, 63.5, 382, 179, null, null),
          '2024': Y(1046, 434, null, 68.9, 382, 181, null, null),
          '2025': Y(1101, 464, null, 69.2, 372, 177, null, null),
        },
      },
      {
        id: 'uib_biologi2', shortName: 'UiB', institusjon: 'Universitetet i Bergen',
        studiekode: '', studiested: 'Bergen', type: 'master2',
        url: 'https://www4.uib.no/studier/program/biologi-master',
        years: {
          '2021': Y(454, 247, null, 66.0, 243, 108, null, null),
          '2022': Y(361, 212, null, 67.9, 139, 83, null, null),
          '2023': Y(350, 188, null, 70.2, 152, 82, null, null),
          '2024': Y(539, 308, null, 63.0, 287, 156, null, null),
          '2025': Y(296, 216, null, 66.7, 130, 102, null, null),
        },
      },
      {
        id: 'ntnu_biologi2', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        url: 'https://www.ntnu.no/studier/msbio',
        years: {
          '2021': Y(842, 313, null, 56.5, 332, 85, null, null),
          '2022': Y(869, 318, null, 50.9, 343, 66, null, null),
          '2023': Y(484, 218, null, 56.4, 173, 60, null, null),
          '2024': Y(256, 101, null, 49.5, 132, 57, null, null),
          '2025': Y(310, 123, null, 64.2, 153, 64, null, null),
        },
      },
      {
        id: 'uit_biologi2', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '', studiested: 'Tromsø', type: 'master2',
        url: 'https://uit.no/utdanning/program/269576/biologi_-_master',
        years: {
          '2021': Y(352, 253, null, 58.9, 124, 111, null, null),
          '2022': Y(645, 285, null, 61.1, 216, 104, null, null),
          '2023': Y(693, 288, null, 58.7, 310, 133, null, null),
          '2024': Y(508, 210, null, 63.3, 284, 128, null, null),
          '2025': Y(546, 231, null, 63.6, 275, 130, null, null),
        },
      },
      {
        id: 'nord_biovitenskap2', shortName: 'Nord', institusjon: 'Nord universitet',
        studiekode: '', studiested: 'Bodø', type: 'master2',
        url: 'https://www.nord.no/studier/biovitenskap-master',
        years: {
          '2021': Y(902, 328, null, 47.3, 224, 101, null, null),
          '2022': Y(1311, 454, null, 49.8, 236, 101, null, null),
          '2023': Y(1336, 423, null, 44.4, 276, 107, null, null),
          '2024': Y(327, 135, null, 57.0, 151, 72, null, null),
          '2025': Y(365, 146, null, 50.7, 170, 75, null, null),
        },
      },
    ],
  },
  {
    id: 'husdyr2', label: 'Husdyrvitenskap (2-årig master)', level: 'master2',
    desc: 'Sammenligner de toårige masterne i husdyrvitenskap med lokalt opptak.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere» (søknadsalternativer), kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (alle søknadsalternativer uansett prioritet; kvalifiserte = søknadsalternativer merket kvalifisert); tabellen svarte med serverfeil 22.09.2026 og ble hentet på nytt 23.09.2026. Studieplasser, førstevalgssøkere, kvinneandel og poenggrenser publiseres ikke per program i denne tabellen og står derfor som null. DBH har ikke rapportert høstopptaket 2026 ennå, så 2026 er tomt for alle programmene. DBH har bare én rad for EM-ABG i tabell 379, for 2025 (15 søknadsalternativer, alle kvalifisert, 15 tilbud); koden for 2021-2024 er ikke identifisert, og de årene står derfor som null i stedet for gjettet. Nords master i biovitenskap med studieretning husdyrvitenskap (Steinkjer) er den eneste direkte konkurrenten; den er engelskspråklig og tas opp per studieretning. NMBUs eget «European Master in Animal Biodiversity and Genomics» (EMABG) er en internasjonal fellesgrad med Erasmus Mundus-opptak og er tatt med som svakere sammenligning (default false).',
    nmbuIds: ['nmbu_husdyr2', 'nmbu_emabg'], defaultIds: ['nmbu_husdyr2', 'nord_husdyr2'],
    entries: [
      {
        id: 'nmbu_husdyr2', shortName: 'NMBU Husdyrvitenskap', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/husdyrvitenskap',
        years: {
          '2021': Y(196, 101, null, 44.6, 61, 32, null, null),
          '2022': Y(271, 162, null, 42.0, 85, 41, null, null),
          '2023': Y(214, 139, null, 46.8, 44, 34, null, null),
          '2024': Y(71, 42, null, 61.9, 27, 21, null, null),
          '2025': Y(86, 52, null, 53.8, 33, 26, null, null),
        },
      },
      {
        id: 'nord_husdyr2', shortName: 'Nord', institusjon: 'Nord universitet',
        studiekode: '', studiested: 'Steinkjer', type: 'master2',
        url: 'https://www.nord.no/studier/biovitenskap-master',
        years: {
          '2021': Y(902, 328, null, 47.3, 224, 101, null, null),
          '2022': Y(1311, 454, null, 49.8, 236, 101, null, null),
          '2023': Y(1336, 423, null, 44.4, 276, 107, null, null),
          '2024': Y(327, 135, null, 57.0, 151, 72, null, null),
          '2025': Y(365, 146, null, 50.7, 170, 75, null, null),
        },
      },
      {
        id: 'nmbu_emabg', shortName: 'NMBU EMABG', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/european-master-animal-biodiversity-and-genomics',
        years: {
          '2025': Y(15, 15, null, 60.0, 15, 15, null, null),
        },
      },
    ],
  },
  {
    id: 'plante2', label: 'Plantevitenskap (2-årig master)', level: 'master2',
    desc: 'Sammenligner de toårige masterne i plantevitenskap og jordbruk med lokalt opptak.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere» (søknadsalternativer), kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (alle søknadsalternativer uansett prioritet; kvalifiserte = søknadsalternativer merket kvalifisert); tabellen svarte med serverfeil 22.09.2026 og ble hentet på nytt 23.09.2026. Studieplasser, førstevalgssøkere, kvinneandel og poenggrenser publiseres ikke per program i denne tabellen og står derfor som null. DBH har ikke rapportert høstopptaket 2026 ennå, så 2026 er tomt for alle programmene. INNs master i bærekraftig jordbruk hadde første opptak i 2022, så 2021 står som null (ikke manglende data, men programmet fantes ikke). INNs master i bærekraftig jordbruk (Blæstad/Hamar) er den nærmeste konkurrenten. NMBUs egen agroøkologimaster er engelskspråklig og systemorientert og er tatt med som svakere sammenligning (default false) framfor å få en egen gruppe, siden den har den samme ene konkurrenten.',
    nmbuIds: ['nmbu_plante2', 'nmbu_agroekologi2'], defaultIds: ['nmbu_plante2', 'inn_baerekraftig_jordbruk'],
    entries: [
      {
        id: 'nmbu_plante2', shortName: 'NMBU Plantevitenskap', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/plantevitenskap',
        years: {
          '2021': Y(232, 111, null, 42.3, 63, 27, null, null),
          '2022': Y(240, 114, null, 48.2, 41, 23, null, null),
          '2023': Y(225, 143, null, 39.9, 35, 28, null, null),
          '2024': Y(87, 42, null, 50.0, 26, 21, null, null),
          '2025': Y(120, 75, null, 44.0, 50, 40, null, null),
        },
      },
      {
        id: 'inn_baerekraftig_jordbruk', shortName: 'INN', institusjon: 'Universitetet i Innlandet',
        studiekode: '', studiested: 'Hamar', type: 'master2',
        url: 'https://www.inn.no/studier/vare-studier/master-i-berekraftig-jordbruk/',
        years: {
          '2022': Y(37, 33, null, 63.6, 29, 29, null, null),
          '2023': Y(39, 36, null, 58.3, 33, 33, null, null),
          '2024': Y(41, 33, null, 69.7, 29, 28, null, null),
          '2025': Y(42, 31, null, 54.8, 22, 19, null, null),
        },
      },
      {
        id: 'nmbu_agroekologi2', shortName: 'NMBU Agroøkologi', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/agroecology',
        years: {
          '2021': Y(206, 113, null, 50.4, 50, 29, null, null),
          '2022': Y(233, 93, null, 43.0, 68, 31, null, null),
          '2023': Y(147, 78, null, 47.4, 24, 22, null, null),
          '2024': Y(54, 29, null, 62.1, 26, 19, null, null),
          '2025': Y(85, 42, null, 57.1, 34, 27, null, null),
        },
      },
    ],
  },
  {
    id: 'akvakultur2', label: 'Akvakultur (2-årig master)', level: 'master2',
    desc: 'Sammenligner de toårige masterne i akvakultur og havbruksvitenskap med lokalt opptak.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere» (søknadsalternativer), kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (alle søknadsalternativer uansett prioritet; kvalifiserte = søknadsalternativer merket kvalifisert); tabellen svarte med serverfeil 22.09.2026 og ble hentet på nytt 23.09.2026. Studieplasser, førstevalgssøkere, kvinneandel og poenggrenser publiseres ikke per program i denne tabellen og står derfor som null. DBH har ikke rapportert høstopptaket 2026 ennå, så 2026 er tomt for alle programmene. NMBUs akvakulturmaster er engelskspråklig. UiTs toårige master i fiskeri- og havbruksvitenskap (fiskerikandidat, 40 plasser, lokalt opptak med søknadskode 6006) er den største konkurrenten, og Nords master i biovitenskap med studieretning akvakultur (Bodø) den nærmeste faglig. UiTs akvamedisinmaster er tatt med som svakere sammenligning (default false) fordi den leder til autorisasjon som fiskehelsebiolog og har andre opptakskrav.',
    nmbuIds: ['nmbu_akvakultur2'], defaultIds: ['nmbu_akvakultur2', 'uit_fiskeri_havbruk2', 'nord_akvakultur2'],
    entries: [
      {
        id: 'nmbu_akvakultur2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/aquaculture',
        years: {
          '2021': Y(186, 83, null, 43.4, 69, 40, null, null),
          '2022': Y(221, 99, null, 43.4, 72, 45, null, null),
          '2023': Y(165, 88, null, 46.6, 45, 34, null, null),
          '2024': Y(92, 51, null, 64.7, 52, 46, null, null),
          '2025': Y(115, 58, null, 39.7, 60, 37, null, null),
        },
      },
      {
        id: 'uit_fiskeri_havbruk2', shortName: 'UiT Fiskeri og havbruk', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '', studiested: 'Tromsø', type: 'master2',
        url: 'https://uit.no/utdanning/program/268941/fiskeri-_og_havbruksvitenskap_-_master',
        years: {
          '2021': Y(94, 67, null, 59.7, 55, 52, null, null),
          '2022': Y(75, 72, null, 34.7, 58, 58, null, null),
          '2023': Y(81, 66, null, 45.5, 59, 59, null, null),
          '2024': Y(102, 94, null, 59.6, 77, 77, null, null),
          '2025': Y(91, 81, null, 45.7, 70, 65, null, null),
          '2026': Y(null, null, 40, null, null, null, null, null),
        },
      },
      {
        id: 'nord_akvakultur2', shortName: 'Nord', institusjon: 'Nord universitet',
        studiekode: '', studiested: 'Bodø', type: 'master2',
        url: 'https://www.nord.no/studier/biovitenskap-master',
        years: {
          '2021': Y(902, 328, null, 47.3, 224, 101, null, null),
          '2022': Y(1311, 454, null, 49.8, 236, 101, null, null),
          '2023': Y(1336, 423, null, 44.4, 276, 107, null, null),
          '2024': Y(327, 135, null, 57.0, 151, 72, null, null),
          '2025': Y(365, 146, null, 50.7, 170, 75, null, null),
        },
      },
      {
        id: 'uit_akvamedisin2', shortName: 'UiT Akvamedisin', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '', studiested: 'Tromsø', type: 'master',
        url: 'https://uit.no/utdanning/program/268952/akvamedisin_-_master',
        years: {
          '2021': Y(388, 51, null, 64.7, 340, 59, null, null),
          '2022': Y(349, 42, null, 76.2, 302, 70, null, null),
          '2023': Y(359, 48, null, 68.8, 295, 75, null, null),
          '2024': Y(305, 27, null, 77.8, 238, 41, null, null),
          '2025': Y(296, 28, null, 67.9, 210, 54, null, null),
        },
      },
    ],
  },
];
