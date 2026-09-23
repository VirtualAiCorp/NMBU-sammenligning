import { useMemo, useState } from 'react';
import { BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Info, ExternalLink, Filter } from 'lucide-react';
import type { FacultyData } from '../data/faculties';
import { REVENUE_GROUPS, REVENUE_SATSER, REVENUE_HENTET, type RevenueProgram, type RevenueYear } from '../data/revenueData';
import { landsamColorForGroups } from '../data/landsamPalette';

/**
 * Anslått resultatbasert inntekt per program (finansieringssystemet fra 2025): egenfinansierte studiepoeng × sats for
 * kategori 1–3, pluss fullførte grader × fast sats. NMBU mot konkurrentene i hver programgruppe.
 */

interface MetricDef { id: string; label: string; unit: 'mill' | 'tkr' | 'kr' | ''; decimals: number; desc: string; }
const METRICS: MetricDef[] = [
  { id: 'total', label: 'Anslått inntekt', unit: 'mill', decimals: 1, desc: 'Studiepoeng × sats for kategorien, pluss fullførte grader × sats per grad. Utløses i budsjettet to år senere.' },
  { id: 'perStudent', label: 'Per registrert student', unit: 'tkr', decimals: 0, desc: 'Anslått inntekt delt på registrerte studenter på programmet (høst). Høy verdi betyr dyr kategori, god studieprogresjon eller mange som fullfører.' },
  { id: 'spPerStudent', label: 'Studiepoeng per student', unit: '', decimals: 1, desc: 'Egenfinansierte studiepoeng tatt av programmets studenter i året, delt på registrerte studenter. 60 = full progresjon.' },
  { id: 'innSp', label: 'Fra studiepoeng', unit: 'mill', decimals: 1, desc: 'Den delen av inntekten som kommer fra studiepoeng.' },
  { id: 'innFullforing', label: 'Fra fullførte grader', unit: 'mill', decimals: 1, desc: 'Den delen av inntekten som kommer fra fullførte grader (kandidater × sats).' },
  { id: 'studentarsverk', label: 'Studentårsverk', unit: '', decimals: 0, desc: 'Egenfinansierte studiepoeng delt på 60.' },
  { id: 'kandidater', label: 'Fullførte grader', unit: '', decimals: 0, desc: 'Ferdige kandidater fra programmet i året (DBH 104), brukt som tilnærming for fullførte gradsprogram.' },
  { id: 'snittsats', label: 'Snittsats per 60 sp', unit: 'tkr', decimals: 1, desc: 'Inntekt fra studiepoeng per studentårsverk; viser hvilken kategori emnene ligger i (1, 2 eller 3).' },
];

const nf = (v: number, d: number) => v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });
function fmt(v: number | null, m: MetricDef) {
  if (v == null) return '–';
  return m.unit === 'mill' ? `${nf(v, m.decimals)} mill.` : m.unit === 'tkr' ? `${nf(v, m.decimals)} tkr` : nf(v, m.decimals);
}
function val(y: RevenueYear | undefined, id: string): number | null {
  if (!y) return null;
  const sarv = y.sp1 + y.sp2 + y.sp3;
  switch (id) {
    case 'total': return y.total / 1e6;
    case 'innSp': return y.innSp / 1e6;
    case 'innFullforing': return y.kandidater == null ? null : y.innFullforing / 1e6;
    case 'perStudent': return y.registrerte ? y.total / y.registrerte / 1000 : null;
    case 'spPerStudent': return y.registrerte ? (sarv * 60) / y.registrerte : null;
    case 'studentarsverk': return sarv;
    case 'kandidater': return y.kandidater;
    case 'snittsats': return sarv ? y.innSp / sarv / 1000 : null;
    default: return null;
  }
}
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };

