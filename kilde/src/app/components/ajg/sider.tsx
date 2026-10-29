/**
 * Sidene i AJG-Analyse HH. Hver side får de dekrypterte dataene (AjgData) og regner bare visning; alle tall er
 * regnet ut i scripts/rangering/ajg_analyse.py. Samfunnsøkonomi = AJG-feltet ECON. Hovedperiode 2021–2025.
 */
import { useMemo, useState, type ComponentType } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, ErrorBar, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AlertTriangle, Award, BarChart3, BookOpen, ClipboardList, Globe2, Layers, School, ShieldCheck, Table2, TrendingUp,
} from '../../ikoner';
import { AfHeader, Detaljkort, KpiStripe, Listerad, Segment, Seksjon, stig, Badge } from '../arbeidsflate/Byggeklosser';
import {
  ANDRE_FARGE, ECON_FARGE, FARGE, FELTNAVN, NIV, kortFelt, lastNedCsv, nf, pTekst, pst, signifikant,
  type AjgData, type Enhet, type HhArtikkel, type Maal, type Niva, type Tidsskrift,
} from './data';
import { Chips, CsvKnapp, Forklaring, NivaForklaring, NivaMerke, NivaStripe, Notis, SorterHint, SortTabell, Tips, Velg, type Kol } from './Felles';
import { MENY } from './meny';

export type SideId = 'oversikt' | 'fordeling' | 'utvikling' | 'internasjonalt' | 'niva' | 'fagfelt' | 'lista' | 'tidsskrift' | 'hh' | 'metode';
type P = { d: AjgData };
const gaa = (id: string) => { window.location.hash = id === 'oversikt' ? '#/' : `#/${id}`; };
const per = (d: AjgData) => `${d.periode[0]}–${d.periode[1]}`;
const p100 = (v: number | null | undefined) => (v == null ? null : Math.round(1000 * v) / 10);
const AKSE = { tickLine: false, axisLine: false, tick: { fontSize: 11 } } as const;
/** Bredden på navnekolonnen i liggende stolpediagram: smalere på mobil */
const yb = (w: number) => (typeof window !== 'undefined' && window.innerWidth < 640 ? Math.min(w, 112) : w);

// ── Forsiden ──────────────────────────────────────────────────────────────────
function Oversikt({ d }: P) {
  const e = d.enheter;
  const N = e.norge, U = e.utenNhhBi, H = e.nmbu, V = e.topp_verden, EU = e.topp_europa;
  const tr = Object.values(d.trend.norge).map((t) => t.andel ?? 0);
  return (
    <div className="af-side">
      <AfHeader eyebrow="Handelshøyskolen ved NMBU · intern" tittel="AJG-Analyse HH"
        undertittel={`Samfunnsøkonomi mot andre fagområder i AJG 2024 ved norske handelshøyskoler, sammenlignet med toppskoler i Europa og verden. Hovedperiode ${per(d)}, trend 2016–2025.`} />
      <div className="af-stig" style={stig(1)}>
        <Notis ikon={ShieldCheck}><strong>Intern side.</strong> AJG-nivå per tidsskrift er lisensbelagt (Chartered ABS) og skal ikke publiseres eller sendes videre. Samlede tall (andeler, fordelinger) kan brukes i manuskriptet.</Notis>
      </div>
      <div className="af-stig" style={{ ...stig(2), marginTop: 24 }}>
        <KpiStripe kpier={[
          { ikon: BarChart3, etikett: 'Samfunnsøkonomi, Norge', verdi: pst(N.andelEcon), hjelp: `av ${nf(N.n)} AJG-artikler` },
          { ikon: School, etikett: 'HH NMBU', verdi: pst(H.andelEcon), hjelp: `samfunnsøkonomi, ${nf(H.n)} artikler` },
          { ikon: Globe2, etikett: 'Verdenstoppen', verdi: pst(V.andelEcon), hjelp: `Europatoppen ${pst(EU.andelEcon)}` },
          { ikon: Award, etikett: 'ECON i 4/4*, Norge', verdi: pst(N.econM.a4), hjelp: `andre fagområder ${pst(N.restM.a4)}` },
          { ikon: ClipboardList, etikett: 'AJG 2024', verdi: nf(d.liste.n), hjelp: `tidsskrift (oppgitt ${nf(d.liste.offisielt.n)})` },
        ]} />
      </div>
      <div className="af-to-kolonner">
        <div className="af-hovedkolonne">
          <Seksjon i={3} tittel="Hovedfunn">
            <ol className="ajg-funn">
              <li><strong>Fordeling.</strong> Samfunnsøkonomi er {pst(N.andelEcon)} av AJG-artiklene ved norske handelshøyskoler samlet (median per skole {pst(N.median)}). HH NMBU skiller seg ut med {pst(H.andelEcon)}, NHH har {pst(e.nhh.andelEcon)}.</li>
              <li><strong>Utvikling.</strong> Ingen stor endring på ti år: Norge samlet ligger mellom {pst(Math.min(...tr))} og {pst(Math.max(...tr))} hvert år 2016–2025.</li>
              <li><strong>Internasjonalt.</strong> Verdenstoppen {pst(V.andelEcon)}, Europatoppen {pst(EU.andelEcon)}, Europa samlet {pst(e.europa.andelEcon)}. Norge ligger litt over, HH NMBU rundt tre ganger så høyt.</li>
              <li><strong>Nivå.</strong> I Norge samlet står {pst(N.econM.a3)} av ECON-artiklene i 3+-tidsskrift mot {pst(N.restM.a3)} i andre felt (p {pTekst(N.p3)}), men andelen i 4/4* er lik ({pst(N.econM.a4)} mot {pst(N.restM.a4)}). Utenom NHH og BI: 4/4* {pst(U.econM.a4)} mot {pst(U.restM.a4)} (p {pTekst(U.p4)}). Samfunnsøkonomien har altså mer kvantitet og en solid midtdel, men ikke mer på toppnivået.</li>
              <li><strong>Per fagfelt.</strong> Feltjustert ligger ECON i Norge samlet på indeks {nf(d.feltsjekk.norge.ECON?.i4, 2)} for 4/4* (1 = verdenssnittet i feltet), midt blant fagfeltene. Utenom NHH og BI er ECON blant de laveste ({nf(d.feltsjekk.utenNhhBi.ECON?.i4, 2)}).</li>
            </ol>
          </Seksjon>
          <Seksjon i={4} tittel="Spørsmålene">
            <div className="af-liste">
              {MENY[1].punkter.map((p) => <Listerad key={p.id} ikon={p.ikon} tittel={p.label} meta={p.tekst} onClick={() => gaa(p.id)} />)}
            </div>
          </Seksjon>
          <Seksjon i={5} tittel="Data">
            <div className="af-liste">
              {MENY[2].punkter.map((p) => <Listerad key={p.id} ikon={p.ikon} tittel={p.label} meta={p.tekst} onClick={() => gaa(p.id)} />)}
            </div>
          </Seksjon>
        </div>
        <div className="af-sidekolonne af-stig" style={stig(3)}>
          <Detaljkort tittel="Om analysen" badge={<Badge tone="aksent">Intern</Badge>} rader={[
            { dt: 'Periode', dd: `${per(d)} (trend 2016–2025)` },
            { dt: 'Norske skoler', dd: '15 handelshøyskoler, NVI-rapporterte artikler i NVA' },
            { dt: 'Internasjonalt', dd: `${d.intl.length} handelshøyskoler i OpenAlex` },
            { dt: 'Tidsskriftliste', dd: `AJG 2024, ${nf(d.liste.n)} tidsskrift i 22 fagfelt` },
            { dt: 'Samfunnsøkonomi', dd: 'AJG-feltet ECON (Economics, Econometrics and Statistics)' },
          ]} bunn={`Tallene laget ${new Date(d.generert).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}`} />
        </div>
      </div>
    </div>
  );
}

// ── 1 Fordeling ───────────────────────────────────────────────────────────────
type Telling = 'hel' | 'brok' | 'bred';
const andelFor = (e: Enhet, t: Telling) => (t === 'hel' ? e.andelEcon : t === 'brok' ? e.andelEconBrok : e.andelBred);
const TYPEFARGE: Record<Enhet['type'], string> = { samlet: 'var(--ajg-s1)', norge: 'var(--ajg-s1)', gruppe: 'var(--ajg-s2)', ref: 'var(--ajg-s3)' };

