# Danmark i rangeringen: enheter, datakilder og et første publiseringsbilde

Utforsket 7. oktober 2026 (én agent, ingen kodeendringer). Spørsmålet var hvordan «Norwegian Business School Ranking» kan
utvides til danske handelshøyskoler og økonomimiljøer, og hvordan de plasserer seg på publisering. Utdanning er holdt utenfor.

Merker: **V** = lest eller testet i primærkilden 7.10.2026, **D** = delvis (sekundærkilde, søkeresultat eller
ufullstendig), **A** = vårt anslag. Alle tall i avsnitt 4 er **foreløpige**. AJG-tallene er aggregater koblet lokalt mot
`tidsskrift/ajg2024.csv`. Ingen AJG-nivåer per tidsskrift står i dette notatet.

## Kortversjon

- **Sju enheter er relevante.** Tre har AACSB: CBS, Aarhus BSS og SDU Business School. CBS og Aarhus BSS har også EQUIS
  og AMBA (trippelkrone). AAU Business School og RUC (Institut for Samfundsvidenskab og Erhverv) har ingen internasjonal
  akkreditering vi fant. KU Økonomisk Institut er referanse, slik UiB og UiO økonomi er hos oss. DTU Management og ITU er
  utelatt.
- **Beste kilde er universitetenes egne Pure-systemer.** De har åpent OAI-PMH i formatet DDF-MXD, uten nøkkel. Formatet
  gir artikkeltype, fagfellevurdering, ISSN, antall forfattere og **organisasjonshierarkiet ned til institutt** for hver
  intern forfatter. Det er det nærmeste vi kommer NVA. Alle seks universitetene svarte 7.10.2026.
- **OpenAlex** (CC0) gir gode tall for **hele institusjoner**:
  - Kontrollert mot NVA for NHH og BI, og mot CBS' årsrapport, med under ±5 % avvik.
  - OpenAlex har **ingen danske underenheter**. Avgrensning på affiliasjonstekst mister 25–65 % av toppartiklene for
    AU, KU og SDU. Den virker bare for AAU, der instituttnavnet er entydig.
- **Den danske nasjonale indikatoren er nedlagt.** BFI ble avviklet i desember 2021, og Den Danske Forskningsdatabase
  stengte i januar 2021. Danmarks Forskningsportal (Danmarks Statistik for UFM) høster Pure, men vi fant ikke noe
  dokumentert API.
- **Nevner:** Åpne VIP-årsverk finnes per universitet og hovedområde (Danske Universiteters nøgletal C) og per
  fakultet (AU i tal, KU nøgletal). For CBS gjelder tallene hele institusjonen (årsrapporten). Vi fant **ingen åpne
  årsverk per institutt**.
- **Foreløpig plassering, AJG 4/4\* i 2024 (Pure, hel telling):**

  | Plass | Enhet | AJG 4/4\* i 2024 |
  |---|---|---|
  | 1 | CBS | 126 |
  | 2 | Aarhus BSS | 79 (herav 50 fra de tre økonomi- og business-instituttene) |
  | 3 | RUC ISE | 21 |
  | 4 | KU økonomi | 17 |
  | 5 | SDU Business School | 13 |

  AAU Business School har 5. Bare CBS kan regnes per årsverk med en solid nevner:
  - CBS: 19,1 per 100 VIP-årsverk i 2024 og 17,7 i 2023–2025.
  - Til sammenligning: BI 18,5, NHH 15,8 og UiS 15,3 i 2024 (NVA, UN1 + UN2).

  CBS ligger altså på nivå med BI.

## 1. Enhetene

