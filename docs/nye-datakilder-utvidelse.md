# Nye datakilder for å utvide NMBU-sammenligningen

Arbeidsnotat 24.09.2026 (Opus 5.5). Notatet dekker kilder som **ikke** brukes i dag og som ikke er kartlagt i
`docs/bi-kristiania-datakilder.md` eller `docs/bi-kristiania-alternative-kilder.md` (Brønnøysund, statsbudsjettet, Cristin
på institusjonsnivå, Kandidatundersøkelsen for BI, underviserundersøkelsen, eInnsyn, Doffin, Meta/Google-annonser er
omtalt der og gjentas ikke).

**[V]** betyr at kilden er hentet og kontrollert med curl eller WebFetch i denne økten. **[A]** betyr at kilden er antatt,
eller at bare deler av den er kontrollert. Prøveuttrekkene ligger i `data/nmbu/kilder/nye-kilder/` (fillisten står i §6).
Store råfiler (Forskningsrådet 54 MB, CORDIS 37 MB, Erasmus+ 72 MB) er lastet ned til en midlertidig mappe. Bare
aggregerte utdrag er lagret i repoet.

## 1. Sammendrag: de ti mest verdifulle kildene

1. **Samordnas åpne søke-API i søkerportalen** (`POST https://sok.samordnaopptak.no/api/v1/search`). Dette er det
   samme API-et som den offentlige studietabellen bruker, og det krever ingen innlogging. Det gir alle opptak fra 2015 til
   2026 (id 1–19), med disse feltene per studieprogram og år:
   - planlagte studieplasser, studiested og kommune
   - om programmet er nytt eller avlyst
   - poenggrenser per kvote (ORD/ORDF) for de seks siste årene
   - opptaksrundene og datoene
   - to flagg for ledige plasser

   **Flagget `offerVacanciesSinceLast` viser hvilke program som var på lista over ledige studieplasser i 2026.**
   670 av 1 395 program har flagget, og 664 av disse hadde poenggrensen «alle kvalifiserte». 20 av NMBUs 38 program er
   på lista (blant annet Biologi, Kjemi, Datavitenskap, Geomatikk og Dyrepleie). B-ØA, Samfunnsøkonomi, Økonomi, ledelse
   og IT og Eiendom er ikke med.

   Studieplassene gir en serie fra 2016 som vi mangler i dag. NMBU B-ØA hadde 100 plasser i 2016–2018, 80 i 2019,
   95–96 i 2020–2021, 60 i 2022, 75 i 2023 og 95 i 2024–2026. **[V]**
2. **DBH tabell 905 (eksamensdata)** er åpen, men brukes ikke i dag. Den gir oppmeldte, møtte, beståtte og strøkne
   kandidater per emne og program. Da kan vi vise hvor mange som ikke møter til eksamen, og stryk målt mot de oppmeldte.
   - **NMBU hadde lavest oppmøte og høyest stryk i utvalget i 2025:** 86,3 % møtte, og 10,1 % av de møtte strøk.
     Tallene for de andre var UiO 88,9 % og 5,6 %, UiB 87,8 % og 6,9 %, UiA 91,9 % og 7,2 %, og Kristiania 94,3 % og 6,9 %.
   - Eksempel: BUS134-B i 2024 hadde 966 oppmeldte, 728 møtte og 311 som strøk.
   - **BI rapporterer oppmeldt = møtt,** så oppmøtet kan ikke sammenlignes for BI. **[V]**
3. **NMBU kan få eksakte DBH-tall for egne data.** DBHs API-dokumentasjon (03.12.2025) sier at institusjonene kan hente
   ikke-skjermede tall for seg selv med en Feide-token (JWT, gyldig i 5 min.). Kontakt: dbh@hkdir.no. Det fjerner
   skjermingsproblemet (1–2 → 0) for alle NMBU-tallene i 308, 379, 571, 60 og 707, men ikke for konkurrentene. **[V]**
   (dokumentasjonen, ikke selve tilgangen)
4. **FS-rapporten FS192.002 «Fordeling – fylke, alder, kjønn»** gir søkere (eller søknadsalternativer) per studieprogram,
   etter hjemfylke (fra hjemstedskommunen), alder eller kjønn. Den kan velge ut alle søkere, dem med tilbud, dem som takket
   ja, eller dem som møtte, og den kan kjøres fra historikken. **Dette er den enkleste måten å få «hvor kommer
   studentene fra» for NMBU-programmene.** Rapporten gir aggregerte tall, ikke personer, og løser dermed problemet med de
   tomme adressefeltene i H26-uttrekket. **[V]** (FS-dokumentasjonen)
