import { useSyncExternalStore } from 'react';

/**
 * Valgt oppsett for hele nettsiden: «oversikt» (kort og egne sider per modul), «dashboard» (fast sidemeny, full bredde),
 * «toppmeny» (moduler som faner øverst) eller «arbeidsflate» (standard fra 29.09.2026, rolig visning med lys sidemeny, nøkkeltall og
 * detaljkort, se components/arbeidsflate). Lagres i localStorage («layout») og kan settes med ?oppsett=… i lenken.
 *
 * Arbeidsflaten merkes med data-oppsett="arbeidsflate" på <html>; all styling for den ligger i styles/arbeidsflate.css
 * under det attributtet, så de tre andre oppsettene ikke påvirkes. index.html setter attributtet før første tegning.
 */
export type Layout = 'oversikt' | 'dashboard' | 'toppmeny' | 'arbeidsflate';
export const LAYOUTS: Layout[] = ['oversikt', 'dashboard', 'toppmeny', 'arbeidsflate'];
const KEY = 'layout';
/** Oppsettet før arbeidsflaten ble slått på, så knappen kan slå den av igjen dit brukeren var. */
const FORRIGE_KEY = 'layout-forrige';
const listeners = new Set<() => void>();
/** Skriften i arbeidsflaten (Geist, med IBM Plex Sans som reserve), lastet bare når visningen brukes */
const ARBEIDSFLATE_FONTER = 'https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400..600&display=swap';

/**
 * Arbeidsflaten er standard fra 29.09.2026. Alle som ikke har valgt oppsett etter byttet, lander i arbeidsflaten én
 * gang (merket med STANDARD_KEY); oppsettet de hadde, huskes som «forrige», så knappen tar dem tilbake dit.
 * Valg gjort etter byttet respekteres. index.html gjør det samme før første tegning.
 */
const STANDARD: Layout = 'arbeidsflate';
const STANDARD_KEY = 'layout-standard';
const STANDARD_VERSJON = '2026-09-29';

function les(): Layout {
  try {
    const v = localStorage.getItem(KEY);
    if (localStorage.getItem(STANDARD_KEY) !== STANDARD_VERSJON) {
      localStorage.setItem(STANDARD_KEY, STANDARD_VERSJON);
      if (v && v !== STANDARD && LAYOUTS.includes(v as Layout)) localStorage.setItem(FORRIGE_KEY, v);
      localStorage.setItem(KEY, STANDARD);
      return STANDARD;
    }
    return LAYOUTS.includes(v as Layout) ? (v as Layout) : STANDARD;
  } catch { return STANDARD; }
}
let current: Layout = typeof window === 'undefined' ? STANDARD : les();

/** Setter (eller fjerner) data-oppsett på <html> og laster skriften for arbeidsflaten. */
function bruk(l: Layout) {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  if (l === 'arbeidsflate') {
    el.setAttribute('data-oppsett', 'arbeidsflate');
    if (!document.getElementById('arbeidsflate-fonter')) {
      const lenke = document.createElement('link');
      lenke.id = 'arbeidsflate-fonter'; lenke.rel = 'stylesheet'; lenke.href = ARBEIDSFLATE_FONTER;
      document.head.appendChild(lenke);
    }
  } else el.removeAttribute('data-oppsett');
}

// Delbar lenke: ?oppsett=dashboard setter (og lagrer) oppsettet ved første lasting.
if (typeof window !== 'undefined') {
  const fraUrl = new URLSearchParams(window.location.search).get('oppsett');
  if (fraUrl && LAYOUTS.includes(fraUrl as Layout)) {
    if (fraUrl === 'arbeidsflate' && current !== 'arbeidsflate') { try { localStorage.setItem(FORRIGE_KEY, current); } catch { /* privat modus */ } }
    current = fraUrl as Layout;
    try { localStorage.setItem(KEY, current); } catch { /* privat modus */ }
  }
  bruk(current);
}

export function setLayout(l: Layout) {
  // Husk hvor brukeren var før arbeidsflaten, så «Arbeidsflate»-knappen kan slå den av igjen dit
  if (l === 'arbeidsflate' && current !== 'arbeidsflate') { try { localStorage.setItem(FORRIGE_KEY, current); } catch { /* privat modus */ } }
  current = l;
  try { localStorage.setItem(KEY, l); } catch { /* privat modus */ }
  bruk(l);
  listeners.forEach((f) => f());
}

/** Slår arbeidsflaten på, eller av igjen til oppsettet brukeren hadde før (standard «oversikt»). */
export function vekslArbeidsflate() {
  if (current !== 'arbeidsflate') { setLayout('arbeidsflate'); return; }
  let forrige: Layout = 'oversikt';
  try { const v = localStorage.getItem(FORRIGE_KEY); if (v && v !== 'arbeidsflate' && LAYOUTS.includes(v as Layout)) forrige = v as Layout; } catch { /* privat modus */ }
  setLayout(forrige);
}

export function useLayout(): Layout {
  return useSyncExternalStore(
    (f) => { listeners.add(f); return () => { listeners.delete(f); }; },
    () => current,
    () => 'oversikt',
  );
}
