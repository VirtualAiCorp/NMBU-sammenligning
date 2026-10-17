import { Fragment, useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Search, ListOrdered, ExternalLink, ChevronDown, ChevronRight, X } from 'lucide-react';
import {
  FORBEHOLD, Kort, Merke, NMBU, NMBU_FARGE, ANDRE_FARGE, PRIVAT_FARGE, Valg, Velger, dato, endringFarge, fortegn, hentAggregater, hentProgram,
  hentStudiesteder, kr, nf, pst, td, tdV, th, thV, thead, useFil, type Aggregater, type Fordeling, type Oversikt, type ProgramRad, type Studiested, type Studiesteder,
} from './felles';

/**
 * Fanen «Program» på Markedet: alle Samordna-program og alle gradsprogram med bare lokalt opptak (DBH 379), med søk,
 * filtre og sortering. Klikk på en rad åpner et kort med tidsseriene og nøkkeltallene fra studieresultatene (DBH),
 * plassert mot kvartilene i samme NUS-faggruppe og nivå (aggregater.json).
 */

const SO_AAR = ['2021', '2022', '2023', '2024', '2025', '2026'];
const SR_AAR = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
const PER_SIDE = 50;
const NIVA_NAVN: Record<string, string> = { bachelor: 'Bachelor', master: 'Master', arsstudium: 'Årsstudium', profesjon: 'Profesjon', annet: 'Annet' };
const NIVA_DBH: Record<string, string> = { B3: 'bachelor', B4: 'bachelor (4-årig)', AR: 'årsstudium', M2: 'toårig master', M5: 'femårig master', ME: 'erfaringsbasert master', MX: 'erfaringsbasert master', PR: 'profesjon' };

type Sortering = 'fv' | 'endring' | 'plasser' | 'perPlass' | 'pg' | 'reg' | 'navn';
const SORT_VALG: { id: Sortering; label: string }[] = [
  { id: 'fv', label: 'Førstevalg' }, { id: 'endring', label: 'Endring fra 2021' }, { id: 'plasser', label: 'Plasser' },
  { id: 'perPlass', label: 'Førstevalg per plass' }, { id: 'pg', label: 'Poenggrense' }, { id: 'reg', label: 'Registrerte' }, { id: 'navn', label: 'Navn' },
];

interface Avledet { r: ProgramRad; aar: string; fv: number | null; fv0: number | null; endring: number | null; endringPst: number | null; plasser: number | null; perPlass: number | null; pg: number | null; reg: number | null }
function avled(r: ProgramRad): Avledet {
  const aar = r.lok ? '2025' : '2026';
  const v = r.a[aar];
  const fv = v?.[1] ?? null, fv0 = r.a['2021']?.[1] ?? null;
  const plasser = r.lok ? null : v?.[2] ?? null;
  return {
    r, aar, fv, fv0,
    endring: fv != null && fv0 != null ? fv - fv0 : null,
    endringPst: fv != null && fv0 ? (100 * (fv - fv0)) / fv0 : null,
    plasser, perPlass: fv != null && plasser ? fv / plasser : null,
    pg: r.lok ? null : v?.[5] ?? null,
    reg: r.sr?.reg[SR_AAR.length - 1] ?? null,
  };
}

