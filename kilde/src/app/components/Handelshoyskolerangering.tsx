import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Lock, Info, Trophy, BookOpen, Building2, FileText, RotateCcw, ShieldCheck, ExternalLink } from 'lucide-react';

/**
 * Utkast til «Norwegian Business School Ranking» (intern, utforskende). Data fra scripts/build-rangering.py:
 * DBH (årsverk, publiseringspoeng, nivå 2), NVA (artikler med tidsskrift og ISSN) koblet mot ABDC, FT50, UTD24 og
 * AJG 2024 når lista er lagt inn, og opptak, Studiebarometeret og gjennomføring fra HH-sammenligningene.
 * Kryptert med samme oppskrift og passord som InternOpptak (AES-256-GCM, PBKDF2-SHA256).
 * Den sammensatte poengsummen regnes i nettleseren, så vektene kan prøves fritt.
 */

// ── Datatyper (speiler build-rangering.py) ───────────────────────────────────
interface DbhAar { arsverk: number | null; faglige: number | null; rekruttering: number | null; forsteAndel: number | null; studenter: number | null; publPoeng: number | null; publikasjoner: number | null; poengPerUff: number | null; poengPerFaglig: number | null; niva2Andel: number | null; studenterPerFaglig: number | null; }
interface ArtAar { n: number; nvi: number; intlAndel: number | null; forfatterandel: number | null; niva: Record<'0' | '1' | '2' | 'u', number>; ajg: Record<string, number> | null; abdc: Record<string, number>; ft50: number; utd24: number; }
interface Topp { aar: number; tittel: string | null; tidsskrift: string | null; ajg: string | null; abdc: string | null; ft50: boolean; utd24: boolean; niva: string; }
interface Utd { aar: number; program: number; plasser: number | null; forstevalg: number | null; fvPerPlass: number | null; poenggrenseMaks: number | null; poenggrenseMin: number | null; studiebarometer: number | null; normertTid: number | null; normertKull: number | null; }
interface Akk { navn?: string; type?: string; aar?: number | string | null; url?: string | null; [k: string]: unknown }
interface Skole {
  id: string; navn: string; navnEn?: string | null; kort: string; institusjon?: string | null; isNmbu: boolean; ren: boolean; referanse: boolean;
  akkreditering: (Akk | string)[]; rangeringer: (Record<string, unknown> | string)[]; enhetNotat?: string | null;
  dbh: Record<string, DbhAar>; artikler: Record<string, ArtAar>; topp: Topp[]; ajgFagfelt: Record<string, number>;
  utdanning: Partial<Record<'oa' | 'moa', Utd>>;
  /** ABS/AJG 4*, 4 og 3 per år fra NHHs forskningsrapport (åtte skoler), antall og per årsverk. */
  ajgNhh?: Record<string, Partial<Record<'4*' | '4' | '3', { n: number; perFte: number }>>> | null;
}
interface AjgNhhMeta { kilde: string; url: string; liste: string; nevner: string; usikker: Record<string, number[]>; sider: Record<string, number>; }
interface Kontroll { skole: string; enhet?: string | null; enhetNavn?: string | null; aar: number | null; maal: string; verdi: number | string | null; nevner?: string | null; kilde?: string | null; url?: string | null; side?: number | string | null; merknad?: string | null; vaar?: number | null; vaarAlt?: number | null; vaarNivaa?: string; avvikProsent?: number | null; traff?: 'hoved' | 'alt'; }
interface Data { versjon: number; generert: string; aar: [number, number]; lister: Record<'ajg' | 'abdc' | 'ft50' | 'utd24', boolean>; skoler: Skole[]; kontroll?: Kontroll[]; ajgNhh?: AjgNhhMeta | null; }

const PW_KEY = 'intern-opptak-pw'; // samme passord som den interne opptakssiden
const GRONN = 'var(--nmbu-green-dark)';
const nf = (v: number | null | undefined, d = 1) => v == null || !Number.isFinite(v) ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });
const kort = { backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' } as const;

// ── Dekryptering (WebCrypto), som i InternOpptak ─────────────────────────────
const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function dekrypter(pw: string): Promise<Data> {
  const r = await fetch(`${import.meta.env.BASE_URL}intern/rangering.json`, { cache: 'no-store' });
  if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) throw new Error('Fant ikke datafilen');
  const e = await r.json();
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(e.salt), iterations: e.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(e.iv) }, key, b64(e.data));
  return JSON.parse(new TextDecoder().decode(plain));
}

