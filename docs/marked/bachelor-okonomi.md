# A1 – Bachelorlandskapet i økonomi og administrasjon og samfunnsøkonomi

Kartlagt 17.10.2026. Dette er en ren datakartlegging: ingen eksisterende kode eller datafil er endret, ingenting er bygd
eller committet. Alt ligger i `data/marked/bachelor-okonomi/`.

## 1. Hva som er hentet

| Fil | Innhold |
|---|---|
| `programmer.json` | 234 program: 131 med Samordna-opptak og 103 med lokalt opptak. Én rad per program og studiested (Samordna-studiekode), eller én rad per DBH-programkode for lokalt opptak. 221 er bachelorprogram og 13 er femårige løp. |
| `topp15.json` | De 15 programmene med flest førstevalgssøkere i 2026, med tidsserien 2021–2026 (tabell i §6). |
| `sammendrag.json` | Markedstotaler per år, delt på type og sektor: førstevalg, studieplasser, lokalt opptak, møtt og registrerte. |
| `arsstudier.json` | 54 årsstudier fra samme Samordna-utvalg. De er holdt utenfor hovedfila, men trengs for å avsløre feilkoblinger (§5). |
| `dbh_uten_opptak.json` | 30 økonomikoder i DBH 347 med studenter, men uten opptak 2021–2025: utfasede koder, kullkoder og forgjengere. |
| `kilder/` | Rå DBH-svar i `kilder/dbh/*.json.gz` (71 filer, 2,7 MB, spørringen ligger i hver fil), DBH-tabellkatalogen, `kobling_so_dbh.json` med bevis per år, `kontroll_hh.json` og `manifest.json`. |
| `skript/` | `hent_347.py`, `hent_347_alle.py`, `hent_379.py`, `hent_123_104.py`, `hent_124.py`, `kobling.py`, `bygg.py`, `kontroll_hh.py`, `sammendrag.py`, og hjelpemodulene `felles.py`, `utvalg.py` og `dbh.py`. |

**Felt per rad i `programmer.json`:**

- **Identitet:** institusjon, `institusjonKort`, `dbhInstitusjonskode`, sektor, `campus`/`campusAlle`, programnavn
  (med tidligere navn).
- **Klassifisering:**
  - `fagomraade`: økonomi og administrasjon, samfunnsøkonomi, regnskap og revisjon, finans, markedsføring og
    kommunikasjon, innovasjon og entreprenørskap, økonomi og IT, eiendom, logistikk og shipping, administrasjon og
    ledelse, økonomi og jus, reiseliv og hotell m.fl.
  - `type`: BØA, samf. eller annet.
  - `nivaa`, `studiepoeng`, `heltid`, `studieform` (stedbasert, nett eller samlingsbasert).
  - `grensetilfelle`: 38 rader.
- **Koder og kobling:**
  - `soStudiekode`;
  - `dbhProgramkoder` (DBH 347), med år og hvilke andre rader som deler koden;
  - `dbhForgjengerkoder`;
  - `dbhKobling` med metode og sikkerhet.
- **Opptak:**
  - `studieplasser` og `sokere` 2021–2026: alle, førstevalg, kvinneandel blant førstevalg, kvalifiserte og tilbud;
  - `poenggrenser` 2020–2026: ordinær kvote og førstegangsvitnemål, både hovedopptak og supplering;
  - `lokaltOpptak` (DBH 379 L) 2021–2025: alle, førstevalg, kvinneandel, kvalifiserte, tilbud, akseptert og møtt;
  - `mottDBH`.
- **Studenter:** `registrerte` (DBH 123, høst) og `kandidater` (DBH 104). Der en DBH-kode deles med andre rader,
  står tallene i `studenterDeltKode`.
- **Status:** `status` er aktiv, ny, nedlagt, under utfasing, avlyst 2026 eller «ingen opptak etter …». Feltene
  `forsteOpptakSO`/`sisteOpptakSO` og `tilbysFraDBH`/`tilbysTilDBH` viser grunnlaget.
