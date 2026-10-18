# Nevner for svenske handelshøyskoler: faglige årsverk 2016–2025

Utforsket 18. oktober 2026 av én agent, bare åpne kilder, ingen innlogging. Bygger videre på `norden-sverige.md` §3 uten å gjenta det. Tallfil: `data/rangering/norden/nevner/sverige.csv` (semikolon, UTF-8, 2 028 rader, ingen personnavn). Råsvar fra API-et og nedlastede PDF-er ligger i agentens midlertidige mappe, ikke i repoet.

Merker: **V** = verifisert (tallet er sett i kilden), **T** = hentet maskinelt via UKÄ-API-et, **T-avledet** = regnet av oss fra T-tall, **D** = bare sett omtalt (søkesammendrag eller sekundærkilde).

## Kort fortalt

- **Eneste kilde som dekker alle elleve enhetene i alle år 2016–2025 er UKÄ-API-et** (T). Det gir heltidsekvivalenter (årsverk, målt i oktober) for forskande och undervisande personal og for doktorander (helårs), per lärosäte × forskningsfaggruppe. Faggruppen «Ekonomi och näringsliv» går tilbake til 2012. JIBS mangler 2016 (Stiftelsen Högskolan i Jönköping har ingen rader det året). Postdoktorer finnes som egen rad fra et eget uttrekk (totals/104).
- **Problemet er dekningen, ikke tilgangen.** UKÄ deler på fagkode, ikke på organisasjon. For SSE er faggruppen praktisk talt hele skolen (UKÄ 139,9 årsverk 2025 mot 156 «core faculty» i SSEs egen årsredovisning, V). For LUSEM dekker faggruppen om lag 79 % (135,3 mot 171,8 årsverk 2025, V/T). For GU Handelshögskolan dekker «Ekonomi och näringsliv» bare ca. 58 % av de faglige personene fordi jus, økonomisk geografi m.m. kodes andre steder. For JIBS er tallet hele Jönköping University (EK-fag), ikke bare JIBS.
- **Beste kilde per enhet:**
  - **SSE:** UKÄ (hele institusjonen, 2016–2025) + SSEs årsredovisningar for kontroll (core faculty 2022–2025, V). Kvalitet god.
  - **LUSEM:** UKÄ-faggruppen 2016–2025 som undergrense, skalert med LUSEMs egen tall for 2025/26 (171,8 årsverk faglige + 58,3 doktorander, V). Kun ett år fra skolen selv. Kvalitet middels.
  - **GU Handelshögskolan:** fakultetets egen fakta-side har personer (medelantal) for 2020, 2021, 2023, 2024, 2025 (V). **Avledet serie 2016–2025** fra UKÄ: «Ekonomi och näringsliv» + «Juridik» + «Social och ekonomisk geografi» treffer fakultetets egne tall innen ±5 % (personer, fem år kontrollert). Kvalitet middels til god.
  - **JIBS:** UKÄ gir hele JU (EK-fag, 2017–2025, 56–78 årsverk). JIBS' egen side gir 117 «faculty and staff» (2024, uklar definisjon), 12 professorer og 37 doktorander. Kvalitet svak til middels.
  - **Umeå (USBE), Örebro HH, LNU (FEH), Karlstad HH:** bare UKÄ-faggruppen. Årsredovisningene har ikke fakultets-/skolenivå for disse skolene (Umeå 2024 og Örebro 2024 lest, V). Kvalitet svak: faggruppen utelater statistikk, informatikk og lignende, som skolene har.
  - **SU, UU, LiU (referanser):** UKÄ-faggruppen for hele lärosätet, som er en overgrense for de aktuelle institusjonene (SU, UU, LiU har mer enn institusjonene vi sammenligner, f.eks. logistikk/industriell økonomi i LiU) og en undergrense for SU hvis IIES og Nationalekonomiska er registrert under andre fagkoder. Kvalitet svak.
