// Grunndata for vet: lastes først når fakultetet åpnes (se faculties.ts).
import { LANDSAM_GROUPS, LANDSAM_YEARS } from '../vetAdmissionData';
import { COMPLETION_GROUPS, COMPLETION_HENTET } from '../vetCompletionData';
import { STUDENT_GROUPS } from '../vetStudentData';
import { STUDIEBAROMETER_ENTRIES } from '../vetStudiebarometerData';
import { MARKET_STATUS, MARKET_STATUS_HENTET } from '../vetMarketStatusData';
import { FACULTY_META } from '../facultyMeta';
import type { FacultyBase } from '../faculties';

const data: FacultyBase = {
  ...FACULTY_META.vet,
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
