# Overlevering 29.09.2026 – NMBU-sammenligning (for KI-modell etter compact)

Skrevet av Claude Opus 5.5 etter økten 25.–29.09.2026. Dette dokumentet er ment for en KI-modell som tar over
uten samtalehistorikk. **Les i denne rekkefølgen:**

1. Dette dokumentet.
2. `docs/status-og-metode.md` §1–2 (utgangspunkt, datakjeden), §6–7 (gjenstår, fallgruver), §9 (kommandoer),
   deretter §31–40 (alt fra 25.09 og framover).
3. `docs/handover-2026-09-23.md` (appstruktur, datakjede, eldre beslutninger).
4. `docs/publisering-cloudflare.md` ved endringer i utrulling eller Functions.

Arbeidstreet var rent ved skriving (siste commit før dette dokumentet: `c6b847b`).

---

## 1. Hva prosjektet er

Et sammenligningsverktøy for NMBU. Det viser opptak, karakterer, gjennomføring, studentene, Studiebarometeret,
markedsstatus, inntekt, arbeidsmarked, fagmiljø, søkergrunnlag, bolig og økonomi. Hvert NMBU-fakultet (HH, REALTEK,
LANDSAM, MINA, VET, BIOVIT, KBM) sammenlignes mot konkurrerende program ved andre norske institusjoner. Hele NMBU
har også egne sider.

- **Repo:** `~/Desktop/BOA-sammenligning`. Mappenavnet er historisk. GitHub-repoet `VirtualAiCorp/NMBU-sammenligning`
  er privat.
- **Live:** https://nmbu-sammenligning.pages.dev. Cloudflare Pages bygger automatisk ved push til `main`.
- **Eier:** Mathias Smøgeli, studierådgiver ved HH. Verktøyet skal framstå som laget av *studierådgiverne ved
  Handelshøyskolen*, ikke av én person (se `LagetAv.tsx`).
- **Språk:** norsk bokmål i UI, kode, kommentarer og commit-meldinger. Bruk desimalkomma.

## 2. Stack, bygg, utrulling og verifisering

| Del | Hvor |
|---|---|
| App | Vite + React 18 + Tailwind 4 + Recharts i `kilde/` (`kilde/src/app`) |
| Serverfunksjoner | Cloudflare Pages Functions i `functions/api/` (`chat.ts`, `markedsstatus-svar.ts`). `functions/_lib/` rutes ikke |
| Data | Python-skript i `scripts/` skriver `kilde/src/app/data/*.ts|json` (i bunten) og `kilde/public/**.json` (lastes ved behov med `fetch`) |
| Rådata-cache | `data/<fak>/kilder/…` og `data/nmbu/kilder/…`, gitignored (unntatt `samordna-ledige/`-øyeblikksbilder) |

**Kommandoer:**

```bash
cd ~/Desktop/BOA-sammenligning/kilde && npx vite --port 5173    # utvikling
cd ~/Desktop/BOA-sammenligning/kilde && npm run build            # må gå feilfritt før push
python3 scripts/build-ki-grunnlag.py                             # etter enhver dataendring som chatten bør kjenne
```

**Utrulling:** commit og push til `main` utløser automatisk bygg i Cloudflare (1–3 min). Claude har lov til å
committe og pushe i dette repoet. Mathias styrer Cloudflare-panelet (Secrets, WAF, domener).

**Verifisering:** gjør den alltid selv, og helst mot live etter push.

- **Røyktest:** `scripts/royktest.mjs` (Playwright, klikker gjennom alle fakulteter × moduler og NMBU-sidene).
  Kjør den fra en mappe med `playwright-core` installert, for eksempel scratchpad:
  `node <repo>/scripts/royktest.mjs <url> nmbu:light,nmbu:dark,vac:light,fjord:dark,lyng:light`.
  Resultater: 368 visninger lokalt og 184 live 26.09, 99 (nmbu lys) etter årsstudiene, alle uten funn.
- **Skjermbilder:** egne Playwright-skript i scratchpad med `chromium.launch({ channel: 'chrome' })`.
- **KI-chatten:** POST til `https://nmbu-sammenligning.pages.dev/api/chat` **med `Origin`-header**, ellers avvises
  kallet. Svaret har `versjon`. Den skal være lik `VERSJON` i `functions/_lib/ki.ts`, som er `'2026-09-26c'` nå.
  Øk versjonen ved hver endring i chat-oppførselen, slik at du ser når utrullingen er ute.
- `npx tsc` finnes ikke i prosjektet. `npx -p typescript@5.6 tsc --noEmit` gir mye støy fra React-typer, så
  `npm run build` pluss røyktest er den reelle kontrollen.

