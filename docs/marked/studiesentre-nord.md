# Studiesentre i Nord-Norge og Trøndelag: mulige eksamenspartnere for HH

Arbeidsnotat 17.10.2026 (Opus 5.5). Data: `data/marked/studiesentre/nord.json` (25 poster). Cache av kildene ligger i
`data/marked/studiesentre/kilder/nord/` (gitignorert). Dekker Finnmark, Troms, Nordland og Trøndelag.

## 1. Kort oppsummert

- **25 steder:** Finnmark 6, Troms 4, Nordland 8, Trøndelag 7. 19 er studiesentre (eller studiesteder under dem),
  4 er regionale kompetansekontorer eller kunnskapsparker, 1 er kommunal voksenopplæring og 1 er bare kjent fra en
  tilskuddsliste.
- **Eksamen for andre institusjoner, bekreftet:** to steder har en uttalt ordning for eksterne studenter i dag:
  - **Campus Nord-Troms** (Storslett): gjelder studenter fra alle norske institusjoner som tillater lokal eksamen.
    Gratis for UiT, 750 kr for andre.
  - **Studiesenteret Midt-Troms** (Finnsnes): 600 kr per eksamen. Studenten søker selv sin institusjon.
- **Eksamen nevnt, men svakere grunnlag:** RKK Vesterålen («mulighet til å gjennomføre eksamen lokalt»), KIGOK i
  Gildeskål (tekst som viser til det nedlagte Studiesenteret.no), Kirkenes kompetansesenter (eksamensside fra 2009,
  over 40 eksamener i året) og Øst-Finnmark kunnskapssenter / Studiesenteret i Vadsø (eksamen for egne
  samlingsbaserte studier i Nobile flerbrukshall).
- **Ingen av kildene nevner digital eksamen** (PC, Inspera, WISEflow). Det må avklares direkte med hvert senter.

## 2. Kilder og metode

1. **Oversikter:**
   - Medlemslisten til Norske utdannings- og studiesentre (NU), med 22 medlemmer, hvorav 11 i nord (Tynset regnes
     til Innlandet).
   - HK-dirs tildelinger til drift av studiesentre for 2022, 2023 og 2024: regjeringen.no-pressemeldinger og
     HK-dir-PDF-en for 2023. For 2025 og 2026 finnes ingen utlysning på HK-dir.
   - Oxford Research (2022) om studiesentre.
   - Søk etter navnene i Enhetsregisteret (studiesenter, kompetansesenter, kompetansekontor, RKK osv. med adresse i
     fylkene 18/50/55/56).
2. **Hvert senter:** egen nettside, særlig sider om eksamen, lokaler og kontakt. Ved behov også Enhetsregisteret
   (adresse og eierform).
3. **Koordinater:** Kartverkets adressesøk (`ws.geonorge.no/adresser/v1/sok`) på besøksadressen. Disse adressene ga
   ikke eksakt treff, så de har `null` i koordinatene:
   - Rådhusgata 9, Sortland
   - Ringveien 2, Tana (bare treff på 2A–2C)
   - Bardufoss og SSTS (ingen gateadresse oppgitt)
   - Kåfjord
4. **Personvern:** bare felles e-post, sentralbord og felles kontortelefon er tatt med. Mange sentre oppgir bare
   ansattes e-post og telefon. Der står feltene som `null`.

NB: Domenet `studiesenteret.no` er ikke lenger Studiesenteret Finnsnes/Midt-Troms, men en urelatert blogg. Senteret
bruker `ssmt.no`.

## 3. Stedene

