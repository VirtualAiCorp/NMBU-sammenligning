import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Lock, Info, Users, SlidersHorizontal, TrendingDown, Filter } from 'lucide-react';
import { LANDSAM_GROUPS as HH_GROUPS } from '../data/hhAdmissionData';
import { NyeOpptaksregler } from './NyeOpptaksregler';

/**
 * Intern opptaksanalyse for HHs bachelorprogram (høsten 2026), fra opptakskontorets FS-uttrekk.
 * Dataene er aggregert (antall per poeng, kvote og prioritetsgruppe – ingen personer) og kryptert
 * (AES-256-GCM, PBKDF2-SHA256); de dekrypteres i nettleseren med passordet. Bygges av scripts/build-opptak-intern.py.
 *
 * Kvoter: SP = førstegangsvitnemål (skolepoeng), KP = ordinær kvote (konkurransepoeng). Regelen er 50/50.
 * Simuleringen: for et gitt antall tilbud fylles hver kvote ovenfra med «tilgjengelige» søkere, der tilgjengelighet
 * er andelen som faktisk kan få tilbud her (ikke har fått tilbud på et høyere prioritert studium). Den er kalibrert
 * mot faktisk opptak over grensen og justert under grensen med forholdet målt i B-ØA.
 */

type Kv = 'SP' | 'KP';
type Pg = '1' | '2-3' | '4+';
type Hist = Partial<Record<Kv, Partial<Record<Pg, Record<string, number>>>>>;
interface Modell {
  grense: Record<Kv, number>;
  tilgjengelighet: Record<string, number>;
  jaRate: Record<string, number>;
  moettRate: Record<string, number>;
  underFaktor: Record<string, number>;
}
interface Program { kode: string; navn: string; soKode: string; trinn: Record<'sokermasse' | 'tilbud' | 'jasvar' | 'mott', { antallRader: number; hist: Hist }>; modell: Modell; }
interface Data { kull: string; programmer: Record<string, Program>; }

const KV: Kv[] = ['SP', 'KP'];
const PG: Pg[] = ['1', '2-3', '4+'];
const KV_NAVN: Record<Kv, string> = { SP: 'Førstegangsvitnemål (SP)', KP: 'Ordinær kvote (KP)' };
const PG_FARGE: Record<Pg, string> = { '1': '#025C4F', '2-3': '#46B4A0', '4+': '#B8D8CF' };
const PW_KEY = 'intern-opptak-pw';
const nf = (v: number, d = 1) => v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });

// ── Dekryptering (WebCrypto) ────────────────────────────────────────────────
const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function dekrypter(pw: string): Promise<Data> {
  const r = await fetch(`${import.meta.env.BASE_URL}intern/opptak-h26.json`, { cache: 'no-store' });
  if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) throw new Error('Fant ikke datafilen');
  const e = await r.json();
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(e.salt), iterations: e.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(e.iv) }, key, b64(e.data));
  return JSON.parse(new TextDecoder().decode(plain));
}

// ── Hjelpere ────────────────────────────────────────────────────────────────
function rader(h: Hist, kv: Kv): { p: number; g: Pg; n: number }[] {
  const out: { p: number; g: Pg; n: number }[] = [];
  PG.forEach((g) => Object.entries(h[kv]?.[g] ?? {}).forEach(([p, n]) => out.push({ p: Number(p), g, n })));
  return out;
}
const sum = (h: Hist, kv: Kv, fra = -Infinity) => rader(h, kv).filter((r) => r.p >= fra).reduce((s, r) => s + r.n, 0);
const snitt = (h: Hist, kv: Kv) => { const rr = rader(h, kv); const n = rr.reduce((s, r) => s + r.n, 0); return n ? rr.reduce((s, r) => s + r.n * r.p, 0) / n / 10 : null; };

