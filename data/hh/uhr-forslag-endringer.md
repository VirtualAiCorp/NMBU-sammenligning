# Forslag til endringer i courseMapping.ts (UHR-gjennomgang 17.10.2026)

Fil: `kilde/src/app/data/courseMapping.ts`. Linjenummer gjelder fila slik den er i `main` 17.10.2026 (etter rettingene av OsloMet og HiØ). Første linjenummer er `displayCode`-linja i oppføringen; «l. N» peker på `credits`- eller `courseName`-linja. Når koden byttes, må `codeShort`, `courseName`, `description`, `courseUrl` og `fallbackGrades` byttes samtidig (som ved OsloMet-rettingen). Bevis og kandidattall per forslag står i `data/hh/uhr-gjennomgang.json` og `docs/uhr-gjennomgang-2026-10-17.md`.

## Felles (strukturelt)

- **Sikker:** legg til et femte UHR-område «Etikk, samfunnsansvar og bærekraft» (min. 7,5 sp) i `UHR_GROUPS` og `CourseId` (`etikk`), med emnene i `uhr-gjennomgang.json` → `omraader.etikk` for hver institusjon (23 nye oppføringer).
- **Sikker:** `UHR_GROUPS` (l. 57–95): studiepoengene per gruppe (30/30/15/20) stemmer med minimumene i 2018-planen. Legg til at UHR krever minst 120 sp i de fem områdene til sammen (minimumene summerer bare til 102,5), og at hvert område har et maksimum (45/45/30/30/15).
- **Sannsynlig:** la et område kunne ha flere emner (liste i stedet for én `CourseEntry`), ellers kan ikke DELVIS-funnene (to finansregnskapsemner, organisasjon 1 + 2, integrert mikro/makro hos BI) vises riktig.
- **Sannsynlig:** legg til `aarFra`/`aarTil` per emne, slik at tidsserier bruker forgjengerkoden for eldre år (USN, UiT, NLA, BI, Kristiania, HiØ, NTNU).

## Sikker

**NMBU**
- credits '10 sp' → '5 sp': markedsforing AOS120 l. 680; makrookonomi ECN120 l. 1230
- l. 861 (`organisasjon.nmbu`, AOS130): credits '10 sp' → '5 sp' (l. 865); legg til i området: AOS230 Organisasjons- og ledelsespsykologi (5 sp), AOS235 Praktisk endringsledelse (5 sp, fra 2025)
- l. 1412 (`mikrookonomi.nmbu`, ECN210): tidsserie/tidligere også: ECN110 (5 sp, til 2024)
- l. 1600 (`matematikk.nmbu`, ECN102): tidsserie/tidligere også: MATH100 (10 sp, til 2022)
- l. 1978 (`metode.nmbu`, AOS240): credits '10 sp' → '5 sp' (l. 1982); legg til i området: ECN201 Econometrics (10 sp)
- l. 2169 (`okonomi1.nmbu`, BUS101): courseName → 'Bedriftsøkonomiske sammenhenger' (l. 2170)

**NHH**
- l. 885 (`organisasjon.nhh`, SOL3): legg til i området: SOL1 Psykologi og ledelse (7,5 sp)

**NTNU Trondheim**
- l. 1848 (`statistikk.ntnu`, MET1002): displayCode/codeShort 'MET1002' → 'SØK1004'; tidsserie/tidligere også: MET1002 (7,5 sp, til 2024)

**OsloMet**
- l. 909 (`organisasjon.oslomet`, ØAADM2100): legg til i området: ØAADM1100 Organisasjonspsykologi (7,5 sp)

**Universitetet i Agder (UiA)**
- credits '10 sp' → '7,5 sp': okonomistyring BE-110 l. 315; investering BE-210 l. 501; markedsforing MF-102 l. 687; organisasjon ORG109 l. 873; mikrookonomi SE-213 l. 1424; matematikk MA-138 l. 1612; metode ME-112 l. 1990
- l. 125 (`finansregnskap.uia`, BE-111): credits '10 sp' → '7,5 sp' (l. 129); legg til i området: BE-209 Finansregnskap og rapportering (7,5 sp)
- l. 1047 (`strategi.uia`, ORG126): displayCode/codeShort 'ORG126' → 'ORG209'; courseName → 'Strategisk ledelse' (l. 1048); credits '10 sp' → '7,5 sp' (l. 1051)
- l. 1234 (`makrookonomi.uia`, SE-204): credits '10 sp' → '7,5 sp' (l. 1238); legg til i området: SE-112 Grunnleggende samfunnsøkonomi (7,5 sp)
- l. 1800 (`statistikk.uia`, ME-111): credits '10 sp' → '7,5 sp' (l. 1804); legg til i området: ME-201 Kvantitativ dataanalyse (7,5 sp)
- l. 2183 (`okonomi1.uia`, BE-110) → fjern oppføringen

