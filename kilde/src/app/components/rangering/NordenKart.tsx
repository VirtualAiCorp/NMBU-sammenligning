import { useEffect, useMemo, useRef, useState } from 'react';
import geo from './norden-kart.json';

/**
 * Fanen «Kart» i den interne rangeringen (07.10.2026): handelshøyskolenes publisering på et nordisk kart.
 * Kartgrunnlaget er Natural Earth 1:50m (offentlig eiendom) via world-atlas (ISC), klippet og forenklet av
 * scripts/rangering/lag_nordenkart.py og tegnet som innebygd SVG: ingen kartfliser og ingen kall til tredjeparter.
 * Tallene for Norge regnes i Handelshoyskolerangering.tsx (samme beregning som AJG-sammenligningen); Danmark, Sverige og
 * Finland er foreløpige anslag fra data/rangering/norden/*.json (krypterte rangeringsdata).
 */

export type KartMaal = 'p4' | 'p3' | 'fwci' | 't10' | 'poeng' | 'plass';
export type KartVis = 'norden' | 'sor' | 'oslo' | 'oresund' | 'ost';
/** uff = med stipendiater/doktorander (HK-dir UN1 + UN2, standard); utenStip = uten (NHHs nevner, svensk «forskande och undervisande») */
export type KartNevner = 'uff' | 'utenStip';
export interface KartValg { maal: KartMaal; fra: number; til: number; anslag: boolean; ref: boolean; vis: KartVis; valgt: string | null; nevner: KartNevner; }
export interface KartEnhet {
  id: string; navn: string; kort: string; land: 'NO' | 'DK' | 'SE' | 'FI'; landNavn: string; by: string; lat: number; lon: number;
  referanse: boolean; meg: boolean; /** foreløpig tall fra en utforskningsrapport (ikke NVA/DBH) */ anslag: boolean;
  fra: number; til: number; /** perioden avviker fra den valgte (andre land har bare enkelte perioder) */ annenPeriode: boolean;
  artikler: number | null; n4: number | null; n3: number | null; p4: number | null; p3: number | null;
  /** Siteringer (OpenAlex): snitt FWCI, topp 10 %-artikler per 100 årsverk og år, antall topp 10 %, artikler i OpenAlex,
   *  og om nevneren for topp 10 % er fra en annen periode (andre land) */
  fwci?: number | null; t10?: number | null; t10n?: number | null; sitArtikler?: number | null; sitNevnerAnnen?: boolean; sitReserve?: boolean;
  /** nevner per år i perioden (årsverk) */ arsverk: number | null; poeng: number | null; plass: number | null; plassAv: number | null;
  avgrensning: string; nevner: string; kilde: string; forbehold: string[]; akk: string[]; ekstra: [string, string][];
  /** nevneren med stipendiater/doktorander mangler, så tallene er regnet uten (vises med «‡») */ reserveNevner?: boolean;
}

const nf = (v: number | null | undefined, d = 1) => v == null || !Number.isFinite(v) ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });

// ── Mål og fargeskala (fem klasser, faste grenser så fargene ikke flytter seg med utvalget) ───────────────────
export const KART_MAAL: Record<KartMaal, { navn: string; kort: string; grenser: number[]; d: number; lavBest?: boolean; bareNorge?: boolean; /** siteringsmål (OpenAlex) */ sit?: boolean; title: string; setning: string }> = {
  p4: { navn: 'AJG 4/4* per 100 faglige årsverk og år', kort: 'AJG 4+ per 100 årsverk', grenser: [3, 6, 10, 15], d: 1, setning: 'AJG 4/4* per 100 faglige årsverk og år',
    title: 'Artikler i tidsskrift på AJG 2024 nivå 4 eller 4* per 100 faglige årsverk og år (Norge: HK-dirs nevner UN1 + UN2)' },
  p3: { navn: 'AJG 3+ per 100 faglige årsverk og år', kort: 'AJG 3+ per 100 årsverk', grenser: [15, 25, 35, 45], d: 1, setning: 'AJG 3+ per 100 faglige årsverk og år',
    title: 'Artikler i tidsskrift på AJG 2024 nivå 3, 4 eller 4* per 100 faglige årsverk og år' },
  // Siteringsmål fra OpenAlex (fanen «Siteringer»): samme kilde for alle land, uavhengig av tidsskriftlister
  fwci: { navn: 'Snitt FWCI (OpenAlex)', kort: 'Snitt FWCI', grenser: [3, 4, 5, 6.5], d: 2, setning: 'snitt FWCI (siteringer normalisert for fagfelt og år i OpenAlex)', sit: true,
    title: 'Field-Weighted Citation Impact fra OpenAlex: siteringer delt på forventet antall for verk i samme fagfelt, år og type. 1,0 = snittet for alle verk i OpenAlex, så nivået er høyt for alle enhetene. Snitt over artiklene i perioden.' },
  t10: { navn: 'Topp 10 % mest siterte per 100 faglige årsverk og år (OpenAlex)', kort: 'Topp 10 % per 100 årsverk', grenser: [20, 30, 45, 65], d: 1, setning: 'artikler blant de 10 % mest siterte i fagfelt og år per 100 faglige årsverk og år', sit: true,
    title: 'Artikler blant de 10 % mest siterte i sitt fagfelt og år (OpenAlex) per 100 faglige årsverk og år' },
  poeng: { navn: 'Publiseringspoeng per faglig årsverk (bare Norge)', kort: 'Poeng per årsverk', grenser: [0.5, 0.8, 1.1, 1.4], d: 2, bareNorge: true, setning: 'publiseringspoeng per faglig årsverk (bare Norge)',
    title: 'Publiseringspoeng (DBH 373) per faglig årsverk (UN1 + UN2, DBH 225), snitt i perioden. Finnes bare for Norge.' },
  plass: { navn: 'Plass i den norske rangeringen', kort: 'Plass i rangeringen', grenser: [3.5, 6.5, 9.5, 12.5], d: 0, lavBest: true, bareNorge: true, setning: 'plassen i den norske rangeringen (mørkest = best)',
    title: 'Plass i den samlede norske rangeringen med vektene som er valgt i fanen «Rangering og vekter»' },
};
export const KART_MAAL_IDER = Object.keys(KART_MAAL) as KartMaal[];
export const KART_VIS: Record<KartVis, { navn: string; boks: [number, number, number, number] }> = {
  norden: { navn: 'Norden', boks: [4.2, 54.4, 31.6, 71.3] },
  sor: { navn: 'Sør-Norge', boks: [4.6, 57.8, 12.2, 61.6] },
  oslo: { navn: 'Oslofjorden', boks: [9.7, 58.95, 11.75, 60.1] },
  oresund: { navn: 'Danmark og Skåne', boks: [8.0, 54.6, 14.4, 57.9] },
  ost: { navn: 'Stockholm–Helsingfors', boks: [16.8, 58.9, 29.0, 63.6] },
};
export const KART_VIS_IDER = Object.keys(KART_VIS) as KartVis[];
const LAND_NAVN: Record<string, string> = { NO: 'Norge', SE: 'Sverige', DK: 'Danmark', FI: 'Finland' };
const LAND_ETIKETT: Record<string, [number, number]> = { NO: [8.6, 62.2], SE: [15.2, 63.6], FI: [26.6, 64.3], DK: [7.2, 56.9] };

