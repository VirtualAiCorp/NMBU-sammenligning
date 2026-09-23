# B-ØA sammenligning – innholdsoversikt

Hentet ut 22.09.2026 fra Figma Make-prosjektet «Sammenligningsverktøy for emner (Copy)»,
publisert på https://linear-resist-26777897.figma.site.

## Mappestruktur

| Mappe | Innhold |
|---|---|
| `kilde/` | Hele Figma Make-eksporten, uendret. Kan kjøres lokalt (se nederst). |
| `kilde-figma-make-eksport-2026-09-22.zip` | Original ZIP fra Figma. |
| `data/csv/` | De 23 CSV-filene som ble lastet opp i Figma Make (originaler). |
| `data/json/` | Datasettene slik appen faktisk bruker dem, konvertert fra TypeScript til JSON. Dette er «fasit» for det som vises på siden. |
| `data/pdf/` | De 30 styredokumentene under Markedsstatus, med lesbare navn per lærested. `_pdf-oversikt.json` kobler nettside-navn til originalfil. |
| `data/pdf/ovrige-ikke-brukt-i-app/` | 6 PDF-er som ble lastet opp, men ikke lenkes fra siden. |
| `data/bilder/` | Skjermbilder og logo som ble lastet opp (brukes ikke i appen, kun som underlag i Make-samtalen). |
| `data/tekst/` | Limt inn tekst: studieoppbygning OsloMet med emnelenker. |

## Sider på nettsiden → kode → data

Forsiden har fire innganger. Alt er én React-app (`kilde/src/app/App.tsx`).

### Bachelor (8 faner)

| Fane | Komponent | Datafiler (json) | Opprinnelig CSV |
|---|---|---|---|
| Sammenlign emne | CourseComparison + GradeDistributionChart | courseMapping, courseHistory | OA_karakterer_NY.csv, Import_karakterweb_stat.csv, NTNU_gjovik_og_alesund.csv, ONH_mold_hvl_innr.csv, H_yskolen__stfold_csv.csv |
| Emnekartlegging | CourseMappingTable | courseMapping | som over + studieoppbygning-okonomi-admin.md |
| Opptakstall | AdmissionStats + StatsTable | admissionData, dbhSokerpoeng, courseMapping | okadm_bruker_dbh571_2023_2025.csv; poenggrenser hentet fra SO/Tableau (ingen CSV) |
| Karakterindeks | GradeInflationDashboard + GradingHarshnessSummary | courseMapping, courseHistory, admissionData, dbhSokerpoeng | som over |
| Studiebarometeret | StudiebarometerStats | studiebarometerData | ingen CSV, hentet fra studiebarometeret.no |
| Kart | MapView | admissionData, courseMapping, studiebarometerData | – |
| 1. studieår | FirstYearComparison | firstYearData, courseMapping, courseHistory, admissionData | – |
| Nettbasert ØA | OnlineBachelorView | courseMapping (kristiania_nett, inn_nett, uit_nett) | Digital_bachelor_OA_INN_UiT_karakterer.csv, Digital_bachelor_OA_Kristiania_karakterer.csv |

### Master (3 faner)

| Fane | Komponent | Datafiler | Opprinnelig CSV |
|---|---|---|---|
| Masteroppgavekarakterer | MasterView | masterThesisData | CSV_Studiesteder_statistikk*.csv, NTNU_og_NHH_per_profilering.csv, Masteroppgaver_INN_CSV.csv, CSV_karakter_ulike_masterprogrammer.csv |
| Inntaksgrense vs. karaktersnitt | MasterComparisonChart | masterThesisData (MASTER_ADMISSION) | CSV_OPPTAKSGRENSER_2020-2026.csv |
| Emner + masteroppgave (NMBU) | NMBUMasterAnalysis, NMBUSemesterView, NMBUStudentTable | nmbuMasterData | CSV_NMBU_master.csv, Statistikk_studenter_ferdig_master_v25.csv, m30-econ_*.csv, masterprogrammer_*.csv, CSV-_ink_inntakskvalitet_per_s_ker.csv |

### Analyse opptak høst 2026 (3 faner)

