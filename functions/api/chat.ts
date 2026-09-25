/**
 * Cloudflare Pages-funksjon: KI-chatten nede i hjørnet (Mistral, EU).
 *
 * Nettleseren finner selv de mest relevante kildene for spørsmålet (BM25 i nettleseren) og sender hit:
 *   - spørsmålet og de siste meldingene i samtalen (maks 6)
 *   - hvor brukeren er: fakultet og side (visning)
 *   - kildene: nøkkeltall per program [D1..], utdrag fra styrepapirer [1..] med sammendrag [S1..], og metodetekst [M1..]
 * Funksjonen legger på instruksen, kaller Mistral og kontrollerer at tallene i svaret finnes i kildene.
 * Miljøvariabler som for markedsstatus-svar (MISTRAL_API_KEY, valgfritt MISTRAL_MODEL og MISTRAL_BASE_URL).
 */
import { VERSJON, svar, fremmedOpphav, erInjeksjon, mistral, ubekreftedeTall, REGLER, type KiEnv } from '../_lib/ki';

interface Melding { rolle: 'bruker' | 'assistent'; tekst: string }
interface Kilder {
  data?: { tittel: string; tekst: string }[];
  dok?: { inst: string; dok: string; dato?: string | null; side: number; tekst: string }[];
  sammendrag?: { inst: string; enhet?: string | null; oppsummering?: string | null; punkter?: string[] }[];
  metode?: { tittel: string; tekst: string }[];
}

const str = (v: unknown, n: number) => String(v ?? '').slice(0, n);

const instruks = (sted: string, idag: string) => `Du er KI-assistenten i NMBU-sammenligning, et verktøy der NMBUs fakulteter sammenligner studieprogrammene sine med konkurrerende universiteter og høyskoler: opptak og poenggrenser, gjennomføring, studentene, Studiebarometeret, fagmiljø, økonomi og markedsstatus hos konkurrentene. Brukerne er ledere og rådgivere ved NMBU. Brukeren står nå på: ${sted}. Dagens dato er ${idag}.

## Kildene du får (valgt ut av et søk for hvert spørsmål)
- NØKKELTALL [D1], [D2], … : én linje per studieprogram (NMBUs program og hovedkonkurrentene først) med tall fra Samordna opptak (søkere, førstevalgssøkere, studieplasser, kvalifiserte, tilbud, poenggrenser i hovedopptak og etter suppleringsopptak; «alle kvalifiserte» betyr at alle kvalifiserte fikk tilbud), DBH/HK-dir (snitt opptakspoeng for de som møtte, gjennomføring per startkull, registrerte studenter, andel emner på engelsk, innreisende) og Studiebarometeret. Merket «(NMBU)» er NMBUs eget program.
- DOKUMENTUTDRAG [1], [2], … : ordrett tekst fra offentlige styrepapirer, årsrapporter og budsjett hos konkurrentene, med institusjon, dokument, dato og side. Primærkilder for hva konkurrentene planlegger og vedtar.
- SAMMENDRAG [S1], … : analyseteamets sammendrag per institusjon av de samme dokumentene. Til oversikt; utdragene går foran ved avvik.
- METODE [M1], … : hvordan tallene på nettsiden er hentet og regnet ut, og hvilke forbehold som gjelder.
Kildene kan være ufullstendige eller handle om noe annet enn spørsmålet. Bruk bare det som faktisk svarer.

## Slik skal du arbeide
1. Finn ut hva brukeren egentlig spør om (program, institusjoner, år, mål). Følgespørsmål tolkes i lys av samtalen.
2. Svar på spørsmålet først, kort. Sammenligner du program, bruk samme år og samme mål for alle, og si hvilket år.
3. Ved tall: gjengi dem nøyaktig med enhet og år. Nyere år går foran eldre. Poenggrenser, snitt og andeler kan bare sammenlignes når de er av samme type.
4. Ved dokumenter: skill mellom VEDTAK, FORSLAG/PLANER, DISKUSJON og FAKTISKE TALL, og oppgi dato.
5. Når brukeren spør hvordan noe er regnet ut, eller om forbehold, bruk metodekildene.
6. Rangerer du (høyest/lavest, plassering), skriv først opp alle verdiene sortert fra høyest til lavest, og tell plasseringen ut fra den sorterte lista. Differanser mellom tall er beregninger og skal merkes «(beregnet)».
7. Sammenligner du med konkurrentene, ta alltid med NMBUs eget program (merket «(NMBU)») når det finnes i kildene, og plasser NMBU i forhold til dem.
8. Avslutt eventuelt med en kort, tydelig merket vurdering av hva tallene viser for NMBU. Den skal bygge på tallene i kildene; ikke spå framtidige tall eller gi råd om hva NMBU «bør forvente».

${REGLER}

## Form
- Vanligvis 60–250 ord. Bruk punktlister når du sammenligner flere program eller institusjoner, og **fet** skrift sparsomt.
- Ikke gjenta hele spørsmålet. Ingen innledende høflighetsfraser.
- Mangler kildene noe viktig, avslutt med én linje «Mangler i grunnlaget: …», gjerne med forslag til hvor på nettsiden brukeren kan se mer (for eksempel Opptak, Gjennomføring, Studentene, Markedsstatus, Søkergrunnlaget).`;

