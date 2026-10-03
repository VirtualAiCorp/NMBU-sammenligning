/**
 * Sidene som er egne for arbeidsflaten: forsiden, fakultetsforsiden og rammen rundt modulene. Modulene selv
 * (facultyModuleBody i App.tsx) og NMBU-sidene gjenbrukes uendret; styles/arbeidsflate.css gir dem uttrykket.
 * Alle tall regnes ut i tall.ts fra dataene appen alt har lastet.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ArrowLeft, Building2, Command, GraduationCap, Layers, School, Search, Sparkles, TrendingUp, Users, type LucideIcon,
} from 'lucide-react';
import { useAllFacultyBases, type FacultyData } from '../../data/faculties';
import { FACULTY_META } from '../../data/facultyMeta';
import type { ShellView } from '../AppShells';
import { Forsidenotis } from '../Forsidenotis';
import { LagetAv } from '../LagetAv';
import { Matrise, lagRader } from '../Matrise';
import {
  AfHeader, Badge, Detaljkort, FaseKort, IkonRutenett, KpiStripe, Listerad, Pille, Segment, Seksjon, Statuslinje, stig, type Kpi,
} from './Byggeklosser';
import { FAKULTETER, FAKULTET_IKON, MODULGRUPPER, MODUL_TEKST, NMBU_SIDER, NMBU_STYRING, OPPRINNELIG_HH, UTEN_HH, apneKiChat, modulerFor, type AfNav } from './navigasjon';
import { NIVAA, gjennomforing, institusjoner, konkurrentProgram, nf, nmbuProgram, poenggrense, serie, sisteAar, sumMedEndring } from './tall';

const datoTekst = (iso: string | null | undefined) => {
  if (!iso) return null;
  const norsk = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(iso);
  const d = norsk ? new Date(Number(norsk[3]), Number(norsk[2]) - 1, Number(norsk[1])) : new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
};
const aarFra = (fra: number, til: string | null) => (til ? Array.from({ length: Number(til) - fra + 1 }, (_, i) => String(fra + i)) : []);

// ── Arealdiagram i Newbuilds-stil: tynn linje, gradient fra 28 % til 0 %, lite rutenett ──
function ArealGraf({ tittel, verdi, endring, punkter, fotnote, id }: { tittel: string; verdi: string; endring?: number | null; punkter: { aar: string; v: number }[]; fotnote: string; id: string }) {
  return (
    <div className="af-graf">
      <div className="af-graf-tittel">{tittel}</div>
      <div className="af-graf-verdi-rad">
        <span className="af-graf-verdi">{verdi}</span>
        {endring != null && <span className={`af-endring ${endring >= 0 ? 'af-endring-opp' : 'af-endring-ned'}`}>{endring >= 0 ? '+' : '−'}{nf(Math.abs(endring), 1)} %</span>}
      </div>
      <div className="af-graf-flate" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={punkter} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`af-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.28} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="0" />
            <XAxis dataKey="aar" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} dy={6} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={48} tickFormatter={(v: number) => nf(v)} domain={['auto', 'auto']} />
            <Tooltip formatter={(v: number) => [nf(v), 'Førstevalg']} labelFormatter={(l: string) => `Hovedopptaket ${l}`} cursor={{ strokeWidth: 1 }} />
            <Area type="monotone" dataKey="v" stroke="currentColor" strokeWidth={1.5} fill={`url(#af-grad-${id})`} dot={false} activeDot={{ r: 3, strokeWidth: 0, fill: 'currentColor' }} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="af-graf-fotnote">{fotnote}</div>
    </div>
  );
}

// ── Forsiden ──────────────────────────────────────────────────────────────────
export function AfForside({ onNavigate }: { onNavigate: AfNav }) {
  const alle = useAllFacultyBases(FAKULTETER);
  const [fane, setFane] = useState<'fakulteter' | 'matrise'>('fakulteter');
  const rader = useMemo(() => (alle && fane === 'matrise' ? lagRader(alle) : null), [alle, fane]);
  const tall = useMemo(() => {
    if (!alle) return null;
    const grupper = alle.flatMap((f) => f.admissionGroups);
    const nmbu = nmbuProgram(grupper);
    const konk = konkurrentProgram(grupper);
    const aar = sisteAar(nmbu, 'fvS');
    const pgAar = sisteAar(nmbu, 'pg_ord');
    return {
      nmbu: nmbu.length, konk: konk.length, inst: institusjoner(grupper).length, aar, pgAar,
      fv: aar ? sumMedEndring(nmbu, 'fvS', aar) : null, pl: aar ? sumMedEndring(nmbu, 'plasser', aar) : null,
      serie: serie(nmbu, 'fvS', aarFra(2021, aar)),
      perFak: new Map(alle.map((f) => [f.id, { grupper: f.admissionGroups.length, program: nmbuProgram(f.admissionGroups).length }])),
    };
  }, [alle]);

  const kpier: Kpi[] = [
    { ikon: Building2, etikett: 'Fakulteter', verdi: nf(FAKULTETER.length), hjelp: 'med egne sider' },
    { ikon: GraduationCap, etikett: 'NMBU-program', verdi: tall ? nf(tall.nmbu) : '…', hjelp: 'i sammenligningen' },
    { ikon: School, etikett: 'Konkurrerende program', verdi: tall ? nf(tall.konk) : '…', hjelp: tall ? `ved ${nf(tall.inst)} institusjoner` : undefined },
    { ikon: Users, etikett: `Førstevalg ${tall?.aar ?? ''}`.trim(), verdi: tall?.fv ? nf(tall.fv.sum) : '…', endring: tall?.fv?.endring, hjelp: 'til NMBU-programmene', tittel: 'Førstevalgssøkere i hovedopptaket (Samordna). Endringen er regnet på programmene som har tall begge årene.' },
    { ikon: Layers, etikett: `Studieplasser ${tall?.aar ?? ''}`.trim(), verdi: tall?.pl ? nf(tall.pl.sum) : '…', endring: tall?.pl?.endring, hjelp: 'NMBU-programmene i Samordna' },
  ];

  return (
    <div className="af-side">
      <AfHeader tittel="NMBU-sammenligning" undertittel="Opptak, karakterer og studiekvalitet for NMBUs fakulteter, sammenlignet med konkurrerende studieprogram"
        handlinger={<><Pille ikon={Search} onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))} title="Søk (⌘K)">Søk<kbd className="af-kbd af-kbd-inline"><Command className="w-3 h-3" />K</kbd></Pille><Pille ikon={Sparkles} onClick={apneKiChat}>Spør KI</Pille></>} />

      <div className="af-stig" style={stig(1)}><Forsidenotis /></div>

      <div className="af-stig af-status-rad" style={stig(2)}>
        <Statuslinje etikett="Datastatus" steg={[
          { tekst: `Søkertall ${tall?.aar ?? '…'}`, status: 'ferdig', hjelp: 'Samordna opptak, hovedopptaket' },
          { tekst: `Poenggrenser ${tall?.pgAar ?? '…'}`, status: 'na', hjelp: 'Hovedopptak og suppleringsopptak' },
          { tekst: 'Emnekarakterer vår 2026', status: 'kommer', hjelp: 'Synlige i DBH 15. oktober 2026, overføres deretter' },
        ]} />
      </div>

      <div className="af-stig" style={stig(3)}><KpiStripe kpier={kpier} /></div>

      <div className="af-to-kolonner">
        <div className="af-hovedkolonne">
          <Seksjon i={4} tittel="Styringsinformasjon">
            <div className="af-liste">
              {NMBU_STYRING.map((s) => <Listerad key={s.f} ikon={s.icon} tittel={s.label} meta={s.tekst} kategori="Hele NMBU" onClick={() => onNavigate(s.f)} />)}
            </div>
          </Seksjon>

          <Seksjon i={4} tittel={fane === 'fakulteter' ? 'Fakultetene' : 'Alle NMBU-program mot konkurrentene'}
            hoyre={<Segment etikett="Visning" verdi={fane} onChange={setFane} valg={[{ id: 'fakulteter', label: 'Fakulteter' }, { id: 'matrise', label: 'Programmatrise' }]} />}>
            {fane === 'fakulteter' ? (
              <div className="af-liste">
                {FAKULTETER.map((id) => {
                  const pf = tall?.perFak.get(id);
                  return (
                    <Listerad key={id} ikon={FAKULTET_IKON[id]} tittel={FACULTY_META[id].label} meta={FACULTY_META[id].subtitle}
                      kategori={pf ? `${nf(pf.grupper)} programgrupper` : FACULTY_META[id].shortLabel} onClick={() => onNavigate(id, 'landing')} />
                  );
                })}
              </div>
            ) : rader ? (
              <div className="af-innhold"><Matrise rader={rader} embedded onOpen={(fak, g) => onNavigate(fak, 'analyse', g)} /></div>
            ) : <div className="af-dempet af-tekst-liten">Laster tallene for fakultetene …</div>}
          </Seksjon>

          {tall && tall.serie.antall > 0 && (
            <Seksjon i={5}>
              <ArealGraf id="forside" tittel="Førstevalgssøkere til NMBU-programmene" verdi={nf(tall.serie.punkter[tall.serie.punkter.length - 1]?.v)}
                punkter={tall.serie.punkter}
                fotnote={`Hovedopptaket ${tall.serie.punkter[0]?.aar}–${tall.aar} · ${nf(tall.serie.antall)} program med tall alle årene · Kilde: Samordna opptak`} />
            </Seksjon>
          )}

          <Seksjon i={6} tittel="Hele NMBU">
            <div className="af-liste">
              {NMBU_SIDER.map((s) => <Listerad key={s.f} ikon={s.icon} tittel={s.label} meta={s.tekst} kategori="Hele NMBU" onClick={() => onNavigate(s.f)} />)}
            </div>
          </Seksjon>
        </div>

        <div className="af-sidekolonne af-stig" style={stig(4)}>
          <Detaljkort tittel="Om sammenligningen" badge={<Badge tone="aksent">Åpne data</Badge>}
            rader={[
              { dt: 'Omfang', dd: `${nf(FAKULTETER.length)} fakulteter${tall ? `, ${nf(tall.nmbu)} NMBU-program og ${nf(tall.konk)} konkurrerende program` : ''}` },
              { dt: 'Opptak', dd: 'Samordna opptak og HK-dir, hovedopptaket 2020–2026' },
              { dt: 'Karakterer og gjennomføring', dd: 'DBH/HK-dir' },
              { dt: 'Studiekvalitet', dd: 'Studiebarometeret' },
              { dt: 'Samfunn og marked', dd: 'SSB, Utdanningsdirektoratet og styrepapirer hos konkurrentene' },
              { dt: 'KI-chat', dd: 'Svarer bare fra kildene på nettsiden, med kildehenvisninger' },
            ]}
            bunn="Tallene hentes fra åpne kilder" />
        </div>
      </div>

      <footer className="af-bunntekst af-stig" style={stig(7)}><LagetAv /></footer>
    </div>
  );
}

// ── Fakultetsforsiden ────────────────────────────────────────────────────────
export function AfFakultet({ fac, onNavigate }: { fac: FacultyData; onNavigate: AfNav }) {
  const t = useMemo(() => {
    const g = fac.admissionGroups;
    const nmbu = nmbuProgram(g);
    const aar = sisteAar(nmbu, 'fvS');
    const steder = [...new Set(nmbu.map((e) => e.studiested).filter(Boolean))];
    return {
      nmbu, aar, steder, konk: konkurrentProgram(g).length, inst: institusjoner(g).length,
      fv: aar ? sumMedEndring(nmbu, 'fvS', aar) : null, pl: aar ? sumMedEndring(nmbu, 'plasser', aar) : null,
      serie: serie(nmbu, 'fvS', aarFra(2021, aar)),
      bachelor: g.filter((x) => x.level === 'bachelor').length, master: g.filter((x) => x.level === 'master5' || x.level === 'master2').length,
    };
  }, [fac]);
  const antallDok = fac.marketStatus.reduce((s, i) => s + i.dokumenter.length, 0);
  const sbMedTall = fac.studiebarometer.filter((e) => e.scores.helhetsvurdering != null).length;

  const kpier: Kpi[] = [
    { ikon: Layers, etikett: 'Programgrupper', verdi: nf(fac.admissionGroups.length), hjelp: [t.bachelor && `${t.bachelor} bachelor`, t.master && `${t.master} master`].filter(Boolean).join(' · ') || undefined },
    { ikon: GraduationCap, etikett: 'NMBU-program', verdi: nf(t.nmbu.length), hjelp: 'i sammenligningen' },
    { ikon: School, etikett: 'Konkurrerende program', verdi: nf(t.konk), hjelp: `ved ${nf(t.inst)} institusjoner` },
    { ikon: Users, etikett: `Førstevalg ${t.aar ?? ''}`.trim(), verdi: t.fv?.sum != null ? nf(t.fv.sum) : '–', endring: t.fv?.endring, hjelp: 'til NMBU-programmene', tittel: 'Førstevalgssøkere i hovedopptaket (Samordna). Endringen er regnet på programmene som har tall begge årene.' },
    { ikon: TrendingUp, etikett: `Studieplasser ${t.aar ?? ''}`.trim(), verdi: t.pl?.sum != null ? nf(t.pl.sum) : '–', endring: t.pl?.endring, hjelp: 'NMBU-programmene i Samordna' },
  ];

  const moduler = MODULGRUPPER.flatMap((g) => modulerFor(fac.id, g.views)).filter((m) => m.view !== 'landing');
  const punkter: { ikon: LucideIcon; tittel: string; tekst?: string; onClick: () => void }[] = moduler.map((m) => ({
    ikon: m.icon, tittel: m.label, tekst: MODUL_TEKST[m.view as Exclude<ShellView, 'landing'>], onClick: () => onNavigate(fac.id, m.view),
  }));
  if (fac.id === 'hh' && !UTEN_HH) punkter.push({ ikon: OPPRINNELIG_HH.icon, tittel: OPPRINNELIG_HH.label, tekst: OPPRINNELIG_HH.tekst, onClick: () => onNavigate('hh-figma') });

  const pgAar = t.aar ?? '2026';
  return (
    <div className="af-side">
      <AfHeader eyebrow={`${FACULTY_META[fac.id].shortLabel} · fakultet`} tittel={fac.label} undertittel={fac.subtitle}
        handlinger={<><Pille ikon={TrendingUp} primar onClick={() => onNavigate(fac.id, 'analyse')}>Åpne opptak</Pille><Pille ikon={Sparkles} onClick={apneKiChat}>Spør KI</Pille></>} />

      <div className="af-stig" style={stig(1)}><KpiStripe kpier={kpier} /></div>

      <div className="af-to-kolonner">
        <div className="af-hovedkolonne">
          <Seksjon i={2} tittel="Om sammenligningen">
            <p className="af-ingress">{fac.desc}</p>
          </Seksjon>

          {t.serie.antall > 0 && (
            <Seksjon i={3}>
              <ArealGraf id={fac.id} tittel="Førstevalgssøkere til NMBU-programmene" verdi={nf(t.serie.punkter[t.serie.punkter.length - 1]?.v)}
                punkter={t.serie.punkter}
                fotnote={`Hovedopptaket ${t.serie.punkter[0]?.aar}–${t.aar} · ${nf(t.serie.antall)} av ${nf(t.nmbu.length)} program har tall alle årene · Kilde: Samordna opptak`} />
            </Seksjon>
          )}

          <Seksjon i={4} tittel="Moduler">
            <IkonRutenett punkter={punkter} />
          </Seksjon>

          <Seksjon i={5} tittel="Programgruppene" hoyre={<span className="af-dempet af-tekst-liten">Fullført på normert tid, NMBU</span>}>
            <div className="af-faser">
              {fac.admissionGroups.map((g) => {
                const gj = gjennomforing(fac, g.id);
                const pg = poenggrense(g, pgAar);
                const n = g.entries.filter((e) => !g.nmbuIds.includes(e.id)).length;
                const andel = gj ? gj.fullfort / gj.kull : null;
                return (
                  <FaseKort key={g.id} badge={NIVAA[g.level] ?? g.level} tittel={g.label}
                    undertekst={`NMBU mot ${nf(n)} program`}
                    andel={andel}
                    andelTekst={gj ? `${nf(gj.fullfort)} av ${nf(gj.kull)} · ${nf((andel ?? 0) * 100)} %` : 'Ingen gjennomføringstall i DBH'}
                    bunntekst={[gj ? `Kull ${gj.aar}` : null, pg.v != null ? `Poenggrense ${pgAar}: ${nf(pg.v, 1)}` : pg.alle ? `${pgAar}: alle kvalifiserte` : null].filter(Boolean).join(' · ') || undefined}
                    onClick={() => onNavigate(fac.id, 'analyse', g.id)} />
                );
              })}
            </div>
          </Seksjon>
        </div>

        <div className="af-sidekolonne af-stig" style={stig(2)}>
          <Detaljkort tittel="Fakultetsdetaljer" badge={<Badge tone="aksent">{FACULTY_META[fac.id].shortLabel}</Badge>}
            rader={[
              { dt: 'Fakultet', dd: fac.label },
              { dt: 'Fagområder', dd: fac.subtitle },
              { dt: 'Studiesteder (NMBU)', dd: t.steder.join(', ') || '–' },
              { dt: 'Institusjoner i sammenligningen', dd: nf(t.inst) },
              { dt: 'Studiebarometeret', dd: fac.studiebarometer.length ? `${nf(sbMedTall)} av ${nf(fac.studiebarometer.length)} program med tall` : 'Ingen tall hentet ennå' },
              { dt: 'Styrepapirer', dd: fac.marketStatus.length ? `${nf(fac.marketStatus.length)} institusjoner · ${nf(antallDok)} dokumenter` : 'Ingen samlet inn ennå' },
              ...(fac.completionHentet ? [{ dt: 'Gjennomføring hentet', dd: datoTekst(fac.completionHentet) as ReactNode }] : []),
              ...(fac.marketStatusHentet ? [{ dt: 'Markedsstatus hentet', dd: datoTekst(fac.marketStatusHentet) as ReactNode }] : []),
            ]}
            bunn="Samordna opptak, DBH/HK-dir og Studiebarometeret" />
        </div>
      </div>
    </div>
  );
}

// ── Rammen rundt modulene og NMBU-sidene ─────────────────────────────────────
export function AfModulSide({ tittel, undertittel, eyebrow, tilbake, utenKi, children }: { tittel: string; undertittel?: string; eyebrow?: string; tilbake?: { label: string; onClick: () => void }; /** Interne sider har ingen KI-chat. */ utenKi?: boolean; children: ReactNode }) {
  return (
    <div className="af-side af-side-bred">
      <AfHeader eyebrow={eyebrow} tittel={tittel} undertittel={undertittel}
        handlinger={<>{tilbake && <Pille ikon={ArrowLeft} onClick={tilbake.onClick}>{tilbake.label}</Pille>}{!utenKi && <Pille ikon={Sparkles} onClick={apneKiChat}>Spør KI</Pille>}</>} />
      <div className="af-innhold af-stig" style={stig(1)}>{children}</div>
    </div>
  );
}

/** Innebygde sider med egen overskrift (opprinnelig HH-analyse, alle emner, oppsettlaben): bare innholdsrammen. */
export function AfInnebygd({ children }: { children: ReactNode }) {
  return <div className="af-side af-side-bred"><div className="af-innhold af-stig" style={stig(0)}>{children}</div></div>;
}
