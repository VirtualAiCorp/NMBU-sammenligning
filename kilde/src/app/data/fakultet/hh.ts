// Grunndata for hh: lastes først når fakultetet åpnes (se faculties.ts).
import { LANDSAM_GROUPS, LANDSAM_YEARS } from '../hhAdmissionData';
import { COMPLETION_GROUPS, COMPLETION_HENTET } from '../hhCompletionData';
import { STUDENT_GROUPS } from '../hhStudentData';
import { STUDIEBAROMETER_ENTRIES } from '../hhStudiebarometerData';
import { FACULTY_META } from '../facultyMeta';
import type { FacultyBase } from '../faculties';

const data: FacultyBase = {
  ...FACULTY_META.hh,
  admissionGroups: LANDSAM_GROUPS,
  admissionYears: LANDSAM_YEARS,
  marketStatus: [],
  marketStatusHentet: null,
  studiebarometer: STUDIEBAROMETER_ENTRIES,
  completionGroups: COMPLETION_GROUPS,
  completionHentet: COMPLETION_HENTET,
  studentGroups: STUDENT_GROUPS,
};
export default data;
