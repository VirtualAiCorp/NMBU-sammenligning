# Felles nevner (faglige årsverk) på tvers av Norge, Sverige, Danmark og Finland

Utforsket 18.10.2026. Merking: **V** = sett selv (nettside, dokument), **T** = hentet via API eller fil og regnet selv,
**D** = bare omtalt i kilder/søk, ikke prøvd. Alle tall under er laget av data hentet i dag; rådata (CSV) ligger i
`data/rangering/norden/nevner/felles.csv`. Ingen personnavn i noen fil. OpenAlex-nøkkelen er ikke skrevet ut eller lagret.
Kreditter brukt hos OpenAlex: omtrent 150 av 10 000 (verk hentes 200 per kall à 1 kreditt, ingen søk).

## Sammendrag

**Hva som virker**

1. **ETER har et åpent API uten innlogging (T).** `POST https://eter-project.com/api/4.0/HEIs/query/flattened` med et
   JSON-filter gir 2011–2023 for alle institusjoner i Norge, Sverige, Danmark og Finland, med 808 variabler. Akademisk
   personale i årsverk (`PERS.ACAFTETOTAL`), i hodetall (`PERS.TOTACAHC`) og hodetall per ISCED-F-fagfelt
   (`PERS.ACAHCFOE00`–`10`, der FOE04 = næringsliv, administrasjon og jus). **Men ETER er et nasjonalt-statistikk-speil, ikke
   en uavhengig kilde.** For Norge er ETER 2020–2023 det samme som DBH UN1+UN2+UN3+UN4 (avvik 0–1 % for NHH, BI, UiS, Molde,
   Kristiania, 0–6 % over UN1+UN2). Dermed gir ETER ingen ny kontroll for Norge, men det er en felles *mal* som viser at
   nevnerne er samme type ting i alle fire land.
2. **ETER har bare årsverk for hele institusjonen.** Fagfelt finnes bare som hodetall (og for Danmark ikke i det hele tatt).
   Det passer derfor bare for de fem rene handelshøyskolene: **NHH, BI, SSE, CBS, Hanken**. For fakultetsenheter (LUSEM,
   Aarhus BSS, HH NMBU, JIBS) kan ETER ikke gi nevner.
3. **Vipunen (Finland) virker godt (T).** `https://api.vipunen.fi/api/resources/henkilosto/data` med
   `filter=tilastovuosi>=2016;kooditTieteenala=in=(511,512)` gir årsverk per universitet og karrieretrinn 2016–2025. Tallene
   stemmer med det den finske rapporten allerede hadde (Aalto 277, Hanken 159 i 2024). Hanken i ETER og Vipunen avviker med 8 %.
4. **OpenAlex «aktive forfattere» virker som grov kontroll, ikke som nevner.** Forholdet mellom forfattere med minst to
   artikler i treårsvinduet og faglige årsverk (med stipendiater) ligger på **0,44–0,74 for seks handelshøyskoler**
   (NHH 0,59, BI 0,44, Molde 0,49, SSE 0,50, CBS 0,74, Hanken 0,73). Det er stabilt over tid (±10 % mellom vinduene 2019–21,
   2021–23 og 2022–24), men spriket mellom skoler er en faktor 1,7, så det kan ikke brukes til å regne ut et årsverkstall.
   Det kan fange opp *grove* feil i en nasjonal nevner (feil på mer enn ca. 40 %).

**Hva som ikke virker**

- Wikidata, AACSB, EFMD, FT, QS/THE og Eurostat gir ikke akademisk personale per handelshøyskole (se spor 3).
- ETER gir **ingenting for Danmark under institusjonsnivå** (ingen hodetall, ingen fagfelt) og for Sverige bare hodetall
  per fagfelt (økonomi ligger i FOE03 sammen med statsvitenskap og sosiologi, og FOE04 inkluderer jus).
- ETER Norge før 2020 er en annen metode (forholdstall 0,70–0,86 mot DBH). Bruk ikke 2018–2019.
- Tilknytningstekst-avgrensning i OpenAlex for fakultetsenheter har lav og ukjent dekning (se spor 2).

