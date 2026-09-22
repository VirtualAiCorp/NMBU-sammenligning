import type { Accreditation } from '../data/courseMapping';

const BADGE_STYLE: Record<Accreditation, React.CSSProperties> = {
  AACSB: { backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', borderColor: 'var(--nmbu-green-3)' },
  EQUIS: { backgroundColor: '#f3edf0', color: 'var(--nmbu-purple)', borderColor: '#c59aae' },
  AMBA:  { backgroundColor: 'var(--nmbu-beige)', color: '#5c4a1e', borderColor: '#c2b99a' },
};

interface AccreditationBadgeProps {
  accreditations: Accreditation[];
  size?: 'sm' | 'xs';
}

export function AccreditationBadge({ accreditations, size = 'xs' }: AccreditationBadgeProps) {
  if (!accreditations.length) return null;
  const padding = size === 'sm' ? 'px-1 py-px text-[10px]' : 'px-1 py-0 text-[8px]';
  return (
    <span className="inline-flex gap-1 flex-wrap">
      {accreditations.map((a) => (
        <span
          key={a}
          title={`Akkreditert av ${a}`}
          className={`inline-block rounded border font-semibold leading-tight tracking-wide ${padding}`}
          style={BADGE_STYLE[a]}
        >
          {a}
        </span>
      ))}
    </span>
  );
}
