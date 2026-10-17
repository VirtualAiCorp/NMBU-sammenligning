# A2 – Masterlandskapet i økonomi (17.10.2026)

Kartlegging av alle norske masterprogram innen økonomisk-administrative fag, offentlige og private, med opptak,
studenttall, kandidater, gjennomføring, opptakskrav, skolepenger og akkreditering. Leveransen ligger i
`data/marked/master-okonomi/`. Ingen eksisterende kode eller datafil er endret.

## 1. Hva som er levert

| Fil | Innhold |
|---|---|
| `programmer.json` | 194 programoppføringer (189 fra DBH, 5 håndførte). `meta` forklarer feltene og kildene |
| `bygg_grunnlag.py` | Utvalg (NUS og navngitte koder), gruppering av DBH-koder til program, tall fra DBH 379/123/104/707/124. Skriver `grunnlag.json` (én rad per DBH-kode) |
| `manuelt.py` → `manuelt.json` | Håndførte felt per program: opptakskrav, siviløkonom, skolepenger, merknader, Samordna-koder for 5-årige |
| `bygg_programmer.py` | Setter sammen `programmer.json` |
| `kilder/` | Rådata: DBH 347 (2021–2026), DBH 379 (2021–2026), DBH 124, DBH 123/104/707 for VID og INN-707, programsider og utdanning.no-sider (`programsider/_urls.tsv` har URL og dato), EQUIS-lista, DBH-tabellkatalogen |

Kjøring, fra repoet: `python3 -I data/marked/master-okonomi/bygg_grunnlag.py && python3 -I data/marked/master-okonomi/manuelt.py && python3 -I data/marked/master-okonomi/bygg_programmer.py`.
Skriptene leser bare cache. Henteoppsettene (DBH-spørringene) står beskrevet i `meta.kilder`.

### Felt per program

`id`, `institusjon`, `instKort`, `instKode`, `avdeling`, `navn` (+ `navnHistorikk`), `kategori`/`kategoriNavn`, `kjerne`,
`type` (2-årig / erfaringsbasert / 5-årig integrert / 5-årig løp (3+2)), `privat`, `campus` og `campusRegistrerte2025`
(DBH 124), `deltid`, `sprak`, `sivilokonom` (true/false/null), `dbh` (koder, nivå, NUS, aktive år i 347),
`opptak` per år (søkere, førstevalg, kvalifiserte, tilbud, ja-svar, møtt), `opptakstype`, `registrerte` (123, høst),
`kandidater` (104), `gjennomforing` (707 per startkull), `opptakskrav` (snittkrav, bachelorkrav, kilde, dato, ev.
poenggrense og studieplasser), `skolepenger` (private), `akkreditering` (institusjonsnivå), `iHHProgramkart` og
`hhProgramkart` (gruppe og entryId), `so` (Samordna-kode, poenggrenser og søkertall for 5-årige), `merknad`, `flagg`, `iSum`.

### Utvalg og gruppering

- **DBH 347, nivå M2, M5, ME og MX, 2021–2026.** Med er alle koder med NUS 734 (samfunnsøkonomi), 741/742/744/749
  (økonomisk-administrative fag), MPA-kodene (731108/116/124), forretningsjus (737909) og 641158 (BIs MBA).
  I tillegg er navngitte koder utenfor disse NUS-gruppene tatt med: entreprenørskap (NTNU, UiO, HVL, UiA, Kristiania),
  business analytics og informasjonssystemer (Kristiania, UiB ITØK, UiO, USN), finans (UiT, UiB), eiendom (NMBU, NTNU,
  HVL), helseøkonomi (UiO, UiB), industriell økonomi, HiMoldes logistikkmastere, og organisasjon og ledelse (HiØ, HVL, UiT).
- **Holdt utenfor:** arealplanlegging (NMBU M-AR/M-ARE) og NTNU MPRSPED (spesialpedagogikk med NUS 741122, se §4).
  Ledelsesmastere i helse, barnehage, maritim sektor og beredskap utenfor NUS 741 er heller ikke med.
- **Kjerne og periferi:** `kjerne=false` gjelder utdannings- og helseledelse, industriell økonomi (siv.ing.), logistikk
  og reiseliv. De er med i fila, men ikke i markedstallene nedenfor.
