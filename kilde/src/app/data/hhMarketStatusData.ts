// GENERERT av scripts/build-markedsstatus.py 24.09.2026 – ikke rediger for hånd.
// Kilde: data/hh/markedsstatus.json · PDF-er i kilde/public/markedsstatus/hh/

export interface MarketDoc {
  label: string;
  url: string;
  localPath: string | null;
  dato: string | null;
  storrelseMB: number | null;
}

export interface MarketInstitution {
  id: string;
  name: string;
  fullName: string;
  enhet: string | null;
  styresider: string[];
  status: 'complete' | 'partial' | 'none';
  dokumenter: MarketDoc[];
  punkter: string[];
  oppsummering: string | null;
  relevanteProgram: string[];
}

export const MARKET_STATUS_HENTET: string | null = "24.09.2026";

export const MARKET_STATUS: MarketInstitution[] = [
  {
    "id": "nhh",
    "name": "NHH",
    "fullName": "Norges Handelshøyskole",
    "enhet": null,
    "styresider": [
      "https://www.nhh.no/om-nhh/organisasjon/ledelse/styret/saksdokument-og-moteprotokollar-fra-styret/"
    ],
    "status": "complete",
    "dokumenter": [
      {
        "label": "Protokoll NHH-styret 05.02.2026",
        "url": "https://www.nhh.no/globalassets/om-nhh/organisasjon/styret-ved-nhh/saksdokument/moteprotokollar/2026/offentlig-protokoll-styret-ved-norges-handelshoyskole-05.02.2026.pdf",
        "localPath": "/markedsstatus/hh/NHH_Protokoll_05.02.2026.pdf",
        "dato": "05.02.2026",
        "storrelseMB": 0.33
      },
      {
        "label": "Protokoll NHH-styret 05.03.2026",
        "url": "https://www.nhh.no/globalassets/om-nhh/organisasjon/styret-ved-nhh/saksdokument/moteprotokollar/2026/protokoll-styret-ved-norges-handelshoyskole-05.03.2026.pdf",
        "localPath": "/markedsstatus/hh/NHH_Protokoll_05.03.2026.pdf",
        "dato": "05.03.2026",
        "storrelseMB": 0.25
      },
      {
        "label": "Protokoll NHH-styret 05.03.2026 (vedlegg 2)",
        "url": "https://www.nhh.no/globalassets/om-nhh/organisasjon/styret-ved-nhh/saksdokument/moteprotokollar/2026/protokoll-styret-ved-norges-handelshoyskole-05.03.2026.pdf",
        "localPath": "/markedsstatus/hh/NHH_Protokoll_05.03.2026_vedlegg2.pdf",
        "dato": "05.03.2026",
        "storrelseMB": 0.25
      },
      {
        "label": "Protokoll NHH-styret 23.04.2026",
        "url": "https://www.nhh.no/globalassets/om-nhh/organisasjon/styret-ved-nhh/saksdokument/moteprotokollar/2026/protokoll-styret-ved-norges-handelshoyskole-23.04.2026.pdf",
        "localPath": "/markedsstatus/hh/NHH_Protokoll_23.04.2026.pdf",
        "dato": "23.04.2026",
        "storrelseMB": 0.24
      }
    ],
    "punkter": [
      "NHH-styret vedtok en ny strategi for 2026–2029 som følges opp med årlige handlingsplaner; kunstig intelligens, innovasjon, bærekraft og tettere samspill med samfunns- og næringsliv står sentralt (Protokoll NHH-styret 05.02.2026).",
      "NHH vil søke universitetsstatus. Et veiledningsmøte med NOKUT er gjennomført, og søknaden planlegges sendt mot slutten av 2026 eller begynnelsen av 2027, når NOKUTs periodiske tilsyn med kvalitetssystemet er unnagjort (Protokoll 05.03.2026).",
      "Økonomien er fortsatt krevende: resultatet for 2025 var negativt med 34,4 mill. kr. Reservene bygges planmessig ned og ventes å være litt over 100 mill. kr ved utgangen av 2026 (Protokoll 05.03.2026).",
      "NHH er EQUIS-reakkreditert for fem nye år, med særlig positive tilbakemeldinger om kvalitetsforbedring og næringslivskontakt. Master i regnskap og revisjon er også reakkreditert (Protokoll 23.04.2026).",
      "Søkertallene holder seg svært sterke: bachelor i økonomi og administrasjon hadde nær 1 950 førstevalgssøkere i 2026, seks prosent flere enn i 2025, og var Norges tredje mest populære studium. Economics and Data Science hadde 557 førstevalgssøkere (Protokoll 23.04.2026).",
      "Mastertilbudet fornyes: master i økonomi og administrasjon får ny struktur fra august 2027, og en ny Master in Business and Data Science planlegges med samme oppstartstidspunkt (Protokoll 23.04.2026)."
    ],
    "oppsummering": "NHHs styreprotokoller for 2026 er offentlig tilgjengelige på nhh.no og gir et samlet bilde: sterk søkning og nye akkrediteringer, samtidig som instituttet har et økonomisk underskudd i 2025 og arbeider mot en søknad om universitetsstatus.",
    "relevanteProgram": [
      "nhh_oa",
      "nhh_moa"
    ]
  },
  {
    "id": "ntnu",
    "name": "NTNU",
    "fullName": "Norges teknisk-naturvitenskapelige universitet",
    "enhet": "Fakultet for økonomi",
    "styresider": [
      "https://www.ntnu.no/ok",
      "https://i.ntnu.no/wiki/-/wiki/Norsk/Fakultetsstyret+ved+%C3%98K"
    ],
    "status": "partial",
    "dokumenter": [
      {
        "label": "Nøkkeltall for Fakultet for økonomi",
        "url": "https://www.ntnu.no/ok/oversikt",
        "localPath": null,
        "dato": "2025",
        "storrelseMB": null
      },
      {
        "label": "Strategi 2026–2035 – Fakultet for økonomi",
        "url": "https://www.ntnu.no/ok/strategi",
        "localPath": null,
        "dato": "2026",
        "storrelseMB": null
      }
    ],
    "punkter": [
      "Fakultetsstyret ved Fakultet for økonomi (ØK) sine sakspapirer publiseres på et internt SharePoint-oppslag (studntnu.sharepoint.com) som krever NTNU-pålogging. Vi fant derfor ingen offentlig tilgjengelige styresaker for fakultetet i denne perioden, i tråd med det tilsvarende funnet for NTNU AD i landsam-analysen 22.09.2026.",
      "Fakultetet har vedtatt en ny strategi for 2026–2035 med visjonen «Fremragende i koblingen mellom økonomi, ledelse og teknologi». Fakultetet er organisert i fire institutt, en enhet og en fagseksjon, fordelt på Trondheim, Ålesund og Gjøvik (ntnu.no/ok/strategi).",
      "Fakultetet hadde per 2025 om lag 4 300 studenter og 340 ansatte, hvorav 274 vitenskapelig ansatte (ntnu.no/ok/oversikt, nøkkeltall).",
      "Bachelor i økonomi og administrasjon i Trondheim er fakultetets største studieprogram: 562 registrerte søkere/1 059 registrerte studenter og 152 studieplasser i 2024-tallene, med 205 studieplasser i 2025 (ntnu.no/ok/oversikt, nøkkeltall 2024–2025). Tallene er hentet fra fakultetets egen oversiktsside, ikke fra styresaker, og bør leses med forbehold om ulik telling mellom år."
    ],
    "oppsummering": "Status er satt til «partial» fordi fakultetsstyrets sakspapirer for Fakultet for økonomi ligger bak NTNU-pålogging på SharePoint, samme mønster som for NTNU AD i landsam-analysen. Punktene bygger i stedet på fakultetets egne offentlige sider for nøkkeltall og strategi, som ikke gir budsjett- eller søkertallsdetaljer på styresaksnivå.",
    "relevanteProgram": [
      "ntnu_oa",
      "ntnu_alesund_oa",
      "ntnu_gjovik_oa",
      "ntnu_dfu",
      "ntnu_samf",
      "ntnu_moa",
      "ntnu_mecon",
      "ntnu_mei",
      "ntnu_ment",
      "ntnu_siv"
    ]
  },
  {
    "id": "usn",
    "name": "USN",
    "fullName": "Universitetet i Sørøst-Norge",
    "enhet": "USN Handelshøyskolen",
    "styresider": [
      "https://opengov.360online.com/Meetings/usn/Boards/Details/341390"
    ],
    "status": "complete",
    "dokumenter": [
      {
        "label": "Årsrapport USN Handelshøyskolen 2025",
        "url": "https://opengov.360online.com/Meetings/usn/Boards/Details/341390",
        "localPath": "/markedsstatus/hh/USN_HH_Aarsrapport_2025.pdf",
        "dato": "2025",
        "storrelseMB": 0.88
      },
      {
        "label": "Tabeller regnskap 2025 (BFV og BOA)",
        "url": "https://opengov.360online.com/Meetings/usn/Boards/Details/341390",
        "localPath": "/markedsstatus/hh/USN_HH_Regnskapstabeller_2025.pdf",
        "dato": "2025",
        "storrelseMB": 0.2
      },
      {
        "label": "Resultatindikatorer 2025",
        "url": "https://opengov.360online.com/Meetings/usn/Boards/Details/341390",
        "localPath": "/markedsstatus/hh/USN_HH_Resultatindikatorer_2025.pdf",
        "dato": "2025",
        "storrelseMB": 2.41
      },
      {
        "label": "Revidert budsjett 2026",
        "url": "https://opengov.360online.com/Meetings/usn/Boards/Details/341390",
        "localPath": "/markedsstatus/hh/USN_HH_Revidert_budsjett_2026.pdf",
        "dato": "2026",
        "storrelseMB": 0.11
      },
      {
        "label": "Strategiutkast USN 2035",
        "url": "https://opengov.360online.com/Meetings/usn/Boards/Details/341390",
        "localPath": "/markedsstatus/hh/USN_HH_Strategiutkast_2035.pdf",
        "dato": "2026",
        "storrelseMB": 0.05
      }
    ],
    "punkter": [
      "USN Handelshøyskolen hadde rekordhøye 5 259 registrerte studenter høsten 2025, nær 300 flere enn i 2024. Flere studieprogram hadde fortsatt ventelister etter at antallet tilbud var økt (Årsrapport 2025).",
      "Studiepoengproduksjonen økte til 3 215 heltidsekvivalenter, hvorav 3 065 var egenfinansierte. Handelshøyskolen sto for den største delen av USNs samlede produksjonsvekst (Årsrapport 2025).",
      "Budsjettet for 2026 er svært stramt tross en nominell økning på 15 mill. kr. Stillingene er redusert fra 249 årsverk i 2024 til 225 i 2026, samtidig som studenttallet har økt (Revidert budsjett 2026).",
      "Fakultetet brukte 225,0 mill. kr i bevilgningsfinansiert virksomhet i 2025, 3,0 mill. kr mer enn budsjettert, hovedsakelig pga. pensjonskostnader og en tapsavsetning. BOA-virksomheten bidro med 17,8 mill. kr til driften (Resultatindikatorer 2025 / Tabeller regnskap 2025).",
      "Strategiutkast USN 2035 prioriterer internasjonal forskningskvalitet og arbeidslivsrelevante utdanninger, men åpner samtidig for omstilling eller samlokalisering av campuser med lav aktivitet eller måloppnåelse (Strategiutkast USN 2035)."
    ],
    "oppsummering": "USN Handelshøyskolens styrepapirer for 2025–2026 er offentlig tilgjengelige via opengov-portalen og viser rekordhøyt studenttall og produksjon, men et stramt budsjett og fortsatt bemanningsreduksjon.",
    "relevanteProgram": [
      "usn_oa",
      "usn_honefoss_oa",
      "usn_bo_oa",
      "usn_kongsberg_oa",
      "usn_itled",
      "usn_itis",
      "usn_moa",
      "usn_siv"
    ]
  },
  {
    "id": "nord",
    "name": "Nord",
    "fullName": "Nord universitet",
    "enhet": "Handelshøgskolen (HHN)",
    "styresider": [
      "https://www.nord.no/arrangementer/styremote/styremote-4"
    ],
    "status": "complete",
    "dokumenter": [
      {
        "label": "Komplett innkalling, Styret for Nord universitet 05.03.2026 (årsrapport, årsregnskap, utdanningskvalitet mv.)",
        "url": "https://www.nord.no/sites/default/files/2026-02/Komplett-innkalling-Styret-for-Nord-universitet-05-03-2026.pdf",
        "localPath": "/markedsstatus/hh/Nord_Universitetsstyret_Arsrapport_2025_moteinnkalling_05.03.2026.pdf",
        "dato": "05.03.2026",
        "storrelseMB": 4.8
      }
    ],
    "punkter": [
      "Styret vedtok budsjett 2026 med en total ramme for bevilgningsfinansiert virksomhet på 1 876,7 mill. kr; Handelshøgskolen (HHN) ble tildelt 210,3 mill. kr av denne rammen (Komplett innkalling 05.03.2026, sak om budsjett 2026, s. 8/229).",
      "HHN etablerte i 2025 et nettbasert bachelorstudium i økonomi og teknologiledelse, med stor interesse og 279 førsteprioritetssøkere. Fra høsten 2026 tilbys studiet også samlingsbasert ved studiested Mo i Rana (Årsrapport Nord universitet 2025, s. 57/229).",
      "HHN fikk godkjent flere nye studietilbud i periodisk evaluering i 2025: Master i regnskap, revisjon og bærekraft (godkjent 26.06.2025), Årsstudium i økonomi og digitalisering og Bachelor i økonomi, digitalisering og forretningsutvikling (begge godkjent 14.10.2025) (Rapport om utdanningskvalitet 2025, s. 204/229).",
      "HHNs driftsinntekter var 267,9 mill. kr i 2025 mot driftskostnader på 241,2 mill. kr, et resultat på 26,7 mill. kr. Resultatet fra bevilgningsfinansiert virksomhet var 9,9 mill. kr, drevet av lavere lønns- og pensjonskostnader enn budsjettert og bevisst tilbakeholdenhet med nyrekruttering i påvente av forventede inntektskutt (Årsregnskap 2025 for fakultet og avdelinger, s. 114–116/229).",
      "Kvalifiserte førstevalgssøkere per planlagte studieplass ved HHN økte fra 1,4 i 2024 til 1,6 i 2025, blant annet drevet av det nye nettbaserte bachelorprogrammet, men ligger fortsatt under sektorsnittet på 1,9 (Rapport om utdanningskvalitet 2025, s. 192–193/229).",
      "I Studiebarometeret 2025 hadde HHN en stabil, høy overordnet tilfredshet på 4,0 – samme nivå fjerde år på rad – men lavest svarprosent av Nords fem fakulteter med 26 prosent, mot et institusjonssnitt på 44 prosent (Orientering om Studiebarometeret 2025, s. 178–182/229)."
    ],
    "oppsummering": "Nord universitets styrepapirer (samlet møteinnkalling til styremøtet 05.03.2026, 229 sider) er offentlig tilgjengelige og gir et solid, tallrikt bilde av Handelshøgskolen (HHN): økt budsjett og nye studietilbud, men fortsatt lav svarprosent i studentundersøkelser og søkertall under sektorsnittet.",
    "relevanteProgram": [
      "nord_oa",
      "nord_steinkjer_oa",
      "nord_edf",
      "nord_moa",
      "nord_mei"
    ]
  },
  {
    "id": "oslomet",
    "name": "OsloMet",
    "fullName": "OsloMet – storbyuniversitetet",
    "enhet": "Fakultet for samfunnsvitenskap / Handelshøyskolen",
    "styresider": [],
    "status": "complete",
    "dokumenter": [
      {
        "label": "Regnskapsrapport 2025 – Fakultet for samfunnsvitenskap",
        "url": "",
        "localPath": "/markedsstatus/hh/OsloMet_Regnskapsrapport_Fakultet_samfunnsvitenskap_2025.pdf",
        "dato": "2026",
        "storrelseMB": 0.11
      }
    ],
    "punkter": [
      "Fakultetet avsluttet ordinær virksomhet i 2025 med et overskudd på 12,1 mill. kr, mot et budsjettert underskudd på 5,8 mill. kr – et resultat 17,9 mill. kr bedre enn budsjettert (Regnskapsrapport 2025).",
      "Handelshøyskolen fikk et resultat på 4,35 mill. kr, 2,80 mill. kr bedre enn budsjettert. Instituttet fikk flere studenter per faglige årsverk enn ønsket, fordi nyansettelser ble forsinket etter at opptaket ble økt med 100 studenter årlig – nå gjennomført for tre kull (Regnskapsrapport 2025).",
      "Fakultetet planlegger oppstart av bachelor i rettsvitenskap høsten 2027, eventuelt fulgt av et masterstudium (Regnskapsrapport 2025).",
      "Bidrags- og oppdragsvirksomheten hadde inntekter på 48,9 mill. kr, 4,7 mill. kr over budsjett, men et resultat på bare 70 387 kr fordi kostnadene også var høyere enn planlagt (Regnskapsrapport 2025)."
    ],
    "oppsummering": "Tallene gjelder Fakultet for samfunnsvitenskap som helhet, der Handelshøyskolen er en del av fakultetet. Regnskapsrapporten for 2025 er offentlig tilgjengelig og viser et fakultet med bedre resultat enn budsjettert, og en Handelshøyskole i vekst som fortsatt bygger opp bemanningen etter et økt opptak.",
    "relevanteProgram": [
      "oslomet_oa",
      "oslomet_siv",
      "oslomet_moa",
      "oslomet_mei"
    ]
  },
  {
    "id": "uia",
    "name": "UiA",
    "fullName": "Universitetet i Agder",
    "enhet": "Handelshøyskolen ved UiA",
    "styresider": [
      "https://opengov.360online.com/Meetings/uia"
    ],
    "status": "complete",
    "dokumenter": [
      {
        "label": "Forslag til budsjett 2026",
        "url": "https://opengov.360online.com/Meetings/uia",
        "localPath": "/markedsstatus/hh/UiA_HH_Forslag_budsjett_2026.pdf",
        "dato": "2026",
        "storrelseMB": 0.21
      },
      {
        "label": "Komplett innkalling, Fakultetsstyret for Handelshøyskolen 30.01.2026",
        "url": "https://opengov.360online.com/Meetings/uia",
        "localPath": "/markedsstatus/hh/UiA_HH_Komplett_innkalling_30.01.2026.pdf",
        "dato": "30.01.2026",
        "storrelseMB": 1.81
      },
      {
        "label": "Kvalitetsrapport 2025",
        "url": "https://opengov.360online.com/Meetings/uia",
        "localPath": "/markedsstatus/hh/UiA_HH_Kvalitetsrapport_2025.pdf",
        "dato": "2025",
        "storrelseMB": 0.79
      }
    ],
    "punkter": [
      "Handelshøyskolen er tildelt 130,1 mill. kr for 2026, en økning på 9,9 mill. kr. Det planlegges et mindreforbruk på ca. 4 mill. kr, hovedsakelig som følge av midlertidig lavere bemanning (Forslag til budsjett 2026).",
      "Handelshøyskolen hadde 2 170 registrerte studenter høsten 2025, over 100 flere enn året før, med særlig sterk vekst på masternivå (+101 studenter). Antall avlagte studiepoeng økte med 8,2 prosent (Innkalling fakultetsstyret 30.01.2026).",
      "Søkertallene er gjennomgående sterke: alle bachelorprogrammene var blant UiAs fire største målt i førstevalgssøkere, og rettsvitenskap hadde flest søkere per studieplass (Kvalitetsrapport 2025).",
      "Studieporteføljen videreutvikles: Management and Business Development startet i 2025, mens International Business ikke lenger tar opp nye studenter. En ny erfaringsbasert master i ledelse og HR starter høsten 2026 (Innkalling fakultetsstyret 30.01.2026).",
      "Handelshøyskolen har vært AACSB-akkreditert siden 2019 og undersøker nå muligheten for EQUIS-akkreditering (vedtatt mars 2025); 997 500 kr er satt av til AACSB- og EQUIS-arbeidet i 2026, med mål om dobbeltakkreditering (Innkalling fakultetsstyret 30.01.2026)."
    ],
    "oppsummering": "Handelshøyskolen ved UiAs styrepapirer er offentlig tilgjengelige via opengov-portalen og viser en handelshøyskole i vekst, med økt budsjett, sterke søkertall og en pågående prosess mot dobbeltakkreditering (AACSB og EQUIS).",
    "relevanteProgram": [
      "uia_oa",
      "uia_siv",
      "uia_itis",
      "uia_moa",
      "uia_mei"
    ]
  },
  {
    "id": "uis",
    "name": "UiS",
    "fullName": "Universitetet i Stavanger",
    "enhet": "Handelshøgskolen ved UiS",
    "styresider": [
      "https://opengov.360online.com/Meetings/uis/Boards/Details/599539",
      "https://opengov.360online.com/Meetings/uis/Boards/Details/580870"
    ],
    "status": "complete",
    "dokumenter": [
      {
        "label": "NHS-ILT overføring til HH UiS – UiS-styresak 12.6.25",
        "url": "https://opengov.360online.com/Meetings/uis/Meetings/Details/928823?agendaItemId=517607",
        "localPath": "/markedsstatus/hh/UiS_NHS_Flytting_styresak_12.06.2025.pdf",
        "dato": "12.06.2025",
        "storrelseMB": 0.15
      },
      {
        "label": "NHS-ILT overflytting – statusoppdatering",
        "url": "https://opengov.360online.com/Meetings/uis/Meetings/Details/958123?agendaItemId=518325",
        "localPath": "/markedsstatus/hh/UiS_NHS_Statusoppdatering.pdf",
        "dato": "2025",
        "storrelseMB": 0.14
      },
      {
        "label": "Integrering av NHS – prosessbeskrivelse",
        "url": "https://opengov.360online.com/Meetings/uis/Meetings/Details/1000123?agendaItemId=518477",
        "localPath": "/markedsstatus/hh/UiS_NHS_Integrering_prosessbeskrivelse.pdf",
        "dato": "2025",
        "storrelseMB": 0.03
      },
      {
        "label": "Nytt årsstudium i økonomi og jus",
        "url": "https://opengov.360online.com/Meetings/uis/Meetings/Details/1000123?agendaItemId=518478",
        "localPath": "/markedsstatus/hh/UiS_Aarsstudium_okonomi_jus.pdf",
        "dato": "2026",
        "storrelseMB": 0.11
      },
      {
        "label": "Studieporteføljerapport 2025",
        "url": "https://opengov.360online.com/Meetings/uis/Meetings/Details/953018?agendaItemId=517417",
        "localPath": "/markedsstatus/hh/UiS_Studieportefolje_2025.pdf",
        "dato": "2025",
        "storrelseMB": 0.32
      },
      {
        "label": "Studieporteføljerapport 2025 (vedlegg 2)",
        "url": "https://opengov.360online.com/Meetings/uis/Meetings/Details/1000123?agendaItemId=518478",
        "localPath": "/markedsstatus/hh/UiS_Studieportefolje_2025_vedlegg2.pdf",
        "dato": "2025",
        "storrelseMB": 0.32
      },
      {
        "label": "UiS Business School Action Plan 2026",
        "url": "https://opengov.360online.com/Meetings/uis/Meetings/Details/1000123?agendaItemId=518479",
        "localPath": "/markedsstatus/hh/UiS_Business_School_Action_Plan_2026.pdf",
        "dato": "2026",
        "storrelseMB": 0.16
      },
      {
        "label": "Studieporteføljerapport HH-UiS 2026",
        "url": "https://opengov.360online.com/Meetings/uis/Meetings/Details/1046926?agendaItemId=520150",
        "localPath": "/markedsstatus/hh/UiS_Studieportefolje_2026.pdf",
        "dato": "2026",
        "storrelseMB": 0.3
      }
    ],
    "punkter": [
      "NHS – Institutt for ledelse og tjenesteutvikling overføres fra Det samfunnsvitenskapelige fakultet til Handelshøgskolen ved UiS fra 1. januar 2026, og integreres i Avdeling for innovasjon, ledelse og markedsføring (UiS-styresak 12.6.25).",
      "Gevinstplanen for sammenslåingen anslår en årlig økonomisk effekt på 10–13 mill. kr; en reduksjon på 12–15 overlappende emner kan frigjøre 6–9 vitenskapelige årsverk og 7–10 mill. kr. Ingen skal bli overtallige – reduksjonene skal skje gjennom naturlig avgang (Integrering av NHS – prosessbeskrivelse).",
      "Studieporteføljen vurderes som robust med sterke søkertall: i 2025 hadde bachelor i rettsvitenskap 6,6 førsteprioritetssøkere per plass, mens bachelor i økonomi og administrasjon hadde 3,2 (Studieporteføljerapport 2025).",
      "Fra studieåret 2026–2027 etableres et nytt digitalt årsstudium i økonomi og jus på 60 studiepoeng, som kan tas på hel- eller deltid (Nytt årsstudium i økonomi og jus).",
      "Handlingsplanen for 2026 prioriterer styrking av første studieår, ansvarlig bruk av KI, mer praksis og internasjonalisering. Handelshøgskolen skal samtidig forberede og sende søknad om EQUIS eligibility gjennom EFMD (UiS Business School Action Plan 2026)."
    ],
    "oppsummering": "Handelshøgskolen ved UiS' styrepapirer er offentlig tilgjengelige via opengov-portalen og dokumenterer en pågående, ressurskrevende sammenslåing med NHS-ILT, samtidig som skolen har sterke søkertall og forbereder en EQUIS-søknad.",
    "relevanteProgram": [
      "uis_oa",
      "uis_moa",
      "uis_digserv"
    ]
  },
  {
    "id": "inn",
    "name": "INN",
    "fullName": "Universitetet i Innlandet",
    "enhet": "Handelshøgskolen Innlandet",
    "styresider": [
      "https://www.inn.no/om-universitetet/organisering/universitetsstyret/saksdokumenter-styret-inn/"
    ],
    "status": "complete",
    "dokumenter": [
      {
        "label": "Innkalling universitetsstyret 16.12.2025",
        "url": "https://www.inn.no/om-universitetet/organisering/universitetsstyret/saksdokumenter-styret-inn/",
        "localPath": "/markedsstatus/hh/INN_Universitetsstyret_16.12.2025.pdf",
        "dato": "16.12.2025",
        "storrelseMB": 9.85
      },
      {
        "label": "Innkalling universitetsstyret 04.05.2026",
        "url": "https://www.inn.no/om-universitetet/organisering/universitetsstyret/saksdokumenter-styret-inn/",
        "localPath": "/markedsstatus/hh/INN_Universitetsstyret_04.05.2026.pdf",
        "dato": "04.05.2026",
        "storrelseMB": 4.54
      },
      {
        "label": "Innkalling universitetsstyret 24.06.2026",
        "url": "https://www.inn.no/om-universitetet/organisering/universitetsstyret/saksdokumenter-styret-inn/",
        "localPath": "/markedsstatus/hh/INN_Universitetsstyret_24.06.2026.pdf",
        "dato": "24.06.2026",
        "storrelseMB": 0.08
      }
    ],
    "punkter": [
      "Handelshøgskolen foreslås organisert i seks institutter fra 1. januar 2027. Økonomifagene deles mellom bedriftsøkonomi og økonomi/dataanalyse, mens ledelsesområdet deles mellom samfunnssikkerhet og organisasjon, ledelse og innovasjon (Innkalling universitetsstyret 16.12.2025).",
      "Den økonomiske situasjonen er krevende: HHS budsjetterte med et underskudd på 10,6 mill. kr i 2026. Bemanningen skal ned fra 230 årsverk i 2026 til rundt 214 i 2028 (Innkalling 16.12.2025).",
      "Østlandsforskning avvikles som institutt; ved utgangen av mai 2026 var tre ansatte innplassert i andre faste stillinger, én under avklaring og to tilbudt midlertidige stillinger (Innkalling universitetsstyret 04.05.2026).",
      "Søkertallene økte moderat i 2026: HHS hadde 4 581 førstevalgssøkere i Samordna opptak (+1,2 %) og 2 930 søkere i lokalt opptak (+8,1 %) – totalt 274 flere søkere enn året før. Nettstudiene er særlig attraktive, med 10,95 søkere per plass på nettbasert bachelor i økonomi og administrasjon (Innkalling universitetsstyret 24.06.2026).",
      "Masterporteføljen skal styrkes med mål om å øke masterandelen fra 13 til 20 prosent. Master i rettsvitenskap avventer NOKUT og kan tidligst starte i 2027 (Innkalling universitetsstyret 24.06.2026)."
    ],
    "oppsummering": "Universitetsstyrets sakspapirer for Innlandet er offentlig tilgjengelige og viser en handelshøgskole under omorganisering med et stramt budsjett, men med økende søkertall, særlig til nettbaserte studier.",
    "relevanteProgram": [
      "inn_oa",
      "inn_rena_oa",
      "inn_moa"
    ]
  },
  {
    "id": "hvl",
    "name": "HVL",
    "fullName": "Høgskulen på Vestlandet",
    "enhet": "Handelshøgskulen HVL – Fakultet for teknologi, miljø- og samfunnsvitskap (FTMS)",
    "styresider": [
      "https://opengov.360online.com/Meetings/hvl-uninett/Boards/Details/302309"
    ],
    "status": "complete",
    "dokumenter": [
      {
        "label": "Tilbakemelding rekneskap per 31.12.2025",
        "url": "https://opengov.360online.com/Meetings/hvl-uninett/Meetings/Details/936766?agendaItemId=216390",
        "localPath": "/markedsstatus/hh/HVL_FTMS_Rekneskap_2025.pdf",
        "dato": "2025",
        "storrelseMB": 0.19
      },
      {
        "label": "Rektors oppdragsbrev 2026 – FTMS",
        "url": "https://opengov.360online.com/Meetings/hvl-uninett/Meetings/Details/936766?agendaItemId=216386",
        "localPath": "/markedsstatus/hh/HVL_Oppdragsbrev_2026_FTMS.pdf",
        "dato": "2026",
        "storrelseMB": 0.7
      },
      {
        "label": "NOKUT sitt institusjonsbesøk til HVL",
        "url": "https://opengov.360online.com/Meetings/hvl-uninett/Meetings/Details/946603?agendaItemId=216956",
        "localPath": "/markedsstatus/hh/HVL_NOKUT_Institusjonsbesok.pdf",
        "dato": "2026",
        "storrelseMB": 0.11
      },
      {
        "label": "KI-emne ved FTMS",
        "url": "https://opengov.360online.com/Meetings/hvl-uninett/Meetings/Details/946603?agendaItemId=216959",
        "localPath": "/markedsstatus/hh/HVL_KI-emne_FTMS.pdf",
        "dato": "2026",
        "storrelseMB": 0.12
      }
    ],
    "punkter": [
      "Dokumentene gjelder FTMS samlet – Handelshøgskulen HVL inngår i Fakultet for teknologi, miljø- og samfunnsvitskap, og tallene nedenfor gjelder hele fakultetet, ikke Handelshøgskulen alene (Rekneskap per 31.12.2025).",
      "Økonomien er kraftig forbedret: FTMS fikk et regnskapsført mindreforbruk på 14,5 mill. kr i 2025. Totale kostnader falt med 9,4 mill. kr og lønnskostnadene med 9,2 mill. kr; årsverk ble redusert med 15,2 til 493,8 (Rekneskap per 31.12.2025).",
      "Et nytt KI-mikroemne, «Kunstig intelligens: Hva dreier det seg om?», ga 2,5 studiepoeng og ble tilbudt første gang våren 2026 til hele HVL. Et nytt emne innen digitalisering og KI planlegges høsten 2026 (KI-emne ved FTMS).",
      "Universitetssøknaden nærmer seg avgjørelse: NOKUT gjennomførte et institusjonsbesøk i april 2026 med 15 møter om utdanning, forskning, ph.d.-programmer, campus og internasjonalisering. Sakkyndig anbefaling ventes høsten 2026, og NOKUT-styrets vedtak innen utgangen av året (NOKUT sitt institusjonsbesøk til HVL)."
    ],
    "oppsummering": "Dokumentene som er tilgjengelige gjelder FTMS-fakultetet som helhet, ikke Handelshøgskulen HVL isolert. De viser en kraftig forbedret økonomi og en høgskole i sluttfasen av en universitetssøknad.",
    "relevanteProgram": [
      "hvl_bergen_oa",
      "hvl_haugesund_oa",
      "hvl_sogndal_oa",
      "hvl_dol",
      "hvl_moa"
    ]
  },
  {
    "id": "hiof",
    "name": "HiØ",
    "fullName": "Høgskolen i Østfold",
    "enhet": "Institutt for økonomi, innovasjon og samfunn (ØIS) · Fakultet for informasjonsteknologi, ingeniørfag og økonomi (IIØ)",
    "styresider": [
      "https://opengov.360online.com/Meetings/hiof/Boards/Details/261077"
    ],
    "status": "complete",
    "dokumenter": [
      {
        "label": "Tertialrapport T3 2025",
        "url": "https://opengov.360online.com/Meetings/hiof/Boards/Details/261077",
        "localPath": "/markedsstatus/hh/HiOF_Tertialrapport_T3_2025.pdf",
        "dato": "2025",
        "storrelseMB": 0.44
      },
      {
        "label": "Handlingsplan IIØ mot 2030",
        "url": "https://opengov.360online.com/Meetings/hiof/Boards/Details/261077",
        "localPath": "/markedsstatus/hh/HiOF_IIO_Handlingsplan_mot_2030.pdf",
        "dato": "2026",
        "storrelseMB": 0.26
      }
    ],
    "punkter": [
      "Fakultet IIØ avsluttet tredje tertial 2025 med et mindreforbruk på 5,2 mill. kr, mot budsjetterte 3,1 mill. kr (Tertialrapport T3 2025).",
      "Ved Institutt for økonomi, innovasjon og samfunn (ØIS) var lønnskostnadene 18,0 mill. kr, 0,7 mill. kr over budsjett, hovedsakelig pga. overtid, sensorer og eksamensvakter. Instituttet endte likevel med et mindreforbruk på 1,0 mill. kr (Tertialrapport T3 2025).",
      "Fra januar 2026 organiseres ØIS i tre fagmiljøer: bedriftsøkonomiske, samfunnsøkonomiske og administrative fag (Tertialrapport T3 2025).",
      "ØIS skal gjennomføre en behovsanalyse for en mulig tverrfaglig mastergrad i Digital Business og teknologiledelse, og tilpasse deltidsstudiet i økonomi og administrasjon bedre til studenter i arbeid (Handlingsplan IIØ mot 2030)."
    ],
    "oppsummering": "Høgskolen i Østfolds styrepapirer for IIØ-fakultetet er offentlig tilgjengelige og viser et institutt i økonomisk balanse som omorganiseres i tre fagmiljøer og vurderer en ny tverrfaglig mastergrad.",
    "relevanteProgram": [
      "hiof_oa",
      "hiof_is"
    ]
  },
  {
    "id": "uit",
    "name": "UiT",
    "fullName": "UiT Norges arktiske universitet",
    "enhet": "Handelshøgskolen ved UiT / Fakultet for biovitenskap, fiskeri og økonomi (BFE)",
    "styresider": [
      "https://uit.no/enhet/hht/omoss",
      "https://uit.no/enhet/bfe/omoss"
    ],
    "status": "partial",
    "dokumenter": [
      {
        "label": "Om Handelshøgskolen ved UiT",
        "url": "https://uit.no/enhet/hht/omoss",
        "localPath": null,
        "dato": "2026",
        "storrelseMB": null
      },
      {
        "label": "Statsbudsjettet 2026 for universitet og høgskular (UiT-tildeling omtalt i Khrono)",
        "url": "https://www.khrono.no/29-av-36-universiteter-og-hogskoler-far-kutt-i-budsjettene/1006209",
        "localPath": null,
        "dato": "2025",
        "storrelseMB": null
      }
    ],
    "punkter": [
      "Vi fant ingen offentlig tilgjengelige styresaker for Fakultet for biovitenskap, fiskeri og økonomi (BFE) eller for Handelshøgskolen spesifikt i denne perioden; UiTs sentrale og fakultetsvise styringsdokumenter ligger dels bak innlogging, tilsvarende det som allerede er notert for NTNU/UiT/OsloMet/Volda i prosjektets statusnotat.",
      "Handelshøgskolen ved UiT har studiesteder i Alta, Harstad, Narvik og Tromsø, med om lag 3 000 studenter og 17 studieprogram (uit.no/enhet/hht, egen omtale).",
      "UiT er tildelt 4,277 mrd. kr i forslaget til statsbudsjett for 2026, 1,18 prosent mindre enn i 2025 når det er justert for lønns- og prisvekst. Dette er et institusjonstall, ikke spesifikt for Handelshøgskolen (statsbudsjettet 2026, omtalt av Khrono)."
    ],
    "oppsummering": "Status er satt til «partial» fordi vi ikke fant offentlig tilgjengelige styresaker for BFE-fakultetet eller Handelshøgskolen ved UiT i denne perioden – tilsvarende innloggingssperren som er kjent fra andre UiT-fakulteter. Punktene bygger i stedet på UiTs egne nettsider og pressedekning av statsbudsjettet, og gir derfor ikke fakultetsspesifikke tall for budsjett, søkertall eller studieplasser.",
    "relevanteProgram": [
      "uit_oa",
      "uit_alta_oa",
      "uit_harstad_oa",
      "uit_samf",
      "uit_moa",
      "uit_mecon"
    ]
  },
  {
    "id": "uio",
    "name": "UiO",
    "fullName": "Universitetet i Oslo",
    "enhet": "Økonomisk institutt / Det samfunnsvitenskapelige fakultet",
    "styresider": [
      "https://www.sv.uio.no/econ/om/organisasjon/styret/"
    ],
    "status": "complete",
    "dokumenter": [
      {
        "label": "Budsjett 2026 og langtidsprognose 2027–2030, Økonomisk institutt (notat til instituttstyret 04.12.2025)",
        "url": "https://www.sv.uio.no/econ/om/organisasjon/styret/moter/2025/sakspapirer-2025/oi_budsjett-2026-og-langtidsprognose-2027-2030_sistern.pdf",
        "localPath": "/markedsstatus/hh/UiO_OkonomiskInstitutt_Budsjett_2026_LTP_2027-2030.pdf",
        "dato": "04.12.2025",
        "storrelseMB": 0.41
      },
      {
        "label": "Årsplan for Økonomisk institutt 2026–2028 (vedtatt av instituttstyret 10.03.2026)",
        "url": "https://www.sv.uio.no/econ/om/organisasjon/styret/moter/2026/sakspapirer-2026/10.-mars-2026/arsplan-oi-2026-2028.pdf",
        "localPath": "/markedsstatus/hh/UiO_OkonomiskInstitutt_Arsplan_2026-2028.pdf",
        "dato": "10.03.2026",
        "storrelseMB": 0.35
      }
    ],
    "punkter": [
      "Økonomisk institutts tildeling for 2026 er 53,9 mill. kr, en økning på 0,6 mill. kr fra 2025, etter en justert fordelingsmodell som fakultetsstyret vedtok 25. september 2025 (Budsjett 2026 og langtidsprognose 2027–2030, notat 04.12.2025).",
      "Prognosen for ubrukte midler som overføres fra 2025 til 2026 er 22,7 mill. kr. Langtidsprognosen for 2027–2030 legges opp i balanse, i tråd med fakultetets krav om at enhetene skal ha økonomi i balanse innen 2030 (samme notat).",
      "Instituttet planlegger flere nye faste vitenskapelige stillinger og innstegsstillinger fra høsten 2026, blant annet innen internasjonal økonomi og makroøkonomi, dels finansiert av eksterne prosjekter (NORCIE, WaCoMacro, EXPLIOT). Det legges opp til to nye stipendiatstillinger i 2026 og 2027, og tre årlig i 2028–2030 (samme notat).",
      "Årsplanen for 2026–2028 viderefører samarbeidet med Handelshøyskolen BI om Oslo PhD Initiative in Economics, og innfører en egen KI-strategi for undervisning og vurdering, inkludert en «KI-sandkasse» for ansatte og studenter (Årsplan for Økonomisk institutt 2026–2028)."
    ],
    "oppsummering": "Samfunnsøkonomi ved UiO er organisert under Økonomisk institutt ved Det samfunnsvitenskapelige fakultet. Instituttstyrets sakspapirer er offentlig tilgjengelige og viser en solid økonomisk situasjon med rom for nye stillinger, samt en ny satsing på KI i undervisningen.",
    "relevanteProgram": [
      "uio_samf",
      "uio_finans",
      "uio_inl",
      "uio_mecon",
      "uio_mei"
    ]
  },
  {
    "id": "uib",
    "name": "UiB",
    "fullName": "Universitetet i Bergen",
    "enhet": "Institutt for økonomi / Det samfunnsvitenskapelige fakultet",
    "styresider": [
      "https://ekstern.filer.uib.no/svf/2025/Fakultetsstyret%202025/"
    ],
    "status": "complete",
    "dokumenter": [
      {
        "label": "Budsjett 2026 – forslag til fordeling av driftsmidler og strategisk avsetning til stillinger (sak 84/25)",
        "url": "https://ekstern.filer.uib.no/svf/2025/Fakultetsstyret%202025/Desember/84-25%20Budsjett%202026%20-%20Forslag%20til%20fordeling%20av%20driftsmidler%20og%20strategisk%20avsetning%20til%20stillinger.pdf",
        "localPath": "/markedsstatus/hh/UiB_SVfakultetet_Budsjett_2026_fordeling_driftsmidler.pdf",
        "dato": "12.2025",
        "storrelseMB": 3.41
      },
      {
        "label": "Budsjettinnspill 2026 og langtidsbudsjett 2027–2030 (sak 56/25)",
        "url": "https://www.uib.no/sites/w3.uib.no/files/attachments/56-25_budsjettinnspill_2026_og_langtidsbudsjett_2027-2030_1.pdf",
        "localPath": "/markedsstatus/hh/UiB_SVfakultetet_Budsjettinnspill_2026_LTB_2027-2030.pdf",
        "dato": "02.09.2025",
        "storrelseMB": 2.56
      }
    ],
    "punkter": [
      "Det samfunnsvitenskapelige fakultets tildeling fra Kunnskapsdepartementet for 2026 er 395,8 mill. kr, en nominell økning på 2,6 prosent, men en reell nedgang på ca. 1 prosent når forventet lønns- og prisvekst (LPK) på 3,6 prosent er tatt med (Budsjett 2026, sak 84/25).",
      "Fakultetets samlede inntekter for 2026 er beregnet til 536 mill. kr, hvorav 396 mill. kr er grunnbevilgning og 140 mill. kr er BOA-inntekter. Budsjettet legges opp i balanse med et forventet driftsresultat på +2,2 mill. kr (Budsjettinnspill 2026, sak 56/25).",
      "Driftstildelingen til instituttene økes fra 21 mill. kr i 2025 til 22 mill. kr i 2026, men det er fortsatt en betydelig økonomisk ubalanse mellom fakultets- og instituttnivå: i 2024-regnskapet hadde fakultetsnivået en negativ overføring på 74,9 mill. kr, mens instituttene samlet hadde en positiv overføring på 31,3 mill. kr (Budsjett 2026, sak 84/25).",
      "Et nytt tverrfakultært studieprogram i filosofi, politikk og økonomi (FPØ) etableres; Institutt for økonomi får én av to øremerkede rekrutteringsstillinger til det nye programmet, den andre går til Institutt for sammenliknende politikk (Budsjett 2026, sak 84/25).",
      "Fakultetet foreslår 12 nye rekrutteringsstillinger med tilsetting i 2026 og tre nye faste vitenskapelige stillinger med halvårseffekt (Budsjettinnspill 2026, sak 56/25)."
    ],
    "oppsummering": "Samfunnsøkonomi ved UiB er organisert under Institutt for økonomi ved Det samfunnsvitenskapelige fakultet. Fakultetsstyrets budsjettsaker for 2026 er offentlig tilgjengelige, men gir i hovedsak tall på fakultetsnivå – de fleste tallene under gjelder derfor SV-fakultetet som helhet, ikke instituttet isolert. Bildet er et fakultet med stram, men balansert økonomi og en ny satsing på filosofi, politikk og økonomi.",
    "relevanteProgram": [
      "uib_samf",
      "uib_imo",
      "uib_mecon"
    ]
  },
  {
    "id": "bi",
    "name": "BI",
    "fullName": "Handelshøyskolen BI (Stiftelsen Handelshøyskolen BI)",
    "enhet": null,
    "styresider": [],
    "status": "complete",
    "dokumenter": [
      {
        "label": "Årsregnskap 2025 (Regnskapsregisteret), Stiftelsen Handelshøyskolen BI, org.nr. 971228865",
        "url": "https://www.brreg.no/bedrift/971228865/",
        "localPath": null,
        "dato": "2025",
        "storrelseMB": null
      },
      {
        "label": "Prop. 1 S (2025–2026) Kunnskapsdepartementet – statstilskudd til private høyskoler, tabell 2.1",
        "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7",
        "localPath": null,
        "dato": "2025-2026",
        "storrelseMB": null
      },
      {
        "label": "Enhetsregisteret – roller (styre og daglig leder), org.nr. 971228865",
        "url": "https://data.brreg.no/enhetsregisteret/api/enheter/971228865/roller",
        "localPath": null,
        "dato": "24.09.2026",
        "storrelseMB": null
      }
    ],
    "punkter": [
      "Stiftelsen Handelshøyskolen BI hadde driftsinntekter på 2 194 022 000 kr og et driftsresultat på +32 742 000 kr i 2025, med et årsresultat på +18 088 000 kr og en egenkapital på 1 007 046 000 kr (Årsregnskap 2025, Regnskapsregisteret, org.nr. 971228865).",
      "BI er tildelt 445 553 000 kr i statstilskudd for 2026 over statsbudsjettets kap. 260 post 70 «Private høgskular» (Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1).",
      "BIs bachelor i økonomi og administrasjon (DIPØAH) hadde 3 343 søknader, 2 906 tilbud og 1 866 møtte i det lokale opptaket i 2025. Alle 2 906 kvalifiserte søkere fikk tilbud – en tilbudsandel av kvalifiserte på 100 prosent, mot NMBUs bruk av poenggrense (DBH tabell 379, 2025).",
      "BI ledes av styreleder Egil Olav Hogna og daglig leder (rektor) Egil Matsen, med 1 847 ansatte. Stiftelsen er ikke registrert som konsern (Enhetsregisteret, hentet 24.09.2026).",
      "Styrepapirer og fakultetsstyresaker for BI er ikke offentlige, siden BI er en privat stiftelse og ikke omfattet av offentleglova. Tallene over er derfor hentet fra offentlige registre (Brønnøysundregistrene) og statsbudsjettet i stedet for styredokumenter."
    ],
    "oppsummering": "BIs egne styrepapirer er ikke offentlige. Markedsstatusen bygger i stedet på verifiserte offentlige kilder – Regnskapsregisteret, Enhetsregisteret og statsbudsjettet – som til sammen gir et solid bilde av økonomi, eierskap og lokalt opptak. BI hadde et positivt driftsresultat i 2025 og et nesten åpent opptak til bachelorprogrammet i økonomi og administrasjon.",
    "relevanteProgram": [
      "bi_oa",
      "bi_dbh",
      "bi_dsb",
      "bi_moa",
      "bi_mecon",
      "bi_mei"
    ]
  },
  {
    "id": "kristiania",
    "name": "Kristiania",
    "fullName": "Høyskolen Kristiania (Ernst G. Mortensens Stiftelse)",
    "enhet": null,
    "styresider": [],
    "status": "complete",
    "dokumenter": [
      {
        "label": "Årsregnskap 2025 (Regnskapsregisteret), Høyskolen Kristiania – Ernst G. Mortensens Stiftelse, org.nr. 954831604",
        "url": "https://www.brreg.no/bedrift/954831604/",
        "localPath": null,
        "dato": "2025",
        "storrelseMB": null
      },
      {
        "label": "Prop. 1 S (2025–2026) Kunnskapsdepartementet – statstilskudd til private høyskoler, tabell 2.1",
        "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7",
        "localPath": null,
        "dato": "2025-2026",
        "storrelseMB": null
      },
      {
        "label": "Enhetsregisteret – roller (styre og daglig leder), org.nr. 954831604",
        "url": "https://data.brreg.no/enhetsregisteret/api/enheter/954831604/roller",
        "localPath": null,
        "dato": "24.09.2026",
        "storrelseMB": null
      }
    ],
    "punkter": [
      "Høyskolen Kristiania – Ernst G. Mortensens Stiftelse hadde driftsinntekter på 1 454 242 565 kr, men et driftsresultat på −103 586 704 kr i 2025, og et årsresultat på −53 908 488 kr – et betydelig underskudd (Årsregnskap 2025, Regnskapsregisteret, org.nr. 954831604).",
      "Kristiania er tildelt 409 598 000 kr i statstilskudd for 2026 over statsbudsjettets kap. 260 post 70 «Private høgskular» (Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1).",
      "Kristiania er registrert som konsern, med datterselskapet Fagskolen Kristiania AS (org.nr. 998632307). Styreleder er Kyrre Lekve og daglig leder (rektor) Solfrid Lind, med 1 140 ansatte (Enhetsregisteret, hentet 24.09.2026).",
      "Bachelor i økonomi og ledelse (BOL) hadde 639 søknader, 602 tilbud og 159 møtte i det lokale opptaket i 2025 – vesentlig lavere volum enn BIs tilsvarende program (DBH tabell 379, 2025).",
      "Fra høsten 2026 bytter bachelor i økonomi og ledelse navn til «Bachelor i økonomi og administrasjon – bli siviløkonom» (kristiania.no, programside for økonomi og administrasjon).",
      "Styrepapirer for Kristiania er ikke offentlige, tilsvarende BI. Tallene over er hentet fra offentlige registre og statsbudsjettet i stedet for styredokumenter."
    ],
    "oppsummering": "Kristianias egne styrepapirer er ikke offentlige. Markedsstatusen bygger på de samme offentlige kildetypene som for BI. Hovedfunnet er et betydelig driftsunderskudd i 2025 (−103,6 mill. kr) og en pågående navneendring på bachelorprogrammet i økonomi og ledelse fra høsten 2026.",
    "relevanteProgram": [
      "kristiania_oa",
      "kristiania_bod",
      "kristiania_mei"
    ]
  }
];
