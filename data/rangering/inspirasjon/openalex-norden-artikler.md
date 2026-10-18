# Artikler i OpenAlex med samme metode for Norge, Danmark, Sverige og Finland

Laget 18.–19.10.2026. Mål: telle artikler for alle handelshøyskolene i Norden, **også de norske, med samme metode i OpenAlex**,
og sette AJG 2024-nivå per tidsskrift. For Norge er avgrensningen kontrollert mot NVA (fasit for norske enheter).
Ingen personnavn, titler eller tilknytningstekster er lagret i repoet; cachen har bare ja/nei og antall per verk.
OpenAlex-nøkkelen er ikke skrevet ut eller lagret.

## Sammendrag

- **Metode (alle land):** OpenAlex-verk av typen article/review 2016–2025. Rene handelshøyskoler (NHH, BI, CBS, SSE, Hanken)
  = hele institusjonen. Fakulteter/institutter = **tekstenheter**: verk der en forfatter ved foreldreinstitusjonen har en rå
  tilknytningstekst som passer enhetens mønster, pluss **bare-regelen** (under). Finland som før (fagfelt 511/512).
- **Recall mot NVA 2021–2025** (andel NVA-artikler med DOI som OpenAlex-enheten fanger, med regelen): NHH 89 %, BI 88 %
  (institusjonstaket), Molde 81 %, UiA 85 %, HH NMBU 77 %, Nord 75 %, UiS 74 %, NTNU 71 %, NTNU HH 70 %, USN 67 %, UiT 67 %,
  UiB økonomi 66 %, INN 64 %, HVL 62 %, OsloMet 57 %, Kristiania 52 %, UiO økonomi 48 %, HiØ 45 %.
- **Presisjon** (andel OpenAlex-treff som er i enhetens NVA): 85–93 % for tekstenhetene (HiØ 74 %), NHH 81 % og BI 89 %.
  Tekstenhetene er altså like «rene» som institusjonsnivået; problemet er dekning, ikke feiltreff.
- **AJG:** recall for AJG 3+ er høyere enn for alle artikler (HH NMBU 69 av 78, UiA 228 av 254, Nord 80 av 93, Molde 66 av 72),
  men lav for NTNU (211 av 325), UiO økonomi (42 av 107), OsloMet og INN. AJG 4/4*: HH NMBU 7 av 9, NHH 183 av 202.
- **Bare-regelen** hjelper tydelig der enheten er eneste fagmiljø i økonomi/administrasjon ved institusjonen (HH NMBU,
  UiA, Nord, USN, INN, Molde, HVL, Kristiania): recall +3 til +9 poeng, presisjon −0,5 til −6 poeng, AJG 3+-treff +4 til +17.
  Den slås automatisk av der flere miljøer deler fagfeltene (UiS, NTNU, NTNU HH, UiT, OsloMet, UiO, UiB, HiØ). Samme regel
  og samme terskel brukes for Danmark og Sverige.
- **For svakt til å brukes alene:** Kristiania, HiØ, UiO økonomi og OsloMet (recall under 60 %), og INN før 2021 (presisjon
  57 %). For Norge bør NVA fortsatt være grunnlaget; OpenAlex-tallene er for sammenligning med de andre landene, og bør leses
  med en dekningsfaktor (OA/NVA 0,5–0,9 for tekstenheter mot 0,9–1,0 for institusjonene).
- **Kreditter:** omtrent 3 400 brukt (diagnose 180, kladdehenting Norge 610, Danmark/Sverige/Finland 1 370, Norge 1 225,
  ny henting INN 26). Igjen etter kjøringen: 6 405 av 10 000.

## 1. Metode

**Henting** (`scripts/rangering/hent_openalex.py norden`, alle enheter i `enheter-norden.json` + `enheter-norge.json`):
`filter=authorships.institutions.lineage:<forelder>,publication_year:<år>,type:article|review` og for tekstenheter
`primary_topic.field.id:` i de felles fagfeltene **11, 14, 17, 18, 20, 21, 22, 23, 26, 32, 33, 36** (Agricultural and
Biological Sciences, Business/Management/Accounting, Computer Science, Decision Sciences, Economics/Econometrics/Finance,
Energy, Engineering, Environmental Science, Mathematics, Psychology, Social Sciences, Health Professions). Fagfeltgrensen er
bare for å spare kreditter: 95,6 % av NVA-artiklene som mønstrene fanger (alle fagfelt), ligger i disse feltene; det som
faller utenfor er mest medisin (27). Før 18.10 var feltene 14/18/20/33, som bare rommet 46 % av HH NMBUs og 56 % av NTNUs
NVA-artikler. Unntak: JIBS alle felt, LiU 14/20 (IEI har ingeniørfag), Finland uendret (fagfelt som rapporten).

