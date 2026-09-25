import { useEffect, useRef, useState } from 'react';
import { Sparkles, X, Send, Loader2, RotateCcw, ChevronDown, ChevronUp, FileText, BarChart2, BookOpen } from 'lucide-react';
import { StyrepapirIndeks, TekstIndeks, type StyrepapirTekst, type Treff } from '../data/styrepapirSok';
import { loadFacultyBase, ALL_FACULTY_IDS, type FacultyId, type MarketInstitution } from '../data/faculties';
import { KiSvarTekst } from './KiSvarTekst';

/**
 * KI-chatten nede i hjørnet. For hvert spørsmål søker den (i nettleseren) i
 *   - nøkkeltall per program (public/ki/<fakultet>-data.json, build-ki-grunnlag.py)            → [D1..]
 *   - styrepapirene for fakultetet brukeren står på (public/markedsstatus/<fakultet>/tekst.json) → [1..] og sammendrag [S1..]
 *   - metodedokumentasjonen (public/ki/metode.json)                                              → [M1..]
 * og sender spørsmålet, de siste meldingene og de beste treffene til /api/chat (Mistral). Samtalen huskes i fanen.
 */
type DataLinje = [string, string, string, string?]; // gruppe, program, tekst, flagg (n = NMBU, h = hovedkonkurrent, r = ferdig sortert rangering)
interface Kilder { data: DataLinje[]; dok: Treff[]; sammendrag: string[]; metode: [string, string][] }
interface Melding { rolle: 'bruker' | 'assistent'; tekst: string; kilder?: Kilder; ubekreftet?: string[]; feil?: boolean; modell?: string }

const LAGRING = 'ki-chat-samtale';
const base = () => import.meta.env.BASE_URL;
const hentJson = async <T,>(fil: string): Promise<T | null> => {
  try { const r = await fetch(`${base()}${fil}`); return r.ok && (r.headers.get('content-type') ?? '').includes('json') ? ((await r.json()) as T) : null; } catch { return null; }
};

// Indeksene bygges én gang per fane og gjenbrukes
const cache = new Map<string, Promise<unknown>>();
function engang<T>(nokkel: string, lag: () => Promise<T>): Promise<T> {
  if (!cache.has(nokkel)) cache.set(nokkel, lag());
  return cache.get(nokkel) as Promise<T>;
}
const dataIndeks = (fak: FacultyId | null) => engang(`data:${fak ?? 'alle'}`, async () => {
  const filer = await Promise.all((fak ? [fak] : ALL_FACULTY_IDS).map((f) => hentJson<{ linjer: DataLinje[] }>(`ki/${f}-data.json`)));
  return new TekstIndeks<DataLinje>(filer.flatMap((f) => f?.linjer ?? []), (l) => l[2]);
});
const metodeIndeks = () => engang('metode', async () => {
  const m = await hentJson<{ avsnitt: [string, string][] }>('ki/metode.json');
  return new TekstIndeks<[string, string]>(m?.avsnitt ?? [], (a) => `${a[0]} ${a[1]}`);
});
const dokIndeks = (fak: FacultyId) => engang(`dok:${fak}`, async () => {
  const [t, b] = await Promise.all([hentJson<StyrepapirTekst>(`markedsstatus/${fak}/tekst.json`), loadFacultyBase(fak)]);
  return { indeks: t ? new StyrepapirIndeks(t) : null, institusjoner: b.marketStatus as MarketInstitution[] };
});

/**
 * Nøkkeltall til modellen: finner programgruppen spørsmålet handler om (flest av de beste treffene) og sender da
 * NMBUs program først, så hovedkonkurrentene og de mest relevante av de andre i gruppen. Treff i andre grupper tas med
 * etterpå hvis det er plass. Uten tydelig gruppe brukes de beste treffene som de er.
 */
