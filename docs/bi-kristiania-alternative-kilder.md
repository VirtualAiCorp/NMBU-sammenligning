# Alternative datakilder for Handelshøyskolen BI (8241) og Høyskolen Kristiania (8253)

Arbeidsnotat 23.09.2026 (Claude Sonnet 5). Dette notatet dekker kilder **utover** DBH-tabellene (379, 571, 707, 902,
750, 225, 373, 900, 347, 124), Studiebarometeret og programsidene, som allerede er kartlagt i
`docs/bi-kristiania-datakilder.md` — se den for det som *ikke* gjentas her.

Merket **[V]** = hentet og kontrollert med faktisk oppslag (curl/WebFetch) i denne økten. **[A]** = antatt, kjent fra
generell kunnskap, eller portalen fantes/svarte men jeg fikk ikke verifisert et konkret tall/treff (nettverksfeil,
JS-rendret søk, eller ratebegrensning). Små prøveuttrekk ligger i `data/nmbu/kilder/bi-kristiania/alternative/`.

## 1. Sammendrag — de mest verdifulle funnene

1. **Brønnøysundregistrene avslører eierskap gratis og uten innlogging, og forskjellen mellom BI og Kristiania er stor:**
   BI er «Stiftelsen Handelshøyskolen BI» (org.nr. **971228865**), en fristående stiftelse som **ikke** er registrert
   som konsern (`erIKonsern: false`). Kristiania er «Høyskolen Kristiania – Ernst G. Mortensens Stiftelse»
   (org.nr. **954831604**) og er registrert som konsern (`erIKonsern: true`) — med minst datterselskapet
   **Fagskolen Kristiania AS** (org.nr. 998632307, tidligere Norges Kreative Høyskole) og en egen avdeling i Bergen.
   Dette er et konkret, siterbart eierskaps-/organisasjonsfunn NMBU HH ikke har i dag. **[V]**
2. **Samme register gir fullt styre og daglig leder (rektor), med navn og fødselsdato, i sanntid:** BI: styreleder
   **Egil Olav Hogna**, daglig leder **Egil Matsen**, 1 847 ansatte. Kristiania: styreleder **Kyrre Lekve**, daglig
   leder **Solfrid Lind**, 1 140 ansatte. Gratis JSON-API (`/enhetsregisteret/api/enheter/{orgnr}/roller`), ingen
   nøkkel. **[V]**
3. **Regnskapsregisteret-API-et (samme familie som Enhetsregisteret) gir friskere og mer detaljerte regnskapstall enn
   DBH 902, og forskjellen mellom institusjonene i 2025 er slående:** BI hadde driftsinntekter på
   **2 194 022 000 kr** og et driftsresultat på **+32 742 000 kr**. Kristiania hadde driftsinntekter på
   **1 454 242 565 kr**, men et driftsresultat på **−103 586 704 kr** — et betydelig underskudd. Dette er et sterkt
   argument for at Kristiania er under større økonomisk press enn BI akkurat nå. **[V]**
4. **Statsbudsjettet (Prop. 1 S 2025–2026, Kunnskapsdepartementets kapittel, kap. 260 post 70 «Private høgskular»)
   gir eksakte, navngitte tilskuddstall som ikke finnes i DBH 902:** BI **445 553 000 kr**, Kristiania
   **409 598 000 kr** i statstilskudd. Verifisert direkte i tabellcellene i rå HTML, ikke bare i et sammendrag.
   Sammenholdt med skolepengeinntekt (DBH 902) gir dette forholdet mellom statlig og privat finansiering per
   institusjon. **[V]**
5. **Cristin/NVA sitt åpne API (`api.cristin.no`, ingen nøkkel) gir en forskningsprofil DBH 373/374 ikke fanger:**
   institusjons-ID BI = **158** har **188** registrerte prosjekter og **34 170** registrerte publikasjoner/resultater
   totalt i Cristin. Kristiania = institusjons-ID **1615** har **175** prosjekter og **12 000** registrerte resultater.
   Tallene kan brytes videre ned på år, fagfelt, forfatter og samarbeidsinstitusjon via samme API. **[V]**
