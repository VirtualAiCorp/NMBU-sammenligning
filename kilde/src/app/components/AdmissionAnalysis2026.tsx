import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Info, ExternalLink, Filter } from 'lucide-react';
import {
  FULL_ADMISSION_DATA,
  ALL_YEARS,
  DEFAULT_IDS,
  type FullAdmissionEntry,
  type FullYearData,
} from '../data/fullAdmissionData';
import { SamfunnsokonomAnalysis } from './SamfunnsokonomAnalysis';
import { AarsstudierAnalysis } from './AarsstudierAnalysis';
import { CsvExportButton } from './CsvExportButton';
import { exportOaCsv } from '../utils/csvExport';
import { DBH_SOKERPOENG } from '../data/dbhSokerpoeng';

type AnalysisTab = 'oa' | 'samf' | 'arsstudier';

// ─── Metric definitions ──────────────────────────────────────────────────────

type MetricKey = 'alleS' | 'fvS' | 'sokerpress' | 'plasser' | 'kvinner' | 'kvalifiserte' | 'pg_ord' | 'pg_fv' | 'pg_snitt';

interface MetricDef {
  id: MetricKey;
  label: string;
  unit: string;
  decimals: number;
  description: string;
  higherIsBetter: boolean | null;
}

const METRICS: MetricDef[] = [
  { id: 'alleS',      label: 'Alle søkere',           unit: '',  decimals: 0, description: 'Totalt antall søkere', higherIsBetter: null },
  { id: 'fvS',        label: 'Førstevalgssøkere',     unit: '',  decimals: 0, description: 'Søkere med studiet som 1. valg', higherIsBetter: null },
  { id: 'sokerpress', label: 'Søkerpress',             unit: 'x', decimals: 1, description: 'Førstevalgssøkere per studieplass', higherIsBetter: null },
  { id: 'plasser',    label: 'Studieplasser',          unit: '',  decimals: 0, description: 'Antall studieplasser', higherIsBetter: null },
  { id: 'kvinner',    label: 'Kvinner %',              unit: '%', decimals: 1, description: 'Andel kvinner blant 1. valg-søkere', higherIsBetter: null },
  { id: 'kvalifiserte', label: 'Kvalifiserte',         unit: '',  decimals: 0, description: 'Antall kvalifiserte søkere', higherIsBetter: null },
  { id: 'pg_ord',     label: 'Poenggrense (ord.)',     unit: '',  decimals: 1, description: 'Opptaksgrense ordinær kvote', higherIsBetter: true },
  { id: 'pg_fv',      label: 'Poenggrense (fv.)',      unit: '',  decimals: 1, description: 'Opptaksgrense førstegangsvitnemål', higherIsBetter: true },
  { id: 'pg_snitt',   label: 'Snitt poenggrense',      unit: '',  decimals: 1, description: 'Gjennomsnitt av ordinær og førstegangsvitnemål poenggrense', higherIsBetter: true },
];