5. **SSB 14378: månedslønn etter fagfelt (247 grupper), utdanningsnivå og år etter fullført utdanning.** Tallene gjelder
   heltid i 2025, målt 0–2 år etter fullført utdanning:
   | Utdanning | Median månedslønn |
   |---|---|
   | Økonomisk-administrative fag, master | 58 330 kr (10 452 arbeidsforhold) |
   | Økonomisk-administrative fag, bachelor | 48 330 kr |
   | Samfunnsøkonomi, master | 53 330 kr |
   | Veterinær | 53 950 kr |
   | IKT, master | 57 660 kr |

   Etter 3–4 år var medianen 68 920 kr for master i økonomisk-administrative fag. Kilden gir et nytt kort om lønn etter
   utdanning per fakultet. **[V]**
6. **utdanning.no-API-et** (`https://api.utdanning.no`, åpen OpenAPI med 117 endepunkt, ingen nøkkel) gir arbeidsledighet,
   yrkesfordeling (STYRK08) og lønn per utdanningstype. Siviløkonomutdanning, november 2024:
   - 0,8 % ledige og 31 015 arbeidstakere
   - de vanligste yrkene er revisor eller regnskapsrådgiver (2 483), saksbehandler (2 353), økonomisjef (1 757) og
     finansanalytiker (1 481)

   **[V]**
7. **Forskningsrådets åpne søknadsdata** (GitHub, NLOD 2.0, oppdateres kvartalsvis). Datasettet har alle søknader siden
   2004, også avslagene, med søkt og tildelt beløp, fag og organisasjonsnummer. Da kan vi regne ut en **suksessrate per
   institusjon.** For søknadsåret 2024:
   | Institusjon | Søknader | Innvilget | Suksessrate | Tildelt |
   |---|---|---|---|---|
   | NMBU | 85 | 37 | 43,5 % | 238 mill. kr |
   | BI | 20 | 7 | 35 % | 25 mill. kr |
   | NTNU | 286 | 91 | 31,8 % | – |
   | UiO | 272 | 95 | 34,9 % | – |
   | OsloMet | 66 | 14 | 21,2 % | – |

   **[V]** (søknadstallene virker lave for de store; se §3)
8. **NVA-API-et (Sikt)** kan filtreres på fakultet, for eksempel Handelshøyskolen NMBU = 192.11.0.0. HH hadde 534
   registreringer i 2025:
   - 96 masteroppgaver
   - 72 vitenskapelige artikler
   - 79 medieoppslag (kronikker og intervjuer)
   - 284 med NFR-finansiering
   - samarbeid med SSB (38), Frischsenteret (33), OsloMet (26) og UiS (24)

   Det gir en profil for forskning og formidling per fakultet som DBH 373/374 ikke har. **[V]**
9. **CORDIS Horizon Europe (bulk-CSV fra EU)** gir EU-prosjekter per norsk institusjon (per 06.08.2026):
   | Institusjon | Prosjekter | Som koordinator | EU-bidrag |
   |---|---|---|---|
   | NMBU | 47 | 19 | 21,9 mill. euro |
   | NHH | 8 | 6 | 3,4 mill. euro |
   | BI | 6 | 4 | 5,1 mill. euro |
   | UiO | 289 | 145 | 189,8 mill. euro |

   **[V]**
10. **SSB-tabeller for søkergrunnlaget og nasjonale referanser:**
    - **11964 (direkte overgang fra videregående til høyere utdanning per fylke):** Akershus 30,4 % mot 35,7 % i hele
      landet i 2025. Akershus er det viktigste rekrutteringsfylket til Ås, og der er andelen lav.
    - **14957 og 14958 (gjennomføring per studium, hele landet):** 68,7 % av dem som begynte på siviløkonom- eller
      masterutdanning, fullførte innen fem år (kull 2018–2025). Tallet kan brukes som nasjonal referanse i
      gjennomføringskortet.

    **[V]**

