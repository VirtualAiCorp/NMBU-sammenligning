import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Compass, ChevronDown, ChevronUp, ExternalLink, Target, Sparkles, Repeat, Lightbulb, AlertTriangle, Loader2, Download, FileText, BookMarked } from 'lucide-react';

/**
 * «Strategier mot 2030» under markedsstatus: hva handelshøyskolene sier i strategiene sine, samlet per institusjon og
 * på tvers (går igjen, skiller seg ut, tallfestede mål). Data: public/markedsstatus/<fakultet>/strategier.json,
 * bygd av scripts/build-strategier.py fra data/<fakultet>/strategier/*.json (research 25.09.2026).
 * Kildeføring: hvert hovedpunkt har en kildeboks med dokumentene og sidene det bygger på. Sidetallene er fysiske
 * PDF-sider og lenker rett til siden; PDF-ene ligger også lokalt (markedsstatus/<fakultet>/strategier/) for nedlasting.
 */
interface Strategi { tittel: string; periode?: string | null; nivaa?: string; vedtatt?: string | null; url?: string | null; status?: string; pdf?: string | null }
type Side = number | string;
interface Satsing { tema: string; tekst: string; kilde?: number | null; side?: Side | null }
interface KildeRef { inst: string; kilde: number; sider?: Side[] | null }
interface Institusjon {
  id: string; navn: string; enhet: string; type?: string;
  strategier: Strategi[]; visjon?: string | null; satsinger: Satsing[]; maal: { tekst: string; kilde?: number | null; side?: Side | null }[];
  studieportefolje?: string | null; akkreditering?: string | null; saerpreg?: string | null;
  sitat?: { tekst: string; kilde?: number | null } | null; pagaende?: string | null; mangler?: string | null; hentet?: string;
}
interface Syntese {
  ingress: string;
  gaarIgjen: { tittel: string; tekst: string; inst: string[]; tema?: string; kilder?: KildeRef[] }[];
  skillerSeg: { inst: string; tittel: string; tekst: string; kilder?: KildeRef[] }[];
  forHH: { tittel: string; tekst: string; kilder?: KildeRef[] }[];
  forbehold: string;
}
interface Data { hentet: string; temaer: string[]; institusjoner: Institusjon[]; syntese: Syntese | null }

const kort: React.CSSProperties = { border: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--card)', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' };
/** Dokumenter som vises som merker på kortet (strategier og planer, ikke støttedokumenter). */
const ER_STRATEGI = /strategi|strategy|handlingsplan|action plan|langtidsplan|utviklingsplan|utviklingsavtale|aktivitetsplan/i;
const liten = { fontSize: 11, color: 'var(--nmbu-neutral-2)' } as const;

function Overskrift({ ikon: Ikon, tekst, under }: { ikon: typeof Compass; tekst: string; under?: string }) {
  return (
    <div className="mb-3">
      <h3 className="flex items-center gap-2 text-base" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif", fontWeight: 600 }}>
        <Ikon className="w-4 h-4" /> {tekst}
      </h3>
      {under && <p className="text-xs mt-0.5" style={{ color: 'var(--nmbu-neutral-2)' }}>{under}</p>}
    </div>
  );
}

