// Register over fakultetene som bruker de generiske fakultetsskjermene
// (landingsside, opptaksanalyse og emne-/karakteranalyse).
//
// Hvert fakultet peker på sine egne genererte datamoduler. Modulene bruker de
// samme eksportnavnene (LANDSAM_*) fordi de skrives av den samme generatoren;
// her får de fakultetsnavn gjennom aliasene under.
import {
  LANDSAM_GROUPS, LANDSAM_YEARS,
  type LandsamGroup,
} from './landsamAdmissionData';
import { LANDSAM_COURSE_GROUPS, LANDSAM_COURSE_YEARS, type LandsamCourseGroup } from './landsamCourseData';
import { LANDSAM_COURSE_MAPPING, type GroupCourseMapping } from './landsamCourseMapping';
import { LANDSAM_STUDYPLAN_GROUPS, type LandsamStudyPlanGroup } from './landsamStudyPlanData';
import {
  MARKET_STATUS as LANDSAM_MARKET_STATUS,
  MARKET_STATUS_HENTET as LANDSAM_MARKET_STATUS_HENTET,
  type MarketInstitution, type MarketDoc,
} from './landsamMarketStatusData';
import {
  STUDIEBAROMETER_ENTRIES as LANDSAM_STUDIEBAROMETER,
  type SbEntry,
} from './landsamStudiebarometerData';

import {
  LANDSAM_GROUPS as REALTEK_GROUPS,
  LANDSAM_YEARS as REALTEK_YEARS,
} from './realtekAdmissionData';
import {
  LANDSAM_COURSE_GROUPS as REALTEK_COURSE_GROUPS,
  LANDSAM_COURSE_YEARS as REALTEK_COURSE_YEARS,
} from './realtekCourseData';
import { LANDSAM_COURSE_MAPPING as REALTEK_COURSE_MAPPING } from './realtekCourseMapping';
import { LANDSAM_STUDYPLAN_GROUPS as REALTEK_STUDYPLAN_GROUPS } from './realtekStudyPlanData';
import {
  MARKET_STATUS as REALTEK_MARKET_STATUS,
  MARKET_STATUS_HENTET as REALTEK_MARKET_STATUS_HENTET,
} from './realtekMarketStatusData';
import { STUDIEBAROMETER_ENTRIES as REALTEK_STUDIEBAROMETER } from './realtekStudiebarometerData';

import {
  LANDSAM_GROUPS as BIOVIT_GROUPS,
  LANDSAM_YEARS as BIOVIT_YEARS,
} from './biovitAdmissionData';
import {
  LANDSAM_COURSE_GROUPS as BIOVIT_COURSE_GROUPS,
  LANDSAM_COURSE_YEARS as BIOVIT_COURSE_YEARS,
} from './biovitCourseData';
import { LANDSAM_COURSE_MAPPING as BIOVIT_COURSE_MAPPING } from './biovitCourseMapping';
import { LANDSAM_STUDYPLAN_GROUPS as BIOVIT_STUDYPLAN_GROUPS } from './biovitStudyPlanData';
import {
  MARKET_STATUS as BIOVIT_MARKET_STATUS,
  MARKET_STATUS_HENTET as BIOVIT_MARKET_STATUS_HENTET,
} from './biovitMarketStatusData';
import { STUDIEBAROMETER_ENTRIES as BIOVIT_STUDIEBAROMETER } from './biovitStudiebarometerData';

import {
  LANDSAM_GROUPS as KBM_GROUPS,
  LANDSAM_YEARS as KBM_YEARS,
} from './kbmAdmissionData';
import {
  LANDSAM_COURSE_GROUPS as KBM_COURSE_GROUPS,
  LANDSAM_COURSE_YEARS as KBM_COURSE_YEARS,
} from './kbmCourseData';
import { LANDSAM_COURSE_MAPPING as KBM_COURSE_MAPPING } from './kbmCourseMapping';
import { LANDSAM_STUDYPLAN_GROUPS as KBM_STUDYPLAN_GROUPS } from './kbmStudyPlanData';
import {
  MARKET_STATUS as KBM_MARKET_STATUS,
  MARKET_STATUS_HENTET as KBM_MARKET_STATUS_HENTET,
} from './kbmMarketStatusData';
import { STUDIEBAROMETER_ENTRIES as KBM_STUDIEBAROMETER } from './kbmStudiebarometerData';

