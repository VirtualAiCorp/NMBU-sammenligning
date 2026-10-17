import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Building2, Layers, Users, AlertTriangle } from '../../ikoner';
import {
  FORBEHOLD, Kort, NMBU, NMBU_FARGE, ANDRE_FARGE, Spark, Valg, Velger, dato, endringFarge, fortegn, nf, pst, sum,
  td, tdV, th, thV, thead, nmbuRad, type NivFv, type NivMott, type Oversikt,
} from './felles';

/**
 * Fanen «Oversikt» på Markedet: NMBUs andel av førstevalgene i Samordna 2021–2026, totalt og per fagfelt, med bryter
 * mellom alle program (gradsprogram og årsstudier) og bare gradsprogram. I tillegg DBH-linsen (møtte, med de private).
 */

type Linse = 'alle' | 'grad';
const NIV: Record<Linse, (keyof NivFv)[]> = { alle: ['b', 'a', 'm'], grad: ['b', 'm'] };
const LINSE_VALG: { id: Linse; label: string }[] = [
  { id: 'alle', label: 'Alle program (med årsstudier)' },
  { id: 'grad', label: 'Bare gradsprogram' },
];

const serie = (d: NivFv | undefined, linse: Linse, n: number) => {
  const ut = new Array(n).fill(0);
  if (!d) return ut;
  for (const k of NIV[linse]) d[k]?.forEach((v, i) => { ut[i] += v; });
  return ut;
};

