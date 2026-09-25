import { useEffect, useRef, useState } from 'react';
import { LayoutGrid, PanelLeft, PanelTop, Check } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { setLayout, useLayout, type Layout } from '../layoutStore';

/** Oppsettvelger og lys/mørk-bryter, fast øverst til høyre på alle sider. */
const VALG: { id: Layout; label: string; desc: string; icon: typeof LayoutGrid }[] = [
  { id: 'oversikt', label: 'Oversikt', desc: 'Dagens oppsett: kort og egne sider per modul', icon: LayoutGrid },
  { id: 'dashboard', label: 'Fullskjerm-dashboard', desc: 'Fast sidemeny med fakulteter og moduler, full bredde', icon: PanelLeft },
  { id: 'toppmeny', label: 'Toppmeny', desc: 'Fakulteter og moduler som faner øverst, full bredde', icon: PanelTop },
];

const knapp: React.CSSProperties = {
  backgroundColor: 'var(--card)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)', boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
};

function LayoutSwitcher() {
  const layout = useLayout();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const klikk = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', klikk); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', klikk); document.removeEventListener('keydown', esc); };
  }, [open]);
  const Aktiv = VALG.find((v) => v.id === layout)!.icon;
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} title="Velg oppsett" aria-label="Velg oppsett" aria-haspopup="menu" aria-expanded={open}
        className="h-9 rounded-full flex items-center gap-1.5 px-3 text-xs font-medium" style={knapp}>
        <Aktiv className="w-4 h-4" /> <span className="hidden sm:inline">Oppsett</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-72 rounded-xl p-1.5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 10px 30px rgba(0,0,0,0.18)' }}>
          <div className="px-2.5 pt-1.5 pb-1" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--nmbu-neutral-2)' }}>Oppsett for nettsiden</div>
          {VALG.map((v) => (
            <button key={v.id} role="menuitemradio" aria-checked={layout === v.id} onClick={() => { setLayout(v.id); setOpen(false); }}
              className="w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left"
              style={{ backgroundColor: layout === v.id ? 'var(--nmbu-green-4)' : 'transparent' }}>
              <v.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--nmbu-green-dark)' }} />
              <span className="flex-1">
                <span className="block text-sm" style={{ fontWeight: 600, color: 'var(--nmbu-neutral)' }}>{v.label}</span>
                <span className="block" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{v.desc}</span>
              </span>
              {layout === v.id && <Check className="w-4 h-4 mt-0.5" style={{ color: 'var(--nmbu-green-dark)' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TopRightControls() {
  // På mobil ruller knappene bort med siden i stedet for å ligge over innholdet. Unntak: toppmenyen, der den faste topplinjen har plass til dem.
  const fast = useLayout() === 'toppmeny';
  return (
    <div className={`${fast ? 'fixed' : 'absolute sm:fixed'} top-3 z-50 flex items-center gap-2`} style={{ right: 'calc(var(--ki-side, 0px) + 12px)' }}>
      <LayoutSwitcher />
      <ThemeToggle />
    </div>
  );
}
