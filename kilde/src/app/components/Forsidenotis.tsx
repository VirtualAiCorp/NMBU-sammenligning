import { CalendarClock } from 'lucide-react';

/**
 * Notis øverst på forsiden. Oppdateres eller fjernes når dataene er hentet (karakterer for våren 2026 fra DBH etter 15.10.2026).
 */
export function Forsidenotis() {
  return (
    <div role="note" className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
      style={{ backgroundColor: 'var(--nmbu-green-light)', border: '1px solid var(--nmbu-green-3)', color: 'var(--nmbu-neutral)' }}>
      <CalendarClock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--nmbu-green-dark)' }} />
      <span style={{ lineHeight: 1.55 }}>
        <b style={{ color: 'var(--nmbu-green-dark)' }}>Emner fra våren 2026:</b> karakterene blir synlige i DBH 15. oktober 2026 og overføres deretter til sammenligningssiden.
      </span>
    </div>
  );
}
