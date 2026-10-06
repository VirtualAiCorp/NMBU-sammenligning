#!/usr/bin/env node
/**
 * Kildevakten for KI-funksjonene: lager lista over tekster KI-modellen har lov til å få, og stopper bygget hvis noe
 * internt er på vei inn i KI-grunnlaget. Kjøres automatisk før hvert bygg (`prebuild` i kilde/package.json), også i
 * Cloudflare, så lista er alltid i takt med det som publiseres.
 *
 * 1. Tillatte tekster → functions/_lib/tillatte-kilder.ts
 *    SHA-256 (første 16 heks-tegn) av hver tekst i det åpne, publiserte KI-grunnlaget:
 *      - nøkkeltallslinjene i kilde/public/ki/<fakultet>-data.json
 *      - metodeavsnittene i kilde/public/ki/metode.json (tittel og tekst)
 *      - styrepapirene i kilde/public/markedsstatus/<fakultet>/tekst.json (institusjon, dokument, dato, tekstbit)
 *      - markedsstatus-sammendragene i kilde/src/app/data/<fakultet>MarketStatusData.ts
 *    Serverfunksjonene (functions/_lib/kildevakt.ts) sender bare kilder med en slik hash videre til modellen. Alt annet
 *    nettleseren sender som kilde, også dekrypterte interne tall, blir forkastet før modellen ser det.
 *
 * 2. Sperrer (bygget stopper med feil):
 *      - filene i kilde/public/intern/ må være krypterte konvolutter (v, alg, iter, salt, iv, data) og ingenting annet
 *      - KI-grunnlaget og styrepapirtekstene kan ikke peke på interne filer (intern/, opptak-h26, INTERN_PASSORD)
 *      - chatkomponentene og serverfunksjonene kan ikke importere eller hente interne sider, dekrypteringen eller passordet
 *
 * 3. Etter bygget (`--etter-bygg`, `postbuild`): finnes INTERN_PASSORD i kilde/.env.local (bare lokalt), sjekkes det at
 *    passordet ikke står noe sted i kilde/dist. Passordet skrives aldri ut.
 *
 * Bruk: node scripts/build-ki-tillatte.mjs [--etter-bygg]
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = join(ROT, 'kilde', 'public');
const DATA = join(ROT, 'kilde', 'src', 'app', 'data');
const UT = join(ROT, 'functions', '_lib', 'tillatte-kilder.ts');
const FAKULTETER = ['hh', 'landsam', 'realtek', 'biovit', 'kbm', 'mina', 'vet'];
const KONVOLUTT = ['alg', 'data', 'iter', 'iv', 'salt', 'v'];
// Ord som aldri skal stå i KI-grunnlaget eller i koden som bygger kildene til modellen
const SPERRET_I_GRUNNLAG = [/\bintern\/[\w-]+\.json/i, /opptak-h26/i, /INTERN_PASSORD/, /Handelshoyskolerangering|Rangering \(intern\)/i];
const SPERRET_I_KODE = [/InternOpptak/, /PasswordGate/, /['"`/]intern\//, /opptak-h26/, /INTERN_PASSORD/, /dekrypter/i, /crypto\.subtle\.decrypt/];
// Det eneste lovlige: serverfunksjonene nekter å kjøre hvis passordet ligger i Cloudflare (miljoFeil i functions/_lib/ki.ts)
const UNNTAK_I_KODE = [/INTERN_PASSORD\?: string;/g, /if \(env\.INTERN_PASSORD\) return 'KI-funksjonene er stengt: INTERN_PASSORD er lagt inn i Cloudflare\./g];

const feil = [];
const les = (p) => readFileSync(p, 'utf8');
const lesJson = (p) => JSON.parse(les(p));
const rel = (p) => relative(ROT, p);

if (process.argv.includes('--etter-bygg')) {
  etterBygg();
} else {
  sjekkInterneFiler();
  sjekkKode();
  lagListe();
}
if (feil.length) {
  console.error(`\nKildevakten stoppet bygget (${feil.length} funn):\n${feil.map((f) => `  - ${f}`).join('\n')}\n`);
  process.exit(1);
}

function sjekkInterneFiler() {
  const mappe = join(PUB, 'intern');
  if (!existsSync(mappe)) return;
  for (const f of readdirSync(mappe)) {
    const p = join(mappe, f);
    if (!f.endsWith('.json')) { feil.push(`${rel(p)}: bare krypterte .json-filer er lov i intern/`); continue; }
    let d;
    try { d = lesJson(p); } catch { feil.push(`${rel(p)}: kan ikke leses som JSON`); continue; }
    const nokler = Object.keys(d ?? {}).sort();
    if (nokler.join() !== KONVOLUTT.join() || typeof d.data !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(d.data)) {
      feil.push(`${rel(p)}: er ikke en kryptert konvolutt (${KONVOLUTT.join(', ')}); fant ${nokler.join(', ')}`);
    }
  }
}

function sjekkKode() {
  const filer = [
    ...['KiChatPanel.tsx', 'KiChatKnapp.tsx', 'KiSvarTekst.tsx', 'StyrepapirSok.tsx'].map((f) => join(ROT, 'kilde', 'src', 'app', 'components', f)),
    join(DATA, 'styrepapirSok.ts'),
    ...alleFiler(join(ROT, 'functions')).filter((p) => /\.(ts|js)$/.test(p) && !p.endsWith('tillatte-kilder.ts')),
  ];
  for (const p of filer) {
    if (!existsSync(p)) continue;
    // Kommentarer og denne typen forklaringer får nevne ordene; bare koden sjekkes
    let kode = les(p).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
    for (const re of UNNTAK_I_KODE) kode = kode.replace(re, '');
    for (const re of SPERRET_I_KODE) if (re.test(kode)) feil.push(`${rel(p)}: inneholder ${re} (KI-koden skal ikke kunne nå interne data)`);
  }
}

function alleFiler(mappe) {
  if (!existsSync(mappe)) return [];
  return readdirSync(mappe).flatMap((f) => { const p = join(mappe, f); return statSync(p).isDirectory() ? alleFiler(p) : [p]; });
}

function lagListe() {
  const tekster = new Set();
  const legg = (t, kilde) => {
    if (t == null || t === '') return;
    const s = String(t);
    for (const re of SPERRET_I_GRUNNLAG) if (re.test(s)) feil.push(`${kilde}: KI-grunnlaget inneholder ${re}`);
    tekster.add(s);
  };
  const tell = {};
  for (const f of [...FAKULTETER, 'nmbu', 'felles']) {
    const p = join(PUB, 'ki', `${f}-data.json`);
    if (!existsSync(p)) continue;
    const linjer = lesJson(p).linjer ?? [];
    linjer.forEach((l) => legg(l[2], rel(p)));
    tell[`ki/${f}`] = linjer.length;
  }
  const metode = join(PUB, 'ki', 'metode.json');
  if (existsSync(metode)) {
    const a = lesJson(metode).avsnitt ?? [];
    a.forEach(([t, x]) => { legg(t, rel(metode)); legg(x, rel(metode)); });
    tell.metode = a.length;
  }
  for (const f of FAKULTETER) {
    const p = join(PUB, 'markedsstatus', f, 'tekst.json');
    if (!existsSync(p)) continue;
    const d = lesJson(p);
    (d.docs ?? []).forEach((doc) => { legg(doc.inst, rel(p)); legg(doc.label, rel(p)); legg(doc.dato, rel(p)); });
    (d.chunks ?? []).forEach((c) => legg(c[2], rel(p)));
    tell[`styrepapir/${f}`] = (d.chunks ?? []).length;
    const ts = join(DATA, `${f}MarketStatusData.ts`);
    if (!existsSync(ts)) continue;
    const kode = les(ts);
    const start = kode.indexOf('= [', kode.indexOf('export const MARKET_STATUS:')) + 2;
    const slutt = kode.lastIndexOf(']');
    let inst;
    try { inst = JSON.parse(kode.slice(start, slutt + 1)); } catch (e) { feil.push(`${rel(ts)}: MARKET_STATUS kunne ikke leses (${e.message})`); continue; }
    inst.forEach((i) => { legg(i.name, rel(ts)); legg(i.enhet, rel(ts)); legg(i.oppsummering, rel(ts)); (i.punkter ?? []).forEach((x) => legg(x, rel(ts))); });
    tell[`sammendrag/${f}`] = inst.length;
  }
  if (tekster.size < 1000) feil.push(`bare ${tekster.size} tillatte tekster; KI-grunnlaget ser ut til å mangle (kjør scripts/build-ki-grunnlag.py)`);
  const hasher = [...new Set([...tekster].map((t) => createHash('sha256').update(t, 'utf8').digest('hex').slice(0, 16)))].sort();
  const innhold = `// GENERERT av scripts/build-ki-tillatte.mjs før hvert bygg – ikke rediger for hånd.
// SHA-256 (16 første heks-tegn) av hver tekst i det publiserte KI-grunnlaget. Se functions/_lib/kildevakt.ts.
export const TILLATTE_ANTALL = ${hasher.length};
export const TILLATTE_GRUNNLAG = ${JSON.stringify(tell)};
export const TILLATTE_HASHER = '${hasher.join('')}';
`;
  if (feil.length) return;
  const gammel = existsSync(UT) ? les(UT) : '';
  if (gammel !== innhold) writeFileSync(UT, innhold);
  console.log(`Kildevakten: ${hasher.length} tillatte tekster ${gammel === innhold ? '(uendret)' : `skrevet til ${rel(UT)}`}; interne filer er krypterte, og KI-koden når ikke interne data.`);
}

function etterBygg() {
  const env = join(ROT, 'kilde', '.env.local');
  const dist = join(ROT, 'kilde', 'dist');
  if (!existsSync(env) || !existsSync(dist)) return;
  const m = les(env).match(/^\s*INTERN_PASSORD\s*=\s*["']?([^"'\r\n]+)["']?\s*$/m);
  if (!m || m[1].length < 6) return;
  for (const p of alleFiler(dist)) {
    if (!/\.(js|html|json|css|txt|map)$/.test(p)) continue;
    if (readFileSync(p).includes(m[1])) feil.push(`${rel(p)}: inneholder INTERN_PASSORD (verdien skrives ikke ut)`);
  }
  if (!feil.length) console.log('Kildevakten: INTERN_PASSORD finnes ikke i det bygde nettstedet.');
}
