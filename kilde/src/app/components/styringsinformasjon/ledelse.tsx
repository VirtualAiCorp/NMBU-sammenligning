/**
 * NMBUs egne åpne tall fra styresaker, årsrapport og tildelingsbrev: kilde/public/ledelse/nmbu.json (lages av et
 * eget skript). Fila er valgfri: mangler den, eller er den ugyldig, vises ikke disse delene. Seriene vises som små
 * tabeller per nivå (hele NMBU og fakultetene side om side) med trendlinje, og tekstpunktene med kildeboks.
 * «side» er fysisk PDF-side; «pdf» er relativt til kilde/public/.
 */
import { useMemo, useState } from 'react';
import { FACULTY_META } from '../../data/facultyMeta';
import { Kildeboks, type Kilde } from '../Kildeboks';
import { Hoderad, Merke, Rad, Spark, TD, TDV, TH, THV, Tabell, Undertittel, Valg, nf } from './felles';
import { useJson } from './data';

export type PunktType = 'år' | 'tertial' | 'kvartal' | 'prognose' | 'budsjett' | 'mål';
export interface LedelseKilde { id: string; tittel: string; dato?: string; url?: string; pdf?: string }
export interface LedelsePunkt { periode: string; type: PunktType; verdi: number; kilde: string; side?: number }
export interface LedelseSerie { id: string; navn: string; enhet: string; nivaa: string; punkter: LedelsePunkt[] }
export interface LedelseTekst { tittel: string; tekst: string; kilder: { kilde: string; side?: number }[] }
export interface LedelseDel { serier: LedelseSerie[]; tekst: LedelseTekst[] }
export interface LedelseData { hentet: string; kilder: LedelseKilde[]; okonomi?: LedelseDel; utdanning?: LedelseDel;
  /** Statsbudsjettet (data/nmbu/ledelse/statsbudsjett-<år>.json); formatet sjekkes i Statsbudsjett.tsx. */ statsbudsjett?: Record<string, unknown> }

const TYPER: PunktType[] = ['år', 'tertial', 'kvartal', 'prognose', 'budsjett', 'mål'];
const FAKTISK = new Set<PunktType>(['år', 'tertial', 'kvartal']);
const NIVAA_REKKE = ['NMBU', 'hh', 'realtek', 'landsam', 'mina', 'vet', 'biovit', 'kbm'];

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const tall = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null);
const side = (v: unknown) => { const n = tall(v); return n != null && n > 0 ? Math.round(n) : undefined; };
const liste = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** Leser og rydder fila; alt som ikke passer formatet, hoppes over. */
function rens(d: unknown): LedelseData | null {
  if (!d || typeof d !== 'object') return null;
  const o = d as Record<string, unknown>;
  const kilder: LedelseKilde[] = liste(o.kilder).map((k) => k as Record<string, unknown>).filter((k) => k && str(k.id))
    .map((k) => ({ id: str(k.id), tittel: str(k.tittel) || str(k.id), dato: str(k.dato) || undefined, url: str(k.url) || undefined, pdf: str(k.pdf) || undefined }));
  const del = (x: unknown): LedelseDel | undefined => {
    if (!x || typeof x !== 'object') return undefined;
    const r = x as Record<string, unknown>;
    const serier: LedelseSerie[] = liste(r.serier).map((s) => s as Record<string, unknown>).filter((s) => s && str(s.navn)).map((s, i) => ({
      id: str(s.id) || `serie-${i}`, navn: str(s.navn), enhet: str(s.enhet), nivaa: str(s.nivaa) || 'NMBU',
      punkter: liste(s.punkter).map((p) => p as Record<string, unknown>)
        .map((p) => ({ periode: str(p?.periode), type: (TYPER.includes(p?.type as PunktType) ? p.type : 'år') as PunktType, verdi: tall(p?.verdi) as number, kilde: str(p?.kilde), side: side(p?.side) }))
        .filter((p) => p.periode && p.verdi != null),
    })).filter((s) => s.punkter.length > 0);
    const tekst: LedelseTekst[] = liste(r.tekst).map((t) => t as Record<string, unknown>).filter((t) => t && (str(t.tittel) || str(t.tekst)))
      .map((t) => ({ tittel: str(t.tittel), tekst: str(t.tekst), kilder: liste(t.kilder).map((k) => k as Record<string, unknown>).filter((k) => k && str(k.kilde)).map((k) => ({ kilde: str(k.kilde), side: side(k.side) })) }));
    return serier.length || tekst.length ? { serier, tekst } : undefined;
  };
  const okonomi = del(o.okonomi), utdanning = del(o.utdanning);
  if (!okonomi && !utdanning) return null;
  const sb = o.statsbudsjett && typeof o.statsbudsjett === 'object' && typeof (o.statsbudsjett as Record<string, unknown>).aar === 'number' ? o.statsbudsjett as Record<string, unknown> : undefined;
  return { hentet: str(o.hentet), kilder, okonomi, utdanning, statsbudsjett: sb };
}

