import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Info, ExternalLink, Filter } from 'lucide-react';
import type { FacultyData } from '../data/faculties';
import type { CompletionGroup, CompletionProgram, CompletionCohort, CompletionYear } from '../data/landsamCompletionData';
import { landsamColorForGroups } from '../data/landsamPalette';
import { COMPLETION_NATIONAL, NIVAA_NAVN, type NationalCohort } from '../data/completionNationalData';

/**
 * Gjennomføring, frafall og studenttall per program: NMBU mot konkurrentene i hver gruppe.
 * Kullmål (per startkull, DBH 707) og årsmål (per kalenderår, DBH 123/110/104/335).
 */

const NÅ = 2026;

/** Landssnitt per studium fra SSB 14957/14958 (build-gjennomforing-landssnitt.py → public/gjennomforing/landssnitt.json) */
interface SsbSnitt { ssbStudiumLabel: string; nivaa: string; andelNormert: number | null; andelNormertPluss: number | null; kull: string; koblingKvalitet: string }
let ssbLast: Promise<Record<string, Record<string, SsbSnitt>> | null> | null = null;
const hentSsbSnitt = () => (ssbLast ??= fetch(`${import.meta.env.BASE_URL}gjennomforing/landssnitt.json`)
  .then((r) => (r.ok ? r.json() : null)).then((d) => d?.fakulteter ?? null).catch(() => { ssbLast = null; return null; }));
type Kind = 'kull' | 'aar';
interface MetricDef { id: string; label: string; kind: Kind; unit: '%' | ''; decimals: number; desc: string; }
const METRICS: MetricDef[] = [
  { id: 'normert',   label: 'Fullført på normert tid',  kind: 'kull', unit: '%', decimals: 1, desc: 'Andel av startkullet som fullførte programmet innen normert tid (3 år bachelor, 2 år master, 5 år femårig)' },
  { id: 'normert1',  label: 'Fullført normert + 1 år',  kind: 'kull', unit: '%', decimals: 1, desc: 'Andel fullført innen ett år etter normert tid' },
  { id: 'normert2',  label: 'Fullført normert + 2 år',  kind: 'kull', unit: '%', decimals: 1, desc: 'Andel fullført innen to år etter normert tid' },
  { id: 'frafalt',   label: 'Frafall ved normert tid',   kind: 'kull', unit: '%', decimals: 1, desc: 'Andel av startkullet som hadde sluttet ved normert tid' },
  { id: 'frafalt2',  label: 'Frafall normert + 2 år',    kind: 'kull', unit: '%', decimals: 1, desc: 'Andel som hadde sluttet to år etter normert tid' },
  { id: 'startkull', label: 'Startkull',                 kind: 'kull', unit: '',  decimals: 0, desc: 'Antall studenter som startet på programmet det året (høst)' },
  { id: 'kvinnerKull', label: 'Kvinneandel i kullet',    kind: 'kull', unit: '%', decimals: 1, desc: 'Andel kvinner i startkullet' },
  { id: 'registrerte', label: 'Registrerte studenter',   kind: 'aar',  unit: '',  decimals: 0, desc: 'Registrerte studenter på programmet i høstsemesteret' },
  { id: 'nye',       label: 'Nye studenter',             kind: 'aar',  unit: '',  decimals: 0, desc: 'Nye studenter på programmet i året (vår + høst)' },
  { id: 'kandidater', label: 'Kandidater',               kind: 'aar',  unit: '',  decimals: 0, desc: 'Ferdige kandidater fra programmet i året' },
  { id: 'kvinner',   label: 'Kvinneandel registrerte',   kind: 'aar',  unit: '%', decimals: 1, desc: 'Andel kvinner blant registrerte studenter (høst)' },
  { id: 'spgrad',    label: 'Studiepoeng iht. plan',     kind: 'aar',  unit: '%', decimals: 1, desc: 'Gjennomførte studiepoeng i prosent av planlagte (utdanningsplan)' },
];

