# Finland i rangeringen: enheter, datakilder og et første publiseringsbilde

Utforsket 7. oktober 2026 (én agent, ingen kodeendringer). Spørsmålet var hvordan «Norwegian Business School Ranking» kan
utvides til finske handelshøyskoler og økonomimiljøer, og hvordan de plasserer seg på publisering. Utdanning er holdt utenfor.

Merker: **V** = lest i primærkilden 7.10.2026, **D** = delvis (sekundærkilde eller ufullstendig), **A** = vårt anslag.
Alle tall i avsnitt 4 er **foreløpige anslag**. AJG-tallene er aggregater koblet lokalt mot `tidsskrift/ajg2024.csv`;
ingen AJG-nivåer per tidsskrift står i dette notatet.

## Kortversjon

- **Ti enheter er relevante.** Ni har AACSB: Aalto BIZ, Hanken, Turku TSE, Jyväskylä JSBE, Oulu OBS, LUT Business School,
  Vaasa, UEF Business School og Åbo Akademi Handelshögskolan. I tillegg kommer Tampere (fakultetet for ledelse og økonomi)
  uten akkreditering, og Helsingfors universitet (samfunnsøkonomi) som referanse, slik UiB og UiO er hos oss.
- **Beste kilder:**
  - **Vipunen-API-et** (åpent, uten nøkkel) gir publikasjoner per universitet og fagfelt med JUFO-nivå og JUFO-ID.
    Det gir også **årsverk (henkilötyövuodet) per universitet og fagfelt** med karrieretrinn I–IV. Det er det nærmeste
    vi kommer DBH 225 og 373.
  - **Research.fi** (VIRTA) gir artikler med ISSN, JUFO-nivå og **organisasjonsenhet** (institutt eller fakultet) per
    forfatter.
  - **JUFO-API-et** gir ISSN per JUFO-ID, og i tillegg norsk og dansk nivå.
- **Finland har ingen åpen nevner på enhetsnivå.** Årsverk finnes bare per universitet og fagfelt (511 samfunnsøkonomi og
  512 bedriftsøkonomi). Den rene løsningen er derfor å avgrense **både teller og nevner på fagfelt**. Det er en annen
  avgrensning enn vår norske enhetsavgrensning.
- **Foreløpig plassering:** AJG 4/4* per 100 årsverk og år, 2023–2025, fagfeltavgrenset (A):
  1. Aalto 16,7
  2. Hanken 11,4
  3. Vaasa 8,4
  4. UEF 8,3
  5. Helsingfors (samfunnsøkonomi) 7,6

  Deretter følger LUT og Turku med 6,5 hver og Oulu med 6,1. Til sammenligning har BI 16,1, NHH 15,5 og UiS 12,0, regnet
  på samme måte fra våre NVA-filer. Aalto ligger altså på nivå med BI og NHH, og Hanken mellom NHH og UiS.

## 1. Enhetene

| Enhet | Universitet (VIRTA-kode) | Avgrensning i Research.fi (OrgUnitId) | AACSB | EQUIS | AMBA |
|---|---|---|---|---|---|
| Aalto University School of Business (BIZ) | Aalto (10076) | `E7…` (seks institutter + E790/E700/E710/E720) | ja | ja (siden 1998) | ja (trippelkrone 2007) |
| Hanken School of Economics | Hanken (01910), egen høyskole | hele universitetet | ja | ja (fornyet til 2027) | ja |
| Turku School of Economics (TSE) | Turku (10089) | `2608…` (med Pori-enheten og Tulevaisuuden tutkimuskeskus) | ja (2019) | nei | ikke funnet |
| Jyväskylä School of Business and Economics (JSBE) | Jyväskylä (01906) | `216…` | ja | ikke funnet | ikke funnet |
| Oulu Business School (OBS) | Oulu (01904) | `2404…` (med Martti Ahtisaari-instituttet) | ja | ikke funnet | ikke funnet |
| LUT Business School (LBS) | LUT (01914) | `23E1…` (uten IEM i ingeniørskolen, `23B3…`) | ja | ikke funnet | ikke funnet |
| Vaasa, handelsfagene | Vaasa (01913) | `2701…`, `2702…`, `2703…` (ledelse, markedsføring og kommunikasjon, regnskap og finans; uten teknologi `2704…`) | ja | ja (fra mai 2026, tre år) | nei |
| UEF Business School | Itä-Suomen yliopisto (10088) | `295020` / `502010` (Kauppatieteiden laitos, koden byttet) | ja | ikke funnet | ikke funnet |
| Åbo Akademi Handelshögskolan | Åbo Akademi (01903) | `2803100–2803112` til 2022, `2803210/2803220` fra 2023 | ja | ikke funnet | ikke funnet |
| Tampere, Johtamisen ja talouden tiedekunta | Tampere (10122) | `1020` (hele fakultetet, også forvaltningsvitenskap) | **nei** | nei | ikke funnet |
| *Referanse:* Helsingfors universitet, samfunnsøkonomi (Helsinki GSE) | Helsinki (01901) | ikke mulig, ligger i Valtiotieteellinen tiedekunta (H70) | – | – | – |

