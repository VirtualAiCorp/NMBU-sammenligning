import { useState } from 'react';
import { FileText, Download, ChevronDown, ChevronUp, Clock, CheckCircle2, Building2 } from 'lucide-react';
import osloMetPdfUrl from '../../imports/Regnskapsrapport_20for_202025_20-_20Fakultet_20for_20samfunnsvitenskap.PDF?url';
import uiaKvalitetPdfUrl from '../../imports/HH_20kvalitetsrapport_202025.PDF?url';
import uiaInnkallingPdfUrl from '../../imports/Komplett_20innkalling_3a_20Fakultetsstyret_20for_20Handelsh_c3_b8yskolen_20_30.01.2026_.PDF?url';
import uiaBudsjettPdfUrl from '../../imports/Forslag_20til_20budsjett_202026_20Handelsh_c3_b8yskolen.PDF?url';
import hiofT3PdfUrl from '../../imports/T3_202025-2.PDF?url';
import hiofHandlingsplanPdfUrl from '../../imports/II_c3_98_20Handlingsplan_20mot_202030.PDF?url';
import usnAarsrapportPdfUrl from '../../imports/Vedlegg_201_20-_20_c3_85rsrapport_20USN_20Handelsh_c3_b8yskolen_202025.PDF?url';
import usnRegnskapPdfUrl from '../../imports/Vedlegg_202_20-_20tabeller_20regnskap_202025_20BFV_20og_20BOA.PDF?url';
import usnResultatPdfUrl from '../../imports/Vedlegg_203_20-_20Resultatindikatorer_20USN_20Handelsh_c3_b8yskolen_202025.PDF?url';
import usnBudsjettPdfUrl from '../../imports/Revidert_20budsjett_202026_20-_20USN_20Handelsh_c3_b8yskolen.PDF?url';
import usnStrategiPdfUrl from '../../imports/Vedlegg_20-_20Strategiutkast_20USN_202035.PDF?url';
import uisNhsFlyttingPdfUrl from '../../imports/3.1_20-_20Flytting_20av_20NHS_20-_20Institutt_20for_20ledelse_20og_20tjenesteutvikling_20til_20Handelsh_c3_b8gskolen_20UiS__20UiS-styresak_2012.6.25.PDF?url';
import uisNhsStatusPdfUrl from '../../imports/3.2_20-Overflytting_20av_20NHS_20-_20Institutt_20for_20ledelse_20og_20tjenesteutvikling_20til_20Handelsh_c3_b8gskolen_20UiS_20-_20statusoppdatering.PDF?url';
import uisNhsIntegrasjonPdfUrl from '../../imports/3.3_20-_20Integrering_20av_20NHS__20prosessbeskrivelse.PDF?url';
import uisAarsstudiumPdfUrl from '../../imports/Nytt_20_c3_a5rsstudium_20i_20_c3_b8konomi_20og_20jus.PDF?url';
import uisStudieportef2025aPdfUrl from '../../imports/4.1_20-_20Studieportef_c3_b8ljerapport_202025.PDF?url';
import uisStudieportef2025bPdfUrl from '../../imports/4.1_20-_20Studieportef_c3_b8ljerapport_202025-2.PDF?url';
import uisActionPlan2026PdfUrl from '../../imports/5.1_20-UiS_20Business_20School_20Action_20Plan_202026.PDF?url';
import uisStudieportef2026PdfUrl from '../../imports/4.1_20-_20Studieportef_c3_b8ljerapport_20HH-UiS_202026.pdf?url';
import nhhProtokoll0502PdfUrl from '../../imports/offentlig-protokoll-styret-ved-norges-handelshoyskole-05.02.2026.pdf?url';
import nhhProtokoll0503PdfUrl from '../../imports/protokoll-styret-ved-norges-handelshoyskole-05.03.2026.pdf?url';
import nhhProtokoll0503bPdfUrl from '../../imports/protokoll-styret-ved-norges-handelshoyskole-05.03.2026-2.pdf?url';
import nhhProtokoll2304PdfUrl from '../../imports/protokoll-styret-ved-norges-handelshoyskole-23.04.2026.pdf?url';
import hvlRekneskapPdfUrl from '../../imports/FTMS_20-_20tilbakemelding_20rekneskap_20per_2031.12.2025.PDF?url';
import hvlOppdragsbrevPdfUrl from '../../imports/rektors-oppdragsbrev-for-2026-ftms.PDF?url';
import hvlNokutPdfUrl from '../../imports/NOKUT_20sitt_20institusjonsbes_c3_b8k_20til_20HVL.pdf?url';
import hvlKiemnePdfUrl from '../../imports/KI-emne_20ved_20FTMS.pdf?url';
import innDes2025PdfUrl from '../../imports/innkalling-og-agenda-universitetsstyret-16.12.2025-oppdatert-11.des-sak-8_25-vedlegg-tabell-4-s.15.pdf?url';
import innMai2026PdfUrl from '../../imports/Innkalling_og_agenda_Universitetsstyret_04.05.2026_.pdf?url';
import innJun2026PdfUrl from '../../imports/Innkalling_og_agenda_Universitetsstyret_24.06.2026.pdf?url';

