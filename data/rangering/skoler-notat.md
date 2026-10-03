# Enhetene i «Norwegian Business School Ranking» (utkast)

Kartlagt 3. oktober 2026. Dataene ligger i `skoler.json`: én rad per enhet, 15 handelshøyskoler/fagmiljøer og 2 valgfrie referanser (UiB og UiO). Notatet forklarer kildene, valgene og hva som er usikkert.

## Kilder
- **NVA/Cristin, enheter:** `https://api.nva.unit.no/cristin/organization/<id>`, der vi har fulgt `hasPart` nedover fra institusjonsnivået.
- **NVA, kontrolltall:** `https://api.nva.unit.no/search/resources?unit=<url-kodet enhets-URL>&publicationYear=2024&instanceType=AcademicArticle&results=1`, der vi leser `totalHits`. Søket tar med underenheter, men bare dem som ligger under enheten i NVA-treet (se OsloMet nedenfor). `alleKategorier` er samme søk uten `instanceType`.
- **DBH:** Avdelingene med navn kommer fra tabell 210, hentet på nytt 3.10.2026 med `variabler: ["*"]`. Cachen i `data/nmbu/kilder/dbh-fagmiljo/210_*.json` mangler avdelingsnavn. Publiseringspoeng og publikasjoner kommer fra tabell 373, og årsverk fra tabell 225. Begge er lest fra cachen i `data/nmbu/kilder/dbh-fagmiljo/` (hentet 23.9.2026; inneholder 2019–2025). «Faglige årsverk» betyr stillingskategori UN1 + UN3 + UN4 i tabell 220, likt med `scripts/build-staff.py`.
- **Akkrediteringer:**
  - AACSB-søket for Norge (`https://www.aacsb.edu/accredited?countries=norway`), lest i nettleser 3.10.2026. Fire skoler står der: BI, NHH, NMBU og UiA.
  - EFMDs lister over EQUIS-skoler og EFMD-akkrediterte programmer.
  - AMBA-BGA sine skolesider.
  - Skolenes egne sider for årstall.
- **Rangeringer:**
  - ShanghaiRanking GRAS 2026 og 2025, hentet fra API-et `https://www.shanghairanking.com/api/pub/v1/gras/rank?version=<år>&subj_code=AS0501|AS0509|AS0510|AS0511|AS0513`. Fagkodene er AS, ikke RS.
  - FT-plasseringer slik BI og NHH gjengir dem, med lenke til FT-tabellen. rankings.ft.com er ikke lest direkte.
  - Eduniversal sin Norge-side, 18. utgave (2025/2026).

## Valg
1. **Avgrensning:** Vi har brukt den minste enheten som bærer navnet handelshøyskole. Fagmiljøsiden til HH (`staffData`) bruker derimot hele fakultetet for NTNU, OsloMet, HVL, UiT og HiØ, så tallene i rangeringen og på fagmiljøsiden vil ikke stemme overens. Der et alternativ kan være aktuelt, står det i `dbh.alternativ` (NTNU-fakultetet, INN-kjerne, UiS + NHS og Molde hele).
2. **NHH og BI:** Hele institusjonen. I tabell 373 brukes avdeling 000000, som er institusjonstotalen og lik summen av instituttene. Den må ikke legges sammen med instituttene, for da telles poengene to ganger. Hos BI er årsverkene i tabell 225 ført på campus og ikke på institutt.
3. **Høgskolen i Molde:** Vi har tatt med Avdeling for logistikk og Avdeling for økonomi og samfunnsvitenskap, men ikke helse- og sosialfag. Molde er ikke blant HHs 13 konkurrenter.
4. **UiB og UiO:** Merket `referanse: true`. Dette er samfunnsøkonomiske institutter og ikke handelshøyskoler.
5. **GRAS:** Rangerer hele universiteter. Plasseringen er lagt på enheten, men merket `niva`.

## Usikkerheter og fallgruver
- **NTNU:** Det vi har kalt «NTNU Business School» er instituttet NTNU Handelshøyskolen (DBH 230210, NVA 194.60.10.0). AACSB-medlemskapet og HHs fagmiljøsammenligning gjelder derimot hele Fakultet for økonomi (230 / 194.60.0.0). Instituttet for industriell økonomi og teknologiledelse (IØT) står for rundt 63 % av fakultetets publiseringspoeng. Avgrensningen må avklares før vi rangerer.
- **OsloMet:** I NVA ligger faggruppene 215.5.6.1–215.5.6.5 som søsken av Handelshøyskolen (215.5.6.0) og ikke under den. `unit=215.5.6.0` gir derfor bare 19 artikler i 2024. Med alle seks id-ene blir det omtrent 49. NVA-paginering forbi 200 treff feiler (HTTP 500) og er ustabil, så unionstallene er omtrentlige.
- **INN:** Institusjonskoden i DBH er 0264 til og med 2024 og 1177 fra 2025. Fakultetet omfatter også psykologi, jus/filosofi og Østlandsforskning, som står for omtrent 40 % av publiseringspoengene i 2024.
- **Kristiania:** Omorganisert 1.8.2026.
  - DBH: til og med 2025 ligger miljøet under 310 (SEIT) og 330 (SCLM), fra 2026 under 380.
  - NVA: SEIT (1615.10.0.0) er frakoblet treet, men har fortsatt 2024-publikasjoner. Kontrolltallet 120 er 63 + 57, og overlappet er ikke målt.
  - Innhold: SEIT omfattet teknologi, og SCLM omfattet kommunikasjon.
- **UiS:** NHS (Norsk hotellhøgskole) ble flyttet til Handelshøgskolen 1.1.2026. I DBH står NHS fortsatt som 210245, gyldig til og med 2025, og det finnes ingen ny kode under 230. I NVA ligger NHS fortsatt under SV-fakultetet (217.7.6.0).
- **UiA:** Juss er med. Ved omorganiseringen i 2024 havnet publiseringspoengene for 2024 på gamle avdelingskoder og årsverkene på nye, så fakultetssummen må brukes.
- **HiØ:** Instituttet er svært lite (7 publiseringspoeng og 21 årsverk i 2024). Vi må avgjøre om det er «med forskning».
- **Akkrediteringer:**
  - Nord, NTNU (fakultetet), UiS og OsloMet er AACSB-medlemmer, men ikke akkreditert. Det står i den nordiske uttalelsen fra 2025, og ingen av dem er på AACSBs liste.
  - BI oppgir to datoer for AACSB i 2014 (januar og mai).
  - USNs EFMD-programakkreditering gjaldt i tre år fra 2022. Programmet står fortsatt på EFMD-listen, men fornyelsen er ikke bekreftet.
  - Vi fant ingen akkreditering for UiT, INN, HVL, Kristiania, HiØ eller Molde.
- **Rangeringer:**
  - FT MiM 2026: BI 81, NHH 88.
  - FT EBS 2025: BI 40, NHH 51.
  - FT Masters in Finance 2026: bare BI (61).
  - QS Business Masters 2026: bare BI. 2027-utgaven var ikke publisert 3.10.2026.
  - Ingen andre norske skoler er med i FT eller QS.
- **NVA mot DBH:** NVA-kontrolltallet gjelder bare tidsskriftartikler (AcademicArticle) og er ikke det samme som DBHs publikasjonstall, som tar med alle kategorier som gir publiseringspoeng.
- **Lekket materiale:** Ingenting av det er brukt. Alle kildene er åpne API-er eller offentlige nettsider.
