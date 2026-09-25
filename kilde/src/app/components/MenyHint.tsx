import { cloneElement, useEffect, useRef, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';

/**
 * Verktøytips for sammenslått sidemeny: fullt navn (og eventuelt undertekst) til høyre for ikonet.
 * Ligger i en portal med position: fixed, så menyen som ruller ikke klipper det. Vises etter 120 ms ved
 * pekeren og med en gang ved tastaturfokus; lukkes ved Escape, rulling, klikk og når pekeren går ut.
 * Mønster fra verktøyet for emneansvarlige i Virtual AI Corp (MenyHint.tsx).
 */
const FORSINKELSE_MS = 120;

export function MenyHint({ navn, undertekst, aktiv, children }: { navn: string; undertekst?: string; aktiv: boolean; children: ReactElement<Record<string, unknown>> }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLElement | null>(null);
  const tid = useRef<number>(0);

  const vis = (straks: boolean) => {
    window.clearTimeout(tid.current);
    const plasser = () => { const r = ref.current?.getBoundingClientRect(); if (r) setPos({ x: r.right + 10, y: r.top + r.height / 2 }); };
    if (straks) plasser(); else tid.current = window.setTimeout(plasser, FORSINKELSE_MS);
  };
  const skjul = () => { window.clearTimeout(tid.current); setPos(null); };

  useEffect(() => {
    if (!pos) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') skjul(); };
    window.addEventListener('keydown', esc);
    window.addEventListener('scroll', skjul, true);
    return () => { window.removeEventListener('keydown', esc); window.removeEventListener('scroll', skjul, true); };
  }, [pos]);
  useEffect(() => { if (!aktiv) skjul(); }, [aktiv]);
  useEffect(() => () => window.clearTimeout(tid.current), []);

  if (!aktiv) return children;
  const barn = cloneElement(children, {
    ref: (el: HTMLElement | null) => { ref.current = el; },
    'aria-label': navn,
    onMouseEnter: () => vis(false),
    onMouseLeave: skjul,
    onFocus: (e: React.FocusEvent<HTMLElement>) => { if (e.currentTarget.matches(':focus-visible')) vis(true); },
    onBlur: skjul,
    onClick: (e: React.MouseEvent) => { skjul(); (children.props.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e); },
  });
  return (
    <>
      {barn}
      {pos && createPortal(
        <div role="tooltip" className="pointer-events-none fixed z-[90] -translate-y-1/2 rounded-lg px-3 py-1.5 whitespace-nowrap meny-hint-inn"
          style={{ left: pos.x, top: pos.y, backgroundColor: 'var(--card)', border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 6px 18px rgba(0,0,0,0.16)', color: 'var(--nmbu-neutral)' }}>
          <span className="absolute -left-[5px] top-1/2 -translate-y-1/2 rotate-45 w-2.5 h-2.5" style={{ backgroundColor: 'var(--card)', borderLeft: '1px solid var(--nmbu-neutral-3)', borderBottom: '1px solid var(--nmbu-neutral-3)' }} />
          <span className="relative block text-sm" style={{ fontWeight: 600 }}>{navn}</span>
          {undertekst && <span className="relative block text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>{undertekst}</span>}
        </div>,
        document.body,
      )}
    </>
  );
}