## 3. Faste regler (skal ikke brytes)

- Excel-filer skal aldri inn i repoet. Interne data skal bare ligge aggregert og kryptert.
- `INTERN_PASSORD` ligger i `kilde/.env.local` (ikke `VITE_`-prefiks, så den havner aldri i bunten). Den brukes av
  `scripts/build-opptak-intern.py` til å kryptere interne sider. Skriv aldri passordet i nettleseren, i
  dokumenter eller i commits.
- Mistral-nøkkelen finnes bare som Cloudflare Secret (`MISTRAL_API_KEY`). Mistral er valgt fordi den er i EU.
- Agenter (Agent-verktøyet) får **ikke** kjøre git og får ikke starte egne underagenter. Hovedmodellen committer.
- HHs originalkomponenter fra Figma er urørt. De endres bare ved innpakning eller CSS-overstyring.
- Behold Figma-designet og NMBU-uttrykket. Nye kort følger mønsteret i eksisterende kort (hvit boks, avrundet
  ramme, `var(--nmbu-…)`-farger).
- Bruk ikke lekket materiale. Send ingen skjemaer eller innsynsbegjæringer på vegne av brukeren.
- FS-uttrekk skal klareres med personvernombudet. Mathias tar ut FS-data selv.
- Umaskerte interne tall skal ikke på den åpne siden.
- Genererte datafiler (`data/*Data.ts` og `.json`, `public/**.json`) skal ikke redigeres for hånd. Endre skriptet
  eller koblingsfilen og bygg på nytt.

## 4. Hva som ble gjort 25.–29.09 (kort, med filer)

Detaljer står i status-og-metode §31–40.

### Navigasjon, utseende og oppsett

- **Mobilmeny:** `TopRightControls.tsx` bruker `absolute sm:fixed`, så Oppsett-knappene ikke dekker innholdet.
- **Blank skjerm ved klikk i oversiktsmatrisen:** `Panel`, `MiniTrend`, `MiniBar` og `opMottData` eksporteres nå
  fra `Matrise.tsx`.
- **Sammenleggbar sidemeny (256↔72 px):** `DashboardShell` i `AppShells.tsx` lagrer tilstanden i
  localStorage-nøkkelen `nmbu-sidemeny`. Hint med fullt navn (HH → Handelshøyskolen) kommer fra `MenyHint.tsx`.
  Fakultetsmodulene åpnes med `grid-template-rows`-animasjon.
- **Fakultetsrekkefølge:** sortert etter registrerte studenter (`FACULTY_IDS` i `facultyMeta.ts`, HH øverst i
  `ALL`).
- **Fargetemaer:** NMBU (standard, uten attributt), Virtual AI Corp, Fjord og Lyng.
  - Settes som `data-farge` på `<html>` av `fargetemaStore.ts`. Kan også velges med `?farge=`.
  - Farger ligger i `styles/tema.css` og `tema-overrides.css`, som genereres av `scripts/build-tema-css.py`.
  - Mørk modus: `dark-overrides.css` (`scripts/build-dark-css.py`) med `--dm-surface`, `--dm-graf-linje` og
    `--dm-graf-soyle` per tema.
  - Velgeren ligger i Oppsett-menyen.
- **Skrift:** IBM Plex (Serif i titler, Sans i tekst, Mono i tall). Filene er `fonts.css`, `theme.css` og
  `skrift.css`, der sistnevnte fanger inline `'Lora'` og `ui-monospace`. VAC-temaet bruker Newsreader, Work Sans og
  JetBrains Mono. Skriftvalget ligger i artefakten https://claude.ai/artifact/JTuSAKUmp8kbifNmSrmhcA (Mathias valgte
  alternativ 2).
- **Forside:**
  - `Forsidenotis.tsx` øverst sier at vårens 2026-emner blir synlige i DBH 15.10 og deretter overføres.
  - `LagetAv.tsx` står **helt nederst på siden**, ikke i HH-kortet. Mathias rettet dette eksplisitt.
  - Både `ShellHome` (i `AppShells.tsx`) og `FacultyLanding.tsx` bruker dem.

### KI-chatten

- **Arkitektur:**
  - `KiChatKnapp.tsx` og `KiChatPanel.tsx` henter data på klienten.
  - Klienten gjør BM25-søk over `public/ki/<fak>-data.json`, `nmbu-data.json` og `felles-data.json`. Filene bygges
    av `scripts/build-ki-grunnlag.py`.
  - De beste linjene sendes til `functions/api/chat.ts`, som kaller Mistral med instruks og regler fra
    `functions/_lib/ki.ts`.
