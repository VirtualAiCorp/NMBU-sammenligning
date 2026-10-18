# Campus som mulige eksamenssteder for NMBU, og ordninger for eksamen et annet sted

Arbeidsnotat 17.10.2026 (Opus 5.5). Del av kartleggingen av mulige samarbeidssteder for fysisk eksamen for Handelshøyskolen
ved NMBU, for eksempel for nett- og deltidsstudenter. Studiesentrene ligger i `nord.json` og `sor.json` (egne
kartlegginger). Dette notatet gjelder campusene og studiestedene til universitetene og høgskolene.

Filer:

| Fil | Innhold |
|---|---|
| `data/marked/studiesentre/campus.json` | 144 fysiske studiesteder (institusjon × sted) i Norge med adresse, koordinater, kontakt, eksamensinformasjon og kilder |
| `data/marked/studiesentre/ordninger.json` | 26 ordninger for eksamen et annet sted, eller for eksamen for andre institusjoner, med vilkår, pris og kilde |
| `data/marked/studiesentre/kilder/` (gitignorert) | Cache: Brreg-uttrekk, Kartverket-oppslag, nedlastede sider og PDF-er |

## 1. Kort oppsummert

- **Ingen nasjonal ordning.** Det finnes ingen felles tjeneste der universiteter og høgskoler avvikler eksamen for
  hverandres studenter. Hver institusjon fastsetter eksamenssted i egen forskrift. Der det finnes åpninger, er de
  søknadsbaserte, gjelder enkeltstudenter, og studenten betaler.
- **Fire institusjoner har skriftlige regler for kandidater fra andre institusjoner:**
  - **USN** tar imot studenter fra andre institusjoner for **2 500 kr per eksamen per student**, pluss eventuell
    eksamensvakt. Regelen står i forskriften § 7-17 (5) og gjelder alle campusene.
  - **HiØ** tar imot studenter fra andre norske læresteder til skriftlig eksamen i Halden. Fredrikstad har ikke
    kapasitet.
  - **UiB** avvikler andre institusjoners eksamener i egne lokaler, men bare for studenter med studierett ved UiB
    (utveksling).
  - **NTNU** har «fjerneksamen» for utenlandske universiteters eksamener, også bare i utvekslingssammenheng.
- **UiA har sagt nei.** UiA tilbyr fra 1. januar 2025 ikke lenger generelt å avholde eksamen på campus for andre.
- **De fleste institusjoner bruker nå WISEflow.** Sikt valgte WISEflow som felles eksamenssystem i 2025, og i oktober
  2026 bruker de fleste aktuelle institusjonene, også NMBU, det samme systemet. En NMBU-kandidat kan derfor skrive i
  NMBUs egen WISEflow på egen PC med låst nettleser. Vertsstedet trenger bare å stille rom, strøm, nett og
  eksamensvakter.
- **Prisnivå** (betalt av studenten i dag):
  - Egenandel hos studiesenter: 600–750 kr per student per eksamen (Midt-Troms 600 kr, Nord-Troms 750 kr; rettet 18.10.2026).
  - Administrasjonsgebyr hos egen institusjon: 700–1 800 kr.
  - Avgift når en annen institusjon er vertskap: 2 500 kr per kandidat hos USN, pluss vakt.
- **NMBU i dag.** Årsstudiet i bærekraftig økonomi og ledelse (Samordna 192253, DBH KVU-BEDØK) hadde 1 962 registrerte
  høsten 2025. Fra høsten 2026 har alle de åtte emnene digital hjemmeeksamen eller mappe, så ingen fysisk eksamen.
  Valgemnet ECN181-B (fra høsten 2027) får derimot 2 timers skoleeksamen, «Fysisk eksamen gjennomføres høsten 2027»,
  uten at stedet er oppgitt. Da trenger NMBU eksamenssteder utenfor Ås.