| Fane | Komponent | Datafiler | Opprinnelig CSV |
|---|---|---|---|
| Økonomi og administrasjon | AdmissionAnalysis2026 | fullAdmissionData, dbhSokerpoeng | Opptakstall_2026_poenggrenser_m_s_ketall.csv, CSV_OPPTAKSGRENSER_2020-2026.csv, okadm_bruker_dbh571_2023_2025.csv, _konomi_og_finans_UiO.csv |
| Samfunnsøkonomi | SamfunnsokonomAnalysis | samfData, fullAdmissionData | CSV_samf_konomi_s_kertall___snitt.csv |
| Årsstudier | AarsstudierAnalysis | annualStudiesData, fullAdmissionData | A_rsstudier_sammenligning_CSV.csv |

Alle tre har CSV-eksport-knapp (CsvExportButton) som genererer fila på nytt fra json-dataene.

### Markedsstatus

Komponent MarkedsstatusView. Tekst (punktlister per lærested) ligger direkte i komponenten, ikke i en datafil.
8 læresteder: OsloMet, UiA, NHH, HVL, UiS, USN, INN, HiØ. 30 PDF-er, se `data/pdf/_pdf-oversikt.json`.

## Datasett i data/json (antall poster)

| Fil | Nøkkel | Antall | Merknad |
|---|---|---|---|
| courseMapping | UNIVERSITY_INFO | 26 læresteder | Navn, by, koordinater, akkreditering, lenker |
| courseMapping | COURSE_MAPPING | 12 emnetyper | Emnekode + karakterfordeling per lærested, læringsutbytte-tekst |
| courseHistory | COURSE_HISTORY | 11 emnetyper | Karakterer per år 2023–2025 |
| admissionData | ADMISSION_DATA | 20 program | Poenggrenser 2022–2025, søkertall 2026 |
| fullAdmissionData | FULL_ADMISSION_DATA | 33 program | Søkere, førstevalg, plasser, kvinneandel, tilbud, poenggrenser 2020–2026 |
| samfData | SAMF_DATA | 9 program | Samfunnsøkonomi |
| annualStudiesData | ANNUAL_STUDIES_DATA | 11 program | Årsstudier |
| dbhSokerpoeng | DBH_SOKERPOENG | 27 program | DBH tabell 571, snittpoeng alle søkere 2023–2025 |
| studiebarometerData | STUDIEBAROMETER_DATA | 26 program | 2024 og 2025, 7 dimensjoner + delspørsmål |
| firstYearData | FIRST_YEAR_DATA | 20 læresteder | Hvilke emner som ligger i 1. studieår |
| masterThesisData | MASTER_THESIS_DATA | 15 program | Masteroppgavekarakterer per år, spesialiseringer |
| masterThesisData | MASTER_ADMISSION | 12 læresteder | Inntaksgrenser master |
| nmbuMasterData | NMBU_STUDENTS_SAMLET | 281 studenter | Se merknad under |
| dbhInstitutionMap | – | – | Kobling DBH-kode ↔ app-id |
| mockData | – | tom | Bare funksjoner, ikke i bruk |

## Merknader

- **NMBU-studentdata er individnivå.** nmbuMasterData inneholder én post per student (id, program, masteroppgavekarakter, emnesnitt, antall emner). Ingen navn eller studentnummer, men små program (M30-BIOEC, M30-EI) kan være gjenkjennbare. Bør ikke ut på en offentlig side uten vurdering. Du har selv notert «ut» for denne fanen.
- **Data uten CSV-kilde:** studiebarometerData (studiebarometeret.no), admissionData sine poenggrenser (SO-datavarehus/Tableau) og all tekst i Markedsstatus og læringsutbytte-feltene i courseMapping er skrevet inn i koden av Make. Disse finnes bare i `data/json` og i kildekoden.
- **Kode som ikke er i bruk:** mockData.ts, karakterwebApi.ts, dbhService.ts + useDBH571.ts (live-henting fra DBH, aldri koblet på), ProgramComparison.tsx. Appen gjør ingen nettverkskall; alt er statisk.
- **Publisert versjon vs. eksport:** i den publiserte bunten er PDF-ene tomme (Figma fjerner filinnhold). Eksporten har dem komplett.
- Prosjektet i Figma: https://www.figma.com/design/fL9S5wTWih2SmaylpyVa1g/

## Kjøre appen lokalt

```bash
cd kilde && npm install --legacy-peer-deps && npm run dev
```

Vite + React 18 + Tailwind + Recharts + Leaflet + shadcn/ui. Ingen backend. Kjørt og verifisert lokalt 22.09.2026.

