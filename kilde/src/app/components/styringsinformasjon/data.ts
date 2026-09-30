/**
 * Data og utregninger for styringsinformasjonen. Ingen tall skrives inn her: alt regnes ut fra datasettene appen
 * alt har (DBH-filene i data/, fakultetsdataene og JSON-filene i public/). Lasterne tåler at en fil mangler.
 */
import { useEffect, useState } from 'react';
import type { FacultyBase } from '../../data/faculties';
import type { FacultyId } from '../../data/facultyMeta';
import type { FullAdmissionEntry } from '../../data/fullAdmissionData';

/** DBH-avdelingskoden for NMBU-fakultetene (DBH 210), som i scripts/build-staff.py og forskning.json. */
export const FAK_KODE: Record<FacultyId, string> = { vet: '410', landsam: '420', mina: '430', kbm: '440', biovit: '450', realtek: '460', hh: '470' };

// ── JSON-filer i public/ som lastes ved behov ───────────────────────────────
function hentJson<T>(sti: string, gyldig: (d: unknown) => boolean) {
  let last: Promise<T | null> | null = null;
  return () => (last ??= fetch(`${import.meta.env.BASE_URL}${sti}`)
    .then((r) => (r.ok ? r.text() : null))
    // Utviklingsserveren og Cloudflare kan svare med index.html når fila mangler: da er det ikke JSON
    .then((t) => { if (!t) return null; try { const d = JSON.parse(t); return gyldig(d) ? (d as T) : null; } catch { return null; } })
    .catch(() => { last = null; return null; }));
}
export function useJson<T>(hent: () => Promise<T | null>): T | null | undefined {
  const [d, setD] = useState<T | null | undefined>(undefined);
  useEffect(() => { let aktiv = true; hent().then((x) => { if (aktiv) setD(x); }); return () => { aktiv = false; }; }, [hent]);
  return d;
}

// Forskningsfinansiering (scripts/build-forskning.py)
export interface NfrAar { soknader: number; innvilget: number; avslag: number; suksessrate: number | null; innvilgetBelop: number }
export interface EuAar { deltakelser: number; koordinator: number; bidragMillEuro: number }
export interface ForskEnhet { kort?: string; fak?: string | null; navn?: string; nfr?: Record<string, NfrAar>; nfrUtbetalt?: Record<string, number>; eu?: Record<string, Record<string, EuAar>> }
export interface ForskData { hentet: string; periode: [number, number]; institusjoner: Record<string, ForskEnhet>; fakulteter?: Record<string, ForskEnhet> }
export const hentForskning = hentJson<ForskData>('fagmiljo/forskning.json', (d) => !!d && typeof d === 'object' && 'institusjoner' in (d as object));

// Studieplasser og ledig-lista (scripts/fetch-samordna-katalog.py)
export interface PlassProgram { plasser: Record<string, number>; ledig2026?: boolean; nedlagt?: boolean }
export interface PlassData { hentet: string; program: Record<string, PlassProgram> }
export const hentStudieplasser = hentJson<PlassData>('studieplasser/data.json', (d) => !!d && typeof d === 'object' && 'program' in (d as object));

// ── Opptak ─────────────────────────────────────────────────────────────────
export const OPPTAKSAAR = ['2021', '2022', '2023', '2024', '2025', '2026'];
const nokkel = (e: FullAdmissionEntry) => e.studiekode || e.id;

export interface NmbuProgram { e: FullAdmissionEntry; fak: FacultyId; navn: string; nivaa: string; gruppe: string }
/** NMBU-programmene i fakultetenes opptaksgrupper, hvert program én gang (studiekode, ellers id). */
export function nmbuProgrammer(fakulteter: FacultyBase[]): NmbuProgram[] {
  const m = new Map<string, NmbuProgram>();
  for (const f of fakulteter) for (const g of f.admissionGroups) for (const e of g.entries) {
    if (!g.nmbuIds.includes(e.id) || m.has(nokkel(e))) continue;
    const navn = /^NMBU$/i.test(e.shortName.trim()) ? g.label : e.shortName.replace(/^NMBU\s+/i, '');
    m.set(nokkel(e), { e, fak: f.id, navn, nivaa: g.level, gruppe: g.label });
  }
  return [...m.values()];
}

