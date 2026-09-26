import { useState } from 'react';
import { Layers } from 'lucide-react';
import { NMBU_PRODUKSJON, type NmbuProgramProduksjon } from '../data/revenueData';
import { FACULTY_META, type FacultyId } from '../data/facultyMeta';

/**
 * Studiepoengproduksjon og anslått studiepoenguttelling for alle NMBUs programkoder, også årsstudier, enkeltemner og
 * videreutdanning som ikke er med i sammenligningene (DBH 900 og 347, scripts/build-revenue.py → NMBU_PRODUKSJON).
 * Med fak: programmene fakultetet eier, med årsstudier/enkeltemner/videreutdanning uthevet. Uten fak: hele NMBU.
 */
const IKKE_GRAD = new Set(['Årsstudier og ettårige studier', 'Enkeltemner', 'Videreutdanning', 'Utvekslingsstudenter']);
const AAR = ['2023', '2024', '2025'];
const nf = (v: number, d = 0) => v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });
const mill = (v: number) => `${nf(v / 1e6, 1)} mill. kr`;

function Merke({ k }: { k: string }) {
  const ikke = IKKE_GRAD.has(k);
  return <span className="px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap" style={{ backgroundColor: ikke ? '#FEF3C7' : 'var(--nmbu-green-4)', color: ikke ? '#92400E' : 'var(--nmbu-green-dark)', fontWeight: 600 }}>{k}</span>;
}

