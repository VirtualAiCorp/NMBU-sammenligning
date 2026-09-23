# BOA-sammenligning: metode, struktur og status

Skrevet 23.09.2026. Dette er arbeidsnotatet for hvordan datasettet er bygd, hva som er i mål,
hva som gjenstår, og hvor fallgruvene ligger. `OVERSIKT.md` beskriver filene; dette dokumentet
beskriver fremgangsmåten.

## 1. Utgangspunkt

- Handelshøyskolen NMBU sitt sammenligningsverktøy (Bachelor og Master i økonomi og administrasjon)
  ble bygd i Figma Make, eksportert som kode 22.09.2026 og lagt i `kilde/`. Det er urørt, bortsett
  fra at det nå ligger under en NMBU-forside med ett kort per fakultet.
- Mål: samme type sammenligning for de andre fakultetene, mot deres reelle konkurrenter, og
  utelukkende fra kilder som kan hentes på nytt maskinelt eller er dokumentert per fil.
- Kun intern bruk inntil videre. Ingen publisering.

## 2. Datakjeden per fakultet

Hvert fakultet (`landsam`, `realtek`, `biovit`, `kbm`, `mina`) har samme mappe og samme kjede.
`scripts/build-faculty.sh <fakultet>` kjører alt i rekkefølge.

| Steg | Input (redigerbar) | Kilde | Skript | Output i appen |
|---|---|---|---|---|
| 1 Programkart | `data/<f>/programkart.json` | Agent: nmbu.no + SO-tabellen | – | – |
| 2 Opptak | programkart + `data/<f>/kilder/so_*.{json,csv}` | Samordna opptak (programtabell 2026 med 2021–2026; Tableau-CSV for poenggrenser 2020–2026). Lokale opptak (toårig master): DBH tabell 379 via `fill-local-admissions.py <f>` som skriver `localData` i programkartet (søkere, førstevalg, kvinneandel, kvalifiserte, tilbud, akseptert, møtt). Snittpoeng for Samordna-program: DBH tabell 571 via `fetch-admission-points.py` → `kilder/dbh571_opptakspoeng.json` (se §11) | `build-landsam-data.py` + `check-landsam-data.py` | `<f>AdmissionData.ts` |
| 3 DBH-kobling | `data/<f>/dbh-programkart.json` | Agent: DBH tabell 347 verifisert mot 308 | – | – |
| 4 Karakterer | dbh-programkart | DBH tabell 308 (karakterer) + 208 (emnenavn), programnivå og emnenivå, totaler uten karakter for skjerming | `build-landsam-courses.py` (cache i `data/<f>/kilder/dbh-cache/`, gitignored) | `<f>CourseData.ts` |
| 5 Emnekobling | `data/<f>/emnekobling/<gruppe>.json` | Agent: studieplaner + emnebeskrivelser | `build-landsam-course-mapping.py` (validerer koder mot steg 4) | `<f>CourseMapping.ts` |
| 6 Studieplaner | `data/<f>/studieplaner/<entryId>.json` | Agent: offisielle studieplaner (PDF/HTML/API) | `link-studyplan-codes.py` (kobler emnekode → DBH-kode) + `build-landsam-studyplans.py` | `<f>StudyPlanData.ts` |
| 7 Studiebarometeret | dbh-programkart | studiebarometeret.no, id = `institusjonskode_programkode` | `build-studiebarometer.py <f>` | `<f>StudiebarometerData.ts` |
| 8 Markedsstatus | `data/<f>/markedsstatus.json` + `data/<f>/pdf/` | Agent: styrepapirer via opengov og styresider | `build-markedsstatus.py <f>` (kopierer PDF til `kilde/public/markedsstatus/<f>/`) | `<f>MarketStatusData.ts` |

Steg 7 og 8 kjøres separat, ikke av `build-faculty.sh`.

