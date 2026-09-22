import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Info, ExternalLink } from 'lucide-react';
import { CsvExportButton } from './CsvExportButton';
import { exportSamfCsv } from '../utils/csvExport';
import {
  SAMF_DATA, SAMF_YEARS, DEFAULT_SAMF_IDS, BACHELOR_IDS,
} from '../data/samfData';
import type { FullAdmissionEntry, FullYearData } from '../data/fullAdmissionData';

// ─── Metrics ─────────────────────────────────────────────────────────────────

type MetricKey = 'alleS' | 'fvS' | 'sokerpress' | 'plasser' | 'kvinner' | 'kvalifiserte' | 'pg_ord' | 'pg_fv' | 'pg_snitt';

interface MetricDef {
  id: MetricKey;
  label: string;
  unit: string;
  decimals: number;
  description: string;
}

const METRICS: MetricDef[] = [
  { id: 'alleS',       label: 'Alle søkere',        unit: '',  decimals: 0, description: 'Totalt antall søkere' },
  { id: 'fvS',         label: 'Førstevalgssøkere',  unit: '',  decimals: 0, description: 'Søkere med studiet som 1. valg' },
  { id: 'sokerpress',  label: 'Søkerpress',          unit: 'x', decimals: 1, description: 'Førstevalgssøkere per studieplass' },
  { id: 'plasser',     label: 'Plasser',             unit: '',  decimals: 0, description: 'Antall studieplasser' },
  { id: 'kvinner',     label: 'Kvinner %',           unit: '%', decimals: 1, description: 'Andel kvinner blant 1.valg-søkere' },
  { id: 'pg_fv',       label: 'Pg. FV',              unit: '',  decimals: 1, description: 'Poenggrense førstegangsvitnemål' },
  { id: 'pg_ord',      label: 'Pg. ordinær',         unit: '',  decimals: 1, description: 'Poenggrense ordinær kvote' },
  { id: 'pg_snitt',    label: 'Snitt poenggrense',   unit: '',  decimals: 1, description: 'Gjennomsnitt av ordinær og førstegangsvitnemål poenggrense' },
];