let last: Promise<LedelseData | null> | null = null;
export const hentLedelse = () => (last ??= fetch(`${import.meta.env.BASE_URL}ledelse/nmbu.json`)
  .then((r) => (r.ok ? r.text() : null))
  .then((t) => { if (!t) return null; try { return rens(JSON.parse(t)); } catch { return null; } })
  .catch(() => { last = null; return null; }));
/** undefined mens fila lastes, null når den mangler eller er ugyldig. */
export const useLedelse = () => useJson(hentLedelse);

export const nivaaNavn = (n: string) => (n === 'NMBU' ? 'Hele NMBU' : (FACULTY_META as Record<string, { shortLabel: string }>)[n]?.shortLabel ?? n);
const nivaaRang = (n: string) => { const i = NIVAA_REKKE.indexOf(n); return i < 0 ? 99 : i; };

/** Sorteringsnøkkel for perioder: «2025», «2026-T2», «2026-K1», «2026/2027» … */
function periodeNokkel(p: string): [number, number, string] {
  const m = /^(\d{4})(?:\D*([TKtk])\s*(\d))?/.exec(p);
  if (!m) return [9999, 0, p];
  const aar = Number(m[1]);
  if (!m[2]) return [aar, 13, p];
  return [aar, m[2].toUpperCase() === 'T' ? Number(m[3]) * 4 : Number(m[3]) * 3, p];
}
const sammenlign = (a: string, b: string) => { const x = periodeNokkel(a), y = periodeNokkel(b); return x[0] - y[0] || x[1] - y[1] || x[2].localeCompare(y[2], 'nb'); };

const TYPE_MERKE: Record<PunktType, string> = { år: '', tertial: '', kvartal: '', prognose: 'prognose', budsjett: 'budsjett', mål: 'mål' };

function verdiTekst(v: number, enhet: string, avvik = false) {
  const e = enhet.trim();
  const d = Number.isInteger(v) ? 0 : e !== '%' && Math.abs(v) < 10 ? 2 : 1;
  return e === '%' ? `${nf(v, d)}${avvik ? ' %-poeng' : ' %'}` : nf(v, d);
}

/** Kildene brukt i en mengde punkter/tekstpunkter, klare for Kildeboks. */
export function kilderFor(data: LedelseData, refs: { kilde: string; side?: number }[]): Kilde[] {
  const ut: Kilde[] = [];
  for (const r of refs) {
    const k = data.kilder.find((x) => x.id === r.kilde);
    const navn = k?.tittel ?? r.kilde;
    const finnes = ut.find((x) => x.navn === navn);
    if (finnes) { if (r.side && !finnes.sider?.includes(r.side)) (finnes.sider ??= []).push(r.side); continue; }
    ut.push({ navn, dato: k?.dato, url: k?.url ?? null, pdf: k?.pdf ?? null, sider: r.side ? [r.side] : undefined });
  }
  // Nyeste dokument først
  return ut.sort((a, b) => (b.dato ?? '').localeCompare(a.dato ?? ''));
}

