import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';

/**
 * Fanen «HH NMBU etter AJG» i den interne rangeringen (07.10.2026): Handelshøyskolen ved NMBUs egne artikler etter
 * AJG 2024-nivå (4*, 4, 3, 2, 1, ikke på AJG). Data fra scripts/build-rangering.py (feltet `hhAjg`, kryptert):
 * tidsskriftene én gang (navn, AJG-nivå, AJG-fagfelt, ISSN) og artiklene som rader med indeks til tidsskriftet.
 * AJG-nivå per tidsskrift er lisensbelagt (Chartered ABS) og finnes bare i de krypterte dataene, aldri i koden.
 * Fanen og dataene forsvinner når AJG-lista slettes og rangeringen bygges på nytt.
 */

// ── Datatyper (speiler hh_liste i build-rangering.py) ───────────────────────
/** [navn, AJG-nivå («4*»–«1», null = ikke på AJG, «?» = usjekket), AJG-fagfelt, ISSN] */
export type HhTidsskrift = [string, string | null, string | null, string | null];
/** [NVA-id, år, tittel, tidsskriftindeks, norsk nivå («2», «1», «0», «»), NVI (0/1), HH-forfattere, alle forfattere, internasjonal (0/1),
 *  FWCI fra OpenAlex (null = ikke funnet/ingen verdi), blant de 10 % mest siterte i felt og år (0/1, null = ukjent)] */
export type HhArtikkel = [string, number, string, number, string, number, number, number, number, (number | null)?, (number | null)?];
export interface HhAjgData { skole: string; felt: string[]; tidsskrift: HhTidsskrift[]; artikler: HhArtikkel[]; ajgDelvis: boolean; nvaUrl: string; merknad: string; }
type NhhTall = Record<string, Partial<Record<'4*' | '4' | '3', { n: number; perFte: number }>>>;

type Niva = '4*' | '4' | '3' | '2' | '1' | 'ikke' | '?';
const NIVAER: Niva[] = ['4*', '4', '3', '2', '1', 'ikke', '?'];
const NIVA_NAVN: Record<Niva, string> = { '4*': 'AJG 4*', '4': 'AJG 4', '3': 'AJG 3', '2': 'AJG 2', '1': 'AJG 1', ikke: 'Ikke på AJG', '?': 'Ikke sjekket' };
const NIVA_KORT: Record<Niva, string> = { '4*': '4*', '4': '4', '3': '3', '2': '2', '1': '1', ikke: 'Ikke på AJG', '?': 'Usjekket' };
const NIVA_KLASSE: Record<Niva, string> = { '4*': 'a5', '4': 'a4', '3': 'a3', '2': 'a2', '1': 'a1', ikke: 'a0', '?': 'aq' };
const NIVA_URL: Record<Niva, string> = { '4*': '4s', '4': '4', '3': '3', '2': '2', '1': '1', ikke: 'ikke', '?': 'usjekket' };
const ORDEN: Record<Niva, number> = { '4*': 0, '4': 1, '3': 2, '2': 3, '1': 4, '?': 5, ikke: 6 };
const nivaAv = (t: HhTidsskrift | undefined): Niva => !t || t[1] == null ? 'ikke' : (t[1] as Niva);
const tre = (n: Niva) => n === '4*' || n === '4' || n === '3';

const nf = (v: number | null | undefined, d = 1) => v == null || !Number.isFinite(v) ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });
const pst = (a: number, b: number) => b > 0 ? nf(100 * a / b, 0) + ' %' : '–';
const aarRekke = (fra: number, til: number) => Array.from({ length: til - fra + 1 }, (_, i) => fra + i);

// ── Valg og lenke (?rangering&fane=hh&hhtelling=brok&hhgrunnlag=alle&hhperiode=2020-2025&hhniva=4s,4,3&hhsok=…&hhvis=andel) ──
export interface HhValg {
  /** brøkdelt telling (HHs andel av forfatterne) i stedet for hel */ brok: boolean;
  /** alle artikler i NVA, ikke bare NVI-rapporterte */ alle: boolean;
  /** periode for artikkellista og tidsskriftene */ fra: number; til: number;
  /** AJG-nivåer i artikkellista (tom = alle) */ niva: Niva[];
  /** fritekst (tittel eller tidsskrift) */ sok: string;
  /** stolpene som andel i stedet for antall */ andel: boolean;
}
export const HH_PARAM = ['hhtelling', 'hhgrunnlag', 'hhperiode', 'hhniva', 'hhsok', 'hhvis'];
export const hhStandard = (aar: [number, number]): HhValg => ({ brok: false, alle: false, fra: aar[0], til: aar[1], niva: [], sok: '', andel: false });
export function lesHh(q: URLSearchParams, std: HhValg, aar: [number, number]): HhValg {
  const v: HhValg = { ...std, niva: [...std.niva] };
  if (q.get('hhtelling') === 'brok') v.brok = true;
  if (q.get('hhgrunnlag') === 'alle') v.alle = true;
  const p = (q.get('hhperiode') ?? '').split('-').map(Number);
  if (q.has('hhperiode') && p.length <= 2 && p.every((x) => Number.isInteger(x) && x >= aar[0] && x <= aar[1]) && p[0] <= p[p.length - 1]) { v.fra = p[0]; v.til = p[p.length - 1]; }
  const nv = (q.get('hhniva') ?? '').split(',').map((x) => NIVAER.find((n) => NIVA_URL[n] === x)).filter((x): x is Niva => !!x);
  if (nv.length) v.niva = [...new Set(nv)];
  const s = q.get('hhsok'); if (s) v.sok = s.slice(0, 120);
  if (q.get('hhvis') === 'andel') v.andel = true;
  return v;
}
export function skrivHh(q: URLSearchParams, v: HhValg, std: HhValg) {
  if (v.brok) q.set('hhtelling', 'brok');
  if (v.alle) q.set('hhgrunnlag', 'alle');
  if (v.fra !== std.fra || v.til !== std.til) q.set('hhperiode', v.fra === v.til ? String(v.fra) : `${v.fra}-${v.til}`);
  if (v.niva.length) q.set('hhniva', v.niva.map((n) => NIVA_URL[n]).join(','));
  if (v.sok.trim()) q.set('hhsok', v.sok.trim());
  if (v.andel) q.set('hhvis', 'andel');
}

