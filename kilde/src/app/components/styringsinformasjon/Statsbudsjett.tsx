/**
 * Statsbudsjettet for neste år på «Økonomi og drift»: regjeringens forslag (eller vedtatt budsjett) slik det treffer
 * NMBU og Handelshøyskolen. Data: blokken «statsbudsjett» i public/ledelse/nmbu.json, laget av scripts/build-ledelse.py
 * fra data/nmbu/ledelse/statsbudsjett-<år>.json. Hvert tall har kilde og fysisk PDF-side; lenkene åpner PDF-en på
 * riktig side (lokal kopi i public/ledelse/kilder/). Vurderingene er merket som våre, ikke NMBUs.
 * Skrevet for lesere ved HH som kjenner eget fakultet: HH er uthevet, og NMBU-tallene står som ramme rundt.
 */
import { useState, type ReactNode } from 'react';
import { Building2, GraduationCap, Landmark, Quote, Scale, TrendingUp } from 'lucide-react';
import { dbh, kildeLenke } from '../Kildeboks';
import type { Kpi } from '../arbeidsflate/Byggeklosser';
import { Del, Hoderad, Merke, Nokkeltall, Rad, TD, TDV, TH, THV, Tabell, Undertittel, endringPst, mill, nf, pst, AKSENT, NED, OPP } from './felles';
import { kilderFor, nivaaNavn, datoTekst, type LedelseData } from './ledelse';

// ── Formatet (alt sjekkes defensivt; mangler noe, vises bare det som finnes) ──
interface Ref { kilde: string; side?: number }
interface Post extends Ref { id: string; navn: string; verdi: number; forklaring?: string }
interface Kat extends Ref { kat: number; navn: string; enheter2025: number; endring: number; sats: number }
interface Ind extends Ref { id: string; navn: string; verdi: number; grunnlag?: string }
interface PrognoseRad { navn: string; prognose: number; forslag: number; sum?: boolean }
interface FakRad { nivaa: string; r2025?: number; r2026: number; r2027: number }
interface Fakta extends Ref { id: string; tekst: string; verdi?: number }
interface SektorRad { inst: string; saldert2026: number; forslag2027: number; resultat: number }
interface Sitat extends Ref { tittel: string; sitat: string; trykt?: number }
interface Tekst { tittel: string; tekst: string; kilder: Ref[] }
interface BehovRad { navn: string; bachelor: number; master: number; uthev?: boolean }
interface Nokkel extends Ref { navn: string; verdi: string; sammenlign?: string; kilde2?: string; side2?: number; merknad2?: string }
interface Behov {
  ingress?: string;
  akershus?: Ref & { tittel: string; merknad?: string; rader: BehovRad[]; fakta: (Ref & { tekst: string })[] };
  nokkeltall: Nokkel[]; nyanserer: { tekst: string; kilder: Ref[] }[]; stotter: { tekst: string; kilder: Ref[] }[];
  vurdering: { tittel: string; tekst: string }[];
}
interface Sb {
  aar: number; status: string; fremlagt?: string;
  nmbu: { ramme2026: Ref & { verdi: number }; forslag2027: Ref & { verdi: number }; poster: Post[] };
  resultat: { studiepoeng: Kat[]; satserKilde?: Ref; indikatorer: Ind[]; grunnlagKilde?: Ref };
  prognose: Ref & { rader: PrognoseRad[] };
  fakulteter: Ref & { kilde2025?: string; side2025?: number; rader: FakRad[] };
  hh: { studiepoeng: Record<string, number | null> & { dbh?: number }; fakta: Fakta[] };
  sektor: Ref & { resultatSide?: number; rader: SektorRad[]; privat?: { inst: string; studiepoeng: number; endring: number; merknad?: string }[]; privatKilde?: Ref };
  kompetansebudsjett: Sitat[];
  tekst: Tekst[];
  behov?: Behov;
}
const erSb = (x: unknown): x is Sb => {
  const o = x as Sb | undefined;
  return !!o && typeof o.aar === 'number' && !!o.nmbu?.poster && Array.isArray(o.resultat?.indikatorer) && Array.isArray(o.sektor?.rader);
};

const PRIS_SATS = 3.7; // KDs prisjustering for 2027 (orienteringen s. 9)
const HH = 'hh';

