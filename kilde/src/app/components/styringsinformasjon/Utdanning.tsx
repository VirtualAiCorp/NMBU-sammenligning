/**
 * «Utdanning»: samleside for hele NMBU med fakultetene side om side og konkurrentene som sammenligning.
 * Data: fakultetsdataene (opptak fra Samordna, gjennomføring fra DBH 707, Studiebarometeret), DBH 123/900
 * (staffData), DBH 750 (economyData), studieplasser og ledig-lista (public/studieplasser/data.json),
 * NMBU_PRODUKSJON (revenueData) og NMBUs egne måltall (public/ledelse/nmbu.json, valgfri).
 */
import { useMemo, useState, type ReactNode } from 'react';
import { Armchair, BookOpen, Eye, GraduationCap, Layers, Target, TrendingUp, Users } from 'lucide-react';
import { useAllFacultyBases, type FacultyBase } from '../../data/faculties';
import { FACULTY_META, type FacultyId } from '../../data/facultyMeta';
import { STAFF_INSTITUTIONS, STAFF_NMBU_FACULTIES, type StaffUnit } from '../../data/staffData';
import { ECON_UNITS } from '../../data/economyData';
import { NMBU_PRODUKSJON } from '../../data/revenueData';
import type { Kpi } from '../arbeidsflate/Byggeklosser';
import { FAKULTETER } from '../arbeidsflate/navigasjon';
import { KILDER, dbh } from '../Kildeboks';
import {
  Del, Endring, Hoderad, Merke, Nokkeltall, Rad, SparkMedTekst, Stille, StyringSide, TD, TDV, TH, THV, Tabell, Undertittel, Valg, endringPst, mill, nf, pst,
} from './felles';
import {
  FAK_KODE, GJ_TIL, OPPTAKSAAR, gjennomforingPerAar, helhet, hentStudieplasser, nmbuProgrammer, sisteKull, stabilSerie, sumOgEndring, useJson, type NmbuProgram, type PlassData,
} from './data';
import { IndikatorTabell, kd, type Kol } from './indikatorer';
import { LedelseSerier, LedelseTekstpunkter, datoTekst, useLedelse } from './ledelse';

const NMBU_STAFF = STAFF_INSTITUTIONS.find((u) => u.isNmbu)!;
const NMBU_ECON = ECON_UNITS.find((u) => u.isNmbu)!;
const GJ_AAR = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
const SISTE_OPPTAK = OPPTAKSAAR[OPPTAKSAAR.length - 1];
const fakNavn = (id: FacultyId) => FACULTY_META[id].shortLabel;
const staffFor = (id: FacultyId) => STAFF_NMBU_FACULTIES.find((u) => u.fakultetskode === FAK_KODE[id]);
/**
 * Studentårsverk på denne siden er de egenfinansierte (DBH 900 «Ny produksjon egentfin»): det er dem som gir uttelling i
 * finansieringssystemet. Totalen med eksternfinansiert produksjon (videreutdanning på oppdrag) vises ved siden av.
 * Gjentak av eksamen er ikke med i noen av dem.
 */
type StaffAar = StaffUnit['years'][number];
const sarvEgen = (y: StaffAar | undefined) => y?.studentarsverkEgen ?? y?.studentarsverk ?? null;
const spPerStudent = (u: StaffUnit | undefined, aar: number) => { const y = u?.years.find((x) => x.aar === aar); const e = sarvEgen(y); return e != null && y?.studenter ? (60 * e) / y.studenter : null; };
/** HH 2025: videreutdanningskoden KVU-HH (500 studenter i 2024) er ikke med, og enkeltemnekodene EE-GSK og EE-REAL (887) er nye sentralt (DBH 123) */
const HH_MERKNAD_2025 = 'Videreutdanningskoden KVU-HH (500 studenter høsten 2024) er ikke med i 2025, mens enkeltemnekodene EE-GSK og EE-REAL (887 studenter) er nye på sentralt nivå. HHs studenttall for 2025 kan derfor ikke sammenlignes direkte med 2024, og studiepoeng per student blir høyere fordi poengene fortsatt telles på HHs emner.';
const NIVAA: Record<string, string> = { bachelor: 'Bachelor', master5: 'Master 5 år', master2: 'Master 2 år', aarsstudium: 'Årsstudium' };

