import { useEffect, useState } from 'react';
import { Coins, AlertTriangle, ExternalLink } from 'lucide-react';

/**
 * Forskningsfinansiering i «Fagmiljøet»: Forskningsrådet (søknader, innvilget, suksessrate, bevilget beløp) og EU
 * (Horizon Europe fra CORDIS) per institusjon, og NMBU-fakultetene. Data: public/fagmiljo/forskning.json
 * (scripts/build-forskning.py). Bare prosjektansvarlig institusjon telles.
 */
interface NfrAar { soknader: number; innvilget: number; avslag: number; suksessrate: number | null; innvilgetBelop: number }
interface EuAar { deltakelser: number; koordinator: number; bidragMillEuro: number }
interface Enhet { kort?: string; nfr?: Record<string, NfrAar>; eu?: Record<string, Record<string, EuAar>> }
interface Data {
  hentet: string; periode: [number, number]; kilder: { navn: string; url: string }[]; merknader: string[];
  institusjoner: Record<string, Enhet>; fagomrade?: Record<string, { navn: string; institusjoner: Record<string, Enhet> }>; fakulteter?: Record<string, Enhet>;
}
let last: Promise<Data | null> | null = null;
const hent = () => (last ??= fetch(`${import.meta.env.BASE_URL}fagmiljo/forskning.json`).then((r) => (r.ok ? r.json() : null)).catch(() => { last = null; return null; }));

const nf = (v: number | null | undefined, d = 0) => (v == null ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d }));
type Sort = 'soknader' | 'innvilget' | 'rate' | 'belop' | 'eu' | 'euDelt';

