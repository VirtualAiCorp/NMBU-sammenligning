import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Download } from 'lucide-react';

/**
 * Fanen «Siteringer» i den interne rangeringen (07.10.2026): siteringsmål fra OpenAlex (CC0) per enhet og periode,
 * uavhengig av tidsskriftlister. Data fra scripts/build-rangering.py (feltet `sitering`, kryptert), laget av
 * scripts/rangering/sitering.py fra cachene til hent_nva_doi.py og hent_openalex.py. Bare aggregater per enhet og år:
 * ingen artikkel-id-er og ingen navn.
 * Norge: NVA-artiklene (samme grunnlag som resten av rangeringen) koblet til OpenAlex på DOI, ellers tittel + tidsskrift
 * + år. Danmark, Sverige og Finland: verkene OpenAlex har for enheten (data/rangering/openalex/enheter-norden.json).
 */

// ── Datatyper (speiler sitering.py) ─────────────────────────────────────────
/** v = [n, d, m, mT, f, sF, p, t10, t1, sC] (se SiteringData.felt), h = FWCI-histogram (bøtteindeks → antall) */
export interface SitAgg { v: number[]; h: Record<string, number>; }
export interface SitNordenData { metode: 'institusjon' | 'tekst' | 'fag'; usikkerhet?: string | null; felt?: number[] | null; aar: Record<string, SitAgg>; hentet?: string; }
export interface SiteringData {
  kilde: string; hentet: string | null; aar: [number, number]; felt: string[]; feltForklaring: Record<string, string>;
  /** nedre grense for hver bøtte i FWCI-histogrammet */ hist: number[];
  /** år fra og med dette regnes som foreløpige (få siteringer ennå) */ forelopigFra: number; standard: [number, number];
  skoler: Record<string, { nvi: Record<string, SitAgg>; alle: Record<string, SitAgg> }>;
  treff: Record<string, Record<string, number>>;
  norden: Record<string, SitNordenData>;
}
const N = 0, D = 1, M = 2, MT = 3, F = 4, SF = 5, P = 6, T10 = 7, T1 = 8, SC = 9;

/** Det fanen trenger om en norsk skole (strukturelt likt Skole i Handelshoyskolerangering.tsx) */
export interface SitSkole { id: string; kort: string; navn: string; isNmbu: boolean; referanse: boolean; dbh: Record<string, { uff?: number | null; utenStip?: number | null; arsverk?: number | null } | undefined>; }
/** En nordisk enhet med nevnere fra data/rangering/norden/*.json */
export interface SitNordisk { id: string; kort: string; navn: string; land: 'DK' | 'SE' | 'FI'; landNavn: string; referanse: boolean; perioder: { fra: number; til: number; artikler?: unknown; arsverk?: unknown; arsverkUtenStip?: unknown }[]; }

// ── Beregning (brukes også av kartet) ───────────────────────────────────────
export type SitNevner = 'uff' | 'utenStip' | 'alle';
export interface SitSum { v: number[]; h: Record<string, number>; aar: number; }
/** Summerer årene som finnes; `aar` = antall år med data. */
export function sitSum(perAar: Record<string, SitAgg> | undefined, aar: string[]): SitSum {
  const v = Array(10).fill(0) as number[]; const h: Record<string, number> = {}; let n = 0;
  for (const y of aar) {
    const x = perAar?.[y]; if (!x) continue; n++;
    x.v.forEach((a, i) => { v[i] += a; });
    for (const [k, c] of Object.entries(x.h)) h[k] = (h[k] ?? 0) + c;
  }
  return { v, h, aar: n };
}
/** Median av FWCI fra histogrammet, med lineær interpolasjon i bøtta. */
export function sitMedian(h: Record<string, number>, kanter: number[]): number | null {
  const n = Object.values(h).reduce((a, b) => a + b, 0); if (!n) return null;
  const maal = n / 2; let acc = 0;
  for (const k of Object.keys(h).map(Number).sort((a, b) => a - b)) {
    const c = h[String(k)];
    if (acc + c >= maal) { const lo = kanter[k], hi = kanter[k + 1] ?? lo + 5; return lo + (hi - lo) * (maal - acc) / c; }
    acc += c;
  }
  return null;
}
/** Sum årsverk i perioden for en norsk skole (år uten tall får snittet av årene som finnes, som i AJG-sammenligningen). */
export function sitArsverkNorge(s: SitSkole, aar: string[], nevner: SitNevner): number | null {
  const xs = aar.map((y) => { const d = s.dbh[y]; return nevner === 'uff' ? d?.uff : nevner === 'utenStip' ? d?.utenStip : d?.arsverk; }).filter((x): x is number => x != null && x > 0);
  return xs.length ? xs.reduce((a, b) => a + b, 0) * aar.length / xs.length : null;
}
const tall = (x: unknown) => typeof x === 'number' && Number.isFinite(x) ? x : null;
/** Nevner for en nordisk enhet: årsverk per år fra perioden i norden-fila som passer best, ganget med antall år med
 *  OpenAlex-data. ‡ = nevneren uten stipendiater/doktorander brukt som reserve; annen = perioden avviker fra den valgte. */
export function sitArsverkNorden(e: SitNordisk, fra: number, til: number, aarMedData: number, nevner: SitNevner): { arsv: number | null; reserve: boolean; annen: boolean; periode: string | null } {
  if (nevner === 'alle' || !aarMedData) return { arsv: null, reserve: false, annen: false, periode: null };
  const med = (k: 'arsverk' | 'arsverkUtenStip') => e.perioder.filter((p) => tall(p[k]) != null);
  let felt: 'arsverk' | 'arsverkUtenStip' = nevner === 'uff' ? 'arsverk' : 'arsverkUtenStip';
  let ps = med(felt); let reserve = false;
  if (!ps.length && nevner === 'uff') { felt = 'arsverkUtenStip'; ps = med(felt); reserve = ps.length > 0; }
  if (!ps.length) return { arsv: null, reserve: false, annen: false, periode: null };
  const overlapp = (p: { fra: number; til: number }) => Math.max(0, Math.min(til, p.til) - Math.max(fra, p.fra) + 1);
  const p = [...ps].sort((a, b) => (overlapp(b) - overlapp(a)) || (b.til - a.til) || ((b.til - b.fra) - (a.til - a.fra)))[0];
  const perAar = (tall(p[felt]) as number) / (p.til - p.fra + 1);
  return { arsv: perAar * aarMedData, reserve, annen: p.fra !== fra || p.til !== til, periode: p.fra === p.til ? String(p.fra) : `${p.fra}–${p.til}` };
}

/** OpenAlex-artikler i rapportperioden delt på rapportens antall (SwePub, Pure, Vipunen), i prosent. */
export function sitMotRapport(e: SitNordisk, g: SitNordenData): { pst: number | null; tekst: string | null } {
  const rp = [...e.perioder].filter((p) => tall(p.artikler) != null).sort((a, b) => (b.til - a.til) || ((b.til - b.fra) - (a.til - a.fra)))[0];
  if (!rp) return { pst: null, tekst: null };
  const iRp = sitSum(g.aar, Array.from({ length: rp.til - rp.fra + 1 }, (_, i) => String(rp.fra + i)));
  const nf0 = (x: number | null) => x == null ? '–' : x.toLocaleString('nb-NO', { maximumFractionDigits: 0 });
  return { pst: iRp.aar === rp.til - rp.fra + 1 ? 100 * iRp.v[N] / (tall(rp.artikler) as number) : null,
    tekst: `${nf0(iRp.v[N])} i OpenAlex mot ${nf0(tall(rp.artikler))} i rapporten (${rp.fra === rp.til ? rp.fra : `${rp.fra}–${rp.til}`})` };
}
/** Per 100 årsverk vises bare når OpenAlex-avgrensningen gir omtrent like mange artikler som rapporten nevneren hører til
 *  (ellers blir telleren for liten eller for stor for nevneren). */