6. **Internasjonale partnerlister hentet direkte fra institusjonenes egne nettsider er lett tilgjengelige og ikke i
   dagens sammenligning:** BI oppgir selv «exchange partnerships with more than 200 schools around the world».
   Kristianias sidekart (`sitemap.xml`) har egne landsider for utveksling i **38 land**
   (`/for-studenter/studier-i-utlandet/internasjonale-samarbeidspartnere/{land}/`). Et grovt mål på internasjonal
   rekkevidde uten å måtte skrape emnenivå. **[V]**
7. **NAVs jobbannonse-API (`arbeidsplassen.nav.no/stillinger/api/search`) er åpent uten nøkkel og gir et
   vekstsignal for BI, men er ubrukelig for Kristiania:** et søk på «Handelshøyskolen BI» ga nettopp nå 4 aktive
   stillinger (Security Architect, jurist/seniorrådgiver, .NET/AI-utvikler, høyskolelektor). Samme søk på
   «Høyskolen Kristiania» gir bare støy, fordi «Kristiania» er et historisk navn på Oslo og matcher stedsnavnet, ikke
   arbeidsgiveren — en fallgruve å notere. **[V]**
8. **NOKUTs underviserundersøkelse finnes, men er en blindvei for direkte sammenligning — og et argument for
   innsyn:** siste hovedrapport er fra 2021 (før det 2017), og resultater per institusjon sendes bare til
   institusjonen selv som egen grafisk rapport — de er ikke offentlig brutt ned per institusjon. Skal NMBU ha disse
   tallene for BI/Kristiania, må det skje via institusjonene selv eller en innsynsbegjæring til NOKUT om hvorvidt de
   sitter på noe institusjonsspesifikt. **[V]**

## 2. Kildetabell