export function MarkedProgram({ data, ff, setFf }: { data: Oversikt; ff: string; setFf: (f: string) => void }) {
  const [rader, setRader] = useState<ProgramRad[] | undefined>(undefined);
  useEffect(() => {
    let aktiv = true;
    setRader(undefined);
    const felt = ff === 'alle' ? data.fagfelt.filter((f) => data.antall[f.id]).map((f) => f.id) : [ff];
    Promise.all(felt.map(hentProgram)).then((d) => { if (aktiv) setRader(d.flat()); });
    return () => { aktiv = false; };
  }, [ff, data]);
  const agg = useFil<Aggregater>(hentAggregater);
  const steder = useFil<Studiesteder>(hentStudiesteder);
  const sted = useMemo(() => new Map((steder?.steder ?? []).map((s) => [s.id, s])), [steder]);

  const [sok, setSok] = useState('');
  const [inst, setInst] = useState('alle');
  const [niv, setNiv] = useState('alle');
  const [form, setForm] = useState('alle');
  const [opptak, setOpptak] = useState('alle');
  const [fylke, setFylke] = useState('alle');
  const [stedNavn, setStedNavn] = useState('alle');
  const [nedlagte, setNedlagte] = useState(false);
  const [sort, setSort] = useState<Sortering>('fv');
  const [side, setSide] = useState(0);
  const [apen, setApen] = useState<string | null>(null);
  useEffect(() => { setSide(0); }, [sok, inst, niv, form, opptak, nedlagte, sort, ff, fylke, stedNavn]);
  useEffect(() => { setStedNavn('alle'); }, [fylke]);
  // Studiestedsfilteret: fylke og stedsnavn fra studiesteder.json (programmets `ss`), nett og utland for seg
  const NETT = '__nett', UTLAND = '__utland';
  const fylker = useMemo(() => [...new Set((steder?.steder ?? []).filter((s) => s.t === 's' && s.f).map((s) => s.f as string))].sort((a, b) => a.localeCompare(b, 'nb')), [steder]);
  const stedsnavn = useMemo(() => [...new Set((steder?.steder ?? []).filter((s) => s.t === 's' && (fylke === 'alle' || s.f === fylke)).map((s) => s.n))].sort((a, b) => a.localeCompare(b, 'nb')), [steder, fylke]);
  const passerSted = (r: ProgramRad) => {
    if (fylke === 'alle' && stedNavn === 'alle') return true;
    const ss = (r.ss ?? []).map((id) => sted.get(id)).filter((s): s is Studiested => s != null);
    if (fylke === NETT) return ss.some((s) => s.t === 'n');
    if (fylke === UTLAND) return ss.some((s) => s.t === 'u');
    return ss.some((s) => s.t === 's' && (fylke === 'alle' || s.f === fylke) && (stedNavn === 'alle' || s.n === stedNavn));
  };
  const stederTekst = (r: ProgramRad) => {
    const ss = (r.ss ?? []).map((id) => sted.get(id)).filter((s): s is Studiested => s != null).map((s) => (s.t === 'n' ? 'nett' : s.n));
    return ss.length > 3 ? `${ss.slice(0, 3).join(', ')} +${ss.length - 3}` : ss.join(', ');
  };

  const instNavn = (k: string) => data.inst[k]?.k ?? k;
  const avledet = useMemo(() => (rader ?? []).map(avled), [rader]);
  const instValg = useMemo(() => [...new Set(avledet.map((a) => a.r.i))].sort((a, b) => instNavn(a).localeCompare(instNavn(b), 'nb')), [avledet]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtrert = useMemo(() => {
    const q = sok.trim().toLowerCase();
    const ut = avledet.filter(({ r }) => {
      if (!nedlagte && (r.status === 'nedlagt' || r.status === 'avlyst')) return false;
      if (inst !== 'alle' && r.i !== inst) return false;
      if (niv !== 'alle' && r.niv !== niv) return false;
      if (opptak === 'samordna' && r.lok) return false;
      if (opptak === 'lokalt' && !r.lok) return false;
      if (form === 'nett' && !r.nett) return false;
      if (form === 'deltid' && !r.deltid) return false;
      if (form === 'heltid' && (r.deltid || r.nett)) return false;
      if (!passerSted(r)) return false;
      if (q) {
        const tekst = `${r.n} ${r.k} ${instNavn(r.i)} ${data.inst[r.i]?.n ?? ''} ${r.st ?? ''}`.toLowerCase();
        if (!q.split(/\s+/).every((ord) => tekst.includes(ord))) return false;
      }
      return true;
    });
    const tall = (v: number | null) => (v == null ? -Infinity : v);
    ut.sort((a, b) => {
      switch (sort) {
        case 'navn': return a.r.n.localeCompare(b.r.n, 'nb');
        case 'endring': return tall(b.endring) - tall(a.endring);
        case 'plasser': return tall(b.plasser) - tall(a.plasser);
        case 'perPlass': return tall(b.perPlass) - tall(a.perPlass);
        case 'pg': return tall(b.pg) - tall(a.pg);
        case 'reg': return tall(b.reg) - tall(a.reg);
        default: return tall(b.fv) - tall(a.fv);
      }
    });
    return ut;
  }, [avledet, sok, inst, niv, form, opptak, nedlagte, sort, fylke, stedNavn, sted]); // eslint-disable-line react-hooks/exhaustive-deps

  const sider = Math.max(1, Math.ceil(filtrert.length / PER_SIDE));
  const vis = filtrert.slice(side * PER_SIDE, (side + 1) * PER_SIDE);
  const antLok = filtrert.filter((a) => a.r.lok).length;
  const kol = 9;

  return (
    <div className="space-y-5">
      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-0.5 flex-1" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', minWidth: 200 }}>
            Søk
            <span className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--nmbu-neutral-2)' }} />
              <input value={sok} onChange={(e) => setSok(e.target.value)} placeholder="Program, kode, institusjon eller sted"
                className="w-full rounded-md pl-7 pr-7 py-1 text-xs" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', color: 'var(--nmbu-neutral)' }} />
              {sok && <button onClick={() => setSok('')} aria-label="Tøm søket" className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5" /></button>}
            </span>
          </label>
          <Velger etikett="Fagfelt" verdi={ff} onVelg={setFf}
            valg={[{ id: 'alle', label: 'Alle fagfelt' }, ...data.fagfelt.filter((f) => data.antall[f.id]).map((f) => ({ id: f.id, label: `${f.n} (${nf(data.antall[f.id])})` }))]} />
          <Velger etikett="Institusjon" verdi={inst} onVelg={setInst} valg={[{ id: 'alle', label: 'Alle institusjoner' }, ...instValg.map((k) => ({ id: k, label: instNavn(k) }))]} bredde={180} />
          <Velger etikett="Nivå" verdi={niv} onVelg={setNiv} valg={[{ id: 'alle', label: 'Alle nivåer' }, { id: 'bachelor', label: 'Bachelor' }, { id: 'master', label: 'Master' }, { id: 'arsstudium', label: 'Årsstudium' }, { id: 'profesjon', label: 'Profesjon' }]} />
          <Velger etikett="Studieform" verdi={form} onVelg={setForm} valg={[{ id: 'alle', label: 'Alle' }, { id: 'heltid', label: 'Heltid, stedbasert' }, { id: 'deltid', label: 'Deltid' }, { id: 'nett', label: 'Nett' }]} />
          <Velger etikett="Opptak" verdi={opptak} onVelg={setOpptak} valg={[{ id: 'alle', label: 'Samordna og lokalt' }, { id: 'samordna', label: 'Samordna' }, { id: 'lokalt', label: 'Lokalt opptak' }]} />
          <Velger etikett="Fylke" verdi={fylke} onVelg={setFylke} bredde={170}
            valg={[{ id: 'alle', label: 'Alle fylker' }, ...fylker.map((f) => ({ id: f, label: f })), { id: NETT, label: 'Nettstudier (egen nettcampus)' }, { id: UTLAND, label: 'Utlandet' }]} />
          {fylke !== NETT && fylke !== UTLAND && (
            <Velger etikett="Studiested" verdi={stedNavn} onVelg={setStedNavn} bredde={170} valg={[{ id: 'alle', label: 'Alle steder' }, ...stedsnavn.map((n) => ({ id: n, label: n }))]} />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Valg etikett="Sorter etter" valg={SORT_VALG} verdi={sort} onVelg={setSort} />
          <label className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--nmbu-neutral-1)' }}>
            <input type="checkbox" checked={nedlagte} onChange={(e) => setNedlagte(e.target.checked)} /> Ta med nedlagte og avlyste
          </label>
        </div>
      </div>

      <Kort ikon={ListOrdered} tittel={rader ? `${nf(filtrert.length)} program` : 'Program'}
        undertekst={<>Samordna-programmene viser hovedopptaket 2026. Program med <b>lokalt opptak</b> ({nf(antLok)} i utvalget) har ikke Samordnas plasser eller poenggrenser, og tallene deres er fra DBH 379 for 2025. Registrerte er høsten 2025 (DBH 123). Studiestedet for program med lokalt opptak er hentet fra DBH 124 (campusene med registrerte studenter, flest først). Klikk på en rad for tidsserier og nøkkeltall. NMBU er uthevet.</>}
        kilde={<>Kilde: Samordna opptak (søker- og tilbudstall, poenggrenser), DBH/HK-dir tabell 347, 370, 379 og 123. Hentet {dato(data.hentet)}. Koblingen Samordna → DBH går via studieprogramnummeret i DBH 370 ({nf(data.kobling.soMedSr)} av {nf(data.kobling.so)} Samordna-koder har studieresultater).</>}
        forbehold={[FORBEHOLD.sokere, FORBEHOLD.lokalt, 'Poenggrense 0 betyr at alle kvalifiserte søkere fikk tilbud («alle inn»).', FORBEHOLD.dbh2026,
          `Studiestedsfilteret bruker Samordnas studiested for Samordna-kodene og DBH 124 for program med lokalt opptak. ${FORBEHOLD.studiesteder}`]}>
        {rader === undefined ? <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>Laster programmene …</div> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr style={thead}>
                    <th className={thV}>Program</th><th className={thV}>Nivå</th>
                    <th className={th}>Førstevalg</th><th className={th}>Endring fra 2021</th><th className={th}>Plasser</th>
                    <th className={th}>Per plass</th><th className={th}>Poenggrense</th><th className={th}>Registrerte</th><th className={th} />
                  </tr>
                </thead>
                <tbody>
                  {vis.map((a) => {
                    const { r } = a;
                    const erApen = apen === r.id;
                    const Pil = erApen ? ChevronDown : ChevronRight;
                    return (
                      <Fragment key={r.id}>
                        <tr onClick={() => setApen(erApen ? null : r.id)} className="cursor-pointer"
                          style={{ borderTop: '1px solid var(--nmbu-neutral-3)', ...(r.i === NMBU ? { backgroundColor: 'var(--nmbu-green-light)' } : {}), ...(erApen ? { backgroundColor: 'var(--nmbu-beige-light)' } : {}) }}>
                          <td className={tdV} style={{ minWidth: 260 }}>
                            <div style={{ fontWeight: r.i === NMBU ? 700 : 600 }}>
                              {r.n}
                              {r.lok && <Merke tekst="lokalt opptak" bg="#E0E7FF" fg="#3730A3" tittel="Lokalt opptak (DBH 379, opptakstype L): ikke i Samordna" />}
                              {r.nett && <Merke tekst="nett" />}
                              {r.deltid && <Merke tekst="deltid" />}
                              {r.status === 'nedlagt' && <Merke tekst={r.lok ? 'nedlagt' : `siste opptak ${r.til}`} />}
                              {r.status === 'avlyst' && <Merke tekst="avlyst 2026" bg="#FEE2E2" fg="#991B1B" />}
                              {r.status === 'utfases' && <Merke tekst="utfases" />}
                              {!r.lok && r.fra && r.fra > '2021' && r.status !== 'nedlagt' && <Merke tekst={`ny ${r.fra}`} bg="var(--nmbu-green-4)" fg="var(--nmbu-green-dark)" />}
                              {r.ledig && <Merke tekst="ledige plasser 2026" bg="#FEF3C7" fg="#92400E" tittel="På Samordnas liste over ledige studieplasser etter hovedopptaket 2026" />}
                            </div>
                            <div style={{ color: 'var(--nmbu-neutral-2)' }}>{instNavn(r.i)}{r.lok && r.ss ? ` · ${stederTekst(r)}` : ''}{r.st ? ` · ${r.st}` : ''} · {r.k}</div>
                          </td>
                          <td className={tdV}>{NIVA_NAVN[r.niv] ?? r.niv}{r.var ? <span style={{ color: 'var(--nmbu-neutral-2)' }}> {r.var}</span> : null}</td>
                          <td className={td} style={{ fontWeight: 700 }}>{nf(a.fv)}{a.fv != null && r.lok && <sup style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 400 }}> 2025</sup>}</td>
                          <td className={td} style={{ color: endringFarge(a.endring) }}>{fortegn(a.endring)}{a.endringPst != null && <span style={{ color: 'var(--nmbu-neutral-2)' }}> ({fortegn(a.endringPst, 0, ' %')})</span>}</td>
                          <td className={td}>{nf(a.plasser)}</td>
                          <td className={td}>{nf(a.perPlass, 1)}</td>
                          <td className={td}>{a.pg === 0 ? 'alle inn' : nf(a.pg, 1)}</td>
                          <td className={td}>{nf(a.reg)}</td>
                          <td className="px-2"><Pil className="w-3.5 h-3.5" style={{ color: 'var(--nmbu-neutral-2)' }} /></td>
                        </tr>
                        {erApen && (
                          <tr><td colSpan={kol} className="p-3" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
                            <ProgramKort r={r} data={data} agg={agg ?? null} />
                          </td></tr>
                        )}
                      </Fragment>
                    );
                  })}
                  {vis.length === 0 && <tr><td colSpan={kol} className="px-3 py-4 text-center" style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen program passer filtrene.</td></tr>}
                </tbody>
              </table>
            </div>
            {sider > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs" style={{ color: 'var(--nmbu-neutral-1)' }}>
                <span>Viser {nf(side * PER_SIDE + 1)}–{nf(Math.min(filtrert.length, (side + 1) * PER_SIDE))} av {nf(filtrert.length)}</span>
                <span className="flex items-center gap-1">
                  <button disabled={side === 0} onClick={() => setSide(side - 1)} className="px-2 py-0.5 rounded-md disabled:opacity-40" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>Forrige</button>
                  <span className="px-2">Side {side + 1} av {sider}</span>
                  <button disabled={side >= sider - 1} onClick={() => setSide(side + 1)} className="px-2 py-0.5 rounded-md disabled:opacity-40" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>Neste</button>
                </span>
              </div>
            )}
          </>
        )}
      </Kort>
    </div>
  );
}

