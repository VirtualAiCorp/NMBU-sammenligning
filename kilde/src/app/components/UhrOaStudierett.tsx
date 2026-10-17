import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import { GraduationCap, Info, ChevronDown, ChevronRight } from '../ikoner';
import { UNIVERSITY_INFO } from '../data/courseMapping2';

/**
 * «ØA-studentene gjennom UHR-kjernen»: karakterene til kandidatene med BØA-studierett (DBH 308 per studieprogram)
 * mot alle kandidatene på de samme emnene (DBH 308 per emne), per institusjon × fagområde og år.
 * Data: public/uhr/oa-studierett.json (scripts/build-uhr-oa-studierett.py). Emnene per område er forslagene i
 * UHR-gjennomgangen 17.10.2026, med forgjengerkoder for eldre år; courseMapping2.ts brukes bare til navnene.
 */

interface Stat { n: number; s: number | null; f: number | null; g: number | null; k: number; gh?: number; x?: number; d?: number[] }
interface Par { oa: Stat | null; alle: Stat | null; sp?: number }
interface Emne extends Par { kode: string; sp: number }
interface Omr extends Par { emner: Emne[] }
interface Aar { fag: Record<string, Par>; omr: Record<string, Omr> }
interface Inst {
  program?: string; standard: boolean; merknad?: string | null; dbh?: string | null; programkoder: string[];
  aar: Record<string, Aar>; emner: Record<string, [string, number, number | null, number | null]>;
  usikre: string[]; sikkerhet: Record<string, string>;
}
interface Data { generert: string; kilde: string; aar: number[]; fag: { id: string; navn: string; omraader: string[] }[]; omraader: Record<string, string>; institusjoner: Record<string, Inst> }

type Visning = 'oa' | 'alle' | 'gap';

let last: Promise<Data | null> | null = null;
const hent = () => (last ??= fetch(`${import.meta.env.BASE_URL}uhr/oa-studierett.json`).then((r) => (r.ok ? r.json() : null)).catch(() => { last = null; return null; }));

const nf = (v: number | null | undefined, d = 1, min = 0) => (v == null ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: min, maximumFractionDigits: d }));
const fortegn = (v: number | null | undefined, d = 2) => (v == null ? '–' : `${v > 0 ? '+' : v < 0 ? '−' : '±'}${nf(Math.abs(v), d, d)}`);
const navn = (k: string) => UNIVERSITY_INFO[k]?.shortName ?? k;

