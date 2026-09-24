import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell, ReferenceLine } from 'recharts';
import { Info, ExternalLink, Filter } from 'lucide-react';
import { ECON_HENTET, ECON_PARAMS, type EconUnit, type EconYear } from '../data/economyData';
import { EierskapOgBudsjett } from './EierskapOgBudsjett';

/**
 * Økonomi og styringsindikatorer per institusjon (DBH 902 og 750), NMBU mot institusjonene vi konkurrerer med.
 */

interface MetricDef { id: string; label: string; unit: '%' | 'mill' | 'tkr' | ''; decimals: number; desc: string; gruppe: 'okonomi' | 'kd'; }
const MILL = (v: number | null | undefined) => (v == null ? null : v / 1000); // 902 er i 1 000 kr

const OKONOMI: MetricDef[] = [
  { id: 'driftsinntekter', label: 'Driftsinntekter', unit: 'mill', decimals: 0, gruppe: 'okonomi', desc: 'Sum driftsinntekter (mill. kr).' },
  { id: 'statsandel', label: 'Andel statstilskudd', unit: '%', decimals: 1, gruppe: 'okonomi', desc: 'Statstilskudd i prosent av driftsinntektene.' },
  { id: 'eksternandel', label: 'Andel eksterne inntekter', unit: '%', decimals: 1, gruppe: 'okonomi', desc: 'Forskningsrådet, regionale forskningsfond, EU, bidrags- og oppdragsinntekter i prosent av driftsinntektene.' },
  { id: 'nfr', label: 'Forskningsrådet', unit: 'mill', decimals: 0, gruppe: 'okonomi', desc: 'Inntekter fra Norges forskningsråd (mill. kr).' },
  { id: 'eu', label: 'EU', unit: 'mill', decimals: 1, gruppe: 'okonomi', desc: 'Inntekter fra EU (mill. kr).' },
  { id: 'perSarv', label: 'Driftsinntekter per studentårsverk', unit: 'tkr', decimals: 0, gruppe: 'okonomi', desc: 'Driftsinntekter (1 000 kr) delt på studentårsverk (studiepoeng / 60, DBH 900). Påvirkes sterkt av forskningsandel og dyre utdanninger (f.eks. veterinær, medisin).' },
  { id: 'statPerSarv', label: 'Statstilskudd per studentårsverk', unit: 'tkr', decimals: 0, gruppe: 'okonomi', desc: 'Statstilskudd (1 000 kr) delt på studentårsverk (DBH 900). Viser forskjellen mellom statlig finansierte institusjoner og private høyskoler som BI og Kristiania.' },
  { id: 'skolepenger', label: 'Skolepenger', unit: 'mill', decimals: 0, gruppe: 'okonomi', desc: 'Skolepengeinntekter for private høyskoler (DBH 902 «Eksamensavgift private høyskoler», mill. kr). Statlige institusjoner tar ikke skolepenger for ordinære studier.' },
  { id: 'skolepengerPerSarv', label: 'Skolepenger per studentårsverk', unit: 'tkr', decimals: 0, gruppe: 'okonomi', desc: 'Skolepengeinntekter (1 000 kr) delt på studentårsverk (studiepoeng / 60, DBH 900). Omtrent hva en fulltidsstudent betaler i året i snitt, inkludert deltid og etter- og videreutdanning.' },
  { id: 'lonnsandel', label: 'Lønnsandel', unit: '%', decimals: 1, gruppe: 'okonomi', desc: 'Lønnskostnad i prosent av driftskostnadene.' },
  { id: 'resultat', label: 'Driftsresultat', unit: '%', decimals: 1, gruppe: 'okonomi', desc: 'Driftsinntekter minus driftskostnader, i prosent av driftsinntektene.' },
  { id: 'avsetning', label: 'Avsetninger', unit: '%', decimals: 1, gruppe: 'okonomi', desc: 'Avsetninger (ubrukte midler) i prosent av driftskostnadene.' },
];
const PROSENT_PARAM = new Set(['1', '2', '3', '8', '9', '12', '15', '16']);
const TKR_PARAM = new Set(['10', '11']);
const KD: MetricDef[] = ECON_PARAMS.map((p) => ({
  id: `kd${p.id}`, label: p.tekst, gruppe: 'kd' as const,
  unit: PROSENT_PARAM.has(p.id) ? '%' as const : TKR_PARAM.has(p.id) ? 'tkr' as const : '' as const,
  decimals: p.id === '13' ? 0 : p.id === '4' || p.id === '6' ? 2 : 1,
  desc: `${p.tekst} (Kunnskapsdepartementets styringsindikator ${p.id}, DBH 750).`,
}));
const METRICS = [...OKONOMI, ...KD];
const KORT: Record<string, string> = {
  kd1: 'Bachelor på normert tid', kd2: 'Master på normert tid', kd3: 'Ph.d. innen seks år', kd4: 'Studiekvalitet (skår)',
  kd5: 'Faglig tidsbruk per uke', kd6: 'Publiseringspoeng per faglig årsverk', kd8: 'Erasmus+ utreisende', kd9: 'Relevant jobb (master)',
  kd10: 'Forskningsrådet per faglig årsverk', kd11: 'Andre bidrag/oppdrag per faglig årsverk', kd12: 'Forskningsinnsats MNT',
  kd13: 'Kandidater helse/lærer', kd14: 'Studiepoeng per faglig årsverk', kd15: 'Kvinner i toppstillinger', kd16: 'Midlertidig ansatte',
};

