/**
 * «Økonomi og drift»: samleside for hele NMBU med fakultetene side om side og konkurrentene som sammenligning.
 * Data: DBH 902 og 750 (economyData), DBH 225/900 (staffData), resultatbasert finansiering (revenueData,
 * NMBU_PRODUKSJON og REVENUE_GROUPS), Forskningsrådet og CORDIS (public/fagmiljo/forskning.json) og NMBUs egne
 * åpne tall fra styresaker og rapporter (public/ledelse/nmbu.json, valgfri).
 */
import { useMemo } from 'react';
import { Banknote, Building2, Coins, FileText, FlaskConical, Landmark, PiggyBank, Scale, TrendingUp, Users, Wallet } from 'lucide-react';
import { ECON_UNITS, type EconUnit, type EconYear } from '../../data/economyData';
import { STAFF_INSTITUTIONS, STAFF_NMBU_FACULTIES } from '../../data/staffData';
import { NMBU_PRODUKSJON, REVENUE_GROUPS, REVENUE_SATSER } from '../../data/revenueData';
import { FACULTY_META, type FacultyId } from '../../data/facultyMeta';
import type { Kpi } from '../arbeidsflate/Byggeklosser';
import { FAKULTETER } from '../arbeidsflate/navigasjon';
import { KILDER, dbh } from '../Kildeboks';
import { IndikatorTabell, kd, sisteMed, type Kol } from './indikatorer';
import {
  Del, Endring, Hoderad, Merke, Nokkeltall, Rad, SparkMedTekst, Stille, StyringSide, TD, TDV, TH, THV, Tabell, Undertittel, endringPst, mill, nf, pst,
} from './felles';
import { FAK_KODE, hentForskning, useJson } from './data';
import { LedelseSerier, LedelseTekstpunkter, datoTekst, useLedelse } from './ledelse';

const NMBU = ECON_UNITS.find((u) => u.isNmbu)!;
const NMBU_STAFF = STAFF_INSTITUTIONS.find((u) => u.isNmbu)!;
const M = (v: number | null | undefined) => (v == null ? null : v / 1000); // DBH 902 er i 1 000 kr
const ekstern = (y: EconYear) => [y.nfr, y.rff, y.eu, y.bidrag, y.oppdrag].reduce<number>((s, x) => s + (x ?? 0), 0);
const fakNavn = (id: FacultyId) => FACULTY_META[id].shortLabel;

export function OkonomiOgDrift() {
  return (
    <StyringSide tittel="Økonomi og drift" undertittel="Hele NMBU med fakultetene side om side og konkurrentene som sammenligning. Bare åpne tall, med kilde under hver del.">
      <Innhold />
    </StyringSide>
  );
}

function Innhold() {
  const ledelse = useLedelse();
  return (
    <>
      <Nokkeltallene />
      {ledelse?.okonomi && (
        <Del i={2} ikon={FileText} tittel="NMBUs egne tall: perioder, prognose og budsjett"
          ingress={<>Tall NMBU selv har publisert i styresaker, årsrapport og tildelingsbrev{ledelse.hentet ? `, hentet ${datoTekst(ledelse.hentet)}` : ''}. Hele NMBU og fakultetene står side om side der dokumentene har tall per fakultet.</>}>
          <LedelseSerier data={ledelse} del={ledelse.okonomi} standard="fak" />
          {ledelse.okonomi.tekst.length > 0 && <><Undertittel>Hovedpunkter fra dokumentene</Undertittel><LedelseTekstpunkter data={ledelse} del={ledelse.okonomi} /></>}
        </Del>
      )}
      <Regnskapet />
      <Resultatbasert />
      <EksterneMidler />
      <Bemanning />
      <Styringsindikatorer />
    </>
  );
}