Kilder:
- AACSB, landssøk Finland, lest 7.10.2026 (V): https://www.aacsb.edu/accredited?countries=finland. Søket gir ni skoler.
- Aalto BIZ, dekanpresentasjon 24.8.2026, s. 5, 7 og 8 (V): https://www.aalto.fi/sites/default/files/2026-08/Dean-Timo-Korkeamaki-24-Aug-2026.pdf
- Hanken, fornyet EQUIS (D): https://www.hanken.fi/en/news/hanken-school-economics-renews-equis-accreditation
- Vaasa, EQUIS mai 2026, AACSB, ikke AMBA (V): https://www.uwasa.fi/en/newshub/news/university-vaasa-granted-prestigious-equis-accreditation
- TSE, AACSB 2019 (V): https://utu.fi/en/university/turku-school-of-economics/about-the-school/accreditations-and-quality
- EQUIS og AMBA for de øvrige er ikke sjekket i EFMDs og AMBAs egne lister (U).

**Sammenlignbarhet med Norge:**
- Hanken er en egen høyskole, som NHH.
- De andre er fakulteter eller skoler i breddeuniversiteter, som UiA, UiS og Nord.
- **Aalto og LUT** har et ingeniørmiljø i industriell økonomi (Aalto IEM `T307`, LUT IEM `23B3…`) utenfor handelshøyskolen.
  Det er samme spørsmål som NTNU og IØT. Vi har holdt dem utenfor i enhetsavgrensningen.
- **Tampere** tar med forvaltningsvitenskap, som INN før vi avgrenset.
- **Vaasa** er i praksis et handelsuniversitet med et teknologimiljø ved siden av.
- Helsinki GSE er et konsortium. Forskerne er ansatt ved Aalto, Hanken og Helsingfors universitet, så samfunnsøkonomien deres
  telles hos alle tre.

## 2. Datakilder for publisering

| Kilde | Hva den gir | Enhetsnivå | ISSN | Tilgang | Prøvd 7.10.2026 |
|---|---|---|---|---|---|
| **Vipunen-API** `https://api.vipunen.fi/api/resources/julkaisut/data?filter=…&limit=5000&offset=…` | Én rad per publikasjon × universitet × fagfelt: type (A1–G), JUFO-nivå i publiseringsåret, `jufotunnus`, internasjonal sampublisering, fagfeltandel (`lukumaara`) | universitet + fagfelt (tieteenala 511/512) | nei, men via JUFO-ID | åpent, uten nøkkel; RSQL-filter (`tilastovuosi>=2016;kooditTieteenala=in=(511,512);kooditSektori==1`) | **V**, 40 507 rader 2016–2025 for universitetene |
| **Research.fi** (VIRTA), `https://researchfi-api-production.2.rahtiapp.fi/portalapi/publication/_search` (Elasticsearch, `author.organization` er nested) | Én post per publikasjon (sammenslått på tvers av institusjoner): ISSN, `jufoCode`, `jufoClassCode`, DOI, type, fagfelt, **institusjon og organisasjonsenhet** per forfattergruppe | institutt eller fakultet (nær 100 % av A1/A2 har enhet, unntatt Åbo Akademi 2017–2019 og eldre Tampere/Vaasa-koder) | ja | åpent uten nøkkel. CSC sier at REST-laget skal brukes til gjenbruk og ber om kontakt (tiedejatutkimus@csc.fi). Robots.txt sperrer bare nettsidens resultatsider. | **V** |
| **JUFO-API** `https://jufo-rest.csc.fi/v1.1/kanava/<id>` og `etsi.php?issn=` | Nivå 0–3 med historikk (`Jufo_history`), ISSN1/ISSN2/ISSNL, `Norway_Level`, `Denmark_Level` | – | ja | åpent, CC BY 4.0 (allerede brukt i `hent_tidsskriftmaal.py`) | **V**, 276 av 280 manglende JUFO-ID slått opp |
| VIRTA JTP REST (`virta-jtp.csc.fi`) | Rå VIRTA-poster | – | ja | **vertsnavnet svarte ikke** (DNS-feil 7.10.2026); trolig erstattet av Research.fi | prøvd, feilet |
| OpenAlex | Verk per institusjon (ROR) og sitering | i praksis bare universitet; finske fakulteter mangler stort sett egne ID-er | ja | API-nøkkel og bruksbasert pris fra 2026 (se `publiseringslandskapet.md`) | ikke prøvd |
| Scopus / WoS | Affiliasjons-ID-er, noen på skolenivå | delvis | ja | lisens | ikke brukt |