I tillegg, på tvers av fakultetene: **Alle emner ved NMBU** (`scripts/build-nmbu-courses.py` →
`kilde/public/nmbu-emner.json`, lastes med fetch ved åpning). Bruker DBH-cachen for institusjon 1173
(308 på emnenivå og programnivå, totaler for skjerming, 208 for emnenavn) pluss
`data/nmbu/kilder/347_1173_*.json` for studieprogramnavn, nivå og fakultet. Visning:
`NmbuCourseExplorer.tsx`, kort nederst på NMBU-forsiden. Kjør skriptet på nytt etter
`build-faculty.sh landsam --refresh` (som fornyer cachen for 1173).

Generatorene skriver alltid en `.json`-tvilling ved siden av `.ts`. Genererte filer skal aldri
redigeres for hånd; endre input-filen og kjør på nytt.

**Sammenlignbare emner ved andre studiesteder** (23.09 kveld): `scripts/build-national-courses.py` henter
208 + 308 (emnenivå) for 24 institusjoner (≈43 000 emner, 2021–2025) til `kilde/public/emner/`:
`meta.json` (institusjoner, NUS-navn fra SSB Klass 36), `index.json` (søkeindeks, 3,4 MB) og
`nus/<xxx>.json` (karakterer per NUS-fagfelt, siffer 2–4 i NUS-koden). Visningen
`NmbuNationalCompare.tsx` (fane i «Alle emner ved NMBU») viser emner i samme fagfelt rangert etter
navnelikhet (norsk/engelsk synonymliste) og størrelse, med institusjonsfilter og fritekstsøk i hele
registeret. Agentkuraterte koblinger legges i `data/nmbu/sammenlignbare/<emnekode>.json`
(oppgaveliste `_oppgaver.json`, søkehjelp `scripts/sok-nasjonale-emner.py`) og bygges med
`scripts/build-curated-courses.py` til `emner/kuratert.json`; de vises først i tabellen.

**Gjennomføring, frafall og studenttall** (23.09 kveld, lag 9): `scripts/build-completion.py <fakultet>` henter
per institusjon DBH tabell 707 (gjennomføring og frafall per startkull: startkull, fullført normert/+1/+2 år,
studerer, frafalt, per kjønn), 123 (registrerte, høst), 110 (nye), 104 (ferdige kandidater) og 335
(studiepoeng iht. utdanningsplan), og skriver `<f>CompletionData.ts` med samme gruppestruktur som
opptaksdataene (programkoder fra dbh-programkart). Visning `FacultyCompletion.tsx`, kort «Gjennomføring» på
fakultetssiden. DBH sin tabellkatalog finnes som CSV: `https://dbh.hkdir.no/api/Tabeller/bulk-csv?rptNr=001`
(innhold) og `rptNr=002` (variabler). INN 1177 har ingen 707-kull ennå (kullene ligger på 0264); BI mangler 335.

**Kjønn i karakterer** (23.09): `nmbu-emner.json` har fra nå indeks 10–17 per år = kvinner per karakter (DBH 308 «Antall kandidater kvinner»); menn = totalt minus kvinner. Avkrysning «Del på kjønn» i «Alle emner ved NMBU» viser kvinner/menn for hele emnet og per program.

**Emnelenker** (23.09): `kilde/src/app/data/emneUrl.ts` gir URL til institusjonens emnebeskrivelse fra DBH-kode (mønstre og testresultat i `data/nmbu/kilder/emne-url-monstre.json`, 19 av 24 institusjoner; UiA lenker til emnekatalogsøk fordi emnesidene er semesterspesifikke).

**Veterinærhøgskolen** (23.09 kveld) er bygd med samme kjede (grupper `veterinaer` med medisinstudiene som
referanse, `dyrepleie` mot Nord) og markedsstatus fra fakultetsstyret, universitetsstyret og tildelingsbrevet.

**Kontroll mot Karakterweb** (23.09): `docs/kontroll-karakterweb-2026-09-23.md`. 65 emne/år testet; 91 % funnet,
81 % av dem stemmer eksakt eller innen 3 kandidater. DBH-totalen er aldri lavere enn Karakterweb (kontinuasjon).
Emnenivå («emnenivaa») stemmer; programnivå-summen er avgrenset til sammenligningsprogrammene og skal ikke
brukes som total. DBH-suffiks «-G» strippes i Karakterweb-koder, «-B» beholdes.

## 3. Appen

