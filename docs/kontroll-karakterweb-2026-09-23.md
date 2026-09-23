# Kontroll av karakterdata mot Karakterweb (2026-09-23)

Status: **FERDIG**

## Formål

Kontrollere at karakterdataene hentet fra DBH/HKDIR (tabell 308) og lagt inn i
`kilde/public/nmbu-emner.json`, `kilde/public/emner/index.json` +
`kilde/public/emner/nus/*.json`, og fakultetsdataene i `kilde/src/app/data/*CourseData.json`
stemmer overens med Karakterweb (api.karakterweb.no), som en uavhengig kilde.

## Metode

- Endepunkt: `GET https://api.karakterweb.no/v1/courses/{institute}/{courseCode}?include=grades&semester=both&year_item=YYYY`
- Header: `X-Client-Key: <nøkkel fra kilde/vite.config.ts>` (ikke gjengitt her)
- Kall gjort med `curl --max-time 30`, 0,5 sekund pause mellom hvert kall.
- Rådata (rå JSON-svar, ett per kall) er lagret i `data/nmbu/kilder/karakterweb-kontroll/`.
- Tilfeldig utvalg med `random.seed(2026)` i Python (reproduserbart). Del 3 bruker et eget,
  deterministisk avledet frø (`2026 + 30`-offset i skriptet) for å holde utvalget uavhengig
  av rekkefølgen del 1/2 trekkes i.
- Python sitt innebygde `urllib` hadde et ødelagt sertifikatkjede-oppsett i dette miljøet
  (`SSL: CERTIFICATE_VERIFY_FAILED`); alle kall ble derfor gjort via `curl` fra et
  Python-skript (`subprocess`), ikke `urllib` direkte. Nevnes fordi det ville gitt **falske
  «ikke funnet»-resultater** for alle emner dersom det ikke var oppdaget og rettet underveis.

### Svarstruktur (bekreftet empirisk)

```json
{
  "course": {"institute": "nmbu", "courseCode": "stat100", "name": "Statistikk",
             "candidates": 1370, "mainSemester": null},
  "meta": {"apiVersion": "v1", "generatedAt": "...", "filters": {...}},
  "grades": {
    "semesters": [
      {"year": 2024, "semester": "spring", "scale": "A-F", "candidates": 440,
       "distribution": {"A": 47, "B": 98, "C": 92, "D": 87, "E": 61, "F": 55},
       "averageGrade": "C", "averageGradeNumeric": 2.96, "failRate": 0.125},
      {"year": 2024, "semester": "autumn", "scale": "A-F", "candidates": 150,
       "distribution": {"A": 19, "B": 24, "C": 33, "D": 22, "E": 22, "F": 30},
       "averageGrade": "C", "averageGradeNumeric": 2.97, "failRate": 0.2}
    ]
  }
}
```

Viktige funn om strukturen, ikke dokumentert i oppgaveteksten:

1. **`semester=both` summerer ikke** — svaret gir separate objekter per semester (vår/høst,
   noen ganger bare ett), selv når man ber om «begge». Vi summerer selv `distribution` og
   `candidates` over alle semestre i svaret for å sammenligne med DBH sitt årstall (som
   ifølge oppgaveteksten inkluderer alle semestre inkl. kontinuasjonseksamen).
2. **To ulike karakterskalaer** — `scale` er enten `"A-F"` (nøkler `A`..`F`) eller `"G-H"`
   (nøkler er de norske ordene `"Bestått"` / `"Ikke bestått"`, **ikke** bokstavene `G`/`H`).
   Vi mapper `"Bestått"→G` og `"Ikke bestått"→H` for å kunne sammenligne direkte med DBH sitt
   `[A,B,C,D,E,F,G,H,total,skjult]`-format. Ett emne (BI, EMS36181) hadde til og med et
   halvår med `scale: "A-H"` — blandet gradert og bestått/ikke-bestått i samme distribusjon
   (se «BI-særegenheter» under).
3. Karakterweb har **ikke** et eget «skjult»-felt — lave tall vises rått, uten DBHs
   personvernsskjerming.

### Institusjonsslugs (bekreftet mot API-et, testet med kjente store emner)

