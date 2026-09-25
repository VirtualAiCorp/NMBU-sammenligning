/**
 * Cloudflare Pages-funksjon: KI-svar på spørsmål om styrepapirene i markedsstatus, med Mistral (EU).
 *
 * Nettleseren søker selv i teksten og sender bare spørsmålet og de beste utdragene (maks 8 × 1 600 tegn) hit.
 * Funksjonen legger på instruksen og sender det til Mistrals chat-API. API-nøkkelen ligger som hemmelig miljøvariabel
 * i Cloudflare og havner aldri i nettleseren.
 *
 * Miljøvariabler (Cloudflare → Pages-prosjektet → Settings → Variables and Secrets):
 *   MISTRAL_API_KEY  (påkrevd, type Secret)
 *   MISTRAL_MODEL    (valgfri, standard «mistral-small-latest»)
 *   MISTRAL_BASE_URL (valgfri, standard «https://api.mistral.ai/v1»; OpenAI-kompatibelt endepunkt, f.eks. Scaleway
 *                     Generative APIs i Paris, kan brukes i stedet)
 */
interface Env { MISTRAL_API_KEY?: string; MISTRAL_MODEL?: string; MISTRAL_BASE_URL?: string }
interface Utdrag { nr: number; inst: string; dok: string; dato?: string | null; side: number; tekst: string }

const svar = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

const INSTRUKS = `Du er en analytiker som hjelper Handelshøyskolen ved NMBU og de andre fakultetene med å forstå konkurrentene.
Du får et spørsmål og nummererte utdrag fra offentlige styrepapirer, årsrapporter og budsjettdokumenter hos andre institusjoner.
Regler:
- Svar på norsk bokmål, kort og konkret (maks om lag 200 ord), gjerne i punkter.
- Bruk BARE informasjonen i utdragene. Finn ikke på tall, navn eller datoer.
- Oppgi kilden etter hver påstand som [nummer], f.eks. [2]. Bruk bare numrene du har fått.
- Står ikke svaret i utdragene, si det tydelig og foreslå hvilke ord det kan søkes på i stedet.
- Skill mellom vedtak, forslag og diskusjon når utdragene gjør det mulig.`;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.MISTRAL_API_KEY) return svar({ feil: 'KI-svar er ikke satt opp ennå (mangler MISTRAL_API_KEY i Cloudflare).' }, 503);

  // Bare fra nettstedet selv
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return svar({ feil: 'Ikke tillatt.' }, 403);

  let body: { sporsmal?: string; utdrag?: Utdrag[] };
  try { body = await request.json(); } catch { return svar({ feil: 'Ugyldig forespørsel.' }, 400); }
  const sporsmal = String(body.sporsmal ?? '').trim().slice(0, 400);
  const utdrag = (Array.isArray(body.utdrag) ? body.utdrag : []).slice(0, 8)
    .map((u, i) => ({ nr: i + 1, inst: String(u.inst ?? '').slice(0, 80), dok: String(u.dok ?? '').slice(0, 160), dato: u.dato ? String(u.dato).slice(0, 20) : '',
      side: Number(u.side) || 0, tekst: String(u.tekst ?? '').slice(0, 1600) }));
  if (!sporsmal || !utdrag.length) return svar({ feil: 'Spørsmål og utdrag mangler.' }, 400);

  const kontekst = utdrag.map((u) => `[${u.nr}] ${u.inst} – ${u.dok}${u.dato ? ` (${u.dato})` : ''}, side ${u.side}:\n${u.tekst}`).join('\n\n');
  const base = (env.MISTRAL_BASE_URL ?? 'https://api.mistral.ai/v1').replace(/\/$/, '');
  const r = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.MISTRAL_API_KEY}` },
    body: JSON.stringify({
      model: env.MISTRAL_MODEL ?? 'mistral-small-latest', temperature: 0.2, max_tokens: 700,
      messages: [{ role: 'system', content: INSTRUKS }, { role: 'user', content: `Spørsmål: ${sporsmal}\n\nUtdrag:\n${kontekst}` }],
    }),
  });
  if (!r.ok) return svar({ feil: `KI-tjenesten svarte med feil (${r.status}). Prøv igjen litt senere.` }, 502);
  const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
  const tekst = j.choices?.[0]?.message?.content?.trim();
  return tekst ? svar({ svar: tekst }) : svar({ feil: 'Tomt svar fra KI-tjenesten.' }, 502);
};