export const SIT_DEKNING_OK: [number, number] = [75, 130];
export const sitDekningOk = (pst: number | null) => pst == null || (pst >= SIT_DEKNING_OK[0] && pst <= SIT_DEKNING_OK[1]);

// ── Mål ──────────────────────────────────────────────────────────────────────
export type SitMaal = 'fwci' | 'median' | 't10a' | 't10' | 't1a' | 't1' | 'sit' | 'n' | 'dekning';
const SIT_MAAL_IDER: SitMaal[] = ['fwci', 'median', 't10a', 't10', 't1a', 't1', 'sit', 'n', 'dekning'];
interface MaalDef { label: string; navn: string; title: string; type: 'fwci' | 'pst' | 'tell' | 'n' | 'sit'; stripe?: boolean; }
const MAAL: Record<SitMaal, MaalDef> = {
  n: { label: 'Artikler', navn: 'artikler', title: 'Vitenskapelige artikler i perioden (Norge: fra NVA i valgt grunnlag; andre land: i OpenAlex)', type: 'n' },
  dekning: { label: 'Dekning', navn: 'dekning i OpenAlex', title: 'Norge: andel av NVA-artiklene som er funnet i OpenAlex (DOI eller tittel). Andre land: OpenAlex-artikler delt på rapportens antall i rapportperioden (SwePub, Pure, Vipunen); over 100 % betyr at OpenAlex finner flere enn rapporten.', type: 'pst', stripe: true },
  fwci: { label: 'Snitt FWCI', navn: 'snitt FWCI', title: 'Field-Weighted Citation Impact: siteringer delt på forventet antall for verk i samme fagfelt, år og type i OpenAlex. 1,0 er snittet for alle verk i OpenAlex, også mange lite siterte, så NVI-artikler ligger typisk rundt 2–3. Snitt over artiklene som har FWCI; påvirkes mye av enkeltartikler med svært mange siteringer.', type: 'fwci', stripe: true },
  median: { label: 'Median FWCI', navn: 'median FWCI', title: 'Medianen av FWCI (halvparten av artiklene ligger over). Mindre følsom for enkeltartikler med svært mange siteringer enn snittet.', type: 'fwci', stripe: true },
  t10a: { label: 'Topp 10 %', navn: 'andel blant de 10 % mest siterte', title: 'Andel av artiklene som er blant de 10 % mest siterte verkene i OpenAlex i sitt fagfelt og år (citation_normalized_percentile). OpenAlex sammenligner med alle verk i feltet, også mange som nesten aldri siteres, så andelen for NVI-artikler er ofte 40–60 %, ikke 10 %.', type: 'pst', stripe: true },
  t10: { label: 'Topp 10 %', navn: 'topp 10 %-artikler', title: 'Artikler blant de 10 % mest siterte i sitt fagfelt og år, per 100 årsverk og år eller antall', type: 'tell', stripe: true },
  t1a: { label: 'Topp 1 %', navn: 'andel blant de 1 % mest siterte', title: 'Andel av artiklene som er blant de 1 % mest siterte verkene i OpenAlex i sitt fagfelt og år. Som for topp 10 % ligger andelen langt over 1 % fordi OpenAlex sammenligner med alle verk.', type: 'pst' },
  t1: { label: 'Topp 1 %', navn: 'topp 1 %-artikler', title: 'Artikler blant de 1 % mest siterte i sitt fagfelt og år, per 100 årsverk og år eller antall', type: 'tell' },
  sit: { label: 'Sit./art.', navn: 'siteringer per artikkel', title: 'Siteringer per artikkel i OpenAlex (cited_by_count) per i dag. Ikke normalisert for fagfelt eller alder: eldre artikler og fagfelt med mange siteringer får høyere tall.', type: 'sit', stripe: true },
};
const KOL: SitMaal[] = ['n', 'dekning', 'fwci', 'median', 't10a', 't10', 't1a', 't1', 'sit'];
const MAKS_SKOLER = 6;

// ── Valg og lenke (?rangering&fane=sitering&sitperiode=2021-2023&sitmaal=t10&sitvis=antall&sitnevner=utenstip&
//    sitgrunnlag=alle&sitref=1&sitnorden=0&sitskoler=nmbu,nhh,,cbs) ───────────────────────────────────────────────
export interface SitValg {
  fra: number; til: number; maal: SitMaal; /** topp 10/1 % per 100 årsverk og år (ellers antall) */ per100: boolean; nevner: SitNevner;
  /** alle artikler i NVA (ellers bare NVI-rapporterte) */ alle: boolean; ref: boolean; /** ta med Danmark, Sverige og Finland */ norden: boolean;
  /** enhetene i utviklingsgrafen; plassen er fargen, '' = ledig plass */ skoler: string[];
}
export const SIT_PARAM = ['sitperiode', 'sitmaal', 'sitvis', 'sitnevner', 'sitgrunnlag', 'sitref', 'sitnorden', 'sitskoler'];
export function sitStandard(sit: SiteringData | null | undefined, aar: [number, number], hh: string, finnes: (id: string) => boolean): SitValg {
  const [fra, til] = sit?.standard ?? [aar[1] - 4, aar[1] - 2];
  return { fra, til, maal: 'median', per100: true, nevner: 'uff', alle: false, ref: false, norden: true,
    skoler: [hh, 'nhh', 'bi', 'dk_cbs', 'se_sse', 'fi_hanken'].filter((id, k, a) => a.indexOf(id) === k && finnes(id)) };
}
export function lesSit(q: URLSearchParams, std: SitValg, aar: [number, number], finnes: (id: string) => boolean): SitValg {
  const v: SitValg = { ...std, skoler: [...std.skoler] };
  const p = (q.get('sitperiode') ?? '').split('-').map(Number);
  if (q.has('sitperiode') && p.length <= 2 && p.every((x) => Number.isInteger(x) && x >= aar[0] && x <= aar[1]) && p[0] <= p[p.length - 1]) { v.fra = p[0]; v.til = p[p.length - 1]; }
  const m = q.get('sitmaal') as SitMaal | null; if (m && SIT_MAAL_IDER.includes(m)) v.maal = m;
  if (q.get('sitvis') === 'antall') v.per100 = false;
  const n = q.get('sitnevner'); if (n === 'utenstip') v.nevner = 'utenStip'; else if (n === 'alle') v.nevner = 'alle';
  if (q.get('sitgrunnlag') === 'alle') v.alle = true;
  if (q.get('sitref') === '1') v.ref = true;
  if (q.get('sitnorden') === '0') v.norden = false;
  if (q.has('sitskoler')) v.skoler = (q.get('sitskoler') ?? '').split(',').map((id) => finnes(id) ? id : '').slice(0, MAKS_SKOLER);
  return v;
}
export function skrivSit(q: URLSearchParams, v: SitValg, std: SitValg) {
  if (v.fra !== std.fra || v.til !== std.til) q.set('sitperiode', v.fra === v.til ? String(v.fra) : `${v.fra}-${v.til}`);
  if (v.maal !== std.maal) q.set('sitmaal', v.maal);
  if (!v.per100) q.set('sitvis', 'antall');
  if (v.nevner !== 'uff') q.set('sitnevner', v.nevner === 'utenStip' ? 'utenstip' : 'alle');
  if (v.alle) q.set('sitgrunnlag', 'alle');
  if (v.ref) q.set('sitref', '1');
  if (!v.norden) q.set('sitnorden', '0');
  if (v.skoler.join(',') !== std.skoler.join(',')) q.set('sitskoler', v.skoler.join(','));
}