**Anbefaling (kort)**

- **Primær nevner: nasjonale kilder per land** (DBH, UKÄ/enhetens egne tall, Danske Universiteters nøgletal/Pure,
  Vipunen), som i dag. Ingen felles kilde slår dem på fakultetsnivå.
- **Felles kontroll: ETER-årsverk for de fem rene handelshøyskolene**, vist ved siden av nasjonal nevner (CBS 700 mot 660
  VIP-årsverk; SSE 122 mot 137 uten og 258 med doktorander; Hanken 161 mot 149). Det avslører definisjonsforskjeller, for
  eksempel at ETERs svenske tall for SSE tilsynelatende ikke teller doktorander.
- **OpenAlex-forholdet (n≥2 / årsverk) som varsellampe**: utenfor 0,3–1,0 bør nevneren sjekkes.

---

## Spor 1: ETER

**Hva er det?** European Tertiary Education Register. Nettstedet `eter-project.com` omdirigerer i dag (18.10.2026) til
EHESO (European Higher Education Sector Observatory, EACEA/Kommisjonen), som har overtatt prosjektet (V).
EHESO-microdata «spenner fra 2011 til 2023/2024», men API-et jeg hentet fra har siste referanseår **2023**.
Gamle ETER-sider med data-API-et fungerer fortsatt.

**URL-er og parametere som virker (T)**

- Dokumentasjon: `https://eter-project.com/data/technical-documentation/` (og
  `…/api-request-using-r/`), Swagger på `https://eter-project.com/api/4.0`.
- Henting uten innlogging, filtrert på land:
  ```
  POST https://eter-project.com/api/4.0/HEIs/query/flattened
  Content-Type: application/json
  {"filter":{"BAS.COUNTRY.v":{"$in":["NO","SE","DK","FI"]}},"fieldIds":[],"searchTerms":[]}
  ```
  Svaret har status 201 og er 43,5 MB JSON med 2 019 rader (institusjon × år, 2011–2023).
- `GET …/HEIs/full/flattened` (alle land) ga et avkortet svar på 79 MB (ugyldig JSON). Bruk filtrerte spørringer.
- Håndboken «ETER Handbook» (`https://eter-project.com/assets/pdf/ETER_Handbook_running.pdf`) definerer akademisk
  personale (V, kap. 5.8.1): ansatte hvis hovedoppgave er undervisning, forskning eller formidling, med akademisk rang,
  *pluss doktorander ansatt til undervisning eller forskning*. Fagfelt bare i hodetall (kap. 5.8.4.4, ISCED-F 2013);
  årsverk bare totalt (5.8.4.1). Variabelen «PhD-studenter inkludert» (5.8.4.10) finnes i håndboken, men ikke i
  utdraget jeg fikk, så jeg kan ikke se per institusjon om doktorander er med.
- Variabler jeg brukte: `PERS.ACAFTETOTAL` (årsverk), `PERS.TOTACAHC` (hodetall), `PERS.ACAHCFOE03/04`,
  `PERS.FLAGACAFTETOTAL` (kvalitetsflagg), `PERS.NOTESACA` (merknader).

**Testresultat 1: ETER mot DBH for norske enheter (T).** Faglige årsverk fra DBH tabell 225 × 220 (lokale filer i
`data/rangering/dbh/`), summert per stillingskategori:

| Enhet | År | ETER FTE | DBH UN1+UN2 | DBH UN1–UN4 | ETER / UN1–UN4 |
|---|---|---|---|---|---|
| NHH | 2019 | 176,7 | 253,7 | 261,2 | 0,68 |
| NHH | 2020 | 283,9 | 276,4 | 283,9 | 1,00 |
| NHH | 2021 | 296,0 | 285,0 | 296,0 | 1,00 |
| NHH | 2022 | 287,8 | 279,8 | 290,8 | 0,99 |
| NHH | 2023 | 296,3 | 288,3 | 299,3 | 0,99 |
| BI | 2019 | 300,6 | 365,3 | 366,3 | 0,82 |
| BI | 2020 | 362,3 | 366,1 | 366,1 | 0,99 |
| BI | 2021 | 398,1 | 399,9 | 399,9 | 1,00 |
| BI | 2022 | 415,1 | 415,1 | 415,1 | 1,00 |
| BI | 2023 | 423,6 | 423,6 | 423,6 | 1,00 |

