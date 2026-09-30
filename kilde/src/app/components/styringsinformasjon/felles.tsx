/**
 * Felles byggeklosser for styringsinformasjonen («Økonomi og drift» og «Utdanning»). Sidene ser ut som arbeidsflaten
 * (sidehode, KPI-stripe, seksjoner) når oppsettet er «arbeidsflate», og som de øvrige NMBU-sidene (hvite kort,
 * var(--nmbu-…)) i de andre oppsettene. Bare var()-farger, så lys, mørk og fargetemaene fungerer.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Sparkles, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { useLayout } from '../../layoutStore';
import { AfHeader, KpiStripe, Pille, Seksjon, stig, type Kpi } from '../arbeidsflate/Byggeklosser';
import { apneKiChat } from '../arbeidsflate/navigasjon';
import { Kildeboks, type Kilde } from '../Kildeboks';

export const useAf = () => useLayout() === 'arbeidsflate';

/** Tall med norsk formatering: mellomrom som tusenskille og desimalkomma. */
export const nf = (v: number | null | undefined, d = 0) =>
  v == null || !Number.isFinite(v) ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });
export const pst = (v: number | null | undefined, d = 1) => (v == null || !Number.isFinite(v) ? '–' : `${nf(v, d)} %`);
export const mill = (v: number | null | undefined, d = 1) => (v == null || !Number.isFinite(v) ? '–' : `${nf(v, d)} mill. kr`);
/** Endring i prosent fra a til b. */
export const endringPst = (a: number | null | undefined, b: number | null | undefined) => (a == null || b == null || !a ? null : ((b - a) / Math.abs(a)) * 100);

export const AKSENT = 'var(--af-aksent, var(--nmbu-green))';
export const NED = 'var(--af-destructive, #b91c1c)';
export const OPP = 'var(--af-success, #047857)';

// ── Siden ────────────────────────────────────────────────────────────────────
/** Rammen: i arbeidsflaten med eget sidehode; ellers bare innholdet (App.tsx setter overskriften). */
export function StyringSide({ tittel, undertittel, children }: { tittel: string; undertittel: string; children: ReactNode }) {
  const af = useAf();
  if (!af) return <div className="flex flex-col gap-5 min-w-0">{children}</div>;
  return (
    <div className="af-side af-side-bred">
      <AfHeader eyebrow="Hele NMBU · Styringsinformasjon" tittel={tittel} undertittel={undertittel}
        handlinger={<Pille ikon={Sparkles} onClick={apneKiChat}>Spør KI</Pille>} />
      {children}
    </div>
  );
}

// ── Nøkkeltall ───────────────────────────────────────────────────────────────
export function Nokkeltall({ kpier, kilder, merknad }: { kpier: Kpi[]; kilder: Kilde[]; merknad?: ReactNode }) {
  const af = useAf();
  if (af) {
    return (
      <div className="af-stig" style={stig(1)}>
        <KpiStripe kpier={kpier} />
        <Kildeboks kilder={kilder} merknad={merknad} className="mt-2" />
      </div>
    );
  }
  return (
    <div>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {kpier.map((k) => (
          <div key={k.etikett} className="rounded-xl p-4 min-w-0" title={k.tittel} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--nmbu-neutral-3)' }}>
            <div className="flex items-center gap-1.5 min-w-0" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
              <k.ikon className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="truncate">{k.etikett}</span>
            </div>
            <div className="flex items-baseline flex-wrap gap-x-2 mt-1.5">
              <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--nmbu-neutral)', fontVariantNumeric: 'tabular-nums' }}>{k.verdi}</span>
              {k.endring != null && <Endring v={k.endring} />}
            </div>
            {k.hjelp && <div className="truncate" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{k.hjelp}</div>}
          </div>
        ))}
      </div>
      <Kildeboks kilder={kilder} merknad={merknad} className="mt-2" />
    </div>
  );
}

export function Endring({ v, enhet = '%', d = 1 }: { v: number; enhet?: string; d?: number }) {
  const opp = v >= 0;
  const Ikon = opp ? TrendingUp : TrendingDown;
  return (
    <span className="inline-flex items-center gap-0.5 whitespace-nowrap" style={{ fontSize: 12, fontWeight: 600, color: opp ? OPP : NED, fontVariantNumeric: 'tabular-nums' }}>
      <Ikon className="w-3 h-3" aria-hidden />{opp ? '+' : '−'}{nf(Math.abs(v), d)}{enhet ? ` ${enhet}` : ''}
    </span>
  );
}

