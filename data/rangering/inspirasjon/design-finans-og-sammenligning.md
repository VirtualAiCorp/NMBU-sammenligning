# Design for rangert data: hva gode finans- og sammenligningssider gjør

Kartlagt 3. oktober 2026 for «Handelshøyskolerangeringen» (15 norske handelshøyskoler, tilbudt Dagens Næringsliv). Mål: nøktern, profesjonell side med særpreg.

## Om kildegrunnlaget (les først)

Mye av dette kan ikke leses maskinelt, så jeg skiller mellom to typer påstander:

- **[målt]** = jeg leste HTML/CSS direkte (curl) eller en nettside, 3. oktober 2026. Gjelder DN (full), Nordnet (skrift), E24 (skrift, to farger), Koyfin (to farger), Finansportalen (farger), FT (kun fargekoder i sidens HTML og skriftvariabler).
- **[kunnskap]** = jeg beskriver et mønster fra egen kjennskap til siden. Det er ikke verifisert i denne kjøringa og bør sjekkes mot skjermbilder før det siteres.
- **Blokkert/ikke lesbart:** economist.com (403), morningstar.com (403), ft.com/business-education (403, men HTML kom delvis), Finansportalen-fondstabellen (JS, tom i henting), Bloomberg-tabellen (ikke funnet). Tabellmønstrene for disse bygger derfor på [kunnskap] og må tas med forbehold.
- Fargekoder fra FT kommer fra en tredjepart (shadcn.io DESIGN.md-beskrivelse) pluss én treff i FTs egen HTML (`#fff1e5`, `#0d7680`). Resten er ikke ført tilbake til FT selv.
- Budsjettet var ca. 12 søk/hentinger. Flere sider fikk derfor bare én kjapp sjekk.

---

## 1. DN.no (referansen vi skal passe inn i) [målt]

Kilde: HTML og CSS fra `https://www.dn.no/topic/Brukskunst` og `https://stc.dngroup.com/cpp/css/entry.136.CtBuEZEu.css`, lest 3. oktober 2026. DN deklarerer design-tokens som CSS-variabler (`--color-brand-*`, `--color-data-*`, `--color-investor-*`, `--typography-*`), og det er dem jeg har lest av. Ingen logo er kopiert.

**Typografi**
- Overskrifter og meningsstoff: **Ivar** (serif fra Letters from Sweden, Göran Söderström), brukt som Ivar Display, Ivar Headline og Ivar Text. Meningskort bruker Ivar Headline, vekt 500, 56 px.
- Nyhetskort, mellomtitler og grensesnitt: **Sharp Grotesk** (Book, Medium, Semibold; kort stor-tittel 48 px semibold).
- Små verktøytekster (12 px): **Inter**, vekt 400. Sannsynlig tabell- og datatekst.
- Jeg fant ingen `tabular-nums`/`font-feature-settings` i den siden jeg leste. Tallskrift i DN-tabeller er altså ikke bekreftet.
- Resultat: serif for stemme, grotesk for struktur, Inter for småtekst. Samme tredeling bør vi bruke.

**Farger, brand**
- Primær: **#13264A** (mørk marine), tekst på den er hvit.
- Sekundær flate: **#EDF1F8** (lys blågrå).
- Framhevingsfarge: **#EDFEB2** (lys lime). Brukes som marker/highlight, ikke som tekstfarge. I DN Group-varianten finnes en nær slektning, **#E2FFB4**.
- Utility-skala (blå, 10 trinn): #FFFFFF, #EDF1F8, #D8E2F2, #A6B8D8, #879CC1, #5B729B, #3D5279, #283C62, #13264A, #010E29, #000716.
- Brødtekst: **#232528** (nesten svart, ikke ren svart). Sekundærtekst: **#53555F**. Mørk modus: tekst #F2F2F2, sekundær #A5AAB3.
- Nøytrale grå som går igjen: #F4F4F6, #FAFAFA, #E4E5E7, #8F959D, #A0A5AC.

