import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Info, ExternalLink, MapPin, Home, Building2, Loader2 } from 'lucide-react';

/**
 * Bolig og studentboliger per studiested (oppskrift fra sammenligningsportalen, tilpasset appen):
 * NSO-dekningsgrad for studentboliger, SSB-kvadratmeterpriser rundt studiestedet og SSB-leiepriser som
 * referanse. Data: /bolig/bolig.json (scripts/build-bolig.py), lastes først når visningen åpnes.
 */

type Serie = Record<string, number>;
interface Kommune { navn: string; enebolig?: Serie; smahus?: Serie; blokk?: Serie; eneboligOms?: Serie; smahusOms?: Serie; blokkOms?: Serie; }
interface Nso { samskipnad: string; hybler: number | null; leiligheter: number | null; he: number | null; studenter: number | null; dekningsgrad: number | null; merknad: string | null; }
interface Sted {
  navn: string; kommune: string; kommunenavn: string; institusjoner: string[]; nmbu: boolean;
  tiers: { '30min': string[]; '2hr': string[]; fylke: string[] } | null; tierKilde: string | null; nsoNavn: string | null; nso: Nso | null;
}
interface Sone { kode: string; navn: string; definisjon: string[] | null; leie: Record<string, (number | null)[]>; }
interface BoligData {
  hentet: string; kilder: Record<string, string>; kommuner: Record<string, Kommune>;
  leie: { rom: string[]; soner: Sone[] };
  nso: { nasjonal_historikk: { aar: number; he: number; studenter: number; dekningsgrad: number }[]; samskipnad: { samskipnad: string; he: number; studenter: number; dekningsgrad: number }[] };
  steder: Sted[];
}

const TYPER = [
  { key: 'blokk', label: 'Blokkleilighet' },
  { key: 'smahus', label: 'Småhus/rekkehus' },
  { key: 'enebolig', label: 'Enebolig' },
] as const;
type Type = typeof TYPER[number]['key'];
const RADIUS = [
  { key: '30min', label: 'Kommuner innen ~30 min' },
  { key: '2hr', label: 'Kommuner innen ~2 timer' },
  { key: 'fylke', label: 'Hele fylket' },
] as const;
type Radius = typeof RADIUS[number]['key'];
const NSO_MAL = 20;
const PALETTE = ['#2563EB', '#B45309', '#9333EA', '#DC2626', '#0891B2', '#65A30D', '#DB2777', '#4B5563', '#CA8A04', '#7C3AED', '#0D9488', '#EA580C'];

const nf = (v: number, dec = 0) => v.toLocaleString('nb-NO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const kr = (v: number | null | undefined) => (v == null ? '–' : `${nf(v)} kr`);
const pct = (v: number | null | undefined) => (v == null ? '–' : `${nf(v, 1)} %`);
const sisteAar = (s?: Serie) => (s ? Object.keys(s).sort().pop() : undefined);
const verdi = (s: Serie | undefined, aar: string) => (s && s[aar] != null ? s[aar] : null);

function sonerFor(kommune: string, soner: Sone[]): Sone | undefined {
  return soner.find((z) => z.definisjon?.some((p) => (p.length === 4 ? kommune === p : kommune.startsWith(p)) && !(z.kode === '02' && kommune === '3201')));
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3 mb-4" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)' }}>
      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{children}</span>
    </div>
  );
}