export function Utdanning() {
  return (
    <StyringSide tittel="Utdanning" undertittel="Hele NMBU med fakultetene side om side og konkurrentene som sammenligning: studiepoeng, gjennomføring, søkere og studieplasser. Bare åpne tall, med kilde under hver del.">
      <Innhold />
    </StyringSide>
  );
}

function Innhold() {
  const alle = useAllFacultyBases(FAKULTETER);
  const plasser = useJson(hentStudieplasser);
  const ledelse = useLedelse();
  const program = useMemo(() => (alle ? nmbuProgrammer(alle) : null), [alle]);
  return (
    <>
      <Nokkeltallene program={program} />
      <PerFakultet alle={alle} program={program} />
      {ledelse?.utdanning && (
        <Del i={3} ikon={Target} tittel="Måltall og faktiske tall"
          ingress={<>Studieplasser, kandidatmåltall og Kunnskapsdepartementets styringsparametere slik NMBU selv har publisert dem i tildelingsbrev, styresaker og årsrapport{ledelse.hentet ? `, hentet ${datoTekst(ledelse.hentet)}` : ''}.</>}>
          <LedelseSerier data={ledelse} del={ledelse.utdanning} standard="nmbu" />
          {ledelse.utdanning.tekst.length > 0 && <><Undertittel>Hovedpunkter fra dokumentene</Undertittel><LedelseTekstpunkter data={ledelse} del={ledelse.utdanning} /></>}
        </Del>
      )}
      <ProgramAaFolge alle={alle} program={program} plasser={plasser} />
      <IkkeGrad />
      <Konkurrentene />
    </>
  );
}

// ── Nøkkeltall ───────────────────────────────────────────────────────────────
function Nokkeltallene({ program }: { program: NmbuProgram[] | null }) {
  const s = NMBU_STAFF.years.filter((y) => y.studentarsverk != null && y.studenter != null);
  const sy = s[s.length - 1], sf = s[s.length - 2];
  const kdSiste = (id: string) => { const a = Object.keys(NMBU_ECON.ind[id] ?? {}).sort().pop(); return a ? { v: NMBU_ECON.ind[id][a][0], aar: a } : null; };
  const ba = kdSiste('1'), ma = kdSiste('2');
  const ps = program?.map((p) => p.e) ?? null;
  const fv = ps ? sumOgEndring(ps, 'fvS', SISTE_OPPTAK) : null;
  const pl = ps ? sumOgEndring(ps, 'plasser', SISTE_OPPTAK) : null;
  const kpier: Kpi[] = [
    { ikon: BookOpen, etikett: 'Studiepoeng per student', verdi: nf(spPerStudent(NMBU_STAFF, sy.aar), 1), endring: endringPst(spPerStudent(NMBU_STAFF, sf.aar), spPerStudent(NMBU_STAFF, sy.aar)), hjelp: `${sy.aar}, per registrert student`, tittel: 'Egenfinansierte studentårsverk × 60 (DBH 900) delt på registrerte studenter høsten (DBH 123)' },
    { ikon: Layers, etikett: `Studentårsverk ${sy.aar}`, verdi: nf(sarvEgen(sy), 0), endring: endringPst(sarvEgen(sf), sarvEgen(sy)), hjelp: `egenfinansiert · ${nf(sy.studentarsverk, 0)} med eksternfinansiert`, tittel: `Egenfinansierte studiepoeng delt på 60 (gir uttelling i finansieringssystemet). Med eksternfinansiert produksjon: ${nf(sy.studentarsverk, 0)}. Gjentak av eksamen er ikke med. ${nf(sy.studenter)} registrerte studenter.` },
    { ikon: GraduationCap, etikett: `Normert tid ${ba?.aar ?? ''}`.trim(), verdi: ba ? pst(ba.v) : '–', hjelp: ma ? `bachelor · master ${pst(ma.v)}` : 'bachelor', tittel: 'Andelen som fullfører på normert tid, KDs styringsindikator 1 og 2 (DBH 750)' },
    { ikon: Users, etikett: `Førstevalg ${SISTE_OPPTAK}`, verdi: fv?.sum != null ? nf(fv.sum) : '…', endring: fv?.endring ?? null, hjelp: 'til NMBU-programmene', tittel: 'Førstevalgssøkere i hovedopptaket. Endringen er regnet på programmene som har tall begge årene.' },
    { ikon: Armchair, etikett: `Studieplasser ${SISTE_OPPTAK}`, verdi: pl?.sum != null ? nf(pl.sum) : '…', endring: pl?.endring ?? null, hjelp: fv?.sum && pl?.sum ? `${nf(fv.sum / pl.sum, 2)} førstevalg per plass` : 'i Samordna opptak' },
  ];
  return <Nokkeltall kpier={kpier} kilder={[dbh(900, 'studiepoeng'), dbh(123, 'registrerte studenter'), dbh(750, 'styringsindikator 1 og 2'), KILDER.samordna]}
    merknad={`Endring fra året før. Studentårsverk og studiepoeng per student gjelder egenfinansiert produksjon (den som gir uttelling); eksternfinansiert videreutdanning kommer i tillegg. Søkere og studieplasser gjelder NMBU-programmene i fakultetenes sammenligninger, hovedopptaket ${SISTE_OPPTAK}.`} />;
}