- `kilde/src/app/data/faculties.ts` er registeret: ett `FacultyData`-objekt per fakultet med alle
  åtte datasettene. Nye fakulteter legges til der, med stubbmoduler som generatorene overskriver.
- De generiske komponentene tar `faculty` som prop: `LandsamLanding`, `LandsamAdmissionAnalysis`,
  `LandsamCourseAnalysis` (fem faner: karakterindeks, karakterfordeling, emner, sammenlign emne,
  studieplan), `FacultyStudiebarometer`, `FacultyMarketStatus`. Navnene med «Landsam» er
  historiske; de brukes for alle fakulteter.
- Handelshøyskolens komponenter er ikke rørt. Merk at HH bruker karakterweb-CSV og egne datafiler,
  ikke kjeden over.
- Alle tall vises med norsk desimalkomma. Kort-, fane- og fargesystem er kopiert fra Figma-designet.

## 4. Arbeidsform med agenter

- Opus til oppgaver som krever skjønn: konkurrentvalg, emnekobling på tvers, UI-bygging.
- Sonnet til strukturerte oppgaver: DBH-kobling, studieplaner, lenker, uthentingsskript, styrepapirer.
- Kontrakter (JSON-skjema og TS-eksportnavn) defineres av orkestratoren før agentene startes, slik at
  data- og UI-arbeid kan gå parallelt.
- Agentene skal skrive filer tidlig og oppdatere underveis, og ikke starte egne underagenter
  (samtidighetsgrensen ble truffet flere ganger). Nettforespørsler bør ha tidsavbrudd.
- Orkestratoren kjører generatorene, bygger, verifiserer i nettleseren og committer. Agentene kjører
  aldri git.

## 5. Hva som er i mål

Alle fem fakultetene har alle åtte lag. Omfang: 234 program, 9 849 emner med karakterer,
459 emnetyper på tvers, 234 studieplaner, Studiebarometeret for 214 av 234 program, og styrepapirer
fra 47 institusjonsoppføringer med 86 nedlastede PDF-er (165 MB). Detaljerte tall per fakultet står
i `OVERSIKT.md`. Alt er committet i git; arbeidstreet er rent.

## 6. Hva som gjenstår

- Veterinærhøgskolen er lagt til 23.09 (se over); veterinærmedisin har ingen innenlandsk konkurrent og vises
  mot medisinstudiene som referanse.
- Handelshøyskolen kan legges over på DBH-kjeden i stedet for karakterweb-CSV (BI sin ØA alene har
  31 000 karakterer i DBH). Ikke gjort; tilbudet står åpent.
- To studieplaner er tomme fordi kildene lastes dynamisk: UiT Kjemi (bachelor) og UiB Ernæring.
  UiS sin nedlagte kybernetikk-master likeså. Kan legges inn manuelt.
- Styrepapirer bak innlogging eller i JS-portaler er lenket, ikke lest: NTNU-fakultetene (IV, IE, AD),
  UiT Elements Publikum (delvis løst for BFE), OsloMet-vedlegg, Volda opengov (500-feil), BI (privat).
- DBH 2026 er ikke rapportert ennå (karakterer og lokale opptak). Ny årgang kommer normalt i
  februar/mars; da kjøres alle generatorene på nytt med `--refresh`.
- Emnenivå vs. emnekobling: koblingene er gjort på programnivå. Der et fag deles med andre program
  (typisk NTNU-fellesemner, BI), er tallene programmets egne studenter.

## 7. Fallgruver som er funnet

- Lokale opptak (toårige mastere) finnes ikke i Samordna opptak eller HK-dir sin nedlastingsside; disse
  dekker bare det samordnede opptaket. DBH tabell 379 har søkere, prioritet (førstevalg = prioritet 1),
  kjønn, kvalifiserte, tilbud, aksepterte og møtte for alle institusjoner, men ikke studieplasser eller
  poenggrenser. Søkerpress for lokale opptak regnes derfor som førstevalgssøkere per tilbud der
  studieplasser mangler. DBH skjermer også her: jo finere gruppering, desto flere celler nulles, så
  skriptet henter totaler, førstevalg og kjønn i tre separate spørringer. 2026 hoppes over til
  høstopptaket er rapportert (`SKIP_YEARS` i skriptet).