export function StudiestedBolig({ steder: filter }: { steder?: string[] }) {
  const [data, setData] = useState<BoligData | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [tab, setTab] = useState<'sammenligning' | 'marked' | 'studentbolig'>('sammenligning');
  const [valgt, setValgt] = useState<string>('Ås');
  const [radius, setRadius] = useState<Radius>('30min');
  const [type, setType] = useState<Type>('blokk');
  const [maal, setMaal] = useState<'dekningsgrad' | 'kvm'>('dekningsgrad');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}bolig/bolig.json`)
      .then((r) => {
        if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setFeil(String(e)));
  }, []);

  const steder = useMemo(() => {
    if (!data) return [];
    const s = data.steder.filter((x) => !filter || filter.includes(x.navn));
    // «Oslo» og «Oslo m.fl.» er samme kommune og NSO-rad: slå sammen i visningen
    const map = new Map<string, Sted>();
    s.forEach((x) => {
      const key = x.kommune + '|' + (x.nsoNavn ?? '');
      const prev = map.get(key);
      if (prev) map.set(key, { ...prev, institusjoner: [...new Set([...prev.institusjoner, ...x.institusjoner])], nmbu: prev.nmbu || x.nmbu });
      else map.set(key, { ...x, navn: x.navn === 'Oslo m.fl.' ? 'Oslo' : x.navn });
    });
    return [...map.values()];
  }, [data, filter]);

  const colorFor = useMemo(() => {
    const m = new Map<string, string>();
    steder.forEach((s, i) => m.set(s.navn, s.nmbu ? '#025C4F' : PALETTE[i % PALETTE.length]));
    return (n: string) => m.get(n) ?? '#888';
  }, [steder]);

  if (feil) return <Note>Klarte ikke å laste boligdata ({feil}).</Note>;
  if (!data) return <div className="flex items-center gap-2 p-8" style={{ color: 'var(--nmbu-neutral-2)', fontSize: 13 }}><Loader2 className="w-4 h-4 animate-spin" /> Laster boligdata …</div>;

  const K = data.kommuner;
  const nmbuSted = steder.find((s) => s.nmbu) ?? steder[0];
  const sted = steder.find((s) => s.navn === valgt) ?? nmbuSted;
  const aarKjop = sisteAar(K[nmbuSted?.kommune ?? '0301']?.blokk) ?? '2024';
  const leieAar = Object.keys(data.leie.soner[0]?.leie ?? {}).sort().pop() ?? '';
  const ROM2 = 1; // indeks for «2 rom»

  const tabBtn = (id: typeof tab, label: string, Icon: typeof Home) => (
    <button key={id} onClick={() => setTab(id)} className="flex items-center gap-1.5 px-4 py-2 text-sm"
      style={{ backgroundColor: tab === id ? 'var(--nmbu-green-dark)' : '#fff', color: tab === id ? '#fff' : 'var(--nmbu-neutral-1)', fontWeight: tab === id ? 600 : 400 }}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  // ── NMBU-nøkkeltall ──
  const nk = nmbuSted && (() => {
    const k = K[nmbuSted.kommune];
    const sone = sonerFor(nmbuSted.kommune, data.leie.soner);
    const n = nmbuSted.nso;
    return [
      { l: `Dekningsgrad studentboliger ${nmbuSted.nsoNavn ?? ''}`, v: pct(n?.dekningsgrad), sub: n ? `${nf(n.he ?? 0)} hybelenheter · ${nf(n.studenter ?? 0)} studenter · NSOs mål ${NSO_MAL} %` : undefined },
      { l: `Blokkleilighet ${nmbuSted.kommunenavn} ${aarKjop}`, v: kr(verdi(k?.blokk, aarKjop)), sub: 'kvadratmeterpris' },
      { l: `Småhus/rekkehus ${aarKjop}`, v: kr(verdi(k?.smahus, aarKjop)), sub: 'kvadratmeterpris' },
      { l: `Leie 2 rom ${leieAar}`, v: kr(sone?.leie[leieAar]?.[ROM2]), sub: sone ? `prissone: ${sone.navn}` : 'ingen prissone for kommunen' },
    ];
  })();

  // ── Fane 1: sammenligning ──
  const sammenRows = steder.map((s) => ({
    s, dg: s.nso?.dekningsgrad ?? null, kvm: verdi(K[s.kommune]?.[type], aarKjop),
    sone: sonerFor(s.kommune, data.leie.soner),
  }));
  const barData = sammenRows
    .map((r) => ({ navn: `${r.s.navn} (${r.s.institusjoner.join(', ')})`, key: r.s.navn, value: maal === 'dekningsgrad' ? r.dg : r.kvm }))
    .filter((d): d is { navn: string; key: string; value: number } => d.value != null)
    .sort((a, b) => b.value - a.value);
  const trendAar = [...new Set(steder.flatMap((s) => Object.keys(K[s.kommune]?.[type] ?? {})))].sort();
  const trendData = trendAar.map((y) => {
    const row: Record<string, number | string> = { aar: y };
    steder.forEach((s) => { const v = verdi(K[s.kommune]?.[type], y); if (v != null) row[s.navn] = v; });
    return row;
  });

  // ── Fane 2: marked rundt studiestedet ──
  const kommuneListe = sted ? (sted.tiers ? sted.tiers[radius] : [sted.kommune]) : [];
  const markedRows = kommuneListe.map((k) => ({ k, d: K[k] })).filter((r) => r.d);
  const markedBar = markedRows
    .map((r) => ({ navn: r.d.navn, key: r.k, value: verdi(r.d[type], aarKjop) }))
    .filter((d): d is { navn: string; key: string; value: number } => d.value != null)
    .sort((a, b) => b.value - a.value);
  const prim = sted ? K[sted.kommune] : undefined;
  const primAar = [...new Set(TYPER.flatMap((t) => Object.keys(prim?.[t.key] ?? {})))].sort();
  const primTrend = primAar.map((y) => ({ aar: y, ...Object.fromEntries(TYPER.map((t) => [t.key, verdi(prim?.[t.key], y)])) }));
  const stedSone = sted ? sonerFor(sted.kommune, data.leie.soner) : undefined;

  // ── Fane 3: studentboliger ──
  const samsInst = (navn: string) => [...new Set(data.steder.filter((s) => s.nso?.samskipnad === navn).flatMap((s) => s.institusjoner))];
  const nmbuSams = nmbuSted?.nso?.samskipnad;

  return (
    <div>
      {nk && (
        <div className="rounded-2xl mb-6 px-6 py-5" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
          <div className="flex items-center gap-2" style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
            <MapPin className="w-3.5 h-3.5" /> {nmbuSted.navn} · {nmbuSted.institusjoner.join(', ')}
          </div>
          <div className="flex gap-8 flex-wrap">
            {nk.map((s) => (
              <div key={s.l}>
                <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 3 }}>{s.l}</div>
                <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{s.v}</div>
                {s.sub && <div style={{ fontSize: 9, opacity: 0.6, marginTop: 3 }}>{s.sub}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex rounded-lg overflow-hidden mb-5 flex-wrap" style={{ border: '1px solid var(--nmbu-neutral-3)', width: 'fit-content' }}>
        {tabBtn('sammenligning', 'Studiestedene side om side', MapPin)}
        {tabBtn('marked', 'Boligmarked rundt studiestedet', Home)}
        {tabBtn('studentbolig', 'Studentboliger', Building2)}
      </div>

      {tab === 'sammenligning' && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
          <Note>
            Dekningsgraden fra NSO gjelder alle studenter på studiestedet samlet (alle institusjoner og program), ikke det enkelte programmet.
            Kvadratmeterprisen gjelder studiestedets egen kommune ({aarKjop}); SSB skjuler tall der det er for få salg («–»).
          </Note>
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
              {([['dekningsgrad', 'Dekningsgrad studentboliger'], ['kvm', 'Kvadratmeterpris']] as const).map(([k, l]) => (
                <button key={k} onClick={() => setMaal(k)} className="px-3 py-1.5 text-xs"
                  style={{ backgroundColor: maal === k ? 'var(--nmbu-green-4)' : '#fff', color: maal === k ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-1)', fontWeight: maal === k ? 700 : 400 }}>{l}</button>
              ))}
            </div>
            {maal === 'kvm' && (
              <select value={type} onChange={(e) => setType(e.target.value as Type)} className="text-xs rounded-lg px-2 py-1.5" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
                {TYPER.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            )}
          </div>
          <ResponsiveContainer width="100%" height={Math.max(220, barData.length * 30 + 50)}>
            <BarChart data={barData} layout="vertical" margin={{ top: 14, right: 70, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => nf(v)} />
              <YAxis type="category" dataKey="navn" width={210} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [maal === 'dekningsgrad' ? pct(v) : kr(v), maal === 'dekningsgrad' ? 'Dekningsgrad' : `${TYPER.find((t) => t.key === type)!.label} ${aarKjop}`]} />
              {maal === 'dekningsgrad' && <ReferenceLine x={NSO_MAL} stroke="#6b7280" strokeDasharray="5 4" label={{ value: `NSOs mål ${NSO_MAL} %`, position: 'top', fontSize: 10, fill: '#6b7280' }} />}
              <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, formatter: (v: number) => (maal === 'dekningsgrad' ? pct(v) : nf(v)) }}>
                {barData.map((d) => <Cell key={d.key} fill={colorFor(d.key)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="overflow-x-auto mt-5">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                  {['Studiested', 'Institusjoner', 'Dekningsgrad', 'Hybelenheter', 'Studenter', 'Samskipnad', `Blokk ${aarKjop}`, `Småhus ${aarKjop}`, `Enebolig ${aarKjop}`, `Leie 2 rom ${leieAar}`].map((h, i) => (
                    <th key={h} className={`px-3 py-2 ${i > 1 && i !== 5 ? 'text-right' : 'text-left'}`} style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...sammenRows].sort((a, b) => (b.dg ?? -1) - (a.dg ?? -1)).map(({ s, sone }) => {
                  const k = K[s.kommune];
                  return (
                    <tr key={s.navn} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: s.nmbu ? 'var(--nmbu-green-4)' : 'transparent' }}>
                      <td className="px-3 py-2" style={{ fontWeight: 600 }}>{s.navn}{s.nsoNavn && s.nsoNavn !== s.navn ? <span style={{ fontWeight: 400, color: 'var(--nmbu-neutral-2)' }}> (NSO: {s.nsoNavn})</span> : null}</td>
                      <td className="px-3 py-2">{s.institusjoner.join(', ')}</td>
                      <td className="px-3 py-2 text-right" style={{ fontWeight: 700 }} title={s.nso?.merknad ?? undefined}>{s.nso?.merknad && s.nso.dekningsgrad == null ? s.nso.merknad : pct(s.nso?.dekningsgrad)}</td>
                      <td className="px-3 py-2 text-right">{s.nso?.he != null ? nf(s.nso.he) : '–'}</td>
                      <td className="px-3 py-2 text-right">{s.nso?.studenter != null ? nf(s.nso.studenter) : '–'}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--nmbu-neutral-2)' }}>{s.nso?.samskipnad ?? '–'}</td>
                      <td className="px-3 py-2 text-right">{kr(verdi(k?.blokk, aarKjop))}</td>
                      <td className="px-3 py-2 text-right">{kr(verdi(k?.smahus, aarKjop))}</td>
                      <td className="px-3 py-2 text-right">{kr(verdi(k?.enebolig, aarKjop))}</td>
                      <td className="px-3 py-2 text-right" title={sone ? `Prissone: ${sone.navn}` : 'Kommunen ligger i en tettstedssone som ikke kan kobles presist til kommunen'}>{sone ? kr(sone.leie[leieAar]?.[ROM2]) : '–'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6" style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>
            Kvadratmeterpris over tid, {TYPER.find((t) => t.key === type)!.label.toLowerCase()} i studiestedets kommune
          </div>
          <div className="flex gap-2 my-2">
            {TYPER.map((t) => (
              <button key={t.key} onClick={() => setType(t.key)} className="px-3 py-1 rounded-full text-xs"
                style={{ backgroundColor: type === t.key ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)', color: type === t.key ? '#fff' : 'var(--nmbu-neutral-1)' }}>{t.label}</button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="aar" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => nf(v)} width={60} />
              <Tooltip formatter={(v: number, n: string) => [kr(v), n]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {steder.map((s) => <Line key={s.navn} dataKey={s.navn} stroke={colorFor(s.navn)} strokeWidth={s.nmbu ? 3 : 2} dot={{ r: 2 }} connectNulls />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'marked' && sted && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
          <Note>
            «~30 min» og «~2 timer» er geografiske anslag ut fra kjent vei- og togforbindelse, ikke målte reisetider. «Hele fylket» er avledet mekanisk
            (alle kommuner med samme fylkesnummer). Nabolistene for Ås er satt opp her; de øvrige kommer fra sammenligningsportalen.
            SSB skjuler kvadratmeterpris der det er for få salg («–»).
          </Note>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <label className="text-xs" style={{ color: 'var(--nmbu-neutral-1)' }}>Studiested{' '}
              <select value={sted.navn} onChange={(e) => { setValgt(e.target.value); setRadius('30min'); }} className="text-xs rounded-lg px-2 py-1.5 ml-1" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
                {steder.map((s) => <option key={s.navn} value={s.navn}>{s.navn} ({s.institusjoner.join(', ')})</option>)}
              </select>
            </label>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', opacity: sted.tiers ? 1 : 0.5 }}>
              {RADIUS.map((r) => (
                <button key={r.key} disabled={!sted.tiers} onClick={() => setRadius(r.key)} className="px-3 py-1.5 text-xs"
                  style={{ backgroundColor: radius === r.key && sted.tiers ? 'var(--nmbu-green-4)' : '#fff', color: 'var(--nmbu-neutral-1)', fontWeight: radius === r.key ? 700 : 400, cursor: sted.tiers ? 'pointer' : 'not-allowed' }}>{r.label}</button>
              ))}
            </div>
            <select value={type} onChange={(e) => setType(e.target.value as Type)} className="text-xs rounded-lg px-2 py-1.5" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
              {TYPER.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          {!sted.tiers && <div className="mb-3 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>Kun studiestedets egen kommune vises ennå; nabokommuner er ikke kuratert for {sted.navn}.</div>}

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--nmbu-neutral-1)', marginBottom: 6 }}>{TYPER.find((t) => t.key === type)!.label} {aarKjop}, kommune for kommune</div>
              <ResponsiveContainer width="100%" height={Math.max(160, markedBar.length * 26 + 40)}>
                <BarChart data={markedBar} layout="vertical" margin={{ top: 4, right: 60, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf(v)} />
                  <YAxis type="category" dataKey="navn" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [kr(v), 'Kvadratmeterpris']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 9, formatter: (v: number) => nf(v) }}>
                    {markedBar.map((d) => <Cell key={d.key} fill={d.key === sted.kommune ? (sted.nmbu ? '#025C4F' : '#2563EB') : '#9CA3AF'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--nmbu-neutral-1)', marginBottom: 6 }}>Utvikling i {sted.kommunenavn}</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={primTrend} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="aar" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf(v)} width={56} />
                  <Tooltip formatter={(v: number, n: string) => [kr(v), TYPER.find((t) => t.key === n)?.label ?? n]} />
                  <Legend formatter={(v: string) => TYPER.find((t) => t.key === v)?.label ?? v} wrapperStyle={{ fontSize: 11 }} />
                  {TYPER.map((t, i) => <Line key={t.key} dataKey={t.key} stroke={['#025C4F', '#B45309', '#6B7280'][i]} strokeWidth={2} dot={{ r: 2 }} connectNulls />)}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                  {['Kommune', `Enebolig ${aarKjop}`, `Småhus/rekkehus ${aarKjop}`, `Blokkleilighet ${aarKjop}`, `Salg blokk ${aarKjop}`].map((h, i) => (
                    <th key={h} className={`px-3 py-2 ${i ? 'text-right' : 'text-left'}`} style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {markedRows.map(({ k, d }) => (
                  <tr key={k} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: k === sted.kommune ? 'var(--nmbu-green-4)' : 'transparent' }}>
                    <td className="px-3 py-2" style={{ fontWeight: k === sted.kommune ? 700 : 400 }}>{d.navn}{k === sted.kommune ? ' (studiested)' : ''}</td>
                    <td className="px-3 py-2 text-right">{kr(verdi(d.enebolig, aarKjop))}</td>
                    <td className="px-3 py-2 text-right">{kr(verdi(d.smahus, aarKjop))}</td>
                    <td className="px-3 py-2 text-right">{kr(verdi(d.blokk, aarKjop))}</td>
                    <td className="px-3 py-2 text-right">{verdi(d.blokkOms, aarKjop) != null ? nf(verdi(d.blokkOms, aarKjop)!) : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6" style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>Leiepriser {leieAar}, gjennomsnittlig månedsleie etter prissone</div>
          <Note>
            SSBs prissoner er brede. Bare der sonen per definisjon er studiestedets kommune eller fylke (Oslo og Bærum, Akershus utenom Bærum, Bergen,
            Trondheim, Stavanger) er raden markert for {sted.navn}. For andre steder avhenger sonen av tettstedets størrelse, og tabellen er en generell referanse.
          </Note>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                  <th className="px-3 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Prissone</th>
                  {data.leie.rom.map((r) => <th key={r} className="px-3 py-2 text-right" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.leie.soner.map((z) => (
                  <tr key={z.kode} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: stedSone?.kode === z.kode ? 'var(--nmbu-green-4)' : 'transparent' }}>
                    <td className="px-3 py-2" style={{ fontWeight: stedSone?.kode === z.kode ? 700 : 400 }}>{z.navn}{stedSone?.kode === z.kode ? ` · ${sted.navn}` : ''}</td>
                    {(z.leie[leieAar] ?? []).map((v, i) => <td key={i} className="px-3 py-2 text-right">{kr(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'studentbolig' && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
          <Note>
            Dekningsgrad = hybelenheter (HE, Husbankens måleenhet der én voksen er én HE) i prosent av antall studenter. Tallene gjelder alle studenter
            hos samskipnaden eller på studiestedet samlet, ikke det enkelte programmet. NSOs nasjonale mål er minst {NSO_MAL} %.
          </Note>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-green-dark)', marginBottom: 6 }}>Nasjonal dekningsgrad {data.nso.nasjonal_historikk[0]?.aar}–{data.nso.nasjonal_historikk.at(-1)?.aar}</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.nso.nasjonal_historikk} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="aar" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 25]} tickFormatter={(v: number) => `${v} %`} />
              <Tooltip formatter={(v: number) => [pct(v), 'Dekningsgrad']} />
              <ReferenceLine y={NSO_MAL} stroke="#6b7280" strokeDasharray="5 4" label={{ value: `NSOs mål ${NSO_MAL} %`, position: 'insideTopRight', fontSize: 10, fill: '#6b7280' }} />
              <Line dataKey="dekningsgrad" stroke="#025C4F" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-5" style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>Dekningsgrad per studentsamskipnad</div>
          <div className="overflow-x-auto mt-2">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                  {['Studentsamskipnad', 'Institusjoner i sammenligningen', 'Hybelenheter', 'Studenter', 'Dekningsgrad'].map((h, i) => (
                    <th key={h} className={`px-3 py-2 ${i > 1 ? 'text-right' : 'text-left'}`} style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...data.nso.samskipnad].sort((a, b) => b.dekningsgrad - a.dekningsgrad).map((s) => (
                  <tr key={s.samskipnad} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: s.samskipnad === nmbuSams ? 'var(--nmbu-green-4)' : 'transparent' }}>
                    <td className="px-3 py-2" style={{ fontWeight: 600 }}>{s.samskipnad}</td>
                    <td className="px-3 py-2">{samsInst(s.samskipnad).join(', ') || '–'}</td>
                    <td className="px-3 py-2 text-right">{nf(s.he)}</td>
                    <td className="px-3 py-2 text-right">{nf(s.studenter)}</td>
                    <td className="px-3 py-2 text-right" style={{ fontWeight: 700, color: s.dekningsgrad >= NSO_MAL ? '#047857' : 'var(--nmbu-neutral)' }}>{pct(s.dekningsgrad)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3 mt-5" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Kilder: {data.kilder.kjop}; {data.kilder.leie}; {data.kilder.studentbolig}. {data.kilder.geografi}. Hentet {data.hentet}.
          Kommuner som fikk nytt nummer ved fylkesdelingen i 2024 er skjøtet sammen med forgjengerkoden for 2020–2023.
        </span>
        <a href="https://www.ssb.no/statbank/table/06035" target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 shrink-0" style={{ color: 'var(--nmbu-green-dark)' }}><ExternalLink className="w-3.5 h-3.5" /> SSB</a>
      </div>
    </div>
  );
}