- **Med/uten doktorander:** «uten stipendiater» ≈ `forsk_underv` (inkluderer også adjunkter og «annan forskande och undervisande personal», som er litt bredere enn norsk UN1 + postdok). «Med stipendiater» ≈ `forsk_underv` + `doktorander` (helårs, alle finansieringsformer). Svenske doktorander er ofte ikke ansatt (SSE: bare en liten del), så summen er ikke identisk med UN1 + UN2.
- **Anbefaling:** bruk UKÄ som felles, åpen serie for alle, men merk hver rate med «dekning av faggruppen» (SSE ≈ 1,0; LUSEM ≈ 0,8; GU HH ≈ 0,58 uten rekonstruksjon). For GU HH bruk den rekonstruerte serien. For LUSEM, JIBS og de fire mindre skolene bør vi be om årsverk per fakultet før noe publiseres (se «Mangler»).

## Spor 1: UKÄ statistik-API (T)

**Base:** `https://statistik-api.uka.se/api/totals/<indikator>` (JSON, ingen nøkkel, ingen innlogging). 113 av id-ene 1–200 svarer.

**Parametere som virker** (alle testet med curl):

| Parameter | Betydning |
|---|---|
| `university=<n>` | Lærosete. Id-ene står i svaret uten filter (`groups[0].totals[].url`). Brukt: SSE 11, Jönköping (Stiftelsen Högskolan i Jönköping) 39, Lund 33, GU 10, Umeå 46, Örebro 56, LNU 60, Karlstad 25, SU 41, UU 47, LiU 31. Andre: Mälardalen 67, Södertörn 43, Kristianstad 22, Mittuniversitetet 35, Malmö 62, Borås 17, Luleå 32, KTH 30, Chalmers 4. |
| `year=<ÅÅÅÅ>` | Måleår (personal måles i oktober). For doktorander per termin (indikator 137) brukes `HT<ÅÅÅÅ>`. |
| `group_slug=<hash>` | Drill-ned ett nivå om gangen: fagområde → faggruppe. Hash-ene står i svaret (`groups[].totals[].id`) og er like for alle lärosäten. **Bare én verdi gjelder** (gjentatt `group_slug` gir bare ett av filtrene, komma gir feil). |
| `gender=Kvinnor|Män`, `age_group=2..7` | Kjønn og alder (ikke brukt). |

Slugs vi trenger: Samhällsvetenskap `68ed736dda589df7f347eeb0e5abc49e84ab852d`, Ekonomi och näringsliv `5979f52c515d14cbee9668b31028cfe9c1a33d62`. Faggruppelisten under Samhällsvetenskap: Annan samhällsvetenskap, Ekonomi och näringsliv, Juridik, Medie- och kommunikationsvetenskap, Psykologi, Social och ekonomisk geografi, Sociologi, Statsvetenskap, Utbildningsvetenskap. **Statistikk og informatikk finnes ikke som egne grupper** (de ligger under Naturvetenskap), og nasjonaløkonomi er ikke skilt fra bedriftsøkonomi (begge i «Ekonomi och näringsliv»). Under faggruppen viser svaret stillingskategorier (professorer, lektorer, adjunkter, meriteringsanställningar, annan forskande och undervisande personal), kjønn og alder. `yearly_totals` gir tidsserien for det valgte filteret (for faggrupper 2012–2025).

**Eksempler som virker:**

```
# Alle fagområder, GU 2025
curl 'https://statistik-api.uka.se/api/totals/56?university=10&year=2025'
# Fagområdet Samhällsvetenskap, GU 2025 (viser faggruppene)
curl 'https://statistik-api.uka.se/api/totals/56?university=10&year=2025&group_slug=68ed736dda589df7f347eeb0e5abc49e84ab852d'
# Faggruppen Ekonomi och näringsliv, GU 2025 (stillingskategorier + tidsserie 2012–2025 i yearly_totals)
curl 'https://statistik-api.uka.se/api/totals/56?university=10&year=2025&group_slug=5979f52c515d14cbee9668b31028cfe9c1a33d62'
```

**Tabeller (indikator-id) som er relevante** (T):

