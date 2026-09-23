# Datakilder for Handelshøyskolen BI (8241) og Høyskolen Kristiania (8253)

Arbeidsnotat 23.09.2026 (Opus 5.5). Rådata, prøveuttrekk og notater ligger i `data/nmbu/kilder/bi-kristiania/`.
Merket **[V]** = hentet og kontrollert i denne økten. **[A]** = antatt eller bare lest i søkeresultat.

## 1. Sammendrag

1. **Den største mangelen er enkel å fylle:** BI og Kristiania er ikke i Samordna, men DBH 379 har søknader, tilbud,
   aksepterte og møtte for **bachelorprogrammene** deres også, ikke bare for masterne. BIs bachelor i økonomi og administrasjon
   (DIPØAH) hadde 3 343 søknader, 2 906 tilbud og 1 866 møtte i 2025. Kristianias bachelor i økonomi og ledelse (BOL) hadde
   639 / 602 / 159. I dag står BI bare i to mastergrupper hos HH, og Kristiania er ikke med noe sted. **[V]**
2. **Opptaksnivået kan måles for BI:** DBH 571 har karakterpoeng for BIs lokale opptak (opptakstype L). Snittet for dem som møtte
   på DIPØAH var 41,0 i 2025, mot omtrent 46 for NMBU B-ØA. Kristiania rapporterer på en annen skala (2–4), så de tallene kan
   ikke sammenlignes. **[V]** (skalaen er en tolkning **[A]**)
3. **BI tar opp nesten alle kvalifiserte:** alle 2 906 kvalifiserte søkere fikk tilbud på DIPØAH i 2025, og 437 var ikke
   kvalifisert. Kristiania skriver på programsiden at opptaket fortsetter «så lenge det er ledige plasser». Dette er et
   viktig poeng for posisjoneringen: tilbudsandelen mot NMBUs poenggrense. **[V]**
4. **Emnelenker er mulig for begge. Det tidligere funnet i `emne-url-monstre.json` er feil:**
   - BI har åpne kursbeskrivelser på `https://www.bi.no/studier-og-kurs/kursbeskrivelser/?subjectCode={BOKSTAVER}&courseNumber={4 siffer}`.
     DBH-koden er bokstaver + fire siffer + ett siffer for versjon (GRA65553 → GRA 6555). I en prøve på 40 tilfeldige
     DBH-koder svarte 39 med 200 og riktig tittel. Beskrivelsen er et utdrag, gjengitt på serveren. **[V]**
   - Kristiania har et åpent sidekart (`/sitemap.xml`) med 6 756 emnesider under `/studieportal/…/{kode}/…`, som dekker
     1 671 av 1 714 DBH-koder (97 %). Det finnes også et åpent søke-API, `GET /api/search/syllabus?phrase={kode}`, som ga
     eksakt treff på 35 av 35 koder. **[V]**
5. **Studiebarometeret dekker begge, BI per campus:** økonomi og administrasjon i Bergen (101 svar), Trondheim (49) og
   Stavanger. Oslo har for få svar (10,5 % svarprosent). Kristiania har tall for BOL, BOD, BIF, MIN og MLS. **[V]**
6. **Økonomi:** DBH 902 har feltet «Eksamensavgift private høyskoler», det vil si skolepengeinntektene. For 2025 var de
   1,52 mrd. kr hos BI og 1,03 mrd. kr hos Kristiania. Kristiania mangler helt i økonomi- og fagmiljøkortene, selv om 902,
   750, 225 og 373 har data. BI mangler bare tabell 335. **[V]**
7. **Kandidatundersøkelsen er ikke brukbar for BI:** BI vil ikke være med. Det står i NIFU arbeidsnotat 2026:8, fotnote 2.
   Undersøkelsen deler dessuten ikke resultatene på institusjon. **[V]**

## 2. Kildetabell

