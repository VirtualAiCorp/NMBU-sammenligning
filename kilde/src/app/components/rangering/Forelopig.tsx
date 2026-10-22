// Fanen «2026 foreløpig»: artikler registrert i NVA så langt i inneværende år, sammenlignet med forrige år slik det var
// registrert på samme dato (NVAs registreringsdato). Data fra build-rangering.py (lag_forelopig), bare aggregater.
import { useState } from 'react';

export interface ForelopigAgg { n: number; andel: number; niva2: number; ajg: number; '4*': number; '4': number; '3': number; nvi: number; }
export interface ForelopigData {
  aar: number; dato: string; lister: { ajg: boolean };
  skoler: Record<string, { hentet: string; naa: ForelopigAgg; fjorSamme: ForelopigAgg; fjorHele: ForelopigAgg; utenDato: number }>;
}
/** Skolene slik fanen trenger dem; uff = faglige årsverk (UN1 + stipendiater + postdoktorer) i forrige år, nevner for «per 100» */
export interface ForelopigSkole { id: string; kort: string; navn: string; isNmbu: boolean; referanse: boolean; variantAv?: string | null; uff: number | null; }

type Maal = 'n' | 'niva2' | 'p3' | 'p4';
const MAAL: { id: Maal; kort: string; navn: string; ajg?: boolean }[] = [
  { id: 'n', kort: 'Artikler', navn: 'vitenskapelige artikler' },
  { id: 'niva2', kort: 'Nivå 2', navn: 'artikler på norsk nivå 2' },
  { id: 'p3', kort: 'AJG 3+', navn: 'artikler på AJG 3, 4 eller 4*', ajg: true },
  { id: 'p4', kort: 'AJG 4+', navn: 'artikler på AJG 4 eller 4*', ajg: true },
];
const MIN_GRUNNLAG = 5;
const verdi = (a: ForelopigAgg, m: Maal) => m === 'n' ? a.n : m === 'niva2' ? a.niva2 : m === 'p3' ? a['4*'] + a['4'] + a['3'] : a['4*'] + a['4'];
const nf = (v: number | null | undefined, d = 0) => v == null || !Number.isFinite(v) ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });
const datoTekst = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d}.${m}.${y}`; };

export function ForelopigFane({ data, skoler, varianter }: { data: ForelopigData; skoler: ForelopigSkole[]; varianter: ForelopigSkole[] }) {
  const harAjg = data.lister.ajg;
  const [maal, setMaal] = useState<Maal>(harAjg ? 'p4' : 'n');
  const [per100, setPer100] = useState(false);
  const [ref, setRef] = useState(false);
  const [ntnuHh, setNtnuHh] = useState(false);
  const fjor = data.aar - 1;
  const fjorDato = `${fjor}${data.dato.slice(4)}`;
  const m = MAAL.find((x) => x.id === maal) ?? MAAL[0];

  const valgte = skoler.map((s) => (ntnuHh && varianter.find((x) => x.variantAv === s.id)) || s).filter((s) => (ref || !s.referanse) && data.skoler[s.id]);
  const c = (x: number, s: ForelopigSkole) => per100 ? (s.uff ? 100 * x / s.uff : null) : x;
  const rader = valgte.map((s) => {
    const d = data.skoler[s.id];
    const naa = verdi(d.naa, maal), samme = verdi(d.fjorSamme, maal), hele = verdi(d.fjorHele, maal);
    // Registreringsandel: hvor stor del av fjorårets artikler som var registrert på samme dato (alle artikler, ikke per mål,
    // fordi tallene per mål blir små). Fremskrevet = hittil i år delt på andelen.
    const regAndel = d.fjorHele.n ? d.fjorSamme.n / d.fjorHele.n : null;
    const frem = regAndel ? naa / regAndel : null;
    // Endring i prosent bare når grunnlaget er minst MIN_GRUNNLAG artikler; ellers blir utslagene meningsløse
    return { s, d, naa, samme, hele, endring: samme >= MIN_GRUNNLAG ? 100 * (naa - samme) / samme : null, regAndel, frem, fremEndring: frem != null && hele >= MIN_GRUNNLAG ? 100 * (frem - hele) / hele : null };
  }).sort((a, b) => (c(b.naa, b.s) ?? -1) - (c(a.naa, a.s) ?? -1));
  const regAndeler = rader.map((r) => r.regAndel).filter((x): x is number => x != null);
  const regMin = regAndeler.length ? Math.min(...regAndeler) : null, regMaks = regAndeler.length ? Math.max(...regAndeler) : null;
  const harVariant = varianter.some((x) => x.variantAv === 'ntnu');
  const pst = (x: number | null) => x == null ? <span className="muted" title={`Under ${MIN_GRUNNLAG} artikler å sammenligne med`}>–</span> : `${x > 0 ? '+' : ''}${nf(x, 0)} %`;
  const tall = (x: number | null) => nf(x, per100 ? 1 : 0);
  const enhet = per100 ? ` per 100 faglige årsverk (${fjor})` : '';

  return (
    <div className="skp">
      <section className="sheet" aria-label="Foreløpige tall">
        <div>
          <span className="lab">Foreløpige tall · NVA per {datoTekst(data.dato)}</span>
          <h1>{data.aar} så langt: {m.navn}</h1>
          <p style={{ maxWidth: '64ch' }}>Artikler med publiseringsår {data.aar} som er registrert i NVA til nå, sammenlignet med {fjor} slik det så ut på samme dato i fjor ({datoTekst(fjorDato)}). Sammenligningen på samme dato tar høyde for at artikler registreres utover året og året etter.</p>
        </div>
        <div>
          <div className="fl-notis" role="note">
            <b>Ujevn rapportering.</b> Skolene registrerer artikler i ulikt tempo. På samme dato i fjor var {regMin != null && regMaks != null ? `${nf(100 * regMin, 0)}–${nf(100 * regMaks, 0)} %` : 'en del'} av {fjor}-artiklene registrert, avhengig av skole. NVI-rapporteringen for {data.aar} lukkes først våren {data.aar + 1}, så tallene her er alle registrerte artikler, ikke bare godkjente. Artikler kan også flytte mellom år (først publisert på nett, senere i et nummer). Bruk tallene som en pekepinn, ikke som resultat.
          </div>
          <div className="ajg-valg">
            <div className="ajg-g" role="group" aria-label="Mål"><span className="lab">Mål</span>
              {MAAL.filter((x) => !x.ajg || harAjg).map((x) => <button key={x.id} type="button" className="seg" aria-pressed={maal === x.id} onClick={() => setMaal(x.id)}>{x.kort}</button>)}
            </div>
            <div className="ajg-g" role="group" aria-label="Visning"><span className="lab">Vis</span>
              <button type="button" className="seg" aria-pressed={!per100} onClick={() => setPer100(false)}>Antall</button>
              <button type="button" className="seg" aria-pressed={per100} onClick={() => setPer100(true)} title={`Faglige årsverk (UN1 + stipendiater + postdoktorer, HK-dir) i ${fjor}, siste år med årsverk i DBH; samme nevner for begge år`}>Per 100 årsverk</button>
            </div>
            {harVariant && (
              <div className="ajg-g" role="group" aria-label="Avgrensning av NTNU"><span className="lab">NTNU</span>
                <button type="button" className="seg" aria-pressed={!ntnuHh} onClick={() => setNtnuHh(false)}>Handelshøyskolen + samfunnsøkonomi + IØT</button>
                <button type="button" className="seg" aria-pressed={ntnuHh} onClick={() => setNtnuHh(true)}>Bare Handelshøyskolen</button>
              </div>
            )}
            <label className="ajg-g"><input type="checkbox" checked={ref} onChange={(e) => setRef(e.target.checked)} /> Ta med referanseenhetene</label>
          </div>
        </div>
      </section>

      <section className="sec" aria-label="Tabell">
        <header>
          <span className="lab">Alle skolene, sortert etter {data.aar} hittil</span>
          <h2>{m.kort}{enhet}</h2>
          <p className="muted">«Samme dato i fjor» er artiklene fra {fjor} som var registrert i NVA {datoTekst(fjorDato)}. «Fremskrevet» deler tallet hittil på andelen av fjorårets artikler som var registrert på samme dato, og antar at skolen registrerer i samme tempo som i fjor. Hel telling.</p>
        </header>
        <div className="scroll">
          <table>
            <thead><tr>
              <th>Skole</th><th>{data.aar} hittil</th><th>{fjor} samme dato</th><th title="Endring fra samme dato i fjor">Endring</th>
              <th>{fjor} i alt</th><th title={`Andel av alle ${fjor}-artiklene som var registrert ${datoTekst(fjorDato)}`}>Registrert på datoen i fjor</th>
              <th title="Hittil i år delt på registreringsandelen i fjor">Fremskrevet {data.aar}</th><th title={`Fremskrevet ${data.aar} mot ${fjor} i alt`}>mot {fjor}</th>
            </tr></thead>
            <tbody>
              {rader.map((r) => (
                <tr key={r.s.id} style={r.s.isNmbu ? { fontWeight: 600 } : undefined}>
                  <td title={r.s.navn}>{r.s.kort}{r.s.referanse ? <span className="muted"> · ref.</span> : null}</td>
                  <td>{tall(c(r.naa, r.s))}</td>
                  <td>{tall(c(r.samme, r.s))}</td>
                  <td>{pst(r.endring)}</td>
                  <td className="muted">{tall(c(r.hele, r.s))}</td>
                  <td className="muted">{r.regAndel != null ? `${nf(100 * r.regAndel, 0)} %` : '–'}</td>
                  <td>{r.frem != null ? tall(c(r.frem, r.s)) : '–'}</td>
                  <td>{pst(r.fremEndring)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="cap">Kilde: NVA (Sikt), søke-API-et, hentet {datoTekst(data.dato)}; registreringsdato = NVAs createdDate. Samme avgrensning av skolene som i resten av rangeringen. {harAjg ? 'AJG-nivå etter Chartered ABS Academic Journal Guide 2024 (koblet på ISSN). ' : ''}Endring i prosent vises bare når det er minst {MIN_GRUNNLAG} artikler å sammenligne med; et par artikler kan endre bildet for små skoler. Fremskrivingen er usikker når skolen registrerer raskere eller saktere enn i fjor, for eksempel etter ny rutine eller ved import av mange artikler på én gang.</p>
      </section>
    </div>
  );
}