- **Anbefaling.** § 5 anbefaler 13 campuser fra Alta til Porsgrunn, med HiØ Halden som reserve. Utvalget dekker alle
  landsdeler, og alle stedene er store studiesteder med skriftlig skoleeksamen. For UiT, NTNU og INN er
  eksamenslokalene stedfestet i kilden. Stedene med dokumentert praksis for andres kandidater bør kontaktes først:
  USN, UiT (som bruker studiesentre og leide lokaler), UiB og NTNU. HiØ Halden er reserve fordi det ligger nær Ås.

## 2. Kilder og metode

| Kilde | Brukt til |
|---|---|
| `data/marked/studiesteder/studiesteder.json` (DBH 124, høst 2025) | Utgangspunkt: 144 studiesteder i Norge (`type: sted`), id, kommune og registrerte studenter 2025. Nettposter og steder i utlandet er utelatt |
| Institusjonenes egne kontakt- og campussider (UiT, Nord, NTNU, USN, HVL, INN, UiA, UiS, HiØ, HiMolde, OsloMet, NMBU, BI, Kristiania, VID, NLA) | Besøksadresse, sentralbord, felles e-post og eksamenskontorets fellesadresse |
| Enhetsregisteret (data.brreg.no, hovedenheter og underenheter) | Adresse for mindre institusjoner og der institusjonen ikke oppgir campusadresse. E-postadresser i Brreg med personnavn er utelatt |
| Kartverkets adressesøk (ws.geonorge.no/adresser/v1) | Koordinater, kommunenummer og kontroll av adressen. Treffet må ha samme gatenavn og nummer. Ved avvik står det i merknaden |
| Eksamenssider, forskrifter (Lovdata og institusjonenes egne) og retningslinjer | Eksamenslokaler, digitalt eksamenssystem, regler for eksamen et annet sted og for kandidater fra andre institusjoner |
| Sikt | Felles avtale om digitalt eksamenssystem |

**Feltene i `campus.json`:**

- `tilbyrEksamen` er `true` bare når en kilde bekrefter skoleeksamen eller eksamenslokaler på stedet (38 steder). Ellers
  er feltet `null`. Det betyr ukjent, ikke nei.
- `tarImotAndre` er `true` eller `false` bare der institusjonen har en skrevet regel (15 steder). Ellers er det `null`.
- `sikkerhet`:
  - «høy»: adressen er fra institusjonens egen side og funnet hos Kartverket (66 poster).
  - «middels»: adressen er fra Brreg, eller adressen er ikke en vegadresse (41 poster).
  - «lav»: ingen adresse er funnet, og koordinatene er det omtrentlige punktet fra `studiesteder.json` (37 poster, mest
    steder med få eller ingen studenter i 2025).
- `kilde` er en liste over URL-er. `hentet` er 17.10.2026 for alle poster.

Ingen personnavn er brukt. Kontaktfeltene inneholder bare sentralbord, felles e-post, servicetorg og eksamenskontor.

## 3. Campusene i tall

- 144 fysiske studiesteder ved 50 institusjoner. 108 har gateadresse og 142 har koordinater. 2 har ingen koordinater:
  Forsvarets høgskole i Oslo og Trondheim, som har militære adresser.
- Stedene med gateadresse har 306 329 av 307 556 registrerte studenter på fysiske studiesteder høsten 2025 (99,6 %).
- Fordeling per fylke:

  | Fylke | Antall | Fylke | Antall |
  |---|---|---|---|
  | Oslo | 27 | Akershus | 8 |
  | Trøndelag | 17 | Troms | 7 |
  | Vestland | 14 | Finnmark | 6 |
  | Nordland | 13 | Agder | 6 |
  | Innlandet | 13 | Telemark | 5 |
  | Rogaland | 9 | Buskerud | 4 |
  | Møre og Romsdal | 8 | Østfold | 3 |
  |  |  | Vestfold | 2 |
  |  |  | Svalbard | 2 |

