# Etterprøving 1: DBH-tallene i handelshøyskolerangeringen

Utført 03.10.2026 mot DBH-API-et (live), uavhengig av prosjektets cache (`data/rangering/dbh/`) og av `build-rangering.py` (kun definisjonene er lest). Eget skript og rådata ligger i økt-scratchpad, ikke i prosjektet.

## Konklusjon

**OK for tallene, med tre merknader om avgrensning (ingen regnefeil).**

- Alle 540 sammenlignede verdier (18 enhetsoppsett × 3 år 2023–2025 × 10 mål) ligger innenfor 0,5 % av klarteksten, eller avviker bare ved avrunding (13 tilfeller, se tabell 1). Absolutte størrelser (poeng, publikasjoner, årsverk, andeler) avviker maksimalt 0,05 (= avrundingsenheten); antall publikasjoner er identiske.
- Ingen avvik > 0,5 % som ikke forklares av avrunding. De 9 «avvikene» som en naiv sammenligning gir, er 3 tilfeller 0 = 0 (HiØ har ingen rekrutteringsstillinger/nivå 2-poeng) og 6 tomme HVL-verdier for 2023 (se 1c).
- Avdelingskodene i `dbhEnhet` er riktige enheter ifølge DBH tabell 210 (se tabell 2). Ingen kode peker på feil enhet. Merknader: (a) HVL har bare to år fordi koden 250350 først finnes fra 2024; (b) Kristiania 2023–25 er to «Schools» som ikke tilsvarer «Fakultet for ledelse og økonomi»; (c) BI: DBHs totalrad og sum av avdelinger er ikke like i 2023 og 2025.
- Tre stikkprøver mot HK-dir V15.1 (institusjonsnivå): NHH, BI og UiS treffer innenfor ±1,7 % (se tabell 3); klarteksten avviker ikke mer enn ±1,1 % fra V15.1 for disse. Svakeste institusjon: NMBU (egen utregning 1,8–3,2 % under V15.1).

## 1. Avvikstabeller

### 1a. Avvik større enn 0,5 % etter at jeg har tatt bort rene avrundingsavvik
Ingen. (Definisjon: relativt avvik > 0,5 % og absolutt avvik større enn en halv avrundingsenhet i klarteksten.)

### 1b. Avvik > 0,5 % som skyldes avrunding i klarteksten (ikke feil)
Små nevnere gjør at tallet med 1–2 desimaler får et stort relativt avvik. Alle ligger innenfor halv avrundingsenhet (klartekstens 2 desimaler for kvotene).

| skole | år | mål | klartekst | egen utregning | rel. avvik | abs. avvik |
|---|---|---|---|---|---|---|
| nord | 2023 | poengPerUff | 0.6 | 0.6042 | +0.70 % | 0.0042 (halv enhet 0.005) |
| nord | 2023 | poengPerFaglig | 0.79 | 0.7856 | -0.55 % | 0.0044 (halv enhet 0.005) |
| nord | 2025 | poengPerFaglig | 0.8 | 0.8047 | +0.59 % | 0.0047 (halv enhet 0.005) |
| uit | 2023 | poengPerFaglig | 0.67 | 0.6657 | -0.64 % | 0.0043 (halv enhet 0.005) |
| uit | 2024 | poengPerUff | 0.59 | 0.5931 | +0.52 % | 0.0031 (halv enhet 0.005) |
| uit | 2025 | poengPerUff | 0.75 | 0.7454 | -0.61 % | 0.0046 (halv enhet 0.005) |
| usn | 2024 | poengPerUff | 0.92 | 0.9152 | -0.53 % | 0.0048 (halv enhet 0.005) |
| oslomet | 2023 | poengPerUff | 0.89 | 0.8852 | -0.54 % | 0.0048 (halv enhet 0.005) |
| oslomet | 2025 | poengPerUff | 0.62 | 0.6232 | +0.51 % | 0.0032 (halv enhet 0.005) |
| hvl | 2024 | poengPerUff | 0.49 | 0.4869 | -0.63 % | 0.0031 (halv enhet 0.005) |
| hvl | 2025 | poengPerUff | 0.48 | 0.4843 | +0.90 % | 0.0043 (halv enhet 0.005) |
| hiof | 2025 | poengPerUff | 0.2 | 0.1954 | -2.30 % | 0.0046 (halv enhet 0.005) |
| hiof | 2025 | poengPerFaglig | 0.21 | 0.2063 | -1.74 % | 0.0037 (halv enhet 0.005) |

