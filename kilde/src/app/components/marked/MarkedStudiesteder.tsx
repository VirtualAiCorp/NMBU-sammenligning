import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MapPin, Table2, ArrowUpDown, ArrowDown, ArrowUp, X } from '../../ikoner';
import {
  FORBEHOLD, Kort, Laster, Merke, NMBU, NMBU_FARGE, ANDRE_FARGE, PRIVAT_FARGE, Spark, Valg, Velger, dato, endringFarge, fortegn,
  hentStudiesteder, nf, pst, td, tdV, th, thV, thead, useFil, type Oversikt, type Studiested, type Studiesteder,
} from './felles';

/**
 * Fanen «Studiesteder» på Markedet (?marked=studiesteder): ett punkt per institusjon × studiested på et Leaflet-kart over
 * Norge, med størrelse etter registrerte studenter (DBH 124, høsten 2025) eller førstevalg (Samordna 2026) og farge etter
 * institusjon eller endring. Klikk gir et kort med tidsserier og de største programmene; tabellen under kan sorteres.
 * Data: public/marked/studiesteder.json (scripts/build-marked.py fra data/marked/studiesteder/, status-og-metode §59).
 * Kartflisene er Kartverkets gråtonekart (cache.kartverket.no, CC BY 4.0), som virker uten nøkkel på det publiserte nettstedet.
 */

const KARTFLISER = 'https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png';
const NORGE: L.LatLngBoundsExpression = [[57.8, 4.4], [71.3, 31.2]];
const PALETT = ['#2563EB', '#B45309', '#9333EA', '#DC2626', '#0891B2', '#65A30D', '#DB2777', '#CA8A04', '#7C3AED', '#0D9488', '#EA580C'];
const NIV_NAVN: Record<string, string> = { bachelor: 'Bachelor', master: 'Master', arsstudium: 'Årsstudium', profesjon: 'Profesjon', annet: 'Annet (videreutdanning, ph.d. m.m.)' };
const ENDRING = [
  { maks: -25, farge: '#b91c1c', label: 'ned 25 % eller mer' },
  { maks: -10, farge: '#f87171', label: 'ned 10–25 %' },
  { maks: 10, farge: '#9CA3AF', label: 'mindre enn ±10 %' },
  { maks: 25, farge: '#34d399', label: 'opp 10–25 %' },
  { maks: Infinity, farge: '#047857', label: 'opp 25 % eller mer' },
];
const NY_FARGE = '#6366F1';

type Storrelse = 'reg' | 'fv';
type Farge = 'inst' | 'endring';
type Sort = 'navn' | 'inst' | 'fylke' | 'prog' | 'reg' | 'regE' | 'fv' | 'fvE' | 'nett';

interface Verdier { r: number[]; fv: number[]; pd: number; ps: number }
interface Rad { s: Studiested; v: Verdier; reg: number; regE: number | null; fv: number; fvE: number | null; nett: number | null }

/** Summerer fordelingen for valgt fagfelt og nivå (eller hele stedet uten filter). */
function verdier(s: Studiested, ffI: number | null, nivI: number | null): Verdier {
  if (ffI == null && nivI == null) return { r: s.r, fv: s.fv, pd: s.pd, ps: s.ps };
  const r = new Array(s.r.length).fill(0), fv = new Array(s.fv.length).fill(0);
  let pd = 0, ps = 0;
  for (const a of s.a) {
    if ((ffI != null && a[0] !== ffI) || (nivI != null && a[1] !== nivI)) continue;
    pd += a[2]; ps += a[3];
    for (let i = 0; i < r.length; i++) r[i] += a[4 + i];
    for (let i = 0; i < fv.length; i++) fv[i] += a[4 + r.length + i];
  }
  return { r, fv, pd, ps };
}
const endring = (fra: number, til: number) => (fra > 0 ? (100 * (til - fra)) / fra : null);
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