- Digitalt eksamenssystem ifølge institusjonenes egne sider i oktober 2026:

  | System | Institusjoner |
  |---|---|
  | WISEflow | NMBU, UiT, HVL, HiØ, HiMolde (fra 1.4.2026), INN (fra 23.2.2026), OsloMet, USN, NHH, BI, Kristiania, NLA, Samisk høgskole |
  | WISEflow fra 1.9.2026 | Nord |
  | Hovedsakelig WISEflow, Inspera i noen hjemmeeksamener | UiS |
  | Inspera, under bytte til WISEflow | UiA |
  | Inspera | NTNU |
  | Inspera, med WISEflow i noen eksamener | UiO |
  | Ikke funnet | UiB, Volda og de små høgskolene |

**Delte campuser og høgskolesentre** er særlig interessante fordi flere institusjoner allerede bruker dem:

- **Campus Helgeland**, Nytorget 5, Mo i Rana: Nord, UiT, Kunnskapsparken Helgeland og Nordlandsforskning.
- **Campus Kristiansund**, Fosnagata 12: HiMolde. I tillegg har NTNU, DMMH og Volda studenter i Kristiansund, men
  adressen deres er ikke dokumentert.
- **Høgskolesenteret i Kongsvinger** (Strandvegen 3) og **Tynset studie- og høgskolesenter**: INN.
- **Studiesenteret Midt-Troms** (Finnsnes) og **Campus Nord-Troms** (Storslett): eksamenssteder for UiT.

De fire siste er også med i studiesenterkartleggingen.

## 4. Ordninger for eksamen et annet sted (kapittel til rapporten)

### 4.1 Hovedregelen: institusjonen bestemmer eksamensstedet

Alle forskriftene som er kontrollert sier at institusjonen fastsetter eksamenssted for eksamener med oppmøte:

- UiT § 21.
- Nord § 7-7 (2).
- USN § 7-17.
- INN § 6-1 (4).

Avslag på søknad om et annet eksamenssted kan ikke påklages hos UiT, fordi valg av eksamenslokale hører inn under
organisasjonsmyndigheten. Unntakene er derfor skjønnsbaserte og laget for enkeltstudenter, ikke for avtaler mellom
institusjoner.

### 4.2 Institusjonenes regler for egne studenter

| Institusjon | Kan egne studenter ta eksamen et annet sted? | Vilkår | Pris til egen institusjon |
|---|---|---|---|
| UiT | Bare av helt spesielle grunner (eksempel: fengsel). Økonomiske og praktiske grunner godtas ikke | TOPdesk-søknad 15.9 / 15.2, kontaktperson på stedet, samme tid | Ingen avgift oppgitt. Studenten dekker leie, vakt og administrasjon hos vertsstedet |
| Nord | Eksamenssted følger undervisningssted. Fakultetet kan åpne for valg mellom undervisningssteder. For nettemner står eksamensstedet i emnebeskrivelsen | Forskriften § 7-7 (2) | Ikke oppgitt |
| NTNU | Nei, ikke på tvers av campusbyer og ikke ved andre læresteder. Unntak for nett- og fleksible studier ved NTNU i Gjøvik | Gjøvik: over 200 km, universitet, høgskole, offentlig studiesenter eller ambassade. Frist 1.9 / 1.2 | 1 500 kr per eksamen (Gjøvik), pluss lokale kostnader |
| USN | Ja, i særlige tilfeller, ved over to timers reisevei. Annen høyskole, universitet, ambassade, annen USN-campus, unntaksvis videregående skole | Frist 15.10 / 15.3 | 1 800 kr per eksamen, pluss vertsstedets kostnader |
| INN | Nei. Nettstudenter tar skoleeksamen på Rena, Lillehammer eller Kongsvinger | – | – |
| OsloMet | Ingen generell ordning funnet. Toppidrettsutøvere kan ta ny eller utsatt eksamen ved annen institusjon (fra søkemotorens utdrag, siden var sperret) | Søknad én måned før | Ikke oppgitt |
| BI | Ja. Eksamenssted kan endres i studentportalen, og eksamen kan tas ved steder utenom BIs studiesteder | Detaljene ligger i studentportalen (krever innlogging) | Ikke offentlig |
| Kristiania (nett) | Ja. Studenten velger On-campus Oslo, On-campus Bergen eller Off-campus (søknad). I utlandet: privat arrangør eller ambassade | Oppmelding 1.4 / 1.11 | Studenten dekker lokale kostnader |
| UiA | Ja, med selvvalgt ekstern kontaktperson | 15.3 / 15.10 | 700 kr (Norge), 1 000 kr (utland) |
| HiØ | Ja, ved særskilte grunner. Universitet, høgskole, ambassade, konsulat eller sjømannskirke | 15.10 / 1.4 | 700 kr (Norge), 1 000 kr (utland) |
| NLA | Ja. Primært andre norske universiteter og høgskoler | 15.2 / 15.9 | 1 500 kr (annen høgskole), 500 kr (annen NLA-campus), pluss vertsstedets leie og vakt |
| HLT | Ja, ved over 3 timers reisevei | 15.9 / 15.2. Minst 2 vakter ved mer enn 3 studenter | 800 kr, pluss leie og vakt direkte til stedet |
| Ansgar | Ja, i særlige tilfeller | 6 uker før | Studenten dekker alle ekstra kostnader |
| NMBU | Digital hjemmeeksamen kan tas hvor som helst, også i utlandet, på norsk tid. Ingen publisert ordning for skoleeksamen et annet sted | – | – |