| Enhet | Avgrensning (Pure-enhet) | AACSB | EQUIS | AMBA | Sammenlignbar med |
|---|---|---|---|---|---|
| Copenhagen Business School (CBS) | Hele institusjonen. 11 institutter på nivå 2 i Pure (Economics, Finance, Accounting, Strategy and Innovation, Organization osv.) | ja, 1.8.2011, først i Skandinavia (D) | ja, siden 2000 (D) | ja, siden 2007 (D) | NHH/BI (ren handelshøyskole, hele institusjonen) |
| Aarhus BSS (AU) | Fakultetet har seks institutter. Økonomi og business er **Department of Economics and Business Economics** (ECON), **Department of Management** (MGMT) og **Department of Business Development and Technology** (BTECH, Herning). Statskundskab, psykologi og jus hører også til fakultetet. | ja (V, AACSB-katalogen) | ja (D) | ja, desember 2014 (V, Omnibus 5.12.2014) | Fakultetsnivå: som NTNU Fakultet for økonomi. ECON + MGMT + BTECH: som NTNU Handelshøyskolen + ISØ |
| SDU Business School | Business-delen av Det Samfundsvidenskabelige Fakultet. I Pure 2024: Department of Business & Management (DBM), Department of Business and Sustainability, Department of Economics og restene av Department of Sociology, Environmental and Business Economics (Esbjerg) | ja, august 2025 (D: SDU-nyhet redigert 7.8.2025) | nei (ikke funnet) | nei (ikke funnet) | UiA/UiS-type (universitetsbasert, nylig AACSB) |
| AAU Business School | Ett institutt under Det Samfundsvidenskabelige og Humanistiske Fakultet («Aalborg University Business School» i Pure) | ikke på AACSBs liste for Danmark (V) | nei | ikke funnet | Nord/USN-type |
| RUC, Institut for Samfundsvidenskab og Erhverv (ISE) | Instituttet. Inkluderer offentlig forvaltning, politikk og «Roskilde School of Governance», ikke bare business | nei | nei | nei | HiØ/INN-type, blandet profil |
| KU Økonomisk Institut (referanse) | Instituttet under SAMF | – | – | – | UiO/UiB økonomi (`referanse: true`) |
| (Utelatt) DTU Management, ITU Business IT | Ingeniør- og IT-profil, ikke handelshøyskoler | – | – | – | – |

