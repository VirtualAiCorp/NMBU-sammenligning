# Studieresultater for alle program (B2, «Markedet»)

Skrevet 17.10.2026. Datasettet gir studenttall, kandidater, studiepoeng, gjennomføring per kull, studentsammensetning
og anslått resultatbasert uttelling for **alle studieprogram ved alle institusjoner i DBH, 2019–2025**. Nøkkelen er
DBH-programkoden, så dataene kan kobles til den nasjonale programkatalogen (B1, `data/marked/nasjonal-katalog/`).

Ingenting i appen er endret. Filene er rådata for en senere «Markedet»-modul.

## Filer

| Fil | Innhold | Størrelse |
|---|---|---|
| `data/marked/studieresultater/program/<inst>.json` | Ett objekt per institusjon: `{meta, program: {"<inst>_<kode>": {...}}}` | 48 filer, 13 MB i alt, største (NTNU) 1,5 MB |
| `data/marked/studieresultater/program-indeks.json` | Kompakt indeks over alle 8 055 program (navn, nivå, NUS, kategori, fire nøkkeltall) og institusjonsliste | 1,0 MB |
| `data/marked/studieresultater/aggregater.json` | Summer og andeler per institusjon, per nivå (nasjonalt), per NUS-fagfelt × nivå og NUS-faggruppe × nivå, med kvartiler mellom program | 1,5 MB |
| `data/marked/studieresultater/alias.json` | Gamle nøkler fra sammenslåtte institusjoner → ny nøkkel (1 227 stk.) | 34 kB |
| `data/marked/studieresultater/skript/hent.py` | Henter rådata fra DBH (nasjonale spørringer, høyst to samtidige) | |
| `data/marked/studieresultater/skript/bygg.py` | Bygger filene over fra cachen | |
| `data/marked/studieresultater/skript/dbh.py` | Felles hjelpere (API, bulk-CSV, gzip-cache) | |
| `data/marked/studieresultater/kilder/` | Rå DBH-svar (gzip) og bulk-CSV-er, 8,9 MB | |

`program.json` ble delt per institusjon fordi samlet størrelse er om lag 13 MB.

```bash
python3 data/marked/studieresultater/skript/hent.py [--refresh]   # ca. 1–2 min uten cache
python3 data/marked/studieresultater/skript/bygg.py               # ca. 8 s
```

## Nøkkel og kobling

- Nøkkelen er `"<Institusjonskode>_<Studieprogramkode>"` med DBH-kodene trimmet for mellomrom, for eksempel `1173_B-ØA`.
- **Sammenslåtte institusjoner** er ført til ny kode etter DBH 211 (`Institusjonskode (sammenslått)`), for alle
  institusjoner som opphørte fra og med 2015. Eksempler: Høgskolen i Innlandet 0264 → Universitetet i Innlandet 1177
  (fra 2025), HiOA 0257 → OsloMet 1175, HiB/HSF/HSH → HVL 0238, Westerdals → Kristiania 8253, KHiB 6230 → UiB 1120.
  Kull og årstall fra den gamle koden ligger dermed under den nye nøkkelen. `alias.json` oversetter gamle nøkler.
- Dette betyr at INN-programmene har kull og tall for 2019–2024, selv om 1177 ikke har egne 707-kull ennå.
- Programkoden i DBH er ikke studiekoden i Samordna opptak (se `docs/oppskrift-dbh-karakterer.md`, punkt 3).
  B1 må koble SO-studiekode til DBH-kode for å bruke disse dataene.

## Felt per program

Toppnivå (fra DBH 347, siste registrerte semester for programmet t.o.m. 2026):
`inst, kode, navn, nivaa` (DBH-nivåkode), `type` (bachelor, master, profesjon, aarsstudium, erfaringsmaster,
annet_lavere, annet_hoyere, forskerutdanning …), `studiepoeng, heltid` (andel av heltid), `nus` (seks siffer),
`fagfelt` (NUS-siffer 2), `faggruppe` (NUS-siffer 2–3), `kategori` (siste registrerte finansieringskategori, 1–3 fra
2023), `kategoriGammel` (siste A–F t.o.m. 2022), `uttellingGammel` (1 = enkel, 2 = dobbel kandidatuttelling i det
gamle systemet), `avd, avdNavn, organisering, sprak, videreutd, registerAar`.

