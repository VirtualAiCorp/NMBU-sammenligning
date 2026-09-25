import { useState, type ReactNode } from 'react';
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { FacultyBase, FacultyId } from '../data/faculties';

/**
 * Sammenligningsmatrisen (varmekart over alle NMBU-program): brukes på forsiden i dashboard- og toppmenyoppsettet
 * og i oppsettlaben. Egen modul, slik at forsiden ikke laster oppsettlaben.
 */
export interface Rad {
  fak: FacultyBase; gruppe: string; gruppeLabel: string; program: string;
  pg: number | null; pgK: number | null; op: number | null; opK: number | null; sp: number | null; spK: number | null;
  norm: number | null; normK: number | null; fraf: number | null; frafK: number | null; kullAar: number | null; apent: boolean;
}
export const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
export const nf = (v: number | null | undefined, d = 1) => (v == null ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d }));

// ── Detaljpanelet under en rad (brukes også av oppsettlaben) ──
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--nmbu-green-dark)', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
export function MiniTrend({ fak, gruppe }: { fak: FacultyBase; gruppe: string }) {
  const g = fak.admissionGroups.find((x) => x.id === gruppe)!;
  const ents = g.entries.filter((e) => g.defaultIds.includes(e.id)).slice(0, 5);
  const data = ['2021', '2022', '2023', '2024', '2025', '2026'].map((y) => ({ y, ...Object.fromEntries(ents.map((e) => [e.id, e.years[y]?.pg_ord || null])) }));
  const col = ['#025C4F', '#2563EB', '#B45309', '#9333EA', '#DC2626'];
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="y" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} domain={['auto', 'auto']} />
        <Tooltip />
        {ents.map((e, i) => <Line key={e.id} dataKey={e.id} name={e.shortName} stroke={g.nmbuIds.includes(e.id) ? col[0] : col[(i % 4) + 1]} strokeWidth={g.nmbuIds.includes(e.id) ? 3 : 1.5} dot={false} connectNulls />)}
      </LineChart>
    </ResponsiveContainer>
  );
}
export function MiniBar({ data }: { data: { n: string; v: number; nmbu?: boolean }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(110, data.length * 22 + 20)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
        <XAxis type="number" hide /><YAxis type="category" dataKey="n" width={70} tick={{ fontSize: 9 }} />
        <Tooltip formatter={(v: number) => nf(v)} />
        <Bar dataKey="v" radius={[0, 3, 3, 0]} label={{ position: 'right', fontSize: 9, formatter: (v: number) => nf(v) }}>
          {data.map((d) => <Cell key={d.n} fill={d.nmbu ? '#025C4F' : '#9CA3AF'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
export const opMottData = (fak: FacultyBase, gruppe: string) => {
  const g = fak.admissionGroups.find((x) => x.id === gruppe)!;
  return g.entries.filter((e) => g.defaultIds.includes(e.id) && e.years['2025']?.op_mott != null)
    .map((e) => ({ n: e.shortName, v: e.years['2025']!.op_mott!, nmbu: g.nmbuIds.includes(e.id) })).sort((a, b) => b.v - a.v);
};

/** Én rad per NMBU-bachelor/femårig program: NMBU mot medianen av standardkonkurrentene (2025). */
export function lagRader(fakulteter: FacultyBase[]): Rad[] {
  const out: Rad[] = [];
  for (const fak of fakulteter) {
    for (const g of fak.admissionGroups) {
      if (g.level === 'master2' || !g.nmbuIds.length) continue;
      const nm = g.entries.find((e) => g.nmbuIds.includes(e.id));
      if (!nm) continue;
      const konk = g.entries.filter((e) => g.defaultIds.includes(e.id) && !g.nmbuIds.includes(e.id));
      const y = '2025';
      const v = (e: typeof nm, f: 'pg_ord' | 'op_mott') => { const x = e.years[y]?.[f]; return x == null || x === 0 ? null : x; };
      const sp = (e: typeof nm) => { const d = e.years[y]; return d?.fvS != null && d?.plasser ? d.fvS / d.plasser : null; };
      const cg = fak.completionGroups.find((c) => c.id === g.id);
      const cn = cg?.programs.find((p) => p.entryId === nm.id);
      const kull = cn ? [...cn.kull].reverse().find((k) => k.startkull > 0 && k.normertAar != null && k.normertAar <= 2025) : undefined;
      const kv = (entryId: string, f: 'fullfortNormert' | 'frafalt') => {
        const p = cg?.programs.find((x) => x.entryId === entryId); const k = p?.kull.find((x) => x.aar === kull?.aar);
        return k && k.startkull ? (k[f] / k.startkull) * 100 : null;
      };
      const med = (xs: (number | null)[]) => median(xs.filter((x): x is number => x != null));
      out.push({
        fak, gruppe: g.id, gruppeLabel: g.label, program: nm.shortName === 'NMBU' ? g.label : nm.shortName,
        pg: v(nm, 'pg_ord'), pgK: med(konk.map((e) => v(e, 'pg_ord'))),
        op: v(nm, 'op_mott'), opK: med(konk.map((e) => v(e, 'op_mott'))),
        sp: sp(nm), spK: med(konk.map(sp)),
        norm: kull ? kv(nm.id, 'fullfortNormert') : null, normK: kull ? med(konk.map((e) => kv(e.id, 'fullfortNormert'))) : null,
        fraf: kull ? kv(nm.id, 'frafalt') : null, frafK: kull ? med(konk.map((e) => kv(e.id, 'frafalt'))) : null,
        kullAar: kull?.aar ?? null, apent: nm.years[y]?.pg_ord === 0,
      });
    }
  }
  return out;
}

// ── 4: Sammenligningsmatrise (varmekart over alle NMBU-program) ─────────────
type Ind = { k: string; l: string; v: (r: Rad) => [number | null, number | null]; hoy: boolean; d: number; enhet?: string };
const INDIKATORER: Ind[] = [
  { k: 'pg', l: 'Poenggrense', v: (r) => [r.pg, r.pgK], hoy: true, d: 1 },
  { k: 'op', l: 'Snitt møtt', v: (r) => [r.op, r.opK], hoy: true, d: 1 },
  { k: 'sp', l: 'Søkerpress', v: (r) => [r.sp, r.spK], hoy: true, d: 2 },
  { k: 'norm', l: 'Fullført normert', v: (r) => [r.norm, r.normK], hoy: true, d: 0, enhet: ' %' },
  { k: 'fraf', l: 'Frafall', v: (r) => [r.fraf, r.frafK], hoy: false, d: 0, enhet: ' %' },
];
export function Matrise({ rader, onOpen, embedded }: { rader: Rad[]; onOpen?: (fakId: FacultyId, gruppe: string) => void; embedded?: boolean }) {
  const [aapen, setAapen] = useState<string | null>(null);
  const farge = (nm: number | null, k: number | null, hoy: boolean) => {
    if (nm == null || k == null || k === 0) return 'var(--nmbu-beige-light)';
    const diff = ((nm - k) / Math.abs(k)) * (hoy ? 1 : -1);
    const t = Math.min(1, Math.abs(diff) / 0.25);
    if (Math.abs(diff) < 0.03) return 'var(--nmbu-beige)';
    return diff > 0 ? `rgba(4, 120, 87, ${0.15 + 0.6 * t})` : `rgba(185, 28, 28, ${0.15 + 0.6 * t})`;
  };
  return (
    <div className={embedded ? '' : 'p-4'} style={{ minHeight: embedded ? undefined : 520, backgroundColor: embedded ? undefined : 'var(--nmbu-beige-light)' }}>
      <div className="flex items-center gap-3 mb-3 flex-wrap text-xs">
        <span style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)', fontSize: 15 }}>Alle NMBU-program mot konkurrentene (median), 2025</span>
        <span className="ml-auto flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: 'rgba(4,120,87,0.6)' }} /> bedre</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: 'rgba(185,28,28,0.6)' }} /> svakere</span>
      </div>
      <div className="overflow-auto rounded-xl" style={{ maxHeight: embedded ? '70vh' : 560, border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0" style={{ backgroundColor: '#fff' }}>
            <tr>
              <th className="px-2 py-2 text-left">Fak.</th><th className="px-2 py-2 text-left">Programgruppe</th>
              {INDIKATORER.map((i) => <th key={i.k} className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>{i.l}</th>)}
            </tr>
          </thead>
          <tbody>
            {rader.map((r) => {
              const key = r.fak.id + r.gruppe;
              return [
                <tr key={key} onClick={() => setAapen(aapen === key ? null : key)} className="cursor-pointer" style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
                  <td className="px-2 py-1.5" style={{ color: 'var(--nmbu-neutral-2)' }}>{r.fak.shortLabel}</td>
                  <td className="px-2 py-1.5" style={{ fontWeight: 600 }}>{r.gruppeLabel}</td>
                  {INDIKATORER.map((i) => { const [a, b] = i.v(r); return (
                    <td key={i.k} className="px-2 py-1.5 text-center" style={{ backgroundColor: farge(a, b, i.hoy) }} title={`NMBU ${nf(a, i.d)}${i.enhet ?? ''} · konkurrenter ${nf(b, i.d)}${i.enhet ?? ''}`}>
                      {a == null ? (i.k === 'pg' ? 'alle inn' : '–') : `${nf(a, i.d)}${i.enhet ?? ''}`}
                    </td>
                  ); })}
                </tr>,
                aapen === key && (
                  <tr key={key + 'd'}><td colSpan={2 + INDIKATORER.length} className="p-3" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
                    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                      <Panel title="Poenggrense over tid"><MiniTrend fak={r.fak} gruppe={r.gruppe} /></Panel>
                      <Panel title="Snitt møtt 2025"><MiniBar data={opMottData(r.fak, r.gruppe)} /></Panel>
                    </div>
                    {onOpen && (
                      <button onClick={() => onOpen(r.fak.id, r.gruppe)} className="mt-3 px-3 py-1.5 rounded-lg text-xs"
                        style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>Åpne opptaksanalysen for {r.gruppeLabel} →</button>
                    )}
                  </td></tr>
                ),
              ];
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