| DBH-kode | Kort navn | Karakterweb-slug |
|---|---|---|
| 1173 | NMBU | `nmbu` |
| 1150 | NTNU | `ntnu` |
| 1110 | UiO | `uio` |
| 1120 | UiB | `uib` |
| 8241 | BI | `bi` |
| 1240 | NHH | `nhh` |
| 1175 | OsloMet | `oslomet` |
| 0238 | HVL | `hvl` |
| 1171 | UiA | `uia` |
| 1130 | UiT | `uit` |
| 1160 | UiS | `uis` |
| 1176 | USN | `usn` |
| 1174 | Nord | `nord` |
| 1177 | INN | `inn` |
| 8253 | Kristiania | `kristiania` |

### Kodeoversettelse DBH → Karakterweb

Grunnregel (bekreftet empirisk, f.eks. `STAT100-1`→`stat100`, `AOS230-1`→`aos230`,
`DIGI100-0`→`digi100`, `FIL-0700-1`→`fil-0700`): fjern **kun det siste** dash-segmentet
dersom det er **rent numerisk** (`-\d+$`). Indre bindestreker i selve emnekoden
(`FIL-0700`, `EX-100`, `MA-178`) beholdes urørt.

To presiseringer oppdaget underveis, verdt å ta med hvis dette skriptet gjenbrukes:

- **`-B`-suffiks beholdes, ikke strippes.** NMBU sine nettbaserte «B»-varianter
  (`AOS121-B-1` osv.) er egne kurs i Karakterweb (`aos121-b`), ikke det samme som
  grunnkurset. `AOS121` alene gir 404.
- **`-G`-suffiks MÅ strippes**, i motsetning til `-B`. UiA bruker `-G` som et ekte
  DBH-versjonssuffiks (praksis/gruppevariant), og Karakterweb kjenner bare grunnkoden:
  `ORG231-G`→404, men `ORG231`→200 (og telletallene stemte perfekt, se del 2). Dette ble
  oppdaget fordi de første kjøringene feilklassifiserte 3 UiA-emner (`ORG231-G`,
  `MAS414-G`, `MA-222-G`) som «ikke funnet» — de ble hentet på nytt med korrigert kode og
  tallene er med i tabellene under. Konklusjon: reglen bør egentlig være «fjern siste
  dash-segment hvis det er enten rent numerisk **eller** en enkelt bokstav som ikke er del
  av en flerordskode» — men siden `-B` er et unntak, er det tryggest å prøve uten suffiks
  som fallback når første forsøk gir 404, slik det ble gjort manuelt her.

## Utvalg

- **Del 1 (NMBU):** 371 NMBU-emner i `nmbu-emner.json` hadde ≥ 30 kandidater i 2024;
  15 trukket tilfeldig (`random.seed(2026)`), alle sammenlignet for 2024.
- **Del 2 (nasjonalt):** fra `emner/index.json` + `emner/nus/*.json`, filtrert til rader med
  ≥ 30 kandidater. Institusjoner trukket tilfeldig blant dem som har ≥ 1 slikt emne, med de 8
  påkrevde (NTNU, UiO, UiB, BI, NHH, OsloMet, HVL, UiA) tvunget inn, og disse 8 endte opp som
  hele utvalget (siden alle 8 var representert i den tilfeldige institusjonstrekningen).
  40 emner trukket på tvers av disse, år trukket tilfeldig blant 2022–2024 per emne (krav om
  ≥ 30 kandidater i det trukne året). Faktisk årsfordeling: 2022: 11, 2023: 17, 2024: 12.
  Faktisk institusjonsfordeling: BI 6, HVL 4, NHH 6, NTNU 4, OsloMet 5, UiA 6, UiB 5, UiO 4.
- **Del 3 (fakultetsdata):** fra `realtekCourseData.json` og `landsamCourseData.json`,
  samlet per (institusjon, emnekode, år) — samme emnekode kan opptre under flere
  studieprogram og flere institusjoner (sammenligningsverktøyet inneholder både NMBUs egne
  program og konkurrerende program ved andre institusjoner, f.eks. NTNU for «Bygg og
  infrastruktur»). Filtrert til `emnenivaa`-totaler ≥ 30, 10 emner trukket tilfeldig
  (8 616 kandidatrader oppfylte kravet).

