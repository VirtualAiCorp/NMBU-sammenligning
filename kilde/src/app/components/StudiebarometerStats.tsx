import { useState, useRef, useEffect, useCallback } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
} from 'recharts';
import { Info, ExternalLink, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  STUDIEBAROMETER_BY_YEAR, SUBQUESTION_SCORES_BY_YEAR,
  SCORE_LABELS, RADAR_KEYS, DIMENSION_SUBQUESTIONS,
} from '../data/studiebarometerData';
import type { DimensionKey, SurveyYear, StudiebarometerEntry } from '../data/studiebarometerData';
import { UNIVERSITY_INFO } from '../data/courseMapping';
import { AccreditationBadge } from './AccreditationBadge';

// NMBU brand palette
const COLORS = [
  '#025c4f', '#009a81', '#247761', '#46b4a0',
  '#53143a', '#8bcec0', '#5c4a1e', '#7a4f6d',
  '#4d4d4d', '#46b4a0',
];

function scoreColor(value: number): string {
  if (value >= 4) return '#025c4f';
  if (value >= 3.5) return '#247761';
  if (value >= 3) return '#c2963a';
  return '#9b3a3a';
}

function ScoreBar({ value, max = 5 }: { value: number | null; max?: number }) {
  if (value === null) return <span className="text-xs" style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>;
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: scoreColor(value) }} />
      </div>
      <span className="text-xs w-6 text-right" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 500 }}>{value.toFixed(1)}</span>
    </div>
  );
}

function MiniScoreBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: scoreColor(value) }} />
      </div>
      <span className="text-xs w-5 text-right shrink-0" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 500 }}>{value.toFixed(1)}</span>
    </div>
  );
}

function ResponseRate({ respondents, invited }: { respondents: number; invited: number }) {
  if (invited === 0) return null;
  const pct = Math.round((respondents / invited) * 100);
  const color = pct >= 40 ? 'var(--nmbu-green-6)' : pct >= 25 ? '#c2963a' : '#9b3a3a';
  return (
    <span className="flex items-center gap-1 text-xs" style={{ color }}>
      <Users className="w-3 h-3" />
      {respondents}/{invited} ({pct}%)
    </span>
  );
}

// Delta badge shown in the detailed table when year comparison is active
function DeltaBadge({ current, prev }: { current: number | null; prev: number | null }) {
  if (current === null || prev === null) return null;
  const diff = parseFloat((current - prev).toFixed(1));
  if (Math.abs(diff) < 0.05) return <Minus className="w-3 h-3 inline" style={{ color: 'var(--nmbu-neutral-3)' }} />;
  const up = diff > 0;
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] ml-1" style={{ color: up ? 'var(--nmbu-green-6)' : '#9b3a3a', fontWeight: 600 }}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{diff.toFixed(1)}
    </span>
  );
}

interface TooltipState {
  universityId: string;
  dimension: DimensionKey;
  x: number;
  y: number;
  side: 'left' | 'right';
}

