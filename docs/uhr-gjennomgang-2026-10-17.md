# UHR-gjennomgang av emnekartleggingen for bachelor i økonomi og administrasjon (17.10.2026)

Gjennomgang av `kilde/src/app/data/courseMapping.ts` (UHR_GROUPS og COURSE_MAPPING) mot UHR-kravet, DBH-tall for studentene med ØA-studierett og studieplanene. Maskinlesbar versjon: `data/hh/uhr-gjennomgang.json`. Endringsliste: `data/hh/uhr-forslag-endringer.md`. Kildekoden er ikke endret.

## Kort oppsummert

- **UHR-kravet er minst 120 sp** innen fem økonomisk-administrative fagområder, ikke «110+». Minimumene per område summerer til 102,5 sp (30 + 30 + 15 + 20 + 7,5). Det femte området, **etikk, samfunnsansvar og bærekraft (minst 7,5 sp)**, mangler helt i kartleggingen.
- **Feil studiepoeng er den vanligste feilen.** 134 av de 263 eksisterende oppføringene har feil studiepoeng, fordelt på 15 av 23 institusjoner. Som regel står 10 sp der emnet er 7,5 sp (UiA, USN, Nord, HVL, Kristiania, INN, HiMolde, NTNU Gjøvik/Ålesund, ONH, UiT). NMBU har fire emner på 5 sp som står som 10: AOS120, AOS130, ECN120 og AOS240.
- **16 oppføringer peker på feil emne.** De alvorligste er UiTs makro og mikro (byttet om, slik OsloMets var), UiA strategi (ORG126 er innovasjon og entreprenørskap), Nord metode (ECO1003 er makro), BI økonomistyring (BØK3430 er innføringsemnet), UiT økonomistyring (BED-1502 er nettemnet uten Tromsø-studenter) og UiT metode (SVF-1050, ingen ØA-kandidater).
- **Mange koder er utgått eller nye.** USN fikk nye koder i 2024–2025, UiT i 2025, NLA i 2023–2025 og NTNU statistikk i 2025. Den kartlagte koden mangler da karakterer for eldre år, eller for alle år hvis koden er planlagt men ikke tatt i bruk (BI STR3610, UiT nett).
- **Mulighetsvurdering:** Programtallene i `hhCourseData.json` (`years`) holder til å følge ØA-studentene område for område. Skjermingen er liten når tallene slås sammen per område (1–5 % for NMBU, under 2 % for de store). Forskjellen mot emnenivå er stor der ØA-studentene er en liten del av emnet. For NMBU STAT100 i 2025 fikk ØA-studentene snitt 1,55 og 43,7 % stryk, mot 1,94 og 30,6 % for alle 631 kandidater. Andel av kullet som har fullført hele kjernen kan ikke måles uten individdata fra FS.

## 1. UHR-kravet

### 1.1 Kilder

