# Handelshøyskolene og økonomimiljøene i Norge: profiler (A3)

Kartlagt 17.10.2026. Dokumentet beskriver profilene i `data/marked/handelshoyskoler/profiler.json`: én post per
økonomisk-administrativt miljø i Norge, med organisering, DBH-enheter, fagmiljø, studenter, publisering, eksterne midler,
ph.d., akkrediteringer, ledelse, campuser, strategi, nylige endringer og saker fra styrepapirer. Til slutt står et forslag
til hvordan `kilde/src/app/data/konkurrenter.ts` kan utvides til alle miljøene.

Ingen eksisterende kode eller datafiler er endret. Alt ligger i `data/marked/handelshoyskoler/` og i dette dokumentet.

## 1. Filer

| Fil | Innhold |
|---|---|
| `data/marked/handelshoyskoler/profiler.json` | Resultatet: 19 profiler (17 miljøer + UiB og UiO økonomi som referanse) og definisjoner |
| `data/marked/handelshoyskoler/bygg_profiler.py` | Bygger profilene fra cachene (ingen nettkall). `python3 data/marked/handelshoyskoler/bygg_profiler.py` |
| `data/marked/handelshoyskoler/manuelt.json` | Kvalitative felt med kilde, hentedato og sikkerhet per opplysning: organisering, ledelse, campuser, nylige endringer, merknader |
| `data/marked/handelshoyskoler/dbh_hent.py` | Henter DBH 211, 101 og 347 (nivå FU) for alle, og fagmiljøtabellene for ONH (1407), til `kilder/dbh/` |
| `data/marked/handelshoyskoler/nfr_hent.py` | Henter Forskningsrådets utbetalinger per enhet fra Prosjektbanken til `kilder/prosjektbanken/` |
| `data/marked/handelshoyskoler/kilder/` | Cache: DBH (2,6 MB), Prosjektbanken (0,6 MB), nettsider for ledelse og strategi (`web/`, 5,4 MB), DBHs tabellkatalog |

`kilder/` er ikke gitignored (andre `kilder/`-mapper i prosjektet er det). Det bør avgjøres før commit.

## 2. Avgrensning og metode

**Enhetene.** Profilen bruker to nivåer der de er forskjellige:

- **«miljo»** er den minste enheten som bærer navnet handelshøyskole (samme valg som rangeringen, `data/rangering/skoler.json`
  og `skoler-notat.md`). NTNU = 230210 NTNU Handelshøyskolen + 230230 Institutt for samfunnsøkonomi; INN = 440400 + 440500;
  OsloMet = 530350; UiT = 540230; HVL = 250350; HiØ = 370300; Molde = avdeling 461 og 462.
- **«fakultet»** er enheten i `staffData` (HHs fagmiljøside og `konkurrenter.ts`). For OsloMet, UiT, HVL, HiØ og NTNU er den
  vesentlig større enn miljøet. Tallene på nivå «fakultet» er kontrollert mot `staffData.json` for 2024 og er identiske for
  faglige årsverk, førstestillinger, studenter, studentårsverk og publiseringspoeng.
- Ekstra snitt: UiS med NHS alene (210245), NTNU HHS alene og samfunnsøkonomi alene, Molde per avdeling, og hele institusjonen
  for NLA og ONH (der DBH ikke fordeler årsverk eller publisering på avdeling).

**Definisjoner** (står også i `profiler.json` → `definisjoner`):

- Faglige årsverk = DBH 225, kategori UN1 + UN3 + UN4 (uten stipendiater og postdoktorer), som `staffData`.
- Førstestillingsandel = professor, dosent, førsteamanuensis og førstelektor (også II-stillinger) / faglige årsverk.
- Professorandel = professor (stillingskode 1013 og 1404) / faglige årsverk. Dosenter og professor II står for seg.
- Poeng per faglig årsverk = DBH 373 / faglige årsverk. «HK-dir»-varianten deler på UN1 + UN2, som i Tilstandsrapporten
  (status-og-metode §42). NMBU 0,95, UiA 1,49 og BI 1,27 i 2024 stemmer med HK-dir.
- Nivå 2-andel = nivå 2-forfatterandeler / alle forfatterandeler (DBH 374). `andelNiva2Poeng` er andelen av poengene, som
  `staffData` bruker; den er om lag dobbelt så høy.
- Studentårsverk = DBH 900, ny produksjon for emner enheten eier (60 sp = 1). Studiepoeng = studentårsverk × 60.
- Disputaser = DBH 101 der kandidatens avdeling hører til miljøet, alle program, 2021–2025.
- NFR til enheten = Prosjektbanken, utbetalt i kalenderåret til prosjekter der enheten er prosjektansvarlig. Dette er
  **minimumstall**: mye ligger på institusjonsnivå (NMBU hadde 85,5 mill. kr på institusjonsnivå i 2025 mot 0,45 mill. kr
  på Handelshøyskolen), og 2024 er lavt for alle på grunn av bruttobudsjettering.
