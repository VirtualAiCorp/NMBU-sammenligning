import { lazy, Suspense, useEffect, useState } from 'react';
import { PieChart, ListOrdered, Landmark, Info, MapPin } from 'lucide-react';
import { FORBEHOLD, Laster, dato, hentOversikt, kort, nf, useFil, type Oversikt } from './felles';
import { MarkedOversikt } from './MarkedOversikt';
import { MarkedProgram } from './MarkedProgram';
import { MarkedOkonomi } from './MarkedOkonomi';
// Leaflet (kart og CSS) lastes bare når fanen åpnes
const MarkedStudiesteder = lazy(() => import('./MarkedStudiesteder').then((m) => ({ default: m.MarkedStudiesteder })));

/**
 * NMBU-siden «Markedet» (?marked, ?marked=<fane>): hele markedet for høyere utdanning, ikke bare konkurrentene til hvert
 * fakultet. Data: kilde/public/marked/*.json fra scripts/build-marked.py (kartleggingene i data/marked/, se
 * docs/marked/ og status-og-metode §58).
 */

type Fane = 'oversikt' | 'program' | 'studiesteder' | 'okonomi';
const FANER: { id: Fane; label: string; ikon: typeof PieChart; tekst: string }[] = [
  { id: 'oversikt', label: 'Oversikt', ikon: PieChart, tekst: 'Andeler av førstevalgene per fagfelt og institusjon' },
  { id: 'program', label: 'Program', ikon: ListOrdered, tekst: 'Alle program med søkere, plasser og studieresultater' },
  { id: 'studiesteder', label: 'Studiesteder', ikon: MapPin, tekst: 'Kart over alle studiesteder med studenter og førstevalg' },
  { id: 'okonomi', label: 'Økonomi og administrasjon', ikon: Landmark, tekst: 'Bachelor, master og handelshøyskolene' },
];
const erFane = (v: string | null): v is Fane => v === 'oversikt' || v === 'program' || v === 'studiesteder' || v === 'okonomi';

function fraLenke(): Fane {
  if (typeof window === 'undefined') return 'oversikt';
  const v = new URLSearchParams(window.location.search).get('marked');
  return erFane(v) ? v : 'oversikt';
}

/** Holder ?marked=<fane> i adressen mens siden er åpen, så lenken kan deles; fjernes når siden lukkes. */
function settLenke(fane: Fane | null) {
  const q = new URLSearchParams(window.location.search);
  if (fane) q.set('marked', fane); else q.delete('marked');
  const s = q.toString().replace(/=(?=&|$)/g, '');
  history.replaceState(history.state, '', `${window.location.pathname}${s ? `?${s}` : ''}${window.location.hash}`);
}

export function Markedet() {
  const data = useFil<Oversikt>(hentOversikt);
  const [fane, setFane] = useState<Fane>(fraLenke);
  const [ff, setFf] = useState('alle');
  useEffect(() => { settLenke(fane); }, [fane]);
  useEffect(() => () => settLenke(null), []);

  return (
    <div className="space-y-5">
      <div className="rounded-xl p-5" style={kort}>
        <p style={{ fontSize: 13, color: 'var(--nmbu-neutral-1)', lineHeight: 1.6, maxWidth: 900 }}>
          Resten av nettstedet sammenligner hvert NMBU-fakultet med de programmene det konkurrerer mest med. Denne siden viser
          <b> hele markedet</b>: alle institusjoner og alle studieprogram med opptak, slik at NMBUs plass kan ses mot alt annet
          søkerne velger mellom. Markedsandelene er førstevalg i Samordna opptak 2021–2026. Program med lokalt opptak (BI,
          Kristiania og de fleste toårige mastere) er med fra DBH.
        </p>
        <div className="flex flex-wrap gap-2 mt-4" role="tablist" aria-label="Faner">
          {FANER.map((f) => (
            <button key={f.id} role="tab" aria-selected={fane === f.id} onClick={() => setFane(f.id)} title={f.tekst}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm"
              style={fane === f.id ? { backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', fontWeight: 600 } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)', border: '1px solid var(--nmbu-neutral-3)' }}>
              <f.ikon className="w-4 h-4" /> {f.label}
            </button>
          ))}
        </div>
      </div>

      {fane === 'okonomi'
        ? <MarkedOkonomi />
        : data === undefined ? <Laster />
          : data === null ? <Laster tekst="Fant ikke markedsdataene (marked/oversikt.json)." />
            : fane === 'oversikt' ? <MarkedOversikt data={data} ff={ff} setFf={setFf} />
              : fane === 'studiesteder' ? <Suspense fallback={<Laster tekst="Laster kartet …" />}><MarkedStudiesteder data={data} ff={ff} setFf={setFf} /></Suspense>
                : <MarkedProgram data={data} ff={ff} setFf={setFf} />}

      <div className="rounded-xl p-5" style={kort}>
        <div className="flex items-center gap-2 mb-2" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}><Info className="w-4 h-4" /> Om tallene</div>
        <ul className="list-disc pl-5 space-y-1" style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)', lineHeight: 1.55 }}>
          <li><b>Kilder:</b> Samordna opptak/HK-dir (søker- og tilbudstall, poenggrenser, søke-API-et), DBH/HK-dir tabell 347, 370, 379, 123, 110, 104, 124, 707, 900, 907 og 908, programsidene og utdanning.no. Studiestedene: DBH 124, SSB og Kartverket (stedsnavn, kommuner og kartfliser). Hentet {dato(data?.hentet) || '17.10.2026'}.</li>
          <li><b>Kobling:</b> Samordna-koden kobles til DBH-programmet via studieprogramnummeret i DBH 370{data ? ` (${nf(data.kobling.soMedSr)} av ${nf(data.kobling.so)} Samordna-koder har studieresultater; ${nf(data.kobling.lokalt)} program har bare lokalt opptak)` : ''}. Fagfeltet bestemmes av NUS-faggruppen.</li>
          <li><b>Gradsprogram og årsstudier:</b> årsstudier er ikke grader. NMBUs vekst i økonomi og administrasjon kommer i hovedsak fra det nettbaserte årsstudiet i bærekraftig økonomi og ledelse; bryteren i Oversikt skiller dem. Enkeltemner og videreutdanning er ikke i Samordna og er ikke med.</li>
          <li><b>DBH 2026:</b> {FORBEHOLD.dbh2026}</li>
          <li><b>Studiesteder:</b> {FORBEHOLD.studiesteder}</li>
          <li><b>Prikking:</b> {FORBEHOLD.prikking}</li>
          <li><b>Finansieringsomleggingen:</b> {FORBEHOLD.finansiering}</li>
          <li><b>Private:</b> {FORBEHOLD.private}</li>
          <li><b>Søkere:</b> {FORBEHOLD.sokere}</li>
        </ul>
      </div>
    </div>
  );
}
