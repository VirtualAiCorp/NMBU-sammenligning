/**
 * Søk i arbeidsflaten (⌘K / Ctrl+K): finn et fakultet, en modul eller en side for hele NMBU og gå dit.
 * Søker bare i navigasjonen (navn og korte beskrivelser), ikke i dataene; dataene er KI-chattens jobb.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CornerDownLeft, Search, LayoutDashboard, type LucideIcon } from 'lucide-react';
import { FACULTY_META } from '../../data/facultyMeta';
import type { ShellView } from '../AppShells';
import type { Faculty } from '../FacultyLanding';
import { FAKULTETER, FAKULTET_IKON, MODULGRUPPER, MODUL_TEKST, NMBU_SIDER, OPPRINNELIG_HH, UTEN_HH, modulerFor, type AfNav } from './navigasjon';

type Treff = { id: string; gruppe: string; tittel: string; tekst: string; ikon: LucideIcon; sok: string; gaa: () => void };
const norm = (s: string) => s.toLocaleLowerCase('nb-NO').normalize('NFD').replace(/[̀-ͯ]/g, '');

export function Sok({ apen, lukk, naviger }: { apen: boolean; lukk: () => void; naviger: AfNav }) {
  const [q, setQ] = useState('');
  const [valgt, setValgt] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const liste = useRef<HTMLDivElement>(null);

  const alle = useMemo<Treff[]>(() => {
    const t: Treff[] = [{ id: 'forside', gruppe: 'Hele NMBU', tittel: 'Forside', tekst: 'Alle fakultetene og nøkkeltall', ikon: LayoutDashboard, sok: 'forside hjem nmbu', gaa: () => naviger(null) }];
    for (const s of NMBU_SIDER) t.push({ id: s.f, gruppe: 'Hele NMBU', tittel: s.label, tekst: s.tekst, ikon: s.icon, sok: `hele nmbu ${s.label} ${s.tekst}`, gaa: () => naviger(s.f) });
    for (const id of FAKULTETER) {
      const m = FACULTY_META[id];
      t.push({ id, gruppe: 'Fakulteter', tittel: m.label, tekst: m.subtitle, ikon: FAKULTET_IKON[id], sok: `${m.shortLabel} ${m.label} ${m.subtitle}`, gaa: () => naviger(id, 'landing') });
      for (const g of MODULGRUPPER) for (const mo of modulerFor(id, g.views)) {
        if (mo.view === 'landing') continue;
        t.push({ id: `${id}-${mo.view}`, gruppe: 'Moduler', tittel: `${m.shortLabel} · ${mo.label}`, tekst: MODUL_TEKST[mo.view as Exclude<ShellView, 'landing'>], ikon: mo.icon,
          sok: `${m.shortLabel} ${m.label} ${mo.label} ${MODUL_TEKST[mo.view as Exclude<ShellView, 'landing'>]}`, gaa: () => naviger(id, mo.view) });
      }
      if (id === 'hh' && !UTEN_HH) t.push({ id: 'hh-figma', gruppe: 'Moduler', tittel: `HH · ${OPPRINNELIG_HH.label}`, tekst: OPPRINNELIG_HH.tekst, ikon: OPPRINNELIG_HH.icon, sok: `hh handelshøyskolen ${OPPRINNELIG_HH.label}`, gaa: () => naviger('hh-figma' as Faculty) });
    }
    return t;
  }, [naviger]);

  const treff = useMemo(() => {
    const ord = norm(q).split(/\s+/).filter(Boolean);
    if (!ord.length) return alle.filter((t) => t.gruppe !== 'Moduler');
    return alle.filter((t) => { const s = norm(`${t.tittel} ${t.sok}`); return ord.every((o) => s.includes(o)); }).slice(0, 40);
  }, [q, alle]);

  useEffect(() => { setValgt(0); }, [q]);
  useEffect(() => {
    if (!apen) return;
    setQ('');
    const t = window.setTimeout(() => input.current?.focus(), 10);
    return () => window.clearTimeout(t);
  }, [apen]);
  useEffect(() => { liste.current?.querySelector<HTMLElement>(`[data-indeks="${valgt}"]`)?.scrollIntoView({ block: 'nearest' }); }, [valgt]);

  if (!apen) return null;
  const velg = (t: Treff | undefined) => { if (!t) return; lukk(); t.gaa(); };
  let forrigeGruppe = '';
  return createPortal(
    <div className="af-sok-bakgrunn" onMouseDown={lukk}>
      <div className="af-sok" role="dialog" aria-modal="true" aria-label="Søk i sidene" onMouseDown={(e) => e.stopPropagation()}>
        <div className="af-sok-felt">
          <Search className="w-4 h-4 shrink-0" aria-hidden />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søk etter fakultet, modul eller side …" aria-label="Søk"
            role="combobox" aria-expanded="true" aria-controls="af-sok-liste" aria-activedescendant={treff[valgt] ? `af-sok-${treff[valgt].id}` : undefined}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setValgt((v) => Math.min(treff.length - 1, v + 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setValgt((v) => Math.max(0, v - 1)); }
              else if (e.key === 'Enter') { e.preventDefault(); velg(treff[valgt]); }
              else if (e.key === 'Escape') { e.preventDefault(); lukk(); }
            }} />
          <kbd className="af-kbd">Esc</kbd>
        </div>
        <div className="af-sok-liste" id="af-sok-liste" role="listbox" ref={liste}>
          {treff.length === 0 && <div className="af-sok-tom">Ingen sider passer. Prøv et fakultet (for eksempel «REALTEK») eller en modul («emner»).</div>}
          {treff.map((t, i) => {
            const ny = t.gruppe !== forrigeGruppe; forrigeGruppe = t.gruppe;
            return (
              <div key={t.id}>
                {ny && <div className="af-sok-gruppe">{t.gruppe}</div>}
                <button type="button" id={`af-sok-${t.id}`} role="option" aria-selected={i === valgt} data-indeks={i}
                  className={`af-sok-treff ${i === valgt ? 'af-sok-valgt' : ''}`} onMouseMove={() => setValgt(i)} onClick={() => velg(t)}>
                  <t.ikon className="w-4 h-4 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="af-sok-tittel">{t.tittel}</span>
                    <span className="af-sok-tekst">{t.tekst}</span>
                  </span>
                  {i === valgt && <CornerDownLeft className="w-3.5 h-3.5 shrink-0 af-dempet" aria-hidden />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