`aar` per år 2019–2025 (bare felt som finnes):

| Felt | Kilde | Definisjon |
|---|---|---|
| `reg`, `regKvAndel` | 123 | Registrerte studenter, høstsemesteret |
| `nye`, `nyeKvAndel` | 110 | Nye studenter, vår + høst |
| `kand`, `kandKvAndel` | 104 | Ferdige kandidater, vår + høst |
| `spPlan`, `spGjen` | 335 | Studiepoeng planlagt og gjennomført iht. utdanningsplan |
| `aarsverk` | 900 | Ny studiepoengproduksjon totalt i 60-sp-enheter, per studentens program |
| `sp` | 900 | Egenfinansierte årsverk per kategori: 2023– studentens kategori (1–3), 2019–2022 emnets kategori (A–F) |
| `alder` | 60 | `[≤ 21, 22–24, 25–29, 30+, total]`, høst. Gruppene hentes med alder-filter, som i `build-students.py` |
| `utl` | 135 | Utenlandske statsborgere, høst |
| `utv` | 142 | Programmets studenter på utveksling ut (Type NORSK), vår + høst |
| `inn` | beregnet | Anslått uttelling, se under |
| `p` | | Felt der minst én DBH-celle var prikket |

`kull` er en liste av rader med kolonnene i `meta.kullKolonner`:
`startaar, normertAar, nivaa, startkull, startkullKv, fullfortNormert, fullfortNormertKv, fullfort1, fullfort2,
studerer, studerer1, studerer2, frafalt, frafalt1, frafalt2` (DBH 707, studieprogramnivå, startkull 2016–2023).
Tallene for +1 og +2 år er kumulative. De er `null` når horisonten ikke er nådd, fordi siste måleår er 2025.

`nokkel` gir ferdige nøkkeltall for lister:
- siste år med registrerte, nye, kandidater, årsverk og inntekt, og `innPerReg`;
- `fullfortNormertAndel` og `frafallNormertAndel`, samlet for de tre siste kullene med nådd normert tid
  (for bachelor 2020–2022), med `kullGrunnlag` (antall startende);
- `fullfort2Andel` og `frafall2Andel` på samme måte for normert + 2 år.

## Aggregater

`aggregater.json` har `institusjoner`, `nasjonalt` (per DBH-nivåkode), `fagfelt` (nøkkel `"B3|4"` = bachelor ×
økonomiske og administrative fag) og `faggruppe` (nøkkel `"B3|41"`). Hver gruppe har:

- `aar`: summer, kvinneandeler (vektet med programmets tall), `utlAndel`, `utvPer100` og `alder`;
- `kull[nivå][startår]`: summer og andeler;
- `fordeling`: kvartiler mellom program for gjennomføring og frafall (program med ≥ 20 startende), inntekt per
  registrert (≥ 20 registrerte, private holdt utenfor) og registrerte.

Institusjonene har i tillegg `innreisende` (142 Type UTENL). Innreisende utvekslingsstudenter ligger på et eget
UTVEKSLING-program og kan ikke fordeles på studieprogram. NUS-navn kommer fra SSB Klass 36 (`data/nmbu/kilder/`).

Eksempel: NMBUs `1173_B-ØA` har 44,8 % fullført på normert tid for kullene 2020–2022 (250 startende). For
bachelor × økonomisk-administrative fag (`B3|41`) er medianen 38,5 %, og kvartilene er 29,7 % og 52,1 %
(115 program).

## Anslått inntekt (`inn`)

Metoden er den samme som i `scripts/build-revenue.py`, utvidet bakover. Produksjon i år Y gir uttelling i budsjettår
Y + 2, med satser fra DBH 908. Finnes ikke satsene ennå, brukes siste kjente sats, og feltet merkes `forelopig`. Dette
gjelder all 2025-produksjon, som regnes med 2026-satser.

