# Studiesteder: institusjon × studiested (B3)

Arbeidsnotat 17.10.2026 (Opus 5.5). Data og skript ligger i `data/marked/studiesteder/`. Visningen er fanen
«Studiesteder» på Markedet (`?marked=studiesteder`), se §59 i `docs/status-og-metode.md`.

## 1. Kort oppsummert

- **156 studiesteder** fra 50 institusjoner: 144 steder i Norge, 7 egne nettcampuser og 5 i utlandet. 81 finnes i både
  Samordna og DBH, 64 bare i DBH (BI, Kristiania, Forsvarets høgskole, små private m.fl.) og 11 bare i Samordna (mest
  nedlagte koder; aktive: NTNU Caen, Nord Meråker og Narvik, INN Kongsvinger og Tynset).
- **Dekning:** 4 931 av 6 558 aktive DBH-program (75 %) har studiested, blant dem 3 176 av 3 354 med lokalt opptak
  (95 %). Resten hadde ingen registrerte studenter 2019–2025, mest nye program og videreutdanning. 1 658 av 1 688
  lokale gradsprogram i Markedets programfiler har fått studiested. Alle 1 675 Samordna-koder har studiested.
- **Studentene:** 320 494 av 320 740 registrerte høsten 2025 (99,9 %) har studiested. 12 938 står på en egen
  nettcampus, 220 i utlandet og 26 er uplassert («Uplassert» eller kommune 9999 i DBH).
- **Kontroll:** summen per institusjon i DBH 124 avviker ikke mer enn 1 % (og ikke mer enn 25 studenter) fra DBH 123 i
  noe år 2019–2025. I alt er DBH 124 0,2 % lavere enn DBH 123 (2025: 320 740 mot 321 356) på grunn av skjerming av små
  tall. Største avvik i 2025 er NTNU (−62) og USN (−59).

## 2. Kilder (hentet 17.10.2026, cache i `kilder/`, som er i `.gitignore`)

| Kilde | Hva |
|---|---|
| DBH 124 (JSON-API, ett kall per år, høst 2019–2025, alle institusjoner og nivåer) | Registrerte per program × campus med stedkode, stednavn, kommunenummer, nivå og organisering (stedbasert, desentralisert, nett) |
| DBH 123 (institusjon × år, høst) | Kontrollsum |
| DBH 662 «Campus-steder» (bulk-CSV) | Campusregisteret: stedkode, stednavn, kommunenummer og land, **ingen koordinater**. 384 oppføringer i 2025, 35 med kommune 9999. Brukes bare i kontrollen; DBH 124 har de samme feltene |
| SSB Klass 131 (kommuneendringer 2017–2026) | Gamle kommunenummer i DBH (0214 og 3021 Ås → 3218) |
| Kartverket kommuneinfo og stedsnavn | Kommunenavn, fylke og punkt i kommunen; koordinater for selve stedet (by, tettsted, bydel, bygd) |
| `data/marked/nasjonal-katalog` | Samordna-kodene med sted, kommune, fylke og førstevalg 2021–2026; fagfelt og nivå for DBH-programmene |

Studiestedskoden i DBH er institusjonens egen kode (C-AS, PILES, B …), men DBH 124 og 662 har kommunenummeret til
campus, så koblingen til kommune er direkte. Kartverket gir koordinatene.

## 3. Metode

- **Én post per institusjon × studiested.** DBH-campusene i de store byene (Oslo, Bergen, Trondheim, Stavanger,
  Kristiansand, Bodø og Tromsø) slås sammen per institusjon. NTNU Trondheim er for eksempel Gløshaugen, Dragvoll,
  Øya, Kalvskinnet og fem andre. Navnene renses («Studiested X», «Campus X», «UiT … i X», «X/Remmen», «Breistein, Bergen»),
  og et DBH-navn som Samordna også bruker, beholdes (Mo i Rana, Bø, Rena, Førde i stedet for kommunenavnet).
  Campusnavn som er institusjonsnavn (UiO, MF, Samisk høgskole), får kommunenavnet. Seks manuelle rettelser står i
  `OVERSTYR` i `skript/bygg.py`. Ett eksempel er NHH Oslo, som DBH fører i Bergen kommune.
- **Samordna:** koder med flere steder («Trondheim/Gjøvik») legges på stedet som svarer til kommunen. Nettkoder legges
  på institusjonens nettpost når DBH har en (NMBU, Nord, NLA, VID). Ellers blir de stående på studiestedet.
- **Nettpostene** ligger på kartet på institusjonens største studiested og tegnes stiplet.
- **Fagfelt og nivå** per post: DBH-programmets NUS-fagfelt fra katalogen og nivåkoden i 124. B3/B4 regnes som
  bachelor, M2/M5/ME/MX som master, AR som årsstudium og PR som profesjon. Resten (LN, HN, VS, FU osv.) er «annet».

## 4. Filer

