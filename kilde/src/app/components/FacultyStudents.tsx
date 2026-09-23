import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Info, ExternalLink, Filter } from 'lucide-react';
import type { FacultyData } from '../data/faculties';
import type { StudentGroup, StudentProgram } from '../data/landsamStudentData';
import { STUDENT_NATIONAL, STUDENT_HENTET, type StudentYear } from '../data/studentNationalData';
import { NIVAA_NAVN } from '../data/completionNationalData';
import { landsamColorForGroups } from '../data/landsamPalette';

/**
 * «Studentene»: alder, utenlandske studenter og utveksling ut per program (DBH 60/135/142),
 * NMBU mot konkurrentene i hver gruppe, med landssnitt for NMBU-programmets gradsnivå.
 */

interface MetricDef { id: string; label: string; unit: '%' | ''; decimals: number; desc: string; count?: keyof StudentYear; }
const METRICS: MetricDef[] = [
  { id: 'a30p', label: '30 år og eldre',      unit: '%', decimals: 1, count: 'a30', desc: 'Andel av de registrerte studentene (høst) som er 30 år eller eldre' },
  { id: 'a25p', label: '25 år og eldre',      unit: '%', decimals: 1, desc: 'Andel av de registrerte studentene (høst) som er 25 år eller eldre' },
  { id: 'a21p', label: '21 år og yngre',      unit: '%', decimals: 1, count: 'a21', desc: 'Andel av de registrerte studentene (høst) som er 21 år eller yngre' },
  { id: 'utenlp', label: 'Utenlandske, andel', unit: '%', decimals: 1, count: 'utenlandske', desc: 'Andel av de registrerte studentene (høst) med utenlandsk statsborgerskap' },
  { id: 'utenl',  label: 'Utenlandske, antall', unit: '', decimals: 0, desc: 'Antall registrerte studenter (høst) med utenlandsk statsborgerskap' },
  { id: 'utvp',   label: 'Utveksling ut per 100', unit: '', decimals: 1, count: 'utveksling', desc: 'Studenter på programmet som var på utveksling i utlandet (vår + høst), per 100 registrerte studenter' },
  { id: 'utv',    label: 'Utveksling ut, antall', unit: '', decimals: 0, desc: 'Studenter på programmet som var på utveksling i utlandet i løpet av året (vår + høst)' },
  { id: 'total',  label: 'Registrerte (høst)', unit: '', decimals: 0, desc: 'Registrerte studenter på programmet i høstsemesteret (DBH 60)' },
];
const BANDS: { key: 'a21' | 'a24' | 'a29' | 'a30'; label: string; color: string }[] = [
  { key: 'a21', label: '≤ 21 år', color: '#A7D8C9' },
  { key: 'a24', label: '22–24 år', color: '#5FB49C' },
  { key: 'a29', label: '25–29 år', color: '#2E7D68' },
  { key: 'a30', label: '30 år +', color: '#0B4F43' },
];