/** Summen for feltet per år, bare for programmene som har tall alle årene i lista (stabile tidsserier). */
export function stabilSerie(ps: FullAdmissionEntry[], felt: 'fvS' | 'plasser', aar: string[]) {
  const med = ps.filter((e) => aar.every((a) => e.years[a]?.[felt] != null));
  return { antall: med.length, verdier: aar.map((a) => (med.length ? med.reduce((s, e) => s + (e.years[a]?.[felt] ?? 0), 0) : null)) };
}
/** Sum i `aar` og endring fra året før på programmene som har tall begge årene. */
export function sumOgEndring(ps: FullAdmissionEntry[], felt: 'fvS' | 'plasser', aar: string) {
  const f = String(Number(aar) - 1);
  let sum = 0, n = 0, na = 0, fo = 0;
  for (const e of ps) {
    const v = e.years[aar]?.[felt]; if (v == null) continue;
    sum += v; n++;
    const x = e.years[f]?.[felt]; if (x != null) { na += v; fo += x; }
  }
  return { sum: n ? sum : null, antall: n, endring: fo > 0 ? ((na - fo) / fo) * 100 : null };
}

// ── Gjennomføring ──────────────────────────────────────────────────────────
export const GJ_TIL = 2025;
/**
 * Fullført på normert tid for NMBU-programmene i fakultetet, samlet per år normert tid gikk ut (2019–2025).
 * Hvert program telles én gang. Bachelor, femårig og toårig master slås sammen.
 */
export function gjennomforingPerAar(f: FacultyBase, aar: number[]) {
  const sett = new Set<string>();
  const acc = new Map<number, { fullfort: number; kull: number }>();
  for (const g of f.completionGroups) for (const p of g.programs) {
    if (!(p.isNmbu || g.nmbuIds.includes(p.entryId)) || sett.has(p.entryId)) continue;
    sett.add(p.entryId);
    for (const k of p.kull) {
      if (!k.startkull || k.normertAar == null || !aar.includes(k.normertAar)) continue;
      const a = acc.get(k.normertAar) ?? { fullfort: 0, kull: 0 };
      a.fullfort += k.fullfortNormert; a.kull += k.startkull; acc.set(k.normertAar, a);
    }
  }
  return aar.map((a) => { const x = acc.get(a); return x && x.kull ? { aar: a, ...x, andel: (100 * x.fullfort) / x.kull } : { aar: a, fullfort: 0, kull: 0, andel: null as number | null }; });
}
/** Siste kull med normert slutt senest GJ_TIL for ett program. */
export function sisteKull(f: FacultyBase, entryId: string) {
  for (const g of f.completionGroups) {
    const p = g.programs.find((x) => x.entryId === entryId);
    if (!p) continue;
    const k = p.kull.filter((x) => x.startkull > 0 && x.normertAar != null && x.normertAar <= GJ_TIL).sort((a, b) => b.aar - a.aar)[0];
    if (k) return { startaar: k.aar, fullfort: k.fullfortNormert, kull: k.startkull, andel: (100 * k.fullfortNormert) / k.startkull };
  }
  return null;
}

// ── Studiebarometeret ──────────────────────────────────────────────────────
export function helhet(f: FacultyBase) {
  const nm = f.studiebarometer.filter((s) => s.isNmbu && s.scores.helhetsvurdering != null);
  const sett = new Set<string>(); const vals: number[] = []; let aar = 0;
  for (const s of nm) { if (sett.has(s.entryId)) continue; sett.add(s.entryId); vals.push(s.scores.helhetsvurdering!); aar = Math.max(aar, s.latestYear ?? 0); }
  return vals.length ? { snitt: vals.reduce((a, b) => a + b, 0) / vals.length, n: vals.length, aar: aar || null } : null;
}
