import { Fragment, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Briefcase, ChevronDown, ChevronRight, Info, ExternalLink, AlertTriangle } from 'lucide-react';
import type { FacultyData } from '../data/faculties';

/**
 * Arbeidsmarkedet etter utdanning: lønn for nyutdannede (SSB 14378), ledighet og vanligste yrker (utdanning.no) og
 * sysselsetting (SSB 11930) for fagfeltet hver programgruppe utdanner til. Nasjonale tall per fagfelt, ikke per
 * institusjon. Data: public/arbeidsmarked/data.json (scripts/build-arbeidsmarked.py, kobling i data/nmbu/arbeidsmarked-kobling.json).
 */
interface Lonn { nus: string; nusNavn: string; nusNivaa: number; median: number | null; gjennomsnitt: number | null; antall: number | null; trend: Record<string, number | null> }
interface Gruppe {
  label: string; nivaa: string; grad: string; koblet: boolean; nus?: string; nusNavn?: string;
  lonn?: { aar: number; maal: string; '0-2'?: Lonn; '3-4'?: Lonn };
  ledighet?: { tittel: string; prosent: number | null; prosentNyutdannet: number | null; arbeidstakere: number | null; arbeidstakereNyutdannet: number | null; maaletidspunkt: string };
  sysselsetting?: { fagfeltNavn: string; alder: string; prosent: number | null; trend: Record<string, number | null> };
  yrker?: { navn: string; andel: number; antall: number }[];
  yrkerGrunnlag?: { type: string; kode: string; personer: number; maaletidspunkt: string };
  koblingsKvalitet?: 'presis' | 'grov'; begrunnelse?: string;
}
interface Data { hentet: string; kilder: { navn: string; url: string }[]; merknader: string[]; fakulteter: Record<string, Record<string, Gruppe>> }

let last: Promise<Data | null> | null = null;
const hent = () => (last ??= fetch(`${import.meta.env.BASE_URL}arbeidsmarked/data.json`).then((r) => (r.ok ? r.json() : null)).catch(() => { last = null; return null; }));