function klasse(m: KartMaal, v: number | null): number | null {
  if (v == null || !Number.isFinite(v)) return null;
  const g = KART_MAAL[m].grenser;
  const k = g.filter((x) => v >= x).length; // 0–4, høyere = mer
  return KART_MAAL[m].lavBest ? 4 - k : k;
}
function klasseTekst(m: KartMaal, k: number) {
  const g = KART_MAAL[m].grenser, d = KART_MAAL[m].d;
  if (m === 'plass') return ['13 og lavere', '10–12', '7–9', '4–6', '1–3'][k];
  if (k === 0) return `under ${nf(g[0], d)}`;
  if (k === 4) return `${nf(g[3], d)} eller mer`;
  return `${nf(g[k - 1], d)}–${nf(g[k], d)}`;
}
export const verdiAv = (e: KartEnhet, m: KartMaal) => m === 'p4' ? e.p4 : m === 'p3' ? e.p3 : m === 'fwci' ? e.fwci ?? null : m === 't10' ? e.t10 ?? null : m === 'poeng' ? e.poeng : e.plass;
export function fmtMaal(m: KartMaal, v: number | null) { return v == null ? '–' : m === 'plass' ? `nr. ${v}` : nf(v, KART_MAAL[m].d); }

// ── Projeksjon: Lamberts flatriktige asimutale, sentrert i Norden ────────────────────────────────────────────
const R = Math.PI / 180, L0 = 15 * R, F0 = 62 * R;
function proj(lon: number, lat: number): [number, number] {
  const l = lon * R - L0, f = lat * R;
  const k = Math.sqrt(2 / (1 + Math.sin(F0) * Math.sin(f) + Math.cos(F0) * Math.cos(f) * Math.cos(l)));
  return [k * Math.cos(f) * Math.sin(l) * 1000, -k * (Math.cos(F0) * Math.sin(f) - Math.sin(F0) * Math.cos(f) * Math.cos(l)) * 1000];
}
interface Geo { features: { properties: { land: string; rolle: 'fokus' | 'nabo' }; geometry: { coordinates: number[][][][] } }[] }
const STIER = (geo as unknown as Geo).features.map((f) => ({
  land: f.properties.land, rolle: f.properties.rolle,
  d: f.geometry.coordinates.map((poly) => poly.map((ring) => ring.map(([lo, la], i) => { const [x, y] = proj(lo, la); return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; }).join('') + 'Z').join('')).join(''),
}));
function boksProj([lo0, la0, lo1, la1]: [number, number, number, number]) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 8; i++) { const lo = lo0 + (lo1 - lo0) * i / 8, la = la0 + (la1 - la0) * i / 8; pts.push(proj(lo, la0), proj(lo, la1), proj(lo0, la), proj(lo1, la)); }
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

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

