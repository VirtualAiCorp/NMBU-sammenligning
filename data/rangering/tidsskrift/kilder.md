# Tidsskriftlister og publiseringsdata: kilder, lisens og status

Undersøkt 3. oktober 2026, til utkastet «Norwegian Business School Ranking». Publiseringen skal vurderes både
i det norske systemet (nivå 1/2, publiseringspoeng) og etter internasjonale lister (ABS/AJG, ABDC, FT50, UTD24).
Artiklene kobles til listene på ISSN: `printIssn`/`onlineIssn` fra NVA mot `issn`/`eissn` her.

| Fil | Innhold | Antall | Laget med |
|---|---|---|---|
| `abdc.csv` | ABDC JQL 2025: tittel, issn, eissn, rating (A*/A/B/C), fagfelt (FoR-kode, ANZSRC 2020) | 2 648 (A* 219, A 630, B 859, C 940) | `scripts/rangering/abdc_til_csv.py` |
| `ft50.csv` | FT50: tittel, issn, eissn, `ft50_2026`, `ft50_2016` (0/1), `issn_kilde` | 53 rader = 50 på 2026-lista + 3 som falt ut | `scripts/rangering/lister_issn.py` |
| `utd24.csv` | UTD24: tittel, issn, eissn, `issn_kilde` | 24 | `scripts/rangering/lister_issn.py` |
| `ajg-mal.csv` | Tom mal: tittel, issn, eissn, fagfelt, ajg2024 | 0 | for hånd |
| `kilde/` | Offisiell ABDC-xlsx, lagrede kildesider, AJG-metodedokumentet, Crossref-svar | – | – |

Alle ISSN er normalisert til `NNNN-NNNX`, og kontrollsifferet er sjekket (`scripts/rangering/issn.py`).
Ingen fil har ugyldige ISSN, samme ISSN to ganger eller samme tittel to ganger. Hvis en kilde bare oppgir
ett ISSN, er `eissn` tom.

---

## 1. ABDC Journal Quality List 2025

- **Side:** https://abdc.edu.au/abdc-journal-quality-list/
- **Fil:** https://abdc.edu.au/wp-content/uploads/2026/09/ABDC-JQL-2025-v3-210926.xlsx (lagret i `kilde/`). Arket
  «2025 JQL» er merket «2025 major review … Current to September 2026». Fila har også fanene 2022, 2019, 2016,
  2013 og 2010, som kan brukes til tidsserier.
- **Rapport fra gjennomgangen:** https://abdc.edu.au/wp-content/uploads/2026/03/JQL-Review-2025-report-26.03.26.pdf
- **Lisens og vilkår:** Fila er lagt ut åpent til nedlasting, uten registrering og uten klikk-avtale. Vi fant ingen
  egen lisens for selve lista. Sidebunnen sier bare «Copyright All Rights Reserved © 2026». Det eneste uttrykte
  forbudet gjelder ABDC-logoen: den skal ikke brukes uten skriftlig samtykke, og særlig ikke på en måte som antyder
  at ABDC står bak en rangering. **Praksis for oss:** Vi bruker ratingene internt og viser aggregater
  (for eksempel andel A*/A per skole) med kildehenvisning, som «ABDC Journal Quality List 2025». Vi bruker ikke
  logoen og legger ikke ut hele lista på nytt. Spør office@abdc.edu.au før lista eventuelt publiseres i sin helhet.
- **Rettede ISSN:** Ni ISSN i ABDC-fila hadde feil kontrollsiffer eller tekst i ISSN-feltet. De er rettet etter oppslag
  i ISSN-portalen og Crossref, se `RETTELSER` i skriptet: Applied Economic Perspectives and Policy, Asian Review of
  Accounting, Journal of Case Studies, Journal of Economic Literature, Journal of Heritage Tourism, Journal of
  Industrial Relations, Stanford Social Innovation Review og Third World Quarterly. eISSN `0034-3409` for
  Review of Marketing and Agricultural Economics er ugyldig og er fjernet. To titler mangler ISSN helt i ABDC:
  Agricultural Economics and Rural Development og ISEAS Current Economic Affairs Series.

## 2. FT50 (FT Research Rank)

