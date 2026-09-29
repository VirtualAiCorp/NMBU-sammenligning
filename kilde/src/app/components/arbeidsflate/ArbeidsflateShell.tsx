/**
 * Rammen for den valgfrie arbeidsflaten (oppsett «arbeidsflate», inspirert av Newbuilds): lys sidemeny på 260 px som
 * kan slås sammen til en ikonstripe, prosjektvelger for fakultet/NMBU, modulene gruppert under små overskrifter og en
 * luftig hovedflate. På mobil blir sidemenyen en skuff. Innholdet (children) er de samme sidene som i de andre
 * oppsettene; App.tsx leverer dem. Styling: styles/arbeidsflate.css.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft, Check, ChevronsUpDown, Globe2, Menu, MessageCircle, PanelLeftClose, PanelLeftOpen, Search, X, type LucideIcon,
} from 'lucide-react';
import { MenyHint } from '../MenyHint';
import { InnebygdContext } from '../../innebygd';
import { FACULTY_META, type FacultyId } from '../../data/facultyMeta';
import type { ShellView } from '../AppShells';
import type { Faculty } from '../FacultyLanding';
import { Sok } from './Sok';
import {
  FAKULTETER, FAKULTET_IKON, MODULGRUPPER, NMBU_OVERSIKT, NMBU_SIDER, OPPRINNELIG_HH, UTEN_HH, apneKiChat, kortNavn, modulerFor, type AfNav,
} from './navigasjon';

const SIDEMENY_NOKKEL = 'af-sidemeny';
const GLOD_NOKKEL = 'af-chat-glod-vist';
const erFakultet = (f: Faculty | null): f is FacultyId => !!f && (FAKULTETER as string[]).includes(f);

export function ArbeidsflateShell({ faculty, view, onNavigate, sideNokkel, children }: {
  faculty: Faculty | null; view: ShellView; onNavigate: AfNav; sideNokkel: string; children: ReactNode;
}) {
  const [smal, setSmalState] = useState(() => { try { return localStorage.getItem(SIDEMENY_NOKKEL) === 'smal'; } catch { return false; } });
  const setSmal = (v: boolean) => { setSmalState(v); try { localStorage.setItem(SIDEMENY_NOKKEL, v ? 'smal' : 'bred'); } catch { /* ikke lagret */ } };
  const [mobil, setMobil] = useState(false);
  const [sok, setSok] = useState(false);
  const gaa: AfNav = (f, v, g) => { setMobil(false); onNavigate(f, v, g); };

  // ⌘K / Ctrl+K åpner søket; Escape lukker mobilskuffen
  useEffect(() => {
    const tast = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSok((s) => !s); }
      else if (e.key === 'Escape') setMobil(false);
    };
    window.addEventListener('keydown', tast);
    return () => window.removeEventListener('keydown', tast);
  }, []);
  // Chat-pillen gløder rolig første gang arbeidsflaten vises (CSS: .af-chat-glod)
  useEffect(() => {
    try { if (localStorage.getItem(GLOD_NOKKEL)) return; localStorage.setItem(GLOD_NOKKEL, '1'); } catch { return; }
    const rot = document.documentElement;
    rot.classList.add('af-chat-glod');
    const t = window.setTimeout(() => rot.classList.remove('af-chat-glod'), 4800);
    return () => { window.clearTimeout(t); rot.classList.remove('af-chat-glod'); };
  }, []);
  // Skuffen på mobil: ikke rull siden bak
  useEffect(() => {
    if (!mobil) return;
    const f = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = f; };
  }, [mobil]);

  const meny = (s: boolean, iSkuff: boolean) => (
    <Sidemeny s={s} iSkuff={iSkuff} faculty={faculty} view={view} gaa={gaa}
      onSok={() => { setMobil(false); setSok(true); }} onChat={() => { setMobil(false); apneKiChat(); }}
      onVeksle={iSkuff ? () => setMobil(false) : () => setSmal(!s)} />
  );

  return (
    <div className={`af-ramme ${smal ? 'af-smal' : ''}`}>
      <aside className="af-sidemeny" aria-label="Sidemeny">{meny(smal, false)}</aside>
      <div className={`af-skuff-bakgrunn ${mobil ? 'af-apen' : ''}`} onClick={() => setMobil(false)} aria-hidden={!mobil}>
        <aside className="af-skuff" onClick={(e) => e.stopPropagation()} aria-label="Sidemeny" {...(!mobil ? { inert: '' } : {})}>
          {meny(false, true)}
        </aside>
      </div>
      <div className="af-hoved">
        <div className="af-mobiltopp">
          <button type="button" className="af-ikonknapp af-ikonknapp-ring" onClick={() => setMobil(true)} aria-label="Åpne menyen"><Menu className="w-4 h-4" /></button>
          <button type="button" className="af-ordmerke" onClick={() => gaa(null)}>NMBU-sammenligning</button>
        </div>
        <main className="af-main" key={sideNokkel}>
          <InnebygdContext.Provider value={true}>{children}</InnebygdContext.Provider>
        </main>
      </div>
      <Sok apen={sok} lukk={() => setSok(false)} naviger={gaa} />
    </div>
  );
}

