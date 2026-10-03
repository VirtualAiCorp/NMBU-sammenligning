# Etterprøving 2: NVA-artikler, tidsskriftkobling, lister og forfatterandel

Kontrollert 3. oktober 2026. Fasit: `data/rangering/rangering-klartekst.json`. Ingen filer i prosjektet er endret, bare denne rapporten.

## Konklusjon

**OK, med fire små avvik i tidsskriftkoblingen (6 av 1 735 artikler) og ett i forfatterandelen (1 artikkel).**

- Artikkeltall, nivåfordeling, ABDC-fordeling, FT50, UTD24, intlAndel, forfatterandel og hele `komb`-tabellen stemmer eksakt med klarteksten for alle fem skoler og begge år (10 av 10 skole-år).
- Ingen feilkoblinger funnet. Rating i `abdc.csv` er lik den offisielle ABDC-fila for alle 2 648 tidsskrift, og alle 950 tidsskrift i de 1 735 artiklene gir samme rating via CSV og xlsx.
- FT50 (50) og UTD24 (24) stemmer med offisielle kilder. ISSN-ene er riktige, med forbehold nederst.
- Avvik: 4 tidsskrift på ABDC-lista ble ikke koblet (tabell 3), og 1 artikkel får for lav forfatterandel fordi en kontaktperson telles som forfatter (tabell 6).

Metode: Jeg skrev egen henting og egen beregning (ikke `fetch-nva-artikler.py` eller `build-rangering.py`) mot det åpne API-et. Parametere: `unit=<enhets-URL>`, `publicationYear`, `instanceType=AcademicArticle,AcademicLiteratureReview`, `results=100` med `from`-paginering. ABDC-xlsx er lest uten openpyxl (xml i zip), fordi modulen ikke er installert.

## 1. Antall og nivåfordeling, ny henting mot klartekst

Nivå står som 0 / 1 / 2 / uten. Alle 10 rader er identiske i ny henting og klartekst, også ABDC-fordeling, FT50, UTD24, intlAndel og forfatterandel.

| Skole | År | Enheter | totalHits (sum) | Unike | Klartekst n | Nivå 0/1/2/u (begge) | FT50 | UTD24 | Forfatterandel |
|---|---|---|---|---|---|---|---|---|---|
| NHH | 2024 | 191.0.0.0 | 210 | 210 | 210 | 4/113/91/2 | 22 | 11 | 106,5 |
| NHH | 2025 | 191.0.0.0 | 217 | 217 | 217 | 0/122/94/1 | 24 | 8 | 119,3 |
| BI | 2024 | 158.0.0.0 | 318 | 318 | 318 | 10/165/136/7 | 30 | 16 | 166,0 |
| BI | 2025 | 158.0.0.0 | 329 | 329 | 329 | 6/196/122/5 | 25 | 11 | 155,5 |
| NMBU | 2024 | 192.11.0.0 | 69 | 69 | 69 | 3/54/11/1 | 0 | 0 | 38,0 |
| NMBU | 2025 | 192.11.0.0 | 73 | 73 | 73 | 2/59/12/0 | 0 | 0 | 32,6 |
| UiA | 2024 | 201.20.0.0 | 122 | 122 | 122 | 2/92/25/3 | 1 | 0 | 51,5 |
| UiA | 2025 | 201.20.0.0 | 118 | 118 | 118 | 3/91/22/2 | 0 | 0 | 57,0 |
| Kristiania | 2024 | 1615.30.0.0 + 1615.10.0.0 | 58 + 67 = 125 | 124 | 124 | 2/104/13/5 | 0 | 0 | 73,1 |
| Kristiania | 2025 | 1615.30.0.0 + 1615.10.0.0 | 76 + 80 = 156 | 155 | 155 | 6/115/30/4 | 0 | 0 | 81,7 |