Utenfor topp ti, men verdt å vite:
- **microdata.no** (SSB og Sikt) gir registerdata om utdanning, bosted og lønn. NMBU må be om tilgang som institusjon.
  Det er den eneste realistiske veien til en registerbasert kandidatundersøkelse per program og lærested, også for
  konkurrentene.
- **NAVs stillings-API** gir fasetter for yrke, utdanningskrav, fylke og sektor for aktive annonser.
- **Erasmus+-rådata** gir mobilitet per sendende og mottakende organisasjon, men datakvaliteten er svak.

## 2. Kildetabell

Kolonnen «Nivå» sier om kilden gir tall per program (P), institusjon (I), fakultet (Fak), fylke (F) eller bare for hele
landet (L).

| Kilde | Hva den gir | Nivå | Format og tilgang | V/A | Verdi | Innsats |
|---|---|---|---|---|---|---|
| Samordna søke-API (`sok.samordnaopptak.no/api/v1/search`) | Studieplasser 2015–2026, nye og avlyste program, poenggrenser per kvote (6 år), ledigflagg for inneværende år, opptaksdatoer, kategorier, skolepenger ja/nei | P, I, F (kommune) | JSON via POST med Elasticsearch-lignende filter (`admission.id`, `institution.id`, `offerVacancies`), maks ~2 000 treff per kall, ingen nøkkel. Udokumentert. | [V] | **Høy** | Lav |
| Samordna, ledige plasser (liste) | Hvilke program som hadde ledige plasser etter hovedopptaket. Lista publiseres 19.7. og fjernes når plassene er fylt. | P | Samme API. `offerVacancies` er 0 i dag, `offerVacanciesSinceLast` er satt for 2026. Arkiverte år mister flagget. Wayback fanger det ikke (JS og POST). | [V] | Høy | Lav, men må hentes årlig i juli–september |
| DBH 905 Eksamensdata | Oppmeldte, møtte, bestått, strøk, gjentak, eksamensproduksjon per emne og program | P, I, emne | Åpent DBH-API (`groupBy`, tellevariablene kan ikke stå i `groupBy`) | [V] | **Høy** | Lav: samme kjede som 308 |
| DBH 906 Eksamensdata detaljert | Som 905, pluss kjønn, finansiering, studentkategori og ny produksjon | P, I | Åpent API (GDPR-merket, skjermet) | [A] (katalogen er sjekket) | Middels | Lav |
| DBH 118 Fullførte studieprogrammer | Fullførte per program og kjønn, med NUS og undervisningsspråk | P | Åpent API | [A] (katalogen er sjekket) | Lav–middels (overlapper 104) | Lav |
| DBH 433 Fellesgrader / 62 Utvekslingsavtaler | Samarbeidsinstitusjon og land per program, avtaletyper | P | Åpent API | [A] (katalogen er sjekket) | Lav–middels | Lav |
| DBH 977 Studentsamskipnadene | Regnskap per samskipnad (SiÅs mot SiO og andre) | Samskipnad | Åpent API (bulk) | [A] (katalogen er sjekket) | Lav–middels (boligkortet) | Middels |
| DBH med institusjonstoken | Eksakte tall uten skjerming for NMBU | P, emne (bare NMBU) | Feide-JWT, avtales med dbh@hkdir.no | [V] (dokumentasjonen) | **Høy** (for NMBU) | Lav–middels |
| DBH spesialbestilling | Tabeller som ikke finnes i API-et, f.eks. hjemfylke per program for alle institusjoner | P, F | «Spesialbestilling ved henvendelse», dbh@hkdir.no. Pris og behandlingstid er ikke publisert. | [A] | Høy | Ukjent |
| SSB 14378 Utdanningsfordelt lønn | Median, kvartiler og gjennomsnitt per fagfelt (247), nivå, år etter utdanning og heltid/deltid, 2015–2025 | L (fagfelt) | PxWeb API v2, JSON-stat2, CC BY 4.0 | [V] | **Høy** | Lav |
| SSB 11420 / 11418 | Lønn etter utdanning og sektor eller næring / yrke | L | PxWeb | [A] (søketreff) | Middels | Lav |
| SSB 11964 Overganger | Direkte overgang fra videregående til høyere utdanning, antall og %, per fylke 2015–2025 | F | PxWeb | [V] | Middels–høy (søkergrunnlaget) | Lav |
| SSB 14957 / 14958 / 14955 / 14960 | Gjennomføring for bachelor, femårig master, toårig master og 8-årsløp, per studium (nasjonalt) | L | PxWeb | [V] (14957/14958/14960) | Middels (referanse) | Lav |
| SSB 14850 Fullførte utdanninger | Fullførte etter studium (217 kategorier) og kjønn | L | PxWeb | [V] (metadata) | Lav–middels | Lav |
| SSB 04478 | Studenter etter bostedsfylke og foreldrenes utdanning, i Norge og i utlandet, 1999–2025 | F | PxWeb | [V] (metadata) | Middels | Lav |
| SSB 11615 | Sysselsatte etter fagfelt og nivå per kommune (bosted og arbeidssted), 2000–2025 | Kommune | PxWeb | [V] (metadata) | Middels (arbeidsmarked for økonomer i regionen) | Lav |
| SSB 08585 / 09168 | Studenter per lærested og kjønn eller nivå | I | PxWeb | [V] (metadata) | Lav (DBH 123 dekker) | – |
| SSB statistikk på oppdrag | Skreddersydde krysstabeller fra registrene | Alt | Bestilling. Timepris 829–2 321 kr eks. mva. ut 2026 | [V] (prisene) | Høy | Middels–høy (kostnad) |
| microdata.no | Registerdata: NUDB (NUS, utfall, karakterer), befolkning, lønn. Analyse i nettleseren med utdatakontroll. | Individ → aggregat | Institusjonen ber om tilgang og melder inn brukere. Prismodell finnes på nettstedet. | [V] (tilgangsvilkår); [A] (variabler for lærested og program) | **Høy** | Middels |
| utdanning.no API | Ledighet, yrker (STYRK) og lønn per utdanningstype, studievelgeren (SO-program med plasser og poeng), arbeidsmarkedskart | Utdanningstype, P | JSON, åpen OpenAPI. «Ikke versjonert, kan endres uten forvarsel.» | [V] | Høy | Lav |
| NAV arbeidsplassen søk | Aktive annonser med fasetter: yrke (nivå 1–2), utdanningskrav, fylke, sektor | F | JSON, ingen nøkkel. Bare øyeblikksbilde. | [V] | Middels | Lav (må hentes jevnlig) |
| Forskningsrådet, søknader | Alle søknader 2004–2025: søkt og tildelt beløp, fase, fag, fylke, prosjektleder | I (orgnr/kortnavn) | CSV på GitHub (54 MB), NLOD 2.0, kvartalsvis | [V] | **Høy** | Lav |
| Forskningsrådet, EU-bevilgninger | Norske EU-bevilgninger (datasettet `bevilgningereu`) | I | CSV på GitHub | [A] (mappen finnes) | Middels | Lav |
| NVA-API (Sikt) | Registreringer per fakultet/enhet: type (artikkel, master, medie), finansiering, samarbeidspartnere, NVI | Fak, I | JSON, ingen nøkkel, `unit=192.11.0.0` | [V] | **Høy** | Lav |
| OpenAlex | Publikasjoner og siteringer per institusjon og fagfelt, internasjonalt sammenlignbart | I | JSON. Svaret viser `cost_usd`, altså bruksbasert prising/nøkkel. | [V] (ett kall) | Middels | Lav |
| CORDIS Horizon Europe | Prosjekter, rolle (koordinator) og EU-bidrag per deltaker | I | ZIP/CSV (37 MB), `organization.csv`, match på vatNumber (NO+orgnr+MVA) | [V] | Middels–høy | Lav |
| Erasmus+ Mobility Raw Data | KA1-mobilitet 2014–2023: sender, mottaker, fagfelt, profil, antall | I | XLSX per år (72 MB for 2022), data.europa.eu | [V] | Lav–middels (ufullstendige HE-tall, navnevarianter) | Middels |
| HK-dir søkertallsrapporter (hkdir.no og quarto.pub) | Søkere fra hjemfylke til studiefylke, førstevalg per institusjon i fylket | F | HTML og kartwidgeter | [V] | Middels | Middels (ikke per program) |
| HK-dir Kandidatundersøkelsen 2025 | Ledighet og mistilpasning per fagfelt (økonomisk-administrative fag er med) | L (fagfelt) | Rapport i NVA | [V] | Lav–middels | Lav |
| HK-dir Tilstandsrapporten 2026 | Årlig oversikt, kapittel om søkere | L, I | HTML/PDF | [V] (siden finnes) | Lav (bygger på DBH/SO) | Lav |
| NOKUT tilsyn | Periodisk tilsyn: 4. runde, gruppe 2 fra januar 2026 er AHO, KHiO, MF, NHH, NiH og NMH. Akkrediteringsrapporter. | I | PDF og nyheter | [V] | Lav–middels (markedsstatus) | Lav |
| Lånekassen statistikk | Støttemottakere, stipendtyper, tilbakebetaling | L | Power BI-innbygging, ingen tall per lærested | [V] | Lav | – |
| Google Trends | Søkeinteresse | F | Uoffisielt API svarer 429 på automatiserte kall. Må gjøres manuelt. | [V] (negativt funn) | Lav–middels | Lav (manuelt) |
| Wikimedia sidevisninger | Månedlige visninger per Wikipedia-artikkel (NMBU 5 791 i 2025, BI 7 874, Kristiania 4 399) | I | REST, ingen nøkkel | [V] | Lav | Lav |
| Wayback CDX | Historiske programsider (NMBU B-ØA arkivert fra juni 2024) | P | JSON | [V] | Lav–middels (pris og tekst over tid) | Middels |
| AACSB / EQUIS | Akkrediteringsstatus. NMBU HH har AACSB ifølge nmbu.no. | I | Nettsider (aacsb.edu og efmdglobal.org svarer 200) | [V] (NMBU); [A] (fullstendig liste for Norge) | Lav–middels | Lav |

