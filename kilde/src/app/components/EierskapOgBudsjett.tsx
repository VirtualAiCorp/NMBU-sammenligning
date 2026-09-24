import { ExternalLink, Landmark } from 'lucide-react';
import { EIERSKAP, EIERSKAP_HENTET } from '../data/eierskapData';
import type { EconUnit } from '../data/economyData';

/**
 * Statsbudsjettet (Prop. 1 S, kap. 260), siste årsregnskap (Regnskapsregisteret) og eierskap, styre og ledelse
 * (Enhetsregisteret) for institusjonene som er valgt i økonomikortet.
 */
const nf = (v: number, d = 0) => v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });
const mill = (kr: number | null | undefined, d = 0) => (kr == null ? '–' : `${nf(kr / 1e6, d)} mill.`);
const SB_AAR = '2026';

export function EierskapOgBudsjett({ units, colorFor }: { units: EconUnit[]; colorFor: (id: string) => string }) {
  const rader = units
    .map((u) => ({ u, e: EIERSKAP[u.inst], sarv: [...u.years].reverse().find((y) => y.studentarsverk)?.studentarsverk ?? null }))
    .filter((r) => r.e)
    .sort((a, b) => (b.u.isNmbu ? 1 : 0) - (a.u.isNmbu ? 1 : 0) || (b.e.statsbudsjett[SB_AAR]?.belop ?? 0) - (a.e.statsbudsjett[SB_AAR]?.belop ?? 0));
  if (!rader.length) return null;
  const sbKilde = rader.map((r) => r.e.statsbudsjett[SB_AAR]).find(Boolean);
  const private_ = rader.filter((r) => r.e.regnskap);
  const th = 'px-3 py-2 text-right whitespace-nowrap';
  return (
    <div className="rounded-xl p-5 mt-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex items-center gap-2 mb-1" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>
        <Landmark className="w-4 h-4" /> Statsbudsjett, årsregnskap og ledelse
      </div>
      <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginBottom: 10 }}>
        Tildelingen over statsbudsjettet for {SB_AAR} og ledelsen i dag, for institusjonene som er valgt over. Private høyskoler leverer årsregnskap til
        Brønnøysund, med tall for {private_[0]?.e.regnskap?.aar ?? 'siste år'} før de kommer i DBH.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
              <th className="px-3 py-2 text-left">Institusjon</th>
              <th className="px-3 py-2 text-left">Organisasjonsform</th>
              <th className={th}>Ansatte</th>
              <th className={th} title={`Rammeløyving over kap. 260 i ${SB_AAR} (statlige: post 50, private: post 70)`}>Statsbudsjett {SB_AAR}</th>
              <th className={th} title="Tildelingen delt på studentårsverk (studiepoeng / 60, DBH 900), siste år med tall">Per studentårsverk</th>
              <th className={th} title="Siste årsregnskap i Regnskapsregisteret (bare private)">Driftsinntekter</th>
              <th className={th} title="Driftsinntekter minus driftskostnader, siste årsregnskap">Driftsresultat</th>
              <th className={th} title="Resultat etter finansposter, siste årsregnskap">Årsresultat</th>
              <th className="px-3 py-2 text-left">Styreleder</th>
              <th className="px-3 py-2 text-left" title="Daglig leder slik det står i Enhetsregisteret: rektor hos BI, Kristiania og NLA, ofte direktøren ved statlige institusjoner">Daglig leder*</th>
            </tr>
          </thead>
          <tbody>
            {rader.map(({ u, e, sarv }) => {
              const sb = e.statsbudsjett[SB_AAR];
              const r = e.regnskap;
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: u.isNmbu ? 'var(--nmbu-green-4)' : 'transparent' }}>
                  <td className="px-3 py-2" style={{ fontWeight: 600 }}>
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: colorFor(u.id) }} />{u.kort}
                    {e.datterselskap.length > 0 && <div style={{ fontSize: 10, fontWeight: 400, color: 'var(--nmbu-neutral-2)' }}>Datterselskap: {e.datterselskap.map((d) => d.navn).join(', ')}</div>}
                  </td>
                  <td className="px-3 py-2">{e.orgform}{r?.morselskap ? ' (morselskap)' : ''}</td>
                  <td className={th}>{e.ansatte != null ? nf(e.ansatte) : '–'}</td>
                  <td className={th} style={{ fontWeight: 700 }}>{sb ? mill(sb.belop) : '–'}</td>
                  <td className={th}>{sb && sarv ? `${nf(sb.belop / 1000 / sarv)} tkr` : '–'}</td>
                  <td className={th}>{r ? mill(r.driftsinntekter) : '–'}</td>
                  <td className={th} style={{ color: r && r.driftsresultat < 0 ? '#b91c1c' : undefined, fontWeight: r ? 600 : 400 }}>
                    {r ? `${mill(r.driftsresultat, 1)} (${nf((100 * r.driftsresultat) / r.driftsinntekter, 1)} %)` : '–'}
                  </td>
                  <td className={th} style={{ color: r && r.aarsresultat < 0 ? '#b91c1c' : undefined }}>{r ? mill(r.aarsresultat, 1) : '–'}</td>
                  <td className="px-3 py-2">{e.styreleder ?? '–'}</td>
                  <td className="px-3 py-2">{e.dagligLeder ?? '–'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
        <span>* Daglig leder slik det er registrert i Enhetsregisteret: rektor hos de private, ofte direktøren ved de statlige. «–» = ikke registrert (ved flere statlige er rektor styreleder uten at det står i registeret).</span>
        <span>Årsregnskap finnes bare for de private; statlige institusjoner leverer ikke til Regnskapsregisteret.</span>
        {sbKilde && <a href={sbKilde.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1" style={{ color: 'var(--nmbu-green-dark)' }}><ExternalLink className="w-3 h-3" /> {sbKilde.kilde}</a>}
        <a href="https://data.brreg.no/enhetsregisteret/oppslag/enheter" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1" style={{ color: 'var(--nmbu-green-dark)' }}><ExternalLink className="w-3 h-3" /> Brønnøysundregistrene, hentet {EIERSKAP_HENTET}</a>
      </div>
    </div>
  );
}
