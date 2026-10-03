# Etterprøving 4: akkrediteringer, internasjonale rangeringer, AJG-tall og eksterne kontrolltall

Kontrollert 03.10.2026. Ingen filer i prosjektet er endret utenom denne rapporten.

## Konklusjon

- **Én faktisk feil funnet:** BI sin EQUIS-akkreditering står med `aar: 2008` i `skoler.json`. Riktig er **1999**. BI skriver selv at skolen ble «first accredited by EQUIS back in 1999», og at 2026 er femte reakkreditering. Årsrapport 2019: «EQUIS accreditation since 1999». 2008 er året BI ble AACSB-medlem. Rettes til 1999.
- Alle andre akkrediteringer, alle kontrollerte rangeringer og alle 120 AJG-celler stemmer med kildene.
- **Merknaden om ABS 3 for 2022 er bekreftet og er sterkere enn det JSON-en sier.** Antallet (n) for alle 8 skoler i 2022 er identisk med 2020. Per-FTE-tallene for 2022 er derimot forskjellige og antyder helt andre antall. Se punkt 3.
- Eksterne kontrolltall: 9 av 10 tilfeldige rader stemmer med kilden. 1 rad kunne ikke verifiseres (se punkt 4).
- Mindre forbehold, ikke feil: UiA «reakkreditert 2023/2024» og USN sin EFMD-fornyelse er ikke bekreftet (se punkt 1).

## 1. Akkrediteringer

Kilder: AACSBs søk «Norway» (`aacsb.edu/accredited?countries=norway`, hentet 03.10.2026), EFMDs EQUIS-liste, EFMDs liste over akkrediterte programmer, AMBAs skolesider, skolenes egne sider.

| Spørsmål | Funn | Dom |
|---|---|---|
| **NMBU AACSB nov. 2025** | AACSBs pressemelding datert **3. november 2025**, «8 institutions earn AACSB initial business accreditation», nr. 7 på lista er «Norwegian University of Life Sciences (Norway)». NMBU-saken (`nmbu.no/en/node/57607`) er fra november 2025, med sitat fra rektor Sæbø og dekan Rasmussen. AACSBs Norge-søk gir 4 treff: BI, NHH, NMBU og UiA. | **Bekreftet** |
| **UiA AACSB** | `aacsb.edu/accredited/u/university-of-agder` har tittelen «AACSB Accredited» og ligger under `/accredited/`. UiAs egen nyhetsside (21.02.2019) gav 404 ved henting. Søketreff på samme side bekrefter 21. februar 2019. «Reakkreditert 2023/2024» fant jeg ingen kilde for. AACSB-profilen oppgir ikke år. | **UiA er akkreditert. 2019 er bekreftet via søketreff. Reakkreditering er ubekreftet** |
| **Nord, NTNU, OsloMet: bare medlemmer** | Verken Nord, NTNU eller OsloMet er blant de 4 Norge-treffene. Alle tre har profilsider under `/members/non-accredited-educational/…` hos AACSB, uten «AACSB Accredited» i tittelen. Den nordiske uttalelsen (bi.no, mars 2025) skrives «on behalf of Nordic business schools that are members of AACSB». | **Bekreftet** |
| **UiS: bare medlem** | UiS er ikke blant de 4 Norge-treffene, og står som underskriver av uttalelsen. Jeg fant ikke en medlemsprofil for UiS hos AACSB (URL-ene jeg gjettet gav 404). Medlemskapet hviler dermed på uttalelsen alene. | **Ikke akkreditert: bekreftet. Medlemskap: svakt belagt** |
| **EFMD programakkreditering UiS** | EFMDs programliste: «UiS School of Business and Law … Master in Economics and Business Administration», 5 år. UiS-saken er fra 21.04.2021 og kaller UiS første norske skole med EFMD Programme Accreditation. | **Bekreftet** |
| **EFMD programakkreditering USN** | EFMDs programliste: «USN School of Business … Bachelor in Business Administration (BSc)», 3 år. EFMD-bloggen 20.12.2022 melder «initial EFMD Programme Accreditation». Perioden er ikke oppgitt der. Står fortsatt på lista, men fornyelse i 2025 er ikke bekreftet. | **Bekreftet. Fornyelse ubekreftet, som merknaden allerede sier** |
| NHH EQUIS 2001, fornyet 2026 | nhh.no/accreditations: «EQUIS accredited since in 2001 … renewed for an additional 5 years in 2026». NHH og BI er de eneste norske på EQUIS-lista (begge «5 years»). | Bekreftet |
| NHH AACSB 2022 | nhh.no: «NHH received AACSB business accreditation in May 2022». AACSBs profil har tittelen «AACSB Accredited». | Bekreftet |
| NHH AMBA 2020 | nhh.no: første gang høsten 2020. AMBA-siden lister EMBA Seafood Management, Management Control og Strategic Management. | Bekreftet |
| BI AACSB 2014, AMBA 2013, EOCCS 2016 | bi.no: AACSB mai 2014 (besøk januar), AMBA november 2013, EOCCS 2016. AMBA-siden lister BI-Fudan MBA og BI EMBA. | Bekreftet |
| **BI EQUIS 2008** | bi.no: 1999. | **FEIL, rett til 1999** |