Samme mønster for UiS (0,99–1,00), UiA, Nord, Molde, Kristiania og NMBU (0,98–1,00 mot UN1–UN4) i 2020–2023. Konklusjon: ETER Norge
2020– er DBH-årsverk for UN1–UN4 (inkludert stipendiater, postdoktorer og undervisningsstillinger). 2018–2019 er
en annen avgrensning og skal ikke brukes. Merk at det norske nevnertallet i prosjektet (UN1+UN2) er 0–6 % lavere enn ETER.

**Testresultat 2: ETER for de andre landene mot nasjonale nevnere (T, 2021–2023 snitt)**

| Enhet | ETER FTE | Nasjonal nevner (som i `norden/*.json`) | Merknad |
|---|---|---|---|
| CBS (DK) | 700 | 660 VIP-årsverk 2024; 676 snitt 2023–25 (årsrapport) | +4 til +6 %; ETER trolig inkl. doktorander. God samsvar |
| SSE (SE) | 122 (2021 121, 2022 115, 2023 130) | UKÄ 258 med doktorander, 137 uten (snitt 2023–25) | ETER ligger nær «uten doktorander» (−11 %). ETER-hodetall 165–170 |
| Hanken (FI) | 161 | Vipunen 149 (511+512, trinn I–IV 2021–23); 161 snitt 2023–25 | +8 %; ETER FOE04-hodetall 147 stemmer med Vipunen 154,6 (2023) |
| NHH, BI (NO) | 293 / 412 | DBH UN1+UN2 284 / 413 | se over |

Andre funn:
- **Danmark**: ETER har bare totalt FTE (`m` = mangler for hodetall og alle fagfelt). Aarhus Univ. 4 562, SDU 2 097,
  AAU 1 913, RUC 493, KU 5 541 (2023). Ingen vei til Aarhus BSS eller SDU Business School.
- **Sverige** (hodetall per fagfelt, avrundet til nærmeste 5): Jönköping University **FOE04 = 105** (2023), hele
  universitetet 595 hodetall. Det er under halvparten av 228,3 årsverk som ligger i `sverige.json` for JIBS («UKÄ-faggruppe»).
  Verdt å sjekke JIBS' egne tall, men FOE04 inkluderer også jus, så 105 er ikke noen fasit. Lund FOE04 395 + FOE03 545;
  tallene lar seg ikke bruke til å isolere LUSEM.
- **Finland**: ETER bruker Vipunen/Statistikcentralens FTE og bruker det som både FTE og hodetall (merknad i data).
  Aalto FOE04 187 (2023) ≈ Vipunen trinn II–IV (183), ikke trinn I–IV (280).
- Hele-institusjonstall for andre svenske, danske og finske universiteter er lagt i CSV-en (merket «svak»), bare som
  referanse for størrelsesorden.

**Dekning**: 2011–2023, hodetall per fagfelt for NO fra 2023 (2018–2022 mangler/er 0 for FOE04), FI fra 2017, SE fra 2016.
Siste år 2023 betyr at ETER ikke dekker 2024–2025, som de andre kildene i prosjektet bruker.

## Spor 2: OpenAlex «aktive forfattere»

**Metode (T).** For enhet *E* og vindu *Y1–Y2*: hent verk med
`filter=authorships.institutions.lineage:<OpenAlex-id>,publication_year:Y1-Y2,type:article`, `select=id,publication_year,type,authorships`,
`per_page=200`, `page=1,2,…` (1 kreditt per kall; NHH 606 verk = 4 kall; CBS 2 204 verk = 12 kall). Lokalt telles distinkte
`author.id` blant forfattere der institusjonen står i tilknytningen, og hvor mange verk hver forfatter har i vinduet.
Terskler: n≥1, 2, 3, 5 artikler. Skript: `scripts/rangering/openalex_aktive_forfattere.py` (forfatter-id-er holdes bare i
minnet).

