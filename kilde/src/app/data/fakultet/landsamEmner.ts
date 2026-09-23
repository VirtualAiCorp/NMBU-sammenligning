// Emnedata for landsam (emnekarakterer, emnekobling, studieplaner): den store delen, lastes for seg.
import { LANDSAM_COURSE_GROUPS, LANDSAM_COURSE_YEARS } from '../landsamCourseData';
import { LANDSAM_COURSE_MAPPING } from '../landsamCourseMapping';
import { LANDSAM_STUDYPLAN_GROUPS } from '../landsamStudyPlanData';
import type { FacultyCourses } from '../faculties';

const data: FacultyCourses = {
  courseGroups: LANDSAM_COURSE_GROUPS,
  courseYears: LANDSAM_COURSE_YEARS,
  courseMapping: LANDSAM_COURSE_MAPPING,
  studyPlanGroups: LANDSAM_STUDYPLAN_GROUPS,
};
export default data;
