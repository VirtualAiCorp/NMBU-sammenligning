/**
 * AJG-Analyse HH: eget nettsted (VITE_KUN_AJG=1, Cloudflare-prosjektet «ajg-analyse-hh») for analysen av AJG 2024 etter
 * fagområde. Samme uttrykk som arbeidsflaten i NMBU-sammenligningen (styles/arbeidsflate.css): lys sidemeny, KPI-stripe,
 * listerader og detaljkort. Dataene er kryptert med AJG_PASSORD og dekrypteres i nettleseren; passordet huskes for fanen.
 * Sidene ligger i sider.tsx; navigasjonen er en enkel hash-ruter (#/fordeling osv.), så lenker kan deles.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { Lock, Menu, X } from '../../ikoner';
import { ThemeToggle } from '../ThemeToggle';
import { dekrypter, type AjgData } from './data';
import { MENY } from './meny';
import { SIDER, type SideId } from './sider';

const PW_KEY = 'ajg-pw';

const ALLE_ID = MENY.flatMap((g) => g.punkter.map((p) => p.id));

function lesHash(): SideId {
  const h = window.location.hash.replace(/^#\/?/, '') as SideId;
  return ALLE_ID.includes(h) ? h : 'oversikt';
}

export function AjgAnalyse() {
  const [data, setData] = useState<AjgData | null>(null);
  const [laster, setLaster] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [side, setSide] = useState<SideId>(lesHash);
  const [mobil, setMobil] = useState(false);

  const apne = async (pw: string, stille = false) => {
    setLaster(true); setFeil(null);
    try {
      const d = await dekrypter(pw);
      try { sessionStorage.setItem(PW_KEY, pw); } catch { /* ikke lagret */ }
      setData(d);
    } catch (e) {
      if (!stille) setFeil(e instanceof Error && e.message === 'Fant ikke datafilen' ? 'Fant ikke datafilen.' : 'Feil passord.');
      try { sessionStorage.removeItem(PW_KEY); } catch { /* ignorer */ }
    } finally { setLaster(false); }
  };
  useEffect(() => {
    let pw: string | null = null;
    try { pw = sessionStorage.getItem(PW_KEY); } catch { /* ingen lagring */ }
    if (pw) void apne(pw, true);
  }, []);
  useEffect(() => {
    const ved = () => { setSide(lesHash()); setMobil(false); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', ved);
    return () => window.removeEventListener('hashchange', ved);
  }, []);
  useEffect(() => {
    const t = MENY.flatMap((g) => g.punkter).find((p) => p.id === side);
    document.title = side === 'oversikt' || !t ? 'AJG-Analyse HH' : `${t.label.replace(/^\d /, '')} · AJG-Analyse HH`;
  }, [side]);
  useEffect(() => {
    if (!mobil) return;
    const tast = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobil(false); };
    const f = document.body.style.overflow; document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', tast);
    return () => { document.body.style.overflow = f; window.removeEventListener('keydown', tast); };
  }, [mobil]);

  if (!data) return <Laas onApne={apne} laster={laster} feil={feil} />;

  const Side = SIDER[side];
  const meny = (iSkuff: boolean) => <Sidemeny side={side} iSkuff={iSkuff} lukk={() => setMobil(false)} />;
  return (
    <div className="ajg af-ramme">
      <aside className="af-sidemeny" aria-label="Sidemeny">{meny(false)}</aside>
      <div className={`af-skuff-bakgrunn ${mobil ? 'af-apen' : ''}`} onClick={() => setMobil(false)} aria-hidden={!mobil}>
        <aside className="af-skuff" onClick={(e) => e.stopPropagation()} aria-label="Sidemeny" {...(!mobil ? { inert: '' } : {})}>{meny(true)}</aside>
      </div>
      <div className="af-hoved">
        <div className="af-mobiltopp">
          <button type="button" className="af-ikonknapp af-ikonknapp-ring" onClick={() => setMobil(true)} aria-label="Åpne menyen"><Menu className="w-4 h-4" /></button>
          <a className="af-ordmerke" href="#/">AJG-Analyse HH</a>
        </div>
        <main className="af-main" key={side}>
          <Side d={data} />
        </main>
      </div>
    </div>
  );
}

function Sidemeny({ side, iSkuff, lukk }: { side: SideId; iSkuff: boolean; lukk: () => void }) {
  return (
    <div className="af-meny">
      <div className="af-meny-topp">
        <a className="af-ordmerke" href="#/">AJG-Analyse HH</a>
        <div className="af-topp-ikoner">
          {iSkuff
            ? <button type="button" className="af-ikonknapp" onClick={lukk} aria-label="Lukk menyen"><X className="w-4 h-4" /></button>
            : <ThemeToggle />}
        </div>
      </div>
      <nav className="af-nav" aria-label="Hovedmeny">
        {MENY.map((g) => (
          <div key={g.tittel} className="af-meny-gruppe">
            <div className="af-meny-overskrift">{g.tittel}</div>
            {g.punkter.map((p) => (
              <a key={p.id} className="af-menypunkt" href={`#/${p.id === 'oversikt' ? '' : p.id}`} aria-current={side === p.id ? 'page' : undefined}>
                <p.ikon className="af-menyikon" aria-hidden /><span className="af-menytekst">{p.label}</span>
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="af-meny-bunn">
        <div className="af-kreditering">Laget av studierådgiverne ved Handelshøyskolen, NMBU. Intern: AJG-nivåene er lisensbelagt.</div>
      </div>
    </div>
  );
}

function Laas({ onApne, laster, feil }: { onApne: (pw: string) => void; laster: boolean; feil: string | null }) {
  const [pw, setPw] = useState('');
  const send = (e: FormEvent) => { e.preventDefault(); if (pw) onApne(pw); };
  return (
    <div className="ajg ajg-laas">
      <form className="ajg-laas-kort" onSubmit={send}>
        <span className="af-ikonflis" aria-hidden><Lock className="w-4 h-4" /></span>
        <h1>AJG-Analyse HH</h1>
        <p>AJG 2024 etter fagområde ved norske handelshøyskoler. Siden er låst fordi den viser AJG-nivå per tidsskrift (lisens fra Chartered ABS).</p>
        <label className="sr-only" htmlFor="ajg-pw">Passord</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input id="ajg-pw" className="ajg-felt" type="password" autoComplete="current-password" placeholder="Passord" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
          <button className="ajg-knapp" type="submit" disabled={laster || !pw}>{laster ? 'Åpner …' : 'Åpne'}</button>
        </div>
        {feil && <div className="ajg-feil" role="alert">{feil}</div>}
      </form>
    </div>
  );
}