// ── Per fakultet ────────────────────────────────────────────────────────────
function PerFakultet({ alle, program }: { alle: FacultyBase[] | null; program: NmbuProgram[] | null }) {
  const staffAar = NMBU_STAFF.years.map((y) => y.aar);
  const sisteStaff = staffAar[staffAar.length - 1];
  const rader = useMemo(() => {
    if (!alle || !program) return null;
    const lag = (navn: string, tittel: string | undefined, fakulteter: FacultyBase[], ps: NmbuProgram[], staff: StaffUnit | undefined, uthev = false) => {
      const e = ps.map((p) => p.e);
      const fvS = stabilSerie(e, 'fvS', OPPTAKSAAR), plS = stabilSerie(e, 'plasser', OPPTAKSAAR);
      const fv = sumOgEndring(e, 'fvS', SISTE_OPPTAK), pl = sumOgEndring(e, 'plasser', SISTE_OPPTAK);
      // Gjennomføring: summer fullførte og startkull over fakultetene, per år normert tid gikk ut
      const perFak = fakulteter.map((fb) => gjennomforingPerAar(fb, GJ_AAR));
      const gj = GJ_AAR.map((a, i) => {
        const f = perFak.reduce((s, x) => s + x[i].fullfort, 0), k = perFak.reduce((s, x) => s + x[i].kull, 0);
        return { aar: a, andel: k ? (100 * f) / k : null, kull: k };
      });
      const sb = fakulteter.map(helhet).filter(Boolean) as NonNullable<ReturnType<typeof helhet>>[];
      const sbN = sb.reduce((s, x) => s + x.n, 0);
      const y = staff?.years.find((x) => x.aar === sisteStaff);
      return {
        navn, tittel, uthev, studenter: y?.studenter ?? null, sarv: sarvEgen(y), sarvTotal: y?.studentarsverk ?? null,
        sarvSerie: staffAar.map((a) => sarvEgen(staff?.years.find((x) => x.aar === a))),
        merknad: staff?.fakultetskode === FAK_KODE.hh && sisteStaff === 2025 ? HH_MERKNAD_2025 : undefined,
        spPerStudent: spPerStudent(staff, sisteStaff),
        fv, pl, fvSerie: fvS.verdier, plSerie: plS.verdier, gj,
        sb: sbN ? { snitt: sb.reduce((s, x) => s + x.snitt * x.n, 0) / sbN, n: sbN } : null,
      };
    };
    return [
      ...alle.map((f) => lag(fakNavn(f.id), FACULTY_META[f.id].label, [f], program.filter((p) => p.fak === f.id), staffFor(f.id))),
      lag('Hele NMBU', undefined, alle, program, NMBU_STAFF, true),
    ];
  }, [alle, program, staffAar, sisteStaff]);
  const gjSiste = GJ_AAR[GJ_AAR.length - 1];
  return (
    <Del i={2} ikon={Users} tittel="Fakultetene side om side"
      ingress={<>Studenter og studiepoeng (DBH, etter hvilket fakultet som eier emnene), søkere og studieplasser til NMBU-programmene i hovedopptaket, fullført på normert tid for kullene som skulle vært ferdige i {gjSiste}, og snittet av helhetsvurderingen i Studiebarometeret. Trendlinjene viser utviklingen; hold pekeren over for tallene.</>}
      kilder={[dbh(123, 'registrerte studenter'), dbh(900, 'studentårsverk'), dbh(707, 'gjennomføring per startkull'), KILDER.samordna, KILDER.studiebarometeret]}
      merknad={`Studentårsverk er egenfinansiert produksjon uten gjentak (totalen med eksternfinansiert videreutdanning vises når du holder pekeren over tallet). * HH: ${HH_MERKNAD_2025} Søker- og plasstrendene ${OPPTAKSAAR[0]}–${SISTE_OPPTAK} bruker bare programmene som har tall alle årene. Gjennomføringen slår sammen bachelor og master for NMBU-programmene i sammenligningene. Helhetsvurderingen er et enkelt snitt av programmene (skala 1–5).`}>
      {!rader ? <Stille>Laster tallene for fakultetene …</Stille> : (
        <Tabell minBredde={820}>
          <Hoderad>
            <th style={THV}>Fakultet</th>
            <th style={TH}>Studenter<br /><span style={{ fontWeight: 400 }}>{sisteStaff}</span></th>
            <th style={TH} title={`Egenfinansierte studentårsverk ${sisteStaff} (gir uttelling i finansieringssystemet) og utviklingen ${staffAar[0]}–${sisteStaff}. Hold pekeren over tallet for totalen med eksternfinansiert produksjon.`}>Studentårsverk<br /><span style={{ fontWeight: 400 }}>egenfinansiert {sisteStaff} · {staffAar[0]}–</span></th>
            <th style={TH} title="Egenfinansierte studentårsverk × 60 / registrerte studenter">Studiepoeng<br /><span style={{ fontWeight: 400 }}>per student</span></th>
            <th style={TH} title={`Førstevalg ${SISTE_OPPTAK}, endring fra året før og utviklingen ${OPPTAKSAAR[0]}–${SISTE_OPPTAK}`}>Førstevalg<br /><span style={{ fontWeight: 400 }}>{SISTE_OPPTAK} · {OPPTAKSAAR[0]}–</span></th>
            <th style={TH}>Studieplasser<br /><span style={{ fontWeight: 400 }}>{SISTE_OPPTAK}</span></th>
            <th style={TH}>Førstevalg<br /><span style={{ fontWeight: 400 }}>per plass</span></th>
            <th style={TH} title={`Fullført på normert tid, kull med normert slutt ${gjSiste}, og utviklingen ${GJ_AAR[0]}–${gjSiste}`}>Normert tid<br /><span style={{ fontWeight: 400 }}>{gjSiste} · {GJ_AAR[0]}–</span></th>
            <th style={TH} title="Snitt av helhetsvurderingen for NMBU-programmene, siste år (skala 1–5)">Helhets&shy;vurdering<br /><span style={{ fontWeight: 400 }}>snitt</span></th>
          </Hoderad>
          <tbody>
            {rader.map((r) => (
              <Rad key={r.navn} uthev={r.uthev} sum={r.uthev}>
                <td style={TDV} title={r.tittel}>{r.navn}</td>
                <td style={TD} title={r.merknad}>{nf(r.studenter)}{r.merknad && <sup style={{ marginLeft: 1 }}>*</sup>}</td>
                <td style={TD}><span title={r.sarvTotal != null ? `Med eksternfinansiert produksjon: ${nf(r.sarvTotal, 1)}` : undefined}>{nf(r.sarv, 0)}</span> <SparkMedTekst aar={staffAar} verdier={r.sarvSerie} fmt={(v) => nf(v, 0)} /></td>
                <td style={TD} title={r.merknad}>{nf(r.spPerStudent, 1)}{r.merknad && <sup style={{ marginLeft: 1 }}>*</sup>}</td>
                <td style={TD}>{nf(r.fv.sum)} {r.fv.endring != null && <Endring v={r.fv.endring} d={0} />} <SparkMedTekst aar={OPPTAKSAAR} verdier={r.fvSerie} /></td>
                <td style={TD}>{nf(r.pl.sum)}</td>
                <td style={TD}>{r.fv.sum && r.pl.sum ? nf(r.fv.sum / r.pl.sum, 2) : '–'}</td>
                <td style={TD}>{pst(r.gj[r.gj.length - 1].andel, 0)} <SparkMedTekst aar={GJ_AAR} verdier={r.gj.map((x) => x.andel)} fmt={(v) => pst(v, 0)} /></td>
                <td style={TD} title={r.sb ? `${r.sb.n} program` : undefined}>{r.sb ? nf(r.sb.snitt, 2) : '–'}</td>
              </Rad>
            ))}
          </tbody>
        </Tabell>
      )}
    </Del>
  );
}