function IkonKnapp({ ikon: Ikon, tittel, onClick, hint }: { ikon: LucideIcon; tittel: string; onClick: () => void; hint: boolean }) {
  return (
    <MenyHint navn={tittel} aktiv={hint}>
      <button type="button" className="af-ikonknapp" onClick={onClick} title={hint ? undefined : tittel} aria-label={tittel}><Ikon className="w-4 h-4" /></button>
    </MenyHint>
  );
}

function Sidemeny({ s, iSkuff, faculty, view, gaa, onSok, onChat, onVeksle }: {
  s: boolean; iSkuff: boolean; faculty: Faculty | null; view: ShellView; gaa: AfNav; onSok: () => void; onChat: () => void; onVeksle: () => void;
}) {
  const aktivFak: FacultyId | null = faculty === 'hh-figma' ? 'hh' : erFakultet(faculty) ? faculty : null;
  const paaForsiden = faculty === null;
  const overskrift = (t: string) => s ? <div className="af-meny-skille" aria-hidden /> : <div className="af-meny-overskrift">{t}</div>;
  const punkt = (key: string, ikon: LucideIcon, label: string, aktiv: boolean, onClick: () => void, undertekst?: string) => {
    const Ikon = ikon;
    return (
      <MenyHint key={key} navn={label} undertekst={undertekst} aktiv={s}>
        <button type="button" className="af-menypunkt" onClick={onClick} aria-current={aktiv ? 'page' : undefined} title={s ? undefined : label}>
          <Ikon className="af-menyikon" aria-hidden /><span className="af-menytekst">{label}</span>
        </button>
      </MenyHint>
    );
  };

  return (
    <div className="af-meny">
      <div className="af-meny-topp">
        <button type="button" className="af-ordmerke" onClick={() => gaa(null)} tabIndex={s ? -1 : 0}>NMBU-sammenligning</button>
        <div className="af-topp-ikoner">
          <IkonKnapp ikon={Search} tittel="Søk (⌘K)" onClick={onSok} hint={s} />
          <IkonKnapp ikon={MessageCircle} tittel="Spør KI" onClick={onChat} hint={s} />
          <IkonKnapp ikon={iSkuff ? X : s ? PanelLeftOpen : PanelLeftClose} tittel={iSkuff ? 'Lukk menyen' : s ? 'Vis hele menyen' : 'Slå sammen menyen'} onClick={onVeksle} hint={s} />
        </div>
      </div>

      <div className="af-velger-rad">
        {!paaForsiden && !s && (
          <button type="button" className="af-ikonknapp" onClick={() => gaa(null)} aria-label="Tilbake til forsiden" title="Tilbake til forsiden"><ArrowLeft className="w-4 h-4" /></button>
        )}
        <Prosjektvelger s={s} aktivFak={aktivFak} faculty={faculty} view={view} gaa={gaa} />
      </div>

      <nav className="af-nav" aria-label="Hovedmeny">
        {aktivFak ? (
          MODULGRUPPER.map((g) => {
            const moduler = modulerFor(aktivFak, g.views);
            const ekstra = g.tittel === 'Intern' && aktivFak === 'hh' && !UTEN_HH;
            if (!moduler.length && !ekstra) return null;
            return (
              <div key={g.tittel} className="af-meny-gruppe">
                {overskrift(g.tittel)}
                {moduler.map((m) => punkt(m.view, m.icon, m.label, faculty === aktivFak && view === m.view, () => gaa(aktivFak, m.view), FACULTY_META[aktivFak].shortLabel))}
                {ekstra && punkt('hh-figma', OPPRINNELIG_HH.icon, OPPRINNELIG_HH.label, faculty === 'hh-figma', () => gaa('hh-figma'), 'HH')}
              </div>
            );
          })
        ) : (
          <>
            <div className="af-meny-gruppe">
              {overskrift('Oversikt')}
              {punkt('forside', NMBU_OVERSIKT.icon, NMBU_OVERSIKT.label, paaForsiden, () => gaa(null))}
            </div>
            <div className="af-meny-gruppe">
              {overskrift('Fakultetene')}
              {FAKULTETER.map((id) => punkt(id, FAKULTET_IKON[id], kortNavn(id), false, () => gaa(id, 'landing'), FACULTY_META[id].shortLabel))}
            </div>
            <div className="af-meny-gruppe">
              {overskrift('Hele NMBU')}
              {NMBU_SIDER.map((x) => punkt(x.f, x.icon, x.label, faculty === x.f, () => gaa(x.f)))}
            </div>
          </>
        )}
      </nav>

      <div className="af-meny-bunn">
        <div className="af-kreditering">Laget av studierådgiverne ved Handelshøyskolen</div>
      </div>
    </div>
  );
}

