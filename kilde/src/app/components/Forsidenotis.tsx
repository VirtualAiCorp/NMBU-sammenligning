import { CalendarClock, ShieldAlert } from 'lucide-react';

/**
 * Notiser øverst på forsiden (alle oppsett):
 *  - kvalitetssikringen: bare tallene for Handelshøyskolen er gjennomgått manuelt (fra 05.10.2026, da siden ble delt
 *    med kolleger). Oppdateres når flere fakulteter er kvalitetssikret.
 *  - emnene fra våren 2026: oppdateres eller fjernes når karakterene er hentet fra DBH etter 15.10.2026.
 */
const boks = { backgroundColor: 'var(--nmbu-green-light)', border: '1px solid var(--nmbu-green-3)', color: 'var(--nmbu-neutral)' } as const;

export function Forsidenotis() {
  return (
    <div className="flex flex-col gap-2">
      <div role="note" data-notis="kvalitet" className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm" style={boks}>
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#D97706' }} />
        <span style={{ lineHeight: 1.55 }}>
          <b style={{ color: 'var(--nmbu-green-dark)' }}>Kvalitetssikring:</b> tallene for Handelshøyskolen er kontrollert manuelt.
          Tallene for de andre fakultetene og for NMBU som helhet er hentet og beregnet på samme måte fra de samme kildene, men er
          ennå ikke gjennomgått. Bruk dem med forsiktighet, og gi gjerne beskjed til studierådgiverne ved Handelshøyskolen hvis noe ser feil ut.
        </span>
      </div>
      <div role="note" className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm" style={boks}>
        <CalendarClock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--nmbu-green-dark)' }} />
        <span style={{ lineHeight: 1.55 }}>
          <b style={{ color: 'var(--nmbu-green-dark)' }}>Emner fra våren 2026:</b> karakterene blir synlige i DBH 15. oktober 2026 og overføres deretter til sammenligningssiden.
        </span>
      </div>
    </div>
  );
}