- EU (CORDIS) og NFR-faget «Økonomi» finnes bare på institusjonsnivå (`eksterneMidler.institusjon` og `nfrFagOkonomi`).
  For NHH og BI er institusjonen lik miljøet.

**Kilder:** DBH-API (HK-dir), hentet 23.09, 03.10 og 17.10.2026; Forskningsrådets Prosjektbanken 17.10.2026;
`kilde/public/fagmiljo/forskning.json` (CORDIS og NFR-søknader, 26.09.2026); `data/rangering/skoler.json` (akkrediteringer,
03.10.2026); `data/hh/strategier/` (strategier, 25.09–10.2026); `data/hh/markedsstatus.json` (styrepapirer, 24.09.2026);
institusjonenes egne nettsider for ledelse (17.10.2026). Ingen innlogging, ingen innsynsbegjæringer, ingen kinesiske
KI-tjenester.

## 3. Sammenligningstabell

Tallene gjelder «miljo» og 2025 (DBH). Publiseringspoeng for 2025 kan bli justert. Små miljøer svinger mye fra år til år:
UiS gikk fra 1,91 til 2,50 poeng per faglig årsverk, og UiO økonomi fra 1,42 til 2,65. Bruk gjerne snittet av flere år
(profilene har 2021–2025).

| Miljø | DBH-enhet (miljø) | Faglige årsverk | Førstestilling % | Professor % | Reg. studenter | Studentårsverk | Publ.-poeng | Poeng per faglig årsverk | Poeng per årsverk (HK-dir) | Nivå 2 % | Disputaser 2021–25 | NFR til enheten 2021–25, mill. kr | Akkreditering (år) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| NHH | 1240 hele institusjonen | 169,4 | 86,9 | 50,8 | 4 500 | 3 310 | 335,0 | 1,98 | 1,19 | 43,0 | 95 | 211,4 | EQUIS (2001), AACSB (2022), AMBA (2020) |
| BI | 8241 hele institusjonen | 320,1 | 84,3 | 35,6 | 22 456 | 14 820 | 516,9 | 1,61 | 1,26 | 38,5 | 54 | 80,5 | EQUIS (1999), AACSB (2014), AMBA (2013) |
| NMBU | 1173 47* | 44,0 | 73,7 | 35,8 | 2 852 | 1 684 | 68,8 | 1,56 | 1,08 | 16,0 | 37 | 4,0 | AACSB (2025) |
| UiA | 1171 415* | 69,3 | 74,5 | 43,4 | 2 169 | 1 815 | 134,3 | 1,94 | 1,63 | 18,9 | 51 | 14,2 | AACSB (2019) |
| UiS | 1160 23* | 47,7 | 80,7 | 49,3 | 1 522 | 1 259 | 119,4 | 2,50 | 1,69 | 33,4 | 22 | 47,1 | EFMD-program (2021) |
| Nord | 1174 51* | 133,4 | 64,8 | 15,7 | 3 013 | 1 402 | 108,6 | 0,81 | 0,63 | 17,9 | 42 | 34,1 | – |
| NTNU | 1150 230210, 230230 | 56,2 | 89,7 | 37,3 | 1 751 | 1 735 | 86,8 | 1,54 | 1,19 | 23,1 | 26 | 62,5 | – |
| USN | 1176 62* | 180,8 | 72,5 | 27,1 | 5 153 | 3 267 | 196,5 | 1,09 | 1,03 | 15,3 | 13 | 45,6 | EFMD-program (2022) |
| OsloMet | 1175 530350 | 72,8 | 82,6 | 26,9 | 2 243 | 1 598 | 47,5 | 0,65 | 0,62 | 26,4 | 2 | 11,6 | – |
| UiT | 1130 540230 | 87,2 | 71,1 | 24,1 | 3 335 | 1 719 | 72,5 | 0,83 | 0,75 | 22,5 | 17 | 1,9 | – |
| HVL | 0238 250350 | 98,2 | 70,4 | 16,8 | 2 202 | 1 516 | 53,2 | 0,54 | 0,48 | 14,8 | 0 | – | – |
| INN | 1177 440400, 440500 | 107,5 | 71,7 | 21,9 | 4 715 | 2 167 | 155,7 | 1,45 | 1,25 | 19,6 | 9 | 10,7 | – |
| HiMolde | 0232 461*, 462* | 90,5 | 69,2 | 33,0 | 2 733 | 1 301 | 146,1 | 1,61 | 1,28 | 31,0 | 15 | 13,2 | – |
| Kristiania | 8253 31*, 33*, 38* | 145,1 | 67,4 | 18,1 | 8 957 | 6 238 | 215,0 | 1,48 | 1,21 | 27,9 | 0 | 28,2 | – |
| HiØ | 0256 370300 | 18,8 | 75,6 | 10,6 | 554 | 347 | 3,7 | 0,20 | 0,20 | 0,0 | 0 | 2,0 | – |
| NLA | 8223 54* | – | – | – | 961 | 650 | – | – | – | – | 0 | 0,1 | – |
| ONH | 1407 24* | 16,0 | 53,8 | 5,6 | – | – | – | – | – | – | 0 | – | – |
| UiB økonomi | 1120 210620 | 21,5 | 95,3 | 56,5 | 683 | 486 | 16,2 | 0,75 | 0,72 | 63,1 | 9 | 1,2 | – |
| UiO økonomi | 1110 210620 | 25,3 | 81,3 | 50,1 | 578 | 478 | 67,2 | 2,65 | 1,19 | 46,0 | 24 | 95,4 | – |

