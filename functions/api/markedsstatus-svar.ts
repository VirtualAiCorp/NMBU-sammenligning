/**
 * Cloudflare Pages-funksjon: KI-svar på spørsmål om styrepapirene i markedsstatus, med Mistral (EU).
 *
 * Nettleseren søker selv i teksten (BM25) og sender hit:
 *   - spørsmålet
 *   - de beste utdragene fra PDF-ene (maks 12 × 1 600 tegn), med institusjon, dokument, dato og side
 *   - de kuraterte sammendragene fra markedsstatus-kortene for institusjonene i treffene (maks 6 × 2 000 tegn)
 *   - hvilket fakultet brukeren ser på
 * Funksjonen legger på instruksen og sender det til Mistrals chat-API. API-nøkkelen ligger som hemmelig
 * miljøvariabel i Cloudflare og havner aldri i nettleseren.
 *
 * Miljøvariabler (Cloudflare → Pages-prosjektet → Settings → Variables and Secrets):
 *   MISTRAL_API_KEY  (påkrevd, type Secret)
 *   MISTRAL_MODEL    (valgfri, standard «mistral-large-latest»)
 *   MISTRAL_BASE_URL (valgfri, standard «https://api.mistral.ai/v1»; OpenAI-kompatibelt endepunkt, f.eks. Scaleway
 *                     Generative APIs i Paris, kan brukes i stedet)
 */
import { VERSJON, svar, fremmedOpphav, forMange, renTekst, erInjeksjon, mistral, ubekreftedeTall, REGLER, type KiEnv } from '../_lib/ki';

type Env = KiEnv;
interface Utdrag { nr: number; inst: string; dok: string; dato?: string | null; side: number; tekst: string }
interface Sammendrag { inst: string; enhet?: string | null; oppsummering?: string | null; punkter?: string[] }

