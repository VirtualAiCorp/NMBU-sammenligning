/**
 * Notisen under Handelshøyskolen på forsiden: hvem som står bak verktøyet og hvor man melder feil og forslag.
 * Ligger utenfor kortets knapp (en lenke kan ikke ligge inne i en knapp).
 */
export const KONTAKT_EPOST = 'mathias.sydtangen.smogeli@nmbu.no';

export function LagetAv({ kompakt = false }: { kompakt?: boolean }) {
  return (
    <p className={kompakt ? 'text-[11px] leading-snug' : 'text-xs leading-relaxed'} style={{ color: 'var(--nmbu-neutral-2)' }}>
      Verktøy laget av studierådgiverne ved Handelshøyskolen.{' '}
      Feil, mangler eller forslag til datasett som bør tas med:{' '}
      <a href={`mailto:${KONTAKT_EPOST}`} className="underline underline-offset-2 inline-block" style={{ color: 'var(--nmbu-green-dark)', whiteSpace: 'nowrap' }}>{KONTAKT_EPOST}</a>
    </p>
  );
}