## 3. Viktige fallgruver

- **Samordna-API-et er udokumentert** og laget for søkerportalen. Feltnavnene kan endres uten varsel.
  - `offerVacanciesSinceLast` er tolket som «var på ledig-lista i år». Tolkningen er sterk (664 av 670 hadde poenggrensen
    «alle»), men den er ikke bekreftet av Samordna. **[A]**
  - Flagget nullstilles når opptaket arkiveres, så historikken må bygges ved å lagre en kopi hvert år.
  - Arkiverte opptak har `status: Archived`. 2015 (id 2) er `Unpublished`.
- **DBH 905:**
  - BI (8241) oppgir oppmeldt = møtt, så oppmøte for BI må vises som «ikke rapportert».
  - Små celler skjermes: BUS211 har 83 møtt og 82 bestått, men 0 stryk.
  - Tellevariablene («Oppmeldt totalt» og de andre) kan ikke stå i `groupBy`, da gir API-et 400.
- **Forskningsrådets datasett:**
  - Organisasjonsnummeret er ikke unikt per institusjon (UiO har flere enheter). Aggreger på `kortnavn`.
  - Kristiania mangler kortnavn.
  - Søknadsåret er `soknadsdato`, ellers `soknadsfrist`.
  - Tallene for de store virker lave (UiO 272 søknader i 2024). Kontroller mot Forskningsrådets egne årstall før
    publisering.
  - Datasettet inneholder prosjektledernavn. De er ikke lagret her.
