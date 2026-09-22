// GENERERT av scripts/build-landsam-data.py 2026-09-22 – ikke rediger for hånd.
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
    id: 'eiendom', label: 'Eiendom', level: 'master5',
    desc: 'Sammenligner NMBUs femårige eiendomsmaster med andre utdanninger innen landmåling, eiendomsfag og eiendomsmegling.',
    note: 'Bare NMBU tilbyr et femårig masterløp i eiendomsfag; HVLs landmåling og eiendomsdesign er nærmeste faglige konkurrent, mens bachelorene i eiendomsmegling er tatt med som svakere sammenligning (default false).',
    nmbuIds: ['nmbu_eiendom'], defaultIds: ['nmbu_eiendom', 'hvl_landmaling'],
    entries: [
      {
        id: 'nmbu_eiendom', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192230', studiested: 'Ås', type: 'master',
        years: {
          '2020': Y(null, null, null, null, null, null, 44.3, 51.8),
          '2021': Y(701, 135, 38, 36.3, 675, 60, 47.0, 56.8),
          '2022': Y(614, 108, 38, 40.7, 600, 62, 48.6, 55.3),
          '2023': Y(688, 123, 38, 38.2, 656, 94, 47.2, 50.3),
          '2024': Y(695, 138, 38, 44.9, 663, 96, 47.5, 51.9),
          '2025': Y(706, 143, 38, 37.8, 677, 116, 44.4, 49.6),
          '2026': Y(925, 169, 40, 45.0, 871, 124, 46.2, 51.4),
        },
      },
      {
        id: 'hvl_landmaling', shortName: 'HVL Bergen', institusjon: 'Høgskulen på Vestlandet',
        studiekode: '203753', studiested: 'Bergen', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 41.1, 48.0),
          '2021': Y(796, 133, 50, 33.1, 764, 120, 41.7, 48.7),
          '2022': Y(759, 130, 55, 36.2, 740, 154, 38.0, 46.1),
          '2023': Y(739, 124, 55, 37.1, 695, 142, 41.0, 46.0),
          '2024': Y(778, 151, 55, 36.4, 741, 192, 39.5, 45.0),
          '2025': Y(927, 185, 80, 36.2, 893, 190, 41.4, 45.1),
          '2026': Y(1161, 235, 80, 44.3, 1108, 190, 42.9, 48.9),
        },
      },
      {
        id: 'hvl_eiendomsmegling', shortName: 'HVL Sogndal', institusjon: 'Høgskulen på Vestlandet',
        studiekode: '203368', studiested: 'Sogndal', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 35.7, 36.8),
          '2021': Y(1213, 142, 40, 41.5, 1120, 170, 39.5, 41.9),
          '2022': Y(1185, 137, 40, 38.7, 1110, 268, 37.5, 35.8),
          '2023': Y(1170, 140, 40, 44.3, 1071, 345, 0, 0),
          '2024': Y(1012, 116, 40, 37.1, 887, 265, 0, 0),
          '2025': Y(1284, 182, 40, 36.3, 1151, 248, 39.2, 35.4),
          '2026': Y(1520, 186, 40, 42.5, 1373, 240, 41.2, 38.8),
        },
      },
      {
        id: 'nord_eiendomsmegling', shortName: 'Nord', institusjon: 'Nord universitet',
        studiekode: '204368', studiested: 'Bodø', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 39.1, 42.4),
          '2021': Y(996, 147, 30, 32.0, 919, 130, 41.4, 43.1),
          '2022': Y(877, 110, 30, 32.7, 827, 140, 41.6, 40.0),
          '2023': Y(893, 127, 30, 32.3, 817, 140, 39.1, 41.0),
          '2024': Y(813, 109, 30, 33.0, 727, 140, 39.2, 37.9),
          '2025': Y(786, 95, 30, 28.4, 702, 170, 33.8, 28.5),
          '2026': Y(902, 142, 30, 29.6, 792, 150, 39.6, 38.1),
        },
      },
      {
        id: 'inn_eiendomsmegling', shortName: 'INN', institusjon: 'Universitetet i Innlandet',
        studiekode: '209368', studiested: 'Åmot', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 32.5, 35.4),
          '2021': Y(1115, 206, 50, 43.2, 1001, 150, 38.1, 43.8),
          '2022': Y(975, 142, 40, 38.0, 911, 160, 38.0, 39.3),
          '2023': Y(944, 151, 50, 35.1, 830, 180, 36.7, 37.8),
        },
      },
      {
        id: 'usn_eiendomsmegling', shortName: 'USN', institusjon: 'Universitetet i Sørøst-Norge',
        studiekode: '222368', studiested: 'Midt-Telemark', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 36.0, 39.2),
          '2021': Y(1628, 298, 70, 45.6, 1495, 201, 40.0, 44.1),
          '2022': Y(1309, 246, 70, 49.6, 1228, 230, 39.0, 41.5),
          '2023': Y(1415, 217, 70, 38.2, 1288, 244, 40.4, 40.0),
          '2024': Y(1252, 228, 70, 44.3, 1116, 250, 38.5, 38.5),
          '2025': Y(1505, 288, 80, 44.8, 1352, 298, 38.8, 38.2),
          '2026': Y(1688, 331, 80, 38.4, 1500, 295, 39.1, 38.9),
        },
      },
    ],
  },
  {
    id: 'landskapsarkitektur', label: 'Landskapsarkitektur', level: 'master5',
    desc: 'Sammenligner de norske utdanningene som gir tittelen landskapsarkitekt.',
    note: 'AHOs masterprogram er et femårig fellesløp med UiT (tre år i Oslo, to år i Tromsø) og har derfor bare én studiekode i Samordna opptak; UiT har ikke egen kode. HVLs program i Sogndal er en bachelor og dermed et svakere sammenligningsgrunnlag. AHO tar opp på grunnlag av opptaksprøve, og poenggrensene deres (ca. 130–160 poeng) er på en annen skala enn skolepoeng; de vises derfor ikke.',
    nmbuIds: ['nmbu_la'], defaultIds: ['nmbu_la', 'aho_la'],
    entries: [
      {
        id: 'nmbu_la', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192732', studiested: 'Ås', type: 'master',
        years: {
          '2020': Y(null, null, null, null, null, null, 53.0, 58.6),
          '2021': Y(1058, 227, 40, 76.7, 1033, 60, 54.4, 60.5),
          '2022': Y(769, 151, 40, 75.5, 757, 58, 54.6, 60.1),
          '2023': Y(872, 167, 40, 76.6, 852, 90, 53.8, 59.6),
          '2024': Y(814, 175, 40, 77.7, 795, 80, 53.5, 59.2),
          '2025': Y(703, 134, 40, 77.6, 689, 94, 52.0, 56.3),
          '2026': Y(732, 144, 40, 75.0, 714, 106, 51.3, 56.4),
        },
      },
      {
        id: 'aho_la', shortName: 'AHO', institusjon: 'Arkitektur- og designhøgskolen i Oslo',
        studiekode: '189732', studiested: 'Oslo', type: 'master',
        years: {
          '2021': Y(811, 96, 20, 64.6, 144, 20, null, null),
          '2022': Y(670, 70, 20, 81.4, 189, 20, null, null),
          '2023': Y(610, 72, 20, 66.7, 134, 20, null, null),
          '2024': Y(562, 81, 20, 75.3, 137, 20, null, null),
          '2025': Y(393, 50, 20, 56.0, 86, 20, null, null),
          '2026': Y(356, 49, 20, 81.6, 77, 20, null, null),
        },
      },
      {
        id: 'hvl_landskapsplanlegging_la', shortName: 'HVL Sogndal', institusjon: 'Høgskulen på Vestlandet',
        studiekode: '203310', studiested: 'Sogndal', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 42.2, 46.4),
          '2021': Y(497, 72, 35, 63.9, 478, 86, 44.5, 49.6),
          '2022': Y(432, 54, 30, 74.1, 423, 104, 39.3, 44.4),
          '2023': Y(421, 55, 30, 61.8, 396, 102, 38.9, 44.2),
          '2024': Y(390, 56, 35, 48.2, 369, 114, 0, 0),
          '2025': Y(373, 59, 45, 64.4, 359, 107, 0, 0),
          '2026': Y(323, 39, 45, 66.7, 306, 77, 0, 0),
        },
      },
    ],
  },
  {
    id: 'byregion', label: 'By- og regionplanlegging', level: 'master5',
    desc: 'Sammenligner NMBUs femårige planleggingsmaster med andre by-, areal- og samfunnsplanleggingsutdanninger.',
    note: 'Bare UiS\' femårige byplanleggingsmaster ligger på samme nivå; de øvrige er bachelorprogram (default false). NTNUs toårige master er tatt med som lokalt opptak og het Fysisk planlegging til og med 2025 – fra 2026 finnes bare Byplanlegging med tilsvarende rammetall, men NTNU bekrefter ikke eksplisitt at det er samme program.',
    nmbuIds: ['nmbu_byreg'], defaultIds: ['nmbu_byreg', 'uis_byplanlegging'],
    entries: [
      {
        id: 'nmbu_byreg', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192949', studiested: 'Ås', type: 'master',
        years: {
          '2020': Y(null, null, null, null, null, null, 48.1, 55.7),
          '2021': Y(748, 121, 45, 52.9, 727, 68, 49.5, 58.0),
          '2022': Y(591, 96, 45, 49.0, 575, 70, 50.7, 56.4),
          '2023': Y(567, 86, 45, 64.0, 554, 98, 48.5, 53.3),
          '2024': Y(619, 97, 45, 52.6, 610, 100, 48.0, 52.2),
          '2025': Y(595, 95, 45, 52.6, 569, 120, 43.8, 49.5),
          '2026': Y(734, 108, 45, 54.6, 699, 130, 44.3, 51.3),
        },
      },
      {
        id: 'uis_byplanlegging', shortName: 'UiS', institusjon: 'Universitetet i Stavanger',
        studiekode: '217938', studiested: 'Stavanger', type: 'master',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(227, 18, 12, 44.4, 127, 29, 0, 0),
          '2022': Y(227, 16, 7, 18.8, 116, 18, 0, 0),
        },
      },
      {
        id: 'uis_byplan_samfsikkerhet', shortName: 'UiS (bachelor)', institusjon: 'Universitetet i Stavanger',
        studiekode: '217530', studiested: 'Stavanger', type: 'bachelor',
        years: {
          '2021': Y(1231, 184, 20, 54.3, 1155, 50, 45.5, 54.8),
          '2022': Y(752, 100, 32, 53.0, 728, 60, 45.5, 51.4),
          '2023': Y(762, 97, 35, 52.6, 727, 90, 45.6, 48.5),
          '2024': Y(890, 116, 35, 43.1, 844, 110, 43.0, 47.1),
          '2025': Y(809, 117, 35, 56.4, 761, 110, 42.1, 47.5),
          '2026': Y(849, 111, 35, 48.6, 798, 110, 42.1, 47.0),
        },
      },
      {
        id: 'uis_ing_bygg_byplan', shortName: 'UiS (ingeniør)', institusjon: 'Universitetet i Stavanger',
        studiekode: '217067', studiested: 'Stavanger', type: 'bachelor',
        years: {
          '2023': Y(183, 16, 15, 37.5, 93, 9, 0, 0),
          '2024': Y(214, 12, 15, 50.0, 106, 8, 0, 0),
          '2025': Y(232, 17, 15, 41.2, 136, 14, 0, 0),
          '2026': Y(230, 21, 15, 52.4, 113, 14, 0, 0),
        },
      },
      {
        id: 'uit_samfunnsplanlegging', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '186474', studiested: 'Tromsø', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(174, 27, 40, 48.1, 161, 50, 0, 0),
          '2022': Y(142, 14, 40, 78.6, 139, 22, 0, 0),
          '2023': Y(124, 12, 40, 83.3, 118, 20, 0, 0),
          '2024': Y(136, 20, 40, 75.0, 129, 22, 0, 0),
          '2025': Y(141, 11, 15, 72.7, 131, 11, 0, 0),
          '2026': Y(151, 14, 15, 57.1, 140, 21, 0, 0),
        },
      },
      {
        id: 'nord_geografi_samfplan', shortName: 'Nord', institusjon: 'Nord universitet',
        studiekode: '204438', studiested: 'Levanger', type: 'bachelor',
        years: {
          '2022': Y(152, 25, 20, 52.0, 143, 31, 0, 0),
          '2023': Y(128, 27, 20, 48.1, 123, 31, 0, 0),
          '2024': Y(154, 21, 20, 52.4, 147, 34, 0, 0),
          '2025': Y(129, 27, 20, 51.9, 123, 29, 0, 0),
          '2026': Y(114, 19, 20, 42.1, 105, 22, 0, 0),
        },
      },
      {
        id: 'uia_samfunnsplanlegging', shortName: 'UiA', institusjon: 'Universitetet i Agder',
        studiekode: '201474', studiested: 'Kristiansand', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 35.3, 41.4),
          '2021': Y(444, 53, 40, 58.5, 421, 80, 38.0, 44.3),
          '2022': Y(369, 39, 40, 56.4, 357, 68, 0, 0),
          '2023': Y(320, 46, 40, 52.2, 293, 68, 37.7, 40.1),
          '2024': Y(361, 41, 40, 56.1, 340, 72, 36.7, 37.1),
          '2025': Y(280, 27, 40, 48.1, 264, 48, 0, 0),
          '2026': Y(290, 26, 35, 61.5, 273, 52, 0, 0),
        },
      },
      {
        id: 'hivolda_planlegging', shortName: 'HVO', institusjon: 'Høgskulen i Volda',
        studiekode: '223452', studiested: 'Volda', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(156, 23, 15, 43.5, 133, 40, 0, 0),
          '2022': Y(155, 21, 15, 66.7, 140, 29, 0, 0),
          '2023': Y(123, 19, 30, 68.4, 118, 26, 0, 0),
          '2024': Y(77, 12, 30, 33.3, 71, 15, 0, 0),
          '2025': Y(79, 9, 30, 66.7, 73, 10, 0, 0),
          '2026': Y(134, 16, 30, 50.0, 126, 27, 0, 0),
        },
      },
      {
        id: 'ntnu_fysisk_planlegging', shortName: 'NTNU (master 2 år)', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        years: {
          '2021': Y(212, 124, 40, null, 170, 71, null, 3.3),
          '2022': Y(204, 104, 40, null, 164, 84, null, 3.2),
          '2023': Y(152, 75, 30, null, 133, 72, null, 2.8),
          '2024': Y(150, 72, 30, null, 125, 74, null, 2.4),
          '2025': Y(179, 97, 34, null, 149, 80, null, 2.8),
          '2026': Y(273, 107, 34, null, null, null, null, 2.9),
        },
      },
    ],
  },
  {
    id: 'landskapsingenior', label: 'Landskapsingeniør', level: 'bachelor',
    desc: 'Sammenligner bachelorutdanningene innen anlegg, uterom og landskapsforvaltning.',
    note: 'Ingen andre institusjoner tilbyr landskapsingeniør i Samordna opptak 2026; HVLs program i Sogndal er det eneste beslektede bachelorløpet.',
    nmbuIds: ['nmbu_landskapsing'], defaultIds: ['nmbu_landskapsing', 'hvl_landskapsplanlegging'],
    entries: [
      {
        id: 'nmbu_landskapsing', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192310', studiested: 'Ås', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 45.5, 54.2),
          '2021': Y(691, 107, 25, 57.0, 675, 38, 50.1, 57.3),
          '2022': Y(561, 74, 25, 58.1, 549, 38, 49.0, 56.8),
          '2023': Y(555, 66, 25, 72.7, 533, 58, 47.3, 53.1),
          '2024': Y(645, 70, 25, 61.4, 615, 50, 49.4, 55.2),
          '2025': Y(562, 75, 25, 58.7, 540, 65, 48.6, 53.2),
          '2026': Y(565, 69, 25, 66.7, 539, 64, 44.6, 53.5),
        },
      },
      {
        id: 'hvl_landskapsplanlegging', shortName: 'HVL Sogndal', institusjon: 'Høgskulen på Vestlandet',
        studiekode: '203310', studiested: 'Sogndal', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 42.2, 46.4),
          '2021': Y(497, 72, 35, 63.9, 478, 86, 44.5, 49.6),
          '2022': Y(432, 54, 30, 74.1, 423, 104, 39.3, 44.4),
          '2023': Y(421, 55, 30, 61.8, 396, 102, 38.9, 44.2),
          '2024': Y(390, 56, 35, 48.2, 369, 114, 0, 0),
          '2025': Y(373, 59, 45, 64.4, 359, 107, 0, 0),
          '2026': Y(323, 39, 45, 66.7, 306, 77, 0, 0),
        },
      },
    ],
  },
  {
    id: 'miljoutvikling', label: 'Internasjonale miljø- og utviklingsstudier', level: 'bachelor',
    desc: 'Sammenligner bachelorprogrammene innen utviklingsstudier og internasjonale studier.',
    note: 'Utviklingsstudiene ved UiO, OsloMet og UiA er de nærmeste konkurrentene; bachelorene i internasjonale studier/relasjoner er tatt med som svakere sammenligning (default false). Årsstudier er utelatt.',
    nmbuIds: ['nmbu_ims'], defaultIds: ['nmbu_ims', 'uio_utvikling_baerekraft', 'oslomet_utviklingsstudier', 'uia_globale_utviklingsstudier'],
    entries: [
      {
        id: 'nmbu_ims', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192484', studiested: 'Ås', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 52.1, 55.5),
          '2021': Y(467, 85, 20, 74.1, 417, 50, 51.5, 54.0),
          '2022': Y(397, 51, 20, 84.3, 350, 24, 51.1, 56.0),
          '2023': Y(362, 54, 22, 77.8, 336, 58, 48.3, 45.8),
          '2024': Y(406, 58, 22, 75.9, 369, 68, 45.1, 44.7),
          '2025': Y(342, 38, 22, 63.2, 300, 39, 0, 0),
          '2026': Y(333, 46, 22, 73.9, 275, 70, 0, 0),
        },
      },
      {
        id: 'uio_utvikling_baerekraft', shortName: 'UiO', institusjon: 'Universitetet i Oslo',
        studiekode: '185883', studiested: 'Oslo', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 50.5, 53.1),
          '2021': Y(957, 78, 50, 78.2, 923, 95, 50.2, 53.5),
          '2022': Y(785, 49, 50, 79.6, 760, 95, 49.1, 50.5),
          '2023': Y(810, 76, 50, 84.2, 788, 95, 48.8, 51.5),
          '2024': Y(838, 82, 50, 81.7, 813, 100, 46.5, 50.9),
          '2025': Y(723, 77, 50, 81.8, 696, 100, 45.8, 50.5),
          '2026': Y(671, 79, 50, 79.7, 643, 96, 42.2, 51.4),
        },
      },
      {
        id: 'oslomet_utviklingsstudier', shortName: 'OsloMet', institusjon: 'OsloMet - storbyuniversitetet',
        studiekode: '215484', studiested: 'Oslo', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 45.4, 50.1),
          '2021': Y(711, 69, 35, 79.7, 675, 70, 46.0, 51.4),
          '2022': Y(614, 48, 35, 75.0, 590, 90, 43.1, 45.6),
          '2023': Y(708, 77, 35, 71.4, 671, 80, 45.0, 46.9),
          '2024': Y(610, 46, 40, 82.6, 573, 100, 40.9, 44.8),
          '2025': Y(522, 42, 30, 83.3, 475, 110, 0, 35.4),
          '2026': Y(485, 48, 50, 66.7, 430, 115, 0, 0),
        },
      },
      {
        id: 'uia_globale_utviklingsstudier', shortName: 'UiA', institusjon: 'Universitetet i Agder',
        studiekode: '201484', studiested: 'Kristiansand', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 42.5, 42.7),
          '2021': Y(399, 72, 25, 76.4, 373, 58, 44.1, 47.6),
          '2022': Y(474, 68, 25, 79.4, 449, 55, 46.4, 46.8),
          '2023': Y(422, 55, 25, 87.3, 389, 56, 47.9, 44.3),
          '2024': Y(408, 53, 25, 71.7, 367, 60, 39.6, 42.3),
          '2025': Y(373, 45, 30, 62.2, 333, 58, 0, 0),
          '2026': Y(351, 43, 30, 76.7, 322, 55, 0, 0),
        },
      },
      {
        id: 'uio_internasjonale_studier', shortName: 'UiO (int.stud.)', institusjon: 'Universitetet i Oslo',
        studiekode: '185872', studiested: 'Oslo', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 55.0, 59.0),
          '2021': Y(1879, 353, 80, 70.5, 1808, 140, 55.2, 59.2),
          '2022': Y(1670, 325, 80, 68.6, 1610, 145, 55.0, 58.2),
          '2023': Y(1880, 356, 80, 71.3, 1807, 165, 54.9, 58.8),
          '2024': Y(2150, 446, 80, 67.9, 2072, 157, 54.8, 59.5),
          '2025': Y(2060, 433, 80, 73.0, 1976, 152, 54.3, 60.5),
          '2026': Y(2125, 409, 80, 68.7, 2030, 150, 54.1, 60.0),
        },
      },
      {
        id: 'inn_internasjonale_studier', shortName: 'INN', institusjon: 'Universitetet i Innlandet',
        studiekode: '209872', studiested: 'Lillehammer', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(247, 46, 40, 45.7, 226, 67, 0, 38.4),
          '2022': Y(321, 45, 40, 46.7, 298, 76, 0, 0),
          '2023': Y(265, 33, 40, 42.4, 240, 70, 0, 0),
          '2024': Y(316, 38, 40, 68.4, 286, 70, 0, 0),
          '2025': Y(384, 48, 40, 58.3, 356, 97, 0, 0),
          '2026': Y(372, 39, 40, 51.3, 343, 90, 0, 0),
        },
      },
      {
        id: 'nord_internasjonale_relasjoner_b', shortName: 'Nord', institusjon: 'Nord universitet',
        studiekode: '204872', studiested: 'Bodø', type: 'bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(322, 44, 20, 38.6, 288, 50, 41.7, 43.6),
          '2022': Y(252, 44, 25, 40.9, 230, 56, 0, 0),
          '2023': Y(198, 26, 25, 38.5, 173, 48, 0, 0),
          '2024': Y(237, 42, 20, 66.7, 217, 57, 0, 0),
          '2025': Y(271, 34, 20, 44.1, 241, 36, 0, 0),
          '2026': Y(313, 44, 20, 54.5, 291, 71, 0, 0),
        },
      },
    ],
  },
  {
    id: 'eiendomsutvikling', label: 'Eiendomsutvikling', level: 'master2',
    desc: 'Sammenligner de toårige masterne i eiendomsutvikling og -forvaltning.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere», kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (høstopptak, søknadsalternativer = alle søkere uansett prioritet); studieplasser, førstevalgssøkere og poenggrenser er hentet fra institusjonenes egne publiseringer. DBH har ikke rapportert høsten 2026 ennå. Førstevalgssøkere og kjønnsfordeling publiseres ikke for NMBU. NMBU oppgir 30 studieplasser og poenggrense 3,5 ved opptaket 2024 på programsiden, men publiserer ingen tidsserie.',
    nmbuIds: ['nmbu_eiendomsutvikling'], defaultIds: ['nmbu_eiendomsutvikling', 'ntnu_eiendomsutvikling'],
    entries: [
      {
        id: 'nmbu_eiendomsutvikling', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        years: {
          '2021': Y(220, null, null, null, 127, 60, null, null),
          '2022': Y(172, null, null, null, 119, 81, null, null),
          '2023': Y(195, null, null, null, 128, 85, null, null),
          '2024': Y(215, null, null, null, 128, 68, null, 3.5),
          '2025': Y(202, null, null, null, 112, 71, null, null),
        },
      },
      {
        id: 'ntnu_eiendomsutvikling', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        years: {
          '2021': Y(280, 113, 24, null, 227, 60, null, 3.3),
          '2022': Y(272, 110, 24, null, 215, 58, null, 3.3),
          '2023': Y(262, 110, 24, null, 220, 80, null, 3.3),
          '2024': Y(218, 91, 24, null, 169, 62, null, 3.0),
          '2025': Y(266, 116, 30, null, 223, 74, null, 3.3),
          '2026': Y(302, 153, 30, null, null, null, null, 3.3),
        },
      },
    ],
  },
  {
    id: 'folkehelse', label: 'Folkehelsevitenskap', level: 'master2',
    desc: 'Sammenligner de toårige masterne innen folkehelse.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere», kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (høstopptak, søknadsalternativer = alle søkere uansett prioritet); studieplasser, førstevalgssøkere og poenggrenser er hentet fra institusjonenes egne publiseringer. DBH har ikke rapportert høsten 2026 ennå. Førstevalgssøkere og kjønnsfordeling publiseres ikke for NMBU. NMBU oppgir 36 studieplasser på programsiden og publiserer ingen poenggrense. NTNUs egne søkertall gjelder bare norske og nordiske søkere og er derfor lavere enn DBH-tallene for dette programmet; 2026-tallet er derfor ikke ført inn. UiOs tall er fra UiOs egen poenggrenseoversikt og har et annet tellegrunnlag enn DBH.',
    nmbuIds: ['nmbu_folkehelse'], defaultIds: ['nmbu_folkehelse', 'ntnu_folkehelse'],
    entries: [
      {
        id: 'nmbu_folkehelse', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        years: {
          '2021': Y(232, null, null, null, 221, 101, null, null),
          '2022': Y(181, null, null, null, 175, 106, null, null),
          '2023': Y(169, null, null, null, 144, 102, null, null),
          '2024': Y(195, null, null, null, 154, 86, null, null),
          '2025': Y(180, null, null, null, 170, 128, null, null),
        },
      },
      {
        id: 'ntnu_folkehelse', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        years: {
          '2021': Y(430, 196, 30, null, 364, 129, null, 3.8),
          '2022': Y(385, 126, 30, null, 339, 105, null, 3.6),
          '2023': Y(400, 128, 30, null, 347, 112, null, 3.7),
          '2024': Y(369, 126, 30, null, 323, 134, null, 3.4),
          '2025': Y(376, 119, 40, null, 333, 135, null, 3.5),
          '2026': Y(null, 140, 40, null, null, null, null, 2.9),
        },
      },
      {
        id: 'uio_folkehelsearbeid', shortName: 'UiO', institusjon: 'Universitetet i Oslo',
        studiekode: '', studiested: 'Oslo', type: 'master2',
        years: {
          '2023': Y(320, null, null, null, null, 53, null, 3.8),
          '2024': Y(369, null, null, null, null, 64, null, 3.8),
          '2025': Y(373, null, null, null, null, 178, null, 3.1),
          '2026': Y(366, null, null, null, null, 219, null, 2.7),
        },
      },
    ],
  },
  {
    id: 'globalokonomi', label: 'Global økonomi og politikk', level: 'master2',
    desc: 'Viser søkningen til NMBUs master i global økonomi og politikk.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere», kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (høstopptak, søknadsalternativer = alle søkere uansett prioritet); studieplasser, førstevalgssøkere og poenggrenser er hentet fra institusjonenes egne publiseringer. DBH har ikke rapportert høsten 2026 ennå. Førstevalgssøkere og kjønnsfordeling publiseres ikke for NMBU. Vi fant ingen norsk master med tydelig samme profil (politisk økonomi/global økonomi og politikk), så gruppa har foreløpig bare NMBU. NMBU oppgir 25 studieplasser og poenggrense C/3,00 ved opptaket 2025. Første opptak var i 2024.',
    nmbuIds: ['nmbu_gep'], defaultIds: ['nmbu_gep'],
    entries: [
      {
        id: 'nmbu_gep', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        years: {
          '2024': Y(163, null, null, null, 28, 17, null, null),
          '2025': Y(244, null, null, null, 71, 52, null, 3.0),
        },
      },
    ],
  },
  {
    id: 'globaleutvikling', label: 'Globale utviklingsstudier', level: 'master2',
    desc: 'Sammenligner de toårige masterne innen globale utviklingsstudier.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere», kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (høstopptak, søknadsalternativer = alle søkere uansett prioritet); studieplasser, førstevalgssøkere og poenggrenser er hentet fra institusjonenes egne publiseringer. DBH har ikke rapportert høsten 2026 ennå. Førstevalgssøkere og kjønnsfordeling publiseres ikke for NMBU. NMBU-tallene ligger i DBH under programkoden M-DS (Globale utviklingsstudier). NMBU oppgir bare karakterkravet C for opptaket 2024, ikke en tallfestet poenggrense. UiO-tallene er fra UiOs egen poenggrenseoversikt og har et annet tellegrunnlag enn DBH.',
    nmbuIds: ['nmbu_globale_utviklingsstudier'], defaultIds: ['nmbu_globale_utviklingsstudier', 'uio_decc'],
    entries: [
      {
        id: 'nmbu_globale_utviklingsstudier', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        years: {
          '2021': Y(718, null, null, null, 304, 102, null, null),
          '2022': Y(858, null, null, null, 297, 99, null, null),
          '2023': Y(709, null, null, null, 116, 71, null, null),
          '2024': Y(220, null, null, null, 77, 60, null, null),
          '2025': Y(284, null, null, null, 95, 67, null, null),
        },
      },
      {
        id: 'uio_decc', shortName: 'UiO', institusjon: 'Universitetet i Oslo',
        studiekode: '', studiested: 'Oslo', type: 'master2',
        years: {
          '2021': Y(548, null, null, null, null, 39, null, 4.5),
          '2022': Y(437, null, null, null, null, 42, null, 4.4),
          '2023': Y(411, null, null, null, null, 62, null, 4.2),
          '2024': Y(390, null, null, null, null, 74, null, 3.9),
          '2025': Y(369, null, null, null, null, 68, null, 3.8),
          '2026': Y(286, null, null, null, null, 47, null, 3.9),
        },
      },
    ],
  },
  {
    id: 'intmiljo', label: 'Internasjonale miljøstudier', level: 'master2',
    desc: 'Viser søkningen til NMBUs master i internasjonale miljøstudier.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere», kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (høstopptak, søknadsalternativer = alle søkere uansett prioritet); studieplasser, førstevalgssøkere og poenggrenser er hentet fra institusjonenes egne publiseringer. DBH har ikke rapportert høsten 2026 ennå. Førstevalgssøkere og kjønnsfordeling publiseres ikke for NMBU. Vi fant ingen norsk master med tydelig samme profil, så gruppa har foreløpig bare NMBU. NMBU oppgir bare karakterkravet C for opptaket 2024, ikke en tallfestet poenggrense.',
    nmbuIds: ['nmbu_intmiljo'], defaultIds: ['nmbu_intmiljo'],
    entries: [
      {
        id: 'nmbu_intmiljo', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        years: {
          '2021': Y(751, null, null, null, 361, 93, null, null),
          '2022': Y(739, null, null, null, 197, 64, null, null),
          '2023': Y(531, null, null, null, 119, 88, null, null),
          '2024': Y(205, null, null, null, 89, 63, null, null),
          '2025': Y(217, null, null, null, 88, 67, null, null),
        },
      },
    ],
  },
  {
    id: 'intrelasjoner', label: 'Internasjonale relasjoner', level: 'master2',
    desc: 'Sammenligner NMBUs master i internasjonale relasjoner med nærmeste fredsfaglige masterprogram.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere», kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (høstopptak, søknadsalternativer = alle søkere uansett prioritet); studieplasser, førstevalgssøkere og poenggrenser er hentet fra institusjonenes egne publiseringer. DBH har ikke rapportert høsten 2026 ennå. Førstevalgssøkere og kjønnsfordeling publiseres ikke for NMBU. UiO har ingen master som heter Internasjonale relasjoner; Peace and Conflict Studies er nærmeste faglige motpart. NMBU oppgir 35 studieplasser og bare karakterkravet C for opptaket 2024. UiO-tallene er fra UiOs egen poenggrenseoversikt og har et annet tellegrunnlag enn DBH. Deltidsvarianten M-IR-DEL er holdt utenfor.',
    nmbuIds: ['nmbu_intrel'], defaultIds: ['nmbu_intrel', 'uio_pecos'],
    entries: [
      {
        id: 'nmbu_intrel', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        years: {
          '2021': Y(715, null, null, null, 309, 109, null, null),
          '2022': Y(800, null, null, null, 269, 103, null, null),
          '2023': Y(679, null, null, null, 148, 121, null, null),
          '2024': Y(318, null, null, null, 172, 134, null, null),
          '2025': Y(405, null, null, null, 219, 167, null, null),
        },
      },
      {
        id: 'uio_pecos', shortName: 'UiO', institusjon: 'Universitetet i Oslo',
        studiekode: '', studiested: 'Oslo', type: 'master2',
        years: {
          '2021': Y(591, null, null, null, null, 37, null, 4.2),
          '2022': Y(546, null, null, null, null, 31, null, 4.2),
          '2023': Y(531, null, null, null, null, 48, null, 4.2),
          '2024': Y(585, null, null, null, null, 59, null, 4.2),
          '2025': Y(578, null, null, null, null, 70, null, 4.2),
          '2026': Y(518, null, null, null, null, 50, null, 4.1),
        },
      },
    ],
  },
  {
    id: 'landskapglobal', label: 'Landskapsarkitektur for global bærekraft', level: 'master2',
    desc: 'Viser søkningen til NMBUs toårige master i landskapsarkitektur for global bærekraft.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere», kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (høstopptak, søknadsalternativer = alle søkere uansett prioritet); studieplasser, førstevalgssøkere og poenggrenser er hentet fra institusjonenes egne publiseringer. DBH har ikke rapportert høsten 2026 ennå. Førstevalgssøkere og kjønnsfordeling publiseres ikke for NMBU. Vi fant ingen tilsvarende toårig landskapsarkitekturmaster ved andre norske institusjoner, så gruppa har foreløpig bare NMBU. NMBU oppgir bare karakterkravet C for opptaket 2024.',
    nmbuIds: ['nmbu_gla'], defaultIds: ['nmbu_gla'],
    entries: [
      {
        id: 'nmbu_gla', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        years: {
          '2021': Y(213, null, null, null, 48, 37, null, null),
          '2022': Y(241, null, null, null, 68, 47, null, null),
          '2023': Y(174, null, null, null, 33, 31, null, null),
          '2024': Y(88, null, null, null, 32, 27, null, null),
          '2025': Y(123, null, null, null, 37, 35, null, null),
        },
      },
    ],
  },
  {
    id: 'samfok_miljo', label: 'Samfunnsøkonomi og miljøforvaltning', level: 'master2',
    desc: 'Sammenligner NMBUs samfunnsøkonomiske master med de øvrige norske samfunnsøkonomimasterne.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere», kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (høstopptak, søknadsalternativer = alle søkere uansett prioritet); studieplasser, førstevalgssøkere og poenggrenser er hentet fra institusjonenes egne publiseringer. DBH har ikke rapportert høsten 2026 ennå. Førstevalgssøkere og kjønnsfordeling publiseres ikke for NMBU. NMBU oppgir 35 studieplasser og poenggrense C/3,00 ved opptaket 2025; første opptak var i 2024. UiO-tallene er fra UiOs egen poenggrenseoversikt. UiB-tallene er fra fakultetsstyresak 53/25 og gjelder førstevalgssøkere, ikke alle søknadsalternativer; UiB publiserer ikke antall kvalifiserte søkere totalt, og 2026 var ikke publisert.',
    nmbuIds: ['nmbu_eeg'], defaultIds: ['nmbu_eeg', 'ntnu_msok', 'uio_economics'],
    entries: [
      {
        id: 'nmbu_eeg', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        years: {
          '2024': Y(188, null, null, null, 50, 21, null, null),
          '2025': Y(257, null, null, null, 78, 59, null, 3.0),
        },
      },
      {
        id: 'ntnu_msok', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        years: {
          '2021': Y(312, 90, 25, null, 106, 67, null, 3.0),
          '2022': Y(284, 69, 25, null, 89, 50, null, 2.5),
          '2023': Y(279, 75, 25, null, 105, 67, null, 2.5),
          '2024': Y(275, 66, 25, null, 85, 55, null, 2.5),
          '2025': Y(321, 72, 25, null, 107, 65, null, 2.5),
          '2026': Y(359, 98, 25, null, null, null, null, 3.1),
        },
      },
      {
        id: 'uio_economics', shortName: 'UiO', institusjon: 'Universitetet i Oslo',
        studiekode: '', studiested: 'Oslo', type: 'master2',
        years: {
          '2021': Y(455, null, null, null, null, 149, null, 3.1),
          '2022': Y(400, null, null, null, null, 131, null, 3.4),
          '2023': Y(355, null, null, null, null, 130, null, 3.2),
          '2024': Y(431, null, null, null, null, 171, null, 2.7),
          '2025': Y(474, null, null, null, null, 179, null, 3.0),
          '2026': Y(482, null, null, null, null, 161, null, 3.3),
        },
      },
      {
        id: 'uib_samfunnsokonomi', shortName: 'UiB', institusjon: 'Universitetet i Bergen',
        studiekode: '', studiested: 'Bergen', type: 'master2',
        years: {
          '2021': Y(null, 163, 25, null, null, 60, null, null),
          '2022': Y(null, 145, 27, null, null, 57, null, 3.4),
          '2023': Y(null, 147, 27, null, null, 58, null, 3.3),
          '2024': Y(null, 149, 27, null, null, 69, null, 3.2),
          '2025': Y(null, 182, 27, null, null, 82, null, 3.0),
        },
      },
    ],
  },
];
