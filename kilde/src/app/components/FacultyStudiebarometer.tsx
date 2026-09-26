import { useMemo, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Star, ExternalLink, Filter, Info, AlertTriangle } from 'lucide-react';
import { CsvExportButton } from './CsvExportButton';
import { exportFacultyStudiebarometerCsv } from '../utils/csvExport';
import { INGEN_DATA_TEKST, type FacultyData } from '../data/faculties';
import type { SbDimension, SbEntry } from '../data/landsamStudiebarometerData';
import { SB_DIMENSION_LABELS } from '../data/landsamStudiebarometerData';
import { landsamColorForGroups } from '../data/landsamPalette';
import type { LandsamGroup, LandsamLevel } from '../data/landsamAdmissionData';

// Norsk tallformat (desimalkomma)
function nf(v: number, dec = 1): string {
  return v.toLocaleString('nb-NO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

const LEVEL_LABEL: Record<LandsamLevel, string> = {
  bachelor: 'Bachelor',
  master5:  'Femårig master',
  master2:  'Toårig master',
  aarsstudium: 'Årsstudium',
};

/** De sju dimensjonene som vises i radaren (helhetsvurdering står for seg selv). */
const RADAR_DIMENSIONS: SbDimension[] = [
  'undervisning', 'tilbakemeldinger', 'vurderingsformer', 'laeringsmiljo',
  'organisering', 'yrkesrelevans', 'engasjement',
];

/** Alle dimensjonene, i rekkefølgen de vises i «Dimensjoner». */
const ALL_DIMENSIONS: SbDimension[] = [...RADAR_DIMENSIONS, 'helhetsvurdering'];

const FIELD_COLOR = '#8A8A8A';

/** Et program teller som «har tall» når helhetsvurderingen finnes. */
const harTall = (e: SbEntry): boolean => e.scores.helhetsvurdering != null;

function scoreColor(v: number): string {
  if (v >= 4.2) return '#025C4F';
  if (v >= 3.8) return '#247761';
  if (v >= 3.4) return '#C2963A';
  return '#9B3A3A';
}

/** Verdimerke i samme stil som chips-ene ellers i appen. */
function ScoreChip({ value, muted = false }: { value: number | null; muted?: boolean }) {
  if (value == null) {
    return <span className="text-xs" style={{ color: 'var(--nmbu-neutral-3)' }}>–</span>;
  }
  const col = muted ? FIELD_COLOR : scoreColor(value);
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-xs text-center"
      style={{ backgroundColor: col + '18', color: col, fontWeight: 700, minWidth: 38 }}
    >
      {nf(value, 1)}
    </span>
  );
}

// ─── Institusjonsvelger ───────────────────────────────────────────────────────

function InstitutionPicker({
  group, entries, selected, onChange, colorFor,
}: {
  group: LandsamGroup | undefined;
  entries: SbEntry[];
  selected: string[];
  onChange: (ids: string[]) => void;
  colorFor: (id: string) => string;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
      <div
        className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap"
        style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)' }}
      >
        <div className="flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>
          <Filter className="w-3.5 h-3.5" /> Velg studieprogram
        </div>
        {group && (
          <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>
            {LEVEL_LABEL[group.level]}
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        {entries.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>Ingen programmer med tall i denne gruppen</span>
        )}
        {entries.map((e) => {
          const active = selected.includes(e.entryId);
          const col = colorFor(e.entryId);
          return (
            <button
              key={e.entryId}
              onClick={() => toggle(e.entryId)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all w-full"
              style={{
                backgroundColor: active ? col : 'var(--nmbu-beige-light)',
                color: active ? '#fff' : 'var(--nmbu-neutral-1)',
                border: `1.5px solid ${active ? col : e.isNmbu ? 'var(--nmbu-green-3)' : 'var(--nmbu-neutral-3)'}`,
                fontWeight: active ? 600 : 400,
              }}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: active ? '#fff' : col, opacity: active ? 0.9 : 1 }} />
              <div className="flex-1 min-w-0">
                <div>{e.shortName}{e.isNmbu ? ' ★' : ''}</div>
                <div style={{ fontSize: 10, opacity: 0.75, fontWeight: 400 }}>{e.programnavn}</div>
              </div>
              {e.url && (
                <a
                  href={e.url} target="_blank" rel="noopener noreferrer" title="Åpne programsiden på studiebarometeret.no"
                  onClick={(ev) => ev.stopPropagation()}
                  className="shrink-0 rounded-md p-1 hover:opacity-100"
                  style={{ opacity: 0.7, color: active ? '#fff' : 'var(--nmbu-green)' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── NMBU-nøkkeltall i overskriftskortet ──────────────────────────────────────

function NmbuKeyFigures({ entries }: { entries: SbEntry[] }) {
  const nmbu = entries.filter((e) => e.isNmbu && harTall(e));
  if (nmbu.length === 0) return null;

  return (
    <>
      {nmbu.map((e) => {
        const forrige = [...e.history]
          .filter((h) => h.year !== e.latestYear && h.scores.helhetsvurdering != null)
          .sort((a, b) => b.year - a.year)[0] ?? null;
        const helhet = e.scores.helhetsvurdering;
        const diff = helhet != null && forrige?.scores.helhetsvurdering != null
          ? helhet - forrige.scores.helhetsvurdering
          : null;
        const fagfelt = e.fieldAverage.helhetsvurdering;

        const highlights: { label: string; value: string; sub?: string; delta: string | null }[] = [
          {
            label: 'Helhetsvurdering',
            value: helhet != null ? `${nf(helhet, 1)} / 5` : '–',
            sub: fagfelt != null ? `Fagfeltsnitt ${nf(fagfelt, 1)}` : undefined,
            delta: diff != null ? `${diff >= 0 ? '+' : '−'}${nf(Math.abs(diff), 1)} vs. ${forrige!.year}` : null,
          },
          {
            label: 'Svar',
            value: e.respondents != null ? e.respondents.toLocaleString('nb-NO') : '–',
            sub: e.responseRate != null ? `${nf(e.responseRate, 1)} % svarprosent` : undefined,
            delta: null,
          },
          {
            label: 'Fagfelt',
            value: e.fieldLabel ? e.fieldLabel.replace(/^Av alle\s*/i, '') : '–',
            sub: 'Sammenligningsgrunnlag',
            delta: null,
          },
        ];

        return (
          <div key={e.entryId} className="mx-6 mb-5 rounded-xl px-5 py-4" style={{ backgroundColor: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6EE7B7' }} />
              <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                {e.shortName} · {e.programnavn}{e.latestYear ? ` · Nøkkeltall ${e.latestYear}` : ''}
              </span>
            </div>
            <div className="flex gap-8 flex-wrap">
              {highlights.map((s) => (
                <div key={s.label} style={{ maxWidth: 260 }}>
                  <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.15 }}>{s.value}</div>
                  {s.sub && <div style={{ fontSize: 9, opacity: 0.55, marginTop: 2 }}>{s.sub}</div>}
                  {s.delta != null && (
                    <div style={{ fontSize: 10, marginTop: 3, fontWeight: 600, color: s.delta.startsWith('−') ? '#FCA5A5' : '#6EE7B7' }}>
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

// ─── Fanene i hovedkolonnen ───────────────────────────────────────────────────

function RadarPanel({ entries, colorFor }: { entries: SbEntry[]; colorFor: (id: string) => string }) {
  const fagfelt = entries.find((e) => e.fieldLabel && RADAR_DIMENSIONS.some((d) => e.fieldAverage[d] != null));

  const data = RADAR_DIMENSIONS.map((d) => {
    const rad: Record<string, string | number | null> = { dim: SB_DIMENSION_LABELS[d] };
    entries.forEach((e) => { rad[e.entryId] = e.scores[d]; });
    if (fagfelt) rad.__fagfelt = fagfelt.fieldAverage[d];
    return rad;
  });

  if (entries.length === 0) {
    return <div className="p-8 text-center" style={{ fontSize: 13, color: 'var(--nmbu-neutral-2)' }}>Velg minst ett studieprogram til venstre.</div>;
  }

  return (
    <div className="p-5">
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data} margin={{ top: 16, right: 40, bottom: 16, left: 40 }}>
          <PolarGrid stroke="var(--nmbu-neutral-3)" />
          <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: 'var(--nmbu-neutral-1)' }} />
          <PolarRadiusAxis domain={[1, 5]} tickCount={5} tick={{ fontSize: 10, fill: 'var(--nmbu-neutral-2)' }} />
          {entries.map((e) => (
            <Radar
              key={e.entryId}
              name={`${e.shortName}${e.isNmbu ? ' ★' : ''}`}
              dataKey={e.entryId}
              stroke={colorFor(e.entryId)}
              fill={colorFor(e.entryId)}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
          {fagfelt && (
            <Radar
              name={fagfelt.fieldLabel ?? 'Fagfeltsnitt'}
              dataKey="__fagfelt"
              stroke={FIELD_COLOR}
              fill={FIELD_COLOR}
              fillOpacity={0}
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />
          )}
          <Tooltip formatter={(v: number | null) => (v == null ? '–' : `${nf(v, 1)} / 5`)}
            contentStyle={{ border: '1px solid var(--nmbu-green-3)', borderRadius: 8, fontSize: 12 }} />
        </RadarChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-4 justify-center mt-2">
        {entries.map((e) => (
          <span key={e.entryId} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--nmbu-neutral-1)' }}>
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: colorFor(e.entryId) }} />
            {e.shortName}{e.isNmbu ? ' ★' : ''}
          </span>
        ))}
        {fagfelt && (
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
            <span className="inline-block" style={{ width: 14, borderTop: `2px dashed ${FIELD_COLOR}` }} />
            {fagfelt.fieldLabel ?? 'Fagfeltsnitt'}
          </span>
        )}
      </div>
    </div>
  );
}

function DimensionsPanel({ entries, colorFor }: { entries: SbEntry[]; colorFor: (id: string) => string }) {
  if (entries.length === 0) {
    return <div className="p-8 text-center" style={{ fontSize: 13, color: 'var(--nmbu-neutral-2)' }}>Velg minst ett studieprogram til venstre.</div>;
  }

  return (
    <div className="p-5 space-y-5">
      {ALL_DIMENSIONS.map((d) => (
        <div key={d}>
          <div className="flex items-baseline gap-2 mb-2">
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{SB_DIMENSION_LABELS[d]}</span>
            <span style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>skala 1–5 · stiplet strek = fagfeltsnitt</span>
          </div>
          <div className="space-y-1.5">
            {entries.map((e) => {
              const v = e.scores[d];
              const snitt = e.fieldAverage[d];
              const bredde = v != null ? ((v - 1) / 4) * 100 : 0;
              const snittPos = snitt != null ? ((snitt - 1) / 4) * 100 : null;
              return (
                <div key={e.entryId} className="flex items-center gap-3">
                  <div className="shrink-0 truncate" style={{ width: 150, fontSize: 11, color: 'var(--nmbu-neutral-1)', fontWeight: e.isNmbu ? 600 : 400 }}
                    title={`${e.shortName} · ${e.programnavn}`}>
                    {e.shortName}{e.isNmbu ? ' ★' : ''}
                  </div>
                  <div className="flex-1 relative h-3.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)' }}>
                    <div className="h-full rounded-full" style={{ width: `${bredde}%`, backgroundColor: colorFor(e.entryId), opacity: v != null ? 0.85 : 0 }} />
                    {snittPos != null && (
                      <div
                        className="absolute top-0 bottom-0"
                        title={`Fagfeltsnitt ${nf(snitt!, 1)}${e.fieldLabel ? ` · ${e.fieldLabel}` : ''}`}
                        style={{ left: `calc(${snittPos}% - 1px)`, width: 2, backgroundColor: FIELD_COLOR, opacity: 0.85 }}
                      />
                    )}
                  </div>
                  <div className="shrink-0 text-right" style={{ width: 46 }}>
                    <ScoreChip value={v} />
                  </div>
                  <div className="shrink-0 text-right" style={{ width: 38, fontSize: 10, color: FIELD_COLOR }}>
                    {snitt != null ? nf(snitt, 1) : '–'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendPanel({ entries, colorFor }: { entries: SbEntry[]; colorFor: (id: string) => string }) {
  const years = useMemo(() => {
    const s = new Set<number>();
    entries.forEach((e) => e.history.forEach((h) => s.add(h.year)));
    return [...s].sort((a, b) => a - b);
  }, [entries]);

  const data = years.map((year) => {
    const rad: Record<string, number | null> = { year };
    entries.forEach((e) => {
      rad[e.entryId] = e.history.find((h) => h.year === year)?.scores.helhetsvurdering ?? null;
    });
    return rad;
  });

  if (entries.length === 0 || years.length === 0) {
    return <div className="p-8 text-center" style={{ fontSize: 13, color: 'var(--nmbu-neutral-2)' }}>Ingen tidsserie for de valgte programmene.</div>;
  }

  return (
    <div className="p-5">
      <p className="mb-3" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
        Helhetsvurdering per år — «Jeg er, alt i alt, tilfreds med studieprogrammet jeg går på».
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 10, right: 24, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-neutral-3)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--nmbu-neutral-2)' }} axisLine={false} tickLine={false} />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: 'var(--nmbu-neutral-2)' }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            formatter={(v: number | null) => (v == null ? '–' : `${nf(v, 1)} / 5`)}
            contentStyle={{ border: '1px solid var(--nmbu-green-3)', borderRadius: 8, fontSize: 12 }}
          />
          {entries.map((e) => (
            <Line
              key={e.entryId}
              type="monotone"
              dataKey={e.entryId}
              name={`${e.shortName}${e.isNmbu ? ' ★' : ''}`}
              stroke={colorFor(e.entryId)}
              strokeWidth={e.isNmbu ? 3 : 2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-4 justify-center mt-2">
        {entries.map((e) => (
          <span key={e.entryId} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--nmbu-neutral-1)' }}>
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: colorFor(e.entryId) }} />
            {e.shortName}{e.isNmbu ? ' ★' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

function SubquestionPanel({
  entries, valgtId, onVelg, colorFor,
}: {
  entries: SbEntry[];
  valgtId: string | null;
  onVelg: (id: string) => void;
  colorFor: (id: string) => string;
}) {
  const entry = entries.find((e) => e.entryId === valgtId) ?? entries[0];

  if (!entry) {
    return <div className="p-8 text-center" style={{ fontSize: 13, color: 'var(--nmbu-neutral-2)' }}>Velg minst ett studieprogram til venstre.</div>;
  }

  const dimensjoner = ALL_DIMENSIONS.filter((d) => (entry.subquestions[d]?.length ?? 0) > 0);

  return (
    <div className="p-5">
      {/* Programvelger — ett program om gangen */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {entries.map((e) => {
          const aktiv = e.entryId === entry.entryId;
          const col = colorFor(e.entryId);
          return (
            <button
              key={e.entryId}
              onClick={() => onVelg(e.entryId)}
              className="px-3 py-1 rounded-full text-xs transition-all"
              style={{
                backgroundColor: aktiv ? col : 'var(--nmbu-beige-light)',
                color: aktiv ? '#fff' : 'var(--nmbu-neutral-1)',
                border: `1px solid ${aktiv ? col : 'var(--nmbu-neutral-3)'}`,
                fontWeight: aktiv ? 600 : 400,
              }}
            >
              {e.shortName}{e.isNmbu ? ' ★' : ''}
            </button>
          );
        })}
      </div>

      <div className="mb-4" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
        {entry.institusjon} · {entry.programnavn}
        {entry.latestYear ? ` · ${entry.latestYear}` : ''}
        {entry.respondents != null ? ` · ${entry.respondents} svar` : ''}
        {entry.responseRate != null ? ` (${nf(entry.responseRate, 1)} %)` : ''}
      </div>

      {dimensjoner.length === 0 ? (
        <div className="rounded-lg px-4 py-3" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)' }}>
          Ingen delspørsmål publisert for dette programmet.
        </div>
      ) : (
        <div className="space-y-5">
          {dimensjoner.map((d) => {
            const snitt = entry.fieldAverage[d];
            return (
              <div key={d} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
                <div
                  className="px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap"
                  style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '1px solid var(--nmbu-neutral-3)' }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{SB_DIMENSION_LABELS[d]}</span>
                  <span className="flex items-center gap-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
                    Dimensjon <ScoreChip value={entry.scores[d]} />
                    {snitt != null && <>Fagfelt <ScoreChip value={snitt} muted /></>}
                  </span>
                </div>
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {entry.subquestions[d]!.map((q, i) => (
                      <tr key={i} style={{ borderTop: i === 0 ? undefined : '1px solid var(--nmbu-neutral-3)' }}>
                        <td className="px-4 py-2" style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)', lineHeight: 1.5 }}>{q.text}</td>
                        <td className="px-4 py-2 text-right" style={{ width: 80 }}><ScoreChip value={q.value} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Hovedkomponent ───────────────────────────────────────────────────────────

type MainTab = 'radar' | 'dimensjoner' | 'utvikling' | 'delsporsmal';

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: 'radar',        label: 'Radar' },
  { id: 'dimensjoner',  label: 'Dimensjoner' },
  { id: 'utvikling',    label: 'Utvikling' },
  { id: 'delsporsmal',  label: 'Delspørsmål' },
];

export function FacultyStudiebarometer({ faculty }: { faculty: FacultyData }) {
  const alle = faculty.studiebarometer;
  const colorFor = landsamColorForGroups(faculty.admissionGroups);

  /** Gruppene fra opptaksdataene, med Studiebarometer-innslagene koblet på. */
  const grupper = useMemo(() => {
    const kjente = faculty.admissionGroups.map((g) => ({
      id: g.id,
      label: g.label,
      group: g as LandsamGroup | undefined,
      entries: alle.filter((e) => e.groupId === g.id),
    }));
    const kjenteIds = new Set(kjente.map((g) => g.id));
    const ukjente = [...new Set(alle.map((e) => e.groupId))]
      .filter((id) => !kjenteIds.has(id))
      .map((id) => ({ id, label: id, group: undefined, entries: alle.filter((e) => e.groupId === id) }));
    return [...kjente, ...ukjente];
  }, [faculty, alle]);

  const kanSammenlignes = (id: string): boolean =>
    (grupper.find((g) => g.id === id)?.entries.filter(harTall).length ?? 0) >= 2;

  const forsteOk = grupper.find((g) => kanSammenlignes(g.id))?.id ?? grupper[0]?.id ?? '';
  const [groupId, setGroupId] = useState<string>(forsteOk);
  const [tab, setTab] = useState<MainTab>('radar');
  const [valgteByGroup, setValgteByGroup] = useState<Record<string, string[]>>({});
  const [delValgt, setDelValgt] = useState<string | null>(null);

  const gruppe = grupper.find((g) => g.id === groupId) ?? grupper[0];

  if (!gruppe || alle.length === 0) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', color: 'var(--nmbu-neutral-2)', fontSize: 13 }}>
        {INGEN_DATA_TEKST}
      </div>
    );
  }

  const medTall = gruppe.entries.filter(harTall);
  const utenTall = gruppe.entries.filter((e) => !harTall(e));

  // Standardvalg: NMBU først, deretter opptil tre andre program med tall.
  const standard = [
    ...medTall.filter((e) => e.isNmbu).map((e) => e.entryId),
    ...medTall.filter((e) => !e.isNmbu).slice(0, 3).map((e) => e.entryId),
  ];
  const valgteIds = valgteByGroup[gruppe.id] ?? standard;
  const setValgteIds = (ids: string[]) => setValgteByGroup((prev) => ({ ...prev, [gruppe.id]: ids }));

  const valgte = medTall.filter((e) => valgteIds.includes(e.entryId));
  const nyesteAar = medTall.reduce<number | null>((maks, e) => (e.latestYear != null && (maks == null || e.latestYear > maks) ? e.latestYear : maks), null);

  return (
    <div className="space-y-5">

      {/* Programgruppe-faner — hentet fra data */}
      <div className="flex items-center gap-1 rounded-xl p-1.5 flex-wrap" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', width: 'fit-content' }}>
        {grupper.map((g) => {
          const ok = kanSammenlignes(g.id);
          return (
            <button
              key={g.id}
              onClick={() => ok && setGroupId(g.id)}
              disabled={!ok}
              title={ok ? undefined : 'Færre enn to program med tall i Studiebarometeret ennå'}
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

      {/* Overskriftskort */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
          <div style={{ maxWidth: 620 }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8 }}>
              Studiebarometeret · {gruppe.label}{gruppe.group ? ` · ${LEVEL_LABEL[gruppe.group.level]}` : ''}
              {nyesteAar != null ? ` · ${nyesteAar}` : ''}
            </div>
            <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: 22, lineHeight: 1.3 }}>
              Studiebarometeret
            </div>
            <p style={{ fontSize: 13, opacity: 0.82, marginTop: 10, lineHeight: 1.65 }}>
              Studentenes vurdering av studieprogrammet · skala 1–5 · Kilde: studiebarometeret.no
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CsvExportButton onExport={() => exportFacultyStudiebarometerCsv(faculty, gruppe.id)} label="Last ned CSV" dark />
            <a
              href="https://www.studiebarometeret.no" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              <ExternalLink className="w-3.5 h-3.5" /> Kilde: studiebarometeret.no
            </a>
          </div>
        </div>

        <NmbuKeyFigures entries={gruppe.entries} />
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '220px 1fr' }}>

        <InstitutionPicker
          group={gruppe.group}
          entries={medTall}
          selected={valgteIds}
          onChange={setValgteIds}
          colorFor={colorFor}
        />

        {/* Hovedpanel */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
          <div className="px-5 py-3 flex items-center gap-1.5 flex-wrap" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
            {MAIN_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="px-3 py-1 rounded-full text-xs transition-all"
                style={{
                  backgroundColor: tab === t.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)',
                  color: tab === t.id ? '#fff' : 'var(--nmbu-neutral-1)',
                  fontWeight: tab === t.id ? 600 : 400,
                }}
              >
                {t.label}
              </button>
            ))}
            <span className="ml-auto" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
              {valgte.length} av {medTall.length} program valgt
            </span>
          </div>

          {tab === 'radar' && <RadarPanel entries={valgte} colorFor={colorFor} />}
          {tab === 'dimensjoner' && <DimensionsPanel entries={valgte} colorFor={colorFor} />}
          {tab === 'utvikling' && <TrendPanel entries={valgte} colorFor={colorFor} />}
          {tab === 'delsporsmal' && (
            <SubquestionPanel entries={valgte} valgtId={delValgt} onVelg={setDelValgt} colorFor={colorFor} />
          )}
        </div>
      </div>

      {/* Program uten tall */}
      {utenTall.length > 0 && (
        <div className="space-y-2">
          {utenTall.map((e) => (
            <div
              key={e.entryId}
              className="flex items-start gap-2 rounded-lg px-4 py-3"
              style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1.5px dashed var(--nmbu-neutral-3)', opacity: 0.75 }}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--nmbu-neutral-2)' }} />
              <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
                <span style={{ fontWeight: 600 }}>{e.shortName}{e.isNmbu ? ' ★' : ''}</span> · {e.programnavn}
                <div style={{ marginTop: 2 }}>
                  {e.warning ?? 'Ingen publiserte tall i Studiebarometeret.'}
                  {e.url && (
                    <a href={e.url} target="_blank" rel="noopener noreferrer" className="ml-2 hover:underline" style={{ color: 'var(--nmbu-green)' }}>
                      Åpne programsiden ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kildelinje */}
      <div
        className="flex items-start gap-2 text-xs rounded-lg px-4 py-2.5"
        style={{ color: 'var(--nmbu-green-6)', backgroundColor: 'var(--nmbu-green-light)', border: '1px solid var(--nmbu-green-3)' }}
      >
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--nmbu-green-2)' }} />
        <span>Kilde: studiebarometeret.no (NOKUT/HK-dir). Skala 1–5. Programmer med for få svar vises uten tall.</span>
      </div>

      <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
        <Star className="w-3 h-3" /> ★ = NMBU-program
      </div>
    </div>
  );
}