- DBH skjermer celler med 1–2 kandidater (vises som 0). Strykprosent på programnivå er derfor et
  minimum og vises som «≥ x %». Emnenivået (alle studenter på emnet) er lite skjermet og stemmer
  eksakt med karakterweb. Bruk emnenivået for stryk.
- Studieprogramkode i DBH er studentens program ved eksamen, ikke emnets eier. Samme emne finnes
  derfor under mange programkoder; emnenivået summerer dem.
- Institusjonskoder endres: INN 0264 → 1177 fra 2025. Håndteres med feltet `institusjonskoder`.
  AHO og UiT deler programkoden for landskapsarkitektur.
- Emnekoder endres: NTNU byttet matematikkkoder fra kull 2025, HVL landmåling fra 2025, UiO folkehelse
  fra 2026, Nord flere ganger. Karakterene ligger på gamle koder; nye koder får tall neste årgang.
- SO-studiekode ≠ DBH-programkode. Kobling må skje på institusjon + navn + nivå, og verifiseres
  mot 308. En feil kode gir et annet programs karakterer.
- Noen «program» er ikke det programkartet sier: UiT Akvamedisin er femårig profesjonsstudium,
  UiT Fiskeri- og havbruk finnes ikke lenger som femårig løp, «Natur og miljø» ved MINA er årsstudium,
  NMBU sine «M-»-koder ved REALTEK er de femårige løpene, ikke toårige mastere. Rettet der oppdaget.
- Karakterweb viser hovedsemesteret; DBH per år tar med kontinuasjonseksamen. Avvik på noen få
  kandidater er normalt.
- Poenggrenser fra AHO er opptaksprøvepoeng på en annen skala og er utelatt.
- BI sine kandidattall er høye fordi emnene deles mellom BI-bachelorer.
- Små NMBU-program (Geoinformatikk, Energi- og miljøfysikk, IWT, Global økonomi) ligger ofte under
  terskelen på 10 kandidater; koblingene bygger da på summen 2021–2025 og er merket.
- Sonnet-agenter startet gjentatte ganger nestede underagenter og traff samtidighetsgrensen.
  Si eksplisitt at de skal jobbe selv.
- `data/json/dbhInstitutionMap.json` fra Figma-eksporten har feil NMBU-kode (1183). Riktig er 1173.
  Filen brukes ikke av appen.

## 8. Hva som bør testes

- Stikkprøver av emnekoblinger mot studieplanene, særlig der agentene selv oppga middels eller lav
  sikkerhet (står i `note`/`merknad` i hver fil). Prioriter gruppene NMBU bryr seg mest om.
- Stikkprøver av studieplaner mot nmbu.no for NMBU-programmene: år/semester-plassering ble
  rekonstruert fra rutenett-PDF-er, og «obligatoriske valg» er lagt i merknad, ikke i listen.
- Karakterindeks og obligatorisk karakterindeks for et par program mot håndregning fra DBH-cachen.
- Studiebarometer-tall for et par program mot studiebarometeret.no direkte (id-en står i `sbId`).
- Markedsstatus-punkter mot kildedokumentene: punktene er agentskrevne sammendrag med kildehenvisning,
  ikke sitater.
- Nettleser: alle fem fakultetene, alle fire visninger, alle faner, med og uten terskel. Smal skjerm
  klipper panelet under ca. 1 100 px (kjent, arvet fra Figma-oppsettet).
- Ytelse: `realtekCourseData.ts` er 1 MB+; appen laster alt statisk. Fungerer, men bør sjekkes på
  svak maskin.

## 9. Kommandoer

```bash
cd ~/Desktop/BOA-sammenligning/kilde && npx vite --port 5173      # kjør appen
scripts/build-faculty.sh realtek                                  # opptak → karakterer → kobling → studieplaner
scripts/build-faculty.sh realtek --refresh                        # hent DBH på nytt (ny årgang), inkl. lokale opptak (379)
python3 scripts/fill-local-admissions.py realtek                   # bare lokale opptak fra DBH 379
python3 scripts/fetch-admission-points.py [realtek] [--refresh]   # snittpoeng fra DBH 571 (alle fakulteter uten argument)
python3 scripts/build-studiebarometer.py realtek [--refresh]
python3 scripts/build-markedsstatus.py realtek
python3 scripts/link-studyplan-codes.py realtek                   # etter nye studieplanfiler
```

