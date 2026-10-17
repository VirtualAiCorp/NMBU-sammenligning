import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Table2, X, Award, Scale, Info, ExternalLink, Search, School } from 'lucide-react';
import { Kort, Laster, Merke, Valg, Velger, dato, nf, td, tdV, th, thV, thead, useFil } from './marked/felles';

/**
 * HH-modulen «Studiesentre og eksamenssteder» (?studiesentre eller ?studiesentre=<id>): mulige samarbeidspartnere for å
 * avvikle fysisk eksamen rundt om i landet for nett- og deltidsstudentene (først ECN181-B, skoleeksamen fra høsten 2027).
 * Data: public/studiesentre/data.json (scripts/build-studiesentre.py fra data/marked/studiesentre/, status-og-metode §61).
 * Kartflisene er Kartverkets gråtonekart, som i MarkedStudiesteder.
 */

type Kat = 'studiesenter' | 'campus' | 'annet';
type Status = 'bekreftet' | 'avvikler' | 'nei' | 'ukjent';
interface Anbefalt { nr: number; rolle: 'anbefalt' | 'reserve' | 'studiesenter'; omrade: string; begrunnelse: string; alternativ: string | null }
interface Sted {
  id: string; navn: string; kat: Kat; type: string; inst: string | null; instKort: string | null; eier: string | null;
  adresse: string | null; postnr: string | null; poststed: string | null; kommune: string | null; fylke: string; landsdel: string;
  lat: number | null; lon: number | null; km: number | null;
  nettside: string | null; epost: string | null; telefon: string | null; eksamensEpost: string | null;
  status: Status; statusGrunn: string; eksamenFor: string[] | null; digital: string | null; lokaler: string | null;
  studietilbud: string[] | null; studenter2025: number | null; prisKr: number | null; pris: string | null;
  merknad: string | null; merknad2: string | null; kilde: string[]; hentet: string; sikkerhet: string; kildefil: string;
  anbefalt: Anbefalt | null; sammeSted: string[];
}
interface Ordning { institusjon: string; ordning: string; beskrivelse: string; vilkår: string; pris: string | null; kilde: string[]; hentet: string }
interface Data {
  hentet: string; as: { lat: number; lon: number }; statusTekst: Record<Status, string>; landsdeler: string[];
  telling: { steder: number; medKoordinater: number; kat: Record<Kat, number>; status: Record<Status, number>; landsdel: Record<string, number>; anbefalt: number; medPris: number };
  priser: { min: number; maks: number } | null; steder: Sted[]; ordninger: Ordning[];
}

let last: Promise<Data | null> | null = null;
const hent = () => (last ??= fetch(`${import.meta.env.BASE_URL}studiesentre/data.json`).then((r) => (r.ok ? r.json() : null)).catch(() => { last = null; return null; }));

const KARTFLISER = 'https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png';
const NORGE: L.LatLngBoundsExpression = [[57.8, 4.4], [71.3, 31.2]];
const STATUS_FARGE: Record<Status, string> = { bekreftet: '#047857', avvikler: '#CA8A04', nei: '#b91c1c', ukjent: '#9CA3AF' };
const STATUSER: Status[] = ['bekreftet', 'avvikler', 'nei', 'ukjent'];
const KAT_TEKST: Record<Kat, string> = { studiesenter: 'Studiesenter', campus: 'Campus', annet: 'Annet' };
const KAT_FORM: Record<Kat, string> = { campus: 'sirkel', studiesenter: 'kvadrat', annet: 'trekant' };
const ROLLE_TEKST: Record<Anbefalt['rolle'], string> = { anbefalt: 'Anbefalt campus', reserve: 'Reserve', studiesenter: 'Studiesenter' };
const NMBU_FARGE = '#00594F';
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const vertNavn = (u: string) => { try { return new URL(u).hostname.replace(/^www\d?\./, ''); } catch { return u; } };
const kr = (v: number) => `${nf(v)} kr`;

/** SVG-form per kategori: campus = sirkel, studiesenter = kvadrat, annet = trekant. Anbefalte får mørk, tykk kant. */
function formSvg(kat: Kat, farge: string, s: number, kant: string, kb: number) {
  const h = s / 2, i = kb / 2 + 0.5;
  const form = kat === 'campus' ? `<circle cx="${h}" cy="${h}" r="${h - i}"/>`
    : kat === 'studiesenter' ? `<rect x="${i}" y="${i}" width="${s - 2 * i}" height="${s - 2 * i}" rx="1.5"/>`
      : `<polygon points="${h},${i} ${s - i},${s - i} ${i},${s - i}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><g fill="${farge}" fill-opacity="0.85" stroke="${kant}" stroke-width="${kb}">${form}</g></svg>`;
}