**Farger, data og investor (viktigst for oss)**
- DN har egne datafarger: bakgrunn lys **#F9F2F0** (varm rosa-beige) eller mørk **#011627**, tekst #232528, skillelinjer #EAD6D1 (lys) / #383B57 (mørk), dempet tekst #89786F / #879CC1.
- Åtte serier, lys modus: **#004C77**, **#45B7C1**, **#C33321**, **#ECC48D**, **#6E96DF**, **#36867A**, **#A0336B**, **#5049A1**. Mørk modus (lysere): #66D4FF, #7FDBCA, #F27B7B, #F3AD6A, (#6E96DF), #7FDB8E, #BD8BDF, #918BDF.
- Investor-området (børs): opp **#2A8E76** bakgrunn / **#60E6B4** tekst; ned **#C93D57** bakgrunn / **#FF8993** tekst; flate #09152C eller #11151D. Opp/ned er altså grønn/rød, men dempet mot blågrønn og rosa-rød, ikke trafikklys.

**Tabellmønster** (ikke lest ut av sluttbrukervisning, siden tabellene er JavaScript): DN sin investorflate kombinerer mørk flate, fargede endringsceller og små verktøytekster. For tetthet og sortering må vi se et skjermbilde av DN Investor/børstabellen før vi kopierer noe.

**Usikkerhet og grupper:** ikke påvist i det jeg leste. Dataindeksfargene (8 stk) viser at DN grupperer med fargekode og forventer maks ca. 8 kategorier.

**Grep å låne:** DN sine egne data-tokens som utgangspunkt. En DN-redaktør kjenner igjen marine, #EDFEB2-markering og den lyse varme databakgrunnen. Det gir at siden «ser ut som DN» uten å bruke logoen.

---

## 2. Financial Times (rangeringer) [delvis målt, resten kunnskap]

- **Typografi:** Financier Display (serif, overskrifter) og Metric 2 (grotesk, grensesnitt). HTML bruker `--o3-font-family-metric` for tall/metrikker, så FT har en egen skriftvariabel for metrikk. [målt, variabelnavn]
- **Farger:** lakserosa papir **#FFF1E5**, FT Claret **#990F3D** (tredjepart), teal **#0D7680** (lenker, funnet i FT-HTML), krem-flate #F2DFCE, markedsopp #96CC28 og markedsned #CC0000 forbeholdt kursdata (tredjepart). Én hovedaksent, resten nøytralt. [delvis målt]
- **Tabell:** [kunnskap] Rangeringene er en bred rad-tabell: plass, skole, land, og en rekke kolonner (lønn, vektet lønn, verdi-for-pengene, kvinneandel m.fl.). Plass i feit skrift, år-over-år-endring som tall og liten markør, tre års plassering som egne kolonner. Kolonneoverskrifter kan sorteres. Skoler uten data vises med strek.
- **Usikkerhet og grupper:** [kunnskap] FT markerer vekter og kriterier i metodeboks, ikke i tabellen. Grupper (land, program) er filtre, ikke farger.
- **Grep å låne:** metodeboksen med vekter rett over tabellen. Leseren ser hva rangeringen faktisk måler før den leser plassene. Passer for oss, der DN må kunne forsvare tallene.

## 3. Morningstar og Finansportalen (fondssammenligning) [kunnskap; Finansportalen delvis målt]

