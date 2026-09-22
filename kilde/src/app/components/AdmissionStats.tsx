import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Info, ExternalLink, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ADMISSION_DATA, ADMISSION_YEARS, type CampusApplicants } from '../data/admissionData';
import { UNIVERSITY_INFO } from '../data/courseMapping';
import { AccreditationBadge } from './AccreditationBadge';
import { getDBHSnitt } from '../data/dbhSokerpoeng';

const REPUTATION: Record<string, number> = {
  ntnu:       85,
  nmbu:       84,
  uit:        80,
  uia:        78,
  nhh:        78,
  hio:        74,
  usn:        73,
  oslomet:    72,
  kristiania: 67,
  bi:         67,
};

function ReputationBadge({ universityId }: { universityId: string }) {
  const score = REPUTATION[universityId];
  if (score === undefined) return null;

  const style: React.CSSProperties = score >= 82
    ? { backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', borderColor: 'var(--nmbu-green-3)' }
    : score >= 76
    ? { backgroundColor: 'var(--nmbu-green-light)', color: 'var(--nmbu-green-6)', borderColor: 'var(--nmbu-green-2)' }
    : score >= 70
    ? { backgroundColor: 'var(--nmbu-beige)', color: '#5c4a1e', borderColor: '#c2b99a' }
    : { backgroundColor: '#fef4e0', color: '#8a6200', borderColor: '#d4b47a' };

  return (
    <span
      title="Khrono omdømmemåling 2026 (Apeland/Norstat) — skala 0–100"
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] leading-tight cursor-help"
      style={{ fontWeight: 500, ...style }}
    >
      ⭐ {score}/100
    </span>
  );
}

type QuotaMode = 'firstTimers' | 'ordinary';

const COLORS = [
  '#025c4f', '#e05c2a', '#3a7fc1', '#c2963a',
  '#7b3fa0', '#2ea87e', '#c13a5a', '#4e7fc4',
  '#6b8c2a', '#c17a3a', '#1a6b8a', '#a04f2a',
];

function TrendIcon({ current, prev }: { current: number | null; prev: number | null }) {
  if (current === null || prev === null || current === 0 || prev === 0) return null;
  const diff = current - prev;
  if (Math.abs(diff) < 0.05) return <Minus className="w-3.5 h-3.5" style={{ color: 'var(--nmbu-neutral-2)' }} />;
  if (diff > 0) return <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--nmbu-green-6)' }} title="Høyere snitt enn forrige år" />;
  return <TrendingDown className="w-3.5 h-3.5" style={{ color: '#9b3a3a' }} title="Lavere snitt enn forrige år" />;
}

function CompetitionBar({ firstChoice, spots, stipulated }: { firstChoice: number; spots: number; stipulated?: number }) {
  const ratio = stipulated !== undefined ? stipulated : firstChoice / spots;
  const pct = Math.min((ratio / 10) * 100, 100);
  const barColor = ratio >= 6 ? '#9b3a3a' : ratio >= 3 ? '#c2963a' : ratio >= 1.5 ? 'var(--nmbu-green-2)' : 'var(--nmbu-green)';
  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden min-w-[60px]" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
        </div>
        <span className="text-xs w-8 text-right" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 500 }}>{ratio.toFixed(1)}x</span>
      </div>
      {stipulated !== undefined && (
        <div style={{ fontSize: 9, color: '#8b6f00', marginTop: 1 }}>stipulert</div>
      )}
    </div>
  );
}

