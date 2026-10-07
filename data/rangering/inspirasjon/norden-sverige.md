# Sverige i rangeringen: enheter, datakilder og et første publiseringsbilde

Utforsket 7. oktober 2026 (én agent, bare åpne kilder, ingen innlogging). Gjelder bare forskning/publisering; utdanning
er holdt utenfor. Alle tall som er regnet av oss, er **foreløpige anslag**. AJG 2024 er brukt lokalt
(`tidsskrift/ajg2024.csv`, etter avtalen i `tidsskrift/kilder.md` §4b) og bare som aggregater; ingen nivåer per tidsskrift
står her.

Merker: **V** = lest i primærkilden 7.10.2026, **D** = sekundærkilde eller søkesammendrag, **U** = ikke verifisert,
**T** = testet maskinelt 7.10.2026.

## Kort fortalt

- **Beste kilde for artikler:** SwePub sitt åpne bibliometri-API (KB). Det gir fagfellevurderte tidsskriftartikler per
  lærosete med ISSN, DOI, forfatterliste og forfatternes tilknytning som fritekst fra lærosetets eget CRIS. Underenheter
  (handelshøyskole/institutt) må plukkes ut med tekstmønstre på tilknytningen, men det fungerte for alle tolv enhetene
  vi prøvde. (T)
- **Nevner:** UKÄ har et åpent API med forskende og undervisende personal i heltidsekvivalenter per lærosete og
  forskningsfaggruppe («Ekonomi och näringsliv»), men ikke per fakultet/institutt. For rene skoler (SSE) er det godt nok;
  for de andre må vi bruke skolenes egne nøkkeltall (LUSEM og GU gir dem) eller bruke fagtallet som et grovt anslag. (T/V)
- **Foreløpig bilde (2023–2025, hel telling):** SSE ligger på nivå med NHH og BI på toppublisering per faglig årsverk,
  og har nest flest FT50/UTD24-artikler per år av enhetene vi har sett på (24/år, mot BI 26 og NHH 19), med langt færre ansatte enn BI. JIBS er
  klart nummer to i Sverige per hode. LUSEM og GU har stort volum, men lavere toppandel. Resten ligger på nivå med de
  norske regionale skolene.
- **Største hindre:** ingen felles nevner på enhetsnivå, ingen NVI/publiseringspoeng, ulik registreringspraksis i de
  svenske CRIS-ene (Lund registrerer forskergrupper, ikke institutter; LNU byttet instituttnavn i 2023), og ingen
  utdanningsdata i vårt format.

## 1. Enhetene

Avgrensningen følger den norske modellen: den minste enheten som bærer navnet handelshøyskole, eller de
økonomi-/bedriftsøkonomiske instituttene der det ikke finnes noen handelshøyskole.