### 1c. Strukturelle avvik (verdi mangler/null, ikke tallfeil)
| skole | år | mål | klartekst | egen | kommentar |
|---|---|---|---|---|---|
| hvl | 2023 | alle | mangler (tom) | 0 | `dbhEnhet` = 250350 («Handelshøgskulen HVL»), gyldig fra 2024-1 i tabell 210; ingen data 2023 og tidligere. Klarteksten har bare 2024 og 2025 for HVL, så tomt er konsistent, men serien er kort. Forgjengeren i 2017–2023 er trolig 240220 «Institutt for økonomi og administrasjon» (Fakultet for økonomi og samfunnsvitskap, 240xxx, gyldig til 2023-3; 15,6 publiseringspoeng i 2023), som ikke er med. |
| hiof | 2023, 2024 | rekruttering | 0,0 | 0,0 | 0 = 0 (ingen UN2-stillinger). |
| hiof | 2025 | niva2Andel | 0,0 | 0,0 | 0 = 0 (hele publiseringspoengene er nivå 1). |

### 1d. DBH-interne avvik som påvirker tallene (ikke avvik fra klarteksten)
| enhet | år | observasjon |
|---|---|---|
| BI (8241) | 2023 | tabell 373: totalrad 536,8 poeng, sum avdelingsrader 531,9 (+0,9 %). |
| BI (8241) | 2025 | tabell 373: totalrad 516,9, sum avdelinger 497,8 (+3,8 %). |
| BI (8241) | 2023 | tabell 374: totalraden 000000 er ufullstendig (2,0 poeng mot 531,9 i avdelingene). Skriptet bruker avdelingene her, og det er riktig. |
| BI (8241) | 2025 | tabell 374: totalrad 9,6 poeng mot 497,8 i avdelingene (nivå 2-andel 59,8 % mot 61,7 % hvis man brukte totalraden). |

Klarteksten bruker 373-totalraden for `publPoeng` (536,8 / 516,9) men 374-avdelingssummene som nevner for `niva2Andel`. Det er en liten inkonsistens (nivå 2-andelen for BI 2025 hviler på 497,8, poengene på 516,9), men begge er DBHs egne tall. HK-dirs publiserte V15.2 gir BI 533,9 (2023) og 507,3 (2025), altså litt andre tall enn dagens DBH (revisjon). Dette forklarer at BI i V15.1 (1,26 / 1,25) er litt under klarteksten (1,27 / 1,26).

## 2. Avdelingskoder mot DBH tabell 210 (avdelingsnavn)

Navnene kommer fra tabell 210 med `kodetekst: "J"` (som gir `Avdelingsnavn` og `Institusjonsnavn`; prosjektets cache brukte `kodetekst: "N"` og har derfor aldri hatt navn). Alle koder finnes i 210 for riktig institusjon.

