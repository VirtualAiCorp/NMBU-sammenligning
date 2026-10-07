# Kildeoversikt: «Økonomi og drift» og «Utdanning» (NMBU)

Kartlagt 30.09.2026. Dokumentet beskriver hvilke styringstall NMBU selv publiserer åpent, hva som er hentet ut, hva som
ikke er offentlig eller ikke er med, når nye tall kommer, og hvordan datafila oppdateres.

Alt er hentet fra offentlige dokumenter uten innlogging. Ingenting er lekket, og det er ikke sendt innsynsbegjæringer.

## 1. Filer

| Fil | Innhold |
|---|---|
| `data/nmbu/ledelse/kilder.json` | Kildeliste: `id`, `tittel`, `dato`, `url` (direkte PDF-lenke) og `fil` (PDF-navn i `kilde/public/ledelse/kilder/`) |
| `data/nmbu/ledelse/okonomi.json` | NMBU-nivå for «Økonomi og drift» og alle tekstene for inngangen |
| `data/nmbu/ledelse/okonomi-fakultet.json` | Resultat, prognose, balanse og ramme per fakultet (og «fakultetene samlet») |
| `data/nmbu/ledelse/utdanning.json` | NMBU-nivå for «Utdanning» og tekstene for inngangen |
| `data/nmbu/ledelse/utdanning-opptak.json` | Studieplasser (opptaksramme) og møtt per fakultet og nivå |
| `scripts/build-ledelse.py` | Slår sammen kildefilene, validerer og skriver datafila |
| `kilde/public/ledelse/nmbu.json` | Generert datafil (skal ikke redigeres for hånd) |
| `kilde/public/ledelse/kilder/*.pdf` | De 32 PDF-ene som siteres, til sammen 30,4 MB; største fil er 7,8 MB |

Punktene i kildefilene har i tillegg feltet `raa` (teksten slik den står på PDF-siden) og eventuelt `bilde: true`
(tabellen er et bilde og er lest visuelt). Disse feltene skrives ikke til `nmbu.json`.

`side` er alltid fysisk side i PDF-en, altså det `#page=N` åpner. Den trykte sidenummereringen i dokumentene avviker ofte
med én eller flere sider.

## 2. Hva NMBU publiserer, og hva som er hentet ut

### Universitetsstyret (opengov.360online.com/Meetings/nmbu)

Styret har offentlige saksdokumenter per sak. Universitetsstyret 2021–2025 er utvalg `342431`, 2025–2029 er `368286`.
Økonomisakene følger et fast årshjul:

| Møte | Sak | Brukt her |
|---|---|---|
| Januar/februar | Tildelingsbrevet fra KD | Brukt via regjeringen.no |
| Mars | Årsrapport, årsregnskap og rapport for 3. tertial med overføring av midler | T3 2022–2025 |
| Juni | Rapport for 1. tertial, årsplan og rammer for neste år (innledende behandling) | T1 2023–2026, årsplan 2027 |
| September | Budsjettforslag utenfor rammen, fra 2026 også utviklingsavtale og etatsstyring | Oversikt over budsjettforslag, utkast til ny utviklingsavtale, referat fra etatsstyringen |
| November | Rapport for 2. tertial, årsplan og økonomiske rammer, opptaksrammer og orientering om opptak | T2 2023–2025, årsplan 2026, opptaksrammer 2026, opptak 2024 og 2025 |

**Fakultetsresultater per tertial er offentlige.** Tertialrapportene har tabellen «Budsjettsituasjonen for enhetene».
Den viser for hvert fakultet og hver enhet inngående balanse, resultat hittil, budsjettavvik, prognose for året,
prognostisert utgående balanse og balansen i prosent av årets tildeling. Rapportene for 3. tertial og overføringssakene
viser årsresultat og overført balanse per fakultet. I rapporten for 1. tertial 2026 er tabellen et bilde; tallene er lest
visuelt og kontrollert mot at inngående balanse pluss prognose er lik utgående balanse.