// ── Hjelpere ─────────────────────────────────────────────────────────────────
const nf = (v: number | null | undefined, d = 1) => v == null || !Number.isFinite(v) ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });
const aarRekke = (fra: number, til: number) => Array.from({ length: til - fra + 1 }, (_, i) => String(fra + i));
const medianAv = (xs: (number | null | undefined)[]) => { const v = xs.filter((x): x is number => x != null && Number.isFinite(x)).sort((a, b) => a - b); if (!v.length) return null; const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const NEVNER: Record<SitNevner, { knapp: string; lang: string; title: string }> = {
  uff: { knapp: 'Faglige årsverk (HK-dir)', lang: 'faglige årsverk (HK-dir)', title: 'UN1 + stipendiater og postdoktorer (UN2), årsverk, som HK-dirs tilstandsrapport. Andre land: med doktorander der det finnes (‡ = uten, som reserve).' },
  utenStip: { knapp: 'Faglige årsverk (NHH)', lang: 'faglige årsverk (NHH)', title: 'UN1 + postdoktorer, uten stipendiater, som NHHs forskningsrapport. Andre land: uten doktorander der det finnes.' },
  alle: { knapp: 'Alle årsverk', lang: 'alle årsverk', title: 'Alle årsverk ved enheten, også teknisk-administrative (DBH 225). Finnes ikke for andre land.' },
};

function useBredde<T extends HTMLElement>(start = 720) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(start);
  useEffect(() => {
    const el = ref.current; if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function Prikker({ verdier, sel }: { verdier: { id: string; v: number | null }[]; sel: string }) {
  const vs = verdier.filter((x): x is { id: string; v: number } => x.v != null && Number.isFinite(x.v));
  if (!vs.length) return null;
  const lo = Math.min(...vs.map((x) => x.v)), hi = Math.max(...vs.map((x) => x.v)), sp = hi - lo || 1;
  return <div className="strip" aria-hidden="true">{[...vs.filter((x) => x.id !== sel), ...vs.filter((x) => x.id === sel)].map((x) => <u key={x.id} className={x.id === sel ? 'sel' : ''} style={{ left: `${((x.v - lo) / sp * 100).toFixed(1)}%` }} />)}</div>;
}

/** Linjediagram (samme utseende som AJG-grafen), med skravert felt for foreløpige år og en referanselinje (verdenssnittet). */
function SitLinjer({ aar, serier, median, label, forelopigFra, refLinje, d }: {
  aar: string[]; serier: { id: string; lab: string; v: (number | null)[]; k: number; meg: boolean }[]; median: (number | null)[]; label: string;
  forelopigFra: number; refLinje: { v: number; lab: string } | null; d: number;
}) {
  const [ref, W] = useBredde<HTMLDivElement>();
  const [hov, setHov] = useState<number | null>(null);
  const smal = W < 520;
  const direkte = serier.length <= 4;
  const H = smal ? 230 : 280, mg = { l: 38, r: direkte ? (smal ? 70 : 96) : 14, t: 16, b: 24 };
  const iw = W - mg.l - mg.r, ih = H - mg.t - mg.b, n = aar.length;
  const alle = [...serier.flatMap((s) => s.v), ...median, refLinje?.v ?? null].filter((v): v is number => v != null);
  const maks0 = Math.max(0.5, ...alle) * 1.08;
  const st = maks0 <= 1.2 ? 0.2 : maks0 <= 2.5 ? 0.5 : maks0 <= 6 ? 1 : maks0 <= 15 ? 2 : maks0 <= 30 ? 5 : maks0 <= 60 ? 10 : 20;
  const ymax = Math.ceil(maks0 / st) * st;
  const x = (i: number) => mg.l + (n > 1 ? i * iw / (n - 1) : iw / 2), y = (v: number) => mg.t + ih - v / ymax * ih;
  const sti = (v: (number | null)[]) => { let s = '', pen = false; v.forEach((a, i) => { if (a == null) { pen = false; return; } s += `${pen ? 'L' : 'M'}${x(i).toFixed(1)} ${y(a).toFixed(1)}`; pen = true; }); return s; };
  const siste = (v: (number | null)[]) => { for (let i = v.length - 1; i >= 0; i--) if (v[i] != null) return i; return -1; };
  const etiketter = direkte ? serier.map((s) => { const i = siste(s.v); return i < 0 ? null : { y: y(s.v[i] as number), t: s.lab, k: s.k }; }).filter((e): e is { y: number; t: string; k: number } => !!e).sort((a, b) => a.y - b.y) : [];
  for (let i = 1; i < etiketter.length; i++) if (etiketter[i].y - etiketter[i - 1].y < 14) etiketter[i].y = etiketter[i - 1].y + 14;
  const ticks: number[] = []; for (let t = 0; t <= ymax + 1e-9; t += st) ticks.push(Math.round(t * 100) / 100);
  const iF = aar.indexOf(String(forelopigFra));
  const flytt = (e: { currentTarget: SVGSVGElement; clientX: number }) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round((e.clientX - r.left - mg.l) / (n > 1 ? iw / (n - 1) : 1));
    setHov(Math.max(0, Math.min(n - 1, i)));
  };
  const tipVenstre = hov == null ? 0 : x(hov) + 14 + 190 > W ? Math.max(0, x(hov) - 204) : x(hov) + 14;
  return (
    <div ref={ref} className="ajg-graf">
      <svg className="ch" width={W} height={H} role="img" aria-label={label} onPointerMove={flytt} onPointerLeave={() => setHov(null)}>
        {iF >= 0 && <g><rect className="sit-forelopig" x={x(iF) - (n > 1 ? iw / (n - 1) / 2 : 0)} y={mg.t} width={W - mg.r - x(iF) + (n > 1 ? iw / (n - 1) / 2 : 0)} height={ih} /><text className="sit-forelopig-t" x={x(iF) - (n > 1 ? iw / (n - 1) / 2 : 0) + 4} y={mg.t - 4}>foreløpig</text></g>}
        {ticks.map((t) => <g key={t}><line className="gl" x1={mg.l} x2={W - mg.r} y1={y(t)} y2={y(t)} /><text className="ax" x={mg.l - 6} y={y(t) + 4} textAnchor="end">{nf(t, st < 1 ? 1 : 0)}</text></g>)}
        {aar.map((a, i) => (!smal || i % 3 === 0 || i === n - 1) && (smal || i % 2 === 0 || i === n - 1) && <text key={a} className="ax" x={x(i)} y={H - 6} textAnchor="middle">{a}</text>)}
        {refLinje && <g><line className="sit-ref" x1={mg.l} x2={W - mg.r} y1={y(refLinje.v)} y2={y(refLinje.v)} /><text className="sit-ref-t" x={mg.l + 4} y={y(refLinje.v) - 4}>{refLinje.lab}</text></g>}
        {hov != null && <line className="ajg-kryss" x1={x(hov)} x2={x(hov)} y1={mg.t} y2={mg.t + ih} />}
        <path className="ln m" d={sti(median)} />
        {serier.map((s) => <path key={s.id} className={`ajg-ln k${s.k}${s.meg ? ' meg' : ''}`} d={sti(s.v)} />)}
        {serier.map((s) => { const i = hov ?? siste(s.v); const v = i >= 0 ? s.v[i] : null; return v == null ? null : <circle key={s.id} className={`ajg-pt k${s.k}`} cx={x(i)} cy={y(v)} r={4.5} />; })}
        {etiketter.map((e) => <g key={e.t}><line className={`ajg-ln k${e.k}`} x1={W - mg.r + 6} x2={W - mg.r + 16} y1={e.y} y2={e.y} /><text className="ajg-el" x={W - mg.r + 20} y={e.y + 4}>{e.t}</text></g>)}
      </svg>
      {hov != null && (
        <div className="ajg-tip" style={{ left: tipVenstre }}>
          <b>{aar[hov]}{Number(aar[hov]) >= forelopigFra ? ' (foreløpig)' : ''}</b>
          {[...serier].sort((a, b) => (b.v[hov] ?? -1) - (a.v[hov] ?? -1)).map((s) => <div key={s.id}><i className={`k${s.k}`} />{s.lab}<span>{nf(s.v[hov], d)}</span></div>)}
          <div className="m"><i className="m" />Median<span>{nf(median[hov], d)}</span></div>
        </div>
      )}
    </div>
  );
}

// ── Fanen ────────────────────────────────────────────────────────────────────
interface Rad {
  id: string; kort: string; navn: string; land: 'NO' | 'DK' | 'SE' | 'FI'; meg: boolean; referanse: boolean; nordisk: boolean;
  s: SitSum; arsv: number | null; reserve: boolean; nevnerAnnen: boolean; nevnerPeriode: string | null;
  /** Norden: OpenAlex-artikler i rapportperioden / rapportens antall (%) */ motRapport: number | null; rapportTekst: string | null;
  manglerAar: number; metode?: string; usikkerhet?: string | null;
  /** per 100 er holdt tilbake fordi OpenAlex-avgrensningen gir for få eller for mange artikler mot rapporten */ utenforDekning?: boolean;
}
type MaalVerdier = Record<SitMaal, number | null>;
function maalAv(r: Rad, per100: boolean): MaalVerdier {
  const v = r.s.v;
  const c = (x: number) => per100 ? (r.arsv ? 100 * x / r.arsv : null) : x;
  return {
    n: v[N], dekning: r.nordisk ? r.motRapport : (v[N] ? 100 * v[M] / v[N] : null),
    fwci: v[F] ? v[SF] / v[F] : null, median: null,
    t10a: v[P] ? 100 * v[T10] / v[P] : null, t1a: v[P] ? 100 * v[T1] / v[P] : null,
    t10: v[P] ? c(v[T10]) : null, t1: v[P] ? c(v[T1]) : null, sit: v[M] ? v[SC] / v[M] : null,
  };
}

interface Props {
  sit: SiteringData; skoler: SitSkole[]; nordiske: SitNordisk[]; v: SitValg; std: SitValg; sett: (v: SitValg) => void; generert: string;
}
export function SiteringFane({ sit, skoler, nordiske, v, std, sett, generert }: Props) {
  const set = (p: Partial<SitValg>) => sett({ ...v, ...p });
  const [y0, yN] = sit.aar;
  const aar = aarRekke(v.fra, v.til);
  const periodeTekst = v.fra === v.til ? String(v.fra) : `${v.fra}–${v.til}`;
  const forelopig = v.til >= sit.forelopigFra;
  const grunnlag = v.alle ? 'alle' : 'nvi';

  const lagRader = (aarListe: string[], per100: boolean, nevner: SitNevner) => {
    const fra = Number(aarListe[0]), til = Number(aarListe[aarListe.length - 1]);
    const ut: Rad[] = [];
    for (const s of skoler) {
      if (!v.ref && s.referanse) continue;
      const g = sit.skoler[s.id]; if (!g) continue;
      const sum = sitSum(g[grunnlag], aarListe);
      ut.push({ id: s.id, kort: s.kort, navn: s.navn, land: 'NO', meg: s.isNmbu, referanse: s.referanse, nordisk: false, s: sum,
        arsv: per100 ? sitArsverkNorge(s, aarListe, nevner) : null, reserve: false, nevnerAnnen: false, nevnerPeriode: null,
        motRapport: null, rapportTekst: null, manglerAar: aarListe.length - sum.aar });
    }
    if (v.norden) for (const e of nordiske) {
      if (!v.ref && e.referanse) continue;
      const g = sit.norden[e.id]; if (!g) continue;
      const sum = sitSum(g.aar, aarListe); if (!sum.aar) continue;
      // Dekning mot rapporten: OpenAlex-artikler i rapportperioden delt på rapportens antall (siste periode med artikler)
      const mr = sitMotRapport(e, g);
      const ok = sitDekningOk(mr.pst);
      const nev = per100 && ok ? sitArsverkNorden(e, fra, til, sum.aar, nevner) : { arsv: null, reserve: false, annen: false, periode: null };
      ut.push({ id: e.id, kort: e.kort, navn: e.navn, land: e.land, meg: false, referanse: e.referanse, nordisk: true, s: sum,
        arsv: nev.arsv, reserve: nev.reserve, nevnerAnnen: nev.annen, nevnerPeriode: nev.periode, motRapport: mr.pst, rapportTekst: mr.tekst,
        manglerAar: aarListe.length - sum.aar, metode: g.metode, usikkerhet: g.usikkerhet, utenforDekning: per100 && !ok });
    }
    return ut;
  };
  const rader = lagRader(aar, v.per100, v.nevner);
  const maal = new Map(rader.map((r) => [r.id, { ...maalAv(r, v.per100), median: sitMedian(r.s.h, sit.hist) }]));
  const verdi = (r: Rad, id: SitMaal) => maal.get(r.id)?.[id] ?? null;
  const sortert = [...rader].sort((a, b) => (verdi(b, v.maal) ?? -Infinity) - (verdi(a, v.maal) ?? -Infinity));
  const plassPaa = (r: Rad, id: SitMaal) => { const x = verdi(r, id); return x == null ? null : 1 + rader.filter((z) => { const y = verdi(z, id); return y != null && y > x + 1e-9; }).length; };
  const nMed = (id: SitMaal) => rader.filter((r) => verdi(r, id) != null).length;
  const def = MAAL[v.maal];
  const nevKort = v.nevner === 'alle' ? 'årsverk (alle ansatte)' : 'faglige årsverk';
  const enhet = (id: SitMaal) => (id === 't10' || id === 't1') ? (v.per100 ? ` per 100 ${nevKort} og år` : ' (antall)') : '';
  const fmt = (id: SitMaal, x: number | null) => {
    if (x == null) return '–';
    const t = MAAL[id].type;
    return t === 'fwci' ? nf(x, 2) : t === 'pst' ? nf(x, id === 'dekning' ? 0 : 1) + ' %' : t === 'n' ? nf(x, 0) : t === 'sit' ? nf(x, 1) : v.per100 ? nf(x, 1) : nf(x, 0);
  };
  const merke = (r: Rad, id: SitMaal) => (id === 't10' || id === 't1') && v.per100 && verdi(r, id) != null ? `${r.reserve ? ' ‡' : ''}${r.nevnerAnnen ? '*' : ''}` : '';
  const hh = rader.find((r) => r.meg);
  const hhPlass = hh ? plassPaa(hh, v.maal) : null;
  // Ingressen trekker bare fram enheter med god avgrensning (nordiske enheter med dekning utenfor grensene står bare i tabellen)
  const svakAvgrenset = (r: Rad) => r.nordisk && !sitDekningOk(r.motRapport);
  const topp5 = sortert.filter((r) => verdi(r, v.maal) != null && !svakAvgrenset(r)).slice(0, 5);
  const utelattSvak = rader.some((r) => svakAvgrenset(r) && verdi(r, v.maal) != null);
  const norskeMed = rader.filter((r) => !r.nordisk && verdi(r, v.maal) != null);
  const hhNorsk = hh ? 1 + norskeMed.filter((z) => (verdi(z, v.maal) ?? -Infinity) > (verdi(hh, v.maal) ?? -Infinity) + 1e-9).length : null;
  const sel = { padding: '5px 8px', minWidth: 0 } as const;

  // Periodevalg: som AJG-sammenligningen; vinduer som tar med foreløpige år er merket
  const tre = aarRekke(y0 + 2, yN).map(Number).reverse();
  const fem = aarRekke(y0 + 4, yN).map(Number).reverse();
  const verdiP = `${v.fra}-${v.til}`;
  const kjente = new Set([...tre.map((y) => `${y - 2}-${y}`), ...aarRekke(y0, yN).map((y) => `${y}-${y}`), ...fem.map((y) => `${y - 4}-${y}`), `${y0}-${yN}`]);
  const fl = (til: number) => til >= sit.forelopigFra ? ' (foreløpig)' : '';

  // Utviklingsgrafen: valgt mål per år (eller glidende treårssnitt)
  const [glatt, setGlatt] = useState(false);
  const alleAar = aarRekke(y0, yN);
  const grafMaal: SitMaal = v.maal;
  const perAar = useMemo(() => {
    const ut = new Map<string, (number | null)[]>();
    for (const [i, y] of alleAar.entries()) {
      const vindu = glatt ? aarRekke(Math.max(y0, Number(y) - 2), Number(y)) : [y];
      const rr = glatt && vindu.length < 3 ? [] : lagRader(vindu, v.per100, v.nevner);
      for (const r of rr) {
        const m = { ...maalAv(r, v.per100), median: grafMaal === 'median' ? sitMedian(r.s.h, sit.hist) : null };
        const a = ut.get(r.id) ?? Array(alleAar.length).fill(null); a[i] = r.s.aar ? m[grafMaal] : null; ut.set(r.id, a);
      }
    }
    return ut;
  }, [sit, skoler, nordiske, glatt, v.per100, v.nevner, v.alle, v.ref, v.norden, grafMaal]); // eslint-disable-line react-hooks/exhaustive-deps
  const valgte = v.skoler.map((id, k) => ({ id, k })).filter((x) => x.id && rader.some((r) => r.id === x.id));
  const serier = valgte.map(({ id, k }) => { const r = rader.find((z) => z.id === id) as Rad; return { id, lab: r.kort, v: perAar.get(id) ?? [], k, meg: r.meg }; });
  const medianLinje = alleAar.map((_, i) => medianAv(rader.filter((r) => !r.nordisk).map((r) => perAar.get(r.id)?.[i])));
  const veksle = (id: string) => {
    const k = v.skoler.indexOf(id);
    if (k >= 0) { const ny = [...v.skoler]; ny[k] = ''; while (ny.length && !ny[ny.length - 1]) ny.pop(); set({ skoler: ny }); return; }
    const ledig = v.skoler.indexOf('');
    if (ledig >= 0) { const ny = [...v.skoler]; ny[ledig] = id; set({ skoler: ny }); } else if (v.skoler.length < MAKS_SKOLER) set({ skoler: [...v.skoler, id] });
  };
  const fulle = valgte.length >= MAKS_SKOLER;
  // Referanselinjer: snittet og grensene gjelder alle verk i OpenAlex, ikke bare tidsskriftartikler (se metodeboksen)
  const refLinje = v.maal === 'fwci' || v.maal === 'median' ? { v: 1, lab: '1,0 = snitt for alle verk i OpenAlex' } : v.maal === 't10a' ? { v: 10, lab: '10 % = andelen blant alle verk i OpenAlex' } : v.maal === 't1a' ? { v: 1, lab: '1 %' } : null;
  const grafD = MAAL[grafMaal].type === 'fwci' ? 2 : MAAL[grafMaal].type === 'n' ? 0 : 1;

  // Dekning og ferske år (alle norske enheter, valgt grunnlag)
  const dekNorge = skoler.filter((s) => v.ref || !s.referanse).map((s) => ({ s, t: sitSum(sit.skoler[s.id]?.[grunnlag], aar) })).filter((x) => x.t.v[N] > 0)
    .sort((a, b) => b.t.v[M] / b.t.v[N] - a.t.v[M] / a.t.v[N]);
  const ferske = alleAar.map((y) => {
    const t = sitSum(undefined, []);
    for (const s of skoler) { if (s.referanse) continue; const x = sit.skoler[s.id]?.[grunnlag]?.[y]; if (x) x.v.forEach((a, i) => { t.v[i] += a; }); }
    return { y, v: t.v };
  });

  // CSV
  const lastNed = () => {
    const tallCsv = (x: number | null | undefined, d: number) => x == null || !Number.isFinite(x) ? '' : x.toFixed(d).replace('.', ',');
    const esc = (x: string) => /[;"\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x;
    const hode = ['Enhet', 'Navn', 'Land', 'Periode', 'Grunnlag (Norge)', 'Nevner', 'Artikler', 'Funnet i OpenAlex', 'Med FWCI', 'Snitt FWCI', 'Median FWCI',
      'Topp 10 % (antall)', 'Topp 10 % (andel, %)', 'Topp 1 % (antall)', 'Topp 1 % (andel, %)', 'Siteringer per artikkel', `Topp 10 % per 100 ${nevKort} og år`, `Topp 1 % per 100 ${nevKort} og år`,
      'Nevner per år', 'Merknad nevner', 'Dekning (%)', `Plass på ${def.navn}`];
    const linjer = [hode.join(';'), ...sortert.map((r) => {
      const m = maal.get(r.id) as MaalVerdier; const m100 = maalAv(r, true); const x = r.s.v;
      return [esc(r.kort), esc(r.navn), r.land, periodeTekst.replace('–', '-'), v.alle ? 'alle i NVA' : 'NVI-rapporterte', NEVNER[v.nevner].lang,
        String(x[N]), String(x[M]), String(x[F]), tallCsv(m.fwci, 3), tallCsv(m.median, 3), String(x[T10]), tallCsv(m.t10a, 2), String(x[T1]), tallCsv(m.t1a, 2), tallCsv(m.sit, 2),
        tallCsv(r.arsv ? m100.t10 : null, 2), tallCsv(r.arsv ? m100.t1 : null, 2), tallCsv(r.arsv != null && r.s.aar ? r.arsv / r.s.aar : null, 1),
        [r.reserve ? 'nevner uten stipendiater (reserve)' : '', r.nevnerAnnen ? `nevner fra ${r.nevnerPeriode}` : ''].filter(Boolean).join(', '),
        tallCsv(m.dekning, 1), String(plassPaa(r, v.maal) ?? '')].join(';');
    })];
    const blob = new Blob(['﻿' + linjer.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `siteringer-openalex-${periodeTekst.replace('–', '-')}-${v.alle ? 'alle' : 'nvi'}-${v.maal}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const kortMaal: SitMaal[] = ['fwci', 't10a', 't10', 'dekning'];
  const harNorden = Object.keys(sit.norden).length > 0;
  const tellerMerk = rader.some((r) => r.reserve) || rader.some((r) => r.nevnerAnnen);
  const navnCelle = (r: Rad) => (
    <span><b style={{ fontWeight: 600 }}>{r.kort}</b>{r.referanse && <span className="muted" style={{ fontSize: '.72rem' }}> · ref.</span>}
      <small style={{ display: 'block', fontSize: '.72rem', color: 'var(--muted)' }}>{r.nordisk ? `${r.land} · OpenAlex-avgrensning: ${r.metode === 'institusjon' ? 'institusjon' : r.metode === 'fag' ? 'fagfelt' : 'tilknytningstekst'}` : `nr. ${plassPaa(r, v.maal) ?? '–'} av ${nMed(v.maal)}`}{r.manglerAar ? ` · mangler ${r.manglerAar} år` : ''}</small></span>
  );

  return (
    <div className="skp ajg sit">
      <section className="sheet" aria-label="Siteringer">
        <div>
          <span className="lab">OpenAlex · {v.alle ? 'alle artikler i NVA' : 'NVI-artikler'} (Norge) · {periodeTekst}{forelopig ? ' · foreløpige år' : ''}</span>
          <h1>{topp5[0] ? `${topp5[0].kort} er nr. 1 på ${def.navn}${enhet(v.maal)}` : 'Siteringer'}</h1>
          <p style={{ maxWidth: '66ch' }}>
            Topp fem: {topp5.map((r, k) => <Fragment key={r.id}>{k ? (k === topp5.length - 1 ? ' og ' : ', ') : ''}<b>{r.kort}</b> ({fmt(v.maal, verdi(r, v.maal))}{merke(r, v.maal)})</Fragment>)}{utelattSvak ? ` (nordiske enheter med dekning under ${SIT_DEKNING_OK[0]} % eller over ${SIT_DEKNING_OK[1]} % står bare i tabellen)` : ''}.
            {hh && hhPlass != null && <> {hh.kort} er nr. {hhPlass} av {nMed(v.maal)}{v.norden && harNorden && hhNorsk != null ? ` (nr. ${hhNorsk} av ${norskeMed.length} i Norge)` : ''} med {fmt(v.maal, verdi(hh, v.maal))}.</>}
            {' '}Siteringene er hentet fra OpenAlex og normalisert for fagfelt og år, så målet er uavhengig av tidsskriftlister. OpenAlex normaliserer mot alle verk i databasen, så nivået er høyt for alle (FWCI rundt 2–3 og 40–60 % i «topp 10 %» for norske NVI-artikler); bruk tallene til å sammenligne enhetene, ikke som nivå mot verdenssnittet.
          </p>
          {forelopig && <p className="sit-varsel">Perioden tar med {sit.forelopigFra}{yN > sit.forelopigFra ? `–${yN}` : ''}. Ferske artikler har få siteringer ennå, så FWCI og topp 10 % er ustabile og kan endre seg mye. Standard er {std.fra}–{std.til}.</p>}
        </div>
        <div>
          <span className="lab">Valg</span>
          <div className="ajg-valg">
            <label className="ajg-g"><span className="lab">Periode</span>
              <select value={verdiP} onChange={(e) => { const [f, t] = e.target.value.split('-').map(Number); set({ fra: f, til: t }); }} style={sel}>
                <optgroup label="Treårsvindu">{tre.map((y) => <option key={y} value={`${y - 2}-${y}`}>{y - 2}–{y}{fl(y)}</option>)}</optgroup>
                <optgroup label="Enkeltår">{aarRekke(y0, yN).reverse().map((y) => <option key={y} value={`${y}-${y}`}>{y}{fl(Number(y))}</option>)}</optgroup>
                <optgroup label="Femårsvindu">{fem.map((y) => <option key={y} value={`${y - 4}-${y}`}>{y - 4}–{y}{fl(y)}</option>)}</optgroup>
                <optgroup label="Alt"><option value={`${y0}-${yN}`}>{y0}–{yN}{fl(yN)}</option>{!kjente.has(verdiP) && <option value={verdiP}>{periodeTekst}</option>}</optgroup>
              </select>
            </label>
            <label className="ajg-g"><span className="lab">Mål</span>
              <select value={v.maal} onChange={(e) => set({ maal: e.target.value as SitMaal })} style={sel} title={def.title}>
                {(['fwci', 'median', 't10a', 't10', 't1a', 't1', 'sit', 'n', 'dekning'] as SitMaal[]).map((id) => <option key={id} value={id}>{MAAL[id].navn.charAt(0).toUpperCase() + MAAL[id].navn.slice(1)}{id === 't10' || id === 't1' ? (v.per100 ? ' per 100 årsverk' : ' (antall)') : ''}</option>)}
              </select>
            </label>
            <div className="ajg-g" role="group" aria-label="Topp 10 % og 1 %"><span className="lab">Topp 10/1 %</span>
              <button type="button" className="seg" aria-pressed={v.per100} onClick={() => set({ per100: true })}>Per 100 {nevKort}</button>
              <button type="button" className="seg" aria-pressed={!v.per100} onClick={() => set({ per100: false })}>Antall</button>
            </div>
            <div className="ajg-g" role="group" aria-label="Per 100"><span className="lab">Per 100</span>
              {(['uff', 'utenStip', 'alle'] as SitNevner[]).map((n) => (
                <button key={n} type="button" className="seg" aria-pressed={v.nevner === n} onClick={() => set({ nevner: n, per100: true })} title={NEVNER[n].title}>{NEVNER[n].knapp}</button>
              ))}
            </div>
            <div className="ajg-g" role="group" aria-label="Grunnlag i Norge"><span className="lab">Norge</span>
              <button type="button" className="seg" aria-pressed={!v.alle} onClick={() => set({ alle: false })} title="Bare artikler rapportert til NVI (samme grunnlag som HK-dir, DBH og AJG-sammenligningen)">NVI-rapporterte</button>
              <button type="button" className="seg" aria-pressed={v.alle} onClick={() => set({ alle: true })} title="Alle vitenskapelige artikler og oversiktsartikler i NVA, også de som ikke er rapportert til NVI">Alle i NVA</button>
            </div>
            <div className="ajg-g" role="group" aria-label="Utvalg">
              {harNorden && <button type="button" className="seg" aria-pressed={v.norden} onClick={() => set({ norden: !v.norden })} title="Danmark, Sverige og Finland: artiklene OpenAlex har for enheten (foreløpig avgrensning)">Andre land</button>}
              <button type="button" className="seg" aria-pressed={v.ref} onClick={() => set({ ref: !v.ref })} title="Rene samfunnsøkonomimiljøer og hele fakulteter (UiB, UiO, NTNU ØK, KU, SU, Uppsala, Linköping, Helsingfors)">Referanser</button>
            </div>
            {JSON.stringify(v) !== JSON.stringify(std) && <button type="button" className="seg" onClick={() => sett({ ...std, skoler: [...std.skoler] })}>Standardvalg</button>}
          </div>
          <p className="cap">Standard: {std.fra}–{std.til} (siste treårsvindu der siteringene har satt seg; {sit.forelopigFra}–{yN} er foreløpige), snitt FWCI, NVI-artikler, per 100 faglige årsverk med HK-dirs nevner (UN1 + UN2). Topp 10 % per 100 = artikler blant de 10 % mest siterte i perioden delt på sum årsverk i perioden, ganger 100. Lenken husker valgene.</p>
        </div>
      </section>

      <section className="sec" aria-label="Tabell">
        <header>
          <span className="lab">Alle enhetene</span>
          <h2>Sortert etter {def.navn}{enhet(v.maal)}, {periodeTekst}</h2>
          <p className="muted">Klikk på en kolonne for å sortere. Plassen gjelder kolonnen det er sortert etter. Prikkene viser alle enhetene fra laveste til høyeste verdi. {v.norden && harNorden ? 'Enheter i Danmark, Sverige og Finland er i kursiv; avgrensningen deres er foreløpig.' : ''}</p>
        </header>
        <div className="ajg-verktoy">
          <button type="button" className="seg" onClick={lastNed} title="Last ned tabellen (enheter × mål) som CSV med valgene over"><Download className="w-3.5 h-3.5" style={{ display: 'inline', verticalAlign: -2, marginRight: 5 }} />Last ned CSV</button>
        </div>
        <ol className="fs-kort" aria-label="Siteringer, kortvisning">
          {sortert.map((r) => (
            <li key={r.id} className={`rad${r.meg ? ' meg' : ''}${r.nordisk ? ' nordisk' : ''}`}>
              <span className={`pl ${(plassPaa(r, v.maal) ?? 99) <= 3 ? 'top' : ''}`}>{plassPaa(r, v.maal) ?? '–'}</span>
              <span className="nm"><b className="nmt">{r.kort}</b><small>{r.nordisk ? r.land + ' · ' : ''}{fmt('n', verdi(r, 'n'))} artikler · dekning {fmt('dekning', verdi(r, 'dekning'))}</small></span>
              <span className="sc">{fmt(v.maal, verdi(r, v.maal))}{merke(r, v.maal)}<small>{MAAL[v.maal].label}</small></span>
              <span className="maal">
                {kortMaal.map((id) => (
                  <div key={id}><span>{MAAL[id].navn.charAt(0).toUpperCase() + MAAL[id].navn.slice(1)}{enhet(id)}</span><b>{fmt(id, verdi(r, id))}{merke(r, id)}</b>
                    <Prikker verdier={rader.map((z) => ({ id: z.id, v: verdi(z, id) }))} sel={r.id} /></div>
                ))}
              </span>
            </li>
          ))}
        </ol>
        <div className="scroll fs-tabell">
          <table className="ajg-tab sit-tab">
            <thead>
              <tr>
                <th>Plass og enhet</th>
                {KOL.map((id) => (
                  <th key={id} aria-sort={v.maal === id ? 'descending' : undefined} title={MAAL[id].title}>
                    <button type="button" onClick={() => set({ maal: id })}>{MAAL[id].label}{id === 't10' || id === 't1' ? (v.per100 ? ' /100' : ' (n)') : ''}{v.maal === id ? ' ↓' : ''}</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortert.map((r) => {
                const p = plassPaa(r, v.maal);
                return (
                  <tr key={r.id} className={`${r.meg ? 'meg' : ''}${r.nordisk ? ' nordisk' : ''}`}>
                    <td style={{ minWidth: 190 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                        <span className={`ajg-pl${p != null && p <= 3 ? ' top' : ''}`}>{p ?? '–'}</span>
                        {navnCelle(r)}
                      </div>
                    </td>
                    {KOL.map((id) => (
                      <td key={id} className={v.maal === id ? 'sortert' : undefined} title={id === 'dekning' && r.rapportTekst ? r.rapportTekst : (id === 't10' || id === 't1') && r.utenforDekning ? `Ikke vist: OpenAlex-avgrensningen gir ${nf(r.motRapport, 0)} % av rapportens artikler, så telleren passer ikke til nevneren` : (id === 't10' || id === 't1') && r.nevnerAnnen ? `Nevner fra ${r.nevnerPeriode}` : undefined}>
                        {fmt(id, verdi(r, id))}{merke(r, id)}
                        {MAAL[id].stripe && <Prikker verdier={rader.map((z) => ({ id: z.id, v: verdi(z, id) }))} sel={r.id} />}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="cap">FWCI og topp 10/1 % regnes bare for artiklene som er funnet i OpenAlex og har verdien (se «Dekning»). {tellerMerk ? '‡ = nevneren uten stipendiater/doktorander er brukt fordi tallet med ikke finnes (gir noe høyere tall per 100). * = nevneren er fra en annen periode (andre land har årsverk bare for enkelte år; årsverk per år antas likt i hele perioden). ' : ''}Andre land har ikke «alle årsverk». Dekning for andre land er OpenAlex-artiklene mot rapportens antall (pek på tallet for detaljer); per 100 årsverk vises bare når den er mellom {SIT_DEKNING_OK[0]} og {SIT_DEKNING_OK[1]} %, ellers passer ikke telleren til nevneren.</p>
      </section>

      <section className="sec" aria-label="Utvikling over tid">
        <header>
          <span className="lab">Utvikling {y0}–{yN}</span>
          <h2>{MAAL[grafMaal].navn.charAt(0).toUpperCase() + MAAL[grafMaal].navn.slice(1)}{enhet(grafMaal)}{glatt ? ', glidende treårssnitt' : ' per år'}</h2>
          <p className="muted">Velg opptil {MAKS_SKOLER} enheter. Fargen følger enheten. Stiplet linje er medianen for de norske enhetene som vises. Det skraverte feltet er foreløpige år med få siteringer. Grafen følger målet som er valgt over.</p>
        </header>
        <div className="cmprow ajg-chips" role="group" aria-label="Enheter i grafen">
          {sortert.map((r) => { const k = v.skoler.indexOf(r.id); return (
            <button key={r.id} type="button" aria-pressed={k >= 0} disabled={k < 0 && fulle} onClick={() => veksle(r.id)}>{k >= 0 && <i className={`k${k}`} />}{r.kort}</button>
          ); })}
          <span style={{ marginLeft: 'auto' }} />
          <button type="button" className="seg" aria-pressed={glatt} onClick={() => setGlatt(!glatt)} title="Snitt av tre år (året og de to foregående), jevner ut små enheter">Glidende treårssnitt</button>
        </div>
        <div className="legend">{serier.map((s) => <span key={s.id}><i className={`ajg-sw k${s.k}`} />{s.lab}</span>)}<span><i className="m" />Median (Norge)</span></div>
        <SitLinjer aar={alleAar} serier={serier} median={medianLinje} forelopigFra={sit.forelopigFra} refLinje={refLinje} d={grafD}
          label={`${MAAL[grafMaal].navn} ${y0} til ${yN} for ${serier.map((s) => s.lab).join(', ')}`} />
        <details><summary>Vis som tabell</summary>
          <div className="scroll"><table><thead><tr><th>År</th>{serier.map((s) => <th key={s.id}>{s.lab}</th>)}<th>Median (Norge)</th></tr></thead>
            <tbody>{alleAar.map((y, i) => <tr key={y}><td>{y}{Number(y) >= sit.forelopigFra ? ' (foreløpig)' : ''}</td>{serier.map((s) => <td key={s.id}>{nf(s.v[i], grafD)}</td>)}<td>{nf(medianLinje[i], grafD)}</td></tr>)}</tbody></table></div>
        </details>
      </section>

      <section className="sec" aria-label="Dekning">
        <header>
          <span className="lab">Dekning, {periodeTekst}</span>
          <h2>Hvor mange av artiklene finnes i OpenAlex?</h2>
          <p className="muted">Norge: NVA-artiklene ({v.alle ? 'alle' : 'NVI-rapporterte'}) koblet til OpenAlex på DOI fra NVA, ellers på tittel + tidsskrift (ISSN) + år ±1 når treffet er entydig. Artikler som ikke finnes, er med i «Artikler», men ikke i FWCI og topp 10 %.</p>
        </header>
        <div className="scroll">
          <table className="ajg-tab sit-dek">
            <thead><tr><th>Enhet</th><th>Artikler</th><th>Med DOI</th><th>Funnet på DOI</th><th>Funnet på tittel</th><th>Ikke funnet</th><th>Dekning</th><th title="Andel av de funne artiklene som har FWCI">Med FWCI</th></tr></thead>
            <tbody>
              {dekNorge.map(({ s, t }) => (
                <tr key={s.id} className={s.isNmbu ? 'meg' : undefined}>
                  <td>{s.kort}{s.referanse ? <span className="muted"> · ref.</span> : null}</td>
                  <td>{nf(t.v[N], 0)}</td><td>{nf(100 * t.v[D] / t.v[N], 0)} %</td><td>{nf(t.v[M] - t.v[MT], 0)}</td><td>{nf(t.v[MT], 0)}</td><td>{nf(t.v[N] - t.v[M], 0)}</td>
                  <td><b>{nf(100 * t.v[M] / t.v[N], 1)} %</b></td><td>{t.v[M] ? nf(100 * t.v[F] / t.v[M], 0) + ' %' : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {v.norden && harNorden && (
          <>
            <p className="muted" style={{ marginTop: 6 }}>Danmark, Sverige og Finland: OpenAlex har ikke fakulteter og institutter som egne enheter (verken i ROR eller OpenAlex), så bare CBS, Handelshögskolan i Stockholm og Hanken kan hentes som hele institusjoner. De andre er avgrenset på forfatternes tilknytningstekst eller på fagfelt.</p>
            <div className="scroll">
              <table className="ajg-tab sit-dek">
                <thead><tr><th>Enhet</th><th>Avgrensning i OpenAlex</th><th>OpenAlex mot rapporten</th><th>Usikkerhet</th></tr></thead>
                <tbody>
                  {rader.filter((r) => r.nordisk).sort((a, b) => a.land.localeCompare(b.land) || a.kort.localeCompare(b.kort, 'nb')).map((r) => (
                    <tr key={r.id} className="nordisk">
                      <td>{r.kort} <span className="muted">· {r.land}</span></td>
                      <td style={{ textAlign: 'left', whiteSpace: 'normal' }}>{r.metode === 'institusjon' ? 'hele institusjonen (ROR)' : r.metode === 'fag' ? 'fagfelt (som den finske rapporten)' : 'tilknytningstekst'}</td>
                      <td style={{ textAlign: 'left', whiteSpace: 'normal' }}>{r.rapportTekst ?? '–'}{r.motRapport != null ? ` = ${nf(r.motRapport, 0)} %` : ''}</td>
                      <td style={{ textAlign: 'left', whiteSpace: 'normal', minWidth: 260 }} className="muted">{r.usikkerhet ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="sec" aria-label="Ferske år">
        <header>
          <span className="lab">Hvorfor {std.fra}–{std.til} er standard</span>
          <h2>Ferske artikler har få siteringer</h2>
          <p className="muted">Alle norske enheter samlet (uten referanser), {v.alle ? 'alle i NVA' : 'NVI-rapporterte'}. FWCI og persentil sammenligner med artikler fra samme år, men de første årene bygger på svært få siteringer, så tallene hopper og kan endre seg mye ved neste uthenting.</p>
        </header>
        <div className="scroll">
          <table className="ajg-tab sit-dek">
            <thead><tr><th>År</th><th>Artikler</th><th>Funnet</th><th>Med FWCI</th><th>Siteringer per artikkel</th><th>Snitt FWCI</th><th>Topp 10 %</th><th>Topp 1 %</th></tr></thead>
            <tbody>
              {[...ferske].reverse().map(({ y, v: x }) => (
                <tr key={y} className={Number(y) >= sit.forelopigFra ? 'sit-fl' : undefined}>
                  <td>{y}{Number(y) >= sit.forelopigFra ? ' · foreløpig' : ''}</td><td>{nf(x[N], 0)}</td><td>{x[N] ? nf(100 * x[M] / x[N], 0) + ' %' : '–'}</td>
                  <td>{x[M] ? nf(100 * x[F] / x[M], 0) + ' %' : '–'}</td><td>{x[M] ? nf(x[SC] / x[M], 1) : '–'}</td><td>{x[F] ? nf(x[SF] / x[F], 2) : '–'}</td>
                  <td>{x[P] ? nf(100 * x[T10] / x[P], 1) + ' %' : '–'}</td><td>{x[P] ? nf(100 * x[T1] / x[P], 1) + ' %' : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sec ajg-metode" aria-label="Metode">
        <span className="lab">Metode og forbehold</span>
        <ul>
          <li><b>Kilde.</b> {sit.kilde} OpenAlex er en åpen bibliografisk database (data under CC0) som bygger på Crossref, PubMed, ORCID, ROR og forlagenes egne data. Hentet uten API-nøkkel; bare aggregerte tall per enhet og år ligger i rangeringsdataene ({generert}).</li>
          <li><b>FWCI</b> (Field-Weighted Citation Impact) er siteringene til en artikkel delt på det forventede antallet for verk fra samme år, av samme type og i samme underfelt i OpenAlex. Snittet påvirkes mye av enkeltartikler med svært mange siteringer (de høyeste har FWCI over 100), derfor vises også medianen.</li>
          <li><b>Topp 10 % og topp 1 %</b> er artikler som ligger blant de 10 % (1 %) mest siterte verkene i OpenAlex i sitt fagfelt og år («citation_normalized_percentile»). «Per 100 årsverk og år» er antall slike artikler i perioden delt på sum årsverk i perioden, ganger 100 (samme nevnere som AJG-sammenligningen).</li>
          <li><b>Nivået er høyt for alle.</b> OpenAlex sammenligner med alle verk i databasen (over 250 millioner, også mange lite siterte tidsskrift og publikasjonstyper), ikke bare med tidsskrift i Scopus eller Web of Science. Norske NVI-artikler har derfor median FWCI rundt 2–2,5 og 40–60 % i «topp 10 %». 1,0 og 10 % er altså ikke verdenssnittet for vitenskapelige tidsskriftartikler, og tallene kan ikke sammenlignes med FWCI fra Scopus (SciVal). De egner seg for å sammenligne enhetene med hverandre.</li>
          <li><b>Grunnlag i Norge.</b> NVA-artiklene i rangeringen ({v.alle ? 'alle i NVA' : 'NVI-rapporterte som standard'}), hel telling: artikkelen teller for hver enhet med minst én forfatter der. Koblet på DOI fra NVA, ellers på tittel + tidsskrift + år når treffet er entydig. Ikke avhengig av noen tidsskriftliste.</li>
          <li><b>Danmark, Sverige og Finland.</b> Artiklene OpenAlex knytter til enheten (type article/review). CBS, Handelshögskolan i Stockholm og Hanken er hele institusjoner. Fakulteter og institutter finnes ikke som egne enheter i ROR/OpenAlex; de er avgrenset på forfatternes tilknytningstekst (Danmark og Sverige) eller på OpenAlex-fagfelt 14, 18 og 20 (Finland, som den finske rapportens 511 + 512, og med samme nevner). Tilknytningsteksten mangler ofte institutt, så dekningen er lavere enn i SwePub og Pure. Nevnerne er fra norden-filene og gjelder bare enkelte år.</li>
          <li><b>Begrensninger.</b> (1) OpenAlex' fagfeltinndeling (primary topic, maskinelt klassifisert) avgjør hva artikkelen sammenlignes med; tverrfaglige artikler kan havne i et felt med andre siteringsvaner. (2) Kobling og dekning: artikler uten DOI og i små norske tidsskrift finnes ofte ikke. (3) Ferske år ({sit.forelopigFra}–{yN}) er foreløpige. (4) OpenAlex-siteringene endrer seg ved hver oppdatering, og tallene kan avvike fra Scopus og Web of Science. (5) Små enheter svinger mye; bruk treårsvindu. (6) Siteringer måler oppmerksomhet i forskningen, ikke kvalitet alene.</li>
          <li><b>Foreløpige tall.</b> Siteringsmålet er nytt (7.10.2026), ikke kontrollert mot skolenes egne tall og ikke med i den samlede rangeringen.</li>
        </ul>
      </section>
    </div>
  );
}