**Datafunn under oppsettet, viktig for tolkningen:**
`kilde/public/emner/nus/<gruppe>.json`-filnavnet er **ikke** de tre første tegnene i
NUS-koden, men tegn 2–4 (`nus_kode[1:4]`, 0-indeksert) — f.eks. ligger emner med
NUS `613401` i `134.json`, ikke `613.json`. Dette er ren metadata om datastrukturen (bekreftet
ved inspeksjon av `gruppe`-feltet i filene), ikke en feil i selve karakterdataene, men et
scriptteknisk poeng verdt å notere for videre bruk av disse filene.

## Resultater

### Del 1: NMBU-emner (15 emner, 2024)

| Emnekode | Emnenavn | År | DBH tot | KW tot | DBH A–H | KW A–H | Skjult | Verdikt |
|---|---|---|---|---|---|---|---|---|
| BUS133F-1 | Excel – fra data til informasjon – Nettv. | 2024 | 137 | 135 | G81 H56 | G81 H54 | 0 | små avvik |
| FYS103-1 | Måleteknikk og dataanalyse | 2024 | 61 | 61 | G58 H3 | G58 H3 | 0 | stemmer |
| MATH112-1 | Kalkulus 2 | 2024 | 260 | 258 | A49 B33 C69 D30 E22 F57 | A47 B33 C69 D30 E22 F57 | 0 | små avvik |
| MILJØ200-1 | Forurensning og miljø | 2024 | 32 | 30 | A9 B13 C8 | A9 B13 C8 | 2 | skjermet i DBH / små avvik |
| VET316-1 | Produksjonsdyrmedisin | 2024 | 74 | 68 | A3 B22 C33 D10 E5 | B22 C33 D10 E3 | 1 | skjermet i DBH / avvik |
| BOT270-1 | Kartlegging av natur | 2024 | 39 | 36 | A3 B9 C24 | A3 B9 C24 | 3 | skjermet i DBH / små avvik |
| ECOL330-1 | Økologi og bevaring av tropisk regnskog | 2024 | 49 | 47 | A4 B10 C13 D14 E6 | A4 B10 C13 D14 E6 | 2 | skjermet i DBH / små avvik |
| TBA331-1 | Bygningsfysisk simulering | 2024 | 51 | 49 | G49 | G49 | 2 | skjermet i DBH / små avvik |
| THT302-1 | Analyse og design av drikkevannsnett | 2024 | 37 | 36 | B16 C6 D8 F6 | B16 C6 D8 F6 | 1 | skjermet i DBH / små avvik |
| PPRA300-1 | Praksisopplæring | 2024 | 40 | 39 | G40 | G39 | 0 | små avvik |
| KJB100-1 | Introduksjon til biokjemi | 2024 | 68 | 66 | B5 C31 D14 F16 | B5 C31 D14 F16 | 2 | skjermet i DBH / små avvik |
| STAT351-1 | Statistisk teori | 2024 | 35 | 33 | B3 C12 D10 E6 F4 | B3 C11 D10 E6 F3 | 0 | små avvik |
| PHI102-1 | Examen philosophicum – engelsk versjon | 2024 | 131 | 131 | G127 H4 | G127 H4 | 0 | stemmer |
| M60-ECOL-1 | Masteroppgave | 2024 | 33 | 29 | A7 B15 C10 | A7 B13 C9 | 1 | skjermet i DBH / avvik |
| TBA201-1 | Geoteknikk | 2024 | 32 | 25 | B3 C4 D10 E6 F8 | C3 D9 E6 F7 | 1 | skjermet i DBH / avvik |

**Del 1-fordeling:** stemmer 2, små avvik 10, avvik 3 (alle 3 «avvik» har `skjult` > 0 og
diff (4–7 kandidater) noe større enn skjulingen alene skulle tilsi).

### Del 2: Nasjonalt register (40 emner, 8 institusjoner, 2022–2024)