/** Én verdi-celle: faktiske tall først, deretter prognose, budsjett og mål med merke og avvik fra faktisk tall. */
function Celle({ pk, enhet }: { pk: LedelsePunkt[]; enhet: string }) {
  if (!pk.length) return <span style={{ color: 'var(--nmbu-neutral-2)' }}>–</span>;
  const sortert = [...pk].sort((a, b) => TYPER.indexOf(a.type) - TYPER.indexOf(b.type));
  // Avvik bare mot årstall: et tertialtall er hittil i året, mens prognosen gjelder hele året
  const faktisk = sortert.find((p) => p.type === 'år');
  return (
    <>
      {sortert.map((p, i) => (
        <div key={i} className="flex items-center justify-end gap-1">
          {TYPE_MERKE[p.type] && <Merke tone={p.type === 'mål' ? 'aksent' : 'dempet'}>{TYPE_MERKE[p.type]}</Merke>}
          <span style={{ color: FAKTISK.has(p.type) ? undefined : 'var(--nmbu-neutral-1)' }}>{verdiTekst(p.verdi, enhet)}</span>
          {faktisk && !FAKTISK.has(p.type) && (
            <span style={{ color: 'var(--nmbu-neutral-2)', fontSize: 10.5 }} title={`Faktisk tall minus ${p.type}`}>
              ({faktisk.verdi - p.verdi >= 0 ? '+' : '−'}{verdiTekst(Math.abs(faktisk.verdi - p.verdi), enhet, true)})
            </span>
          )}
        </div>
      ))}
    </>
  );
}

const faktiskeSortert = (s: LedelseSerie) => s.punkter.filter((p) => FAKTISK.has(p.type)).sort((a, b) => sammenlign(a.periode, b.periode));
const Utvikling = ({ s }: { s: LedelseSerie }) => {
  const f = faktiskeSortert(s);
  return <Spark verdier={f.map((p) => p.verdi)} tittel={f.map((p) => `${p.periode}: ${verdiTekst(p.verdi, s.enhet)}`).join(' · ')} />;
};
const enhetTekst = (e: string) => (e && e !== '%' ? e : e === '%' ? 'prosent' : '');
/** Serie-id for fakultetene samlet («fakultetene-x») hører sammen med fakultetsserien («fak-x»). */
const gruppeId = (s: LedelseSerie) => s.id.replace(/^fakultetene-/, 'fak-');
const radNavn = (s: LedelseSerie) => (s.id.startsWith('fakultetene-') ? 'Fakultetene samlet' : nivaaNavn(s.nivaa));
const MERKNAD_PLAN = 'Prognose, budsjett og mål er NMBUs egne planer og måltall; i parentes står faktisk årstall minus planen for samme år. Tertialtall er hittil i året.';