Endringer gjort i `kilde/package.json` for å kjøre utenfor Figma: react og react-dom 18.3.1 lagt inn som vanlige avhengigheter
(Figma leverte dem selv). `--legacy-peer-deps` trengs fordi react-leaflet 5 ber om React 19, men den virker med 18.

Fra Claude Code: launch-konfigurasjonen «boa-sammenligning» (port 5173) ligger i simuleringsverktoy/.claude/launch.json.

## Fakultetsnivå og LANDSAM (lagt til 22.09.2026)

Appen har nå et nivå over: forsiden viser NMBU med kort per fakultet. Handelshøyskolen er dagens app uendret.
Fakultet for landskap og samfunn (LANDSAM) har foreløpig én visning: **Analyse opptak**.

| Hva | Hvor |
|---|---|
| Programkart: LANDSAM-program, konkurrenter, kilder, lokale tall for toårige mastere | `data/landsam/programkart.json` |
| Kildefiler fra Samordna opptak (søkertall 2021–2026 alle studier; poenggrenser 2020–2026) | `data/landsam/kilder/` |
| Generator som lager datamodulen fra kildene + programkartet | `scripts/build-landsam-data.py` (validator: `scripts/check-landsam-data.py`) |
| Generert datamodul (ikke rediger for hånd) | `kilde/src/app/data/landsamAdmissionData.ts` + `.json`-tvilling |
| Nye komponenter | `FacultyLanding.tsx`, `LandsamLanding.tsx`, `LandsamAdmissionAnalysis.tsx`, `data/landsamPalette.ts` |

Oppdatere tall: last ned nye kildefiler (se URL-ene i toppen av generatoren), juster `programkart.json`, kjør generatoren og validatoren.

Kilder og forbehold:
- Søkertall: `sokertallrapport.samordnaopptak.no` (programtabell 2026, inneholder 2021–2026). Poenggrenser: SO sin Tableau-rapport, CSV-endepunkt med årsfilter, hovedopptak.
- Toårige mastere har lokalt opptak og finnes ikke i Samordna opptak. Tall for NMBU (søkere, kvalifiserte, tilbud 2021–2025) er hentet fra DBH/HKDIR tabell 379 (NMBU institusjonskode 1173). Førstevalgssøkere, kjønn, plasser per år og poenggrenser 2021–2023 finnes ikke publisert. 2026 mangler i DBH.
- NTNU-, UiO- og UiB-tall for lokale mastere er fra institusjonenes egne statistikksider; tellegrunnlaget avviker noe fra DBH (står i gruppenotatene).
- AHO tar opp landskapsarkitekter etter opptaksprøve; poenggrensene deres er på en annen skala og er utelatt.

## LANDSAM: emner og karakterer (lagt til 22.09.2026)

Andre visning under LANDSAM: **Emner og karakterer**. Karakterindeks per program, karakterfordeling A–F og sorterbar emnetabell,
for de samme 13 gruppene og 43 programmene som opptaksanalysen.

| Hva | Hvor |
|---|---|
| Oppskrift for DBH-API-et (tabell 308 karakterer, 208 emner, 347 programregister) | `docs/oppskrift-dbh-karakterer.md` |
| Kobling program → DBH-koder, verifisert mot 308, med forbehold per program | `data/landsam/dbh-programkart.json` |
| Generator (henter 308/208 per institusjon, cache i `data/landsam/kilder/dbh-cache/`) | `scripts/build-landsam-courses.py` |
| Generert datamodul (1 298 emner, 2021–2025) | `kilde/src/app/data/landsamCourseData.ts` + `.json` |
| Komponent | `kilde/src/app/components/LandsamCourseAnalysis.tsx` |

Regler og forbehold:
- Karakterene er per program (studentene på programmet), per emnekode og år, summert over semestre. Snitt A=5…F=0 bare over bokstavkarakterer; bestått/ikke bestått (G/H) vises som egen andel.
- Karakterindeks = kandidatvektet snitt over alle bokstavemner i valgt år. Emner med færre enn terskelen (standard 10 kandidater) holdes utenfor.
- DBH skjermer små tall («med skjerming for utvalgte rapporter»); summene per emne kan ligge litt under grovere totaler.
- Program som deler DBH-kode får identiske tall (HVL LANA i to grupper). INN skiftet institusjonskode 0264 → 1177 i 2025; AHO og UiT deler koden for landskapsarkitektur. Begge håndteres via feltet `institusjonskoder` i koblingen.
- UiS femårig byplanlegging har i praksis ingen karakterrader i DBH (UiS fører dem på den toårige masteren). UiO folkehelse og NMBU sine nyeste mastere (M-GEP, M-EEG) har kort historikk.
- Oppdatere: `python3 scripts/build-landsam-courses.py --refresh` (henter på nytt; uten `--refresh` brukes cachen).