- **Linjeformat:** `[gruppe, program, tekst, flagg, fak, gid, maal?]`.
  - Flagg er ett av `n`, `h`, `r`, `o`, `e`, `f`, `s` eller `''`.
  - Hver linje er høyst 2 400 tegn, og serveren kutter der. Lange oversikter deles derfor i biter på ≤ 2 250 tegn.
- **Moduler:** gjenkjennes med regex-lista `SIDER` og linjeprefiksene STUDENTENE, STUDIEBAROMETERET, EMNER OG
  KARAKTERER, FAGMILJØET, SØKERGRUNNLAGET, STRATEGIER, ARBEIDSMARKEDET og INNTEKT.
  - `FELLES_MODUL` er FAGMILJØET, SØKERGRUNNLAGET, STRATEGIER og INNTEKT.
- **Omfang:**
  - `finnOmfang` (`FAK_ORD`) avgjør hvilket fakultet spørsmålet gjelder. VET må skrives med store bokstaver,
    fordi «vet» også er et verb.
  - `HELE_NMBU` og OVERSIKT-linjer brukes ved spørsmål om hele NMBU eller rangering.
- **«Ta meg til»:** `finnMaal` lager lenker, også til `nmbu-fagmiljo`, `nmbu-sokergrunnlag` og `#strategier` (bare
  HH).
- **Stemming:** `stamme` i `styrepapirSok.ts` kjøres i to pass, slik at «karakterindeksen» og «karakterindeks»
  treffer hverandre.
- **Sikkerhet:**
  - `fremmedOpphav` avviser kall uten `Origin`.
  - `forMange` begrenser trafikken per IP med `caches.default`: chat 40 og markedsstatus 30 per 10 min.
  - `renTekst` og `erInjeksjon` renser og sjekker tekst fra klienten.
  - Ugyldig JSON gir 400.
- **Instruksen** i `chat.ts`:
  - svar bare fra kildene, uten å bytte ut ett program med et annet;
  - ingen forklaringer uten kilde, og ingen råd;
  - fravær av data er ikke «ingen»;
  - ingen sammenligning med snitt som ikke står i kildene;
  - bruk nyeste år, ikke 2024-raden.
- **Kontroll av tall:** `ubekreftedeTall` returnerer tall i svaret som ikke finnes i kildene, og klienten viser dem
  som advarsel.

### Nye moduler og datasett (status-og-metode §36, §39 og §40)

- **Strategier mot 2030** (HH, egen fane under Markedsstatus):
  - Komponenter: `StrategierMot2030.tsx` og `FacultyMarketStatus.tsx`, som holder fanen i sync med `#strategier`
    i adressen.
  - Data: `data/hh/strategier/*.json` (13 institusjoner) og `_syntese.json`, bygd av `scripts/build-strategier.py`.
- **Studieplasser 2016–2026 og ledig-lista 2026:**
  - Komponent: `Studieplasser.tsx` i opptaksanalysen.
  - Data: `fetch-samordna-katalog.py` og `fetch-samordna-ledige.py`.
- **Oppmøte og stryk av oppmeldte (DBH 905):**
  - To nye kolonner i emnetabellen i `LandsamCourseAnalysis.tsx`.
  - Data: `build-oppmote.py`.
- **Arbeidsmarkedet** (ny modul per fakultet):
  - Komponent: `FacultyArbeidsmarked.tsx`, med visningen `'arbeidsmarked'` i `App.tsx`.
  - Data: `build-arbeidsmarked.py` og `data/nmbu/arbeidsmarked-kobling.json`.
- **Forskningsfinansiering** (Forskningsrådet og CORDIS):
  - Komponent: `Forskningsfinansiering.tsx` i Fagmiljøet, både for fakultetene og for hele NMBU.
  - Data: `build-forskning.py`.
- **Overgang fra videregående og SSB-landssnitt for gjennomføring:**
  - Komponenter: `OvergangKort` i `Sokergrunnlag.tsx` og en linje i `FacultyCompletion.tsx`.
  - Data: `build-overgang.py`, `build-gjennomforing-landssnitt.py` og
    `data/nmbu/gjennomforing-landssnitt-kobling.json`.
- **Årsstudier:**
  - HH har fått gruppen «Årsstudier i økonomi og ledelse» med det nye nivået `aarsstudium`. Det finnes i
    `LandsamLevel` i alle `*AdmissionData.ts`, i typelinjen i `build-landsam-data.py` og i `LEVEL_LABEL`-kartene.
  - `PrisOgCampus` regner årsstudier som ett år.
  - Programmene er lista `ARS` i `scripts/make-hh-programkart.py`.
  - Standardmålet er «Alle søkere». Poenggrense 0/0 vises som «Alle kvalifiserte».
