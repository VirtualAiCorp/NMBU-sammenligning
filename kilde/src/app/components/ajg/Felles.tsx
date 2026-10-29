/** Felles småkomponenter for AJG-sidene: sorterbar tabell, chip-velgere, verktøytips, nivåmerke og CSV-knapp. */
import { useMemo, useState, type ReactNode } from 'react';
import { ArrowUpDown, Download, Info } from '../../ikoner';
import { NIVA_FARGE, NIV, nf, type Niva } from './data';

export type Kol<R> = {
  navn: ReactNode; /** sorteringsverdi (og CSV-verdi hvis csv mangler) */ v: (r: R) => number | string | null | undefined;
  vis?: (r: R) => ReactNode; venstre?: boolean; bred?: boolean; tittel?: string;
};

/** Sorterbar tabell. `fast` er rader som alltid står øverst (f.eks. totaler), `klasse` gir radklasse. */
export function SortTabell<R>({ kol, rader, standard, synkende = true, hoy, klasse, fast = [] }: {
  kol: Kol<R>[]; rader: R[]; standard?: number; synkende?: boolean; hoy?: boolean; klasse?: (r: R) => string | undefined; fast?: R[];
}) {
  const [sort, setSort] = useState<{ i: number; ned: boolean } | null>(standard != null ? { i: standard, ned: synkende } : null);
  const sortert = useMemo(() => {
    if (!sort) return rader;
    const f = kol[sort.i].v;
    return [...rader].sort((a, b) => {
      const x = f(a), y = f(b);
      if (x == null && y == null) return 0;
      if (x == null) return 1;
      if (y == null) return -1;
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'nb');
      return sort.ned ? -c : c;
    });
  }, [rader, sort, kol]);
  const rad = (r: R, i: number, fastRad: boolean) => (
    <tr key={(fastRad ? 'f' : 'r') + i} className={klasse?.(r)}>
      {kol.map((k, j) => (
        <td key={j} className={k.bred ? 'ajg-v' : undefined} style={k.venstre ? { textAlign: 'left' } : undefined}>
          {k.vis ? k.vis(r) : fmt(k.v(r))}
        </td>
      ))}
    </tr>
  );
  return (
    <div className={`ajg-tabellramme ${hoy ? 'ajg-hoy' : ''}`}>
      <table className="ajg-tabell">
        <thead>
          <tr>
            {kol.map((k, i) => (
              <th key={i} title={k.tittel} style={k.venstre ? { textAlign: 'left' } : undefined} aria-sort={sort?.i === i ? (sort.ned ? 'descending' : 'ascending') : undefined}>
                <button type="button" onClick={() => setSort((s) => ({ i, ned: s?.i === i ? !s.ned : typeof k.v(rader[0]) === 'number' }))}>
                  {k.navn}{sort?.i === i ? (sort.ned ? ' ↓' : ' ↑') : ''}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fast.map((r, i) => rad(r, i, true))}
          {sortert.map((r, i) => rad(r, i, false))}
        </tbody>
      </table>
    </div>
  );
}
const fmt = (v: number | string | null | undefined) => (v == null ? '–' : typeof v === 'number' ? nf(v, Number.isInteger(v) ? 0 : 1) : v);

export function Chips<T extends string>({ valg, verdi, onChange, etikett, farge }: {
  valg: { id: T; label: string }[]; verdi: T[]; onChange: (v: T[]) => void; etikett: string; farge?: (id: T) => string;
}) {
  return (
    <div className="ajg-filter" role="group" aria-label={etikett}>
      {valg.map((v) => {
        const pa = verdi.includes(v.id);
        return (
          <button key={v.id} type="button" className="ajg-chip" aria-pressed={pa}
            onClick={() => onChange(pa ? verdi.filter((x) => x !== v.id) : [...verdi, v.id])}>
            {farge && <span className="ajg-chip-prikk" style={{ background: farge(v.id) }} aria-hidden />}{v.label}
          </button>
        );
      })}
    </div>
  );
}

export function Velg<T extends string>({ valg, verdi, onChange, etikett }: { valg: { id: T; label: string }[]; verdi: T; onChange: (v: T) => void; etikett: string }) {
  return (
    <select className="ajg-velg" aria-label={etikett} value={verdi} onChange={(e) => onChange(e.target.value as T)}>
      {valg.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
    </select>
  );
}

export function CsvKnapp({ onClick }: { onClick: () => void }) {
  return <button type="button" className="ajg-lenkeknapp" onClick={onClick} title="Last ned som CSV (åpnes i Excel)"><Download className="w-3.5 h-3.5" />CSV</button>;
}

export function Notis({ children, ikon: Ikon = Info }: { children: ReactNode; ikon?: typeof Info }) {
  return <div className="ajg-notis"><Ikon className="w-4 h-4" aria-hidden /><div>{children}</div></div>;
}

export function NivaMerke({ n }: { n: Niva | null | undefined }) {
  if (!n) return <span className="ajg-dempet">–</span>;
  return <span className={`ajg-niva ajg-niva-${n === '4*' ? '4s' : n}`}>{n}</span>;
}

/** Stablet stripe med nivåfordelingen 1–4* (andeler i prosent, tall i feltene når de får plass). */
export function NivaStripe({ niva }: { niva: Record<Niva, number> | undefined }) {
  if (!niva) return null;
  const n = NIV.reduce((a, k) => a + niva[k], 0);
  if (!n) return null;
  return (
    <div className="ajg-stripe" role="img" aria-label={NIV.map((k) => `AJG ${k}: ${nf(100 * niva[k] / n)} %`).join(', ')}>
      {NIV.map((k) => {
        const p = 100 * niva[k] / n;
        return p > 0 ? (
          <span key={k} style={{ width: `${p}%`, background: NIVA_FARGE[k], color: k === '1' || k === '2' ? 'var(--af-fg)' : '#fff' }} title={`AJG ${k}: ${niva[k]} (${nf(p)} %)`}>
            {p >= 8 ? nf(p) : ''}
          </span>
        ) : null;
      })}
    </div>
  );
}

export function NivaForklaring() {
  return (
    <div className="ajg-forklaring">
      {NIV.map((k) => <span key={k}><span className="ajg-chip-prikk" style={{ background: NIVA_FARGE[k], borderRadius: 3 }} />AJG {k}</span>)}
    </div>
  );
}

export function Forklaring({ punkter }: { punkter: { navn: string; farge: string; stiplet?: boolean }[] }) {
  return (
    <div className="ajg-forklaring">
      {punkter.map((p) => (
        <span key={p.navn}>
          <span style={{ width: 14, height: 0, borderTop: `2px ${p.stiplet ? 'dashed' : 'solid'} ${p.farge}`, display: 'inline-block' }} />{p.navn}
        </span>
      ))}
    </div>
  );
}

/** Innhold i recharts-verktøytips. */
export function Tips({ tittel, linjer }: { tittel: ReactNode; linjer: { navn: string; verdi: string; farge?: string }[] }) {
  return (
    <div className="ajg-tooltip">
      <div><b>{tittel}</b></div>
      {linjer.map((l) => (
        <div key={l.navn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {l.farge && <span className="ajg-chip-prikk" style={{ background: l.farge }} />}<span>{l.navn}</span><span style={{ marginLeft: 'auto', paddingLeft: 12, fontVariantNumeric: 'tabular-nums' }}>{l.verdi}</span>
        </div>
      ))}
    </div>
  );
}

export function SorterHint() {
  return <span className="ajg-liten" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowUpDown className="w-3 h-3" />Klikk på en kolonne for å sortere</span>;
}