**Per verk i cachen** (`data/rangering/openalex/norden/<enhet>/<år>.json`, gitignored): OpenAlex-id, DOI, år, type, FWCI,
persentil, siteringer, underfelt (`uf`), tidsskrift (`kilde` = OpenAlex-kilde «S…», `issn_l`), og for tekstenheter
`enhet` (mønstertreff), `bare` og `annen` (antall forfattere ved forelderen med bare universitetsnavnet / med en annen
underenhet). Tilknytningstekstene leses under hentingen og kastes.

**Klassifisering per forfatter ved foreldreinstitusjonen** (`klassifiser()`): tekstene som nevner forelderen (eller den
eneste teksten) vurderes. *Treff* = passer `monster` og ikke `unntak`. Ellers *bare* = teksten inneholder universitetsnavnet
(`uninavn`, ellers `foreldre`) og ingen organisasjonsord står igjen når navnet er fjernet (fakultet, institutt, senter,
avdeling, school, department, hospital, research, business, economics osv., se `ORGORD`). Ellers *annen*.

**Bare-regelen** (`i_enheten()`, samme for alle land): et verk uten treff telles med hvis
1. minst én forfatter ved forelderen bare har universitetsnavnet,
2. ingen forfatter ved forelderen nevner en annen underenhet,
3. primærfeltet er 14 eller 20, og
4. enheten «eier» feltene ved forelderen: av forelderens verk i felt 14/20 der underenheten kan leses (treff eller annen),
   2016–2025, er minst **60 %** enhetens.

Punkt 4 er datadrevet og trenger ingen fasit, så det kan brukes likt i alle land. Det ble valgt fordi presisjonen for
tilleggene (verk regelen legger til) følger andelen: høy andel (Molde 98 %, Nord 89 %, UiA 82 %, INN 82 %) gir tillegg der
50–88 % er i NVA, lav andel (NTNU HH 19 %, OsloMet 39 %, NTNU 50 %) gir 5–35 %. Felt 18 (Decision Sciences) ble testet og
forkastet: bare 8 % av tilleggene der var enhetens. Med 14/18/20 og uten punkt 4 falt presisjonen for UiS fra 93 til 75 %
og for NTNU HH fra 86 til 43 %.

`sitering.py` (siteringsfanen) bruker fortsatt bare `enhet` (mønstertreffet), som før, og leser gamle og nye cachefiler.

**Kontroll** (`scripts/rangering/openalex_mot_nva.py`, skriver bare til stdout eller `--rapport`): NVA-artiklene per
enhet kobles til OpenAlex på DOI (NVA-DOI) og OpenAlex-id (DOI-oppslaget og tittel + tidsskrift + år ±1 fra
`sitering.py`). Recall = andel NVA-artikler med DOI som enheten fanger (årstall i OpenAlex fritt); presisjon = andel
OpenAlex-treff som er blant enhetens NVA-artikler (alle år). AJG-nivå: NVA på ISSN/eISSN, OpenAlex på kilde-id via
`ajg-kilder.json` eller `issn_l`, begge mot `tidsskrift/ajg2024.csv`. «felles» = NVA-artikler på nivået (etter NVA-ISSN)
som OpenAlex-enheten også fanger, og kan derfor være litt høyere enn OA-tallet.

## 2. Endelige mønstre (Norge)

INN har tre foreldre-id-er (Universitetet i Innlandet `I4210116649` = tidligere Høgskolen i Innlandet, samme ROR
`02dx4dc92`; OpenAlex har bare én post for kodebyttet 0264 → 1177, pluss forgjengerne Hedmark og Lillehammer for 2016).
HVL har forgjengerne i Bergen, Stord/Haugesund og Sogn og Fjordane. NTNU og NTNU HH hentes én gang (samme filter).
Molde er tekstenhet (logistikk + økonomi/samfunnsvitenskap, unntak helse): som institusjon ville recall vært 87 %, men
presisjon bare 66 % (helsefakultetet), mot 81/93 % som tekstenhet.

- **nhh** – institusjon `I931913249` (hele institusjonen, alle fagfelt).
- **bi** – institusjon `I181046868` (hele institusjonen, alle fagfelt).
- **nmbu** – tekst, forelder `I54108979`
  - mønster: `School of Economics and Business|Handelsh(ø|o)(g|y)skolen|School of Business|Business School|Department of Business|Department of Economics and Resource Management|Institutt for (ø|o)konomi og ressursforvaltning|Skatteforsk|Centre for Applied Philosophy of Science`
  - uninavn: `(The )?Norwegian University of Life Sciences?|Norges milj(ø|o)- og biovitenskapelige universitet|\bNMBU\b`
- **uis** – tekst, forelder `I92008406`
  - mønster: `Business School|School of Business|Handelsh(ø|o)gskolen|Department of Economics\b|Department of Business Administration|Department of Innovation, (Management|Leadership),? and Marketing|Department of Innovation, Marketing and Management|Department of Accounting|Centre for Innovation Research|Institutt for (ø|o)konomi og finans|Institutt for innovasjon, ledelse og marknadsf(ø|o)ring`
  - unntak: `Hotel Management|Hotellh(ø|o)gskole`
  - uninavn: `(The )?University of Stavanger|Universitetet i Stavanger|\bUiS\b`
