# Nevner for Danmark: VIP-årsverk 2016–2025 for handelshøyskoler og økonomimiljøer

Utforsket 18. oktober 2026 (én agent, ingen kodeendringer, ingenting committet). Bygger videre på `norden-danmark.md` §3.
Tallene ligger i `data/rangering/norden/nevner/danmark.csv` (452 rader, semikolon, UTF-8).

Merker: **V** = tallet er sett og lest av meg i primærkilden, **T** = hentet maskinelt fra fil/API (Excel, PDF-tekst, HTML-tabell, OAI-PMH),
**D** = bare omtalt (annonse, nettside uten dato, sekundærkilde), **A** = avledet eller anslått av meg (alltid merket i CSV-en).
Alle tall i tabellene under er T med mindre noe annet står.

## Kortversjon

- **Dekning 2016–2025 med god kvalitet finnes bare på fakultets- eller institusjonsnivå.** Instituttnivå (ECON, MGMT, BTECH,
  Økonomisk Institut, SDU Business School, AAU Business School, ISE) finnes fortsatt **ikke** åpent som årsverk.
- **Nøgletal C fra Danske Universiteter dekker alle seks universiteter × hovedområde for hele 2016–2025.** Det var det
  forrige notat manglet: 2016–2020 ligger i arkivfilen `tabel-c.xlsx` fra juni 2021 (2007–2020), og 2021–2025 i
  `tabel-c-personale-universiteter.xlsx` fra juni 2026. Dette er øvre ramme for SDU, AAU, RUC og KU, og eksakt for CBS og Aarhus BSS.
- **Beste kilde per enhet:**

| Enhet | Beste kilde | Nivå | År | Kategorier | Kvalitet |
|---|---|---|---|---|---|
| dk_cbs | CBS årsrapporter (rauli.cbs.dk-arkivet + 2025-rapporten) | hele CBS | 2016–2025 | ph.d.; adjunkt+postdoc; professor+lektor (ikke hver for seg) | god (T) |
| dk_aarhus | AU i tal, tabell F1A (årsverk) og F1B (hoder) | fakultet Aarhus BSS (inkl. statskundskab, psykologi, jus) | 2016–2025 | professor, lektor, adjunkt, postdoc, ph.d., annen VIP | god, helt komplett (T) |
| dk_aarhus_oeb / dk_aarhus_econ | ingen; bare annonse-/nettsidetall | institutt | ca. 2026 | – | svak (D) |
| dk_sdu | nøgletal C, SAMF | fakultet (Samf.fak. inkl. jus, statskundskab, økonomi, business) | 2016–2025 | bare VIP totalt | øvre ramme (T) |
| dk_aau | nøgletal C, SAMF | hovedområde SAMF | 2016–2025 | bare VIP totalt | øvre ramme (T) |
| dk_ruc | nøgletal C, SAMF (årsverk) + RUCs likestillingsmonitorering (hoder per kategori) | SAMF / hele RUC | årsverk 2016–2025, kategorier 2018–2025 | hele RUC: professor, lektor, adjunkt, postdoc, ph.d. | øvre ramme (T) |
| dk_ku | KU økonominøgletal (SAMF uten jus) og nøgletal C | fakultet SAMF | 2016–2025 | bare VIP totalt | øvre ramme (T) |

- **Pure-hodetall er ikke brukbare** som VIP-nevner (se egen del): ingen stillingskategori i feeden, og tallet er 1,5–1,7 ganger
  (CBS) og 2,3–2,6 ganger (RUC) høyere enn VIP-årsverk. Forholdet er rimelig stabilt innen én institusjon over noen år, men
  driver 10–15 % over tid, så det er heller ikke en god indeks.
- **Anbefaling:** regn Aarhus BSS (dk_aarhus) og CBS (dk_cbs) på årsverk, begge med og uten ph.d.-stipendiater. Vis SDU, AAU, RUC og
  KU som «per 100 årsverk i hele samfunnsvitenskapsfakultetet» med tydelig merknad (øvre ramme, ikke handelshøyskolen alene)
  eller bare med antall. For instituttnivå må noen spørre AU, SDU, AAU, KU og RUC om VIP-årsverk per institutt (se «Hva mangler»).

## 1. Danske Universiteters nøgletal C (spor 3, den viktigste nye kilden)