function Fordeling({ d }: P) {
  const [telling, setTelling] = useState<Telling>('hel');
  const [visning, setVisning] = useState<'antall' | 'andel'>('andel');
  const e = d.enheter;
  const ider = ['topp_verden', 'topp_europa', 'europa', 'usa', 'norge', 'utenNhhBi', ...[...d.norske].sort((a, b) => (andelFor(e[b], 'hel') ?? 0) - (andelFor(e[a], 'hel') ?? 0)), 'uib_okon', 'uio_okon'];
  const graf = ider.filter((i) => (telling === 'hel' || e[i].type !== 'gruppe' || telling === 'bred') && (e[i].type !== 'norge' || e[i].n >= 30)).map((i) => ({ id: i, navn: e[i].kort, v: p100(andelFor(e[i], telling)), n: e[i].n, type: e[i].type }));
  const tabell = ['norge', 'utenNhhBi', ...d.norske, 'ntnu_hh', 'uib_okon', 'uio_okon', 'topp_verden', 'topp_europa', 'europa', 'usa', 'norden', 'kontroll'];
  const kol: Kol<string>[] = [
    { navn: 'Enhet', v: (i) => e[i].kort, venstre: true },
    { navn: 'AJG-artikler', v: (i) => e[i].n },
    { navn: 'Herav ECON', v: (i) => e[i].econ },
    { navn: 'Andel ECON', v: (i) => p100(e[i].andelEcon), vis: (i) => pst(e[i].andelEcon) },
    { navn: 'Brøk telling', v: (i) => p100(e[i].andelEconBrok), vis: (i) => pst(e[i].andelEconBrok), tittel: 'Andel av forfatterandelene (bare norske enheter)' },
    { navn: 'Vid definisjon', v: (i) => p100(e[i].andelBred), vis: (i) => pst(e[i].andelBred), tittel: 'ECON + BUS HIST & ECON HIST + REGIONAL STUDIES' },
    { navn: 'Median av skolene', v: (i) => p100(e[i].median), vis: (i) => pst(e[i].median) },
  ];
  const skoler = ['norge', ...d.norske];
  return (
    <div className="af-side af-side-bred">
      <AfHeader eyebrow="Spørsmål 1" tittel="Samfunnsøkonomi mot andre fagområder"
        undertittel={`Andelen av artiklene i AJG-tidsskrift som står i feltet ECON, ${per(d)}. Norske enheter: NVI-rapporterte artikler (NVA). Internasjonalt: OpenAlex.`} />
      <Seksjon i={1} tittel="Andel samfunnsøkonomi per enhet" hoyre={<Segment etikett="Telling" verdi={telling} onChange={setTelling} valg={[{ id: 'hel', label: 'Hel telling' }, { id: 'brok', label: 'Brøk telling' }, { id: 'bred', label: 'Vid definisjon' }]} />}>
        <div className="ajg-kort af-graf">
          <div style={{ height: graf.length * 26 + 40 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graf} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" domain={[0, 100]} {...AKSE} tickFormatter={(v: number) => `${v} %`} />
                <YAxis type="category" dataKey="navn" {...AKSE} width={yb(175)} interval={0} />
                <Tooltip cursor={{ fill: 'var(--af-muted)' }} content={({ payload }) => payload?.[0] ? <Tips tittel={payload[0].payload.navn} linjer={[{ navn: 'Andel ECON', verdi: `${nf(payload[0].payload.v, 1)} %` }, { navn: 'AJG-artikler', verdi: nf(payload[0].payload.n) }]} /> : null} />
                <Bar dataKey="v" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false} label={{ position: 'right', fontSize: 11, fill: 'var(--af-fg-2)', formatter: (v: number) => `${nf(v)}\u00a0%` }}>
                  {graf.map((g) => <Cell key={g.id} fill={TYPEFARGE[g.type]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="ajg-forklaring">
            <span><span className="ajg-chip-prikk" style={{ background: 'var(--ajg-s1)' }} />Norske handelshøyskoler</span>
            <span><span className="ajg-chip-prikk" style={{ background: 'var(--ajg-s2)' }} />Internasjonale grupper (samlet)</span>
            <span><span className="ajg-chip-prikk" style={{ background: 'var(--ajg-s3)' }} />Rene økonomimiljø (referanse)</span>
          </div>
          <p className="ajg-liten" style={{ marginTop: 8 }}>Norske skoler med under 30 AJG-artikler i perioden (HiØ) er bare med i tabellen.{telling === 'brok' ? ' Brøk telling finnes bare for de norske enhetene (NVA har forfatterandeler).' : ''}</p>
        </div>
      </Seksjon>
      <Seksjon i={2} tittel="Tabell" hoyre={<><SorterHint /><CsvKnapp onClick={() => lastNedCsv('ajg-fordeling.csv', ['Enhet', 'AJG-artikler', 'ECON', 'Andel ECON', 'Brøk', 'Vid', 'Median'], tabell.map((i) => [e[i].kort, e[i].n, e[i].econ, p100(e[i].andelEcon), p100(e[i].andelEconBrok), p100(e[i].andelBred), p100(e[i].median)]))} /></>}>
        <SortTabell kol={kol} rader={tabell} klasse={(i) => (i === 'norge' ? 'ajg-uthev' : i === 'topp_verden' || i === 'ntnu_hh' ? 'ajg-skille' : undefined)} />
        <p className="ajg-liten" style={{ marginTop: 8 }}>NTNU = Handelshøyskolen + Institutt for samfunnsøkonomi + IØT, som i rangeringen. Kontrollraden måler NHH og BI i OpenAlex: OpenAlex teller alle artikler, NVA bare NVI-rapporterte, så andelene er ikke helt like.</p>
      </Seksjon>
      <Seksjon i={3} tittel="Alle AJG-fagfelt per skole" hoyre={<><Segment etikett="Visning" verdi={visning} onChange={setVisning} valg={[{ id: 'andel', label: 'Andel' }, { id: 'antall', label: 'Antall' }]} /><CsvKnapp onClick={() => lastNedCsv('ajg-fagfelt-per-skole.csv', ['Fagfelt', ...skoler.map((s) => e[s].kort)], d.felt.map((f) => [f, ...skoler.map((s) => e[s].felt[f] ?? 0)]))} /></>}>
        <SortTabell rader={d.felt} standard={1} klasse={(f) => (f === 'ECON' ? 'ajg-uthev' : undefined)} kol={[
          { navn: 'AJG-fagfelt', v: (f) => kortFelt(f), venstre: true, vis: (f) => <span title={FELTNAVN[f]}>{kortFelt(f)}</span> },
          ...skoler.map((s): Kol<string> => ({
            navn: e[s].kort,
            v: (f) => visning === 'antall' ? e[s].felt[f] ?? 0 : e[s].n ? Math.round(1000 * (e[s].felt[f] ?? 0) / e[s].n) / 10 : null,
            vis: (f) => visning === 'antall' ? nf(e[s].felt[f] ?? 0) : e[s].n ? `${nf(100 * (e[s].felt[f] ?? 0) / e[s].n)} %` : '–',
          })),
        ]} />
        <p className="ajg-liten" style={{ marginTop: 8 }}>Fagfeltet følger tidsskriftet (AJG plasserer hvert tidsskrift i ett felt), ikke instituttet til forfatteren. Hel telling, {per(d)}.</p>
      </Seksjon>
    </div>
  );
}

// ── 2 Utvikling ───────────────────────────────────────────────────────────────
const SERIER = ['norge', 'utenNhhBi', 'nmbu', 'nhh', 'bi', 'topp_europa', 'topp_verden', 'verden'] as const;
type Serie = (typeof SERIER)[number];

function Utvikling({ d }: P) {
  const [valgt, setValgt] = useState<Serie[]>(['norge', 'nmbu', 'topp_europa', 'topp_verden', 'verden']);
  const [glatt, setGlatt] = useState<'aar' | 'tre'>('aar');
  const navn = (s: Serie) => (s === 'verden' ? 'Alle artikler i AJG-tidsskriftene' : d.enheter[s].kort);
  const aar = Object.keys(d.trend.norge);
  const verdi = (s: Serie, i: number) => {
    const t = d.trend[s];
    const fra = glatt === 'tre' ? Math.max(0, i - 2) : i;
    const del = aar.slice(fra, i + 1).map((y) => t[y]);
    const n = del.reduce((a, x) => a + x.n, 0), k = del.reduce((a, x) => a + x.econ, 0);
    return n ? Math.round(1000 * k / n) / 10 : null;
  };
  const rader = aar.map((y, i) => ({ aar: y, ...Object.fromEntries(SERIER.map((s) => [s, verdi(s, i)])), ...Object.fromEntries(SERIER.map((s) => [`n_${s}`, d.trend[s][y].n])) }));
  const N = d.trend.norge;
  const antall = aar.map((y) => ({ aar: y, econ: N[y].econ, andre: N[y].n - N[y].econ }));
  return (
    <div className="af-side af-side-bred">
      <AfHeader eyebrow="Spørsmål 2" tittel="Utvikling over tid" undertittel="Andelen samfunnsøkonomi (ECON) av AJG-artiklene per år, 2016–2025. AJG 2024-nivåene og -feltene brukes for alle år, så endringer i lista påvirker ikke trenden." />
      <Seksjon i={1} tittel="Andel samfunnsøkonomi per år" hoyre={<Segment etikett="Glatting" verdi={glatt} onChange={setGlatt} valg={[{ id: 'aar', label: 'Per år' }, { id: 'tre', label: 'Treårs snitt' }]} />}>
        <Chips etikett="Serier" valg={SERIER.map((s) => ({ id: s, label: navn(s) }))} verdi={valgt} onChange={setValgt} farge={(s) => FARGE[s]} />
        <div className="ajg-kort af-graf">
          <div style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rader} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="aar" {...AKSE} dy={6} />
                <YAxis {...AKSE} width={44} domain={[0, 'auto']} tickFormatter={(v: number) => `${v} %`} />
                <Tooltip content={({ payload, label }) => payload?.length ? <Tips tittel={glatt === 'tre' ? `${Number(label) - 2}–${label}` : label} linjer={valgt.map((s) => ({ navn: navn(s), verdi: `${nf(payload[0].payload[s], 1)} %  (n=${nf(payload[0].payload[`n_${s}`])})`, farge: FARGE[s] }))} /> : null} />
                {valgt.map((s) => (
                  <Line key={s} type="linear" dataKey={s} stroke={FARGE[s]} strokeWidth={2} strokeDasharray={s === 'verden' ? '5 4' : undefined}
                    dot={s === 'verden' ? false : { r: 3, strokeWidth: 0, fill: FARGE[s] }} activeDot={{ r: 4 }} isAnimationActive={false} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Forklaring punkter={valgt.map((s) => ({ navn: navn(s), farge: FARGE[s], stiplet: s === 'verden' }))} />
          <p className="ajg-liten" style={{ marginTop: 8 }}>HH NMBU har 23–44 AJG-artikler i året, så enkeltår svinger mye; treårs snitt gir et roligere bilde. «Alle artikler i AJG-tidsskriftene» er hele verden (OpenAlex).</p>
        </div>
      </Seksjon>
      <Seksjon i={2} tittel="Antall AJG-artikler per år, Norge samlet">
        <div className="ajg-kort af-graf">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={antall} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="aar" {...AKSE} dy={6} />
                <YAxis {...AKSE} width={44} />
                <Tooltip content={({ payload, label }) => payload?.length ? <Tips tittel={label} linjer={[{ navn: 'Samfunnsøkonomi', verdi: nf(payload[0].payload.econ), farge: ECON_FARGE }, { navn: 'Andre fagområder', verdi: nf(payload[0].payload.andre), farge: ANDRE_FARGE }]} /> : null} />
                <Line dataKey="andre" stroke={ANDRE_FARGE} strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: ANDRE_FARGE }} isAnimationActive={false} />
                <Line dataKey="econ" stroke={ECON_FARGE} strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: ECON_FARGE }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Forklaring punkter={[{ navn: 'Samfunnsøkonomi (ECON)', farge: ECON_FARGE }, { navn: 'Andre fagområder', farge: ANDRE_FARGE }]} />
        </div>
      </Seksjon>
      <Seksjon i={3} tittel="Tabell" hoyre={<CsvKnapp onClick={() => lastNedCsv('ajg-utvikling.csv', ['År', ...SERIER.flatMap((s) => [`${navn(s)} andel ECON`, `${navn(s)} AJG-artikler`])], aar.map((y) => [y, ...SERIER.flatMap((s) => [p100(d.trend[s][y].andel), d.trend[s][y].n])]))} />}>
        <SortTabell rader={aar} kol={[
          { navn: 'År', v: (y) => y, venstre: true },
          ...SERIER.map((s): Kol<string> => ({ navn: navn(s), v: (y) => p100(d.trend[s][y].andel), vis: (y) => <span title={`${nf(d.trend[s][y].econ)} av ${nf(d.trend[s][y].n)}`}>{pst(d.trend[s][y].andel)}</span> })),
        ]} />
        <p className="ajg-liten" style={{ marginTop: 8 }}>Hold musa over en verdi for antall artikler. CSV-fila har antallene med.</p>
      </Seksjon>
    </div>
  );
}

// ── 3 Internasjonalt ──────────────────────────────────────────────────────────
const REGION: Record<string, string> = { norden: 'Norden', vest: 'Vest-Europa', sentral: 'Sentral-Europa', sor: 'Sør-Europa', usa: 'USA', canada: 'Canada', asia: 'Asia', kontroll: 'Kontroll (Norge)' };

function Internasjonalt({ d }: P) {
  const e = d.enheter;
  const [regioner, setRegioner] = useState<string[]>(Object.keys(REGION).filter((r) => r !== 'kontroll'));
  const sammen = ['topp_verden', 'topp_europa', 'europa', 'usa', 'norden', 'norge', 'utenNhhBi', 'nmbu'];
  const verdenAndel = (() => { const y = Object.keys(d.trend.verden).filter((a) => +a >= d.periode[0] && +a <= d.periode[1]); const n = y.reduce((a, k) => a + d.trend.verden[k].n, 0); return y.reduce((a, k) => a + d.trend.verden[k].econ, 0) / n; })();
  const graf = [...sammen.map((i) => ({ id: i, navn: e[i].kort, v: p100(e[i].andelEcon), med: p100(e[i].median) })), { id: 'verden', navn: 'Alle i AJG-tidsskriftene', v: p100(verdenAndel), med: null }];
  const skoler = d.intl.filter((s) => regioner.includes(s.gruppe));
  return (
    <div className="af-side af-side-bred">
      <AfHeader eyebrow="Spørsmål 3" tittel="Sammenlignet med skoler i Europa og verden" undertittel={`Samme mål som spørsmål 1 for ${d.intl.length} internasjonale handelshøyskoler (OpenAlex, artikler og oversiktsartikler i AJG-tidsskrift), ${per(d)}.`} />
      <Seksjon i={1} tittel="Andel samfunnsøkonomi">
        <div className="ajg-kort af-graf">
          <div style={{ height: graf.length * 30 + 40 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graf} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" domain={[0, 60]} {...AKSE} tickFormatter={(v: number) => `${v} %`} />
                <YAxis type="category" dataKey="navn" {...AKSE} width={yb(170)} interval={0} />
                <Tooltip cursor={{ fill: 'var(--af-muted)' }} content={({ payload }) => payload?.[0] ? <Tips tittel={payload[0].payload.navn} linjer={[{ navn: 'Samlet', verdi: `${nf(payload[0].payload.v, 1)} %` }, ...(payload[0].payload.med != null ? [{ navn: 'Median av skolene', verdi: `${nf(payload[0].payload.med, 1)} %` }] : [])]} /> : null} />
                <Bar dataKey="v" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false} label={{ position: 'right', fontSize: 11, fill: 'var(--af-fg-2)', formatter: (v: number) => `${nf(v)}\u00a0%` }}>
                  {graf.map((g) => <Cell key={g.id} fill={['norge', 'utenNhhBi', 'nmbu'].includes(g.id) ? 'var(--ajg-s1)' : g.id === 'verden' ? 'var(--ajg-noytral)' : 'var(--ajg-s2)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Seksjon>
      <Seksjon i={2} tittel="Gruppene" hoyre={<CsvKnapp onClick={() => lastNedCsv('ajg-internasjonalt-grupper.csv', ['Gruppe', 'Beskrivelse', 'Skoler', 'AJG-artikler', 'ECON', 'Andel ECON', 'Median av skolene', 'ECON i 4/4*', 'Andre i 4/4*'], ['topp_verden', 'topp_europa', 'europa', 'usa', 'norden', 'kontroll'].map((i) => [e[i].kort, e[i].navn, e[i].antall, e[i].n, e[i].econ, p100(e[i].andelEcon), p100(e[i].median), p100(e[i].econM.a4), p100(e[i].restM.a4)]))} />}>
        <SortTabell rader={['topp_verden', 'topp_europa', 'europa', 'usa', 'norden', 'kontroll']} kol={[
          { navn: 'Gruppe', v: (i) => e[i].kort, venstre: true, vis: (i) => <span title={(e[i].skoler ?? []).join(', ')}>{e[i].kort}</span> },
          { navn: 'Hvem', v: (i) => e[i].navn, venstre: true, bred: true },
          { navn: 'Skoler', v: (i) => e[i].antall },
          { navn: 'AJG-artikler', v: (i) => e[i].n },
          { navn: 'Andel ECON', v: (i) => p100(e[i].andelEcon), vis: (i) => pst(e[i].andelEcon) },
          { navn: 'Median av skolene', v: (i) => p100(e[i].median), vis: (i) => pst(e[i].median) },
          { navn: 'ECON i 4/4*', v: (i) => p100(e[i].econM.a4), vis: (i) => pst(e[i].econM.a4) },
          { navn: 'Andre i 4/4*', v: (i) => p100(e[i].restM.a4), vis: (i) => pst(e[i].restM.a4) },
        ]} />
        <p className="ajg-liten" style={{ marginTop: 8 }}>Verdenstoppen = UTD Top 100 plass 1–25. Frittstående skoler telles som hele institusjonen; amerikanske fakulteter via universitetet og tilknytningstekst. Hold musa over gruppenavnet for å se skolene. Samme artikkel kan telles ved flere skoler i en gruppe.</p>
      </Seksjon>
      <Seksjon i={3} tittel="Alle skolene" hoyre={<CsvKnapp onClick={() => lastNedCsv('ajg-internasjonale-skoler.csv', ['Kort', 'Navn', 'Land', 'Region', 'UTD-plass', 'AJG-artikler', 'ECON', 'Andel ECON', 'ECON i 4/4*', 'Andre i 4/4*'], skoler.map((s) => [s.kort, s.navn, s.land, REGION[s.gruppe], s.utd, s.n, s.econ, p100(s.andelEcon), p100(s.a4e), p100(s.a4r)]))} />}>
        <Chips etikett="Regioner" valg={Object.entries(REGION).map(([id, label]) => ({ id, label }))} verdi={regioner} onChange={setRegioner} />
        <SortTabell rader={skoler} standard={6} hoy kol={[
          { navn: 'Skole', v: (s) => s.kort, venstre: true, vis: (s) => <span title={s.navn}>{s.kort}</span> },
          { navn: 'Land', v: (s) => s.land, venstre: true },
          { navn: 'Region', v: (s) => REGION[s.gruppe], venstre: true },
          { navn: 'UTD-plass', v: (s) => s.utd },
          { navn: 'AJG-artikler', v: (s) => s.n },
          { navn: 'ECON', v: (s) => s.econ },
          { navn: 'Andel ECON', v: (s) => p100(s.andelEcon), vis: (s) => pst(s.andelEcon) },
          { navn: 'ECON i 4/4*', v: (s) => p100(s.a4e), vis: (s) => pst(s.a4e) },
          { navn: 'Andre i 4/4*', v: (s) => p100(s.a4r), vis: (s) => pst(s.a4r) },
        ]} />
      </Seksjon>
    </div>
  );
}

// ── 4 Nivå per fagområde ──────────────────────────────────────────────────────
type Mal = 'a4' | 'a3' | 'i4' | 'i3' | 'snitt';
const MAL: { id: Mal; label: string; akse: string; pst: boolean }[] = [
  { id: 'a4', label: 'Andel 4/4*', akse: 'Andel i 4/4*-tidsskrift', pst: true },
  { id: 'a3', label: 'Andel 3+', akse: 'Andel i 3+-tidsskrift', pst: true },
  { id: 'i4', label: 'Indeks 4/4*', akse: 'Feltjustert indeks 4/4* (1 = verdenssnittet i feltet)', pst: false },
  { id: 'i3', label: 'Indeks 3+', akse: 'Feltjustert indeks 3+ (1 = verdenssnittet i feltet)', pst: false },
  { id: 'snitt', label: 'Snittnivå', akse: 'Snittnivå (1–5, 4* = 5)', pst: false },
];
const malVerdi = (m: Maal, mal: Mal) => { const v = m[mal]; return v == null ? null : MAL.find((x) => x.id === mal)!.pst ? p100(v as number) : Math.round(100 * (v as number)) / 100; };
const malTekst = (v: number | null, mal: Mal) => (v == null ? '–' : MAL.find((x) => x.id === mal)!.pst ? `${nf(v, 1)} %` : nf(v, 2));
const NIVA_ENHETER = ['topp_verden', 'topp_europa', 'europa', 'usa', 'nhh', 'bi', 'norge', 'utenNhhBi', 'nmbu', 'uio_okon'];

function NivaSide({ d }: P) {
  const [mal, setMal] = useState<Mal>('a4');
  const [trendEnhet, setTrendEnhet] = useState('norge');
  const e = d.enheter;
  const mm = MAL.find((x) => x.id === mal)!;
  const ci = (m: Maal, side: 'lo' | 'hi') => { const c = mal === 'a4' ? m.ci4 : mal === 'a3' ? m.ci3 : null; const v = malVerdi(m, mal); return c && v != null ? Math.abs(100 * c[side === 'lo' ? 0 : 1] - v) : 0; };
  const graf = NIVA_ENHETER.map((i) => ({ navn: e[i].kort, econ: malVerdi(e[i].econM, mal), andre: malVerdi(e[i].restM, mal), ne: e[i].econM.n, nr: e[i].restM.n,
    econFeil: [ci(e[i].econM, 'lo'), ci(e[i].econM, 'hi')], andreFeil: [ci(e[i].restM, 'lo'), ci(e[i].restM, 'hi')] }));
  const rader = NIVA_ENHETER.concat(['uis', 'uia', 'ntnu', 'inn', 'usn', 'nord', 'oslomet', 'uit', 'himolde', 'hvl', 'kristiania']).flatMap((i) => [{ i, s: 'econM' as const }, { i, s: 'restM' as const }]);
  const kol: Kol<{ i: string; s: 'econM' | 'restM' }>[] = [
    { navn: 'Enhet', v: (r) => e[r.i].kort, venstre: true, vis: (r) => (r.s === 'econM' ? e[r.i].kort : '') },
    { navn: 'Fagområde', v: (r) => (r.s === 'econM' ? 'ECON' : 'Andre'), venstre: true },
    { navn: 'Artikler', v: (r) => e[r.i][r.s].n },
    ...NIV.map((k): Kol<{ i: string; s: 'econM' | 'restM' }> => ({ navn: `AJG ${k}`, v: (r) => e[r.i][r.s].niva?.[k] ?? 0 })),
    { navn: 'Andel 3+', v: (r) => p100(e[r.i][r.s].a3), vis: (r) => <span title={ciTekst(e[r.i][r.s].ci3)}>{pst(e[r.i][r.s].a3)}</span> },
    { navn: 'Andel 4/4*', v: (r) => p100(e[r.i][r.s].a4), vis: (r) => <span title={ciTekst(e[r.i][r.s].ci4)}>{pst(e[r.i][r.s].a4)}</span> },
    { navn: 'Snitt', v: (r) => e[r.i][r.s].snitt ?? null, vis: (r) => nf(e[r.i][r.s].snitt, 2) },
    { navn: 'Indeks 3+', v: (r) => e[r.i][r.s].i3 ?? null, vis: (r) => nf(e[r.i][r.s].i3, 2) },
    { navn: 'Indeks 4/4*', v: (r) => e[r.i][r.s].i4 ?? null, vis: (r) => nf(e[r.i][r.s].i4, 2) },
    { navn: 'p 3+', v: (r) => (r.s === 'econM' ? e[r.i].p3 ?? null : null), vis: (r) => (r.s === 'econM' ? <span className={signifikant(e[r.i].p3) ? 'ajg-sig' : undefined}>{pTekst(e[r.i].p3)}</span> : ''), tittel: 'ECON mot andre fagområder i samme enhet' },
    { navn: 'p 4/4*', v: (r) => (r.s === 'econM' ? e[r.i].p4 ?? null : null), vis: (r) => (r.s === 'econM' ? <span className={signifikant(e[r.i].p4) ? 'ajg-sig' : undefined}>{pTekst(e[r.i].p4)}</span> : '') },
  ];
  const tr = d.trend[trendEnhet];
  const trendData = Object.keys(tr).map((y) => ({ aar: y, econ: p100(tr[y].a4e), andre: p100(tr[y].a4r), n: tr[y].econ, nr: tr[y].n - tr[y].econ }));
  const stripeEnheter = ['norge', 'utenNhhBi', 'nhh', 'bi', 'nmbu', 'topp_europa', 'topp_verden'];
  return (
    <div className="af-side af-side-bred">
      <AfHeader eyebrow="Spørsmål 4" tittel="Er samfunnsøkonomien bare mer kvantitet?"
        undertittel={`AJG-nivået på artiklene i samfunnsøkonomi (ECON) mot andre fagområder i samme enhet, ${per(d)}. Andelene viser hvor stor del av artiklene i hvert fagområde som havner i tidsskrift på nivå 3+ og 4/4*.`} />
      <div className="af-stig" style={stig(1)}>
        <Notis>
          <strong>Kort svar:</strong> Nei, ikke bare kvantitet, men heller ikke mer på toppen. I Norge samlet står {pst(e.norge.econM.a3)} av ECON-artiklene i 3+-tidsskrift mot {pst(e.norge.restM.a3)} i andre felt (p {pTekst(e.norge.p3)}), mens andelen i 4/4* er lik ({pst(e.norge.econM.a4)} mot {pst(e.norge.restM.a4)}).
          Utenom NHH og BI havner ECON sjelden i 4/4* ({pst(e.utenNhhBi.econM.a4)} mot {pst(e.utenNhhBi.restM.a4)}). Ved toppskolene internasjonalt ligger ECON lavere enn andre felt på 4/4*. Feltjustert indeks tar hensyn til at AJG har få toppnivå-tidsskrift i ECON: bare {pst(d.verdenFelt.ECON.a4)} av verdens ECON-artikler står i 4/4*.
        </Notis>
      </div>
      <Seksjon i={2} tittel="ECON mot andre fagområder" hoyre={<Segment etikett="Mål" verdi={mal} onChange={setMal} valg={MAL.map((m) => ({ id: m.id, label: m.label }))} />}>
        <div className="ajg-kort af-graf">
          <div style={{ height: graf.length * 46 + 40 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graf} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 4 }} barGap={2}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" {...AKSE} tickFormatter={(v: number) => (mm.pst ? `${v} %` : nf(v, 1))} domain={[0, 'auto']} />
                <YAxis type="category" dataKey="navn" {...AKSE} width={yb(175)} interval={0} />
                {(mal === 'i4' || mal === 'i3') && <ReferenceLine x={1} stroke="var(--af-fg)" strokeWidth={1} />}
                <Tooltip cursor={{ fill: 'var(--af-muted)' }} content={({ payload }) => payload?.[0] ? <Tips tittel={payload[0].payload.navn} linjer={[
                  { navn: `ECON (n=${nf(payload[0].payload.ne)})`, verdi: malTekst(payload[0].payload.econ, mal), farge: ECON_FARGE },
                  { navn: `Andre (n=${nf(payload[0].payload.nr)})`, verdi: malTekst(payload[0].payload.andre, mal), farge: ANDRE_FARGE }]} /> : null} />
                <Bar dataKey="econ" fill={ECON_FARGE} radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={false}>
                  {mm.pst && <ErrorBar dataKey="econFeil" width={4} strokeWidth={1} stroke="var(--af-fg)" direction="x" />}
                </Bar>
                <Bar dataKey="andre" fill={ANDRE_FARGE} radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={false}>
                  {mm.pst && <ErrorBar dataKey="andreFeil" width={4} strokeWidth={1} stroke="var(--af-fg)" direction="x" />}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="ajg-forklaring">
            <span><span className="ajg-chip-prikk" style={{ background: ECON_FARGE }} />Samfunnsøkonomi (ECON)</span>
            <span><span className="ajg-chip-prikk" style={{ background: ANDRE_FARGE }} />Andre fagområder</span>
            {mm.pst && <span>Strek = 95 % konfidensintervall (Wilson)</span>}
          </div>
          <p className="ajg-liten" style={{ marginTop: 8 }}>{mm.akse}. Indeks = observert andel / forventet andel, der forventet er verdensandelen i artikkelens AJG-felt (alle artikler i feltets tidsskrift samme år, OpenAlex).</p>
        </div>
      </Seksjon>
      <Seksjon i={3} tittel="Nivåfordelingen">
        <div className="ajg-kort">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 200px) 1fr', gap: '8px 12px', alignItems: 'center' }}>
            {stripeEnheter.flatMap((i) => [
              <div key={i + 'e'} className="ajg-liten" style={{ color: 'var(--af-fg)' }}>{e[i].kort}, ECON <span className="ajg-dempet">(n={nf(e[i].econM.n)})</span></div>,
              <NivaStripe key={i + 'es'} niva={e[i].econM.niva} />,
              <div key={i + 'a'} className="ajg-liten">{e[i].kort}, andre <span className="ajg-dempet">(n={nf(e[i].restM.n)})</span></div>,
              <NivaStripe key={i + 'as'} niva={e[i].restM.niva} />,
            ])}
          </div>
          <NivaForklaring />
        </div>
      </Seksjon>
      <Seksjon i={4} tittel="Andel i 4/4* over tid" hoyre={<Velg etikett="Enhet" verdi={trendEnhet} onChange={setTrendEnhet} valg={['norge', 'utenNhhBi', 'nmbu', 'nhh', 'bi', 'topp_europa', 'topp_verden'].map((i) => ({ id: i, label: e[i].kort }))} />}>
        <div className="ajg-kort af-graf">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="aar" {...AKSE} dy={6} />
                <YAxis {...AKSE} width={44} domain={[0, 'auto']} tickFormatter={(v: number) => `${v} %`} />
                <Tooltip content={({ payload, label }) => payload?.length ? <Tips tittel={label} linjer={[{ navn: `ECON (n=${payload[0].payload.n})`, verdi: `${nf(payload[0].payload.econ, 1)} %`, farge: ECON_FARGE }, { navn: `Andre (n=${payload[0].payload.nr})`, verdi: `${nf(payload[0].payload.andre, 1)} %`, farge: ANDRE_FARGE }]} /> : null} />
                <Line dataKey="andre" stroke={ANDRE_FARGE} strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: ANDRE_FARGE }} isAnimationActive={false} connectNulls />
                <Line dataKey="econ" stroke={ECON_FARGE} strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: ECON_FARGE }} isAnimationActive={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Forklaring punkter={[{ navn: 'Samfunnsøkonomi (ECON)', farge: ECON_FARGE }, { navn: 'Andre fagområder', farge: ANDRE_FARGE }]} />
        </div>
      </Seksjon>
      <Seksjon i={5} tittel="Alle tall" hoyre={<><SorterHint /><CsvKnapp onClick={() => lastNedCsv('ajg-niva-per-fagomrade.csv', ['Enhet', 'Fagområde', 'Artikler', ...NIV.map((k) => `AJG ${k}`), 'Andel 3+', '3+ KI nedre', '3+ KI øvre', 'Andel 4/4*', '4/4* KI nedre', '4/4* KI øvre', 'Snitt', 'Indeks 3+', 'Indeks 4/4*', 'p 3+', 'p 4/4*'],
        rader.map((r) => { const m = e[r.i][r.s]; return [e[r.i].kort, r.s === 'econM' ? 'ECON' : 'Andre', m.n, ...NIV.map((k) => m.niva?.[k] ?? 0), p100(m.a3), p100(m.ci3?.[0]), p100(m.ci3?.[1]), p100(m.a4), p100(m.ci4?.[0]), p100(m.ci4?.[1]), m.snitt, m.i3, m.i4, r.s === 'econM' ? e[r.i].p3 : null, r.s === 'econM' ? e[r.i].p4 : null]; }))} /></>}>
        <SortTabell kol={kol} rader={rader} klasse={(r) => (r.s === 'econM' ? 'ajg-skille' : undefined)} />
        <p className="ajg-liten" style={{ marginTop: 8 }}>Hold musa over en andel for konfidensintervallet. Uthevet p-verdi = under 0,05. Artikler fra samme forfattere er ikke uavhengige, så p-verdiene er veiledende.</p>
      </Seksjon>
    </div>
  );
}
const ciTekst = (c: [number, number] | null | undefined) => (c ? `95 % KI ${nf(100 * c[0], 1)}–${nf(100 * c[1], 1)} %` : '');