- **2023–2025 (systemet fra 2025):**
  - egenfinansierte årsverk per kategori 1–3, der kategorien følger studentens program (900 «Finmodkode student»),
    ganget med satsen;
  - pluss kandidater (104) × G3 for gradsgivende heltidsprogram (nivå B3, B4, YU, M2, M5 og PR med andel heltid = 1).
- **2019–2022 (det gamle systemet):**
  - egenfinansierte årsverk per emnekategori A–F (900 «Finmodekode emne») × sats;
  - pluss kandidater med uttelling (907) × sats for enkel eller dobbel kandidatuttelling i samme kategori.
- `system` er `"2025"` eller `"A-F"`. Det er et **nivåskifte ved overgangen**: sum for statlige institusjoner er
  11,9 mrd. kr for 2022-produksjonen og 14,9 mrd. kr for 2023-produksjonen. Sammenlign derfor ikke beløp på tvers av
  2022/2023. Studiepoeng og kandidater kan sammenlignes.
- Kontroll: for 878 av 886 program-år i dagens `revenueData.json` stemmer anslaget innen 1 %. Avvikene skyldes:
  - fellesprogrammet IMA-LANDA, der AHO og UiT er slått sammen i appen, men holdt atskilt her;
  - G3-heltidsregelen, som appen ikke har (INN MABJO, deltid);
  - to små program med manglende år.
- Institusjoner utenfor Kunnskapsdepartementet (Politihøgskolen, KRUS, Forsvarets høgskole) og private uten
  statstilskudd har ikke `inn`.
- Private med statstilskudd (BI, Kristiania, VID, NLA, MF m.fl.) har `inn` merket `hypotetisk: true`. De får et
  fast tilskudd for avtalte plasser, ikke full uttelling per studiepoeng. I nasjonale og faglige aggregater er de
  holdt utenfor inntektssummen.

## Dekning

- **Omfang:** 8 055 program ved 48 institusjoner etter sammenslåing (alle med data i minst én serie 2019–2025, eller
  med kull fra 2016).
- **Type:**
  - 1 779 bachelor, 1 390 master, 33 profesjon, 937 årsstudier og 211 erfaringsmastere;
  - 2 597 «lavere nivå, øvrige» og 762 «høyere nivå, øvrige», som i hovedsak er videreutdanning og kurs;
  - 264 forskerutdanninger og noen få andre.
- **Registrerte (høst):** 4 275 program i 2019 og 4 270 i 2025, med sum 285 466 og 320 904. Summene inkluderer
  videreutdanning.
- **Inntektsanslag:** 3 932 program i 2019 og 3 833 i 2025.
- **Kull (707):** 11 143 kull i 2 225 program. Av 3 202 gradsprogram har 2 149 en gjennomføringsandel på normert
  tid, og 1 830 av dem har minst 20 startende i grunnlaget. 707 dekker bare program med normert tid (B3, B4, M2, M5,
  PR, YU, ME).
- **Kontroll mot appens eksisterende data** (samme DBH-tabeller, hentet per institusjon):
  - 1 652 av 1 652 kull stemmer;
  - 7 687 av 7 687 årsverdier for registrerte, nye, kandidater og planlagte studiepoeng stemmer;
  - 1 882 av 1 882 rader for alder og utenlandske stemmer.
  - Nasjonale nivåsummer stemmer eksakt med `707_nasjonalt_nivaa`, for eksempel B3 kull 2019 med 46 797 startende
    og 25 221 fullført på normert tid.
  - To nedlagte UiS-program (M-DATATEK5, M-KYB5) har ingen data i perioden.

## Skjerming (prikking)

- DBH nuller celler med 1–2 personer i GDPR-tabellene (60, 104, 110, 123, 135, 142, 335 og 707). Verdien vises som 0.
  `p` sier hvilke felt som har minst én slik celle. Den sanne verdien ligger da mellom vist tall og vist tall
  + 2 × antall prikkede celler.
