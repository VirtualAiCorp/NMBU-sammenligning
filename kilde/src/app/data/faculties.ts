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

import {
  LANDSAM_GROUPS as VET_GROUPS,
  LANDSAM_YEARS as VET_YEARS,
} from './vetAdmissionData';
import {
  LANDSAM_COURSE_GROUPS as VET_COURSE_GROUPS,
  LANDSAM_COURSE_YEARS as VET_COURSE_YEARS,
} from './vetCourseData';
import { LANDSAM_COURSE_MAPPING as VET_COURSE_MAPPING } from './vetCourseMapping';
import { LANDSAM_STUDYPLAN_GROUPS as VET_STUDYPLAN_GROUPS } from './vetStudyPlanData';
import {
  MARKET_STATUS as VET_MARKET_STATUS,
  MARKET_STATUS_HENTET as VET_MARKET_STATUS_HENTET,
} from './vetMarketStatusData';
import { STUDIEBAROMETER_ENTRIES as VET_STUDIEBAROMETER } from './vetStudiebarometerData';

import type { CompletionGroup } from './landsamCompletionData';
import { COMPLETION_GROUPS as LANDSAM_COMPLETION, COMPLETION_HENTET as LANDSAM_COMPLETION_HENTET } from './landsamCompletionData';
import { COMPLETION_GROUPS as REALTEK_COMPLETION, COMPLETION_HENTET as REALTEK_COMPLETION_HENTET } from './realtekCompletionData';
import { COMPLETION_GROUPS as BIOVIT_COMPLETION, COMPLETION_HENTET as BIOVIT_COMPLETION_HENTET } from './biovitCompletionData';
import { COMPLETION_GROUPS as KBM_COMPLETION, COMPLETION_HENTET as KBM_COMPLETION_HENTET } from './kbmCompletionData';
import { COMPLETION_GROUPS as MINA_COMPLETION, COMPLETION_HENTET as MINA_COMPLETION_HENTET } from './minaCompletionData';
import { COMPLETION_GROUPS as VET_COMPLETION, COMPLETION_HENTET as VET_COMPLETION_HENTET } from './vetCompletionData';
import type { StudentGroup } from './landsamStudentData';
import { STUDENT_GROUPS as LANDSAM_STUDENTS } from './landsamStudentData';
import { STUDENT_GROUPS as REALTEK_STUDENTS } from './realtekStudentData';
import { STUDENT_GROUPS as BIOVIT_STUDENTS } from './biovitStudentData';
import { STUDENT_GROUPS as KBM_STUDENTS } from './kbmStudentData';
import { STUDENT_GROUPS as MINA_STUDENTS } from './minaStudentData';
import { STUDENT_GROUPS as VET_STUDENTS } from './vetStudentData';
import { LANDSAM_GROUPS as HH_GROUPS, LANDSAM_YEARS as HH_YEARS } from './hhAdmissionData';
import { LANDSAM_COURSE_GROUPS as HH_COURSE_GROUPS, LANDSAM_COURSE_YEARS as HH_COURSE_YEARS } from './hhCourseData';
import { STUDIEBAROMETER_ENTRIES as HH_STUDIEBAROMETER } from './hhStudiebarometerData';
import { COMPLETION_GROUPS as HH_COMPLETION, COMPLETION_HENTET as HH_COMPLETION_HENTET } from './hhCompletionData';
import { STUDENT_GROUPS as HH_STUDENTS } from './hhStudentData';

export type { MarketInstitution, MarketDoc };
export type { CompletionGroup };
export type { SbEntry };

export type FacultyId = 'hh' | 'landsam' | 'realtek' | 'biovit' | 'kbm' | 'mina' | 'vet';

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
  /** Gjennomføring, frafall, registrerte, nye og kandidater per program (DBH 707/123/110/104/335). */
  completionGroups: CompletionGroup[];
  completionHentet: string | null;
  /** «Studentene»: alder, utenlandske og utveksling per program (DBH 60/135/142). */
  studentGroups: StudentGroup[];
}

export const FACULTIES: Record<FacultyId, FacultyData> = {
  hh: {
    id: 'hh',
    label: 'Handelshøyskolen',
    shortLabel: 'HH',
    subtitle: 'Økonomi og administrasjon, samfunnsøkonomi, økonomi, ledelse og IT',
    desc: 'Handelshøyskolen på samme format som de andre fakultetene: opptak, emnekarakterer, gjennomføring, studentene, Studiebarometeret, fagmiljø, bolig, økonomi og inntekt, mot de samme konkurrentene som i den opprinnelige HH-analysen.',
    admissionGroups: HH_GROUPS,
    admissionYears: HH_YEARS,
    courseGroups: HH_COURSE_GROUPS,
    courseYears: HH_COURSE_YEARS,
    courseMapping: [],
    studyPlanGroups: [],
    marketStatus: [],
    marketStatusHentet: null,
    studiebarometer: HH_STUDIEBAROMETER,
    completionGroups: HH_COMPLETION,
    completionHentet: HH_COMPLETION_HENTET,
    studentGroups: HH_STUDENTS,
  },
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
    completionGroups: LANDSAM_COMPLETION,
    completionHentet: LANDSAM_COMPLETION_HENTET,
    studentGroups: LANDSAM_STUDENTS,
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
    completionGroups: REALTEK_COMPLETION,
    completionHentet: REALTEK_COMPLETION_HENTET,
    studentGroups: REALTEK_STUDENTS,
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
    completionGroups: BIOVIT_COMPLETION,
    completionHentet: BIOVIT_COMPLETION_HENTET,
    studentGroups: BIOVIT_STUDENTS,
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
    completionGroups: KBM_COMPLETION,
    completionHentet: KBM_COMPLETION_HENTET,
    studentGroups: KBM_STUDENTS,
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
    completionGroups: MINA_COMPLETION,
    completionHentet: MINA_COMPLETION_HENTET,
    studentGroups: MINA_STUDENTS,
  },
  vet: {
    id: 'vet',
    label: 'Veterinærhøgskolen',
    shortLabel: 'VET',
    subtitle: 'Veterinærmedisin og dyrepleie',
    desc: 'Opptakstall, poenggrenser, emnekarakterer, studieplaner, Studiebarometeret og markedsstatus for veterinærmedisin og dyrepleie. Veterinærmedisin er eneste norske tilbud og vises med medisinstudiene som referanse; dyrepleie sammenlignes med Nord universitet.',
    admissionGroups: VET_GROUPS,
    admissionYears: VET_YEARS,
    courseGroups: VET_COURSE_GROUPS,
    courseYears: VET_COURSE_YEARS,
    courseMapping: VET_COURSE_MAPPING,
    studyPlanGroups: VET_STUDYPLAN_GROUPS,
    marketStatus: VET_MARKET_STATUS,
    marketStatusHentet: VET_MARKET_STATUS_HENTET,
    studiebarometer: VET_STUDIEBAROMETER,
    completionGroups: VET_COMPLETION,
    completionHentet: VET_COMPLETION_HENTET,
    studentGroups: VET_STUDENTS,
  },
};

export const FACULTY_IDS: FacultyId[] = ['landsam', 'realtek', 'biovit', 'kbm', 'mina', 'vet'];
/** Alle fakulteter med standardformat, inkludert Handelshøyskolen (som har eget kort på forsiden). */
export const ALL_FACULTY_IDS: FacultyId[] = ['hh', ...FACULTY_IDS];

/** Vises når et fakultet ennå ikke har noen data i de genererte modulene. */
export const INGEN_DATA_TEKST = 'Ingen data lagt inn ennå for dette fakultetet';
