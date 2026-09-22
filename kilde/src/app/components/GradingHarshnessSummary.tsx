import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { COURSE_MAPPING, UNIVERSITY_INFO, CourseId } from '../data/courseMapping';
import { ADMISSION_DATA } from '../data/admissionData';
import { getGradesForMode, type YearMode } from '../data/courseHistory';
import { getDBHSnitt } from '../data/dbhSokerpoeng';

const ADMISSION_2025: Record<string, { ordinary: number | null; firstTimers: number | null }> = {};
const UNI_STUDY_CODE: Record<string, string> = {};
for (const prog of ADMISSION_DATA) {
  const y = prog.years['2025'];
  if (y) ADMISSION_2025[prog.universityId] = y;
  UNI_STUDY_CODE[prog.universityId] = prog.studyCode;
}

function admissionText(uniId: string): string {
  const a = ADMISSION_2025[uniId];
  if (!a) return '';
  if (a.ordinary === null && a.firstTimers === null) return 'Privat opptak';
  if (a.ordinary === 0 && a.firstTimers === 0) return 'Alle inn';
  const parts: string[] = [];
  if (a.ordinary !== null && a.ordinary > 0) parts.push(`Ord: ${a.ordinary.toFixed(1)}`);
  if (a.firstTimers !== null && a.firstTimers > 0) parts.push(`FGV: ${a.firstTimers.toFixed(1)}`);
  return parts.join(' · ');
}

const ALL_COURSE_IDS: CourseId[] = [
  'finansregnskap', 'okonomistyring', 'investering',
  'markedsforing', 'organisasjon', 'strategi',
  'makrookonomi', 'mikrookonomi', 'matematikk',
  'statistikk', 'metode',
];

const COURSE_SHORT: Record<string, string> = {
  finansregnskap: 'Finansregn.',
  okonomistyring: 'Øk.styring',
  investering:    'Investering',
  markedsforing:  'Markedsf.',
  organisasjon:   'Org. & led.',
  strategi:       'Strategi',
  makrookonomi:   'Makro',
  mikrookonomi:   'Mikro',
  matematikk:     'Matematikk',
  statistikk:     'Statistikk',
  metode:         'Metode',
};

const GRADE_POINTS: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

function avgFromGrades(g: { A: number; B: number; C: number; D: number; E: number; F: number }): { avg: number; n: number } {
  const n = Object.values(g).reduce((s, v) => s + v, 0);
  if (n === 0) return { avg: 0, n: 0 };
  const pts = Object.entries(g).reduce((s, [gr, cnt]) => s + GRADE_POINTS[gr] * cnt, 0);
  return { avg: pts / n, n };
}

function gradeToLetter(avg: number): string {
  if (avg >= 4.5) return 'A';
  if (avg >= 3.5) return 'B';
  if (avg >= 2.5) return 'C';
  if (avg >= 1.5) return 'D';
  if (avg >= 0.5) return 'E';
  return 'F';
}

function cellColor(avg: number): string {
  if (avg >= 4.0) return '#025c4f';
  if (avg >= 3.5) return '#247761';
  if (avg >= 3.0) return '#c2963a';
  if (avg >= 2.5) return '#b05e38';
  return '#9b3a3a';
}

function cellBg(avg: number): string {
  if (avg >= 4.0) return '#e6f4f1';
  if (avg >= 3.5) return '#edf4f1';
  if (avg >= 3.0) return '#fef4e0';
  if (avg >= 2.5) return '#fdeee6';
  return '#f9e8e8';
}

function barColor(avg: number): string {
  if (avg >= 4.0) return '#025c4f';
  if (avg >= 3.5) return '#247761';
  if (avg >= 3.0) return '#c2963a';
  return '#9b3a3a';
}

interface UniSummary {
  universityId: string;
  shortName: string;
  overall: number;          // weighted avg across all courses
  totalStudents: number;
  courseCount: number;
  byCourse: Record<string, { avg: number; n: number } | null>;
}