- **Alle NMBUs programkoder etter studiepoeng:**
  - Komponent: `NmbuProduksjon.tsx`, på Inntekt per fakultet og på Økonomi for hele NMBU.
  - Data: `NMBU_PRODUKSJON` fra `scripts/build-revenue.py` (DBH 900 og 347).
  - Årsstudier gir ikke fullføringsuttelling (G3).

**Hovedfunn å kjenne til:** årsstudiet i bærekraftig økonomi og ledelse (SO 192253, DBH KVU-BEDØK) er NMBUs største
program målt i studiepoeng i 2025.

- 692,5 studentårsverk, som er 12,2 % av NMBU og halvparten av HH.
- Nest størst i anslått uttelling (40,6 mill. kr), etter veterinærmedisin (89,0 mill. kr).
- Ikke-gradsaktivitet står for om lag 18 % av NMBUs studiepoeng.

## 5. Kjente svakheter

- **Modellen:** den regner av og til ut differanser selv (fanges som «ubekreftet») og kan gi klønete formuleringer
  som «4,1 mot 4,1 over». Rett slikt med data og instruks, ikke med etterbehandling av svaret.
- **Usikre DBH-koblinger for årsstudiene:**
  - Nord HR (PK1) og HiMolde logistikk (ALOGNETT) er antatt.
  - INN Bedriftsøkonomi, INN Organisasjon og ledelse og UiS Økonomi og jus har ingen entydig kode og mangler emner
    og inntekt.
- **Forskningsrådet:** søknadstallene fra 2023 er for lave, fordi Tibi mangler i de åpne dataene. Nesten halvparten
  av NMBU-søknadene står på universitetsnivå, så fakultetstallene er minimumstall.
- **Oppmøte og landssnitt:** BI rapporterer ikke oppmøte. Toårige mastere har ikke SSB-landssnitt.
- **Ledige plasser:** Samordna nullstiller «ledig»-merket når opptaket arkiveres. Bare 2026 finnes, og nye år må tas
  som øyeblikksbilder i sesongen.

## 6. Planlagte oppgaver og ventende beslutninger

**Planlagte oppgaver** (i `~/.claude/scheduled-tasks/`):

- `dbh-var-2026-emner`, **15.10.2026 kl. 09:00:**
  - Sjekk om vårens 2026-karakterer er i DBH (tabell 308, NMBU 1173).
  - Gi Mathias sjekklisten: bygg på nytt med `--refresh` (karakterer og emner, `build-oppmote.py`,
    `build-ki-grunnlag.py`), kjør røyktesten, og oppdater eller fjern `Forsidenotis.tsx`.
  - Spør før du bygger eller pusher.
- `statsbudsjett-nmbu-oppfolging`, **07.10.2026:** følg opp statsbudsjettet for NMBU.

**Venter på Mathias:**

- FS192.002-uttrekk (aldersfordeling og mer). Det må klareres med personvernombudet, og Mathias tar ut data selv.
- En WAF-regel for hastighet i Cloudflare-dashbordet, som supplement til `forMange`.
- Planlegging av `fetch-samordna-ledige.py` for 19.7–30.9.2027 (datert øyeblikksbilde, for eksempel ukentlig).
- Om bunnteksten på fakultetssidene også skal få `LagetAv`-teksten.
- Åpent fra før (§6): HH over på DBH-kjeden, to tomme studieplaner (UiT Kjemi, UiB Ernæring), og styrepapirer bak
  innlogging.
- **DBH 2026-årgangen** (karakterer og lokale opptak) kommer normalt i februar–mars. Da kjøres alle generatorene
  med `--refresh`, og deretter `build-ki-grunnlag.py`.

## 7. Arbeidsmønster som har fungert

1. Les relevant del av status-og-metode og koden før du endrer noe. Mange ting har skjulte koblinger, for eksempel
   nye nivåer i `LandsamLevel` og nye moduler i `SIDER` og røyktestens `MOD`-liste.
2. Lag en ny komponent som plassholder først hvis dev-serveren kjører. En manglende import stopper hele appen.
3. For nye datasett:
   - skriptet skal ha kilder og «Bruk:» øverst;
   - skriv til `public/…` for store data;
   - legg til linjer i `build-ki-grunnlag.py` og en beskrivelse i instruksen i `chat.ts`;
   - øk `VERSJON`.
4. Når endringen er ferdig:
   - kjør `npm run build`;
   - skriv en ny §-seksjon i `docs/status-og-metode.md` med dato;
   - commit med norsk melding og push;
   - kontroller live med røyktest, skjermbilde og chatspørsmål.
5. Svar Mathias kort på norsk og si ærlig hva som er verifisert og hva som ikke er det.