AACSBs søk på Danmark (https://www.aacsb.edu/accredited?countries=denmark, lest 7.10.2026, V) viser tre skoler: Aarhus BSS,
CBS og SDU. Tilsvarende viser AACSB-søket for Norge fire (§42).

**Kilder til akkrediteringene:**
- SDU, akkrediteringsside: https://www.sdu.dk/en/om-sdu/fakulteterne/samfundsvidenskab/sdu_business_school/akkreditering (V)
- SDU, nyhet om AACSB: https://www.sdu.dk/en/nyheder/verdensklasse-business-school-paa-sdu (D, ingen dato i teksten)
- Aarhus BSS: https://bss.au.dk/en/about-aarhus-bss/profile-and-strategy/accreditations-and-rankings/ (V, uten årstall)
- Aarhus BSS, AMBA: https://omnibus.au.dk/en/archive/show/artikel/bss-awarded-triple-crown-of-seals-of-approval (V)
- CBS: årsrapport 2025, s. 3 («EQUIS, AACSB og AMBA … Triple Crown», V), med årstall fra
  https://www.cbs.dk/en/about-cbs/profile/accreditations-and-rankings (D, via søk)

**ShanghaiRanking GRAS 2025** gjelder hele universiteter. Hentet fra samme API som i `skoler-notat.md` 7.10.2026 (V):

| Fag | Danske plasseringer | Norske til sammenligning |
|---|---|---|
| Business Administration (0509) | CBS 1, AU 51–75, SDU 101–150, AAU 301–400 | BI 30 |
| Finance (0510) | CBS 19, AU 151–200 | – |
| Management (0511) | CBS 6, AU 51–75, SDU 76–100 | NTNU 76–100 |
| Economics (0501) | AU 51–75, CBS 76–100, KU 76–100 | NHH 101–150 |

## 2. Datakilder for publisering

### 2.1 Pure via OAI-PMH (anbefalt)

Alle danske universiteter bruker Pure. OAI-endepunktet tilbyr formatene `ddf-mxd`, `mods`, `oai_dc` og `fi-person`.
Settene heter `publications:yearÅÅÅÅ` og `persons:all`. Alle seks endepunktene svarte på `Identify` og `ListRecords`
7.10.2026 (V):

| Universitet | OAI-basis | Poster 2024 (`completeListSize`) |
|---|---|---|
| AU | https://pure.au.dk/ws/oai | 13 056 |
| KU | https://curis.ku.dk/ws/oai | 14 587 |
| AAU | https://vbn.aau.dk/ws/oai | 7 588 |
| SDU | https://findresearcher.sdu.dk/ws/oai | 8 205 |
| CBS | https://research-api.cbs.dk/ws/oai | 2 092 |
| RUC | https://rucforsk.ruc.dk/ws/oai | 1 585 |

Portaladressene svarer ikke på `/ws/oai`, men sender videre til en feilside: research.cbs.dk, researchprofiles.ku.dk,
portal.findresearcher.sdu.dk og forskning.ruc.dk.

**Hva en DDF-MXD-post gir** (V, AU-post fra 2024):

| Felt | Innhold | Tilsvarer i NVA/Cristin |
|---|---|---|
| `doc_type` | `dja` = tidsskriftartikkel, `djr` = oversiktsartikkel | AcademicArticle / LiteratureReview |
| `doc_review` | `pr` = fagfellevurdert | Nærmeste vi har til NVI, men selvregistrert og ikke kontrollert nasjonalt etter BFI |
| `doc_level` | `sci` = vitenskapelig, `pop` = populærvitenskapelig | – |
| `doc_year` | Publiseringsår | – |
| `total_authors` | Antall forfattere | Gir forfatterandel 1/n |
| `mxd:person` med `aff_no` | Forfatter, koblet til `mxd:organisation` med `level1`–`level4` (da og en) og lokal org-ID (`loc_org`) | Tilknytning per forfatter |
| `mxd:in_journal/mxd:issn` | ISSN, åtte sifre uten bindestrek | ISSN |
| `mxd:identifier` | Scopus-ID (og DOI) | – |

**Hvor instituttet ligger i hierarkiet:**
- AU, KU og AAU: på `level3` (universitet → fakultet → institutt).
- CBS og RUC: på `level2`.
- SDU: på `level3` under «Faculty of Social Sciences». Navnene endres over tid, så bruk `loc_org`-ID og ikke navn.

**Vilkår og drift:**
- OAI-PMH er laget for maskinell høsting. `robots.txt` på pure.au.dk gir 404, altså ingen forbud.
- Høstingen av 2024 tok 15–25 minutter per stort universitet med ett sekunds pause mellom sidene, 100 poster per side.
- Data er universitetenes egne registreringer. Kvaliteten varierer, og ingen nasjonal kontroll som NVI finnes etter BFI.

### 2.2 OpenAlex (supplement og kontroll)

**Tilgang (V, testet 7.10.2026):** API-et virker uten nøkkel. Svarhodene viste `x-ratelimit-limit: 1000` kreditter per døgn
(0,10 USD). Prisen var:
- 1 kreditt for liste- og `group_by`-spørringer.
- 10 kreditter for spørringer med `.search`-filter, for eksempel `raw_affiliation_strings.search`.
- 10 kreditter for institusjonssøk.

Dette nyanserer `publiseringslandskapet.md` punkt 7: nøkkel trengs først ved større bruk.

**Danske institusjons-ID-er** (V, `institutions?filter=country_code:DK`):

| Institusjon | OpenAlex-ID |
|---|---|
| CBS | I180519160 (ROR 04sppb023) |
| AU | I204337017 |
| KU | I124055696 |
| SDU | I177969490 |
| AAU | I891191580 |
| RUC | I107707843 |
| DTU | I96673099 |
| ITU | I83467386 |

**Underenheter:** Ingen av universitetene har underenheter for økonomi eller business i OpenAlex
(`institutions?filter=lineage:<id>`, V).

**Metode for listetall:**
- `works?filter=authorships.institutions.lineage:<id>,publication_year:…,type:article|review&group_by=primary_location.source.id`
  med `cursor`. Kildene slås opp til ISSN med `sources?filter=ids.openalex:…`.
- Alternativt `primary_location.source.issn:<opptil 100 ISSN>` med `group_by=publication_year`.

**Kontroll av hele institusjoner, 2023–2025, hel telling** (V):

| | OpenAlex | Sammenlignet med |
|---|---|---|
| NHH, AJG 4/4\* | 130 | NVA (NVI) 133 |
| NHH, FT50 | 57 | NVA 56 |
| NHH, ABDC A\* | 198 | NVA 203 |
| BI, AJG 4/4\* | 192 | NVA 201 |
| BI, FT50 | 70 | NVA 77 |
| CBS 2024, AJG 4/4\* | 122 | Pure 126 |
| CBS 2024, FT50 | 53 | Pure 52 |
| CBS 2025, AJG 4\* + 4 | 34 + 70 | CBS' årsrapport 39 + 62 |
| CBS 2025, FT50-2016-lista | 56 | CBS' årsrapport 57 |

CBS' egen FT50-telling følger altså 2016-lista.

**Avgrensning på affiliasjonstekst virker dårlig** (V). Vi testet `raw_affiliation_strings.search` med instituttnavn mot
Pure 2024, og målte AJG 4/4\*:

| Enhet | OpenAlex | Pure | Andel funnet |
|---|---|---|---|
| AAU BS | 4 | 5 | ≈ 100 %, bra |
| AU (ECON + MGMT + BTECH) | 32 | 50 | 64 % |
| KU økonomi | 4 | 17 | 24 % |
| SDU BS | ≈ 5 per år | 13 | ≈ 40 % |

For KU økonomi gir tekstsøket i tillegg falske treff: «Department of Economics» hos utenlandske medforfattere.

Kontrollert mot NVA på samme måte:
- NTNU Handelshøyskolen + ISØ: bare 37 % av AJG 4/4\* og 30 % av artiklene.
- UiO økonomi: 64 % av AJG 4/4\*.

Konklusjon: OpenAlex er godt nok for hele institusjoner, ikke for institutter.

### 2.3 Nasjonale kilder (nedlagt eller uten API)

- **BFI** (Den bibliometriske forskningsindikator) hadde to nivåer, brøkdeling og autoritetslister. Ekspertgruppene ble
  nedlagt 3.12.2021, og siste tildeling var i juni 2021 (D: søkeresultater, se også
  https://medarbejdere.au.dk/en/pure/show/artikel/nedlukning-af-bfi). Listene oppdateres ikke lenger sentralt. Dansk nivå
  kan likevel hentes per tidsskrift fra JUFO-API-et (se `norden-finland.md`), men det er frosset.
- **Den Danske Forskningsdatabase** (forskningsdatabasen.dk) stengte i januar 2021 (V: CBS Library,
  https://libguides.cbs.dk/blogs/newsletter/5426/forskningsdatabasen-dk-has-been-discontinued-where-to-go-now).
- **Danmarks Forskningsportal** (https://forskningsportal.dk, laget for UFM, kontakt norainfo@dst.dk) har en lokal
  database høstet fra Pure via OAI-PMH/DDF-MXD hos 14 dataleverandører, og en global database (Clarivate, Dimensions,
  Scopus). Ingen innlogging for den lokale databasen. Nedlasting av metadata nevnes, men **vi fant ikke noe dokumentert
  API eller instituttfilter** (D, https://forskningsportal.dk/?p=5406 og /about-data-documentation/publications/).
- **Scopus/WoS:** krever lisens, ikke testet. DDF-MXD-postene har Scopus-ID, så kobling er mulig hvis NMBU har tilgang.

## 3. Nevner: faglige årsverk

**Definisjon:** «VIP» i Danske Universiteters statistiske beredskab, nøgletal C (definisjonsmanual 2025, s. 13–14, V:
https://dkuni.dk/wp-content/uploads/2026/06/definitionsmanual-2025.pdf):
- **Med:** professor, lektor, adjunkt, postdoc, ph.d.-stipendiat, forsker, videnskabelig assistent med flere.
- **Ikke med:** dekan og institutleder (de regnes som TAP), og DVIP (eksterne lektorer).
- **Utregning:** 1 924 timer per årsverk.

Dette ligger nær HK-dirs UN1 + UN2. Forskjellen er at vitenskapelige assistenter er med og instituttledere ikke.

**Hva som finnes åpent, og på hvilket nivå:**

| Kilde | Nivå | Eksempel | |
|---|---|---|---|
| Danske Universiteter, nøgletal C («Formålsfordelte årsværk pr. hovedområde») | Universitet × hovedområde (HUM, SAMF inkl. jura, SUND, NAT, TEK) | – | V |
| Universitetenes egne nøgletal | Fakultet | KU 2025: SAMF 401 VIP, https://om.ku.dk/tal-og-fakta/statistikberedskab/filer/_konomin_gletal_2025.pdf | V |
| AU i tal 2023, tabell F1A | Fakultet × stillingskategori | Aarhus BSS **778 VIP-årsverk** (152 professorer, 200 lektorer, 88 adjunkter, 82 postdoktorer, 181 ph.d., 74 annen VIP), https://auhist.au.dk/fileadmin/www.auhist.au.dk/AU_i_tal/AU_i_Tal_2023_DK/AU_i_tal_2023_DK_270624.pdf | V |
| CBS årsrapport 2025, s. 5 og 41 | Institusjon | VIP-årsverk 2021–2025: 687, 712, 699, 660, 669, https://www.cbs.dk/sites/default/files/2026-04/cbs-aarsrapport-2025-dansk.pdf | V |
| Instituttnivå | – | Ikke funnet åpent. AU ECON oppgir rundt 140 vitenskapelig ansatte og 55 ph.d. (hoder) i en stillingsannonse (D, https://econjobmarket.org/positions/10109). KU økonomi oppga rundt 95 ansatte inkludert administrasjon i 2022 (D, THE-annonse). | D |

**Mulig anslag for instituttnivå:** Pure-personregisteret (`persons:all`, `fi-person`) har tilknytninger med start- og
sluttdato per enhet (V, AAU: 40 603 personer). Det gir hodetall over tid, men ikke årsverk og ikke stillingskategori.
Det er grovt, og TAP og studentassistenter må filtreres bort. Bedre er å be AU, SDU og KU om VIP-årsverk per institutt.
De fleste har det i intern ledelsesinformasjon.

**Danmarks Statistik:** FoU-statistikken gir årsverk per fagområde nasjonalt, ikke per enhet (D). Den egner seg ikke.

## 4. Foreløpig publiseringsbilde

Grunnlaget er tidsskrift- og oversiktsartikler (`dja`/`djr`) med `doc_review = pr`, publiseringsår 2024, høstet fra Pure
7.10.2026. Telling er hel: én artikkel teller én gang per enhet hvis minst én forfatter er ved enheten. Artiklene er koblet
på ISSN mot ABDC 2025, FT50 (2026-lista), UTD24 og AJG 2024 (lokalt). Bare 2024 er høstet, så **dette er ett år og et
foreløpig bilde**.

| Enhet (2024) | Artikler | AJG 4\* | AJG 4/4\* | AJG 3+ | ABDC A\* | FT50 | Nevner | AJG 4/4\* per 100 årsverk |
|---|---|---|---|---|---|---|---|---|
| CBS (hele) | 601 | 47 | **126** | 294 | 149 | 52 | 660 VIP (V) | **19,1** |
| Aarhus BSS (hele fakultetet, 6 institutter) | 745 | 17 | 79 | 203 | 96 | 13 | 778 VIP (2023, V) | 10,2 (A: 2024-artikler / 2023-årsverk, med jus, psykologi og statskundskab) |
| – herav AU ECON + MGMT + BTECH | 354 | 11 | 50 | 149 | 74 | 13 | ukjent | – |
| – herav AU ECON alene | 125 | 6 | 29 | 77 | 55 | 7 | ≈ 195 hoder (D) | ≈ 15 (A, svært usikkert) |
| RUC ISE | 174 | 5 | 21 | 47 | 7 | 1 | ukjent | – |
| KU Økonomisk Institut (referanse) | 81 | 2 | 17 | 48 | 42 | 2 | ukjent | – |
| SDU Business School (4 institutter) | 161 | 7 | 13 | 51 | 21 | 8 | ukjent | – |
| AAU Business School | 84 | 0 | 5 | 22 | 6 | 0 | ukjent | – |
| *Til sammenligning, NVA (NVI) 2024, nevner UN1 + UN2:* | | | | | | | | |
| BI | 295 | 26 | 76 | 136 | 88 | 30 | 411,9 | 18,5 |
| NHH | 204 | 18 | 46 | 106 | 75 | 22 | 290,3 | 15,8 |
| UiS | 80 | 5 | 12 | 37 | 18 | 5 | 78,4 | 15,3 |
| NTNU (HHS + ISØ) | 216 | 2 | 12 | 66 | 26 | 3 | 234,3 | 5,1 |

**Treårsvinduet 2023–2025 for CBS** (OpenAlex, hele institusjonen, V):
- 1 987 artikler, hvorav 359 AJG 4/4\*, 846 AJG 3+ og 140 FT50.
- Delt på 2 028 VIP-årsverk gir det **17,7 AJG 4/4\* per 100 årsverk og år**.
- Det kan sammenlignes direkte med §45: BI 16,1 og NHH 15,5.

**Hele universiteter som øvre grense** (OpenAlex, AJG 4/4\* i 2024): AU 93, KU 46, AAU 25, SDU 22, RUC 18. Tallene
inkluderer psykologi, helse og teknologi som publiserer i AJG-tidsskrift, og er ikke egnet som enhetsmål.

**Lesning:**
1. **CBS** er klart størst i Norden, med omtrent like mange AJG 4/4\* som BI og NHH til sammen. Per årsverk ligger CBS på
   nivå med BI.
2. **Aarhus BSS** er nummer to i volum. Per årsverk er fakultetet lavere fordi statskundskab, psykologi og jus er med.
   ECON alene ser ut til å ligge på NHH-nivå (A).
3. **RUC ISE** får 14 av sine 21 AJG 4/4\* fra offentlig forvaltning (AJG-feltet PUB SEC) og bare én FT50-artikkel. Profilen er
   annerledes enn i business.
4. **SDU** fikk nylig AACSB og har flere FT50 enn KU og RUC, men færre AJG 4/4\*. Avgrensningen på fire institutter er vår
   egen.
5. **KU økonomi** har høy ABDC A\*-andel (42 av 81). Her treffer AJG og FT50 dårligere fordi profilen er samfunnsøkonomi.

**Forbehold:**
- Ett år.
- Pure er selvregistrert, og `pr`-flagget er ikke NVI-kontrollert.
- AJG 2024 er brukt også bakover.
- Hel telling.
- Instituttnavnene i Pure er valgt av oss.
- Nevner per institutt mangler.

## 5. Plan for å legge Danmark inn i modellen

**1. Utvide `skoler.json`.** Nye felt per enhet (norske enheter får `land: "NO"`, og `pure`/`openalex` blir valgfrie):

```json
{
  "id": "cbs", "land": "DK", "navn": "Copenhagen Business School (CBS)",
  "nva": null, "dbh": null,
  "pure": {
    "oai": "https://research-api.cbs.dk/ws/oai",
    "enheter": [{"locOrg": "<loc_org-id>", "niva": 1, "navn": "Copenhagen Business School"}],
    "merknad": "Hele institusjonen"
  },
  "openalex": {"id": "I180519160", "ror": "04sppb023", "kontrollMetode": "lineage"},
  "nevner": {
    "type": "VIP-årsverk (dkuni nøgletal C-definisjon)", "niva": "institusjon",
    "kilde": "https://www.cbs.dk/sites/default/files/2026-04/cbs-aarsrapport-2025-dansk.pdf",
    "tall": {"2021": 687, "2022": 712, "2023": 699, "2024": 660, "2025": 669}
  },
  "eksterneTall": {"2025": {"ajg4s": 39, "ajg4": 62, "ft50_2016": 57, "kilde": "årsrapport 2025 s. 42"}},
  "akkrediteringer": [...], "rangeringer": [...]
}
```

**2. Nytt henteskript `scripts/rangering/fetch-pure-oai.py`:**
- Høster `publications:yearÅÅÅÅ` i `ddf-mxd` per universitet, en gang per år og universitet, med pause mellom sidene.
- Filtrerer på `loc_org` for enhetene.
- Skriver `data/rangering/pure/<skole>/<år>.json` (gitignored) i **samme artikkelformat som NVA-filene**:
  - `issn`/`eissn` normalisert med bindestrek
  - `nvi` = `doc_review == "pr" && doc_level == "sci"`
  - `forfattere` = `total_authors`
  - `egne` = antall `mxd:person` med `aff_no` til enheten
  - `intl` = minst én ekstern organisasjon med land ≠ DK. Det krever at `mxd:country` leses for organisasjonene.

  Da kan `build-rangering.py` bruke `komb`-logikken uendret.

**3. Norsk nivå på danske artikler.** Slå opp ISSN i NVAs åpne kanal-API (`publication-channels-v2`, se `kilder.md` §6).
Da kan nivå 2-andel og et **anslag på publiseringspoeng** regnes for danske enheter med samme formel som i
NVA-kildekoden. Merk det som «norsk nivå anvendt på dansk publisering».

**4. Kontroll:**
- OpenAlex-lineage for hele institusjoner, slik som i 2.2.
- Universitetenes egne tall, for eksempel CBS' AJG/FT50-tall i årsrapporten, i `kontroll/eksterne-tall.json`.

**5. Nevner:**
- CBS: årsrapportene.
- Aarhus BSS: AU i tal, fakultetsnivå.
- For instituttene: be AU, KU, SDU, AAU og RUC om VIP-årsverk per institutt for 2016–2025. Alternativet er å vise dem
  **bare med antall**, uten per årsverk-mål, med en tydelig merknad.

**6. Visning:**
- Danske enheter bør i første omgang ligge i en egen «Norden»-visning, eller som referanser med eget merke.
- Rangeringsmålene som bygger på DBH og NVI vises ikke for DK: publiseringspoeng, HK-dirs nivå 2-andel og
  DBH-kontrollen.
- Tidsskriftmålene (lagdelt mål, AJG, ABDC, FT50/UTD24) kan vises side om side.

**Hva som ikke blir sammenlignbart med Norge:**
- **Publiseringspoeng og nivå 2** er et norsk system. For Danmark blir det bare et anslag via norsk kanalnivå, uten
  NVI-kontroll og uten dansk vurdering av kanalene.
- **Kvalitetskontrollen er ulik.** NVI er kontrollert av institusjonene og Sikt. Pure-flagget `pr` er egenregistrering, og
  ingen nasjonal kontroll har funnets siden BFI. Sammenlign derfor med `grunnlag=alle` i Norge, ikke bare NVI.
- **Avgrensningen er ulik.** CBS tilsvarer NHH og BI som hele institusjon. Aarhus BSS er et bredt fakultet, og
  institutt-utvalget hos AU og SDU er vårt eget.
- **Nevneren er ulik.** VIP ≈ UN1 + UN2, men tallene er på ulikt nivå: institusjon og fakultet i Danmark, institutt i
  Norge.
- **Utdanningsmålene** (Studiebarometeret, DBH, Samordna opptak) har ingen dansk motpart i modellen.
- **AJG-tillatelsen** gjelder til omtrent 10.10.2026. Danske AJG-tall må regnes før den utløper, eller erstattes av det
  kalibrerte anslaget (`tidsskrift/anslag/`).

**Største hindre:**
1. Nevner per institutt mangler åpent.
2. Pure-kvaliteten varierer, og instituttnavnene endres over tid (SDU har omorganisert flere ganger).
3. Høstingen er tung: hele universitetsåret må hentes for å filtrere på enhet, 15–25 minutter per år for AU og KU.
4. AJG-lisensen.

## Vedlegg: hvordan tallene ble laget

Skript og mellomfiler ligger i den midlertidige arbeidsmappa til økta, ikke i repoet: `oa/hent.py`, `oa/hele.py`,
`oa/tell.py`, `oai/hoest.py` og `oai/analyse.py`.

**OpenAlex:** Omtrent 600 kreditter ble brukt 7.10.2026.

**OAI-PMH:** `ListRecords&metadataPrefix=ddf-mxd&set=publications:year2024` for AU, KU, AAU, SDU, CBS og RUC, ett
sekunds pause mellom sidene. Antall fagfellevurderte artikler og oversiktsartikler i 2024:

| | AU | KU | AAU | SDU | CBS | RUC |
|---|---|---|---|---|---|---|
| Artikler | 7 533 | 9 866 | 3 771 | 4 801 | 601 | 530 |
| Uten ISSN | 2 | 91 | 12 | 1 | 2 | 4 |

**Norske sammenligningstall:** `data/rangering/nva/<skole>/2024.json` (NVI) og `rangering-klartekst.json` (`uff`).
