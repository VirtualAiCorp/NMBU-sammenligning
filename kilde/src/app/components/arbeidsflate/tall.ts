/**
 * Nøkkeltall for arbeidsflaten, regnet ut fra fakultetsdataene appen alt laster (opptak og gjennomføring).
 * Ingen tall er skrevet inn for hånd: alt kommer fra admissionGroups og completionGroups i data/fakultet/<id>.ts.
 */
import type { FacultyBase } from '../../data/faculties';
import type { FullAdmissionEntry, FullYearData } from '../../data/fullAdmissionData';
import type { LandsamGroup } from '../../data/landsamAdmissionData';

/** Tall med norsk formatering (mellomrom som tusenskille, desimalkomma). */
export const nf = (v: number | null | undefined, d = 0) =>
  v == null || Number.isNaN(v) ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Samme program kan stå i flere grupper; studiekoden (eller id-en) skiller dem. */
const nokkel = (e: FullAdmissionEntry) => e.studiekode || e.id;

/** NMBU-programmene i gruppene, hvert program én gang. */
export function nmbuProgram(grupper: LandsamGroup[]): FullAdmissionEntry[] {
  const m = new Map<string, FullAdmissionEntry>();
  for (const g of grupper) for (const e of g.entries) if (g.nmbuIds.includes(e.id) && !m.has(nokkel(e))) m.set(nokkel(e), e);
  return [...m.values()];
}

/** Konkurrerende program i gruppene, hvert program én gang. */
export function konkurrentProgram(grupper: LandsamGroup[]): FullAdmissionEntry[] {
  const nmbu = new Set(nmbuProgram(grupper).map(nokkel));
  const m = new Map<string, FullAdmissionEntry>();
  for (const g of grupper) for (const e of g.entries) if (!g.nmbuIds.includes(e.id) && !nmbu.has(nokkel(e)) && !m.has(nokkel(e))) m.set(nokkel(e), e);
  return [...m.values()];
}

/** Institusjonene NMBU sammenlignes med. */
export function institusjoner(grupper: LandsamGroup[]): string[] {
  return [...new Set(konkurrentProgram(grupper).map((e) => e.institusjon).filter((i) => i && !/miljø- og biovitenskapelige/.test(i)))];
}

type Felt = 'fvS' | 'plasser' | 'alleS' | 'pg_ord';
const verdi = (e: FullAdmissionEntry, aar: string, felt: Felt): number | null => {
  const y: FullYearData | undefined = e.years[aar];
  const v = y?.[felt];
  return v == null ? null : v;
};

/** Siste år der minst ett av programmene har tall for feltet. */
export function sisteAar(program: FullAdmissionEntry[], felt: Felt): string | null {
  const aar = new Set<string>();
  for (const e of program) for (const [a, y] of Object.entries(e.years)) if (y && y[felt] != null) aar.add(a);
  return [...aar].sort().pop() ?? null;
}

/**
 * Summen for feltet i `aar`, og endringen fra året før regnet bare på programmene som har tall begge årene
 * (så nye eller nedlagte program ikke gir falske hopp).
 */
export function sumMedEndring(program: FullAdmissionEntry[], felt: Felt, aar: string) {
  const forrige = String(Number(aar) - 1);
  let sum = 0, n = 0, na = 0, fo = 0;
  for (const e of program) {
    const v = verdi(e, aar, felt);
    if (v == null) continue;
    sum += v; n++;
    const f = verdi(e, forrige, felt);
    if (f != null) { na += v; fo += f; }
  }
  return { sum: n ? sum : null, antall: n, endring: fo > 0 ? ((na - fo) / fo) * 100 : null, forrige };
}

/**
 * Summen per år for programmene som har tall i alle årene (til arealdiagrammet). Startåret flyttes fram når nye
 * program ellers ville falt ut: det tidligste året der minst 80 % av programmene med tall de siste tre årene er med.
 */
export function serie(program: FullAdmissionEntry[], felt: Felt, aarListe: readonly string[]) {
  const med = (fra: number) => program.filter((e) => aarListe.slice(fra).every((a) => verdi(e, a, felt) != null));
  const maks = med(Math.max(0, aarListe.length - 3)).length;
  let fra = 0;
  while (fra < aarListe.length - 3 && med(fra).length < 0.8 * maks) fra++;
  const valgt = med(fra), aar = aarListe.slice(fra);
  return { antall: valgt.length, punkter: aar.map((a) => ({ aar: a, v: valgt.reduce((s, e) => s + (verdi(e, a, felt) ?? 0), 0) })) };
}

/** Poenggrensen (ordinær kvote) for NMBU-programmet i gruppen; 0 betyr at alle kvalifiserte kom inn. */
export function poenggrense(g: LandsamGroup, aar: string): { v: number | null; alle: boolean } {
  const e = g.entries.find((x) => g.nmbuIds.includes(x.id));
  const v = e?.years[aar]?.pg_ord;
  return { v: v == null || v === 0 ? null : v, alle: v === 0 };
}

/**
 * Fullført på normert tid for NMBU-programmene i gruppen: siste startkull med normert slutt senest `til`.
 * Summerer NMBU-programmene i gruppen for det samme kullet. null når DBH ikke har tall.
 */
export function gjennomforing(fak: FacultyBase, gruppeId: string, til = 2025): { fullfort: number; kull: number; aar: number } | null {
  const cg = fak.completionGroups.find((c) => c.id === gruppeId);
  if (!cg) return null;
  const nmbu = cg.programs.filter((p) => p.isNmbu || cg.nmbuIds.includes(p.entryId));
  const aarene = nmbu.flatMap((p) => p.kull.filter((k) => k.startkull > 0 && k.normertAar != null && k.normertAar <= til).map((k) => k.aar));
  if (!aarene.length) return null;
  const aar = Math.max(...aarene);
  let fullfort = 0, kull = 0;
  for (const p of nmbu) { const k = p.kull.find((x) => x.aar === aar); if (k && k.startkull > 0) { fullfort += k.fullfortNormert; kull += k.startkull; } }
  return kull ? { fullfort, kull, aar } : null;
}

export const NIVAA: Record<string, string> = { bachelor: 'Bachelor', master5: 'Femårig master', master2: 'Toårig master', aarsstudium: 'Årsstudium' };