Nettorammen per fakultet (budsjettfordelingen) står i årsplanene, tabell 1 «Fordeling av tildeling».

### Fakultetsstyrene

Hvert fakultetsstyre har egne offentlige saker med regnskap per tertial, årsplan og langtidsbudsjett. De kommer ofte
tidligere og er mer detaljerte enn universitetsstyrets rapport. Handelshøyskolens rapport per 2. tertial 2026 ble
behandlet 22.09.2026 og er tatt med for HH. Tallene i HHs egen rapport for 1. tertial 2026 stemmer eksakt med
universitetsstyrets tabell, så definisjonen er den samme. De andre fakultetsstyrenes saker er ikke hentet ut i denne
runden. Utvalgs-id-er: HH `372278`, BIOVIT `372294`, KBM `372033`, LANDSAM `372879`, MINA `369592`, REALTEK `372298`,
VET `372433`.

### Årsrapport og årsregnskap

Endelige årsrapporter med årsregnskap for 2023, 2024 og 2025 er lenket fra https://www.nmbu.no/om/arsrapporter-nmbu.
Filene ligger på NMBUs nettstedsvert (`main-…platformsh.site`), og det er den adressen som står i `url`. Hentet ut:

- resultatregnskapet (driftsinntekter, driftskostnader, driftsresultat, inntekt fra bevilgning, bidrag)
- tabellen over oppdragsinntekter og resultatgrad
- note 15 del IV om avsetninger fra KD
- hovedtall om registrerte studenter og fullførte grader

### Kunnskapsdepartementet (regjeringen.no)

- **Tildelingsbrev 2025 og 2026** er brukt til tekst om studieplasser og veterinærutdanningen. Ingen av dem har
  kandidatmåltall for NMBU.
- **«Orientering om statsbudsjettet for universitet og høgskular»** for 2024, 2025 og 2026 er KDs fordeling av Prop. 1 S
  per institusjon. Herfra er hentet rammebevilgning, resultatbasert uttelling, fullføringsgraden i finansieringssystemet
  og nye studieplasser. Prop. 1 S er ikke lest direkte, fordi orienteringen gir de samme tallene per institusjon.
- **Utviklingsavtalen 2023–2026** har ni styringsparametere uten tallfestede mål. Utkastet til avtale for 2027–2030
  (universitetsstyret 10.09.2026) har ti styringsparametere, også uten tallfestede mål. Det finnes derfor ingen
  «mål mot resultat»-tall fra avtalen.

### Serier i datafila

**Økonomi og drift, NMBU-nivå:**

| Serie | Perioder |
|---|---|
| Driftsinntekter, driftskostnader, driftsresultat, inntekt fra bevilgning, bidragsinntekter | 2022–2025 |
| Oppdragsinntekter og resultatgrad | 2021–2025, med målet på minst 5 % |
| Nettoinndekning fra bidrags- og oppdragsaktivitet | 2023–2025 og 1. tertial 2026 med prognose |
| Rammebevilgning fra KD | 2023–2026, med langtidsprognosen for 2027–2031 |
| Resultatbasert uttelling | 2025–2026, og anslag for 2027 |
| Avsetninger i mill. kr og i prosent av bevilgningen, og avsetninger til andre formål | 2023–2025 |
| Driftsresultat i internregnskapet | 2023–2025 og 1. tertial 2026 med prognose |
| Årsverk totalt, bevilgningsfinansiert og eksternt finansiert | 2023–2025 og 1. tertial 2026 |
| Disponible midler | Budsjett 2025–2026, foreløpig 2027 |

**Økonomi og drift, per fakultet og for fakultetene samlet:**

