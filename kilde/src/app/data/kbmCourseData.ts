// GENERERT av scripts/build-kbm-courses.py – stub. Ikke rediger for hånd.
// Tom foreløpig: generatoren skriver over hele filen når KBM-emnetallene legges inn.
// Eksportnavnene er med vilje de samme som i landsamCourseData.ts.
import type { LandsamCourseGroup } from './landsamCourseData';

export type {
  CourseGradeYear, CourseStats, ProgramCourses, LandsamCourseGroup,
} from './landsamCourseData';

export const LANDSAM_COURSE_YEARS: number[] = [2021, 2022, 2023, 2024, 2025];

export const LANDSAM_COURSE_GROUPS: LandsamCourseGroup[] = [];