### 4.3 Institusjoner som avvikler eksamen for andre

| Vert | Ordning | Pris |
|---|---|---|
| **USN** (alle campuser) | Studenter ved andre institusjoner kan søke om å bruke USN som eksamenslokale, jf. forskriften § 7-17 (5) | **2 500 kr per eksamen per student**, pluss eventuell eksamensvakt, betalt på forhånd |
| **HiØ Halden** | Studenter ved andre norske høgskoler og universiteter kan søke om skriftlig eksamen ved HiØ. Fredrikstad har ikke kapasitet | Ikke oppgitt |
| **UiB** | «Ekstern eksamen» for utvekslingsstudenter med studierett ved UiB, i UiBs lokaler med UiBs vakter. Hverdager kl. 9–16, søknad 4 uker før, eksamen@uib.no | Ikke oppgitt |
| **NTNU** | «Fjerneksamen»: skriftlige eksamener fra utenlandske universiteter, i faste perioder (8.1–28.2 og 21.8–30.9) | Ikke oppgitt |
| **UiA** | Har sluttet. Fra 1.1.2025 avholder UiA ikke lenger generelt eksamen på campus for andre | – |

### 4.4 Avtaler mellom institusjoner og studiesentre, og andre modeller

- **UiT** har kvalitetssikrede og godkjente eksamenssteder:
  - Egne campuser.
  - **Studiesenteret Midt-Troms AS** på Finnsnes.
  - **Campus Nord-Troms AS** på Storslett, der eksamen avvikles «i lokal regi» av studiesenteret.
  - **MEET Ullevaal kurs- og konferansesenter** i Oslo, for UiT-studenter i Oslo-området. UiT leier altså et kommersielt
    konferanselokale til skoleeksamen.
  - **Torggården** i Bodø, rett ved Nords campus.

  Ved desentralisert undervisning kan fakultetet bestemme desentralisert eksamen før studiet starter.
- **Nord-Troms studiesenter** tar en egenandel fra studenten på 500 kr per eksamen for emner senteret annonserer, og
  800 kr for andre emner. Institusjonen kan i tillegg kreve egen avgift.
  **Rettet 18.10.2026:** dette står på den eldre NTSS-siden. Senterets nåværende side (campusnt.no) oppgir 750 kr per
  student per eksamen for studenter fra andre institusjoner, og gratis for UiT-studenter.
- **Nord og NTNU.** Kartleggingen fant ingen offentlig liste over studiesentre som Nord eller NTNU bruker til eksamen.
  - NTNU i Gjøvik godtar «offentlig studiesenter» som eksamenssted for nettstudenter.
  - Nords forskrift åpner for egne regler om eksamenssted i oppdragsfinansierte studier.
  - Studiesenterkartleggingen (`nord.json`, `sor.json`) har informasjonen fra sentrenes side.