function nf(v: number, dec: number) { return v.toLocaleString('nb-NO', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
function fmt(v: number | null, m: MetricDef) {
  if (v == null) return '–';
  const s = nf(v, m.decimals);
  return m.unit === '%' ? `${s} %` : m.unit === 'mill' ? `${s} mill.` : m.unit === 'tkr' ? `${s} tkr` : s;
}
const pct = (a: number | null | undefined, b: number | null | undefined) => (a == null || !b ? null : (a / b) * 100);

function val(u: EconUnit, id: string, aar: number): number | null {
  if (id.startsWith('kd')) { const v = u.ind[id.slice(2)]?.[String(aar)]; return v ? v[0] : null; }
  const y: EconYear | undefined = u.years.find((x) => x.aar === aar);
  if (!y) return null;
  const ekstern = [y.nfr, y.rff, y.eu, y.bidrag, y.oppdrag].reduce<number>((s, x) => s + (x ?? 0), 0);
  switch (id) {
    case 'driftsinntekter': return MILL(y.driftsinntekter);
    case 'statsandel': return pct(y.statstilskudd, y.driftsinntekter);
    case 'eksternandel': return y.driftsinntekter ? pct(ekstern, y.driftsinntekter) : null;
    case 'nfr': return MILL(y.nfr);
    case 'eu': return MILL(y.eu);
    case 'perSarv': return y.driftsinntekter != null && y.studentarsverk ? y.driftsinntekter / y.studentarsverk : null;
    case 'statPerSarv': return y.statstilskudd != null && y.studentarsverk ? y.statstilskudd / y.studentarsverk : null;
    case 'skolepenger': return MILL(y.skolepenger);
    case 'skolepengerPerSarv': return y.skolepenger != null && y.studentarsverk ? y.skolepenger / y.studentarsverk : null;
    case 'lonnsandel': return pct(y.lonn, y.driftskostnader);
    case 'resultat': return y.driftsinntekter != null && y.driftskostnader != null ? pct(y.driftsinntekter - y.driftskostnader, y.driftsinntekter) : null;
    case 'avsetning': return pct(y.avsetning, y.driftskostnader);
    default: return null;
  }
}

const PALETTE = ['#2563EB', '#B45309', '#9333EA', '#DC2626', '#0891B2', '#65A30D', '#DB2777', '#4B5563', '#CA8A04', '#7C3AED', '#0D9488', '#EA580C', '#1D4ED8', '#BE123C', '#15803D'];

export function EconomyComparison({ units, hovedInst }: { units: EconUnit[]; hovedInst?: string[] }) {
  const [selected, setSelected] = useState<string[]>(() => units.filter((u) => u.isNmbu || !hovedInst || hovedInst.includes(u.inst)).map((u) => u.id));
  const [metricId, setMetricId] = useState('driftsinntekter');
  const metric = METRICS.find((m) => m.id === metricId)!;
  const [tab, setTab] = useState<'sammenligning' | 'trend' | 'tabell'>('sammenligning');
  const [gruppe, setGruppe] = useState<'okonomi' | 'kd'>('okonomi');
  const [pickedYear, setPickedYear] = useState<number | null>(null);

  const colorFor = useMemo(() => {
    const m = new Map<string, string>();
    units.forEach((u, i) => m.set(u.id, u.isNmbu ? '#025C4F' : PALETTE[i % PALETTE.length]));
    return (id: string) => m.get(id) ?? '#888';
  }, [units]);

  const entries = units.filter((u) => selected.includes(u.id));
  const years = [...new Set(units.flatMap((u) => [2019, 2020, 2021, 2022, 2023, 2024, 2025].filter((y) => val(u, metric.id, y) != null)))].sort();
  const year = pickedYear && years.includes(pickedYear) ? pickedYear : years[years.length - 1];
  const barData = entries.map((u) => ({ id: u.id, name: u.kort, value: year ? val(u, metric.id, year) : null }))
    .filter((d): d is { id: string; name: string; value: number } => d.value != null).sort((a, b) => b.value - a.value);
  const avg = barData.length ? barData.reduce((s, d) => s + d.value, 0) / barData.length : null;
  const trendData = years.map((y) => {
    const row: Record<string, number | string> = { year: String(y) };
    entries.forEach((u) => { const v = val(u, metric.id, y); if (v != null) row[u.id] = Math.round(v * 100) / 100; });
    return row;
  });
  const nameOf = (id: string) => units.find((u) => u.id === id)?.kort ?? id;
  const nmbu = units.find((u) => u.isNmbu);
  const tabellMetrics = METRICS.filter((m) => m.gruppe === gruppe);

  const siste = (u: EconUnit, id: string) => { for (let y = 2025; y >= 2019; y--) { const v = val(u, id, y); if (v != null) return { v, y }; } return null; };

  return (
    <div>
      {nmbu && (
        <div className="rounded-2xl mb-6 px-6 py-5" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>NMBU · siste tall</div>
          <div className="flex gap-8 flex-wrap">
            {['driftsinntekter', 'statsandel', 'eksternandel', 'perSarv', 'kd14', 'kd10'].map((id) => {
              const m = METRICS.find((x) => x.id === id)!; const s = siste(nmbu, id);
              return (
                <div key={id}>
                  <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 3 }}>{KORT[id] ?? m.label}{s ? ` ${s.y}` : ''}</div>
                  <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{s ? fmt(s.v, m) : '–'}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3 mb-5" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Økonomitallene gjelder hele institusjonen (DBH har ikke økonomi per fakultet). Institusjonene er svært ulike i størrelse og fagprofil,
          så andeler og tall per årsverk er mer sammenlignbare enn kroner. KDs «faglige årsverk» i styringsindikatorene inkluderer
          rekrutteringsstillinger (stipendiater, postdoktorer); fagmiljøkortet bruker faglige årsverk uten dem, så tallene per årsverk er ikke like.
        </span>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(200px, 240px) 1fr' }}>
        <div className="rounded-2xl p-4" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
          <div className="flex items-center gap-2 mb-3" style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}><Filter className="w-4 h-4" /> Velg institusjoner</div>
          <div className="flex flex-col gap-2">
            {units.map((u) => {
              const on = selected.includes(u.id);
              return (
                <button key={u.id} onClick={() => setSelected((p) => (on ? p.filter((x) => x !== u.id) : [...p, u.id]))} className="rounded-xl px-3 py-2 text-left"
                  style={{ backgroundColor: on ? colorFor(u.id) : '#fff', color: on ? '#fff' : 'var(--nmbu-neutral-1)', border: '1px solid ' + (on ? colorFor(u.id) : 'var(--nmbu-neutral-3)'), fontSize: 13, fontWeight: 600 }}>
                  {u.kort}{u.isNmbu ? ' ★' : ''}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 mt-3" style={{ fontSize: 12 }}>
            <button onClick={() => setSelected(units.map((u) => u.id))} style={{ color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>Velg alle</button>
            <button onClick={() => setSelected(units.filter((u) => u.isNmbu || !hovedInst || hovedInst.includes(u.inst)).map((u) => u.id))} style={{ color: 'var(--nmbu-neutral-2)' }}>Tilbakestill</button>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
          <div className="flex rounded-lg overflow-hidden mb-3" style={{ border: '1px solid var(--nmbu-neutral-3)', width: 'fit-content' }}>
            {([['okonomi', 'Økonomi (DBH 902)'], ['kd', 'KDs styringsindikatorer (DBH 750)']] as const).map(([g, l]) => (
              <button key={g} onClick={() => { setGruppe(g); setMetricId(g === 'okonomi' ? 'driftsinntekter' : 'kd14'); }} className="px-3 py-1.5 text-xs"
                style={{ backgroundColor: gruppe === g ? 'var(--nmbu-green-4)' : '#fff', color: gruppe === g ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-1)', fontWeight: gruppe === g ? 700 : 400 }}>{l}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {METRICS.filter((m) => m.gruppe === gruppe).map((m) => (
              <button key={m.id} onClick={() => setMetricId(m.id)} title={m.desc} className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: metricId === m.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)', color: metricId === m.id ? '#fff' : 'var(--nmbu-neutral-1)' }}>{KORT[m.id] ?? m.label}</button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
              {([['sammenligning', `Sammenligning ${year ?? ''}`], ['trend', 'Trend'], ['tabell', 'Tabell']] as const).map(([t, l]) => (
                <button key={t} onClick={() => setTab(t)} className="px-3 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: tab === t ? 'var(--nmbu-green-dark)' : '#fff', color: tab === t ? '#fff' : 'var(--nmbu-neutral-1)' }}>{l}</button>
              ))}
            </div>
            {tab !== 'trend' && (
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
                {years.map((y) => (
                  <button key={y} onClick={() => setPickedYear(y)} className="px-2.5 py-1.5 text-xs"
                    style={{ backgroundColor: year === y ? 'var(--nmbu-green-4)' : '#fff', color: year === y ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-1)', fontWeight: year === y ? 700 : 400 }}>{y}</button>
                ))}
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginBottom: 8 }}>{metric.desc}</div>

          {tab === 'sammenligning' && (
            <ResponsiveContainer width="100%" height={Math.max(200, barData.length * 32 + 40)}>
              <BarChart data={barData} layout="vertical" margin={{ top: 14, right: 70, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => nf(v, 0)} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [fmt(v, metric), KORT[metric.id] ?? metric.label]} />
                {avg != null && <ReferenceLine x={avg} stroke="#888" strokeDasharray="4 3" label={{ value: `Snitt ${nf(avg, metric.decimals)}`, position: 'top', fontSize: 10, fill: '#888' }} />}
                <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, formatter: (v: number) => fmt(v, metric) }}>
                  {barData.map((d) => <Cell key={d.id} fill={colorFor(d.id)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {tab === 'trend' && (
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickFormatter={(v: number) => nf(v, 0)} />
                <Tooltip formatter={(v: number, n: string) => [fmt(v, metric), nameOf(n)]} />
                <Legend formatter={(v: string) => nameOf(v)} wrapperStyle={{ fontSize: 11 }} />
                {entries.map((u) => <Line key={u.id} dataKey={u.id} stroke={colorFor(u.id)} strokeWidth={u.isNmbu ? 3 : 2} dot={{ r: 3 }} connectNulls />)}
              </LineChart>
            </ResponsiveContainer>
          )}
          {tab === 'tabell' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                    <th className="px-3 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Institusjon</th>
                    {tabellMetrics.map((m) => <th key={m.id} title={m.desc} className="px-3 py-2 text-right" style={{ color: m.id === metricId ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{KORT[m.id] ?? m.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[...entries].sort((a, b) => (val(b, metric.id, year!) ?? -1e9) - (val(a, metric.id, year!) ?? -1e9)).map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: u.isNmbu ? 'var(--nmbu-green-4)' : 'transparent' }}>
                      <td className="px-3 py-2" style={{ fontWeight: 600 }}>{u.kort}</td>
                      {tabellMetrics.map((m) => <td key={m.id} className="px-3 py-2 text-right" style={{ fontWeight: m.id === metricId ? 700 : 400, whiteSpace: 'nowrap' }}>{fmt(year ? val(u, m.id, year) : null, m)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginTop: 6 }}>År {year}. «–» = ikke rapportert (UiB mangler økonomitall for 2024 i DBH).</div>
            </div>
          )}
        </div>
      </div>

      <EierskapOgBudsjett units={entries} colorFor={colorFor} />

      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3 mt-5" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Kilde: DBH/HK-dir tabell 902 (økonomiske nøkkeltall fra institusjonenes regnskap, i 1 000 kr) og 750 (Kunnskapsdepartementets styringsindikatorer),
          studentårsverk fra tabell 900, hentet {ECON_HENTET}. BI og Kristiania er private og rapporterer etter et annet regnskapsregime: statstilskuddet er lite, og hovedinntekten er skolepenger (902 «Eksamensavgift private høyskoler»).
          INN er slått sammen over institusjonskodene 0264 (til og med 2024) og 1177 (fra 2025).
        </span>
        <a href="https://dbh.hkdir.no" target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 shrink-0" style={{ color: 'var(--nmbu-green-dark)' }}><ExternalLink className="w-3.5 h-3.5" /> DBH</a>
      </div>
    </div>
  );
}
