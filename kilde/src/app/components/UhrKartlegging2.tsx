import { useEffect, useMemo, useState } from 'react';
import { Layers, ExternalLink, Info } from 'lucide-react';
import { UHR_GROUPS as UHR_V1, COURSE_MAPPING as V1 } from '../data/courseMapping';
import { UHR_GROUPS, COURSE_MAPPING as V2, UNIVERSITY_INFO, type CourseEntry } from '../data/courseMapping2';
import { UhrOaStudierett } from './UhrOaStudierett';

/**
 * UHR-kartlegging 2.0: UHR-ØAs minimumskrav (2018) mot emnene ved hver BØA-tilbyder, med rettelsene fra
 * UHR-gjennomgangen 17.10.2026 (courseMapping2.ts) side om side med den opprinnelige kartleggingen (courseMapping.ts,
 * uendret). Status, bevis og antall ØA-kandidater kommer fra public/uhr/gjennomgang.json (scripts/build-coursemapping-v2.py).
 */

interface Forslag { kode: string; navn: string; sp: number; aarFra?: number; aarTil?: number }
interface Omraade { status?: string; sikkerhet?: string; bevis?: string; forslag?: Forslag[]; oaKandidater?: Record<string, number> | null }
interface KravOmraade { id: string; navn: string; min: number; maks: number; skalInneholde: string[]; merknad?: string }
interface Data {
  generert?: string;
  uhrKrav: { kilde: { tittel: string; vedtattAv: string; dato: string; url: string }; totalt: { okonomiskAdministrativeFagMin: number; sumAvMinimumene: number; kommentar: string }; omraader: KravOmraade[] };
  institusjoner: Record<string, { program?: string; omraader: Record<string, Omraade> }>;
}

let last: Promise<Data | null> | null = null;
const hent = () => (last ??= fetch(`${import.meta.env.BASE_URL}uhr/gjennomgang.json`).then((r) => (r.ok ? r.json() : null)).catch(() => { last = null; return null; }));

const nf = (v: number | null | undefined, d = 1) => (v == null ? '–' : v.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: d }));
const spTall = (e?: CourseEntry) => (e ? parseFloat(e.credits.replace(',', '.')) || 0 : 0);

const STATUS: Record<string, { tekst: string; bg: string; fg: string }> = {
  OK: { tekst: 'OK', bg: '#DCFCE7', fg: '#166534' },
  STUDIEPOENG: { tekst: 'Studiepoeng', bg: '#FEF3C7', fg: '#92400E' },
  FEIL: { tekst: 'Feil emne', bg: '#FEE2E2', fg: '#991B1B' },
  DELVIS: { tekst: 'Delvis', bg: '#E0E7FF', fg: '#3730A3' },
  UTGÅTT: { tekst: 'Utgått kode', bg: '#F3E8FF', fg: '#6B21A8' },
  MANGLER: { tekst: 'Manglet', bg: '#F3F4F6', fg: '#374151' },
};
/** Grupperingen i courseMapping2 → kravområdet i UHR-planen. */
const KRAV_ID: Record<string, string> = { bedriftsokonomisk: 'bedriftsokonomisk', administrasjon: 'administrasjon', samfunnsokonomi: 'samfunnsokonomi', metodefag: 'metodefag', etikk: 'etikk' };