**Morningstar**
- **Tabell:** [kunnskap] Tett skjermbilde. Stjerner (1–5) og Medalist-rating (Gold/Silver/Bronze) som symbol, rangering innen kategori som prosent, avkastning for flere perioder i hver sin kolonne, avgift, risiko. Stilboks (3x3 rute) viser posisjon i ett blikk. Hver kolonne kan sorteres, og brukeren velger kolonner.
- **Typografi og farger:** [kunnskap] Ren grotesk, tall høyrejustert, nøytral grå pluss én blå aksent. Rating-symboler er det eneste «ikoniske».
- **Usikkerhet:** [kunnskap] Rating er relativ til kategori; risiko vises som tre nivå (lav, gjennomsnittlig, høy) og ikke som tall. Det er et eksempel på at usikkerhet kan kommuniseres kategorisk.
- **Grep å låne:** stilboks-ideen. Én liten fast figur (3x3-rute) som plasserer en skole i to dimensjoner uten tekst. Vi kan bruke en tilsvarende «profil-glyf» (f.eks. forskning x studentopplevelse).

**Finansportalen (Forbrukerrådet)**
- [målt, CSS] Sparsom palett: mørk blågrønn **#034A66** med lys flate **#EDF4F7**/#F0F4F5 og én gul aksent **#FFCF6B**. Systemskrift (`font-family: inherit`).
- Tabell: [kunnskap, ikke verifisert] Fondslisten er et filter-først-grensesnitt (type, risiko, avgift) med sortering på kolonner og avkastning for 1, 3 og 5 år i egne kolonner. Målgruppen er forbrukere, så få kolonner og klar språkbruk.
- **Grep å låne:** filtre til venstre eller over, få kolonner som standard og «vis flere kolonner» som valg.

## 4. Koyfin [målt farger, resten kunnskap]

- **Farger:** mørk **#191E25**, grå #5E6166/#D1D2D3/#E8E8E9, lys #F8F8F8, og én sterk blå aksent **#007FFF**. [målt, forsiden]
- **Tabell:** [kunnskap] Skjermbilde-tetthet: lav radhøyde (ca. 24–28 px), mange kolonner, flytende tegneflater. Grønn/rød tall med liten prosent, sparklines i celle (kurs siste periode), fargeskalerte celler for prosentil. Brukeren lager egne «dashboards».
- **Typografi:** [kunnskap] Grotesk, tall høyrejustert og tabellsatt.
- **Usikkerhet og grupper:** [kunnskap] Peer-grupper (sektor) vises som medianrad eller gruppeoverskrift med snitt.
- **Grep å låne:** peer-medianen. Legg en rad «median for de 15» under eller over tabellen, slik at hver rad kan leses relativt.

## 5. Bloomberg (Businessweek-rangering og terminal) [kunnskap; metode funnet via søk]

- Fant ikke selve tabellen. Metoden (fem delindekser: lønn 37,5 %, læring 26,3 %, nettverk 17,8 %, entreprenørskap 11,4 %, mangfold 7,1 %) er dokumentert, så tabellen er sannsynligvis en totalplass pluss delplasser.
- **Typografi og farger:** [kunnskap] Nettsidens rangeringer bruker grotesk og nøytrale flater med én sterk aksent (gul/svart i terminalen, dyp blå/hvit på nettet). Terminalen er det ekstreme tetthetsmønsteret: mørk flate, oransje/gule tall, grønn og rød for endring.
- **Grep å låne:** delindekser som egne små kolonner, slik at leseren kan se *hvorfor* skolen ligger der. Terminal-tettheten er ikke noe vi bør etterligne på en åpen side.

## 6. Nordnet og E24 (børsoversikter, norsk lesevane) [målt skrift/farger, resten kunnskap]

**Nordnet**
- **Typografi:** egen skrift **Nordnet Sans Mono** brukes, altså monospace for tall. [målt] Dette er et viktig funn: en norsk finanskunde er vant til tall i fast bredde.
- **Farger:** hvit, svart, #1C1C1C, #E0E0E0, #4D4D4D, rosa-rød aksent #D10E61, lys turkis #CCFCF9. [målt]
- **Tabell:** [kunnskap] Én rad per aksje med siste kurs, endring i kroner og prosent (grønn/rød), omsetning, og en liten pil. Sortering ved klikk på kolonnetittel, aktive filtre som piller.

