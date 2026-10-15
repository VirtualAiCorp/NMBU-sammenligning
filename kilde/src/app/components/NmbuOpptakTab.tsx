import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Info } from 'lucide-react';
import { LETTERS, nf, sumPacked, type Packed, type Stats } from './NmbuCourseExplorer';

/**
 * Fanen «Opptak per studieprogram» i «Alle emner ved NMBU»: karakterene på emnet per studieprogram sett mot
 * opptakskvaliteten (snitt opptakspoeng og karakterpoeng for dem som møtte, DBH tabell 571) og kravkoden fra
 * Samordna opptak. Data: kilde/public/nmbu-opptak.json (scripts/build-nmbu-opptak.py).
 */

type Poeng = [number, number, number] | null; // [antall, sum opptakspoeng, sum karakterpoeng]
interface Program {
  opptak: 'N' | 'L'; navn?: string; soKode?: string | null; soNavn?: string | null; url?: string | null;
  krav?: Record<string, string>; grenser?: Record<string, { ORD?: number; ORDF?: number }>;
  poeng?: Record<string, { mott: Poeng; alle: Poeng }>;
}
interface Opptak { generert: string; kilde: string; aar: string[]; kravkoder: Record<string, { navn: string; tekst: string }>; programmer: Record<string, Program> }

export interface ProgramInn { pk: string; navn: string; nivaa: string | null; fakultet: string | null; byYear: Record<string, Packed> }
interface ProgramRad extends Omit<ProgramInn, 'byYear'> { s: Stats }

const ALLE = 'alle';
const LOKALT = 'Lokalt';
const UKJENT = 'Ukjent';
// Rekkefølge for kravkodene: generell studiekompetanse først, så økende tilleggskrav.
const KRAV_ORD = ['GENS', 'ENG4', 'MATTE4', 'MATRS', 'MATTEK', 'REALFA', 'LÆREAL', 'SIVING', 'VETE', LOKALT, UKJENT];
const kravRang = (k: string) => { const i = KRAV_ORD.indexOf(k); return i < 0 ? KRAV_ORD.length - 2 : i; };

interface Rad extends ProgramRad {
  krav: string; kravEndring: string | null; opptakspoeng: number | null; karakterpoeng: number | null;
  mott: number; grense: number | null; grenseAlle: boolean; url: string | null;
}
type Kol = 'navn' | 'kand' | 'snitt' | 'stryk' | 'krav' | 'opptak' | 'karakter' | 'grense' | 'mott';

function sammenlign(a: number | string | null, b: number | string | null, retning: 1 | -1) {
  if (a == null && b == null) return 0;
  if (a == null) return 1; // tomme celler alltid nederst
  if (b == null) return -1;
  return (typeof a === 'string' ? a.localeCompare(b as string, 'nb') : a - (b as number)) * retning;
}