function Mer({ antall, vist, onClick }: { antall: number; vist: number; onClick: () => void }) {
  if (antall <= vist) return null;
  return (
    <button type="button" onClick={onClick} className="mt-2 text-xs px-2.5 py-1 rounded-full" style={{ border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)', fontWeight: 600 }}>
      Vis alle {antall}
    </button>
  );
}

/**
 * Seriene i én del (økonomi eller utdanning), i to visninger:
 *  - «Hele NMBU»: seriene som bare finnes for hele NMBU, samlet i én tabell (serie per rad, perioder som kolonner).
 *  - «Fakultetene»: én tabell per serie med hele NMBU og fakultetene side om side som rader.
 * Prognose, budsjett og mål merkes; faktiske tall får trendlinje. Kildene står under hver tabell.
 */
export function LedelseSerier({ data, del, standard = 'nmbu', maksPerioder = 6 }: { data: LedelseData; del: LedelseDel; standard?: 'nmbu' | 'fak'; maksPerioder?: number }) {
  const { nmbu, fak } = useMemo(() => {
    const m = new Map<string, LedelseSerie[]>();
    for (const s of del.serier) m.set(gruppeId(s), [...(m.get(gruppeId(s)) ?? []), s]);
    const grupper = [...m.values()].map((ss) => ss.sort((a, b) => Number(b.id.startsWith('fakultetene-')) - Number(a.id.startsWith('fakultetene-')) || nivaaRang(a.nivaa) - nivaaRang(b.nivaa)));
    return { nmbu: grupper.filter((g) => g.every((s) => s.nivaa === 'NMBU')).map((g) => g[0]), fak: grupper.filter((g) => g.some((s) => s.nivaa !== 'NMBU')) };
  }, [del]);
  const [fane, setFane] = useState<'nmbu' | 'fak'>(standard === 'fak' && fak.length ? 'fak' : nmbu.length ? 'nmbu' : 'fak');
  const [alleNmbu, setAlleNmbu] = useState(false);
  const [alleFak, setAlleFak] = useState(false);
  if (!nmbu.length && !fak.length) return null;
  return (
    <div className="min-w-0">
      {nmbu.length > 0 && fak.length > 0 && (
        <div className="mb-3"><Valg etikett="Nivå" verdi={fane} onChange={setFane} valg={[{ id: 'nmbu', label: `Hele NMBU (${nmbu.length})` }, { id: 'fak', label: `Fakultetene (${fak.length})` }]} /></div>
      )}
      {fane === 'nmbu' ? <NmbuTabell data={data} serier={alleNmbu ? nmbu : nmbu.slice(0, 12)} /> : (
        <div className="flex flex-col gap-5">
          {(alleFak ? fak : fak.slice(0, 4)).map((ss) => <FakTabell key={gruppeId(ss[0])} data={data} ss={ss} maksPerioder={maksPerioder} />)}
        </div>
      )}
      {fane === 'nmbu' ? <Mer antall={nmbu.length} vist={alleNmbu ? nmbu.length : 12} onClick={() => setAlleNmbu(true)} /> : <Mer antall={fak.length} vist={alleFak ? fak.length : 4} onClick={() => setAlleFak(true)} />}
    </div>
  );
}

/** Seriene for hele NMBU i én tabell. Kolonnene er periodene rundt siste faktiske år (tre år tilbake, ett fram). */
function NmbuTabell({ data, serier }: { data: LedelseData; serier: LedelseSerie[] }) {
  const alle = serier.flatMap((s) => s.punkter);
  const sisteAar = Math.max(...alle.filter((p) => FAKTISK.has(p.type)).map((p) => periodeNokkel(p.periode)[0]).filter((a) => a < 9999));
  const perioder = [...new Set(alle.map((p) => p.periode))].filter((p) => { const a = periodeNokkel(p)[0]; return a >= sisteAar - 3 && a <= sisteAar + 1; }).sort(sammenlign);
  const harPlan = alle.some((p) => !FAKTISK.has(p.type));
  return (
    <>
      <Tabell minBredde={640}>
        <Hoderad>
          <th style={THV}>Tall</th>
          {perioder.map((p) => <th key={p} style={TH}>{p}</th>)}
          <th style={TH} title="Alle faktiske tall i rekkefølge, også utenfor kolonnene">Utvikling</th>
        </Hoderad>
        <tbody>
          {serier.map((s) => {
            const utenfor = s.punkter.filter((p) => !perioder.includes(p.periode));
            return (
              <Rad key={s.id}>
                <td style={{ ...TDV, minWidth: 220 }}>
                  {s.navn}{enhetTekst(s.enhet) && <span style={{ color: 'var(--nmbu-neutral-2)' }}> · {enhetTekst(s.enhet)}</span>}
                  {utenfor.length > 0 && <span style={{ color: 'var(--nmbu-neutral-2)' }} title={utenfor.map((p) => `${p.periode} (${p.type}): ${verdiTekst(p.verdi, s.enhet)}`).join(' · ')}> · +{utenfor.length} {utenfor.length === 1 ? 'periode' : 'perioder'}</span>}
                </td>
                {perioder.map((per) => <td key={per} style={TD}><Celle pk={s.punkter.filter((p) => p.periode === per)} enhet={s.enhet} /></td>)}
                <td style={TD}><Utvikling s={s} /></td>
              </Rad>
            );
          })}
        </tbody>
      </Tabell>
      <Kildeboks maks={4} kilder={kilderFor(data, alle.map((p) => ({ kilde: p.kilde, side: p.side })))} merknad={harPlan ? MERKNAD_PLAN : undefined} className="mt-2" />
    </>
  );
}

/** Én serie med hele NMBU (eller fakultetene samlet) og fakultetene som rader. */
function FakTabell({ data, ss, maksPerioder }: { data: LedelseData; ss: LedelseSerie[]; maksPerioder: number }) {
  const forste = ss.find((s) => s.nivaa !== 'NMBU') ?? ss[0];
  const perioder = [...new Set(ss.flatMap((s) => s.punkter.map((p) => p.periode)))].sort(sammenlign);
  // Periodene der minst halvparten av radene har tall (så enkeltfakultetenes langtidsplaner ikke fortrenger resten)
  const dekket = perioder.filter((per) => ss.filter((s) => s.punkter.some((p) => p.periode === per)).length >= Math.max(1, Math.ceil(ss.length / 2)));
  const vis = (dekket.length ? dekket : perioder).slice(-maksPerioder);
  const harPlan = ss.some((s) => s.punkter.some((p) => !FAKTISK.has(p.type)));
  return (
    <div className="min-w-0">
      <Undertittel>{forste.navn}{enhetTekst(forste.enhet) && <span style={{ fontWeight: 400, color: 'var(--nmbu-neutral-2)' }}> ({enhetTekst(forste.enhet)})</span>}</Undertittel>
      <Tabell>
        <Hoderad>
          <th style={THV}>Nivå</th>
          {vis.map((p) => <th key={p} style={TH}>{p}</th>)}
          <th style={TH} title="Faktiske tall (år, tertial, kvartal) i rekkefølge">Utvikling</th>
        </Hoderad>
        <tbody>
          {ss.map((s) => (
            <Rad key={`${s.id}-${s.nivaa}`} uthev={s.nivaa === 'NMBU'}>
              <td style={TDV}>
                {radNavn(s)}
                {(() => { const u = s.punkter.filter((p) => !vis.includes(p.periode)); return u.length ? <span style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 400 }} title={u.map((p) => `${p.periode} (${p.type}): ${verdiTekst(p.verdi, s.enhet)}`).join(' · ')}> · +{u.length}</span> : null; })()}
              </td>
              {vis.map((per) => <td key={per} style={TD}><Celle pk={s.punkter.filter((p) => p.periode === per)} enhet={s.enhet} /></td>)}
              <td style={TD}><Utvikling s={s} /></td>
            </Rad>
          ))}
        </tbody>
      </Tabell>
      {perioder.length > vis.length && <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }} className="mt-1">Viser {vis.length} av {perioder.length} perioder (de siste der de fleste radene har tall); «+N» ved en rad viser resten når du holder pekeren over, og trendlinjen har alle faktiske tall.</div>}
      <Kildeboks maks={3} kilder={kilderFor(data, ss.flatMap((s) => s.punkter.map((p) => ({ kilde: p.kilde, side: p.side }))))} merknad={harPlan ? MERKNAD_PLAN : undefined} className="mt-2" />
    </div>
  );
}