## LANDSAM: emnekobling, BI og studieplaner (lagt til 22.09.2026)

**Sammenlign emne** (fane i Emner og karakterer): samme fag på tvers av institusjoner.
- Koblingene ligger i `data/landsam/emnekobling/<gruppe>.json` (manuelt kartlagt av agenter mot studieplaner og emnebeskrivelser; 85 emnetyper, 272 koblinger). `scripts/build-landsam-course-mapping.py` validerer mot DBH-dataene og lager `landsamCourseMapping.ts`.
- Er faget delt i flere emner summeres karakterene. Terskelen for kandidater gjelder per emnekode.
- Samfunnsøkonomi og miljøforvaltning har bare én emnetype: NMBU-programmet er nytt fra 2024. Gjør gruppen på nytt når kullene er ferdige.

**BI** er lagt inn i eiendom-gruppen (Bachelor i eiendomsmegling, jus og økonomi, DBH-kode DIPEMH under institusjonskode 8241). BI er ikke i Samordna opptak, så opptakstall mangler. DBH rapporterer høye kandidattall for BI-emner som deles med andre BI-bachelorer; tallene er ikke rene programtall.

**Studieplan** (fane i Emner og karakterer): obligatoriske emner per program fra de offisielle studieplanene, koblet til DBH-karakterer.
- Én fil per program i `data/landsam/studieplaner/<entryId>.json`: obligatoriske emner med år, semester, studiepoeng, DBH-koder, kilder og forbehold, samt spesialiseringer. `scripts/build-landsam-studyplans.py` summerer karakterene over DBH-kodene og lager `landsamStudyPlanData.ts`.
- «Obligatorisk karakterindeks» = kandidatvektet snitt over obligatoriske emner med bokstavkarakter i valgt år.
- Forbehold som er verdt å kjenne: flere institusjoner har byttet emnekoder (HVL landmåling fra 2025, USN, Nord, UiO folkehelse fra 2026), og DBH-karakterene ligger på de gamle kodene. NMBU Eiendomsutvikling har bare 2024-planen publisert. INN eiendomsmegling ser ut til å være nedlagt (siste kull 2023).

## Skjerming i DBH (funnet 22.09.2026)

DBH skjermer celler med 1–2 kandidater i tabell 308 og viser dem som 0. På programnivå (studentene på ett program) forsvinner små strykantall, så strykprosenten er underestimert. Generatoren henter derfor også:
- emnenivå (alle studenter på emnet ved institusjonen), som er lite skjermet og stemmer med karakterweb.no (`CourseStats.emnenivaa`);
- reelle totaler uten karakterinndeling, slik at antall skjermede kandidater per emne og år kan telles (`CourseGradeYear.skjult`).
I emnetabellen vises stryk som «≥ x %» når kandidater er skjermet, og nedtrekket per rad viser begge fordelingene og intervallet reell stryk ligger i. Karakterindeks på programnivå er i praksis lite påvirket (skjermede celler er små), men strykprosent på programnivå må leses som et minimum.

## REALTEK (lagt til 22.09.2026)

Andre fakultet i verktøyet, bygd med samme kjede som LANDSAM. Alt ligger under `data/realtek/` med samme filstruktur
(programkart, dbh-programkart, kilder, emnekobling, studieplaner) og genereres med `scripts/build-faculty.sh realtek`.
Appen har et fakultetsregister (`kilde/src/app/data/faculties.ts`) slik at LANDSAM- og REALTEK-dataene går gjennom de samme komponentene.