**Dobbelttelling.** Bare Kristiania har to enheter. Der dukker 1 artikkel opp under begge enhetene i hvert år, og skriptet fjerner den riktig på `identifier`. De andre skolene har én enhet, så dobbelttelling er umulig. Kristiania-tallene i klarteksten (124 og 155) er dermed riktige. Uten dedup ville de blitt 125 og 156.

`egne` regnes mot begge enhetene samlet, som er riktig for en skole-total.

## 2. ISSN-kobling

### 2a. Tilfeldig utvalg, 25 artikler
Trukket med `random.seed(20261003)` fra alle 1 735 artikler. Sammenlignet: `abdc.csv` mot den offisielle `ABDC-JQL-2025-v3-210926.xlsx` (både på ISSN og på tittel), og FT50 / UTD24 mot de offisielle listene (se punkt 3). **Alle 25 OK, ingen avvik.**

| # | Skole-år | NVA-id | Tidsskrift | ISSN / eISSN | abdc.csv | xlsx (ISSN / tittel) | FT50 | UTD24 |
|---|---|---|---|---|---|---|---|---|
| 1 | nhh 2024 | 0198cc7eef86-e71b3403-2637-49d6-b52b-a964c2929e62 | Transportation Research Part E | 1366-5545 / 1878-5794 | A* | A* / A* | nei | nei |
| 2 | uia 2024 | 0198cc7f4968-1d672cf5-77c4-44b1-b6d2-a2f7cbbece66 | Intellectual Property Quarterly | 1364-906X / - | C | C / C | nei | nei |
| 3 | nhh 2024 | 0198cc92a110-a4eff0dc-0ba0-4370-ae46-3ce72cdf5228 | PNAS Nexus | - / 2752-6542 | ikke | ikke / ikke | nei | nei |
| 4 | bi 2024 | 0198cc4da8ca-5620f7d2-b270-4d49-9227-b0e32370730d | Aftenposten | 0804-3116 / 0807-2027 | ikke | ikke / ikke | nei | nei |
| 5 | nhh 2025 | 019a6e1978aa-a854134f-e345-409b-89b6-2716af7d719b | The Scandinavian Journal of Economics | 0347-0520 / 1467-9442 | A | A / ikke (tittelen heter uten «The») | nei | nei |
| 6 | kristiania 2025 | 0198cc7212ed-10d7ea48-99ba-4527-8455-eacf60e0604a | Scientific Reports | - / 2045-2322 | ikke | ikke / ikke | nei | nei |
| 7 | bi 2025 | 0198cc5bf88b-c62d10d7-32a4-442f-96d9-4681a20b093e | Journal of Corporate Finance | 0929-1199 / 1872-6313 | A* | A* / A* | nei | nei |
| 8 | bi 2024 | 0198cc6d07cb-c3eb6f6f-93b8-4e0c-b7e4-162c79cf6eb4 | Int. Journal of Information Management | 0268-4012 / 1873-4707 | A | A / A | nei | nei |
| 9 | nmbu 2024 | 0198cc977fbd-411feefc-5cd7-42fe-9858-44236195f016 | Science of the Total Environment | 0048-9697 / 1879-1026 | ikke | ikke / ikke | nei | nei |
| 10 | nhh 2025 | 019c3224cc4c-0698794c-a222-4d53-9bd0-47296c8fdafd | Praktisk økonomi & ledelse | 3084-1305 / 3084-1313 | ikke | ikke / ikke | nei | nei |
| 11 | uia 2024 | 0198cc6ba428-74fbc437-858a-42e0-8f37-f78305ce1b86 | Norsk Geografisk Tidsskrift | 0029-1951 / 1502-5292 | ikke | ikke / ikke | nei | nei |
| 12 | bi 2025 | 019bbc6f2ff3-032563e8-b764-47f7-884d-098a5768f212 | Magma forskning og viten | 1500-0788 / 1500-6069 | ikke | ikke / ikke | nei | nei |
| 13 | bi 2025 | 0198cc4686c4-9f88f0a0-975b-4809-bde8-89f0788dcc48 | Psychological Reports | 0033-2941 / 1558-691X | ikke | ikke / ikke | nei | nei |
| 14 | bi 2024 | 0198cc6578f8-def4ae40-a600-48de-a46a-af838d72ef9c | Journal of applied econometrics | 0883-7252 / 1099-1255 | A* | A* / A* | nei | nei |
| 15 | nhh 2024 | 0198cc6e6492-a6429ce4-069f-49f6-b0a1-6b3d86099769 | Ibunka komyunikeshon | 1342-7466 / 2436-6609 | ikke | ikke / ikke | nei | nei |
| 16 | nhh 2024 | 0198cc86e9f7-3d8ae1f8-f1b3-4329-925c-026e1fd6246d | Contemporary Accounting Research | 0823-9150 / 1911-3846 | A* | A* / A* | ja | nei |
| 17 | uia 2025 | 019c42607037-c7a879c1-7926-4bc6-84e9-0ef751908d7c | Cleaner Production Letters | - / 2666-7916 | ikke | ikke / ikke | nei | nei |
| 18 | bi 2025 | 0198cc6d85f3-645674be-3d56-4780-a463-67f231f013fa | J. of Business Finance & Accounting | 0306-686X / 1468-5957 | A* | A* / A* | nei | nei |
| 19 | bi 2025 | 019c25a05d81-bed0d078-b65d-403f-95e5-336e660f02c1 | Engineering Management Journal (EMJ) | 1042-9247 / 2377-0643 | B | B / ikke (tittel med forkortelse) | nei | nei |
| 20 | kristiania 2025 | 019985dfd772-3a55cedb-adb5-4903-b646-dd99072c6a44 | Int. J. of Disaster Risk Reduction | - / 2212-4209 | A | A / A | nei | nei |
| 21 | nhh 2025 | 019bbc30a8a4-e8ac0ec5-ebed-4085-b4da-2cb3649f095f | Finance and Stochastics | 0949-2984 / 1432-1122 | A | A / A | nei | nei |
| 22 | uia 2024 | 0198cc59087f-74b0843b-08dd-41f9-9fa7-c3ddc1223c89 | Accounting in Europe | 1744-9480 / 1744-9499 | A | A / A | nei | nei |
| 23 | kristiania 2024 | 0198cc636cb4-926d3d5e-c6e6-4acc-bba6-f7539fc966bf | Journal of Physics: Conf. Series | 1742-6588 / 1742-6596 | ikke | ikke / ikke | nei | nei |
| 24 | nhh 2025 | 019bb1a1823e-9f2e6be0-924e-4b8f-ab6c-1c73781153c4 | The Review of Austrian Economics | 0889-3047 / 1573-7128 | C | C / C | nei | nei |
| 25 | kristiania 2025 | 019a884451c2-f69db75f-cf71-4d92-a3b0-6838dc021dfc | Proc. Int. Joint Conf. on Neural Networks | 2161-4393 / 2161-4407 | ikke | ikke / ikke | nei | nei |

