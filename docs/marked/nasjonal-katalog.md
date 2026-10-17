# Nasjonal programkatalog og Samordna-markedet (B1)

Arbeidsnotat 17.10.2026 (Opus 5.5). Data og skript ligger i `data/marked/nasjonal-katalog/`. Ingenting i appen,
eksisterende skript eller eksisterende datafiler er endret. Ingenting er bygd eller committet.

Målet er å gå fra den NMBU-sentrerte sammenligningen (bare konkurrentprogrammene til hvert fakultet) til hele
markedet: alle institusjoner og alle studieprogrammene deres.

## 1. Kort oppsummert

- **9 545 DBH-program** fra 48 institusjoner (DBH 347, 2021–2026). 6 734 er aktive i vårsemesteret 2026. Av dem
  er 176 i ferd med å fases ut («tilbys til» er passert). 2 811 er nedlagt eller har fått ny kode.
- **1 675 Samordna-studiekoder** fra 27 institusjoner (2021–2026). 1 369 er aktive i 2026, 26 er avlyst og 280 er
  nedlagt. Hver kode har søkere, førstevalg, plasser, kvalifiserte, tilbud, poenggrenser (ordinær og
  førstegangsvitnemål, hoved- og suppleringsopptak) og ventelister per år. Ledigflagget finnes bare for 2026.
- **Koblingen mellom Samordna og DBH er nesten deterministisk.** I DBH 370 står Samordnas
  studieprogramnummer i feltet «Studietypekode». 1 585 av 1 675 koder (95 %) er koblet slik og 16 er koblet på
  navn. 74 er ikke koblet, og 57 av dem er nye i 2026, før DBH 370 for 2026 er publisert.
- **Kontroll mot de manuelle koblingene** i `data/<fak>/dbh-programkart.json`: 193 av 204 er like. Ti er ulike
  fordi DBH 370 viser hvor opptaket faktisk registreres (se §5), og én mangler kobling.
- **Fagfelt:** 16 lesbare felt fra NUS-faggruppen, med Samordnas utdanningstype som reserve.
- **Markedsandeler** er førstevalgssøkere per institusjon og fagfelt for 2021–2026 i Samordna, og andel møtt i DBH
  for 2021–2025. DBH-tallene tar med BI, Kristiania og andre private som står utenfor Samordna.

Summen av førstevalg per institusjon stemmer **eksakt** med Samordnas egen institusjonstabell for alle 27
institusjoner i både 2021 og 2026. Det samme gjelder plassene.

## 2. Kilder (alle hentet 17.10.2026 og cachet i `kilder/`)

| Kilde | Hva | Cache |
|---|---|---|
| HK-dir/Samordna, «Søker- og tilbudstall til nedlasting» (oppdatert 23.07.2026). Statiske HTML-tabeller på `sokertallrapport.samordnaopptak.no/2026/figurer/side_0_grunntabeller_hoved/tabeller/`, med data innebygd som JSON (`allData`) | Programnivå UH (`grunndata_tabell_2_uhg_hoved_26`, 1 697 rader × 6 nøkkeltall, 2021–2026, inkludert nedlagte koder), institusjonsnivå (`_4_`, unike søkere), utdanningsområde (`_6_`). Fagskolene i `*_hyu_hoved` | `kilder/sokertallrapport/*.html` |
| SO-datavarehuset (Tableau), «Poenggrenser og ventelistetall» som CSV, 2020–2026, hoved- og suppleringsopptak | Poenggrenser og ventelister per kvote | `kilder/so_poenggrenser_venteliste.csv` |
| Samordnas søke-API (`POST sok.samordnaopptak.no/api/v1/search`), opptakene 2020–2026 | Programtype, studiepoeng, sted/kommune/fylke, sektor, nytt/avlyst, planlagte plasser, ledigflagg 2026, SO-institusjonsnummer, URL | `kilder/samordna-sok/<år>.json.gz` |
| DBH 347 Studieprogram, alle institusjoner, vår og høst 2021–2026 (høst 2026 er ikke publisert) | Kode, navn, avdeling, nivå, studiepoeng, NUS, videreutdanning, tilbys fra/til, språk | `kilder/dbh/347_<år>_<sem>.json.gz` |
| DBH 370 Studieplasser, opptakstype N, 2020–2025 (2026 er ikke publisert) | Koblingen DBH-kode ↔ Samordna-nummer | `kilder/dbh/370_<år>.json.gz` |
| DBH 379 Søkertall og møtte, alle institusjoner, 2021–2026 (2026 = bare vår) | Søknader, førstevalg (prioritet 1), kvalifiserte, tilbud, akseptert og møtt, per opptakstype L/N | `kilder/dbh/379*_<år>.json.gz` |
| DBH 210 Avdeling og 211 Institusjon | Avdeling → fakultet, institusjonstype, sammenslåinger (0264 HINN → 1177 INN, 1411 → UiT) | `kilder/dbh/210.json.gz`, `211.json.gz` |
| SSB Klass 36 (NUS2000) | NUS-navn på alle nivåer | `kilder/nus_klass36.json` |