**E24 Børs og finans**
- **Typografi:** egen skrift **E24 Text** pluss variabelbaserte stiler (label small/medium, title small). [målt]
- **Farger:** #1D1D1D, #F0F0F0, #A0A0A0, aksent-blå #186EF0 / #6EA8FF (mørk modus). [målt]
- **Tabell:** [kunnskap] Kursliste med endring i prosent som farget tall, mange rader synlig, få dekorasjoner.
- **Grep å låne:** den norske leseren forventer desimalkomma, mellomrom som tusenskille, og endring i prosentpoeng. Bruk `Intl.NumberFormat('nb-NO')` og ikke minustegn av typen bindestrek (bruk ekte minus, U+2212).

## 7. The Economist [kunnskap, siden er 403]

- **Typografi:** Econ Sans (og Econ Sans Condensed) i grafikk, tidligere ITC Officina Sans. Serif (Econ Serif) i brødtekst. [søk-treff + kunnskap]
- **Farger:** blågrå og nøytrale grå som serier, og **rød rektangel** oppe til venstre som varemerke (ca. #E3120B, ikke verifisert her). Ikke mer enn 3–4 farger i en graf; bakgrunn lys blågrå/hvit med tykke hvite horisontale rutelinjer.
- **Oppsett:** korte, venstrejusterte titler med forklarende undertittel, høyre-akse, tekst som annoterer direkte i grafen. [søk-treff]
- **Usikkerhet og grupper:** [kunnskap] Tynne feilmarger (skraverte bånd) i linjegrafer; grupper vises ved at *én* serie får farge og resten er grå.
- **Grep å låne:** «én farget, resten grå». Når vi viser én skole (f.eks. den leseren klikket på), skal den ha aksentfarge og de 14 andre være dempet grå. Dessuten: titlene sier funnet, ikke emnet.

## 8. Our World in Data [delvis målt]

- **Typografi:** Playfair Display (overskrifter) og Lato (brødtekst og aksetekst). [søk-treff]
- **Farger:** dempet marineblått **#355174** og lys blå #DBE5F0/#98A9BD/#C3D7EE funnet i forsiden. Mange fargede serier i kartleggere, men en stram nøytral ramme. [målt, forside]
- **Tabell:** [målt, artikkel om redesignet] Tabellvisning ved siden av graf og kart, «bedre kontrast mellom rader og mer konsekvent justering», sortering ved klikk på kolonnetittel, tydelig kildehenvisning med «lær mer om dataene».
- **Usikkerhet og grupper:** OWID viser usikkerhet som skravert bånd eller utvidet marg og forklarer det i teksten. Regionsgrupper får fast farge på tvers av sidene. [kunnskap + søk-treff]
- **Grep å låne:** kilde og metode som permanent, synlig del av komponenten («Kilde: ... · Sist oppdatert ...»), og samme farge for samme gruppe på tvers av alle visninger.

## 9. Mønsteroppsummering

| Tema | Det finansnettsteder gjør | Betyr for oss |
|---|---|---|
| Tetthet | 24–40 px rad, 8–15 kolonner | 15 skoler gir ro. Vi kan ha 44–52 px rader og stor tallskrift |
| Sortering | Klikk på kolonnetittel, pil viser retning | Alltid default på plass; sortering skal aldri skjule totalplassen |
| Sparklines | Kurs siste periode | Bruk små rekker over år (plass 2022 til 2026), ikke kurs |
| Endring | Grønn/rød + pil | Pil + tall + gjerne tekst. Aldri kun farge (fargeblinde) |
| Tallskrift | Mono (Nordnet) eller tabular-nums | `font-variant-numeric: tabular-nums`, høyrejustert |
| Serif/sans | Serif i overskrift (FT, DN, OWID, Economist), sans i data | Samme tredeling som DN |
| Farge | 1 aksent + nøytral, 2 (opp/ned) bare for endring | Maks 3 aktive farger i ett bilde |
| Usikkerhet | Metodeboks, kategorisk risiko, skravert bånd | Intervall for plassering og «delt plass» |
| Grupper | Filtre, medianrad, fast gruppefarge | Fast farge per gruppe, medianrad |

---

## Designprinsipper for oss

1. **Plass først, deretter bevis.** Tabellen starter med plass i stor tall og skolenavn. Delscorer, historikk og metode ligger bak en radutvidelse. Leseren skal få svaret på tre sekunder og beviset på ti.
2. **Serif for stemmen, grotesk for strukturen, tabellsatte tall for dataene.** Overskrifter og ingresser i serif (nær Ivar), tabell og kontroller i grotesk (nær Sharp Grotesk/Inter), alle tall i `tabular-nums`, høyrejustert, med desimalkomma og ekte minustegn.
3. **Én aksent, resten nøytralt.** Marine som merkefarge, lime (#EDFEB2) som markering av valgt rad eller funn, grønn/rød *kun* for endring mellom år. Maks tre aktive farger i et bilde. Egne tokens nær DNs, ingen logo, lys og mørk modus, tåler innebygging.
4. **Fremhev ett, demp resten.** Velger leseren en skole, får den aksentfarge og de andre blir grå (Economist-grepet). Samme skole beholder samme farge i alle grafer.
5. **Vis usikkerhet som intervall, ikke som falsk presisjon.** Plasseringer som ikke kan skilles statistisk, får «delt plass» eller et plasseringsintervall (f.eks. 4–7), vist som en tynn linje i raden. Tallene i seg selv vises med så få desimaler som metoden tåler.
6. **Hvert tall har en kilde på samme skjerm.** Under tabellen: kilde, år, metodeversjon, sist oppdatert (OWID og FT). Vekter står i en boks over tabellen.
7. **Endring sies med både symbol, tall og ord.** Pil, «+3 plasser» og skjermlesertekst «opp tre plasser». Farge forsterker, men bærer aldri alene.
8. **Grupper får fast farge og alltid en medianrad.** Bruk DNs datafarger (maks 4 grupper), og en rad «median for de 15» slik at hver skole leses relativt (Koyfin).
9. **Nøktern tetthet, ikke terminaltetthet.** Det er bare 15 rader. Bruk luft og stor tallskrift, ikke 30 kolonner. Standard 5–6 kolonner, «vis flere kolonner» som valg (Finansportalen).
10. **Mobil er hovedflaten.** DN leses på telefon. Tabellen faller til kort med plass, navn, totalscore og pil, med delscorer under. Fast første kolonne og horisontal rulling bare når leseren ber om sammenligning.
---

## Mulig palett basert på DN-farger

**Hvordan jeg fant fargene:** Jeg hentet HTML-en til `https://www.dn.no/topic/Brukskunst` (3. oktober 2026, curl med nettleser-UA) og leste CSS-variablene som ligger inline og i `https://stc.dngroup.com/cpp/css/entry.136.CtBuEZEu.css`: `--color-brand-*`, `--color-data-*`, `--color-typography-*`, `--color-investor-*`. Verdiene under er kopiert fra disse variablene. Det er *ikke* en offisiell designmanual (søk fant ingen offentlig). DN kan endre tokens uten varsel, så tallene bør verifiseres mot DN før lansering.

**Merkevare og flater (lys modus)**

| Rolle | Hex | DN-token |
|---|---|---|
| Primær / tittel / aktiv kolonne | #13264A | `--color-brand-primary` |
| Primær mørk (hover, dyp flate) | #283C62 | `--color-brand-utility-600` |
| Dempet blå (sekundær tekst på lys) | #5B729B | `--color-brand-utility-400` |
| Skillelinje | #D8E2F2 | `--color-brand-utility-100` |
| Sekundærflate (tabell, striper) | #EDF1F8 | `--color-brand-secondary` |
| Markering/framheving | #EDFEB2 | `--color-brand-highlight` |
| Brødtekst | #232528 | `--color-typography-default` |
| Sekundærtekst | #53555F | `--color-typography-secondary` |
| Bakgrunn | #FFFFFF / #FAFAFA | nøytral |
| Datagrafikk-bakgrunn (valgfri, varm) | #F9F2F0 | `--color-data-bg` |

**Endring (opp/ned)**

| Rolle | Hex (flate / tekst) | Kilde |
|---|---|---|
| Opp | #2A8E76 / #60E6B4 (mørk flate) | `--color-investor-positive-*` |
| Ned | #C93D57 / #FF8993 (mørk flate) | `--color-investor-negative-*` |

For tekst på lys flate bør vi bruke de mørke variantene (#2A8E76 og #C93D57) og kontrastteste (4,5:1). #60E6B4 og #FF8993 er tenkt på mørk flate.

**Gruppefarger (maks 4 om gangen), fra DN sin datapalett**

| Gruppe | Lys modus | Mørk modus |
|---|---|---|
| 1 | #004C77 | #66D4FF |
| 2 | #45B7C1 | #7FDBCA |
| 3 | #C33321 | #F27B7B |
| 4 | #ECC48D | #F3AD6A |
| (reserve) | #6E96DF, #36867A, #A0336B, #5049A1 | #6E96DF, #7FDB8E, #BD8BDF, #918BDF |

Tips: bruk #C33321 (rødt) bare til gruppe, ikke samtidig med «ned»-rød. Vi bør enten ta rød ut av gruppefargene eller gjøre «ned» mer rosa (#C93D57) og gruppe-rød mer murstein, ellers forveksles de. Min anbefaling: grupper = #004C77, #45B7C1, #ECC48D og #5049A1.

**Skrifter (anbefalt, med lisensforbehold)**
- Overskrift: Ivar Headline/Display (DN sin, kommersiell). Fallback for prototype: *Newsreader* eller *Source Serif 4* (åpne).
- Tabell og grensesnitt: Sharp Grotesk (DN sin, kommersiell). Fallback: *Inter* (DN bruker den selv til 12 px verktøytekst).
- Tall: `font-variant-numeric: tabular-nums` (Inter støtter det). Ingen monospace med mindre vi ønsker Nordnet-preg.
- DN har lisensene. Hvis siden leveres som innebygd modul til DN, kan vi arve DNs skrifter og bare levere struktur og farge-tokens.

**Kontrastnotat:** #13264A på hvit gir svært høy kontrast; #EDFEB2 er en markering (bakgrunn bak mørk tekst), aldri tekstfarge.

---

## Kilder

- DN HTML/CSS: https://www.dn.no/topic/Brukskunst og https://stc.dngroup.com/cpp/css/entry.136.CtBuEZEu.css (målt 3. okt. 2026)
- Nordnet: https://www.nordnet.no/market/stocks (skrift, målt)
- E24: https://www.e24.no/boers-og-finans (skrift og farger, målt)
- Koyfin: https://koyfin.com/ (farger, målt)
- Finansportalen: https://www.finansportalen.no/ (farger, målt)
- OWID: https://ourworldindata.org/redesigning-our-interactive-data-visualizations og forside (farger)
- FT: https://www.ft.com/business-education (skriftvariabler, to farger, delvis blokkert); FT Visual Vocabulary: https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md; tredjepartsoppsummering av FT-tokens: https://www.shadcn.io/design/ft
- Economist-stil: https://thinkinsights.net/insights/data-visualization-economist og https://medium.com/@traffordDataLab/developing-a-data-visualisation-style-cd24f88fa59
- Bloomberg metode: https://www.bloombergmedia.com/press/bloomberg-businessweek-announces-2022-23-global-business-schools-ranking
- Morningstar: https://www.morningstar.com/en-us/company/ratings (rating-typer; siden selv blokkert)
- Ivar-skriften: https://typewolf.com/ivar