const kr = (v: number | null | undefined) => (v == null ? '–' : `${v.toLocaleString('nb-NO')} kr`);
const pst = (v: number | null | undefined) => (v == null ? '–' : `${v.toLocaleString('nb-NO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`);
const NIVAA: Record<string, string> = { bachelor: 'Bachelor', master2: 'Toårig master', master5: 'Femårig master', master: 'Master' };
const kort: React.CSSProperties = { backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' };

function Kobling({ k }: { k?: string }) {
  if (!k) return null;
  const presis = k === 'presis';
  return <span className="px-1.5 py-0.5 rounded text-[10px]" title={presis ? 'Programmet har egen gruppe i SSB-tallene' : 'Programmet er en liten del av et bredere fagfelt, eller tallene er fra et høyere nivå'}
    style={{ backgroundColor: presis ? 'var(--nmbu-green-4)' : '#FEF3C7', color: presis ? 'var(--nmbu-green-dark)' : '#92400E', fontWeight: 600 }}>{presis ? 'presis' : 'grov'}</span>;
}

export function FacultyArbeidsmarked({ faculty }: { faculty: FacultyData }) {
  const [data, setData] = useState<Data | null | undefined>(undefined);
  const [apen, setApen] = useState<string | null>(null);
  useEffect(() => { let aktiv = true; hent().then((d) => { if (aktiv) setData(d); }); return () => { aktiv = false; }; }, []);
  if (data === undefined) return <div className="py-16 text-center text-sm" style={{ color: 'var(--nmbu-neutral-2)' }}>Laster arbeidsmarkedstallene …</div>;
  const grupper = data?.fakulteter[faculty.id];
  if (!data || !grupper) return <div className="rounded-xl p-6 text-sm" style={{ ...kort, color: 'var(--nmbu-neutral-2)' }}>Fant ikke arbeidsmarkedstall for {faculty.shortLabel}.</div>;

  // Rekkefølge som i opptaksanalysen
  const ids = [...faculty.admissionGroups.map((g) => g.id).filter((id) => grupper[id]), ...Object.keys(grupper).filter((id) => !faculty.admissionGroups.some((g) => g.id === id))];
  const medLonn = ids.filter((id) => grupper[id].lonn?.['0-2']?.median != null);
  const hoyest = [...medLonn].sort((a, b) => (grupper[b].lonn!['0-2']!.median! - grupper[a].lonn!['0-2']!.median!))[0];
  const lonnAar = grupper[medLonn[0]]?.lonn?.aar;

  return (
    <div className="space-y-5">
      <div className="rounded-xl px-6 py-5" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          {faculty.shortLabel} · arbeidsmarkedet for fagfeltene programmene utdanner til
        </div>
        <div className="flex gap-10 flex-wrap">
          <div><div style={{ fontSize: 10, opacity: 0.65 }}>Programgrupper</div><div style={{ fontSize: 20, fontWeight: 700 }}>{ids.length}</div><div style={{ fontSize: 10, opacity: 0.7 }}>{ids.filter((id) => grupper[id].koblingsKvalitet === 'presis').length} med presis kobling</div></div>
          {hoyest && <div><div style={{ fontSize: 10, opacity: 0.65 }}>Høyest startlønn (median, 0–2 år)</div><div style={{ fontSize: 20, fontWeight: 700 }}>{kr(grupper[hoyest].lonn!['0-2']!.median)}</div><div style={{ fontSize: 10, opacity: 0.7 }}>{grupper[hoyest].label} · {lonnAar}</div></div>}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', color: '#78350F' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Tallene gjelder alle i Norge med tilsvarende utdanning (fagfelt), ikke NMBU-kandidatene særskilt, og kan derfor ikke brukes til å sammenligne NMBU med konkurrentene. De viser hvilket arbeidsmarked programmene utdanner til.</span>
      </div>

      <div className="rounded-xl overflow-hidden" style={kort}>
        <div className="px-5 pt-4 pb-2 flex items-center gap-2" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>
          <Briefcase className="w-4 h-4" /> Lønn, ledighet og yrker per programgruppe
        </div>
        <div className="px-5 pb-2" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>Månedslønn for heltidsansatte (median) {lonnAar}. Klikk på en rad for lønnsutvikling, yrker og hvordan programmet er koblet.</div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
                <th className="px-2 py-2" style={{ width: 28 }}><span className="sr-only">Vis detaljer</span></th>
                <th className="px-3 py-2 text-left">Programgruppe</th>
                <th className="px-3 py-2 text-right whitespace-nowrap" title="Median månedslønn 0–2 år etter fullført utdanning (SSB 14378)">Lønn 0–2 år</th>
                <th className="px-3 py-2 text-right whitespace-nowrap" title="Median månedslønn 3–4 år etter fullført utdanning (SSB 14378)">Lønn 3–4 år</th>
                <th className="px-3 py-2 text-right whitespace-nowrap" title="Registrert ledige blant dem som fullførte for 1–3 år siden (utdanning.no)">Ledige, nyutdannet</th>
                <th className="px-3 py-2 text-right whitespace-nowrap" title="Andel sysselsatte 25–29 år i hele fagfeltet (SSB 11930)">Sysselsatt 25–29</th>
                <th className="px-3 py-2 text-left">Vanligste yrke</th>
                <th className="px-3 py-2 text-left">Kobling</th>
              </tr>
            </thead>
            <tbody>
              {ids.map((id, i) => {
                const g = grupper[id];
                const erApen = apen === id;
                const veksle = () => setApen(erApen ? null : id);
                return (
                  <Fragment key={id}>
                    <tr onClick={veksle} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); veksle(); } }} tabIndex={0} role="button" aria-expanded={erApen}
                      className="cursor-pointer" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: erApen ? 'var(--nmbu-green-4)' : i % 2 ? 'var(--nmbu-beige-light)' : '#fff' }}>
                      <td className="px-2 py-2">{erApen ? <ChevronDown className="w-4 h-4" style={{ color: 'var(--nmbu-green)' }} /> : <ChevronRight className="w-4 h-4" style={{ color: 'var(--nmbu-neutral-2)' }} />}</td>
                      <td className="px-3 py-2"><span style={{ fontWeight: 600 }}>{g.label}</span> <span style={{ color: 'var(--nmbu-neutral-2)' }}>· {NIVAA[g.nivaa] ?? g.nivaa}</span></td>
                      <td className="px-3 py-2 text-right">{kr(g.lonn?.['0-2']?.median)}</td>
                      <td className="px-3 py-2 text-right">{kr(g.lonn?.['3-4']?.median)}</td>
                      <td className="px-3 py-2 text-right">{pst(g.ledighet?.prosentNyutdannet ?? null)}</td>
                      <td className="px-3 py-2 text-right">{pst(g.sysselsetting?.prosent ?? null)}</td>
                      <td className="px-3 py-2">{g.yrker?.[0] ? <>{g.yrker[0].navn} <span style={{ color: 'var(--nmbu-neutral-2)' }}>({pst(g.yrker[0].andel)})</span></> : '–'}</td>
                      <td className="px-3 py-2"><Kobling k={g.koblingsKvalitet} /></td>
                    </tr>
                    {erApen && <tr style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}><td colSpan={8} className="p-0"><Detaljer g={g} /></td></tr>}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <details className="rounded-lg px-4 py-3 text-xs" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <summary className="cursor-pointer flex items-center gap-2" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: 600 }}><Info className="w-3.5 h-3.5" /> Slik er tallene laget</summary>
        <ul className="list-disc pl-5 mt-2 space-y-1" style={{ lineHeight: 1.5 }}>{data.merknader.map((m) => <li key={m}>{m}</li>)}</ul>
        <div className="flex flex-wrap gap-x-3 mt-2">
          Kilder, hentet {data.hentet.slice(0, 10).split('-').reverse().join('.')}:
          {data.kilder.map((k) => <a key={k.url} href={k.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1" style={{ color: 'var(--nmbu-green-dark)' }}><ExternalLink className="w-3 h-3" /> {k.navn}</a>)}
        </div>
      </details>
    </div>
  );
}

function Detaljer({ g }: { g: Gruppe }) {
  const aar = [...new Set([...Object.keys(g.lonn?.['0-2']?.trend ?? {}), ...Object.keys(g.lonn?.['3-4']?.trend ?? {})])].sort();
  const graf = aar.map((a) => ({ aar: a, '0–2 år': g.lonn?.['0-2']?.trend[a] ?? null, '3–4 år': g.lonn?.['3-4']?.trend[a] ?? null }));
  const maks = Math.max(...(g.yrker ?? []).map((y) => y.andel), 1);
  return (
    <div className="grid gap-5 p-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', backgroundColor: 'var(--nmbu-green-light)' }}>
      <div>
        <div className="text-xs mb-2" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>Median månedslønn, heltid</div>
        {graf.length > 1 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={graf} margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="aar" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={52} tickFormatter={(v: number) => `${Math.round(v / 1000)} k`} domain={['auto', 'auto']} />
              <Tooltip formatter={(v: number) => kr(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line dataKey="0–2 år" stroke="#025C4F" strokeWidth={2} dot={{ r: 2 }} connectNulls />
              <Line dataKey="3–4 år" stroke="#46b4a0" strokeWidth={2} dot={{ r: 2 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>SSB skjuler lønnstallene for denne gruppen (for få arbeidsforhold).</p>}
        {g.lonn?.['0-2'] && <p className="text-[11px] mt-1" style={{ color: 'var(--nmbu-neutral-2)' }}>SSB-gruppe: {g.lonn['0-2'].nusNavn} (NUS {g.lonn['0-2'].nus}), {g.lonn['0-2'].antall?.toLocaleString('nb-NO') ?? '–'} arbeidsforhold 0–2 år.</p>}
      </div>
      <div>
        <div className="text-xs mb-2" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>Vanligste yrker</div>
        {g.yrker?.length ? (
          <ul className="space-y-1.5">
            {g.yrker.map((y) => (
              <li key={y.navn} className="text-xs">
                <div className="flex justify-between gap-2"><span>{y.navn}</span><span style={{ color: 'var(--nmbu-neutral-2)' }}>{pst(y.andel)}</span></div>
                <div className="h-1.5 rounded-full mt-0.5" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }}><div className="h-1.5 rounded-full" style={{ width: `${(100 * y.andel) / maks}%`, backgroundColor: 'var(--nmbu-green)' }} /></div>
              </li>
            ))}
          </ul>
        ) : <p className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen yrkestall.</p>}
        {g.yrkerGrunnlag && <p className="text-[11px] mt-2" style={{ color: 'var(--nmbu-neutral-2)' }}>Alle med utdanningen ({g.yrkerGrunnlag.personer.toLocaleString('nb-NO')} personer), utdanning.no {g.yrkerGrunnlag.maaletidspunkt.slice(0, 7)}.</p>}
      </div>
      <div className="text-xs" style={{ color: 'var(--nmbu-neutral-1)', lineHeight: 1.6 }}>
        <div className="mb-2" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>Ledighet og kobling</div>
        {g.ledighet && <p>Registrert ledige: <b>{pst(g.ledighet.prosent)}</b> av alle med utdanningen, <b>{pst(g.ledighet.prosentNyutdannet)}</b> blant dem som fullførte for 1–3 år siden ({g.ledighet.tittel.trim()}, utdanning.no {g.ledighet.maaletidspunkt.slice(0, 7)}).</p>}
        {g.sysselsetting && <p className="mt-1">Sysselsatt 25–29 år i fagfeltet {g.sysselsetting.fagfeltNavn.toLowerCase()}: <b>{pst(g.sysselsetting.prosent)}</b>.</p>}
        {g.begrunnelse && <p className="mt-2" style={{ color: 'var(--nmbu-neutral-2)' }}><Kobling k={g.koblingsKvalitet} /> {g.begrunnelse}</p>}
      </div>
    </div>
  );
}