// ── Seksjon ──────────────────────────────────────────────────────────────────
/** En del av siden: seksjon i arbeidsflaten, hvitt kort ellers. Kildeboksen står alltid nederst. */
export function Del({ tittel, ikon: Ikon, ingress, hoyre, kilder, merknad, i = 2, id, children }: {
  tittel: string; ikon?: LucideIcon; ingress?: ReactNode; hoyre?: ReactNode; kilder?: Kilde[]; merknad?: ReactNode; i?: number; id?: string; children?: ReactNode;
}) {
  const af = useAf();
  const innhold = (
    <>
      {ingress && <p className={af ? 'af-brodtekst mb-3' : 'mb-3'} style={af ? undefined : { fontSize: 13, lineHeight: 1.55, color: 'var(--nmbu-neutral-1)', maxWidth: '78ch' }}>{ingress}</p>}
      {children}
      {(kilder?.length || merknad) ? <Kildeboks kilder={kilder ?? []} merknad={merknad} /> : null}
    </>
  );
  if (af) return <Seksjon tittel={tittel} hoyre={hoyre} i={i} id={id}><div className="min-w-0">{innhold}</div></Seksjon>;
  return (
    <section id={id} className="rounded-xl p-4 sm:p-5 min-w-0" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <h2 className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: 15, color: 'var(--nmbu-green-dark)' }}>
          {Ikon && <Ikon className="w-4 h-4 shrink-0" aria-hidden />}{tittel}
        </h2>
        {hoyre}
      </div>
      {innhold}
    </section>
  );
}

/** Underoverskrift inne i en del. */
export function Undertittel({ children }: { children: ReactNode }) {
  return <h3 className="mt-4 mb-2" style={{ fontSize: 13, fontWeight: 600, color: 'var(--nmbu-neutral)' }}>{children}</h3>;
}

