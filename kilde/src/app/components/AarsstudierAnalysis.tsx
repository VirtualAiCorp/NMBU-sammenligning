import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine,
} from 'recharts';
import { Info, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CsvExportButton } from './CsvExportButton';
import { exportAarsstudierCsv } from '../utils/csvExport';
import {
  ANNUAL_STUDIES_DATA, ANNUAL_YEARS, ANNUAL_DEFAULT_IDS,
} from '../data/annualStudiesData';
import { type FullYearData } from '../data/fullAdmissionData';

// ─── Palette ─────────────────────────────────────────────────────────────────

const PALETTE = [
  '#025c4f', '#e05c2a', '#3a7fc1', '#c2963a',
  '#7b3fa0', '#c13a5a', '#1a8c6b', '#4e7fc4',
  '#6b8c2a', '#1a6b8a', '#a04f2a', '#5a3aa0',
];

const NMBU_COLOR = '#025c4f';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type MetricKey = 'alleS' | 'fvS' | 'sokerpress' | 'plasser' | 'pg_ord' | 'pg_fv' | 'kvinner';

const METRICS: { id: MetricKey; label: string; unit: string; decimals: number; description: string }[] = [
  { id: 'fvS',        label: 'Førstevalgssøkere',   unit: '',  decimals: 0, description: 'Søkere med studiet som 1. valg' },
  { id: 'alleS',      label: 'Alle søkere',          unit: '',  decimals: 0, description: 'Totalt antall søkere' },
  { id: 'sokerpress', label: 'Søkerpress',            unit: 'x', decimals: 1, description: 'Førstevalgssøkere per studieplass' },
  { id: 'plasser',    label: 'Studieplasser',         unit: '',  decimals: 0, description: 'Antall studieplasser' },
  { id: 'pg_ord',     label: 'Poenggrense (ord.)',    unit: '',  decimals: 1, description: 'Opptaksgrense ordinær kvote (0 = alle inn)' },
  { id: 'kvinner',    label: 'Kvinner %',             unit: '%', decimals: 1, description: 'Andel kvinner blant 1. valg-søkere' },
];

function getVal(d: FullYearData, m: MetricKey): number | null {
  if (m === 'sokerpress') {
    if (!d.fvS || !d.plasser) return null;
    return d.fvS / d.plasser;
  }
  return d[m as keyof FullYearData] as number | null;
}

function fmt(v: number | null, m: { decimals: number; unit: string }) {
  if (v === null) return '–';
  return v.toFixed(m.decimals) + (m.unit ? ' ' + m.unit : '');
}

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

// ─── Main component ───────────────────────────────────────────────────────────