- **uia** – tekst, forelder `I200650556`
  - mønster: `School of Business ?(and|&|&amp;) ?Law|Business School|Handelsh(ø|o)yskolen|Department of Business and Law|Department of Management|Department of Strategy and Management|Department of Economics and Finance|Department of Economics\b|Department of Working Life and Innovation|Department of Law|Social Enterprises and Microfinance|Crowdfunding Research|Institutt for (ø|o)konomi og finans|Institutt for strategi og ledelse|Institutt for arbeidsliv og innovasjon|Institutt for rettsvitenskap`
  - uninavn: `(The )?University of Agder|Universitetet i Agder|Univ\. of Agder|Agder University College|H(ø|o)gskolen i Agder|\bUiA\b`
- **nord** – tekst, forelder `I2802079931`
  - mønster: `Business School|Handelsh(ø|o)gskolen|\bHHN\b|Graduate School of Business|Bod(ø|o) Graduate School|Accounting and Economic Analys|Economic Analysis and Accounting|High North Logistics|High North Center`
  - uninavn: `Nord University|Nord universitet`
- **ntnu** – tekst, forelder `I204778367`
  - mønster: `NTNU Business School|Business School|Handelsh(ø|o)yskolen|Handelsh(ø|o)gskolen i Trondheim|Department of Economics\b|Institutt for samfunns(ø|o)konomi|Industrial (Economics )?(and|&) Technology|Department of Industrial Economics|Industriell (ø|o)konomi|\bI(Ø|O)T\b|Faculty of Economics and Management|Fakultet for (ø|o)konomi`
  - unntak: `International Business|Internasjonal business|(Å|A)lesund`
  - uninavn: `(The )?Norwegian University of Science and Technology|Norges teknisk-naturvitenskapelige universitet|\bNTNU\b`
- **ntnu_hh** – tekst, forelder `I204778367`
  - mønster: `NTNU Business School|Business School|Handelsh(ø|o)yskolen|Handelsh(ø|o)gskolen i Trondheim`
  - uninavn: `(The )?Norwegian University of Science and Technology|Norges teknisk-naturvitenskapelige universitet|\bNTNU\b`
- **uit** – tekst, forelder `I78037679`
  - mønster: `School of Business (and|&|&amp;) Economic|Business School|Handelsh(ø|o)gskolen|Department of Business and Economics|Tourism and Northern Studies|reiseliv og nordlige studier`
  - uninavn: `UiT\W*(The|the)?\W*Arctic University of Norway|UiT Norges arktiske universitet|(The )?Arctic University of Norway|University of Troms(ø|o)|\bUiT\b`
- **usn** – tekst, forelder `I2801380234`
  - mønster: `School of Business|Business School|Handelsh(ø|o)yskolen|Department of Business|Department of Economics|Business, Marketing and Law|Business, History and Social Sciences?|Business and IT|Economics and IT|Institutt for (ø|o)konomi`
  - uninavn: `(The )?University of South-?Eastern Norway|Universitetet i S(ø|o)r(ø|o)st-Norge|University College of Southeast Norway|\bUSN\b`
- **inn** – tekst, forelder `I4210116649|I4405282651|I4405283775`
  - mønster: `Inland School of Business|School of Business and Social Sciences?|Handelsh(ø|o)gskolen Innlandet|Department of Economics|Institutt for (ø|o)konomifag|Department of Organi[sz]ation|Organi[sz]ation, Management|organisasjon, ledelse|Department of Business|Business Administration|Faculty of Economics and Organi[sz]ation|\bCREDS\b|Research on Digitali[sz]ation and Sustainability`
  - uninavn: `(Inland Norway University of Applied Sciences?|University of (the )?Inland( Norway)?|Universitetet i Innlandet|H(ø|o)gskolen i Innlandet|\bINN University|\bINN\b|Lillehammer University College|H(ø|o)gskolen i Lillehammer|Hedmark University College|H(ø|o)gskolen i Hedmark)`
- **oslomet** – tekst, forelder `I184531372`
  - mønster: `Oslo Business School|School of Business|Business School|Handelsh(ø|o)yskolen|Department of Finance|Finans og regnskap|Offentlig administrasjon og styring|Organisasjon og ledelse|Samfunns(ø|o)konomi og metode|Strategi, innovasjon og markedsf(ø|o)ring`
  - uninavn: `OsloMet\W*Oslo Metropolitan University|Oslo Metropolitan University|OsloMet\W*storbyuniversitetet|\bOsloMet\b|Oslo and Akershus University College( of Applied Sciences)?`
- **himolde** – tekst, forelder `I182204967`
  - mønster: `Logist|Logest|Business Administration|Social Sciences?|(ø|o)konomi og samfunnsvitenskap|Economics|(ø|o)konomi`
  - unntak: `Health|Helse|Social Care`
  - uninavn: `Molde University College(\W*Specialized University in Logistics)?|H(ø|o)gskolen i Molde|Specialized University in Logistics`