| Kilde | Hva den gir for BI | Hva den gir for Kristiania | Format/tilgang | V/A | Verdi | Innsats |
|---|---|---|---|---|---|---|
| Brreg Enhetsregisteret (enheter) | Org.nr 971228865, stiftelse, **ikke** konsern, 1 847 ansatte, stiftet 1968 | Org.nr 954831604, stiftelse, **er** konsern, datterselskap Fagskolen Kristiania AS (998632307) + avd. Bergen, 1 140 ansatte | JSON-API, ingen nøkkel, ingen innlogging | **[V]** | Høy | Lav |
| Brreg Enhetsregisteret (roller) | Styreleder Egil Olav Hogna, daglig leder (rektor) Egil Matsen, fullt styre m/fødselsdato | Styreleder Kyrre Lekve, daglig leder (rektor) Solfrid Lind, fullt styre | JSON-API | **[V]** | Middels–høy | Lav |
| Brreg Regnskapsregisteret | 2025: driftsinntekter 2,194 mrd kr, driftsresultat **+32,7 mill. kr** | 2025: driftsinntekter 1,454 mrd kr, driftsresultat **−103,6 mill. kr** | JSON-API, full oppstilling (ikke bare hovedtall som DBH 902) | **[V]** | **Høy** | Lav |
| Stiftelsestilsynet | Tilsyn med stiftelser: vedtekter, evt. reaksjoner, styresammensetning | Samme | Nettside — **utilgjengelig fra denne økten** (DNS-oppslag feilet gjentatte ganger) | **[A]** | Lav–middels | Middels |
| Statsbudsjettet Prop. 1 S (KD, kap. 260 post 70) | Statstilskudd 2026: **445 553 000 kr** | Statstilskudd 2026: **409 598 000 kr** | HTML/PDF, offentlig dokument | **[V]** | **Høy** | Lav (årlig oppdatering) |
| Tildelingsbrev/instruks fra KD | Går bare til *statlige* underliggende virksomheter — BI er ikke mottaker | Samme (ikke mottaker) | Nettside | **[V]** (negativt funn) | Lav | Lav |
| eInnsyn / offentlig journal (KD, NOKUT, HK-dir) | Korrespondanse (akkrediteringssøknader, tilsyn, klager) søkbar på avsender/mottaker «Handelshøyskolen BI» | Samme, søk på «Høyskolen Kristiania» | JS-enkeltsideapp — søkbar i nettleser, **ikke** scriptbar med curl/WebFetch i denne økten | **[A]** | Middels–høy | Middels (mange treff å sortere manuelt) |
| NOKUT — tilsynsrapporter/akkrediteringsvedtak | Publiseres under «Akkreditering og tilsyn» på nokut.no | Samme, inkl. egne doktorgradsakkrediteringer | Nettside/PDF | **[A]** | Middels | Lav–middels |
| NOKUT — underviserundersøkelsen | Nasjonal hovedrapport 2017/2021 finnes; institusjonsresultater sendes **kun** til institusjonen selv | Samme begrensning | PDF (nasjonalt nivå); institusjonsnivå er ikke offentlig | **[V]** | Lav direkte, høy som innsynsargument | Lav |
| Partnerlister på egne nettsider | BI oppgir selv «over 200» utvekslingspartnere globalt | Kristianias sidekart: egne landsider for utveksling i **38 land** | HTML | **[V]** | Middels–høy | Lav–middels |
| Erasmus+ Project Results / CORDIS | EU-finansierte prosjekter der BI er partner | Samme for Kristiania | Web-app; søke-API svarte **403 Forbidden** på automatiserte kall i denne økten | **[A]** | Middels | Middels |
| Cristin/NVA API | Institusjons-ID **158**: 188 registrerte prosjekter, 34 170 registrerte resultater (alle år) | Institusjons-ID **1615**: 175 registrerte prosjekter, 12 000 registrerte resultater | JSON-API, ingen nøkkel | **[V]** | **Høy** | Lav |
| Forskningsrådets prosjektbank | Nettportal finnes og er søkbar i nettleser | Samme | Web-app; direkte søke-URL med institusjonsfilter ga 404 på automatiserte forsøk i denne økten | **[A]** | Middels | Middels |
| Doffin (anskaffelser) | BI som oppdragsgiver/leverandør | Kristiania som oppdragsgiver/leverandør | Fritt websøk; **API krever gratis abonnementsnøkkel** (ikke innhentet — grenser mot kontoopprettelse) | **[A]** | Lav–middels | Lav (web), middels (API) |
| TED (EU-anskaffelser) | Større IT-/bygg-anskaffelser over EØS-terskelverdi | Samme | Web/API | **[A]** | Lav | Middels |
| NAV arbeidsplassen — stillings-API | 4 aktive annonser nå (Security Architect, jurist, .NET/AI-utvikler, høyskolelektor) — vekstsignal | Søket er **ubrukelig**: «Kristiania» matcher gamle Oslo-navnet, ikke arbeidsgiveren | JSON-API, ingen nøkkel | **[V]** | Middels | Lav |
| Meta Ad Library | Annonsekampanjer mot programsøkere | Samme | Web — blokkerer automatiserte kall (403), må gjøres manuelt i nettleser | **[A]** | Middels | Lav (manuelt) |
| Google Ads Transparency Center | Samme | Samme | Web-app, JS-rendret, tilgjengelig (HTTP 200) men ikke skrapet i denne økten | **[A]** | Middels | Lav |
| Wayback Machine (CDX-API) | bi.no arkivert siden **1997**, tusenvis av snapshots | kristiania.no arkivert siden **2004** | JSON CDX-API, ingen nøkkel | **[V]** | Middels–høy | Lav |
| Lånekassen statistikk | Portal med kategorier (Studenter i Norge, Tilbakebetaling m.m.) | Samme | Nettside/dashbord — institusjonsnivå ikke bekreftet i denne økten | **[A]** | Middels | Lav–middels |
| Econa lønnsstatistikk | Medlemsundersøkelse, siteres i presse for NHH/BI-kandidater | Mindre dekning for Kristiania-kandidater | Rapport/presse | **[A]** (fra tidligere notat) | Lav | Middels |
| Rangeringer (FT, QS, Universum) | BI: FT topp 50 Europa (kjent fra tidligere notat) | Ikke rangert internasjonalt på samme måte | Web | **[A]** | Lav–middels | Lav |
| Lovdata / Felles klagenemnd | Mulige fuskesaker/utestengelser kan nevne institusjonen | Samme | Nettside, søkbar; ingen konkret sak verifisert i denne økten | **[A]** | Lav–middels | Middels |
| Eiendom/campus-leieavtaler | Ikke undersøkt i denne økten — krever grunnbok/kommunale planinnsyn | Kristianias campusleie i Oslo/Bergen — samme begrensning | Grunnbok/kommunearkiv | **[A]** | Middels | Høy |