// ── Program å følge med på ──────────────────────────────────────────────────
const GJ_GRENSE = 50;
type SignalId = 'fv' | 'alle' | 'gj' | 'sb' | 'ledig';
const SIGNALER: { id: SignalId; tekst: string }[] = [
  { id: 'fv', tekst: `Færre førstevalgssøkere enn studieplasser i hovedopptaket ${SISTE_OPPTAK}` },
  { id: 'alle', tekst: `Alle kvalifiserte søkere fikk tilbud i ordinær kvote i hovedopptaket ${SISTE_OPPTAK} (poenggrense 0)` },
  { id: 'gj', tekst: `Under ${GJ_GRENSE} % fullførte på normert tid i siste kull med tall (normert slutt senest ${GJ_TIL})` },
  { id: 'sb', tekst: 'Helhetsvurderingen i Studiebarometeret er lavere enn snittet for fagfeltet, siste år' },
  { id: 'ledig', tekst: `Programmet sto på Samordnas liste over ledige studieplasser i ${SISTE_OPPTAK}` },
];

function ProgramAaFolge({ alle, program, plasser }: { alle: FacultyBase[] | null; program: NmbuProgram[] | null; plasser: PlassData | null | undefined }) {
  const [minst, setMinst] = useState<'2' | '1'>('2');
  const rader = useMemo(() => {
    if (!alle || !program) return null;
    return program.map((p) => {
      const fb = alle.find((f) => f.id === p.fak)!;
      const y = p.e.years[SISTE_OPPTAK];
      const aktiv = !!y && [y.fvS, y.plasser, y.alleS, y.mott].some((v) => v != null);
      if (!aktiv) return null;
      const gj = sisteKull(fb, p.e.id);
      const sb = fb.studiebarometer.find((s) => s.entryId === p.e.id && s.scores.helhetsvurdering != null);
      const ledig = p.e.studiekode ? plasser?.program[p.e.studiekode]?.ledig2026 ?? null : null;
      const s: Record<SignalId, boolean> = {
        fv: y!.fvS != null && y!.plasser != null && y!.fvS < y!.plasser,
        alle: y!.pg_ord === 0,
        gj: !!gj && gj.andel < GJ_GRENSE,
        sb: !!sb && sb.fieldAverage.helhetsvurdering != null && sb.scores.helhetsvurdering! < sb.fieldAverage.helhetsvurdering,
        ledig: ledig === true,
      };
      return { p, y: y!, gj, sb, ledig, s, antall: Object.values(s).filter(Boolean).length };
    }).filter((r): r is NonNullable<typeof r> => !!r);
  }, [alle, program, plasser]);
  const vis = rader?.filter((r) => r.antall >= Number(minst)).sort((a, b) => b.antall - a.antall || FAKULTETER.indexOf(a.p.fak) - FAKULTETER.indexOf(b.p.fak) || a.p.navn.localeCompare(b.p.navn, 'nb')) ?? [];
  const Verdi = ({ paa, children }: { paa: boolean; children: ReactNode }) => (paa ? <Merke tone="varsel">{children}</Merke> : <>{children}</>);
  return (
    <Del i={4} ikon={Eye} tittel="Program å følge med på"
      ingress="Program der flere av signalene under slår ut samtidig. Signalene er faste og regnes likt for alle program; de beskriver tallene og sier ikke noe om hvorfor. Merkede tall er signalene som slo ut."
      hoyre={<Valg etikett="Antall signaler" verdi={minst} onChange={setMinst} valg={[{ id: '2', label: 'Minst to signaler' }, { id: '1', label: 'Minst ett' }]} />}
      kilder={[KILDER.samordna, KILDER.samordnaKatalog, dbh(707, 'gjennomføring per startkull'), KILDER.studiebarometeret]}
      merknad={plasser === null ? 'Lista over ledige studieplasser kunne ikke lastes, så det signalet er ikke med.' : 'Ledig-lista er Samordnas felt for ledige plasser i 2026-opptaket, tolket som at programmet sto på lista. Program med lokalt opptak har ikke Samordna-tall.'}>
      <ol className="mb-3 flex flex-col gap-1" style={{ fontSize: 12.5, color: 'var(--nmbu-neutral-1)' }}>
        {SIGNALER.map((x, i) => (
          <li key={x.id} className="flex items-start gap-2">
            <span className="shrink-0 inline-flex items-center justify-center rounded-full" style={{ width: 18, height: 18, fontSize: 10.5, fontWeight: 700, backgroundColor: 'color-mix(in srgb, #d97706 20%, transparent)', color: 'var(--nmbu-neutral)' }}>{i + 1}</span>
            <span className="min-w-0">{x.tekst}{rader && <span style={{ color: 'var(--nmbu-neutral-2)' }}> · {nf(rader.filter((r) => r.s[x.id]).length)} program</span>}</span>
          </li>
        ))}
      </ol>
      {!rader ? <Stille>Laster programmene …</Stille> : !vis.length ? <Stille>Ingen program har {minst === '2' ? 'to eller flere' : 'noen'} av signalene.</Stille> : (
        <Tabell minBredde={760}>
          <Hoderad>
            <th style={THV}>Program</th>
            <th style={TH} title="Antall signaler som slo ut">Signaler</th>
            <th style={TH}>1. Førstevalg / plasser</th>
            <th style={TH}>2. Poenggrense</th>
            <th style={TH}>3. Normert tid</th>
            <th style={TH}>4. Helhetsvurdering<br /><span style={{ fontWeight: 400 }}>(fagfeltet)</span></th>
            <th style={TH}>5. Ledig-lista</th>
          </Hoderad>
          <tbody>
            {vis.map((r) => (
              <Rad key={r.p.e.id}>
                <td style={{ ...TDV, minWidth: 180 }}>
                  <span style={{ fontWeight: 600 }}>{r.p.navn}</span>
                  <span style={{ color: 'var(--nmbu-neutral-2)' }}> · {fakNavn(r.p.fak)} · {NIVAA[r.p.nivaa] ?? r.p.nivaa}</span>
                </td>
                <td style={TD}>{r.antall}</td>
                <td style={TD}><Verdi paa={r.s.fv}>{nf(r.y.fvS)} / {nf(r.y.plasser)}</Verdi></td>
                <td style={TD}><Verdi paa={r.s.alle}>{r.y.pg_ord == null ? '–' : r.y.pg_ord === 0 ? 'Alle' : nf(r.y.pg_ord, 1)}</Verdi></td>
                <td style={TD} title={r.gj ? `Startkull ${r.gj.startaar}: ${r.gj.fullfort} av ${r.gj.kull}` : undefined}><Verdi paa={r.s.gj}>{r.gj ? pst(r.gj.andel, 0) : '–'}</Verdi>{r.gj && <span style={{ color: 'var(--nmbu-neutral-2)' }}> (kull {r.gj.startaar})</span>}</td>
                <td style={TD} title={r.sb?.latestYear ? `Studiebarometeret ${r.sb.latestYear}` : undefined}><Verdi paa={r.s.sb}>{r.sb ? nf(r.sb.scores.helhetsvurdering, 1) : '–'}</Verdi>{r.sb?.fieldAverage.helhetsvurdering != null && <span style={{ color: 'var(--nmbu-neutral-2)' }}> ({nf(r.sb.fieldAverage.helhetsvurdering, 1)})</span>}</td>
                <td style={TD}>{r.ledig == null ? '–' : r.ledig ? <Verdi paa>Ja</Verdi> : 'Nei'}</td>
              </Rad>
            ))}
          </tbody>
        </Tabell>
      )}
    </Del>
  );
}