export function MarkedStudiesteder({ data, ff, setFf }: { data: Oversikt; ff: string; setFf: (f: string) => void }) {
  const ss = useFil<Studiesteder>(hentStudiesteder);
  if (ss === undefined) return <Laster tekst="Laster studiestedene …" />;
  if (ss === null) return <Laster tekst="Fant ikke studiestedsdataene (marked/studiesteder.json)." />;
  return <Visning data={data} ss={ss} ff={ff} setFf={setFf} />;
}

function Visning({ data, ss, ff, setFf }: { data: Oversikt; ss: Studiesteder; ff: string; setFf: (f: string) => void }) {
  const [niv, setNiv] = useState('alle');
  const [inst, setInst] = useState('alle');
  const [storrelse, setStorrelse] = useState<Storrelse>('reg');
  const [farge, setFarge] = useState<Farge>('inst');
  const [nett, setNett] = useState(true);
  const [valgt, setValgt] = useState<string | null>(`${NMBU}-as`);
  const [sort, setSort] = useState<{ k: Sort; ned: boolean }>({ k: 'reg', ned: true });

  const instNavn = (k: string) => data.inst[k]?.k ?? ss.inst[k]?.k ?? k;
  const instLang = (k: string) => data.inst[k]?.n ?? ss.inst[k]?.n ?? k;
  const ffI = ff === 'alle' ? null : ss.ff.indexOf(ff);
  const nivI = niv === 'alle' ? null : ss.niv.indexOf(niv);
  const N = ss.aar.length, F = ss.fvAar.length;
  const filtrert = ffI != null || nivI != null;

  const rader: Rad[] = useMemo(() => ss.steder
    .filter((s) => (inst === 'alle' || s.i === inst) && (nett || s.t !== 'n'))
    .map((s) => {
      const v = verdier(s, ffI, nivI);
      const o = s.o[0] + s.o[1] + s.o[2];
      return { s, v, reg: v.r[N - 1], regE: endring(v.r[2], v.r[N - 1]), fv: v.fv[F - 1], fvE: endring(v.fv[0], v.fv[F - 1]), nett: o ? (s.o[1] + s.o[2]) / o : null };
    })
    .filter((r) => r.reg > 0 || r.fv > 0 || r.v.pd > 0 || r.v.ps > 0), [ss, inst, nett, ffI, nivI, N, F]);

  const storst = (r: Rad) => (storrelse === 'reg' ? r.reg : r.fv);
  const endr = (r: Rad) => (storrelse === 'reg' ? r.regE : r.fvE);
  // De største institusjonene i utvalget får hver sin farge; resten er grå. NMBU har alltid sin egen.
  const instFarge = useMemo(() => {
    const tot = new Map<string, number>();
    for (const r of rader) if (r.s.i !== NMBU) tot.set(r.s.i, (tot.get(r.s.i) ?? 0) + storst(r));
    const m = new Map<string, string>([[NMBU, NMBU_FARGE]]);
    [...tot.entries()].sort((a, b) => b[1] - a[1]).slice(0, PALETT.length).forEach(([k], i) => m.set(k, PALETT[i]));
    return m;
  }, [rader, storrelse]); // eslint-disable-line react-hooks/exhaustive-deps
  const fargeFor = (r: Rad) => {
    if (farge === 'inst') return instFarge.get(r.s.i) ?? ANDRE_FARGE;
    const e = endr(r);
    if (e == null) return storst(r) > 0 ? NY_FARGE : ANDRE_FARGE;
    return ENDRING.find((x) => e < x.maks)?.farge ?? ANDRE_FARGE;
  };

  // ── Kartet (Leaflet direkte, uten react-leaflet) ─────────────────────────
  const kartDiv = useRef<HTMLDivElement>(null);
  const kart = useRef<L.Map | null>(null);
  const lag = useRef<L.LayerGroup | null>(null);
  useEffect(() => {
    if (!kartDiv.current || kart.current) return;
    const m = L.map(kartDiv.current, { scrollWheelZoom: false, minZoom: 3, maxZoom: 13, zoomSnap: 0.5, attributionControl: true });
    L.tileLayer(KARTFLISER, { maxZoom: 18, attribution: '© <a href="https://www.kartverket.no/" target="_blank" rel="noreferrer">Kartverket</a> (CC BY 4.0)' }).addTo(m);
    m.fitBounds(NORGE);
    lag.current = L.layerGroup().addTo(m);
    kart.current = m;
    return () => { m.remove(); kart.current = null; lag.current = null; };
  }, []);

  const maks = Math.max(1, ...rader.filter((r) => r.s.ll).map(storst));
  useEffect(() => {
    const g = lag.current;
    if (!g) return;
    g.clearLayers();
    // Største først (små sirkler kan klikkes oppå store); NMBU tegnes til slutt så den alltid ligger øverst
    const synlige = rader.filter((r) => r.s.ll && storst(r) > 0)
      .sort((a, b) => (a.s.i === NMBU ? 1 : 0) - (b.s.i === NMBU ? 1 : 0) || storst(b) - storst(a));
    const nmbuHoved = synlige.filter((r) => r.s.i === NMBU && r.s.t === 's').sort((a, b) => storst(b) - storst(a))[0]?.s.id;
    for (const r of synlige) {
      const erNmbu = r.s.i === NMBU;
      const radius = Math.max(3.5, Math.sqrt(storst(r) / maks) * 36);
      const f = fargeFor(r);
      const sirkel = L.circleMarker(r.s.ll as [number, number], {
        radius, color: erNmbu ? '#003B34' : r.s.id === valgt ? '#111827' : f, weight: erNmbu || r.s.id === valgt ? 3 : 1.2,
        fillColor: f, fillOpacity: erNmbu ? 0.75 : 0.5, dashArray: r.s.t === 'n' ? '4 3' : undefined,
      });
      const e = endr(r);
      sirkel.bindTooltip(
        `<div style="font-size:12px;line-height:1.45"><b>${esc(instNavn(r.s.i))} ${esc(r.s.n)}</b>${r.s.t === 'n' ? ' (nett)' : ''}<br/>`
        + `${esc(r.s.kn ?? '')}${r.s.f ? `, ${esc(r.s.f)}` : ''}<br/>`
        + `Registrerte høsten 2025: <b>${nf(r.reg)}</b><br/>Førstevalg 2026: <b>${nf(r.fv)}</b>`
        + `${e != null ? `<br/>Endring ${storrelse === 'reg' ? '2021–2025' : '2021–2026'}: ${fortegn(e, 0, ' %')}` : ''}</div>`,
        { className: 'map-tooltip', direction: 'top', offset: [0, -radius + 2] },
      );
      sirkel.on('click', () => setValgt(r.s.id));
      sirkel.addTo(g);
      if (r.s.id === nmbuHoved) {
        // Fast navnelapp ved siden av NMBU-sirkelen (egen tooltip, så sirkelen beholder sin egen)
        g.addLayer(L.tooltip({ permanent: true, direction: 'right', offset: [radius + 3, 0], className: 'map-tooltip map-etikett', interactive: false })
          .setLatLng(r.s.ll as [number, number]).setContent(`<b>NMBU ${esc(r.s.n)}</b>`));
      }
    }
  }, [rader, storrelse, farge, valgt, maks, instFarge]); // eslint-disable-line react-hooks/exhaustive-deps

  const velg = (id: string) => {
    setValgt(id);
    const s = ss.steder.find((x) => x.id === id);
    if (s?.ll && kart.current) kart.current.panTo(s.ll);
  };

  // ── Tabellen ─────────────────────────────────────────────────────────────
  const sortert = useMemo(() => {
    const t = (v: number | null) => (v == null ? -Infinity : v);
    const ut = [...rader];
    ut.sort((a, b) => {
      let d = 0;
      switch (sort.k) {
        case 'navn': d = a.s.n.localeCompare(b.s.n, 'nb'); break;
        case 'inst': d = instNavn(a.s.i).localeCompare(instNavn(b.s.i), 'nb'); break;
        case 'fylke': d = (a.s.f ?? 'å').localeCompare(b.s.f ?? 'å', 'nb'); break;
        case 'prog': d = a.v.pd - b.v.pd || a.v.ps - b.v.ps; break;
        case 'reg': d = a.reg - b.reg; break;
        case 'regE': d = t(a.regE) - t(b.regE); break;
        case 'fv': d = a.fv - b.fv; break;
        case 'fvE': d = t(a.fvE) - t(b.fvE); break;
        case 'nett': d = t(a.nett) - t(b.nett); break;
      }
      return sort.ned ? -d : d;
    });
    return ut;
  }, [rader, sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const Sorter = ({ k, children, venstre }: { k: Sort; children: ReactNode; venstre?: boolean }) => {
    const aktiv = sort.k === k;
    const Pil = aktiv ? (sort.ned ? ArrowDown : ArrowUp) : ArrowUpDown;
    return (
      <th className={venstre ? thV : th} aria-sort={aktiv ? (sort.ned ? 'descending' : 'ascending') : 'none'}>
        <button className="inline-flex items-center gap-1" onClick={() => setSort({ k, ned: aktiv ? !sort.ned : !['navn', 'inst', 'fylke'].includes(k) })}>
          {children}<Pil className="w-3 h-3" style={{ opacity: aktiv ? 1 : 0.4 }} />
        </button>
      </th>
    );
  };

  const instValg = useMemo(() => [...new Set(ss.steder.map((s) => s.i))].sort((a, b) => instNavn(a).localeCompare(instNavn(b), 'nb')), [ss]); // eslint-disable-line react-hooks/exhaustive-deps
  const sumReg = rader.reduce((s, r) => s + r.reg, 0), sumFv = rader.reduce((s, r) => s + r.fv, 0);
  const utenKart = rader.filter((r) => !r.s.ll && storst(r) > 0);
  const valgtSted = ss.steder.find((s) => s.id === valgt) ?? null;
  const dk = ss.dekning;
  const legendInst = [...instFarge.entries()].filter(([k]) => rader.some((r) => r.s.i === k));

  return (
    <div className="space-y-5">
      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
        <div className="flex flex-wrap items-end gap-3">
          <Velger etikett="Fagfelt" verdi={ff} onVelg={setFf}
            valg={[{ id: 'alle', label: 'Alle fagfelt' }, ...data.fagfelt.filter((f) => ss.ff.includes(f.id)).map((f) => ({ id: f.id, label: f.n }))]} />
          <Velger etikett="Nivå" verdi={niv} onVelg={setNiv} valg={[{ id: 'alle', label: 'Alle nivåer' }, ...ss.niv.map((n) => ({ id: n, label: NIV_NAVN[n] ?? n }))]} />
          <Velger etikett="Institusjon" verdi={inst} onVelg={setInst} valg={[{ id: 'alle', label: 'Alle institusjoner' }, ...instValg.map((k) => ({ id: k, label: instNavn(k) }))]} bredde={200} />
          <label className="flex items-center gap-1.5 text-xs pb-1" style={{ color: 'var(--nmbu-neutral-1)' }}>
            <input type="checkbox" checked={nett} onChange={(e) => setNett(e.target.checked)} /> Ta med nettstudier (stiplet)
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Valg etikett="Størrelse" verdi={storrelse} onVelg={setStorrelse} valg={[{ id: 'reg', label: 'Registrerte studenter 2025' }, { id: 'fv', label: 'Førstevalg 2026' }]} />
          <Valg etikett="Farge" verdi={farge} onVelg={setFarge} valg={[{ id: 'inst', label: 'Institusjon' }, { id: 'endring', label: storrelse === 'reg' ? 'Endring 2021–2025' : 'Endring 2021–2026' }]} />
        </div>
      </div>

      <Kort ikon={MapPin} tittel={`${nf(rader.length)} studiesteder`}
        undertekst={<>Én sirkel per institusjon og studiested. Størrelsen er {storrelse === 'reg' ? <><b>registrerte studenter høsten 2025</b> (DBH 124, alle nivåer)</> : <><b>førstevalg i Samordna 2026</b> (lokalt opptak har ikke førstevalg her)</>}. I utvalget: {nf(sumReg)} registrerte og {nf(sumFv)} førstevalg. NMBU er uthevet med mørk ring. Nettstudier ligger på institusjonens største studiested og er stiplet. Klikk på en sirkel for detaljer.</>}
        kilde={<>Kilde: DBH/HK-dir tabell 124 (registrerte per campus) og 123 (kontroll), Samordna opptak 2021–2026, SSB (kommuneendringer) og Kartverket (stedsnavn, kommunepunkt og kartfliser, CC BY 4.0). Hentet {dato(ss.hentet)}.</>}
        forbehold={[FORBEHOLD.studiesteder, 'Campusene til én institusjon i samme by (for eksempel Gløshaugen, Dragvoll og Øya i Trondheim) er slått sammen til ett studiested. Flere institusjoner i samme by ligger på samme punkt.',
          `${nf(utenKart.length)} studiesteder i utlandet vises bare i tabellen. Uten fagfeltfilter teller «Annet» med videreutdanning, ph.d. og andre program uten grad.`]}>
        <div className="grid lg:grid-cols-5 gap-4 min-w-0">
          <div className="lg:col-span-3 min-w-0">
            <div ref={kartDiv} style={{ height: 'min(620px, 75vh)', minHeight: 380, borderRadius: 10, border: '1px solid var(--nmbu-neutral-3)', zIndex: 0 }} aria-label="Kart over studiestedene" />
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-1)' }}>
              {farge === 'inst'
                ? <>{legendInst.map(([k, f]) => <span key={k} className="inline-flex items-center gap-1"><i style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: f, display: 'inline-block' }} />{instNavn(k)}</span>)}
                  <span className="inline-flex items-center gap-1"><i style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: ANDRE_FARGE, display: 'inline-block' }} />andre</span></>
                : <>{ENDRING.map((x) => <span key={x.label} className="inline-flex items-center gap-1"><i style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: x.farge, display: 'inline-block' }} />{x.label}</span>)}
                  <span className="inline-flex items-center gap-1"><i style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: NY_FARGE, display: 'inline-block' }} />nytt (0 i 2021)</span></>}
            </div>
          </div>
          <div className="lg:col-span-2 min-w-0">
            {valgtSted
              ? <StedKort s={valgtSted} ss={ss} instLang={instLang} instNavn={instNavn} data={data} filtrert={filtrert ? verdier(valgtSted, ffI, nivI) : null} lukk={() => setValgt(null)} />
              : <div className="rounded-xl p-4 text-sm" style={{ border: '1px dashed var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>Klikk på en sirkel eller en rad i tabellen for å se studiestedet.</div>}
          </div>
        </div>
      </Kort>

      <Kort ikon={Table2} tittel="Alle studiesteder i utvalget"
        undertekst={<>Klikk på en kolonne for å sortere og på en rad for å åpne kortet. Program = DBH-program med registrerte studenter høsten 2025 / aktive Samordna-koder 2026 (de to overlapper: en Samordna-kode er som regel opptaket til et DBH-program). Nett/desentralisert er andelen av de registrerte høsten 2025 som DBH fører som nettbasert eller desentralisert undervisning.</>}
        kilde={<>Dekning: {nf(dk.aktiveDbhMedSted)} av {nf(dk.aktiveDbhProgram)} aktive DBH-program ({pst((100 * dk.aktiveDbhMedSted) / dk.aktiveDbhProgram, 0)}) har studiested i DBH 124, blant dem {nf(dk.aktiveMedLokaltOpptakMedSted)} av {nf(dk.aktiveMedLokaltOpptak)} med lokalt opptak. Resten hadde ingen registrerte studenter 2019–2025 (mest nye program og videreutdanning). {pst(100 * dk.andelStudenterMedSted2025, 1)} av de {nf(dk.registrerte2025)} registrerte høsten 2025 har studiested; {nf(dk.registrerte2025Nett)} av dem står på en egen nettcampus. Alle {nf(dk.samordnaKoder)} Samordna-koder har studiested. Kontroll: summen per institusjon i DBH 124 avviker {ss.kontroll.avvik === 0 ? 'ikke' : `${nf(ss.kontroll.avvik)} ganger`} fra DBH 123 (mer enn 1 %) i 2019–2025. {nf(ss.kontroll.bareSamordna)} steder finnes bare i Samordna og {nf(ss.kontroll.bareDbh)} bare i DBH.</>}>
        <div className="overflow-auto" style={{ maxHeight: 620 }}>
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0" style={{ zIndex: 1 }}>
              <tr style={thead}>
                <Sorter k="navn" venstre>Studiested</Sorter><Sorter k="inst" venstre>Institusjon</Sorter><Sorter k="fylke" venstre>Fylke</Sorter>
                <Sorter k="prog">DBH-program / SO-koder</Sorter><Sorter k="reg">Registrerte 2025</Sorter><th className={th}>2019–2025</th><Sorter k="regE">Endring 2021–25</Sorter>
                <Sorter k="fv">Førstevalg 2026</Sorter><Sorter k="fvE">Endring 2021–26</Sorter><Sorter k="nett">Nett/desentr.</Sorter>
              </tr>
            </thead>
            <tbody>
              {sortert.map((r) => {
                const erNmbu = r.s.i === NMBU;
                return (
                  <tr key={r.s.id} onClick={() => velg(r.s.id)} className="cursor-pointer"
                    style={{ borderTop: '1px solid var(--nmbu-neutral-3)', ...(erNmbu ? { backgroundColor: 'var(--nmbu-green-light)' } : {}), ...(r.s.id === valgt ? { backgroundColor: 'var(--nmbu-beige-light)' } : {}) }}>
                    <td className={tdV} style={{ fontWeight: erNmbu ? 700 : 600 }}>
                      {r.s.n}
                      {r.s.t === 'n' && <Merke tekst="nett" />}
                      {r.s.t === 'u' && <Merke tekst="utlandet" />}
                      {r.s.k === 'S' && <Merke tekst="bare Samordna" bg="#FEF3C7" fg="#92400E" tittel="Stedet har Samordna-koder, men ingen registrerte studenter i DBH 124" />}
                      {r.s.k === 'D' && <Merke tekst="bare DBH" bg="#E0E7FF" fg="#3730A3" tittel="Stedet har registrerte studenter i DBH 124, men ingen Samordna-koder" />}
                    </td>
                    <td className={tdV}><span style={{ color: instFarge.get(r.s.i) ?? 'inherit', fontWeight: 600 }}>{instNavn(r.s.i)}</span></td>
                    <td className={tdV} style={{ color: 'var(--nmbu-neutral-1)' }}>{r.s.f ?? '–'}</td>
                    <td className={td}>{nf(r.v.pd)} / {nf(r.v.ps)}</td>
                    <td className={td} style={{ fontWeight: 700 }}>{nf(r.reg)}</td>
                    <td className={td}><Spark verdier={r.v.r} farge={erNmbu ? NMBU_FARGE : PRIVAT_FARGE} /></td>
                    <td className={td} style={{ color: endringFarge(r.regE) }}>{fortegn(r.regE, 0, ' %')}</td>
                    <td className={td} style={{ fontWeight: 700 }}>{nf(r.fv)}</td>
                    <td className={td} style={{ color: endringFarge(r.fvE) }}>{fortegn(r.fvE, 0, ' %')}</td>
                    <td className={td}>{r.nett == null ? '–' : pst(100 * r.nett, 0)}</td>
                  </tr>
                );
              })}
              {sortert.length === 0 && <tr><td colSpan={10} className="px-3 py-4 text-center" style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen studiesteder passer filtrene.</td></tr>}
            </tbody>
          </table>
        </div>
      </Kort>
    </div>
  );
}

// ── Kortet for ett studiested ─────────────────────────────────────────────────
function StedKort({ s, ss, instLang, instNavn, data, filtrert, lukk }: {
  s: Studiested; ss: Studiesteder; instLang: (k: string) => string; instNavn: (k: string) => string; data: Oversikt; filtrert: Verdier | null; lukk: () => void;
}) {
  const N = ss.aar.length, F = ss.fvAar.length;
  const alleAar = [...new Set([...ss.aar, ...ss.fvAar])].sort();
  const graf = alleAar.map((aar) => {
    const i = ss.aar.indexOf(aar), j = ss.fvAar.indexOf(aar);
    return { aar, reg: i >= 0 && s.k !== 'S' ? s.r[i] : null, fv: j >= 0 && s.k !== 'D' ? s.fv[j] : null };
  });
  const o = s.o[0] + s.o[1] + s.o[2];
  const perNiv = ss.niv.map((n, ni) => {
    const v = verdier(s, null, ni);
    return { n, reg: v.r[N - 1], fv: v.fv[F - 1], prog: v.pd };
  }).filter((x) => x.reg || x.fv || x.prog);
  const perFelt = ss.ff.map((f, fi) => ({ f, reg: verdier(s, fi, null).r[N - 1], fv: verdier(s, fi, null).fv[F - 1] }))
    .filter((x) => x.reg || x.fv).sort((a, b) => b.reg + b.fv - (a.reg + a.fv)).slice(0, 5);
  const feltNavn = (id: string) => data.fagfelt.find((f) => f.id === id)?.n ?? id;
  const erNmbu = s.i === NMBU;
  const tall = (etikett: string, verdi: string, under?: string) => (
    <div className="rounded-lg px-3 py-2" style={{ backgroundColor: erNmbu ? 'var(--nmbu-green-light)' : 'var(--nmbu-beige-light)' }}>
      <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{etikett}</div>
      <div className="tabular-nums" style={{ fontSize: 17, fontWeight: 700 }}>{verdi}</div>
      {under && <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{under}</div>}
    </div>
  );
  return (
    <div className="rounded-xl p-4 space-y-3 min-w-0 overflow-x-auto" style={{ border: `1px solid ${erNmbu ? NMBU_FARGE : 'var(--nmbu-neutral-3)'}`, backgroundColor: '#fff' }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div style={{ fontFamily: "'Lora', serif", fontSize: 18, color: 'var(--nmbu-green-dark)' }}>{instNavn(s.i)} {s.n}</div>
          <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)' }}>
            {instLang(s.i)}{s.kn ? ` · ${s.kn} kommune` : ''}{s.f ? `, ${s.f}` : ''}
            {' · '}{s.k === 'SD' ? 'Samordna og DBH' : s.k === 'S' ? 'bare Samordna' : 'bare DBH'}
          </div>
          {s.v && s.v.length > 0 && <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>Også kalt: {s.v.join(', ')}</div>}
        </div>
        <button onClick={lukk} aria-label="Lukk kortet"><X className="w-4 h-4" style={{ color: 'var(--nmbu-neutral-2)' }} /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {tall('Registrerte høsten 2025', nf(s.r[N - 1]), s.r[2] ? `2021: ${nf(s.r[2])} (${fortegn(endring(s.r[2], s.r[N - 1]), 0, ' %')})` : undefined)}
        {tall('Førstevalg 2026', nf(s.fv[F - 1]), s.fv[0] ? `2021: ${nf(s.fv[0])} (${fortegn(endring(s.fv[0], s.fv[F - 1]), 0, ' %')})` : s.k === 'D' ? 'lokalt opptak, ikke i Samordna' : undefined)}
        {tall('DBH-program med studenter', nf(s.pd), `${nf(s.ps)} aktive Samordna-koder 2026 (overlapper)`)}
        {tall('Nett eller desentralisert', o ? pst((100 * (s.o[1] + s.o[2])) / o, 0) : '–', `DBH 2025${s.sf[0] ? `; Samordna: ${nf(s.sf[1])} nett, ${nf(s.sf[2])} samling av ${nf(s.sf[0])}` : ''}`)}
      </div>
      {filtrert && (
        <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-1)' }}>I utvalget (fagfelt/nivå): <b>{nf(filtrert.r[N - 1])}</b> registrerte, <b>{nf(filtrert.fv[F - 1])}</b> førstevalg, {nf(filtrert.pd)} DBH-program og {nf(filtrert.ps)} Samordna-koder. Resten av kortet gjelder hele studiestedet.</div>
      )}
      <div style={{ height: 170 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={graf} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="aar" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf(v)} />
            <Tooltip formatter={(v: number) => nf(v)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line dataKey="reg" name="Registrerte (høst)" stroke={erNmbu ? NMBU_FARGE : PRIVAT_FARGE} strokeWidth={2} dot={{ r: 2 }} connectNulls />
            <Line dataKey="fv" name="Førstevalg (Samordna)" stroke="#6366F1" strokeWidth={1.8} dot={{ r: 2 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {perNiv.length > 0 && (
        <table className="w-full border-collapse text-xs">
          <thead><tr style={thead}><th className={thV}>Nivå</th><th className={th}>DBH-progr.</th><th className={th}>Reg. 2025</th><th className={th}>FV 2026</th></tr></thead>
          <tbody>{perNiv.map((x) => (
            <tr key={x.n} style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}><td className={tdV}>{NIV_NAVN[x.n] ?? x.n}</td><td className={td}>{nf(x.prog)}</td><td className={td}>{nf(x.reg)}</td><td className={td}>{nf(x.fv)}</td></tr>
          ))}</tbody>
        </table>
      )}
      {perFelt.length > 0 && (
        <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-1)' }}>
          <b>Største fagfelt:</b> {perFelt.map((x) => `${feltNavn(x.f)} (${nf(x.reg)} reg., ${nf(x.fv)} FV)`).join(' · ')}
        </div>
      )}
      {s.td.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Største program etter registrerte (DBH, høsten 2025)</div>
          <table className="w-full border-collapse text-xs">
            <tbody>{s.td.map(([navn, kode, ni, reg, reg21]) => (
              <tr key={kode} style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
                <td className={tdV}>{navn} <span style={{ color: 'var(--nmbu-neutral-2)' }}>{NIV_NAVN[ss.niv[ni]]?.split(' ')[0].toLowerCase()} · {kode}</span></td>
                <td className={td} style={{ fontWeight: 700 }}>{nf(reg)}</td>
                <td className={td} style={{ color: endringFarge(reg21 ? reg - reg21 : null) }}>{reg21 ? fortegn(endring(reg21, reg), 0, ' %') : 'ny'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {s.ts.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Største program etter førstevalg (Samordna 2026)</div>
          <table className="w-full border-collapse text-xs">
            <tbody>{s.ts.map(([navn, kode, ni, fv, fv21, nettK]) => (
              <tr key={kode} style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
                <td className={tdV}>{navn}{nettK ? <Merke tekst="nett" /> : null} <span style={{ color: 'var(--nmbu-neutral-2)' }}>{NIV_NAVN[ss.niv[ni]]?.split(' ')[0].toLowerCase()} · {kode}</span></td>
                <td className={td} style={{ fontWeight: 700 }}>{nf(fv)}</td>
                <td className={td} style={{ color: endringFarge(fv != null && fv21 ? fv - fv21 : null) }}>{fv21 ? fortegn(endring(fv21, fv ?? 0), 0, ' %') : 'ny'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>
        Endringene er 2021–2025 for registrerte og 2021–2026 for førstevalg. Studenttallene er fra DBH 124 og gjelder hele programmet på dette stedet.
      </div>
    </div>
  );
}