| Serie | Perioder |
|---|---|
| Årsresultat for tildelte midler | År 2022–2025, prognose ved hvert tertial 2023-T1 til 2026-T1 (HH også 2026-T2), budsjett/plan for VET 2026–2030 og HH 2026–2030 |
| Resultat hittil ved tertialet | Samme tertialer |
| Akkumulert balanse ved årsslutt | År 2022–2025 og prognose ved tertialene |
| Balansen i prosent av årets tildeling | Prognose ved tertialene |
| Nettoramme | Budsjett 2025–2026, foreløpig 2027 |

**Utdanning, NMBU-nivå:**

| Serie | Perioder |
|---|---|
| Studiepoengproduksjon og studiepoeng per faglig årsverk | 2023–2025 |
| Andel som fullfører på normert tid (bachelor, femårig master, toårig master, profesjon) | 2023–2025 |
| KDs fullføringsgrad | 2023–2024 |
| Studentenes tilfredshet med studiekvaliteten | 2023–2025 |
| Kvalifiserte førsteprioritetssøkere, Samordna og lokalt | 2023–2025 |
| Møtt totalt, registrerte studenter, fullførte grader | 2023–2025 |
| Doktorgrader | 2023–2025 og 1. tertial 2026 |
| Nye studieplasser fra KD | 2023–2025 |
| Deltakere i etter- og videreutdanning, inn- og utvekslingsstudenter | 2023–2025 |
| Lektorutdanning i realfag mot kandidatmåltallet (REALTEK) | 2022–2023 |

**Utdanning, per fakultet og NMBU:** studieplasser (opptaksramme) for 2024–2026 og møtt for 2023–2025, fordelt på
treårig bachelor, femårig master/veterinær og toårig master.

## 3. Hva som ikke er offentlig eller ikke er med

- **Unntatt offentlighet:** Innkallingene til universitetsstyret er merket «offentlig versjon», så enkelte dokumenter
  holdes tilbake. Ingen av økonomi- eller utdanningssakene som er brukt, manglet vedlegg. Bare dokumenter som ligger
  åpent per sak, er brukt.
- **Eksternregnskapet per tertial** (delårsregnskapet til KD) ligger som vedlegg til tertialsakene, men er ikke hentet
  ut. Vedlegget for 2. tertial 2023 er 22 MB og over grensen på 20 MB.
- **Nettoramme per fakultet for 2024** er ikke med. Årsplanen for 2024 oppgir fakultetsrammen med en annen
  avgrensning, uten strategiske midler, husleie og rekrutteringsstillinger, og den kan derfor ikke sammenlignes med
  2025–2027.
- **Ubrukte midler i internregnskapet totalt** er ikke med. Rapporten for 3. tertial 2023 har to ulike totalsummer for
  samme tabell (100,7 og 104,4 mill. kr). Avsetningene fra årsregnskapets note 15 brukes i stedet.
- **Kandidatmåltall:** Tildelingsbrevene for 2025 og 2026 har ingen. Bare lektorutdanning i realfag har et oppgitt
  måltall (20 per år, i årsrapporten for 2023).
- **Fakultetsfordelt utdanningskvalitet** (gjennomføring og studiepoeng per fakultet) finnes ikke i universitetsstyrets
  rapporter. Tertialrapportene har bare NMBU-tall. Per fakultet dekker DBH-sidene dette allerede.
- **HK-dirs tilstandsrapport** og flere DBH-tabeller er ikke gjennomgått i denne runden. Tallene der bygger på DBH, som
  siden allerede bruker.

**Avvik i kildene som er beholdt slik de står:**

- HHs prognose per 2. tertial 2024 er identisk med 1. tertial (−4,4 mill. kr). Det kan være en kopi i kilden.
- VETs inngående balanse for 2026 er −80,4 mill. kr i overføringssaken, men −81,4 i tabellen for 1. tertial 2026.
- Møtt på toårig master i 2025 er 703 i saksframlegget og 751 summert i vedleggstabellen.
- Studieplassene i møtt-rapportene er ikke alltid like opptaksrammene som ble vedtatt året før, for eksempel toårig
  master 2025 med 973 mot 997 plasser. Hvert år er tatt fra årets egen rapport.