**Konkrete oppslag** (Research.fi, A1 + A2, minst én forfatter i enheten, unike poster, 7.10.2026):

| Enhet | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| Aalto BIZ | 165 | 166 | 136 | 153 | 191 |
| Hanken (hele) | 174 | 171 | 162 | 140 | 137 |
| Turku TSE | 165 | 175 | 196 | 145 | 177 |
| Jyväskylä JSBE | 102 | 104 | 110 | 117 | 106 |
| Oulu OBS | 93 | 96 | 102 | 100 | 102 |
| LUT LBS | 116 | 92 | 130 | 98 | 118 |
| Vaasa (2701–2703) | 209 | 186 | 225 | 199 | 272 |
| Tampere (fak. 1020) | 208 | 224 | 199 | 223 | 211 |
| UEF Business School | 51 | 66 | 71 | 70 | 74 |
| Åbo Akademi Handelshögskolan | 63 | 52 | 44 | 34 | 31 |

Merknader:
- Enhetskodene skifter over tid. Tampere har bare `1020` fra fusjonen i 2019. Vaasa (2016–2017) og LUT (før 2019) har andre
  koder. Åbo Akademi mangler enhet i 2017–2019, og der kom samhällsvetenskaper `28031[2]…` med ved et feilsøk; det er
  rettet i tabellen.
- Bruk derfor **2021–2025** til vi har kartlagt de eldre kodene.
- Alle 2 323 JUFO-ID-ene i Vipunen-utvalget (A1/A2) unntatt 4 fikk ISSN, gjennom Research.fi-postene, `anslag/maal.json`
  og JUFO-API-et.

## 3. Nevner: årsverk

- **Vipunen `henkilosto`** (V) har feltet `henkilotyovuosi` (årsverk) per universitet × fagfelt (`tieteenala`) ×
  oppgavegruppe × karrieretrinn, 2019–2025 (oppdatert 4.10.2026). Fagfeltet er satt per ansatt. Det finnes **ingen
  fakultets- eller instituttkode** (`alayksikkokoodisto` gjelder studiesteder, ikke personale).
- **Nevner som ligner HK-dirs UN1 + UN2:** «Opetus- ja tutkimushenkilökunta», karrieretrinn I–IV (I = doktorander og
  yngre forskere, II = postdoktorer og tenure track, III = lektorer og seniorforskere, IV = professorer), uten
  timelærere. Nevneren som ligner NHHs (uten stipendiater) er trinn II–IV.
- **Fagfelt 511 + 512, trinn I–IV, 2024:**
  - Aalto 277
  - Vaasa 172
  - Hanken 159
  - Turku 148
  - LUT 124
  - Tampere 123
  - Jyväskylä 95
  - Oulu 87
  - UEF 81
  - Helsingfors 77
  - Åbo Akademi 39
- **Kontroll mot Aalto BIZ:** Skolen oppgir 216 akademisk ansatte i 2024 og 233 i desember 2025, i tillegg til
  134 ansatte doktorander (hoder, ikke årsverk; presentasjonen over, s. 5). Vipunen gir 277 årsverk i 511 + 512. Det er
  rimelig samsvar (D).
