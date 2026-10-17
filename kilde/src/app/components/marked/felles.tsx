import { useEffect, useState, type ReactNode } from 'react';
import { Info, type LucideIcon } from 'lucide-react';

/**
 * Felles for NMBU-siden «Markedet»: typene og innlastingen av datafilene i public/marked/ (scripts/build-marked.py),
 * og små visningshjelpere (kort, tall, valgknapper). Filene lastes først når en fane trenger dem, og hvert løfte caches.
 */

// ── Typer ──────────────────────────────────────────────────────────────────
export interface Inst { n: string; k: string; t?: string; s?: string; so?: boolean; privat?: boolean }
export type NivFv = { b?: number[]; a?: number[]; m?: number[] };
export type NivMott = { b?: number[]; a?: number[]; m5?: number[]; m2?: number[]; me?: number[] };
export interface Oversikt {
  hentet: string;
  aar: string[];
  dbhAar: string[];
  fagfelt: { id: string; n: string; nus: Record<string, string> }[];
  inst: Record<string, Inst>;
  fv: Record<string, Record<string, NivFv>>;
  mott: Record<string, Record<string, NivMott>>;
  nmbuArsstudier: { k: string; n: string; ff: string; fv: (number | null)[] }[];
  antall: Record<string, number>;
  kobling: { so: number; soMedSr: number; lokalt: number; lokaltMedSr: number };
  kilder: Record<string, string>;
}
/** Nøkkeltall fra studieresultatene (DBH), slått opp via <inst>_<programkode>. Seriene gjelder 2019–2025. */
export interface Sr {
  key: string; nv?: string; fg?: string;
  reg: (number | null)[]; nye: (number | null)[]; kand: (number | null)[];
  fn?: number; kg?: number; ka?: [number, number]; fr?: number; f2?: number; k2?: number;
  inn?: number; innAar?: number; innPerReg?: number; innS?: (number | null)[];
  hyp?: boolean; forelopig?: boolean; pr?: string[]; delt?: number;
}
/**
 * Ett program. Samordna: a[år] = [søkere, førstevalg, plasser, kvalifiserte, tilbud, poenggrense ord., poenggrense FV].
 * Lokalt opptak (DBH 379 L): a[år] = [søkere, førstevalg, –, kvalifiserte, tilbud, –, –, møtt].
 */
export interface ProgramRad {
  id: string; k: string; n: string; i: string; st?: string | null; ff: string;
  niv: 'bachelor' | 'master' | 'arsstudium' | 'profesjon' | 'annet'; var?: string;
  sp?: number; nett?: boolean | null; deltid?: boolean; lok?: boolean; status?: string; fra?: string; til?: string;
  ledig?: boolean; url?: string; dbh?: string[]; km?: string;
  /** Studiested-id-er (studiesteder.json), flest studenter først. */
  ss?: string[];
  a: Record<string, (number | null)[]>;
  sr?: Sr;
}
export interface Fordeling { n: number; p25: number; median: number; p75: number }
/**
 * Ett studiested (institusjon × sted). r = registrerte høst 2019–2025 (DBH 124), fv = førstevalg 2021–2026 (Samordna),
 * o = registrerte 2025 etter organisering [stedbasert, desentralisert, nett], sf = aktive Samordna-koder [alle, nett, samling].
 * a = fordeling [fagfelt-indeks, nivå-indeks, DBH-program, Samordna-koder, r × 7, fv × 6]. td/ts = største program.
 */
export interface Studiested {
  id: string; i: string; n: string; t: 's' | 'n' | 'u'; kn: string | null; f: string | null; ll: [number, number] | null;
  k: 'S' | 'D' | 'SD'; ps: number; pd: number; r: number[]; fv: number[]; o: [number, number, number]; sf: [number, number, number];
  a: number[][]; td: [string, string, number, number, number][]; ts: [string, string, number, number | null, number | null, number][];
  v?: string[];
}
export interface Studiesteder {
  hentet: string; aar: string[]; fvAar: string[]; niv: string[]; ff: string[];
  inst: Record<string, { n: string; k: string; p: boolean }>;
  steder: Studiested[];
  dekning: Record<string, number>;
  kontroll: { dbh123: Record<string, number>; dbh124: Record<string, number>; medSted: Record<string, number>; nett: Record<string, number>; avvik: number; bareSamordna: number; bareDbh: number };
}
export type Aggregater = Record<string, { n: string; ant: number; fd: Partial<Record<'fullfortNormertAndel' | 'frafallNormertAndel' | 'fullfort2Andel' | 'innPerReg' | 'reg', Fordeling>> }>;