- **UiO og OsloMet** deler eksamenslokalet **Silurveien 2** (OsloMets eksamenslokale med stasjonære PC-er).
- **Sikt** har en felles avtale om WISEflow (UNIwise), anskaffet i 2025 og med rammeavtale i tre år fra 14.7.2025.
  Avtalen gjelder systemet, ikke eksamensavvikling, men den gjør det teknisk enkelt for én institusjon å være
  eksamenslokale for en annen.
- **UiBs retningslinjer for ekstern skriftlig eksamen (2015)** viser hva en vertsinstitusjon må stille med:
  - Eksamensansvarlig.
  - Vakter: 1 for 1 kandidat, 2 for 2–8 kandidater og 3 for 8–16 kandidater. Vaktene møter 30 minutter før.
  - Forsvarlig oppbevaring av oppgavene.

  Retningslinjene gjelder papireksamen. Med WISEflow faller oppgaveforsendelsen bort.

### 4.5 Hva NMBU tilbyr nett- og deltidsstudentene i dag

- **Årsstudiet i bærekraftig økonomi og ledelse** (Samordna 192253, DBH KVU-BEDØK) er helt nettbasert. Det har 8 emner
  à 7,5 studiepoeng og 1 962 registrerte høsten 2025. Fra høsten 2026 er vurderingen slik:
  - Digital hjemmeeksamen på kveldstid, 2–3 timer: AOS100-B, AOS121-B, AOS238-B, BUS113-B og BUS134-B.
  - Mappevurdering: AOS135-B, AOS136-B, AOS229-B og BUS127-B.
  - Alle emnene vurderes til bestått/ikke bestått.
  - Studiesiden sier at alle åtte emnene fra høsten 2026 har digital hjemmeeksamen eller annen digital vurdering.
    Utdanning.no omtaler fortsatt «noe fysisk oppmøte på eksamen», som altså er utdatert.
- **Valgemnet ECN181-B** Bærekraftig økonomi gis første gang høsten 2027 og har **2 timers skriftlig skoleeksamen uten
  hjelpemidler**. Emnesiden sier ikke hvor eksamen avvikles. Dette er det første kjente behovet for fysiske
  eksamenssteder for NMBUs nettstudenter.
- **Ingen BØA-bachelor på deltid eller nett.** Kartleggingen fant ikke noe slikt tilbud ved NMBU. Bachelorgraden i
  økonomi og administrasjon er et heltidsstudium på Ås.
- **Eksamenskontoret** har adressen eksamen@nmbu.no, og WISEflow er eksamenssystemet. Skoleeksamen avvikles i dag på
  campus Ås.

## 5. Anbefalte samarbeidspartnere (13 steder, nord til sør)

**Kriterier:**

1. Dekning av landsdeler, slik at ingen nettstudent har urimelig lang reisevei.
2. Bekreftet eksamenserfaring: egne eksamenslokaler og -vakter dokumentert i kilde, helst praksis med andres kandidater.
3. Felles eksamenssystem (WISEflow).
4. Kapasitet (store studiesteder) og god kollektivtilgang.

Østlandet nær Ås dekkes av NMBU selv. Studiesentrene vurderes i egne notater og kan fylle hullene mellom stedene her.