| Id | Innhold | Enhet | År |
|---|---|---|---|
| 56 | Forskande och undervisande personal, per fagområde/faggruppe og stillingskategori | heltidsekvivalenter | 2001–2025 |
| 8 | Samme, antall anställda (individer) | personer | 2001–2025 |
| 57 / 58 | Samme, bare med forskarexamen (FTE / individer) | årsverk / personer | –2025 |
| 104 / 103 | Meriteringsanställda etter type (postdoktorer, biträdande lektorer, forskarassistenter) per fagområde/faggruppe | årsverk / personer | 2001–2025 |
| 139 | Doktorander (helårs) etter fagområde/faggruppe og försörjningsform | helårs | 1999–2025 |
| 137 | Doktorander per høsttermin (HT), samme oppdeling | personer | –HT2025 |
| 138 / 140 | Doktorandnybörjare (nye) | personer / helårs | –2025 |
| 53 / 54 | All personal (FTE / individer), uten fagoppdeling | | –2025 |
| 55, 67, 69, 124, 121/123 | Personal med forskarexamen, andel disputerte, andel professorer, andel tidsbegrenset, anställningsform | | –2025 |
| 43–47 | Eldre doktorandtabeller, «uppdateras inte längre» (til 2024) | | |

**Hva som er hentet (T):** for alle elleve enhetene og 2016–2025: `forsk_underv` (sum av kategoriene) og kategoriene `professorer`, `lektorer`, `adjunkter`, `meriteringsanstallte`, `annan_forsk_underv` i årsverk (indikator 56), samme i personer med suffikset `_personer` (indikator 8), `postdok`, `bitrad_lektor`, `forskarassistent` (104), og `doktorander`, `doktorander_anstallda` (bare «Anställning som doktorand») og `doktorander_andre_finansiering` (139). I tillegg `forsk_underv_hele_larosetet` (alle fag) som kontekst. Kontroll: summen av kategoriene stemmer med `yearly_totals` i alle 110 uttrekk for indikator 56 (avvik under 0,25).

**Forsk-og-undervisende personal, årsverk, faggruppen «Ekonomi och näringsliv» (T, `maal = forsk_underv`):**

| Enhet | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| se_sse | 89,6 | 80,3 | 91 | 75,8 | 103,4 | 111,4 | 107,3 | 128,8 | 140,7 | 139,9 |
| se_jibs | – | 56 | 60,8 | 71 | 75,2 | 76,2 | 73,1 | 78 | 76,9 | 73,4 |
| se_lund | 134 | 152,8 | 159,8 | 157,2 | 162,4 | 157,5 | 146,8 | 147,9 | 147,4 | 135,3 |
| se_gu | 151 | 151,7 | 155,9 | 143,4 | 158 | 138,4 | 139,2 | 133,4 | 128,1 | 126,5 |
| se_umea | 87,9 | 79 | 76,6 | 82,5 | 78,9 | 86,1 | 89,7 | 92,3 | 86,6 | 85,7 |
| se_orebro | 42,3 | 46 | 46,3 | 51 | 49,7 | 47,9 | 44,5 | 46,7 | 46,6 | 44 |
| se_lnu | 108,1 | 105,2 | 103,2 | 97,7 | 96,7 | 89,3 | 94,2 | 99,2 | 94,1 | 92,2 |
| se_karlstad | 38,5 | 37,8 | 38,4 | 39,4 | 43,8 | 48,9 | 50,1 | 46,8 | 43,7 | 46 |
| se_su | 132,7 | 133,3 | 148,9 | 143,3 | 125,5 | 130,6 | 135,4 | 141,3 | 121,4 | 136,4 |
| se_uu | 93,7 | 103,8 | 109,3 | 122,7 | 109,3 | 103,1 | 104 | 100,8 | 97,3 | 95,3 |
| se_liu | 45 | 44,5 | 42,4 | 44,8 | 49 | 50,1 | 51,6 | 58,5 | 57,8 | 53,6 |

