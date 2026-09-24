import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Info, ExternalLink, Users, Calculator, MapPin } from 'lucide-react';

/**
 * Søkergrunnlaget: ungdomskullene per fylke (SSB, historisk og framskrevet)
 * og rekrutteringsgrunnlaget fra videregående (Udir: matematikk R1/R2/S1/S2 og gjennomføring).
 * Dataene lastes lat fra public/sokergrunnlag/ (ssb.json fra build-sokergrunnlag.py, udir.json fra fetch-udir.py).
 */

interface Ssb {
  hentet: string; kilder: { navn: string; url: string }[]; fylker: Record<string, string>; aar: number[]; forsteFramskrevne: number;
  rekkefolge: string[]; alder: Record<string, Record<string, (number | null)[]>>; stedFylke: Record<string, string>;
}
interface Udir {
  hentet: string; kilder: { navn: string; url: string }[]; fylker: Record<string, string>;
  matematikk?: Record<string, Record<string, Record<string, { elever: number; snitt: number | null }>>>;
  gjennomforing?: Record<string, Record<string, { andel: number; aar: number }>>;
  vg3Studieforberedende?: Record<string, Record<string, number>>;
  merknader?: string[];
}

type Aldersvalg = '19' | '19-24' | '16-18';
const ALDER: Record<Aldersvalg, { label: string; alder: number[]; tekst: string }> = {
  '19': { label: '19-åringer', alder: [19], tekst: 'det typiske året for førstegangssøkere' },
  '19-24': { label: '19–24 år', alder: [19, 20, 21, 22, 23, 24], tekst: 'hele aldersgruppen som søker bachelor og master' },
  '16-18': { label: '16–18 år', alder: [16, 17, 18], tekst: 'kullene som kommer ut av videregående de neste årene' },
};
const STANDARD_OMRADE = ['32', '03', '31'];
const FARGER = ['#025C4F', '#2563EB', '#B45309', '#9333EA', '#DC2626', '#0891B2', '#65A30D', '#DB2777', '#4B5563', '#CA8A04', '#7C3AED', '#0D9488', '#EA580C', '#1D4ED8', '#BE123C'];
const nf = (v: number | null | undefined, d = 0) => (v == null ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d }));
const pst = (v: number | null) => (v == null ? '–' : `${v >= 0 ? '+' : '−'}${nf(Math.abs(v), 1)} %`);

