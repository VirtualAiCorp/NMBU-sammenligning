# Eksterne publiseringstall til kontroll av rangeringen

Samlet 3. oktober 2026. `eksterne-tall.json` har 1 004 tall fra publisert materiale. Hver rad har kilde, URL, side og et kort utdrag. Vi har ikke sammenlignet med våre egne DBH-tall ennå. Filen er grunnlaget for den sammenligningen.

## Format
- Feltene følger bestillingen.
- Mål som ikke passer i listen, har `maal: "annet"` og et ekstra felt `delmaal`. Eksempler: `ajg_4_antall`, `ajg_4stjerne_antall`, `ajg_3_antall`, `poeng_niva2_per_faglig`, `niva2_publikasjoner_antall`.
- Andeler er oppgitt i prosent (41,3, ikke 0,413).
- `nevner` sier alltid hva andelen eller per-årsverk-tallet er regnet av. Det er det viktigste feltet å lese.
- `side` er PDF-siden. For styreinnkallinger er det siden i hele innkallingen, ikke i vedlegget.
- For tabellceller er `sitat` et radutdrag («Table 15: UiS 2025 2,27») og ikke en løpende setning.

## Kildene, fra best til svakest
1. **HK-dir, vedleggstabellene til Tilstandsrapport for høyere utdanning 2026** (V15.1 poeng per faglig årsverk, V15.2 publiseringspoeng, V15.3 forfatterandeler på nivå 2).
   - Dekker alle 14 institusjonene for 2016–2025 (HK = Kristiania, NU = Nord).
   - Lest som JSON fra `https://vedlegg.hkdir.no/api/collections/2026/TRHU/tables/V15.x`. Nettsiden selv er en JS-app.
   - Bare institusjonsnivå. Dette er den beste kontrollen av institusjonstotalene våre fra tabell 373 og 225.
2. **NHH Research Report 2024 og 2025** (vedlegg til styresak 44/25 17.06.2025 og 41/26 16.06.2026).
   - NHHs egen DBH-sammenligning av åtte handelshøyskoler 2020–2025: NHH, BI, NMBU, Nord, NTNU, UiA, UiS og UiT.
   - Dekker poeng per årsverk, nivå 2-poeng per årsverk og andel av poengene på nivå 2.
   - ABS 4*, 4 og 3 per skole finnes for 2020–2024. For 2025 mangler ABS-tabellene fordi NVA ikke leverte publikasjonsdata.
   - Nevneren er **faglige årsverk uten stipendiater**. Tallene blir derfor 20–40 % høyere enn HK-dir sine. Eksempel: NHH i 2024 har 1,46 her og 1,04 hos HK-dir.
3. **UiA Handelshøyskolen, Kvalitetsrapport 2025, tabell 2.** DBH-tall for poeng per faglig årsverk for 11 enheter 2018–2024, på handelshøyskolenivå. NMBU-raden er identisk med HH-infografikken. Det tyder på at HH og UiA har hentet tallene fra samme DBH-uttrekk. UiAs egen tabell har også AJG-andeler.
4. **Institusjonenes egne dokumenter:**
   - NHH årsrapport 2025, tabell 18.
   - BI-nyheter 2023–2026 med figurer. Tallene er lest av datamerkene i bildene.
   - USN HH resultatindikatorer med teller og nevner.
   - INN-styresaker.
   - Nord statusrapport for forskning 2025.
   - NMBU tertialrapport og årsrapport.
   - UiS Business School Action Plan 2026.
   - OsloMet årsrapport 2025.
   - Kristiania kvalitetsrapport 2025 og årsrapport 2024.
5. **HH-infografikk 2024**, oppgitt av bruker, uten URL.

## Hva som var vanskelig
- **Ulike nevnere.** Vi fant fem varianter:
  - HK-dir/DBH «faglige årsverk» (inkl. stipendiater)
  - NHH «faglige årsverk ekskl. stipendiater»
  - Nord og INN «UFF-årsverk»
  - USN egen stillingskodeliste
  - NMBU «per førsteamanuensis og professor»
  
  Per-årsverk-tall kan bare sammenlignes når nevneren er den samme.
- **Nivå 2-andel kan bety tre ting:**
  - andel av forfatterandeler (HK-dir V15.3)
  - andel av poeng (NHH-rapportene)
  - andel av publikasjoner (BI, UiA, NMBU, Kristiania)
  
  Eksempel: BI hadde i 2024 40,9 % av forfatterandelene på nivå 2, 67,9 % av poengene og 43,8 % av publikasjonene.
- **ABS/AJG-tellingene spriker:**
  - BI oppgir selv 26 ABS 4* og 48 ABS 4 i 2024. NHHs DBH-baserte tabell har 26 og 47, men 12 mot 17 for ABS 4* i 2020.
  - NHHs årsrapport og NHHs forskningsrapport oppgir ulik ABS 4 for 2024 (23 mot 27).
  - UiS sin handlingsplan har 18 og 11 ABS 4/4* (2022/2024). NHHs tabell har 5 og 12.
  - Årsaken er trolig ulik listeversjon (AJG 2021 mot 2024), hel mot brøkdelt telling og hvilke dokumenttyper som er tatt med. ABS-tall bør bare sammenlignes innenfor samme kilde.
- **Foreløpige og endelige tall:**
  - Kristiania anslo 223 poeng for 2025 i kvalitetsrapporten. HK-dir har endelig 287,7.
  - USN oppga foreløpig 196 for 2025.
  - NHH hadde 330,69 i årsrapporten og 334,99 i forskningsrapporten.
  - 2025 er det første NVA-året. Sikt publiserte sent (23.4.2026) og ufullstendig, og HK-dir tar forbehold om økningen 2024–25.
- **Enhetsgrenser.**
  - UiA-tabellen bruker hele HHS-fakultetet for INN, mens INN-styret skiller institutter. INN-fakultetet har både psykologi og jus.
  - «NTNU Business School» i NHH-rapporten ser ut til å være instituttet: ABS-tallene per FTE gir omtrent 40 årsverk. Det passer med vårt valg (DBH 230210), ikke med hele fakultetet.
  - UiA inkluderer juss.
- **Figurer uten tabell.**
  - Tilstandsrapportens institusjonsfigur er målt opp fra piksler. Den ble overflødig da vedleggs-API-et ble funnet, og er ikke tatt med.
  - Nord HHN 2025 (0,64) er avlest fra en figur uten datamerker (±0,03).
- **Hull:**
  - Ingen tall på fakultets- eller handelshøyskolenivå for HVL og Kristiania SEIT. Høgskolen i Molde har bare institusjonsnivå.
  - OsloMet HHS har bare UiA-tabellen.
  - FT50-tall finnes bare for BI. NHH oppgir bonusliste-tildelinger, ikke FT50.
  - Fakultetstall for 2025 finnes bare fra NHH-rapporten, USN, INN og Nord.

## Observasjon om våre egne dokumenter
Raden «DBH 225/220/373/374» i `docs/bi-kristiania-datakilder.md` oppgir «K 2024: … 502 publiseringspoeng». HK-dir oppgir 251,1 for Kristiania i 2024, nesten nøyaktig halvparten. Det ligner på dobbelttellingen av avdeling 000000 pluss underavdelingene som `skoler-notat.md` advarer mot, og bør sjekkes.