*Merk:* SSE 2025 er summen av kategoriene (139,9); hele institusjonen er 141,9 (inkl. 2,0 «uppgift saknas»). Hoppet hos SSE 2022→2024 (professorer 28,7 → 42,2 mellom 2022 og 2023, og meriteringsanställda opp) er en blanding av reell vekst og endret kodning; sjekk mot SSE før bruk. JIBS = hele Jönköping University.

**Doktorander (helårs), faggruppen (T, `maal = doktorander`):**

| Enhet | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| se_sse | 112,9 | 104,5 | 114,6 | 117,9 | 122,8 | 128,4 | 132,3 | 128,9 | 109,5 | 115,2 |
| se_jibs | – | 34,1 | 28,8 | 28,1 | 26,7 | 22,4 | 20,9 | 24,2 | 16,3 | 13,6 |
| se_lund | 80,2 | 78,9 | 80,3 | 77,2 | 70,6 | 67 | 70,1 | 68,7 | 68,5 | 60,6 |
| se_gu | 60,4 | 58,4 | 47,7 | 46,6 | 36,5 | 36,7 | 44,3 | 44 | 51,2 | 41,4 |
| se_umea | 27,3 | 26,5 | 22,7 | 18,5 | 13,2 | 17,5 | 14,3 | 14,9 | 18,9 | 20,6 |
| se_orebro | 16,7 | 19,8 | 15,4 | 12,9 | 10,7 | 11,4 | 8,1 | 7,4 | 7,5 | 5,4 |
| se_lnu | 10 | 12 | 13,9 | 13,4 | 10,3 | 10,7 | 11,5 | 9,6 | 11,7 | 11,2 |
| se_karlstad | 15,1 | 14,4 | 11,8 | 7 | 8,1 | 8,8 | 8,7 | 8,5 | 10,6 | 10,1 |
| se_su | 115,4 | 106,2 | 102,1 | 93 | 90,7 | 94,5 | 99,8 | 107,6 | 112,1 | 102,3 |
| se_uu | 97,9 | 89,4 | 89 | 84,2 | 86,9 | 77,7 | 84,1 | 83,3 | 81,2 | 71,2 |
| se_liu | 13,2 | 10,6 | 10,1 | 11,4 | 7,2 | 7,9 | 8,5 | 9,1 | 10,3 | 9,4 |

**Med doktorander (≈ UN1 + UN2, T, sum av de to tabellene over):**

| Enhet | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| se_sse | 202,5 | 184,8 | 205,6 | 193,7 | 226,2 | 239,8 | 239,6 | 257,7 | 250,2 | 255,1 |
| se_jibs | – | 90,1 | 89,6 | 99,1 | 101,9 | 98,6 | 94,0 | 102,2 | 93,2 | 87,0 |
| se_lund | 214,2 | 231,7 | 240,1 | 234,4 | 233,0 | 224,5 | 216,9 | 216,6 | 215,9 | 195,9 |
| se_gu | 211,4 | 210,1 | 203,6 | 190,0 | 194,5 | 175,1 | 183,5 | 177,4 | 179,3 | 167,9 |
| se_umea | 115,2 | 105,5 | 99,3 | 101,0 | 92,1 | 103,6 | 104,0 | 107,2 | 105,5 | 106,3 |
| se_orebro | 59,0 | 65,8 | 61,7 | 63,9 | 60,4 | 59,3 | 52,6 | 54,1 | 54,1 | 49,4 |
| se_lnu | 118,1 | 117,2 | 117,1 | 111,1 | 107,0 | 100,0 | 105,7 | 108,8 | 105,8 | 103,4 |
| se_karlstad | 53,6 | 52,2 | 50,2 | 46,4 | 51,9 | 57,7 | 58,8 | 55,3 | 54,3 | 56,1 |
| se_su | 248,1 | 239,5 | 251,0 | 236,3 | 216,2 | 225,1 | 235,2 | 248,9 | 233,5 | 238,7 |
| se_uu | 191,6 | 193,2 | 198,3 | 206,9 | 196,2 | 180,8 | 188,1 | 184,1 | 178,5 | 166,5 |
| se_liu | 58,2 | 55,1 | 52,5 | 56,2 | 56,2 | 58,0 | 60,1 | 67,6 | 68,1 | 63,0 |