interface KvoteRes { grense: number; tilbud: number; snittTilbud: number; ja: number; moett: number; snittMoett: number; andel1: number; tomt: boolean; }
function simulerKvote(prog: Program, kv: Kv, nTilbud: number): KvoteRes {
  const m = prog.modell;
  const rr = rader(prog.trinn.sokermasse.hist, kv).sort((a, b) => b.p - a.p);
  let acc = 0, sp = 0, ja = 0, mo = 0, smo = 0, n1 = 0, grense = rr.length ? rr[rr.length - 1].p : 0;
  for (let i = 0; i < rr.length; i++) {
    const r = rr[i];
    const key = `${kv}:${r.g}`;
    const a = Math.min(1, (m.tilgjengelighet[key] ?? 0) * (r.p < m.grense[kv] ? m.underFaktor[key] ?? 1 : 1));
    let w = r.n * a;
    if (acc + w > nTilbud) w = nTilbud - acc;
    acc += w; sp += w * r.p; ja += w * (m.jaRate[key] ?? 0); mo += w * (m.moettRate[key] ?? 0); smo += w * (m.moettRate[key] ?? 0) * r.p;
    if (r.g === '1') n1 += w;
    if (acc >= nTilbud - 1e-9) { grense = r.p; break; }
  }
  return { grense: grense / 10, tilbud: acc, snittTilbud: acc ? sp / acc / 10 : 0, ja, moett: mo, snittMoett: mo ? smo / mo / 10 : 0, andel1: acc ? n1 / acc : 0, tomt: acc < nTilbud - 0.5 };
}
function simuler(prog: Program, nTilbud: number, fvAndel: number) {
  const sp = simulerKvote(prog, 'SP', nTilbud * fvAndel);
  const kp = simulerKvote(prog, 'KP', nTilbud * (1 - fvAndel));
  const moett = sp.moett + kp.moett;
  return { SP: sp, KP: kp, tilbud: sp.tilbud + kp.tilbud, ja: sp.ja + kp.ja, moett, snittMoett: moett ? (sp.moett * sp.snittMoett + kp.moett * kp.snittMoett) / moett : 0 };
}

function Kort({ tittel, children, icon: Icon }: { tittel: string; children: ReactNode; icon?: typeof Info }) {
  return (
    <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex items-center gap-2 mb-3" style={{ fontSize: 14, fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{Icon && <Icon className="w-4 h-4" />}{tittel}</div>
      {children}
    </div>
  );
}

// ── Demodata (bare utviklingsserveren, ?internDemo): fiktive, tilfeldige tall for å teste visningen ──
function demoData(): Data {
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const normal = (m: number, s: number) => m + s * Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
  const lag = (n: number, m: number, s: number, fra = 0): Hist => {
    const h: Hist = {};
    KV.forEach((kv) => { h[kv] = {}; PG.forEach((g) => { h[kv]![g] = {}; }); });
    for (let i = 0; i < n; i++) {
      const kv: Kv = rnd() < 0.42 ? 'SP' : 'KP'; const g: Pg = rnd() < 0.2 ? '1' : rnd() < 0.5 ? '2-3' : '4+';
      const p = Math.round(Math.max(fra, normal(kv === 'SP' ? m - 2 : m, s)) * 10);
      if (p >= fra * 10) h[kv]![g]![String(p)] = (h[kv]![g]![String(p)] ?? 0) + 1;
    }
    return h;
  };
  const modell: Modell = { grense: { SP: 470, KP: 490 }, tilgjengelighet: { 'SP:1': 1, 'SP:2-3': 0.3, 'SP:4+': 0.05, 'KP:1': 0.5, 'KP:2-3': 0.13, 'KP:4+': 0.02 },
    jaRate: { 'SP:1': 0.8, 'SP:2-3': 0.4, 'SP:4+': 0.5, 'KP:1': 0.8, 'KP:2-3': 0.5, 'KP:4+': 0.6 }, moettRate: { 'SP:1': 0.65, 'SP:2-3': 0.2, 'SP:4+': 0.1, 'KP:1': 0.8, 'KP:2-3': 0.4, 'KP:4+': 0.5 },
    underFaktor: { 'SP:1': 1, 'SP:2-3': 2.3, 'SP:4+': 6, 'KP:1': 1, 'KP:2-3': 2.3, 'KP:4+': 6 } };
  const prog = (kode: string, navn: string, so: string): Program => ({ kode, navn, soKode: so, modell,
    trinn: { sokermasse: { antallRader: 2000, hist: lag(2000, 47, 5) }, tilbud: { antallRader: 190, hist: lag(190, 52, 3, 47) },
      jasvar: { antallRader: 130, hist: lag(130, 52, 3, 47) }, mott: { antallRader: 100, hist: lag(100, 52, 3, 47) } } });
  return { kull: 'DEMO (fiktive tall)', programmer: { 'B-ØA': prog('B-ØA', 'Økonomi og administrasjon', '192369'), 'B-ECON': prog('B-ECON', 'Samfunnsøkonomi', '192468') } };
}