**Universitetet i Stavanger (UiS)**
- l. 383 (`okonomistyring.uis`, BØK301): tidsserie/tidligere også: BØK103 (10 sp, til 2022)
- l. 941 (`organisasjon.uis`, BØK415): tidsserie/tidligere også: BØK225 (10 sp, til 2023)

**USN (Økonomi og ledelse)**
- credits '10 sp' → '7,5 sp': markedsforing MAR1000 l. 695; organisasjon ORL1000 l. 881
- l. 133 (`finansregnskap.usn`, REG1010): credits '10 sp' → '7,5 sp' (l. 137); legg til i området: REG1000 Grunnleggende regnskap (7,5 sp); tidsserie/tidligere også: FIN1000 (7,5 sp, til 2024)
- l. 319 (`okonomistyring.usn`, BØK2000): credits '10 sp' → '7,5 sp' (l. 323); tidsserie/tidligere også: DRI2000 (7,5 sp, til 2024)
- l. 505 (`investering.usn`, FIN2000): credits '10 sp' → '7,5 sp' (l. 509); tidsserie/tidligere også: INV2000 (7,5 sp, til 2024)
- l. 1055 (`strategi.usn`, STR1000): credits '10 sp' → '7,5 sp' (l. 1059); tidsserie/tidligere også: STR2000 (7,5 sp, til 2023)
- l. 1242 (`makrookonomi.usn`, SØK1010): credits '10 sp' → '7,5 sp' (l. 1246); tidsserie/tidligere også: MAK2000 (7,5 sp, til 2024)
- l. 1428 (`mikrookonomi.usn`, SØK1000): credits '10 sp' → '7,5 sp' (l. 1432); tidsserie/tidligere også: MIK2000 (7,5 sp, til 2024)
- l. 1616 (`matematikk.usn`, MET1000): credits '10 sp' → '7,5 sp' (l. 1620); tidsserie/tidligere også: MAT1000 (7,5 sp, til 2024)
- l. 1808 (`statistikk.usn`, MET1010): credits '10 sp' → '7,5 sp' (l. 1812); tidsserie/tidligere også: STA1000 (7,5 sp, til 2024)
- l. 1994 (`metode.usn`, MET1020): credits '10 sp' → '7,5 sp' (l. 1998); tidsserie/tidligere også: SAM2000 (7,5 sp, til 2024)
- l. 2190 (`okonomi1.usn`, BØK1100): displayCode/codeShort 'BØK1100' → 'BØK1000'; credits '10 sp' → '7,5 sp' (l. 2194); tidsserie/tidligere også: BED1000 (7,5 sp, til 2024)

**INN Lillehammer**
- credits '10 sp' → '7,5 sp': investering ØKA1019 l. 580; markedsforing ØKA1013 l. 767; organisasjon ØKA1017 l. 953; strategi ØKA1021 l. 1130
- credits '5 sp' → '7,5 sp': metode ØKA1023 l. 2071
- l. 205 (`finansregnskap.inn`, ØKA1012): credits '10 sp' → '7,5 sp' (l. 209); legg til i området: ØKA1014 Videregående regnskap (7,5 sp)
- l. 391 (`okonomistyring.inn`, ØKA2002): credits '10 sp' → '7,5 sp' (l. 395); legg til i området: ØKA2004 Virksomhetsstyring (7,5 sp)
- ny oppføring `okonomi1.inn` → ØKA1016 «Grunnleggende bedriftsøkonomi», 7,5 sp