- **Kjent feil:** Vaasa 2022 har bare 77 årsverk (mot 143 i 2021 og 158 i 2023). Det er trolig et rapporteringsbrudd, så
  bruk ikke 2022 for Vaasa.
- **Ulik praksis:** Finske doktorander er ofte stipendfinansiert og ikke ansatt, så trinn I er trolig mindre dekket enn
  norske stipendiater i UN2. Det gjør finske tall per årsverk noe høyere.
- **Enhetsnivå:** Skolene oppgir hoder, ikke årsverk, i årsrapporter og presentasjoner. Det fungerer som kontroll, men
  ikke som tidsserie.

## 4. Foreløpig publiseringsbilde (A)

**Metode:**
- **Fagfeltavgrensning:** Telleren er A1 + A2 (fagfellevurderte tidsskriftartikler og oversiktsartikler) som universitetet
  selv har klassifisert i 511 eller 512 (Vipunen). Telleren er hel telling per universitet. Nevneren er årsverk i
  511 + 512, trinn I–IV.
- **Lister:** Koblet på ISSN (via JUFO-ID) mot ABDC 2025, FT50 (2026), UTD24 og AJG 2024 (lokal fil).
- **JUFO:** nivå i publiseringsåret.
- **Norge:** regnet på samme måte fra `data/rangering/nva/<skole>/<år>.json`, med NVI-rapporterte artikler, hel telling
  og UN1 + UN2. Her bruker vi dagens JUFO-nivå fra `anslag/maal.json`.
- **Periode:** 2023–2025. «Per 100 ÅV» = sum artikler / sum årsverk × 100.

| Enhet | Artikler | Årsverk (3 år) | Artikler/100 ÅV | JUFO 2–3 /100 | ABDC A*/A /100 | FT50∪UTD24 /100 | AJG 3+ /100 | **AJG 4/4\* /100** | AJG 4/4* /100 (uten trinn I / uten stip.) | AJG-dekning |
|---|---|---|---|---|---|---|---|---|---|---|
| Aalto (511+512) | 547 | 871 | 62,8 | 37,2 | 36,6 | 8,04 | 31,8 | **16,6** | 24,7 | 73 % |
| Hanken (511+512) | 365 | 482 | 75,7 | 43,7 | 52,9 | 4,98 | 44,4 | **11,4** | 15,1 | 87 % |
| Vaasa (511+512) | 526 | 500 | 105,3 | 49,2 | 61,0 | 2,60 | 51,8 | **8,4** | 12,7 | 81 % |
| UEF (511+512) | 179 | 241 | 74,3 | 29,1 | 32,4 | 2,49 | 22,8 | **8,3** | 11,4 | 65 % |
| Helsingfors (511+512, ref.) | 261 | 236 | 110,7 | 50,1 | 43,3 | 1,70 | 31,4 | **7,6** | 11,2 | 60 % |
| LUT (511+512) | 446 | 372 | 120,0 | 51,7 | 44,1 | 2,96 | 35,2 | **6,5** | 10,0 | 68 % |
| Turku (511+512) | 330 | 434 | 76,0 | 29,7 | 34,1 | 1,61 | 24,0 | **6,5** | 8,6 | 74 % |
| Oulu (511+512) | 255 | 263 | 97,1 | 29,3 | 43,0 | 2,67 | 28,2 | **6,1** | 8,7 | 80 % |
| Jyväskylä (511+512) | 232 | 300 | 77,4 | 30,7 | 36,7 | 1,00 | 22,0 | **5,0** | 6,3 | 74 % |
| Tampere (511+512) | 280 | 378 | 74,1 | 36,5 | 28,6 | 0,26 | 18,5 | **3,7** | 5,9 | 75 % |
| Åbo Akademi (511+512) | 98 | 108 | 90,6 | 32,4 | 35,1 | 0,92 | 21,3 | **1,9** | 2,2 | 76 % |
| *Norge, samme beregning:* | | | | | | | | | | |
| BI | 938 | 1 245 | 75,3 | 39,4 | 37,8 | 6,18 | 31,5 | **16,1** | 18,9 | – |
| NHH | 598 | 859 | 69,6 | 38,6 | 39,9 | 6,52 | 35,0 | **15,5** | 21,7 | – |
| UiS | 255 | 242 | 105,5 | 50,1 | 42,6 | 3,31 | 38,1 | **12,0** | 16,4 | – |
| UiA | 367 | 250 | 146,9 | 56,8 | 72,9 | 1,20 | 51,2 | **8,0** | 9,7 | – |
| NTNU (HH + samf.øk. + IØT per 07.10) | 674 | 681 | 99,0 | 36,6 | 39,2 | 1,03 | 29,8 | **5,1** | 7,0 | – |
| HH NMBU | 191 | 191 | 100,1 | 30,9 | 35,6 | 0,00 | 23,0 | **3,1** | 4,1 | – |

