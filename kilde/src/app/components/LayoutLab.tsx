import { useState, type ReactNode } from 'react';
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  LayoutGrid, PanelLeft, PanelTop, Search, Table2, Presentation, Monitor, Tablet, Smartphone,
  ChevronLeft, ChevronRight, TrendingUp, BookOpen, GraduationCap, Users, Microscope, Home, Landmark, Check, X, Wrench,
} from 'lucide-react';
import { FACULTY_IDS, ALL_FACULTY_IDS, useAllFacultyBases, type FacultyBase, type FacultyId } from '../data/faculties';
import { Matrise, lagRader, median, nf, type Rad } from './Matrise';
import { useInnebygd } from '../innebygd';

// Grunndataene for alle fakultetene; settes av LayoutLab før skissene tegnes.
let FACULTIES = {} as Record<FacultyId, FacultyBase>;
import { ECON_UNITS } from '../data/economyData';

/**
 * «Alternative oppsett»: fem forslag til hvordan nettsiden kan struktureres, vist som klikkbare skisser med ekte tall.
 * Ikke fullverdige løsninger; tanken er at to av dem blir valgbare oppsett på nettsiden.
 */

// ── Ekte tall til skissene ──────────────────────────────────────────────────
const MODULER = [
  { id: 'opptak', label: 'Opptak', icon: TrendingUp },
  { id: 'emner', label: 'Emner og karakterer', icon: BookOpen },
  { id: 'gjennomforing', label: 'Gjennomføring', icon: GraduationCap },
  { id: 'studentene', label: 'Studentene', icon: Users },
  { id: 'fagmiljo', label: 'Fagmiljøet', icon: Microscope },
  { id: 'bolig', label: 'Bolig', icon: Home },
  { id: 'okonomi', label: 'Økonomi', icon: Landmark },
] as const;