| skole | institusjon | koder (navn i 210) | vurdering |
|---|---|---|---|
| NHH | 1240 Norges handelshøyskole | hele institusjonen | OK |
| BI | 8241 Handelshøyskolen BI | hele institusjonen | OK |
| NMBU | 1173 | 470000 Handelshøyskolen; 470100 HH – Fakultetsadm.; 470200 HH – Avd. for studieutvikling og livslang læring; 470210 HH – Forskningsadm.; 470220 HH – Skatteforsk | OK (alle under fakultet «Handelshøyskolen») |
| UiS | 1160 | 230000 Handelshøyskolen ved UiS; 230100 Fakultetsadm. HH-UIS; 230220 Avd. innovasjon, ledelse og markedsføring; 230230 Avd. regnskap og rettsvitenskap; 230240 Avd. samfunnsøkonomi og finans | OK |
| UiA | 1171 | 415000 Handelshøyskolen ved UiA; 415210, 415220, 415230, 415240, 415250 (institutter) | OK. 415210 og 415230 er gyldige til 2024-1, 415250 («Ledelse og innovasjon») fra 2024-3: kodene lapper over hverandre riktig |
| Nord | 1174 | 510000 Handelshøgskolen (HHN) | OK |
| NTNU | 1150 | 230210 NTNU Handelshøyskolen; 230230 Institutt for samfunnsøkonomi | OK: 230210 er NTNU Handelshøyskolen. 230230 er ISØ, ikke en del av Handelshøyskolen (valget er dokumentert i skolens navn) |
| NTNU ØK | 1150 | 230000, 230100, 230210, 230220 (Inst. for internasjonal forretningsdrift), 230230, 230240 (Inst. for industriell økonomi og teknologiledelse), 230250 (Eksperter i team, fra 2026-1) | OK for «Fakultet for økonomi» |
| UiT | 1130 | 540230 Handelshøgskolen ved UiT | OK |
| USN | 1176 | 620000 Handelshøyskolen, 620100 fak.adm., 620200–620500 institutter, 620900–620940 EVU | OK (alle under fakultet «Handelshøyskolen») |
| INN | 0264 + 1177 | 440400 Institutt for økonomifag; 440500 Inst. for organisasjon, ledelse og styring | OK. Samme koder i begge institusjoner (0264 til 2024-3, 1177 fra 2024-3), begge summeres, ingen dobbelttelling |
| OsloMet | 1175 | 530350 Handelshøyskolen | OK |
| HiMolde | 0232 | 461000 Avd. for logistikk; 462000 Avd. for økonomi og samfunnsvitenskap | OK, men «alle» institusjonens to avdelinger (inkluderer logistikk) |
| HVL | 0238 | 250350 Handelshøgskulen HVL (fra 2024-1) | OK, men eksisterer bare fra 2024 (se 1c) |
| Kristiania | 8253 | 310000/310100/310200 «School of Economics, Innovation, and Technology» (gyldig til 2026-1; 310100 Institutt for teknologi til 2021-3); 330000/330100/330200/330300 «School of Communication, Leadership, and Marketing» (til 2026-1); 380000–380300 «Fakultet for ledelse og økonomi» (fra 2026-1) | **Passer delvis ikke:** navnet «Fakultet for ledelse og økonomi» tilsvarer bare 380-serien, som først gjelder fra 2026-1 og dermed ikke har data i 2018–2025. For 2018–2025 er enheten summen av to skoler som også inneholder teknologi og kommunikasjon. Tall er riktig summert, men etiketten bør forklare avgrensningen |
| HiØ | 0256 | 370300 Inst. for økonomi, innovasjon og samfunn (gyldig fra 2021-3) | OK; klarteksten starter derfor 2021 |
| UiB (ref) | 1120 | 210620 Institutt for økonomi | OK |
| UiO (ref) | 1110 | 210620 Økonomisk institutt | OK (samme kode som UiB er ren tilfeldighet: ulike institusjoner) |

## 3. Stikkprøver mot HK-dir Tilstandsrapport 2026, V15.1 (publiseringspoeng per faglig årsverk, institusjonsnivå)

V15.1 hentet fra `https://vedlegg.hkdir.no/api/collections/2026/TRHU/tables/V15.1`. Min utregning: `Publiseringspoeng` fra tabell 373, avdelingskode 000000, delt på UN1 + UN2 årsverk fra tabell 225 (stillingskategori fra 220), alle avdelinger i institusjonen. «Klartekst» = `dbhInst[år].poengPerUff`.

