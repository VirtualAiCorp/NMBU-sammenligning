import { createRoot } from "react-dom/client";
import { AjgAnalyse } from "./app/components/ajg/AjgAnalyse";
import "./styles/index.css";
import "./styles/ajg.css";

/**
 * Egen inngang for nettstedet AJG-Analyse HH (VITE_KUN_AJG=1, Cloudflare-prosjektet «ajg-analyse-hh»).
 * Alltid arbeidsflate-oppsettet (vite.config.ts setter data-oppsett og laster Geist). Resten av NMBU-sammenligningen er
 * ikke med i bunten. Dataene er kryptert med AJG_PASSORD (public/ajg-data.json, laget av scripts/rangering/ajg_analyse.py).
 */
document.documentElement.setAttribute("data-oppsett", "arbeidsflate");
createRoot(document.getElementById("root")!).render(<AjgAnalyse />);
