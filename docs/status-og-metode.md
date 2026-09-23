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

## 17. Økonomi og styringsindikatorer (DBH 902 og 750)

Kort på forsiden (alle 16 institusjoner) og på fakultetssidene (institusjonene i fakultetets sammenligninger).
DBH har økonomi bare per institusjon, ikke per fakultet.
- **Skript:** `scripts/build-economy.py [--refresh]` → `kilde/src/app/data/economyData.ts/.json`. Cache
  `data/nmbu/kilder/dbh-okonomi/`. Kjøres etter `build-staff.py` (henter studentårsverk derfra).
- **902** (1 000 kr): driftsinntekter og -kostnader, statstilskudd, NFR, RFF, EU, bidrag, oppdrag, lønn,
  avsetninger. Avledet: andel statstilskudd, andel eksterne inntekter, driftsinntekter per studentårsverk,
  lønnsandel, driftsresultat, avsetninger i % av driftskostnader. UiB mangler 2024 i DBH.
- **750:** alle KDs styringsindikatorer (gjennomføring, studiekvalitet, publisering, NFR og andre eksterne inntekter
  per faglig årsverk, studiepoeng per faglig årsverk, kvinner i toppstillinger, midlertidighet m.m.).
  KDs faglige årsverk inkluderer rekrutteringsstillinger (NMBU 2024: 912 mot 601 uten), så tall per årsverk
  i fagmiljøkortet og her er ikke like; det står i visningen.
- Regnskapspakkene 700–703 er rå kontodata og er ikke brukt.

## 18. Alternative oppsett (forslag, ikke bygget)

`LayoutLab.tsx`, lenke nederst på forsiden («Se forslag til alternative oppsett av nettsiden»). Viser dagens oppsett og fem
forslag som klikkbare skisser med ekte tall, i en ramme med bredde skrivebord/nettbrett/mobil, med idé, fordeler/ulemper og
anslag på byggearbeid: 1 fullskjerm-dashboard med sidemeny, 2 toppmeny med moduler som faner, 3 program-først profilside,
4 sammenligningsmatrise (varmekart NMBU mot konkurrentmedian), 5 rapport-/presentasjonsmodus.
Forslag til to valgbare oppsett: «Oversikt» (dagens) og «Arbeidsflate» (dashboard med matrisen som startside), valgt med en
bryter ved siden av lys/mørk og husket i nettleseren. Venter på Mathias' valg før noe bygges.

## 19. Tre valgbare oppsett

Knappen «Oppsett» øverst til høyre (ved siden av lys/mørk, `TopRightControls.tsx`) velger mellom:
1. **Oversikt** (standard): dagens oppsett med kort, landingssider og egne sider per modul.
2. **Fullskjerm-dashboard**: fast grønn sidemeny med fakultetene øverst (HH i samme liste, fakultetene med moduler under)
   og «Hele NMBU» under, brødsmuler og full innholdsbredde; startsiden er sammenligningsmatrisen. På smal skjerm blir
   sidemenyen en smal uttrekksmeny (maks 232 px / 72 % av bredden).
3. **Toppmeny**: enhetene (Hele NMBU, HH, fakultetene) som faner øverst og modulene i en rad under; valgt modul beholdes
   når man bytter fakultet. Samme startside.
- Valget lagres i localStorage («layout») og kan settes i en lenke med `?oppsett=dashboard` / `?oppsett=toppmeny` / `?oppsett=oversikt`
  (`layoutStore.ts`).
- Alle tre bruker de samme modulene: `App.tsx` har én tabell over fakultetsmodulene (`FACULTY_MODULE_META` + `facultyModuleBody`) og
  NMBU-sidene (`NMBU_PAGE_META` + `nmbuPageBody`). «Oversikt» pakker dem i den gamle sideformen (`classicPage`), de to andre i
  `AppShells.tsx`. HH-delen er uendret, bare pakket inn i `renderHH()` så den kan vises i alle rammene.
- Nye moduler legges inn ett sted (tabellen i App.tsx og `FAKULTETSMODULER` i AppShells.tsx) og vises da i alle tre oppsett.
- Kjent: fakultetenes landingsside og HH-sidene har fortsatt sin egen tilbakeknapp og smale bredde inne i de nye rammene.

## 20. Inntekt per program (anslått resultatbasert finansiering)

Ny fakultetsmodul «Inntekt» (alle tre oppsett, og kort på fakultetets oversiktsside). Per program og år (produksjon 2023–2025):
anslått inntekt, per registrert student, studiepoeng per student, fra studiepoeng, fra fullførte grader, studentårsverk,
fullførte grader og snittsats per 60 sp, NMBU mot konkurrentene med median.
- **Skript:** `scripts/build-revenue.py [--refresh]` → `kilde/src/app/data/revenueData.ts/.json`; kjøres etter `build-completion.py`.
  Cache `data/nmbu/kilder/dbh-finansiering/`.