- **CORDIS:** NMBU heter «NORGES MILJO-OG BIOVITENSKAPELIGE UNIVERSITET». Match på `vatNumber` og ikke på navn.
- **Erasmus+:**
  - Landene står som «NO - Norway».
  - Høyere utdanning rapporteres per studieår, og prosjektene går i opptil tre år. 2022-filen har derfor svært få
    utreisende studenter per institusjon (NMBU 5, UiB 85).
  - Navnene har mange skrivemåter.
  - DBH 142 er bedre for utveksling ut.
- **SSB 14378:** celler med få personer er tomme, f.eks. skogbruk og veterinær på bachelornivå. Bruk fagfelt på to eller
  tre sifre.
- **utdanning.no:**
  - Studievelgeren dekker bare SO-programmene (1 395), med de samme plassene og poengene som vi har fra før. Den legger
    ingenting til.
  - Ledighets- og yrkestallene er per utdanningstype (`uno_id`) og ikke per lærested.

## 4. Prioritert handlingsplan

### A. Bygg selv nå (åpne data, ingen avtaler)

| # | Steg | Hvor i appen/kjeden | Anslag |
|---|---|---|---|
| 1 | **Samordna-katalogen:** nytt skript `scripts/fetch-samordna-katalog.py`. Henter alle NOM-opptak (id 1, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18), bare offentlige programfelter, ett kall per år med `size` 2000. Skriver studieplasser 2016–2026, nytt/avlyst og ledigflagget for i år per `studyProgrammeInstitutionCode` (= SO-koden i programkartet). Visning: studieplass-trend i opptaksanalysen og merket «På lista over ledige plasser 2026» i programtabellen. | `data/<f>/kilder/`, `build-landsam-data.py`, opptaksvisningen | 0,5 dag |
| 2 | **Årlig innhenting av ledig-lista:** planlagt oppgave to ganger i uka fra 19.7. til 30.9. som lagrer `offerVacancies=true` med dato. Da får vi historikk fra 2027 og ser når programmene fylles opp. | Planlagt oppgave, `data/nmbu/kilder/samordna-ledige/` | 2 t + drift |
| 3 | **DBH 905 i emne- og gjennomføringsvisningene:** oppmøteandel (møtt/oppmeldt) og stryk av oppmeldte per emne og program, og institusjonstotal i fagmiljø- eller gjennomføringskortet. BI merkes «oppmøte ikke rapportert». | `build-landsam-courses.py` (ny serie), `build-nmbu-courses.py`, `build-completion.py` | 0,5 dag |
| 4 | **Kortet «Arbeidsmarkedet etter utdanning»** per fakultet. Fra SSB 14378: median lønn 0–2 og 3–4 år etter fullført utdanning, bachelor mot master, per fagfelt koblet via NUS (vi har SSB Klass 36). Fra utdanning.no: ledighet og de fem vanligste yrkene per `uno_id`. Koblingen fakultet → fagfelt og `uno_id` er kuratert (HH: 41/411, 341, `u_sivilokonomutdanning`, `u_ok_adm`). | Ny modul, `scripts/build-arbeidsmarked.py` | 1 dag |
| 5 | **Forskningsfinansiering i «Fagmiljøet»:** NFR-suksessrate og tildelt beløp per institusjon (og per fag for HH: `fagomraade`/`fag`), EU-bidrag fra CORDIS (match på vatNumber) og NVA-profil per fakultet (artikler, masteroppgaver, medieoppslag, NFR-finansiering). | `build-staff.py` eller nytt `build-forskning.py`, `staffData.ts` | 1 dag |
| 6 | **Søkergrunnlaget:** legg SSB 11964 (andel direkte overgang per fylke) og SSB 04478 (studenter etter bostedsfylke) inn i `build-sokergrunnlag.py`. Vis som «andel av kullet som går rett videre» ved siden av ungdomskullene. | `build-sokergrunnlag.py`, `Sokergrunnlag.tsx` | 3 t |
| 7 | **Nasjonal referanse i gjennomføringskortet** fra SSB 14957 og 14958, per studium (f.eks. siviløkonom 68,7 % innen 5 år), som stiplet linje ved siden av DBH 705. | `build-completion.py` | 2 t |
| 8 | Valgfritt: ukentlig henting av NAV-fasetter for «Kontor og økonomi» og andre relevante yrkesgrupper per fylke. Viser etterspørselen etter bachelor og master (i dag 1 217 og 775 av 1 825 annonser). | Planlagt oppgave, lite kort | 3 t + drift |
| 9 | Valgfritt: Erasmus+ innreisende per norsk mottaker, OpenAlex-siteringer, Wikipedia-sidevisninger. Lav prioritet. | – | – |

