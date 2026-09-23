import { useEffect, useMemo, useState } from 'react';
import { Search, Info, ExternalLink } from 'lucide-react';
import { NmbuNationalCompare } from './NmbuNationalCompare';

/**
 * Alle emner ved NMBU: karakterfordeling for hele emnet og per studieprogram
 * som har studenter på emnet. Data: kilde/public/nmbu-emner.json
 * (scripts/build-nmbu-courses.py, DBH tabell 308/208/347).
 */

export type Packed = number[]; // [A,B,C,D,E,F,G,H,total,skjult]
interface CourseRow {
  kode: string; navn: string; studiepoeng: number | null; nivaa: string | null; nus?: string | null; fakultet: string | null;
  years: Record<string, Packed>;
  programs: Record<string, Record<string, Packed>>;
}
interface Dataset {
  generert: string; kilde: string; years: string[];
  programs: Record<string, { navn: string | null; nivaa: string | null; fakultet: string | null }>;
  courses: CourseRow[];
}

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export const GRADE_COLORS: Record<string, string> = {
  A: '#025c4f', B: '#2ea87e', C: '#c2963a', D: '#c17a3a', E: '#e05c2a', F: '#c13a5a',
};
const POINTS: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
export const ALLE = 'alle';

export function nf(v: number, dec = 1): string {
  return v.toLocaleString('nb-NO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export interface Stats { counts: Record<string, number>; letters: number; G: number; H: number; total: number; skjult: number; snitt: number | null; stryk: number | null; }

export function sumPacked(byYear: Record<string, Packed> | undefined, year: string): Stats {
  const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 };
  let total = 0, skjult = 0;
  if (byYear) {
    for (const [y, p] of Object.entries(byYear)) {
      if (year !== ALLE && y !== year) continue;
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach((g, i) => { counts[g] += p[i] ?? 0; });
      total += p[8] ?? 0; skjult += p[9] ?? 0;
    }
  }
  const letters = LETTERS.reduce((s, g) => s + counts[g], 0);
  const snitt = letters ? LETTERS.reduce((s, g) => s + POINTS[g] * counts[g], 0) / letters : null;
  const stryk = letters ? (counts.F / letters) * 100 : null;
  return { counts, letters, G: counts.G, H: counts.H, total, skjult, snitt, stryk };
}

export function StackedBar({ s, height = 10 }: { s: Stats; height?: number }) {
  if (!s.letters) return <div className="rounded-full" style={{ height, backgroundColor: 'var(--nmbu-neutral-3)', opacity: 0.4 }} />;
  return (
    <div className="flex rounded-full overflow-hidden" style={{ height, backgroundColor: 'var(--nmbu-neutral-3)' }}>
      {LETTERS.map((g) => s.counts[g] > 0 && (
        <div key={g} title={`${g}: ${s.counts[g]} (${nf((s.counts[g] / s.letters) * 100, 0)} %)`}
          style={{ width: `${(s.counts[g] / s.letters) * 100}%`, backgroundColor: GRADE_COLORS[g] }} />
      ))}
    </div>
  );
}

export function GradeCells({ s, bold = false }: { s: Stats; bold?: boolean }) {
  return (
    <>
      {LETTERS.map((g) => {
        const n = s.counts[g];
        const pct = s.letters ? (n / s.letters) * 100 : null;
        return (
          <td key={g} className="px-2 py-2 text-right" style={{ whiteSpace: 'nowrap' }}>
            <div style={{ fontWeight: bold ? 700 : 600, color: n ? 'var(--nmbu-neutral-1)' : 'var(--nmbu-neutral-3)' }}>{n.toLocaleString('nb-NO')}</div>
            <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{pct != null ? `${nf(pct, 0)} %` : '–'}</div>
          </td>
        );
      })}
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
      style={{ backgroundColor: active ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)', color: active ? '#fff' : 'var(--nmbu-neutral-1)', border: '1px solid ' + (active ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)') }}>
      {children}
    </button>
  );
}

export function NmbuCourseExplorer({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [fakultet, setFakultet] = useState<string>('');
  const [year, setYear] = useState<string>(ALLE);
  const [selected, setSelected] = useState<string | null>(null);
  const [visAntall, setVisAntall] = useState(false);
  const [visning, setVisning] = useState<'program' | 'nasjonalt'>('program');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}nmbu-emner.json`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: Dataset) => { setData(d); setYear(d.years[d.years.length - 1] ?? ALLE); })
      .catch((e) => setError(String(e)));
  }, []);

  const faculties = useMemo(() => {
    if (!data) return [];
    const c = new Map<string, number>();
    data.courses.forEach((x) => { if (x.fakultet) c.set(x.fakultet, (c.get(x.fakultet) ?? 0) + 1); });
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  }, [data]);

  const matches = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    return data.courses.filter((c) => {
      if (fakultet && c.fakultet !== fakultet) return false;
      if (year !== ALLE && !c.years[year]) return false;
      if (!needle) return true;
      return c.kode.toLowerCase().includes(needle) || c.navn.toLowerCase().includes(needle);
    });
  }, [data, q, fakultet, year]);

  const course = useMemo(() => data?.courses.find((c) => c.kode === selected) ?? null, [data, selected]);

  const programRows = useMemo(() => {
    if (!course || !data) return [];
    const rows = Object.entries(course.programs).map(([pk, byYear]) => {
      const s = sumPacked(byYear, year);
      const meta = data.programs[pk];
      return { pk, navn: meta?.navn ?? pk, nivaa: meta?.nivaa ?? null, fakultet: meta?.fakultet ?? null, s };
    }).filter((r) => r.s.total > 0);
    rows.sort((a, b) => b.s.total - a.s.total || a.navn.localeCompare(b.navn, 'nb'));
    return rows;
  }, [course, data, year]);

  const whole = course ? sumPacked(course.years, year) : null;
  const fordelt = programRows.reduce((s, r) => s + r.s.total, 0);
  const rest = whole ? Math.max(0, whole.total - fordelt) : 0;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-5">
          <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>← Fakulteter</button>
        </div>
        <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 rounded-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)' }} />
            <div>
              <h1 style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '1.75rem', color: 'var(--nmbu-green-dark)', lineHeight: 1.1 }}>Alle emner ved NMBU</h1>
              <div style={{ fontSize: 13, color: 'var(--nmbu-neutral-2)', marginTop: 4 }}>
                Karakterfordeling for hele emnet og per studieprogram som har studenter på emnet · {data ? `${data.courses.length.toLocaleString('nb-NO')} emner, ${data.years[0]}–${data.years[data.years.length - 1]}` : 'laster …'}
              </div>
            </div>
          </div>
          <a href="https://dbh.hkdir.no" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs" style={{ color: 'var(--nmbu-green-dark)' }}>
            <ExternalLink className="w-3.5 h-3.5" /> Kilde: DBH/HKDIR tabell 308
          </a>
        </div>

        {error && <div className="rounded-xl p-4 mt-4" style={{ backgroundColor: '#fff', border: '1px solid #c13a5a', color: '#c13a5a', fontSize: 13 }}>Kunne ikke laste nmbu-emner.json: {error}</div>}

        <div className="flex items-center gap-2 flex-wrap mt-4 mb-4">
          <Chip active={year === ALLE} onClick={() => setYear(ALLE)}>Alle år</Chip>
          {data?.years.map((y) => <Chip key={y} active={year === y} onClick={() => setYear(y)}>{y}</Chip>)}
          <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
          <select value={fakultet} onChange={(e) => setFakultet(e.target.value)} className="px-3 py-1.5 rounded-full text-xs"
            style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)' }}>
            <option value="">Alle fakulteter</option>
            {faculties.map(([f, n]) => <option key={f} value={f}>{f} ({n})</option>)}
          </select>
        </div>

        <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(280px, 340px) 1fr' }}>
          {/* Emneliste */}
          <div className="rounded-2xl" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 2px 8px rgba(2,92,79,0.08)' }}>
            <div className="p-3" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
                <Search className="w-4 h-4" style={{ color: 'var(--nmbu-neutral-2)' }} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søk emnekode eller navn …"
                  className="flex-1 outline-none text-sm" style={{ color: 'var(--nmbu-neutral-1)', background: 'transparent' }} />
              </div>
              <div className="mt-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
                {matches.length.toLocaleString('nb-NO')} emner{matches.length > 200 ? ' · viser de 200 første' : ''}
              </div>
            </div>
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {matches.slice(0, 200).map((c) => {
                const s = sumPacked(c.years, year);
                const active = c.kode === selected;
                return (
                  <button key={c.kode} onClick={() => setSelected(c.kode)} className="w-full text-left px-4 py-2.5 transition-all"
                    style={{ backgroundColor: active ? 'var(--nmbu-green-4)' : 'transparent', borderBottom: '1px solid var(--nmbu-beige-light)' }}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{c.kode}</span>
                      <span style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', whiteSpace: 'nowrap' }}>{s.total.toLocaleString('nb-NO')} kand.</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)', lineHeight: 1.3 }}>{c.navn}</div>
                    <div className="mt-1.5"><StackedBar s={s} height={5} /></div>
                  </button>
                );
              })}
              {data && matches.length === 0 && <div className="p-4 text-center" style={{ fontSize: 13, color: 'var(--nmbu-neutral-2)' }}>Ingen emner matcher.</div>}
            </div>
          </div>

          {/* Detalj */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 2px 8px rgba(2,92,79,0.08)' }}>
            {!course || !whole ? (
              <div className="flex items-center justify-center h-64" style={{ color: 'var(--nmbu-neutral-2)', fontSize: 14 }}>
                Velg et emne i listen for å se karakterfordelingen.
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--nmbu-neutral-2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {course.fakultet ?? 'NMBU'}{course.nivaa ? ` · ${course.nivaa}` : ''}{course.studiepoeng ? ` · ${nf(course.studiepoeng, 0)} stp` : ''}
                </div>
                <h2 style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '1.4rem', color: 'var(--nmbu-green-dark)', marginTop: 4 }}>
                  {course.kode} · {course.navn}
                </h2>
                <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginTop: 2 }}>
                  Hele emnet · {year === ALLE ? `${data!.years[0]}–${data!.years[data!.years.length - 1]}` : year}
                </div>

                {/* Nøkkeltall hele emnet */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                  {[
                    { l: 'Kandidater', v: whole.total.toLocaleString('nb-NO') },
                    { l: 'Snitt (A=5 … F=0)', v: whole.snitt != null ? nf(whole.snitt, 2) : '–' },
                    { l: 'Stryk', v: whole.stryk != null ? `${nf(whole.stryk, 1)} %` : '–' },
                    { l: 'Bestått / ikke bestått', v: whole.G + whole.H ? `${whole.G} / ${whole.H}` : '–' },
                    { l: 'Skjermet av DBH', v: whole.skjult ? whole.skjult.toLocaleString('nb-NO') : '0' },
                  ].map((k) => (
                    <div key={k.l} className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
                      <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginBottom: 2 }}>{k.l}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--nmbu-green-dark)', lineHeight: 1.1 }}>{k.v}</div>
                    </div>
                  ))}
                </div>

                {/* Fordeling hele emnet */}
                <div className="mt-5">
                  <StackedBar s={whole} height={14} />
                  <div className="grid grid-cols-6 gap-2 mt-3">
                    {LETTERS.map((g) => {
                      const n = whole.counts[g];
                      const pct = whole.letters ? (n / whole.letters) * 100 : 0;
                      return (
                        <div key={g} className="rounded-lg px-2 py-2 text-center" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
                          <div className="mx-auto mb-1 rounded-full" style={{ width: 10, height: 10, backgroundColor: GRADE_COLORS[g] }} />
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--nmbu-neutral-1)' }}>{g}</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{nf(pct, 0)} %</div>
                          <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{n.toLocaleString('nb-NO')}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Visningsvalg: per studieprogram / andre studiesteder */}
                <div className="mt-7 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
                    {([['program', 'Per studieprogram'], ['nasjonalt', 'Sammenlignbare emner ved andre studiesteder']] as const).map(([id, label]) => (
                      <button key={id} onClick={() => setVisning(id)} className="px-3 py-1.5 text-xs font-medium transition-all"
                        style={{ backgroundColor: visning === id ? 'var(--nmbu-green-dark)' : '#fff', color: visning === id ? '#fff' : 'var(--nmbu-neutral-1)' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none" style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)' }}>
                      <input type="checkbox" checked={visAntall} onChange={(e) => setVisAntall(e.target.checked)} style={{ accentColor: 'var(--nmbu-green-dark)' }} />
                      Vis antall og prosent per karakter
                    </label>
                    {visning === 'program' && <span style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{programRows.length} program med studenter på emnet</span>}
                  </div>
                </div>
                {visning === 'nasjonalt' && (
                  <NmbuNationalCompare course={{ kode: course.kode, navn: course.navn, nus: course.nus ?? null, sp: course.studiepoeng }} year={year} visAntall={visAntall} whole={whole} />
                )}
                {visning === 'program' && (<>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                        {['Studieprogram', 'Nivå', 'Kand.', 'Snitt', 'Stryk'].map((h, i) => (
                          <th key={h} className={`px-3 py-2 ${i >= 2 ? 'text-right' : 'text-left'}`} style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                        {visAntall
                          ? LETTERS.map((g) => (
                            <th key={g} className="px-2 py-2 text-right" style={{ color: GRADE_COLORS[g], fontWeight: 700 }}>{g}</th>
                          ))
                          : <th className="px-3 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>Fordeling A–F</th>}
                        <th className="px-3 py-2 text-right" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Skjermet</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-green-4)' }}>
                        <td className="px-3 py-2" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>Hele emnet</td>
                        <td className="px-3 py-2" style={{ color: 'var(--nmbu-neutral-2)' }}>–</td>
                        <td className="px-3 py-2 text-right" style={{ fontWeight: 700 }}>{whole.total.toLocaleString('nb-NO')}</td>
                        <td className="px-3 py-2 text-right" style={{ fontWeight: 700 }}>{whole.snitt != null ? nf(whole.snitt, 2) : '–'}</td>
                        <td className="px-3 py-2 text-right" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{whole.stryk != null ? `${nf(whole.stryk, 1)} %` : '–'}</td>
                        {visAntall ? <GradeCells s={whole} bold /> : <td className="px-3 py-2" style={{ minWidth: 180 }}><StackedBar s={whole} height={9} /></td>}
                        <td className="px-3 py-2 text-right" style={{ color: 'var(--nmbu-neutral-2)' }}>{whole.skjult || '–'}</td>
                      </tr>
                      {programRows.map((r) => (
                        <tr key={r.pk} style={{ borderBottom: '1px solid var(--nmbu-beige-light)' }}>
                          <td className="px-3 py-2">
                            <div style={{ fontWeight: 600, color: 'var(--nmbu-neutral-1)' }}>{r.navn}</div>
                            <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{r.pk}{r.fakultet ? ` · ${r.fakultet}` : ''}</div>
                          </td>
                          <td className="px-3 py-2" style={{ color: 'var(--nmbu-neutral-2)', whiteSpace: 'nowrap' }}>{r.nivaa ?? '–'}</td>
                          <td className="px-3 py-2 text-right" style={{ fontWeight: 600 }}>{r.s.total.toLocaleString('nb-NO')}</td>
                          <td className="px-3 py-2 text-right">{r.s.snitt != null ? nf(r.s.snitt, 2) : '–'}</td>
                          <td className="px-3 py-2 text-right" style={{ whiteSpace: 'nowrap' }}>{r.s.stryk != null ? `${r.s.skjult ? '≥ ' : ''}${nf(r.s.stryk, 1)} %` : '–'}</td>
                          {visAntall ? <GradeCells s={r.s} /> : <td className="px-3 py-2" style={{ minWidth: 180 }}><StackedBar s={r.s} height={9} /></td>}
                          <td className="px-3 py-2 text-right" style={{ color: 'var(--nmbu-neutral-2)' }}>{r.s.skjult || '–'}</td>
                        </tr>
                      ))}
                      {rest > 0 && (
                        <tr>
                          <td className="px-3 py-2" colSpan={2} style={{ color: 'var(--nmbu-neutral-2)', fontStyle: 'italic' }}>Ikke fordelt på program (enkeltemnestudenter, utveksling, skjerming)</td>
                          <td className="px-3 py-2 text-right" style={{ color: 'var(--nmbu-neutral-2)' }}>{rest.toLocaleString('nb-NO')}</td>
                          <td colSpan={visAntall ? 8 : 3} />
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                </>)}
                <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3 mt-5"
                  style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    Kilde: DBH/HKDIR tabell 308, hentet {data!.generert}. Studieprogram er studentens program ved eksamen, ikke emnets eier.
                    DBH skjermer celler med 1–2 kandidater på programnivå; «skjermet» er antall kandidater uten synlig karakter, og stryk vises da som et minimum (≥).
                    Snitt regnes over bokstavkarakterene A=5 … F=0; bestått/ikke bestått holdes utenfor.
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