// ── Små byggeklosser ─────────────────────────────────────────────────────────
/** Lenke til en side i kildedokumentet: «s. 21». trykt = sidetallet som står på siden når det avviker fra PDF-siden. */
function S({ d, r, trykt, children }: { d: LedelseData; r?: Ref; trykt?: number; children?: ReactNode }) {
  if (!r) return null;
  const k = d.kilder.find((x) => x.id === r.kilde);
  const h = k ? kildeLenke({ pdf: k.pdf, url: k.url }, r.side) : null;
  const tekst = children ?? (r.side ? `s. ${trykt ?? r.side}` : 'kilde');
  const tittel = k ? `${k.tittel}${r.side ? `, ${trykt ? `trykt side ${trykt}, PDF-side ${r.side}` : `side ${r.side}`}` : ''}` : r.kilde;
  return h
    ? <a href={h} target="_blank" rel="noreferrer" title={tittel} className="hover:underline whitespace-nowrap" style={{ color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>{tekst}</a>
    : <span title={tittel}>{tekst}</span>;
}

const fortegn = (v: number, d = 1) => `${v > 0 ? '+' : v < 0 ? '−' : '±'}${nf(Math.abs(v), d)}`;

/** Horisontal stolpe som går ut fra null (negativ til venstre). maks = største absoluttverdi i gruppen. */
function Stolpe({ v, maks, uthev, tittel }: { v: number; maks: number; uthev?: boolean; tittel?: string }) {
  const b = maks > 0 ? Math.min(50, (Math.abs(v) / maks) * 50) : 0;
  const farge = v >= 0 ? (uthev ? AKSENT : 'color-mix(in srgb, var(--nmbu-green) 55%, transparent)') : (uthev ? NED : 'color-mix(in srgb, #b91c1c 50%, transparent)');
  return (
    <div className="relative w-full" style={{ height: 14 }} title={tittel} aria-hidden>
      <div className="absolute top-0 bottom-0" style={{ left: '50%', width: 1, backgroundColor: 'var(--nmbu-neutral-3)' }} />
      <div className="absolute rounded-sm" style={{ top: 2, bottom: 2, backgroundColor: farge, left: v >= 0 ? '50%' : `${50 - b}%`, width: `${b}%`, minWidth: v ? 2 : 0 }} />
    </div>
  );
}

/** Enkel liggende stolpe fra null (bare positive eller bare små negative, skala 0–maks). */
function Andel({ v, maks, uthev }: { v: number; maks: number; uthev?: boolean }) {
  const neg = v < 0;
  const b = maks > 0 ? Math.min(100, (Math.abs(v) / maks) * 100) : 0;
  return (
    <div className="relative w-full rounded-sm" style={{ height: 12, backgroundColor: 'color-mix(in srgb, var(--nmbu-neutral-3) 45%, transparent)' }} aria-hidden>
      <div className="absolute top-0 bottom-0 rounded-sm" style={{ left: 0, width: `${b}%`, minWidth: v ? 2 : 0, backgroundColor: neg ? NED : uthev ? AKSENT : 'color-mix(in srgb, var(--nmbu-green) 45%, transparent)' }} />
    </div>
  );
}

function Kort({ children, tone }: { children: ReactNode; tone?: 'hh' | 'sitat' }) {
  return (
    <div className="rounded-lg p-3 min-w-0" style={{
      border: `1px solid ${tone === 'hh' ? 'color-mix(in srgb, var(--nmbu-green) 45%, var(--nmbu-neutral-3))' : 'var(--nmbu-neutral-3)'}`,
      backgroundColor: tone === 'hh' ? 'color-mix(in srgb, var(--nmbu-green) 6%, var(--card))' : 'var(--card)',
    }}>{children}</div>
  );
}

/** Kort navn på et dokument i lister med mange kilder. */
function kortNavn(d: LedelseData, id: string) {
  const fast: Record<string, string> = {
    'prop1s-2027': 'Prop. 1 S', 'orientering-forslag-2027': 'KDs orientering', 'arsplan-2027': 'Sak 24/26', 'hkdir-2-2026': 'HK-dir 2/2026',
    'nav-bu-2026': 'Nav 2026', 'nav-bu-2026-akershus': 'Nav 2026 Akershus', 'nav-bu-2025': 'Nav 2025', 'ssb-2024-48': 'SSB 2024/48',
    'ssb-not-2025-15': 'SSB-notat 2025/15', 'nifu-ku-2025': 'NIFU 2026:8', 'nho-kb-2025': 'NHO kompetansebarometer', 'ks-agm-2025': 'KS arbeidsgivermonitor',
    'regnskap-norge-2024': 'Regnskap Norge', 'revisorforeningen-2026': 'Revisorforeningen', 'regjeringen-baerekraft-2026': 'Regjeringen 19.06.2026',
  };
  if (fast[id]) return fast[id];
  if (id.startsWith('utviklingsavtale')) return 'Utkast til utviklingsavtale';
  if (id.startsWith('hh-')) return 'HH-styret';
  return d.kilder.find((x) => x.id === id)?.tittel ?? id;
}
/** «HK-dir 2/2026 s. 41 · Nav 2025 s. 24»; Prop. 1 S vises med trykt side. */
function RefListe({ d, refs }: { d: LedelseData; refs: Ref[] }) {
  return (
    <div className="mt-1 flex flex-wrap gap-x-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
      {refs.map((r, j) => (
        <span key={j}>{kortNavn(d, r.kilde)}{' '}<S d={d} r={r} trykt={r.kilde === 'prop1s-2027' && r.side ? r.side - 2 : undefined}>{r.side ? undefined : r.kilde === 'nav-bu-2026' ? 'Excel' : 'lenke'}</S></span>
      ))}
    </div>
  );
}

const P = ({ children }: { children: ReactNode }) => <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--nmbu-neutral-1)' }}>{children}</p>;

// ── Siden ────────────────────────────────────────────────────────────────────
export function Statsbudsjett({ data, i = 2 }: { data: LedelseData; i?: number }) {
  const sb = erSb(data.statsbudsjett) ? data.statsbudsjett : null;
  if (!sb) return null;
  return (
    <>
      <Oversikt d={data} sb={sb} i={i} />
      <Handelshoyskolen d={data} sb={sb} i={i + 1} />
      <Kompetansebudsjettet d={data} sb={sb} i={i + 2} />
      {sb.behov && <BehovForOkonomi d={data} sb={sb} b={sb.behov} i={i + 3} />}
      <Sektoren d={data} sb={sb} i={i + 4} />
    </>
  );
}

const statusTekst = (sb: Sb) => (sb.status === 'forslag' ? `Regjeringens forslag${sb.fremlagt ? `, lagt fram ${datoTekst(sb.fremlagt)}` : ''}` : `Vedtatt budsjett`);

// ── 1. NMBU: fra 2026 til 2027 ───────────────────────────────────────────────
function Oversikt({ d, sb, i }: { d: LedelseData; sb: Sb; i: number }) {
  const { ramme2026: r26, forslag2027: r27, poster } = sb.nmbu;
  const pris = poster.find((p) => p.id === 'pris')?.verdi ?? 0;
  const reell = r27.verdi - r26.verdi - pris;
  const res = poster.find((p) => p.id === 'resultat')?.verdi ?? 0;
  const utenRes = reell - res;
  const sektorReell = (() => {
    const a = sb.sektor.rader.reduce((s, r) => s + r.saldert2026, 0), b = sb.sektor.rader.reduce((s, r) => s + r.forslag2027, 0);
    return (100 * (b - a * (1 + PRIS_SATS / 100))) / a;
  })();
  const resRang = [...sb.sektor.rader].sort((a, b) => b.resultat / b.saldert2026 - a.resultat / a.saldert2026).findIndex((r) => r.inst === 'NMBU') + 1;
  const maks = Math.max(...poster.map((p) => Math.abs(p.verdi)));
  const kpier: Kpi[] = [
    { ikon: Landmark, etikett: `Ramme ${sb.aar} (${sb.status})`, verdi: mill(r27.verdi, 1), endring: endringPst(r26.verdi, r27.verdi), hjelp: `${nf(r26.verdi, 1)} mill. kr i ${sb.aar - 1}` },
    { ikon: Scale, etikett: 'Utover prisjustering', verdi: `${fortegn(reell)} mill. kr`, hjelp: `${pst((100 * reell) / r26.verdi, 2)} reelt; sektoren ${pst(sektorReell, 1)}`, tittel: 'Forslag minus ramme 2026 minus prisjustering (3,7 %)' },
    { ikon: TrendingUp, etikett: 'Resultatbasert uttelling', verdi: `${fortegn(res)} mill. kr`, hjelp: `nr. ${resRang} av ${sb.sektor.rader.length} målt mot rammen`, tittel: 'Uttelling for endringen i studiepoeng, doktorgrader og fullføring fra 2024 til 2025' },
    { ikon: GraduationCap, etikett: 'Uten resultatene', verdi: `${fortegn(utenRes)} mill. kr`, hjelp: `${pst((100 * utenRes) / r26.verdi, 1)} reelt`, tittel: 'Endringen utover prisjustering hvis resultatuttellingen hadde vært null' },
  ];
  const kilde = kilderFor(d, [r27, { kilde: 'orientering-forslag-2027', side: 21 }]);
  return (
    <Del i={i} id="statsbudsjett" ikon={Landmark} tittel={`Statsbudsjettet ${sb.aar}: slik treffer det NMBU`}
      hoyre={<Merke tone="varsel" title="Tallene oppdateres etter budsjettvedtaket i Stortinget i desember">{sb.status === 'forslag' ? 'Forslag' : 'Vedtatt'}</Merke>}
      ingress={<>{statusTekst(sb)}. KDs orientering til universitetene er et foreløpig tildelingsbrev med rammen per institusjon. Tallene er i millioner kroner; lenkene åpner dokumentet på riktig side.</>}
      kilder={kilderFor(d, [r26, ...poster, sb.prognose])}
      merknad={<>Resultatbasert uttelling følger endringen i resultatene to år før budsjettåret (her 2024→2025). Lønns- og priskompensasjonen (prisjusteringen) var ikke med i NMBUs foreløpige rammer fra juni.</>}>
      <Nokkeltall kpier={kpier} kilder={kilde} merknad={`Reell endring = forslaget minus rammen for ${sb.aar - 1} og prisjusteringen på ${nf(PRIS_SATS, 1)} %.`} />

      <Undertittel>Fra {nf(r26.verdi, 1)} til {nf(r27.verdi, 1)} mill. kr</Undertittel>
      <Tabell minBredde={560}>
        <Hoderad>
          <th style={THV}>Post</th>
          <th style={{ ...TH, width: '32%' }} aria-hidden />
          <th style={TH}>Mill. kr</th>
          <th style={TH}>Kilde</th>
        </Hoderad>
        <tbody>
          <Rad><td style={TDV}>Ramme {sb.aar - 1} (saldert budsjett)</td><td style={TD} /><td style={TD}>{nf(r26.verdi, 1)}</td><td style={TD}><S d={d} r={r26} /></td></Rad>
          {poster.map((p) => (
            <Rad key={p.id} uthev={p.id === 'resultat'}>
              <td style={TDV}>
                <div>{p.navn}</div>
                {p.forklaring && <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--nmbu-neutral-2)', maxWidth: '62ch' }}>{p.forklaring}</div>}
              </td>
              <td style={TD}><Stolpe v={p.verdi} maks={maks} uthev={p.id === 'resultat'} tittel={`${p.navn}: ${fortegn(p.verdi)} mill. kr`} /></td>
              <td style={{ ...TD, color: p.verdi < 0 ? NED : OPP }}>{fortegn(p.verdi)}</td>
              <td style={TD}><S d={d} r={p} /></td>
            </Rad>
          ))}
          <Rad sum><td style={TDV}>Forslag {sb.aar}</td><td style={TD} /><td style={TD}>{nf(r27.verdi, 1)}</td><td style={TD}><S d={d} r={r27} /></td></Rad>
        </tbody>
      </Tabell>

      <Resultat d={d} sb={sb} />
      <Prognose d={d} sb={sb} />
    </Del>
  );
}

function Resultat({ d, sb }: { d: LedelseData; sb: Sb }) {
  const ind = sb.resultat.indikatorer;
  const kat = sb.resultat.studiepoeng;
  const maks = Math.max(...ind.map((x) => Math.abs(x.verdi)));
  const hh = sb.hh.studiepoeng;
  const hhEndring = hh['2025'] != null && hh['2024'] != null ? (hh['2025'] as number) - (hh['2024'] as number) : null;
  return (
    <>
      <Undertittel>Resultatbasert uttelling: {nf(ind.reduce((s, x) => s + x.verdi, 0), 1)} mill. kr</Undertittel>
      <Tabell minBredde={560}>
        <Hoderad><th style={THV}>Indikator</th><th style={THV}>Grunnlaget</th><th style={{ ...TH, width: '22%' }} aria-hidden /><th style={TH}>Mill. kr</th><th style={TH}>Kilde</th></Hoderad>
        <tbody>
          {ind.map((x) => (
            <Rad key={x.id}>
              <td style={TDV}>{x.navn}</td>
              <td style={{ ...TDV, fontSize: 11.5, color: 'var(--nmbu-neutral-1)' }}>{x.grunnlag}</td>
              <td style={TD}><Andel v={x.verdi} maks={maks} /></td>
              <td style={TD}>{fortegn(x.verdi)}</td>
              <td style={TD}><S d={d} r={x} /></td>
            </Rad>
          ))}
        </tbody>
      </Tabell>
      <div className="mt-3" />
      <Tabell minBredde={620}>
        <Hoderad>
          <th style={THV}>Studiepoeng per kategori</th><th style={TH}>Enheter 2025</th><th style={TH}>Endring</th>
          <th style={TH} title="Kroner per 60-studiepoengenhet i den resultatbaserte uttellingen">Sats (kr) <span style={{ fontWeight: 400 }}><S d={d} r={sb.resultat.satserKilde} /></span></th><th style={TH}>≈ Uttelling</th><th style={TH}>Kilde</th>
        </Hoderad>
        <tbody>
          {kat.map((k) => (
            <Rad key={k.kat} uthev={k.kat === 1}>
              <td style={TDV}><b>{k.kat}</b> {k.navn}</td>
              <td style={TD}>{nf(k.enheter2025)}</td>
              <td style={TD}>{fortegn(k.endring, 0)}</td>
              <td style={TD}>{nf(k.sats)}</td>
              <td style={TD}>{nf((k.endring * k.sats) / 1e6, 1)}</td>
              <td style={TD}><S d={d} r={k} /></td>
            </Rad>
          ))}
        </tbody>
      </Tabell>
      {hhEndring != null && (
        <div className="mt-2" style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)', lineHeight: 1.55 }}>
          <Merke>HH</Merke>{' '}Kategori 1 er der HH hører hjemme. HH økte fra {nf(hh['2024'] as number)} til {nf(hh['2025'] as number)} egenfinansierte studiepoengenheter
          ({fortegn(hhEndring, 0)}, DBH-tabell {hh.dbh ?? 900}), og NMBU samlet med {nf((hh.nmbu2025 ?? 0) - (hh.nmbu2024 ?? 0))}. DBH-tallene er ikke helt de samme som KDs indikator
          (som blant annet holder utenfor studiepoeng tatt av stipendiater), så andelene er omtrentlige.
        </div>
      )}
    </>
  );
}