### B. Må bestilles eller søkes om

| # | Hva | Hos hvem | Pris og tid | Merknad |
|---|---|---|---|---|
| 1 | **Søkere per hjemfylke per studieprogram for alle institusjonene** (førstevalg og alle søkere, med tilbud og ja-svar, 2021–2026), bare aggregert med skjerming < 5 | HK-dir, avdeling for opptak (Samordna), eller DBH-spesialbestilling (dbh@hkdir.no) | Ikke publisert. Be om pris og tid før bestilling. | HK-dir har hjemfylket fra Folkeregisteret for alle SO-søkere. Den offentlige rapporten gir bare fylke til fylke. |
| 2 | **Registerbasert kandidatundersøkelse:** lønn, yrke og ledighet 1–3 år etter fullført grad, per lærested og NUS-kode (økonomi og administrasjon: NMBU, BI, NHH, UiA, USN, Kristiania osv.) | microdata.no (NMBU ber om tilgang som institusjon) eller SSB «statistikk på oppdrag» | microdata.no: abonnement etter prismodellen. SSB: 829–2 321 kr/t eks. mva., f.eks. 20–40 t ≈ 25–80 000 kr eks. mva. **[A]** | microdata.no har utdatakontroll, bare aggregater kommer ut. Om lærested og program finnes som variabel i microdata.no, må sjekkes i variabelkatalogen **[A]**. |
| 3 | Ledige plasser tilbake i tid (2016–2025) | Samordna/HK-dir | Ukjent | Flagget er nullstilt i arkivet, men Samordna har det trolig i databasen **[A]**. |
| 4 | DBH 906 eller 379 uten skjerming for konkurrentene | Ikke mulig | – | Bare egen institusjon får eksakte tall. |

