import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell, ReferenceLine } from 'recharts';
import { Info, ExternalLink, Filter } from 'lucide-react';
import { STAFF_HENTET, type StaffUnit, type StaffYear } from '../data/staffData';

/**
 * Fagmiljøet: tilsatte, studenter per faglig årsverk og publisering (DBH 225/123/373/374).
 * Brukes på fakultetssiden (NMBU-fakultetet mot fakultetene som eier konkurrentprogrammene, eller institusjonene)
 * og på forsiden (institusjonene, eller NMBUs fakulteter mot hverandre).
 */

interface MetricDef { id: string; label: string; unit: '%' | ''; decimals: number; desc: string; lowerIsBetter?: boolean; }
const METRICS: MetricDef[] = [
  { id: 'sarvPerFaglig', label: 'Studentårsverk per faglig årsverk', unit: '', decimals: 1, lowerIsBetter: true, desc: 'Studentårsverk (produserte studiepoeng på enhetens emner delt på 60) per faglig årsverk. Faglige årsverk = undervisnings-, forsknings- og formidlingsstillinger uten rekrutteringsstillinger (stipendiat, postdoktor).' },
  { id: 'studPerFaglig', label: 'Registrerte studenter per faglig årsverk', unit: '', decimals: 1, lowerIsBetter: true, desc: 'Registrerte studenter (høst) delt på faglige årsverk. Blåses opp der mange tar enkeltemner eller studerer på deltid; studentårsverk er mer sammenlignbart.' },
  { id: 'publPerFaglig', label: 'Publiseringspoeng per faglig årsverk', unit: '', decimals: 2, desc: 'Publiseringspoeng (NVI/Cristin) delt på faglige årsverk (samme nevner som over).' },
  { id: 'niva2', label: 'Andel nivå 2', unit: '%', decimals: 1, desc: 'Andel av publiseringspoengene som er publisert i kanaler på nivå 2.' },
  { id: 'forste', label: 'Andel førstestillinger', unit: '%', decimals: 1, desc: 'Årsverk i professor-, dosent-, førsteamanuensis- og førstelektorstillinger, i prosent av faglige årsverk.' },
  { id: 'kvinner', label: 'Kvinneandel faglige', unit: '%', decimals: 1, desc: 'Kvinners andel av de faglige årsverkene.' },
  { id: 'faglige', label: 'Faglige årsverk', unit: '', decimals: 0, desc: 'Årsverk i undervisnings-, forsknings- og formidlingsstillinger, uten rekrutteringsstillinger.' },
  { id: 'rekruttering', label: 'Rekrutteringsårsverk', unit: '', decimals: 0, desc: 'Årsverk i stipendiat- og postdoktorstillinger.' },
  { id: 'arsverk', label: 'Alle årsverk', unit: '', decimals: 0, desc: 'Alle tilsatte, inkludert teknisk og administrativt ansatte.' },
  { id: 'studenter', label: 'Registrerte studenter', unit: '', decimals: 0, desc: 'Registrerte studenter i høstsemesteret.' },
  { id: 'publPoeng', label: 'Publiseringspoeng', unit: '', decimals: 0, desc: 'Sum publiseringspoeng i året.' },
];