function velgData(di: TekstIndeks<DataLinje>, q: string, sokeTekst: string): DataLinje[] {
  const treff = di.sok(q, 30).concat(di.sok(sokeTekst, 15)).filter((l, i, a) => a.indexOf(l) === i);
  const topp = treff.slice(0, 8);
  const teller = new Map<string, number>();
  topp.forEach((l) => teller.set(l[0], (teller.get(l[0]) ?? 0) + 1));
  const [gruppe, antall] = [...teller.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['', 0];
  if (!gruppe || antall < 3) return treff.slice(0, 10);
  const iGruppe = di.elementer.filter((l) => l[0] === gruppe);
  const rang = (l: DataLinje) => { const i = treff.indexOf(l); return i < 0 ? 999 : i; };
  const valgt = [
    ...iGruppe.filter((l) => l[3] === 'r').sort((a, b) => rang(a) - rang(b)).slice(0, 4),
    ...iGruppe.filter((l) => l[3] === 'n'),
    ...iGruppe.filter((l) => l[3] === 'h').sort((a, b) => rang(a) - rang(b)),
    ...iGruppe.filter((l) => !l[3]).sort((a, b) => rang(a) - rang(b)).slice(0, 6),
  ].slice(0, 18);
  return [...valgt, ...treff.filter((l) => l[0] !== gruppe).slice(0, Math.max(1, 19 - valgt.length))];
}

function forslag(visning: string, fak: FacultyId | null): string[] {
  const nmbu = fak === 'hh' ? 'økonomi og administrasjon' : 'programmene våre';
  const f: Record<string, string[]> = {
    analyse: [`Hvordan ligger poenggrensen for ${nmbu} an mot konkurrentene i 2026?`, 'Hvilke konkurrenter tok opp alle kvalifiserte søkere?', 'Hvordan er tilbudsandel regnet ut?'],
    markedsstatus: ['Hvilke konkurrenter planlegger nye studieprogram?', 'Hvem har økonomiske utfordringer i 2025?', 'Hva sier konkurrentene om opptaksrammer?'],
    gjennomforing: ['Hvilke program har høyest frafall?', 'Hvordan er gjennomføringen vår mot konkurrentene?'],
    studentene: ['Hvor stor andel av undervisningen er på engelsk hos oss og konkurrentene?', 'Hvordan måles innreisende utvekslingsstudenter?'],
  };
  return f[visning] ?? (fak ? [`Hvordan ligger ${nmbu} an mot konkurrentene?`, 'Hvilke konkurrenter planlegger nye studieprogram?', 'Hvordan er tallene på siden hentet?'] : ['Hvilke fakulteter har program som sliter med å fylle opp?', 'Hvordan er tallene på siden hentet?', 'Hva endres i opptaksreglene fra 2028?']);
}

export function KiChatPanel({ apen, lukk, fakultet, visning, sted }: { apen: boolean; lukk: () => void; fakultet: FacultyId | null; visning: string; sted: string }) {
  const [meldinger, setMeldinger] = useState<Melding[]>(() => { try { return JSON.parse(sessionStorage.getItem(LAGRING) ?? '[]'); } catch { return []; } });
  const [tekst, setTekst] = useState('');
  const [venter, setVenter] = useState(false);
  const bunn = useRef<HTMLDivElement>(null);
  const felt = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { try { sessionStorage.setItem(LAGRING, JSON.stringify(meldinger.slice(-20))); } catch { /* ikke lagret */ } }, [meldinger]);
  useEffect(() => { bunn.current?.scrollIntoView({ block: 'end' }); }, [meldinger, venter, apen]);
  useEffect(() => { if (apen) setTimeout(() => felt.current?.focus(), 50); }, [apen]);

  const send = async (sporsmal: string) => {
    const q = sporsmal.trim();
    if (!q || venter) return;
    setTekst('');
    const historikk = meldinger.filter((m) => !m.feil).slice(-6).map((m) => ({ rolle: m.rolle, tekst: m.tekst }));
    setMeldinger((m) => [...m, { rolle: 'bruker', tekst: q }]);
    setVenter(true);
    try {
      // Søket bruker også forrige spørsmål, så følgespørsmål («og for master?») finner riktige kilder
      const forrige = [...meldinger].reverse().find((m) => m.rolle === 'bruker')?.tekst ?? '';
      const sokeTekst = `${q} ${forrige}`;
      const [di, mi, dk] = await Promise.all([dataIndeks(fakultet), metodeIndeks(), fakultet ? dokIndeks(fakultet) : Promise.resolve(null)]);
      const data = velgData(di, q, sokeTekst);
      const metode = mi.sok(q, 3);
      const dok = dk?.indeks ? dk.indeks.sok(sokeTekst, 6) : [];
      const inst = [...new Set(dok.map((t) => t.dok.inst))].slice(0, 4);
      const sam = inst.map((n) => dk?.institusjoner.find((i) => i.name === n)).filter((i): i is MarketInstitution => !!i);
      const kilder: Kilder = { data, dok, sammendrag: sam.map((s) => s.name), metode };
      const r = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sporsmal: q, historikk, sted,
          kilder: {
            data: data.map((l) => ({ tittel: `${l[0]} · ${l[1]}`, tekst: l[2] })),
            dok: dok.map((t) => ({ inst: t.dok.inst, dok: t.dok.label, dato: t.dok.dato, side: t.side, tekst: t.tekst })),
            sammendrag: sam.map((s) => ({ inst: s.name, enhet: s.enhet, oppsummering: s.oppsummering, punkter: s.punkter })),
            metode: metode.map((m) => ({ tittel: m[0], tekst: m[1] })),
          },
        }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.svar) throw new Error(j?.feil ?? (r.status === 404 ? 'KI-chatten er bare tilgjengelig på den publiserte siden.' : `Feil ${r.status}`));
      setMeldinger((m) => [...m, { rolle: 'assistent', tekst: j.svar, kilder, ubekreftet: j.ubekreftet, modell: j.modell }]);
    } catch (e) {
      setMeldinger((m) => [...m, { rolle: 'assistent', tekst: e instanceof Error ? e.message : 'Noe gikk galt.', feil: true }]);
    } finally { setVenter(false); }
  };

  if (!apen) return null;
  return (
    <div className="fixed z-[80] flex flex-col overflow-hidden inset-0 sm:inset-auto sm:right-5 sm:bottom-[84px] sm:w-[420px] sm:h-[min(640px,calc(100vh-110px))] sm:rounded-2xl"
      style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
      role="dialog" aria-label="KI-chat">
      {/* Topp */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
        <Sparkles className="w-4 h-4 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">Spør KI om dataene</div>
          <div className="text-xs truncate" style={{ opacity: 0.75 }}>Du står på: {sted}</div>
        </div>
        {meldinger.length > 0 && (
          <button onClick={() => setMeldinger([])} title="Ny samtale" className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}><RotateCcw className="w-4 h-4" /></button>
        )}
        <button onClick={lukk} title="Lukk" className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}><X className="w-4 h-4" /></button>
      </div>

      {/* Meldinger */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
        {meldinger.length === 0 && (
          <div className="text-sm" style={{ color: 'var(--nmbu-neutral-1)', lineHeight: 1.6 }}>
            <p className="mb-2">Still spørsmål om studieprogrammene, konkurrentene og tallene på nettsiden. Svarene bygger på nøkkeltallene, styrepapirene{fakultet ? '' : ' (velg et fakultet for styrepapirene)'} og metodebeskrivelsen, med kilder.</p>
            <div className="flex flex-col gap-1.5">
              {forslag(visning, fakultet).map((f) => (
                <button key={f} onClick={() => send(f)} className="text-left text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-green-dark)' }}>{f}</button>
              ))}
            </div>
          </div>
        )}
        {meldinger.map((m, i) => (m.rolle === 'bruker'
          ? <div key={i} className="ml-8 rounded-2xl rounded-br-sm px-3 py-2 text-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>{m.tekst}</div>
          : <Svar key={i} m={m} />))}
        {venter && <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}><Loader2 className="w-3.5 h-3.5 animate-spin" /> Søker i kildene og skriver svar …</div>}
        <div ref={bunn} />
      </div>

      {/* Skrivefelt */}
      <form onSubmit={(e) => { e.preventDefault(); send(tekst); }} className="flex items-end gap-2 px-3 py-3" style={{ borderTop: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
        <textarea ref={felt} value={tekst} onChange={(e) => setTekst(e.target.value)} rows={1} maxLength={600}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(tekst); } }}
          placeholder="Skriv et spørsmål …" className="flex-1 resize-none px-3 py-2 rounded-xl text-sm"
          style={{ border: '1px solid var(--nmbu-neutral-3)', maxHeight: 120, backgroundColor: '#fff', color: 'var(--nmbu-neutral)' }} />
        <button type="submit" disabled={venter || !tekst.trim()} className="p-2.5 rounded-xl" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', opacity: venter || !tekst.trim() ? 0.5 : 1 }} aria-label="Send">
          <Send className="w-4 h-4" />
        </button>
      </form>
      <div className="px-4 pb-2 text-[10px]" style={{ color: 'var(--nmbu-neutral-2)', backgroundColor: '#fff' }}>Mistral (EU). KI kan ta feil; sjekk kildene. Ikke skriv personopplysninger.</div>
    </div>
  );
}