function buildSummaries(universities: string[], yearMode: YearMode = 'latest'): UniSummary[] {
  return universities.map((uniId) => {
    const byCourse: Record<string, { avg: number; n: number } | null> = {};
    let totalPts = 0;
    let totalN = 0;
    let courseCount = 0;

    for (const courseId of ALL_COURSE_IDS) {
      const entry = COURSE_MAPPING[courseId]?.[uniId];
      if (!entry) {
        byCourse[courseId] = null;
        continue;
      }
      const grades = getGradesForMode(courseId, uniId, yearMode, entry.fallbackGrades);
      if (!grades) {
        byCourse[courseId] = null;
        continue;
      }
      const { avg, n } = avgFromGrades(grades);
      if (n === 0) {
        byCourse[courseId] = null;
        continue;
      }
      byCourse[courseId] = { avg, n };
      totalPts += avg * n;
      totalN += n;
      courseCount++;
    }

    return {
      universityId: uniId,
      shortName: UNIVERSITY_INFO[uniId]?.shortName ?? uniId,
      overall: totalN > 0 ? totalPts / totalN : 0,
      totalStudents: totalN,
      courseCount,
      byCourse: byCourse,
    };
  }).filter((u) => u.courseCount > 0);
}

type BarEntry = { name: string; avg: number; uniId: string; dbhSnitt: number | null; dbhYear: string | null };

const makeBarLabel = (data: BarEntry[]) =>
  (props: { x?: number; y?: number; width?: number; height?: number; value?: number; index?: number }) => {
    const { x = 0, y = 0, width = 0, height = 0, value = 0, index = 0 } = props;
    const midY = y + height / 2;
    const entry = data[index];
    const uniId = entry?.uniId ?? '';
    const admLine = admissionText(uniId);
    const hasAdm = admLine !== '';
    const hasDbh = entry?.dbhSnitt !== null && entry?.dbhSnitt !== undefined;

    // Vertical layout: up to 3 lines — grade, admission, DBH
    const lineCount = 1 + (hasAdm ? 1 : 0) + (hasDbh ? 1 : 0);
    const lineH = 12;
    const startY = midY - ((lineCount - 1) * lineH) / 2;
    let lineIdx = 0;

    const lx = x + width + 7;
    return (
      <g>
        <text x={lx} y={startY + lineIdx++ * lineH} fontSize={11} fill="var(--nmbu-neutral-1)" fontWeight={500} dominantBaseline="middle">
          {value.toFixed(2)} ({gradeToLetter(value)})
        </text>
        {hasAdm && (
          <text x={lx} y={startY + lineIdx++ * lineH} fontSize={9.5} fill="#1D4ED8" fontWeight={600} dominantBaseline="middle">
            {admLine}
          </text>
        )}
        {hasDbh && (
          <text x={lx} y={startY + lineIdx++ * lineH} fontSize={9.5} fill="#9CA3AF" dominantBaseline="middle">
            Søkerp.: {entry!.dbhSnitt!.toFixed(1)} ({entry!.dbhYear})
          </text>
        )}
      </g>
    );
  };

interface Props {
  universities: string[];
  yearMode?: YearMode;
}