- **Annet:**
  - `url` (fra Samordna);
  - `hh`: om programmet er med i HH-programkartet, med gruppe, entryId og default;
  - `merknader`.

**Utvalg:**

- **Samordna:** alle program med utdanningstypen «Økonomisk-administrative fag». I tillegg 34 håndplukkede program fra
  andre utdanningstyper (`EKSTRA` i `utvalg.py`), for eksempel:
  - økonomi og jus (HVL, USN);
  - IT-program som HH-kartet allerede bruker (UiO INL, NTNU Digital forretningsutvikling, USN IT og ledelse,
    UiA/USN IT og informasjonssystemer, HiØ Informasjonssystemer, UiB IMØ);
  - shipping (NTNU Ålesund, USN);
  - finans og forsikring (UiO, UiB);
  - FPØ (UiO, INN);
  - reiseliv og hotell (UiS, HVL, INN);
  - sport management (NIH, Molde);
  - NMBU Eiendom.

  Nivå hentes fra Samordnas katalog: Bachelor gir bachelor, Master/Profesjon på 300 sp gir femårig, og årsstudier går
  til egen fil.
- **Lokalt opptak:** alle bachelorkoder (B3/B4) i DBH 347 med NUS 64xxxx/634xxx eller studium «ØA» hos BI, Kristiania,
  ONH og HGUt. I tillegg 13 Kristiania- og ONH-koder med annen NUS (`DBH_EKSTRA`), for eksempel E-business,
  teknologiledelse og HR ved ONH. Offentlige økonomikoder med lokalt opptak og uten Samordna-kode er også med (HVL
  Bachelor i ledelse, nett).
- **Utelatt:**
  - uspesifiserte koder: BI «DIP», Nord «Selvvalgt bachelor», INN «B3FRI»;
  - de femårige sivilingeniørløpene i industriell økonomi (NMBU, NTNU, UiA, UiS). De er tekniske studier, men
    konkurrerer om de samme søkerne øverst.

## 2. Metode: koblingen mellom Samordna og DBH bygger på tall, ikke navn

Navnekobling mellom Samordna-studiekode og DBH-programkode er det svakeste leddet i dagens data (se status-og-metode §7).
Her er koblingen gjort med tall i stedet:

1. **Eksakt treff:** DBH 379 med opptakstype N (Samordna) og prioritet 1 skal ha samme antall førstevalgssøkere som
   Samordna, for samme institusjon og år. Avviket kan være høyst max(2; 3 %). «Alle søkere» brukes som kontroll, og det
   kreves minst ett felles navneord.
2. **Delte koder:** der én DBH-kode samler flere studiesteder, prøves summer av 2–6 Samordna-program. Summen må være
   nærmest mulig DBH-tallet. Eksempler:
   - USN OKLED = fem campuser;
   - NTNU BØA 2021–2024 = Trondheim + Gjøvik + Ålesund;
   - Nord BAØKLED = Bodø + Steinkjer;
   - Nord BAHRM = Bodø + Levanger + Mo i Rana;
   - UiA BACØKAD = ØA + siviløkonom;
   - UiS B-DIGSERV = to studiekoder;
   - USN ITIS.
3. **Én manuell kobling:** Volda 223452 ↔ OFFBV. Navnene er ulike, men førstevalget er likt alle fem årene.

**Resultat:**

- 127 av 131 Samordna-program er koblet alle år med søkere 2021–2025.
- 1 er «sannsynlig»: USN siviløkonom mangler 2022.
- 3 er «ikke funnet». De er nye i 2026 og har derfor ingen DBH-tall: UiO Økonomi og finans, UiO Tysk og økonomi og
  Nord Økonomi og teknologiledelse.

Bevisene per år ligger i `kilder/kobling_so_dbh.json`.

**Studenter på delte koder:** registrerte fordeles på studiested med DBH 124 (registrerte per campus) der koden har
flere campus. Der det ikke går, blir året null, og hele kodens tall står i `studenterDeltKode`. Det gjelder for
eksempel UiA, der ØA og siviløkonom har samme kode og samme campus. Kandidater (DBH 104) har ikke campus og står bare på
koden.