Kildene er hentet med ett kall om gangen og pauser mellom kallene. Kinesiske tjenester er ikke brukt.

## 3. Filer

| Fil | Innhold |
|---|---|
| `program/<fagfelt>.json` + `program/indeks.json` | Selve katalogen. Den er delt opp per fagfelt fordi samlet fil ville bli om lag 10,7 MB. Største fil er `laerer.json` på 2,1 MB, og ingen fil er over 3 MB. `indeks.json` har kilder, feltforklaring og antall per fil. |
| `fagfelt.json` | 16 fagfelt med NUS-faggrupper og Samordna-typer, antall program, NMBU-fakultetene med program i feltet (med programliste), NMBUs Samordna-program og NMBUs andel av førstevalgene per år. |
| `institusjoner.json` | 48 institusjoner med DBH-kode, navn, type, sektor og sammenslåtte koder. Har institusjonen Samordna-opptak, står også Samordna-nummer og unike søkere fra Samordnas institusjonstabell 2021–2026 med. Ellers: programsum og andel (Samordna), DBH-gradsprogram 2021–2025 (møtt og andel) og antall program. |
| `marked.json` | Markedsandeler. `samordna[fagfelt][nivå].aar[år]` har totaler og institusjonene sortert etter førstevalg. Videre `nmbuAndel`, og `vinnereTapere` for 2021→2026 og 2025→2026 (endring i prosentpoeng). `dbh[fagfelt][nivå]` har andel av møtt for 2021–2025. `programEndring2021til2026` viser de 20 største økningene og fallene, i antall og i prosent (minst 50 førstevalg i 2021). |
| `fagskole.json` | 916 fagskolekoder fra Samordna 2021–2026, holdt utenfor UH-markedet. |
| `kontroll.json` | Antall, SO-institusjon → DBH-kode, koblingsstatistikk, avvik mot de manuelle koblingene, fagfeltfordeling, og koder uten søkertall. |
| `skript/` | `hent-samordna.py`, `hent-dbh.py`, `hent-nus.py`, `bygg-katalog.py`, `felles.py`, og `kjor-alt.sh` som kjører alt (`--refresh` henter på nytt). |

### Radformat i `program/*.json`

Det finnes to slags rader. **Summer aldri de to typene sammen**: det er to linser på det samme markedet.

- **`type: "so"`** er én studiekode i Samordna (et studietilbud på ett studiested). Radene har disse feltene:
  - `id`, `kode`, `navn`, `inst` (DBH-kode), `soInst`, `sted`, `kommune`, `fylke`;
  - `programtype` og `nivaagruppe` (bachelor, arsstudium eller master5);
  - `studiepoeng`, `utdtype` (Samordnas utdanningstype), `omrade`, `heltid`, `nett`, `skolepenger`, `url`;
  - `status` (aktiv, avlyst eller nedlagt), `forsteAar`, `sisteAar` og `ledig2026`;
  - `dbh` (koblede DBH-id-er), `kobling` (`dbh370` eller `navn`), `koblingAar`, `dbhTidligere` og `koblingMerknad`
    (nivåavvik);
  - `nus`, `fagfelt`, `fagfeltKilde`, `fagfeltSo` og `nmbuFakultet`.

  `aar.<år>` har `sokere` (søknader, ikke personer), `forstevalg`, `plasser`, `kvinneandelFv` (%), `kvalifiserte`,
  `tilbud`, `pgOrd`, `pgFv`, `pgOrdSupp`, `pgFvSupp`, `vlOrd`, `vlFv`, `vlOrdSupp`, `vlFvSupp`, `plasserKatalog`
  og `avlyst`. Poenggrense 0 betyr at alle kvalifiserte fikk tilbud. Mangler feltet, var det ingen runde eller
  kvote.
