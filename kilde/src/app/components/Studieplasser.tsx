import { useEffect, useState } from 'react';
import { Armchair } from 'lucide-react';
import type { LandsamGroup } from '../data/landsamAdmissionData';

/**
 * Studieplasser 2016–2026 fra Samordna-katalogen (scripts/fetch-samordna-katalog.py → public/studieplasser/data.json),
 * koblet på studiekoden, og om programmet var på lista over ledige plasser i 2026. Lastes først når kortet vises.
 */
interface Program { plasser: Record<string, number>; nytt?: string; nedlagt?: boolean; sisteAar?: string; avlyst?: boolean; ledig2026?: boolean }
interface Data { hentet: string; merknader?: string | string[]; program: Record<string, Program> }

let last: Promise<Data | null> | null = null;
const hent = () => (last ??= fetch(`${import.meta.env.BASE_URL}studieplasser/data.json`).then((r) => (r.ok ? r.json() : null)).catch(() => { last = null; return null; }));

const AAR = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
const VIS = ['2016', '2020', '2024', '2025', '2026'];
const nf = (v: number) => v.toLocaleString('nb-NO');

function Spark({ verdier, farge }: { verdier: (number | undefined)[]; farge: string }) {
  const tall = verdier.filter((v): v is number => v != null);
  if (tall.length < 2) return null;
  const maks = Math.max(...tall), min = Math.min(...tall), b = 88, h = 22;
  const x = (i: number) => (i / (verdier.length - 1)) * (b - 4) + 2;
  const y = (v: number) => (maks === min ? h / 2 : h - 3 - ((v - min) / (maks - min)) * (h - 6));
  const punkter = verdier.map((v, i) => (v == null ? null : `${x(i)},${y(v)}`)).filter(Boolean).join(' ');
  const siste = verdier.length - 1 - [...verdier].reverse().findIndex((v) => v != null);
  return (
    <svg width={b} height={h} viewBox={`0 0 ${b} ${h}`} aria-hidden className="inline-block align-middle">
      <polyline points={punkter} fill="none" stroke={farge} strokeWidth={1.6} strokeLinejoin="round" />
      {verdier[siste] != null && <circle cx={x(siste)} cy={y(verdier[siste]!)} r={2.4} fill={farge} />}
    </svg>
  );
}

export function Studieplasser({ group, colorFor }: { group: LandsamGroup; colorFor: (id: string) => string }) {
  const [data, setData] = useState<Data | null | undefined>(undefined);
  useEffect(() => { let aktiv = true; hent().then((d) => { if (aktiv) setData(d); }); return () => { aktiv = false; }; }, []);
  if (!data) return null;
  const rader = group.entries
    .filter((e) => !e.lokaltOpptak && e.studiekode && data.program[e.studiekode])
    .map((e) => ({ e, p: data.program[e.studiekode!], nmbu: group.nmbuIds.includes(e.id) }))
    .sort((a, b) => Number(b.nmbu) - Number(a.nmbu) || (b.p.plasser['2026'] ?? 0) - (a.p.plasser['2026'] ?? 0));
  if (!rader.length) return null;
  const ledige = rader.filter((r) => r.p.ledig2026).length;
  const th = 'px-3 py-2 text-right whitespace-nowrap';
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex items-center gap-2 mb-1" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>
        <Armchair className="w-4 h-4" /> Studieplasser 2016–2026
      </div>
      <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginBottom: 10 }}>
        Studieplasser i Samordna opptak per år. {ledige > 0
          ? `${ledige} av ${rader.length} program i gruppen sto på Samordnas liste over ledige studieplasser i 2026.`
          : `Ingen av programmene i gruppen sto på Samordnas liste over ledige studieplasser i 2026.`}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
              <th className="px-3 py-2 text-left">Program</th>
              <th className="px-3 py-2 text-left">2016–2026</th>
              {VIS.map((a) => <th key={a} className={th}>{a}</th>)}
              <th className={th} title="Endring fra første til siste år med plasser">Endring</th>
              <th className="px-3 py-2 text-left" title="På Samordnas liste over ledige studieplasser etter hovedopptaket 2026">Ledige plasser 2026</th>
            </tr>
          </thead>
          <tbody>
            {rader.map(({ e, p, nmbu }) => {
              const serie = AAR.map((a) => p.plasser[a]);
              const forste = AAR.find((a) => p.plasser[a] != null);
              const sisteAar = [...AAR].reverse().find((a) => p.plasser[a] != null);
              const endring = forste && sisteAar && forste !== sisteAar ? p.plasser[sisteAar] - p.plasser[forste] : null;
              const farge = colorFor(e.id);
              return (
                <tr key={e.id} style={{ borderTop: '1px solid var(--nmbu-neutral-3)', fontWeight: nmbu ? 700 : 400 }}>
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ backgroundColor: farge }} />
                    {e.shortName}{e.studiested ? <span style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 400 }}> · {e.studiested}</span> : null}
                    {p.nytt && p.nytt !== '2016' && <span className="ml-1.5 px-1.5 rounded text-[10px]" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>ny fra {p.nytt}</span>}
                    {p.nedlagt && <span className="ml-1.5 px-1.5 rounded text-[10px]" style={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontWeight: 600 }}>ikke lyst ut etter {p.sisteAar}</span>}
                  </td>
                  <td className="px-3 py-1"><Spark verdier={serie} farge={farge} /></td>
                  {VIS.map((a) => <td key={a} className="px-3 py-1.5 text-right">{p.plasser[a] != null ? nf(p.plasser[a]) : '–'}</td>)}
                  <td className="px-3 py-1.5 text-right" style={{ color: endring == null || endring === 0 ? 'var(--nmbu-neutral-2)' : endring > 0 ? '#047857' : '#b91c1c' }}>
                    {endring == null ? '–' : `${endring > 0 ? '+' : ''}${nf(endring)}`}
                  </td>
                  <td className="px-3 py-1.5">
                    {p.ledig2026
                      ? <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 600 }}>På lista</span>
                      : <span style={{ color: 'var(--nmbu-neutral-2)' }}>–</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
        Kilde: Samordna opptak, studiekatalogen for hvert år (hentet {data.hentet.slice(0, 10).split('-').reverse().join('.')}). «På lista» betyr at programmet
        var merket med ledige plasser i 2026-opptaket; Samordna nullstiller merket når opptaket arkiveres, så tidligere år finnes ikke.
      </div>
    </div>
  );
}