**Forgjengerkoder:** koder uten opptak, men med studenter, kobles til et program når navnet er likt, eller via campus.
Eksempler er NTNU ØABACHELOR og ØA369 og UiT B-ØKADM-A. Disse koblingene er merket «usikker».

## 3. Kilder (URL og dato)

| Kilde | URL | Dato |
|---|---|---|
| Samordna søkertall, programnivå 2021–2026 (grunndata tabell 2) | https://sokertallrapport.samordnaopptak.no | Gjenbrukt cache `data/hh/kilder/so_sokertall_programnivaa_2021-2026_hentet_2026-09-22.json` (22.09.2026) |
| Samordna poenggrenser 2020–2026 (Tableau-CSV) | https://rapport-dv.educloud.no | Gjenbrukt cache `data/hh/kilder/so_poenggrenser_2020-2026_hentet_2026-09-22.csv` (22.09.2026) |
| Samordnas programkatalog 2016–2026: programtype, sp, heltid/nett, studiested, URL, avlyst | https://sok.samordnaopptak.no/api/v1/search | Gjenbrukt cache `data/nmbu/kilder/samordna-katalog/` (26.09.2026) |
| DBH 347 studieprogram, 379 søkertall/møtte, 123 registrerte, 104 kandidater, 124 registrerte per campus | https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData | Hentet 17.10.2026, ett kall om gangen med pause |
| DBH tabellkatalog | https://dbh.hkdir.no/api/Tabeller/bulk-csv?rptNr=001 og rptNr=002 | 17.10.2026 |
| HH-programkartet (kontrollert, ikke endret) | `data/hh/programkart.json`, `data/hh/dbh-programkart.json` | – |

## 4. Dekning: hva som mangler

- **Lokalt opptak 2026:** DBH 379 har bare våren 2026. BI, Kristiania og ONH har derfor ingen 2026-tall, og
  topplista dekker bare Samordna. Kjør `hent_379.py` på nytt etter at høsten er rapportert, med `SKIP`-logikk som i
  `fill-local-admissions.py`.
- **Studieplasser og poenggrenser for private:** ikke funnet. DBH 370 rapporterer ikke studieplasser for lokale opptak,
  og BI og Kristiania tar inn alle kvalifiserte (tilbudsandel ≈ 100 %). Snittpoeng (DBH 571 L) er ikke hentet her, se §11
  og §23 i status-og-metode.
- **Kristianias nettprogram:** BAL, NAL, BOA, NOA, BHR, NHR, BOH og NOH har ingen rader i DBH 379. Opptak er ikke
  funnet, men registrerte finnes, for eksempel 448 på ØA-nett i 2025. Status er «aktiv (opptak ikke rapportert i DBH
  379)».
- **BI per campus:** BI har én DBH-kode for alle campuser. Opptak gjelder hele BI, mens campusfordelingen gjelder bare
  registrerte (DBH 124). Eksempel for DIPØAH i 2025: Oslo 1 279, Bergen 1 222, Trondheim 823, Stavanger 258 og nett 396.
- **Kandidater på delte koder:** kandidater kan ikke fordeles på campus. Det gjelder USN ØL (fem campuser), Nord ØA,
  NTNU BØA 2021–2024 og UiA ØA/siviløkonom.
- **Registrerte på UiA ØA og UiA siviløkonom:** null per program, fordi de deler koden BACØKAD på samme campus. Hele
  kodens tall står i `studenterDeltKode`.
- **URL:** mangler for program med lokalt opptak. Samordna-programmene har URL fra katalogen.
- **Samordna-dataene:** er fra 22.09.2026. De er endelige for hovedopptaket 2026, men ikke hentet på nytt i dag.
- **DBH 2026 (høst):** 123, 104 og 124 er ikke rapportert ennå.
- **Grensetilfeller:** 38 rader er merket `grensetilfelle: true`: IT, FPØ, reiseliv og hotell, sport management, PR og
  journalistikk, innovasjon/prosjektledelse ved HiØ og politikk/juss ved Molde. De bør filtreres bort som standard.