Utvalget har bare én FT50-artikkel (nr. 16), så FT50/UTD24 er i tillegg kontrollert uttømmende i 2c.

### 2b. Uttømmende kontroll, alle 950 tidsskrift i de 10 skole-årene

| Kontroll | Resultat |
|---|---|
| `abdc.csv` mot offisiell xlsx: antall tidsskrift og tittel | 2 648 mot 2 648, alle titler finnes begge steder |
| Rating CSV mot xlsx | 0 avvik |
| Rating for koblede tidsskrift, CSV mot xlsx via ISSN og via tittel | 0 avvik |
| Koblet via ISSN, men helt ulikt tidsskrift (feilkobling) | 0. 65 koblinger har bare ulik tittelform («The», forkortelse, undertittel); alle gjelder samme tidsskrift |
| Artikler uten ISSN i NVA | 10 (arXiv, PsyArXiv, konferanseserier, Ledernytt m.fl.), ingen av dem på listene |
| ISSN-forskjeller CSV mot xlsx | 46: 37 er xlsx som gjentar trykt-ISSN i eISSN-kolonnen eller tabulatortegn, 9 er bevisste rettelser (se punkt 3c) |

### 2c. FT50 og UTD24 i artiklene, koblet mot ikke-koblet
Alle tidsskrift med tittel lik en liste-tittel er ISSN-koblet, bortsett fra de som med rette ikke står på 2026-lista: Organization Studies (6 artikler), Journal of Business Ethics (9) og Human Relations (1). De tre ble tatt ut i april 2026, så `ft50_2026 = 0` er riktig. Ingen FT50- eller UTD24-tidsskrift ble utelatt.

