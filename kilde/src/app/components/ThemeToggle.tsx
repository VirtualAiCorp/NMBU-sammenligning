import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Lys/mørk-bryter (samme mønster som sammenligningsportalens theme-toggle.js):
 * uten lagret valg følger siden systeminnstillingen, og følger med live hvis den endres;
 * et klikk lagrer et eksplisitt valg i localStorage («theme»). index.html setter data-theme før første tegning.
 */
const KEY = 'theme';
const mql = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function lagret(): 'light' | 'dark' | null {
  try { const v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch { return null; }
}
function bruk(theme: 'light' | 'dark') {
  const el = document.documentElement;
  el.setAttribute('data-theme', theme);
  el.classList.toggle('dark', theme === 'dark');
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => lagret() ?? (mql?.matches ? 'dark' : 'light'));

  useEffect(() => { bruk(theme); }, [theme]);
  useEffect(() => {
    if (!mql) return;
    const onChange = () => { if (!lagret()) setTheme(mql.matches ? 'dark' : 'light'); };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const neste = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={() => { try { localStorage.setItem(KEY, neste); } catch { /* privat modus */ } setTheme(neste); }}
      title={theme === 'dark' ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
      aria-label={theme === 'dark' ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
      className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
    >
      {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