export function NmbuProduksjon({ fak }: { fak?: FacultyId }) {
  const [aar, setAar] = useState('2025');
  const [bareIkkeGrad, setBareIkkeGrad] = useState(!!fak);
  const alle = NMBU_PRODUKSJON.filter((p) => p.aar[aar]?.sp);
  const utvalg = fak ? alle.filter((p) => p.fak === fak) : alle;
  const sum = (ps: NmbuProgramProduksjon[], f: 'sp' | 'inn') => ps.reduce((s, p) => s + (p.aar[aar]?.[f] ?? 0), 0);
  const totSp = sum(utvalg, 'sp'), totInn = sum(utvalg, 'inn');
  const ikkeGrad = utvalg.filter((p) => IKKE_GRAD.has(p.kategori));
  const sortert = [...utvalg].sort((a, b) => (b.aar[aar]?.sp ?? 0) - (a.aar[aar]?.sp ?? 0));
  const rader = (bareIkkeGrad ? sortert.filter((p) => IKKE_GRAD.has(p.kategori)) : sortert).slice(0, fak ? 40 : 25);
  const plass = (p: NmbuProgramProduksjon) => sortert.indexOf(p) + 1;
  const storst = sortert[0];
  const perKat = [...new Set(utvalg.map((p) => p.kategori))].map((k) => ({ k, sp: sum(utvalg.filter((p) => p.kategori === k), 'sp') })).sort((a, b) => b.sp - a.sp);
  if (!utvalg.length) return null;
  return (
    <div className="rounded-xl p-5 mt-6" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex items-center gap-2 mb-1" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>
        <Layers className="w-4 h-4" /> {fak ? `Alle ${FACULTY_META[fak].shortLabel}s studieprogram, også årsstudier, enkeltemner og videreutdanning` : 'NMBUs studieprogram etter studiepoengproduksjon'}
      </div>
      <div className="mb-3" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', lineHeight: 1.55 }}>
        Egenfinansierte studiepoeng tatt av studentene på hvert program (60 studiepoeng = ett studentårsverk) og anslått studiepoenguttelling i finansieringssystemet.
        Årsstudier, enkeltemner og videreutdanning er ikke med i sammenligningene over, men står for {nf((100 * sum(ikkeGrad, 'sp')) / (totSp || 1), 1)} % av studiepoengene{fak ? ` ved ${FACULTY_META[fak].shortLabel}` : ' ved NMBU'} i {aar}.
        {storst && <> Største program er <b style={{ color: 'var(--nmbu-neutral)' }}>{storst.navn}</b> ({nf(storst.aar[aar].sp, 0)} studentårsverk, {nf((100 * storst.aar[aar].sp) / (totSp || 1), 1)} %).</>}
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {AAR.map((a) => (
          <button key={a} onClick={() => setAar(a)} className="px-2.5 py-1 rounded-full text-xs"
            style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: aar === a ? 'var(--nmbu-green-dark)' : '#fff', color: aar === a ? '#fff' : 'var(--nmbu-neutral-1)' }}>{a}</button>
        ))}
        <label className="flex items-center gap-1.5 text-xs ml-2 cursor-pointer" style={{ color: 'var(--nmbu-neutral-1)' }}>
          <input type="checkbox" id={`bare-ikke-grad-${fak ?? 'nmbu'}`} checked={bareIkkeGrad} onChange={(e) => setBareIkkeGrad(e.target.checked)} /> Bare årsstudier, enkeltemner, videreutdanning og utveksling
        </label>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs" style={{ color: 'var(--nmbu-neutral-1)' }}>
        {perKat.map((x) => <span key={x.k}><Merke k={x.k} /> {nf((100 * x.sp) / (totSp || 1), 1)} %</span>)}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
              <th className="px-3 py-2 text-right" title={`Plass blant ${fak ? 'fakultetets' : 'NMBUs'} program etter studiepoeng`}>#</th>
              <th className="px-3 py-2 text-left">Program</th>
              <th className="px-3 py-2 text-left">Type</th>
              {!fak && <th className="px-3 py-2 text-left">Eier</th>}
              <th className="px-3 py-2 text-right whitespace-nowrap">Studentårsverk {aar}</th>
              <th className="px-3 py-2 text-right whitespace-nowrap">Andel</th>
              <th className="px-3 py-2 text-right whitespace-nowrap" title="Studiepoeng × sats for emnenes finansieringskategori (uten fullføringsuttelling)">Anslått uttelling</th>
              <th className="px-3 py-2 text-right whitespace-nowrap">Utvikling {AAR[0]}–{AAR[AAR.length - 1]}</th>
            </tr>
          </thead>
          <tbody>
            {rader.map((p) => {
              const a = p.aar[aar];
              const forste = p.aar[AAR[0]]?.sp, siste = p.aar[AAR[AAR.length - 1]]?.sp;
              return (
                <tr key={p.kode} style={{ borderTop: '1px solid var(--nmbu-neutral-3)', backgroundColor: IKKE_GRAD.has(p.kategori) ? '#FFFBEB' : undefined }}>
                  <td className="px-3 py-1.5 text-right" style={{ color: 'var(--nmbu-neutral-2)' }}>{plass(p)}</td>
                  <td className="px-3 py-1.5"><span style={{ fontWeight: 600 }}>{p.navn}</span> <span style={{ color: 'var(--nmbu-neutral-2)' }}>· {p.kode}</span></td>
                  <td className="px-3 py-1.5"><Merke k={p.kategori} /></td>
                  {!fak && <td className="px-3 py-1.5">{p.fak === 'nmbu' ? 'NMBU sentralt' : FACULTY_META[p.fak as FacultyId]?.shortLabel ?? p.fak}</td>}
                  <td className="px-3 py-1.5 text-right">{nf(a.sp, 1)}</td>
                  <td className="px-3 py-1.5 text-right">{nf((100 * a.sp) / (totSp || 1), 1)} %</td>
                  <td className="px-3 py-1.5 text-right">{mill(a.inn)}</td>
                  <td className="px-3 py-1.5 text-right" style={{ color: forste == null || siste == null ? 'var(--nmbu-neutral-2)' : siste >= forste ? '#047857' : '#b91c1c' }}>
                    {forste == null || siste == null ? '–' : `${siste >= forste ? '+' : '−'}${nf(Math.abs(siste - forste), 1)}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', lineHeight: 1.5 }}>
        Totalt {nf(totSp, 0)} studentårsverk og anslagsvis {mill(totInn)} i studiepoenguttelling{fak ? ` for programmene ${FACULTY_META[fak].shortLabel} eier` : ''} i {aar}. Uttellingen er studiepoeng × sats for emnets finansieringskategori
        (utløses to år senere); fullføringsuttelling for grader er ikke med her, og årsstudier gir ikke fullføringsuttelling. Kategoriene gir svært ulike satser, så et program med
        mange studiepoeng i en lav kategori (som økonomi) kan gi mindre uttelling enn et mindre program i en høy kategori (som veterinærmedisin).
        Eier og nivå fra DBH 347; «NMBU sentralt» er programkoder uten fakultet (for eksempel enkeltemner og utveksling).
      </div>
    </div>
  );
}