| Kilde | Innhold for BI/Kristiania | Format | Dekning | Verdi | Innsats |
|---|---|---|---|---|---|
| DBH 379 lokale opptak | Søknader, prioritet, kvalifisert, tilbud, akseptert, møtt, kjønn; bachelor og master | API JSON | BI 2021–25, K 2021–25 (BOA/NOA nett mangler) **[V]** | **Høy** | Lav: finnes allerede i `fill-local-admissions.py` |
| DBH 571 opptakspoeng, type L | Sum karakterpoeng for søkere og møtte | API | BI og K 2023–25; bare BI på sammenlignbar skala **[V]** | Middels–høy (BI) | Lav–middels: skriptet filtrerer i dag på N |
| DBH 124 registrerte per campus | Studenter per campus og program | API | BI: Oslo/Bergen/Trondheim/Stavanger/nett **[V]** | Middels | Lav |
| DBH 308/208 karakterer | Program- og emnenivå | API | BI DIPØAH 2025: 31 000 karakterer; K BOL **[V]** | Høy | Lav: samme kjede |
| DBH 707/706/705 gjennomføring | Kull, fullført, frafall | API | BI DIPØAH kull 2017–22; K BOL 2018–22, MIN, MLS **[V]** | Høy | Lav |
| DBH 60/135/142/123/110/104 | Alder, utenlandske, utveksling, studenttall | API | BI i cachen; K ikke hentet **[A]** | Middels | Lav: følger programkartet |
| DBH 335 sp iht. plan | Studiepoeng planlagt og gjennomført | API | K har data, BI mangler **[V]** | Lav–middels | Lav |
| DBH 902 økonomi | Inkl. eksamensavgift, egenkapital, salg/leie (private) | API | BI 2019–25, K 2018–25 **[V]** | **Høy** (Kristiania mangler) | Lav |
| DBH 750 styringsindikatorer | KD-indikatorer | API | K 2024 har 11 indikatorer **[V]** | Middels | Lav |
| DBH 225/220/373/374 | Årsverk, publisering | API | K 2024: 650 årsverk, 502 publiseringspoeng **[V]** | Middels | Lav |
| DBH 703 regnskap private | Full regnskapspakke med noter | API | BI og K 2024, 843 rader **[V]** | Lav: 902 dekker hovedtallene | Middels |
| DBH 132/112 søknader/opptak (eldre) | Søknader/opptatte per år | API | BI fra 2001, K fra 2018 **[V]** | Lav–middels (lange serier) | Lav |
| DBH 370 studieplasser | – | API | Tomt for BI og K **[V]** | Ingen | – |
| DBH 226 areal | – | API | Ikke rapportert for BI og K **[V]** | Ingen | – |
| Studiebarometeret | Åtte indekser, tidsserie, detaljer | HTML/JSON (som i dag) | BI 55 program per campus, K 74 program **[V]** | **Høy** | Lav: sbId settes manuelt |
| BI kursbeskrivelser | Utdrag: innhold, læringsmål, vurdering | HTML med mønster-URL | 39/40 DBH-koder **[V]** | **Høy** (emnelenker) | Lav |
| Kristiania studieportal | Emnebeskrivelse per kode | Sidekart-XML + JSON-API | 97 % av DBH-kodene **[V]** | **Høy** (emnelenker) | Lav–middels (trenger oppslagsfil) |
| Kristiania programbeskrivelser | Emneliste per program og kull (JSON i sida, PDF) | HTML/JSON/PDF | BOL kull 2019–25 **[V]** | Middels (studieplaner) | Middels |
| BI programsider | Studieavgift per år, opptakskrav, kurseksempler | HTML | ØA: 86 800 kr/år heltid, 43 400 kr deltid **[V]** | Middels | Lav (manuelt, årlig) |
| Kristiania programsider | Pris per semester, opptakskrav | HTML | ØA/ØL 42 000 kr/sem.; master i innovasjonsledelse 58 900 kr/sem. **[V]** | Middels | Lav (manuelt) |
| Akkreditering/rangering | BI: EQUIS, AACSB, AMBA; FT topp 50 i Europa 2025. NMBU HH: AACSB | Nettside | **[V]** BI-siden; NMBU **[A]** fra søk | Lav–middels | Lav (statisk kort) |
| HK-dir Kandidatundersøkelsen | Arbeidsmarked for masterkandidater | PDF | BI deltar ikke; ingen tall per institusjon **[V]** | Lav | – |
| Econa lønnsstatistikk | Startlønn; i pressen oppgitt for NHH/BI | Medlemsundersøkelse, pressemelding | Ikke per lærested for NMBU **[A]** | Lav | Manuelt |
| NOKUT (tilsyn/akkreditering) | Kristiania: egne doktorgrader akkreditert | Nettside | **[A]** | Lav | – |
| Årsrapporter/styrepapirer | BI (stiftelse) og Kristiania: årsrapporter offentlige, styrepapirer ikke | PDF | **[A]** | Lav–middels (markedsstatus) | Middels |