export function MarkedOversikt({ data, ff, setFf }: { data: Oversikt; ff: string; setFf: (f: string) => void }) {
  const [linse, setLinse] = useState<Linse>('alle');
  const N = data.aar.length;
  const sisteI = N - 1;
  const instNavn = (k: string) => data.inst[k]?.k ?? k;
  const feltNavn = (id: string) => (id === 'alle' ? 'alle fagfelt' : data.fagfelt.find((f) => f.id === id)?.n ?? id);

  // Totaler og institusjonsserier for valgt felt og linse
  const beregn = (felt: string, l: Linse) => {
    const inst = data.fv[felt] ?? {};
    const rader = Object.entries(inst).map(([k, d]) => ({ k, fv: serie(d, l, N) }));
    const total = data.aar.map((_, i) => sum(rader.map((r) => r.fv[i])));
    return { rader, total };
  };
  const { rader, total } = useMemo(() => beregn(ff, linse), [ff, linse, data]); // eslint-disable-line react-hooks/exhaustive-deps

  const instTabell = useMemo(() => rader
    .map((r) => {
      const andel = r.fv.map((v, i) => (total[i] ? (100 * v) / total[i] : 0));
      return { ...r, andel, pp: andel[sisteI] - andel[0] };
    })
    .filter((r) => r.fv.some((v) => v > 0))
    .sort((a, b) => b.andel[sisteI] - a.andel[sisteI]), [rader, total, sisteI]);
  const maksPp = Math.max(0.5, ...instTabell.map((r) => Math.abs(r.pp)));
  const nmbuRang = instTabell.findIndex((r) => r.k === NMBU) + 1;
  const nmbu = instTabell.find((r) => r.k === NMBU);

  // NMBUs andel over tid, begge linser (gradsprogram både som andel av gradsmarkedet og av alle førstevalg)
  const graf = useMemo(() => {
    const a = beregn(ff, 'alle'), g = beregn(ff, 'grad');
    const nmA = serie(data.fv[ff]?.[NMBU], 'alle', N), nmG = serie(data.fv[ff]?.[NMBU], 'grad', N);
    return data.aar.map((aar, i) => ({
      aar,
      alle: a.total[i] ? +((100 * nmA[i]) / a.total[i]).toFixed(2) : null,
      grad: g.total[i] ? +((100 * nmG[i]) / g.total[i]).toFixed(2) : null,
      gradAvAlle: a.total[i] ? +((100 * nmG[i]) / a.total[i]).toFixed(2) : null,
    }));
  }, [ff, data, N]); // eslint-disable-line react-hooks/exhaustive-deps

  // NMBUs årsstudier i feltet (forklarer veksten i økonomi og administrasjon)
  const ars = data.nmbuArsstudier.filter((a) => ff === 'alle' || a.ff === ff);
  const nmA = serie(data.fv[ff]?.[NMBU], 'alle', N), nmG = serie(data.fv[ff]?.[NMBU], 'grad', N);
  const totA = beregn(ff, 'alle').total, totG = beregn(ff, 'grad').total;
  const arsSum = sum(ars.map((a) => a.fv[sisteI]));

  // Fagfeltene: størrelse, vekst og NMBUs plass
  const felt = useMemo(() => data.fagfelt
    .filter((f) => data.fv[f.id])
    .map((f) => {
      const b = beregn(f.id, linse);
      const nm = b.rader.find((r) => r.k === NMBU)?.fv ?? new Array(N).fill(0);
      const andel = (i: number) => (b.total[i] ? (100 * nm[i]) / b.total[i] : 0);
      const rang = nm[sisteI] > 0 ? [...b.rader].sort((x, y) => y.fv[sisteI] - x.fv[sisteI]).findIndex((r) => r.k === NMBU) + 1 : null;
      return { id: f.id, n: f.n, t0: b.total[0], t1: b.total[sisteI], vekst: b.total[0] ? (100 * (b.total[sisteI] - b.total[0])) / b.total[0] : null,
        a0: andel(0), a1: andel(sisteI), pp: andel(sisteI) - andel(0), nm1: nm[sisteI], rang, ant: b.rader.filter((r) => r.fv[sisteI] > 0).length };
    })
    .filter((f) => f.t1 > 0 || f.t0 > 0)
    .sort((a, b) => b.t1 - a.t1), [data, linse, N, sisteI]); // eslint-disable-line react-hooks/exhaustive-deps

  const kilde = <>Kilde: Samordna opptak/HK-dir, søker- og tilbudstall til nedlasting (hovedopptaket, oppdatert 23.07.2026), koblet til DBH 347/370 for fagfelt (NUS). Hentet {dato(data.hentet)}.</>;
  const a0 = data.aar[0], a1 = data.aar[sisteI];

  return (
    <div className="space-y-5">
      <div className="rounded-xl p-4 flex flex-wrap items-end gap-4" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
        <Velger etikett="Fagfelt" verdi={ff} onVelg={setFf} bredde={260}
          valg={[{ id: 'alle', label: 'Alle fagfelt' }, ...data.fagfelt.filter((f) => data.fv[f.id]).map((f) => ({ id: f.id, label: f.n }))]} />
        <Valg etikett="Program" valg={LINSE_VALG} verdi={linse} onVelg={setLinse} />
      </div>

      {/* Nøkkeltall */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { e: `Førstevalg ${a1}, ${feltNavn(ff)}`, v: nf(total[sisteI]), u: <>Endring fra {a0}: <span style={{ color: endringFarge(total[sisteI] - total[0]) }}>{fortegn(total[0] ? (100 * (total[sisteI] - total[0])) / total[0] : null, 1, ' %')}</span></> },
          { e: `NMBUs førstevalg ${a1}`, v: nf(nmbu?.fv[sisteI] ?? 0), u: <>Var {nf(nmbu?.fv[0] ?? 0)} i {a0}</> },
          { e: `NMBUs andel ${a1}`, v: pst(nmbu?.andel[sisteI] ?? 0, 2), u: nmbuRang ? <>Nr. {nmbuRang} av {instTabell.length} institusjoner</> : 'NMBU har ingen program her' },
          { e: `Endring ${a0}–${a1}`, v: <span style={{ color: endringFarge(nmbu?.pp) }}>{fortegn(nmbu?.pp ?? 0, 2, ' pp')}</span>, u: 'Prosentpoeng, NMBUs andel' },
        ].map((k, i) => (
          <div key={i} className="rounded-xl p-4" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
            <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{k.e}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--nmbu-green-dark)' }} className="tabular-nums">{k.v}</div>
            <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-1)' }}>{k.u}</div>
          </div>
        ))}
      </div>

      {ars.length > 0 && arsSum > 0 && (
        <div className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', color: '#78350F', fontSize: 13, lineHeight: 1.55 }}>
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <b>Gradsprogram og årsstudier må skilles.</b> Av NMBUs {nf(nmA[sisteI])} førstevalg i {feltNavn(ff)} i {a1} gikk {nf(arsSum)} til
            {' '}{ars.length === 1 ? 'årsstudiet' : 'årsstudiene'} {ars.map((a) => `${a.n} (${a.k}, ${nf(a.fv[sisteI])})`).join(', ')}.
            {' '}Med årsstudiene har NMBU {pst(totA[sisteI] ? (100 * nmA[sisteI]) / totA[sisteI] : 0, 2)} av alle førstevalg i feltet.
            {' '}Gradsprogrammene alene ga {nf(nmG[sisteI])} førstevalg: <b>{pst(totA[sisteI] ? (100 * nmG[sisteI]) / totA[sisteI] : 0, 2)} av alle førstevalg i feltet</b>,
            {' '}eller {pst(totG[sisteI] ? (100 * nmG[sisteI]) / totG[sisteI] : 0, 2)} av førstevalgene til gradsprogram (bachelor og femårig master/profesjon).
            {ff === 'okonomi' && <> Veksten i økonomi og administrasjon skyldes i hovedsak det nettbaserte årsstudiet i bærekraftig økonomi og ledelse (192253), som startet i 2023.</>}
          </div>
        </div>
      )}

      <Kort ikon={TrendingUp} tittel={`NMBUs andel av førstevalgene, ${feltNavn(ff)}`}
        undertekst={<>Heltrukket linje: alle program i Samordna (bachelor, årsstudier og femårig master/profesjon). Stiplet: bare gradsprogram, som andel av førstevalgene til gradsprogram. Prikket: gradsprogrammene som andel av <i>alle</i> førstevalg i feltet, altså det NMBU hadde hatt uten årsstudiene.</>}
        kilde={kilde} forbehold={[FORBEHOLD.sokere, 'Enkeltemner og videreutdanning er ikke i Samordna og er ikke med i markedsandelene.']}>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graf} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="aar" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${nf(v, 1)} %`} width={56} />
              <Tooltip formatter={(v: number) => pst(v, 2)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line dataKey="alle" name="Alle program" stroke={NMBU_FARGE} strokeWidth={2.4} dot={{ r: 3 }} connectNulls />
              <Line dataKey="grad" name="Gradsprogram, av gradsmarkedet" stroke={NMBU_FARGE} strokeDasharray="6 3" strokeWidth={1.8} dot={{ r: 2.5 }} connectNulls />
              <Line dataKey="gradAvAlle" name="Gradsprogram, av alle førstevalg" stroke={ANDRE_FARGE} strokeDasharray="2 3" strokeWidth={1.8} dot={{ r: 2 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Kort>

      <Kort ikon={Building2} tittel={`Institusjonene: andel av førstevalgene ${a0}–${a1}`}
        undertekst={<>Alle institusjoner med Samordna-opptak i {feltNavn(ff)}, sortert etter andel i {a1}. {linse === 'grad' ? 'Bare gradsprogram (uten årsstudier).' : 'Alle program, også årsstudier.'} Søylen viser endringen i prosentpoeng; grønn er vekst. NMBU er uthevet.</>}
        kilde={kilde} forbehold={['Private med lokalt opptak (BI, Kristiania m.fl.) er ikke i Samordna. De vises i DBH-kortet lenger ned.', 'Kodebytter og nye studiesteder kan flytte søkere mellom program, men ikke mellom institusjoner; andelene per institusjon er derfor robuste.']}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={thead}>
                <th className={thV}>#</th><th className={thV}>Institusjon</th>
                <th className={th}>Førstevalg {a0}</th><th className={th}>Førstevalg {a1}</th>
                <th className={th}>Andel {a0}</th><th className={th}>Andel {a1}</th>
                <th className={thV}>{a0}–{a1}</th><th className={th}>Endring</th><th className={thV} style={{ minWidth: 140 }} />
              </tr>
            </thead>
            <tbody>
              {instTabell.map((r, i) => (
                <tr key={r.k} style={{ borderTop: '1px solid var(--nmbu-neutral-3)', ...(r.k === NMBU ? nmbuRad : {}) }}>
                  <td className={tdV} style={{ color: 'var(--nmbu-neutral-2)' }}>{i + 1}</td>
                  <td className={tdV} title={data.inst[r.k]?.n}>{instNavn(r.k)}</td>
                  <td className={td}>{nf(r.fv[0])}</td><td className={td}>{nf(r.fv[sisteI])}</td>
                  <td className={td}>{pst(r.andel[0], 2)}</td><td className={td}>{pst(r.andel[sisteI], 2)}</td>
                  <td className="px-2.5 py-1"><Spark verdier={r.andel} farge={r.k === NMBU ? NMBU_FARGE : ANDRE_FARGE} /></td>
                  <td className={td} style={{ color: endringFarge(r.pp) }}>{fortegn(r.pp, 2, ' pp')}</td>
                  <td className="px-2.5 py-1">
                    <div className="relative h-3" style={{ width: 140 }}>
                      <div className="absolute top-0 bottom-0" style={{ left: 70, width: 1, backgroundColor: 'var(--nmbu-neutral-3)' }} />
                      <div className="absolute top-0.5 bottom-0.5 rounded-sm" style={{
                        left: r.pp >= 0 ? 70 : 70 - (70 * Math.abs(r.pp)) / maksPp, width: (70 * Math.abs(r.pp)) / maksPp,
                        backgroundColor: r.k === NMBU ? NMBU_FARGE : r.pp >= 0 ? '#86C5B4' : '#E7A3A3' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kort>

      <Kort ikon={Layers} tittel={`Fagfeltene: størrelse, vekst og NMBUs plass (${linse === 'grad' ? 'bare gradsprogram' : 'alle program'})`}
        undertekst={<>Førstevalg per fagfelt i Samordna, sortert etter størrelse i {a1}. Fagfeltene er laget av NUS-faggruppen til DBH-programmet (samfunnsøkonomi er lagt til økonomi og administrasjon, industriell økonomi til teknologi). Klikk på et fagfelt for å velge det.</>}
        kilde={kilde} forbehold={['NUS er ikke alltid intuitivt: Ettårig grunnstudium havner under samfunnsvitenskap, dyrepleie under veterinærfag og Frie realfag under teknologi.']}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={thead}>
                <th className={thV}>Fagfelt</th><th className={th}>Førstevalg {a0}</th><th className={th}>Førstevalg {a1}</th><th className={th}>Vekst</th>
                <th className={th}>NMBU {a1}</th><th className={th}>NMBU-andel {a0}</th><th className={th}>NMBU-andel {a1}</th><th className={th}>Endring</th><th className={th}>NMBUs plass</th>
              </tr>
            </thead>
            <tbody>
              {felt.map((f) => (
                <tr key={f.id} onClick={() => setFf(f.id)} className="cursor-pointer"
                  style={{ borderTop: '1px solid var(--nmbu-neutral-3)', ...(f.id === ff ? { backgroundColor: 'var(--nmbu-green-light)', fontWeight: 700 } : {}) }}>
                  <td className={tdV}>{f.n}</td>
                  <td className={td}>{nf(f.t0)}</td><td className={td}>{nf(f.t1)}</td>
                  <td className={td} style={{ color: endringFarge(f.vekst) }}>{fortegn(f.vekst, 1, ' %')}</td>
                  <td className={td}>{f.nm1 ? nf(f.nm1) : '–'}</td>
                  <td className={td}>{f.a0 ? pst(f.a0, 2) : '–'}</td><td className={td}>{f.a1 ? pst(f.a1, 2) : '–'}</td>
                  <td className={td} style={{ color: endringFarge(f.pp) }}>{f.a0 || f.a1 ? fortegn(f.pp, 2, ' pp') : '–'}</td>
                  <td className={td}>{f.rang ? `${f.rang} av ${f.ant}` : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kort>

      <DbhLinse data={data} ff={ff} linse={linse} feltNavn={feltNavn(ff)} />
    </div>
  );
}

type DbhNiv = 'alle' | keyof NivMott;
const DBH_NIV: { id: DbhNiv; label: string }[] = [
  { id: 'alle', label: 'Alle nivåer' }, { id: 'b', label: 'Bachelor' }, { id: 'a', label: 'Årsstudium' },
  { id: 'm5', label: 'Femårig master' }, { id: 'm2', label: 'Toårig master' }, { id: 'me', label: 'Erfaringsmaster' },
];

/** DBH-linsen: andel av dem som møtte til studiestart (lokalt + nasjonalt opptak), med de private. */
function DbhLinse({ data, ff, linse, feltNavn }: { data: Oversikt; ff: string; linse: Linse; feltNavn: string }) {
  const [niv, setNiv] = useState<DbhNiv>('alle');
  const [visAlle, setVisAlle] = useState(false);
  const N = data.dbhAar.length, s = N - 1;
  const nivaer: (keyof NivMott)[] = niv === 'alle' ? (linse === 'grad' ? ['b', 'm5', 'm2', 'me'] : ['b', 'a', 'm5', 'm2', 'me']) : [niv];
  const rader = Object.entries(data.mott[ff] ?? {}).map(([k, d]) => {
    const v = new Array(N).fill(0);
    for (const n of nivaer) d[n]?.forEach((x, i) => { v[i] += x; });
    return { k, v };
  });
  const tot = data.dbhAar.map((_, i) => sum(rader.map((r) => r.v[i])));
  const tabell = rader
    .map((r) => ({ ...r, a0: tot[0] ? (100 * r.v[0]) / tot[0] : 0, a1: tot[s] ? (100 * r.v[s]) / tot[s] : 0 }))
    .filter((r) => r.v[s] > 0 || r.v[0] > 0)
    .sort((a, b) => b.v[s] - a.v[s]);
  const vis = visAlle ? tabell : tabell.filter((r, i) => i < 15 || r.k === NMBU);
  const a0 = data.dbhAar[0], a1 = data.dbhAar[s];
  return (
    <Kort ikon={Users} tittel={`Med de private: andel av dem som møtte, ${feltNavn}`}
      undertekst={<>Samordna viser bare institusjonene med nasjonalt opptak. DBH 379 har også lokalt opptak, så BI, Kristiania, ONH og toårige mastere er med. Målet er antall som møtte til studiestart på gradsprogram (og årsstudier når de er valgt), {a0}–{a1}.{linse === 'grad' && niv === 'alle' ? ' Årsstudiene er holdt utenfor (bryteren øverst).' : ''}</>}
      hoyre={<Valg valg={DBH_NIV} verdi={niv} onVelg={setNiv} />}
      kilde={<>Kilde: DBH/HK-dir tabell 379 (søkertall og møtte), opptakstype L og N samlet, koblet til fagfelt via DBH 347 (NUS). Hentet {dato(data.hentet)}.</>}
      forbehold={[FORBEHOLD.dbh2026, FORBEHOLD.prikking, 'Lokalt og nasjonalt opptak telles likt her. Møtt er det beste målet på hvem som faktisk begynner, men det kommer først etter studiestart.']}>
      {tabell.length === 0
        ? <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>Ingen møtte på dette nivået i fagfeltet.</div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr style={thead}>
                  <th className={thV}>#</th><th className={thV}>Institusjon</th><th className={th}>Møtt {a0}</th><th className={th}>Møtt {a1}</th>
                  <th className={th}>Andel {a0}</th><th className={th}>Andel {a1}</th><th className={th}>Endring</th>
                </tr>
              </thead>
              <tbody>
                {vis.map((r) => (
                  <tr key={r.k} style={{ borderTop: '1px solid var(--nmbu-neutral-3)', ...(r.k === NMBU ? nmbuRad : {}) }}>
                    <td className={tdV} style={{ color: 'var(--nmbu-neutral-2)' }}>{tabell.indexOf(r) + 1}</td>
                    <td className={tdV} title={data.inst[r.k]?.n}>{data.inst[r.k]?.k ?? r.k}{data.inst[r.k]?.s === 'privat' && <span style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 400 }}> · privat</span>}</td>
                    <td className={td}>{nf(r.v[0])}</td><td className={td}>{nf(r.v[s])}</td>
                    <td className={td}>{pst(r.a0, 1)}</td><td className={td}>{pst(r.a1, 1)}</td>
                    <td className={td} style={{ color: endringFarge(r.a1 - r.a0) }}>{fortegn(r.a1 - r.a0, 1, ' pp')}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--nmbu-neutral-3)', fontWeight: 700 }}>
                  <td /><td className={tdV}>Sum</td><td className={td}>{nf(tot[0])}</td><td className={td}>{nf(tot[s])}</td><td colSpan={3} />
                </tr>
              </tbody>
            </table>
            {tabell.length > 15 && (
              <button onClick={() => setVisAlle(!visAlle)} className="mt-2 text-xs underline" style={{ color: 'var(--nmbu-green-dark)' }}>
                {visAlle ? 'Vis de 15 største' : `Vis alle ${tabell.length} institusjoner`}
              </button>
            )}
          </div>
        )}
    </Kort>
  );
}