// ── Nivå per AJG-fagfelt ──────────────────────────────────────────────────────
const FS_ENHETER = ['norge', 'utenNhhBi', 'nhh', 'bi', 'nmbu', 'topp_europa', 'topp_verden', 'europa'];

function Fagfelt({ d }: P) {
  const [enhet, setEnhet] = useState('norge');
  const [mal, setMal] = useState<'i4' | 'a4' | 'a3' | 'i3'>('i4');
  const [minN, setMinN] = useState(true);
  const fs = d.feltsjekk[enhet];
  const felt = d.felt.filter((f) => fs[f] && (!minN || fs[f].n >= 20));
  const erPst = mal === 'a4' || mal === 'a3';
  const graf = felt.map((f) => ({ f, navn: kortFelt(f), v: malVerdi(fs[f], mal), verden: erPst ? p100(d.verdenFelt[f][mal as 'a3' | 'a4']) : null, n: fs[f].n }))
    .sort((a, b) => (b.v ?? 0) - (a.v ?? 0));
  const rader = d.felt.filter((f) => fs[f]);
  return (
    <div className="af-side af-side-bred">
      <AfHeader eyebrow="Spørsmål 4, utvidet" tittel="Nivå per AJG-fagfelt"
        undertittel={`Samme nivåsjekk for hvert av de 22 AJG-fagfeltene: feltet mot resten av enheten, og feltjustert indeks mot verdensandelen i feltet. ${per(d)}, hel telling.`} />
      <Seksjon i={1} tittel={`${d.enheter[enhet].kort}: ${MAL.find((m) => m.id === mal)!.label.toLowerCase()} per fagfelt`} hoyre={<>
        <Velg etikett="Enhet" verdi={enhet} onChange={setEnhet} valg={FS_ENHETER.map((i) => ({ id: i, label: d.enheter[i].kort }))} />
        <Segment etikett="Mål" verdi={mal} onChange={setMal} valg={[{ id: 'i4', label: 'Indeks 4/4*' }, { id: 'a4', label: 'Andel 4/4*' }, { id: 'a3', label: 'Andel 3+' }, { id: 'i3', label: 'Indeks 3+' }]} />
      </>}>
        <div className="ajg-filter">
          <button type="button" className="ajg-chip" aria-pressed={minN} onClick={() => setMinN(!minN)}>Bare felt med minst 20 artikler</button>
        </div>
        <div className="ajg-kort af-graf">
          <div style={{ height: graf.length * (erPst ? 34 : 26) + 40 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graf} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 4 }} barGap={2}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" {...AKSE} domain={[0, 'auto']} tickFormatter={(v: number) => (erPst ? `${v} %` : nf(v, 1))} />
                <YAxis type="category" dataKey="navn" {...AKSE} width={yb(175)} interval={0} />
                {!erPst && <ReferenceLine x={1} stroke="var(--af-fg)" strokeWidth={1} />}
                <Tooltip cursor={{ fill: 'var(--af-muted)' }} content={({ payload }) => payload?.[0] ? <Tips tittel={`${payload[0].payload.f} (n=${nf(payload[0].payload.n)})`} linjer={[
                  { navn: d.enheter[enhet].kort, verdi: malTekst(payload[0].payload.v, mal) }, ...(erPst ? [{ navn: 'Verden (alle i feltets tidsskrift)', verdi: `${nf(payload[0].payload.verden, 1)} %` }] : [])]} /> : null} />
                <Bar dataKey="v" radius={[0, 4, 4, 0]} barSize={erPst ? 12 : 16} isAnimationActive={false}>
                  {graf.map((g) => <Cell key={g.f} fill={g.f === 'ECON' ? ECON_FARGE : ANDRE_FARGE} />)}
                </Bar>
                {erPst && <Bar dataKey="verden" fill="var(--ajg-noytral)" radius={[0, 4, 4, 0]} barSize={8} isAnimationActive={false} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="ajg-forklaring">
            <span><span className="ajg-chip-prikk" style={{ background: ECON_FARGE }} />ECON</span>
            <span><span className="ajg-chip-prikk" style={{ background: ANDRE_FARGE }} />Andre fagfelt</span>
            {erPst ? <span><span className="ajg-chip-prikk" style={{ background: 'var(--ajg-noytral)' }} />Verden: alle artikler i feltets AJG-tidsskrift</span> : <span>Svart strek = verdenssnittet i feltet</span>}
          </div>
        </div>
      </Seksjon>
      <Seksjon i={2} tittel="Alle fagfelt" hoyre={<><SorterHint /><CsvKnapp onClick={() => lastNedCsv(`ajg-fagfelt-${enhet}.csv`, ['Fagfelt', 'Artikler', ...NIV.map((k) => `AJG ${k}`), 'Andel 3+', 'Resten 3+', 'p 3+', 'Andel 4/4*', '4/4* KI nedre', '4/4* KI øvre', 'Resten 4/4*', 'p 4/4*', 'Snitt', 'Verden 3+', 'Indeks 3+', 'Verden 4/4*', 'Indeks 4/4*'],
        rader.map((f) => { const m = fs[f]; return [f, m.n, ...NIV.map((k) => m.niva?.[k] ?? 0), p100(m.a3), p100(m.rest3), m.p3, p100(m.a4), p100(m.ci4?.[0]), p100(m.ci4?.[1]), p100(m.rest4), m.p4, m.snitt, p100(d.verdenFelt[f].a3), m.i3, p100(d.verdenFelt[f].a4), m.i4]; }))} /></>}>
        <SortTabell rader={rader} standard={1} klasse={(f) => (f === 'ECON' ? 'ajg-uthev' : undefined)} kol={[
          { navn: 'AJG-fagfelt', v: (f) => kortFelt(f), venstre: true, vis: (f) => <span title={FELTNAVN[f]}>{kortFelt(f)}</span> },
          { navn: 'Artikler', v: (f) => fs[f].n },
          { navn: 'Nivåfordeling', v: (f) => fs[f].snitt ?? null, vis: (f) => <div style={{ width: 140 }}><NivaStripe niva={fs[f].niva} /></div> },
          { navn: 'Andel 3+', v: (f) => p100(fs[f].a3), vis: (f) => <span title={ciTekst(fs[f].ci3)}>{pst(fs[f].a3)}</span> },
          { navn: 'Resten 3+', v: (f) => p100(fs[f].rest3), vis: (f) => pst(fs[f].rest3), tittel: 'Resten av enheten (alle andre felt)' },
          { navn: 'p 3+', v: (f) => fs[f].p3 ?? null, vis: (f) => <span className={signifikant(fs[f].p3) ? 'ajg-sig' : undefined}>{pTekst(fs[f].p3)}</span> },
          { navn: 'Andel 4/4*', v: (f) => p100(fs[f].a4), vis: (f) => <span title={ciTekst(fs[f].ci4)}>{pst(fs[f].a4)}</span> },
          { navn: 'Resten 4/4*', v: (f) => p100(fs[f].rest4), vis: (f) => pst(fs[f].rest4) },
          { navn: 'p 4/4*', v: (f) => fs[f].p4 ?? null, vis: (f) => <span className={signifikant(fs[f].p4) ? 'ajg-sig' : undefined}>{pTekst(fs[f].p4)}</span> },
          { navn: 'Verden 3+', v: (f) => p100(d.verdenFelt[f].a3), vis: (f) => pst(d.verdenFelt[f].a3) },
          { navn: 'Indeks 3+', v: (f) => fs[f].i3 ?? null, vis: (f) => nf(fs[f].i3, 2) },
          { navn: 'Verden 4/4*', v: (f) => p100(d.verdenFelt[f].a4), vis: (f) => pst(d.verdenFelt[f].a4) },
          { navn: 'Indeks 4/4*', v: (f) => fs[f].i4 ?? null, vis: (f) => nf(fs[f].i4, 2) },
        ]} />
        <NivaForklaring />
        <p className="ajg-liten" style={{ marginTop: 8 }}>Les små felt med forsiktighet. Indeksen gjør feltene sammenlignbare: felt der AJG har mange 4/4*-tidsskrift (f.eks. ORG STUD, PSYCH) har høyere verdensandel og dermed høyere forventning.</p>
      </Seksjon>
    </div>
  );
}