**Nord universitet**
- credits '10 sp' → '7,5 sp': okonomistyring REG1002 l. 411; investering FIN1002 l. 596; markedsforing MAF1001 l. 783; makrookonomi ECO1003 l. 1334; mikrookonomi ECO1001 l. 1520; matematikk MAT1001 l. 1708; statistikk STT1001 l. 1900
- l. 221 (`finansregnskap.nord`, FIN1001): credits '10 sp' → '7,5 sp' (l. 225); legg til i området: REG1001 Regnskapsanalyse og verdsettelse (7,5 sp)
- l. 965 (`organisasjon.nord`, ORG1001): credits '10 sp' → '7,5 sp' (l. 969); legg til i området: LED1001 Ledelse (7,5 sp)
- l. 2084 (`metode.nord`, ECO1003): displayCode/codeShort 'ECO1003' → 'MET1001'; courseName → 'Anvendt metode' (l. 2085); credits '10 sp' → '7,5 sp' (l. 2088)
- ny oppføring `okonomi1.nord` → ECO1002 «Bedriftsøkonomisk analyse med programvare», 7,5 sp

**HVL Bergen**
- credits '10 sp' → '7,5 sp': finansregnskap BØA117 l. 233; okonomistyring BØA205 l. 419; investering BØA204 l. 604; markedsforing BØA116 l. 791; strategi ØAO016 l. 1154; makrookonomi BØA118 l. 1342; mikrookonomi BØA203 l. 1528; matematikk BØA111 l. 1716; statistikk BØA115 l. 1908; metode ØMO111 l. 2097
- l. 973 (`organisasjon.hvl`, BØA112): credits '10 sp' → '7,5 sp' (l. 977); legg til i området: ØAO019 Organisasjon og ledelse 2 (7,5 sp, fra 2024); tidsserie/tidligere også: ØAO018 (7,5 sp, til 2023)
- ny oppføring `okonomi1.hvl` → BØA113 «Innføring i bedriftsøkonomi og regnskap», 7,5 sp

**Høgskolen i Østfold (HiØ)**
- l. 1032 (`strategi.hio`, ØKA121): tidsserie/tidligere også: SFB11820 (10 sp, til 2022)
- l. 1593 (`matematikk.hio`, ØKA101): tidsserie/tidligere også: SFB10719 (10 sp, til 2022)
- l. 1779 (`statistikk.hio`, ØKA120): tidsserie/tidligere også: SFB12020 (10 sp, til 2023)

**BI**
- l. 335 (`okonomistyring.bi`, BØK3430): displayCode/codeShort 'BØK3430' → 'BØK3561'; courseName → 'Prestasjonsstyring' (l. 336); legg til i området: BØK3651 Strategisk økonomistyring (7,5 sp); tidsserie/tidligere også: BØK3541 (7,5 sp, til 2024)
- l. 521 (`investering.bi`, BØK3423): legg til i området: BØK3632 Finansiell styring (7,5 sp)
- l. 707 (`markedsforing.bi`, MRK3580): tidsserie/tidligere også: MRK3414 (7,5 sp, til 2022)
- l. 893 (`organisasjon.bi`, ORG3403): tidsserie/tidligere også: ORG3402 (7,5 sp, til 2024)
- l. 2204 (`okonomi1.bi`, BØK34301): displayCode/codeShort 'BØK34301' → 'BØK3430'; courseName → 'Innføring i bedriftsøkonomi og finans' (l. 2205)

**Kristiania (campus)**
- credits '10 sp' → '7,5 sp': finansregnskap FRG3101 l. 161; okonomistyring OKS1101 l. 347; investering IOJ3100 l. 533; organisasjon OOL1101 l. 905; strategi FST3100 l. 1082; makrookonomi MAO2100 l. 1270; mikrookonomi MIO1100 l. 1456; matematikk MAT1100 l. 1644; statistikk SFO1100 l. 1836; okonomi1 BØK2101 l. 2215
- l. 715 (`markedsforing.kristiania`, MFØ1200): credits '10 sp' → '7,5 sp' (l. 719); tidsserie/tidligere også: MOF1100 (15 sp, til 2023)
- l. 2018 (`metode.kristiania`, MOD3101): credits '10 sp' → '7,5 sp' (l. 2022); tidsserie/tidligere også: MOD3100 (15 sp, til 2024), SVM1100 (7,5 sp, til 2022)