**GU Handelshögskolan rekonstruert fra UKÄ (T-avledet; årsverk):** første tabell med jus (Ekonomi och näringsliv + Juridik + Social och ekonomisk geografi), andre uten jus:

| Enhet | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| se_sse | – | – | – | – | – | – | – | – | – | – |
| se_jibs | – | – | – | – | – | – | – | – | – | – |
| se_lund | – | – | – | – | – | – | – | – | – | – |
| se_gu | 217,7 | 223,5 | 229,3 | 214,9 | 233,8 | 215 | 208,1 | 205,9 | 207,9 | 202,6 |
| se_umea | – | – | – | – | – | – | – | – | – | – |
| se_orebro | – | – | – | – | – | – | – | – | – | – |
| se_lnu | – | – | – | – | – | – | – | – | – | – |
| se_karlstad | – | – | – | – | – | – | – | – | – | – |
| se_su | – | – | – | – | – | – | – | – | – | – |
| se_uu | – | – | – | – | – | – | – | – | – | – |
| se_liu | – | – | – | – | – | – | – | – | – | – |
| Enhet | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| se_sse | – | – | – | – | – | – | – | – | – | – |
| se_jibs | – | – | – | – | – | – | – | – | – | – |
| se_lund | – | – | – | – | – | – | – | – | – | – |
| se_gu | 167 | 170,2 | 172,3 | 162,4 | 176,3 | 157,3 | 156,2 | 150,9 | 148,4 | 143,8 |
| se_umea | – | – | – | – | – | – | – | – | – | – |
| se_orebro | – | – | – | – | – | – | – | – | – | – |
| se_lnu | – | – | – | – | – | – | – | – | – | – |
| se_karlstad | – | – | – | – | – | – | – | – | – | – |
| se_su | – | – | – | – | – | – | – | – | – | – |
| se_uu | – | – | – | – | – | – | – | – | – | – |
| se_liu | – | – | – | – | – | – | – | – | – | – |

**Kontroll av rekonstruksjonen mot fakultetets egne tall (personer, V mot T-avledet):**

| År | GU HH egne tall: faglige (uten doktorander) | UKÄ EK + Jur + SEG (individer) | Avvik |
|---|---:|---:|---:|
| 2020 | 281 | 284 | +1 % |
| 2021 | 277 | 264 | −5 % |
| 2023 | 266 | 258 | −3 % |
| 2024 | 282 | 277 | −2 % |
| 2025 | 278 | 284 | +2 % |

**Forbehold UKÄ (viktig):**
1. Faggruppen er fagkode (SSIF), ikke organisasjon. Hver forsker har én fagkode; ansatte ved handelshøyskolen med fagkode statistikk, informatikk, jus, økonomisk historie osv. havner utenfor. Se dekningsanslagene over.
2. «Forskande och undervisande personal» inkluderer adjunkter og «annan forskande och undervisande personal» (forskere m.fl.). Det er litt bredere enn UN1 + postdok.
3. Målingen er oktober; norsk DBH er 1.10 eller årsgjennomsnitt (se norske definisjoner). Nær nok for rater.
4. Doktorander (helårs) i UKÄ er aktivitetsveid og lavere enn personer. GU Handelshögskolans egne «doktorandanställning» (73 personer 2025) er høyere enn UKÄ-årsverket for de tre faggruppene (57,5).
5. Små lärosäten (Karlstad, Örebro, Mittuniv.) har enkeltkategorier på 1–3 årsverk; kategoritall er støyende, summen er brukbar.

## Spor 2: Årsredovisningar