- URL 2021–2025: https://dkuni.dk/wp-content/uploads/2026/06/tabel-c-personale-universiteter.xlsx (T)
- URL 2007–2020 (arkiv): https://dkuni.dk/wp-content/uploads/2021/06/tabel-c.xlsx (T)
- Oppslagsside: https://dkuni.dk/det-statistiske-beredskab/ og https://dkuni.dk/det-statistiske-beredskab-arkiv/
- Definisjon (jf. forrige notat, definisjonsmanual 2025): VIP = professor, lektor, adjunkt, postdoc, ph.d.-stipendiat, forsker,
  videnskabelig assistent m.fl.; DVIP og TAP (dekan, institutleder) er utenfor. Formålsfordelte årsverk, 1 924 timer per årsverk.
  Hver fane (KU, AU, SDU, RUC, AAU, DTU, CBS, ITU) har VIP × formål × hovedområde. Jeg summerer formålene per hovedområde.
- Kontroll: AU sitt hovedområde SAMF er identisk med Aarhus BSS i AU i tal (827,7 mot 828, 777,8 mot 778 osv.). CBS totalt
  stemmer med årsrapportene (601,9 mot 602 i 2016, 653,6 mot 654 i 2020). KUs SAMF + JUR i nøgletal C = SAMF + JUR i KUs egne
  økonominøgletal (2025: 401 + 166 = 567; dkuni 566,6).

VIP-årsverk (nøgletal C), hovedområde Samfundsvidenskab; CBS = hele institusjonen:

| År | CBS (hele) | AU SAMF = Aarhus BSS | SDU SAMF | AAU SAMF | RUC SAMF | KU SAMF + jus | KU SAMF (ekskl. jus, KUs egne PDF-er) |
|---|---|---|---|---|---|---|---|
| 2016 | 601,9 | 728,2 | 360,8 | 298,1 | 143,7 | 515,0 | 374 |
| 2017 | 565,3 | 713,0 | 330,3 | 314,6 | 135,4 | 488,5 | 359,5 |
| 2018 | 587,7 | 731,0 | 329,0 | 323,8 | 142,0 | 481,6 | 351,6 |
| 2019 | 611,9 | 772,0 | 340,8 | 307,2 | 180,9 | 486,1 | 346,4 |
| 2020 | 653,6 | 801,1 | 321,8 | 268,3 | 173,3 | 503,6 | 365,6 |
| 2021 | 690,7 | 827,7 | 317,1 | 285,8 | 161,4 | 535,9 | 381 |
| 2022 | 711,9 | 825,5 | 317,4 | 275,1 | 167,7 | 555,1 | 382 |
| 2023 | 698,8 | 777,8 | 308,2 | 278,7 | 160,0 | 573,5 | 401 |
| 2024 | 660,0 | 744,5 | 300,4 | 257,1 | 188,1 | 583,2 | 411 |
| 2025 | 669,2 | 734,0 | 308,5 | 261,8 | 201,8 | 566,6 | 401 |

Hva hovedområde SAMF dekker er ikke åpent definert per universitet:
- SDU SAMF og AAU SAMF omfatter også jus, statskundskab/politikk, sosiologi osv. SDU Business School er en del av Det
  Samfundsvidenskabelige Fakultet. Fra 1.9.2026 deles fakultetet i «SDU Business School» og «Det Samfundsvidenskabelige
  Fakultet med jura, statskundskab og økonomi» (SDU årsrapport 2025). Fra da blir det naturlig å be om egne tall.
- RUCs SAMF-årsverk (201,8 i 2025) er mindre enn ISEs Pure-hodetall (368) skulle tilsi. Trolig ligger deler av ISE-ansatte
  under andre hovedområder, eller ISE har mange ikke-VIP i Pure. SAMF er derfor bare en grov proxy for ISE.
- Ph.d.-stipendiater: nøgletal C skiller ikke ut ph.d. Tabell I (indskrevne ph.d.-studerende per hovedområde, hoder) ligger i
  CSV-en som `phd_indskrevne`, men **den kan ikke trekkes fra VIP-årsverk**: den teller alle innskrevne, også eksternt
  finansierte og erhvervs-ph.d. Ved CBS 2016: 192 innskrevne mot 82 ansatte ph.d.-årsverk. Ved Aarhus BSS: 222 mot 181.