- **Modell (finansieringssystemet fra 2025):** egenfinansierte studiepoeng (DBH 900, «Ny produksjon egentfin», per studentens
  program og emnets kategori) × sats for kategori 1/2/3, pluss kandidater (DBH 104) × sats for fullført gradsprogram (G3).
  Satser fra DBH 908: 2025 = 56 600 / 84 900 / 198 150 per 60 sp og 51 900 per grad; 2026 = 58 650 / 87 950 / 205 300 og 53 750.
  Produksjon i år Y utløses i budsjett Y + 2; for 2025-produksjon brukes 2026-satser (merket foreløpig).
- DBH har omkodet studiepoengproduksjonen fra 2023 til kategoriene 1–3; 2021–2022 ligger i gamle A–F og er ikke med.
- **Tilnærminger:** DBH har ingen tabell for G3 ennå (907 slutter med gamle kandidatindikator i 2022), så ferdige kandidater
  brukes. Studiepoeng tilskrives studentens program uansett emneeier. Doktorgrad, EU, NFR og basis er ikke med.
- Emnets kategori er brukt (ikke studentens); forskjellen i totalene er liten (NMBU 2025: kategori 1 = 2 277 mot 2 216 årsverk).

## 21. Handelshøyskolen på standardformatet

HH er delt i to: **Opprinnelig HH-analyse** (Figma-komponentene, manuelt kuratert: emnekartlegging/UHR-emner, karakterindeks,
masteroppgaver, opptak 2026 – urørt, rute `hh-figma`) og **HH på standardformat** (FacultyId `hh`, samme moduler som de andre
fakultetene). Øverst på HH-siden velger man mellom dem; i dashboard/toppmeny ligger originalen som eget menypunkt under HH.
- **Programkart:** `scripts/make-hh-programkart.py` → `data/hh/programkart.json` og `dbh-programkart.json` (73 program, 6 grupper:
  økonomi og administrasjon, samfunnsøkonomi, økonomi/ledelse/IT, og masterne i økonomi og administrasjon, samfunnsøkonomi,
  entreprenørskap og innovasjon). Konkurrentene er de samme som i originalen (fullAdmissionData, samfData, masterThesisData);
  ØLIT-konkurrenter funnet i Samordnas programliste; DBH-koder fra DBH 347 (`data/hh/kilder/dbh347/`). Antatte koder står i `merknad`.
- Kjeden er den samme som for fakultetene (`build-faculty.sh hh`, `build-completion.py hh`, `build-students.py hh`,
  `build-studiebarometer.py hh`, samt build-staff/economy/revenue/bolig med `hh` = avdeling 470).
- Mangler foreløpig: emnekobling, studieplaner og markedsstatus på standardformatet (originalen har egne versjoner), og
  M-BIOEC, M-GEP og M-EEG. BI er ikke med i bachelorgruppene (ikke i Samordna), men er med i masterne via DBH 379.

## 22. Intern opptaksanalyse for HHs bachelorprogram (høsten 2026)

Modulen «Opptak H26 (intern)» under HH (standardformat), med kort øverst på HH-siden. For B-ØA, B-ECON og B-ØLIT:
nøkkeltall, simulator for større/mindre opptaksramme (antall tilbud eller ønsket kull, og kvotefordeling SP/KP; regelen er 50/50),
kurve for grenser og snitt over alle opptaksrammer, søkermassen rundt grensen etter prioritet, tabell over tilgjengelige søkere per
halve poeng under grensen, og trakt fra søker til møtt.
- **Kilde:** Excel-arbeidsbok fra opptakskontoret (FS-uttrekk, «Arbeid opptak H26-BØA.xlsx»). Filen legges ALDRI i repoet.
  `scripts/build-opptak-intern.py <xlsx>` leser bare studieprogramkode, prioritet, kvalifisert, kvote, poeng og tilbudsstatus
  (ikke navn, fødselsnummer, e-post, telefon, ID-er) og aggregerer til antall per poeng (én desimal), kvote og prioritetsgruppe.
- **Kryptering:** resultatet krypteres (AES-256-GCM, PBKDF2-SHA256 310 000 iterasjoner) til `kilde/public/intern/opptak-h26.json`.
  Passordet står i `kilde/.env.local` som `INTERN_PASSORD` (gitignored, ikke `VITE_`-variabel, så det er ikke i bunten).
  Siden dekrypterer i nettleseren; uten passord er filen uleselig. Passordet huskes i fanen (sessionStorage).
- **Koder:** SP = førstegangsvitnemål (skolepoeng), KP = ordinær kvote (konkurransepoeng); søkere med førstegangsvitnemål har
  både SP- og KP-rad. Tilbudsstatus i søkermassen (bare B-ØA): S = tilbud her, B = tilbud på høyere prioritert studium,
  T = tilbud på lavere prioritet, U = ikke tilbud, tom = venteliste.