- **Ett program = flere DBH-koder** der koden skifter med kull, heltid og deltid eller campus. Eksempler er NHH MASTER04–M25,
  INN MØLxx (0264 → 1177), UiT M-ØKADM*, USN SIVØKLED*, Kristianias -B- og X-koder og NHHs EMBA-kull. Grupperingen står i
  `GRUPPE` i `bygg_grunnlag.py`. NHHs gamle fordypningskoder (ACC, BAN, FIE …) er samlet i `nhh_majorkoder`. Koden hadde
  søkere fram til 2022 og ingen registrerte i 2025.

## 2. Kilder (hentet 17.10.2026 der ikke annet står)

- **DBH-API:** `https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData`
  - 347 (studieprogram): `variabler: ["*"]`, filter på Årstall og Nivåkode. Cache: `kilder/dbh347_master_<år>_*.json.gz`.
  - 379 (søkertall og møtte): groupBy Institusjonskode, Årstall, Studieprogramkode, Opptakstype, Kvalifisert, og en
    egen spørring med Prioritet = 1. Alle institusjoner, 2021–2026.
  - 124 (registrerte per campus): høsten 2025.
  - 123/104/707: gjenbrukt cache i `data/*/kilder/dbh-cache/` (hentet 23.09.2026). Nytt er hentet for VID (8208)
    og INN-707 (1177).
  - Tabellkatalog: `https://dbh.hkdir.no/api/Tabeller/bulk-csv?rptNr=001`, lagret i `kilder/`.
- **Samordna opptak** (5-årige): eksisterende cache `data/hh/kilder/so_sokertall_programnivaa_2021-2026_hentet_2026-09-22.json`
  og `so_poenggrenser_2020-2026_hentet_2026-09-22.csv`.
- **Programsider og utdanning.no** (opptakskrav, siviløkonomtittel, skolepenger, studieplasser): 160 sider i
  `kilder/programsider/`, med URL og dato i `_urls.tsv`.
  - **Institusjonssider:** NMBU, NTNU (`/studier/<kode>/opptak`), BI (programsidene og
    `bi.no/studier-og-kurs/soknad-og-opptak/opptakskrav/master-of-science/`), NHH-opptakssidene, OsloMet-programplanen,
    UiO-opptakssider og Kristianias programsider.
  - **utdanning.no:** listesidene `utdanningsoversikt/{okonomi_og_administrasjon, sivilokonomutdanning, samfunnsokonomi,
    finans, innovasjon_og_entreprenorskap, regnskap_og_revisjon, master_business_administration_mba}` og 76 programsider.
- **Akkreditering:** `data/rangering/skoler.json`, som bygger på AACSB-søket for Norge lest 3.10.2026, EFMDs EQUIS-liste og
  AMBA. EQUIS-lista er hentet på nytt 17.10.2026 (`kilder/akkreditering/equis.html`), og den viser BI og NHH.
- **Erfaringsbasert master, nasjonalt minstekrav:** forskrift om krav til mastergrad § 5 (bachelor og minst to års relevant
  yrkespraksis). Lovdata kunne ikke leses direkte. Kravet er gjengitt etter institusjonsdokumenter, så sikkerheten er middels.

## 3. Dekning

- **Program:** 194 oppføringer ved 18 institusjoner. 152 hadde registrerte eller søkere i 2025: 99 toårige,
  40 erfaringsbaserte og 13 femårige. 135 av dem er kjerneprogram.
- **Opptak (DBH 379):**
  - 2021–2025 for alle program med lokalt opptak.
  - **2026 høst er ikke rapportert ennå per 17.10.2026.** Feltet `2026v` er bare våropptaket.
  - For 5-årige er primærtallene nasjonalt opptak (Opptakstype N, som stemmer med Samordnas tall). Inntaket til masterdelen
    (L) ligger i `opptakAnnenType`.
- **Registrerte, kandidater og gjennomføring:** 2021–2025. 102 aktive program har 707-kull.
  - 707-horisonter som ikke er nådd ennå, er `null`. Datagrunnlaget går til og med 2025.
  - Normert tid for ME/MX er antatt å være 2 år.