**Stikkprøve 1 NHH, 2 BI, 3 UiS:**

| inst. | år | klartekst | egen | V15.1 | egen vs V15.1 | klartekst vs V15.1 |
|---|---|---|---|---|---|---|
| NHH | 2023 | 0,86 | 0,864 | 0,87 | -0,7 % | -1,1 % |
| NHH | 2024 | 1,04 | 1,044 | 1,04 | +0,4 % | 0,0 % |
| NHH | 2025 | 1,19 | 1,194 | 1,21 | -1,3 % | -1,7 % |
| BI | 2023 | 1,27 | 1,267 | 1,26 | +0,6 % | +0,8 % |
| BI | 2024 | 1,27 | 1,272 | 1,27 | +0,1 % | 0,0 % |
| BI | 2025 | 1,26 | 1,262 | 1,25 | +1,0 % | +0,8 % |
| UiS | 2023 | 1,25 | 1,247 | 1,25 | -0,2 % | 0,0 % |
| UiS | 2024 | 1,27 | 1,269 | 1,28 | -0,9 % | -0,8 % |
| UiS | 2025 | 1,28 | 1,279 | 1,28 | -0,1 % | 0,0 % |

Alle ni innenfor ±2 %. NHH 2025: DBH-poengene er 335,0, identisk med V15.2, så avviket mot V15.1 (-1,3 %) ligger i nevneren (HK-dirs «faglig årsverk» gir ca. 277 mot mine 280,6 UN1+UN2). Det er ikke en feil i klarteksten.