- **Modell:** hver kvote fylles ovenfra med tilgjengelige søkere. Tilgjengelighet per kvote × prioritetsgruppe er kalibrert slik at
  faktisk antall tilbud gir faktisk grense (laveste poeng med tilbud, alle runder), og justert under grensen med forholdet målt i
  B-ØA (søkere under grensen har sjeldnere tilbud på høyere prioritet). Ja-svar- og oppmøteandeler er faktiske per kvote × prioritet.
  Kvotene behandles hver for seg (samspillet der FV-søkere som ikke når opp, konkurrerer i ordinær kvote, er ikke modellert).
- **Test uten passord:** `?internDemo` på utviklingsserveren viser fiktive tall (fjernes i produksjonsbygget).
- **Oppdatering:** kjør skriptet med ny arbeidsbok (samme arknavn), bygg og push.

## 23. BI og Kristiania i HH-sammenligningene (23.09.2026)

Grunnlaget er kartleggingen i `docs/bi-kristiania-datakilder.md`.
- **Emnelenker:** `emneUrl.ts` har egne lenkebyggere for BI og Kristiania.
  - **BI:** kursbeskrivelsene har fast mønster. DBH-koden er bokstaver + 4 siffer + versjonssiffer, så GRA65553 blir `subjectCode=GRA&courseNumber=6555`.
  - **Kristiania:** emnesidene ligger under fakultet og nivå. `scripts/build-emne-url-oppslag.py` lager `kilde/public/emner/url-8253.json` (22 kB) fra sidekartet, og bare for kodene i det nasjonale emneregisteret: 1 696 av 1 714. Filen lastes i bakgrunnen ved oppstart (`lastEmneUrlOppslag` i main.tsx). Til den er lastet, har Kristiania-emner ingen lenke. Kjør med `--refresh` for å hente sidekartet på nytt.
- **HH-gruppene** (`make-hh-programkart.py`): alle nye oppføringer har lokalt opptak (DBH 379, `fill-local-admissions.py hh`).
  - Økonomi og administrasjon: BI DIPØAH og Kristiania BOL.
  - Økonomi, ledelse og IT (svakere sammenligning, ikke valgt som standard): BI DIPDBH og DIPBTH, Kristiania BOD.
  - Samfunnsøkonomi (master): BI MSCMSAEH. Siste opptak i 379 var 2023.
  - Entreprenørskap og innovasjon (master): Kristiania MIN.
  - BIs tall gjelder alle campuser og nett samlet.
  - Kristiania: BOL heter «Økonomi og administrasjon» fra høsten 2026, og programsiden for BOD videresender dit. Følg med på nye DBH-koder i 347.
- **Opptaksvisningen:** `lokaltOpptak` på oppføringen gir merkelappen «Lokalt opptak (DBH 379)» i tabell og velger. Møtt og oppmøteandel vises i Samordna-grupper som har lokale oppføringer.
- **Tilbudsandel** er et nytt mål for alle program: tilbud / kvalifiserte søkere. For 2025 er den 100 % hos både BI og Kristiania, mot 14,6 % hos NMBU B-ØA og 19,4 % hos NHH. Også i CSV-eksporten, sammen med en kolonne for opptakstype.
- **Opptakspoeng for BI** (`fetch-admission-points.py`, `LOKAL_POENG`): DBH 571 opptakstype L, bare BI DIPØAH/SØ.
  - Bare karakterpoeng for dem som møtte (`kp_mott`) brukes, merket `poengLokalt`. BIs «opptakspoeng» lå på en annen skala før 2023 og har ingen tilleggspoeng etterpå.
  - Løpende år (bare våropptak) droppes. Cache: `data/nmbu/kilder/dbh571/8241_L.json`.
  - BI DIPØAH: 41,0 i 2025, mot 46,8 for NMBU B-ØA.
  - Kristianias 571-tall ligger på en annen skala og brukes ikke.
- **Studiebarometeret:** `sbId` og `sbMerknad` i dbh-programkart går foran automatisk oppslag. BI ØA bruker BI Bergen (Oslo har for få svar); merknaden vises som advarsel.
- **Inntekt per program:** BI og Kristiania (`PRIVATE` i build-revenue.py) er holdt utenfor. De finansieres i hovedsak med skolepenger, ikke etter de statlige satsene.
- **Fagmiljø og økonomi:** Kristiania kommer med automatisk, fordi institusjonslisten bygges fra programkartene.
  - BI og NHH (`HELINST` i build-staff.py) er rene handelshøyskoler uten fakultet som eier programmene. Fakultetsenheten er derfor hele institusjonen («Hele BI», «Hele NHH»). NHH sto før som «Sentraladministrasjonen».
  - Økonomikortet har tre nye mål fra 902:
    - skolepenger («Eksamensavgift private høyskoler»)
    - skolepenger per studentårsverk (2025: Kristiania ≈ 106 tkr, BI ≈ 102 tkr)
    - statstilskudd per studentårsverk

