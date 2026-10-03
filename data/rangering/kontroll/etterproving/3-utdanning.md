# Etterprøving 3: utdanningstallene (bachelor i økonomi og administrasjon)

Kontrollert 3. oktober 2026. Fasit: `data/rangering/rangering-klartekst.json`, `skoler[].utdanning.oa`. Bygget av `scripts/build-rangering.py` (funksjonen `utdanning`).
Kontrolldata hentet på nytt i dag: SO programtabell 2026 (`grunndata_tabell_2_uhg_hoved_26.html`), SO poenggrenser (Tableau-CSV, år 2025 og 2026), studiebarometeret.no (programsidene) og DBH tabell 707 (API).

## Konklusjon

**Tallene er riktig avskrevet fra kildene, men poenggrense, førstevalg per plass, Studiebarometer og normert tid er feil for fire skoler (NTNU, OsloMet, UiA, USN) fordi siviløkonomprogrammene (femårig master) er blandet inn i «bachelor».** Prefikskoblingen `eid.startswith(skole_id + "_")` fanger alle oppføringer i gruppen `oa`, også de fire som har `type: master5` (`ntnu_siv`, `oslomet_siv`, `uia_siv`, `usn_siv`).

| Hva | Funn | Alvorlighet |
|---|---|---|
| Kildetall (plasser, førstevalg, alle søkere, poenggrense ordinær/FV) | Alle 31 programmer med SO-kode stemmer eksakt med SO i dag. 0 avvik. | OK |
| Studiebarometeret, 12 program kontrollert | Alle program-tall stemmer (verdi, respondenter, år). | OK |
| DBH 707 fullført normert, 5 program kontrollert | Alle stemmer (NHH, NMBU, UiS, UiA, BI). | OK |
| Siviløkonom blandet inn (NTNU, OsloMet, UiA, USN) | Feil poenggrense, førstevalg per plass, normert tid og Studiebarometer. | **Høy** |
| NTNU maks poenggrense 60,5 kommer fra siviløkonom (`ntnu_siv`) | Bachelor-tallet er 58,2. NTNU er ikke best; NHH (59,9) er. | **Høy** |
| OsloMet Studiebarometer 4,3 kommer fra siviløkonom (18 respondenter) | Bachelor-programmet har «Ikke nok svarende» (39 resp., 17,3 %). Skal være tomt. | **Høy** |
| UiA normert tid 46,7 % | Bachelor alene er 61,3 % (155/253). Siviløkonom-raden er kull 2015 med 7/94. | **Høy** |
| «Maks poenggrense» som mål | Svakt: ett studiested avgjør, 0 behandles som manglende, to av programmene er konsept-forskjellige. Se del 5. | Middels |
| Private skoler | BI og Kristiania mangler plasser og poenggrense systematisk (lokalt opptak). NLA er ikke med som skole. | Middels |

Tre konkrete rettelser gir riktig bilde: (1) filtrer på `type == "bachelor"` i `mine()`, (2) vekt Studiebarometer med respondenter og dropp «ikke nok svarende», (3) bruk bare siste felles kull per skole i normert tid. Se del 6.

## 1. Hvilke programmer havner under hver skole

Gruppen `oa` har 33 oppføringer (29 bachelor, 4 master5). Prefiksregelen er `eid == p or eid.startswith(p + "_")`, der `p` er skole-id (eller «ntnu» for `ntnu_ok`; `programprefiks` er ikke satt for noen skole i `skoler.json`).