| Dokument | Vedtatt | Status | Lenke |
|---|---|---|---|
| **Minimumskrav for Bachelor i økonomi og administrasjon (BØA)** | UHR-Økonomi og administrasjon, november 2018 | **Gjeldende.** Ingen nyere BØA-plan funnet. BI viser til disse kravene (side oppdatert 15.05.2025). | [uhr.no (PDF, 4 s.)](https://www.uhr.no/_f/p1/i48e11d18-8b76-4089-acb1-511fa13135e4/boa-planvedtatt-av-uhr-oa-november-2018-endelig.pdf) |
| Plan for bachelor i økonomi og administrasjon | NRØA 17.10.2011 | Erstattet av 2018-kravene. Brukes her bare som støtte for å tolke innholdet i hvert tema. | [nhh.no (PDF, 19 s.)](https://www.nhh.no/contentassets/bbbee551fb9c461593eea8fb507dc012/plan-for-bachelor-i-okonomi-og-administrasjon.pdf) |
| Anbefalt plan for regnskapsførerutdanning | UHR-ØA 22.06.2023 | Profilplan som bygger på 2018-kravene. Gjelder bare regnskapsførerprofilen. | [uhr.no (PDF)](https://www.uhr.no/_f/p1/i22355be1-aace-444f-8d49-31ccd512250a/anbefalt-plan-for-regnskapsforerutdanning-vedtatt-22062023.pdf) |
| BI: Tildeling av tittelen siviløkonom | BI, oppdatert 15.05.2025 | Gjengir 2018-minimumene (30/30/15/20/7,5 innen 120). | [bi.no](https://www.bi.no/studier-og-kurs/soknad-og-opptak/opptakskrav/master-of-science-in-business/tildeling-av-tittelen-sivilokonom/) |

Begge PDF-ene er lest i sin helhet 17.10.2026. Jeg fant ingen revisjon etter 2018 på uhr.no, men den gamle UHR-ØA-siden svarer med 404. Det bør sjekkes med UHR-ØA om en revisjon er på vei.

### 1.2 Krav per fagområde (2018-kravene)

Bachelorgraden er 180 sp: **minst 120 sp innen de fem økonomisk-administrative fagområdene**, og 60 sp som institusjonen står friere i. De 120 sp skal fordeles på alle fem områdene innenfor disse intervallene:

| Fagområde | Min–maks sp | Skal minst inneholde | I kartleggingen i dag |
|---|---|---|---|
| Bedriftsøkonomiske fag | 30–45 | finansregnskap, økonomistyring, investeringsanalyse og finansiering | `bedriftsokonomisk` (30 sp), tre temaer + tillegget `okonomi1` |
| Administrative fag | 30–45 | markedsføring, foretaksstrategi, organisasjonsteori og ledelse | `administrasjon` (30 sp), tre temaer |
| Samfunnsøkonomiske fag | 15–30 | mikroøkonomi, makroøkonomi | `samfunnsokonomi` (15 sp), to temaer |
| Metodefag | 20–30 | matematikk, statistikk, samfunnsvitenskapelig metode | `metodefag` (20 sp), tre temaer |
| **Etikk, samfunnsansvar og bærekraft** | **7,5–15** | tverrfaglig, kan være egne emner eller integreres | **mangler** |
| **Sum** | **minst 120** (sum av minimumene 102,5) | | ikke angitt |

**Totalsummen:** brukerens «110+ sp» stemmer ikke med noen tall i planen. Kravet er minst 120 sp i de fem områdene til sammen. De fem minimumene summerer til 102,5 sp, så minst 17,5 sp må ligge over minimum i ett eller flere områder. De øvrige 60 sp kan brukes til fordypning, andre fag (jus, IT, språk, ex.phil. osv.) eller bacheloroppgave.

**Hva som er fritt:** institusjonen velger selv om fagområdene organiseres i egne emner eller integreres. Integrerer den flere fagområder i ett emne, må den gjøre rede for hvordan studiepoengene fordeles mellom dem. Rettslære, IT og ex.phil. har ingen egne krav. IT nevnes bare som læringsutbytte («grunnleggende forståelse av IT-systemer») og digitale verktøy som ferdighet.

### 1.3 Når teller et emne? (innholdskrav)

2018-kravene har bare læringsutbytte på programnivå. De detaljerte temalistene finnes i 2011-planen, som jeg bruker som tolkningsstøtte:

- **Finansregnskap og økonomistyring er to separate innholdskrav.** 2011-planen beskriver finansregnskap (bokføring, årsoppgjør, regnskapsanalyse) og økonomistyring (kalkyler, driftsregnskap, budsjett, avviksanalyse) hver for seg. Et innføringsemne i bedriftsøkonomi (`okonomi1`) dekker vanligvis deler av begge og hører til bedriftsøkonomiske fag.
- **Investering og finansiering:** nåverdi, kontantstrøm, avkastningskrav og KVM. «Corporate Finance» og «Finans» teller.
- **Organisasjon og ledelse** var i den eldre planen fra 2001 delt i grunnleggende og videregående. Det er derfor vanlig med to emner (UiS, HVL, OsloMet, NHH, NMBU).
- **Matematikk er et eget innholdskrav** i metodefag (2018), ikke bare en anbefalt forkunnskap. 2011-planen beskriver blant annet derivasjon, Lagrange, rekker, finansmatematikk og integraler.
- **Statistikk og samfunnsvitenskapelig metode kan ligge i samme emne**, men fordelingen må dokumenteres, og emnet skal bare telles én gang. 2011-planen sier at statistikk bør komme før metode og at metode skal gi grunnlag for bacheloroppgaven.
- **Mikro og makro** kan integreres (BI fra 2023/2024), men begge må være dekket.
- **Etikk:** minst 7,5 sp (2018). 2011-planen krevde 5 sp, hvorav en egen etikksekvens på minst 2 sp, og godtok ex.phil. som alternativ. Bærekraftemner uten etikkdel (for eksempel NMBUs BUS180/ECN180) er grensetilfeller.

### 1.4 Forskjeller mellom planen og kartleggingen

1. **Etikk, samfunnsansvar og bærekraft mangler** som femte område, selv om nesten alle institusjoner har et eget emne (NTNU INT3001, UiA TFL126, USN ESB1000, OsloMet ØAETI2000, NHH SAM1A, BI EXC3401, HiØ SFB17021, UiS BØK109 osv.).
2. **120-kravet og maksimumene** er ikke med. UHR_GROUPS viser bare minimumene, uten at det står at de er minimum.
3. **Ett emne per tema** passer dårlig der institusjonen bruker to emner (finansregnskap 1 + 2, organisasjon 1 + 2, statistikk + dataanalyse). Det gir for lave studiepoeng og et skjevt snitt.
4. **Kombinerte emner** er dels lagt inn to ganger med en fordeling av studiepoeng som ikke finnes i kildene (NLA HSM126 som 7,5 + 5 = 12,5 sp, mens emnet er 10 sp; ONH ØKAD2110 som 10 + 10, mens det er 15 sp).
5. `okonomi1` er riktig plassert utenfor de tre temaene, men hører til bedriftsøkonomiske fag og bør telle med i den summen.

## 2. Slik er gjennomgangen gjort

- **Programtall:** DBH 308 «Antall kandidater totalt» per studieprogram og emne, 2021–2025 (`data/hh/kilder/dbh-cache/308pt_*`), for de samme programkodene som `hhCourseData.json` (gruppe `oa`). Tre nettprogrammer er lagt til fra den samme cachen: INN BAØKA, UiT B-ØKADMN og Kristiania BOA. Emnenavn og studiepoeng kommer fra DBH 208 (siste registrerte år). Et emne regnes som obligatorisk når omtrent hele kullet tar det.
- **Studieplaner** lest 17.10.2026: NMBU (oppbygning, kull 2026), UiA (2026h), BI (programside), UiT (studieplan fra kull 2025, PDF), ONH (programside). OsloMets programplan svarte med 403, og UiS' programside laster studieplanen med JavaScript.
- **Status:** FEIL (feil emne, byttet om eller kode uten ØA-studenter), DELVIS (området dekkes av flere emner, eller emnet dekker flere områder), STUDIEPOENG, UTGÅTT (kartlagt kode har ikke karakterene for perioden; forgjenger eller etterfølger trengs), MANGLER, OK. Én hovedstatus per celle; andre forhold står som `tilleggsstatus` i JSON-en og som «+» i tabellen.
- **Sikkerhet:** *sikker* = DBH og studieplan stemmer overens; *sannsynlig* = DBH-tall og navn er klare, men studieplanen er ikke lest; *usikker* = tolkning av innhold.
- **«Sum sp»** = sum av obligatoriske emner som gjaldt i 2025, i de fem UHR-områdene. Hver kode telles én gang, valgalternativer er utelatt, og `okonomi1` telles under bedriftsøkonomi. Summen er det vi har identifisert, ikke institusjonens egen klassifisering. Et ⚠ betyr at vi ikke fant nok emner. Institusjonen kan regne inn andre emner, for eksempel innovasjon eller kommunikasjon for ledere under administrative fag.

## 3. Sammendragstabell

⭑ = standard i HH-sammenligningen. SP = studiepoeng, DELV = delvis, UTG = utgått, MANGL = mangler. Små bokstaver etter «+» er tilleggsstatus.

| Institusjon | Fin.r | Øk.st | Inv | Mark | Org | Strat | Makro | Mikro | Mat | Stat | Met | Etikk | Innf. | Sum sp* |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| NMBU ⭑ | OK | OK | OK | SP | SP+delv | OK | SP | DELV | OK+utg | OK | SP | MANGL | OK | 115 |
| NHH ⭑ | OK | DELV | OK | OK | DELV | OK | OK | OK | OK | OK | OK | MANGL | OK | 112,5 |
| NTNU Trondheim ⭑ | OK | OK | OK | OK | OK | OK | OK | OK | OK | UTG | OK | MANGL | OK | 97,5 |
| OsloMet ⭑ | OK | OK | OK | OK | DELV | OK | OK | OK | OK | OK | DELV | MANGL | OK | 105 |
| Universitetet i Agder (UiA) ⭑ | SP+delv | SP | SP | SP | SP | **FEIL** | SP+delv | SP | SP | SP+delv | SP | MANGL | **FEIL** | 112,5 |
| Universitetet i Stavanger (UiS) ⭑ | OK | OK+utg | OK | OK | OK+utg | OK | OK | OK | OK | OK | OK | MANGL | MANGL | 120 |
| USN (Økonomi og ledelse) ⭑ | SP+delv+utg | SP+utg | SP+utg | SP | SP | SP+utg | SP+utg | SP+utg | SP+utg | SP+utg | SP+utg | MANGL | **FEIL** | 105 |
| INN Lillehammer ⭑ | SP+delv | SP+delv | SP | SP | SP | SP | OK | OK | OK | OK | SP | MANGL | MANGL | 112,5 |
| Nord universitet ⭑ | SP+delv | SP | SP | SP | SP+delv | SP | SP | SP | SP | SP | **FEIL** | MANGL | MANGL | 112,5 |
| HVL Bergen ⭑ | SP | SP | SP | SP | SP+delv | SP | SP | SP | SP | SP | SP | MANGL | MANGL | 105 |
| Høgskolen i Østfold (HiØ) ⭑ | OK | OK | OK | OK | OK | OK+utg | OK | OK | OK+utg | DELV | DELV | MANGL | OK | 120 |
| BI ⭑ | OK | **FEIL** | DELV | OK+utg | OK+utg | UTG | DELV | DELV | OK | OK | OK | MANGL | **FEIL** | 112,5 |
| Kristiania (campus) ⭑ | SP | SP | SP | SP+utg | SP | SP | SP | SP | SP | SP | SP+utg | MANGL | SP | 97,5 |
| UiT Tromsø | OK | **FEIL** | SP+utg | SP+utg | SP+utg | OK | **FEIL** | **FEIL** | SP+utg | SP+utg | **FEIL** | MANGL | **FEIL** | 105 |
| NLA Høgskolen | OK+utg | DELV | OK+utg | OK+utg | OK+utg | OK | SP+utg | SP+utg | SP+utg | SP+delv | **FEIL** | MANGL | MANGL | 117,5 |
| Oslo Nye Høyskole (ONH) | SP | SP | SP | SP | SP | SP | SP | SP | SP | SP+delv | SP+delv | MANGL | MANGL | 105 |
| Høgskolen i Molde | SP | SP+delv | SP+delv | SP | SP+delv | SP | SP | SP | SP | SP | SP | MANGL | **FEIL** | 105 |
| INN Rena | SP+delv | SP+delv | SP | SP | SP | SP | OK | OK | OK | **FEIL** | OK | MANGL | MANGL | 112,5 |
| NTNU Gjøvik | SP | SP | SP | SP | SP | SP | SP | SP | SP | SP | SP | MANGL | MANGL | 97,5 |
| NTNU Ålesund | SP | SP+utg | SP | SP | SP | SP | SP | SP | SP | SP | SP | MANGL | MANGL | 97,5 |
| Kristiania nett | DELV | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | MANGL | MANGL | 112,5 |
| INN nett | **FEIL**+delv | OK | OK | OK | MANGL | OK | OK | OK | OK | OK | OK | MANGL | MANGL | 105 |
| UiT nett | UTG+sp | UTG+sp | SP+utg | SP+utg | SP+utg | UTG+sp | UTG+sp | UTG+sp | SP+utg | **FEIL** | UTG+sp | MANGL | MANGL | 105 |

**Antall per hovedstatus** (23 institusjoner × 13 områder = 299 celler, med etikk og innføringsemnet): OK 99, STUDIEPOENG 128, MANGLER 36 (hvorav 23 er det nye etikkområdet), DELVIS 12, FEIL 16, UTGÅTT 8. Tilleggsstatus: UTGÅTT 35, DELVIS 19, STUDIEPOENG 6. I de 11 kjerneområdene for de 13 standardinstitusjonene: 64 OK, 64 STUDIEPOENG, 10 DELVIS, 3 FEIL og 2 UTGÅTT.

### 3.1 Studiepoeng i UHR-områdene etter gjennomgangen

Minimumene etter 2018-kravene står i overskriften. ⚠ = under minimum med de emnene vi har identifisert (se forbeholdet i kapittel 2).

| Institusjon | Bedriftsøk. (min 30) | Adm. (min 30) | Samf.øk. (min 15) | Metode (min 20) | Etikk (min 7,5) | Sum |
|---|---|---|---|---|---|---|
| NMBU | 35 | 30 | 15 | 25 | 10 | 115 |
| NHH | 37,5 | 30 | 15 | 22,5 | 7,5 | 112,5 |
| NTNU Trondheim | 30 | 22,5 ⚠ | 15 | 22,5 | 7,5 | 97,5 |
| OsloMet | 30 | 30 | 15 | 22,5 | 7,5 | 105 |
| Universitetet i Agder (UiA) | 30 | 22,5 ⚠ | 22,5 | 30 | 7,5 | 112,5 |
| Universitetet i Stavanger (UiS) | 30 | 30 | 20 | 30 | 10 | 120 |
| USN (Økonomi og ledelse) | 37,5 | 22,5 ⚠ | 15 | 22,5 | 7,5 | 105 |
| INN Lillehammer | 45 | 22,5 ⚠ | 15 | 22,5 | 7,5 | 112,5 |
| Nord universitet | 37,5 | 30 | 15 | 22,5 | 7,5 | 112,5 |
| HVL Bergen | 30 | 30 | 15 | 22,5 | 7,5 | 105 |
| Høgskolen i Østfold (HiØ) | 40 | 30 | 20 | 20 | 10 | 120 |
| BI | 45 | 22,5 ⚠ | 15 | 22,5 | 7,5 | 112,5 |
| Kristiania (campus) | 30 | 22,5 ⚠ | 15 | 22,5 | 7,5 | 97,5 |
| UiT Tromsø | 35 | 25 ⚠ | 20 | 15 ⚠ | 10 | 105 |
| NLA Høgskolen | 30 | 30 | 20 | 27,5 | 10 | 117,5 |
| Oslo Nye Høyskole (ONH) | 30 | 22,5 ⚠ | 15 | 22,5 | 15 | 105 |
| Høgskolen i Molde | 30 | 30 | 15 | 22,5 | 7,5 | 105 |
| INN Rena | 45 | 22,5 ⚠ | 15 | 22,5 | 7,5 | 112,5 |
| NTNU Gjøvik | 30 | 22,5 ⚠ | 15 | 22,5 | 7,5 | 97,5 |
| NTNU Ålesund | 30 | 22,5 ⚠ | 15 | 22,5 | 7,5 | 97,5 |
| Kristiania nett | 45 | 22,5 ⚠ | 15 | 22,5 | 7,5 | 112,5 |
| INN nett | 37,5 | 22,5 ⚠ | 15 | 22,5 | 7,5 | 105 |
| UiT nett | 35 | 25 ⚠ | 20 | 15 ⚠ | 10 | 105 |

### 3.2 De viktigste feilene

1. **UiT Tromsø, makro og mikro byttet om** (l. 1290 / l. 1476). `makrookonomi.uit` peker på SOK-1002 «Mikroøkonomi», og `mikrookonomi.uit` peker på SOK-1010 «Makroøkonomisk analyse». Det er samme feil som hos OsloMet, og `courseUrl` peker i tillegg på SOK-1018. Sikker.
2. **Systematisk 10 sp der emnet er 7,5 sp** hos UiA, USN, Nord, HVL, Kristiania, INN (begge), HiMolde, NTNU Gjøvik/Ålesund, ONH og UiT. NMBU har fire emner på 5 sp (AOS120, AOS130, ECN120, AOS240) som står som 10. Det påvirker alle summer og vekter. Sikker (DBH 208 og studieplaner).
3. **Feil emne for et område:** UiA strategi ORG126 (innovasjon og entreprenørskap; riktig ORG209 Strategisk ledelse), Nord metode ECO1003 (makro; riktig MET1001 Anvendt metode), BI økonomistyring BØK3430 (innføringsemnet; riktig BØK3541/BØK3561 + BØK3651), UiT økonomistyring BED-1502 (nettemne uten Tromsø-studenter; riktig BED-2019), UiT metode SVF-1050 (ingen ØA-kandidater; riktig BED-2011 til 2024), INN Rena statistikk SMET130 (nettkoden; riktig 3MET130). Sikker.
4. **Utgåtte eller nye koder uten karakterer for perioden:** NTNU statistikk (MET1002 → SØK1004 fra 2025), BI strategi (STR3610 har ingen karakterer ennå; data ligger på STR3605), USN (ny kode i 2024–2025 på 9 av 11 kjerneområder), UiT 2025 og UiT nett (7 av 11 koder finnes ikke i DBH). Sikker eller sannsynlig.
5. **Etikk, samfunnsansvar og bærekraft mangler som område** (UHR 2018: minst 7,5 sp). Ett emne per institusjon er funnet og lagt inn i JSON-en. Sikker for alle unntatt NMBU og UiT, der det ikke finnes et rent etikkemne.

Andre funn: innføringsemnet (`okonomi1`) er feil hos UiA (dobbelttelling av BE-110), USN (BØK1100 finnes ikke; riktig BØK1000), BI (eksamenskode i stedet for emnekode), UiT (BED-1004 er markedsføring) og HiMolde (ASM100 har ingen ØA-kandidater). NLA har studiepoengene på mikro, makro, matematikk og statistikk feil (10, ikke 7,5), og metode bør være HSM209. BI har integrert mikro og makro i SØK3420 og SØK3500 fra 2023/2024.

## 4. Detaljer per institusjon

Standardinstitusjonene i HH-sammenligningen først. «I dag» viser dagens kode med linjenummeret for `displayCode` i courseMapping.ts. «ØA-kandidater (område)» er for hvert år det største kandidattallet blant forslagskodene som gjaldt det året. For FEIL og UTGÅTT viser bevis-kolonnen også tallene for dagens kode.

### NMBU (`nmbu`)

Program: B-ØA (SO 192369). HH-program i DBH-tallene: nmbu_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | OK (sikker) | BUS110 (10 sp), l. 111 | BUS110 Finansregnskap og regnskapsanalyse (10 sp) | 87 / 66 / 61 / 80 / 99 |  |
| Økonomistyring | OK (sikker) | BUS210 (10 sp), l. 303 | BUS210 Økonomi- og virksomhetsstyring (10 sp) | 71 / 80 / 70 / 70 / 92 |  |
| Investering og finansiering | OK (sikker) | BUS220 (10 sp), l. 489 | BUS220 Finansiering og investering (10 sp) | 97 / 76 / 75 / 88 / 103 |  |
| Markedsføring | STUDIEPOENG (sikker) | AOS120 (10 sp), l. 676 | AOS120 Markedsføring (5 sp) | 86 / 71 / 49 / 66 / 149 | AOS120 er 5 sp i DBH 208 og i studieplanen (sto som 10 sp). I 2025 finnes to versjoner (AOS120-1: 72, AOS120-2: 77 ØA-kandidater), trolig to kull da emnet ble flyttet til 1. år; tallet 149 er summen. |
| Organisasjon og ledelse | STUDIEPOENG + DELVIS (sikker) | AOS130 (10 sp), l. 861 | AOS130 Innføring i organisasjonsteori (5 sp)<br>AOS230 Organisasjons- og ledelsespsykologi (5 sp)<br>AOS235 Praktisk endringsledelse (5 sp, fra 2025) | 83 / 70 / 56 / 74 / 75 | AOS130 er 5 sp (sto som 10). Organisasjon og ledelse dekkes i tillegg av AOS230 (obligatorisk år 3) og AOS235 (obligatorisk fra studieplan 2025/26; 59 ØA-kandidater i 2025). |
| Foretaksstrategi | OK (sikker) | AOS237 (10 sp), l. 1039 | AOS237 Foretaksstrategi (10 sp) | 47 / 75 / 61 / 57 / 67 |  |
| Makroøkonomi | STUDIEPOENG (sikker) | ECN120 (10 sp), l. 1226 | ECN120 Makroøkonomi I – Markeder, økonomisk utvikling, velferd og konjunkturer (5 sp) | 57 / 65 / 45 / 79 / 164 | ECN120 er 5 sp (sto som 10). 164 ØA-kandidater i 2025 skyldes trolig to kull (flytting fra år 2 til år 1). |
| Mikroøkonomi | DELVIS (sikker) | ECN210 (10 sp), l. 1412 | ECN210 Mikroøkonomi I – Konsument, produsent, marked og velferd (10 sp)<br>ECN110 Mikroøkonomi I – Hvordan tenke som en økonom (5 sp, til 2024) | 81 / 59 / 85 / 81 / 68 | Til og med 2024 tok ØA-studentene også ECN110 (5 sp); fra studieplan 2025 er ECN210 alene. |
| Matematikk | OK + UTGÅTT (sikker) | ECN102 (10 sp), l. 1600 | ECN102 Innføring i matematikk for økonomer (10 sp, fra 2023)<br>MATH100 Brukerkurs i matematikk (10 sp, til 2022) | 69 / 61 / 112 / 144 / 113 | ECN102 fra 2023; før det MATH100. |
| Statistikk | OK (sikker) | STAT100 (10 sp), l. 1786 | STAT100 Statistikk (10 sp) | 88 / 75 / 54 / 88 / 89 |  |
| Samf.vit. metode | STUDIEPOENG (sikker) | AOS240 (10 sp), l. 1978 | AOS240 Samfunnsvitenskapelig metode (5 sp)<br>ECN201 Econometrics (10 sp) | 50 / 72 / 49 / 49 / 67 | AOS240 er 5 sp (sto som 10). Studieplanen lar studentene velge AOS240 eller ECN201 (få velger ECN201). |
| Etikk, samfunnsansvar og bærekraft | MANGLER (usikker) | – | BUS180 Globale utfordringer II. Miljø- og samfunnsmessige utfordringer i næringslivet (5 sp)<br>ECN180 Globale utfordringer I. Økonomi og bærekraft (5 sp) | 82 / 60 / 60 / 70 / 80 | NMBU har ikke et rent etikkemne. BUS180 og ECN180 er obligatoriske og dekker bærekraft og samfunnsansvar; om de dekker etikkravet (minst 7,5 sp, egen etikksekvens) må avklares med studieprogrammet. |
| Innføring i bedriftsøkonomi (tillegg) | OK (sikker) | BUS101 (5 sp), l. 2169 | BUS101 Bedriftsøkonomiske sammenhenger (5 sp) | 70 / 49 / 71 / 70 / 69 | Riktig kode, men navnet er «Bedriftsøkonomiske sammenhenger» i DBH og studieplan (sto som «Bedriften»). |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 35, administrasjon 30, samfunnsøkonomi 15, metode 25, etikk 10; **115 sp**.

### NHH (`nhh`)

Program: BACHELOR/BACHELOR15 (SO 191345). HH-program i DBH-tallene: nhh_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | OK (sikker) | BED2 (7,5 sp), l. 141 | BED2 Finansregnskap (7,5 sp) | 570 / 548 / 612 / 565 / 534 |  |
| Økonomistyring | DELVIS (sannsynlig) | BED5 (7,5 sp), l. 327 | BED5 Økonomisk styring (7,5 sp)<br>BED4 Bedriftsøkonomiske beslutninger (7,5 sp) | 554 / 471 / 578 / 591 / 516 | BED4 (obligatorisk, 470–590 kandidater) dekker kalkyle og beslutningsanalyse, som UHR legger under økonomistyring. Bør vurderes som del av området. |
| Investering og finansiering | OK (sikker) | BED3 (7,5 sp), l. 513 | BED3 Investering og finans (7,5 sp) | 505 / 381 / 364 / 399 / 424 |  |
| Markedsføring | OK (sikker) | SOL2 (7,5 sp), l. 699 | SOL2 Markedsføring (7,5 sp) | 507 / 467 / 485 / 431 / 441 |  |
| Organisasjon og ledelse | DELVIS (sikker) | SOL3 (7,5 sp), l. 885 | SOL3 Organisasjonen (7,5 sp)<br>SOL1 Psykologi og ledelse (7,5 sp) | 529 / 507 / 535 / 538 / 496 | SOL1 er obligatorisk (430–535 kandidater) og dekker ledelse. |
| Foretaksstrategi | OK (sikker) | SOL4 (7,5 sp), l. 1063 | SOL4 Strategisk ledelse (7,5 sp) | 407 / 337 / 388 / 380 / 450 |  |
| Makroøkonomi | OK (sikker) | SAM3 (7,5 sp), l. 1250 | SAM3 Makroøkonomi (7,5 sp) | 581 / 299 / 402 / 512 / 508 |  |
| Mikroøkonomi | OK (sikker) | SAM2 (7,5 sp), l. 1436 | SAM2 Mikroøkonomi (7,5 sp) | 540 / 513 / 509 / 466 / 439 |  |
| Matematikk | OK (sikker) | MET1 (7,5 sp), l. 1624 | MET1 Matematikk for økonomer (7,5 sp) | 524 / 607 / 580 / 585 / 457 |  |
| Statistikk | OK (sikker) | MET2 (7,5 sp), l. 1816 | MET2 Statistikk for økonomer (7,5 sp) | 514 / 445 / 530 / 426 / 420 |  |
| Samf.vit. metode | OK (sikker) | MET4 (7,5 sp), l. 2002 | MET4 Empiriske metoder (7,5 sp) | 574 / 537 / 463 / 543 / 470 | MET3 Databehandling for økonomer (7,5) er også obligatorisk metodefag. |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | SAM1A Etikk, økonomi og bærekraft (7,5 sp, fra 2024)<br>IKE1 Introduksjonskurs i etikk (3,75 sp, til 2023) | 502 / 520 / 450 / 422 / 424 | SAM1A fra 2024 (ca. 420 kandidater); før det IKE1 (3,75 sp). |
| Innføring i bedriftsøkonomi (tillegg) | OK (sikker) | BED1 (7,5 sp), l. 2197 | BED1 Grunnleggende bedriftsøkonomi (7,5 sp) | 538 / 577 / 512 / 485 / 531 |  |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 37,5, administrasjon 30, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **112,5 sp**.

### NTNU Trondheim (`ntnu`)

Program: BØA/ØABACHELOR/BØAT (SO 194035; DBH-koden BØA dekker også Gjøvik og Ålesund 2022–2024). HH-program i DBH-tallene: ntnu_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | OK (sikker) | BØA1200 (7,5 sp), l. 173 | BØA1200 Finansregnskap med analyse (7,5 sp) | 319 / 265 / 183 / 201 / 216 |  |
| Økonomistyring | OK (sikker) | BØA2100 (7,5 sp), l. 359 | BØA2100 Driftsregnskap med budsjettering (7,5 sp) | 282 / 240 / 207 / 166 / 176 |  |
| Investering og finansiering | OK (sikker) | BØA2200 (7,5 sp), l. 544 | BØA2200 Investering og finansiering (7,5 sp) | 298 / 283 / 226 / 177 / 193 |  |
| Markedsføring | OK (sikker) | MRK1001 (7,5 sp), l. 731 | MRK1001 Markedsføring (7,5 sp) | 283 / 230 / 199 / 207 / 193 | DBH-navn «Markedsføring – grunnkurs». |
| Organisasjon og ledelse | OK (sikker) | ORG1100 (7,5 sp), l. 917 | ORG1100 Organisasjon og ledelse (7,5 sp) | 317 / 215 / 224 / 255 / 166 |  |
| Foretaksstrategi | OK (sikker) | ORG2002 (7,5 sp), l. 1094 | ORG2002 Foretaksstrategi (7,5 sp) | 277 / 242 / 196 / 170 / 152 |  |
| Makroøkonomi | OK (sikker) | SMØ2001 (7,5 sp), l. 1282 | SMØ2001 Makroøkonomi I (7,5 sp) | 244 / 204 / 179 / 141 / 168 |  |
| Mikroøkonomi | OK (sikker) | SMØ1001 (7,5 sp), l. 1468 | SMØ1001 Mikroøkonomi (7,5 sp) | 317 / 305 / 205 / 253 / 211 |  |
| Matematikk | OK (sikker) | MET1001 (7,5 sp), l. 1656 | MET1001 Matematikk for økonomer (7,5 sp) | 259 / 258 / 218 / 225 / 155 |  |
| Statistikk | UTGÅTT (sikker) | MET1002 (7,5 sp), l. 1848 | SØK1004 Statistikk for økonomer (7,5 sp, fra 2025)<br>MET1002 Statistikk for økonomer (7,5 sp, til 2024) | 275 / 223 / 202 / 201 / 179 | MET1002 hadde 200–275 ØA-kandidater per år til 2024 og bare 42 i 2025 (konteeksamen). SØK1004 har 179 i 2025. Dagens kode MET1002: 275 / 223 / 202 / 201 / 42. |
| Samf.vit. metode | OK (sikker) | MET3001 (7,5 sp), l. 2034 | MET3001 Kvantitative og kvalitative metoder (7,5 sp) | 293 / 293 / 194 / 178 / 164 |  |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | INT3001 Etikk, bærekraft og samfunnsansvar (7,5 sp) | 457 / 260 / 219 / 159 / 140 |  |
| Innføring i bedriftsøkonomi (tillegg) | OK (sikker) | BØA1100 (7,5 sp), l. 2225 | BØA1100 Bedriftsøkonomi med regnskap (7,5 sp) | 284 / 209 / 228 / 285 / 209 |  |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 30, administrasjon 22,5, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **97,5 sp**.

### OsloMet (`oslomet`)

Program: OKAD (SO 215369). HH-program i DBH-tallene: oslomet_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | OK (sikker) | ØABED1000 (7,5 sp), l. 165 | ØABED1000 Grunnleggende årsregnskap med Excel (7,5 sp) | 266 / 312 / 332 / 303 / 347 |  |
| Økonomistyring | OK (sikker) | ØABED2100 (7,5 sp), l. 351 | ØABED2100 Økonomistyring (7,5 sp) | 251 / 215 / 223 / 248 / 295 |  |
| Investering og finansiering | OK (sikker) | ØABED2000 (7,5 sp), l. 536 | ØABED2000 Investering og finansiering (7,5 sp) | 192 / 184 / 238 / 268 / 243 |  |
| Markedsføring | OK (sikker) | ØAADM1001 (7,5 sp), l. 723 | ØAADM1001 Markedsføring (7,5 sp) | 227 / 250 / 275 / 290 / 259 |  |
| Organisasjon og ledelse | DELVIS (sikker) | ØAADM2100 (7,5 sp), l. 909 | ØAADM2100 Organisasjonsforståelse (7,5 sp)<br>ØAADM1100 Organisasjonspsykologi (7,5 sp) | 212 / 213 / 243 / 259 / 264 | ØAADM1100 er obligatorisk i 1. år (210–265 kandidater). |
| Foretaksstrategi | OK (sikker) | ØAADM2000 (7,5 sp), l. 1086 | ØAADM2000 Foretaksstrategi (7,5 sp) | 205 / 174 / 189 / 217 / 238 |  |
| Makroøkonomi | OK (sikker) | ØASØK1100 (7,5 sp), l. 1274 | ØASØK1100 Makroøkonomi I (7,5 sp) | 215 / 211 / 239 / 282 / 253 | Rettet 17.10. |
| Mikroøkonomi | OK (sikker) | ØASØK1000 (7,5 sp), l. 1460 | ØASØK1000 Mikroøkonomi I (7,5 sp) | 256 / 272 / 275 / 280 / 287 | Rettet 17.10. |
| Matematikk | OK (sikker) | ØAMET1000 (7,5 sp), l. 1648 | ØAMET1000 Matematikk I (7,5 sp) | 231 / 277 / 282 / 297 / 323 |  |
| Statistikk | OK (sikker) | ØAMET1100 (7,5 sp), l. 1840 | ØAMET1100 Statistikk (7,5 sp) | 219 / 212 / 250 / 249 / 269 |  |
| Samf.vit. metode | DELVIS (sannsynlig) | ØAMET2100 (7,5 sp), l. 2026 | ØAMET2100 Samfunnsvitenskapelig metode (7,5 sp)<br>ØAMET2200 Business Decision-Making Using Data (7,5 sp) | 125 / 102 / 138 / 132 / 175 | Kullet fordeler seg mellom ØAMET2100 og ØAMET2200: summen er 180/193/214/236/236 i 2021–2025, omtrent hele kullet, og andelen på ØAMET2200 har økt fra 31 % til 74 %. Ser ut som et valg mellom to metodeemner; programplanen var ikke tilgjengelig (403). |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | ØAETI2000 Etikk, bærekraft og samfunnsansvar (7,5 sp) | 159 / 127 / 164 / 177 / 186 |  |
| Innføring i bedriftsøkonomi (tillegg) | OK (sikker) | ØABED1100 (7,5 sp), l. 2218 | ØABED1100 Bedriftsøkonomi med IKT (7,5 sp) | 264 / 234 / 272 / 309 / 281 |  |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 30, administrasjon 30, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **105 sp**.

### Universitetet i Agder (UiA) (`uia`)

Program: BACØKAD (SO 201369). HH-program i DBH-tallene: uia_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | STUDIEPOENG + DELVIS (sikker) | BE-111 (10 sp), l. 125 | BE-111 Innføring i finansregnskap (7,5 sp)<br>BE-209 Finansregnskap og rapportering (7,5 sp) | 266 / 253 / 251 / 293 / 340 | Alle UiAs emner i programmet er 7,5 sp i DBH 208 og studieplanen 2026h (sto som 10 sp). BE-209 er obligatorisk videreføring (240–340 ØA-kandidater per år). |
| Økonomistyring | STUDIEPOENG (sikker) | BE-110 (10 sp), l. 311 | BE-110 Innføring i økonomisk styring (7,5 sp) | 216 / 243 / 225 / 207 / 257 | Alle UiAs emner i programmet er 7,5 sp i DBH 208 og studieplanen 2026h (sto som 10 sp). |
| Investering og finansiering | STUDIEPOENG (sikker) | BE-210 (10 sp), l. 497 | BE-210 Investering og finansiering (7,5 sp) | 222 / 219 / 228 / 246 / 222 | Alle UiAs emner i programmet er 7,5 sp i DBH 208 og studieplanen 2026h (sto som 10 sp). |
| Markedsføring | STUDIEPOENG (sikker) | MF-102 (10 sp), l. 683 | MF-102 Markedsføring (7,5 sp) | 189 / 258 / 245 / 230 / 258 | Alle UiAs emner i programmet er 7,5 sp i DBH 208 og studieplanen 2026h (sto som 10 sp). |
| Organisasjon og ledelse | STUDIEPOENG (sikker) | ORG109 (10 sp), l. 869 | ORG109 Organisasjonsteori (7,5 sp) | 284 / 234 / 213 / 244 / 240 | Alle UiAs emner i programmet er 7,5 sp i DBH 208 og studieplanen 2026h (sto som 10 sp). |
| Foretaksstrategi | FEIL (sikker) | ORG126 (10 sp), l. 1047 | ORG209 Strategisk ledelse (7,5 sp) | 234 / 193 / 252 / 191 / 199 | ORG126 er «Innovasjon og entreprenørskap». Strategiemnet er ORG209 Strategisk ledelse (obligatorisk 6. semester, 191–252 ØA-kandidater per år). Dagens kode ORG126: 199 / 296 / 259 / 215 / 229. |
| Makroøkonomi | STUDIEPOENG + DELVIS (sikker) | SE-204 (10 sp), l. 1234 | SE-204 Makroøkonomi (7,5 sp)<br>SE-112 Grunnleggende samfunnsøkonomi (7,5 sp) | 331 / 246 / 248 / 287 / 289 | Alle UiAs emner i programmet er 7,5 sp i DBH 208 og studieplanen 2026h (sto som 10 sp). SE-112 er et obligatorisk innføringsemne i både mikro og makro. |
| Mikroøkonomi | STUDIEPOENG (sikker) | SE-213 (10 sp), l. 1420 | SE-213 Mikroøkonomi (7,5 sp) | 212 / 237 / 204 / 224 / 238 | Alle UiAs emner i programmet er 7,5 sp i DBH 208 og studieplanen 2026h (sto som 10 sp). |
| Matematikk | STUDIEPOENG (sikker) | MA-138 (10 sp), l. 1608 | MA-138 Matematikk med anvendelse i økonomi (7,5 sp) | 227 / 283 / 233 / 245 / 281 | Alle UiAs emner i programmet er 7,5 sp i DBH 208 og studieplanen 2026h (sto som 10 sp). |
| Statistikk | STUDIEPOENG + DELVIS (sikker) | ME-111 (10 sp), l. 1800 | ME-111 Innføring i dataanalyse (7,5 sp)<br>ME-201 Kvantitativ dataanalyse (7,5 sp) | 216 / 279 / 237 / 217 / 233 | Alle UiAs emner i programmet er 7,5 sp i DBH 208 og studieplanen 2026h (sto som 10 sp). ME-201 er også obligatorisk. |
| Samf.vit. metode | STUDIEPOENG (sikker) | ME-112 (10 sp), l. 1986 | ME-112 Social Scientific Methods (7,5 sp) | 229 / 234 / 206 / 220 / 254 | Alle UiAs emner i programmet er 7,5 sp i DBH 208 og studieplanen 2026h (sto som 10 sp). |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | TFL126 Etikk, bærekraft og bedrifters samfunnsansvar (7,5 sp) | 253 / 223 / 210 / 238 / 231 | Obligatorisk 1. semester. |
| Innføring i bedriftsøkonomi (tillegg) | FEIL (sikker) | BE-110 (10 sp), l. 2183 | – | – | BE-110 står både under økonomistyring og som innføringsemne og telles dobbelt. UiA har ikke et eget innføringsemne i bedriftsøkonomi; fjern oppføringen. Dagens kode BE-110: 216 / 243 / 225 / 207 / 257. |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 30, administrasjon 22,5, samfunnsøkonomi 22,5, metode 30, etikk 7,5; **112,5 sp**.

### Universitetet i Stavanger (UiS) (`uis`)

Program: B-ØKAD (SO 217369). HH-program i DBH-tallene: uis_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | OK (sikker) | BØK195 (10 sp), l. 197 | BØK195 Grunnleggende regnskap og bedriftsøkonomi (10 sp) | 170 / 161 / 214 / 246 / 303 | Kombinert regnskap og bedriftsøkonomi. BØK440 Finansregnskap og verdsettelse er valgfritt (60–80). |
| Økonomistyring | OK + UTGÅTT (sikker) | BØK301 (10 sp), l. 383 | BØK301 Driftsregnskap og økonomistyring (10 sp, fra 2023)<br>BØK103 Driftsregnskap og økonomistyring (10 sp, til 2022) | 61 / 10 / 190 / 346 / 223 |  |
| Investering og finansiering | OK (sikker) | BØK260 (10 sp), l. 568 | BØK260 Corporate Finance (10 sp) | 150 / 367 / 235 / 171 / 255 |  |
| Markedsføring | OK (usikker) | BØK250 (10 sp), l. 755 | BØK250 Markedsføring (10 sp) | 169 / 152 / 166 / 187 / 0 | Ingen karakterer i 2025 på hele emnet (heller ikke på emnenivå). Sjekk om emnet er flyttet eller har fått ny kode. |
| Organisasjon og ledelse | OK + UTGÅTT (sikker) | BØK415 (10 sp), l. 941 | BØK415 Ledelse og organisasjonspsykologi (10 sp, fra 2024)<br>BØK225 Organisasjon, ressurser og ledelse (10 sp, til 2023) | 225 / 165 / 186 / 180 / 199 | BØK415 ble obligatorisk i 2024 (180/199); før det BØK225. |
| Foretaksstrategi | OK (sikker) | BØK235 (10 sp), l. 1118 | BØK235 Strategy (10 sp) | 333 / 189 / 3 / 0 / 145 |  |
| Makroøkonomi | OK (sikker) | BØK255 (10 sp), l. 1306 | BØK255 Makroøkonomi (10 sp) | 145 / 172 / 147 / 186 / 354 |  |
| Mikroøkonomi | OK (sikker) | BØK265 (10 sp), l. 1492 | BØK265 Mikroøkonomi (10 sp) | 251 / 189 / 226 / 260 / 201 |  |
| Matematikk | OK (sikker) | BØK108 (10 sp), l. 1680 | BØK108 Matematisk metode for økonomer (10 sp) | 191 / 299 / 274 / 246 / 243 |  |
| Statistikk | OK (sikker) | BØK356 (10 sp), l. 1872 | BØK356 Statistics For Business and Economics (10 sp, fra 2022) | 0 / 195 / 371 / 235 / 201 | Data fra 2022. |
| Samf.vit. metode | OK (sannsynlig) | BØK295 (10 sp), l. 2059 | BØK295 Samfunnsvitenskapelig metode for arbeidslivet (10 sp, fra 2024) | 0 / 0 / 0 / 152 / 149 | Data fra 2024; forgjenger før 2024 ikke funnet blant ØA-emnene. |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | BØK109 Etikk, samfunnsansvar og bærekraft (10 sp) | 191 / 211 / 207 / 216 / 245 |  |
| Innføring i bedriftsøkonomi (tillegg) | MANGLER (sannsynlig) | – | – | – | Bedriftsøkonomi er slått sammen med regnskap i BØK195. |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 30, administrasjon 30, samfunnsøkonomi 20, metode 30, etikk 10; **120 sp**.

### USN (Økonomi og ledelse) (`usn`)

Program: Økonomi og ledelse, OKLED (SO 222330; DBH-koden dekker alle campuser). HH-program i DBH-tallene: usn_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | STUDIEPOENG + DELVIS, UTGÅTT (sikker) | REG1010 (10 sp), l. 133 | REG1010 Finansregnskap med analyse (7,5 sp, fra 2025)<br>FIN1000 Finansregnskap med analyse (7,5 sp, til 2024)<br>REG1000 Grunnleggende regnskap (7,5 sp) | 423 / 429 / 465 / 439 / 483 | Alle emnene er 7,5 sp (sto som 10). REG1010 avløste FIN1000 i 2025. REG1000 Grunnleggende regnskap er obligatorisk i tillegg (400–480 ØA-kandidater per år). |
| Økonomistyring | STUDIEPOENG + UTGÅTT (sikker) | BØK2000 (10 sp), l. 319 | BØK2000 Driftsregnskap og budsjettering (7,5 sp, fra 2025)<br>DRI2000 Driftsregnskap og budsjettering (7,5 sp, til 2024) | 383 / 325 / 355 / 331 / 309 | Alle emnene er 7,5 sp (sto som 10). Ny kode fra 2025. |
| Investering og finansiering | STUDIEPOENG + UTGÅTT (sikker) | FIN2000 (10 sp), l. 505 | FIN2000 Finansiering og investering (7,5 sp, fra 2024)<br>INV2000 Finansiering og investering (7,5 sp, til 2024) | 391 / 343 / 319 / 258 / 390 | Alle emnene er 7,5 sp (sto som 10). Ny kode fra 2024. |
| Markedsføring | STUDIEPOENG (sikker) | MAR1000 (10 sp), l. 691 | MAR1000 Markedsføringsledelse (7,5 sp) | 349 / 362 / 354 / 396 / 489 | Alle emnene er 7,5 sp (sto som 10). |
| Organisasjon og ledelse | STUDIEPOENG (sikker) | ORL1000 (10 sp), l. 877 | ORL1000 Organisering og ledelse (7,5 sp) | 353 / 317 / 334 / 276 / 381 | Alle emnene er 7,5 sp (sto som 10). |
| Foretaksstrategi | STUDIEPOENG + UTGÅTT (sikker) | STR1000 (10 sp), l. 1055 | STR1000 Strategisk ledelse (7,5 sp, fra 2024)<br>STR2000 Strategisk ledelse (7,5 sp, til 2023) | 300 / 274 / 282 / 253 / 326 | Alle emnene er 7,5 sp (sto som 10). Ny kode fra 2024. |
| Makroøkonomi | STUDIEPOENG + UTGÅTT (sikker) | SØK1010 (10 sp), l. 1242 | SØK1010 Makroøkonomi (7,5 sp, fra 2025)<br>MAK2000 Makroøkonomi (7,5 sp, til 2024) | 340 / 330 / 271 / 318 / 294 | Alle emnene er 7,5 sp (sto som 10). Ny kode fra 2025. |
| Mikroøkonomi | STUDIEPOENG + UTGÅTT (sikker) | SØK1000 (10 sp), l. 1428 | SØK1000 Mikroøkonomi (7,5 sp, fra 2024)<br>MIK2000 Mikroøkonomi (7,5 sp, til 2024) | 331 / 348 / 346 / 260 / 405 | Alle emnene er 7,5 sp (sto som 10). Ny kode fra 2024. |
| Matematikk | STUDIEPOENG + UTGÅTT (sikker) | MET1000 (10 sp), l. 1616 | MET1000 Matematikk for økonomer (7,5 sp, fra 2024)<br>MAT1000 Matematikk for økonomer (7,5 sp, til 2024) | 427 / 400 / 470 / 389 / 510 | Alle emnene er 7,5 sp (sto som 10). Ny kode fra 2024. |
| Statistikk | STUDIEPOENG + UTGÅTT (sikker) | MET1010 (10 sp), l. 1808 | MET1010 Statistikk for økonomer (7,5 sp, fra 2025)<br>STA1000 Statistikk for økonomer (7,5 sp, til 2024) | 386 / 336 / 339 / 388 / 459 | Alle emnene er 7,5 sp (sto som 10). Ny kode fra 2025. |
| Samf.vit. metode | STUDIEPOENG + UTGÅTT (sikker) | MET1020 (10 sp), l. 1994 | MET1020 Samfunnsvitenskapelig metode (7,5 sp, fra 2025)<br>SAM2000 Samfunnsvitenskapelig metode (7,5 sp, til 2024) | 297 / 298 / 250 / 325 / 270 | Alle emnene er 7,5 sp (sto som 10). Ny kode fra 2025. |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | ESB1000 Etikk og samfunnsansvar (7,5 sp, fra 2024)<br>ETI1000 Etikk og samfunnsansvar (7,5 sp, til 2023) | 383 / 362 / 372 / 379 / 411 |  |
| Innføring i bedriftsøkonomi (tillegg) | FEIL (sikker) | BØK1100 (10 sp), l. 2190 | BØK1000 Bedriftsøkonomi (7,5 sp, fra 2025)<br>BED1000 Bedriftsøkonomi (7,5 sp, til 2024) | 471 / 394 / 367 / 329 / 465 | BØK1100 finnes ikke i USNs DBH-data 2021–2025; emnet heter BØK1000 (fra 2025, før BED1000). Dagens kode BØK1100: –. |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 37,5, administrasjon 22,5, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **105 sp**.

### INN Lillehammer (`inn`)

Program: BØADM Lillehammer (SO 209035). HH-program i DBH-tallene: inn_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | STUDIEPOENG + DELVIS (sikker) | ØKA1012 (10 sp), l. 205 | ØKA1012 Grunnleggende regnskap (7,5 sp)<br>ØKA1014 Videregående regnskap (7,5 sp) | 90 / 101 / 99 / 112 / 96 | Emnet er 7,5 sp i DBH (sto som 10). ØKA1014 er også obligatorisk (60–90). |
| Økonomistyring | STUDIEPOENG + DELVIS (sikker) | ØKA2002 (10 sp), l. 391 | ØKA2002 Økonomistyring (7,5 sp)<br>ØKA2004 Virksomhetsstyring (7,5 sp) | 103 / 58 / 64 / 78 / 78 | Emnet er 7,5 sp i DBH (sto som 10). ØKA2004 Virksomhetsstyring tas av de fleste (42–77). |
| Investering og finansiering | STUDIEPOENG (sikker) | ØKA1019 (10 sp), l. 576 | ØKA1019 Investments and Financial Management (7,5 sp) | 64 / 80 / 64 / 71 / 89 | Emnet er 7,5 sp i DBH (sto som 10). |
| Markedsføring | STUDIEPOENG (sikker) | ØKA1013 (10 sp), l. 763 | ØKA1013 Markedsføring (7,5 sp) | 70 / 66 / 70 / 60 / 69 | Emnet er 7,5 sp i DBH (sto som 10). |
| Organisasjon og ledelse | STUDIEPOENG (sikker) | ØKA1017 (10 sp), l. 949 | ØKA1017 Organisasjonsforståelse (7,5 sp) | 76 / 64 / 55 / 57 / 55 | Emnet er 7,5 sp i DBH (sto som 10). |
| Foretaksstrategi | STUDIEPOENG (sikker) | ØKA1021 (10 sp), l. 1126 | ØKA1021 Strategy (7,5 sp) | 69 / 56 / 53 / 55 / 57 | Emnet er 7,5 sp i DBH (sto som 10). |
| Makroøkonomi | OK (sikker) | ØKA1022 (7,5 sp), l. 1314 | ØKA1022 Makroøkonomi (7,5 sp) | 66 / 73 / 59 / 49 / 75 |  |
| Mikroøkonomi | OK (sikker) | ØKA1020 (7,5 sp), l. 1500 | ØKA1020 Mikroøkonomi 1 (7,5 sp) | 78 / 73 / 56 / 85 / 78 |  |
| Matematikk | OK (sikker) | ØKA1025 (7,5 sp), l. 1688 | ØKA1025 Matematikk for økonomer (7,5 sp) | 77 / 84 / 81 / 80 / 85 |  |
| Statistikk | OK (sikker) | ØKA1026 (7,5 sp), l. 1880 | ØKA1026 Statistikk for økonomer (7,5 sp) | 78 / 80 / 60 / 85 / 75 |  |
| Samf.vit. metode | STUDIEPOENG (sikker) | ØKA1023 (5 sp), l. 2067 | ØKA1023 Samfunnsvitenskapelig metode (7,5 sp) | 66 / 56 / 49 / 56 / 74 | ØKA1023 er 7,5 sp (sto som 5). |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | OLA1008 Etikk og samfunnsansvar (7,5 sp) | 55 / 62 / 55 / 48 / 55 |  |
| Innføring i bedriftsøkonomi (tillegg) | MANGLER (sikker) | – | ØKA1016 Grunnleggende bedriftsøkonomi (7,5 sp) | 71 / 69 / 56 / 81 / 68 |  |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 45, administrasjon 22,5, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **112,5 sp**.

### Nord universitet (`nord`)

Program: BAØKLED (Bodø og Steinkjer har samme DBH-kode). HH-program i DBH-tallene: nord_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | STUDIEPOENG + DELVIS (sikker) | FIN1001 (10 sp), l. 221 | FIN1001 Innføring i regnskap (7,5 sp)<br>REG1001 Regnskapsanalyse og verdsettelse (7,5 sp) | 82 / 107 / 88 / 65 / 94 | Alle Nords emner i BAØKLED er 7,5 sp i DBH (sto som 10). REG1001 er obligatorisk (60–107). |
| Økonomistyring | STUDIEPOENG (sikker) | REG1002 (10 sp), l. 407 | REG1002 Driftsregnskap og budsjettering (7,5 sp) | 88 / 93 / 97 / 84 / 70 | Alle Nords emner i BAØKLED er 7,5 sp i DBH (sto som 10). |
| Investering og finansiering | STUDIEPOENG (sikker) | FIN1002 (10 sp), l. 592 | FIN1002 Finansiering og investering (7,5 sp) | 87 / 103 / 87 / 62 / 92 | Alle Nords emner i BAØKLED er 7,5 sp i DBH (sto som 10). |
| Markedsføring | STUDIEPOENG (sikker) | MAF1001 (10 sp), l. 779 | MAF1001 Markedsføring (7,5 sp) | 79 / 58 / 73 / 92 / 105 | Alle Nords emner i BAØKLED er 7,5 sp i DBH (sto som 10). |
| Organisasjon og ledelse | STUDIEPOENG + DELVIS (sikker) | ORG1001 (10 sp), l. 965 | ORG1001 Organisasjon (7,5 sp)<br>LED1001 Ledelse (7,5 sp) | 76 / 95 / 70 / 47 / 89 | Alle Nords emner i BAØKLED er 7,5 sp i DBH (sto som 10). LED1001 Ledelse er obligatorisk (46–95). |
| Foretaksstrategi | STUDIEPOENG (sannsynlig) | ORG2001 (10 sp), l. 1142 | ORG2001 Internasjonal foretagsstrategi (7,5 sp) | 0 / 59 / 73 / 50 / 41 | Alle Nords emner i BAØKLED er 7,5 sp i DBH (sto som 10). Bare 41–73 kandidater; kan være valgemne. |
| Makroøkonomi | STUDIEPOENG (sikker) | ECO1003 (10 sp), l. 1330 | ECO1003 Samfunnsøkonomi, makro (7,5 sp) | 82 / 90 / 102 / 84 / 62 | Alle Nords emner i BAØKLED er 7,5 sp i DBH (sto som 10). |
| Mikroøkonomi | STUDIEPOENG (sikker) | ECO1001 (10 sp), l. 1516 | ECO1001 Samfunnsøkonomi, mikro (7,5 sp) | 92 / 109 / 104 / 73 / 95 | Alle Nords emner i BAØKLED er 7,5 sp i DBH (sto som 10). |
| Matematikk | STUDIEPOENG (sikker) | MAT1001 (10 sp), l. 1704 | MAT1001 Matematikk (7,5 sp) | 87 / 76 / 90 / 127 / 132 | Alle Nords emner i BAØKLED er 7,5 sp i DBH (sto som 10). |
| Statistikk | STUDIEPOENG (sikker) | STT1001 (10 sp), l. 1896 | STT1001 Statistikk (7,5 sp) | 86 / 100 / 58 / 72 / 89 | Alle Nords emner i BAØKLED er 7,5 sp i DBH (sto som 10). |
| Samf.vit. metode | FEIL (sikker) | ECO1003 (10 sp), l. 2084 | MET1001 Anvendt metode (7,5 sp) | 74 / 81 / 98 / 88 / 62 | ECO1003 er makroøkonomi; merknaden om at Nord kombinerer samfunnsøkonomi og metode stemmer ikke. Metodeemnet er MET1001 Anvendt metode (62–98). Dagens kode ECO1003: 82 / 90 / 102 / 84 / 62. |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | FIL1001 Ex.phil. Etikk, bærekraft og samfunnsansvar (7,5 sp) | 85 / 70 / 78 / 98 / 126 |  |
| Innføring i bedriftsøkonomi (tillegg) | MANGLER (sikker) | – | ECO1002 Bedriftsøkonomisk analyse med programvare (7,5 sp) | 88 / 70 / 72 / 116 / 120 |  |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 37,5, administrasjon 30, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **112,5 sp**.

### HVL Bergen (`hvl`)

Program: ØAU3 Bergen (SO 203369). HH-program i DBH-tallene: hvl_bergen_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | STUDIEPOENG (sikker) | BØA117 (10 sp), l. 229 | BØA117 Finansregnskap med analyse (7,5 sp) | 189 / 146 / 151 / 135 / 174 | Alle HVLs emner i ØAU3 er 7,5 sp i DBH (sto som 10). |
| Økonomistyring | STUDIEPOENG (sikker) | BØA205 (10 sp), l. 415 | BØA205 Økonomistyring (7,5 sp) | 127 / 140 / 147 / 137 / 141 | Alle HVLs emner i ØAU3 er 7,5 sp i DBH (sto som 10). |
| Investering og finansiering | STUDIEPOENG (sikker) | BØA204 (10 sp), l. 600 | BØA204 Investering og finansiering (7,5 sp) | 145 / 164 / 142 / 148 / 168 | Alle HVLs emner i ØAU3 er 7,5 sp i DBH (sto som 10). |
| Markedsføring | STUDIEPOENG (sikker) | BØA116 (10 sp), l. 787 | BØA116 Markedsføring (7,5 sp) | 166 / 144 / 139 / 116 / 163 | Alle HVLs emner i ØAU3 er 7,5 sp i DBH (sto som 10). |
| Organisasjon og ledelse | STUDIEPOENG + DELVIS (sikker) | BØA112 (10 sp), l. 973 | BØA112 Organisasjon og ledelse (7,5 sp)<br>ØAO019 Organisasjon og ledelse 2 (7,5 sp, fra 2024)<br>ØAO018 Organisasjon 2 og digitalisering (7,5 sp, til 2023) | 134 / 185 / 145 / 171 / 122 | Alle HVLs emner i ØAU3 er 7,5 sp i DBH (sto som 10). Organisasjon 2 er også obligatorisk. |
| Foretaksstrategi | STUDIEPOENG (sikker) | ØAO016 (10 sp), l. 1150 | ØAO016 Strategi og virksomhetsutvikling (7,5 sp) | 114 / 121 / 116 / 106 / 113 | Alle HVLs emner i ØAU3 er 7,5 sp i DBH (sto som 10). |
| Makroøkonomi | STUDIEPOENG (sikker) | BØA118 (10 sp), l. 1338 | BØA118 Makroøkonomi (7,5 sp) | 190 / 147 / 160 / 150 / 184 | Alle HVLs emner i ØAU3 er 7,5 sp i DBH (sto som 10). |
| Mikroøkonomi | STUDIEPOENG (sikker) | BØA203 (10 sp), l. 1524 | BØA203 Mikroøkonomi 1 (7,5 sp) | 185 / 155 / 189 / 146 / 163 | Alle HVLs emner i ØAU3 er 7,5 sp i DBH (sto som 10). |
| Matematikk | STUDIEPOENG (sikker) | BØA111 (10 sp), l. 1712 | BØA111 Matematikk for økonomer (7,5 sp) | 147 / 170 / 151 / 169 / 117 | Alle HVLs emner i ØAU3 er 7,5 sp i DBH (sto som 10). |
| Statistikk | STUDIEPOENG (sikker) | BØA115 (10 sp), l. 1904 | BØA115 Statistikk for økonomer (7,5 sp) | 178 / 145 / 139 / 149 / 172 | Alle HVLs emner i ØAU3 er 7,5 sp i DBH (sto som 10). |
| Samf.vit. metode | STUDIEPOENG (sikker) | ØMO111 (10 sp), l. 2093 | ØMO111 Samfunnsvitenskapelig metode (7,5 sp) | 93 / 254 / 117 / 130 / 143 | Alle HVLs emner i ØAU3 er 7,5 sp i DBH (sto som 10). |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | BØA202 Etikk, samfunnsansvar og bærekraft (7,5 sp) | 145 / 128 / 130 / 147 / 153 |  |
| Innføring i bedriftsøkonomi (tillegg) | MANGLER (sikker) | – | BØA113 Innføring i bedriftsøkonomi og regnskap (7,5 sp) | 158 / 168 / 145 / 178 / 133 |  |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 30, administrasjon 30, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **105 sp**.

### Høgskolen i Østfold (HiØ) (`hio`)

Program: BØA Halden (DBH BOKAD, SO 224035). HH-program i DBH-tallene: hiof_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | OK (sikker) | SFB10419 (10 sp), l. 104 | SFB10419 Finansregnskap med analyse 1 (10 sp) | 91 / 72 / 94 / 138 / 108 | Obligatorisk, hele kullet. |
| Økonomistyring | OK (sikker) | SFB10613 (10 sp), l. 296 | SFB10613 Budsjettering og driftsregnskap (10 sp) | 74 / 66 / 75 / 83 / 107 |  |
| Investering og finansiering | OK (sikker) | SFB11016 (10 sp), l. 482 | SFB11016 Investering og finansiering (10 sp) | 79 / 48 / 70 / 61 / 62 |  |
| Markedsføring | OK (sikker) | SFB10519 (10 sp), l. 669 | SFB10519 Markedsføring (10 sp) | 58 / 66 / 79 / 108 / 94 |  |
| Organisasjon og ledelse | OK (sikker) | SFB10120 (10 sp), l. 854 | SFB10120 Organisasjonsteori (10 sp) | 74 / 51 / 59 / 78 / 102 |  |
| Foretaksstrategi | OK + UTGÅTT (sikker) | ØKA121 (10 sp), l. 1032 | ØKA121 Bærekraft og foretaksstrategi (10 sp, fra 2023)<br>SFB11820 Foretaksstrategi og innovasjon (10 sp, til 2022) | 52 / 59 / 53 / 71 / 106 | ØKA121 fra 2023. For 2021–2022 ligger karakterene på forgjengeren SFB11820. |
| Makroøkonomi | OK (sikker) | SFB10916 (10 sp), l. 1219 | SFB10916 Makroøkonomi (10 sp) | 86 / 52 / 64 / 86 / 120 | Rettet 17.10. |
| Mikroøkonomi | OK (sikker) | SFB10816 (10 sp), l. 1405 | SFB10816 Mikroøkonomi med anvendelser (10 sp) | 67 / 40 / 73 / 62 / 77 | Rettet 17.10. |
| Matematikk | OK + UTGÅTT (sikker) | ØKA101 (10 sp), l. 1593 | ØKA101 Matematikk for økonomer (10 sp, fra 2023)<br>SFB10719 Matematikk og statistikk (10 sp, til 2022) | 86 / 69 / 90 / 108 / 104 | ØKA101 fra 2023; før det var matematikk og statistikk slått sammen i SFB10719. |
| Statistikk | DELVIS (sikker) | ØKA120 (10 sp), l. 1779 | ØKA120 Statistikk og samfunnsvitenskapelig metode (10 sp, fra 2023)<br>SFB12020 Anvendt statistikk og metode (10 sp, til 2023) | 62 / 68 / 60 / 90 / 115 | ØKA120 dekker både statistikk og metode (10 sp til sammen). Teller én gang i summene. |
| Samf.vit. metode | DELVIS (sikker) | ØKA120 (10 sp), l. 1971 | ØKA120 Statistikk og samfunnsvitenskapelig metode (10 sp, fra 2023) | 0 / 0 / 60 / 90 / 115 | Samme emne som statistikk. |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | SFB17021 Etikk, samfunnsansvar, bærekraft (10 sp) | 68 / 47 / 49 / 58 / 74 | Eget etikkemne, tatt av hele kullet. |
| Innføring i bedriftsøkonomi (tillegg) | OK (sikker) | SFB10314 (10 sp), l. 2162 | SFB10314 Innføring i bedriftsøkonomisk analyse (10 sp) | 91 / 59 / 81 / 84 / 136 |  |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 40, administrasjon 30, samfunnsøkonomi 20, metode 20, etikk 10; **120 sp**.

### BI (`bi`)

Program: DIPØAH (alle campuser). HH-program i DBH-tallene: bi_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | OK (sikker) | BØK3532 (7,5 sp), l. 149 | BØK3532 Finansregnskap og regnskapsanalyse (7,5 sp) | 1125 / 967 / 1055 / 1132 / 1104 | Eksamenskodene BØK35322/35323 (til 2024) og BØK35324/35325 (fra 2025). |
| Økonomistyring | FEIL (sikker) | BØK3430 (7,5 sp), l. 335 | BØK3561 Prestasjonsstyring (7,5 sp, fra 2025)<br>BØK3541 Økonomi- og virksomhetsstyring (7,5 sp, til 2024)<br>BØK3651 Strategisk økonomistyring (7,5 sp) | 1092 / 1183 / 1064 / 1089 / 953 | BØK3430 er innføringsemnet i bedriftsøkonomi og finans (står også som innføringsemne). Økonomistyringsemnet er BØK3541 til 2024 og BØK3561 Prestasjonsstyring fra 2025; BØK3651 Strategisk økonomistyring er obligatorisk i 3. år. Dagens kode BØK3430: – / – / 929 / 1251 / 1193. |
| Investering og finansiering | DELVIS (sikker) | BØK3423 (7,5 sp), l. 521 | BØK3423 Finans (7,5 sp)<br>BØK3632 Finansiell styring (7,5 sp) | 1441 / 1153 / 1297 / 1852 / 1706 | BØK3632 Finansiell styring er obligatorisk i 2. år (900–1850 kandidater). |
| Markedsføring | OK + UTGÅTT (sikker) | MRK3580 (7,5 sp), l. 707 | MRK3580 Markedsføringsledelse og strategi (7,5 sp, fra 2025)<br>MRK3414 Markedsføringsledelse (7,5 sp, til 2022) | 960 / 917 / 0 / 0 / 906 | MRK3580 fra 2025. Studieplanen fra 2023 flyttet markedsføring til 2./3. år, så 2023–2024 mangler markedsføringskarakterer for ØA-studentene. |
| Organisasjon og ledelse | OK + UTGÅTT (sikker) | ORG3403 (7,5 sp), l. 893 | ORG3403 Organisasjonsatferd og ledelse (7,5 sp, fra 2023)<br>ORG3402 Psykologi, organisasjon og ledelse (7,5 sp, til 2024) | 1118 / 866 / 908 / 1152 / 1076 | ORG3403 fra 2023; før det ORG3402. |
| Foretaksstrategi | UTGÅTT (sannsynlig) | STR3610 (7,5 sp), l. 1071 | STR3610 Doing Sustainable Business (7,5 sp, fra 2026)<br>STR3605 Strategi (7,5 sp, til 2025) | 773 / 789 / 679 / 712 / 44 | STR3610 står i studieplanen, men har ingen karakterer i DBH 2021–2025. Karakterene ligger på STR3605 Strategi (680–790 kandidater per år til 2024). Dagens kode STR3610: –. |
| Makroøkonomi | DELVIS (sannsynlig) | SØK3420 (7,5 sp), l. 1258 | SØK3420 Samfunnsøkonomi I (7,5 sp, fra 2023)<br>SØK3500 Samfunnsøkonomi II (7,5 sp, fra 2024)<br>SØK3525 Makroøkonomi for økonomer (7,5 sp, til 2024) | 1013 / 993 / 984 / 1264 / 1293 | Fra 2023/2024 er mikro og makro integrert i SØK3420 og SØK3500 (begge har mikro- og makrodeler). Kartlegg begge emnene samlet til samfunnsøkonomi (15 sp). Til og med 2023 var makro eget emne SØK3525. |
| Mikroøkonomi | DELVIS (sannsynlig) | SØK3500 (7,5 sp), l. 1444 | SØK3500 Samfunnsøkonomi II (7,5 sp, fra 2024)<br>SØK3420 Samfunnsøkonomi I (7,5 sp, fra 2023)<br>SØK3520 Mikroøkonomi (7,5 sp, til 2024) | 1231 / 823 / 917 / 1264 / 1293 | Se makroøkonomi. Til og med 2023 var mikro eget emne SØK3520. |
| Matematikk | OK (sikker) | MET2910 (7,5 sp), l. 1632 | MET2910 Matematikk for økonomer (7,5 sp) | 1091 / 1023 / 973 / 915 / 1245 | Flere eksamenskoder (MET29101–29107). |
| Statistikk | OK (sikker) | MET2920 (7,5 sp), l. 1824 | MET2920 Statistikk for økonomer (7,5 sp) | 1081 / 864 / 901 / 1134 / 1391 |  |
| Samf.vit. metode | OK (sikker) | MET3590 (7,5 sp), l. 2010 | MET3590 Metode og statistisk dataanalyse (7,5 sp) | 998 / 1072 / 993 / 1841 / 1231 |  |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | EXC3401 Business Communication – Culture and Ethics (7,5 sp, fra 2023)<br>SPÅ2901 Business Communication – Culture and Ethics (7,5 sp, til 2023) | 1217 / 1020 / 1830 / 1369 / 1259 |  |
| Innføring i bedriftsøkonomi (tillegg) | FEIL (sikker) | BØK34301 (7,5 sp), l. 2204 | BØK3430 Innføring i bedriftsøkonomi og finans (7,5 sp) | 0 / 0 / 929 / 1251 / 1193 | BØK34301 er eksamenskoden; emnekoden er BØK3430 (samme emne som i dag feilaktig står under økonomistyring). Dagens kode BØK34301: –. |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 45, administrasjon 22,5, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **112,5 sp**.

### Kristiania (campus) (`kristiania`)

Program: Økonomi og ledelse, BOL. HH-program i DBH-tallene: kristiania_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | STUDIEPOENG (sikker) | FRG3101 (10 sp), l. 157 | FRG3101 Finansregnskap (7,5 sp) | 88 / 92 / 67 / 86 / 106 | Alle emnene i BOL er 7,5 sp i DBH 208 (sto som 10). |
| Økonomistyring | STUDIEPOENG (sikker) | OKS1101 (10 sp), l. 343 | OKS1101 Økonomistyring (7,5 sp) | 13 / 46 / 100 / 63 / 69 | Alle emnene i BOL er 7,5 sp i DBH 208 (sto som 10). |
| Investering og finansiering | STUDIEPOENG (sikker) | IOJ3100 (10 sp), l. 529 | IOJ3100 Investering og finansiering (7,5 sp) | 6 / 34 / 54 / 128 / 119 | Alle emnene i BOL er 7,5 sp i DBH 208 (sto som 10). |
| Markedsføring | STUDIEPOENG + UTGÅTT (sikker) | MFØ1200 (10 sp), l. 715 | MFØ1200 Markedsføring (7,5 sp, fra 2023)<br>MOF1100 Markedsføring og forbrukeratferd (15 sp, til 2023) | 0 / 71 / 78 / 87 / 149 | Alle emnene i BOL er 7,5 sp i DBH 208 (sto som 10). MFØ1200 fra 2023; før det MOF1100 (15 sp). |
| Organisasjon og ledelse | STUDIEPOENG (sikker) | OOL1101 (10 sp), l. 901 | OOL1101 Organisasjon og ledelse (7,5 sp) | 93 / 64 / 0 / 76 / 82 | Alle emnene i BOL er 7,5 sp i DBH 208 (sto som 10). |
| Foretaksstrategi | STUDIEPOENG (sikker) | FST3100 (10 sp), l. 1078 | FST3100 Foretaksstrategi (7,5 sp) | 23 / 36 / 54 / 65 / 49 | Alle emnene i BOL er 7,5 sp i DBH 208 (sto som 10). |
| Makroøkonomi | STUDIEPOENG (sikker) | MAO2100 (10 sp), l. 1266 | MAO2100 Makroøkonomi (7,5 sp) | 50 / 80 / 46 / 68 / 83 | Alle emnene i BOL er 7,5 sp i DBH 208 (sto som 10). |
| Mikroøkonomi | STUDIEPOENG (sikker) | MIO1100 (10 sp), l. 1452 | MIO1100 Mikroøkonomi (7,5 sp) | 66 / 87 / 60 / 73 / 85 | Alle emnene i BOL er 7,5 sp i DBH 208 (sto som 10). |
| Matematikk | STUDIEPOENG (sikker) | MAT1100 (10 sp), l. 1640 | MAT1100 Matematikk for økonomer (7,5 sp) | 123 / 72 / 86 / 94 / 157 | Alle emnene i BOL er 7,5 sp i DBH 208 (sto som 10). |
| Statistikk | STUDIEPOENG (sikker) | SFO1100 (10 sp), l. 1832 | SFO1100 Statistikk for økonomer (7,5 sp) | 68 / 86 / 60 / 85 / 101 | Alle emnene i BOL er 7,5 sp i DBH 208 (sto som 10). |
| Samf.vit. metode | STUDIEPOENG + UTGÅTT (sikker) | MOD3101 (10 sp), l. 2018 | MOD3101 Metode og dataanalyse (7,5 sp, fra 2025)<br>MOD3100 Metode og dataanalyse (15 sp, fra 2023, til 2024)<br>SVM1100 Samfunnsvitenskapelig metode (7,5 sp, til 2022) | 65 / 3 / 71 / 47 / 57 | Alle emnene i BOL er 7,5 sp i DBH 208 (sto som 10). MOD3101 fra 2025; MOD3100 (15 sp) 2023–2024; SVM1100 til 2022. |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | ESB1100 Etikk, samfunnsansvar og bærekraft (7,5 sp) | 96 / 68 / 82 / 94 / 143 |  |
| Innføring i bedriftsøkonomi (tillegg) | STUDIEPOENG (sikker) | BØK2101 (10 sp), l. 2211 | BØK2101 Bedriftsøkonomi (7,5 sp) | 175 / 101 / 98 / 106 / 164 | Alle emnene i BOL er 7,5 sp i DBH 208 (sto som 10). |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 30, administrasjon 22,5, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **97,5 sp**.

### UiT Tromsø (`uit`)

Program: B-ØKADM/B-ØA Tromsø (SO 186369). HH-program i DBH-tallene: uit_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | OK (sikker) | BED-1002 (10 sp), l. 181 | BED-1002 Grunnleggende regnskap og analyse (10 sp, til 2025)<br>BED-1305 Grunnleggende regnskap og analyse (7,5 sp, fra 2026) | 142 / 125 / 128 / 165 / 121 | Riktig til og med 2025. Ny studieplan fra kull 2025 (7,5 sp-emner). BED-1305 avløser fra vår 2026. |
| Økonomistyring | FEIL (sikker) | BED-1502 (10 sp), l. 367 | BED-2019 Driftsregnskap og budsjettering (10 sp, til 2025)<br>BED-2304 Driftsregnskap og budsjettering (7,5 sp, fra 2026) | 114 / 116 / 125 / 111 / 116 | BED-1502 er nettversjonen av «Bedriftsøkonomisk analyse» (null Tromsø-kandidater). Tromsø-studentene tar BED-2019 (111–125 per år); BED-2304 fra kull 2025. Dagens kode BED-1502: – / – / – / – / 0. |
| Investering og finansiering | STUDIEPOENG + UTGÅTT (sikker) | BED-2303 (10 sp), l. 552 | BED-2303 Investering og finansiering (7,5 sp, fra 2025)<br>BED-2020 Investering og finansiering (10 sp, til 2024) | 141 / 117 / 106 / 101 / 98 | BED-2303 er 7,5 sp (sto som 10) og har data bare fra 2025; før det BED-2020 (10 sp). |
| Markedsføring | STUDIEPOENG + UTGÅTT (sikker) | BED-1303 (10 sp), l. 739 | BED-1303 Markedsføring (7,5 sp, fra 2025)<br>BED-1004 Markedsføring (10 sp, til 2024) | 139 / 115 / 114 / 129 / 117 | BED-1303 er 7,5 sp; før 2025 BED-1004 (10 sp). |
| Organisasjon og ledelse | STUDIEPOENG + UTGÅTT (sikker) | BED-2302 (10 sp), l. 925 | BED-2302 Organisasjonsteori og ledelse (7,5 sp, fra 2025)<br>BED-2029 Organisasjonsteori og ledelse (10 sp, til 2024) | 108 / 104 / 103 / 97 / 94 | BED-2302 er 7,5 sp; før 2025 BED-2029 (10 sp). |
| Foretaksstrategi | OK (sikker) | BED-2003 (10 sp), l. 1102 | BED-2003 Foretaksstrategi (10 sp, til 2025)<br>BED-2305 Foretaksstrategi (7,5 sp, fra 2026) | 111 / 96 / 103 / 93 / 103 | Ny studieplan fra kull 2025 (7,5 sp-emner). |
| Makroøkonomi | FEIL (sikker) | SOK-1002 (10 sp), l. 1290 | SOK-1010 Makroøkonomisk analyse og økonomisk politikk (10 sp, til 2025)<br>SOK-1304 Makroøkonomisk analyse og økonomisk politikk (7,5 sp, fra 2026) | 135 / 104 / 97 / 98 / 107 | Byttet om: oppføringen peker på SOK-1002, som er mikroøkonomi. Riktig er SOK-1010 (97–135 kandidater). Dagens kode SOK-1002: 120 / 116 / 106 / 117 / 123. |
| Mikroøkonomi | FEIL (sikker) | SOK-1010 (10 sp), l. 1476 | SOK-1002 Mikroøkonomi: Økonomisk atferd, markeder og priser (10 sp, til 2025)<br>SOK-1303 Mikroøkonomi: Økonomisk atferd, markeder og priser (7,5 sp, fra 2026) | 120 / 116 / 106 / 117 / 123 | Byttet om: oppføringen peker på SOK-1010, som er makroøkonomi. Riktig er SOK-1002 (106–123 kandidater). Dagens kode SOK-1010: 135 / 104 / 97 / 98 / 107. |
| Matematikk | STUDIEPOENG + UTGÅTT (sikker) | BED-1301 (10 sp), l. 1664 | BED-1301 Matematikk for økonomer (7,5 sp, fra 2025)<br>BED-1007 Matematikk for økonomer (10 sp, til 2024) | 133 / 114 / 147 / 134 / 119 | BED-1301 er 7,5 sp; før 2025 BED-1007 (10 sp). |
| Statistikk | STUDIEPOENG + UTGÅTT (sannsynlig) | BED-2065 (10 sp), l. 1856 | BED-2065 Statistikk for økonomer (7,5 sp, fra 2025)<br>BED-2011 Samfunnsvitenskapelig metode og statistikk (10 sp, til 2024) | 102 / 100 / 103 / 97 / 93 | BED-2065 er 7,5 sp og har data bare fra 2025 (studieplanen for kull 2025 kaller emnet BED-2301). Til og med 2024 var statistikk og metode slått sammen i BED-2011 (10 sp). |
| Samf.vit. metode | FEIL (sikker) | SVF-1050 (10 sp), l. 2042 | BED-2011 Samfunnsvitenskapelig metode og statistikk (10 sp, til 2024)<br>BED-2306 Anvendt metode (7,5 sp, fra 2026) | 102 / 100 / 103 / 97 / 0 | SVF-1050 har null ØA-kandidater. Metode lå i BED-2011 (kombinert med statistikk) til og med 2024; BED-2306 Anvendt metode fra kull 2025. Dagens kode SVF-1050: –. |
| Etikk, samfunnsansvar og bærekraft | MANGLER (usikker) | – | FIL-0700 Examen philosophicum, Tromsøvarianten (10 sp) | 82 / 77 / 94 / 87 / 106 | Studieplanen har ikke et eget etikkemne i fellesdelen; ex.phil. er det nærmeste. Usikkert om det dekker UHR-kravet. |
| Innføring i bedriftsøkonomi (tillegg) | FEIL (sikker) | BED-1004 (10 sp), l. 2232 | BED-1013 Bedriftsøkonomisk analyse (10 sp, til 2024)<br>BED-1302 Bedriftsøkonomisk analyse (7,5 sp, fra 2025) | 137 / 120 / 124 / 142 / 121 | BED-1004 er Markedsføring, ikke bedriftsøkonomi. Innføringsemnet er BED-1013 (til 2024) / BED-1302 (fra 2025). Dagens kode BED-1004: 139 / 115 / 114 / 129 / 13. |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 35, administrasjon 25, samfunnsøkonomi 20, metode 15, etikk 10; **105 sp**.

### NLA Høgskolen (`nla`)

Program: 4ØKADM Oslo + 3ØKADM Kristiansand + ØKADM Bergen (summert). HH-program i DBH-tallene: nla_oslo_oa, nla_krs_oa, nla_bergen_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | OK + UTGÅTT (sikker) | HSM124 (10 sp), l. 189 | HSM124 Finansregnskap og regnskapsanalyse (10 sp, fra 2024)<br>HSM201 Finansregnskap og regnskapsanalyse (7,5 sp, fra 2022, til 2024) | 0 / 73 / 84 / 103 / 217 | Ny studieplan fra 2023/2024. |
| Økonomistyring | DELVIS (usikker) | HSM122 (10 sp), l. 375 | HSM122 Innføring i bedriftsøkonomi (10 sp, fra 2023)<br>HSM205 Grunnleggende bedriftsøkonomi 2 (7,5 sp, fra 2023, til 2024) | 0 / 0 / 98 / 187 / 216 | HSM122 er et innføringsemne; det er uklart om driftsregnskap og budsjettering dekkes der eller i et senere emne som ennå ikke har karakterer. |
| Investering og finansiering | OK + UTGÅTT (sikker) | ØKAD221 (10 sp), l. 560 | ØKAD221 Investering og finansiering (10 sp, fra 2024)<br>ØKAD204 Investering og finans (7,5 sp, fra 2023, til 2024) | 0 / 0 / 67 / 90 / 146 |  |
| Markedsføring | OK + UTGÅTT (sikker) | HSM222 (10 sp), l. 747 | HSM222 Innføring i markedsføring, etikk og bærekraft (10 sp, fra 2025)<br>HSM102 Markedsføring (7,5 sp, til 2022) | 96 / 80 / 0 / 0 / 82 | HSM222 har karakterer fra 2025. |
| Organisasjon og ledelse | OK + UTGÅTT (sikker) | HSM121 (10 sp), l. 933 | HSM121 Innføring i organisasjon, ledelse og etikk (10 sp, fra 2023)<br>HSM107 Organisasjon og ledelse med fokus på tjenende ledelse (7,5 sp, fra 2022, til 2023) | 0 / 87 / 109 / 157 / 180 |  |
| Foretaksstrategi | OK (sikker) | HSM221 (10 sp), l. 1110 | HSM221 Strategi, samfunnsansvar og bærekraft (10 sp) | 0 / 0 / 0 / 87 / 142 |  |
| Makroøkonomi | STUDIEPOENG + UTGÅTT (sikker) | ØKAD224 (7,5 sp), l. 1298 | ØKAD224 Makroøkonomi og bærekraft (10 sp, fra 2025)<br>ØKAD203 Makroøkonomi (7,5 sp, fra 2023, til 2024) | 0 / 0 / 70 / 93 / 91 | ØKAD224 er 10 sp i DBH (sto som 7,5). |
| Mikroøkonomi | STUDIEPOENG + UTGÅTT (sikker) | ØKAD223 (7,5 sp), l. 1484 | ØKAD223 Mikroøkonomi (10 sp, fra 2025)<br>ØKAD202 Videregående mikroøkonomi (7,5 sp, fra 2023, til 2024)<br>HSM108 Grunnleggende mikroøkonomi 1 (7,5 sp, fra 2022, til 2023) | 0 / 84 / 84 / 88 / 85 | ØKAD223 er 10 sp i DBH (sto som 7,5). |
| Matematikk | STUDIEPOENG + UTGÅTT (sikker) | ØKAD222 (7,5 sp), l. 1672 | ØKAD222 Matematikk for økonomer (10 sp, fra 2024)<br>ØKAD201 Matematikk for økonomer (7,5 sp, fra 2023, til 2024) | 0 / 0 / 103 / 95 / 192 | ØKAD222 er 10 sp (sto som 7,5). |
| Statistikk | STUDIEPOENG + DELVIS (sikker) | HSM126 (7,5 sp), l. 1864 | HSM126 Innføring i statistikk med forskningsmetode (10 sp, fra 2024)<br>HSM103 Statistikk (7,5 sp, til 2022) | 118 / 103 / 0 / 86 / 153 | HSM126 er 10 sp i alt; kartleggingen deler det i 7,5 + 5 = 12,5 sp. |
| Samf.vit. metode | FEIL (sannsynlig) | HSM126 (5 sp), l. 2050 | HSM209 Metode (7,5 sp, fra 2024) | 0 / 0 / 0 / 72 / 76 | Eget metodeemne HSM209 (Oslo 41/49, Kristiansand 31/27 i 2024/2025). HSM126 bør bare stå under statistikk. Dagens kode HSM126: – / – / – / 86 / 153. |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | HSM123 Etikk, identitet og ansvar 1 (10 sp, fra 2024)<br>HSM111 Etikk, samfunn og økonomi (7,5 sp, til 2023) | 96 / 87 / 14 / 90 / 145 |  |
| Innføring i bedriftsøkonomi (tillegg) | MANGLER (usikker) | – | – | – | HSM122 står under økonomistyring; ikke legg det inn to ganger. |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 30, administrasjon 30, samfunnsøkonomi 20, metode 27,5, etikk 10; **117,5 sp**.

### Oslo Nye Høyskole (ONH) (`onh`)

Program: Bachelor i ØA, nett (ikke i DBH-cachen). HH-program i DBH-tallene: ingen. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | STUDIEPOENG (sannsynlig) | ØKAD1220 (10 sp), l. 213 | ØKAD1220 Finansregnskap (7,5 sp) | – | Programsiden (oslonyehoyskole.no, lest 17.10.2026) oppgir 7,5 sp (sto som 10). ONH finnes ikke i DBH-cachen, så programtall mangler. |
| Økonomistyring | STUDIEPOENG (sannsynlig) | ØKAD2220 (10 sp), l. 399 | ØKAD2220 Økonomistyring (7,5 sp) | – | Programsiden (oslonyehoyskole.no, lest 17.10.2026) oppgir 7,5 sp (sto som 10). ONH finnes ikke i DBH-cachen, så programtall mangler. |
| Investering og finansiering | STUDIEPOENG (sannsynlig) | ØKAD2230 (10 sp), l. 584 | ØKAD2230 Corporate Finance (7,5 sp) | – | Programsiden (oslonyehoyskole.no, lest 17.10.2026) oppgir 7,5 sp (sto som 10). ONH finnes ikke i DBH-cachen, så programtall mangler. |
| Markedsføring | STUDIEPOENG (sannsynlig) | ØKAD1140 (10 sp), l. 771 | ØKAD1140 Markedsføring (7,5 sp) | – | Programsiden (oslonyehoyskole.no, lest 17.10.2026) oppgir 7,5 sp (sto som 10). ONH finnes ikke i DBH-cachen, så programtall mangler. |
| Organisasjon og ledelse | STUDIEPOENG (sannsynlig) | ØKAD1130 (10 sp), l. 957 | ØKAD1130 Organisasjon og ledelse (7,5 sp) | – | Programsiden (oslonyehoyskole.no, lest 17.10.2026) oppgir 7,5 sp (sto som 10). ONH finnes ikke i DBH-cachen, så programtall mangler. |
| Foretaksstrategi | STUDIEPOENG (sannsynlig) | ØKAD2240 (10 sp), l. 1134 | ØKAD2240 Strategi (7,5 sp) | – | Programsiden (oslonyehoyskole.no, lest 17.10.2026) oppgir 7,5 sp (sto som 10). ONH finnes ikke i DBH-cachen, så programtall mangler. |
| Makroøkonomi | STUDIEPOENG (sannsynlig) | ØKAD2210 (10 sp), l. 1322 | ØKAD2210 Makroøkonomi (7,5 sp) | – | Programsiden (oslonyehoyskole.no, lest 17.10.2026) oppgir 7,5 sp (sto som 10). ONH finnes ikke i DBH-cachen, så programtall mangler. |
| Mikroøkonomi | STUDIEPOENG (sannsynlig) | ØKAD1230 (10 sp), l. 1508 | ØKAD1230 Mikroøkonomi (7,5 sp) | – | Programsiden (oslonyehoyskole.no, lest 17.10.2026) oppgir 7,5 sp (sto som 10). ONH finnes ikke i DBH-cachen, så programtall mangler. |
| Matematikk | STUDIEPOENG (sannsynlig) | ØKAD1120 (10 sp), l. 1696 | ØKAD1120 Matematikk for økonomer (7,5 sp) | – | Programsiden (oslonyehoyskole.no, lest 17.10.2026) oppgir 7,5 sp (sto som 10). ONH finnes ikke i DBH-cachen, så programtall mangler. |
| Statistikk | STUDIEPOENG + DELVIS (sannsynlig) | ØKAD2110 (10 sp), l. 1888 | ØKAD2110 Metode og statistikk (15 sp) | – | ØKAD2110 er 15 sp i alt (statistikk + metode); kartleggingen har 10 + 10. |
| Samf.vit. metode | STUDIEPOENG + DELVIS (sannsynlig) | ØKAD2110 (10 sp), l. 2075 | ØKAD2110 Metode og statistikk (15 sp) | – | Samme emne som statistikk; telles én gang. |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sannsynlig) | – | ØKAD3110 Etikk, bærekraft og samfunnsansvar (15 sp) | – |  |
| Innføring i bedriftsøkonomi (tillegg) | MANGLER (sannsynlig) | – | ØKAD1110 Grunnleggende bedriftsøkonomi (7,5 sp) | – |  |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 30, administrasjon 22,5, samfunnsøkonomi 15, metode 22,5, etikk 15; **105 sp**.

### Høgskolen i Molde (`himolde`)

Program: 07 (SO 211369). HH-program i DBH-tallene: himolde_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | STUDIEPOENG (sikker) | BØK105 (10 sp), l. 237 | BØK105 Finansregnskap 1 (7,5 sp) | 78 / 36 / 55 / 71 / 71 | Emnet er 7,5 sp i DBH (sto som 10). |
| Økonomistyring | STUDIEPOENG + DELVIS (sikker) | BØK205 (10 sp), l. 423 | BØK205 Økonomistyring og regnskap (7,5 sp) | 49 / 69 / 33 / 54 / 50 | Emnet er 7,5 sp i DBH (sto som 10). BØK300 dekker også økonomisk styring. |
| Investering og finansiering | STUDIEPOENG + DELVIS (sikker) | BØK300 (10 sp), l. 608 | BØK300 Finansiell- og økonomisk styring (15 sp) | 70 / 52 / 69 / 67 / 79 | BØK300 er 15 sp (sto som 10) og dekker både investering/finansiering og økonomistyring. |
| Markedsføring | STUDIEPOENG (sikker) | ADM120 (10 sp), l. 795 | ADM120 Marketing (7,5 sp) | 99 / 83 / 102 / 71 / 89 | Emnet er 7,5 sp i DBH (sto som 10). |
| Organisasjon og ledelse | STUDIEPOENG + DELVIS (sikker) | ADM100 (10 sp), l. 981 | ADM100 Organisasjonsteori og -psykologi (7,5 sp)<br>ADM205 Endringsledelse (7,5 sp) | 76 / 70 / 47 / 59 / 66 | Emnet er 7,5 sp i DBH (sto som 10). ADM205 Endringsledelse er obligatorisk (35–76). |
| Foretaksstrategi | STUDIEPOENG (sikker) | ADM300 (10 sp), l. 1158 | ADM300 Foretaksstrategi (7,5 sp) | 56 / 54 / 62 / 65 / 57 | Emnet er 7,5 sp i DBH (sto som 10). |
| Makroøkonomi | STUDIEPOENG (sikker) | SØK100 (10 sp), l. 1346 | SØK100 Makroøkonomi (7,5 sp) | 71 / 64 / 26 / 58 / 62 | Emnet er 7,5 sp i DBH (sto som 10). |
| Mikroøkonomi | STUDIEPOENG (sikker) | SØK200 (10 sp), l. 1532 | SØK200 Mikroøkonomi (7,5 sp) | 70 / 73 / 34 / 60 / 61 | Emnet er 7,5 sp i DBH (sto som 10). |
| Matematikk | STUDIEPOENG (sikker) | MAT100 (10 sp), l. 1720 | MAT100 Anvendt matematikk (7,5 sp) | 73 / 41 / 72 / 65 / 58 | Emnet er 7,5 sp i DBH (sto som 10). |
| Statistikk | STUDIEPOENG (sikker) | MAT110 (10 sp), l. 1912 | MAT110 Anvendt statistikk (7,5 sp) | 65 / 69 / 32 / 61 / 63 | Emnet er 7,5 sp i DBH (sto som 10). |
| Samf.vit. metode | STUDIEPOENG (sikker) | ADM201 (10 sp), l. 2101 | ADM201 Innføring i samfunnsvitenskapelig metode (7,5 sp) | 50 / 41 / 50 / 56 / 63 | Emnet er 7,5 sp i DBH (sto som 10). |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | ADM620 Etikk (7,5 sp) | 45 / 36 / 42 / 40 / 45 |  |
| Innføring i bedriftsøkonomi (tillegg) | FEIL (sikker) | ASM100 (10 sp), l. 2239 | – | – | ASM100 har ingen kandidater fra ØA-programmet i DBH 2021–2025 (og fallbackGrades er bare nuller). Fjern oppføringen. Dagens kode ASM100: –. |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 30, administrasjon 30, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **105 sp**.

### INN Rena (`inn_rena`)

Program: ØKBAC Rena (SO 209369). HH-program i DBH-tallene: inn_rena_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | STUDIEPOENG + DELVIS (sikker) | 3REV100 (10 sp), l. 245 | 3REV100 Grunnleggende regnskap (7,5 sp)<br>3REG160 Videregående regnskap (7,5 sp) | 41 / 51 / 47 / 38 / 43 | Emnet er 7,5 sp i DBH (sto som 10). |
| Økonomistyring | STUDIEPOENG + DELVIS (sikker) | 3REV220 (10 sp), l. 431 | 3REV220 Økonomistyring (7,5 sp)<br>3BED360 Virksomhetsstyring (7,5 sp) | 41 / 34 / 24 / 33 / 35 | Emnet er 7,5 sp i DBH (sto som 10). |
| Investering og finansiering | STUDIEPOENG (sikker) | 3BED200 (10 sp), l. 616 | 3BED200 Investering og finansiering (7,5 sp) | 33 / 41 / 29 / 16 / 20 | Emnet er 7,5 sp i DBH (sto som 10). |
| Markedsføring | STUDIEPOENG (sikker) | 3MAR100 (10 sp), l. 803 | 3MAR100 Markedsføring (7,5 sp) | 43 / 21 / 31 / 28 / 32 | Emnet er 7,5 sp i DBH (sto som 10). |
| Organisasjon og ledelse | STUDIEPOENG (sikker) | 3ORG100 (10 sp), l. 989 | 3ORG100 Organisasjonsforståelse (7,5 sp) | 71 / 19 / 33 / 31 / 19 | Emnet er 7,5 sp i DBH (sto som 10). |
| Foretaksstrategi | STUDIEPOENG (sikker) | 3LED300 (10 sp), l. 1166 | 3LED300 Strategi (7,5 sp) | 31 / 21 / 13 / 27 / 22 | Emnet er 7,5 sp i DBH (sto som 10). |
| Makroøkonomi | OK (sikker) | 3SAM100 (7,5 sp), l. 1354 | 3SAM100 Makroøkonomi (7,5 sp) | 26 / 29 / 26 / 18 / 25 |  |
| Mikroøkonomi | OK (sikker) | 3SAM120 (7,5 sp), l. 1540 | 3SAM120 Mikroøkonomi (7,5 sp) | 33 / 44 / 12 / 31 / 35 |  |
| Matematikk | OK (sikker) | 3MET120 (7,5 sp), l. 1728 | 3MET120 Matematikk for økonomer (7,5 sp) | 43 / 32 / 37 / 45 / 25 |  |
| Statistikk | FEIL (sikker) | SMET130 (7,5 sp), l. 1920 | 3MET130 Statistikk for økonomer (7,5 sp) | 57 / 52 / 28 / 30 / 25 | SMET130 er nettutgaven (BAØKA). Rena-studentene tar 3MET130 (25–57). Dagens kode SMET130: –. |
| Samf.vit. metode | OK (sikker) | 3MET200 (7,5 sp), l. 2109 | 3MET200 Samfunnsvitenskapelig metode (7,5 sp) | 29 / 44 / 23 / 30 / 36 |  |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | 3REG370 Etikk og samfunnsansvar (7,5 sp) | 22 / 25 / 27 / 15 / 22 |  |
| Innføring i bedriftsøkonomi (tillegg) | MANGLER (sikker) | – | 3BED100 Grunnleggende bedriftsøkonomi (7,5 sp) | 39 / 46 / 10 / 32 / 22 |  |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 45, administrasjon 22,5, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **112,5 sp**.

### NTNU Gjøvik (`ntnu_gjovik`)

Program: Økonomi, ledelse og bærekraft Gjøvik (BØKLED/BØKLEDC + BØA). HH-program i DBH-tallene: ntnu_oa, ntnu_gjovik_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | STUDIEPOENG (sikker) | SMF1197 (10 sp), l. 253 | SMF1197 Finansregnskap med analyse (7,5 sp) | 56 / 41 / 51 / 52 / 66 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Gjøvik-studentene under felleskoden BØA. |
| Økonomistyring | STUDIEPOENG (sikker) | SMF2293 (10 sp), l. 439 | SMF2293 Driftsregnskap med budsjettering (7,5 sp) | 64 / 38 / 55 / 41 / 72 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Gjøvik-studentene under felleskoden BØA. |
| Investering og finansiering | STUDIEPOENG (sikker) | SMF2296 (10 sp), l. 624 | SMF2296 Investering og finansiering (7,5 sp) | 66 / 60 / 46 / 58 / 57 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Gjøvik-studentene under felleskoden BØA. |
| Markedsføring | STUDIEPOENG (sikker) | SMF1196 (10 sp), l. 811 | SMF1196 Markedsføring – grunnkurs (7,5 sp) | 46 / 65 / 47 / 55 / 51 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Gjøvik-studentene under felleskoden BØA. |
| Organisasjon og ledelse | STUDIEPOENG (sikker) | SMF1193 (10 sp), l. 997 | SMF1193 Organisasjon og ledelse (7,5 sp) | 52 / 63 / 50 / 60 / 45 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Gjøvik-studentene under felleskoden BØA. |
| Foretaksstrategi | STUDIEPOENG (sikker) | SMF2281 (10 sp), l. 1174 | SMF2281 Foretaksstrategi (7,5 sp) | 55 / 37 / 30 / 43 / 37 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Gjøvik-studentene under felleskoden BØA. |
| Makroøkonomi | STUDIEPOENG (sikker) | SMF2295 (10 sp), l. 1362 | SMF2295 Makroøkonomi (7,5 sp) | 54 / 31 / 47 / 45 / 59 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Gjøvik-studentene under felleskoden BØA. |
| Mikroøkonomi | STUDIEPOENG (sikker) | SMF2291 (10 sp), l. 1548 | SMF2291 Mikroøkonomi (7,5 sp) | 65 / 52 / 60 / 56 / 68 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Gjøvik-studentene under felleskoden BØA. |
| Matematikk | STUDIEPOENG (sikker) | REA1153 (10 sp), l. 1736 | REA1153 Matematikk for økonomer (7,5 sp) | 56 / 76 / 60 / 69 / 48 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Gjøvik-studentene under felleskoden BØA. |
| Statistikk | STUDIEPOENG (sikker) | REA1154 (10 sp), l. 1928 | REA1154 Statistikk for økonomer (7,5 sp) | 54 / 48 / 58 / 44 / 80 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Gjøvik-studentene under felleskoden BØA. |
| Samf.vit. metode | STUDIEPOENG (sikker) | SMF2292 (10 sp), l. 2117 | SMF2292 Kvantitative og kvalitative metoder (7,5 sp) | 54 / 46 / 27 / 46 / 43 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Gjøvik-studentene under felleskoden BØA. |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | SMF2290 Etikk, bærekraft og samfunnsansvar (7,5 sp) | 42 / 38 / 25 / 46 / 37 |  |
| Innføring i bedriftsøkonomi (tillegg) | MANGLER (sikker) | – | SMF1194 Bedriftsøkonomi (7,5 sp) | 47 / 60 / 62 / 84 / 63 |  |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 30, administrasjon 22,5, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **97,5 sp**.

### NTNU Ålesund (`ntnu_alesund`)

Program: ØA Ålesund (ØA369/BØKADIB + BØA). HH-program i DBH-tallene: ntnu_oa, ntnu_alesund_oa. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | STUDIEPOENG (sikker) | AE101308 (10 sp), l. 261 | AE101308 Finansregnskap med analyse (7,5 sp) | 52 / 53 / 61 / 61 / 77 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Ålesund-studentene under felleskoden BØA. |
| Økonomistyring | STUDIEPOENG + UTGÅTT (sannsynlig) | AE101124 (10 sp), l. 447 | AE101124 Økonomisk styring I (7,5 sp, fra 2025)<br>AE201306 Driftsregnskap med budsjettering (7,5 sp, til 2024) | 46 / 53 / 75 / 64 / 68 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Ålesund-studentene under felleskoden BØA. AE101124 er nytt i 2025; før det AE201306. |
| Investering og finansiering | STUDIEPOENG (sikker) | AE201115 (10 sp), l. 632 | AE201115 Investering og finansiering (7,5 sp) | 49 / 62 / 45 / 76 / 57 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Ålesund-studentene under felleskoden BØA. |
| Markedsføring | STUDIEPOENG (sikker) | AM101108 (10 sp), l. 819 | AM101108 Markedsføring – grunnkurs (7,5 sp) | 55 / 73 / 60 / 74 / 7 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Ålesund-studentene under felleskoden BØA. |
| Organisasjon og ledelse | STUDIEPOENG (sikker) | AL101115 (10 sp), l. 1005 | AL101115 Organisasjon og ledelse (7,5 sp) | 53 / 70 / 63 / 77 / 66 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Ålesund-studentene under felleskoden BØA. |
| Foretaksstrategi | STUDIEPOENG (sikker) | AL201308 (10 sp), l. 1182 | AL201308 Foretaksstrategi (7,5 sp) | 53 / 52 / 29 / 58 / 53 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Ålesund-studentene under felleskoden BØA. |
| Makroøkonomi | STUDIEPOENG (sikker) | AE101408 (10 sp), l. 1370 | AE101408 Makroøkonomi (7,5 sp) | 45 / 52 / 73 / 59 / 78 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Ålesund-studentene under felleskoden BØA. |
| Mikroøkonomi | STUDIEPOENG (sikker) | AE201615 (10 sp), l. 1556 | AE201615 Mikroøkonomi (7,5 sp) | 76 / 71 / 69 / 60 / 88 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Ålesund-studentene under felleskoden BØA. |
| Matematikk | STUDIEPOENG (sikker) | AR100919 (10 sp), l. 1744 | AR100919 Matematikk for økonomer (7,5 sp) | 55 / 88 / 77 / 81 / 104 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Ålesund-studentene under felleskoden BØA. |
| Statistikk | STUDIEPOENG (sikker) | AR100219 (10 sp), l. 1936 | AR100219 Statistikk for økonomer (7,5 sp) | 54 / 48 / 76 / 59 / 100 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Ålesund-studentene under felleskoden BØA. |
| Samf.vit. metode | STUDIEPOENG (sikker) | AM201306 (10 sp), l. 2125 | AM201306 Kvantitative og kvalitative metoder (7,5 sp) | 56 / 45 / 31 / 57 / 59 | Alle NTNU-emner er 7,5 sp (sto som 10). 2022–2024 ligger Ålesund-studentene under felleskoden BØA. |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | AL201220 Etikk, bærekraft og samfunnsansvar (7,5 sp) | 45 / 44 / 40 / 61 / 46 |  |
| Innføring i bedriftsøkonomi (tillegg) | MANGLER (sikker) | – | AE101108 Bedriftsøkonomi med regnskap (7,5 sp) | 58 / 91 / 85 / 79 / 16 |  |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 30, administrasjon 22,5, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **97,5 sp**.

### Kristiania nett (`kristiania_nett`)

Program: BOA, nett (profilering regnskapsfører). HH-program i DBH-tallene: kristiania_nett_x. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | DELVIS (sannsynlig) | 6084 (7,5 sp), l. 269 | 6084 Finansregnskap (7,5 sp)<br>6088 Finansregnskap og regnskapsteori (15 sp) | 21 / 27 / 33 / 35 / 34 | 6088 (15 sp) er obligatorisk i regnskapsførerprofilen (13–35). |
| Økonomistyring | OK (sikker) | 6002 (7,5 sp), l. 455 | 6002 Økonomistyring (7,5 sp) | 19 / 22 / 15 / 31 / 25 |  |
| Investering og finansiering | OK (sikker) | 6004 (7,5 sp), l. 640 | 6004 Investering og finansiering (7,5 sp) | 33 / 24 / 23 / 26 / 20 |  |
| Markedsføring | OK (sikker) | 6340 (7,5 sp), l. 827 | 6340 Markedsføring (7,5 sp) | 21 / 22 / 24 / 20 / 21 |  |
| Organisasjon og ledelse | OK (sikker) | 6336 (7,5 sp), l. 1013 | 6336 Organisasjon og ledelse (7,5 sp) | 28 / 19 / 21 / 26 / 19 |  |
| Foretaksstrategi | OK (sikker) | 6347 (7,5 sp), l. 1190 | 6347 Innføring i strategi (7,5 sp) | 12 / 19 / 20 / 17 / 12 |  |
| Makroøkonomi | OK (sikker) | 6322 (7,5 sp), l. 1378 | 6322 Makroøkonomi (7,5 sp) | 16 / 18 / 18 / 26 / 26 |  |
| Mikroøkonomi | OK (sikker) | 6320 (7,5 sp), l. 1564 | 6320 Mikroøkonomi (7,5 sp) | 28 / 26 / 34 / 23 / 25 |  |
| Matematikk | OK (sikker) | 6323 (7,5 sp), l. 1752 | 6323 Matematikk for økonomer (7,5 sp) | 38 / 28 / 29 / 28 / 35 |  |
| Statistikk | OK (sikker) | 6356 (7,5 sp), l. 1944 | 6356 Statistikk for økonomer (7,5 sp) | 4 / 18 / 18 / 16 / 26 |  |
| Samf.vit. metode | OK (sikker) | 6343 (7,5 sp), l. 2133 | 6343 Samfunnsvitenskapelig metode (7,5 sp) | 22 / 21 / 20 / 25 / 24 |  |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | 6366 Etikk, samfunnsansvar og bærekraft (7,5 sp) | 7 / 18 / 21 / 19 / 16 |  |
| Innføring i bedriftsøkonomi (tillegg) | MANGLER (sikker) | – | 6324 Bedriftsøkonomi (7,5 sp) | 33 / 23 / 29 / 24 / 25 |  |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 45, administrasjon 22,5, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **112,5 sp**.

### INN nett (`inn_nett`)

Program: BAØKA, nett. HH-program i DBH-tallene: inn_nett_x. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | FEIL + DELVIS (sikker) | SREG160 (7,5 sp), l. 277 | SREV100 Grunnleggende regnskap (7,5 sp)<br>SREG160 Videregående regnskap (7,5 sp) | 0 / 60 / 67 / 72 / 54 | SREG160 er videregående regnskap. Grunnemnet er SREV100 (54–72); begge er obligatoriske. Dagens kode SREG160: – / 0 / 8 / 38 / 43. |
| Økonomistyring | OK (sikker) | SREV220 (7,5 sp), l. 463 | SREV220 Økonomistyring (7,5 sp) | 0 / 4 / 29 / 56 / 66 |  |
| Investering og finansiering | OK (sikker) | SBED200 (7,5 sp), l. 648 | SBED200 Investering og finansiering (7,5 sp) | 0 / 0 / 13 / 36 / 54 |  |
| Markedsføring | OK (sikker) | SMAR100 (7,5 sp), l. 835 | SMAR100 Markedsføring (7,5 sp) | 0 / 25 / 52 / 60 / 23 |  |
| Organisasjon og ledelse | MANGLER (sikker) | – | SORG100 Organisasjonsforståelse (7,5 sp) | 0 / 19 / 50 / 64 / 40 | Ingen oppføring i dag. |
| Foretaksstrategi | OK (sikker) | SLED300 (7,5 sp), l. 1198 | SLED300 Strategi (7,5 sp) | 0 / 13 / 35 / 50 / 57 |  |
| Makroøkonomi | OK (sikker) | SSAM100 (7,5 sp), l. 1386 | SSAM100 Makroøkonomi (7,5 sp) | 0 / 0 / 13 / 26 / 63 |  |
| Mikroøkonomi | OK (sikker) | SSAM120 (7,5 sp), l. 1572 | SSAM120 Mikroøkonomi (7,5 sp) | 0 / 0 / 24 / 49 / 62 |  |
| Matematikk | OK (sikker) | SMET120 (7,5 sp), l. 1760 | SMET120 Matematikk for økonomer (7,5 sp) | 0 / 62 / 59 / 66 / 69 |  |
| Statistikk | OK (sikker) | SMET130 (7,5 sp), l. 1952 | SMET130 Statistikk for økonomer (7,5 sp) | 0 / 3 / 22 / 47 / 60 |  |
| Samf.vit. metode | OK (sikker) | SMET200 (7,5 sp), l. 2141 | SMET200 Samfunnsvitenskapelig metode (7,5 sp) | 0 / 5 / 37 / 42 / 51 |  |
| Etikk, samfunnsansvar og bærekraft | MANGLER (sikker) | – | SREG370 Etikk og samfunnsansvar (7,5 sp) | 0 / 0 / 0 / 43 / 45 |  |
| Innføring i bedriftsøkonomi (tillegg) | MANGLER (sikker) | – | SBED100 Grunnleggende bedriftsøkonomi (7,5 sp) | 0 / 0 / 50 / 54 / 64 |  |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 37,5, administrasjon 22,5, samfunnsøkonomi 15, metode 22,5, etikk 7,5; **105 sp**.

### UiT nett (`uit_nett`)

Program: B-ØKADMN, nett. HH-program i DBH-tallene: uit_nett_x. Kandidattall er ØA-kandidater per år 2021 / 2022 / 2023 / 2024 / 2025 (DBH 308, «Antall kandidater totalt» per studieprogram).

| Område | Status | I dag | Forslag | ØA-kandidater (område) | Bevis |
|---|---|---|---|---|---|
| Finansregnskap | UTGÅTT + STUDIEPOENG (sannsynlig) | BED-1505 (10 sp), l. 285 | BED-1002NETT Grunnleggende regnskap og analyse (10 sp, til 2025)<br>BED-1505 Grunnleggende regnskap og analyse (7,5 sp, fra 2026) | 0 / 116 / 124 / 161 / 156 | Kartlagt kode finnes ikke i DBH 208 for UiT 2021–2025 (ny nettstudieplan). Karakterene ligger på NETT-kodene (10 sp). Dagens kode BED-1505: –. |
| Økonomistyring | UTGÅTT + STUDIEPOENG (sannsynlig) | BED-2504 (10 sp), l. 471 | BED-2019NETT Driftsregnskap og budsjettering (10 sp, til 2025)<br>BED-2504 Driftsregnskap og budsjettering (7,5 sp, fra 2026) | 0 / 17 / 109 / 117 / 125 | Kartlagt kode finnes ikke i DBH 208 for UiT 2021–2025 (ny nettstudieplan). Karakterene ligger på NETT-kodene (10 sp). Dagens kode BED-2504: –. |
| Investering og finansiering | STUDIEPOENG + UTGÅTT (sikker) | BED-2503 (10 sp), l. 656 | BED-2503 Investering og finansiering (7,5 sp, fra 2025)<br>BED-2020NETT Investering og finansiering (10 sp, til 2024) | 0 / 123 / 122 / 122 / 109 | BED-2503 er 7,5 sp (109 i 2025); før det BED-2020NETT. |
| Markedsføring | STUDIEPOENG + UTGÅTT (sikker) | BED-1503 (10 sp), l. 843 | BED-1503 Markedsføring (7,5 sp, fra 2025)<br>BED-1004NETT Markedsføring (10 sp, til 2024) | 120 / 112 / 136 / 171 / 181 | BED-1503 er 7,5 sp (181 i 2025). |
| Organisasjon og ledelse | STUDIEPOENG + UTGÅTT (sikker) | BED-2502 (10 sp), l. 1021 | BED-2502 Organisasjonsteori og ledelse (7,5 sp, fra 2025)<br>BED-2029NETT Organisasjonsteori og ledelse (10 sp, til 2024) | 6 / 86 / 91 / 125 / 104 | BED-2502 er 7,5 sp (104 i 2025). |
| Foretaksstrategi | UTGÅTT + STUDIEPOENG (sannsynlig) | BED-2705 (10 sp), l. 1206 | BED-2003NETT Foretaksstrategi (10 sp, til 2025)<br>BED-2705 Foretaksstrategi (7,5 sp, fra 2026) | 0 / 15 / 89 / 95 / 126 | Kartlagt kode finnes ikke i DBH 208 for UiT 2021–2025 (ny nettstudieplan). Karakterene ligger på NETT-kodene (10 sp). Dagens kode BED-2705: –. |
| Makroøkonomi | UTGÅTT + STUDIEPOENG (sannsynlig) | SOK-1504 (10 sp), l. 1394 | SOK-1010NETT Makroøkonomisk analyse og økonomisk politikk (10 sp, til 2025)<br>SOK-1504 Makroøkonomisk analyse og økonomisk politikk (7,5 sp, fra 2026) | 0 / 0 / 129 / 129 / 125 | Kartlagt kode finnes ikke i DBH 208 for UiT 2021–2025 (ny nettstudieplan). Karakterene ligger på NETT-kodene (10 sp). Dagens kode SOK-1504: –. |
| Mikroøkonomi | UTGÅTT + STUDIEPOENG (sannsynlig) | SOK-1503 (10 sp), l. 1580 | SOK-1002NETT Mikroøkonomi: Økonomisk atferd, markeder og priser (10 sp, til 2025)<br>SOK-1503 Mikroøkonomi (7,5 sp, fra 2026) | 0 / 140 / 145 / 130 / 146 | Kartlagt kode finnes ikke i DBH 208 for UiT 2021–2025 (ny nettstudieplan). Karakterene ligger på NETT-kodene (10 sp). Dagens kode SOK-1503: –. |
| Matematikk | STUDIEPOENG + UTGÅTT (sikker) | BED-1501 (10 sp), l. 1768 | BED-1501 Matematikk for økonomer (7,5 sp, fra 2025)<br>BED-1007NETT Matematikk for økonomer (10 sp, til 2024) | 147 / 134 / 173 / 155 / 130 | BED-1501 er 7,5 sp (130 i 2025). |
| Statistikk | FEIL (sannsynlig) | BED-2501 (10 sp), l. 1960 | BED-2066 Statistikk for økonomer (7,5 sp, fra 2025)<br>BED-2011NETT Samfunnsvitenskapelig metode og statistikk (10 sp, til 2024) | 0 / 110 / 106 / 119 / 90 | BED-2501 finnes ikke i DBH; nettstudentene tok BED-2066 i 2025 (90). Dagens kode BED-2501: –. |
| Samf.vit. metode | UTGÅTT + STUDIEPOENG (sannsynlig) | BED-2506 (10 sp), l. 2149 | BED-2011NETT Samfunnsvitenskapelig metode og statistikk (10 sp, til 2024)<br>BED-2506 Anvendt metode (7,5 sp, fra 2026) | 0 / 110 / 106 / 119 / 0 | Kartlagt kode finnes ikke i DBH 208 for UiT 2021–2025 (ny nettstudieplan). Karakterene ligger på NETT-kodene (10 sp). Dagens kode BED-2506: –. |
| Etikk, samfunnsansvar og bærekraft | MANGLER (usikker) | – | FIL-0702 Examen philosophicum, nettbasert (10 sp) | 15 / 107 / 119 / 135 / 153 | Som for Tromsø: ex.phil. er det nærmeste. |
| Innføring i bedriftsøkonomi (tillegg) | MANGLER (sikker) | – | BED-1502 Bedriftsøkonomisk analyse (7,5 sp, fra 2025)<br>BED-1013NETT Bedriftsøkonomisk analyse (10 sp, til 2024) | 129 / 127 / 168 / 187 / 188 |  |

Sum etter gjennomgangen (emner gyldige i 2025): bedriftsøkonomi 35, administrasjon 25, samfunnsøkonomi 20, metode 15, etikk 10; **105 sp**.


## 5. Mulighetsvurdering: følge ØA-studieretten gjennom UHR-kjernen

### 5.1 Holder programtallene (`years`)?

**Ja, med forbehold.** DBH 308 fører karakterene på studentens eget studieprogram. `years` i `hhCourseData.json` er derfor karakterene til kandidatene med ØA-studierett, og `emnenivaa` er alle kandidatene på emnet ved institusjonen. Begge kommer fra samme tabell, år og fordeling (A–F, G/H). Det som skal til:

- **Riktig kartlegging først.** Uten rettingene i kapittel 3–4 måler vi feil emne i omtrent hvert tiende tilfelle. I 2024–2025 hadde den kartlagte koden færre enn halvparten av ØA-kandidatene i området i 46 av 486 celler (institusjon × område × år, med minst 20 ØA-kandidater i området). Mest gjelder det USN, UiT, UiT nett og BI. Feil som byttet makro/mikro hos UiT, UiAs ORG126 og Nords ECO1003 synes ikke i denne testen, fordi emnet har mange ØA-kandidater, bare i feil område.
- **Flere emner per område.** For å dekke hele kjernen (~105–120 sp) trengs 1–3 emner per område. Det er 20–30 emner per institusjon, mot 11–12 i dag.
- **Alle ØA-emner i hhCourseData.** `hhCourseData.json` har bare et utvalg av emnene per program (NMBU 74, NHH 84, HiØ 38). Flere av forslagsemnene mangler: BE-209, ME-201, BØK3651, REG1000 og alle etikkemnene må sjekkes. Rådataene i `data/hh/kilder/dbh-cache/308_*` har alle emnene, så det er en ren uttrekksjobb.
- **Riktig programkode.** NTNU Gjøvik og Ålesund lå under felleskoden BØA i 2022–2024, så `ntnu_gjovik_oa` og `ntnu_alesund_oa` er nesten tomme de årene. `nord_steinkjer_oa` er en kopi av `nord_oa`, og ONH mangler i DBH-cachen.

**Skjerming.** I hele `years`-datasettet for ØA-gruppen er 4,5 % av kandidatene skjermet (karakteren er skjult fordi cellen er liten). Det varierer fra 1,1 % (NHH) og 2–4 % (OsloMet, UiA, UiS, USN, BI, Kristiania, HVL Bergen) til 5–8 % (NMBU, HiØ, INN, Nord, NLA) og 10–22 % (UiT, HiMolde, INN Rena, NTNU Gjøvik/Ålesund, UiT Alta/Harstad). **Per UHR-område blir skjermingen liten**, fordi mange emner og semestre slås sammen. I 2025 var største skjermede andel i et område 0,7–8,3 % for standardinstitusjonene (NMBU 5,0 %, Nord 8,3 %, HiØ 6,8 %, resten under 6 %).

### 5.2 Programtall mot emnenivå

| Emne (2025) | ØA-programmet: n / snitt / stryk | Alle på emnet: n / snitt / stryk | ØA-andel |
|---|---|---|---|
| NMBU STAT100 Statistikk | 87 / 1,55 / 43,7 % | 631 / 1,94 / 30,6 % | 14 % |
| NMBU STAT100 (2024) | 84 / 2,00 / 25,0 % | 590 / 2,53 / 14,4 % | 14 % |
| NMBU ECN102 Matematikk | 113 / 0,94 / 61,1 % | 215 / 1,01 / 54,4 % | 53 % |
| NMBU BUS110 Finansregnskap | 91 / 1,79 / 24,2 % | 259 / 2,10 / 19,3 % | 35 % |
| NMBU AOS240 Metode | 67 / 3,61 / 0,0 % | 225 / 3,67 / 0,0 % | 30 % |
| OsloMet ØAMET1100 Statistikk | 265 / 3,25 / 17,0 % | 352 / 3,36 / 15,1 % | 75 % |
| HiØ ØKA120 Statistikk og metode | 114 / 1,57 / 42,1 % | 181 / 1,63 / 38,7 % | 63 % |
| UiA BE-111 Finansregnskap | 249 / 3,21 / 6,8 % | 390 / 2,84 / 11,5 % | 64 % |
| NTNU BØA1200 Finansregnskap | 207 / 3,19 / 8,2 % | 384 / 3,02 / 10,7 % | 54 % |
| HVL BØA111 Matematikk | 110 / 3,93 / 0,0 % | 289 / 2,30 / 31,5 % | 38 % |
| NHH MET2 Statistikk | 410 / 3,99 / 1,2 % | 420 / 3,96 / 1,2 % | 98 % |

**Per UHR-område, 2025** (studiepoengvektet snitt / strykprosent; samme emner som i kapittel 4):

| Institusjon | Metodefag, ØA | Metodefag, alle | Hele kjernen, ØA | Hele kjernen, alle |
|---|---|---|---|---|
| NMBU | 1,55 / 40,1 % | 1,94 / 28,9 % | 2,46 / 16,4 % | 2,43 / 16,6 % |
| HiØ | 1,89 / 34,9 % | 1,99 / 32,1 % | 2,13 / 22,3 % | 2,20 / 21,4 % |
| OsloMet | 2,83 / 17,8 % | 2,95 / 15,8 % | 2,76 / 15,2 % | 2,83 / 13,8 % |
| USN | 2,26 / 24,0 % | 2,31 / 22,8 % | 2,10 / 23,7 % | 2,12 / 22,4 % |
| UiA | 2,81 / 5,6 % | 2,73 / 5,6 % | 2,93 / 5,8 % | 2,82 / 6,9 % |
| NTNU | 3,29 / 6,2 % | 3,23 / 8,2 % | 3,11 / 6,2 % | 3,10 / 6,6 % |
| BI | 2,20 / 26,2 % | 1,99 / 31,7 % | 2,40 / 17,8 % | 2,25 / 20,5 % |
| Kristiania | 1,44 / 46,9 % | 1,62 / 43,0 % | 2,02 / 26,3 % | 2,21 / 19,1 % |
| HVL Bergen | 3,36 / 4,3 % | 2,50 / 21,2 % | 3,39 / 3,5 % | 2,54 / 16,1 % |
| NHH | 3,54 / 3,0 % | 3,53 / 3,0 % | 3,62 / 2,2 % | 3,61 / 2,3 % |

Hva tallene viser:
- **Forskjellen er størst der ØA-studentene er en liten del av emnet.** STAT100 (14 % ØA) undervurderer ØA-strykene med 13 prosentpoeng. Hos NHH (98–100 %) er tallene like.
- **Retningen varierer.** NMBU- og Kristiania-studentene gjør det dårligere enn snittet på emnet. UiA-, BI- og særlig HVL-studentene gjør det bedre. HVL Bergen skiller seg ut: ingen F i BØA111 for ØA, mot 91 F totalt. Det tyder på at mange som stryker, ikke har ØA-studierett (privatister, andre programmer eller studenter som har mistet studieretten). Det bør undersøkes før HVL vises.
- **På kjernenivå jevner forskjellene seg ut for NMBU** (2,46 mot 2,43), fordi ØA-studentene er svakere i metodefag og like gode eller bedre i resten. Område for område er derfor mer informativt enn ett samlet kjernesnitt.
- **Datafeil å passe på:** NTNU SØK1004 har flere programkandidater (177) enn emnekandidater (153) i 2025 i `hhCourseData`. Emnenivået bygger trolig på en annen versjon eller avgrensning, og må sjekkes mot 308e.

### 5.3 Hvilke mål gir mening?

| Mål | Kan måles med DBH 308 per program? | Merknad |
|---|---|---|
| Studiepoengvektet snitt per område og år | **Ja** | Σ(sp × karakterpoeng) / Σ(sp × n), bare A–F. G/H vises som beståttandel. |
| Strykprosent per område | **Ja** | F / (A–F). Vis n og skjermet andel ved siden av. |
| «UHR-kjernesnitt» per institusjon | **Ja, med forbehold** | Vektet over alle fem områdene. Følsomt for hvilke emner som er med; bør vises sammen med områdene, ikke alene. |
| Programtall mot emnenivå («ØA-gap») | **Ja** | Differansen i snitt og stryk. God indikator på om ØA-studentene er sterkere eller svakere enn resten på samme emne. |
| Dekningsgrad (kandidater i området / kullstørrelse) | **Tilnærmet** | Kandidater i området delt på møtt kull (DBH 571 eller SO) to år før. Teller eksamener, ikke personer. |
| Andel av kullet som har tatt alle kjerneområdene | **Nei** | Krever å følge den enkelte student (FS). |
| Gjennomføring av kjernen på normert tid | **Nei** | Krever kohort og eksamensår per student (FS). |
| Snitt per student (fordeling) og frafall etter stryk | **Nei** | Krever individdata (FS). |
| Gjentak (samme student flere forsøk) | **Nei** | 308 teller kandidater per semester. En student som tar emnet to ganger, telles to ganger. |
| Kull-tilhørighet | **Nei** | Eksamensåret blander kull, særlig når emner flyttes (NMBU ECN120/AOS120 i 2025). |

Andre forbehold: programtallene utelater kandidater uten aktiv studierett (privatister, utgått studierett). Strykprosenten for programmet kan dermed bli for lav (jf. HVL). Etterslepet i DBH er omtrent ett år.

### 5.4 Forslag til visning

1. **Matrise institusjon × UHR-område** (fem kolonner + «kjerne») med studiepoengvektet snitt for ØA-studentene i hver celle. Farge etter avvik fra NMBU, n og skjermet andel i liten tekst, og ⚠ ved n < 30 eller skjermet andel > 10 %.
2. **Bryter «ØA-studentene / alle på emnet»**, og en tredje visning «ØA-gap» (forskjellen). Det er her STAT100-poenget kommer fram.
3. **Klikk på en celle** åpner emnene i området: kode, sp, år, fordeling A–F, n og skjermet. Merk forgjengerkoder for eldre år.
4. **Årsvelger 2021–2025**, standard siste år, med en liten tidsserie per område.
5. **Studiepoeng i UHR-områdene** (tabell 3.1) som egen fane, med minimumene 30/30/15/20/7,5 og 120-kravet.

### 5.5 Forslag til dataformat

Én fil, for eksempel `kilde/src/app/data/hhUhrKjerne.json`, generert fra `data/hh/kilder/dbh-cache/308_*`, `308pt_*`, `308e_*`, `308et_*` og kartleggingen i `data/hh/uhr-gjennomgang.json`:

```json
{
  "generert": "2026-10-17",
  "kilde": "DBH 308 (karakterer per studieprogram og per emne), DBH 208 (sp)",
  "omraader": [
    {"id": "bedriftsokonomisk", "navn": "Bedriftsøkonomiske fag", "minSp": 30, "maksSp": 45},
    {"id": "administrasjon", "navn": "Administrative fag", "minSp": 30, "maksSp": 45},
    {"id": "samfunnsokonomi", "navn": "Samfunnsøkonomiske fag", "minSp": 15, "maksSp": 30},
    {"id": "metodefag", "navn": "Metodefag", "minSp": 20, "maksSp": 30},
    {"id": "etikk", "navn": "Etikk, samfunnsansvar og bærekraft", "minSp": 7.5, "maksSp": 15}
  ],
  "institusjoner": {
    "nmbu": {
      "program": {"hhEntryId": "nmbu_oa", "dbhInstitusjonskode": "1173", "dbhProgramkoder": ["B-ØA"]},
      "aar": {
        "2025": {
          "omraader": {
            "metodefag": {
              "spDekket": 25,
              "oa":   {"n": 267, "skjult": 2, "snitt": 1.55, "stryk": 40.1, "fordeling": {"A": 14, "B": 48, "C": 49, "D": 25, "E": 24, "F": 107}},
              "alle": {"n": 1071, "skjult": 0, "snitt": 1.94, "stryk": 28.9},
              "emner": [
                {"kode": "ECN102", "sp": 10, "oa": {"n": 113, "snitt": 0.94, "stryk": 61.1}, "alle": {"n": 215, "snitt": 1.01, "stryk": 54.4}},
                {"kode": "STAT100", "sp": 10, "oa": {"n": 87, "snitt": 1.55, "stryk": 43.7}, "alle": {"n": 631, "snitt": 1.94, "stryk": 30.6}},
                {"kode": "AOS240", "sp": 5, "oa": {"n": 67, "snitt": 3.61, "stryk": 0.0}, "alle": {"n": 225, "snitt": 3.67, "stryk": 0.0}}
              ]
            }
          },
          "kjerne": {"oa": {"snitt": 2.46, "stryk": 16.4}, "alle": {"snitt": 2.43, "stryk": 16.6}},
          "dekningsgrad": null
        }
      }
    }
  }
}
```

(`fordeling` er summen A–F over emnene i området. Snittet er vektet med studiepoeng og avviker derfor fra et uvektet snitt av fordelingen.) Regler: `snitt` = studiepoengvektet over emnene i området; `stryk` = F / (A–F); `skjult` = `308pt`-total minus summen av karakterradene; emner med bare G/H får `snitt: null` og et eget `bestatt`-felt. Forgjengerkoder brukes etter `aarFra`/`aarTil` i `uhr-gjennomgang.json`.

**Konklusjon:** En gjennomgang som følger ØA-studieretten område for område er mulig med dagens DBH-uttrekk, og bedre enn emnenivå. Den krever (1) rettet kartlegging med flere emner per område og forgjengerkoder, (2) et nytt uttrekk av alle kjerneemnene per program fra 308-cachen og (3) forbehold om skjerming, gjentak og studenter uten studierett. Andel av kullet som har fullført hele kjernen, og gjennomføring per student, kan ikke måles uten individdata fra FS. For NMBU kan det løses lokalt med FS-uttrekk. For konkurrentene går det ikke.

## 6. Kilder

- UHR-ØA: [Minimumskrav for Bachelor i økonomi og administrasjon (BØA), november 2018](https://www.uhr.no/_f/p1/i48e11d18-8b76-4089-acb1-511fa13135e4/boa-planvedtatt-av-uhr-oa-november-2018-endelig.pdf)
- NRØA: [Plan for bachelor i økonomi og administrasjon, vedtatt 17.10.2011](https://www.nhh.no/contentassets/bbbee551fb9c461593eea8fb507dc012/plan-for-bachelor-i-okonomi-og-administrasjon.pdf)
- UHR-ØA: [Anbefalt plan for regnskapsførerutdanning, vedtatt 22.06.2023](https://www.uhr.no/_f/p1/i22355be1-aace-444f-8d49-31ccd512250a/anbefalt-plan-for-regnskapsforerutdanning-vedtatt-22062023.pdf)
- BI: [Tildeling av tittelen siviløkonom](https://www.bi.no/studier-og-kurs/soknad-og-opptak/opptakskrav/master-of-science-in-business/tildeling-av-tittelen-sivilokonom/), [Bachelor i økonomi og administrasjon](https://www.bi.no/studier-og-kurs/bachelorstudier/okonomi-og-administrasjon/), [SØK 3420](https://programmeinfo.bi.no/en/course/S%C3%98K-3420/2024-autumn), [SØK 3500](https://programmeinfo.bi.no/en/course/S%C3%98K-3500/2025-autumn)
- NMBU: [Bachelor i økonomi og administrasjon, oppbygning](https://www.nmbu.no/studier/bachelor-i-okonomi-og-administrasjon-oppbygning-og-gjennomforing)
- UiA: [Studieplan 2026h](https://www.uia.no/studier/program/okonomi-og-administrasjon-bachelor/studieplaner/2026h.html)
- UiT: [Studieplan Tromsø fra kull 2025 (PDF)](https://uit.no/Content/876699/cache=20260906132619/Studieplan%20-%20Bachelor%20i%20%C3%B8konomi%20og%20administrasjon%20Troms%C3%B8%20fra%20kull%202025.pdf)
- ONH: [Bachelor i økonomi og administrasjon (nett)](https://oslonyehoyskole.no/studier/nettstudier/bachelor-i-okonomi-og-administrasjon)
- DBH: tabell 308 (per program og emne), 208 (emneregister), lokal cache `data/hh/kilder/dbh-cache/` hentet 22.09.2026.