// ── Programkortet ───────────────────────────────────────────────────────────

/** Programmets verdi mot kvartilene i faggruppen: bånd p25–p75, strek for medianen og prikk for programmet. */
function Kvartil({ etikett, verdi, fd, fmt, maks, hjelp }: { etikett: string; verdi?: number | null; fd?: Fordeling; fmt: (v: number) => string; maks?: number; hjelp?: string }) {
  if (verdi == null) return null;
  const topp = maks ?? (Math.max(verdi, fd?.p75 ?? 0) * 1.25 || 1);
  const x = (v: number) => `${Math.max(0, Math.min(100, (100 * v) / topp))}%`;
  return (
    <div className="py-1.5" style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex items-baseline justify-between gap-2" style={{ fontSize: 12 }}>
        <span style={{ color: 'var(--nmbu-neutral-1)' }}>{etikett}</span>
        <span className="tabular-nums" style={{ fontWeight: 700 }}>{fmt(verdi)}</span>
      </div>
      {fd ? (
        <>
          <div className="relative h-3 mt-1 rounded" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }}>
            <div className="absolute top-0 bottom-0 rounded" style={{ left: x(fd.p25), width: `calc(${x(fd.p75)} - ${x(fd.p25)})`, backgroundColor: 'var(--nmbu-green-3)' }} />
            <div className="absolute -top-0.5 -bottom-0.5" style={{ left: x(fd.median), width: 2, backgroundColor: 'var(--nmbu-green-dark)' }} />
            <div className="absolute top-1/2 w-2.5 h-2.5 rounded-full -translate-y-1/2 -translate-x-1/2" style={{ left: x(verdi), backgroundColor: PRIVAT_FARGE, border: '1.5px solid #fff' }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>Median {fmt(fd.median)}, kvartiler {fmt(fd.p25)}–{fmt(fd.p75)} ({nf(fd.n)} program){hjelp ? ` · ${hjelp}` : ''}</div>
        </>
      ) : <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>For få program i faggruppen til å vise kvartiler.{hjelp ? ` ${hjelp}` : ''}</div>}
    </div>
  );
}