Merknader til tabellen:
- **NTNU** har her 5,1 mot 8,1 i §45. Avviket kommer av at NVA-filene for NTNU fikk med IØT 07.10.2026.
- **«AJG-dekning»** er andelen av de finske artiklene som står i et AJG-tidsskrift. For de norske skolene, se §45 (26–72 %).

**Enhetsavgrensning som kontroll** (Research.fi-enhetene i avsnitt 1, sum 2023–2025, hel telling):

| Enhet | Artikler | AJG 4/4* | AJG 3+ | FT50∪UTD24 | ABDC A*/A | JUFO 2–3 |
|---|---|---|---|---|---|---|
| Aalto BIZ | 480 | 137 | 264 | 62 | 305 | 306 |
| Hanken | 439 | 58 | 220 | 24 | 271 | 256 |
| Vaasa | 696 | 43 | 205 | 10 | 257 | 310 |
| Turku TSE | 518 | 32 | 131 | 5 | 189 | 214 |
| UEF Business School | 215 | 26 | 61 | 7 | 87 | 91 |
| Tampere fak. 1020 | 633 | 24 | 103 | 1 | 147 | 306 |
| LUT LBS | 346 | 21 | 106 | 10 | 138 | 150 |
| JSBE | 333 | 17 | 75 | 4 | 126 | 135 |
| OBS | 304 | 16 | 69 | 7 | 108 | 123 |
| Åbo Akademi HH | 121 | 2 | 23 | 1 | 33 | 43 |

- **De to avgrensningene gir samme rekkefølge på toppen:** Aalto, Hanken, Vaasa og UEF. Aalto har 137 AJG 4/4* med
  enhetsavgrensning og 145 med fagfeltavgrensning.
- **Antall artikler avviker.** Turku, Tampere og Vaasa har 30–120 % flere artikler med enhetsavgrensning, fordi enhetene
  også publiserer i andre fagfelt (forvaltning, framtidsstudier, informasjonssystemer).
- **Per år** (fagfelt, AJG 4/4* per 100 årsverk) svinger de små enhetene mye. UEF har for eksempel 14,4 i 2023 og 3,6 i
  2025. Bruk treårsvindu.

**Forbehold:**
1. Fagfeltet er satt av universitetet per publikasjon og per ansatt. En økonom på et teknisk fakultet kommer med, mens en
   handelshøyskoleforsker som publiserer i informatikk (113) eller miljøfag faller ut.
2. **LUT** (120 artikler per 100 årsverk) og trolig **Aalto** får med industriell økonomi i telleren der fagfeltet er satt
   til 512. Vi vet ikke om IEM-ansatte står i 512 eller i et ingeniørfag i nevneren.
3. Helsinki GSE-forskere teller hos flere universiteter, og sampubliseringer telles hos begge parter, som i Norge.
4. **Hel telling.** Vi har ikke laget brøkdelt telling. Vipunens `lukumaara` er en andel per fagfelt, ikke per forfatter.
   Research.fi lister ikke alle forfattere per enhet.
5. **JUFO-nivå:** Finland bruker nivået i publiseringsåret, mens Norge bruker dagens nivå. JUFO fjernet dessuten nivå 3 i
   evalueringen 2026.

## 5. Forslag: slik legges Finland inn i modellen

1. **`skoler-fi.json`** (eller `land: "FI"` i `skoler.json`):
   - én rad per enhet med VIRTA-organisasjonskode og Research.fi-enhetsregler (regex per periode);
   - Vipunen-universitetet med fagfelt 511 + 512 som nevnergrunnlag;
   - akkrediteringer.
   - Helsingfors (samfunnsøkonomi) som `referanse`.
