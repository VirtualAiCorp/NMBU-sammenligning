# Publisering på Cloudflare Pages med innlogging

Skrevet 23.09.2026. To nettsteder fra samme GitHub-repo, begge bak Cloudflare Access
(engangskode på e-post, navneliste). Gratis: Pages er gratis, Access er gratis for inntil 50 brukere.

| Nettsted | Innhold | Bygg | Hvem |
|---|---|---|---|
| **Åpent** (f.eks. `nmbu-sammenligning.pages.dev`) | NMBU-forsiden, fem fakulteter, «Alle emner ved NMBU». Handelshøyskolen er ikke med i bunten i det hele tatt. | `VITE_UTEN_HH=1` | NMBU-kretsen |
| **HH** (f.eks. `nmbu-hh.pages.dev`) | Alt, inkludert Handelshøyskolen | uten variabel | Liten liste |

## 1. Repoet på GitHub (én gang)

1. Opprett et **privat** repo på github.com, f.eks. `BOA-sammenligning`, tomt (ingen README).
2. Lokalt:
   ```bash
   cd ~/Desktop/BOA-sammenligning
   git remote add origin git@github.com:<konto>/BOA-sammenligning.git
   git push -u origin main
   ```
   Repoet er ca. 70 MB (styrepapir-PDF-ene). DBH-cachen er gitignored og går ikke med.

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
| Environment variables | `NODE_VERSION` = `20` (begge). Åpent: `VITE_UTEN_HH` = `1`. HH: `VITE_HH_PASSORD` = valgfritt ekstra passord (kan sløyfes; Access er selve sperren). |

**Save and Deploy**. Første bygg tar 2–4 minutter. Hver `git push` til `main` gir nytt bygg.

## 3. Innlogging (Access) per nettsted

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