**UiT Tromsø**
- l. 367 (`okonomistyring.uit`, BED-1502): displayCode/codeShort 'BED-1502' → 'BED-2019'; courseName → 'Driftsregnskap og budsjettering' (l. 368); legg til i området: BED-2304 Driftsregnskap og budsjettering (7,5 sp, fra 2026)
- l. 552 (`investering.uit`, BED-2303): credits '10 sp' → '7,5 sp' (l. 556); tidsserie/tidligere også: BED-2020 (10 sp, til 2024)
- l. 739 (`markedsforing.uit`, BED-1303): credits '10 sp' → '7,5 sp' (l. 743); tidsserie/tidligere også: BED-1004 (10 sp, til 2024)
- l. 925 (`organisasjon.uit`, BED-2302): credits '10 sp' → '7,5 sp' (l. 929); tidsserie/tidligere også: BED-2029 (10 sp, til 2024)
- l. 1290 (`makrookonomi.uit`, SOK-1002): displayCode/codeShort 'SOK-1002' → 'SOK-1010'; courseName → 'Makroøkonomisk analyse og økonomisk politikk' (l. 1291); legg til i området: SOK-1304 Makroøkonomisk analyse og økonomisk politikk (7,5 sp, fra 2026)
- l. 1476 (`mikrookonomi.uit`, SOK-1010): displayCode/codeShort 'SOK-1010' → 'SOK-1002'; courseName → 'Mikroøkonomi: Økonomisk atferd, markeder og priser' (l. 1477); legg til i området: SOK-1303 Mikroøkonomi: Økonomisk atferd, markeder og priser (7,5 sp, fra 2026)
- l. 1664 (`matematikk.uit`, BED-1301): credits '10 sp' → '7,5 sp' (l. 1668); tidsserie/tidligere også: BED-1007 (10 sp, til 2024)
- l. 2042 (`metode.uit`, SVF-1050): displayCode/codeShort 'SVF-1050' → 'BED-2011'; courseName → 'Samfunnsvitenskapelig metode og statistikk' (l. 2043); legg til i området: BED-2306 Anvendt metode (7,5 sp, fra 2026)
- l. 2232 (`okonomi1.uit`, BED-1004): displayCode/codeShort 'BED-1004' → 'BED-1013'; courseName → 'Bedriftsøkonomisk analyse' (l. 2233); legg til i området: BED-1302 Bedriftsøkonomisk analyse (7,5 sp, fra 2025)

**NLA Høgskolen**
- l. 189 (`finansregnskap.nla`, HSM124): tidsserie/tidligere også: HSM201 (7,5 sp, til 2024)
- l. 560 (`investering.nla`, ØKAD221): tidsserie/tidligere også: ØKAD204 (7,5 sp, til 2024)
- l. 747 (`markedsforing.nla`, HSM222): tidsserie/tidligere også: HSM102 (7,5 sp, til 2022)
- l. 933 (`organisasjon.nla`, HSM121): tidsserie/tidligere også: HSM107 (7,5 sp, til 2023)
- l. 1298 (`makrookonomi.nla`, ØKAD224): credits '7,5 sp' → '10 sp' (l. 1302); tidsserie/tidligere også: ØKAD203 (7,5 sp, til 2024)
- l. 1484 (`mikrookonomi.nla`, ØKAD223): credits '7,5 sp' → '10 sp' (l. 1488); tidsserie/tidligere også: ØKAD202 (7,5 sp, til 2024), HSM108 (7,5 sp, til 2023)
- l. 1672 (`matematikk.nla`, ØKAD222): credits '7,5 sp' → '10 sp' (l. 1676); tidsserie/tidligere også: ØKAD201 (7,5 sp, til 2024)
- l. 1864 (`statistikk.nla`, HSM126): credits '7,5 sp' → '10 sp' (l. 1868); tidsserie/tidligere også: HSM103 (7,5 sp, til 2022)

**Høgskolen i Molde**
- credits '10 sp' → '7,5 sp': finansregnskap BØK105 l. 241; okonomistyring BØK205 l. 427; markedsforing ADM120 l. 799; strategi ADM300 l. 1162; makrookonomi SØK100 l. 1350; mikrookonomi SØK200 l. 1536; matematikk MAT100 l. 1724; statistikk MAT110 l. 1916; metode ADM201 l. 2105
- credits '10 sp' → '15 sp': investering BØK300 l. 612
- l. 981 (`organisasjon.himolde`, ADM100): credits '10 sp' → '7,5 sp' (l. 985); legg til i området: ADM205 Endringsledelse (7,5 sp)
- l. 2239 (`okonomi1.himolde`, ASM100) → fjern oppføringen