/** Hvor de lokale PDF-ene ligger (markedsstatus/<fakultet>/) */
const Mappe = createContext('');
const erPdfUrl = (u?: string | null) => !!u && /\.pdf($|[?#])/i.test(u);
const forsteSide = (side?: Side | null) => { const n = parseInt(String(side ?? ''), 10); return Number.isFinite(n) && n > 0 ? n : null; };
/** Lenke til dokumentet, til riktig side når det er en PDF: lokal kopi først, ellers originalen */
function dokLenke(s: Strategi, mappe: string, side?: Side | null) {
  const n = forsteSide(side);
  if (s.pdf) return `${mappe}${s.pdf}${n ? `#page=${n}` : ''}`;
  if (!s.url) return null;
  return erPdfUrl(s.url) && n ? `${s.url.split('#')[0]}#page=${n}` : s.url;
}
const dokNavn = (s: Strategi) => `${s.tittel}${s.periode && !s.tittel.includes(s.periode) ? ` (${s.periode})` : ''}`;

function Kildelenke({ inst, i, side }: { inst: Institusjon; i?: number | null; side?: Side | null }) {
  const mappe = useContext(Mappe);
  const s = i != null ? inst.strategier[i] : undefined;
  if (!s) return null;
  const href = dokLenke(s, mappe, side);
  const tekst = `${dokNavn(s)}${side ? `, s. ${side}` : ''}`;
  const merke = `[${i! + 1}${side ? `, s. ${side}` : ''}]`;
  return href
    ? <a href={href} target="_blank" rel="noreferrer" title={`${tekst} (åpnes i ny fane)`} className="ml-1 align-baseline whitespace-nowrap hover:underline" style={{ ...liten, color: 'var(--nmbu-green-dark)' }}>{merke}</a>
    : <span title={tekst} className="ml-1 whitespace-nowrap" style={liten}>{merke}</span>;
}

/**
 * Kildeboksen under et hovedpunkt: dokumentene punktet bygger på, gruppert per dokument, med sidelenker,
 * lenke til originalen og nedlasting av PDF-en når den finnes lokalt.
 */
function Kildeboks({ refs, inst }: { refs?: KildeRef[]; inst: Institusjon[] }) {
  const mappe = useContext(Mappe);
  const [alle, setAlle] = useState(false);
  const dok = useMemo(() => {
    const m = new Map<string, { i: Institusjon; s: Strategi; sider: Side[] }>();
    for (const r of refs ?? []) {
      const i = inst.find((x) => x.id === r.inst);
      const s = i?.strategier[r.kilde];
      if (!i || !s) continue;
      const k = `${r.inst}|${r.kilde}`;
      const e = m.get(k) ?? { i, s, sider: [] };
      for (const sd of r.sider ?? []) if (!e.sider.includes(sd)) e.sider.push(sd);
      m.set(k, e);
    }
    return [...m.values()].map((e) => ({ ...e, sider: e.sider.sort((a, b) => (forsteSide(a) ?? 0) - (forsteSide(b) ?? 0)) }));
  }, [refs, inst]);
  if (!dok.length) return null;
  const vis = alle ? dok : dok.slice(0, 3);
  return (
    <div className="mt-2 rounded-lg px-2.5 py-2 strategi-kildeboks" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex items-center gap-1.5 mb-1" style={{ ...liten, fontWeight: 700, color: 'var(--nmbu-neutral-1)' }}>
        <BookMarked className="w-3 h-3" /> Kilder ({dok.length})
      </div>
      <ul className="space-y-1">
        {vis.map(({ i, s, sider }) => {
          const hovedlenke = dokLenke(s, mappe, sider[0]);
          return (
            <li key={`${i.id}-${s.tittel}`} className="flex items-start gap-1.5" style={{ fontSize: 11, lineHeight: 1.45, color: 'var(--nmbu-neutral-1)' }}>
              <FileText className="w-3 h-3 mt-0.5 shrink-0" style={{ color: 'var(--nmbu-neutral-2)' }} />
              <span className="min-w-0 flex-1">
                <b style={{ color: 'var(--nmbu-neutral)' }}>{i.navn}</b>
                {' · '}
                {hovedlenke
                  ? <a href={hovedlenke} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: 'var(--nmbu-green-dark)' }}>{dokNavn(s)}</a>
                  : <span>{dokNavn(s)}</span>}
                {sider.length > 0 && (
                  <span className="whitespace-nowrap">
                    {' · s. '}
                    {sider.map((sd, k) => {
                      const href = dokLenke(s, mappe, sd);
                      return <span key={k}>{k > 0 && ', '}{href ? <a href={href} target="_blank" rel="noreferrer" title={`Åpne side ${sd}`} className="hover:underline" style={{ color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>{sd}</a> : sd}</span>;
                    })}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 ml-2 align-middle">
                  {s.url && <a href={s.url} target="_blank" rel="noreferrer" title="Åpne originalen hos institusjonen" aria-label={`Originalen: ${dokNavn(s)}`} style={{ color: 'var(--nmbu-neutral-2)' }}><ExternalLink className="w-3 h-3" /></a>}
                  {s.pdf && <a href={`${mappe}${s.pdf}`} download title="Last ned PDF" aria-label={`Last ned PDF: ${dokNavn(s)}`} style={{ color: 'var(--nmbu-neutral-2)' }}><Download className="w-3 h-3" /></a>}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      {dok.length > 3 && (
        <button onClick={() => setAlle((a) => !a)} className="mt-1" style={{ ...liten, color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>
          {alle ? 'Vis færre' : `Vis alle ${dok.length} kilder`}
        </button>
      )}
    </div>
  );
}

export function StrategierMot2030({ fakultet }: { fakultet: string }) {
  const [data, setData] = useState<Data | null | 'feil'>(null);
  const [tema, setTema] = useState<string | null>(null);
  const [apne, setApne] = useState<Set<string>>(new Set());

  useEffect(() => {
    let aktiv = true;
    fetch(`${import.meta.env.BASE_URL}markedsstatus/${fakultet}/strategier.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Data) => { if (aktiv) setData(d); })
      .catch(() => { if (aktiv) setData('feil'); });
    return () => { aktiv = false; };
  }, [fakultet]);

  // Antall satsinger per institusjon og tema (til temaoversikten)
  const telling = useMemo(() => {
    const m = new Map<string, number>();
    if (data && data !== 'feil') data.institusjoner.forEach((i) => i.satsinger.forEach((s) => m.set(`${i.id}|${s.tema}`, (m.get(`${i.id}|${s.tema}`) ?? 0) + 1)));
    return m;
  }, [data]);

  if (data === null) return <div className="flex items-center gap-2 text-sm p-6" style={{ color: 'var(--nmbu-neutral-2)' }}><Loader2 className="w-4 h-4 animate-spin" /> Henter strategiene …</div>;
  if (data === 'feil') return <div className="rounded-xl p-6 text-sm" style={{ ...kort, color: 'var(--nmbu-neutral-2)' }}>Strategigjennomgangen er ikke tilgjengelig.</div>;

  const inst = data.institusjoner;
  const temaer = data.temaer.filter((t) => inst.some((i) => telling.get(`${i.id}|${t}`)));
  const antallInst = (t: string) => inst.filter((i) => telling.get(`${i.id}|${t}`)).length;
  const antallDok = inst.reduce((s, i) => s + i.strategier.length, 0);
  const s = data.syntese;
  const navnAv = (id: string) => inst.find((i) => i.id === id)?.navn ?? id;
  const veksle = (id: string) => setApne((a) => { const n = new Set(a); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <Mappe.Provider value={`${import.meta.env.BASE_URL}markedsstatus/${fakultet}/`}>
    <div className="space-y-6">
      {/* Innledning */}
      <div className="rounded-xl p-6" style={kort}>
        <h2 className="text-2xl mb-1 flex items-center gap-2" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
          <Compass className="w-5 h-5" /> Strategier mot 2030
        </h2>
        <p className="text-sm max-w-3xl" style={{ color: 'var(--nmbu-neutral-1)', lineHeight: 1.6 }}>
          {s?.ingress ?? 'Hva handelshøyskolene vi konkurrerer med sier i strategiene sine fram mot 2030.'}
        </p>
        <div className="flex items-center gap-4 mt-3 flex-wrap" style={liten}>
          <span>{inst.length} institusjoner</span>
          <span>{antallDok} strategidokumenter og planer</span>
          <span>Gjennomgått {data.hentet.split('-').reverse().join('.')}</span>
        </div>
      </div>

      {/* Hovedfunn */}
      {s && (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="rounded-xl p-5" style={kort}>
            <Overskrift ikon={Repeat} tekst="Går igjen" under="Trekk flere av institusjonene har til felles" />
            <ul className="space-y-3">
              {s.gaarIgjen.map((g) => (
                <li key={g.tittel}>
                  <button onClick={() => g.tema && setTema(tema === g.tema ? null : g.tema)} className="w-full text-left" title={g.tema ? `Vis satsingene om ${g.tema.toLowerCase()} under` : undefined}>
                    <div className="flex items-center justify-between gap-2 text-sm" style={{ fontWeight: 600, color: 'var(--nmbu-neutral)' }}>
                      <span>{g.tittel}</span><span className="shrink-0" style={liten}>{g.inst.length} av {inst.length}</span>
                    </div>
                    <div className="h-1.5 rounded-full mt-1 mb-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${(100 * g.inst.length) / inst.length}%`, backgroundColor: 'var(--nmbu-green)' }} />
                    </div>
                  </button>
                  <p className="text-xs" style={{ color: 'var(--nmbu-neutral-1)', lineHeight: 1.5 }}>{g.tekst}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {g.inst.map((id) => <span key={id} className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>{navnAv(id)}</span>)}
                  </div>
                  <Kildeboks refs={g.kilder} inst={inst} />
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl p-5" style={kort}>
            <Overskrift ikon={Sparkles} tekst="Skiller seg ut" under="Satsinger og særpreg bare én eller få har" />
            <ul className="space-y-3">
              {s.skillerSeg.map((x) => (
                <li key={x.tittel} className="text-xs" style={{ color: 'var(--nmbu-neutral-1)', lineHeight: 1.5 }}>
                  <div className="text-sm" style={{ fontWeight: 600, color: 'var(--nmbu-neutral)' }}>
                    <span className="px-1.5 py-0.5 rounded mr-1.5 text-[10px]" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 700 }}>{navnAv(x.inst)}</span>{x.tittel}
                  </div>
                  <p className="mt-0.5">{x.tekst}</p>
                  <Kildeboks refs={x.kilder} inst={inst} />
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl p-5" style={kort}>
            <Overskrift ikon={Lightbulb} tekst="Aktuelt for HHs handlingsplan" under="Spørsmål funnene reiser; ikke anbefalinger" />
            <ul className="space-y-3">
              {s.forHH.map((x) => (
                <li key={x.tittel} className="text-xs" style={{ color: 'var(--nmbu-neutral-1)', lineHeight: 1.5 }}>
                  <div className="text-sm" style={{ fontWeight: 600, color: 'var(--nmbu-neutral)' }}>{x.tittel}</div>
                  <p className="mt-0.5">{x.tekst}</p>
                  <Kildeboks refs={x.kilder} inst={inst} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Temaoversikt */}
      <div className="rounded-xl p-5" style={kort}>
        <Overskrift ikon={Target} tekst="Temaoversikt" under="Hvilke tema hver strategi omtaler (prikkens størrelse = antall satsinger i gjennomgangen). Viser bredde, ikke vekt. Klikk et tema for å se satsingene under." />
        <div className="overflow-x-auto">
          <table className="text-xs w-full" style={{ borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr>
                <th className="text-left py-1.5 pr-3" style={{ ...liten, fontWeight: 600 }}>Tema</th>
                {inst.map((i) => <th key={i.id} className="px-1 py-1.5 text-center" style={{ ...liten, fontWeight: 600, whiteSpace: 'nowrap' }}>{i.navn}</th>)}
                <th className="px-2 text-right" style={{ ...liten, fontWeight: 600 }}>Antall</th>
              </tr>
            </thead>
            <tbody>
              {[...temaer].sort((a, b) => antallInst(b) - antallInst(a)).map((t) => (
                <tr key={t} onClick={() => setTema(tema === t ? null : t)} className="cursor-pointer"
                  style={{ borderTop: '1px solid var(--nmbu-neutral-3)', backgroundColor: tema === t ? 'var(--nmbu-green-4)' : undefined }}>
                  <td className="py-1.5 pr-3" style={{ fontWeight: tema === t ? 700 : 500, color: 'var(--nmbu-neutral)', whiteSpace: 'nowrap' }}>{t}</td>
                  {inst.map((i) => {
                    const n = telling.get(`${i.id}|${t}`) ?? 0;
                    return (
                      <td key={i.id} className="text-center py-1.5" title={`${i.navn}: ${n} satsing${n === 1 ? '' : 'er'} om ${t.toLowerCase()}`}>
                        {n > 0 && <span className="inline-block rounded-full align-middle" style={{ width: 6 + Math.min(n, 4) * 3, height: 6 + Math.min(n, 4) * 3, backgroundColor: 'var(--nmbu-green)', opacity: 0.45 + Math.min(n, 4) * 0.13 }} />}
                      </td>
                    );
                  })}
                  <td className="text-right px-2" style={liten}>{antallInst(t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tallfestede mål */}
      {inst.some((i) => i.maal.length) && (
        <div className="rounded-xl p-5" style={kort}>
          <Overskrift ikon={Target} tekst="Tallfestede mål" under="Konkrete mål med tall og år, slik strategiene formulerer dem (parafrasert)" />
          <div className="grid gap-x-6 gap-y-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {inst.filter((i) => i.maal.length).map((i) => (
              <div key={i.id}>
                <div className="text-sm mb-1" style={{ fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>{i.navn}</div>
                <ul className="space-y-1 text-xs list-disc pl-4" style={{ color: 'var(--nmbu-neutral-1)' }}>
                  {i.maal.map((m, k) => <li key={k}>{m.tekst}<Kildelenke inst={i} i={m.kilde} side={m.side} /></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Institusjonene */}
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-sm" style={{ fontWeight: 600, color: 'var(--nmbu-green-dark)' }}>Institusjonene</span>
          <button onClick={() => setTema(null)} className="text-xs px-2.5 py-1 rounded-full"
            style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: tema ? 'var(--card)' : 'var(--nmbu-green-dark)', color: tema ? 'var(--nmbu-neutral-1)' : '#fff' }}>Alle tema</button>
          {temaer.map((t) => (
            <button key={t} onClick={() => setTema(tema === t ? null : t)} className="text-xs px-2.5 py-1 rounded-full"
              style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: tema === t ? 'var(--nmbu-green-dark)' : 'var(--card)', color: tema === t ? '#fff' : 'var(--nmbu-neutral-1)' }}>{t}</button>
          ))}
          <button onClick={() => setApne(apne.size ? new Set() : new Set(inst.map((i) => i.id)))} className="text-xs ml-auto" style={{ color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>
            {apne.size ? 'Lukk alle' : 'Åpne alle'}
          </button>
        </div>
        <div className="space-y-3">
          {inst.filter((i) => !tema || telling.get(`${i.id}|${tema}`)).map((i) => {
            const apen = apne.has(i.id) || !!tema;
            const satsinger = i.satsinger.filter((x) => !tema || x.tema === tema);
            const perTema = [...new Set(satsinger.map((x) => x.tema))];
            return (
              <div key={i.id} className="rounded-xl overflow-hidden" style={kort}>
                <button onClick={() => veksle(i.id)} className="w-full text-left px-5 py-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span style={{ fontFamily: "'Lora', serif", fontSize: 17, color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>{i.navn}</span>
                      <span style={liten}>{i.enhet}</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap mt-1.5">
                      {i.strategier.filter((x) => x.status !== 'utløpt' && ER_STRATEGI.test(x.tittel) && !/supplerende|nyhetssak|innkalling|protokoll/i.test(x.tittel)).slice(0, 4).map((x, k) => (
                        <span key={k} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: x.status === 'gjeldende' ? 'var(--nmbu-green-4)' : '#FEF3C7', color: x.status === 'gjeldende' ? 'var(--nmbu-green-dark)' : '#92400E', fontWeight: 600 }}>
                          {x.tittel.replace(/\s*\(.*?\)\s*/g, ' ').trim()}{x.periode && !x.tittel.includes(x.periode) ? ` · ${x.periode}` : ''}{x.status && x.status !== 'gjeldende' ? ` · ${x.status}` : ''}
                        </span>
                      ))}
                    </div>
                    {i.saerpreg && <p className="text-xs mt-2" style={{ color: 'var(--nmbu-neutral-1)', lineHeight: 1.55 }}>{i.saerpreg}</p>}
                  </div>
                  {apen ? <ChevronUp className="w-4 h-4 mt-1 shrink-0" style={{ color: 'var(--nmbu-neutral-2)' }} /> : <ChevronDown className="w-4 h-4 mt-1 shrink-0" style={{ color: 'var(--nmbu-neutral-2)' }} />}
                </button>
                {apen && (
                  <div className="px-5 pb-5 space-y-4 text-xs" style={{ color: 'var(--nmbu-neutral-1)', lineHeight: 1.55, borderTop: '1px solid var(--nmbu-neutral-3)' }}>
                    {!tema && i.visjon && <p className="pt-3"><b style={{ color: 'var(--nmbu-neutral)' }}>Visjon og ambisjon:</b> {i.visjon}{i.sitat && <> Strategien sier det slik: «{i.sitat.tekst}»<Kildelenke inst={i} i={i.sitat.kilde} /></>}</p>}
                    <div className={tema ? 'pt-3' : ''}>
                      <div className="mb-1.5" style={{ fontWeight: 700, color: 'var(--nmbu-neutral)' }}>Satsinger{tema ? `: ${tema}` : ''}</div>
                      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                        {perTema.map((t) => (
                          <div key={t}>
                            {!tema && <div className="text-[10px] uppercase mb-0.5" style={{ letterSpacing: '0.05em', fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{t}</div>}
                            <ul className="space-y-1 list-disc pl-4">
                              {satsinger.filter((x) => x.tema === t).map((x, k) => <li key={k}>{x.tekst}<Kildelenke inst={i} i={x.kilde} side={x.side} /></li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                    {!tema && (
                      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                        {i.studieportefolje && <p><b style={{ color: 'var(--nmbu-neutral)' }}>Studieporteføljen:</b> {i.studieportefolje}</p>}
                        {i.akkreditering && <p><b style={{ color: 'var(--nmbu-neutral)' }}>Akkreditering:</b> {i.akkreditering}</p>}
                        {i.pagaende && <p><b style={{ color: 'var(--nmbu-neutral)' }}>Pågår nå:</b> {i.pagaende}</p>}
                      </div>
                    )}
                    {!tema && (
                      <div>
                        <div className="mb-1" style={{ fontWeight: 700, color: 'var(--nmbu-neutral)' }}>Kilder</div>
                        <ol className="space-y-0.5 list-decimal pl-5">
                          {i.strategier.map((x, k) => (
                            <li key={k}>
                              {x.url ? <a href={x.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1" style={{ color: 'var(--nmbu-green-dark)' }}>{x.tittel} <ExternalLink className="w-3 h-3" /></a> : x.tittel}
                              <span style={liten}>{[x.periode, x.nivaa, x.vedtatt ? `vedtatt ${x.vedtatt}` : null, x.status].filter(Boolean).map((v) => ` · ${v}`).join('')}</span>
                              {x.pdf && <a href={`${import.meta.env.BASE_URL}markedsstatus/${fakultet}/${x.pdf}`} download className="inline-flex items-center gap-0.5 ml-2" style={{ ...liten, color: 'var(--nmbu-green-dark)', fontWeight: 600 }}><Download className="w-3 h-3" /> PDF</a>}
                            </li>
                          ))}
                        </ol>
                        {i.mangler && <p className="mt-2 flex gap-1.5" style={liten}><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /> {i.mangler}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {s?.forbehold && <p className="text-xs flex gap-1.5" style={liten}><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {s.forbehold}</p>}
    </div>
    </Mappe.Provider>
  );
}