Tabell I: https://dkuni.dk/wp-content/uploads/2026/06/tabel-i-forskeruddannelse-universiteter.xlsx (T).

## 2. Universitetenes egne tall (spor 1)

### 2.1 Aarhus BSS: AU i tal (komplett 2016–2025, per stillingskategori)

Tabell F1A (årsverk) og F1B (ansatte ultimo året). Fakultetet har seks institutter (ECON, MGMT, BTECH, statskundskab, psykologi, jus).
**Det finnes ingen tabell per institutt i AU i tal**, heller ikke i det historiske arkivet (utgavene fra 2015 og 2016–2025 gjennomgått: bare fakultet ×
kategori, plus alder og kjønn per kategori).

Kilder (alle åpne):
- 2016: https://auhist.au.dk/historiske-noegletal/arkiv-for-au-i-tal/au-i-tal-2016/noegletal-om-personale (HTML-tabell, heltall)
- 2017: https://auhist.au.dk/fileadmin/www.au.dk/AU_i_tal/AU_i_tal_2017/F1A._Medarbejdere_fordelt_paa_fakulteter_og_stillingskategorier_i_2017__aarsvaerk_.xlsx
- 2018: https://auhist.au.dk/fileadmin/www.auhist.au.dk/AU_i_tal/AU_i_tal_2018_-_DK_final_06112019.pdf
- 2019: …/AU_i_tal_2019_DK_-_juli_2020.pdf, 2020: …/AU_i_tal_2020_DK/AU_i_tal_2020_-_DK_Final_010721.pdf,
  2021: …/AU_i_tal_2021_DK/AU_i_tal_2021_-_DK_FINAL_270622.pdf, 2022: …/AU_i_tal_2022_DK/AU_i_tal_2022_DK_130623.pdf,
  2023: …/AU_i_tal_2023_DK/AU_i_tal_2023_DK_270624.pdf (alle under https://auhist.au.dk/fileadmin/www.auhist.au.dk/AU_i_tal/)
- 2024 og 2025: Excel per tabell, `F1A…`/`F1B…` under …/AU_i_tal_2024/ og …/AU_i_tal_2025/ (full liste på
  https://auhist.au.dk/historiske-noegletal/arkiv-for-au-i-tal/au-i-tal-2025)

Aarhus BSS, årsverk (lektor = lektor/seniorforsker/seniorrådgiver, adjunkt = adjunkt/tenure-adjunkt, anden = annen VIP):

| År | Prof. | Lektor | Adj. | Postdoc | Ph.d. | Annen | **VIP i alt** | VIP uten ph.d. (A) | VIP-hoder ultimo |
|---|---|---|---|---|---|---|---|---|---|
| 2016 | 141 | 193 | 83 | 51 | 181 | 79 | **728** | 547 | 769 |
| 2017 | 141,2 | 190,7 | 85,5 | 48,9 | 176,8 | 70,6 | **713,7** | 536,9 | 787 |
| 2018 | 148 | 186 | 92 | 51 | 180 | 75 | **731** | 551 | 820 |
| 2019 | 156 | 189 | 96 | 63 | 182 | 86 | **772** | 590 | 848 |
| 2020 | 158 | 221 | 68* | 71 | 197 | 87 | **801** | 604 | 891 |
| 2021 | 161 | 210 | 91 | 76 | 197 | 92 | **828** | 631 | 918 |
| 2022 | 157 | 213 | 97 | 80 | 190 | 88 | **825** | 635 | 891 |
| 2023 | 152 | 200 | 88 | 82 | 181 | 74 | **778** | 597 | 819 |
| 2024 | 155,2 | 190,8 | 64,9 | 78,8 | 180,2 | 74,6 | **744,5** | 564,3 | 787 |
| 2025 | 147,5 | 187,7 | 71,5 | 82,3 | 176,0 | 69,1 | **734,0** | 558,0 | 800 |

*2020 og 2024–2025 ser ut til å ha en annen skille mellom adjunkt og lektor/postdoc enn 2019 og 2021; ikke avklart. PDF-årene 2018–2023
er avrundet til heltall. Faglige årsverk «uten stipendiater» = VIP i alt minus ansatt ph.d. (inkluderer «annen VIP»).

Merk at fakultetet er **hele Aarhus BSS** og dermed inneholder statskundskab, psykologi og jus. Tilsvarende NTNU Fakultet for
økonomi, ikke handelshøyskoledelen alene.

### 2.2 CBS: årsrapportene (2016–2025)

Totale VIP-årsverk: 602 (2016), 565, 588, 612, 654, 691 (687 i 2025-rapportens serie), 712, 699, 660, 669 (2025). Nøgletal C
gir 601,9 / 565,3 / 587,7 / 611,9 / 653,6 / 690,7 / 711,9 / 698,8 / 660,0 / 669,2, altså samme tall.

Kategorier står i figuren «Sammensætning af VIP-årsværk» (tallmerkene i PDF-ens tekstlag, plassering kontrollert). Figuren viser
tre grupper og utelater vitenskapelige assistenter og seniorrådgivere (ca. 40–70 årsverk):

| År | Ph.d. | Adjunkt + postdoc | Professor + lektor | Sum figur | VIP totalt | VIP uten ph.d. (A) |
|---|---|---|---|---|---|---|
| 2016 | 82 | 123 | 336 | 541 | 602 | 520 |
| 2017 | 77 | 106 | 324 | 507 | 565 | 488 |
| 2018 | 84 | 127 | 327 | 538 | 588 | 504 |
| 2019 | 100 | 138 | 338 | 576 | 612 | 512 |
| 2020 | 123 | 148 | 345 | 616 | 654 | 531 |
| 2021 | 121 | 156 | 363 | 640 | 691 | 570 |
| 2022 | 115 | 166 | 388 | 669 | 712 | 597 |
| 2023 | 101 | 175 | 383 | 659 | 699 | 598 |
| 2024 | 84 | 168 | 365 | 617 | 660 | 576 |
| 2025 | 89 | 164 | 366 | 619 | 669 | 580 |

URL-er: årsrapportene 2011–2020 og 2021–2023 ligger i CBS' Rauli-arkiv (https://rauli.cbs.dk/index.php/cbsber/issue/archive),
f.eks. 2016: https://rauli.cbs.dk/index.php/cbsber/article/download/5311/5875/20046, 2020: …/6273/6830/21865,
2022: …/7199/7480/23533. 2023–2025: https://www.cbs.dk/sites/default/files/2026-04/cbs-aarsrapport-2025-dansk.pdf (s. 41).
Per institutt (11 institutter) oppgir CBS ikke VIP i årsrapporten.

### 2.3 KU: økonominøgletal (SAMF uten jus, 2016–2025)

KU publiserer nøgletal C hvert år, med hovedområdene HUM, JUR, SCIENCE, SAMF, SUND, TEO:
https://om.ku.dk/tal-og-fakta/statistikberedskab/ (PDF per år). SAMF-kolonnen (VIP-årsverk): 374 (2016), 359,5, 351,6, 346,4, 365,6,
381, 382, 401, 411, 401 (2025). Dette er Det Samfundsvidenskabelige Fakultet (økonomi, statskundskab, sosiologi, antropologi,
sosial forskning), så **bare en øvre ramme** for Økonomisk Institut. Instituttet oppga «ca. 95 ansatte inkl. administrasjon» i en
annonse høsten 2022 (D). KUs side «Medarbejdere» har bare institusjonsnivå, og likestillingsgrafen der gir prosentandeler.

### 2.4 SDU, AAU, RUC, instituttsider (spor 1–2)

- **SDU:** Årsrapportene 2011–2025 (https://www.sdu.dk/en/om-sdu/strategi-politikker/aarsrapporter) har bare institusjonsnivå
  (4 337 årsverk totalt i 2025). `www.sdu.dk/en/om-sdu/noegletal` peker til Danske Universiteter og til sduanalytics@sdu.dk.
  Instituttet DBM (Institut for Virksomhedsledelse) beskrives med «ca. 120 ansatte» (D, udatert, instituttet opprettet 2021).
- **AAU:** https://www.en.aau.dk/about-aau/key-figures/staff har hele universitetet per kategori (FTE og hoder 2021–2025:
  professor 243→221, associate professor 639→633, assistant professor 169→169, postdoc 200→255, ph.d. 353→325 årsverk), samt FTE per hovedområde,
  der «Humanities and Social Sciences» (alle ansatte inkl. TAP) er 835, 805, 808, 751, 758 FTE 2021–2025. Ingen AAU Business School-linje,
  og business.aau.dk har ingen nøgletall. Bestyrelsesmateriale og årsrapport 2023 er sjekket uten treff.
- **RUC:** RUCs likestillingsmonitorering 2025 (https://ruc.dk/sites/default/files/2026-03/GEP%20noegletal%202025.pdf) har **hoder per
  stillingskategori for hele RUC** 31.12.2018–2025: professor 42→73, professor MSO 31→9, lektor/seniorforsker 204→222, adjunkt 40→24,
  postdoc 40→57, ph.d. 89→105, VIP totalt 446→490. Ingen institutt. Fører til at man kan beregne «uten ph.d.» for RUC som helhet (CSV). 
  Tilsvarende fil for 2023 (`Monitorering af RUCs nøgletal 2023.pdf`) returnerer en HTML-side, ikke PDF.
- **AU-instituttene:** MGMT oppgir «157 academic staff, 32 professors, 49 PhD students» (D, side revidert 17.3.2026;
  https://mgmt.au.dk/research/join-the-department). ECON: «ca. 140 vitenskapelig ansatte og 55 ph.d.» i annonser (D, udatert).
  BTECH: «nær 100» i annonser 2025–2026 (D; Wikipedia oppgir 225 inkl. deltid uten kilde). Summen MGMT 157 + ECON 140 + BTECH 100 er
  ca. 400 personer, men uvisst om ph.d. er med; Aarhus BSS-fakultetet har 787–800 VIP-hoder i 2024–2025.
- AU gjør likestillingstall for VIP tilgjengelig i Power BI-grafer på medarbejdere.au.dk, men sidene er fjernet fra åpen web
  (404; sist i Wayback 2021) og viser uansett bare kjønnsandeler.
- **Danmarks Statistik** (FoU-statistikk) er nasjonal per fagområde; ikke brukt.

## 3. Pure-personregisteret som hodetall-anslag (spor 4)

Undersøkt 18.10.2026 med 1 s pause og User-Agent «NMBU-sammenligning (studierådgiverne HH)». Råfiler (inneholder navn, ikke i rapport
eller CSV): `data/rangering/pure/raa-personer/cbs/` (33 sider, 3 242 personer, 4,9 MB) og `…/ruc/` (41 sider, 4 062 personer, 8,7 MB).
Mappen er gitignored.

**Hva feeden har.** Alle seks endepunkt har `fi-person` (set `persons:all`; sjekket på førsteside). CBS har i tillegg `oai_cerif_openaire`
(set `openaire_cris_persons`; de andre er ikke testet for dette formatet). `fi-person` har navn, e-post (ikke alle), og for hver tilknytning `started`, `ended`, `level1`–`level4`
og akronym. `oai_cerif_openaire` (CBS: 27 199 poster, mange eksterne) har bare organisasjon, ORCID og Scopus-ID. **Ingen stillingstittel,
jobbtype, ansettelsesgrad eller VIP/TAP-flagg i noen av formatene.** Pure Web Service-API-et (`/ws/api/…`) svarer 401 (krever nøkkel), og
portalsidene (`research.cbs.dk/en/persons/`, `pure.au.dk/portal/…`, `vbn.aau.dk/en/persons/`, `portal.findresearcher.sdu.dk/…`)
svarer 403 mot skript. Stillingstittel er derfor ikke tilgjengelig åpent. Antall personer: CBS 3 242, AU 64 250, AAU 40 660,
SDU 20 210, RUC 4 062, KU 57 655.

**Prøvetelling 1: CBS** (kjent VIP-årsverk). Personer med minst én tilknytning som er aktiv 31.12.:

| År | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|---|
| Pure-personer | 899 | 949 | 975 | 1 040 | 1 060 | 1 087 | 1 090 | 1 078 | 1 084 | 1 071 |
| VIP-årsverk | 602 | 565 | 588 | 612 | 654 | 691 | 712 | 699 | 660 | 669 |
| Forhold | 1,49 | 1,68 | 1,66 | 1,70 | 1,62 | 1,57 | 1,53 | 1,54 | 1,64 | 1,60 |

Pure gir 50–70 % flere personer enn VIP-årsverk (registeret har også TAP-forskere, ph.d.-studenter uten ansettelse, forskningsassistenter,
emeriti og eksterne). Forholdet svinger 1,49–1,70, og tidlige år er nok underdekket fordi personer som har sluttet kan være fjernet.
Retningen følger ikke alltid VIP-årsverk (i 2017 faller årsverkene fra 602 til 565, men Pure stiger fra 899 til 949).

**Prøvetelling 2: RUC** (kjent: VIP-årsverk fra nøgletal C og hoder per kategori fra likestillingsmonitoreringen). Pure-personer 2025: 1 156
mot 490 VIP-hoder og ca. 498 VIP-årsverk, altså 2,3–2,6 ganger. Institutt ISE i Pure: 268 (2016) → 368 (2025), 32 % av RUCs Pure-personer.
Et anslag for ISEs VIP-årsverk ved å fordele RUCs VIP-årsverk etter ISEs andel av Pure-personene gir 109 (2016) → 159 (2025). Det ligger i CSV-en som
`vip_estimat_ise` med kvalitet A og er **svært usikkert** (antar lik VIP-andel i alle institutter).

**Vurdering.** Pure-hodetall kan ikke gi stillingskategori og er ikke et nevner for «per 100 faglige årsverk» (feil nivå og feil enhet).
Brukbart er bare som fordelingsnøkkel for å dele et kjent institusjonstall mellom institutter, og da bare med stor usikkerhet. For AU
kunne det testes mot det kjente Aarhus BSS-tallet, men det krever høsting av 64 250 poster (ca. 640 sider), og vi har ingen fasit på
institutt å sjekke mot. Ikke gjort.

## 4. Hva mangler fortsatt, og hva kunne løst det

| Enhet | Mangler | Løsning |
|---|---|---|
| dk_aarhus_oeb, dk_aarhus_econ | VIP-årsverk (og hoder) per institutt og kategori, 2016–2025 | E-post til Aarhus BSS (dekanatet/HR) eller til enheten som utgir AU i tal (kontaktadressen står på auhist.au.dk). Tallene finnes i deres personaledatabase. Alternativt Pure-fordeling (se over) med fakultetsnevneren som kontrolltall |
| dk_sdu | Business School alene | sduanalytics@sdu.dk. Utskillelsen 1.9.2026 gjør at tall for «SDU Business School» trolig lages nå. |
| dk_aau | AAU Business School | analyse@adm.aau.dk (Finance Management Unit, «key figures»). |
| dk_ruc | ISE per kategori | RUCs HR/ledelsesinformasjon (monitoreringen har SLS-data for hele RUC; instituttfordeling er trolig lett å få) |
| dk_ku | Økonomisk Institut | KU Økonomi (oko-okonomi@adm.ku.dk) eller instituttets administrasjon. |
| dk_cbs | Hver kategori for seg og per institutt | CBS Analytics/HR; figuren i årsrapporten slår lektor/professor og adjunkt/postdoc sammen |
| Alle | Metode lik HK-dir (UN1 + UN2) | Be om «VIP-årsverk jf. nøgletal C-definisjonen» som standard. Forskjell fra HK-dir: DVIP ute, dekan og institutleder ute, vitenskapelige assistenter inne |

## 5. Tilleggsfunn

- Ph.d. «ansatt» i VIP-årsverk (AU, CBS) er mye lavere enn «indskrevne ph.d.» i tabell I. For «uten stipendiater» må man
  bruke AU i tal og CBS-figuren, ikke tabell I.
- Definisjonsbrudd i CBS: nøgletal C i 2021 gir 690,7, årsrapport 2021 gir 691 og årsrapport 2025 gir 687. Forskjellen er < 1 %, men 2025-serien
  er revidert noe.
- CBS 2020 oppgis som 654 i årsrapport 2020 og 650 i årsrapport 2022 (revidert). Nøgletal C 2020: 653,6.
- AU omstrukturerte fra fire til fem fakulteter fra 2020; Aarhus BSS er uendret.
- Hjelpefiler og skript ligger i økt-scratchpad (ikke i repoet), ingenting i repoet er endret utenom denne rapporten, CSV-en og
  de gitignorerte råfilene.
