import { useEffect, useState } from 'react';
import {
  FileText, Download, ExternalLink, ChevronDown, ChevronUp,
  CheckCircle2, Clock, MinusCircle, Globe2, Building2,
} from 'lucide-react';
import type { FacultyData, MarketInstitution, MarketDoc } from '../data/faculties';
import { landsamColorForGroups } from '../data/landsamPalette';
import { StyrepapirSok } from './StyrepapirSok';
import { StrategierMot2030 } from './StrategierMot2030';

/** Fakulteter med strategigjennomgang (public/markedsstatus/<id>/strategier.json, scripts/build-strategier.py). */
const MED_STRATEGIER = new Set(['hh']);

interface Props {
  /** Fakultetet som skal vises — markedsstatusen leses herfra. */
  faculty: FacultyData;
}

const STATUS_TEKST: Record<MarketInstitution['status'], string> = {
  complete: 'Rapport tilgjengelig',
  partial:  'Delvis',
  none:     'Ingen offentlige styrepapirer',
};

/** Lyse bakgrunns- og kantfarger avledet av institusjonsfargen. */
const lightOf  = (farge: string) => farge + '0f';
const borderOf = (farge: string) => farge + '40';

function StatusMerke({ status, farge }: { status: MarketInstitution['status']; farge: string }) {
  const Ikon = status === 'complete' ? CheckCircle2 : status === 'partial' ? Clock : MinusCircle;
  const nøytral = status === 'none';
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
      style={
        nøytral
          ? { backgroundColor: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB', fontWeight: 600 }
          : { backgroundColor: farge + '18', color: farge, fontWeight: 600 }
      }
    >
      <Ikon className="w-3 h-3" /> {STATUS_TEKST[status]}
    </span>
  );
}

