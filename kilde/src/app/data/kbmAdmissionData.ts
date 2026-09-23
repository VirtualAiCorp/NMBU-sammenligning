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
    id: 'bioteknologi', label: 'Bioteknologi', level: 'bachelor',
    desc: 'Sammenligner NMBUs bachelor i bioteknologi med de andre bioteknologi- og molekylærbiologiutdanningene.',
    note: 'Konkurrentene med default true er treårige realfagsbachelorer i bioteknologi eller molekylærbiologi i Samordna opptak. NTNUs bioteknologiprogram i Trondheim (kode 194855) er et femårig integrert masterprogram og er derfor tatt med som svakere sammenligning, mens NTNUs treårige bachelor i Ålesund (kode 194427) er en direkte sammenligning. UiOs «Biovitenskap» er et bredt biologiprogram med over 150 studieplasser og mange studieretninger, og OsloMets «Ingeniør, bioteknologi og kjemi» er en treårig ingeniørutdanning med eget opptaksgrunnlag; begge er svakere sammenligninger. NTNUs «Medisinsk og biologisk kjemi» (kode 194163) og «Biologi og kjemi, realfag» (kode 194184) er årsstudier, ikke bachelorprogrammer, og er derfor ikke med. Nord universitet har ingen bioteknologibachelor i Samordna opptak. NTNUs «Biovitenskap og laboratorieteknologi» i Ålesund (kode 194820) hadde første opptak i 2026 og har for kort tidsserie.',
    nmbuIds: ['nmbu_bioteknologi'], defaultIds: ['nmbu_bioteknologi', 'uib_molekylarbiologi', 'uit_bioteknologi', 'ntnu_bioteknologi_alesund'],
    entries: [
      {
        id: 'nmbu_bioteknologi', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192299', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/bioteknologi',
        years: {
          '2020': Y(null, null, null, null, null, null, 54.0, 54.8),
          '2021': { ...Y(685, 73, 40, 75.3, 637, 56, 56.0, 56.0), op_mott: 58.5, kp_mott: 52.3, op_fv: 56.0, op_alle: 56.1, n_mott: 27 },
          '2022': { ...Y(528, 63, 40, 74.6, 484, 56, 55.1, 55.0), op_mott: 59.0, kp_mott: 51.4, op_fv: 56.6, op_alle: 56.0, n_mott: 28 },
          '2023': { ...Y(576, 79, 40, 67.1, 522, 70, 53.0, 52.0), op_mott: 57.6, kp_mott: 50.8, op_fv: 54.4, op_alle: 55.4, n_mott: 30 },
          '2024': { ...Y(656, 79, 40, 69.6, 591, 72, 51.7, 51.7), op_mott: 57.1, kp_mott: 48.8, op_fv: 52.9, op_alle: 54.1, n_mott: 19 },
          '2025': { ...Y(563, 72, 40, 69.4, 509, 72, 49.0, 50.5), op_mott: 56.1, kp_mott: 48.0, op_fv: 54.0, op_alle: 54.3, n_mott: 31 },
          '2026': Y(672, 74, 40, 66.2, 596, 72, 50.0, 49.0),
        },
      },
      {
        id: 'uib_molekylarbiologi', shortName: 'UiB Molekylærbiologi', institusjon: 'Universitetet i Bergen',
        studiekode: '184865', studiested: 'Bergen', type: 'bachelor',
        url: 'https://www.uib.no/studier/BAMN-MOL',
        years: {
          '2020': Y(null, null, null, null, null, null, 48.0, 49.3),
          '2021': { ...Y(692, 93, 50, 77.4, 634, 88, 52.1, 50.9), op_mott: 56.8, kp_mott: 49.4, op_fv: 52.0, op_alle: 53.4, n_mott: 38 },
          '2022': { ...Y(506, 71, 55, 73.2, 473, 98, 48.5, 44.4), op_mott: 54.5, kp_mott: 46.9, op_fv: 54.4, op_alle: 55.4, n_mott: 50 },
          '2023': { ...Y(495, 74, 40, 74.3, 443, 74, 50.0, 48.5), op_mott: 53.8, kp_mott: 47.3, op_fv: 52.2, op_alle: 53.8, n_mott: 35 },
          '2024': { ...Y(520, 66, 40, 77.3, 488, 71, 47.9, 48.6), op_mott: 54.3, kp_mott: 45.7, op_fv: 53.0, op_alle: 54.8, n_mott: 33 },
          '2025': { ...Y(559, 63, 40, 69.8, 501, 79, 0, 0), op_mott: 52.4, kp_mott: 44.5, op_fv: 52.8, op_alle: 54.1, n_mott: 41 },
          '2026': Y(584, 74, 40, 73.0, 502, 71, 46.5, 45.9),
        },
      },
      {
        id: 'uit_bioteknologi', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '186299', studiested: 'Tromsø', type: 'bachelor',
        url: 'https://uit.no/utdanning/studieprogram/b-biotek',
        years: {
          '2020': Y(null, null, null, null, null, null, 49.2, 51.7),
          '2021': { ...Y(320, 17, 15, 70.6, 287, 30, 48.3, 49.5), op_mott: 56.1, kp_mott: 46.1, op_fv: 52.7, op_alle: 53.6, n_mott: 6 },
          '2022': { ...Y(279, 18, 15, 61.1, 254, 35, 0, 0), op_mott: 52.5, kp_mott: 45.1, op_fv: 52.8, op_alle: 53.1, n_mott: 12 },
          '2023': { ...Y(267, 21, 15, 33.3, 213, 30, 0, 0), op_mott: 45.3, kp_mott: 39.7, op_fv: 47.7, op_alle: 52.6, n_mott: 7 },
          '2024': { ...Y(214, 8, 15, 75.0, 179, 15, 0, 0), op_fv: 47.5, op_alle: 52.5 },
          '2025': { ...Y(185, 9, 10, 33.3, 158, 13, 0, 0), op_mott: 51.9, kp_mott: 42.6, op_fv: 53.5, op_alle: 51.9, n_mott: 5 },
          '2026': Y(215, 15, 10, 53.3, 170, 25, 0, 0),
        },
      },
      {
        id: 'ntnu_bioteknologi_alesund', shortName: 'NTNU Ålesund', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194427', studiested: 'Ålesund', type: 'bachelor',
        url: 'https://www.ntnu.no/studier/427bt',
        years: {
          '2020': Y(null, null, null, null, null, null, 49.5, 48.5),
          '2021': { ...Y(506, 34, 24, 55.9, 451, 46, 50.3, 50.4), op_mott: 56.0, kp_mott: 47.7, op_fv: 51.9, op_alle: 53.0, n_mott: 18 },
          '2022': { ...Y(332, 26, 20, 53.8, 301, 40, 48.2, 45.1), op_mott: 53.0, kp_mott: 46.0, op_fv: 51.1, op_alle: 53.4, n_mott: 16 },
          '2023': { ...Y(359, 26, 20, 69.2, 301, 40, 49.6, 46.0), op_mott: 52.8, kp_mott: 46.9, op_fv: 51.0, op_alle: 52.6, n_mott: 11 },
          '2024': { ...Y(324, 27, 20, 59.3, 273, 52, 0, 0), op_mott: 50.2, kp_mott: 43.3, op_fv: 50.9, op_alle: 51.9, n_mott: 16 },
          '2025': { ...Y(289, 20, 19, 60.0, 234, 31, 0, 0), op_mott: 48.2, kp_mott: 42.3, op_fv: 49.6, op_alle: 51.4, n_mott: 11 },
        },
      },
      {
        id: 'ntnu_bioteknologi_5aar', shortName: 'NTNU Trondheim', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194855', studiested: 'Trondheim', type: 'master',
        url: 'https://www.ntnu.no/studier/mbiot5',
        years: {
          '2020': Y(null, null, null, null, null, null, 57.6, 60.7),
          '2021': { ...Y(1165, 172, 45, 73.3, 1118, 102, 58.2, 60.0), op_mott: 61.2, kp_mott: 54.0, op_fv: 57.3, op_alle: 58.9, n_mott: 41 },
          '2022': { ...Y(922, 148, 35, 70.3, 903, 74, 58.3, 61.2), op_mott: 62.8, kp_mott: 54.1, op_fv: 58.0, op_alle: 59.7, n_mott: 25 },
          '2023': { ...Y(961, 137, 35, 86.9, 916, 92, 57.7, 59.3), op_mott: 62.3, kp_mott: 53.8, op_fv: 58.3, op_alle: 59.5, n_mott: 42 },
          '2024': { ...Y(923, 150, 35, 78.7, 881, 78, 57.0, 60.5), op_mott: 62.2, kp_mott: 54.0, op_fv: 57.7, op_alle: 58.8, n_mott: 36 },
          '2025': { ...Y(824, 129, 35, 73.6, 781, 78, 56.2, 59.4), op_mott: 61.2, kp_mott: 53.2, op_fv: 57.1, op_alle: 58.8, n_mott: 40 },
          '2026': Y(889, 139, 40, 74.1, 829, 78, 55.6, 57.8),
        },
      },
      {
        id: 'uio_biovitenskap', shortName: 'UiO Biovitenskap', institusjon: 'Universitetet i Oslo',
        studiekode: '185327', studiested: 'Oslo', type: 'bachelor',
        url: 'https://www.uio.no/studier/program/biovitenskap/',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(706, 148, 148, 58.8, 420, 143, 0, 0), op_mott: 51.5, kp_mott: 43.4, op_fv: 53.4, op_alle: 54.9, n_mott: 76 },
          '2022': { ...Y(1109, 243, 160, 67.5, 931, 245, 44.0, 44.4), op_mott: 54.8, kp_mott: 46.8, op_fv: 52.3, op_alle: 53.3, n_mott: 93 },
          '2023': { ...Y(1074, 185, 160, 62.2, 892, 250, 41.9, 39.6), op_mott: 51.2, kp_mott: 43.4, op_fv: 50.5, op_alle: 54.0, n_mott: 93 },
          '2024': { ...Y(1092, 224, 157, 65.2, 885, 260, 40.8, 42.6), op_mott: 52.5, kp_mott: 45.0, op_fv: 53.5, op_alle: 53.9, n_mott: 112 },
          '2025': { ...Y(958, 200, 156, 68.5, 767, 235, 0, 0), op_mott: 51.9, kp_mott: 43.8, op_fv: 53.0, op_alle: 53.7, n_mott: 100 },
          '2026': Y(962, 186, 156, 62.9, 745, 206, 0, 0),
        },
      },
      {
        id: 'oslomet_ing_bioteknologi_kjemi', shortName: 'OsloMet', institusjon: 'OsloMet - storbyuniversitetet',
        studiekode: '215009', studiested: 'Oslo', type: 'bachelor',
        url: 'https://www.oslomet.no/studier/tkd/bioteknologi-kjemiingenior',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(583, 55, 40, 63.6, 317, 61, 0, 0), op_mott: 51.4, kp_mott: 42.5, op_fv: 54.4, op_alle: 51.3, n_mott: 32 },
          '2022': { ...Y(555, 60, 40, 58.3, 311, 47, 0, 0), op_mott: 45.9, kp_mott: 38.2, op_fv: 48.7, op_alle: 50.4, n_mott: 21 },
          '2023': { ...Y(540, 56, 35, 76.8, 259, 47, 0, 0), op_mott: 51.5, kp_mott: 43.6, op_fv: 53.0, op_alle: 52.0, n_mott: 31 },
          '2024': { ...Y(502, 49, 40, 51.0, 254, 48, 0, 0), op_mott: 50.1, kp_mott: 41.0, op_fv: 50.8, op_alle: 51.6, n_mott: 29 },
          '2025': { ...Y(524, 54, 47, 63.0, 286, 50, 0, 0), op_mott: 48.7, kp_mott: 41.6, op_fv: 50.8, op_alle: 51.2, n_mott: 30 },
          '2026': Y(537, 54, 47, 70.4, 262, 35, 0, 0),
        },
      },
    ],
  },
  {
    id: 'kjemi', label: 'Kjemi', level: 'bachelor',
    desc: 'Sammenligner NMBUs bachelor i kjemi med kjemi- og biokjemibachelorene ved de andre universitetene.',
    note: 'Konkurrentene med default true er treårige realfagsbachelorer i kjemi eller biokjemi i Samordna opptak. UiTs kjemibachelor (kode 186860) hadde siste opptak i 2024 og er avløst av det femårige sivilingeniørprogrammet «Bærekraftig kjemi og innovasjon» (kode 186764) fra 2025; begge er med, sivilingeniørløpet som svakere sammenligning fordi nivå og opptakskrav er andre. UiT har tatt ned programsiden for den gamle kjemibacheloren, så begge UiT-radene lenker til etterfølgeren. Treårige kjemiingeniørutdanninger (HVL 203009, NTNU 194009 og 194688, UiS 217009, USN 222688) har eget ingeniøropptak og er ikke tatt med, og NTNUs «Biologi og kjemi, realfag» (kode 194184) er et årsstudium.',
    nmbuIds: ['nmbu_kjemi'], defaultIds: ['nmbu_kjemi', 'uio_kjemi_biokjemi', 'uib_kjemi', 'ntnu_kjemi', 'uis_biologisk_kjemi', 'uit_kjemi'],
    entries: [
      {
        id: 'nmbu_kjemi', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192332', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/kjemi',
        years: {
          '2020': Y(null, null, null, null, null, null, 46.5, 49.3),
          '2021': { ...Y(238, 21, 20, 57.1, 211, 26, 49.5, 52.6), op_mott: 53.9, kp_mott: 47.0, op_fv: 53.1, op_alle: 55.1, n_mott: 14 },
          '2022': { ...Y(230, 28, 20, 60.7, 212, 28, 39.5, 50.5), op_mott: 52.4, kp_mott: 45.5, op_fv: 55.1, op_alle: 56.0, n_mott: 13 },
          '2023': { ...Y(212, 20, 20, 65.0, 192, 34, 46.1, 41.5), op_mott: 52.5, kp_mott: 46.1, op_fv: 53.5, op_alle: 54.2, n_mott: 14 },
          '2024': { ...Y(210, 22, 20, 36.4, 179, 30, 0, 0), op_mott: 50.9, kp_mott: 42.4, op_fv: 52.2, op_alle: 53.8, n_mott: 13 },
          '2025': { ...Y(173, 21, 20, 71.4, 153, 30, 0, 0), op_mott: 49.6, kp_mott: 44.8, op_fv: 50.5, op_alle: 51.7, n_mott: 15 },
          '2026': Y(178, 16, 20, 75.0, 154, 21, 0, 0),
        },
      },
      {
        id: 'uio_kjemi_biokjemi', shortName: 'UiO', institusjon: 'Universitetet i Oslo',
        studiekode: '185860', studiested: 'Oslo', type: 'bachelor',
        url: 'https://www.uio.no/studier/program/kjemi-biokjemi/',
        years: {
          '2020': Y(null, null, null, null, null, null, 45.9, 44.2),
          '2021': { ...Y(473, 46, 44, 69.6, 314, 61, 0, 0), op_mott: 54.2, kp_mott: 45.8, op_fv: 56.1, op_alle: 54.2, n_mott: 21 },
          '2022': { ...Y(453, 49, 40, 65.3, 316, 63, 0, 0), op_mott: 51.6, kp_mott: 43.6, op_fv: 55.5, op_alle: 54.4, n_mott: 34 },
          '2023': { ...Y(429, 52, 40, 55.8, 286, 50, 0, 0), op_mott: 53.8, kp_mott: 45.9, op_fv: 53.6, op_alle: 55.1, n_mott: 18 },
          '2024': { ...Y(417, 54, 40, 61.1, 279, 50, 0, 0), op_mott: 52.6, kp_mott: 44.5, op_fv: 54.6, op_alle: 55.5, n_mott: 25 },
          '2025': { ...Y(428, 56, 40, 48.2, 294, 53, 0, 0), op_mott: 51.6, kp_mott: 44.6, op_fv: 52.3, op_alle: 55.0, n_mott: 25 },
          '2026': Y(414, 53, 40, 47.2, 291, 54, 0, 0),
        },
      },
      {
        id: 'uib_kjemi', shortName: 'UiB', institusjon: 'Universitetet i Bergen',
        studiekode: '184860', studiested: 'Bergen', type: 'bachelor',
        url: 'https://www.uib.no/studier/BAMN-KJEM',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(320, 23, 35, 47.8, 277, 60, 0, 0), op_mott: 46.9, kp_mott: 39.7, op_fv: 49.0, op_alle: 52.5, n_mott: 21 },
          '2022': { ...Y(350, 45, 35, 48.9, 319, 60, 0, 0), op_mott: 49.3, kp_mott: 43.4, op_fv: 49.5, op_alle: 53.7, n_mott: 28 },
          '2023': { ...Y(293, 29, 35, 34.5, 263, 48, 0, 0), op_mott: 50.1, kp_mott: 44.3, op_fv: 50.3, op_alle: 54.3, n_mott: 20 },
          '2024': { ...Y(322, 33, 35, 51.5, 287, 49, 0, 0), op_mott: 49.9, kp_mott: 42.6, op_fv: 50.4, op_alle: 53.6, n_mott: 25 },
          '2025': { ...Y(305, 43, 35, 44.2, 269, 46, 0, 0), op_mott: 48.3, kp_mott: 40.5, op_fv: 52.7, op_alle: 54.9, n_mott: 20 },
          '2026': Y(277, 23, 35, 43.5, 239, 33, 0, 0),
        },
      },
      {
        id: 'ntnu_kjemi', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194860', studiested: 'Trondheim', type: 'bachelor',
        url: 'https://www.ntnu.no/studier/bkj',
        years: {
          '2020': Y(null, null, null, null, null, null, 48.5, 45.1),
          '2021': { ...Y(411, 31, 40, 54.8, 331, 58, 47.7, 47.0), op_mott: 50.5, kp_mott: 44.2, op_fv: 52.7, op_alle: 55.2, n_mott: 33 },
          '2022': { ...Y(431, 52, 40, 53.8, 353, 68, 48.7, 48.0), op_mott: 53.7, kp_mott: 46.9, op_fv: 53.7, op_alle: 55.6, n_mott: 40 },
          '2023': { ...Y(336, 37, 40, 37.8, 263, 50, 47.2, 46.4), op_mott: 53.8, kp_mott: 46.9, op_fv: 54.0, op_alle: 55.2, n_mott: 35 },
          '2024': { ...Y(369, 42, 35, 50.0, 290, 54, 50.2, 47.9), op_mott: 53.6, kp_mott: 46.9, op_fv: 54.7, op_alle: 55.5, n_mott: 40 },
          '2025': { ...Y(375, 43, 35, 44.2, 310, 48, 48.2, 47.5), op_mott: 54.1, kp_mott: 46.9, op_fv: 55.2, op_alle: 55.5, n_mott: 33 },
          '2026': Y(381, 33, 35, 45.5, 313, 39, 0, 0),
        },
      },
      {
        id: 'uis_biologisk_kjemi', shortName: 'UiS', institusjon: 'Universitetet i Stavanger',
        studiekode: '217860', studiested: 'Stavanger', type: 'bachelor',
        url: 'https://www.uis.no/nb/studier/biologisk-kjemi-bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 44.0, 45.8),
          '2021': { ...Y(409, 62, 30, 64.5, 320, 60, 41.9, 48.4), op_mott: 49.7, kp_mott: 41.4, op_fv: 51.9, op_alle: 50.8, n_mott: 25 },
          '2022': { ...Y(346, 59, 30, 66.1, 295, 60, 39.8, 47.5), op_mott: 49.3, kp_mott: 41.8, op_fv: 51.5, op_alle: 51.2, n_mott: 23 },
          '2023': { ...Y(298, 40, 30, 67.5, 242, 55, 0, 0), op_mott: 49.9, kp_mott: 42.8, op_fv: 51.2, op_alle: 51.0, n_mott: 22 },
          '2024': { ...Y(315, 51, 30, 64.7, 247, 57, 0, 0), op_mott: 48.5, kp_mott: 41.2, op_fv: 48.6, op_alle: 50.3, n_mott: 27 },
          '2025': { ...Y(301, 42, 30, 54.8, 226, 38, 0, 0), op_mott: 50.0, kp_mott: 40.0, op_fv: 49.8, op_alle: 49.0, n_mott: 21 },
          '2026': Y(299, 40, 30, 72.5, 242, 53, 0, 0),
        },
      },
      {
        id: 'uit_kjemi', shortName: 'UiT Kjemi', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '186860', studiested: 'Tromsø', type: 'bachelor',
        url: 'https://uit.no/utdanning/program/868642/baerekraftig_kjemi_og_innovasjon_sivilingenior_-',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(71, 5, 18, 40.0, 46, 3, 0, 0), op_alle: 53.3 },
          '2022': { ...Y(72, 6, 18, 66.7, 61, 6, 0, 0), op_mott: 56.2, kp_mott: 48.8, op_fv: 54.5, op_alle: 52.6, n_mott: 5 },
          '2023': { ...Y(58, 3, 18, 100.0, 40, 2, 0, 0), op_alle: 56.2 },
          '2024': { ...Y(98, 9, 18, 44.4, 80, 8, 0, 0), op_mott: 53.9, kp_mott: 44.8, op_fv: 50.9, op_alle: 53.8, n_mott: 4 },
        },
      },
      {
        id: 'uit_baerekraftig_kjemi', shortName: 'UiT Bærekraftig kjemi', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '186764', studiested: 'Tromsø', type: 'master',
        url: 'https://uit.no/utdanning/program/868642/baerekraftig_kjemi_og_innovasjon_sivilingenior_-',
        years: {
          '2025': { ...Y(88, 3, 15, 66.7, 73, 7, 0, 0), op_alle: 55.2 },
          '2026': Y(75, 7, 10, 71.4, 57, 5, 0, 0),
        },
      },
    ],
  },
  {
    id: 'matvitenskap', label: 'Matvitenskap og ernæring', level: 'bachelor',
    desc: 'Sammenligner NMBUs tidligere bachelor i matvitenskap og ernæring med ernæringsutdanningene ved de andre universitetene.',
    note: 'NMBUs «Matvitenskap og ernæring» (kode 192948) hadde siste opptak i 2024 og er avløst av «Mat, teknologi og helse» (kode 192203), som ligger i gruppen matteknologi; den gamle programsiden er tatt ned, og lenken går til etterfølgeren. Konkurrentene er ernæringsbachelorer i Samordna opptak. UiOs «Klinisk ernæring» er et femårig profesjonsstudium som gir autorisasjon som klinisk ernæringsfysiolog og har et helt annet opptaksgrunnlag; det er tatt med som svakere sammenligning fordi det trekker mange av de samme søkerne. Universitetet i Innlandets «Mat, ernæring og helse» (kode 209446) hadde siste opptak i 2023 og har ingen programside igjen, og er derfor ikke med. UiAs og USNs ernæringsprogrammer er idretts- og samfunnsrettede og er heller ikke med.',
    nmbuIds: ['nmbu_matvitenskap_ernaring'], defaultIds: ['nmbu_matvitenskap_ernaring', 'uib_ernaring', 'uit_ernaring'],
    entries: [
      {
        id: 'nmbu_matvitenskap_ernaring', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192948', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/mat-teknologi-og-helse',
        poengFellesMed: ['nmbu_mat_teknologi_helse', 'nmbu_matvitenskap_ernaring_hist'],
        years: {
          '2021': Y(378, 47, 20, 74.5, 309, 28, 48.6, 55.3),
          '2022': Y(262, 30, 20, 86.7, 221, 32, 0, 54.1),
          '2023': Y(211, 28, 20, 82.1, 169, 40, 0, 0),
          '2024': Y(188, 15, 20, 80.0, 147, 25, 0, 0),
          '2025': { ...Y(null, null, null, null, null, null, null, null), op_mott: 54.4, kp_mott: 45.4, op_fv: 57.5, op_alle: 55.7, n_mott: 8 },
        },
      },
      {
        id: 'uib_ernaring', shortName: 'UiB', institusjon: 'Universitetet i Bergen',
        studiekode: '184708', studiested: 'Bergen', type: 'bachelor',
        url: 'https://www4.uib.no/studier/program/ernaering-bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 44.3, 53.8),
          '2021': { ...Y(458, 61, 34, 85.2, 210, 70, 0, 48.6), op_mott: 54.2, kp_mott: 45.9, op_fv: 54.3, op_alle: 57.2, n_mott: 21 },
          '2022': { ...Y(444, 49, 34, 93.9, 176, 60, 0, 0), op_mott: 53.6, kp_mott: 45.9, op_fv: 55.6, op_alle: 56.4, n_mott: 19 },
          '2023': { ...Y(565, 62, 34, 80.6, 184, 48, 0, 0), op_mott: 55.9, kp_mott: 47.0, op_fv: 56.0, op_alle: 57.5, n_mott: 19 },
          '2024': { ...Y(661, 58, 34, 81.0, 175, 42, 0, 0), op_mott: 52.4, kp_mott: 44.2, op_fv: 56.8, op_alle: 57.1, n_mott: 16 },
          '2025': { ...Y(570, 59, 34, 78.0, 141, 40, 0, 0), op_mott: 54.1, kp_mott: 45.9, op_fv: 54.6, op_alle: 56.8, n_mott: 20 },
          '2026': Y(582, 51, 34, 84.3, 159, 36, 0, 0),
        },
      },
      {
        id: 'uit_ernaring', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '186708', studiested: 'Tromsø', type: 'bachelor',
        url: 'https://uit.no/utdanning/studieprogram/b-ern',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(266, 27, 15, 88.9, 98, 19, 0, 0), op_mott: 56.0, kp_mott: 47.9, op_fv: 55.3, op_alle: 54.6, n_mott: 8 },
          '2022': { ...Y(262, 14, 15, 85.7, 79, 16, 0, 0), op_mott: 54.2, kp_mott: 46.3, op_fv: 55.0, op_alle: 57.3, n_mott: 4 },
          '2023': { ...Y(180, 15, 15, 86.7, 60, 12, 0, 0), op_alle: 56.5 },
          '2024': { ...Y(173, 14, 15, 78.6, 60, 6, 0, 0), op_alle: 58.7 },
          '2025': { ...Y(179, 9, 15, 66.7, 50, 6, 0, 0), op_mott: 51.7, kp_mott: 42.2, op_alle: 56.6, n_mott: 4 },
          '2026': Y(145, 6, 8, 66.7, 45, 4, 0, 0),
        },
      },
      {
        id: 'uio_klinisk_ernaring', shortName: 'UiO Klinisk ernæring', institusjon: 'Universitetet i Oslo',
        studiekode: '185713', studiested: 'Oslo', type: 'master',
        url: 'https://www.uio.no/studier/program/ernering-5aar/',
        years: {
          '2020': Y(null, null, null, null, null, null, 50.8, 59.6),
          '2021': { ...Y(828, 110, 35, 86.4, 573, 100, 53.4, 61.1), op_mott: 61.2, kp_mott: 52.5, op_fv: 56.5, op_alle: 59.0, n_mott: 42 },
          '2022': { ...Y(740, 105, 35, 87.6, 515, 100, 54.0, 60.0), op_mott: 61.2, kp_mott: 52.3, op_fv: 59.1, op_alle: 59.9, n_mott: 45 },
          '2023': { ...Y(692, 101, 35, 87.1, 432, 80, 51.4, 59.6), op_mott: 60.2, kp_mott: 50.4, op_fv: 56.9, op_alle: 60.2, n_mott: 30 },
          '2024': { ...Y(642, 90, 48, 81.1, 351, 92, 0, 56.4), op_mott: 57.9, kp_mott: 48.9, op_fv: 58.1, op_alle: 59.3, n_mott: 28 },
          '2025': { ...Y(638, 91, 48, 80.2, 318, 100, 0, 51.8), op_mott: 55.9, kp_mott: 46.5, op_fv: 56.4, op_alle: 58.0, n_mott: 36 },
          '2026': Y(607, 104, 50, 90.4, 323, 112, 0, 56.2),
        },
      },
    ],
  },
  {
    id: 'matteknologi', label: 'Mat, teknologi og helse', level: 'bachelor',
    desc: 'Sammenligner NMBUs bachelor i mat, teknologi og helse med de andre matvitenskaps- og matteknologiutdanningene.',
    note: 'NMBUs program hadde første opptak i 2025 og erstattet «Matvitenskap og ernæring» (kode 192948), som ligger i gruppen matvitenskap; forgjengeren er tatt med her med default false slik at tidsserien kan følges. NTNUs «Matvitenskap, teknologi og bærekraft» er den eneste direkte konkurrenten på bachelornivå. UiTs «Fiskeri- og havbruksvitenskap» ligger i samme næringskjede, men har tyngdepunkt i havbruk og er en svakere sammenligning. Nord universitets «Sirkulær bioøkonomi» (kode 204738) hadde bare opptak i 2022 og 2023, og programsiden lot seg ikke verifisere, så den er ikke med.',
    nmbuIds: ['nmbu_mat_teknologi_helse', 'nmbu_matvitenskap_ernaring_hist'], defaultIds: ['nmbu_mat_teknologi_helse', 'ntnu_matvitenskap'],
    entries: [
      {
        id: 'nmbu_mat_teknologi_helse', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192203', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/mat-teknologi-og-helse',
        poengFellesMed: ['nmbu_matvitenskap_ernaring', 'nmbu_matvitenskap_ernaring_hist'],
        years: {
          '2025': { ...Y(213, 26, 20, 80.8, 162, 23, 0, 0), op_mott: 54.4, kp_mott: 45.4, op_fv: 57.5, op_alle: 55.7, n_mott: 8 },
          '2026': Y(160, 25, 20, 76.0, 131, 26, 0, 0),
        },
      },
      {
        id: 'ntnu_matvitenskap', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '194346', studiested: 'Trondheim', type: 'bachelor',
        url: 'https://www.ntnu.no/studier/mtmat',
        years: {
          '2020': Y(null, null, null, null, null, null, 0, 0),
          '2021': { ...Y(477, 83, 45, 59.0, 387, 80, 46.5, 47.8), op_mott: 54.4, kp_mott: 46.3, op_fv: 51.9, op_alle: 53.8, n_mott: 37 },
          '2022': { ...Y(419, 72, 45, 65.3, 339, 78, 45.0, 47.6), op_mott: 53.8, kp_mott: 45.2, op_fv: 53.7, op_alle: 54.6, n_mott: 48 },
          '2023': { ...Y(307, 54, 45, 81.5, 251, 50, 43.0, 48.5), op_mott: 52.8, kp_mott: 44.8, op_fv: 52.6, op_alle: 55.5, n_mott: 33 },
          '2024': { ...Y(349, 48, 38, 81.2, 289, 62, 48.5, 49.4), op_mott: 54.8, kp_mott: 46.7, op_fv: 54.8, op_alle: 54.9, n_mott: 31 },
          '2025': { ...Y(355, 44, 38, 65.9, 289, 50, 44.8, 45.6), op_mott: 51.4, kp_mott: 43.7, op_fv: 51.6, op_alle: 55.0, n_mott: 24 },
          '2026': Y(251, 29, 30, 65.5, 200, 34, 39.6, 45.8),
        },
      },
      {
        id: 'nmbu_matvitenskap_ernaring_hist', shortName: 'NMBU Matvitenskap og ernæring', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '192948', studiested: 'Ås', type: 'bachelor',
        url: 'https://www.nmbu.no/studier/bachelor/mat-teknologi-og-helse',
        poengFellesMed: ['nmbu_matvitenskap_ernaring', 'nmbu_mat_teknologi_helse'],
        years: {
          '2021': Y(378, 47, 20, 74.5, 309, 28, 48.6, 55.3),
          '2022': Y(262, 30, 20, 86.7, 221, 32, 0, 54.1),
          '2023': Y(211, 28, 20, 82.1, 169, 40, 0, 0),
          '2024': Y(188, 15, 20, 80.0, 147, 25, 0, 0),
          '2025': { ...Y(null, null, null, null, null, null, null, null), op_mott: 54.4, kp_mott: 45.4, op_fv: 57.5, op_alle: 55.7, n_mott: 8 },
        },
      },
      {
        id: 'uit_fiskeri_havbruk', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet',
        studiekode: '186331', studiested: 'Tromsø', type: 'bachelor',
        url: 'https://uit.no/utdanning/program/268899/fiskeri-_og_havbruksvitenskap_-_bachelor',
        years: {
          '2020': Y(null, null, null, null, null, null, 45.3, 50.0),
          '2021': { ...Y(1067, 190, 45, 41.6, 1032, 115, 45.5, 50.0), op_mott: 51.1, kp_mott: 44.3, op_fv: 46.7, op_alle: 47.8, n_mott: 46 },
          '2022': { ...Y(909, 164, 65, 44.5, 870, 110, 45.6, 49.8), op_mott: 51.5, kp_mott: 45.8, op_fv: 48.0, op_alle: 49.1, n_mott: 51 },
          '2023': { ...Y(902, 135, 60, 50.4, 863, 140, 42.0, 48.0), op_mott: 50.8, kp_mott: 44.5, op_fv: 48.7, op_alle: 49.6, n_mott: 37 },
          '2024': { ...Y(860, 142, 60, 57.0, 813, 150, 41.8, 44.6), op_mott: 49.7, kp_mott: 44.5, op_fv: 47.8, op_alle: 48.4, n_mott: 39 },
          '2025': { ...Y(812, 142, 60, 50.0, 759, 160, 37.5, 43.3), op_mott: 49.2, kp_mott: 43.1, op_fv: 48.1, op_alle: 48.3, n_mott: 50 },
          '2026': Y(864, 125, 60, 47.2, 810, 160, 38.7, 42.9),
        },
      },
    ],
  },
  {
    id: 'bioteknologi2', label: 'Bioteknologi (2-årig master)', level: 'master2',
    desc: 'Sammenligner de toårige masterne i bioteknologi og molekylærbiologi med lokalt opptak.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere» (søknadsalternativer), kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (alle søknadsalternativer uansett prioritet; kvalifiserte = søknadsalternativer merket kvalifisert); tabellen svarte med serverfeil 22.09.2026 og ble hentet på nytt 23.09.2026. DBH har ikke rapportert høstopptaket 2026 ennå, så 2026 er tomt for alle programmene. UiBs molekylærbiologimaster hadde våropptak i 2021, 2024 og 2025 i tillegg til høstopptaket; tallene for de årene er summen av vår og høst. Studieplasser og poenggrenser er de som sto på institusjonenes egne programsider da dataene ble hentet, og gjelder siste opptak; de er ført inn på det året sidene oppgir. NMBU oppgir 45 studieplasser og poenggrense 3,0 i 2025 på programsiden. UiB oppgir 20 studieplasser på masteren i molekylærbiologi. NTNUs toårige bioteknologimaster (MSBIOTECH) er engelskspråklig, og NTNU opplyser at siste opptak var høsten 2026; programmet er tatt med som svakere sammenligning fordi det avvikles. NTNUs øvrige bioteknologiløp i Trondheim er femårige og hører hjemme i bachelorgruppen.',
    nmbuIds: ['nmbu_bioteknologi2'], defaultIds: ['nmbu_bioteknologi2', 'uib_molekylarbiologi2'],
    entries: [
      {
        id: 'nmbu_bioteknologi2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/bioteknologi',
        years: {
          '2021': Y(179, 118, null, 78.0, 118, 90, null, null, 47, 41),
          '2022': Y(153, 101, null, 85.1, 99, 77, null, null, 41, 40),
          '2023': Y(163, 104, null, 81.7, 91, 76, null, null, 46, 41),
          '2024': Y(154, 91, null, 83.5, 99, 64, null, null, 34, 30),
          '2025': Y(160, 104, null, 75.0, 100, 85, null, 3.0, 39, 34),
          '2026': Y(null, null, 45, null, null, null, null, null),
        },
      },
      {
        id: 'uib_molekylarbiologi2', shortName: 'UiB Molekylærbiologi', institusjon: 'Universitetet i Bergen',
        studiekode: '', studiested: 'Bergen', type: 'master2',
        url: 'https://www.uib.no/studier/MAMN-MOL',
        years: {
          '2021': Y(131, 64, null, 73.4, 64, 39, null, null, 19, 17),
          '2022': Y(114, 48, null, 75.0, 56, 35, null, null, 16, 14),
          '2023': Y(107, 57, null, 68.4, 39, 29, null, null, 17, 15),
          '2024': Y(140, 78, null, 70.5, 57, 42, null, null, 27, 23),
          '2025': Y(187, 60, null, 63.3, 61, 38, null, null, 27, 21),
          '2026': Y(null, null, 20, null, null, null, null, null),
        },
      },
      {
        id: 'ntnu_msbiotech', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        url: 'https://www.ntnu.no/studier/msbiotech',
        years: {
          '2021': Y(607, 334, null, 52.1, 266, 52, null, null, 23, 21),
          '2022': Y(724, 439, null, 57.2, 289, 59, null, null, 20, 15),
          '2023': Y(616, 346, null, 50.3, 163, 67, null, null, 25, 21),
          '2024': Y(216, 76, null, 77.6, 143, 56, null, null, 23, 21),
          '2025': Y(251, 97, null, 69.1, 153, 60, null, null, 31, 28),
        },
      },
    ],
  },
  {
    id: 'kjemi2', label: 'Kjemi (2-årig master)', level: 'master2',
    desc: 'Sammenligner de toårige masterne i kjemi med lokalt opptak.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere» (søknadsalternativer), kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (alle søknadsalternativer uansett prioritet; kvalifiserte = søknadsalternativer merket kvalifisert); tabellen svarte med serverfeil 22.09.2026 og ble hentet på nytt 23.09.2026. DBH har ikke rapportert høstopptaket 2026 ennå, så 2026 er tomt for alle programmene. UiBs kjemimaster har våropptak hvert år i perioden i tillegg til høstopptaket; tallene er summen av vår og høst. Studieplasser og poenggrenser er de som sto på institusjonenes egne programsider da dataene ble hentet, og gjelder siste opptak; de er ført inn på det året sidene oppgir. NMBU oppgir 15 studieplasser og poenggrense 2,6 i 2025 på programsiden, og UiB oppgir 23 studieplasser. UiO publiserer ikke studieplasstall på programsiden. NTNUs toårige kjemimaster (MSCHEM) er engelskspråklig, og NTNU opplyser at siste opptak var høsten 2025; den er derfor tatt med som svakere sammenligning.',
    nmbuIds: ['nmbu_kjemi2'], defaultIds: ['nmbu_kjemi2', 'uio_kjemi2', 'uib_kjemi2'],
    entries: [
      {
        id: 'nmbu_kjemi2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/kjemi',
        years: {
          '2021': Y(55, 26, null, 53.8, 42, 27, null, null, 15, 11),
          '2022': Y(90, 32, null, 62.5, 41, 26, null, null, 11, 9),
          '2023': Y(80, 39, null, 69.2, 37, 21, null, null, 13, 11),
          '2024': Y(39, 16, null, 75.0, 22, 13, null, null, 8, 4),
          '2025': Y(48, 28, null, 64.3, 29, 26, null, 2.6, 15, 14),
          '2026': Y(null, null, 15, null, null, null, null, null),
        },
      },
      {
        id: 'uio_kjemi2', shortName: 'UiO', institusjon: 'Universitetet i Oslo',
        studiekode: '', studiested: 'Oslo', type: 'master2',
        url: 'https://www.uio.no/studier/program/kjemi-master/',
        years: {
          '2021': Y(355, 159, null, 54.1, 122, 56, null, null, 41, 37),
          '2022': Y(365, 155, null, 56.1, 126, 56, null, null, 31, 29),
          '2023': Y(336, 145, null, 51.7, 101, 36, null, null, 24, 21),
          '2024': Y(240, 95, null, 61.1, 104, 47, null, null, 25, 25),
          '2025': Y(254, 98, null, 56.1, 121, 49, null, null, 25, 25),
        },
      },
      {
        id: 'uib_kjemi2', shortName: 'UiB', institusjon: 'Universitetet i Bergen',
        studiekode: '', studiested: 'Bergen', type: 'master2',
        url: 'https://www.uib.no/studier/MAMN-KJEM',
        years: {
          '2021': Y(43, 33, null, 33.3, 28, 24, null, null, 16, 14),
          '2022': Y(51, 42, null, 57.1, 34, 33, null, null, 17, 17),
          '2023': Y(32, 24, null, 70.8, 23, 18, null, null, 10, 8),
          '2024': Y(51, 37, null, 48.6, 28, 25, null, null, 18, 16),
          '2025': Y(61, 45, null, 46.7, 39, 32, null, null, 22, 18),
          '2026': Y(null, null, 23, null, null, null, null, null),
        },
      },
      {
        id: 'ntnu_mschem', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        url: 'https://www.ntnu.no/studier/mschem',
        years: {
          '2021': Y(197, 114, null, 45.6, 73, 31, null, null, 12, 10),
          '2022': Y(207, 129, null, 45.0, 60, 27, null, null, 14, 14),
          '2023': Y(192, 124, null, 46.0, 46, 29, null, null, 11, 9),
          '2024': Y(65, 21, null, 52.4, 29, 14, null, null, 8, 8),
          '2025': Y(93, 42, null, 45.2, 50, 25, null, null, 15, 15),
        },
      },
    ],
  },
  {
    id: 'matteknologi2', label: 'Mat, teknologi og helse (2-årig master)', level: 'master2',
    desc: 'Sammenligner de toårige masterne i matvitenskap og matteknologi med lokalt opptak.',
    note: 'Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. «Alle søkere» (søknadsalternativer), kvalifiserte og tilbud er hentet fra DBH/HKDIR tabell 379 (alle søknadsalternativer uansett prioritet; kvalifiserte = søknadsalternativer merket kvalifisert); tabellen svarte med serverfeil 22.09.2026 og ble hentet på nytt 23.09.2026. DBH har ikke rapportert høstopptaket 2026 ennå, så 2026 er tomt for alle programmene. NMBUs kode M-MAT har i tabell 379 bare data for 2025 (35 søkere uten kvalifikasjon, 4 kvalifiserte søknadsalternativer, 0 tilbud); koden brukt før 2025 er ikke sikkert identifisert og er derfor ikke gjettet - 2021-2024 står som null. Studieplasser og poenggrenser er de som sto på institusjonenes egne programsider da dataene ble hentet, og gjelder siste opptak; de er ført inn på det året sidene oppgir. NMBU oppgir 20 studieplasser på programsiden og publiserer ingen poenggrense. NTNUs «Matvitenskap, teknologi og bærekraft» er den eneste direkte konkurrenten; NTNU opplyser at siste opptak var høsten 2026. NMBUs toårige master i bioinformatikk og anvendt statistikk har ingen egen gruppe fordi bioinformatikk ved UiO og UiB bare tilbys som studieretning inne i informatikk- og Computational Science-masterne, uten eget opptak å sammenligne mot.',
    nmbuIds: ['nmbu_mat_teknologi_helse2'], defaultIds: ['nmbu_mat_teknologi_helse2', 'ntnu_ftmamat'],
    entries: [
      {
        id: 'nmbu_mat_teknologi_helse2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet',
        studiekode: '', studiested: 'Ås', type: 'master2',
        url: 'https://www.nmbu.no/studier/master-2-aar/mat-teknologi-og-helse',
        years: {
          '2025': Y(39, 11, null, 63.6, 4, 0, null, null, 0, 0),
          '2026': Y(null, null, 20, null, null, null, null, null),
        },
      },
      {
        id: 'ntnu_ftmamat', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet',
        studiekode: '', studiested: 'Trondheim', type: 'master2',
        url: 'https://www.ntnu.no/studier/ftmamat',
        years: {
          '2021': Y(111, 40, null, 75.0, 88, 38, null, null, 18, 17),
          '2022': Y(85, 33, null, 60.6, 69, 35, null, null, 16, 16),
          '2023': Y(70, 17, null, 100.0, 57, 22, null, null, 15, 12),
          '2024': Y(95, 35, null, 68.6, 74, 36, null, null, 22, 18),
          '2025': Y(78, 18, null, 100.0, 60, 20, null, null, 10, 10),
        },
      },
    ],
  },
];