| Id (forslag) | Enhet | Hva som er med | AACSB | EQUIS | AMBA | Sammenlignbar med |
|---|---|---|---|---|---|---|
| `sse` | Handelshögskolan i Stockholm (SSE), privat stiftelse | Hele institusjonen (6 institutter: företagsekonomi, nationalekonomi, finans m.m.) | nei (ikke på lista) | ja | nei funnet | NHH/BI (egen institusjon, bred ØA + samfunnsøkonomi) |
| `gu_hh` | Handelshögskolan vid Göteborgs universitet | Fakultet med fire institutter: företagsekonomi, nationalekonomi med statistik, ekonomi och samhälle (økonomisk historie, kulturgeografi, innovasjon), **juridik**. Variant `gu_hh_utenjus` uten jus | ja | ja | ja | UiA (jus med), NTNU ØK |
| `lusem` | Ekonomihögskolan vid Lunds universitet (LUSEM) | Seks institutter: företagsekonomi, nationalekonomi, ekonomisk historia, handelsrätt, informatik, statistik. Variant `lusem_kjerne` = företagsekonomi + nationalekonomi | ja | ja | ja | NTNU ØK, NHH (faglig bredde) |
| `jibs` | Internationella Handelshögskolan, Jönköping University (JIBS) | Hele skolen (aksjeselskap under stiftelsen Högskolan i Jönköping) | ja | ja | ja (2025) | BI (privat), UiA |
| `usbe` | Handelshögskolan vid Umeå universitet (USBE) | Företagsekonomi, nationalekonomi, statistik (+ CERE, Umeå-delen) | ja | nei | nei | UiS, UiT |
| `oru_hh` | Handelshögskolan vid Örebro universitet | Hele handelshøyskolen slik DiVA registrerer den | ja | nei | nei | UiS, Nord |
| `lnu_feh` | Ekonomihögskolan, Linnéuniversitetet | Institutionen för management, marknadsföring och turismvetenskap, nationalekonomi och statistik (+ fakultetsnivået). Informatikk og rettsvitenskap er holdt utenfor (tilhørighet ikke bekreftet) | ja | nei | nei | USN, HVL |
| `kau_hh` | Handelshögskolan vid Karlstads universitet | Hele handelshøyskolen | medlem, ikke akkreditert | nei | nei | INN, HiMolde |
| `sbs` | Stockholm Business School (företagsekonomiska institutionen, SU) | Bare bedriftsøkonomi | nei | nei | nei | OsloMet |
| `su_nek` (referanse) | Nationalekonomiska institutionen + IIES, SU | Samfunnsøkonomi | – | – | – | UiO/UiB økonomi (referanse) |
| `uu_fek_nek` | Företagsekonomiska + Nationalekonomiska institutionen, Uppsala universitet | Ingen handelshøyskole; statistikk holdt utenfor | nei | nei | nei | NTNU (institutt), UiB |
| `liu_ekon` | Avdelningarna för företagsekonomi og nationalekonomi, IEI, Linköpings universitet | Ikke industriell økonomi/logistikk | nei | nei | nei | NTNU IØT er nærmere; svak kandidat |

Ikke tatt med, men mulige: Södertörns högskola, Mälardalens universitet, Mittuniversitetet, Högskolan Kristianstad
(fagmiljøer på 25–60 årsverk i UKÄ, se §3), KTH Industriell ekonomi och organisation (INDEK) og Chalmers TME
(teknologiledelse, ikke handelshøyskoler).

Kilder, enheter og akkrediteringer:
- AACSB-lista for Sverige: https://www.aacsb.edu/accredited?countries=sweden (V, 7.10.2026). Seks akkrediterte: JIBS,
  Linnéuniversitetet, LUSEM, GU, Umeå, Örebro. Karlstad står som «non-accredited» medlem. SSE står ikke der.
- EQUIS-lista: https://www.efmdglobal.org/accreditations/business-schools/equis/equis-accredited-schools/ (V, 7.10.2026).
  Sverige: JIBS, LUSEM, SSE, GU (alle «5 years»). Norge til sammenligning: BI og NHH.