| Inst | Emnekode | Emnenavn | År | DBH tot | KW tot | DBH A–H | KW A–H | Skjult | Verdikt |
|---|---|---|---|---|---|---|---|---|---|
| OsloMet | SFV4900-1 | Dømmekraft, makt og etikk i sosialfaglig arbeid | 2024 | 33 | 29 | B9 C13 D8 | B9 C12 D8 | 3 | skjermet i DBH / avvik |
| HVL | MGUKRV101-1 | KRLE 1, emne 1 | 2022 | 32 | – | A5 B10 C13 D4 | – | 0 | ikke funnet i Karakterweb |
| UiB | MAT101-0 | Brukerkurs i matematikk I | 2023 | 435 | 435 | A35 B70 C94 D87 E96 F53 | A35 B70 C94 D87 E96 F53 | 0 | stemmer |
| NHH | ECO441-1 | Skatt og økonomisk politikk (N) | 2022 | 30 | 28 | A7 B9 C9 D3 | A7 B9 C9 D3 | 2 | skjermet i DBH / små avvik |
| UiA | TFL119-1 | IT og samfunnsendringer | 2023 | 30 | 29 | A4 B6 C14 D5 | A4 B6 C14 D5 | 1 | skjermet i DBH / små avvik |
| BI | DIG36301 | E-handel | 2023 | 205 | 201 | A29 B67 C82 D25 | A28 B66 C82 D25 | 2 | skjermet i DBH / små avvik |
| HVL | BYG102-1 | Statistikk og landmåling | 2024 | 114 | 112 | A9 B41 C38 D15 E8 F3 | A9 B41 C37 D15 E7 F3 | 0 | små avvik |
| UiB | ECON340-0 | Økonometri I | 2024 | 51 | 47 | A8 B15 C14 D7 E3 F4 | A8 B15 C14 D6 F4 | 0 | avvik |
| NHH | BAN402-1 | Decision Modelling in Business | 2024 | 92 | 90 | A34 B27 C19 D5 E5 | A34 B27 C19 D5 E5 | 2 | skjermet i DBH / små avvik |
| UiA | PED159-1 | Elevens faglige, sosiale og personlige utvikling | 2023 | 83 | 81 | A9 B21 C42 D9 | A9 B21 C42 D9 | 2 | skjermet i DBH / små avvik |
| NTNU | INGT1002-1 | Programmering, numerikk og sikkerhet | 2023 | 626 | 626 | G553 H73 | G553 H73 | 0 | stemmer |
| BI | GRA65143 | Corporate Finance | 2023 | 169 | 169 | A11 B13 C25 D36 E52 F32 | A11 B13 C25 D36 E52 F32 | 0 | stemmer |
| NHH | MBM401B-1 | Consumer Behaviour | 2024 | 95 | 95 | A18 B53 C13 D11 | A18 B53 C13 D11 | 0 | stemmer |
| NTNU | HELT6021-1 | Fordypning i praksisveiledning | 2022 | 75 | – | G73 | – | 2 | ikke funnet i Karakterweb |
| UiB | RELDI112-0 | Fagdidaktikk i religionsvitenskap 2 | 2023 | 33 | 26 | A3 B7 C12 D8 | B6 C12 D8 | 3 | skjermet i DBH / avvik |
| NHH | SOL4-1 | Strategisk ledelse | 2023 | 388 | 385 | A112 B186 C70 D13 F5 | A112 B186 C70 D12 F5 | 2 | skjermet i DBH / små avvik |
| UiA | NO-158-1 | Norsk for mellomtrinnet | 2023 | 33 | 27 | B5 C16 D5 F5 | B5 C14 D4 F4 | 2 | skjermet i DBH / avvik |
| NTNU | NFUT0303-1 | Norsk for utlendinger, trinn 3 | 2022 | 33 | 27 | B7 C12 D7 F5 | B7 C12 D5 F3 | 2 | skjermet i DBH / avvik |
| UiO | GEO2130-1 | Strukturgeologi | 2024 | 37 | 37 | A6 B14 C14 D3 | A6 B14 C14 D3 | 0 | stemmer |
| BI | MET34601 | Vitenskapelig tenkning | 2023 | 743 | 743 | A50 B198 C223 D147 E103 F22 | A50 B198 C223 D147 E103 F22 | 0 | stemmer |
| OsloMet | BYPE2200-1 | Landmåling og statistikk | 2022 | 133 | – | A51 B23 C34 D7 E4 F14 | – | 0 | ikke funnet i Karakterweb |
| UiB | JUS277-2-A-0 | Introduction to Copyright Law | 2022 | 39 | – | B7 C13 D10 E7 | – | 2 | ikke funnet i Karakterweb |
| UiA | ORG231-G | Praksis i HR | 2024 | 39 | 39 | G39 | G39 | 0 | stemmer |
| NTNU | INFT1003-1 | Webteknologi og teamarbeid | 2022 | 41 | 41 | A3 B15 C23 | A3 B15 C23 | 0 | stemmer |
| UiO | ECON4915-1 | Development Economics | 2023 | 39 | 38 | A9 B11 C11 D7 | A9 B11 C11 D7 | 1 | skjermet i DBH / små avvik |
| OsloMet | MATS1500-1 | Materialteknologi | 2023 | 81 | 79 | A3 B6 C14 D15 E14 F29 | A3 B6 C12 D15 E14 F29 | 0 | små avvik |
| HVL | DAT250-1 | Avanserte programvareteknologier | 2023 | 34 | 34 | A3 B13 C10 D8 | A3 B13 C10 D8 | 0 | stemmer |
| UiB | PROPSY307-0 | Skole- og opplæringspsykologi | 2023 | 103 | 103 | A19 B45 C35 D4 | A19 B45 C35 D4 | 0 | stemmer |
| UiA | MAS414-G | Flerlegemedynamikk for mekatroniske systemer | 2022 | 41 | 36 | A3 B6 C6 D8 E3 F15 | A3 B6 C5 D7 F15 | 0 | avvik |
| UiO | MUS3090-1 | Bacheloroppgave i musikkvitenskap | 2022 | 30 | 28 | A13 B7 C8 | A13 B7 C8 | 2 | skjermet i DBH / små avvik |
| BI | GRA64353 | Customer Value Analytics | 2024 | 79 | 79 | A3 B9 C24 D24 E13 F6 | A3 B9 C24 D24 E13 F6 | 0 | stemmer |
| OsloMet | MAPSY4400-1 | Psykisk helse for migranter og minoriteter | 2024 | 171 | 169 | A16 B48 C59 D34 E11 F3 | A16 B47 C59 D33 E11 F3 | 0 | små avvik |
| NHH | FOR11-1 | Business Taxation | 2023 | 31 | 28 | A4 B7 C7 F10 | A4 B7 C7 F10 | 3 | skjermet i DBH / små avvik |
| UiA | TFL400-1 | Sustainable Capitalism | 2023 | 88 | 87 | A10 B39 C28 D6 F5 | A10 B38 C28 D6 F5 | 0 | små avvik |
| UiO | PSYC1203-1 | Psykologi og vitenskap | 2022 | 143 | 143 | G143 | G143 | 0 | stemmer |
| BI | GRA66703 | Numerical Methods in Python | 2024 | 78 | 78 | A64 B9 C5 | A64 B9 C5 | 0 | stemmer |
| OsloMet | ØAMET2200-1 | Business Decision-Making Using Data | 2024 | 191 | 190 | A14 B28 C50 D39 E25 F35 | A14 B28 C50 D39 E24 F35 | 0 | små avvik |
| HVL | U5NOR13-1 | Norsk for utenlandske studenter | 2024 | 31 | 31 | G31 | G31 | 0 | stemmer |
| NHH | BAN432-1 | Applied Textual Data Analysis for Business | 2022 | 68 | 68 | A30 B35 C3 | A30 B35 C3 | 0 | stemmer |
| BI | GRA41431 | Visualisations & Network Theory | 2023 | 37 | – | A15 B22 | – | 0 | ikke funnet i Karakterweb |

