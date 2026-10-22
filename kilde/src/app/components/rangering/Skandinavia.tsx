import { Fragment, useMemo, useState } from 'react';
import { Download } from '../../ikoner';
import { Prikker, SitLinjer } from './Siteringer';

/**
 * Fanen «Skandinavia» i den interne rangeringen (18.10.2026): handelshøyskoler i Norge, Sverige, Danmark og Finland
 * sammenlignet med SAMME kilde og metode i alle land. Artiklene (article/review) er det OpenAlex knytter til enheten,
 * AJG 2024-nivå settes per tidsskrift, og nevneren er faglige årsverk per år fra nasjonal statistikk (DBH, UKÄ,
 * Danske Universiteter/AU i tal/CBS, Vipunen) med kvalitetsmerke. Data fra scripts/rangering/skandinavia.py
 * (feltet `skandinavia`, kryptert) og scripts/rangering/lag_nevner_norden.py. Bare aggregater per enhet og år.
 * NVI-tallene for de norske enhetene (fra rangeringsdataene) vises som kontroll av OpenAlex-avgrensningen.
 */

// ── Datatyper (speiler skandinavia.py) ──────────────────────────────────────
export type SkanLand = 'NO' | 'SE' | 'DK' | 'FI';
export type SkanKvalitet = 'god' | 'middels' | 'svak' | 'mangler';
/** v = [artikler, AJG 4*, 4, 3, 2, 1, i AJG-tidsskrift] */
export interface SkanAar { v: number[]; med: number | null; uten: number | null; }
export interface SkanEnhet {
  id: string; land: SkanLand; kort: string; navn: string; referanse: boolean; meg: boolean;
  metode?: 'institusjon' | 'tekst' | 'fag' | null; usikkerhet?: string | null;
  nevner: { kvalitet: SkanKvalitet; nivaa?: string; kilde?: string; forklaring?: string; eter?: Record<string, number> };
  aar: Record<string, SkanAar>;
}
export interface SkandinaviaData { kilde: string; hentet: string | null; aar: [number, number]; standard: [number, number]; enheter: SkanEnhet[]; }
/** NVI-kontroll for en norsk enhet i en periode: [NVI-artikler, AJG 4*, 4, 3] (hel telling) */
export type SkanNvi = (id: string, aar: string[]) => [number, number, number, number] | null;
/** Nasjonal rapport for en nordisk enhet (SwePub, Pure, Vipunen/Research.fi): artikler i rapportperioden */
export type SkanRapport = (id: string) => { fra: number; til: number; artikler: number; kilde?: string } | null;
const N = 0, A4S = 1, A4 = 2, A3 = 3, IAJG = 6;

// ── Valg og lenke (?rangering&fane=skandinavia&skanperiode=2021-2023&skanmaal=p3&skanvis=antall&skannevner=uten&
//    skanland=NO,SE&skansvak=0&skanref=1&skanskoler=nmbu,nhh,,dk_cbs) ──────────────────────────────────────────────
export type SkanMaal = 'n4s' | 'p4' | 'p3' | 'n' | 'dekning' | 'a3';
const MAAL_IDER: SkanMaal[] = ['n4s', 'p4', 'p3', 'n', 'dekning', 'a3'];
const LANDENE: SkanLand[] = ['NO', 'SE', 'DK', 'FI'];
const LAND_NAVN: Record<SkanLand, string> = { NO: 'Norge', SE: 'Sverige', DK: 'Danmark', FI: 'Finland' };
export interface SkanValg {
  fra: number; til: number; maal: SkanMaal; /** AJG-målene per 100 årsverk og år (ellers antall) */ per100: boolean;
  /** med = med stipendiater/doktorander (≈ UN1 + stipendiater + postdoktorer), uten = uten */ nevner: 'med' | 'uten';
  land: SkanLand[]; /** vis per 100 også for enheter med svak nevner */ svak: boolean; ref: boolean;
  /** enhetene i utviklingsgrafen; plassen er fargen, '' = ledig plass */ skoler: string[];
}
const MAKS_SKOLER = 6;
export const SKAN_PARAM = ['skanperiode', 'skanmaal', 'skanvis', 'skannevner', 'skanland', 'skansvak', 'skanref', 'skanskoler'];
export function skanStandard(d: SkandinaviaData | null | undefined, aar: [number, number], hh: string): SkanValg {
  const [fra, til] = d?.standard ?? [aar[1] - 2, aar[1]];
  const finnes = (id: string) => !!d?.enheter.some((e) => e.id === id);
  return { fra, til, maal: 'p4', per100: true, nevner: 'med', land: [...LANDENE], svak: false, ref: false,
    skoler: [hh, 'nhh', 'bi', 'dk_cbs', 'se_sse', 'fi_hanken'].filter((id, k, a) => a.indexOf(id) === k && finnes(id)) };
}
export function lesSkan(q: URLSearchParams, std: SkanValg, aar: [number, number], finnes: (id: string) => boolean): SkanValg {
  const v: SkanValg = { ...std, land: [...std.land], skoler: [...std.skoler] };
  const p = (q.get('skanperiode') ?? '').split('-').map(Number);
  if (q.has('skanperiode') && p.length <= 2 && p.every((x) => Number.isInteger(x) && x >= aar[0] && x <= aar[1]) && p[0] <= p[p.length - 1]) { v.fra = p[0]; v.til = p[p.length - 1]; }
  const m = q.get('skanmaal') as SkanMaal | null; if (m && MAAL_IDER.includes(m)) v.maal = m;
  if (q.get('skanvis') === 'antall') v.per100 = false;
  if (q.get('skannevner') === 'uten') v.nevner = 'uten';
  if (q.has('skanland')) { const l = (q.get('skanland') ?? '').split(',').filter((x): x is SkanLand => (LANDENE as string[]).includes(x)); if (l.length) v.land = l; }
  if (q.get('skansvak') === '1') v.svak = true;
  if (q.get('skanref') === '1') v.ref = true;
  if (q.has('skanskoler')) v.skoler = (q.get('skanskoler') ?? '').split(',').map((id) => finnes(id) ? id : '').slice(0, MAKS_SKOLER);
  return v;
}
export function skrivSkan(q: URLSearchParams, v: SkanValg, std: SkanValg) {
  if (v.fra !== std.fra || v.til !== std.til) q.set('skanperiode', v.fra === v.til ? String(v.fra) : `${v.fra}-${v.til}`);
  if (v.maal !== std.maal) q.set('skanmaal', v.maal);
  if (!v.per100) q.set('skanvis', 'antall');
  if (v.nevner !== std.nevner) q.set('skannevner', v.nevner);
  if (v.land.join(',') !== std.land.join(',')) q.set('skanland', v.land.join(','));
  if (v.svak) q.set('skansvak', '1');
  if (v.ref) q.set('skanref', '1');
  if (v.skoler.join(',') !== std.skoler.join(',')) q.set('skanskoler', v.skoler.join(','));
}