- Andel årsverdier med minst én prikket celle:
  - registrerte 8,1 %, nye 17,0 % og kandidater 43,7 % (vår + høst summeres, og ett lite semester gir prikk);
  - utenlandske 48,0 % og utveksling 45,2 %;
  - alder 47,2 % (minst én aldersgruppe).
- **Kjønn:** DBH nuller kvinner og menn når én av dem er liten, mens totalen beholdes. Kvinneandeler er derfor
  regnet bare over celler der kvinner + menn = totalt. Kjønn er kjent for 78 % av årsverdiene for registrerte og
  62 % for nye og kandidater. `startkullKv` og `fullfortNormertKv` i kullene har samme svakhet og er minimumstall.
- Tabell 900 (studiepoeng), 907 og 347 er ikke skjermet.
- Kull hentes uten kjønnsdeling, fordi grov gruppering gir minst skjerming (samme grep som i `build-completion.py`).

## Kjente feil og forbehold

1. Studiepoeng (900) tilskrives studentens program, uansett hvem som eier emnet. Program som deler emner, får
   produksjonen der studentene er registrert.
2. Fellesprogram mellom institusjoner (for eksempel IMA-LANDA ved AHO 1220 og UiT 1130) er to nøkler. De må slås
   sammen i visningen hvis hele løpet skal vises.
3. Programmets `kategori` er siste registrerte verdi i 347. Den kan være `IS` (ikke støtte), `DG` eller `0` for
   private program og forskerutdanning. Kategorifordelingen i `sp` er bedre for inntekt.
4. G3 krever andel heltid = 1. Deltidsvarianter av gradsprogram får ikke G3 her, men gjør det i dagens
   `build-revenue.py`. Regelen følger satsteksten i DBH 908 («gradsgivende heltidsutdanninger»).
5. Det gamle systemets kandidatuttelling bruker 907 `Totalt` (med etterrapporterte). Kolonnen «Dobbel til enkel» er
   ikke brukt.
6. Kull 2016–2017 ved institusjoner som senere ble slått sammen, er lagt under ny kode. Har den nye institusjonen
   brukt samme programkode for et annet program, blir tallene slått sammen. Dette er ikke observert, men heller ikke
   kontrollert program for program.
7. 2026-data (vår 2026 for nye studenter) finnes i DBH, men er utenfor perioden og ikke med.
8. `registrerte` inkluderer alle studentkategorier. Innreisende utvekslingsstudenter er ikke med, fordi de ligger på
   UTVEKSLING-programmet.
9. Ett program mangler i 347 (`1407_INT-BACH`) og har derfor ikke navn eller NUS.

## Forslag til visning i «Markedet»

1. **Programsøk:** en tabell fra `program-indeks.json` med filter på nivå, NUS-faggruppe, institusjon og type
   (standard: bachelor, master og profesjon). Kolonnene er registrerte, kandidater, fullført på normert tid og
   anslått inntekt, og alle kan sorteres.
2. **Programkort** (klikk på en rad) lastes med `fetch` fra `program/<inst>.json`:
   - nøkkeltall øverst, hver med en markør for programmets plass mellom p25, median og p75 i samme faggruppe og nivå
     (`aggregater.faggruppe["B3|41"].fordeling`);
   - trend 2019–2025 for registrerte, nye og kandidater, med kvinneandel;
   - kullgraf (fullført normert / +1 / +2 og frafall) mot faggruppens linje fra `kull`;
   - aldersfordeling, utenlandske og utveksling;
   - inntekt som stablede søyler (studiepoeng og kandidater), med tydelig skille ved systemskiftet 2022/2023 og
     «foreløpig» på 2025;
   - prikkede tall vises som «≤ x» eller med en fotnote, som i `FacultyCompletion.tsx`.
3. **Institusjonsoversikt:** `aggregater.institusjoner`, med samme kort på institusjonsnivå og innreisende
   utvekslingsstudenter.
4. **Koblingen til B1:** når katalogen har SO-studiekode → DBH-kode, kan opptakstall (søkere og poenggrenser) vises
   i samme kort. Private institusjoner bør ha en synlig merknad om at inntektsanslaget er hypotetisk.
