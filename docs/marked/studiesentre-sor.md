# Studiesentre som mulige eksamenspartnere: Vestlandet, Sørlandet og Østlandet

Arbeidsnotat 17.10.2026 (Opus 5.5). Data: `data/marked/studiesentre/sor.json` (39 poster). Nedlastede sider og PDF-er
ligger i `data/marked/studiesentre/kilder/sor/` (gitignorert). Dette notatet dekker Møre og Romsdal, Vestland, Rogaland,
Agder, Telemark, Vestfold, Buskerud, Akershus, Oslo, Østfold og Innlandet. Nord-Norge og Trøndelag ligger i
`studiesentre-nord.md`.

Formålet er å finne lokale steder der HH kan avvikle fysiske eksamener for nett- og deltidsstudenter som bor langt
fra Ås.

## 1. Kort oppsummert

- **39 steder** fra 19 studiesenterorganisasjoner, Karriere Innlandets seks karrieresentre og fem campuser/kunnskapsmiljøer
  som er tatt med fordi stedet var etterspurt (HVL Førde, Sogndal og Haugesund, USN Gol og Campus Kristiansund).
- **Bekreftet eksamensavvikling for andre:** bare **Tynset Studie- og høgskolesenter** skriver uttrykkelig at studenter
  fra andre studiesteder kan avlegge skriftlig og muntlig eksamen der. Tre andre nevner eksamen:
  - **Gardermoakademiet** (Jessheim): eksamenslokaler «for enkelte studier og samarbeidspartnere».
  - **Studiesenter Kysten**: «tilrettelegging for eksamen».
  - **Nissedal studiesenter**: «eksamenshjelp og gjennomføring av eksamen», tydeligst for privatister på
    videregående nivå.

  Ingen av dem oppgir hvilke institusjoner de avvikler eksamen for. Ingen omtaler digital eksamen (Inspera/WISEflow)
  for eksterne.
- **Negativt funn:** HVL skriver at eksterne studenter ikke kan ta eksamen i HVLs lokaler. Det gjelder alle HVL-campuser.
- **Institusjonsregler peker mot studiesentrene:** NTNU (Gjøvik) godtar eksamen utenfor campus bare ved universitet,
  høgskole eller «offentlig studiesenter». Lokalt eksamenssted må bekrefte lokaler og en eksamensansvarlig.

## 2. Oversiktskilder

| Kilde | Bruk |
|---|---|
| Norske utdannings- og studiesentre (NU), medlemsliste og «Besøk våre utdanningssentre» | Hovedlisten over aktive sentre og kommunene de dekker |
| KD-pressemeldinger 2023 og 2024 om driftstilskudd til studiesentre (HK-dir-ordningen) | Hvem som får statlig driftsstøtte (27 sentre i 2023, 31 i 2024) |
| «Studiesentera i Vestland» (SIV), omtalt på hvkstudiesenter.no | De fire studiesentrene i Vestland: HVK, StudieHub, Kysten, Sogn Kompetanse |
| Karriere Innlandet (Innlandet fylkeskommune) | Karrieresentrene, som fikk studiesentertilskudd i 2023 |
| Telemark fylkeskommune, retningslinjer for studiesenterordninga 2025 | Fylkesordningen (ramme 1,58 mill. kr i 2025). Mottakerne er ikke publisert |
| NTNU kunnskapsbase, HVL eksamensside | Institusjonenes regler for eksamen utenfor campus |
| Kartverkets adressesøk (ws.geonorge.no) | Koordinater og kommunenummer |

Merk: domenet studiesenteret.no har i dag uvedkommende innhold, og studiesenter.no er til salgs. Nettverket
«Studiesenteret.no» (Hallingdal m.fl.) finnes ikke lenger som eget nettsted. I Hallingdal er rollen overtatt av
Utdanningssenteret på Geilo og USN studiested Gol.

## 3. Metode

- Én post per fysisk sted. Studentstover og huber med egen adresse og møte- eller undervisningsrom har fått egne
  poster: seks for HVK, to ekstra for StudieHub, én ekstra for Kysten og to ekstra for Sogn Kompetanse. Mindre
  leseplasser er beskrevet i `lokaler` på hovedposten.
- Bare kontaktinformasjon til organisasjonen er tatt med. Der det felles nummeret på nettsiden viste seg å være daglig
  leders mobil, er `telefon` satt til null: Tynset, Ryfylke, Gardermoakademiet, Sogn Kompetanse og flere. Det står i
  `merknad`.
- `tilbyrEksamen` er `true` bare når senteret selv nevner eksamen, og `false` bare når stedet eksplisitt avviser
  eksterne (HVL). Ellers er feltet `null`. `eksamenFor` er tom overalt, fordi ingen kilde navngir institusjoner.
