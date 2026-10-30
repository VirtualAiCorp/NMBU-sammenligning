/**
 * Datalaget for AJG-Analyse HH: typer for ajg-data.json (laget av scripts/rangering/ajg_analyse.py), dekryptering med
 * passordet (WebCrypto, samme oppsett som rangeringen) og små hjelpere for tall og CSV.
 */
export const NIV = ['1', '2', '3', '4', '4*'] as const;
export type Niva = (typeof NIV)[number];

export interface Maal {
  n: number; brok?: number; niva?: Record<Niva, number>; k3?: number; k4?: number;
  a3?: number; a4?: number; ci3?: [number, number] | null; ci4?: [number, number] | null; snitt?: number;
  e3?: number; e4?: number; i3?: number | null; i4?: number | null;
  /** bare i feltsjekken: p-verdi og andelen i resten av enheten */
  p3?: number | null; p4?: number | null; rest3?: number | null; rest4?: number | null;
}
export interface Enhet {
  kort: string; navn?: string; type: 'samlet' | 'norge' | 'ref' | 'gruppe';
  n: number; econ: number; andelEcon: number | null; andelEconBrok: number | null; andelBred: number | null;
  felt: Record<string, number>; econM: Maal; restM: Maal; alle: Maal; p3?: number | null; p4?: number | null;
  median?: number | null; antall?: number; skoler?: string[];
}
export interface TrendAar { n: number; econ: number; andel: number | null; a4e?: number | null; a4r?: number | null; a3e?: number | null; a3r?: number | null; i4e?: number | null; i4r?: number | null }
export interface IntlSkole { id: string; kort: string; navn: string; land: string; gruppe: string; utd: number | null; topp: string[]; n: number; econ: number; andelEcon: number | null; a4e?: number | null; a4r?: number | null }
/** [tittel, issn, eissn, felt, ajg2024, ajg2021, norge samlet, per skole (rekkefølge = norske), Europatoppen, Verdenstoppen] */
export type Tidsskrift = [string, string, string, string, Niva, string | null, number, number[], number, number];
/** [år, tittel, tidsskrift, AJG-felt, AJG-nivå, norsk nivå, forfattere, fra HH NMBU] */
export type HhArtikkel = [number, string, string, string | null, Niva | null, string, number, number];

/** Robusthet til artikkelen: se scripts/rangering/artikkel/ og docs/ajg-artikkel/ */
export interface GrenseRad { id: string; kort: string; gruppe: string; n: number; econ: number; andel: number; plassering: string; enhet: string | null; sikkerhet: string; kilde: string | string[] | null; avgrensning: string; kontroll: string | null }
export interface GrenseGruppe { skoler: number; median: number; samlet: number; min: number; max: number; n: number }
export interface KvMaal { n: number; t10: number | null; t1: number | null; abdcAstar: number | null; abdcA: number | null; ft50: number | null; niva2: number | null; a3: number | null; a4: number | null; i10: number | null; i1: number | null; e10: number | null }
export interface KvSml { econ: KvMaal; andre: KvMaal; ci: { econI10: number[]; andreI10: number[]; econI1: number[]; andreI1: number[] }; antallT1: number[]; p_ft50?: number | null; p_a3?: number | null; p_a4?: number | null; p_abdcAstar?: number | null; p_abdcA?: number | null }
export interface InstMaal { n: number; a3: number | null; a4: number | null }
export interface InstRad { enhet: string; alle: number; econFelt: number; depArt: number; andelDepIEcon: number; andelEconFraDep: number; etterTidsskrift: { econ: InstMaal; andre: InstMaal }; etterInstitutt: { econ: InstMaal; andre: InstMaal } }
export interface Artikkel {
  grenser: { rader: GrenseRad[]; varianter: Record<string, { grupper: Record<string, GrenseGruppe>; p: number | null }>; uenig: string[] };
  institutt: Record<string, InstRad>;
  kvalitet: { sammenligning: Record<string, KvSml>; perFelt: Record<string, KvMaal>; verdenFelt: Record<string, { n: number; t10: number; t1: number }>; verdenEcon: Record<string, { n: number; t10: number; t1: number }>; grense: Record<string, { n: number; andel: number; a4e: number; a4r: number }> };
  kontroll: { n: number; like: number; tilfeldige: number; tilfeldigeLike: number; usikre: number; usikreLike: number; uenig: string[] };
}

