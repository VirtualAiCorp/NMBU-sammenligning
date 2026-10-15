import { useEffect, useMemo, useState } from 'react';
import { Lock, Info, ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { GRADE_COLORS, LETTERS, nf, sumPacked, type Packed } from './NmbuCourseExplorer';

/**
 * Interne emnetall fra FS (foreløpige, før DBH har publisert dem), f.eks. STAT100 våren 2026. Dataene er aggregert
 * (antall per studieprogram, ingen personer) og kryptert (AES-256-GCM, PBKDF2-SHA256) som de andre interne sidene;
 * de dekrypteres i nettleseren med samme passord. Bygges av scripts/build-emner-fs-intern.py.
 */

interface ProgFs { eksMeldt: number; bestatt: number; stryk: number; ikkeMott: number; snitt: string | null }
interface TerminFs {
  termin: string; kilde: string;
  hele: Record<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'antall' | 'bestatt' | 'stryk' | 'ikkeMott' | 'annen', number>;
  programmer: Record<string, ProgFs>;
  ovrige: { eksMeldt: number; bestatt: number; stryk: number; ikkeMott: number; antall: number; ikkeFort: boolean };
}
interface Konvolutt { iter: number; salt: string; iv: string; data: string }

const PW_KEY = 'intern-opptak-pw'; // samme passord som de andre interne sidene
const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const hentJson = <T,>(sti: string): Promise<T | null> => fetch(`${import.meta.env.BASE_URL}${sti}`, { cache: 'no-store' })
  .then((r) => (r.ok && (r.headers.get('content-type') ?? '').includes('json') ? r.json() : null)).catch(() => null);
// Emnekodene som har FS-tall ligger ukryptert i en egen fil; selve tallene er i den krypterte konvolutten.
let indeks: Promise<{ emner: string[] } | null> | null = null;
let konvolutt: Promise<Konvolutt | null> | null = null;
const hentIndeks = () => (indeks ??= hentJson('emner-fs-indeks.json'));
const hentKonvolutt = () => (konvolutt ??= hentJson('intern/emner-fs.json'));

async function dekrypter(e: Konvolutt, pw: string): Promise<Record<string, TerminFs[]>> {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(e.salt), iterations: e.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(e.iv) }, key, b64(e.data));
  return JSON.parse(new TextDecoder().decode(plain)).emner;
}

type Kol = 'navn' | 'res' | 'stryk' | 'dbh' | 'ikke';
const pst = (stryk: number, best: number) => (stryk + best ? (stryk / (stryk + best)) * 100 : null);

