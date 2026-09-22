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
    id: 'skogfag', label: 'Skogfag', level: 'bachelor',
    desc: 'Sammenligner NMBUs bachelor i skogfag med de andre skogbruksutdanningene i Norge.',
    note: 'Skogfag er et lite fagfelt: bare NMBU, Universitetet i Innlandet (Evenstad) og Nord universitet tilbyr utdanningen. Nord startet opp bachelor i skogfag først i 2025, så programmet har bare to årganger. INNs utmarksforvaltning ligger på samme studiested som INNs skogfag og konkurrerer om mange av de samme søkerne, men er et annet fag og er derfor tatt med som svakere sammenligning (default false). Årsstudiene i skogfag ved INN og Nord er holdt utenfor.',
    nmbuIds: ['nmbu_skogfag'], defaultIds: ['nmbu_skogfag', 'inn_skogfag', 'nord_skogfag'],
    entries: [
      {
        id: 'nmbu_skogfag', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192322', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/skogfag',
        years: {
          '2020': Y(null, null, null, null, null, null, 40.5, 48.0),
          '2021': Y(326, 68, 25, 38.2, 313, 36, 45.0, 52.9),
          '2022': Y(289, 59, 25, 30.5, 278, 38, 46.1, 53.7),
          '2023': Y(287, 68, 35, 39.7, 272, 68, 40.1, 44.8),
          '2024': Y(342, 87, 35, 41.4, 325, 70, 40.4, 49.0),
          '2025': Y(342, 74, 35, 23.0, 331, 74, 40.3, 45.8),
          '2026': Y(313, 59, 35, 33.9, 294, 68, 0, 44.8),
        },
      },
      {
        id: 'inn_skogfag', shortName: 'INN', institusjon: 'Universitetet i Innlandet',
        studiekode: '209322', studiested: 'Stor-Elvdal', type: 'bachelor',
        url: 'https://www.inn.no/studier/vare-studier/bachelor-i-skogfag/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(168, 19, 25, 21.1, 161, 50, 0, 0),
          '2022': Y(150, 36, 25, 16.7, 144, 47, 0, 0),
          '2023': Y(155, 34, 25, 17.6, 143, 40, 0, 0),
          '2024': Y(152, 31, 25, 22.6, 138, 33, 0, 0),
          '2025': Y(129, 33, 25, 21.2, 116, 32, 0, 0),
          '2026': Y(153, 33, 25, 39.4, 139, 38, 0, 0),
        },
      },
      {
        id: 'nord_skogfag', shortName: 'Nord', institusjon: 'Nord universitet',
        studiekode: '204322', studiested: 'Steinkjer', type: 'bachelor',
        url: 'https://www.nord.no/studier/skogfag-bachelor',
        years: {
          '2025': Y(72, 13, 20, 30.8, 67, 13, 0, 0),
          '2026': Y(78, 15, 20, 46.7, 71, 18, 0, 0),
        },
      },
      {
        id: 'inn_utmark_skog', shortName: 'INN Utmarksforvaltning', institusjon: 'Universitetet i Innlandet',
        studiekode: '209323', studiested: 'Stor-Elvdal', type: 'bachelor',
        url: 'https://www.inn.no/studier/vare-studier/bachelor-i-utmarksforvaltning/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(258, 56, 25, 28.6, 243, 50, 39.3, 44.5),
          '2022': Y(186, 39, 25, 33.3, 177, 45, 0, 0),
          '2023': Y(207, 41, 25, 41.5, 197, 50, 0, 0),
          '2024': Y(195, 34, 25, 50.0, 182, 43, 0, 0),
          '2025': Y(166, 25, 25, 36.0, 156, 25, 0, 0),
          '2026': Y(167, 37, 25, 27.0, 156, 40, 0, 0),
        },
      },
    ],
  },
  {
    id: 'okologi', label: 'Økologi og naturforvaltning', level: 'bachelor',
    desc: 'Sammenligner NMBUs bachelor i økologi og naturforvaltning med de andre naturforvaltnings- og biologiutdanningene.',
    note: 'De nærmeste konkurrentene er de profesjonsrettede naturforvaltningsbachelorene ved Universitetet i Innlandet (Evenstad), Nord universitet (Steinkjer) og Universitetet i Sørøst-Norge (Bø). De rene biologibachelorene ved UiT og UiA overlapper på økologidelen, men mangler forvaltningsdelen og er derfor svakere sammenligninger (default false). Universitetet i Stavanger er vurdert, men har ingen bachelor i biologi eller naturforvaltning – bare «Biologisk kjemi», som er et kjemiprogram – og er derfor ikke tatt med. Årsstudiene i naturforvaltning ved Nord og USN er holdt utenfor.',
    nmbuIds: ['nmbu_okologi'], defaultIds: ['nmbu_okologi', 'inn_utmarksforvaltning', 'nord_naturforvaltning', 'usn_naturmiljoforvaltning'],
    entries: [
      {
        id: 'nmbu_okologi', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192388', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/okologi-og-naturforvaltning',
        years: {
          '2020': Y(null, null, null, null, null, null, 50.1, 53.8),
          '2021': Y(393, 72, 30, 59.7, 310, 42, 49.4, 56.3),
          '2022': Y(321, 64, 30, 59.4, 259, 42, 49.8, 56.9),
          '2023': Y(303, 56, 30, 71.4, 238, 55, 0, 0),
          '2024': Y(299, 64, 30, 45.3, 238, 57, 0, 0),
          '2025': Y(332, 57, 30, 45.6, 259, 50, 0, 0),
          '2026': Y(271, 45, 30, 51.1, 202, 44, 0, 0),
        },
      },
      {
        id: 'inn_utmarksforvaltning', shortName: 'INN', institusjon: 'Universitetet i Innlandet',
        studiekode: '209323', studiested: 'Stor-Elvdal', type: 'bachelor',
        url: 'https://www.inn.no/studier/vare-studier/bachelor-i-utmarksforvaltning/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(258, 56, 25, 28.6, 243, 50, 39.3, 44.5),
          '2022': Y(186, 39, 25, 33.3, 177, 45, 0, 0),
          '2023': Y(207, 41, 25, 41.5, 197, 50, 0, 0),
          '2024': Y(195, 34, 25, 50.0, 182, 43, 0, 0),
          '2025': Y(166, 25, 25, 36.0, 156, 25, 0, 0),
          '2026': Y(167, 37, 25, 27.0, 156, 40, 0, 0),
        },
      },
      {
        id: 'nord_naturforvaltning', shortName: 'Nord', institusjon: 'Nord universitet',
        studiekode: '204388', studiested: 'Steinkjer', type: 'bachelor',
        url: 'https://www.nord.no/studier/naturforvaltning-bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 44.7),
          '2021': Y(287, 58, 37, 48.3, 263, 81, 0, 0),
          '2022': Y(245, 47, 37, 36.2, 228, 65, 0, 0),
          '2023': Y(213, 34, 37, 35.3, 199, 44, 0, 0),
          '2024': Y(203, 39, 32, 28.2, 188, 39, 0, 0),
          '2025': Y(218, 47, 30, 42.6, 207, 56, 0, 0),
          '2026': Y(206, 33, 25, 36.4, 196, 31, 0, 0),
        },
      },
      {
        id: 'usn_naturmiljoforvaltning', shortName: 'USN', institusjon: 'Universitetet i Sørøst-Norge',
        studiekode: '222315', studiested: 'Midt-Telemark', type: 'bachelor',
        url: 'https://www.usn.no/studier/bachelor-i-natur-og-miljoforvaltning/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(308, 71, 45, 49.3, 292, 108, 0, 0),
          '2022': Y(256, 68, 45, 48.5, 244, 82, 0, 0),
          '2023': Y(206, 51, 45, 66.7, 189, 58, 0, 0),
          '2024': Y(204, 58, 40, 58.6, 189, 61, 0, 0),
          '2025': Y(172, 44, 40, 61.4, 165, 47, 0, 0),
          '2026': Y(162, 45, 40, 55.6, 158, 52, 0, 0),
        },
      },
      {
        id: 'uit_biologi', shortName: 'UiT Biologi', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '186327', studiested: 'Tromsø', type: 'bachelor',
        url: 'https://uit.no/utdanning/program/274284/biologi_-_bachelor',
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
        id: 'uia_biologi', shortName: 'UiA Biologi', institusjon: 'Universitetet i Agder',
        studiekode: '201327', studiested: 'Kristiansand', type: 'bachelor',
        url: 'https://www.uia.no/studier/biologi',
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
    ],
  },
  {
    id: 'miljonatur', label: 'Miljø og naturressurser', level: 'bachelor',
    desc: 'Sammenligner NMBUs bachelor i miljø og naturressurser med de andre miljø- og geofagsbachelorene.',
    note: 'NMBU-programmet bygger på geologi, jord, vann og miljøkjemi, og de nærmeste sammenligningene er derfor geofags- og miljøbachelorene ved UiO og UiB. UiOs «Klima, miljø og menneske» startet opp i 2025 og har bare to årganger. Geologiprogrammene ved NTNU og HVL er rene geofagsutdanninger uten miljøkjemi- og naturressursdel og er tatt med som svakere sammenligninger (default false). NTNU har ingen bachelor i miljøvitenskap; miljøfagene der ligger på sivilingeniør- og masternivå.',
    nmbuIds: ['nmbu_miljonatur'], defaultIds: ['nmbu_miljonatur', 'uio_klima_miljo_menneske', 'uio_geologi_geografi', 'uib_geovitenskap'],
    entries: [
      {
        id: 'nmbu_miljonatur', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192377', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/miljo-og-naturressurser',
        years: {
          '2020': Y(null, null, null, null, null, null, 44.5, 46.3),
          '2021': Y(329, 21, 20, 71.4, 272, 30, 44.6, 50.8),
          '2022': Y(247, 25, 20, 76.0, 215, 30, 44.6, 50.1),
          '2023': Y(195, 16, 40, 75.0, 165, 21, 0, 0),
          '2024': Y(192, 18, 20, 83.3, 154, 20, 0, 0),
          '2025': Y(168, 10, 20, 70.0, 144, 11, 0, 0),
          '2026': Y(120, 13, 20, 69.2, 92, 10, 0, 0),
        },
      },
      {
        id: 'uio_klima_miljo_menneske', shortName: 'UiO Klima, miljø og menneske', institusjon: 'Universitetet i Oslo',
        studiekode: '185314', studiested: 'Oslo', type: 'bachelor',
        url: 'https://www.uio.no/studier/program/klima-miljo-menneske/',
        years: {
          '2025': Y(570, 50, 25, 74.0, 534, 53, 38.8, 47.1),
          '2026': Y(379, 26, 25, 57.7, 355, 45, 31.6, 49.1),
        },
      },
      {
        id: 'uio_geologi_geografi', shortName: 'UiO Geologi og geografi', institusjon: 'Universitetet i Oslo',
        studiekode: '185858', studiested: 'Oslo', type: 'bachelor',
        url: 'https://www.uio.no/studier/program/geologi/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(253, 20, 25, 40.0, 142, 27, 0, 0),
          '2022': Y(469, 78, 37, 46.2, 377, 75, 0, 49.7),
          '2023': Y(404, 54, 55, 40.7, 319, 80, 0, 0),
          '2024': Y(399, 73, 40, 45.2, 316, 78, 0, 0),
          '2025': Y(404, 71, 40, 39.4, 311, 69, 0, 0),
          '2026': Y(361, 70, 40, 47.1, 274, 63, 0, 0),
        },
      },
      {
        id: 'uib_geovitenskap', shortName: 'UiB', institusjon: 'Universitetet i Bergen',
        studiekode: '184859', studiested: 'Bergen', type: 'bachelor',
        url: 'https://www.uib.no/studieprogram/BAMN-GEOV',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(456, 91, 57, 48.4, 405, 93, 44.0, 43.1),
          '2022': Y(447, 80, 59, 53.8, 402, 109, 0, 0),
          '2023': Y(452, 87, 54, 63.2, 394, 86, 46.2, 46.1),
          '2024': Y(445, 95, 38, 52.6, 388, 77, 46.8, 49.2),
          '2025': Y(481, 112, 38, 58.0, 425, 84, 49.3, 50.5),
          '2026': Y(412, 71, 38, 59.2, 343, 78, 46.5, 46.7),
        },
      },
      {
        id: 'ntnu_geologi', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194859', studiested: 'Trondheim', type: 'bachelor',
        url: 'https://www.ntnu.no/studier/bgeol',
        years: {
          '2020': Y(null, null, null, null, null, null, 51.5, 54.4),
          '2021': Y(687, 129, 34, 49.6, 635, 60, 53.0, 55.4),
          '2022': Y(648, 129, 34, 55.8, 587, 54, 53.0, 57.2),
          '2023': Y(664, 145, 26, 61.4, 597, 68, 53.1, 57.9),
          '2024': Y(608, 123, 33, 58.5, 553, 70, 52.2, 57.5),
          '2025': Y(688, 122, 33, 53.3, 605, 84, 51.5, 55.1),
          '2026': Y(600, 114, 45, 48.2, 530, 86, 49.3, 53.1),
        },
      },
      {
        id: 'hvl_geologi_geofare', shortName: 'HVL', institusjon: 'Høgskulen på Vestlandet',
        studiekode: '203469', studiested: 'Sogndal', type: 'bachelor',
        url: 'https://www.hvl.no/studier/studieprogram/geologi-og-geofare/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(204, 30, 35, 50.0, 157, 38, 0, 0),
          '2022': Y(197, 30, 25, 50.0, 147, 32, 0, 0),
          '2023': Y(200, 33, 25, 60.6, 162, 39, 0, 0),
          '2024': Y(173, 24, 25, 45.8, 139, 33, 0, 0),
          '2025': Y(210, 39, 25, 51.3, 179, 48, 0, 0),
          '2026': Y(194, 39, 30, 53.8, 152, 37, 0, 0),
        },
      },
    ],
  },
  {
    id: 'fornybar', label: 'Fornybar energi', level: 'bachelor',
    desc: 'Sammenligner NMBUs tverrfaglige bachelor i fornybar energi med de andre fornybar energi-utdanningene.',
    note: 'NMBUs bachelor i fornybar energi er tverrfaglig og kombinerer realfag med økonomi og samfunnsfag; den er ikke en ingeniørutdanning. Den eneste direkte parallellen var HVLs bachelor i fornybar energi i Sogndal, som hadde siste opptak i 2024 og derfor er ført med default false. Ingeniør- og sivilingeniørutdanningene i fornybar energi ved NTNU, UiA og UiT har realfagskrav (R1+R2+FYS1) og en annen søkergruppe, men er de største alternativene for søkere som vil jobbe med fornybar energi, og er tatt med som svakere sammenligninger. NTNU tar opp til fornybar energi-ingeniør på tre studiesteder med hver sin studiekode; alle tre er tatt med slik at det samlede bildet kommer fram.',
    nmbuIds: ['nmbu_fornybar'], defaultIds: ['nmbu_fornybar'],
    entries: [
      {
        id: 'nmbu_fornybar', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192835', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/fornybar-energi',
        years: {
          '2020': Y(null, null, null, null, null, null, 46.8, 53.1),
          '2021': Y(926, 99, 35, 45.5, 892, 54, 48.8, 54.6),
          '2022': Y(709, 59, 35, 55.9, 682, 56, 48.2, 52.1),
          '2023': Y(753, 80, 35, 50.0, 711, 96, 46.2, 46.4),
          '2024': Y(616, 53, 35, 45.3, 576, 88, 43.6, 43.8),
          '2025': Y(480, 39, 35, 46.2, 456, 83, 0, 0),
          '2026': Y(511, 38, 35, 50.0, 470, 94, 0, 0),
        },
      },
      {
        id: 'hvl_fornybar', shortName: 'HVL', institusjon: 'Høgskulen på Vestlandet',
        studiekode: '203835', studiested: 'Sogndal', type: 'bachelor',
        url: 'https://www.hvl.no/studier/studieprogram/fornybar-energi/',
        years: {
          '2020': Y(null, null, null, null, null, null, 31.8, 38.9),
          '2021': Y(482, 45, 40, 28.9, 452, 124, 0, 35.1),
          '2022': Y(408, 38, 40, 34.2, 366, 94, 0, 0),
          '2023': Y(341, 32, 40, 43.8, 309, 65, 0, 0),
          '2024': Y(242, 15, 35, 26.7, 222, 34, 0, 0),
        },
      },
      {
        id: 'ntnu_ing_fornybar_trondheim', shortName: 'NTNU Trondheim', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194822', studiested: 'Trondheim', type: 'bachelor',
        url: 'https://www.ntnu.no/studier/biforen',
        years: {
          '2020': Y(null, null, null, null, null, null, 53.5, 54.3),
          '2021': Y(1426, 148, 85, 38.5, 1253, 135, 54.0, 55.0),
          '2022': Y(1441, 147, 85, 44.9, 1251, 140, 53.6, 54.0),
          '2023': Y(1524, 181, 70, 32.6, 1307, 130, 53.5, 56.5),
          '2024': Y(1222, 139, 70, 36.0, 1051, 122, 52.6, 55.0),
          '2025': Y(1183, 93, 80, 47.3, 1041, 126, 49.8, 50.4),
          '2026': Y(1177, 82, 80, 36.6, 1014, 130, 49.1, 49.8),
        },
      },
      {
        id: 'ntnu_ing_fornybar_gjovik', shortName: 'NTNU Gjøvik', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194835', studiested: 'Gjøvik', type: 'bachelor',
        url: 'https://www.ntnu.no/studier/biforen',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(292, 32, 20, 15.6, 188, 30, 0, 0),
          '2022': Y(242, 34, 18, 20.6, 163, 28, 0, 0),
          '2023': Y(211, 11, 20, 27.3, 138, 17, 0, 0),
          '2024': Y(181, 15, 20, 46.7, 111, 15, 0, 0),
          '2025': Y(152, 16, 10, 43.8, 99, 9, 0, 0),
          '2026': Y(112, 10, 7, 50.0, 71, 9, 39.9, 39.0),
        },
      },
      {
        id: 'ntnu_ing_fornybar_alesund', shortName: 'NTNU Ålesund', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194072', studiested: 'Ålesund', type: 'bachelor',
        url: 'https://www.ntnu.no/studier/biforen',
        years: {
          '2020': Y(null, null, null, null, null, null, 43.0, 40.5),
          '2021': Y(264, 11, 15, 45.5, 180, 22, 0, 0),
          '2022': Y(231, 21, 15, 33.3, 158, 25, 45.1, 44.0),
          '2023': Y(204, 14, 15, 57.1, 144, 25, 45.0, 44.0),
          '2024': Y(234, 20, 15, 50.0, 175, 24, 45.3, 51.2),
          '2025': Y(233, 14, 20, 14.3, 185, 22, 0, 0),
          '2026': Y(180, 11, 15, 45.5, 119, 16, 0, 0),
        },
      },
      {
        id: 'uia_ing_fornybar', shortName: 'UiA', institusjon: 'Universitetet i Agder',
        studiekode: '201006', studiested: 'Grimstad', type: 'bachelor',
        url: 'https://www.uia.no/studier/program/fornybar-energi-bachelor/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': Y(286, 35, 40, 34.3, 189, 40, 0, 0),
          '2022': Y(228, 30, 40, 26.7, 140, 24, 0, 0),
          '2023': Y(243, 36, 40, 38.9, 145, 29, 0, 0),
          '2024': Y(271, 38, 40, 39.5, 165, 29, 0, 0),
          '2025': Y(208, 32, 40, 34.4, 133, 22, 0, 0),
          '2026': Y(162, 21, 40, 28.6, 97, 15, 0, 0),
        },
      },
      {
        id: 'uit_fornybar', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '186809', studiested: 'Tromsø', type: 'master',
        url: 'https://uit.no/utdanning/program/798891/fornybar_energi_sivilingenior_-_master',
        years: {
          '2023': Y(268, 29, 20, 34.5, 201, 34, 0, 0),
          '2024': Y(188, 19, 20, 36.8, 150, 29, 0, 0),
          '2025': Y(168, 21, 15, 42.9, 137, 24, 0, 0),
          '2026': Y(154, 16, 15, 50.0, 119, 18, 0, 0),
        },
      },
    ],
  },
  {
    id: 'radioaktivitet', label: 'Radioaktivitet og miljø', level: 'bachelor',
    desc: 'Viser opptakstallene for NMBUs bachelor i radioaktivitet og miljø, som ikke har noen tilsvarende utdanning i Norge.',
    note: 'Gruppen har bare NMBU. Programmet startet opp i 2024 og er den eneste bachelorutdanningen i Norge innen radioaktivitet, strålevern og radioøkologi; søk i Samordna opptak på radio-, stråle-, nukleær- og kjernefag gir ingen sammenlignbare program ved andre institusjoner. Tallene bør derfor leses som en tidsserie for NMBU alene, ikke som en sammenligning.',
    nmbuIds: ['nmbu_radioaktivitet'], defaultIds: ['nmbu_radioaktivitet'],
    entries: [
      {
        id: 'nmbu_radioaktivitet', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192315', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/radioaktivitet-og-miljo',
        years: {
          '2024': Y(200, 10, 20, 60.0, 167, 15, 0, 0),
          '2025': Y(135, 11, 20, 45.5, 115, 12, 0, 0),
          '2026': Y(127, 7, 20, 28.6, 111, 10, 0, 0),
        },
      },
    ],
  },
  {
    id: 'skogfag2', label: 'Skogfag (2-årig master)', level: 'master2',
    desc: 'Sammenligner de toårige masterne i skogfag med lokalt opptak.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere» (søknadsalternativer), kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (alle søknadsalternativer uansett prioritet; kvalifiserte = søknadsalternativer merket kvalifisert). Studieplasser, førstevalgssøkere, kvinneandel og poenggrenser publiseres ikke per program i denne tabellen og står derfor som null. DBH har ikke rapportert høstopptaket 2026 ennå, så 2026 er tomt for alle programmene. Universitetet i Innlandet er den eneste andre institusjonen med en master i skogfag; «Bærekraftig skogforvaltning» på Evenstad hadde første opptak i 2024 og er samlings- og nettbasert, noe som gjør at den trekker en annen og mer yrkesaktiv søkergruppe enn NMBUs heltidsmaster. INN rapporterte til og med 2024 under institusjonskoden til Høgskolen i Innlandet og fra 2025 under Universitetet i Innlandet; begge er slått sammen her. Nord universitet har bachelor, men ingen master i skogfag.',
    nmbuIds: ['nmbu_skogfag2'], defaultIds: ['nmbu_skogfag2', 'inn_skogforvaltning2'],
    entries: [
      {
        id: 'nmbu_skogfag2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/skogfag',
        years: {
          '2021': Y(62, null, null, null, 49, 33, null, null),
          '2022': Y(42, null, null, null, 32, 17, null, null),
          '2023': Y(52, null, null, null, 30, 27, null, null),
          '2024': Y(47, null, null, null, 32, 22, null, null),
          '2025': Y(52, null, null, null, 31, 25, null, null),
        },
      },
      {
        id: 'inn_skogforvaltning2', shortName: 'INN', institusjon: 'Universitetet i Innlandet',
        studiekode: '', studiested: 'Stor-Elvdal', type: 'master2',
        url: 'https://www.inn.no/studier/vare-studier/master-i-berekraftig-skogforvaltning/',
        years: {
          '2024': Y(82, null, null, null, 68, 48, null, null),
          '2025': Y(82, null, null, null, 72, 57, null, null),
        },
      },
    ],
  },
  {
    id: 'okologi2', label: 'Økologi (2-årig master)', level: 'master2',
    desc: 'Sammenligner de toårige masterne i økologi med lokalt opptak.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere» (søknadsalternativer), kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (alle søknadsalternativer uansett prioritet; kvalifiserte = søknadsalternativer merket kvalifisert). Studieplasser, førstevalgssøkere, kvinneandel og poenggrenser publiseres ikke per program i denne tabellen og står derfor som null. DBH har ikke rapportert høstopptaket 2026 ennå, så 2026 er tomt for alle programmene. NMBUs master i økologi er engelskspråklig, og fallet i søkertall fra 2023 til 2024 henger sammen med innføringen av studieavgift for søkere utenfor EØS. Universitetet i Innlandets «Anvendt økologi» på Evenstad er den nærmeste norske parallellen; INN rapporterte til og med 2024 under Høgskolen i Innlandet og fra 2025 under Universitetet i Innlandet, og de to seriene er slått sammen. Biologimasterne ved NTNU og UiT dekker økologi som én av flere retninger og er tatt med som svakere sammenligninger (default false). UiBs «Global endringsøkologi» er utelatt fordi den er så ny at DBH bare har to årganger med svært få søkere.',
    nmbuIds: ['nmbu_okologi2'], defaultIds: ['nmbu_okologi2', 'inn_anvendt_okologi2'],
    entries: [
      {
        id: 'nmbu_okologi2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/okologi',
        years: {
          '2021': Y(282, null, null, null, 115, 47, null, null),
          '2022': Y(327, null, null, null, 137, 40, null, null),
          '2023': Y(295, null, null, null, 110, 57, null, null),
          '2024': Y(179, null, null, null, 102, 42, null, null),
          '2025': Y(196, null, null, null, 76, 41, null, null),
        },
      },
      {
        id: 'inn_anvendt_okologi2', shortName: 'INN', institusjon: 'Universitetet i Innlandet',
        studiekode: '', studiested: 'Stor-Elvdal', type: 'master2',
        url: 'https://www.inn.no/studier/vare-studier/master-i-anvendt-okologi/',
        years: {
          '2021': Y(461, null, null, null, 120, 59, null, null),
          '2022': Y(364, null, null, null, 120, 57, null, null),
          '2023': Y(434, null, null, null, 64, 48, null, null),
          '2024': Y(108, null, null, null, 50, 47, null, null),
          '2025': Y(118, null, null, null, 53, 48, null, null),
        },
      },
      {
        id: 'ntnu_biologi2', shortName: 'NTNU Biologi', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        url: 'https://www.ntnu.no/studier/msbio',
        years: {
          '2021': Y(842, null, null, null, 332, 85, null, null),
          '2022': Y(869, null, null, null, 343, 66, null, null),
          '2023': Y(484, null, null, null, 173, 60, null, null),
          '2024': Y(256, null, null, null, 132, 57, null, null),
          '2025': Y(310, null, null, null, 153, 64, null, null),
        },
      },
      {
        id: 'uit_biologi2', shortName: 'UiT Biologi', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '', studiested: 'Tromsø', type: 'master2',
        url: 'https://uit.no/utdanning/program/270464/biology_-_master',
        years: {
          '2021': Y(352, null, null, null, 124, 111, null, null),
          '2022': Y(645, null, null, null, 216, 104, null, null),
          '2023': Y(693, null, null, null, 310, 133, null, null),
          '2024': Y(508, null, null, null, 284, 128, null, null),
          '2025': Y(546, null, null, null, 275, 130, null, null),
        },
      },
    ],
  },
  {
    id: 'naturforvaltning2', label: 'Naturforvaltning (2-årig master)', level: 'master2',
    desc: 'Sammenligner de toårige masterne i natur- og naturressursforvaltning med lokalt opptak.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere» (søknadsalternativer), kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (alle søknadsalternativer uansett prioritet; kvalifiserte = søknadsalternativer merket kvalifisert). Studieplasser, førstevalgssøkere, kvinneandel og poenggrenser publiseres ikke per program i denne tabellen og står derfor som null. DBH har ikke rapportert høstopptaket 2026 ennå, så 2026 er tomt for alle programmene. NTNUs «Naturressursforvaltning» og USNs «Økologi og miljøforvaltning» i Bø er de nærmeste sammenligningene. USN byttet programkode i 2022 (fra «Master i natur-, helse- og miljøvern» til «Master i økologi og miljøforvaltning»); de to kodene er slått sammen til én serie, og 2021-tallet gjelder det gamle programmet. Universitetet i Innlandets «Anvendt økologi» er også med her fordi den er forvaltningsrettet, og ligger i tillegg i gruppen for økologi. Nord universitet har ingen master i naturforvaltning.',
    nmbuIds: ['nmbu_naturforvaltning2'], defaultIds: ['nmbu_naturforvaltning2', 'ntnu_naturressurs2', 'usn_okologi_miljoforvaltning2'],
    entries: [
      {
        id: 'nmbu_naturforvaltning2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/naturforvaltning',
        years: {
          '2021': Y(183, null, null, null, 138, 44, null, null),
          '2022': Y(173, null, null, null, 130, 37, null, null),
          '2023': Y(183, null, null, null, 129, 38, null, null),
          '2024': Y(181, null, null, null, 127, 47, null, null),
          '2025': Y(183, null, null, null, 108, 47, null, null),
        },
      },
      {
        id: 'ntnu_naturressurs2', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        url: 'https://www.ntnu.no/studier/msnarm',
        years: {
          '2021': Y(278, null, null, null, 89, 50, null, null),
          '2022': Y(299, null, null, null, 102, 47, null, null),
          '2023': Y(267, null, null, null, 75, 40, null, null),
          '2024': Y(153, null, null, null, 69, 32, null, null),
          '2025': Y(170, null, null, null, 88, 41, null, null),
        },
      },
      {
        id: 'usn_okologi_miljoforvaltning2', shortName: 'USN', institusjon: 'Universitetet i Sørøst-Norge',
        studiekode: '', studiested: 'Midt-Telemark', type: 'master2',
        url: 'https://www.usn.no/studier/master-i-okologi-og-miljoforvaltning/',
        years: {
          '2021': Y(77, null, null, null, 45, 39, null, null),
          '2022': Y(357, null, null, null, 171, 101, null, null),
          '2023': Y(310, null, null, null, 100, 100, null, null),
          '2024': Y(116, null, null, null, 90, 88, null, null),
          '2025': Y(130, null, null, null, 88, 87, null, null),
        },
      },
      {
        id: 'inn_anvendt_okologi_nf2', shortName: 'INN', institusjon: 'Universitetet i Innlandet',
        studiekode: '', studiested: 'Stor-Elvdal', type: 'master2',
        url: 'https://www.inn.no/studier/vare-studier/master-i-anvendt-okologi/',
        years: {
          '2021': Y(461, null, null, null, 120, 59, null, null),
          '2022': Y(364, null, null, null, 120, 57, null, null),
          '2023': Y(434, null, null, null, 64, 48, null, null),
          '2024': Y(108, null, null, null, 50, 47, null, null),
          '2025': Y(118, null, null, null, 53, 48, null, null),
        },
      },
    ],
  },
  {
    id: 'miljonatur2', label: 'Miljøvitenskap (2-årig master)', level: 'master2',
    desc: 'Sammenligner de toårige masterne i miljøvitenskap og geofag med lokalt opptak.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere» (søknadsalternativer), kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (alle søknadsalternativer uansett prioritet; kvalifiserte = søknadsalternativer merket kvalifisert). Studieplasser, førstevalgssøkere, kvinneandel og poenggrenser publiseres ikke per program i denne tabellen og står derfor som null. DBH har ikke rapportert høstopptaket 2026 ennå, så 2026 er tomt for alle programmene. NMBUs master i miljøvitenskap overtok etter «Miljø og naturressurser» fra opptaket 2022; forgjengeren er tatt med med default false slik at 2021-tallet kan følges. NTNUs «Miljøtoksikologi og naturmiljøkjemi» er den nærmeste faglige parallellen på forurensnings- og miljøkjemisiden, og NTNUs «Industriell økologi» dekker miljøanalyse og livsløpsvurdering. Geofagsmasterne ved UiO og UiB er bredere geovitenskapelige program og er tatt med som svakere sammenligninger (default false).',
    nmbuIds: ['nmbu_miljovitenskap2', 'nmbu_mina2_forgjenger'], defaultIds: ['nmbu_miljovitenskap2', 'ntnu_miljotoks2', 'ntnu_industriell_okologi2'],
    entries: [
      {
        id: 'nmbu_miljovitenskap2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/miljovitenskap',
        years: {
          '2022': Y(99, null, null, null, 59, 42, null, null),
          '2023': Y(91, null, null, null, 45, 33, null, null),
          '2024': Y(87, null, null, null, 44, 38, null, null),
          '2025': Y(98, null, null, null, 42, 35, null, null),
        },
      },
      {
        id: 'nmbu_mina2_forgjenger', shortName: 'NMBU Miljø og naturressurser', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/miljovitenskap',
        years: {
          '2021': Y(118, null, null, null, 69, 41, null, null),
        },
      },
      {
        id: 'ntnu_miljotoks2', shortName: 'NTNU Miljøtoksikologi', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        url: 'https://www.ntnu.no/studier/msenvitox',
        years: {
          '2021': Y(217, null, null, null, 85, 41, null, null),
          '2022': Y(258, null, null, null, 86, 35, null, null),
          '2023': Y(219, null, null, null, 55, 33, null, null),
          '2024': Y(72, null, null, null, 37, 20, null, null),
          '2025': Y(108, null, null, null, 62, 23, null, null),
        },
      },
      {
        id: 'ntnu_industriell_okologi2', shortName: 'NTNU Industriell økologi', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        url: 'https://www.ntnu.no/studier/msindecol',
        years: {
          '2021': Y(232, null, null, null, 135, 42, null, null),
          '2022': Y(183, null, null, null, 89, 40, null, null),
          '2023': Y(134, null, null, null, 56, 40, null, null),
          '2024': Y(92, null, null, null, 54, 32, null, null),
          '2025': Y(106, null, null, null, 53, 27, null, null),
        },
      },
      {
        id: 'uio_geofag2', shortName: 'UiO Geofag', institusjon: 'Universitetet i Oslo',
        studiekode: '', studiested: 'Oslo', type: 'master2',
        url: 'https://www.uio.no/studier/program/geofag-master/',
        years: {
          '2021': Y(389, null, null, null, 209, 108, null, null),
          '2022': Y(579, null, null, null, 204, 104, null, null),
          '2023': Y(486, null, null, null, 194, 94, null, null),
          '2024': Y(425, null, null, null, 237, 133, null, null),
          '2025': Y(498, null, null, null, 285, 146, null, null),
        },
      },
      {
        id: 'uib_geovitenskap2', shortName: 'UiB Geovitskap', institusjon: 'Universitetet i Bergen',
        studiekode: '', studiested: 'Bergen', type: 'master2',
        url: 'https://www.uib.no/studieprogram/MAMN-GEOV',
        years: {
          '2021': Y(84, null, null, null, 57, 54, null, null),
          '2022': Y(352, null, null, null, 84, 69, null, null),
          '2023': Y(355, null, null, null, 103, 93, null, null),
          '2024': Y(148, null, null, null, 107, 90, null, null),
          '2025': Y(236, null, null, null, 155, 95, null, null),
        },
      },
    ],
  },
  {
    id: 'fornybar2', label: 'Fornybar energi (2-årig master)', level: 'master2',
    desc: 'Sammenligner de toårige masterne i fornybar energi med lokalt opptak.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere» (søknadsalternativer), kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (alle søknadsalternativer uansett prioritet; kvalifiserte = søknadsalternativer merket kvalifisert). Studieplasser, førstevalgssøkere, kvinneandel og poenggrenser publiseres ikke per program i denne tabellen og står derfor som null. DBH har ikke rapportert høstopptaket 2026 ennå, så 2026 er tomt for alle programmene. UiOs «Fornybare energisystemer» på Kjeller er den nærmeste tverrfaglige parallellen til NMBUs master. UiAs og HVLs mastere gir sivilingeniørgrad og NTNUs «Bærekraftig energi» er engelskspråklig; alle tre krever ingeniør- eller realfagsbakgrunn og er tatt med som svakere sammenligninger (default false). HVLs master startet opp i 2023. Nedgangen i søkertall fra 2023 til 2024 ved de engelskspråklige programmene henger sammen med innføringen av studieavgift for søkere utenfor EØS.',
    nmbuIds: ['nmbu_fornybar2'], defaultIds: ['nmbu_fornybar2', 'uio_fornybare_energisystemer2'],
    entries: [
      {
        id: 'nmbu_fornybar2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/fornybar-energi',
        years: {
          '2021': Y(144, null, null, null, 82, 50, null, null),
          '2022': Y(126, null, null, null, 62, 44, null, null),
          '2023': Y(131, null, null, null, 51, 45, null, null),
          '2024': Y(88, null, null, null, 30, 27, null, null),
          '2025': Y(95, null, null, null, 49, 45, null, null),
        },
      },
      {
        id: 'uio_fornybare_energisystemer2', shortName: 'UiO', institusjon: 'Universitetet i Oslo',
        studiekode: '', studiested: 'Oslo', type: 'master2',
        url: 'https://www.uio.no/studier/program/fornybar-energi-master/',
        years: {
          '2021': Y(803, null, null, null, 117, 54, null, null),
          '2022': Y(572, null, null, null, 170, 59, null, null),
          '2023': Y(640, null, null, null, 126, 71, null, null),
          '2024': Y(238, null, null, null, 105, 75, null, null),
          '2025': Y(192, null, null, null, 77, 63, null, null),
        },
      },
      {
        id: 'uia_fornybar2', shortName: 'UiA', institusjon: 'Universitetet i Agder',
        studiekode: '', studiested: 'Grimstad', type: 'master2',
        url: 'https://www.uia.no/studier/program/fornybar-energi-master-2-ar/',
        years: {
          '2021': Y(253, null, null, null, 117, 71, null, null),
          '2022': Y(171, null, null, null, 86, 58, null, null),
          '2023': Y(142, null, null, null, 69, 46, null, null),
          '2024': Y(148, null, null, null, 79, 46, null, null),
          '2025': Y(133, null, null, null, 51, 31, null, null),
        },
      },
      {
        id: 'ntnu_baerekraftig_energi2', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        url: 'https://www.ntnu.no/studier/msse',
        years: {
          '2021': Y(949, null, null, null, 220, 69, null, null),
          '2022': Y(720, null, null, null, 203, 35, null, null),
          '2023': Y(582, null, null, null, 84, 44, null, null),
          '2024': Y(194, null, null, null, 52, 17, null, null),
          '2025': Y(194, null, null, null, 32, 7, null, null),
        },
      },
      {
        id: 'hvl_energiteknologi2', shortName: 'HVL', institusjon: 'Høgskulen på Vestlandet',
        studiekode: '', studiested: 'Bergen', type: 'master2',
        url: 'https://www.hvl.no/studier/studieprogram/berekraftig-energiteknologi/',
        years: {
          '2023': Y(102, null, null, null, 49, 40, null, null),
          '2024': Y(109, null, null, null, 46, 42, null, null),
          '2025': Y(112, null, null, null, 37, 36, null, null),
        },
      },
    ],
  },
];