// ── Felles småkomponenter ───────────────────────────────────────────────────
function Kpi({ l, v, sub }: { l: string; v: string; sub?: string }) {
  return (
    <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--nmbu-green-dark)', lineHeight: 1.2 }}>{v}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{sub}</div>}
    </div>
  );
}
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--nmbu-green-dark)', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
function MiniTrend({ fak, gruppe }: { fak: FacultyBase; gruppe: string }) {
  const g = fak.admissionGroups.find((x) => x.id === gruppe)!;
  const ents = g.entries.filter((e) => g.defaultIds.includes(e.id)).slice(0, 5);
  const data = ['2021', '2022', '2023', '2024', '2025', '2026'].map((y) => ({ y, ...Object.fromEntries(ents.map((e) => [e.id, e.years[y]?.pg_ord || null])) }));
  const col = ['#025C4F', '#2563EB', '#B45309', '#9333EA', '#DC2626'];
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="y" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} domain={['auto', 'auto']} />
        <Tooltip />
        {ents.map((e, i) => <Line key={e.id} dataKey={e.id} name={e.shortName} stroke={g.nmbuIds.includes(e.id) ? col[0] : col[(i % 4) + 1]} strokeWidth={g.nmbuIds.includes(e.id) ? 3 : 1.5} dot={false} connectNulls />)}
      </LineChart>
    </ResponsiveContainer>
  );
}
function MiniBar({ data }: { data: { n: string; v: number; nmbu?: boolean }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(110, data.length * 22 + 20)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
        <XAxis type="number" hide /><YAxis type="category" dataKey="n" width={70} tick={{ fontSize: 9 }} />
        <Tooltip formatter={(v: number) => nf(v)} />
        <Bar dataKey="v" radius={[0, 3, 3, 0]} label={{ position: 'right', fontSize: 9, formatter: (v: number) => nf(v) }}>
          {data.map((d) => <Cell key={d.n} fill={d.nmbu ? '#025C4F' : '#9CA3AF'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
const opMottData = (fak: FacultyBase, gruppe: string) => {
  const g = fak.admissionGroups.find((x) => x.id === gruppe)!;
  return g.entries.filter((e) => g.defaultIds.includes(e.id) && e.years['2025']?.op_mott != null)
    .map((e) => ({ n: e.shortName, v: e.years['2025']!.op_mott!, nmbu: g.nmbuIds.includes(e.id) })).sort((a, b) => b.v - a.v);
};

// ── 0: Dagens oppsett ───────────────────────────────────────────────────────
function Dagens() {
  const [fak, setFak] = useState<FacultyBase | null>(null);
  if (!fak) return (
    <div className="p-5" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
      <div className="text-center mb-4" style={{ fontFamily: "'Lora', serif", fontSize: 24, color: 'var(--nmbu-green-dark)' }}>NMBU</div>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {FACULTY_IDS.map((id) => (
          <button key={id} onClick={() => setFak(FACULTIES[id])} className="rounded-xl p-4 text-left" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
            <div style={{ fontSize: 10, color: 'var(--nmbu-green-dark)', fontWeight: 700 }}>{FACULTIES[id].shortLabel}</div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 15, color: 'var(--nmbu-green-dark)' }}>{FACULTIES[id].label}</div>
          </button>
        ))}
      </div>
    </div>
  );
  return (
    <div className="p-5" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
      <button onClick={() => setFak(null)} className="text-xs mb-3" style={{ color: 'var(--nmbu-green-dark)' }}>← Fakulteter</button>
      <div style={{ fontFamily: "'Lora', serif", fontSize: 20, color: 'var(--nmbu-green-dark)', marginBottom: 10 }}>{fak.label}</div>
      <div className="flex flex-col gap-2" style={{ maxWidth: 640, margin: '0 auto' }}>
        {MODULER.map((m) => (
          <div key={m.id} className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
            <m.icon className="w-5 h-5" style={{ color: 'var(--nmbu-green-dark)' }} /><span style={{ fontWeight: 600 }}>{m.label}</span>
            <span className="ml-auto text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>åpner egen side →</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 1: Fullskjerm-dashboard med sidemeny ────────────────────────────────────
function Dashboard({ rader }: { rader: Rad[] }) {
  const [fakId, setFakId] = useState(FACULTY_IDS[1]);
  const [modul, setModul] = useState<string>('opptak');
  const fak = FACULTIES[fakId];
  const r = rader.find((x) => x.fak.id === fakId) ?? rader[0];
  return (
    <div className="flex" style={{ minHeight: 520, backgroundColor: 'var(--nmbu-beige-light)' }}>
      <aside className="shrink-0 p-3 flex flex-col gap-1" style={{ width: 210, backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
        <div style={{ fontFamily: "'Lora', serif", fontSize: 18, marginBottom: 8 }}>NMBU</div>
        {FACULTY_IDS.map((id) => (
          <div key={id}>
            <button onClick={() => setFakId(id)} className="w-full text-left px-2 py-1.5 rounded-md text-xs" style={{ backgroundColor: id === fakId ? 'rgba(255,255,255,0.15)' : 'transparent', fontWeight: id === fakId ? 700 : 400 }}>{FACULTIES[id].shortLabel}</button>
            {id === fakId && MODULER.map((m) => (
              <button key={m.id} onClick={() => setModul(m.id)} className="w-full flex items-center gap-2 pl-5 pr-2 py-1 text-xs rounded-md" style={{ opacity: modul === m.id ? 1 : 0.7, backgroundColor: modul === m.id ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                <m.icon className="w-3.5 h-3.5" /> {m.label}
              </button>
            ))}
          </div>
        ))}
      </aside>
      <main className="flex-1 min-w-0 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)', fontSize: 15 }}>{fak.label} · {MODULER.find((m) => m.id === modul)!.label}</span>
          <span className="ml-auto px-2 py-1 rounded-md" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>Gruppe: {r.gruppeLabel} ▾</span>
          <span className="px-2 py-1 rounded-md" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>År: 2025 ▾</span>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
          <Kpi l="Poenggrense ord." v={r.pg != null ? nf(r.pg) : 'Alle inn'} sub={`konkurrenter ${nf(r.pgK)}`} />
          <Kpi l="Snitt møtt" v={nf(r.op)} sub={`konkurrenter ${nf(r.opK)}`} />
          <Kpi l="Søkerpress" v={nf(r.sp, 2)} sub={`konkurrenter ${nf(r.spK, 2)}`} />
          <Kpi l={`Fullført normert (kull ${r.kullAar ?? '–'})`} v={`${nf(r.norm)} %`} sub={`konkurrenter ${nf(r.normK)} %`} />
          <Kpi l="Frafall" v={`${nf(r.fraf)} %`} sub={`konkurrenter ${nf(r.frafK)} %`} />
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <Panel title="Poenggrense ordinær, trend"><MiniTrend fak={fak} gruppe={r.gruppe} /></Panel>
          <Panel title="Snitt opptakspoeng for dem som møtte, 2025"><MiniBar data={opMottData(fak, r.gruppe)} /></Panel>
        </div>
      </main>
    </div>
  );
}

// ── 2: Toppmeny med moduler som faner ───────────────────────────────────────
function Toppmeny({ rader }: { rader: Rad[] }) {
  const [modul, setModul] = useState<string>('opptak');
  const [fakId, setFakId] = useState(FACULTY_IDS[1]);
  const fak = FACULTIES[fakId];
  const grupper = fak.admissionGroups.filter((g) => g.nmbuIds.length && g.level !== 'master2');
  const [gruppe, setGruppe] = useState(grupper[0]?.id);
  const g = grupper.find((x) => x.id === gruppe) ?? grupper[0];
  return (
    <div style={{ minHeight: 520, backgroundColor: 'var(--nmbu-beige-light)' }}>
      <header className="flex items-center gap-4 px-5 py-3 flex-wrap" style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
        <span style={{ fontFamily: "'Lora', serif", fontSize: 18, color: 'var(--nmbu-green-dark)' }}>NMBU-sammenligning</span>
        <nav className="flex gap-1 flex-wrap">
          {MODULER.map((m) => (
            <button key={m.id} onClick={() => setModul(m.id)} className="flex items-center gap-1.5 px-3 py-2 text-xs"
              style={{ borderBottom: modul === m.id ? '2px solid var(--nmbu-green-dark)' : '2px solid transparent', color: modul === m.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-1)', fontWeight: modul === m.id ? 700 : 400 }}>
              <m.icon className="w-3.5 h-3.5" />{m.label}
            </button>
          ))}
        </nav>
        <select value={fakId} onChange={(e) => { setFakId(e.target.value as typeof fakId); setGruppe(undefined); }} className="ml-auto text-xs rounded-md px-2 py-1" style={{ border: '1px solid var(--nmbu-neutral-3)' }}>
          {FACULTY_IDS.map((id) => <option key={id} value={id}>{FACULTIES[id].shortLabel}</option>)}
        </select>
      </header>
      <div className="px-5 py-2 flex gap-2 flex-wrap" style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
        {grupper.map((x) => (
          <button key={x.id} onClick={() => setGruppe(x.id)} className="px-3 py-1 rounded-full text-xs"
            style={{ backgroundColor: x.id === g?.id ? 'var(--nmbu-green-dark)' : 'var(--nmbu-beige-light)', color: x.id === g?.id ? '#fff' : 'var(--nmbu-neutral-1)' }}>{x.label}</button>
        ))}
      </div>
      {g && (
        <div className="p-5 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <Panel title={`${MODULER.find((m) => m.id === modul)!.label}: ${g.label}, poenggrense over tid`}><MiniTrend fak={fak} gruppe={g.id} /></Panel>
          <Panel title="Snitt opptakspoeng for dem som møtte, 2025"><MiniBar data={opMottData(fak, g.id)} /></Panel>
          <div className="md:col-span-2" style={{ gridColumn: '1 / -1' }}>
            <Panel title="Tabell (hele bredden)">
              <div className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
                {(rader.filter((r) => r.gruppe === g.id)[0]?.program) ?? g.label}: datatabellen får hele skjermbredden under grafene, med faste kolonneoverskrifter.
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 3: Program-først (profilside med innholdsfortegnelse) ───────────────────
function ProgramForst({ rader }: { rader: Rad[] }) {
  const [q, setQ] = useState('');
  const [valgt, setValgt] = useState<Rad | null>(null);
  const treff = rader.filter((r) => (r.program + ' ' + r.gruppeLabel + ' ' + r.fak.shortLabel).toLowerCase().includes(q.toLowerCase()));
  if (!valgt) return (
    <div className="p-6" style={{ minHeight: 520, backgroundColor: 'var(--nmbu-beige-light)' }}>
      <div className="text-center" style={{ fontFamily: "'Lora', serif", fontSize: 22, color: 'var(--nmbu-green-dark)' }}>Hvilket NMBU-program vil du se på?</div>
      <div className="flex items-center gap-2 mx-auto mt-3 rounded-xl px-3 py-2" style={{ maxWidth: 520, backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
        <Search className="w-4 h-4" style={{ color: 'var(--nmbu-neutral-2)' }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søk: bygg, biologi, eiendom …" className="flex-1 text-sm outline-none bg-transparent" />
      </div>
      <div className="grid gap-2 mt-4 mx-auto" style={{ maxWidth: 760, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {treff.slice(0, 18).map((r) => (
          <button key={r.fak.id + r.gruppe} onClick={() => setValgt(r)} className="rounded-lg px-3 py-2 text-left text-xs" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
            <div style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{r.gruppeLabel}</div>
            <div style={{ color: 'var(--nmbu-neutral-2)' }}>{r.fak.shortLabel}</div>
          </button>
        ))}
      </div>
    </div>
  );
  const seksjoner = MODULER.filter((m) => m.id !== 'okonomi');
  return (
    <div className="flex" style={{ minHeight: 520, backgroundColor: 'var(--nmbu-beige-light)' }}>
      <aside className="shrink-0 p-4 text-xs flex flex-col gap-1" style={{ width: 180, borderRight: '1px solid var(--nmbu-neutral-3)' }}>
        <button onClick={() => setValgt(null)} className="mb-2 text-left" style={{ color: 'var(--nmbu-green-dark)' }}>← Alle program</button>
        <div style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{valgt.gruppeLabel}</div>
        <div style={{ color: 'var(--nmbu-neutral-2)', marginBottom: 8 }}>{valgt.fak.shortLabel}</div>
        {seksjoner.map((m) => <a key={m.id} href={`#pf-${m.id}`} className="flex items-center gap-1.5 py-1" style={{ color: 'var(--nmbu-neutral-1)' }}><m.icon className="w-3.5 h-3.5" />{m.label}</a>)}
      </aside>
      <main className="flex-1 min-w-0 p-5 flex flex-col gap-4 overflow-auto" style={{ maxHeight: 620 }}>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
          <div style={{ fontFamily: "'Lora', serif", fontSize: 20 }}>{valgt.gruppeLabel} ved NMBU</div>
          <div className="text-xs mt-1" style={{ opacity: 0.8 }}>Én side som samler alt om programmet mot konkurrentene, fra søkere til jobb.</div>
        </div>
        <section id="pf-opptak"><Panel title="Opptak: poenggrense over tid"><MiniTrend fak={valgt.fak} gruppe={valgt.gruppe} /></Panel></section>
        <section id="pf-emner"><Panel title="Emner og karakterer"><div className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>Karakterindeks og strykandel mot konkurrentenes tilsvarende emner.</div></Panel></section>
        <section id="pf-gjennomforing"><Panel title={`Gjennomføring (kull ${valgt.kullAar ?? '–'})`}><MiniBar data={[{ n: 'NMBU', v: valgt.norm ?? 0, nmbu: true }, { n: 'Konkurrenter', v: valgt.normK ?? 0 }]} /></Panel></section>
        {seksjoner.slice(3).map((m) => <section key={m.id} id={`pf-${m.id}`}><Panel title={m.label}><div className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>Utdrag fra {m.label.toLowerCase()} for programmet og konkurrentene.</div></Panel></section>)}
      </main>
    </div>
  );
}


// ── 5: Rapport / presentasjon ───────────────────────────────────────────────
function Rapport({ rader }: { rader: Rad[] }) {
  const [i, setI] = useState(0);
  const apne = rader.filter((r) => r.apent && r.op != null);
  const bedreOp = rader.filter((r) => r.op != null && r.opK != null && r.op > r.opK);
  const bedreNorm = rader.filter((r) => r.norm != null && r.normK != null && r.norm > r.normK);
  const nmbuEcon = ECON_UNITS.find((u) => u.isNmbu)!;
  const eks = nmbuEcon.years.find((y) => y.aar === 2025);
  const slides = [
    { tall: `${rader.length}`, tekst: 'programgrupper der NMBU sammenlignes med konkurrentene, på tvers av seks fakulteter.' },
    { tall: `${apne.length}`, tekst: `programgrupper der NMBU tok opp alle kvalifiserte søkere i 2025, men de som møtte hadde likevel i snitt ${nf(median(apne.map((r) => r.op!)))} opptakspoeng.` },
    { tall: `${bedreOp.length} av ${rader.filter((r) => r.op != null && r.opK != null).length}`, tekst: 'programgrupper der NMBU-studentene som møtte hadde høyere snittpoeng enn konkurrentenes median.' },
    { tall: `${bedreNorm.length} av ${rader.filter((r) => r.norm != null && r.normK != null).length}`, tekst: 'programgrupper der flere fullfører på normert tid ved NMBU enn hos konkurrentene (siste målte kull).' },
    { tall: eks?.driftsinntekter ? `${nf(eks.driftsinntekter / 1e6, 2)} mrd.` : '–', tekst: 'kroner i driftsinntekter for NMBU i 2025 (DBH 902).' },
  ];
  const s = slides[i];
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 520, backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6 }}>Funn {i + 1} av {slides.length}</div>
      <div style={{ fontFamily: "'Lora', serif", fontSize: 64, lineHeight: 1.1, margin: '16px 0' }}>{s.tall}</div>
      <div style={{ fontSize: 18, maxWidth: 560, opacity: 0.9 }}>{s.tekst}</div>
      <div className="flex gap-3 mt-8">
        <button onClick={() => setI((i + slides.length - 1) % slides.length)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}><ChevronLeft className="w-5 h-5" /></button>
        <button onClick={() => setI((i + 1) % slides.length)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}><ChevronRight className="w-5 h-5" /></button>
      </div>
      <div className="text-xs mt-4" style={{ opacity: 0.6 }}>I en ferdig versjon lenker hvert funn videre til visningen det kommer fra.</div>
    </div>
  );
}

// ── Beskrivelser ────────────────────────────────────────────────────────────
interface Forslag { id: string; navn: string; kort: string; icon: typeof LayoutGrid; ide: string; passer: string; pluss: string[]; minus: string[]; bygge: string; vis: (r: Rad[]) => ReactNode; }
const FORSLAG: Forslag[] = [
  { id: 'dagens', navn: 'Dagens: kort og landingssider', kort: 'Fakultetskort → landingsside → egen side per modul', icon: LayoutGrid,
    ide: 'Slik nettsiden er nå: forsiden har kort per fakultet, fakultetssiden har kort per modul, og hver modul åpner en egen side med smal, sentrert innholdsbredde.',
    passer: 'Førstegangsbrukere og visning i møter der man går steg for steg.', pluss: ['Lett å forstå', 'Figma-utseendet er bevart', 'Fungerer bra på mobil'],
    minus: ['Mange klikk og mye rulling for å bytte modul', 'Bruker lite av en bred skjerm', 'Vanskelig å sammenligne moduler side om side'], bygge: 'Finnes.', vis: () => <Dagens /> },
  { id: 'dashboard', navn: 'Fullskjerm-dashboard', kort: 'Fast sidemeny, nøkkeltall og grafer i rutenett over hele bredden', icon: PanelLeft,
    ide: 'Hele skjermbredden brukes. En fast sidemeny til venstre har fakultetene med modulene under, og innholdet er et rutenett med nøkkeltall øverst og flere grafer side om side. Gruppe og år velges i en felles filterlinje.',
    passer: 'Daglig bruk på stor skjerm, for dem som kjenner dataene og vil hoppe raskt mellom moduler.', pluss: ['Én klikk mellom alle moduler', 'Mye informasjon synlig samtidig', 'Felles filter for gruppe og år'],
    minus: ['Tettere og mer krevende for nye brukere', 'Sidemenyen må legges bort på mobil'], bygge: 'Middels: ny ramme (sidemeny, filterlinje) rundt eksisterende moduler, og at modulene tar imot felles filter. Ca. 1–2 dager.', vis: (r) => <Dashboard rader={r} /> },
  { id: 'toppmeny', navn: 'Toppmeny med moduler som faner', kort: 'Modulene som faner øverst, fakultet i nedtrekksmeny', icon: PanelTop,
    ide: 'Som sammenligningsportalen: en fast toppmeny med modulene som faner og fakultet i en nedtrekksmeny, og en rad med programgrupper under. Innholdet får full bredde, med tabeller under grafene.',
    passer: 'Brukere som tenker «jeg vil se opptak» først og fakultet etterpå.', pluss: ['Kjent mønster (portalen)', 'Full bredde uten sidemeny', 'Lett å bytte fakultet uten å miste valgt modul'],
    minus: ['Sju faner må brytes eller rulles på smal skjerm', 'Mindre plass til fakultetsspesifikke forklaringer'], bygge: 'Lite til middels: ny toppmeny og at valgt modul huskes ved fakultetsbytte. Ca. 1 dag.', vis: (r) => <Toppmeny rader={r} /> },
  { id: 'program', navn: 'Program-først: profilside', kort: 'Søk etter et NMBU-program og få alt om det på én side', icon: Search,
    ide: 'Start med et søk etter NMBU-programmet. Programsiden samler alle lagene (opptak, karakterer, gjennomføring, studentene, Studiebarometeret, bolig og fagmiljø) under hverandre med innholdsfortegnelse, alltid mot konkurrentene.',
    passer: 'Programansvarlige og studieprogramråd som bare bryr seg om sitt eget program.', pluss: ['Svarer på «hvordan går det med mitt program?» på én side', 'Godt utgangspunkt for utskrift/PDF', 'Samme side kan deles som lenke'],
    minus: ['Dårligere for å sammenligne mange NMBU-program', 'Krever at alle lag kan vises i kompakt form'], bygge: 'Middels til stort: kompakte varianter av hvert lag og en programindeks. Ca. 2–3 dager.', vis: (r) => <ProgramForst rader={r} /> },
  { id: 'matrise', navn: 'Sammenligningsmatrise', kort: 'Varmekart: alle NMBU-program × nøkkeltall mot konkurrentene', icon: Table2,
    ide: 'Én stor tabell over hele skjermen: hver rad er et NMBU-program, hver kolonne et nøkkeltall, og fargen viser om NMBU ligger over eller under konkurrentenes median. Klikk på en rad for detaljgrafer. Tallene i skissen er ekte.',
    passer: 'Ledelse og fakultetsstyrer som vil se hele porteføljen og finne avvik raskt.', pluss: ['Hele porteføljen på ett skjermbilde', 'Avvik springer i øynene', 'Bruker bredden fullt ut'],
    minus: ['Farger forenkler (median, ulike nivåer i samme gruppe)', 'Må velge få og robuste nøkkeltall'], bygge: 'Middels: beregne sammenlignbare nøkkeltall per program på tvers av lagene. Ca. 1–2 dager.', vis: (r) => <Matrise rader={r} /> },
  { id: 'rapport', navn: 'Rapport- og presentasjonsmodus', kort: 'Fullskjerm med ett funn per side, piltaster for å bla', icon: Presentation,
    ide: 'En fortellende modus for møter: fullskjerm, ett funn om gangen med stort tall og én setning, og lenke videre til visningen funnet kommer fra. Funnene i skissen er regnet ut fra dataene.',
    passer: 'Presentasjoner for ledelse, styre og eksterne.', pluss: ['Klar til bruk i møter uten egne lysbilder', 'Funnene oppdateres når dataene oppdateres'],
    minus: ['Egner seg ikke til egen utforsking', 'Funnene må kurateres så de ikke blir misvisende'], bygge: 'Lite til middels: en funnliste og en fullskjermvisning. Ca. 1 dag.', vis: (r) => <Rapport rader={r} /> },
];

const BREDDER = [
  { id: 'desktop', label: 'Skrivebord', w: '100%', icon: Monitor },
  { id: 'tablet', label: 'Nettbrett', w: '820px', icon: Tablet },
  { id: 'mobil', label: 'Mobil', w: '390px', icon: Smartphone },
] as const;

export function LayoutLab({ onBack }: { onBack: () => void }) {
  const alle = useAllFacultyBases(ALL_FACULTY_IDS);
  if (!alle) return <div className="min-h-screen p-8 text-sm" style={{ backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-2)' }}>Laster fakultetsdataene …</div>;
  FACULTIES = Object.fromEntries(alle.map((f) => [f.id, f])) as Record<FacultyId, FacultyBase>;
  return <LayoutLabInnhold onBack={onBack} rader={lagRader(alle)} />;
}

function LayoutLabInnhold({ onBack, rader }: { onBack: () => void; rader: Rad[] }) {
  const [valgt, setValgt] = useState('dashboard');
  const [bredde, setBredde] = useState<typeof BREDDER[number]['id']>('desktop');
  const f = FORSLAG.find((x) => x.id === valgt)!;
  const innebygd = useInnebygd();
  return (
    <div className={innebygd ? '' : 'min-h-screen p-5'} style={innebygd ? undefined : { backgroundColor: 'var(--nmbu-beige-light)' }}>
      {!innebygd && <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs mb-4" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>← Fakulteter</button>}
      <header className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-9 rounded-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)' }} />
          <h1 className="text-4xl" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif", fontWeight: 500 }}>Alternative oppsett</h1>
        </div>
        <p className="text-sm pl-4" style={{ color: 'var(--nmbu-neutral-1)', maxWidth: 820 }}>
          Fem forslag til hvordan nettsiden kan struktureres, ved siden av dagens oppsett. Skissene er klikkbare og bruker ekte tall.
          Forslag 1 og 2 er nå bygget som valgbare oppsett (knappen «Oppsett» øverst til høyre); de andre er fortsatt skisser.
        </p>
      </header>

      <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(230px, 280px) 1fr' }}>
        <div className="flex flex-col gap-2">
          {FORSLAG.map((x, i) => (
            <button key={x.id} onClick={() => setValgt(x.id)} className="rounded-xl px-3 py-3 text-left flex gap-3"
              style={{ backgroundColor: x.id === valgt ? 'var(--nmbu-green-dark)' : '#fff', color: x.id === valgt ? '#fff' : 'var(--nmbu-neutral-1)', border: '1px solid ' + (x.id === valgt ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-3)') }}>
              <x.icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{i === 0 ? '' : `${i}. `}{x.navn}</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{x.kort}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {BREDDER.map((b) => (
              <button key={b.id} onClick={() => setBredde(b.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                style={{ backgroundColor: bredde === b.id ? 'var(--nmbu-green-4)' : '#fff', color: 'var(--nmbu-neutral-1)', border: '1px solid var(--nmbu-neutral-3)', fontWeight: bredde === b.id ? 700 : 400 }}>
                <b.icon className="w-3.5 h-3.5" /> {b.label}
              </button>
            ))}
          </div>
          <div className="mx-auto rounded-xl overflow-hidden transition-all" style={{ width: BREDDER.find((b) => b.id === bredde)!.w, maxWidth: '100%', border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: 'var(--nmbu-beige)', borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f87171' }} /><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#fbbf24' }} /><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#34d399' }} />
              <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#fff', color: 'var(--nmbu-neutral-2)' }}>nmbu-sammenligning.pages.dev · {f.navn}</span>
            </div>
            <div key={f.id + bredde}>{f.vis(rader)}</div>
          </div>

          <div className="grid gap-4 mt-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            <Panel title="Idé"><p className="text-xs" style={{ color: 'var(--nmbu-neutral-1)', lineHeight: 1.6 }}>{f.ide}</p><p className="text-xs mt-2" style={{ color: 'var(--nmbu-neutral-2)' }}><b>Passer for:</b> {f.passer}</p></Panel>
            <Panel title="Fordeler og ulemper">
              <ul className="text-xs flex flex-col gap-1" style={{ color: 'var(--nmbu-neutral-1)' }}>
                {f.pluss.map((p) => <li key={p} className="flex gap-1.5"><Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#047857' }} />{p}</li>)}
                {f.minus.map((p) => <li key={p} className="flex gap-1.5"><X className="w-3.5 h-3.5 shrink-0" style={{ color: '#b91c1c' }} />{p}</li>)}
              </ul>
            </Panel>
            <Panel title="Hva må bygges"><p className="text-xs flex gap-1.5" style={{ color: 'var(--nmbu-neutral-1)', lineHeight: 1.6 }}><Wrench className="w-3.5 h-3.5 shrink-0 mt-0.5" />{f.bygge}</p></Panel>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-5 mt-6" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
        <div style={{ fontFamily: "'Lora', serif", fontSize: 20, color: 'var(--nmbu-green-dark)', marginBottom: 6 }}>Valgt: tre oppsett (bygget)</div>
        <div className="text-sm" style={{ color: 'var(--nmbu-neutral-1)', lineHeight: 1.7, maxWidth: 900 }}>
          <p><b>Oversikt</b> (standard) = dagens oppsett, <b>Fullskjerm-dashboard</b> = forslag 1 med sammenligningsmatrisen (forslag 4) som startside,
            og <b>Toppmeny</b> = forslag 2. Velg oppsett med «Oppsett»-knappen øverst til høyre, ved siden av lys/mørk. Valget huskes i nettleseren,
            og en lenke kan åpne et bestemt oppsett med <code>?oppsett=dashboard</code> eller <code>?oppsett=toppmeny</code>.</p>
          <p className="mt-2" style={{ color: 'var(--nmbu-neutral-2)' }}>
            Alle tre bruker de samme modulene og dataene; bare rammen og navigasjonen byttes. Program-først (3) og rapportmodus (5) er fortsatt bare skisser.
          </p>
        </div>
      </div>
    </div>
  );
}