const instruks = (fakultet: string, idag: string) => `Du er analytiker for NMBU-sammenligning, et internt verktøy der NMBUs fakulteter sammenligner seg med konkurrerende universiteter og høyskoler. Brukeren ser nå på markedsstatus for ${fakultet} og vil vite hva konkurrentene gjør. Dagens dato er ${idag}.

## Datamaterialet du får
A. UTDRAG [1], [2], … : ordrett tekst fra offentlige dokumenter hos konkurrentene (styrepapirer, protokoller, årsrapporter, budsjett, kvalitets- og porteføljerapporter). Hvert utdrag har institusjon, dokument, dato og sidetall. Dette er PRIMÆRKILDENE. Utdragene er valgt ut av et søk, så de kan være ufullstendige, revet ut av sammenheng eller ikke handle om spørsmålet.
B. SAMMENDRAG [S1], [S2], … : korte sammendrag som analyseteamet har skrevet for hver institusjon ut fra de samme dokumentene. Bruk dem til oversikt og sammenheng, men foretrekk utdragene når de sier noe om det samme. Sier de to noe ulikt, stol på utdraget og si fra om avviket.

## Slik skal du arbeide
1. Les spørsmålet og finn ut hvilke institusjoner, temaer og år det gjelder.
2. Gå gjennom utdragene og sammendragene og bruk bare det som faktisk svarer på spørsmålet. Se bort fra irrelevante treff.
3. Nyere dokumenter går foran eldre. Oppgi alltid årstall eller dato for det du refererer.
4. Skill tydelig mellom VEDTAK (styret har vedtatt), FORSLAG eller PLANER (innstilling, strategi, budsjettforslag), DISKUSJON eller VURDERING, og FAKTISKE TALL (regnskap, søkertall).
5. Gjengi tall nøyaktig slik de står, med enhet og år (for eksempel «−34,4 mill. kr i 2025»). Ikke lag egne snitt, summer eller endringer. Gjør du det likevel, skal det stå «(beregnet)» rett etter tallet, for eksempel «3,6 mill. kr per år (beregnet)».
6. Gjelder spørsmålet flere institusjoner, sammenlign dem punktvis per institusjon.
7. Hvis det er grunnlag for det, avslutt med en kort og tydelig merket VURDERING av hva dette kan bety for NMBU/${fakultet}. Ikke dikt opp NMBU-tall.

${REGLER}

## Svarformat (om lag 150–350 ord)
**Kort svar:** 1–3 setninger.
**Detaljer:** punkter, gruppert per institusjon når flere er med, med kilder.
**Vurdering for NMBU:** bare hvis materialet gir grunnlag (tydelig merket som vurdering).
**Hull i grunnlaget:** hva som mangler eller er usikkert, og 1–3 forslag til søkeord som kan gi bedre treff.`;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.MISTRAL_API_KEY) return svar({ feil: 'KI-svar er ikke satt opp ennå (mangler MISTRAL_API_KEY i Cloudflare).' }, 503);

  if (fremmedOpphav(request)) return svar({ feil: 'Ikke tillatt.' }, 403);
  if (await forMange(request, 'markedsstatus', 30)) return svar({ feil: 'Mange spørsmål på kort tid. Vent noen minutter og prøv igjen.' }, 429);

  let body: { sporsmal?: string; fakultet?: string; utdrag?: Utdrag[]; sammendrag?: Sammendrag[] };
  try { body = await request.json(); } catch { return svar({ feil: 'Ugyldig forespørsel.' }, 400); }
  if (!body || typeof body !== 'object') return svar({ feil: 'Ugyldig forespørsel.' }, 400);
  const sporsmal = String(body.sporsmal ?? '').trim().slice(0, 500);
  const fakultet = renTekst(body.fakultet, 80, 'fakultetet');
  const utdrag = (Array.isArray(body.utdrag) ? body.utdrag : []).filter((u) => u && typeof u === 'object').slice(0, 12)
    .map((u, i) => ({ nr: i + 1, inst: String(u.inst ?? '').slice(0, 80), dok: String(u.dok ?? '').slice(0, 200), dato: u.dato ? String(u.dato).slice(0, 20) : '',
      side: Number(u.side) || 0, tekst: String(u.tekst ?? '').slice(0, 1600) }));
  const sammendrag = (Array.isArray(body.sammendrag) ? body.sammendrag : []).filter((x) => x && typeof x === 'object').slice(0, 6)
    .map((s, i) => {
      const punkter = (Array.isArray(s.punkter) ? s.punkter : []).slice(0, 8).map((p) => `- ${String(p).slice(0, 400)}`).join('\n');
      const tekst = `${s.oppsummering ? String(s.oppsummering).slice(0, 800) + '\n' : ''}${punkter}`.slice(0, 2000);
      return { nr: i + 1, inst: String(s.inst ?? '').slice(0, 80), enhet: s.enhet ? String(s.enhet).slice(0, 160) : '', tekst };
    });
  if (!sporsmal || !utdrag.length) return svar({ feil: 'Spørsmål og utdrag mangler.' }, 400);

  if (erInjeksjon(sporsmal)) {
    return svar({ svar: '**Kort svar:** Jeg svarer bare på spørsmål om konkurrentene ut fra dokumentene i markedsstatus.\n\n**Forslag:** Prøv for eksempel «Hvem planlegger nye studieprogram i økonomi?» eller «Hva sier UiA om opptaksrammer?».', modell: 'regelsjekk', versjon: VERSJON });
  }

  const delA = utdrag.map((u) => `[${u.nr}] ${u.inst} – ${u.dok}${u.dato ? ` (${u.dato})` : ''}, side ${u.side}:\n${u.tekst}`).join('\n\n');
  const delB = sammendrag.map((s) => `[S${s.nr}] ${s.inst}${s.enhet ? ` (${s.enhet})` : ''}:\n${s.tekst}`).join('\n\n');
  const bruker = `SPØRSMÅL: ${sporsmal}\n\n=== A. UTDRAG FRA DOKUMENTENE ===\n${delA}\n\n=== B. SAMMENDRAG PER INSTITUSJON ===\n${delB || '(ingen)'}`;
  const idag = new Date().toISOString().slice(0, 10);

  const r = await mistral(env, [{ role: 'system', content: instruks(fakultet, idag) }, { role: 'user', content: bruker }]);
  if ('feil' in r) return svar({ feil: r.feil }, 502);
  return svar({ svar: r.tekst, modell: r.modell, versjon: VERSJON, ubekreftet: ubekreftedeTall(r.tekst, `${delA}\n${delB}`, sporsmal) });
};