import {
  LANDSAM_GROUPS as MINA_GROUPS,
  LANDSAM_YEARS as MINA_YEARS,
} from './minaAdmissionData';
import {
  LANDSAM_COURSE_GROUPS as MINA_COURSE_GROUPS,
  LANDSAM_COURSE_YEARS as MINA_COURSE_YEARS,
} from './minaCourseData';
import { LANDSAM_COURSE_MAPPING as MINA_COURSE_MAPPING } from './minaCourseMapping';
import { LANDSAM_STUDYPLAN_GROUPS as MINA_STUDYPLAN_GROUPS } from './minaStudyPlanData';
import {
  MARKET_STATUS as MINA_MARKET_STATUS,
  MARKET_STATUS_HENTET as MINA_MARKET_STATUS_HENTET,
} from './minaMarketStatusData';
import { STUDIEBAROMETER_ENTRIES as MINA_STUDIEBAROMETER } from './minaStudiebarometerData';

export type { MarketInstitution, MarketDoc };
export type { SbEntry };

export type FacultyId = 'landsam' | 'realtek' | 'biovit' | 'kbm' | 'mina';

export interface FacultyData {
  id: FacultyId;
  /** Fullt navn, f.eks. «Fakultet for landskap og samfunn». */
  label: string;
  /** Kortform, f.eks. «LANDSAM». */
  shortLabel: string;
  /** Undertittel på fakultetskortet, f.eks. «Eiendom, landskapsarkitektur …». */
  subtitle: string;
  /** Beskrivelsen på fakultetskortet. */
  desc: string;

  admissionGroups: LandsamGroup[];
  admissionYears: readonly string[];
  courseGroups: LandsamCourseGroup[];
  courseYears: number[];
  courseMapping: GroupCourseMapping[];
  studyPlanGroups: LandsamStudyPlanGroup[];
  /** Markedsstatus fra styrepapirer hos konkurrerende institusjoner. */
  marketStatus: MarketInstitution[];
  /** Datoen markedsstatusen sist ble hentet inn, eller null. */
  marketStatusHentet: string | null;
  /** Studiebarometeret: ett innslag per studieprogram i opptaksgruppene. */
  studiebarometer: SbEntry[];
}