export const onRequestPost: PagesFunction<KiEnv> = async ({ request, env }) => {
  if (!env.MISTRAL_API_KEY) return svar({ feil: 'KI-chatten er ikke satt opp ennå (mangler MISTRAL_API_KEY i Cloudflare).' }, 503);
  if (fremmedOpphav(request)) return svar({ feil: 'Ikke tillatt.' }, 403);

  let body: { sporsmal?: string; historikk?: Melding[]; sted?: string; kilder?: Kilder };
  try { body = await request.json(); } catch { return svar({ feil: 'Ugyldig forespørsel.' }, 400); }
  const sporsmal = str(body.sporsmal, 600).trim();
  if (!sporsmal) return svar({ feil: 'Spørsmålet mangler.' }, 400);
  if (erInjeksjon(sporsmal)) {
    return svar({ svar: 'Jeg kan bare svare ut fra dataene og dokumentene på nettsiden. Prøv for eksempel «Hvordan ligger poenggrensen vår an mot konkurrentene?» eller «Hvilke konkurrenter planlegger nye program?».', modell: 'regelsjekk', versjon: VERSJON, ubekreftet: [] });
  }
  const sted = str(body.sted, 160) || 'forsiden';
  const k = body.kilder ?? {};
  const data = (k.data ?? []).slice(0, 16).map((d, i) => `[D${i + 1}] ${str(d.tekst, 1300)}`);
  const dok = (k.dok ?? []).slice(0, 8).map((d, i) => `[${i + 1}] ${str(d.inst, 80)} – ${str(d.dok, 200)}${d.dato ? ` (${str(d.dato, 20)})` : ''}, side ${Number(d.side) || 0}:\n${str(d.tekst, 1600)}`);
  const sam = (k.sammendrag ?? []).slice(0, 5).map((s, i) => `[S${i + 1}] ${str(s.inst, 80)}${s.enhet ? ` (${str(s.enhet, 160)})` : ''}:\n${`${s.oppsummering ? str(s.oppsummering, 800) + '\n' : ''}${(Array.isArray(s.punkter) ? s.punkter : []).slice(0, 8).map((p) => `- ${str(p, 400)}`).join('\n')}`.slice(0, 2000)}`);
  const met = (k.metode ?? []).slice(0, 4).map((m, i) => `[M${i + 1}] ${str(m.tittel, 120)}:\n${str(m.tekst, 1600)}`);
  const kildetekst = [
    `=== NØKKELTALL ===\n${data.join('\n\n') || '(ingen)'}`,
    `=== DOKUMENTUTDRAG ===\n${dok.join('\n\n') || '(ingen)'}`,
    `=== SAMMENDRAG ===\n${sam.join('\n\n') || '(ingen)'}`,
    `=== METODE ===\n${met.join('\n\n') || '(ingen)'}`,
  ].join('\n\n');

  const historikk = (Array.isArray(body.historikk) ? body.historikk : []).slice(-6)
    .map((m) => ({ role: m.rolle === 'assistent' ? 'assistant' : 'user', content: str(m.tekst, m.rolle === 'assistent' ? 1500 : 600) }));
  const idag = new Date().toISOString().slice(0, 10);
  const r = await mistral(env, [
    { role: 'system', content: instruks(sted, idag) },
    ...historikk,
    { role: 'user', content: `SPØRSMÅL: ${sporsmal}\n\nKILDER FOR DETTE SPØRSMÅLET:\n${kildetekst}` },
  ], 1200);
  if ('feil' in r) return svar({ feil: r.feil }, 502);
  // Tall fra tidligere svar i samtalen regnes også som kjente (de ble kontrollert da de kom)
  return svar({ svar: r.tekst, modell: r.modell, versjon: VERSJON, ubekreftet: ubekreftedeTall(r.tekst, `${kildetekst}\n${historikk.map((m) => m.content).join('\n')}`, sporsmal) });
};