function DimensionTooltip({
  tooltip,
  subquestionScores,
}: {
  tooltip: TooltipState;
  subquestionScores: Record<string, Record<DimensionKey, number[]>>;
}) {
  const subQuestions = DIMENSION_SUBQUESTIONS[tooltip.dimension];
  const uniScores = subquestionScores[tooltip.universityId]?.[tooltip.dimension];
  const tooltipWidth = 300;
  const left = tooltip.side === 'right' ? tooltip.x : tooltip.x - tooltipWidth;

  return (
    <div
      className="fixed z-50 bg-white rounded-xl pointer-events-none p-3"
      style={{ top: tooltip.y, left, width: tooltipWidth, border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 4px 20px rgba(2,92,79,0.12)' }}
    >
      <div className="text-xs pb-1.5 mb-2" style={{ color: 'var(--nmbu-green-dark)', fontWeight: 600, borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
        {SCORE_LABELS[tooltip.dimension]}
      </div>
      <div className="space-y-2">
        {subQuestions.map((q, i) => (
          <div key={i}>
            <div className="text-xs leading-tight mb-0.5" style={{ color: 'var(--nmbu-neutral-2)' }}>{q}</div>
            {uniScores ? (
              <MiniScoreBar value={uniScores[i]} />
            ) : (
              <span className="text-xs" style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DimensionCellProps {
  universityId: string;
  dimension: DimensionKey;
  value: number | null;
  onHover: (state: TooltipState | null) => void;
  subquestionScores: Record<string, Record<DimensionKey, number[]>>;
}

function DimensionCell({ universityId, dimension, value, onHover, subquestionScores }: DimensionCellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasSubQuestions = !!subquestionScores[universityId]?.[dimension];

  const handleMouseEnter = () => {
    if (!ref.current || !hasSubQuestions) return;
    const rect = ref.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const tooltipWidth = 300;
    const spaceRight = viewportWidth - rect.right;
    const side = spaceRight >= tooltipWidth + 8 ? 'right' : 'left';
    onHover({
      universityId,
      dimension,
      x: side === 'right' ? rect.right + 8 : rect.left - 8,
      y: rect.top,
      side,
    });
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => onHover(null)}
      className={hasSubQuestions ? 'cursor-help rounded p-0.5 -m-0.5 transition-colors' : ''}
      onMouseOver={hasSubQuestions ? (e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--nmbu-green-4)'; } : undefined}
      onMouseOut={hasSubQuestions ? (e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = ''; } : undefined}
    >
      <div className="text-xs mb-0.5 flex items-center gap-1" style={{ color: 'var(--nmbu-neutral-2)' }}>
        {SCORE_LABELS[dimension]}
        {hasSubQuestions && <span className="text-[10px]" style={{ color: 'var(--nmbu-green-3)' }}>▸</span>}
      </div>
      <ScoreBar value={value} />
    </div>
  );
}

export function StudiebarometerStats() {
  const [selectedYear, setSelectedYear] = useState<SurveyYear>('2025');

  const allData = STUDIEBAROMETER_BY_YEAR[selectedYear];
  const subquestionScores = SUBQUESTION_SCORES_BY_YEAR[selectedYear];
  const prevYearData = selectedYear === '2025' ? STUDIEBAROMETER_BY_YEAR['2024'] : null;

  const publicData = allData.filter((d) => d.scores.helhetsvurdering !== null);
  const privateData = allData.filter((d) => d.scores.helhetsvurdering === null);

  const [selectedCampuses, setSelectedCampuses] = useState<string[]>(
    () => publicData.slice(0, 4).map((d) => d.campus)
  );
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const handleHover = useCallback((state: TooltipState | null) => {
    setTooltip(state);
  }, []);

  // Reset radar selection when year changes
  useEffect(() => {
    setSelectedCampuses(publicData.slice(0, 4).map((d) => d.campus));
    setTooltip(null);
  }, [selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const dismiss = () => setTooltip(null);
    window.addEventListener('scroll', dismiss, true);
    return () => window.removeEventListener('scroll', dismiss, true);
  }, []);

  const toggleCampus = (campus: string) => {
    setSelectedCampuses((prev) =>
      prev.includes(campus) ? prev.filter((x) => x !== campus) : [...prev, campus]
    );
  };

  const getPrevEntry = (campus: string): StudiebarometerEntry | undefined =>
    prevYearData?.find((d) => d.campus === campus);

  const selectedData = publicData.filter((d) => selectedCampuses.includes(d.campus));

  const barData = [...publicData]
    .sort((a, b) => (b.scores.helhetsvurdering ?? 0) - (a.scores.helhetsvurdering ?? 0))
    .map((d) => ({
      name: d.campus,
      score: d.scores.helhetsvurdering,
      id: d.campus,
    }));

  const radarData = RADAR_KEYS.map((key) => {
    const row: Record<string, string | number> = { subject: SCORE_LABELS[key] };
    selectedData.forEach((d) => {
      row[d.campus] = d.scores[key] ?? 0;
    });
    return row;
  });

  const YEARS: SurveyYear[] = ['2025', '2024'];

  return (
    <div className="space-y-6">
      {tooltip && <DimensionTooltip tooltip={tooltip} subquestionScores={subquestionScores} />}

      {/* Header */}
      <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Studiebarometeret</h2>
            <p className="text-sm max-w-2xl" style={{ color: 'var(--nmbu-neutral-1)' }}>
              Studentenes tilfredshet med studiet. Nasjonal spørreundersøkelse, skala 1–5.
              Hold markøren over en dimensjon for å se underspørsmålene.
            </p>
          </div>
          <a
            href="https://studiebarometeret.no/no/student/finn?p=1&i=0&s=0&f=64&g=0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs hover:underline shrink-0"
            style={{ color: 'var(--nmbu-green)' }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            studiebarometeret.no
          </a>
        </div>

        {/* Year tabs */}
        <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
          <span className="text-xs self-center" style={{ color: 'var(--nmbu-neutral-2)' }}>Undersøkelsesår:</span>
          {YEARS.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className="px-4 py-1.5 rounded-full text-sm transition-all"
              style={selectedYear === y
                ? { backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', fontWeight: 500 }
                : { backgroundColor: 'var(--nmbu-beige)', color: 'var(--nmbu-neutral-1)' }
              }
            >
              {y}
              {y === '2025' && <span className="ml-1.5 text-[10px] opacity-75">(siste)</span>}
            </button>
          ))}
          {selectedYear === '2025' && (
            <span className="self-center text-xs ml-2" style={{ color: 'var(--nmbu-neutral-2)' }}>
              ↕ tallene viser endring fra 2024
            </span>
          )}
        </div>
      </div>

      {/* Overall bar chart */}
      <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <h3 className="text-lg mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Helhetsvurdering</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--nmbu-neutral-2)' }}>Skala 1–5 · Sortert fallende · {selectedYear}-undersøkelsen</p>
        <ResponsiveContainer width="100%" height={Math.max(260, barData.length * 42)}>
          <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 60, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--nmbu-neutral-3)" />
            <XAxis type="number" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: 'var(--nmbu-neutral-2)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--nmbu-neutral)' }} width={140} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => `${v.toFixed(1)} / 5`} contentStyle={{ border: '1px solid var(--nmbu-green-3)', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {barData.map((entry, i) => (
                <Cell key={entry.id} fill={COLORS[i % COLORS.length]} />
              ))}
              <LabelList
                dataKey="score"
                position="right"
                formatter={(v: number) => v.toFixed(1)}
                style={{ fontSize: 12, fontWeight: 600, fill: 'var(--nmbu-neutral)' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar comparison */}
      <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <h3 className="text-lg mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>Sammenlign dimensjoner</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--nmbu-neutral-2)' }}>Velg opptil 4 institusjoner · {selectedYear}-undersøkelsen</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {publicData.map((d, idx) => {
            const active = selectedCampuses.includes(d.campus);
            const colorIdx = idx % COLORS.length;
            return (
              <button
                key={d.campus}
                onClick={() => toggleCampus(d.campus)}
                disabled={!active && selectedCampuses.length >= 4}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={active
                  ? { backgroundColor: COLORS[colorIdx], borderColor: COLORS[colorIdx], color: '#fff' }
                  : { backgroundColor: '#fff', color: 'var(--nmbu-neutral-1)', borderColor: 'var(--nmbu-neutral-3)' }
                }
              >
                {d.campus}
              </button>
            );
          })}
        </div>

        <ResponsiveContainer width="100%" height={360}>
          <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="var(--nmbu-neutral-3)" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#4d4d4d' }} />
            <PolarRadiusAxis domain={[1, 5]} tickCount={5} tick={{ fontSize: 10, fill: '#999' }} />
            {selectedData.map((d) => {
              const colorIdx = publicData.indexOf(d) % COLORS.length;
              return (
                <Radar
                  key={d.campus}
                  name={d.campus}
                  dataKey={d.campus}
                  stroke={COLORS[colorIdx]}
                  fill={COLORS[colorIdx]}
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              );
            })}
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>

        <div className="flex flex-wrap gap-4 justify-center mt-2">
          {selectedData.map((d) => {
            const colorIdx = publicData.indexOf(d) % COLORS.length;
            return (
              <span key={d.campus} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--nmbu-neutral-1)' }}>
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: COLORS[colorIdx] }} />
                {d.campus}
              </span>
            );
          })}
        </div>
      </div>

      {/* Detailed table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                <th className="px-4 py-3 text-left sticky left-0 min-w-[140px]" style={{ backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral)', fontWeight: 600 }}>Institusjon</th>
                <th className="px-4 py-3 text-center min-w-[80px]" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 600 }} title="Helhetsvurdering">
                  Helhets-<br/>vurdering
                  {selectedYear === '2025' && <div className="text-[10px] font-normal" style={{ color: 'var(--nmbu-neutral-2)' }}>vs. 2024</div>}
                </th>
                <th className="px-4 py-3 text-left text-xs min-w-[480px]" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 600 }}>
                  Dimensjoner (skala 1–5)
                  <span className="ml-2" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 400 }}>· hold markøren over for underspørsmål</span>
                </th>
                <th className="px-4 py-3 text-center text-xs min-w-[110px]" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Svarprosent</th>
              </tr>
            </thead>
            <tbody>
              {[...publicData]
                .sort((a, b) => (b.scores.helhetsvurdering ?? 0) - (a.scores.helhetsvurdering ?? 0))
                .map((entry) => {
                  const uni = UNIVERSITY_INFO[entry.universityId];
                  const helhv = entry.scores.helhetsvurdering;
                  const prev = getPrevEntry(entry.campus);
                  const badgeStyle: React.CSSProperties = helhv !== null && helhv >= 4.2
                    ? { backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }
                    : helhv !== null && helhv >= 3.8
                    ? { backgroundColor: 'var(--nmbu-green-light)', color: 'var(--nmbu-green-6)' }
                    : helhv !== null && helhv >= 3.5
                    ? { backgroundColor: '#fef4e0', color: '#8a6200' }
                    : { backgroundColor: '#fdecea', color: '#7a2020' };
                  return (
                    <tr
                      key={entry.campus}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}
                      onMouseOver={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--nmbu-beige-light)'; }}
                      onMouseOut={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = ''; }}
                    >
                      <td className="px-4 py-3 sticky left-0 bg-white">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span style={{ color: 'var(--nmbu-neutral)', fontWeight: 500 }}>{uni?.shortName ?? entry.universityId}</span>
                          {uni?.accreditations && <AccreditationBadge accreditations={uni.accreditations} />}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--nmbu-neutral-2)' }}>{entry.campus}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2 py-1 rounded text-sm" style={{ fontWeight: 700, ...badgeStyle }}>
                          {helhv !== null ? helhv.toFixed(1) : '–'}
                        </span>
                        {selectedYear === '2025' && prev && (
                          <div className="mt-0.5">
                            <DeltaBadge current={helhv} prev={prev.scores.helhetsvurdering} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                          {RADAR_KEYS.map((key) => (
                            <DimensionCell
                              key={key}
                              universityId={entry.universityId}
                              dimension={key}
                              value={entry.scores[key]}
                              onHover={handleHover}
                              subquestionScores={subquestionScores}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ResponseRate respondents={entry.respondents} invited={entry.invited} />
                      </td>
                    </tr>
                  );
                })}
              {privateData.map((entry) => {
                const uni = UNIVERSITY_INFO[entry.universityId];
                return (
                  <tr key={entry.campus} className="opacity-45" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: 'var(--nmbu-neutral)', fontWeight: 500 }}>{uni?.shortName ?? entry.universityId}</span>
                        {uni?.accreditations && <AccreditationBadge accreditations={uni.accreditations} />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>–</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>{entry.note}</td>
                    <td className="px-4 py-3" />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        {allData.filter((d) => d.note && (d.scores.helhetsvurdering !== null || d.respondents > 0)).map((entry) => (
          <div key={entry.campus} className="flex items-start gap-2 text-xs rounded-lg px-4 py-2.5" style={{ color: 'var(--nmbu-neutral-1)', backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)' }}>
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--nmbu-neutral-2)' }} />
            <span>
              <span style={{ fontWeight: 500 }}>{UNIVERSITY_INFO[entry.universityId]?.shortName}:</span> {entry.note}
            </span>
          </div>
        ))}
        <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-2.5" style={{ color: 'var(--nmbu-green-6)', backgroundColor: 'var(--nmbu-green-light)', border: '1px solid var(--nmbu-green-3)' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--nmbu-green-2)' }} />
          <span>
            Svarprosent under 30% bør tolkes med forsiktighet. Studiebarometeret dekker ikke private høyskoler (BI, Kristiania).
          </span>
        </div>
      </div>
    </div>
  );
}