**Juridisk og etisk:** DBH og Studiebarometeret er åpne, aggregerte og skjermede data som vi allerede bruker. `robots.txt`
tillater crawling hos både BI (unntatt `.pdf`) og Kristiania. For emnebeskrivelser lenker vi bare og kopierer ikke tekst, av
hensyn til opphavsretten. Mot Kristianias API skal vi være skånsomme: sidekartet er én fil og bør foretrekkes. Econa-tall er
medlemsdata og kan bare siteres med kilde. Ingen kilde inneholder personopplysninger.

## 3. Viktige fallgruver

- **BI DIPØAH/DIPØAH-D:** H er campusprogrammet (fire campuser pluss nett) og D er deltid på nett. 379 og 571 har ikke campus,
  så opptakstallene gjelder hele BI. Campusfordelingen kan vises fra 124: høsten 2025 Oslo 1 279, Bergen 1 222,
  Trondheim 823, Stavanger 258 og nett 396. Studiebarometeret er per campus (sbId-suffiks `-o/-b/-t/-s/-n`).
- **Skala i 571 for type L:** BI ser ut til å bruke karakterpoeng (×10). Kristiania ligger mellom 2 og 4, trolig karaktersnitt
  med nuller tatt med. Kristiania-poeng skal ikke vises. Engelskspråklige BI-program (BBA 16–21, MSc 18–31) blandes med
  internasjonale søkere som har null poeng; vis bare DIPØAH/SØ og merk tallene som «lokalt opptak, ikke Samordna».
- **Kristiania bytter navn:** `kristiania.no/studier/bachelor/okonomi-og-ledelse/` videresender nå til «Bachelor i økonomi og
  administrasjon – bli siviløkonom» (høst 2026). DBH-koden kan dermed bli ny fra 2026 (følg med i 347). BOA/NOA er
  nettbaserte regnskapsførerløp uten 379-tall.
- **BIs emnekoder:** når versjonssifferet fjernes, kan to DBH-emner dele courseNumber (GRA85062 og GRA85065 gir begge 8506).
  Lenken havner da på en beslektet side. MAN2913 ga 404 (utgått).
- BIs studiepoeng i 208 er ofte brøker (4,2; 2,4; 5,25) og bør ikke vises som emnets studiepoeng uten kontroll.

## 4. Prioritert handlingsplan