export function GradingHarshnessSummary({ universities, yearMode = 'latest' }: Props) {
  const summaries = buildSummaries(universities, yearMode);
  if (summaries.length === 0) return null;

  const sorted = [...summaries].sort((a, b) => b.overall - a.overall);

  const barData: BarEntry[] = sorted.map((u) => {
    const code = UNI_STUDY_CODE[u.universityId];
    const dbh = code ? getDBHSnitt(code) : null;
    return {
      name: u.shortName,
      avg: parseFloat(u.overall.toFixed(3)),
      uniId: u.universityId,
      dbhSnitt: dbh?.snitt ?? null,
      dbhYear: dbh?.year ?? null,
    };
  });

  const overallMean = summaries.reduce((s, u) => s + u.overall * u.totalStudents, 0)
    / summaries.reduce((s, u) => s + u.totalStudents, 0);

  return (
    <div className="bg-white rounded-xl p-6 space-y-6" style={{ border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
      <div>
        <h2 className="text-2xl mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
          Snittkarakter på tvers av alle {ALL_COURSE_IDS.length} emner
        </h2>
        <p className="text-sm" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Vektet gjennomsnitt (etter antall studenter) over alle emner med tilgjengelig data. Brukes for å se om noen universiteter karaktersetter strengere eller mildere. Poenggrensene for opptak 2025 (ordinær / FGV) vises til høyre for søylene.
        </p>
      </div>

      {/* Bar chart */}
      <div style={{ height: Math.max(200, sorted.length * 44) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ top: 4, right: 210, bottom: 4, left: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="var(--nmbu-neutral-3)" />
            <XAxis
              type="number"
              domain={[1.5, 4.5]}
              ticks={[2, 2.5, 3, 3.5, 4, 4.5]}
              tickFormatter={(v) => v.toFixed(1)}
              tick={{ fontSize: 11, fill: 'var(--nmbu-neutral-2)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 12, fill: 'var(--nmbu-neutral)', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--nmbu-green-light)' }}
              contentStyle={{
                border: '1px solid var(--nmbu-green-3)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--nmbu-neutral)',
              }}
              formatter={(val: number) => [`${val.toFixed(3)} (${gradeToLetter(val)})`, 'Snittkarakter']}
            />
            <ReferenceLine
              x={overallMean}
              stroke="var(--nmbu-neutral-2)"
              strokeDasharray="4 3"
              label={{ value: 'Snitt', position: 'insideTopRight', fontSize: 10, fill: 'var(--nmbu-neutral-2)', dy: -4 }}
            />
            <Bar dataKey="avg" radius={[0, 4, 4, 0]} label={makeBarLabel(barData)}>
              {barData.map((entry) => (
                <Cell key={entry.uniId} fill={barColor(entry.avg)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap table */}
      <div>
        <h3 className="text-base mb-3" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
          Snittkarakter per emne og institusjon
        </h3>
        <div className="overflow-x-auto">
          <table className="border-collapse text-sm" style={{ minWidth: '700px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
                <th
                  className="px-3 py-2 text-left sticky left-0 z-10"
                  style={{
                    color: 'var(--nmbu-neutral)',
                    fontWeight: 600,
                    borderBottom: '2px solid var(--nmbu-neutral-3)',
                    backgroundColor: 'var(--nmbu-beige-light)',
                    minWidth: '100px',
                  }}
                >
                  Institusjon
                </th>
                {ALL_COURSE_IDS.map((cId) => (
                  <th
                    key={cId}
                    className="px-2 py-2 text-center"
                    style={{
                      color: 'var(--nmbu-neutral)',
                      fontWeight: 600,
                      borderBottom: '2px solid var(--nmbu-neutral-3)',
                      minWidth: '80px',
                      fontSize: '11px',
                    }}
                  >
                    {COURSE_SHORT[cId]}
                  </th>
                ))}
                <th
                  className="px-3 py-2 text-center"
                  style={{
                    color: 'var(--nmbu-neutral)',
                    fontWeight: 700,
                    borderBottom: '2px solid var(--nmbu-neutral-3)',
                    borderLeft: '2px solid var(--nmbu-neutral-3)',
                    minWidth: '80px',
                  }}
                >
                  Totalt
                </th>
                <th
                  className="px-3 py-2 text-center"
                  title="Gjennomsnittlige opptakspoeng for alle søkere (DBH tabell 571) — ikke bare de som ble tatt opp"
                  style={{
                    color: '#9CA3AF',
                    fontWeight: 500,
                    borderBottom: '2px solid var(--nmbu-neutral-3)',
                    borderLeft: '1px solid var(--nmbu-neutral-3)',
                    backgroundColor: '#fafafa',
                    minWidth: '80px',
                    fontSize: '11px',
                  }}
                >
                  Snitt poeng<br />søkere
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((uni) => (
                <tr
                  key={uni.universityId}
                  style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}
                >
                  <td
                    className="px-3 py-2 sticky left-0 z-10"
                    style={{
                      color: 'var(--nmbu-neutral)',
                      fontWeight: 600,
                      backgroundColor: 'var(--nmbu-beige-light)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {uni.shortName}
                  </td>
                  {ALL_COURSE_IDS.map((cId) => {
                    const cell = uni.byCourse[cId];
                    if (!cell) {
                      return (
                        <td
                          key={cId}
                          className="px-2 py-2 text-center"
                          style={{ color: 'var(--nmbu-neutral-3)', fontSize: '11px' }}
                        >
                          –
                        </td>
                      );
                    }
                    return (
                      <td
                        key={cId}
                        className="px-2 py-2 text-center"
                        title={`${uni.shortName} · ${COURSE_SHORT[cId]}: ${cell.avg.toFixed(2)} (n=${cell.n})`}
                        style={{
                          backgroundColor: cellBg(cell.avg),
                          color: cellColor(cell.avg),
                          fontWeight: 600,
                          fontSize: '12px',
                        }}
                      >
                        {cell.avg.toFixed(1)}
                        <span style={{ fontSize: '10px', fontWeight: 400, marginLeft: '2px' }}>
                          {gradeToLetter(cell.avg)}
                        </span>
                      </td>
                    );
                  })}
                  <td
                    className="px-3 py-2 text-center"
                    style={{
                      borderLeft: '2px solid var(--nmbu-neutral-3)',
                      backgroundColor: cellBg(uni.overall),
                      color: cellColor(uni.overall),
                      fontWeight: 700,
                      fontSize: '13px',
                    }}
                  >
                    {uni.overall.toFixed(2)}
                    <span style={{ fontSize: '10px', fontWeight: 400, marginLeft: '2px' }}>
                      {gradeToLetter(uni.overall)}
                    </span>
                  </td>
                  {/* DBH-571 snitt søkerpoeng */}
                  {(() => {
                    const code = UNI_STUDY_CODE[uni.universityId];
                    const d = code ? getDBHSnitt(code) : null;
                    return (
                      <td
                        className="px-3 py-2 text-center"
                        style={{
                          borderLeft: '1px solid var(--nmbu-neutral-3)',
                          backgroundColor: '#fafafa',
                          fontWeight: 400,
                          color: '#9CA3AF',
                          fontSize: '13px',
                        }}
                      >
                        {d ? (
                          <>
                            {d.snitt.toFixed(1)}
                            <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 400, marginTop: 1 }}>{d.year}</div>
                          </>
                        ) : '–'}
                      </td>
                    );
                  })()}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)' }}>
                <td className="px-3 py-2 sticky left-0 z-10" style={{ color: 'var(--nmbu-neutral-2)', fontSize: '11px', fontWeight: 600, backgroundColor: 'var(--nmbu-beige-light)' }}>
                  Snitt (alle)
                </td>
                {ALL_COURSE_IDS.map((cId) => {
                  const vals = summaries
                    .map((u) => u.byCourse[cId])
                    .filter((c): c is { avg: number; n: number } => c !== null);
                  if (vals.length === 0) return <td key={cId} className="px-2 py-2 text-center" style={{ color: 'var(--nmbu-neutral-3)', fontSize: '11px' }}>–</td>;
                  const totalN = vals.reduce((s, c) => s + c.n, 0);
                  const mean = vals.reduce((s, c) => s + c.avg * c.n, 0) / totalN;
                  return (
                    <td
                      key={cId}
                      className="px-2 py-2 text-center"
                      style={{ color: cellColor(mean), fontSize: '11px', fontWeight: 600 }}
                    >
                      {mean.toFixed(1)}
                    </td>
                  );
                })}
                <td
                  className="px-3 py-2 text-center"
                  style={{
                    borderLeft: '2px solid var(--nmbu-neutral-3)',
                    color: cellColor(overallMean),
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {overallMean.toFixed(2)}
                </td>
                <td
                  className="px-3 py-2 text-center"
                  style={{
                    borderLeft: '2px solid #93C5FD',
                    backgroundColor: '#EFF6FF',
                    color: '#6B7280',
                    fontSize: '10px',
                  }}
                >
                  DBH 2025
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Basert på karakterdata fra karakterweb.no (manuelt hentet 2025–2026) · Tall angir numerisk snitt (A=5…F=0) · Hold musepeker over celle for detaljer · Poenggrenser 2025 fra Samordna Opptak (Ord = ordinær kvote, FGV = førstegangsvitnemål)
        </p>
      </div>
    </div>
  );
}
