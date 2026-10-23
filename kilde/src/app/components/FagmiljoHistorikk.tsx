import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertTriangle, Info, ExternalLink, Filter } from '../ikoner';
import { CsvExportButton } from './CsvExportButton';
import { lastNedTabellCsv } from '../utils/csvExport';
import { Kildeboks, dbh } from './Kildeboks';

/**
 * Fagmiljøet over tid (2004–2025): tilsatte og publisering per institusjon, fakultet og institutt, med sammenslåinger.
 * Data: public/fagmiljo/historikk/index.json og <institusjonskode>.json (scripts/build-historikk.py).
 * To visninger: «Slik det ble rapportert» (hver DBH-kode og hver fakultets-/avdelingskode for seg) og
 * «Sammenlignbar» (dagens institusjon og dagens fakulteter bakover, med forløperne og nedlagte enheter koblet inn).
 */

type Verdi = (number | null)[];
type Serie = Record<string, Verdi>;
interface Kode { kode: string; kort: string; navn: string; rolle: 'dagens' | 'forloper'; inn: number | null; etterfolger: string | null; merknad?: string | null; aar: number[]; pubSumAvd: boolean }
interface Bygger { fra: string; regel: string; merknad: string | null; aar: [number, number] }
interface SmEnhet { id: string; navn: string; ukoblet: boolean; aar: Serie; bygger: Bygger[]; fak?: string }
interface Hendelse { aar: number; type: 'fusjon' | 'kode' | 'navn' | 'omorganisering'; tekst: string; kilde: string; detalj?: string[] }
interface InstData {
  kode: string; kort: string; navn: string; periode: [number, number];
  kilde?: { navn: string; url: string } | null; kildeKontrollert: boolean; merknad?: string | null;
  koder: Kode[]; forloperUtenKode: { kort: string; navn: string; inn: number; status: string }[]; hendelser: Hendelse[];
  rapportert: { inst: Record<string, Serie>; fak: Record<string, Record<string, { navn: string; aar: Serie }>>; avd: Record<string, Record<string, { navn: string; fak: string; aar: Serie }>> };
  sammenlignbar: { inst: Serie; puDobbel: number[]; fak: SmEnhet[]; avd: SmEnhet[]; dekning: Record<string, number>; sisteAar: number };
}
interface Indeks {
  hentet: string; periode: [number, number]; datakilder: string[]; nett: boolean;
  institusjoner: { kode: string; kort: string; navn: string; forlopere: string[]; forloperUtenKode: string[]; aar: [number, number] | null; fusjoner: number[] }[];
}

const BASE = `${import.meta.env.BASE_URL}fagmiljo/historikk/`;
const hentet: Record<string, Promise<unknown>> = {};
const hent = <T,>(fil: string): Promise<T | null> =>
  (hentet[fil] ??= fetch(BASE + fil).then((r) => (r.ok ? r.json() : null)).catch(() => { delete hentet[fil]; return null; })) as Promise<T | null>;

// Rekkefølgen i hver årsverdi (feltet «mal» i JSON-en)
const I = { aw: 0, fa: 1, re: 2, fo: 3, kvf: 4, pu: 5, pp: 6, fd: 7, n2: 8, p4: 9 } as const;
const g = (v: Verdi | undefined, k: keyof typeof I) => (v ? v[I[k]] : null);
const del = (a: number | null, b: number | null, f = 1) => (a != null && b ? (a / b) * f : null);

interface Mal { id: string; label: string; desc: string; additiv: boolean; dec: number; pst?: boolean; publ?: boolean; f: (v: Verdi | undefined) => number | null }
const MAL: Mal[] = [
  { id: 'aw', label: 'Alle årsverk', additiv: true, dec: 0, desc: 'Alle tilsatte i årsverk, også teknisk og administrativt ansatte (DBH 225, per 1. oktober).', f: (v) => g(v, 'aw') },
  { id: 'fa', label: 'Faglige årsverk', additiv: true, dec: 0, desc: 'Undervisnings-, forsknings- og formidlingsstillinger (UN1, UN3, UN4) uten rekrutteringsstillinger.', f: (v) => g(v, 'fa') },
  { id: 're', label: 'Rekruttering', additiv: true, dec: 0, desc: 'Årsverk i stipendiat- og postdoktorstillinger (UN2).', f: (v) => g(v, 're') },
  { id: 'ta', label: 'Teknisk og administrativt', additiv: true, dec: 0, desc: 'Alle årsverk minus faglige og rekruttering.', f: (v) => { const a = g(v, 'aw'), b = g(v, 'fa'), c = g(v, 're'); return a == null ? null : a - (b ?? 0) - (c ?? 0); } },
  { id: 'fo', label: 'Førstestillinger', additiv: true, dec: 0, desc: 'Årsverk som professor, dosent, førsteamanuensis og førstelektor.', f: (v) => g(v, 'fo') },
  { id: 'foAndel', label: 'Andel førstestillinger', additiv: false, dec: 1, pst: true, desc: 'Førstestillinger i prosent av faglige årsverk.', f: (v) => del(g(v, 'fo'), g(v, 'fa'), 100) },
  { id: 'kv', label: 'Kvinneandel faglige', additiv: false, dec: 1, pst: true, desc: 'Kvinners andel av de faglige årsverkene.', f: (v) => del(g(v, 'kvf'), g(v, 'fa'), 100) },
  { id: 'pu', label: 'Antall publikasjoner', additiv: true, dec: 0, publ: true, desc: 'Vitenskapelige publikasjoner (DBH 373). Finnes for institusjoner og enkeltavdelinger, ikke summert for fakulteter: samme publikasjon kan høre til flere avdelinger.', f: (v) => g(v, 'pu') },
  { id: 'pp', label: 'Publiseringspoeng', additiv: true, dec: 0, publ: true, desc: 'Publiseringspoeng (forfatterandeler vektet med kanalnivå og publikasjonstype).', f: (v) => g(v, 'pp') },
  { id: 'fd', label: 'Forfatterandeler', additiv: true, dec: 0, publ: true, desc: 'Institusjonens eller enhetens andel av forfatterne; kan summeres uten dobbelttelling.', f: (v) => g(v, 'fd') },
  { id: 'ppfa', label: 'Poeng per faglig årsverk', additiv: false, dec: 2, publ: true, desc: 'Publiseringspoeng delt på faglige årsverk samme år.', f: (v) => del(g(v, 'pp'), g(v, 'fa')) },
  { id: 'n2', label: 'Andel nivå 2', additiv: false, dec: 1, pst: true, publ: true, desc: 'Andel av publiseringspoengene i kanaler på nivå 2 (DBH 374).', f: (v) => del(g(v, 'n2'), g(v, 'p4'), 100) },
];

