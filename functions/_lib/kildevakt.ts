/**
 * Kildevakten: det eneste som når KI-modellen som kilde, er tekst fra det åpne, publiserte KI-grunnlaget.
 *
 * Nettleseren velger kildene (søk i nettleseren), men serverfunksjonen stoler ikke på det den får. Hver tekst i en kilde
 * (nøkkeltallslinje, metodeavsnitt, styrepapirutdrag, sammendrag, institusjon, dokumentnavn, dato) hashes og slås opp i
 * lista som scripts/build-ki-tillatte.mjs lager fra de publiserte filene før hvert bygg. En kilde med én ukjent tekst
 * forkastes i sin helhet. Dermed kan verken en feil i nettleserkoden, en endret nettleser eller dekrypterte interne tall
 * (opptaksanalysen for HH, som bare dekrypteres i nettleseren med passordet) sendes videre til modellen som kilde.
 *
 * Tidligere svar i samtalen (historikken) er signert av serveren (HMAC). Assistentmeldinger uten gyldig signatur tas ut,
 * så historikken kan heller ikke brukes til å smugle inn tekst.
 *
 * Brukerens eget spørsmål (maks 600 tegn) er det eneste frie feltet. Chatten er slått av på den interne siden, og
 * instruksen sier at modellen bare skal bruke kildene.
 */
import { TILLATTE_HASHER } from './tillatte-kilder';

let tillatte: Set<string> | null = null;
const sett = () => (tillatte ??= new Set(TILLATTE_HASHER.match(/.{16}/g) ?? []));

const heks = (b: ArrayBuffer, n: number) => [...new Uint8Array(b).slice(0, n)].map((x) => x.toString(16).padStart(2, '0')).join('');

async function hash16(s: string) {
  return heks(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)), 8);
}

/** Tom verdi (null, undefined, '') er lov; tall er lov (sidetall); tekst må være publisert; alt annet avvises. */
async function publisert(v: unknown): Promise<boolean> {
  if (v == null || v === '' || typeof v === 'number') return true;
  if (typeof v === 'string') return sett().has(await hash16(v));
  if (Array.isArray(v)) return (await Promise.all(v.map(publisert))).every(Boolean);
  return false;
}

/**
 * Beholder bare kildene der alle de oppgitte feltene er publisert tekst. Returnerer de godkjente og antallet forkastede.
 * Feltene som ikke er nevnt, brukes ikke i instruksen og sjekkes derfor ikke (for eksempel tittel på nøkkeltallslinjer).
 */
export async function bareTillatte<T extends object>(kilder: T[], felt: (keyof T)[]): Promise<{ ok: T[]; forkastet: number }> {
  const ok: T[] = [];
  for (const k of kilder) {
    if ((await Promise.all(felt.map((f) => publisert(k[f])))).every(Boolean)) ok.push(k);
  }
  return { ok, forkastet: kilder.length - ok.length };
}

// ── Signerte svar i historikken ──────────────────────────────────────────────
const nokler = new Map<string, Promise<CryptoKey>>();
function signaturNokkel(hemmelig: string) {
  if (!nokler.has(hemmelig)) {
    nokler.set(hemmelig, crypto.subtle.digest('SHA-256', new TextEncoder().encode(`nmbu-sammenligning/historikk/${hemmelig}`))
      .then((raa) => crypto.subtle.importKey('raw', raa, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])));
  }
  return nokler.get(hemmelig)!;
}

/** Signatur for et svar fra serveren. Nøkkelen er avledet av API-nøkkelen, så den finnes bare i Cloudflare. */
export async function signer(tekst: string, hemmelig: string) {
  return heks(await crypto.subtle.sign('HMAC', await signaturNokkel(hemmelig), new TextEncoder().encode(tekst)), 16);
}

export async function gyldigSignatur(tekst: string, sig: unknown, hemmelig: string) {
  if (typeof sig !== 'string' || sig.length !== 32) return false;
  const riktig = await signer(tekst, hemmelig);
  let forskjell = 0;
  for (let i = 0; i < riktig.length; i++) forskjell |= riktig.charCodeAt(i) ^ sig.charCodeAt(i);
  return forskjell === 0;
}