### 3 (tabell). Tidsskrift på ABDC-lista som ikke ble koblet
Alle gjelder tilfeller der ISSN-ene i NVA og ABDC ikke overlapper.

| # | Tidsskrift (NVA) | NVA ISSN / eISSN | ABDC (rating) | Årsak | Artikler | Eksempel (NVA-id) | Vurdering |
|---|---|---|---|---|---|---|---|
| 1 | Finance | - / 2101-0145 | Finance, C | NVA har bare eISSN, ABDC bare trykt (0752-6180). Crossref bekrefter at begge hører til samme tidsskrift | 1 (NHH 2024, nivå «uten») | 0198cc41c59a-4ff8d71e-df84-4513-a046-ebdbf9cd2090 | Mistet kobling, bør være C |
| 2 | Business Ethics, the Environment and Responsibility (BEER) | 2694-6416 / 2694-6424 | Business Ethics, the Environment & Responsibility, B | Tidsskriftet skiftet navn og ISSN (tidl. Business Ethics: A European Review, 0962-8770 / 1467-8608). ABDC har bare de gamle ISSN-ene | 2 (UiA 2024, nivå 1) | 0198cc81e2fc-91ec4ddb-cffb-49ec-84fb-bc2b478cb213, 0198cc46f9fd-ccdd66b2-3de4-4008-87ca-18d306c6fa25 | Mistet kobling, bør være B |
| 3 | Management Accounting Frontiers (MAF) | 2209-038X / 2209-0398 | Management Accounting Frontiers, C | ABDC oppgir 1443-9905 / 1443-9913, som i Crossref er *The Journal of Applied Management Accounting Research*. Feil ISSN i ABDC-fila | 1 (UiA 2024, nivå 1) | 0198cc8512d1-0aab7d99-7882-45d4-b187-bdb7c395b0bd | Kobling mulig bare på tittel, bør være C |
| 4 | International Journal of Business and Management (IJBM) | 1833-3850 / 1833-8119 | samme tittel, C | ABDC har bare eISSN 2815-9330. I Crossref er det et annet tidsskrift med samme forkortelse. Uklart om ABDC mener dette tidsskriftet | 1 (BI 2025, nivå 0) | 01999a478990-8480d799-e01c-439f-b404-266f93e78bb5 | Uavklart, ikke koblet. Kan sjekkes mot ABDC |

Virkning: for lav ABDC-dekning med 4 av 1 735 artikler. Ved retting ville UiA 2024 få 2 flere B og 1 flere C (ellers «ikke»), NHH 2024 1 flere C. Ingen endring i A*/A, FT50 eller UTD24. Forslag: legg til de tre første ISSN-ene i `abdc.csv` som ekstra rader eller rett dem i `RETTELSER` i `scripts/rangering/abdc_til_csv.py`.

Andre treff på «lignende tittel» (ESAIM: M2AN, Computers in Human Behavior: Artificial Humans, Journal of Business Venturing Insights osv.) er andre tidsskrift enn de på listene. De skal ikke kobles.

## 3. FT50, UTD24 og ISSN mot offisielle kilder