function CampusTable({ campuses }: { campuses: CampusApplicants[] }) {
  return (
    <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px dashed var(--nmbu-neutral-3)' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--nmbu-neutral-2)', marginBottom: 4 }}>
        Opptakstall per studiested (2026)
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ color: 'var(--nmbu-neutral-2)' }}>
            <th style={{ textAlign: 'left',  paddingBottom: 2, fontWeight: 600, paddingRight: 8 }}>Sted</th>
            <th style={{ textAlign: 'right', paddingBottom: 2, fontWeight: 600, paddingRight: 6 }}>Søkere</th>
            <th style={{ textAlign: 'right', paddingBottom: 2, fontWeight: 600, paddingRight: 6 }}>1.valg</th>
            <th style={{ textAlign: 'right', paddingBottom: 2, fontWeight: 600, paddingRight: 6 }}>Plasser</th>
            <th style={{ textAlign: 'right', paddingBottom: 2, fontWeight: 600 }}>Søkerpr.</th>
          </tr>
        </thead>
        <tbody>
          {campuses.map((c) => {
            const sp = c.firstChoice !== null && c.spots !== null && c.spots > 0
              ? (c.firstChoice / c.spots).toFixed(1) + 'x'
              : null;
            return (
              <tr key={c.name}>
                <td style={{ paddingRight: 8, paddingTop: 2, fontWeight: 600, color: 'var(--nmbu-neutral)' }}>{c.name}</td>
                <td style={{ textAlign: 'right', paddingTop: 2, paddingRight: 6, color: 'var(--nmbu-neutral)' }}>
                  {c.total !== null ? c.total.toLocaleString('nb-NO') : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                </td>
                <td style={{ textAlign: 'right', paddingTop: 2, paddingRight: 6, color: 'var(--nmbu-neutral)' }}>
                  {c.firstChoice !== null ? c.firstChoice : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                </td>
                <td style={{ textAlign: 'right', paddingTop: 2, paddingRight: 6, color: 'var(--nmbu-neutral)' }}>
                  {c.spots !== null ? c.spots : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                </td>
                <td style={{ textAlign: 'right', paddingTop: 2, color: 'var(--nmbu-neutral)' }}>
                  {sp ?? <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AdmissionStats() {
  const [quota, setQuota] = useState<QuotaMode>('ordinary');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => setExpandedIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const publicData = ADMISSION_DATA.filter((d) => d.years['2026'][quota] !== null);

  const chartData = ADMISSION_YEARS.map((year) => {
    const row: Record<string, number | string> = { year };
    publicData.forEach((entry) => {
      const v = entry.years[year]?.[quota];
      if (v !== null && v !== undefined && v > 0) {
        row[UNIVERSITY_INFO[entry.universityId]?.shortName ?? entry.universityId] = v;
      }
    });
    return row;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Opptakstall</h2>
            <p className="text-sm max-w-2xl" style={{ color: 'var(--nmbu-neutral-1)' }}>
              Poenggrenser 2023–2026 og søkertall 2026 for bachelor i økonomi og administrasjon.
              Kilde: Samordna Opptak / HKDIR.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a href="https://rapport-dv.educloud.no/t/SO-datavarehus/views/Poenggrenserogventelistetallhovedopptaksuppleringsopptak_16275618215770/Poenggrenser"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: 'var(--nmbu-green)' }}>
              <ExternalLink className="w-3.5 h-3.5" /> Poenggrenser
            </a>
            <a href="https://hkdir.no/sokertall-fra-samordna-opptak-til-nedlasting"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: 'var(--nmbu-green)' }}>
              <ExternalLink className="w-3.5 h-3.5" /> Søkertall 2026
            </a>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {([
            { id: 'ordinary',    label: 'Ordinær kvote' },
            { id: 'firstTimers', label: 'Førstegangsvitnemål' },
          ] as { id: QuotaMode; label: string }[]).map((q) => (
            <button key={q.id} onClick={() => setQuota(q.id)}
              className="px-4 py-1.5 rounded-full text-sm transition-all"
              style={quota === q.id
                ? { backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', fontWeight: 500 }
                : { backgroundColor: 'var(--nmbu-beige)', color: 'var(--nmbu-neutral-1)' }
              }>
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Line chart */}
      <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <h3 className="text-lg mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Poenggrense over tid</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Universiteter der alle kvalifiserte kom inn (poenggrense = 0) er utelatt fra grafen. 2026 er offisielle tall fra SO.
        </p>
        <ResponsiveContainer width="100%" height={820}>
          <LineChart data={chartData} margin={{ top: 10, right: 90, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-neutral-3)" />
            <XAxis dataKey="year" tick={{ fill: '#4d4d4d', fontSize: 13 }} tickLine={false} axisLine={false} />
            <YAxis
              domain={['auto', 'auto']}
              label={{ value: 'Poeng', angle: -90, position: 'insideLeft', offset: 12, fill: '#4d4d4d', fontSize: 12 }}
              tick={{ fill: '#4d4d4d', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              formatter={(v: number, name: string) => [`${v.toFixed(1)} poeng`, name]}
              contentStyle={{ border: '1px solid var(--nmbu-green-3)', borderRadius: 8, fontSize: 12 }}
            />
            {publicData
              .filter((entry) => ADMISSION_YEARS.map((y) => entry.years[y]?.[quota] ?? 0).some((v) => v > 0))
              .map((entry, i) => {
                const shortName = UNIVERSITY_INFO[entry.universityId]?.shortName ?? entry.universityId;
                const color = COLORS[i % COLORS.length];
                const lastIdx = chartData.length - 1;
                return (
                  <Line key={entry.universityId} type="monotone"
                    dataKey={shortName}
                    stroke={color} strokeWidth={2.5}
                    dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: color }}
                    activeDot={{ r: 7 }}
                    label={(props: { x?: number; y?: number; index?: number; value?: number }) => {
                      if (props.index !== lastIdx || props.value == null || props.value === 0) return <g />;
                      return (
                        <text
                          x={(props.x ?? 0) + 10}
                          y={(props.y ?? 0) + 4}
                          fontSize={12}
                          fontWeight={700}
                          fill={color}
                          textAnchor="start"
                        >
                          {shortName}
                        </text>
                      );
                    }}
                  />
                );
              })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Main table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
          <Users className="w-4 h-4" style={{ color: 'var(--nmbu-green-dark)' }} />
          <h3 style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>Søkertall 2026 og poenggrenser</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              {/* Group labels row */}
              <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
                <th colSpan={2} />
                <th
                  colSpan={4}
                  className="px-4 py-1 text-center"
                  style={{ borderLeft: '1px solid var(--nmbu-neutral-3)', borderRight: '1px solid var(--nmbu-neutral-3)' }}
                >
                  <span style={{
                    display: 'inline-block',
                    background: 'var(--nmbu-green-dark)',
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    borderRadius: 99,
                    padding: '2px 8px',
                  }}>
                    Søkertall 2026
                  </span>
                </th>
                <th colSpan={1} />
                <th
                  colSpan={ADMISSION_YEARS.length}
                  className="px-4 py-1 text-center"
                  style={{ borderLeft: '1px solid var(--nmbu-neutral-3)', borderRight: '1px solid var(--nmbu-neutral-3)' }}
                >
                  <span style={{
                    display: 'inline-block',
                    background: 'var(--nmbu-neutral-3)',
                    color: 'var(--nmbu-neutral-1)',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    borderRadius: 99,
                    padding: '2px 8px',
                  }}>
                    Poenggrenser
                  </span>
                </th>
                <th
                  colSpan={1}
                  className="px-4 py-1 text-center"
                  style={{ borderLeft: '1px solid var(--nmbu-neutral-3)' }}
                >
                  <span style={{
                    display: 'inline-block',
                    background: '#DBEAFE',
                    color: '#1D4ED8',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    borderRadius: 99,
                    padding: '2px 8px',
                  }}>
                    Søkerpoeng (DBH-571)
                  </span>
                </th>
              </tr>
              {/* Column headers row */}
              <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                <th className="px-4 py-3 text-left min-w-[160px]" style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>Institusjon</th>
                <th className="px-4 py-3 text-left text-xs min-w-[110px]" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Studiekode</th>
                <th className="px-4 py-3 text-center text-xs min-w-[80px]" style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>Alle<br/>søkere</th>
                <th className="px-4 py-3 text-center text-xs min-w-[80px]" style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>1. valg<br/>søkere</th>
                <th className="px-4 py-3 text-center text-xs min-w-[60px]" style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>Plasser</th>
                <th className="px-4 py-3 text-center text-xs min-w-[110px]" style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>Konkurranse<br/>(1.valg / plass)</th>
                <th className="px-2 py-3" style={{ borderLeft: '1px solid var(--nmbu-neutral-3)' }} />
                {ADMISSION_YEARS.map((y) => (
                  <th key={y} className="px-4 py-3 text-center text-xs min-w-[68px]" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 600 }}>{y}</th>
                ))}
                <th className="px-4 py-3 text-center text-xs" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Trend</th>
                <th
                  className="px-4 py-3 text-center text-xs min-w-[80px]"
                  style={{ borderLeft: '1px solid var(--nmbu-neutral-3)', color: '#1D4ED8', fontWeight: 600 }}
                  title="Gjennomsnittlige opptakspoeng for alle søkere (DBH tabell 571) — ikke bare de som ble tatt opp"
                >
                  Snitt poeng<br />søkere
                </th>
              </tr>
            </thead>
            <tbody>
              {ADMISSION_DATA.map((entry) => {
                const uni = UNIVERSITY_INFO[entry.universityId];
                const vals = ADMISSION_YEARS.map((y) => entry.years[y]?.[quota] ?? null);
                const isPrivate = vals.every((v) => v === null);
                const app = entry.applicants2026;
                const isComposite = !!entry.campuses?.length;
                const isExpanded = expandedIds.has(entry.universityId);

                return (
                  <tr key={entry.universityId}
                    className={`transition-colors ${isPrivate ? 'opacity-50' : ''}`}
                    style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', verticalAlign: 'top' }}
                    onMouseOver={!isPrivate ? (e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--nmbu-beige-light)'; } : undefined}
                    onMouseOut={!isPrivate ? (e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = ''; } : undefined}
                  >
                    {/* Institution cell */}
                    <td className="px-4 py-3" style={{ minWidth: 160 }}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span style={{ color: 'var(--nmbu-neutral)', fontWeight: 500 }}>{uni?.shortName ?? entry.universityId}</span>
                        {uni?.accreditations && <AccreditationBadge accreditations={uni.accreditations} />}
                        {isComposite && (
                          <button
                            onClick={() => toggleExpand(entry.universityId)}
                            title={isExpanded ? 'Skjul studiesteder' : 'Vis studiesteder'}
                            style={{
                              fontSize: 10, lineHeight: 1, padding: '1px 5px', borderRadius: 4,
                              border: '1px solid var(--nmbu-neutral-3)', background: 'transparent',
                              color: 'var(--nmbu-neutral-2)', cursor: 'pointer',
                            }}
                          >
                            {isExpanded ? '▲' : '▼'}
                          </button>
                        )}
                      </div>
                      {isComposite && (
                        <div style={{ fontSize: 10, color: '#8b6f00', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <span>ⓘ</span><span>Stipulert institusjonssnitt</span>
                        </div>
                      )}
                      <div className="mt-1">
                        <ReputationBadge universityId={entry.universityId} />
                      </div>
                      {isComposite && isExpanded && <CampusTable campuses={entry.campuses!} />}
                    </td>

                    {/* Study code */}
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
                      <div>{entry.studyCode}</div>
                      <div className="leading-tight" style={{ color: 'var(--nmbu-neutral-3)' }}>{entry.programName}</div>
                    </td>

                    {/* Søkertall columns */}
                    <td className="px-4 py-3 text-center">
                      {app
                        ? <><span style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>{app.total.toLocaleString('nb-NO')}</span>
                            {isComposite && <div style={{ fontSize: 9, color: '#8b6f00' }}>samlet</div>}</>
                        : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {app
                        ? <><span style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>{app.firstChoice.toLocaleString('nb-NO')}</span>
                            {isComposite && <div style={{ fontSize: 9, color: '#8b6f00' }}>samlet</div>}</>
                        : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {app
                        ? <><span style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 500 }}>{app.spots}</span>
                            {isComposite && <div style={{ fontSize: 9, color: '#8b6f00' }}>samlet</div>}</>
                        : <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                    </td>

                    {/* Competition bar — uses stipulated søkerpress for composite entries */}
                    <td className="px-4 py-3">
                      {app
                        ? <CompetitionBar
                            firstChoice={app.firstChoice}
                            spots={app.spots}
                            stipulated={entry.stipulatedSokerpress}
                          />
                        : <span className="text-xs text-center block" style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>}
                    </td>

                    <td className="px-0" style={{ borderLeft: '1px solid var(--nmbu-neutral-3)' }} />

                    {/* Poenggrense columns */}
                    {vals.map((v, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {isPrivate
                          ? <span className="text-xs" style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>
                          : v === 0
                          ? <span className="inline-block px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-6)' }}>Alle inn</span>
                          : v === null
                          ? <span style={{ color: 'var(--nmbu-neutral-2)' }}>–</span>
                          : <span style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>{v.toFixed(1)}</span>}
                      </td>
                    ))}

                    {/* Trend */}
                    <td className="px-4 py-3 text-center">
                      {!isPrivate && (
                        <div className="flex justify-center">
                          <TrendIcon current={entry.years['2026']?.[quota] ?? null} prev={entry.years['2025']?.[quota] ?? null} />
                        </div>
                      )}
                    </td>

                    {/* DBH-571 snitt søkerpoeng (statisk fra CSV) */}
                    <td className="px-4 py-3 text-center" style={{ borderLeft: '1px solid var(--nmbu-neutral-3)' }}>
                      {(() => {
                        const d = getDBHSnitt(entry.studyCode);
                        if (!d) return <span style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>;
                        return (
                          <>
                            <span style={{ fontWeight: 600, color: '#1D4ED8' }}>{d.snitt.toFixed(1)}</span>
                            <div style={{ fontSize: 9, color: '#6B7280', marginTop: 1 }}>{d.year}</div>
                            {d.antall !== null && (
                              <div style={{ fontSize: 9, color: '#9CA3AF' }}>n={d.antall.toLocaleString('nb-NO')}</div>
                            )}
                          </>
                        );
                      })()}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend for competition bar */}
        <div className="px-6 py-3 flex flex-wrap gap-4 text-xs" style={{ borderTop: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded inline-block" style={{ backgroundColor: 'var(--nmbu-green)' }} /> Under 1,5× — lav konkurranse</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded inline-block" style={{ backgroundColor: 'var(--nmbu-green-2)' }} /> 1,5–3× — moderat</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded inline-block" style={{ backgroundColor: '#c2963a' }} /> 3–6× — høy</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded inline-block" style={{ backgroundColor: '#9b3a3a' }} /> Over 6× — svært høy</span>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        {ADMISSION_DATA.filter((d) => d.note).map((entry) => (
          <div key={entry.universityId} className="flex items-start gap-2 text-xs rounded-lg px-4 py-2.5" style={{ color: 'var(--nmbu-neutral-1)', backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)' }}>
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--nmbu-neutral-2)' }} />
            <span><span style={{ fontWeight: 500 }}>{UNIVERSITY_INFO[entry.universityId]?.shortName}:</span> {entry.note}</span>
          </div>
        ))}
        <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-2.5" style={{ color: '#8a6200', backgroundColor: '#fef4e0', border: '1px solid #d4b47a' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#c2963a' }} />
          <span>
            <span style={{ fontWeight: 500 }}>Merk:</span> Søkertall er per april 2026, før tilbud gis. Poenggrenser 2026 er offisielle tall fra Samordna Opptak (23. juli 2026).
            Poenggrense = 0 betyr at alle kvalifiserte søkere kom inn.
            BI og Kristiania er private institusjoner med eget opptakssystem.
          </span>
        </div>
        <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-2.5" style={{ color: '#1E3A8A', backgroundColor: '#EFF6FF', border: '1px solid #93C5FD' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#3B82F6' }} />
          <span>
            <span style={{ fontWeight: 500 }}>Søkerpoeng (DBH-571):</span> Gjennomsnittlige opptakspoeng for <em>alle søkere</em> (ikke bare de som ble tatt opp) til ØA-programmet.
            Kilde: Statistikkdatabasen for høyere utdanning (DBH/HKDIR), tabell 571. Viser siste tilgjengelige år (maks 2025). Data lastet fra vedlagt CSV-fil.
          </span>
        </div>
        <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-2.5" style={{ color: 'var(--nmbu-neutral-1)', backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--nmbu-neutral-2)' }} />
          <span>
            <span style={{ fontWeight: 500 }}>⭐ Omdømmemåling:</span> Khrono / Apeland / Norstat — Traction Utdanning 2026.
            22 institusjoner, skala 0–100 (tillit, sympati, imponert).{' '}
            <a href="https://www.khrono.no/forsvarets-hogskole-og-ntnu-har-best-omdomme/1061884"
              target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-0.5" style={{ color: 'var(--nmbu-green)' }}>
              Les artikkelen <ExternalLink className="w-3 h-3" />
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
