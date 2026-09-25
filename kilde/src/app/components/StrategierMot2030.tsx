import { useEffect, useMemo, useState } from 'react';
import { Compass, ChevronDown, ChevronUp, ExternalLink, Target, Sparkles, Repeat, Lightbulb, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * «Strategier mot 2030» under markedsstatus: hva handelshøyskolene sier i strategiene sine, samlet per institusjon og
 * på tvers (går igjen, skiller seg ut, tallfestede mål). Data: public/markedsstatus/<fakultet>/strategier.json,
 * bygd av scripts/build-strategier.py fra data/<fakultet>/strategier/*.json (research 25.09.2026).
 */
interface Strategi { tittel: string; periode?: string | null; nivaa?: string; vedtatt?: string | null; url?: string | null; status?: string }
interface Satsing { tema: string; tekst: string; kilde?: number | null; side?: number | string | null }
interface Institusjon {
  id: string; navn: string; enhet: string; type?: string;
  strategier: Strategi[]; visjon?: string | null; satsinger: Satsing[]; maal: { tekst: string; kilde?: number | null }[];
  studieportefolje?: string | null; akkreditering?: string | null; saerpreg?: string | null;
  sitat?: { tekst: string; kilde?: number | null } | null; pagaende?: string | null; mangler?: string | null; hentet?: string;
}
interface Syntese {
  ingress: string;
  gaarIgjen: { tittel: string; tekst: string; inst: string[]; tema?: string }[];
  skillerSeg: { inst: string; tittel: string; tekst: string }[];
  forHH: { tittel: string; tekst: string }[];
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

function Kildelenke({ inst, i }: { inst: Institusjon; i?: number | null }) {
  const s = i != null ? inst.strategier[i] : undefined;
  if (!s) return null;
  const tekst = `${s.tittel}${s.periode ? ` (${s.periode})` : ''}`;
  return s.url
    ? <a href={s.url} target="_blank" rel="noreferrer" title={tekst} className="inline-flex items-center gap-0.5 ml-1 align-baseline" style={{ ...liten, color: 'var(--nmbu-green-dark)' }}>[{i! + 1}]</a>
    : <span title={tekst} className="ml-1" style={liten}>[{i! + 1}]</span>;
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
                  {i.maal.map((m, k) => <li key={k}>{m.tekst}<Kildelenke inst={i} i={m.kilde} /></li>)}
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
                              {satsinger.filter((x) => x.tema === t).map((x, k) => <li key={k}>{x.tekst}<Kildelenke inst={i} i={x.kilde} />{x.side ? <span style={liten}> s. {x.side}</span> : null}</li>)}
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
  );
}