// ── Valgknapper (segment) ───────────────────────────────────────────────────
export function Valg<T extends string>({ valg, verdi, onChange, etikett }: { valg: { id: T; label: string }[]; verdi: T; onChange: (v: T) => void; etikett: string }) {
  const af = useAf();
  if (af) {
    return (
      <div className="af-segment" role="tablist" aria-label={etikett} style={{ maxWidth: '100%', overflowX: 'auto' }}>
        {valg.map((v) => (
          <button key={v.id} type="button" role="tab" aria-selected={verdi === v.id} className={verdi === v.id ? 'af-segment-aktiv' : ''} onClick={() => onChange(v.id)}>{v.label}</button>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={etikett}>
      {valg.map((v) => (
        <button key={v.id} type="button" role="tab" aria-selected={verdi === v.id} onClick={() => onChange(v.id)} className="px-2.5 py-1 rounded-full text-xs"
          style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: verdi === v.id ? 'var(--nmbu-green-dark)' : 'var(--card)', color: verdi === v.id ? '#fff' : 'var(--nmbu-neutral-1)' }}>
          {v.label}
        </button>
      ))}
    </div>
  );
}

// ── Tabeller ────────────────────────────────────────────────────────────────
export const TH: CSSProperties = { padding: '6px 10px', fontWeight: 600, color: 'var(--nmbu-neutral-2)', whiteSpace: 'nowrap', textAlign: 'right', verticalAlign: 'bottom' };
export const THV: CSSProperties = { ...TH, textAlign: 'left' };
export const TD: CSSProperties = { padding: '6px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', verticalAlign: 'middle' };
export const TDV: CSSProperties = { ...TD, textAlign: 'left', whiteSpace: 'normal' };

export function Tabell({ children, minBredde }: { children: ReactNode; minBredde?: number }) {
  return (
    <div className="overflow-x-auto min-w-0 -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
      <table className="w-full border-collapse text-xs" style={{ minWidth: minBredde }}>{children}</table>
    </div>
  );
}
export function Hoderad({ children }: { children: ReactNode }) {
  return <thead><tr style={{ borderBottom: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--nmbu-beige-light)' }}>{children}</tr></thead>;
}
/** Rad; NMBU-/totalrader utheves med svak aksentflate. */
export function Rad({ children, uthev, sum }: { children: ReactNode; uthev?: boolean; sum?: boolean }) {
  return (
    <tr style={{
      borderTop: sum ? '2px solid var(--nmbu-neutral-3)' : '1px solid var(--nmbu-neutral-3)', fontWeight: uthev || sum ? 600 : 400,
      backgroundColor: uthev ? 'color-mix(in srgb, var(--nmbu-green) 9%, transparent)' : undefined,
    }}>{children}</tr>
  );
}

// ── Små trendlinjer ─────────────────────────────────────────────────────────
/** Liten trendlinje uten akser (verdiene i rekkefølge; null = hull). */
export function Spark({ verdier, bredde = 72, hoyde = 20, tittel }: { verdier: (number | null | undefined)[]; bredde?: number; hoyde?: number; tittel?: string }) {
  const tall = verdier.filter((v): v is number => v != null && Number.isFinite(v));
  if (tall.length < 2) return <span style={{ color: 'var(--nmbu-neutral-2)' }}>–</span>;
  const maks = Math.max(...tall), min = Math.min(...tall);
  const x = (i: number) => (verdier.length === 1 ? bredde / 2 : (i / (verdier.length - 1)) * (bredde - 4) + 2);
  const y = (v: number) => (maks === min ? hoyde / 2 : hoyde - 3 - ((v - min) / (maks - min)) * (hoyde - 6));
  const deler: string[][] = [[]];
  verdier.forEach((v, i) => { if (v == null || !Number.isFinite(v)) { if (deler[deler.length - 1].length) deler.push([]); } else deler[deler.length - 1].push(`${x(i).toFixed(1)},${y(v).toFixed(1)}`); });
  const siste = verdier.length - 1 - [...verdier].reverse().findIndex((v) => v != null && Number.isFinite(v));
  return (
    <svg width={bredde} height={hoyde} viewBox={`0 0 ${bredde} ${hoyde}`} className="inline-block align-middle" role={tittel ? 'img' : undefined} aria-label={tittel} aria-hidden={tittel ? undefined : true}>
      {tittel && <title>{tittel}</title>}
      {deler.filter((d) => d.length > 1).map((d, i) => <polyline key={i} points={d.join(' ')} fill="none" style={{ stroke: AKSENT }} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />)}
      <circle cx={x(siste)} cy={y(verdier[siste] as number)} r={2.2} style={{ fill: AKSENT }} />
    </svg>
  );
}
/** Trendlinje med verktøytips som lister verdiene: «2021: 1 234 · 2022: …». */
export function SparkMedTekst({ aar, verdier, fmt = (v: number) => nf(v) }: { aar: (string | number)[]; verdier: (number | null | undefined)[]; fmt?: (v: number) => string }) {
  const tekst = aar.map((a, i) => `${a}: ${verdier[i] == null ? '–' : fmt(verdier[i] as number)}`).join(' · ');
  return <span title={tekst}><Spark verdier={verdier} tittel={tekst} /></span>;
}

/** Liten merkelapp (for eksempel «Framskrivning», «Anslag»). */
export function Merke({ children, tone = 'aksent', title }: { children: ReactNode; tone?: 'aksent' | 'dempet' | 'varsel'; title?: string }) {
  const bg = tone === 'aksent' ? 'color-mix(in srgb, var(--nmbu-green) 16%, transparent)' : tone === 'varsel' ? 'color-mix(in srgb, #d97706 20%, transparent)' : 'color-mix(in srgb, var(--nmbu-neutral-2) 16%, transparent)';
  return (
    <span title={title} className="inline-flex items-center rounded px-1.5 whitespace-nowrap align-middle" style={{ backgroundColor: bg, color: 'var(--nmbu-neutral)', fontSize: 10.5, fontWeight: 600, lineHeight: '18px' }}>
      {children}
    </span>
  );
}

/** Rolig melding (ingen data ennå, lastes …). */
export function Stille({ children }: { children: ReactNode }) {
  return <div className="rounded-lg px-3 py-2" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', border: '1px dashed var(--nmbu-neutral-3)' }}>{children}</div>;
}