function Prognose({ d, sb }: { d: LedelseData; sb: Sb }) {
  const p = sb.prognose;
  if (!p?.rader?.length) return null;
  return (
    <>
      <Undertittel>Slik traff NMBUs egen prognose fra juni</Undertittel>
      <p className="mb-2" style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)' }}>
        Universitetsstyret fikk i juni et anslag for endringen i KDs tildeling i {sb.aar} (<S d={d} r={p}>sak 24/26, s. {p.side}</S>). Forslaget ble litt bedre enn anslaget.
      </p>
      <Tabell minBredde={480}>
        <Hoderad><th style={THV}>Post</th><th style={TH}>Prognose (juni)</th><th style={TH}>Forslaget</th><th style={TH}>Avvik</th></Hoderad>
        <tbody>
          {p.rader.map((r) => {
            const avvik = r.forslag - r.prognose;
            return (
              <Rad key={r.navn} sum={r.sum}>
                <td style={TDV}>{r.navn}</td>
                <td style={TD}>{r.prognose ? fortegn(r.prognose) : <span style={{ color: 'var(--nmbu-neutral-2)' }} title="Ikke med i prognosen">–</span>}</td>
                <td style={TD}>{fortegn(r.forslag)}</td>
                <td style={{ ...TD, color: Math.abs(avvik) < 0.05 ? undefined : avvik > 0 ? OPP : NED }}>{Math.abs(avvik) < 0.05 ? '±0' : fortegn(avvik)}</td>
              </Rad>
            );
          })}
        </tbody>
      </Tabell>
    </>
  );
}