| # | Steg | Hvor i appen/kjeden | Anslag |
|---|---|---|---|
| 1 | **Emnelenker for BI og Kristiania.** BI: mønster i `emne-url-monstre.json` + `emneUrl.ts` (regex `^([A-ZÆØÅ]+)(\d{4})\d?$`). Kristiania: generer oppslagsfil fra sidekartet (prøve: `kristiania_emne_url_fra_sitemap.json`), f.eks. `kilde/public/emner/url-8253.json`, som `emneUrl.ts` slår opp i (lastes lat). Rett merknaden «uten lenke». | `emneUrl.ts`, Alle emner, Sammenlignbare emner, fakultetenes emnetabell | 2–3 t |
| 2 | **BI og Kristiania inn i HH-bachelorgruppene.** I `make-hh-programkart.py`: `oa` + BI DIPØAH (default true), BI SØ (økonomi og ledelse), Kristiania BOL; `olit` + BI DIPDBH/DIPBTH og Kristiania BOD/BIK/2110 (svakere, default false); `mei` + Kristiania MIN (MDI har for få); `mecon` + BI MSCMSAEH (lite, default false). Kjør `fill-local-admissions.py hh`, `build-completion.py hh`, `build-students.py hh`, `build-studiebarometer.py hh` (sett sbId manuelt, velg campus) og `build-revenue.py`. Kontroller at de generiske visningene tåler bachelorprogram med `localData` og uten SO-tall (grå ut poenggrense). NB: HH-opptaksvisningen er den urørte Figma-komponenten; der vises tallene bare hvis Mathias vil røre den. | `data/hh/*`, HH-lagene Gjennomføring, Studentene, Studiebarometer, Inntekt | 0,5–1 dag |
| 3 | **Nytt mål «tilbudsandel»**: tilbud / kvalifiserte (379 `Kvalifisert`) og tilbud / førstevalg, for lokale opptak. Gjør BIs nesten åpne opptak synlig mot NMBUs poenggrense. | `fill-local-admissions.py` (ny spørring på `Kvalifisert`), opptaksvisningen | 2–3 t |
| 4 | **571 type L for BI:** utvid `fetch-admission-points.py` med opptakstype L for institusjoner på en hviteliste (bare 8241, bare norskspråklige bachelorprogram) og vis målet med merknad. | `fetch-admission-points.py`, `build-landsam-data.py` | 2–3 t |
| 5 | **Kristiania inn i økonomi og fagmiljø**, og nye felt fra 902: eksamensavgift (skolepenger), egenkapital og salg/leie. Avledet mål: skolepengeinntekt per studentårsverk og statstilskudd per studentårsverk (privat mot statlig finansieringsmodell). | `build-economy.py`, `build-staff.py` (institusjonslister), `economyData.ts` | 2–4 t |
| 6 | **Pris for studenten**: håndført `data/hh/kilder/studieavgift.json` (program, pris per år, kilde-URL, hentedato): BI ØA 86 800 kr/år, Kristiania 84 000 kr/år (42 000 per semester), Kristiania master i innovasjonsledelse 117 800 kr/år, NMBU 0 kr (semesteravgift). Vis som linje i programkort/tabell. Oppdateres hver vår. | Ny liten modul eller kolonne i HH/fakultetstabeller | 2 t + årlig |
| 7 | **Campusfordeling BI** fra 124 som fotnote eller liten tabell på BI-oppføringene (hvor mange av BIs ØA-studenter som faktisk er i Oslo). | `build-students.py` (ny serie), programkort | 2 t |
| 8 | Studieplaner for BI og Kristiania: Kristiania har emnelister per kull som JSON i programsida (`subjectCombination`); BI-programsider har «kurseksempler» med kursbeskrivelseslenker. | `data/hh/studieplaner/`, `link-studyplan-codes.py` | 0,5 dag |
| 9 | Statisk kort for akkreditering og rangering (BI Triple Crown, FT; NMBU HH AACSB) med kildelenker. | Markedsstatus-laget | 1 t |
| 10 | Valgfritt: lange søknadsserier fra DBH 132/112 (BI fra 2001) og detaljer fra regnskapspakken 703. Ikke prioritert. | – | – |

Anbefalt rekkefølge: 1 → 2 → 3 → 5 → 4 → 6 → 7. Steg 1–3 gir mest synlig verdi for HH og kan gjøres på én dag.

## 5. Filer i `data/nmbu/kilder/bi-kristiania/`

- `dbh_tabellkatalog_001.csv`, `dbh_variabler_002.csv`: DBH-katalogen per 23.09.2026.
- `347_8241_2025.json`, `347_8253_2025.json`: alle studieprogram 2025.
- `379_8241_totaler.json`, `379_8253_totaler.json`: opptak 2021–25 for utvalgte økonomiprogram.
- `571_bi_k_utvalg.json`, `707_8241_utvalg.json`, `707_8253_utvalg.json`, `902_8253.json`, `902_8241_alle_felt.json`,
  `750_8253_2024.json`, `703_bi_k_2024.json`: prøveuttrekk.
- `studiebarometer_katalog_8241.json`, `studiebarometer_katalog_8253.json`, `studiebarometer_stikkprove.json`.
- `kristiania_emne_url_fra_sitemap.json` (6 650 koder → URL), `kristiania_api_test.txt`, `bi_kursbeskrivelse_test.txt`,
  `k_syllabus_bol.html`.