## 10. Passordsperre på Handelshøyskolen

Passordsperren (`PasswordGate.tsx`) ligger fra 23.09 kveld bare rundt fanen «Emner + masteroppgave (NMBU)» under Master i Handelshøyskolen, der karakterene er på studentnivå. Resten av HH er åpent.
Passordet settes i `kilde/.env.local` som `VITE_HH_PASSORD` (filen er gitignored; uten filen er
passordet «nmbu»). Dev-serveren må startes på nytt etter endring. Opplåsingen varer til fanen lukkes.
Sperren skjuler bare visningen: dataene ligger fortsatt i den bygde JavaScript-en.

## 11. Opptakspoeng (DBH 571) og studieplasser (DBH 370)

Lagt inn 23.09 kveld. Opptaksvisningen for Samordna-program har fire nye mål under «Snittpoeng (DBH)»:
snitt opptakspoeng og snitt karakterpoeng for dem som møtte til studiestart, snitt for førstevalgssøkerne
og snitt for alle søkerne. NMBU-nøkkeltallene viser snitt opptakspoeng for møtte med karakterpoeng og antall.

- **Kjede:** `scripts/fetch-admission-points.py` henter to spørringer per institusjon (Årstall × program ×
  møtt, og Årstall × program × prioritet 1), opptakstype N, og cacher rådata i `data/nmbu/kilder/dbh571/<inst>.json`.
  Resultatet per fakultet ligger i `data/<f>/kilder/dbh571_opptakspoeng.json`, som `build-landsam-data.py`
  leser automatisk. Feltene heter `op_mott`, `kp_mott`, `op_fv`, `op_alle`, `n_mott` i `FullYearData`.
  `build-faculty.sh <f> --refresh` henter 571 på nytt.
- **Tolkning:** 571 gir summer, snitt = poengsum / antall. DBH skjermer antall i små celler (vises som 0),
  men ikke poengsummen; slike celler er utelatt fra både teller og nevner. «Søkere» i 571 er søkerne i
  institusjonens FS-opptak, ikke alle som har programmet på listen hos Samordna. Kontroll: NMBU B-ØA
  «alle søkere» gir 49,5/49,6/48,9 for 2023–2025 med 293/387/398 søkere, identisk med HH-filen
  `dbhSokerpoeng.ts` fra samme tabell.
- **Dekning:** 165 av 171 Samordna-program har tall. Uten tall: AHO landskapsarkitektur (opptaksprøve), UiS
  byplanlegging, UiS kybernetikk, NTNU Gjøvik geomatikk (nedlagt) og UiS datateknologi femårig (ingen egen
  opptakskode i DBH). 2026 finnes ikke i 571 ennå; visningen hopper til 2025 når et poengmål er valgt.
- **Felles DBH-program:** 13 oppføringer deler DBH-programkode med en annen oppføring (flere studiesteder
  eller varianter, f.eks. NTNU fornybar energi Trondheim/Gjøvik/Ålesund). De har felles snitt og er merket
  med * i datatabellen (`poengFellesMed`).
- **Lokale opptak:** toårige mastere har ingen poeng i 571 (opptak på bachelorkarakterer), så målene vises ikke der.
- **Studieplasser (370) er ikke tatt i bruk.** For lokale opptak er studieplasser praktisk talt ikke
  rapportert etter 2012 (0 av flere tusen programrader 2021–2026 hos alle våre institusjoner). For
  Samordna-program teller 370 per DBH-program samlet over studiesteder og kvoter, og avviker derfor fra
  Samordnas tall per studiested, som vi allerede har. Studieplasser for toårige mastere må eventuelt hentes
  fra institusjonenes egne opptakssider.

## 12. Gjennomføring mot institusjon, sektor og landssnitt (DBH 705/706)