// ── 2. Handelshøyskolen ──────────────────────────────────────────────────────
function Handelshoyskolen({ d, sb, i }: { d: LedelseData; sb: Sb; i: number }) {
  const hh = sb.hh.studiepoeng;
  const f = (id: string) => sb.hh.fakta.find((x) => x.id === id);
  const uttelling = f('uttelling');
  const spInd = sb.resultat.indikatorer.find((x) => x.id === 'studiepoeng')?.verdi ?? null;
  const kat1 = sb.resultat.studiepoeng.find((k) => k.kat === 1);
  const fak = sb.fakulteter.rader;
  const hhFak = fak.find((r) => r.nivaa === HH);
  const pct = (a?: number, b?: number) => (a != null && b != null && a ? (100 * (b - a)) / a : null);
  const rader = [...fak].map((r) => ({ ...r, e27: pct(r.r2026, r.r2027) ?? 0, e26: pct(r.r2025, r.r2026) })).sort((a, b) => b.e27 - a.e27);
  const maks = Math.max(...rader.map((r) => Math.abs(r.e27)));
  const kpier: Kpi[] = [
    { ikon: GraduationCap, etikett: 'HHs studiepoeng 2025', verdi: nf(hh['2025'] as number), endring: endringPst(hh['2024'] as number, hh['2025'] as number), hjelp: `${pst((100 * ((hh['2025'] as number) - (hh['2024'] as number))) / ((hh.nmbu2025 ?? 0) - (hh.nmbu2024 ?? 1)), 0)} av NMBUs økning`, tittel: 'Egenfinansierte 60-studiepoengenheter (DBH 900, ny produksjon)' },
    { ikon: TrendingUp, etikett: 'HHs del av uttellingen', verdi: uttelling ? mill(uttelling.verdi, 1) : '–', hjelp: spInd && uttelling?.verdi ? `${pst((100 * uttelling.verdi) / spInd, 0)} av ${nf(spInd, 1)} mill. kr for studiepoeng` : undefined, tittel: 'NMBUs eget anslag (årsplan 2027, sak 24/26)' },
    { ikon: Building2, etikett: `HHs ramme ${sb.aar} (foreløpig)`, verdi: hhFak ? mill(hhFak.r2027, 1) : '–', endring: hhFak ? pct(hhFak.r2026, hhFak.r2027) : null, hjelp: hhFak ? `${nf(hhFak.r2026, 1)} i ${sb.aar - 1}, ${nf(hhFak.r2025 ?? 0, 1)} i ${sb.aar - 2}` : undefined, tittel: 'Nettoramme fra universitetsstyret, før lønns- og priskompensasjon' },
    { ikon: Scale, etikett: 'Sats, kategori 1', verdi: kat1 ? `${nf(kat1.sats)} kr` : '–', hjelp: 'per studiepoengenhet; kat. 2: 91 200 kr', tittel: 'Resultatbasert uttelling per 60-studiepoengenhet' },
  ];
  return (
    <Del i={i} id="statsbudsjett-hh" ikon={GraduationCap} tittel={`Hva betyr det for Handelshøyskolen?`}
      ingress={<>HH er fakultetet som har bidratt mest til NMBUs resultatuttelling, og som får den største økningen i de foreløpige rammene for {sb.aar}. Rammene under er universitetsstyrets fordeling fra juni, før lønns- og priskompensasjon; endelig fordeling behandles i oktober.</>}
      kilder={[...kilderFor(d, [...sb.hh.fakta, sb.fakulteter, { kilde: sb.fakulteter.kilde2025 ?? '', side: sb.fakulteter.side2025 }].filter((r) => r.kilde)), dbh(900, 'studiepoeng, ny produksjon egenfinansiert'), dbh(225, 'faglige årsverk')]}>
      <Nokkeltall kpier={kpier} kilder={[]} />

      <Undertittel>Fakultetenes rammer fra universitetsstyret</Undertittel>
      <Tabell minBredde={560}>
        <Hoderad>
          <th style={THV}>Fakultet</th><th style={TH}>{sb.aar - 2}</th><th style={TH}>{sb.aar - 1}</th><th style={TH}>{sb.aar} (forel.)</th>
          <th style={TH}>Endring {sb.aar - 2}–{sb.aar - 1}</th><th style={{ ...TH, width: '24%' }}>Endring {sb.aar - 1}–{sb.aar}</th>
        </Hoderad>
        <tbody>
          {rader.map((r) => (
            <Rad key={r.nivaa} uthev={r.nivaa === HH}>
              <td style={TDV}>{nivaaNavn(r.nivaa)}</td>
              <td style={TD}>{r.r2025 != null ? nf(r.r2025, 1) : '–'}</td>
              <td style={TD}>{nf(r.r2026, 1)}</td>
              <td style={TD}>{nf(r.r2027, 1)}</td>
              <td style={TD}>{r.e26 != null ? `${fortegn(r.e26)} %` : '–'}</td>
              <td style={TD}>
                <div className="flex items-center gap-2"><div className="flex-1 min-w-[60px]"><Stolpe v={r.e27} maks={maks} uthev={r.nivaa === HH} /></div><span style={{ minWidth: 52, textAlign: 'right' }}>{fortegn(r.e27)} %</span></div>
              </td>
            </Rad>
          ))}
        </tbody>
      </Tabell>
      <div className="mt-1" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
        Millioner kroner, nettoramme. {sb.aar - 1}–{sb.aar}: <S d={d} r={sb.fakulteter}>sak 24/26, s. {sb.fakulteter.side}</S>; {sb.aar - 2}–{sb.aar - 1}: <S d={d} r={{ kilde: sb.fakulteter.kilde2025 ?? '', side: sb.fakulteter.side2025 }}>sak 13/25, s. {sb.fakulteter.side2025}</S>.
        Prosentene er regnet av de avrundede rammene. Veterinærhøgskolens hopp i {sb.aar - 1} skyldes mest internhusleie (uten den: +2,9 %).
      </div>

      <Undertittel>Fra NMBUs og HHs egne dokumenter</Undertittel>
      <ul className="grid gap-2 min-w-0" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))' }}>
        {sb.hh.fakta.map((x) => (
          <li key={x.id}><Kort tone={x.kilde.startsWith('hh-') ? 'hh' : undefined}>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--nmbu-neutral-1)' }}>{x.tekst}</div>
            <div className="mt-1" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
              {d.kilder.find((k) => k.id === x.kilde)?.tittel ?? x.kilde}, <S d={d} r={x} />
            </div>
          </Kort></li>
        ))}
      </ul>
    </Del>
  );
}

