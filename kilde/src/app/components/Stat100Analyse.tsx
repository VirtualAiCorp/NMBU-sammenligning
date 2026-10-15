import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, LabelList } from 'recharts';
import { Lock, Info, ArrowDown, ArrowUp, ArrowUpDown, ExternalLink, BookOpen } from 'lucide-react';
/** Karakterfarger fra grønn (A) til rød (F). Ikke NMBU-grønnfargene, som fargetemaet ellers bytter ut. */
const GRADE_COLORS: Record<string, string> = { A: '#1a9850', B: '#66bd63', C: '#c7c23a', D: '#fdae61', E: '#f46d43', F: '#d73027' };

/**
 * «STAT100 – analyse» under Handelshøyskolen: alt til møtet med fagmiljøet bak STAT100, samlet og kryptert med eget passord
 * (AES-256-GCM, PBKDF2-SHA256). Bygges av scripts/build-stat100-analyse.py → kilde/public/intern/stat100.json.
 */

type Tall = Record<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H', number> & { total?: number };
type Poeng = [number, number, number] | null;
interface ProgramData {
  navn: string; nivaa: string | null; fakultet: string | null; aar: Record<string, number[]>; sem: Record<string, Record<string, Tall>>;
  opptak: 'N' | 'L' | null; krav: Record<string, string>; grenser: Record<string, { ORD?: number | null; ORDF?: number | null }>;
  poeng: Record<string, { mott: Poeng; alle: Poeng }>;
}
interface OaRad {
  inst: string; kort: string; prognavn: string; type: string; emne: string; emnenavn: string; aar: string; karakterer: Partial<Tall>; total: number;
  sem: Record<string, { karakterer: Partial<Tall>; total: number }>; studiested: string; grenser: Record<string, { ord?: number | null; fv?: number | null }>;
  visningskode: string; eier: string | null; fakultet: string | null; kategori: number | null; sp: number | null; emneurl: string | null;
}
interface AnnetEmne {
  inst: string; kort: string; kode: string; visningskode: string; navn: string | null; eier: string | null; fakultet: string | null; kategori: number | null;
  sp: number | null; emneurl: string | null; hele: Record<string, Tall>; programmer: Record<string, { navn: string; aar: Record<string, Tall> }>;
}
interface Bok { tittel: string; forfattere?: string | null; utgave?: string | null; forlag?: string | null; aar?: string | number | null; isbn?: string | null; kilde?: string | null; usikker?: boolean }
interface EmneInfo {
  inst: string; kode: string; navn: string; url?: string | null; studiepoeng?: number | null; semester?: string | null; undervisningsspraak?: string | null;
  eier?: string | null; forkunnskaper?: string | null; vurdering?: string | null; hjelpemidler?: string | null; programvare?: string | null;
  laeringsmal?: { kunnskap?: string[]; ferdigheter?: string[]; generell_kompetanse?: string[] }; tema?: string[]; pensum?: Bok[]; pensum_merknad?: string | null; merknader?: string | null;
}
interface Data {
  aar: string[]; karakterer: Record<string, Record<'1' | '3', Tall>>;
  fs: { termin: string; kilde: string; hele: Tall & { bestatt: number; stryk: number; ikkeMott: number; antall: number }; programmer: Record<string, { eksMeldt: number; bestatt: number; stryk: number; ikkeMott: number; snitt: string | null }> } | null;
  programmer: Record<string, ProgramData>; kravkoder: Record<string, { navn: string; tekst: string }>;
  oa: OaRad[]; andre: AnnetEmne[]; emneinfo: { emner: EmneInfo[] };
  fordeling: { satser: Record<string, { budsjett: string; '1': number; '2': number; '3': number; forslag: boolean }>; emnekategori: Record<string, string>; programmer: Record<string, Record<string, Partial<Record<'1' | '2' | '3', number>>>> };
}

const PW_KEY = 'stat100-pw';
const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function dekrypter(pw: string): Promise<Data> {
  const r = await fetch(`${import.meta.env.BASE_URL}intern/stat100.json`, { cache: 'no-store' });
  if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) throw new Error('Fant ikke datafilen');
  const e = await r.json();
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(e.salt), iterations: e.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(e.iv) }, key, b64(e.data))));
}

