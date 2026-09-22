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
