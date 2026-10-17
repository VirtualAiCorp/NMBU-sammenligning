// Skriver de valgte Pro-ikonene (valg.mjs) til kilde/src/app/ikoner-pro.ts som ikondata
// for <HugeiconsIcon icon={...} /> fra @hugeicons/react. Bare de valgte ikonene havner
// i repoet; lisensnøkkelen trengs bare lokalt når listen endres.
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { VALG } from "./valg.mjs";

const her = path.dirname(fileURLToPath(import.meta.url));
const ut = path.resolve(her, "../../kilde/src/app/ikoner-pro.ts");
const STILER = ["stroke-rounded", "solid-rounded", "duotone-rounded"];
const STANDARD = "stroke-rounded";

const pakker = {};
async function pakke(stil) {
  if (!STILER.includes(stil)) throw new Error(`Ukjent stil «${stil}». Bruk ${STILER.join(", ")}.`);
  if (!pakker[stil]) {
    try {
      pakker[stil] = await import(`@hugeicons-pro/core-${stil}`);
    } catch {
      console.error(`Fant ikke @hugeicons-pro/core-${stil}. Kjør ./hent.sh (den spør etter nøkkelen og installerer).`);
      process.exit(1);
    }
  }
  return pakker[stil];
}

// Eksportnavn i ikoner-pro.ts: Analytics01Icon → Analytics01ProIcon (+ stil når den ikke er standard),
// så de ikke kolliderer med gratisikonene.
const eksportnavn = ({ navn, stil = STANDARD }) => {
  const stamme = navn.replace(/Icon$/, "");
  const tillegg = stil === STANDARD ? "" : stil.split("-").map((d) => d[0].toUpperCase() + d.slice(1)).join("");
  return `${stamme}${tillegg}ProIcon`;
};

const utenNokkel = (data) => data.map(([tag, attrs]) => [tag, Object.fromEntries(Object.entries(attrs).filter(([k]) => k !== "key"))]);

async function sok(ord) {
  if (!ord.length) {
    console.error("Bruk: ./hent.sh sok <ord> [ord …]  (engelske ord treffer best, f.eks. «home», «chart»)");
    process.exit(1);
  }
  const lib = await pakke(STANDARD);
  const treff = Object.keys(lib)
    .filter((n) => n.endsWith("Icon") && ord.some((o) => n.toLowerCase().includes(o.toLowerCase())))
    .sort();
  console.log(`${treff.length} treff:\n` + treff.join("\n"));
  const kebab = (k) => k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
  const svg = (data) => data.map(([t, a]) => `<${t} ${Object.entries(a).filter(([k]) => k !== "key").map(([k, v]) => `${kebab(k)}="${v}"`).join(" ")}/>`).join("");
  const stiler = await Promise.all(STILER.map(pakke));
  let html = `<!doctype html><meta charset="utf-8"><title>Hugeicons Pro: ${ord.join(", ")}</title><body style="margin:0;padding:20px;font:12px system-ui;background:#f4f4f2;color:#1d1d1b"><p>Kolonner: ${STILER.join(" · ")}</p><div style="display:flex;flex-wrap:wrap;gap:10px">`;
  for (const n of treff) {
    html += `<div style="width:150px;text-align:center;background:#fff;border-radius:8px;padding:10px"><div style="display:flex;justify-content:center;gap:10px">`;
    for (const lib of stiler) html += lib[n] ? `<svg viewBox="0 0 24 24" width="32" height="32" fill="none">${svg(lib[n])}</svg>` : "";
    html += `</div><div style="margin-top:6px;word-break:break-all">${n}</div></div>`;
  }
  const fil = path.join(os.tmpdir(), `hugeicons-sok-${ord.join("-")}.html`);
  fs.writeFileSync(fil, html + "</div></body>");
  console.log(`\nForhåndsvisning: ${fil}`);
}

async function hent() {
  const linjer = [], mangler = [];
  for (const valg of VALG) {
    const data = (await pakke(valg.stil ?? STANDARD))[valg.navn];
    if (!data) { mangler.push(`${valg.navn} (${valg.stil ?? STANDARD})`); continue; }
    linjer.push(`export const ${eksportnavn(valg)} = ${JSON.stringify(utenNokkel(data))} as const satisfies IconSvgElement;`);
  }
  // Et ikon som mangler i Pro-stilen stopper ikke resten: ikoner.tsx viser strekikonet for det (proEllers).
  if (mangler.length) console.warn(`Fant ikke (viser strekikonet i stedet): ${mangler.join(", ")}`);
  fs.writeFileSync(ut, [
    "// Generert av scripts/hugeicons-pro/hent-ikoner.mjs fra valg.mjs – Hugeicons Pro (lisens: Mathias Smogeli).",
    "// Ikke rediger for hånd. Brukes via proEllers() og MENY i ikoner.tsx.",
    ...(linjer.length ? ['import type { IconSvgElement } from "@hugeicons/react";', "", ...linjer] : ["export {};"]),
    "",
  ].join("\n"));
  console.log(`Skrev ${linjer.length} Pro-ikoner til kilde/src/app/ikoner-pro.ts. Bygg og commit den fila.`);
}

const i = process.argv.indexOf("--sok");
if (i >= 0) await sok(process.argv.slice(i + 1));
else await hent();