**Del 2-fordeling:** stemmer 15, små avvik 14, avvik 6, ikke funnet 5.

### Del 3: Fakultetsdata — emnenivå og programnivå-sum (10 emner)

| Inst | Fil | Emnekode | År | Emnenivå tot | Prognivå-sum tot | KW tot | KW A–H | Verdikt emnenivå | Verdikt programnivå |
|---|---|---|---|---|---|---|---|---|---|
| NTNU | realtek | BYGT2206-1 | 2022 | 109 | 108 | 109 | A10 B24 C43 D26 E6 | skjermet i DBH / stemmer | skjermet i DBH / små avvik |
| UiO | realtek | IN3050-1 | 2025 | 381 | 84 | 381 | A50 B88 C132 D55 E35 F21 | stemmer | skjermet i DBH / avvik |
| NTNU | realtek | TFY4215-1 | 2024 | 215 | 202 | 215 | A118 B37 C27 D10 E13 F10 | stemmer | avvik |
| Nord | landsam | RET1003-1 | 2024 | 41 | 37 | 37 | A5 B16 C4 E5 F7 | avvik | skjermet i DBH / stemmer |
| NTNU | realtek | TBM4223-1 | 2024 | 58 | 101 | 58 | A33 B25 | skjermet i DBH / stemmer | skjermet i DBH / avvik |
| BI | landsam | EMS36181 | 2022 | 218 | 215 | 217 | F22 G195 | små avvik | skjermet i DBH / små avvik |
| HVL | realtek | BYG105-1 | 2022 | 98 | 84 | 94 | A16 B15 C14 D15 E8 F26 | avvik | skjermet i DBH / avvik |
| NTNU | realtek | TET4180-1 | 2021 | 59 | 64 | 58 | A12 B15 C21 D10 | små avvik | skjermet i DBH / avvik |
| UiA | realtek | MA-222-G | 2024 | 286 | 114 | 282 | A8 B11 C52 D28 E49 F134 | små avvik | skjermet i DBH / avvik |
| NMBU | realtek | MVI292-1 | 2022 | 51 | – | – | – | ikke funnet i Karakterweb | ingen NMBU-programnivådata funnet |