## 3. Prioritert handlingsplan

| # | Steg | Hvor i appen/kjeden | Anslag |
|---|---|---|---|
| 1 | **Regnskapsregisteret som supplement til DBH 902.** Hent `driftsinntekter`/`driftsresultat` for BI (971228865) og Kristiania (954831604) fra `data.brreg.no/regnskapsregisteret/regnskap/{orgnr}` — friskere enn DBH og viser Kristianias underskudd i 2025 tydelig. | `build-economy.py` eller ny liten modul, økonomikortet | 2–3 t |
| 2 | **Statstilskudd fra Prop. 1 S kap. 260 post 70** som håndført, årlig tall ved siden av skolepengeinntekt (DBH 902) — viser statlig/privat finansieringsmiks direkte. | Ny kolonne/felt i økonomikortet | 1–2 t + årlig |
| 3 | **Styre- og ledelseskort fra Brreg roller-API**: daglig leder (rektor), styreleder, antall ansatte, konsernstatus (er/er ikke konsern) — enkelt, gratis, og synliggjør eierskapsforskjellen mellom BI og Kristiania. | Nytt lite kort på markedsstatus/fakultetssiden for HH | 2–3 t |
| 4 | **Cristin/NVA-forskningsprofil** (antall prosjekter, antall registrerte resultater) som nytt mål i «Fagmiljøet»-kortet ved siden av DBH 373/374. | `build-staff.py` (institusjonslister), Fagmiljø-kortet | 3–4 t (paginert API) |
| 5 | **Internasjonale partnerlister** (BI 200+, Kristiania 38 land) som statisk faktaboks med kildelenker. | Markedsstatus-laget | 1–2 t |
| 6 | **eInnsyn-søk (manuelt, av Mathias)** mot KD/NOKUT/HK-dir for korrespondanse om akkreditering/tilsyn av BI og Kristiania — kan gi tilgang til dokumenter (tilsynsbrev, søknader) som ellers ikke er offentlige. Ikke noe agenten skal sende selv. | Utenfor appen — research-oppgave | Middels, manuelt |
| 7 | **NAV-stillingsannonser som kvalitativt vekstsignal for BI** (droppes for Kristiania pga. navnekollisjon, med mindre API-et støtter filtrering på organisasjonsnummer via en annen parameter). | Eksperimentelt, egen liten modul | 2–3 t |
| 8 | **Wayback Machine for historiske studieavgifter**, som utvidelse av det allerede planlagte håndførte `studieavgift.json`-tiltaket (se `bi-kristiania-datakilder.md` steg 6) — gir en trendlinje i stedet for ett øyeblikksbilde. | `data/hh/kilder/studieavgift.json` | 3–4 t |
| 9 | Valgfritt/senere: Doffin/TED-anskaffelser, Meta/Google annonsetransparens, eiendom/campusleie, Felles klagenemnd. Høyere innsats og lavere direkte nytte for HH-sammenligningen akkurat nå. | — | — |

Anbefalt rekkefølge: 1 → 3 → 2 → 5 → 4 → 6 → 7 → 8. Steg 1–3 er de billigste og gir mest ny, verifisert informasjon.

## 4. Juridiske og etiske merknader