function Prikk({ status }: { status: Status }) {
  return <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle shrink-0" style={{ backgroundColor: STATUS_FARGE[status] }} />;
}
function Form({ kat, farge = 'var(--nmbu-neutral-2)' }: { kat: Kat; farge?: string }) {
  const s = 10;
  return (
    <svg width={s} height={s} viewBox="0 0 10 10" aria-hidden className="inline-block align-middle">
      {kat === 'campus' && <circle cx={5} cy={5} r={4.2} fill={farge} />}
      {kat === 'studiesenter' && <rect x={1} y={1} width={8} height={8} rx={1.2} fill={farge} />}
      {kat === 'annet' && <polygon points="5,0.8 9.3,9.2 0.7,9.2" fill={farge} />}
    </svg>
  );
}
function Tall({ etikett, verdi, under }: { etikett: string; verdi: string; under?: string }) {
  return (
    <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
      <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>{etikett}</div>
      <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 700, color: 'var(--nmbu-green-dark)', lineHeight: 1.3 }}>{verdi}</div>
      {under && <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-1)', lineHeight: 1.4 }}>{under}</div>}
    </div>
  );
}
function Lenker({ kilder }: { kilder: string[] }) {
  return (
    <span className="inline">
      {kilder.map((k, i) => (
        <span key={k}>{i > 0 && ' · '}<a href={k} target="_blank" rel="noreferrer" className="underline break-all" style={{ color: 'var(--nmbu-green-dark)' }}>{vertNavn(k)}</a></span>
      ))}
    </span>
  );
}

export function Studiesentre({ initial }: { initial?: string | null }) {
  const data = useFil<Data>(hent);
  if (data === undefined) return <Laster tekst="Laster studiesentrene og eksamensstedene …" />;
  if (data === null) return <Laster tekst="Fant ikke dataene (studiesentre/data.json)." />;
  return <Visning d={data} initial={initial && data.steder.some((s) => s.id === initial) ? initial : null} />;
}