| Lärosäte | Kilde | Nivå | Innhold | År | Vurdering |
|---|---|---|---|---|---|
| GU | https://www.gu.se/sites/default/files/2026-02/G%C3%B6teborgs%20universitets%20%C3%A5rsredovisning%202025.pdf (V) og 2020: https://www.gu.se/sites/default/files/2024-03/%C3%85rsredovisning%202020.pdf (V) | Fakultet (side «GU i korthet»): helårsstudenter, forskarstuderande, anställda, intekter per fakultet; personal totalt per lärosäte (årsarbetskrafter, lärare) | Handelshögskolan: anställda 463 (2020), 482 (2025); forskarstuderande 90 (2020), 97 (2025). Hele GU: lærere 2 092 årsarbetskrafter (2025), 2 109 (2024), 2 062, 1 994, 2 012 (2021) | 2020, 2025 (+ hele GU 2021–2025) | Nyttig som kontroll; «anställda» er totalt (inkl. admin) |
| LU | https://www.ekonomiwebben.lu.se/sites/ekonomiwebben.lu.se/files/2025-02/Lunds-universitets-arsredovisning-2024.pdf (V) | Lärosäte (HTE, desember); professorer per fakultet bare som diagram | Totalt 7 445 HTE (2024), 7 482 (2023), 7 485 (2022). Professorer 617 / 624 / 625. Diagrammet «Antal professorer per fakultet» (fig. 5.3) har EHL, men tallene er ikke lesbare ut av tekstlaget | 2022–2024 | Ikke brukbar for nevner per fakultet |
| Umeå | https://umu.se/globalassets/fristaende-webbar/regelverk/styrning-ekonomi-planering-och-resursfordelning/arsredovisning-umea-universitet-2024.pdf (V) | Fakultet (4); USBE ligger under Samhällsvetenskapliga fakulteten | Ingen personaltall på USBE-nivå | – | Ingen |
| Örebro | https://oru.se/globalassets/inforum-sv/centrala-dokument/styrdokument/verksamhetsplanering/arsredovisning_verksamhetsberattelser/arsredovisningar/arsredovisning-2024_orebro-universitet.pdf (V) | Lärosäte (tabell T3:4, årsarbetskrafter) | Hele ORU: 1 315 (2024), 1 344 (2023), 1 366 (2022); professorer 101, lektorer 322, doktorander 137 | 2022–2024 | Handelshögskolan er en institusjon under fakultet, ingen institusjonstall |
| Karlstad | https://www.kau.se/files/2025-02/Slutlig%20Arsredovisning_2024_beslut_styrelsen.pdf (V, bare søkt etter fakultetstall) | Lärosäte | Ingen personaltall for Handelshögskolan funnet | – | Ingen |
| SU | https://www.su.se/download/18.11777a0b1993704a058e830/1758617298159/%C3%85rsredovisning%202024Arsredovisning_Stockholmsunviersitet_2024_.pdf (V) | Fakultet (Samhällsvetenskapliga fakulteten rommer SBS og Nationalekonomi) | Ingen institusjonsnivå | – | Ingen |
| UU | https://www.uu.se/download/18.272d68dd19c47955116da6a/1770979557974/%C3%85rlig%20redovisning%20och%20planering%202024-2025%20V2.pdf (V, bare søkt) | Fakultet/lärosäte | Ingen personaltall per institusjon funnet | – | Ingen |
| LNU, LiU | Ikke funnet/åpnet (lnu.se-sidene ga 404 og søk ga ingen PDF) | – | – | – | Ikke undersøkt |
| JU | https://hj.se/download/18.374be47c18dbb1286d9393b5/1709038730955/JU_%C3%85R2023_uppslag.pdf (V) | Lärosäte; ledelse per skole; lærere i årsarbeid hele JU | Professorer 49,8 (2021), 50,1 (2022), 52,0 (2023) årsverk, hele JU; JIBS har ikke egne personaltall | 2021–2023 | Ingen JIBS-nivå |

**Konklusjon spor 2:** årsredovisningene gir bare lærosätesnivå (og fakultetsnivå på GU for «anställda» og forskarstuderande). Det gjelder alle seks vi lette i. Skolene som er egne fakulteter (GU, LU) viser ikke personal per fakultet i selve rapporten (LU bare som diagram for professorer).

## Spor 3: Skolenes egne fakta-sider og årsrapporter