function DokumentRad({ dok, farge, kant, forste }: { dok: MarketDoc; farge: string; kant: string; forste: boolean }) {
  const lokal = Boolean(dok.localPath);
  const href = dok.localPath ?? dok.url;
  const detaljer = [
    dok.dato,
    dok.storrelseMB != null ? `${dok.storrelseMB.toLocaleString('nb-NO', { maximumFractionDigits: 1 })} MB` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div
      className="px-5 py-2.5 flex items-center gap-3"
      style={{ borderTop: forste ? undefined : `1px solid ${kant}` }}
    >
      <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: farge, opacity: 0.7 }} />
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 12, color: '#6B7280' }}>{dok.label}</div>
        {detaljer && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{detaljer}</div>}
      </div>
      {href ? (
        <a
          href={href}
          {...(lokal
            ? { download: dok.localPath!.split('/').pop() || undefined }
            : { target: '_blank', rel: 'noopener noreferrer' })}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all shrink-0"
          style={{ backgroundColor: farge, color: '#fff', fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.82'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
        >
          {lokal ? <Download className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
          {lokal ? 'Last ned' : 'Åpne'}
        </a>
      ) : (
        <span style={{ fontSize: 11, color: '#9CA3AF' }}>Ingen lenke</span>
      )}
    </div>
  );
}

function InstitusjonsKort({
  inst, farge, programNavn,
}: { inst: MarketInstitution; farge: string; programNavn: (id: string) => string }) {
  const [utvidet, setUtvidet] = useState(inst.status === 'complete');
  const lys = lightOf(farge);
  const kant = borderOf(farge);
  const harInnhold = inst.punkter.length > 0 || Boolean(inst.oppsummering);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: inst.status === 'none' ? `1.5px dashed ${kant}` : `1.5px solid ${kant}`,
        backgroundColor: '#fff',
        boxShadow: inst.status === 'none' ? undefined : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Kortoverskrift */}
      <div className="px-5 py-4" style={{ backgroundColor: lys, borderBottom: `1px solid ${kant}` }}>
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: inst.status === 'none' ? farge + '22' : farge }}
          >
            {inst.status === 'none'
              ? <Building2 className="w-5 h-5" style={{ color: farge }} />
              : <FileText className="w-5 h-5 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span style={{ fontWeight: 700, fontSize: 18, color: farge }}>{inst.name}</span>
              <StatusMerke status={inst.status} farge={farge} />
              {inst.dokumenter.length > 0 && (
                <span style={{ fontSize: 11, color: '#6B7280' }}>
                  {inst.dokumenter.length} dokument{inst.dokumenter.length !== 1 ? 'er' : ''}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: farge + 'bb' }}>{inst.fullName}</div>
            {inst.enhet && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>{inst.enhet}</div>}
          </div>
        </div>

        {inst.styresider.length > 0 && (
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {inst.styresider.map((lenke, i) => (
              <a
                key={i}
                href={lenke}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:underline inline-flex items-center gap-1"
                style={{ color: farge, fontWeight: 500 }}
              >
                Styresider{inst.styresider.length > 1 ? ` ${i + 1}` : ''} ↗
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Nøkkelpunkter */}
      {harInnhold && (
        <div className="px-5 py-4">
          {inst.punkter.length > 0 && (
            <>
              <button
                onClick={() => setUtvidet((v) => !v)}
                className="flex items-center gap-2 w-full text-left mb-3"
                style={{ color: farge }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Nøkkelpunkter
                </span>
                <span className="ml-auto">
                  {utvidet ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {utvidet ? (
                <ol className="space-y-2.5">
                  {inst.punkter.map((punkt, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white"
                        style={{ backgroundColor: farge, fontSize: 10, fontWeight: 700, minWidth: 20 }}
                      >
                        {i + 1}
                      </span>
                      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{punkt}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                  {inst.punkter.length} punkter — klikk for å vise
                </p>
              )}
            </>
          )}

          {inst.oppsummering && (
            <p
              style={{
                fontSize: 13, color: '#4B5563', lineHeight: 1.6,
                marginTop: inst.punkter.length > 0 ? 14 : 0,
                paddingLeft: 12, borderLeft: `3px solid ${kant}`,
              }}
            >
              {inst.oppsummering}
            </p>
          )}
        </div>
      )}

      {/* Dokumenter */}
      {inst.dokumenter.length > 0 && (
        <div style={{ borderTop: `1px solid ${kant}`, backgroundColor: lys }}>
          {inst.dokumenter.map((dok, i) => (
            <DokumentRad key={i} dok={dok} farge={farge} kant={kant} forste={i === 0} />
          ))}
        </div>
      )}

      {/* Relevante program */}
      {inst.relevanteProgram.length > 0 && (
        <div
          className="px-5 py-3 flex items-center gap-2 flex-wrap"
          style={{ borderTop: `1px solid ${kant}`, backgroundColor: '#fff' }}
        >
          <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Relevante program
          </span>
          {inst.relevanteProgram.map((id) => (
            <span
              key={id}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: farge + '12', color: farge, fontWeight: 500 }}
            >
              {programNavn(id)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function FacultyMarketStatus({ faculty }: Props) {
  const [del, setDel] = useState<'status' | 'strategier'>(() => (typeof location !== 'undefined' && location.hash === '#strategier' ? 'strategier' : 'status'));
  // #strategier i adressen følger fanen begge veier, og fjernes når siden forlates (ellers åpner neste besøk feil fane)
  useEffect(() => {
    const f = () => setDel(location.hash === '#strategier' ? 'strategier' : 'status');
    window.addEventListener('hashchange', f);
    return () => {
      window.removeEventListener('hashchange', f);
      if (location.hash === '#strategier') history.replaceState(null, '', location.pathname + location.search);
    };
  }, []);
  const velgDel = (d: 'status' | 'strategier') => {
    setDel(d);
    history.replaceState(null, '', d === 'strategier' ? '#strategier' : location.pathname + location.search);
  };
  const institusjoner = faculty.marketStatus;
  const colorFor = landsamColorForGroups(faculty.admissionGroups);

  /** Slår opp programnavn fra opptaksdataene; ukjente id-er vises som de er. */
  const programNavn = (id: string): string => {
    for (const gruppe of faculty.admissionGroups) {
      const entry = gruppe.entries.find((e) => e.id === id);
      if (entry) return `${gruppe.label} · ${entry.shortName}`;
    }
    return id;
  };

  const antallDok = institusjoner.reduce((sum, i) => sum + i.dokumenter.length, 0);
  const medRapport = institusjoner.filter((i) => i.status !== 'none').length;

  const velger = MED_STRATEGIER.has(faculty.id) && (
    <div className="inline-flex rounded-full p-1" role="tablist" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: 'var(--card)' }}>
      {([['status', 'Styrepapirer og status'], ['strategier', 'Strategier mot 2030']] as const).map(([id, tekst]) => (
        <button key={id} role="tab" aria-selected={del === id} onClick={() => velgDel(id)} className="px-4 py-1.5 rounded-full text-sm"
          style={{ backgroundColor: del === id ? 'var(--nmbu-green-dark)' : 'transparent', color: del === id ? '#fff' : 'var(--nmbu-neutral-1)', fontWeight: del === id ? 600 : 500 }}>
          {tekst}
        </button>
      ))}
    </div>
  );
  if (velger && del === 'strategier') return <div className="space-y-4">{velger}<StrategierMot2030 fakultet={faculty.id} /></div>;

  return (
    <div className="space-y-6">
      {velger}
      {/* Overskrift */}
      <div
        className="rounded-xl p-6"
        style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}
      >
        <h2 className="text-2xl mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
          Markedsstatus
        </h2>
        <p className="text-sm max-w-2xl" style={{ color: 'var(--nmbu-neutral-1)' }}>
          Status og utvikling hos konkurrerende institusjoner — basert på styrepapirer.
          Gir grunnlag for å vurdere {faculty.shortLabel} sin posisjon i markedet.
        </p>
        <div className="flex items-center gap-4 mt-4 text-xs flex-wrap" style={{ color: 'var(--nmbu-neutral-2)' }}>
          <span className="flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5" style={{ color: 'var(--nmbu-green-dark)' }} />
            {institusjoner.length} institusjon{institusjoner.length !== 1 ? 'er' : ''}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--nmbu-green-dark)' }} />
            {medRapport} med styrepapirer
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
            {antallDok} dokument{antallDok !== 1 ? 'er' : ''}
          </span>
          {faculty.marketStatusHentet && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
              Hentet {faculty.marketStatusHentet}
            </span>
          )}
        </div>
      </div>

      {institusjoner.length > 0 && <StyrepapirSok fakultet={faculty.id} fakultetNavn={faculty.label} institusjonsdata={institusjoner} />}

      {/* Institusjonskort */}
      {institusjoner.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{ border: '1.5px dashed var(--nmbu-neutral-3)', backgroundColor: '#fff' }}
        >
          <Globe2 className="w-6 h-6 mx-auto mb-3" style={{ color: 'var(--nmbu-neutral-2)' }} />
          <p style={{ fontSize: 13, color: 'var(--nmbu-neutral-2)' }}>
            Ingen styrepapirer samlet inn ennå for dette fakultetet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {institusjoner.map((inst) => (
            <InstitusjonsKort
              key={inst.id}
              inst={inst}
              farge={colorFor(inst.id)}
              programNavn={programNavn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