// ── Mål ──────────────────────────────────────────────────────────────────────
interface MaalDef { label: string; navn: string; title: string; type: 'tell' | 'n' | 'pst'; stripe?: boolean; }
const MAAL: Record<SkanMaal, MaalDef> = {
  n4s: { label: 'AJG 4*', navn: 'AJG 4*', title: 'Artikler i tidsskrift på AJG 2024 nivå 4* (World Elite)', type: 'tell', stripe: true },
  p4: { label: 'AJG 4+', navn: 'AJG 4+ (4 og 4*)', title: 'Artikler i tidsskrift på AJG 2024 nivå 4 eller 4*', type: 'tell', stripe: true },
  p3: { label: 'AJG 3+', navn: 'AJG 3+ (3, 4 og 4*)', title: 'Artikler i tidsskrift på AJG 2024 nivå 3, 4 eller 4*', type: 'tell', stripe: true },
  n: { label: 'Artikler', navn: 'artikler', title: 'Vitenskapelige artikler og oversiktsartikler OpenAlex knytter til enheten i perioden (hel telling)', type: 'n' },
  dekning: { label: 'I AJG', navn: 'andel i AJG-tidsskrift', title: 'Andel av artiklene som står i et tidsskrift på AJG 2024', type: 'pst', stripe: true },
  a3: { label: '3+ av AJG', navn: 'andel 3+ av AJG-artiklene', title: 'Andel av artiklene i AJG-tidsskrift som er på nivå 3 eller høyere', type: 'pst' },
};
const KOL: SkanMaal[] = ['n4s', 'p4', 'p3', 'n', 'dekning', 'a3'];
const KVALITET: Record<SkanKvalitet, { navn: string; title: string }> = {
  god: { navn: 'God', title: 'Årsverk for selve enheten (hele institusjonen, eller enhetens egne tall)' },
  middels: { navn: 'Middels', title: 'Årsverk for en kjent, litt annen avgrensning (hele fakultetet, rekonstruert, eller fagfelt som samsvarer med artikkelavgrensningen)' },
  svak: { navn: 'Svak', title: 'Årsverk for fagområdet ved hele universitetet (UKÄ-faggruppe, dansk hovedområde): en ramme, ikke enheten. Per 100 vises bare når «Vis svake nevnere» er på.' },
  mangler: { navn: 'Mangler', title: 'Ingen nevner funnet' },
};

