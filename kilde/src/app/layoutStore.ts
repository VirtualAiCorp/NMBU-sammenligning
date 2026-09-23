import { useSyncExternalStore } from 'react';

/**
 * Valgt oppsett for hele nettsiden: «oversikt» (dagens kortbaserte), «dashboard» (fast sidemeny, full bredde)
 * eller «toppmeny» (moduler som faner øverst). Lagres i localStorage («layout») og kan settes med ?oppsett=… i lenken.
 */
export type Layout = 'oversikt' | 'dashboard' | 'toppmeny';
export const LAYOUTS: Layout[] = ['oversikt', 'dashboard', 'toppmeny'];
const KEY = 'layout';
const listeners = new Set<() => void>();

function les(): Layout {
  try {
    const v = localStorage.getItem(KEY);
    return LAYOUTS.includes(v as Layout) ? (v as Layout) : 'oversikt';
  } catch { return 'oversikt'; }
}
let current: Layout = typeof window === 'undefined' ? 'oversikt' : les();

// Delbar lenke: ?oppsett=dashboard setter (og lagrer) oppsettet ved første lasting.
if (typeof window !== 'undefined') {
  const fraUrl = new URLSearchParams(window.location.search).get('oppsett');
  if (fraUrl && LAYOUTS.includes(fraUrl as Layout)) {
    current = fraUrl as Layout;
    try { localStorage.setItem(KEY, current); } catch { /* privat modus */ }
  }
}

export function setLayout(l: Layout) {
  current = l;
  try { localStorage.setItem(KEY, l); } catch { /* privat modus */ }
  listeners.forEach((f) => f());
}

export function useLayout(): Layout {
  return useSyncExternalStore(
    (f) => { listeners.add(f); return () => { listeners.delete(f); }; },
    () => current,
    () => 'oversikt',
  );
}