## 5. Datafeil i eksisterende data

Alt er funnet automatisk av `skript/kontroll_hh.py` (`kilder/kontroll_hh.json`) og kontrollert mot de bygde
HH-filene. Ingenting er rettet.

**HH-programkartet (`make-hh-programkart.py` → `data/hh/programkart.json`/`dbh-programkart.json`):**

1. **Tre USN-campuser peker på årsstudier.** `usn_honefoss_oa` (222097), `usn_bo_oa` (222164) og
   `usn_kongsberg_oa` (222625) er merket «Økonomi og ledelse (bachelor)». I Samordna er alle tre «Økonomi og
   administrasjon, <sted>», som er årsstudier på 60 sp. De riktige bachelorkodene er:
   - Hønefoss 222414 (70 førstevalg i 2026);
   - Bø 222470 (78);
   - Kongsberg 222404 (74).

   Vestfold 222369 (217 førstevalg) mangler helt. DBH-kodene i kartet (ØKLEDR, BACHØKADK) er gamle koder uten opptak
   etter 2021. Alle fem campusene har gått på OKLED siden 2021.
2. **`hvl_dol` (203218, Digital økonomi og ledelse) er et årsstudium,** ikke en bachelor.
3. **Feil DBH-kode for UiT Alta.** `uit_alta_oa` peker på B-ØKADM-A, som ikke har hatt opptak 2021–2025 og bare
   hadde 3 registrerte i 2025. Søkerne og studentene til 186468 ligger på B-ØKADMN: 776 registrerte og 95 kandidater
   i 2025. HH viser 3 registrerte.
4. **Narvik-koden ligger i UiT Tromsø.** `uit_oa` har B-ØA i tillegg til B-ØKADM, men B-ØA er Narviks kode (186410,
   nedlagt 2023).
5. **UiA siviløkonom har feil kode.** `uia_siv` peker på MASTØKAD5, som er tom (0–4 registrerte). Siviløkonomsøkerne
   ligger på BACØKAD sammen med `uia_oa`. Derfor har `uia_oa` også siviløkonomstudentene (694 registrerte i 2025),
   mens `uia_siv` står med null.
6. **NTNU Trondheim, Gjøvik og Ålesund er blandet.** `ntnu_oa` (Trondheim) bruker BØA, som 2021–2024 hadde søkerne fra
   alle tre campusene. HH viser 899–928 registrerte for Trondheim, mens DBH 124 gir 453 i 2025. Ålesund og Gjøvik
   (`ntnu_alesund_oa`, `ntnu_gjovik_oa`) har bare gamle koder og nye koder fra 2025.

   Samordna-kodene i HH-kartet (194515 og 194591) er dessuten nye fra 2025. Tidsseriene 2021–2024 ligger på 194414
   (Ålesund) og 194369 (Gjøvik), og HH-seriene starter derfor 2025. `ntnu_gjovik_oa` heter «Økonomi, ledelse og
   bærekraft» og har BØKLED, men det er det gamle programmet (sluttdato 2022). Samordna-navnet nå er «Økonomi og
   ledelse».
7. **Bodø og Steinkjer telles dobbelt.** `nord_oa` og `nord_steinkjer_oa` viser begge hele BAØKLED (345 registrerte og
   55 kandidater i 2025). DBH 124 gir Bodø 215 og Steinkjer 130.
8. **Drammen har hele USN.** `usn_oa` (Drammen) viser alle fem campusene (1 172 registrerte i 2025). DBH 124 gir
   Drammen 287.
9. **NHH og NTNU har ekstra koder uten opptak** (BACHELOR, ØABACHELOR, ØA369). Det er greit for studenttall, men de må
   ikke brukes til opptak.

**Avvik i DBH (kilden):**