Merk om AACSBs katalog: NHH og NMBU har profil-URL under `/members/non-accredited-educational/`, selv om begge er akkreditert. NHH-profilen har tittelen «AACSB Accredited» og teksten «triple accredited». NMBU-profilen har ingen tittel og viser «Accreditation: Business», men datafeltet er fra undersøkelsesåret 2024-25. URL-stien kan altså ikke brukes som bevis for manglende akkreditering. For NMBU er pressemeldingen det sikre beviset. Kilde-URL-en i JSON for NHH (`/members/non-accredited-educational/n/nhh-…`) bør byttes til pressesaken eller nhh.no, siden stien ser ut som «ikke akkreditert».

## 2. Internasjonale rangeringer

Rangeringsdataene ble lest direkte fra FT sine tabellsider (rankings.ft.com/rankings/3042, 3047, 3045) og fra ShanghaiRankings sidedata (`payload.js` for GRAS 2026/2025).

| Rangering | Påstand i JSON | Funn | Dom |
|---|---|---|---|
| FT European Business Schools 2025 | BI 40, NHH 51 | FT-tabell: BI 40, NHH 51. BI-sak: 42 og 53 året før. | Stemmer |
| FT Masters in Management 2026 | BI 81, NHH 88 | FT-tabell: BI 81, NHH 88. NHH-saker: NHH 83 i 2025. BI 88 i 2025 stemmer (NHH-saken sept. 2025). | Stemmer |
| GRAS 2026 Business Administration, BI | 50 | 50 (2025: 30) | Stemmer |
| Tilfeldig 1: FT Masters in Finance (pre-experience) 2026, BI | 61 | FT-tabell: 61 | Stemmer |
| Tilfeldig 2: GRAS 2026 Economics (NHH 101-150, BI 201-300, NTNU 201-300, NMBU 401-500, UiB 401-500, UiO 201-300, UiS 301-400) | som oppgitt | Alle 2026-plasseringer stemmer. 2025-kolonnen stemmer også (NMBU ikke med i 2025). | Stemmer |
| Tilfeldig 3: GRAS 2026 Management (NTNU 76-100, BI 151-200, UiS 151-200, NHH 301-400, UiB 301-400) | som oppgitt | Alle stemmer | Stemmer |
| Tilfeldig 4: GRAS 2026 Business Administration, øvrige (UiA 201-300, UiS 201-300, NHH 301-400, NTNU 301-400, USN 301-400; 2025: UiA 101-150, NTNU 201-300) | som oppgitt | Alle stemmer | Stemmer |
| Tilfeldig 5: GRAS 2026 Finance (BI 101-150, NHH 151-200) og Hospitality (UiT 76-100) | som oppgitt | Stemmer | Stemmer |

Merk: GRAS-tallene gjelder hele institusjonen. JSON-en sier dette allerede i feltet `niva`. FT-tallene er verifisert mot FT sin egen side, ikke bare mot skolenes pressesaker.

## 3. AJG fra NHH-rapporten (PDF side 17, 18 og 34)

Metode: `/usr/local/bin/python3` med pypdf. Tabell 4 (side 17), tabell 5 (side 18) og tabell 31 (side 34) er parset linje for linje og sammenlignet med `ajg-nhh-rapport.json`.

- **8 skoler × 5 år × 3 nivåer = 120 celler. 0 avvik** (både n og perFte). Sidehenvisningene 17, 18 og 34 stemmer. Alle 8 skoler er med.
- **Merknaden om ABS 3 for 2022 stemmer, og den er alvorligere enn «lik 2020».** Alle 8 skolers ABS 3-antall for 2022 er identisk med 2020 (NHH 47/47, BI 45/45, NMBU 9/9, Nord 3/3, NTNU 39/39, UiA 14/14, UiS 8/8, UiT 0/0). Per-FTE-tallene for 2022 er derimot ulike fra 2020. Jeg regnet ut implisitt FTE (n / perFte) i tabell 31, 32 (ABS 2) og 33 (ABS 1). ABS 2 og ABS 1 gir samme FTE for alle år, men ABS 3 i 2022 avviker kraftig:

  | Skole | FTE fra ABS 2 (2022) | FTE fra ABS 3 (2022) | n ABS 3 i rapporten | n ABS 3 ved FTE fra ABS 2 (omtrent) |
  |---|---|---|---|---|
  | NHH | 200 | 247 | 47 | 38 |
  | BI | 329 | 265 | 45 | 56 |
  | NMBU | 42 | 22 | 9 | 17 |
  | Nord | 133 | 25 | 3 | 16 |
  | NTNU | 44 | 35 | 39 | 49 |
  | UiA | 69 | 19 | 14 | 50 |
  | UiS | 64 | 73 | 8 | 7 |

  Det mest sannsynlige er at **antallene i 2022 er kopiert fra 2020 (feil i rapporten), mens per-FTE-tallene er riktige**. For UiA gir 14 stykker en implisitt FTE på 19, mot 62–73 i alle andre år. 2020, 2021, 2023 og 2024 er konsistente. Anbefaling: bruk perFte for ABS 3 i 2022 med merknad, vis ikke n for 2022, og la `usikker` stå på 2022 for nivå 3. Rapporten for 2025 (styreinnkallingen 16.06.2026) har ingen nasjonal ABS 3-tabell, så det finnes ingen rettet versjon der.