2. **`scripts/fetch-fi-artikler.py`:**
   - Hente Research.fi-poster (A1 + A2) per enhet og år, med Elasticsearch-spørringene i avsnitt 2 og `search_after`.
     Lagres som `data/rangering/fi/<skole>/<år>.json`, gitignored, i samme format som NVA-filene (ISSN, eISSN, JUFO-nivå,
     `intl`).
   - Hente Vipunen-publikasjoner for fagfeltvarianten.
   - Avklare bruken med CSC (tiedejatutkimus@csc.fi) før vi bygger fast på `portalapi`.
3. **`scripts/fetch-fi-arsverk.py`:** Vipunen `henkilosto` med filter `tilastovuosi>=2019;kooditTieteenala=in=(511,512)`,
   summert til `uff` (trinn I–IV) og `utenStip` (II–IV). Da kan dagens nevnervelger brukes uendret.
4. **Byggeskriptet:**
   - `komb` per skole og år blir «nivå|abdc|ft|ajg|nvi». Norsk nivå byttes med **JUFO 1 / 2–3**, eller med `Norway_Level`
     fra JUFO-API-et for et felles nordisk nivå.
   - NVI-feltet settes til «v» for alle A1/A2.
   - Det lagdelte målet, AJG-fanen og FT50/UTD24 virker da uten endring.
5. **Visning:**
   - Egen landsvelger (NO / FI / Norden).
   - Felles mål bare der definisjonen er lik: listebaserte mål per 100 årsverk og sampublisering.
   - Merk Finland «fagfeltavgrenset» og norske skoler «enhetsavgrenset».
6. **Kontroll:**
   - Aalto og Hanken mot egne tall i årsrapportene (FT50 og ABS);
   - Vipunen-årsverk mot skolenes hodetall;
   - stikkprøver av 20 artikler per enhet i Research.fi-portalen.

**Dette blir ikke sammenlignbart med Norge:**
- **Publiseringspoeng og nivå 2-andel.** JUFO har andre kvoter (tak på 25 % for nivå 2 fra 2026) og andre vekter. Bruk
  listebaserte mål, eller `Norway_Level` på de finske artiklene som tilnærming. Det er ikke det samme som NVI.
- **Avgrensningen.** Fagfelt mot enhet. Den norske kan ikke gjøres fagfeltbasert uten nye DBH-uttrekk, og DBH 225 har
  ikke fagfelt per ansatt på samme måte.
- **Nevneren.** Doktorander er dekket ulikt, og vi har bare årsverk per fagfelt i Finland.
- **Tidsserien.** Enhetskodene skifter i Research.fi, og Vaasa 2022 har brudd i årsverkene.
- **Dimensjonene utenfor publisering.** Utdanning, fagmiljø og anerkjennelse mangler for Finland. En samlet nordisk
  rangering må derfor ha egne vekter, eller bare forskningsdimensjonen.

## Kilder (alle lest eller kjørt 7.10.2026)

- Vipunen API: https://api.vipunen.fi/api/resources (ressursene `julkaisut`, `henkilosto`, `alayksikkokoodisto`)
- Research.fi: https://research.fi og om API-laget https://research.csc.fi/service/research-fi/
- VIRTA-publikasjonstjenesten: https://csc.fi/en/web/guest/-/virta-publication-information-service
- JUFO-API: https://jufo-rest.csc.fi/v1.1/kanava/54985 (eksempel) og https://julkaisufoorumi.fi/en/publication-forum
- AACSB Finland: https://www.aacsb.edu/accredited?countries=finland
- Aalto BIZ: https://www.aalto.fi/sites/default/files/2026-08/Dean-Timo-Korkeamaki-24-Aug-2026.pdf
- Vaasa EQUIS: https://www.uwasa.fi/en/newshub/news/university-vaasa-granted-prestigious-equis-accreditation
- TSE akkreditering: https://utu.fi/en/university/turku-school-of-economics/about-the-school/accreditations-and-quality
- Hanken EQUIS: https://www.hanken.fi/en/news/hanken-school-economics-renews-equis-accreditation
- Listene: se `data/rangering/tidsskrift/kilder.md`

Arbeidsfilene (uttrekk og skript) lå i øktas midlertidige mappe og er ikke lagt i repoet.