/** «Prosjektvelgeren» (Newbuilds «Seafront Residences»): bytt mellom hele NMBU og fakultetene. */
function Prosjektvelger({ s, aktivFak, faculty, view, gaa }: { s: boolean; aktivFak: FacultyId | null; faculty: Faculty | null; view: ShellView; gaa: AfNav }) {
  const [apen, setApen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number; b: number } | null>(null);
  const knapp = useRef<HTMLButtonElement>(null);
  const meny = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!apen) return;
    const r = knapp.current?.getBoundingClientRect();
    if (r) setPos({ x: r.left, y: r.bottom + 6, b: Math.max(r.width, 248) });
    const klikk = (e: MouseEvent) => { if (!meny.current?.contains(e.target as Node) && !knapp.current?.contains(e.target as Node)) setApen(false); };
    const tast = (e: KeyboardEvent) => { if (e.key === 'Escape') { setApen(false); knapp.current?.focus(); } };
    const lukk = () => setApen(false);
    document.addEventListener('mousedown', klikk); document.addEventListener('keydown', tast); window.addEventListener('resize', lukk);
    return () => { document.removeEventListener('mousedown', klikk); document.removeEventListener('keydown', tast); window.removeEventListener('resize', lukk); };
  }, [apen]);
  useEffect(() => { if (apen) meny.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus(); }, [apen, pos]);

  const Ikon = aktivFak ? FAKULTET_IKON[aktivFak] : Globe2;
  const navn = aktivFak ? kortNavn(aktivFak) : 'Hele NMBU';
  const velg = (f: FacultyId | null) => {
    setApen(false);
    if (f === null) gaa(null);
    else gaa(f, faculty && erFakultet(faculty) && view !== 'intern' ? view : 'landing');
  };
  return (
    <>
      <MenyHint navn={navn} undertekst="Bytt fakultet" aktiv={s && !apen}>
        <button ref={knapp} type="button" className="af-velger" onClick={() => setApen((a) => !a)} aria-haspopup="menu" aria-expanded={apen} aria-label={`Valgt: ${navn}. Bytt fakultet`}>
          <span className="af-velger-flis" aria-hidden><Ikon className="w-3.5 h-3.5" /></span>
          <span className="af-velger-navn">{navn}</span>
          <ChevronsUpDown className="w-4 h-4 af-velger-chevron" aria-hidden />
        </button>
      </MenyHint>
      {apen && pos && createPortal(
        <div ref={meny} role="menu" className="af-popover af-velger-meny" style={{ left: pos.x, top: pos.y, width: pos.b }}>
          <div className="af-meny-overskrift">Velg</div>
          {[null, ...FAKULTETER].map((f) => {
            const I = f ? FAKULTET_IKON[f] : Globe2;
            const valgt = f === aktivFak && (f !== null || !aktivFak);
            return (
              <button key={f ?? 'nmbu'} type="button" role="menuitemradio" aria-checked={valgt} className="af-velger-valg" onClick={() => velg(f)}>
                <span className="af-velger-flis" aria-hidden><I className="w-3.5 h-3.5" /></span>
                <span className="flex-1 min-w-0 truncate">{f ? FACULTY_META[f].label : 'Hele NMBU'}</span>
                {valgt && <Check className="w-4 h-4 shrink-0" aria-hidden />}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