Merknader til tabellen:

- **NHH og BI** er hele institusjonen. NFR-tallet for NHH (211,4 mill. kr) er alt NHH fikk utbetalt; om lag 131 mill. kr av
  det ble ført på Institutt for samfunnsøkonomi.
- **NTNU** er HHS + samfunnsøkonomi. Hele Fakultet for økonomi (med IØT) hadde 175,9 faglige årsverk i 2025.
- **Molde** er logistikk + økonomi og samfunnsvitenskap; Molde-tallet for NFR er hele høyskolen.
- **Kristiania** er SEIT (310) og SCLM (330), som også omfattet teknologi og kommunikasjon. NFR er hele Kristiania.
- **NLA og ONH:** DBH fordeler ikke årsverk (NLA) eller studenter og publisering (ONH) på avdeling. Hele institusjonen ligger
  i profilen under `nokkeltall.institusjon`.
- **HVL og Kristiania** har 0 disputaser fordi ph.d.-programmene ligger på fakultets- eller doktorgradsskolenivå (HVL PHDINN
  på 250000: 5 i 2024 og 3 i 2025; Kristiania PIT på 350000: 3 i 2025).
- **UiS** har EFMD-programakkreditering av femårig master fra 2021. Fornyelsen er ikke bekreftet, og strategikartleggingen
  omtaler UiS som uten institusjonsakkreditering.

### Organisering, ledelse, campus, ph.d. og strategi