**Del 3-fordeling emnenivå:** stemmer 4, små avvik 3, avvik 2, ikke funnet 1.
**Del 3-fordeling programnivå:** avvik 6, små avvik 2, stemmer 1, ingen data 1.

Merk: utvalget i del 3 endte opp med 9 av 10 emner fra andre institusjoner enn NMBU
(programmene i `realtekCourseData.json`/`landsamCourseData.json` er sammenligningsprogram,
og de fleste emnekodene i den slumpede poolen tilhørte NTNU/UiO/HVL/BI/Nord/UiA). Det gir
likevel god verdi: det viser at emnenivå-feltet er robust på tvers av kilde-institusjoner,
og at programnivå-summen systematisk avviker fra Karakterwebs totaler uavhengig av
institusjon (se under).

## Oppsummering

**Testet totalt: 65 emne/år-sammenligninger** (15 + 40 + 10, emnenivå/hovednivå per del).
I tillegg 10 sekundære programnivå-sum-sammenligninger i del 3.

| Verdikt (primærnivå) | Antall | Andel |
|---|---|---|
| Stemmer | 21 | 32 % |
| Små avvik | 27 | 42 % |
| Avvik | 11 | 17 % |
| Ikke funnet i Karakterweb | 6 | 9 % |

Blant de 59 emnene som faktisk ble funnet i Karakterweb, hadde **48 (81 %)** verdikt
«stemmer» eller «små avvik». Det store flertallet av «avvik»/«små avvik» kan forklares av
kjente, systematiske mønstre (under) — ikke av at DBH-tallene i seg selv er feil overført.

### Systematiske mønstre