// ── Kartet ─────────────────────────────────────────────────────────────────────────────────────────────────
interface Plassert { e: KartEnhet; ox: number; oy: number; x: number; y: number; r: number; k: number | null; }
function Kart({ enheter, v, sett, maksPerAar }: { enheter: KartEnhet[]; v: KartValg; sett: (p: Partial<KartValg>) => void; maksPerAar: number }) {
  const [ref, W] = useBredde<HTMLDivElement>();
  const [hov, setHov] = useState<string | null>(null);
  const b = boksProj(KART_VIS[v.vis].boks);
  const dx = b.x1 - b.x0, dy = b.y1 - b.y0;
  const H = Math.round(Math.min(760, Math.max(W * 0.62, Math.min(W * 1.25, W * dy / dx))));
  const s = Math.min(W / dx, H / dy);
  const tx = (W - dx * s) / 2 - b.x0 * s, ty = (H - dy * s) / 2 - b.y0 * s;
  const smal = W < 520;
  const rMaks = smal ? 17 : 24, rMin = smal ? 3.5 : 4;
  const radius = (e: KartEnhet) => { const n = e.artikler != null ? e.artikler / (e.til - e.fra + 1) : null; return n == null ? rMin : Math.max(rMin, rMaks * Math.sqrt(n / maksPerAar)); };

  // Spre enheter som ligger oppå hverandre (samme by): skyv sirklene fra hverandre og trekk en strek til byen.
  const plassert = useMemo<Plassert[]>(() => {
    const ps = enheter.map((e) => { const [px, py] = proj(e.lon, e.lat); const x = px * s + tx, y = py * s + ty; return { e, ox: x, oy: y, x, y, r: radius(e), k: klasse(v.maal, verdiAv(e, v.maal)) }; });
    const gap = 2;
    for (let it = 0; it < 160; it++) {
      let flyttet = false;
      for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i], c = ps[j];
        let ddx = c.x - a.x, ddy = c.y - a.y; let d = Math.hypot(ddx, ddy);
        const min = a.r + c.r + gap;
        if (d >= min) continue;
        if (d < 0.01) { const vink = (i * 2.399 + j * 0.7) % (2 * Math.PI); ddx = Math.cos(vink); ddy = Math.sin(vink); d = 1; }
        const push = (min - d) / 2;
        a.x -= ddx / d * push; a.y -= ddy / d * push; c.x += ddx / d * push; c.y += ddy / d * push; flyttet = true;
      }
      for (const p of ps) { p.x += (p.ox - p.x) * 0.03; p.y += (p.oy - p.y) * 0.03; }
      if (!flyttet && it > 10) break;
    }
    return ps.sort((a, c) => c.r - a.r);
  }, [enheter, s, tx, ty, v.maal, maksPerAar, smal]); // eslint-disable-line react-hooks/exhaustive-deps

  const synlig = (p: Plassert) => p.x > -40 && p.x < W + 40 && p.y > -40 && p.y < H + 40;
  const zoom = v.vis !== 'norden';
  const vis = plassert.filter(synlig);
  const etikett = (p: Plassert) => zoom || p.e.id === v.valgt || p.e.meg || p.r >= (smal ? 13 : 15);
  // Etiketten til høyre for sirkelen, eller til venstre/over hvis den ellers dekker en annen sirkel
  const etikettPos = (p: Plassert): { x: number; y: number; a: 'start' | 'end' | 'middle' } => {
    const bw = p.e.kort.length * 7.2, bh = 12;
    const treff = (x0: number, y0: number) => vis.filter((q) => q !== p && q.x + q.r > x0 && q.x - q.r < x0 + bw && q.y + q.r > y0 && q.y - q.r < y0 + bh).length;
    const kand: { x: number; y: number; a: 'start' | 'end' | 'middle'; bx: number; by: number }[] = [
      { x: p.x + p.r + 3, y: p.y + 4, a: 'start', bx: p.x + p.r + 3, by: p.y - 6 },
      { x: p.x - p.r - 3, y: p.y + 4, a: 'end', bx: p.x - p.r - 3 - bw, by: p.y - 6 },
      { x: p.x, y: p.y - p.r - 4, a: 'middle', bx: p.x - bw / 2, by: p.y - p.r - 15 },
      { x: p.x, y: p.y + p.r + 12, a: 'middle', bx: p.x - bw / 2, by: p.y + p.r + 2 },
    ];
    const inne = kand.filter((c) => c.bx >= 0 && c.bx + bw <= W);
    const k = inne.find((c) => !treff(c.bx, c.by)) ?? [...inne].sort((a, b) => treff(a.bx, a.by) - treff(b.bx, b.by))[0] ?? kand[0];
    return { x: k.x, y: k.y, a: k.a };
  };
  const h = plassert.find((p) => p.e.id === (hov ?? ''));
  const tipVenstre = h ? (h.x + h.r + 10 + 230 > W ? Math.max(4, h.x - h.r - 240) : h.x + h.r + 10) : 0;
  const tipTopp = h ? Math.max(4, Math.min(H - 150, h.y - 30)) : 0;
  return (
    <div ref={ref} className="kart-flate" style={{ height: H }}>
      <svg width={W} height={H} role="group" aria-label={`Kart over ${KART_VIS[v.vis].navn} med handelshøyskolene som sirkler. Tallene står også i tabellen under kartet.`}
        onClick={(e) => { if (e.target === e.currentTarget) sett({ valgt: null }); }}>
        <defs>
          <pattern id="kart-skravur" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="5" className="kart-skr" />
          </pattern>
          <clipPath id="kart-klipp"><rect x="0" y="0" width={W} height={H} /></clipPath>
        </defs>
        <rect x="0" y="0" width={W} height={H} className="kart-hav" onClick={() => sett({ valgt: null })} />
        <g clipPath="url(#kart-klipp)">
          <g transform={`translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(5)})`}>
            {STIER.map((st) => <path key={st.land + st.rolle} d={st.d} className={`kart-land ${st.rolle}`} vectorEffect="non-scaling-stroke" />)}
          </g>
          {!zoom && Object.entries(LAND_ETIKETT).map(([k, [lo, la]]) => { const [px, py] = proj(lo, la); return <text key={k} className="kart-landnavn" x={px * s + tx} y={py * s + ty} textAnchor="middle">{LAND_NAVN[k]}</text>; })}
          {vis.filter((p) => Math.hypot(p.x - p.ox, p.y - p.oy) > p.r * 0.6).map((p) => (
            <g key={'l' + p.e.id} className="kart-leder"><line x1={p.ox} y1={p.oy} x2={p.x} y2={p.y} /><circle cx={p.ox} cy={p.oy} r={1.8} /></g>
          ))}
          {vis.map((p) => {
            const e = p.e, val = verdiAv(e, v.maal);
            const lab = `${e.kort}, ${e.landNavn}: ${val == null ? 'ingen verdi for ' + KART_MAAL[v.maal].kort.toLowerCase() : fmtMaal(v.maal, val) + ' ' + (v.maal === 'plass' ? 'i rangeringen' : KART_MAAL[v.maal].kort.toLowerCase())}${e.anslag ? ' (anslag)' : ''}`;
            return (
              <g key={e.id} className={`kart-enhet${e.id === v.valgt ? ' valgt' : ''}${e.meg ? ' meg' : ''}${e.anslag ? ' anslag' : ''}`} role="button" tabIndex={0} aria-label={lab} aria-pressed={e.id === v.valgt}
                onPointerEnter={() => setHov(e.id)} onPointerLeave={() => setHov((x) => x === e.id ? null : x)} onFocus={() => setHov(e.id)} onBlur={() => setHov(null)}
                onClick={() => sett({ valgt: e.id === v.valgt ? null : e.id })} onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); sett({ valgt: e.id === v.valgt ? null : e.id }); } }}>
                <circle cx={p.x} cy={p.y} r={Math.max(p.r, 10)} className="kart-treff" />
                <circle cx={p.x} cy={p.y} r={p.r} className={`kart-sirkel ${p.k == null ? 'tom' : 'c' + p.k}`} />
                {e.anslag && p.k != null && <circle cx={p.x} cy={p.y} r={p.r} fill="url(#kart-skravur)" className="kart-skr-flate" />}
              </g>
            );
          })}
          {vis.filter((p) => etikett(p) && p.x >= 0 && p.x <= W && p.y >= 0 && p.y <= H).map((p) => { const ep = etikettPos(p); return <text key={'e' + p.e.id} className="kart-etikett" x={ep.x} y={ep.y} textAnchor={ep.a}>{p.e.kort}</text>; })}
        </g>
      </svg>
      {h && (
        <div className="kart-tip" style={{ left: tipVenstre, top: tipTopp }} role="tooltip">
          <b>{h.e.navn}</b>
          <span className="muted">{h.e.by}, {h.e.landNavn}{h.e.anslag ? ' · anslag' : ''}{h.e.referanse ? ' · referanse' : ''}</span>
          <div><span>{KART_MAAL[v.maal].kort}</span><b>{fmtMaal(v.maal, verdiAv(h.e, v.maal))}</b></div>
          <div><span>Artikler {h.e.fra === h.e.til ? h.e.fra : `${h.e.fra}–${h.e.til}`}</span><b>{nf(h.e.artikler, 0)}</b></div>
          {v.maal !== 'p4' && !KART_MAAL[v.maal].sit && <div><span>AJG 4+ per 100 årsverk</span><b>{nf(h.e.p4, 1)}</b></div>}
          {KART_MAAL[v.maal].sit && <div><span>{v.maal === 'fwci' ? 'Topp 10 % per 100 årsverk' : 'Snitt FWCI'}</span><b>{v.maal === 'fwci' ? nf(h.e.t10, 1) : nf(h.e.fwci, 2)}</b></div>}
          {KART_MAAL[v.maal].sit && h.e.sitNevnerAnnen && v.maal === 't10' && <span className="muted">* Nevner fra en annen periode</span>}
          {h.e.annenPeriode && <span className="muted">Annen periode enn valgt</span>}
          {h.e.reserveNevner && <span className="muted">‡ Regnet uten stipendiater (tallet med finnes ikke)</span>}
          <span className="muted">Klikk for detaljer, kilde og forbehold</span>
        </div>
      )}
    </div>
  );
}