## 4. Eksterne kontrolltall (10 tilfeldige rader av 1004, seed 20261003 pluss 1 erstatning)

| # | Rad | Kilde sjekket | Funn | Dom |
|---|---|---|---|---|
| 28 | NTNU 2024 poeng/faglig 1,26 | HK-dir V15.1, via API | 2024-kolonnen NTNU = 1,26 | Stemmer |
| 5 | Nord 2021 poeng/faglig 1,02 | HK-dir V15.1 | NU 2021 = 1,02 | Stemmer |
| 146 | Nord 2022 publiseringspoeng 755,7 | HK-dir V15.2 | NU 2022 = 755,7 | Stemmer |
| 295 | NMBU 2021 nivå 2-andel 24,6 | HK-dir V15.3 | NMBU 2021 = 24,6 | Stemmer |
| 346 | UiS 2022 nivå 2-andel 24,0 | HK-dir V15.3 | UiS 2022 = 24,0 | Stemmer |
| 624 | UiA 2022 NHH tabell 15 = 2,12, side 189 | NHH-styreinnkalling 16.06.2026, PDF side 189 | Table 15, UiA 2022 = 2.12. Side stemmer. | Stemmer |
| 861 | UiA 2021 poeng/faglig 1,78, side 32 | UiA kvalitetsrapport 2025, PDF side 32, tabell 2 | UiA 2021 = 1,78. Side stemmer. | Stemmer |
| 943 | HH NMBU 2024 0,95 | UiA kvalitetsrapport tabell 2 (rad «Handelshøyskolen, NMBU») | 2024 = 0,95 (merknaden om at tallene er identiske med UiAs tabell stemmer) | Stemmer |
| 959 | USN HH 2024 publiseringspoeng 180,8, side 7 | USN Resultatindikatorer 2025, PDF side 7 | 2024: verdi 0,92, teller 180,8, nevner 195,6 | Stemmer |
| 936 | HH NMBU 2017 poeng/faglig 1,27 | Ingen URL. Kilden er en infografikk fra brukeren. UiAs tabell starter i 2018. | **Kan ikke etterprøves.** Rader uten URL (`url: null`, HH-infografikk 2024, 15 rader) er avhengige av brukerens eget materiale. 2018–2024 er derimot bekreftet mot UiA-tabellen. | Ikke verifisert |

Raden 509 (NHH årsrapport 2025, tabell 18, nivå 2-poeng 207,12, side 27) kunne ikke leses. PDF-en er over 10 MB og lar seg ikke hente med WebFetch. Jeg lastet ikke ned PDF-er selv. Raden ble erstattet av 959. Raden er derfor **ikke kontrollert**.

Hver av de verifiserte radene har sitat og side som stemmer med kilden. Ingen tegn til feillesing blant de 9 verifiserte radene. Rader i HK-dir-kategorien (420 av 1004) er lest via API og kan kontrolleres mekanisk mot `vedlegg.hkdir.no/api/collections/2026/TRHU/tables/V15.1`, V15.2 og V15.3. Det anbefales å kjøre en full automatisk sjekk av dem.

## Anbefalte rettelser

1. `skoler.json`, BI: sett EQUIS `aar` til 1999 og rett merknaden. Sjekk om «2008» er brukt andre steder (f.eks. i teksten på siden).
2. `skoler.json`, NHH: bytt AACSB-kilde til nhh.no/accreditations eller AACSBs pressemelding. Den nåværende URL-en har «non-accredited» i stien.
3. `skoler.json`, UiA: fjern «reakkreditert 2023/2024» eller merk det som ubekreftet.
4. `ajg-nhh-rapport.json`: behold `usikker`-flagget for ABS 3 i 2022. Presiser at det er antallet (n) som er uten verdi, og at perFte trolig er riktig.