const sumVerdier = (vs: (Verdi | undefined)[]): Verdi | undefined => {
  const finnes = vs.filter((v): v is Verdi => !!v);
  if (!finnes.length) return undefined;
  return finnes[0].map((_, i) => (finnes.some((v) => v[i] != null) ? finnes.reduce((s, v) => s + (v[i] ?? 0), 0) : null));
};
const nf = (v: number | null | undefined, d: number) => (v == null ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d }));
const fmt = (v: number | null | undefined, m: Mal) => (v == null ? '–' : `${nf(v, m.dec)}${m.pst ? ' %' : ''}`);

// Kategoriske farger, validert (dataviz validate_palette.js) mot hvit flate og mørk flate (#1a211e).
// Lys modus har tre farger under 3:1 mot flaten; derfor alltid tegnforklaring og tabell.
const FARGER_LYS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];
const FARGER_MORK = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];
const MAKS = 8;

function useMork() {
  const les = () => typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  const [mork, setMork] = useState(les);
  useEffect(() => {
    const o = new MutationObserver(() => setMork(les()));
    o.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => o.disconnect();
  }, []);
  return mork;
}

type Niva = 'inst' | 'fak' | 'avd';
type Modus = 'sammenlignbar' | 'rapportert';
interface Enhet { id: string; navn: string; aar: Serie; ukoblet?: boolean; bygger?: Bygger[]; under?: string }

const knapp = (aktiv: boolean) => ({
  backgroundColor: aktiv ? 'var(--nmbu-green-dark)' : '#fff', color: aktiv ? '#fff' : 'var(--nmbu-neutral-1)', fontWeight: aktiv ? 600 : 400,
});

function Segment<T extends string>({ valg, verdi, sett }: { valg: [T, string, string?][]; verdi: T; sett: (v: T) => void }) {
  return (
    <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', width: 'fit-content' }}>
      {valg.map(([id, l, t], i) => (
        <button key={id} onClick={() => sett(id)} title={t} className="px-3 py-1.5 text-xs"
          style={{ ...knapp(verdi === id), borderRight: i < valg.length - 1 ? '1px solid var(--nmbu-neutral-3)' : 'none' }}>{l}</button>
      ))}
    </div>
  );
}