- **Opptakskrav:** kontrollert mot programside eller utdanning.no for 60 program, blant dem 52 av 90 aktive toårige
  kjerneprogram (de 90 inkluderer BIs samlekode MSC). Alle NMBU-programmene og nesten alle program i HHs grupper `moa`, `mecon` og `mei` er med.
  - De 56 erfaringsbaserte har bare det nasjonale minstekravet (`generisk: true`).
  - Resten er `null`, det vil si ikke kontrollert.
  - Snittkrav som **ikke** er oppgitt på siden, er ført som «Ikke oppgitt», ikke som et antatt C.
- **Siviløkonom:** `true` for 23 program, `false` for 12 og `null` (ikke avklart) for resten. `true` bygger på programsiden,
  navnet eller NUS 741125/741133.
- **Skolepenger:** 14 private program, BI og Kristiania 2026/27. EMBA-priser er ikke kartlagt.
  VID er privat, men statsfinansiert, og skolepenger der er ikke kontrollert.
- **Akkreditering:** på institusjonsnivå. AACSB: BI, NHH, NMBU (2025) og UiA. EQUIS: BI og NHH. AMBA: BI og NHH (EMBA).
  UiS (EFMD-program, 5-årig ØA) og USN (EFMD-program, bachelor) gjelder enkeltprogram.
- **Nye program uten DBH-kode** (håndført, `dbh: null`): Kristiania Master i økonomi og ledelse (siviløkonom, ny),
  MSc in Financial Management (nett) og MBA (nett). I tillegg OsloMets og BIs femårige siviløkonomløp, som i DBH er
  registrert som bachelor + master.

## 4. Datafeil og avvik i eksisterende data

1. **HH-programkartet: Nord og OsloMet har fått hverandres tall (entreprenørskap, master).**
   - `nord_mei` og `oslomet_mei` har like `localData` for 2022–2024, og det er summen av begge.
   - Søkere: 2022 373 (99 + 274), 2023 317 (80 + 237), 2024 383 (121 + 262). Tilbud, ja-svar og møtt er rammet på
     samme måte. Riktige tall per institusjon står i `programmer.json` (`nord_maent`, `oslomet_maent`).
   - **Årsak:** `scripts/fill-local-admissions.py` lagrer radene per `Studieprogramkode` uten institusjonskode
     (`rows[key].setdefault(r["Studieprogramkode"], …)`). Begge institusjonene bruker koden **MAENT**.
   - Feilen slår ut i opptaksvisningen for «Entreprenørskap og innovasjon (master)», der NMBU M-EI sammenlignes med disse to.
   - Søket i alle fakultetenes programkart fant ingen andre delte koder.
   - **Retting:** nøkkel `(Institusjonskode, Studieprogramkode)` i skriptet, og deretter `fill-local-admissions.py hh`.
2. **`fill-local-admissions.py` filtrerer ikke på Opptakstype.** DBH 379 har både lokalt (L) og nasjonalt (N) opptak.
   Ingen av HHs mastere har N-rader i dag, så tallene stemmer, og kontrollen gir ellers bare de kjente NHH-avvikene for
   2022–2023. Et 5-årig program lagt inn som `local` vil derimot få Samordna-søkerne med.
3. **`oslomet_siv` (SO 215345) er ført som `master5`.** I DBH 347 er koden OKADSIV en bachelor (B3, 180 sp, «for siv.øk.»),
   og masterdelen er MASØA. DBH-baserte tall for oppføringen (emner, gjennomføring, studentene) gjelder derfor bare de tre
   første årene.
4. **`ntnu_circ` (MSCE) er en død sammenligning.** Den har ingen registrerte fra 2024 og ingen rader i DBH 379.
   Bioøkonomi har dermed ingen aktiv konkurrent i HH-kartet.
5. **OsloMet MAENT har ingen søkere eller møtte i DBH 379 for 2025**, men 22 registrerte. Enten var det ikke opptak i 2025,
   eller opptaket er ført på en annen kode. Det bør sjekkes før 2025 vises for `oslomet_mei`.
6. **Rare koder i DBH:**
   - NTNU MPRSPED (spesialpedagogikk) har NUS 741122 (utdanningsledelse).
   - UiA M-SHIFTOKO har NUS 741125 (siviløkonom), men ingen studenter etter 2023.
   - BI MSC («Master of Science») har 147 registrerte og ingen søkere. Koden er trolig utveksling eller overgang og er holdt
     utenfor summene (`iSum: false`).