**Fakultetsenheter**: hent verk for foreldreinstitusjonen (lineage), begrens til fagfeltene 14/18/20/33
(`primary_topic.field.id:14|18|20|33`), og behold bare forfattere hvis *rå tilknytningstekst*
(`authorships[].raw_affiliation_strings`) matcher et regulært uttrykk for enheten, for eksempel
`School of Economics and Business|Handelshøyskolen|…` for HH NMBU. Samme mønster som `data/rangering/openalex/enheter-norden.json`.
Test på HH NMBU: strengen «School of Economics and Business, Norwegian University of Life Sciences …» treffer ryddig i ca. 70
av 273 verk i feltene 14/18/20/33. Mange HH-forfattere står bare med «Norwegian University of Life Sciences» eller «NMBU»
(rundt 50 slike strenger i vinduet) og blir ikke funnet. Resultatet er en **nedre grense med ukjent dekning**.

**Resultater, treårsvindu 2021–2023 (T)**

| Enhet | Artikler | n≥1 | n≥2 | n≥3 | n≥5 | Nevner (snitt 2021–23) | n≥2 / nevner | n≥3 / nevner |
|---|---|---|---|---|---|---|---|---|
| NHH | 606 | 350 | 169 | 110 | 54 | 284 DBH UN1+UN2 | 0,59 | 0,39 |
| BI | 886 | 337 | 180 | 117 | 55 | 413 DBH UN1+UN2 | 0,44 | 0,28 |
| Molde | 368 | 168 | 84 | 56 | 31 | 172 DBH UN1+UN2 | 0,49 | 0,33 |
| UiS (hele) | 3 309 | 1 526 | 794 | 537 | 325 | 1 164 DBH UN1+UN2 | 0,68 | 0,46 |
| NMBU (hele) | 3 017 | 1 664 | 927 | 664 | 378 | 930 DBH UN1+UN2 | 1,00 | 0,71 |
| CBS | 2 204 | 936 | 520 | 354 | 176 | 700 ETER (660 VIP 2024) | 0,74 | 0,51 |
| SSE | 500 | 296 | 128 | 71 | 28 | 258 UKÄ med dokt. (122 ETER) | 0,50 (1,05) | 0,28 (0,58) |
| Hanken | 504 | 214 | 108 | 68 | 32 | 149 Vipunen I–IV | 0,73 | 0,46 |
| HH NMBU (tekst) | 273 | 48 | 15 | 13 | 5 | 60 DBH, avd.koder | 0,25 | 0,22 |
| HH UiS (tekst) | 975 | 79 | 35 | 20 | 14 | 85 DBH, avd.koder | 0,41 | 0,24 |
| LUSEM (tekst) | 2 471 | 218 | 89 | 57 | 22 | 230 med dokt. (172 uten) | 0,39 (0,52) | 0,25 |
| Aarhus BSS (tekst) | 4 265 | 913 | 423 | 266 | 115 | 778 VIP 2024 | 0,54 | 0,34 |

Stabilitet over tid (n≥2): NHH 155 / 169 / 177 (2019–21 / 2021–23 / 2022–24), BI 150 / 180 / 192, CBS 538 / 520 / 481,
SSE 128 / 128 / 125, Hanken 104 / 108 / 111, Molde 84 / 84 (2021–23, 2022–24). Tellingen er stabil innen ±15 %, med
unntak av BI (+28 % fra 2019–21 til 2022–24, som følger BIs vekst i faglige årsverk).

**Vurdering.**
- For ren handelshøyskole med nevner *med doktorander* ligger n≥2 / årsverk på **0,44–0,74** (snitt rundt 0,58). Med SSEs
  ETER-tall *uten* doktorander blir forholdet 1,05, altså utenfor intervallet. Det viser at nevnerne ikke er likt avgrenset,
  og at metoden fanger det.