export function FagmiljoHistorikk({ standardInst = '1173', standardFak }: { standardInst?: string; standardFak?: string }) {
  const mork = useMork();
  const farger = mork ? FARGER_MORK : FARGER_LYS;
  const gra = mork ? '#6b7280' : '#9ca3af';
  const flate = mork ? '#1a211e' : '#ffffff';
  const [indeks, setIndeks] = useState<Indeks | null | undefined>(undefined);
  const [instKode, setInstKode] = useState(standardInst);
  const [data, setData] = useState<InstData | null | undefined>(undefined);
  const [niva, setNiva] = useState<Niva>(standardFak ? 'fak' : 'inst');
  const [modus, setModus] = useState<Modus>('sammenlignbar');
  const [malId, setMalId] = useState('aw');
  const [fakValg, setFakValg] = useState<string | undefined>(standardFak);
  const [valgt, setValgt] = useState<Record<string, number> | null>(null); // serie-id → fargeplass
  const [visning, setVisning] = useState<'graf' | 'tabell'>('graf');

  useEffect(() => { let aktiv = true; hent<Indeks>('index.json').then((d) => { if (aktiv) setIndeks(d); }); return () => { aktiv = false; }; }, []);
  useEffect(() => {
    let aktiv = true; setData(undefined);
    hent<InstData>(`${instKode}.json`).then((d) => { if (aktiv) setData(d); });
    return () => { aktiv = false; };
  }, [instKode]);
  // Nytt utvalg av serier når institusjon, nivå, visning eller fakultet skifter
  useEffect(() => { setValgt(null); }, [instKode, niva, modus, fakValg]);

  const mal = MAL.find((m) => m.id === malId)!;
  const malIkkeTilgjengelig = mal.id === 'pu' && niva === 'fak';

  // Fakultetene man kan velge på institutt-nivå
  const fakulteter = useMemo((): { id: string; navn: string }[] => {
    if (!data) return [];
    if (modus === 'sammenlignbar') return data.sammenlignbar.fak.map((f) => ({ id: f.id, navn: f.navn }));
    const flere = Object.keys(data.rapportert.fak).length > 1;
    const kortAv = Object.fromEntries(data.koder.map((k) => [k.kode, k.kort]));
    return Object.entries(data.rapportert.fak).flatMap(([c, fs]) => Object.entries(fs).map(([f, x]) => ({ id: `${c}|${f}`, navn: flere ? `${x.navn} · ${kortAv[c]}` : x.navn })));
  }, [data, modus]);
  // Standard: fakultetet fra siden (fakultetssidene), ellers fakultetet med flest institutter
  const flestInstitutter = useMemo(() => {
    if (!data) return undefined;
    const antall = (id: string) => (modus === 'sammenlignbar' ? data.sammenlignbar.avd.filter((a) => a.fak === id && !a.ukoblet).length
      : Object.values(data.rapportert.avd[id.split('|')[0]] ?? {}).filter((a) => a.fak === id.split('|')[1]).length);
    return [...fakulteter].sort((a, b) => antall(b.id) - antall(a.id))[0]?.id;
  }, [data, modus, fakulteter]);
  const fak = fakValg && fakulteter.some((f) => f.id === fakValg) ? fakValg
    : (modus === 'sammenlignbar' && standardFak && fakulteter.some((f) => f.id === standardFak) ? standardFak : flestInstitutter);

  const aarListe = useMemo(() => {
    if (!data) return [] as string[];
    const [a0, a1] = data.periode;
    return Array.from({ length: a1 - a0 + 1 }, (_, i) => String(a0 + i));
  }, [data]);

  // ── Seriene for valgt nivå og visning ──
  const { enheter, stablet, total } = useMemo((): { enheter: Enhet[]; stablet: boolean; total?: Serie } => {
    if (!data) return { enheter: [] };
    const kortAv = Object.fromEntries(data.koder.map((k) => [k.kode, k]));
    const flereKoder = data.koder.length > 1;
    if (niva === 'inst') {
      if (modus === 'rapportert') {
        return { stablet: false, enheter: data.koder.filter((k) => data.rapportert.inst[k.kode]).map((k) => ({ id: k.kode, navn: `${k.kort} (${k.kode})`, aar: data.rapportert.inst[k.kode] })) };
      }
      // Sammenlignbar: forløperne stablet under dagens institusjon, hver bare for årene før sammenslåingen
      const deler = data.koder.map((k) => {
        const s = data.rapportert.inst[k.kode] ?? {};
        return { id: k.kode, navn: k.rolle === 'dagens' ? `${k.kort}` : `${k.kort} (før ${k.inn})`, aar: Object.fromEntries(Object.entries(s).filter(([y]) => k.inn == null || +y < k.inn)) };
      }).filter((d) => Object.keys(d.aar).length);
      if (mal.additiv) return { stablet: true, enheter: deler, total: data.sammenlignbar.inst };
      return { stablet: false, enheter: [{ id: 'sammenlignbar', navn: `${data.kort} med forløpere`, aar: data.sammenlignbar.inst }] };
    }
    if (niva === 'fak') {
      if (modus === 'rapportert') {
        return { stablet: false, enheter: Object.entries(data.rapportert.fak).flatMap(([c, fs]) => Object.entries(fs).map(([f, x]) => ({
          id: `${c}|${f}`, navn: flereKoder ? `${x.navn} · ${kortAv[c]?.kort ?? c}` : x.navn, aar: x.aar }))) };
      }
      return { stablet: mal.additiv, total: data.sammenlignbar.inst, enheter: data.sammenlignbar.fak.map((f) => ({ id: f.id, navn: f.navn, aar: f.aar, ukoblet: f.ukoblet, bygger: f.bygger })) };
    }
    // Institutt
    if (!fak) return { enheter: [] };
    if (modus === 'rapportert') {
      const [c, f] = fak.split('|');
      return { stablet: false, enheter: Object.entries(data.rapportert.avd[c] ?? {}).filter(([, x]) => x.fak === f).map(([a, x]) => ({ id: `${c}|${a}`, navn: x.navn, aar: x.aar, under: a })) };
    }
    const avd = data.sammenlignbar.avd.filter((x) => x.fak === fak);
    const fakTotal = data.sammenlignbar.fak.find((x) => x.id === fak)?.aar;
    return { stablet: mal.additiv && mal.id !== 'pu', total: fakTotal, enheter: avd.map((x) => ({ id: x.id, navn: x.navn, aar: x.aar, ukoblet: x.ukoblet, bygger: x.bygger, under: x.id.includes('|') ? undefined : x.id })) };
  }, [data, niva, modus, mal, fak]);

  // Sortert etter størrelse siste år (alle årsverk), slik at standardutvalget er de største enhetene
  const sortert = useMemo(() => {
    const storrelse = (e: Enhet) => { const ys = Object.keys(e.aar).sort(); return g(e.aar[ys[ys.length - 1]], 'aw') ?? g(e.aar[ys[ys.length - 1]], 'pp') ?? 0; };
    return [...enheter].sort((a, b) => Number(!!a.ukoblet) - Number(!!b.ukoblet) || storrelse(b) - storrelse(a));
  }, [enheter]);

  const plasser = useMemo((): Record<string, number> => {
    if (valgt) return valgt;
    const start = sortert.filter((e) => !(stablet && e.ukoblet)).slice(0, sortert.length > MAKS ? MAKS - 1 : MAKS);
    return Object.fromEntries(start.map((e, i) => [e.id, i]));
  }, [valgt, sortert, stablet]);
  const veksle = (id: string) => {
    const p = { ...plasser };
    if (id in p) delete p[id];
    else {
      const brukt = new Set(Object.values(p));
      const ledig = Array.from({ length: MAKS }, (_, i) => i).find((i) => !brukt.has(i));
      if (ledig == null) return;
      p[id] = ledig;
    }
    setValgt(p);
  };

  // ── Grafdata ──
  const synlige = sortert.filter((e) => e.id in plasser);
  const resten = stablet ? sortert.filter((e) => !(e.id in plasser) && !e.ukoblet) : [];
  const ukobletDeler = stablet ? sortert.filter((e) => !(e.id in plasser) && e.ukoblet) : [];
  const ANDRE = '__andre', UKOBLET = '__ukoblet';
  const rader = aarListe.map((y) => {
    const r: Record<string, number | string | null> = { aar: y };
    for (const e of synlige) r[e.id] = mal.f(e.aar[y]);
    if (resten.length) r[ANDRE] = mal.f(sumVerdier(resten.map((e) => e.aar[y])));
    if (ukobletDeler.length) r[UKOBLET] = mal.f(sumVerdier(ukobletDeler.map((e) => e.aar[y])));
    return r;
  });
  const harVerdi = rader.some((r) => Object.entries(r).some(([k, v]) => k !== 'aar' && typeof v === 'number'));
  const forsteAar = rader.find((r) => Object.entries(r).some(([k, v]) => k !== 'aar' && typeof v === 'number'))?.aar as string | undefined;
  const sisteAar = [...rader].reverse().find((r) => Object.entries(r).some(([k, v]) => k !== 'aar' && typeof v === 'number'))?.aar as string | undefined;
  const radVis = forsteAar && sisteAar ? rader.filter((r) => r.aar >= forsteAar && r.aar <= sisteAar) : [];

  const fargeAv = (id: string) => (id === ANDRE ? gra : id === UKOBLET ? gra : farger[plasser[id] ?? 0]);
  const navnAv = (id: string) => (id === ANDRE ? `Andre enheter (${resten.length})` : id === UKOBLET ? 'Ikke koblet til dagens struktur' : sortert.find((e) => e.id === id)?.navn ?? id);
  const serier = [...synlige.map((e) => e.id), ...(resten.length ? [ANDRE] : []), ...(ukobletDeler.length ? [UKOBLET] : [])];

  const hendelser = (data?.hendelser ?? []).filter((h) => radVis.some((r) => r.aar === String(h.aar)));
  const hendelseAar = [...new Set(hendelser.map((h) => h.aar))];
  const ukobletAar = Object.entries(data?.sammenlignbar.dekning ?? {}).filter(([, d]) => d < 99.5);

  const tooltip = ({ active, label }: { active?: boolean; label?: string }) => {
    if (!active || !label) return null;
    const r = rader.find((x) => x.aar === label);
    if (!r) return null;
    const verdier = serier.map((id) => ({ id, v: r[id] as number | null })).filter((x) => x.v != null).sort((a, b) => (b.v ?? 0) - (a.v ?? 0));
    const sum = stablet ? verdier.reduce((s, x) => s + (x.v ?? 0), 0) : null;
    const h = (data?.hendelser ?? []).filter((x) => String(x.aar) === label);
    return (
      <div className="rounded-lg px-3 py-2 text-xs shadow-md" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral)', maxWidth: 360 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{label} · {mal.label}</div>
        {verdier.map((x) => (
          <div key={x.id} className="flex items-center gap-2 justify-between">
            <span className="flex items-center gap-1.5 min-w-0"><span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: fargeAv(x.id) }} /><span className="truncate">{navnAv(x.id)}</span></span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(x.v, mal)}</span>
          </div>
        ))}
        {sum != null && verdier.length > 1 && <div className="flex justify-between mt-1 pt-1" style={{ borderTop: '1px solid var(--nmbu-neutral-3)', fontWeight: 700 }}><span>Sum</span><span>{fmt(sum, mal)}</span></div>}
        {h.map((x, i) => <div key={i} className="mt-1.5" style={{ color: 'var(--nmbu-neutral-2)' }}>{x.type === 'omorganisering' ? '┆' : '│'} {x.tekst}</div>)}
      </div>
    );
  };

  // Direkte etikett på siste punkt når det er få linjer
  const direkte = !stablet && serier.length <= 4;
  const sistIndeks = (id: string) => { for (let i = radVis.length - 1; i >= 0; i--) if (typeof radVis[i][id] === 'number') return i; return -1; };

  const lastNed = () => {
    const linjer: (string | number | null)[][] = [[`${data?.kort} · ${mal.label} · ${modus === 'sammenlignbar' ? 'sammenlignbar (dagens struktur)' : 'slik det ble rapportert'}`, ...aarListe]];
    for (const e of sortert) linjer.push([e.navn, ...aarListe.map((y) => { const v = mal.f(e.aar[y]); return v == null ? null : Math.round(v * 100) / 100; })]);
    lastNedTabellCsv(`fagmiljo-historikk-${data?.kort}-${niva}-${mal.id}.csv`, linjer);
  };
  // Alle tall for institusjonen: én rad per nivå × visning × enhet × år, med alle målene som kolonner
  const lastNedAlt = () => {
    if (!data) return;
    const kortAv = Object.fromEntries(data.koder.map((k) => [k.kode, k.kort]));
    const linjer: (string | number | null)[][] = [['Institusjon', 'Visning', 'Nivå', 'DBH-kode', 'Fakultet', 'Enhetskode', 'Enhet', 'Ikke koblet', 'År', ...MAL.map((m) => m.label + (m.pst ? ' (%)' : ''))]];
    const ut = (visn: string, niv: string, kode: string, fak: string, id: string, navn: string, ukoblet: boolean, s: Serie) => {
      for (const y of Object.keys(s).sort()) linjer.push([data.kort, visn, niv, kode, fak, id, navn, ukoblet ? 'ja' : '', y, ...MAL.map((m) => { const v = m.id === 'pu' && niv === 'Fakultet' ? null : m.f(s[y]); return v == null ? null : Math.round(v * 100) / 100; })]);
    };
    for (const [c, s] of Object.entries(data.rapportert.inst)) ut('Rapportert', 'Institusjon', c, '', c, `${kortAv[c] ?? c}`, false, s);
    for (const [c, fs] of Object.entries(data.rapportert.fak)) for (const [f, x] of Object.entries(fs)) ut('Rapportert', 'Fakultet', c, x.navn, f, x.navn, false, x.aar);
    for (const [c, as] of Object.entries(data.rapportert.avd)) for (const [a, x] of Object.entries(as)) ut('Rapportert', 'Institutt', c, data.rapportert.fak[c]?.[x.fak]?.navn ?? x.fak, a, x.navn, false, x.aar);
    ut('Sammenlignbar', 'Institusjon', data.kode, '', data.kode, `${data.kort} med forløpere`, false, data.sammenlignbar.inst);
    for (const f of data.sammenlignbar.fak) ut('Sammenlignbar', 'Fakultet', data.kode, f.navn, f.id, f.navn, f.ukoblet, f.aar);
    const fakNavn = Object.fromEntries(data.sammenlignbar.fak.map((f) => [f.id, f.navn]));
    for (const a of data.sammenlignbar.avd) ut('Sammenlignbar', 'Institutt', data.kode, fakNavn[a.fak ?? ''] ?? a.fak ?? '', a.id, a.navn, a.ukoblet, a.aar);
    lastNedTabellCsv(`fagmiljo-historikk-${data.kort}-alle-tall.csv`, linjer);
  };

  if (indeks === undefined) return <div className="text-sm" style={{ color: 'var(--nmbu-neutral-2)' }}>Laster …</div>;
  if (indeks === null) return <Melding tone="advarsel">Fant ikke historikkdataene (fagmiljo/historikk/index.json). Kjør <code>python3 scripts/build-historikk.py</code>.</Melding>;
  const instInfo = indeks.institusjoner.find((x) => x.kode === instKode);

  return (
    <div className="flex flex-col gap-5">
      {!indeks.nett && (
        <Melding tone="advarsel">
          DBH var ikke tilgjengelig da tallene sist ble bygget ({indeks.hentet.split('-').reverse().join('.')}). Siden viser derfor årene som finnes i det eksisterende uttrekket
          (2019–2025, dagens institusjonskoder). Forløperinstitusjonene og årene 2004–2018 kommer med når <code>scripts/build-historikk.py</code> kjøres med tilgang til DBH-API-et.
        </Melding>
      )}

      {/* Filterraden */}
      <div className="rounded-2xl p-4 flex flex-wrap items-end gap-4" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
        <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Institusjon
          <select value={instKode} onChange={(e) => { setInstKode(e.target.value); setFakValg(undefined); }} className="rounded-lg px-2 py-1.5 text-sm"
            style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', color: 'var(--nmbu-neutral)' }}>
            {indeks.institusjoner.map((x) => <option key={x.kode} value={x.kode}>{x.kort}{x.forlopere.length || x.forloperUtenKode.length ? ' (sammenslått)' : ''}</option>)}
          </select>
        </label>
        <div className="flex flex-col gap-1 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Nivå
          <Segment<Niva> valg={[['inst', 'Institusjon'], ['fak', 'Fakultet'], ['avd', 'Institutt']]} verdi={niva} sett={setNiva} />
        </div>
        <div className="flex flex-col gap-1 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Visning
          <Segment<Modus> valg={[['sammenlignbar', 'Sammenlignbar', 'Dagens institusjon og struktur bakover: forløpere og nedlagte enheter koblet inn'], ['rapportert', 'Slik det ble rapportert', 'Hver institusjonskode og fakultets-/avdelingskode for seg, som i DBH']]} verdi={modus} sett={setModus} />
        </div>
        {niva === 'avd' && (
          <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
            Fakultet
            <select value={fak ?? ''} onChange={(e) => setFakValg(e.target.value)} className="rounded-lg px-2 py-1.5 text-sm" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', color: 'var(--nmbu-neutral)', maxWidth: 360 }}>
              {fakulteter.map((f) => <option key={f.id} value={f.id}>{f.navn}</option>)}
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Mål
          <select value={malId} onChange={(e) => setMalId(e.target.value)} className="rounded-lg px-2 py-1.5 text-sm" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', color: 'var(--nmbu-neutral)' }}>
            <optgroup label="Tilsatte (DBH 225)">{MAL.filter((m) => !m.publ).map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</optgroup>
            <optgroup label="Publisering (DBH 373/374)">{MAL.filter((m) => m.publ).map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</optgroup>
          </select>
        </label>
      </div>

      {data === undefined && <div className="text-sm" style={{ color: 'var(--nmbu-neutral-2)' }}>Laster {instInfo?.kort ?? ''} …</div>}
      {data === null && <Melding tone="advarsel">Fant ikke tallene for {instInfo?.kort ?? instKode}.</Melding>}
      {data && (
        <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
              <div>
                <div style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)', fontSize: 15 }}>{data.navn}: {mal.label.toLowerCase()} {forsteAar && sisteAar ? `${forsteAar}–${sisteAar}` : ''}</div>
                <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                  {mal.desc} {modus === 'sammenlignbar' ? (niva === 'inst' ? 'Forløperne er lagt sammen for årene før sammenslåingen.' : 'Nedlagte enheter er koblet til dagens enheter der det lar seg gjøre; resten står som «ikke koblet».') : 'Hver kode for seg, slik DBH har dem.'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Segment<'graf' | 'tabell'> valg={[['graf', 'Graf'], ['tabell', 'Tabell']]} verdi={visning} sett={setVisning} />
                <CsvExportButton onExport={lastNed} label="Last ned CSV (visningen)" />
                <CsvExportButton onExport={lastNedAlt} label="Last ned alle tall" />
              </div>
            </div>

            {malIkkeTilgjengelig ? (
              <Melding tone="info">Antall publikasjoner kan ikke summeres til fakultet (samme publikasjon kan høre til flere avdelinger). Velg publiseringspoeng eller forfatterandeler, eller se institusjon eller institutt.</Melding>
            ) : !harVerdi ? (
              <Melding tone="info">Ingen tall for dette utvalget.</Melding>
            ) : visning === 'graf' ? (
              <>
                {/* Tegnforklaring = velger: klikk for å vise eller skjule (maks åtte farger) */}
                <div className="flex flex-wrap gap-1.5 my-3 items-center">
                  <Filter className="w-3.5 h-3.5" style={{ color: 'var(--nmbu-neutral-2)' }} />
                  {sortert.filter((e) => !(stablet && e.ukoblet)).map((e) => {
                    const pa = e.id in plasser;
                    const fullt = !pa && Object.keys(plasser).length >= MAKS;
                    return (
                      <button key={e.id} onClick={() => veksle(e.id)} disabled={fullt} title={fullt ? 'Maks åtte enheter i grafen; skjul en for å vise en annen' : e.navn}
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: pa ? 'var(--nmbu-beige-light)' : '#fff', color: pa ? 'var(--nmbu-neutral)' : 'var(--nmbu-neutral-2)', opacity: fullt ? 0.5 : 1 }}>
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: pa ? fargeAv(e.id) : 'transparent', border: pa ? 'none' : '1px solid var(--nmbu-neutral-3)' }} />
                        <span className="truncate" style={{ maxWidth: 260 }}>{e.navn}</span>
                      </button>
                    );
                  })}
                  {resten.length > 0 && <span className="flex items-center gap-1.5 text-xs px-2" style={{ color: 'var(--nmbu-neutral-2)' }}><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: gra }} />Andre enheter ({resten.length})</span>}
                  {ukobletDeler.length > 0 && <span className="flex items-center gap-1.5 text-xs px-2" style={{ color: 'var(--nmbu-neutral-2)' }}><svg width="10" height="10"><rect width="10" height="10" fill="url(#hist-skravur)" stroke={gra} /></svg>Ikke koblet ({ukobletDeler.length})</span>}
                </div>
                <ResponsiveContainer width="100%" height={380}>
                  <ComposedChart data={radVis} margin={{ top: 22, right: direkte ? 120 : 16, left: 4, bottom: 0 }}>
                    <defs>
                      <pattern id="hist-skravur" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <rect width="6" height="6" fill={flate} />
                        <line x1="0" y1="0" x2="0" y2="6" stroke={gra} strokeWidth="2" />
                      </pattern>
                    </defs>
                    <CartesianGrid stroke={mork ? '#2a332f' : '#eceae4'} vertical={false} />
                    <XAxis dataKey="aar" tick={{ fontSize: 11, fill: 'var(--nmbu-neutral-2)' }} stroke={mork ? '#3a443f' : '#d6d3cc'} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--nmbu-neutral-2)' }} stroke={mork ? '#3a443f' : '#d6d3cc'} width={52}
                      tickFormatter={(v: number) => nf(v, mal.dec > 1 ? 1 : 0)} domain={stablet || !mal.pst ? [0, 'auto'] : ['auto', 'auto']} />
                    <Tooltip content={tooltip} cursor={{ stroke: 'var(--nmbu-neutral-2)', strokeDasharray: '3 3' }} />
                    {hendelseAar.map((y) => {
                      const hs = hendelser.filter((h) => h.aar === y);
                      const fusjon = hs.some((h) => h.type === 'fusjon' || h.type === 'kode');
                      return <ReferenceLine key={y} x={String(y)} stroke="var(--nmbu-neutral-2)" strokeDasharray={fusjon ? undefined : '3 3'} strokeWidth={fusjon ? 1.5 : 1}
                        label={fusjon ? { value: hs.some((h) => h.type === 'fusjon') ? 'Fusjon' : 'Ny kode', position: 'top', fontSize: 10, fill: 'var(--nmbu-neutral-2)' } : undefined} />;
                    })}
                    {stablet
                      ? [...serier].reverse().map((id) => (
                        <Area key={id} type="linear" dataKey={id} stackId="s" name={navnAv(id)} isAnimationActive={false}
                          stroke={flate} strokeWidth={1.5} fill={id === UKOBLET ? 'url(#hist-skravur)' : fargeAv(id)} fillOpacity={id === UKOBLET ? 1 : 0.9} connectNulls={false} />
                      ))
                      : serier.map((id) => {
                        const si = sistIndeks(id);
                        return (
                          <Line key={id} type="linear" dataKey={id} name={navnAv(id)} stroke={fargeAv(id)} strokeWidth={2} isAnimationActive={false}
                            dot={{ r: 3.5, strokeWidth: 2, stroke: flate, fill: fargeAv(id) }} activeDot={{ r: 5, stroke: flate, strokeWidth: 2 }} connectNulls={false}
                            label={direkte ? (p: { index?: number; x?: number; y?: number }) => (p.index === si && p.x != null && p.y != null
                              ? <text x={p.x + 8} y={p.y + 4} fontSize={11} fill="var(--nmbu-neutral-1)">{navnAv(id).length > 18 ? navnAv(id).slice(0, 17) + '…' : navnAv(id)}</text> : <g />) : undefined} />
                        );
                      })}
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
                  <span>│ hel linje: sammenslåing eller ny institusjonskode</span><span>┆ stiplet: omorganisering (fakulteter opprettet/avsluttet i DBH 210)</span>
                  {stablet && total && <span>Arealene summerer til {niva === 'avd' ? 'fakultetet' : 'institusjonen'}.</span>}
                </div>
              </>
            ) : (
              <Tabell enheter={sortert} aar={aarListe.filter((y) => !forsteAar || (y >= forsteAar && y <= (sisteAar ?? y)))} mal={mal} total={stablet ? total : undefined} />
            )}

            {modus === 'sammenlignbar' && niva !== 'inst' && ukobletAar.length > 0 && (
              <Melding tone="info" className="mt-3">
                Brudd i serien: i {ukobletAar.map(([y]) => y).join(', ')} er inntil {nf(Math.max(...ukobletAar.map(([, d]) => 100 - d)), 0)} % av årsverkene ved {data.kort} ikke koblet til en av dagens enheter
                (avdelinger som er nedlagt, slått sammen eller delt). De står skravert som «ikke koblet», så summen fortsatt stemmer med institusjonen.
              </Melding>
            )}
            {modus === 'sammenlignbar' && niva === 'inst' && data.sammenlignbar.puDobbel.length > 0 && mal.id === 'pu' && (
              <Melding tone="info" className="mt-3">Før sammenslåingen er antall publikasjoner summert over flere institusjoner; publikasjoner de skrev sammen telles da flere ganger. Publiseringspoeng og forfatterandeler har ikke dette problemet.</Melding>
            )}
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            <Tidslinje data={data} />
            {modus === 'sammenlignbar' && niva !== 'inst' && <Bygger enheter={synlige.length ? synlige : sortert} />}
            {modus === 'rapportert' && <Melding tone="info">
              «Slik det ble rapportert» viser hver institusjons- og fakultetskode for seg, med den fakultetstilhørigheten avdelingen hadde det året (DBH 210).
              En linje som stopper eller starter, er en sammenslåing, nedleggelse eller ny kode; bytt til «Sammenlignbar» for å se dagens struktur bakover.
            </Melding>}
          </div>
        </div>
      )}

      <Kildeboks kilder={[dbh(225, 'Tilsatte (årsverk) per avdeling og stillingskode'), dbh(220, 'Stillingskategorier'), dbh(373, 'Publisering per avdeling'), dbh(374, 'Publiseringspoeng per nivå'), dbh(210, 'Avdelinger, fakultet og gyldighetsperiode')]}
        merknad={<>Hentet {indeks.hentet.split('-').reverse().join('.')}. Tilsatte telles per 1. oktober og oppgis i årsverk (også kvinner og menn); DBH 225 har ikke antall personer. Publisering per publiseringsår.
          2026 publiseres i DBH våren 2027. Sammenslåingene står i <code>data/nmbu/historikk/fusjoner.json</code>, koblingene i <code>avdelingskobling.json</code>, og kontrollene i <code>rapport.md</code> i samme mappe.</>} />
    </div>
  );
}