interface PdfAttachment {
  url: string;
  label: string;
  filename: string;
}

interface InstitutionReport {
  id: string;
  name: string;
  fullName: string;
  faculty: string;
  color: string;
  lightColor: string;
  borderColor: string;
  status: 'complete' | 'pending';
  reportTitle?: string;
  reportDate?: string;
  sourceUrl?: string;
  points?: string[];
  pdfs?: PdfAttachment[];
}

const REPORTS: InstitutionReport[] = [
  {
    id: 'oslomet',
    name: 'OsloMet',
    fullName: 'OsloMet – storbyuniversitetet',
    faculty: 'Fakultet for samfunnsvitenskap / Handelshøyskolen',
    color: '#7c2d2d',
    lightColor: '#fdf2f2',
    borderColor: '#f5c6c6',
    status: 'complete',
    reportTitle: 'Regnskapsrapport 2025 – Fakultet for samfunnsvitenskap',
    reportDate: 'Fakultetsstyret 2026',
    pdfs: [
      { url: osloMetPdfUrl, label: 'Regnskapsrapport 2025', filename: 'OsloMet_Regnskapsrapport_2025.pdf' },
    ],
    points: [
      'Fakultetet avsluttet ordinær virksomhet i 2025 med et overskudd på 12,1 millioner kroner, mot et budsjettert underskudd på 5,8 millioner. Resultatet var dermed 17,9 millioner bedre enn budsjettet.',
      'Mindreforbruket skyldtes hovedsakelig 4,9 millioner kroner høyere inntekter, 8,5 millioner lavere lønns- og personalkostnader og 4,5 millioner i øvrige besparelser, blant annet lavere reisekostnader.',
      'Handelshøyskolen fikk et resultat på 4,35 millioner kroner, som var 2,80 millioner bedre enn budsjettet. Institutt for sosialfag hadde fakultetets største positive budsjettavvik, på 6,73 millioner.',
      'Handelshøyskolens økte opptak med 100 studenter årlig er nå gjennomført for tre kull. Forsinkede nyansettelser har samtidig gitt flere studenter per faglige årsverk enn ønskelig.',
      'Fakultetet har økt opptaket ved bachelorutdanningene i sosialt arbeid og barnevern. Det planlegges oppstart av bachelor i rettsvitenskap høsten 2027, fulgt av et mulig masterstudium.',
      'Bidrags- og oppdragsvirksomheten hadde inntekter på 48,9 millioner kroner, 4,7 millioner over budsjett. Resultatet ble likevel bare 70 387 kroner, fordi kostnadene også var høyere enn planlagt.',
      'Forskningsrådsinntektene per faglige årsverk var bedre enn målet, men lavere enn tidligere år. EU-inntektene var under målet, mens annen eksternfinansiert aktivitet var over målet. Tre nye Forskningsråd-prosjekter starter i 2026.',
      'Fakultetet forventer å overføre 14,5 millioner kroner i ubrukt rammebevilgning og én million i øremerkede midler til 2026, mens 12,3 millioner tilbakeføres til universitetet. Fakultetet vil styrke økonomistyringen og langtidsplanleggingen i møte med forventede reduksjoner i rammebevilgningen frem mot 2030.',
    ],
  },
  {
    id: 'uia',
    name: 'UiA',
    fullName: 'Universitetet i Agder',
    faculty: 'Handelshøyskolen ved UiA',
    color: '#003087',
    lightColor: '#f0f4fb',
    borderColor: '#b3c6e8',
    status: 'complete',
    reportTitle: 'Budsjett 2026 · Innkalling fakultetsstyret 30.01.2026 · Kvalitetsrapport 2025',
    reportDate: 'Fakultetsstyret for Handelshøyskolen',
    sourceUrl: 'https://opengov.360online.com/Meetings/uia',
    pdfs: [
      { url: uiaBudsjettPdfUrl,   label: 'Forslag til budsjett 2026',                     filename: 'UiA_Budsjett_2026.pdf' },
      { url: uiaInnkallingPdfUrl, label: 'Innkalling fakultetsstyret 30.01.2026',          filename: 'UiA_Innkalling_fakultetsstyret_2026.pdf' },
      { url: uiaKvalitetPdfUrl,   label: 'Kvalitetsrapport 2025',                          filename: 'UiA_Kvalitetsrapport_2025.pdf' },
    ],
    points: [
      'Budsjettet øker betydelig. Handelshøyskolen er tildelt 130,1 millioner kroner for 2026, en økning på 9,9 millioner. Det planlegges et mindreforbruk på cirka 4 millioner, hovedsakelig som følge av midlertidig lavere bemanning.',
      'Studentaktiviteten er i vekst. Handelshøyskolen hadde 2 170 registrerte studenter høsten 2025, over 100 flere enn året før. Veksten var særlig sterk på masternivå, med 101 flere studenter.',
      'Studieproduksjonen utvikler seg positivt. Antall avlagte studiepoeng økte med 8,2 prosent. Alle bachelorprogrammene lå over 50 studiepoeng per student, godt over UiAs grenseverdi på 45.',
      'Søkertallene er gjennomgående sterke. Alle bachelorprogrammene var blant UiAs fire største målt i førsteprioritetssøkere. Rettsvitenskap hadde flest søkere per studieplass, og alle bachelorprogrammene fikk flere registrerte studenter enn planlagt kapasitet.',
      'Studieporteføljen videreutvikles. Management and Business Development startet i 2025, mens International Business ikke lenger tar opp nye studenter. En ny erfaringsbasert master i ledelse og HR starter høsten 2026.',
      'Praksis og internasjonalisering styrkes. Et nytt NOREC-finansiert internship på 30 studiepoeng skal kunne tilbys studenter fra alle masterprogrammene. Handelshøyskolen arbeider med bedre arbeidslivskontakt og flere fleksible studietilbud.',
      'Handelshøyskolen har vært AACSB-akkreditert siden 2019. Akkrediteringen er et viktig kvalitetsstempel og brukes aktivt i konkurransen om studenter, ansatte og internasjonale samarbeidspartnere.',
      'Neste mål er EQUIS-akkreditering. Fakultetsstyret vedtok i mars 2025 å undersøke om Handelshøyskolen er kvalifisert for en formell EQUIS-prosess. Målet er å bli dobbeltakkreditert, og det er satt av 997 500 kroner til AACSB- og EQUIS-arbeidet i 2026.',
      'Flere studieprogrammer er reakkreditert. Bachelor i rettsvitenskap og master i økonomi og administrasjon ble reakkreditert i 2025. Executive MBA er også reakkreditert, mens det reviderte ph.d.-programmet var sendt til endelig behandling våren 2026.',
      'Forskningsfinansiering er et risikoområde. Handelshøyskolen deltok i 19 søknader om ekstern finansiering i 2025 og fikk fire tilslag. Flere NFR- og EU-prosjekter avsluttes i 2026, og fakultetet må øke søknadsaktiviteten for å opprettholde prosjektporteføljen.',
    ],
  },
  {
    id: 'nhh',
    name: 'NHH',
    fullName: 'Norges Handelshøyskole',
    faculty: 'Institusjonsrapport – NHH-styret',
    color: '#1e3a5f',
    lightColor: '#f0f5fb',
    borderColor: '#bfcfdf',
    status: 'complete',
    reportTitle: 'Protokoller NHH-styret 2026 – februar, mars, april',
    reportDate: 'Styret ved Norges Handelshøyskole',
    sourceUrl: 'https://www.nhh.no/om-nhh/organisasjon/ledelse/styret/',
    pdfs: [
      { url: nhhProtokoll0502PdfUrl,  label: 'Protokoll NHH-styret 05.02.2026',             filename: 'NHH_Protokoll_05.02.2026.pdf' },
      { url: nhhProtokoll0503PdfUrl,  label: 'Protokoll NHH-styret 05.03.2026',             filename: 'NHH_Protokoll_05.03.2026.pdf' },
      { url: nhhProtokoll0503bPdfUrl, label: 'Protokoll NHH-styret 05.03.2026 (vedlegg 2)', filename: 'NHH_Protokoll_05.03.2026_vedlegg2.pdf' },
      { url: nhhProtokoll2304PdfUrl,  label: 'Protokoll NHH-styret 23.04.2026',             filename: 'NHH_Protokoll_23.04.2026.pdf' },
    ],
    points: [
      'Ny strategi er vedtatt. Strategien for 2026–2029 skal følges opp gjennom årlige handlingsplaner. Kunstig intelligens, innovasjon, bærekraft og tettere samspill med samfunns- og næringsliv står sentralt.',
      'NHH vil søke universitetsstatus. Et veiledningsmøte med NOKUT er gjennomført, og søknaden planlegges sendt mot slutten av 2026 eller begynnelsen av 2027. Behandlingen avventer NOKUTs periodiske tilsyn med kvalitetssystemet.',
      'Økonomien er fortsatt krevende. Resultatet for 2025 var negativt med 34,4 millioner kroner. Reservene bygges planmessig ned og ventes å være litt over 100 millioner ved utgangen av 2026. NHH arbeider derfor med både kostnadsreduksjoner og økte inntekter.',
      'NHH er EQUIS-reakkreditert for fem nye år. Tilbakemeldingene var svært positive, særlig om kontinuerlig kvalitetsforbedring og sterke forbindelser til samfunns- og næringsliv. NHH skal nå fastsette tre nye utviklingsmål for perioden.',
      'Master i regnskap og revisjon er reakkreditert. NHHs styre gjennomførte reakkrediteringen som del av den regelmessige kontrollen av at programmet oppfyller nasjonale kvalitets- og lovkrav.',
      'Søkertallene holder seg svært sterke. Bachelor i økonomi og administrasjon hadde nærmere 1 950 førstevalgssøkere, seks prosent flere enn i 2025, og var Norges tredje mest populære studium. Economics and Data Science hadde 557 førstevalgssøkere.',
      'Mastertilbudet skal fornyes. Master i økonomi og administrasjon får ny struktur fra august 2027. Samtidig planlegges en ny Master in Business and Data Science med samme oppstartstidspunkt.',
      'Forskningen får gode resultater, men er sårbar. En ekstern evaluering peker på at publiseringspoengene er konsentrert blant deler av fagstaben. Instituttene skal derfor følge opp egne handlingsplaner og utvikle en bredere publiseringskultur.',
      'Ph.d.-programmet rekrutterer internasjonalt sterkt. Programmet har lavt frafall, og rundt 60 prosent av kandidatene fortsetter karrieren i Norge. NHH ønsker samtidig å rekruttere flere av sine egne studenter til forskerutdanningen.',
      'KI og campusutvikling prioriteres. Copilot rulles ut til de ansatte, KI integreres i undervisningen og hjemmeeksamener vurderes erstattet av andre eksamensformer. En mulighetsstudie skal samtidig vurdere bedre læringsarealer og eventuell videre utbygging av campus.',
    ],
  },
  {
    id: 'hvl',
    name: 'HVL',
    fullName: 'Høgskulen på Vestlandet',
    faculty: 'Handelshøgskulen HVL – Fakultet for teknologi, miljø- og samfunnsvitskap (FTMS)',
    color: '#1a4731',
    lightColor: '#f0f7f3',
    borderColor: '#b5d5c5',
    status: 'complete',
    reportTitle: 'Rekneskap 2025 · Oppdragsbrev 2026 · NOKUT-besøk · KI-emne',
    reportDate: 'FTMS fakultetsråd – Høgskulen på Vestlandet',
    sourceUrl: 'https://opengov.360online.com/Meetings/hvl-uninett/Meetings/Details/936766?agendaItemId=216387',
    pdfs: [
      { url: hvlRekneskapPdfUrl,    label: 'Tilbakemelding rekneskap per 31.12.2025',  filename: 'HVL_FTMS_Rekneskap_2025.pdf' },
      { url: hvlOppdragsbrevPdfUrl, label: 'Rektors oppdragsbrev 2026 – FTMS',         filename: 'HVL_Oppdragsbrev_2026_FTMS.pdf' },
      { url: hvlNokutPdfUrl,        label: 'NOKUT sitt institusjonsbesøk til HVL',     filename: 'HVL_NOKUT_Institusjonsbesok.pdf' },
      { url: hvlKiemnePdfUrl,       label: 'KI-emne ved FTMS',                         filename: 'HVL_KI-emne_FTMS.pdf' },
    ],
    points: [
      'Dokumentene gjelder FTMS samlet. Handelshøgskulen HVL inngår i Fakultet for teknologi, miljø- og samfunnsvitskap. Økonomitallene og oppdragene nedenfor gjelder derfor hele fakultetet, ikke Handelshøgskulen alene.',
      'Økonomien er kraftig forbedret. FTMS fikk et regnskapsført mindreforbruk på 14,5 millioner kroner i 2025. Kostnadsnivået var 17,9 millioner lavere enn tildelingen, mot 20,1 millioner høyere enn tildelingen i 2024.',
      'Bemanning og kostnader er redusert. Totale kostnader falt med 9,4 millioner kroner, mens lønnskostnadene gikk ned med 9,2 millioner. Antall årsverk ble redusert med 15,2 til 493,8, og reisekostnadene falt med 16,9 prosent.',
      'Eksternfinansieringen må styrkes. Nettoresultatet fra eksterne prosjekter var 34 millioner kroner, 6,5 millioner lavere enn i 2024, men 2,6 millioner over budsjett. Fakultetet skal arbeide for flere gjennomslag i blant annet Horisont Europa.',
      'Studieporteføljen skal forenkles. FTMS skal samkjøre flere emner, redusere kompleksiteten og bruke ressursene bedre. Rekruttering, gjennomføring, frafall og stabilitet i nett- og samlingsbaserte videreutdanninger skal følges særskilt opp.',
      'Et nytt KI-emne tilbys hele HVL. Det heldigitale mikroemnet Kunstig intelligens: Hva dreier det seg om? gir 2,5 studiepoeng og ble tilbudt første gang våren 2026. Et nytt emne innen digitalisering og KI planlegges høsten 2026.',
      'Forskning og kompetanse prioriteres. Fakultetet skal innføre insentiver for økt publisering og ekstern finansiering, vurdere doktorgradsporteføljen og styrke forskningskulturen. Digital helse, internasjonalt samarbeid og høyere førstekompetanse er sentrale satsinger.',
      'Universitetssøknaden nærmer seg avgjørelse. NOKUT gjennomførte et institusjonsbesøk i april 2026 med 15 møter om utdanning, forskning, ph.d.-programmer, campus og internasjonalisering. Den sakkyndige anbefalingen ventes høsten 2026, og NOKUT-styrets vedtak innen utgangen av året.',
    ],
  },
  {
    id: 'uis',
    name: 'UiS',
    fullName: 'Universitetet i Stavanger',
    faculty: 'Handelshøgskolen ved UiS',
    color: '#4a1d6b',
    lightColor: '#f6f0fb',
    borderColor: '#d4b8e8',
    status: 'complete',
    reportTitle: 'NHS-ILT integrering · Studieportefølje 2025–2026 · Handlingsplan 2026',
    reportDate: 'Handelshøgskolen ved UiS – Fakultetsstyrepapirer',
    sourceUrl: 'https://opengov.360online.com/Meetings/usn/Boards/Details/341390',
    pdfs: [
      { url: uisNhsFlyttingPdfUrl,      label: 'NHS-ILT overføring til HH UiS – UiS-styresak 12.6.25',  filename: 'UiS_NHS_Flytting_styresak_2025.pdf' },
      { url: uisNhsStatusPdfUrl,        label: 'NHS-ILT overflytting – statusoppdatering',                filename: 'UiS_NHS_Statusoppdatering.pdf' },
      { url: uisNhsIntegrasjonPdfUrl,   label: 'Integrering av NHS – prosessbeskrivelse',                 filename: 'UiS_NHS_Integrering_prosess.pdf' },
      { url: uisAarsstudiumPdfUrl,      label: 'Nytt årsstudium i økonomi og jus',                        filename: 'UiS_Aarsstudium_okonomi_jus.pdf' },
      { url: uisStudieportef2025aPdfUrl, label: 'Studieporteføljerapport 2025',                           filename: 'UiS_Studieportef_2025.pdf' },
      { url: uisStudieportef2025bPdfUrl, label: 'Studieporteføljerapport 2025 (vedlegg 2)',               filename: 'UiS_Studieportef_2025_vedlegg2.pdf' },
      { url: uisActionPlan2026PdfUrl,   label: 'UiS Business School Action Plan 2026',                    filename: 'UiS_Business_School_Action_Plan_2026.pdf' },
      { url: uisStudieportef2026PdfUrl, label: 'Studieporteføljerapport HH-UiS 2026',                     filename: 'UiS_Studieportef_2026.pdf' },
    ],
    points: [
      'NHS - Institutt for ledelse og tjenesteutvikling overføres fra Det samfunnsvitenskapelige fakultet til Handelshøgskolen ved UiS fra 1. januar 2026. Instituttet integreres i Avdeling for innovasjon, ledelse og markedsføring.',
      'Sammenslåingen skal skape et sterkere fagmiljø innen økonomi, ledelse, innovasjon, service, hotell og reiseliv. Den skal også styrke Handelshøgskolens konkurransekraft overfor studenter, ansatte, samarbeidspartnere og forskningsfinansiører.',
      'Gevinstplanen anslår en årlig økonomisk effekt på 10–13 millioner kroner. En reduksjon på 12–15 overlappende emner kan frigjøre 6–9 vitenskapelige årsverk og 7–10 millioner kroner.',
      'Det planlegges også å redusere én til to administrative stillinger og ett instituttlederårsverk. Ingen skal bli overtallige som følge av sammenslåingen; reduksjonene skal skje gjennom naturlig avgang. Av 14 faste stillinger som ble ledige i 2025, var bare tre erstatningsprosesser igangsatt.',
      'Omtrent 3,5 millioner kroner av den forventede gevinsten foreslås overført til psykologisatsingen ved SV-fakultetet, mens 7–10,5 millioner beholdes ved Handelshøgskolen. Gevinstuttaket skal gjennomføres over minst tre år.',
      'Sammenslåingen har møtt betydelig motstand blant ansatte og studenter ved NHS-ILT, særlig knyttet til identitet, arbeidsmiljø og studietilbud. Det er derfor etablert et integreringsteam, felles møteplasser og arbeidsgrupper, og det arbeides med samlokalisering og NHS-representasjon i fakultetsstyret.',
      'Service-, hotell- og reiselivsprofilen skal videreføres og styrkes gjennom en dedikert faglig lederrolle og tettere samarbeid med næringen. Planen om en separat master i strategi og ledelse er stanset; tilbudet skal i stedet utvikles gjennom serviceledelsesmasteren med en mulig profil i Tourism and Hospitality.',
      'Studieporteføljen vurderes som robust og har sterke søkertall. I 2025 hadde bachelor i rettsvitenskap 6,6 førsteprioritetssøkere per plass, mens bachelor i økonomi og administrasjon hadde 3,2. Tiltak i matematikk har redusert strykprosenten fra 36 til 14 prosent og frafallet etter første semester til syv prosent.',
      'Fra studieåret 2026–2027 etableres et digitalt årsstudium i økonomi og jus på 60 studiepoeng. Studiet var opprinnelig planlagt og omtalt som «nettbasert årsstudium i bærekraftig økonomi og jus», før navnet ble endret. Det kan tas på hel- eller deltid og omfatter blant annet arbeidsrett, entreprenørskap, samfunnsøkonomi, økonomistyring, bærekraftsrapportering og forretningsjus.',
      'Handlingsplanen for 2026 prioriterer styrking av første studieår, ansvarlig bruk av KI, mer praksis og internasjonalisering, bedre ph.d.-oppfølging og økte forskningsmidler. Handelshøgskolen skal samtidig forberede og sende søknad om EQUIS eligibility gjennom EFMD, samt styrke rettsvitenskapsmiljøet for å sikre faglig robusthet og reakkreditering.',
    ],
  },
  {
    id: 'usn',
    name: 'USN',
    fullName: 'Universitetet i Sørøst-Norge',
    faculty: 'USN Handelshøyskolen',
    color: '#7c4a0a',
    lightColor: '#fdf5ee',
    borderColor: '#f0cfaa',
    status: 'complete',
    reportTitle: 'Årsrapport 2025 · Revidert budsjett 2026 · Strategiutkast USN 2035',
    reportDate: 'Fakultetsstyret for USN Handelshøyskolen',
    sourceUrl: 'https://opengov.360online.com/Meetings/usn/Boards/Details/341390',
    pdfs: [
      { url: usnAarsrapportPdfUrl, label: 'Årsrapport USN Handelshøyskolen 2025',       filename: 'USN_Aarsrapport_2025.pdf' },
      { url: usnRegnskapPdfUrl,    label: 'Tabeller regnskap 2025 (BFV og BOA)',         filename: 'USN_Regnskap_2025.pdf' },
      { url: usnResultatPdfUrl,    label: 'Resultatindikatorer 2025',                    filename: 'USN_Resultatindikatorer_2025.pdf' },
      { url: usnBudsjettPdfUrl,    label: 'Revidert budsjett 2026',                      filename: 'USN_Budsjett_2026.pdf' },
      { url: usnStrategiPdfUrl,    label: 'Strategiutkast USN 2035',                     filename: 'USN_Strategiutkast_2035.pdf' },
    ],
    points: [
      'USN Handelshøyskolen hadde rekordhøye 5 259 registrerte studenter høsten 2025, nærmere 300 flere enn i 2024. Flere studieprogrammer hadde fortsatt ventelister etter at antallet tilbud var økt.',
      'Studiepoengproduksjonen økte til 3 215 heltidsekvivalenter, hvorav 3 065 var egenfinansierte. Handelshøyskolen sto dermed for den største delen av USNs samlede produksjonsvekst.',
      'Andelen bachelorstudenter som fullførte på normert tid var 43,2 prosent, mens den var 38,9 prosent på femårige programmer og rundt 55 prosent på master. Gjennomføringen bedres, men vurderes fortsatt som for lav.',
      'Studentenes overordnede tilfredshet falt fra 3,97 til 3,8. Arbeidslivstilknytning er et særlig forbedringsområde, selv om nesten alle bachelor- og masterprogrammer tilbyr praksis, internship, studentbedrift eller arbeidslivsmentor.',
      'Fakultetet brukte 225,0 millioner kroner i bevilgningsfinansiert virksomhet, 3,0 millioner mer enn budsjettet. Nær seks millioner av den negative resultateffekten skyldtes for høye pensjonskostnader og en tapsavsetning, mens BOA-virksomheten bidro med 17,8 millioner til driften.',
      'Budsjettet for 2026 betegnes som svært stramt, selv med en nominell økning på 15 millioner kroner. Midlene skal blant annet styrke jus, IT og tilbudene i Hallingdal. Samtidig fortsetter stillingsreduksjonene: fakultetet har gått fra 249 årsverk i 2024 til 225 i 2026, mens studenttallet har økt.',
      'Forskningsaktiviteten viser sterkere søknadsarbeid: 48 forskningssøknader ble sendt i 2025, mot 27 året før, og fakultetet fikk åtte tilslag, hvorav seks fra Forskningsrådet. Handelshøyskolen deltar også i SFI-senteret CELECT, men inntektene fra NFR/RFF og EU per faglige årsverk falt i 2025.',
      'Ph.d.-programmet hadde 29 aktive kandidater og rekordhøye syv disputaser. Strategiutkastet USN 2035 prioriterer internasjonal forskningskvalitet, arbeidslivsrelevante utdanninger og samskaping, men åpner også for omstilling eller samlokalisering av campuser med lav aktivitet eller måloppnåelse.',
    ],
  },
  {
    id: 'inn',
    name: 'INN',
    fullName: 'Universitetet i Innlandet',
    faculty: 'Handelshøgskolen Innlandet',
    color: '#1a4a5f',
    lightColor: '#eef5f9',
    borderColor: '#b0cfe0',
    status: 'complete',
    reportTitle: 'Innkallinger universitetsstyret – desember 2025, mai og juni 2026',
    reportDate: 'Universitetsstyret ved Universitetet i Innlandet',
    sourceUrl: 'https://www.inn.no/om-universitetet/organisering/universitetsstyret/saksdokumenter-styret-inn/',
    pdfs: [
      { url: innDes2025PdfUrl, label: 'Innkalling universitetsstyret 16.12.2025', filename: 'INN_Universitetsstyret_16.12.2025.pdf' },
      { url: innMai2026PdfUrl, label: 'Innkalling universitetsstyret 04.05.2026', filename: 'INN_Universitetsstyret_04.05.2026.pdf' },
      { url: innJun2026PdfUrl, label: 'Innkalling universitetsstyret 24.06.2026', filename: 'INN_Universitetsstyret_24.06.2026.pdf' },
    ],
    points: [
      'Handelshøgskolen foreslås organisert i seks institutter. Økonomifagene deles mellom bedriftsøkonomi og økonomi/dataanalyse, mens ledelsesområdet deles mellom samfunnssikkerhet og organisasjon, ledelse og innovasjon. Ny struktur er foreslått fra 1. januar 2027.',
      'Den økonomiske situasjonen er krevende. HHS budsjetterte med et underskudd på 10,6 millioner kroner i 2026. Prognosen etter første tertial var 9,3 millioner bedre enn budsjettet, hovedsakelig på grunn av vakanser og lavere lønnskostnader.',
      'Bemanningen skal reduseres. Budsjettet la opp til at samlet bemanning skulle gå fra 230 årsverk i 2026 til rundt 214 i 2028. Samtidig skal andelen ansatte med førstekompetanse holdes rundt 79 prosent.',
      'Østlandsforskning avvikles som institutt. Ved utgangen av mai var tre ansatte innplassert i andre faste stillinger, én fast stilling under avklaring og to tilbudt midlertidige stillinger. Sluttavtaler og eventuelle oppsigelser inngår i den videre prosessen.',
      'Søkertallene økte moderat i 2026. HHS hadde 4 581 førstevalgssøkere i Samordna opptak, opp 1,2 prosent, og 2 930 søkere i lokalt opptak, opp 8,1 prosent. Totalt fikk fakultetet 274 flere søkere enn året før.',
      'Nettstudiene er særlig attraktive. Nettbasert bachelor i økonomi og administrasjon hadde 10,95 søkere per plass, mens nettbasert regnskap og økonomirådgivning hadde 8,8. Den engelskspråklige mastervarianten i Business Analytics fikk 365 søkere, 291 flere enn året før.',
      'Masterporteføljen skal styrkes. Målet er å øke masterandelen fra 13 til 20 prosent. Master i rettsvitenskap avventer NOKUT og kan tidligst starte i 2027, mens profesjonsstudiet i psykologi og master i regnskap og revisjon tidligst er aktuelle i 2028–2029.',
      'Ph.d.-programmet og studieporteføljen revideres. INTOP skal søkes reakkreditert som en bredere, tverrfaglig ph.d. i samfunnsvitenskap. Samtidig vurderes avvikling av sju pausede studier innen blant annet reiseliv, eiendomsmegling, Music Business og bærekraftsøkonomi.',
    ],
  },
  {
    id: 'hio',
    name: 'HiØ',
    fullName: 'Høgskolen i Østfold',
    faculty: 'Institutt for økonomi, innovasjon og samfunn (ØIS) · Fakultet IIØ',
    color: '#8b1a1a',
    lightColor: '#fdf3f3',
    borderColor: '#e8c0c0',
    status: 'complete',
    reportTitle: 'Tertialrapport T3 2025 · Handlingsplan IIØ mot 2030',
    reportDate: 'Fakultet for informasjonsteknologi, ingeniørfag og økonomi',
    sourceUrl: 'https://opengov.360online.com/Meetings/hiof/Boards/Details/261077',
    pdfs: [
      { url: hiofT3PdfUrl,          label: 'Tertialrapport T3 2025',       filename: 'HiOF_Tertialrapport_T3_2025.pdf' },
      { url: hiofHandlingsplanPdfUrl, label: 'Handlingsplan IIØ mot 2030', filename: 'HiOF_Handlingsplan_mot_2030.pdf' },
    ],
    points: [
      'Fakultet IIØ avsluttet tredje tertial 2025 med et mindreforbruk på 5,2 millioner kroner, mot budsjetterte 3,1 millioner. Lønnskostnadene var 2,2 millioner lavere enn budsjett, og driftskostnadene 1,7 millioner lavere.',
      'Ved Institutt for økonomi, innovasjon og samfunn (ØIS) var lønnskostnadene 18,0 millioner kroner, 0,7 millioner over budsjett. Merforbruket skyldtes hovedsakelig overtid, sensorer og eksamensvakter.',
      'ØIS reduserte driftskostnadene med 0,3 millioner kroner, særlig gjennom lavere utgifter til konsulenttjenester, reiser og møter. Instituttet hadde prosjektinntekter på 0,3 millioner og endte med et samlet mindreforbruk på 1,0 million kroner, mot budsjetterte 1,7 millioner.',
      'Fra januar 2026 organiseres ØIS i tre fagmiljøer: bedriftsøkonomiske, samfunnsøkonomiske og administrative fag. Etter en seks måneders etableringsfase skal organiseringen evalueres.',
      'ØIS skal undersøke kompetansebehovene blant virksomheter i Østfold og gjennomføre en behovsanalyse for en mulig tverrfaglig mastergrad i Digital Business og teknologiledelse. Deltidsstudiet i økonomi og administrasjon skal tilpasses bedre til studenter som er i arbeid.',
      'Arbeidslivsrelevansen skal styrkes gjennom kartlegging av samarbeid, gjesteforelesninger, bedriftsoppgaver, praksis og andre arbeidslivsinnslag. Målet er minst ett planlagt arbeidslivsinnslag i hvert emne i studieåret 2026–2027.',
      'ØIS vil forbedre studentmiljøet med en ny og mer sosial oppstartsuke, støtte til en linjeforening og vurdering av «ØIS Idrett». Tiltakene skal blant annet motvirke anonymitet blant studentene.',
      'Instituttet skal analysere 5–7 emner med lav gjennomstrømming og vurdere tiltak som forkurs i matematikk, eksamenstrening og emneteam. ØIS etablerer også et opplæringsløp i søknadsskriving og finansieringsordninger for å øke den eksternfinansierte forskningen.',
    ],
  },
];