- **`type: "dbh"`** er ett DBH-program. Radene har disse feltene:
  - `id` (`dbh:<inst>:<kode>`), `navn`, `tidligereNavn`;
  - `avdeling`, `fakultet`, `fakultetskode` og `nmbuFakultet` (HH, REALTEK, LANDSAM, MINA, BIOVIT, KBM eller
    VET);
  - `nivaa` (DBH-nivåkode), `nivaagruppe`, `studiepoeng`, `heltid`, `nus`, `nusNavn`, `nusFaggruppe`;
  - `videreutdanning`, `sprak`, `tilbysFra`, `tilbysTil`, `egenfinansiering`;
  - `status` (aktiv, utfases eller nedlagt) og `aarIDbh`;
  - `so` (koblede Samordna-koder) og `fagfelt`.

  `aar.<år>.<L|N>` har `sokere`, `forstevalg`, `kvalifiserte`, `tilbud`, `akseptert` og `mott` fra DBH 379, summert
  over vår og høst.

## 4. Metode

**Institusjoner.** Hver institusjon får den gjeldende koden fra DBH 211 («Institusjonskode (sammenslått)»).
Samordna-nummeret kobles til DBH-koden ved å telle treff på studieprogramnummer i DBH 370. Alle 27 ble entydige
(se `kontroll.json`).

**Samordna ↔ DBH.** Samordna-studiekoden er SO-institusjonsnummeret fulgt av studieprogramnummeret, med tre
sifre hver (192 + 369 = 192369). I DBH 370, opptakstype N, står det samme programnummeret i «Studietypekode» for
hvert DBH-program. Det må fylles ut med nuller foran til tre sifre. Vi bruker koblingen fra det siste året
koden finnes i DBH 370, og tidligere koblinger står i `dbhTidligere`.

Koder uten treff i 370 kobles på navn innen samme institusjon og nivå, men bare når treffet er entydig
(Jaccard ≥ 0,75 og minst 0,25 foran nest beste). Det gjelder 16 koder. Flere studiekoder kan peke på samme
DBH-program, for eksempel ett per studiested.

**Fagfelt.** Fagfeltet bestemmes av NUS-faggruppen (siffer 2–3 i NUS-koden) til DBH-programmet. Samordna-koder
uten kobling får fagfelt fra Samordnas utdanningstype, eller fra hovedområdet i søke-API-et som siste utvei.
Resultatet ble slik: 1 601 koder fikk fagfelt fra NUS, 58 fra utdanningstypen og 16 fra hovedområdet. Slik er
faggruppene fordelt:

| Fagfelt | NUS-faggrupper |
|---|---|
| Økonomi og administrasjon | 41, 42, 44, 49, og samfunnsøkonomi (34) |
| Helse- og sosialfag | 61–66, 69 |
| Veterinærfag | 67 (veterinærmedisin og dyrepleie) |
| Lærerutdanning og pedagogikk | 21–25, 29 |
| Teknologi og ingeniørfag | 55, 57–59 |
| IT og datateknologi | 54 |
| Naturvitenskap og matematikk | 51–53, 56 |
| Landbruk, havbruk og naturforvaltning | 71, 72, 74, 79 |
| Samfunnsvitenskap og psykologi | 31–33, 36, 38, 39 |
| Jus | 37 |
| Medier og kommunikasjon | 35 |
| Humaniora, språk og religion | 01, 11–14, 19 |
| Kunst, musikk og design | 15, 16 |
| Idrett | 68 |
| Samferdsel, sikkerhet og forsvar | 81, 82, 89 |
| Uoppgitt | 09, 99 |

Nivåene er gruppert slik:

- I Samordna er Bachelor → bachelor, Årsstudium → arsstudium, og Master, Profesjon og Kandidat → master5.
- I DBH er B3/B4 → bachelor, AR → arsstudium, M5/PR → master5, M2 → master2 og ME/MX → erfaringsmaster. LN, HN,
  HK, VS og YU → annet.

**Markedsandel (Samordna).** Markedsandelen er institusjonens andel av alle **førstevalgssøkere**. Hver søker har
nøyaktig ett førstevalg, så summen er unike personer: 152 645 i 2021 og 149 493 i 2026. «Alle søkere» på
programnivå teller søknader, fordi én søker kan ha opptil ti alternativer. Dette tallet ligger i dataene, men er
ikke brukt i andelene.

**Markedsandel (DBH).** Andelen er beregnet av antall som møtte til studiestart på gradsprogram (bachelor,
årsstudium og master), for lokalt og nasjonalt opptak samlet, 2021–2025. Det er den eneste linsen som tar med de
private utenfor Samordna. BI hadde 6,8 % og Kristiania 3,5 % av alle som møtte i 2025.