const kort = { backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' };
const thead = { backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' };
const dempet = { color: 'var(--nmbu-neutral-2)' };

/** Varsel: få kandidater eller mye skjermet. */
const usikkerCelle = (s: Stat | null | undefined) => !!s && (s.n < 30 || s.k > 10);

function verdi(p: Par | undefined, v: Visning): number | null {
  if (!p) return null;
  if (v === 'gap') return p.oa?.s != null && p.alle?.s != null ? p.oa.s - p.alle.s : null;
  return p[v]?.s ?? null;
}

/** Dempet grønn/rød etter avvik fra NMBU (høyere snitt = bedre). */
function farge(d: number | null): string | undefined {
  if (d == null || Math.abs(d) < 0.05) return undefined;
  const a = Math.min(Math.abs(d) / 1.0, 1) * 0.28 + 0.04;
  return d > 0 ? `rgba(22, 163, 74, ${a.toFixed(2)})` : `rgba(220, 38, 38, ${a.toFixed(2)})`;
}

function Knapp({ aktiv, onClick, children, title }: { aktiv: boolean; onClick: () => void; children: ReactNode; title?: string }) {
  return (
    <button onClick={onClick} title={title} className="px-2.5 py-0.5 rounded-full text-xs"
      style={aktiv ? { backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', fontWeight: 600 } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' }}>
      {children}
    </button>
  );
}

function Celle({ p, v, nmbu, erNmbu }: { p?: Par; v: Visning; nmbu: number | null; erNmbu: boolean }) {
  const x = verdi(p, v);
  if (x == null) return <td className="px-2 py-1.5 text-center" style={dempet}>–</td>;
  const s = v === 'alle' ? p!.alle : p!.oa;
  const varsel = usikkerCelle(p!.oa) || (v !== 'oa' && usikkerCelle(p!.alle));
  const strykGap = p!.oa?.f != null && p!.alle?.f != null ? p!.oa.f - p!.alle.f : null;
  const tittel = [
    `ØA-studentene: snitt ${nf(p!.oa?.s, 2, 2)}, stryk ${nf(p!.oa?.f)} %, n ${nf(p!.oa?.n, 0)}, G/H ${nf(p!.oa?.g)} %, skjermet ${nf(p!.oa?.k)} %`,
    `Alle på emnet: snitt ${nf(p!.alle?.s, 2, 2)}, stryk ${nf(p!.alle?.f)} %, n ${nf(p!.alle?.n, 0)}, G/H ${nf(p!.alle?.g)} %, skjermet ${nf(p!.alle?.k)} %`,
    p!.sp ? `${nf(p!.sp)} sp i emnene som er med` : '',
    varsel ? '⚠ Færre enn 30 kandidater med A–F eller mer enn 10 % skjermet' : '',
  ].filter(Boolean).join('\n');
  return (
    <td className="px-2 py-1.5 text-center whitespace-nowrap" title={tittel}
      style={{ backgroundColor: erNmbu ? undefined : farge(nmbu == null ? null : x - nmbu) }}>
      <div style={{ fontWeight: 700, fontSize: 13 }}>{v === 'gap' ? fortegn(x) : nf(x, 2, 2)}{varsel && <span style={{ color: '#B45309' }}> ⚠</span>}</div>
      <div style={{ fontSize: 10, ...dempet }}>
        {v === 'gap' ? <>stryk {fortegn(strykGap, 1)} pp</> : <>n {nf(s?.n, 0)} · {nf(s?.f, 0)} % F</>}
      </div>
    </td>
  );
}

function Detaljer({ k, inst, aar, data }: { k: string; inst: Inst; aar: string; data: Data }) {
  const a = inst.aar[aar];
  if (!a) return <div style={{ fontSize: 12, ...dempet }}>Ingen tall for {aar}.</div>;
  const td = 'px-2 py-1 text-right whitespace-nowrap';
  return (
    <div>
      <div className="mb-2" style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)' }}>
        <b>{UNIVERSITY_INFO[k]?.name ?? k}</b> · {inst.program} · DBH-programkoder {inst.programkoder.join(', ')}
        {inst.merknad && <div className="mt-1 flex gap-1.5" style={{ fontSize: 11, ...dempet }}><Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />{inst.merknad}</div>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={thead}>
              <th className="px-2 py-1 text-left">Område / emne</th><th className={td}>Sp</th>
              <th className={td} title="Kandidater med A–F blant studentene med ØA-studierett">ØA n</th><th className={td}>ØA snitt</th><th className={td}>ØA stryk</th><th className={td} title="Skjermet andel">ØA skj.</th>
              <th className={td}>Alle n</th><th className={td}>Alle snitt</th><th className={td}>Alle stryk</th>
              <th className={td} title="ØA-kandidatenes andel av alle kandidatene på emnet">ØA-andel</th><th className={td} title="Snitt ØA − snitt alle">Gap</th>
              <th className="px-2 py-1 text-left" title="ØA-studentenes fordeling A–F">Fordeling ØA (A–F)</th>
            </tr>
          </thead>
          <tbody>
            {data.fag.filter((f) => f.id !== 'kjerne').flatMap((f) => {
              const fp = a.fag[f.id];
              const rader = [
                <tr key={f.id} style={{ backgroundColor: 'var(--nmbu-beige-light)', borderTop: '2px solid var(--nmbu-neutral-3)' }}>
                  <td className="px-2 py-1" style={{ fontWeight: 700 }}>{f.navn}</td><td className={td}>{nf(fp?.sp)}</td>
                  <td className={td}>{nf(fp?.oa?.n, 0)}</td><td className={td} style={{ fontWeight: 700 }}>{nf(fp?.oa?.s, 2, 2)}</td><td className={td}>{nf(fp?.oa?.f)} %</td><td className={td}>{nf(fp?.oa?.k)} %</td>
                  <td className={td}>{nf(fp?.alle?.n, 0)}</td><td className={td} style={{ fontWeight: 700 }}>{nf(fp?.alle?.s, 2, 2)}</td><td className={td}>{nf(fp?.alle?.f)} %</td>
                  <td className={td}>{fp?.oa && fp.alle?.n ? `${nf((100 * fp.oa.n) / fp.alle.n, 0)} %` : '–'}</td><td className={td}>{fortegn(verdi(fp, 'gap'))}</td><td />
                </tr>,
              ];
              for (const o of f.omraader) {
                const om = a.omr[o];
                if (!om) continue;
                const sik = inst.sikkerhet[o];
                if (f.omraader.length > 1) rader.push(
                  <tr key={`${f.id}-${o}`} style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
                    <td className="px-2 py-1" style={{ fontWeight: 600, paddingLeft: 14 }}>{data.omraader[o]}{sik && <span style={{ color: '#B45309', fontWeight: 400 }}> ({sik === 'usikker' ? 'usikker kobling' : sik})</span>}</td><td />
                    <td className={td}>{nf(om.oa?.n, 0)}</td><td className={td}>{nf(om.oa?.s, 2, 2)}</td><td className={td}>{nf(om.oa?.f)} %</td><td className={td}>{nf(om.oa?.k)} %</td>
                    <td className={td}>{nf(om.alle?.n, 0)}</td><td className={td}>{nf(om.alle?.s, 2, 2)}</td><td className={td}>{nf(om.alle?.f)} %</td>
                    <td className={td}>{om.oa && om.alle?.n ? `${nf((100 * om.oa.n) / om.alle.n, 0)} %` : '–'}</td><td className={td}>{fortegn(verdi(om, 'gap'))}</td><td />
                  </tr>,
                );
                for (const e of om.emner) {
                  const m = inst.emner[e.kode];
                  rader.push(
                    <tr key={`${f.id}-${o}-${e.kode}`} style={{ borderTop: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)' }}>
                      <td className="px-2 py-1" style={{ paddingLeft: 26 }}>
                        <b>{e.kode}</b> {m?.[0]}
                        {(m?.[2] || m?.[3]) && <span style={dempet}> ({m[2] ? `fra ${m[2]}` : ''}{m[2] && m[3] ? ', ' : ''}{m[3] ? `til ${m[3]}` : ''})</span>}
                        {f.omraader.length === 1 && sik && <span style={{ color: '#B45309' }}> ({sik === 'usikker' ? 'usikker kobling' : sik})</span>}
                      </td>
                      <td className={td}>{nf(e.sp)}</td>
                      <td className={td}>{nf(e.oa?.n, 0)}{usikkerCelle(e.oa) && <span style={{ color: '#B45309' }}> ⚠</span>}</td><td className={td}>{nf(e.oa?.s, 2, 2)}</td><td className={td}>{nf(e.oa?.f)} %</td><td className={td}>{nf(e.oa?.k)} %</td>
                      <td className={td}>{nf(e.alle?.n, 0)}</td><td className={td}>{nf(e.alle?.s, 2, 2)}</td><td className={td}>{nf(e.alle?.f)} %</td>
                      <td className={td}>{e.oa && e.alle?.n ? `${nf((100 * e.oa.n) / e.alle.n, 0)} %` : '–'}</td><td className={td}>{fortegn(verdi(e, 'gap'))}</td>
                      <td className="px-2 py-1 whitespace-nowrap" style={dempet}>{e.oa?.d ? e.oa.d.join(' · ') : '–'}{e.oa?.gh ? ` · G/H ${e.oa.gh}` : ''}</td>
                    </tr>,
                  );
                }
              }
              return rader;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function UhrOaStudierett() {
  const [data, setData] = useState<Data | null | undefined>(undefined);
  useEffect(() => { let aktiv = true; hent().then((d) => { if (aktiv) setData(d); }); return () => { aktiv = false; }; }, []);
  const [visning, setVisning] = useState<Visning>('oa');
  const [aar, setAar] = useState('2025');
  const [alle, setAlle] = useState(false);
  const [aapen, setAapen] = useState<string | null>(null);

  const rader = useMemo(() => {
    if (!data) return [];
    const keys = Object.keys(data.institusjoner).filter((k) => k === 'nmbu' || alle || data.institusjoner[k].standard);
    const kj = (k: string) => verdi(data.institusjoner[k].aar[aar]?.fag.kjerne, visning) ?? -99;
    return keys.sort((a, b) => (a === 'nmbu' ? -1 : b === 'nmbu' ? 1 : kj(b) - kj(a)));
  }, [data, alle, aar, visning]);

  if (data === undefined) return <div className="rounded-xl p-5 text-sm" style={kort}>Laster ØA-studentene …</div>;
  if (!data) return null;
  const fag = data.fag;
  const nmbu = data.institusjoner.nmbu?.aar[aar];

  return (
    <div className="rounded-xl p-5" style={kort}>
      <div className="flex items-center gap-2 mb-1" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}><GraduationCap className="w-4 h-4" /> ØA-studentene gjennom UHR-kjernen</div>
      <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)', marginBottom: 8 }}>
        Karakterene til kandidatene med studierett på bachelor i økonomi og administrasjon, område for område, mot alle kandidatene på de samme emnene.
        Cellen viser studiepoengvektet snitt (A = 5 … F = 0, bare A–F), med antall kandidater (n) og strykprosent (F av A–F) i liten tekst.
        Fargen viser avviket fra NMBU i samme kolonne: grønn er bedre, rød er dårligere. «ØA-gap» er snittet for ØA-studentene minus snittet for alle på emnet; positivt betyr at ØA-studentene gjør det bedre enn resten.
        Klikk på en rad for å se områdene og emnene bak tallene.
      </div>
      <ul className="mb-3 list-disc pl-5" style={{ fontSize: 11, ...dempet }}>
        <li>Tallene teller <b>eksamener, ikke personer</b>. En student som tar emnet på nytt (gjentak), telles en gang til, og eksamensåret blander kull.</li>
        <li>Bare kandidater <b>med aktiv ØA-studierett</b> er med i «ØA-studentene». Privatister, studenter på andre program og de som har mistet studieretten, er bare med i «alle på emnet». <b>HVL Bergen</b> avviker sterkt (ØA-studentene stryker langt sjeldnere enn alle på emnene) og er merket ⚑.</li>
        <li>⚠ betyr færre enn 30 kandidater med A–F eller mer enn 10 % skjermet (DBH skjuler små celler). Etikk ved NMBU, UiT og UiT nett er usikre koblinger (bærekraftemner). «?» etter institusjonsnavnet betyr at minst ett område har en usikker kobling; hold musen over for å se hvilke.</li>
        <li>Emnene per område er forslagene i UHR-gjennomgangen 17.10.2026, med forgjengerkoder for eldre år. DBH har omtrent ett års etterslep: 2025 er siste hele år.</li>
      </ul>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span style={{ fontSize: 12, ...dempet, fontWeight: 600 }}>Vis:</span>
          <Knapp aktiv={visning === 'oa'} onClick={() => setVisning('oa')}>ØA-studentene</Knapp>
          <Knapp aktiv={visning === 'alle'} onClick={() => setVisning('alle')}>Alle på emnet</Knapp>
          <Knapp aktiv={visning === 'gap'} onClick={() => setVisning('gap')} title="Snitt for ØA-studentene minus snitt for alle på emnet">ØA-gap</Knapp>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span style={{ fontSize: 12, ...dempet, fontWeight: 600 }}>År:</span>
          {data.aar.map((y) => <Knapp key={y} aktiv={aar === String(y)} onClick={() => setAar(String(y))}>{y}</Knapp>)}
        </div>
        <label className="flex items-center gap-1.5" style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)' }}>
          <input type="checkbox" checked={alle} onChange={(e) => setAlle(e.target.checked)} /> Ta med campuser, nettstudier og mindre tilbydere
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={thead}>
              <th className="px-3 py-2 text-left whitespace-nowrap">Institusjon</th>
              {fag.map((f) => <th key={f.id} className="px-2 py-2 text-center whitespace-nowrap" style={f.id === 'kjerne' ? { borderLeft: '2px solid var(--nmbu-neutral-3)' } : undefined}>{f.navn}</th>)}
            </tr>
          </thead>
          <tbody>
            {rader.map((k) => {
              const inst = data.institusjoner[k];
              const a = inst.aar[aar];
              const erNmbu = k === 'nmbu';
              const open = aapen === k;
              return (
                <Fragment key={k}>
                  <tr onClick={() => setAapen(open ? null : k)} className="cursor-pointer"
                    style={{ borderTop: '1px solid var(--nmbu-neutral-3)', ...(erNmbu ? { backgroundColor: 'var(--nmbu-green-4)', borderBottom: '2px solid var(--nmbu-green-dark)' } : {}) }}>
                    <td className="px-3 py-1.5 whitespace-nowrap" style={erNmbu ? { fontWeight: 700, color: 'var(--nmbu-green-dark)' } : { fontWeight: 600 }}>
                      {open ? <ChevronDown className="w-3 h-3 inline" /> : <ChevronRight className="w-3 h-3 inline" />} {navn(k)}
                      {k === 'hvl' && <span title={inst.merknad ?? ''} style={{ color: '#B45309' }}> ⚑</span>}
                      {inst.usikre.length > 0 && <span title={`Usikker kobling: ${inst.usikre.map((o) => data.omraader[o]).join(', ')}`} style={dempet}> ?</span>}
                    </td>
                    {!a ? <td colSpan={fag.length} className="px-2 py-1.5" style={dempet}>{inst.merknad ?? 'Ingen tall dette året.'}</td>
                      : fag.map((f) => (
                        <Celle key={f.id} p={a.fag[f.id]} v={visning} erNmbu={erNmbu} nmbu={verdi(nmbu?.fag[f.id], visning)} />
                      ))}
                  </tr>
                  {open && (
                    <tr><td colSpan={fag.length + 1} className="px-3 py-3" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
                      <Detaljer k={k} inst={inst} aar={aar} data={data} />
                    </td></tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-2" style={{ fontSize: 11, ...dempet }}>
        Kilde: DBH/HK-dir tabell 308 (karakterer per studieprogram og per emne) og 208 (studiepoeng), hentet 22.09.2026; emnene fra UHR-gjennomgangen ({new Date(data.generert).toLocaleDateString('nb-NO')}).
        Fagområdene teller hver emnekode én gang; innføringsemnet i bedriftsøkonomi er med i bedriftsøkonomi. BI fører delvurderinger som egne emnekoder; de er vektet med studiepoengene sine.
        Sortert etter hele kjernen i valgt visning. Skript: scripts/build-uhr-oa-studierett.py.
      </div>
    </div>
  );
}