export const FACULTIES: Record<FacultyId, FacultyData> = {
  landsam: {
    id: 'landsam',
    label: 'Fakultet for landskap og samfunn',
    shortLabel: 'LANDSAM',
    subtitle: 'Eiendom, landskapsarkitektur, by- og regionplanlegging m.fl.',
    desc: 'Opptakstall, poenggrenser, emnekarakterer, emnekobling på tvers, studieplaner, Studiebarometeret og markedsstatus for fakultetets studieprogram, sammenlignet med konkurrerende program.',
    admissionGroups: LANDSAM_GROUPS,
    admissionYears: LANDSAM_YEARS,
    courseGroups: LANDSAM_COURSE_GROUPS,
    courseYears: LANDSAM_COURSE_YEARS,
    courseMapping: LANDSAM_COURSE_MAPPING,
    studyPlanGroups: LANDSAM_STUDYPLAN_GROUPS,
    marketStatus: LANDSAM_MARKET_STATUS,
    marketStatusHentet: LANDSAM_MARKET_STATUS_HENTET,
    studiebarometer: LANDSAM_STUDIEBAROMETER,
  },
  realtek: {
    id: 'realtek',
    label: 'Fakultet for realfag og teknologi',
    shortLabel: 'REALTEK',
    subtitle: 'Sivilingeniør, datavitenskap, industriell økonomi m.fl.',
    desc: 'Opptakstall, poenggrenser, emnekarakterer, emnekobling på tvers, studieplaner, Studiebarometeret og markedsstatus for fakultetets studieprogram, sammenlignet med konkurrerende program.',
    admissionGroups: REALTEK_GROUPS,
    admissionYears: REALTEK_YEARS,
    courseGroups: REALTEK_COURSE_GROUPS,
    courseYears: REALTEK_COURSE_YEARS,
    courseMapping: REALTEK_COURSE_MAPPING,
    studyPlanGroups: REALTEK_STUDYPLAN_GROUPS,
    marketStatus: REALTEK_MARKET_STATUS,
    marketStatusHentet: REALTEK_MARKET_STATUS_HENTET,
    studiebarometer: REALTEK_STUDIEBAROMETER,
  },
  biovit: {
    id: 'biovit',
    label: 'Fakultet for biovitenskap',
    shortLabel: 'BIOVIT',
    subtitle: 'Biologi, husdyr, planter og akvakultur',
    desc: 'Opptakstall, poenggrenser, emnekarakterer, emnekobling på tvers, studieplaner, Studiebarometeret og markedsstatus for fakultetets studieprogram, sammenlignet med konkurrerende program.',
    admissionGroups: BIOVIT_GROUPS,
    admissionYears: BIOVIT_YEARS,
    courseGroups: BIOVIT_COURSE_GROUPS,
    courseYears: BIOVIT_COURSE_YEARS,
    courseMapping: BIOVIT_COURSE_MAPPING,
    studyPlanGroups: BIOVIT_STUDYPLAN_GROUPS,
    marketStatus: BIOVIT_MARKET_STATUS,
    marketStatusHentet: BIOVIT_MARKET_STATUS_HENTET,
    studiebarometer: BIOVIT_STUDIEBAROMETER,
  },
  kbm: {
    id: 'kbm',
    label: 'Fakultet for kjemi, bioteknologi og matvitenskap',
    shortLabel: 'KBM',
    subtitle: 'Bioteknologi, kjemi og matvitenskap',
    desc: 'Opptakstall, poenggrenser, emnekarakterer, emnekobling på tvers, studieplaner, Studiebarometeret og markedsstatus for fakultetets studieprogram, sammenlignet med konkurrerende program.',
    admissionGroups: KBM_GROUPS,
    admissionYears: KBM_YEARS,
    courseGroups: KBM_COURSE_GROUPS,
    courseYears: KBM_COURSE_YEARS,
    courseMapping: KBM_COURSE_MAPPING,
    studyPlanGroups: KBM_STUDYPLAN_GROUPS,
    marketStatus: KBM_MARKET_STATUS,
    marketStatusHentet: KBM_MARKET_STATUS_HENTET,
    studiebarometer: KBM_STUDIEBAROMETER,
  },
  mina: {
    id: 'mina',
    label: 'Fakultet for miljøvitenskap og naturforvaltning',
    shortLabel: 'MINA',
    subtitle: 'Skogfag, økologi, naturforvaltning og fornybar energi',
    desc: 'Opptakstall, poenggrenser, emnekarakterer, emnekobling på tvers, studieplaner, Studiebarometeret og markedsstatus for fakultetets studieprogram, sammenlignet med konkurrerende program.',
    admissionGroups: MINA_GROUPS,
    admissionYears: MINA_YEARS,
    courseGroups: MINA_COURSE_GROUPS,
    courseYears: MINA_COURSE_YEARS,
    courseMapping: MINA_COURSE_MAPPING,
    studyPlanGroups: MINA_STUDYPLAN_GROUPS,
    marketStatus: MINA_MARKET_STATUS,
    marketStatusHentet: MINA_MARKET_STATUS_HENTET,
    studiebarometer: MINA_STUDIEBAROMETER,
  },
};

export const FACULTY_IDS: FacultyId[] = ['landsam', 'realtek', 'biovit', 'kbm', 'mina'];

/** Vises når et fakultet ennå ikke har noen data i de genererte modulene. */
export const INGEN_DATA_TEKST = 'Ingen data lagt inn ennå for dette fakultetet';