function getMetricValue(data: FullYearData, metric: MetricKey): number | null {
  if (metric === 'sokerpress') {
    if (data.fvS === null || data.plasser === null || data.plasser === 0) return null;
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

// ─── Colors ──────────────────────────────────────────────────────────────────

const PALETTE = [
  '#025c4f', '#e05c2a', '#3a7fc1', '#c2963a',
  '#7b3fa0', '#c13a5a', '#1a8c6b', '#4e7fc4',
  '#6b8c2a', '#c17a3a', '#1a6b8a', '#a04f2a',
  '#5a3aa0', '#2ea87e', '#c16a3a', '#3a5ac1',
];

function colorFor(entry: FullAdmissionEntry, allEntries: FullAdmissionEntry[]): string {
  const idx = allEntries.findIndex((e) => e.id === entry.id);
  return PALETTE[idx % PALETTE.length];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function formatVal(v: number | null, m: MetricDef): string {
  if (v === null) return '–';
  return v.toFixed(m.decimals) + (m.unit ? ' ' + m.unit : '');
}

// ─── Institution picker ───────────────────────────────────────────────────────

type TypeFilter = 'bachelor' | 'sivilokonom';

const BACHELOR_IDS_OA = DEFAULT_IDS.filter((id) =>
  FULL_ADMISSION_DATA.find((e) => e.id === id)?.type === 'bachelor'
);
const SIV_IDS_OA = DEFAULT_IDS.filter((id) =>
  FULL_ADMISSION_DATA.find((e) => e.id === id)?.type === 'sivilokonom'
);

// IDs that belong to a group and are NOT shown as standalone chips
const HVL_CAMPUS_IDS  = ['hvl_bergen', 'hvl_haugesund', 'hvl_sogndal'];
const USN_CAMPUS_IDS  = ['usn', 'usn_honefoss', 'usn_bo', 'usn_kongsberg'];
const UIT_CAMPUS_IDS  = ['uit', 'uit_alta', 'uit_harstad'];
const NTNU_CAMPUS_IDS = ['ntnu', 'ntnu_alesund', 'ntnu_gjovik'];
const INN_CAMPUS_IDS  = ['inn', 'inn_rena'];
const NORD_CAMPUS_IDS = ['nord', 'nord_steinkjer'];
const NLA_CAMPUS_IDS  = ['nla_oslo', 'nla_bergen', 'nla_krs'];

const GROUP_ONLY_IDS = new Set([
  ...HVL_CAMPUS_IDS, ...USN_CAMPUS_IDS, ...UIT_CAMPUS_IDS,
  ...NTNU_CAMPUS_IDS, ...INN_CAMPUS_IDS, ...NORD_CAMPUS_IDS, ...NLA_CAMPUS_IDS,
  'hvl_combined', 'usn_combined', // composite entries hidden from picker
]);

type GroupDef = { label: string; ids: string[] };
const INSTITUTION_GROUPS: GroupDef[] = [
  { label: 'NTNU',  ids: NTNU_CAMPUS_IDS },
  { label: 'HVL',   ids: HVL_CAMPUS_IDS  },
  { label: 'USN',   ids: USN_CAMPUS_IDS  },
  { label: 'UiT',   ids: UIT_CAMPUS_IDS  },
  { label: 'INN',   ids: INN_CAMPUS_IDS  },
  { label: 'Nord',  ids: NORD_CAMPUS_IDS },
  { label: 'NLA',   ids: NLA_CAMPUS_IDS  },
];

const INITIAL_COMPARISON_IDS = ['nmbu', 'uis', 'uia', 'oslomet', 'hiof', 'usn'];

function GroupCard({
  group, entries, selected, onChange, colors,
}: {
  group: GroupDef;
  entries: FullAdmissionEntry[];
  selected: string[];
  onChange: (ids: string[]) => void;
  colors: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const campuses = group.ids.map((id) => entries.find((e) => e.id === id)).filter(Boolean) as FullAdmissionEntry[];
  const selectedInGroup = group.ids.filter((id) => selected.includes(id));
  const allSelected = selectedInGroup.length === group.ids.length;
  const noneSelected = selectedInGroup.length === 0;
  const accentColor = campuses[0] ? colors[campuses[0].id] : 'var(--nmbu-green-dark)';

  const toggleAll = () => {
    if (allSelected) onChange(selected.filter((id) => !group.ids.includes(id)));
    else onChange([...selected.filter((id) => !group.ids.includes(id)), ...group.ids]);
  };

  const toggleCampus = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1.5px solid ${noneSelected ? 'var(--nmbu-neutral-3)' : accentColor}`, minWidth: 130 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs transition-all"
        style={{
          backgroundColor: noneSelected ? 'var(--nmbu-beige-light)' : accentColor + '22',
          color: noneSelected ? 'var(--nmbu-neutral-1)' : 'var(--nmbu-neutral)',
          fontWeight: selectedInGroup.length > 0 ? 600 : 400,
        }}
      >
        <span className="flex items-center gap-1.5">
          {group.label}
          {selectedInGroup.length > 0 && (
            <span className="rounded-full px-1.5" style={{ fontSize: 9, backgroundColor: accentColor, color: '#fff', lineHeight: 1.6 }}>
              {selectedInGroup.length}
            </span>
          )}
        </span>
        <span style={{ fontSize: 9, color: 'var(--nmbu-neutral-2)' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-2 py-2 flex flex-wrap gap-1.5" style={{ borderTop: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
          <button
            onClick={toggleAll}
            className="px-2 py-1 rounded-full text-xs transition-all"
            style={{
              backgroundColor: allSelected ? accentColor : 'transparent',
              color: allSelected ? '#fff' : accentColor,
              border: `1px solid ${accentColor}`,
              fontWeight: 600,
            }}
          >
            {allSelected ? 'Fjern alle' : 'Velg alle'}
          </button>
          {campuses.map((e) => {
            const active = selected.includes(e.id);
            const label = e.studiested;
            return (
              <button key={e.id} onClick={() => toggleCampus(e.id)}
                className="px-2 py-1 rounded-full text-xs transition-all"
                style={{
                  backgroundColor: active ? accentColor : 'var(--nmbu-beige-light)',
                  color: active ? '#fff' : 'var(--nmbu-neutral-1)',
                  border: `1px solid ${active ? accentColor : 'var(--nmbu-neutral-3)'}`,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InstitutionPicker({
  entries, selected, onChange, colors,
}: {
  entries: FullAdmissionEntry[];
  selected: string[];
  onChange: (ids: string[]) => void;
  colors: Record<string, string>;
}) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('bachelor');

  const switchType = (t: TypeFilter) => {
    setTypeFilter(t);
    onChange(t === 'bachelor' ? BACHELOR_IDS_OA : SIV_IDS_OA);
  };

  // Entries shown as normal chips (not part of any group, not hidden composites)
  const filtered = entries.filter((e) => e.type === typeFilter && !GROUP_ONLY_IDS.has(e.id));

  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };

  const filteredIds = filtered.map((e) => e.id);
  const allGroupIds = [
    ...NTNU_CAMPUS_IDS, ...HVL_CAMPUS_IDS, ...USN_CAMPUS_IDS, ...UIT_CAMPUS_IDS,
    ...INN_CAMPUS_IDS, ...NORD_CAMPUS_IDS, ...NLA_CAMPUS_IDS,
  ];

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
      <div className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)' }}>
        <div className="flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>
          <Filter className="w-3.5 h-3.5" /> Velg institusjoner
        </div>
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
          {(['bachelor', 'sivilokonom'] as TypeFilter[]).map((t, i) => (
            <button key={t} onClick={() => switchType(t)}
              className="px-2.5 py-1 text-xs transition-all"
              style={{
                backgroundColor: typeFilter === t ? 'var(--nmbu-green-dark)' : '#fff',
                color: typeFilter === t ? '#fff' : 'var(--nmbu-neutral-1)',
                borderRight: i === 0 ? '1px solid var(--nmbu-neutral-3)' : 'none',
              }}
            >
              {t === 'bachelor' ? 'Bachelor' : 'Siviløkonom 5-årig'}
            </button>
          ))}
        </div>
      </div>
      <div className="p-3 flex flex-wrap gap-1.5 items-start">
        {/* Group cards — only visible for bachelor */}
        {typeFilter === 'bachelor' && INSTITUTION_GROUPS.map((group) => (
          <GroupCard key={group.label} group={group} entries={entries} selected={selected} onChange={onChange} colors={colors} />
        ))}
        {/* Individual institution chips */}
        {filtered.map((e) => {
          const active = selected.includes(e.id);
          return (
            <button key={e.id} onClick={() => toggle(e.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs transition-all"
              style={{
                backgroundColor: active ? colors[e.id] : 'var(--nmbu-beige-light)',
                color: active ? '#fff' : 'var(--nmbu-neutral-1)',
                border: `1.5px solid ${active ? colors[e.id] : 'var(--nmbu-neutral-3)'}`,
                fontWeight: active ? 600 : 400,
              }}
            >
              {e.shortName}
            </button>
          );
        })}
      </div>
      <div className="px-3 pb-2 flex gap-2">
        <button onClick={() => onChange([...filteredIds, ...allGroupIds.filter(id => entries.find(e => e.id === id)?.type === typeFilter)])} className="text-xs hover:underline" style={{ color: 'var(--nmbu-green)' }}>Velg alle</button>
        <button onClick={() => onChange([])} className="text-xs hover:underline" style={{ color: 'var(--nmbu-neutral-2)' }}>Fjern alle</button>
        <button onClick={() => onChange(typeFilter === 'bachelor' ? BACHELOR_IDS_OA : SIV_IDS_OA)} className="text-xs hover:underline" style={{ color: 'var(--nmbu-neutral-2)' }}>Tilbakestill</button>
      </div>
    </div>
  );
}

// ─── Trend chart ─────────────────────────────────────────────────────────────

function TrendChart({
  selectedEntries, metric, colors,
}: {
  selectedEntries: FullAdmissionEntry[];
  metric: MetricDef;
  colors: Record<string, string>;
}) {
  const data = ALL_YEARS.map((year) => {
    const row: Record<string, number | string> = { year };
    selectedEntries.forEach((e) => {
      const yr = e.years[year];
      if (!yr) return;
      const v = getMetricValue(yr, metric.id);
      if (v !== null) row[e.id] = v;
    });
    return row;
  });

  const lastYearIdx = ALL_YEARS.length - 1;

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={data} margin={{ top: 16, right: 100, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-neutral-3)" />
        <XAxis dataKey="year" tick={{ fill: '#555', fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis
          domain={['auto', 'auto']}
          tick={{ fill: '#555', fontSize: 11 }}
          tickLine={false} axisLine={false}
          width={44}
          tickFormatter={(v) => metric.unit === '%' ? `${v}%` : metric.unit === 'x' ? `${v}x` : String(v)}
        />
        <Tooltip
          formatter={(v: number, key: string) => {
            const e = selectedEntries.find((x) => x.id === key);
            return [`${v.toFixed(metric.decimals)}${metric.unit ? ' ' + metric.unit : ''}`, e?.shortName ?? key];
          }}
          contentStyle={{ border: '1px solid var(--nmbu-green-3)', borderRadius: 8, fontSize: 12 }}
        />
        <ReferenceLine x="2026" stroke="var(--nmbu-green-dark)" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: '2026', fill: 'var(--nmbu-green-dark)', fontSize: 10, position: 'top' }} />
        {selectedEntries.map((e, i) => {
          const col = colors[e.id];
          return (
            <Line key={e.id} type="monotone" dataKey={e.id}
              stroke={col} strokeWidth={2.5} connectNulls
              dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: col }}
              activeDot={{ r: 6 }}
              label={(props: { x?: number; y?: number; index?: number; value?: number }) => {
                const k = `lbl-${e.id}-${props.index ?? 0}`;
                if (props.index !== lastYearIdx || props.value == null) return <g key={k} />;
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

// ─── Bar comparison 2026 ──────────────────────────────────────────────────────

function BarComparison({
  selectedEntries, metric, colors,
}: {
  selectedEntries: FullAdmissionEntry[];
  metric: MetricDef;
  colors: Record<string, string>;
}) {
  const data = selectedEntries
    .map((e) => {
      const yr = e.years['2026'];
      if (!yr) return null;
      const v = getMetricValue(yr, metric.id);
      if (v === null) return null;
      return { id: e.id, name: e.shortName, value: v };
    })
    .filter(Boolean)
    .sort((a, b) => (b!.value) - (a!.value)) as { id: string; name: string; value: number }[];

  if (data.length === 0) return <p className="text-sm text-center py-8" style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen data å vise.</p>;

  const avg = data.reduce((s, d) => s + d.value, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 80, bottom: 4, left: 90 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-neutral-3)" horizontal={false} />
        <XAxis type="number" domain={['auto', 'auto']} tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false}
          tickFormatter={(v) => metric.unit === '%' ? `${v}%` : metric.unit === 'x' ? `${v}x` : String(v)} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#333', fontSize: 11 }} tickLine={false} axisLine={false} width={88} />
        <Tooltip
          formatter={(v: number) => [`${v.toFixed(metric.decimals)}${metric.unit ? ' ' + metric.unit : ''}`, metric.label]}
          contentStyle={{ border: '1px solid var(--nmbu-green-3)', borderRadius: 8, fontSize: 12 }}
        />
        <ReferenceLine x={avg} stroke="#888" strokeDasharray="4 3"
          label={{ value: `Snitt ${avg.toFixed(metric.decimals)}`, position: 'top', fontSize: 10, fill: '#888' }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((d) => (
            <Cell key={d.id} fill={colors[d.id] ?? '#025c4f'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Data table ───────────────────────────────────────────────────────────────

function DataTable({ selectedEntries, colors }: { selectedEntries: FullAdmissionEntry[]; colors: Record<string, string> }) {
  const [sortKey, setSortKey] = useState<MetricKey>('pg_ord');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const rows = selectedEntries
    .map((e) => {
      const y26 = e.years['2026'];
      const y25 = e.years['2025'];
      return { e, y26, y25 };
    })
    .filter((r) => r.y26)
    .sort((a, b) => {
      const getSortVal = (r: typeof a) => {
        if (sortKey === 'sokerpress' && r.e.stipulatedSokerpress !== undefined) return r.e.stipulatedSokerpress;
        return r.y26 ? getMetricValue(r.y26, sortKey) : null;
      };
      const av = getSortVal(a);
      const bv = getSortVal(b);
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      return sortAsc ? av - bv : bv - av;
    });

  const toggleSort = (key: MetricKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
            <th className="px-3 py-2.5 text-left" style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>Institusjon</th>
            {METRICS.map((m) => (
              <th key={m.id}
                className="px-3 py-2.5 text-center cursor-pointer select-none hover:opacity-70 transition-opacity whitespace-nowrap"
                style={{ color: sortKey === m.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', fontWeight: 600 }}
                onClick={() => toggleSort(m.id)}
                title={m.description}
              >
                {m.label} {sortKey === m.id ? (sortAsc ? '↑' : '↓') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ e, y26, y25 }, i) => {
            const isComposite = !!e.campuses?.length;
            const isExpanded = expandedIds.has(e.id);
            const rowBg = i % 2 === 0 ? '#fff' : 'var(--nmbu-beige-light)';

            return (
              <tr key={e.id}
                style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: rowBg, verticalAlign: 'top' }}
              >
                <td className="px-3 py-2.5" style={{ minWidth: 160 }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[e.id] }} />
                    <span style={{ fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>{e.shortName}</span>
                    {isComposite && (
                      <button
                        onClick={() => toggleExpand(e.id)}
                        title={isExpanded ? 'Skjul studiesteder' : 'Vis studiesteder'}
                        style={{
                          fontSize: 10, lineHeight: 1, padding: '1px 4px', borderRadius: 4,
                          border: '1px solid var(--nmbu-neutral-3)', background: 'transparent',
                          color: 'var(--nmbu-green-dark)', cursor: 'pointer', flexShrink: 0,
                        }}
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    )}
                  </div>
                  {isComposite && (
                    <div style={{ fontSize: 10, color: '#8b6f00', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span>ⓘ</span>
                      <span>Stipulert institusjonssnitt</span>
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginTop: 1 }}>{e.studiekode}</div>
                  {isComposite && isExpanded && (
                    <div style={{ marginTop: 8, borderTop: '1px dashed var(--nmbu-neutral-3)', paddingTop: 6 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--nmbu-neutral-2)', marginBottom: 4 }}>
                        Opptakstall per studiested (2026)
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                        <thead>
                          <tr style={{ color: 'var(--nmbu-neutral-2)' }}>
                            <th style={{ textAlign: 'left', paddingBottom: 2, fontWeight: 600 }}>Sted</th>
                            <th style={{ textAlign: 'right', paddingBottom: 2, fontWeight: 600 }}>Søkere</th>
                            <th style={{ textAlign: 'right', paddingBottom: 2, fontWeight: 600 }}>1.valg</th>
                            <th style={{ textAlign: 'right', paddingBottom: 2, fontWeight: 600 }}>Plasser</th>
                            <th style={{ textAlign: 'right', paddingBottom: 2, fontWeight: 600 }}>Søkerpr.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {e.campuses!.map((c) => {
                            const sp = c.fvS !== null && c.plasser !== null && c.plasser > 0
                              ? (c.fvS / c.plasser).toFixed(1)
                              : null;
                            return (
                              <tr key={c.name}>
                                <td style={{ paddingRight: 8, paddingTop: 2, fontWeight: 600, color: 'var(--nmbu-neutral)' }}>{c.name}</td>
                                <td style={{ textAlign: 'right', paddingTop: 2, color: 'var(--nmbu-neutral)' }}>
                                  {c.alleS !== null ? c.alleS : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                                </td>
                                <td style={{ textAlign: 'right', paddingTop: 2, color: 'var(--nmbu-neutral)' }}>
                                  {c.fvS !== null ? c.fvS : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                                </td>
                                <td style={{ textAlign: 'right', paddingTop: 2, color: 'var(--nmbu-neutral)' }}>
                                  {c.plasser !== null ? c.plasser : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                                </td>
                                <td style={{ textAlign: 'right', paddingTop: 2, color: 'var(--nmbu-neutral)' }}>
                                  {sp !== null ? sp : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </td>
                {METRICS.map((m) => {
                  let v = y26 ? getMetricValue(y26, m.id) : null;
                  if (m.id === 'sokerpress' && e.stipulatedSokerpress !== undefined) v = e.stipulatedSokerpress;
                  const vPrev = y25 ? getMetricValue(y25, m.id) : null;
                  const isAlleInn = v === 0 && (m.id === 'pg_ord' || m.id === 'pg_fv' || m.id === 'pg_snitt');
                  return (
                    <td key={m.id} className="px-3 py-2.5 text-center">
                      <div style={{ fontWeight: 600, color: v === null ? 'var(--nmbu-neutral-3)' : isAlleInn ? 'var(--nmbu-green-6)' : 'var(--nmbu-neutral)' }}>
                        {v === null ? '–' : isAlleInn ? 'Alle inn' : `${v.toFixed(m.decimals)}${m.unit ? ' ' + m.unit : ''}`}
                      </div>
                      {isComposite && m.id === 'sokerpress' && (
                        <div style={{ fontSize: 9, color: '#8b6f00', marginTop: 1 }}>stipulert</div>
                      )}
                      {v !== null && v !== 0 && !isAlleInn && (
                        <div className="mt-0.5"><TrendChip val={v} prev={vPrev} /></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type ChartTab = 'trend' | 'sammenligning2026' | 'tabell';

export function AdmissionAnalysis2026({ initialTab = 'oa' }: { initialTab?: AnalysisTab }) {
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>(initialTab);
  const [selectedIds, setSelectedIds] = useState<string[]>(INITIAL_COMPARISON_IDS);
  const [metric, setMetric] = useState<MetricKey>('fvS');
  const [chartTab, setChartTab] = useState<ChartTab>('trend');

  const allEntries = FULL_ADMISSION_DATA;

  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    allEntries.forEach((e, i) => { map[e.id] = PALETTE[i % PALETTE.length]; });
    return map;
  }, [allEntries]);

  const selectedEntries = useMemo(
    () => allEntries.filter((e) => selectedIds.includes(e.id)),
    [allEntries, selectedIds]
  );

  const currentMetric = METRICS.find((m) => m.id === metric)!;

  // Quick stats for 2026
  const stats2026 = useMemo(() => {
    const withPg = allEntries
      .map((e) => ({ e, pg: e.years['2026']?.pg_ord ?? null }))
      .filter((x) => x.pg !== null && x.pg! > 0);
    const totalApplicants = allEntries.reduce((s, e) => s + (e.years['2026']?.alleS ?? 0), 0);
    const highest = withPg.reduce((best, x) => (x.pg! > (best?.pg ?? 0) ? x : best), withPg[0]);
    const lowest = withPg.reduce((best, x) => (x.pg! < (best?.pg ?? Infinity) ? x : best), withPg[0]);

    // NMBU-specific metrics
    const nmbu = allEntries.find((e) => e.id === 'nmbu');
    const nmbu26 = nmbu?.years['2026'];
    const nmbu25 = nmbu?.years['2025'];
    const nmbuSokerpress = nmbu26?.fvS && nmbu26?.plasser ? nmbu26.fvS / nmbu26.plasser : null;
    const nmbuSokerpress25 = nmbu25?.fvS && nmbu25?.plasser ? nmbu25.fvS / nmbu25.plasser : null;

    // NMBU pg_ord rank among bachelor programs
    const bachelors = withPg.filter((x) => x.e.type === 'bachelor');
    const sorted = [...bachelors].sort((a, b) => b.pg! - a.pg!);
    const nmbuRank = sorted.findIndex((x) => x.e.id === 'nmbu') + 1;

    return {
      totalApplicants, highest, lowest,
      nmbu26, nmbu25, nmbuSokerpress, nmbuSokerpress25,
      nmbuRank, totalBachelors: sorted.length,
    };
  }, [allEntries]);

  const chartTabs: { id: ChartTab; label: string }[] = [
    { id: 'trend',          label: 'Trend 2020–2026' },
    { id: 'sammenligning2026', label: 'Sammenligning 2026' },
    { id: 'tabell',         label: 'Datatabell' },
  ];

  return (
    <div className="space-y-5">

      {/* Sub-tab selector */}
      <div className="flex items-center gap-1 rounded-xl p-1.5" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', width: 'fit-content' }}>
        {([
          { id: 'oa',         label: 'Økonomi og administrasjon' },
          { id: 'samf',       label: 'Samfunnsøkonomi' },
          { id: 'arsstudier', label: 'Årsstudier' },
        ] as { id: AnalysisTab; label: string }[]).map((t) => (
          <button key={t.id} onClick={() => setAnalysisTab(t.id)}
            className="px-5 py-2 rounded-lg text-sm transition-all"
            style={{
              backgroundColor: analysisTab === t.id ? 'var(--nmbu-green-dark)' : 'transparent',
              color: analysisTab === t.id ? '#fff' : 'var(--nmbu-neutral-1)',
              fontWeight: analysisTab === t.id ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Samfunnsøkonomi tab */}
      {analysisTab === 'samf' && <SamfunnsokonomAnalysis />}

      {/* Årsstudier tab */}
      {analysisTab === 'arsstudier' && <AarsstudierAnalysis />}

      {/* ØA tab content */}
      {analysisTab === 'oa' && <>

      {/* Header */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>

        {/* Title + description */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
          <div style={{ maxWidth: 620 }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8 }}>
              Samordna Opptak · Økonomi og administrasjon · 20+ institusjoner
            </div>
            <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: 22, lineHeight: 1.3 }}>
              Hvor står NMBU i konkurransen om ØA-søkerne?
            </div>
            <p style={{ fontSize: 13, opacity: 0.82, marginTop: 10, lineHeight: 1.65 }}>
              Sammenlign <strong style={{ opacity: 1 }}>NMBUs søkertall, søkerpress og poenggrenser</strong> mot alle
              andre universiteter og høyskoler med ØA-bachelor eller siviløkonomprogrammet — fra 2020 til 2026.
              Velg institusjoner og metrikker i filteret til venstre, og bytt mellom trendsvisning,
              direkte sammenligning for 2026 og datatabell.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CsvExportButton onExport={exportOaCsv} label="Last ned CSV" dark />
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
              NMBU Økonomi og administrasjon (192 369) · Nøkkeltall 2026
            </span>
          </div>
          <div className="flex gap-8 flex-wrap">
            {((): { label: string; value: string; sub?: string; delta?: string | null }[] => {
              const n26 = stats2026.nmbu26;
              const n25 = stats2026.nmbu25;
              const sp = stats2026.nmbuSokerpress;
              const sp25 = stats2026.nmbuSokerpress25;
              const fmt = (d: number, dec = 0) => (d >= 0 ? '+' : '') + (dec ? d.toFixed(dec) : Math.round(d));
              return [
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
                  value: sp != null ? `${sp.toFixed(2)}×` : '–',
                  delta: sp != null && sp25 != null ? `${fmt(sp - sp25, 2)}× vs. 2025` : null,
                },
                {
                  label: 'Poenggrense (fv. / ord.)',
                  value: n26?.pg_fv != null && n26?.pg_ord != null
                    ? `${n26.pg_fv.toFixed(1)} / ${n26.pg_ord.toFixed(1)}` : '–',
                },
                {
                  label: 'Rang blant bachelor',
                  value: stats2026.nmbuRank > 0 ? `#${stats2026.nmbuRank} av ${stats2026.totalBachelors}` : '–',
                  sub: 'ordinær poenggrense',
                },
              ];
            })().map((s) => (
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

      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 3fr' }}>

        {/* Institution picker */}
        <div>
          <InstitutionPicker
            entries={allEntries}
            selected={selectedIds}
            onChange={setSelectedIds}
            colors={colorMap}
          />
        </div>

        {/* Chart panel */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
          {/* Chart header */}
          <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
            {/* Metric tabs */}
            <div className="flex flex-wrap gap-1.5">
              {METRICS.map((m) => (
                <button key={m.id} onClick={() => setMetric(m.id)}
                  className="px-3 py-1 rounded-full text-xs transition-all"
                  title={m.description}
                  style={{
                    backgroundColor: metric === m.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)',
                    color: metric === m.id ? '#fff' : 'var(--nmbu-neutral-1)',
                    fontWeight: metric === m.id ? 600 : 400,
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Chart type tabs */}
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
              {chartTabs.map((t, i) => (
                <button key={t.id} onClick={() => setChartTab(t.id)}
                  className="px-3 py-1.5 text-xs transition-all"
                  style={{
                    backgroundColor: chartTab === t.id ? 'var(--nmbu-green-dark)' : '#fff',
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
                Velg minst én institusjon i filteret til venstre.
              </div>
            ) : (
              <>
                {chartTab === 'trend' && (
                  <>
                    <div className="mb-3 flex items-center gap-2" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      {currentMetric.description} · Poenggrenser er historiske 2020–2026 (Kilde: SO-CSV).
                    </div>
                    <TrendChart selectedEntries={selectedEntries} metric={currentMetric} colors={colorMap} />
                  </>
                )}

                {chartTab === 'sammenligning2026' && (
                  <>
                    <div className="mb-3" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                      {currentMetric.description} for valgte institusjoner — 2026. Sortert fallende.
                    </div>
                    <BarComparison selectedEntries={selectedEntries} metric={currentMetric} colors={colorMap} />
                  </>
                )}

                {chartTab === 'tabell' && (
                  <DataTable selectedEntries={selectedEntries} colors={colorMap} />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* DBH-571 søkerpoeng panel — statisk fra CSV */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #93C5FD' }}>
        <div className="px-5 py-3 flex items-center gap-3 flex-wrap" style={{ backgroundColor: '#EFF6FF', borderBottom: '1px solid #BFDBFE' }}>
          <div>
            <span style={{ fontWeight: 700, color: '#1E3A8A', fontSize: 14 }}>
              Snitt opptakspoeng for søkere (DBH tabell 571)
            </span>
            <span style={{ fontSize: 11, color: '#3B82F6', marginLeft: 10 }}>2023–2025</span>
          </div>
          <a
            href="https://dbh.hkdir.no/tallForForskning/Tabeller/hentTabell/tabellDefinisjon?rptNr=571"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs hover:underline shrink-0"
            style={{ color: '#3B82F6' }}
          >
            <ExternalLink className="w-3 h-3" /> DBH kilde
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={{ backgroundColor: '#F0F9FF', borderBottom: '1px solid #BFDBFE' }}>
                <th className="px-4 py-2.5 text-left" style={{ color: '#1E3A8A', fontWeight: 600, minWidth: 140 }}>Institusjon</th>
                <th className="px-4 py-2.5 text-left" style={{ color: '#3B82F6', fontWeight: 600, minWidth: 100 }}>Studiested</th>
                <th className="px-4 py-2.5 text-left" style={{ color: '#6B7280', fontWeight: 600, fontFamily: 'monospace' }}>SO-kode</th>
                <th className="px-4 py-2.5 text-right" style={{ color: '#1E3A8A', fontWeight: 600 }}>2023</th>
                <th className="px-4 py-2.5 text-right" style={{ color: '#1E3A8A', fontWeight: 600 }}>2024</th>
                <th className="px-4 py-2.5 text-right" style={{ color: '#1E3A8A', fontWeight: 600 }}>2025</th>
                <th className="px-4 py-2.5 text-right" style={{ color: '#6B7280', fontWeight: 600 }}>Antall søkere 2025</th>
              </tr>
            </thead>
            <tbody>
              {DBH_SOKERPOENG.map((entry, i) => {
                const rowBg = i % 2 === 0 ? '#fff' : '#F0F9FF';
                const fmt = (d: { snitt: number | null }) =>
                  d.snitt !== null
                    ? <span style={{ fontWeight: 600, color: '#1D4ED8' }}>{d.snitt.toFixed(1)}</span>
                    : <span style={{ color: '#9CA3AF' }}>–</span>;
                return (
                  <tr key={entry.studiekode} style={{ borderBottom: '1px solid #BFDBFE', backgroundColor: rowBg }}>
                    <td className="px-4 py-2" style={{ color: '#1E3A8A', fontWeight: 600 }}>{entry.institusjon}</td>
                    <td className="px-4 py-2" style={{ color: '#374151' }}>{entry.studiested}</td>
                    <td className="px-4 py-2" style={{ color: '#6B7280', fontFamily: 'monospace', fontSize: 11 }}>{entry.studiekode}</td>
                    <td className="px-4 py-2 text-right">{fmt(entry.years['2023'])}</td>
                    <td className="px-4 py-2 text-right">{fmt(entry.years['2024'])}</td>
                    <td className="px-4 py-2 text-right">{fmt(entry.years['2025'])}</td>
                    <td className="px-4 py-2 text-right" style={{ color: '#6B7280' }}>
                      {entry.years['2025'].antall !== null
                        ? entry.years['2025'].antall.toLocaleString('nb-NO')
                        : <span style={{ color: '#9CA3AF' }}>–</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-2.5 text-xs" style={{ backgroundColor: '#F0F9FF', borderTop: '1px solid #BFDBFE', color: '#6B7280' }}>
          Gjennomsnittlige opptakspoeng for <em>alle søkere</em> (ikke bare de som ble tatt opp).
          Kilde: DBH/HKDIR tabell 571 — data fra vedlagt CSV-fil (okadm_bruker_dbh571_2023_2025.csv).
        </div>
      </div>

      {/* Legend / notes */}
      <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
        <div className="flex items-start gap-1.5 rounded-lg px-4 py-2.5 flex-1" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            <strong>Søkerpress</strong> = førstevalgssøkere / studieplasser. Poenggrense = 0 betyr at alle kvalifiserte kom inn.
            Poenggrenser er offisielle tall fra SO 2020–2026. Trend i datatabellen er 2026 vs. 2025.
          </span>
        </div>
        <div className="flex items-start gap-1.5 rounded-lg px-4 py-2.5 flex-1" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            BI, Kristiania og Oslo nye høyskole er ikke inkludert — private institusjoner utenfor Samordna Opptak.
            Søkertall er per april 2026, før tilbud gis.
          </span>
        </div>
      </div>

      </>}
    </div>
  );
}
