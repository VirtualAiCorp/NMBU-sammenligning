// Grunndata for biovit: lastes først når fakultetet åpnes (se faculties.ts).
import { LANDSAM_GROUPS, LANDSAM_YEARS } from '../biovitAdmissionData';
import { COMPLETION_GROUPS, COMPLETION_HENTET } from '../biovitCompletionData';
import { STUDENT_GROUPS } from '../biovitStudentData';
import { STUDIEBAROMETER_ENTRIES } from '../biovitStudiebarometerData';
import { MARKET_STATUS, MARKET_STATUS_HENTET } from '../biovitMarketStatusData';
import { FACULTY_META } from '../facultyMeta';
import type { FacultyBase } from '../faculties';

const data: FacultyBase = {
  ...FACULTY_META.biovit,
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