export function AarsstudierAnalysis() {
  const [selectedIds, setSelectedIds] = useState<string[]>(ANNUAL_DEFAULT_IDS);
  const [metric, setMetric] = useState<MetricKey>('fvS');
  const [view, setView] = useState<'trend' | 'bar2026' | 'tabell'>('trend');

  const allEntries = ANNUAL_STUDIES_DATA;

  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    allEntries.forEach((e, i) => {
      map[e.id] = e.id === 'nmbu_deltid' ? NMBU_COLOR : PALETTE[i % PALETTE.length];
    });
    return map;
  }, [allEntries]);

  const selectedEntries = useMemo(
    () => allEntries.filter((e) => selectedIds.includes(e.id)),
    [allEntries, selectedIds]
  );

  const currentMetric = METRICS.find((m) => m.id === metric)!;

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Chart data: trend over years
  const trendData = useMemo(() => {
    return ANNUAL_YEARS.map((year) => {
      const row: Record<string, number | string> = { year };
      selectedEntries.forEach((e) => {
        const d = e.years[year];
        if (!d) return;
        const v = getVal(d, metric);
        if (v !== null && v > 0) row[e.shortName] = v;
      });
      return row;
    });
  }, [selectedEntries, metric]);

  // Bar data: 2026 only
  const bar2026Data = useMemo(() => {
    return selectedEntries
      .map((e) => {
        const d = e.years['2026'];
        if (!d) return null;
        const v = getVal(d, metric);
        if (v === null) return null;
        return { name: e.shortName, value: v, isNmbu: e.id === 'nmbu_deltid' };
      })
      .filter(Boolean)
      .sort((a, b) => b!.value - a!.value) as { name: string; value: number; isNmbu: boolean }[];
  }, [selectedEntries, metric]);

  // NMBU metrics for summary cards
  const nmbu = allEntries.find((e) => e.id === 'nmbu_deltid');
  const nmbu26 = nmbu?.years['2026'];
  const nmbu25 = nmbu?.years['2025'];
  const nmbuSokerpress26 = nmbu26?.fvS && nmbu26?.plasser ? nmbu26.fvS / nmbu26.plasser : null;
  const nmbuSokerpress25 = nmbu25?.fvS && nmbu25?.plasser ? nmbu25.fvS / nmbu25.plasser : null;

  // Programs with real poenggrense in 2026 (for ranking table)
  const ranked2026 = allEntries
    .map((e) => {
      const d = e.years['2026'];
      return { e, pg: d?.pg_ord ?? null, sokerpress: d?.fvS && d?.plasser ? d.fvS / d.plasser : null };
    })
    .filter((x) => x.pg !== null && x.pg > 0)
    .sort((a, b) => b.pg! - a.pg!);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
          <div style={{ maxWidth: 640 }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8 }}>
              Samordna Opptak · Deltids- og nettbaserte ØKADM-studier · 11 programmer
            </div>
            <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: 22, lineHeight: 1.3 }}>
              Hvor står NMBUs deltidsstudium i konkurransen?
            </div>
            <p style={{ fontSize: 13, opacity: 0.82, marginTop: 10, lineHeight: 1.65 }}>
              Sammenlign <strong style={{ opacity: 1 }}>NMBU Bærekraftig økonomi og ledelse, deltid</strong> (192253)
              mot tilsvarende deltids- og nettbaserte ØKADM-studier. Kilde: Samordna Opptak / HKDIR.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CsvExportButton onExport={exportAarsstudierCsv} label="Last ned CSV" dark />
            <a href="https://hkdir.no/sokertall-fra-samordna-opptak-til-nedlasting"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <ExternalLink className="w-3.5 h-3.5" /> Kilde: SO / HKDIR
            </a>
          </div>
        </div>

        {/* NMBU summary cards */}
        {nmbu26 && (
          <div className="px-6 pb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: 'Alle søkere 2026',
                value: nmbu26.alleS?.toLocaleString('nb-NO') ?? '–',
                sub: nmbu25?.alleS ? `${nmbu25.alleS.toLocaleString('nb-NO')} i 2025` : undefined,
                trend: <TrendChip val={nmbu26.alleS} prev={nmbu25?.alleS ?? null} />,
              },
              {
                label: 'Førstevalgssøkere 2026',
                value: nmbu26.fvS?.toLocaleString('nb-NO') ?? '–',
                sub: nmbu25?.fvS ? `${nmbu25.fvS.toLocaleString('nb-NO')} i 2025` : undefined,
                trend: <TrendChip val={nmbu26.fvS} prev={nmbu25?.fvS ?? null} />,
              },
              {
                label: 'Studieplasser',
                value: nmbu26.plasser?.toLocaleString('nb-NO') ?? '–',
                sub: 'nettbasert / deltid',
              },
              {
                label: 'Søkerpress 2026',
                value: nmbuSokerpress26 !== null ? nmbuSokerpress26.toFixed(2) + 'x' : '–',
                sub: nmbuSokerpress25 !== null ? `${nmbuSokerpress25.toFixed(2)}x i 2025` : undefined,
                trend: <TrendChip val={nmbuSokerpress26} prev={nmbuSokerpress25} />,
              },
            ].map(({ label, value, sub, trend }) => (
              <div key={label} className="rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
                <div className="flex items-center gap-1 mt-1" style={{ fontSize: 10, opacity: 0.75 }}>
                  {trend}
                  {sub && <span>{sub}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main layout: sidebar + chart */}
      <div className="flex gap-4 items-start flex-wrap lg:flex-nowrap">

        {/* Sidebar: picker + metric */}
        <div className="space-y-3 shrink-0" style={{ width: 210 }}>

          {/* Metric selector */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
            <div className="px-3 py-2 text-xs font-semibold" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-green-dark)' }}>
              Metrikk
            </div>
            <div className="p-2 flex flex-col gap-1">
              {METRICS.map((m) => (
                <button key={m.id} onClick={() => setMetric(m.id)}
                  className="text-left px-2.5 py-1.5 rounded-lg text-xs transition-all"
                  title={m.description}
                  style={{
                    backgroundColor: metric === m.id ? 'var(--nmbu-green-dark)' : 'transparent',
                    color: metric === m.id ? '#fff' : 'var(--nmbu-neutral-1)',
                    fontWeight: metric === m.id ? 600 : 400,
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Institution picker */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
            <div className="px-3 py-2 text-xs font-semibold" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-green-dark)' }}>
              Programmer
            </div>
            <div className="p-2 flex flex-col gap-1">
              {allEntries.map((e) => {
                const active = selectedIds.includes(e.id);
                const color = colorMap[e.id];
                const isNmbu = e.id === 'nmbu_deltid';
                return (
                  <button key={e.id} onClick={() => toggle(e.id)}
                    className="flex items-start gap-2 text-left px-2.5 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      backgroundColor: active ? color + '18' : 'transparent',
                      border: `1.5px solid ${active ? color : 'transparent'}`,
                      fontWeight: isNmbu ? 700 : 400,
                    }}
                  >
                    <span className="mt-0.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: active ? color : 'var(--nmbu-neutral-3)' }} />
                    <span style={{ color: active ? 'var(--nmbu-neutral)' : 'var(--nmbu-neutral-2)' }}>
                      {e.shortName}
                      {isNmbu && <span style={{ color: color, fontSize: 9, display: 'block', fontWeight: 600 }}>FOKUS</span>}
                      <span style={{ fontSize: 9, color: 'var(--nmbu-neutral-3)', display: 'block' }}>{e.studiekode}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart area */}
        <div className="flex-1 min-w-0 space-y-3">

          {/* View selector */}
          <div className="flex items-center gap-1 rounded-xl p-1.5" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', width: 'fit-content' }}>
            {([
              { id: 'trend',     label: 'Trend 2021–2026' },
              { id: 'bar2026',   label: 'Sammenligning 2026' },
              { id: 'tabell',    label: 'Datatabell' },
            ] as { id: 'trend' | 'bar2026' | 'tabell'; label: string }[]).map((t) => (
              <button key={t.id} onClick={() => setView(t.id)}
                className="px-4 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  backgroundColor: view === t.id ? 'var(--nmbu-green-dark)' : 'transparent',
                  color: view === t.id ? '#fff' : 'var(--nmbu-neutral-1)',
                  fontWeight: view === t.id ? 600 : 400,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Trend chart */}
          {view === 'trend' && (
            <div className="bg-white rounded-xl p-5" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.06)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-green-dark)', marginBottom: 4 }}>
                {currentMetric.label} — trend 2021–2026
              </div>
              <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginBottom: 16 }}>
                {currentMetric.description}
                {metric === 'pg_ord' && ' · Programmer der alle kom inn (0) er utelatt fra linjegrafen.'}
              </div>
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={trendData} margin={{ top: 10, right: 100, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-neutral-3)" />
                  <XAxis dataKey="year" tick={{ fill: '#4d4d4d', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fill: '#4d4d4d', fontSize: 12 }}
                    tickLine={false} axisLine={false} width={50}
                    tickFormatter={(v) => metric === 'sokerpress' ? v.toFixed(1) + 'x' : v}
                  />
                  <Tooltip
                    formatter={(v: number, name: string) => [fmt(v, currentMetric), name]}
                    contentStyle={{ border: '1px solid var(--nmbu-green-3)', borderRadius: 8, fontSize: 12 }}
                  />
                  {selectedEntries.map((e) => {
                    const color = colorMap[e.id];
                    const isNmbu = e.id === 'nmbu_deltid';
                    const lastIdx = trendData.length - 1;
                    return (
                      <Line key={e.id} type="monotone" dataKey={e.shortName}
                        stroke={color} strokeWidth={isNmbu ? 3.5 : 2}
                        strokeDasharray={isNmbu ? undefined : undefined}
                        dot={{ r: isNmbu ? 6 : 4, strokeWidth: 2, fill: '#fff', stroke: color }}
                        activeDot={{ r: isNmbu ? 8 : 6 }}
                        connectNulls
                        label={(props: { x?: number; y?: number; index?: number; value?: number }) => {
                          const k = `lbl-${e.id}-${props.index ?? 0}`;
                          if (props.index !== lastIdx || props.value == null || props.value === 0) return <g key={k} />;
                          return (
                            <text key={k} x={(props.x ?? 0) + 10} y={(props.y ?? 0) + 4}
                              fontSize={isNmbu ? 13 : 11} fontWeight={isNmbu ? 800 : 600}
                              fill={color} textAnchor="start">
                              {e.shortName}
                            </text>
                          );
                        }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bar chart: 2026 */}
          {view === 'bar2026' && (
            <div className="bg-white rounded-xl p-5" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.06)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-green-dark)', marginBottom: 4 }}>
                {currentMetric.label} — sammenligning 2026
              </div>
              <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginBottom: 16 }}>
                Kun programmer med tilgjengelige 2026-tall. Sortert synkende.
              </div>
              {bar2026Data.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-sm" style={{ color: 'var(--nmbu-neutral-2)' }}>
                  Ingen data tilgjengelig for valgt metrikk i 2026.
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={Math.max(260, bar2026Data.length * 44)}>
                    <BarChart data={bar2026Data} layout="vertical" margin={{ left: 100, right: 60, top: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-neutral-3)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#4d4d4d', fontSize: 11 }} tickLine={false} axisLine={false}
                        tickFormatter={(v) => metric === 'sokerpress' ? v.toFixed(1) + 'x' : String(v)} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#4d4d4d', fontSize: 12 }} tickLine={false} axisLine={false} width={95} />
                      <Tooltip formatter={(v: number) => [fmt(v, currentMetric), currentMetric.label]}
                        contentStyle={{ border: '1px solid var(--nmbu-green-3)', borderRadius: 8, fontSize: 12 }} />
                      {/* NMBU reference line */}
                      {(() => {
                        const nmbuBar = bar2026Data.find((d) => d.isNmbu);
                        return nmbuBar ? (
                          <ReferenceLine x={nmbuBar.value} stroke={NMBU_COLOR}
                            strokeDasharray="4 3" strokeWidth={1.5}
                            label={{ value: 'NMBU', position: 'top', fill: NMBU_COLOR, fontSize: 10 }} />
                        ) : null;
                      })()}
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{
                        position: 'right', formatter: (v: number) => fmt(v, currentMetric),
                        style: { fontSize: 11, fill: '#4d4d4d', fontWeight: 500 },
                      }}>
                        {bar2026Data.map((d) => {
                          const entry = allEntries.find((e) => e.shortName === d.name);
                          return (
                            <Cell key={d.name}
                              fill={entry ? colorMap[entry.id] : '#aaa'}
                              opacity={d.isNmbu ? 1 : 0.75}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          )}

          {/* Data table */}
          {view === 'tabell' && (
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.06)' }}>
              <div className="px-5 py-3 text-sm font-semibold" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-green-dark)' }}>
                Datatabell — alle programmer og år
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                      <th className="px-3 py-2.5 text-left sticky left-0 z-10" style={{ backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral)', fontWeight: 600, minWidth: 140 }}>Program</th>
                      <th className="px-3 py-2.5 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Sted</th>
                      <th className="px-3 py-2.5 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Kode</th>
                      {ANNUAL_YEARS.map((y) => (
                        <th key={y} className="px-3 py-2.5 text-center" style={{ color: y === '2026' ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', fontWeight: y === '2026' ? 700 : 600 }}>
                          {y}
                        </th>
                      ))}
                      <th className="px-3 py-2.5 text-center" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allEntries.map((e) => {
                      const color = colorMap[e.id];
                      const isNmbu = e.id === 'nmbu_deltid';
                      const vals = ANNUAL_YEARS.map((y) => {
                        const d = e.years[y];
                        return d ? getVal(d, metric) : null;
                      });
                      const last = vals[vals.length - 1];
                      const prev = vals[vals.length - 2];
                      return (
                        <tr key={e.id}
                          style={{
                            borderBottom: '1px solid var(--nmbu-neutral-3)',
                            backgroundColor: isNmbu ? `${NMBU_COLOR}08` : undefined,
                          }}
                        >
                          <td className="px-3 py-2.5 sticky left-0 z-10"
                            style={{ backgroundColor: isNmbu ? `${NMBU_COLOR}08` : '#fff', fontWeight: isNmbu ? 700 : 500, color: color }}>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                              {e.shortName}
                              {isNmbu && <span className="px-1 rounded text-[9px]" style={{ backgroundColor: NMBU_COLOR, color: '#fff' }}>FOKUS</span>}
                            </div>
                          </td>
                          <td className="px-3 py-2.5" style={{ color: 'var(--nmbu-neutral-2)' }}>{e.studiested}</td>
                          <td className="px-3 py-2.5" style={{ color: 'var(--nmbu-neutral-2)' }}>{e.studiekode}</td>
                          {vals.map((v, i) => (
                            <td key={i} className="px-3 py-2.5 text-center"
                              style={{
                                color: v === null ? 'var(--nmbu-neutral-3)' : v === 0 ? 'var(--nmbu-green-6)' : 'var(--nmbu-neutral)',
                                fontWeight: ANNUAL_YEARS[i] === '2026' ? 700 : 400,
                                backgroundColor: ANNUAL_YEARS[i] === '2026' ? `${color}08` : undefined,
                              }}>
                              {v === null ? '–' : v === 0 && metric === 'pg_ord' ? <span className="text-[9px] px-1 rounded" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-6)' }}>Alle inn</span> : fmt(v, currentMetric)}
                            </td>
                          ))}
                          <td className="px-3 py-2.5 text-center">
                            <TrendChip val={last} prev={prev} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Competitive ranking 2026 */}
      {ranked2026.length > 0 && (
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-green-dark)', marginBottom: 4 }}>
            Mest konkurranseutsatte programmer 2026
          </div>
          <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginBottom: 14 }}>
            Programmer med poenggrense over 0 i ordinær kvote (ekskl. "alle inn").
          </div>
          <div className="flex flex-wrap gap-3">
            {ranked2026.map(({ e, pg, sokerpress }, rank) => (
              <div key={e.id} className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ border: `1.5px solid ${colorMap[e.id]}`, backgroundColor: colorMap[e.id] + '10', minWidth: 160 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: colorMap[e.id], lineHeight: 1, minWidth: 24 }}>
                  #{rank + 1}
                </span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: colorMap[e.id] }}>{e.shortName}</div>
                  <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>
                    pg_ord: <strong>{pg?.toFixed(1)}</strong>
                    {sokerpress !== null && <> · søkerpress: <strong>{sokerpress.toFixed(1)}x</strong></>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 mt-4 text-xs rounded-lg px-3 py-2.5"
            style={{ backgroundColor: `${NMBU_COLOR}10`, border: `1px solid ${NMBU_COLOR}40`, color: 'var(--nmbu-neutral-1)' }}>
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: NMBU_COLOR }} />
            <span>
              <strong>NMBU Bærekraftig økonomi og ledelse (192253)</strong> er ikke i rangeringen siden alle kvalifiserte
              kom inn (pg_ord = 0). Med 950 plasser og 2&thinsp;899 kvalifiserte søkere i 2026 er det åpent opptak,
              men søkerpresset (1,04x) reflekterer at kapasiteten er svært høy relativt til førstevalgssøkere.
            </span>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-2.5"
          style={{ color: '#8a6200', backgroundColor: '#fef4e0', border: '1px solid #d4b47a' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#c2963a' }} />
          <span>
            <strong>Merk:</strong> Søkertall er per april 2026, før tilbud gis. Poenggrenser 2026 er offisielle tall fra Samordna Opptak (23. juli 2026).
            Poenggrense = 0 betyr at alle kvalifiserte søkere kom inn.
            NMBU økte kapasiteten fra 200 plasser (2023) til 950 plasser (2024–2026) i dette nettbaserte studiet.
          </span>
        </div>
        <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-2.5"
          style={{ color: 'var(--nmbu-neutral-1)', backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--nmbu-neutral-2)' }} />
          <span>
            Programmene i denne oversikten er deltids- og nettbaserte studier innen ØKADM.
            UiT Ledelse, INN Organisasjon og ledelse, NTNU Gjøvik, Nord HR og INN Offentlig styring
            har reell poenggrense og er direkte sammenlignbare med NMBUs studium.
          </span>
        </div>
      </div>
    </div>
  );
}
