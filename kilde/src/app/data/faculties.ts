// Register over fakultetene som bruker de generiske fakultetsskjermene
// (landingsside, opptaksanalyse og emne-/karakteranalyse).
//
// Dataene lastes først når et fakultet åpnes, i to deler per fakultet:
//   fakultet/<id>.ts       grunndata: opptak, gjennomføring, studentene, Studiebarometeret, markedsstatus
//   fakultet/<id>Emner.ts  emnekarakterer, emnekobling og studieplaner (den store delen, flere MB for noen fakulteter)
// Navn og beskrivelser ligger i facultyMeta.ts, slik at forsiden og menyene ikke trenger dataene.
import { useEffect, useState } from 'react';
import type { LandsamGroup } from './landsamAdmissionData';
import type { LandsamCourseGroup } from './landsamCourseData';
import type { GroupCourseMapping } from './landsamCourseMapping';
import type { LandsamStudyPlanGroup } from './landsamStudyPlanData';
import type { MarketInstitution, MarketDoc } from './landsamMarketStatusData';
import type { SbEntry } from './landsamStudiebarometerData';
import type { CompletionGroup } from './landsamCompletionData';
import type { StudentGroup } from './landsamStudentData';
import { FACULTY_META, type FacultyId, type FacultyMeta } from './facultyMeta';

export type { MarketInstitution, MarketDoc };
export type { CompletionGroup };
export type { SbEntry };
export type { FacultyId, FacultyMeta };
export { FACULTY_META, FACULTY_IDS, ALL_FACULTY_IDS, INGEN_DATA_TEKST } from './facultyMeta';

export interface FacultyData extends FacultyMeta {
  admissionGroups: LandsamGroup[];
  admissionYears: readonly string[];
  courseGroups: LandsamCourseGroup[];
  courseYears: number[];
  courseMapping: GroupCourseMapping[];
  studyPlanGroups: LandsamStudyPlanGroup[];
  /** Markedsstatus fra styrepapirer hos konkurrerende institusjoner. */
  marketStatus: MarketInstitution[];
  /** Datoen markedsstatusen sist ble hentet inn, eller null. */
  marketStatusHentet: string | null;
  /** Studiebarometeret: ett innslag per studieprogram i opptaksgruppene. */
  studiebarometer: SbEntry[];
  /** Gjennomføring, frafall, registrerte, nye og kandidater per program (DBH 707/123/110/104/335). */
  completionGroups: CompletionGroup[];
  completionHentet: string | null;
  /** «Studentene»: alder, utenlandske og utveksling per program (DBH 60/135/142). */
  studentGroups: StudentGroup[];
  /** Emnedataene (courseGroups, courseMapping, studyPlanGroups) er lastet. Før det er listene tomme. */
  emnerLastet?: boolean;
}

type EmneFelt = 'courseGroups' | 'courseYears' | 'courseMapping' | 'studyPlanGroups';
export type FacultyBase = Omit<FacultyData, EmneFelt | 'emnerLastet'>;
export type FacultyCourses = Pick<FacultyData, EmneFelt>;

const GRUNN: Record<FacultyId, () => Promise<{ default: FacultyBase }>> = {
  hh: () => import('./fakultet/hh'),
  landsam: () => import('./fakultet/landsam'),
  realtek: () => import('./fakultet/realtek'),
  biovit: () => import('./fakultet/biovit'),
  kbm: () => import('./fakultet/kbm'),
  mina: () => import('./fakultet/mina'),
  vet: () => import('./fakultet/vet'),
};
const EMNER: Record<FacultyId, () => Promise<{ default: FacultyCourses }>> = {
  hh: () => import('./fakultet/hhEmner'),
  landsam: () => import('./fakultet/landsamEmner'),
  realtek: () => import('./fakultet/realtekEmner'),
  biovit: () => import('./fakultet/biovitEmner'),
  kbm: () => import('./fakultet/kbmEmner'),
  mina: () => import('./fakultet/minaEmner'),
  vet: () => import('./fakultet/vetEmner'),
};
const INGEN_EMNER: FacultyCourses = { courseGroups: [], courseYears: [], courseMapping: [], studyPlanGroups: [] };

const grunnCache = new Map<FacultyId, Promise<FacultyBase>>();
const emneCache = new Map<FacultyId, Promise<FacultyCourses>>();
const ferdig = new Map<string, FacultyData>(); // synkron snarvei når dataene alt er lastet

export function loadFacultyBase(id: FacultyId): Promise<FacultyBase> {
  if (!grunnCache.has(id)) grunnCache.set(id, GRUNN[id]().then((m) => m.default));
  return grunnCache.get(id)!;
}
export function loadFacultyCourses(id: FacultyId): Promise<FacultyCourses> {
  if (!emneCache.has(id)) emneCache.set(id, EMNER[id]().then((m) => m.default));
  return emneCache.get(id)!;
}

/**
 * Fakultetsdataene for `id`, eller null mens grunndataene lastes.
 * `emner`: 'kreves' venter også på emnedataene; 'bakgrunn' gir grunndataene straks og fyller inn emnene
 * når de er lastet (emnerLastet); 'nei' laster ikke emnene.
 */
export function useFacultyData(id: FacultyId | null, emner: 'kreves' | 'bakgrunn' | 'nei' = 'nei'): FacultyData | null {
  const key = (e: boolean) => `${id}:${e ? 1 : 0}`;
  const [data, setData] = useState<FacultyData | null>(() => (id ? ferdig.get(key(true)) ?? (emner !== 'kreves' ? ferdig.get(key(false)) : undefined) ?? null : null));
  useEffect(() => {
    if (!id) { setData(null); return; }
    let aktiv = true;
    const medEmner = ferdig.get(key(true));
    if (medEmner) { setData(medEmner); return; }
    setData(emner !== 'kreves' ? ferdig.get(key(false)) ?? null : null);
    loadFacultyBase(id).then((b) => {
      const uten: FacultyData = { ...b, ...INGEN_EMNER, emnerLastet: false };
      ferdig.set(key(false), uten);
      if (emner === 'kreves') return;
      if (aktiv) setData(uten);
    });
    if (emner !== 'nei') {
      Promise.all([loadFacultyBase(id), loadFacultyCourses(id)]).then(([b, c]) => {
        const full: FacultyData = { ...b, ...c, emnerLastet: true };
        ferdig.set(key(true), full);
        if (aktiv) setData(full);
      });
    }
    return () => { aktiv = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, emner]);
  // Ved bytte av fakultet kan tilstanden et øyeblikk høre til det forrige; vis da ingenting.
  if (!data || data.id !== id || (emner === 'kreves' && !data.emnerLastet)) return null;
  return data;
}

/** Grunndataene for alle fakultetene (forsidematrisen i dashboard-oppsettet og oppsettlaben). */
export function useAllFacultyBases(ids: FacultyId[]): FacultyBase[] | null {
  const [data, setData] = useState<FacultyBase[] | null>(null);
  useEffect(() => {
    let aktiv = true;
    Promise.all(ids.map(loadFacultyBase)).then((d) => { if (aktiv) setData(d); });
    return () => { aktiv = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')]);
  return data;
}