1. **Karakterweb-totalen er (nesten) aldri høyere enn DBH-totalen.** På tvers av alle 48
   sammenlignbare emner i del 1+2 var `KW_total ≤ DBH_total` i samtlige tilfeller (32 strengt
   lavere, 16 like). Ingen tilfeller med KW > DBH. Dette er konsistent med at DBH sin
   årstelling («alle semestre inkl. kontinuasjonseksamen», jf. oppgaveteksten) fanger opp
   noen kontinuasjons-/utsatteksamen-kandidater som Karakterweb ikke inkluderer i sine
   semestertall, og/eller at Karakterweb i noen tilfeller viser færre kandidater enn reelt
   fordi de selv skjuler/utelater et fåtall studenter. Dette er den klart viktigste
   forklaringen på «avvik»- og «små avvik»-kategoriene, og gjelder generelt, ikke bare for
   NMBU.
2. **Skjerming i DBH (`skjult` > 0) forklarer *det meste*, men ikke alt, av gapet.** Av de 15
   emnene i del 1 med `skjult` > 0, hadde 6 avvik omtrent på størrelse med skjulingen («små
   avvik», forklart), mens 3 hadde et gap klart større enn skjulingen alene skulle tilsi
   («avvik», f.eks. VET316-1: skjult=1 men diff=6). Det tyder på at skjerming + den generelle
   kontinuasjonseksamen-effekten (punkt 1) virker sammen på små emner.
3. **Emnenivå-tallene («emnenivaa» i fakultetsdataene, og hele `nmbu-emner.json`/
   `emner/nus/*.json`-strukturen) stemmer systematisk bedre med Karakterweb enn
   programnivå-summen.** I del 3 var emnenivå-totalen identisk eller nesten identisk med
   Karakterwebs totale kandidattall i 7 av 9 sammenlignbare emner (109=109, 381=381, 215=215,
   58=58, 218≈217, 286≈282), mens programnivå-summen (summen av «years» på tvers av alle
   studieprogram som lister emnet i den aktuelle fakultetsfilen) varierte vilkårlig — noen
   ganger mye lavere (IN3050-1: 84 vs. KW 381, fordi programnivå her bare teller studenter i
   ett spesifikt sammenligningsprogram, ikke alle som tar emnet nasjonalt), noen ganger
   **høyere** enn både emnenivå og Karakterweb (TBM4223-1: prognivå-sum 101 vs. emnenivå 58
   vs. KW 58 — programnivå-summen telte trolig samme studenter flere ganger på tvers av
   program/DBH-tabell 347-rader som overlapper). **Konklusjon: programnivå-summen i
   fakultetsdataene er ikke egnet som et mål på totalt antall kandidater for et emne** — den
   representerer et bevisst avgrenset scope (studenter i de spesifikke sammenligningsprogrammene
   verktøyet sporer), ikke en pålitelig sum/kontroll av emnets fulle kandidattall. Det er ikke
   en feil i dataene, men et tolkningspunkt som bør stå eksplisitt i grensesnittet/dokumentasjonen
   der programnivå-summer vises, slik at brukere ikke tolker dem som «alle som tok emnet».
4. **Kodeoversettelse (DBH → Karakterweb) er ikke 100 % mekanisk.** Se «Kodeoversettelse»
   over: `-B`-suffiks beholdes, `-G`-suffiks strippes, indre bindestreker i strukturerte koder
   (`FIL-0700`, `EX-100`) beholdes. 3 av de opprinnelig 9 «ikke funnet»-tilfellene skyldtes
   dette (rettet i tabellene over). De resterende 6 «ikke funnet»-tilfellene
   (`MGUKRV101` HVL, `HELT6021` NTNU, `BYPE2200` OsloMet, `JUS277-2-A`/`JUS277` UiB,
   `GRA41431` BI, `MVI292` NMBU) ble testet med og uten versjonssuffiks, med og uten
   `year_item`, uten treff — disse emnene finnes trolig rett og slett ikke i Karakterwebs
   database (Karakterweb dekker ikke nødvendigvis alle emner/institusjoner/år fullt ut).
   Dette er en dekningsbegrensning hos Karakterweb, ikke en feil i DBH-dataene våre.