## 5. Kjente hull og forbehold

1. **2026 i DBH:** 347 for høsten 2026, 370 for 2026 og 379 for hele 2026 er ikke publisert, så DBH-linsen
   slutter i 2025. Nye Samordna-koder i 2026 (57) har derfor ikke DBH-kobling ennå. Kjør `kjor-alt.sh --refresh`
   i februar–mars 2027.
2. **Ti avvik mot de manuelle koblingene** skyldes at DBH 370 viser hvor opptaket registreres. Det er ikke
   nødvendigvis det programmet fakultetssidene sammenligner karakterer for.
   - UiS og UiA tar opp femårig master på bachelorkoden (3+2): datateknologi, kybernetikk, byplanlegging og
     siviløkonom.
   - SO 192948 er NMBUs femårige M-MATVIT, ikke B-MAT.
   - Enkelte program har fått ny kode: B-MINA → B-MILJØ og BGEO → BIGEOMAT.
   - Fjorten koder er merket `koblingMerknad: nivåavvik`.
3. **Ledigflagget** finnes bare for 2026, fordi Samordna nullstiller det når opptaket arkiveres. 670 av 1 395
   koder hadde flagget. Tolkningen «var på ledig-lista» er ikke bekreftet av Samordna.
4. **Programendringer** kan skyldes kodebytter, nye studiesteder eller deling av koder. Et stort fall for én kode
   kan bety at søkerne er flyttet til en ny kode. Sjekk `tidligereNavn` og `dbhTidligere` før du tolker.
5. **«Nedlagt» i DBH** betyr bare at koden ikke finnes vår 2026. Mange av de 2 811 er omkodinger, avsluttede
   videreutdanninger eller program som er slått sammen etter fusjoner.
6. **Skjerming i DBH 379:** små celler vises som 0. Prioritet 1 i lokale opptak gjelder bare institusjonens egne
   alternativer og kan ikke summeres til unike personer.
7. **NUS er ikke alltid intuitivt:**
   - industriell økonomi (M-IØ) og Frie realfag havner under teknologi;
   - Ettårig grunnstudium havner under samfunnsvitenskap;
   - dyrepleie havner under veterinærfag;
   - samfunnsøkonomi er lagt under økonomi og administrasjon.

   HH-sammenligningens grupper er derfor ikke det samme som fagfeltet «økonomi». Vil vi ha en annen inndeling,
   endres `FAGFELT` i `bygg-katalog.py`.
8. **Fagskoler** er tatt med som egen fil og holdt utenfor UH-andelene. DBH har fagskolene i egne tabeller
   (947 og 555), som ikke er hentet.
9. **Søkertall per år for koder som ble nedlagt før 2021** finnes ikke i søkertallrapporten. Tableau og søke-API-et
   har 2020, men det året er ikke tatt med i markedet.
10. **Rådata-cachen (`kilder/`, 22 MB)** er ikke dekket av `.gitignore`. Mønsteret i repoet er at
    `data/*/kilder/…` ikke committes, så `data/marked/nasjonal-katalog/kilder/` bør legges inn i `.gitignore` før
    commit. Det er ikke gjort her, fordi eksisterende filer ikke skulle endres.

## 6. Utvalgte funn (Samordna, andel av førstevalgssøkerne)

- **NMBU samlet:** 1,99 % i 2021, 2,97 % i 2024 og 2,62 % i 2026. NMBU er nr. 4 blant vinnerne 2021→2026 med
  +0,63 prosentpoeng. Foran ligger INN (+1,33), UiS (+0,93) og UiA (+0,71). Taperne er UiT (−1,43), USN (−1,01) og
  VID (−0,59).
- **Økonomi og administrasjon** økte fra 20 222 til 27 781 førstevalg og er feltet som vokser mest.
  - NMBUs andel gikk fra 1,15 % til 5,01 %, og NMBU er største vinner i feltet med +3,86 prosentpoeng. Det skyldes
    årsstudiet i bærekraftig økonomi og ledelse, som kom i 2023 og har 9,85 % av førstevalgene på årsstudier i
    feltet i 2026.
  - På bachelor økte NMBU fra 1,94 % til 2,87 % (nr. 12 av 16).
  - Taperne er UiT (−7,45), OsloMet (−3,19) og NHH (−2,08).
  - DBH-linsen 2025 (bachelor, møtt): BI har 40,5 %, Kristiania 8,4 % og NMBU 1,3 %. På toårig master har NHH
    22,7 %, BI 19,9 % og NMBU 4,6 % (nr. 8).