**Ikke send noe av dette uten at Mathias eller NMBU gjør det selv.** Denne økten har ikke sendt skjemaer eller bestillinger.

### C. Hva NMBU må hente internt

1. **DBH-token for NMBU:** be NMBUs DBH-kontakt eller brukeradministrator i Dimp om Feide-basert API-tilgang
   (dbh@hkdir.no gir veiledning). Legg tokenet i en miljøvariabel (`DBH_JWT`) i skriptene, **aldri i repoet**, og kjør de
   eksisterende generatorene for 1173 med token. Eksakte tall kan vises for NMBU-programmene og merkes «eksakt» mot
   «skjermet» for konkurrentene.
2. **FS192.002 «Fordeling – fylke, alder, kjønn»** fra opptakskontoret. Rapporten kjøres per opptak (NOM og hvert lokalt
   opptak) for 2021–2026, fra historikken:
   - Kombiner med studieprogram. Da telles søknadsalternativer, ikke personer.
   - Velg utplukk fire ganger: alle, tilbud, ja-svar og møtt.
   - Fordel på fylke (hjemstedskommune), alder og kjønn.
   - Levér som Excel eller CSV. Én fil per opptak og utplukk er nok.
3. **Aggregert FS-uttrekk for opptaksanalysen og simuleringen av 2028-reglene** (§28 i status-og-metode). Én rad per
   studieprogram × opptaksår × kategori, antall som heltall, og celler under 5 slås sammen eller settes til «< 5»:
   - **Prioritet:** 1, 2–3, 4–10.
   - **Kvote:** ORD, ORDF (primærvitnemål), andre.
   - **Poeng:** konkurransepoeng og skolepoeng i intervaller på 2 poeng, med realfagspoeng, alderspoeng og
     tilleggspoeng som egne summer per intervall. Grunnlaget er FS-tabellene PERSONPOENG og PERSONKVALGRUNNLAG
     **[V]** (navnene står i FS-dokumentasjonen).
   - **Alder per 31.12.:** ≤ 19, 20–21, 22–23, 24+. Grensen 23 år er den nye primærvitnemålskvoten.
   - **Hjemfylke** fra hjemstedskommunen (når FS192.002 ikke er nok), kjønn.
   - **Status:** kvalifisert, tilbud, ja-svar, møtt (studieprogramstudent med semesterregistrering høst), frafall før
     1.10. Kilder: søknadsalternativ, tilbud og svar (KVOTESVAR **[V]**, SOKNADSALTERNATIV og STUDIEPROGRAMSTUDENT
     **[A]**, tabellnavnene er ikke kontrollert).
   - **Ikke med:** fødselsnummer, navn, søkernummer, postnummer på personnivå eller fritekst.
4. **Studiebarometeret og egne undersøkelser:** NMBU får trolig sine egne rådata fra HK-dir, med svar per program og
   fritekst **[A]**. Til appen trengs bare indekser per program og år, med n. Emneevalueringer og NMBUs egne
   kandidat- eller alumniundersøkelser kan legges inn som aggregat per program hvis de finnes **[A]**.
5. **Frafall før studiestart og «hvor gikk de som takket nei»:** finnes ikke i FS for konkurrentene. Det krever en
   HK-dir-bestilling (B1) eller registerdata (B2).

Anbefalt rekkefølge:
- **Denne uka:** A1, A3, A4, A5 (åpne data, 3 dager totalt) og C1 (be om token).
- **Deretter:** C2 og C3 (opptakskontoret).
- **Etter avklaring med NMBU:** B1 og B2.
- **Før 19.7.2027:** sett opp A2.