7. **Små skjermingsavvik:** finere gruppering i 379 (for eksempel med Semester) gir 1–2 færre søkere for BI og Nord.
   Spørringene er derfor uten Semester. Det stemmer da eksakt med HH-kartet.

## 5. Markedet (kjerneprogram, sum av program med DBH-tall)

| | Program aktive 2025 | Registrerte 2021 → 2025 | Møtt 2021 → 2025 | Søkere 2025 | Kandidater 2025 |
|---|---|---|---|---|---|
| Toårige | 89 | 8 753 → 9 645 (+10,2 %) | 4 195 → 4 919 | 32 613 | 3 469 |
| Erfaringsbaserte | 36 | 4 394 → 4 209 | 1 491 → 1 181 | 6 030 | 1 362 |
| Femårige integrerte | 9 | 794 → 1 357 | 237 → 374 | 6 708 (Samordna) | 118 |

Største toårige kategorier i 2025 (registrerte):

| Kategori | Registrerte | Vekst siden 2021 |
|---|---|---|
| Økonomi og administrasjon | 4 279 | +2,2 % |
| Ledelse, organisasjon og HR | 1 262 | +33 % |
| Regnskap og revisjon | 1 022 | +45 % |
| Innovasjon og entreprenørskap | 747 | +8 % |
| Økonomi/IT og analytics | 483 | |
| Markedsføring og internasjonal business | 450 | |
| Finans | 396 | +32 % |
| Samfunnsøkonomi | 355 | −6 % |

- **Størst vekst:** MRR og finans. Søkerne til økonomi/IT og analytics økte fra 1 271 til 2 210.
- **Ned:** samfunnsøkonomi og ØA-søkerne (13 501 → 12 300).
- **Femårige siviløkonom** (NTNU, UiA, Nord, USN) vokser raskt: fra 165 til 600 registrerte, fordi NTNUs løp startet i 2022.

## 6. Hvor NMBUs M-ØA, M-ECON, M-EI og M-BIOEC står

Sammenligningsgrunnlaget er alle aktive toårige program i samme kategori. Kilder: DBH 379, 123, 104 og 707, og
programsidene for opptakskrav.

### M-ØA – Økonomi og administrasjon, siviløkonom (15 program)

| | NMBU | Kategorien |
|---|---|---|
| Registrerte 2025 (rang) | 198 (nr. 8) | 4 279 (andel 4,6 %) |
| Registrerte 2021 → 2025 | +5,9 % | +2,2 % |
| Møtt 2021 → 2025 | 85 → 102 (andel 4,9 %) | 1 839 → 2 061 |
| Førstevalgssøkere 2025 | 373 (andel 4,7 %) | 7 865 |
| Tilbud/kvalifiserte 2025 | 77 % | median 53 % |
| Møtt/tilbud 2025 | 43 % | median 41 % |
| Fullført på normert tid, kull 2021–23 | 71,4 % | snitt 63,5 % |
| Kandidater 2025 | 79 | 1 580 |

- **Opptakskrav:** NMBUs programside oppgir ikke noe snittkrav. Den oppgir poenggrense 3,20 (2025) og 85 studieplasser.
  - De fleste konkurrentene krever C i snitt: NTNU, OsloMet, UiA (vektet), UiS, Nord, INN og HVL. UiT krever 3,0.
  - BI krever B (3,50). NHH har ingen fast grense, men rangerer og gir egne bachelorkandidater garantert plass.
- **Vurdering:** NMBU er en mellomstor siviløkonommaster med stabil vekst. Programmet tar inn en større andel av de
  kvalifiserte enn medianen (77 % mot 53 %), og det gir lavere selektivitet. Gjennomføringen på normert tid er bedre
  enn snittet.
- **Kartet:** M-ØA er med i HH-kartet (`moa`), sammen med 12 av de 14 andre aktive programmene (NHHs internasjonale MSc
  som `nhh_msc`). Tre program mangler: USN Master i økonomi og ledelse (MASØKLED, 99 registrerte, ikke siviløkonom),
  HiMolde (22) og Kristianias nye siviløkonomprogram (ingen DBH-tall ennå).

### M-ECON – Samfunnsøkonomi og bærekraft (6 program)