| Skole | Kilde | Nivå | Definisjon | År | Vurdering |
|---|---|---|---|---|---|
| GU Handelshögskolan (V) | https://www.gu.se/handelshogskolan/om-oss/fakta-och-historia (live 2025) og arkiverte kopier: `web.archive.org/web/20211025101815/…` (2020), `…20221203121721/…` (2021), `…20240916022725/…` (2023), `…20250624223625/…` (2024) | Fakultet (med jus) | «medeltal/medelantal, antal individer», per stilling. 2025: professorer 69, lektorer 127, biträdande lektorer 9, postdok 10, adjunkter 17, forskare 21, övriga 25, doktorandanställning 73, admin 119, teknisk 12, total 482. 2024: 65/128/11/11/17/27/23, dok 82, total 497. 2023: 60/124/10/11/14, annan 47, dok 77, total 471. 2021: 58/126/12/11/17, annan 53, dok 68, total 465. 2020: 58/125/13/7/19, annan 59, admin/tekn 116, total 397 | 2020, 2021, 2023, 2024, 2025 (2022 og før 2020 mangler: arkivkopiene viser 2021-tabellen helt til 2024; sidens layout fra 2020 hadde tomt tabellfelt) | God, men personer, ikke årsverk, og inkluderer jus |
| LUSEM (V) | https://lusem.lu.se/about, seksjonen «Figures about LUSEM 2025/26» (oppdatert 24.4.2026) | Fakultet (6 institutter) | Årsverk: professorer 33,6; universitetslektorer 91,1; adjunkter 16,7; tenure-track 14,5; annen faglig 15,9 (= 171,8); doktorander 58,3; admin 76,0; bibliotek 8,8; totalt 315 | 2025/26 (ett år) | God, men uten tidsserie. Arkiverte kopier av siden (2017–2024) viser ikke tallblokken i HTML-en, så historikk måtte ikke hentes derfra |
| SSE (V) | Årsredovisningar: https://www.hhs.se/en/about-us/organization/sse-in-print/ (2021–2025, PDF-er under `/globalassets/units/sse/2026/`) | Hele institusjonen (fakultet + professional services) | «Medelantal anställda» fra arbeidet tid (2020: 253, 2021: 288, 2022: 278, 2023: 272, 2024: 286, 2025: 302). «Core faculty» = antall tjänster over året: 2022 164, 2023 156 (AR 2023: 152), 2024 162, 2025 156; 2020 og 2021 bare som diagram (ca. 119 og 136) | 2020–2025 | God for kontroll av UKÄ. Definisjonen er endret mellom årsrapportene (2022: 164 mot 151) |
| JIBS (V) | https://ju.se/en/about-us/jonkoping-international-business-school/about-us/facts-and-figures.html | Skole | «12 full Professors», «37 PhD students», «117 faculty and staff» (Annual Report 2024). Uklart om årsverk | 2024 | Svak; 117 virker å inkludere admin |
| JU totalt (V) | https://ju.se/en/about-us/facts-and-figures.html | Lärosäte | Ansatte (FTE) 803, lærere 448, professorer 55, doktorander 155 (hode) | 2025 (459 lærere 2024, 457 2023 ifølge søkesammendrag, D) | Hele JU |
| Umeå USBE (D) | https://umu.se/en/usbe/about-us (søkesammendrag) | Skole | «ca. 150 ansatte», «over 90 lærere og forskere med doktorgrad» (2023-artikkel) | 2023 | Bare omtale |
| Karlstad HH (D) | kau.se/files/2019-11/HHK_10YEARS.pdf | Skole | «130 anställda» (udatert, ca. 2012) | ca. 2012 | Foreldet |
| LNU FEH (D) | undervisningsmateriale på moodle.lnu.se | Skole | «närmare 200 anställda» | udatert | Bare omtale |
| Örebro HH | – | – | Ingen tall funnet | – | Ingen |

## Spor 4: Åpne statistikk-/nøkkeltallsportaler