export function FacultyRevenue({ faculty }: { faculty: FacultyData }) {
  const GROUPS = (REVENUE_GROUPS[faculty.id] ?? []).filter((g) => g.programs.length > 0);
  const colorFor = useMemo(() => landsamColorForGroups(faculty.admissionGroups), [faculty]);
  const [groupId, setGroupId] = useState(GROUPS[0]?.id ?? '');
  const group = GROUPS.find((g) => g.id === groupId) ?? GROUPS[0];
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string[]>>(() => Object.fromEntries(GROUPS.map((g) => [g.id, g.defaultIds])));
  const [metricId, setMetricId] = useState('perStudent');
  const metric = METRICS.find((m) => m.id === metricId)!;
  const [tab, setTab] = useState<'sammenligning' | 'trend' | 'tabell'>('sammenligning');
  const [pickedYear, setPickedYear] = useState<number | null>(null);

  if (!group) {
    return <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', color: 'var(--nmbu-neutral-2)', fontSize: 13 }}>Ingen inntektsanslag for dette fakultetet ennå.</div>;
  }
  const selected = selectedByGroup[group.id] ?? group.defaultIds;
  const entries = group.programs.filter((p) => selected.includes(p.entryId));
  const toggle = (id: string) => setSelectedByGroup((prev) => {
    const cur = prev[group.id] ?? group.defaultIds;
    return { ...prev, [group.id]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
  });
  const yearOf = (p: RevenueProgram, y: number) => p.years.find((x) => x.aar === y);
  const years = [...new Set(group.programs.flatMap((p) => p.years.map((y) => y.aar)))].sort();
  const year = pickedYear && years.includes(pickedYear) ? pickedYear : years[years.length - 1];
  const yEx = group.programs.flatMap((p) => p.years).find((y) => y.aar === year);

  const barData = entries.map((p) => ({ id: p.entryId, name: p.shortName, value: val(yearOf(p, year), metric.id) }))
    .filter((d): d is { id: string; name: string; value: number } => d.value != null).sort((a, b) => b.value - a.value);
  const med = median(barData.filter((d) => !group.nmbuIds.includes(d.id)).map((d) => d.value));
  const trendData = years.map((y) => {
    const row: Record<string, number | string> = { year: String(y) };
    entries.forEach((p) => { const v = val(yearOf(p, y), metric.id); if (v != null) row[p.entryId] = Math.round(v * 10) / 10; });
    return row;
  });
  const nameOf = (id: string) => group.programs.find((p) => p.entryId === id)?.shortName ?? id;
  const nmbu = group.programs.filter((p) => group.nmbuIds.includes(p.entryId));
  const konk = group.programs.filter((p) => group.defaultIds.includes(p.entryId) && !group.nmbuIds.includes(p.entryId));
  const sats = REVENUE_SATSER[String(yEx?.satsAar ?? '')];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {GROUPS.map((g) => (
          <button key={g.id} onClick={() => { setGroupId(g.id); setPickedYear(null); }} className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: g.id === group.id ? 'var(--nmbu-green-dark)' : '#fff', color: g.id === group.id ? '#fff' : 'var(--nmbu-neutral-1)', border: '1px solid ' + (g.id === group.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)') }}>
            {g.label}
          </button>
        ))}
      </div>

      {nmbu.map((p) => {
        const y = yearOf(p, year);
        const k = (id: string) => median(konk.map((c) => val(yearOf(c, year), id)).filter((v): v is number => v != null));
        const items = ['total', 'perStudent', 'spPerStudent', 'innFullforing', 'snittsats'].map((id) => {
          const m = METRICS.find((x) => x.id === id)!; const km = k(id);
          return { l: m.label, v: fmt(val(y, id), m), sub: km != null ? `konkurrenter (median): ${fmt(km, m)}` : undefined };
        });
        return (
          <div key={p.entryId} className="rounded-2xl mb-6 px-6 py-5" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
              {p.shortName} · {p.programnavn} · produksjon {year}, utløses i budsjett {y?.budsjettaar ?? year + 2}{y?.forelopig ? ' (foreløpige satser)' : ''}
            </div>
            <div className="flex gap-8 flex-wrap">
              {items.map((s) => (
                <div key={s.l}>
                  <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 3 }}>{s.l}</div>
                  <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{s.v}</div>
                  {s.sub && <div style={{ fontSize: 9, opacity: 0.6, marginTop: 3 }}>{s.sub}</div>}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(240px, 280px) 1fr' }}>
        <div className="rounded-2xl p-4" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
          <div className="flex items-center gap-2 mb-3" style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}><Filter className="w-4 h-4" /> Velg program</div>
          <div className="flex flex-col gap-2">
            {group.programs.map((p) => {
              const on = selected.includes(p.entryId);
              return (
                <button key={p.entryId} onClick={() => toggle(p.entryId)} className="rounded-xl px-3 py-2 text-left"
                  style={{ backgroundColor: on ? colorFor(p.entryId) : '#fff', color: on ? '#fff' : 'var(--nmbu-neutral-1)', border: '1px solid ' + (on ? colorFor(p.entryId) : 'var(--nmbu-neutral-3)') }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.shortName}{p.isNmbu ? ' ★' : ''}</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>{p.programnavn}</div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 mt-3" style={{ fontSize: 12 }}>
            <button onClick={() => setSelectedByGroup((prev) => ({ ...prev, [group.id]: group.programs.map((p) => p.entryId) }))} style={{ color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>Velg alle</button>
            <button onClick={() => setSelectedByGroup((prev) => ({ ...prev, [group.id]: group.defaultIds }))} style={{ color: 'var(--nmbu-neutral-2)' }}>Tilbakestill</button>
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
              {([['sammenligning', `Sammenligning ${year}`], ['trend', 'Trend'], ['tabell', 'Tabell']] as const).map(([t, l]) => (
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
          <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginBottom: 8 }}>
            {metric.desc} Produksjon {year} utløses i budsjett {year + 2}{yEx?.forelopig ? `, beregnet med ${yEx.satsAar}-satser fordi satsene for ${year + 2} ikke er kjent ennå` : ''}.
          </div>

          {tab === 'sammenligning' && (
            <ResponsiveContainer width="100%" height={Math.max(200, barData.length * 34 + 40)}>
              <BarChart data={barData} layout="vertical" margin={{ top: 14, right: 70, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => nf(v, 0)} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [fmt(v, metric), metric.label]} />
                {med != null && <ReferenceLine x={med} stroke="#888" strokeDasharray="4 3" label={{ value: `Median konkurrenter ${nf(med, metric.decimals)}`, position: 'top', fontSize: 10, fill: '#888' }} />}
                <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, formatter: (v: number) => fmt(v, metric) }}>
                  {barData.map((d) => <Cell key={d.id} fill={colorFor(d.id)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {tab === 'trend' && (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickFormatter={(v: number) => nf(v, 0)} />
                <Tooltip formatter={(v: number, n: string) => [fmt(v, metric), nameOf(n)]} />
                <Legend formatter={(v: string) => nameOf(v)} wrapperStyle={{ fontSize: 11 }} />
                {entries.map((p) => <Line key={p.entryId} dataKey={p.entryId} stroke={colorFor(p.entryId)} strokeWidth={p.isNmbu ? 3 : 2} dot={{ r: 3 }} connectNulls />)}
              </LineChart>
            </ResponsiveContainer>
          )}
          {tab === 'tabell' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                    <th className="px-3 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Program</th>
                    {METRICS.map((m) => <th key={m.id} title={m.desc} className="px-3 py-2 text-right" style={{ color: m.id === metricId ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{m.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[...entries].sort((a, b) => (val(yearOf(b, year), metric.id) ?? -1) - (val(yearOf(a, year), metric.id) ?? -1)).map((p) => (
                    <tr key={p.entryId} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: p.isNmbu ? 'var(--nmbu-green-4)' : 'transparent' }}>
                      <td className="px-3 py-2"><div style={{ fontWeight: 600 }}>{p.shortName}</div><div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{p.programnavn}</div></td>
                      {METRICS.map((m) => <td key={m.id} className="px-3 py-2 text-right" style={{ fontWeight: m.id === metricId ? 700 : 400, whiteSpace: 'nowrap' }}>{fmt(val(yearOf(p, year), m.id), m)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3 mt-5" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Anslag etter finansieringssystemet fra 2025: egenfinansierte studiepoeng (DBH 900, per studentens program og emnets kategori) ganget med satsen for
          kategori 1, 2 eller 3{sats ? ` (${nf(sats['1'] / 1000, 2)} / ${nf(sats['2'] / 1000, 2)} / ${nf(sats['3'] / 1000, 2)} tkr per 60 sp i ${yEx?.satsAar})` : ''},
          pluss ferdige kandidater (DBH 104) ganget med satsen for fullført gradsprogram{sats ? ` (${nf(sats.G3 / 1000, 2)} tkr)` : ''}. Satser fra DBH 908, hentet {REVENUE_HENTET}.
          Studiepoengene tilskrives programmet studenten går på, også når emnet eies av et annet fakultet. Doktorgrader, EU, NFR og basisbevilgning er ikke med,
          og tallene er ikke NMBUs interne budsjettfordeling. DBH har ingen egen tabell for fullførte gradsprogram ennå, så kandidattallet er en tilnærming.
        </span>
        <a href="https://dbh.hkdir.no" target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 shrink-0" style={{ color: 'var(--nmbu-green-dark)' }}><ExternalLink className="w-3.5 h-3.5" /> DBH</a>
      </div>
    </div>
  );
}