// ── Hovedkomponent ──────────────────────────────────────────────────────────
export function InternOpptak() {
  const [data, setData] = useState<Data | null>(null);
  const [pw, setPw] = useState('');
  const [feil, setFeil] = useState<string | null>(null);
  const [laster, setLaster] = useState(false);

  const lasOpp = async (p: string, lagre: boolean) => {
    setLaster(true); setFeil(null);
    try {
      const d = await dekrypter(p);
      setData(d);
      if (lagre) try { sessionStorage.setItem(PW_KEY, p); } catch { /* privat modus */ }
    } catch (e) {
      setFeil(e instanceof Error && e.message === 'Fant ikke datafilen' ? 'Fant ikke datafilen.' : 'Feil passord.');
    } finally { setLaster(false); }
  };
  useEffect(() => {
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('internDemo')) { setData(demoData()); return; }
    try { const p = sessionStorage.getItem(PW_KEY); if (p) void lasOpp(p, false); } catch { /* */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) {
    return (
      <div className="rounded-2xl p-8 max-w-lg mx-auto text-center" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
        <Lock className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--nmbu-green-dark)' }} />
        <div style={{ fontFamily: "'Lora', serif", fontSize: 20, color: 'var(--nmbu-green-dark)' }}>Intern: opptak høsten 2026</div>
        <p className="text-sm mt-2 mb-4" style={{ color: 'var(--nmbu-neutral-2)' }}>
          Søkermassen for HHs bachelorprogram fra opptakskontoret. Dataene er kryptert og åpnes bare med passordet.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); void lasOpp(pw, true); }} className="flex gap-2 justify-center">
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Passord" autoFocus
            className="px-3 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--nmbu-neutral-3)', minWidth: 220 }} />
          <button type="submit" disabled={laster || !pw} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', opacity: laster || !pw ? 0.6 : 1 }}>
            {laster ? 'Åpner …' : 'Åpne'}
          </button>
        </form>
        {feil && <div className="text-sm mt-3" style={{ color: '#b91c1c' }}>{feil}</div>}
      </div>
    );
  }
  return <Analyse data={data} />;
}