- **hvl** – tekst, forelder `I179863766|I4405264474|I4405264481|I4405263886`
  - mønster: `HVL Business School|Business School|Handelsh(ø|o)gskulen|Department of Business (and )?Administration|Institutt for (ø|o)konomi og administrasjon|Mohn Cent(er|re)|Faculty of Business Administration and Social Sciences`
  - uninavn: `Western Norway University of Applied Sciences?|H(ø|o)gskulen p(å|a) Vestlandet|\bHVL\b|Bergen University College|H(ø|o)gskolen i Bergen|Stord/Haugesund University College|Sogn og Fjordane University College`
- **kristiania** – tekst, forelder `I2800207870`
  - mønster: `School of Economics, Innovation,? and Technology|Faculty of Management and Economics|Fakultet for ledelse og (ø|o)konomi|School of Communication, Leadership,? (and|&|&amp;) Marketing|Department of Leadership|Department of Marketing|Marketing Department|Institute of Marketing|Department of Economics|Department of Communication|Institute for Communication|Department of Technology|Cybersecurity Department|Mobile Technology Lab|Leadership and Innovation|Marketing and Economics`
  - uninavn: `(Kristiania University College|Kristiania University of Applied Sciences|H(ø|o)yskolen Kristiania|\bKristiania\b)`
- **hiof** – tekst, forelder `I19923696`
  - mønster: `Economics, Innovation,? and Society|(ø|o)konomi, innovasjon og samfunn|Faculty of Business, Languages?,? and Social Sciences|Faculty for Business, Languages|Faculty of Economics, Social Sciences and Languages|Economy and Business Administration`
  - uninavn: `(Ø|O)stfold University College|(Ø|O)stfold University of Applied Sciences|H(ø|o)gskolen i (Ø|O)stfold`
- **uib_okon** – tekst, forelder `I4432739`
  - mønster: `Department of Economics|Institute of Economics|^Economics,? University of Bergen|Professor of Economics|Institutt for (ø|o)konomi`
  - unntak: `Norwegian School of Economics|\bNHH\b`
  - uninavn: `(The )?University of Bergen|Universitetet i Bergen|\bUiB\b`
- **uio_okon** – tekst, forelder `I184942183`
  - mønster: `Department of Economics|Institute of Economics|^Economics,? University of Oslo|Professor of Economics|(Ø|O)konomisk institutt|\bESOP\b|Centre for the Study of Equality, Social Organi[sz]ation`
  - unntak: `BI Norwegian Business School|Norwegian School of Economics`
  - uninavn: `(The )?University of Oslo|Universitetet i Oslo|\bUiO\b`

## 3. Norge mot NVA, 2021–2025 (med regelen, standard)

| Enhet | NVA alle | med DOI | i OA | recall alle | recall NVI | OpenAlex | OA/NVA | presisjon | AJG 3+ NVA / OA / felles | AJG 4/4* NVA / OA / felles |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| nhh | 1058 | 971 |  99.4 |  88.8 |  90.1 | 1054 | 1.00 |  81.0 | 471 / 462 / 427 | 202 / 198 / 183 |
| bi | 1712 | 1547 |  99.2 |  88.2 |  91.0 | 1510 | 0.88 |  88.7 | 672 / 614 / 615 | 332 / 305 / 307 |
| nmbu | 376 | 357 | 100.0 |  77.0 |  80.8 | 299 | 0.80 |  90.3 | 78 / 70 / 69 | 9 / 7 / 7 |
| uis | 521 | 468 |  99.6 |  73.9 |  78.6 | 364 | 0.70 |  92.9 | 182 / 128 / 127 | 61 / 47 / 48 |
| uia | 729 | 690 |  99.3 |  85.1 |  86.3 | 635 | 0.87 |  89.4 | 254 / 244 / 228 | 27 / 30 / 23 |
| nord | 481 | 447 |  98.9 |  75.2 |  76.9 | 370 | 0.77 |  90.3 | 93 / 81 / 80 | 16 / 17 / 16 |
| ntnu | 1208 | 1144 |  99.0 |  71.1 |  72.5 | 867 | 0.72 |  92.8 | 325 / 212 / 211 | 62 / 32 / 32 |
| ntnu_hh | 325 | 305 |  98.7 |  69.8 |  70.9 | 249 | 0.77 |  85.5 | 104 / 72 / 67 | 18 / 7 / 7 |
| uit | 328 | 311 |  99.4 |  66.6 |  68.6 | 227 | 0.69 |  87.7 | 64 / 44 / 43 | 23 / 17 / 16 |
| usn | 849 | 752 |  99.2 |  67.0 |  68.3 | 581 | 0.68 |  85.9 | 128 / 105 / 95 | 29 / 23 / 21 |
| inn | 636 | 579 |  99.0 |  63.7 |  64.6 | 429 | 0.67 |  85.1 | 107 / 76 / 66 | 31 / 20 / 16 |
| oslomet | 219 | 194 |  98.5 |  57.2 |  58.3 | 121 | 0.55 |  86.8 | 58 / 34 / 36 | 21 / 10 / 12 |
| himolde | 393 | 371 |  98.4 |  81.1 |  82.9 | 323 | 0.82 |  93.2 | 72 / 66 / 66 | 16 / 16 / 16 |
| hvl | 301 | 278 |  99.6 |  61.9 |  63.2 | 199 | 0.66 |  85.4 | 35 / 30 / 28 | 13 / 10 / 9 |
| kristiania | 651 | 575 |  99.5 |  51.8 |  52.9 | 331 | 0.51 |  89.4 | 41 / 30 / 29 | 13 / 9 / 9 |
| hiof | 36 | 31 | 100.0 |  45.2 |  46.7 | 19 | 0.53 |  73.7 | 4 / 1 / 1 | 0 / 0 / 0 |
| uib_okon | 97 | 92 | 100.0 |  66.3 |  67.4 | 59 | 0.61 |  91.5 | 51 / 29 / 35 | 15 / 7 / 9 |
| uio_okon | 214 | 187 |  98.9 |  48.1 |  51.8 | 99 | 0.46 |  86.9 | 107 / 45 / 42 | 37 / 14 / 12 |