// ── Nøkkeltall ───────────────────────────────────────────────────────────────
function Nokkeltallene() {
  const y = NMBU.years[NMBU.years.length - 1], f = NMBU.years[NMBU.years.length - 2];
  const s = NMBU_STAFF.years.filter((x) => x.arsverk != null);
  const sy = s[s.length - 1], sf = s[s.length - 2];
  const res = y.driftsinntekter != null && y.driftskostnader != null ? y.driftsinntekter - y.driftskostnader : null;
  const kpier: Kpi[] = [
    { ikon: Wallet, etikett: `Driftsinntekter ${y.aar}`, verdi: mill(M(y.driftsinntekter), 0), endring: endringPst(f?.driftsinntekter, y.driftsinntekter), hjelp: `${nf(M(f?.driftsinntekter), 0)} mill. kr i ${f?.aar}` },
    { ikon: Scale, etikett: `Driftsresultat ${y.aar}`, verdi: mill(M(res), 0), hjelp: res != null && y.driftsinntekter ? `${pst((100 * res) / y.driftsinntekter)} av driftsinntektene` : undefined, tittel: 'Driftsinntekter minus driftskostnader (DBH 902)' },
    { ikon: PiggyBank, etikett: `Avsetninger ${y.aar}`, verdi: mill(M(y.avsetning), 0), hjelp: y.avsetning != null && y.driftskostnader ? `${pst((100 * y.avsetning) / y.driftskostnader)} av driftskostnadene` : 'ikke rapportert', tittel: 'Avsetninger (ubrukte midler) slik de er rapportert til DBH (tabell 902)' },
    { ikon: FlaskConical, etikett: `Eksterne inntekter ${y.aar}`, verdi: mill(M(ekstern(y)), 0), endring: f ? endringPst(ekstern(f), ekstern(y)) : null, hjelp: 'Forskningsrådet, EU, bidrag og oppdrag', tittel: 'Forskningsrådet, regionale forskningsfond, EU, bidrags- og oppdragsinntekter (DBH 902)' },
    { ikon: Users, etikett: `Årsverk ${sy.aar}`, verdi: nf(sy.arsverk, 0), endring: endringPst(sf?.arsverk, sy.arsverk), hjelp: `${nf(sy.faglige, 0)} faglige, ${nf(sy.rekruttering, 0)} rekruttering` },
  ];
  return <Nokkeltall kpier={kpier} kilder={[dbh(902, 'økonomiske nøkkeltall (regnskap)'), dbh(225, 'tilsatte, årsverk')]}
    merknad={`Endring fra ${f?.aar}. Regnskapstall i løpende kroner.`} />;
}

// ── Regnskapet over tid ──────────────────────────────────────────────────────
function Regnskapet() {
  const aar = NMBU.years.map((y) => y.aar);
  const rader: { navn: string; v: (y: EconYear) => number | null; fmt?: (v: number) => string; tittel?: string }[] = [
    { navn: 'Driftsinntekter', v: (y) => M(y.driftsinntekter) },
    { navn: '– herav statstilskudd', v: (y) => M(y.statstilskudd) },
    { navn: '– herav eksterne inntekter', v: (y) => M(ekstern(y)), tittel: 'Forskningsrådet, regionale forskningsfond, EU, bidrag og oppdrag' },
    { navn: 'Driftskostnader', v: (y) => M(y.driftskostnader) },
    { navn: '– herav lønn', v: (y) => M(y.lonn) },
    { navn: 'Driftsresultat', v: (y) => (y.driftsinntekter != null && y.driftskostnader != null ? M(y.driftsinntekter - y.driftskostnader) : null) },
    { navn: 'Avsetninger', v: (y) => M(y.avsetning) },
    { navn: 'Lønnsandel av kostnadene', v: (y) => (y.lonn != null && y.driftskostnader ? (100 * y.lonn) / y.driftskostnader : null), fmt: (v) => pst(v) },
    { navn: 'Driftsinntekter per studentårsverk (1 000 kr)', v: (y) => (y.driftsinntekter != null && y.studentarsverk ? y.driftsinntekter / y.studentarsverk : null), fmt: (v) => nf(v, 0) },
  ];
  return (
    <Del i={3} ikon={Landmark} tittel={`Regnskapet ${aar[0]}–${aar[aar.length - 1]}`} ingress="Hele NMBU, millioner kroner i løpende priser, slik NMBU har rapportert regnskapet til DBH."
      kilder={[dbh(902, 'økonomiske nøkkeltall'), dbh(900, 'studentårsverk')]}>
      <Tabell>
        <Hoderad><th style={THV}>Mill. kr</th>{aar.map((a) => <th key={a} style={TH}>{a}</th>)}<th style={TH}>Utvikling</th></Hoderad>
        <tbody>
          {rader.map((r) => {
            const vs = NMBU.years.map(r.v);
            const fmt = r.fmt ?? ((v: number) => nf(v, 0));
            return (
              <Rad key={r.navn} uthev={r.navn === 'Driftsresultat'}>
                <td style={{ ...TDV, whiteSpace: 'nowrap' }} title={r.tittel}>{r.navn}</td>
                {vs.map((v, i) => <td key={i} style={{ ...TD, color: v != null && v < 0 ? 'var(--af-destructive, #b91c1c)' : undefined }}>{v == null ? '–' : fmt(v)}</td>)}
                <td style={TD}><SparkMedTekst aar={aar} verdier={vs} fmt={fmt} /></td>
              </Rad>
            );
          })}
        </tbody>
      </Tabell>
    </Del>
  );
}

