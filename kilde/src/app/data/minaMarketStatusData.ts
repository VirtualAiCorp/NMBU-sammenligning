// GENERERT av scripts/build-markedsstatus.py ukjent dato – ikke rediger for hånd.
// Kilde: data/mina/markedsstatus.json · PDF-er i kilde/public/markedsstatus/mina/

export interface MarketDoc {
  label: string;
  url: string;
  localPath: string | null;
  dato: string | null;
  storrelseMB: number | null;
}

export interface MarketInstitution {
  id: string;
  name: string;
  fullName: string;
  enhet: string | null;
  styresider: string[];
  status: 'complete' | 'partial' | 'none';
  dokumenter: MarketDoc[];
  punkter: string[];
  oppsummering: string | null;
  relevanteProgram: string[];
}

export const MARKET_STATUS_HENTET: string | null = null;

export const MARKET_STATUS: MarketInstitution[] = [];