function nf(v: number, dec: number): string {
  return v.toLocaleString('nb-NO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
const pct = (a: number | null, b: number) => (a == null ? null : b > 0 ? (a / b) * 100 : null);

function yearVal(y: StudentYear | undefined, id: string): number | null {
  if (!y || !y.total) return null;
  switch (id) {
    case 'a30p': return pct(y.a30, y.total);
    case 'a25p': return pct(y.a29 + y.a30, y.total);
    case 'a21p': return pct(y.a21, y.total);
    case 'utenlp': return pct(y.utenlandske, y.total);
    case 'utenl': return y.utenlandske;
    case 'utvp': return pct(y.utveksling, y.total);
    case 'utv': return y.utveksling;
    case 'total': return y.total;
    default: return null;
  }
}
function fmt(v: number | null, m: MetricDef): string {
  return v == null ? '–' : `${nf(v, m.decimals)}${m.unit === '%' ? ' %' : ''}`;
}
/** DBH viser 1–2 personer som 0: en målt null i en andel betyr «≤ 2 personer». */
function cellText(y: StudentYear | undefined, m: MetricDef): string {
  const v = yearVal(y, m.id);
  if (v === 0 && y && y.total > 0 && m.count && (m.unit === '%' || m.id === 'utvp')) {
    return `≤ ${nf(Math.min(100, 200 / y.total), 1)}${m.unit === '%' ? ' %' : ''}`;
  }
  return fmt(v, m);
}

export function FacultyStudents({ faculty }: { faculty: FacultyData }) {
  const GROUPS = faculty.studentGroups.filter((g) => g.programs.length > 0);
  const colorFor = useMemo(() => landsamColorForGroups(faculty.admissionGroups), [faculty]);
  const [groupId, setGroupId] = useState<string>(GROUPS[0]?.id ?? '');
  const group: StudentGroup | undefined = GROUPS.find((g) => g.id === groupId) ?? GROUPS[0];
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string[]>>(() => Object.fromEntries(GROUPS.map((g) => [g.id, g.defaultIds])));
  const [metricId, setMetricId] = useState('a30p');
  const metric = METRICS.find((m) => m.id === metricId)!;
  const [tab, setTab] = useState<'trend' | 'alder' | 'tabell'>('trend');
  const [showNational, setShowNational] = useState(true);
  const [pickedYear, setPickedYear] = useState<number | null>(null);

  const refNivaa = useMemo(() => {
    if (!group) return null;
    const pick = (ps: StudentProgram[]) => {
      const c: Record<string, number> = {};
      ps.forEach((p) => { if (p.nivaa) c[p.nivaa] = (c[p.nivaa] ?? 0) + 1; });
      return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0];
    };
    return pick(group.programs.filter((p) => group.nmbuIds.includes(p.entryId))) ?? pick(group.programs) ?? null;
  }, [group]);

  if (!group) {
    return <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', color: 'var(--nmbu-neutral-2)', fontSize: 13 }}>Ingen studentdata for dette fakultetet ennå.</div>;
  }
  const national = refNivaa ? STUDENT_NATIONAL[refNivaa] ?? [] : [];
  const nivaaNavn = refNivaa ? NIVAA_NAVN[refNivaa] ?? refNivaa : '';
  const natFor = (y: number) => national.find((x) => x.aar === y);
  const LAND = '__land';

  const selected = selectedByGroup[group.id] ?? group.defaultIds;
  const entries = group.programs.filter((p) => selected.includes(p.entryId));
  const toggle = (id: string) => setSelectedByGroup((prev) => {
    const cur = prev[group.id] ?? group.defaultIds;
    return { ...prev, [group.id]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
  });
  const yearOf = (p: StudentProgram, y: number) => p.aar.find((x) => x.aar === y);

  const years = [...new Set(group.programs.flatMap((p) => p.aar.map((x) => x.aar)))].sort();
  const latest = years[years.length - 1];
  const year = pickedYear && years.includes(pickedYear) ? pickedYear : latest;
  const hasNationalMetric = metric.id !== 'utenl' && metric.id !== 'utv' && metric.id !== 'total';

  const chartData = years.map((y) => {
    const row: Record<string, number | string> = { year: String(y) };
    entries.forEach((p) => { const v = yearVal(yearOf(p, y), metric.id); if (v != null) row[p.entryId] = Math.round(v * 10) / 10; });
    if (showNational && hasNationalMetric) { const v = yearVal(natFor(y), metric.id); if (v != null) row[LAND] = Math.round(v * 10) / 10; }
    return row;
  });

  const ageRows = [
    ...entries.map((p) => ({ id: p.entryId, name: p.shortName, y: yearOf(p, year) })),
    ...(national.length ? [{ id: LAND, name: `Landssnitt ${nivaaNavn}`, y: natFor(year) }] : []),
  ].filter((r) => r.y && r.y.total > 0).map((r) => {
    const out: Record<string, number | string> = { id: r.id, name: r.name };
    const sum = BANDS.reduce((s, b) => s + r.y![b.key], 0) || 1;
    BANDS.forEach((b) => { out[b.key] = Math.round((r.y![b.key] / sum) * 1000) / 10; });
    return out;
  });

  const nmbu = group.programs.filter((p) => group.nmbuIds.includes(p.entryId));
  const nameOf = (id: string) => id === LAND ? `Landssnitt ${nivaaNavn}` : group.programs.find((p) => p.entryId === id)?.shortName ?? id;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {GROUPS.map((g) => (
          <button key={g.id} onClick={() => { setGroupId(g.id); setPickedYear(null); }} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{ backgroundColor: g.id === group.id ? 'var(--nmbu-green-dark)' : '#fff', color: g.id === group.id ? '#fff' : 'var(--nmbu-neutral-1)', border: '1px solid ' + (g.id === group.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)') }}>
            {g.label}
          </button>
        ))}
      </div>

      {nmbu.map((p) => {
        const y = [...p.aar].reverse().find((x) => x.total > 0);
        const nat = y ? natFor(y.aar) : undefined;
        const land = (id: string) => { const v = yearVal(nat, id); return v != null ? `landssnitt ${nivaaNavn}: ${nf(v, 1)}${id.endsWith('p') && id !== 'utvp' ? ' %' : ''}` : undefined; };
        const items: { l: string; v: string; sub?: string }[] = y ? [
          { l: `Registrerte høst ${y.aar}`, v: nf(y.total, 0) },
          { l: '30 år og eldre', v: cellText(y, METRICS[0]), sub: land('a30p') },
          { l: '21 år og yngre', v: cellText(y, METRICS[2]), sub: land('a21p') },
          { l: 'Utenlandske', v: cellText(y, METRICS[3]), sub: [y.utenlandske != null ? `${nf(y.utenlandske, 0)} studenter` : null, land('utenlp')].filter(Boolean).join(' · ') },
          { l: 'Utveksling ut per 100', v: cellText(y, METRICS[5]), sub: [y.utveksling != null ? `${nf(y.utveksling, 0)} studenter` : null, land('utvp')].filter(Boolean).join(' · ') },
        ] : [];
        return (
          <div key={p.entryId} className="rounded-2xl mb-6 px-6 py-5" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
              {p.shortName} · {p.programnavn} · {y ? `høst ${y.aar}` : 'ingen tall'}
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
          <div className="flex items-center gap-2 mb-3" style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>
            <Filter className="w-4 h-4" /> Velg program
          </div>
          <div className="flex flex-col gap-2">
            {group.programs.map((p) => {
              const on = selected.includes(p.entryId);
              return (
                <button key={p.entryId} onClick={() => toggle(p.entryId)} className="rounded-xl px-3 py-2 text-left transition-all"
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
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
              {([['trend', 'Trend per år'], ['alder', `Aldersfordeling ${year ?? ''}`], ['tabell', 'Tabell']] as const).map(([t, l]) => (
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

          {tab !== 'alder' && (
            <div className="flex flex-wrap gap-2 mb-3">
              {METRICS.map((m) => (
                <button key={m.id} onClick={() => setMetricId(m.id)} title={m.desc} className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: metricId === m.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)', color: metricId === m.id ? '#fff' : 'var(--nmbu-neutral-1)' }}>{m.label}</button>
              ))}
            </div>
          )}

          {tab === 'trend' && (
            <>
              <div className="flex items-center gap-3 flex-wrap mb-2" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                <span>{metric.desc}</span>
                {national.length > 0 && hasNationalMetric && (
                  <label className="flex items-center gap-1.5 cursor-pointer" style={{ color: 'var(--nmbu-neutral-1)' }}>
                    <input type="checkbox" checked={showNational} onChange={(e) => setShowNational(e.target.checked)} />
                    Vis landssnitt ({nivaaNavn})
                  </label>
                )}
              </div>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} tickFormatter={(v: number) => nf(v, 0)} />
                  <Tooltip formatter={(v: number, name: string) => [fmt(v, metric), nameOf(name)]} />
                  <Legend formatter={(v: string) => nameOf(v)} wrapperStyle={{ fontSize: 11 }} />
                  {showNational && hasNationalMetric && national.length > 0 && (
                    <Line dataKey={LAND} stroke="#6b7280" strokeWidth={2} strokeDasharray="6 4" dot={false} connectNulls type="monotone" />
                  )}
                  {entries.map((p) => (
                    <Line key={p.entryId} type="monotone" dataKey={p.entryId} stroke={colorFor(p.entryId)} strokeWidth={p.isNmbu ? 3 : 2} dot={{ r: 3 }} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </>
          )}

          {tab === 'alder' && (
            <>
              <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginBottom: 8 }}>
                Aldersfordeling blant registrerte studenter høsten {year}, i prosent av summen av aldersgruppene.
              </div>
              <ResponsiveContainer width="100%" height={Math.max(200, ageRows.length * 40 + 60)}>
                <BarChart data={ageRows} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v} %`} />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number, key: string) => [`${nf(v, 1)} %`, BANDS.find((b) => b.key === key)?.label ?? key]} />
                  <Legend formatter={(v: string) => BANDS.find((b) => b.key === v)?.label ?? v} wrapperStyle={{ fontSize: 11 }} />
                  {BANDS.map((b) => <Bar key={b.key} dataKey={b.key} stackId="alder" fill={b.color} />)}
                </BarChart>
              </ResponsiveContainer>
            </>
          )}

          {tab === 'tabell' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                    <th className="px-3 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Program</th>
                    {METRICS.map((m) => (
                      <th key={m.id} className="px-3 py-2 text-right" style={{ color: m.id === metricId ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }} title={m.desc}>{m.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...entries].sort((a, b) => (yearVal(yearOf(b, year), metric.id) ?? -1) - (yearVal(yearOf(a, year), metric.id) ?? -1)).map((p) => (
                    <tr key={p.entryId} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: p.isNmbu ? 'var(--nmbu-green-4)' : 'transparent' }}>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorFor(p.entryId) }} /><span style={{ fontWeight: 600 }}>{p.shortName}</span>{p.isNmbu && <span className="px-1.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, backgroundColor: '#fff', color: 'var(--nmbu-green-dark)' }}>NMBU</span>}</div>
                        <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{p.programnavn}</div>
                      </td>
                      {METRICS.map((m) => (
                        <td key={m.id} className="px-3 py-2 text-right" style={{ fontWeight: m.id === metricId ? 700 : 400, whiteSpace: 'nowrap' }}>{cellText(yearOf(p, year), m)}</td>
                      ))}
                    </tr>
                  ))}
                  {national.length > 0 && (
                    <tr style={{ borderTop: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)', fontStyle: 'italic' }}>
                      <td className="px-3 py-2"><div style={{ fontWeight: 600 }}>Landssnitt</div><div style={{ fontSize: 10 }}>alle institusjoner, {nivaaNavn}</div></td>
                      {METRICS.map((m) => (
                        <td key={m.id} className="px-3 py-2 text-right" style={{ whiteSpace: 'nowrap' }}>{fmt(yearVal(natFor(year), m.id), m)}</td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
              <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginTop: 6 }}>År {year}. «–» = ikke rapportert. «≤ x» = DBH har skjermet tallet (0–2 personer).</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3 mt-5" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Kilde: DBH/HK-dir tabell 60 (studenter etter alder), 135 (utenlandske studenter, dvs. utenlandsk statsborgerskap) og 142 (utvekslingsstudenter), hentet {STUDENT_HENTET}.
          Alder og utenlandske gjelder registrerte studenter i høstsemesteret. Utveksling ut er programmets egne studenter på utveksling i utlandet, summert over vår og høst.
          Aldersgruppene er hentet som hele grupper for å unngå DBHs skjerming av små celler (1–2 personer vises som 0); enkeltårsalder ville mistet mange av de eldste studentene.
          Landssnittet er summen over alle norske institusjoner for samme gradsnivå som NMBU-programmet i gruppen.
        </span>
        <a href="https://dbh.hkdir.no" target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 shrink-0" style={{ color: 'var(--nmbu-green-dark)' }}><ExternalLink className="w-3.5 h-3.5" /> DBH</a>
      </div>
    </div>
  );
}