// ── Innlasting ─────────────────────────────────────────────────────────────
const cache = new Map<string, Promise<unknown>>();
export function hentFil<T>(navn: string): Promise<T | null> {
  let p = cache.get(navn) as Promise<T | null> | undefined;
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}marked/${navn}`).then((r) => (r.ok ? r.json() : null)).catch(() => { cache.delete(navn); return null; });
    cache.set(navn, p);
  }
  return p;
}
export const hentOversikt = () => hentFil<Oversikt>('oversikt.json');
export const hentAggregater = () => hentFil<Aggregater>('aggregater.json');
export const hentStudiesteder = () => hentFil<Studiesteder>('studiesteder.json');
export const hentProgram = (ff: string) => hentFil<{ fagfelt: string; program: ProgramRad[] }>(`program-${ff}.json`).then((d) => d?.program ?? []);

/** Laster en fil når komponenten vises. undefined = laster, null = feilet. */
export function useFil<T>(hent: () => Promise<T | null>, avh: unknown[] = []): T | null | undefined {
  const [data, setData] = useState<T | null | undefined>(undefined);
  useEffect(() => {
    let aktiv = true;
    setData(undefined);
    hent().then((d) => { if (aktiv) setData(d); });
    return () => { aktiv = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, avh);
  return data;
}

// ── Konstanter og formatering ──────────────────────────────────────────────
export const NMBU = '1173';
export const NMBU_FARGE = '#00594F';
export const ANDRE_FARGE = '#9CA3AF';
export const PRIVAT_FARGE = '#B45309';
export const OPP = '#047857';
export const NED = '#b91c1c';

export const nf = (v: number | null | undefined, d = 0) =>
  v == null || Number.isNaN(v) ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });
export const pst = (v: number | null | undefined, d = 1) => (v == null || Number.isNaN(v) ? '–' : `${nf(v, d)} %`);
export const fortegn = (v: number | null | undefined, d = 0, enhet = '') =>
  v == null || Number.isNaN(v) ? '–' : `${v > 0 ? '+' : v < 0 ? '−' : '±'}${nf(Math.abs(v), d)}${enhet}`;
export const endringFarge = (v: number | null | undefined) => (v == null || v === 0 ? 'var(--nmbu-neutral-2)' : v > 0 ? OPP : NED);
export const kr = (v: number | null | undefined) => (v == null ? '–' : v >= 1e6 ? `${nf(v / 1e6, 1)} mill. kr` : `${nf(v)} kr`);
export const dato = (iso?: string) => (iso ? iso.slice(0, 10).split('-').reverse().join('.') : '');
export const sum = (a: (number | null | undefined)[]) => a.reduce<number>((s, v) => s + (v ?? 0), 0);

export const kort = { backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' };
export const thead = { backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' };
export const th = 'px-2.5 py-2 text-right whitespace-nowrap font-semibold';
export const thV = 'px-2.5 py-2 text-left whitespace-nowrap font-semibold';
export const td = 'px-2.5 py-1.5 text-right whitespace-nowrap tabular-nums';
export const tdV = 'px-2.5 py-1.5 text-left';
export const nmbuRad = { backgroundColor: 'var(--nmbu-green-light)', fontWeight: 700 } as const;

/** Hvitt kort med ikon, tittel, forklaring og kilde nederst, som de andre kortene på nettstedet. */
export function Kort({ ikon: Ikon, tittel, undertekst, kilde, forbehold, hoyre, children }: {
  ikon: LucideIcon; tittel: ReactNode; undertekst?: ReactNode; kilde?: ReactNode; forbehold?: ReactNode[]; hoyre?: ReactNode; children: ReactNode;
}) {
  return (
    <section className="rounded-xl p-5" style={kort}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}><Ikon className="w-4 h-4 shrink-0" /> {tittel}</div>
        {hoyre}
      </div>
      {undertekst && <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)', marginBottom: 12, lineHeight: 1.55 }}>{undertekst}</div>}
      {children}
      {(kilde || (forbehold && forbehold.length > 0)) && (
        <div className="mt-3 pt-2 space-y-1" style={{ borderTop: '1px solid var(--nmbu-neutral-3)', fontSize: 11, color: 'var(--nmbu-neutral-2)', lineHeight: 1.5 }}>
          {kilde && <div>{kilde}</div>}
          {forbehold?.map((f, i) => <div key={i} className="flex gap-1.5"><Info className="w-3 h-3 shrink-0 mt-0.5" /><span>{f}</span></div>)}
        </div>
      )}
    </section>
  );
}

/** Rad med valgknapper (piller). */
export function Valg<T extends string>({ valg, verdi, onVelg, etikett }: { valg: { id: T; label: string }[]; verdi: T; onVelg: (v: T) => void; etikett?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={etikett}>
      {etikett && <span style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginRight: 2 }}>{etikett}</span>}
      {valg.map((v) => (
        <button key={v.id} onClick={() => onVelg(v.id)} aria-pressed={v.id === verdi} className="px-2.5 py-0.5 rounded-full text-xs"
          style={v.id === verdi ? { backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', fontWeight: 600 } : { border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)' }}>
          {v.label}
        </button>
      ))}
    </div>
  );
}

/** Nedtrekksliste i samme stil som resten av filtrene. */
export function Velger({ etikett, verdi, onVelg, valg, bredde }: { etikett: string; verdi: string; onVelg: (v: string) => void; valg: { id: string; label: string }[]; bredde?: number }) {
  return (
    <label className="flex flex-col gap-0.5" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
      {etikett}
      <select value={verdi} onChange={(e) => onVelg(e.target.value)} className="rounded-md px-2 py-1 text-xs"
        style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', color: 'var(--nmbu-neutral)', maxWidth: bredde ?? 220 }}>
        {valg.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
      </select>
    </label>
  );
}

export function Merke({ tekst, bg = '#F3F4F6', fg = '#374151', tittel }: { tekst: string; bg?: string; fg?: string; tittel?: string }) {
  return <span title={tittel} className="ml-1.5 px-1.5 py-px rounded text-[10px] whitespace-nowrap align-middle" style={{ backgroundColor: bg, color: fg, fontWeight: 600 }}>{tekst}</span>;
}

/** Liten linje for en tidsserie (inline i tabeller). */
export function Spark({ verdier, farge = ANDRE_FARGE, b = 72, h = 20 }: { verdier: (number | null | undefined)[]; farge?: string; b?: number; h?: number }) {
  const tallene = verdier.filter((v): v is number => v != null);
  if (tallene.length < 2) return null;
  const maks = Math.max(...tallene), min = Math.min(...tallene);
  const x = (i: number) => (i / (verdier.length - 1)) * (b - 4) + 2;
  const y = (v: number) => (maks === min ? h / 2 : h - 3 - ((v - min) / (maks - min)) * (h - 6));
  const punkter = verdier.map((v, i) => (v == null ? null : `${x(i)},${y(v)}`)).filter(Boolean).join(' ');
  return (
    <svg width={b} height={h} viewBox={`0 0 ${b} ${h}`} aria-hidden className="inline-block align-middle">
      <polyline points={punkter} fill="none" stroke={farge} strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
}

export function Laster({ tekst = 'Laster markedsdataene …' }: { tekst?: string }) {
  return <div className="rounded-xl p-5 text-sm" style={{ ...kort, color: 'var(--nmbu-neutral-2)' }}>{tekst}</div>;
}

/** Felles forbehold som gjelder hele markedssiden. */
export const FORBEHOLD = {
  sokere: 'Søkere i Samordna er søknader (én søker kan ha opptil ti alternativer). Førstevalg teller personer, fordi hver søker har nøyaktig ett førstevalg.',
  dbh2026: 'DBH har ikke publisert 2026 ennå (tabell 347 høst, 370 og 379 for hele året). DBH-tallene slutter derfor i 2025, og nye Samordna-koder fra 2026 mangler DBH-kobling.',
  prikking: 'DBH skjermer små tall (1–2 personer vises som 0). Kandidater, utenlandske og små program er mest rammet; tallene er da minimumstall.',
  finansiering: 'Finansieringssystemet ble lagt om fra og med 2023-produksjonen (kategori 1–3 og G3 i stedet for A–F og kandidatuttelling). Inntektsbeløp før og etter 2022/2023 kan ikke sammenlignes.',
  private: 'Private institusjoner får et fast tilskudd for avtalte plasser, ikke uttelling per studiepoeng. Inntektstallene for private er derfor hypotetiske (hva de ville fått i det statlige systemet).',
  studiesteder: 'DBH 124 skiller ikke alltid nettstudenter fra studentene på et studiested: noen institusjoner har egen nettcampus, andre fører nettstudentene på hovedcampus. Enkelte institusjoner rapporterer bare hovedcampus, og DBH for 2026 er ikke publisert, så studenttallene slutter høsten 2025.',
  lokalt: 'Program med lokalt opptak (DBH 379, opptakstype L) har ikke Samordnas plasser eller poenggrenser, og førstevalg gjelder bare institusjonens egne alternativer. Tallene kan ikke summeres med Samordna-tallene.',
};
