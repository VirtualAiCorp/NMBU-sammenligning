import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import '../../styles/skoleportrett.css';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Lock, Info, Trophy, BookOpen, Building2, FileText, RotateCcw, ShieldCheck, ExternalLink, Columns3, FlaskConical, Link2, Check, Newspaper, ClipboardList } from 'lucide-react';

/**
 * Utkast til «Norwegian Business School Ranking» (intern, utforskende). Data fra scripts/build-rangering.py:
 * DBH (årsverk, publiseringspoeng, nivå 2), NVA (artikler med tidsskrift og ISSN) koblet mot ABDC, FT50, UTD24 og
 * AJG 2024 når lista er lagt inn, og opptak, Studiebarometeret og gjennomføring fra HH-sammenligningene.
 * Kryptert med samme oppskrift og passord som InternOpptak (AES-256-GCM, PBKDF2-SHA256).
 * Den sammensatte poengsummen regnes i nettleseren, så vektene kan prøves fritt.
 */

// ── Datatyper (speiler build-rangering.py) ───────────────────────────────────
interface DbhAar { arsverk: number | null; faglige: number | null; rekruttering: number | null; forsteAndel: number | null; studenter: number | null; publPoeng: number | null; publikasjoner: number | null; uff: number | null; utenStip?: number | null; poengPerUff: number | null; poengPerFaglig: number | null; niva2Andel: number | null; /** nivå 2 som andel av forfatterandelene (HK-dir, Tilstandsrapporten V15.3) */ niva2AndelFa?: number | null; /** nivå 2 som andel av publikasjonene (BIs variant) */ niva2AndelPubl?: number | null; studenterPerFaglig: number | null; }
interface ArtAar { n: number; nvi: number; intlAndel: number | null; forfatterandel: number | null; niva: Record<'0' | '1' | '2' | 'u', number>; ajg: Record<string, number> | null; abdc: Record<string, number>; ft50: number; utd24: number; /** «niva|abdc|ft|ajg» → [antall, sum forfatterandel] */ komb?: Record<string, [number, number]>; /** kalibrert AJG-anslag, NVI-artikler */ ajgA?: { topp: number; '3': number; nvi: number };
  /** «FUAJ|nivå|v/x» → [antall, sum forfatterandel]: hvilke lister som gir Topp (FT50, UTD24, ABDC A*, AJG 4/4*) */ toppKomb?: Record<string, [number, number]>;
  /** Slik skolene rapporterer: hel telling, bare NVI-rapporterte artikler (samme grunnlag som HK-dir/DBH) */ rapport?: Record<string, number | boolean>; }
interface Topp { aar: number; tittel: string | null; tidsskrift: string | null; ajg: string | null; abdc: string | null; ft50: boolean; utd24: boolean; niva: string; nvi?: boolean; }
interface Siv { aar: number | null; grense: number | null; estimert: boolean; merknad: string | null; url: string | null; }
interface Utd { studiebarometerResp?: number | null; entryIds?: string[]; aar: number; program: number; plasser: number | null; forstevalg: number | null; fvPerPlass: number | null; poenggrenseMaks: number | null; poenggrenseMin: number | null; studiebarometer: number | null; normertTid: number | null; normertKull: number | null; }
interface Akk { navn?: string; type?: string; aar?: number | string | null; url?: string | null; [k: string]: unknown }
interface Skole {
  id: string; navn: string; navnEn?: string | null; kort: string; institusjon?: string | null; isNmbu: boolean; ren: boolean; referanse: boolean;
  akkreditering: (Akk | string)[]; rangeringer: (Record<string, unknown> | string)[]; enhetNotat?: string | null;
  dbh: Record<string, DbhAar>; artikler: Record<string, ArtAar>; topp: Topp[]; ajgFagfelt: Record<string, number>;
  utdanning: Partial<Record<'oa' | 'moa', Utd>> & { siv?: Siv | null };
  /** ABS/AJG 4*, 4 og 3 per år fra NHHs forskningsrapport (åtte skoler), antall og per årsverk. */
  ajgNhh?: Record<string, Partial<Record<'4*' | '4' | '3', { n: number; perFte: number }>>> | null;
}
interface AjgNhhMeta { kilde: string; url: string; liste: string; nevner: string; usikker: Record<string, number[]>; sider: Record<string, number>; }
interface Kontroll { skole: string; enhet?: string | null; enhetNavn?: string | null; aar: number | null; maal: string; verdi: number | string | null; nevner?: string | null; kilde?: string | null; url?: string | null; side?: number | string | null; merknad?: string | null; vaar?: number | null; vaarAlt?: number | null; vaarNivaa?: string; avvikProsent?: number | null; traff?: 'hoved' | 'alt'; }
interface Data { versjon: number; generert: string; aar: [number, number]; lister: Record<'ajg' | 'abdc' | 'ft50' | 'utd24', boolean> & { ajgA?: boolean }; skoler: Skole[]; kontroll?: Kontroll[]; ajgNhh?: AjgNhhMeta | null; }

const PW_KEY = 'intern-opptak-pw'; // samme passord som den interne opptakssiden
const GRONN = 'var(--nmbu-green-dark)';
const nf = (v: number | null | undefined, d = 1) => v == null || !Number.isFinite(v) ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });
const kort = { backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' } as const;

// ── Dekryptering (WebCrypto), som i InternOpptak ─────────────────────────────
const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function dekrypter(pw: string): Promise<Data> {
  const r = await fetch(`${import.meta.env.BASE_URL}intern/rangering.json`, { cache: 'no-store' });
  if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) throw new Error('Fant ikke datafilen');
  const e = await r.json();
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(e.salt), iterations: e.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(e.iv) }, key, b64(e.data));
  return JSON.parse(new TextDecoder().decode(plain));
}