### Alle 17 institusjoner (supplement)
| inst. (V15.1-navn) | år | klartekst | egen | V15.1 | egen vs V15.1 | klartekst vs V15.1 |
|---|---|---|---|---|---|---|
| NHH | 2023 | 0.86 | 0.864 | 0.87 | -0.7 % | -1.1 % |
| NHH | 2024 | 1.04 | 1.044 | 1.04 | +0.4 % | +0.0 % |
| NHH | 2025 | 1.19 | 1.194 | 1.21 | -1.3 % | -1.7 % |
| BI | 2023 | 1.27 | 1.267 | 1.26 | +0.6 % | +0.8 % |
| BI | 2024 | 1.27 | 1.272 | 1.27 | +0.1 % | +0.0 % |
| BI | 2025 | 1.26 | 1.262 | 1.25 | +1.0 % | +0.8 % |
| NMBU | 2023 | 1.00 | 0.997 | 1.03 | -3.2 % | -2.9 % |
| NMBU | 2024 | 1.06 | 1.056 | 1.08 | -2.2 % | -1.9 % |
| NMBU | 2025 | 1.16 | 1.159 | 1.18 | -1.8 % | -1.7 % |
| UiS | 2023 | 1.25 | 1.247 | 1.25 | -0.2 % | +0.0 % |
| UiS | 2024 | 1.27 | 1.269 | 1.28 | -0.9 % | -0.8 % |
| UiS | 2025 | 1.28 | 1.279 | 1.28 | -0.1 % | +0.0 % |
| UiA | 2023 | 1.25 | 1.249 | 1.25 | -0.1 % | +0.0 % |
| UiA | 2024 | 1.20 | 1.203 | 1.20 | +0.3 % | +0.0 % |
| UiA | 2025 | 1.18 | 1.175 | 1.18 | -0.4 % | +0.0 % |
| NU | 2023 | 0.80 | 0.798 | 0.80 | -0.2 % | +0.0 % |
| NU | 2024 | 0.82 | 0.818 | 0.82 | -0.2 % | +0.0 % |
| NU | 2025 | 0.81 | 0.808 | 0.81 | -0.3 % | +0.0 % |
| NTNU | 2023 | 1.22 | 1.218 | 1.23 | -1.0 % | -0.8 % |
| NTNU | 2024 | 1.25 | 1.245 | 1.26 | -1.2 % | -0.8 % |
| NTNU | 2025 | 1.29 | 1.289 | 1.30 | -0.9 % | -0.8 % |
| UiT | 2023 | 0.96 | 0.959 | 0.97 | -1.1 % | -1.0 % |
| UiT | 2024 | 0.91 | 0.914 | 0.92 | -0.7 % | -1.1 % |
| UiT | 2025 | 0.98 | 0.982 | 0.99 | -0.8 % | -1.0 % |
| USN | 2023 | 0.84 | 0.836 | 0.84 | -0.5 % | +0.0 % |
| USN | 2024 | 0.74 | 0.742 | 0.74 | +0.2 % | +0.0 % |
| USN | 2025 | 0.83 | 0.832 | 0.83 | +0.3 % | +0.0 % |
| INN | 2023 | 0.88 | 0.879 | 0.87 | +1.1 % | +1.1 % |
| INN | 2024 | 1.01 | 1.014 | 1.00 | +1.4 % | +1.0 % |
| INN | 2025 | 1.01 | 1.007 | 1.00 | +0.7 % | +1.0 % |
| OsloMet | 2023 | 0.94 | 0.943 | 0.95 | -0.8 % | -1.1 % |
| OsloMet | 2024 | 0.93 | 0.927 | 0.94 | -1.4 % | -1.1 % |
| OsloMet | 2025 | 0.97 | 0.973 | 0.98 | -0.7 % | -1.0 % |
| HiM | 2023 | 0.89 | 0.887 | 0.89 | -0.3 % | +0.0 % |
| HiM | 2024 | 0.67 | 0.672 | 0.68 | -1.2 % | -1.5 % |
| HiM | 2025 | 0.95 | 0.955 | 0.95 | +0.5 % | +0.0 % |
| HVL | 2023 | 0.63 | 0.629 | 0.63 | -0.1 % | +0.0 % |
| HVL | 2024 | 0.63 | 0.627 | 0.63 | -0.4 % | +0.0 % |
| HVL | 2025 | 0.67 | 0.668 | 0.67 | -0.3 % | +0.0 % |
| HK | 2023 | 0.83 | 0.834 | 0.83 | +0.4 % | +0.0 % |
| HK | 2024 | 0.77 | 0.770 | 0.77 | -0.0 % | +0.0 % |
| HK | 2025 | 0.86 | 0.863 | 0.87 | -0.8 % | -1.1 % |
| HiØ | 2023 | 0.82 | 0.824 | 0.82 | +0.5 % | +0.0 % |
| HiØ | 2024 | 0.79 | 0.788 | 0.79 | -0.2 % | +0.0 % |
| HiØ | 2025 | 0.82 | 0.815 | 0.82 | -0.6 % | +0.0 % |
| UiB | 2023 | 1.39 | 1.387 | 1.41 | -1.6 % | -1.4 % |
| UiB | 2024 | 1.36 | 1.361 | 1.39 | -2.1 % | -2.2 % |
| UiB | 2025 | 1.38 | 1.376 | 1.40 | -1.7 % | -1.4 % |
| UiO | 2023 | 1.66 | 1.658 | 1.69 | -1.9 % | -1.8 % |
| UiO | 2024 | 1.61 | 1.606 | 1.64 | -2.1 % | -1.8 % |
| UiO | 2025 | 1.76 | 1.761 | 1.77 | -0.5 % | -0.6 % |

Sammendrag: 47 av 51 punkter innenfor ±2 % av V15.1 (begge kolonner). Utenfor: NMBU 2023 (klartekst -2,9 % / egen -3,2 %), NMBU 2024 (-1,9 % / -2,2 %), UiB 2024 (-2,2 % / -2,1 %), UiO 2024 (-1,8 % / -2,1 %). Disse er systematiske (HK-dirs «faglig årsverk» har en litt annen avgrensning, `stillingstype.action?stil_id=1`), og identiske i klartekst og egen utregning, så de skyldes ikke prosjektets kode.

