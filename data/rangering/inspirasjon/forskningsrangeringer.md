# Forskningsrangeringer og -verktøy: hva vi kan lære til «Norwegian Business School Ranking»

Kartlagt 3. oktober 2026 (nettsider lest samme dag). Formålet er å se hvordan etablerte rangeringer måler forskning ved handelshøyskoler og økonomimiljøer, og hva det betyr for vår forskningsdel. Den bruker i dag:

- publiseringspoeng per faglig årsverk (DBH),
- andel nivå 2,
- artikler fra NVA koblet mot ABDC, FT50, UTD24 og AJG (ABS),
- internasjonal sampublisering.

Markeringer i teksten:

- **(verifisert)** betyr at jeg leste det på kilden denne dagen.
- **(ikke verifisert)** betyr at det kommer fra søkeresultater, sekundærkilder eller min egen kunnskap. Sjekk før det brukes i en offentlig tekst.
- **(uleselig)** betyr at siden eller PDF-en lot seg ikke lese. Det gjelder blant annet SCImagos metodeside (Cloudflare-sperre), Springer-artikkelen om Handelsblatt-rangeringen og GRAS-vektene per fag (vekttabellen er tom på ShanghaiRankings metodeside).

## 0. Oversikt: de ti rangeringene ved siden av hverandre

| Rangering | Hva telles | Telling | Tidsvindu | Størrelsesjustering | Passer for oss |
|---|---|---|---|---|---|
| UTD Top 100 | Artikler i 24 tidsskrifter | Brøk p/n per institusjon | Rullerende 5 år, valgfri periode fra 1990 | Ingen (per capita finnes som tilleggsside) | Høy som metodemodell |
| Tilburg EconTop | Artikler i 208 tidsskrifter (standardliste er en delmengde) | Hel, institusjonen telles én gang per artikkel | 5 år, valgfritt i «Sandbox» | Ingen (bevisst) | Høy som verktøymodell |
| RePEc/IDEAS | Forfattere, verk, sitater, sider, visninger | Sum av forfatterscore, andeler ved flere tilknytninger | Hele historikken pluss «siste 10 år» | Ingen i summen, «10 beste forfattere» som variant | Middels |
| ShanghaiRanking GRAS | 9 indikatorer (Q1, TJ, CNCI, IC, priser m.m.) | Hel (WoS/InCites) | Artikler 2020–2024, priser fra 1901 | Delvis (CNCI er størrelsesuavhengig) | Middels, bare som sammenligning |
| CWTS Leiden | Sitat- og samarbeidsindikatorer | Hel eller brøk (brøk foretrukket) | 4 år, flere overlappende perioder | Både størrelsesavhengig og -uavhengig | Høy som metodemodell, lav som datakilde |
| Handelsblatt/WiWo | Kvalitetsvektede artikler per forsker og fakultet | 1/n | 5 år, livsverk, under 40 | Sum og per professor | Høy for vektdebatten |
| Nature Index | Artikler i utvalgte tidsskrifter | Count (hel) og Share (brøk) | Kalenderår eller rullerende 12 mnd | Ingen | Lav |
| SCImago SIR | Sammensatt indikator (forskning, innovasjon, nett) | Størrelsesavhengige og -uavhengige | (ikke verifisert) 5 år | Begge typer | Lav |
| BYU Accounting | Artikler i 12 regnskapstidsskrifter | (ikke verifisert) | Siste 6 år, siste 12 år, alle siden 1990 | Ingen | Middels som fagfeltmodell |
| NPI (NO), JUFO (FI), BFI (DK) | Poeng per publikasjonskanal | Brøk | Årlig | Per årsverk bare i lokale analyser | Høy, dette er vår egen kontekst |

---

## 1. UT Dallas Top 100 Business School Research Rankings

Kilder:
- Metodeside: https://jsom.utdallas.edu/the-utd-top-100-business-school-research-rankings/ (verifisert; krever `curl -k` pga. sertifikatfeil)
- Verdensrangering: https://jsom.utdallas.edu/the-utd-top-100-business-school-research-rankings/worldRankings
- Per capita fra Colorado Boulder (uoffisiell): https://www.colorado.edu/business/news/top-news-business-education/UTD-per-capita-rankings

**Tellemetode (verifisert).**
- En artikkel med én forfatter gir tilknytningsskolen 1 poeng.
- Med flere forfattere får hver skole p/n, der p er antall forfattere fra skolen og n er totalt antall forfattere. Dette er brøktelling per forfatter.
- Hvis forfatteren oppgir m tilknytninger, får hver skole 1/(nm).
- Tilknytning registreres på publiseringstidspunktet.
- Forfatterposisjon spiller ingen rolle.
- Fra 15. juni 2017 gis full uttelling til universitetet når forfatteren i tillegg oppgir NBER og/eller CEPR. Før det fikk hver tilknytning 1/n.
- Fra 18. mars 2020 teller alle fagfellevurderte artikler i JIBS, ikke bare «Original Paper».
- Endringene gjelder bare framover. Eldre lister er ikke omregnet.

**Tidsskriftliste og vekter (verifisert).** 24 tidsskrifter, alle med vekt 1 (ingen vekting).

| Fagfelt | Tidsskrifter |
|---|---|
| Regnskap | The Accounting Review, Journal of Accounting and Economics, Journal of Accounting Research |
| Finans | Journal of Finance, Journal of Financial Economics, Review of Financial Studies |
| Informasjonssystemer | Information Systems Research, INFORMS Journal on Computing, MIS Quarterly |
| Markedsføring | Journal of Consumer Research, Journal of Marketing, Journal of Marketing Research, Marketing Science |
| Drift og analyse | Management Science, Operations Research, Journal of Operations Management, MSOM, Production and Operations Management |
| Organisasjon og strategi | Academy of Management Journal, Academy of Management Review, Administrative Science Quarterly, Organization Science, Journal of International Business Studies, Strategic Management Journal |

Databasen går tilbake til 1990. MSOM starter i 1999 og POM i 1992. Rene økonomitidsskrifter er ikke med.

**Tidsvindu (verifisert).**
- Hovedlisten er et rullerende 5-årsvindu. Siste utgave er 2021–2025, og arkivet går tilbake til 2000–2004.
- Spørringsverktøyet tillater valgfri kombinasjon av tidsskrifter og hvilken som helst periode fra 1990 til i dag.

**Normalisering og størrelse.**
- Ingen normalisering i hovedlisten (verifisert; se kritikken under).
- Menyen på siden har «Per Capita Analysis» (innholdet ikke lest). Colorado Boulder har laget uoffisielle per capita-lister. De bruker UTD-poeng delt på antall fast vitenskapelig ansatte fra skolens nettside våren 2018.
- Colorado påpeker selv en skjevhet. Hvis skolen har færre ansatte nå enn i perioden, hjelper det per capita-tallet, fordi de som har sluttet bidrar i telleren men ikke i nevneren.

**Presentasjon og interaktivitet (verifisert).**
- Fanene er Ranking Overview, North American Rankings, Worldwide Rankings, Rankings by Journal, Per Capita Analysis, Search by University, Search by Author, Search by Article (tittelfrase), Advanced Search og Collaboration.
- Rangering per tidsskriftkombinasjon og periode.
- Publikasjonsliste per skole og per forfatter.
- Feilrapportering via e-post og et eksplisitt forbehold om at tilknytningsdata kan være uklare.
- Endringslogg for metoden øverst på siden.
- Nedlasting er ikke omtalt. Colorado publiserer PDF-lister.