«i OA» = andel av NVA-artiklene med DOI som finnes i OpenAlex i det hele tatt (taket). NHH og BI viser taket for
institusjonsnivået: om lag 11 % av NVA-artiklene har ikke institusjonen i OpenAlex-tilknytningen eller har en annen type, og
19 % (NHH) og 11 % (BI) av OpenAlex-verkene finnes ikke blant institusjonens NVA-artikler (bl.a. SNF og andre
NHH-tilknyttede, kommentarer og bokanmeldelser typet som article).

**Per år** (recall alle / presisjon, %):

| Enhet | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---:|---:|---:|---:|---:|
| nhh | 87.9 / 88.0 | 88.0 / 76.8 | 89.8 / 78.2 | 90.0 / 82.4 | 88.1 / 80.5 |
| bi | 87.1 / 87.8 | 89.1 / 94.5 | 88.6 / 89.3 | 88.4 / 89.0 | 87.9 / 83.1 |
| nmbu | 84.4 / 93.4 | 68.9 / 92.9 | 69.0 / 89.1 | 78.8 / 91.1 | 81.2 / 84.6 |
| uis | 68.0 / 89.0 | 77.9 / 95.6 | 74.0 / 95.9 | 74.4 / 89.2 | 75.3 / 93.5 |
| uia | 87.4 / 86.8 | 86.3 / 93.2 | 86.5 / 92.7 | 86.3 / 87.1 | 76.8 / 86.6 |
| nord | 75.3 / 93.7 | 78.5 / 90.0 | 76.8 / 84.7 | 75.9 / 89.5 | 69.3 / 93.7 |
| ntnu | 66.7 / 89.9 | 71.5 / 92.9 | 74.9 / 94.3 | 70.8 / 95.2 | 71.7 / 92.0 |
| ntnu_hh | 73.7 / 82.4 | 74.3 / 81.8 | 69.8 / 90.0 | 66.7 / 95.8 | 64.3 / 79.5 |
| uit | 78.5 / 85.3 | 74.3 / 90.7 | 55.3 / 84.4 | 58.8 / 90.6 | 57.8 / 87.8 |
| usn | 66.2 / 86.1 | 72.1 / 88.5 | 64.2 / 80.5 | 71.9 / 87.8 | 62.0 / 87.3 |
| inn | 54.9 / 82.2 | 55.4 / 88.7 | 64.4 / 90.2 | 69.4 / 86.9 | 66.4 / 76.3 |
| oslomet | 58.3 / 91.3 | 70.6 / 95.7 | 50.0 / 83.3 | 63.6 / 87.1 | 44.7 / 75.0 |
| himolde | 91.4 / 91.4 | 80.0 / 96.6 | 79.0 / 92.7 | 82.1 / 94.6 | 73.6 / 91.8 |
| hvl | 68.3 / 81.2 | 56.7 / 85.1 | 65.3 / 91.9 | 62.1 / 82.1 | 56.8 / 89.3 |
| kristiania | 52.6 / 83.6 | 57.0 / 95.8 | 50.0 / 96.2 | 48.7 / 93.5 | 50.8 / 80.6 |
| hiof | 42.9 / 42.9 | 28.6 / 66.7 | 42.9 / 100.0 | 50.0 / 100.0 | 75.0 / 100.0 |
| uib_okon | 72.7 / 91.7 | 60.9 / 100.0 | 64.7 / 81.8 | 68.4 / 92.3 | 63.6 / 85.7 |
| uio_okon | 54.1 / 77.8 | 61.1 / 85.7 | 50.0 / 89.5 | 38.2 / 93.3 | 38.6 / 94.1 |