/** Tekstpunktene (hovedpunkter fra styresaker og rapporter), hvert med kildeboks. */
export function LedelseTekstpunkter({ data, del, vis = 4 }: { data: LedelseData; del: LedelseDel; vis?: number }) {
  const [alle, setAlle] = useState(false);
  if (!del.tekst.length) return null;
  return (
    <div className="min-w-0">
      <ul className="grid gap-3 min-w-0" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))' }}>
        {(alle ? del.tekst : del.tekst.slice(0, vis)).map((t, i) => (
          <li key={i} className="rounded-lg p-3 min-w-0 flex flex-col" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--card)' }}>
            {t.tittel && <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-neutral)' }}>{t.tittel}</div>}
            {t.tekst && <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--nmbu-neutral-1)' }} className="mt-0.5 flex-1">{t.tekst}</p>}
            <Kildeboks maks={2} kilder={kilderFor(data, t.kilder)} className="mt-2" />
          </li>
        ))}
      </ul>
      <Mer antall={del.tekst.length} vist={alle ? del.tekst.length : vis} onClick={() => setAlle(true)} />
    </div>
  );
}

/** Dato som «27. september 2026» når den er ISO. */
export const datoTekst = (s: string) => {
  const d = /^\d{4}-\d{2}-\d{2}/.test(s) ? new Date(s.slice(0, 10)) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' }) : s;
};