function Melding({ tone, children, className = '' }: { tone: 'info' | 'advarsel'; children: ReactNode; className?: string }) {
  const adv = tone === 'advarsel';
  const Ikon = adv ? AlertTriangle : Info;
  return (
    <div className={`flex items-start gap-2 text-xs rounded-lg px-4 py-3 ${className}`}
      style={adv ? { backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', color: '#78350F' } : { backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)' }}>
      <Ikon className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{children}</span>
    </div>
  );
}

function Tabell({ enheter, aar, mal, total }: { enheter: Enhet[]; aar: string[]; mal: Mal; total?: Serie }) {
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
            <th className="px-2 py-2 text-left" style={{ position: 'sticky', left: 0, backgroundColor: 'var(--nmbu-beige-light)' }}>Enhet</th>
            {aar.map((y) => <th key={y} className="px-2 py-2 text-right">{y}</th>)}
          </tr>
        </thead>
        <tbody>
          {enheter.map((e) => (
            <tr key={e.id} style={{ borderTop: '1px solid var(--nmbu-neutral-3)', fontStyle: e.ukoblet ? 'italic' : undefined }}>
              <td className="px-2 py-1.5" style={{ position: 'sticky', left: 0, backgroundColor: '#fff', minWidth: 200 }}>{e.navn}</td>
              {aar.map((y) => <td key={y} className="px-2 py-1.5 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(mal.f(e.aar[y]), mal)}</td>)}
            </tr>
          ))}
          {total && (
            <tr style={{ borderTop: '2px solid var(--nmbu-neutral-3)', fontWeight: 700 }}>
              <td className="px-2 py-1.5" style={{ position: 'sticky', left: 0, backgroundColor: '#fff' }}>Sum</td>
              {aar.map((y) => <td key={y} className="px-2 py-1.5 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(mal.f(total[y]), mal)}</td>)}
            </tr>
          )}
        </tbody>
      </table>
      <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginTop: 6 }}>«–» = ikke rapportert. Kursiv = ikke koblet til dagens struktur.</div>
    </div>
  );
}

const TYPE: Record<Hendelse['type'], string> = { fusjon: 'Sammenslåing', kode: 'Ny kode', navn: 'Nytt navn', omorganisering: 'Omorganisering' };

function Tidslinje({ data }: { data: InstData }) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)', marginBottom: 8 }}>Sammenslåinger og omorganiseringer</div>
      <div className="flex flex-col gap-1 mb-3" style={{ fontSize: 12 }}>
        {data.koder.map((k) => (
          <div key={k.kode} className="flex flex-wrap gap-x-2">
            <span style={{ fontWeight: 600 }}>{k.kort}</span>
            <span style={{ color: 'var(--nmbu-neutral-2)' }}>DBH-kode {k.kode}</span>
            <span>{k.aar.length ? `tall ${k.aar[0]}–${k.aar[k.aar.length - 1]}` : 'ingen tall'}</span>
            {k.inn && <span style={{ color: 'var(--nmbu-neutral-2)' }}>· inn i {data.koder.find((x) => x.kode === k.etterfolger)?.kort ?? k.etterfolger} fra {k.inn}</span>}
            {k.pubSumAvd && <span style={{ color: 'var(--nmbu-neutral-2)' }}>· publikasjoner summert over avdelinger (ingen totalrad)</span>}
          </div>
        ))}
        {data.forloperUtenKode.map((f) => (
          <div key={f.kort} className="flex items-start gap-1.5" style={{ color: '#92400E' }}>
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span><b>{f.kort}</b> ({f.navn}, inn {f.inn}): ikke med ennå – {f.status}.</span>
          </div>
        ))}
      </div>
      <ol className="flex flex-col gap-2" style={{ fontSize: 12 }}>
        {data.hendelser.map((h, i) => (
          <li key={i} className="flex gap-2">
            <span style={{ fontWeight: 700, minWidth: 36, fontVariantNumeric: 'tabular-nums' }}>{h.aar}</span>
            <span>
              <span className="rounded px-1.5 py-0.5 mr-1.5" style={{ fontSize: 10, backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' }}>{TYPE[h.type]}</span>
              {h.tekst}
              {h.detalj?.map((d) => <div key={d} style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{d}</div>)}
            </span>
          </li>
        ))}
        {!data.hendelser.length && <li style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen sammenslåinger eller kodebytter i perioden.</li>}
      </ol>
      {data.merknad && <div className="mt-3" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{data.merknad}</div>}
      {data.kilde && (
        <div className="mt-3 flex flex-wrap items-center gap-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
          Kilde for sammenslåingene:
          <a href={data.kilde.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1" style={{ color: 'var(--nmbu-green-dark)' }}><ExternalLink className="w-3 h-3" /> {data.kilde.navn}</a>
          {!data.kildeKontrollert && <span>(lenken ikke kontrollert ennå; årstallene kontrolleres mot hvilke år hver kode rapporterer i DBH)</span>}
        </div>
      )}
    </div>
  );
}

function Bygger({ enheter }: { enheter: Enhet[] }) {
  const med = enheter.filter((e) => e.bygger?.some((b) => b.regel !== 'samme kode'));
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)', marginBottom: 4 }}>Hva den sammenlignbare serien bygger på</div>
      <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginBottom: 8 }}>
        Enheter med samme avdelingskode i dag er ikke listet. Koblingsreglene: samme fakultetskode, samme navn eller fakultetsnavn, eller manuell kobling
        (avdelingskobling.json). «Skjønn» betyr at koblingen bygger på navn og fagområde, ikke et dokumentert vedtak.
      </div>
      {med.length === 0 && <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>Alle enhetene i utvalget har samme avdelingskode hele perioden.</div>}
      <div className="flex flex-col gap-2" style={{ fontSize: 12, maxHeight: 360, overflowY: 'auto' }}>
        {med.map((e) => (
          <div key={e.id}>
            <div style={{ fontWeight: 600 }}>{e.navn}</div>
            {e.bygger!.filter((b) => b.regel !== 'samme kode').map((b, i) => (
              <div key={i} className="pl-3" style={{ color: 'var(--nmbu-neutral-1)' }} title={b.merknad ?? undefined}>
                ← {b.fra} <span style={{ color: 'var(--nmbu-neutral-2)' }}>({b.aar[0] === b.aar[1] ? b.aar[0] : `${b.aar[0]}–${b.aar[1]}`}, {b.regel})</span>
                {b.regel.includes('skjønn') && <span className="ml-1 rounded px-1" style={{ fontSize: 10, backgroundColor: '#FEF3C7', color: '#92400E' }}>antakelse</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