**2016–2020** (med regelen):

| Enhet | NVA alle | med DOI | i OA | recall alle | recall NVI | OpenAlex | OA/NVA | presisjon | AJG 3+ NVA / OA / felles | AJG 4/4* NVA / OA / felles |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| nhh | 1022 | 871 |  99.9 |  81.2 |  83.8 | 845 | 0.83 |  85.9 | 399 / 360 / 334 | 154 / 138 / 125 |
| bi | 1543 | 1314 |  99.5 |  79.3 |  83.6 | 1195 | 0.77 |  89.8 | 507 / 447 / 413 | 238 / 214 / 196 |
| nmbu | 374 | 346 | 100.0 |  67.1 |  70.6 | 261 | 0.70 |  90.0 | 70 / 49 / 46 | 5 / 4 / 4 |
| uis | 337 | 291 | 100.0 |  69.1 |  73.4 | 216 | 0.64 |  95.4 | 97 / 77 / 73 | 33 / 29 / 27 |
| uia | 364 | 338 |  99.1 |  70.1 |  74.0 | 317 | 0.87 |  79.8 | 79 / 79 / 63 | 14 / 17 / 11 |
| nord | 370 | 331 |  98.8 |  74.3 |  77.0 | 290 | 0.78 |  85.9 | 52 / 46 / 42 | 21 / 20 / 19 |
| ntnu | 887 | 808 |  99.8 |  66.2 |  69.5 | 565 | 0.64 |  95.9 | 232 / 166 / 155 | 62 / 41 / 41 |
| ntnu_hh | 173 | 150 |  99.3 |  74.7 |  75.7 | 127 | 0.73 |  89.0 | 31 / 34 / 28 | 6 / 6 / 5 |
| uit | 283 | 256 | 100.0 |  69.9 |  72.5 | 213 | 0.75 |  87.8 | 45 / 34 / 30 | 11 / 5 / 4 |
| usn | 613 | 525 |  99.6 |  63.6 |  66.2 | 380 | 0.62 |  89.7 | 58 / 40 / 37 | 14 / 7 / 7 |
| inn | 271 | 188 |  97.3 |  44.1 |  49.4 | 151 | 0.56 |  57.0 | 36 / 22 / 17 | 9 / 6 / 5 |
| oslomet | 218 | 174 |  99.4 |  46.0 |  51.0 | 90 | 0.41 |  92.2 | 41 / 26 / 23 | 17 / 8 / 7 |
| himolde | 363 | 340 |  97.6 |  65.6 |  68.2 | 251 | 0.69 |  88.4 | 63 / 47 / 47 | 13 / 13 / 13 |
| hvl | 290 | 247 |  98.8 |  43.3 |  44.5 | 125 | 0.43 |  85.6 | 30 / 16 / 15 | 9 / 6 / 6 |
| kristiania | 454 | 385 |  99.2 |  31.7 |  32.6 | 147 | 0.32 |  83.0 | 37 / 16 / 15 | 10 / 2 / 2 |
| hiof | 54 | 45 |  95.6 |  17.8 |  19.4 | 23 | 0.43 |  34.8 | 4 / 1 / 1 | 1 / 1 / 1 |
| uib_okon | 142 | 110 | 100.0 |  52.7 |  57.4 | 65 | 0.46 |  96.9 | 54 / 36 / 29 | 14 / 5 / 4 |
| uio_okon | 278 | 252 |  99.6 |  55.6 |  56.4 | 151 | 0.54 |  94.0 | 140 / 71 / 67 | 51 / 12 / 12 |

## 4. Effekten av bare-regelen i Norge (2021–2025)