// ── Årsstudier, enkeltemner og videreutdanning ─────────────────────────────
const IKKE_GRAD = ['Årsstudier og ettårige studier', 'Enkeltemner', 'Videreutdanning', 'Utvekslingsstudenter'];
const PROD_AAR = ['2023', '2024', '2025'];
function IkkeGrad() {
  const t = useMemo(() => {
    const tot = PROD_AAR.map((a) => ({ sp: NMBU_PRODUKSJON.reduce((s, p) => s + (p.aar[a]?.sp ?? 0), 0), inn: NMBU_PRODUKSJON.reduce((s, p) => s + (p.aar[a]?.inn ?? 0), 0) }));
    const kat = [...IKKE_GRAD, 'Gradsprogram'].map((k) => {
      const ps = NMBU_PRODUKSJON.filter((p) => (k === 'Gradsprogram' ? !IKKE_GRAD.includes(p.kategori) : p.kategori === k));
      return { k, v: PROD_AAR.map((a, i) => { const sp = ps.reduce((s, p) => s + (p.aar[a]?.sp ?? 0), 0), inn = ps.reduce((s, p) => s + (p.aar[a]?.inn ?? 0), 0); return { sp, inn, spAndel: (100 * sp) / (tot[i].sp || 1), innAndel: (100 * inn) / (tot[i].inn || 1) }; }) };
    });
    const sisteA = PROD_AAR[PROD_AAR.length - 1];
    const perFak = [...FAKULTETER, 'nmbu' as const].map((f) => {
      const ps = NMBU_PRODUKSJON.filter((p) => p.fak === f);
      const sp = ps.reduce((s, p) => s + (p.aar[sisteA]?.sp ?? 0), 0), ik = ps.filter((p) => IKKE_GRAD.includes(p.kategori)).reduce((s, p) => s + (p.aar[sisteA]?.sp ?? 0), 0);
      return { f, sp, ik, andel: sp ? (100 * ik) / sp : null };
    });
    return { tot, kat, perFak };
  }, []);
  const n = PROD_AAR.length - 1;
  return (
    <Del i={5} ikon={BookOpen} tittel="Årsstudier, enkeltemner og videreutdanning"
      ingress={`Andelen av NMBUs studiepoeng og av den anslåtte studiepoenguttellingen som kommer fra studier utenom gradsprogrammene. ${PROD_AAR[n]}: ${pst(t.kat.filter((k) => k.k !== 'Gradsprogram').reduce((s, k) => s + k.v[n].spAndel, 0))} av studiepoengene.`}
      kilder={[dbh(900, 'studiepoeng per program og finansieringskategori'), dbh(908, 'satser'), dbh(347, 'programkoder og nivå')]}
      merknad="Uttellingen er studiepoeng × sats for emnenes finansieringskategori, anslått av åpne tall (utløses to år senere). Fullføringsuttelling er ikke med. «Gradsprogram» er bachelor, master, profesjon og ph.d.">
      <Tabell minBredde={640}>
        <Hoderad>
          <th style={THV}>Type studier</th>
          {PROD_AAR.map((a) => <th key={a} style={TH}>Studentårsverk<br /><span style={{ fontWeight: 400 }}>{a}</span></th>)}
          <th style={TH}>Andel av studiepoengene<br /><span style={{ fontWeight: 400 }}>{PROD_AAR[n]}</span></th>
          <th style={TH}>Uttelling<br /><span style={{ fontWeight: 400 }}>{PROD_AAR[n]}</span></th>
          <th style={TH}>Andel av uttellingen<br /><span style={{ fontWeight: 400 }}>{PROD_AAR[n]}</span></th>
        </Hoderad>
        <tbody>
          {t.kat.map((k) => (
            <Rad key={k.k} sum={k.k === 'Gradsprogram'}>
              <td style={TDV}>{k.k}</td>
              {k.v.map((v, i) => <td key={i} style={TD}>{nf(v.sp, 0)}</td>)}
              <td style={TD}>{pst(k.v[n].spAndel)}</td>
              <td style={TD}>{mill(k.v[n].inn / 1e6)}</td>
              <td style={TD}>{pst(k.v[n].innAndel)}</td>
            </Rad>
          ))}
        </tbody>
      </Tabell>
      <Undertittel>Andel av fakultetets studiepoeng utenom gradsprogram, {PROD_AAR[n]}</Undertittel>
      <div className="flex flex-wrap gap-x-4 gap-y-1" style={{ fontSize: 12.5, color: 'var(--nmbu-neutral-1)' }}>
        {t.perFak.filter((x) => x.sp > 0).map((x) => (
          <span key={x.f} className="whitespace-nowrap"><b style={{ color: 'var(--nmbu-neutral)' }}>{x.f === 'nmbu' ? 'NMBU sentralt' : fakNavn(x.f as FacultyId)}</b> {pst(x.andel)}</span>
        ))}
      </div>
    </Del>
  );
}

