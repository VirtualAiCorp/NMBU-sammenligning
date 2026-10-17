import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Trophy, Table2, Sparkles, MapPinOff, CircleDot, School, BarChart3, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import {
  FORBEHOLD, Kort, Laster, Merke, NMBU_FARGE, ANDRE_FARGE, PRIVAT_FARGE, Valg, Velger, dato, endringFarge, fortegn, hentFil, nf, pst, sum,
  td, tdV, th, thV, thead, nmbuRad, useFil,
} from './felles';

/**
 * Fanen «Økonomi og administrasjon» på Markedet: bachelorlandskapet (A1), masterlandskapet (A2) og profilene av
 * handelshøyskolene og økonomimiljøene (A3), fra kilde/public/marked/okonomi.json (scripts/build-marked.py).
 * Navn på ledere og dekaner er holdt utenfor, fordi de ikke er kontrollert.
 */

const SO = ['2021', '2022', '2023', '2024', '2025', '2026'];
const DBH = ['2021', '2022', '2023', '2024', '2025'];
type Serie = (number | null)[] | undefined;

interface BachRad {
  id: string; i: string; ik: string; sek: string; c?: string; n: string; fo?: string; t: string; niv: string; sp?: number; sf?: string; gt: boolean;
  op: string; so?: string; st: string; fra?: string; til?: string; fv?: Serie; pl?: Serie; pg?: Serie; lfv?: Serie; lmott?: Serie;
  reg?: Serie; kand?: Serie; hh?: string[]; url?: string; delt?: boolean; sivok?: boolean;
}
interface MastRad {
  id: string; i: string; ik: string; n: string; kat: string; katN: string; kj: boolean; t: string; pr: boolean; c?: string[]; dt: boolean; sivok?: boolean | null;
  op?: Record<string, (number | null)[]>; opT?: string; reg?: Serie; kand?: Serie; gj?: { andel: number; n: number; fra: number; til: number };
  krav?: { snitt?: string | null; bach?: string | null; kilde?: string | null; hentet?: string | null; gen: boolean } | null;
  skp?: number; akk?: string[]; ihh: boolean; hh?: string; sofv?: Serie; aktiv?: [string, string]; flagg?: string[]; iSum: boolean;
}
interface Profil {
  id: string; kort: string; navn: string; type?: string; ref: boolean; org?: string; enhet?: string;
  n25: Record<string, number | null>; n21: Record<string, number | null>; phd?: number; nfr?: number | null;
  akk: { type: string; aar?: number; status?: string }[]; campus: string[]; endr: { aar?: string; t: string }[]; strategi?: { t: string; url?: string } | null;
}
interface Topp { plass: number; id: string; institusjon: string; campus: string; program: string; nivaa: string; studiekode: string; forstevalg: Record<string, number>; endring2021_2026: number | null; studieplasser2026: number; poenggrenseOrd2026: number }
interface Okonomi {
  hentet: string; bachelor: BachRad[]; topp15: Topp[]; sammendrag: Record<string, Record<string, Record<string, number>> | string>;
  master: MastRad[]; masterKategorier: Record<string, string>; profiler: Profil[]; profilDefinisjoner: Record<string, string>;
}

const siste = (s: Serie) => (s ? s[s.length - 1] ?? null : null);
const forste = (s: Serie) => (s ? s[0] ?? null : null);
const erNmbu = (i?: string) => i === 'NMBU';
const AKTIV_BACH = (st: string) => st === 'aktiv' || st === 'ny' || st.startsWith('aktiv');

type Del = 'bachelor' | 'master' | 'skoler';

export function MarkedOkonomi() {
  const data = useFil<Okonomi>(() => hentFil<Okonomi>('okonomi.json'));
  const [del, setDel] = useState<Del>('bachelor');
  if (data === undefined) return <Laster tekst="Laster bachelor- og masterlandskapet …" />;
  if (data === null) return <Laster tekst="Fant ikke økonomidataene (marked/okonomi.json)." />;
  return (
    <div className="space-y-5">
      <div className="rounded-xl p-4" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
        <Valg valg={[{ id: 'bachelor', label: `Bachelor og femårige (${data.bachelor.length})` }, { id: 'master', label: `Master (${data.master.length})` }, { id: 'skoler', label: `Handelshøyskolene (${data.profiler.length})` }]} verdi={del} onVelg={setDel} />
      </div>
      {del === 'bachelor' && <Bachelor data={data} />}
      {del === 'master' && <Master data={data} />}
      {del === 'skoler' && <Skoler data={data} />}
    </div>
  );
}

