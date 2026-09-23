// Emnedata for hh (emnekarakterer, emnekobling, studieplaner): den store delen, lastes for seg.
import { LANDSAM_COURSE_GROUPS, LANDSAM_COURSE_YEARS } from '../hhCourseData';
import type { FacultyCourses } from '../faculties';

const data: FacultyCourses = {
  courseGroups: LANDSAM_COURSE_GROUPS,
  courseYears: LANDSAM_COURSE_YEARS,
  courseMapping: [],
  studyPlanGroups: [],
};
export default data;
