import { useSyncExternalStore } from 'react';

/**
 * Fargetema for hele nettsiden (uavhengig av lys/mørk modus): NMBU (standard), Virtual AI Corp, Fjord eller Lyng.
 * Settes som data-farge på <html> (ingen attributt for NMBU); fargene ligger i styles/tema.css og
 * styles/tema-overrides.css. Lagres i localStorage («fargetema») og kan settes med ?farge=… i lenken.
 * index.html setter attributtet før første tegning, så siden ikke blinker i feil farge.
 */
export type Fargetema = 'nmbu' | 'vac' | 'fjord' | 'lyng';
export const FARGETEMAER: { id: Fargetema; navn: string; beskrivelse: string; prøve: [string, string, string] }[] = [
  { id: 'nmbu', navn: 'NMBU', beskrivelse: 'Grønt fra NMBUs designhåndbok', prøve: ['#025c4f', '#46b4a0', '#f6f6ee'] },
  { id: 'vac', navn: 'Virtual AI Corp', beskrivelse: 'Indigo på kremhvit, Work Sans og Newsreader', prøve: ['#2a1ea6', '#3626d9', '#f6f2e7'] },
  { id: 'fjord', navn: 'Fjord', beskrivelse: 'Dyp blå', prøve: ['#13406b', '#5b9bd5', '#f3f6f9'] },
  { id: 'lyng', navn: 'Lyng', beskrivelse: 'Plomme, fra NMBUs lilla', prøve: ['#53143a', '#b86a93', '#faf6f3'] },
];
const KEY = 'fargetema';
const IDER = FARGETEMAER.map((t) => t.id);
const listeners = new Set<() => void>();
/** Skriftene til Virtual AI Corp-temaet, lastet bare når temaet brukes */
const VAC_FONTER = 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=JetBrains+Mono:wght@400;500&display=swap';

function les(): Fargetema {
  try { const v = localStorage.getItem(KEY); return IDER.includes(v as Fargetema) ? (v as Fargetema) : 'nmbu'; } catch { return 'nmbu'; }
}
let current: Fargetema = typeof window === 'undefined' ? 'nmbu' : les();

function lastFonter(t: Fargetema) {
  if (t !== 'vac' || document.getElementById('vac-fonter')) return;
  const l = document.createElement('link');
  l.id = 'vac-fonter'; l.rel = 'stylesheet'; l.href = VAC_FONTER;
  document.head.appendChild(l);
}

function bruk(t: Fargetema, mykt: boolean) {
  const el = document.documentElement;
  lastFonter(t);
  if (mykt && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.classList.add('farge-bytter');
    window.setTimeout(() => el.classList.remove('farge-bytter'), 350);
  }
  if (t === 'nmbu') el.removeAttribute('data-farge'); else el.setAttribute('data-farge', t);
}

if (typeof window !== 'undefined') {
  const fraUrl = new URLSearchParams(window.location.search).get('farge');
  if (fraUrl && IDER.includes(fraUrl as Fargetema)) {
    current = fraUrl as Fargetema;
    try { localStorage.setItem(KEY, current); } catch { /* privat modus */ }
  }
  bruk(current, false);
}

export function setFargetema(t: Fargetema) {
  current = t;
  try { localStorage.setItem(KEY, t); } catch { /* privat modus */ }
  bruk(t, true);
  listeners.forEach((f) => f());
}

export function useFargetema(): Fargetema {
  return useSyncExternalStore(
    (f) => { listeners.add(f); return () => { listeners.delete(f); }; },
    () => current,
    () => 'nmbu',
  );
}