// ── 3. Kompetansebudsjettet og vurderingene ──────────────────────────────────
function Kompetansebudsjettet({ d, sb, i }: { d: LedelseData; sb: Sb; i: number }) {
  const [alle, setAlle] = useState(false);
  const vis = alle ? sb.tekst : sb.tekst.slice(0, 4);
  return (
    <Del i={i} id="kompetansebudsjettet" ikon={Quote} tittel="Kompetansebudsjettet: signalet om økonomi og administrasjon"
      ingress={<>Prop. 1 S ({sb.aar - 1}–{sb.aar}) har for første gang et kompetansebudsjett (del III, kap. 5). Det koster ikke penger i {sb.aar}, men skal følges opp gjennom utviklingsavtalene for {sb.aar}–{sb.aar + 3}. Sitatene er på nynorsk som i proposisjonen; sidetallene er de trykte.</>}
      kilder={kilderFor(d, [...sb.kompetansebudsjett, ...sb.tekst.flatMap((t) => t.kilder)])}
      merknad="Vurderingene er våre (studierådgiverne ved HH), ikke NMBUs eller KDs, og bygger på dokumentene det lenkes til.">
      <div className="grid gap-2 min-w-0" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
        {sb.kompetansebudsjett.map((q) => (
          <figure key={q.tittel} className="rounded-lg p-3 min-w-0 m-0" style={{ borderLeft: `3px solid ${AKSENT}`, backgroundColor: 'var(--nmbu-beige-light)' }}>
            <figcaption style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--nmbu-neutral)' }}>{q.tittel}</figcaption>
            <blockquote className="mt-1" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--nmbu-neutral-1)', fontStyle: 'italic' }}>«{q.sitat}»</blockquote>
            <div className="mt-1" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
              {q.kilde === 'prop1s-2027' ? 'Prop. 1 S (2026–2027) KD' : d.kilder.find((k) => k.id === q.kilde)?.tittel ?? q.kilde}, <S d={d} r={q} trykt={q.trykt} />
            </div>
          </figure>
        ))}
      </div>

      <Undertittel>Vår vurdering for HH</Undertittel>
      <ul className="grid gap-2 min-w-0" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))' }}>
        {vis.map((t) => (
          <li key={t.tittel}><Kort>
            <div className="flex items-center gap-1.5"><Merke tone="dempet">Vurdering</Merke><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-neutral)' }}>{t.tittel}</span></div>
            <div className="mt-1"><P>{t.tekst}</P></div>
            <RefListe d={d} refs={t.kilder} />
          </Kort></li>
        ))}
      </ul>
      {sb.tekst.length > 4 && !alle && <button type="button" onClick={() => setAlle(true)} className="mt-2 hover:underline" style={{ fontSize: 12, fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>Vis alle {sb.tekst.length}</button>}
    </Del>
  );
}