## 5. Juridiske og etiske merknader

- **Lisenser:**
  - DBH: NLOD, og DBH/HK-dir skal oppgis som kilde. Dataene skal ikke fremstilles villedende. Skjermede celler skal
    merkes.
  - SSB: CC BY 4.0.
  - Forskningsrådet: NLOD 2.0.
  - CORDIS og Erasmus+: EUs gjenbruksregime, åpen gjenbruk med kildehenvisning **[A]**.
  - utdanning.no-API-et er åpent, men «ikke versjonert». Oppgi kilde og tål endringer.
- **Samordna-API-et** er et internt API bak en offentlig side.
  - Bruk det skånsomt: noen få kall per år (og to i uka i juli–september for ledig-lista), med tidsavbrudd, og uten
    innlogging eller søkerendepunkter (`/applicant`, `/applications`).
  - Vi henter bare programdata som også vises offentlig i studietabellen.
  - Før det bygges fast inn, bør NMBU spørre Samordna/HK-dir om det er greit, eller om det finnes et offisielt uttrekk.
- **Personopplysninger:**
  - Forskningsrådets datasett har prosjektledernavn, og NVA har forfatternavn. Vi lagrer og viser bare aggregater per
    institusjon eller fakultet.
  - NAV-annonser kan ha kontaktpersoner. Bare fasettene er lagret.
- **Interne FS- og DBH-tall:**
  - Tall med institusjonstoken er ikke skjermet og kan inneholde celler med 1–2 personer. De hører til det interne
    sporet og **skal ikke inn i den åpne siden** (nmbu-sammenligning.pages.dev). Passordsperren er bare en
    visningssperre, og dataene ligger i JavaScript-bunten.
  - Bruk samme løsning som for H26-analysen (kryptert), eller skjerm (< 3 eller < 5) før publisering.
  - FS-uttrekk må ha behandlingsgrunnlag (NMBUs oppgave og statistikkformål) og bør avklares med NMBUs personvernombud
    før de lagres utenfor NMBUs systemer.
- **microdata.no og SSB-oppdrag** har egne avtaler og utdatakontroll. Resultatene kan publiseres som aggregat etter SSBs
  regler.
- **Google Trends:** vilkårene tillater ikke automatisert skraping. Bruk nettsiden manuelt.
- **Ingen innlogging** er brukt, og **ingen skjemaer, bestillinger eller innsynsbegjæringer** er sendt. De eneste
  POST-kallene er lesespørringer mot søke-API-ene til Samordna og DBH, samme type kall som de offentlige sidene gjør.

## 6. Filer i `data/nmbu/kilder/nye-kilder/`

**Samordna**
- `samordna_studietilbud_2026_med_ledigflagg.json`: alle 1 395 UH-program i 2026 med plasser, sted og ledigflagg.
- `samordna_studieplasser_2016-2026_nmbu_og_okonomi.csv`: studieplasser per år for NMBU og alle økonomiprogram
  (1 743 rader).
- `samordna_search_eksempel_nmbu_boa_2026.json`: én full post med alle felt (NMBU B-ØA).

**DBH**
- `dbh905_nmbu_2024_bus_ecn.json`: 84 BUS- og ECN-emner.
- `dbh905_institusjoner_2023-2025.json`: institusjonstotaler.
- `dbh_api_dokumentasjon_utdrag_tilgang.txt`: utdrag om institusjonstoken, skjerming og lisens.

**SSB**
- `ssb_14378_lonn_nyutdannede_2025.json`
- `ssb_11964_overgang_vgs_hoyere_2025.json`
- `ssb_14958_gjennomforing_5aarig_master.json`

**utdanning.no**
- `utdanningno_arbeidsledighet_utvalg.json`
- `utdanningno_arbeidsmarked_sivilokonom.json`
- `utdanningno_lonn_sivilokonom.json`
- `utdanningno_studievelgeren_okadm.json`

**Forskning, mobilitet og arbeidsmarked**
- `nfr_soknader_aggregert_utvalg.json`: Forskningsrådet, per kortnavn og år 2019–2025.
- `nva_nmbu_hh_2025_aggregeringer.json`
- `cordis_horizon_europe_utvalg.json`
- `erasmus_ka1_2022_norske_uh_utvalg.json`
- `nav_stillinger_kontor_okonomi_fasetter.json`