// ── Resultatbasert finansiering ─────────────────────────────────────────────
const PROD_AAR = ['2023', '2024', '2025'];
function Resultatbasert() {
  const t = useMemo(() => {
    const enheter: { id: string; navn: string; tittel?: string }[] = [
      ...FAKULTETER.map((id) => ({ id, navn: fakNavn(id), tittel: FACULTY_META[id].label })),
      { id: 'nmbu', navn: 'NMBU sentralt', tittel: 'Programkoder uten fakultet, for eksempel enkeltemner og utveksling (DBH 347)' },
    ];
    const sp = (id: string, a: string) => NMBU_PRODUKSJON.filter((p) => p.fak === id).reduce((s, p) => s + (p.aar[a]?.inn ?? 0), 0) / 1e6;
    // Fullføringsuttelling: bare NMBU-programmene i sammenligningene (REVENUE_GROUPS), hvert program én gang
    const full = (id: string, a: string) => {
      const sett = new Set<string>(); let s = 0;
      for (const g of REVENUE_GROUPS[id] ?? []) for (const p of g.programs) {
        if (!p.isNmbu || sett.has(p.entryId)) continue; sett.add(p.entryId);
        s += p.years.find((y) => String(y.aar) === a)?.innFullforing ?? 0;
      }
      return s / 1e6;
    };
    const rader = enheter.map((e) => ({ ...e, sp: PROD_AAR.map((a) => sp(e.id, a)), full: PROD_AAR.map((a) => (e.id === 'nmbu' ? null : full(e.id, a))) }));
    const sum = { sp: PROD_AAR.map((_, i) => rader.reduce((s, r) => s + r.sp[i], 0)), full: PROD_AAR.map((_, i) => rader.reduce((s, r) => s + (r.full[i] ?? 0), 0)) };
    const bud = PROD_AAR.map((a) => Number(a) + 2);
    const sats = Object.keys(REVENUE_SATSER).sort();
    const sisteSats = sats[sats.length - 1];
    return { rader, sum, bud, sisteSats, forelopig: bud.map((b) => !REVENUE_SATSER[String(b)]) };
  }, []);
  const n = PROD_AAR.length - 1;
  const endring = t.sum.sp[n] - t.sum.sp[n - 1];
  return (
    <Del i={4} ikon={Coins} tittel="Resultatbasert finansiering per fakultet"
      ingress={<>Studiepoenguttellingen er egenfinansierte studiepoeng × satsen for emnenes finansieringskategori. Fullføringsuttellingen er fullførte grader × fast sats.
        Produksjonen i et år utløses i statsbudsjettet to år senere, så tallene for {PROD_AAR[n]} viser hva som kommer i budsjettet for {t.bud[n]}.</>}
      kilder={[dbh(900, 'studiepoeng per finansieringskategori'), dbh(908, 'satser'), dbh(104, 'kandidater'), dbh(347, 'programeier')]}
      merknad={<>Anslag regnet av åpne DBH-tall, ikke NMBUs interne fordeling. {t.forelopig[n] ? `Satsene for ${t.bud[n]} er ikke kjent; anslaget bruker satsene for ${t.sisteSats}.` : ''} Fullføringsuttellingen gjelder bare NMBU-programmene som er med i fakultetenes sammenligninger; årsstudier og enkeltemner gir ikke fullføringsuttelling.</>}>
      <div className="rounded-lg p-3 mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1" style={{ border: '1px dashed var(--nmbu-neutral-3)' }}>
        <Merke title="Regnet av tall som finnes, ikke et vedtatt budsjett">Framskrivning</Merke>
        <span style={{ fontSize: 13, color: 'var(--nmbu-neutral-1)' }}>
          Studiepoengene tatt i {PROD_AAR[n]} gir anslagsvis <b style={{ color: 'var(--nmbu-neutral)' }}>{mill(t.sum.sp[n])}</b> i studiepoenguttelling i budsjettet for {t.bud[n]},{' '}
          {endring >= 0 ? `${nf(endring, 1)} mill. kr mer` : `${nf(-endring, 1)} mill. kr mindre`} enn produksjonen i {PROD_AAR[n - 1]} gir i {t.bud[n - 1]}.
        </span>
        <Endring v={endringPst(t.sum.sp[n - 1], t.sum.sp[n]) ?? 0} />
      </div>
      <Tabell>
        <Hoderad>
          <th style={THV}>Fakultet</th>
          {PROD_AAR.map((a, i) => <th key={a} style={TH} title={`Studiepoeng tatt i ${a}, utløses i budsjettet for ${t.bud[i]}`}>Studiepoeng {a}<br /><span style={{ fontWeight: 400 }}>→ budsjett {t.bud[i]}{t.forelopig[i] ? '*' : ''}</span></th>)}
          <th style={TH}>Endring {t.bud[n - 1]}–{t.bud[n]}</th>
          <th style={TH}>Utvikling</th>
          <th style={TH} title="Fullførte grader i NMBU-programmene i sammenligningene">Fullføring {PROD_AAR[n]}<br /><span style={{ fontWeight: 400 }}>→ budsjett {t.bud[n]}{t.forelopig[n] ? '*' : ''}</span></th>
        </Hoderad>
        <tbody>
          {t.rader.map((r) => (
            <Rad key={r.id}>
              <td style={TDV} title={r.tittel}>{r.navn}</td>
              {r.sp.map((v, i) => <td key={i} style={TD}>{nf(v, 1)}</td>)}
              <td style={TD}>{r.sp[n - 1] ? <Endring v={endringPst(r.sp[n - 1], r.sp[n]) ?? 0} /> : '–'}</td>
              <td style={TD}><SparkMedTekst aar={PROD_AAR} verdier={r.sp} fmt={(v) => `${nf(v, 1)} mill. kr`} /></td>
              <td style={TD}>{r.full[n] == null ? '–' : nf(r.full[n], 1)}</td>
            </Rad>
          ))}
          <Rad sum uthev>
            <td style={TDV}>Hele NMBU</td>
            {t.sum.sp.map((v, i) => <td key={i} style={TD}>{nf(v, 1)}</td>)}
            <td style={TD}><Endring v={endringPst(t.sum.sp[n - 1], t.sum.sp[n]) ?? 0} /></td>
            <td style={TD}><SparkMedTekst aar={PROD_AAR} verdier={t.sum.sp} fmt={(v) => `${nf(v, 1)} mill. kr`} /></td>
            <td style={TD}>{nf(t.sum.full[n], 1)}</td>
          </Rad>
        </tbody>
      </Tabell>
      <div className="mt-1" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>Millioner kroner. {t.forelopig.some(Boolean) && `* Anslått med satsene for ${t.sisteSats}.`}</div>
    </Del>
  );
}