- Forskjeller i skolenes struktur (BI har mange undervisningsstillinger uten forskning, NMBU har naturvitenskapelig
  publiseringskultur med mange medforfattere) gir et spenn på en faktor 1,7 mellom ellers like skoler. Det rekker ikke til å bruke
  forfattertellingen som felles nevner.
- Forfatter-id-er i OpenAlex er ufullkomne (splittede og sammenslåtte profiler), n≥1 får mange gjester og
  medforfattere (SSE 296 mot 122 årsverk); bruk n≥2 eller n≥3.
- Fakultetsavgrensning på rå tilknytningstekst gir lav dekning (HH NMBU 0,25). Metoden gir bare nedre grense, og kan ikke
  brukes som kontroll uten en kalibrering per enhet.

## Spor 3: Andre felles kilder (kort)

| Kilde | Vurdering | Merking |
|---|---|---|
| **Wikidata** (`P1128` ansatte, SPARQL) | Prøvd: NHH 399 (2019), BI 1 674 (2026), CBS 2 207, SSE 300, NMBU 2 367. Totalt antall ansatte, avrundet, uten årstall og ikke faglige. Ubrukelig som nevner. | T |
| **AACSB** (DataDirect, Analytics Hub) | Faglig-stab-tall (heltid/deltid, deltakende/støttende) finnes for medlemsskoler, men bak innlogging og bare aggregert til jevnbyrdige grupper; ikke offentlige per skole. | D |
| **EFMD/EQUIS** | Offentlige profiler lister akkreditering, ikke personale. | D |
| **FT-rangeringene** | Skolene leverer selv faglig stab, men bare andeler publiseres (kvinner, internasjonale, med doktorgrad), ikke antall. | D |
| **QS/THE** | Oppgir studenter per ansatt og antall ansatte for noen institusjoner, selvrapportert og hele institusjonen. Ikke prøvd. | D |
| **Eurostat** `rd_p_perssci` (FoU-personale i universitetssektoren per fagfelt) | Prøvd (T): API virker (`…/data/rd_p_perssci?sectperf=HES&prof_pos=RSE&unit=FTE&ford=TOTAL&ford=FORD5`). Bare nasjonalt, bare forskere (ikke all undervisningsstab), samfunnsvitenskap (FORD5, ikke økonomi/BI alene) finnes kun noen år (NO 2019, 2021, 2023, 2024: 4 078–4 572). Kan bare brukes som makrokontroll. | T |
| **OECD/UOE** | Utdanningspersonale nasjonalt per utdanningsnivå, ikke per fagfelt eller skole. | D |
| **ORCID/RISIS** | Tilknytninger er selvregistrerte og ufullstendige. Ikke prøvd, trolig dårligere enn OpenAlex. | D |

## Spor 4: Finland (Vipunen)

**Bekreftet (T).** API-et `https://api.vipunen.fi/api/resources/henkilosto/data` er åpent uten nøkkel. Felt: `tilastovuosi`,
`yliopisto`, `kooditTieteenala`, `tehtäväjaottelu`, `tutkijanuravaiheTaiTuntiopettajuus` (trinn I–IV, timelærer) og
`henkilotyovuosi` (årsverk). Filter: `tilastovuosi>=2016;kooditTieteenala=in=(511,512)`, `limit=5000&offset=…`
(114 667 rader, 3 sider à 5 000 gikk fint). «Opetus- ja tutkimushenkilökunta» trinn I–IV tilsvarer UN1+UN2;
trinn II–IV er uten doktorander.

Årsverk 511+512, trinn I–IV (II–IV i parentes):

| Universitet | 2019 | 2021 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| Aalto | 300,0 (200,5) | 300,2 (204,1) | 279,9 (183,3) | 277,1 (190,7) | 313,8 (213,7) |
| Hanken (Svenska handelshögskolan) | 143,7 (108,4) | 143,6 (117,4) | 154,6 (124,2) | 158,5 (118,9) | 169,3 (121,8) |
| Vaasa | 121,7 (83,9) | 143,4 (103,9) | 158,4 (109,2) | 172,1 (113,4) | 169,1 (108,2) |
| Turku | 130,1 (92,7) | 128,7 (96,0) | 142,8 (109,0) | 147,6 (112,2) | 143,5 (105,8) |
| LUT | 86,2 (64,4) | 96,3 (68,5) | 113,1 (73,3) | 123,7 (80,5) | 134,9 (87,1) |

