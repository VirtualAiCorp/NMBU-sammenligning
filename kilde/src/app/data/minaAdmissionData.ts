// GENERERT av scripts/build-landsam-data.py 2026-09-23 – ikke rediger for hånd.
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
          '2021': { ...Y(326, 68, 25, 38.2, 313, 36, 45.0, 52.9), op_mott: 51.7, kp_mott: 45.1, op_fv: 49.5, op_alle: 50.6, n_mott: 21 },
          '2022': { ...Y(289, 59, 25, 30.5, 278, 38, 46.1, 53.7), op_mott: 53.4, kp_mott: 47.7, op_fv: 49.3, op_alle: 51.3, n_mott: 20 },
          '2023': { ...Y(287, 68, 35, 39.7, 272, 68, 40.1, 44.8), op_mott: 50.7, kp_mott: 44.1, op_fv: 48.8, op_alle: 51.5, n_mott: 31 },
          '2024': { ...Y(342, 87, 35, 41.4, 325, 70, 40.4, 49.0), op_mott: 52.6, kp_mott: 47.1, op_fv: 49.8, op_alle: 50.4, n_mott: 32 },
          '2025': { ...Y(342, 74, 35, 23.0, 331, 74, 40.3, 45.8), op_mott: 52.4, kp_mott: 45.9, op_fv: 49.8, op_alle: 51.1, n_mott: 36 },
          '2026': Y(313, 59, 35, 33.9, 294, 68, 0, 44.8),
        },
      },
      {
        id: 'inn_skogfag', shortName: 'INN', institusjon: 'Universitetet i Innlandet',
        studiekode: '209322', studiested: 'Stor-Elvdal', type: 'bachelor',
        url: 'https://www.inn.no/studier/vare-studier/bachelor-i-skogfag/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(168, 19, 25, 21.1, 161, 50, 0, 0), op_mott: 48.9, kp_mott: 40.3, op_fv: 52.6, op_alle: 48.6, n_mott: 14 },
          '2022': { ...Y(150, 36, 25, 16.7, 144, 47, 0, 0), op_mott: 48.0, kp_mott: 40.3, op_fv: 47.2, op_alle: 47.3, n_mott: 13 },
          '2023': { ...Y(155, 34, 25, 17.6, 143, 40, 0, 0), op_mott: 42.0, kp_mott: 37.4, op_fv: 43.2, op_alle: 46.2, n_mott: 13 },
          '2024': { ...Y(152, 31, 25, 22.6, 138, 33, 0, 0), op_mott: 46.0, kp_mott: 41.1, op_fv: 46.4, op_alle: 47.2, n_mott: 12 },
          '2025': { ...Y(129, 33, 25, 21.2, 116, 32, 0, 0), op_mott: 46.8, kp_mott: 41.4, op_fv: 47.4, op_alle: 47.7, n_mott: 14 },
          '2026': Y(153, 33, 25, 39.4, 139, 38, 0, 0),
        },
      },
      {
        id: 'nord_skogfag', shortName: 'Nord', institusjon: 'Nord universitet',
        studiekode: '204322', studiested: 'Steinkjer', type: 'bachelor',
        url: 'https://www.nord.no/studier/skogfag-bachelor',
        years: {
          '2025': { ...Y(72, 13, 20, 30.8, 67, 13, 0, 0), op_mott: 52.2, kp_mott: 46.2, op_fv: 49.0, op_alle: 47.7, n_mott: 5 },
          '2026': Y(78, 15, 20, 46.7, 71, 18, 0, 0),
        },
      },
      {
        id: 'inn_utmark_skog', shortName: 'INN Utmarksforvaltning', institusjon: 'Universitetet i Innlandet',
        studiekode: '209323', studiested: 'Stor-Elvdal', type: 'bachelor',
        url: 'https://www.inn.no/studier/vare-studier/bachelor-i-utmarksforvaltning/',
        poengFellesMed: ['inn_utmarksforvaltning'],
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(258, 56, 25, 28.6, 243, 50, 39.3, 44.5), op_mott: 48.2, kp_mott: 39.8, op_fv: 49.5, op_alle: 50.0, n_mott: 26 },
          '2022': { ...Y(186, 39, 25, 33.3, 177, 45, 0, 0), op_mott: 47.6, kp_mott: 41.2, op_fv: 47.5, op_alle: 47.7, n_mott: 15 },
          '2023': { ...Y(207, 41, 25, 41.5, 197, 50, 0, 0), op_mott: 50.8, kp_mott: 44.1, op_fv: 48.5, op_alle: 48.9, n_mott: 17 },
          '2024': { ...Y(195, 34, 25, 50.0, 182, 43, 0, 0), op_mott: 47.7, kp_mott: 41.3, op_fv: 46.6, op_alle: 47.1, n_mott: 16 },
          '2025': { ...Y(166, 25, 25, 36.0, 156, 25, 0, 0), op_mott: 48.2, kp_mott: 41.4, op_fv: 48.9, op_alle: 49.0, n_mott: 16 },
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
          '2021': { ...Y(393, 72, 30, 59.7, 310, 42, 49.4, 56.3), op_mott: 58.3, kp_mott: 50.1, op_fv: 54.7, op_alle: 55.6, n_mott: 25 },
          '2022': { ...Y(321, 64, 30, 59.4, 259, 42, 49.8, 56.9), op_mott: 58.4, kp_mott: 49.1, op_fv: 56.7, op_alle: 56.9, n_mott: 25 },
          '2023': { ...Y(303, 56, 30, 71.4, 238, 55, 0, 0), op_mott: 57.0, kp_mott: 48.4, op_fv: 58.2, op_alle: 56.4, n_mott: 25 },
          '2024': { ...Y(299, 64, 30, 45.3, 238, 57, 0, 0), op_mott: 56.4, kp_mott: 47.5, op_fv: 56.1, op_alle: 55.2, n_mott: 27 },
          '2025': { ...Y(332, 57, 30, 45.6, 259, 50, 0, 0), op_mott: 55.4, kp_mott: 47.2, op_fv: 54.9, op_alle: 55.8, n_mott: 27 },
          '2026': Y(271, 45, 30, 51.1, 202, 44, 0, 0),
        },
      },
      {
        id: 'inn_utmarksforvaltning', shortName: 'INN', institusjon: 'Universitetet i Innlandet',
        studiekode: '209323', studiested: 'Stor-Elvdal', type: 'bachelor',
        url: 'https://www.inn.no/studier/vare-studier/bachelor-i-utmarksforvaltning/',
        poengFellesMed: ['inn_utmark_skog'],
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(258, 56, 25, 28.6, 243, 50, 39.3, 44.5), op_mott: 48.2, kp_mott: 39.8, op_fv: 49.5, op_alle: 50.0, n_mott: 26 },
          '2022': { ...Y(186, 39, 25, 33.3, 177, 45, 0, 0), op_mott: 47.6, kp_mott: 41.2, op_fv: 47.5, op_alle: 47.7, n_mott: 15 },
          '2023': { ...Y(207, 41, 25, 41.5, 197, 50, 0, 0), op_mott: 50.8, kp_mott: 44.1, op_fv: 48.5, op_alle: 48.9, n_mott: 17 },
          '2024': { ...Y(195, 34, 25, 50.0, 182, 43, 0, 0), op_mott: 47.7, kp_mott: 41.3, op_fv: 46.6, op_alle: 47.1, n_mott: 16 },
          '2025': { ...Y(166, 25, 25, 36.0, 156, 25, 0, 0), op_mott: 48.2, kp_mott: 41.4, op_fv: 48.9, op_alle: 49.0, n_mott: 16 },
          '2026': Y(167, 37, 25, 27.0, 156, 40, 0, 0),
        },
      },
      {
        id: 'nord_naturforvaltning', shortName: 'Nord', institusjon: 'Nord universitet',
        studiekode: '204388', studiested: 'Steinkjer', type: 'bachelor',
        url: 'https://www.nord.no/studier/naturforvaltning-bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 44.7),
          '2021': { ...Y(287, 58, 37, 48.3, 263, 81, 0, 0), op_mott: 48.3, kp_mott: 41.9, op_fv: 48.6, op_alle: 48.0, n_mott: 20 },
          '2022': { ...Y(245, 47, 37, 36.2, 228, 65, 0, 0), op_mott: 44.5, kp_mott: 37.7, op_fv: 46.4, op_alle: 47.0, n_mott: 26 },
          '2023': { ...Y(213, 34, 37, 35.3, 199, 44, 0, 0), op_mott: 48.5, kp_mott: 42.5, op_fv: 48.7, op_alle: 48.7, n_mott: 20 },
          '2024': { ...Y(203, 39, 32, 28.2, 188, 39, 0, 0), op_mott: 47.1, kp_mott: 41.4, op_fv: 47.0, op_alle: 49.4, n_mott: 14 },
          '2025': { ...Y(218, 47, 30, 42.6, 207, 56, 0, 0), op_mott: 47.9, kp_mott: 40.1, op_fv: 47.2, op_alle: 48.5, n_mott: 20 },
          '2026': Y(206, 33, 25, 36.4, 196, 31, 0, 0),
        },
      },
      {
        id: 'usn_naturmiljoforvaltning', shortName: 'USN', institusjon: 'Universitetet i Sørøst-Norge',
        studiekode: '222315', studiested: 'Midt-Telemark', type: 'bachelor',
        url: 'https://www.usn.no/studier/bachelor-i-natur-og-miljoforvaltning/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(308, 71, 45, 49.3, 292, 108, 0, 0), op_mott: 46.1, kp_mott: 37.9, op_fv: 45.7, op_alle: 47.4, n_mott: 44 },
          '2022': { ...Y(256, 68, 45, 48.5, 244, 82, 0, 0), op_mott: 48.1, kp_mott: 40.1, op_fv: 48.2, op_alle: 47.8, n_mott: 38 },
          '2023': { ...Y(206, 51, 45, 66.7, 189, 58, 0, 0), op_mott: 47.8, kp_mott: 40.4, op_fv: 48.4, op_alle: 47.8, n_mott: 22 },
          '2024': { ...Y(204, 58, 40, 58.6, 189, 61, 0, 0), op_mott: 47.8, kp_mott: 39.3, op_fv: 48.8, op_alle: 48.8, n_mott: 32 },
          '2025': { ...Y(172, 44, 40, 61.4, 165, 47, 0, 0), op_mott: 50.3, kp_mott: 42.9, op_fv: 49.6, op_alle: 48.7, n_mott: 23 },
          '2026': Y(162, 45, 40, 55.6, 158, 52, 0, 0),
        },
      },
      {
        id: 'uit_biologi', shortName: 'UiT Biologi', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '186327', studiested: 'Tromsø', type: 'bachelor',
        url: 'https://uit.no/utdanning/program/274284/biologi_-_bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(377, 51, 60, 58.8, 290, 76, 0, 0), op_mott: 52.1, kp_mott: 44.7, op_fv: 53.2, op_alle: 51.6, n_mott: 37 },
          '2022': { ...Y(313, 50, 60, 60.0, 249, 44, 0, 0), op_mott: 48.3, kp_mott: 40.0, op_fv: 49.6, op_alle: 51.5, n_mott: 18 },
          '2023': { ...Y(266, 35, 60, 65.7, 206, 36, 0, 0), op_mott: 52.5, kp_mott: 45.9, op_fv: 53.6, op_alle: 54.8, n_mott: 13 },
          '2024': { ...Y(261, 47, 60, 72.3, 207, 46, 0, 0), op_mott: 54.3, kp_mott: 45.9, op_fv: 54.0, op_alle: 54.3, n_mott: 27 },
          '2025': { ...Y(234, 39, 35, 69.2, 189, 40, 0, 0), op_mott: 54.3, kp_mott: 46.2, op_fv: 54.4, op_alle: 53.8, n_mott: 25 },
          '2026': Y(231, 32, 35, 62.5, 183, 28, 0, 0),
        },
      },
      {
        id: 'uia_biologi', shortName: 'UiA Biologi', institusjon: 'Universitetet i Agder',
        studiekode: '201327', studiested: 'Kristiansand', type: 'bachelor',
        url: 'https://www.uia.no/studier/biologi',
        years: {
          '2020': Y(null, null, null, null, null, null, 43.7, 48.9),
          '2021': { ...Y(303, 39, 35, 43.6, 248, 60, 40.4, 43.8), op_mott: 48.9, kp_mott: 39.8, op_fv: 47.8, op_alle: 49.0, n_mott: 22 },
          '2022': { ...Y(296, 47, 40, 66.0, 224, 45, 0, 0), op_mott: 49.2, kp_mott: 42.6, op_fv: 49.3, op_alle: 49.4, n_mott: 21 },
          '2023': { ...Y(257, 40, 40, 65.0, 189, 45, 0, 0), op_mott: 49.0, kp_mott: 41.8, op_fv: 48.6, op_alle: 49.1, n_mott: 24 },
          '2024': { ...Y(220, 35, 40, 54.3, 154, 28, 0, 0), op_mott: 48.2, kp_mott: 41.5, op_fv: 46.9, op_alle: 49.8, n_mott: 17 },
          '2025': { ...Y(205, 25, 30, 68.0, 146, 22, 0, 0), op_mott: 47.9, kp_mott: 40.9, op_fv: 51.1, op_alle: 48.5, n_mott: 15 },
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
          '2021': { ...Y(329, 21, 20, 71.4, 272, 30, 44.6, 50.8), op_mott: 52.1, kp_mott: 43.4, op_fv: 53.7, op_alle: 54.5, n_mott: 16 },
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
          '2025': { ...Y(570, 50, 25, 74.0, 534, 53, 38.8, 47.1), op_mott: 52.5, kp_mott: 45.4, op_fv: 52.0, op_alle: 52.5, n_mott: 24 },
          '2026': Y(379, 26, 25, 57.7, 355, 45, 31.6, 49.1),
        },
      },
      {
        id: 'uio_geologi_geografi', shortName: 'UiO Geologi og geografi', institusjon: 'Universitetet i Oslo',
        studiekode: '185858', studiested: 'Oslo', type: 'bachelor',
        url: 'https://www.uio.no/studier/program/geologi/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(253, 20, 25, 40.0, 142, 27, 0, 0), op_mott: 50.5, kp_mott: 41.7, op_fv: 55.2, op_alle: 53.8, n_mott: 7 },
          '2022': { ...Y(469, 78, 37, 46.2, 377, 75, 0, 49.7), op_mott: 51.7, kp_mott: 43.1, op_fv: 52.3, op_alle: 52.6, n_mott: 31 },
          '2023': { ...Y(404, 54, 55, 40.7, 319, 80, 0, 0), op_mott: 50.9, kp_mott: 43.2, op_fv: 52.9, op_alle: 53.8, n_mott: 20 },
          '2024': { ...Y(399, 73, 40, 45.2, 316, 78, 0, 0), op_mott: 51.4, kp_mott: 43.5, op_fv: 52.9, op_alle: 54.4, n_mott: 30 },
          '2025': { ...Y(404, 71, 40, 39.4, 311, 69, 0, 0), op_mott: 53.2, kp_mott: 43.1, op_fv: 53.3, op_alle: 53.4, n_mott: 37 },
          '2026': Y(361, 70, 40, 47.1, 274, 63, 0, 0),
        },
      },
      {
        id: 'uib_geovitenskap', shortName: 'UiB', institusjon: 'Universitetet i Bergen',
        studiekode: '184859', studiested: 'Bergen', type: 'bachelor',
        url: 'https://www.uib.no/studieprogram/BAMN-GEOV',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(456, 91, 57, 48.4, 405, 93, 44.0, 43.1), op_mott: 50.4, kp_mott: 43.1, op_fv: 49.7, op_alle: 50.8, n_mott: 55 },
          '2022': { ...Y(447, 80, 59, 53.8, 402, 109, 0, 0), op_mott: 51.3, kp_mott: 44.7, op_fv: 51.0, op_alle: 51.6, n_mott: 69 },
          '2023': { ...Y(452, 87, 54, 63.2, 394, 86, 46.2, 46.1), op_mott: 53.5, kp_mott: 45.7, op_fv: 51.2, op_alle: 52.9, n_mott: 48 },
          '2024': { ...Y(445, 95, 38, 52.6, 388, 77, 46.8, 49.2), op_mott: 54.6, kp_mott: 47.1, op_fv: 51.6, op_alle: 53.7, n_mott: 55 },
          '2025': { ...Y(481, 112, 38, 58.0, 425, 84, 49.3, 50.5), op_mott: 55.9, kp_mott: 48.4, op_fv: 53.3, op_alle: 53.7, n_mott: 54 },
          '2026': Y(412, 71, 38, 59.2, 343, 78, 46.5, 46.7),
        },
      },
      {
        id: 'ntnu_geologi', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194859', studiested: 'Trondheim', type: 'bachelor',
        url: 'https://www.ntnu.no/studier/bgeol',
        years: {
          '2020': Y(null, null, null, null, null, null, 51.5, 54.4),
          '2021': { ...Y(687, 129, 34, 49.6, 635, 60, 53.0, 55.4), op_mott: 58.0, kp_mott: 50.7, op_fv: 53.2, op_alle: 54.9, n_mott: 35 },
          '2022': { ...Y(648, 129, 34, 55.8, 587, 54, 53.0, 57.2), op_mott: 59.0, kp_mott: 50.1, op_fv: 55.3, op_alle: 55.9, n_mott: 29 },
          '2023': { ...Y(664, 145, 26, 61.4, 597, 68, 53.1, 57.9), op_mott: 59.7, kp_mott: 52.1, op_fv: 54.6, op_alle: 55.5, n_mott: 32 },
          '2024': { ...Y(608, 123, 33, 58.5, 553, 70, 52.2, 57.5), op_mott: 59.9, kp_mott: 51.3, op_fv: 54.8, op_alle: 56.1, n_mott: 30 },
          '2025': { ...Y(688, 122, 33, 53.3, 605, 84, 51.5, 55.1), op_mott: 58.8, kp_mott: 50.7, op_fv: 55.0, op_alle: 55.3, n_mott: 45 },
          '2026': Y(600, 114, 45, 48.2, 530, 86, 49.3, 53.1),
        },
      },
      {
        id: 'hvl_geologi_geofare', shortName: 'HVL', institusjon: 'Høgskulen på Vestlandet',
        studiekode: '203469', studiested: 'Sogndal', type: 'bachelor',
        url: 'https://www.hvl.no/studier/studieprogram/geologi-og-geofare/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(204, 30, 35, 50.0, 157, 38, 0, 0), op_mott: 48.9, kp_mott: 41.1, op_fv: 50.1, op_alle: 49.5, n_mott: 14 },
          '2022': { ...Y(197, 30, 25, 50.0, 147, 32, 0, 0), op_mott: 49.9, kp_mott: 42.7, op_fv: 48.8, op_alle: 50.5, n_mott: 16 },
          '2023': { ...Y(200, 33, 25, 60.6, 162, 39, 0, 0), op_mott: 53.7, kp_mott: 46.7, op_fv: 53.0, op_alle: 53.8, n_mott: 10 },
          '2024': { ...Y(173, 24, 25, 45.8, 139, 33, 0, 0), op_mott: 52.1, kp_mott: 44.3, op_fv: 54.0, op_alle: 51.6, n_mott: 15 },
          '2025': { ...Y(210, 39, 25, 51.3, 179, 48, 0, 0), op_mott: 52.6, kp_mott: 45.0, op_fv: 54.4, op_alle: 53.9, n_mott: 21 },
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
          '2021': { ...Y(926, 99, 35, 45.5, 892, 54, 48.8, 54.6), op_mott: 55.0, kp_mott: 46.2, op_fv: 50.7, op_alle: 51.2, n_mott: 15 },
          '2022': { ...Y(709, 59, 35, 55.9, 682, 56, 48.2, 52.1), op_mott: 53.8, kp_mott: 47.3, op_fv: 51.7, op_alle: 52.6, n_mott: 22 },
          '2023': { ...Y(753, 80, 35, 50.0, 711, 96, 46.2, 46.4), op_mott: 50.1, kp_mott: 45.1, op_fv: 48.8, op_alle: 51.3, n_mott: 16 },
          '2024': { ...Y(616, 53, 35, 45.3, 576, 88, 43.6, 43.8), op_mott: 51.9, kp_mott: 46.1, op_fv: 51.3, op_alle: 51.3, n_mott: 21 },
          '2025': { ...Y(480, 39, 35, 46.2, 456, 83, 0, 0), op_mott: 48.0, kp_mott: 40.5, op_fv: 47.4, op_alle: 51.0, n_mott: 21 },
          '2026': Y(511, 38, 35, 50.0, 470, 94, 0, 0),
        },
      },
      {
        id: 'hvl_fornybar', shortName: 'HVL', institusjon: 'Høgskulen på Vestlandet',
        studiekode: '203835', studiested: 'Sogndal', type: 'bachelor',
        url: 'https://www.hvl.no/studier/studieprogram/fornybar-energi/',
        years: {
          '2020': Y(null, null, null, null, null, null, 31.8, 38.9),
          '2021': { ...Y(482, 45, 40, 28.9, 452, 124, 0, 35.1), op_mott: 46.4, kp_mott: 38.9, op_fv: 48.5, op_alle: 46.7, n_mott: 23 },
          '2022': { ...Y(408, 38, 40, 34.2, 366, 94, 0, 0), op_mott: 42.8, kp_mott: 37.1, op_fv: 41.8, op_alle: 45.1, n_mott: 17 },
          '2023': { ...Y(341, 32, 40, 43.8, 309, 65, 0, 0), op_mott: 42.8, kp_mott: 38.9, op_fv: 44.6, op_alle: 44.8, n_mott: 10 },
          '2024': { ...Y(242, 15, 35, 26.7, 222, 34, 0, 0), op_mott: 43.0, kp_mott: 36.9, op_fv: 45.8, op_alle: 45.9, n_mott: 11 },
        },
      },
      {
        id: 'ntnu_ing_fornybar_trondheim', shortName: 'NTNU Trondheim', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194822', studiested: 'Trondheim', type: 'bachelor',
        url: 'https://www.ntnu.no/studier/biforen',
        poengFellesMed: ['ntnu_ing_fornybar_gjovik', 'ntnu_ing_fornybar_alesund'],
        years: {
          '2020': Y(null, null, null, null, null, null, 53.5, 54.3),
          '2021': { ...Y(1426, 148, 85, 38.5, 1253, 135, 54.0, 55.0), op_mott: 53.7, kp_mott: 45.1, op_fv: 54.1, op_alle: 54.7, n_mott: 100 },
          '2022': { ...Y(1441, 147, 85, 44.9, 1251, 140, 53.6, 54.0), op_mott: 54.4, kp_mott: 45.7, op_fv: 54.5, op_alle: 55.1, n_mott: 101 },
          '2023': { ...Y(1524, 181, 70, 32.6, 1307, 130, 53.5, 56.5), op_mott: 55.6, kp_mott: 47.3, op_fv: 54.5, op_alle: 55.1, n_mott: 93 },
          '2024': { ...Y(1222, 139, 70, 36.0, 1051, 122, 52.6, 55.0), op_mott: 54.9, kp_mott: 46.8, op_fv: 54.1, op_alle: 54.5, n_mott: 96 },
          '2025': { ...Y(1183, 93, 80, 47.3, 1041, 126, 49.8, 50.4), op_mott: 52.6, kp_mott: 44.8, op_fv: 52.5, op_alle: 54.2, n_mott: 90 },
          '2026': Y(1177, 82, 80, 36.6, 1014, 130, 49.1, 49.8),
        },
      },
      {
        id: 'ntnu_ing_fornybar_gjovik', shortName: 'NTNU Gjøvik', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194835', studiested: 'Gjøvik', type: 'bachelor',
        url: 'https://www.ntnu.no/studier/biforen',
        poengFellesMed: ['ntnu_ing_fornybar_trondheim', 'ntnu_ing_fornybar_alesund'],
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(292, 32, 20, 15.6, 188, 30, 0, 0), op_mott: 53.7, kp_mott: 45.1, op_fv: 54.1, op_alle: 54.7, n_mott: 100 },
          '2022': { ...Y(242, 34, 18, 20.6, 163, 28, 0, 0), op_mott: 54.4, kp_mott: 45.7, op_fv: 54.5, op_alle: 55.1, n_mott: 101 },
          '2023': { ...Y(211, 11, 20, 27.3, 138, 17, 0, 0), op_mott: 55.6, kp_mott: 47.3, op_fv: 54.5, op_alle: 55.1, n_mott: 93 },
          '2024': { ...Y(181, 15, 20, 46.7, 111, 15, 0, 0), op_mott: 54.9, kp_mott: 46.8, op_fv: 54.1, op_alle: 54.5, n_mott: 96 },
          '2025': { ...Y(152, 16, 10, 43.8, 99, 9, 0, 0), op_mott: 52.6, kp_mott: 44.8, op_fv: 52.5, op_alle: 54.2, n_mott: 90 },
          '2026': Y(112, 10, 7, 50.0, 71, 9, 39.9, 39.0),
        },
      },
      {
        id: 'ntnu_ing_fornybar_alesund', shortName: 'NTNU Ålesund', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194072', studiested: 'Ålesund', type: 'bachelor',
        url: 'https://www.ntnu.no/studier/biforen',
        poengFellesMed: ['ntnu_ing_fornybar_trondheim', 'ntnu_ing_fornybar_gjovik'],
        years: {
          '2020': Y(null, null, null, null, null, null, 43.0, 40.5),
          '2021': { ...Y(264, 11, 15, 45.5, 180, 22, 0, 0), op_mott: 53.7, kp_mott: 45.1, op_fv: 54.1, op_alle: 54.7, n_mott: 100 },
          '2022': { ...Y(231, 21, 15, 33.3, 158, 25, 45.1, 44.0), op_mott: 54.4, kp_mott: 45.7, op_fv: 54.5, op_alle: 55.1, n_mott: 101 },
          '2023': { ...Y(204, 14, 15, 57.1, 144, 25, 45.0, 44.0), op_mott: 55.6, kp_mott: 47.3, op_fv: 54.5, op_alle: 55.1, n_mott: 93 },
          '2024': { ...Y(234, 20, 15, 50.0, 175, 24, 45.3, 51.2), op_mott: 54.9, kp_mott: 46.8, op_fv: 54.1, op_alle: 54.5, n_mott: 96 },
          '2025': { ...Y(233, 14, 20, 14.3, 185, 22, 0, 0), op_mott: 52.6, kp_mott: 44.8, op_fv: 52.5, op_alle: 54.2, n_mott: 90 },
          '2026': Y(180, 11, 15, 45.5, 119, 16, 0, 0),
        },
      },
      {
        id: 'uia_ing_fornybar', shortName: 'UiA', institusjon: 'Universitetet i Agder',
        studiekode: '201006', studiested: 'Grimstad', type: 'bachelor',
        url: 'https://www.uia.no/studier/program/fornybar-energi-bachelor/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(286, 35, 40, 34.3, 189, 40, 0, 0), op_mott: 46.9, kp_mott: 37.6, op_fv: 49.8, op_alle: 50.0, n_mott: 22 },
          '2022': { ...Y(228, 30, 40, 26.7, 140, 24, 0, 0), op_mott: 49.9, kp_mott: 42.4, op_fv: 50.6, op_alle: 49.5, n_mott: 12 },
          '2023': { ...Y(243, 36, 40, 38.9, 145, 29, 0, 0), op_mott: 52.2, kp_mott: 45.2, op_fv: 52.4, op_alle: 49.8, n_mott: 17 },
          '2024': { ...Y(271, 38, 40, 39.5, 165, 29, 0, 0), op_mott: 50.6, kp_mott: 44.7, op_fv: 52.2, op_alle: 49.3, n_mott: 17 },
          '2025': { ...Y(208, 32, 40, 34.4, 133, 22, 0, 0), op_mott: 50.7, kp_mott: 43.3, op_fv: 50.2, op_alle: 50.9, n_mott: 15 },
          '2026': Y(162, 21, 40, 28.6, 97, 15, 0, 0),
        },
      },
      {
        id: 'uit_fornybar', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '186809', studiested: 'Tromsø', type: 'master',
        url: 'https://uit.no/utdanning/program/798891/fornybar_energi_sivilingenior_-_master',
        years: {
          '2023': { ...Y(268, 29, 20, 34.5, 201, 34, 0, 0), op_mott: 52.7, kp_mott: 42.7, op_fv: 52.7, op_alle: 53.1, n_mott: 11 },
          '2024': { ...Y(188, 19, 20, 36.8, 150, 29, 0, 0), op_mott: 54.3, kp_mott: 45.1, op_fv: 53.4, op_alle: 55.0, n_mott: 12 },
          '2025': { ...Y(168, 21, 15, 42.9, 137, 24, 0, 0), op_mott: 52.7, kp_mott: 46.8, op_fv: 53.9, op_alle: 53.5, n_mott: 6 },
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
          '2024': { ...Y(200, 10, 20, 60.0, 167, 15, 0, 0), op_mott: 51.8, kp_mott: 42.2, op_fv: 52.0, op_alle: 51.9, n_mott: 9 },
          '2025': { ...Y(135, 11, 20, 45.5, 115, 12, 0, 0), op_mott: 50.3, kp_mott: 43.5, op_fv: 52.8, op_alle: 52.6, n_mott: 5 },
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
          '2021': Y(62, 29, null, 34.5, 49, 33, null, null, 25, 24),
          '2022': Y(42, 19, null, 26.3, 32, 17, null, null, 10, 10),
          '2023': Y(52, 30, null, 40.0, 30, 27, null, null, 19, 17),
          '2024': Y(47, 20, null, 35.0, 32, 22, null, null, 17, 16),
          '2025': Y(52, 22, null, 40.9, 31, 25, null, null, 18, 16),
        },
      },
      {
        id: 'inn_skogforvaltning2', shortName: 'INN', institusjon: 'Universitetet i Innlandet',
        studiekode: '', studiested: 'Stor-Elvdal', type: 'master2',
        url: 'https://www.inn.no/studier/vare-studier/master-i-berekraftig-skogforvaltning/',
        years: {
          '2024': Y(82, 70, null, 47.1, 68, 48, null, null, 31, 25),
          '2025': Y(82, 62, null, 35.5, 72, 57, null, null, 46, 35),
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
          '2021': Y(282, 91, null, 52.7, 115, 47, null, null, 19, 14),
          '2022': Y(327, 117, null, 58.1, 137, 40, null, null, 25, 24),
          '2023': Y(295, 128, null, 59.4, 110, 57, null, null, 22, 21),
          '2024': Y(179, 78, null, 59.0, 102, 42, null, null, 17, 15),
          '2025': Y(196, 84, null, 60.7, 76, 41, null, null, 19, 17),
        },
      },
      {
        id: 'inn_anvendt_okologi2', shortName: 'INN', institusjon: 'Universitetet i Innlandet',
        studiekode: '', studiested: 'Stor-Elvdal', type: 'master2',
        url: 'https://www.inn.no/studier/vare-studier/master-i-anvendt-okologi/',
        years: {
          '2021': Y(461, 325, null, 45.5, 120, 59, null, null, 27, 12),
          '2022': Y(364, 232, null, 40.1, 120, 57, null, null, 37, 30),
          '2023': Y(434, 299, null, 39.1, 64, 48, null, null, 32, 17),
          '2024': Y(108, 75, null, 56.0, 50, 47, null, null, 22, 18),
          '2025': Y(118, 87, null, 41.4, 53, 48, null, null, 32, 21),
        },
      },
      {
        id: 'ntnu_biologi2', shortName: 'NTNU Biologi', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        url: 'https://www.ntnu.no/studier/msbio',
        years: {
          '2021': Y(842, 313, null, 56.5, 332, 85, null, null, 39, 34),
          '2022': Y(869, 318, null, 50.9, 343, 66, null, null, 23, 19),
          '2023': Y(484, 218, null, 56.4, 173, 60, null, null, 24, 17),
          '2024': Y(256, 101, null, 49.5, 132, 57, null, null, 20, 18),
          '2025': Y(310, 123, null, 64.2, 153, 64, null, null, 33, 27),
        },
      },
      {
        id: 'uit_biologi2', shortName: 'UiT Biologi', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '', studiested: 'Tromsø', type: 'master2',
        url: 'https://uit.no/utdanning/program/270464/biology_-_master',
        years: {
          '2021': Y(352, 253, null, 58.9, 124, 111, null, null, 64, 48),
          '2022': Y(645, 285, null, 61.1, 216, 104, null, null, 49, 44),
          '2023': Y(693, 288, null, 58.7, 310, 133, null, null, 56, 46),
          '2024': Y(508, 210, null, 63.3, 284, 128, null, null, 54, 49),
          '2025': Y(546, 231, null, 63.6, 275, 130, null, null, 55, 48),
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
          '2021': Y(183, 94, null, 63.8, 138, 44, null, null, 30, 26),
          '2022': Y(173, 82, null, 54.9, 130, 37, null, null, 29, 28),
          '2023': Y(183, 83, null, 74.7, 129, 38, null, null, 28, 25),
          '2024': Y(181, 95, null, 63.2, 127, 47, null, null, 29, 26),
          '2025': Y(183, 100, null, 56.0, 108, 47, null, null, 30, 28),
        },
      },
      {
        id: 'ntnu_naturressurs2', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        url: 'https://www.ntnu.no/studier/msnarm',
        years: {
          '2021': Y(278, 143, null, 45.5, 89, 50, null, null, 31, 25),
          '2022': Y(299, 147, null, 42.2, 102, 47, null, null, 22, 17),
          '2023': Y(267, 123, null, 40.7, 75, 40, null, null, 16, 13),
          '2024': Y(153, 59, null, 72.9, 69, 32, null, null, 14, 13),
          '2025': Y(170, 70, null, 50.0, 88, 41, null, null, 25, 23),
        },
      },
      {
        id: 'usn_okologi_miljoforvaltning2', shortName: 'USN', institusjon: 'Universitetet i Sørøst-Norge',
        studiekode: '', studiested: 'Midt-Telemark', type: 'master2',
        url: 'https://www.usn.no/studier/master-i-okologi-og-miljoforvaltning/',
        years: {
          '2021': Y(77, 65, null, 56.9, 45, 39, null, null, 22, 17),
          '2022': Y(357, 336, null, 48.5, 171, 101, null, null, 65, 43),
          '2023': Y(310, 297, null, 46.8, 100, 100, null, null, 47, 18),
          '2024': Y(116, 108, null, 61.1, 90, 88, null, null, 46, 36),
          '2025': Y(130, 122, null, 61.5, 88, 87, null, null, 54, 34),
        },
      },
      {
        id: 'inn_anvendt_okologi_nf2', shortName: 'INN', institusjon: 'Universitetet i Innlandet',
        studiekode: '', studiested: 'Stor-Elvdal', type: 'master2',
        url: 'https://www.inn.no/studier/vare-studier/master-i-anvendt-okologi/',
        years: {
          '2021': Y(461, 325, null, 45.5, 120, 59, null, null, 27, 12),
          '2022': Y(364, 232, null, 40.1, 120, 57, null, null, 37, 30),
          '2023': Y(434, 299, null, 39.1, 64, 48, null, null, 32, 17),
          '2024': Y(108, 75, null, 56.0, 50, 47, null, null, 22, 18),
          '2025': Y(118, 87, null, 41.4, 53, 48, null, null, 32, 21),
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
          '2022': Y(99, 43, null, 62.8, 59, 42, null, null, 32, 30),
          '2023': Y(91, 41, null, 68.3, 45, 33, null, null, 19, 16),
          '2024': Y(87, 40, null, 72.5, 44, 38, null, null, 21, 18),
          '2025': Y(98, 40, null, 80.0, 42, 35, null, null, 17, 15),
        },
      },
      {
        id: 'nmbu_mina2_forgjenger', shortName: 'NMBU Miljø og naturressurser', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/miljovitenskap',
        years: {
          '2021': Y(118, 44, null, 54.5, 69, 41, null, null, 24, 20),
        },
      },
      {
        id: 'ntnu_miljotoks2', shortName: 'NTNU Miljøtoksikologi', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        url: 'https://www.ntnu.no/studier/msenvitox',
        years: {
          '2021': Y(217, 127, null, 51.2, 85, 41, null, null, 26, 20),
          '2022': Y(258, 135, null, 53.3, 86, 35, null, null, 25, 19),
          '2023': Y(219, 105, null, 62.9, 55, 33, null, null, 19, 13),
          '2024': Y(72, 31, null, 67.7, 37, 20, null, null, 11, 8),
          '2025': Y(108, 34, null, 61.8, 62, 23, null, null, 10, 9),
        },
      },
      {
        id: 'ntnu_industriell_okologi2', shortName: 'NTNU Industriell økologi', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        url: 'https://www.ntnu.no/studier/msindecol',
        years: {
          '2021': Y(232, 134, null, 59.0, 135, 42, null, null, 26, 23),
          '2022': Y(183, 90, null, 54.4, 89, 40, null, null, 19, 14),
          '2023': Y(134, 75, null, 49.3, 56, 40, null, null, 18, 13),
          '2024': Y(92, 44, null, 59.1, 54, 32, null, null, 16, 13),
          '2025': Y(106, 45, null, 64.4, 53, 27, null, null, 14, 13),
        },
      },
      {
        id: 'uio_geofag2', shortName: 'UiO Geofag', institusjon: 'Universitetet i Oslo',
        studiekode: '', studiested: 'Oslo', type: 'master2',
        url: 'https://www.uio.no/studier/program/geofag-master/',
        years: {
          '2021': Y(389, 163, null, 46.6, 209, 108, null, null, 67, 58),
          '2022': Y(579, 270, null, 36.7, 204, 104, null, null, 57, 51),
          '2023': Y(486, 226, null, 35.0, 194, 94, null, null, 47, 44),
          '2024': Y(425, 204, null, 51.0, 237, 133, null, null, 65, 59),
          '2025': Y(498, 223, null, 47.1, 285, 146, null, null, 86, 77),
        },
      },
      {
        id: 'uib_geovitenskap2', shortName: 'UiB Geovitskap', institusjon: 'Universitetet i Bergen',
        studiekode: '', studiested: 'Bergen', type: 'master2',
        url: 'https://www.uib.no/studieprogram/MAMN-GEOV',
        years: {
          '2021': Y(84, 78, null, 59.0, 57, 54, null, null, 41, 37),
          '2022': Y(352, 269, null, 32.3, 84, 69, null, null, 44, 41),
          '2023': Y(355, 341, null, 37.2, 103, 93, null, null, 67, 60),
          '2024': Y(148, 138, null, 46.4, 107, 90, null, null, 65, 60),
          '2025': Y(236, 208, null, 47.1, 155, 95, null, null, 67, 60),
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
          '2021': Y(144, 62, null, 50.0, 82, 50, null, null, 19, 14),
          '2022': Y(126, 59, null, 52.5, 62, 44, null, null, 25, 24),
          '2023': Y(131, 64, null, 46.9, 51, 45, null, null, 29, 26),
          '2024': Y(88, 47, null, 53.2, 30, 27, null, null, 19, 16),
          '2025': Y(95, 54, null, 61.1, 49, 45, null, null, 26, 23),
        },
      },
      {
        id: 'uio_fornybare_energisystemer2', shortName: 'UiO', institusjon: 'Universitetet i Oslo',
        studiekode: '', studiested: 'Oslo', type: 'master2',
        url: 'https://www.uio.no/studier/program/fornybar-energi-master/',
        years: {
          '2021': Y(803, 553, null, 23.9, 117, 54, null, null, 19, 17),
          '2022': Y(572, 401, null, 23.7, 170, 59, null, null, 22, 20),
          '2023': Y(640, 463, null, 26.1, 126, 71, null, null, 29, 22),
          '2024': Y(238, 165, null, 30.3, 105, 75, null, null, 32, 21),
          '2025': Y(192, 135, null, 41.5, 77, 63, null, null, 22, 17),
        },
      },
      {
        id: 'uia_fornybar2', shortName: 'UiA', institusjon: 'Universitetet i Agder',
        studiekode: '', studiested: 'Grimstad', type: 'master2',
        url: 'https://www.uia.no/studier/program/fornybar-energi-master-2-ar/',
        years: {
          '2021': Y(253, 131, null, 35.1, 117, 71, null, null, 34, 24),
          '2022': Y(171, 89, null, 39.3, 86, 58, null, null, 24, 18),
          '2023': Y(142, 71, null, 26.8, 69, 46, null, null, 24, 19),
          '2024': Y(148, 69, null, 31.9, 79, 46, null, null, 18, 12),
          '2025': Y(133, 55, null, 41.8, 51, 31, null, null, 17, 11),
        },
      },
      {
        id: 'ntnu_baerekraftig_energi2', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        url: 'https://www.ntnu.no/studier/msse',
        years: {
          '2021': Y(949, 412, null, 23.1, 220, 69, null, null, 35, 27),
          '2022': Y(720, 321, null, 17.4, 203, 35, null, null, 18, 13),
          '2023': Y(582, 291, null, 18.2, 84, 44, null, null, 13, 8),
          '2024': Y(194, 86, null, 19.8, 52, 17, null, null, 7, 6),
          '2025': Y(194, 89, null, 29.2, 32, 7, null, null, 0, 0),
        },
      },
      {
        id: 'hvl_energiteknologi2', shortName: 'HVL', institusjon: 'Høgskulen på Vestlandet',
        studiekode: '', studiested: 'Bergen', type: 'master2',
        url: 'https://www.hvl.no/studier/studieprogram/berekraftig-energiteknologi/',
        years: {
          '2023': Y(102, 71, null, 36.6, 49, 40, null, null, 18, 17),
          '2024': Y(109, 70, null, 37.1, 46, 42, null, null, 26, 13),
          '2025': Y(112, 112, null, 28.6, 37, 36, null, null, 19, 16),
        },
      },
    ],
  },
];