// ── Eksterne midler ─────────────────────────────────────────────────────────
function EksterneMidler() {
  const d = useJson(hentForskning);
  if (d === undefined) return <Del i={5} ikon={Banknote} tittel="Eksterne forskningsmidler per fakultet"><Stille>Laster tallene fra Forskningsrådet og CORDIS …</Stille></Del>;
  if (!d) return null;
  const aar = Array.from({ length: d.periode[1] - d.periode[0] + 1 }, (_, i) => String(d.periode[0] + i));
  const siste = aar[aar.length - 1];
  const enheter: { k: string; navn: string; tittel?: string; nmbu?: boolean }[] = [
    ...FAKULTETER.map((id) => ({ k: `1173_${FAK_KODE[id]}`, navn: fakNavn(id), tittel: FACULTY_META[id].label })),
    { k: '1173_ikkeFordelt', navn: 'Ikke fordelt', tittel: 'Registrert på universitetsnivå (for eksempel UB), ikke på et fakultet' },
  ];
  const hent = (k: string) => d.fakulteter?.[k] ?? d.institusjoner[k];
  const rad = (k: string) => {
    const e = hent(k);
    const utb = aar.map((a) => e?.nfrUtbetalt?.[a] ?? null);
    const nfr = aar.map((a) => e?.nfr?.[a]).filter(Boolean);
    return { utb, bevilget: nfr.reduce((s, x) => s + (x?.innvilgetBelop ?? 0), 0), innvilget: nfr.reduce((s, x) => s + (x?.innvilget ?? 0), 0) };
  };
  const nm = hent('1173');
  const he = aar.map((a) => nm?.eu?.horizonEurope?.[a]).filter(Boolean);
  const euSum = he.reduce((s, x) => s + (x?.bidragMillEuro ?? 0), 0), euDelt = he.reduce((s, x) => s + (x?.deltakelser ?? 0), 0), euKoord = he.reduce((s, x) => s + (x?.koordinator ?? 0), 0);
  const tot = rad('1173');
  const Linje = ({ navn, tittel, r, uthev }: { navn: string; tittel?: string; r: ReturnType<typeof rad>; uthev?: boolean }) => (
    <Rad uthev={uthev} sum={uthev}>
      <td style={TDV} title={tittel}>{navn}</td>
      <td style={TD}>{nf(r.utb[r.utb.length - 1], 1)}</td>
      <td style={TD}><SparkMedTekst aar={aar} verdier={r.utb} fmt={(v) => `${nf(v, 1)} mill. kr`} /></td>
      <td style={TD}>{nf(r.bevilget, 1)}</td>
      <td style={TD}>{nf(r.innvilget)}</td>
    </Rad>
  );
  return (
    <Del i={5} ikon={Banknote} tittel="Eksterne forskningsmidler per fakultet"
      ingress="Utbetalt fra Forskningsrådet per år, og nye bevilgninger der fakultetet er prosjektansvarlig. EU-midlene finnes bare for hele NMBU, fordi CORDIS ikke oppgir fakultet."
      kilder={[KILDER.prosjektbanken, KILDER.forskningsradet, KILDER.cordis, dbh(902, 'inntekter fra Forskningsrådet og EU (regnskap)')]}
      merknad={`Hentet ${datoTekst(d.hentet.slice(0, 10))}. Nesten halvparten av NMBUs søknader er registrert på universitetsnivå, så fakultetstallene er minimumstall. Søknadsdataene fra 2023 mangler søknader fra Forskningsrådets nye saksbehandlingssystem.`}>
      <Tabell>
        <Hoderad>
          <th style={THV}>Fakultet</th>
          <th style={TH}>Utbetalt {siste}</th>
          <th style={TH}>Utbetalt {aar[0]}–{siste}</th>
          <th style={TH} title="Samlet bevilget beløp for nye prosjekter, ført på søknadsåret">Bevilget {aar[0]}–{siste}</th>
          <th style={TH}>Innvilgede søknader</th>
        </Hoderad>
        <tbody>
          {enheter.map((e) => <Linje key={e.k} navn={e.navn} tittel={e.tittel} r={rad(e.k)} />)}
          <Linje navn="Hele NMBU" r={tot} uthev />
        </tbody>
      </Tabell>
      <div className="mt-1" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>Millioner kroner.</div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1" style={{ fontSize: 13, color: 'var(--nmbu-neutral-1)' }}>
        <b style={{ color: 'var(--nmbu-neutral)' }}>EU (Horizon Europe), hele NMBU {aar[0]}–{siste}:</b>
        <span>{nf(euSum, 1)} mill. euro i EU-bidrag, {nf(euDelt)} deltakelser, {nf(euKoord)} som koordinator.</span>
      </div>
    </Del>
  );
}

