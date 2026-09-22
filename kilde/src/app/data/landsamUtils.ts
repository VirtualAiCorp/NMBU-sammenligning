import type { LandsamGroup } from './landsamAdmissionData';

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
