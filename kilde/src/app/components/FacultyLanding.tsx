import type { ReactNode } from 'react';
import { Building2, Trees, Lock } from 'lucide-react';

export type Faculty = 'hh' | 'landsam';

interface Props {
  onSelect: (faculty: Faculty) => void;
}

const ACTIVE_FACULTIES: {
  id: Faculty;
  icon: ReactNode;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
}[] = [
  {
    id: 'hh',
    icon: <Building2 className="w-5 h-5" style={{ color: 'var(--nmbu-green-dark)' }} />,
    badge: 'Handelshøyskolen',
    title: 'Handelshøyskolen',
    subtitle: 'Økonomi og administrasjon, samfunnsøkonomi, årsstudier',
    desc: 'Opptakstall, poenggrenser, emnekarakterer, karakterindeks, Studiebarometeret og markedsstatus for bachelor, master og årsstudier — sammenlignet med alle norske universiteter og høyskoler.',
  },
  {
    id: 'landsam',
    icon: <Trees className="w-5 h-5" style={{ color: 'var(--nmbu-green-dark)' }} />,
    badge: 'LANDSAM',
    title: 'Fakultet for landskap og samfunn',
    subtitle: 'Eiendom, landskapsarkitektur, by- og regionplanlegging m.fl.',
    desc: 'Opptakstall og poenggrenser for fakultetets studieprogram sammenlignet med konkurrerende program.',
  },
];

const COMING_FACULTIES: { id: string; label: string; sub: string }[] = [
  { id: 'biovit',  label: 'BIOVIT',  sub: 'Biovitenskap' },
  { id: 'kbm',     label: 'KBM',     sub: 'Kjemi, bioteknologi og matvitenskap' },
  { id: 'mina',    label: 'MINA',    sub: 'Miljøvitenskap og naturforvaltning' },
  { id: 'realtek', label: 'REALTEK', sub: 'Realfag og teknologi' },
  { id: 'vet',     label: 'VET',     sub: 'Veterinærmedisin' },
];

export function FacultyLanding({ onSelect }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
      <div className="max-w-3xl w-full">
        <div className="flex flex-col items-center gap-1 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 rounded-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)' }} />
            <h1 style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '2rem', color: 'var(--nmbu-green-dark)' }}>
              NMBU
            </h1>
          </div>
        </div>
        <p className="text-center mb-10" style={{ color: 'var(--nmbu-neutral-2)', fontSize: '14px', maxWidth: 520, margin: '0 auto 2.5rem' }}>
          Sammenligning av opptak, karakterer og studiekvalitet per fakultet
        </p>

        {/* Aktive fakulteter */}
        <div className="grid grid-cols-2 gap-5 mb-8">
          {ACTIVE_FACULTIES.map((card) => (
            <button key={card.id}
              onClick={() => onSelect(card.id)}
              className="rounded-2xl p-8 text-left transition-all"
              style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 2px 8px rgba(2,92,79,0.08)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(2,92,79,0.16)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(2,92,79,0.08)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--nmbu-green-4)' }}>
                  {card.icon}
                </div>
                <div className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}>
                  {card.badge}
                </div>
              </div>
              <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '20px', color: 'var(--nmbu-green-dark)', marginBottom: 6 }}>{card.title}</div>
              <div style={{ fontSize: '15px', color: 'var(--nmbu-neutral-1)', marginBottom: 12 }}>{card.subtitle}</div>
              <p style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.5 }}>{card.desc}</p>
            </button>
          ))}
        </div>

        {/* Skillelinje */}
        <div className="flex items-center gap-4 mb-5">
          <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--nmbu-neutral-2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Øvrige fakulteter
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: 'var(--nmbu-neutral-3)' }} />
        </div>

        {/* Kommer-fakulteter */}
        <div className="grid grid-cols-5 gap-3">
          {COMING_FACULTIES.map((f) => (
            <div key={f.id}
              className="rounded-xl p-4 text-left"
              style={{ backgroundColor: '#fff', border: '1px dashed var(--nmbu-neutral-3)', opacity: 0.6, cursor: 'not-allowed' }}
              title="Kommer"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Lock className="w-3 h-3" style={{ color: 'var(--nmbu-neutral-2)' }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--nmbu-neutral-2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Kommer
                </span>
              </div>
              <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '14px', color: 'var(--nmbu-neutral-1)', marginBottom: 3 }}>{f.label}</div>
              <div style={{ fontSize: '10px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.4 }}>{f.sub}</div>
            </div>
          ))}
        </div>

        {/* Footer notice */}
        <div className="mt-10 text-center" style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)' }}>
          Feil, forslag til endringer eller utvidelse av datasett?{' '}
          Kontakt:{' '}
          <a
            href="mailto:mathias.sydtangen.smogeli@nmbu.no"
            style={{ color: 'var(--nmbu-green-dark)', fontWeight: 500, textDecoration: 'none' }}
          >
            mathias.sydtangen.smogeli@nmbu.no
          </a>
        </div>
      </div>
    </div>
  );
}