| # | Landsdel | Anbefalt sted | Adresse | Studenter 2025 | Eksamenserfaring (kilde) | Tar imot andre? | System | Kontakt |
|---|---|---|---|---|---|---|---|---|
| 1 | Finnmark | **UiT campus Alta** | Follumsvei 39, 9510 Alta | 2 599 | Eksamenslokaler på campus (uit.no/eksamen) | Ingen regel. Krever avtale | WISEflow | 77 64 40 00, postmottak@uit.no |
| 2 | Troms | **UiT campus Tromsø** | Hansine Hansens veg 18, 9019 Tromsø | 11 650 | Kraft sportssenter, Administrasjonsbygget og Teorifagbygget | Ingen regel. Krever avtale | WISEflow | 77 64 40 00, postmottak@uit.no |
| 3 | Sør-Troms, Ofoten og Vesterålen | **UiT campus Harstad** | Havnegata 5, 9404 Harstad | 1 123 | Havnegata 1 og 5 | Ingen regel | WISEflow | 77 64 40 00, postmottak@uit.no |
| 4 | Salten | **Nord universitet, Bodø** | Universitetsalléen 11, 8026 Bodø | 4 720 | Hovedcampus. UiT bruker også Torggården ved campus til eksamen | Ingen regel. Nord-forskriften åpner for egne avtaler | WISEflow fra 1.9.2026 | 75 51 70 00, servicetorget@nord.no |
| 5 | Helgeland | **Campus Helgeland, Mo i Rana** (Nord og UiT) | Nytorget 5, 8622 Mo i Rana | 367 (Nord) + 27 (UiT) | UiT-eksamenssted i Mo i Rana. Delt campus med Kunnskapsparken Helgeland | Ingen regel, men campusen er allerede delt | WISEflow | 75 51 70 00, servicetorget@nord.no |
| 6 | Trøndelag | **NTNU Trondheim, Eksamenshuset Sluppen** (alternativ: BI Trondheim) | Høgskoleringen 1, 7034 (Sluppenvegen 14) | 37 139 | Egne eksamenshus. NTNU avvikler fjerneksamen for andre universiteter | Bare utveksling. NTNU er restriktiv, så BI Trondheim (Brattørkaia 16) er alternativet | Inspera | 73 59 50 00, eksamen@adm.ntnu.no |
| 7 | Møre og Romsdal | **Høgskolen i Molde** (pluss Campus Kristiansund) | Britvegen 2, 6410 Molde | 3 181 (+615 i Kristiansund) | Skoleeksamen med WISEflow fra april 2026 | Ingen regel | WISEflow | 71 21 40 00, post@himolde.no |
| 8 | Sogn og Fjordane | **HVL campus Sogndal** (alternativ: Førde) | Røyrgata 6, 6856 Sogndal | 2 323 | Skuleeksamen ved HVL | Ingen regel | WISEflow | 55 58 58 00, eksamen@hvl.no |
| 9 | Hordaland | **UiB** (alternativ: HVL Bergen) | Muséplassen 1, 5007 Bergen | 20 628 | Har en etablert rutine for andre institusjoners eksamener (utveksling) | Ja, begrenset | Ikke funnet | 55 58 00 00, eksamen@uib.no |
| 10 | Rogaland | **UiS, Ullandhaug** (alternativ: BI Stavanger) | Kjell Arholms gate 41, 4021 Stavanger | 13 934 | Skoleeksamen ved UiS | Ingen regel | WISEflow | 51 83 10 00, post@uis.no |
| 11 | Agder | **UiA Kristiansand** (alternativ: NLA Gimlekollen eller Ansgar) | Universitetsveien 25, 4630 Kristiansand | 11 277 | Egne eksamenslokaler | **Nei for enkeltsøknader fra 2025.** Krever institusjonsavtale | Inspera → WISEflow | 38 14 10 00, post@uia.no |
| 12 | Telemark (Grenland), og Buskerud og Vestfold ved behov | **USN campus Porsgrunn** (alle USN-campuser er mulige) | Kjølnes ring 56, 3918 Porsgrunn | 3 091 | Eksamen på egne campuser (forskriften § 7-17) | **Ja: 2 500 kr per kandidat + vakt** | WISEflow | 31 00 80 00, postmottak@usn.no |
| 13 | Innlandet | **INN Lillehammer** (alternativ: Rena) | Vormstuguvegen 2, 2624 Lillehammer | 5 310 | Eksamenssted for INNs egne nettstudenter i bedriftsøkonomi | Ingen regel. INN er selv restriktiv | WISEflow | 62 43 00 00 (Rena: eksamenhhs@inn.no) |

**Reserve og supplement:**