| Enhet | andel (krit. 4) | regel brukt | recall uten → med | presisjon uten → med | OA/NVA uten → med | AJG 3+ felles uten → med (NVA) |
|---|---:|---|---:|---:|---:|---:|
| nmbu | 69 % | ja | 72.8 → 77.0 | 94.1 → 90.3 | 0.72 → 0.80 | 61 → 69 (78) |
| uis | 53 % | nei | 73.9 → 73.9 | 92.9 → 92.9 | 0.70 → 0.70 | 127 → 127 (182) |
| uia | 82 % | ja | 78.7 → 85.1 | 93.9 → 89.4 | 0.77 → 0.87 | 211 → 228 (254) |
| nord | 89 % | ja | 70.2 → 75.2 | 96.0 → 90.3 | 0.67 → 0.77 | 66 → 80 (93) |
| ntnu | 50 % | nei | 71.1 → 71.1 | 92.8 → 92.8 | 0.72 → 0.72 | 211 → 211 (325) |
| ntnu_hh | 19 % | nei | 69.8 → 69.8 | 85.5 → 85.5 | 0.77 → 0.77 | 67 → 67 (104) |
| uit | 52 % | nei | 66.6 → 66.6 | 87.7 → 87.7 | 0.69 → 0.69 | 43 → 43 (64) |
| usn | 79 % | ja | 63.6 → 67.0 | 89.6 → 85.9 | 0.62 → 0.68 | 91 → 95 (128) |
| inn | 80 % | ja | 56.6 → 63.7 | 85.9 → 85.1 | 0.59 → 0.67 | 49 → 66 (107) |
| oslomet | 39 % | nei | 57.2 → 57.2 | 86.8 → 86.8 | 0.55 → 0.55 | 36 → 36 (58) |
| himolde | 98 % | ja | 76.5 → 81.1 | 93.7 → 93.2 | 0.77 → 0.82 | 60 → 66 (72) |
| hvl | 67 % | ja | 53.6 → 61.9 | 91.3 → 85.4 | 0.53 → 0.66 | 22 → 28 (35) |
| kristiania | 76 % | ja | 42.8 → 51.8 | 90.0 → 89.4 | 0.41 → 0.51 | 21 → 29 (41) |
| hiof | 33 % | nei | 45.2 → 45.2 | 73.7 → 73.7 | 0.53 → 0.53 | 1 → 1 (4) |
| uib_okon | 11 % | nei | 66.3 → 66.3 | 91.5 → 91.5 | 0.61 → 0.61 | 35 → 35 (51) |
| uio_okon | 11 % | nei | 48.1 → 48.1 | 86.9 → 86.9 | 0.46 → 0.46 | 42 → 42 (107) |

## 5. Regelen for Danmark, Sverige og Finland

Andel (punkt 4) for de danske og svenske tekstenhetene: dk_aarhus 74 %, dk_ruc 60 %, dk_ku 15 %, dk_sdu 39 %, dk_aau 28 %, se_jibs 75 %, se_lund 42 %, se_gu 56 %, se_umea 41 %, se_orebro 64 %, se_lnu 68 %, se_karlstad 89 %, se_su 39 %, se_uu 34 %, se_liu 69 %. Regelen brukes altså for Aarhus BSS, RUC, JIBS,
Örebro, LNU, Karlstad og LiU, ikke for KU, SDU, AAU, LUSEM, GU, Umeå, SU og UU. Ingen fasit finnes her, så tabellen viser
bare endringen mot rapportenes artikkeltall (Pure/SwePub; Danmark bare 2024).

### Regelen for de andre landene (OpenAlex-artikler mot rapportenes tall, 2023–2025 der rapporten har det)

| Enhet | metode | periode | rapport artikler | OA mønster | OA med regel | endring | dekning før → etter | rapport AJG 4/4* | OA 4/4* før → etter |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| dk_cbs | institusjon | 2023–2025 | 1987 | 1977 | 1977 | 0.0 % | 99.5 → 99.5 % | 359 | 356 → 356 |
| dk_aarhus | tekst | 2024–2024 | 745 | 559 | 601 | 7.5 % | 75.0 → 80.7 % | 79 | 52 → 61 |
| dk_ruc | tekst | 2024–2024 | 174 | 95 | 98 | 3.2 % | 54.6 → 56.3 % | 21 | 7 → 7 |
| dk_ku | tekst | 2024–2024 | 81 | 51 | 51 | 0.0 % | 63.0 → 63.0 % | 17 | 4 → 4 |
| dk_sdu | tekst | 2024–2024 | 161 | 85 | 85 | 0.0 % | 52.8 → 52.8 % | 13 | 4 → 4 |
| dk_aau | tekst | 2024–2024 | 84 | 80 | 80 | 0.0 % | 95.2 → 95.2 % | 5 | 4 → 4 |
| se_sse | institusjon | 2023–2025 | 654 | 562 | 562 | 0.0 % | 85.9 → 85.9 % | 123 | 131 → 131 |
| se_jibs | tekst | 2023–2025 | 477 | 311 | 349 | 12.2 % | 65.2 → 73.2 % | 54.9 | 45 → 50 |
| se_lund | tekst | 2023–2025 | 888 | 381 | 381 | 0.0 % | 42.9 → 42.9 % | 68.1 | 36 → 36 |
| se_gu | tekst | 2023–2025 | 882 | 419 | 419 | 0.0 % | 47.5 → 47.5 % | 42 | 19 → 19 |
| se_umea | tekst | 2023–2025 | 429 | 173 | 173 | 0.0 % | 40.3 → 40.3 % | 6.9 | 6 → 6 |
| se_orebro | tekst | 2023–2025 | 339 | 130 | 154 | 18.5 % | 38.3 → 45.4 % | 12.9 | 6 → 7 |
| se_lnu | tekst | 2023–2025 | 498 | 235 | 273 | 16.2 % | 47.2 → 54.8 % | 21.9 | 11 → 13 |
| se_karlstad | tekst | 2023–2025 | 222 | 122 | 137 | 12.3 % | 55.0 → 61.7 % | 12.9 | 11 → 15 |
| se_su | tekst | 2023–2025 | 213 | 141 | 141 | 0.0 % | 66.2 → 66.2 % | 39.9 | 28 → 28 |
| se_uu | tekst | 2023–2025 | 243 | 170 | 170 | 0.0 % | 70.0 → 70.0 % | 17.1 | 16 → 16 |
| se_liu | tekst | 2023–2025 | 255 | 222 | 289 | 30.2 % | 87.1 → 113.3 % | 6.9 | 8 → 8 |
| fi_aalto | fag | 2023–2025 | 547 | 477 | 477 | 0.0 % | 87.2 → 87.2 % | – | 106 → 106 |
| fi_hanken | institusjon | 2023–2025 | 365 | 432 | 432 | 0.0 % | 118.4 → 118.4 % | – | 56 → 56 |
| fi_vaasa | fag | 2023–2025 | 526 | 506 | 506 | 0.0 % | 96.2 → 96.2 % | – | 39 → 39 |
| fi_uef | fag | 2023–2025 | 179 | 280 | 280 | 0.0 % | 156.4 → 156.4 % | – | 12 → 12 |
| fi_helsinki | fag | 2023–2025 | 261 | 162 | 162 | 0.0 % | 62.1 → 62.1 % | – | 9 → 9 |
| fi_lut | fag | 2023–2025 | 446 | 403 | 403 | 0.0 % | 90.4 → 90.4 % | – | 20 → 20 |
| fi_turku | fag | 2023–2025 | 330 | 394 | 394 | 0.0 % | 119.4 → 119.4 % | – | 17 → 17 |
| fi_oulu | fag | 2023–2025 | 255 | 299 | 299 | 0.0 % | 117.3 → 117.3 % | – | 15 → 15 |
| fi_jyvaskyla | fag | 2023–2025 | 232 | 283 | 283 | 0.0 % | 122.0 → 122.0 % | – | 18 → 18 |
| fi_tampere | fag | 2023–2025 | 280 | 346 | 346 | 0.0 % | 123.6 → 123.6 % | – | 13 → 13 |
| fi_abo | fag | 2023–2025 | 98 | 93 | 93 | 0.0 % | 94.9 → 94.9 % | – | 1 → 1 |