Alle tolv universiteter 2019–2025 ligger i CSV-en. **Vaasa 2022 = 76,6** (mot 143,4 i 2021 og 158,4 i 2023) er et
rapporteringsbrudd (samme som i `norden-finland.md`); merket «svak» i CSV. Vipunen har ingen enhets- eller fakultetskode for
personale, så avgrensningen er fagfelt (per ansatt), ikke organisasjonsenhet. ETER Finland bygger trolig på samme kilde (ETER-merknad: «FTE data used as both FTE and HC»).

## Anbefaling: felles nevner, nasjonale nevnere og OpenAlex-kontroll

1. **Behold nasjonale nevnere som primærtall** (DBH, UKÄ + enhetens egne, Pure/nøgletal, Vipunen). Ingen felles kilde har
   fakultetsnivå for alle land, og ETER Norge er DBH.
2. **Ta inn ETER-årsverk som «felles kontrollkolonne» for NHH, BI, SSE, CBS og Hanken** (2020–2023, det siste året ETER
   dekker). Forskjell mot nasjonal nevner på mer enn ca. 10 % skal forklares i forbeholdene (SSE: doktorander; Hanken: andre
   fagfelt). Ikke bruk ETER for fakultetsenheter og ikke før 2020 for Norge.
3. **Bruk OpenAlex-forholdet (artikler ≥2 i treårsvindu / årsverk) som varsellampe**, ikke som nevner. Forventet 0,4–0,75
   for ren handelshøyskole med nevner *med* stipendiater. For fakultetsenheter på tilknytningstekst blir forholdet lavere
   (0,25–0,55) fordi dekningen er ufullstendig, så tolk det som nedre grense. Skriptet er billig (under 20 kreditter per
   enhet og vindu).
4. **Det som ville gitt en ekte felles nevner** er en kilde som teller personer og ikke bare artikler, og som gjelder
   fakultetsnivå: egne årsrapporter/HR-tall fra skolene (LUSEM, Aarhus BSS, JIBS, SDU); noen av dem er allerede brukt i
   `norden/*.json`. ETER FOE04-hodetall kan brukes til å sjekke JIBS (105 mot 228, se over).
5. Sjekk for nasjonal forskjell i hvem som teller som «faglig»: stipendiater/doktorander er med i norsk UN2 og dansk VIP,
   men er ofte ikke ansatt i Finland og Sverige (SSE).

## Åpne spørsmål

- Er de 808 variablene i det åpne ETER-API-et det samme som «hele» datasettet med innlogging (R-guiden sier «all data, not
  the public dataset»)? Jeg har ikke prøvd innlogging.
- Hva gjør EHESO med ETER-API-et etter 2023-utgaven? `eter-project.com` peker nå til EHESO, og EHESO har et eget «API access»
  som er «upcoming» (V, side 1.5 i Methodology). Kan forsvinne.
- JIBS: 105 (ETER FOE04) mot 228 (UKÄ-faggruppe i `sverige.json`).

## Filer

- `data/rangering/norden/nevner/felles.csv` (semikolon, UTF-8, 965 rader; `maal` = `eter_acad_fte`, `eter_acad_hc`,
  `eter_acad_hc_foe04`, `eter_acad_hc_foe03`, `dbh_un1un2_arsverk`, `dbh_un1_4_arsverk`, `vipunen_opetus_tutkimus`,
  `vipunen_opetus_tutkimus_II_IV`, `openalex_aktive_forf` (n≥2), `openalex_aktive_forf_n1/n3/n5`,
  `openalex_artikler_vindu`, `eurostat_rd_hes_forskere_fte_*`, `wikidata_employees`).
- `scripts/rangering/openalex_aktive_forfattere.py` (ny, ikke committet).