const th = 'px-3 py-2 text-left whitespace-nowrap';
const thead = { backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' };
const kort = { backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' };

function Merke({ status }: { status?: string }) {
  const s = status ? STATUS[status] : undefined;
  if (!s) return null;
  return <span className="px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap" style={{ backgroundColor: s.bg, color: s.fg, fontWeight: 700 }}>{s.tekst}</span>;
}

export function UhrKartlegging2() {
  const [data, setData] = useState<Data | null | undefined>(undefined);
  useEffect(() => { let aktiv = true; hent().then((d) => { if (aktiv) setData(d); }); return () => { aktiv = false; }; }, []);
  const institusjoner = useMemo(() => Object.keys(UNIVERSITY_INFO).filter((k) => UHR_GROUPS.some((g) => g.courses.some((c) => V2[c.id]?.[k]))), []);
  const [inst, setInst] = useState('nmbu');

  // Oversikt: antall endringer per institusjon (2.0 mot originalen)
  const endringer = useMemo(() => Object.fromEntries(institusjoner.map((k) => {
    let n = 0;
    for (const g of UHR_GROUPS) for (const c of g.courses) {
      const a = (V1 as Record<string, Record<string, CourseEntry>>)[c.id]?.[k], b = V2[c.id]?.[k];
      if (!a !== !b || (a && b && (a.displayCode !== b.displayCode || a.credits !== b.credits))) n++;
    }
    return [k, n];
  })), [institusjoner]);

  if (data === undefined) return <div className="rounded-xl p-5 text-sm" style={kort}>Laster UHR-gjennomgangen …</div>;
  const g = data?.institusjoner[inst];
  const krav = data?.uhrKrav;
  const navn = (k: string) => UNIVERSITY_INFO[k]?.shortName ?? k;

  return (
    <div className="space-y-5">
      {krav && (
        <div className="rounded-xl p-5" style={kort}>
          <div className="flex items-center gap-2 mb-1" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}><Layers className="w-4 h-4" /> UHR-kravet til bachelor i økonomi og administrasjon</div>
          <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-1)', marginBottom: 10 }}>
            {krav.kilde.vedtattAv}, «{krav.kilde.tittel}» ({krav.kilde.dato}) <a href={krav.kilde.url} target="_blank" rel="noreferrer" className="underline">PDF <ExternalLink className="w-3 h-3 inline" /></a>.
            {' '}Minst <b>{krav.totalt.okonomiskAdministrativeFagMin} sp</b> av de 180 skal ligge innen de fem fagområdene. Minimumene per område summerer til {nf(krav.totalt.sumAvMinimumene)} sp, så resten kan legges i hvilket som helst av områdene opp til maksimum.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {krav.omraader.map((o) => (
              <div key={o.id} className="rounded-lg p-3" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{o.navn}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{nf(o.min)}–{nf(o.maks)} sp</div>
                <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>{o.skalInneholde.length ? `Skal inneholde ${o.skalInneholde.join(', ')}` : o.merknad}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-1.5" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Den opprinnelige kartleggingen (Opprinnelig HH-analyse) har {UHR_V1.length} fagområder med {UHR_V1.reduce((n, g) => n + g.courses.length, 0)} emneområder og mangler etikk, samfunnsansvar og bærekraft. Den står uendret; rettelsene ligger bare i denne 2.0-varianten.
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <span style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>Institusjon:</span>
        {institusjoner.map((k) => (
          <button key={k} onClick={() => setInst(k)} className="px-2.5 py-0.5 rounded-full text-xs"
            style={k === inst ? { backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', fontWeight: 600 } : { backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' }}
            title={`${endringer[k]} endringer mot den opprinnelige kartleggingen`}>
            {navn(k)}{endringer[k] > 0 && <span style={{ opacity: 0.7 }}> · {endringer[k]}</span>}
          </button>
        ))}
      </div>

      <div className="rounded-xl p-5" style={kort}>
        <div className="flex flex-wrap items-baseline gap-x-3 mb-1">
          <span style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{UNIVERSITY_INFO[inst]?.name ?? inst}</span>
          {g?.program && <span style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>{g.program}</span>}
          {UNIVERSITY_INFO[inst]?.programUrl && <a href={UNIVERSITY_INFO[inst].programUrl} target="_blank" rel="noreferrer" className="underline" style={{ fontSize: 12 }}>studieplan <ExternalLink className="w-3 h-3 inline" /></a>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginBottom: 10 }}>
          «2.0» er kartleggingen etter gjennomgangen. «Opprinnelig» vises bare der den avviker. «Funn» er det gjennomgangen fant i den opprinnelige kartleggingen; sikre funn er rettet i 2.0. ØA-kandidater er antall med karakter på emnet blant studentene med ØA-studierett (DBH 308 per program), siste år.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={thead}>
                <th className={th}>UHR-område</th><th className={th}>2.0</th><th className="px-3 py-2 text-right">Sp</th>
                <th className={th}>Opprinnelig</th><th className={th} title="Hva gjennomgangen fant i den opprinnelige kartleggingen">Funn</th><th className="px-3 py-2 text-right">ØA-kand.</th><th className={th}>Merknad og forslag som ikke er lagt inn</th>
              </tr>
            </thead>
            <tbody>
              {UHR_GROUPS.map((gr) => {
                const kr = krav?.omraader.find((o) => o.id === KRAV_ID[gr.id]);
                const sum = gr.courses.reduce((s, c) => s + spTall(V2[c.id]?.[inst]), 0);
                return [
                  <tr key={gr.id} style={{ backgroundColor: 'var(--nmbu-beige-light)', borderTop: '2px solid var(--nmbu-neutral-3)' }}>
                    <td colSpan={7} className="px-3 py-1.5" style={{ fontWeight: 700 }}>
                      {gr.label} <span style={{ fontWeight: 400, color: 'var(--nmbu-neutral-2)' }}>· kartlagt {nf(sum)} sp{kr && <> · UHR {nf(kr.min)}–{nf(kr.maks)} sp</>}{kr && sum < kr.min && <span style={{ color: '#B45309' }}> · under minimum i de kartlagte emnene</span>}</span>
                    </td>
                  </tr>,
                  ...gr.courses.map((c) => {
                    const ny = V2[c.id]?.[inst];
                    const gml = (V1 as Record<string, Record<string, CourseEntry>>)[c.id]?.[inst];
                    const o = g?.omraader[c.id];
                    const avvik = !gml !== !ny || (gml && ny && (gml.displayCode !== ny.displayCode || gml.credits !== ny.credits));
                    const aar = o?.oaKandidater ? Object.keys(o.oaKandidater).sort().pop() : undefined;
                    const ikkeLagtInn = (o?.forslag ?? []).filter((f) => ny && f.kode.toUpperCase() !== ny.displayCode.toUpperCase());
                    return (
                      <tr key={c.id} style={{ borderTop: '1px solid var(--nmbu-neutral-3)', verticalAlign: 'top' }}>
                        <td className="px-3 py-1.5 whitespace-nowrap">{c.label}</td>
                        <td className="px-3 py-1.5">{ny ? <><b>{ny.displayCode}</b> {ny.courseName}{!ny.verified && <span style={{ color: '#B45309' }}> (usikker)</span>}</> : <span style={{ color: 'var(--nmbu-neutral-2)' }}>–</span>}</td>
                        <td className="px-3 py-1.5 text-right whitespace-nowrap">{ny?.credits.replace(' sp', '') ?? '–'}</td>
                        <td className="px-3 py-1.5" style={{ color: 'var(--nmbu-neutral-2)' }}>{avvik ? (gml ? <span style={{ textDecoration: 'line-through' }}>{gml.displayCode} · {gml.credits}</span> : 'ikke kartlagt') : ''}</td>
                        <td className="px-3 py-1.5"><Merke status={o?.status} /></td>
                        <td className="px-3 py-1.5 text-right whitespace-nowrap">{aar ? <>{nf(o!.oaKandidater![aar], 0)} <span style={{ color: 'var(--nmbu-neutral-2)' }}>({aar})</span></> : '–'}</td>
                        <td className="px-3 py-1.5" style={{ color: 'var(--nmbu-neutral-1)', maxWidth: 420 }}>
                          {ny?.note && <div>{ny.note}</div>}
                          {o?.bevis && !ny?.note && <div style={{ color: 'var(--nmbu-neutral-2)' }}>{o.bevis}</div>}
                          {ikkeLagtInn.length > 0 && (
                            <div style={{ color: 'var(--nmbu-neutral-2)' }}>
                              {ikkeLagtInn.map((f) => `${f.kode} ${f.navn} (${nf(f.sp)} sp${f.aarFra ? `, fra ${f.aarFra}` : ''}${f.aarTil ? `, til ${f.aarTil}` : ''})`).join(' · ')}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  }),
                ];
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-2" style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)' }}>
          Kilde: UHR-ØA (2018), studieplanene og DBH/HK-dir tabell 308 og 208. Gjennomgangen er gjort {data?.generert ? new Date(data.generert).toLocaleDateString('nb-NO') : '17.10.2026'}.
          Emner som også dekker et område (for eksempel organisasjon 1 og 2) og forgjengerkoder for eldre år står under «forslag som ikke er lagt inn». De krever at et område kan ha flere emner, og det kommer i neste steg.
        </div>
      </div>

      <UhrOaStudierett />
    </div>
  );
}