| Fil | Innhold |
|---|---|
| `studiesteder.json` | Postene med id, institusjon, stedsnavn, kommune(nr), fylke, koordinater og kilden for dem, kilde (Samordna/DBH/begge), navnevarianter, antall program (aktive Samordna-koder 2026 og DBH-program med studenter 2025), registrerte 2019–2025, førstevalg 2021–2026, organisering 2025 og andel nett/desentralisert, Samordnas nett- og samlingskoder, fordeling per fagfelt × nivå og de største programmene |
| `program-steder.json` | Koblingstabellen: `dbh["<inst>_<kode>"]` gir studiestedene med registrerte per år og andel siste år med studenter; `so["<kode>"]` gir studiested-id-en |
| `kontroll.json` | DBH 124 mot DBH 123 per institusjon og år, avvik, uplasserte, steder bare i én kilde, dekning og manuelle rettelser |
| `hh-campusfeil.json` | Campusfeil i `data/hh/programkart.json` (under) |
| `skript/hent.py`, `skript/geo.py`, `skript/bygg.py` | Henting (DBH), kommuner og koordinater (SSB og Kartverket, cachet) og bygging |

Kjøring: `python3 data/marked/studiesteder/skript/hent.py [--refresh] && python3 data/marked/studiesteder/skript/bygg.py`,
deretter `python3 scripts/build-marked.py`.

## 5. Campusfeil i HH-programkartet (rapport, ingenting er rettet)

Funnet automatisk av `bygg.py` mot Samordna-stedet og DBH 124 (2025). Kommunenavn i kartet (Ringerike, Åmot, Horten,
Midt-Telemark) regnes som samme sted som Samordnas stedsnavn.

1. **Én oppføring teller flere campuser:**
   - `usn_oa` (Drammen, OKLED) har alle fem USN-campusene. Bare 25 % av studentene er i Drammen, og flest er i
     Vestfold (27 %).
   - `ntnu_oa` (Trondheim, BØA m.fl.) teller også Ålesund (18 %) og Gjøvik (16 %).
   - `bi_oa` (Oslo, DIPØAH) gjelder alle BI-campusene: Oslo 32 %, Bergen 31 % og Trondheim 21 %.
   - `hvl_moa` (Bergen, MSB) teller også Sogndal (24 %) og Haugesund (22 %).
   - `usn_itis` (Ringerike) teller også Bø (46 %).
   - `nord_hr_ar` (Bodø, PK1) har flest studenter i Levanger (44 %).
2. **Dobbelttelling:** `nord_oa` (Bodø) og `nord_steinkjer_oa` bruker begge BAØKLED, der Bodø har 62 % og Steinkjer
   38 % av studentene.
3. **Peker feil:**
   - `inn_moa` (Lillehammer) har 72 % av studentene på Rena.
   - `nmbu_bel` (Ås, KVU-BEDØK) og `nla_bei_ar` (Oslo, 4BEI-N) har nesten alle studentene på nettcampusen.
   - `uit_alta_oa` bruker B-ØKADM-A, som hadde 3 registrerte i 2025, mens 186468 hadde 538 førstevalg. DBH 370 kobler
     koden til B-ØKADMN.
   - `uia_siv` bruker MASTØKAD5 (sist 4 registrerte i 2021). DBH 370 kobler 201345 til BACØKAD.
   - `usn_honefoss_oa` og `usn_kongsberg_oa` kobles i DBH 370 til årsstudiekoden 164.
4. **Feil nivå:** `usn_honefoss_oa` (222097), `usn_bo_oa` (222164), `usn_kongsberg_oa` (222625) og `hvl_dol` (203218)
   er årsstudier på 60 sp i Samordna, men står i bachelorgruppene.

Funnene stemmer med §5 i `bachelor-okonomi.md`. Nye her er INN-masteren (Rena), HVL-masteren, USN IT og
informasjonssystemer, Nord HR og de to nettstudiene.

## 6. Forbehold

1. DBH 124 skiller ikke alltid nettstudenter fra studentene på et studiested. Sju institusjoner har egen nettcampus.
   Andre fører nettstudentene på hovedcampus, men med organiseringskode 3 (nett), som gir andelen nett/desentralisert.
   NMBU, Nord og NLA fikk egen nettcampus i DBH først i 2021–2023 (NMBU fra 2023), så nettpostene vokser (4 416 → 12 938) delvis av endret registrering.
2. Enkelte institusjoner rapporterer bare hovedcampus eller én campus per by (UiO, UiB, UiS, NIH, MF m.fl.).
   Desentraliserte tilbud (Samisk høgskole, UiT) kan stå med kommune 9999 og blir da uplassert.
3. DBH for 2026 er ikke publisert. Studenttallene slutter høsten 2025, og førstevalg 2026 er fra Samordna.
4. Flere institusjoner i samme by ligger på samme punkt. Koordinatene er sentrum av byen eller tettstedet (Kartverket),
   ikke den eksakte campusen. For Hallingdal, Vestfold, Indre Østfold og noen små steder er de et punkt i kommunen.
5. Antall program: Samordna-koder og DBH-program overlapper (en Samordna-kode er som regel opptaket til et
   DBH-program) og summeres derfor ikke.