export function NmbuFsIntern({ kode, programmer, programNavn, sisteDbhAar }: {
  kode: string; programmer: Record<string, Record<string, Packed>>; programNavn: (pk: string) => string; sisteDbhAar: string;
}) {
  const [emner, setEmner] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, TerminFs[]> | null>(null);
  const [pw, setPw] = useState('');
  const [feil, setFeil] = useState(false);
  const [sort, setSort] = useState<{ kol: Kol; retning: 1 | -1 }>({ kol: 'res', retning: -1 });

  const lasOpp = async (p: string, lagre: boolean) => {
    const e = await hentKonvolutt();
    if (!e) return;
    try {
      setData(await dekrypter(e, p)); setFeil(false);
      if (lagre) try { sessionStorage.setItem(PW_KEY, p); } catch { /* privat modus */ }
    } catch { if (lagre) setFeil(true); }
  };
  useEffect(() => {
    void hentIndeks().then((ix) => {
      setEmner(ix?.emner ?? []);
      try { const p = sessionStorage.getItem(PW_KEY); if (ix?.emner.length && p) void lasOpp(p, false); } catch { /* */ }
    });
  }, []);

  const terminer = data?.[kode];
  const t = terminer?.[terminer.length - 1];
  const rader = useMemo(() => {
    if (!t) return [];
    const r = Object.entries(t.programmer).map(([pk, p]) => {
      const dbh = sumPacked(programmer[pk], sisteDbhAar);
      return { pk, navn: programNavn(pk), res: p.bestatt + p.stryk, stryk: pst(p.stryk, p.bestatt), dbh: dbh.stryk, dbhSkjult: dbh.skjult > 0, p };
    });
    const v = (x: typeof r[number]) => ({ navn: x.navn, res: x.res, stryk: x.stryk, dbh: x.dbh, ikke: x.p.ikkeMott } as Record<Kol, number | string | null>)[sort.kol];
    return r.sort((a, b) => {
      const va = v(a), vb = v(b);
      if (va == null) return 1; if (vb == null) return -1;
      return (typeof va === 'string' ? va.localeCompare(vb as string, 'nb') : (va as number) - (vb as number)) * sort.retning || b.res - a.res;
    });
  }, [t, programmer, programNavn, sisteDbhAar, sort]);

  if (!emner.includes(kode)) return null;

  const boks = { backgroundColor: 'var(--nmbu-beige-light)', border: '1px dashed var(--nmbu-neutral-3)' };
  if (!t) {
    return (
      <div className="rounded-xl px-4 py-3 mt-5 flex items-center gap-3 flex-wrap" style={boks}>
        <Lock className="w-4 h-4" style={{ color: 'var(--nmbu-green-dark)' }} />
        <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)' }}><b>Nyere tall fra FS (intern)</b> · foreløpige tall før DBH har publisert dem</div>
        <form className="flex items-center gap-2 ml-auto" onSubmit={(e) => { e.preventDefault(); void lasOpp(pw, true); }}>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Passord" aria-label="Passord for interne tall"
            className="px-2.5 py-1 rounded-md text-xs" style={{ border: `1px solid ${feil ? '#c13a5a' : 'var(--nmbu-neutral-3)'}`, backgroundColor: '#fff', color: 'var(--nmbu-neutral-1)' }} />
          <button type="submit" className="px-3 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>Lås opp</button>
          {feil && <span style={{ fontSize: 11, color: '#c13a5a' }}>Feil passord</span>}
        </form>
      </div>
    );
  }

  const h = t.hele;
  const letters = LETTERS.reduce((s, g) => s + h[g], 0);
  const snitt = letters ? LETTERS.reduce((s, g, i) => s + (5 - i) * h[g], 0) / letters : null;
  const ov = t.ovrige;
  const deler = [ov.antall ? `${ov.antall} program med under 3 studenter med resultat` : '', ov.ikkeFort ? 'programmene på side 2–3 i FS-rapporten' : ''].filter(Boolean);
  const ovrigTekst = `Øvrige program${deler.length ? ` (${deler.join(' og ')})` : ''}`;
  const Th = ({ id, label, hoyre = true }: { id: Kol; label: string; hoyre?: boolean }) => {
    const aktiv = sort.kol === id; const Ikon = !aktiv ? ArrowUpDown : sort.retning === 1 ? ArrowUp : ArrowDown;
    return (
      <th className={`px-3 py-2 ${hoyre ? 'text-right' : 'text-left'}`} aria-sort={aktiv ? (sort.retning === 1 ? 'ascending' : 'descending') : 'none'}
        style={{ color: aktiv ? 'var(--nmbu-green-dark)' : 'var(--nmbu-neutral-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>
        <button onClick={() => setSort({ kol: id, retning: aktiv ? (sort.retning === 1 ? -1 : 1) : id === 'navn' ? 1 : -1 })}
          className={`inline-flex items-center gap-1 ${hoyre ? 'flex-row-reverse' : ''}`} style={{ font: 'inherit', color: 'inherit' }}>
          <Ikon className="w-3 h-3" style={{ opacity: aktiv ? 1 : 0.45 }} />{label}
        </button>
      </th>
    );
  };

  return (
    <div className="rounded-xl px-4 py-4 mt-5" style={boks}>
      <div className="flex items-center gap-2 flex-wrap">
        <Lock className="w-4 h-4" style={{ color: 'var(--nmbu-green-dark)' }} />
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{kode.replace(/-\d+$/, '')} {t.termin} · fra FS (intern, foreløpig)</div>
        <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>Ikke publisert i DBH ennå</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
        {[
          { l: 'Med resultat (A–F)', v: letters.toLocaleString('nb-NO') },
          { l: 'Snitt (A=5 … F=0)', v: snitt != null ? nf(snitt, 2) : '–' },
          { l: 'Stryk', v: letters ? `${nf((h.F / letters) * 100, 1)} %` : '–' },
          { l: 'Ikke møtt', v: h.ikkeMott.toLocaleString('nb-NO') },
          { l: 'Eksamensmeldt', v: h.antall.toLocaleString('nb-NO') },
        ].map((k) => (
          <div key={k.l} className="rounded-lg px-3 py-2" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
            <div style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{k.l}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--nmbu-green-dark)', lineHeight: 1.15 }}>{k.v}</div>
          </div>
        ))}
      </div>
      <div className="flex rounded-full overflow-hidden mt-3" style={{ height: 10 }}>
        {LETTERS.map((g) => h[g] > 0 && <div key={g} title={`${g}: ${h[g]} (${nf((h[g] / letters) * 100, 0)} %)`} style={{ width: `${(h[g] / letters) * 100}%`, backgroundColor: GRADE_COLORS[g] }} />)}
      </div>
      <div className="flex gap-3 mt-1 flex-wrap" style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>
        {LETTERS.map((g) => <span key={g}><b style={{ color: GRADE_COLORS[g] }}>{g}</b> {h[g]} ({nf((h[g] / letters) * 100, 0)} %)</span>)}
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ borderBottom: '2px solid var(--nmbu-neutral-3)' }}>
              <Th id="navn" label="Studieprogram" hoyre={false} />
              <Th id="res" label="Med resultat" />
              <th className="px-3 py-2 text-right" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Bestått</th>
              <th className="px-3 py-2 text-right" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Stryk</th>
              <Th id="stryk" label={`Stryk ${t.termin}`} />
              <Th id="dbh" label={`Stryk ${sisteDbhAar} (DBH)`} />
              <Th id="ikke" label="Ikke møtt" />
              <th className="px-3 py-2 text-right" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }} title="Snittkarakter i FS-rapporten (bokstav)">Snitt</th>
            </tr>
          </thead>
          <tbody>
            {rader.map((r) => (
              <tr key={r.pk} style={{ borderBottom: '1px solid var(--nmbu-neutral-3)' }}>
                <td className="px-3 py-1.5"><span style={{ fontWeight: 600, color: 'var(--nmbu-neutral-1)' }}>{r.navn}</span> <span style={{ fontSize: 10, color: 'var(--nmbu-neutral-2)' }}>{r.pk}</span></td>
                <td className="px-3 py-1.5 text-right" style={{ fontWeight: 600 }}>{r.res}</td>
                <td className="px-3 py-1.5 text-right">{r.p.bestatt}</td>
                <td className="px-3 py-1.5 text-right">{r.p.stryk}</td>
                <td className="px-3 py-1.5 text-right" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{r.stryk != null ? `${nf(r.stryk, 1)} %` : '–'}</td>
                <td className="px-3 py-1.5 text-right" style={{ color: 'var(--nmbu-neutral-2)' }}>{r.dbh != null ? `${r.dbhSkjult ? '≥ ' : ''}${nf(r.dbh, 1)} %` : '–'}</td>
                <td className="px-3 py-1.5 text-right">{r.p.ikkeMott}</td>
                <td className="px-3 py-1.5 text-right">{r.p.snitt ?? '–'}</td>
              </tr>
            ))}
            {ov.bestatt + ov.stryk > 0 && (
              <tr>
                <td className="px-3 py-1.5" style={{ fontStyle: 'italic', color: 'var(--nmbu-neutral-2)' }}>
                  {ovrigTekst}
                </td>
                <td className="px-3 py-1.5 text-right">{ov.bestatt + ov.stryk}</td>
                <td className="px-3 py-1.5 text-right">{ov.bestatt}</td>
                <td className="px-3 py-1.5 text-right">{ov.stryk}</td>
                <td className="px-3 py-1.5 text-right">{pst(ov.stryk, ov.bestatt) != null ? `${nf(pst(ov.stryk, ov.bestatt)!, 1)} %` : '–'}</td>
                <td colSpan={3} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-start gap-2 mt-3" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Kilde: {t.kilde}. Foreløpige tall fra FS, ordinær eksamen; kontinuasjonseksamen og DBHs endelige tall kan endre dem.
          Stryk = stryk / (bestått + stryk), som i FS og DBH; «ikke møtt» teller ikke med. DBH-kolonnen er hele kalenderåret {sisteDbhAar}
          (ordinær og kontinuasjon) og er et minimum når DBH har skjermet små celler. Program med under 3 studenter med resultat vises ikke for seg.
        </span>
      </div>
    </div>
  );
}