| Skole-id | entryId-er som fanges | Merknad |
|---|---|---|
| nhh | nhh_oa | OK. NHHs andre bachelor, BEDS (191340, 75 plasser), er ikke med. |
| bi | bi_oa | Lokalt opptak, 2025-tall, hele BI (alle campuser). |
| nmbu | nmbu_oa | OK. |
| uis | uis_oa | OK. |
| uia | uia_oa, **uia_siv** | siv = femårig master. Feil. |
| nord | nord_oa, nord_steinkjer_oa | OK, men begge har samme DBH-kode (BAØKLED): kullet telles to ganger i datasettet (brøken blir likevel riktig, 41/110). |
| ntnu | ntnu_oa, ntnu_alesund_oa, ntnu_gjovik_oa, **ntnu_siv** | siv feil. Ålesund og Gjøvik tilhører trolig ikke «NTNU Handelshøyskolen» (DBH 230210, bare Trondheim), se under. |
| ntnu_ok | samme fire som ntnu | **Identiske tall med ntnu.** Raden «hele fakultetet» skiller seg ikke fra instituttet i utdanningsdelen. |
| uit | uit_oa, uit_alta_oa, uit_harstad_oa | Tre studiesteder. Alta har ingen kull i 2022 og ingen Studiebarometer-kobling. |
| usn | usn_oa, usn_honefoss_oa, usn_bo_oa, usn_kongsberg_oa, **usn_siv** | siv feil. Se USN-merknad under. |
| inn | inn_oa, inn_rena_oa | DBH-kodene ØKBAC og BØADM er «antatt» i programkartet. Kullet 2022 har bare 31 og 95 studenter. |
| oslomet | oslomet_oa, **oslomet_siv** | siv feil. |
| himolde | himolde_oa | OK. |
| hvl | hvl_bergen_oa, hvl_haugesund_oa, hvl_sogndal_oa | Prefikset «hvl» treffer `hvl_bergen_oa` som ønsket (via «hvl_»). Tre studiesteder, ikke Digital økonomi og ledelse. |
| kristiania | kristiania_oa | Lokalt opptak, 2025. |
| hiof | hiof_oa | OK. |
| uib_okon, uio_okon | ingen | Referanser uten ØA-program, som ønsket (`utdanning` er `null`). |

Alle 15 skoler har minst ett ØA-program. Ingen mangler.

### Mulige avgrensningsfeil (bør avklares, ikke endret her)
- **NTNU:** Notatet i `kontroll/notat.md` sier «NTNU Business School» er instituttet i Trondheim. Likevel regnes Ålesund og Gjøvik (andre institutter) med i utdanning. Ønsket avgrensning bør være enten «bare Trondheim» eller «hele NTNU» uttrykt likt i alle deler.
- **USN:** DBH-koden OKLED dekker alle USN-studiestedene (2022-kull 444). Opptaket tar bare med Drammen (ØL, 115 plasser) og tre ØA-program (20/20/25 plasser) = 180 plasser. SO har i tillegg «Økonomi og ledelse» i Vestfold (130 plasser, pg 40,9), Kongsberg (100), Hønefoss (60) og Bø (80). Omfanget i opptak og gjennomføring er altså ulikt.
- **USN Studiebarometer:** `usn_honefoss_oa` er koblet til sbId `1176_okled-bo` (Bø), og `usn_kongsberg_oa` (ØA, 222625) til `okled-kongsberg` (ØL). Kobling bør bekreftes.
- **Ikke med, men i samme fagområde («Økonomisk-administrative fag»), SO 2026:**

| Kode | Studium | Plasser | Førstevalg | Poenggrense ord. |
|---|---|---|---|---|
| 191340 | NHH Business, economics and data science - siviløkonom | 75 | 518 | 63,8 |
| 215162 | OsloMet Økonomi og ledelse | 35 | 324 | 62,9 |
| 217218 | UiS Økonomi og ledelse | 57 | 163 | 52,0 |
| 203218 | HVL Digital økonomi og ledelse (Bergen) | 30 | 139 | 56,0 |
| 192591 | NMBU Økonomi, ledelse og IT | 35 | 62 | 42,5 |
| 209449 | INN Økonomi og administrasjon, Rena, nettbasert | 20 | 228 | 63,0 |

Hvis disse regnes som ØA-program, endres «høyeste poenggrense» (NHH 63,8 og OsloMet 62,9 ville passert NTNU og alle). Det viser hvor følsomt målet er for programvalget. Kontroll av hva som regnes som ØA-bachelor er et redaksjonelt valg, ikke en tallfeil.

## 2. Poenggrense og søkere/førstevalg mot Samordna opptak (2026)

Alle 31 programmer med SO-kode ble sammenlignet mot SO-programtabellen (alle søkere, førstevalgssøkere, studieplasser) og SO-poenggrensene (hovedopptak, ordinær kvote og førstegangsvitnemålskvote). Resultat: **0 avvik** på de fem feltene.

Skolenivå, slik fasiten viser det, mot hva det blir uten siviløkonom (kun `type == bachelor`):

