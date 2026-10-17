import { useMemo, useState, type ReactNode } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Building2, TrendingUp, BookOpen, GraduationCap, Users, Star, Microscope, ExternalLink, Info } from 'lucide-react';
import type { FacultyData } from '../data/faculties';
import type { FullAdmissionEntry, FullYearData } from '../data/fullAdmissionData';
import type { CourseStats, CourseGradeYear } from '../data/landsamCourseData';
import { SB_DIMENSION_LABELS, type SbDimension } from '../data/landsamStudiebarometerData';
import { UHR_GROUPS, COURSE_MAPPING } from '../data/courseMapping';
import { STAFF_FACULTIES, STAFF_INSTITUTIONS, STAFF_HENTET, type StaffUnit, type StaffYear } from '../data/staffData';
import { ECON_UNITS } from '../data/economyData';
import { emneUrl } from '../data/emneUrl';
import { KONKURRENTER, KONKURRENTER_KOMMER, konkurrent as finnKonkurrent, type Konkurrent } from '../data/konkurrenter';

/**
 * Konkurrentprofil: én institusjon om gangen (OsloMet først), satt sammen av HH-dataene som allerede finnes.
 * Alt vises side om side med det tilsvarende NMBU-programmet. Konfigurasjonen ligger i data/konkurrenter.ts.
 */

const NMBU_FARGE = 'var(--nmbu-green-dark)';
const NMBU_LINJE = '#00594F';
const KONK_FARGE = '#B45309';
const ADM_AAR = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];

const nf = (v: number | null | undefined, d = 0) => (v == null ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d }));
const pst = (v: number | null | undefined, d = 0) => (v == null || !Number.isFinite(v) ? '–' : `${nf(v, d)} %`);
const andel = (t: number | null | undefined, n: number | null | undefined) => (t == null || !n ? null : (t / n) * 100);
const bokstav = (s: number | null) => (s == null ? '' : ['F', 'E', 'D', 'C', 'B', 'A'][Math.max(0, Math.min(5, Math.round(s)))]);
const kode = (emnekode: string) => emnekode.split('-')[0].toUpperCase();

function Kort({ ikon: Ikon, tittel, undertekst, children, kilde }: { ikon: typeof Building2; tittel: string; undertekst?: ReactNode; children: ReactNode; kilde?: ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex items-center gap-2 mb-1" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>
        <Ikon className="w-4 h-4" /> {tittel}
      </div>
      {undertekst && <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginBottom: 10 }}>{undertekst}</div>}
      {children}
      {kilde && <div className="mt-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{kilde}</div>}
    </div>
  );
}

function Prikk({ farge }: { farge: string }) {
  return <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ backgroundColor: farge }} />;
}

/** Nøkkeltall: konkurrenten øverst, NMBU under, med samme enhet. */
function Tall({ etikett, konk, nmbu, hjelp, kortNavn }: { etikett: string; konk: string; nmbu: string | null; hjelp?: string; kortNavn: string }) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--nmbu-beige-light)' }} title={hjelp}>
      <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>{etikett}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: KONK_FARGE, lineHeight: 1.3 }}>{konk}</div>
      <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{kortNavn}</div>
      {nmbu != null && <div style={{ fontSize: 12, marginTop: 4 }}><span style={{ fontWeight: 700, color: NMBU_FARGE }}>{nmbu}</span> <span style={{ color: 'var(--nmbu-neutral-2)' }}>NMBU</span></div>}
    </div>
  );
}