| Lag | Omfang |
|---|---|
| Opptak (Samordna opptak) | 13 grupper, 76 program. NTNU er hovedkonkurrent for alle sivilingeniørløpene. |
| Karakterer (DBH 308/208) | 4 394 emner, 2021–2025, emnenivå og skjermingstelling som for LANDSAM. |
| Emnekobling på tvers | 13 grupper, ca. 150 emnetyper. Grunnpakken (matematikk, statistikk, fysikk, programmering, ex.phil) kobler godt på tvers. |
| Studieplaner | 74 av 76 program, 1 188 obligatoriske emner, 868 med karakterdata. Emnekoder koblet automatisk med `scripts/link-studyplan-codes.py`. |

Forbehold:
- NTNU la om matematikkodene fra kull 2025 (TMA4100 → TMA4400 osv.), HVL landmåling fra 2025 (LEI121 …). DBH-karakterene ligger på de gamle kodene, så nye koder står uten tall til neste DBH-leveranse.
- UiS sine femårige løp i datateknologi og kybernetikk har ingen karakterrader i DBH (UiS fører dem på bachelor-/masterkoder med annen studentgruppe). UiT bærekraftig kjemi og OsloMet smart vannteknologi er for nye.
- NMBU har bare to rene toårige mastere ved REALTEK (Datavitenskap og Intelligent Water Technology); de andre «M-»-kodene i DBH er de femårige løpene.
- Små NMBU-program (Geoinformatikk, Energi- og miljøfysikk, IWT) ligger ofte under terskelen på 10 kandidater; koblingene der bygger på summen 2021–2025 og er merket.
- NMBU mangler motstykke til fag som alle konkurrentene har: statistikk i maskin, mikroøkonomi og markedsføring i indøk, diskret matematikk og programvareutvikling i datavitenskap, vegbygging og BIM i bygg. Det står i gruppenotatene og er i seg selv et funn.

## BIOVIT, KBM og MINA (lagt til 23.09.2026)

Samme kjede som LANDSAM og REALTEK: `data/<fakultet>/` med programkart, dbh-programkart, kilder, emnekobling, studieplaner og markedsstatus;
`scripts/build-faculty.sh <fakultet>` genererer alt. Veterinærhøgskolen er bevisst utelatt (ingen innenlandsk konkurrent).

| Fakultet | Opptak | Karakterer (DBH) | Emnekobling | Studieplaner |
|---|---|---|---|---|
| BIOVIT | 8 grupper, 38 program | 1475 emner | 71 emnetyper | 38 av 38 program |
| KBM | 7 grupper, 31 program | 927 emner | 60 emnetyper | 31 av 31 program (UiT kjemi og UiB ernæring med tomme lister, kilden var utilgjengelig) |
| MINA | 10 grupper, 45 program | 1657 emner | 91 emnetyper | 45 av 45 program |

Forbehold:
- Søkertall for de toårige masterne (lokalt opptak) kommer fra DBH tabell 379 (søknadsalternativer, kvalifiserte, tilbud), hentet 23.09. Førstevalg, plasser, kjønn og poenggrenser publiseres ikke der; 2026 er ikke rapportert ennå. To koder lot seg ikke følge bakover (NMBU EM-ABG og M-MAT før 2025).
- «Natur og miljø» (MINA) er et årsstudium og er holdt utenfor. NMBU Matvitenskap og ernæring og Mat, teknologi og helse er samme DBH-kode (B-MAT), altså en videreføring under nytt navn.
- NTNU avvikler toårige mastere i kjemi (siste opptak 2025) og bioteknologi/matvitenskap (2026). UiT Akvamedisin er et femårig profesjonsstudium, ikke toårig master.
- Mange NMBU-program her er små; emnekoblingene bygger derfor ofte på summen 2021–2025 og er merket.

## Studiebarometeret og markedsstatus for fakultetene (23.09.2026)

- `scripts/build-studiebarometer.py <fakultet>` henter studiebarometeret.no per program (programside, tidsserie og delspørsmål; id = institusjonskode_programkode fra DBH-koblingen) til `data/<fakultet>/studiebarometer.json` og `kilde/src/app/data/<fakultet>StudiebarometerData.ts`. Program med for få svar får `warning` og tomme verdier.
- `scripts/build-markedsstatus.py <fakultet>` legger styrepapir-oppsummeringene fra `data/<fakultet>/markedsstatus.json` inn i appen og kopierer PDF-ene til `kilde/public/markedsstatus/<fakultet>/`. Styrepapirer bak innlogging (NTNU-fakultetene, UiT sin e-innsynsportal, OsloMet sine vedlegg) er lenket til siden, ikke lastet ned.