// ── Hjelpere ─────────────────────────────────────────────────────────────────
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
function lastNedCsv(navn: string, linjer: string[]) {
  const blob = new Blob(['﻿' + linjer.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = navn;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const esc = (x: string) => /[;"\n\r]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x;
const tallCsv = (x: number | null | undefined, d: number) => x == null || !Number.isFinite(x) ? '' : x.toFixed(d).replace('.', ',');

type Telling = Record<Niva, number> & { sum: number };
const tom = (): Telling => ({ '4*': 0, '4': 0, '3': 0, '2': 0, '1': 0, ikke: 0, '?': 0, sum: 0 });

// ── Stablet stolpe per år ───────────────────────────────────────────────────
function Stolper({ aar, rader, nivaer, andel, brok }: { aar: number[]; rader: Telling[]; nivaer: Niva[]; andel: boolean; brok: boolean }) {
  const [ref, W] = useBredde<HTMLDivElement>();
  const [hov, setHov] = useState<number | null>(null);
  const smal = W < 520;
  const H = smal ? 220 : 260, mg = { l: 34, r: 8, t: 16, b: 24 };
  const iw = W - mg.l - mg.r, ih = H - mg.t - mg.b, n = aar.length;
  const maks0 = andel ? 100 : Math.max(1, ...rader.map((r) => r.sum)) * 1.06;
  const st = andel ? 25 : maks0 <= 12 ? 2 : maks0 <= 30 ? 5 : maks0 <= 60 ? 10 : 20;
  const ymax = andel ? 100 : Math.ceil(maks0 / st) * st;
  const bw = Math.min(46, iw / n * 0.68);
  const x = (i: number) => mg.l + (i + 0.5) * iw / n;
  const y = (v: number) => mg.t + ih - v / ymax * ih;
  const ticks: number[] = []; for (let t = 0; t <= ymax + 1e-9; t += st) ticks.push(t);
  const flytt = (e: { currentTarget: SVGSVGElement; clientX: number }) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHov(Math.max(0, Math.min(n - 1, Math.floor((e.clientX - r.left - mg.l) / (iw / n)))));
  };
  const d = brok ? 1 : 0;
  const tipVenstre = hov == null ? 0 : x(hov) + bw / 2 + 10 + 200 > W ? Math.max(0, x(hov) - bw / 2 - 210) : x(hov) + bw / 2 + 10;
  return (
    <div ref={ref} className="ajg-graf">
      <svg className="ch hh-stolper" width={W} height={H} role="img" onPointerMove={flytt} onPointerLeave={() => setHov(null)}
        aria-label={`HH NMBUs artikler per år etter AJG-nivå, ${aar[0]}–${aar[n - 1]}${andel ? ', andel' : ''}`}>
        {ticks.map((t) => <g key={t}><line className="gl" x1={mg.l} x2={W - mg.r} y1={y(t)} y2={y(t)} /><text className="ax" x={mg.l - 6} y={y(t) + 4} textAnchor="end">{andel ? `${t} %` : nf(t, 0)}</text></g>)}
        {aar.map((a, i) => {
          const r = rader[i]; let acc = 0;
          return (
            <g key={a} className={hov === i ? 'hov' : undefined}>
              {nivaer.map((k) => {
                const v = andel ? (r.sum ? 100 * r[k] / r.sum : 0) : r[k];
                if (v <= 0) return null;
                const y0 = y(acc), y1 = y(acc + v); acc += v;
                return <rect key={k} className={NIVA_KLASSE[k]} x={x(i) - bw / 2} y={y1} width={bw} height={Math.max(0, y0 - y1 - 1)} />;
              })}
              {!andel && <text className="ax sum" x={x(i)} y={y(r.sum) - 4} textAnchor="middle">{nf(r.sum, d)}</text>}
              {(!smal || i % 2 === 0 || i === n - 1) && <text className="ax" x={x(i)} y={H - 6} textAnchor="middle">{a}</text>}
            </g>
          );
        })}
      </svg>
      {hov != null && (
        <div className="ajg-tip" style={{ left: tipVenstre, width: 200 }}>
          <b>{aar[hov]}</b>
          {nivaer.filter((k) => rader[hov][k] > 0 || k !== '?').map((k) => <div key={k}><i className={NIVA_KLASSE[k]} style={{ borderRadius: 0 }} />{NIVA_NAVN[k]}<span>{nf(rader[hov][k], d)} <small className="muted">({pst(rader[hov][k], rader[hov].sum)})</small></span></div>)}
          <div className="m">Sum<span>{nf(rader[hov].sum, d)}</span></div>
          <div className="m">3+ av alle<span>{pst(rader[hov]['4*'] + rader[hov]['4'] + rader[hov]['3'], rader[hov].sum)}</span></div>
        </div>
      )}
    </div>
  );
}

// ── Fanen ────────────────────────────────────────────────────────────────────
interface Props {
  hh: HhAjgData; aar: [number, number]; v: HhValg; std: HhValg; sett: (v: HhValg) => void;
  /** HH NMBUs ABS/AJG 4*, 4 og 3 fra NHH Research Report 2024 (2020–2024) */ nhh: NhhTall | null | undefined;
  /** år der NHHs tabell er usikker, per nivå */ usikker: Record<string, number[]>; fagNavn: Record<string, string>;
  /** AJGs offisielle engelske navn på fagfeltene */ fagNavnEn: Record<string, string>; generert: string;
}
const SIDE = 50;

export function HhAjgFane({ hh, aar: [y0, yN], v, std, sett, nhh, usikker, fagNavn, fagNavnEn, generert }: Props) {
  const set = (p: Partial<HhValg>) => sett({ ...v, ...p });
  const T = hh.tidsskrift;
  const andelAv = (a: HhArtikkel) => a[7] > 0 ? Math.min(1, a[6] / a[7]) : 1;
  const vekt = (a: HhArtikkel, brok = v.brok) => brok ? andelAv(a) : 1;
  const iGrunnlag = (a: HhArtikkel) => v.alle || a[5] === 1;
  // FWCI og topp 10 % fra OpenAlex (siteringsmålet) finnes når rangeringen er bygd med OpenAlex-cachen
  const harFwci = hh.artikler.some((a) => a[9] != null);
  const harUsjekket = hh.ajgDelvis && hh.artikler.some((a) => nivaAv(T[a[3]]) === '?');
  const nivaer = NIVAER.filter((k) => k !== '?' || harUsjekket);
  const alleAar = aarRekke(y0, yN);
  const periodeTekst = v.fra === v.til ? String(v.fra) : `${v.fra}–${v.til}`;
  const grunnlagTekst = v.alle ? 'alle artikler i NVA' : 'NVI-rapporterte artikler';
  const tellingTekst = v.brok ? 'brøkdelt telling (HHs andel av forfatterne)' : 'hel telling';
  const d = v.brok ? 1 : 0;

  // 1. Tellinger per år
  const tellAar = (aarListe: number[], brok = v.brok, alle = v.alle) => {
    const t = tom(); const s = new Set(aarListe);
    for (const a of hh.artikler) {
      if (!s.has(a[1]) || !(alle || a[5] === 1)) continue;
      const w = vekt(a, brok); t[nivaAv(T[a[3]])] += w; t.sum += w;
    }
    return t;
  };
  const perAar = useMemo(() => alleAar.map((y) => tellAar([y])), [hh, v.brok, v.alle, y0, yN]); // eslint-disable-line react-hooks/exhaustive-deps
  const sumAlle = useMemo(() => tellAar(alleAar), [hh, v.brok, v.alle, y0, yN]); // eslint-disable-line react-hooks/exhaustive-deps
  const sumPeriode = useMemo(() => tellAar(aarRekke(v.fra, v.til)), [hh, v.brok, v.alle, v.fra, v.til]); // eslint-disable-line react-hooks/exhaustive-deps
  const siste3 = useMemo(() => tellAar(aarRekke(yN - 2, yN)), [hh, v.brok, v.alle, yN]); // eslint-disable-line react-hooks/exhaustive-deps
  const p3 = (t: Telling) => t['4*'] + t['4'] + t['3'];
  const p4 = (t: Telling) => t['4*'] + t['4'];
  const iAjg = (t: Telling) => t['4*'] + t['4'] + t['3'] + t['2'] + t['1'];
  const vurdert = (t: Telling) => t.sum - t['?'];
  const beste = alleAar.map((y, i) => ({ y, n: p3(perAar[i]) })).sort((a, b) => b.n - a.n || b.y - a.y)[0];

  // 2. Artikkelliste
  const sok = v.sok.trim().toLowerCase();
  const liste = useMemo(() => hh.artikler
    .filter((a) => a[1] >= v.fra && a[1] <= v.til && iGrunnlag(a))
    .filter((a) => !v.niva.length || v.niva.includes(nivaAv(T[a[3]])))
    .filter((a) => !sok || a[2].toLowerCase().includes(sok) || (T[a[3]]?.[0] ?? '').toLowerCase().includes(sok))
    .sort((a, b) => ORDEN[nivaAv(T[a[3]])] - ORDEN[nivaAv(T[b[3]])] || b[1] - a[1] || a[2].localeCompare(b[2], 'nb')),
  [hh, v.fra, v.til, v.alle, v.niva, sok]); // eslint-disable-line react-hooks/exhaustive-deps
  const iPerioden = hh.artikler.filter((a) => a[1] >= v.fra && a[1] <= v.til && iGrunnlag(a)).length;
  const [vis, setVis] = useState(SIDE);
  useEffect(() => setVis(SIDE), [v.fra, v.til, v.alle, v.niva, sok]);
  const [sokFelt, setSokFelt] = useState(v.sok);
  useEffect(() => setSokFelt(v.sok), [v.sok]);
  useEffect(() => { const t = setTimeout(() => { if (sokFelt !== v.sok) set({ sok: sokFelt }); }, 250); return () => clearTimeout(t); }, [sokFelt]); // eslint-disable-line react-hooks/exhaustive-deps
  const veksleNiva = (k: Niva) => set({ niva: v.niva.includes(k) ? v.niva.filter((x) => x !== k) : [...v.niva, k].sort((a, b) => ORDEN[a] - ORDEN[b]) });
  const listeRef = useRef<HTMLElement>(null);
  const visTidsskrift = (navn: string) => { set({ sok: navn, niva: [] }); setSokFelt(navn); listeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  // 3. Tidsskriftene i perioden, gruppert etter AJG-nivå og -fagfelt
  const [visAlleIkke, setVisAlleIkke] = useState(false);
  const tidsskrift = useMemo(() => {
    const per = new Map<string, { navn: string; niva: Niva; fag: string | null; n: number; w: number; issn: string | null }>();
    for (const a of hh.artikler) {
      if (a[1] < v.fra || a[1] > v.til || !iGrunnlag(a)) continue;
      const t = T[a[3]]; const niva = nivaAv(t);
      // Samme tidsskrift kan stå med flere kanal-id-er; slå sammen på navn og nivå
      const k = `${(t?.[0] ?? '').toLowerCase()}|${niva}`;
      const x = per.get(k) ?? { navn: t?.[0] ?? '(uten tidsskrift)', niva, fag: t?.[2] ?? null, n: 0, w: 0, issn: t?.[3] ?? null };
      x.n += 1; x.w += vekt(a); per.set(k, x);
    }
    const grupper = nivaer.map((niva) => {
      const rader = [...per.values()].filter((x) => x.niva === niva).sort((a, b) => b.w - a.w || a.navn.localeCompare(b.navn, 'nb'));
      const fag = new Map<string, typeof rader>();
      for (const r of rader) { const f = r.fag ?? ''; fag.set(f, [...(fag.get(f) ?? []), r]); }
      const fagListe = [...fag.entries()].map(([f, rr]) => ({ f, rr, w: rr.reduce((s, r) => s + r.w, 0) })).sort((a, b) => b.w - a.w || a.f.localeCompare(b.f));
      return { niva, rader, fagListe, w: rader.reduce((s, r) => s + r.w, 0) };
    }).filter((g) => g.rader.length);
    return grupper;
  }, [hh, v.fra, v.til, v.alle, v.brok]); // eslint-disable-line react-hooks/exhaustive-deps

  // 4. Kontroll mot NHH Research Report 2024 (hel telling, NVI-artikler, som NHH; uavhengig av valgene)
  const NHH_AAR = [2020, 2021, 2022, 2023, 2024];
  const kontroll = NHH_AAR.map((y) => {
    const t = tellAar([y], false, false);
    return { y, niv: (['4*', '4', '3'] as const).map((k) => { const n = nhh?.[String(y)]?.[k]?.n; return { k, vaar: t[k], nhh: n ?? null, usikker: (usikker[k] ?? []).includes(y) }; }) };
  });
  const kontrollSum = (['4*', '4', '3'] as const).map((k, i) => ({ k, vaar: kontroll.reduce((s, r) => s + r.niv[i].vaar, 0), nhh: kontroll.every((r) => r.niv[i].nhh != null) ? kontroll.reduce((s, r) => s + (r.niv[i].nhh ?? 0), 0) : null }));
  const avvik = (vaar: number, n: number | null) => n == null ? '–' : vaar === n ? 'likt' : `${vaar > n ? '+' : '−'}${Math.abs(vaar - n)}`;
  const likeAar = kontroll.filter((r) => r.niv.every((x) => x.nhh != null && x.vaar === x.nhh)).map((r) => r.y);

  // 5. CSV
  const lastNedListe = () => {
    const hode = ['NVA-id', 'Lenke', 'År', 'AJG 2024', 'AJG-fagfelt', 'AJG-fagfelt (engelsk)', 'Tittel', 'Tidsskrift', 'ISSN', 'Norsk nivå', 'NVI-rapportert', 'HH-forfattere', 'Alle forfattere', 'HHs forfatterandel', 'Internasjonal sampublisering', 'FWCI (OpenAlex)', 'Topp 10 % i felt og år (OpenAlex)'];
    const linjer = [hode.join(';'), ...liste.map((a) => {
      const t = T[a[3]]; const n = nivaAv(t);
      return [a[0], hh.nvaUrl + a[0], String(a[1]), n === 'ikke' ? 'ikke på AJG' : n === '?' ? 'ikke sjekket' : n, t?.[2] ? (fagNavn[t[2]] ?? t[2]) : '', t?.[2] ? (fagNavnEn[t[2]] ?? t[2]) : '', esc(a[2]), esc(t?.[0] ?? ''), t?.[3] ?? '',
        a[4] || '', a[5] ? 'ja' : 'nei', String(a[6]), String(a[7]), tallCsv(andelAv(a), 4), a[8] ? 'ja' : 'nei', tallCsv(a[9] ?? null, 2), a[10] == null ? '' : a[10] ? 'ja' : 'nei'].join(';');
    })];
    const filt = [v.niva.length ? 'niva-' + v.niva.map((n) => NIVA_URL[n]).join('-') : '', v.sok.trim() ? 'sok' : ''].filter(Boolean).join('-');
    lastNedCsv(`hh-nmbu-artikler-ajg-${periodeTekst.replace('–', '-')}-${v.alle ? 'alle' : 'nvi'}${filt ? '-' + filt : ''}.csv`, linjer);
  };
  const lastNedTellinger = () => {
    const hode = ['År', 'Grunnlag', 'Telling', ...nivaer.map((k) => NIVA_NAVN[k]), 'Sum', 'Andel i AJG-tidsskrift (%)', 'Andel 3+ av alle (%)', 'Andel 3+ av AJG-artiklene (%)', 'AJG 4+ (4 og 4*)', 'AJG 3+'];
    const rad = (lab: string, t: Telling) => [lab, v.alle ? 'alle i NVA' : 'NVI-rapporterte', v.brok ? 'brøk (forfatterandel)' : 'hel', ...nivaer.map((k) => tallCsv(t[k], v.brok ? 4 : 0)), tallCsv(t.sum, v.brok ? 4 : 0),
      tallCsv(vurdert(t) ? 100 * iAjg(t) / vurdert(t) : null, 1), tallCsv(t.sum ? 100 * p3(t) / t.sum : null, 1), tallCsv(iAjg(t) ? 100 * p3(t) / iAjg(t) : null, 1), tallCsv(p4(t), v.brok ? 4 : 0), tallCsv(p3(t), v.brok ? 4 : 0)].join(';');
    lastNedCsv(`hh-nmbu-ajg-tellinger-${y0}-${yN}-${v.alle ? 'alle' : 'nvi'}-${v.brok ? 'brok' : 'hel'}.csv`,
      [hode.join(';'), ...alleAar.map((y, i) => rad(String(y), perAar[i])), rad(`${y0}-${yN}`, sumAlle)]);
  };

  const standard = JSON.stringify({ ...v, sok: v.sok.trim() }) === JSON.stringify(std);
  const radTabell = (lab: string, t: Telling, cls?: string) => (
    <tr key={lab} className={cls}>
      <td>{lab}</td>
      {nivaer.map((k) => <td key={k} className={tre(k) ? 'hoy' : undefined}>{t[k] ? nf(t[k], d) : <span className="muted">0</span>}</td>)}
      <td><b>{nf(t.sum, d)}</b></td>
      <td>{pst(iAjg(t), vurdert(t))}</td>
      <td>{pst(p3(t), t.sum)}</td>
      <td>{pst(p3(t), iAjg(t))}</td>
    </tr>
  );

  return (
    <div className="skp ajg hh">
      <section className="sheet" aria-label="HH NMBU etter AJG">
        <div>
          <span className="lab">AJG 2024 · Handelshøyskolen ved NMBU · {grunnlagTekst} · {v.brok ? 'brøkdelt' : 'hel'} telling</span>
          <h1>HHs egne artikler etter AJG-nivå</h1>
          <p style={{ maxWidth: '64ch' }}>
            I {yN - 2}–{yN} har HH NMBU <b>{nf(siste3.sum, d)}</b> {v.alle ? 'artikler i NVA' : 'NVI-rapporterte artikler'}. <b>{nf(iAjg(siste3), d)}</b> ({pst(iAjg(siste3), vurdert(siste3))}) står i et tidsskrift på AJG 2024,
            {' '}<b>{nf(p3(siste3), d)}</b> på nivå 3 eller høyere og <b>{nf(p4(siste3), d)}</b> på nivå 4 eller 4*.
            {beste && beste.n > 0 && <> Flest artikler på nivå 3+ kom i <b>{beste.y}</b> ({nf(beste.n, d)}).</>}
          </p>
          <div className="hh-tall">
            {(['4*', '4', '3'] as const).map((k) => <div key={k}><b>{nf(siste3[k], d)}</b><span>AJG {k}, {yN - 2}–{yN}</span></div>)}
            <div><b>{pst(iAjg(siste3), vurdert(siste3))}</b><span>i AJG-tidsskrift</span></div>
          </div>
        </div>
        <div>
          <span className="lab">Valg</span>
          <div className="ajg-valg">
            <div className="ajg-g" role="group" aria-label="Grunnlag"><span className="lab">Grunnlag</span>
              <button type="button" className="seg" aria-pressed={!v.alle} onClick={() => set({ alle: false })} title="Bare artikler rapportert til NVI (samme grunnlag som HK-dir, DBH og NHH-rapporten)">NVI-rapporterte</button>
              <button type="button" className="seg" aria-pressed={v.alle} onClick={() => set({ alle: true })} title="Alle vitenskapelige artikler og oversiktsartikler i NVA med HH-tilknytning, også de som ikke er rapportert til NVI">Alle i NVA</button>
            </div>
            <div className="ajg-g" role="group" aria-label="Telling"><span className="lab">Telling</span>
              <button type="button" className="seg" aria-pressed={!v.brok} onClick={() => set({ brok: false })} title="Hver artikkel teller 1 uansett antall forfattere (som NHH-rapporten)">Hel</button>
              <button type="button" className="seg" aria-pressed={v.brok} onClick={() => set({ brok: true })} title="Hver artikkel teller med HHs andel av forfatterne (HH-forfattere / alle forfattere)">Brøk (forfatterandel)</button>
            </div>
            <label className="ajg-g"><span className="lab">Periode</span>
              <select value={v.fra} onChange={(e) => { const f = Number(e.target.value); set({ fra: f, til: Math.max(f, v.til) }); }} style={{ padding: '5px 8px', minWidth: 0 }} aria-label="Fra år">
                {alleAar.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <span aria-hidden>–</span>
              <select value={v.til} onChange={(e) => { const t = Number(e.target.value); set({ til: t, fra: Math.min(v.fra, t) }); }} style={{ padding: '5px 8px', minWidth: 0 }} aria-label="Til år">
                {alleAar.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            {!standard && <button type="button" className="seg" onClick={() => { sett({ ...std, niva: [] }); setSokFelt(''); }}>Standardvalg</button>}
          </div>
          <p className="cap">Grunnlag og telling gjelder hele fanen unntatt kontrollen (alltid hel telling av NVI-artikler, som NHH). Perioden gjelder artikkellista og tidsskriftene; tellingene per år viser alltid {y0}–{yN}. Lenken husker valgene.</p>
        </div>
      </section>

      <section className="sec" aria-label="Tellinger per år">
        <header>
          <span className="lab">Per år, {y0}–{yN}</span>
          <h2>Artikler per AJG-nivå</h2>
          <p className="muted">{grunnlagTekst.charAt(0).toUpperCase() + grunnlagTekst.slice(1)}, {tellingTekst}. Grått er tidsskrift som ikke står på AJG 2024. Pek på en stolpe for tallene.</p>
        </header>
        <div className="cmprow" role="group" aria-label="Visning av stolpene">
          <button type="button" className="seg" aria-pressed={!v.andel} onClick={() => set({ andel: false })}>Antall</button>
          <button type="button" className="seg" aria-pressed={v.andel} onClick={() => set({ andel: true })}>Andel</button>
          <span style={{ marginLeft: 'auto' }} />
          <button type="button" className="seg" onClick={lastNedTellinger} title="Tellingene per år og nivå med valgene over (semikolon, desimalkomma)"><Download className="w-3.5 h-3.5" style={{ display: 'inline', verticalAlign: -2, marginRight: 5 }} />Tellinger (CSV)</button>
        </div>
        <div className="ajg-leg">{nivaer.map((k) => <span key={k}><i className={NIVA_KLASSE[k]} />{NIVA_NAVN[k]}</span>)}</div>
        <Stolper aar={alleAar} rader={perAar} nivaer={nivaer} andel={v.andel} brok={v.brok} />
        <div className="scroll">
          <table className="hh-tab">
            <thead>
              <tr>
                <th>År</th>
                {nivaer.map((k) => <th key={k} title={NIVA_NAVN[k]}>{NIVA_KORT[k]}</th>)}
                <th>Sum</th>
                <th title="Andel av artiklene som står i et tidsskrift på AJG 2024">I AJG</th>
                <th title="Andel av alle artiklene som er på AJG nivå 3, 4 eller 4*">3+ av alle</th>
                <th title="Andel av artiklene i AJG-tidsskrift som er på nivå 3, 4 eller 4*">3+ av AJG</th>
              </tr>
            </thead>
            <tbody>
              {alleAar.map((y, i) => radTabell(String(y), perAar[i])).reverse()}
              {(v.fra !== y0 || v.til !== yN) && radTabell(`Sum ${periodeTekst}`, sumPeriode, 'sum')}
              {radTabell(`Sum ${y0}–${yN}`, sumAlle, 'sum')}
            </tbody>
          </table>
        </div>
        <p className="cap">«I AJG» = andel av artiklene i et tidsskrift på AJG 2024{harUsjekket ? ' (av de sjekkede)' : ''}. «3+ av alle» = andel av alle artiklene på nivå 3, 4 eller 4*. «3+ av AJG» = andel av artiklene i AJG-tidsskrift. {v.brok ? 'Brøkdelt: hver artikkel teller med HH-forfattere delt på alle forfattere.' : 'Hel telling: hver artikkel teller 1.'}</p>
      </section>

      <section className="sec" aria-label="Artikkelliste" ref={listeRef}>
        <header>
          <span className="lab">Artiklene, {periodeTekst}</span>
          <h2>Artikkelliste</h2>
          <p className="muted">Sortert fra AJG 4* og nedover, så nyeste først. Tittelen lenker til artikkelen i NVA. Ingen forfatternavn er lagret; «HH / alle» er antall forfattere med HH-tilknytning av alle forfatterne.</p>
        </header>
        <div className="hh-filter">
          <div className="cmprow" role="group" aria-label="AJG-nivå">
            <button type="button" className="seg" aria-pressed={!v.niva.length} onClick={() => set({ niva: [] })}>Alle nivå</button>
            {nivaer.map((k) => <button key={k} type="button" className="seg" aria-pressed={v.niva.includes(k)} onClick={() => veksleNiva(k)}><i className={`hh-sw ${NIVA_KLASSE[k]}`} />{NIVA_KORT[k]}</button>)}
          </div>
          <label className="hh-sok"><span className="lab">Søk i tittel eller tidsskrift</span>
            <input type="search" value={sokFelt} onChange={(e) => setSokFelt(e.target.value)} placeholder="for eksempel Ecological Economics" />
          </label>
        </div>
        <div className="hh-verktoy">
          <span className="muted">Viser {liste.length === iPerioden ? `alle ${liste.length}` : `${liste.length} av ${iPerioden}`} {v.alle ? 'artikler i NVA' : 'NVI-artikler'} i {periodeTekst}.</span>
          <button type="button" className="seg" onClick={lastNedListe} disabled={!liste.length} title="Artiklene i lista (med filtrene) som CSV med AJG-nivå, fagfelt, norsk nivå og forfatterandel. Intern bruk etter avtalen med Chartered ABS."><Download className="w-3.5 h-3.5" style={{ display: 'inline', verticalAlign: -2, marginRight: 5 }} />Artikkellista (CSV)</button>
        </div>
        {liste.length === 0 ? <p className="muted">Ingen artikler med disse filtrene.</p> : (
          <>
            <table className="hh-art">
              <thead>
                <tr><th>År</th><th>AJG</th><th>Tittel</th><th>Tidsskrift</th><th title="Norsk nivå (publiseringsindikatoren)">Norsk nivå</th><th title="Forfattere med HH-tilknytning av alle forfatterne">HH / alle</th><th title="Internasjonal sampublisering: minst én medforfatter med utenlandsk tilknytning">Intl.</th>{harFwci && <th title="Field-Weighted Citation Impact fra OpenAlex (1,0 = verdenssnittet for fagfelt og år). ★ = blant de 10 % mest siterte i felt og år. – = ikke funnet i OpenAlex. Ferske år er foreløpige.">FWCI</th>}</tr>
              </thead>
              <tbody>
                {liste.slice(0, vis).map((a) => {
                  const t = T[a[3]]; const n = nivaAv(t);
                  return (
                    <tr key={a[0]} className={tre(n) ? 'hoy' : undefined}>
                      <td className="aar">{a[1]}</td>
                      <td className="niv" title={t?.[2] ? `${NIVA_NAVN[n]} · ${fagNavn[t[2]] ?? t[2]}${fagNavnEn[t[2]] ? ` (${fagNavnEn[t[2]]})` : ''}` : NIVA_NAVN[n]}><i className={`hh-sw ${NIVA_KLASSE[n]}`} />{n === 'ikke' ? '–' : n === '?' ? '?' : n}</td>
                      <td className="tit">
                        <a href={hh.nvaUrl + encodeURIComponent(a[0])} target="_blank" rel="noopener noreferrer">{a[2] || '(uten tittel)'}<ExternalLink className="w-3 h-3" style={{ display: 'inline', verticalAlign: -1, marginLeft: 4, opacity: .6 }} /></a>
                        {!a[5] && <span className="ikkenvi" title="Ikke rapportert til NVI">ikke NVI</span>}
                      </td>
                      <td className="tids">
                        <button type="button" className="tids" onClick={() => visTidsskrift(t?.[0] ?? '')} title="Vis alle HH-artiklene i dette tidsskriftet">{t?.[0] ?? '(uten tidsskrift)'}</button>
                        {t?.[2] ? <small title={fagNavnEn[t[2]]}>{fagNavn[t[2]] ?? t[2]}</small> : null}
                      </td>
                      <td className="nn" data-l="Norsk nivå">{a[4] ? a[4] : '–'}</td>
                      <td className="ha" data-l="HH / alle">{a[6]} / {a[7]}</td>
                      <td className="in" data-l="Intl.">{a[8] ? 'Ja' : '–'}</td>
                      {harFwci && <td className="fw" data-l="FWCI" title={a[10] ? 'Blant de 10 % mest siterte i fagfelt og år (OpenAlex)' : undefined}>{a[9] == null ? '–' : nf(a[9], 2)}{a[10] ? ' ★' : ''}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {liste.length > vis && <div><button type="button" className="seg" onClick={() => setVis(vis + 100)}>Vis flere ({liste.length - vis} til)</button> <button type="button" className="seg" onClick={() => setVis(liste.length)}>Vis alle</button></div>}
          </>
        )}
        <p className="cap">Kolonnene: år, AJG 2024-nivå (– = ikke på AJG), tittel med lenke til NVA, tidsskrift og AJG-fagfelt, norsk nivå, HH-forfattere av alle forfattere og internasjonal sampublisering (minst én utenlandsk medforfatter){harFwci ? ', og FWCI fra OpenAlex (★ = blant de 10 % mest siterte i fagfelt og år; se fanen «Siteringer»)' : ''}. Klikk på et tidsskrift for å se alle HH-artiklene der.</p>
      </section>

      <section className="sec" aria-label="Tidsskriftene">
        <header>
          <span className="lab">Tidsskriftene, {periodeTekst}</span>
          <h2>Hvor HH publiserer, etter AJG-nivå og fagfelt</h2>
          <p className="muted">Antall HH-artikler per tidsskrift{v.brok ? ' (sum forfatterandeler)' : ''}, {grunnlagTekst}. Innen hvert nivå er tidsskriftene gruppert etter AJG-fagfelt. Klikk på et tidsskrift for å filtrere artikkellista.</p>
        </header>
        <div className="hh-tids">
          {tidsskrift.map((g) => {
            const ikke = g.niva === 'ikke' || g.niva === '?';
            const rader = ikke && !visAlleIkke ? g.rader.slice(0, 20) : g.rader;
            return (
              <details key={g.niva} open={tre(g.niva) || undefined} className="hh-gr">
                <summary><i className={`hh-sw ${NIVA_KLASSE[g.niva]}`} /><b>{NIVA_NAVN[g.niva]}</b><span className="muted"> · {g.rader.length} tidsskrift · {nf(g.w, d)} artikler</span></summary>
                <div className="scroll">
                  <table className="hh-tt">
                    <tbody>
                      {ikke ? rader.map((r) => (
                        <tr key={r.navn}><td><button type="button" className="tids" onClick={() => visTidsskrift(r.navn)}>{r.navn}</button></td><td>{nf(r.w, r.w > 0 && r.w < 0.05 ? 2 : d)}</td></tr>
                      )) : g.fagListe.map((f) => (
                        <Fragment key={f.f}>
                          <tr className="gh"><td>{f.f ? (fagNavn[f.f] ?? f.f) : 'Uten fagfelt'}{f.f && fagNavnEn[f.f] ? <span className="en" lang="en"> · {fagNavnEn[f.f]}</span> : null}</td><td>{nf(f.w, d)}</td></tr>
                          {f.rr.map((r) => <tr key={r.navn}><td><button type="button" className="tids" onClick={() => visTidsskrift(r.navn)}>{r.navn}</button></td><td>{nf(r.w, r.w > 0 && r.w < 0.05 ? 2 : d)}</td></tr>)}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
                {ikke && g.rader.length > 20 && <button type="button" className="seg" style={{ marginTop: 6 }} onClick={() => setVisAlleIkke(!visAlleIkke)}>{visAlleIkke ? 'Vis de 20 største' : `Vis alle ${g.rader.length}`}</button>}
              </details>
            );
          })}
        </div>
        <p className="cap">Fagfeltene er AJGs egen inndeling av tidsskriftene. Et tidsskrift som har byttet navn eller kanal-id i NVA, kan stå to ganger.</p>
      </section>

      <section className="sec" aria-label="Kontroll mot NHH-rapporten">
        <header>
          <span className="lab">Kontroll</span>
          <h2>HHs AJG 4*, 4 og 3 mot NHH Research Report 2024</h2>
          <p className="muted">NHHs forskningsrapport oppgir antall artikler på ABS/AJG 4*, 4 og 3 for HH NMBU 2020–2024. Våre tall er hel telling av NVI-rapporterte artikler med AJG 2024 for alle år, uavhengig av valgene over.{likeAar.length ? ` Identisk i ${likeAar.join(', ').replace(/, (\d+)$/, ' og $1')}.` : ''}</p>
        </header>
        <div className="scroll">
          <table className="ajg-val">
            <thead>
              <tr><th rowSpan={2}>År</th>{(['4*', '4', '3'] as const).map((k) => <th key={k} colSpan={3} className="gr">AJG {k}</th>)}</tr>
              <tr>{(['4*', '4', '3'] as const).map((k) => <Fragment key={k}><th>Vår</th><th>NHH</th><th>Avvik</th></Fragment>)}</tr>
            </thead>
            <tbody>
              {kontroll.map((r) => (
                <tr key={r.y}>
                  <td>{r.y}</td>
                  {r.niv.map((x) => <Fragment key={x.k}><td>{nf(x.vaar, 0)}</td><td>{x.nhh == null ? '–' : nf(x.nhh, 0)}{x.usikker ? '†' : ''}</td>
                    <td className={x.nhh != null && x.vaar !== x.nhh ? 'stor' : 'muted'}>{avvik(x.vaar, x.nhh)}</td></Fragment>)}
                </tr>
              ))}
              <tr className="sum"><td title="Sum 2020–2024">Sum</td>{kontrollSum.map((x) => <Fragment key={x.k}><td>{nf(x.vaar, 0)}</td><td>{x.nhh == null ? '–' : nf(x.nhh, 0)}</td><td>{avvik(x.vaar, x.nhh)}</td></Fragment>)}</tr>
            </tbody>
          </table>
        </div>
        <ul className="hh-forkl">
          <li><b>2022, nivå 3{(() => { const r = kontroll.find((x) => x.y === 2022)?.niv[2]; return r && r.nhh != null ? ` (${r.vaar} mot ${r.nhh})` : ''; })()}.</b> Kjent feil i NHHs tabell (†): nivå 3-tallet for 2022 gjentar 2020-tallet for nesten alle skolene (også UiA, Nord og UiS). Vårt tall står seg.</li>
          <li><b>2024, nivå 3{(() => { const r = kontroll.find((x) => x.y === 2024)?.niv[2]; return r && r.nhh != null ? ` (${r.vaar} mot ${r.nhh})` : ''; })()}.</b> Lar seg ikke gjenskape. Sjekket og utelukket: NVI-periode ulik publiseringsår, artikler ved andre NMBU-enheter med HH-forfattere, andre publikasjonstyper i AJG-tidsskrift, AJG 2021 i stedet for 2024 (gir samme tall) og ISSN-avvik. Grunnlaget er det samme som i DBH (71 publikasjoner = 66 artikler + 5 kapitler). Trolig ulikt uttrekk eller tidspunkt hos NHH; kan avklares ved å be NHH om artikkellista.</li>
          {likeAar.length > 0 && <li><b>Andre år.</b> {likeAar.join(', ').replace(/, (\d+)$/, ' og $1')} er identiske med NHH-rapporten, selv om NHH trolig brukte AJG-versjonen som gjaldt da, mens vi bruker AJG 2024 for alle år.</li>}
        </ul>
        <p className="cap">Gjennomgangen med artikkellister per år ligger i data/rangering/kontroll/ajg-gjennomgang/nmbu.md (lokalt, ikke i repoet), laget av scripts/rangering/ajg_gjennomgang.py.</p>
      </section>

      <section className="sec ajg-metode" aria-label="Merknad">
        <span className="lab">Grunnlag og forbehold</span>
        <ul>
          <li><b>Grunnlag.</b> Vitenskapelige artikler og oversiktsartikler i NVA med minst én forfatter tilknyttet Handelshøyskolen ved NMBU (NVA-enhet 192.11.0.0, inkludert underenheten 192.11.1.0 Skatteforsk), {y0}–{yN}. Standard er bare artikler rapportert til NVI (samme grunnlag som HK-dir, DBH og NHH-rapporten); «Alle i NVA» tar også med de som ikke er rapportert. Forfatternavn er ikke lagret.</li>
          <li><b>AJG.</b> Chartered ABS Academic Journal Guide 2024, koblet på ISSN og eISSN. AJG 2024 er brukt for alle år, også før 2024, så tidsskrift som har gått opp eller ned siden tidligere utgaver, får 2024-nivået. Tidsskrift utenfor AJG er «ikke på AJG», og mange av HHs tidsskrift innen naturressurs-, miljø- og landbruksøkonomi og norske tidsskrift står ikke på lista.</li>
          <li><b>Telling.</b> Hel telling: artikkelen teller 1. Brøkdelt: artikkelen teller med HHs andel av forfatterne (HH-forfattere delt på alle forfattere).</li>
          <li><b>Bruk.</b> AJG-nivå per tidsskrift er lisensbelagt og brukes her internt etter avtale med Chartered ABS (oktober 2026), bare bak passord. Chartered ABS ber om at guiden ikke brukes til å vurdere enkeltpersoner. Fanen og artikkellista fjernes sammen med AJG-lista når avtalen går ut (slett ajg2024.csv og bygg rangeringen på nytt).</li>
          <li><b>Data.</b> {hh.merknad} Bygd {generert}. NVA-data for siste år kan bli supplert.</li>
        </ul>
      </section>
    </div>
  );
}
