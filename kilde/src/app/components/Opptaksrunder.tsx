import { AlertTriangle } from 'lucide-react';
import type { LandsamGroup } from '../data/landsamAdmissionData';
import type { FullYearData } from '../data/fullAdmissionData';

/**
 * «Hvem sliter med å fylle opp?»: fra søknadsfristen i april (søkere per plass) via hovedopptaket i juli (kvalifiserte og
 * tilbud per plass, poenggrense) til suppleringsopptaket (poenggrense etter supplering). Alt fra Samordna opptak.
 * Samordnas lister over ledige plasser arkiveres ikke; at alle kvalifiserte fikk tilbud, eller at grensen falt i
 * suppleringsopptaket, er de sporene som finnes etterpå.
 */
type Status = { niva: 0 | 1 | 2 | 3 | 4; tekst: string; farge: string };
export function statusFor(d: FullYearData | undefined): Status | null {
  if (!d || d.pg_ord == null) return null;
  const s = d.pgs_ord;
  if (d.pg_ord === 0 && (d.pg_fv == null || d.pg_fv === 0)) return { niva: 0, tekst: 'Alle kvalifiserte fikk tilbud allerede i hovedopptaket', farge: '#b91c1c' };
  if (s === 0) return { niva: 1, tekst: 'Alle kvalifiserte fikk tilbud i suppleringsopptaket', farge: '#c2410c' };
  if (s != null && d.pg_ord - s >= 1) return { niva: 2, tekst: `Grensen falt ${nf(d.pg_ord - s)} poeng i suppleringsopptaket`, farge: '#a16207' };
  if (s != null && d.pg_ord - s > 0) return { niva: 3, tekst: 'Grensen falt litt i suppleringsopptaket', farge: 'var(--nmbu-neutral-2)' };
  return { niva: 4, tekst: s == null ? 'Ingen suppleringsgrense oppgitt' : 'Samme grense etter suppleringsopptaket', farge: '#047857' };
}
const nf = (v: number, d = 1) => v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });
const perPlass = (a: number | null | undefined, p: number | null | undefined) => (a != null && p ? a / p : null);
const vl = (a: number | null | undefined, b: number | null | undefined) => (a == null && b == null ? '–' : ((a ?? 0) + (b ?? 0)).toLocaleString('nb-NO'));
const pg = (v: number | null | undefined) => (v == null ? '–' : v === 0 ? 'Alle' : nf(v));

export function Opptaksrunder({ group, year, years, colorFor }: { group: LandsamGroup; year: string; years: readonly string[]; colorFor: (id: string) => string }) {
  const rader = group.entries.filter((e) => !e.lokaltOpptak && e.years[year]?.pg_ord != null)
    .map((e) => {
      const d = e.years[year]!;
      const st = statusFor(d)!;
      const i = years.indexOf(year);
      const tre = years.slice(Math.max(0, i - 2), i + 1).map((y) => statusFor(e.years[y]));
      return { e, d, st, gjentatt: tre.filter((x) => x && x.niva <= 1).length };
    })
    .sort((a, b) => a.st.niva - b.st.niva || b.gjentatt - a.gjentatt || (perPlass(a.d.kvalifiserte, a.d.plasser) ?? 99) - (perPlass(b.d.kvalifiserte, b.d.plasser) ?? 99));
  if (!rader.length) return null;
  const antallSliter = rader.filter((r) => r.st.niva <= 1).length;
  const th = 'px-3 py-2 text-right whitespace-nowrap';
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex items-center gap-2 mb-1" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>
        <AlertTriangle className="w-4 h-4" /> Hvem sliter med å fylle opp? Fra april til suppleringsopptaket {year}
      </div>
      <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginBottom: 10 }}>
        {antallSliter} av {rader.length} program i gruppen tok opp alle kvalifiserte søkere i hovedopptaket eller suppleringsopptaket i {year}.
        Søkere per plass er fra søknadsfristen 15. april, kvalifiserte og tilbud fra hovedopptaket i juli, og siste grense etter suppleringsopptaket.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
              <th className="px-3 py-2 text-left">Program</th>
              <th className={th}>Plasser</th>
              <th className={th} title="Førstevalgssøkere per studieplass ved søknadsfristen 15. april">1. valg / plass (april)</th>
              <th className={th} title="Kvalifiserte søkere per studieplass (hovedopptaket)">Kvalifiserte / plass</th>
              <th className={th} title="Tilbud i hovedopptaket per studieplass. Over 1 = institusjonen overbooker fordi ikke alle takker ja eller møter.">Tilbud / plass (juli)</th>
              <th className={th} title="Søkere på venteliste (ordinær + førstegangsvitnemål) etter hovedopptaket → etter suppleringsopptaket">Venteliste: hoved → suppl.</th>
              <th className={th} title="Poenggrense ordinær kvote: hovedopptaket → etter suppleringsopptaket">Ordinær: hoved → suppl.</th>
              <th className={th} title="Poenggrense førstegangsvitnemål: hovedopptaket → etter suppleringsopptaket">FV: hoved → suppl.</th>
              <th className="px-3 py-2 text-left">Status {year}</th>
            </tr>
          </thead>
          <tbody>
            {rader.map(({ e, d, st, gjentatt }) => (
              <tr key={e.id} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: group.nmbuIds.includes(e.id) ? 'var(--nmbu-green-4)' : 'transparent' }}>
                <td className="px-3 py-1.5" style={{ fontWeight: 600 }}>
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: colorFor(e.id) }} />{e.shortName}
                  <span style={{ fontWeight: 400, color: 'var(--nmbu-neutral-2)' }}> · {e.studiested}</span>
                </td>
                <td className={th}>{d.plasser ?? '–'}</td>
                <td className={th}>{perPlass(d.fvS, d.plasser) != null ? nf(perPlass(d.fvS, d.plasser)!) : '–'}</td>
                <td className={th}>{perPlass(d.kvalifiserte, d.plasser) != null ? nf(perPlass(d.kvalifiserte, d.plasser)!) : '–'}</td>
                <td className={th}>{perPlass(d.tilbud, d.plasser) != null ? nf(perPlass(d.tilbud, d.plasser)!) : '–'}</td>
                <td className={th}>{vl(d.vl_ord, d.vl_fv)} → {vl(d.vls_ord, d.vls_fv)}</td>
                <td className={th}>{pg(d.pg_ord)} → {pg(d.pgs_ord)}</td>
                <td className={th}>{pg(d.pg_fv)} → {pg(d.pgs_fv)}</td>
                <td className="px-3 py-1.5" style={{ color: st.farge, fontWeight: st.niva <= 1 ? 600 : 400 }}>
                  {st.tekst}{gjentatt >= 2 ? ` · ${gjentatt} av de siste 3 årene` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginTop: 6 }}>
        «Alle» = alle kvalifiserte søkere fikk tilbud (poenggrense 0). Venteliste = kvalifiserte søkere som står på vent (ordinær kvote + førstegangsvitnemål); mange på venteliste betyr at programmet kunne fylt flere plasser. Samordnas lister over ledige plasser (restplasser) arkiveres ikke, så programmer som
        fortsatt hadde ledige plasser etter suppleringsopptaket kan ikke skilles ut; «alle kvalifiserte fikk tilbud» er det nærmeste sporet. Kilde: Samordna opptak.
      </div>
    </div>
  );
}