// ── Bachelor ────────────────────────────────────────────────────────────────
function Bachelor({ data }: { data: Okonomi }) {
  const [type, setType] = useState('BØA');
  const [fo, setFo] = useState('alle');
  const [sek, setSek] = useState('alle');
  const [sf, setSf] = useState('alle');
  const [niv, setNiv] = useState('alle');
  const [op, setOp] = useState('alle');
  const [gt, setGt] = useState(false);
  const [aktive, setAktive] = useState(true);
  const [visAlle, setVisAlle] = useState(false);
  const kilde = <>Kilde: Samordna opptak (søkertall og poenggrenser 2021–2026, hentet 22.09.2026), DBH/HK-dir tabell 347, 379, 123, 124 og 104 (hentet {dato(data.hentet)}). Koblingen Samordna–DBH er gjort på tall: DBHs førstevalg ved nasjonalt opptak må være lik Samordnas.</>;
  const fagomraader = useMemo(() => [...new Set(data.bachelor.map((r) => r.fo).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, 'nb')), [data]);

  const rader = useMemo(() => data.bachelor
    .filter((r) => (type === 'alle' || r.t === type) && (fo === 'alle' || r.fo === fo) && (sek === 'alle' || r.sek === sek)
      && (sf === 'alle' || r.sf === sf) && (niv === 'alle' || r.niv === niv) && (op === 'alle' || r.op === op)
      && (gt || !r.gt) && (!aktive || AKTIV_BACH(r.st)))
    .map((r) => ({ r, fv: r.op === 'Samordna' ? siste(r.fv) : siste(r.lfv), fv0: r.op === 'Samordna' ? forste(r.fv) : forste(r.lfv) }))
    .sort((a, b) => (b.fv ?? -1) - (a.fv ?? -1)), [data, type, fo, sek, sf, niv, op, gt, aktive]);
  const vis = visAlle ? rader : rader.slice(0, 40);

  const sm = data.sammendrag as Record<string, Record<string, Record<string, number>>>;
  const fvSum = sm.samordnaForstevalg ?? {};
  const plSum = sm.samordnaStudieplasser ?? {};
  const lokSum = sm.lokaltOpptakAlle ?? {};
  const samordnaRang = useMemo(() => data.bachelor.filter((r) => r.op === 'Samordna' && siste(r.fv) != null).sort((a, b) => (siste(b.fv) ?? 0) - (siste(a.fv) ?? 0)), [data]);
  const nmbuRader = samordnaRang.map((r, i) => ({ r, plass: i + 1 })).filter((x) => erNmbu(x.r.i));

  const nye = data.bachelor.filter((r) => r.st === 'ny').sort((a, b) => (b.fra ?? '').localeCompare(a.fra ?? '') || (siste(b.fv) ?? 0) - (siste(a.fv) ?? 0));
  const nedlagte = data.bachelor.filter((r) => !AKTIV_BACH(r.st) && r.st !== 'ny').sort((a, b) => (b.til ?? '').localeCompare(a.til ?? ''));
  const udekket = data.bachelor.filter((r) => (r.t === 'BØA' || r.t === 'samf.') && !r.gt && AKTIV_BACH(r.st) && !(r.hh && r.hh.length))
    .sort((a, b) => (siste(b.fv) ?? siste(b.lfv) ?? 0) - (siste(a.fv) ?? siste(a.lfv) ?? 0));

  return (
    <>
      <Kort ikon={BarChart3} tittel="Markedet samlet: førstevalg og plasser i Samordna 2021–2026"
        undertekst={<>Bachelor og femårige løp i økonomi og administrasjon, samfunnsøkonomi og tilgrensende handelshøyskolefag (234 program). BØA = økonomi og administrasjon og siviløkonom, samf. = samfunnsøkonomi. Lokalt opptak (BI, Kristiania, ONH m.fl.) er søkere i DBH 379 og kan ikke legges sammen med Samordna.</>}
        kilde={kilde} forbehold={[FORBEHOLD.sokere, 'Lokalt opptak for 2026 er ikke rapportert i DBH ennå.']}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead><tr style={thead}><th className={thV}>Gruppe</th>{SO.map((a) => <th key={a} className={th}>{a}</th>)}<th className={th}>Endring</th><th className={th}>Plasser 2026</th></tr></thead>
            <tbody>
              {Object.entries(fvSum).map(([k, v]) => (
                <tr key={k} style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
                  <td className={tdV}>{k.replace('annet', 'andre').replace('grensetilfelle', '(grensetilfeller)')}</td>
                  {SO.map((a) => <td key={a} className={td}>{nf(v[a])}</td>)}
                  <td className={td} style={{ color: endringFarge((v['2026'] ?? 0) - (v['2021'] ?? 0)) }}>{fortegn((v['2026'] ?? 0) - (v['2021'] ?? 0))}</td>
                  <td className={td}>{nf(plSum[k]?.['2026'])}</td>
                </tr>
              ))}
              {Object.entries(lokSum).filter(([, v]) => (v['2025'] ?? 0) > 100).map(([k, v]) => (
                <tr key={k} style={{ borderTop: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)' }}>
                  <td className={tdV}>{k} <Merke tekst="lokalt, alle søkere" bg="#E0E7FF" fg="#3730A3" /></td>
                  {SO.map((a) => <td key={a} className={td}>{nf(v[a])}</td>)}
                  <td className={td} style={{ color: endringFarge((v['2025'] ?? 0) - (v['2021'] ?? 0)) }}>{fortegn((v['2025'] ?? 0) - (v['2021'] ?? 0))}<sup> 2025</sup></td>
                  <td className={td}>–</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kort>

      <Kort ikon={Trophy} tittel="De 15 største programmene etter førstevalg 2026"
        undertekst={<>Samordna-program (bachelor og femårige, også grensetilfeller). Lokalt opptak har ikke 2026-tall; BIs bachelor i økonomi og administrasjon hadde {nf(siste(data.bachelor.find((r) => r.id === 'dbh-8241-DIPØAH')?.lfv))} lokale førstevalg i 2025. NMBU-programmene står nederst med plassering.</>}
        kilde={kilde} forbehold={['NHH hadde to koder fra 2024 (siviløkonom og BEDS); nedgangen på den ene speiler at BEDS startet.']}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead><tr style={thead}><th className={thV}>#</th><th className={thV}>Program</th><th className={thV}>Nivå</th>{SO.map((a) => <th key={a} className={th}>{a}</th>)}<th className={th}>Endring</th><th className={th}>Plasser</th><th className={th}>Grense</th></tr></thead>
            <tbody>
              {data.topp15.map((t) => (
                <tr key={t.id} style={{ borderTop: '1px solid var(--nmbu-neutral-3)', ...(erNmbu(t.institusjon) ? nmbuRad : {}) }}>
                  <td className={tdV}>{t.plass}</td>
                  <td className={tdV}><b>{t.institusjon}</b> {t.program} <span style={{ color: 'var(--nmbu-neutral-2)' }}>· {t.campus} · {t.studiekode}</span></td>
                  <td className={tdV}>{t.nivaa}</td>
                  {SO.map((a) => <td key={a} className={td}>{nf(t.forstevalg[a])}</td>)}
                  <td className={td} style={{ color: endringFarge(t.endring2021_2026) }}>{t.endring2021_2026 == null ? 'ny' : fortegn(t.endring2021_2026)}</td>
                  <td className={td}>{nf(t.studieplasser2026)}</td><td className={td}>{t.poenggrenseOrd2026 === 0 ? 'alle inn' : nf(t.poenggrenseOrd2026, 1)}</td>
                </tr>
              ))}
              {nmbuRader.map(({ r, plass }) => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--nmbu-neutral-3)', ...nmbuRad }}>
                  <td className={tdV}>{plass}</td>
                  <td className={tdV}><b>NMBU</b> {r.n} <span style={{ color: 'var(--nmbu-neutral-2)' }}>· {r.c} · {r.so}</span></td>
                  <td className={tdV}>{r.niv}</td>
                  {SO.map((a, i) => <td key={a} className={td}>{nf(r.fv?.[i])}</td>)}
                  <td className={td} style={{ color: endringFarge((siste(r.fv) ?? 0) - (forste(r.fv) ?? 0)) }}>{forste(r.fv) == null ? 'ny' : fortegn((siste(r.fv) ?? 0) - (forste(r.fv) ?? 0))}</td>
                  <td className={td}>{nf(siste(r.pl))}</td><td className={td}>{siste(r.pg) === 0 ? 'alle inn' : nf(siste(r.pg), 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kort>

      <Kort ikon={Table2} tittel={`Bachelorlandskapet: ${rader.length} program`}
        undertekst={<>Én rad per program og studiested (Samordna-kode), eller per DBH-kode for lokalt opptak. Førstevalg er 2026 for Samordna og 2025 for lokalt opptak (merket). Registrerte og kandidater er 2025. «HH-kartet» viser om programmet er med i Handelshøyskolens sammenligninger.</>}
        kilde={kilde} forbehold={[FORBEHOLD.lokalt, 'Delte DBH-koder (flere studiesteder eller program på samme kode) har ikke studenttall per rad; de står som «delt kode».', FORBEHOLD.prikking]}>
        <div className="flex flex-wrap items-end gap-3 mb-3">
          <Velger etikett="Type" verdi={type} onVelg={setType} valg={[{ id: 'alle', label: 'Alle typer' }, { id: 'BØA', label: 'BØA og siviløkonom' }, { id: 'samf.', label: 'Samfunnsøkonomi' }, { id: 'annet', label: 'Andre' }]} />
          <Velger etikett="Fagområde" verdi={fo} onVelg={setFo} valg={[{ id: 'alle', label: 'Alle fagområder' }, ...fagomraader.map((f) => ({ id: f, label: f }))]} />
          <Velger etikett="Sektor" verdi={sek} onVelg={setSek} valg={[{ id: 'alle', label: 'Offentlig og privat' }, { id: 'offentlig', label: 'Offentlig' }, { id: 'privat', label: 'Privat' }]} />
          <Velger etikett="Studieform" verdi={sf} onVelg={setSf} valg={[{ id: 'alle', label: 'Alle' }, { id: 'stedbasert', label: 'Stedbasert' }, { id: 'nett', label: 'Nett' }, { id: 'samlingsbasert', label: 'Samlingsbasert' }]} />
          <Velger etikett="Nivå" verdi={niv} onVelg={setNiv} valg={[{ id: 'alle', label: 'Bachelor og femårig' }, { id: 'bachelor', label: 'Bachelor' }, { id: 'femårig', label: 'Femårig' }]} />
          <Velger etikett="Opptak" verdi={op} onVelg={setOp} valg={[{ id: 'alle', label: 'Samordna og lokalt' }, { id: 'Samordna', label: 'Samordna' }, { id: 'lokalt', label: 'Lokalt' }]} />
          <label className="flex items-center gap-1.5 text-xs pb-1"><input type="checkbox" checked={gt} onChange={(e) => setGt(e.target.checked)} /> Grensetilfeller (IT, reiseliv, FPØ …)</label>
          <label className="flex items-center gap-1.5 text-xs pb-1"><input type="checkbox" checked={aktive} onChange={(e) => setAktive(e.target.checked)} /> Bare aktive</label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead><tr style={thead}>
              <th className={thV}>Program</th><th className={thV}>Type</th><th className={th}>Førstevalg</th><th className={th}>Endring fra 2021</th>
              <th className={th}>Plasser 2026</th><th className={th}>Grense 2026</th><th className={th}>Registrerte</th><th className={th}>Kandidater</th><th className={thV}>HH-kartet</th>
            </tr></thead>
            <tbody>
              {vis.map(({ r, fv, fv0 }) => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--nmbu-neutral-3)', ...(erNmbu(r.i) ? nmbuRad : {}) }}>
                  <td className={tdV} style={{ minWidth: 240 }}>
                    <b>{r.i}</b> {r.n}
                    {r.op === 'lokalt' && <Merke tekst="lokalt opptak" bg="#E0E7FF" fg="#3730A3" />}
                    {r.sivok && <Merke tekst="siviløkonom" bg="var(--nmbu-green-4)" fg="var(--nmbu-green-dark)" />}
                    {r.st === 'ny' && <Merke tekst={`ny ${r.fra ?? ''}`} bg="var(--nmbu-green-4)" fg="var(--nmbu-green-dark)" />}
                    {r.gt && <Merke tekst="grensetilfelle" />}
                    <div style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 400 }}>{r.c}{r.sf && r.sf !== 'stedbasert' ? ` · ${r.sf}` : ''}{r.fo ? ` · ${r.fo}` : ''}</div>
                  </td>
                  <td className={tdV}>{r.t}{r.niv === 'femårig' ? ', femårig' : ''}</td>
                  <td className={td} style={{ fontWeight: 700 }}>{nf(fv)}{fv != null && r.op === 'lokalt' && <sup style={{ fontWeight: 400, color: 'var(--nmbu-neutral-2)' }}> 2025</sup>}</td>
                  <td className={td} style={{ color: endringFarge(fv != null && fv0 != null ? fv - fv0 : null) }}>{fv != null && fv0 != null ? fortegn(fv - fv0) : fv != null ? 'ny' : '–'}</td>
                  <td className={td}>{nf(siste(r.pl))}</td>
                  <td className={td}>{siste(r.pg) === 0 ? 'alle inn' : nf(siste(r.pg), 1)}</td>
                  <td className={td}>{r.delt ? <span style={{ color: 'var(--nmbu-neutral-2)' }}>delt kode</span> : nf(siste(r.reg))}</td>
                  <td className={td}>{r.delt ? '–' : nf(siste(r.kand))}</td>
                  <td className={tdV}>{r.hh?.length ? r.hh.join(', ') : <span style={{ color: 'var(--nmbu-neutral-2)' }}>–</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rader.length > 40 && <button onClick={() => setVisAlle(!visAlle)} className="mt-2 text-xs underline" style={{ color: 'var(--nmbu-green-dark)' }}>{visAlle ? 'Vis de 40 største' : `Vis alle ${rader.length}`}</button>}
      </Kort>

      <NyeOgNedlagte
        nye={nye.map((r) => ({ id: r.id, tekst: <><b>{r.i}</b> {r.n} <span style={{ color: 'var(--nmbu-neutral-2)' }}>· {r.c}</span></>, aar: r.fra, tall: siste(r.fv) ?? siste(r.lfv), nmbu: erNmbu(r.i) }))}
        nedlagte={nedlagte.map((r) => ({ id: r.id, tekst: <><b>{r.i}</b> {r.n} <span style={{ color: 'var(--nmbu-neutral-2)' }}>· {r.c} · {r.st}</span></>, aar: r.til, tall: null, nmbu: erNmbu(r.i) }))}
        tallEtikett="Førstevalg siste år" kilde={kilde}
        forbehold={['«Ny» er første Samordna-opptak i 2022 eller senere. «Nedlagt» er ikke i Samordna 2026 eller har sluttdato i DBH 347. Mange endringer er kodebytter eller sammenslåtte studiesteder.']} />

      <Udekket tittel="Bachelorprogram av BØA- eller samfunnsøkonomitypen som HH-programkartet ikke dekker"
        rader={udekket.map((r) => ({ id: r.id, tekst: <><b>{r.i}</b> {r.n} <span style={{ color: 'var(--nmbu-neutral-2)' }}>· {r.c}{r.sf !== 'stedbasert' ? ` · ${r.sf}` : ''}</span>{r.op === 'lokalt' && <Merke tekst="lokalt opptak" bg="#E0E7FF" fg="#3730A3" />}</>, a: siste(r.fv) ?? siste(r.lfv), b: r.delt ? null : siste(r.reg) }))}
        kolA="Førstevalg" kolB="Registrerte 2025" kilde={kilde}
        forbehold={['Feil i selve HH-programkartet (årsstudier merket som bachelor, feil DBH-koder) er beskrevet i docs/marked/bachelor-okonomi.md §5 og rettes separat.']} />
    </>
  );
}

// ── Master ──────────────────────────────────────────────────────────────────
function Master({ data }: { data: Okonomi }) {
  const [kat, setKat] = useState('alle');
  const [type, setType] = useState('2-årig');
  const [kj, setKj] = useState(true);
  const [sek, setSek] = useState('alle');
  const [aapen, setAapen] = useState<string | null>(null);
  const kilde = <>Kilde: DBH/HK-dir tabell 347, 379 (lokalt opptak L, nasjonalt N), 123, 104, 707 og 124 (hentet {dato(data.hentet)}); Samordna opptak for femårige; programsider og utdanning.no for opptakskrav, siviløkonomtittel og skolepenger; akkreditering på institusjonsnivå (AACSB, EQUIS, AMBA).</>;
  const kategorier = useMemo(() => [...new Map(data.master.map((r) => [r.kat, r.katN])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'nb')), [data]);

  const aktivRad = (r: MastRad) => (siste(r.reg) ?? 0) > 0 || (r.op?.['2025']?.[0] ?? 0) > 0;
  const rader = useMemo(() => data.master
    .filter((r) => r.iSum !== false && (kat === 'alle' || r.kat === kat) && (type === 'alle' || r.t.startsWith(type)) && (!kj || r.kj)
      && (sek === 'alle' || (sek === 'privat') === r.pr) && aktivRad(r))
    .map((r) => {
      const reg1 = siste(r.reg), reg0 = forste(r.reg);
      const o = r.op?.['2025'];
      return { r, reg1, vekst: reg0 && reg1 != null && reg0 >= 10 ? (100 * (reg1 - reg0)) / reg0 : null, fv: r.t.startsWith('5') && r.sofv ? r.sofv[4] : o?.[1] ?? null, mott: o?.[4] ?? null, tq: o && o[2] ? (100 * (o[3] ?? 0)) / o[2] : null };
    })
    .sort((a, b) => (b.reg1 ?? 0) - (a.reg1 ?? 0)), [data, kat, type, kj, sek]);

  const bobler = rader.filter((x) => x.vekst != null && x.reg1).map((x) => ({
    x: x.reg1 as number, y: Math.max(-100, Math.min(250, x.vekst as number)), z: x.fv ?? 5, navn: `${x.r.i} ${x.r.n}`, vekst: x.vekst, fv: x.fv,
    farge: erNmbu(x.r.i) ? NMBU_FARGE : x.r.pr ? PRIVAT_FARGE : ANDRE_FARGE, nmbu: erNmbu(x.r.i),
  }));
  const totReg = sum(rader.map((x) => x.reg1));

  const nye = data.master.filter((r) => r.aktiv && r.aktiv[0] >= '2023').sort((a, b) => (b.aktiv![0]).localeCompare(a.aktiv![0]));
  const nedlagte = data.master.filter((r) => r.aktiv && r.aktiv[1] < '2026' && !aktivRad(r)).sort((a, b) => (b.aktiv![1]).localeCompare(a.aktiv![1]));
  const udekket = data.master.filter((r) => r.kj && !r.ihh && r.iSum !== false && (siste(r.reg) ?? 0) > 0 && !erNmbu(r.i)).sort((a, b) => (siste(b.reg) ?? 0) - (siste(a.reg) ?? 0));

  return (
    <>
      <div className="rounded-xl p-4 flex flex-wrap items-end gap-3" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
        <Velger etikett="Kategori" verdi={kat} onVelg={setKat} valg={[{ id: 'alle', label: 'Alle kategorier' }, ...kategorier.map(([id, n]) => ({ id, label: n }))]} bredde={260} />
        <Velger etikett="Type" verdi={type} onVelg={setType} valg={[{ id: 'alle', label: 'Alle typer' }, { id: '2-årig', label: 'Toårig' }, { id: 'erfaringsbasert', label: 'Erfaringsbasert' }, { id: '5-årig', label: 'Femårig' }]} />
        <Velger etikett="Sektor" verdi={sek} onVelg={setSek} valg={[{ id: 'alle', label: 'Offentlig og privat' }, { id: 'offentlig', label: 'Offentlig' }, { id: 'privat', label: 'Privat' }]} />
        <label className="flex items-center gap-1.5 text-xs pb-1"><input type="checkbox" checked={kj} onChange={(e) => setKj(e.target.checked)} /> Bare kjerneprogram (uten utdannings- og helseledelse, siv.ing., logistikk og reiseliv)</label>
      </div>

      <Kort ikon={CircleDot} tittel={`Størrelse og vekst: ${bobler.length} masterprogram`}
        undertekst={<>Vannrett: registrerte høsten 2025 (logaritmisk akse). Loddrett: endring i registrerte 2021–2025 (program med minst 10 registrerte i 2021; kuttet ved −100 og +250 %). Boblestørrelsen er førstevalg 2025. NMBU er grønn, private oransje.</>}
        kilde={kilde} forbehold={['Erfaringsbaserte mastere tar ofte opp modulvis; registrerte er da et bedre mål enn søkere og møtte.', FORBEHOLD.dbh2026]}>
        <div style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 24, bottom: 24, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="x" scale="log" domain={[5, 'auto']} allowDataOverflow tick={{ fontSize: 11 }} tickFormatter={(v: number) => nf(v)}
                label={{ value: 'Registrerte 2025', position: 'insideBottom', offset: -12, fontSize: 11 }} />
              <YAxis type="number" dataKey="y" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${nf(v)} %`} width={56} />
              <ZAxis type="number" dataKey="z" range={[30, 600]} />
              <ReferenceLine y={0} stroke="var(--nmbu-neutral-2)" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                const p = payload?.[0]?.payload as (typeof bobler)[number] | undefined;
                if (!p) return null;
                return <div className="rounded-md px-2 py-1 text-xs" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
                  <b>{p.navn}</b><br />Registrerte 2025: {nf(p.x)} · endring {fortegn(p.vekst, 0, ' %')} · førstevalg 2025: {nf(p.fv)}
                </div>;
              }} />
              <Scatter data={bobler} isAnimationActive={false} shape={(props: { cx?: number; cy?: number; size?: number; payload?: (typeof bobler)[number] }) => {
                const r = Math.sqrt((props.size ?? 60) / Math.PI);
                const p = props.payload!;
                return <circle cx={props.cx} cy={props.cy} r={r} fill={p.farge} fillOpacity={p.nmbu ? 0.9 : 0.45} stroke={p.nmbu ? '#fff' : p.farge} strokeWidth={p.nmbu ? 2 : 1} />;
              }} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Kort>

      <Kort ikon={Table2} tittel={`Masterlandskapet: ${rader.length} aktive program, ${nf(totReg)} registrerte`}
        undertekst={<>Sortert etter registrerte høsten 2025. Førstevalg og møtt er lokalt opptak 2025 (DBH 379); for femårige er førstevalg Samordna. Tilbud/kval. er tilbud som andel av kvalifiserte (lav andel = mer selektivt). Gjennomføring er fullført på normert tid for de tre siste kullene som har nådd normert tid. Klikk for opptakskrav og kilde.</>}
        kilde={kilde} forbehold={['Søkere i DBH 379 er søknadsalternativer, ikke personer.', 'Opptakskravet er kontrollert mot programsiden for 60 program; «ikke kontrollert» betyr at vi ikke har lest kravet. Siviløkonom «?» betyr ikke avklart.', 'Akkreditering gjelder institusjonen eller handelshøyskolen, ikke programmet.', FORBEHOLD.prikking]}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead><tr style={thead}>
              <th className={thV}>Program</th><th className={thV}>Kategori</th><th className={th}>Registrerte</th><th className={th}>Vekst 2021–25</th>
              <th className={th}>Førstevalg</th><th className={th}>Møtt</th><th className={th}>Tilbud/kval.</th><th className={th}>Normert tid</th>
              <th className={thV}>Siviløk.</th><th className={th}>Skolepenger/år</th><th className={thV}>Akkr.</th><th className={thV}>HH-kartet</th>
            </tr></thead>
            <tbody>
              {rader.map(({ r, reg1, vekst, fv, mott, tq }) => (
                <Fragment key={r.id}>
                  <tr onClick={() => setAapen(aapen === r.id ? null : r.id)} className="cursor-pointer" style={{ borderTop: '1px solid var(--nmbu-neutral-3)', ...(erNmbu(r.i) ? nmbuRad : {}) }}>
                    <td className={tdV} style={{ minWidth: 220 }}>
                      {aapen === r.id ? <ChevronDown className="w-3 h-3 inline mr-1" /> : <ChevronRight className="w-3 h-3 inline mr-1" />}
                      <b>{r.i}</b> {r.n}{r.dt && <Merke tekst="deltid" />}{r.pr && <Merke tekst="privat" bg="#FFEDD5" fg="#9A3412" />}
                      {r.c?.length ? <div style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 400, paddingLeft: 16 }}>{r.c.join(', ')} · {r.t}</div> : null}
                    </td>
                    <td className={tdV}>{r.katN}</td>
                    <td className={td}>{nf(reg1)}</td>
                    <td className={td} style={{ color: endringFarge(vekst) }}>{fortegn(vekst, 0, ' %')}</td>
                    <td className={td}>{nf(fv)}</td><td className={td}>{nf(mott)}</td><td className={td}>{pst(tq, 0)}</td>
                    <td className={td}>{r.gj ? pst(r.gj.andel, 0) : '–'}</td>
                    <td className={tdV}>{r.sivok === true ? 'ja' : r.sivok === false ? 'nei' : '?'}</td>
                    <td className={td}>{r.skp ? `${nf(r.skp)} kr` : r.pr ? 'ikke kartlagt' : '–'}</td>
                    <td className={tdV}>{r.akk?.join(', ') || '–'}</td>
                    <td className={tdV}>{r.ihh ? (r.hh ?? 'ja') : <span style={{ color: 'var(--nmbu-neutral-2)' }}>–</span>}</td>
                  </tr>
                  {aapen === r.id && (
                    <tr><td colSpan={12} className="px-4 py-2" style={{ backgroundColor: 'var(--nmbu-beige-light)', fontSize: 12 }}>
                      <div><b>Opptakskrav:</b> {r.krav ? <>{r.krav.snitt ?? 'snittkrav ikke oppgitt'}{r.krav.bach ? `; ${r.krav.bach}` : ''}{r.krav.gen ? ' (nasjonalt minstekrav)' : ''}{r.krav.kilde && <> · <a href={r.krav.kilde} target="_blank" rel="noreferrer" className="underline">kilde <ExternalLink className="w-3 h-3 inline" /></a></>}{r.krav.hentet ? ` (lest ${dato(r.krav.hentet)})` : ''}</> : 'ikke kontrollert'}</div>
                      <div><b>Opptak (søkere / førstevalg / kvalifiserte / tilbud / møtt):</b> {DBH.map((a) => r.op?.[a] ? `${a}: ${r.op[a].map((v) => nf(v)).join(' / ')}` : null).filter(Boolean).join(' · ') || '–'}</div>
                      <div><b>Registrerte 2021–2025:</b> {r.reg?.map((v) => nf(v)).join(', ') ?? '–'} · <b>Kandidater:</b> {r.kand?.map((v) => nf(v)).join(', ') ?? '–'}{r.gj && <> · <b>Normert tid</b> kull {r.gj.fra}–{r.gj.til}: {pst(r.gj.andel)} av {nf(r.gj.n)}</>}</div>
                      {r.flagg?.length ? <div style={{ color: 'var(--nmbu-neutral-2)' }}>Merknad: {r.flagg.join('; ')}</div> : null}
                    </td></tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Kort>

      <NyeOgNedlagte
        nye={nye.map((r) => ({ id: r.id, tekst: <><b>{r.i}</b> {r.n} <span style={{ color: 'var(--nmbu-neutral-2)' }}>· {r.katN}</span></>, aar: r.aktiv?.[0], tall: siste(r.reg), nmbu: erNmbu(r.i) }))}
        nedlagte={nedlagte.map((r) => ({ id: r.id, tekst: <><b>{r.i}</b> {r.n} <span style={{ color: 'var(--nmbu-neutral-2)' }}>· {r.katN}</span></>, aar: r.aktiv?.[1], tall: null, nmbu: erNmbu(r.i) }))}
        tallEtikett="Registrerte 2025" kilde={kilde}
        forbehold={['«Ny» er første år i DBH 347 fra 2023. «Nedlagt» er siste år i DBH 347 før 2026 og ingen registrerte eller søkere i 2025. Kodebytter (nye kullkoder) kan se ut som nye eller nedlagte program.', 'Kristianias nye siviløkonomprogram har ikke DBH-kode før høsten 2026.']} />

      <Udekket tittel="Aktive masterprogram (kjerne) som HH-programkartet ikke dekker"
        rader={udekket.map((r) => ({ id: r.id, tekst: <><b>{r.i}</b> {r.n} <span style={{ color: 'var(--nmbu-neutral-2)' }}>· {r.katN} · {r.t}</span></>, a: siste(r.reg), b: r.op?.['2025']?.[1] ?? null }))}
        kolA="Registrerte 2025" kolB="Førstevalg 2025" kilde={kilde}
        forbehold={['HH-programkartet har en feil for entreprenørskapsmasteren: Nord og OsloMet deler DBH-koden MAENT og har fått hverandres tall. Det rettes separat.']} />
    </>
  );
}

// ── Felles lister ───────────────────────────────────────────────────────────
interface ListeRad { id: string; tekst: ReactNode; aar?: string | null; tall: number | null; nmbu: boolean }
function NyeOgNedlagte({ nye, nedlagte, tallEtikett, kilde, forbehold }: { nye: ListeRad[]; nedlagte: ListeRad[]; tallEtikett: string; kilde: ReactNode; forbehold: string[] }) {
  const liste = (rader: ListeRad[], aarEtikett: string, medTall: boolean) => (
    <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
      <table className="w-full border-collapse text-xs">
        <thead><tr style={thead}><th className={thV}>Program</th><th className={th}>{aarEtikett}</th>{medTall && <th className={th}>{tallEtikett}</th>}</tr></thead>
        <tbody>
          {rader.map((r) => (
            <tr key={r.id} style={{ borderTop: '1px solid var(--nmbu-neutral-3)', ...(r.nmbu ? nmbuRad : {}) }}>
              <td className={tdV}>{r.tekst}</td><td className={td}>{r.aar ?? '–'}</td>{medTall && <td className={td}>{nf(r.tall)}</td>}
            </tr>
          ))}
          {rader.length === 0 && <tr><td className={tdV} colSpan={3} style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen</td></tr>}
        </tbody>
      </table>
    </div>
  );
  return (
    <Kort ikon={Sparkles} tittel={`Nye og nedlagte program (${nye.length} nye, ${nedlagte.length} nedlagt eller uten opptak)`} kilde={kilde} forbehold={forbehold}>
      <div className="grid lg:grid-cols-2 gap-4">
        <div><div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Nye</div>{liste(nye, 'Første år', true)}</div>
        <div><div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Nedlagt eller uten opptak</div>{liste(nedlagte, 'Siste år', false)}</div>
      </div>
    </Kort>
  );
}

function Udekket({ tittel, rader, kolA, kolB, kilde, forbehold }: { tittel: string; rader: { id: string; tekst: ReactNode; a: number | null; b: number | null }[]; kolA: string; kolB: string; kilde: ReactNode; forbehold: string[] }) {
  return (
    <Kort ikon={MapPinOff} tittel={`${tittel} (${rader.length})`}
      undertekst="Programmene er aktive og av samme type som dem Handelshøyskolen sammenligner seg med, men er ikke med i HH-programkartet (data/hh/programkart.json). Lista viser hvor sammenligningene kan utvides."
      kilde={kilde} forbehold={forbehold}>
      <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
        <table className="w-full border-collapse text-xs">
          <thead><tr style={thead}><th className={thV}>Program</th><th className={th}>{kolA}</th><th className={th}>{kolB}</th></tr></thead>
          <tbody>
            {rader.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
                <td className={tdV}>{r.tekst}</td><td className={td}>{nf(r.a)}</td><td className={td}>{nf(r.b)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Kort>
  );
}

// ── Handelshøyskolene ───────────────────────────────────────────────────────
function Skoler({ data }: { data: Okonomi }) {
  const [aapen, setAapen] = useState<string | null>(null);
  const kol: { f: string; e: string; d: number; pst?: boolean; tittel: string }[] = [
    { f: 'fagligeArsverk', e: 'Faglige årsverk', d: 1, tittel: data.profilDefinisjoner.fagligeArsverk },
    { f: 'andelForstestilling', e: 'Førstestilling', d: 0, pst: true, tittel: data.profilDefinisjoner.andelForstestilling },
    { f: 'andelProfessor', e: 'Professor', d: 0, pst: true, tittel: data.profilDefinisjoner.andelProfessor },
    { f: 'registrerteStudenter', e: 'Reg. studenter', d: 0, tittel: 'DBH, registrerte studenter høsten 2025 på enhetens program' },
    { f: 'studentarsverkPerFagligArsverk', e: 'Studentårsverk per faglig', d: 1, tittel: data.profilDefinisjoner.studentarsverk },
    { f: 'publiseringspoeng', e: 'Publ.-poeng', d: 1, tittel: 'DBH 373' },
    { f: 'poengPerArsverkHkdir', e: 'Poeng per årsverk (HK-dir)', d: 2, tittel: data.profilDefinisjoner.poengPerArsverkHkdir },
    { f: 'andelNiva2', e: 'Nivå 2', d: 0, pst: true, tittel: data.profilDefinisjoner.andelNiva2 },
  ];
  const rader = [...data.profiler].sort((a, b) => Number(a.ref) - Number(b.ref) || (b.n25.fagligeArsverk ?? 0) - (a.n25.fagligeArsverk ?? 0));
  return (
    <Kort ikon={School} tittel="Handelshøyskolene og økonomimiljøene: profiler 2025"
      undertekst={<>Én rad per økonomisk-administrativt miljø, med den minste enheten som bærer navnet handelshøyskole (NHH og BI er hele institusjonen). UiB og UiO økonomi er med som samfunnsøkonomiske referanser (kursiv). Klikk på en rad for nylige endringer og gjeldende strategi. Ledelse er ikke tatt med, fordi navnene ikke er kontrollert.</>}
      kilde={<>Kilde: DBH/HK-dir tabell 225 (årsverk), 373/374 (publisering), 900 (studiepoeng), 101 (disputaser), 123 (studenter), hentet 23.09, 03.10 og 17.10.2026; Forskningsrådets Prosjektbanken (17.10.2026); akkrediteringslistene til AACSB, EFMD (EQUIS) og AMBA; institusjonenes egne sider og styredokumenter.</>}
      forbehold={['Publiseringspoeng for 2025 kan bli justert. Små miljøer svinger mye fra år til år.', 'NFR-tallene er utbetalt til prosjekter der enheten selv er ansvarlig, og er minimumstall; mye ligger på institusjonsnivå. 2024 er lavt for alle på grunn av bruttobudsjettering.', 'HVL og Kristiania har 0 disputaser fordi ph.d.-programmene ligger på fakultets- eller doktorgradsskolenivå.', 'NLA og ONH: DBH fordeler ikke årsverk eller studenter på avdeling, så flere felt mangler.']}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead><tr style={thead}>
            <th className={thV}>Miljø</th><th className={thV}>Organisering</th>
            {kol.map((k) => <th key={k.f} className={th} title={k.tittel}>{k.e}</th>)}
            <th className={th} title="DBH 101, 2021–2025">Disputaser 21–25</th><th className={th} title="Prosjektbanken, utbetalt til enheten 2021–2025">NFR 21–25, mill. kr</th>
            <th className={thV}>Akkreditering</th><th className={thV}>Campuser</th>
          </tr></thead>
          <tbody>
            {rader.map((p) => (
              <Fragment key={p.id}>
                <tr onClick={() => setAapen(aapen === p.id ? null : p.id)} className="cursor-pointer"
                  style={{ borderTop: '1px solid var(--nmbu-neutral-3)', ...(p.id === 'nmbu' ? nmbuRad : {}), ...(p.ref ? { fontStyle: 'italic', color: 'var(--nmbu-neutral-1)' } : {}) }}>
                  <td className={tdV} title={p.navn}>{aapen === p.id ? <ChevronDown className="w-3 h-3 inline mr-1" /> : <ChevronRight className="w-3 h-3 inline mr-1" />}<b>{p.kort}</b><div style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 400, paddingLeft: 16 }}>{p.enhet}</div></td>
                  <td className={tdV}>{p.org ?? '–'}</td>
                  {kol.map((k) => <td key={k.f} className={td}>{k.pst ? pst(p.n25[k.f], k.d) : nf(p.n25[k.f], k.d)}</td>)}
                  <td className={td}>{nf(p.phd)}</td><td className={td}>{nf(p.nfr, 1)}</td>
                  <td className={tdV}>{p.akk.filter((a) => a.status === 'akkreditert').map((a) => `${a.type}${a.aar ? ` (${a.aar})` : ''}`).join(', ') || '–'}</td>
                  <td className={tdV} style={{ minWidth: 160 }}>{p.campus.join(', ')}</td>
                </tr>
                {aapen === p.id && (
                  <tr><td colSpan={kol.length + 6} className="px-4 py-2" style={{ backgroundColor: 'var(--nmbu-beige-light)', fontSize: 12 }}>
                    <div className="mb-1"><b>{p.navn}</b> · {p.type}{p.n21.fagligeArsverk != null && <> · faglige årsverk 2021: {nf(p.n21.fagligeArsverk, 1)}, registrerte 2021: {nf(p.n21.registrerteStudenter)}</>}</div>
                    {p.akk.some((a) => a.status !== 'akkreditert') && <div>Akkreditering i prosess eller annet: {p.akk.filter((a) => a.status !== 'akkreditert').map((a) => `${a.type} (${a.status})`).join(', ')}</div>}
                    {p.strategi && <div>Strategi: {p.strategi.url ? <a href={p.strategi.url} target="_blank" rel="noreferrer" className="underline">{p.strategi.t} <ExternalLink className="w-3 h-3 inline" /></a> : p.strategi.t}</div>}
                    {p.endr.length > 0 && <ul className="list-disc pl-5 mt-1">{p.endr.map((e, i) => <li key={i}><b>{e.aar}:</b> {e.t}</li>)}</ul>}
                  </td></tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Kort>
  );
}