**INN Rena**
- credits '10 sp' → '7,5 sp': investering 3BED200 l. 620; markedsforing 3MAR100 l. 807; organisasjon 3ORG100 l. 993; strategi 3LED300 l. 1170
- l. 245 (`finansregnskap.inn_rena`, 3REV100): credits '10 sp' → '7,5 sp' (l. 249); legg til i området: 3REG160 Videregående regnskap (7,5 sp)
- l. 431 (`okonomistyring.inn_rena`, 3REV220): credits '10 sp' → '7,5 sp' (l. 435); legg til i området: 3BED360 Virksomhetsstyring (7,5 sp)
- l. 1920 (`statistikk.inn_rena`, SMET130): displayCode/codeShort 'SMET130' → '3MET130'
- ny oppføring `okonomi1.inn_rena` → 3BED100 «Grunnleggende bedriftsøkonomi», 7,5 sp

**NTNU Gjøvik**
- credits '10 sp' → '7,5 sp': finansregnskap SMF1197 l. 257; okonomistyring SMF2293 l. 443; investering SMF2296 l. 628; markedsforing SMF1196 l. 815; organisasjon SMF1193 l. 1001; strategi SMF2281 l. 1178; makrookonomi SMF2295 l. 1366; mikrookonomi SMF2291 l. 1552; matematikk REA1153 l. 1740; statistikk REA1154 l. 1932; metode SMF2292 l. 2121
- ny oppføring `okonomi1.ntnu_gjovik` → SMF1194 «Bedriftsøkonomi», 7,5 sp

**NTNU Ålesund**
- credits '10 sp' → '7,5 sp': finansregnskap AE101308 l. 265; investering AE201115 l. 636; markedsforing AM101108 l. 823; organisasjon AL101115 l. 1009; strategi AL201308 l. 1186; makrookonomi AE101408 l. 1374; mikrookonomi AE201615 l. 1560; matematikk AR100919 l. 1748; statistikk AR100219 l. 1940; metode AM201306 l. 2129
- ny oppføring `okonomi1.ntnu_alesund` → AE101108 «Bedriftsøkonomi med regnskap», 7,5 sp

**Kristiania nett**
- ny oppføring `okonomi1.kristiania_nett` → 6324 «Bedriftsøkonomi», 7,5 sp

**INN nett**
- l. 277 (`finansregnskap.inn_nett`, SREG160): displayCode/codeShort 'SREG160' → 'SREV100'; courseName → 'Grunnleggende regnskap' (l. 278)
- ny oppføring `organisasjon.inn_nett` → SORG100 «Organisasjonsforståelse», 7,5 sp
- ny oppføring `okonomi1.inn_nett` → SBED100 «Grunnleggende bedriftsøkonomi», 7,5 sp

**UiT nett**
- l. 656 (`investering.uit_nett`, BED-2503): credits '10 sp' → '7,5 sp' (l. 660); tidsserie/tidligere også: BED-2020NETT (10 sp, til 2024)
- l. 843 (`markedsforing.uit_nett`, BED-1503): credits '10 sp' → '7,5 sp' (l. 847); tidsserie/tidligere også: BED-1004NETT (10 sp, til 2024)
- l. 1021 (`organisasjon.uit_nett`, BED-2502): credits '10 sp' → '7,5 sp' (l. 1025); tidsserie/tidligere også: BED-2029NETT (10 sp, til 2024)
- l. 1768 (`matematikk.uit_nett`, BED-1501): credits '10 sp' → '7,5 sp' (l. 1772); tidsserie/tidligere også: BED-1007NETT (10 sp, til 2024)
- ny oppføring `okonomi1.uit_nett` → BED-1502 «Bedriftsøkonomisk analyse», 7,5 sp

## Sannsynlig

**NHH**
- l. 327 (`okonomistyring.nhh`, BED5): legg til i området: BED4 Bedriftsøkonomiske beslutninger (7,5 sp)

**OsloMet**
- l. 2026 (`metode.oslomet`, ØAMET2100): legg til i området: ØAMET2200 Business Decision-Making Using Data (7,5 sp)

**Nord universitet**
- credits '10 sp' → '7,5 sp': strategi ORG2001 l. 1146

