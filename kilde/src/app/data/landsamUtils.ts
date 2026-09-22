import type { LandsamGroup } from './landsamAdmissionData';
import type { LandsamCourseGroup } from './landsamCourseData';

/** Antall program i gruppen som har minst ett år med søkertall eller poenggrense. */
export function landsamProgramsWithData(g: LandsamGroup): number {
  return g.entries.filter((e) =>
    Object.values(e.years).some((y) => y && (y.alleS != null || y.pg_ord != null || y.pg_fv != null))
  ).length;
}

/** En gruppe kan sammenlignes når minst to program har tall. */
export function landsamHasComparison(g: LandsamGroup): boolean {
  return landsamProgramsWithData(g) >= 2;
}

// ─── Emner og karakterer ─────────────────────────────────────────────────────

/** Antall program i emnegruppen som har minst ett emne med karaktertall. */
export function landsamCourseProgramsWithData(g: LandsamCourseGroup): number {
  return g.programs.filter((p) =>
    p.courses.some((c) => c.years.some((yr) => yr.total > 0))
  ).length;
}

/** En emnegruppe kan sammenlignes når minst to program har emner med tall. */
export function landsamCourseHasComparison(g: LandsamCourseGroup): boolean {
  return landsamCourseProgramsWithData(g) >= 2;
}

/** Sant når minst én av emnegruppene har nok tall til å vise noe. */
export function landsamHasAnyCourseData(groups: LandsamCourseGroup[]): boolean {
  return groups.some((g) => landsamCourseProgramsWithData(g) >= 1);
}
