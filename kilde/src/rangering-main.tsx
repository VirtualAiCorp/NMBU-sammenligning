import { createRoot } from "react-dom/client";
import { Handelshoyskolerangering } from "./app/components/Handelshoyskolerangering";
import { ThemeToggle } from "./app/components/ThemeToggle";
import "./styles/index.css";

/**
 * Egen inngang for nettstedet med bare rangeringen (VITE_KUN_RANGERING=1, Cloudflare-prosjektet «hh-rangering»).
 * Resten av NMBU-sammenligningen er ikke med i bunten. Dataene er kryptert med RANGERING_PASSORD
 * (public/rangering-data.json, laget av scripts/build-rangering.py), ikke med det interne passordet.
 */
function RangeringSide() {
  return (
    <div className="min-h-full">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--nmbu-neutral-2)" }}>
            Handelshøyskolen ved NMBU · utkast
          </div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 30, lineHeight: 1.15, color: "var(--nmbu-green-dark)", margin: "6px 0 6px" }}>
            Norwegian Business School Ranking
          </h1>
          <p className="text-sm" style={{ color: "var(--nmbu-neutral-2)", maxWidth: "75ch" }}>
            Forskning, utdanning og anerkjennelse ved norske handelshøyskoler. Kilder: DBH/HK-dir, NVA, ABDC, FT50, UTD24, Samordna opptak og Studiebarometeret.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <Handelshoyskolerangering />
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<RangeringSide />);