async function hentJson<T>(fil: string): Promise<T | null> {
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}sokergrunnlag/${fil}`);
    if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null;
    return (await r.json()) as T;
  } catch { return null; }
}

function Kort({ tittel, ikon: Ikon, children }: { tittel: string; ikon: typeof Info; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 mb-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex items-center gap-2 mb-3" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}><Ikon className="w-4 h-4" /> {tittel}</div>
      {children}
    </div>
  );
}

export function Sokergrunnlag({ steder }: { steder?: string[] }) {
  const [ssb, setSsb] = useState<Ssb | null>(null);
  const [udir, setUdir] = useState<Udir | null>(null);
  const [feil, setFeil] = useState(false);
  const [aldersvalg, setAldersvalg] = useState<Aldersvalg>('19');
  const [omrade, setOmrade] = useState<string[]>(STANDARD_OMRADE);

  useEffect(() => {
    hentJson<Ssb>('ssb.json').then((d) => (d ? setSsb(d) : setFeil(true)));
    hentJson<Udir>('udir.json').then(setUdir);
  }, []);

  const serie = useMemo(() => {
    if (!ssb) return null;
    const sum = (r: string) => ssb.aar.map((_, i) => {
      const v = ALDER[aldersvalg].alder.map((a) => ssb.alder[r]?.[String(a)]?.[i] ?? null);
      return v.some((x) => x == null) ? null : v.reduce<number>((s, x) => s + (x as number), 0);
    });
    return Object.fromEntries(Object.keys(ssb.fylker).map((r) => [r, sum(r)])) as Record<string, (number | null)[]>;
  }, [ssb, aldersvalg]);

  if (feil) return <div className="rounded-xl p-6 text-sm" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>Fant ikke dataene for søkergrunnlaget.</div>;
  if (!ssb || !serie) return <div className="py-16 text-center text-sm" style={{ color: 'var(--nmbu-neutral-2)' }}>Laster befolkningstallene …</div>;

  const idx = (y: number) => ssb.aar.indexOf(y);
  const i25 = idx(2025);
  const fylker = ssb.rekkefolge.filter((r) => r !== '0');
  const omradeSerie = ssb.aar.map((_, i) => { const v = omrade.map((r) => serie[r][i]); return v.some((x) => x == null) ? null : v.reduce<number>((s, x) => s + (x as number), 0); });
  const endring = (s: (number | null)[], til: number) => (s[i25] && s[idx(til)] ? (100 * ((s[idx(til)] as number) - (s[i25] as number))) / (s[i25] as number) : null);
  const land = serie['0'];
  const framIdx = ssb.aar.map((y, i) => (y >= 2025 ? i : -1)).filter((i) => i >= 0);
  const topp = framIdx.reduce((b, i) => ((land[i] ?? 0) > (land[b] ?? 0) ? i : b), framIdx[0]);
  const nmbuFylke = ssb.stedFylke['Ås'] ?? '32';

  // Graf: indeks 2025 = 100 for landet, valgt område og fylkene i området
  const linjer = [{ id: '0', navn: 'Hele landet', s: land }, { id: 'omr', navn: 'Valgt område samlet', s: omradeSerie },
    ...omrade.map((r) => ({ id: r, navn: ssb.fylker[r], s: serie[r] }))];
  const grafData = ssb.aar.filter((y) => y >= 2016).map((y) => {
    const i = idx(y); const rad: Record<string, number | string> = { aar: String(y) };
    linjer.forEach((l) => { const b = l.s[i25]; const v = l.s[i]; if (b && v != null) rad[l.id] = Math.round((1000 * v) / b) / 10; });
    return rad;
  });


  // Konkurrentenes studiesteder → fylke
  const stederMedFylke = (steder ?? []).map((s) => ({ s, f: ssb.stedFylke[s] })).filter((x) => x.f);
  const stederPerFylke = stederMedFylke.reduce<Record<string, string[]>>((m, x) => { (m[x.f] ??= []).push(x.s); return m; }, {});

  const toggle = (r: string) => setOmrade((o) => (o.includes(r) ? o.filter((x) => x !== r) : [...o, r]));

  return (
    <div>
      {/* Nøkkeltall */}
      <div className="rounded-xl overflow-hidden mb-5" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
        <div className="px-6 py-5">
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.65, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            {ALDER[aldersvalg].label} i Norge · SSBs befolkningsframskrivinger 2026, hovedalternativet
          </div>
          <div className="flex gap-10 flex-wrap">
            {[{ l: '2025', v: nf(land[i25]) }, { l: `Topp ${ssb.aar[topp]}`, v: nf(land[topp]), sub: pst(endring(land, ssb.aar[topp])) + ' fra 2025' },
              { l: '2035', v: nf(land[idx(2035)]), sub: pst(endring(land, 2035)) + ' fra 2025' }, { l: '2040', v: nf(land[idx(2040)]), sub: pst(endring(land, 2040)) + ' fra 2025' },
              { l: `${ssb.fylker[nmbuFylke]} (NMBU) 2025–2035`, v: pst(endring(serie[nmbuFylke], 2035)) }].map((k) => (
              <div key={k.l}>
                <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 3 }}>{k.l}</div>
                <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{k.v}</div>
                {k.sub && <div style={{ fontSize: 10, opacity: 0.7, marginTop: 3 }}>{k.sub}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Kort tittel="Ungdomskullene per fylke" ikon={Users}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {(Object.keys(ALDER) as Aldersvalg[]).map((a) => (
            <button key={a} onClick={() => setAldersvalg(a)} className="px-3 py-1 rounded-full text-xs"
              style={{ backgroundColor: aldersvalg === a ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)', color: aldersvalg === a ? '#fff' : 'var(--nmbu-neutral-1)', fontWeight: aldersvalg === a ? 600 : 400 }}>
              {ALDER[a].label}
            </button>
          ))}
          <span className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>· {ALDER[aldersvalg].tekst}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
          <span style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Område:</span>
          {fylker.map((r) => (
            <button key={r} onClick={() => toggle(r)} className="px-2.5 py-0.5 rounded-full"
              style={{ border: '1px solid ' + (omrade.includes(r) ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)'), backgroundColor: omrade.includes(r) ? 'var(--nmbu-green-4)' : '#fff', color: 'var(--nmbu-neutral-1)', fontWeight: omrade.includes(r) ? 600 : 400 }}>
              {ssb.fylker[r]}
            </button>
          ))}
          <button onClick={() => setOmrade(STANDARD_OMRADE)} className="px-2.5 py-0.5 rounded-full" style={{ color: 'var(--nmbu-green-dark)', textDecoration: 'underline' }}>NMBUs nærområde</button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginBottom: 6 }}>Indeks, 2025 = 100. Til høyre for den stiplede streken er tallene framskrivinger.</div>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={grafData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="aar" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip formatter={(v: number, n: string) => [nf(v, 1), linjer.find((l) => l.id === n)?.navn ?? n]} />
            <Legend formatter={(v: string) => linjer.find((l) => l.id === v)?.navn ?? v} wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine x={String(ssb.forsteFramskrevne)} stroke="#888" strokeDasharray="4 3" label={{ value: 'Framskrevet →', position: 'insideTopLeft', fontSize: 10, fill: '#888' }} />
            <ReferenceLine y={100} stroke="#bbb" />
            {linjer.map((l, i) => (
              <Line key={l.id} dataKey={l.id} stroke={l.id === '0' ? '#6b7280' : l.id === 'omr' ? '#025C4F' : FARGER[(i + 1) % FARGER.length]}
                strokeWidth={l.id === 'omr' ? 3.5 : 1.8} strokeDasharray={l.id === '0' ? '5 4' : undefined} dot={false} connectNulls={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>

        <div className="overflow-x-auto mt-4">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
                <th className="px-3 py-2 text-left">Fylke</th>
                {[2025, ssb.aar[topp], 2035, 2040].filter((y, i, a) => a.indexOf(y) === i).map((y) => <th key={y} className="px-3 py-2 text-right">{y}</th>)}
                <th className="px-3 py-2 text-right">2025–2035</th>
                <th className="px-3 py-2 text-right">2025–2040</th>
                {steder && <th className="px-3 py-2 text-left">Studiesteder i sammenligningen</th>}
              </tr>
            </thead>
            <tbody>
              {['0', ...fylker].map((r) => {
                const s = serie[r];
                const e35 = endring(s, 2035); const e40 = endring(s, 2040);
                return (
                  <tr key={r} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: r === nmbuFylke ? 'var(--nmbu-green-4)' : r === '0' ? 'var(--nmbu-beige-light)' : 'transparent', fontWeight: r === '0' ? 700 : 400 }}>
                    <td className="px-3 py-1.5">{ssb.fylker[r]}{r === nmbuFylke ? ' (NMBU)' : ''}</td>
                    {[2025, ssb.aar[topp], 2035, 2040].filter((y, i, a) => a.indexOf(y) === i).map((y) => <td key={y} className="px-3 py-1.5 text-right">{nf(s[idx(y)])}</td>)}
                    <td className="px-3 py-1.5 text-right" style={{ color: e35 != null && e35 < 0 ? '#b91c1c' : '#047857', fontWeight: 600 }}>{pst(e35)}</td>
                    <td className="px-3 py-1.5 text-right" style={{ color: e40 != null && e40 < 0 ? '#b91c1c' : '#047857' }}>{pst(e40)}</td>
                    {steder && <td className="px-3 py-1.5" style={{ color: 'var(--nmbu-neutral-2)' }}>{(stederPerFylke[r] ?? []).join(', ')}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginTop: 6 }}>
            Fylkene som ble delt i 2024 (Østfold, Akershus, Buskerud, Vestfold, Telemark, Troms, Finnmark) har befolkningstall først fra 2024.
            SSBs tall for studenter etter bosted er ikke brukt: i 2025 har 11 % ukjent bosted, og mange står fortsatt på fylkene fra før 2024.
          </div>
        </div>
      </Kort>

      <Kort tittel="Søkerpotensial per program" ikon={MapPin}>
        <p className="text-xs" style={{ color: 'var(--nmbu-neutral-1)', lineHeight: 1.6 }}>
          Hvor mange søkere et program kan vente seg, avhenger av hvilke fylker studentene kommer fra. Den fordelingen finnes ikke som åpne data per
          program eller institusjon (verken i DBHs åpne API eller hos SSB). Velg derfor fylkene programmet rekrutterer fra i området over; den tykke linjen
          viser hvordan ungdomskullene der utvikler seg. For NMBUs egne program kan hjemfylke hentes fra opptakskontorets FS-uttrekk (postnummer eller
          bostedskommune), og da kan søkerpotensialet regnes ut per program med programmets faktiske fordeling. Uttrekket vi har nå mangler adressefelt.
        </p>
      </Kort>

      {udir && <VideregaendeKort udir={udir} />}

      <div className="flex items-start gap-2 text-xs rounded-lg px-4 py-3" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span className="flex flex-wrap gap-x-3">
          Kilder, hentet {ssb.hentet}:
          {[...ssb.kilder, ...(udir?.kilder ?? [])].map((k) => <a key={k.url + k.navn} href={k.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1" style={{ color: 'var(--nmbu-green-dark)' }}><ExternalLink className="w-3 h-3" /> {k.navn}</a>)}
        </span>
      </div>
    </div>
  );
}

function VideregaendeKort({ udir }: { udir: Udir }) {
  const fag = Object.keys(udir.matematikk ?? {});
  const [valgtFag, setValgtFag] = useState(fag.find((f) => f.includes('R2')) ?? fag[0]);
  if (!fag.length && !udir.gjennomforing) return null;
  const m = udir.matematikk?.[valgtFag] ?? {};
  const aar = [...new Set(Object.values(m).flatMap((x) => Object.keys(x)))].sort();
  const siste = aar[aar.length - 1]; const tidlig = aar[Math.max(0, aar.length - 4)];
  const regioner = Object.keys(udir.fylker).filter((r) => m[r]);
  const grafData = aar.map((a) => { const rad: Record<string, number | string> = { aar: a }; fag.forEach((f) => { const v = udir.matematikk?.[f]?.['0']?.[a]?.elever; if (v != null) rad[f] = v; }); return rad; });
  const gj = udir.gjennomforing ?? {};
  const gjSiste = (r: string) => { const k = Object.keys(gj[r] ?? {}).sort(); const y = k[k.length - 1]; return y ? { kull: y, ...gj[r][y] } : null; };
  return (
    <Kort tittel="Videregående: matematikk og gjennomføring" ikon={Calculator}>
      <p className="text-xs mb-3" style={{ color: 'var(--nmbu-neutral-2)', lineHeight: 1.6 }}>
        Elever med karakter i matematikkfagene som gir grunnlag for mattekrav (R1, eller S1 + S2) og realfagspoeng. Fra opptaket høsten 2028 halveres
        realfagspoengene (R2 gir 0,5), så valget mellom R- og S-matematikk kan endre seg.
      </p>
      {fag.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginBottom: 4 }}>Hele landet, antall elever med karakter</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={grafData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="aar" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => nf(v)} />
              <Tooltip formatter={(v: number, n: string) => [nf(v), n]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {fag.map((f, i) => <Line key={f} dataKey={f} stroke={FARGER[i]} strokeWidth={2} dot={{ r: 2 }} connectNulls />)}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-1.5 mt-3 mb-2">
            {fag.map((f) => (
              <button key={f} onClick={() => setValgtFag(f)} className="px-3 py-1 rounded-full text-xs"
                style={{ backgroundColor: valgtFag === f ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)', color: valgtFag === f ? '#fff' : 'var(--nmbu-neutral-1)' }}>{f}</button>
            ))}
          </div>
        </>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
              <th className="px-3 py-2 text-left">Fylke</th>
              {fag.length > 0 && <><th className="px-3 py-2 text-right">{valgtFag} {tidlig}</th><th className="px-3 py-2 text-right">{valgtFag} {siste}</th><th className="px-3 py-2 text-right">Endring</th><th className="px-3 py-2 text-right">Snitt {siste}</th></>}
              {udir.gjennomforing && <th className="px-3 py-2 text-right">Fullført videregående</th>}
            </tr>
          </thead>
          <tbody>
            {Object.keys(udir.fylker).filter((r) => regioner.includes(r) || gj[r]).map((r) => {
              const a = m[r]?.[tidlig]?.elever; const b = m[r]?.[siste]?.elever; const g = gjSiste(r);
              return (
                <tr key={r} style={{ borderBottom: '1px solid var(--nmbu-beige-light)', fontWeight: r === '0' ? 700 : 400, backgroundColor: r === '0' ? 'var(--nmbu-beige-light)' : 'transparent' }}>
                  <td className="px-3 py-1.5">{udir.fylker[r]}</td>
                  {fag.length > 0 && <>
                    <td className="px-3 py-1.5 text-right">{nf(a)}</td>
                    <td className="px-3 py-1.5 text-right">{nf(b)}</td>
                    <td className="px-3 py-1.5 text-right" style={{ color: a && b ? (b < a ? '#b91c1c' : '#047857') : undefined }}>{a && b ? pst((100 * (b - a)) / a) : '–'}</td>
                    <td className="px-3 py-1.5 text-right">{nf(m[r]?.[siste]?.snitt, 1)}</td>
                  </>}
                  {udir.gjennomforing && <td className="px-3 py-1.5 text-right" title={g ? `Kull ${g.kull}, innen ${g.aar} år` : undefined}>{g ? `${nf(g.andel, 1)} %` : '–'}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {udir.merknader && udir.merknader.length > 0 && (
        <ul className="list-disc pl-4 mt-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{udir.merknader.map((t) => <li key={t}>{t}</li>)}</ul>
      )}
    </Kort>
  );
}