function Sorterbar({ id, label, sort, setSort, hoyre = true, title }: {
  id: Kol; label: string; sort: { kol: Kol; retning: 1 | -1 }; setSort: (s: { kol: Kol; retning: 1 | -1 }) => void; hoyre?: boolean; title?: string;
}) {
  const aktiv = sort.kol === id;
  const Ikon = !aktiv ? ArrowUpDown : sort.retning === 1 ? ArrowUp : ArrowDown;
  return (
    <th className={`px-3 py-2 ${hoyre ? 'text-right' : 'text-left'}`} aria-sort={aktiv ? (sort.retning === 1 ? 'ascending' : 'descending') : 'none'}
      style={{ color: aktiv ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>
      <button title={title} onClick={() => setSort({ kol: id, retning: aktiv ? (sort.retning === 1 ? -1 : 1) : (id === 'navn' || id === 'krav' ? 1 : -1) })}
        className={`inline-flex items-center gap-1 ${hoyre ? 'flex-row-reverse' : ''}`} style={{ font: 'inherit', color: 'inherit' }}>
        <Ikon className="w-3 h-3" style={{ opacity: aktiv ? 1 : 0.45 }} />{label}
      </button>
    </th>
  );
}

function KravBadge({ kode, kravkoder }: { kode: string; kravkoder: Opptak['kravkoder'] }) {
  const k = kravkoder[kode];
  const lokal = kode === LOKALT || kode === UKJENT;
  return (
    <span title={k ? `${k.navn}\n${k.tekst}` : kode === LOKALT ? 'Lokalt opptak (ikke Samordna opptak): opptak på grunnlag av tidligere utdanning, ikke kravkode' : 'Ikke funnet hos Samordna opptak'}
      className="inline-block px-1.5 py-0.5 rounded font-mono" style={{
        fontSize: 11, fontWeight: 700, cursor: 'help', whiteSpace: 'nowrap',
        backgroundColor: lokal ? 'transparent' : 'var(--nmbu-green-4)', color: lokal ? 'var(--nmbu-neutral-2)' : 'var(--nmbu-green-dark)',
        border: `1px ${lokal ? 'dashed' : 'solid'} var(--nmbu-neutral-3)`,
      }}>{kode}</span>
  );
}

/**
 * Ett årsvalg styrer både karakterene på emnet og opptakstallene: «Alle» = alle år med karakterdata (summert),
 * ellers karakterene i det året og opptakskullet samme år. Starter på årsvalget øverst på siden.
 */
export function NmbuOpptakTab({ programmer, helt, karakterAar, startAar }: {
  programmer: ProgramInn[]; helt: Record<string, Packed>; karakterAar: string[]; startAar: string;
}) {
  const [data, setData] = useState<Opptak | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [kull, setKull] = useState<string>(startAar);
  useEffect(() => { setKull(startAar); }, [startAar]);
  const [sort, setSort] = useState<{ kol: Kol; retning: 1 | -1 }>({ kol: 'kand', retning: -1 });
  const [sortKrav, setSortKrav] = useState<{ kol: Kol; retning: 1 | -1 }>({ kol: 'krav', retning: 1 });

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}nmbu-opptak.json`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setData).catch((e) => setFeil(String(e)));
  }, []);

  // Opptaksårene som brukes ved «Alle»: de samme årene som har karakterdata
  const kullListe = (data?.aar ?? []).filter((y) => karakterAar.includes(y));
  const allePeriode = karakterAar.length ? `${karakterAar[0]}–${karakterAar[karakterAar.length - 1]}` : '';
  const periode = kull === ALLE ? allePeriode : kull;
  const whole = useMemo(() => sumPacked(helt, kull), [helt, kull]);
  const rader: ProgramRad[] = useMemo(() => programmer
    .map(({ byYear, ...r }) => ({ ...r, s: sumPacked(byYear, kull) }))
    .filter((r) => r.s.total > 0), [programmer, kull]);

  const tabell: Rad[] = useMemo(() => {
    if (!data) return [];
    return rader.map((r) => {
      const p = data.programmer[r.pk];
      const aarene = kull === ALLE ? kullListe : [kull];
      let n = 0, op = 0, kp = 0;
      aarene.forEach((y) => { const m = p?.poeng?.[y]?.mott; if (m && m[0]) { n += m[0]; op += m[1]; kp += m[2]; } });
      const kravAar = Object.keys(p?.krav ?? {}).sort();
      const sisteKrav = kravAar.length ? p!.krav![kravAar[kravAar.length - 1]] : null;
      // «Alle»: kravet som gjaldt for det siste kullet i perioden (ikke et nyere krav som ennå ikke har studenter)
      const kravValgt = (kull === ALLE ? p?.krav?.[kullListe[kullListe.length - 1]] : p?.krav?.[kull]) ?? sisteKrav;
      // Endring i kravkode over tid, f.eks. «GENS til 2024, MATRS fra 2025»
      let kravEndring: string | null = null;
      if (kravAar.length > 1) {
        const skift = kravAar.filter((y, i) => i > 0 && p!.krav![y] !== p!.krav![kravAar[i - 1]]);
        if (skift.length) kravEndring = skift.map((y) => `${p!.krav![kravAar[kravAar.indexOf(y) - 1]]} → ${p!.krav![y]} fra ${y}`).join(', ');
      }
      const g = kull === ALLE ? p?.grenser?.[kullListe[kullListe.length - 1]] : p?.grenser?.[kull];
      const krav = p?.opptak === 'L' ? LOKALT : kravValgt ?? UKJENT;
      return {
        ...r, krav, kravEndring, mott: n, url: p?.url ?? null,
        opptakspoeng: n ? op / n : null, karakterpoeng: n ? kp / n : null,
        grense: g?.ORD != null && g.ORD > 0 ? g.ORD : null, grenseAlle: g?.ORD === 0,
      };
    });
  }, [data, rader, kull, kullListe]);

  const verdi = (r: Rad, k: Kol): number | string | null => ({
    navn: r.navn, kand: r.s.total, snitt: r.s.snitt, stryk: r.s.stryk, krav: kravRang(r.krav) * 1000 + (r.s.total ? -r.s.total / 1e6 : 0),
    opptak: r.opptakspoeng, karakter: r.karakterpoeng, grense: r.grense, mott: r.mott || null,
  } as Record<Kol, number | string | null>)[k];
  const sortert = useMemo(() => [...tabell].sort((a, b) => sammenlign(verdi(a, sort.kol), verdi(b, sort.kol), sort.retning) || b.s.total - a.s.total), [tabell, sort]);

  // Samlet per kravkode: karakterene summeres over programmene, opptakspoeng vektes med antall som møtte.
  const perKrav = useMemo(() => {
    const m = new Map<string, { krav: string; program: number; counts: Record<string, number>; total: number; skjult: number; n: number; op: number; kp: number }>();
    tabell.forEach((r) => {
      const e = m.get(r.krav) ?? { krav: r.krav, program: 0, counts: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }, total: 0, skjult: 0, n: 0, op: 0, kp: 0 };
      e.program += 1; e.total += r.s.total; e.skjult += r.s.skjult;
      LETTERS.forEach((g) => { e.counts[g] += r.s.counts[g]; });
      if (r.opptakspoeng != null) { e.n += r.mott; e.op += r.opptakspoeng * r.mott; e.kp += (r.karakterpoeng ?? 0) * r.mott; }
      m.set(r.krav, e);
    });
    return [...m.values()].map((e) => {
      const letters = LETTERS.reduce((s, g) => s + e.counts[g], 0);
      return { ...e, letters, snitt: letters ? LETTERS.reduce((s, g, i) => s + (5 - i) * e.counts[g], 0) / letters : null,
        stryk: letters ? (e.counts.F / letters) * 100 : null, opptakspoeng: e.n ? e.op / e.n : null, karakterpoeng: e.n ? e.kp / e.n : null };
    });
  }, [tabell]);
  const perKravSortert = useMemo(() => [...perKrav].sort((a, b) => {
    const v = (x: typeof a): number | string | null => ({ krav: kravRang(x.krav), navn: x.krav, kand: x.total, snitt: x.snitt, stryk: x.stryk,
      opptak: x.opptakspoeng, karakter: x.karakterpoeng, grense: null, mott: x.program } as Record<Kol, number | string | null>)[sortKrav.kol];
    return sammenlign(v(a), v(b), sortKrav.retning) || b.total - a.total;
  }), [perKrav, sortKrav]);

  if (feil) return <div className="mt-3 text-xs" style={{ color: '#c13a5a' }}>Kunne ikke laste nmbu-opptak.json: {feil}</div>;
  if (!data) return <div className="mt-3 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>Laster opptaksdata …</div>;

  const celle = (v: number | null, dec = 1) => (v != null ? nf(v, dec) : '–');

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }} title="Velger både året for karakterene på emnet og opptakskullet">År (karakterer og opptakskull):</span>
        {[ALLE, ...[...karakterAar].reverse()].map((y) => (
          <button key={y} onClick={() => setKull(y)} className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: kull === y ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)', color: kull === y ? '#fff' : 'var(--nmbu-neutral-1)', border: '1px solid ' + (kull === y ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)') }}>
            {y === ALLE ? `Alle (${allePeriode})` : y}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
              <Sorterbar id="navn" label="Studieprogram" sort={sort} setSort={setSort} hoyre={false} />
              <Sorterbar id="kand" label="Kand." sort={sort} setSort={setSort} title="Kandidater på emnet (valgt år øverst)" />
              <Sorterbar id="snitt" label="Snitt" sort={sort} setSort={setSort} title="Karaktersnitt på emnet, A=5 … F=0" />
              <Sorterbar id="stryk" label="Stryk" sort={sort} setSort={setSort} />
              <Sorterbar id="krav" label="Kravkode" sort={sort} setSort={setSort} hoyre={false} title="Opptakskrav hos Samordna opptak (GENS = generell studiekompetanse)" />
              <Sorterbar id="opptak" label="Opptakspoeng" sort={sort} setSort={setSort} title="Snitt konkurransepoeng ved opptak for dem som møtte til studiestart (DBH 571)" />
              <Sorterbar id="karakter" label="Karakterpoeng" sort={sort} setSort={setSort} title="Snitt karakterpoeng (karaktersnitt × 10 + realfags- og språkpoeng) for dem som møtte" />
              <Sorterbar id="grense" label="Poenggrense" sort={sort} setSort={setSort} title="Poenggrense i ordinær kvote (siste år i perioden). «Alle» = alle kvalifiserte fikk tilbud" />
              <Sorterbar id="mott" label="Møtt" sort={sort} setSort={setSort} title="Antall som møtte til studiestart (grunnlaget for snittet)" />
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-green-4)' }}>
              <td className="px-3 py-2" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>Hele emnet</td>
              <td className="px-3 py-2 text-right" style={{ fontWeight: 700 }}>{whole.total.toLocaleString('nb-NO')}</td>
              <td className="px-3 py-2 text-right" style={{ fontWeight: 700 }}>{celle(whole.snitt, 2)}</td>
              <td className="px-3 py-2 text-right" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{whole.stryk != null ? `${nf(whole.stryk, 1)} %` : '–'}</td>
              <td colSpan={5} />
            </tr>
            {sortert.map((r) => (
              <tr key={r.pk} style={{ borderBottom: '1px solid var(--nmbu-beige-light)' }}>
                <td className="px-3 py-2">
                  <div style={{ fontWeight: 600, color: 'var(--nmbu-neutral-1)' }}>{r.navn}</div>
                  <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{r.pk}{r.nivaa ? ` · ${r.nivaa}` : ''}</div>
                </td>
                <td className="px-3 py-2 text-right" style={{ fontWeight: 600 }}>{r.s.total.toLocaleString('nb-NO')}</td>
                <td className="px-3 py-2 text-right">{celle(r.s.snitt, 2)}</td>
                <td className="px-3 py-2 text-right" style={{ whiteSpace: 'nowrap' }}>{r.s.stryk != null ? `${r.s.skjult ? '≥ ' : ''}${nf(r.s.stryk, 1)} %` : '–'}</td>
                <td className="px-3 py-2">
                  <KravBadge kode={r.krav} kravkoder={data.kravkoder} />
                  {r.kravEndring && <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', marginTop: 2, whiteSpace: 'nowrap' }}>{r.kravEndring}</div>}
                </td>
                <td className="px-3 py-2 text-right" style={{ fontWeight: 600 }}>{celle(r.opptakspoeng)}</td>
                <td className="px-3 py-2 text-right">{celle(r.karakterpoeng)}</td>
                <td className="px-3 py-2 text-right" style={{ whiteSpace: 'nowrap' }}>{r.grense != null ? nf(r.grense, 1) : r.grenseAlle ? 'Alle' : '–'}</td>
                <td className="px-3 py-2 text-right" style={{ color: 'var(--nmbu-neutral-2)' }}>{r.mott ? r.mott.toLocaleString('nb-NO') : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Samlet per kravkode */}
      <div className="mt-6" style={{ fontSize: 13, fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>Samlet per kravkode</div>
      <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginBottom: 6 }}>
        Karakterene på emnet summert over programmene med samme kravkode. Opptakspoeng er vektet med antall som møtte.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
              <Sorterbar id="krav" label="Kravkode" sort={sortKrav} setSort={setSortKrav} hoyre={false} />
              <th className="px-3 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Hva kravet betyr</th>
              <Sorterbar id="mott" label="Program" sort={sortKrav} setSort={setSortKrav} />
              <Sorterbar id="kand" label="Kand." sort={sortKrav} setSort={setSortKrav} />
              <Sorterbar id="snitt" label="Snitt" sort={sortKrav} setSort={setSortKrav} />
              <Sorterbar id="stryk" label="Stryk" sort={sortKrav} setSort={setSortKrav} />
              <Sorterbar id="opptak" label="Opptakspoeng" sort={sortKrav} setSort={setSortKrav} />
              <Sorterbar id="karakter" label="Karakterpoeng" sort={sortKrav} setSort={setSortKrav} />
            </tr>
          </thead>
          <tbody>
            {perKravSortert.map((k) => {
              const forkl = data.kravkoder[k.krav];
              return (
                <tr key={k.krav} style={{ borderBottom: '1px solid var(--nmbu-beige-light)' }}>
                  <td className="px-3 py-2"><KravBadge kode={k.krav} kravkoder={data.kravkoder} /></td>
                  <td className="px-3 py-2" style={{ color: 'var(--nmbu-neutral-1)', minWidth: 220 }}>
                    <div style={{ fontWeight: 600 }}>{forkl?.navn ?? (k.krav === LOKALT ? 'Lokalt opptak' : 'Ikke funnet hos Samordna opptak')}</div>
                    <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', whiteSpace: 'pre-line' }}>
                      {forkl?.tekst ?? (k.krav === LOKALT ? 'Toårige master, enkeltemner o.l. Opptak på grunnlag av tidligere utdanning; DBH har ikke opptakspoeng.' : 'Programmet er avviklet eller har annet navn hos SO.')}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">{k.program}</td>
                  <td className="px-3 py-2 text-right" style={{ fontWeight: 600 }}>{k.total.toLocaleString('nb-NO')}</td>
                  <td className="px-3 py-2 text-right">{celle(k.snitt, 2)}</td>
                  <td className="px-3 py-2 text-right" style={{ whiteSpace: 'nowrap' }}>{k.stryk != null ? `${k.skjult ? '≥ ' : ''}${nf(k.stryk, 1)} %` : '–'}</td>
                  <td className="px-3 py-2 text-right" style={{ fontWeight: 600 }}>{celle(k.opptakspoeng)}</td>
                  <td className="px-3 py-2 text-right">{celle(k.karakterpoeng)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>


      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3 mt-4"
        style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Opptakspoeng og karakterpoeng: DBH/HKDIR tabell 571, høstopptak via Samordna opptak, snitt for dem som møtte til studiestart i
          opptakskullet ({periode}). Årsvalget gjelder både karakterene på emnet og opptakskullet; ved «Alle» summeres karakterene for alle årene og opptakstallene vektes over de samme kullene. Opptakspoeng er konkurransepoengene (karakterpoeng + alders- og tilleggspoeng); karakterpoeng er
          karaktersnitt × 10 + realfags- og språkpoeng. Kravkode og poenggrense: Samordna opptak (søkerportalen), hentet {data.generert}.
          Toårige master og andre program med lokalt opptak har ikke poeng i DBH. Studentene på emnet ble ofte tatt opp året før (for eksempel når emnet tas i vårsemesteret i første studieår);
          tallene viser opptakskvaliteten i programmet, ikke for akkurat disse studentene.
        </span>
      </div>
    </div>
  );
}
