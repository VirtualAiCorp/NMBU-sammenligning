/**
 * Byggeklossene i arbeidsflaten (inspirert av Newbuilds): sidehode, KPI-stripe, «faser»-kort, ikonrutenett,
 * listerader, segmentert kontroll, statuslinje og detaljkort. All styling ligger i styles/arbeidsflate.css
 * (klassene med af-prefiks), avgrenset under html[data-oppsett="arbeidsflate"].
 */
import type { CSSProperties, ReactNode } from 'react';
import { ArrowUpRight, ChevronRight, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { nf } from './tall';

/** Forskjøvet inntoning («home-rise») per seksjon: --i settes som indeks. */
export const stig = (i: number): CSSProperties => ({ ['--i' as string]: i });

export function AfHeader({ tittel, undertittel, eyebrow, handlinger }: { tittel: string; undertittel?: string; eyebrow?: string; handlinger?: ReactNode }) {
  return (
    <header className="af-header af-stig" style={stig(0)}>
      <div className="af-header-rad">
        <div className="min-w-0">
          {eyebrow && <div className="af-eyebrow">{eyebrow}</div>}
          <h1 className="af-h1">{tittel}</h1>
        </div>
        {handlinger && <div className="af-handlinger">{handlinger}</div>}
      </div>
      {undertittel && <p className="af-undertittel">{undertittel}</p>}
    </header>
  );
}

export function Seksjon({ tittel, hoyre, children, i = 1, id }: { tittel?: string; hoyre?: ReactNode; children: ReactNode; i?: number; id?: string }) {
  return (
    <section className="af-seksjon af-stig" style={stig(i)} id={id}>
      {(tittel || hoyre) && (
        <div className="af-seksjon-hode">
          {tittel && <h2 className="af-h2">{tittel}</h2>}
          {hoyre && <div className="af-seksjon-hoyre">{hoyre}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Pille({ children, onClick, ikon: Ikon, title, primar }: { children: ReactNode; onClick: () => void; ikon?: LucideIcon; title?: string; primar?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={title} className={`af-pille ${primar ? 'af-pille-primar' : ''}`}>
      {Ikon && <Ikon className="w-4 h-4 shrink-0" />}<span>{children}</span>
    </button>
  );
}

export type Kpi = { ikon: LucideIcon; etikett: string; verdi: string; endring?: number | null; hjelp?: string; tittel?: string };

/** KPI-stripe: én avrundet boks delt i fliser med tynne skillelinjer (Newbuilds Analytics). */
export function KpiStripe({ kpier }: { kpier: Kpi[] }) {
  return (
    <div className="af-kpi-stripe" role="list">
      {kpier.map((k) => (
        <div key={k.etikett} className="af-kpi" role="listitem" title={k.tittel}>
          <div className="af-kpi-topp">
            <span className="af-kpi-ikon" aria-hidden><k.ikon className="w-3.5 h-3.5" /></span>
            <span className="af-kpi-etikett">{k.etikett}</span>
          </div>
          <div className="af-kpi-verdi-rad">
            <span className="af-kpi-verdi">{k.verdi}</span>
            {k.endring != null && <Endring v={k.endring} />}
          </div>
          {k.hjelp && <div className="af-kpi-hjelp">{k.hjelp}</div>}
        </div>
      ))}
    </div>
  );
}

export function Endring({ v }: { v: number }) {
  const opp = v >= 0;
  const Ikon = opp ? TrendingUp : TrendingDown;
  return (
    <span className={`af-endring ${opp ? 'af-endring-opp' : 'af-endring-ned'}`} title="Endring fra året før, samme program">
      <Ikon className="w-3 h-3" aria-hidden />{opp ? '+' : '−'}{nf(Math.abs(v), 1)} %
    </span>
  );
}

export function Badge({ children, tone = 'dempet' }: { children: ReactNode; tone?: 'dempet' | 'aksent' | 'suksess' | 'advarsel' }) {
  return <span className={`af-badge af-badge-${tone}`}>{children}</span>;
}

/** «Faser»-kort (Newbuilds Sales stages): badge, tittel, undertekst, tynn fremdriftslinje og «x av y · z %». */
export function FaseKort({ badge, tittel, undertekst, andel, andelTekst, bunntekst, onClick }: {
  badge: string; tittel: string; undertekst: string; andel: number | null; andelTekst: string; bunntekst?: string; onClick: () => void;
}) {
  return (
    <button type="button" className="af-fase" onClick={onClick}>
      <div className="af-fase-topp">
        <Badge>{badge}</Badge>
        <ArrowUpRight className="w-4 h-4 af-fase-pil" aria-hidden />
      </div>
      <div className="af-fase-tittel">{tittel}</div>
      <div className="af-fase-under">{undertekst}</div>
      <div className="af-fremdrift" aria-hidden><span style={{ width: `${Math.max(0, Math.min(1, andel ?? 0)) * 100}%` }} /></div>
      <div className="af-fase-andel">{andelTekst}</div>
      {bunntekst && <div className="af-fase-bunn">{bunntekst}</div>}
    </button>
  );
}

/** Rutenett med ikon og tekst (Newbuilds Facilities), brukt som modulsnarveier. */
export function IkonRutenett({ punkter }: { punkter: { ikon: LucideIcon; tittel: string; tekst?: string; onClick: () => void; laas?: boolean }[] }) {
  return (
    <div className="af-ikonrutenett">
      {punkter.map((p) => (
        <button key={p.tittel} type="button" className="af-ikonpunkt" onClick={p.onClick}>
          <span className="af-ikonflis" aria-hidden><p.ikon className="w-4 h-4" /></span>
          <span className="min-w-0">
            <span className="af-ikonpunkt-tittel">{p.tittel}</span>
            {p.tekst && <span className="af-ikonpunkt-tekst">{p.tekst}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Listerad (Newbuilds Documents): ikon i 36 px flis, tittel, dempet metadata og kategori til høyre. */
export function Listerad({ ikon: Ikon, tittel, meta, kategori, onClick }: { ikon: LucideIcon; tittel: string; meta?: string; kategori?: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="af-listerad" onClick={onClick}>
      <span className="af-listeflis" aria-hidden><Ikon className="w-4 h-4" /></span>
      <span className="af-listerad-tekst">
        <span className="af-listerad-tittel">{tittel}</span>
        {meta && <span className="af-listerad-meta">{meta}</span>}
      </span>
      {kategori && <span className="af-listerad-kategori">{kategori}</span>}
      <ChevronRight className="w-4 h-4 af-listerad-pil" aria-hidden />
    </button>
  );
}

/** Segmentert kontroll (Newbuilds «Dashboard/Market»). */
export function Segment<T extends string>({ valg, verdi, onChange, etikett }: { valg: { id: T; label: string }[]; verdi: T; onChange: (v: T) => void; etikett: string }) {
  return (
    <div className="af-segment" role="tablist" aria-label={etikett}>
      {valg.map((v) => (
        <button key={v.id} type="button" role="tab" aria-selected={verdi === v.id} className={verdi === v.id ? 'af-segment-aktiv' : ''} onClick={() => onChange(v.id)}>
          {v.label}
        </button>
      ))}
    </div>
  );
}

/** Statuslinje: prikker forbundet med linjer (Newbuilds «Under development — Coming soon — For sale — Sold out»). */
export function Statuslinje({ steg, etikett }: { steg: { tekst: string; status: 'ferdig' | 'na' | 'kommer'; hjelp?: string }[]; etikett: string }) {
  return (
    <ol className="af-statuslinje" aria-label={etikett}>
      {steg.map((s, i) => (
        <li key={s.tekst} className={`af-steg af-steg-${s.status}`} title={s.hjelp}>
          {i > 0 && <span className="af-steg-linje" aria-hidden />}
          <span className="af-steg-prikk" aria-hidden />
          <span className="af-steg-tekst">{s.tekst}</span>
        </li>
      ))}
    </ol>
  );
}

/** Detaljkort (Newbuilds «Project Details»): dt/dd-par, badge øverst til høyre og en bunnlinje med grønn prikk. */
export function Detaljkort({ tittel, badge, rader, bunn }: { tittel: string; badge?: ReactNode; rader: { dt: string; dd: ReactNode }[]; bunn?: ReactNode }) {
  return (
    <aside className="af-detaljer">
      <div className="af-detaljer-hode">
        <h2 className="af-h2">{tittel}</h2>
        {badge}
      </div>
      <dl className="af-dl">
        {rader.map((r) => (
          <div key={r.dt}>
            <dt>{r.dt}</dt>
            <dd>{r.dd}</dd>
          </div>
        ))}
      </dl>
      {bunn && <div className="af-detaljer-bunn"><span className="af-prikk-gronn" aria-hidden />{bunn}</div>}
    </aside>
  );
}

/** Tynn fremdriftsstripe øverst mens en side lastes (Suspense-reserve), pluss en rolig plassholder. */
export function RuteLaster({ tekst = 'Laster …' }: { tekst?: string }) {
  return (
    <div className="af-rutelaster" role="status" aria-live="polite">
      <div className="af-rute-fremdrift" aria-hidden><span /></div>
      <div className="af-skjelett" aria-hidden>
        <span style={{ width: '38%', height: 24 }} />
        <span style={{ width: '62%' }} />
        <span style={{ width: '100%', height: 88, marginTop: 24 }} />
        <span style={{ width: '100%', height: 220 }} />
      </div>
      <span className="sr-only">{tekst}</span>
    </div>
  );
}