**BI**
- l. 1071 (`strategi.bi`, STR3610): displayCode/codeShort 'STR3610' → 'STR3605'; courseName → 'Strategi' (l. 1072)
- l. 1258 (`makrookonomi.bi`, SØK3420): legg til i området: SØK3500 Samfunnsøkonomi II (7,5 sp, fra 2024); tidsserie/tidligere også: SØK3525 (7,5 sp, til 2024)
- l. 1444 (`mikrookonomi.bi`, SØK3500): legg til i området: SØK3420 Samfunnsøkonomi I (7,5 sp, fra 2023); tidsserie/tidligere også: SØK3520 (7,5 sp, til 2024)

**UiT Tromsø**
- l. 1856 (`statistikk.uit`, BED-2065): credits '10 sp' → '7,5 sp' (l. 1860); tidsserie/tidligere også: BED-2011 (10 sp, til 2024)

**NLA Høgskolen**
- l. 2050 (`metode.nla`, HSM126): displayCode/codeShort 'HSM126' → 'HSM209'; courseName → 'Metode' (l. 2051); credits '5 sp' → '7,5 sp' (l. 2054)

**Oslo Nye Høyskole (ONH)**
- credits '10 sp' → '7,5 sp': finansregnskap ØKAD1220 l. 217; okonomistyring ØKAD2220 l. 403; investering ØKAD2230 l. 588; markedsforing ØKAD1140 l. 775; organisasjon ØKAD1130 l. 961; strategi ØKAD2240 l. 1138; makrookonomi ØKAD2210 l. 1326; mikrookonomi ØKAD1230 l. 1512; matematikk ØKAD1120 l. 1700
- credits '10 sp' → '15 sp': statistikk ØKAD2110 l. 1892; metode ØKAD2110 l. 2079
- ny oppføring `okonomi1.onh` → ØKAD1110 «Grunnleggende bedriftsøkonomi», 7,5 sp

**NTNU Ålesund**
- l. 447 (`okonomistyring.ntnu_alesund`, AE101124): credits '10 sp' → '7,5 sp' (l. 451); tidsserie/tidligere også: AE201306 (7,5 sp, til 2024)

**Kristiania nett**
- l. 269 (`finansregnskap.kristiania_nett`, 6084): legg til i området: 6088 Finansregnskap og regnskapsteori (15 sp)

**UiT nett**
- l. 285 (`finansregnskap.uit_nett`, BED-1505): displayCode/codeShort 'BED-1505' → 'BED-1002NETT'
- l. 471 (`okonomistyring.uit_nett`, BED-2504): displayCode/codeShort 'BED-2504' → 'BED-2019NETT'
- l. 1206 (`strategi.uit_nett`, BED-2705): displayCode/codeShort 'BED-2705' → 'BED-2003NETT'
- l. 1394 (`makrookonomi.uit_nett`, SOK-1504): displayCode/codeShort 'SOK-1504' → 'SOK-1010NETT'
- l. 1580 (`mikrookonomi.uit_nett`, SOK-1503): displayCode/codeShort 'SOK-1503' → 'SOK-1002NETT'
- l. 1960 (`statistikk.uit_nett`, BED-2501): displayCode/codeShort 'BED-2501' → 'BED-2066'; credits '10 sp' → '7,5 sp' (l. 1964); tidsserie/tidligere også: BED-2011NETT (10 sp, til 2024)
- l. 2149 (`metode.uit_nett`, BED-2506): displayCode/codeShort 'BED-2506' → 'BED-2011NETT'; courseName → 'Samfunnsvitenskapelig metode og statistikk' (l. 2150)

## Usikker

**NLA Høgskolen**
- l. 375 (`okonomistyring.nla`, HSM122): tidsserie/tidligere også: HSM205 (7,5 sp, til 2024)

## Tilleggsmerknader

- UiT makro/mikro (l. 1290 og l. 1476): oppføringene er byttet om på samme måte som OsloMets var. Bytt hele oppføringene, ikke bare koden (også `description`, `courseUrl` og `fallbackGrades`). `courseUrl` på l. 1295 peker i dag på SOK-1018.
- NTNU Gjøvik/Ålesund: hhCourseData-programmene `ntnu_gjovik_oa`/`ntnu_alesund_oa` er nesten tomme 2022–2024 fordi studentene lå under felleskoden BØA (som `ntnu_oa` bruker). Programtall for disse campusene må hentes fra BØA-koden med campusens emnekoder.
- `nord_steinkjer_oa` har samme DBH-programkode (BAØKLED) som `nord_oa`, og tallene er identiske.
- ONH finnes ikke i DBH-cachen; studiepoengene bygger bare på programsiden.