// ── Konkurrentene ───────────────────────────────────────────────────────────
const KOL: Kol[] = [
  { id: 'kd1', navn: 'Bachelor på normert tid', tittel: 'KDs styringsindikator 1 (DBH 750)', v: kd('1'), fmt: (v) => pst(v) },
  { id: 'kd2', navn: 'Master på normert tid', tittel: 'KDs styringsindikator 2 (DBH 750)', v: kd('2'), fmt: (v) => pst(v) },
  { id: 'kd4', navn: 'Studiekvalitet (skår)', tittel: 'KDs styringsindikator 4 (DBH 750)', v: kd('4'), fmt: (v) => nf(v, 2) },
  { id: 'kd5', navn: 'Faglig tidsbruk per uke', tittel: 'KDs styringsindikator 5 (DBH 750), timer', v: kd('5'), fmt: (v) => nf(v, 1) },
  { id: 'kd8', navn: 'Erasmus+ utreisende', tittel: 'KDs styringsindikator 8 (DBH 750)', v: kd('8'), fmt: (v) => pst(v, 2) },
  { id: 'kd14', navn: 'Studiepoeng per faglig årsverk', tittel: 'KDs styringsindikator 14 (DBH 750)', v: kd('14'), fmt: (v) => nf(v, 0) },
];
function Konkurrentene() {
  return (
    <Del i={6} ikon={TrendingUp} tittel="NMBU mot konkurrentene: styringsindikatorer for utdanning"
      ingress="Kunnskapsdepartementets styringsindikatorer for institusjonene som eier minst ett av konkurrentprogrammene i fakultetenes sammenligninger. Klikk på en kolonne for å sortere."
      kilder={[dbh(750, 'Kunnskapsdepartementets styringsindikatorer')]}>
      <IndikatorTabell kolonner={KOL} standard="kd1" />
    </Del>
  );
}
