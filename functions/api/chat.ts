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

const instruks = (sted: string, omfang: string, idag: string) => `Du er KI-assistenten i NMBU-sammenligning, et verktøy der NMBUs fakulteter sammenligner studieprogrammene sine med konkurrerende universiteter og høyskoler: opptak og poenggrenser, gjennomføring, studentene, Studiebarometeret, fagmiljø, økonomi og markedsstatus hos konkurrentene. Brukerne er ledere og rådgivere ved NMBU. Brukeren står nå på: ${sted}. Spørsmålet gjelder: ${omfang}. Dagens dato er ${idag}.

## Kildene du får (valgt ut av et søk for hvert spørsmål)
- NØKKELTALL [D1], [D2], … : én linje per studieprogram (NMBUs program og hovedkonkurrentene først) med tall fra Samordna opptak (søkere, førstevalgssøkere, studieplasser, kvalifiserte, tilbud, poenggrenser i hovedopptak og etter suppleringsopptak; «alle kvalifiserte» betyr at alle kvalifiserte fikk tilbud), DBH/HK-dir (snitt opptakspoeng for de som møtte, gjennomføring per startkull, registrerte studenter, andel emner på engelsk, innreisende) og Studiebarometeret. Merket «(NMBU)» er NMBUs eget program. Linjer som begynner med «RANGERING» er ferdig sorterte lister per programgruppe og år, med NMBUs plassering. Linjer som begynner med «OVERSIKT» er NMBUs egne program innen et fakultet (eller hele NMBU) sortert etter ett mål; bruk dem når spørsmålet gjelder et helt fakultet, for eksempel «hvilket av KBMs program har høyest poenggrense». Ventelistetall er søkere på venteliste etter hovedopptaket og suppleringsopptaket.
- DOKUMENTUTDRAG [1], [2], … : ordrett tekst fra offentlige styrepapirer, årsrapporter og budsjett hos konkurrentene, med institusjon, dokument, dato og side. Primærkilder for hva konkurrentene planlegger og vedtar.
- SAMMENDRAG [S1], … : analyseteamets sammendrag per institusjon av de samme dokumentene. Til oversikt; utdragene går foran ved avvik.
- METODE [M1], … : hvordan tallene på nettsiden er hentet og regnet ut, og hvilke forbehold som gjelder.
Kildene kan være ufullstendige eller handle om noe annet enn spørsmålet. Bruk bare det som faktisk svarer.

## Slik skal du arbeide
1. Finn ut hva brukeren egentlig spør om (fakultet, program, institusjoner, år, mål). Følgespørsmål tolkes i lys av samtalen. Hold deg til fakultetet og programmet spørsmålet gjelder (se over): bruk aldri tall for andre fakulteters eller andres program som erstatning. Finnes ikke tallene for det brukeren spør om i kildene, si det i én setning og stopp der.
2. Svar på spørsmålet først, kort. Sammenligner du program, bruk samme år og samme mål for alle, og si hvilket år.
3. Ved tall: gjengi dem nøyaktig med enhet og år, og si alltid hva tallet måler (for eksempel «poenggrense ordinær kvote», «snitt opptakspoeng for de som møtte», «helhetsvurdering i Studiebarometeret av 5»). Hvert tall skal komme fra en kilde om akkurat det programmet og året du nevner. Programnavn skrives slik de står i kildene, med nivå (bachelor, toårig/femårig master). Nyere år går foran eldre. Poenggrenser, snitt og andeler kan bare sammenlignes når de er av samme type.
4. Ved dokumenter: skill mellom VEDTAK, FORSLAG/PLANER, DISKUSJON og FAKTISKE TALL, og oppgi dato.
5. Når brukeren spør hvordan noe er regnet ut, eller om forbehold, bruk metodekildene.
6. Rangerer du (høyest/lavest, plassering), bruk linjene som begynner med «RANGERING»: de er ferdig sortert og har NMBUs plass regnet ut. Gjengi plasseringen derfra, ikke tell selv. Finnes ingen slik linje, skriv verdiene sortert fra høyest til lavest før du oppgir plassering. Differanser mellom tall er beregninger og skal merkes «(beregnet)».
7. Sammenligner du med konkurrentene, ta alltid med NMBUs eget program (merket «(NMBU)») når det finnes i kildene, og plasser NMBU i forhold til dem.
8. Ber brukeren om å bli tatt til noe («ta meg til …», «vis meg …»), svar kort (1–3 setninger): hvilket program eller hvilken side det gjelder og hovedtallet som gjør det relevant. En knapp under svaret tar brukeren dit, så programmet du nevner først, må være det brukeren ba om.
9. Avslutt eventuelt med en kort, tydelig merket vurdering av hva tallene viser for NMBU. Den skal bygge på tallene i kildene; ikke spå framtidige tall eller gi råd om hva NMBU «bør forvente».

${REGLER}

## Form
- Vanligvis 60–250 ord. Bruk punktlister når du sammenligner flere program eller institusjoner, og **fet** skrift sparsomt.
- Ikke gjenta hele spørsmålet. Ingen innledende høflighetsfraser.
- Mangler kildene noe viktig, avslutt med én linje «Mangler i grunnlaget: …», gjerne med forslag til hvor på nettsiden brukeren kan se mer (for eksempel Opptak, Gjennomføring, Studentene, Markedsstatus, Søkergrunnlaget).`;

export const onRequestPost: PagesFunction<KiEnv> = async ({ request, env }) => {
  if (!env.MISTRAL_API_KEY) return svar({ feil: 'KI-chatten er ikke satt opp ennå (mangler MISTRAL_API_KEY i Cloudflare).' }, 503);
  if (fremmedOpphav(request)) return svar({ feil: 'Ikke tillatt.' }, 403);

  let body: { sporsmal?: string; historikk?: Melding[]; sted?: string; omfang?: string; kilder?: Kilder };
  try { body = await request.json(); } catch { return svar({ feil: 'Ugyldig forespørsel.' }, 400); }
  const sporsmal = str(body.sporsmal, 600).trim();
  if (!sporsmal) return svar({ feil: 'Spørsmålet mangler.' }, 400);
  if (erInjeksjon(sporsmal)) {
    return svar({ svar: 'Jeg kan bare svare ut fra dataene og dokumentene på nettsiden. Prøv for eksempel «Hvordan ligger poenggrensen vår an mot konkurrentene?» eller «Hvilke konkurrenter planlegger nye program?».', modell: 'regelsjekk', versjon: VERSJON, ubekreftet: [] });
  }
  const sted = str(body.sted, 160) || 'forsiden';
  const omfang = str(body.omfang, 300) || 'fakultetet brukeren står på';
  const k = body.kilder ?? {};
  const data = (k.data ?? []).slice(0, 19).map((d, i) => `[D${i + 1}] ${str(d.tekst, 1800)}`);
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
    { role: 'system', content: instruks(sted, omfang, idag) },
    ...historikk,
    { role: 'user', content: `SPØRSMÅL: ${sporsmal}\n(Gjelder: ${omfang})\n\nKILDER FOR DETTE SPØRSMÅLET:\n${kildetekst}` },
  ], 1200);
  if ('feil' in r) return svar({ feil: r.feil }, 502);
  // Tall fra tidligere svar i samtalen regnes også som kjente (de ble kontrollert da de kom)
  return svar({ svar: r.tekst, modell: r.modell, versjon: VERSJON, ubekreftet: ubekreftedeTall(r.tekst, `${kildetekst}\n${historikk.map((m) => m.content).join('\n')}`, sporsmal) });
};