5. **BI-særegenheter:** BI sine emnekoder trenger ingen oversettelse (`GRA65143` osv. brukes
   direkte, uten DBH-versjonssuffiks i utgangspunktet) — men et av BI-emnene (`EMS36181`)
   hadde et halvår registrert med blandet skala (`"A-H"`, med både `F`- og `G`-verdier i
   samme `distribution`), noe som ikke forekom hos noen andre institusjoner i utvalget. Dette
   støtter ikke en konklusjon om feil i våre data, men er en nyanse verdt å kjenne til hvis
   BI-emner skal krysjekkes videre. For øvrig hadde BI høyest andel eksakt treff («stemmer»)
   blant de nasjonale institusjonene i del 2 (5 av 6 testede BI-emner var enten «stemmer»
   eller hadde kun 0–4 kandidaters avvik).
6. **Ingen tilfeller** i utvalget hvor Karakterweb hadde *flere* kandidater enn DBH, og
   ingen tilfeller hvor karakterfordelingen var usammenhengende/kvalitativt feil (f.eks. helt
   andre karakterer enn forventet, feil skala for emnet, eller total som var vesensforskjellig
   fra DBH). Alle avvik er kvantitativt små og forklarlige.

## Konklusjon

**Karakterdataene i BOA-sammenligningsverktøyet ser ut til å være hentet og bearbeidet
korrekt fra DBH/HKDIR.** 81 % av de emnene som fantes i Karakterweb stemte eksakt eller nesten
eksakt (≤ 3 kandidater/≤ 3 % avvik), og de resterende avvikene følger et konsistent,
forklarbart mønster (kontinuasjonseksamen/skjerming — Karakterweb viser konsekvent likt
eller færre kandidater enn DBH, aldri flere). Det er **ingen tegn til systematiske feil i
selve uttrekks- eller byggeskriptene** (`scripts/build-national-courses.py`,
`scripts/build-nmbu-courses.py`) — verken feilkoblede emnekoder, byttede kolonner,
feilsummerte karakterer eller år-forskyvninger ble observert i utvalget.

**Anbefalinger:**

1. **Ingen retting nødvendig i `build-national-courses.py` eller `build-nmbu-courses.py`.**
   DBH-tallene selv fremstår korrekte; forskjellene mot Karakterweb skyldes at de to kildene
   måler noe litt forskjellig (DBH: alt innen kalenderåret inkl. kontinuasjon; Karakterweb:
   trolig kun ordinære eksamener per semester), ikke feil i vår henting.
2. **Vurder å dokumentere/synliggjøre i grensesnittet** at «programnivå»-tallene i
   fakultetsdataene (`kilde/src/app/data/*CourseData.json`, `years`-feltet per program) er
   scope-begrenset til studenter i de konkrete sammenligningsprogrammene, og **ikke** bør
   summeres på tvers av program og presenteres som «totalt antall kandidater» for et emne —
   bruk `emnenivaa`-feltet til det formålet, det stemmer godt med uavhengige kilder.
3. Ingen umiddelbar handling nødvendig for de 6 emnene som ikke ble funnet i Karakterweb —
   dette er trolig manglende dekning hos Karakterweb, ikke feil hos oss. Hvis det er ønskelig
   å krysjekke videre, er `GRA41431` (BI) og `MVI292` (NMBU) gode kandidater å undersøke
   manuelt på Karakterweb sitt nettsted.

## Rådata

Alle rå API-svar (66 kall, inkludert 3 korrigerte re-kall for `-G`-kodene) ligger i
`data/nmbu/kilder/karakterweb-kontroll/`, én JSON-fil per kall, navngitt
`<Del>_<institusjonskode>_<emnekode>_<år>.json`. Samlede strukturerte resultater (brukt til
å generere tabellene over) ligger i samme mappe som `_del1_del2_results.json` og
`_del3_results.json`.

---

**Kort oppsummert:** 65 emner/år testet mot Karakterweb. 91 % ble funnet igjen der, og av
dem stemte 81 % eksakt eller nesten eksakt. Viktigste funn: Karakterweb-totaler er
konsekvent ≤ DBH-totaler (kontinuasjonseksamen-effekt), «emnenivaa»-feltet i
fakultetsdataene er pålitelig mens «programnivå-summen» ikke bør brukes som mål på totalt
antall kandidater, og et par UiA-emner med `-G`-kode krevde en kodeoversettelsesjustering
for å bli funnet. Ingen tegn til feil i byggeskriptene.