// ── Indikatorer ──────────────────────────────────────────────────────────────
const snitt = (xs: (number | null | undefined)[]) => { const v = xs.filter((x): x is number => x != null && Number.isFinite(x)); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const aarRekke = (fra: number, til: number) => Array.from({ length: til - fra + 1 }, (_, i) => String(fra + i));
/** Siste år med publiseringspoeng i DBH for flertallet av skolene. */
function sisteDbhAar(d: Data): number {
  for (let y = d.aar[1]; y >= d.aar[0]; y--) if (d.skoler.filter((s) => s.dbh[String(y)]?.publPoeng != null).length >= d.skoler.length / 2) return y;
  return d.aar[1];
}
function artSum(s: Skole, aar: string[]) {
  // Grunnlaget er NVI-rapporterte artikler (det HK-dir/DBH teller), hel telling, når byggeskriptet har levert det.
  let n = 0, ft = 0, utd = 0, ftUtd = 0, intl = 0, ajg34 = 0, ajg4 = 0, ajgN = 0, abdcA = 0;
  for (const y of aar) {
    const a = s.artikler[y]; if (!a) continue;
    const r = a.rapport;
    if (r) {
      const g = (k: string) => Number(r[k] ?? 0);
      n += g('nvi'); ft += g('ft50'); utd += g('utd24'); ftUtd += g('ftUtd'); intl += g('intl');
      abdcA += g('abdcA*') + g('abdcA');
      if (r.harAjg) { ajgN += g('nvi'); ajg34 += g('ajg3') + g('ajg4') + g('ajg4*'); ajg4 += g('ajg4') + g('ajg4*'); }
      continue;
    }
    n += a.n; ft += a.ft50; utd += a.utd24; ftUtd += Math.max(a.ft50, a.utd24); intl += (a.intlAndel ?? 0) * a.n / 100;
    if (a.ajg) { ajgN += a.n; ajg34 += (a.ajg['3'] ?? 0) + (a.ajg['4'] ?? 0) + (a.ajg['4*'] ?? 0); ajg4 += (a.ajg['4'] ?? 0) + (a.ajg['4*'] ?? 0); }
    abdcA += (a.abdc['A*'] ?? 0) + (a.abdc['A'] ?? 0);
  }
  return { n, ft, utd, ftUtd, intl, ajg34, ajg4, ajgN, abdcA };
}

// ── Lagdelt forskningsmål («høyeste nivå teller») ───────────────────────────
// Hver artikkel får ett trinn: det høyeste av norsk nivå, ABDC, FT50/UTD24 og AJG (når lista finnes). Trinnene vektes,
// og artikkelen telles med enhetens forfatterandel (1/n per forfatter) eller helt. Ingenting telles dobbelt.
type Trinn = 'null' | 'basis' | 'hoy' | 'topp';
const TRINN: Trinn[] = ['basis', 'hoy', 'topp'];
const TRINN_NAVN: Record<Trinn, string> = { null: 'Ikke vitenskapelig', basis: 'Basis', hoy: 'Høy', topp: 'Topp' };
const TRINN_FORKLARING: Record<Exclude<Trinn, 'null'>, string> = {
  basis: 'Norsk nivå 1, ABDC B/C, AJG 1–2',
  hoy: 'Norsk nivå 2, ABDC A, AJG 3',
  topp: 'FT50/UTD24, ABDC A*, AJG 4/4*',
};
const TRINN_FARGE: Record<Exclude<Trinn, 'null'>, string> = { basis: '#9FCFC2', hoy: '#3F8E7B', topp: '#014238' };
const RANG: Record<Trinn, number> = { null: 0, basis: 1, hoy: 2, topp: 3 };
interface Lag { fra: number; til: number; brok: boolean; /** uff = UN1 + UN2 (HK-dir); utenStip = UN1 + postdoktorer (NHH) */ nevner: 'uff' | 'utenStip'; vekter: Record<'basis' | 'hoy' | 'topp', number>; abdc: boolean; ft: boolean; ajg: boolean; /** bare NVI-rapporterte artikler (HK-dirs grunnlag) */ kunNvi: boolean; }
const lagStandard = (y1: number): Lag => ({ fra: y1 - 4, til: y1, brok: true, nevner: 'uff', vekter: { basis: 1, hoy: 3, topp: 5 }, abdc: true, ft: true, ajg: true, kunNvi: true });

function trinnFor(nokkel: string, lag: Lag): { t: Trinn; loftet: boolean } {
  const [niva, abdc, ft, ajg] = nokkel.split('|');
  const norsk: Trinn = niva === '2' ? 'hoy' : niva === '1' ? 'basis' : 'null';
  let t = norsk;
  const opp = (x: Trinn) => { if (RANG[x] > RANG[t]) t = x; };
  if (lag.abdc && abdc && abdc !== '-') opp(abdc === 'A*' ? 'topp' : abdc === 'A' ? 'hoy' : 'basis');
  if (lag.ft && ft && ft !== '-') opp('topp');
  if (lag.ajg && ajg && ajg !== '-' && ajg !== '?') opp(ajg === '4' || ajg === '4*' ? 'topp' : ajg === '3' ? 'hoy' : 'basis');
  return { t, loftet: RANG[t] > RANG[norsk] };
}
interface LagRes {
  artikler: number; andeler: number; per: Record<Trinn, number>; vektet: number; uff: number | null; perArsverk: number | null;
  dekning: { abdc: number; ft: number; ajg: number | null; noen: number }; loftet: number;
}
function lagResultat(s: Skole, lag: Lag, harAjg: boolean): LagRes {
  const per: Record<Trinn, number> = { null: 0, basis: 0, hoy: 0, topp: 0 };
  let artikler = 0, andeler = 0, abdc = 0, ft = 0, ajg = 0, noen = 0, loftet = 0;
  const aar = aarRekke(lag.fra, lag.til);
  for (const y of aar) {
    for (const [nk, [n, frac]] of Object.entries(s.artikler[y]?.komb ?? {})) {
      if (lag.kunNvi && nk.split('|')[4] === 'x') continue;
      const { t, loftet: l } = trinnFor(nk, lag);
      const tell = lag.brok ? frac : n;
      per[t] += tell; artikler += n; andeler += frac;
      const [, a, f, j] = nk.split('|');
      const paA = a !== '-', paF = f !== '-', paJ = j !== '-' && j !== '?';
      if (paA) abdc += n; if (paF) ft += n; if (paJ) ajg += n; if (paA || paF || paJ) noen += n;
      if (l) loftet += n;
    }
  }
  const vektet = TRINN.reduce((a, t) => a + per[t] * lag.vekter[t as 'basis'], 0);
  const uff = snitt(aar.map((y) => lag.nevner === 'utenStip' ? s.dbh[y]?.utenStip : s.dbh[y]?.uff));
  const pst = (x: number) => artikler ? 100 * x / artikler : 0;
  return { artikler, andeler, per, vektet, uff, perArsverk: uff ? vektet / uff : null,
    dekning: { abdc: pst(abdc), ft: pst(ft), ajg: harAjg ? pst(ajg) : null, noen: pst(noen) }, loftet: pst(loftet) };
}

type Dim = 'Forskning' | 'Utdanning' | 'Fagmiljø' | 'Anerkjennelse';
const DIMS: Dim[] = ['Forskning', 'Utdanning', 'Fagmiljø', 'Anerkjennelse'];
/** Standardandeler per dimensjon (prosent). Forskningen velges i trinn; de andre deler resten i dette forholdet. */
const DIM_STANDARD: Record<Dim, number> = { Forskning: 75, Utdanning: 20, Fagmiljø: 3, Anerkjennelse: 2 };
const FORSK_STANDARD = 75;
const FORSK_TRINN = [50, 55, 60, 65, 70, 75, 80, 85];
interface Ind { id: string; label: string; dim: Dim; vekt: number; desc: string; fmt: (v: number | null) => string; verdi: (s: Skole) => number | null; }
function lagIndikatorer(d: Data, lag: Lag): Ind[] {
  const y1 = sisteDbhAar(d);
  const tre = aarRekke(y1 - 2, y1);
  const fem = aarRekke(y1 - 4, y1);
  const harAjg = d.lister.ajg;
  const vindu = lag.fra === lag.til ? String(lag.fra) : `${lag.fra}–${lag.til}`;
  return ([
    { id: 'poeng', label: 'Poeng per faglig årsverk', dim: 'Forskning', vekt: 25, desc: `Publiseringspoeng per faglig årsverk inkl. rekrutteringsstillinger (UN1 + stipendiater og postdoktorer), snitt ${tre[0]}–${y1}. DBH 373/225. Samme definisjon som HK-dirs tilstandsrapport og HHs infografikk.`,
      fmt: (v) => nf(v, 2), verdi: (s) => snitt(tre.map((y) => s.dbh[y]?.poengPerUff)) },
    { id: 'lag', label: 'Lagdelt forskning per årsverk', dim: 'Forskning', vekt: 25, desc: `Artikler ${vindu} vektet etter høyeste nivå (norsk nivå, ABDC, FT50/UTD24${harAjg ? ', AJG' : ''}), ${lag.brok ? 'brøkdelt per forfatter (1/n)' : 'hel telling'}, per årsverk (${lag.nevner === 'uff' ? 'UN1 + stipendiater og postdoktorer, som HK-dir' : 'UN1 + postdoktorer, uten stipendiater, som NHH'}; snitt over perioden). Vekter basis ${lag.vekter.basis}, høy ${lag.vekter.hoy}, topp ${lag.vekter.topp}. Innstillingene endres i Forskningslab. NVA × lister.`,
      fmt: (v) => nf(v, 2), verdi: (s) => lagResultat(s, lag, harAjg).perArsverk },
    { id: 'niva2', label: 'Andel nivå 2 (HK-dir)', dim: 'Forskning', vekt: 5, desc: `Andel av forfatterandelene på nivå 2, slik HK-dir regner i Tilstandsrapporten (V15.3), snitt ${tre[0]}–${y1}. DBH 374. NHH oppgir andel av poengene og BI andel av publikasjonene; begge vises i «Slik rapporterer skolene». Inngår også i det lagdelte målet.`,
      fmt: (v) => nf(v, 0) + ' %', verdi: (s) => snitt(tre.map((y) => s.dbh[y]?.niva2AndelFa ?? null)) },
    harAjg
      ? { id: 'ajg34', label: 'Andel AJG 3–4*', dim: 'Forskning', vekt: 0, desc: `Andel av artiklene ${fem[0]}–${y1} i tidsskrift på AJG 2024 nivå 3, 4 eller 4*. NVA × AJG. Inngår i det lagdelte målet, derfor vekt 0 som standard.`,
          fmt: (v) => nf(v, 0) + ' %', verdi: (s) => { const a = artSum(s, fem); return a.ajgN ? 100 * a.ajg34 / a.ajgN : null; } }
      : { id: 'abdcA', label: 'Andel ABDC A/A*', dim: 'Forskning', vekt: 0, desc: `Andel av artiklene ${fem[0]}–${y1} i tidsskrift med ABDC A eller A*. NVA × ABDC. Inngår i det lagdelte målet, derfor vekt 0 som standard.`,
          fmt: (v) => nf(v, 0) + ' %', verdi: (s) => { const a = artSum(s, fem); return a.n ? 100 * a.abdcA / a.n : null; } },
    harAjg
      ? { id: 'ajg4', label: 'AJG 4/4* per 100 årsverk', dim: 'Forskning', vekt: 10, desc: `Artikler ${fem[0]}–${y1} i tidsskrift på AJG 2024 nivå 4 eller 4* per 100 årsverk (UN1 + UN2, snitt). NVA × AJG, alle skoler.`,
          fmt: (v) => nf(v, 1), verdi: (s) => { const n = artSum(s, fem).ajg4; const uff = snitt(fem.map((y) => s.dbh[y]?.uff)); return uff ? 100 * n / uff : null; } }
      : d.lister.ajgA
      ? { id: 'ajgA', label: 'AJG 4/4*-anslag per 100 årsverk', dim: 'Forskning', vekt: 5, desc: `Anslått antall artikler ${fem[0]}–${y1} på AJG-nivå 4/4* per 100 årsverk (UN1 + UN2, snitt), alle 15 skoler. Anslaget bygger bare på åpne lister (FT50/UTD24, eller ABDC A* med OpenAlex-sitering ≥ 5) og er kalibrert mot NHH-rapportens AJG-tall (r = 0,98 per skole og år). Det er ikke AJG-nivåer.`,
          fmt: (v) => nf(v, 1), verdi: (s) => { const n = fem.reduce((a, y) => a + (s.artikler[y]?.ajgA?.topp ?? 0), 0); const uff = snitt(fem.map((y) => s.dbh[y]?.uff)); return uff ? 100 * n / uff : null; } }
      : null,
    { id: 'ajgNhh', label: 'AJG 4/4* per årsverk (NHH-rapporten)', dim: 'Forskning', vekt: d.lister.ajgA ? 0 : 10, desc: 'Artikler på AJG 2024 nivå 4 og 4* per årsverk (uten stipendiater), snitt 2022–2024. NHH Research Report 2024, tabell 4 og 5: bare åtte skoler (NHH, BI, NMBU, Nord, NTNU, UiA, UiS, UiT); for de andre fordeles vekten på de andre målene.',
          fmt: (v) => nf(v, 2), verdi: (s) => s.ajgNhh ? snitt(['2022', '2023', '2024'].map((y) => { const a = s.ajgNhh?.[y]; return a ? (a['4*']?.perFte ?? 0) + (a['4']?.perFte ?? 0) : null; })) : null },
    { id: 'ft50', label: 'FT50/UTD24 per 100 årsverk', dim: 'Forskning', vekt: 5, desc: `Artikler ${fem[0]}–${y1} i FT50 eller UTD24 per 100 UFF-årsverk (snitt). Én artikkel i begge lister telles én gang. Bare NVI-rapporterte artikler, hel telling.`,
      fmt: (v) => nf(v, 1), verdi: (s) => { const a = artSum(s, fem); const uff = snitt(fem.map((y) => s.dbh[y]?.uff)); return uff ? 100 * a.ftUtd / uff : null; } },
    { id: 'intl', label: 'Internasjonal sampublisering', dim: 'Forskning', vekt: 5, desc: `Andel NVI-rapporterte artikler ${fem[0]}–${y1} med minst én utenlandsk medforfatter. NVA.`,
      fmt: (v) => nf(v, 0) + ' %', verdi: (s) => { const a = artSum(s, fem); return a.n ? 100 * a.intl / a.n : null; } },
    { id: 'siv', label: 'Opptaksgrense siviløkonom', dim: 'Utdanning', vekt: 7, desc: 'Inntaksgrense til toårig master i økonomi og administrasjon (siviløkonom), karaktersnitt fra bachelor (A = 5 … E = 1), siste lokale opptak. Fra HH-oversikten (MASTER_ADMISSION); Kristiania er anslått. HVL, HiMolde og HiØ mangler, og da fordeles vekten på de andre målene.',
      fmt: (v) => nf(v, 2), verdi: (s) => s.utdanning.siv?.grense ?? null },
    { id: 'fv', label: 'Førstevalg per plass ØA', dim: 'Utdanning', vekt: 5, desc: 'Førstevalgsøkere per studieplass, bachelor i økonomi og administrasjon (bare bachelor, ikke femårig siviløkonom), alle studiesteder samlet. Samordna opptak. (Private BI og Kristiania har eget opptak og mangler.)',
      fmt: (v) => nf(v, 2), verdi: (s) => s.utdanning.oa?.fvPerPlass ?? null },
    { id: 'sb', label: 'Studiebarometeret ØA', dim: 'Utdanning', vekt: 5, desc: 'Helhetsvurdering (1–5) for skolens bachelorprogram i økonomi og administrasjon, siste år, vektet med antall respondenter. Programmer uten nok svar er ikke med. studiebarometeret.no.',
      fmt: (v) => nf(v, 1), verdi: (s) => s.utdanning.oa?.studiebarometer ?? null },
    { id: 'normert', label: 'Fullført på normert tid ØA', dim: 'Utdanning', vekt: 3, desc: 'Andel av startkullet 2022 i bachelor i økonomi og administrasjon som fullførte på normert tid (alle studiesteder samlet). DBH.',
      fmt: (v) => nf(v, 0) + ' %', verdi: (s) => s.utdanning.oa?.normertTid ?? null },
    { id: 'forste', label: 'Andel førstestillinger', dim: 'Fagmiljø', vekt: 3, desc: `Professor, dosent, førsteamanuensis og førstelektor som andel av faglige årsverk, ${y1}. DBH 225.`,
      fmt: (v) => nf(v, 0) + ' %', verdi: (s) => s.dbh[String(y1)]?.forsteAndel ?? null },
    { id: 'akk', label: 'Akkrediteringer', dim: 'Anerkjennelse', vekt: 2, desc: 'Antall av AACSB, EQUIS og AMBA.',
      fmt: (v) => v == null ? '–' : String(v), verdi: (s) => akkNavn(s).filter((n) => /AACSB|EQUIS|AMBA/i.test(n)).length },
  ] as (Ind | null)[]).filter((i): i is Ind => i != null);
}
function akkNavn(s: Skole): string[] {
  return (s.akkreditering ?? []).map((a) => typeof a === 'string' ? a : String(a.navn ?? a.type ?? a.akkreditering ?? '')).filter(Boolean);
}

// ── Beregning: vekter, poengsum, plassintervall og grupper ───────────────────
function effektiveVekter(ind: Ind[], vekt: Record<string, number>, forsk: number) {
  const andel: Record<Dim, number> = { Forskning: forsk, Utdanning: 0, Fagmiljø: 0, Anerkjennelse: 0 };
  const rest = DIMS.filter((d) => d !== 'Forskning');
  const std = rest.reduce((a, d) => a + DIM_STANDARD[d], 0);
  rest.forEach((d) => { andel[d] = (100 - forsk) * DIM_STANDARD[d] / std; });
  const ut: Record<string, number> = {};
  for (const d of DIMS) {
    const mine = ind.filter((i) => i.dim === d); const sum = mine.reduce((a, i) => a + (vekt[i.id] ?? 0), 0);
    mine.forEach((i) => { ut[i.id] = sum ? andel[d] * (vekt[i.id] ?? 0) / sum : 0; });
  }
  return { ut, andel };
}
type Gruppe = 'Topp' | 'Midt' | 'Nedre';
interface Rad { s: Skole; score: number | null; plass: number | null; delt: Record<string, { v: number | null; n: number | null; plass: number | null }>; mangler: number; min: number | null; max: number | null; gruppe: Gruppe | null; grense: boolean; }
function beregn(skoler: Skole[], ind: Ind[], vekt: Record<string, number>, forsk: number): Rad[] {
  // Min–maks-normalisering til 0–100 blant skolene som vises; manglende verdi → vekten fordeles på resten.
  const verdier = Object.fromEntries(ind.map((i) => [i.id, skoler.map((s) => i.verdi(s))]));
  const norm = (id: string, v: number | null) => {
    const xs = verdier[id].filter((x): x is number => x != null);
    if (v == null || xs.length < 2) return null;
    const lo = Math.min(...xs), hi = Math.max(...xs);
    return hi === lo ? 50 : 100 * (v - lo) / (hi - lo);
  };
  const plassI = (id: string, v: number | null) => v == null ? null : 1 + verdier[id].filter((x) => x != null && (x as number) > v).length;
  const score = (eut: Record<string, number>) => skoler.map((s, k) => {
    let sum = 0, w = 0, mangler = 0;
    for (const i of ind) {
      const n = norm(i.id, verdier[i.id][k]);
      if (n == null) { if (eut[i.id] > 0) mangler++; continue; }
      sum += n * eut[i.id]; w += eut[i.id];
    }
    return { sc: w ? sum / w : null, mangler };
  });
  const plasser = (sc: (number | null)[]) => sc.map((x) => x == null ? null : 1 + sc.filter((y) => y != null && y > x + 1e-9).length);
  const naa = score(effektiveVekter(ind, vekt, forsk).ut);
  const plassNaa = plasser(naa.map((x) => x.sc));
  // Plassintervall: plassen ved hvert trinn for forskningens andel (50–85 %) med de samme relative vektene.
  const alle = FORSK_TRINN.map((f) => plasser(score(effektiveVekter(ind, vekt, f).ut).map((x) => x.sc)));
  const n = plassNaa.filter((x) => x != null).length;
  const gr = (p: number): Gruppe => p <= Math.ceil(n / 3) ? 'Topp' : p <= Math.ceil(2 * n / 3) ? 'Midt' : 'Nedre';
  return skoler.map((s, k) => {
    const ps = alle.map((a) => a[k]).filter((x): x is number => x != null);
    const p = plassNaa[k];
    const min = ps.length ? Math.min(...ps) : null, max = ps.length ? Math.max(...ps) : null;
    const delt = Object.fromEntries(ind.map((i) => { const v = verdier[i.id][k]; return [i.id, { v, n: norm(i.id, v), plass: plassI(i.id, v) }]; }));
    return { s, score: naa[k].sc, plass: p, delt, mangler: naa[k].mangler, min, max,
      gruppe: p == null ? null : gr(p), grense: p != null && min != null && max != null && gr(min) !== gr(max) };
  }).sort((a, b) => (a.plass ?? 99) - (b.plass ?? 99));
}

// ── Tilstand i lenken (?rangering&…) ────────────────────────────────────────
type Fane = 'forside' | 'rangering' | 'sammenlign' | 'lab' | 'publisering' | 'rapport' | 'profil' | 'kontroll' | 'metode';
const FANER: Fane[] = ['forside', 'rangering', 'sammenlign', 'lab', 'publisering', 'rapport', 'profil', 'kontroll', 'metode'];
interface Tilstand { fane: Fane; forsk: number; vekt: Record<string, number>; medRef: boolean; lag: Lag; valgt: string[]; profil: string; /** sammenligning i skoleportrettet */ mot: string | null; }
const PARAM = ['rangering', 'fane', 'forsk', 'vekt', 'ref', 'periode', 'telling', 'nevner', 'lagvekt', 'lister', 'grunnlag', 'skoler', 'profil', 'mot'];
function lesTilstand(d: Data, ind: Ind[], std: Tilstand): Tilstand {
  const q = new URLSearchParams(window.location.search);
  if (!q.has('rangering')) return std;
  const t: Tilstand = { ...std, vekt: { ...std.vekt }, lag: { ...std.lag, vekter: { ...std.lag.vekter } } };
  const fane = q.get('fane') as Fane | null; if (fane && FANER.includes(fane)) t.fane = fane;
  const f = Number(q.get('forsk')); if (FORSK_TRINN.includes(f)) t.forsk = f;
  for (const del of (q.get('vekt') ?? '').split(',')) { const [id, v] = del.split(':'); if (ind.some((i) => i.id === id) && Number.isFinite(Number(v))) t.vekt[id] = Math.max(0, Math.min(40, Number(v))); }
  t.medRef = q.get('ref') === '1';
  const per = (q.get('periode') ?? '').split('-').map(Number); if (per.length === 2 && per.every((x) => x >= d.aar[0] && x <= d.aar[1]) && per[0] <= per[1]) { t.lag.fra = per[0]; t.lag.til = per[1]; }
  if (q.get('telling') === 'hel') t.lag.brok = false;
  if (q.get('nevner') === 'utenstip') t.lag.nevner = 'utenStip';
  if (q.get('grunnlag') === 'alle') t.lag.kunNvi = false;
  const lv = (q.get('lagvekt') ?? '').split('-').map(Number); if (lv.length === 3 && lv.every((x) => Number.isFinite(x) && x >= 0 && x <= 10)) t.lag.vekter = { basis: lv[0], hoy: lv[1], topp: lv[2] };
  if (q.has('lister')) { const l = (q.get('lister') ?? '').split(','); t.lag.abdc = l.includes('abdc'); t.lag.ft = l.includes('ft'); t.lag.ajg = l.includes('ajg'); }
  const sk = (q.get('skoler') ?? '').split(',').filter((id) => d.skoler.some((s) => s.id === id)); if (sk.length) t.valgt = sk.slice(0, 3);
  const pr = q.get('profil'); if (pr && d.skoler.some((s) => s.id === pr)) t.profil = pr;
  const mo = q.get('mot'); if (mo && d.skoler.some((s) => s.id === mo)) t.mot = mo;
  return t;
}
function skrivTilstand(t: Tilstand, std: Tilstand) {
  const q = new URLSearchParams(window.location.search);
  PARAM.forEach((p) => q.delete(p));
  q.set('rangering', '');
  if (t.fane !== std.fane) q.set('fane', t.fane);
  if (t.forsk !== std.forsk) q.set('forsk', String(t.forsk));
  const endret = Object.entries(t.vekt).filter(([id, v]) => std.vekt[id] !== v).map(([id, v]) => `${id}:${v}`);
  if (endret.length) q.set('vekt', endret.join(','));
  if (t.medRef) q.set('ref', '1');
  if (t.lag.fra !== std.lag.fra || t.lag.til !== std.lag.til) q.set('periode', `${t.lag.fra}-${t.lag.til}`);
  if (!t.lag.brok) q.set('telling', 'hel');
  if (t.lag.nevner === 'utenStip') q.set('nevner', 'utenstip');
  if (!t.lag.kunNvi) q.set('grunnlag', 'alle');
  const lv = t.lag.vekter, sv = std.lag.vekter;
  if (lv.basis !== sv.basis || lv.hoy !== sv.hoy || lv.topp !== sv.topp) q.set('lagvekt', `${lv.basis}-${lv.hoy}-${lv.topp}`);
  if (!t.lag.abdc || !t.lag.ft || !t.lag.ajg) q.set('lister', [t.lag.abdc && 'abdc', t.lag.ft && 'ft', t.lag.ajg && 'ajg'].filter(Boolean).join(','));
  if (t.fane === 'sammenlign' || t.valgt.join(',') !== std.valgt.join(',')) q.set('skoler', t.valgt.join(','));
  if (t.fane === 'profil') { q.set('profil', t.profil); if (t.mot) q.set('mot', t.mot); }
  const s = q.toString().replace(/%2C/gi, ',').replace(/%3A/gi, ':').replace(/^rangering=(&|$)/, 'rangering$1').replace(/&rangering=(&|$)/, '&rangering$1');
  window.history.replaceState(window.history.state, '', `${window.location.pathname}?${s}${window.location.hash}`);
}
function fjernTilstand() {
  const q = new URLSearchParams(window.location.search);
  if (!q.has('rangering')) return;
  PARAM.forEach((p) => q.delete(p));
  const s = q.toString();
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${s ? `?${s}` : ''}${window.location.hash}`);
}

// ── Komponent ────────────────────────────────────────────────────────────────
export function Handelshoyskolerangering() {
  const [data, setData] = useState<Data | null>(null);
  const [pw, setPw] = useState('');
  const [feil, setFeil] = useState<string | null>(null);
  const [laster, setLaster] = useState(false);
  const lasOpp = async (p: string, lagre: boolean) => {
    setLaster(true); setFeil(null);
    try {
      setData(await dekrypter(p));
      if (lagre) try { sessionStorage.setItem(PW_KEY, p); } catch { /* privat modus */ }
    } catch (e) {
      setFeil(e instanceof Error && e.message === 'Fant ikke datafilen' ? 'Fant ikke datafilen.' : 'Feil passord.');
    } finally { setLaster(false); }
  };
  useEffect(() => { try { const p = sessionStorage.getItem(PW_KEY); if (p) void lasOpp(p, false); } catch { /* */ } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) {
    return (
      <div className="rounded-2xl p-8 max-w-lg mx-auto text-center" style={kort}>
        <Lock className="w-8 h-8 mx-auto mb-3" style={{ color: GRONN }} />
        <div style={{ fontFamily: "'Lora', serif", fontSize: 20, color: GRONN }}>Rangering av handelshøyskolene (utkast)</div>
        <p className="text-sm mt-2 mb-4" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Utforskende arbeid fra studierådgiverne ved Handelshøyskolen. Metoden er ikke ferdig, og tidsskriftnivåene er lisensbelagt, så siden er låst.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); void lasOpp(pw, true); }} className="flex gap-2 justify-center">
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Passord" autoFocus
            className="px-3 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--nmbu-neutral-3)', minWidth: 220 }} />
          <button type="submit" disabled={laster || !pw} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: GRONN, color: '#fff', opacity: laster || !pw ? 0.6 : 1 }}>
            {laster ? 'Åpner …' : 'Åpne'}
          </button>
        </form>
        {feil && <div className="text-sm mt-3" style={{ color: '#b91c1c' }}>{feil}</div>}
      </div>
    );
  }
  return <Rangering data={data} />;
}

function Rangering({ data }: { data: Data }) {
  const y1 = sisteDbhAar(data);
  const harAjg = data.lister.ajg;
  const std = useMemo<Tilstand>(() => {
    const lag = lagStandard(y1);
    const ind0 = lagIndikatorer(data, lag);
    const hh = data.skoler.find((s) => s.isNmbu)?.id ?? data.skoler[0].id;
    return { fane: 'forside', forsk: FORSK_STANDARD, vekt: Object.fromEntries(ind0.map((i) => [i.id, i.vekt])), medRef: false, lag,
      valgt: [hh, ...['nhh', 'bi'].filter((id) => id !== hh && data.skoler.some((s) => s.id === id))].slice(0, 3), profil: hh, mot: null };
  }, [data, y1]);
  const [t, setT] = useState<Tilstand>(() => lesTilstand(data, lagIndikatorer(data, std.lag), std));
  const sett = (p: Partial<Tilstand>) => setT((x) => ({ ...x, ...p }));
  useEffect(() => { skrivTilstand(t, std); }, [t, std]);
  useEffect(() => () => fjernTilstand(), []);
  const [kopiert, setKopiert] = useState(false);
  const kopier = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setKopiert(true); setTimeout(() => setKopiert(false), 2000); } catch { /* utilgjengelig */ }
  };

  const ind = useMemo(() => lagIndikatorer(data, t.lag), [data, t.lag]);
  const skoler = useMemo(() => data.skoler.filter((s) => t.medRef || !s.referanse), [data, t.medRef]);
  const rader = useMemo(() => beregn(skoler, ind, t.vekt, t.forsk), [skoler, ind, t.vekt, t.forsk]);
  const eff = useMemo(() => effektiveVekter(ind, t.vekt, t.forsk), [ind, t.vekt, t.forsk]);

  const faner: { id: Fane; label: string; icon: ReactNode }[] = [
    { id: 'forside', label: 'Forside', icon: <Newspaper className="w-4 h-4" /> },
    { id: 'rangering', label: 'Rangering og vekter', icon: <Trophy className="w-4 h-4" /> },
    { id: 'sammenlign', label: 'Sammenlign', icon: <Columns3 className="w-4 h-4" /> },
    { id: 'lab', label: 'Forskningslab', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'publisering', label: 'Publisering', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'rapport', label: 'Slik rapporterer skolene', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'profil', label: 'Skoleportrett', icon: <Building2 className="w-4 h-4" /> },
    { id: 'kontroll', label: 'Kvalitetssikring', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'metode', label: 'Metode og kilder', icon: <FileText className="w-4 h-4" /> },
  ];
  return (
    <div>
      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3 mb-5" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>Utkast {data.generert}. Rangeringen er et forslag til metode, ikke et ferdig resultat. Vektene kan endres fritt, og lenken husker valgene.
          {!harAjg && <> AJG 2024 (ABS-lista) er ikke lagt inn. I stedet brukes et kalibrert AJG-anslag fra åpne lister (ABDC, FT50/UTD24, JUFO og OpenAlex-sitering), testet mot NHH-rapportens AJG-tall; se Metode og kilder.</>}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {faner.map((f) => (
          <button key={f.id} onClick={() => sett({ fane: f.id })} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
            style={t.fane === f.id ? { backgroundColor: GRONN, color: '#fff' } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' }}>
            {f.icon}{f.label}
          </button>
        ))}
        <button onClick={kopier} className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs" title="Lenken husker fane, vekter, forskningsinnstillinger og valgte skoler. Mottakeren må ha passordet."
          style={{ border: '1px solid var(--nmbu-neutral-3)', color: GRONN, fontWeight: 600, backgroundColor: '#fff' }}>
          {kopiert ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}{kopiert ? 'Lenke kopiert' : 'Kopier lenke'}
        </button>
      </div>
      {t.fane === 'forside' && <Forside data={data} rader={rader} ind={ind} eff={eff} t={t} sett={sett} apne={(id) => sett({ fane: 'profil', profil: id })} />}
      {t.fane === 'rangering' && <Samlet ind={ind} rader={rader} eff={eff} t={t} sett={sett} std={std}
        apneProfil={(id) => sett({ profil: id, fane: 'profil' })}
        sammenlign={(id) => sett({ fane: 'sammenlign', valgt: t.valgt.includes(id) ? t.valgt : [...t.valgt, id].slice(-3) })} />}
      {t.fane === 'sammenlign' && <Sammenlign data={data} ind={ind} rader={rader} eff={eff} t={t} sett={sett} />}
      {t.fane === 'lab' && <Forskningslab data={data} skoler={skoler} lag={t.lag} std={std.lag} setLag={(lag) => sett({ lag })} />}
      {t.fane === 'publisering' && <Publisering data={data} />}
      {t.fane === 'rapport' && <SlikRapporterer data={data} lag={t.lag} />}
      {t.fane === 'profil' && <Skoleportrett data={data} rader={rader} ind={ind} eff={eff} id={t.profil} setId={(id) => sett({ profil: id, mot: t.mot === id ? null : t.mot })} mot={t.mot} setMot={(id) => sett({ mot: id })} />}
      {t.fane === 'kontroll' && <KontrollFane data={data} />}
      {t.fane === 'metode' && <Metode data={data} ind={ind} />}
    </div>
  );
}

// ── Små byggesteiner ─────────────────────────────────────────────────────────
const GRUPPE_FARGE: Record<Gruppe, { bg: string; fg: string }> = {
  Topp: { bg: 'var(--nmbu-green-dark)', fg: '#fff' },
  Midt: { bg: 'var(--nmbu-green-4)', fg: 'var(--nmbu-green-dark)' },
  Nedre: { bg: 'var(--nmbu-beige-light)', fg: 'var(--nmbu-neutral-1)' },
};
function GruppeMerke({ r }: { r: Rad }) {
  if (!r.gruppe) return null;
  const f = GRUPPE_FARGE[r.gruppe];
  return <span className="px-1.5 py-0.5 rounded text-[10px]" title={r.grense ? 'Grensetilfelle: gruppen endres innenfor vektområdet 50–85 %' : 'Samme gruppe i hele vektområdet 50–85 %'}
    style={{ backgroundColor: f.bg, color: f.fg, fontWeight: 600, border: r.grense ? '1px dashed var(--nmbu-neutral-2)' : '1px solid transparent' }}>{r.gruppe}{r.grense ? ' ~' : ''}</span>;
}
/** Plassintervallet over vektområdet som en liten skala 1…n med markør for nåværende plass. */
function Intervall({ r, n }: { r: Rad; n: number }) {
  if (r.min == null || r.max == null || r.plass == null || n < 2) return null;
  const x = (p: number) => 100 * (p - 1) / (n - 1);
  return (
    <div className="relative mt-1" style={{ height: 8, width: 72 }} title={`Plass ${r.min}–${r.max} når forskningen teller 50–85 %`}>
      <div className="absolute rounded" style={{ top: 3.5, height: 1, left: 0, right: 0, backgroundColor: 'var(--nmbu-neutral-3)' }} />
      <div className="absolute rounded" style={{ top: 2, height: 4, left: `${x(r.min)}%`, width: `${Math.max(3, x(r.max) - x(r.min))}%`, backgroundColor: 'var(--nmbu-green-3, #46B4A0)' }} />
      <div className="absolute rounded-full" style={{ top: 0.5, width: 7, height: 7, left: `calc(${x(r.plass)}% - 3.5px)`, backgroundColor: GRONN, border: '1.5px solid #fff' }} />
    </div>
  );
}
const knappStil = (on: boolean) => on ? { backgroundColor: GRONN, color: '#fff' } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' };

// ── Fane 1: sammensatt rangering ─────────────────────────────────────────────
interface SamletProps { ind: Ind[]; rader: Rad[]; eff: ReturnType<typeof effektiveVekter>; t: Tilstand; sett: (p: Partial<Tilstand>) => void; std: Tilstand; apneProfil: (id: string) => void; sammenlign: (id: string) => void; }
function Samlet({ ind, rader, eff, t, sett, std, apneProfil, sammenlign }: SamletProps) {
  const n = rader.filter((r) => r.plass != null).length;
  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <div className="rounded-2xl p-5" style={kort}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div style={{ fontSize: 14, fontWeight: 600, color: GRONN }}>Vekter</div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
            <label className="flex items-center gap-1"><input type="checkbox" checked={t.medRef} onChange={(e) => sett({ medRef: e.target.checked })} /> Ta med referanseenheter</label>
            <button onClick={() => sett({ vekt: { ...std.vekt }, forsk: std.forsk })} className="flex items-center gap-1" style={{ color: GRONN, fontWeight: 600 }}><RotateCcw className="w-3 h-3" /> Standardvekter</button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Forskningens andel (%):</span>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
            {FORSK_TRINN.map((f, k) => (
              <button key={f} onClick={() => sett({ forsk: f })} className="px-2.5 py-1 text-xs"
                style={{ backgroundColor: t.forsk === f ? GRONN : '#fff', color: t.forsk === f ? '#fff' : 'var(--nmbu-neutral-1)', fontWeight: t.forsk === f ? 700 : 400, fontFamily: 'var(--font-mono, monospace)', borderRight: k < FORSK_TRINN.length - 1 ? '1px solid var(--nmbu-neutral-3)' : 'none' }}>{f}</button>
            ))}
          </div>
          <span className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
            Resten: {DIMS.filter((d) => d !== 'Forskning').map((d) => `${d} ${nf(eff.andel[d], 0)} %`).join(' · ')}
          </span>
        </div>
        <div className="grid gap-x-10 gap-y-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {DIMS.map((d) => (
            <div key={d}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--nmbu-neutral-2)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '6px 0 4px' }}>
                {d} · {nf(eff.andel[d], 0)} %
              </div>
              {ind.filter((i) => i.dim === d).map((i) => (
                <label key={i.id} className="flex items-center gap-2 text-xs py-0.5" title={i.desc} style={{ color: 'var(--nmbu-neutral-1)' }}>
                  <span style={{ width: 150, flexShrink: 0 }}>{i.label}</span>
                  <input type="range" min={0} max={40} value={t.vekt[i.id] ?? 0} onChange={(e) => sett({ vekt: { ...t.vekt, [i.id]: Number(e.target.value) } })} style={{ flex: 1, accentColor: 'var(--nmbu-green-dark)' }} />
                  <span style={{ width: 52, flexShrink: 0, whiteSpace: 'nowrap', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }} title="Effektiv vekt i poengsummen">{nf(eff.ut[i.id], 1)} %</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-5 overflow-x-auto" style={kort}>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse', minWidth: 980 }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
              <th className="px-2 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }} title="Plass med valgte vekter, og spennet når forskningen teller 50–85 %">Plass</th>
              <th className="px-2 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Handelshøyskole</th>
              <th className="px-2 py-2 text-right" style={{ color: GRONN, fontWeight: 700 }}>Poeng</th>
              {ind.map((i) => <th key={i.id} className="px-2 py-2 text-right" title={i.desc} style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600, fontSize: 11, maxWidth: 90, opacity: eff.ut[i.id] ? 1 : 0.45 }}>{i.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rader.map((r, k) => {
              const nyGruppe = k > 0 && r.gruppe !== rader[k - 1].gruppe;
              return (
                <tr key={r.s.id} style={{ borderTop: nyGruppe ? '2px solid var(--nmbu-neutral-3)' : undefined, borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: r.s.isNmbu ? 'var(--nmbu-green-4)' : 'transparent' }}>
                  <td className="px-2 py-2" style={{ verticalAlign: 'top' }}>
                    <div className="flex items-baseline gap-1.5">
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: 'var(--nmbu-neutral-1)' }}>{r.plass ?? '–'}</span>
                      {r.min != null && r.max != null && <span style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', fontFamily: 'var(--font-mono, monospace)' }}>{r.min === r.max ? 'fast' : `${r.min}–${r.max}`}</span>}
                    </div>
                    <Intervall r={r} n={n} />
                  </td>
                  <td className="px-2 py-2" style={{ verticalAlign: 'top' }}>
                    <div className="flex items-center gap-2">
                      <button onClick={() => apneProfil(r.s.id)} className="text-left hover:underline" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: r.s.isNmbu ? 700 : 500 }}>{r.s.kort}</button>
                      <GruppeMerke r={r} />
                      <button onClick={() => sammenlign(r.s.id)} title="Sammenlign" className="opacity-60 hover:opacity-100"><Columns3 className="w-3.5 h-3.5" style={{ color: GRONN }} /></button>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{r.s.navn}{r.s.referanse ? ' · referanse' : ''}{r.mangler ? ` · mangler ${r.mangler} mål` : ''}</div>
                  </td>
                  <td className="px-2 py-2 text-right" style={{ fontWeight: 700, color: GRONN, fontFamily: 'var(--font-mono, monospace)', verticalAlign: 'top' }}>{nf(r.score, 0)}</td>
                  {ind.map((i) => {
                    const c = r.delt[i.id];
                    return (
                      <td key={i.id} className="px-2 py-2 text-right" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12, opacity: eff.ut[i.id] ? 1 : 0.45, verticalAlign: 'top' }} title={c.n == null ? 'Mangler' : `Normalisert: ${nf(c.n, 0)} av 100 · nr. ${c.plass} på dette målet`}>
                        <div style={{ color: 'var(--nmbu-neutral-1)' }}>{i.fmt(c.v)}</div>
                        {c.n != null && <div className="ml-auto mt-0.5 rounded" style={{ height: 3, width: `${Math.max(4, c.n * 0.6)}%`, minWidth: 2, backgroundColor: 'var(--nmbu-green-3, #46B4A0)' }} />}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-xs mt-3" style={{ color: 'var(--nmbu-neutral-2)' }}>
          <b>Plass og intervall:</b> tallet er plassen med valgte vekter; spennet og streken viser laveste og høyeste plass når forskningens andel varieres fra 50 til 85 % (de relative vektene innen hver dimensjon holdes fast). «Fast» betyr samme plass i hele området.
          {' '}<b>Grupper:</b> Topp, Midt og Nedre er tredjedeler av lista med valgte vekter, slik CHE-rangeringen grupperer i stedet for å legge vekt på små forskjeller i plass. ~ og stiplet ramme betyr at skolen bytter gruppe innenfor vektområdet.
          {' '}<b>Poeng:</b> hvert mål skaleres til 0–100 (laveste til høyeste blant skolene som vises), og poengsummen er det vektede snittet. Mangler en skole et mål, fordeles vekten på de andre målene for den skolen.
        </p>
      </div>
    </div>
  );
}

// ── Fane 2: sammenlign to eller tre skoler ───────────────────────────────────
const SML_FARGE = ['#025C4F', '#2F6FB0', '#C2671E'];
function Sammenlign({ data, ind, rader, eff, t, sett }: { data: Data; ind: Ind[]; rader: Rad[]; eff: ReturnType<typeof effektiveVekter>; t: Tilstand; sett: (p: Partial<Tilstand>) => void }) {
  const y1 = sisteDbhAar(data);
  const valgt = t.valgt.map((id) => rader.find((r) => r.s.id === id) ?? null).filter((r): r is Rad => !!r);
  const n = rader.filter((r) => r.plass != null).length;
  const veksle = (id: string) => sett({ valgt: t.valgt.includes(id) ? t.valgt.filter((x) => x !== id) : [...t.valgt, id].slice(-3) });
  const aar = aarRekke(data.aar[0], y1);
  const linje = aar.map((y) => ({ aar: y, ...Object.fromEntries(valgt.map((r) => [r.s.id, r.s.dbh[y]?.poengPerUff ?? null])) }));
  const lagR = valgt.map((r) => ({ r, l: lagResultat(r.s, t.lag, data.lister.ajg) }));
  return (
    <div className="grid gap-5">
      <div className="rounded-2xl p-4" style={kort}>
        <div className="text-xs mb-2" style={{ color: 'var(--nmbu-neutral-2)' }}>Velg to eller tre skoler (den eldste valgte faller ut når du velger en fjerde).</div>
        <div className="flex flex-wrap gap-1.5">
          {rader.map((r) => {
            const k = t.valgt.indexOf(r.s.id);
            return <button key={r.s.id} onClick={() => veksle(r.s.id)} className="px-2.5 py-1 rounded-lg text-xs"
              style={k >= 0 ? { backgroundColor: SML_FARGE[k], color: '#fff', border: `1px solid ${SML_FARGE[k]}` } : { backgroundColor: '#fff', color: 'var(--nmbu-neutral-1)', border: '1px solid var(--nmbu-neutral-3)' }}>{r.s.kort}</button>;
          })}
        </div>
      </div>
      {valgt.length < 2 ? <div className="rounded-2xl p-6 text-sm" style={{ ...kort, color: 'var(--nmbu-neutral-2)' }}>Velg minst to skoler.</div> : (
        <>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${valgt.length}, minmax(0, 1fr))` }}>
            {valgt.map((r, k) => (
              <div key={r.s.id} className="rounded-2xl p-5" style={{ ...kort, borderTop: `4px solid ${SML_FARGE[k]}` }}>
                <div className="flex items-center gap-2"><span style={{ fontSize: 18, fontWeight: 700, color: 'var(--nmbu-neutral-1)' }}>{r.s.kort}</span><GruppeMerke r={r} /></div>
                <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{r.s.navn}</div>
                <div className="flex items-end gap-5 mt-3">
                  <div><div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>Plass</div><div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: SML_FARGE[k] }}>{r.plass ?? '–'}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>Poeng</div><div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: 'var(--nmbu-neutral-1)' }}>{nf(r.score, 0)}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>Spenn 50–85 %</div><div style={{ fontSize: 15, fontFamily: 'var(--font-mono, monospace)' }}>{r.min}–{r.max}</div><Intervall r={r} n={n} /></div>
                </div>
                <div className="text-xs mt-3" style={{ color: 'var(--nmbu-neutral-2)' }}>{akkNavn(r.s).join(' · ') || 'Ingen internasjonal akkreditering'}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5 overflow-x-auto" style={kort}>
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                  <th className="px-2 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Mål</th>
                  <th className="px-2 py-2 text-right" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600, fontSize: 11 }}>Vekt</th>
                  {valgt.map((r, k) => <th key={r.s.id} className="px-2 py-2 text-right" style={{ color: SML_FARGE[k], fontWeight: 700 }}>{r.s.kort}</th>)}
                </tr>
              </thead>
              <tbody>
                {DIMS.map((d) => (
                  <Fragment key={d}>
                    <tr><td colSpan={2 + valgt.length} className="px-2 pt-3 pb-1" style={{ fontSize: 11, fontWeight: 700, color: 'var(--nmbu-neutral-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</td></tr>
                    {ind.filter((i) => i.dim === d).map((i) => {
                      const best = Math.max(...valgt.map((r) => r.delt[i.id].n ?? -1));
                      return (
                        <tr key={i.id} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', opacity: eff.ut[i.id] ? 1 : 0.5 }}>
                          <td className="px-2 py-1.5" title={i.desc} style={{ color: 'var(--nmbu-neutral-1)' }}>{i.label}</td>
                          <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{nf(eff.ut[i.id], 1)} %</td>
                          {valgt.map((r, k) => {
                            const c = r.delt[i.id];
                            const er = c.n != null && c.n === best && valgt.length > 1;
                            return (
                              <td key={r.s.id} className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>
                                <div style={{ fontWeight: er ? 700 : 400, color: er ? SML_FARGE[k] : 'var(--nmbu-neutral-1)' }}>{i.fmt(c.v)}</div>
                                {c.plass != null && <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>nr. {c.plass} av {n}</div>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
            <p className="text-xs mt-2" style={{ color: 'var(--nmbu-neutral-2)' }}>Uthevet = best av de valgte. «nr. x av n» er plassen på målet blant alle skolene i rangeringen.</p>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
            <div className="rounded-2xl p-5" style={kort}>
              <div style={{ fontSize: 14, fontWeight: 600, color: GRONN, marginBottom: 8 }}>Poeng per faglig årsverk, {data.aar[0]}–{y1}</div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={linje} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-beige-light)" vertical={false} />
                  <XAxis dataKey="aar" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => nf(v, 1)} />
                  <Tooltip formatter={(v: number, k: string) => [nf(v, 2), data.skoler.find((s) => s.id === k)?.kort ?? k]} />
                  <Legend formatter={(k: string) => data.skoler.find((s) => s.id === k)?.kort ?? k} wrapperStyle={{ fontSize: 11 }} />
                  {valgt.map((r, k) => <Line key={r.s.id} type="monotone" dataKey={r.s.id} stroke={SML_FARGE[k]} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />)}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl p-5" style={kort}>
              <div style={{ fontSize: 14, fontWeight: 600, color: GRONN, marginBottom: 8 }}>Lagdelt forskning per årsverk, {t.lag.fra}–{t.lag.til}</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={lagR.map(({ r, l }) => ({ navn: r.s.kort, ...Object.fromEntries(TRINN.map((tr) => [tr, l.uff ? l.per[tr] * t.lag.vekter[tr as 'basis'] / l.uff : 0])) }))} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-beige-light)" vertical={false} />
                  <XAxis dataKey="navn" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => nf(v, 1)} />
                  <Tooltip formatter={(v: number, k: string) => [nf(v, 2), TRINN_NAVN[k as Trinn]]} />
                  <Legend formatter={(k: string) => TRINN_NAVN[k as Trinn]} wrapperStyle={{ fontSize: 11 }} />
                  {TRINN.map((tr) => <Bar key={tr} dataKey={tr} stackId="a" fill={TRINN_FARGE[tr as 'basis']} stroke="#fff" strokeWidth={1} />)}
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>Vektede artikler per årsverk, delt på trinn. Innstillingene (periode, telling, vekter, lister) styres i Forskningslab.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Fane 3: forskningslab (Tilburg-lignende sandkasse) ───────────────────────
function Forskningslab({ data, skoler, lag, std, setLag }: { data: Data; skoler: Skole[]; lag: Lag; std: Lag; setLag: (l: Lag) => void }) {
  const harAjg = data.lister.ajg;
  const [sorter, setSorter] = useState<'perArsverk' | 'vektet' | 'artikler' | 'noen'>('perArsverk');
  const rader = skoler.map((s) => ({ s, l: lagResultat(s, lag, harAjg) }))
    .sort((a, b) => sorter === 'noen' ? b.l.dekning.noen - a.l.dekning.noen : ((b.l[sorter] as number | null) ?? -1) - ((a.l[sorter] as number | null) ?? -1));
  const maks = Math.max(...rader.map((r) => r.l.perArsverk ?? 0), 0.01);
  const aarValg = aarRekke(data.aar[0], data.aar[1]).map(Number);
  const sel = { border: '1px solid var(--nmbu-neutral-3)', borderRadius: 8, padding: '3px 6px', fontSize: 12, backgroundColor: '#fff' } as const;
  const th = (id: typeof sorter | null, label: string, title?: string) => (
    <th className="px-2 py-2 text-right" title={title} style={{ color: id === sorter ? GRONN : 'var(--nmbu-neutral-2)', fontWeight: 600, fontSize: 11, cursor: id ? 'pointer' : undefined, whiteSpace: 'nowrap' }} onClick={() => id && setSorter(id)}>{label}{id === sorter ? ' ↓' : ''}</th>
  );
  return (
    <div className="grid gap-5">
      <div className="rounded-2xl p-5" style={kort}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div style={{ fontSize: 14, fontWeight: 600, color: GRONN }}>Forskningslab: bygg forskningsmålet selv</div>
          <button onClick={() => setLag({ ...std, vekter: { ...std.vekter } })} className="flex items-center gap-1 text-xs" style={{ color: GRONN, fontWeight: 600 }}><RotateCcw className="w-3 h-3" /> Standard</button>
        </div>
        <div className="grid gap-x-8 gap-y-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          <div className="text-xs" style={{ color: 'var(--nmbu-neutral-1)' }}>
            <div style={{ fontWeight: 700, color: 'var(--nmbu-neutral-2)', marginBottom: 6 }}>PERIODE</div>
            <div className="flex items-center gap-2">
              <select value={lag.fra} onChange={(e) => setLag({ ...lag, fra: Math.min(Number(e.target.value), lag.til) })} style={sel}>{aarValg.map((y) => <option key={y} value={y}>{y}</option>)}</select>
              <span>–</span>
              <select value={lag.til} onChange={(e) => setLag({ ...lag, til: Math.max(Number(e.target.value), lag.fra) })} style={sel}>{aarValg.map((y) => <option key={y} value={y}>{y}</option>)}</select>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--nmbu-neutral-2)', margin: '12px 0 6px' }}>PER ÅRSVERK, NEVNER</div>
            <div className="flex gap-1">
              <button onClick={() => setLag({ ...lag, nevner: 'uff' })} className="px-3 py-1 rounded-md" style={knappStil(lag.nevner === 'uff')} title="UN1 + stipendiater og postdoktorer (HK-dirs tilstandsrapport, HHs infografikk)">Med stipendiater</button>
              <button onClick={() => setLag({ ...lag, nevner: 'utenStip' })} className="px-3 py-1 rounded-md" style={knappStil(lag.nevner === 'utenStip')} title="UN1 + postdoktorer (NHHs forskningsrapport)">Uten stipendiater</button>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--nmbu-neutral-2)', margin: '12px 0 6px' }}>TELLING</div>
            <div className="flex gap-1">
              <button onClick={() => setLag({ ...lag, brok: true })} className="px-3 py-1 rounded-md" style={knappStil(lag.brok)} title="Hver artikkel teller med enhetens andel av forfatterne (1/n per forfatter)">Brøk (1/n)</button>
              <button onClick={() => setLag({ ...lag, brok: false })} className="px-3 py-1 rounded-md" style={knappStil(!lag.brok)} title="Hver artikkel teller 1 for hver enhet med minst én forfatter">Hel</button>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--nmbu-neutral-2)', margin: '12px 0 6px' }}>ARTIKLER</div>
            <div className="flex gap-1">
              <button onClick={() => setLag({ ...lag, kunNvi: true })} className="px-3 py-1 rounded-md" style={knappStil(lag.kunNvi)} title="Bare artikler rapportert til NVI, det samme grunnlaget som HK-dir og DBH teller (standard)">NVI-rapportert (HK-dir)</button>
              <button onClick={() => setLag({ ...lag, kunNvi: false })} className="px-3 py-1 rounded-md" style={knappStil(!lag.kunNvi)} title="Alle vitenskapelige artikler i NVA, også de som ikke er rapportert til NVI">Alle i NVA</button>
            </div>
          </div>
          <div className="text-xs" style={{ color: 'var(--nmbu-neutral-1)' }}>
            <div style={{ fontWeight: 700, color: 'var(--nmbu-neutral-2)', marginBottom: 6 }}>VEKT PER TRINN</div>
            {(['basis', 'hoy', 'topp'] as const).map((tr) => (
              <label key={tr} className="flex items-center gap-2 py-0.5" title={TRINN_FORKLARING[tr]}>
                <span className="inline-block rounded" style={{ width: 10, height: 10, backgroundColor: TRINN_FARGE[tr] }} />
                <span style={{ width: 44 }}>{TRINN_NAVN[tr]}</span>
                <input type="range" min={0} max={10} step={0.5} value={lag.vekter[tr]} onChange={(e) => setLag({ ...lag, vekter: { ...lag.vekter, [tr]: Number(e.target.value) } })} style={{ flex: 1, accentColor: 'var(--nmbu-green-dark)' }} />
                <span style={{ width: 28, textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>{nf(lag.vekter[tr], lag.vekter[tr] % 1 ? 1 : 0)}</span>
              </label>
            ))}
            <div style={{ color: 'var(--nmbu-neutral-2)', marginTop: 4 }}>Standard 1 : 3 : 5 (som norsk nivå 1 og 2 for artikler, pluss et topptrinn).</div>
          </div>
          <div className="text-xs" style={{ color: 'var(--nmbu-neutral-1)' }}>
            <div style={{ fontWeight: 700, color: 'var(--nmbu-neutral-2)', marginBottom: 6 }}>LISTER SOM KAN LØFTE TRINNET</div>
            <div style={{ color: 'var(--nmbu-neutral-2)', marginBottom: 4 }}>Norsk nivå er alltid grunnlaget.</div>
            {([['abdc', 'ABDC 2025 (C–A*)', true], ['ft', 'FT50 og UTD24', true], ['ajg', harAjg ? 'AJG 2024 (1–4*)' : 'AJG 2024 (venter på tillatelse)', harAjg]] as const).map(([k, label, ok]) => (
              <label key={k} className="flex items-center gap-2 py-0.5" style={{ opacity: ok ? 1 : 0.5 }}>
                <input type="checkbox" disabled={!ok} checked={lag[k] && ok} onChange={(e) => setLag({ ...lag, [k]: e.target.checked })} /> {label}
              </label>
            ))}
          </div>
        </div>
        <div className="text-xs mt-4 rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-2)' }}>
          <b>Høyeste nivå teller:</b> hver artikkel plasseres på det høyeste trinnet den oppnår i ett av systemene: {TRINN.map((tr) => `${TRINN_NAVN[tr]} = ${TRINN_FORKLARING[tr as 'basis']}`).join(' · ')}. Artikkelen telles bare én gang. Innstillingene her brukes også i målet «Lagdelt forskning per årsverk» i rangeringen.
        </div>
      </div>

      <div className="rounded-2xl p-5 overflow-x-auto" style={kort}>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse', minWidth: 980 }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
              <th className="px-2 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Handelshøyskole</th>
              {th('perArsverk', 'Per årsverk', 'Vektede artikler delt på snittet av årsverk i perioden (valgt nevner)')}
              <th className="px-2 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600, fontSize: 11, width: 200 }}>Bidrag per trinn</th>
              {th('vektet', 'Sum vektet')}
              {th('artikler', 'Artikler', 'Antall artikler (hel telling) i perioden')}
              {th(null, lag.brok ? 'Forfatterandeler' : 'Telte', 'Summen av enhetens forfatterandeler (brøk) eller antall artikler (hel)')}
              {TRINN.map((tr) => th(null, TRINN_NAVN[tr], TRINN_FORKLARING[tr as 'basis']))}
              {th(null, 'Årsverk', lag.nevner === 'uff' ? 'Snitt UN1 + UN2 (inkl. stipendiater) i perioden, DBH' : 'Snitt UN1 + postdoktorer (uten stipendiater) i perioden, DBH')}
              {th('noen', 'Dekning', 'Andel artikler i tidsskrift på minst én internasjonal liste (ABDC, FT50/UTD24, AJG)')}
              {th(null, 'ABDC')}
              {th(null, 'FT50/UTD24')}
              {harAjg && th(null, 'AJG')}
              {th(null, 'Løftet', 'Andel artikler der en internasjonal liste ga høyere trinn enn norsk nivå')}
            </tr>
          </thead>
          <tbody>
            {rader.map(({ s, l }) => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: s.isNmbu ? 'var(--nmbu-green-4)' : 'transparent' }}>
                <td className="px-2 py-1.5"><span style={{ fontWeight: s.isNmbu ? 700 : 500 }}>{s.kort}</span>{s.referanse && <span style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}> · ref.</span>}</td>
                <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: GRONN }}>{nf(l.perArsverk, 2)}</td>
                <td className="px-2 py-1.5">
                  <div className="flex rounded overflow-hidden" style={{ height: 10, width: `${100 * (l.perArsverk ?? 0) / maks}%`, minWidth: 2 }}>
                    {TRINN.map((tr) => { const v = l.per[tr] * lag.vekter[tr as 'basis']; return v > 0 ? <div key={tr} title={`${TRINN_NAVN[tr]}: ${nf(v, 1)}`} style={{ flex: v, backgroundColor: TRINN_FARGE[tr as 'basis'], borderRight: '1px solid #fff' }} /> : null; })}
                  </div>
                </td>
                <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)' }}>{nf(l.vektet, 0)}</td>
                <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)' }}>{l.artikler}</td>
                <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)' }}>{nf(lag.brok ? l.andeler : l.artikler, lag.brok ? 1 : 0)}</td>
                {TRINN.map((tr) => <td key={tr} className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{nf(l.per[tr], lag.brok ? 1 : 0)}</td>)}
                <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{nf(l.uff, 0)}</td>
                <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12, fontWeight: 600 }}>{nf(l.dekning.noen, 0)} %</td>
                <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{nf(l.dekning.abdc, 0)} %</td>
                <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{nf(l.dekning.ft, 1)} %</td>
                {harAjg && <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{nf(l.dekning.ajg, 0)} %</td>}
                <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{nf(l.loftet, 0)} %</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs mt-3" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Vitenskapelige artikler (NVA) der minst én forfatter er ved enheten, {lag.fra}–{lag.til}. <b>Dekning</b> viser hvor stor del av artiklene de internasjonale listene i det hele tatt vurderer; lav dekning betyr at skolen publiserer mye utenfor de klassiske økonomi- og ledelsestidsskriftene (f.eks. norske eller tverrfaglige tidsskrift), og at det norske nivået da avgjør. <b>Løftet</b> er andelen artikler der en internasjonal liste ga høyere trinn enn norsk nivå. Klikk på en kolonne med pil for å sortere.
        </p>
      </div>
    </div>
  );
}

// ── Fane 2: publisering ──────────────────────────────────────────────────────
const LINJEFARGER = ['#025C4F', '#2F6FB0', '#C2671E', '#7A4FA0', '#B33A57', '#4C8A2A', '#8A6D1E', '#3A8C9C'];
function Publisering({ data }: { data: Data }) {
  const y1 = sisteDbhAar(data);
  const [valgt, setValgt] = useState<string[]>(() => {
    const hh = data.skoler.find((s) => s.isNmbu)?.id; const pref = ['nhh', 'bi', 'uia', 'uis'];
    return [hh, ...data.skoler.filter((s) => pref.includes(s.id)).map((s) => s.id)].filter((x): x is string => !!x).slice(0, 6);
  });
  const [maal, setMaal] = useState<'poengPerUff' | 'niva2AndelFa' | 'publPoeng'>('poengPerUff');
  const [liste, setListe] = useState<'ajg' | 'abdc'>(data.lister.ajg ? 'ajg' : 'abdc');
  const [periode, setPeriode] = useState<'1' | '5'>('5');
  const aar = aarRekke(data.aar[0], y1);
  const farge = (id: string) => data.skoler.find((s) => s.id === id)?.isNmbu ? '#025C4F' : LINJEFARGER[1 + (data.skoler.findIndex((s) => s.id === id) % (LINJEFARGER.length - 1))];
  const linje = aar.map((y) => ({ aar: y, ...Object.fromEntries(valgt.map((id) => [id, data.skoler.find((s) => s.id === id)?.dbh[y]?.[maal] ?? null])) }));
  const perAar = periode === '1' ? [String(y1)] : aarRekke(y1 - 4, y1);
  const nivaer = liste === 'ajg' ? ['ikke', '1', '2', '3', '4', '4*'] : ['ikke', 'C', 'B', 'A', 'A*'];
  const sekv = liste === 'ajg' ? ['#C9C4BC', '#CFE6DF', '#9FCFC2', '#5FA996', '#2E7D6B', '#014238'] : ['#C9C4BC', '#CFE6DF', '#8CC4B5', '#3F8E7B', '#014238'];
  const fordeling = data.skoler.filter((s) => !s.referanse).map((s) => {
    const t: Record<string, number> = {}; let n = 0;
    for (const y of perAar) { const a = s.artikler[y]; const L = a?.[liste]; if (!L) continue; for (const [k, v] of Object.entries(L)) { t[k] = (t[k] ?? 0) + v; n += v; } }
    return { navn: s.kort, isNmbu: s.isNmbu, n, ...Object.fromEntries(nivaer.map((k) => [k, n ? 100 * (t[k] ?? 0) / n : 0])) };
  }).filter((r) => r.n > 0).sort((a, b) => (b as Record<string, number>)[nivaer[nivaer.length - 1]] + (b as Record<string, number>)[nivaer[nivaer.length - 2]] - ((a as Record<string, number>)[nivaer[nivaer.length - 1]] + (a as Record<string, number>)[nivaer[nivaer.length - 2]]));
  const MAAL = { poengPerUff: 'Poeng per faglig årsverk (UFF)', niva2AndelFa: 'Andel nivå 2, HK-dir (% av forfatterandelene)', publPoeng: 'Publiseringspoeng' } as const;
  return (
    <div className="grid gap-5">
      <AjgKort data={data} />
      <div className="rounded-2xl p-5" style={kort}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div style={{ fontSize: 14, fontWeight: 600, color: GRONN }}>{MAAL[maal]}, {data.aar[0]}–{y1}</div>
          <div className="flex gap-1">
            {(Object.keys(MAAL) as (keyof typeof MAAL)[]).map((m) => (
              <button key={m} onClick={() => setMaal(m)} className="px-3 py-1 rounded-md text-xs" style={maal === m ? { backgroundColor: GRONN, color: '#fff' } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' }}>{MAAL[m].split(' (')[0]}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {data.skoler.map((s) => {
            const on = valgt.includes(s.id);
            return <button key={s.id} onClick={() => setValgt((p) => on ? p.filter((x) => x !== s.id) : [...p, s.id])} className="px-2.5 py-1 rounded-lg text-xs"
              style={{ backgroundColor: on ? farge(s.id) : '#fff', color: on ? '#fff' : 'var(--nmbu-neutral-1)', border: '1px solid ' + (on ? farge(s.id) : 'var(--nmbu-neutral-3)') }}>{s.kort}</button>;
          })}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={linje} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-beige-light)" vertical={false} />
            <XAxis dataKey="aar" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => nf(v, maal === 'poengPerUff' ? 1 : 0)} />
            <Tooltip formatter={(v: number, k: string) => [nf(v, maal === 'poengPerUff' ? 2 : 1), data.skoler.find((s) => s.id === k)?.kort ?? k]} />
            <Legend formatter={(k: string) => data.skoler.find((s) => s.id === k)?.kort ?? k} wrapperStyle={{ fontSize: 11 }} />
            {valgt.map((id) => <Line key={id} type="monotone" dataKey={id} stroke={farge(id)} strokeWidth={data.skoler.find((s) => s.id === id)?.isNmbu ? 3 : 2} dot={{ r: 3 }} connectNulls />)}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl p-5" style={kort}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div style={{ fontSize: 14, fontWeight: 600, color: GRONN }}>Artikler etter {liste === 'ajg' ? 'AJG 2024-nivå' : 'ABDC-nivå'}, {perAar[0]}{perAar.length > 1 ? `–${y1}` : ''}</div>
          <div className="flex gap-1">
            {data.lister.ajg && (['ajg', 'abdc'] as const).map((l) => <button key={l} onClick={() => setListe(l)} className="px-3 py-1 rounded-md text-xs" style={liste === l ? { backgroundColor: GRONN, color: '#fff' } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' }}>{l.toUpperCase()}</button>)}
            {(['1', '5'] as const).map((p) => <button key={p} onClick={() => setPeriode(p)} className="px-3 py-1 rounded-md text-xs" style={periode === p ? { backgroundColor: GRONN, color: '#fff' } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' }}>{p === '1' ? String(y1) : 'Fem år'}</button>)}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={Math.max(240, fordeling.length * 26 + 40)}>
          <BarChart data={fordeling} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }} barCategoryGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-beige-light)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v} %`} />
            <YAxis type="category" dataKey="navn" width={90} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number, k: string) => [nf(v, 0) + ' %', k === 'ikke' ? 'Ikke på lista' : `Nivå ${k}`]} labelFormatter={(l: string) => { const r = fordeling.find((x) => x.navn === l); return `${l} (${r?.n ?? 0} artikler)`; }} />
            <Legend formatter={(k: string) => k === 'ikke' ? 'Ikke på lista' : k} wrapperStyle={{ fontSize: 11 }} />
            {nivaer.map((k, i) => <Bar key={k} dataKey={k} stackId="a" fill={sekv[i]} stroke="#fff" strokeWidth={1} />)}
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Alle vitenskapelige artikler i NVA der minst én forfatter er tilknyttet enheten, koblet på ISSN. Sortert etter andel på de to høyeste nivåene.
        </p>
      </div>
    </div>
  );
}

// ── Fane: slik rapporterer skolene ───────────────────────────────────────────
// Felles grunnlag er HK-dir: DBH 373/374/225 og bare artikler rapportert til NVI (de samme publikasjonene som ligger bak
// HK-dirs tall). Artiklene telles hele, slik skolene gjør i årsrapporter og nyhetssaker. Skolenes egne varianter
// (nevner uten stipendiater, nivå 2 som andel av poeng eller publikasjoner, FT50 2016) vises ved siden av og er merket.
const LISTE_NAVN: Record<string, string> = { F: 'FT50', U: 'UTD24', A: 'ABDC A*', J: 'AJG 4/4*' };
const KOMBO_FARGER = ['#014238', '#2E7D6B', '#5FA996', '#9FCFC2', '#C2671E', '#E3A869', '#7A4FA0', '#B9A3CF'];
const komboNavn = (k: string) => k.split('').filter((c) => c !== '-').map((c) => LISTE_NAVN[c]).join(' + ');
function SlikRapporterer({ data, lag }: { data: Data; lag: Lag }) {
  const y1 = sisteDbhAar(data);
  const harAjg = data.lister.ajg;
  const [aar, setAar] = useState<string>(String(y1));
  const [nevner, setNevner] = useState<'uff' | 'utenStip'>('uff');
  const [per100, setPer100] = useState(false);
  const [ftVer, setFtVer] = useState<'2026' | '2016'>('2026');
  const [medRef, setMedRef] = useState(false);
  const [skoleId, setSkoleId] = useState<string>(() => data.skoler.find((s) => s.isNmbu)?.id ?? data.skoler[0].id);
  const aarListe = aar === 'fem' ? aarRekke(y1 - 4, y1) : [aar];
  const periodeTekst = aar === 'fem' ? `${y1 - 4}–${y1}` : aar;
  const skoler = data.skoler.filter((s) => medRef || !s.referanse);
  const sel = { border: '1px solid var(--nmbu-neutral-3)', borderRadius: 8, padding: '3px 6px', fontSize: 12, backgroundColor: '#fff' } as const;
  const thS = { color: 'var(--nmbu-neutral-2)', fontWeight: 600, fontSize: 11 } as const;
  const hk = { backgroundColor: 'rgba(2,92,79,0.07)' } as const; // markerer HK-dirs definisjon
  const sum = (xs: (number | null | undefined)[]) => { const v = xs.filter((x): x is number => x != null); return v.length ? v.reduce((a, b) => a + b, 0) : null; };

  // ── Tabell 1: DBH/HK-dir ──
  const t1 = skoler.map((s) => {
    const d = aarListe.map((y) => s.dbh[y]);
    const poeng = sum(d.map((x) => x?.publPoeng)), publ = sum(d.map((x) => x?.publikasjoner));
    const arsv = sum(d.map((x) => nevner === 'uff' ? x?.uff : x?.utenStip));
    return { s, poeng, publ, arsvSnitt: arsv != null ? arsv / aarListe.length : null, perArsverk: poeng != null && arsv ? poeng / arsv : null,
      fa: snitt(d.map((x) => x?.niva2AndelFa)), poengAndel: snitt(d.map((x) => x?.niva2Andel)), publAndel: snitt(d.map((x) => x?.niva2AndelPubl)) };
  }).sort((a, b) => (b.perArsverk ?? -1) - (a.perArsverk ?? -1));

  // ── Tabell 2: artikler i listetidsskrift, hel telling, NVI ──
  const t2 = skoler.map((s) => {
    const g = (k: string) => aarListe.reduce((a, y) => a + Number(s.artikler[y]?.rapport?.[k] ?? 0), 0);
    const arsv = sum(aarListe.map((y) => nevner === 'uff' ? s.dbh[y]?.uff : s.dbh[y]?.utenStip));
    const nhh = (niva: '4*' | '4' | '3') => { const xs = aarListe.map((y) => s.ajgNhh?.[y]?.[niva]?.n); return xs.every((x) => x != null) ? xs.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) : null; };
    const ft = ftVer === '2026' ? g('ft50') : g('ft50gml');
    return { s, arsv, nvi: g('nvi'), ft, utd: g('utd24'), ftUtd: g('ftUtd'), aS: g('abdcA*'), a: g('abdcA'),
      j4s: g('ajg4*'), j4: g('ajg4'), j3: g('ajg3'), anT: g('ajgAtopp'), an3: g('ajgA3'), intl: g('intl'),
      nhh4s: nhh('4*'), nhh4: nhh('4'), nhh3: nhh('3') };
  }).sort((a, b) => (b.ftUtd + b.aS) - (a.ftUtd + a.aS));
  const vis = (n: number | null, arsv: number | null) => n == null ? '–' : per100 ? (arsv ? nf(100 * n / arsv, 1) : '–') : nf(n, 0);

  // ── Topp-trinnet: hvilke lister gir det? ──
  const kombo = skoler.map((s) => {
    const k: Record<string, number> = {}; let niva2 = 0, niva1 = 0, ellers = 0;
    for (const y of aarListe) for (const [nk, [n]] of Object.entries(s.artikler[y]?.toppKomb ?? {})) {
      const [fl, niva, v] = nk.split('|'); if (v !== 'v') continue;
      k[fl] = (k[fl] ?? 0) + n;
      if (niva === '2') niva2 += n; else if (niva === '1') niva1 += n; else ellers += n;
    }
    const total = Object.values(k).reduce((a, b) => a + b, 0);
    const nvi = aarListe.reduce((a, y) => a + Number(s.artikler[y]?.rapport?.nvi ?? 0), 0);
    return { s, k, total, niva2, niva1, ellers, nvi };
  }).sort((a, b) => b.total - a.total);
  const alleKombo = Object.entries(kombo.reduce((acc, r) => { for (const [k, v] of Object.entries(r.k)) acc[k] = (acc[k] ?? 0) + v; return acc; }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]);
  const farge = (k: string) => KOMBO_FARGER[alleKombo.findIndex(([x]) => x === k) % KOMBO_FARGER.length];
  const iAlt = { total: kombo.reduce((a, r) => a + r.total, 0), niva2: kombo.reduce((a, r) => a + r.niva2, 0), niva1: kombo.reduce((a, r) => a + r.niva1, 0) };
  const perListe = (['F', 'U', 'A', 'J'] as const).map((c) => ({ c, n: alleKombo.filter(([k]) => k.includes(c)).reduce((a, [, v]) => a + v, 0), alene: alleKombo.filter(([k]) => k.replace(/-/g, '') === c).reduce((a, [, v]) => a + v, 0) }));
  const aktiv = (c: string) => (c === 'A' ? lag.abdc : c === 'J' ? lag.ajg && harAjg : lag.ft);

  // ── Tidsskriftene bak Topp for én skole ──
  const valgt = data.skoler.find((s) => s.id === skoleId);
  const tidsskrift = (() => {
    const m = new Map<string, { n: number; ft50: boolean; utd24: boolean; abdc: string | null; ajg: string | null; niva: Set<string> }>();
    for (const t of valgt?.topp ?? []) {
      if (!aarListe.includes(String(t.aar)) || t.nvi === false) continue;
      const key = t.tidsskrift ?? '(ukjent)';
      const x = m.get(key) ?? { n: 0, ft50: t.ft50, utd24: t.utd24, abdc: t.abdc, ajg: t.ajg, niva: new Set<string>() };
      x.n++; x.niva.add(t.niva); m.set(key, x);
    }
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n);
  })();
  const ja = (b: boolean) => b ? <span style={{ color: GRONN, fontWeight: 700 }}>●</span> : <span style={{ color: 'var(--nmbu-neutral-3)' }}>·</span>;

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl p-5" style={kort}>
        <div style={{ fontSize: 14, fontWeight: 600, color: GRONN }}>Slik rapporterer skolene, på HK-dirs felles grunnlag</div>
        <p className="text-xs mt-2" style={{ color: 'var(--nmbu-neutral-1)', maxWidth: '80ch', lineHeight: 1.55 }}>
          Alle tall i denne fanen bygger på det HK-dir publiserer: publiseringspoeng og publikasjoner (DBH 373), nivå 2 (DBH 374) og årsverk (DBH 225).
          Artikkeltellingene bruker bare artikler som er rapportert til NVI, altså de samme publikasjonene som ligger bak HK-dirs tall, og hver artikkel telles hel,
          slik skolene gjør i årsrapporter og nyhetssaker. Der skolene bruker en annen definisjon, vises den ved siden av og er merket med hvem som bruker den.
          Kolonnene med grønn bakgrunn følger HK-dir og er de som brukes i rangeringen.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 text-xs" style={{ color: 'var(--nmbu-neutral-1)' }}>
          <label className="flex items-center gap-2"><span style={{ fontWeight: 700, color: 'var(--nmbu-neutral-2)' }}>ÅR</span>
            <select value={aar} onChange={(e) => setAar(e.target.value)} style={sel}>
              <option value="fem">Fem år, {y1 - 4}–{y1}</option>
              {aarRekke(data.aar[0], y1).reverse().map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <div className="flex items-center gap-1"><span style={{ fontWeight: 700, color: 'var(--nmbu-neutral-2)', marginRight: 4 }}>ÅRSVERK</span>
            <button onClick={() => setNevner('uff')} className="px-3 py-1 rounded-md" style={knappStil(nevner === 'uff')} title="UN1 + stipendiater og postdoktorer (UN2), som HK-dirs tilstandsrapport">HK-dir (med stipendiater)</button>
            <button onClick={() => setNevner('utenStip')} className="px-3 py-1 rounded-md" style={knappStil(nevner === 'utenStip')} title="UN1 + postdoktorer, uten stipendiater, som NHHs forskningsrapport">NHH (uten stipendiater)</button>
          </div>
          <div className="flex items-center gap-1"><span style={{ fontWeight: 700, color: 'var(--nmbu-neutral-2)', marginRight: 4 }}>ARTIKLER</span>
            <button onClick={() => setPer100(false)} className="px-3 py-1 rounded-md" style={knappStil(!per100)}>Antall</button>
            <button onClick={() => setPer100(true)} className="px-3 py-1 rounded-md" style={knappStil(per100)}>Per 100 årsverk</button>
          </div>
          <div className="flex items-center gap-1"><span style={{ fontWeight: 700, color: 'var(--nmbu-neutral-2)', marginRight: 4 }}>FT50</span>
            <button onClick={() => setFtVer('2026')} className="px-3 py-1 rounded-md" style={knappStil(ftVer === '2026')} title="Gjeldende liste, revidert april 2026">2026-lista</button>
            <button onClick={() => setFtVer('2016')} className="px-3 py-1 rounded-md" style={knappStil(ftVer === '2016')} title="Lista fra 2016, som BI og FT-rangeringene har brukt for publikasjoner til og med 2025">2016-lista (BI)</button>
          </div>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={medRef} onChange={(e) => setMedRef(e.target.checked)} /> Vis UiB og UiO (referanse)</label>
        </div>
      </div>

      <div className="rounded-2xl p-5 overflow-x-auto" style={kort}>
        <div style={{ fontSize: 14, fontWeight: 600, color: GRONN }}>Publiseringspoeng og nivå 2, {periodeTekst}</div>
        <p className="text-xs mb-3" style={{ color: 'var(--nmbu-neutral-2)' }}>DBH/HK-dir. {aar === 'fem' ? 'Poeng og publikasjoner er summert, årsverk er snitt, poeng per årsverk er sum poeng delt på sum årsverk, og nivå 2-andelene er snitt av årene.' : ''} Sortert etter poeng per årsverk.</p>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
              <th colSpan={5} />
              <th colSpan={3} className="px-2 pt-2 text-center" style={thS}>Andel nivå 2: samme tall, tre definisjoner</th>
            </tr>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
              <th className="px-2 py-2 text-left" style={thS}>Skole</th>
              <th className="px-2 py-2 text-right" style={thS}>Poeng</th>
              <th className="px-2 py-2 text-right" style={thS}>Publikasjoner</th>
              <th className="px-2 py-2 text-right" style={thS} title={nevner === 'uff' ? 'UN1 + UN2' : 'UN1 + postdoktorer'}>Årsverk ({nevner === 'uff' ? 'HK-dir' : 'NHH'})</th>
              <th className="px-2 py-2 text-right" style={{ ...thS, ...(nevner === 'uff' ? hk : {}) }}>Poeng per årsverk</th>
              <th className="px-2 py-2 text-right" style={{ ...thS, ...hk }} title="Tilstandsrapporten V15.3. Brukes i rangeringen.">Av forfatterandelene<div style={{ fontWeight: 400 }}>HK-dir · brukes</div></th>
              <th className="px-2 py-2 text-right" style={thS} title="NHH Research Report">Av poengene<div style={{ fontWeight: 400 }}>NHH</div></th>
              <th className="px-2 py-2 text-right" style={thS} title="BIs nyhetssaker og årsrapport, UiA, NMBU, Kristiania">Av publikasjonene<div style={{ fontWeight: 400 }}>BI m.fl.</div></th>
            </tr>
          </thead>
          <tbody>
            {t1.map((r) => (
              <tr key={r.s.id} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', fontWeight: r.s.isNmbu ? 600 : 400 }}>
                <td className="px-2 py-1.5">{r.s.kort}{r.s.referanse && <span className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}> (ref.)</span>}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{nf(r.poeng, 1)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{nf(r.publ, 0)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{nf(r.arsvSnitt, 1)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums" style={nevner === 'uff' ? hk : undefined}>{nf(r.perArsverk, 2)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums" style={hk}>{r.fa == null ? '–' : nf(r.fa, 1) + ' %'}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{r.poengAndel == null ? '–' : nf(r.poengAndel, 1) + ' %'}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{r.publAndel == null ? '–' : nf(r.publAndel, 1) + ' %'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs mt-2" style={{ color: 'var(--nmbu-neutral-2)', maxWidth: '90ch' }}>
          Andelen nivå 2 blir høyest målt på poeng, fordi en nivå 2-artikkel gir tre ganger så mange poeng. Eksempel: BI hadde i 2024 omtrent 41 % av forfatterandelene, 44 % av publikasjonene og 68 % av poengene på nivå 2.
          Sammenlign derfor bare tall med samme definisjon. Poeng per årsverk med NHHs nevner blir 20–40 % høyere enn med HK-dirs.
        </p>
      </div>

      <div className="rounded-2xl p-5 overflow-x-auto" style={kort}>
        <div style={{ fontSize: 14, fontWeight: 600, color: GRONN }}>Artikler i listetidsskrift, {periodeTekst}{per100 ? ', per 100 årsverk' : ''}</div>
        <p className="text-xs mb-3" style={{ color: 'var(--nmbu-neutral-2)' }}>NVI-rapporterte artikler, hel telling: én artikkel teller 1 for skolen uansett antall forfattere. En artikkel kan stå på flere lister og telles da i hver kolonne. Sortert etter FT50/UTD24 + ABDC A*.</p>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse', minWidth: 1080 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
              <th colSpan={2} />
              <th colSpan={3} className="px-2 pt-2 text-center" style={thS}>FT og UT Dallas</th>
              <th colSpan={2} className="px-2 pt-2 text-center" style={thS}>ABDC 2025</th>
              <th colSpan={3} className="px-2 pt-2 text-center" style={thS}>{harAjg ? 'AJG 2024 (egen kobling)' : 'AJG 2024'}</th>
              <th colSpan={3} className="px-2 pt-2 text-center" style={thS}>AJG i NHHs forskningsrapport</th>
              <th />
            </tr>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
              <th className="px-2 py-2 text-left" style={thS}>Skole</th>
              <th className="px-2 py-2 text-right" style={thS}>NVI-artikler</th>
              <th className="px-2 py-2 text-right" style={thS}>FT50 {ftVer}</th>
              <th className="px-2 py-2 text-right" style={thS}>UTD24</th>
              <th className="px-2 py-2 text-right" style={thS} title="Artikler på minst én av listene, telt én gang">FT50 ∪ UTD24</th>
              <th className="px-2 py-2 text-right" style={thS}>A*</th>
              <th className="px-2 py-2 text-right" style={thS}>A</th>
              {harAjg ? <>
                <th className="px-2 py-2 text-right" style={thS}>4*</th><th className="px-2 py-2 text-right" style={thS}>4</th><th className="px-2 py-2 text-right" style={thS}>3</th>
              </> : <>
                <th className="px-2 py-2 text-right" style={{ ...thS, fontStyle: 'italic' }} title="Kalibrert anslag fra åpne lister, ikke AJG">≈ 4/4*</th>
                <th className="px-2 py-2 text-right" style={{ ...thS, fontStyle: 'italic' }} title="Kalibrert anslag fra åpne lister, ikke AJG">≈ 3</th>
                <th className="px-2 py-2 text-right" style={thS}></th>
              </>}
              <th className="px-2 py-2 text-right" style={thS}>4*</th><th className="px-2 py-2 text-right" style={thS}>4</th><th className="px-2 py-2 text-right" style={thS}>3</th>
              <th className="px-2 py-2 text-right" style={thS}>Int. sampubl.</th>
            </tr>
          </thead>
          <tbody>
            {t2.map((r) => (
              <tr key={r.s.id} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', fontWeight: r.s.isNmbu ? 600 : 400 }}>
                <td className="px-2 py-1.5">{r.s.kort}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{nf(r.nvi, 0)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{vis(r.ft, r.arsv)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{vis(r.utd, r.arsv)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{vis(r.ftUtd, r.arsv)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{vis(r.aS, r.arsv)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{vis(r.a, r.arsv)}</td>
                {harAjg ? <>
                  <td className="px-2 py-1.5 text-right tabular-nums">{vis(r.j4s, r.arsv)}</td><td className="px-2 py-1.5 text-right tabular-nums">{vis(r.j4, r.arsv)}</td><td className="px-2 py-1.5 text-right tabular-nums">{vis(r.j3, r.arsv)}</td>
                </> : <>
                  <td className="px-2 py-1.5 text-right tabular-nums" style={{ fontStyle: 'italic', color: 'var(--nmbu-neutral-2)' }}>{vis(r.anT, r.arsv)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums" style={{ fontStyle: 'italic', color: 'var(--nmbu-neutral-2)' }}>{vis(r.an3, r.arsv)}</td>
                  <td />
                </>}
                <td className="px-2 py-1.5 text-right tabular-nums">{vis(r.nhh4s, r.arsv)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{vis(r.nhh4, r.arsv)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{vis(r.nhh3, r.arsv)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{r.nvi ? nf(100 * r.intl / r.nvi, 0) + ' %' : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs mt-3 grid gap-1" style={{ color: 'var(--nmbu-neutral-2)', maxWidth: '95ch' }}>
          <p><b>FT50:</b> lista ble revidert i april 2026 (inn: Academy of Management Annals, American Sociological Review, Psychological Science; ut: Human Relations, Journal of Business Ethics, Organization Studies). BI og FT-rangeringene har brukt 2016-lista for publikasjoner til og med 2025. Med den treffer vi BIs egne tall nesten eksakt (2024: 35 mot 34, 2023: 26 mot 26). UTD24 er nesten helt en del av FT50, så de fleste UTD24-artikler telles også i FT50.</p>
          <p><b>AJG:</b> {harAjg ? 'Egen kobling mot AJG 2024 på ISSN.' : <>AJG 2024 er ikke lagt inn. Kolonnene i kursiv er et kalibrert anslag fra åpne lister (FT50/UTD24, eller ABDC A* med OpenAlex-sitering ≥ 5 for ≈ 4/4*), ikke AJG. Det treffer NHH og BI godt, men gir 2–5 ganger for mange for mindre skoler.</>} Tallene fra NHHs forskningsrapport er NHHs egen klassifisering av DBH-registreringer for åtte skoler 2020–2024. De er tomme for andre skoler og år, og spriker også med skolenes egne tall (BI oppgir 17 artikler i 4* i 2020, NHH-rapporten 12).</p>
          <p><b>Per 100 årsverk</b> bruker valgt nevner{aar === 'fem' ? ' summert over årene' : ''}.</p>
        </div>
      </div>

      <div className="rounded-2xl p-5 overflow-x-auto" style={kort}>
        <div style={{ fontSize: 14, fontWeight: 600, color: GRONN }}>Hva ligger i Topp-trinnet? {periodeTekst}</div>
        <p className="text-xs mb-3" style={{ color: 'var(--nmbu-neutral-2)', maxWidth: '95ch' }}>
          I det lagdelte forskningsmålet havner en artikkel på Topp hvis tidsskriftet står på FT50, UTD24, ABDC A* eller AJG 4/4*. Her vises hvilke lister som faktisk gir Topp,
          som eksklusive kombinasjoner, så ingen artikkel telles to ganger. NVI-rapporterte artikler, hel telling, FT50 2026-lista.
          {!harAjg && ' AJG 4/4* er ikke med fordi AJG-lista ikke er lagt inn.'} Lister som er slått av i Forskningslab, gir ikke Topp i rangeringen og er merket «av».
        </p>
        <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {perListe.filter((x) => x.c !== 'J' || harAjg).map((x) => (
            <div key={x.c} className="rounded-lg px-3 py-2 text-xs" style={{ border: '1px solid var(--nmbu-neutral-3)', opacity: aktiv(x.c) ? 1 : 0.55 }}>
              <div style={{ fontWeight: 700, color: GRONN }}>{LISTE_NAVN[x.c]}{!aktiv(x.c) && ' (av)'}</div>
              <div className="tabular-nums" style={{ fontSize: 18, fontWeight: 600 }}>{nf(x.n, 0)}</div>
              <div style={{ color: 'var(--nmbu-neutral-2)' }}>{iAlt.total ? nf(100 * x.n / iAlt.total, 0) : '–'} % av Topp · {nf(x.alene, 0)} bare her</div>
            </div>
          ))}
          <div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
            <div style={{ fontWeight: 700, color: GRONN }}>Topp i alt, alle skoler</div>
            <div className="tabular-nums" style={{ fontSize: 18, fontWeight: 600 }}>{nf(iAlt.total, 0)}</div>
            <div style={{ color: 'var(--nmbu-neutral-2)' }}>{nf(iAlt.niva2, 0)} på nivå 2 · {nf(iAlt.niva1, 0)} på nivå 1</div>
          </div>
        </div>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse', minWidth: 760 + 90 * alleKombo.length }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
              <th className="px-2 py-2 text-left" style={thS}>Skole</th>
              <th className="px-2 py-2 text-right" style={thS}>Topp</th>
              <th className="px-2 py-2 text-left" style={{ ...thS, width: 220 }}>Fordeling</th>
              {alleKombo.map(([k]) => <th key={k} className="px-2 py-2 text-right" style={thS}><span className="inline-block rounded-sm mr-1" style={{ width: 8, height: 8, backgroundColor: farge(k) }} />{komboNavn(k)}</th>)}
              <th className="px-2 py-2 text-right" style={thS} title="Tidsskriftet er også på norsk nivå 2">Herav nivå 2</th>
              <th className="px-2 py-2 text-right" style={thS} title="Norsk nivå 1, men Topp etter en internasjonal liste">Herav nivå 1</th>
              <th className="px-2 py-2 text-right" style={thS}>Andel av NVI-artiklene</th>
            </tr>
          </thead>
          <tbody>
            {kombo.map((r) => (
              <tr key={r.s.id} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', fontWeight: r.s.isNmbu ? 600 : 400 }}>
                <td className="px-2 py-1.5">{r.s.kort}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{nf(r.total, 0)}</td>
                <td className="px-2 py-1.5">
                  <div className="flex rounded overflow-hidden" style={{ height: 10, backgroundColor: 'var(--nmbu-beige-light)' }} title={alleKombo.map(([k]) => `${komboNavn(k)}: ${r.k[k] ?? 0}`).join('\n')}>
                    {r.total > 0 && alleKombo.map(([k]) => r.k[k] ? <div key={k} style={{ width: `${100 * r.k[k] / r.total}%`, backgroundColor: farge(k) }} /> : null)}
                  </div>
                </td>
                {alleKombo.map(([k]) => <td key={k} className="px-2 py-1.5 text-right tabular-nums">{r.k[k] ? nf(r.k[k], 0) : '–'}</td>)}
                <td className="px-2 py-1.5 text-right tabular-nums">{nf(r.niva2, 0)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{nf(r.niva1, 0)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{r.nvi ? nf(100 * r.total / r.nvi, 1) + ' %' : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl p-5 overflow-x-auto" style={kort}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div style={{ fontSize: 14, fontWeight: 600, color: GRONN }}>Tidsskriftene bak Topp: {valgt?.kort}, {periodeTekst}</div>
          <select value={skoleId} onChange={(e) => setSkoleId(e.target.value)} style={sel}>{skoler.map((s) => <option key={s.id} value={s.id}>{s.kort}</option>)}</select>
        </div>
        <p className="text-xs mb-3" style={{ color: 'var(--nmbu-neutral-2)' }}>NVI-rapporterte artikler fra {data.aar[1] - 5} og senere. ● = tidsskriftet står på lista.</p>
        {tidsskrift.length === 0 ? <p className="text-sm" style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen Topp-artikler i perioden.</p> : (
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                <th className="px-2 py-2 text-left" style={thS}>Tidsskrift</th>
                <th className="px-2 py-2 text-right" style={thS}>Artikler</th>
                <th className="px-2 py-2 text-center" style={thS}>FT50</th>
                <th className="px-2 py-2 text-center" style={thS}>UTD24</th>
                <th className="px-2 py-2 text-center" style={thS}>ABDC</th>
                {harAjg && <th className="px-2 py-2 text-center" style={thS}>AJG</th>}
                <th className="px-2 py-2 text-center" style={thS}>Norsk nivå</th>
              </tr>
            </thead>
            <tbody>
              {tidsskrift.map(([navn, x]) => (
                <tr key={navn} style={{ borderBottom: '1px solid var(--nmbu-beige-light)' }}>
                  <td className="px-2 py-1.5">{navn}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{x.n}</td>
                  <td className="px-2 py-1.5 text-center">{ja(x.ft50)}</td>
                  <td className="px-2 py-1.5 text-center">{ja(x.utd24)}</td>
                  <td className="px-2 py-1.5 text-center tabular-nums" style={{ fontWeight: x.abdc === 'A*' ? 700 : 400 }}>{x.abdc ?? '–'}</td>
                  {harAjg && <td className="px-2 py-1.5 text-center tabular-nums">{x.ajg ?? '–'}</td>}
                  <td className="px-2 py-1.5 text-center tabular-nums">{[...x.niva].sort().join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── AJG 2024 (ABS) fra NHHs forskningsrapport ────────────────────────────────
const AJG_FARGE: Record<'3' | '4' | '4*', string> = { '3': '#9FCFC2', '4': '#2E7D6B', '4*': '#014238' };
function AjgKort({ data }: { data: Data }) {
  const meta = data.ajgNhh;
  const [aar, setAar] = useState<'2024' | 'sum'>('sum');
  const [perFte, setPerFte] = useState(true);
  const AAR = ['2020', '2021', '2022', '2023', '2024'];
  const rader = data.skoler.filter((s) => s.ajgNhh).map((s) => {
    const v = (niva: '3' | '4' | '4*') => {
      const ys = aar === 'sum' ? AAR : [aar];
      const xs = ys.map((y) => s.ajgNhh?.[y]?.[niva]).filter(Boolean) as { n: number; perFte: number }[];
      if (!xs.length) return 0;
      return perFte ? xs.reduce((a, x) => a + x.perFte, 0) / xs.length : xs.reduce((a, x) => a + x.n, 0);
    };
    return { navn: s.kort, isNmbu: s.isNmbu, '4*': v('4*'), '4': v('4'), '3': v('3') };
  }).sort((a, b) => (b['4*'] + b['4']) - (a['4*'] + a['4']));
  if (!meta || !rader.length) return null;
  const knapp = (on: boolean) => on ? { backgroundColor: GRONN, color: '#fff' } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' };
  return (
    <div className="rounded-2xl p-5" style={kort}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <div style={{ fontSize: 14, fontWeight: 600, color: GRONN }}>AJG 2024 (ABS): artikler på nivå 3, 4 og 4*{perFte ? ' per årsverk' : ''}, {aar === 'sum' ? '2020–2024' : aar}</div>
        <div className="flex gap-1">
          <button onClick={() => setPerFte(true)} className="px-3 py-1 rounded-md text-xs" style={knapp(perFte)}>Per årsverk</button>
          <button onClick={() => setPerFte(false)} className="px-3 py-1 rounded-md text-xs" style={knapp(!perFte)}>Antall</button>
          <button onClick={() => setAar('sum')} className="px-3 py-1 rounded-md text-xs" style={knapp(aar === 'sum')}>{perFte ? 'Snitt' : 'Sum'} 2020–2024</button>
          <button onClick={() => setAar('2024')} className="px-3 py-1 rounded-md text-xs" style={knapp(aar === '2024')}>2024</button>
        </div>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--nmbu-neutral-2)' }}>Sortert etter nivå 4 og 4*. Åtte skoler som NHH sammenligner seg med; de andre er ikke med i kilden.</p>
      <ResponsiveContainer width="100%" height={rader.length * 30 + 50}>
        <BarChart data={rader} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }} barCategoryGap={5}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-beige-light)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => nf(v, perFte ? 2 : 0)} />
          <YAxis type="category" dataKey="navn" width={90} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: number, k: string) => [nf(v, perFte ? 2 : 0), `AJG ${k}`]} />
          <Legend formatter={(k: string) => `AJG ${k}`} wrapperStyle={{ fontSize: 11 }} />
          {(['4*', '4', '3'] as const).map((k) => <Bar key={k} dataKey={k} stackId="a" fill={AJG_FARGE[k]} stroke="#fff" strokeWidth={1} />)}
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs mt-2" style={{ color: 'var(--nmbu-neutral-2)' }}>
        Kilde: <a href={meta.url} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: GRONN }}>{meta.kilde}</a> (s. {Object.entries(meta.sider).map(([k, s]) => `${s}: ${k}`).join(', ')}). Årsverk = {meta.nevner}. NHHs tabell for nivå 3 har samme antall i 2022 som i 2020 for nesten alle skolene, mens tallene per årsverk er ulike; 2022-antallet for nivå 3 er derfor usikkert. Egen kobling av alle artikler mot AJG kommer når tillatelsen fra Chartered ABS er på plass.
      </p>
    </div>
  );
}

// ── Delindekser (felles for forside og skoleportrett) ────────────────────────
/** Vektet snitt av de normaliserte målene (0–100) i dimensjonen, som i poengsummen. */
function delindeksAv(x: Rad, d: Dim, ind: Ind[], eff: ReturnType<typeof effektiveVekter>): number | null {
  let sum = 0, w = 0;
  for (const i of ind) if (i.dim === d && x.delt[i.id].n != null && eff.ut[i.id] > 0) { sum += (x.delt[i.id].n as number) * eff.ut[i.id]; w += eff.ut[i.id]; }
  return w ? sum / w : null;
}
/** Tredjedel (0 = lav, 1 = middels, 2 = høy) av delindeksen blant skolene som vises. */
function tertilAv(rader: Rad[], d: Dim, x: Rad, ind: Ind[], eff: ReturnType<typeof effektiveVekter>): number | null {
  const v = delindeksAv(x, d, ind, eff); if (v == null) return null;
  const alle = rader.map((z) => delindeksAv(z, d, ind, eff)).filter((z): z is number => z != null);
  const p = 1 + alle.filter((z) => z > v + 1e-9).length;
  return p <= Math.ceil(alle.length / 3) ? 2 : p <= Math.ceil(2 * alle.length / 3) ? 1 : 0;
}

// ── Fane: forside (designretning «forside i portrettstil», 03.10.2026) ────────
// Kurstabell for alle skolene med plass, spenn og gruppe fra modellen, nøkkelmål med prikkestriper, vektvelger og
// profilkart. Samme stil som skoleportrettet (.skp). Hver skole åpner portrettet.
const FORSIDE_MAAL = ['poeng', 'lag', 'siv', 'sb'];
interface ForsideProps { data: Data; rader: Rad[]; ind: Ind[]; eff: ReturnType<typeof effektiveVekter>; t: Tilstand; sett: (p: Partial<Tilstand>) => void; apne: (id: string) => void; }
function Forside({ data, rader, ind, eff, t, sett, apne }: ForsideProps) {
  const n = rader.filter((x) => x.plass != null).length;
  // Plass med standardvekter (75 %), for å vise endring når leseren velger en annen vekt.
  const std = useMemo(() => beregn(rader.map((r) => r.s), ind, t.vekt, FORSK_STANDARD), [rader, ind, t.vekt]);
  const stdPlass = (id: string) => std.find((r) => r.s.id === id)?.plass ?? null;
  // Hvem leder ved 50, 75 og 85 % forskning
  const leder = (f: number) => beregn(rader.map((r) => r.s), ind, t.vekt, f).find((r) => r.plass === 1)?.s.kort ?? '–';
  const ved = { 50: leder(50), 75: leder(FORSK_STANDARD), 85: leder(85) };
  const topp = rader.filter((r) => r.gruppe === 'Topp');
  const sjette = rader.find((r) => r.plass === topp.length + 1);
  const gap = topp.length && sjette && topp[topp.length - 1].score != null && sjette.score != null ? topp[topp.length - 1].score! - sjette.score! : null;
  const maal = FORSIDE_MAAL.map((id) => ind.find((i) => i.id === id)).filter((i): i is Ind => !!i);
  const tf = (x: Rad) => tertilAv(rader, 'Forskning', x, ind, eff), tu = (x: Rad) => tertilAv(rader, 'Utdanning', x, ind, eff);
  const TN = ['Lav', 'Middels', 'Høy'];
  let gruppe: Gruppe | null | undefined;

  return (
    <div className="skp">
      <section className="sheet" aria-label="Oppsummering">
        <div>
          <span className="lab">Rangering av {n} norske handelshøyskoler</span>
          <h1>Handelshøyskolerangeringen</h1>
          <p style={{ maxWidth: '62ch' }}>
            {topp.length} skoler ligger i toppgruppen: {topp.map((r, k) => <Fragment key={r.s.id}>{k ? (k === topp.length - 1 ? ' og ' : ', ') : ''}<b>{r.s.kort}</b> ({nf(r.score, 0)})</Fragment>)}.
            {gap != null && sjette && <> Så følger et hopp på {nf(gap, 0)} poeng ned til {sjette.s.kort}.</>}
            {' '}Hvem som står øverst, avhenger av hvor mye forskning teller: med 50 % forskning er {ved[50]} nr. 1, med 75 % {ved[75]} og med 85 % {ved[85]}.
          </p>
          <button type="button" style={{ alignSelf: 'flex-start', background: 'var(--accent)', color: 'var(--on-accent)', border: 0, padding: '8px 14px', cursor: 'pointer', fontWeight: 500 }} onClick={() => apne(rader[0].s.id)}>Les skoleportrettene →</button>
        </div>
        <div>
          <span className="lab">Slik leses tabellen</span>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div className="cells" aria-hidden="true">{Array.from({ length: 15 }, (_, i) => <i key={i} className={i === 3 ? 'me' : i >= 2 && i <= 5 ? 'in' : ''} />)}</div>
              <p className="cap"><strong style={{ color: 'var(--ink)', fontWeight: 600 }}>Spenn.</strong> Rutene er plassene. Mørk rute er plassen med valgt vekt, lysere ruter er plassene skolen kan få når forskningens andel går fra 50 til 85 %.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div className="strip" aria-hidden="true" style={{ maxWidth: 220 }}>{[6, 18, 31, 44, 52, 79, 97].map((l) => <u key={l} style={{ left: `${l}%` }} />)}<u className="sel" style={{ left: '67%' }} /></div>
              <p className="cap"><strong style={{ color: 'var(--ink)', fontWeight: 600 }}>Nøkkelmål.</strong> Hver prikk er en skole, fra laveste til høyeste verdi. Skolen i raden er i farge.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" aria-label="Rangering">
        <header>
          <span className="lab">Hovedtabell</span>
          <h2>Med {t.forsk} % forskning er {rader.find((r) => r.plass === 1)?.s.kort ?? '–'} nr. 1</h2>
        </header>
        <div className="cmprow fs-vekt" role="group" aria-label="Forskningens andel av poengsummen">
          <span className="lab" style={{ marginRight: 6 }}>Forskningens andel</span>
          {FORSK_TRINN.map((f) => <button key={f} type="button" aria-pressed={t.forsk === f} onClick={() => sett({ forsk: f })} style={t.forsk === f ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 600 } : undefined}>{f}{f === FORSK_STANDARD ? <span className="fs-std"> (standard)</span> : ''}</button>)}
        </div>
        <p className="cap">{t.forsk === FORSK_STANDARD ? 'Standardvekter. Resten av vekten fordeles på utdanning, fagmiljø og akkrediteringer.' : `Pilene viser endring i plass fra standardvekten (${FORSK_STANDARD} %).`} Vektene for hvert mål kan endres i fanen «Rangering og vekter».</p>
        <ol className="fs-kort" aria-label="Rangering, kortvisning">
          {rader.map((r, k) => {
            const ny = k === 0 || r.gruppe !== rader[k - 1].gruppe;
            const sp = stdPlass(r.s.id), d = sp != null && r.plass != null && t.forsk !== FORSK_STANDARD ? sp - r.plass : 0;
            return (
              <Fragment key={r.s.id}>
                {ny && <li className="gh" style={{ ['--gc' as string]: r.gruppe ? GRUPPE_GC[r.gruppe] : 'var(--line)' }}><i />{r.gruppe ? GRUPPE_NAVN[r.gruppe] : 'Uten plass'}</li>}
                <li className="rad">
                  <span className={`pl ${r.plass != null && r.plass <= 3 ? 'top' : ''}`}>{r.plass ?? '–'}</span>
                  <span className="nm">
                    <button type="button" onClick={() => apne(r.s.id)}>{r.s.kort}</button>
                    {d !== 0 && <span style={{ fontSize: '.72rem', marginLeft: 6, color: d > 0 ? 'var(--up)' : 'var(--down)' }}>{d > 0 ? '▲' : '▼'}{Math.abs(d)}</span>}
                    <small>{kortNavn(r.s.navn)}</small>
                  </span>
                  <span className="sc">{nf(r.score, 0)}<small>poeng</small></span>
                  {r.min != null && (
                    <span className="spn">
                      <span className="cells" style={{ ['--n' as string]: n }} aria-label={`Plass ${r.plass}, spenn ${r.min} til ${r.max}`}>{Array.from({ length: n }, (_, i) => i + 1).map((p) => <i key={p} style={{ height: 10 }} className={p === r.plass ? 'me' : p >= (r.min as number) && p <= (r.max as number) ? 'in' : ''} />)}</span>
                      <span className="cap" style={{ fontSize: '.7rem' }}>Spenn {r.min === r.max ? 'fast plass' : `${r.min}–${r.max}`}</span>
                    </span>
                  )}
                  <span className="maal">
                    {maal.map((m) => (
                      <div key={m.id}>
                        <span>{m.label}</span>
                        <b style={{ color: r.delt[m.id].v == null ? 'var(--muted)' : undefined }}>{r.delt[m.id].v == null ? 'ikke oppgitt' : m.fmt(r.delt[m.id].v)}</b>
                        <Prikker verdier={rader.map((x) => ({ id: x.s.id, v: x.delt[m.id].v }))} sel={r.s.id} mot={null} />
                      </div>
                    ))}
                  </span>
                </li>
              </Fragment>
            );
          })}
        </ol>
        <div className="scroll fs-tabell">
          <table>
            <thead><tr><th>Plass og skole</th><th>Poeng</th><th style={{ textAlign: 'left' }}>Spenn 50–85 %</th>{maal.map((m) => <th key={m.id} style={{ textAlign: 'left' }} title={m.desc}>{m.label}</th>)}</tr></thead>
            <tbody>
              {rader.map((r) => {
                const hode = r.gruppe !== gruppe ? (gruppe = r.gruppe, <tr key={`g${r.gruppe}`} className="gh"><td colSpan={3 + maal.length} style={{ textAlign: 'left' }}><span style={{ display: 'inline-block', width: 10, height: 10, background: r.gruppe ? GRUPPE_GC[r.gruppe] : 'var(--line)', marginRight: 7 }} />{r.gruppe ? GRUPPE_NAVN[r.gruppe] : 'Uten plass'}</td></tr>) : null;
                const sp = stdPlass(r.s.id), d = sp != null && r.plass != null && t.forsk !== FORSK_STANDARD ? sp - r.plass : 0;
                return [hode, (
                  <tr key={r.s.id}>
                    <td style={{ minWidth: 200 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                        <span style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem', lineHeight: 1, fontWeight: 500, color: 'var(--accent)', minWidth: '1.4em', textAlign: 'right', ...(r.plass != null && r.plass <= 3 ? { background: 'var(--mark)', color: 'var(--mark-ink)', padding: '0 4px' } : {}) }}>{r.plass ?? '–'}</span>
                        <span>
                          <button type="button" onClick={() => apne(r.s.id)} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontWeight: 600, borderBottom: '1px solid var(--line2)' }}>{r.s.kort}</button>
                          {d !== 0 && <span style={{ fontSize: '.7rem', marginLeft: 5, color: d > 0 ? 'var(--up)' : 'var(--down)' }} title={`${d > 0 ? 'opp' : 'ned'} ${Math.abs(d)} fra standardvekten`}>{d > 0 ? '▲' : '▼'}{Math.abs(d)}</span>}
                          <small style={{ display: 'block', fontSize: '.76rem', color: 'var(--muted)', lineHeight: 1.25 }}>{kortNavn(r.s.navn)}</small>
                        </span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem' }}>{nf(r.score, 0)}</td>
                    <td style={{ width: 140, textAlign: 'left' }}>
                      {r.min != null && <div className="cells" style={{ ['--n' as string]: n }} aria-label={`Plass ${r.plass}, spenn ${r.min} til ${r.max}`}>{Array.from({ length: n }, (_, i) => i + 1).map((p) => <i key={p} style={{ height: 12 }} className={p === r.plass ? 'me' : p >= (r.min as number) && p <= (r.max as number) ? 'in' : ''} />)}</div>}
                    </td>
                    {maal.map((m) => (
                      <td key={m.id} style={{ textAlign: 'left', minWidth: 112 }}>
                        <b style={{ display: 'block', fontWeight: 500, fontSize: '.84rem', lineHeight: 1.2, marginBottom: 2, color: r.delt[m.id].v == null ? 'var(--muted)' : undefined }}>{r.delt[m.id].v == null ? 'ikke oppgitt' : m.fmt(r.delt[m.id].v)}</b>
                        <Prikker verdier={rader.map((x) => ({ id: x.s.id, v: x.delt[m.id].v }))} sel={r.s.id} mot={null} />
                      </td>
                    ))}
                  </tr>
                )];
              })}
            </tbody>
          </table>
        </div>
        <p className="cap">Plass, spenn og grupper (tredjedeler) følger modellen og vektene i fanen «Rangering og vekter». Klikk på en skole for portrettet.</p>
      </section>

      <section className="sec" aria-label="Profilkart">
        <header><span className="lab">Profilkart</span><h2>Forskning mot utdanning</h2></header>
        <div className="two">
          <div>
            <div className="fs-profil" style={{ display: 'grid', gridTemplateColumns: '1.4em 4em repeat(3, minmax(0, 1fr))', gap: 3, maxWidth: 640 }}>
              <div style={{ gridRow: '1 / 4', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center', fontSize: '.72rem', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted)' }}>Utdanning</div>
              {[2, 1, 0].map((rad) => (
                <Fragment key={rad}>
                  <div style={{ fontSize: '.7rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 4 }}>{TN[rad]}</div>
                  {[0, 1, 2].map((kol) => {
                    const liste = rader.filter((x) => tf(x) === kol && tu(x) === rad);
                    const hoy = kol === 2 && rad === 2;
                    return (
                      <div key={kol} className="celle" style={{ minHeight: 84, background: hoy ? 'var(--mark)' : 'var(--flate)', color: hoy ? 'var(--mark-ink)' : undefined, padding: 8, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: '2px 10px', fontSize: '.84rem', textAlign: 'center' }}>
                        {liste.length ? liste.map((x) => <button key={x.s.id} type="button" onClick={() => apne(x.s.id)} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontWeight: 600, color: 'inherit', borderBottom: '1px solid var(--line2)' }}>{x.s.kort}</button>) : <span className="muted">ingen</span>}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
              <div /><div />{TN.map((x) => <div key={x} style={{ fontSize: '.7rem', color: 'var(--muted)', textAlign: 'center', paddingTop: 2 }}>{x}</div>)}
              <div /><div /><div style={{ gridColumn: '3 / 6', textAlign: 'center', fontSize: '.72rem', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted)' }}>Forskning</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p>Skolene er plassert i tredjedeler etter delindeksen for forskning og for utdanning i rangeringen, altså det vektede snittet av målene i hver dimensjon. Øverst til høyre er skolene som er sterke på begge.</p>
            <p className="cap">Plasseringen følger vektene i fanen «Rangering og vekter». Hver skole åpner portrettet.</p>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: 'var(--flate)', padding: '12px 16px' }} aria-label="Metode og kilder">
        <span className="lab">Metode og kilder</span>
        <ul style={{ margin: 0, paddingLeft: '1.1em', display: 'grid', gap: 3, fontSize: '.86rem' }}>
          <li><b>Poeng.</b> {ind.filter((i) => eff.ut[i.id] > 0).length} mål i fire dimensjoner, skalert 0–100 og vektet. Forskning teller {t.forsk} %. Mangler en skole et mål, fordeles vekten på de andre.</li>
          <li><b>Spenn og grupper.</b> Spennet er plassen når forskningens andel varierer fra 50 til 85 %. Topp, Midt og Nedre er tredjedeler av lista med valgte vekter.</li>
          <li><b>Kilder.</b> DBH/HK-dir, NVA koblet mot ABDC, FT50 og UTD24, et kalibrert AJG-anslag, Samordna opptak, lokale opptaksgrenser til siviløkonom og Studiebarometeret. Utkast {data.generert}.</li>
        </ul>
      </section>
    </div>
  );
}

// ── Fane: skoleportrett (designretning «forslag 4», kursark per skole) ───────
// Plass, spenn, gruppe og «nr. x av n» kommer fra rangeringsmodellen (beregn), slik at portrettet alltid følger
// vektene brukeren har valgt. Stil i styles/skoleportrett.css, avgrenset til .skp.
const GRUPPE_GC: Record<Gruppe, string> = { Topp: 'var(--g1)', Midt: 'var(--g2)', Nedre: 'var(--g3)' };
const GRUPPE_NAVN: Record<Gruppe, string> = { Topp: 'Toppgruppen', Midt: 'Midtgruppen', Nedre: 'Nedre gruppe' };
const TERTIL = ['Lav', 'Middels', 'Høy'];
const medianAv = (xs: (number | null | undefined)[]) => { const v = xs.filter((x): x is number => x != null && Number.isFinite(x)).sort((a, b) => a - b); if (!v.length) return null; const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const kortNavn = (n: string) => n.replace(/\s*[–(].*$/, '');

/** Prikkestripe: alle skolers verdi som grå prikker, valgt skole og sammenligning i farge. */
function Prikker({ verdier, sel, mot }: { verdier: { id: string; v: number | null }[]; sel: string; mot: string | null }) {
  const vs = verdier.filter((x): x is { id: string; v: number } => x.v != null && Number.isFinite(x.v));
  if (!vs.length) return null;
  const lo = Math.min(...vs.map((x) => x.v)), hi = Math.max(...vs.map((x) => x.v)), sp = hi - lo || 1;
  const pos = (v: number) => `${((v - lo) / sp * 100).toFixed(1)}%`;
  const rekke = [...vs.filter((x) => x.id !== sel && x.id !== mot), ...vs.filter((x) => x.id === mot), ...vs.filter((x) => x.id === sel)];
  return <div className="strip" aria-hidden="true">{rekke.map((x) => <u key={x.id} className={x.id === sel ? 'sel' : x.id === mot ? 'cmp' : ''} style={{ left: pos(x.v) }} />)}</div>;
}

/** Linjediagram i portrettstil: andre skoler grå, median stiplet, valgt og sammenlignet skole i farge. */
function PortrettGraf({ aar, serier, hoyde = 260, mini = false, label }: { aar: string[]; serier: { id: string; v: (number | null)[]; c: 'o' | 'm' | 's' | 'c'; lab?: string }[]; hoyde?: number; mini?: boolean; label: string }) {
  const W = mini ? 240 : 720, H = mini ? 64 : hoyde, mg = mini ? { l: 4, r: 6, t: 6, b: 4 } : { l: 36, r: 86, t: 10, b: 24 };
  const iw = W - mg.l - mg.r, ih = H - mg.t - mg.b, n = aar.length;
  const alle = serier.flatMap((s) => s.v).filter((v): v is number => v != null);
  const steg = (m: number) => m <= 2.6 ? 0.5 : m <= 6 ? 1 : m <= 30 ? 5 : m <= 60 ? 10 : 20;
  const maks0 = Math.max(0.01, ...alle) * (mini ? 1.12 : 1.04);
  const st = steg(maks0), ymax = mini ? maks0 : Math.ceil(maks0 / st) * st;
  const x = (i: number) => mg.l + (n > 1 ? i * iw / (n - 1) : iw / 2), y = (v: number) => mg.t + ih - v / ymax * ih;
  const sti = (v: (number | null)[]) => { let d = '', pen = false; v.forEach((a, i) => { if (a == null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)} ${y(a).toFixed(1)}`; pen = true; }); return d; };
  const siste = (v: (number | null)[]) => { for (let i = v.length - 1; i >= 0; i--) if (v[i] != null) return i; return -1; };
  const etiketter = mini ? [] : serier.filter((s) => s.lab).map((s) => { const i = siste(s.v); return i < 0 ? null : { y: y(s.v[i] as number), t: s.lab as string, c: s.c }; }).filter((e): e is { y: number; t: string; c: 'o' | 'm' | 's' | 'c' } => !!e).sort((a, b) => a.y - b.y);
  for (let i = 1; i < etiketter.length; i++) if (etiketter[i].y - etiketter[i - 1].y < 13) etiketter[i].y = etiketter[i - 1].y + 13;
  const ticks: number[] = []; if (!mini) for (let t = 0; t <= ymax + 1e-9; t += st) ticks.push(t);
  return (
    <svg className="ch" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {mini ? <line className="gl" x1={0} x2={W} y1={y(0)} y2={y(0)} /> : ticks.map((t) => (
        <g key={t}><line className="gl" x1={mg.l} x2={W - mg.r} y1={y(t)} y2={y(t)} /><text className="ax" x={mg.l - 6} y={y(t) + 4} textAnchor="end">{nf(t, st < 1 ? 1 : 0)}</text></g>
      ))}
      {!mini && aar.map((a, i) => (i % 2 === 0 || i === n - 1) && <text key={a} className="ax" x={x(i)} y={H - 4} textAnchor="middle">{a}</text>)}
      {serier.map((s, k) => {
        const i = siste(s.v);
        return (
          <g key={s.id + k}>
            <path className={`ln ${s.c}`} d={sti(s.v)} />
            {s.c !== 'o' && i >= 0 && !(mini && s.c === 'm') && <circle className={`pt ${s.c}`} cx={x(i)} cy={y(s.v[i] as number)} r={s.c === 's' ? 4 : 3} />}
          </g>
        );
      })}
      {etiketter.map((e) => <text key={e.t} className={`el ${e.c}`} x={W - mg.r + 7} y={e.y + 4}>{e.t}</text>)}
    </svg>
  );
}

interface PortrettProps { data: Data; rader: Rad[]; ind: Ind[]; eff: ReturnType<typeof effektiveVekter>; id: string; setId: (id: string) => void; mot: string | null; setMot: (id: string | null) => void; }
function Skoleportrett({ data, rader, ind, eff, id, setId, mot, setMot }: PortrettProps) {
  const r = rader.find((x) => x.s.id === id) ?? rader[0];
  const s = r.s;
  const c = mot && mot !== s.id ? rader.find((x) => x.s.id === mot) ?? null : null;
  const n = rader.filter((x) => x.plass != null).length;
  const y1 = sisteDbhAar(data);
  const aar = aarRekke(data.aar[0], y1);

  // Delindekser per dimensjon: vektet snitt av de normaliserte målene (0–100) i dimensjonen, som i poengsummen.
  const delindeks = (x: Rad, d: Dim) => delindeksAv(x, d, ind, eff);
  const tertil = (d: Dim, x: Rad) => tertilAv(rader, d, x, ind, eff);
  const tf = tertil('Forskning', r), tu = tertil('Utdanning', r);
  const boks = [2, 1, 0].flatMap((rad) => [0, 1, 2].map((kol) => {
    const antall = rader.filter((x) => tertil('Forskning', x) === kol && tertil('Utdanning', x) === rad).length;
    const meg = tf === kol && tu === rad, cm = c && tertil('Forskning', c) === kol && tertil('Utdanning', c) === rad;
    return <div key={`${rad}${kol}`} className={`${meg ? 'me' : ''} ${cm ? 'cm' : ''}`} title={`${antall} skoler`}>{meg ? s.kort : antall || ''}</div>;
  }));
  const fix = r.min != null && r.min === r.max;
  const spn = r.min == null ? '' : fix ? `Fast plass ${r.plass}, uavhengig av vektene.` : `Plass ${r.min}–${r.max} når forskningens andel går fra 50 til 85 %.`;
  const naboer = rader.filter((x) => x.s.id !== s.id && x.plass != null && r.plass != null && Math.abs(x.plass - r.plass) <= 2);

  // Tidsserier
  const median = (f: (x: Skole) => (number | null)[]) => aar.map((_, i) => medianAv(rader.map((x) => f(x.s)[i])));
  const ppa = (x: Skole) => aar.map((a) => x.dbh[a]?.poengPerUff ?? null);
  const mPpa = median(ppa);
  const own25 = ppa(s)[aar.length - 1], m25 = mPpa[aar.length - 1];
  const sparkDefs: { l: string; u: string; d: number; f: (x: Skole) => (number | null)[] }[] = [
    { l: 'Andel nivå 2 (HK-dir, av forfatterandelene)', u: ' %', d: 1, f: (x) => aar.map((a) => x.dbh[a]?.niva2AndelFa ?? null) },
    { l: 'ABDC A/A*, andel av artikler', u: ' %', d: 0, f: (x) => aar.map((a) => { const t = x.artikler[a]; return t?.n ? 100 * ((t.abdc['A*'] ?? 0) + (t.abdc['A'] ?? 0)) / t.n : null; }) },
    { l: 'FT50/UTD24-artikler per år', u: '', d: 0, f: (x) => aar.map((a) => x.artikler[a] ? artSum(x, [a]).ftUtd : null) },
    { l: 'Internasjonal sampublisering', u: ' %', d: 0, f: (x) => aar.map((a) => x.artikler[a]?.intlAndel ?? null) },
  ];
  const plassPaa = (f: (x: Skole) => number | null, x: Skole) => { const v = f(x); if (v == null) return null; const alle = rader.map((z) => f(z.s)).filter((z): z is number => z != null); return { p: 1 + alle.filter((z) => z > v + 1e-9).length, n: alle.length }; };

  // Utdanning
  const oa = s.utdanning.oa;
  const siv = s.utdanning.siv;
  const sivRader = rader.filter((x) => x.s.utdanning.siv?.grense != null).sort((a, b) => (b.s.utdanning.siv!.grense as number) - (a.s.utdanning.siv!.grense as number));
  const sivX = (v: number) => Math.max(0, Math.min(100, (v - 1) / 4 * 100));
  const utenSiv = rader.filter((x) => x.s.utdanning.siv?.grense == null).map((x) => x.s.kort).join(', ');

  // Akkreditering og rangeringer
  const akk = akkNavn(s);
  const har = (k: string) => akk.some((a) => a.toUpperCase().startsWith(k));
  const antallMed = (k: string) => rader.filter((x) => akkNavn(x.s).some((a) => a.toUpperCase().startsWith(k))).length;
  const andre = akk.filter((a) => !/^(AACSB|EQUIS|AMBA)/i.test(a));
  const rang = (s.rangeringer ?? []).filter((x): x is Record<string, unknown> => typeof x === 'object' && x != null && x.plassering != null);

  let gruppe = '';
  return (
    <div className="skp">
      <section className="sec" aria-label="Velg skole">
        <div className="pickrow">
          <label className="lab" htmlFor="skp-skole">Velg skole</label>
          <select id="skp-skole" value={s.id} onChange={(e) => setId(e.target.value)}>
            {rader.map((x) => <option key={x.s.id} value={x.s.id}>{x.plass ?? '–'}. {x.s.kort} ({kortNavn(x.s.navn)})</option>)}
          </select>
        </div>
        <div className="ladder" role="group" aria-label="Alle skolene i rekkefølge etter sammenlagt plass">
          {rader.map((x) => (
            <button key={x.s.id} type="button" aria-current={x.s.id === s.id} onClick={() => setId(x.s.id)} style={{ ['--gc' as string]: x.gruppe ? GRUPPE_GC[x.gruppe] : 'var(--line)' }}>
              <span>{x.plass ?? '–'}</span><b>{x.s.kort}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="sheet" aria-live="polite">
        <div>
          <div className="grp" style={{ ['--gc' as string]: r.gruppe ? GRUPPE_GC[r.gruppe] : 'var(--line)' }}><i />{r.gruppe ? GRUPPE_NAVN[r.gruppe] : '–'}{r.grense ? ' (grensetilfelle)' : ''}</div>
          <div><h1>{s.navn}</h1>{s.institusjon && <p className="muted" style={{ fontSize: '.88rem' }}>{s.institusjon}</p>}</div>
          <div className="place" role="group" aria-label={`Plass ${r.plass} av ${n}, ${nf(r.score, 0)} poeng`}>
            <span className="lab" style={{ alignSelf: 'center', width: '100%' }}>Sammenlagt plass</span>
            <span className="nr">{r.plass ?? '–'}</span><span className="of">av {n}</span>
            <span className="sc"><b>{nf(r.score, 0)}</b>poeng med valgte vekter</span>
          </div>
          {r.min != null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div className="cells" style={{ ['--n' as string]: n }} aria-hidden="true">
                {Array.from({ length: n }, (_, i) => i + 1).map((p) => <i key={p} className={p === r.plass ? 'me' : p >= (r.min as number) && p <= (r.max as number) ? 'in' : ''} title={`Plass ${p}`} />)}
              </div>
              <p className="cap"><strong style={{ color: 'var(--ink)', fontWeight: 600 }}>Spenn:</strong> {spn}</p>
            </div>
          )}
          <p style={{ maxWidth: '62ch' }}>{kortNavn(s.navn)} er nr. {r.plass} av {n} med {nf(r.score, 0)} poeng. {spn} Skolen er i {r.gruppe ? GRUPPE_NAVN[r.gruppe].toLowerCase() : 'ingen gruppe'}.{r.grense ? ' Gruppen kan endre seg når vektene endres.' : ''}</p>
          {s.enhetNotat && <p className="cap">Om avgrensningen av enheten: {s.enhetNotat}</p>}
          <div className="cmprow">
            <span className="lab">Sammenlign med</span>
            {naboer.map((x) => <button key={x.s.id} type="button" aria-pressed={mot === x.s.id} onClick={() => setMot(mot === x.s.id ? null : x.s.id)}>{x.s.kort} (nr. {x.plass})</button>)}
            {c && <button type="button" className="clr" onClick={() => setMot(null)}>Fjern sammenligning</button>}
          </div>
        </div>
        <div>
          <span className="lab">Profil blant de {n}</span>
          <div className="sb">
            <div className="yl">Utdanning</div>
            <div className="box" role="img" aria-label={`Forskning ${tf == null ? 'ukjent' : TERTIL[tf].toLowerCase()}, utdanning ${tu == null ? 'ukjent' : TERTIL[tu].toLowerCase()}`}>{boks}</div>
            <div className="xl">Forskning</div>
          </div>
          <p className="cap">Tredjedeler av delindeksen i rangeringen (vektet snitt av målene i dimensjonen, 0–100). Tallet i ruten er antall skoler.</p>
          <div className="meters">
            {DIMS.map((d) => {
              const v = delindeks(r, d);
              return (
                <div key={d} className="meter">
                  <span>{d}</span>
                  <Prikker verdier={rader.map((x) => ({ id: x.s.id, v: delindeks(x, d) }))} sel={s.id} mot={c?.s.id ?? null} />
                  <b>{v == null ? '–' : nf(v, 0)}</b>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sec">
        <header>
          <span className="lab">Nøkkeltall</span>
          <h2>{s.kort} er nr. {r.delt[ind[0].id]?.plass ?? '–'} av {n} på {ind[0].label.toLowerCase()}</h2>
          <p className="muted">Hver rad viser hvor skolen ligger blant alle som har tall. Prikkene går fra laveste til høyeste verdi. Vekten er målets andel av poengsummen.</p>
        </header>
        <div className="scroll">
          <table>
            <thead><tr><th>Mål</th><th>Vekt</th><th>{s.kort}</th><th>Plass</th><th>Alle skolene</th>{c && <><th style={{ color: 'var(--cmp)' }}>{c.s.kort}</th><th style={{ color: 'var(--cmp)' }}>Plass</th></>}</tr></thead>
            <tbody>
              {ind.map((i) => {
                const head = i.dim !== gruppe ? (gruppe = i.dim, <tr key={`h${i.dim}`} className="gh"><td colSpan={c ? 7 : 5}>{i.dim}</td></tr>) : null;
                const antall = rader.filter((x) => x.delt[i.id].v != null).length;
                const pl = (x: Rad, cls = '') => x.delt[i.id].plass == null ? <td className={`pl ${cls}`}>–</td> : <td className={`pl ${cls} ${(x.delt[i.id].plass as number) <= 3 ? 'top' : ''}`}><b>nr. {x.delt[i.id].plass}</b> av {antall}</td>;
                return [head, (
                  <tr key={i.id} style={{ opacity: eff.ut[i.id] ? 1 : 0.55 }}>
                    <td title={i.desc}>{i.label}</td>
                    <td className="muted">{nf(eff.ut[i.id], 1)} %</td>
                    <td>{i.fmt(r.delt[i.id].v)}</td>
                    {pl(r)}
                    <td className="fo"><Prikker verdier={rader.map((x) => ({ id: x.s.id, v: x.delt[i.id].v }))} sel={s.id} mot={c?.s.id ?? null} /></td>
                    {c && <><td className="cm">{i.fmt(c.delt[i.id].v)}</td>{pl(c, 'cm')}</>}
                  </tr>
                )];
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sec">
        <header>
          <span className="lab">Poeng per faglig årsverk, {aar[0]}–{y1}</span>
          <h2>{own25 == null ? `Poeng per årsverk mangler for ${s.kort}` : `${s.kort}: ${nf(own25, 2)} poeng per årsverk i ${y1}, ${nf(Math.abs(own25 - (m25 ?? 0)), 2)} ${own25 >= (m25 ?? 0) ? 'over' : 'under'} medianen`}</h2>
        </header>
        <div className="legend"><span><i />{s.kort}</span>{c && <span><i className="c" />{c.s.kort}</span>}<span><i className="m" />Median for skolene med tall</span><span><i className="o" />De andre skolene</span></div>
        <PortrettGraf aar={aar} label={`Poeng per årsverk ${aar[0]} til ${y1} for ${s.kort} mot median`} serier={[
          ...rader.filter((x) => x.s.id !== s.id && x.s.id !== c?.s.id).map((x) => ({ id: x.s.id, v: ppa(x.s), c: 'o' as const })),
          { id: 'median', v: mPpa, c: 'm', lab: 'Median' },
          ...(c ? [{ id: c.s.id, v: ppa(c.s), c: 'c' as const, lab: c.s.kort }] : []),
          { id: s.id, v: ppa(s), c: 's', lab: s.kort },
        ]} />
        <details><summary>Vis som tabell</summary>
          <div className="scroll"><table><thead><tr><th>År</th><th>{s.kort}</th>{c && <th>{c.s.kort}</th>}<th>Median</th></tr></thead>
            <tbody>{aar.map((a, i) => <tr key={a}><td>{a}</td><td>{nf(ppa(s)[i], 2)}</td>{c && <td>{nf(ppa(c.s)[i], 2)}</td>}<td>{nf(mPpa[i], 2)}</td></tr>)}</tbody></table></div>
        </details>
        <p className="cap">Publiseringspoeng delt på årsverk i faglige stillinger pluss stipendiater og postdoktorer (DBH, som HK-dirs tilstandsrapport).</p>
      </section>

      <section className="sec">
        <header>
          <span className="lab">Publiseringsprofil, {aar[0]}–{y1}</span>
          <h2>{s.kort}: {s.artikler[String(y1)] ? (() => { const a = artSum(s, [String(y1)]); return `${a.n} NVI-rapporterte artikler i ${y1}, ${a.abdcA} i ABDC A/A* og ${a.ftUtd} i FT50/UTD24`; })() : 'ingen artikkeltall'}</h2>
          <p className="muted">Heltrukket linje er {s.kort}{c ? `, lilla er ${c.s.kort}` : ''}, stiplet er medianen for skolene som har tall det året.</p>
        </header>
        <div className="sparks">
          {sparkDefs.map((df) => {
            const own = df.f(s), med = median(df.f), sist = own[own.length - 1];
            const pp = plassPaa((x) => df.f(x)[aar.length - 1], s);
            return (
              <div key={df.l} className="spark">
                <span className="lab">{df.l}</span>
                <div className="v"><b>{sist == null ? '–' : nf(sist, df.d) + df.u}</b><span>{pp ? `nr. ${pp.p} av ${pp.n}` : 'ingen tall'} · median {nf(med[med.length - 1], df.d)}{df.u}</span></div>
                <PortrettGraf mini aar={aar} label={`${df.l} for ${s.kort} mot median`} serier={[{ id: 'm', v: med, c: 'm' }, ...(c ? [{ id: 'c', v: df.f(c.s), c: 'c' as const }] : []), { id: 's', v: own, c: 's' }]} />
              </div>
            );
          })}
        </div>
      </section>

      <section className="sec">
        <header>
          <span className="lab">Utdanning: siviløkonom (master) og bachelor i økonomi og administrasjon</span>
          <h2>{s.kort}: {siv?.grense != null ? `inntaksgrense siviløkonom ${nf(siv.grense, 2)}${siv.estimert ? ' (anslått)' : ''}` : 'ingen registrert inntaksgrense til siviløkonom'}, {oa?.fvPerPlass != null ? `${nf(oa.fvPerPlass, 2)} førstevalg per plass på bachelor` : 'førstevalg per plass på bachelor ikke oppgitt'}</h2>
        </header>
        <div className="facts">
          <div><b>{siv?.grense != null ? nf(siv.grense, 2) : '–'}</b><span>inntaksgrense siviløkonom{siv?.aar ? `, ${siv.aar}` : ''}</span></div>
          <div><b>{oa?.poenggrenseMaks != null ? nf(oa.poenggrenseMaks, 1) : '–'}</b><span>poenggrense bachelor, høyeste studiested</span></div>
          <div><b>{oa?.plasser != null ? nf(oa.plasser, 0) : '–'}</b><span>studieplasser bachelor</span></div>
          <div><b>{oa?.forstevalg != null ? nf(oa.forstevalg, 0) : '–'}</b><span>førstevalg</span></div>
          <div><b>{oa ? nf(oa.program, 0) : '–'}</b><span>{oa?.program === 1 ? 'program' : 'programmer'} i utvalget</span></div>
          <div><b>{nf(oa?.studiebarometer, 1)}</b><span>Studiebarometeret, skala 1–5</span></div>
          <div><b>{oa?.normertTid != null ? `${nf(oa.normertTid, 0)} %` : '–'}</b><span>fullført på normert tid{oa?.normertKull ? `, kull ${oa.normertKull}` : ''}</span></div>
        </div>
        <div>
          <p className="lab" style={{ marginBottom: 6 }}>Inntaksgrense til siviløkonom (karaktersnitt fra bachelor, A = 5)</p>
          <div className="rg">
            {sivRader.map((x) => {
              const g = x.s.utdanning.siv!.grense as number;
              return (
                <div key={x.s.id} className={`rgr ${x.s.id === s.id ? 'sel' : x.s.id === c?.s.id ? 'cm' : ''}`}>
                  <span>{x.s.kort}</span>
                  <div className="tr"><i style={{ left: 0, width: `${sivX(g)}%` }} /></div>
                  <span className="rv">{nf(g, 2)}{x.s.utdanning.siv!.estimert ? '*' : ''}</span>
                </div>
              );
            })}
          </div>
          <p className="cap" style={{ marginTop: 4 }}>Siste lokale opptak. * anslått.{utenSiv ? ` Mangler: ${utenSiv}.` : ''}{siv?.merknad ? ` ${s.kort}: ${siv.merknad}` : ''}</p>
        </div>
      </section>

      <section className="sec">
        <header>
          <span className="lab">Akkrediteringer og rangeringer</span>
          <h2>{s.kort}: {akk.length ? `${akk.length} ${akk.length === 1 ? 'akkreditering' : 'akkrediteringer'}` : 'ingen internasjonale akkrediteringer'}</h2>
        </header>
        <div className="akk">
          {['AACSB', 'EQUIS', 'AMBA'].map((k) => <div key={k} className={har(k) ? 'on' : ''}><b>{k}</b><span>{har(k) ? 'Akkreditert' : 'Ikke akkreditert'} · {antallMed(k)} av {n} skoler</span></div>)}
          <div className={andre.length ? 'on' : ''}><b>Annet</b><span>{andre.length ? andre.join(', ') : 'Ingen'}</span></div>
        </div>
        <div className="two">
          <div>
            <p className="lab" style={{ marginBottom: 4 }}>Internasjonale rangeringer</p>
            <div className="rk">
              {rang.length ? rang.map((x, k) => <div key={k}><span>{String(x.rangering ?? '')}, {String(x.aar ?? '')}</span><b>{typeof x.plassering === 'number' ? `nr. ${x.plassering}` : String(x.plassering)}</b></div>) : <div><span className="muted">Ikke oppført i rangeringene vi har registrert.</span></div>}
            </div>
          </div>
          <div>
            <p className="lab" style={{ marginBottom: 4 }}>Sammenlign med</p>
            <div className="cmprow">{rader.filter((x) => x.s.id !== s.id).map((x) => <button key={x.s.id} type="button" aria-pressed={mot === x.s.id} onClick={() => setMot(mot === x.s.id ? null : x.s.id)}>{x.s.kort}</button>)}</div>
            <p className="cap" style={{ marginTop: 8 }}>Skolen du velger, vises i lilla i tabellen, grafene og profilboksen.</p>
          </div>
        </div>
      </section>

      <p className="src">Kilder: DBH/HK-dir (årsverk, publiseringspoeng, nivå 2, gjennomføring), NVA (artikler) koblet mot ABDC, FT50 og UTD24, Samordna opptak, Studiebarometeret og akkrediteringsorganenes lister. Plass, spenn, grupper og vekter følger innstillingene i Rangering og Forskningslab. Utkast {data.generert}.</p>
    </div>
  );
}

// ── Fane 4: kvalitetssikring mot eksterne tall ───────────────────────────────
const MAAL_NAVN: Record<string, string> = {
  publiseringspoeng: 'Publiseringspoeng', poeng_per_faglig: 'Poeng per faglig årsverk', poeng_per_uff: 'Poeng per UFF-årsverk',
  publikasjoner: 'Antall publikasjoner', niva2_andel: 'Andel nivå 2 (%)', ajg_4_andel: 'Andel AJG 4/4* (%)', ft50_antall: 'FT50-artikler', annet: 'Annet',
};
function KontrollFane({ data }: { data: Data }) {
  const k = data.kontroll ?? [];
  const [skole, setSkole] = useState<string>('alle');
  const navn = (id: string) => data.skoler.find((s) => s.id === id)?.kort ?? id;
  const rader = k.filter((r) => skole === 'alle' || r.skole === skole);
  const sml = k.filter((r) => r.avvikProsent != null);
  const innen = (g: number) => sml.filter((r) => Math.abs(r.avvikProsent as number) <= g).length;
  const farge = (a: number | null | undefined) => a == null ? 'var(--nmbu-neutral-2)' : Math.abs(a) <= 2 ? '#1E7B4F' : Math.abs(a) <= 10 ? '#A86B00' : '#B42318';
  const merke = (a: number | null | undefined) => a == null ? 'ikke sammenlignbar' : Math.abs(a) <= 2 ? 'treffer' : Math.abs(a) <= 10 ? 'nær' : 'avvik';
  if (!k.length) return <div className="rounded-2xl p-6 text-sm" style={{ ...kort, color: 'var(--nmbu-neutral-2)' }}>Ingen eksterne kontrolltall er lagt inn ennå (data/rangering/kontroll/eksterne-tall.json).</div>;
  return (
    <div className="grid gap-5">
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {[['Eksterne tall', String(k.length), 'fra årsrapporter, HK-dir m.fl.'], ['Sammenlignbare', String(sml.length), 'samme mål, år og enhet'],
          ['Treffer (±2 %)', String(innen(2)), sml.length ? `${nf(100 * innen(2) / sml.length, 0)} % av de sammenlignbare` : ''],
          ['Avvik over 10 %', String(sml.length - innen(10)), 'se merknad og nevner']].map(([l, v, u]) => (
          <div key={l} className="rounded-2xl p-4" style={kort}>
            <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: GRONN, fontFamily: 'var(--font-mono, monospace)' }}>{v}</div>
            <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{u}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-5 overflow-x-auto" style={kort}>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {['alle', ...Array.from(new Set(k.map((r) => r.skole)))].map((id) => (
            <button key={id} onClick={() => setSkole(id)} className="px-2.5 py-1 rounded-lg text-xs"
              style={skole === id ? { backgroundColor: GRONN, color: '#fff' } : { backgroundColor: '#fff', color: 'var(--nmbu-neutral-1)', border: '1px solid var(--nmbu-neutral-3)' }}>{id === 'alle' ? 'Alle' : navn(id)}</button>
          ))}
        </div>
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse', minWidth: 860 }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
              {['Skole', 'År', 'Mål', 'Eksternt', 'Vårt', 'Avvik', 'Kilde'].map((h, i) => <th key={h} className={`px-2 py-2 ${i >= 3 && i <= 5 ? 'text-right' : 'text-left'}`} style={{ fontWeight: 600 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rader.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', verticalAlign: 'top' }}>
                <td className="px-2 py-1.5"><b>{navn(r.skole)}</b><div style={{ color: 'var(--nmbu-neutral-2)', fontSize: 10 }}>{r.enhetNavn ?? r.enhet}</div></td>
                <td className="px-2 py-1.5">{r.aar ?? '–'}</td>
                <td className="px-2 py-1.5">{MAAL_NAVN[r.maal] ?? r.maal}{r.nevner && <div style={{ color: 'var(--nmbu-neutral-2)', fontSize: 10 }}>Nevner: {r.nevner}</div>}</td>
                <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)' }}>{typeof r.verdi === 'number' ? nf(r.verdi, r.verdi < 10 ? 2 : r.verdi < 100 ? 1 : 0) : r.verdi ?? '–'}</td>
                <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                  {r.vaar != null ? nf(r.vaar, r.vaar < 10 ? 2 : r.vaar < 100 ? 1 : 0) : '–'}
                  {r.vaarAlt != null && <div style={{ color: 'var(--nmbu-neutral-2)', fontSize: 10 }} title="Den andre nevneren: faglige uten / med stipendiater og postdoktorer">alt. {nf(r.vaarAlt, 2)}{r.traff === 'alt' ? ' ✓' : ''}</div>}
                  {r.vaarNivaa && <div style={{ color: 'var(--nmbu-neutral-2)', fontSize: 10 }}>{r.vaarNivaa}</div>}
                </td>
                <td className="px-2 py-1.5 text-right" style={{ color: farge(r.avvikProsent), fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {r.avvikProsent != null ? `${r.avvikProsent > 0 ? '+' : ''}${nf(r.avvikProsent, 1)} %` : '–'}<div style={{ fontSize: 10, fontWeight: 400 }}>{merke(r.avvikProsent)}</div>
                </td>
                <td className="px-2 py-1.5" style={{ maxWidth: 280 }}>
                  {r.url ? <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline" style={{ color: GRONN }}>{r.kilde ?? 'Kilde'}<ExternalLink className="w-3 h-3" /></a> : r.kilde}
                  {r.side != null && <span style={{ color: 'var(--nmbu-neutral-2)' }}> · s. {r.side}</span>}
                  {r.merknad && <div style={{ color: 'var(--nmbu-neutral-2)', fontSize: 10 }}>{r.merknad}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs mt-3" style={{ color: 'var(--nmbu-neutral-2)' }}>
          «Vårt» er regnet fra DBH på samme nivå som kilden (hele institusjonen eller handelshøyskolen), med kildens definisjon: poeng per årsverk inkl. stipendiater = UN1 + UN2 (HK-dir), ekskl. stipendiater = UN1 + postdoktorer (NHH); nivå 2-andel av poeng, forfatterandeler eller publikasjoner etter hva kilden oppgir. Er definisjonen uklar, vises begge variantene, og avviket regnes mot den nærmeste (✓ = den alternative). Foreløpige 2025-tall og institusjonssammenslåinger (INN) gir de største avvikene.
        </p>
      </div>
    </div>
  );
}

// ── Fane 5: metode ───────────────────────────────────────────────────────────
function Metode({ data, ind }: { data: Data; ind: Ind[] }) {
  return (
    <div className="rounded-2xl p-6 text-sm space-y-4" style={{ ...kort, color: 'var(--nmbu-neutral-1)', lineHeight: 1.6 }}>
      <div>
        <div style={{ fontWeight: 600, color: GRONN }}>Hva som rangeres</div>
        Handelshøyskolene og de økonomisk-administrative fakultetene med forskning i Norge. Der handelshøyskolen ikke er en egen enhet i DBH eller NVA, er avgrensningen beskrevet i skoleprofilen. Enheter merket «referanse» (for eksempel samfunnsøkonomiske institutter) er med for sammenligning, men holdes utenfor rangeringen som standard.
      </div>
      <div>
        <div style={{ fontWeight: 600, color: GRONN }}>Mål og standardvekter</div>
        <ul className="list-disc pl-5">
          {ind.map((i) => <li key={i.id}><b>{i.label}</b> ({i.dim}, vekt {i.vekt}): {i.desc}</li>)}
        </ul>
      </div>
      <div>
        <div style={{ fontWeight: 600, color: GRONN }}>Publisering i to systemer</div>
        HK-dir er felles grunnlag: publiseringspoeng, publikasjoner, nivå 2 og årsverk hentes fra DBH og defineres som i HK-dirs tilstandsrapport (poeng per årsverk med UN1 + UN2, nivå 2 som andel av forfatterandelene, V15.3). Artikkelmålene bruker bare artikler som er rapportert til NVI, altså de samme publikasjonene som ligger bak HK-dirs tall. Skolenes egne varianter (NHHs nevner uten stipendiater, nivå 2 som andel av poeng eller publikasjoner, FT50 2016-lista) vises i fanen «Slik rapporterer skolene». Internasjonale nivåer hentes ved å koble hver artikkel i NVA (tidligere Cristin) på ISSN mot tidsskriftlister: AJG 2024 fra Chartered ABS (1–4*, samme som HHs infografikk), ABDC (C–A*), FT50 og UTD24. {data.lister.ajg ? 'AJG-lista er lagt inn.' : 'AJG-lista er lisensbelagt og ikke lagt inn ennå; den legges i data/rangering/tidsskrift/ajg2024.csv (mal: ajg-mal.csv).'}
      </div>
      <div>
        <div style={{ fontWeight: 600, color: GRONN }}>Lagdelt forskningsmål: høyeste nivå teller</div>
        Hver NVI-rapporterte artikkel i NVA plasseres på ett trinn: det høyeste den oppnår i det norske nivåsystemet, ABDC, FT50/UTD24 eller AJG (når lista er lagt inn). Basis = norsk nivå 1, ABDC B/C, AJG 1–2; Høy = norsk nivå 2, ABDC A, AJG 3; Topp = FT50/UTD24, ABDC A*, AJG 4/4*. Artikkelen telles én gang, med enhetens andel av forfatterne (1/n per forfatter) som standard, og vektes 1 : 3 : 5. Summen deles på snittet av årsverk (UN1 + UN2) i perioden. Dekningsgraden viser hvor stor del av artiklene de internasjonale listene vurderer. Hvilke lister som faktisk gir Topp (i praksis nesten bare ABDC A*), vises i «Slik rapporterer skolene». Alt kan endres i Forskningslab, og målet i rangeringen følger innstillingene der.
      </div>
      <div>
        <div style={{ fontWeight: 600, color: GRONN }}>AJG-anslag</div>
        AJG 2024 kan ikke hentes maskinelt (Chartered ABS forbyr skraping, og lista har ingen eksport). Vi bruker derfor et kalibrert anslag fra åpne kilder: en artikkel regnes som «AJG 4/4*-nivå» hvis tidsskriftet står på FT50 eller UTD24, eller har ABDC A* og OpenAlex-sitering (2-års snitt) på minst 5. Regelen er valgt ved å teste mot NHH Research Reports AJG-tall for sju skoler 2020–2024: korrelasjon 0,98 per skole og år, totalt 9 % flere enn fasit, og nesten samme rekkefølge mellom skolene. Anslaget gir flere toppartikler enn NHH-tabellen for UiS, UiT, UiA og NMBU, blant annet innen reiseliv og energi- og miljøøkonomi, dels fordi NHH avgrenser enhetene annerledes. Det sier ingenting om AJG-nivået til enkelttidsskrift.
      </div>
      <div>
        <div style={{ fontWeight: 600, color: GRONN }}>Plassintervall og grupper</div>
        Med 15 skoler er små forskjeller i poeng lite å bygge på. Ved siden av plassen vises derfor spennet i plass når forskningens andel går fra 50 til 85 % (de relative vektene innen hver dimensjon holdes fast), og skolene deles i tredjedeler (Topp, Midt, Nedre), slik CHE-rangeringen gjør. Skoler som bytter gruppe innenfor vektområdet, er merket som grensetilfeller.
      </div>
      <div>
        <div style={{ fontWeight: 600, color: GRONN }}>Kontroll mot HHs infografikk</div>
        Poeng per faglig årsverk regnes som HK-dir gjør i tilstandsrapporten: publiseringspoeng delt på årsverk i faglige stillinger (DBH-kategori UN1) pluss stipendiater og postdoktorer (UN2), uten faglige ledere (UN3) og andre undervisningsstillinger (UN4). Det gir HH 0,95, UiA 1,49 og BI 1,27 i 2024, nøyaktig som i HHs infografikk. NHHs forskningsrapport, som sammenligner åtte handelshøyskoler, bruker UN1 pluss postdoktorer (uten stipendiater); den varianten vises som alternativ. Se fanen Kvalitetssikring.
      </div>
      <div>
        <div style={{ fontWeight: 600, color: GRONN }}>Kjente svakheter</div>
        <ul className="list-disc pl-5">
          <li>Artikkeltellingene i «Slik rapporterer skolene» og målene for FT50/UTD24, ABDC og internasjonal sampublisering teller artiklene hele for hver enhet med minst én forfatter, slik skolene gjør. Det lagdelte målet bruker 1/n som standard. Publiseringspoengene i DBH bruker kvadratroten av forfatterandelen.</li>
          <li>Private skoler (BI, Kristiania) har eget opptak og mangler førstevalg per plass i Samordna-tallene.</li>
          <li>Små enheter svinger mye fra år til år; derfor brukes snitt over tre og fem år.</li>
          <li>Min–maks-skalering gjør rangeringen følsom for ytterpunkter. Alternativ (rangsum eller z-skår) kan legges inn.</li>
        </ul>
      </div>
      <div className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>Generert {data.generert} av scripts/build-rangering.py.</div>
    </div>
  );
}