- **Kristiania bytter kode for Oslo/Bergen enkelte år.** BAP (HR og personalledelse, Oslo) mangler i DBH 379 for 2024,
  mens BAP-B (Bergen) har 657 søkere og 147 møtt det året. Ellers har BAP-B 138–199 søkere og 36–44 møtt. BAS (digital
  markedsføring og salgsledelse, Oslo) mangler for 2025, mens BAS-B har 712 søkere og 176 møtt. Ellers har BAS-B
  165–341 søkere. Det er sannsynlig at Kristiania har rapportert Oslo og Bergen samlet på Bergen-koden disse årene.
  Registrerte (DBH 123/124) er normale for begge kodene.
- **UiT Harstad bruker koden ØKBA.** Førstevalg stemmer, men «alle søkere» i DBH er høyere enn hos Samordna. Det tyder
  på at koden også dekker andre søknadsalternativer.

## 6. De 15 største programmene etter førstevalgssøkere i 2026

Utvalget er Samordna-program, inkludert femårige og grensetilfeller. Lokalt opptak har ikke 2026-tall.

| # | Institusjon | Studiested | Program (studiekode) | Nivå | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 | Endring 2021–26 | Plasser 2026 | Poenggrense ord. 2026 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | NHH | Bergen | Økonomi og administrasjon – siviløkonom (191345) | femårig | 2 179 | 2 053 | 2 157 | 1 698 | 1 823 | 1 899 | −280 | 425 | 59,9 |
| 2 | OsloMet | Oslo | Økonomi og administrasjon (215369) | bachelor | 996 | 873 | 934 | 982 | 1 056 | 1 205 | +209 | 280 | 52,8 |
| 3 | NTNU | Trondheim | Økonomi og administrasjon (194035) | bachelor | 1 110 | 873 | 999 | 1 059 | 1 149 | 1 161 | +51 | 181 | 58,2 |
| 4 | HVL | Bergen | Økonomi og administrasjon, Bergen (203369) | bachelor | 622 | 580 | 632 | 738 | 752 | 789 | +167 | 114 | 55,8 |
| 5 | UiS | Stavanger | Økonomi og administrasjon (217369) | bachelor | 564 | 553 | 587 | 483 | 546 | 674 | +110 | 140 | 48,0 |
| 6 | OsloMet | Oslo | Administrasjon og ledelse i offentlig virksomhet (215138) | bachelor | 662 | 529 | 628 | 667 | 604 | 615 | −47 | 150 | 50,8 |
| 7 | NTNU | Ålesund | Shipping management (194470) | bachelor | 290 | 301 | 381 | 337 | 463 | 598 | +308 | 65 | 53,9 |
| 8 | UiO | Oslo | Økonomi og finans (185369) | bachelor | – | – | – | – | – | 582 | ny 2026 | 30 | 63,4 |
| 9 | NTNU | Gjøvik | Økonomi og ledelse, deltid, bachelor (194404) | bachelor | 602 | 394 | 478 | 578 | 549 | 533 | −69 | 135 | 56,1 |
| 10 | NHH | Bergen | Business, economics and data science – siviløkonom (191340) | femårig | – | – | – | 1 083 | 498 | 518 | ny 2024 | 75 | 63,8 |
| 11 | UiA | Kristiansand | Økonomi og administrasjon (201369) | bachelor | 443 | 369 | 431 | 485 | 501 | 507 | +64 | 150 | 50,9 |
| 12 | UiT | Alta (nett) | Økonomi og administrasjon, Alta (186468) | bachelor | 605 | 483 | 650 | 809 | 538 | 469 | −136 | 350 | 45,8 |
| 13 | NTNU | Trondheim | Økonomi og administrasjon, siviløkonom (194345) | femårig | – | 450 | 439 | 496 | 492 | 416 | ny 2022 | 105 | 60,5 |
| 14 | INN | Rena (nett) | Regnskap og økonomirådgivning, deltid (209404) | bachelor | – | 345 | 406 | 516 | 370 | 369 | ny 2022 | 100 | 52,7 |
| 15 | INN | Rena (nett) | Økonomi og administrasjon, deltid (209515) | bachelor | – | 492 | 423 | 451 | 364 | 369 | ny 2022 | 115 | 53,1 |