| Liste | Kilde | Resultat |
|---|---|---|
| FT50 (revidert april 2026) | ft.com/ft50-journals er sperret for maskinlesing. Brukt: Bodleian-bibliotekets side (https://libguides.bodleian.ox.ac.uk/ft-top50, «last updated May 14, 2026») med 50 titler, pluss 3 utgåtte | De 50 titlene er identiske med `ft50_2026 = 1` i `ft50.csv` (50 av 50, ingen forskjell begge veier). Ut: Human Relations, Journal of Business Ethics, Organization Studies. Inn: Academy of Management Annals, American Sociological Review, Psychological Science (stemmer med `kilder.md`). |
| UTD24 | https://jsom.utdallas.edu/the-utd-top-100-business-school-research-rankings/ (hentet 3.10.2026 med `curl -k`, siden sertifikatkjeden ikke lot seg verifisere) | 24 av 24 identiske med `utd24.csv`. UTD skriver «Journal on Computing» for INFORMS Journal on Computing. Merknader på siden er fra 2017 og 2020, ingen nyere endring. |

### 3b. ISSN i FT50 og UTD24 (153 ISSN)
- Alle har gyldig kontrollsiffer.
- 145 av 153 er bekreftet mot Crossref (`api.crossref.org/journals/<issn>`), tittel stemmer.
- 8 ga 404 i Crossref (Elsevier-eISSN som Crossref ikke fører, og HBR): Accounting, Organizations and Society (1873-6289), Harvard Business Review (0017-8012), Journal of Accounting and Economics (1879-1980), Journal of Business Venturing (1873-2003), Journal of Financial Economics (1879-2774) og Research Policy (1873-7625) i FT50, samt JAE og JFE i UTD24 (samme ISSN). For JAE, JFE, AOS, JBV, Research Policy og HBR er ISSN bekreftet på annen måte (Elsevier, Wikipedia og bibliotekskataloger via nettsøk; HBR har bare trykt ISSN). **ISSN-portalen (portal.issn.org) er sperret med bot-sperre, og jeg har ikke omgått den.** Ingen feil funnet.
- Review of Finance: lista har eISSN 1573-692X, NVA har 1875-824X. Crossref fører begge (+ trykt 1572-3097), så koblingen virker via trykt ISSN. Ufarlig.
- American Economic Review: ABDC har eISSN 0065-812X (feil), lista har riktig 1944-7981. Det er allerede notert i `kilder.md`.

### 3c. De ni ABDC-rettelsene
Sju er bekreftet mot Crossref (begge ISSN gir riktig tidsskrift): Applied Economic Perspectives and Policy, Asian Review of Accounting, Journal of Case Studies (bare eISSN 2162-3171 finnes), Journal of Economic Literature, Journal of Heritage Tourism, Journal of Industrial Relations, Third World Quarterly. To kunne ikke bekreftes i Crossref (404): Stanford Social Innovation Review (1542-7099; ABDC-fila har 1542-7009, som har feil kontrollsiffer) og Review of Marketing and Agricultural Economics (0034-6616). Ingen av disse påvirker artiklene i de ti skole-årene.

## 4. Forfatterandel, 10 artikler

Regelen i `build-rangering.py`: andel = `egne` / `contributorsCount`, der `egne` er antall Creator-bidragsytere med minst én tilknytning (`affiliations[].id`) under skolens enhet(er). Tilknytninger telles hierarkisk (191.30.0.0 hører til 191.0.0.0). Hver forfatter teller én gang selv med flere tilknytninger. **Alle 10 stemmer med manuell opptelling fra NVA-posten.** E = tilknytning under enheten (egen forfatter), x = annen enhet.

| # | Skole-år | NVA-id | Forfattere | Egne | Andel | Bidragsyterne (rekkefølge) | Kommentar |
|---|---|---|---|---|---|---|---|
| 1 | bi 2025 | 019a1022ce63-c58fcaf3-6904-47e9-a668-cbfa85f250dc | 3 | 1 | 0,3333 | x 10600007; E 158.8; x 14400000 | OK |
| 2 | nhh 2025 | 0198cc4464aa-29e95ff2-8d94-40d8-a3af-ff78bd17cfbe | 3 | 2 | 0,6667 | E 191.30; x 68400996; E 191.30 | OK |
| 3 | bi 2025 | 0198cc494794-da277d21-56bd-4f89-85db-40d5a35ee358 | 6 | 2 | 0,3333 | E 158.1; x; x; x 185.17.6 (UiO); x; E 158.3 | OK |
| 4 | kristiania 2025 | 0198cc571663-dbc2330f-9611-46b8-a0cf-a57096b423af | 3 | 1 | 0,3333 | x; x; E 1615.10 | OK |
| 5 | nhh 2024 | 0198cc609b85-85697b47-3af5-4d00-ad3c-ea9de79592bc | 3 | 1 | 0,3333 | x 203.14.5 (HVL); x; E 191.20 | OK |
| 6 | nhh 2024 | 0198cc4bc034-673e5b1c-ddeb-421d-baac-db4d06d22e71 | 1 | 1 | 1,0000 | E 191.40 | OK, enkeltforfatter |
| 7 | kristiania 2024 | 0198cc65d993-36835cdb-bf36-4c3f-addf-c6175934b372 | 8 | 5 | 0,6250 | E (1615.10 + OsloMet 215.6.4); x; E; E (70500075 + 1615.10); E; E; x; x | OK, to tilknytninger telles én gang |
| 8 | kristiania 2024 | 0198cc679209-b55bfa3c-3fb5-47c7-b56a-bdaf442527d6 | 4 | 1 | 0,2500 | x; x; x; E 1615.30.10 | OK, underenhet under 1615.30 |
| 9 | uia 2024 | 0198cc511f10-9d8625b4-3afa-4f53-979b-e667abc9f8d9 | 7 | 1 | 0,1429 | x ×6 (77000011/77000000); E (10600000 + 201.20.0 + 201.20.3) | OK, tre tilknytninger, telt én gang |
| 10 | nhh 2024 | 0198cc58fbff-af267007-e17a-43f5-9a33-84b78c337f88 | 3 | 3 | 1,0000 | E; E; E (+ to eksterne) | OK |

### Svakheter i forfatterandelen (hele materialet, 1 735 artikler)

| Funn | Antall | Betydning |
|---|---|---|
| `contributorsCount` ≠ antall Creator (kontaktperson telt som bidragsyter) | 1 artikkel: BI 2025, 019966f6f84b-416f5db3-a3e4-441e-8b1a-2ed76b97c722 (2 bidragsytere: 1 Creator + 1 ContactPerson) | Nevner blir 2 i stedet for 1. Andelen blir 0,5 i stedet for 1,0 (BI 2025 summen blir 0,5 for lav av 155,5). |
| Bidragsytere uten noen tilknytning i NVA | 56 | Telles som ikke-egne. Kan undervurdere skolen litt, men kan ikke avgjøres uten personoppslag. |
| Forfattere med bare institusjonsnivå-tilknytning på overordnet enhet (f.eks. 1615.0.0.0 for Kristiania, 192.13.x for andre NMBU-fakulteter) | f.eks. Kristiania 2, NMBU 13+10+8 | Telles ikke, og det er riktig for en enhetsavgrenset andel. Kristiania-andelen er da avhengig av at tilknytningen ligger under 1615.10 / 1615.30. |
| Artikler der `egne` = 0 | 0 | Alle treff på `unit=` har minst én egen forfatter, så søket og tilknytningstesten er konsistente. |
| `egne` > `forfattere` | 0 | – |

## Anbefalinger
1. Legg inn de tre tidsskriftkoblingene i tabell 3 (Finance, BEER, Management Accounting Frontiers) og avklar IJBM. Effekten er liten (C/B).
2. Bruk antall Creator (ikke `contributorsCount`) som nevner, eller trekk fra ContactPerson. Rammer 1 artikkel av 1 735.
3. Ingen endring trengs i FT50- eller UTD24-listene eller i artikkeltallene.
