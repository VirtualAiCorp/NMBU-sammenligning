# Publisering på Cloudflare Pages

Skrevet 23.09.2026, oppdatert samme kveld. Repoet ligger privat på GitHub
(`VirtualAiCorp/NMBU-sammenligning`); Cloudflare Pages bygger automatisk ved hver push til `main`.

**Besluttet 23.09:** ett åpent nettsted, `nmbu-sammenligning.pages.dev`, uten innlogging, siden alt er
offentlig statistikk. Handelshøyskolen er med og åpen; bare fanen «Emner + masteroppgave (NMBU)» med studentnivådata ligger bak passordsperren i appen (`VITE_HH_PASSORD`).
Sperren er en visningssperre, ikke sikkerhet: HH-dataene ligger i den bygde JavaScript-en.
Det alternative oppsettet med to nettsteder og Cloudflare Access står under som reserve.

| Variant | Bygg | Bruk |
|---|---|---|
| **Full** (dagens) | ingen `VITE_UTEN_HH` | Åpent nettsted med HH bak app-passord |
| **Uten HH** | `VITE_UTEN_HH=1` | Hvis HH en gang skal skilles ut på egen adresse med innlogging |

## 1. Repoet på GitHub (gjort 23.09)

Privat repo `VirtualAiCorp/NMBU-sammenligning`, remote `origin` via SSH. Claude har tillatelse til
`git -C ~/Desktop/BOA-sammenligning push` (regel i `~/.claude/settings.json`), så nye utvidelser
rulles ut ved at Claude committer og pusher til `main`; Cloudflare bygger på 1–3 minutter.
Merk: «Retry deployment» i Cloudflare bygger med innstillingene slik de var, ikke nødvendigvis med
nye miljøvariabler; en ny push er tryggere.

## 2. Pages-prosjekt (gjøres to ganger: åpent og HH)

Cloudflare-panelet → **Compute** → **Workers & Pages** → **Create** → fanen **Pages** →
**Import an existing Git repository** → velg repoet.

Byggeinnstillinger:

| Felt | Verdi |
|---|---|
| Project name | `nmbu-sammenligning` (åpent) / `nmbu-hh` (HH) |
| Production branch | `main` |
| Framework preset | None |
| Build command | `cd kilde && npm ci --legacy-peer-deps && npm run build` |
| Build output directory | `kilde/dist` |
| Environment variables | `NODE_VERSION` = `20`. `VITE_HH_PASSORD` = passordet for HH-delen. **Ikke** `VITE_UTEN_HH` på det åpne nettstedet (den bygger HH bort). |

**Save and Deploy**. Første bygg tar 2–4 minutter. Hver `git push` til `main` gir nytt bygg.

## 3. Innlogging (Access) per nettsted – reserve, ikke i bruk

I Pages-prosjektet → **Settings** → **General** → **Access policy** → **Enable**.
Første gang ber Cloudflare deg opprette et Zero Trust-team (velg et teamnavn, gratisplan; det kan
be om betalingskort selv om planen er gratis). Dette lager en Access-applikasjon for
`*.pages.dev`-adressen og alle forhåndsvisninger.

Deretter **Zero Trust** → **Access** → **Applications** → applikasjonen → **Policies** → rediger:

- Action: **Allow**
- Include: **Emails** → lim inn adressene, én per linje (ikke «Emails ending in @nmbu.no»: studenter
  har også nmbu.no-adresser).
- Login method: **One-time PIN** (standard).

Gjenta med egen, kortere liste for HH-prosjektet. Endringer i listen virker med en gang; ingen ny bygging.

## 4. Eget domene (valgfritt, senere)

Domenet (f.eks. fra domene.no) legges inn under **Domains** i Cloudflare, navnetjenerne byttes hos
domene.no, og i Pages-prosjektet → **Custom domains** legges `sammenligning.<domene>` og `hh.<domene>`
til. Access-applikasjonen må da også dekke de nye adressene (Zero Trust → Applications → legg til domene).

