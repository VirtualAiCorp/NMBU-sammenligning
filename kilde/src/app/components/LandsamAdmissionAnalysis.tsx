import { useState, useMemo, useEffect, Fragment } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Info, ExternalLink, Filter } from 'lucide-react';
import { CsvExportButton } from './CsvExportButton';
import { exportFacultyAdmissionCsv } from '../utils/csvExport';
import type { LandsamGroup, LandsamLevel } from '../data/landsamAdmissionData';
import { INGEN_DATA_TEKST, type FacultyData } from '../data/faculties';
import { FacultyContext, useFaculty, useFacultyColor } from '../data/facultyContext';
import { landsamHasComparison } from '../data/landsamUtils';
import type { FullAdmissionEntry, FullYearData } from '../data/fullAdmissionData';

// Norsk tallformat (desimalkomma, mellomrom som tusenskille)
function nf(v: number, dec: number): string {
  return v.toLocaleString('nb-NO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ─── Metrics ─────────────────────────────────────────────────────────────────

type MetricKey = 'alleS' | 'fvS' | 'sokerpress' | 'plasser' | 'kvinner' | 'kvalifiserte' | 'tilbud' | 'mott' | 'oppmote' | 'pg_ord' | 'pg_fv' | 'pg_snitt'
  | 'op_mott' | 'kp_mott' | 'op_fv' | 'op_alle';

interface MetricDef {
  id: MetricKey;
  label: string;
  unit: string;
  decimals: number;
  description: string;
  /** 'dbh571' = snittpoeng fra DBH tabell 571 (bare Samordna-program, siste år 2025). */
  kilde?: 'dbh571';
}

const METRICS: MetricDef[] = [
  { id: 'alleS',        label: 'Alle søkere',         unit: '',  decimals: 0, description: 'Totalt antall søkere' },
  { id: 'fvS',          label: 'Førstevalgssøkere',   unit: '',  decimals: 0, description: 'Søkere med studiet som 1. valg' },
  { id: 'sokerpress',   label: 'Søkerpress',          unit: 'x', decimals: 1, description: 'Førstevalgssøkere per studieplass (lokale opptak: per tilbud om opptak)' },
  { id: 'plasser',      label: 'Studieplasser',       unit: '',  decimals: 0, description: 'Antall studieplasser' },
  { id: 'kvinner',      label: 'Kvinner %',           unit: '%', decimals: 1, description: 'Andel kvinner blant 1. valg-søkere' },
  { id: 'kvalifiserte', label: 'Kvalifiserte',        unit: '',  decimals: 0, description: 'Antall kvalifiserte søkere' },
  { id: 'tilbud',       label: 'Tilbud',              unit: '',  decimals: 0, description: 'Søkere med tilbud om opptak' },
  { id: 'mott',         label: 'Møtt',                unit: '',  decimals: 0, description: 'Møtt til studiestart (DBH, lokale opptak)' },
  { id: 'oppmote',      label: 'Oppmøteandel',        unit: '%', decimals: 1, description: 'Møtt til studiestart i prosent av tilbud om opptak' },
  { id: 'pg_ord',       label: 'Poenggrense ordinær', unit: '',  decimals: 1, description: 'Opptaksgrense ordinær kvote' },
  { id: 'pg_fv',        label: 'Poenggrense FV',      unit: '',  decimals: 1, description: 'Opptaksgrense førstegangsvitnemål' },
  { id: 'pg_snitt',     label: 'Snitt poenggrense',   unit: '',  decimals: 1, description: 'Gjennomsnitt av ordinær og førstegangsvitnemål poenggrense' },
  { id: 'op_mott',      label: 'Møtt: opptakspoeng',  unit: '',  decimals: 1, kilde: 'dbh571', description: 'Gjennomsnittlige opptakspoeng (karakterpoeng + alders- og tilleggspoeng) for studentene som møtte til studiestart (DBH 571)' },
  { id: 'kp_mott',      label: 'Møtt: karakterpoeng', unit: '',  decimals: 1, kilde: 'dbh571', description: 'Gjennomsnittlige karakterpoeng (skolepoeng uten alders- og tilleggspoeng) for studentene som møtte til studiestart (DBH 571)' },
  { id: 'op_fv',        label: 'Førstevalg: poeng',   unit: '',  decimals: 1, kilde: 'dbh571', description: 'Gjennomsnittlige opptakspoeng for førstevalgssøkerne (DBH 571)' },
  { id: 'op_alle',      label: 'Alle søkere: poeng',  unit: '',  decimals: 1, kilde: 'dbh571', description: 'Gjennomsnittlige opptakspoeng for alle søkerne i institusjonens opptak (DBH 571)' },
];

const isPointMetric = (m: MetricKey) => METRICS.find((d) => d.id === m)?.kilde === 'dbh571';

/** Møtt og oppmøteandel finnes bare for lokale opptak (DBH 379); snittpoeng (DBH 571) bare for Samordna-program. */
function metricsFor(local: boolean): MetricDef[] {
  return METRICS.filter((m) => local ? m.kilde !== 'dbh571' : (m.id !== 'mott' && m.id !== 'oppmote'));
}

/** Siste år (≤ ønsket år) der oppføringen har verdi for målet. */
function latestYearWith(e: FullAdmissionEntry, metric: MetricKey, years: readonly string[], upTo: string): string | null {
  for (let i = years.indexOf(upTo); i >= 0; i--) {
    const d = e.years[years[i]];
    if (d && getVal(d, metric) !== null) return years[i];
  }
  return null;
}

function getVal(data: FullYearData, metric: MetricKey): number | null {
  if (metric === 'oppmote') {
    if (data.mott == null || data.tilbud == null || data.tilbud === 0) return null;
    return (data.mott / data.tilbud) * 100;
  }
  if (metric === 'sokerpress') {
    if (data.fvS === null) return null;
    if (data.plasser !== null && data.plasser > 0) return data.fvS / data.plasser;
    // Lokale opptak (SO-program har alltid studieplasser): bruk tilbud om opptak som nevner.
    if (data.tilbud !== null && data.tilbud > 0) return data.fvS / data.tilbud;
    return null;
  }
  if (metric === 'pg_snitt') {
    if (data.pg_fv === null || data.pg_ord === null) return null;
    if (data.pg_fv === 0 && data.pg_ord === 0) return 0;
    if (data.pg_fv === 0 || data.pg_ord === 0) return null;
    return (data.pg_fv + data.pg_ord) / 2;
  }
  const v = data[metric as keyof FullYearData];
  return v === undefined ? null : (v as number | null);
}

const LEVEL_LABEL: Record<LandsamLevel, string> = {
  bachelor: 'Bachelor',
  master5:  'Femårig master',
  master2:  'Toårig master',
};

// ─── Trend chip ───────────────────────────────────────────────────────────────

function TrendChip({ val, prev }: { val: number | null; prev: number | null }) {
  if (val === null || prev === null) return null;
  const diff = val - prev;
  if (Math.abs(diff) < 0.05) return <Minus className="w-3.5 h-3.5 inline" style={{ color: '#888' }} />;
  if (diff > 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs" style={{ color: '#2a7a55' }}>
      <TrendingUp className="w-3 h-3" />+{nf(Math.abs(diff), 1)}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs" style={{ color: '#9b3a3a' }}>
      <TrendingDown className="w-3 h-3" />−{nf(Math.abs(diff), 1)}
    </span>
  );
}

// ─── Institution picker ───────────────────────────────────────────────────────

function InstitutionPicker({
  group, selected, onChange,
}: {
  group: LandsamGroup;
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const colorFor = useFacultyColor();
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
      <div className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)' }}>
        <div className="flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>
          <Filter className="w-3.5 h-3.5" /> Velg institusjoner
        </div>
        <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>
          {LEVEL_LABEL[group.level]}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        {group.entries.map((e) => {
          const active = selected.includes(e.id);
          const col = colorFor(e.id);
          const isNmbu = group.nmbuIds.includes(e.id);
          return (
            <button key={e.id} onClick={() => toggle(e.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all w-full"
              style={{
                backgroundColor: active ? col : 'var(--nmbu-beige-light)',
                color: active ? '#fff' : 'var(--nmbu-neutral-1)',
                border: `1.5px solid ${active ? col : isNmbu ? 'var(--nmbu-green-3)' : 'var(--nmbu-neutral-3)'}`,
                fontWeight: active ? 600 : 400,
              }}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: active ? '#fff' : col, opacity: active ? 0.9 : 1 }} />
              <div className="flex-1 min-w-0">
                <div>{e.shortName}{isNmbu ? ' ★' : ''}</div>
                <div style={{ fontSize: 10, opacity: 0.75, fontWeight: 400 }}>
                  {e.studiekode ? `${e.studiekode} · ` : ''}{e.studiested}
                </div>
              </div>
              {e.url && (
                <a href={e.url} target="_blank" rel="noopener noreferrer" title="Åpne programsiden"
                  onClick={(ev) => ev.stopPropagation()}
                  className="shrink-0 rounded-md p-1 hover:opacity-100"
                  style={{ opacity: 0.7, color: active ? '#fff' : 'var(--nmbu-green)' }}>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </button>
          );
        })}
      </div>
      <div className="px-3 pb-2.5 flex gap-2 flex-wrap">
        <button onClick={() => onChange(group.entries.map((e) => e.id))} className="text-xs hover:underline" style={{ color: 'var(--nmbu-green)' }}>Velg alle</button>
        <button onClick={() => onChange([])} className="text-xs hover:underline" style={{ color: 'var(--nmbu-neutral-2)' }}>Fjern alle</button>
        <button onClick={() => onChange(group.defaultIds)} className="text-xs hover:underline" style={{ color: 'var(--nmbu-neutral-2)' }}>Tilbakestill</button>
      </div>
    </div>
  );
}

// ─── Trend chart ─────────────────────────────────────────────────────────────

function TrendChart({ selectedEntries, metric }: { selectedEntries: FullAdmissionEntry[]; metric: MetricDef }) {
  const YEARS = useFaculty().admissionYears;
  const colorFor = useFacultyColor();
  const data = YEARS.map((year) => {
    const r: Record<string, number | string> = { year };
    selectedEntries.forEach((e) => {
      const yr = e.years[year];
      if (!yr) return;
      const v = getVal(yr, metric.id);
      if (v !== null) r[e.id] = v;
    });
    return r;
  });

  const hasAny = data.some((r) => Object.keys(r).length > 1);
  if (!hasAny) {
    return (
      <div className="flex items-center justify-center h-48" style={{ color: 'var(--nmbu-neutral-2)', fontSize: 13 }}>
        Ingen data for «{metric.label}» ennå.
      </div>
    );
  }

  // Navnelapp ved hver linjes siste punkt (snittpoeng fra DBH slutter før siste Samordna-år).
  const lastIdxFor = (id: string) => {
    for (let i = data.length - 1; i >= 0; i--) if (data[i][id] !== undefined) return i;
    return -1;
  };

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={data} margin={{ top: 12, right: 130, bottom: 4, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-neutral-3)" />
        <XAxis dataKey="year" tick={{ fill: '#555', fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis domain={['auto', 'auto']} tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false} width={40}
          tickFormatter={(v) => metric.unit === '%' ? `${v}%` : metric.unit === 'x' ? `${v}x` : String(v)} />
        <Tooltip
          formatter={(v: number, key: string) => {
            const e = selectedEntries.find((x) => x.id === key);
            return [`${nf(v, metric.decimals)}${metric.unit ? ' ' + metric.unit : ''}`, e?.shortName ?? key];
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
                if (props.index !== lastIdxFor(e.id) || props.value == null) return <g key={k} />;
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

function BarComparison({
  selectedEntries, metric, year,
}: {
  selectedEntries: FullAdmissionEntry[];
  metric: MetricDef;
  year: string;
}) {
  const colorFor = useFacultyColor();
  const data = selectedEntries
    .map((e) => {
      const yr = e.years[year];
      if (!yr) return null;
      const v = getVal(yr, metric.id);
      if (v === null) return null;
      return { id: e.id, name: e.shortName, value: v };
    })
    .filter(Boolean)
    .sort((a, b) => b!.value - a!.value) as { id: string; name: string; value: number }[];

  if (data.length === 0) {
    return <p className="text-sm text-center py-8" style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen data for {year}.</p>;
  }

  const avg = data.reduce((s, d) => s + d.value, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 60, bottom: 4, left: 90 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-neutral-3)" horizontal={false} />
        <XAxis type="number" domain={['auto', 'auto']} tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false}
          tickFormatter={(v) => metric.unit === '%' ? `${v}%` : metric.unit === 'x' ? `${v}x` : String(v)} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#333', fontSize: 11 }} tickLine={false} axisLine={false} width={150} />
        <Tooltip
          formatter={(v: number) => [`${nf(v, metric.decimals)}${metric.unit ? ' ' + metric.unit : ''}`, metric.label]}
          contentStyle={{ border: '1px solid var(--nmbu-green-3)', borderRadius: 8, fontSize: 12 }}
        />
        <ReferenceLine x={avg} stroke="#888" strokeDasharray="4 3"
          label={{ value: `Snitt ${nf(avg, metric.decimals)}`, position: 'top', fontSize: 10, fill: '#888' }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((d) => <Cell key={d.id} fill={colorFor(d.id)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Data table ───────────────────────────────────────────────────────────────

function DataTable({
  selectedEntries, group, year,
}: {
  selectedEntries: FullAdmissionEntry[];
  group: LandsamGroup;
  year: string;
}) {
  const YEARS = useFaculty().admissionYears;
  const colorFor = useFacultyColor();
  const [sortKey, setSortKey] = useState<MetricKey>('pg_ord');
  const [sortAsc, setSortAsc] = useState(false);

  const prevYear = (() => {
    const i = YEARS.indexOf(year);
    return i > 0 ? YEARS[i - 1] : null;
  })();

  const rows = selectedEntries
    .map((e) => ({ e, cur: e.years[year], prev: prevYear ? e.years[prevYear] : undefined }))
    .filter((r) => r.cur)
    .sort((a, b) => {
      const av = a.cur ? getVal(a.cur, sortKey) : null;
      const bv = b.cur ? getVal(b.cur, sortKey) : null;
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      return sortAsc ? av - bv : bv - av;
    });

  if (rows.length === 0) {
    return <p className="text-sm text-center py-8" style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen data for {year}.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
            <th className="px-3 py-2.5 text-left" style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>Program</th>
            {metricsFor(group.level === 'master2').map((m) => (
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
          {rows.map(({ e, cur, prev }, i) => (
            <tr key={e.id} style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: i % 2 === 0 ? '#fff' : 'var(--nmbu-beige-light)' }}>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorFor(e.id) }} />
                  {e.url ? (
                    <a href={e.url} target="_blank" rel="noopener noreferrer" title="Åpne programsiden"
                      className="flex items-center gap-1 hover:underline" style={{ fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>
                      {e.shortName} <ExternalLink className="w-3 h-3" style={{ opacity: 0.6 }} />
                    </a>
                  ) : (
                    <span style={{ fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>{e.shortName}</span>
                  )}
                  {group.nmbuIds.includes(e.id) && (
                    <span className="px-1.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>NMBU</span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginTop: 1 }}>{e.studiekode} · {e.studiested}</div>
                {e.poengFellesMed && (
                  <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginTop: 1, fontStyle: 'italic' }}
                    title="DBH registrerer opptaket på ett studieprogram som dekker flere studiesteder eller varianter. Snittpoengene er derfor like for disse oppføringene.">
                    * Snittpoeng felles for hele DBH-programmet
                  </div>
                )}
              </td>
              {metricsFor(group.level === 'master2').map((m) => {
                const v = cur ? getVal(cur, m.id) : null;
                const vPrev = prev ? getVal(prev, m.id) : null;
                const isZeroPg = v === 0 && (m.id === 'pg_ord' || m.id === 'pg_fv' || m.id === 'pg_snitt');
                return (
                  <td key={m.id} className="px-3 py-2.5 text-center"
                    title={(m.id === 'op_mott' || m.id === 'kp_mott') && cur?.n_mott ? `Snitt av ${cur.n_mott} som møtte til studiestart` : undefined}>
                    <div style={{ fontWeight: 600, color: v === null ? 'var(--nmbu-neutral-3)' : isZeroPg ? 'var(--nmbu-green-6)' : 'var(--nmbu-neutral)' }}>
                      {v === null ? '–' : isZeroPg ? 'Alle inn' : `${nf(v, m.decimals)}${m.unit ? ' ' + m.unit : ''}`}
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

// ─── Nøkkeltall for NMBU-programmet/-programmene i gruppen ─────────────────────

function NmbuKeyFigures({ group, year: requestedYear }: { group: LandsamGroup; year: string }) {
  const YEARS = useFaculty().admissionYears;
  const nmbuEntries = group.entries.filter((e) => group.nmbuIds.includes(e.id));
  if (nmbuEntries.length === 0) return null;

  const fmt = (d: number, dec = 0) => (d >= 0 ? '+' : '') + (dec ? nf(d, dec) : Math.round(d));

  // Bruk ønsket år hvis programmet har søkertall der, ellers siste tidligere år med tall
  // (lokale masteropptak i DBH ligger typisk ett år bak Samordna opptak).
  const effectiveYear = (e: FullAdmissionEntry): string => {
    const has = (y: string) => e.years[y]?.alleS != null || e.years[y]?.pg_ord != null;
    if (has(requestedYear)) return requestedYear;
    const i = YEARS.indexOf(requestedYear);
    for (let k = i - 1; k >= 0; k--) if (has(YEARS[k])) return YEARS[k];
    return requestedYear;
  };

  return (
    <>
      {nmbuEntries.map((e) => {
        const year = effectiveYear(e);
        const prevYear = (() => {
          const i = YEARS.indexOf(year);
          return i > 0 ? YEARS[i - 1] : null;
        })();
        const cur = e.years[year] ?? null;
        const prev = prevYear ? (e.years[prevYear] ?? null) : null;
        const sp = cur ? getVal(cur, 'sokerpress') : null;
        const spPrev = prev ? getVal(prev, 'sokerpress') : null;

        const local = group.level === 'master2';
        const opp = cur ? getVal(cur, 'oppmote') : null;
        const oppPrev = prev ? getVal(prev, 'oppmote') : null;
        const highlights: { label: string; value: string; sub?: string; delta: string | null }[] = local ? [
          {
            label: 'Alle søkere',
            value: cur?.alleS?.toLocaleString('nb-NO') ?? '–',
            delta: cur?.alleS != null && prev?.alleS != null ? `${fmt(cur.alleS - prev.alleS)} vs. ${prevYear}` : null,
          },
          {
            label: 'Førstevalgssøkere',
            value: cur?.fvS?.toLocaleString('nb-NO') ?? '–',
            delta: cur?.fvS != null && prev?.fvS != null ? `${fmt(cur.fvS - prev.fvS)} vs. ${prevYear}` : null,
          },
          {
            label: 'Tilbud om opptak',
            value: cur?.tilbud?.toLocaleString('nb-NO') ?? '–',
            delta: cur?.tilbud != null && prev?.tilbud != null ? `${fmt(cur.tilbud - prev.tilbud)} vs. ${prevYear}` : null,
          },
          {
            label: 'Møtt til studiestart',
            value: cur?.mott != null ? cur.mott.toLocaleString('nb-NO') : '–',
            sub: opp != null ? `${nf(opp, 0)} % av tilbudene` : undefined,
            delta: opp != null && oppPrev != null ? `${fmt(opp - oppPrev, 1)} pp vs. ${prevYear}` : null,
          },
          {
            label: 'Søkerpress (fv. / tilbud)',
            value: sp != null ? `${nf(sp, 2)}×` : '–',
            delta: sp != null && spPrev != null ? `${fmt(sp - spPrev, 2)}× vs. ${prevYear}` : null,
          },
        ] : [
          {
            label: 'Alle søkere',
            value: cur?.alleS?.toLocaleString('nb-NO') ?? '–',
            delta: cur?.alleS != null && prev?.alleS != null ? `${fmt(cur.alleS - prev.alleS)} vs. ${prevYear}` : null,
          },
          {
            label: 'Førstevalgssøkere',
            value: cur?.fvS?.toLocaleString('nb-NO') ?? '–',
            delta: cur?.fvS != null && prev?.fvS != null ? `${fmt(cur.fvS - prev.fvS)} vs. ${prevYear}` : null,
          },
          {
            label: 'Studieplasser',
            value: cur?.plasser?.toLocaleString('nb-NO') ?? '–',
            delta: cur?.plasser != null && prev?.plasser != null ? `${fmt(cur.plasser - prev.plasser)} vs. ${prevYear}` : null,
          },
          {
            label: 'Søkerpress',
            value: sp != null ? `${nf(sp, 2)}×` : '–',
            delta: sp != null && spPrev != null ? `${fmt(sp - spPrev, 2)}× vs. ${prevYear}` : null,
          },
          (() => {
            const py = latestYearWith(e, 'op_mott', YEARS, requestedYear);
            const pc = py ? e.years[py] : undefined;
            const pyPrev = py ? YEARS[YEARS.indexOf(py) - 1] : undefined;
            const pp = pyPrev ? e.years[pyPrev] : undefined;
            return {
              label: `Snitt opptakspoeng, møtt${py && py !== year ? ` (${py})` : ''}`,
              value: pc?.op_mott != null ? nf(pc.op_mott, 1) : '–',
              sub: pc?.kp_mott != null ? `karakterpoeng ${nf(pc.kp_mott, 1)}${pc.n_mott ? ` · ${pc.n_mott} studenter` : ''}` : undefined,
              delta: pc?.op_mott != null && pp?.op_mott != null ? `${fmt(pc.op_mott - pp.op_mott, 1)} vs. ${pyPrev}` : null,
            };
          })(),
          {
            label: 'Poenggrense (fv. / ord.)',
            value: cur?.pg_fv != null && cur?.pg_ord != null
              ? `${nf(cur.pg_fv, 1)} / ${nf(cur.pg_ord, 1)}`
              : '–',
            delta: cur?.pg_ord != null && prev?.pg_ord != null
              ? `${fmt(cur.pg_ord - prev.pg_ord, 1)} vs. ${prevYear}` : null,
          },
        ];

        return (
          <div key={e.id} className="mx-6 mb-5 rounded-xl px-5 py-4" style={{ backgroundColor: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6EE7B7' }} />
              <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                {e.shortName}{e.studiekode ? ` (${e.studiekode})` : ''} · Nøkkeltall {year}
                {year !== requestedYear ? ` · siste år med tall` : ''}
              </span>
            </div>
            <div className="flex gap-8 flex-wrap">
              {highlights.map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
                  {s.sub && <div style={{ fontSize: 9, opacity: 0.55, marginTop: 2 }}>{s.sub}</div>}
                  {s.delta != null && (
                    <div style={{ fontSize: 10, marginTop: 3, fontWeight: 600, color: s.delta.startsWith('-') || s.delta.startsWith('−') ? '#FCA5A5' : '#6EE7B7' }}>
                      {s.delta}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type ChartTab = 'trend' | 'sammenligning' | 'tabell';

export function LandsamAdmissionAnalysis({ faculty, initialGroup }: { faculty: FacultyData; initialGroup?: string }) {
  const GROUPS = faculty.admissionGroups;
  const YEARS = faculty.admissionYears;

  const firstGroupId = GROUPS[0]?.id ?? '';
  const [groupId, setGroupId] = useState<string>(
    initialGroup && GROUPS.some((g) => g.id === initialGroup) ? initialGroup : firstGroupId
  );

  const group = useMemo(
    () => GROUPS.find((g) => g.id === groupId) ?? GROUPS[0],
    [GROUPS, groupId]
  );

  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string[]>>(
    () => Object.fromEntries(GROUPS.map((g) => [g.id, g.defaultIds]))
  );
  const [metric, setMetric] = useState<MetricKey>('pg_ord');
  const [chartTab, setChartTab] = useState<ChartTab>('trend');
  const [year, setYear] = useState<string>(YEARS[YEARS.length - 1]);

  // Lokale opptak (toårig master): DBH rapporterer senere enn Samordna opptak, og poenggrenser finnes sjelden.
  // Ved gruppebytte: hopp til siste år med NMBU-tall, og bytt fra poenggrense til «Alle søkere» hvis gruppen mangler poenggrenser.
  useEffect(() => {
    if (!group) return;
    if (group.level !== 'master2') {
      // Møtt/oppmøteandel finnes bare for lokale opptak; gå tilbake til poenggrense.
      if (metric === 'mott' || metric === 'oppmote') setMetric('pg_ord');
      return;
    }
    if (isPointMetric(metric)) setMetric('alleS');
    const nmbu = group.entries.filter((e) => group.nmbuIds.includes(e.id));
    const hasYear = (y: string) => nmbu.some((e) => e.years[y]?.alleS != null);
    if (!hasYear(year)) {
      const latest = [...YEARS].reverse().find(hasYear);
      if (latest) setYear(latest);
    }
    if (metric.startsWith('pg_') && !group.entries.some((e) => Object.values(e.years).some((y) => y?.pg_ord != null))) {
      setMetric('alleS');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.id]);

  // Snittpoeng (DBH 571) finnes til og med 2025: flytt året bakover hvis valgt år mangler poeng.
  useEffect(() => {
    if (!group || !isPointMetric(metric)) return;
    const has = (y: string) => group.entries.some((e) => e.years[y] && getVal(e.years[y]!, metric) !== null);
    if (!has(year)) {
      const latest = [...YEARS].reverse().find(has);
      if (latest) setYear(latest);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metric, group?.id]);

  if (!group) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', color: 'var(--nmbu-neutral-2)', fontSize: 13 }}>
        {INGEN_DATA_TEKST}
      </div>
    );
  }

  const isLocal = group.level === 'master2';

  const selectedIds = selectedByGroup[group.id] ?? group.defaultIds;
  const setSelectedIds = (ids: string[]) =>
    setSelectedByGroup((prev) => ({ ...prev, [group.id]: ids }));

  const selectedEntries = group.entries.filter((e) => selectedIds.includes(e.id));
  const currentMetric = METRICS.find((m) => m.id === metric)!;

  const chartTabs: { id: ChartTab; label: string }[] = [
    { id: 'trend',         label: `Trend ${YEARS[0]}–${YEARS[YEARS.length - 1]}` },
    { id: 'sammenligning', label: `Sammenligning ${year}` },
    { id: 'tabell',        label: 'Datatabell' },
  ];

  return (
    <FacultyContext.Provider value={faculty}>
    <div className="space-y-5">

      {/* Programgruppe-faner — hentet fra data */}
      <div className="flex items-center gap-1 rounded-xl p-1.5 flex-wrap" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', width: 'fit-content' }}>
        {GROUPS.map((g) => {
          const ok = landsamHasComparison(g);
          return (
            <button key={g.id} onClick={() => ok && setGroupId(g.id)} disabled={!ok}
              title={ok ? undefined : 'Ikke nok data til sammenligning ennå'}
              className="px-5 py-2 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: groupId === g.id ? 'var(--nmbu-green-dark)' : 'transparent',
                color: groupId === g.id ? '#fff' : ok ? 'var(--nmbu-neutral-1)' : 'var(--nmbu-neutral-2)',
                fontWeight: groupId === g.id ? 600 : 400,
                opacity: ok ? 1 : 0.55,
                cursor: ok ? 'pointer' : 'not-allowed',
                textDecoration: ok ? 'none' : 'line-through',
              }}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Header */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
          <div style={{ maxWidth: 620 }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8 }}>
              {isLocal ? 'Lokalt opptak' : 'Samordna opptak'} · {group.label} · {LEVEL_LABEL[group.level]}
            </div>
            <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: 22, lineHeight: 1.3 }}>
              Hvor står NMBU i konkurransen om {group.label.toLowerCase()}-søkerne?
            </div>
            <p style={{ fontSize: 13, opacity: 0.82, marginTop: 10, lineHeight: 1.65 }}>
              {group.desc} Velg programmer og nøkkeltall i filteret til venstre, og bytt mellom
              trendvisning {YEARS[0]}–{YEARS[YEARS.length - 1]}, direkte sammenligning for ett år og datatabell.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CsvExportButton onExport={() => exportFacultyAdmissionCsv(faculty)} label="Last ned CSV" dark />
            <a href={isLocal ? 'https://dbh.hkdir.no' : 'https://hkdir.no/sokertall-fra-samordna-opptak-til-nedlasting'}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <ExternalLink className="w-3.5 h-3.5" /> {isLocal ? 'Kilde: DBH/HKDIR tabell 379' : 'Kilde: Samordna opptak / HKDIR'}
            </a>
          </div>
        </div>

        <NmbuKeyFigures group={group} year={year} />
      </div>

      {/* Info-linje for gruppen */}
      {group.note && (
        <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3"
          style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{group.note}</span>
        </div>
      )}

      <div className="grid gap-5" style={{ gridTemplateColumns: '220px 1fr' }}>

        <InstitutionPicker group={group} selected={selectedIds} onChange={setSelectedIds} />

        {/* Chart panel */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
          <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
            <div className="flex flex-wrap gap-1.5">
              {metricsFor(isLocal).map((m, i, arr) => (
                <Fragment key={m.id}>
                {m.kilde === 'dbh571' && arr[i - 1]?.kilde !== 'dbh571' && (
                  <span className="flex items-center gap-1.5 pl-2 ml-1 text-xs" title="Snittpoeng fra DBH tabell 571, til og med 2025"
                    style={{ borderLeft: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>
                    Snittpoeng (DBH):
                  </span>
                )}
                <button onClick={() => setMetric(m.id)}
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
                </Fragment>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {chartTab !== 'trend' && (
                <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
                  {YEARS.map((y, i) => (
                    <button key={y} onClick={() => setYear(y)}
                      className="px-2.5 py-1.5 text-xs transition-all"
                      style={{
                        backgroundColor: year === y ? 'var(--nmbu-green-4)' : '#fff',
                        color: year === y ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)',
                        borderRight: i < YEARS.length - 1 ? '1px solid var(--nmbu-neutral-3)' : 'none',
                        fontWeight: year === y ? 700 : 400,
                      }}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
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
                      {currentMetric.description} · {YEARS[0]}–{YEARS[YEARS.length - 1]}
                    </div>
                    <TrendChart selectedEntries={selectedEntries} metric={currentMetric} />
                  </>
                )}
                {chartTab === 'sammenligning' && (
                  <>
                    <div className="mb-3" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                      {currentMetric.description} · valgte programmer · {year}. Sortert fallende.
                    </div>
                    <BarComparison selectedEntries={selectedEntries} metric={currentMetric} year={year} />
                  </>
                )}
                {chartTab === 'tabell' && (
                  <>
                    <div className="mb-3" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                      Alle nøkkeltall for {year}. Klikk på en kolonneoverskrift for å sortere.
                    </div>
                    <DataTable selectedEntries={selectedEntries} group={group} year={year} />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3"
        style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          {isLocal
            ? 'Kilde: DBH/HKDIR tabell 379 (lokale opptak) for søkere, førstevalgssøkere, kvinneandel, kvalifiserte og tilbud; studieplasser og poenggrenser fra institusjonenes egne sider der de finnes. Lokale masteropptak er ikke med i Samordna opptak. Søkerpress = førstevalgssøkere / studieplasser, eller / tilbud om opptak der studieplasser ikke er publisert.'
            : 'Kilde: Samordna opptak / HKDIR. Søkerpress = førstevalgssøkere / studieplasser. Snittpoeng: DBH/HKDIR tabell 571, gjennomsnittlige opptakspoeng og karakterpoeng for dem som møtte til studiestart, for førstevalgssøkerne og for alle søkerne i institusjonens opptak (til og med 2025). Små grupper er skjermet av DBH og utelatt. Der flere oppføringer deler DBH-program, er snittet felles (merket med * i tabellen).'}
          {' '}Poenggrense 0 = åpent opptak (alle kvalifiserte kom inn), «–» = tall ikke lagt inn ennå.
        </span>
      </div>

    </div>
    </FacultyContext.Provider>
  );
}