function Analyse({ data }: { data: Data }) {
  const koder = Object.keys(data.programmer);
  const [kode, setKode] = useState(koder[0]);
  const prog = data.programmer[kode];
  const faktiskTilbud = sum(prog.trinn.tilbud.hist, 'SP') + sum(prog.trinn.tilbud.hist, 'KP');
  const faktiskFv = sum(prog.trinn.tilbud.hist, 'SP') / faktiskTilbud;
  const plasser = useMemo(() => {
    for (const g of HH_GROUPS) for (const e of g.entries) if (e.studiekode === prog.soKode) return e.years['2026']?.plasser ?? null;
    return null;
  }, [prog.soKode]);

  const [modus, setModus] = useState<'tilbud' | 'kull'>('tilbud');
  const [nTilbud, setNTilbud] = useState(faktiskTilbud);
  const [kull, setKull] = useState<number>(Math.round(sum(prog.trinn.mott.hist, 'SP') + sum(prog.trinn.mott.hist, 'KP')));
  const [fv, setFv] = useState(0.5);
  const [histKv, setHistKv] = useState<Kv>('KP');
  const bytt = (k: string) => {
    const p = data.programmer[k];
    const t = sum(p.trinn.tilbud.hist, 'SP') + sum(p.trinn.tilbud.hist, 'KP');
    setKode(k); setNTilbud(t); setKull(Math.round(sum(p.trinn.mott.hist, 'SP') + sum(p.trinn.mott.hist, 'KP'))); setFv(0.5);
  };

  // «Ønsket kull»: finn antall tilbud som gir forventet oppmøte = kull
  const tilbudForKull = (k: number) => {
    let lo = 1, hi = faktiskTilbud * 4;
    for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (simuler(prog, mid, fv).moett < k) lo = mid; else hi = mid; }
    return Math.round(hi);
  };
  const n = modus === 'tilbud' ? nTilbud : tilbudForKull(kull);
  const sim = simuler(prog, n, fv);
  const faktisk = simuler(prog, faktiskTilbud, faktiskFv);
  const maks = Math.round(faktiskTilbud * 2.2);

  const kurve = useMemo(() => {
    const out: Record<string, number | null>[] = [];
    for (let t = Math.max(10, Math.round(faktiskTilbud * 0.4)); t <= maks; t += Math.max(1, Math.round(faktiskTilbud / 40))) {
      const s = simuler(prog, t, fv);
      out.push({ t, SP: s.SP.tomt ? null : s.SP.grense, KP: s.KP.tomt ? null : s.KP.grense, snitt: Math.round(s.snittMoett * 10) / 10, moett: Math.round(s.moett) });
    }
    return out;
  }, [prog, fv, faktiskTilbud, maks]);

  // Histogram rundt grensen (0,5-poengs intervaller)
  const hist = useMemo(() => {
    const rr = rader(prog.trinn.sokermasse.hist, histKv);
    const g0 = prog.modell.grense[histKv] / 10;
    const lo = Math.floor(g0 - 8), hi = Math.ceil(Math.max(...rr.map((r) => r.p)) / 10);
    const bins: Record<string, number | string>[] = [];
    for (let x = lo; x < hi; x += 0.5) {
      const row: Record<string, number | string> = { x: nf(x, 1) , fra: x };
      PG.forEach((g) => { row[g] = rr.filter((r) => r.g === g && r.p / 10 >= x && r.p / 10 < x + 0.5).reduce((s, r) => s + r.n, 0); });
      bins.push(row);
    }
    return { bins, g0 };
  }, [prog, histKv]);
  const binLabel = (v: number) => nf(Math.floor(v * 2) / 2, 1);

  // «Rundt grensen»: tilgjengelige søkere per halvpoeng under faktisk grense
  const trinnUnder = KV.map((kv) => {
    const g0 = prog.modell.grense[kv];
    return [5, 10, 20, 30].map((d) => {
      const rr = rader(prog.trinn.sokermasse.hist, kv).filter((r) => r.p < g0 && r.p >= g0 - d);
      const rå = rr.reduce((s, r) => s + r.n, 0);
      const tilgj = rr.reduce((s, r) => { const key = `${kv}:${r.g}`; return s + r.n * Math.min(1, (prog.modell.tilgjengelighet[key] ?? 0) * (prog.modell.underFaktor[key] ?? 1)); }, 0);
      const pri1 = rr.filter((r) => r.g === '1').reduce((s, r) => s + r.n, 0);
      return { d: d / 10, rå, tilgj, pri1 };
    });
  });

  const trakt = KV.map((kv) => ({
    kv,
    steg: [
      { l: 'Kvalifiserte søkere', n: sum(prog.trinn.sokermasse.hist, kv), s: snitt(prog.trinn.sokermasse.hist, kv) },
      { l: 'Tilbud', n: sum(prog.trinn.tilbud.hist, kv), s: snitt(prog.trinn.tilbud.hist, kv) },
      { l: 'Ja-svar', n: sum(prog.trinn.jasvar.hist, kv), s: snitt(prog.trinn.jasvar.hist, kv) },
      { l: 'Møtt', n: sum(prog.trinn.mott.hist, kv), s: snitt(prog.trinn.mott.hist, kv) },
    ],
  }));

  const diff = (a: number, b: number, d = 1) => { const x = a - b; return `${x >= 0 ? '+' : '−'}${nf(Math.abs(x), d)}`; };

  return (
    <div>
      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3 mb-5" style={{ backgroundColor: '#FFF7E6', border: '1px solid #F0C040', color: '#6B4E00' }}>
        <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Intern side. Tallene er aggregert fra opptakskontorets uttrekk (ingen personopplysninger) og krypteres før publisering.
          Ikke del skjermbilder utenfor organisasjonen uten avklaring.</span>
      </div>

      <div className="rounded-lg px-4 py-3 mb-5 text-xs" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)', lineHeight: 1.6 }}>
        <div className="flex items-center gap-1.5 mb-1.5" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>
          <Info className="w-3.5 h-3.5" /> Kvotene og kodene i FS
        </div>
        <div className="grid gap-x-6 gap-y-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div>
            <b>SP = skolepoeng → førstegangsvitnemålskvoten.</b> For søkere som er 21 år eller yngre i opptaksåret og har vitnemål fra
            videregående uten forbedringer eller tillegg. Rangeres på skolepoeng: karakterpoeng (snitt × 10) pluss realfags- og språkpoeng,
            uten alders- og tilleggspoeng.
          </div>
          <div>
            <b>KP = konkurransepoeng → ordinær kvote.</b> For alle kvalifiserte søkere, også dem i førstegangsvitnemålskvoten som ikke nådde opp der.
            Rangeres på konkurransepoeng: skolepoeng pluss alderspoeng (fra fylte 20 år) og tilleggspoeng (folkehøgskole, militærtjeneste, høyere utdanning m.m.).
          </div>
          <div>
            <b>Fordelingen hos HH:</b> 50 % av tilbudene går via førstegangsvitnemålskvoten og 50 % via ordinær kvote. Søkere med førstegangsvitnemål
            står derfor både med en SP-rad og en KP-rad i søkermassen. Simuleringen behandler kvotene hver for seg.
          </div>
        </div>
      </div>

      <div className="mb-5"><NyeOpptaksregler variant="full" /></div>

      <div className="flex flex-wrap gap-2 mb-5">
        {koder.map((k) => (
          <button key={k} onClick={() => bytt(k)} className="px-4 py-2 rounded-full text-sm"
            style={{ backgroundColor: k === kode ? 'var(--nmbu-green-dark)' : '#fff', color: k === kode ? '#fff' : 'var(--nmbu-neutral-1)', border: '1px solid ' + (k === kode ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)'), fontWeight: k === kode ? 700 : 500 }}>
            {data.programmer[k].navn} <span style={{ opacity: 0.7, fontSize: 11 }}>({k})</span>
          </button>
        ))}
      </div>

      {/* Nøkkeltall */}
      <div className="rounded-2xl mb-5 px-6 py-5" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>{prog.navn} · opptak {data.kull}</div>
        <div className="flex gap-8 flex-wrap">
          {[
            { l: 'Kvalifiserte søkere', v: nf(sum(prog.trinn.sokermasse.hist, 'KP'), 0) },
            { l: 'Studieplasser (Samordna)', v: plasser != null ? nf(plasser, 0) : '–' },
            { l: 'Tilbud', v: nf(faktiskTilbud, 0), sub: `SP ${sum(prog.trinn.tilbud.hist, 'SP')} · KP ${sum(prog.trinn.tilbud.hist, 'KP')}` },
            { l: 'Ja-svar / møtt', v: `${sum(prog.trinn.jasvar.hist, 'SP') + sum(prog.trinn.jasvar.hist, 'KP')} / ${sum(prog.trinn.mott.hist, 'SP') + sum(prog.trinn.mott.hist, 'KP')}` },
            { l: 'Laveste poeng med tilbud', v: `${nf(prog.modell.grense.SP / 10)} / ${nf(prog.modell.grense.KP / 10)}`, sub: 'SP / KP, alle opptaksrunder' },
            { l: 'Snitt møtt', v: `${nf(snitt(prog.trinn.mott.hist, 'SP') ?? 0)} / ${nf(snitt(prog.trinn.mott.hist, 'KP') ?? 0)}`, sub: 'SP / KP' },
          ].map((s) => (
            <div key={s.l}>
              <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 3 }}>{s.l}</div>
              <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{s.v}</div>
              {s.sub && <div style={{ fontSize: 9, opacity: 0.6, marginTop: 3 }}>{s.sub}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Simulator */}
      <Kort tittel="Hva om opptaksrammen var større eller mindre?" icon={SlidersHorizontal}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
            {([['tilbud', 'Styr på antall tilbud'], ['kull', 'Styr på ønsket kull (møtt)']] as const).map(([m, l]) => (
              <button key={m} onClick={() => setModus(m)} className="px-3 py-1.5 text-xs" style={{ backgroundColor: modus === m ? 'var(--nmbu-green-4)' : '#fff', fontWeight: modus === m ? 700 : 400, color: 'var(--nmbu-neutral-1)' }}>{l}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div>
            {modus === 'tilbud' ? (
              <label className="block text-sm" style={{ color: 'var(--nmbu-neutral-1)' }}>
                Antall tilbud: <b>{nTilbud}</b> <span style={{ color: 'var(--nmbu-neutral-2)' }}>(faktisk {faktiskTilbud})</span>
                <input type="range" min={Math.round(faktiskTilbud * 0.4)} max={maks} value={nTilbud} onChange={(e) => setNTilbud(Number(e.target.value))} className="w-full mt-2" />
              </label>
            ) : (
              <label className="block text-sm" style={{ color: 'var(--nmbu-neutral-1)' }}>
                Ønsket kull (møtt): <b>{kull}</b> <span style={{ color: 'var(--nmbu-neutral-2)' }}>→ {n} tilbud{plasser ? ` · ${plasser} studieplasser` : ''}</span>
                <input type="range" min={10} max={Math.round((sum(prog.trinn.mott.hist, 'SP') + sum(prog.trinn.mott.hist, 'KP')) * 2)} value={kull} onChange={(e) => setKull(Number(e.target.value))} className="w-full mt-2" />
              </label>
            )}
            <label className="block text-sm mt-4" style={{ color: 'var(--nmbu-neutral-1)' }}>
              Andel av tilbudene i førstegangsvitnemålskvoten: <b>{Math.round(fv * 100)} %</b> <span style={{ color: 'var(--nmbu-neutral-2)' }}>(regelen er 50 %, 65 % fra opptaket høsten 2028)</span>
              <input type="range" min={30} max={70} value={Math.round(fv * 100)} onChange={(e) => setFv(Number(e.target.value) / 100)} className="w-full mt-2" />
            </label>
            <div className="flex gap-2 mt-2">
              {[{ v: 0.5, l: '50 % i dag' }, { v: 0.65, l: '65 % fra 2028' }].map((b) => (
                <button key={b.l} onClick={() => setFv(b.v)} className="px-3 py-1 rounded-full text-xs"
                  style={{ backgroundColor: Math.round(fv * 100) === Math.round(b.v * 100) ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)', color: Math.round(fv * 100) === Math.round(b.v * 100) ? '#fff' : 'var(--nmbu-neutral-1)' }}>
                  {b.l}
                </button>
              ))}
            </div>
            {Math.round(fv * 100) === 65 && (
              <div className="mt-2 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
                Viser bare effekten av større kvote med dagens søkere og poeng. Høyere aldersgrense (23 år) og færre tilleggspoeng fra 2028 er ikke med; se boksen om nye opptaksregler.
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)', fontSize: 12 }}>
                <th className="text-left py-1.5"> </th><th className="text-right">Simulert</th><th className="text-right">Faktisk (modell)</th><th className="text-right">Endring</th>
              </tr></thead>
              <tbody>
                {[
                  ['Grense SP', sim.SP.tomt ? 'alle kvalifiserte' : nf(sim.SP.grense), nf(faktisk.SP.grense), sim.SP.tomt ? '–' : diff(sim.SP.grense, faktisk.SP.grense)],
                  ['Grense KP', sim.KP.tomt ? 'alle kvalifiserte' : nf(sim.KP.grense), nf(faktisk.KP.grense), sim.KP.tomt ? '–' : diff(sim.KP.grense, faktisk.KP.grense)],
                  ['Tilbud', nf(sim.tilbud, 0), nf(faktisk.tilbud, 0), diff(sim.tilbud, faktisk.tilbud, 0)],
                  ['Forventet ja-svar', nf(sim.ja, 0), nf(faktisk.ja, 0), diff(sim.ja, faktisk.ja, 0)],
                  ['Forventet møtt', nf(sim.moett, 0), nf(faktisk.moett, 0), diff(sim.moett, faktisk.moett, 0)],
                  ['Snitt tilbud SP', nf(sim.SP.snittTilbud), nf(faktisk.SP.snittTilbud), diff(sim.SP.snittTilbud, faktisk.SP.snittTilbud)],
                  ['Snitt tilbud KP', nf(sim.KP.snittTilbud), nf(faktisk.KP.snittTilbud), diff(sim.KP.snittTilbud, faktisk.KP.snittTilbud)],
                  ['Snitt forventet møtt', nf(sim.snittMoett), nf(faktisk.snittMoett), diff(sim.snittMoett, faktisk.snittMoett)],
                  ['Andel 1.-prioritet (tilbud)', `${nf(((sim.SP.andel1 * sim.SP.tilbud + sim.KP.andel1 * sim.KP.tilbud) / sim.tilbud) * 100, 0)} %`, `${nf(((faktisk.SP.andel1 * faktisk.SP.tilbud + faktisk.KP.andel1 * faktisk.KP.tilbud) / faktisk.tilbud) * 100, 0)} %`, ''],
                ].map(([l, a, b, c]) => (
                  <tr key={l} style={{ borderBottom: '1px solid var(--nmbu-beige-light)' }}>
                    <td className="py-1.5" style={{ color: 'var(--nmbu-neutral-1)' }}>{l}</td>
                    <td className="text-right" style={{ fontWeight: 700 }}>{a}</td>
                    <td className="text-right" style={{ color: 'var(--nmbu-neutral-2)' }}>{b}</td>
                    <td className="text-right" style={{ color: String(c).startsWith('−') ? '#b91c1c' : '#047857' }}>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Kort>

      <Kort tittel="Grenser og snitt for alle opptaksrammer" icon={TrendingDown}>
        <div className="text-xs mb-2" style={{ color: 'var(--nmbu-neutral-2)' }}>Laveste poeng med tilbud per kvote og snittpoeng for dem som forventes å møte, som funksjon av antall tilbud. Stiplet linje = faktisk, heltrukket = valgt.</div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={kurve} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} tick={{ fontSize: 11 }} label={{ value: 'Antall tilbud', position: 'insideBottomRight', offset: -2, fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip formatter={(v: number, k: string) => [nf(v), k === 'SP' ? 'Grense SP' : k === 'KP' ? 'Grense KP' : 'Snitt møtt']} labelFormatter={(l) => `${l} tilbud`} />
            <Legend formatter={(v: string) => (v === 'SP' ? 'Grense SP' : v === 'KP' ? 'Grense KP' : 'Snitt forventet møtt')} wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine x={faktiskTilbud} stroke="#6b7280" strokeDasharray="5 4" />
            <ReferenceLine x={n} stroke="var(--nmbu-green-dark)" />
            <Line dataKey="SP" stroke="#2563EB" strokeWidth={2} dot={false} connectNulls />
            <Line dataKey="KP" stroke="#B45309" strokeWidth={2} dot={false} connectNulls />
            <Line dataKey="snitt" stroke="#025C4F" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Kort>

      <Kort tittel="Søkermassen rundt grensen" icon={Users}>
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
            {KV.map((k) => (
              <button key={k} onClick={() => setHistKv(k)} className="px-3 py-1.5 text-xs" style={{ backgroundColor: histKv === k ? 'var(--nmbu-green-4)' : '#fff', fontWeight: histKv === k ? 700 : 400, color: 'var(--nmbu-neutral-1)' }}>{KV_NAVN[k]}</button>
            ))}
          </div>
          <span className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>Kvalifiserte søkere per halve poeng, etter prioritet. Stiplet = faktisk grense, heltrukket = simulert.</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hist.bins} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="x" tick={{ fontSize: 10 }} interval={1} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip formatter={(v: number, k: string) => [v, `Prioritet ${k}`]} labelFormatter={(l) => `${l}–${nf(Number(String(l).replace(',', '.')) + 0.4, 1)} poeng`} />
            <Legend formatter={(v: string) => `Prioritet ${v}`} wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine x={binLabel(hist.g0)} stroke="#6b7280" strokeDasharray="5 4" />
            <ReferenceLine x={binLabel(sim[histKv].grense)} stroke="var(--nmbu-green-dark)" strokeWidth={2} />
            {PG.map((g) => <Bar key={g} dataKey={g} stackId="a" fill={PG_FARGE[g]} />)}
          </BarChart>
        </ResponsiveContainer>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)', fontSize: 12 }}>
              <th className="text-left py-1.5">Under faktisk grense</th>
              {KV.map((k) => <th key={k} className="text-right" colSpan={3}>{KV_NAVN[k]}</th>)}
            </tr>
            <tr style={{ color: 'var(--nmbu-neutral-2)', fontSize: 11 }}><th></th>{KV.map((k) => ['Søkere', 'Herav 1. pri', 'Forventet tilgjengelige'].map((h) => <th key={k + h} className="text-right">{h}</th>))}</tr></thead>
            <tbody>
              {[0, 1, 2, 3].map((i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--nmbu-beige-light)' }}>
                  <td className="py-1.5">Inntil {nf(trinnUnder[0][i].d)} poeng under</td>
                  {KV.map((_, k) => [trinnUnder[k][i].rå, trinnUnder[k][i].pri1, nf(trinnUnder[k][i].tilgj, 0)].map((v, j) => <td key={k + '-' + j} className="text-right" style={{ fontWeight: j === 2 ? 700 : 400 }}>{v}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs mt-2" style={{ color: 'var(--nmbu-neutral-2)' }}>
            «Forventet tilgjengelige» er søkere som ikke forventes å ha fått tilbud på et høyere prioritert studium; det er omtrent så mange ekstra tilbud som skal til for å senke grensen så mye.
          </div>
        </div>
      </Kort>

      <Kort tittel="Fra søker til student" icon={Filter}>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {trakt.map((t) => (
            <div key={t.kv}>
              <div className="text-sm mb-2" style={{ fontWeight: 600 }}>{KV_NAVN[t.kv]}</div>
              {t.steg.map((s, i) => (
                <div key={s.l} className="flex items-center gap-2 mb-1.5 text-sm">
                  <div className="rounded" style={{ width: `${Math.max(8, (s.n / t.steg[0].n) * 100)}%`, maxWidth: '60%', height: 18, backgroundColor: i === 0 ? '#B8D8CF' : i === 3 ? '#025C4F' : '#46B4A0' }} />
                  <span style={{ whiteSpace: 'nowrap' }}>{s.l}: <b>{s.n}</b>{s.s != null ? ` · snitt ${nf(s.s)}` : ''}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Kort>

      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Modell: hver kvote fylles ovenfra med søkere som kan få tilbud her. Andelen som ikke allerede har tilbud på et høyere prioritert studium
          er kalibrert slik at modellen treffer faktisk opptak ({faktiskTilbud} tilbud gir de faktiske grensene), og justert under grensen med forholdet
          målt i B-ØA, der søkermassen har tilbudsstatus. Ja-svar og oppmøte per tilbud er faktiske andeler per kvote og prioritetsgruppe. Søkere med
          førstegangsvitnemål som ikke når opp i SP-kvoten, konkurrerer også i ordinær kvote; modellen behandler kvotene hver for seg. Grensene gjelder alle
          opptaksrunder (laveste poeng med tilbud), ikke bare hovedopptaket. Resultatene er anslag, ikke prognoser.
        </span>
      </div>
    </div>
  );
}