| Skole | Plasser vist | Førstevalg vist | FV/plass vist | Maks pg vist | Plasser korr. | Førstevalg korr. | FV/plass korr. | Maks pg korr. |
|---|---|---|---|---|---|---|---|---|
| NHH | 425 | 1 899 | 4,47 | 59,9 | 425 | 1 899 | 4,47 | 59,9 |
| NMBU | 95 | 296 | 3,12 | 50,4 | 95 | 296 | 3,12 | 50,4 |
| UiS | 140 | 674 | 4,81 | 48,0 | 140 | 674 | 4,81 | 48,0 |
| **UiA** | 250 | 706 | **2,82** | 50,9 (min 46,5) | 150 | 507 | **3,38** | 50,9 (min 50,9) |
| **NTNU** | 411 | 1 911 | **4,65** | **60,5** (min 41,5) | 306 | 1 495 | **4,89** | **58,2** (min 41,5) |
| UiT | 550 | 725 | 1,32 | 45,8 | 550 | 725 | 1,32 | 45,8 |
| **USN** | 220 | 366 | **1,66** | 46,0 | 180 | 324 | **1,80** | 46,0 |
| **OsloMet** | 400 | 1 543 | **3,86** | 52,8 (min 51,3) | 280 | 1 205 | **4,30** | 52,8 (min 52,8) |
| HVL | 254 | 967 | 3,81 | 55,8 (min 28,7) | 254 | 967 | 3,81 | 55,8 (min 28,7) |
| INN | 120 | 164 | 1,37 | 44,6 | 120 | 164 | 1,37 | 44,6 |
| Nord | 100 | 116 | 1,16 | uten | 100 | 116 | 1,16 | uten |
| HiMolde | 60 | 79 | 1,32 | uten | 60 | 79 | 1,32 | uten |
| HiØ | 90 | 159 | 1,77 | uten | 90 | 159 | 1,77 | uten |

«Uten» = SO oppgir 0 for ordinær kvote (alle kvalifiserte fikk tilbud). Fasiten viser det som `null`.

Rangering blant de 15 skolene med riktig regnet utvalg (plassering i parentes, vist -> korrigert):
- Maks poenggrense: NTNU #1 -> #2, NHH #2 -> #1. Resten uendret.
- Førstevalg per plass: NTNU #2 -> #1, UiS #1 -> #2, UiA #7 -> #6, NMBU #6 -> #7, USN #9 -> #8, HiØ #8 -> #9.

NMBU faller altså én plass på søkerpress og NHH tar toppen på poenggrense.

## 3. Studiebarometeret (helhetsvurdering, siste år)

Kontrollert mot `studiebarometeret.no/no/student/studieprogram/<sbId>` (feltet `compare-page`, kategori «Helhetsvurdering»).

| Program | Fasit | Nett | Respondenter | År | Status |
|---|---|---|---|---|---|
| NHH `1240_bachelor15` | 4,3 | 4,3 | 198 (45,4 %) | 2025 | OK |
| NMBU `1173_b-øa` | 4,1 | 4,1 | 54 (58,1 %) | 2025 | OK |
| UiS `1160_b-økad` | 3,8 | 3,8 | 82 (46,6 %) | 2025 | OK |
| UiA `1171_bacøkad` | 4,1 | 4,1 | 101 (43,7 %) | 2025 | OK |
| NTNU `1150_bøa-trondheim` | 4,0 | 4,0 | 76 (39,2 %) | 2025 | OK |
| BI `8241_dipøah-b` | 4,2 | 4,2 | 101 (27,1 %) | 2025 | OK (bare BI Bergen) |
| HVL `238_øau3-bergen` | 4,0 | 4,0 | 50 (31,6 %) | 2025 | OK |
| UiT `1130_b-økadm-tromso` | 3,5 | 3,5 | 31 (25,4 %) | 2025 | OK |
| USN `1176_okled-drammen` | 4,0 | 4,0 | 33 (36,7 %) | 2025 | OK |
| Nord `1174_baøkled-steinkjer` | 4,1 | 4,1 | 19 (59,4 %) | 2025 | OK |
| **OsloMet `1175_okad` (bachelor)** | **tom** | **Ikke nok svarende** | 39 (17,3 %) | 2025 | OK (programmet er tomt) |
| OsloMet `1175_okadsiv` (siv) | 4,3 | 4,3 | 18 (22,8 %) | 2025 | **Brukes feilaktig som OsloMets verdi** |

Det er programtallene som stemmer. Skolenivået gir feil av tre grunner:
1. **OsloMet 4,3 er hentet fra siviløkonom** (18 respondenter). Bachelor-programmet har ikke nok svar. Skolen bør vises uten Studiebarometer, ikke som nr. 2.
2. **Uvektet snitt av program.** UiA 3,85 = snitt av bachelor 4,1 og siv 3,6. Riktig er 4,1. NTNU 3,97 er et uvektet snitt av tre program (Gjøvik mangler); vektet med respondenter blir det 3,97, altså tilfeldigvis likt. UiT 3,55 og USN 3,67 er også uvektede.
3. **Årsblanding.** Studiebarometeret slår sammen 2024 og 2025 når 2025 har for få svar. Gjelder Nord Bodø, HiØ, HiMolde, UiT Harstad og USN Kongsberg (`latestYear: null` i datafila). Skolene vises likevel som «siste år».