- **Naturvitenskap:** NMBU hadde 13,87 % i 2021 og 12,19 % i 2026 (nr. 4). UiO vant mest (+7,4) og NTNU tapte mest
  (−6,1).
- **Landbruk, havbruk og naturforvaltning:** NMBU har 18,5 % på bachelor. INN vant 12,2 prosentpoeng, og NMBU tapte
  1,4.
- **Teknologi:** NMBU hadde 7,6 % på femårig master i 2026 (nr. 3). **IT:** NMBUs femårige datavitenskap økte fra
  7,8 % til 14,4 %, men IT-feltet samlet falt fra 10 166 til 7 348 førstevalg.
- **Veterinærfag:** NMBU har 100 % på veterinærmedisin og 37,5 % på dyrepleie (mot Nord).
- **Felt som krymper:** lærer (15 458 → 11 916), IT, kunst og humaniora. **Felt som vokser:** økonomi,
  samfunnsvitenskap og jus.

## 7. Forslag: ny modul «Markedet»

**Plassering.** Ny toppnivåside under «Hele NMBU», ved siden av Søkergrunnlaget og Økonomi. Den kan også nås fra
hvert fakultet med fagfeltet ferdig valgt, for eksempel HH → økonomi og VET → veterinærfag. Modulen må føres inn i
`SIDER` og i røyktestens `MOD`-liste.

**Data inn i appen.** Et nytt skript, `scripts/build-marked.py`, leser `data/marked/nasjonal-katalog/` og skriver
filer som lastes med `fetch`:

- `kilde/public/marked/oversikt.json` (om lag 300 kB): fagfelt, institusjoner og `marked.json` uten programlister.
- `kilde/public/marked/program/<fagfelt>.json`: bare Samordna-radene og gradsprogrammene i DBH, og bare feltene
  visningen trenger. Det gir under 400 kB per felt.

KI-grunnlaget får linjene «MARKEDET» (andel per felt og år, og vinnere og tapere) i `build-ki-grunnlag.py`.

**Visning.** Kortene følger NMBU-mønsteret med hvit boks og `var(--nmbu-…)`:

1. **Filtre øverst:**
   - fagfelt (16 felt, flervalg, standard «alle»);
   - nivå (alle, bachelor, årsstudium, femårig master, toårig master);
   - institusjon (flervalg, NMBU alltid med);
   - linse («Samordna 2021–2026, førstevalg» eller «DBH 2021–2025, møtt, med private»);
   - år.
2. **Nøkkeltall:** førstevalg totalt, NMBUs andel, NMBUs rang og endring siden 2021 i prosentpoeng.
3. **Markedsandeler over tid:** linje eller stablet areal per institusjon. NMBU er uthevet i NMBU-grønt, og de
   andre er grå med hover.
4. **Vinnere og tapere:** horisontale søyler i prosentpoeng, med valg mellom 2021→2026 og 2025→2026.
5. **Kart over felt × NMBU:** en matrise med fagfeltene som rader. Kolonnene viser NMBUs andel, endring, størrelse,
   vekst i feltet og hvilke NMBU-fakultet som er med. Feltene sorteres etter «stort og voksende, NMBU svak», så
   mulighetene blir synlige.
6. **Programtabell:**
   - alle program i valgt felt med førstevalg, plasser, førstevalg per plass, poenggrense, venteliste, ledig 2026,
     status (ny eller nedlagt) og endring;
   - søk og CSV-eksport;
   - NMBU-radene uthevet;
   - lenke til `url` hos Samordna.
7. **Forbehold** under kortene: søknader er ikke personer, nivåavvik, kodebytter og etterslep i DBH.

**Rekkefølge.**

1. `build-marked.py` og datafilene.
2. Kort 1–4 og 6.
3. Matrisen (5) og KI-linjene.
4. Oppdatering hvert år: søkertall i april og juli (Samordna), og DBH i februar–mars.

## 8. Gjenskape

```bash
cd ~/Desktop/BOA-sammenligning
sh data/marked/nasjonal-katalog/skript/kjor-alt.sh             # bruker cachen
sh data/marked/nasjonal-katalog/skript/kjor-alt.sh --refresh   # henter alt på nytt (ca. 1,5 min)
```

Bare Python-standardbiblioteket brukes. Byggingen tar om lag 3 sekunder.