Merk at dekningen for de danske og svenske tekstenhetene er bedre enn i §50 i `docs/status-og-metode.md` (Aarhus BSS 59 →
75 %, LUSEM 34 → 43 %, GU 35 → 48 %) fordi fagfeltene er utvidet. LiU går over 100 % med regelen (87 → 113 %): IEI-mønsteret
og regelen tar med mer enn rapportens IEI-tall, så LiU bør leses med forbehold.

## 6. Svakheter

1. **Dekning:** tekstenhetene fanger 45–85 % av NVA-artiklene, institusjonene 88 %. Det meste som mangler er verk der
   forfatteren bare skriver universitetsnavnet i en enhet der regelen ikke slår inn, eller der OpenAlex ikke har koblet
   forfatteren til institusjonen (5–10 %). Sammenligninger mellom en institusjon (NHH, CBS, SSE) og en tekstenhet blir
   skjeve med 10–40 %, i samme retning i alle land.
2. **Sverige og Danmark har lavere dekning enn Norge** mot rapportene (LUSEM 43 %, GU 48 %, Umeå 40 %), og der finnes ingen
   fasit som NVA. Rapportenes tall (SwePub/Pure) har også andre definisjoner (fagfellevurdert, ikke-DOI), så «dekning» der er
   ikke recall.
3. **Regelen er bare kontrollert i Norge.** Terskelen 60 % og feltene 14/20 er valgt på norske data.
4. **Fagfeltene** er OpenAlex' automatiske emneklassifisering; 4,4 % av enhetsartiklene faller utenfor de hentede feltene.
5. **Små enheter** (HiØ, UiB økonomi) hopper mye mellom år. INN 2016–2020 har lav presisjon (57 %): fakultetsnavnet tar
   med psykologi og jus, som NVA-enheten ikke har.
6. **AJG i OpenAlex** settes via kilde-id (`ajg-kilder.json`) og `issn_l`; tidsskrift som har byttet ISSN eller mangler
   kilde, kan bli uten nivå.
7. **OpenAlex endrer seg** ved hver oppdatering; tallene gjelder hentingen 18.–19.10.2026.

## Kjøre på nytt

```
python3 scripts/rangering/hent_openalex.py kreditt
python3 scripts/rangering/hent_openalex.py norden --refresh            # alle land (~2 600 kreditter, 2–3 timer)
python3 scripts/rangering/hent_openalex.py norden --land no --refresh  # bare Norge (~1 200)
python3 scripts/rangering/openalex_mot_nva.py --begge                   # Norge mot NVA, med og uten regelen
python3 scripts/rangering/openalex_mot_nva.py --fra 2016 --til 2020
python3 scripts/rangering/openalex_mot_nva.py --norden                  # regelen i Danmark/Sverige/Finland
```