// ── Bemanning ───────────────────────────────────────────────────────────────
function Bemanning() {
  const aar = NMBU_STAFF.years.map((y) => y.aar);
  const siste = aar[aar.length - 1];
  const enheter = [
    ...FAKULTETER.map((id) => ({ id, navn: fakNavn(id), tittel: FACULTY_META[id].label, u: STAFF_NMBU_FACULTIES.find((u) => u.fakultetskode === FAK_KODE[id]) })).filter((x) => x.u),
  ];
  const linje = (navn: string, u: typeof NMBU_STAFF, tittel?: string, uthev?: boolean) => {
    const y = u.years.find((x) => x.aar === siste);
    const tekAdm = y?.arsverk != null && y.faglige != null && y.rekruttering != null ? y.arsverk - y.faglige - y.rekruttering : null;
    const andel = (v: number | null | undefined) => (v != null && y?.arsverk ? (100 * v) / y.arsverk : null);
    return (
      <Rad key={navn} uthev={uthev} sum={uthev}>
        <td style={TDV} title={tittel}>{navn}</td>
        <td style={TD}>{nf(y?.arsverk, 0)}</td>
        <td style={TD}>{pst(andel(y?.faglige), 0)}</td>
        <td style={TD}>{pst(andel(y?.rekruttering), 0)}</td>
        <td style={TD}>{pst(andel(tekAdm), 0)}</td>
        <td style={TD}>{y?.studentarsverk != null && y.faglige ? nf(y.studentarsverk / y.faglige, 1) : '–'}</td>
        <td style={TD}><SparkMedTekst aar={aar} verdier={aar.map((a) => u.years.find((x) => x.aar === a)?.arsverk ?? null)} fmt={(v) => `${nf(v, 0)} årsverk`} /></td>
      </Rad>
    );
  };
  return (
    <Del i={6} ikon={Building2} tittel={`Bemanningsprofil ${siste}`}
      ingress="Årsverk fordelt på faglige stillinger, rekruttering (stipendiater og postdoktorer) og teknisk-administrative stillinger, og studentårsverk per faglig årsverk. Fakultetene summerer ikke til hele NMBU, fordi fellestjenestene ikke hører til et fakultet."
      kilder={[dbh(225, 'tilsatte, årsverk'), dbh(220, 'stillingskategorier'), dbh(900, 'studentårsverk (emneeier)')]}
      merknad="Faglige årsverk er undervisnings- og forskerstillinger og faglige ledere, uten rekruttering. Teknisk og administrativt er resten av årsverkene.">
      <Tabell>
        <Hoderad>
          <th style={THV}>Enhet</th>
          <th style={TH}>Årsverk</th>
          <th style={TH}>Faglige</th>
          <th style={TH}>Rekruttering</th>
          <th style={TH}>Teknisk og adm.</th>
          <th style={TH} title="Studentårsverk (studiepoeng / 60, emneeier) per faglig årsverk">Studentårsverk per faglig</th>
          <th style={TH}>Årsverk {aar[0]}–{siste}</th>
        </Hoderad>
        <tbody>
          {enheter.map((e) => linje(e.navn, e.u!, e.tittel))}
          {linje('Hele NMBU', NMBU_STAFF, undefined, true)}
        </tbody>
      </Tabell>
    </Del>
  );
}

