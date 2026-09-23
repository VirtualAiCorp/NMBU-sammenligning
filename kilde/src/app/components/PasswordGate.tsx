import { useState, type FormEvent, type ReactNode } from 'react';
import { Lock } from 'lucide-react';

/**
 * Enkel passordsperre foran en del av appen. Passordet settes i kilde/.env.local
 * som VITE_HH_PASSORD (standard «nmbu» hvis ikke satt). Låst opp for fanen
 * (sessionStorage) til fanen lukkes. Med `compact` rendres sperren som et kort
 * inne i siden (uten fullskjerm og tilbakeknapp), f.eks. rundt én fane.
 *
 * Merk: dette er en visningssperre for intern demo. Innholdet ligger fortsatt i
 * den bygde JavaScript-en, så sperren beskytter ikke mot noen som leser kildekoden.
 */
const PASSORD = (import.meta.env.VITE_HH_PASSORD as string | undefined) || 'nmbu';

function isUnlocked(key: string): boolean {
  try { return sessionStorage.getItem(key) === '1'; } catch { return false; }
}

interface Props {
  storageKey: string;
  title: string;
  onBack?: () => void;
  compact?: boolean;
  intro?: string;
  children: ReactNode;
}

export function PasswordGate({ storageKey, title, onBack, compact = false, intro, children }: Props) {
  const [unlocked, setUnlocked] = useState(() => isUnlocked(storageKey));
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value === PASSORD) {
      try { sessionStorage.setItem(storageKey, '1'); } catch { /* ignorer */ }
      setUnlocked(true);
    } else {
      setError(true);
      setValue('');
    }
  };

  return (
    <div className={compact ? 'flex flex-col items-center py-10' : 'min-h-screen flex flex-col items-center justify-center p-6'}
      style={compact ? undefined : { backgroundColor: 'var(--nmbu-beige-light)' }}>
      <div className="w-full" style={{ maxWidth: 420 }}>
        {onBack && (
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)' }}
            >
              ← Fakulteter
            </button>
          </div>
        )}
        <form
          onSubmit={submit}
          className="rounded-2xl p-8"
          style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 2px 8px rgba(2,92,79,0.08)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--nmbu-green-4)' }}>
              <Lock className="w-5 h-5" style={{ color: 'var(--nmbu-green-dark)' }} />
            </div>
            <div style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '20px', color: 'var(--nmbu-green-dark)' }}>{title}</div>
          </div>
          <p className="mb-4" style={{ fontSize: '13px', color: 'var(--nmbu-neutral-2)', lineHeight: 1.5 }}>
            {intro ?? 'Denne delen er passordbeskyttet. Skriv inn passordet for å fortsette.'}
          </p>
          <input
            type="password"
            autoFocus
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="Passord"
            className="w-full rounded-lg px-3 py-2 mb-3 outline-none"
            style={{ border: `1px solid ${error ? '#c0392b' : 'var(--nmbu-neutral-3)'}`, fontSize: '14px', color: 'var(--nmbu-neutral-1)' }}
          />
          {error && (
            <div className="mb-3" style={{ fontSize: '12px', color: '#c0392b' }}>Feil passord.</div>
          )}
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-sm font-medium transition-all"
            style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}
          >
            Lås opp
          </button>
        </form>
      </div>
    </div>
  );
}