## 5. Verifisering av at HH er ute av det åpne bygget

```bash
cd kilde && VITE_UTEN_HH=1 npx vite build --outDir dist-uten-hh
grep -rl "masterLetter\|stipulatedSokerpress\|Norges Handelshøyskole" dist-uten-hh/assets | wc -l   # skal være 0
```

Mekanismen: `App.tsx` returnerer `null` før HH-delen når `VITE_UTEN_HH=1`, og `vite.config.ts`
aliaser HH-komponentene og HH-datasettene til `src/app/hh-stub.tsx` / `hh-stub-data.ts`.
Nye HH-komponenter som importeres i `App.tsx` må legges til i listen `HH_KOMPONENTER` i `vite.config.ts`.

## 6. Før bredere deling

- Anonymisering av NMBU-data på studentnivå i HH (`nmbuMasterData.ts`) er ikke gjort. Hold HH-listen kort.
- Styrepapir-PDF-ene under `kilde/public/markedsstatus/` er offentlige dokumenter og kan ligge åpent bak innloggingen.


## KI-nøkler (oppdatert 29.09.2026)

Settes under Workers & Pages → `nmbu-sammenligning` → Settings → Variables and Secrets, som type **Secret**, for Production:

| Navn | Bruk |
|---|---|
| `ANTHROPIC_API_KEY` | Claude Opus 5.5 i KI-chatten og markedsstatus (hovedmodell) |
| `MISTRAL_API_KEY` | Reserve når Anthropic er nede eller nøkkelen mangler |
| `ANTHROPIC_MODEL` | Valgfri, overstyrer `claude-opus-5-5` |

`INTERN_PASSORD` skal **aldri** legges inn i Cloudflare; da nekter KI-funksjonene å kjøre (se status-og-metode §41).
Nye secrets gjelder først etter en ny utrulling (Deployments → siste → Retry deployment, eller en ny push).

## 5. Eget nettsted med bare rangeringen: `hh-rangering` (04.10.2026)

Til å vise «Norwegian Business School Ranking» til kolleger uten å gi dem det interne passordet.
Byggevarianten `VITE_KUN_RANGERING=1` bruker egen inngang (`kilde/src/rangering-main.tsx`), tar ikke med
resten av nettstedet eller `public/` (bare `rangering-data.json` kopieres), og skriver til `kilde/dist-rangering`
(2,9 MB). Dataene er kryptert med **eget passord**, `RANGERING_PASSORD` i `kilde/.env.local` (laget av
`scripts/build-rangering.py` første gang). Det interne passordet åpner ikke denne siden, og omvendt.

Cloudflare-panelet → **Workers & Pages** → **Create** → **Pages** → **Import an existing Git repository** →
`VirtualAiCorp/NMBU-sammenligning`:

| Felt | Verdi |
|---|---|
| Project name | `hh-rangering` (gir `hh-rangering.pages.dev`) |
| Production branch | `main` |
| Framework preset | None |
| Build command | `cd kilde && npm ci --legacy-peer-deps && npm run build` |
| Build output directory | `kilde/dist-rangering` |
| Environment variables | `NODE_VERSION` = `20`, `VITE_KUN_RANGERING` = `1` (ingen `VITE_HH_PASSORD`, ingen API-nøkler) |

Begge prosjektene bygger ved hver push til `main`. `functions/` (KI-chatten) blir også lagt ut, men uten
`ANTHROPIC_API_KEY` svarer den ikke; siden bruker den ikke. Lokal test: launch-config `boa-rangering-delt`
(port 4183, `vite preview` av `dist-rangering`). Bytte passord: endre `RANGERING_PASSORD`, kjør
`/usr/local/bin/python3 scripts/build-rangering.py`, commit og push. Eget domene kan legges på senere (punkt 4).