| Miljø | Organisering | Leder (sikkerhet) | Campuser | Ph.d.-program (disputaser 2021–25) | Strategi |
|---|---|---|---|---|---|
| NHH | egen institusjon | Helge Thorbjørnsen, rektor (middels) | Bergen (Helleveien), Oslo (NHH Executive, Drammensveien 44) | PHD (94); DRPHILOS (1) | [Strategi for NHH 2026–2029](https://www.nhh.no/globalassets/om-nhh/strategi/nhh_strategi_2026-29_no.pdf) |
| BI | egen institusjon | Egil Matsen, rektor (fra august 2026) (middels) | Oslo (Nydalen), Bergen, Stavanger, Trondheim, nett | DR (54) | [Strategi 2030 – Kunnskap som forandrer](https://www.bi.no/om-bi/strategi/) |
| NMBU | eget fakultet | Per Botolf Maurseth, dekan (middels) | Ås | PHD-HH (32); PHD (5) | [Ingen egen HH-strategi kartlagt; utkast til utviklingsavtale NMBU 2027–2030](https://opengov.360online.com/Meetings/nmbu/File/Details/1578702.pdf?fileName=Endelig%20utkast%20til%20Utviklingsavtale%20for%20NMBU%202027-2030) |
| UiA | eget fakultet | Kristin Wallevik, dekan (høy) | Kristiansand | HH-DR (51) | [Strategiplan 2025–2028 Handelshøyskolen ved UiA](https://www.uia.no/om-uia/fakultet/handelshoyskolen/om/hh.pdf) |
| UiS | eget fakultet | Ola Kvaløy, dekan (høy) | Stavanger (Ullandhaug) | D-SAMVIT (17); D-SAMVIT1 (5) | [Strategy 2030 for UiS School of Business and Law (ny strategi for sammenslått HH varslet)](https://www.uis.no/en/about-uis/strategy-2030-for-the-uis-school-of-business-and-law) |
| Nord | eget fakultet | Gry Agnete Alsos, dekan (høy) | Bodø (Mørkved), Stjørdal, Steinkjer, Mo i Rana, nett | DRGE (42) | [Nord universitet: Strategi 2030](https://www.nord.no/sites/default/files/2023-05/Strategi2030_engelsk.pdf) |
| NTNU | institutt i fakultet | Thale Kvernberg Andersen, instituttleder, NTNU Handelshøyskolen (høy) | Trondheim, Ålesund, Gjøvik | PHOL (26) | [Fakultet for økonomi: Strategi 2026–2035](https://www.ntnu.no/ok/strategi) |
| USN | eget fakultet | Ingunn Elvekrok, dekan (høy) | Bø, Drammen, Hønefoss (Ringerike), Kongsberg, Vestfold (Horten), Hallingdal (fast tilstedeværelse avviklet 2026) | PHDMAR (9); PHDMAN (4) | [USN Handelshøyskolens strategiplan 2022–2026 (USN 2035 på høring)](https://www.usn.no/getfile.php/13729066-1662753097/usn.no/om_USN/Organisering/Fakultetene/Handelsh%C3%B8yskolen/Strategiplan-2022-26-USNHH.pdf) |
| OsloMet | institutt i fakultet | ikke funnet, instituttleder (lav) | Oslo (Pilestredet), Campus Romerike, Lillestrøm (planlagt for deler av HHS) | PHDS (2) | [Strategisk handlingsplan SAM 2025–2030](https://www.oslomet.no/om/sam/strategisk-handlingsplan-sam) |
| UiT | institutt i fakultet | Mette Talseth Solnørdal, instituttleder (lav) | Tromsø, Alta, Harstad, Narvik, nett | PH-SAMFVIT (17) | [BFE strategisk langtidsplan 2023–2026; UiT Eallju 2030](https://mportal-api-ext-v2.uit.no/motekalender/behandlingdok/773096) |
| HVL | institutt i fakultet | Tone Merete Brekke, instituttleiar (høy) | Bergen, Haugesund, Sogndal, Førde | – | [Strategi for HVL 2023–2030 (midtveisrevisjon 2026)](https://www.hvl.no/contentassets/fcb7b0b9236247389baa6a5faf3b2e76/hvl-strategi-2023-30-med-kap-5.pdf) |
| INN | eget fakultet (bredt) | Ingvild Jøranli, dekan (høy) | Lillehammer, Rena, Kongsvinger (studiesenter), nett | PHDINTOP (9) | [Strategi 2027–2032, Universitetet i Innlandet (vedtatt 17.06.2026)](https://www.inn.no/om-universitetet/organisering/universitetsstyret/saksdokumenter-styret-inn/Innkalling%20og%20agenda%20Universitetsstyret%2017.06.2026) |
| HiMolde | avdelinger i høyskole | Oskar Solenes, dekan, Avdeling for økonomi og samfunnsvitenskap (høy) | Molde, nett | DOKLOG (14); DRHS (1) | [Strategi 2029 (vedtatt 4.6.2025)](https://www.himolde.no/om/strategi/) |
| Kristiania | fakultet i privat høyskole | Casper Claudi Rasmussen, dekan, Fakultet for ledelse og økonomi (høy) | Oslo, Bergen, nett | – | [Strategi 2026–2030](https://www.kristiania.no/contentassets/ab297570b439490f8f69eea879890ef4/hoyskolen-kristiania-strategi-2026-2030.pdf) |
| HiØ | institutt i fakultet | Susanne Koch Stigberg, dekan, IIØ (høy) | Halden, Fredrikstad (høgskolen) | – | [Strategi 2030 (justert 2026)](https://www.hiof.no/om/styringsdokumenter-rapporter/styringsdokumenter/strategisk-plan-2023-2030.html) |
| NLA | avdeling i privat høyskole | ikke funnet, avdelingsleder (lav) | Oslo, Bergen, Kristiansand | – | Ikke kartlagt |
| ONH | institutt i privat høyskole | ikke funnet, instituttleder (lav) | Oslo (Ullevålsveien 76), nett | – | Ikke kartlagt |
| UiB økonomi | institutt i fakultet | ikke funnet, instituttleder (lav) | Bergen | PHDSV (9) | Ikke kartlagt |
| UiO økonomi | institutt i fakultet | Karen Helene Ulltveit-Moe, instituttleder (høy) | Oslo (Blindern) | PHD-SV (24) | Årsplan for Økonomisk institutt 2026–2028 (ikke lenket) |

Ledelse er lest på institusjonenes sider 17.10.2026. «Middels» betyr indirekte kilde (utvalgsside eller styreprotokoll), og
«lav» betyr gammel eller manglende kilde. Navnene bør kontrolleres før de brukes på en side. To forhold å merke seg:
Kristianias nye Fakultet for ledelse og økonomi ledes av Casper Claudi Rasmussen, som tidligere var dekan ved HH NMBU, og
NMBU-siden oppgir Per Botolf Maurseth som dekan.

### Nylige endringer 2023–2026 (utdrag; full liste med kilder i `nyligeEndringer`)

- **NHH:** 2024: Ny bachelor in Business, Economics and Data Science (BEDS). 2026: Ny strategi 2026–2029 vedtatt 05.03.2026; EQUIS reakkreditert for fem år (styret 23.04.2026). 2026: NHH Executive lanserer en modulbasert Executive Master of Management; EMBA-program slås sammen. 2027: Ny struktur på master i økonomi og administrasjon og ny Master in Business and Data Science (planlagt august 2027).
- **BI:** 2025: Strategi 2030 iverksatt; The Village (innovasjon og entreprenørskap) lansert; antall forskningssentre økt fra åtte til 16. 2026: EQUIS fornyet for fem år (mars 2026); første kull på master i rettsvitenskap høsten 2026; masterreform. 2026: Doing Sustainable Business blir obligatorisk siste bachelorsemester. 2027: Mål om å være klar til å søke universitetsakkreditering innen 2027.
- **NMBU:** 2023–2025: Årsstudiet i bærekraftig økonomi og ledelse (deltid) har gjort HH til NMBUs største fakultet målt i studiepoeng; registrerte studenter økte fra 1 073 (2022) til 3 088 (2024). 2025: AACSB-akkreditert (første gang, november 2025). 2026: Nettorammen økte med over 20 prosent fra 2025 til 2026, også korrigert for internhusleie.
- **UiA:** 2024: AACSB reakkreditert (2023/24). 2025: Master i Management and Business Development startet; International Business tar ikke opp nye studenter; EQUIS-prosess startet (fakultetsstyret 25.03.2025). 2026: Ny erfaringsbasert master i ledelse og HR; praksisemnet ORG235 utvides til bachelor i økonomi og administrasjon.
- **UiS:** 2026: NHS – Institutt for ledelse og tjenesteutvikling overført til Handelshøgskolen 1.1.2026 (styrevedtak 6–5, 12.06.2025); gevinstkrav 10–13 mill. kr per år og kutt av 12–15 emner. 2026: Nytt nettbasert årsstudium i økonomi og jus og ny master i økonomisk omstilling og innovasjon; nullopptak på bachelor i reiselivsledelse 2025 og 2026. 2026: Søknad om EQUIS eligibility i handlingsplanen for 2026.
- **Nord:** 2025: Nettbasert bachelor i økonomi og teknologiledelse startet (279 førsteprioritetssøkere); samlingsbasert i Mo i Rana fra høsten 2026. 2025: Godkjent: master i regnskap, revisjon og bærekraft; årsstudium i økonomi og digitalisering; bachelor i økonomi, digitalisering og forretningsutvikling. 2027: Nullopptak på erfaringsbasert master i helseledelse 2027/28; Nord trekker svakt søkte tilbud.
- **NTNU:** 2026: Nye strategier for NTNU, fakultetet og instituttet trådte i kraft 1.1.2026 (NTNU Handelshøyskolen: «Ansvarlig verdiskaping 2026–2035»). 2026: Årsstudiet i økonomi og administrasjon i Trondheim tar ikke opp nye studenter fra høsten 2026. pågående: Campussamlingen i Trondheim skal samle økonomimiljøene i sørvest med et innovasjonssenter mot Gløshaugen (tidsplan ikke oppgitt).
- **USN:** 2025: Rekordhøye 5 259 registrerte studenter høsten 2025; stillinger redusert fra 249 til 225 årsverk (2024–2026). 2025: EFMD-programakkreditering av bachelor i økonomi og ledelse forlenget ett år (desember 2025); reakkreditering for fem år etter besøk høsten 2026. 2026: Fast tilstedeværelse i Gol avviklet (mai 2026); nullopptak på HHs Hallingdal-program foreslått. «Satsning i Drammen» (styret juni 2026). 2027: Master i strategisk datavitenskap og ledelse (Drammen) planlagt fra 2027; mulig master i rettsvitenskap (Hønefoss).
- **OsloMet:** 2023–2025: Opptaket på bachelor i økonomi og administrasjon økt med 100 plasser per år, fullt innfaset for tre kull i 2025. 2026: Regjeringen ga klarsignal til Campus Romerike i Lillestrøm (januar 2026); bachelor- og masterutdanninger fra HHS med over 500 studenter skal inngå. 2027: SAM starter bachelor i rettsvitenskap høsten 2027 (styrevedtak 11.03.2026).
- **UiT:** 2024: UiT passerte 500 økonomikandidater, drevet av nettbasert bachelor i økonomi og administrasjon. 2026–2027: BFEs langtidsplan 2023–2026 løper ut; UiT skal i 2027 lage plan for campus og studiesteder utenfor Tromsø.
- **HVL:** 2024: Handelshøgskulen flyttet inn i FTMS (samme fakultet som ingeniørfag). 2026: NOKUT-besøk i april 2026 i universitetssaken; vedtak ventes innen utgangen av 2026 («Universitetet på Vestlandet»). 2026–2027: Mulig nedleggelse av deltidsmaster i ansvarleg innovasjon og entreprenørskap og deltidsbachelor i Haugesund; ny master Entreprenørskule i Bergen; omfordeling av studieplasser mellom fakultetene (vedtak oktober 2026).
- **INN:** 2024: Høgskolen i Innlandet ble universitet (akkreditert 8.11.2024). 2026: Østlandsforskning avviklet som institutt (styrevedtak februar 2026); ny strategi 2027–2032 vedtatt 17.06.2026. 2027: HHS deles i seks institutter fra 1.1.2027, bl.a. nytt Institutt for økonomi og dataanalyse og Institutt for samfunnssikkerhet og offentlig styring. 2027: Master i rettsvitenskap avventer NOKUT, tidligst 2027.
- **HiMolde:** 2025: Ny Strategi 2029 vedtatt 4. juni 2025.
- **Kristiania:** 2025: Driftsunderskudd på rundt 100 mill. kr i 2025 med omstillingskostnader på 127 mill. kr. 2026: Ny organisasjonsmodell 1.8.2026: fem schools blir tre fakulteter; rektor og administrerende direktør slått sammen. 2026: Bachelor i økonomi og ledelse heter «Bachelor i økonomi og administrasjon – bli siviløkonom» fra høsten 2026; ny strategi 2026–2030 vedtatt 9. juni 2026.
- **HiØ:** 2024–2025: Omstilling for 2025–2027 med om lag 58 mill. kr i årlige innsparinger, ca. 60 færre årsverk og kutt i studietilbud. 2025–2026: Deltidsvariant av bachelor i økonomi og administrasjon fra 2025–2026; ØIS organisert i tre fagmiljøer fra januar 2026. 2026: Behovsanalyse for tverrfaglig master i digital business og teknologiledelse.
- **UiB økonomi:** 2026: Nytt tverrfakultært studieprogram i filosofi, politikk og økonomi (FPØ); instituttet får én øremerket rekrutteringsstilling.
- **UiO økonomi:** 2026: Tildeling 53,9 mill. kr for 2026; flere nye faste vitenskapelige stillinger fra høsten 2026; egen KI-strategi for undervisning og vurdering.

### Hovedfunn

- **Størrelse:** BI (320 faglige årsverk) og USN (181) er størst. HH NMBU (44) er blant de minste, på nivå med UiS (48) og
  NTNU HHS + samfunnsøkonomi (56).
- **Undervisningsbelastning:** HH NMBU har 38 studentårsverk per faglig årsverk i 2025. Bare BI (46) og Kristiania (43) har mer;
  NHH har 19,5, UiA 26 og UiS 26.
- **Forskning:** Med HK-dirs nevner ligger UiS (1,69) og UiA (1,63) øverst i 2025, deretter HiMolde (1,28), BI (1,26),
  INN (1,25), Kristiania (1,21), NHH, NTNU og UiO økonomi (1,19). HH NMBU har 1,08. Nivå 2-andelen er lav ved HH NMBU (16 %) mot NHH (43 %) og BI (39 %).
- **Kompetanse:** Blant handelshøyskolene er professorandelen høyest ved NHH (51 %) og UiS (49 %). HH NMBU har 36 %,
  omtrent som BI. De samfunnsøkonomiske referansene UiB (57 %) og UiO (50 %) ligger også høyt.
- **Ph.d.:** NHH (95 disputaser 2021–2025), BI (54), UiA (51), Nord (42) og HH NMBU (37) har flest.
- **Akkreditering:** Fire AACSB-skoler (BI, NHH, UiA, NMBU), Triple Crown ved BI og NHH. UiA og UiS jobber mot EQUIS,
  Nord og UiT mot AACSB, OsloMet har startet en AACSB-prosess, INN er EFMD-medlem, USN skal fornye EFMD-programakkrediteringen.
- **Fellestrekk 2026:** universitetssøknader (NHH, BI, HVL, Kristiania), sammenslåinger og omorganiseringer (UiS + NHS,
  INN seks institutter, Kristiania tre fakulteter, HVL inn i FTMS), jus som nytt eller voksende fagområde (BI, OsloMet, INN og USN; UiA og UiS har jus i fakultetet) og
  stramme rammer med nedbemanning (USN, INN, HiØ, Nord).

## 4. Forslag: `konkurrenter.ts` for alle miljøene

### 4.1 Hva som mangler i dag

`KONKURRENTER` har OsloMet og HiØ. Profilene viser at **14 av 16 konkurrenter er klare** med det dagens felt krever
(programmer i `programkart.json`, enhet i `staffData`, nøkkel i `COURSE_MAPPING`). Unntakene er:

- **NLA:** enheten 8223_540 finnes ikke i `staffData` (NLA er ikke i HH-enhetene der). Fagmiljøkortet må vise «ikke tilgjengelig»
  eller bruke hele NLA.
- **ONH:** har UHR-nøkkel, men ingen programmer i `programkart.json` og ingen enhet i `staffData`. Programmene må legges inn
  først (DBH-kode i `dbh-programkart.json`, opptak fra DBH 379 siden ONH tar opp lokalt).

### 4.2 Utvidelse av grensesnittet

Behold dagens felt og legg til valgfrie felt, slik at OsloMet og HiØ fungerer uendret:

```ts
export interface Konkurrent {
  // … dagens felt (id, kort, navn, inst, enhet, enhetNavn, studiested, nettside, uhr, programmer, merknad)
  /** Nøkkel i data/marked/handelshoyskoler/profiler.json (lik id). */
  profil?: string;
  /** Minste enhet som bærer navnet, når den er mindre enn `enhet` (DBH-avdelingskoder). */
  miljo?: { avdelinger: string[]; navn: string };
  /** egen institusjon | eget fakultet | institutt i fakultet | avdeling … */
  organisering?: string;
  /** Vises som «kommer» til programmer og fagmiljødata er på plass. */
  status?: 'klar' | 'mangler-data';
}
```

Kvalitative data (ledelse, akkreditering, strategi, endringer, styresaker, ph.d., NFR) bør **ikke** skrives inn i
`konkurrenter.ts`. Lag i stedet et byggeskript, `scripts/build-konkurrentprofiler.py`, som leser `profiler.json` og skriver
`kilde/public/konkurrenter/<id>.json` (lastes med `fetch` når konkurrentsiden åpnes, som andre store datasett). Da holder
`konkurrenter.ts` seg liten, og profilene kan oppdateres uten å endre kode.

### 4.3 Oppføringene

Tabellen er generert fra `konkurrentForslag` i `profiler.json`. `nmbuId` er satt etter gruppen i `programkart.json`; femårige
siviløkonomløp får `null` (som `oslomet_siv`). Svakere sammenligninger (`default: false` i programkartet) bør enten tas med
og merkes, eller utelates fra konkurrentsiden. For referansene UiB og UiO finnes ingen UHR-tabell (ingen bachelor i økonomi
og administrasjon); siden må da skjule UHR-delen.

| id | inst | enhet | uhr | Programmer i programkart.json (entryId → nmbuId) | Mangler |
|---|---|---|---|---|---|
| nhh | 1240 | 1240_000000 | nhh | `nhh_oa`→`nmbu_oa`; `nhh_moa`→`nmbu_moa`; `nhh_msc`→`nmbu_moa` | ingenting |
| bi | 8241 | 8241_000000 | bi | `bi_oa`→`nmbu_oa`; `bi_dbh`→`nmbu_olit`; `bi_dsb`→`nmbu_olit`; `bi_moa`→`nmbu_moa`; `bi_mecon`→`nmbu_mecon`; `bi_mei`→`nmbu_mei` | ingenting |
| uia | 1171 | 1171_415 | uia | `uia_oa`→`nmbu_oa`; `uia_siv`→null; `uia_itis`→`nmbu_olit`; `uia_moa`→`nmbu_moa`; `uia_mei`→`nmbu_mei` | ingenting |
| uis | 1160 | 1160_230 | uis | `uis_oa`→`nmbu_oa`; `uis_digserv`→`nmbu_olit`; `uis_moa`→`nmbu_moa`; `uis_okjus_ar`→`nmbu_bel` | ingenting |
| nord | 1174 | 1174_510 | nord | `nord_oa`→`nmbu_oa`; `nord_steinkjer_oa`→`nmbu_oa`; `nord_edf`→`nmbu_olit`; `nord_moa`→`nmbu_moa`; `nord_hr_ar`→`nmbu_bel`; `nord_mei`→`nmbu_mei` | ingenting |
| ntnu | 1150 | 1150_230 | ntnu | `ntnu_oa`→`nmbu_oa`; `ntnu_alesund_oa`→`nmbu_oa`; `ntnu_gjovik_oa`→`nmbu_oa`; `ntnu_siv`→null; `ntnu_samf`→`nmbu_samf`; `ntnu_dfu`→`nmbu_olit`; `ntnu_moa`→`nmbu_moa`; `ntnu_mecon`→`nmbu_mecon`; `ntnu_okled_ar`→`nmbu_bel`; `ntnu_mei`→`nmbu_mei`; `ntnu_ment`→`nmbu_mei`; `ntnu_circ`→`nmbu_bioec` | ingenting |
| usn | 1176 | 1176_620 | usn | `usn_oa`→`nmbu_oa`; `usn_honefoss_oa`→`nmbu_oa`; `usn_bo_oa`→`nmbu_oa`; `usn_kongsberg_oa`→`nmbu_oa`; `usn_siv`→null; `usn_itled`→`nmbu_olit`; `usn_itis`→`nmbu_olit`; `usn_moa`→`nmbu_moa` | ingenting |
| oslomet | 1175 | 1175_530 | oslomet | `oslomet_oa`→`nmbu_oa`; `oslomet_siv`→null; `oslomet_moa`→`nmbu_moa`; `oslomet_mei`→`nmbu_mei` | ingenting |
| uit | 1130 | 1130_540 | uit | `uit_oa`→`nmbu_oa`; `uit_alta_oa`→`nmbu_oa`; `uit_harstad_oa`→`nmbu_oa`; `uit_samf`→`nmbu_samf`; `uit_moa`→`nmbu_moa`; `uit_mecon`→`nmbu_mecon`; `uit_ledelse_ar`→`nmbu_bel`; `uit_bedok_ar`→`nmbu_bel` | ingenting |
| hvl | 0238 | 0238_250 | hvl | `hvl_bergen_oa`→`nmbu_oa`; `hvl_haugesund_oa`→`nmbu_oa`; `hvl_sogndal_oa`→`nmbu_oa`; `hvl_dol`→`nmbu_olit`; `hvl_moa`→`nmbu_moa` | ingenting |
| inn | 1177 | 1177_440 | inn | `inn_oa`→`nmbu_oa`; `inn_rena_oa`→`nmbu_oa`; `inn_moa`→`nmbu_moa`; `inn_orgled_ar`→`nmbu_bel`; `inn_bedok_ar`→`nmbu_bel`; `inn_offstyr_ar`→`nmbu_bel` | ingenting |
| himolde | 0232 | 0232_462 | himolde | `himolde_oa`→`nmbu_oa`; `himolde_log_ar`→`nmbu_bel` | ingenting |
| kristiania | 8253 | 8253_310 | kristiania | `kristiania_oa`→`nmbu_oa`; `kristiania_bod`→`nmbu_olit`; `kristiania_mei`→`nmbu_mei` | ingenting |
| hiof | 0256 | 0256_370 | hio | `hiof_oa`→`nmbu_oa`; `hiof_is`→`nmbu_olit` | ingenting |
| nla | 8223 | 8223_540 | nla | `nla_oslo_oa`→`nmbu_oa`; `nla_bergen_oa`→`nmbu_oa`; `nla_krs_oa`→`nmbu_oa`; `nla_bei_ar`→`nmbu_bel` | enhet i staffData (HH) |
| onh | 1407 | 1407_240 | onh | – | programmer i programkart.json, enhet i staffData (HH) |
| uib_okon | 1120 | 1120_210 | – | `uib_samf`→`nmbu_samf`; `uib_imo`→`nmbu_olit`; `uib_mecon`→`nmbu_mecon` | nøkkel i COURSE_MAPPING |
| uio_okon | 1110 | 1110_210 | – | `uio_samf`→`nmbu_samf`; `uio_finans`→`nmbu_samf`; `uio_inl`→`nmbu_olit`; `uio_mecon`→`nmbu_mecon`; `uio_mei`→`nmbu_mei` | nøkkel i COURSE_MAPPING |

Merknader til oppføringene:

- **`enhet` for Molde** er satt til 0232_462 (Avdeling for økonomi og samfunnsvitenskap). Kontroller i DBH 347 hvilken avdeling
  som eier bachelor i økonomi og administrasjon (kode 07) før den låses. Logistikk (0232_461) bør vises som eget delmiljø.
- **`enhet` for Kristiania** er 8253_310 i `staffData`, men miljøet ligger i både 310 og 330 til og med 2025 og i 380 fra 2026.
  `staffData` bør få en sammenslått enhet (310 + 330 → 380), som INN 0264 → 1177.
- **NTNU, OsloMet, UiT, HVL og HiØ:** fagmiljøkortet viser i dag hele fakultetet. Med `miljo.avdelinger` kan siden vise
  instituttet ved siden av (tallene finnes i `profiler.json` → `nokkeltall.miljo`).
- **UiS:** NHS (210245) bør legges til fra 2026 når DBH får ny kode.
- **Samme institusjon, flere campuser** (USN, UiT, HVL, NTNU, Nord, INN, NLA): én konkurrent per institusjon med alle campusene
  i `programmer`, ikke én per campus.

### 4.4 Foreslått rekkefølge

1. Dagens «kommer»-liste: **USN, INN, Kristiania, BI** (alt er klart).
2. De nærmeste på opptak og fag: **NHH, UiA, NTNU, UiS, Nord** (klare).
3. Resten: **UiT, HVL, HiMolde, NLA** (NLA uten fagmiljøkort), deretter **ONH** når programmene er lagt inn.
4. Referansene **UiB og UiO** bare for samfunnsøkonomi-gruppene (`samf`, `mecon`).

## 5. Usikkerheter og kjente svakheter

- **Prosjektbanken på enhetsnivå** er minimumstall og ujevnt fordelt. UiT har bare beløp på Handelshøgskolen i 2021; UiB og UiO
  er skilt ut på instituttnavn fordi fakultetsfilteret ga samme svar for begge; HVLs nye fakultet FTMS finnes ikke som egen
  enhet i Prosjektbanken for 2025.
- **NFR-søknadsdataene** mangler søknader fra Tibi fra 2023, så `nfrFagOkonomi` er for lavt fra 2023.
- **EU-midler** finnes bare per institusjon. EU-andelen til handelshøyskolene inne i universitetene er ikke målt.
- **BOA** for enheten finnes bare der styrepapirene oppgir det (Nord, USN, NMBU, OsloMet-fakultetet, UiB-fakultetet).
- **DBH 2025** for publisering kan bli justert. **INN** byttet kode i 2025, og **UiA** ble omorganisert i 2024 (bruk fakultetsnivå).
- **Ledelse:** fem navn er usikre eller mangler (OsloMet, UiT, UiB, NLA, ONH). Ingen er hentet fra lekket eller lukket materiale.
- **Styrepapirer** mangler for NTNU og UiT (bak innlogging), for de private (BI, Kristiania, NLA, ONH) og for Molde og NLA
  (ikke kartlagt).
- **ONH:** nettsiden lenker til en åpenhetslovredegjørelse under navnet «Lumi Gruppen». Eierforholdet er ikke kontrollert.

## 6. Kommandoer

```bash
python3 data/marked/handelshoyskoler/dbh_hent.py --ekstra 1407     # DBH 211/101/347 + ONH (cache i kilder/dbh/)
python3 data/marked/handelshoyskoler/nfr_hent.py                  # Prosjektbanken per enhet (cache)
python3 data/marked/handelshoyskoler/bygg_profiler.py             # skriver profiler.json
```

Bruk `--refresh` på hentingen for å fornye cachen. Byggeskriptet leser også `data/nmbu/kilder/dbh-fagmiljo/` (fra
`scripts/build-staff.py`), `kilde/public/fagmiljo/forskning.json`, `data/rangering/skoler.json`, `data/hh/strategier/`,
`data/hh/markedsstatus.json` og `data/hh/programkart.json`.