Lagt inn 23.09 kveld i «Gjennomføring, frafall og studenttall».
- **Målenivå-velger** for fullført og frafall: «Samme program» (707), «Samme institusjon» (706: grad på samme
  nivå ved samme institusjon, også etter programbytte) og «Hele sektoren» (705: grad på samme nivå ved en
  hvilken som helst norsk institusjon; frafall = ute av høyere utdanning). Samme startkull i alle tre.
- **Landssnitt** som stiplet grå linje og egen rad i tabellen: 707/706/705 summert over alle institusjoner per
  startår og nivåkode (B3, M2, M5, PR), i `completionNationalData.ts`. Gruppene blander nivåer, så linjen følger
  NMBU-programmets nivå (ellers gruppens vanligste). NMBU-nøkkeltallene viser landssnitt og frafall ut av sektoren.
- **Rettet skjerming:** kulltotalene hentes nå uten kjønnsdeling (`<tid>t_<inst>.json` i dbh-cachen); kvinnetall
  fra den kjønnsdelte spørringen. Før rettingen var frafall for lavt i omtrent en tredel av kullene (f.eks.
  NMBU B-BIOL kull 2018: 5 → 7).
- **Skjermede nuller** i andeler vises som «≤ x %» i tabellen (x = 2 personer av kullet). Grafen viser 0.

## 13. «Studentene» (DBH 60/135/142)

Nytt kort på fakultetssiden, under Gjennomføring. Per program: aldersfordeling (≤ 21, 22–24, 25–29, 30+),
andel og antall utenlandske studenter (utenlandsk statsborgerskap), og utveksling ut (programmets egne studenter
i utlandet, vår + høst) i antall og per 100 registrerte. Trend, aldersfordeling som stablede søyler, og tabell,
med landssnitt for NMBU-programmets gradsnivå.
- **Skript:** `scripts/build-students.py [fakultet ...] [--refresh]` → `<f>StudentData.ts/.json` og felles
  `studentNationalData.ts`. Cache: `data/nmbu/kilder/dbh-studenter/<inst>_<serie>.json`.
- **Aldersgrupper via filter:** tabell 60 per enkeltår er hardt skjermet (1–2 → 0), og det rammer de eldste.
  Skriptet filtrerer derfor på alder (`between`) og grupperer bare på år × program, én spørring per gruppe.
  NMBU B-BIOL høst 2024: 8 studenter 30+ med filter, mot 3 ved å summere enkeltår.
- **DBH-grense:** tabell 60 tillater høyst seks verdier i et filter; årene hentes derfor som intervall.
- **Utveksling:** 142 Type NORSK = programmets studenter ut. Innreisende (UTENL) ligger på programmet UTVEKSLING
  og kan ikke fordeles på studieprogram.

## 14. Fagmiljøet: tilsatte og publisering (DBH 225/220/123/900/373/374/210/347)

Nytt kort på fakultetssiden (fakultet mot fakultet, eller institusjon mot institusjon) og på forsiden
(institusjonene, eller NMBUs sju fakulteter mot hverandre). Mål: studentårsverk per faglig årsverk (hovedmål),
registrerte studenter per faglig årsverk, publiseringspoeng per faglig årsverk, andel nivå 2, andel
førstestillinger, kvinneandel faglige, faglige årsverk, rekrutteringsårsverk, alle årsverk, studenter og poeng.
- **Skript:** `scripts/build-staff.py [--refresh]` → `kilde/src/app/data/staffData.ts/.json`
  (`STAFF_INSTITUTIONS`, `STAFF_NMBU_FACULTIES`, `STAFF_FACULTIES[fakultet]`). Cache `data/nmbu/kilder/dbh-fagmiljo/`.
- **Faglige årsverk** = stillingskategori UN1 + UN3 + UN4 fra tabell 220 (undervisnings-, forsknings- og
  formidlingsstillinger), uten rekruttering (UN2: stipendiat, postdoktor), som vises for seg.
- **Studentårsverk** = «Ny produksjon totalt» i tabell 900 per avdeling som eier emnet (allerede i 60-sp-enheter).
  Registrerte studenter blåser opp enheter med mange enkeltemnestudenter: NMBU HH har 64,8 registrerte per
  faglig årsverk, men langt lavere i studentårsverk.