function nf(v: number, dec: number): string {
  return v.toLocaleString('nb-NO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function val(y: StaffYear | undefined, id: string): number | null {
  if (!y) return null;
  const f = y.faglige;
  switch (id) {
    case 'sarvPerFaglig': return y.studentarsverk != null && f ? y.studentarsverk / f : null;
    case 'studPerFaglig': return y.studenter != null && f ? y.studenter / f : null;
    case 'publPerFaglig': return y.publPoeng != null && f ? y.publPoeng / f : null;
    case 'niva2': return y.niva2Andel;
    case 'forste': return y.forste != null && f ? (y.forste / f) * 100 : null;
    case 'kvinner': return y.fagligeKvinner != null && f ? (y.fagligeKvinner / f) * 100 : null;
    case 'faglige': return f;
    case 'rekruttering': return y.rekruttering;
    case 'arsverk': return y.arsverk;
    case 'studenter': return y.studenter;
    case 'publPoeng': return y.publPoeng;
    default: return null;
  }
}
const fmt = (v: number | null, m: MetricDef) => (v == null ? '–' : `${nf(v, m.decimals)}${m.unit === '%' ? ' %' : ''}`);

const PALETTE = ['#025C4F', '#2563EB', '#B45309', '#9333EA', '#DC2626', '#0891B2', '#65A30D', '#DB2777', '#4B5563', '#CA8A04', '#7C3AED', '#0D9488', '#EA580C', '#1D4ED8', '#BE123C', '#15803D', '#A16207', '#6D28D9', '#0369A1'];

export interface StaffView { id: string; label: string; units: StaffUnit[]; unitLabel: (u: StaffUnit) => string; note?: string; }

export function StaffComparison({ views }: { views: StaffView[] }) {
  const [viewId, setViewId] = useState(views[0].id);
  const view = views.find((v) => v.id === viewId) ?? views[0];
  const [selByView, setSelByView] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(views.map((v) => [v.id, v.units.filter((u) => u.isNmbu || u.hoved).map((u) => u.id)])));
  const [metricId, setMetricId] = useState('sarvPerFaglig');
  const metric = METRICS.find((m) => m.id === metricId)!;
  const [tab, setTab] = useState<'trend' | 'sammenligning' | 'tabell'>('sammenligning');
  const [pickedYear, setPickedYear] = useState<number | null>(null);

  const colorFor = useMemo(() => {
    const map = new Map<string, string>();
    view.units.forEach((u, i) => map.set(u.id, u.isNmbu && view.units.filter((x) => x.isNmbu).length === 1 ? '#025C4F' : PALETTE[(i + 1) % PALETTE.length]));
    return (id: string) => map.get(id) ?? '#888';
  }, [view]);

  const selected = selByView[view.id] ?? [];
  const entries = view.units.filter((u) => selected.includes(u.id));
  const toggle = (id: string) => setSelByView((p) => ({ ...p, [view.id]: selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id] }));
  const yearOf = (u: StaffUnit, y: number) => u.years.find((x) => x.aar === y);

  // Siste år der NMBU-enheten har verdi for målet (publisering og tilsatte kommer til ulik tid)
  const years = [...new Set(view.units.flatMap((u) => u.years.filter((y) => val(y, metric.id) != null).map((y) => y.aar)))].sort();
  const latest = years[years.length - 1];
  const year = pickedYear && years.includes(pickedYear) ? pickedYear : latest;

  const trendData = years.map((y) => {
    const row: Record<string, number | string> = { year: String(y) };
    entries.forEach((u) => { const v = val(yearOf(u, y), metric.id); if (v != null) row[u.id] = Math.round(v * 100) / 100; });
    return row;
  });
  const barData = entries
    .map((u) => ({ id: u.id, name: view.unitLabel(u), value: val(yearOf(u, year), metric.id) }))
    .filter((d): d is { id: string; name: string; value: number } => d.value != null)
    .sort((a, b) => (metric.lowerIsBetter ? a.value - b.value : b.value - a.value));
  const avg = barData.length ? barData.reduce((s, d) => s + d.value, 0) / barData.length : null;
  const nameOf = (id: string) => { const u = view.units.find((x) => x.id === id); return u ? view.unitLabel(u) : id; };

  const nmbuUnits = view.units.filter((u) => u.isNmbu);
  const showKeyFigures = nmbuUnits.length === 1;

  return (
    <div>
      {views.length > 1 && (
        <div className="flex rounded-lg overflow-hidden mb-5" style={{ border: '1px solid var(--nmbu-neutral-3)', width: 'fit-content' }}>
          {views.map((v, i) => (
            <button key={v.id} onClick={() => { setViewId(v.id); setPickedYear(null); }} className="px-4 py-2 text-sm"
              style={{ backgroundColor: v.id === view.id ? 'var(--nmbu-green-dark)' : '#fff', color: v.id === view.id ? '#fff' : 'var(--nmbu-neutral-1)', fontWeight: v.id === view.id ? 600 : 400,
                borderRight: i < views.length - 1 ? '1px solid var(--nmbu-neutral-3)' : 'none' }}>{v.label}</button>
          ))}
        </div>
      )}

      {showKeyFigures && (() => {
        const u = nmbuUnits[0];
        const last = (id: string) => { for (let i = u.years.length - 1; i >= 0; i--) { const v = val(u.years[i], id); if (v != null) return { v, aar: u.years[i].aar }; } return null; };
        const items = ['sarvPerFaglig', 'publPerFaglig', 'niva2', 'forste', 'faglige', 'rekruttering'].map((id) => {
          const m = METRICS.find((x) => x.id === id)!; const l = last(id);
          return { l: `${m.label}${l ? ` ${l.aar}` : ''}`, v: l ? fmt(l.v, m) : '–' };
        });
        return (
          <div className="rounded-2xl mb-6 px-6 py-5" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
              {view.unitLabel(u)} · siste tall
            </div>
            <div className="flex gap-8 flex-wrap">
              {items.map((s) => (
                <div key={s.l}>
                  <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 3 }}>{s.l}</div>
                  <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {view.note && (
        <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3 mb-5" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{view.note}</span>
        </div>
      )}

      <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(240px, 300px) 1fr' }}>
        <div className="rounded-2xl p-4" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
          <div className="flex items-center gap-2 mb-3" style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>
            <Filter className="w-4 h-4" /> Velg enheter
          </div>
          <div className="flex flex-col gap-2" style={{ maxHeight: 560, overflowY: 'auto' }}>
            {view.units.map((u) => {
              const on = selected.includes(u.id);
              return (
                <button key={u.id} onClick={() => toggle(u.id)} className="rounded-xl px-3 py-2 text-left transition-all"
                  title={u.programmer.length ? `Eier konkurrentprogram: ${u.programmer.join(', ')}` : undefined}
                  style={{ backgroundColor: on ? colorFor(u.id) : '#fff', color: on ? '#fff' : 'var(--nmbu-neutral-1)', border: '1px solid ' + (on ? colorFor(u.id) : 'var(--nmbu-neutral-3)') }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{u.kort}{u.isNmbu ? ' ★' : ''}</div>
                  {u.fakultetskode && <div style={{ fontSize: 10, opacity: 0.85 }}>{u.navn}</div>}
                  {u.programmer.length > 0 && (
                    <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>
                      {u.programmer.length} konkurrentprogram{!u.hoved ? ' · svakere sammenligning' : ''}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 mt-3" style={{ fontSize: 12 }}>
            <button onClick={() => setSelByView((p) => ({ ...p, [view.id]: view.units.map((u) => u.id) }))} style={{ color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>Velg alle</button>
            <button onClick={() => setSelByView((p) => ({ ...p, [view.id]: view.units.filter((u) => u.isNmbu || u.hoved).map((u) => u.id) }))} style={{ color: 'var(--nmbu-neutral-2)' }}>Tilbakestill</button>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
          <div className="flex flex-wrap gap-2 mb-3">
            {METRICS.map((m) => (
              <button key={m.id} onClick={() => setMetricId(m.id)} title={m.desc} className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: metricId === m.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)', color: metricId === m.id ? '#fff' : 'var(--nmbu-neutral-1)' }}>{m.label}</button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
              {([['sammenligning', `Sammenligning ${year ?? ''}`], ['trend', 'Trend'], ['tabell', 'Tabell']] as const).map(([t, l]) => (
                <button key={t} onClick={() => setTab(t)} className="px-3 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: tab === t ? 'var(--nmbu-green-dark)' : '#fff', color: tab === t ? '#fff' : 'var(--nmbu-neutral-1)' }}>{l}</button>
              ))}
            </div>
            {tab !== 'trend' && years.length > 0 && (
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
                {years.map((y) => (
                  <button key={y} onClick={() => setPickedYear(y)} className="px-2.5 py-1.5 text-xs"
                    style={{ backgroundColor: year === y ? 'var(--nmbu-green-4)' : '#fff', color: year === y ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-1)', fontWeight: year === y ? 700 : 400 }}>{y}</button>
                ))}
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginBottom: 8 }}>
            {metric.desc}{metric.lowerIsBetter ? ' Lavere tall betyr flere faglige per student.' : ''}
          </div>

          {entries.length === 0 && <div className="flex items-center justify-center h-48" style={{ color: 'var(--nmbu-neutral-2)', fontSize: 13 }}>Velg minst én enhet.</div>}

          {entries.length > 0 && tab === 'sammenligning' && (
            barData.length ? (
              <ResponsiveContainer width="100%" height={Math.max(200, barData.length * 38 + 40)}>
                <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 50, left: 10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => nf(v, metric.decimals > 1 ? 1 : 0)} />
                  <YAxis type="category" dataKey="name" width={Math.min(260, Math.max(50, ...barData.map((d) => d.name.length * 6 + 12)))} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmt(v, metric), metric.label]} />
                  {avg != null && <ReferenceLine x={avg} stroke="#888" strokeDasharray="4 3" label={{ value: `Snitt ${nf(avg, metric.decimals)}`, position: 'top', fontSize: 10, fill: '#888' }} />}
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, formatter: (v: number) => fmt(v, metric) }}>
                    {barData.map((d) => <Cell key={d.id} fill={colorFor(d.id)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-48" style={{ color: 'var(--nmbu-neutral-2)', fontSize: 13 }}>Ingen tall for {year}.</div>
          )}

          {entries.length > 0 && tab === 'trend' && (
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickFormatter={(v: number) => nf(v, metric.decimals > 1 ? 1 : 0)} />
                <Tooltip formatter={(v: number, name: string) => [fmt(v, metric), nameOf(name)]} />
                <Legend formatter={(v: string) => nameOf(v)} wrapperStyle={{ fontSize: 11 }} />
                {entries.map((u) => (
                  <Line key={u.id} type="monotone" dataKey={u.id} stroke={colorFor(u.id)} strokeWidth={u.isNmbu ? 3 : 2} dot={{ r: 3 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}

          {entries.length > 0 && tab === 'tabell' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                    <th className="px-3 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Enhet</th>
                    {METRICS.map((m) => (
                      <th key={m.id} className="px-3 py-2 text-right" title={m.desc} style={{ color: m.id === metricId ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{m.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...entries].sort((a, b) => {
                    const av = val(yearOf(a, year), metric.id), bv = val(yearOf(b, year), metric.id);
                    if (av == null) return 1; if (bv == null) return -1;
                    return metric.lowerIsBetter ? av - bv : bv - av;
                  }).map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: u.isNmbu ? 'var(--nmbu-green-4)' : 'transparent' }}>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorFor(u.id) }} /><span style={{ fontWeight: 600 }}>{u.kort}</span></div>
                        {u.fakultetskode && <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{u.navn}</div>}
                      </td>
                      {METRICS.map((m) => (
                        <td key={m.id} className="px-3 py-2 text-right" style={{ fontWeight: m.id === metricId ? 700 : 400, whiteSpace: 'nowrap' }}>{fmt(val(yearOf(u, year), m.id), m)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginTop: 6 }}>År {year}. «–» = ikke rapportert ennå.</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3 mt-5" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Kilde: DBH/HK-dir tabell 225 (årsverk per stillingskode), 900 (studiepoengproduksjon), 220 (stillingskategorier), 123 (registrerte studenter, høst), 373 og 374 (vitenskapelig publisering), 210 (avdeling og fakultet) og 347 (hvilken avdeling som eier et studieprogram), hentet {STAFF_HENTET}.
          Faglige årsverk er undervisnings-, forsknings- og formidlingsstillinger (kategori UN1, UN3 og UN4) uten rekrutteringsstillinger (UN2: stipendiat, postdoktor). Studentårsverk er produserte studiepoeng på enhetens egne emner delt på 60 (DBH 900). Registrerte studenter omfatter alle registrerte på enheten, også enkeltemne- og deltidsstudenter, og er derfor et grovere mål.
          Konkurrentfakultetene er fakultetene som eier konkurrentprogrammene i fakultetets sammenligning (DBH 347), ikke et skjønn. Tilsatte og studenter telles per år (tilsatte per 1. oktober), publisering per publiseringsår.
        </span>
        <a href="https://dbh.hkdir.no" target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 shrink-0" style={{ color: 'var(--nmbu-green-dark)' }}><ExternalLink className="w-3.5 h-3.5" /> DBH</a>
      </div>
    </div>
  );
}