| | NMBU | Kategorien |
|---|---|---|
| Registrerte 2021 → 2025 | 50 → 33 (−34 %, nr. 4) | 379 → 355 (−6 %) |
| Andel av registrerte 2025 | 9,3 % | |
| Møtt per år 2021–2025 | 26, 23, 27, 18, 11 | 179 → 198 |
| Førstevalgssøkere 2025 | 127 (andel 14,9 %) | 854 |
| Kvalifiserte 2025 | 43 av 310 søkere | |
| Tilbud/kvalifiserte 2025 | 72 % | median 79 % |
| Møtt/tilbud 2025 | 35 % | median 48 % |
| Fullført på normert tid, kull 2021–23 | 52,8 % | snitt 54,0 % |

- **Opptakskrav:** C og bachelor i samfunnsøkonomi, likt UiO (C, 80 sp) og NTNU (C, 90 sp, B-garanti). UiT krever 2,5.
- **Vurdering:** høy søkerandel, men få kvalifiserte og lav ja-svar- og oppmøteandel. Fallet i møtte er det tydeligste
  svaktegnet i NMBUs masterportefølje.
- **Kartet:** M-GEP (Global økonomi og politikk, 15 registrerte, 244 søkere) og M-EEG (Samfunnsøkonomi og miljøforvaltning,
  20 registrerte, 257 søkere) startet i 2024. Ingen av dem er i HH-kartet, og de bør vurderes inn i `mecon` eller en
  ny gruppe.

### M-EI – Entreprenørskap og innovasjon (18 program)

| | NMBU | Kategorien |
|---|---|---|
| Registrerte 2021 → 2025 | 79 → 53 (−33 %, nr. 7) | 692 → 747 (+8 %) |
| Andel av registrerte 2025 | 7,1 % | |
| Møtt per år 2021–2025 | 39, 27, 26, 23, 30 | |
| Andel møtt 2025 | 7,9 % | |
| Kandidater 2021 → 2025 | 41 → 14 | |
| Tilbud/kvalifiserte 2025 | 81 % | median 78 % |
| Møtt/tilbud 2025 | 34 % | median 34 % |
| Fullført på normert tid, kull 2021–23 | 65,5 % | snitt 65,2 % |

- **Opptakskrav:** C og alle bachelorgrader (breddemaster med motivasjonsbrev). UiO, NTNU MIIDS, NTNU MSMI og NTNU MENTRESAM
  har også C. NTNU Entreprenørskolen bruker intervju. Kristiania og Nord oppgir ikke noe snittkrav. BI krever B.
- **Vurdering:** kategorien vokser mens NMBU faller. Kandidattallet er det laveste på fem år.
- **Kartet:** fem av de ni største konkurrentene etter registrerte mangler i HH-kartet: USN MAITM (76), HVL MIL-MA (53),
  HVL MA-INN (53), INN MAINN (52) og NTNU MIIDS (48). NTNU MENTRESAM (42), NTNU MSMI (41) og UiT LEDINMA (38) mangler også.

### M-BIOEC – Bioøkonomi

- **Ingen konkurrenter.** M-BIOEC er det eneste aktive programmet i kategorien. NTNUs Circular Economy har ingen studenter
  fra 2024.
- **Størrelse:** registrerte 27 → 54 (+100 %). Møtt har vært stabil på 19–30 i året, og kandidattallet har økt
  fra 0 til 31.
- **Søkere og opptak:** 119 søkere og 51 førstevalg i 2025. Tilbud/kvalifiserte 74 %, og 83 % av dem med tilbud møtte,
  som er høyest av NMBU-programmene.
- **Gjennomføring:** 79,9 % fullførte på normert tid (kull 2021–23).
- **Opptakskrav:** relevant natur- eller samfunnsvitenskapelig bachelor. Snittkrav er ikke oppgitt, og poenggrensen
  var 3,0 (2025).
- **Mulige sammenligninger:** bioøkonomi-nære program finnes som spesialiseringer, for eksempel NHH ENE (energi,
  naturressurser og miljø, nå under MSc-strukturen) og NMBU M-EEG. Det er ikke funnet egne masterprogram.

### NMBUs øvrige økonomimastere (til orientering)

- **M-EUTV (eiendomsutvikling):** 83 registrerte, størst av de toårige eiendomsmasterne. Krever C. Deltid er lagt ned
  fra 2025.