Rangering (Studiebarometer): OsloMet #2 -> ingen. UiA #8 -> #4. Alle andre flytter høyst 2 plasser.

## 4. Fullført på normert tid (DBH tabell 707)

Hentet på nytt fra `dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData`, tabell 707, startkull 2022 (normert tid til 2025).

| Program (DBH-kode) | Startkull 2022 | Fullført normert | Andel | Fasit | Status |
|---|---|---|---|---|---|
| NHH BACHELOR15 | 526 | 345 | 65,6 % | 65,6 | OK |
| NMBU B-ØA | 64 | 28 | 43,8 % | 43,8 | OK |
| UiS B-ØKAD | 254 | 125 | 49,2 % | 49,2 | OK |
| UiA BACØKAD | 253 | 155 | **61,3 %** | **46,7** | **Feil på skolenivå** (siv trekker ned) |
| BI DIPØAH | 1 262 | 549 | 43,5 % | 43,5 | OK |

For UiA er fasitens 46,7 % = (155 + 7) / (253 + 94). Raden 7/94 er `uia_siv`, kull 2015 (femårig, normert til 2020). Andre blandinger i `normertTid`:
- NTNU 40,4 (bachelor alene 40,5), UiT 46,9 (49,7), USN 36,8 (37,8). Her summeres kull fra ulike år: NTNU Ålesund 2020 (3 studenter) og Gjøvik 2019 (67), UiT Alta 2020 (61). Siste kull per program er ikke 2022.
- Nord teller samme DBH-rad to ganger.
- `normertKull` er `max()` over programmene, så kolonnen viser 2022 også når deler av tallet er eldre.
- Korrigert (kun bachelor, kun kull 2022): UiA 61,3 (#6 -> #2 av 15), OsloMet 52,8 (#2 -> #3), UiS #3 -> #5, HVL #4 -> #6.

Sammenligningene er også følsomme for små kull: kull 2022 NHH har 65,6 % mot 54,5 % i kull 2021.

## 5. Kritisk vurdering av metoden

### Er maks poenggrense blant studiestedene et godt mål?
Nei, ikke alene.
1. **Ett studiested avgjør.** Maks velger flaggskipet (Trondheim, Bergen, Alta). HVL har 55,8 (Bergen) og 28,7 (Haugesund) med 114 og 80 plasser. UiT maks 45,8 er Alta (350 av 550 plasser), mens Tromsø har 38,6. Plasser-vektet snitt blant program med grense er: NTNU 53,3, HVL 44,6, UiT 43,7 (mot maks 58,2/55,8/45,8). Vektet snitt eller grensen for det største programmet gir mer rettferdig mål for «hva er det typiske».
2. **Null er ikke manglende.** SO gir 0 når alle kvalifiserte fikk tilbud. Fasiten viser `null` for Nord, HiMolde og HiØ, og Min ignorerer 0-programmer (UiT Harstad, USN-stedene, INN Rena, HVL Sogndal). Min blir dermed «laveste blant dem som har grense», ikke laveste. Skolene uten grense bør settes lavest og merkes «alle kvalifiserte fikk tilbud».
3. **Ett år, hovedopptak, ordinær kvote.** Grensen er den siste ordinære kvoten ved hovedopptaket og avhenger av kvotestørrelse, tilleggspoeng (alder, realfag, folkehøyskole) og antall førstegangsvitnemål-søkere. Små programmer svinger mye: UiT Tromsø 45,5/37,7/42,7/38,5/36,0/38,6 (2021–2026), UiT Alta 46,6/44,0/47,6/50,0/47,0/45,8. NHH og NTNU er stabile (stigende 58,3 -> 59,9 og 54,3 -> 58,2).
4. **Ordinær kvote ser bare halve bildet.** FV-grensen er egen. HVL Haugesund, UiT Tromsø, NTNU Gjøvik og NLA Kristiansand har FV-grense over ordinær grense.
5. **Bedre mål finnes i datasettet:** `kp_mott` (snitt konkurransepoeng for møtte, 2025) finnes for både SO-skoler og BI (41,0). NHH 53,4, NTNU 51,4, HVL Bergen 50,6, OsloMet 48,5, UiA 46,4, NMBU 46,8, Nord 38,5. Dette er et sammenlignbart mål som også inkluderer BI. `op_mott` (opptakspoeng møtte) fins også.

### Er førstevalg summert over studiesteder delt på plasser riktig regnet?
Regnemessig ja, men som mål har det fire svakheter.
- **Summering er lovlig.** SO-tallet «Førstevalgssøkere» er prioritet 1 per studietilbud, og en søker har ett førstevalg, så ingen dobbelttelling mellom studiesteder. Forholdet er plasser-vektet snitt (sum over sum), ikke snitt av forholdstall. Det er konsistent.
- **Siviløkonom og andre programtyper er blandet inn** (del 2). Det er den største feilen i tallet.
- **Vektingen skjuler studiestedene.** UiT 1,32 er et snitt av Alta (469/350 = 1,34), Tromsø (186/140 = 1,33) og Harstad (70/60 = 1,17). For en søker er hvert studiested en egen konkurranse. HVL 3,81 er Bergen 6,92 og Haugesund 1,40 + Sogndal 1,10.
- **Nevneren er planlagte plasser, ikke tilbud.** Alle søkere per plass gir en annen rekkefølge: NHH er #3 på førstevalg per plass (4,47) men #7 på alle søkere per plass (11,2). NTNU og UiS topper begge. Førstevalg per plass er best egnet til å måle ekte interesse; «alle søkere» måler bredde. Siden tilbud er ca. det dobbelte av plassene overalt (NHH 838 mot 425), er også førstevalg per tilbud verdt å vise.
- **BI og Kristiania:** Førstevalg finnes (DBH 379, 2025), plasser mangler, så FV per plass kan ikke regnes. BI har tilbud = kvalifiserte (100 %).

### Mangler private skoler systematisk?
Ja, delvis.
- **BI og Kristiania** (lokalt opptak, ikke SO) har aldri plasser eller poenggrense. De vises med `null` på plasser, førstevalg per plass og poenggrense, og de er blant de største: BI hadde 2 906 tilbud og 1 866 møtte i 2025, mot NHH 838 tilbud.
- **Årsforskjell:** BI og Kristiania vises med 2025-tall, alle andre med 2026.
- **NLA Høgskolen** (privat, SO) har tre ØA-program i opptaksdata (Oslo 70, Bergen 25, Kristiansand 25 plasser), men er ikke egen skole i rangeringen. NLA Stavanger (254369, 25 plasser) mangler også i opptaksdata. Det er trolig valgt fordi NLA ikke har en handelshøyskole, men det bør begrunnes.
- **Studiebarometer for BI** gjelder bare BI Bergen (Oslo har for få svar), mens opptak og gjennomføring gjelder alle campuser.
- **Gjennomføring** for BI (DIPØAH) og Kristiania (BOL) finnes fra DBH og er med.
- **Konsekvens:** Rangering på selektivitet (poenggrense) rangerer bare statlige skoler. Det bør stå synlig ved målet, og private bør vises med `kp_mott` eller «åpent opptak, 100 % av kvalifiserte får tilbud».

## 6. Anbefalte rettelser (rekkefølge)

1. I `utdanning()`: begrens `mine()` til oppføringer der programtypen er `bachelor` (bruk `entry["type"]`). Fjerner `ntnu_siv`, `oslomet_siv`, `uia_siv`, `usn_siv`. Rettelsene i del 2–4 følger av dette.
2. Studiebarometer: vekt med respondenter, dropp program med `helhet == null`, og merk tall som er 2024+2025 slått sammen.
3. Normert tid: bruk kull 2022 for alle, eller siste felles kull; ikke summer kull fra ulike år. Dedupliser Nord (samme DBH-kode for Bodø og Steinkjer).
4. Poenggrense: vis også vektet snitt og «andel plasser uten grense»; behandle 0 som «alle kvalifiserte fikk tilbud» og ikke som manglende. Vurder `kp_mott` som sammenligningsmål, også for BI.
5. Avklar avgrensning: NTNU (Trondheim eller alle steder), `ntnu_ok` må gi andre tall enn `ntnu` hvis den skal være «hele fakultetet», USN (ØL i alle steder, i både opptak og gjennomføring), og hvilke av programmene i tabellen i del 1 som skal regnes som ØA.
6. Lås Studiebarometer-koblingene for USN (Hønefoss/Bø/Kongsberg) og INN (antatt kode).