const th = 'px-3 py-2 text-right whitespace-nowrap';
const td = 'px-3 py-1.5 text-right whitespace-nowrap';
const thead = { backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' };
const rad = { borderTop: '1px solid var(--nmbu-neutral-3)' };

export function Konkurrentprofil({ faculty, initial }: { faculty: FacultyData; initial?: string | null }) {
  const [id, setId] = useState(() => finnKonkurrent(initial).id);
  const k = finnKonkurrent(id);
  const velg = (ny: string) => {
    setId(ny);
    try { const u = new URL(window.location.href); u.searchParams.set('konkurrent', ny); window.history.replaceState(null, '', u); } catch { /* */ }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Institusjon:</span>
        {KONKURRENTER.map((x) => (
          <button key={x.id} onClick={() => velg(x.id)} className="px-3 py-1 rounded-full text-sm"
            style={x.id === k.id ? { backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', fontWeight: 600 } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' }}>
            {x.kort}
          </button>
        ))}
        {KONKURRENTER_KOMMER.map((n) => (
          <span key={n} className="px-3 py-1 rounded-full text-sm" title="Kommer" style={{ border: '1px dashed var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>{n}</span>
        ))}
      </div>
      <Profil key={k.id} k={k} faculty={faculty} />
    </div>
  );
}

function Profil({ k, faculty }: { k: Konkurrent; faculty: FacultyData }) {
  const entry = (eid: string | null): FullAdmissionEntry | undefined => (eid ? faculty.admissionGroups.flatMap((g) => g.entries).find((e) => e.id === eid) : undefined);
  const hoved = k.programmer[0];
  const ki = entry(hoved.entryId), nm = entry(hoved.nmbuId);
  const y26 = (e?: FullAdmissionEntry) => e?.years['2026'];
  const sbK = faculty.studiebarometer.find((s) => s.entryId === hoved.entryId);
  const sbN = faculty.studiebarometer.find((s) => s.entryId === hoved.nmbuId);
  const komp = (eid: string | null) => faculty.completionGroups.flatMap((g) => g.programs).find((p) => p.entryId === eid);
  const sisteKull = (eid: string | null) => { const ku = komp(eid)?.kull ?? []; return ku[ku.length - 1]; };
  const kK = sisteKull(hoved.entryId), kN = sisteKull(hoved.nmbuId);
  const perPlass = (y?: FullYearData) => (y?.fvS != null && y.plasser ? y.fvS / y.plasser : null);

  return (
    <>
      <Kort ikon={Building2} tittel={k.navn}
        undertekst={<>Studiested {k.studiested} · økonomiprogrammene eies av {k.enhetNavn} · DBH-institusjonskode {k.inst} · <a href={k.nettside} target="_blank" rel="noreferrer" className="underline">programsiden <ExternalLink className="w-3 h-3 inline" /></a></>}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Tall kortNavn={k.kort} etikett="Søkere 2026 (alle)" konk={nf(y26(ki)?.alleS)} nmbu={nf(y26(nm)?.alleS)} hjelp="Alle søkere med programmet på en av prioritetene, bachelor i økonomi og administrasjon" />
          <Tall kortNavn={k.kort} etikett="Førstevalg 2026" konk={nf(y26(ki)?.fvS)} nmbu={nf(y26(nm)?.fvS)} />
          <Tall kortNavn={k.kort} etikett="Studieplasser 2026" konk={nf(y26(ki)?.plasser)} nmbu={nf(y26(nm)?.plasser)} />
          <Tall kortNavn={k.kort} etikett="Førstevalg per plass" konk={nf(perPlass(y26(ki)), 1)} nmbu={nf(perPlass(y26(nm)), 1)} />
          <Tall kortNavn={k.kort} etikett="Poenggrense ordinær 2026" konk={nf(y26(ki)?.pg_ord, 1)} nmbu={nf(y26(nm)?.pg_ord, 1)} hjelp="Konkurransepoeng, hovedopptaket" />
          <Tall kortNavn={k.kort} etikett={`Fullført på normert tid${kK ? ` (kull ${kK.aar})` : ''}`} konk={pst(andel(kK?.fullfortNormert, kK?.startkull))} nmbu={pst(andel(kN?.fullfortNormert, kN?.startkull))} />
        </div>
        <div className="mt-3" style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)' }}>
          <b>Programmene i sammenligningen:</b> {k.programmer.map((p) => p.etikett).join(' · ')}.
          {sbK?.scores.helhetsvurdering != null && <> Studiebarometeret {sbK.latestYear}, helhetsvurdering: <b style={{ color: KONK_FARGE }}>{nf(sbK.scores.helhetsvurdering, 1)}</b>{sbN?.scores.helhetsvurdering != null && <> mot <b style={{ color: NMBU_FARGE }}>{nf(sbN.scores.helhetsvurdering, 1)}</b> ved NMBU</>}.</>}
        </div>
        {k.merknad && <div className="mt-2 flex gap-1.5" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}><Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />{k.merknad}</div>}
      </Kort>

      <Opptak k={k} entry={entry} />
      <UhrEmner k={k} faculty={faculty} />
      <Gjennomforing k={k} faculty={faculty} />
      <Studentene k={k} faculty={faculty} />
      <Studiebarometer k={k} faculty={faculty} />
      <Fagmiljo k={k} />
    </>
  );
}

/* ── Opptak ─────────────────────────────────────────────────────────────────────────────── */

function Opptak({ k, entry }: { k: Konkurrent; entry: (id: string | null) => FullAdmissionEntry | undefined }) {
  const samordna = k.programmer.filter((p) => { const e = entry(p.entryId); return e && !e.lokaltOpptak; });
  const [valgt, setValgt] = useState(samordna[0]?.entryId ?? '');
  const p = samordna.find((x) => x.entryId === valgt) ?? samordna[0];
  if (!p) return null;
  const ki = entry(p.entryId), nm = entry(p.nmbuId);
  const serie = ADM_AAR.map((a) => ({
    aar: a,
    k_ord: ki?.years[a]?.pg_ord || null, k_fv: ki?.years[a]?.pg_fv || null,
    n_ord: nm?.years[a]?.pg_ord || null, n_fv: nm?.years[a]?.pg_fv || null,
  }));
  const lokale = k.programmer.filter((x) => entry(x.entryId)?.lokaltOpptak);
  return (
    <Kort ikon={TrendingUp} tittel="Opptak 2020–2026"
      undertekst={<>Søkere, studieplasser og poenggrenser i hovedopptaket. {k.kort} i oransje, NMBU i grønt. {lokale.length > 0 && <>Masterprogrammene ({lokale.map((x) => x.etikett).join(', ')}) har lokalt opptak og er ikke i Samordna.</>}</>}
      kilde="Kilde: Samordna opptak (søkertall og poenggrenserapporten), hovedopptaket. 0 i poenggrensen betyr at alle kvalifiserte fikk tilbud.">
      {samordna.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {samordna.map((x) => (
            <button key={x.entryId} onClick={() => setValgt(x.entryId)} className="px-2.5 py-0.5 rounded-full text-xs"
              style={x.entryId === p.entryId ? { backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 700 } : { border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)' }}>
              {x.etikett}
            </button>
          ))}
        </div>
      )}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={thead}>
                <th className="px-3 py-2 text-left">År</th>
                <th className={th}>Førstevalg</th><th className={th}>Plasser</th><th className={th}>Per plass</th>
                <th className={th}>Grense ord.</th><th className={th}>Grense FV</th>
              </tr>
            </thead>
            <tbody>
              {ADM_AAR.map((a) => {
                const yk = ki?.years[a], yn = nm?.years[a];
                const celle = (vk: string, vn: string) => (
                  <td className={td}><span style={{ color: KONK_FARGE, fontWeight: 600 }}>{vk}</span>{nm && <div style={{ color: NMBU_FARGE }}>{vn}</div>}</td>
                );
                return (
                  <tr key={a} style={rad}>
                    <td className="px-3 py-1.5" style={{ fontWeight: 600 }}>{a}</td>
                    {celle(nf(yk?.fvS), nf(yn?.fvS))}
                    {celle(nf(yk?.plasser), nf(yn?.plasser))}
                    {celle(nf(yk?.fvS != null && yk.plasser ? yk.fvS / yk.plasser : null, 1), nf(yn?.fvS != null && yn.plasser ? yn.fvS / yn.plasser : null, 1))}
                    {celle(nf(yk?.pg_ord, 1), nf(yn?.pg_ord, 1))}
                    {celle(nf(yk?.pg_fv, 1), nf(yn?.pg_fv, 1))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!nm && <div className="mt-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>NMBU har ikke et tilsvarende program.</div>}
        </div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={serie} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="aar" tick={{ fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => nf(v, 1)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line dataKey="k_ord" name={`${k.kort} ordinær`} stroke={KONK_FARGE} strokeWidth={2} dot={{ r: 2.5 }} connectNulls />
              <Line dataKey="k_fv" name={`${k.kort} førstegangsvitnemål`} stroke={KONK_FARGE} strokeDasharray="4 3" strokeWidth={1.6} dot={{ r: 2 }} connectNulls />
              {nm && <Line dataKey="n_ord" name="NMBU ordinær" stroke={NMBU_LINJE} strokeWidth={2} dot={{ r: 2.5 }} connectNulls />}
              {nm && <Line dataKey="n_fv" name="NMBU førstegangsvitnemål" stroke={NMBU_LINJE} strokeDasharray="4 3" strokeWidth={1.6} dot={{ r: 2 }} connectNulls />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Kort>
  );
}

/* ── UHR-rammeplanen ───────────────────────────────────────────────────────────────────── */

/** Siste år med karakterer for hele emnet (alle studenter ved institusjonen), ellers for programmets studenter. */
function sisteAar(c?: CourseStats): CourseGradeYear | undefined {
  if (!c) return undefined;
  const rader = (c.emnenivaa?.length ? c.emnenivaa : c.years).filter((y) => y.total > 0);
  return rader[rader.length - 1];
}

function UhrEmner({ k, faculty }: { k: Konkurrent; faculty: FacultyData }) {
  const hoved = k.programmer[0];
  const emner = useMemo(() => {
    const finn = (eid: string | null) => {
      const m = new Map<string, CourseStats>();
      for (const g of faculty.courseGroups) for (const p of g.programs) if (p.entryId === eid) for (const c of p.courses) m.set(kode(c.emnekode), c);
      return m;
    };
    return { k: finn(hoved.entryId), n: finn(hoved.nmbuId) };
  }, [faculty.courseGroups, hoved.entryId, hoved.nmbuId]);

  if (!faculty.emnerLastet) return <Kort ikon={BookOpen} tittel="UHR-rammeplanen: obligatoriske emner">Laster emnedataene …</Kort>;

  const linjer = UHR_GROUPS.flatMap((g) => g.courses.map((c) => {
    const mk = COURSE_MAPPING[c.id as keyof typeof COURSE_MAPPING]?.[k.uhr];
    const mn = COURSE_MAPPING[c.id as keyof typeof COURSE_MAPPING]?.nmbu;
    const sk = mk ? emner.k.get(mk.displayCode.toUpperCase()) : undefined;
    const sn = mn ? emner.n.get(mn.displayCode.toUpperCase()) : undefined;
    return { gruppe: g, emne: c, mk, mn, sk, sn, yk: sisteAar(sk), yn: sisteAar(sn) };
  }));
  const spK = linjer.reduce((s, l) => s + (l.sk?.studiepoeng ?? 0), 0);
  const spN = linjer.reduce((s, l) => s + (l.sn?.studiepoeng ?? 0), 0);
  const snitt = (xs: (number | null | undefined)[]) => { const t = xs.filter((x): x is number => x != null); return t.length ? t.reduce((a, b) => a + b, 0) / t.length : null; };
  const strykK = snitt(linjer.map((l) => l.yk?.strykprosent)), strykN = snitt(linjer.map((l) => l.yn?.strykprosent));

  const emneCelle = (m: typeof linjer[number]['mk'], s: CourseStats | undefined, inst: string, farge: string) => {
    if (!m) return <td className="px-3 py-1.5" style={{ color: 'var(--nmbu-neutral-2)' }}>–</td>;
    const url = emneUrl(inst, s?.emnekode ?? m.displayCode) ?? m.courseUrl;
    return (
      <td className="px-3 py-1.5">
        <span style={{ fontWeight: 700, color: farge }}>{url ? <a href={url} target="_blank" rel="noreferrer" className="hover:underline">{m.displayCode}</a> : m.displayCode}</span>
        <span style={{ color: 'var(--nmbu-neutral-1)' }}> {s?.emnenavn ?? m.courseName}</span>
        {s?.studiepoeng != null && <span style={{ color: 'var(--nmbu-neutral-2)' }}> · {nf(s.studiepoeng, s.studiepoeng % 1 ? 1 : 0)} sp</span>}
      </td>
    );
  };
  const tallCeller = (y?: CourseGradeYear) => (
    <>
      <td className={td}>{y ? <>{nf(y.snitt, 2)} <span style={{ color: 'var(--nmbu-neutral-2)' }}>{bokstav(y.snitt)}</span></> : '–'}</td>
      <td className={td}>{pst(y?.strykprosent, 1)}</td>
      <td className={td} style={{ color: 'var(--nmbu-neutral-2)' }}>{y ? `${nf(y.total)} (${y.year})` : '–'}</td>
    </>
  );

  return (
    <Kort ikon={BookOpen} tittel="UHR-rammeplanen: de obligatoriske emnene"
      undertekst={<>Emnene i UHRs nasjonale rammeplan for bachelor i økonomi og administrasjon, kartlagt mot emnene ved {k.kort} og NMBU. Snittkarakteren er regnet med A = 5 … F = 0, og tallene gjelder alle som tok emnet det siste året med karakterer. Kjerneemnene utgjør {nf(spK, 1)} sp ved {k.kort} og {nf(spN, 1)} sp ved NMBU. Gjennomsnittlig stryk: <b style={{ color: KONK_FARGE }}>{pst(strykK, 1)}</b> mot <b style={{ color: NMBU_FARGE }}>{pst(strykN, 1)}</b> ved NMBU.</>}
      kilde="Kilde: UHR-ØA rammeplan, kartleggingen i «Opprinnelig HH-analyse» (rettet 17.10.2026: mikro- og makroøkonomi var byttet om for OsloMet), karakterer fra DBH/HK-dir tabell 308.">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={thead}>
              <th className="px-3 py-2 text-left">UHR-emne</th>
              <th className="px-3 py-2 text-left"><Prikk farge={KONK_FARGE} />{k.kort}</th>
              <th className={th}>Snitt</th><th className={th}>Stryk</th><th className={th}>Kandidater</th>
              <th className="px-3 py-2 text-left"><Prikk farge={NMBU_LINJE} />NMBU</th>
              <th className={th}>Snitt</th><th className={th}>Stryk</th><th className={th}>Kandidater</th>
            </tr>
          </thead>
          <tbody>
            {linjer.map((l, i) => (
              <tr key={l.emne.id} style={{ ...rad, ...(i > 0 && linjer[i - 1].gruppe.id !== l.gruppe.id ? { borderTop: '2px solid var(--nmbu-neutral-3)' } : {}) }}>
                <td className="px-3 py-1.5 whitespace-nowrap"><div style={{ fontWeight: 600 }}>{l.emne.label}</div><div style={{ color: 'var(--nmbu-neutral-2)', fontSize: 10 }}>{l.gruppe.label}</div></td>
                {emneCelle(l.mk, l.sk, k.inst, KONK_FARGE)}
                {tallCeller(l.yk)}
                {emneCelle(l.mn, l.sn, '1173', NMBU_FARGE)}
                {tallCeller(l.yn)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Kort>
  );
}

/* ── Gjennomføring ─────────────────────────────────────────────────────────────────────── */

function Gjennomforing({ k, faculty }: { k: Konkurrent; faculty: FacultyData }) {
  const prog = (eid: string | null) => faculty.completionGroups.flatMap((g) => g.programs).find((p) => p.entryId === eid);
  const rader = k.programmer.map((p) => ({ p, ki: prog(p.entryId), nm: prog(p.nmbuId) })).filter((r) => r.ki);
  if (!rader.length) return null;
  const sisteAarRad = (pr?: ReturnType<typeof prog>) => pr?.aar[pr.aar.length - 1];
  return (
    <Kort ikon={GraduationCap} tittel="Gjennomføring og studenttall"
      undertekst="Fullført på normert tid og frafall for de siste startkullene, og registrerte studenter, nye studenter og kandidater det siste året. Frafall betyr at studenten har sluttet på programmet uten grad."
      kilde="Kilde: DBH/HK-dir tabell 707 (gjennomføring), 123, 110 og 104.">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={thead}>
              <th className="px-3 py-2 text-left">Program</th>
              <th className="px-3 py-2 text-left">Kull</th>
              <th className={th}>Startkull</th><th className={th}>Fullført normert</th><th className={th}>Frafalt</th>
              <th className={th}>Registrerte</th><th className={th}>Nye</th><th className={th}>Kandidater</th>
            </tr>
          </thead>
          <tbody>
            {rader.flatMap(({ p, ki, nm }) => [ki, nm].filter(Boolean).map((pr, j) => {
              const kull = pr!.kull.slice(-3);
              const ar = sisteAarRad(pr);
              const farge = j === 0 ? KONK_FARGE : NMBU_LINJE;
              return (
                <tr key={`${p.entryId}-${j}`} style={{ ...rad, ...(j === 0 ? { borderTop: '2px solid var(--nmbu-neutral-3)' } : {}) }}>
                  <td className="px-3 py-1.5"><Prikk farge={farge} /><b>{pr!.shortName}</b> <span style={{ color: 'var(--nmbu-neutral-2)' }}>{j === 0 ? p.etikett : pr!.programnavn}</span></td>
                  <td className="px-3 py-1.5 whitespace-nowrap">{kull.length ? kull.map((x) => x.aar).join(' · ') : '–'}</td>
                  <td className={td}>{kull.length ? kull.map((x) => nf(x.startkull)).join(' · ') : '–'}</td>
                  <td className={td}>{kull.length ? kull.map((x) => pst(andel(x.fullfortNormert, x.startkull))).join(' · ') : '–'}</td>
                  <td className={td}>{kull.length ? kull.map((x) => pst(andel(x.frafalt, x.startkull))).join(' · ') : '–'}</td>
                  <td className={td}>{nf(ar?.registrerte)}</td>
                  <td className={td}>{nf(ar?.nye)}</td>
                  <td className={td}>{nf(ar?.kandidater)}{ar && <span style={{ color: 'var(--nmbu-neutral-2)' }}> ({ar.aar})</span>}</td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>
    </Kort>
  );
}

/* ── Studentene ────────────────────────────────────────────────────────────────────────── */

function Studentene({ k, faculty }: { k: Konkurrent; faculty: FacultyData }) {
  const prog = (eid: string | null) => faculty.studentGroups.flatMap((g) => g.programs).find((p) => p.entryId === eid);
  const rader = k.programmer.flatMap((p) => [{ p, pr: prog(p.entryId), konk: true }, ...(p.nmbuId ? [{ p, pr: prog(p.nmbuId), konk: false }] : [])]).filter((r) => r.pr?.aar.length);
  if (!rader.length) return null;
  return (
    <Kort ikon={Users} tittel="Studentene"
      undertekst="Registrerte studenter høsten det siste året, fordelt på alder, og andelen utenlandske studenter og studenter på utveksling."
      kilde="Kilde: DBH/HK-dir tabell 60, 135 og 142.">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={thead}>
              <th className="px-3 py-2 text-left">Program</th><th className={th}>År</th><th className={th}>Studenter</th>
              <th className={th}>21 år og yngre</th><th className={th}>22–24</th><th className={th}>25–29</th><th className={th}>30+</th>
              <th className={th}>Utenlandske</th><th className={th}>På utveksling</th>
            </tr>
          </thead>
          <tbody>
            {rader.map(({ p, pr, konk }) => {
              const y = pr!.aar[pr!.aar.length - 1];
              return (
                <tr key={pr!.entryId} style={{ ...rad, ...(konk ? { borderTop: '2px solid var(--nmbu-neutral-3)' } : {}) }}>
                  <td className="px-3 py-1.5"><Prikk farge={konk ? KONK_FARGE : NMBU_LINJE} /><b>{pr!.shortName}</b> <span style={{ color: 'var(--nmbu-neutral-2)' }}>{konk ? p.etikett : pr!.programnavn}</span></td>
                  <td className={td}>{y.aar}</td><td className={td}>{nf(y.total)}</td>
                  <td className={td}>{pst(andel(y.a21, y.total))}</td><td className={td}>{pst(andel(y.a24, y.total))}</td>
                  <td className={td}>{pst(andel(y.a29, y.total))}</td><td className={td}>{pst(andel(y.a30, y.total))}</td>
                  <td className={td}>{pst(andel(y.utenlandske, y.total), 1)}</td><td className={td}>{pst(andel(y.utveksling, y.total), 1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Kort>
  );
}

/* ── Studiebarometeret ─────────────────────────────────────────────────────────────────── */

const DIM: SbDimension[] = ['helhetsvurdering', 'undervisning', 'tilbakemeldinger', 'vurderingsformer', 'laeringsmiljo', 'organisering', 'yrkesrelevans', 'engasjement'];

function Studiebarometer({ k, faculty }: { k: Konkurrent; faculty: FacultyData }) {
  const par = k.programmer
    .map((p) => ({ p, sk: faculty.studiebarometer.find((s) => s.entryId === p.entryId), sn: faculty.studiebarometer.find((s) => s.entryId === p.nmbuId) }))
    .filter((x) => x.sk?.latestYear);
  const harTall = (x: (typeof par)[number]) => DIM.some((d) => x.sk?.scores[d] != null);
  const [valgt, setValgt] = useState((par.find(harTall) ?? par[0])?.p.entryId ?? '');
  const v = par.find((x) => x.p.entryId === valgt) ?? par[0];
  if (!v) return null;
  const { sk, sn } = v;
  const strek = (verdi: number | null | undefined, farge: string) => (
    <div className="flex items-center gap-2">
      <div className="h-2 rounded-full" style={{ width: `${verdi != null ? ((verdi - 1) / 4) * 100 : 0}%`, maxWidth: '100%', backgroundColor: farge, minWidth: verdi != null ? 4 : 0 }} />
      <span style={{ fontSize: 11, fontWeight: 600 }}>{nf(verdi, 1)}</span>
    </div>
  );
  return (
    <Kort ikon={Star} tittel="Studiebarometeret"
      undertekst={<>Studentenes vurdering på en skala fra 1 til 5, siste år med nok svar. {k.kort}: {sk!.latestYear}, {nf(sk!.respondents)} svar{sk!.responseRate != null && ` (${nf(sk!.responseRate)} %)`}.{sn?.latestYear && <> NMBU: {sn.latestYear}, {nf(sn.respondents)} svar.</>}</>}
      kilde={<>Kilde: studiebarometeret.no. {sk!.url && <a href={sk!.url} target="_blank" rel="noreferrer" className="underline">{k.kort} på Studiebarometeret</a>}</>}>
      {par.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {par.map((x) => (
            <button key={x.p.entryId} onClick={() => setValgt(x.p.entryId)} className="px-2.5 py-0.5 rounded-full text-xs"
              style={x.p.entryId === v.p.entryId ? { backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 700 } : { border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)' }}>
              {x.p.etikett}
            </button>
          ))}
        </div>
      )}
      {!harTall(v) && (
        <div className="mb-3 flex gap-1.5 rounded-lg p-2.5" style={{ fontSize: 12, backgroundColor: '#FEF3C7', color: '#92400E' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Studiebarometeret viser ikke resultater for {k.kort} på dette programmet{sk!.responseRate != null && ` (svarprosent ${nf(sk!.responseRate)} %)`}: {sk!.warning ?? 'for få svar.'}</span>
        </div>
      )}
      <div className="grid gap-x-6 gap-y-2" style={{ gridTemplateColumns: 'minmax(140px, max-content) 1fr 1fr' }}>
        <div /><div style={{ fontSize: 11, fontWeight: 700, color: KONK_FARGE }}>{k.kort}</div><div style={{ fontSize: 11, fontWeight: 700, color: NMBU_FARGE }}>{sn ? 'NMBU' : 'NMBU (ikke tilsvarende program)'}</div>
        {DIM.map((d) => (
          <div key={d} className="contents">
            <div style={{ fontSize: 12, fontWeight: d === 'helhetsvurdering' ? 700 : 400 }}>{SB_DIMENSION_LABELS[d]}</div>
            {strek(sk!.scores[d], KONK_FARGE)}
            {sn ? strek(sn.scores[d], NMBU_LINJE) : <div />}
          </div>
        ))}
      </div>
    </Kort>
  );
}

/* ── Fagmiljø og økonomi ───────────────────────────────────────────────────────────────── */

function Fagmiljo({ k }: { k: Konkurrent }) {
  const hh = STAFF_FACULTIES.hh ?? [];
  const enhet = hh.find((u) => u.id === k.enhet);
  const nmbuHh = hh.find((u) => u.isNmbu);
  const instK = STAFF_INSTITUTIONS.find((u) => u.inst === k.inst);
  const instN = STAFF_INSTITUTIONS.find((u) => u.inst === '1173');
  const okK = ECON_UNITS.find((u) => u.inst === k.inst), okN = ECON_UNITS.find((u) => u.inst === '1173');
  const siste = (u?: StaffUnit): StaffYear | undefined => u?.years[u.years.length - 1];
  const rader: { navn: string; u?: StaffUnit; farge: string }[] = [
    { navn: `${k.kort} ${enhet ? enhet.navn.replace(/^Fakultet for /, '').replace(/^./, (c) => c.toUpperCase()) : ''}`, u: enhet, farge: KONK_FARGE },
    { navn: 'NMBU Handelshøyskolen', u: nmbuHh, farge: NMBU_LINJE },
    { navn: `${k.kort} (hele)`, u: instK, farge: KONK_FARGE },
    { navn: 'NMBU (hele)', u: instN, farge: NMBU_LINJE },
  ];
  const okS = (u?: typeof okK) => u?.years[u.years.length - 1];
  const mrd = (v: number | null | undefined) => (v == null ? '–' : `${nf(v / 1e6, 2)} mrd.`);
  return (
    <Kort ikon={Microscope} tittel="Fagmiljøet og økonomien"
      undertekst="Faglige årsverk, studentårsverk per faglig årsverk, andel i førstestilling og publisering, for fakultetet som eier økonomiprogrammene og for hele institusjonen. Driftsinntektene gjelder hele institusjonen."
      kilde={`Kilde: DBH/HK-dir tabell 225, 220, 123, 373/374 og 902 (hentet ${STAFF_HENTET.split('-').reverse().join('.')}).`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={thead}>
              <th className="px-3 py-2 text-left">Enhet</th><th className={th}>År</th><th className={th}>Faglige årsverk</th>
              <th className={th}>Studentårsverk per faglig</th><th className={th}>Førstestilling</th><th className={th}>Publ.poeng per faglig</th><th className={th}>Studenter</th>
            </tr>
          </thead>
          <tbody>
            {rader.map(({ navn, u, farge }) => {
              const y = siste(u);
              return (
                <tr key={navn} style={rad}>
                  <td className="px-3 py-1.5"><Prikk farge={farge} />{navn}</td>
                  <td className={td}>{y?.aar ?? '–'}</td><td className={td}>{nf(y?.faglige, 1)}</td>
                  <td className={td}>{nf(y?.studentarsverk != null && y.faglige ? y.studentarsverk / y.faglige : null, 1)}</td>
                  <td className={td}>{pst(andel(y?.forste, y?.faglige))}</td>
                  <td className={td}>{nf(y?.publPoeng != null && y.faglige ? y.publPoeng / y.faglige : null, 2)}</td>
                  <td className={td}>{nf(y?.studenter)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {okK && okN && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Tall kortNavn={`${k.kort} ${okS(okK)?.aar}`} etikett="Driftsinntekter" konk={mrd(okS(okK)?.driftsinntekter)} nmbu={mrd(okS(okN)?.driftsinntekter)} hjelp="I milliarder kroner (DBH oppgir tusen kroner)" />
          <Tall kortNavn={k.kort} etikett="Statstilskudd, andel" konk={pst(andel(okS(okK)?.statstilskudd, okS(okK)?.driftsinntekter))} nmbu={pst(andel(okS(okN)?.statstilskudd, okS(okN)?.driftsinntekter))} />
          <Tall kortNavn={k.kort} etikett="Forskningsrådet, andel" konk={pst(andel(okS(okK)?.nfr, okS(okK)?.driftsinntekter), 1)} nmbu={pst(andel(okS(okN)?.nfr, okS(okN)?.driftsinntekter), 1)} />
          <Tall kortNavn={k.kort} etikett="Studentårsverk" konk={nf(okS(okK)?.studentarsverk)} nmbu={nf(okS(okN)?.studentarsverk)} />
        </div>
      )}
    </Kort>
  );
}