// ── Fanen ──────────────────────────────────────────────────────────────────────────────────────────────────
interface Props {
  enheter: KartEnhet[]; uten: { land: string; n: number; status: string }[]; v: KartValg; std: KartValg; sett: (v: KartValg) => void;
  aar: [number, number]; apneProfil: (id: string) => void; apneAjg: (id: string) => void; harAjg: boolean;
  /** siteringsdata fra OpenAlex finnes (målene «Snitt FWCI» og «Topp 10 %») */ harSit?: boolean; apneSit?: (id: string) => void;
}
export function NordenKart({ enheter, uten, v, std, sett, aar, apneProfil, apneAjg, harAjg, harSit, apneSit }: Props) {
  const set = (p: Partial<KartValg>) => sett({ ...v, ...p });
  const m = KART_MAAL[v.maal];
  const [y0, yN] = aar;
  const periodeTekst = v.fra === v.til ? String(v.fra) : `${v.fra}–${v.til}`;
  const vist = enheter.filter((e) => (v.anslag || !e.anslag) && (v.ref || !e.referanse));
  const maksPerAar = Math.max(50, ...enheter.map((e) => e.artikler != null ? e.artikler / (e.til - e.fra + 1) : 0));
  const sortert = [...vist].sort((a, b) => {
    const va = verdiAv(a, v.maal), vb = verdiAv(b, v.maal);
    if (va == null && vb == null) return (b.artikler ?? 0) - (a.artikler ?? 0);
    if (va == null) return 1; if (vb == null) return -1;
    return m.lavBest ? va - vb : vb - va;
  });
  const valgt = enheter.find((e) => e.id === v.valgt) ?? null;
  const norske = vist.filter((e) => e.land === 'NO' && !e.referanse && verdiAv(e, v.maal) != null);
  const topNorsk = [...norske].sort((a, b) => m.lavBest ? (verdiAv(a, v.maal)! - verdiAv(b, v.maal)!) : (verdiAv(b, v.maal)! - verdiAv(a, v.maal)!))[0];
  // Ingressen trekker ikke fram enheter regnet med reservenevner (‡), som er mindre sammenlignbare
  const toppAlle = sortert.find((e) => !e.referanse && !e.reserveNevner && verdiAv(e, v.maal) != null);
  const hh = enheter.find((e) => e.meg);
  const tre = Array.from({ length: yN - y0 - 1 }, (_, i) => yN - i);
  const sel = { padding: '5px 8px', minWidth: 0 } as const;
  const nPerAar = (e: KartEnhet) => e.artikler != null ? e.artikler / (e.til - e.fra + 1) : null;
  const ref = [50, 200, Math.round(maksPerAar / 100) * 100].filter((x, i, a) => x <= maksPerAar && a.indexOf(x) === i);
  const rLeg = (n: number) => Math.max(4, 24 * Math.sqrt(n / maksPerAar));
  // Tabellkolonner: valgt mål først, så den synes på mobil uten sidelengs rulling
  const KOL: { id: KartMaal | 'art' | 'per'; label: string; title: string; vis: (e: KartEnhet) => string }[] = [
    { id: 'p4', label: 'AJG 4+ /100', title: KART_MAAL.p4.title, vis: (e) => nf(e.p4, 1) + (e.reserveNevner && e.p4 != null ? ' ‡' : '') },
    { id: 'p3', label: 'AJG 3+ /100', title: KART_MAAL.p3.title, vis: (e) => nf(e.p3, 1) + (e.reserveNevner && e.p3 != null ? ' ‡' : '') },
    ...(harSit ? [
      { id: 'fwci' as const, label: 'FWCI', title: KART_MAAL.fwci.title, vis: (e: KartEnhet) => nf(e.fwci, 2) },
      { id: 't10' as const, label: 'Topp 10 % /100', title: KART_MAAL.t10.title, vis: (e: KartEnhet) => nf(e.t10, 1) + (e.t10 != null ? `${e.sitReserve ? ' ‡' : ''}${e.sitNevnerAnnen ? '*' : ''}` : '') },
    ] : []),
    { id: 'poeng', label: 'Poeng/årsv.', title: KART_MAAL.poeng.title, vis: (e) => nf(e.poeng, 2) },
    { id: 'plass', label: 'Plass', title: KART_MAAL.plass.title, vis: (e) => e.plass != null ? String(e.plass) : '–' },
    { id: 'art', label: 'Artikler', title: 'Vitenskapelige artikler i perioden (Norge: NVI-rapporterte; andre land med siteringsmål: i OpenAlex)', vis: (e) => nf(e.artikler, 0) },
    { id: 'per', label: 'Periode', title: 'Perioden tallene gjelder; * = avviker fra den valgte', vis: (e) => `${e.fra === e.til ? e.fra : `${e.fra}–${String(e.til).slice(2)}`}${e.annenPeriode ? '*' : ''}` },
  ];
  const kolonner = [...KOL.filter((k) => k.id === v.maal), ...KOL.filter((k) => k.id !== v.maal)];

  return (
    <div className="skp kart">
      <section className="sheet" aria-label="Kart">
        <div>
          <span className="lab">Kart · {m.bareNorge ? 'Norge' : 'Norden'} · {periodeTekst} · hel telling · {v.nevner === 'uff' ? 'faglige årsverk med stipendiater' : 'faglige årsverk uten stipendiater'}</span>
          <h1>{v.maal === 'plass' ? 'Den norske rangeringen på kartet' : m.bareNorge ? 'Publiseringspoeng per årsverk i Norge' : m.sit ? 'Siteringer i nordiske handelshøyskoler' : 'Toppublisering i nordiske handelshøyskoler'}</h1>
          <p style={{ maxWidth: '64ch' }}>
            Sirklene viser hvor mye hver enhet publiserer (vitenskapelige artikler per år), og fargen viser {m.setning}.
            {topNorsk && <> Høyest i Norge er <b>{topNorsk.kort}</b> ({fmtMaal(v.maal, verdiAv(topNorsk, v.maal))}).</>}
            {!m.bareNorge && v.anslag && toppAlle && toppAlle.land !== 'NO' && <> Med de foreløpige anslagene for andre land ligger <b>{toppAlle.kort}</b> ({toppAlle.landNavn}, {fmtMaal(v.maal, verdiAv(toppAlle, v.maal))}) øverst.</>}
            {hh && verdiAv(hh, v.maal) != null && <> {hh.kort} har {fmtMaal(v.maal, verdiAv(hh, v.maal))}.</>}
            {m.sit
              ? <>{' '}Siteringene er fra OpenAlex for alle land (Norge: NVA-artiklene koblet på DOI; andre land: artiklene OpenAlex knytter til enheten). Nevnerne for andre land er fra utforskningsrapportene og gjelder bare enkelte år (*). Ikke del av den norske rangeringen.
                {v.til >= yN - 1 && <> <b>Perioden har med {yN - 1}–{yN}, som har få siteringer ennå (foreløpig); velg {yN - 4}–{yN - 2} for stabile tall.</b></>}</>
              : <>{' '}Norge bruker de ekte tallene fra rangeringsdataene; Danmark, Sverige og Finland er foreløpige anslag fra utforskningsrapporter og er ikke del av den norske rangeringen.</>}
          </p>
        </div>
        <div>
          <span className="lab">Valg</span>
          <div className="ajg-valg">
            <label className="ajg-g"><span className="lab">Farge</span>
              <select value={v.maal} onChange={(e) => set({ maal: e.target.value as KartMaal })} style={sel} title={m.title}>
                {KART_MAAL_IDER.filter((id) => harSit || !KART_MAAL[id].sit || id === v.maal).map((id) => <option key={id} value={id}>{KART_MAAL[id].navn}</option>)}
              </select>
            </label>
            <label className="ajg-g"><span className="lab">Periode (Norge)</span>
              <select value={`${v.fra}-${v.til}`} onChange={(e) => { const [f, t] = e.target.value.split('-').map(Number); set({ fra: f, til: t }); }} style={sel}>
                <optgroup label="Treårsvindu">{tre.map((y) => <option key={y} value={`${y - 2}-${y}`}>{y - 2}–{y}</option>)}</optgroup>
                <optgroup label="Enkeltår">{Array.from({ length: yN - y0 + 1 }, (_, i) => yN - i).map((y) => <option key={y} value={`${y}-${y}`}>{y}</option>)}</optgroup>
              </select>
            </label>
            {!(v.maal === 'plass') && <div className="ajg-g" role="group" aria-label="Per 100"><span className="lab">Per 100</span>
              <button type="button" className="seg" aria-pressed={v.nevner === 'uff'} onClick={() => set({ nevner: 'uff' })} title="Faglige årsverk med stipendiater og postdoktorer (HK-dir, UN1 + UN2). Andre land: med doktorander der det finnes (Finland trinn I–IV, danske VIP-årsverk, SSE/LUSEM/GU).">med stipendiater</button>
              <button type="button" className="seg" aria-pressed={v.nevner === 'utenStip'} onClick={() => set({ nevner: 'utenStip' })} title="Faglige årsverk uten stipendiater (NHH: UN1 + postdoktorer). Andre land: Finland trinn II–IV, Sverige «forskande och undervisande personal». Danmark har ikke tallet.">uten</button>
            </div>}
            <div className="ajg-g" role="group" aria-label="Utvalg">
              <button type="button" className="seg" aria-pressed={v.anslag} onClick={() => set({ anslag: !v.anslag })} title="Danmark, Sverige og Finland: foreløpige tall fra utforskningsrapportene (siteringsmålene: OpenAlex med foreløpig avgrensning)">Andre land (anslag)</button>
              <button type="button" className="seg" aria-pressed={v.ref} onClick={() => set({ ref: !v.ref })} title="Rene samfunnsøkonomimiljøer og hele fakulteter (UiB, UiO, NTNU ØK, Helsingfors, KU)">Referanser</button>
            </div>
          </div>
          <div className="ajg-g kart-vis" role="group" aria-label="Utsnitt"><span className="lab">Utsnitt</span>
            {KART_VIS_IDER.map((id) => <button key={id} type="button" className="seg" aria-pressed={v.vis === id} onClick={() => set({ vis: id })}>{KART_VIS[id].navn}</button>)}
          </div>
          <p className="cap">Enheter i samme by er skjøvet litt fra hverandre; en strek viser hvor de egentlig ligger. Velg et utsnitt for å se Oslofjorden, Bergen, København eller Helsingfors nærmere.</p>
        </div>
      </section>

      <section className="sec kart-hoved" aria-label="Kartet">
        <Kart enheter={vist} v={v} sett={set} maksPerAar={maksPerAar} />
        <div className="kart-leg" aria-label="Tegnforklaring">
          <div>
            <span className="lab">Farge: {m.kort}</span>
            <div className="kart-skala">
              {[0, 1, 2, 3, 4].map((k) => { const kk = m.lavBest ? 4 - k : k; return <span key={k}><i className={`c${kk}`} />{klasseTekst(v.maal, kk)}</span>; })}
              <span><i className="tom" />{m.bareNorge ? 'finnes ikke (andre land)' : v.maal === 'fwci' ? 'ingen OpenAlex-tall' : 'mangler nevner'}</span>
            </div>
          </div>
          <div>
            <span className="lab">Størrelse: artikler per år</span>
            <svg className="kart-str" width={rLeg(ref[ref.length - 1]) * 2 + 120} height={rLeg(ref[ref.length - 1]) * 2 + 12} aria-hidden="true">
              {[...ref].reverse().map((n, i) => { const r = rLeg(n), R0 = rLeg(ref[ref.length - 1]), bunn = 2 * R0 + 8; const ty = Math.max(10, bunn - 2 * r + 4 + (i === ref.length - 1 ? 4 : 0)); return <g key={n}><circle cx={R0 + 2} cy={bunn - r} r={r} /><line x1={R0 + 2} x2={2 * R0 + 14} y1={bunn - 2 * r} y2={bunn - 2 * r} /><text x={2 * R0 + 18} y={ty}>{nf(n, 0)}</text></g>; })}
            </svg>
          </div>
          <div>
            <span className="lab">Grunnlag</span>
            <div className="kart-skala">
              <span><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" className="kart-sirkel c3" /></svg>Norge: NVA og DBH</span>
              <span><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" className="kart-sirkel c3 anslag" /><circle cx="8" cy="8" r="6.5" fill="url(#kart-skravur)" className="kart-skr-flate" /></svg>Anslag (andre land)</span>
              {v.nevner === 'uff' && <span title="Nevneren med stipendiater/doktorander finnes ikke for enheten (de fleste svenske), så tallet er regnet uten. Det gir noe høyere tall per 100.">‡ regnet uten stipendiater (reserve)</span>}
            </div>
          </div>
        </div>
        {uten.length > 0 && <p className="cap">{uten.map((u) => `${u.land}: ${u.status === 'mal' ? `${u.n} enheter uten tall ennå (rapporten er ikke lagt inn)` : `${u.n} enheter uten tall`}`).join(' · ')}.</p>}
      </section>

      {valgt && <Detalj e={valgt} v={v} apneProfil={apneProfil} apneAjg={apneAjg} harAjg={harAjg} harSit={!!harSit} apneSit={apneSit} lukk={() => set({ valgt: null })} />}

      <section className="sec" aria-label="Tabell">
        <header><span className="lab">Tabell</span><h2>Alle enhetene på kartet</h2>
          <p className="cap">Sortert etter {m.kort.toLowerCase()}. Norge: {periodeTekst}, NVI-artikler, hel telling, {v.nevner === 'uff' ? 'HK-dirs nevner (UN1 + UN2)' : 'NHHs nevner (UN1 + postdoktorer)'}, som i AJG-sammenligningen. Andre land: rapportens periode og nevner; kursiv = anslag. Klikk en rad for detaljer.</p></header>
        <div className="scroll">
          <table className="ajg-tab kart-tab">
            <thead><tr>
              <th>Enhet</th>
              {kolonner.map((k) => <th key={k.id} title={k.title} aria-sort={k.id === v.maal ? (KART_MAAL[v.maal].lavBest ? 'ascending' : 'descending') : undefined}>{k.label}</th>)}
            </tr></thead>
            <tbody>
              {sortert.map((e) => (
                <tr key={e.id} className={`${e.meg ? 'meg' : ''}${e.anslag ? ' anslag' : ''}${e.id === v.valgt ? ' valgt' : ''}`} onClick={() => set({ valgt: e.id === v.valgt ? null : e.id })}>
                  <td><button type="button" className="kart-navn" onClick={(ev) => { ev.stopPropagation(); set({ valgt: e.id === v.valgt ? null : e.id }); }} aria-pressed={e.id === v.valgt}>{e.kort}</button><small>{e.by}, {e.land}{e.referanse ? ' · referanse' : ''}</small></td>
                  {kolonner.map((k) => <td key={k.id} className={k.id === v.maal ? 'sortert' : ''}>{k.vis(e)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="cap">* Perioden avviker fra den valgte (andre land har bare enkelte år eller vinduer). «–» = finnes ikke: andre land har verken publiseringspoeng eller plass i den norske rangeringen, og danske institutter har ingen åpen nevner.{std.fra !== v.fra || std.til !== v.til ? ` Standard er ${std.fra}–${std.til}.` : ''}</p>
      </section>

      <section className="ajg-metode" aria-label="Om kartet">
        <span className="lab">Om kartet</span>
        <ul>
          <li><b>Norge:</b> samme beregning som AJG-sammenligningen: NVI-rapporterte artikler i NVA koblet mot AJG 2024 på ISSN, hel telling, sum artikler / sum faglige årsverk (DBH 225, UN1 + UN2, eller UN1 + postdoktorer med «uten») × 100 for perioden. Poeng per årsverk = sum publiseringspoeng / sum faglige årsverk med samme nevner. Plass følger vektene i «Rangering og vekter».</li>
          <li><b>Danmark, Sverige og Finland</b> er foreløpige anslag fra utforskningsrapportene 7.10.2026 (data/rangering/inspirasjon/norden-*.md): Danmark er enhetsavgrenset i Pure (2024; CBS også 2023–2025), Sverige enhetsavgrenset i SwePub (2023–2025), Finland fagfeltavgrenset (511 + 512, Vipunen/Research.fi). Nevneren finnes ikke for alle: danske institutter har ingen åpen nevner, og i Sverige finnes nevner med doktorander bare for SSE, LUSEM og GU. De andre svenske vises med nevneren uten doktorander som reserve, merket ‡ (gir noe høyere tall per 100 enn med). Tallene er ikke kontrollert mot skolenes egne og er ikke del av rangeringen.</li>
          {harSit && <li><b>Siteringsmålene</b> (snitt FWCI og topp 10 % per 100 årsverk) er fra OpenAlex for alle land, se fanen «Siteringer». Norge: NVA-artiklene (NVI-rapporterte) koblet til OpenAlex på DOI eller tittel. Andre land: artiklene OpenAlex knytter til enheten (hel institusjon, tilknytningstekst eller fagfelt), i den valgte perioden; nevneren er fra utforskningsrapportene og gjelder bare enkelte år (* = annen periode, ‡ = uten stipendiater). Ferske år ({aar[1] - 1}–{aar[1]}) har få siteringer og er foreløpige.</li>}
          <li><b>Kartgrunnlag:</b> Natural Earth 1:50m (offentlig eiendom) via world-atlas (ISC-lisens), forenklet og tegnet som innebygd SVG. Kartet henter ingenting fra eksterne tjenester. Sirklene står ved hovedcampus; skoler med flere studiesteder har ett punkt.</li>
        </ul>
      </section>
    </div>
  );
}

function Detalj({ e, v, apneProfil, apneAjg, harAjg, harSit, apneSit, lukk }: { e: KartEnhet; v: KartValg; apneProfil: (id: string) => void; apneAjg: (id: string) => void; harAjg: boolean; harSit: boolean; apneSit?: (id: string) => void; lukk: () => void }) {
  const per = e.fra === e.til ? String(e.fra) : `${e.fra}–${e.til}`;
  const n = e.til - e.fra + 1;
  return (
    <section className="sec kart-detalj" aria-label={`Detaljer for ${e.navn}`} aria-live="polite">
      <header>
        <span className="lab">{e.landNavn} · {e.by}{e.anslag ? ' · foreløpig anslag' : ''}{e.referanse ? ' · referanse' : ''}</span>
        <h2>{e.navn}</h2>
      </header>
      <div className="facts">
        <div><b>{nf(e.artikler, 0)}</b><span>artikler {per}{n > 1 && e.artikler != null ? ` (${nf(e.artikler / n, 0)} per år)` : ''}</span></div>
        <div><b>{nf(e.p4, 1)}</b><span>AJG 4/4* per 100 årsverk og år{e.n4 != null ? ` (${nf(e.n4, 0)} artikler)` : ''}</span></div>
        <div><b>{nf(e.p3, 1)}</b><span>AJG 3+ per 100 årsverk og år{e.n3 != null ? ` (${nf(e.n3, 0)} artikler)` : ''}</span></div>
        {harSit && <div><b>{nf(e.fwci, 2)}</b><span>snitt FWCI (OpenAlex){e.sitArtikler != null ? `, ${nf(e.sitArtikler, 0)} artikler` : ''}</span></div>}
        {harSit && <div><b>{nf(e.t10, 1)}{e.t10 != null && e.sitNevnerAnnen ? '*' : ''}</b><span>topp 10 % mest siterte per 100 årsverk og år{e.t10n != null ? ` (${nf(e.t10n, 0)} artikler)` : ''}</span></div>}
        <div><b>{nf(e.arsverk, 0)}</b><span>faglige årsverk per år (nevner)</span></div>
        {e.land === 'NO' && <div><b>{nf(e.poeng, 2)}</b><span>publiseringspoeng per faglig årsverk</span></div>}
        {e.land === 'NO' && <div><b>{e.plass != null ? `nr. ${e.plass}` : '–'}</b><span>{e.plass != null ? `av ${e.plassAv} i rangeringen` : 'ikke rangert (referanse)'}</span></div>}
      </div>
      {e.ekstra.length > 0 && <div className="rk">{e.ekstra.map(([k, x]) => <div key={k}><span>{k}</span><b>{x}</b></div>)}</div>}
      <p className="cap"><b>Avgrensning:</b> {e.avgrensning} <b>Nevner:</b> {e.nevner} <b>Kilde:</b> {e.kilde}{e.annenPeriode ? ` NB: perioden (${per}) avviker fra den valgte (${v.fra === v.til ? v.fra : `${v.fra}–${v.til}`}).` : ''}</p>
      {e.akk.length > 0 && <p className="cap"><b>Akkreditering:</b> {e.akk.join(', ')}</p>}
      {e.forbehold.length > 0 && <ul className="kart-forb">{e.forbehold.map((f) => <li key={f}>{f}</li>)}</ul>}
      <div className="cmprow">
        {e.land === 'NO' && <button type="button" onClick={() => apneProfil(e.id)}>Skoleportrett</button>}
        {e.land === 'NO' && harAjg && <button type="button" onClick={() => apneAjg(e.id)}>AJG-sammenligning</button>}
        {harSit && apneSit && (e.fwci != null || e.t10 != null) && <button type="button" onClick={() => apneSit(e.id)}>Siteringer</button>}
        <button type="button" className="clr" onClick={lukk}>Lukk</button>
      </div>
    </section>
  );
}