function nf(v: number, dec: number): string {
  return v.toLocaleString('nb-NO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : null);

/** Målenivå for gjennomføring: studieprogram (DBH 707), institusjon (706) eller sektor (705). */
type View = 'program' | 'inst' | 'sektor';
const VIEWS: { id: View; label: string; desc: string }[] = [
  { id: 'program', label: 'Samme program', desc: 'DBH 707: fullført = grad fra det samme studieprogrammet; frafall = sluttet på programmet (også de som byttet program eller studiested)' },
  { id: 'inst',    label: 'Samme institusjon', desc: 'DBH 706: fullført = grad på samme nivå ved samme institusjon, også etter programbytte' },
  { id: 'sektor',  label: 'Hele sektoren', desc: 'DBH 705: fullført = grad på samme nivå ved en hvilken som helst norsk institusjon; frafall = ute av høyere utdanning' },
];
const VIEW_METRICS = new Set(['normert', 'normert1', 'normert2', 'frafalt', 'frafalt2']);

type RefCounts = { fullfortNormert: number; fullfort1: number; fullfort2: number; frafalt: number; frafalt2: number };
function refVal(r: RefCounts | null | undefined, startkull: number, normertAar: number | null, id: string): number | null {
  if (!r) return null;
  const n1ok = normertAar != null && normertAar + 1 <= NÅ - 1;
  const n2ok = normertAar != null && normertAar + 2 <= NÅ - 1;
  switch (id) {
    case 'normert': return pct(r.fullfortNormert, startkull);
    case 'normert1': return n1ok ? pct(r.fullfort1, startkull) : null;
    case 'normert2': return n2ok ? pct(r.fullfort2, startkull) : null;
    case 'frafalt': return pct(r.frafalt, startkull);
    case 'frafalt2': return n2ok ? pct(r.frafalt2, startkull) : null;
    default: return null;
  }
}

function kullVal(k: CompletionCohort, id: string, view: View = 'program'): number | null {
  if (VIEW_METRICS.has(id)) return refVal(view === 'program' ? k : k[view], k.startkull, k.normertAar, id);
  switch (id) {
    case 'startkull': return k.startkull;
    case 'kvinnerKull': return pct(k.startkullKvinner, k.startkull);
    default: return null;
  }
}

function nationalVal(c: NationalCohort | undefined, id: string, view: View): number | null {
  const r = c?.[view];
  return r ? refVal(r, r.startkull, c!.normertAar, id) : null;
}
function aarVal(y: CompletionYear, id: string): number | null {
  switch (id) {
    case 'registrerte': return y.registrerte;
    case 'nye': return y.nye;
    case 'kandidater': return y.kandidater;
    case 'kvinner': return y.registrerte != null && y.registrerteKvinner != null ? pct(y.registrerteKvinner, y.registrerte) : null;
    case 'spgrad': return y.spPlanlagt != null && y.spGjennomfort != null ? pct(y.spGjennomfort, y.spPlanlagt) : null;
    default: return null;
  }
}
function value(p: CompletionProgram, m: MetricDef, year: number, view: View = 'program'): number | null {
  if (m.kind === 'kull') { const k = p.kull.find((x) => x.aar === year); return k ? kullVal(k, m.id, view) : null; }
  const y = p.aar.find((x) => x.aar === year); return y ? aarVal(y, m.id) : null;
}
/** DBH viser 1–2 personer som 0: en målt null i en andel er derfor «≤ 2 personer» av kullet. */
function cellText(p: CompletionProgram, m: MetricDef, year: number, view: View): string {
  const v = value(p, m, year, view);
  if (v === 0 && VIEW_METRICS.has(m.id)) {
    const k = p.kull.find((x) => x.aar === year);
    if (k && k.startkull > 0) return `≤ ${nf(Math.min(100, 200 / k.startkull), 1)} %`;
  }
  return fmt(v, m);
}

function fmt(v: number | null, m: MetricDef): string {
  return v == null ? '–' : `${nf(v, m.decimals)}${m.unit === '%' ? ' %' : ''}`;
}

export function FacultyCompletion({ faculty }: { faculty: FacultyData }) {
  const GROUPS = faculty.completionGroups.filter((g) => g.programs.length > 0);
  const colorFor = useMemo(() => landsamColorForGroups(faculty.admissionGroups), [faculty]);
  const [groupId, setGroupId] = useState<string>(GROUPS[0]?.id ?? '');
  const [ssbSnitt, setSsbSnitt] = useState<Record<string, SsbSnitt> | null>(null);
  useEffect(() => { let aktiv = true; hentSsbSnitt().then((d) => { if (aktiv) setSsbSnitt(d?.[faculty.id] ?? null); }); return () => { aktiv = false; }; }, [faculty.id]);
  const group: CompletionGroup | undefined = GROUPS.find((g) => g.id === groupId) ?? GROUPS[0];
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string[]>>(() => Object.fromEntries(GROUPS.map((g) => [g.id, g.defaultIds])));
  const [metricId, setMetricId] = useState('normert');
  const metric = METRICS.find((m) => m.id === metricId)!;
  const [tab, setTab] = useState<'trend' | 'tabell'>('trend');
  const [view, setView] = useState<View>('program');
  const [showNational, setShowNational] = useState(true);

  if (!group) {
    return <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', color: 'var(--nmbu-neutral-2)', fontSize: 13 }}>Ingen gjennomføringsdata for dette fakultetet ennå.</div>;
  }
  const selected = selectedByGroup[group.id] ?? group.defaultIds;
  const entries = group.programs.filter((p) => selected.includes(p.entryId));
  const toggle = (id: string) => setSelectedByGroup((prev) => {
    const cur = prev[group.id] ?? group.defaultIds;
    return { ...prev, [group.id]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
  });

  const years = useMemo(() => {
    const ys = new Set<number>();
    group.programs.forEach((p) => (metric.kind === 'kull' ? p.kull : p.aar).forEach((x) => { if (value(p, metric, x.aar, view) != null) ys.add(x.aar); }));
    return [...ys].sort();
  }, [group, metric, view]);

  // Landssnitt for NMBU-programmets gradsnivå (gruppene kan blande nivåer), ellers gruppens vanligste nivå.
  const refNivaa = useMemo(() => {
    const count = (ps: CompletionProgram[]) => {
      const c: Record<string, number> = {};
      ps.forEach((p) => p.kull.forEach((k) => { if (k.nivaa) c[k.nivaa] = (c[k.nivaa] ?? 0) + 1; }));
      return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0];
    };
    return count(group.programs.filter((p) => group.nmbuIds.includes(p.entryId))) ?? count(group.programs) ?? null;
  }, [group]);
  const national = refNivaa ? COMPLETION_NATIONAL[refNivaa] ?? [] : [];
  const natFor = (y: number) => national.find((c) => c.aar === y);
  const hasNational = VIEW_METRICS.has(metric.id) && national.length > 0;
  const nivaaNavn = refNivaa ? NIVAA_NAVN[refNivaa] ?? refNivaa : '';
  const LAND = '__land';
  const latestYear = years[years.length - 1];
  const [tableYear, setTableYear] = useState<number | null>(null);
  const tYear = tableYear && years.includes(tableYear) ? tableYear : latestYear;

  const chartData = years.map((y) => {
    const row: Record<string, number | string> = { year: String(y) };
    entries.forEach((p) => { const v = value(p, metric, y, view); if (v != null) row[p.entryId] = Math.round(v * 10) / 10; });
    if (hasNational && showNational) { const v = nationalVal(natFor(y), metric.id, view); if (v != null) row[LAND] = Math.round(v * 10) / 10; }
    return row;
  });

  const nmbu = group.programs.filter((p) => group.nmbuIds.includes(p.entryId));

  return (
    <div>
      {/* Gruppevelger */}
      <div className="flex flex-wrap gap-2 mb-6">
        {GROUPS.map((g) => (
          <button key={g.id} onClick={() => { setGroupId(g.id); setTableYear(null); }} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{ backgroundColor: g.id === group.id ? 'var(--nmbu-green-dark)' : '#fff', color: g.id === group.id ? '#fff' : 'var(--nmbu-neutral-1)', border: '1px solid ' + (g.id === group.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)') }}>
            {g.label}
          </button>
        ))}
      </div>

      {/* NMBU-nøkkeltall */}
      {nmbu.map((p) => {
        const lastK = [...p.kull].reverse().find((k) => k.startkull > 0);
        const lastY = [...p.aar].reverse().find((y) => y.registrerte != null);
        const nat = lastK ? natFor(lastK.aar) : undefined;
        const landSub = (id: string) => { const v = nationalVal(nat, id, 'program'); return v != null ? `landssnitt ${nivaaNavn}: ${nf(v, 1)} %` : undefined; };
        const sekt = lastK ? kullVal(lastK, 'frafalt', 'sektor') : null;
        const items: { l: string; v: string; sub?: string }[] = [
          { l: `Fullført normert · kull ${lastK?.aar ?? ''}`, v: lastK ? fmt(kullVal(lastK, 'normert'), METRICS[0]) : '–', sub: landSub('normert') },
          { l: `Frafall ved normert · kull ${lastK?.aar ?? ''}`, v: lastK ? fmt(kullVal(lastK, 'frafalt'), METRICS[3]) : '–',
            sub: [sekt != null ? `ute av høyere utd.: ${nf(sekt, 1)} %` : null, landSub('frafalt')].filter(Boolean).join(' · ') || undefined },
          { l: `Startkull ${lastK?.aar ?? ''}`, v: lastK ? nf(lastK.startkull, 0) : '–' },
          { l: `Registrerte høst ${lastY?.aar ?? ''}`, v: lastY?.registrerte != null ? nf(lastY.registrerte, 0) : '–' },
          { l: `Kandidater ${lastY?.aar ?? ''}`, v: lastY?.kandidater != null ? nf(lastY.kandidater, 0) : '–' },
        ];
        return (
          <div key={p.entryId} className="rounded-2xl mb-6 px-6 py-5" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
              {p.shortName} · {p.programnavn} · siste tall
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
            {(() => {
              const ssb = ssbSnitt?.[group.id];
              if (!ssb || ssb.koblingKvalitet === 'ikke dekket' || ssb.andelNormert == null) return null;
              return (
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.18)', fontSize: 11, opacity: 0.85 }}>
                  Landssnitt for {ssb.ssbStudiumLabel.charAt(0).toLowerCase() + ssb.ssbStudiumLabel.slice(1)} (SSB, kull {ssb.kull}):{' '}
                  <b>{nf(ssb.andelNormert, 1)} %</b> fullført på normert tid{ssb.andelNormertPluss != null && <>, <b>{nf(ssb.andelNormertPluss, 1)} %</b> innen normert tid + 2 år</>}
                  {ssb.koblingKvalitet === 'grov' && <span style={{ opacity: 0.75 }}> · nærmeste fagfelt i SSB, grov sammenligning</span>}
                </div>
              );
            })()}
          </div>
        );
      })}

      <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(240px, 280px) 1fr' }}>
        {/* Institusjoner */}
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

        {/* Innhold */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
          <div className="flex flex-wrap gap-2 mb-2">
            {METRICS.filter((m) => m.kind === 'kull').map((m) => (
              <button key={m.id} onClick={() => setMetricId(m.id)} title={m.desc} className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: metricId === m.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)', color: metricId === m.id ? '#fff' : 'var(--nmbu-neutral-1)' }}>{m.label}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {METRICS.filter((m) => m.kind === 'aar').map((m) => (
              <button key={m.id} onClick={() => setMetricId(m.id)} title={m.desc} className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: metricId === m.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)', color: metricId === m.id ? '#fff' : 'var(--nmbu-neutral-1)' }}>{m.label}</button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
              {(['trend', 'tabell'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className="px-3 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: tab === t ? 'var(--nmbu-green-dark)' : '#fff', color: tab === t ? '#fff' : 'var(--nmbu-neutral-1)' }}>
                  {t === 'trend' ? (metric.kind === 'kull' ? 'Trend per startkull' : 'Trend per år') : 'Tabell'}
                </button>
              ))}
            </div>
            {tab === 'tabell' && years.length > 0 && (
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
                {years.map((y) => (
                  <button key={y} onClick={() => setTableYear(y)} className="px-2.5 py-1.5 text-xs"
                    style={{ backgroundColor: tYear === y ? 'var(--nmbu-green-4)' : '#fff', color: tYear === y ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-1)', fontWeight: tYear === y ? 700 : 400 }}>{y}</button>
                ))}
              </div>
            )}
          </div>
          {VIEW_METRICS.has(metric.id) && (
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--nmbu-neutral-2)' }}>Fullført og frafall målt mot:</span>
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
                {VIEWS.map((v, i) => (
                  <button key={v.id} onClick={() => setView(v.id)} title={v.desc} className="px-3 py-1.5 text-xs"
                    style={{ backgroundColor: view === v.id ? 'var(--nmbu-green-4)' : '#fff', color: view === v.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-1)', fontWeight: view === v.id ? 700 : 400,
                      borderRight: i < VIEWS.length - 1 ? '1px solid var(--nmbu-neutral-3)' : 'none' }}>{v.label}</button>
                ))}
              </div>
              {national.length > 0 && (
                <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--nmbu-neutral-1)' }}>
                  <input type="checkbox" checked={showNational} onChange={(e) => setShowNational(e.target.checked)} />
                  Vis landssnitt ({nivaaNavn})
                </label>
              )}
            </div>
          )}
          <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginBottom: 8 }}>
            {metric.desc}{metric.kind === 'kull' ? ' · x-aksen er startår for kullet' : ''}
            {VIEW_METRICS.has(metric.id) && view !== 'program' ? ` · ${VIEWS.find((v) => v.id === view)!.desc}` : ''}
          </div>

          {tab === 'trend' && (
            chartData.some((r) => Object.keys(r).length > 1) ? (
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={metric.unit === '%' ? [0, 100] : ['auto', 'auto']} tickFormatter={(v: number) => nf(v, 0)} />
                  <Tooltip formatter={(v: number, name: string) => [fmt(v, metric), name === LAND ? `Landssnitt ${nivaaNavn}` : group.programs.find((p) => p.entryId === name)?.shortName ?? name]} labelFormatter={(l) => (metric.kind === 'kull' ? `Startkull ${l}` : String(l))} />
                  <Legend formatter={(v: string) => v === LAND ? `Landssnitt ${nivaaNavn}` : group.programs.find((p) => p.entryId === v)?.shortName ?? v} wrapperStyle={{ fontSize: 11 }} />
                  {hasNational && showNational && (
                    <Line dataKey={LAND} stroke="#6b7280" strokeWidth={2} strokeDasharray="6 4" dot={false} connectNulls type="monotone" />
                  )}
                  {entries.map((p) => (
                    <Line key={p.entryId} type="monotone" dataKey={p.entryId} stroke={colorFor(p.entryId)} strokeWidth={p.isNmbu ? 3 : 2} dot={{ r: 3 }} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-48" style={{ color: 'var(--nmbu-neutral-2)', fontSize: 13 }}>Ingen data for «{metric.label}» ennå.</div>
          )}

          {tab === 'tabell' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                    <th className="px-3 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Program</th>
                    {(metric.kind === 'kull' ? METRICS.filter((m) => m.kind === 'kull') : METRICS.filter((m) => m.kind === 'aar')).map((m) => (
                      <th key={m.id} className="px-3 py-2 text-right" style={{ color: m.id === metricId ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }} title={m.desc}>{m.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...entries].sort((a, b) => (value(b, metric, tYear, view) ?? -1) - (value(a, metric, tYear, view) ?? -1)).map((p) => (
                    <tr key={p.entryId} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: p.isNmbu ? 'var(--nmbu-green-4)' : 'transparent' }}>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorFor(p.entryId) }} /><span style={{ fontWeight: 600 }}>{p.shortName}</span>{p.isNmbu && <span className="px-1.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, backgroundColor: '#fff', color: 'var(--nmbu-green-dark)' }}>NMBU</span>}</div>
                        <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{p.programnavn}</div>
                      </td>
                      {(metric.kind === 'kull' ? METRICS.filter((m) => m.kind === 'kull') : METRICS.filter((m) => m.kind === 'aar')).map((m) => (
                        <td key={m.id} className="px-3 py-2 text-right" style={{ fontWeight: m.id === metricId ? 700 : 400, whiteSpace: 'nowrap' }}>{cellText(p, m, tYear, view)}</td>
                      ))}
                    </tr>
                  ))}
                  {metric.kind === 'kull' && national.length > 0 && (
                    <tr style={{ borderTop: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)', fontStyle: 'italic' }}>
                      <td className="px-3 py-2">
                        <div style={{ fontWeight: 600 }}>Landssnitt</div>
                        <div style={{ fontSize: 10 }}>alle institusjoner, {nivaaNavn}</div>
                      </td>
                      {METRICS.filter((m) => m.kind === 'kull').map((m) => {
                        const c = natFor(tYear);
                        const v = VIEW_METRICS.has(m.id) ? nationalVal(c, m.id, view) : m.id === 'startkull' ? (c?.program?.startkull ?? null) : null;
                        return <td key={m.id} className="px-3 py-2 text-right" style={{ whiteSpace: 'nowrap' }}>{fmt(v, m)}</td>;
                      })}
                    </tr>
                  )}
                </tbody>
              </table>
              <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginTop: 6 }}>{metric.kind === 'kull' ? `Startkull ${tYear}` : `År ${tYear}`}. «–» = ikke målt ennå eller ikke rapportert. «≤ x %» = DBH har skjermet tallet (0–2 personer).</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3 mt-5" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Kilde: DBH/HK-dir tabell 707 (gjennomføring og frafall per startkull), 123 (registrerte studenter, høst), 110 (nye studenter), 104 (ferdige kandidater) og 335 (studiepoeng iht. utdanningsplan), hentet {faculty.completionHentet ?? '–'}.
          Startkull er studentene som begynte på programmet en gitt høst; normert tid er 3 år for bachelor, 2 for toårig master og 5 for femårige løp. «+ 1 år» og «+ 2 år» vises bare for kull der fristen er passert.
          Programkoder er de samme som i karakterdataene, så programmer som har byttet kode kan ha kortere serier.
          «Fullført og frafall målt mot» bytter mellom DBH 707 (samme program), 706 (grad på samme nivå ved samme institusjon) og 705 (grad på samme nivå hvor som helst i sektoren; frafall betyr da ute av høyere utdanning).
          Landssnittet er summen over alle norske institusjoner for samme gradsnivå som NMBU-programmet i gruppen. DBH skjermer celler med 1–2 studenter; kulltallene hentes uten kjønnsdeling for å begrense skjermingen.
        </span>
        <a href="https://dbh.hkdir.no" target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 shrink-0" style={{ color: 'var(--nmbu-green-dark)' }}><ExternalLink className="w-3.5 h-3.5" /> DBH</a>
      </div>
    </div>
  );
}