- Årsrapporten for 2023 oppgir driftsinntekter på 2 642,2 mill. kr i teksten, men 2 639,2 i resultatregnskapet.
  Resultatregnskapet er brukt.
- Tabellen i tertialrapporten for 1. tertial 2023 har overskriften «IB 2022», men viser inngående balanse for 2023.

## 4. Når nye tall kommer

Universitetsstyrets møteplan etter 10.09.2026 var ikke publisert 30.09.2026. Datoene under bygger på mønsteret
2023–2025.

| Når | Hva | Påvirker |
|---|---|---|
| ~~Tidlig i oktober 2026~~ 7.10.2026, lagt inn | Prop. 1 S 2027 (statsbudsjettforslaget) og KDs «Orientering om forslag til statsbudsjettet 2027» | `statsbudsjett-2027.json`, rammebevilgning og resultatuttelling 2027 (budsjett) |
| Oktober 2026 | Fakultetsstyrenes regnskap per 2. tertial for BIOVIT, KBM, LANDSAM, MINA, REALTEK og VET | Fakultetsprognoser 2026-T2 |
| November 2026 (2025: 10.11, 2024: 13.11) | Universitetsstyret: rapport for 2. tertial 2026, årsplan og rammer 2027, opptaksrammer 2027/28, orientering om opptak 2026 | Alle fakultetsserier 2026-T2, nettoramme 2027, plasser og møtt |
| Desember 2026 | Orientering om statsbudsjettet 2027 etter vedtak, tildelingsbrev 2027 | Rammebevilgning 2027, resultatbasert uttelling, fullføringsgrad 2025 |
| Januar/februar 2027 | Fakultetsstyrenes regnskap 2026 | Fakultetenes årsresultat 2026 (foreløpig) |
| Mars 2027 | Universitetsstyret: årsrapport og årsregnskap 2026, rapport for 3. tertial 2026 | Årsregnskapstall, avsetninger, måleparametere for utdanning, årsresultat per fakultet |
| Juni 2027 | Universitetsstyret: rapport for 1. tertial 2027 og årsplan 2028 (innledende behandling) | 2027-T1 og langtidsprognose |

Neste Studiebarometer gjennomføres høsten 2027. HK-dir har gått over til måling annethvert år.

## 5. Slik oppdateres datafila

1. **Finn saken.** Gå til utvalget på opengov, for eksempel
   `https://opengov.360online.com/Meetings/nmbu/Boards/Details/368286?Year=2026&Month=-1&focus=true`. Åpne møtet.
   Vedleggene til hver sak ligger bak «saken» i sakslisten; direkte adresse er
   `https://opengov.360online.com/Meetings/nmbu/Meetings/LoadAgendaItemDetail/<id>?id=<id>&trimResult=true`.
   Kopier PDF-lenken (`…/File/Details/<nr>.pdf?fileName=…`) og fjern `&fileSize=…`.
2. **Legg til kilden** i `data/nmbu/ledelse/kilder.json` med `id`, `tittel` (inkl. sak), `dato` (møtedato),
   `url` og `fil`. Filnavn følger mønsteret `us-ÅÅÅÅ-MM-DD-sak-NN-ÅÅ-<kort>.pdf`
   (fakultetsstyret HH: `hh-fs-…`).
