import { CalendarClock, ExternalLink } from 'lucide-react';

/**
 * Nye regler for opptak til høyere utdanning (ny opptaksforskrift). Kilde: Samordna opptak, «Nye regler fra 2027 for opptak
 * til høyere utdanning» (sist endret 24.09.2026). Ingen av endringene gjelder opptaket høsten 2026; de store endringene gjelder
 * fra opptaket høsten 2028.
 */
const KILDE = 'https://www.samordnaopptak.no/universitet-og-hogskole/aktuelt/nye-regler-for-opptak-til-hoyere-utdanning.html';

const FRA_2028 = [
  'Førstegangsvitnemålskvoten: øvre aldersgrense økes fra 21 til 23 år, og kvoten økes fra 50 til 65 % av studieplassene.',
  'Alderspoeng og tilleggspoeng for høyere utdanning, fagskole og folkehøgskole fjernes.',
  'Språkpoeng, naturbrukspoeng og kjønnspoeng fjernes.',
  'Realfagspoengene halveres: 0,25 poeng per realfag (140 timer), 0,5 for Matematikk R2 og Fysikk 2, maks 2 poeng.',
  'Poeng for militær førstegangstjeneste og siviltjeneste halveres fra 2 til 1.',
  'Dobbeltrangering fjernes: søkeren kan ikke lenger bytte opptaksgrunnlag for å få en høyere poengsum.',
  'Tilleggspoeng for søkere med samisk som førstespråk.',
];
const FRA_2027 = [
  '23/5-regelen blir 23/6-regelen: kravet om fem års praksis faller bort (fylte 23 år og de seks studiekompetansefagene).',
  'Særskilt vurdering fjernes.',
  'Poenglikhet avgjøres ved loddtrekning, ikke alder.',
  'Institusjonene kan bruke rangerende opptaksprøver uten å søke departementet, og kan søke om kjønnskvoter.',
];

export function NyeOpptaksregler({ variant = 'kort' }: { variant?: 'kort' | 'full' }) {
  const innhold = (
    <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)', lineHeight: 1.6 }}>
      <p style={{ marginBottom: 8 }}>
        Ny opptaksforskrift innføres gradvis. <b>Opptaket høsten 2026 følger dagens regler.</b> De største endringene gjelder fra
        <b> opptaket høsten 2028</b>, og da blir poenggrensene og snittene før og etter ikke direkte sammenlignbare.
      </p>
      <div className="grid gap-x-6 gap-y-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)', marginBottom: 2 }}>Fra opptaket høsten 2028 (de store endringene)</div>
          <ul className="list-disc pl-4">{FRA_2028.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)', marginBottom: 2 }}>Fra opptaket høsten 2027</div>
          <ul className="list-disc pl-4">{FRA_2027.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      </div>
      {variant === 'full' && (
        <div className="mt-3" style={{ borderTop: '1px solid var(--nmbu-neutral-3)', paddingTop: 8 }}>
          <div style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)', marginBottom: 2 }}>Hva betyr det for HHs bachelorprogram?</div>
          <ul className="list-disc pl-4">
            <li>65 % av tilbudene skal gå via førstegangsvitnemålskvoten (i dag 50 %). Simulatoren over kan vise effekten av kvotestørrelsen alene (knappen «65 % fra 2028»).</li>
            <li>Kvoten åpnes for søkere opp til 23 år, så flere søkere vil ha en SP-rad. Hvor mange er 22–23 år, finnes ikke i uttrekket; det trengs fødselsår eller alder (aggregert) fra opptakskontoret for å simulere dette.</li>
            <li>I ordinær kvote forsvinner alderspoeng og de fleste tilleggspoeng. Konkurransepoengene (KP) blir derfor lavere og nærmere skolepoengene, særlig for eldre søkere og søkere med forbedrede karakterer (VES). Poenggrensene vil trolig falle uten at nivået på studentene endres.</li>
            <li>Uten dobbeltrangering kan ikke søkere bytte til et gunstigere opptaksgrunnlag. Det gjelder blant annet søkere med praksis (PRA) eller påbygging (VPL).</li>
            <li>Poenglikhet avgjøres ved loddtrekning allerede fra opptaket høsten 2027. Det påvirker hvem som får plass ved grensen, ikke selve poenggrensen.</li>
          </ul>
        </div>
      )}
      <a href={KILDE} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2" style={{ color: 'var(--nmbu-green-dark)', fontSize: 11 }}>
        <ExternalLink className="w-3 h-3" /> Samordna opptak: Nye regler for opptak til høyere utdanning (sist endret 24.09.2026)
      </a>
    </div>
  );
  return (
    <details className="rounded-lg px-4 py-3" open={variant === 'full'} style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)' }}>
      <summary className="cursor-pointer flex items-center gap-1.5 text-xs" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)', listStyle: 'none' }}>
        <CalendarClock className="w-3.5 h-3.5" /> Nye opptaksregler: store endringer fra opptaket høsten 2028
        {variant === 'kort' && <span style={{ fontWeight: 400, color: 'var(--nmbu-neutral-2)' }}> · klikk for detaljer</span>}
      </summary>
      <div className="mt-2">{innhold}</div>
    </details>
  );
}