// ── Hjelpere ─────────────────────────────────────────────────────────────────
const nf = (v: number | null | undefined, d = 1) => v == null || !Number.isFinite(v) ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });
const aarRekke = (fra: number, til: number) => Array.from({ length: til - fra + 1 }, (_, i) => String(fra + i));
const medianAv = (xs: (number | null | undefined)[]) => { const v = xs.filter((x): x is number => x != null && Number.isFinite(x)).sort((a, b) => a - b); if (!v.length) return null; const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface Sum { v: number[]; aar: number; arsv: number | null; }
/** Summerer årene med artikkeldata. Nevner: sum årsverk i årene, der år uten tall får snittet av årene som har (som i
 *  AJG-sammenligningen). */
function summer(e: SkanEnhet, aar: string[], nevner: 'med' | 'uten'): Sum {
  const v = Array(7).fill(0) as number[]; let n = 0; const nev: number[] = [];
  for (const y of aar) {
    const x = e.aar[y]; if (!x) continue; n++;
    x.v.forEach((a, i) => { v[i] += a; });
    const t = x[nevner]; if (t != null && t > 0) nev.push(t);
  }
  return { v, aar: n, arsv: nev.length && n ? nev.reduce((a, b) => a + b, 0) * n / nev.length : null };
}
function maalAv(s: Sum, per100: boolean, visPer100: boolean): Record<SkanMaal, number | null> {
  const v = s.v;
  const c = (x: number) => per100 ? (visPer100 && s.arsv ? 100 * x / s.arsv : null) : x;
  const p4 = v[A4S] + v[A4], p3 = p4 + v[A3];
  return { n4s: s.aar ? c(v[A4S]) : null, p4: s.aar ? c(p4) : null, p3: s.aar ? c(p3) : null, n: s.aar ? v[N] : null,
    dekning: v[N] ? 100 * v[IAJG] / v[N] : null, a3: v[IAJG] ? 100 * p3 / v[IAJG] : null };
}

interface Props { data: SkandinaviaData; nvi: SkanNvi; rapport: SkanRapport; v: SkanValg; std: SkanValg; sett: (v: SkanValg) => void; generert: string; }
export function SkandinaviaFane({ data, nvi, rapport, v, std, sett, generert }: Props) {
  const set = (p: Partial<SkanValg>) => sett({ ...v, ...p });
  const [y0, yN] = data.aar;
  const aar = aarRekke(v.fra, v.til);
  const periodeTekst = v.fra === v.til ? String(v.fra) : `${v.fra}–${v.til}`;
  const nevKort = v.nevner === 'med' ? 'faglige årsverk' : 'faglige årsverk uten stipendiater';
  const visPer100 = (e: SkanEnhet) => e.nevner.kvalitet !== 'mangler' && (v.svak || e.nevner.kvalitet !== 'svak');

  /** Dekning: hvor stor del av fasiten OpenAlex-avgrensningen fanger. Norge: OpenAlex-artikler / NVI-artikler i
   *  valgt periode. Andre land: OpenAlex / nasjonal rapport (SwePub, Pure, Vipunen) i rapportens periode. */
  const dekningAv = (e: SkanEnhet): { pst: number | null; tekst: string } => {
    if (e.land === 'NO') {
      const k = nvi(e.id, aar); const s = summer(e, aar, 'med');
      return k && k[0] ? { pst: 100 * s.v[N] / k[0], tekst: `${nf(s.v[N], 0)} i OpenAlex mot ${nf(k[0], 0)} NVI-artikler (${periodeTekst})` } : { pst: null, tekst: '' };
    }
    const r = rapport(e.id); if (!r || !r.artikler) return { pst: null, tekst: 'Ingen nasjonal rapport å sammenligne med' };
    const ra = aarRekke(r.fra, r.til); const s = summer(e, ra, 'med');
    if (s.aar < ra.length) return { pst: null, tekst: '' };
    return { pst: 100 * s.v[N] / r.artikler, tekst: `${nf(s.v[N], 0)} i OpenAlex mot ${nf(r.artikler, 0)} i ${r.kilde ?? 'den nasjonale rapporten'} (${r.fra === r.til ? r.fra : `${r.fra}–${r.til}`})` };
  };
  const DEK_LAV = 60;
  const utvalg = data.enheter.filter((e) => v.land.includes(e.land) && (v.ref || !e.referanse));
  const rader = utvalg.map((e) => { const s = summer(e, aar, v.nevner); return { e, s, m: maalAv(s, v.per100, visPer100(e)) }; });
  type Rad = (typeof rader)[number];
  const verdi = (r: Rad, id: SkanMaal) => r.m[id];
  const sortert = [...rader].sort((a, b) => (verdi(b, v.maal) ?? -Infinity) - (verdi(a, v.maal) ?? -Infinity));
  const plassPaa = (r: Rad, id: SkanMaal) => { const x = verdi(r, id); return x == null ? null : 1 + rader.filter((z) => { const y = verdi(z, id); return y != null && y > x + 1e-9; }).length; };
  const nMed = (id: SkanMaal) => rader.filter((r) => verdi(r, id) != null).length;
  const def = MAAL[v.maal];
  const enhet = (id: SkanMaal) => MAAL[id].type === 'tell' ? (v.per100 ? ` per 100 ${nevKort} og år` : ' (antall)') : '';
  const fmt = (id: SkanMaal, x: number | null) => x == null ? '–' : MAAL[id].type === 'pst' ? nf(x, 0) + ' %' : MAAL[id].type === 'n' ? nf(x, 0) : v.per100 ? nf(x, 1) : nf(x, 0);
  const hh = rader.find((r) => r.e.meg);
  const topp5 = sortert.filter((r) => verdi(r, v.maal) != null).slice(0, 5);
  const holdtTilbake = v.per100 && def.type === 'tell' ? rader.filter((r) => !visPer100(r.e) && r.s.aar) : [];
  const sel = { padding: '5px 8px', minWidth: 0 } as const;

  // Periodevalg som i AJG-sammenligningen
  const tre = aarRekke(y0 + 2, yN).map(Number).reverse();
  const fem = aarRekke(y0 + 4, yN).map(Number).reverse();
  const verdiP = `${v.fra}-${v.til}`;
  const kjente = new Set([...tre.map((y) => `${y - 2}-${y}`), ...aarRekke(y0, yN).map((y) => `${y}-${y}`), ...fem.map((y) => `${y - 4}-${y}`), `${y0}-${yN}`]);

  // Utviklingsgrafen: valgt mål per år (eller glidende treårssnitt)
  const [glatt, setGlatt] = useState(false);
  const alleAar = aarRekke(y0, yN);
  const perAar = useMemo(() => {
    const ut = new Map<string, (number | null)[]>();
    for (const e of utvalg) {
      ut.set(e.id, alleAar.map((y) => {
        const vindu = glatt ? aarRekke(Math.max(y0, Number(y) - 2), Number(y)) : [y];
        if (glatt && vindu.length < 3) return null;
        const s = summer(e, vindu, v.nevner);
        return s.aar === vindu.length ? maalAv(s, v.per100, visPer100(e))[v.maal] : null;
      }));
    }
    return ut;
  }, [data, glatt, v.per100, v.nevner, v.maal, v.svak, v.land.join(','), v.ref]); // eslint-disable-line react-hooks/exhaustive-deps
  const valgte = v.skoler.map((id, k) => ({ id, k })).filter((x) => x.id && rader.some((r) => r.e.id === x.id));
  const serier = valgte.map(({ id, k }) => { const r = rader.find((z) => z.e.id === id) as Rad; return { id, lab: r.e.kort, v: perAar.get(id) ?? [], k, meg: r.e.meg }; });
  const medianLinje = alleAar.map((_, i) => medianAv(utvalg.map((e) => perAar.get(e.id)?.[i])));
  const veksle = (id: string) => {
    const k = v.skoler.indexOf(id);
    if (k >= 0) { const ny = [...v.skoler]; ny[k] = ''; while (ny.length && !ny[ny.length - 1]) ny.pop(); set({ skoler: ny }); return; }
    const ledig = v.skoler.indexOf('');
    if (ledig >= 0) { const ny = [...v.skoler]; ny[ledig] = id; set({ skoler: ny }); } else if (v.skoler.length < MAKS_SKOLER) set({ skoler: [...v.skoler, id] });
  };
  const fulle = valgte.length >= MAKS_SKOLER;
  const grafD = def.type === 'n' || def.type === 'pst' ? 0 : v.per100 ? 1 : 0;

  // Kontroll: OpenAlex mot NVI for de norske enhetene i perioden
  const kontroll = data.enheter.filter((e) => e.land === 'NO' && (v.ref || !e.referanse)).map((e) => {
    const s = summer(e, aar, 'med'); const k = nvi(e.id, aar);
    return { e, oa: s.v, nvi: k };
  }).filter((x) => x.nvi && x.nvi[0] > 0);

  // CSV
  const lastNed = () => {
    const tallCsv = (x: number | null | undefined, d: number) => x == null || !Number.isFinite(x) ? '' : x.toFixed(d).replace('.', ',');
    const esc = (x: string) => /[;"\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x;
    const hode = ['Enhet', 'Navn', 'Land', 'Periode', 'Artikler (OpenAlex)', 'AJG 4*', 'AJG 4', 'AJG 3', 'I AJG-tidsskrift',
      `AJG 4* per 100 ${nevKort} og år`, `AJG 4+ per 100 ${nevKort} og år`, `AJG 3+ per 100 ${nevKort} og år`, 'Årsverk per år (snitt)',
      'Kvalitet nevner', 'Nevner gjelder', 'Kilde nevner', 'Avgrensning i OpenAlex', `Plass på ${def.navn}`];
    const linjer = [hode.join(';'), ...sortert.map((r) => {
      const m100 = maalAv(r.s, true, true); const x = r.s.v;
      return [esc(r.e.kort), esc(r.e.navn), r.e.land, periodeTekst.replace('–', '-'), String(x[N]), String(x[A4S]), String(x[A4]), String(x[A3]), String(x[IAJG]),
        tallCsv(m100.n4s, 2), tallCsv(m100.p4, 2), tallCsv(m100.p3, 2), tallCsv(r.s.arsv != null && r.s.aar ? r.s.arsv / r.s.aar : null, 1),
        r.e.nevner.kvalitet, esc(r.e.nevner.nivaa ?? ''), esc(r.e.nevner.kilde ?? ''), r.e.metode ?? '', String(plassPaa(r, v.maal) ?? '')].join(';');
    })];
    const blob = new Blob(['﻿' + linjer.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `skandinavia-ajg-${periodeTekst.replace('–', '-')}-${v.nevner}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const kvChip = (k: SkanKvalitet) => <span className={`skan-kv ${k}`} title={KVALITET[k].title}>{KVALITET[k].navn}</span>;
  const navnCelle = (r: Rad) => (
    <span><b style={{ fontWeight: 600 }}>{r.e.kort}</b>{r.e.referanse && <span className="muted" style={{ fontSize: '.72rem' }}> · ref.</span>}
      <small style={{ display: 'block', fontSize: '.72rem', color: 'var(--muted)' }}>{LAND_NAVN[r.e.land]} · nr. {plassPaa(r, v.maal) ?? '–'} av {nMed(v.maal)}{r.s.aar < aar.length ? ` · mangler ${aar.length - r.s.aar} år` : ''}</small></span>
  );
  const pct = (a: number, b: number) => b ? nf(100 * a / b, 0) + ' %' : '–';

  return (
    <div className="skp ajg sit skan">
      <section className="sheet" aria-label="Skandinavia">
        <div>
          <span className="lab">OpenAlex + AJG 2024 · {v.land.map((l) => LAND_NAVN[l]).join(', ')} · {periodeTekst}</span>
          <h1>{topp5[0] ? `${topp5[0].e.kort} er nr. 1 på ${def.navn}${enhet(v.maal)}` : 'Skandinavia'}</h1>
          <p style={{ maxWidth: '66ch' }}>
            Topp fem: {topp5.map((r, k) => <Fragment key={r.e.id}>{k ? (k === topp5.length - 1 ? ' og ' : ', ') : ''}<b>{r.e.kort}</b> ({fmt(v.maal, verdi(r, v.maal))})</Fragment>)}.
            {hh && plassPaa(hh, v.maal) != null && <> {hh.e.kort} er nr. {plassPaa(hh, v.maal)} av {nMed(v.maal)} med {fmt(v.maal, verdi(hh, v.maal))}.</>}
            {' '}Alle land telles likt: artiklene OpenAlex knytter til enheten, med AJG-nivå per tidsskrift, delt på faglige årsverk fra nasjonal statistikk. Nevnerne er av ulik kvalitet (merket i tabellen), så les plasseringene som et anslag.
          </p>
          {holdtTilbake.length > 0 && <p className="sit-varsel">{holdtTilbake.length} enheter har bare en svak nevner (fagområdet for hele universitetet), så per 100 årsverk er skjult for dem: {holdtTilbake.map((r) => r.e.kort).join(', ')}. Slå på «Vis svake nevnere» for å se anslagene.</p>}
        </div>
        <div>
          <span className="lab">Valg</span>
          <div className="ajg-valg">
            <label className="ajg-g"><span className="lab">Periode</span>
              <select value={verdiP} onChange={(e) => { const [f, t] = e.target.value.split('-').map(Number); set({ fra: f, til: t }); }} style={sel}>
                <optgroup label="Treårsvindu">{tre.map((y) => <option key={y} value={`${y - 2}-${y}`}>{y - 2}–{y}</option>)}</optgroup>
                <optgroup label="Enkeltår">{aarRekke(y0, yN).reverse().map((y) => <option key={y} value={`${y}-${y}`}>{y}</option>)}</optgroup>
                <optgroup label="Femårsvindu">{fem.map((y) => <option key={y} value={`${y - 4}-${y}`}>{y - 4}–{y}</option>)}</optgroup>
                <optgroup label="Alt"><option value={`${y0}-${yN}`}>{y0}–{yN}</option>{!kjente.has(verdiP) && <option value={verdiP}>{periodeTekst}</option>}</optgroup>
              </select>
            </label>
            <div className="ajg-g" role="group" aria-label="Nivå"><span className="lab">Nivå</span>
              {(['p3', 'p4', 'n4s'] as SkanMaal[]).map((id) => <button key={id} type="button" className="seg" aria-pressed={v.maal === id} onClick={() => set({ maal: id })} title={MAAL[id].title}>{MAAL[id].label}</button>)}
            </div>
            <div className="ajg-g" role="group" aria-label="Vis"><span className="lab">Vis</span>
              <button type="button" className="seg" aria-pressed={v.per100} onClick={() => set({ per100: true })}>Per 100 årsverk</button>
              <button type="button" className="seg" aria-pressed={!v.per100} onClick={() => set({ per100: false })}>Antall</button>
            </div>
            <div className="ajg-g" role="group" aria-label="Nevner"><span className="lab">Per 100</span>
              <button type="button" className="seg" aria-pressed={v.nevner === 'med'} onClick={() => set({ nevner: 'med', per100: true })} title="Faglige årsverk med stipendiater/doktorander og postdoktorer (≈ HK-dirs UN1 + stipendiater + postdoktorer)">Med stipendiater</button>
              <button type="button" className="seg" aria-pressed={v.nevner === 'uten'} onClick={() => set({ nevner: 'uten', per100: true })} title="Faglige årsverk uten stipendiater/doktorander (≈ NHHs nevner). Finnes ikke for SDU, AAU, RUC og KU.">Uten stipendiater</button>
            </div>
            <div className="ajg-g" role="group" aria-label="Land"><span className="lab">Land</span>
              {LANDENE.map((l) => <button key={l} type="button" className="seg" aria-pressed={v.land.includes(l)} disabled={v.land.length === 1 && v.land.includes(l)}
                onClick={() => set({ land: v.land.includes(l) ? v.land.filter((x) => x !== l) : LANDENE.filter((x) => x === l || v.land.includes(x)) })}>{LAND_NAVN[l]}</button>)}
            </div>
            <div className="ajg-g" role="group" aria-label="Utvalg">
              <button type="button" className="seg" aria-pressed={v.svak} onClick={() => set({ svak: !v.svak })} title={KVALITET.svak.title}>Vis svake nevnere</button>
              <button type="button" className="seg" aria-pressed={v.ref} onClick={() => set({ ref: !v.ref })} title="Rene samfunnsøkonomimiljøer (UiB, UiO, KU, SU, Uppsala, Linköping, Helsingfors)">Referanser</button>
            </div>
            {JSON.stringify(v) !== JSON.stringify(std) && <button type="button" className="seg" onClick={() => sett({ ...std, land: [...std.land], skoler: [...std.skoler] })}>Standardvalg</button>}
          </div>
          <p className="cap">Standard: {std.fra}–{std.til}, AJG 4+ per 100 faglige årsverk med stipendiater, alle fire land, uten svake nevnere og referanser. Per 100 = artikler i perioden delt på sum årsverk i perioden, ganger 100. Lenken husker valgene.</p>
        </div>
      </section>

      <section className="sec" aria-label="Tabell">
        <header>
          <span className="lab">Alle enhetene</span>
          <h2>Sortert etter {def.navn}{enhet(v.maal)}, {periodeTekst}</h2>
          <p className="muted">Klikk på en kolonne for å sortere. Prikkene viser alle enhetene fra laveste til høyeste verdi. «Nevner» er faglige årsverk per år i snitt for perioden; pek på kvalitetsmerket for hva det betyr.</p>
        </header>
        <div className="ajg-verktoy">
          <button type="button" className="seg" onClick={lastNed} title="Last ned tabellen som CSV med valgene over"><Download className="w-3.5 h-3.5" style={{ display: 'inline', verticalAlign: -2, marginRight: 5 }} />Last ned CSV</button>
        </div>
        <div className="scroll">
          <table className="ajg-tab sit-tab skan-tab">
            <thead>
              <tr>
                <th>Plass og enhet</th>
                {KOL.map((id) => (
                  <th key={id} aria-sort={v.maal === id ? 'descending' : undefined} title={MAAL[id].title}>
                    <button type="button" onClick={() => set({ maal: id })}>{MAAL[id].label}{MAAL[id].type === 'tell' ? (v.per100 ? ' /100' : ' (n)') : ''}{v.maal === id ? ' ↓' : ''}</button>
                  </th>
                ))}
                <th title="Hvor stor del av fasiten OpenAlex fanger: Norge mot NVI i perioden, andre land mot nasjonal rapport (SwePub, Pure, Vipunen). Under 60 % betyr at enheten trolig er undervurdert.">Dekning</th>
                <th title="Faglige årsverk per år, snitt i perioden">Nevner</th>
                <th>Kvalitet</th>
              </tr>
            </thead>
            <tbody>
              {sortert.map((r) => {
                const p = plassPaa(r, v.maal);
                return (
                  <tr key={r.e.id} className={`${r.e.meg ? 'meg' : ''}${r.e.land !== 'NO' ? ' nordisk' : ''}`}>
                    <td style={{ minWidth: 190 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                        <span className={`ajg-pl${p != null && p <= 3 ? ' top' : ''}`}>{p ?? '–'}</span>
                        {navnCelle(r)}
                      </div>
                    </td>
                    {KOL.map((id) => (
                      <td key={id} className={v.maal === id ? 'sortert' : undefined}
                        title={MAAL[id].type === 'tell' && v.per100 && !visPer100(r.e) ? `Skjult: ${KVALITET[r.e.nevner.kvalitet].title}` : undefined}>
                        {fmt(id, verdi(r, id))}
                        {MAAL[id].stripe && <Prikker verdier={rader.map((z) => ({ id: z.e.id, v: verdi(z, id) }))} sel={r.e.id} />}
                      </td>
                    ))}
                    {(() => { const d = dekningAv(r.e); return <td title={d.tekst || undefined} className={d.pst != null && d.pst < DEK_LAV ? 'skan-lav' : undefined}>{d.pst == null ? '–' : nf(d.pst, 0) + ' %'}</td>; })()}
                    <td>{r.s.arsv != null && r.s.aar ? nf(r.s.arsv / r.s.aar, 0) : '–'}</td>
                    <td title={[r.e.nevner.nivaa, r.e.nevner.forklaring].filter(Boolean).join('. ')}>{kvChip(r.e.nevner.kvalitet)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="cap">Alle tall er hel telling: en artikkel teller for hver enhet med minst én forfatter der. AJG 2024 er brukt for alle år. «I AJG» er andelen av artiklene som står i et AJG-tidsskrift. {v.nevner === 'uten' ? 'SDU, AAU, RUC og KU har ikke nevner uten stipendiater og står uten tall per 100. ' : ''}År uten nevner får snittet av årene i perioden som har. «Dekning» under {DEK_LAV} % (markert) betyr at OpenAlex finner for få av enhetens artikler, så enheten kommer for lavt ut; for hele institusjoner ligger dekningen rundt 90–100 %.</p>
      </section>

      <section className="sec" aria-label="Utvikling over tid">
        <header>
          <span className="lab">Utvikling {y0}–{yN}</span>
          <h2>{stor(def.navn)}{enhet(v.maal)}{glatt ? ', glidende treårssnitt' : ' per år'}</h2>
          <p className="muted">Velg opptil {MAKS_SKOLER} enheter. Fargen følger enheten. Stiplet linje er medianen for enhetene som vises. Grafen følger nivået og målet som er valgt over.</p>
        </header>
        <div className="cmprow" role="group" aria-label="Nivå og utjevning i grafen">
          {(['p3', 'p4', 'n4s'] as SkanMaal[]).map((id) => <button key={id} type="button" className="seg" aria-pressed={v.maal === id} onClick={() => set({ maal: id })}>{MAAL[id].label}</button>)}
          <span style={{ width: 10 }} />
          <button type="button" className="seg" aria-pressed={glatt} onClick={() => setGlatt(!glatt)} title="Snitt av tre år (året og de to foregående), jevner ut små enheter">Glidende treårssnitt</button>
        </div>
        <div className="cmprow ajg-chips" role="group" aria-label="Enheter i grafen">
          {sortert.map((r) => { const k = v.skoler.indexOf(r.e.id); return (
            <button key={r.e.id} type="button" aria-pressed={k >= 0} disabled={k < 0 && fulle} onClick={() => veksle(r.e.id)}>{k >= 0 && <i className={`k${k}`} />}{r.e.kort}</button>
          ); })}
        </div>
        <div className="legend">{serier.map((s) => <span key={s.id}><i className={`ajg-sw k${s.k}`} />{s.lab}</span>)}<span><i className="m" />Median</span></div>
        <SitLinjer aar={alleAar} serier={serier} median={medianLinje} forelopigFra={yN + 1} refLinje={null} d={grafD}
          label={`${def.navn}${enhet(v.maal)} ${y0} til ${yN} for ${serier.map((s) => s.lab).join(', ')}`} />
        <details><summary>Vis som tabell</summary>
          <div className="scroll"><table><thead><tr><th>År</th>{serier.map((s) => <th key={s.id}>{s.lab}</th>)}<th>Median</th></tr></thead>
            <tbody>{alleAar.map((y, i) => <tr key={y}><td>{y}</td>{serier.map((s) => <td key={s.id}>{nf(s.v[i], grafD)}</td>)}<td>{nf(medianLinje[i], grafD)}</td></tr>)}</tbody></table></div>
        </details>
      </section>

      {kontroll.length > 0 && (
        <section className="sec" aria-label="Kontroll mot NVI">
          <header>
            <span className="lab">Kontroll, {periodeTekst}</span>
            <h2>Fanger OpenAlex de norske artiklene?</h2>
            <p className="muted">For Norge kjenner vi fasiten: artiklene skolene selv har rapportert til NVI. Tabellen sammenligner OpenAlex-tellingen (samme metode som for de andre landene) med NVI. Ligger OpenAlex mye under NVI, blir enheten undervurdert i sammenligningen; det samme gjelder trolig for svenske og danske fakulteter som er avgrenset på samme måte.</p>
          </header>
          <div className="scroll">
            <table className="ajg-tab sit-dek">
              <thead><tr><th>Enhet</th><th>Avgrensning</th><th>Artikler OpenAlex</th><th>NVI</th><th>OpenAlex / NVI</th><th>AJG 4+ OpenAlex</th><th>NVI</th><th>AJG 3+ OpenAlex</th><th>NVI</th></tr></thead>
              <tbody>
                {kontroll.map(({ e, oa, nvi: k }) => k && (
                  <tr key={e.id} className={e.meg ? 'meg' : undefined}>
                    <td>{e.kort}{e.referanse ? <span className="muted"> · ref.</span> : null}</td>
                    <td style={{ textAlign: 'left' }}>{e.metode === 'institusjon' ? 'institusjon' : e.metode === 'fag' ? 'fagfelt' : 'tilknytningstekst'}</td>
                    <td>{nf(oa[N], 0)}</td><td>{nf(k[0], 0)}</td><td><b>{pct(oa[N], k[0])}</b></td>
                    <td>{nf(oa[A4S] + oa[A4], 0)}</td><td>{nf(k[1] + k[2], 0)}</td>
                    <td>{nf(oa[A4S] + oa[A4] + oa[A3], 0)}</td><td>{nf(k[1] + k[2] + k[3], 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(() => { const andre = rader.filter((r) => r.e.land !== 'NO').map((r) => ({ r, d: dekningAv(r.e) })).filter((x) => x.d.pst != null).sort((a, b) => (a.d.pst as number) - (b.d.pst as number));
            return andre.length > 0 && (<>
              <p className="muted" style={{ marginTop: 10 }}>Andre land har ingen NVI, men de nasjonale rapportene (SwePub i Sverige, Pure i Danmark, Vipunen/Research.fi i Finland) gir antall artikler for en periode. Lav dekning her betyr det samme: OpenAlex finner for få, og raten blir for lav.</p>
              <div className="scroll"><table className="ajg-tab sit-dek"><thead><tr><th>Enhet</th><th>Avgrensning</th><th>OpenAlex mot rapporten</th><th>Dekning</th></tr></thead>
                <tbody>{andre.map(({ r, d }) => <tr key={r.e.id}><td>{r.e.kort} <span className="muted">· {r.e.land}</span></td><td style={{ textAlign: 'left' }}>{r.e.metode === 'institusjon' ? 'institusjon' : r.e.metode === 'fag' ? 'fagfelt' : 'tilknytningstekst'}</td>
                  <td style={{ textAlign: 'left', whiteSpace: 'normal' }}>{d.tekst}</td><td className={(d.pst as number) < DEK_LAV ? 'skan-lav' : undefined}><b>{nf(d.pst, 0)} %</b></td></tr>)}</tbody></table></div>
            </>); })()}
          <p className="cap">OpenAlex tar med alle artikler og oversiktsartikler, også dem som ikke er rapportert til NVI (f.eks. utenlandske gjesteforfattere og artikler i tidsskrift utenfor NVI), så over 100 % er mulig. Tallene for AJG-nivåene er de viktigste, fordi det er dem sammenligningen bygger på.</p>
        </section>
      )}

      <section className="sec" aria-label="Nevnerne">
        <header>
          <span className="lab">Nevnerne</span>
          <h2>Hvor kommer årsverkene fra?</h2>
          <p className="muted">Faglige årsverk per år (snitt i {periodeTekst}) med og uten stipendiater/doktorander, kilde og hva tallet faktisk dekker. ETER er det europeiske registeret over høyere utdanning (hele institusjonen) og står som kontroll der enheten er hele institusjonen.</p>
        </header>
        <div className="scroll">
          <table className="ajg-tab sit-dek skan-nev">
            <thead><tr><th>Enhet</th><th>Kvalitet</th><th>Med</th><th>Uten</th><th>Gjelder</th><th>Kilde</th><th>Merknad</th></tr></thead>
            <tbody>
              {[...rader].sort((a, b) => LANDENE.indexOf(a.e.land) - LANDENE.indexOf(b.e.land) || a.e.kort.localeCompare(b.e.kort, 'nb')).map((r) => {
                const med = summer(r.e, aar, 'med'), uten = summer(r.e, aar, 'uten');
                const eter = Object.entries(r.e.nevner.eter ?? {}).filter(([y]) => aar.includes(y));
                return (
                  <tr key={r.e.id} className={r.e.meg ? 'meg' : undefined}>
                    <td>{r.e.kort} <span className="muted">· {r.e.land}</span></td>
                    <td>{kvChip(r.e.nevner.kvalitet)}</td>
                    <td>{med.arsv != null && med.aar ? nf(med.arsv / med.aar, 0) : '–'}</td>
                    <td>{uten.arsv != null && uten.aar ? nf(uten.arsv / uten.aar, 0) : '–'}</td>
                    <td style={{ textAlign: 'left', whiteSpace: 'normal', minWidth: 180 }}>{r.e.nevner.nivaa ?? '–'}</td>
                    <td style={{ textAlign: 'left', whiteSpace: 'normal', minWidth: 160 }} className="muted">{r.e.nevner.kilde ?? ''}</td>
                    <td style={{ textAlign: 'left', whiteSpace: 'normal', minWidth: 260 }} className="muted">{r.e.nevner.forklaring ?? ''}{eter.length ? ` ETER (hele institusjonen): ${eter.map(([y, x]) => `${y} ${nf(x, 0)}`).join(', ')}.` : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sec ajg-metode" aria-label="Metode">
        <span className="lab">Metode og forbehold</span>
        <ul>
          <li><b>Samme metode i alle land.</b> {data.kilde}. Artiklene er det OpenAlex knytter til enheten (type article og review), hentet {data.hentet ?? '–'}. Hele institusjoner (NHH, BI, CBS, SSE, Hanken m.fl.) hentes direkte; fakulteter og institutter finnes ikke som egne enheter i OpenAlex og avgrenses på forfatternes tilknytningstekst (Norge, Sverige, Danmark) eller på fagfelt ved hele universitetet (Finland, som den nasjonale statistikken).</li>
          <li><b>AJG 2024</b> (Chartered ABS) er satt per tidsskrift via ISSN og brukt for alle år. Lista er lisensbelagt; bare antall per enhet og år ligger i dataene.</li>
          <li><b>Nevner.</b> Norge: DBH (UN1 + stipendiater + postdoktorer, eller UN1 + postdoktorer). Sverige: UKÄ (forskande och undervisande personal + doktorander, heltidsekvivalenter). Danmark: VIP-årsverk (Danske Universiteters nøgletal C, AU i tal, CBS). Finland: Vipunen (undervisnings- og forskningspersonale i fagfelt 511 + 512, karrieretrinn I–IV eller II–IV). Svenske doktorander er ofte på stipend og ikke ansatt, så «med stipendiater» er ikke helt det samme i alle land.</li>
          <li><b>Kvalitet.</b> God = tall for selve enheten. Middels = kjent, litt annen avgrensning (hele Aarhus BSS, rekonstruert GU-tall, finsk fagfelt). Svak = fagområdet for hele universitetet; per 100 er da skjult som standard, fordi nevneren kan være mye for høy (Danmark, hele samfunnsvitenskap) eller for lav (Sverige, bare én faggruppe).</li>
          <li><b>Kontroll.</b> For Norge er OpenAlex-tellingen sammenlignet med NVI (tabellen over). Det viser hvor mye avgrensningen på tilknytningstekst bommer, og gir en pekepinn for de svenske og danske fakultetene.</li>
          <li><b>Ikke den norske rangeringen.</b> Tallene her bygger på OpenAlex, ikke NVI, og kan derfor avvike fra AJG-sammenligningen. Foreløpige tall ({generert}).</li>
        </ul>
      </section>
    </div>
  );
}