- **Konkurrentfakultetene** er avledet, ikke valgt: fakultetet som eier hvert konkurrentprogram (DBH 347
  Avdelingskode → 210 Fakultetskode). Fakulteter som bare eier svakere sammenligninger (default false) er
  ikke valgt fra start, men ligger i listen.
- **Publisering:** avdeling 000000 i 373 er institusjonstotalen (lik summen av avdelingene); den brukes bare
  på institusjonsnivå. AHO rapporterer 0 poeng og 0 publikasjoner og vises som ikke rapportert.
- **Tabell 225** er en aggregert tabell som gir serverfeil med kodetekst; hent med `kodetekst: N`.

## 15. Bolig og studentboliger (NSO + SSB 06035/09895)

Etter oppskriften «Boligmarked + Studentboliger per studiested» fra sammenligningsportalen
(claude.ai/artifact/K9T1fej8P9u3hr8X9rz6Uj), tilpasset appen og utvidet til alle studiestedene i
fakultetenes programkart (NMBU og konkurrentene). Kort på forsiden (alle 25 studiesteder) og på hver
fakultetsside (studiestedene i fakultetets sammenligninger).
- **Skript:** `scripts/build-bolig.py [--refresh]` → `kilde/public/bolig/bolig.json` (137 kB, lastes først når
  visningen åpnes). Kilder i `data/nmbu/kilder/`: `ssb_06035_kommuner.json`, `ssb_09895_leie.json` (SSB-API),
  og `portalen/` (NSO 2026 transkribert i portalen, nabolister, studiested → kommune).
- **Kjøpspriser (06035):** alle 357 kommuner, 2016–2024. Kommuner som fikk nytt nummer 1.1.2024 har 2020–2023
  under forgjengerkoden «(2020-2023)»; 113 er skjøtet (portalen manglet disse årene). 0 salg = ingen tall.
- **Leie (09895):** brede prissoner. Raden markeres bare der sonen per definisjon er kommunen eller fylket
  (Oslo og Bærum, Akershus utenom Bærum = Ås, Bergen, Trondheim, Stavanger). Ellers generell referanse.
- **Nabolister:** Ås kuratert her (~30 min: Ås, Nordre Follo, Vestby, Frogn, Nesodden, Enebakk, Oslo; ~2 timer:
  resten av Oslo-området, nordre Østfold, Drammen). 15 andre steder fra portalen. Hamar, Lillehammer, Kongsberg,
  Bø, Sogndal, Steinkjer, Evenstad, Volda og Rena har bare egen kommune (radius slått av), etter oppskriftens
  regel om ikke å gjette.
- **NSO-alias:** Oslo → «Oslo og Lillestrøm», Midt-Telemark → Bø, Stor-Elvdal → Evenstad, Åmot → Rena.

## 16. Mørk modus

Lys/mørk-bryter øverst til høyre på alle sider (`ThemeToggle.tsx`, lucide Sun/Moon), samme mønster som
sammenligningsportalens theme-toggle: uten lagret valg følger siden systeminnstillingen (også live), et klikk
lagrer valget i localStorage («theme»). Et skript i `index.html` setter `data-theme` og klassen `dark` før første
tegning, så siden ikke blinker.
- `kilde/src/styles/dark.css`: mørke verdier for NMBU-variablene, Tailwind/shadcn-tokens, skjemaelementer,
  Recharts (rutenett, akser, verktøytips, markering) og Leaflet. De grønne flatene (green-dark, green, green-6)
  beholder sine mørke verdier fordi de bærer hvit tekst; der de brukes som tekstfarge lysnes de med
  attributtselektorer (`[style*=" color: var(--nmbu-green-dark)"]`).
- `kilde/src/styles/dark-overrides.css` er GENERERT av `scripts/build-dark-css.py`: skanner komponentene for faste
  inline-farger (React skriver dem som `rgb(...)`) og lager overstyringer etter luminans. Slik får også de
  originale HH-komponentene mørk modus uten å endres. Kjør skriptet på nytt etter nye komponenter med faste farger.
- Utviklingsserveren må startes på nytt etter nye `@import` i `index.css` (Tailwind-pluginen cacher importgrafen).
