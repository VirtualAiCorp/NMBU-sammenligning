import { useEffect, useMemo, useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { emneUrl } from '../data/emneUrl';
import { ALLE, GradeCells, LETTERS, StackedBar, nf, sumPacked, type Packed, type Stats } from './NmbuCourseExplorer';

/**
 * «Sammenlignbare emner ved andre studiesteder»: emner fra alle norske institusjoner i samme
 * NUS-fagfelt som det valgte NMBU-emnet, rangert etter navnelikhet og kandidattall, pluss
 * fritekstsøk i hele det nasjonale emneregisteret. Data: kilde/public/emner/ (build-national-courses.py).
 */

interface Meta { generert: string; years: string[]; institusjoner: Record<string, { kort: string; navn: string }>; nus: Record<string, string>; }
interface NatCourse { inst: string; kode: string; navn: string; nus: string; sp: number | null; nivaa: string | null; years: Record<string, Packed>; }
type IndexRow = [string, string, string, string, number | null, string | null, number]; // inst, kode, navn, nus, sp, nivaa, kandidater

const NMBU = '1173';
interface Curated { courses: Record<string, { merknad?: string | null; sammenlignbare: { inst: string; kode: string; sikkerhet?: string | null; merknad?: string | null }[] }> }
const cache: { meta?: Promise<Meta>; index?: Promise<IndexRow[]>; curated?: Promise<Curated | null>; groups: Map<string, Promise<NatCourse[]>> } = { groups: new Map() };
const base = () => `${import.meta.env.BASE_URL}emner/`;
/** Henter JSON; en SPA-fallback (HTML med status 200) eller 404 gir null i stedet for parse-feil. */
async function getJson<T>(url: string): Promise<T | null> {
  const r = await fetch(url);
  if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null;
  return r.json();
}
const loadMeta = () => (cache.meta ??= getJson<Meta>(`${base()}meta.json`).then((m) => { if (!m) throw new Error('meta.json mangler'); return m; }));
const loadCurated = () => (cache.curated ??= getJson<Curated>(`${base()}kuratert.json`));
const loadIndex = () => (cache.index ??= getJson<{ courses: IndexRow[] }>(`${base()}index.json`).then((d) => d?.courses ?? []));
function loadGroup(grp: string): Promise<NatCourse[]> {
  if (!cache.groups.has(grp)) {
    cache.groups.set(grp, grp === 'ukjent' ? Promise.resolve([]) : getJson<{ courses: NatCourse[] }>(`${base()}nus/${grp}.json`).then((d) => d?.courses ?? []));
  }
  return cache.groups.get(grp)!;
}

/** Norsk/engelsk synonymer for navnelikhet. Normaliseres til første ord i hver gruppe. */
const SYNONYMS: string[][] = [
  ['markedsføring', 'marketing', 'marknadsføring'], ['statistikk', 'statistics', 'statistical'], ['økonomi', 'economics', 'economy', 'økonomisk'],
  ['mikroøkonomi', 'microeconomics'], ['makroøkonomi', 'macroeconomics'], ['regnskap', 'accounting', 'rekneskap'], ['finans', 'finance', 'financial'],
  ['ledelse', 'management', 'leiing', 'lederskap', 'leadership'], ['organisasjon', 'organization', 'organisation', 'organisasjonsteori'],
  ['innovasjon', 'innovation'], ['entreprenørskap', 'entrepreneurship'], ['strategi', 'strategy', 'strategic', 'strategisk'],
  ['matematikk', 'mathematics', 'math', 'calculus', 'matematik'], ['kjemi', 'chemistry'], ['biologi', 'biology'], ['fysikk', 'physics'],
  ['programmering', 'programming'], ['informatikk', 'informatics', 'computer'], ['data', 'datavitenskap', 'data science'],
  ['bærekraft', 'bærekraftig', 'sustainability', 'sustainable', 'berekraft'], ['miljø', 'environment', 'environmental', 'miljøvitenskap'],
  ['metode', 'methods', 'method', 'metoder'], ['forskningsmetode', 'research methods'], ['bacheloroppgave', 'bachelor thesis', 'bacheloroppgåve'],
  ['masteroppgave', 'master thesis', 'masteroppgåve'], ['juss', 'jus', 'rett', 'law', 'rettslære', 'jura'], ['psykologi', 'psychology'],
  ['kommunikasjon', 'communication'], ['prosjekt', 'project'], ['eiendom', 'property', 'real estate', 'eigedom'], ['geologi', 'geology'],
  ['økologi', 'ecology'], ['genetikk', 'genetics'], ['statistisk', 'statistikk'], ['analyse', 'analysis', 'analytics'], ['investering', 'investments', 'investment'],
  ['skatt', 'tax', 'taxation'], ['revisjon', 'auditing', 'audit'], ['logistikk', 'logistics', 'supply'], ['planlegging', 'planning'],
];
const SYN: Record<string, string> = {};
SYNONYMS.forEach((g) => g.forEach((w) => { SYN[w] = g[0]; }));
const STOP = new Set(['og', 'i', 'for', 'til', 'av', 'med', 'en', 'et', 'the', 'of', 'and', 'in', 'to', 'a', 'an', 'på', 'om', 'ii', 'iii', 'iv', 'del', 'part', 'innføring', 'introduction', 'intro', 'grunnleggende', 'basic', 'basics', 'generell', 'general']);

function tokens(s: string): Set<string> {
  const out = new Set<string>();
  s.toLowerCase().replace(/[-–/(),.:;]/g, ' ').split(/\s+/).forEach((w) => {
    if (!w || STOP.has(w) || /^\d+$/.test(w)) return;
    out.add(SYN[w] ?? w);
  });
  return out;
}
function similarity(a: string, b: string): number {
  const ta = tokens(a), tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  ta.forEach((t) => { if (tb.has(t)) inter += 1; else { tb.forEach((u) => { if ((u.startsWith(t) || t.startsWith(u)) && Math.min(t.length, u.length) >= 5) inter += 0.7; }); } });
  return inter / Math.max(ta.size, tb.size);
}

interface Row { c: NatCourse; s: Stats; score: number; grunn: string; merknad?: string | null }

export function NmbuNationalCompare({ course, year, visAntall, whole }: {
  course: { kode: string; navn: string; nus?: string | null; sp?: number | null };
  year: string; visAntall: boolean; whole: Stats;
}) {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [group, setGroup] = useState<NatCourse[] | null>(null);
  const [search, setSearch] = useState('');
  const [hits, setHits] = useState<NatCourse[] | null>(null);
  const [insts, setInsts] = useState<Set<string> | null>(null); // null = alle
  const [error, setError] = useState<string | null>(null);
  const [curated, setCurated] = useState<Row[] | null>(null);
  const nus = course.nus ?? '';
  const grp = nus.length >= 4 ? nus.slice(1, 4) : 'ukjent';

  useEffect(() => { loadMeta().then(setMeta).catch((e) => setError(String(e))); }, []);
  // Fagfeltgruppen pluss «999» (uspesifisert NUS, bl.a. alle BI-emner), som bare tas med ved navnelikhet.
  useEffect(() => {
    setGroup(null);
    Promise.all([loadGroup(grp), grp === '999' ? Promise.resolve([]) : loadGroup('999')])
      .then(([g, u]) => setGroup([...g, ...u])).catch((e) => setError(String(e)));
  }, [grp]);

  // Kuraterte koblinger (data/nmbu/sammenlignbare/, bygd til emner/kuratert.json): vises først.
  useEffect(() => {
    let alive = true;
    setCurated(null);
    loadCurated().then(async (cur) => {
      const entry = cur?.courses[course.kode];
      if (!entry) { if (alive) setCurated([]); return; }
      const idx = await loadIndex();
      const byKey = new Map(idx.map((r) => [`${r[0]}|${r[1]}`, r] as const));
      const grps = [...new Set(entry.sammenlignbare.map((x) => { const r = byKey.get(`${x.inst}|${x.kode}`); const n = r?.[3] ?? ''; return n.length >= 4 ? n.slice(1, 4) : 'ukjent'; }))];
      const loaded = (await Promise.all(grps.map(loadGroup))).flat();
      const byC = new Map(loaded.map((c) => [`${c.inst}|${c.kode}`, c] as const));
      const rows: Row[] = [];
      entry.sammenlignbare.forEach((x) => {
        const c = byC.get(`${x.inst}|${x.kode}`);
        if (c) rows.push({ c, s: sumPacked(c.years, year), score: 100, grunn: `Kuratert${x.sikkerhet ? ` · ${x.sikkerhet} sikkerhet` : ''}`, merknad: x.merknad });
      });
      if (alive) setCurated(rows);
    }).catch(() => { if (alive) setCurated([]); });
    return () => { alive = false; };
  }, [course.kode, year]);

  // Fritekstsøk i hele indeksen (alle fagfelt), hent karakterene fra riktige gruppefiler.
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 3) { setHits(null); return; }
    let alive = true;
    loadIndex().then(async (idx) => {
      const m = idx.filter((r) => r[0] !== NMBU && (r[1].toLowerCase().includes(q) || r[2].toLowerCase().includes(q)))
        .sort((a, b) => b[6] - a[6]).slice(0, 150);
      const grps = [...new Set(m.map((r) => (r[3].length >= 4 ? r[3].slice(1, 4) : 'ukjent')))];
      const loaded = await Promise.all(grps.map(loadGroup));
      const byKey = new Map<string, NatCourse>();
      loaded.flat().forEach((c) => byKey.set(`${c.inst}|${c.kode}`, c));
      if (alive) setHits(m.map((r) => byKey.get(`${r[0]}|${r[1]}`)).filter(Boolean) as NatCourse[]);
    });
    return () => { alive = false; };
  }, [search]);

  const rows = useMemo<Row[]>(() => {
    const src = hits ?? group ?? [];
    const out: Row[] = [];
    for (const c of src) {
      if (c.inst === NMBU) continue;
      if (insts && !insts.has(c.inst)) continue;
      const s = sumPacked(c.years, year);
      if (s.total === 0) continue;
      const sameNus = !!(nus && c.nus && c.nus.slice(1) === nus.slice(1));
      const uspes = !c.nus || c.nus.startsWith('9') || (c.nus.length >= 4 && c.nus.slice(1, 4) !== grp);
      const sim = similarity(course.navn, c.navn);
      if (!hits && uspes && sim < 0.3) continue;
      const score = (hits ? 0 : (sameNus ? 2 : 0)) + sim * 3 + Math.min(s.total, 500) / 2000;
      if (!hits && sim < 0.15 && !sameNus) continue;
      out.push({ c, s, score, grunn: uspes ? 'Likt navn (NUS uspesifisert)' : sameNus ? (sim >= 0.3 ? 'Samme NUS-kode og likt navn' : 'Samme NUS-kode') : sim >= 0.3 ? 'Likt navn, samme fagfelt' : 'Samme fagfelt' });
    }
    out.sort((a, b) => b.score - a.score || b.s.total - a.s.total);
    if (hits || !curated?.length) return out.slice(0, 120);
    const curKeys = new Set(curated.map((r) => `${r.c.inst}|${r.c.kode}`));
    const cur = curated.filter((r) => (!insts || insts.has(r.c.inst)) && r.s.total > 0);
    return [...cur, ...out.filter((r) => !curKeys.has(`${r.c.inst}|${r.c.kode}`))].slice(0, 120);
  }, [hits, group, insts, year, nus, course.navn, curated]);

  const instList = useMemo(() => {
    if (!meta) return [];
    const counts = new Map<string, number>();
    (hits ?? group ?? []).forEach((c) => { if (c.inst !== NMBU) counts.set(c.inst, (counts.get(c.inst) ?? 0) + 1); });
    return Object.entries(meta.institusjoner).filter(([k]) => k !== NMBU && counts.has(k)).sort((a, b) => (counts.get(b[0]) ?? 0) - (counts.get(a[0]) ?? 0));
  }, [meta, hits, group]);

  const nusName = meta?.nus[nus] ?? meta?.nus[nus.slice(0, 4)] ?? null;
  const fagfelt = meta?.nus[`6${grp}`] ?? meta?.nus[`7${grp}`] ?? meta?.nus[grp.slice(0, 2) ? `6${grp.slice(0, 2)}` : ''] ?? null;

  return (
    <div className="mt-4">
      <div className="rounded-xl px-4 py-3 mb-3" style={{ backgroundColor: 'var(--nmbu-beige-light)', fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
        NMBU-emnet er klassifisert som <b style={{ color: 'var(--nmbu-neutral-1)' }}>NUS {nus || '–'}{nusName ? ` · ${nusName}` : ''}</b>.
        Under vises emner fra andre institusjoner i samme fagfelt{fagfelt ? ` (${fagfelt})` : ''}, rangert etter navnelikhet og størrelse.
        Bruk søket for å finne emner utenfor fagfeltet. Studieprogram-koblinger finnes ikke på tvers; sammenligningen er på emnenivå.
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', minWidth: 280 }}>
          <Search className="w-4 h-4" style={{ color: 'var(--nmbu-neutral-2)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Søk i alle emner ved alle institusjoner …"
            className="flex-1 outline-none text-sm" style={{ color: 'var(--nmbu-neutral-1)', background: 'transparent' }} />
        </div>
        {search.trim().length >= 3 && <button onClick={() => setSearch('')} className="text-xs underline" style={{ color: 'var(--nmbu-neutral-2)' }}>Tilbake til fagfeltet</button>}
      </div>

      {instList.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <button onClick={() => setInsts(null)} className="px-2.5 py-1 rounded-full text-xs"
            style={{ backgroundColor: insts === null ? 'var(--nmbu-green-dark)' : '#fff', color: insts === null ? '#fff' : 'var(--nmbu-neutral-1)', border: '1px solid var(--nmbu-neutral-3)' }}>Alle</button>
          {instList.map(([k, v]) => {
            const on = insts?.has(k) ?? false;
            return (
              <button key={k} title={v.navn}
                onClick={() => setInsts((prev) => { const n = new Set(prev ?? []); if (n.has(k)) n.delete(k); else n.add(k); return n.size ? n : null; })}
                className="px-2.5 py-1 rounded-full text-xs"
                style={{ backgroundColor: on ? 'var(--nmbu-green-4)' : '#fff', color: 'var(--nmbu-green-dark)', border: '1px solid ' + (on ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)') }}>
                {v.kort}
              </button>
            );
          })}
        </div>
      )}

      {error && <div style={{ fontSize: 12, color: '#c13a5a' }}>Kunne ikke laste nasjonale emnedata: {error}</div>}
      {!error && !group && !hits && <div style={{ fontSize: 13, color: 'var(--nmbu-neutral-2)' }}>Laster emner …</div>}

      {(group || hits) && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
                {['Institusjon', 'Emne', 'Stp', 'Kand.', 'Snitt', 'Stryk'].map((h, i) => (
                  <th key={h} className={`px-3 py-2 ${i >= 2 ? 'text-right' : 'text-left'}`} style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
                {visAntall
                  ? LETTERS.map((g) => <th key={g} className="px-2 py-2 text-right" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 700 }}>{g}</th>)
                  : <th className="px-3 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Fordeling A–F</th>}
                <th className="px-3 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Grunnlag</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-green-4)' }}>
                <td className="px-3 py-2" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>NMBU</td>
                <td className="px-3 py-2"><div style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{emneUrl('1173', course.kode) ? <a href={emneUrl('1173', course.kode)!} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>{course.kode}</a> : course.kode}</div><div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{course.navn}</div></td>
                <td className="px-3 py-2 text-right">{course.sp != null ? nf(course.sp, 0) : '–'}</td>
                <td className="px-3 py-2 text-right" style={{ fontWeight: 700 }}>{whole.total.toLocaleString('nb-NO')}</td>
                <td className="px-3 py-2 text-right" style={{ fontWeight: 700 }}>{whole.snitt != null ? nf(whole.snitt, 2) : '–'}</td>
                <td className="px-3 py-2 text-right" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{whole.stryk != null ? `${nf(whole.stryk, 1)} %` : '–'}</td>
                {visAntall ? <GradeCells s={whole} bold /> : <td className="px-3 py-2" style={{ minWidth: 180 }}><StackedBar s={whole} height={9} /></td>}
                <td className="px-3 py-2" style={{ color: 'var(--nmbu-neutral-2)' }}>Valgt emne</td>
              </tr>
              {rows.map(({ c, s, grunn, merknad }) => (
                <tr key={`${c.inst}|${c.kode}`} style={{ borderBottom: '1px solid var(--nmbu-beige-light)' }}>
                  <td className="px-3 py-2" style={{ fontWeight: 600, whiteSpace: 'nowrap' }} title={meta?.institusjoner[c.inst]?.navn}>{meta?.institusjoner[c.inst]?.kort ?? c.inst}</td>
                  <td className="px-3 py-2">
                    <div style={{ fontWeight: 600, color: 'var(--nmbu-neutral-1)' }}>
                      {emneUrl(c.inst, c.kode)
                        ? <a href={emneUrl(c.inst, c.kode)!} target="_blank" rel="noreferrer" title="Emnebeskrivelse hos institusjonen" className="inline-flex items-center gap-1" style={{ color: 'var(--nmbu-green-dark)', textDecoration: 'underline' }}>{c.kode} <ExternalLink className="w-3 h-3" /></a>
                        : c.kode}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{c.navn}{c.nus && c.nus !== nus ? ` · NUS ${c.nus}` : ''}</div>
                  </td>
                  <td className="px-3 py-2 text-right">{c.sp != null ? nf(c.sp, 0) : '–'}</td>
                  <td className="px-3 py-2 text-right" style={{ fontWeight: 600 }}>{s.total.toLocaleString('nb-NO')}</td>
                  <td className="px-3 py-2 text-right">{s.snitt != null ? nf(s.snitt, 2) : '–'}</td>
                  <td className="px-3 py-2 text-right" style={{ whiteSpace: 'nowrap' }}>{s.stryk != null ? `${s.skjult ? '≥ ' : ''}${nf(s.stryk, 1)} %` : '–'}</td>
                  {visAntall ? <GradeCells s={s} /> : <td className="px-3 py-2" style={{ minWidth: 180 }}><StackedBar s={s} height={9} /></td>}
                  <td className="px-3 py-2" style={{ color: grunn.startsWith('Kuratert') ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', whiteSpace: 'nowrap', fontWeight: grunn.startsWith('Kuratert') ? 600 : 400 }} title={merknad ?? undefined}>{hits ? 'Søketreff' : grunn}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-6 text-center" style={{ color: 'var(--nmbu-neutral-2)' }}>
                  {hits ? 'Ingen treff.' : `Ingen emner i samme fagfelt med kandidater ${year === ALLE ? '' : 'i ' + year}. Prøv «Alle år» eller søk.`}
                </td></tr>
              )}
            </tbody>
          </table>
          <div className="mt-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
            {rows.length} emner vist{rows.length >= 120 ? ' (de 120 mest relevante)' : ''}. Emnenivå: alle studenter på emnet uansett studieprogram. Karakterer fra DBH 308; skjermede celler gjør stryk til et minimum (≥).
          </div>
        </div>
      )}
    </div>
  );
}
