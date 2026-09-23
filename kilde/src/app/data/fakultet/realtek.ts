// Grunndata for realtek: lastes først når fakultetet åpnes (se faculties.ts).
import { LANDSAM_GROUPS, LANDSAM_YEARS } from '../realtekAdmissionData';
import { COMPLETION_GROUPS, COMPLETION_HENTET } from '../realtekCompletionData';
import { STUDENT_GROUPS } from '../realtekStudentData';
import { STUDIEBAROMETER_ENTRIES } from '../realtekStudiebarometerData';
import { MARKET_STATUS, MARKET_STATUS_HENTET } from '../realtekMarketStatusData';
import { FACULTY_META } from '../facultyMeta';
import type { FacultyBase } from '../faculties';

const data: FacultyBase = {
  ...FACULTY_META.realtek,
  admissionGroups: LANDSAM_GROUPS,
  admissionYears: LANDSAM_YEARS,
  marketStatus: MARKET_STATUS,
  marketStatusHentet: MARKET_STATUS_HENTET,
  studiebarometer: STUDIEBAROMETER_ENTRIES,
  completionGroups: COMPLETION_GROUPS,
  completionHentet: COMPLETION_HENTET,
  studentGroups: STUDENT_GROUPS,
};
export default data;
