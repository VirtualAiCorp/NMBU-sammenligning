import { useMemo, useState, type ReactNode } from 'react';
import {
  LayoutDashboard, BookOpen, Microscope, Home, Landmark, TrendingUp, GraduationCap, Users, Star, Globe2,
  LayoutGrid, Menu, X, Coins, Archive, Lock, Baby, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { MenyHint } from './MenyHint';
import { LagetAv } from './LagetAv';
import { FACULTY_META as FACULTIES, ALL_FACULTY_IDS as FACULTY_IDS, useAllFacultyBases, type FacultyId } from '../data/faculties';
import type { Faculty } from './FacultyLanding';
import { Matrise, lagRader } from './Matrise';
import { InnebygdContext } from '../innebygd';

/**
 * Rammene for oppsettene «dashboard» (fast sidemeny) og «toppmeny» (faner øverst). Innholdet er de samme modulene
 * som i «oversikt»; App.tsx leverer dem som children. Navigasjonen går via onNavigate(fakultet, visning).
 */

export type ShellView = 'landing' | 'analyse' | 'emner' | 'markedsstatus' | 'studiebarometer' | 'gjennomforing' | 'studentene' | 'fagmiljo' | 'bolig' | 'sokergrunnlag' | 'okonomi' | 'inntekt' | 'intern';
type Nav = (f: Faculty | null, view?: ShellView, gruppe?: string) => void;

export const FAKULTETSMODULER: { view: ShellView; label: string; icon: typeof BookOpen; kunFor?: FacultyId }[] = [
  { view: 'landing', label: 'Oversikt', icon: LayoutGrid },
  { view: 'analyse', label: 'Opptak', icon: TrendingUp },
  { view: 'emner', label: 'Emner og karakterer', icon: BookOpen },
  { view: 'gjennomforing', label: 'Gjennomføring', icon: GraduationCap },
  { view: 'studentene', label: 'Studentene', icon: Users },
  { view: 'studiebarometer', label: 'Studiebarometeret', icon: Star },
  { view: 'markedsstatus', label: 'Markedsstatus', icon: Globe2 },
  { view: 'inntekt', label: 'Inntekt', icon: Coins },
  { view: 'intern', label: 'Opptak H26 (intern)', icon: Lock, kunFor: 'hh' },
  { view: 'fagmiljo', label: 'Fagmiljøet', icon: Microscope },
  { view: 'sokergrunnlag', label: 'Søkergrunnlaget', icon: Baby },
  { view: 'bolig', label: 'Bolig', icon: Home },
  { view: 'okonomi', label: 'Økonomi', icon: Landmark },
];
const NMBU_SIDER: { f: Faculty | null; label: string; icon: typeof BookOpen }[] = [
  { f: null, label: 'Oversikt', icon: LayoutDashboard },
  { f: 'nmbu-emner', label: 'Alle emner ved NMBU', icon: BookOpen },
  { f: 'nmbu-fagmiljo', label: 'Fagmiljøet', icon: Microscope },
  { f: 'nmbu-sokergrunnlag', label: 'Søkergrunnlaget', icon: Baby },
  { f: 'nmbu-bolig', label: 'Bolig og studentboliger', icon: Home },
  { f: 'nmbu-okonomi', label: 'Økonomi', icon: Landmark },
];
/** Sammenslått sidemeny: huskes i localStorage; bredden glir mellom 256 og 72 px. */
const SIDEMENY_NOKKEL = 'nmbu-sidemeny';
const MENY_MS = 240;
const MENY_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const erFakultet = (f: Faculty | null): f is FacultyId => !!f && (FACULTY_IDS as string[]).includes(f);
const erNmbu = (f: Faculty | null) => f === null || (typeof f === 'string' && f.startsWith('nmbu-'));

/** Startsiden i dashboard- og toppmenyoppsettet: porteføljematrisen. */
export function ShellHome({ onNavigate }: { onNavigate: Nav }) {
  // Matrisen trenger grunndataene (opptak og gjennomføring) for alle fakultetene; de lastes i bakgrunnen.
  const alle = useAllFacultyBases(FACULTY_IDS);
  const rader = useMemo(() => (alle ? lagRader(alle) : null), [alle]);
  return (
    <div>
      <ShellHeader title="NMBU-sammenligning" subtitle="Alle NMBU-programgrupper mot konkurrentene. Klikk på en rad for detaljer, og åpne analysen derfra." />
      {rader
        ? <Matrise rader={rader} embedded onOpen={(fak, g) => onNavigate(fak, 'analyse', g)} />
        : <div className="rounded-xl p-6 text-sm" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>Laster tallene for fakultetene …</div>}
      <div className="grid gap-3 mt-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {FACULTY_IDS.map((id) => (
          <div key={id} className="rounded-xl flex flex-col" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
            <button onClick={() => onNavigate(id, 'landing')} className="p-4 text-left flex-1 flex flex-col justify-start">
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--nmbu-green-dark)', letterSpacing: '0.05em' }}>{FACULTIES[id].shortLabel}</div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 15, color: 'var(--nmbu-green-dark)' }}>{FACULTIES[id].label}</div>
            </button>
            {id === 'hh' && <div className="px-4 pb-3 pt-2" style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}><LagetAv kompakt /></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShellHeader({ title, subtitle, eyebrow }: { title: string; subtitle?: string; eyebrow?: string }) {
  return (
    <header className="mb-5">
      {eyebrow && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--nmbu-neutral-2)', marginBottom: 2 }}>{eyebrow}</div>}
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 rounded-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)' }} />
        <h1 style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif", fontWeight: 500, fontSize: 28, lineHeight: 1.2 }}>{title}</h1>
      </div>
      {subtitle && <p className="text-sm pl-4 mt-1" style={{ color: 'var(--nmbu-neutral-1)' }}>{subtitle}</p>}
    </header>
  );
}

// ── Fullskjerm-dashboard ────────────────────────────────────────────────────
export function DashboardShell({ faculty, view, onNavigate, children }: { faculty: Faculty | null; view: ShellView; onNavigate: Nav; children: ReactNode }) {
  const [mobilMeny, setMobilMeny] = useState(false);
  const [smal, setSmalState] = useState(() => { try { return localStorage.getItem(SIDEMENY_NOKKEL) === 'smal'; } catch { return false; } });
  const setSmal = (v: boolean) => { setSmalState(v); try { localStorage.setItem(SIDEMENY_NOKKEL, v ? 'smal' : 'bred'); } catch { /* ikke lagret */ } };
  const gaa: Nav = (f, v, g) => { setMobilMeny(false); onNavigate(f, v, g); };
  const itemStyle = (aktiv: boolean) => ({ backgroundColor: aktiv ? 'rgba(255,255,255,0.16)' : 'transparent', opacity: aktiv ? 1 : 0.82, fontWeight: aktiv ? 700 : 400 });
  /** Menyen; «s» = sammenslått (bare forkortelser og ikoner, fullt navn i verktøytips). Mobilskuffen er alltid bred. */
  const meny = (s: boolean) => {
    const seksjon = (t: string) => s
      ? <div className="mx-2 my-2" style={{ borderTop: '1px solid rgba(255,255,255,0.18)' }} aria-hidden />
      : <div className="px-2 pt-3 pb-1" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6 }}>{t}</div>;
    return (
      <nav key={s ? 'smal' : 'bred'} className="flex flex-col gap-0.5 text-sm meny-inn" aria-label="Hovedmeny">
        {!s && <button onClick={() => gaa(null)} className="text-left px-2 pb-2" style={{ fontFamily: "'Lora', serif", fontSize: 17, whiteSpace: 'nowrap' }}>NMBU-sammenligning</button>}
        {seksjon('Fakultetene')}
        {FACULTY_IDS.map((id) => {
          const aapen = faculty === id;
          const aapenMeny = aapen || (id === 'hh' && faculty === 'hh-figma');
          const moduler = FAKULTETSMODULER.filter((m) => m.view !== 'landing' && (!m.kunFor || m.kunFor === id));
          return (
            <div key={id}>
              <MenyHint navn={FACULTIES[id].label} undertekst={aapen ? undefined : 'Åpne fakultetet'} aktiv={s}>
                <button onClick={() => gaa(id, erFakultet(faculty) ? view : 'landing')}
                  className={`w-full flex items-center rounded-md text-left ${s ? 'justify-center px-1 py-2' : 'justify-between px-2 py-1.5'}`}
                  style={{ ...itemStyle(aapen && view === 'landing'), ...(s && aapen ? { backgroundColor: 'rgba(255,255,255,0.12)', opacity: 1 } : {}) }}
                  title={s ? undefined : FACULTIES[id].label}>
                  <span style={s ? { fontSize: FACULTIES[id].shortLabel.length > 4 ? 10 : 12, fontWeight: 700, letterSpacing: '0.03em' } : undefined}>{FACULTIES[id].shortLabel}</span>
                  {!s && <span style={{ opacity: 0.5, fontSize: 10, display: 'inline-block', transform: aapenMeny ? 'rotate(90deg)' : 'none', transition: `transform ${MENY_MS}ms ${MENY_EASE}` }}>▸</span>}
                </button>
              </MenyHint>
              {/* Modulene til alle fakultetene ligger klare; det åpne glir ut (grid-rader 0fr → 1fr) mens det forrige lukkes */}
              <div className="grid" aria-hidden={!aapenMeny}
                style={{ gridTemplateRows: aapenMeny ? '1fr' : '0fr', opacity: aapenMeny ? 1 : 0, transition: `grid-template-rows ${MENY_MS}ms ${MENY_EASE}, opacity ${MENY_MS}ms ease` }}>
                <div className="overflow-hidden flex flex-col gap-0.5">
                  {moduler.map((m) => (
                    <MenyHint key={m.view} navn={m.label} undertekst={FACULTIES[id].shortLabel} aktiv={s && aapenMeny}>
                      <button onClick={() => gaa(id, m.view)} tabIndex={aapenMeny ? 0 : -1}
                        className={`w-full flex items-center rounded-md text-left ${s ? 'justify-center py-1.5' : 'gap-2 pl-5 pr-2 py-1 text-xs'}`} style={itemStyle(aapen && view === m.view)}>
                        <m.icon className={`${s ? 'w-4 h-4' : 'w-3.5 h-3.5'} shrink-0`} />{!s && ` ${m.label}`}
                      </button>
                    </MenyHint>
                  ))}
                  {id === 'hh' && (
                    <MenyHint navn="Opprinnelig HH-analyse" aktiv={s && aapenMeny}>
                      <button onClick={() => gaa('hh-figma')} tabIndex={aapenMeny ? 0 : -1} className={`w-full flex items-center rounded-md text-left ${s ? 'justify-center py-1.5' : 'gap-2 pl-5 pr-2 py-1 text-xs'}`} style={itemStyle(faculty === 'hh-figma')}>
                        <Archive className={`${s ? 'w-4 h-4' : 'w-3.5 h-3.5'} shrink-0`} />{!s && ' Opprinnelig HH-analyse'}
                      </button>
                    </MenyHint>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {seksjon('Hele NMBU')}
        {NMBU_SIDER.map((x) => (
          <MenyHint key={x.label} navn={x.label} aktiv={s}>
            <button onClick={() => gaa(x.f)} className={`flex items-center rounded-md text-left ${s ? 'justify-center py-2' : 'gap-2 px-2 py-1.5'}`} style={itemStyle(faculty === x.f)}>
              <x.icon className="w-4 h-4 shrink-0" />{!s && ` ${x.label}`}
            </button>
          </MenyHint>
        ))}
      </nav>
    );
  };
  const Veksle = smal ? PanelLeftOpen : PanelLeftClose;
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
      <aside className="hidden lg:flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto overflow-x-hidden"
        style={{ width: smal ? 72 : 256, padding: smal ? '16px 10px' : 16, backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', transition: `width ${MENY_MS}ms ${MENY_EASE}, padding ${MENY_MS}ms ${MENY_EASE}` }}>
        <MenyHint navn={smal ? 'Vis hele menyen' : 'Skjul menyen'} aktiv={smal}>
          <button onClick={() => setSmal(!smal)} aria-pressed={smal} title={smal ? undefined : 'Slå sammen menyen'}
            className={`mb-2 p-1.5 rounded-md flex items-center gap-2 text-xs ${smal ? 'self-center' : 'self-end'}`} style={{ opacity: 0.75 }}>
            <Veksle className="w-4 h-4" />
          </button>
        </MenyHint>
        {meny(smal)}
      </aside>
      {mobilMeny && (
        <div className="lg:hidden fixed inset-0 z-40 flex" onClick={() => setMobilMeny(false)} style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <aside className="h-full overflow-y-auto px-2.5 py-3 text-sm" onClick={(e) => e.stopPropagation()} style={{ width: 'min(232px, 72vw)', backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
            <button onClick={() => setMobilMeny(false)} className="mb-2 flex items-center gap-1 text-xs" style={{ opacity: 0.8 }}><X className="w-4 h-4" /> Lukk</button>
            {meny(false)}
          </aside>
        </div>
      )}
      <main className="flex-1 min-w-0 px-4 sm:px-6 pb-10">
        <div className="flex items-center gap-2 h-16 pr-44 lg:pr-40" style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', marginBottom: 20 }}>
          <button className="lg:hidden p-2 rounded-lg" onClick={() => setMobilMeny(true)} aria-label="Åpne meny" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}><Menu className="w-4 h-4" /></button>
          <Brodsmuler faculty={faculty} view={view} onNavigate={onNavigate} />
        </div>
        <InnebygdContext.Provider value={true}>{children}</InnebygdContext.Provider>
      </main>
    </div>
  );
}

function Brodsmuler({ faculty, view, onNavigate }: { faculty: Faculty | null; view: ShellView; onNavigate: Nav }) {
  const deler: { l: string; go?: () => void }[] = [{ l: 'NMBU', go: () => onNavigate(null) }];
  if (faculty === 'hh-figma') { deler.push({ l: 'HH', go: () => onNavigate('hh', 'landing') }); deler.push({ l: 'Opprinnelig HH-analyse' }); }
  else if (erFakultet(faculty)) {
    deler.push({ l: FACULTIES[faculty].shortLabel, go: () => onNavigate(faculty, 'landing') });
    if (view !== 'landing') deler.push({ l: FAKULTETSMODULER.find((m) => m.view === view)?.label ?? view });
  } else if (faculty) deler.push({ l: NMBU_SIDER.find((s) => s.f === faculty)?.label ?? 'Alternative oppsett' });
  return (
    <div className="flex items-center gap-1.5 text-xs min-w-0 truncate" style={{ color: 'var(--nmbu-neutral-2)' }}>
      {deler.map((d, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span>/</span>}
          {d.go && i < deler.length - 1 ? <button onClick={d.go} className="hover:underline">{d.l}</button> : <span style={{ color: 'var(--nmbu-neutral)', fontWeight: 600 }}>{d.l}</span>}
        </span>
      ))}
    </div>
  );
}

// ── Toppmeny ────────────────────────────────────────────────────────────────
export function TopbarShell({ faculty, view, onNavigate, children }: { faculty: Faculty | null; view: ShellView; onNavigate: Nav; children: ReactNode }) {
  const enheter: { f: Faculty | null; label: string }[] = [
    { f: null, label: 'Hele NMBU' },
    ...FACULTY_IDS.map((id) => ({ f: id as Faculty, label: FACULTIES[id].shortLabel })),
  ];
  const aktivEnhet = erNmbu(faculty) ? null : faculty === 'hh-figma' ? 'hh' : faculty;
  const fane = (aktiv: boolean) => ({
    borderBottom: `2px solid ${aktiv ? 'var(--nmbu-green-dark)' : 'transparent'}`,
    color: aktiv ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-1)', fontWeight: aktiv ? 700 : 500,
  });
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
      <header className="sticky top-0 z-30" style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
        <div className="flex items-center gap-4 px-4 sm:px-6 h-14 pr-44">
          <button onClick={() => onNavigate(null)} className="shrink-0" style={{ fontFamily: "'Lora', serif", fontSize: 19, color: 'var(--nmbu-green-dark)' }}>NMBU-sammenligning</button>
          <nav className="flex gap-1 overflow-x-auto" aria-label="Enhet">
            {enheter.map((e) => {
              const aktiv = e.f === aktivEnhet;
              return (
                <button key={e.label} title={erFakultet(e.f) ? FACULTIES[e.f].label : undefined}
                  onClick={() => onNavigate(e.f, erFakultet(e.f) ? (erFakultet(faculty) ? view : 'landing') : undefined)}
                  className="px-3 py-1.5 rounded-full text-xs shrink-0"
                  style={{ backgroundColor: aktiv ? 'var(--nmbu-green-dark)' : 'transparent', color: aktiv ? '#fff' : 'var(--nmbu-neutral-1)', fontWeight: aktiv ? 700 : 500 }}>
                  {e.label}
                </button>
              );
            })}
          </nav>
        </div>
        {(erNmbu(faculty) || erFakultet(faculty) || faculty === 'hh-figma') && (
          <nav className="flex gap-1 px-4 sm:px-6 overflow-x-auto" aria-label="Moduler" style={{ borderTop: '1px solid var(--nmbu-neutral-3)' }}>
            {erFakultet(faculty) || faculty === 'hh-figma'
              ? [...FAKULTETSMODULER.filter((m) => !m.kunFor || m.kunFor === (faculty === 'hh-figma' ? 'hh' : faculty)).map((m) => (
                  <button key={m.view} onClick={() => onNavigate(faculty === 'hh-figma' ? 'hh' : faculty, m.view)} className="flex items-center gap-1.5 px-3 py-2.5 text-xs shrink-0" style={fane(faculty !== 'hh-figma' && view === m.view)}>
                    <m.icon className="w-3.5 h-3.5" /> {m.label}
                  </button>
                )), ...((faculty === 'hh' || faculty === 'hh-figma') ? [
                  <button key="hh-figma" onClick={() => onNavigate('hh-figma')} className="flex items-center gap-1.5 px-3 py-2.5 text-xs shrink-0" style={fane(faculty === 'hh-figma')}>
                    <Archive className="w-3.5 h-3.5" /> Opprinnelig HH-analyse
                  </button>,
                ] : [])]
              : NMBU_SIDER.map((s) => (
                  <button key={s.label} onClick={() => onNavigate(s.f)} className="flex items-center gap-1.5 px-3 py-2.5 text-xs shrink-0" style={fane(faculty === s.f)}>
                    <s.icon className="w-3.5 h-3.5" /> {s.label}
                  </button>
                ))}
          </nav>
        )}
      </header>
      <main className="px-4 sm:px-6 py-6"><InnebygdContext.Provider value={true}>{children}</InnebygdContext.Provider></main>
    </div>
  );
}