// ── AJG-lista kontrollert ─────────────────────────────────────────────────────
function Lista({ d }: P) {
  const L = d.liste, O = L.offisielt;
  const status = (vaar: number, off: number) => (vaar === off ? <Badge tone="suksess">Stemmer</Badge> : <Badge tone="advarsel">Avvik {vaar - off > 0 ? '+' : '−'}{Math.abs(vaar - off)}</Badge>);
  const kontroll: [string, number, number | null, string][] = [
    ['Tidsskrift i alt', L.n, O.n, 'Chartered ABS'],
    ['Nye tidsskrift (ikke i AJG 2021)', L.nye, O.nye, 'CBS Library'],
    ['Nye på 4*', L.nye4s, O.nye4s, 'CBS Library'],
    ['Nye på 4', L.nye4, O.nye4, 'CBS Library'],
  ];
  const felt = d.felt;
  const sum = Object.fromEntries(NIV.map((k) => [k, felt.reduce((a, f) => a + L.felt[f][k], 0)])) as Record<Niva, number>;
  const fra = ['ny', '1', '2', '3', '4', '4*'];
  return (
    <div className="af-side af-side-bred">
      <AfHeader eyebrow="Data" tittel="AJG-lista kontrollert" undertittel="Vår uthenting av AJG 2024 (07.10.2026, avtalt med Chartered ABS) mot tallene Chartered ABS og CBS Library har publisert, og fordelingen av tidsskriftene på fagfelt og nivå." />
      <div className="af-stig" style={stig(1)}>
        <KpiStripe kpier={[
          { ikon: ClipboardList, etikett: 'Tidsskrift', verdi: nf(L.n), hjelp: `oppgitt ${nf(O.n)}` },
          { ikon: Layers, etikett: 'Fagfelt', verdi: nf(felt.length), hjelp: 'AJGs egne' },
          { ikon: Award, etikett: '4* og 4', verdi: `${L.niva['4*']} + ${L.niva['4']}`, hjelp: `${pst((L.niva['4*'] + L.niva['4']) / L.n)} av lista` },
          { ikon: ShieldCheck, etikett: 'Dubletter', verdi: nf(L.dubletterTittel + L.dubletterIssn), hjelp: 'tittel eller ISSN' },
          { ikon: AlertTriangle, etikett: 'Uten ISSN / felt', verdi: `${L.utenIssn} / ${L.utenFelt}` },
        ]} />
      </div>
      <Seksjon i={2} tittel="Mot de offentlige tallene">
        <div className="ajg-tabellramme">
          <table className="ajg-tabell">
            <thead><tr><th>Kontroll</th><th>Vår uthenting</th><th>Offentlig tall</th><th>Kilde</th><th>Vurdering</th></tr></thead>
            <tbody>{kontroll.map(([k, v, o, kilde]) => <tr key={k}><td>{k}</td><td>{nf(v)}</td><td>{nf(o)}</td><td>{kilde}</td><td>{o == null ? '–' : status(v, o)}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="ajg-tekst" style={{ marginTop: 12 }}>
          <p>Avviket er ett tidsskrift (0,05 %): vi har ett mer i alt og ett færre nytt. Nesten like titler er sjekket og er ulike tidsskrift. Nivåendringene vi kan kontrollere (nye 4* og 4) stemmer eksakt, og de to oppgraderingene fra 3 til 4 (Socio-Economic Review, Long Range Planning) er de CBS Library nevner. Avviket påvirker ikke tallene.</p>
          <p className="ajg-liten">Kilder: <a href={O.kilder[0]} target="_blank" rel="noreferrer">Chartered ABS 30.10.2024</a> · <a href={O.kilder[1]} target="_blank" rel="noreferrer">CBS Library 13.12.2024</a>. Antall per nivå er ikke publisert av Chartered ABS.</p>
        </div>
      </Seksjon>
      <Seksjon i={3} tittel="Tidsskrift per fagfelt og nivå" hoyre={<CsvKnapp onClick={() => lastNedCsv('ajg-lista-felt-niva.csv', ['Fagfelt', ...NIV.map((k) => `Nivå ${k}`), 'I alt', 'Andel 3+', 'Andel 4/4*', 'Verden artikler 3+', 'Verden artikler 4/4*'], felt.map((f) => { const c = L.felt[f]; const n = NIV.reduce((a, k) => a + c[k], 0); return [f, ...NIV.map((k) => c[k]), n, p100((c['3'] + c['4'] + c['4*']) / n), p100((c['4'] + c['4*']) / n), p100(d.verdenFelt[f].a3), p100(d.verdenFelt[f].a4)]; }))} />}>
        <SortTabell rader={felt} standard={6} klasse={(f) => (f === 'ECON' ? 'ajg-uthev' : undefined)} fast={[]} kol={[
          { navn: 'AJG-fagfelt', v: (f) => kortFelt(f), venstre: true, vis: (f) => <span title={FELTNAVN[f]}>{kortFelt(f)}</span> },
          ...NIV.map((k): Kol<string> => ({ navn: <NivaMerke n={k} />, v: (f) => L.felt[f][k] })),
          { navn: 'I alt', v: (f) => NIV.reduce((a, k) => a + L.felt[f][k], 0) },
          { navn: 'Tidsskrift 3+', v: (f) => { const c = L.felt[f]; return p100((c['3'] + c['4'] + c['4*']) / NIV.reduce((a, k) => a + c[k], 0)); }, vis: (f) => { const c = L.felt[f]; return pst((c['3'] + c['4'] + c['4*']) / NIV.reduce((a, k) => a + c[k], 0)); } },
          { navn: 'Tidsskrift 4/4*', v: (f) => { const c = L.felt[f]; return p100((c['4'] + c['4*']) / NIV.reduce((a, k) => a + c[k], 0)); }, vis: (f) => { const c = L.felt[f]; return pst((c['4'] + c['4*']) / NIV.reduce((a, k) => a + c[k], 0)); } },
          { navn: 'Artikler i verden 3+', v: (f) => p100(d.verdenFelt[f].a3), vis: (f) => pst(d.verdenFelt[f].a3), tittel: `Andel av alle artikler i feltets tidsskrift ${per(d)} (OpenAlex)` },
          { navn: 'Artikler i verden 4/4*', v: (f) => p100(d.verdenFelt[f].a4), vis: (f) => pst(d.verdenFelt[f].a4) },
        ]} />
        <div className="ajg-tabellramme" style={{ marginTop: 8 }}>
          <table className="ajg-tabell"><tbody><tr className="ajg-uthev"><td>Sum</td>{NIV.map((k) => <td key={k}>{nf(sum[k])}</td>)}<td>{nf(L.n)}</td><td>{pst((sum['3'] + sum['4'] + sum['4*']) / L.n)}</td><td>{pst((sum['4'] + sum['4*']) / L.n)}</td></tr></tbody></table>
        </div>
      </Seksjon>
      <Seksjon i={4} tittel="Fra AJG 2021 til AJG 2024">
        <div className="ajg-tabellramme">
          <table className="ajg-tabell">
            <thead><tr><th>AJG 2021 ↓ / AJG 2024 →</th>{NIV.map((k) => <th key={k}><NivaMerke n={k} /></th>)}<th>I alt</th></tr></thead>
            <tbody>{fra.map((a) => {
              const rad = NIV.map((b) => L.overgang[`${a}→${b}`] ?? 0);
              return <tr key={a}><td>{a === 'ny' ? 'Ny i 2024' : <NivaMerke n={a as Niva} />}</td>{rad.map((v, j) => <td key={j} className={a === NIV[j] ? undefined : v ? 'ajg-sig' : 'ajg-dempet'}>{v || '·'}</td>)}<td>{nf(rad.reduce((x, y) => x + y, 0))}</td></tr>;
            })}</tbody>
          </table>
        </div>
        <p className="ajg-liten" style={{ marginTop: 8 }}>Diagonalen = uendret nivå. Uthevet = endret nivå eller nytt tidsskrift. {O.fjernet} tidsskrift fra AJG 2021 er tatt ut (CBS Library) og er ikke i lista.</p>
      </Seksjon>
    </div>
  );
}

// ── Tidsskrift ────────────────────────────────────────────────────────────────
function TidsskriftSide({ d }: P) {
  const [sok, setSok] = useState('');
  const [felt, setFelt] = useState('alle');
  const [nivaer, setNivaer] = useState<Niva[]>([...NIV]);
  const [kunNorge, setKunNorge] = useState(true);
  const [skole, setSkole] = useState('alle');
  const rader = useMemo(() => {
    const q = sok.trim().toLowerCase();
    return d.tidsskrift.filter((t) => (felt === 'alle' || t[3] === felt) && nivaer.includes(t[4]) && (!kunNorge || t[6] > 0)
      && (skole === 'alle' || t[7][d.norske.indexOf(skole)] > 0)
      && (!q || t[0].toLowerCase().includes(q) || t[1].includes(q) || t[2].includes(q)));
  }, [d, sok, felt, nivaer, kunNorge, skole]);
  const skoler = skole === 'alle' ? d.norske : [skole];
  const kol: Kol<Tidsskrift>[] = [
    { navn: 'Tidsskrift', v: (t) => t[0], venstre: true, bred: true, vis: (t) => <span title={`ISSN ${t[1]}${t[2] ? ` · eISSN ${t[2]}` : ''}`}>{t[0]}</span> },
    { navn: 'Fagfelt', v: (t) => kortFelt(t[3]), venstre: true },
    { navn: 'AJG 2024', v: (t) => NIV.indexOf(t[4]), vis: (t) => <NivaMerke n={t[4]} /> },
    { navn: 'AJG 2021', v: (t) => (t[5] ? NIV.indexOf(t[5] as Niva) : -1), vis: (t) => (t[5] ? <NivaMerke n={t[5] as Niva} /> : <span className="ajg-dempet">ny</span>) },
    { navn: 'Norge samlet', v: (t) => t[6] },
    ...skoler.map((s): Kol<Tidsskrift> => ({ navn: d.kort[s], v: (t) => t[7][d.norske.indexOf(s)] || null })),
    { navn: 'Europatoppen', v: (t) => t[8] || null },
    { navn: 'Verdenstoppen', v: (t) => t[9] || null },
  ];
  return (
    <div className="af-side af-side-bred">
      <AfHeader eyebrow="Data · intern" tittel="Tidsskrift" undertittel={`AJG-tidsskriftene norske handelshøyskoler eller toppskolene publiserte i, ${per(d)}, med AJG-nivå og antall artikler (hel telling). Norge: NVI-rapporterte (NVA); toppskolene: OpenAlex.`} />
      <div className="af-stig" style={stig(1)}>
        <Notis ikon={ShieldCheck}><strong>Lisensbelagt:</strong> AJG-nivå per tidsskrift skal ikke publiseres eller sendes ut av prosjektet. CSV-eksporten har derfor ikke nivåkolonnene.</Notis>
      </div>
      <Seksjon i={2} tittel={`Viser ${nf(rader.length)} av ${nf(d.tidsskrift.length)} tidsskrift`} hoyre={<CsvKnapp onClick={() => lastNedCsv('tidsskrift-antall.csv', ['Tidsskrift', 'ISSN', 'eISSN', 'Fagfelt', 'Norge samlet', ...d.norske.map((s) => d.kort[s]), 'Europatoppen', 'Verdenstoppen'], rader.map((t) => [t[0], t[1], t[2], t[3], t[6], ...t[7], t[8], t[9]]))} />}>
        <div className="ajg-filter">
          <input className="ajg-sok" type="search" placeholder="Søk i tittel eller ISSN" value={sok} onChange={(e) => setSok(e.target.value)} aria-label="Søk" />
          <Velg etikett="Fagfelt" verdi={felt} onChange={setFelt} valg={[{ id: 'alle', label: 'Alle fagfelt' }, ...d.felt.map((f) => ({ id: f, label: kortFelt(f) }))]} />
          <Velg etikett="Skole" verdi={skole} onChange={setSkole} valg={[{ id: 'alle', label: 'Alle skoler (kolonner)' }, ...d.norske.map((s) => ({ id: s, label: `Bare ${d.kort[s]}` }))]} />
          <button type="button" className="ajg-chip" aria-pressed={kunNorge} onClick={() => setKunNorge(!kunNorge)}>Med norske artikler</button>
        </div>
        <Chips etikett="AJG-nivå" valg={NIV.map((k) => ({ id: k, label: `AJG ${k}` }))} verdi={nivaer} onChange={setNivaer} />
        <SortTabell kol={kol} rader={rader} standard={4} hoy />
        <p className="ajg-liten" style={{ marginTop: 8 }}>Hold musa over tittelen for ISSN. «Bare HH NMBU» o.l. viser tidsskriftene skolen har publisert i.</p>
      </Seksjon>
    </div>
  );
}

// ── HH NMBU-artikler ──────────────────────────────────────────────────────────
function HhSide({ d }: P) {
  const [sok, setSok] = useState('');
  const [felt, setFelt] = useState('alle');
  const [niva, setNiva] = useState('alle');
  const aarene = [...new Set(d.hh.map((a) => String(a[0])))].sort();
  const [aar, setAar] = useState<string[]>(aarene);
  const rader = useMemo(() => {
    const q = sok.trim().toLowerCase();
    return d.hh.filter((a) => aar.includes(String(a[0])) && (felt === 'alle' || a[3] === felt)
      && (niva === 'alle' || (niva === 'ajg' ? a[4] != null : niva === 'ikke' ? a[4] == null : a[4] === niva))
      && (!q || (a[1] ?? '').toLowerCase().includes(q) || (a[2] ?? '').toLowerCase().includes(q)));
  }, [d, sok, felt, niva, aar]);
  const iAjg = d.hh.filter((a) => a[4] != null);
  const kol: Kol<HhArtikkel>[] = [
    { navn: 'År', v: (a) => a[0], venstre: true },
    { navn: 'Tittel', v: (a) => a[1], venstre: true, bred: true },
    { navn: 'Tidsskrift', v: (a) => a[2], venstre: true, bred: true },
    { navn: 'AJG-fagfelt', v: (a) => (a[3] ? kortFelt(a[3]) : null), venstre: true },
    { navn: 'AJG', v: (a) => (a[4] ? NIV.indexOf(a[4]) : -1), vis: (a) => <NivaMerke n={a[4]} /> },
    { navn: 'Norsk nivå', v: (a) => a[5] },
    { navn: 'Forfattere', v: (a) => a[6] },
    { navn: 'Fra HH NMBU', v: (a) => a[7] },
  ];
  return (
    <div className="af-side af-side-bred">
      <AfHeader eyebrow="Data · intern" tittel="HH NMBU-artikler" undertittel={`Alle artikler fra Handelshøyskolen ved NMBU rapportert til NVI, ${per(d)}, med AJG-fagfelt og -nivå. Tom AJG-kolonne = tidsskriftet står ikke på AJG 2024.`} />
      <div className="af-stig" style={stig(1)}>
        <KpiStripe kpier={[
          { ikon: BookOpen, etikett: 'NVI-artikler', verdi: nf(d.hh.length), hjelp: per(d) },
          { ikon: Table2, etikett: 'I AJG-tidsskrift', verdi: nf(iAjg.length), hjelp: pst(iAjg.length / d.hh.length) },
          { ikon: BarChart3, etikett: 'Herav ECON', verdi: nf(iAjg.filter((a) => a[3] === 'ECON').length), hjelp: pst(iAjg.filter((a) => a[3] === 'ECON').length / iAjg.length) },
          { ikon: Award, etikett: 'AJG 3 eller høyere', verdi: nf(iAjg.filter((a) => ['3', '4', '4*'].includes(a[4]!)).length) },
          { ikon: TrendingUp, etikett: 'AJG 4/4*', verdi: nf(iAjg.filter((a) => ['4', '4*'].includes(a[4]!)).length) },
        ]} />
      </div>
      <Seksjon i={2} tittel={`Viser ${nf(rader.length)} artikler`} hoyre={<CsvKnapp onClick={() => lastNedCsv('hh-nmbu-artikler.csv', ['År', 'Tittel', 'Tidsskrift', 'AJG-fagfelt', 'Norsk nivå', 'Forfattere', 'Fra HH NMBU'], rader.map((a) => [a[0], a[1], a[2], a[3], a[5], a[6], a[7]]))} />}>
        <div className="ajg-filter">
          <input className="ajg-sok" type="search" placeholder="Søk i tittel eller tidsskrift" value={sok} onChange={(e) => setSok(e.target.value)} aria-label="Søk" />
          <Velg etikett="Fagfelt" verdi={felt} onChange={setFelt} valg={[{ id: 'alle', label: 'Alle fagfelt' }, ...d.felt.map((f) => ({ id: f, label: kortFelt(f) }))]} />
          <Velg etikett="AJG-nivå" verdi={niva} onChange={setNiva} valg={[{ id: 'alle', label: 'Alle' }, { id: 'ajg', label: 'I AJG' }, { id: 'ikke', label: 'Ikke i AJG' }, ...NIV.map((k) => ({ id: k, label: `AJG ${k}` }))]} />
        </div>
        <Chips etikett="År" valg={aarene.map((y) => ({ id: y, label: y }))} verdi={aar} onChange={setAar} />
        <SortTabell kol={kol} rader={rader} hoy />
        <p className="ajg-liten" style={{ marginTop: 8 }}>CSV-eksporten har ikke AJG-nivå (lisensen).</p>
      </Seksjon>
    </div>
  );
}

// ── Metode ────────────────────────────────────────────────────────────────────
function Metode({ d }: P) {
  return (
    <div className="af-side">
      <AfHeader eyebrow="Data" tittel="Metode og forbehold" undertittel="Hvordan tallene er laget, og hva de ikke kan brukes til." />
      <Seksjon i={1}>
        <div className="ajg-tekst">
          <h3>Tidsskriftlista</h3>
          <p>Chartered ABS Academic Journal Guide 2024: {nf(d.liste.n)} tidsskrift i 22 fagfelt, hentet ut 07.10.2026 fra en innlogget økt etter avtale med Chartered ABS (forlenget 14.10.2026). AJG 2024-nivåene brukes for alle år 2016–2025, slik at endringer i lista ikke gir brudd i trenden.</p>
          <h3>Samfunnsøkonomi</h3>
          <p>Samfunnsøkonomi er AJG-feltet ECON (Economics, Econometrics and Statistics). AJG plasserer hvert tidsskrift i ett felt; vi slår ikke sammen felt. Fagområdet følger tidsskriftet, ikke forfatterens institutt: en samfunnsøkonom som publiserer i et finanstidsskrift, telles som FINANCE. Vid definisjon (robusthet) tar også med BUS HIST & ECON HIST og REGIONAL STUDIES, PLANNING AND ENVIRONMENT.</p>
          <h3>Norske handelshøyskoler</h3>
          <p>Vitenskapelige artikler i NVA som er rapportert til NVI (samme grunnlag som HK-dir og DBH), koblet til AJG via ISSN og eISSN pluss en liten aliasliste for omdøpte tidsskrift. Enhetene er avgrenset som i rangeringen (BOA-sammenligning). «Norge samlet» teller hver publikasjon én gang selv om flere skoler er med. Hel telling er hovedmålet; brøk telling (forfatterandeler) er med for fordelingen.</p>
          <h3>Internasjonale skoler</h3>
          <p>OpenAlex, verk av typen article og review med forfatter fra skolen, 2016–2025 (hentet 18.10.2026), {d.intl.length} skoler. Frittstående handelshøyskoler er hele institusjonen; amerikanske fakulteter er avgrenset med universitetet og tilknytningstekst. NHH og BI målt i OpenAlex er kontroll og inngår ikke i snittene. OpenAlex og NVA er ulike kilder (OpenAlex teller alle artikler, NVA bare NVI-rapporterte), så sammenlign norske og internasjonale tall med litt forsiktighet.</p>
          <h3>Feltjustert indeks</h3>
          <p>For hvert AJG-felt og år er verdensandelen andelen av alle artikler i feltets AJG-tidsskrift (OpenAlex) som står i tidsskrift på nivå 3+ eller 4/4*. Forventet andel for en gruppe artikler er snittet av verdensandelene for artiklenes felt og år. Indeks = observert / forventet; 1 = verdenssnittet. Indeksen trengs fordi AJG har ulikt mange toppnivå-tidsskrift i ulike felt: i ECON står {pst(d.verdenFelt.ECON.a4)} av verdens artikler i 4/4*-tidsskrift.</p>
          <h3>Statistikk</h3>
          <p>Wilson-intervall (95 %) for andeler og tosidig z-test for forskjellen mellom to andeler. Artikler fra samme forfattere er ikke uavhengige, så p-verdiene er veiledende.</p>
          <h3>Forbehold</h3>
          <p>AJG er en britisk liste. Den dekker samfunnsøkonomi godt, men deler av landbruks-, miljø- og ressursøkonomien står i andre felt eller ikke på lista. Mange artikler fra norske handelshøyskoler står i tidsskrift utenfor AJG (for HH NMBU {pst(1 - d.enheter.nmbu.n / d.hh.length)} av NVI-artiklene i perioden).</p>
          <h3>Lisens</h3>
          <p>AJG-nivå per tidsskrift er lisensbelagt. Nettstedet er låst med passord, dataene er kryptert, og CSV-eksportene inneholder ikke nivå per tidsskrift. Samlede tall kan brukes i manuskriptet.</p>
          <h3>Kode</h3>
          <p className="ajg-liten">scripts/rangering/ajg_analyse.py i BOA-sammenligning lager ajg-data.json; nettstedet er kilde/src/app/components/ajg. Tallene laget {d.generert}.</p>
        </div>
      </Seksjon>
    </div>
  );
}

export const SIDER: Record<SideId, ComponentType<P>> = {
  oversikt: Oversikt, fordeling: Fordeling, utvikling: Utvikling, internasjonalt: Internasjonalt, niva: NivaSide, fagfelt: Fagfelt,
  lista: Lista, tidsskrift: TidsskriftSide, hh: HhSide, metode: Metode,
};