- **Offentleglova gjelder ikke BI og Kristiania direkte** — de er private stiftelser, ikke forvaltningsorganer. Men
  korrespondanse *mellom* dem og offentlige organer (Kunnskapsdepartementet, NOKUT, HK-dir, Forskningsrådet) er en
  del av det offentlige organets journal og **kan** kreves innsyn i etter offentleglova, typisk via eInnsyn eller en
  direkte innsynsbegjæring til organet. Slike begjæringer skal **ikke** sendes av agenten — bare metoden er
  beskrevet her, for at Mathias eventuelt kan sende dem selv.
- **Personopplysninger**: styremedlemmers navn og fødselsdato hentet fra Brønnøysundregistrene er lovlig offentliggjort
  grunnlagsdata etter foretaksregisterloven/stiftelsesloven, og greit å bruke til å beskrive institusjonenes styring.
  Vi bør likevel begrense bruken til styre-/lederrolle og ikke bygge videre personprofiler.
- **Årsregnskap** i Regnskapsregisteret er innsendt etter regnskapsloven og er offentlige dokumenter — fri bruk med
  kildehenvisning til Brønnøysundregistrene.
- **Statsbudsjettet** (Prop. 1 S) er et offentlig dokument fra regjeringen.no — fri bruk med kildehenvisning.
- **Ingen innlogging** ble brukt noe sted i denne økten. **Ingen skjemaer eller innsynsbegjæringer** ble sendt. Doffins
  API krever en gratis abonnementsnøkkel via registrering — dette ble bevisst **ikke** gjort, siden det ligger nær
  grensen mot kontoopprettelse; Doffins vanlige nettsøk er derimot fritt tilgjengelig uten registrering.
- **robots.txt/skånsomhet**: oppslag ble gjort som enkeltstående kall per kilde, ikke masseuttrekk. Da DuckDuckGo
  begynte å svare med rate-limit (HTTP 202), ble søk mot den tjenesten avsluttet i stedet for å presse på.
  Stiftelsestilsynet.no var ikke nåbart fra denne økten (DNS-oppslag feilet) og bør forsøkes på nytt fra et annet
  nettverk før det legges inn i handlingsplanen som verifisert.
- **Meta Ad Library / Google Ads Transparency Center** viser bare offentlig, aggregert annonseinnhold — ingen
  personopplysninger om enkeltbrukere er hentet eller etterspurt.
- Ingen av kildene i dette notatet inneholder studentdata eller andre personopplysninger utover styre/ledelse på
  institusjonsnivå.

## 5. Filer i `data/nmbu/kilder/bi-kristiania/alternative/`

- `bi_enhet_971228865.json`, `kristiania_enhet_954831604.json`: full enhetsdata fra Brreg Enhetsregisteret.
- `bi_roller_971228865.json`, `kristiania_roller_954831604.json`: styre og daglig leder fra Brreg roller-API.
- `bi_regnskap_971228865.json`, `kristiania_regnskap_954831604.json`: årsregnskap 2025 fra Regnskapsregisteret.
- `prop1s_kd_ch7.html`, `prop1s_kd_tilskudd_private_hoyskoler_utdrag.html`: Prop. 1 S (2025–2026), KD-kapittelet,
  med tabellen «Rammeløyving til universitet og høgskular over kap. 260» (utdrag rundt BI/Kristiania-radene).
- `cristin_bi_inst.json`, `cristin_k_inst.json`, `cristin_bi_institusjon.json`, `cristin_k_institusjon.json`:
  institusjons-oppslag i Cristin (ID 158 og 1615).
- `cristin_bi_prosjekter_prove.json`, `cristin_k_prosjekter_prove.json`: prøveuttrekk av prosjekter fra Cristin-API-et.
- `nav_stillinger_bi.json`, `nav_stillinger_k.json`, `nav_stillinger_k2.json`: prøveuttrekk fra NAVs
  stillingsannonse-API.
- `wayback_bi_domain.json`, `wayback_k_domain.json`: CDX-oppslag som viser arkiveringsdybde for bi.no og
  kristiania.no.
- `doffin_bi_test.json`, `einnsyn_test.json`: dokumentasjon av at disse APIene krever nøkkel/ikke er scriptbare
  direkte (negative funn, se kildetabellen).