function Visning({ d, initial }: { d: Data; initial: string | null }) {
  const [kat, setKat] = useState<'alle' | Kat>('alle');
  const [status, setStatus] = useState<'alle' | Status>('alle');
  const [landsdel, setLandsdel] = useState('alle');
  const [fylke, setFylke] = useState('alle');
  const [bareAnbefalt, setBareAnbefalt] = useState(false);
  const [sok, setSok] = useState('');
  const [sort, setSort] = useState<'nord' | 'avstand'>('nord');
  const [valgt, setValgt] = useState<string | null>(initial);
  const kortRef = useRef<HTMLDivElement>(null);
  const per = useMemo(() => new Map(d.steder.map((s) => [s.id, s])), [d]);

  const fylker = useMemo(() => [...new Set(d.steder.filter((s) => landsdel === 'alle' || s.landsdel === landsdel).map((s) => s.fylke))]
    .sort((a, b) => a.localeCompare(b, 'nb')), [d, landsdel]);
  useEffect(() => { if (fylke !== 'alle' && !fylker.includes(fylke)) setFylke('alle'); }, [fylker, fylke]);

  const rader = useMemo(() => {
    const q = sok.trim().toLowerCase();
    const ut = d.steder.filter((s) => (kat === 'alle' || s.kat === kat) && (status === 'alle' || s.status === status)
      && (landsdel === 'alle' || s.landsdel === landsdel) && (fylke === 'alle' || s.fylke === fylke) && (!bareAnbefalt || s.anbefalt)
      && (!q || [s.navn, s.inst, s.instKort, s.poststed, s.kommune, s.fylke, s.adresse, s.merknad, s.lokaler].some((v) => v?.toLowerCase().includes(q))));
    if (sort === 'avstand') ut.sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity));
    return ut; // dataene er allerede sortert nord til sør
  }, [d, kat, status, landsdel, fylke, bareAnbefalt, sok, sort]);

  // ── Kartet (Leaflet direkte, som i MarkedStudiesteder) ───────────────────
  const kartDiv = useRef<HTMLDivElement>(null);
  const kart = useRef<L.Map | null>(null);
  const lag = useRef<L.LayerGroup | null>(null);
  useEffect(() => {
    if (!kartDiv.current || kart.current) return;
    const m = L.map(kartDiv.current, { scrollWheelZoom: false, minZoom: 3, maxZoom: 14, zoomSnap: 0.5 });
    L.tileLayer(KARTFLISER, { maxZoom: 18, attribution: '© <a href="https://www.kartverket.no/" target="_blank" rel="noreferrer">Kartverket</a> (CC BY 4.0)' }).addTo(m);
    m.fitBounds(NORGE);
    lag.current = L.layerGroup().addTo(m);
    // NMBU Ås: fast markør med navnelapp
    L.marker([d.as.lat, d.as.lon], {
      icon: L.divIcon({ className: '', iconSize: [18, 18], iconAnchor: [9, 9], html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><polygon points="9,1 11.3,6.6 17.2,6.9 12.6,10.7 14.1,16.6 9,13.3 3.9,16.6 5.4,10.7 0.8,6.9 6.7,6.6" fill="${NMBU_FARGE}" stroke="#fff" stroke-width="1.2"/></svg>` }),
      zIndexOffset: 1000, keyboard: false,
    }).bindTooltip('<b>NMBU Ås</b>', { permanent: true, direction: 'right', offset: [8, 0], className: 'map-tooltip map-etikett' }).addTo(m);
    kart.current = m;
    return () => { m.remove(); kart.current = null; lag.current = null; };
  }, [d]);

  useEffect(() => {
    const g = lag.current;
    if (!g) return;
    g.clearLayers();
    // Ukjente først, så de andre ligger oppå; anbefalte og valgt øverst
    const vekt = (s: Sted) => (s.id === valgt ? 9 : s.anbefalt ? 5 : 0) + ({ ukjent: 0, nei: 1, avvikler: 2, bekreftet: 3 }[s.status]);
    for (const s of [...rader].filter((r) => r.lat != null && r.lon != null).sort((a, b) => vekt(a) - vekt(b))) {
      const erValgt = s.id === valgt;
      const str = s.anbefalt || erValgt ? 18 : s.status === 'ukjent' ? 11 : 14;
      const kant = erValgt ? '#111827' : s.anbefalt ? '#1f2937' : '#ffffff';
      const icon = L.divIcon({ className: '', iconSize: [str, str], iconAnchor: [str / 2, str / 2], html: formSvg(s.kat, STATUS_FARGE[s.status], str, kant, s.anbefalt || erValgt ? 2.4 : 1.2) });
      const mk = L.marker([s.lat as number, s.lon as number], { icon, title: s.navn, zIndexOffset: vekt(s) * 10 });
      mk.bindTooltip(
        `<div style="font-size:12px;line-height:1.45"><b>${esc(s.navn)}</b><br/>${esc(KAT_TEKST[s.kat])}${s.poststed ? ` · ${esc(s.poststed)}` : ''}, ${esc(s.fylke)}<br/>`
        + `<span style="color:${STATUS_FARGE[s.status]};font-weight:700">●</span> ${esc(d.statusTekst[s.status])}`
        + `${s.prisKr != null ? `<br/>Pris: ${esc(kr(s.prisKr))}` : ''}${s.km != null ? `<br/>${esc(nf(s.km))} km fra Ås (luftlinje)` : ''}`
        + `${s.anbefalt ? `<br/><b>${esc(ROLLE_TEKST[s.anbefalt.rolle])} nr. ${s.anbefalt.nr}</b>` : ''}</div>`,
        { className: 'map-tooltip', direction: 'top', offset: [0, -str / 2] },
      );
      mk.on('click', () => setValgt(s.id));
      mk.addTo(g);
    }
  }, [rader, valgt, d]);

  const velg = (id: string, rull = true) => {
    setValgt(id);
    const s = per.get(id);
    if (s?.lat != null && s.lon != null && kart.current) kart.current.setView([s.lat, s.lon], Math.max(kart.current.getZoom(), 7));
    if (rull) requestAnimationFrame(() => kortRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  };
  // Lenke med ?studiesentre=<id>: zoom til stedet når kartet er klart
  useEffect(() => { if (initial) velg(initial, false); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const t = d.telling;
  const valgtSted = valgt ? per.get(valgt) ?? null : null;
  const anbefalte = d.steder.filter((s) => s.anbefalt).sort((a, b) => (a.anbefalt as Anbefalt).nr - (b.anbefalt as Anbefalt).nr);
  const utenKart = rader.filter((s) => s.lat == null).length;
  const bekreftetKat = d.steder.filter((s) => s.status === 'bekreftet');

  return (
    <div className="space-y-5">
      {/* ── Ingress og nøkkeltall ─────────────────────────────────────────── */}
      <Kort ikon={School} tittel="Hvor kan nett- og deltidsstudentene ta fysisk eksamen?"
        undertekst={<>Handelshøyskolen ser etter samarbeidspartnere fra nord til sør som kan avvikle fysisk eksamen for NMBUs nett- og deltidsstudenter. Det første kjente behovet er valgemnet <b>ECN181-B</b> i det nettbaserte årsstudiet i bærekraftig økonomi og ledelse, som får 2 timers skoleeksamen fra høsten 2027. Siden samler studiesentrene, universitets- og høgskolecampusene og ordningene som finnes i dag, med felles kontaktinformasjon og kildene bak hver opplysning.</>}
        kilde={<>Kartlegging {dato(d.hentet)}: studiesentrenes og institusjonenes egne sider, forskrifter (Lovdata), Enhetsregisteret, Kartverkets adressesøk, Sikt og DBH 124. Se forbeholdene nederst.</>}>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
          <Tall etikett="Steder" verdi={nf(t.steder)} under={`${nf(t.kat.studiesenter)} studiesentre, ${nf(t.kat.campus)} campuser, ${nf(t.kat.annet)} andre`} />
          <Tall etikett="Bekreftet eksamen for andre" verdi={nf(t.status.bekreftet)}
            under={`${nf(bekreftetKat.filter((s) => s.kat === 'campus').length)} campuser (${nf(bekreftetKat.filter((s) => s.instKort === 'USN').length)} hos USN), ${nf(bekreftetKat.filter((s) => s.kat !== 'campus').length)} studie- og kompetansesentre`} />
          <Tall etikett="Avvikler eksamen, uklart for hvem" verdi={nf(t.status.avvikler)} under={`${nf(t.status.nei)} sier nei til eksterne, ${nf(t.status.ukjent)} ukjent`} />
          <Tall etikett="Landsdeler" verdi={nf(d.landsdeler.filter((l) => t.landsdel[l] > 0).length)} under={d.landsdeler.map((l) => `${l} ${nf(t.landsdel[l])}`).join(' · ')} />
          <Tall etikett="Priser der de er oppgitt" verdi={d.priser ? `${nf(d.priser.min)}–${nf(d.priser.maks)} kr` : '–'}
            under="Per eksamen: 600–750 kr hos studiesentrene, 2 500 kr pluss vakt hos USN" />
        </div>
      </Kort>

      {/* ── Filtre ─────────────────────────────────────────────────────────── */}
      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
        <div className="flex flex-wrap items-center gap-3">
          <Valg etikett="Kategori" verdi={kat} onVelg={setKat}
            valg={[{ id: 'alle', label: 'Alle' }, { id: 'studiesenter', label: 'Studiesentre' }, { id: 'campus', label: 'Campus' }, { id: 'annet', label: 'Annet' }]} />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Velger etikett="Eksamensstatus" verdi={status} onVelg={(v) => setStatus(v as 'alle' | Status)} bredde={250}
            valg={[{ id: 'alle', label: 'Alle' }, ...STATUSER.map((s) => ({ id: s, label: `${d.statusTekst[s]} (${t.status[s]})` }))]} />
          <Velger etikett="Landsdel" verdi={landsdel} onVelg={setLandsdel} valg={[{ id: 'alle', label: 'Hele landet' }, ...d.landsdeler.map((l) => ({ id: l, label: l }))]} />
          <Velger etikett="Fylke" verdi={fylke} onVelg={setFylke} valg={[{ id: 'alle', label: 'Alle fylker' }, ...fylker.map((f) => ({ id: f, label: f }))]} />
          <label className="flex flex-col gap-0.5" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
            Søk
            <span className="flex items-center gap-1 rounded-md px-2 py-1" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
              <Search className="w-3 h-3 shrink-0" />
              <input type="search" value={sok} onChange={(e) => setSok(e.target.value)} placeholder="Sted, institusjon, kommune …" aria-label="Søk i stedene"
                className="text-xs outline-none bg-transparent" style={{ color: 'var(--nmbu-neutral)', width: 190, maxWidth: '60vw' }} />
            </span>
          </label>
          <label className="flex items-center gap-1.5 text-xs pb-1" style={{ color: 'var(--nmbu-neutral-1)' }}>
            <input type="checkbox" checked={bareAnbefalt} onChange={(e) => setBareAnbefalt(e.target.checked)} /> Bare anbefalte ({t.anbefalt})
          </label>
        </div>
      </div>

      {/* ── Kart og kort ──────────────────────────────────────────────────── */}
      <Kort ikon={MapPin} tittel={`${nf(rader.length)} av ${nf(t.steder)} steder`}
        undertekst={<>Fargen viser eksamensstatus og formen viser kategori. Anbefalte steder er større og har mørk kant. Stjernen er NMBU på Ås. Klikk på et punkt eller en rad i tabellen for å se adresse, kontakt, eksamensinformasjon og kilder.</>}
        forbehold={[
          'Status «ukjent» betyr at kildene ikke sier noe om eksamen, ikke at stedet sier nei. De fleste store studiesteder har trolig eksamenslokaler.',
          `${nf(utenKart)} av stedene i utvalget mangler koordinater og vises bare i tabellen. Koordinater med sikkerhet «lav» er kommunepunktet, ikke adressen.`,
        ]}>
        <div className="grid lg:grid-cols-5 gap-4 min-w-0">
          <div className="lg:col-span-3 min-w-0">
            <div ref={kartDiv} style={{ height: 'min(640px, 75vh)', minHeight: 360, borderRadius: 10, border: '1px solid var(--nmbu-neutral-3)', zIndex: 0 }} aria-label="Kart over studiesentre og eksamenssteder" />
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-1)' }}>
              {STATUSER.map((s) => <span key={s} className="inline-flex items-center"><Prikk status={s} />{d.statusTekst[s]}</span>)}
              <span aria-hidden style={{ color: 'var(--nmbu-neutral-3)' }}>|</span>
              {(['campus', 'studiesenter', 'annet'] as Kat[]).map((k) => <span key={k} className="inline-flex items-center gap-1"><Form kat={k} />{KAT_TEKST[k]} ({KAT_FORM[k]})</span>)}
            </div>
          </div>
          <div className="lg:col-span-2 min-w-0" ref={kortRef} style={{ scrollMarginTop: 80 }}>
            {valgtSted
              ? <StedKort s={valgtSted} d={d} per={per} velg={(id) => velg(id, false)} lukk={() => setValgt(null)} />
              : <div className="rounded-xl p-4 text-sm" style={{ border: '1px dashed var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>Klikk på et punkt i kartet eller en rad i tabellen for å se stedet.</div>}
          </div>
        </div>
      </Kort>

      {/* ── Tabellen ─────────────────────────────────────────────────────── */}
      <Kort ikon={Table2} tittel="Alle stedene i utvalget"
        undertekst="Sortert fra nord til sør (synkende breddegrad), eller etter avstand i luftlinje fra NMBU på Ås. Klikk på en rad for å åpne kortet."
        hoyre={<Valg etikett="Sortering" verdi={sort} onVelg={setSort} valg={[{ id: 'nord', label: 'Nord til sør' }, { id: 'avstand', label: 'Avstand fra Ås' }]} />}>
        <div className="overflow-auto" style={{ maxHeight: 640 }}>
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0" style={{ zIndex: 1 }}>
              <tr style={thead}>
                <th className={thV}>Sted</th><th className={thV}>Kommune</th><th className={thV}>Landsdel</th>
                <th className={thV}>Eksamensstatus</th><th className={th}>Pris</th><th className={th}>Km fra Ås</th>
              </tr>
            </thead>
            <tbody>
              {rader.map((s) => (
                <tr key={s.id} onClick={() => velg(s.id)} className="cursor-pointer"
                  style={{ borderTop: '1px solid var(--nmbu-neutral-3)', ...(s.id === valgt ? { backgroundColor: 'var(--nmbu-beige-light)' } : {}) }}>
                  <td className={tdV} style={{ fontWeight: 600, minWidth: 200 }}>
                    <span className="mr-1.5"><Form kat={s.kat} farge={STATUS_FARGE[s.status]} /></span>{s.navn}
                    {s.anbefalt && <span className="ml-1.5 px-1.5 py-px rounded text-[10px] whitespace-nowrap align-middle" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 700 }}>{s.anbefalt.rolle === 'reserve' ? 'reserve' : `anbefalt ${s.anbefalt.nr}`}</span>}
                    {s.kat !== 'campus' && <Merke tekst={s.type} />}
                  </td>
                  <td className={tdV} style={{ color: 'var(--nmbu-neutral-1)' }}>{s.kommune ?? '–'}<span style={{ color: 'var(--nmbu-neutral-2)' }}>{`, ${s.fylke}`}</span></td>
                  <td className={tdV} style={{ color: 'var(--nmbu-neutral-1)' }}>{s.landsdel}</td>
                  <td className={tdV}><span className="inline-flex items-center whitespace-nowrap"><Prikk status={s.status} />{d.statusTekst[s.status]}</span></td>
                  <td className={td}>{s.prisKr != null ? kr(s.prisKr) : '–'}</td>
                  <td className={td}>{s.km != null ? nf(s.km) : '–'}</td>
                </tr>
              ))}
              {rader.length === 0 && <tr><td colSpan={6} className="px-3 py-4 text-center" style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen steder passer filtrene.</td></tr>}
            </tbody>
          </table>
        </div>
      </Kort>

      {/* ── Anbefalte samarbeidssteder ───────────────────────────────────── */}
      <Kort ikon={Award} tittel="Anbefalte samarbeidssteder"
        undertekst={<>13 campuser fra Alta til Porsgrunn fra campusrapporten, med HiØ Halden som reserve, pluss de tre studiesentrene som bekrefter eksamen for studenter fra andre institusjoner. Kriteriene er dekning av alle landsdeler, dokumentert eksamenserfaring (helst med andres kandidater), felles eksamenssystem (WISEflow) og kapasitet. Østlandet nær Ås dekkes av NMBU selv. Kontakt først stedene med dokumentert praksis: USN, UiT (med studiesentrene), UiB og NTNU.</>}
        kilde={<>Kilde: campusrapporten §5 (docs/marked/studiesentre-campus.md) og studiesenterkartleggingene for nord og sør, 17.10.2026.</>}
        forbehold={['Ingen av stedene har avtale med NMBU. Statusen viser hva stedet gjør i dag, og en avtale mellom NMBU og en annen institusjon vil ha egne vilkår og priser.']}>
        <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))' }}>
          {anbefalte.map((s) => {
            const a = s.anbefalt as Anbefalt;
            return (
              <button key={s.id} onClick={() => velg(s.id)} className="rounded-lg p-3 text-left flex gap-3 min-w-0"
                style={{ border: `1px solid ${a.rolle === 'anbefalt' ? 'var(--nmbu-neutral-3)' : 'var(--nmbu-green-3)'}`, backgroundColor: a.rolle === 'anbefalt' ? '#fff' : 'var(--nmbu-beige-light)', ...(s.id === valgt ? { outline: `2px solid ${NMBU_FARGE}` } : {}) }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 tabular-nums" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 700, fontSize: 12 }}>
                  {a.rolle === 'reserve' ? 'R' : a.rolle === 'studiesenter' ? 'S' : a.nr}
                </span>
                <span className="min-w-0 block" style={{ fontSize: 12, lineHeight: 1.5 }}>
                  <span className="block" style={{ fontSize: 10, fontWeight: 700, color: 'var(--nmbu-neutral-2)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{a.omrade}{a.rolle === 'studiesenter' ? ' · studiesenter' : ''}</span>
                  <span className="block" style={{ fontWeight: 700, color: 'var(--nmbu-neutral)' }}>{s.navn}</span>
                  <span className="block" style={{ color: 'var(--nmbu-neutral-2)' }}>{[s.adresse, [s.postnr, s.poststed].filter(Boolean).join(' ')].filter(Boolean).join(', ')}{s.km != null ? ` · ${nf(s.km)} km fra Ås` : ''}</span>
                  <span className="flex items-center mt-0.5" style={{ fontWeight: 600 }}><Prikk status={s.status} />{d.statusTekst[s.status]}{s.prisKr != null ? ` · ${kr(s.prisKr)}` : ''}</span>
                  <span className="block mt-1" style={{ color: 'var(--nmbu-neutral-1)' }}>{a.begrunnelse}</span>
                  {a.alternativ && <span className="block" style={{ color: 'var(--nmbu-neutral-1)' }}><b>Alternativ:</b> {a.alternativ}</span>}
                  {s.status === 'nei' && <span className="block mt-1 rounded px-2 py-1" style={{ backgroundColor: '#FEF2F2', color: 'var(--nmbu-neutral)' }}><b>Merk:</b> {s.statusGrunn} Det krever i så fall en institusjonsavtale.</span>}
                </span>
              </button>
            );
          })}
        </div>
      </Kort>

      {/* ── Ordninger ─────────────────────────────────────────────────────── */}
      <Kort ikon={Scale} tittel="Ordninger for eksamen et annet sted"
        undertekst="Hva institusjonene tillater egne studenter, og hvem som avvikler eksamen for andre. Prisene er det studentene betaler i dag."
        kilde={<>Kilde: forskriftene på Lovdata og institusjonenes egne eksamenssider, Sikt og USNs merknader til forskriften. Hentet 17.10.2026.</>}>
        <ul className="space-y-1.5 mb-4" style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--nmbu-neutral)' }}>
          <li className="flex gap-2"><span style={{ color: 'var(--nmbu-green-dark)', fontWeight: 700 }}>1.</span><span><b>Ingen nasjonal ordning.</b> Hver institusjon fastsetter eksamenssted i egen forskrift. Åpningene som finnes er søknadsbaserte, gjelder enkeltstudenter, og studenten betaler.</span></li>
          <li className="flex gap-2"><span style={{ color: 'var(--nmbu-green-dark)', fontWeight: 700 }}>2.</span><span><b>USN tar imot andre for 2 500 kr per eksamen per student pluss vakt</b>, på alle campusene. Det er verifisert i USNs merknader til forskriften (§ 7-17 (5)). HiØ tar også imot andres kandidater i Halden (pris ikke oppgitt).</span></li>
          <li className="flex gap-2"><span style={{ color: 'var(--nmbu-green-dark)', fontWeight: 700 }}>3.</span><span><b>WISEflow via Sikt gjør det enkelt.</b> De fleste institusjonene, også NMBU, bruker nå samme eksamenssystem. En NMBU-kandidat skriver i NMBUs WISEflow på egen PC med låst nettleser, så vertsstedet trenger bare rom, strøm, nett og eksamensvakter.</span></li>
          <li className="flex gap-2"><span style={{ color: 'var(--nmbu-green-dark)', fontWeight: 700 }}>4.</span><span><b>HVL tar ikke imot eksterne</b>, og UiA har sluttet med det fra 1.1.2025. Begge må i så fall håndteres som institusjonsavtaler.</span></li>
        </ul>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead><tr style={thead}><th className={thV}>Institusjon</th><th className={thV}>Ordning</th><th className={thV}>Vilkår</th><th className={thV}>Pris</th><th className={thV}>Kilde</th></tr></thead>
            <tbody>
              {d.ordninger.map((o, i) => (
                <tr key={i} className="align-top" style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
                  <td className={tdV} style={{ fontWeight: 600, minWidth: 130 }}>{o.institusjon}</td>
                  <td className={tdV} style={{ minWidth: 260, lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 600 }}>{o.ordning}</div>
                    <details><summary className="cursor-pointer" style={{ color: 'var(--nmbu-neutral-2)' }}>Beskrivelse</summary><div className="mt-1" style={{ color: 'var(--nmbu-neutral-1)' }}>{o.beskrivelse}</div></details>
                  </td>
                  <td className={tdV} style={{ minWidth: 200, lineHeight: 1.5, color: 'var(--nmbu-neutral-1)' }}>{o.vilkår}</td>
                  <td className={tdV} style={{ minWidth: 160, lineHeight: 1.5 }}>{o.pris ?? <span style={{ color: 'var(--nmbu-neutral-2)' }}>ikke oppgitt</span>}</td>
                  <td className={tdV} style={{ minWidth: 140, lineHeight: 1.5 }}><Lenker kilder={o.kilde} /><div style={{ color: 'var(--nmbu-neutral-2)' }}>{dato(o.hentet)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kort>

      {/* ── Forbehold og kilder ───────────────────────────────────────────── */}
      <Kort ikon={Info} tittel="Forbehold og kilder">
        <ul className="space-y-1.5" style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--nmbu-neutral-1)' }}>
          <li><b>Ukjent er ikke nei.</b> Tomme felt (null i dataene) betyr at kildene ikke sier noe. «Ingen eksamen for eksterne» brukes bare der kilden sier det uttrykkelig (HVL, UiA og HiØ Fredrikstad).</li>
          <li><b>Tidsavgrenset innhenting 17.10.2026.</b> Opplysningene er hentet fra nettsidene den dagen. Noen er gamle (for eksempel Kirkenes kompetansesenter fra 2009 og UiBs retningslinjer fra 2015), og det står i merknaden på stedet.</li>
          <li><b>studiesenteret.no er ikke lenger en kilde.</b> Nettverket Studiesenteret.no ble avviklet i 2019, og domenet har nå uvedkommende innhold. Medlemslisten til Norske utdannings- og studiesentre og HK-dirs tildelinger er brukt i stedet.</li>
          <li><b>Ta kontakt direkte.</b> Prisene er det stedene krever av studenter i dag. En avtale med NMBU vil ha egne vilkår, så eksamenskontorene og studiesentrene bør kontaktes direkte, først USN, UiT og UiB.</li>
          <li><b>Bare felles kontaktinformasjon.</b> E-post og telefon er sentralbord, postmottak, servicetorg eller eksamenskontor. Personlige adresser og numre er utelatt, også der de var den eneste kontakten.</li>
          <li><b>Fire dubletter er slått sammen.</b> USN Hallingdal og HVL Haugesund, Førde og Sogndal sto både i studiesenterkartleggingen og blant campusene. De vises én gang, med begge merknadene.</li>
          <li><b>Kilder:</b> studiesentrenes og institusjonenes egne sider, forskrifter på Lovdata, Enhetsregisteret (Brreg), Kartverkets adressesøk (koordinater), Sikt (WISEflow-avtalen), DBH 124 (studenter 2025) og HK-dirs tildelinger til studiesentre. Hvert sted har sine kilder med lenke og dato i kortet. Avstandene er luftlinje fra NMBU Ås.</li>
        </ul>
      </Kort>
    </div>
  );
}

// ── Kortet for ett sted ───────────────────────────────────────────────────────
function StedKort({ s, d, per, velg, lukk }: { s: Sted; d: Data; per: Map<string, Sted>; velg: (id: string) => void; lukk: () => void }) {
  const rad = (etikett: string, verdi: ReactNode) => (verdi == null || verdi === '' ? null : (
    <div className="grid gap-2" style={{ gridTemplateColumns: '92px 1fr' }}>
      <div style={{ color: 'var(--nmbu-neutral-2)' }}>{etikett}</div><div className="min-w-0" style={{ overflowWrap: 'anywhere' }}>{verdi}</div>
    </div>
  ));
  const adr = [s.adresse, [s.postnr, s.poststed].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const ekst = (s.eksamenFor ?? []).filter(Boolean);
  return (
    <div className="rounded-xl p-4 space-y-3 min-w-0" style={{ border: `1px solid ${s.anbefalt ? NMBU_FARGE : 'var(--nmbu-neutral-3)'}`, backgroundColor: '#fff' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div style={{ fontFamily: "'Lora', serif", fontSize: 18, color: 'var(--nmbu-green-dark)', lineHeight: 1.3 }}>{s.navn}</div>
          <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)' }}>
            {KAT_TEKST[s.kat]}{s.kat !== 'campus' && s.type !== s.kat ? ` (${s.type})` : ''}{s.inst ? ` · ${s.inst}` : ''} · {s.landsdel}
          </div>
        </div>
        <button onClick={lukk} aria-label="Lukk kortet"><X className="w-4 h-4" style={{ color: 'var(--nmbu-neutral-2)' }} /></button>
      </div>
      <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--nmbu-beige-light)', fontSize: 12, lineHeight: 1.5 }}>
        <div className="flex items-center" style={{ fontWeight: 700 }}><Prikk status={s.status} />{d.statusTekst[s.status]}</div>
        <div style={{ color: 'var(--nmbu-neutral-1)' }}>{s.statusGrunn}</div>
      </div>
      {s.anbefalt && (
        <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontSize: 12, lineHeight: 1.5 }}>
          <b>{ROLLE_TEKST[s.anbefalt.rolle]}{s.anbefalt.rolle === 'anbefalt' ? ` nr. ${s.anbefalt.nr}` : ''} · {s.anbefalt.omrade}.</b> {s.anbefalt.begrunnelse}
          {s.anbefalt.alternativ && <> Alternativ: {s.anbefalt.alternativ}.</>}
        </div>
      )}
      <div className="space-y-1.5" style={{ fontSize: 12, lineHeight: 1.5 }}>
        {rad('Adresse', adr || 'ikke oppgitt')}
        {rad('Kommune', `${s.kommune ?? '–'}, ${s.fylke}${s.km != null ? ` · ${nf(s.km)} km fra Ås (luftlinje)` : ''}`)}
        {rad('E-post', s.epost)}
        {rad('Eksamenskontor', s.eksamensEpost)}
        {rad('Telefon', s.telefon)}
        {rad('Nettside', s.nettside && <a href={s.nettside} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline" style={{ color: 'var(--nmbu-green-dark)' }}>{vertNavn(s.nettside)}<ExternalLink className="w-3 h-3" /></a>)}
        {!s.epost && !s.telefon && !s.eksamensEpost && rad('Kontakt', <span style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen felles kontakt funnet (bare personlige, som er utelatt).</span>)}
      </div>
      <div className="space-y-1.5 pt-2" style={{ fontSize: 12, lineHeight: 1.5, borderTop: '1px solid var(--nmbu-neutral-3)' }}>
        <div style={{ fontWeight: 700 }}>Eksamen</div>
        {rad('For hvem', ekst.length ? ekst.join('; ') : <span style={{ color: 'var(--nmbu-neutral-2)' }}>ikke oppgitt</span>)}
        {rad('Pris', s.pris ?? <span style={{ color: 'var(--nmbu-neutral-2)' }}>ikke oppgitt</span>)}
        {rad('Digital/PC', s.digital ?? <span style={{ color: 'var(--nmbu-neutral-2)' }}>ikke oppgitt</span>)}
        {rad('Lokaler', s.lokaler ?? <span style={{ color: 'var(--nmbu-neutral-2)' }}>ikke oppgitt</span>)}
        {s.studenter2025 != null && rad('Studenter 2025', `${nf(s.studenter2025)} registrerte (DBH 124)`)}
        {s.studietilbud && rad('Studietilbud', s.studietilbud.join('; '))}
      </div>
      {(s.merknad || s.merknad2) && (
        <div className="space-y-1 pt-2" style={{ fontSize: 12, lineHeight: 1.5, borderTop: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)' }}>
          <div style={{ fontWeight: 700, color: 'var(--nmbu-neutral)' }}>Merknad</div>
          {s.merknad && <div>{s.merknad}</div>}
          {s.merknad2 && <div><i>Fra studiesenterkartleggingen:</i> {s.merknad2}</div>}
        </div>
      )}
      {s.sammeSted.length > 0 && (
        <div style={{ fontSize: 12 }}>
          <span style={{ color: 'var(--nmbu-neutral-2)' }}>Samme bygg eller rett ved: </span>
          {s.sammeSted.map((id, i) => <span key={id}>{i > 0 && ', '}<button className="underline" style={{ color: 'var(--nmbu-green-dark)' }} onClick={() => velg(id)}>{per.get(id)?.navn ?? id}</button></span>)}
        </div>
      )}
      <div className="pt-2" style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--nmbu-neutral-2)', borderTop: '1px solid var(--nmbu-neutral-3)' }}>
        <div>Sikkerhet for adressen: <b>{s.sikkerhet}</b> · hentet {dato(s.hentet)} · {s.kildefil}</div>
        <div>Kilder: <Lenker kilder={s.kilde} /></div>
      </div>
    </div>
  );
}