- **M-LEDØK (erfaringsbasert):** startet i 2025 og har ingen DBH-tall ennå.
- **M-IØ og M-EIE (femårige):** regnes som perifere og er ikke med i markedstallene.

## 7. Forslag til visning på nettstedet

1. **Ny modul «Masterlandskapet» under HH (Marked og omverden)**, med data fra `programmer.json` (kopieres til
   `kilde/public/marked/master-okonomi.json` av et byggeskript).
   - **Øverst:** kategorivelger og typevelger (2-årig / erfaringsbasert / 5-årig, kjerne/alle).
   - **Boblediagram:** x = vekst i registrerte 2021–2025, y = førstevalg per møtt (søkerpress), størrelse = registrerte 2025,
     farge = privat/offentlig. NMBU uthevet.
   - **Sorterbar tabell:** institusjon, campus, type, siviløkonom, registrerte, møtt, søkere, tilbud/kvalifiserte,
     møtt/tilbud, normert gjennomføring, snittkrav (med kildelenke og dato), skolepenger og akkreditering.
     «Ikke kontrollert» vises grått.
2. **Kort «NMBU i markedet»** for hver av M-ØA, M-ECON, M-EI og M-BIOEC: andel, rang, vekst mot kategorien og en minikurve
   for møtt 2021–2025. Bruk tallene i §6.
3. **Utvid HH-gruppene i `make-hh-programkart.py`**, med merknad og `default: false`. Det vil si: M-GEP og M-EEG i (eller
   ved siden av) `mecon`; USN MAITM, HVL MIL-MA/MA-INN, INN MAINN og NTNU MIIDS/MSMI/MENTRESAM i `mei`; USN MASØKLED
   i `moa`. Fjern eller merk `ntnu_circ`.
4. **Rett MAENT-feilen (§4.1) først.** Den påvirker en eksisterende NMBU-sammenligning.
5. **Fotnote om 2026:** høstopptaket 2026 kommer i DBH 379 senere. Kjør skriptene på nytt og fjern `SKIP_YEARS`-tilsvarende
   da. Kristianias nye program får DBH-kode i 347 først for 2026 høst.

## 8. Usikkerheter

- **Søkere i DBH 379 er søknadsalternativer, ikke personer** (jf. NHH 2022–2023 i status-og-metode §44). Førstevalg er det
  beste målet på personer.
- **Erfaringsbaserte mastere har lave «møtt»-tall i 379.** Mange tas opp gjennom EVU-kanaler eller modulvis, så registrerte
  og kandidater er bedre størrelsesmål.
- **DBH 123 summerer alle studentkategorier.**
- **Akkreditering gjelder institusjon eller handelshøyskole, ikke programmet.**
- **Siviløkonom `null` betyr «ikke avklart»**, ikke «nei».
- **Kategoriseringen er gjort av oss.** Den bygger på NUS og programnavn, se `KAT_RETT` i `bygg_grunnlag.py`.

## Sammendrag

- **Omfang:** 194 masterprogram i økonomisk-administrative fag ved 18 institusjoner, med DBH 347-koder, lokalt og nasjonalt
  opptak 2021–2026 (DBH 379), registrerte, kandidater, 707-gjennomføring, campus (DBH 124), Samordna-tall for femårige,
  opptakskrav for 60 program, skolepenger for de private og akkreditering. 152 program var aktive i 2025, og de toårige
  kjerneprogrammene hadde 9 645 registrerte (+10 % siden 2021).
- **M-ØA** er en mellomstor siviløkonommaster (nr. 8 av 15, 4,6 %). Den vokser litt raskere enn markedet og har god
  gjennomføring, men lav selektivitet: 77 % av de kvalifiserte får tilbud.
- **M-ECON** har høy søkerandel, men få kvalifiserte. Møtt har falt fra 26 til 11.
- **M-EI** har falt 33 % i et voksende marked.
- **M-BIOEC** har doblet seg og er alene i kategorien.
- **Datafeil:** HH-programkartet har slått sammen Nord og OsloMet for entreprenørskapsmasteren (delt kode MAENT,
  `fill-local-admissions.py`). Dessuten er OsloMets femårige registrert som bachelor i DBH, og NTNUs Circular Economy er død.
- **Forslag:** en «Masterlandskapet»-modul med boblediagram og tabell, NMBU-kort, og utvidede HH-grupper.