- **Offisiell kilde:** https://www.ft.com/ft50-journals. Siden står bak FTs bot-sperre (403, «Security
  Verification») og kunne ikke leses maskinelt. Vi har ikke forsøkt å omgå sperren.
- **Lista ble revidert i april 2026**, første gang siden 2016:
  - **Inn:** Academy of Management Annals, American Sociological Review, Psychological Science.
  - **Ut:** Human Relations, Journal of Business Ethics, Organization Studies.
- **Kontrollert mot:** McMaster (https://libguides.mcmaster.ca/ft-top50) og Oxford/Bodleian
  (https://libguides.bodleian.ox.ac.uk/ft-top50). Begge har 50 identiske titler og lenker til ft.com. Nyhetsdekning:
  https://poetsandquants.com/2026/05/08/deans-decry-journals-removal-from-influential-financial-times-list/
- **Begge versjonene er med** (`ft50_2016`/`ft50_2026`). Grunnen er at publikasjoner fra 2024–2025 er talt i
  FT-rangeringer med 2016-lista. Velg kolonne etter hvilken FT-årgang dere vil etterligne.
- **MIT Sloan Management Review legges ned.** Siste nummer er planlagt i september 2026
  (https://poetsandquants.com/2026/05/06/mit-sloan-management-review-to-shut-down-after-67-years/). Den står
  fortsatt på FT50-2026, men gir ingen nye artikler.
- **ISSN:** Hentet fra Crossref (`api.crossref.org/journals?query=…`) med eksakt titteltreff. Manglende eISSN er
  supplert fra ABDC. Der Crossref manglet eller var feil, er ISSN slått opp i ISSN-portalen
  (`issn_kilde = issn-portalen`). Det gjelder Harvard Business Review (bare trykt 0017-8012), M&SOM, og
  eISSN for Journal of Accounting and Economics og Journal of Financial Economics.
- **Avvik mot ABDC:** ABDC oppgir `0065-812X` som eISSN for American Economic Review. Det er egentlig
  AEA Papers and Proceedings, så vi bruker `1944-7981`.
- **Lisens:** En liste over 50 tidsskriftnavn er fakta, og vi bruker den med henvisning til FT. Vi bruker ikke
  FT-varemerket som om FT står bak.

## 3. UTD24 (UT Dallas)

- **Offisiell kilde:** https://jsom.utdallas.edu/the-utd-top-100-business-school-research-rankings/list-of-journals
  (lagret i `kilde/utd24-list-of-journals.html`). Lista har 24 tidsskrifter og er uendret.
- «Journal on Computing» på UTD-siden er INFORMS Journal on Computing. Crossref gir forløperens ISSN
  (ORSA Journal on Computing, 0899-1499), så vi bruker gjeldende trykt ISSN 1091-9856 og eISSN 1526-5528.
- **Lisens:** Listen over navn er fakta. Vis den med henvisning til UT Dallas' Naveen Jindal School of Management.

## 4. Chartered ABS Academic Journal Guide (AJG) 2024: hvordan den kan skaffes lovlig

**Vi har ikke hentet AJG-data.** `ajg-mal.csv` er tom og skal fylles fra Mathias' egen kopi. Ikke bruk lekkede
Excel-filer eller PDF-er fra ResearchGate, Scribd eller lignende.

- **Tilgang:** https://charteredabs.org/academic-journal-guide/academic-journal-guide-2024 viser bare
  «Log in or register to view the Academic Journal Guide».
  - **Registrering:** https://charteredabs.org/register?route=ajg&gated=true ber om navn, e-post, mobil, stilling,
    om du underviser ved en business school, land, institusjon og passord. Du må også godta vilkårene og
    personvernerklæringen.
  - **Pris:** Ingen pris er oppgitt, og universitetsbibliotekene beskriver tilgangen som gratis etter registrering
    (for eksempel Liverpool: https://libanswers.liverpool.ac.uk/faq/179701). Vi fant ingen betalt abonnements- eller
    institusjonslisens. Institusjoner trenger altså ikke egen avtale for å lese guiden, men hver bruker må
    registrere seg.
  - **Format:** Guiden vises som en interaktiv tabell som kan søkes, sorteres og filtreres (innebygd Tableau).
    Vi kunne ikke bekrefte om innloggede brukere kan eksportere til Excel, fordi det krever innlogging.
    Mathias bør sjekke det selv.
- **Omfang** (metodedokument, https://assets.charteredabs.org/ajg-2024-methodology.pdf, lagret i `kilde/`):
  1 822 tidsskrifter i 22 fagfelt. Fordelingen er 145 på nivå 4 (inkludert 4*), 323 på nivå 3, 565 på nivå 2 og
  789 på nivå 1. AJG 2024 var en mellomrevisjon, og AJG 2027 er under arbeid med ny vitenskapskomité.
- **Vilkår:** Registreringen viser til de generelle bruksvilkårene på https://charteredabs.org/website-terms-of-use
  (sist oppdatert juli 2022). Vi fant ingen egne AJG-vilkår. Det relevante er dette:
  - **Personlig bruk:** Du kan skrive ut én kopi og laste ned utdrag for personlig bruk. Du kan også gjøre andre i
    egen organisasjon oppmerksom på innholdet.
  - **Ingen kommersiell bruk** av innholdet uten lisens fra Chartered ABS.
  - **Ingen tekst- og datautvinning eller skraping:** Roboter, skrapere og automatisert analyse er forbudt. Dette er
    et uttrykkelig forbehold etter DSM-direktivet art. 4(3).
  - **Ingen gjengivelse:** Du kan ikke reprodusere, kopiere eller videreselge deler av nettstedet utover dette.
    Opphavet må alltid krediteres, og logoene er varemerker.
  - **Spørsmål om annen bruk** går til enquiries@charteredabs.org.
- **Hva dette betyr for oss** (dette er vår tolkning, ikke juridisk rådgivning):
  - **Lagre lista i et internt verktøy:** Vilkårene tillater ikke dette uttrykkelig. Utdrag for personlig bruk
    tolkes snevert. Ei manuelt utfylt `ajg.csv` på Mathias' egen maskin, til egen analyse, er det tryggeste. Den
    holdes utenfor git og nettsiden (se `.gitignore` i denne mappa). Skal fila deles i et team eller verktøy,
    eller innholdet fylles automatisk, trenger vi **skriftlig tillatelse**.
  - **Vise nivåfordelinger og aggregater:** Vilkårene sier ingenting om dette. Tall som «antall 4/4*-artikler per
    skole» er avledede fakta og gjengir ikke selve guiden. Det er trolig greit, med kreditering og en henvisning til
    at Chartered ABS ber om ansvarlig bruk (DORA/Leiden). Lister som viser AJG-nivå for hvert tidsskrift bør vi ikke
    publisere uten tillatelse. **Anbefaling:** Send en kort e-post til enquiries@charteredabs.org. Beskriv det
    interne verktøyet, at bare aggregater vises, og at kilden krediteres. Be om skriftlig ja før publisering.
  - **Merk:** Chartered ABS skriver selv at guiden ikke skal brukes til å vurdere enkeltpersoners forskning. En
    skolerangering på aggregert nivå er nærmere tiltenkt bruk, men bør sitere forbeholdet.

## 5. Det norske systemet: endringer for publikasjoner fra 2024 og 2025

- **Publiseringspoeng er tatt ut av UH-finansieringen fra 2025.** Pengene følger ikke lenger poengene i UH-sektoren,
  men ordningen gjelder fortsatt for instituttsektoren og helseforetakene. Rapporteringen og poengberegningen
  fortsetter, og statistikken publiseres i DBH.
  - https://kanalregister.hkdir.no/aktuelt/vitenskapelig-publisering-er-ikke-lenger-del-av-finansieringen-av-universitets-og-hoyskolesektoren (18.09.2024)
  - https://kanalregister.hkdir.no/informasjonsartikler/kanalregisteret-i-finansieringssystemet (oppdatert 22.09.2026)
- **Overgangen fra Cristin til NVA:** 2024-publikasjonene er rapportert i Cristin. 2025-publikasjonene rapporteres i
  Nasjonalt vitenarkiv (NVA, Sikt). Cristin stengte for registrering 19. august 2025, og Cristin-dataene ble flyttet
  til NVA 19.–22. august 2025. NVI-perioden for 2025 var 20.11.2025–09.04.2026 (`/scientific-index/period/2025`).
  Kilde: referat fra Det nasjonale publiseringsutvalget (NPU) 12.09.2025, https://npi.hkdir.no/dokument/file/142.
  Bakgrunn: https://sikt.no/tiltak/cris-nva-prosjektet
- **Poengberegningen er uendret.** Vi har lest NVAs kildekode (BIBSYSDEV/nva-nvi, `PointCalculationConstants.java`,
  `PointCalculator.java`, `PointService.java`):
  - **Formel:** poeng = kanalvekt × 1,3 ved internasjonalt samarbeid (ellers 1,0) × √(institusjonens
    forfatterandeler ÷ publikasjonens totale forfatterandeler). Resultatet rundes til fire desimaler.
  - **Kanalvekter, nivå 1 / nivå 2:**
    - Artikkel og oversiktsartikkel: 1 / 3
    - Monografi og kommentarutgave: 5 / 8
    - Kapittel hos forlag: 0,7 / 1
    - Kapittel i serie: 1 / 3
  - **Forfatterandel:** én per unik kombinasjon av forfatter og toppnivå-institusjon. En forfatter uten gyldig
    tilknytning teller én.
  - **Fordeling:** Poengene fordeles videre ned på underenheter (`CreatorAffiliationPoints`), så poeng per avdeling kan
    regnes ut fra åpne NVA-data.
- **Nivåer:** Kanalregisteret har filtrene nivå 2, nivå 1, «Under diskusjon (Nivå X)» og «Ikke godkjent (Nivå 0)».
  NVA bruker verdiene `LevelOne`, `LevelTwo`, `LevelZero` og `Unassigned`. Bare nivå 1 og 2 gir poeng
  (`ScientificValue.isValid()`).
- **Nivå 2-andel:** Grensen på 20 % beholdes inntil videre. NPU vurderer en ny beregningsmåte fra og med 2026, med
  Scopus supplert av OpenAlex og «finsk modell», og eventuelt 25 % senere. Det berører nominasjonene for 2026 og
  senere, ikke nivåene for 2024 og 2025.
- **Oppdateringer i registeret:** Kriteriene for nivå 1 ble utvidet i mars 2025 og skrevet om i juni 2026
  (https://kanalregister.hkdir.no/aktuelt/nye-kriterier-for-niva-1,
  https://kanalregister.hkdir.no/aktuelt/noen-oppdateringer-for-sommeren). Endelige nivåer for 2025 og nye nivåer
  for 2026 ble lagt inn i midten av februar 2026
  (https://kanalregister.hkdir.no/aktuelt/niva-og-nivaendringer-i-kanalregisteret).
- **DBH 373 og 374 finnes for både 2024 og 2025.** Testet 03.10.2026 mot
  `https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData`, gruppert på `Årstall` og `Avdelingskode`, og for
  374 også `Kvalitetsniva`:
  - 373 har én totalrad per institusjon (`Avdelingskode = 000000`) i tillegg til avdelingsradene. Summeres alle
    radene, blir totalen dobbelt så stor.
  - Eksempel NHH (1173): 981,8 poeng i 2024 og 1 040,9 i 2025.
  - 2025-tallene har fire desimaler, mens 2024 har åtte. Det tyder på at 2025-tallene er beregnet i NVA.
  - **Merk:** `kodetekst: "J"` gir serverfeil (500) på 373 i dag. Bruk `"N"`.

## 5b. NVA og NVI-poeng: åpent API? (testet 03.10.2026)

API-beskrivelse: https://raw.githubusercontent.com/BIBSYSDEV/nva-nvi/refs/heads/main/docs/openapi.yaml

| Endepunkt | Åpent? | Resultat |
|---|---|---|
| `GET api.nva.unit.no/scientific-index/period/{år}` | ja | Periode og frister, for eksempel 2025 med status `ClosedPeriod` |
| `GET api.nva.unit.no/scientific-index/publication/{id}/report-status` | ja | Status per publikasjon: `REPORTED`, `NOT_CANDIDATE`, `PENDING_REVIEW` osv., pluss periode. **Ingen poeng.** |
| `…/candidate`, `…/candidate/publication/{id}`, `…/institution-report/{år}`, `…/institution-approval-report/{år}`, `…/reports/{periode}/institutions/{inst}` | nei, 401 | Gir poeng per institusjon og bidragsyter, men krever innlogging med NVI-kurator- eller administratorrolle |
| `GET api.nva.unit.no/search/resources` | ja | Per artikkel: `publicationContext.printIssn/onlineIssn/scientificValue`, `scientificIndex {year, status}`, forfattere og tilknytninger. Filtrene `scientificIndexStatus=Reported`, `scientificValue=LevelTwo` og `publicationYear` virker (2024: 119 198 treff totalt, hvorav 28 638 rapportert til NVI). |

**Konklusjon:** Det finnes ikke noe åpent API for NVI-poeng per publikasjon og institusjon. Vi kan regne ut
poengene selv. Bruk `search/resources` med `scientificIndexStatus=Reported`, ta nivå fra `scientificValue`, og
bruk formelen i punkt 5 på forfatterne og tilknytningene i posten. Avstem mot DBH 373/374 per avdeling. To ting
er usikre: om «verified creators» og «internasjonalt samarbeid» tolkes helt likt, og om institusjonene har avvist
(`REJECTED`) enkeltposter.

## 6. Kanalregisteret som reserve for nivå per år og ISSN

- **Anbefalt: NVAs kanal-API**, som er åpent, uten nøkkel, og speiler Kanalregisteret:
  - `GET https://api.nva.unit.no/publication-channels-v2/serial-publication?query={ISSN eller tittel}&year={år}`
    gir `name`, `printIssn`, `onlineIssn`, `scientificValue` og `year`, med lenke til Kanalregisteret i `sameAs`.
    Søket virker på både trykt ISSN og eISSN. Søketeksten må ha minst fire tegn.
  - `GET …/serial-publication/{pid}/{år}` gir én kanal i ett bestemt år. Uten `year` får du inneværende år.
  - `…/journal`, `…/series` og `…/publisher` finnes også.
  - Testet: Journal of Finance er `LevelTwo` for 2024 og 2025. Journal of Financial Economics finnes på eISSN
    1879-2774.
- **Kanalregisterets egen side:** `https://kanalregister.hkdir.no/publiseringskanaler/info/tidsskrift?pid={pid}`
  (gammelt grensesnitt, åpent) viser tabellen «Nivåplasseringer og UH-sektorens publiseringspoeng» med nivå per år
  fra 2004 til neste år, pluss UH-sektorens forfatterandeler og poeng per år. Vi fant ikke noe dokumentert JSON-API.
- **Nytt søk:** https://kanalregister.hkdir.no/sok?option=journals&input={ISSN} kan filtrere på nivå, fagfelt
  (inkludert «Økonomisk-administrative fag») og land, og har knappen «Last ned søkeresultatet i Excel». Excel-fila
  lages i nettleseren fra en intern søkeindeks (Typesense). Det er ikke et dokumentert API, så vi bør ikke bygge på
  det. Manuell Excel-nedlasting av fagfeltet er et greit engangsalternativ.
- **Kanalstatistikken** (https://kanalregister.hkdir.no/informasjonsartikler/statistikk) krever innlogging, fordi
  den ligger i det gamle grensesnittet.
- **Det gamle eksportpunktet virker ikke lenger:** «Alltid fersk liste» (`/publiseringskanaler/AlltidFerskListeTidsskrift2`)
  gir 404 på kanalregister.hkdir.no og bare et skall på dbh.hkdir.no.

## Usikkert eller gjenstår

1. FT50-2026 er kontrollert mot to bibliotekguider, ikke direkte mot ft.com (bot-sperre). Mathias bør åpne
   https://www.ft.com/ft50-journals i nettleseren og bekrefte. Vi vet heller ikke fra hvilken FT-rangering
   2026-lista gjelder.
2. AJG: Vi vet ikke om innloggede brukere kan eksportere, og bruk i et internt verktøy og visning av aggregater bør
   avklares skriftlig med Chartered ABS.
3. ABDC har ingen uttrykt lisens for lista. Vi bruker den internt og som aggregater, og publiserer den ikke i sin helhet.
4. Våre egne NVI-poeng per avdeling må avstemmes mot DBH 373/374. Hvordan `Unassigned` i NVA forholder seg til
   «nivå X» er ikke bekreftet.
5. ISSN-matching: ABDC-titler med bare ett ISSN, og tidsskrifter som har byttet ISSN, kan gi bomtreff. Match også
   på NVAs kanal-`identifier` (pid) når det er mulig.