export interface AjgData {
  generert: string; periode: [number, number]; aar: [number, number]; felt: string[]; norske: string[]; kort: Record<string, string>;
  liste: {
    n: number; niva: Record<Niva, number>; felt: Record<string, Record<Niva, number>>; overgang: Record<string, number>;
    nye: number; nye4s: number; nye4: number; dubletterTittel: number; dubletterIssn: number; utenIssn: number; utenFelt: number;
    offisielt: { n: number; nye: number; nye4s: number; nye4: number; fjernet: number; kilder: string[] };
    /** Table 3 i metodedokumentet: per fagfelt [4 inkl. 4*, 3, 2, 1], vår uthenting og offisielt */
    tabell3?: Record<string, { vaar: number[]; off: number[] }>;
    /** Stikkprøve i AJG-portalen: [tittel, felt, 2024, 2021, portalens felt, 2024, 2021, grunn for utvalget] */
    stikkprove?: { dato: string; rader: [string, string, string, string, string, string, string, string][] } | null;
  };
  verdenFelt: Record<string, { n: number; a3: number; a4: number }>;
  enheter: Record<string, Enhet>;
  trend: Record<string, Record<string, TrendAar>>;
  feltsjekk: Record<string, Record<string, Maal>>;
  intl: IntlSkole[];
  tidsskrift: Tidsskrift[];
  hh: HhArtikkel[];
  artikkel?: Artikkel;
}

const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export async function dekrypter(pw: string): Promise<AjgData> {
  const r = await fetch(`${import.meta.env.BASE_URL}ajg-data.json`, { cache: 'no-store' });
  if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) throw new Error('Fant ikke datafilen');
  const e = await r.json();
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(e.salt), iterations: e.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(e.iv) }, key, b64(e.data));
  return JSON.parse(new TextDecoder().decode(plain));
}

export const nf = (v: number | null | undefined, d = 0) =>
  v == null || !Number.isFinite(v) ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });
/** Andel (0–1) som prosent med én desimal */
export const pst = (v: number | null | undefined, d = 1) => (v == null ? '–' : `${nf(100 * v, d)} %`);
export const pTekst = (p: number | null | undefined) => (p == null ? '–' : p < 0.001 ? '< 0,001' : nf(p, 3));
export const signifikant = (p: number | null | undefined) => p != null && p < 0.05;

/** Fargene følger enheten, ikke rekkefølgen (referansepaletten i dataviz-skillen; mørk modus i ajg.css). */
export const FARGE: Record<string, string> = {
  norge: 'var(--ajg-s1)', nmbu: 'var(--ajg-s2)', topp_europa: 'var(--ajg-s3)', topp_verden: 'var(--ajg-s4)',
  utenNhhBi: 'var(--ajg-s5)', nhh: 'var(--ajg-s6)', bi: 'var(--ajg-s7)', europa: 'var(--ajg-s8)', verden: 'var(--ajg-noytral)',
};
export const ECON_FARGE = 'var(--ajg-s1)';
export const ANDRE_FARGE = 'var(--ajg-s2)';
export const NIVA_FARGE: Record<Niva, string> = { '1': 'var(--ajg-q1)', '2': 'var(--ajg-q2)', '3': 'var(--ajg-q3)', '4': 'var(--ajg-q4)', '4*': 'var(--ajg-q5)' };

/** Fullt navn på AJG-fagfeltene (AJGs egne engelske navn). */
export const FELTNAVN: Record<string, string> = {
  ACCOUNT: 'Accounting', 'BUS HIST & ECON HIST': 'Business and Economic History', ECON: 'Economics, Econometrics and Statistics',
  'ENT-SBM': 'Entrepreneurship and Small Business Management', 'ETHICS-CSR-MAN': 'Business Ethics, CSR and Management',
  FINANCE: 'Finance', 'HRM&EMP': 'Human Resource Management and Employment Studies', 'IB&AREA': 'International Business and Area Studies',
  'INFO MAN': 'Information Management', INNOV: 'Innovation', 'MDEV&EDU': 'Management Development and Education', MKT: 'Marketing',
  'OPS&TECH': 'Operations and Technology Management', 'OR&MANSCI': 'Operations Research and Management Science',
  'ORG STUD': 'Organisation Studies', 'PSYCH (GENERAL)': 'Psychology (General)', 'PSYCH (WOP-OB)': 'Psychology (Work and Organisational)',
  'PUB SEC': 'Public Sector and Health Care', 'REGIONAL STUDIES, PLANNING AND ENVIRONMENT': 'Regional Studies, Planning and Environment',
  SECTOR: 'Sector Studies', 'SOC SCI': 'Social Sciences', STRAT: 'Strategy',
};
export const kortFelt = (f: string) => (f.startsWith('REGIONAL') ? 'REGIONAL STUDIES' : f);

/** Last ned rader som CSV (semikolon og desimalkomma, så Excel med norsk oppsett åpner den riktig). */
export function lastNedCsv(filnavn: string, hode: string[], rader: (string | number | null | undefined)[][]) {
  const celle = (v: string | number | null | undefined) => {
    if (v == null) return '';
    const s = typeof v === 'number' ? String(v).replace('.', ',') : v;
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const tekst = '﻿' + [hode, ...rader].map((r) => r.map(celle).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([tekst], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = filnavn; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