**Kjent kritikk.**
- Størrelsen på fakultetet er ikke justert for. Store skoler vinner (omtalt blant annet i https://poetsandquants.com/2011/06/02/does-the-world-need-another-b-school-ranking/).
- Bare 24 tidsskrifter, tungt vektet mot finans, regnskap, drift og organisasjon. Samfunnsøkonomi og mange anvendte felt som energi, helse og logistikk faller utenfor.
- Alle tidsskrifter har lik vekt. Et JF-bidrag teller likt som et i POM.
- Tilknytning på publiseringstidspunktet gjør at «hvem som har hvem nå» ikke fanges.
- NBER/CEPR-regelen (2017) viser at tilknytningsregler flytter plasseringer.
- Jeg fant ikke BI eller NHH i søkeresultatene, og sidens rangeringsdata lastes dynamisk. Plassering for norske skoler er derfor ikke verifisert.

**Lærdom for oss.** Klar og enkel brøkregel, tilknytning splittet likt, åpen endringslogg, søk på tidsskrift, periode, skole og forfatter. UTDs lister er derimot for smale til å bære en norsk rangering alene.

---

## 2. Tilburg University Top 100 Worldwide Economics Schools Research Ranking («EconTop»)

Kilder:
- Metode: https://rankings.tilburguniversity.edu/methodology (verifisert)
- Business: https://rankings.tilburguniversity.edu/public/1
- Economics: https://rankings.tilburguniversity.edu/public/2
- Business Economics: https://rankings.tilburguniversity.edu/public/3
- Sider for tidsskrifter og «Sandbox» på samme domene (menypunkter, ikke lest i detalj).

**Tellemetode (verifisert).**
- Hel telling: institusjonen får 1 poeng per artikkel, uavhengig av hvor mange forfattere eller hvor mange fra institusjonen.
- Flere forfattere fra samme institusjon gir fortsatt bare ett poeng.
- Ingen brøkdeling og ingen forfatterposisjon.
- Kilde er ISI Web of Knowledge. Bare dokumenttypene «article» og «proceedings paper» telles.
- Tilknytning er den som står på artikkelen.

**Tidsskriftliste og vekter (verifisert).**
- Databasen har 208 tidsskrifter i økonomi, økometri, finans, regnskap, strategi/organisasjon, ledelse, markedsføring, informasjonssystemer, drift og operasjonsanalyse.
- Standardrangeringene bruker en delmengde («top core and top journals») valgt av Tilburgs egne avdelinger.
- Vekt er 1,0 per tidsskrift i standardutgaven.
- I «Sandbox» kan brukeren velge egne tidsskrifter og vekter: standard, journal impact factor eller article influence score.

**Tidsvindu (verifisert).** Standard er 5 år (nå 2020–2024). Sandbox tillater egen periode.

**Normalisering.**
- Ingen (verifisert). Metodesiden sier at de bevisst ikke korrigerer for størrelsen på institusjonene fordi det skaper praktiske problemer.
- Tre separate lister: Business, Economics og Business Economics. Det gir en enkel fagfeltnormalisering ved at skolene sammenlignes innenfor sitt fagfelt.

**Presentasjon og interaktivitet (verifisert).**
- Top 100 per liste, «Limit» 10/50/100/200, nedlasting av listen og Sandbox.
- Sider for metode og tidsskriftliste.
- Kontaktadresse for feil og forbehold om at artiklenes tilknytning kan være unøyaktig.

**Sammenligningspunkter.**
- NHH står som nr. 79 i Economics 2020–2024 med score 84 (verifisert på side 4 av listen).
- BI er ikke blant de 100 beste i noen av de tre listene (jeg leste alle fire sidene for hver liste).
- «University of London» står som én enhet, så en rekke selvstendige høyskoler og kolleger er slått sammen. Ellers ligger University of London først i alle tre lister.

**Kjent kritikk.**
- Enhetsdefinisjonen (University of London som en enhet, institusjoner med flere campuser og navnevarianter).
- Hel telling og ingen størrelsesjustering gir store miljøer fordel.
- WoS-avhengighet og delmengde-liste som reflekterer Tilburgs egne preferanser.
- Tilknytning på publiseringstidspunktet.

**Lærdom for oss.** Sandbox-modellen, der brukeren velger tidsvindu, tidsskrifter og vektingsmåte, er den mest relevante interaktive ideen. Hel telling kan vises som et «rekkevidde»-mål ved siden av brøktelling. Egne lister per fagfelt gir mer rettferdige sammenligninger.

---

## 3. RePEc/IDEAS-rangeringer (institusjoner og land, inkludert Norge)

Kilder:
- Oversikt: https://ideas.repec.org/top/ (verifisert)
- Norge, april 2026: https://ideas.repec.org/top/old/2604/top.norway.html (verifisert)
- Land, april 2026: https://ideas.repec.org/top/old/2604/top.country.all.html (verifisert)
- Institusjoner, hele verden: https://ideas.repec.org/top/top.inst.all.html
- Metode: Zimmermann, «Academic Rankings with RePEc», Federal Reserve Bank of St. Louis WP 2012-023, http://research.stlouisfed.org/wp/2012/2012-023.pdf (lest via https://lists.ime.usp.br/archives/abe/attachments/20150930/119bf9ce/attachment-0002.pdf; publisert i Econometrics, 2013)

**Hva det måler.** Alt som er katalogisert i RePEc: fagartikler, arbeidsnotater og bøker. For institusjoner telles bare enheter i EDIRC som er oppgitt som tilknytning av registrerte forfattere. Dette er et utvalg av forskning i økonomi og finans.

**Tellemetode (verifisert i metodenotatet).**
- Forfatterne registrerer seg selv og sine verk.
- Institusjonens score per kriterium er summen av tilknyttede forfatteres scorer. Unntaket er h-indeksen, som er definert som antall forfattere med h-indeks minst h (Schubert).
- Hvert kriterium rangeres separat, og rangene aggregeres med harmonisk gjennomsnitt, dempet med en konstant. Kriteriene er 6 om antall verk, 15 om sitater (uten selvsitater), 6 om sidetall og 4 om popularitet i RePEc-tjenestene (søkeresultatet siterer artikkelen, ikke verifisert i primærtekst).
- Sitater er CitEc-parsede.
- Antall forfatterandeler vises (NHH 114,92 forfatterandeler, BI 55,36 i april 2026).
- Forfatterposisjon spiller ingen rolle.

**Flere tilknytninger (verifisert).**
- Før desember 2008 telte hver tilknytning fullt, noe som ga høy rangering til institusjoner med mange «courtesy»-stillinger.
- Fra januar 2009 fikk tilknytningene en formel der 0,5 fordeles etter antall registrerte forfattere ved hver institusjon og 0,5 går til hovedtilknytningen (nettstedets domene mot e-postadressen).
- Siden februar 2012 setter forfatteren selv andelene. Endring av tilknytning krever at andelene oppgis.
- Land og regioner bruker samme logikk. Forfatterens score splittes mellom regioner etter andelene.

**Tidsvindu.**
- Hovedlisten bruker hele publiseringshistorikken.
- Siden har varianter for siste 10 år og «10 beste forfattere» per institusjon (verifisert).
- Rangeringen oppdateres månedlig (3.–5. dag), sitater daglig. Arkiv per måned ligger under `/top/old/ÅÅMM/` (verifisert), noe som er nyttig for tidsserier.

**Normalisering og størrelse.**
- Summen favoriserer store miljøer. Notatet argumenterer eksplisitt for sum framfor gjennomsnitt, fordi gjennomsnitt gir insentiv til ikke å registrere svakere forfattere (verifisert).
- «10 beste forfattere»-varianten er en størrelsesbegrensning som hindrer at antall ansatte alene avgjør.
- Regionrangering krever minst fem forfattere eller fem institusjoner (verifisert), som beskyttelse mot små utvalg (Niue og Nauru nevnes som eksempel på feilplasseringer).
- Underenheter beregnes selvstendig, men teller ikke i overordnede (verifisert).

**Norge, april 2026 (verifisert).**

| Plass | Institusjon | Score | Forfattere |
|---|---|---|---|
| 1 | NHH | 1,00 | 131 |
| 2 | UiO Økonomisk institutt | 2,37 | 45 |
| 3 | BI Handelshøyskolen | 2,49 | 58 |
| 4 | UiO Frischsenteret | 4,79 | 21 |
| 5 | NTNU Fakultet for økonomi | 5,10 | 33 |
| 6 | Statistisk sentralbyrå | 6,63 | 43 |
| 7 | UiS Handelshøgskolen | 6,65 | 23 |
| 8 | Norges Bank | 7,96 | 26 |
| 9 | UiB Økonomisk institutt | 8,28 | 25 |
| 10 | NMBU Økonomi | 9,43 | 18 |
| 12 | OsloMet Handelshøyskolen | 11,96 | 18 |

Norge har 58 institusjoner og 542 registrerte medlemmer (509,62 forfatterandeler). Landsrangeringen (hele historikken, april 2026): Sverige 18 (18,88), Norge 27 (28,67), Danmark 31 (30,87), Finland 58 (55,36). De tre høyest rangerte økonomene er Salvanes, Canova og Tungodden (alle år).

**Presentasjon og interaktivitet.** Egne sider for institusjoner, forfattere, land, USA-delstater, fagfelt, institusjonstype og «graduate education». Forfatterlister per institusjon, kriterievise rangeringer og søk. Data er åpne og kan hentes via RePEc-tjenester (ikke verifisert).

**Kjent kritikk.**
- Utvalget er selvregistrert. Manglende registrering gir lav rangering, så skjevhet mot miljøer som er aktive i RePEc.
- Summen favoriserer store institusjoner, og institusjonsenhetene (EDIRC) er ulikt avgrenset, slik at fagmiljøer kan stå med og uten overordnet enhet.
- Bruker nåværende tilknytning, ikke tilknytning ved publisering. Det er en fordel for aktualitet, men skjuler hvem som faktisk skapte resultatene.
- Arbeidsnotater teller med, noe som favoriserer økonomi og finans framfor andre økonomisk-administrative fag.
- Ingen kvalitetsliste for tidsskrifter utover sitater.
- Harmonisk gjennomsnitt belønner dem som er svært gode på enkelte kriterier.

**Lærdom for oss.** Den virkelig overførbare ideen er «10 beste forfattere» som beskyttelse mot at én stjerne eller at størrelse avgjør. Det samme gjelder månedlige arkivsnapshots, minste utvalg for visning og andelsfordeling ved flere tilknytninger. NHH, BI og NMBU kan sammenlignes mot disse norske tallene som en uavhengig kontroll.

---

## 4. ShanghaiRanking Global Ranking of Academic Subjects (GRAS)

Kilder:
- Metode: https://www.shanghairanking.com/methodology/gras/2025 (verifisert, men vekttabellen er tom)
- BI: https://www.shanghairanking.com/universities/bi-norwegian-business-school (verifisert)
- API brukt i prosjektet: `https://www.shanghairanking.com/api/pub/v1/gras/rank?version=<år>&subj_code=AS0501|AS0509|AS0510|AS0511|AS0513` (se `data/rangering/skoler-notat.md`)
- Kritikk: Herrera-Viedma, Arroyo-Machado og Torres-Salinas, «Losing objectivity: The questionable use of surveys in the Global Ranking of Academic Subjects», Quantitative Science Studies 2024, https://digibug.ugr.es/handle/10481/93667

**Indikatorer (verifisert).** Ni indikatorer i fem kategorier:

| Kategori | Indikatorer |
|---|---|
| World-Class Faculty | Laureate, Highly Cited Researchers (HCR), Chief Editors, Leadership |
| World-Class Output | Top Journal Papers (TJ), International Academic Awards |
| Høy kvalitet | Q1 Journal Papers |
| Påvirkning | Category Normalized Citation Impact (CNCI) |
| Internasjonalt samarbeid | International Collaborated Papers (IC) |

Vektene er forskjellige per fag, men tabellen er tom på siden (uleselig).

**Tellemetode.** Hel telling i Web of Science/InCites (Q1, CNCI, IC). TJ-artikler og priser hentes fra ShanghaiRankings «Academic Excellence Survey». 175 tidsskrifter fra undersøkelsen brukes på tvers av 49 fag (verifisert). Det er ikke oppgitt noen brøkdeling eller forfatterposisjon.

**Tidsvindu (verifisert, 2025-utgaven).** Artikler 2020–2024. Priser 1901–2024 med fallende vekt per tiår. HCR-liste fra januar 2025.

**Normalisering og størrelse.**
- Hver indikator regnes som prosent av beste institusjon, og kvadratroten av prosenten multipliseres med vekten (verifisert). Kvadratroten demper forskjellene i toppen og løfter midten.
- Publiseringsterskel per fag finnes, men er ikke oppgitt (verifisert at den nevnes, tallene mangler).
- Q1-, TJ- og IC-tellingene er størrelsesavhengige. CNCI er størrelsesuavhengig. Små enheter slipper derfor ikke unna at volum teller mye.

**Presentasjon og interaktivitet.**
- Faste rangbånd: nummerert opp til 50, deretter bånd (51–75, 76–100, 101–150, 151–200, 201–300 og så videre) uten poengsum for dem som ikke er i toppen.
- Institusjonssider viser alle rangerte fag. Filter på fag og land.
- Ingen valgfrie tidsvinduer eller vekter.

**Norske plasseringer, 2026-utgaven.**

| Fag | BI | NHH |
|---|---|---|
| Business Administration | 50 | 301–400 |
| Finance | 101–150 | 151–200 |
| Management | 151–200 | 301–400 |
| Economics | 201–300 | 101–150 |

BI-tallene er lest på siden. NHH-tallene kommer fra API-filene som ble hentet tidligere i prosjektet (fagkode AS0509 = Business Administration, AS0510 = Finance, AS0511 = Management, AS0501 = Economics, utledet fra BI-siden).

**Kjent kritikk.**
- Surveyene som definerer TJ og Award er den sentrale svakheten. Artikkelen i QSS (2024) påpeker anglosaksisk skjevhet i deltakere og tidsskriftvalg og mulige interessekonflikter ved utvelgelsen.
- Lite transparent. Vekter og terskler er ikke offentlige per fag.
- Rangerer hele institusjoner, ikke handelshøyskoler (BI og NHH er egne institusjoner, men NMBU, UiA og NTNU er universiteter).
- Båndrangering gjør små endringer usynlige.
- Q1 er et mål fra tidsskriftenes sitatprofil, ikke fagfellenes vurdering.

**Lærdom for oss.** Rangbånd er et ærlig uttrykk for usikkerhet. Kvadratrot-normalisering mot beste enhet er et alternativ til rangering på rå score, men fjerner reelle forskjeller. Vi bør ikke bruke en undersøkelse til å definere tidsskriftlister.

---

## 5. CWTS Leiden Ranking

Kilder:
- Indikatorer (Open Edition): https://open.leidenranking.com/information/indicators (verifisert)
- Universiteter: https://open.leidenranking.com/information/universities (verifisert)
- Fagfelt: https://open.leidenranking.com/information/fields (verifisert)
- Hovedside: https://leidenranking.com/information/indicators (to utgaver: tradisjonell på Web of Science og Open Edition på OpenAlex)

**Datagrunnlag (verifisert).**
- Open Edition 2025 bruker OpenAlex og dekker over 2 800 universiteter. Den tradisjonelle utgaven bruker Web of Science og dekker over 1 500.
- «Core publications» er engelskspråklige artikler i internasjonale kjerne-tidsskrifter som egner seg for sitatanalyse. Alt annet (nasjonale og regionale kanaler) er «non-core».
- Open Edition krever minst 1 500 publikasjoner i 2020–2023 (verifisert). Terskelen i den tradisjonelle utgaven er ikke verifisert.

**Tellemetode (verifisert).**
- Hel telling eller brøktelling. Brøktelling er foretrukket for sitatindikatorene. Eksempel: av fem forfattere er to fra universitetet, da blir vekten 2/5 = 0,4. Samarbeids- og open access-indikatorene er alltid hele tellinger.
- Brøktelling gir mer riktig fagfeltnormalisering (Waltman og Van Eck 2015).

**Indikatorer og normalisering (verifisert).**
- Absolutte: P, P(≥10 sitater), P(top 1 %), P(top 10 %), P(top 50 %), TCS, TNCS.
- Relative: PP(top 10 %), MNCS, MCS og så videre.
- Feltnormalisering via 4 521 algoritmisk definerte mikrofelt (klyngedannelse på sitasjonsrelasjoner), som slås sammen til fem hovedfelt. Økonomi og ledelse ligger i hovedfeltet «social sciences and humanities» (hvordan økonomi og ledelse plasseres er ikke verifisert).
- Selvsitater utelates.

**Tidsvindu (verifisert).** Fire år (2020–2023 i siste utgave) med sitater til utgangen av året etter. Overlappende perioder tilbake til 2006–2009 for tidsserier.

**Størrelse (verifisert).** Hvert mål finnes i en størrelsesavhengig og en størrelsesuavhengig variant. Leiden advarer eksplisitt om at størrelsesavhengige mål favoriserer store universiteter og at størrelsesuavhengige mål gjør at også små kan komme høyt. Valget av minstegrense (1 500) er en måte å unngå ustabile prosenter på.

**Presentasjon og interaktivitet (verifisert).**
- Listevisning, diagramvisning og kartvisning.
- Valg av fagfelt, periode, indikator og tellemetode.
- Valg av om bare kjernepublikasjoner eller alle skal telle.
- 95 % stabilitetsintervall (bootstrap) vises for hvert mål, med et eksempel på hvordan det skal leses.
- Egen side om «responsible use», datagrunnlag og oppdateringer.

**Kjent kritikk.**
- Dekningen i samfunnsvitenskap og handelsfag er svak i Web of Science og delvis i OpenAlex. Forskning på business og management mangler ofte i kjernelisten (https://arxiv.org/pdf/1706.02119 og studien «Evaluating a department's research: Testing the Leiden methodology in business and management»).
- Eksklusivt vitenskapelig fokus. Rangeringen sier ingenting om undervisning eller samfunnsnytte.
- Ingen norsk handelshøyskole står som egen enhet. BI og NHH kan være med som institusjoner, men dette sier lite om handelsfag.

**Lærdom for oss.** Leiden er den beste modellen for statistisk redelighet. Det gjelder valg mellom størrelsesavhengig og -uavhengig, brøktelling, minstegrense og stabilitetsintervaller. Vi bør kopiere intervallene (bootstrap over artiklene), minstegrensen og fordelingen mellom «kjerne» og «alt».

---

## 6. Handelsblatt-rangeringene (BWL og VWL), nå også WirtschaftsWoche (BWL)

Kilder:
- Haucap, Thomas, Wohlrabe (DICE Discussion Paper 277, 2017), https://www.graduiertenzentrum-medizin.hhu.de/fileadmin/redaktion/Fakultaeten/Wirtschaftswissenschaftliche_Fakultaet/DICE/Discussion_Paper/277_Haucap_Thomas_Wohlrabe.pdf (verifisert)
- Dilger, «Soll man das Handelsblatt-Ranking BWL boykottieren?», Beiträge zur Hochschulforschung 2/2013, https://www.bzh.bayern.de/fileadmin/news_import/2-2013-Dilger.pdf (verifisert)
- Sturm og Ursprung, «The Handelsblatt Rankings 2.0», German Economic Review 2017, https://www.degruyterbrill.com/document/doi/10.1111/geer.12145/pdf (bare sammendrag lest via https://kops.uni-konstanz.de/entities/publication/c7a70e33-4f74-40aa-8080-c1a142cae735)
- Butz og Wohlrabe, ifo WP 2016-212 om tidsskriftvektene (uleselig)
- WiWo-utgaven: pressemeldinger, f.eks. https://www.leuphana.de/universitaet/pressemitteilungen/pressemitteilungen-ansicht/2022/12/12/leuphana-unter-den-forschungsstaerksten-universitaeten-in-bwl.html og https://www.uni-due.de/2019-01-25-wiwo-bwl-ranking
- VHB Rating 2024: https://vhbonline.org/en/service/vhb-rating-2024
- Dataportal: Forschungsmonitoring (KOF ETH Zürich og DICE Düsseldorf), https://www.forschungsmonitoring.org

**Rangeringene.** Handelsblatt rangerte økonomer fra 2007 og BWL-forskere fra 2009 (utgaver 2009, 2012, 2014/15). Etter det ser BWL-rangeringen ut til å ha flyttet til WirtschaftsWoche. Siste utgave jeg fant bygger på rundt 860 BWL-tidsskrifter for 2020–2024 og dekker 3 723 forskere i Tyskland, Østerrike og Sveits (sekundærkilder, ikke verifisert). VWL-versjonens nåværende utgiver er ikke avklart.

**Tellemetode (verifisert).**
- Hver artikkel gir hver forfatter p/n, der p er tidsskriftvekten og n antall forfattere.
- Før 2012 var forfatterbrøken 2/(n+1) i BWL-rangeringen fra 2009. Fra 2012 er den 1/n (Dilger siterer Schläpfer/Storbeck). Det flyttet mange forskere over 100 plasser.
- Kommentarer teller halvt, bokanmeldelser null, og artikkellengde ignoreres. Bøker og artikler i tidsskrifter som ikke står på listen teller ikke.
- Forfatterposisjon spiller ingen rolle.

**Tidsskriftliste og vekter (verifisert).** For 2015 var 1 632 tidsskrifter delt i sju kvalitetsklasser. Vekten og antall tidsskrifter per klasse:

| Klasse | Vekt | Tidsskrifter |
|---|---|---|
| A+ | 1,00 | 10 |
| A | 0,60 | 24 |
| B+ | 0,30 | 46 |
| B | 0,15 | 75 |
| C+ | 0,10 | 110 |
| C | 0,10 | 165 |
| D | 0,05 | 1 202 |

Opprinnelsen var Combes og Linnemer (2010), seks grupper med vekt 1,00, 0,67, 0,50, 0,33, 0,17 og 0,08, justert av Handelsblatt. BWL-rangeringen 2012 kombinerte ERIM-listen, SSCI-impact factor og VHB-JOURQUAL 2.1. Fra 2017 er listen oppdatert, og Sturm og Ursprung viser at rangeringen er robust mot hvor konveks vektingen er (fra sammendraget, ikke verifisert i hovedteksten). VHB Rating 2024 (1 575 tidsskrifter, 18 fagområder, over 1 100 stemmeberettigede) har erstattet JOURQUAL 3, men har ingen samlet liste (verifisert i søkeresultatene).

**Tidsvindu.** Tre lister: livsverk, siste fem år og forskere under 40. Fakultetsrangeringen i 2012 summerte poeng siden 2000 (Dilger).

**Normalisering og størrelse (verifisert).**
- Fakultetsranking er sum av poeng, som favoriserer store fakulteter (St. Gallen med 44 professorer og 118 poeng på topp i 2012). «Poeng per professor» finnes også.
- Utvalget (over 3 000 forskere) er langt større enn professorgruppen, så per professor-tallene er ikke sammenlignbare med antall professorer.
- Forskere som boikottet, ble utelatt fra personlistene, men poengene deres ble likevel med i fakultetsummen i 2012.

**Presentasjon.** Trykte lister og pressemeldinger. Dataportalen Forschungsmonitoring lar brukere hente rådata for forskningsformål og sette sammen egne lister (Dilger: «Wissenschaftler können die Rohdaten für Forschungszwecke nutzen»).

**Kjent kritikk (verifisert).**
- Parametrene er satt ad hoc og ikke vitenskapelig underbygget (sammenfattet i søket mot Business Research-artikkelen; Butz og Wohlrabe 2016 om vilkårlig vekting).
- Boikott i 2012: 309 underskrivere innen 7. september 2012 (Kieser og Osterloh). Argumentene var ensidig fokus på publikasjoner, snittvurdering av tidsskrifter som overføres til hver artikkel, manglende nøytralitet mellom fagfelt, feil insentiver og manglende transparens.
- Fagfeltnøytralitet: i 2009 kom ingen fra skatt eller regnskap blant de 50 beste.
- Haucap m.fl. (2017): tidsskriftvektene er en dårlig indikator for faktisk innflytelse. Korrelasjonen mellom Handelsblatt-score og sitater er 0,375, mot 0,461 for rent antall publikasjoner. Med antall publikasjoner i modellen forsvinner score-effekten.
- Hofmeister og Ursprung (2008): den opprinnelige metoden ga skjeve produktivitetsestimater. Blant de 25 beste falt rangkorrelasjonen under 50 %, og 20 % falt ut av gruppen (sekundærkilde).

**Lærdom for oss.** Dette er den viktigste kilden for vektdiskusjonen. Konveks vekting (1,00 → 0,05) er vanlig, men kan ikke forsvares som «riktig». Rangeringene bør testes mot alternative vekter. Forfatterbrøken 1/n er en klar standard, og at en endring fra 2/(n+1) til 1/n flyttet rangeringer, viser at vi må dokumentere og låse regelen. Rangering av enkeltpersoner utløser boikott. Vi rangerer institusjoner.

---

## 7. Nature Index

Kilder:
- Guide: https://www.nature.com/nature-index/research-leaders/2025/a-guide-to-the-nature-index.html (verifisert)
- Bruk: https://www.nature.com/nature-index/using-the-index (verifisert)
- 2026-utvidelsen: https://partnerships.nature.com/resources/blog/nature-index-2026-research-performance-measurement/ og https://www.nature.com/nature-index/research-leaders/2026 (verifisert)

**Tellemetode (verifisert).**
- **Count:** 1 per artikkel med minst én forfatter fra institusjonen (hel telling).
- **Share:** brøk. Hver artikkel har 1 poeng, delt likt mellom alle forfattere (10 forfattere gir 0,1 hver). Forfatter med flere tilknytninger splitter sin andel likt. Institusjonens Share er summen av forfatternes andeler.
- **Adjusted Share:** Share justert for årlig variasjon i antall artikler i Index (prosentendring mot et basisår).
- Forfatterposisjon spiller ingen rolle.

**Tidsskriftliste (verifisert).** 2026-utgaven følger 177 tidsskrifter og én konferanse i sju fagområder (84 % utgitt utenfor Springer Nature). Utvidelsen tok med anvendte fag og samfunnsvitenskap, med 17 nye anvendte tidsskrifter, én konferanse og 15 samfunnsvitenskapelige tidsskrifter (ca. 2 000 artikler), valgt etter en undersøkelse av over 4 000 forskere. American Economic Review, Econometrica og Review of Economic Studies er nå med (søkeresultater, ikke fullstendig liste verifisert). Artikler får fagområde individuelt (ikke etter tidsskriftets hovedfelt).

**Tidsvindu (verifisert).** «Research Leaders 2026» er kalenderåret 2025. Den løpende «Current Index» bruker rullerende 12 måneder.

**Normalisering og størrelse.** Ingen per-ansatt-justering og ingen fagfeltnormalisering utover at man kan filtrere på fagområde. Share er størrelsesavhengig. (Jeg fant ingen per capita-funksjon.)

**Presentasjon og interaktivitet (verifisert).** Filtre på sted, sektor og fagområde, sortering på Count eller Share, institusjonsprofiler med tidsskrift- og artikkelnivå, sammenligning av flere institusjoner og land, samarbeidsscore mellom institusjoner (CS = summen av begges Share på felles artikler) og eksport av tabeller.

**Kjent kritikk.** Lite tidsskriftutvalg som er styrt av enkelte utgivere, opprinnelig naturvitenskap. Størrelsesavhengig. For business og økonomi er dekningen helt ny og sporadisk (15 tidsskrifter på tvers av samfunnsvitenskapene), så den er ikke egnet som rangeringskilde for handelshøyskoler.

**Lærdom for oss.** Count og Share ved siden av hverandre (hel mot brøk), Adjusted Share for å tåle at årsvolumet varierer, og samarbeidsscore mellom enheter er pent presentert.

---

## 8. SCImago Institutions Rankings (SIR)

Kilder:
- Metode: https://www.scimagoir.com/methodology.php (uleselig, Cloudflare)
- Sekundære gjengivelser: https://rankings.swu.ac.th/scimago, https://knoema.com/atlas/sources/SCIMAGOIR

**Innhold (ikke verifisert i primærkilden).**
- Sammensatt indikator: forskning 50 %, innovasjon 30 %, samfunn 20 % (nett, medieomtale, politikk), normalisert til skala 0–100.
- Forskning omfatter blant annet normalisert sitatvirkning (NI), excellence med ledelse (EwL), output, Q1, internasjonalt samarbeid, open access og «scientific talent pool».
- Innovasjon: patenter, innovativ kunnskap og teknologivirkning. Samfunn: Media Mentions (erstattet Altmetrics i 2026-utgaven), Web Size, Authority Score, SDG, kvinnelig talentbasseng og politikkvirkning (Overton).
- Både størrelsesavhengige og -uavhengige indikatorer. Datakilde er Scopus.
- Presentasjonen lar brukeren sammenligne opp til seks institusjoner og viser fordelinger per sektor.

**Tellemetode, tidsskriftvekter og vindu.** Ikke verifisert. SIR bruker Scopus-data og Scopus-kvartiler, ikke egne tidsskriftlister.

**Kjent kritikk (ikke verifisert).** Blandingen av forskning, patenter og nettstørrelse gjør at en handelshøyskole straffes for ting som ikke er forskning. Komposittrangeringen er vanskelig å tolke.

**Lærdom for oss.** Funksjonen «sammenlign inntil seks enheter» er enkel å kopiere. Vi bør ikke blande forskning og samfunnsmål i samme tall.

---

## 9. Brigham Young University Accounting Research Rankings

Kilder:
- Rangering: https://byuaccounting.net/rankings (uleselig, bot-sperret)
- Metodeartikkel i Journal of Information Systems 2019, 33(2): https://scholarsarchive.byu.edu/facpub/8275 (bare sammendrag)
- Presseomtale: https://www.hawaii.edu/news/2025/10/30/accounting-research-rankings/ og https://marriott.byu.edu/news/article?id=737

**Innhold (sekundærkilder).**
- 12 regnskapstidsskrifter: Accounting, Organizations and Society; Auditing: A Journal of Practice & Theory; Behavioral Research in Accounting; Contemporary Accounting Research; Journal of Accounting and Economics; Journal of Information Systems; Journal of Accounting Research; Journal of Management Accounting Research; Accounting Horizons; Journal of the American Taxation Association; Review of Accounting Studies; The Accounting Review.
- Artiklene klassifiseres etter tema (revisjon, finansiell, intern, regnskapsinformasjonssystemer, skatt, andre) og metode (analytisk, arkivbasert, eksperimentell, andre).
- Tilknytning er **nåværende** tilknytning, ikke på publiseringstidspunktet.
- Perioder: siste 6 år, siste 12 år og alt siden 1990.
- Tellemåte (hel eller brøk): ikke verifisert.

**Størrelse og normalisering.** Ingen kjent per-ansatt-justering. Rangering per tema og metode fungerer som fagfeltnormalisering.

**Kjent kritikk.** Bare regnskap. Valg av 12 tidsskrifter er omdiskutert (listen avviker fra UTD sine tre og fra FT50). Nåværende tilknytning fanger mobilitet, men gir hver skole poeng for arbeid utført andre steder.

**Lærdom for oss.** Fordeling etter tema og metode og tre tidsvinduer samtidig (6, 12, alle) er en god ide for en fagfeltvisning. Valget om nåværende tilknytning bør vi diskutere, siden NVA gir tilknytning ved publisering.

---

## 10. Nordiske og europeiske varianter

### 10.1 Norge: Norsk publiseringsindikator (NPI) og NVA

Kilder: https://www.hvl.no/en/library/research-and-publish/nva/publication-channels-and-publication-points/ (verifisert), https://cristin.no/english/resources/reporting-instructions/appendix/calculation-of-points.html (uleselig, 404), sammendrag fra søk, Sivertsen, https://doi.org/10.2478/jdis-2018-0023.

- **Nivåer:** nivå 1 (80 % av publiseringen) og nivå 2 (de ledende kanalene, høyst 20 % av publiseringen innen fagfeltet). Nivå X ble innført i 2021 for kanaler med tvilsom kvalitet (verifisert). Nivå 2 settes av faglige paneler i 84 fagområder.
- **Poeng (søkeresultat):** artikkel i tidsskrift gir 1 poeng på nivå 1 og 3 på nivå 2. Kapitler og bøker har egne poeng (fra hukommelsen: 0,7/1 og 5/8, ikke verifisert).
- **Brøkdeling:** forfatterandeler per institusjon. Institusjonens andel av forfatterandelene, **kvadratrot** av denne, multiplisert med poengene for nivå og type, og **×1,3** ved utenlandsk medforfatter (søkeresultat, siterer cristin.no).
- **Flere tilknytninger:** forfatterens andel deles mellom institusjonene.
- **Størrelse:** poeng er absolutte. Per årsverk gjøres lokalt, f.eks. i DBH.
- **Kritikk:** nivå 2-kvoten er et nasjonalt fagfeltmål. Kvadratroten gjør at poeng ikke er additive, slik at to institusjoner til sammen får mer enn hele artikkelen verdt. Tidsskriftnivå brukes på artikkelen uavhengig av kvalitet. 1,3-bonus gir samarbeidsinsentiv. Nivå 2 ser ikke alltid likt ut for økonomisk-administrative fag og for økonomi.
- **BI** viser selv til ABS-rangeringen (3, 4, 4*) i tillegg til NPI (https://www.bi.no/en/about-bi/accreditation-and-ranking/rankings/).

### 10.2 Danmark: Den bibliometriske forskningsindikatoren (BFI), nedlagt

Kilder: https://medarbejdere.au.dk/en/pure/show/artikel/nedlukning-af-bfi, https://www.aau.dk/development-of-new-research-indicator-at-aalborg-university-n42982, https://www.tbrp.aau.dk/digitalAssets/1067/1067580_the_danish_bibliometric_research_indicator.pdf (søkeresultater, ikke lest i detalj).

- To nivåer, brøkdeling per forfatter med minst 10 % av poengene til hver basisenhet, 1,25 i bonus for samarbeid mellom universiteter (søkeresultat).
- Nedlagt desember 2021. Aalborg har bygd en ny intern indikator, så Danmark har ikke lenger en felles poengmodell.

### 10.3 Finland: JUFO (Julkaisufoorumi)

Kilder: https://julkaisufoorumi.fi/en/publication-forum, selvevaluering 2021 https://julkaisufoorumi.fi/sites/default/files/2021-03/Publication%20Forum%20self-evaluation%20report%202021_0.pdf (verifisert).

- Fire nivåer, 0–3, vurdert av 250 eksperter i 23 paneler. Nivå 2 kan utgjøre høyst 15 % og nivå 3 høyst 5 % av samlet publiseringsvolum (verifisert).
- Poeng i finansieringsmodellen (søkeresultat): artikkel 0,1 / 1 / 3 / 4 for nivå 0 / 1 / 2 / 3, monografi fire ganger så mye. 14 % av universitetenes basisfinansiering baseres på publikasjoner og JUFO (2021–2024).
- Selvevalueringen er ledet av Jaakko Aspara (Hanken), altså fra en handelshøyskole. Den viser at finske universiteter har større andel av publikasjonene på nivå 2 og 3 enn verden, noe som reiser spørsmål om nasjonal skjevhet. Panelene bestemmer selv hvor mye de vekter ulike sitatindikatorer.
- Poeng per akademisk ansatt varierer mellom fagfelt.

### 10.4 Sverige

Det finnes ingen nasjonal poengmodell etter norsk mønster. Den norske modellen brukes lokalt ved flere svenske universiteter (https://new.eludamos.org/index.php/nopos/article/download/6376/6379/24568, søkeresultat). Den nasjonale fordelingen bygger på andre mål, men dette er ikke verifisert.

### 10.5 Tyskspråklig område og Nederland

Handelsblatt/WiWo og VHB Rating (avsnitt 6) og Tilburgs EconTop (avsnitt 2). Erasmus' ERIM-liste brukes i Handelsblatt 2012.

---

## 11. Hvordan kombinere nivåsystemet (NVA) med AJG/ABDC på en forsvarlig måte

### 11.1 Hva listene egentlig sier

| System | Nivåer | Omfang | Fagfeltkoder | Hvordan fastsatt |
|---|---|---|---|---|
| NVI/NPI | 0, X, 1, 2 | Alle fag, ca. 26 000 nivå 1 og 2 200 nivå 2 (2021) | Panelnivå (84 felt) | Faglige paneler, kvote på 20 % nivå 2 per felt |
| AJG 2024 (ABS) | 1, 2, 3, 4, 4* | 1 822 tidsskrifter | Ja (felt per tidsskrift, ikke verifisert i primærkilde) | Fagfellevurdering informert av sitatmål (https://charteredabs.org/insights/news/academic-journal-guide-2024-available-now) |
| ABDC JQL 2022 | A*, A, B, C | 2 680 tidsskrifter: A* 7,4 %, A 24,4 %, B 31,9 %, C 36,3 % | FoR-koder | Fagpaneler, https://abdc.edu.au/2022-abdc-journal-quality-list-released (ny gjennomgang i 2025) |
| FT50 / UTD24 | Ja/nei | 50 og 24 tidsskrifter | Delvis | Utvalg av tidsskrifter |

**Hovedpoeng.** Nivå 2 er definert etter kvote i hvert fagfelt, mens AJG/ABDC er definert etter kvalitet. Nivå 2 på 20 % av publiseringen er en bred terskel, og i økonomisk-administrative fag samsvarer den omtrent med AJG 3 og oppover og ABDC A og A* (dette er min vurdering, ikke dokumentert). FT50, UTD24 og AJG 4* ligger langt over den. Ulik gruppestørrelse er den viktigste grunnen til at man ikke bare kan summere eller ta snitt.

### 11.2 Dekning

AJG og ABDC dekker bare deler av det norske handelshøyskoler publiserer. Anvendte felt som energi, maritim logistikk, helseøkonomi og landbruksøkonomi er svakt dekket. Uten kobling får artikkelen ingen listepoeng, og det betyr ikke at den er dårlig. Vi bør derfor:

- vise **dekningsgrad** per enhet (andel av brøktellede nivå 1- og 2-artikler som lar seg koble mot AJG/ABDC),
- aldri sette «ikke funnet» til null i en samlet score. Nivå fra NVI er gulvet.

### 11.3 Foreslått regel: to lag, ikke én sum

1. **Basislag (NVI):** alle fagfellevurderte artikler får vekt etter NVI-nivå (nivå 1 = 1, nivå 2 = 3). Dette er uavhengig av AJG/ABDC, dekker alle fag og kan avstemmes mot DBH-poengene.
2. **Kvalitetslag (lister):** et felles kvalitetsløft for artikler som er koblet mot AJG/ABDC/FT50/UTD24, for eksempel vekter som gjelder i stedet for (ikke i tillegg til) NVI-vekten når de er høyere.

Å legge sammen NVI-poeng og listepoeng på samme artikkel gir dobbelttelling. Med regelen «maks av de to» gjør vi det ikke.

**Forslag til felles klasser (utgangspunkt, må kalibreres på NVA 2020–2024):**

| Klasse | Kriterium | Forslag til vekt |
|---|---|---|
| T (topp) | FT50, UTD24 eller AJG 4* | 10 |
| A | AJG 4 eller ABDC A* | 6 |
| B | AJG 3 eller ABDC A | 3 (tilsvarer NVI nivå 2) |
| C | AJG 2 eller ABDC B | 2 |
| D | AJG 1 eller ABDC C | 1 (tilsvarer NVI nivå 1) |
| Bare NVI | Ikke koblet | 1 eller 3 etter nivå |

Hvis AJG og ABDC er uenige, bør vi velge AJG som hovedkilde og bruke ABDC kun der AJG mangler. Begge verdiene vises i detaljene. Uenighet er i seg selv et funn som skal rapporteres, ikke jevnes ut.

Vektene er et valg, ikke et faktum. Handelsblatt bruker 1,00 til 0,05 (faktor 20), NPI bare 3 (faktor 3), og Tilburg 1 for alle. Haucap m.fl. viser at vektingen forklarer innflytelse (sitater) dårligere enn rent antall. Derfor bør vi:

- vise resultatet under flere vekter (lineær, NPI, Handelsblatt-lignende) og rapportere hvor stabil rangeringen er (rangkorrelasjon og hvor mange enheter som bytter plass),
- velge hovedvekter etter fagfelles aksept og forklare dem, ikke etter hva som gir fint resultat.

### 11.4 Brøkdeling

- Hovedregel: **1/n per forfatter** (UTD, Nature Index, Handelsblatt etter 2012, Leiden). NVA gir tilknytning per bidragsyter. En forfatter med flere tilknytninger deler andelen likt (UTD 1/(nm), Nature Index). RePEc lar forfatteren selv sette andeler, noe NVA ikke gir.
- Følsomhetsberegning med **NPI-regelen** (kvadratrot av institusjonens forfatterandel, ×1,3 ved utenlandsk medforfatter), fordi DBH-tallene bruker den. Avstem gjerne vår omregning mot DBH-poengene som kontroll.
- **Hel telling** (Tilburg, Nature Index Count) vises som tilleggstall («rekkevidde»), ikke i hovedindikatoren.
- **Forfatterposisjon** (første/siste/korresponderende) brukes av ingen av rangeringene jeg gikk gjennom. Vi lar den være, men det er et alternativ for felt som regnskap og finans med alfabetisk rekkefølge, der posisjon uansett ikke bærer informasjon.
- Regelen må låses og versjoneres. Handelsblatt-endringen fra 2/(n+1) til 1/n flyttet forskere over 100 plasser.
- UTD behandler NBER/CEPR-tilknytning spesielt (full uttelling til universitetet). Vi bør ha en tilsvarende regel for rene forskningsinstitutter og dobbeltstillinger mellom institutter og høyskoler.

### 11.5 Fagfeltnormalisering

Problemet er at fagfeltene publiserer og siteres ulikt. I Handelsblatt 2009 kom ingen fra regnskap eller skatt blant de 50 beste, og VHB har derfor 18 fagfeltvise vurderinger uten samlet liste. NPI løser det med kvote per felt, AJG har felt per tidsskrift.

Foreslått tilnærming:

1. Hent fagfelt per artikkel fra AJG (eller ABDC FoR-kode) der det finnes, ellers fra NVI-kanalens fagområde.
2. Beregn forventet vekt per artikkel i fagfeltet f i vinduet, som snitt for hele den norske sammenligningsgruppen (eller internasjonalt hvis vi får data).
3. Indeks for enhet u er faktisk sum delt på forventet sum gitt enhetens fagfeltsammensetning (indirekte standardisering, samme tankegang som Leidens MNCS).
4. Skriv ut en matrise enhet × fagfelt, slik at det synes at en enhet er sterk i finans men svak i markedsføring.
5. For små celler brukes krymping mot gjennomsnittet (eller bare visning med usikkerhetsangivelse).

Som minimum bør nivå 2-andelen rapporteres per fagfelt, siden den allerede er kvotenormalisert.

### 11.6 Små og store enheter

- Rapporter **både sum og per faglig årsverk** (Leiden: størrelsesavhengig og -uavhengig. UTD har per capita som tilleggsside).
- Bruk **gjennomsnittlig** antall årsverk over vinduet, ikke dagens antall (Colorado-kritikken: skolen som krympet får et kunstig høyt per capita-tall).
- **Minstegrense** for visning av en enhet (Leiden 1 500 publikasjoner, RePEc minst 5 forfattere). For oss for eksempel minst 10 faglige årsverk og et visst antall brøktellede artikler. Under grensen vises tallet med «lavt grunnlag».
- **Usikkerhetsintervall** med bootstrap over artikler (Leiden, 95 %) og rangbånd i stedet for ensifrede plasseringer (GRAS).
- **Avhengighet av enkeltpersoner:** vis andelen av poengene som kommer fra de tre mest produktive (RePEc «10 beste forfattere» som inspirasjon).
- Bruk 5-årsvindu (UTD, Tilburg, Handelsblatt, GRAS 2020–2024) og eventuelt 3 år som følsomhetstest.

### 11.7 Internasjonal sampublisering

NPI har allerede en bonus på 1,3. Leiden og GRAS har egne IC-indikatorer med hel telling. I et lite land har nesten alle høy andel, så skillet blir lite og kan drives av enkeltprosjekter. Bruk sampublisering som egen, lavt vektet indikator, og ikke tell den to ganger (hvis NPI-poengene med bonus brukes i kvalitetsindikatoren).

---

## 12. Hva som er verdt å kopiere av presentasjon og interaktivitet

| Funksjon | Hvem har den | Prioritet for oss |
|---|---|---|
| Valgfritt tidsvindu | UTD, Tilburg (Sandbox), Leiden, BYU | Høy |
| Velg tidsskrifter og vektingsmåte | Tilburg (Sandbox), UTD | Høy |
| Hel mot brøk | Leiden, Nature Index | Høy |
| Sum mot per ansatt | Leiden, UTD per capita | Høy |
| Usikkerhetsintervall | Leiden | Høy |
| Rangbånd | GRAS | Middels |
| Sammenlign opptil seks enheter | SIR, Nature Index | Middels |
| Artikkelliste per enhet | UTD, Nature Index | Høy |
| Søk på forfatter | UTD, RePEc | Lav (personvern og boikott, se Handelsblatt) |
| Nedlasting (CSV) | Tilburg, Nature Index | Høy |
| Endringslogg for metoden | UTD | Høy |
| Månedlige arkivsnapshots | RePEc | Middels |
| Feilrapportering | UTD, Tilburg | Høy |

---

## Anbefalinger for vår forskningsindikator

1. **Behold NVI-nivåene som basislag og bruk AJG/ABDC som et eget kvalitetslag med regelen «maks, ikke sum».** Nivå 1 = 1 og nivå 2 = 3 for alle artikler, og klassene T, A, B, C og D (avsnitt 11.3) gir høyere vekt der tidsskriftet står på en liste. Vi unngår dobbelttelling og beholder dekning for fag som ikke finnes i AJG/ABDC.
2. **Vis dekningsgrad per enhet.** Hvor stor andel av brøktellede nivå 1- og 2-artikler lar seg koble mot AJG/ABDC? «Ikke funnet» betyr aldri null poeng. Det må stå synlig, siden BI, NHH og for eksempel NMBU, UiS og Molde har ulik fagprofil.
3. **Bruk 1/n per forfatter som hovedregel og del flere tilknytninger likt.** Det er den vanligste standarden (UTD, Nature Index, Handelsblatt etter 2012, Leiden). Lås og versjoner regelen, fordi endringen fra 2/(n+1) til 1/n flyttet Handelsblatt-forskere over 100 plasser. Behold NPI-regelen (kvadratrot, ×1,3) som sammenligning, og avstem omregningen mot DBH.
4. **Test alltid mot alternative vekter.** Kjør lineær vekt, NPI (1/3), vår klasseskala og Handelsblatt-lignende (1,00 til 0,05), og publiser rangkorrelasjon og antall plasseringsbytter. Haucap m.fl. viser at vekter forklarer sitater dårligere enn rent antall, og Handelsblatt-vektene er kritisert for å være ad hoc. Vekter er et valg, og vi må si det.
5. **Normaliser for fagfelt med indirekte standardisering.** Beregn forventet vekt per artikkel i fagfeltet, sammenlign faktisk mot forventet gitt enhetens fagmiks (Leidens MNCS-tankegang), og vis en matrise enhet × fagfelt. Bruk krymping eller varsel i små celler. Rapporter nivå 2-andelen per fagfelt, siden den allerede er kvotenormalisert.
6. **Rapporter både sum og per faglig årsverk, og bruk gjennomsnittlig årsverk over hele vinduet.** Colorado-kritikken av UTD per capita viser at dagens ansatte mot gammel produksjon gir feil tall. Leiden gir modell for å skille størrelsesavhengige og -uavhengige mål.
7. **Bruk et 5-årsvindu (2020–2024 nå) som hovedvindu, og la brukeren velge 3, 5 og 10 år samt enkeltår.** Det samsvarer med UTD, Tilburg, Handelsblatt og GRAS. For små enheter er tre år for ustabilt.
8. **Beskytt små enheter med minstegrense, usikkerhetsintervall og rangbånd.** Minstegrense for visning (som Leiden 1 500, RePEc fem forfattere), 95 % bootstrap-intervall over artikler (Leiden) og rangbånd framfor ensifrede plasser (GRAS) når intervallene overlapper.
9. **Vis avhengighet av enkeltpersoner.** Oppgi hvor stor andel av enhetens poeng som kommer fra de tre mest produktive (inspirert av RePEcs «10 beste forfattere»), men rangér ikke enkeltpersoner. Handelsblatt-boikotten i 2012 (309 underskrivere) viser kostnaden.
10. **Hold internasjonal sampublisering som egen, lavt vektet indikator og ikke dobbelttell den.** NPI har allerede ×1,3, og Leiden og GRAS bruker hel telling i egne IC-indikatorer. I et lite land har nesten alle høy andel, så den skiller dårlig.
11. **Bygg et «Sandbox»-lignende verktøy.** Tidsvindu, tidsskriftutvalg (FT50, UTD24, AJG ≥ 3, ABDC A/A*), vektskjema, hel mot brøk og sum mot per årsverk, alt valgbart av brukeren, slik Tilburg gjør. Legg til sammenligning av inntil seks enheter, artikkelliste per enhet, CSV-nedlasting, feilrapportering og en synlig endringslogg for metoden (UTD).
12. **Bruk de eksterne rangeringene bare som kontroll, ikke som del av vår score.** RePEc (NHH 1, UiO Økonomi 2, BI 3), Tilburg (NHH 79 i Economics, BI ikke i top 100) og GRAS 2026 (BI Business Administration 50, NHH Economics 101–150) er en uavhengig plausibilitetssjekk. De tre er sterkt WoS/RePEc-avhengige, og GRAS bygger på en undersøkelse med dokumentert skjevhet.
13. **Ikke bruk Nature Index, SCImago SIR eller UTD alene.** Nature Index har nesten ingen business-dekning ennå, SIR blander forskning med patenter og nettstørrelse, og UTD har 24 tidsskrifter uten økonomi. UTD24 og FT50 beholdes som flagg i klassene.
14. **Dokumenter enhetsdefinisjonen like nøye som metoden.** Tilburg slår University of London sammen til én enhet, RePEc-enhetene varierer, og `skoler-notat.md` viser allerede forskjellene mellom NTNU-instituttet og -fakultetet og OsloMet-faggruppene. Hver enhet skal ha en avgrensning som er lik i DBH og NVA, og avvik skal stå i klartekst.
15. **Merk hvor vi er usikre.** Kilder jeg ikke kunne lese (SCImago, BYU, Springer-artikkelen, GRAS-vektene) bør leses i primærkilden før noe gjengis offentlig. Vår egen tekst bør bruke «kvalitetsklasse» og «listebasert» framfor «kvalitet», fordi tidsskriftlister måler kanal, ikke artikkelens kvalitet.