function ProgramKort({ r, data, agg }: { r: ProgramRad; data: Oversikt; agg: Aggregater | null }) {
  const inst = data.inst[r.i];
  const sr = r.sr;
  const g = sr?.nv && sr.fg ? agg?.[`${sr.nv}|${sr.fg}`] : undefined;
  const aarene = r.lok ? SO_AAR.slice(0, 5) : SO_AAR;
  const opptakGraf = aarene.map((aar) => {
    const v = r.a[aar];
    return { aar, fv: v?.[1] ?? null, pl: r.lok ? null : v?.[2] ?? null, mott: r.lok ? v?.[7] ?? null : null, pg: r.lok ? null : v?.[5] || null };
  });
  const srGraf = sr ? SR_AAR.map((aar, i) => ({ aar, reg: sr.reg[i], nye: sr.nye[i], kand: sr.kand[i] })) : [];
  const andel = (v: number) => pst(100 * v, 1);
  const fdRegMaks = g?.fd.reg ? Math.max(g.fd.reg.p75 * 2, (sr?.reg[6] ?? 0) * 1.1) : undefined;
  return (
    <div className="rounded-xl p-4 space-y-4" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div style={{ fontFamily: "'Lora', serif", fontSize: 18, color: 'var(--nmbu-green-dark)' }}>{r.n}</div>
          <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)' }}>
            {inst?.n ?? r.i}{r.st ? ` · ${r.st}` : ''} · {NIVA_NAVN[r.niv]}{r.var ? ` (${r.var})` : ''}{r.sp ? ` · ${nf(r.sp)} sp` : ''}
            {' · '}{r.lok ? <>lokalt opptak, DBH-kode {r.k}</> : <>Samordna-kode {r.k}</>}
            {r.dbh && !r.lok && <> · DBH {r.dbh.map((d) => d.split('_').slice(1).join('_')).join(', ')}</>}
          </div>
        </div>
        {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-xs underline flex items-center gap-1" style={{ color: 'var(--nmbu-green-dark)' }}>Programsiden <ExternalLink className="w-3 h-3" /></a>}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="overflow-x-auto">
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{r.lok ? 'Lokalt opptak 2021–2025 (DBH 379)' : 'Hovedopptaket 2021–2026 (Samordna)'}</div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={thead}>
                <th className={thV}>År</th><th className={th}>Søkere</th><th className={th}>Førstevalg</th>
                {!r.lok && <th className={th}>Plasser</th>}<th className={th}>Kvalifiserte</th><th className={th}>Tilbud</th>
                {r.lok ? <th className={th}>Møtt</th> : <><th className={th}>Grense ord.</th><th className={th}>Grense FV</th></>}
              </tr>
            </thead>
            <tbody>
              {aarene.map((aar) => {
                const v = r.a[aar];
                const pg = (x?: number | null) => (x === 0 ? 'alle inn' : nf(x, 1));
                return (
                  <tr key={aar} style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
                    <td className={tdV} style={{ fontWeight: 600 }}>{aar}</td>
                    {v ? (<>
                      <td className={td}>{nf(v[0])}</td><td className={td} style={{ fontWeight: 700 }}>{nf(v[1])}</td>
                      {!r.lok && <td className={td}>{nf(v[2])}</td>}<td className={td}>{nf(v[3])}</td><td className={td}>{nf(v[4])}</td>
                      {r.lok ? <td className={td}>{nf(v[7])}</td> : <><td className={td}>{pg(v[5])}</td><td className={td}>{pg(v[6])}</td></>}
                    </>) : <td colSpan={r.lok ? 6 : 7} className="px-2.5 py-1.5" style={{ color: 'var(--nmbu-neutral-2)' }}>Ikke opptak</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={opptakGraf} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="aar" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="v" tick={{ fontSize: 11 }} />
              {!r.lok && <YAxis yAxisId="h" orientation="right" tick={{ fontSize: 11 }} domain={['auto', 'auto']} width={36} />}
              <Tooltip formatter={(v: number, n: string) => (n.startsWith('Poeng') ? nf(v, 1) : nf(v))} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="v" dataKey="fv" name="Førstevalg" stroke={r.i === NMBU ? NMBU_FARGE : PRIVAT_FARGE} strokeWidth={2.2} dot={{ r: 2.5 }} connectNulls />
              {r.lok
                ? <Line yAxisId="v" dataKey="mott" name="Møtt" stroke={ANDRE_FARGE} strokeWidth={1.8} dot={{ r: 2 }} connectNulls />
                : <Line yAxisId="v" dataKey="pl" name="Plasser" stroke={ANDRE_FARGE} strokeWidth={1.8} dot={{ r: 2 }} connectNulls />}
              {!r.lok && <Line yAxisId="h" dataKey="pg" name="Poenggrense ord. (høyre akse)" stroke="#6366F1" strokeDasharray="4 3" strokeWidth={1.5} dot={{ r: 2 }} connectNulls />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {sr ? (
        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Studieresultater (DBH, {sr.key.replace('_', ' ')})</div>
            <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginBottom: 6 }}>
              Plassert mot {g ? <>«{g.n}», {NIVA_DBH[sr.nv ?? ''] ?? sr.nv} ({nf(g.ant)} program i DBH)</> : 'faggruppen (ikke funnet)'}. Oransje prikk = programmet, grønt bånd = midterste halvdel, strek = median.
            </div>
            <Kvartil etikett={`Registrerte studenter høsten 2025`} verdi={sr.reg[6]} fd={g?.fd.reg} fmt={(v) => nf(v)} maks={fdRegMaks} />
            <Kvartil etikett={`Fullført på normert tid${sr.ka ? `, kull ${sr.ka[0]}–${sr.ka[1]}` : ''}`} verdi={sr.fn} fd={g?.fd.fullfortNormertAndel} fmt={andel} maks={1} hjelp={sr.kg ? `${nf(sr.kg)} startende` : undefined} />
            <Kvartil etikett="Frafall innen normert tid" verdi={sr.fr} fd={g?.fd.frafallNormertAndel} fmt={andel} maks={1} />
            <Kvartil etikett="Fullført innen normert tid + 2 år" verdi={sr.f2} fd={g?.fd.fullfort2Andel} fmt={andel} maks={1} hjelp={sr.k2 ? `${nf(sr.k2)} startende` : undefined} />
            <Kvartil etikett={`Anslått inntekt per registrert${sr.innAar ? ` (${sr.innAar})` : ''}${sr.hyp ? ', hypotetisk' : ''}`} verdi={sr.innPerReg} fd={g?.fd.innPerReg} fmt={(v) => `${nf(v / 1000)} kkr`} hjelp={sr.hyp ? 'kvartilene er uten private' : undefined} />
            <div className="pt-1.5" style={{ borderTop: '1px solid var(--nmbu-neutral-3)', fontSize: 12 }}>
              Anslått inntekt {sr.innAar ?? ''}: <b>{kr(sr.inn)}</b>{sr.forelopig && ' (foreløpig, satsene for 2026)'}{sr.hyp && <span style={{ color: PRIVAT_FARGE }}> · hypotetisk (privat institusjon)</span>}
            </div>
          </div>
          <div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={srGraf} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="aar" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => nf(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line dataKey="reg" name="Registrerte (høst)" stroke={NMBU_FARGE} strokeWidth={2} dot={{ r: 2 }} connectNulls />
                  <Line dataKey="nye" name="Nye" stroke={PRIVAT_FARGE} strokeWidth={1.6} dot={{ r: 2 }} connectNulls />
                  <Line dataKey="kand" name="Kandidater" stroke={ANDRE_FARGE} strokeWidth={1.6} dot={{ r: 2 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {sr.innS && sr.innS.some((v) => v != null) && (
              <div className="overflow-x-auto mt-2">
                <table className="w-full border-collapse text-xs">
                  <thead><tr style={thead}><th className={thV}>Anslått inntekt</th>{SR_AAR.map((a) => <th key={a} className={th}>{a}</th>)}</tr></thead>
                  <tbody><tr>
                    <td className={tdV}>mill. kr</td>
                    {sr.innS.map((v, i) => <td key={i} className={td} style={i === 4 ? { borderLeft: '2px solid var(--nmbu-neutral-2)' } : undefined}>{v == null ? '–' : nf(v / 1e6, 1)}</td>)}
                  </tr></tbody>
                </table>
                <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>Streken markerer systemskiftet: produksjon til og med 2022 etter A–F, fra 2023 etter kategori 1–3 og G3. Produksjonsår, uttelling to år senere.</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>Ingen DBH-kobling ennå: koden er ny i 2026 (DBH 370 for 2026 er ikke publisert) eller ikke funnet i DBH. Studieresultatene mangler derfor.</div>
      )}

      <div className="space-y-1" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
        {sr?.delt && <div>• DBH-koden deles av {sr.delt} Samordna-koder (for eksempel flere studiesteder). Studieresultatene gjelder hele DBH-koden.</div>}
        {sr?.pr && <div>• Prikket i DBH minst ett år: {sr.pr.map((p) => ({ reg: 'registrerte', nye: 'nye', kand: 'kandidater' } as Record<string, string>)[p] ?? p).join(', ')}. Tallene er minimumstall.</div>}
        {r.km && <div>• Koblingsmerknad: {r.km} (Samordna-nivået og DBH-nivået er ulike, f.eks. femårig master tatt opp på bachelorkoden).</div>}
        {sr?.hyp && <div>• {FORBEHOLD.private}</div>}
        {sr && <div>• {FORBEHOLD.finansiering}</div>}
        <div>• Kilde: {r.lok ? 'DBH/HK-dir tabell 379 (opptakstype L)' : 'Samordna opptak, søkertall og poenggrenser'}; studieresultater fra DBH/HK-dir tabell 123, 110, 104, 707 og 900/908. Hentet {dato(data.hentet)}.</div>
      </div>
    </div>
  );
}