NMBU B-ØA er nr. 19 med 296 førstevalg i 2026, opp fra 175 i 2021. NHHs nedgang i 2024 sammenfaller med at BEDS startet;
de to NHH-kodene hadde til sammen 2 781 førstevalg i 2024 og 2 417 i 2026.

**Største program med lokalt opptak.** Tallene er førstevalg i DBH 379 L. De kan ikke sammenlignes direkte med
Samordna, fordi de fleste lokale søkere har bare ett alternativ.

| Institusjon | Program (DBH-kode) | 2021 | 2022 | 2023 | 2024 | 2025 | Møtt 2025 |
|---|---|---|---|---|---|---|---|
| BI | Økonomi og administrasjon (DIPØAH, alle campuser) | 2 241 | 2 087 | 2 179 | 2 528 | 3 139 | 1 866 |
| BI | Eiendomsmegling, jus og økonomi (DIPEMH) | 1 078 | 1 549 | 1 580 | 1 519 | 1 794 | 754 |
| BI | Organisasjonspsykologi, HR og ledelse (DIPHRH) | 1 120 | 1 249 | 1 145 | 1 284 | 1 361 | 639 |
| BI | Finans (DIPBFH) | 527 | 680 | 595 | 819 | 861 | 495 |
| BI | Bachelor of Business Administration (DIPBBH) | 454 | 517 | 481 | 543 | 681 | 237 |
| BI | Markedsføringsledelse (DIPMIH) | 809 | 654 | 744 | 778 | 677 | 371 |
| ONH | Økonomi og administrasjon (BØKAD_N, nett) | – | – | – | 478 | 535 | 150 |

**Markedet samlet:**

- Førstevalg til BØA-bachelorer i Samordna økte fra 7 365 i 2021 til 8 594 i 2026, mens studieplassene lå stabilt på
  rundt 3 050.
- De femårige BØA-løpene (NHH, siviløkonom) økte fra 2 494 til 3 438.
- BIs BØA-type program hadde 4 597 søkere og 2 302 møtt i 2025.

Kilde for tallene: `sammendrag.json`.

## 7. Forslag til visning på nettstedet

**Modul «Markedet» (ny, under HH eller felles), med fem faner:**

1. **Kart og tabell.** Alle aktive program fra `programmer.json` med filtre:
   - type (BØA/samf./annet);
   - fagområde;
   - sektor;
   - studieform (stedbasert/nett/deltid);
   - nivå;
   - grensetilfeller av/på.

   Kolonner: førstevalg 2026 og endring fra 2021, plasser, poenggrense, registrerte. Program med lokalt opptak vises med
   2025-tall og merkelappen «Lokalt opptak (DBH 379)», slik dagens opptaksvisning gjør.
2. **Topp 15 og utvikling.** Liten linjegraf per program (MiniTrend fra `Matrise.tsx`) og topplisten fra `topp15.json`.
3. **Markedsandeler.** Stablet søyle per år, BØA-førstevalg per institusjon, fra `sammendrag.json` og
   `bøaForstevalg2026PerInstitusjon`. Søylene merkes Samordna og lokalt hver for seg, fordi målene ikke er like.
4. **Nye og nedlagte.** Liste etter `status`, `forsteOpptakSO` og `tilbysTilDBH`. Siden 2022 har det kommet 26 nye
   Samordna-program, og 20 er nedlagt.
5. **HH-dekning.** Program av BØA-typen som ikke er i HH-kartet, for eksempel BI SØ og DIPBBH, ONH BØKAD_N, INN
   ØA nett/deltid, NTNU Gjøvik deltid, NHH BEDS og USN Vestfold. Lista viser hvor sammenligningen bør utvides.

**Filformat:** `programmer.json` er for stor til bunten (650 kB). Foreslått løsning:

