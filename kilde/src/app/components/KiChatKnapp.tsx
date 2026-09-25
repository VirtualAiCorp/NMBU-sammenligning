import { lazy, Suspense, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import type { FacultyId } from '../data/facultyMeta';

/**
 * Knappen for KI-chatten nede i høyre hjørne. Selve chatten (søk i kildene og samtale) lastes først når den åpnes.
 */
const KiChatPanel = lazy(() => import('./KiChatPanel').then((m) => ({ default: m.KiChatPanel })));

export function KiChatKnapp({ fakultet, visning, sted }: { fakultet: FacultyId | null; visning: string; sted: string }) {
  const [apen, setApen] = useState(false);
  const [lastet, setLastet] = useState(false);
  return (
    <>
      {lastet && (
        <Suspense fallback={null}>
          <KiChatPanel apen={apen} lukk={() => setApen(false)} fakultet={fakultet} visning={visning} sted={sted} />
        </Suspense>
      )}
      <button
        onClick={() => { setLastet(true); setApen((a) => !a); }}
        aria-label={apen ? 'Lukk KI-chatten' : 'Åpne KI-chatten'}
        className={`fixed z-[60] flex items-center gap-2 rounded-full shadow-lg transition-all ${apen ? 'max-sm:hidden' : ''}`}
        style={{ right: 20, bottom: 20, padding: apen ? 14 : '12px 18px 12px 14px', backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', boxShadow: '0 6px 20px rgba(2,92,79,0.35)' }}
      >
        {apen ? <X className="w-5 h-5" /> : <><MessageCircle className="w-5 h-5" /><span className="text-sm font-semibold max-sm:hidden">Spør KI</span></>}
      </button>
    </>
  );
}