- **LU «fakta och siffror»** (https://www.lu.se/om-universitetet/universitetet-i-korthet/fakta-och-siffror, V): 8 500 individer / 7 400 HTE totalt (2025), professorer 720; ingen fakultetsoppdeling og ingen dashboard.
- **Umeå «Key figures»** (https://www.umu.se/en/about-umea-university/facts-and-figures/figures/, V): 4 560 ansatte, 304 professorer (2025); ingen skoleoppdeling.
- **GU «Fakta och siffror»** (https://www.gu.se/om-universitetet/fakta-och-siffror, D): bare universitetsnivå.
- **UKÄ «Högskolan i siffror»** er den eneste portalen med nasjonal, åpen serie (se spor 1). Sidene bruker API-et vi har dokumentert.
- Ingen Tableau-/Power BI-side med fakultetsnivå ble funnet for de åtte skolene.

## Spor 5: Annet

- **Wayback Machine (CDX)** fungerte for å hente eldre versjoner av GU Handelshögskolans fakta-side (se spor 3). Samme metode ga ikke LUSEM-tall.
- **UKÄ SM UF 23 SM 2601** (beskrivelse av personalstatistikken, https://www.uka.se/download/18.34adeb5019eb493fd0221b/1781265782236/personal-SM_UF23SM2601.pdf, V per forrige notat): 42 faggrupper, SSIF fra 2012, oktober som målemåned.
- **Ikke funnet:** verksamhetsberättelser på fakultetsnivå (LUSEM, USBE, Ekonomihögskolan LNU), SCB PxWeb for personal per fakultet (ikke oppdatert siden 2011, jf. forrige notat).

## Mangler, og hva som kunne løst det

| Enhet | Hva mangler | Forslag |
|---|---|---|
| LUSEM | Egen årsverkstidsserie (bare 2025/26) | E-post til fakultetets controller/HR: årsverk per kategori og institutt 2016–2025 (fra Kuben/Primula, desember), med og uten statistikk/informatikk/handelsrätt/ekonomisk historia |
| GU HH | 2016–2019 og 2022 i fakultetets egne tall, og årsverk (ikke personer) | E-post til fakultetet/GU:s kvalitetsenhet: «medelantal» og årsarbetskrafter per kategori 2016–2025. Rekonstruksjonen fra UKÄ kan brukes inntil videre |
| JIBS | JIBS-spesifikke årsverk (UKÄ gir hele JU) og definisjonen av «117» | E-post til JIBS' controller/HR: årsverk per kategori 2016–2025 |
| USBE, Örebro HH, LNU FEH, Karlstad HH | Alt på skolenivå | E-post til fakultet/controller. For Umeå og Örebro: spør om uttrekk fra personalsystemet (Primula) på institusjonsnivå, tilsvarende UKÄ-kategoriene |
| SSE | 2016–2019 «core faculty» i egne tall; 2020/2021 bare som diagram | E-post til SSE Research Office/HR; UKÄ dekker praktisk talt hele skolen |
| SU, UU, LiU | Avgrensning til institusjonene vi sammenligner | E-post til institusjon/fakultet, eller bruk UKÄ med forbehold |

## Filen sverige.csv

Kolonner: `enhet;aar;maal;verdi;enhet_type;nivaa;kilde_url;kvalitet;merknad`. Desimalkomma. `kvalitet` = V, T, T-avledet eller V (diagram). Navn på `maal` (valg som gjelder alle UKÄ-rader): `forsk_underv`, `professorer`, `lektorer`, `adjunkter`, `meriteringsanstallte`, `annan_forsk_underv`, `postdok`, `bitrad_lektor`, `forskarassistent`, `doktorander`, `doktorander_anstallda`, `doktorander_andre_finansiering`, `forsk_underv_hele_larosetet`, samt `*_personer` for individer. Manuelle rader har suffiksene `_hh_egne_tall` (GU), `_lusem_egne_tall`, `_jibs_egne_tall`, `core_faculty_stillinger` og `medelantal_anstallda_alle` (SSE), `_hh_rekonstruert_med_jus/uten_jus` (GU avledet).