- Et nytt skript `scripts/build-marked.py` leser `data/marked/bachelor-okonomi/programmer.json` og skriver en slank
  `kilde/public/marked/bachelor.json`, som lastes med `fetch`. Den slanke fila har bare de feltene visningen trenger, uten
  `merknader` og bevis, og blir anslagsvis 150 kB.
- Det samme skriptet skriver KI-linjer (`MARKEDET …`) til `build-ki-grunnlag.py`.

**Skript som må lages eller endres:**

1. **`scripts/fetch-marked-dbh.py`:** flytt `skript/hent_*.py` hit og cache i `data/marked/kilder/`. Den mappa bør
   gitignores som de andre `kilder`-mappene. I dag er `data/marked/` ikke ignorert.
2. **`scripts/build-marked.py`:** `kobling.py` + `bygg.py` + `sammendrag.py`, med `--refresh`.
3. **`scripts/check-hh-programkart.py`:** `kontroll_hh.py`. Kjøres i `build-faculty.sh hh` og stopper ved
   årsstudium-/kodefeil.
4. **Retting av HH-kartet (§5):** egen PR i `make-hh-programkart.py`, deretter `fill-local-admissions.py hh`,
   `build-faculty.sh hh`, `build-completion.py hh` og `build-students.py hh`.
5. **`build-completion.py`/`build-students.py`:** bruk DBH 124 for campusfordeling når en kode deles mellom
   oppføringer (Nord, USN, NTNU 2021–2024). Merk kandidater som «hele koden».
6. **Etter høstrapporteringen i DBH:** fjern 2026 fra `SKIP` og kjør 379, 123 og 124 på nytt.

## 8. Sammendrag

Jeg har kartlagt 234 bachelor- og femårige program i økonomi og administrasjon, samfunnsøkonomi og tilgrensende
handelshøyskolefag. 131 har Samordna-opptak og 103 lokalt opptak (BI, Kristiania, ONH, HGUt og HVL). Det gir 159
aktive program. Dataene ligger i `data/marked/bachelor-okonomi/programmer.json`.

**Innhold per program:**

- studieplasser og søkere 2021–2026, og poenggrenser 2020–2026 (Samordna);
- lokalt opptak 2021–2025 (DBH 379);
- registrerte og kandidater (DBH 123/104) og campusfordeling (DBH 124);
- status (ny/nedlagt);
- om programmet er med i HH-programkartet.

**Koblingen Samordna–DBH:** den er gjort med tall, ikke navn. DBHs førstevalgssøkere ved Samordna-opptak må være lik
Samordnas, eventuelt som sum over studiesteder. 127 av 131 er koblet alle år. De tre som mangler, er nye i 2026.

**Datafeil i HH-programkartet:**

- Tre USN-campuser og HVL Digital økonomi og ledelse er årsstudier merket som bachelor.
- UiT Alta har feil DBH-kode: 3 registrerte i stedet for 776.
- UiA siviløkonom står tom, mens ØA-raden har siviløkonomstudentene.
- NTNU Trondheim, Nord Bodø og USN Drammen har studenter fra andre campuser, og Nord Bodø og Steinkjer telles dobbelt.
- NTNU Gjøvik og Ålesund har nye Samordna-koder, så tidsseriene starter 2025.

I DBH ser Kristiania ut til å ha rapportert Oslo og Bergen samlet på Bergen-koden for BAP i 2024 og BAS i 2025.

**Største program etter førstevalg i 2026:** NHH (1 899), OsloMet ØA (1 205) og NTNU ØA (1 161). UiO Økonomi og
finans fikk 582 førstevalg på 30 plasser i sitt første år. BIs ØA-bachelor hadde 3 139 lokale førstevalgssøkere i 2025.

**Mangler:**

- lokalt opptak 2026;
- studieplasser og poenggrenser for private;
- opptak for Kristianias nettprogram.

**Forslag til visning:** en markedsmodul med filtrerbar tabell, topp 15, markedsandeler, nye og nedlagte program og
HH-dekning, bygd med `scripts/build-marked.py` til `kilde/public/marked/bachelor.json`.
