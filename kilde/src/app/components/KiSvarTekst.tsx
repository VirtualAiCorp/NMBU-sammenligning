import type { ReactNode } from 'react';

/**
 * Visning av KI-svar (styrepapir-søket og KI-chatten): **fet**, *kursiv*, punktlister (også innrykket) og
 * kildehenvisninger som [3], [3, 5], [3][5], [S2], [D4], [M1]. `kilde` gjør en henvisning om til tekst, forklaring og ev. lenke.
 */
export type KildeOppslag = (ref: string) => { tekst: string; tittel: string; href?: string } | null;

export function KiSvarTekst({ tekst, kilde }: { tekst: string; kilde: KildeOppslag }) {
  const ref = (r: string, k: string): ReactNode => {
    const o = kilde(r.trim());
    if (!o) return <span key={k}>{r}</span>;
    return o.href
      ? <a key={k} href={o.href} target="_blank" rel="noreferrer" title={o.tittel} style={{ color: 'var(--nmbu-green-dark)', fontWeight: 700 }}>{o.tekst}</a>
      : <span key={k} title={o.tittel} style={{ color: 'var(--nmbu-green-6)', fontWeight: 700, cursor: 'help' }}>{o.tekst}</span>;
  };
  const inline = (linje: string, k: string): ReactNode[] => linje.split(/(\*\*[^*]+\*\*|\[(?:[SDM]?\d+\s*,\s*)*[SDM]?\d+\]|\*[^*\s][^*]*\*)/i).map((del, j) => {
    const key = `${k}-${j}`;
    const fet = del.match(/^\*\*([^*]+)\*\*$/);
    if (fet) return <b key={key} style={{ color: 'var(--nmbu-green-dark)' }}>{inline(fet[1], key)}</b>;
    const kursiv = del.match(/^\*([^*]+)\*$/);
    if (kursiv) return <i key={key}>{kursiv[1]}</i>;
    const refs = del.match(/^\[((?:[SDM]?\d+\s*,\s*)*[SDM]?\d+)\]$/i);
    if (refs) {
      const deler = refs[1].split(/\s*,\s*/);
      return <span key={key}>[{deler.flatMap((r, n) => (n ? [', ', ref(r, `${key}-${n}`)] : [ref(r, `${key}-${n}`)]))}]</span>;
    }
    return <span key={key}>{del}</span>;
  });
  const linjer = tekst.split(/\n/).filter((l) => l.trim());
  const ut: ReactNode[] = [];
  let liste: ReactNode[] = [];
  const tomListe = (k: number) => { if (liste.length) { ut.push(<ul key={`ul${k}`} className="list-disc pl-5 mb-2">{liste}</ul>); liste = []; } };
  linjer.forEach((raa, i) => {
    const innrykk = (raa.match(/^\s*/)?.[0].length ?? 0) >= 2;
    const l = raa.trim();
    if (/^-{3,}$/.test(l)) return;
    const m = l.match(/^(?:[-•*]|\d+\.)\s+(.*)$/);
    if (m) liste.push(<li key={i} className="mb-0.5" style={innrykk ? { marginLeft: 16, listStyleType: 'circle' } : undefined}>{inline(m[1], String(i))}</li>);
    else { tomListe(i); ut.push(<p key={i} className="mb-1.5">{inline(l.replace(/^#+\s*/, ''), String(i))}</p>); }
  });
  tomListe(linjer.length);
  return <>{ut}</>;
}
