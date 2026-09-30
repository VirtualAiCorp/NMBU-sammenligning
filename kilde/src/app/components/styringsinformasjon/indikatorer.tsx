/**
 * Tabell over institusjonene (DBH 902 og 750) med NMBU uthevet, sorterbar per kolonne og med NMBUs plass nederst.
 * Brukes av både «Økonomi og drift» og «Utdanning».
 */
import { useMemo, useState } from 'react';
import { ECON_UNITS, type EconUnit, type EconYear } from '../../data/economyData';
import { Hoderad, Rad, TD, TDV, TH, THV, Tabell } from './felles';

export type Kol = { id: string; navn: string; tittel: string; v: (u: EconUnit) => { v: number | null; aar: number | null }; fmt: (v: number) => string; hoyErBra?: boolean };
export const sisteMed = (u: EconUnit, f: (y: EconYear) => number | null) => { for (let i = u.years.length - 1; i >= 0; i--) { const v = f(u.years[i]); if (v != null) return { v, aar: u.years[i].aar }; } return { v: null, aar: null }; };
export const kd = (id: string) => (u: EconUnit) => { const a = Object.keys(u.ind[id] ?? {}).sort().pop(); return a ? { v: u.ind[id][a][0], aar: Number(a) } : { v: null, aar: null }; };
export function IndikatorTabell({ kolonner, standard }: { kolonner: Kol[]; standard: string }) {
  const [sort, setSort] = useState(standard);
  const rader = useMemo(() => {
    const r = ECON_UNITS.map((u) => ({ u, verdi: Object.fromEntries(kolonner.map((k) => [k.id, k.v(u)])) as Record<string, { v: number | null; aar: number | null }> }));
    return r.sort((a, b) => (b.verdi[sort].v ?? -Infinity) - (a.verdi[sort].v ?? -Infinity));
  }, [kolonner, sort]);
  const plass = (id: string) => {
    const med = rader.filter((r) => r.verdi[id].v != null).sort((a, b) => (b.verdi[id].v as number) - (a.verdi[id].v as number));
    const i = med.findIndex((r) => r.u.isNmbu);
    return i < 0 ? '–' : `${i + 1} av ${med.length}`;
  };
  const aarene = (id: string) => [...new Set(rader.map((r) => r.verdi[id].aar).filter((a): a is number => a != null))].sort();
  return (
    <>
      <Tabell minBredde={720}>
        <Hoderad>
          <th style={THV}>Institusjon</th>
          {kolonner.map((k) => {
            const a = aarene(k.id);
            return (
              <th key={k.id} style={{ ...TH, whiteSpace: 'normal', minWidth: 92, cursor: 'pointer', color: sort === k.id ? 'var(--nmbu-neutral)' : TH.color }} title={`${k.tittel}. Klikk for å sortere.`}
                onClick={() => setSort(k.id)} aria-sort={sort === k.id ? 'descending' : undefined}>
                {k.navn}{sort === k.id ? ' ↓' : ''}<br /><span style={{ fontWeight: 400 }}>{a.length ? (a[0] === a[a.length - 1] ? a[0] : `${a[0]}–${a[a.length - 1]}`) : ''}</span>
              </th>
            );
          })}
        </Hoderad>
        <tbody>
          {rader.map((r) => (
            <Rad key={r.u.id} uthev={r.u.isNmbu}>
              <td style={TDV}>{r.u.kort}</td>
              {kolonner.map((k) => {
                const x = r.verdi[k.id];
                const sisteAar = aarene(k.id).pop();
                return <td key={k.id} style={TD} title={x.aar && x.aar !== sisteAar ? `Tall for ${x.aar}` : undefined}>{x.v == null ? '–' : k.fmt(x.v)}{x.aar && sisteAar && x.aar !== sisteAar ? <sup style={{ color: 'var(--nmbu-neutral-2)' }}> {x.aar}</sup> : null}</td>;
              })}
            </Rad>
          ))}
          <Rad sum>
            <td style={TDV}>NMBUs plass</td>
            {kolonner.map((k) => <td key={k.id} style={TD}>{plass(k.id)}</td>)}
          </Rad>
        </tbody>
      </Tabell>
      <div className="mt-1" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>Plass regnet fra høyeste verdi. Siste år med tall for hver institusjon; eldre tall er merket med året.</div>
    </>
  );
}