function Svar({ m }: { m: Melding }) {
  const [visKilder, setVisKilder] = useState(false);
  if (m.feil) return <div className="mr-6 rounded-2xl px-3 py-2 text-xs" style={{ backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>{m.tekst}</div>;
  const k = m.kilder;
  const lenke = (t: Treff) => `${t.dok.fil}#page=${t.side}`;
  const antall = k ? k.data.length + k.dok.length + k.metode.length : 0;
  return (
    <div className="mr-4 rounded-2xl rounded-bl-sm px-3 py-2 text-sm" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral)', lineHeight: 1.6 }}>
      <KiSvarTekst tekst={m.tekst} kilde={(ref) => {
        if (!k) return null;
        const d = ref.match(/^D(\d+)$/i); if (d && k.data[Number(d[1]) - 1]) { const l = k.data[Number(d[1]) - 1]; return { tekst: `D${d[1]}`, tittel: `Nøkkeltall: ${l[0]} · ${l[1]}` }; }
        const me = ref.match(/^M(\d+)$/i); if (me && k.metode[Number(me[1]) - 1]) return { tekst: `M${me[1]}`, tittel: `Metode: ${k.metode[Number(me[1]) - 1][0]}` };
        const s = ref.match(/^S(\d+)$/i); if (s && k.sammendrag[Number(s[1]) - 1]) return { tekst: `S${s[1]}`, tittel: `Sammendraget for ${k.sammendrag[Number(s[1]) - 1]} i markedsstatus` };
        const t = /^\d+$/.test(ref) ? k.dok[Number(ref) - 1] : undefined;
        return t ? { tekst: ref, tittel: `${t.dok.inst}: ${t.dok.label}, side ${t.side}`, href: lenke(t) } : null;
      }} />
      {m.ubekreftet && m.ubekreftet.length > 0 && (
        <div className="text-xs rounded px-2 py-1 mt-1" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', color: '#78350F' }}>
          Kontroll: disse tallene står ikke i kildene og kan være beregnet eller feil: <b>{m.ubekreftet.join(', ')}</b>.
        </div>
      )}
      {k && antall > 0 && (
        <div className="mt-1.5">
          <button onClick={() => setVisKilder((v) => !v)} className="flex items-center gap-1 text-xs" style={{ color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>
            {visKilder ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />} Kilder ({antall})
          </button>
          {visKilder && (
            <ul className="mt-1 space-y-1 text-xs" style={{ color: 'var(--nmbu-neutral-1)' }}>
              {k.data.map((l, i) => <li key={`d${i}`} className="flex gap-1.5"><BarChart2 className="w-3 h-3 mt-0.5 shrink-0" /><span><b>D{i + 1}</b> Nøkkeltall: {l[0]} · {l[1]}</span></li>)}
              {k.dok.map((t, i) => <li key={`k${i}`} className="flex gap-1.5"><FileText className="w-3 h-3 mt-0.5 shrink-0" /><a href={lenke(t)} target="_blank" rel="noreferrer" style={{ color: 'var(--nmbu-green-dark)' }}><b>{i + 1}</b> {t.dok.inst}: {t.dok.label}, side {t.side}</a></li>)}
              {k.metode.map((mm, i) => <li key={`m${i}`} className="flex gap-1.5"><BookOpen className="w-3 h-3 mt-0.5 shrink-0" /><span><b>M{i + 1}</b> Metode: {mm[0]}</span></li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