function InstitutionCard({ report }: { report: InstitutionReport }) {
  const [expanded, setExpanded] = useState(report.status === 'complete');

  if (report.status === 'pending') {
    return (
      <div
        className="rounded-xl p-5"
        style={{ border: `1.5px dashed ${report.borderColor}`, backgroundColor: report.lightColor }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: report.color + '18' }}
          >
            <Building2 className="w-5 h-5" style={{ color: report.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontWeight: 700, fontSize: 16, color: report.color }}>{report.name}</span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' }}>
                <Clock className="w-3 h-3" /> Under utarbeidelse
              </span>
            </div>
            <div style={{ fontSize: 12, color: report.color + 'aa', marginTop: 2 }}>{report.fullName}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>
              {report.faculty} · Rapport legges til når tilgjengelig
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1.5px solid ${report.borderColor}`, backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      {/* Card header */}
      <div className="px-5 py-4" style={{ backgroundColor: report.lightColor, borderBottom: `1px solid ${report.borderColor}` }}>
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: report.color }}
          >
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span style={{ fontWeight: 700, fontSize: 18, color: report.color }}>{report.name}</span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: report.color + '18', color: report.color, fontWeight: 600 }}>
                <CheckCircle2 className="w-3 h-3" /> Rapport tilgjengelig
              </span>
            </div>
            <div style={{ fontSize: 12, color: report.color + 'bb' }}>{report.fullName}</div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>{report.faculty}</div>
          </div>
        </div>

        {report.reportTitle && (
          <div className="mt-3 px-3 py-2 rounded-lg flex items-start justify-between gap-3" style={{ backgroundColor: report.color + '10', border: `1px solid ${report.borderColor}` }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: report.color }}>{report.reportTitle}</div>
              {report.reportDate && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{report.reportDate}</div>}
            </div>
            {report.sourceUrl && (
              <a
                href={report.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs shrink-0 hover:underline"
                style={{ color: report.color, fontWeight: 500 }}
              >
                Møteportal ↗
              </a>
            )}
          </div>
        )}
      </div>

      {/* Bullet points */}
      {report.points && (
        <div className="px-5 py-4">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 w-full text-left mb-3"
            style={{ color: report.color }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Nøkkelpunkter fra rapporten
            </span>
            <span className="ml-auto">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {expanded ? (
            <ol className="space-y-2.5">
              {report.points.map((point, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white"
                    style={{ backgroundColor: report.color, fontSize: 10, fontWeight: 700, minWidth: 20 }}
                  >
                    {i + 1}
                  </span>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{point}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p style={{ fontSize: 12, color: '#9CA3AF' }}>
              {report.points.length} punkter — klikk for å vise
            </p>
          )}
        </div>
      )}

      {/* PDF downloads */}
      {report.pdfs && report.pdfs.length > 0 && (
        <div style={{ borderTop: `1px solid ${report.borderColor}`, backgroundColor: report.lightColor }}>
          {report.pdfs.map((pdf, i) => (
            <div
              key={i}
              className="px-5 py-2.5 flex items-center gap-3"
              style={{ borderTop: i > 0 ? `1px solid ${report.borderColor}` : undefined }}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: report.color, opacity: 0.7 }} />
              <span style={{ fontSize: 12, color: '#6B7280', flex: 1 }}>{pdf.label}</span>
              <a
                href={pdf.url}
                download={pdf.filename}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all"
                style={{ backgroundColor: report.color, color: '#fff', fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.82'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
              >
                <Download className="w-3 h-3" />
                Last ned
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MarkedsstatusView() {
  const complete = REPORTS.filter((r) => r.status === 'complete');
  const pending = REPORTS.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(2,92,79,0.08)' }}>
        <h2 className="text-2xl mb-1" style={{ color: 'var(--nmbu-green-dark)', fontFamily: "'Lora', serif" }}>
          Markedsstatus
        </h2>
        <p className="text-sm max-w-2xl" style={{ color: 'var(--nmbu-neutral-1)' }}>
          Status og utvikling hos konkurrerende institusjoner, basert på fakultetsstyrepapirer og årsrapporter.
          Gir grunnlag for å vurdere NMBUs posisjon i markedet for økonomi- og administrasjonsutdanning.
        </p>
        <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--nmbu-green-dark)' }} />
            {complete.length} rapport{complete.length !== 1 ? 'er' : ''} tilgjengelig
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
            {pending.length} under utarbeidelse
          </span>
        </div>
      </div>

      {/* Complete reports */}
      {complete.length > 0 && (
        <div className="space-y-4">
          {complete.map((r) => <InstitutionCard key={r.id} report={r} />)}
        </div>
      )}

      {/* Pending institutions */}
      {pending.length > 0 && (
        <div>
          <div className="text-xs mb-3 flex items-center gap-2" style={{ color: 'var(--nmbu-neutral-2)', fontWeight: 600 }}>
            <Clock className="w-3.5 h-3.5" />
            Planlagte institusjoner
          </div>
          <div className="grid grid-cols-2 gap-3">
            {pending.map((r) => <InstitutionCard key={r.id} report={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}
