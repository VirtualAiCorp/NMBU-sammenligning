import { useState, type ReactNode } from 'react';
import { BookMarked, Download, ExternalLink } from 'lucide-react';

/**
 * Gjenbrukbar kildeboks: en liten, rolig boks under en seksjon eller et tall med kilden(e) tallet bygger på.
 * Hver kilde kan ha lenke (DBH, SSB, Samordna, Forskningsrådet, CORDIS …), sider i et dokument (lenke med #page=N)
 * og nedlasting av PDF-en når den ligger lokalt (sti relativt til kilde/public/). Fungerer i alle oppsett og i
 * lys og mørk modus (bare var(--nmbu-…)-farger).
 */
export interface Kilde {
  /** Kort navn, for eksempel «DBH/HK-dir tabell 902» eller dokumenttittelen. */
  navn: string;
  /** Hva tabellen eller dokumentet gir, for eksempel «Økonomiske nøkkeltall». */
  detalj?: string;
  /** Lenke til originalen. */
  url?: string | null;
  /** Lokal PDF, relativt til kilde/public/ (for eksempel «ledelse/pdf/tertial.pdf»). */
  pdf?: string | null;
  /** Fysiske PDF-sider tallet står på. */
  sider?: number[];
  /** Dato for dokumentet eller uttrekket (vises som den står). */
  dato?: string;
}

const BASE = import.meta.env.BASE_URL;
const erPdf = (u?: string | null) => !!u && /\.pdf($|[?#])/i.test(u);

/** Lenke til dokumentet, til riktig side når det er en PDF: lokal kopi først, ellers originalen. */
export function kildeLenke(k: Pick<Kilde, 'url' | 'pdf'>, side?: number | null): string | null {
  const n = side != null && Number.isFinite(side) && side > 0 ? side : null;
  if (k.pdf) return `${BASE}${k.pdf.replace(/^\//, '')}${n ? `#page=${n}` : ''}`;
  if (!k.url) return null;
  return erPdf(k.url) && n ? `${k.url.split('#')[0]}#page=${n}` : k.url;
}

// ── Faste kilder som går igjen ─────────────────────────────────────────────────
const DBH_URL = 'https://dbh.hkdir.no/tall-og-statistikk';
export const dbh = (tabell: number | string, detalj?: string): Kilde => ({ navn: `DBH/HK-dir tabell ${tabell}`, detalj, url: DBH_URL });
export const KILDER = {
  samordna: { navn: 'Samordna opptak', detalj: 'Søkertall og poenggrenser, hovedopptaket', url: 'https://hkdir.no/sokertall-fra-samordna-opptak-til-nedlasting' } as Kilde,
  samordnaKatalog: { navn: 'Samordna opptak', detalj: 'Studieplasser 2016–2026 og lista over ledige studieplasser 2026', url: 'https://www.samordnaopptak.no/info/' } as Kilde,
  studiebarometeret: { navn: 'Studiebarometeret', detalj: 'Helhetsvurdering og snitt for fagfeltet', url: 'https://www.studiebarometeret.no/' } as Kilde,
  forskningsradet: { navn: 'Forskningsrådet, åpne data', detalj: 'Søknader og bevilgninger (prosjektansvarlig)', url: 'https://github.com/Forskningsradet/open-data/tree/main/datasets/soknader2' } as Kilde,
  prosjektbanken: { navn: 'Forskningsrådet, Prosjektbanken', detalj: 'Utbetalt per år', url: 'https://prosjektbanken.forskningsradet.no' } as Kilde,
  cordis: { navn: 'CORDIS', detalj: 'EU-prosjekter i Horizon Europe', url: 'https://cordis.europa.eu/projects' } as Kilde,
};

export function Kildeboks({ kilder, merknad, tittel = 'Kilde', className = 'mt-3', maks }: {
  kilder: Kilde[]; merknad?: ReactNode; tittel?: string; className?: string;
  /** Vis bare de første `maks` kildene, med knapp for resten. */ maks?: number;
}) {
  const [alle, setAlle] = useState(false);
  // Samme dokument flere ganger (ulike sider): slå sammen
  const samlet: Kilde[] = [];
  for (const k of kilder) {
    const lik = samlet.find((x) => x.navn === k.navn && x.detalj === k.detalj && x.url === k.url && x.pdf === k.pdf);
    if (lik) { for (const s of k.sider ?? []) if (!(lik.sider ??= []).includes(s)) lik.sider.push(s); }
    else samlet.push({ ...k, sider: k.sider ? [...k.sider] : undefined });
  }
  for (const k of samlet) k.sider?.sort((a, b) => a - b);
  if (!samlet.length && !merknad) return null;
  const liten = { fontSize: 11, lineHeight: 1.5 } as const;
  return (
    <div className={`kildeboks rounded-lg px-2.5 py-1.5 ${className}`} 
      style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-1)', ...liten }}>
      <div className="flex items-start gap-1.5 min-w-0">
        <BookMarked className="w-3 h-3 mt-[3px] shrink-0" style={{ color: 'var(--nmbu-neutral-2)' }} aria-hidden />
        <div className="min-w-0 flex-1" style={{ overflowWrap: 'anywhere' }}>
          <span style={{ fontWeight: 600, color: 'var(--nmbu-neutral)' }}>{samlet.length > 1 ? `${tittel}r` : tittel}: </span>
          {(alle || !maks ? samlet : samlet.slice(0, maks)).map((k, i) => {
            const lenke = kildeLenke(k, k.sider?.[0]);
            return (
              <span key={`${k.navn}-${i}`}>
                {i > 0 && <span aria-hidden> · </span>}
                {lenke
                  ? <a href={lenke} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>{k.navn}</a>
                  : <span style={{ fontWeight: 600 }}>{k.navn}</span>}
                {k.detalj && <span>, {k.detalj}</span>}
                {k.dato && <span style={{ color: 'var(--nmbu-neutral-2)' }}> ({k.dato})</span>}
                {!!k.sider?.length && (
                  <span className="whitespace-nowrap">
                    {', s. '}
                    {k.sider.map((s, j) => {
                      const h = kildeLenke(k, s);
                      return <span key={s}>{j > 0 && ', '}{h ? <a href={h} target="_blank" rel="noreferrer" title={`Åpne side ${s}`} className="hover:underline" style={{ color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>{s}</a> : s}</span>;
                    })}
                  </span>
                )}
                {k.pdf && k.url && (
                  <a href={k.url} target="_blank" rel="noreferrer" title="Åpne originalen" aria-label={`Originalen: ${k.navn}`} className="inline-flex align-middle ml-1" style={{ color: 'var(--nmbu-neutral-2)' }}>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {k.pdf && (
                  <a href={`${BASE}${k.pdf.replace(/^\//, '')}`} download title="Last ned PDF" aria-label={`Last ned PDF: ${k.navn}`}
                    className="inline-flex items-center gap-0.5 align-middle ml-1.5 px-1.5 rounded" style={{ color: 'var(--nmbu-green-dark)', border: '1px solid var(--nmbu-neutral-3)', fontWeight: 600 }}>
                    <Download className="w-3 h-3" /> PDF
                  </a>
                )}
              </span>
            );
          })}
          {maks && !alle && samlet.length > maks && (
            <button type="button" onClick={() => setAlle(true)} className="ml-1 hover:underline" style={{ color: 'var(--nmbu-green-dark)', fontWeight: 600, fontSize: 11 }}>+ {samlet.length - maks} til</button>
          )}
          {merknad && <div className="mt-0.5" style={{ color: 'var(--nmbu-neutral-2)' }}>{merknad}</div>}
        </div>
      </div>
    </div>
  );
}