- Koordinater er hentet fra Kartverket på besøksadressen. Fire poster mangler treff: Lister (Stasjonsgata 26 finnes
  ikke i adresseregisteret), Eidfjord (Sentrumstunet), Setesdal (bare «Kommunehuset i Valle») og poster uten kjent
  adresse (Østre Agder, Campus Trysil, Campus Indre Østfold).

## 4. Steder per fylke

| Fylke | Antall | Steder |
|---|---|---|
| Vestland | 16 | HVK (Odda, Voss, Husnes, Øystese, Ulvik, Eidfjord), StudieHub (Nordfjordeid, Stryn, Iglandsvik), Studiesenter Kysten (Florø, Måløy), Sogn Kompetanse (Øvre Årdal, Aurland, Lærdal), HVL Førde, HVL Sogndal |
| Innlandet | 9 | Tynset SH, Campus Kongsvinger, Karriere Innlandet (Otta, Vinstra, Gran/Hadeland, Leira/Valdres, Tynset, Elverum), Campus Trysil (usikker) |
| Rogaland | 3 | Dalane utdanningssenter (Egersund), Ryfylke utdanningssenter (Hjelmeland), HVL Haugesund |
| Agder | 3 | Lister Kompetanse (Lyngdal), Studiested Setesdal (Valle), Studiested Østre Agder (usikker) |
| Buskerud | 2 | Utdanningssenteret på Geilo, USN studiested Gol |
| Møre og Romsdal | 2 | Studiesenteret Romsdal (Åndalsnes), Campus Kristiansund |
| Akershus | 1 | Gardermoakademiet (Jessheim) |
| Østfold | 1 | Campus Indre Østfold (Mysen, under oppbygging, usikker) |
| Oslo | 1 | Samisk Hus Oslo (språksenter med studiesentertilskudd) |
| Telemark | 1 | Nissedal studiesenter (Treungen) |
| Vestfold | 0 | Ingen funnet |

## 5. Hull og forbehold

- **Ingen studiesenter funnet** i Kongsbergregionen og Numedal (regionen viser bare til USN og Fagskolen i Viken),
  Notodden, Vest-Telemark utenom Nissedal, Vestfold og Haugalandet. Sunnmøre er ikke undersøkt. Valdres, Hadeland og Nord-Gudbrandsdal
  har bare Karriere Innlandets karrieresentre. Ingen av dem nevner eksamen.
- **Adresse ikke bekreftet:** Studiested Østre Agder, Studiested Setesdal (bare IPR-kontoret), Campus Indre Østfold
  (saksdokumentene ga 404) og Campus Trysil (nettstedet svarer ikke, mulig inaktivt).
- **Ikke undersøkt systematisk:** folkehøgskoler, videregående skoler og folkebibliotek som eksamenslokale. Heller ikke
  om USN, UiA, INN eller Høgskolen i Molde tar imot eksterne kandidater. Det siste ga ingen treff, men HVL sier nei.
- Kapasitet er sjelden oppgitt. Største oppgitte rom: Campus Kongsvinger (auditorium til 102), Gardermoakademiet
  (ca. 30 + 25), Tynset (ca. 30), Husnes (25), Eidfjord (22) og Odda (20).
- Neste steg: send en kort forespørsel til de fire sentrene som nevner eksamen, og til NU, om pris, eksamensvakter,
  nettverk for PC-eksamen og hvilke institusjoner de allerede avvikler for.

## 6. Sammendrag

Del sør har 39 steder: Vestland 16, Innlandet 9, Rogaland 3, Agder 3, Buskerud 2, Møre og Romsdal 2, og ett hver i
Akershus, Østfold, Oslo og Telemark. Vestfold har ingen. Grunnlaget er NUs medlemsliste, KDs tildelingslister for
2023–2024, Studiesentera i Vestland og Karriere Innlandet.

Bare Tynset Studie- og høgskolesenter bekrefter uttrykkelig at det avvikler eksamen for studenter ved andre
studiesteder. Gardermoakademiet (eksamenslokaler for enkelte samarbeidspartnere), Studiesenter Kysten («tilrettelegging
for eksamen») og Nissedal studiesenter («gjennomføring av eksamen») nevner også eksamen, men ingen av de fire navngir
institusjoner eller digital eksamen. HVL avviser eksterne eksamenskandidater på alle campuser. NTNU godtar «offentlig
studiesenter» som eksamenssted.

Hull: Kongsberg/Numedal, Notodden, Vest-Telemark (utenom Nissedal), Vestfold og Haugalandet har ikke noe
studiesenter, og Sunnmøre er ikke undersøkt. Valdres, Hadeland og Otta har bare fylkets karrieresentre. Adressen mangler for Østre Agder, Setesdal,
Indre Østfold og Trysil. Kapasitet og eksamensvilkår må avklares direkte med sentrene.