// ── 4. Behovet for økonomi og administrasjon ─────────────────────────────────
const BACHELOR = 'var(--nmbu-green-dark)';
const MASTER = 'color-mix(in srgb, var(--nmbu-green) 45%, transparent)';

function Spalte({ d, tittel, tone, punkter }: { d: LedelseData; tittel: string; tone: 'opp' | 'ned'; punkter: { tekst: string; kilder: Ref[] }[] }) {
  return (
    <div className="rounded-lg p-3 min-w-0" style={{ border: '1px solid var(--nmbu-neutral-3)', borderTop: `3px solid ${tone === 'opp' ? OPP : NED}`, backgroundColor: 'var(--card)' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-neutral)' }}>{tittel}</div>
      <ul className="mt-1 grid gap-2.5">
        {punkter.map((x, j) => (
          <li key={j} className="min-w-0">
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--nmbu-neutral-1)' }}>{x.tekst}</div>
            <RefListe d={d} refs={x.kilder} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function BehovForOkonomi({ d, sb, b, i }: { d: LedelseData; sb: Sb; b: Behov; i: number }) {
  const ak = b.akershus;
  const maks = ak ? Math.max(...ak.rader.map((r) => r.bachelor + r.master)) : 0;
  const sumB = ak ? ak.rader.reduce((s, r) => s + r.bachelor, 0) : 0, sumM = ak ? ak.rader.reduce((s, r) => s + r.master, 0) : 0;
  const alleRefs: Ref[] = [
    ...(ak ? [ak, ...ak.fakta] : []),
    ...b.nokkeltall.flatMap((n) => [n, ...(n.kilde2 ? [{ kilde: n.kilde2, side: n.side2 }] : [])]),
    ...b.nyanserer.flatMap((x) => x.kilder), ...b.stotter.flatMap((x) => x.kilder),
  ];
  return (
    <Del i={i} id="behov-okonomi" ikon={Scale} tittel="Trengs økonomer? Hva kildene sier"
      ingress={b.ingress}
      kilder={kilderFor(d, alleRefs)}
      merknad="Bransjeorganisasjonene (Regnskap Norge, Revisorforeningen), NHO og KS er interesseparter; tallene deres er tatt med fordi de sier noe om arbeidsgivernes behov. Vurderingene nederst er våre.">
      {ak && (
        <>
          <Undertittel>{ak.tittel}</Undertittel>
          <div className="grid gap-x-6 gap-y-3 min-w-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' }}>
            <div className="min-w-0">
              <div className="flex gap-3 mb-1.5" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
                <span className="inline-flex items-center gap-1"><i className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: BACHELOR }} />Bachelor ({nf(sumB)})</span>
                <span className="inline-flex items-center gap-1"><i className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: MASTER }} />Master ({nf(sumM)})</span>
              </div>
              <ul className="grid gap-1" aria-label={ak.tittel}>
                {ak.rader.map((r) => (
                  <li key={r.navn} className="grid items-center gap-2 rounded px-1" style={{ gridTemplateColumns: 'minmax(0, 13em) minmax(0, 1fr) 2.6em', backgroundColor: r.uthev ? 'color-mix(in srgb, var(--nmbu-green) 12%, transparent)' : undefined }}
                    title={`${r.navn}: ${r.bachelor} bachelor, ${r.master} master`}>
                    <span style={{ fontSize: 11.5, lineHeight: 1.25, fontWeight: r.uthev ? 700 : 400, color: 'var(--nmbu-neutral)' }}>{r.navn}</span>
                    <span className="flex h-3 rounded-sm overflow-hidden" aria-hidden>
                      <span style={{ width: `${(100 * r.bachelor) / maks}%`, backgroundColor: BACHELOR }} />
                      <span style={{ width: `${(100 * r.master) / maks}%`, backgroundColor: MASTER }} />
                    </span>
                    <span style={{ fontSize: 11.5, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: r.uthev ? 700 : 400 }}>{nf(r.bachelor + r.master)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-1.5" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', lineHeight: 1.5 }}>{ak.merknad} <S d={d} r={ak}>HK-dir 2/2026, figur 3.6, s. {ak.side}</S></div>
            </div>
            <ul className="grid gap-2 content-start min-w-0">
              {ak.fakta.map((x, j) => (
                <li key={j}><Kort>
                  <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--nmbu-neutral-1)' }}>{x.tekst}</div>
                  <RefListe d={d} refs={[x]} />
                </Kort></li>
              ))}
            </ul>
          </div>
        </>
      )}

      <Undertittel>Nøkkeltall om økonomi og administrasjon</Undertittel>
      <Tabell minBredde={560}>
        <Hoderad><th style={THV}>Mål</th><th style={THV}>Tall</th><th style={THV}>Til sammenligning</th><th style={TH}>Kilde</th></Hoderad>
        <tbody>
          {b.nokkeltall.map((n) => (
            <Rad key={n.navn}>
              <td style={{ ...TDV, maxWidth: 260 }}>{n.navn}</td>
              <td style={{ ...TDV, fontWeight: 600, color: 'var(--nmbu-neutral)' }}>{n.verdi}</td>
              <td style={{ ...TDV, fontSize: 11.5, color: 'var(--nmbu-neutral-1)' }}>{n.sammenlign}</td>
              <td style={{ ...TD, whiteSpace: 'normal' }}>
                <span className="whitespace-nowrap">{kortNavn(d, n.kilde)} <S d={d} r={n} /></span>
                {n.kilde2 && <span className="block whitespace-nowrap" title={n.merknad2}>{n.kilde2 === n.kilde ? '' : `${kortNavn(d, n.kilde2)} `}<S d={d} r={{ kilde: n.kilde2, side: n.side2 }}>{n.side2 ? undefined : 'Excel'}</S></span>}
              </td>
            </Rad>
          ))}
        </tbody>
      </Tabell>

      <div className="grid gap-3 mt-4 min-w-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
        <Spalte d={d} tittel="Det som nyanserer signalet" tone="opp" punkter={b.nyanserer} />
        <Spalte d={d} tittel="Det som støtter signalet" tone="ned" punkter={b.stotter} />
      </div>

      <Undertittel>Vår vurdering for HH</Undertittel>
      <ul className="grid gap-2 min-w-0" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))' }}>
        {b.vurdering.map((v) => (
          <li key={v.tittel}><Kort tone="hh">
            <div className="flex items-center gap-1.5"><Merke tone="dempet">Vurdering</Merke><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-neutral)' }}>{v.tittel}</span></div>
            <div className="mt-1"><P>{v.tekst}</P></div>
          </Kort></li>
        ))}
      </ul>
      <div className="mt-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>Henger sammen med kompetansebudsjettet i statsbudsjettet for {sb.aar} (delen over).</div>
    </Del>
  );
}

// ── 5. Sektoren ──────────────────────────────────────────────────────────────
function Sektoren({ d, sb, i }: { d: LedelseData; sb: Sb; i: number }) {
  const [sort, setSort] = useState<'res' | 'reell'>('res');
  const rader = sb.sektor.rader.map((r) => {
    const reell = r.forslag2027 - r.saldert2026 * (1 + PRIS_SATS / 100);
    return { ...r, resPst: (100 * r.resultat) / r.saldert2026, reell, reellPst: (100 * reell) / r.saldert2026 };
  }).sort((a, b) => (sort === 'res' ? b.resPst - a.resPst : b.reellPst - a.reellPst));
  const maksRes = Math.max(...rader.map((r) => Math.abs(r.resPst)));
  const maksReell = Math.max(...rader.map((r) => Math.abs(r.reellPst)));
  const uthev = (inst: string) => inst === 'NMBU' || inst === 'NHH';
  const knapp = (id: 'res' | 'reell', tekst: string) => (
    <button type="button" onClick={() => setSort(id)} aria-pressed={sort === id} className="rounded px-2 py-0.5"
      style={{ fontSize: 11.5, fontWeight: 600, border: '1px solid var(--nmbu-neutral-3)', backgroundColor: sort === id ? 'var(--nmbu-green-dark)' : 'transparent', color: sort === id ? '#fff' : 'var(--nmbu-neutral-1)' }}>{tekst}</button>
  );
  return (
    <Del i={i} id="statsbudsjett-sektor" ikon={Building2} tittel="NMBU blant de statlige institusjonene"
      hoyre={<div className="flex gap-1" role="group" aria-label="Sorter etter">{knapp('res', 'Resultatuttelling')}{knapp('reell', 'Reell endring')}</div>}
      ingress={<>Resultatbasert uttelling og endring utover prisjustering i prosent av rammen for {sb.aar - 1}. Den reelle endringen tar med særskilte tildelinger (for eksempel bygg hos UiO, UiB og NTNU), så den sier mer om totalen enn om resultatene. NMBU og NHH er uthevet.</>}
      kilder={kilderFor(d, [sb.sektor, { kilde: sb.sektor.kilde, side: sb.sektor.resultatSide }])}
      merknad={sb.sektor.privat?.length ? <>Private høyskoler får redusert sats: {sb.sektor.privat.map((p) => `${p.inst} ${fortegn(p.studiepoeng)} mill. kr for studiepoeng (${fortegn(p.endring, 0)} enheter i kategori 1, ${p.merknad})`).join('; ')}.</> : undefined}>
      <Tabell minBredde={560}>
        <Hoderad>
          <th style={THV}>Institusjon</th><th style={TH}>Ramme {sb.aar - 1}</th><th style={TH}>Forslag {sb.aar}</th>
          <th style={{ ...TH, width: '22%' }}>Resultatuttelling</th><th style={{ ...TH, width: '22%' }}>Reell endring</th>
        </Hoderad>
        <tbody>
          {rader.map((r) => (
            <Rad key={r.inst} uthev={uthev(r.inst)}>
              <td style={TDV}>{r.inst}</td>
              <td style={TD}>{nf(r.saldert2026, 0)}</td>
              <td style={TD}>{nf(r.forslag2027, 0)}</td>
              <td style={TD}><div className="flex items-center gap-2"><div className="flex-1 min-w-[50px]"><Stolpe v={r.resPst} maks={maksRes} uthev={uthev(r.inst)} /></div><span style={{ minWidth: 48, textAlign: 'right' }} title={`${fortegn(r.resultat)} mill. kr`}>{fortegn(r.resPst, 2)} %</span></div></td>
              <td style={TD}><div className="flex items-center gap-2"><div className="flex-1 min-w-[50px]"><Stolpe v={r.reellPst} maks={maksReell} uthev={uthev(r.inst)} /></div><span style={{ minWidth: 48, textAlign: 'right' }} title={`${fortegn(r.reell)} mill. kr`}>{fortegn(r.reellPst, 2)} %</span></div></td>
            </Rad>
          ))}
        </tbody>
      </Tabell>
      <div className="mt-1" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
        Millioner kroner. Rammene: <S d={d} r={sb.sektor}>tabell 3, s. {sb.sektor.side}</S>; resultatuttellingen: <S d={d} r={{ kilde: sb.sektor.kilde, side: sb.sektor.resultatSide }}>tabell 11, s. {sb.sektor.resultatSide}</S>. Pek på prosenten for beløpet.
      </div>
    </Del>
  );
}