function getVal(data: FullYearData, metric: MetricKey): number | null {
  if (metric === 'sokerpress') {
    if (!data.fvS || !data.plasser) return null;
    return data.fvS / data.plasser;
  }
  if (metric === 'pg_snitt') {
    if (data.pg_fv === null || data.pg_ord === null) return null;
    if (data.pg_fv === 0 && data.pg_ord === 0) return 0;
    if (data.pg_fv === 0 || data.pg_ord === 0) return null;
    return (data.pg_fv + data.pg_ord) / 2;
  }
  return data[metric as keyof FullYearData] as number | null;
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const SAMF_PALETTE: Record<string, string> = {
  uio_samf:    '#C8102E',   // UiO red
  uib_samf:    '#005CA9',   // UiB blue
  nmbu_samf:   '#025C4F',   // NMBU green
  ntnu_samf:   '#00509E',   // NTNU blue-dark
  uit_samf:    '#003349',   // UiT
  uio_finans:  '#9B3D9B',   // UiO Økonomi og finans – lilla
  uio_analyse: '#E05C2A',
  uib_master:  '#4E7FC4',
  ntnu_master: '#7B3FA0',
};

function colorFor(id: string): string {
  return SAMF_PALETTE[id] ?? '#888';
}

// ─── Trend chip ───────────────────────────────────────────────────────────────

function TrendChip({ val, prev }: { val: number | null; prev: number | null }) {
  if (val === null || prev === null) return null;
  const diff = val - prev;
  if (Math.abs(diff) < 0.05) return <Minus className="w-3.5 h-3.5 inline" style={{ color: '#888' }} />;
  if (diff > 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs" style={{ color: '#2a7a55' }}>
      <TrendingUp className="w-3 h-3" />+{Math.abs(diff).toFixed(1)}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs" style={{ color: '#9b3a3a' }}>
      <TrendingDown className="w-3 h-3" />−{Math.abs(diff).toFixed(1)}
    </span>
  );
}

// ─── Program picker ───────────────────────────────────────────────────────────

type TypeFilter = 'bachelor' | 'alle';

function ProgramPicker({
  selected, onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('bachelor');

  const filtered = SAMF_DATA.filter((e) =>
    typeFilter === 'bachelor' ? BACHELOR_IDS.includes(e.id) : true
  );

  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };

  const typeLabel: Record<string, string> = {
    bachelor: 'Bachelor', master: 'Master', arsstudium: 'Annen', analyse: 'Annen',
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
      <div className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>
          Programmer
        </div>
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
          {(['bachelor', 'alle'] as TypeFilter[]).map((t, i) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className="px-3 py-1 text-xs transition-all"
              style={{
                backgroundColor: typeFilter === t ? 'var(--nmbu-green-dark)' : '#fff',
                color: typeFilter === t ? '#fff' : 'var(--nmbu-neutral-1)',
                borderRight: i === 0 ? '1px solid var(--nmbu-neutral-3)' : 'none',
              }}
            >
              {t === 'bachelor' ? 'Bachelor' : 'Alle'}
            </button>
          ))}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        {filtered.map((e) => {
          const active = selected.includes(e.id);
          const col = colorFor(e.id);
          return (
            <button key={e.id} onClick={() => toggle(e.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all w-full"
              style={{
                backgroundColor: active ? col : 'var(--nmbu-beige-light)',
                color: active ? '#fff' : 'var(--nmbu-neutral-1)',
                border: `1.5px solid ${active ? col : 'var(--nmbu-neutral-3)'}`,
                fontWeight: active ? 600 : 400,
              }}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: active ? '#fff' : col, opacity: active ? 0.9 : 1 }} />
              <div>
                <div>{e.shortName}</div>
                <div style={{ fontSize: 10, opacity: 0.75, fontWeight: 400 }}>
                  {e.studiested} · {typeLabel[e.type] ?? e.type}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="px-3 pb-2.5 flex gap-2">
        <button onClick={() => onChange(DEFAULT_SAMF_IDS)} className="text-xs hover:underline" style={{ color: 'var(--nmbu-green)' }}>Standard</button>
        <button onClick={() => onChange(SAMF_DATA.map((e) => e.id))} className="text-xs hover:underline" style={{ color: 'var(--nmbu-neutral-2)' }}>Alle</button>
        <button onClick={() => onChange([])} className="text-xs hover:underline" style={{ color: 'var(--nmbu-neutral-2)' }}>Fjern</button>
      </div>
    </div>
  );
}

// ─── Trend chart ─────────────────────────────────────────────────────────────

function TrendChart({ selectedEntries, metric }: { selectedEntries: FullAdmissionEntry[]; metric: MetricDef }) {
  const data = SAMF_YEARS.map((year) => {
    const row: Record<string, number | string> = { year };
    selectedEntries.forEach((e) => {
      const yr = e.years[year];
      if (!yr) return;
      const v = getVal(yr, metric.id);
      if (v !== null) row[e.id] = v;
    });
    return row;
  });

  const lastIdx = SAMF_YEARS.length - 1;

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={data} margin={{ top: 12, right: 110, bottom: 4, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-neutral-3)" />
        <XAxis dataKey="year" tick={{ fill: '#555', fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis domain={['auto', 'auto']} tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false} width={40}
          tickFormatter={(v) => metric.unit === '%' ? `${v}%` : metric.unit === 'x' ? `${v}x` : String(v)} />
        <Tooltip
          formatter={(v: number, key: string) => {
            const e = selectedEntries.find((x) => x.id === key);
            return [`${v.toFixed(metric.decimals)}${metric.unit ? ' ' + metric.unit : ''}`, e?.shortName ?? key];
          }}
          contentStyle={{ border: '1px solid var(--nmbu-green-3)', borderRadius: 8, fontSize: 12 }}
        />
        <ReferenceLine x="2026" stroke="var(--nmbu-green-dark)" strokeDasharray="4 3" strokeWidth={1.5}
          label={{ value: '2026', fill: 'var(--nmbu-green-dark)', fontSize: 10, position: 'top' }} />
        {selectedEntries.map((e) => {
          const col = colorFor(e.id);
          return (
            <Line key={e.id} type="monotone" dataKey={e.id}
              stroke={col} strokeWidth={2.5} connectNulls
              dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: col }}
              activeDot={{ r: 6 }}
              label={(props: { x?: number; y?: number; index?: number; value?: number }) => {
                const k = `lbl-${e.id}-${props.index ?? 0}`;
                if (props.index !== lastIdx || props.value == null) return <g key={k} />;
                return (
                  <text key={k} x={(props.x ?? 0) + 8} y={(props.y ?? 0) + 4} fontSize={11} fontWeight={700} fill={col} textAnchor="start">
                    {e.shortName}
                  </text>
                );
              }}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Bar comparison ───────────────────────────────────────────────────────────

function BarComparison({ selectedEntries, metric }: { selectedEntries: FullAdmissionEntry[]; metric: MetricDef }) {
  const data = selectedEntries
    .map((e) => {
      const yr = e.years['2026'];
      if (!yr) return null;
      const v = getVal(yr, metric.id);
      if (v === null) return null;
      return { id: e.id, name: e.shortName, value: v };
    })
    .filter(Boolean)
    .sort((a, b) => b!.value - a!.value) as { id: string; name: string; value: number }[];

  if (data.length === 0) return <p className="text-sm text-center py-8" style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen data.</p>;

  const avg = data.reduce((s, d) => s + d.value, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 38)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 60, bottom: 4, left: 90 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-neutral-3)" horizontal={false} />
        <XAxis type="number" domain={['auto', 'auto']} tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false}
          tickFormatter={(v) => metric.unit === '%' ? `${v}%` : metric.unit === 'x' ? `${v}x` : String(v)} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#333', fontSize: 11 }} tickLine={false} axisLine={false} width={88} />
        <Tooltip
          formatter={(v: number) => [`${v.toFixed(metric.decimals)}${metric.unit ? ' ' + metric.unit : ''}`, metric.label]}
          contentStyle={{ border: '1px solid var(--nmbu-green-3)', borderRadius: 8, fontSize: 12 }}
        />
        <ReferenceLine x={avg} stroke="#888" strokeDasharray="4 3"
          label={{ value: `Snitt ${avg.toFixed(metric.decimals)}`, position: 'top', fontSize: 10, fill: '#888' }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((d) => <Cell key={d.id} fill={colorFor(d.id)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Data table ───────────────────────────────────────────────────────────────

function DataTable({ selectedEntries }: { selectedEntries: FullAdmissionEntry[] }) {
  const [sortKey, setSortKey] = useState<MetricKey>('pg_ord');
  const [sortAsc, setSortAsc] = useState(false);

  const rows = selectedEntries
    .map((e) => ({ e, y26: e.years['2026'], y25: e.years['2025'] }))
    .filter((r) => r.y26)
    .sort((a, b) => {
      const av = a.y26 ? getVal(a.y26, sortKey) : null;
      const bv = b.y26 ? getVal(b.y26, sortKey) : null;
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      return sortAsc ? av - bv : bv - av;
    });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
            <th className="px-3 py-2.5 text-left" style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>Program</th>
            {METRICS.map((m) => (
              <th key={m.id}
                className="px-3 py-2.5 text-center cursor-pointer select-none hover:opacity-70 whitespace-nowrap"
                style={{ color: sortKey === m.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', fontWeight: 600 }}
                onClick={() => { if (sortKey === m.id) setSortAsc((v) => !v); else { setSortKey(m.id); setSortAsc(false); } }}
                title={m.description}
              >
                {m.label} {sortKey === m.id ? (sortAsc ? '↑' : '↓') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ e, y26, y25 }, i) => (
            <tr key={e.id} style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: i % 2 === 0 ? '#fff' : 'var(--nmbu-beige-light)' }}>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorFor(e.id) }} />
                  <span style={{ fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>{e.shortName}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginTop: 1 }}>{e.studiekode} · {e.studiested}</div>
              </td>
              {METRICS.map((m) => {
                const v = y26 ? getVal(y26, m.id) : null;
                const vPrev = y25 ? getVal(y25, m.id) : null;
                const isZeroPg = v === 0 && (m.id === 'pg_ord' || m.id === 'pg_fv');
                return (
                  <td key={m.id} className="px-3 py-2.5 text-center">
                    <div style={{ fontWeight: 600, color: v === null ? 'var(--nmbu-neutral-3)' : isZeroPg ? 'var(--nmbu-green-6)' : 'var(--nmbu-neutral)' }}>
                      {v === null ? '–' : isZeroPg ? 'Alle inn' : `${v.toFixed(m.decimals)}${m.unit ? ' ' + m.unit : ''}`}
                    </div>
                    {v !== null && !isZeroPg && <div className="mt-0.5"><TrendChip val={v} prev={vPrev} /></div>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type ChartTab = 'trend' | 'sammenligning' | 'tabell';

export function SamfunnsokonomAnalysis() {
  const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_SAMF_IDS);
  const [metric, setMetric] = useState<MetricKey>('pg_ord');
  const [chartTab, setChartTab] = useState<ChartTab>('trend');

  const selectedEntries = useMemo(
    () => SAMF_DATA.filter((e) => selectedIds.includes(e.id)),
    [selectedIds]
  );

  const currentMetric = METRICS.find((m) => m.id === metric)!;

  const stats = useMemo(() => {
    const nmbu = SAMF_DATA.find((e) => e.id === 'nmbu_samf');
    const n26 = nmbu?.years['2026'] ?? null;
    const n25 = nmbu?.years['2025'] ?? null;
    const sp26 = n26?.fvS && n26?.plasser ? n26.fvS / n26.plasser : null;
    const sp25 = n25?.fvS && n25?.plasser ? n25.fvS / n25.plasser : null;

    const bachelors = SAMF_DATA.filter((e) => BACHELOR_IDS.includes(e.id));
    const pgRows = bachelors
      .map((e) => ({ e, pg: e.years['2026']?.pg_ord ?? null }))
      .filter((x) => x.pg !== null && x.pg! > 0)
      .sort((a, b) => b.pg! - a.pg!);
    const nmbuRank = pgRows.findIndex((x) => x.e.id === 'nmbu_samf') + 1;

    const fmt = (d: number, dec = 0) => (d >= 0 ? '+' : '') + (dec ? d.toFixed(dec) : Math.round(d));

    return {
      n26, n25, sp26, sp25, nmbuRank, totalWithPg: pgRows.length,
      highlights: [
        {
          label: 'Alle søkere',
          value: n26?.alleS?.toLocaleString('nb-NO') ?? '–',
          delta: n26?.alleS != null && n25?.alleS != null ? `${fmt(n26.alleS - n25.alleS)} vs. 2025` : null,
        },
        {
          label: 'Førstevalgssøkere',
          value: n26?.fvS?.toLocaleString('nb-NO') ?? '–',
          delta: n26?.fvS != null && n25?.fvS != null ? `${fmt(n26.fvS - n25.fvS)} vs. 2025` : null,
        },
        {
          label: 'Søkerpress',
          value: sp26 != null ? `${sp26.toFixed(2)}×` : '–',
          delta: sp26 != null && sp25 != null ? `${fmt(sp26 - sp25, 2)}× vs. 2025` : null,
        },
        {
          label: 'Poenggrense (fv. / ord.)',
          value: n26?.pg_fv != null && n26?.pg_ord != null
            ? `${n26.pg_fv.toFixed(1)} / ${n26.pg_ord.toFixed(1)}` : '–',
          delta: n26?.pg_ord != null && n25?.pg_ord != null
            ? `${fmt(n26.pg_ord - n25.pg_ord, 1)} vs. 2025` : null,
        },
        {
          label: 'Rang blant bachelor',
          value: nmbuRank > 0 ? `#${nmbuRank} av ${pgRows.length}` : '–',
          sub: 'ordinær poenggrense',
          delta: null,
        },
      ] as { label: string; value: string; sub?: string; delta: string | null }[],
    };
  }, []);

  const chartTabs: { id: ChartTab; label: string }[] = [
    { id: 'trend',         label: 'Trend 2021–2026' },
    { id: 'sammenligning', label: 'Sammenligning 2026' },
    { id: 'tabell',        label: 'Datatabell' },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#184075', color: '#fff' }}>

        {/* Title + description */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
          <div style={{ maxWidth: 620 }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8 }}>
              Samordna Opptak · Samfunnsøkonomi · bachelor
            </div>
            <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: 22, lineHeight: 1.3 }}>
              Hvor står NMBU i konkurransen om samfunnsøkonomi-søkerne?
            </div>
            <p style={{ fontSize: 13, opacity: 0.82, marginTop: 10, lineHeight: 1.65 }}>
              Sammenlign <strong style={{ opacity: 1 }}>NMBUs søkertall, søkerpress og poenggrenser</strong> mot
              de andre bachelor-programmene i samfunnsøkonomi: UiO (185898), UiB (184369), NTNU (194898) og UiT (186898).
              I tillegg er <strong style={{ opacity: 1 }}>UiO Økonomi og finans (185369)</strong> inkludert som en viktig konkurrent
              innen øk.adm.-feltet. Offisielle tall fra Samordna Opptak per 23. juli 2026.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CsvExportButton onExport={exportSamfCsv} label="Last ned CSV" dark />
            <a href="https://hkdir.no/sokertall-fra-samordna-opptak-til-nedlasting"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <ExternalLink className="w-3.5 h-3.5" /> Kilde: SO / HKDIR
            </a>
          </div>
        </div>

        {/* NMBU highlight strip */}
        <div className="mx-6 mb-5 rounded-xl px-5 py-4" style={{ backgroundColor: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.18)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6EE7B7' }} />
            <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              NMBU Samfunnsøkonomi (192 468) · Nøkkeltall 2026
            </span>
          </div>
          <div className="flex gap-8 flex-wrap">
            {stats.highlights.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 9, opacity: 0.55, marginTop: 2 }}>{s.sub}</div>}
                {s.delta != null && (
                  <div style={{ fontSize: 10, marginTop: 3, fontWeight: 600, color: s.delta.startsWith('-') ? '#FCA5A5' : '#6EE7B7' }}>
                    {s.delta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '200px 1fr' }}>

        {/* Program picker */}
        <ProgramPicker selected={selectedIds} onChange={setSelectedIds} />

        {/* Chart panel */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
          <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
            <div className="flex flex-wrap gap-1.5">
              {METRICS.map((m) => (
                <button key={m.id} onClick={() => setMetric(m.id)}
                  className="px-3 py-1 rounded-full text-xs transition-all"
                  title={m.description}
                  style={{
                    backgroundColor: metric === m.id ? '#184075' : 'var(--nmbu-beige-light)',
                    color: metric === m.id ? '#fff' : 'var(--nmbu-neutral-1)',
                    fontWeight: metric === m.id ? 600 : 400,
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
              {chartTabs.map((t, i) => (
                <button key={t.id} onClick={() => setChartTab(t.id)}
                  className="px-3 py-1.5 text-xs transition-all"
                  style={{
                    backgroundColor: chartTab === t.id ? '#184075' : '#fff',
                    color: chartTab === t.id ? '#fff' : 'var(--nmbu-neutral-1)',
                    borderRight: i < chartTabs.length - 1 ? '1px solid var(--nmbu-neutral-3)' : 'none',
                    fontWeight: chartTab === t.id ? 600 : 400,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {selectedEntries.length === 0 ? (
              <div className="flex items-center justify-center h-48" style={{ color: 'var(--nmbu-neutral-2)', fontSize: 13 }}>
                Velg minst ett program i filteret.
              </div>
            ) : (
              <>
                {chartTab === 'trend' && (
                  <>
                    <div className="mb-3 flex items-center gap-2" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      {currentMetric.description} · 2021–2026
                    </div>
                    <TrendChart selectedEntries={selectedEntries} metric={currentMetric} />
                  </>
                )}
                {chartTab === 'sammenligning' && (
                  <>
                    <div className="mb-3" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                      {currentMetric.description} · valgte programmer · 2026. Sortert fallende.
                    </div>
                    <BarComparison selectedEntries={selectedEntries} metric={currentMetric} />
                  </>
                )}
                {chartTab === 'tabell' && (
                  <DataTable selectedEntries={selectedEntries} />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Key insight box: bachelor pg comparison */}
      <div className="rounded-xl p-5" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
        <div className="mb-3" style={{ fontWeight: 600, fontSize: 13, color: 'var(--nmbu-green-dark)' }}>
          Poenggrenser bachelor 2021–2026 — ordinær kvote
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                <th className="px-3 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Program</th>
                {SAMF_YEARS.map((y) => (
                  <th key={y} className="px-3 py-2 text-center" style={{ color: y === '2026' ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', fontWeight: y === '2026' ? 700 : 600 }}>{y}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMF_DATA.filter((e) => BACHELOR_IDS.includes(e.id)).map((e, i) => (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: i % 2 === 0 ? '#fff' : 'var(--nmbu-beige-light)' }}>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorFor(e.id) }} />
                      <span style={{ fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>{e.shortName}</span>
                      <span style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{e.studiested}</span>
                    </div>
                  </td>
                  {SAMF_YEARS.map((y) => {
                    const pg = e.years[y]?.pg_ord ?? null;
                    const prev = (() => {
                      const prevIdx = SAMF_YEARS.indexOf(y) - 1;
                      if (prevIdx < 0) return null;
                      return e.years[SAMF_YEARS[prevIdx]]?.pg_ord ?? null;
                    })();
                    const change = pg !== null && prev !== null ? pg - prev : null;
                    return (
                      <td key={y} className="px-3 py-2.5 text-center">
                        <div style={{ fontWeight: y === '2026' ? 700 : 500, color: pg === 0 ? 'var(--nmbu-green-6)' : 'var(--nmbu-neutral)' }}>
                          {pg === null ? '–' : pg === 0 ? 'Alle inn' : pg.toFixed(1)}
                        </div>
                        {change !== null && Math.abs(change) >= 0.1 && (
                          <div className="text-center" style={{ fontSize: 9, color: change > 0 ? '#2a7a55' : '#9b3a3a', marginTop: 1 }}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3"
        style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Søkerpress = førstevalgssøkere / studieplasser. Poenggrense 0 = åpent opptak (alle kvalifiserte kom inn).
          UiT Tromsø (186898) har åpent opptak alle år. Søkertall er per april 2026 fra Samordna Opptak.
        </span>
      </div>

    </div>
  );
}