- **HiØ Halden** (B R A veien 4, eksamen-halden@hiof.no) tar dokumentert imot andre institusjoners kandidater, men
  ligger nær Ås. Stedet er mest aktuelt som pilot eller modell.
- **UiT campus Kirkenes** dekker Øst-Finnmark.
- **Nord Levanger eller Steinkjer** dekker Innherred.
- **NTNU Ålesund** og **Volda** dekker Sunnmøre.
- **HVL Haugesund** dekker Nord-Rogaland og Sunnhordland.
- **USN Hallingdal (Gol)** og **USN Bø** dekker indre Buskerud og Telemark.

**Begrunnelse:**

- **USN er den sikreste partneren.** USN er den eneste institusjonen med fast pris og forskriftsfestet rett til å søke
  for andre institusjoners studenter, og tilbudet gjelder alle campusene.
- **UiT har den mest utbygde modellen.** UiT har allerede et nett av godkjente eksamenssteder i hele Nord-Norge, med
  campuser, studiesentre og et leid konferanselokale. En avtale med UiT, eller med de samme studiesentrene, gir dekning
  i nord.
- **UiB og NTNU har rutinene.** Begge har etablerte rutiner for å avvikle andre institusjoners eksamener, selv om
  rutinene i dag bare gjelder utveksling. Det er et godt utgangspunkt for en avtale.
- **Felles system gjør avtalen enkel.** Alle de anbefalte stedene unntatt NTNU og UiB er dokumentert på WISEflow.
  NMBU-kandidater skriver uansett i NMBUs WISEflow på egen PC. Vertsstedet stiller lokale, nett og vakter.
- **UiA og INN må håndteres som institusjonsavtaler**, siden begge avviser enkeltsøknader.

**Neste steg** (forslag):

1. Hent semesteradressene til NMBUs nettstudenter fra FS, så stedene kan vektes etter hvor studentene bor.
2. Kontakt eksamenskontorene, først USN, UiT og UiB, om en rammeavtale med pris per kandidat og vaktsats.
3. Avklar om ECN181-B høsten 2027 kan bli en pilot.

## 6. Forbehold

1. **Ukjent er ikke det samme som nei.** `tilbyrEksamen` og `tarImotAndre` er bare satt der kilden er tydelig.
   Nesten alle studiesteder med mange studenter har trolig eksamenslokaler, men det er ikke dokumentert for hvert sted.
2. **Usikre adresser:**
   - Adresser fra Brreg ("middels") er den registrerte forretningsadressen, som kan avvike fra hovedinngangen.
   - Kartverket fant ikke disse adressene, så koordinatene er omtrentlige:
     - Bardufoss lufthavn.
     - Svalbard forskningspark.
     - Slekkåsveien (PHS Bodø).
     - Otto Sverdrups plass 4 (VID Sandvika).
   - Fire adresser ble rettet mot Kartverket: Høgskolevegen 27 (Levanger), Anne Evenstads vei 80, Universitetsveien
     25A og Diakonveien 14A. Det står i merknaden eller i kilde-URL-en for posten.
3. **Avvik fra DBH-kommunen:** NGI (Brreg: Sandvika i Bærum, DBH: Oslo) og Høgskulen for grøn utvikling (Brreg: Bryne
   i Time, DBH: Klepp). Brreg-adressen er brukt, og avviket står i merknaden.
4. **Kilder som ikke kunne hentes direkte:**
   - BIs detaljregler ligger bak innlogging.
   - OsloMets side om toppidrett svarte 403. Det som står om den, er fra søkemotorens utdrag.
5. **Utdaterte kilder:**
   - Utdanning.no har utdatert eksamensinformasjon om NMBUs årsstudium.
   - UiBs ES2-retningslinjer er fra 2015.
   - UiTs «Avlegge eksamen ved et annet sted» er sist endret 28.08.2024, men stemmer med den engelske siden fra mars
     2026.
6. **Priser.** Prisene er det institusjonene krever av sine egne studenter eller av gjestekandidater i dag. En avtale
   mellom NMBU og en annen institusjon vil ha egne vilkår.