// ── Indikatorer ──────────────────────────────────────────────────────────────
const snitt = (xs: (number | null | undefined)[]) => { const v = xs.filter((x): x is number => x != null && Number.isFinite(x)); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const aarRekke = (fra: number, til: number) => Array.from({ length: til - fra + 1 }, (_, i) => String(fra + i));
/** Siste år med publiseringspoeng i DBH for flertallet av skolene. */
function sisteDbhAar(d: Data): number {
  for (let y = d.aar[1]; y >= d.aar[0]; y--) if (d.skoler.filter((s) => s.dbh[String(y)]?.publPoeng != null).length >= d.skoler.length / 2) return y;
  return d.aar[1];
}
function artSum(s: Skole, aar: string[]) {
  let n = 0, ft = 0, utd = 0, intl = 0, ajg34 = 0, ajgN = 0, abdcA = 0;
  for (const y of aar) {
    const a = s.artikler[y]; if (!a) continue;
    n += a.n; ft += a.ft50; utd += a.utd24; intl += (a.intlAndel ?? 0) * a.n / 100;
    if (a.ajg) { ajgN += a.n; ajg34 += (a.ajg['3'] ?? 0) + (a.ajg['4'] ?? 0) + (a.ajg['4*'] ?? 0); }
    abdcA += (a.abdc['A*'] ?? 0) + (a.abdc['A'] ?? 0);
  }
  return { n, ft, utd, intl, ajg34, ajgN, abdcA };
}

type Dim = 'Forskning' | 'Utdanning' | 'Fagmiljø' | 'Anerkjennelse';
const DIMS: Dim[] = ['Forskning', 'Utdanning', 'Fagmiljø', 'Anerkjennelse'];
/** Standardandeler per dimensjon (prosent). Forskningen velges i trinn; de andre deler resten i dette forholdet. */
const DIM_STANDARD: Record<Dim, number> = { Forskning: 75, Utdanning: 20, Fagmiljø: 3, Anerkjennelse: 2 };
const FORSK_STANDARD = 75;
const FORSK_TRINN = [50, 55, 60, 65, 70, 75, 80, 85];
interface Ind { id: string; label: string; dim: Dim; vekt: number; desc: string; fmt: (v: number | null) => string; verdi: (s: Skole) => number | null; }
function lagIndikatorer(d: Data): Ind[] {
  const y1 = sisteDbhAar(d);
  const tre = aarRekke(y1 - 2, y1);
  const fem = aarRekke(y1 - 4, y1);
  const harAjg = d.lister.ajg;
  return [
    { id: 'poeng', label: 'Poeng per faglig årsverk', dim: 'Forskning', vekt: 30, desc: `Publiseringspoeng per faglig årsverk inkl. rekrutteringsstillinger (UN1 + stipendiater og postdoktorer), snitt ${tre[0]}–${y1}. DBH 373/225. Samme definisjon som HK-dirs tilstandsrapport og HHs infografikk.`,
      fmt: (v) => nf(v, 2), verdi: (s) => snitt(tre.map((y) => s.dbh[y]?.poengPerUff)) },
    { id: 'niva2', label: 'Andel nivå 2', dim: 'Forskning', vekt: 10, desc: `Andel av publiseringspoengene på nivå 2, snitt ${tre[0]}–${y1}. DBH 374.`,
      fmt: (v) => nf(v, 0) + ' %', verdi: (s) => snitt(tre.map((y) => s.dbh[y]?.niva2Andel)) },
    harAjg
      ? { id: 'ajg34', label: 'Andel AJG 3–4*', dim: 'Forskning', vekt: 20, desc: `Andel av artiklene ${fem[0]}–${y1} i tidsskrift på AJG 2024 nivå 3, 4 eller 4*. NVA × AJG.`,
          fmt: (v) => nf(v, 0) + ' %', verdi: (s) => { const a = artSum(s, fem); return a.ajgN ? 100 * a.ajg34 / a.ajgN : null; } }
      : { id: 'abdcA', label: 'Andel ABDC A/A*', dim: 'Forskning', vekt: 10, desc: `Andel av artiklene ${fem[0]}–${y1} i tidsskrift med ABDC A eller A* (AJG brukes når lista er lagt inn). NVA × ABDC.`,
          fmt: (v) => nf(v, 0) + ' %', verdi: (s) => { const a = artSum(s, fem); return a.n ? 100 * a.abdcA / a.n : null; } },
    { id: 'ajgNhh', label: 'AJG 4/4* per årsverk', dim: 'Forskning', vekt: 10, desc: 'Artikler på AJG 2024 nivå 4 og 4* per årsverk (uten stipendiater), snitt 2022–2024. NHH Research Report 2024, tabell 4 og 5: bare åtte skoler (NHH, BI, NMBU, Nord, NTNU, UiA, UiS, UiT); for de andre fordeles vekten på de andre målene.',
      fmt: (v) => nf(v, 2), verdi: (s) => s.ajgNhh ? snitt(['2022', '2023', '2024'].map((y) => { const a = s.ajgNhh?.[y]; return a ? (a['4*']?.perFte ?? 0) + (a['4']?.perFte ?? 0) : null; })) : null },
    { id: 'ft50', label: 'FT50/UTD24 per 100 årsverk', dim: 'Forskning', vekt: 10, desc: `Artikler ${fem[0]}–${y1} i FT50 eller UTD24 per 100 UFF-årsverk (snitt). Én artikkel i begge lister telles én gang i FT50.`,
      fmt: (v) => nf(v, 1), verdi: (s) => { const a = artSum(s, fem); const uff = snitt(fem.map((y) => { const x = s.dbh[y]; return x?.faglige != null ? x.faglige + (x.rekruttering ?? 0) : null; })); return uff ? 100 * Math.max(a.ft, a.utd) / uff : null; } },
    { id: 'intl', label: 'Internasjonal sampublisering', dim: 'Forskning', vekt: 5, desc: `Andel artikler ${fem[0]}–${y1} med minst én utenlandsk medforfatter. NVA.`,
      fmt: (v) => nf(v, 0) + ' %', verdi: (s) => { const a = artSum(s, fem); return a.n ? 100 * a.intl / a.n : null; } },
    { id: 'pg', label: 'Poenggrense ØA', dim: 'Utdanning', vekt: 7, desc: 'Høyeste poenggrense (ordinær kvote) blant skolens bachelor i økonomi og administrasjon, siste opptak. Samordna opptak.',
      fmt: (v) => nf(v, 1), verdi: (s) => s.utdanning.oa?.poenggrenseMaks ?? null },
    { id: 'fv', label: 'Førstevalg per plass ØA', dim: 'Utdanning', vekt: 5, desc: 'Førstevalgsøkere per studieplass, bachelor ØA, alle studiesteder samlet. Samordna opptak. (Private BI og Kristiania har eget opptak og mangler.)',
      fmt: (v) => nf(v, 2), verdi: (s) => s.utdanning.oa?.fvPerPlass ?? null },
    { id: 'sb', label: 'Studiebarometeret ØA', dim: 'Utdanning', vekt: 5, desc: 'Helhetsvurdering (1–5), snitt over skolens ØA-bachelorprogram, siste år. studiebarometeret.no.',
      fmt: (v) => nf(v, 1), verdi: (s) => s.utdanning.oa?.studiebarometer ?? null },
    { id: 'normert', label: 'Fullført på normert tid ØA', dim: 'Utdanning', vekt: 3, desc: 'Andel av siste startkull i bachelor ØA som fullførte på normert tid. DBH.',
      fmt: (v) => nf(v, 0) + ' %', verdi: (s) => s.utdanning.oa?.normertTid ?? null },
    { id: 'forste', label: 'Andel førstestillinger', dim: 'Fagmiljø', vekt: 3, desc: `Professor, dosent, førsteamanuensis og førstelektor som andel av faglige årsverk, ${y1}. DBH 225.`,
      fmt: (v) => nf(v, 0) + ' %', verdi: (s) => s.dbh[String(y1)]?.forsteAndel ?? null },
    { id: 'akk', label: 'Akkrediteringer', dim: 'Anerkjennelse', vekt: 2, desc: 'Antall av AACSB, EQUIS og AMBA.',
      fmt: (v) => v == null ? '–' : String(v), verdi: (s) => akkNavn(s).filter((n) => /AACSB|EQUIS|AMBA/i.test(n)).length },
  ];
}
function akkNavn(s: Skole): string[] {
  return (s.akkreditering ?? []).map((a) => typeof a === 'string' ? a : String(a.navn ?? a.type ?? a.akkreditering ?? '')).filter(Boolean);
}

// ── Komponent ────────────────────────────────────────────────────────────────
export function Handelshoyskolerangering() {
  const [data, setData] = useState<Data | null>(null);
  const [pw, setPw] = useState('');
  const [feil, setFeil] = useState<string | null>(null);
  const [laster, setLaster] = useState(false);
  const lasOpp = async (p: string, lagre: boolean) => {
    setLaster(true); setFeil(null);
    try {
      setData(await dekrypter(p));
      if (lagre) try { sessionStorage.setItem(PW_KEY, p); } catch { /* privat modus */ }
    } catch (e) {
      setFeil(e instanceof Error && e.message === 'Fant ikke datafilen' ? 'Fant ikke datafilen.' : 'Feil passord.');
    } finally { setLaster(false); }
  };
  useEffect(() => { try { const p = sessionStorage.getItem(PW_KEY); if (p) void lasOpp(p, false); } catch { /* */ } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) {
    return (
      <div className="rounded-2xl p-8 max-w-lg mx-auto text-center" style={kort}>
        <Lock className="w-8 h-8 mx-auto mb-3" style={{ color: GRONN }} />
        <div style={{ fontFamily: "'Lora', serif", fontSize: 20, color: GRONN }}>Rangering av handelshøyskolene (utkast)</div>
        <p className="text-sm mt-2 mb-4" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Utforskende arbeid fra studierådgiverne ved Handelshøyskolen. Metoden er ikke ferdig, og tidsskriftnivåene er lisensbelagt, så siden er låst.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); void lasOpp(pw, true); }} className="flex gap-2 justify-center">
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Passord" autoFocus
            className="px-3 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--nmbu-neutral-3)', minWidth: 220 }} />
          <button type="submit" disabled={laster || !pw} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: GRONN, color: '#fff', opacity: laster || !pw ? 0.6 : 1 }}>
            {laster ? 'Åpner …' : 'Åpne'}
          </button>
        </form>
        {feil && <div className="text-sm mt-3" style={{ color: '#b91c1c' }}>{feil}</div>}
      </div>
    );
  }
  return <Rangering data={data} />;
}

