import { useState } from 'react';
import { Download, Check } from 'lucide-react';

interface Props {
  onExport: () => void;
  label?: string;
  dark?: boolean; // true = lys tekst (brukes på mørk bakgrunn)
}

export function CsvExportButton({ onExport, label = 'Last ned CSV', dark = false }: Props) {
  const [done, setDone] = useState(false);

  const handleClick = () => {
    onExport();
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  const baseColor = dark ? 'rgba(255,255,255,0.15)' : 'var(--nmbu-beige-light)';
  const hoverColor = dark ? 'rgba(255,255,255,0.25)' : 'var(--nmbu-green-4)';
  const textColor = dark ? 'rgba(255,255,255,0.85)' : 'var(--nmbu-green-dark)';
  const borderColor = dark ? 'rgba(255,255,255,0.25)' : 'var(--nmbu-neutral-3)';

  return (
    <button
      onClick={handleClick}
      title="Last ned tabellen som CSV (åpnes i Excel)"
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all shrink-0"
      style={{
        backgroundColor: done ? (dark ? 'rgba(110,231,183,0.25)' : 'var(--nmbu-green-4)') : baseColor,
        color: done ? (dark ? '#6EE7B7' : 'var(--nmbu-green-dark)') : textColor,
        border: `1px solid ${done ? (dark ? 'rgba(110,231,183,0.5)' : 'var(--nmbu-green-3)') : borderColor}`,
        fontWeight: 500,
      }}
      onMouseEnter={(e) => { if (!done) (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverColor; }}
      onMouseLeave={(e) => { if (!done) (e.currentTarget as HTMLButtonElement).style.backgroundColor = done ? (dark ? 'rgba(110,231,183,0.25)' : 'var(--nmbu-green-4)') : baseColor; }}
    >
      {done
        ? <><Check className="w-3.5 h-3.5" /> Lastet ned!</>
        : <><Download className="w-3.5 h-3.5" /> {label}</>}
    </button>
  );
}