| Fylke | Sted | Senter | Eksamen for andre | Sikkerhet |
|---|---|---|---|---|
| Finnmark | Hammerfest | Uniq – Studiesenter Hammerfest (Pro Barents) | ikke omtalt | sikker |
| Finnmark | Kirkenes | Øst-Finnmark kunnskapssenter (Sør-Varanger Utvikling) | ikke omtalt | sikker |
| Finnmark | Tana | ØFK HUB Tana | ikke omtalt | sannsynlig |
| Finnmark | Vadsø | ØFK HUB Vadsø | eksamen i egne studier | sannsynlig |
| Finnmark | Vadsø | Studiesenteret i Vadsø (Nobile, Vadsø kommune) | eksamenslokale | sannsynlig |
| Finnmark | Kirkenes | Kirkenes kompetansesenter (kommunal voksenopplæring) | ja (2009) | usikker |
| Troms | Finnsnes | Studiesenteret Midt-Troms | **ja** | sikker |
| Troms | Bardufoss | Studiesenteret Midt-Troms, Bardufoss | ikke omtalt | sannsynlig |
| Troms | Storslett | Campus Nord-Troms | **ja, alle institusjoner** | sikker |
| Troms | Kåfjord | Kåfjord kommune, samisk studiesenter (tilskudd 2024) | ukjent | usikker |
| Nordland | Sortland/Myre | Studiesenter RKK Vesterålen | ja (lite detaljer) | sikker |
| Nordland | Svolvær | RKK Lofoten | ikke omtalt | sannsynlig |
| Nordland | Inndyr | KIGOK – Kunnskapssenteret i Gildeskål | ja (trolig gammel tekst) | sannsynlig |
| Nordland | Fauske | RKK Salten | ikke omtalt | sannsynlig |
| Nordland | Mo i Rana | Ditt studiesenter / Dov Learoejarnge (Kunnskapsparken Helgeland) | ikke omtalt | sannsynlig |
| Nordland | Mosjøen | Studiesenteret RKK Vefsn | ikke omtalt | sikker |
| Nordland | Sandnessjøen | Studiesenter RKK Ytre Helgeland | ikke omtalt | sikker |
| Nordland | Brønnøysund | RKK Sør-Helgeland | ikke omtalt | sannsynlig |
| Trøndelag | Namsos | Namdal studiesenter | ikke omtalt | sikker |
| Trøndelag | Bjugn | Fosen studiesenter, Fosen vgs. | ikke omtalt | sikker |
| Trøndelag | Vanvikan | Fosen studiesenter, Johan Bojer vgs. | ikke omtalt | sikker |
| Trøndelag | Åfjord | Fosen studiesenter, Åfjord vgs. | ikke omtalt | sikker |
| Trøndelag | Orkanger | Studiesenteret Trøndelag sørvest | ikke omtalt | sikker |
| Trøndelag | Støren (Oppdal, Røros) | Studiesenter Trøndelag Sør | ikke omtalt | sannsynlig |
| Trøndelag | Steinkjer | Prios Kompetanse studiesenter | ikke omtalt | sannsynlig |

## 4. Hull og forbehold

- **Ingen studiesenter funnet i** Alta, Karasjok, Kautokeino, Lofoten (utover RKK Lofoten), Narvik, Harstad, Tromsø,
  Bodø eller Stjørdal. Disse stedene har i stedet campus for UiT, Nord universitet eller Sámi allaskuvla. Campusene
  er ikke kartlagt her.
  - UiT sier at skoleeksamen normalt holdes i egne lokaler.
  - Et eldre skjema fra UiT Narvik åpner for eksamen andre steder mot gebyr.
- **Lofoten:** et «Lofoten studie- og høyskolesenter» med studierom i seks kommuner er omtalt rundt 2015. Det er ikke
  bekreftet at det finnes i dag.
- **Andre sentre:** Tana studiesenter var uten aktivitet i 2022 og er nå ØFK HUB Tana.
- **Bare kjent fra tilskuddslisten 2024:** Grønt kompetansesenter Trøndelag (Skjetlein?). Kontaktinfo er ikke funnet,
  og senteret er ikke tatt med.
- **Utenfor min del:** Tynset studie- og høgskolesenter dekker også Røros og Holtålen, men ligger i Innlandet.
- **Ikke tatt med:** Blått kompetansesenter (Hitra/Finnsnes), som er en kursleverandør innen havbruk.
- **RKK-kontorene i Nordland** (Lofoten, Salten, Sør-Helgeland) arbeider mest med kompetanseutvikling i skole og
  barnehage. De er med fordi de dekker steder som ble etterspurt, men de er neppe eksamenspartnere uten videre.
- **Datakvalitet:** «Sikker» betyr at opplysningene finnes på senterets egen nettside eller i Enhetsregisteret. At
  ingen eksamensordning er omtalt, betyr ikke at senteret ikke kan avvikle eksamen. Det må spørres direkte.
- **Mest lovende partnere:** Campus Nord-Troms og Studiesenteret Midt-Troms har etablerte eksamensordninger med
  gebyr. De elleve NU-medlemmene i nord er naturlige kontaktpunkter, og det er NU-nettverket også.

## 5. Sammendrag

Kartlagt 25 steder i Nord-Norge og Trøndelag: Finnmark 6, Troms 4, Nordland 8 og Trøndelag 7. Grunnlaget er
NU-medlemslisten, HK-dirs tildelinger 2022–2024, Enhetsregisteret og sentrenes egne nettsider.

Bare to steder har en dokumentert, gjeldende ordning der studenter fra andre institusjoner kan ta eksamen lokalt:
- Campus Nord-Troms (alle institusjoner som tillater det, UiT gratis, 750 kr for andre)
- Studiesenteret Midt-Troms (600 kr)

Fem steder nevner eksamen med svakere eller eldre grunnlag: RKK Vesterålen, KIGOK, Kirkenes kompetansesenter (2009),
og ØFK/Studiesenteret i Vadsø (egne studier). Ingen kilder nevner digital eksamen.

Hull:
- Ingen studiesenter er funnet i Alta, Karasjok, Kautokeino, Narvik, Harstad, Tromsø, Bodø eller Stjørdal. Der
  finnes bare universitetscampuser, som ikke er kartlagt.
- Lofoten har bare et RKK for skole og barnehage.
- Studiesenter Trøndelag Sør og Kåfjord mangler adresse.
- Mange sentre oppgir bare personlige kontaktdata.
- Ingen kilder nevner kapasitet til eksamen.