type Fane = 'rangering' | 'publisering' | 'profil' | 'kontroll' | 'metode';
function Rangering({ data }: { data: Data }) {
  const [fane, setFane] = useState<Fane>('rangering');
  const [profil, setProfil] = useState<string>(() => data.skoler.find((s) => s.isNmbu)?.id ?? data.skoler[0]?.id);
  const faner: { id: Fane; label: string; icon: ReactNode }[] = [
    { id: 'rangering', label: 'Rangering', icon: <Trophy className="w-4 h-4" /> },
    { id: 'publisering', label: 'Publisering', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'profil', label: 'Skoleprofil', icon: <Building2 className="w-4 h-4" /> },
    { id: 'kontroll', label: 'Kvalitetssikring', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'metode', label: 'Metode og kilder', icon: <FileText className="w-4 h-4" /> },
  ];
  return (
    <div>
      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3 mb-5" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>Utkast {data.generert}. Rangeringen er et forslag til metode, ikke et ferdig resultat. Vektene kan endres fritt.
          {!data.lister.ajg && <> AJG 2024 (ABS-lista) vises foreløpig med NHHs publiserte tall for åtte skoler (nivå 3, 4 og 4*); egen kobling av alle artikler mot AJG kommer når tillatelsen fra Chartered ABS er på plass. ABDC brukes for alle skoler i mellomtiden.</>}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {faner.map((f) => (
          <button key={f.id} onClick={() => setFane(f.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
            style={fane === f.id ? { backgroundColor: GRONN, color: '#fff' } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' }}>
            {f.icon}{f.label}
          </button>
        ))}
      </div>
      {fane === 'rangering' && <Samlet data={data} apneProfil={(id) => { setProfil(id); setFane('profil'); }} />}
      {fane === 'publisering' && <Publisering data={data} />}
      {fane === 'profil' && <Profil data={data} id={profil} setId={setProfil} />}
      {fane === 'kontroll' && <KontrollFane data={data} />}
      {fane === 'metode' && <Metode data={data} />}
    </div>
  );
}

// ── Fane 1: sammensatt rangering ─────────────────────────────────────────────
function Samlet({ data, apneProfil }: { data: Data; apneProfil: (id: string) => void }) {
  const ind = useMemo(() => lagIndikatorer(data), [data]);
  const [vekt, setVekt] = useState<Record<string, number>>(() => Object.fromEntries(ind.map((i) => [i.id, i.vekt])));
  const [forsk, setForsk] = useState(FORSK_STANDARD);
  const [medRef, setMedRef] = useState(false);
  // Effektiv vekt (prosent) per mål: forskningsandelen velges i trinn på 5; resten deles mellom de andre
  // dimensjonene i standardforholdet. Innen en dimensjon er glidebryterne relative vekter.
  const eff = useMemo(() => {
    const andel: Record<Dim, number> = { Forskning: forsk, Utdanning: 0, Fagmiljø: 0, Anerkjennelse: 0 };
    const rest = DIMS.filter((d) => d !== 'Forskning');
    const std = rest.reduce((a, d) => a + DIM_STANDARD[d], 0);
    rest.forEach((d) => { andel[d] = (100 - forsk) * DIM_STANDARD[d] / std; });
    const ut: Record<string, number> = {};
    for (const d of DIMS) {
      const mine = ind.filter((i) => i.dim === d); const sum = mine.reduce((a, i) => a + vekt[i.id], 0);
      mine.forEach((i) => { ut[i.id] = sum ? andel[d] * vekt[i.id] / sum : 0; });
    }
    return { ut, andel };
  }, [ind, vekt, forsk]);
  const skoler = data.skoler.filter((s) => medRef || !s.referanse);

  const rader = useMemo(() => {
    // Min–maks-normalisering til 0–100 blant skolene som vises; manglende verdi → vekten fordeles på resten.
    const verdier = Object.fromEntries(ind.map((i) => [i.id, skoler.map((s) => i.verdi(s))]));
    const norm = (id: string, v: number | null) => {
      const xs = verdier[id].filter((x): x is number => x != null);
      if (v == null || xs.length < 2) return null;
      const lo = Math.min(...xs), hi = Math.max(...xs);
      return hi === lo ? 50 : 100 * (v - lo) / (hi - lo);
    };
    return skoler.map((s, k) => {
      let sum = 0, w = 0, mangler = 0;
      const delt: Record<string, { v: number | null; n: number | null }> = {};
      for (const i of ind) {
        const v = verdier[i.id][k]; const n = norm(i.id, v);
        delt[i.id] = { v, n };
        if (n == null) { if (eff.ut[i.id] > 0) mangler++; continue; }
        sum += n * eff.ut[i.id]; w += eff.ut[i.id];
      }
      return { s, score: w ? sum / w : null, delt, mangler };
    }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  }, [skoler, ind, eff]);

  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <div className="rounded-2xl p-5" style={kort}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div style={{ fontSize: 14, fontWeight: 600, color: GRONN }}>Vekter</div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
            <label className="flex items-center gap-1"><input type="checkbox" checked={medRef} onChange={(e) => setMedRef(e.target.checked)} /> Ta med referanseenheter</label>
            <button onClick={() => { setVekt(Object.fromEntries(ind.map((i) => [i.id, i.vekt]))); setForsk(FORSK_STANDARD); }} className="flex items-center gap-1" style={{ color: GRONN, fontWeight: 600 }}><RotateCcw className="w-3 h-3" /> Standardvekter</button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Forskningens andel (%):</span>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
            {FORSK_TRINN.map((f, k) => (
              <button key={f} onClick={() => setForsk(f)} className="px-2.5 py-1 text-xs"
                style={{ backgroundColor: forsk === f ? GRONN : '#fff', color: forsk === f ? '#fff' : 'var(--nmbu-neutral-1)', fontWeight: forsk === f ? 700 : 400, fontFamily: 'var(--font-mono, monospace)', borderRight: k < FORSK_TRINN.length - 1 ? '1px solid var(--nmbu-neutral-3)' : 'none' }}>{f}</button>
            ))}
          </div>
          <span className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
            Resten: {DIMS.filter((d) => d !== 'Forskning').map((d) => `${d} ${nf(eff.andel[d], 0)} %`).join(' · ')}
          </span>
        </div>
        <div className="grid gap-x-10 gap-y-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {DIMS.map((d) => (
            <div key={d}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--nmbu-neutral-2)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '6px 0 4px' }}>
                {d} · {nf(eff.andel[d], 0)} %
              </div>
              {ind.filter((i) => i.dim === d).map((i) => (
                <label key={i.id} className="flex items-center gap-2 text-xs py-0.5" title={i.desc} style={{ color: 'var(--nmbu-neutral-1)' }}>
                  <span style={{ width: 150, flexShrink: 0 }}>{i.label}</span>
                  <input type="range" min={0} max={40} value={vekt[i.id]} onChange={(e) => setVekt((p) => ({ ...p, [i.id]: Number(e.target.value) }))} style={{ flex: 1, accentColor: 'var(--nmbu-green-dark)' }} />
                  <span style={{ width: 52, flexShrink: 0, whiteSpace: 'nowrap', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }} title="Effektiv vekt i poengsummen">{nf(eff.ut[i.id], 1)} %</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-5 overflow-x-auto" style={kort}>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
              <th className="px-2 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>#</th>
              <th className="px-2 py-2 text-left" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Handelshøyskole</th>
              <th className="px-2 py-2 text-right" style={{ color: GRONN, fontWeight: 700 }}>Poeng</th>
              {ind.map((i) => <th key={i.id} className="px-2 py-2 text-right" title={i.desc} style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600, fontSize: 11, maxWidth: 90, opacity: eff.ut[i.id] ? 1 : 0.45 }}>{i.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rader.map((r, k) => (
              <tr key={r.s.id} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: r.s.isNmbu ? 'var(--nmbu-green-4)' : 'transparent' }}>
                <td className="px-2 py-2" style={{ color: 'var(--nmbu-neutral-2)' }}>{r.score == null ? '–' : k + 1}</td>
                <td className="px-2 py-2">
                  <button onClick={() => apneProfil(r.s.id)} className="text-left hover:underline" style={{ color: 'var(--nmbu-neutral-1)', fontWeight: r.s.isNmbu ? 700 : 500 }}>{r.s.kort}</button>
                  <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{r.s.navn}{r.s.referanse ? ' · referanse' : ''}{r.mangler ? ` · mangler ${r.mangler} mål` : ''}</div>
                </td>
                <td className="px-2 py-2 text-right" style={{ fontWeight: 700, color: GRONN, fontFamily: 'var(--font-mono, monospace)' }}>{nf(r.score, 0)}</td>
                {ind.map((i) => {
                  const c = r.delt[i.id];
                  return (
                    <td key={i.id} className="px-2 py-2 text-right" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12, opacity: eff.ut[i.id] ? 1 : 0.45 }} title={c.n == null ? 'Mangler' : `Normalisert: ${nf(c.n, 0)} av 100`}>
                      <div style={{ color: 'var(--nmbu-neutral-1)' }}>{i.fmt(c.v)}</div>
                      {c.n != null && <div className="ml-auto mt-0.5 rounded" style={{ height: 3, width: `${Math.max(4, c.n * 0.6)}%`, minWidth: 2, backgroundColor: 'var(--nmbu-green-3, #46B4A0)' }} />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs mt-3" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Velg forskningens andel i trinn på 5 %; de andre dimensjonene deler resten i standardforholdet (20 : 3 : 2), og glidebryterne fordeler vekten innen hver dimensjon (prosenten er målets effektive vekt). Hvert mål skaleres til 0–100 (laveste til høyeste blant skolene som vises), og poengsummen er det vektede snittet. Mangler en skole et mål, fordeles vekten på de andre målene for den skolen. Hold musepekeren over en kolonne for definisjon og kilde.
        </p>
      </div>
    </div>
  );
}

// ── Fane 2: publisering ──────────────────────────────────────────────────────
const LINJEFARGER = ['#025C4F', '#2F6FB0', '#C2671E', '#7A4FA0', '#B33A57', '#4C8A2A', '#8A6D1E', '#3A8C9C'];
function Publisering({ data }: { data: Data }) {
  const y1 = sisteDbhAar(data);
  const [valgt, setValgt] = useState<string[]>(() => {
    const hh = data.skoler.find((s) => s.isNmbu)?.id; const pref = ['nhh', 'bi', 'uia', 'uis'];
    return [hh, ...data.skoler.filter((s) => pref.includes(s.id)).map((s) => s.id)].filter((x): x is string => !!x).slice(0, 6);
  });
  const [maal, setMaal] = useState<'poengPerUff' | 'niva2Andel' | 'publPoeng'>('poengPerUff');
  const [liste, setListe] = useState<'ajg' | 'abdc'>(data.lister.ajg ? 'ajg' : 'abdc');
  const [periode, setPeriode] = useState<'1' | '5'>('5');
  const aar = aarRekke(data.aar[0], y1);
  const farge = (id: string) => data.skoler.find((s) => s.id === id)?.isNmbu ? '#025C4F' : LINJEFARGER[1 + (data.skoler.findIndex((s) => s.id === id) % (LINJEFARGER.length - 1))];
  const linje = aar.map((y) => ({ aar: y, ...Object.fromEntries(valgt.map((id) => [id, data.skoler.find((s) => s.id === id)?.dbh[y]?.[maal] ?? null])) }));
  const perAar = periode === '1' ? [String(y1)] : aarRekke(y1 - 4, y1);
  const nivaer = liste === 'ajg' ? ['ikke', '1', '2', '3', '4', '4*'] : ['ikke', 'C', 'B', 'A', 'A*'];
  const sekv = liste === 'ajg' ? ['#C9C4BC', '#CFE6DF', '#9FCFC2', '#5FA996', '#2E7D6B', '#014238'] : ['#C9C4BC', '#CFE6DF', '#8CC4B5', '#3F8E7B', '#014238'];
  const fordeling = data.skoler.filter((s) => !s.referanse).map((s) => {
    const t: Record<string, number> = {}; let n = 0;
    for (const y of perAar) { const a = s.artikler[y]; const L = a?.[liste]; if (!L) continue; for (const [k, v] of Object.entries(L)) { t[k] = (t[k] ?? 0) + v; n += v; } }
    return { navn: s.kort, isNmbu: s.isNmbu, n, ...Object.fromEntries(nivaer.map((k) => [k, n ? 100 * (t[k] ?? 0) / n : 0])) };
  }).filter((r) => r.n > 0).sort((a, b) => (b as Record<string, number>)[nivaer[nivaer.length - 1]] + (b as Record<string, number>)[nivaer[nivaer.length - 2]] - ((a as Record<string, number>)[nivaer[nivaer.length - 1]] + (a as Record<string, number>)[nivaer[nivaer.length - 2]]));
  const MAAL = { poengPerUff: 'Poeng per faglig årsverk (UFF)', niva2Andel: 'Andel nivå 2 (%)', publPoeng: 'Publiseringspoeng' } as const;
  return (
    <div className="grid gap-5">
      <AjgKort data={data} />
      <div className="rounded-2xl p-5" style={kort}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div style={{ fontSize: 14, fontWeight: 600, color: GRONN }}>{MAAL[maal]}, {data.aar[0]}–{y1}</div>
          <div className="flex gap-1">
            {(Object.keys(MAAL) as (keyof typeof MAAL)[]).map((m) => (
              <button key={m} onClick={() => setMaal(m)} className="px-3 py-1 rounded-md text-xs" style={maal === m ? { backgroundColor: GRONN, color: '#fff' } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' }}>{MAAL[m].split(' (')[0]}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {data.skoler.map((s) => {
            const on = valgt.includes(s.id);
            return <button key={s.id} onClick={() => setValgt((p) => on ? p.filter((x) => x !== s.id) : [...p, s.id])} className="px-2.5 py-1 rounded-lg text-xs"
              style={{ backgroundColor: on ? farge(s.id) : '#fff', color: on ? '#fff' : 'var(--nmbu-neutral-1)', border: '1px solid ' + (on ? farge(s.id) : 'var(--nmbu-neutral-3)') }}>{s.kort}</button>;
          })}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={linje} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-beige-light)" vertical={false} />
            <XAxis dataKey="aar" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => nf(v, maal === 'poengPerUff' ? 1 : 0)} />
            <Tooltip formatter={(v: number, k: string) => [nf(v, maal === 'poengPerUff' ? 2 : 1), data.skoler.find((s) => s.id === k)?.kort ?? k]} />
            <Legend formatter={(k: string) => data.skoler.find((s) => s.id === k)?.kort ?? k} wrapperStyle={{ fontSize: 11 }} />
            {valgt.map((id) => <Line key={id} type="monotone" dataKey={id} stroke={farge(id)} strokeWidth={data.skoler.find((s) => s.id === id)?.isNmbu ? 3 : 2} dot={{ r: 3 }} connectNulls />)}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl p-5" style={kort}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div style={{ fontSize: 14, fontWeight: 600, color: GRONN }}>Artikler etter {liste === 'ajg' ? 'AJG 2024-nivå' : 'ABDC-nivå'}, {perAar[0]}{perAar.length > 1 ? `–${y1}` : ''}</div>
          <div className="flex gap-1">
            {data.lister.ajg && (['ajg', 'abdc'] as const).map((l) => <button key={l} onClick={() => setListe(l)} className="px-3 py-1 rounded-md text-xs" style={liste === l ? { backgroundColor: GRONN, color: '#fff' } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' }}>{l.toUpperCase()}</button>)}
            {(['1', '5'] as const).map((p) => <button key={p} onClick={() => setPeriode(p)} className="px-3 py-1 rounded-md text-xs" style={periode === p ? { backgroundColor: GRONN, color: '#fff' } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' }}>{p === '1' ? String(y1) : 'Fem år'}</button>)}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={Math.max(240, fordeling.length * 26 + 40)}>
          <BarChart data={fordeling} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }} barCategoryGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-beige-light)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v} %`} />
            <YAxis type="category" dataKey="navn" width={90} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number, k: string) => [nf(v, 0) + ' %', k === 'ikke' ? 'Ikke på lista' : `Nivå ${k}`]} labelFormatter={(l: string) => { const r = fordeling.find((x) => x.navn === l); return `${l} (${r?.n ?? 0} artikler)`; }} />
            <Legend formatter={(k: string) => k === 'ikke' ? 'Ikke på lista' : k} wrapperStyle={{ fontSize: 11 }} />
            {nivaer.map((k, i) => <Bar key={k} dataKey={k} stackId="a" fill={sekv[i]} stroke="#fff" strokeWidth={1} />)}
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Alle vitenskapelige artikler i NVA der minst én forfatter er tilknyttet enheten, koblet på ISSN. Sortert etter andel på de to høyeste nivåene.
        </p>
      </div>
    </div>
  );
}

// ── AJG 2024 (ABS) fra NHHs forskningsrapport ────────────────────────────────
const AJG_FARGE: Record<'3' | '4' | '4*', string> = { '3': '#9FCFC2', '4': '#2E7D6B', '4*': '#014238' };
function AjgKort({ data }: { data: Data }) {
  const meta = data.ajgNhh;
  const [aar, setAar] = useState<'2024' | 'sum'>('sum');
  const [perFte, setPerFte] = useState(true);
  const AAR = ['2020', '2021', '2022', '2023', '2024'];
  const rader = data.skoler.filter((s) => s.ajgNhh).map((s) => {
    const v = (niva: '3' | '4' | '4*') => {
      const ys = aar === 'sum' ? AAR : [aar];
      const xs = ys.map((y) => s.ajgNhh?.[y]?.[niva]).filter(Boolean) as { n: number; perFte: number }[];
      if (!xs.length) return 0;
      return perFte ? xs.reduce((a, x) => a + x.perFte, 0) / xs.length : xs.reduce((a, x) => a + x.n, 0);
    };
    return { navn: s.kort, isNmbu: s.isNmbu, '4*': v('4*'), '4': v('4'), '3': v('3') };
  }).sort((a, b) => (b['4*'] + b['4']) - (a['4*'] + a['4']));
  if (!meta || !rader.length) return null;
  const knapp = (on: boolean) => on ? { backgroundColor: GRONN, color: '#fff' } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' };
  return (
    <div className="rounded-2xl p-5" style={kort}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <div style={{ fontSize: 14, fontWeight: 600, color: GRONN }}>AJG 2024 (ABS): artikler på nivå 3, 4 og 4*{perFte ? ' per årsverk' : ''}, {aar === 'sum' ? '2020–2024' : aar}</div>
        <div className="flex gap-1">
          <button onClick={() => setPerFte(true)} className="px-3 py-1 rounded-md text-xs" style={knapp(perFte)}>Per årsverk</button>
          <button onClick={() => setPerFte(false)} className="px-3 py-1 rounded-md text-xs" style={knapp(!perFte)}>Antall</button>
          <button onClick={() => setAar('sum')} className="px-3 py-1 rounded-md text-xs" style={knapp(aar === 'sum')}>{perFte ? 'Snitt' : 'Sum'} 2020–2024</button>
          <button onClick={() => setAar('2024')} className="px-3 py-1 rounded-md text-xs" style={knapp(aar === '2024')}>2024</button>
        </div>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--nmbu-neutral-2)' }}>Sortert etter nivå 4 og 4*. Åtte skoler som NHH sammenligner seg med; de andre er ikke med i kilden.</p>
      <ResponsiveContainer width="100%" height={rader.length * 30 + 50}>
        <BarChart data={rader} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }} barCategoryGap={5}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-beige-light)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => nf(v, perFte ? 2 : 0)} />
          <YAxis type="category" dataKey="navn" width={90} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: number, k: string) => [nf(v, perFte ? 2 : 0), `AJG ${k}`]} />
          <Legend formatter={(k: string) => `AJG ${k}`} wrapperStyle={{ fontSize: 11 }} />
          {(['4*', '4', '3'] as const).map((k) => <Bar key={k} dataKey={k} stackId="a" fill={AJG_FARGE[k]} stroke="#fff" strokeWidth={1} />)}
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs mt-2" style={{ color: 'var(--nmbu-neutral-2)' }}>
        Kilde: <a href={meta.url} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: GRONN }}>{meta.kilde}</a> (s. {Object.entries(meta.sider).map(([k, s]) => `${s}: ${k}`).join(', ')}). Årsverk = {meta.nevner}. NHHs tabell for nivå 3 har samme antall i 2022 som i 2020 for nesten alle skolene, mens tallene per årsverk er ulike; 2022-antallet for nivå 3 er derfor usikkert. Egen kobling av alle artikler mot AJG kommer når tillatelsen fra Chartered ABS er på plass.
      </p>
    </div>
  );
}

// ── Fane 3: skoleprofil (som HHs infografikk) ────────────────────────────────
function Profil({ data, id, setId }: { data: Data; id: string; setId: (id: string) => void }) {
  const s = data.skoler.find((x) => x.id === id) ?? data.skoler[0];
  const y1 = sisteDbhAar(data);
  const aar = aarRekke(data.aar[0], y1);
  const sist = s.dbh[String(y1)];
  const harAjg = data.lister.ajg;
  const art = s.artikler[String(y1)];
  const L = harAjg ? art?.ajg : art?.abdc;
  const nivaer = harAjg ? ['ikke', '1', '2', '3', '4', '4*'] : ['ikke', 'C', 'B', 'A', 'A*'];
  const sekv = harAjg ? ['#C9C4BC', '#CFE6DF', '#9FCFC2', '#5FA996', '#2E7D6B', '#014238'] : ['#C9C4BC', '#CFE6DF', '#8CC4B5', '#3F8E7B', '#014238'];
  const stolper = nivaer.map((k, i) => ({ k: k === 'ikke' ? `Ikke ${harAjg ? 'AJG' : 'ABDC'}` : k, n: L?.[k] ?? 0, f: sekv[i] }));
  const n12 = art ? art.niva['1'] + art.niva['2'] : 0;
  const pai = art && n12 ? [{ k: 'Nivå 1', v: art.niva['1'], f: '#C9C4BC' }, { k: 'Nivå 2', v: art.niva['2'], f: '#025C4F' }] : [];
  const fag = Object.entries(s.ajgFagfelt ?? {}).sort((a, b) => b[1] - a[1]);
  const akk = akkNavn(s);
  const oa = s.utdanning.oa;
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-1.5">
        {data.skoler.map((x) => <button key={x.id} onClick={() => setId(x.id)} className="px-2.5 py-1 rounded-lg text-xs"
          style={x.id === s.id ? { backgroundColor: GRONN, color: '#fff' } : { backgroundColor: '#fff', color: 'var(--nmbu-neutral-1)', border: '1px solid var(--nmbu-neutral-3)' }}>{x.kort}</button>)}
      </div>
      <div className="rounded-2xl px-6 py-5" style={{ backgroundColor: GRONN, color: '#fff' }}>
        <div style={{ fontFamily: "'Lora', serif", fontSize: 22 }}>{s.navn}</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>{[s.navnEn, s.institusjon].filter(Boolean).join(' · ')}</div>
        <div className="flex flex-wrap gap-2 mt-3">
          {akk.length ? akk.map((a) => <span key={a} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>{a}</span>) : <span className="text-xs" style={{ opacity: 0.8 }}>Ingen internasjonal akkreditering registrert</span>}
        </div>
        <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
          {[
            ['Poeng per faglig årsverk', nf(sist?.poengPerUff, 2), String(y1)],
            ['Publiseringspoeng', nf(sist?.publPoeng, 1), String(y1)],
            ['Faglige årsverk', nf(sist?.faglige, 1), `+ ${nf(sist?.rekruttering, 1)} stip./postdok`],
            ['Andel nivå 2', sist?.niva2Andel != null ? nf(sist.niva2Andel, 0) + ' %' : '–', 'av poengene'],
            ['Artikler', art ? String(art.n) : '–', `NVA ${y1}`],
            ['Poenggrense ØA', nf(oa?.poenggrenseMaks, 1), oa ? `opptak ${oa.aar}` : 'ingen ØA i sammenligningen'],
          ].map(([l, v, u]) => (
            <div key={l}><div style={{ fontSize: 11, opacity: 0.8 }}>{l}</div><div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>{v}</div><div style={{ fontSize: 10, opacity: 0.7 }}>{u}</div></div>
          ))}
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        <div className="rounded-2xl p-5" style={kort}>
          <div style={{ fontSize: 14, fontWeight: 600, color: GRONN, marginBottom: 8 }}>Publiseringspoeng per faglig årsverk</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={aar.map((y) => ({ aar: y, v: s.dbh[y]?.poengPerUff ?? null }))} margin={{ top: 16, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-beige-light)" vertical={false} />
              <XAxis dataKey="aar" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => nf(v, 1)} />
              <Tooltip formatter={(v: number) => [nf(v, 2), 'Poeng per årsverk']} />
              <Line type="monotone" dataKey="v" stroke="#025C4F" strokeWidth={2.5} dot={{ r: 3 }} connectNulls label={{ position: 'top', fontSize: 10, formatter: (v: number) => nf(v, 2) }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl p-5" style={kort}>
          <div style={{ fontSize: 14, fontWeight: 600, color: GRONN, marginBottom: 8 }}>Nivå {y1}: {harAjg ? 'AJG' : 'ABDC'} og norsk nivå 1/2</div>
          <div className="grid gap-2" style={{ gridTemplateColumns: '3fr 2fr' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stolper} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-beige-light)" vertical={false} />
                <XAxis dataKey="k" tick={{ fontSize: 10 }} interval={0} /><YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v: number) => [v, 'Artikler']} />
                <Bar dataKey="n" radius={[4, 4, 0, 0]}>{stolper.map((x) => <Cell key={x.k} fill={x.f} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pai} dataKey="v" nameKey="k" innerRadius={40} outerRadius={75} stroke="#fff" strokeWidth={2}
                  label={({ v }: { v: number }) => `${nf(100 * v / (n12 || 1), 0)} %`} labelLine={false}>
                  {pai.map((x) => <Cell key={x.k} fill={x.f} />)}
                </Pie>
                <Tooltip formatter={(v: number, k: string) => [`${v} artikler`, k]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>Andel nivå 1/2 her er av artikler (NVA). Andelen av publiseringspoeng (DBH 374) er {sist?.niva2Andel != null ? nf(sist.niva2Andel, 0) + ' %' : 'ikke tilgjengelig'}.</p>
        </div>
      </div>

      {s.ajgNhh && (
        <div className="rounded-2xl p-5" style={kort}>
          <div style={{ fontSize: 14, fontWeight: 600, color: GRONN, marginBottom: 8 }}>AJG 2024 (ABS): artikler på nivå 3, 4 og 4*, 2020–2024</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={['2020', '2021', '2022', '2023', '2024'].map((y) => ({ aar: y, '3': s.ajgNhh?.[y]?.['3']?.n ?? 0, '4': s.ajgNhh?.[y]?.['4']?.n ?? 0, '4*': s.ajgNhh?.[y]?.['4*']?.n ?? 0 }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--nmbu-beige-light)" vertical={false} />
              <XAxis dataKey="aar" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v: number, k: string) => [v, `AJG ${k}`]} />
              <Legend formatter={(k: string) => `AJG ${k}`} wrapperStyle={{ fontSize: 11 }} />
              {(['3', '4', '4*'] as const).map((k) => <Bar key={k} dataKey={k} fill={AJG_FARGE[k]} radius={[4, 4, 0, 0]} />)}
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>Kilde: NHH Research Report 2024, tabell 4, 5 og 31. Antallet på nivå 3 i 2022 er usikkert (se Publisering).</p>
        </div>
      )}

      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        <div className="rounded-2xl p-5" style={kort}>
          <div style={{ fontSize: 14, fontWeight: 600, color: GRONN, marginBottom: 8 }}>Toppartikler {y1 - 4}–{y1} (FT50, UTD24, {harAjg ? 'AJG 4/4*' : 'ABDC A*'})</div>
          {s.topp.length === 0 ? <div className="text-sm" style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen artikler på disse listene.</div> : (
            <ul className="text-xs space-y-1.5" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {s.topp.filter((t) => t.aar >= y1 - 4).map((t, i) => (
                <li key={i} style={{ color: 'var(--nmbu-neutral-1)' }}>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--nmbu-neutral-2)' }}>{t.aar}</span> <i>{t.tidsskrift}</i>
                  {' '}{[t.ft50 && 'FT50', t.utd24 && 'UTD24', t.ajg && `AJG ${t.ajg}`, t.abdc && `ABDC ${t.abdc}`].filter(Boolean).map((b) => <span key={String(b)} className="px-1 rounded ml-1" style={{ backgroundColor: 'var(--nmbu-green-4)', color: GRONN, fontSize: 10 }}>{b}</span>)}
                  <div style={{ color: 'var(--nmbu-neutral-2)' }}>{t.tittel}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl p-5" style={kort}>
          <div style={{ fontSize: 14, fontWeight: 600, color: GRONN, marginBottom: 8 }}>Utdanning og enhet</div>
          <table className="w-full text-xs"><tbody>
            {([
              ['Bachelor ØA: førstevalg per plass', nf(oa?.fvPerPlass, 2)],
              ['Bachelor ØA: poenggrense (laveste–høyeste)', oa ? `${nf(oa.poenggrenseMin, 1)}–${nf(oa.poenggrenseMaks, 1)}` : '–'],
              ['Bachelor ØA: Studiebarometeret, helhet', nf(oa?.studiebarometer, 1)],
              ['Bachelor ØA: fullført på normert tid', oa?.normertTid != null ? `${nf(oa.normertTid, 0)} % (kull ${oa.normertKull})` : '–'],
              ['Master ØA: førstevalg per plass', nf(s.utdanning.moa?.fvPerPlass, 2)],
              ['Andel førstestillinger', sist?.forsteAndel != null ? nf(sist.forsteAndel, 0) + ' %' : '–'],
              ['Registrerte studenter per faglig årsverk', nf(sist?.studenterPerFaglig, 1)],
            ] as [string, string][]).map(([l, v]) => <tr key={l} style={{ borderBottom: '1px solid var(--nmbu-beige-light)' }}><td className="py-1.5" style={{ color: 'var(--nmbu-neutral-2)' }}>{l}</td><td className="py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)' }}>{v}</td></tr>)}
          </tbody></table>
          {fag.length > 0 && <div className="text-xs mt-3" style={{ color: 'var(--nmbu-neutral-2)' }}>AJG-fagfelt med artikler fra 2020: {fag.length} – {fag.slice(0, 6).map(([f, n]) => `${f} (${n})`).join(', ')}{fag.length > 6 ? ' …' : ''}</div>}
          {s.enhetNotat && <div className="text-xs mt-3 rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-2)' }}>Avgrensning: {s.enhetNotat}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Fane 4: kvalitetssikring mot eksterne tall ───────────────────────────────
const MAAL_NAVN: Record<string, string> = {
  publiseringspoeng: 'Publiseringspoeng', poeng_per_faglig: 'Poeng per faglig årsverk', poeng_per_uff: 'Poeng per UFF-årsverk',
  publikasjoner: 'Antall publikasjoner', niva2_andel: 'Andel nivå 2 (%)', ajg_4_andel: 'Andel AJG 4/4* (%)', ft50_antall: 'FT50-artikler', annet: 'Annet',
};
function KontrollFane({ data }: { data: Data }) {
  const k = data.kontroll ?? [];
  const [skole, setSkole] = useState<string>('alle');
  const navn = (id: string) => data.skoler.find((s) => s.id === id)?.kort ?? id;
  const rader = k.filter((r) => skole === 'alle' || r.skole === skole);
  const sml = k.filter((r) => r.avvikProsent != null);
  const innen = (g: number) => sml.filter((r) => Math.abs(r.avvikProsent as number) <= g).length;
  const farge = (a: number | null | undefined) => a == null ? 'var(--nmbu-neutral-2)' : Math.abs(a) <= 2 ? '#1E7B4F' : Math.abs(a) <= 10 ? '#A86B00' : '#B42318';
  const merke = (a: number | null | undefined) => a == null ? 'ikke sammenlignbar' : Math.abs(a) <= 2 ? 'treffer' : Math.abs(a) <= 10 ? 'nær' : 'avvik';
  if (!k.length) return <div className="rounded-2xl p-6 text-sm" style={{ ...kort, color: 'var(--nmbu-neutral-2)' }}>Ingen eksterne kontrolltall er lagt inn ennå (data/rangering/kontroll/eksterne-tall.json).</div>;
  return (
    <div className="grid gap-5">
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {[['Eksterne tall', String(k.length), 'fra årsrapporter, HK-dir m.fl.'], ['Sammenlignbare', String(sml.length), 'samme mål, år og enhet'],
          ['Treffer (±2 %)', String(innen(2)), sml.length ? `${nf(100 * innen(2) / sml.length, 0)} % av de sammenlignbare` : ''],
          ['Avvik over 10 %', String(sml.length - innen(10)), 'se merknad og nevner']].map(([l, v, u]) => (
          <div key={l} className="rounded-2xl p-4" style={kort}>
            <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: GRONN, fontFamily: 'var(--font-mono, monospace)' }}>{v}</div>
            <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{u}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-5 overflow-x-auto" style={kort}>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {['alle', ...Array.from(new Set(k.map((r) => r.skole)))].map((id) => (
            <button key={id} onClick={() => setSkole(id)} className="px-2.5 py-1 rounded-lg text-xs"
              style={skole === id ? { backgroundColor: GRONN, color: '#fff' } : { backgroundColor: '#fff', color: 'var(--nmbu-neutral-1)', border: '1px solid var(--nmbu-neutral-3)' }}>{id === 'alle' ? 'Alle' : navn(id)}</button>
          ))}
        </div>
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse', minWidth: 860 }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
              {['Skole', 'År', 'Mål', 'Eksternt', 'Vårt', 'Avvik', 'Kilde'].map((h, i) => <th key={h} className={`px-2 py-2 ${i >= 3 && i <= 5 ? 'text-right' : 'text-left'}`} style={{ fontWeight: 600 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rader.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', verticalAlign: 'top' }}>
                <td className="px-2 py-1.5"><b>{navn(r.skole)}</b><div style={{ color: 'var(--nmbu-neutral-2)', fontSize: 10 }}>{r.enhetNavn ?? r.enhet}</div></td>
                <td className="px-2 py-1.5">{r.aar ?? '–'}</td>
                <td className="px-2 py-1.5">{MAAL_NAVN[r.maal] ?? r.maal}{r.nevner && <div style={{ color: 'var(--nmbu-neutral-2)', fontSize: 10 }}>Nevner: {r.nevner}</div>}</td>
                <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)' }}>{typeof r.verdi === 'number' ? nf(r.verdi, r.verdi < 10 ? 2 : r.verdi < 100 ? 1 : 0) : r.verdi ?? '–'}</td>
                <td className="px-2 py-1.5 text-right" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                  {r.vaar != null ? nf(r.vaar, r.vaar < 10 ? 2 : r.vaar < 100 ? 1 : 0) : '–'}
                  {r.vaarAlt != null && <div style={{ color: 'var(--nmbu-neutral-2)', fontSize: 10 }} title="Den andre nevneren: faglige uten / med stipendiater og postdoktorer">alt. {nf(r.vaarAlt, 2)}{r.traff === 'alt' ? ' ✓' : ''}</div>}
                  {r.vaarNivaa && <div style={{ color: 'var(--nmbu-neutral-2)', fontSize: 10 }}>{r.vaarNivaa}</div>}
                </td>
                <td className="px-2 py-1.5 text-right" style={{ color: farge(r.avvikProsent), fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {r.avvikProsent != null ? `${r.avvikProsent > 0 ? '+' : ''}${nf(r.avvikProsent, 1)} %` : '–'}<div style={{ fontSize: 10, fontWeight: 400 }}>{merke(r.avvikProsent)}</div>
                </td>
                <td className="px-2 py-1.5" style={{ maxWidth: 280 }}>
                  {r.url ? <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline" style={{ color: GRONN }}>{r.kilde ?? 'Kilde'}<ExternalLink className="w-3 h-3" /></a> : r.kilde}
                  {r.side != null && <span style={{ color: 'var(--nmbu-neutral-2)' }}> · s. {r.side}</span>}
                  {r.merknad && <div style={{ color: 'var(--nmbu-neutral-2)', fontSize: 10 }}>{r.merknad}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs mt-3" style={{ color: 'var(--nmbu-neutral-2)' }}>
          «Vårt» er regnet fra DBH på samme nivå som kilden (hele institusjonen eller handelshøyskolen), med kildens definisjon: poeng per årsverk inkl. stipendiater = UN1 + UN2 (HK-dir), ekskl. stipendiater = UN1 + postdoktorer (NHH); nivå 2-andel av poeng, forfatterandeler eller publikasjoner etter hva kilden oppgir. Er definisjonen uklar, vises begge variantene, og avviket regnes mot den nærmeste (✓ = den alternative). Foreløpige 2025-tall og institusjonssammenslåinger (INN) gir de største avvikene.
        </p>
      </div>
    </div>
  );
}

// ── Fane 5: metode ───────────────────────────────────────────────────────────
function Metode({ data }: { data: Data }) {
  const ind = lagIndikatorer(data);
  return (
    <div className="rounded-2xl p-6 text-sm space-y-4" style={{ ...kort, color: 'var(--nmbu-neutral-1)', lineHeight: 1.6 }}>
      <div>
        <div style={{ fontWeight: 600, color: GRONN }}>Hva som rangeres</div>
        Handelshøyskolene og de økonomisk-administrative fakultetene med forskning i Norge. Der handelshøyskolen ikke er en egen enhet i DBH eller NVA, er avgrensningen beskrevet i skoleprofilen. Enheter merket «referanse» (for eksempel samfunnsøkonomiske institutter) er med for sammenligning, men holdes utenfor rangeringen som standard.
      </div>
      <div>
        <div style={{ fontWeight: 600, color: GRONN }}>Mål og standardvekter</div>
        <ul className="list-disc pl-5">
          {ind.map((i) => <li key={i.id}><b>{i.label}</b> ({i.dim}, vekt {i.vekt}): {i.desc}</li>)}
        </ul>
      </div>
      <div>
        <div style={{ fontWeight: 600, color: GRONN }}>Publisering i to systemer</div>
        Det norske systemet (publiseringspoeng, nivå 1 og 2) hentes fra DBH og er institusjonenes egne innrapporterte tall. Internasjonale nivåer hentes ved å koble hver artikkel i NVA (tidligere Cristin) på ISSN mot tidsskriftlister: AJG 2024 fra Chartered ABS (1–4*, samme som HHs infografikk), ABDC (C–A*), FT50 og UTD24. {data.lister.ajg ? 'AJG-lista er lagt inn.' : 'AJG-lista er lisensbelagt og ikke lagt inn ennå; den legges i data/rangering/tidsskrift/ajg2024.csv (mal: ajg-mal.csv).'}
      </div>
      <div>
        <div style={{ fontWeight: 600, color: GRONN }}>Kontroll mot HHs infografikk</div>
        Poeng per faglig årsverk regnes som HK-dir gjør i tilstandsrapporten: publiseringspoeng delt på årsverk i faglige stillinger (DBH-kategori UN1) pluss stipendiater og postdoktorer (UN2), uten faglige ledere (UN3) og andre undervisningsstillinger (UN4). Det gir HH 0,95, UiA 1,49 og BI 1,27 i 2024, nøyaktig som i HHs infografikk. NHHs forskningsrapport, som sammenligner åtte handelshøyskoler, bruker UN1 pluss postdoktorer (uten stipendiater); den varianten vises som alternativ. Se fanen Kvalitetssikring.
      </div>
      <div>
        <div style={{ fontWeight: 600, color: GRONN }}>Kjente svakheter</div>
        <ul className="list-disc pl-5">
          <li>Artikler telles helt for hver enhet med minst én forfatter (ikke brøkdelt). Publiseringspoengene i DBH er brøkdelt.</li>
          <li>Private skoler (BI, Kristiania) har eget opptak og mangler førstevalg per plass i Samordna-tallene.</li>
          <li>Små enheter svinger mye fra år til år; derfor brukes snitt over tre og fem år.</li>
          <li>Min–maks-skalering gjør rangeringen følsom for ytterpunkter. Alternativ (rangsum eller z-skår) kan legges inn.</li>
        </ul>
      </div>
      <div className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>Generert {data.generert} av scripts/build-rangering.py.</div>
    </div>
  );
}