3. **Hent PDF-en:** `python3 scripts/build-ledelse.py --hent` laster ned PDF-er som mangler. Maks 20 MB per fil.
4. **Registrer tallene.**
   - Legg nye punkter i riktig serie i kildefilene, med `periode`, `type`, `verdi`, `kilde`, `side` (fysisk side) og
     `raa` (teksten slik den står, for eksempel `"-12 131"`).
   - Tall i 1000 kr gjøres om til mill. kr med tre desimaler.
   - For tertial brukes `periode` `ÅÅÅÅ-Tn`. Resultat hittil får `type` `tertial`, og prognosen for året avgitt ved
     tertialet får `prognose`. Årsresultat fra 3. tertial eller årsregnskap får `år`.
   - Er tabellen et bilde i PDF-en, setter du `bilde: true` og kontrollerer med regnestykket
     inngående balanse + prognose = utgående balanse.
   - Fakultets-id-ene er `hh`, `realtek`, `landsam`, `mina`, `vet`, `biovit` og `kbm`.
5. **Bygg og kontroller:**

   ```bash
   python3 -m venv /tmp/ledelsevenv && /tmp/ledelsevenv/bin/pip install pypdf
   /tmp/ledelsevenv/bin/python scripts/build-ledelse.py --kontroller
   ```

   - Skriptet stopper med kode 1 og skriver `AVVIK` hvis en punktverdi mangler kilde, kilden er ukjent, PDF-en mangler
     eller er over 20 MB, siden ikke finnes, `nivaa`/`type`/`periode` er ugyldig, en serie har dobbelt punkt, eller
     `raa` ikke finnes på oppgitt side.
   - Uten pypdf kjører alt unntatt sidekontrollen.
   - Status 30.09.2026: 575 punkter. 540 er funnet i PDF-teksten, og 35 er lest fra bildetabeller.
6. **Tekstene** (`tekst` i kildefilene) skal være parafrasert, uten personnavn og med sitater under 15 ord. Hver tekst
   har kilder med side. Ved ny tertialrapport bør «Hovedpunkter fra siste tertialrapport» skrives om.

## Statsbudsjettet (lagt inn 7.10.2026)

`data/nmbu/ledelse/statsbudsjett-<år>.json` beskriver hvordan statsbudsjettet treffer NMBU og HH. `build-ledelse.py` skriver
nyeste år som blokken `statsbudsjett` i `public/ledelse/nmbu.json` og sjekker alle `kilde`/`side`-par mot kildelista og
sidetallet i PDF-ene. Visningen er `styringsinformasjon/Statsbudsjett.tsx` øverst på «Økonomi og drift» (fire deler: NMBU
fra 2026 til 2027 med NMBUs egen prognose, Handelshøyskolen, kompetansebudsjettet med våre vurderinger, og sektoren).
KI-chatten får linjene fra `statsbudsjett_linjer()` i `build-ki-grunnlag.py`.

- **Kilder:** KDs orientering om forslaget (foreløpig tildelingsbrev, `kd-orientering-forslag-statsbudsjettet-2027.pdf`) og hele
  Prop. 1 S (2026–2027) KD (`kd-prop-1-s-2026-2027.pdf`, 5,9 MB). I Prop. 1 S er den trykte siden 2 lavere enn PDF-siden; dataene
  bruker PDF-siden, og sitatene har `trykt` i tillegg. Kompetansebudsjettet er del III kap. 5 (PDF-s. 217–235).
- **Kontroll:** summene i KDs tabell 3 (45 892 711 / 47 862 058 / 256 155 i 1 000 kr) er gjenskapt fra radene; prisjusteringen er
  3,7 % av rammen for hver institusjon.
- **HH-tall:** HHs studiepoeng er DBH-tabell 900 (ny produksjon, egenfinansiert), ikke KDs indikator. HHs andel av uttellingen
  (9,2 mill. kr) er NMBUs eget anslag i sak 24/26 s. 8.
- **Vurderingene** (`tekst`) er studierådgivernes, merket slik i visningen og i KI-linjene.
- **Neste:** etter budsjettvedtaket i desember: legg inn orienteringen etter vedtak og tildelingsbrevet 2027, sett `status` til
  «vedtatt», og oppdater fakultetsrammene når universitetsstyret har vedtatt endelige rammer for 2027.
