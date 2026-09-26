import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import type { FacultyId } from '../data/facultyMeta';

export type KiModus = 'flytende' | 'side' | 'stor';
/** fakultet er et fakultet eller en side for hele NMBU («nmbu-fagmiljo», «nmbu-sokergrunnlag») */
export type KiNaviger = (fakultet: string, visning: string, gruppe?: string) => void;
const lesModus = (): KiModus => { try { const m = localStorage.getItem('ki-chat-modus'); return m === 'side' || m === 'stor' ? m : 'flytende'; } catch { return 'flytende'; } };

/**
 * Knappen for KI-chatten nede i høyre hjørne. Selve chatten (søk i kildene og samtale) lastes først når den åpnes.
 */
const KiChatPanel = lazy(() => import('./KiChatPanel').then((m) => ({ default: m.KiChatPanel })));

export function KiChatKnapp({ fakultet, visning, sted, naviger, gruppe }: { fakultet: FacultyId | null; visning: string; sted: string; naviger: KiNaviger; gruppe?: string }) {
  const [apen, setApen] = useState(false);
  const [modus, setModusState] = useState<KiModus>(lesModus);
  const setModus = (m: KiModus) => { setModusState(m); try { localStorage.setItem('ki-chat-modus', m); } catch { /* ikke lagret */ } };
  const [lastet, setLastet] = useState(false);
  // Når chatten lukkes, får knappen fokus igjen (tastatur og skjermleser mister ikke plassen)
  const knapp = useRef<HTMLButtonElement>(null);
  const varApen = useRef(false);
  useEffect(() => { if (varApen.current && !apen) setTimeout(() => knapp.current?.focus(), 0); varApen.current = apen; }, [apen]);
  return (
    <>
      {lastet && (
        <Suspense fallback={null}>
          <KiChatPanel apen={apen} lukk={() => setApen(false)} fakultet={fakultet} visning={visning} sted={sted} modus={modus} setModus={setModus} naviger={naviger} gruppe={gruppe} />
        </Suspense>
      )}
      <button
        ref={knapp}
        onClick={() => { setLastet(true); setApen((a) => !a); }}
        aria-label={apen ? 'Lukk KI-chatten' : 'Åpne KI-chatten'}
        className={`fixed z-[60] flex items-center gap-2 rounded-full shadow-lg transition-all duration-300 ${apen ? 'max-sm:hidden' : ''} ${apen && modus !== 'flytende' ? 'sm:hidden' : ''}`}
        style={{ right: 20, bottom: 20, padding: apen ? 14 : '12px 18px 12px 14px', backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', boxShadow: '0 6px 20px rgba(2,92,79,0.35)' }}
      >
        {apen ? <X key="x" className="w-5 h-5 ki-ikon-inn" /> : <><MessageCircle key="m" className="w-5 h-5 ki-ikon-inn" /><span className="text-sm font-semibold max-sm:hidden">Spør KI</span></>}
      </button>
    </>
  );
}
