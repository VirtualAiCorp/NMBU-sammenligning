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
  LANDSAM_GROUPS as REALTEK_GROUPS,
  LANDSAM_YEARS as REALTEK_YEARS,
} from './realtekAdmissionData';
import {
  LANDSAM_COURSE_GROUPS as REALTEK_COURSE_GROUPS,
  LANDSAM_COURSE_YEARS as REALTEK_COURSE_YEARS,
} from './realtekCourseData';
import { LANDSAM_COURSE_MAPPING as REALTEK_COURSE_MAPPING } from './realtekCourseMapping';
import { LANDSAM_STUDYPLAN_GROUPS as REALTEK_STUDYPLAN_GROUPS } from './realtekStudyPlanData';

export type FacultyId = 'landsam' | 'realtek';

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
}

export const FACULTIES: Record<FacultyId, FacultyData> = {
  landsam: {
    id: 'landsam',
    label: 'Fakultet for landskap og samfunn',
    shortLabel: 'LANDSAM',
    subtitle: 'Eiendom, landskapsarkitektur, by- og regionplanlegging m.fl.',
    desc: 'Opptakstall og poenggrenser for fakultetets studieprogram sammenlignet med konkurrerende program.',
    admissionGroups: LANDSAM_GROUPS,
    admissionYears: LANDSAM_YEARS,
    courseGroups: LANDSAM_COURSE_GROUPS,
    courseYears: LANDSAM_COURSE_YEARS,
    courseMapping: LANDSAM_COURSE_MAPPING,
    studyPlanGroups: LANDSAM_STUDYPLAN_GROUPS,
  },
  realtek: {
    id: 'realtek',
    label: 'Fakultet for realfag og teknologi',
    shortLabel: 'REALTEK',
    subtitle: 'Sivilingeniør, datavitenskap, industriell økonomi m.fl.',
    desc: 'Opptakstall og poenggrenser for fakultetets studieprogram sammenlignet med konkurrerende program.',
    admissionGroups: REALTEK_GROUPS,
    admissionYears: REALTEK_YEARS,
    courseGroups: REALTEK_COURSE_GROUPS,
    courseYears: REALTEK_COURSE_YEARS,
    courseMapping: REALTEK_COURSE_MAPPING,
    studyPlanGroups: REALTEK_STUDYPLAN_GROUPS,
  },
};

export const FACULTY_IDS: FacultyId[] = ['landsam', 'realtek'];

/** Vises når et fakultet ennå ikke har noen data i de genererte modulene. */
export const INGEN_DATA_TEKST = 'Ingen data lagt inn ennå for dette fakultetet';