## 4. Definisjoner jeg brukte (fra `build-rangering.py`, deretter implementert på nytt)
- publPoeng, publikasjoner: tabell 373. For `hele` brukes avdelingskode 000000, ellers sum av valgte avdelingskoder. (Jeg kontrollerte totalrad mot avdelingssum: lik, bortsett fra BI 2023 og 2025, se 1d.)
- faglige = UN1 + UN3 + UN4; rekruttering = UN2; uff = UN1 + UN2; utenStip = UN1 + postdoktorer (UN2 der `Stillingsbenevnelse` inneholder «postdok»).
- poengPerUff = publPoeng / uff; poengPerFaglig = publPoeng / (UN1 + postdoktorer).
- niva2Andel = nivå 2-poeng / alle poeng, tabell 374, avdelingssummer (totalrad bare om avdelingsrader mangler).
- forsteAndel = UN1-årsverk med benevnelse som treffer professor|førsteamanuensis|dosent|førstelektor, delt på faglige.
- Sammenligning: relativt avvik > 0,5 % flagges; avvik som er mindre enn en halv avrundingsenhet i klarteksten regnes som avrunding (tabell 1b).

## 5. Spørringene

Endepunkt: `POST https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData`, `Content-Type: application/json`. Alle skoler/institusjoner: 1240, 8241, 1173, 1160, 1171, 1174, 1150, 1130, 1176, 0264, 1177, 1175, 0232, 0238, 8253, 0256, 1120, 1110. Én spørring per tabell og institusjon, kun 2023–2025 (`Årstall` som `item`-valg «2023», «2024», «2025»).

Tabell 373 (publiseringspoeng, antall):
```json
{"tabell_id":373,"api_versjon":1,"statuslinje":"J","kodetekst":"N","desimal_separator":".","groupBy":["Årstall","Avdelingskode"],
 "filter":[{"variabel":"Institusjonskode","selection":{"filter":"item","values":["<inst>"]}},
           {"variabel":"Årstall","selection":{"filter":"item","values":["2023","2024","2025"]}}]}
```
Tabell 374 (poeng per kvalitetsnivå): samme, med `"groupBy":["Årstall","Avdelingskode","Kvalitetsniva"]`, `tabell_id` 374.

Tabell 225 (årsverk): samme, med `"groupBy":["Årstall","Avdelingskode","Stillingskode"]`, `tabell_id` 225.

Tabell 220 (stillingskoder, kategori og benevnelse):
```json
{"tabell_id":220,"api_versjon":1,"statuslinje":"J","kodetekst":"J","desimal_separator":".",
 "variabler":["Stillingskode","Stillingsbenevnelse","Stillingskategorikode"],
 "filter":[{"variabel":"Stillingskode","selection":{"filter":"all","values":["*"]}}]}
```
Tabell 210 (avdelingsnavn; `kodetekst:"J"` er det som gir `Avdelingsnavn` og `Institusjonsnavn` i svaret):
```json
{"tabell_id":210,"api_versjon":1,"statuslinje":"J","kodetekst":"J","desimal_separator":".",
 "variabler":["Institusjonskode","Avdelingskode","Fakultetskode","Fakultetsnavn","Gyldig fra","Gyldig til"],
 "filter":[{"variabel":"Institusjonskode","selection":{"filter":"item","values":["<inst>"]}}]}
```
HK-dir (GET): `https://vedlegg.hkdir.no/api/collections/2026/TRHU/tables/V15.1` og `.../V15.2`.

Erfaring: `groupBy` sammen med `kodetekst:"J"` ga 500 på 373; `variabler` er påkrevd for 210 (uten gir 400).