- AMBA: GU (https://www.gu.se/en/news/the-school-of-business-economics-and-law-re-accredited-by-amba, D), LUSEM
  (https://www.amba-bga.com/insights/the-lund-university-school-of-economics-and-management-achieves-amba-re-accreditation-confirming-itself-in-the-top-2-of-business-schools, D),
  JIBS juni 2025 for Engineering Management-programmet
  (https://ju.se/en/about-us/contact-and-press/press/news/news-archive/2025-06-03-jonkoping-international-business-school-joins-the-worlds-top-one-per-cent-with-triple-crown-accreditation.html, D).
  JU sin pressemelding sier at JIBS, LUSEM og GU er de tre svenske «Triple Crown»-skolene (D).
- GU-fakultetets institutter: https://www.gu.se/handelshogskolan/om-oss/organisation (V). Personaltall:
  https://www.gu.se/handelshogskolan/om-oss/fakta-och-historia (V).
- LUSEM sine seks institutter og personaltall: https://lusem.lu.se/about (V).
- USBE: tre institutter (bedriftsøkonomi, samfunnsøkonomi, statistikk), AACSB siden 2018 (søkesammendrag av umu.se, D).
- LNU: https://lnu.se/en/meet-linnaeus-university/Organisation/school-of-business-and-economics/ (V: AACSB; instituttene
  står ikke på siden, derfor er informatikk/rettsvitenskap usikkert, U).
- Instituttnavnene i tabellen er ellers lest ut av tilknytningsfeltene i SwePub (T), se §2.

## 2. Datakilder for publisering

### 2a. SwePub bibliometri-API (anbefalt)

- **Hva:** KBs nasjonale samling av publikasjonsmetadata fra 47 svenske lærested og forskningsinstitutter (alle de
  aktuelle, også SSE som `hhs` og JU som `hj`). Liste: `GET https://bibliometri.swepub.kb.se/api/v2/info/sources` (T).
- **Spørring (T):** `POST https://bibliometri.swepub.kb.se/api/v2/bibliometrics` med `Content-Type: application/json`, for
  eksempel:
  ```json
  {"org":["gu"],"years":{"from":"2024","to":"2024"},"contentMarking":["ref"],
   "category":["publication/journal-article"],
   "fields":["recordId","publicationYear","ISSN","DOI","creators","publicationChannel","creatorCount"]}
  ```
  Svaret strømmes som JSON (`hits`, `total`), uten nøkkel og uten sidegrense. `contentMarking: ref` = fagfellevurdert,
  `category` = publikasjonstype. Filtrene står i kildekoden: https://github.com/libris/swepub-redux (`service/swepub.py`,
  lest 7.10.2026; Swagger på `/api/v2/apidocs`).
- **Underenheter:** `org` filtrerer bare på lærosete. Men hver forfatter har `affiliation` (domene, f.eks. `gu.se`),
  `localIdBy` og `freetext_affiliations` med enhetsnavnene fra lærosetets CRIS (GUP, LUCRIS/Pure, DiVA osv.), ofte på
  både svensk og engelsk. Vi plukker enheten med regulære uttrykk på disse navnene, bare for forfattere som tilhører
  lærosetet. Eksempler på det som fantes (T):
  - GU: «Företagsekonomiska institutionen», «Institutionen för nationalekonomi med statistik», «Juridiska institutionen»
    (+ undergrupper som «Företagsekonomiska institutionen, Redovisning»).
  - JU: «IHH, Företagsekonomi», «IHH, Nationalekonomi», «IHH, Centre for Family Entrepreneurship and Ownership».
  - Örebro/Karlstad: «Handelshögskolan vid Örebro Universitet», «Handelshögskolan (from 2013)».
  - Umeå: «Företagsekonomi», «Statistik», «Nationalekonomi», «Handelshögskolan vid Umeå universitet».
  - **Lund er vanskelig:** Pure registrerer ofte forskergruppen («Organisation», «Marknadsföring», «Redovisning och finans»,
    «Strategi», «Entreprenörskap») og ikke instituttet; Lund-forfattere har dessuten `affiliation = null` og bare
    `localIdBy = lu`. Gruppenavnene fant vi ved å se hvilke strenger forskerne som også står med «Företagsekonomiska
    institutionen» bruker.
  - **LNU** byttet instituttnavn i 2023 (MAN, MTS, NS); mønsteret vårt treffer derfor bare 24–31 artikler i 2021–2022 mot
    ~165 fra 2023. Gamle navn må legges til før tidsserier brukes.
- **Volum:** 2024, fagfellevurderte tidsskriftartikler per lærosete (T): SSE 227, GU 6 017, LU 7 727, SU 4 752, UU 7 528,
  Umeå 3 243, LiU 3 687, JU 820, Örebro 1 569, Karlstad 812, LNU 1 393. Nedlasting av 2021–2025 for elleve lærosteder tok
  ca. 25 minutter (≈ 500 MB JSON, ett kall per lærosete og år).
- **Vilkår:** KBs side om datatilgang (https://www.kb.se/for-bibliotekssektorn/eng/services/swepub-data-access.html) er
  bak en bot-sperre og ble ikke lest. Søkesammendrag sier at metadataene er fritt tilgjengelige via dump, OAI-PMH, SRU og
  åpne JSON-API-er (D). Lisensen (trolig CC0) må bekreftes manuelt før vi bygger på den (U).
- **Kontroll mot OpenAlex (T):** SSE 2024: SwePub 219 artikler i vår enhetstelling mot 203 i OpenAlex
  (`institutions.id:I180242103,type:article`). SU økonomi: SwePub ~29/år mot 31–36 + 7–11 (IIES) i OpenAlex, altså noe
  lavere dekning i SwePub for SU-økonomene.

### 2b. OpenAlex

- Institusjons-ID-er (T): SSE `I180242103`, GU `I881427289`, LU `I187531555`, SU `I161593684`, UU `I123387679`,
  Umeå `I90267481`, LiU `I102134673`, JU `I94616838`, Örebro `I26437253`, Karlstad `I43968019`, LNU `I223464139`
  (til sammenligning NHH `I931913249`, BI `I181046868`, CBS `I180519160`).
- **Ingen underenheter:** søk etter «School of Business, Economics and Law», «Lund University School of Economics and
  Management», «Jönköping International Business School» osv. ga null institusjonstreff (T). Underenheter kan bare
  finnes med `raw_affiliation_strings.search`, som treffer dårligere enn SwePub (f.eks. LU «School of Economics and
  Management» 49–50 artikler/år, mens forfatterne oftest bare skriver «Department of Economics, Lund University»).
- API-et svarte uten nøkkel, men hvert kall er priset (`cost_usd` 0,0001–0,001), og etter ~40 kall kom HTTP 429 (T).
  Jf. `publiseringslandskapet.md`: nøkkel og bruksbasert pris fra 2026. Brukes best som kontroll, ikke hovedkilde.

### 2c. Andre kilder (ikke testet i dybden)

- **DiVA** (https://www.diva-portal.org): felles arkiv for de fleste mindre lærestedene (JU, Örebro, Karlstad, LNU, Umeå,
  UU, SU, LiU). `robots.txt` krever 10 s mellom kall og forbyr `resultList.jsf`; SwePub høster DiVA uansett, så vi trenger
  den ikke (T for robots.txt, 7.10.2026).
- **Lærestedenes egne CRIS:** GUP (GU), LUCRIS/Pure (LU), SSEs forskningsportal. Samme data som i SwePub.
- **Scopus/Web of Science:** lisens; ikke brukt. Vetenskapsrådets bibliometriske indikator for ressursfordelingen bygger
  på WoS og publiseres bare per lærosete (se `publiseringslandskapet.md`, Norden-avsnittet).
- **Norsk nivå for svenske artikler:** NVAs åpne kanal-API (`publication-channels-v2/serial-publication?query={ISSN}&year=`)
  gir Kanalregisterets nivå for svenske ISSN også. Vi slo opp 901 ISSN som ikke fantes i de norske NVA-filene (T):
  610 nivå 1, 126 nivå 2, 48 ikke tildelt, 29 nivå 0, 88 ikke funnet.

## 3. Nevner

| Kilde | Nivå | Innhold | Vurdering |
|---|---|---|---|
| UKÄ statistikk-API `https://statistik-api.uka.se/api/totals/56` (T) | Lærosete × forskningsfaggruppe × stillingskategori, heltidsekvivalenter, 2001–2025 | Forskande och undervisande personal: professorer, lektorer, adjunkter, meriteringsanställningar, annan forskande/undervisande | Beste offentlige kilde. Men faggruppen «Ekonomi och näringsliv» (SSIF 502) er ikke det samme som fakultetet |
| UKÄ `.../totals/139` (T) | Samme oppdeling | Doktorander (helårsekvivalenter) etter finansieringsform | Gir noe som ligner UN2-delen |
| Skolenes egne nøkkeltall (V) | Fakultet/skole | GU og LUSEM publiserer personal per kategori | Bra, men ulike definisjoner (personer eller årsverk) |
| SCB PxWeb `UF0202` (T) | Lærosete | Ikke oppdatert siden 2011 | Ubrukelig |

Lenker til tabellene: https://www.uka.se/statistik-och-analys/hogskolan-i-siffror/personal (V). Statistikkbeskrivelse:
SCB/UKÄ SM UF 23 SM 2601 (personal 2025),
https://www.uka.se/download/18.34adeb5019eb493fd0221b/1781265782236/personal-SM_UF23SM2601.pdf (V: 42 faggrupper,
koding etter SSIF siden 2012, oktober som målemåned).

**Tall vi fant:**
- **SSE** (UKÄ, hele institusjonen, heltidsekvivalenter): forskande och undervisande 128,8 (2023), 140,7 (2024), 141,9 (2025),
  snitt 137,1. Doktorander 133,4 / 112,5 / 118,1 (snitt 121,3), de fleste på stipend og ikke ansatt (T).
- **LUSEM 2025/26** (årsverk): professorer 33,6, universitetslektorer 91,1, adjunkter 16,7, «tenure track» 14,5, annen
  forskende/undervisende 15,9 (= 171,8), doktorander 58,3 (V, lusem.lu.se/about).
- **GU Handelshögskolan 2025** (personer, snitt): professorer 69, lektorer 127, biträdande lektorer 9, postdoktorer 10,
  adjunkter 17, forskere 21 (= 253), doktorander 73 (V, fakta-siden). Inkluderer jus; GU har 58,8 årsverk i faggruppen
  Juridik (UKÄ 2025), så uten jus er anslaget ~194.
- **UKÄ «Ekonomi och näringsliv», forskande och undervisande, snitt 2023–2025 (T):** SSE 136,5; LU 143,5; GU 129,3;
  SU 133,0; UU 97,8; LNU 95,2; Umeå 88,2; JU 76,1; Mälardalen 58,7; LiU 56,6; Södertörn 46,1; Örebro 45,8; Karlstad 45,5;
  LTU 37,5; Kristianstad 30,7; Mittuniversitetet 21,8. **NB:** GU og LU har langt flere ansatte i handelshøyskolen enn
  dette (GU 253 personer, LUSEM 171,8 årsverk), fordi statistikk, jus, økonomisk historie og informatikk kodes i andre
  faggrupper. Tallet er derfor et undergrense-anslag for nevneren, og raten per årsverk blir et overgrense-anslag.
  JIBS oppgis med 113 akademisk ansatte på Wikipedia (år ukjent, D), mot 76 i UKÄ.

**Hvordan det passer med de norske nevnerne:** «forskande och undervisande personal» ≈ NHHs nevner (UN1 + postdoktorer,
`utenStip`). Legger vi til doktorander, nærmer vi oss HK-dirs UN1 + UN2 (`uff`), men svenske doktorander er ofte ikke
ansatt (SSE: ~85 av 118 på stipend), så summen er ikke helt den samme som norske stipendiater.

## 4. Foreløpig publiseringsbilde (anslag)

**Metode:** SwePub, fagfellevurderte tidsskriftartikler 2023–2025, hel telling (en artikkel teller én gang for enheten
uansett antall medforfattere), duplikater fjernet på DOI. Koblet på ISSN/eISSN mot `abdc.csv`, `ft50.csv` (2026-lista),
`utd24.csv` og lokal `ajg2024.csv` (AJG 2024 brukt bakover). Norske tall er regnet på samme måte fra
`data/rangering/nva/` (alle artikler i NVA, ikke bare NVI-rapporterte). Det gjenskaper §45 i `status-og-metode.md`
(BI 16,1 og NHH 15,7 mot 15,5 AJG 4/4* per 100 UN1+UN2-årsverk); NTNU avviker (5,3 her mot 8,1 i §45), trolig fordi
filene våre for NTNU har en annen avgrensning enn byggeskriptet bruker.

### 4a. Artikler per år, snitt 2023–2025

| Enhet | Artikler | FT50/UTD24 | ABDC A* | ABDC A*/A | AJG 4/4* | AJG 3+ | Andel i AJG |
|---|---:|---:|---:|---:|---:|---:|---:|
| SSE | 218 | 24,0 | 58,0 | 116,7 | 41,0 | 105,7 | 65 % |
| LUSEM (6 institutter) | 296 | 6,7 | 31,7 | 85,7 | 22,7 | 66,0 | 36 % |
| LUSEM kjerne (FEK + NEK) | 154 | 6,0 | 25,3 | 60,3 | 17,3 | 49,7 | 50 % |
| JIBS | 159 | 11,0 | 22,7 | 70,7 | 18,3 | 61,3 | 64 % |
| GU HH (med jus) | 294 | 3,0 | 30,3 | 84,3 | 14,0 | 67,3 | 41 % |
| GU HH uten jus | 236 | 3,0 | 30,3 | 83,7 | 14,0 | 67,0 | 51 % |
| SU (SBS + NEK/IIES) | 71 | 6,3 | 22,7 | 39,3 | 13,3 | 35,3 | 68 % |
| LNU Ekonomihögskolan | 166 | 1,0 | 16,3 | 57,3 | 7,3 | 32,0 | 47 % |
| UU (FEK + NEK) | 81 | 2,0 | 13,3 | 33,0 | 5,7 | 29,0 | 53 % |
| Örebro HH | 113 | 1,0 | 7,3 | 29,3 | 4,3 | 18,0 | 38 % |
| Karlstad HH | 74 | 0,0 | 3,0 | 14,3 | 4,3 | 10,3 | 30 % |
| USBE (Umeå) | 143 | 1,7 | 10,7 | 46,7 | 2,3 | 31,0 | 42 % |
| LiU (FEK + NEK) | 85 | 0,0 | 8,0 | 33,3 | 2,3 | 24,0 | 57 % |
| *Norge, samme metode:* NHH | 208 | 18,7 | 68,3 | 116,3 | 45,0 | 102,0 | – |
| BI | 338 | 25,7 | 79,0 | 159,0 | 67,0 | 132,3 | – |
| UiS | 92 | 2,7 | 13,0 | 34,3 | 9,7 | 30,7 | – |
| HH NMBU | 68 | 0,0 | 6,0 | 23,0 | 2,0 | 14,7 | – |

SU-raden er summen av to delmengder (overlapp ikke trukket fra). FT50/UTD24 hos JIBS er særlig Entrepreneurship Theory
and Practice, Journal of Management Studies, Research Policy og Journal of Business Venturing; hos SSE Journal of Finance,
Management Science, Review of Financial Studies og Journal of Financial Economics (T, stikkprøve).

### 4b. Per 100 faglige årsverk og år (topp 5 og resten)

Nevner = forskande och undervisande personal (≈ NHHs nevner uten stipendiater). Norske tall med `utenStip` fra DBH.

| Plass (anslag) | Enhet | AJG 4/4* | FT50/UTD24 | ABDC A* | Nevner | Kvalitet på nevner |
|---|---|---:|---:|---:|---:|---|
| 1 | SSE | **29,9** | 17,5 | 42,3 | 137 | god (UKÄ, hele institusjonen) |
| 2 | JIBS | 24,1 (16,2 med 113 ansatte) | 14,5 (9,7) | 29,8 | 76 (113?) | svak (UKÄ faggruppe) |
| 3 | LUSEM | 13,2 | 3,9 | 18,4 | 172 | god (LUSEM selv) |
| 4 | SU (SBS + NEK) | 10,0 | 4,8 | 17,0 | 133 | svak |
| 5 | Örebro HH / Karlstad HH | 9,5 / 9,5 | 2,2 / 0 | 16,0 / 6,6 | 46 / 46 | svak, små tall |
| – | LNU | 7,7 | 1,1 | 17,2 | 95 | svak |
| – | GU HH uten jus | 7,2 | 1,5 | 15,6 | ~194 | middels (personer, jus trukket fra) |
| – | UU | 5,8 | 2,0 | 13,6 | 98 | svak |
| – | GU HH med jus | 5,5 | 1,2 | 12,0 | 253 | middels (personer) |
| – | LiU | 4,1 | 0 | 14,1 | 57 | svak |
| – | USBE | 2,6 | 1,9 | 12,1 | 88 | svak (statistikk ikke i nevneren) |
| *ref.* | NHH | 22,1 | 9,2 | 33,5 | 204 | DBH |
| *ref.* | BI | 18,9 | 7,2 | 22,3 | 355 | DBH |
| *ref.* | UiS | 16,4 | 4,5 | 22,0 | 59 | DBH |
| *ref.* | UiA | 9,6 | 1,4 | 15,4 | 69 | DBH |
| *ref.* | HH NMBU | 4,1 | 0 | 12,4 | 48 | DBH |

Med doktorander i nevneren (≈ HK-dirs UN1 + UN2): SSE 15,9, LUSEM 9,9 og GU HH 4,3 AJG 4/4* per 100 årsverk, mot NHH 15,7,
BI 16,1, UiS 12,0 og HH NMBU 3,1.

### 4c. Norsk nivå og «artikkelpoeng» (grovt anslag)

Nivå fra Kanalregisteret (2024-nivå for alle år, slått opp på ISSN), poeng = 1 eller 3 × √(enhetens forfattere / alle
forfattere), **uten** faktor 1,3 for internasjonalt samarbeid og bare for artikler (ikke bøker/kapitler). Norske enheter
regnet på samme måte fra NVA. Per år, snitt 2023–2025:

| Enhet | Artikler på nivå 1/2 | Nivå 2-andel | Artikkelpoeng | Per faglig årsverk |
|---|---:|---:|---:|---:|
| SSE | 170 | 46 % | 217 | 1,58 |
| LUSEM | 200 | 37 % | 235 | 1,37 |
| JIBS | 129 | 30 % | 135 | 1,77 (1,19 med 113) |
| GU HH (med jus) | 212 | 29 % | 235 | 0,93 |
| USBE | 114 | 22 % | 100 | 1,14 |
| Örebro HH | 79 | 22 % | 78 | 1,70 |
| LNU | 104 | 17 % | 88 | 0,93 |
| UU | 62 | 41 % | 76 | 0,78 |
| *NHH* | – | 41 % | 252 | 1,24 |
| *BI* | – | 40 % | 381 | 1,07 |
| *UiS / UiA* | – | 33 % / 24 % | 96 / 110 | 1,63 / 1,60 |
| *HH NMBU* | – | 15 % | 55 | 1,14 |

Dette er ikke publiseringspoeng i NVI-forstand og skal ikke vises som det. Det viser bare at volumet per hode i Sverige er
på samme nivå som i Norge, og at nivå 2-andelen følger det samme mønsteret som toppublikasjonene.

### 4d. Forbehold

1. Hel telling: store medforfatterskap mellom svenske lærested telles hos alle.
2. Enhetsavgrensningen er gjort med tekstmønstre (står i arbeidsnotatet; se §5 for hvor de bør ligge). Lund og LNU har
   størst risiko for å bomme. SU-økonomene ser underregistrert ut.
3. Nevnerne er av ulik kvalitet (se tabellen). JIBS-, Örebro- og Karlstad-ratene kan være 30–50 % for høye.
4. AJG 2024 og ABDC 2025 er brukt for alle år; FT50 er 2026-lista.
5. «Fagfellevurdert» i SwePub settes av lærestedet og er ikke det samme som NVI-godkjent kanal.
6. Ingen av tallene er kontrollert mot skolenes egne forskningsrapporter. SSE og LUSEM publiserer slike og bør brukes til
   kvalitetssikring, slik NHH-rapporten brukes for Norge.

## 5. Plan: slik kan Sverige legges inn i modellen

1. **`skoler.json`:** nye rader med `land: "SE"`, `referanse` som i dag, og en `swepub`-blokk i stedet for `nva`/`dbh`:
   `{"org": "gu", "domene": "gu.se", "enhetsmonster": [...], "gamleNavn": {...}, "kontroll2024": n}`, samt
   `uka: {"universitet": 10, "faggruppe": "Ekonomi och näringsliv"}` og `nevner: {"kilde": "...", "tall": {...},
   "kvalitet": "god|middels|svak"}`. Akkrediteringer i samme format som i dag.
2. **Nytt skript `scripts/fetch-swepub-artikler.py`:** ett kall per lærosete og år (ref + journal-article), filtrer på
   enhetsmønsteret og skriv `data/rangering/swepub/<skole>/<år>.json` **i samme format som NVA-filene** (tittel, tidsskrift,
   issn, eissn, niva, nvi: null, forfattere, egne, intl). Nivå hentes fra NVAs kanal-API per ISSN og år (cache).
   `intl` kan anslås fra fritekst-tilknytningen (land) eller DOI-oppslag i OpenAlex/Crossref.
3. **Byggeskriptet:** les svenske filer der NVA-filer mangler. Da virker lister, lagdelt forskning, AJG-sammenligning og
   «Tidsskriftene bak Topp» uten nye regler. Mål som bygger på DBH/HK-dir (publiseringspoeng fra 373/374, nivå 2-andel
   etter HK-dir, studentmål) får «mangler» for svenske enheter, og vekten fordeles på resten (som i dag).
4. **Egen visning først:** en «Norden (eksperimentell)»-fane eller et filter `land=no,se` i Forskningslab/AJG-sammenligning,
   ikke i hovedrangeringen. Hovedrangeringen bør holde seg norsk til nevner og utdanning er avklart.
5. **Nevner:** bruk skolenes egne årsverkstall der de finnes (SSE via UKÄ, LUSEM, GU), og UKÄ-faggruppen som merket anslag
   for resten. Be skolene om årsverk per fakultet (ofte i årsredovisningen) før noe publiseres.
6. **Kvalitetssikring:** legg SSE- og LUSEM-tall fra egne rapporter inn i `kontroll/eksterne-tall.json`; kryss-sjekk
   artikkeltallene mot OpenAlex-institusjons-ID for de rene skolene (SSE, JIBS via `raw_affiliation_strings`).
7. **Rekkefølge:** SSE, JIBS, LUSEM og GU først (akkrediterte og med brukbar nevner), deretter Umeå, Örebro, LNU, Karlstad,
   til slutt SU/UU/LiU som referanser.

**Det som ikke blir sammenlignbart med Norge:**
- Publiseringspoeng og NVI: Sverige har ingen nasjonal kanalliste eller poengindikator. Norsk nivå kan legges på svenske
  ISSN, men det blir vår konstruksjon, uten NVI-kontroll, uten 1,3-faktor (med mindre vi anslår den) og uten bøker/kapitler.
- Nevner: UKÄ har ikke UN1/UN2 eller fakultetsnivå. Svenske doktorander er ofte stipendiater uten ansettelse.
- Utdanning: ingen DBH, ingen Studiebarometer, andre opptakssystemer (UHR/antagning.se). Ikke utforsket.
- Kvalitetssikring mot HK-dir og NHH Research Report finnes ikke for svenske enheter.
- Registreringspraksis: hvor godt en enhet treffes avhenger av CRIS-et (DiVA, GUP, Pure), ikke av forskningen.

## Arbeidsnotat (reproduksjon)

Rådata og skript ligger i økas midlertidige mappe, ikke i repoet: SwePub-svar for `hhs, hj, oru, kau, lnu, umu, liu, gu,
su, uu, lu` 2021–2025, analyseskript med enhetsmønstrene, UKÄ-uttrekk og NVA-nivåoppslag. Mønstrene er gjengitt i §1–2
og bør legges i `skoler.json` når planen gjennomføres. Ingen filer i repoet er endret utenom denne.