export function Forskningsfinansiering({ enheter, visOkonomi = false, tittel = 'Forskningsfinansiering' }: {
  /** [nøkkel i forskning.json (instkode eller «1173_420»), visningsnavn, er NMBU] */
  enheter: [string, string, boolean][]; visOkonomi?: boolean; tittel?: string;
}) {
  const [data, setData] = useState<Data | null | undefined>(undefined);
  const [periode, setPeriode] = useState<string>('alle');
  const [okonomi, setOkonomi] = useState(false);
  const [sort, setSort] = useState<Sort>('belop');
  useEffect(() => { let aktiv = true; hent().then((d) => { if (aktiv) setData(d); }); return () => { aktiv = false; }; }, []);
  if (!data) return null;
  const aar = Array.from({ length: data.periode[1] - data.periode[0] + 1 }, (_, i) => String(data.periode[0] + i));
  const valgteAar = periode === 'alle' ? aar : [periode];
  const kilde = (k: string): Enhet | undefined => (okonomi ? data.fagomrade?.okonomi?.institusjoner[k] : (data.institusjoner[k] ?? data.fakulteter?.[k]));
  const rader = enheter.map(([k, navn, nmbu]) => {
    const e = kilde(k);
    const n = valgteAar.map((a) => e?.nfr?.[a]).filter((x): x is NfrAar => !!x);
    const sum = (f: (x: NfrAar) => number) => n.reduce((s, x) => s + f(x), 0);
    const inn = sum((x) => x.innvilget), avs = sum((x) => x.avslag);
    const he = valgteAar.map((a) => e?.eu?.horizonEurope?.[a]).filter((x): x is EuAar => !!x);
    return {
      k, navn, nmbu, har: n.length > 0,
      soknader: sum((x) => x.soknader), innvilget: inn, rate: inn + avs > 0 ? (100 * inn) / (inn + avs) : null, belop: sum((x) => x.innvilgetBelop),
      eu: okonomi ? null : he.reduce((s, x) => s + x.bidragMillEuro, 0), euDelt: okonomi ? null : he.reduce((s, x) => s + x.deltakelser, 0),
    };
  }).filter((r) => r.har || (!okonomi && r.euDelt));
  rader.sort((a, b) => Number(b.nmbu) - Number(a.nmbu) || ((b[sort] ?? -1) - (a[sort] ?? -1)));
  const th = (id: Sort, l: string, title: string) => (
    <th className="px-3 py-2 text-right whitespace-nowrap cursor-pointer select-none" title={title} onClick={() => setSort(id)}
      style={{ color: sort === id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)' }}>{l}{sort === id ? ' ↓' : ''}</th>
  );
  return (
    <div className="rounded-xl p-5 mt-6" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex items-center gap-2 mb-1" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}><Coins className="w-4 h-4" /> {tittel}</div>
      <div className="mb-3" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
        Søknader til og bevilgninger fra Forskningsrådet, og EU-prosjekter i Horizon Europe, der institusjonen er prosjektansvarlig. NMBU først; klikk på en kolonne for å sortere.
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {['alle', ...aar].map((a) => (
          <button key={a} onClick={() => setPeriode(a)} className="px-2.5 py-1 rounded-full text-xs"
            style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: periode === a ? 'var(--nmbu-green-dark)' : '#fff', color: periode === a ? '#fff' : 'var(--nmbu-neutral-1)' }}>
            {a === 'alle' ? `${aar[0]}–${aar[aar.length - 1]}` : a}
          </button>
        ))}
        {visOkonomi && data.fagomrade?.okonomi && (
          <label className="flex items-center gap-1.5 text-xs ml-2 cursor-pointer" style={{ color: 'var(--nmbu-neutral-1)' }}>
            <input type="checkbox" id="forskning-okonomi" checked={okonomi} onChange={(e) => setOkonomi(e.target.checked)} /> Bare fagområdet økonomi (Forskningsrådet)
          </label>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
              <th className="px-3 py-2 text-left">Enhet</th>
              {th('soknader', 'NFR-søknader', 'Søknader til Forskningsrådet (prosjektansvarlig)')}
              {th('innvilget', 'Innvilget', 'Innvilgede søknader')}
              {th('rate', 'Suksessrate', 'Innvilget / (innvilget + avslag); søknader under behandling er holdt utenfor')}
              {th('belop', 'Bevilget (mill. kr)', 'Samlet bevilget beløp for prosjektene, ført på søknadsåret')}
              {!okonomi && th('euDelt', 'EU-deltakelser', 'Deltakelser i Horizon Europe-prosjekter (koordinator eller partner)')}
              {!okonomi && th('eu', 'EU-bidrag (mill. euro)', 'EU-bidrag i Horizon Europe, etter år for signert avtale')}
            </tr>
          </thead>
          <tbody>
            {rader.map((r) => (
              <tr key={r.k} style={{ borderTop: '1px solid var(--nmbu-neutral-3)', fontWeight: r.nmbu ? 700 : 400, backgroundColor: r.nmbu ? 'var(--nmbu-green-light)' : undefined }}>
                <td className="px-3 py-1.5 whitespace-nowrap">{r.navn}</td>
                <td className="px-3 py-1.5 text-right">{nf(r.soknader)}</td>
                <td className="px-3 py-1.5 text-right">{nf(r.innvilget)}</td>
                <td className="px-3 py-1.5 text-right">{r.rate == null ? '–' : `${nf(r.rate, 1)} %`}</td>
                <td className="px-3 py-1.5 text-right">{nf(r.belop, 1)}</td>
                {!okonomi && <td className="px-3 py-1.5 text-right">{nf(r.euDelt)}</td>}
                {!okonomi && <td className="px-3 py-1.5 text-right">{nf(r.eu, 2)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-start gap-2 text-[11px] rounded-lg px-3 py-2 mt-3" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', color: '#78350F' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Forskningsrådets åpne søknadsdata mangler søknader fra det nye saksbehandlingssystemet (Tibi) fra 2023, så antall søknader er for lavt fra 2023 og suksessraten gjelder bare søknadene som er med. Bare prosjektansvarlig institusjon telles; partnere som får deler av bevilgningen er ikke med.{enheter.some(([k]) => k.startsWith('1173_')) && ' For NMBU-fakultetene er nesten halvparten av søknadene registrert på universitetsnivå og kan ikke fordeles, så fakultetstallene er minimumstall.'}</span>
      </div>
      <div className="flex flex-wrap gap-x-3 mt-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
        Kilder, hentet {data.hentet.slice(0, 10).split('-').reverse().join('.')}:
        {data.kilder.map((k) => <a key={k.url} href={k.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1" style={{ color: 'var(--nmbu-green-dark)' }}><ExternalLink className="w-3 h-3" /> {k.navn}</a>)}
      </div>
    </div>
  );
}