// ── Hjelpere ────────────────────────────────────────────────────────────────
const L6 = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
const nf = (v: number, d = 1) => v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });
const kr = (v: number) => `${Math.round(v).toLocaleString('nb-NO')} kr`;
const mkr = (v: number) => `${nf(v / 1e6, 2)} mill. kr`;
interface S { n: number; bokstav: number; counts: Record<string, number>; G: number; H: number; skjult: number; stryk: number | null; snitt: number | null }
/** Statistikk fra tellinger. Snitt = A=5 … E=1 (beståtte), som i Excel-oversikten. Stryk = F / (A–F). */
function st(t: Partial<Tall> | undefined, total?: number): S {
  const c: Record<string, number> = {}; L6.forEach((g) => { c[g] = t?.[g] ?? 0; });
  const bokstav = L6.reduce((s, g) => s + c[g], 0); const best = bokstav - c.F;
  const sum = bokstav + (t?.G ?? 0) + (t?.H ?? 0);
  const n = total ?? t?.total ?? sum;
  return { n, bokstav, counts: c, G: t?.G ?? 0, H: t?.H ?? 0, skjult: Math.max(0, n - sum), stryk: bokstav ? c.F / bokstav : null,
    snitt: best ? (5 * c.A + 4 * c.B + 3 * c.C + 2 * c.D + c.E) / best : null };
}
const pluss = (...ts: (Partial<Tall> | undefined)[]): Tall => {
  const u = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0 } as Tall;
  ts.forEach((t) => { if (!t) return; (['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const).forEach((g) => { u[g] += t[g] ?? 0; }); u.total! += t.total ?? 0; });
  return u;
};
const fraPacked = (p: number[] | undefined): Tall => ({ A: p?.[0] ?? 0, B: p?.[1] ?? 0, C: p?.[2] ?? 0, D: p?.[3] ?? 0, E: p?.[4] ?? 0, F: p?.[5] ?? 0, G: p?.[6] ?? 0, H: p?.[7] ?? 0, total: p?.[8] ?? 0 });
const pst = (v: number | null, skjult = 0) => (v == null ? '–' : `${skjult ? '≥ ' : ''}${nf(v * 100, 1)} %`);
const sn = (v: number | null) => (v == null ? '–' : nf(v, 2));

const kort = { backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', borderRadius: 14 } as const;
const H2 = ({ children, under }: { children: ReactNode; under?: ReactNode }) => (
  <div className="mb-3">
    <h3 style={{ fontFamily: "'Lora', serif", fontSize: 19, fontWeight: 500, color: 'var(--nmbu-green-dark)' }}>{children}</h3>
    {under && <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginTop: 2, maxWidth: 820 }}>{under}</div>}
  </div>
);
const Merknad = ({ children }: { children: ReactNode }) => (
  <div className="flex items-start gap-2 rounded-lg px-4 py-3 mt-4" style={{ fontSize: 11.5, backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{children}</span>
  </div>
);
function Chips<T extends string>({ verdier, valgt, sett, etikett }: { verdier: { id: T; label: string }[]; valgt: T; sett: (v: T) => void; etikett?: string }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {etikett && <span style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginRight: 2 }}>{etikett}</span>}
      {verdier.map((v) => (
        <button key={v.id} onClick={() => sett(v.id)} className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: valgt === v.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)', color: valgt === v.id ? '#fff' : 'var(--nmbu-neutral-1)', border: '1px solid ' + (valgt === v.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)') }}>
          {v.label}
        </button>
      ))}
    </div>
  );
}
function Fordelingsstolpe({ s, h = 9 }: { s: S; h?: number }) {
  if (!s.bokstav) return <div className="rounded-full" style={{ height: h, backgroundColor: 'var(--nmbu-neutral-3)', opacity: 0.4 }} />;
  return (
    <div className="flex rounded-full overflow-hidden" style={{ height: h, minWidth: 140 }}>
      {L6.map((g) => s.counts[g] > 0 && <div key={g} title={`${g}: ${s.counts[g]} (${nf((s.counts[g] / s.bokstav) * 100, 0)} %)`} style={{ width: `${(s.counts[g] / s.bokstav) * 100}%`, backgroundColor: GRADE_COLORS[g] }} />)}
    </div>
  );
}
type Sort = { kol: string; retning: 1 | -1 };
function Th({ id, label, sort, setSort, venstre, title }: { id: string; label: ReactNode; sort: Sort; setSort: (s: Sort) => void; venstre?: boolean; title?: string }) {
  const aktiv = sort.kol === id; const Ikon = !aktiv ? ArrowUpDown : sort.retning === 1 ? ArrowUp : ArrowDown;
  return (
    <th className={`px-3 py-2 ${venstre ? 'text-left' : 'text-right'}`} aria-sort={aktiv ? (sort.retning === 1 ? 'ascending' : 'descending') : 'none'}
      style={{ color: aktiv ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>
      <button title={title} onClick={() => setSort({ kol: id, retning: aktiv ? (sort.retning === 1 ? -1 : 1) : (venstre ? 1 : -1) })}
        className={`inline-flex items-center gap-1 ${venstre ? '' : 'flex-row-reverse'}`} style={{ font: 'inherit', color: 'inherit' }}>
        <Ikon className="w-3 h-3" style={{ opacity: aktiv ? 1 : 0.45 }} />{label}
      </button>
    </th>
  );
}
function sorter<T>(rader: T[], sort: Sort, verdi: (r: T, k: string) => number | string | null): T[] {
  return [...rader].sort((a, b) => {
    const va = verdi(a, sort.kol), vb = verdi(b, sort.kol);
    if (va == null && vb == null) return 0; if (va == null) return 1; if (vb == null) return -1;
    return (typeof va === 'string' ? va.localeCompare(vb as string, 'nb') : (va as number) - (vb as number)) * sort.retning;
  });
}
const thStil = { color: 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' as const };
const radStil = { borderBottom: '1px solid var(--nmbu-beige-light)' };
const HH_PROG = ['B-ØA', 'B-ØLIT', 'B-ECON'];
const NMBU_PROG: Record<string, string> = { 'Bachelor ØA': 'B-ØA', 'Bachelor ØLIT': 'B-ØLIT', 'Bachelor samfunnsøkonomi': 'B-ECON' };

// ── 1. Karakterer i STAT100 ────────────────────────────────────────────────
function Karakterer({ d }: { d: Data }) {
  const [sem, setSem] = useState<'samlet' | '1' | '3'>('samlet');
  const rader = d.aar.map((y) => {
    const v = d.karakterer[y]['1'], h = d.karakterer[y]['3'];
    return { y, var: st(v), host: st(h), samlet: st(pluss(v, h)) };
  });
  const fsH = d.fs?.hele;
  const fsS = fsH ? st({ ...fsH, G: 0, H: 0, total: fsH.A + fsH.B + fsH.C + fsH.D + fsH.E + fsH.F }) : null;
  const graf = [...rader.map((r) => ({ navn: r.y, s: sem === 'samlet' ? r.samlet : sem === '1' ? r.var : r.host, fs: false })),
    ...(fsS && sem !== '3' ? [{ navn: 'V2026*', s: fsS, fs: true }] : [])]
    .map(({ navn, s, fs }) => ({ navn, fs, ...Object.fromEntries(L6.map((g) => [g, s.bokstav ? (s.counts[g] / s.bokstav) * 100 : 0])), ...Object.fromEntries(L6.map((g) => [`${g}_n`, s.counts[g]])), stryk: s.stryk != null ? s.stryk * 100 : null, n: s.bokstav }));
  return (
    <div>
      <H2 under="Alle studenter på emnet, fordelt på vårsemesteret (ordinær eksamen) og høstsemesteret (i hovedsak kontinuasjon). Strykprosent = F / (A–F). Snitt = A=5 … E=1 for beståtte.">Karakterfordeling i STAT100, 2021–2025</H2>
      <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
        <Chips etikett="Grafen viser:" valgt={sem} sett={setSem} verdier={[{ id: 'samlet', label: 'Samlet' }, { id: '1', label: 'Vår' }, { id: '3', label: 'Høst' }]} />
      </div>
      <div style={{ ...kort, padding: 12 }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={graf} margin={{ top: 18, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--nmbu-neutral-3)" />
            <XAxis dataKey="navn" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} allowDataOverflow tickFormatter={(v: number) => `${v} %`} />
            <Tooltip formatter={(v: number, k: string, it: { payload?: Record<string, number> }) => [`${nf(v, 1)} % (${it.payload?.[`${k}_n`] ?? '–'})`, k]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {L6.map((g) => (
              <Bar key={g} dataKey={g} stackId="k" fill={GRADE_COLORS[g]}>
                <LabelList dataKey={`${g}_n`} content={(p: { x?: number | string; y?: number | string; width?: number | string; height?: number | string; value?: number | string }) => {
                  const x = Number(p.x), y = Number(p.y), w = Number(p.width), h = Number(p.height);
                  if (!(h >= 15) || p.value == null) return null;
                  return <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700, fill: g === 'C' || g === 'D' ? '#1f1f1f' : '#fff' }}>{g} {p.value}</text>;
                }} />
                {g === 'F' && <LabelList dataKey="stryk" position="top" formatter={(v: number) => (v != null ? `${nf(v, 0)} %` : '')} style={{ fontSize: 10, fill: 'var(--nmbu-neutral-1)' }} />}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
        <div style={{ fontSize: 10.5, color: 'var(--nmbu-neutral-2)', marginLeft: 8 }}>Tallet over stolpen er strykprosenten; tallene i feltene er antall kandidater med hver karakter. {fsS ? '* V2026 = foreløpige tall fra FS for våren 2026 (ordinær eksamen).' : ''}</div>
      </div>
      <div className="overflow-x-auto mt-4" style={kort}>
        <table className="w-full text-xs border-collapse">
          <thead><tr style={{ borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
            <th className="px-3 py-2 text-left" style={thStil}>År</th>
            {['Vår', 'Høst', 'Samlet'].map((h) => <th key={h} colSpan={3} className="px-3 py-2 text-center" style={{ ...thStil, borderLeft: '1px solid var(--nmbu-neutral-3)' }}>{h}</th>)}
            <th className="px-3 py-2 text-left" style={thStil}>Fordeling A–F (samlet)</th>
          </tr><tr style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
            <th />{[0, 1, 2].map((i) => <Fragment key={i}>{['Kand.', 'Stryk', 'Snitt'].map((h, j) => <th key={h} className="px-3 py-1 text-right" style={{ ...thStil, fontSize: 10.5, borderLeft: j === 0 ? '1px solid var(--nmbu-neutral-3)' : undefined }}>{h}</th>)}</Fragment>)}<th />
          </tr></thead>
          <tbody>
            {rader.map((r) => (
              <tr key={r.y} style={radStil}>
                <td className="px-3 py-2" style={{ fontWeight: 700 }}>{r.y}</td>
                {[r.var, r.host, r.samlet].map((s, i) => (
                  <Fragment key={i}>
                    <td className="px-3 py-2 text-right" style={{ borderLeft: '1px solid var(--nmbu-neutral-3)', fontWeight: i === 2 ? 700 : 400 }}>{s.n.toLocaleString('nb-NO')}</td>
                    <td className="px-3 py-2 text-right" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{pst(s.stryk, s.skjult)}</td>
                    <td className="px-3 py-2 text-right">{sn(s.snitt)}</td>
                  </Fragment>
                ))}
                <td className="px-3 py-2"><Fordelingsstolpe s={r.samlet} /></td>
              </tr>
            ))}
            {fsS && d.fs && (
              <tr style={{ ...radStil, backgroundColor: 'rgba(240,192,64,0.12)' }}>
                <td className="px-3 py-2" style={{ fontWeight: 700 }}>2026*</td>
                <td className="px-3 py-2 text-right" style={{ borderLeft: '1px solid var(--nmbu-neutral-3)' }}>{fsS.bokstav}</td>
                <td className="px-3 py-2 text-right" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{pst(fsS.stryk)}</td>
                <td className="px-3 py-2 text-right">{sn(fsS.snitt)}</td>
                <td colSpan={6} className="px-3 py-2" style={{ color: 'var(--nmbu-neutral-2)', borderLeft: '1px solid var(--nmbu-neutral-3)' }}>Høsten 2026 og DBHs tall er ikke klare · {d.fs.hele.ikkeMott} ikke møtt</td>
                <td className="px-3 py-2"><Fordelingsstolpe s={fsS} /></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <VarTabell d={d} />
      <Merknad>Kilde: DBH/HK-dir tabell 308 (karakterer per emne og semester), alle studenter på STAT100. 2026*: FS-rapporten FS754.001, ordinær eksamen våren 2026, foreløpige tall. «≥» betyr at DBH har skjermet små celler, så strykprosenten er et minimum.</Merknad>
    </div>
  );
}

/** Våreksamen (ordinær eksamen) per HH-program og for hele emnet, 2021–2026: DBH per semester, våren 2026 fra FS. */
function VarTabell({ d }: { d: Data }) {
  const aar = [...d.aar, ...(d.fs ? ['2026'] : [])];
  const rad = (navn: string, pk: string | null) => ({
    navn, pk,
    v: aar.map((y) => {
      if (y === '2026') {
        if (!d.fs) return null;
        if (!pk) { const h = d.fs.hele; return { stryk: h.F / (h.A + h.B + h.C + h.D + h.E + h.F), n: h.A + h.B + h.C + h.D + h.E + h.F, skjult: 0 }; }
        const f = d.fs.programmer[pk]; return f ? { stryk: f.stryk / (f.bestatt + f.stryk), n: f.bestatt + f.stryk, skjult: 0 } : null;
      }
      const s = pk ? st(d.programmer[pk]?.sem[y]?.['1']) : st(d.karakterer[y]?.['1']);
      return s.bokstav ? { stryk: s.stryk!, n: s.bokstav, skjult: s.skjult } : null;
    }),
  });
  const rader = [rad('Økonomi og administrasjon (B-ØA)', 'B-ØA'), rad('Økonomi, ledelse og IT (B-ØLIT)', 'B-ØLIT'), rad('Samfunnsøkonomi (B-ECON)', 'B-ECON'), rad('Hele emnet (alle program)', null)];
  return (
    <div className="mt-5">
      <H2 under="Strykprosent på våreksamen (ordinær eksamen) for Handelshøyskolens tre bachelorprogram og for hele emnet. 2026 er foreløpige tall fra FS.">Våreksamen per program, 2021–2026</H2>
      <div className="overflow-x-auto" style={kort}>
        <table className="w-full text-xs border-collapse">
          <thead><tr style={{ borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
            <th className="px-3 py-2 text-left" style={thStil}>Program</th>
            {aar.map((y) => <th key={y} className="px-3 py-2 text-right" style={{ ...thStil, backgroundColor: y === '2026' ? 'rgba(240,192,64,0.15)' : undefined }}>{y} (vår){y === '2026' ? '*' : ''}</th>)}
          </tr></thead>
          <tbody>
            {rader.map((r) => (
              <tr key={r.navn} style={{ ...radStil, fontWeight: r.pk ? 400 : 700 }}>
                <td className="px-3 py-2" style={{ fontWeight: 700 }}>{r.navn}</td>
                {r.v.map((x, i) => (
                  <td key={aar[i]} className="px-3 py-2 text-right" style={{ backgroundColor: x && x.n >= 10 ? `rgba(193,58,90,${0.06 + Math.min(1, x.stryk / 0.5) * 0.4})` : undefined }}
                    title={x ? `${x.n} med bokstavkarakter${x.skjult ? `, ${x.skjult} skjermet` : ''}` : undefined}>
                    {x ? <><b>{pst(x.stryk, x.skjult)}</b><div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{x.n}</div></> : '–'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--nmbu-neutral-2)', marginTop: 4 }}>Tallet under er antall med bokstavkarakter. DBH skjermer celler med 1–2 kandidater på programnivå, så tallene kan avvike litt fra FS (et prosentpoeng eller to).</div>
    </div>
  );
}

// ── 2. Per studieprogram (med opptak og kravkode) ──────────────────────────
function PerProgram({ d }: { d: Data }) {
  const valg = [...d.aar.map((y) => ({ id: y, label: y })), { id: 'alle', label: `Alle (${d.aar[0]}–${d.aar[d.aar.length - 1]})` }, ...(d.fs ? [{ id: 'fs', label: 'Vår 2026 (FS)' }] : [])];
  const [aar, setAar] = useState<string>(d.aar[d.aar.length - 1]);
  const [sem, setSem] = useState<'samlet' | '1' | '3'>('samlet');
  const [sort, setSort] = useState<Sort>({ kol: 'n', retning: -1 });
  const [kunHH, setKunHH] = useState(false);
  const aarene = aar === 'alle' ? d.aar : aar === 'fs' ? [] : [aar];
  const rader = useMemo(() => Object.entries(d.programmer).map(([pk, p]) => {
    let s: S; let fsSnitt: string | null = null;
    if (aar === 'fs') {
      const f = d.fs?.programmer[pk];
      if (!f) return null;
      s = { n: f.bestatt + f.stryk, bokstav: f.bestatt + f.stryk, counts: {}, G: 0, H: 0, skjult: 0, stryk: f.stryk / (f.bestatt + f.stryk), snitt: null };
      fsSnitt = f.snitt;
    } else if (sem === 'samlet') {
      s = st(pluss(...aarene.map((y) => fraPacked(p.aar[y]))));
      const skj = aarene.reduce((a, y) => a + (p.aar[y]?.[9] ?? 0), 0); s.skjult = skj;
    } else {
      s = st(pluss(...aarene.map((y) => p.sem[y]?.[sem])));
    }
    if (!s.n) return null;
    // Opptakskullet: STAT100 tas om våren i første studieår, så kullet er året før eksamensåret
    const kull = aar === 'fs' ? ['2025'] : aarene.map((y) => String(Number(y) - 1));
    let n = 0, op = 0, kp = 0;
    kull.forEach((y) => { const m = p.poeng[y]?.mott; if (m && m[0]) { n += m[0]; op += m[1]; kp += m[2]; } });
    const sisteKull = kull[kull.length - 1];
    const krav = p.opptak === 'L' ? 'Lokalt' : p.krav[sisteKull] ?? Object.values(p.krav).slice(-1)[0] ?? '–';
    const g = p.grenser[sisteKull]?.ORD;
    return { pk, navn: p.navn, fakultet: p.fakultet ?? '', s, fsSnitt, krav, opptakspoeng: n ? op / n : null, karakterpoeng: n ? kp / n : null, grense: g ?? null, mott: n, hh: p.fakultet === 'Handelshøyskolen' };
  }).filter((r): r is NonNullable<typeof r> => r != null && (!kunHH || r.hh)), [d, aar, sem, kunHH]);
  const sortert = sorter(rader, sort, (r, k) => ({ navn: r.navn, fak: r.fakultet, n: r.s.n, stryk: r.s.stryk, snitt: r.s.snitt, krav: r.krav, op: r.opptakspoeng, kp: r.karakterpoeng, gr: r.grense } as Record<string, number | string | null>)[k]);
  return (
    <div>
      <H2 under="Karakterene i STAT100 for studentene på hvert studieprogram, sammen med opptakskvaliteten i programmet og kravkoden for å komme inn. STAT100 tas om våren i første studieår, så opptakstallene gjelder kullet som startet året før.">Per studieprogram: karakterer, opptakskvalitet og kravkode</H2>
      <div className="flex flex-col gap-2 mb-3">
        <Chips etikett="År:" valgt={aar} sett={setAar} verdier={valg} />
        <div className="flex items-center gap-4 flex-wrap">
          {aar !== 'fs' && <Chips etikett="Semester:" valgt={sem} sett={setSem} verdier={[{ id: 'samlet', label: 'Samlet' }, { id: '1', label: 'Vår' }, { id: '3', label: 'Høst' }]} />}
          <label className="flex items-center gap-1.5 cursor-pointer" style={{ fontSize: 12 }}><input type="checkbox" checked={kunHH} onChange={(e) => setKunHH(e.target.checked)} style={{ accentColor: 'var(--nmbu-green-dark)' }} /> Bare Handelshøyskolens program</label>
        </div>
      </div>
      <div className="overflow-x-auto" style={kort}>
        <table className="w-full text-xs border-collapse">
          <thead><tr style={{ borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
            <Th id="navn" label="Studieprogram" sort={sort} setSort={setSort} venstre />
            <Th id="fak" label="Fakultet" sort={sort} setSort={setSort} venstre />
            <Th id="n" label="Kand." sort={sort} setSort={setSort} />
            <Th id="stryk" label="Stryk" sort={sort} setSort={setSort} />
            <Th id="snitt" label="Snitt" sort={sort} setSort={setSort} title="A=5 … E=1 for beståtte; for FS-tallene bokstaven FS oppgir" />
            <th className="px-3 py-2 text-left" style={thStil}>Fordeling A–F</th>
            <Th id="krav" label="Kravkode" sort={sort} setSort={setSort} venstre title="Opptakskrav i Samordna opptak for kullet" />
            <Th id="op" label="Opptakspoeng" sort={sort} setSort={setSort} title="Snitt konkurransepoeng for dem som møtte (DBH 571), kullet året før" />
            <Th id="kp" label="Karakterpoeng" sort={sort} setSort={setSort} title="Snitt karakterpoeng for dem som møtte (DBH 571)" />
            <Th id="gr" label="Poenggrense" sort={sort} setSort={setSort} title="Hovedopptaket, ordinær kvote, for kullet. «Alle» = alle kvalifiserte fikk tilbud" />
          </tr></thead>
          <tbody>
            {sortert.map((r) => (
              <tr key={r.pk} style={{ ...radStil, backgroundColor: HH_PROG.includes(r.pk) ? 'rgba(2,92,79,0.06)' : undefined }}>
                <td className="px-3 py-2"><div style={{ fontWeight: 600 }}>{r.navn}</div><div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{r.pk}</div></td>
                <td className="px-3 py-2" style={{ color: 'var(--nmbu-neutral-2)', fontSize: 11 }}>{r.fakultet}</td>
                <td className="px-3 py-2 text-right" style={{ fontWeight: 600 }}>{r.s.n}</td>
                <td className="px-3 py-2 text-right" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{pst(r.s.stryk, r.s.skjult)}</td>
                <td className="px-3 py-2 text-right">{r.fsSnitt ?? sn(r.s.snitt)}</td>
                <td className="px-3 py-2">{aar === 'fs' ? <span style={{ fontSize: 10.5, color: 'var(--nmbu-neutral-2)' }}>bare bestått/stryk i FS</span> : <Fordelingsstolpe s={r.s} />}</td>
                <td className="px-3 py-2"><span title={d.kravkoder[r.krav] ? `${d.kravkoder[r.krav].navn}\n${d.kravkoder[r.krav].tekst}` : undefined} className="px-1.5 py-0.5 rounded font-mono" style={{ fontSize: 11, fontWeight: 700, backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', cursor: 'help' }}>{r.krav}</span></td>
                <td className="px-3 py-2 text-right" style={{ fontWeight: 600 }}>{r.opptakspoeng != null ? nf(r.opptakspoeng) : '–'}</td>
                <td className="px-3 py-2 text-right">{r.karakterpoeng != null ? nf(r.karakterpoeng) : '–'}</td>
                <td className="px-3 py-2 text-right">{r.grense == null ? '–' : r.grense === 0 ? 'Alle' : nf(r.grense)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4" style={{ ...kort, padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nmbu-green-dark)', marginBottom: 6 }}>Kravkodene</div>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {[...new Set(rader.map((r) => r.krav))].filter((k) => d.kravkoder[k]).map((k) => (
            <div key={k} style={{ fontSize: 11.5 }}><b className="font-mono" style={{ color: 'var(--nmbu-green-dark)' }}>{k}</b> · <b>{d.kravkoder[k].navn}.</b> <span style={{ color: 'var(--nmbu-neutral-2)' }}>{d.kravkoder[k].tekst.split('\n')[0]}</span></div>
          ))}
        </div>
      </div>
      <Merknad>Karakterer: DBH tabell 308 på programnivå (skjermet for 1–2 kandidater per celle; «≥» = minimum). Vår 2026: FS-rapporten, bare program med minst 3 studenter med resultat. Opptakspoeng og karakterpoeng: DBH tabell 571, snitt for dem som møtte til studiestart. Kravkode: Samordna opptak. Poenggrense: hovedopptaket i Samordna opptak, ordinær kvote. Toårige master har lokalt opptak og ingen poeng i DBH.</Merknad>
    </div>
  );
}

// ── 3. ØA-studentene ved universitetene ─────────────────────────────────────
function OaStudentene({ d }: { d: Data }) {
  const [maal, setMaal] = useState<'stryk' | 'snitt'>('stryk');
  const [type, setType] = useState<'bachelor' | 'alle'>('bachelor');
  const [periode, setPeriode] = useState<string>('2023-2025');
  const perAar = periode.includes('-') ? (() => { const [f, t] = periode.split('-').map(Number); return Array.from({ length: t - f + 1 }, (_, i) => String(f + i)); })() : [periode];
  const minN = perAar.length > 1 ? 20 : 10;
  const aarene = ['2021', '2022', '2023', '2024', '2025'];
  // Én rad per institusjon, program (med studiested) og emne
  const grupper = useMemo(() => {
    const m = new Map<string, { nokkel: string; r0: OaRad; aar: Record<string, OaRad>; sum3: Tall; semV: Tall; semH: Tall }>();
    d.oa.forEach((r) => {
      if (type === 'bachelor' && r.type === 'Siviløkonom 5 år') return;
      const k = `${r.kort}|${r.prognavn}|${r.studiested}|${r.visningskode}`;
      const g = m.get(k) ?? { nokkel: k, r0: r, aar: {}, sum3: pluss(), semV: pluss(), semH: pluss() };
      g.aar[r.aar] = r;
      if (r.aar >= '2023') { g.sum3 = pluss(g.sum3, { ...r.karakterer, total: r.total }); g.semV = pluss(g.semV, { ...r.sem['1']?.karakterer, total: r.sem['1']?.total }); g.semH = pluss(g.semH, { ...r.sem['3']?.karakterer, total: r.sem['3']?.total }); }
      m.set(k, g);
    });
    return [...m.values()].filter((g) => g.sum3.total! >= 5);
  }, [d, type]);
  const verdi = (s: S) => (maal === 'stryk' ? s.stryk : s.snitt);
  const fmt = (s: S) => (maal === 'stryk' ? pst(s.stryk, s.skjult) : sn(s.snitt));
  const farge = (s: S) => {
    const v = verdi(s); if (v == null || s.bokstav < 10) return 'transparent';
    const t = maal === 'stryk' ? Math.min(1, v / 0.5) : Math.min(1, Math.max(0, (4.2 - v) / 2.2));
    return `rgba(193,58,90,${0.08 + t * 0.42})`;
  };
  // Graf: stryk/snitt 2023–25 per rad, sortert
  const graf = grupper.map((g) => {
    const s = st(pluss(...perAar.map((y) => g.aar[y] ? { ...g.aar[y].karakterer, total: g.aar[y].total } : undefined))); const nav = g.r0.kort === 'NMBU' ? `NMBU STAT100 · ${NMBU_PROG[g.r0.type] ?? g.r0.type}` : `${g.r0.kort} ${g.r0.visningskode}${g.r0.studiested && ['UiT', 'NTNU', 'USN', 'INN'].includes(g.r0.kort) ? ` (${g.r0.studiested})` : ''}${g.r0.type !== 'Bachelor ØA' ? ` · ${g.r0.type.replace('Bachelor ', '')}` : ''}`;
    return { nav, v: verdi(s) != null ? (maal === 'stryk' ? s.stryk! * 100 : s.snitt!) : null, nmbu: g.r0.kort === 'NMBU', n: s.bokstav };
  }).filter((x) => x.v != null && x.n >= minN).sort((a, b) => (b.v! - a.v!) * (maal === 'stryk' ? 1 : -1));
  const sortert = [...grupper].sort((a, b) => (verdi(st(b.sum3)) ?? -1) - (verdi(st(a.sum3)) ?? -1) * 1);
  return (
    <div>
      <H2 under="Karakterene i statistikkemnet for studentene på bachelor i økonomi og administrasjon ved universitetene med handelshøyskole (og NHH og BI). For NMBU også B-ØLIT og B-ECON. Hvem som eier emnet, står i tabellen.">ØA-studentene i statistikkemnet ved universitetene</H2>
      <div className="flex gap-4 flex-wrap mb-3">
        <Chips etikett="Vis:" valgt={maal} sett={setMaal} verdier={[{ id: 'stryk', label: 'Strykprosent' }, { id: 'snitt', label: 'Snitt' }]} />
        <Chips etikett="Program:" valgt={type} sett={setType} verdier={[{ id: 'bachelor', label: 'Bachelor' }, { id: 'alle', label: 'Med siviløkonom 5 år' }]} />
        <Chips etikett="Grafen:" valgt={periode} sett={setPeriode} verdier={[{ id: '2023-2025', label: '2023–25' }, { id: '2021-2025', label: '2021–25' }, ...aarene.map((y) => ({ id: y, label: y }))]} />
      </div>
      <div style={{ ...kort, padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--nmbu-neutral-1)', margin: '0 0 6px 6px' }}>{maal === 'stryk' ? 'Strykprosent' : 'Snitt (A=5 … E=1)'} {perAar.length > 1 ? `${perAar[0]}–${perAar[perAar.length - 1]} samlet` : perAar[0]} · minst {minN} med bokstavkarakter</div>
        <ResponsiveContainer width="100%" height={Math.max(220, graf.length * 24 + 30)}>
          <BarChart data={graf} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--nmbu-neutral-3)" />
            <XAxis type="number" tick={{ fontSize: 11 }} unit={maal === 'stryk' ? ' %' : ''} domain={maal === 'stryk' ? [0, 'auto'] : [0, 5]} />
            <YAxis type="category" dataKey="nav" width={210} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => (maal === 'stryk' ? `${nf(v, 1)} %` : nf(v, 2))} />
            <Bar dataKey="v" name={maal === 'stryk' ? 'Strykprosent' : 'Snitt'}>
              {graf.map((x) => <Cell key={x.nav} fill={x.nmbu ? '#c13a5a' : '#46B4A0'} />)}
              <LabelList dataKey="v" position="right" formatter={(v: number) => (maal === 'stryk' ? `${nf(v, 0)} %` : nf(v, 2))} style={{ fontSize: 10 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="overflow-x-auto mt-4" style={kort}>
        <table className="w-full text-xs border-collapse">
          <thead><tr style={{ borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
            {['Institusjon', 'Program · studiested', 'Emne', 'Eier av emnet', 'Kat.'].map((h) => <th key={h} className="px-3 py-2 text-left" style={thStil}>{h}</th>)}
            {aarene.map((y) => <th key={y} className="px-2 py-2 text-right" style={thStil}>{y}</th>)}
            {d.fs && <th className="px-2 py-2 text-right" style={{ ...thStil, backgroundColor: 'rgba(240,192,64,0.15)' }} title="Våren 2026, foreløpige tall fra FS (bare NMBU). Snitt finnes bare som bokstav.">2026 vår*</th>}
            <th className="px-3 py-2 text-right" style={thStil}>2023–25</th>
            <th className="px-3 py-2 text-right" style={thStil} title="Snitt poenggrense (hovedopptaket, ordinær kvote) for kullene 2022–2024">Poenggrense</th>
          </tr></thead>
          <tbody>
            {sortert.map((g) => {
              const s3 = st(g.sum3);
              const pg = ['2022', '2023', '2024'].map((y) => g.r0.grenser[y]?.ord).filter((v): v is number => v != null);
              const kat = g.r0.kategori;
              return (
                <tr key={g.nokkel} style={{ ...radStil, backgroundColor: g.r0.kort === 'NMBU' ? 'rgba(193,58,90,0.06)' : undefined }}>
                  <td className="px-3 py-2" style={{ fontWeight: 700 }}>{g.r0.kort}</td>
                  <td className="px-3 py-2"><div>{g.r0.prognavn}{g.r0.kort === 'NMBU' && NMBU_PROG[g.r0.type] ? <b> ({NMBU_PROG[g.r0.type]})</b> : null}</div><div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{g.r0.studiested} · {g.r0.type}</div></td>
                  <td className="px-3 py-2"><div style={{ fontWeight: 600 }}>{g.r0.visningskode}</div><div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{g.r0.emnenavn}{g.r0.sp ? ` · ${nf(g.r0.sp, 1)} sp` : ''}</div></td>
                  <td className="px-3 py-2" style={{ fontSize: 11 }}>{g.r0.eier}{g.r0.fakultet && g.r0.fakultet !== g.r0.eier ? <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{g.r0.fakultet}</div> : null}</td>
                  <td className="px-3 py-2"><span title={kat === 1 ? 'Eies av handelshøyskolen' : kat === 2 ? 'For økonomer, eies utenfor handelshøyskolen' : 'Eies utenfor handelshøyskolen, generelt statistikkemne'}
                    className="px-1.5 py-0.5 rounded" style={{ fontSize: 10.5, fontWeight: 700, backgroundColor: kat === 1 ? '#D9EAD3' : kat === 2 ? '#FFF2CC' : '#F3D9DF', color: '#333' }}>{kat ?? '–'}</span></td>
                  {aarene.map((y) => { const r = g.aar[y]; const s = r ? st({ ...r.karakterer, total: r.total }) : null;
                    return <td key={y} className="px-2 py-2 text-right" style={{ backgroundColor: s ? farge(s) : undefined }} title={s ? `${s.n} kandidater` : undefined}>{s && s.bokstav ? fmt(s) : '–'}</td>; })}
                  {d.fs && (() => {
                    const pk = g.r0.kort === 'NMBU' ? ({ 'Bachelor ØA': 'B-ØA', 'Bachelor ØLIT': 'B-ØLIT', 'Bachelor samfunnsøkonomi': 'B-ECON' } as Record<string, string>)[g.r0.type] : undefined;
                    const f = pk ? d.fs!.programmer[pk] : undefined;
                    return <td className="px-2 py-2 text-right" style={{ backgroundColor: f ? `rgba(193,58,90,${0.06 + Math.min(1, f.stryk / (f.bestatt + f.stryk) / 0.5) * 0.4})` : undefined }}>
                      {f ? (maal === 'stryk' ? pst(f.stryk / (f.bestatt + f.stryk)) : f.snitt ?? '–') : ''}</td>;
                  })()}
                  <td className="px-3 py-2 text-right" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{fmt(s3)}<div style={{ fontSize: 10, fontWeight: 400, color: 'var(--nmbu-neutral-2)' }}>{s3.n} kand.</div></td>
                  <td className="px-3 py-2 text-right">{g.r0.kort === 'BI' ? 'Eget opptak' : pg.length ? (pg.every((v) => v === 0) ? 'Alle' : nf(pg.reduce((a, b) => a + b, 0) / pg.length)) : '–'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Merknad>DBH tabell 308 på programnivå (skjermet for 1–2 per celle; «≥» = minimum). Kategori 1 = emnet eies av handelshøyskolen, 2 = for økonomer men eies utenfor, 3 = eies utenfor og er et generelt statistikkemne. Rød bakgrunn = høy strykprosent / lavt snitt (bare celler med minst 10 med bokstavkarakter). NTNU, USN, UiT og INN har byttet emnekode underveis; begge kodene vises. Nord: Bodø og Steinkjer har samme programkode i DBH. 2026 vår*: foreløpige FS-tall for NMBU (ordinær eksamen); DBH har ikke 2026 ennå.</Merknad>
    </div>
  );
}

// ── 4. Pensum og 5. Læringsmål ─────────────────────────────────────────────
function Pensum({ d }: { d: Data }) {
  const emner = d.emneinfo.emner;
  if (!emner.length) return <Merknad>Pensum er ikke lagt inn ennå.</Merknad>;
  return (
    <div>
      <H2 under="Hovedlærebøkene i statistikkemnet for ØA-studentene. De fleste pensumlistene ligger bak innlogging (Leganto/Canvas); bøker funnet i uoffisielle kilder (bruktannonser o.l.) er merket «usikker kilde». Pensum kan endre seg fra semester til semester.">Pensumbøkene</H2>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {emner.map((e) => (
          <div key={`${e.inst}-${e.kode}`} style={{ ...kort, padding: 14, borderColor: e.inst.startsWith('NMBU') ? '#c13a5a' : 'var(--nmbu-neutral-3)' }}>
            <div className="flex items-baseline justify-between gap-2">
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--nmbu-neutral-2)' }}>{e.inst}</div>
              {e.studiepoeng != null && <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{nf(e.studiepoeng, 1)} sp</div>}
            </div>
            <div style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)', marginTop: 2 }}>{e.kode} · {e.navn}
              {e.url && <a href={e.url} target="_blank" rel="noreferrer" className="inline-flex ml-1.5 align-middle" title="Emnesiden"><ExternalLink className="w-3 h-3" /></a>}</div>
            <div className="mt-2 flex flex-col gap-2">
              {(e.pensum ?? []).length ? e.pensum!.map((b, i) => (
                <div key={i} className="flex gap-2" style={{ fontSize: 12 }}>
                  <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--nmbu-green-dark)' }} />
                  <div><b>{b.tittel}</b>{b.utgave ? `, ${b.utgave}` : ''}{b.usikker && <span title={b.kilde ?? undefined} className="ml-1.5 px-1.5 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 700, backgroundColor: '#FFF2CC', color: '#6B4E00', cursor: 'help' }}>usikker kilde</span>}<div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{[b.forfattere, b.forlag, b.aar].filter(Boolean).join(' · ')}</div>{b.kilde && <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', fontStyle: 'italic' }}>Kilde: {b.kilde}</div>}</div>
                </div>
              )) : <div style={{ fontSize: 11.5, color: 'var(--nmbu-neutral-2)', fontStyle: 'italic' }}>{e.pensum_merknad ?? 'Fant ikke pensum i åpne kilder.'}</div>}
            </div>
            {e.programvare && <div style={{ fontSize: 11, marginTop: 8, color: 'var(--nmbu-neutral-2)' }}>Programvare: {e.programvare}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
/** Temaene sammenlignes med søkeord i emnenavn, temaliste, læringsmål og programvare (oppsummert fra emnesidene). Grovt, men likt for alle. */
const TEMA: [string, RegExp][] = [
  ['Deskriptiv statistikk', /deskriptiv|beskrivende/i],
  ['Sannsynlighetsregning', /sannsynlighet|probabilit/i],
  ['Kombinatorikk', /kombinatorikk|combinator/i],
  ['Betinget sannsynlighet / Bayes', /betinget|bayes|conditional/i],
  ['Diskrete fordelinger (binomisk, Poisson …)', /binomisk|binomial|poisson|hypergeometrisk|diskret/i],
  ['Normalfordelingen', /normalfordel|normal distrib|(?<![\p{L}])normal(?![\p{L}])/iu],
  ['Forventning og varians', /forventning|varians\b|expect/i],
  ['Kovarians og korrelasjon', /kovarians|korrelasjon|correlat|covarian/i],
  ['Simultanfordelinger', /simultan|joint/i],
  ['Estimering og konfidensintervall', /estimer|konfidensintervall|intervallestim|confidence/i],
  ['Hypotesetesting', /hypotese|hypothes|t-test|z-test|p-verdi/i],
  ['Kjikvadrattest', /kjikvadrat|khikvadrat|chi/i],
  ['Variansanalyse (ANOVA)', /variansanalyse|anova/i],
  ['Enkel lineær regresjon', /regresjon|regression/i],
  ['Multippel regresjon', /multippel|multiple regres/i],
  ['Utvalgsstørrelse og teststyrke', /utvalgsstørrelse|styrke|sample size|power/i],
  // Stor R som eget ord (ikke R1/R2); \b i JavaScript ser æøå som skilletegn, så «lineær» ville ellers gitt treff
  ['R / RStudio', /RStudio|(?<![\p{L}\d])R(?![\p{L}\d])/u],
  ['Excel', /excel/i],
  ['Statistisk læring / maskinlæring', /maskinlæring|statistisk læring|machine learning/i],
];
const emneTekst = (e: EmneInfo) => {
  const lm = e.laeringsmal ?? {};
  return [e.navn, ...(e.tema ?? []), ...(lm.kunnskap ?? []), ...(lm.ferdigheter ?? []), ...(lm.generell_kompetanse ?? []), e.programvare ?? ''].join(' ');
};
function TemaOversikt({ emner, nmbu }: { emner: EmneInfo[]; nmbu: EmneInfo }) {
  // Bare emner der vi har læringsmål (USN-emneplanen kunne ikke hentes)
  const andre = emner.filter((e) => e !== nmbu && Object.values(e.laeringsmal ?? {}).some((v) => (v ?? []).length));
  const rader = TEMA.map(([navn, rx]) => {
    const har = andre.filter((e) => rx.test(emneTekst(e)));
    return { navn, stat: rx.test(emneTekst(nmbu)), n: har.length, har };
  });
  const N = andre.length;
  const bareOss = rader.filter((r) => r.stat && r.n <= Math.max(2, Math.round(N * 0.25)));
  const manglerHosOss = rader.filter((r) => !r.stat && r.n >= Math.round(N * 0.4));
  const kort2 = (e: EmneInfo) => `${e.inst.replace(/ \(.*\)/, '')} ${e.kode}`;
  return (
    <div className="mb-5">
      <H2 under={`Hvilke tema læringsmålene og emnebeskrivelsene tar opp, i STAT100 og i de ${N} andre emnene vi har læringsmål for. Søkeordbasert og grovt: et tema kan undervises selv om det ikke står i emnebeskrivelsen.`}>Hva har STAT100 som de andre ikke har?</H2>
      <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div style={{ ...kort, padding: 14, borderColor: '#1a9850' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a9850' }}>I STAT100, men hos få av de andre</div>
          <ul style={{ fontSize: 12.5, paddingLeft: 16, listStyle: 'disc', marginTop: 6 }}>
            {bareOss.map((r) => <li key={r.navn}><b>{r.navn}</b> – {r.n === 0 ? 'ingen av de andre' : `bare ${r.n} av ${N} (${r.har.map(kort2).join(', ')})`}</li>)}
            {nmbu.studiepoeng != null && <li><b>Omfang: {nf(nmbu.studiepoeng, 0)} studiepoeng</b> – {andre.filter((e) => (e.studiepoeng ?? 0) >= 10).length} av {N} andre har 10 sp, resten 7,5 sp</li>}
          </ul>
        </div>
        <div style={{ ...kort, padding: 14, borderColor: '#d73027' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#d73027' }}>Hos mange av de andre, men ikke beskrevet i STAT100</div>
          <ul style={{ fontSize: 12.5, paddingLeft: 16, listStyle: 'disc', marginTop: 6 }}>
            {manglerHosOss.map((r) => <li key={r.navn}><b>{r.navn}</b> – {r.n} av {N}</li>)}
            {!manglerHosOss.length && <li>Ingen tydelige</li>}
          </ul>
        </div>
      </div>
      <div className="overflow-x-auto" style={kort}>
        <table className="w-full text-xs border-collapse">
          <thead><tr style={{ borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
            <th className="px-3 py-2 text-left" style={thStil}>Tema</th>
            <th className="px-2 py-2 text-center" style={{ ...thStil, color: '#c13a5a' }}>STAT100</th>
            <th className="px-2 py-2 text-center" style={thStil}>Andre (av {N})</th>
            {andre.map((e) => <th key={e.kode + e.inst} className="px-1 py-2 text-center" style={{ ...thStil, fontSize: 9.5, writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 96 }}>{kort2(e)}</th>)}
          </tr></thead>
          <tbody>
            {rader.map((r) => (
              <tr key={r.navn} style={{ ...radStil, backgroundColor: bareOss.includes(r) ? 'rgba(26,152,80,0.08)' : manglerHosOss.includes(r) ? 'rgba(215,48,39,0.07)' : undefined }}>
                <td className="px-3 py-1.5" style={{ fontWeight: 600 }}>{r.navn}</td>
                <td className="px-2 py-1.5 text-center" style={{ fontWeight: 700, color: r.stat ? '#1a9850' : 'var(--nmbu-neutral-3)' }}>{r.stat ? '✓' : '–'}</td>
                <td className="px-2 py-1.5 text-center" style={{ fontWeight: 600 }}>{r.n}</td>
                {andre.map((e) => <td key={e.kode + e.inst} className="px-1 py-1.5 text-center" style={{ color: r.har.includes(e) ? 'var(--nmbu-neutral-1)' : 'var(--nmbu-neutral-3)' }}>{r.har.includes(e) ? '✓' : '·'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Laeringsmal({ d }: { d: Data }) {
  const emner = d.emneinfo.emner;
  const nmbu = emner.find((e) => e.inst.startsWith('NMBU'));
  const andre = emner.filter((e) => e !== nmbu);
  const [valgt, setValgt] = useState(andre[0] ? `${andre[0].inst}|${andre[0].kode}` : '');
  if (!emner.length) return <Merknad>Læringsmålene er ikke lagt inn ennå.</Merknad>;
  const motpart = andre.find((e) => `${e.inst}|${e.kode}` === valgt);
  const Kolonne = ({ e, uthev }: { e?: EmneInfo; uthev?: boolean }) => !e ? null : (
    <div style={{ ...kort, padding: 14, borderColor: uthev ? '#c13a5a' : 'var(--nmbu-neutral-3)' }}>
      <div style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{e.inst} · {e.kode} {e.navn}</div>
      <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{[e.studiepoeng != null ? `${nf(e.studiepoeng, 1)} sp` : null, e.semester?.split(' (')[0], e.vurdering].filter(Boolean).join(' · ')}</div>
      {(['kunnskap', 'ferdigheter', 'generell_kompetanse'] as const).map((k) => (
        <div key={k} className="mt-2.5">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--nmbu-neutral-2)' }}>{k === 'generell_kompetanse' ? 'Generell kompetanse' : k[0].toUpperCase() + k.slice(1)}</div>
          <ul style={{ fontSize: 12, paddingLeft: 16, listStyle: 'disc', marginTop: 2 }}>{(e.laeringsmal?.[k] ?? []).map((x, i) => <li key={i}>{x}</li>)}{!(e.laeringsmal?.[k] ?? []).length && <li style={{ color: 'var(--nmbu-neutral-2)' }}>Ikke oppgitt</li>}</ul>
        </div>
      ))}
      {e.tema?.length ? <div className="flex flex-wrap gap-1 mt-3">{e.tema.map((t) => <span key={t} className="px-1.5 py-0.5 rounded" style={{ fontSize: 10.5, backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)' }}>{t}</span>)}</div> : null}
    </div>
  );
  const nmbuTema = new Set((nmbu?.tema ?? []).map((t) => t.toLowerCase()));
  return (
    <div>
      <H2 under="Læringsmålene slik emnesidene beskriver dem (oppsummert), med studiepoeng, semester og vurderingsform. NMBU til venstre; velg emnet du vil sammenligne med.">Læringsmål og studiepoeng</H2>
      {nmbu && <TemaOversikt emner={emner} nmbu={nmbu} />}
      <div className="overflow-x-auto mb-4" style={kort}>
        <table className="w-full text-xs border-collapse">
          <thead><tr style={{ borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
            {['Institusjon', 'Emne', 'Studiepoeng', 'Semester', 'Vurdering', 'Programvare', 'Tema som ikke er i STAT100'].map((h) => <th key={h} className="px-3 py-2 text-left" style={thStil}>{h}</th>)}
          </tr></thead>
          <tbody>
            {emner.map((e) => (
              <tr key={`${e.inst}-${e.kode}`} style={{ ...radStil, backgroundColor: e === nmbu ? 'rgba(193,58,90,0.06)' : undefined }}>
                <td className="px-3 py-2" style={{ fontWeight: 700 }}>{e.inst}</td>
                <td className="px-3 py-2"><b>{e.kode}</b> {e.navn}</td>
                <td className="px-3 py-2" style={{ fontWeight: 700, color: e.studiepoeng === 10 ? '#c13a5a' : 'var(--nmbu-green-dark)' }}>{e.studiepoeng != null ? nf(e.studiepoeng, 1) : '–'}</td>
                <td className="px-3 py-2">{e.semester?.split(' (')[0] ?? '–'}</td>
                <td className="px-3 py-2">{e.vurdering ?? '–'}</td>
                <td className="px-3 py-2">{e.programvare ?? '–'}</td>
                <td className="px-3 py-2" style={{ color: 'var(--nmbu-neutral-2)' }}>{e === nmbu ? '–' : (e.tema ?? []).filter((t) => !nmbuTema.has(t.toLowerCase())).join(', ') || '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-3">
        <select value={valgt} onChange={(e) => setValgt(e.target.value)} className="px-3 py-1.5 rounded-full text-xs" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
          {andre.map((e) => <option key={`${e.inst}|${e.kode}`} value={`${e.inst}|${e.kode}`}>{e.inst} · {e.kode} {e.navn}</option>)}
        </select>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Kolonne e={nmbu} uthev /><Kolonne e={motpart} />
      </div>
      <Merknad>Oppsummert fra emnesidene (lenket under «Pensum»), hentet 15.10.2026. Læringsmålene er omskrevet kort; les emnesiden for den fullstendige ordlyden. «Tema som ikke er i STAT100» er en grov sammenligning av stikkordene.</Merknad>
    </div>
  );
}

// ── 6. Andre emner: karakterer per studieprogram ───────────────────────────
function AndreEmner({ d }: { d: Data }) {
  const [valgt, setValgt] = useState(`${d.andre[0]?.kort}|${d.andre[0]?.kode}`);
  const [aar, setAar] = useState<string>('alle');
  const [sort, setSort] = useState<Sort>({ kol: 'n', retning: -1 });
  const e = d.andre.find((x) => `${x.kort}|${x.kode}` === valgt) ?? d.andre[0];
  const aarListe = Object.keys(e.hele).sort();
  const aarene = aar === 'alle' ? aarListe : [aar];
  const hele = st(pluss(...aarene.map((y) => e.hele[y])));
  const rader = sorter(Object.entries(e.programmer).map(([pk, p]) => ({ pk, navn: p.navn, s: st(pluss(...aarene.map((y) => p.aar[y]))) })).filter((r) => r.s.n > 0),
    sort, (r, k) => ({ navn: r.navn, n: r.s.n, stryk: r.s.stryk, snitt: r.s.snitt } as Record<string, number | string | null>)[k]);
  return (
    <div>
      <H2 under="Velg et statistikkemne ved en annen institusjon og se karakterfordelingen for hvert studieprogram som har studenter på emnet.">Statistikkemnene ved andre institusjoner, per studieprogram</H2>
      <div className="flex gap-3 flex-wrap items-center mb-3">
        <select value={valgt} onChange={(ev) => { setValgt(ev.target.value); setAar('alle'); }} className="px-3 py-1.5 rounded-full text-xs" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
          {d.andre.map((x) => <option key={`${x.kort}|${x.kode}`} value={`${x.kort}|${x.kode}`}>{x.kort} · {x.visningskode} {x.navn}</option>)}
        </select>
        <Chips etikett="År:" valgt={aar} sett={setAar} verdier={[{ id: 'alle', label: 'Alle' }, ...aarListe.map((y) => ({ id: y, label: y }))]} />
      </div>
      <div className="flex gap-4 flex-wrap mb-3" style={{ fontSize: 12 }}>
        <div><span style={{ color: 'var(--nmbu-neutral-2)' }}>Eier: </span><b>{e.eier ?? '–'}</b>{e.fakultet && e.fakultet !== e.eier ? ` (${e.fakultet})` : ''}</div>
        <div><span style={{ color: 'var(--nmbu-neutral-2)' }}>Studiepoeng: </span><b>{e.sp != null ? nf(e.sp, 1) : '–'}</b></div>
        <div><span style={{ color: 'var(--nmbu-neutral-2)' }}>Kategori: </span><b>{e.kategori ?? '–'}</b></div>
        {e.emneurl && <a href={e.emneurl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1" style={{ color: 'var(--nmbu-green-dark)', textDecoration: 'underline' }}><ExternalLink className="w-3 h-3" />Emnesiden</a>}
      </div>
      <div className="overflow-x-auto" style={kort}>
        <table className="w-full text-xs border-collapse">
          <thead><tr style={{ borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
            <Th id="navn" label="Studieprogram" sort={sort} setSort={setSort} venstre />
            <Th id="n" label="Kand." sort={sort} setSort={setSort} />
            <Th id="stryk" label="Stryk" sort={sort} setSort={setSort} />
            <Th id="snitt" label="Snitt" sort={sort} setSort={setSort} />
            <th className="px-3 py-2 text-left" style={thStil}>Fordeling A–F</th>
          </tr></thead>
          <tbody>
            <tr style={{ ...radStil, backgroundColor: 'var(--nmbu-green-4)' }}>
              <td className="px-3 py-2" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>Hele emnet</td>
              <td className="px-3 py-2 text-right" style={{ fontWeight: 700 }}>{hele.n}</td>
              <td className="px-3 py-2 text-right" style={{ fontWeight: 700 }}>{pst(hele.stryk, hele.skjult)}</td>
              <td className="px-3 py-2 text-right" style={{ fontWeight: 700 }}>{sn(hele.snitt)}</td>
              <td className="px-3 py-2"><Fordelingsstolpe s={hele} /></td>
            </tr>
            {rader.map((r) => (
              <tr key={r.pk} style={radStil}>
                <td className="px-3 py-2"><div style={{ fontWeight: 600 }}>{r.navn}</div><div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{r.pk}</div></td>
                <td className="px-3 py-2 text-right" style={{ fontWeight: 600 }}>{r.s.n}</td>
                <td className="px-3 py-2 text-right" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{pst(r.s.stryk, r.s.skjult)}</td>
                <td className="px-3 py-2 text-right">{sn(r.s.snitt)}</td>
                <td className="px-3 py-2"><Fordelingsstolpe s={r.s} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Merknad>DBH tabell 308 på programnivå (skjermet for 1–2 per celle; «≥» = minimum) og på emnenivå for «Hele emnet». Studenter uten studieprogram (enkeltemner, utveksling) står bare i «Hele emnet».</Merknad>
    </div>
  );
}

// ── 7. Fordeling ────────────────────────────────────────────────────────────
const KILDE_KATEGORI = [
  { tekst: 'UiB, Analysegruppa nr. 51 (2024): fra 2025 er det studentens studieprogram som avgjør kategorien', url: 'https://ekstern.filer.uib.no/ledelse/Analysegruppen%20-%20nyhetsbrev/Analysegruppa%20-%20teier-n%C3%A5r-det-trengs-nr.51.pdf' },
  { tekst: 'UiB, styresak 74/24 «Studiefinansiering fra 2025»', url: 'https://www.uib.no/sites/w3.uib.no/files/attachments/74-24_studiefinansiering_fra_2025.pdf' },
  { tekst: 'DBH/HK-dir tabell 900 (studiepoeng, med finansieringskategori for studentens program og for emnet)', url: 'https://dbh.hkdir.no' },
];
function Fordeling({ d }: { d: Data }) {
  const aarListe = Object.keys(d.fordeling.satser).sort();
  const [aar, setAar] = useState(aarListe[aarListe.length - 1]);
  const [sort, setSort] = useState<Sort>({ kol: 'kr', retning: -1 });
  const sats = d.fordeling.satser[aar];
  const KAT = ['1', '2', '3'] as const;
  const beregn = (y: string, by: Record<string, Partial<Record<'1' | '2' | '3', number>>>) => {
    const k = by[y] ?? {}; const s2 = d.fordeling.satser[y];
    const enh = KAT.reduce((a, c) => a + (k[c] ?? 0), 0);
    return { enh, kr: KAT.reduce((a, c) => a + (k[c] ?? 0) * s2[c], 0), kat: KAT.filter((c) => (k[c] ?? 0) > 0) };
  };
  const rader = Object.entries(d.fordeling.programmer).map(([pk, by]) => ({ pk, navn: d.programmer[pk]?.navn ?? pk, fakultet: d.programmer[pk]?.fakultet ?? 'Annet / enkeltemner', ...beregn(aar, by) }))
    .filter((r) => r.enh > 0);
  const total = rader.reduce((s2, r) => s2 + r.kr, 0);
  const perFak = [...rader.reduce((m, r) => m.set(r.fakultet, (m.get(r.fakultet) ?? 0) + r.kr), new Map<string, number>())].sort((a, b) => b[1] - a[1]);
  const hh = perFak.find(([f]) => f === 'Handelshøyskolen')?.[1] ?? 0;
  const perKat = KAT.map((k) => ({ k, enh: rader.reduce((a, r) => a + (d.fordeling.programmer[r.pk][aar]?.[k] ?? 0), 0) })).filter((x) => x.enh > 0);
  const sortert = sorter(rader, sort, (r, k) => ({ navn: r.navn, fak: r.fakultet, kat: r.kat.join('/'), enh: r.enh, kr: r.kr } as Record<string, number | string | null>)[k]);
  const tidsserie = aarListe.map((y) => {
    let hhKr = 0, alle = 0;
    Object.entries(d.fordeling.programmer).forEach(([pk, by]) => { const v = beregn(y, by).kr; alle += v; if (d.programmer[pk]?.fakultet === 'Handelshøyskolen') hhKr += v; });
    return { y, hh: hhKr / 1e6, andre: (alle - hhKr) / 1e6 };
  });
  return (
    <div>
      <H2 under={`Resultatbasert uttelling for studiepoengene som produseres i STAT100, fordelt på studentenes studieprogram. Kategorien (og dermed satsen) følger studentens program. Produksjon i ${aar} gir uttelling i budsjettet for ${sats.budsjett}.`}>Fordeling av studiepoenginntekten fra STAT100</H2>
      <Chips etikett="Produksjonsår:" valgt={aar} sett={setAar} verdier={aarListe.map((y) => ({ id: y, label: `${y} (budsjett ${d.fordeling.satser[y].budsjett}${d.fordeling.satser[y].forslag ? ', forslag' : ''})` }))} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        {[
          { l: 'Samlet uttelling', v: mkr(total) },
          { l: 'Fra Handelshøyskolens studenter', v: mkr(hh) },
          { l: 'Andel fra Handelshøyskolen', v: total ? `${nf((hh / total) * 100, 0)} %` : '–' },
          { l: 'Satser kategori 1 / 2', v: `${nf(sats['1'] / 1000, 2)} / ${nf(sats['2'] / 1000, 2)} tkr` },
        ].map((k) => (
          <div key={k.l} style={{ ...kort, padding: '10px 14px' }}>
            <div style={{ fontSize: 10.5, color: 'var(--nmbu-neutral-2)' }}>{k.l}</div>
            <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{k.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-3" style={{ ...kort, padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>Kategorien følger studentens program</div>
        <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)', marginTop: 4, maxWidth: 880, lineHeight: 1.55 }}>
          Fra finansieringssystemet 2025 er det studentens studieprogram som avgjør hvilken kategori studiepoengene gir uttelling i, ikke emnet.
          Før var det emnets primære studieprogram. STAT100 står registrert i kategori {d.fordeling.emnekategori[aar] ?? '2'} som emne, men studiepoengene som
          Handelshøyskolens studenter tar i STAT100, gir uttelling i <b>kategori 1</b> ({kr(sats['1'])} per 60 sp), fordi B-ØA, B-ØLIT og B-ECON er
          kategori 1-program. Studenter fra for eksempel biologi og bioteknologi gir kategori 2 ({kr(sats['2'])}).
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {perKat.map((x) => <span key={x.k} className="px-2 py-1 rounded" style={{ fontSize: 11, backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)' }}>
            Kategori {x.k}: {nf(x.enh, 1)} studiepoengenheter · {mkr(x.enh * sats[x.k])}</span>)}
        </div>
        <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginTop: 8 }}>
          Kilder: {KILDE_KATEGORI.map((k, i) => <Fragment key={k.url}>{i > 0 && ' · '}<a href={k.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: 'var(--nmbu-green-dark)' }}>{k.tekst}</a></Fragment>)}
        </div>
      </div>
      <div className="grid gap-3 mt-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div style={{ ...kort, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, margin: '0 0 6px 6px' }}>Per fakultet (studentens program), {aar}</div>
          <ResponsiveContainer width="100%" height={Math.max(180, perFak.length * 30 + 20)}>
            <BarChart data={perFak.map(([f, v]) => ({ f: f.replace('Fakultet for ', ''), v: v / 1e6 }))} layout="vertical" margin={{ left: 10, right: 50 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} unit=" mill." /><YAxis type="category" dataKey="f" width={170} tick={{ fontSize: 10.5 }} />
              <Tooltip formatter={(v: number) => `${nf(v, 2)} mill. kr`} />
              <Bar dataKey="v">{perFak.map(([f]) => <Cell key={f} fill={f === 'Handelshøyskolen' ? '#025C4F' : '#B8D8CF'} />)}<LabelList dataKey="v" position="right" formatter={(v: number) => nf(v, 2)} style={{ fontSize: 10 }} /></Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ ...kort, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, margin: '0 0 6px 6px' }}>Over tid (mill. kr)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tidsserie} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--nmbu-neutral-3)" />
              <XAxis dataKey="y" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip formatter={(v: number) => `${nf(v, 2)} mill. kr`} /><Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="hh" stackId="a" name="Handelshøyskolens studenter" fill="#025C4F" /><Bar dataKey="andre" stackId="a" name="Andre fakulteters studenter" fill="#B8D8CF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="overflow-x-auto mt-3" style={kort}>
        <table className="w-full text-xs border-collapse">
          <thead><tr style={{ borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
            <Th id="navn" label="Studieprogram" sort={sort} setSort={setSort} venstre />
            <Th id="fak" label="Fakultet" sort={sort} setSort={setSort} venstre />
            <Th id="kat" label="Kategori" sort={sort} setSort={setSort} venstre title="Finansieringskategorien til studentens program (DBH 900)" />
            <Th id="enh" label="Studiepoengenheter" sort={sort} setSort={setSort} title="Egenfinansierte studiepoeng / 60 (beståtte studiepoeng)" />
            <Th id="kr" label="Uttelling" sort={sort} setSort={setSort} />
            <th className="px-3 py-2 text-right" style={thStil}>Andel</th>
          </tr></thead>
          <tbody>
            {sortert.map((r) => (
              <tr key={r.pk} style={{ ...radStil, backgroundColor: r.fakultet === 'Handelshøyskolen' ? 'rgba(2,92,79,0.06)' : undefined }}>
                <td className="px-3 py-2"><div style={{ fontWeight: 600 }}>{r.navn}</div><div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{r.pk}</div></td>
                <td className="px-3 py-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{r.fakultet}</td>
                <td className="px-3 py-2">{r.kat.join(' / ')}</td>
                <td className="px-3 py-2 text-right">{nf(r.enh, 1)}</td>
                <td className="px-3 py-2 text-right" style={{ fontWeight: 700 }}>{kr(r.kr)}</td>
                <td className="px-3 py-2 text-right">{total ? `${nf((r.kr / total) * 100, 1)} %` : '–'}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid var(--nmbu-neutral-3)' }}>
              <td className="px-3 py-2" style={{ fontWeight: 700 }} colSpan={3}>Sum</td>
              <td className="px-3 py-2 text-right" style={{ fontWeight: 700 }}>{nf(rader.reduce((s2, r) => s2 + r.enh, 0), 1)}</td>
              <td className="px-3 py-2 text-right" style={{ fontWeight: 700 }}>{kr(total)}</td><td />
            </tr>
          </tbody>
        </table>
      </div>
      <Merknad>Anslag etter den nasjonale finansieringsmodellen: egenfinansierte studiepoeng i STAT100 (DBH tabell 900, «ny produksjon», bare beståtte studiepoeng) delt på 60 × satsen for kategorien til studentens studieprogram (DBH-feltet «Finmodkode student»). Satser: budsjett 2025 og 2026 fra DBH tabell 908, budsjett 2027 fra statsbudsjettforslaget. Hvordan NMBU fordeler pengene internt mellom fakultetene (for eksempel til fakultetet som gir emnet eller til studentens fakultet), følger NMBUs egen budsjettmodell og er ikke regnet med her. Uttelling for fullførte grader er heller ikke med.</Merknad>
    </div>
  );
}

// ── Siden ──────────────────────────────────────────────────────────────────
const FANER = [
  { id: 'karakterer', label: 'Karakterer i STAT100' }, { id: 'program', label: 'Per studieprogram' }, { id: 'oa', label: 'ØA-studentene' },
  { id: 'pensum', label: 'Pensum' }, { id: 'laeringsmal', label: 'Læringsmål' }, { id: 'andre', label: 'Andre emner' }, { id: 'fordeling', label: 'Fordeling' },
] as const;
type Fane = (typeof FANER)[number]['id'];

export function Stat100Analyse() {
  const [data, setData] = useState<Data | null>(null);
  const [pw, setPw] = useState('');
  const [feil, setFeil] = useState<string | null>(null);
  const [laster, setLaster] = useState(false);
  const [fane, setFane] = useState<Fane>(() => {
    const f = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('stat100fane') : null;
    return (FANER.some((x) => x.id === f) ? f : 'karakterer') as Fane;
  });
  const lasOpp = async (p: string, lagre: boolean) => {
    setLaster(true);
    try {
      setData(await dekrypter(p)); setFeil(null);
      if (lagre) try { sessionStorage.setItem(PW_KEY, p); } catch { /* privat modus */ }
    } catch (e) { if (lagre) setFeil(String(e).includes('Fant ikke') ? 'Fant ikke datafilen.' : 'Feil passord.'); }
    setLaster(false);
  };
  useEffect(() => { try { const p = sessionStorage.getItem(PW_KEY); if (p) void lasOpp(p, false); } catch { /* */ } }, []);
  // Adressen viser siden og fanen, så lenken kan deles (?stat100&stat100fane=…); fjernes når man går ut av siden
  useEffect(() => {
    try { const u = new URL(window.location.href); u.searchParams.set('stat100', ''); u.searchParams.set('stat100fane', fane); window.history.replaceState(null, '', u.toString().replace('stat100=&', 'stat100&')); } catch { /* */ }
  }, [fane]);
  useEffect(() => () => {
    try { const u = new URL(window.location.href); u.searchParams.delete('stat100'); u.searchParams.delete('stat100fane'); window.history.replaceState(null, '', u); } catch { /* */ }
  }, []);

  if (!data) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6" style={kort}>
        <div className="flex items-center gap-2 mb-2"><Lock className="w-4 h-4" style={{ color: 'var(--nmbu-green-dark)' }} /><b style={{ color: 'var(--nmbu-green-dark)' }}>STAT100 – analyse</b></div>
        <div style={{ fontSize: 12.5, color: 'var(--nmbu-neutral-2)', marginBottom: 12 }}>Intern side til møtet med fagmiljøet bak STAT100. Skriv inn passordet.</div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void lasOpp(pw, true); }}>
          <input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} aria-label="Passord" placeholder="Passord"
            className="flex-1 px-3 py-2 rounded-lg text-sm" style={{ border: `1px solid ${feil ? '#c13a5a' : 'var(--nmbu-neutral-3)'}`, backgroundColor: '#fff' }} />
          <button type="submit" disabled={laster} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>{laster ? '…' : 'Lås opp'}</button>
        </form>
        {feil && <div style={{ fontSize: 12, color: '#c13a5a', marginTop: 8 }}>{feil}</div>}
      </div>
    );
  }
  return (
    <div>
      <div className="flex gap-1 flex-wrap mb-5" role="tablist" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
        {FANER.map((f) => (
          <button key={f.id} role="tab" aria-selected={fane === f.id} onClick={() => setFane(f.id)} className="px-3 py-2 text-sm"
            style={{ fontWeight: fane === f.id ? 700 : 500, color: fane === f.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', borderBottom: `2px solid ${fane === f.id ? 'var(--nmbu-green-dark)' : 'transparent'}`, marginBottom: -1 }}>
            {f.label}
          </button>
        ))}
      </div>
      {fane === 'karakterer' && <Karakterer d={data} />}
      {fane === 'program' && <PerProgram d={data} />}
      {fane === 'oa' && <OaStudentene d={data} />}
      {fane === 'pensum' && <Pensum d={data} />}
      {fane === 'laeringsmal' && <Laeringsmal d={data} />}
      {fane === 'andre' && <AndreEmner d={data} />}
      {fane === 'fordeling' && <Fordeling d={data} />}
    </div>
  );
}