// ── Styringsindikatorer mot konkurrentene ───────────────────────────────────
const KOLONNER: Kol[] = [
  { id: 'resultat', navn: 'Driftsresultat', tittel: 'Driftsinntekter minus driftskostnader i prosent av driftsinntektene (DBH 902)', v: (u) => sisteMed(u, (y) => (y.driftsinntekter && y.driftskostnader != null ? (100 * (y.driftsinntekter - y.driftskostnader)) / y.driftsinntekter : null)), fmt: (v) => pst(v) },
  { id: 'avsetning', navn: 'Avsetninger', tittel: 'Avsetninger i prosent av driftskostnadene (DBH 902)', v: (u) => sisteMed(u, (y) => (y.avsetning != null && y.driftskostnader ? (100 * y.avsetning) / y.driftskostnader : null)), fmt: (v) => pst(v) },
  { id: 'ekstern', navn: 'Eksterne inntekter', tittel: 'Forskningsrådet, EU, bidrag og oppdrag i prosent av driftsinntektene (DBH 902)', v: (u) => sisteMed(u, (y) => (y.driftsinntekter ? (100 * ekstern(y)) / y.driftsinntekter : null)), fmt: (v) => pst(v) },
  { id: 'stat', navn: 'Statstilskudd per studentårsverk', tittel: 'Statstilskudd (1 000 kr) per studentårsverk (DBH 902 og 900)', v: (u) => sisteMed(u, (y) => (y.statstilskudd != null && y.studentarsverk ? y.statstilskudd / y.studentarsverk : null)), fmt: (v) => `${nf(v, 0)} tkr` },
  { id: 'kd10', navn: 'Forskningsrådet per faglig årsverk', tittel: 'KDs styringsindikator 10 (DBH 750), 1 000 kr', v: kd('10'), fmt: (v) => `${nf(v, 0)} tkr` },
  { id: 'kd11', navn: 'Andre bidrag og oppdrag per faglig årsverk', tittel: 'KDs styringsindikator 11 (DBH 750), 1 000 kr', v: kd('11'), fmt: (v) => `${nf(v, 0)} tkr` },
  { id: 'kd14', navn: 'Studiepoeng per faglig årsverk', tittel: 'KDs styringsindikator 14 (DBH 750)', v: kd('14'), fmt: (v) => nf(v, 0) },
  { id: 'kd6', navn: 'Publiseringspoeng per faglig årsverk', tittel: 'KDs styringsindikator 6 (DBH 750)', v: kd('6'), fmt: (v) => nf(v, 2) },
];

function Styringsindikatorer() {
  return (
    <Del i={7} ikon={TrendingUp} tittel="NMBU mot konkurrentene: økonomi og styringsindikatorer"
      ingress="Institusjonene som eier minst ett av konkurrentprogrammene i fakultetenes sammenligninger. Klikk på en kolonne for å sortere. Private høyskoler (BI, Kristiania) finansieres i hovedsak med skolepenger og har lite statstilskudd."
      kilder={[dbh(902, 'økonomiske nøkkeltall'), dbh(750, 'Kunnskapsdepartementets styringsindikatorer'), dbh(900, 'studentårsverk')]}>
      <Undertittel>Siste år med tall</Undertittel>
      <IndikatorTabell kolonner={KOLONNER} standard="resultat" />
    </Del>
  );
}
