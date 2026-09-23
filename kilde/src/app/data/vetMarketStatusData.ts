// GENERERT av scripts/build-markedsstatus.py 2026-09-23 – ikke rediger for hånd.
// Kilde: data/vet/markedsstatus.json · PDF-er i kilde/public/markedsstatus/vet/

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

export const MARKET_STATUS_HENTET: string | null = "2026-09-23";

export const MARKET_STATUS: MarketInstitution[] = [
  {
    "id": "nmbu",
    "name": "NMBU",
    "fullName": "Norges miljø- og biovitenskapelige universitet",
    "enhet": "Veterinærhøgskolen (fakultet) — ingen innenlandsk konkurrent, derfor dekkes fakultetets egne styresaker",
    "styresider": [
      "https://opengov.360online.com/Meetings/nmbu/Boards/Details/372433",
      "https://opengov.360online.com/Meetings/nmbu/Boards/Details/368286",
      "https://www.nmbu.no/om/organisasjon/fakultetsstyrer/fakultetsstyret-ved-veterinaerhogskolen"
    ],
    "status": "complete",
    "dokumenter": [
      {
        "label": "Fakultetsstyret VET – komplett innkalling 06.03.2025 (sak 3/25 Årsrapport 2024 med regnskap: akkumulert underskudd 82,7 mill. kr)",
        "url": "https://opengov.360online.com/Meetings/nmbu/File/Details/1406345.PDF?fileName=Komplett%20innkalling%3A%20Fakultetsstyret%20-%20VET%20-%20Veterin%C3%A6rh%C3%B8gskolen%20(06.03.2025)&fileSize=14773265",
        "localPath": "/markedsstatus/vet/NMBU_VET_Fakultetsstyret_06.03.2025.pdf",
        "dato": "2025-03-06",
        "storrelseMB": 14.09
      },
      {
        "label": "Fakultetsstyret VET – komplett innkalling 19.06.2025 (sak 21/25 Ny ledelsesstruktur: prodekaner og separate programråd for vet/dyrepleie fra 01.08.2025)",
        "url": "https://opengov.360online.com/Meetings/nmbu/File/Details/1442736.PDF?fileName=Komplett%20innkalling%3A%20Fakultetsstyret%20-%20VET%20-%20Veterin%C3%A6rh%C3%B8gskolen%20(19.06.2025)&fileSize=2804351",
        "localPath": "/markedsstatus/vet/NMBU_VET_Fakultetsstyret_19.06.2025.pdf",
        "dato": "2025-06-19",
        "storrelseMB": 2.67
      },
      {
        "label": "Fakultetsstyret VET – komplett innkalling 30.10.2025 (sak 33/25 Budsjett 2026 og fordelingsmodell, sak 37/25 Studiekvalitetsrapport 2025 med søkertall og studieplasser)",
        "url": "https://opengov.360online.com/Meetings/nmbu/File/Details/1497294.PDF?fileName=Komplett%20innkalling%3A%20Fakultetsstyret%20-%20VET%20-%20Veterin%C3%A6rh%C3%B8gskolen%20(30.10.2025)&fileSize=3151409",
        "localPath": "/markedsstatus/vet/NMBU_VET_Fakultetsstyret_30.10.2025.pdf",
        "dato": "2025-10-30",
        "storrelseMB": 3.01
      },
      {
        "label": "Fakultetsstyret VET – komplett innkalling 08.12.2025 (sak 45/25 Årsplan og budsjett 2026, sak 46/25 Justert strategisk bemanningsplan 2025-29)",
        "url": "https://opengov.360online.com/Meetings/nmbu/File/Details/1511812.PDF?fileName=Komplett%20innkalling%3A%20Fakultetsstyret%20-%20VET%20-%20Veterin%C3%A6rh%C3%B8gskolen%20(08.12.2025)&fileSize=1902102",
        "localPath": "/markedsstatus/vet/NMBU_VET_Fakultetsstyret_08.12.2025.pdf",
        "dato": "2025-12-08",
        "storrelseMB": 1.81
      },
      {
        "label": "Fakultetsstyret VET – komplett innkalling 05.03.2026 (sak 4/26 Årsrapport 2025 med regnskap og status samlokalisering SBV, sak 5/26 Status for uspesifisert kutt 2026)",
        "url": "https://opengov.360online.com/Meetings/nmbu/File/Details/1543956.PDF?fileName=Komplett%20innkalling%3A%20Fakultetsstyret%20-%20VET%20-%20Veterin%C3%A6rh%C3%B8gskolen%20(05.03.2026)&fileSize=2114470",
        "localPath": "/markedsstatus/vet/NMBU_VET_Fakultetsstyret_05.03.2026.pdf",
        "dato": "2026-03-05",
        "storrelseMB": 2.02
      },
      {
        "label": "Fakultetsstyret VET – komplett innkalling 25.06.2026 (sak 18/26 Evaluering av faglig organisering fra 2019, sak 20/26 Oppsummering fra Universitetsstyremøtet 10.06.2026)",
        "url": "https://opengov.360online.com/Meetings/nmbu/File/Details/1581179.pdf?fileName=Komplett%20innkalling%3A%20Fakultetsstyret%20-%20VET%20-%20Veterin%C3%A6rh%C3%B8gskolen%20(25.06.2026)&fileSize=2088295",
        "localPath": "/markedsstatus/vet/NMBU_VET_Fakultetsstyret_25.06.2026.pdf",
        "dato": "2026-06-25",
        "storrelseMB": 1.99
      },
      {
        "label": "Universitetsstyret NMBU – innkalling 10.11.2025 (sak 9/25 Studieprogramportefølje 2026-2027, sak 10/25 Opptaksrammer 2026/27, sak 12/25 Tertialrapport 2. tertial 2025, sak 13/25 Årsplan og rammer 2026 med langtidsprognose)",
        "url": "https://opengov.360online.com/Meetings/nmbu/File/Details/1500699.PDF?fileName=Innkalling%20Universitetsstyret%2010.11.2025%20(oppdatert%2031.okt)&fileSize=9651247",
        "localPath": "/markedsstatus/vet/NMBU_Universitetsstyret_10.11.2025.pdf",
        "dato": "2025-11-10",
        "storrelseMB": 9.2
      }
    ],
    "punkter": [
      "Veterinærhøgskolen gikk inn i 2024 med et akkumulert underskudd på 66,8 mill. kr; underskuddet vokste med 15,9 mill. kr gjennom året og endte på 82,7 mill. kr ved utgangen av 2024 (sak 3/25 Årsrapport 2024 med regnskap, fakultetsstyret 06.03.2025, s. 10/155). Underskuddet stammer fra driftsårene etter innflytting i det nye Veterinærbygningen på Ås og skal ifølge langtidsbudsjettet reduseres årlig fra 2026. Universitetsstyrets egen tertialrapport bekrefter samme inngående balanse på -82,3 mill. kr for 2025 (sak 12/25, universitetsstyret 10.11.2025, s. 72/283).",
      "I budsjettsaken for 2026 (sak 33/25, fakultetsstyret 30.10.2025, s. 54/117) opplyses det at NMBU samlet fikk en reell nedgang i statlig tildeling på 0,5 % fra 2025 til 2026 (mot en realvekst på 0,4 % året før). Fakultetet la likevel opp til et budsjett i balanse for 2026, med et mål om 30 mill. kr i varig innsparing gjennom redusert husleie når flere enheter deler Veterinærbygningen. I oppfølgingssaken «Status for uspesifisert kutt 2026» (sak 5/26, fakultetsstyret 05.03.2026, s. 51/75) fremgår det at budsjettet for 2026 inneholdt 6,5 mill. kr i uspesifisert kutt for å nå balansekravet, og at styret i desember 2025 hadde bedt om en konkretisert tidsplan og instituttvis fordeling som fortsatt var under utredning i februar/mars 2026.",
      "Årsplan 2026 (sak 45/25, fakultetsstyret 08.12.2025, s. 9-10/60) viser at fakultetets prognostiserte driftsresultat er forbedret fra -27,9 mill. kr i 2022 til -1,1 mill. kr i 2025, med et budsjettert nullresultat for 2026. Samtidig er antallet førsteprioritetssøkere til veterinærstudiet ventet å falle videre fra 613 i 2022 til 480 i 2027 (styringsparameter satt av Universitetsstyret), en trend fakultetet selv kobler til kommende endringer i opptaksregelverket fra 2027.",
      "Studiekvalitetsrapporten for 2024/2025 (sak 37/25, fakultetsstyret 30.10.2025, s. 73-74/117) oppgir at veterinærstudiet har 90 studieplasser og dyrepleierstudiet 30. Høsten 2024 ble ventelisten på dyrepleierstudiet tømt for første gang, og høsten 2025 ble det praktisert bevisst overbooking slik at 44 dyrepleierstudenter møtte. Førsteprioritetssøkertallet har likevel falt over flere år på begge studier: fra 565 (vet) og 133 (dyr) i 2019 til 458 (vet) og 91 (dyr) i 2025. Studiebarometeret 2024 viser høy tilfredshet: 4,3 poeng for veterinærstudiet og 4,4 for dyrepleierstudiet, begge over NMBU-snittet på 4,1.",
      "De 20 veterinærstudieplassene som ble innført midlertidig under pandemien (revidert nasjonalbudsjett 2020, fra 70 til 90 plasser) og siden kuttet i 2023, er nå gjenopprettet: 10 plasser kom i revidert nasjonalbudsjett 2024, og de resterende 10 ble gjort varige gjennom statsbudsjettet for 2025 (sak 33/25, fakultetsstyret 30.10.2025, s. 55/117; bekreftet i Universitetsstyrets sak om endring i basistildelingen, sak 13/25 vedlegg 2, 10.11.2025, s. 135/283). Opptaksrammen for 2026 er likevel satt til 90 (offisiell kapasitet), ned fra en bevisst overbooking til 99 møtte i 2025 (sak 10/25 Opptaksrammer NMBU 2026/27, 10.11.2025, s. 58/283). Opptaksrammen for dyrepleie er tilsvarende justert ned fra en overbooket ramme på 34 i 2025 til den ordinære kapasiteten på 30 i 2026.",
      "Justert strategisk bemanningsplan 2025-29 (sak 46/25, fakultetsstyret 08.12.2025, s. 35/60) viser at Veterinærhøgskolen i 2025 hadde 296,95 årsverk lønnet av grunnbevilgningen (BFV), og totalt 414 stillinger (387,6 årsverk) når eksternfinansierte stillinger regnes med — om lag 23 % av bemanningen er dermed helt eksternfinansiert. 72,2 % av de ansatte er kvinner. Planen varsler at en presset økonomi kan gjøre det nødvendig å nedjustere antall faste vitenskapelige stillinger på fagområder med mindre undervisning i planperioden.",
      "Fra 1. august 2025 fikk Veterinærhøgskolen egne prodekaner for utdanning og forskning, som erstattet tidligere studie-/forskningsutvalgsledere, og det ble opprettet separate programråd for henholdsvis veterinær- og dyrepleierstudiet der ett felles utvalg (VET-SU) tidligere dekket begge (sak 21/25 Ny ledelsesstruktur på Veterinærhøgskolen, fakultetsstyret 19.06.2025, s. 68-69/119). Endringen kom samtidig med skifte av dekan (april 2025) og utskifting av to av fire instituttledere i løpet av 2025, og ble ifølge fakultetets egen årsplan gjennomført uten økt ressursbruk til ledelse, nettopp på grunn av den stramme økonomien (sak 45/25 Årsplan 2026, 08.12.2025, s. 8/60).",
      "Samlokaliseringsprosjektet med Fakultet for biovitenskap (SBV), som skal flytte BIOVITs Institutt for husdyr- og akvakulturvitenskap og administrasjon inn i Veterinærbygningen, gikk i 2026 videre til fase 2 (detaljering) (Årsrapportsak, fakultetsstyret 05.03.2026, s. 50/75). Fakultetsstyret har bedt om at den økonomiske gevinsten for VET (gjeldsslette eller redusert husleie) tydeliggjøres, og dekanen er i dialog med universitetsdirektøren om dette; ingen konkrete tall var lagt fram per mars 2026.",
      "NMBUs studieprogramportefølje for 2026-2027, vedtatt av Universitetsstyret 10.11.2025 (sak 9/25, s. 4-8/283), inneholder ingen endringer i veterinær- eller dyrepleierprogrammene — nedleggelser og navneendringer i denne runden gjelder utelukkende program ved andre fakulteter (BIOVIT, LANDSAM m.fl.)."
    ],
    "oppsummering": "Veterinærhøgskolen er NMBUs mest økonomisk pressede fakultet: et akkumulert underskudd på 82,7 mill. kr etter årene med innflytting på Ås skal nedbetales fra 2026, med uspesifiserte kutt, ny ledelsesstruktur (prodekaner fra august 2025) og en pågående samlokalisering med Biovit som mulige, men ennå ikke konkretiserte, innsparingskilder. Samtidig er de 20 pandemi-studieplassene i veterinærmedisin som ble kuttet i 2023, nå formelt gjenopprettet (90 plasser fra 2025), mens søkertallet til både veterinær- og dyrepleierstudiet har falt jevnt i flere år selv om studieplassene fortsatt fylles — dyrepleie måtte for første gang tømme ventelisten i 2024. NMBU er eneste norske tilbyder av veterinærutdanning og har derfor ingen direkte innenlandsk konkurrent; det nasjonale bildet (KD/HK-dir) og Nords dyrepleiebachelor er likevel relevante referansepunkter.",
    "relevanteProgram": [
      "nmbu_veterinaer",
      "nmbu_dyrepleie"
    ]
  },
  {
    "id": "nord",
    "name": "Nord",
    "fullName": "Nord universitet",
    "enhet": "Fakultet for biovitenskap og akvakultur (FBA) — Bachelor i dyrepleie, eneste norske konkurrent til NMBUs dyrepleierstudium",
    "styresider": [
      "https://www.nord.no/no/om-nord/styret"
    ],
    "status": "partial",
    "dokumenter": [
      {
        "label": "Styret for Nord universitet – komplett innkalling 23.10.2025 (sak 87/25 Søkning og opptak høsten 2025, sak 88/25 Studieportefølje 2026/2027 inkl. FBA-tabell med dyrepleie, sak 90/25 Budsjett 2027 – satsingsforslag utenfor rammen med nytt fiskevelferdsstudium)",
        "url": "https://www.nord.no/sites/default/files/2025-10/Komplett-innkalling-Styret-for-Nord-universitet-23-10-2025.pdf",
        "localPath": "/markedsstatus/vet/Nord_Styret_Innkalling_23.10.2025.pdf",
        "dato": "2025-10-23",
        "storrelseMB": 8.3
      }
    ],
    "punkter": [
      "I den endelige studieporteføljen for 2026/2027 (sak 88/25, styremøte 23.10.2025, s. 76/189, vedlegg «FBA Endelig studieportefølje 2026-2027») er Bachelor i dyrepleie (Bodø, campus, heltid) videreført med 50 utlyste studieplasser for 2026, og har i snitt hatt 51 møtte studenter de to siste opptakene — programmet fyller dermed opp og noe over kapasiteten, i motsetning til f.eks. Bachelor i skogfag ved samme fakultet (20 utlyste plasser, snitt 7 møtte).",
      "I saken om søkning og opptak høsten 2025 (sak 87/25, styremøte 23.10.2025, s. 50/189) noterer styret en liten nedgang i søkertallet til dyrepleie, sammen med Bachelor i havbruksdrift og ledelse, sammenlignet med tidligere år — men programmet fylte likevel studieplassene i 2025-opptaket.",
      "FBA søker i budsjettforslaget for 2027 (sak 90/25, styremøte 23.10.2025, s. 128-129/189) om finansiering til et nytt femårig studium i fiskevelferd (25 studieplasser fra 2027), begrunnet med mangel på fiskehelsekompetanse i havbruksnæringen og henvisning til Fiskehelserapporten 2023. Programmet skal bygge på fakultetets eksisterende fagmiljø innen blant annet veterinærmedisin, farmakologi og fiskefysiologi — en mulig ny, tilgrensende utdanning ved FBA, men ikke en direkte konkurrent til NMBUs dyrepleie- eller veterinærstudium.",
      "Nord har ikke et eget fakultetsstyre for FBA slik NMBU har for Veterinærhøgskolen; beslutninger om dyrepleie behandles i det sentrale universitetsstyret sammen med hele studieporteføljen og budsjettet. Det ble ikke funnet egne, nedlastbare søkertalls- eller budsjettvedlegg spesifikt for dyrepleie ut over det som inngår i de samlede styresakene over."
    ],
    "oppsummering": "Nords dyrepleiebachelor i Bodø er FBAs mest stabile utdanningstilbud med full kapasitetsutnyttelse (50 studieplasser, snitt 51 møtte over de to siste opptakene) til tross for en svak søkernedgang i 2025 — et helt annet bilde enn f.eks. fakultetets skogfagsatsing. FBA bygger samtidig ut sin veterinærmedisin-tilstøtende kompetanse gjennom et forslag om et nytt fiskevelferdsstudium fra 2027. Status er merket delvis fordi Nord ikke har et eget fakultetsstyre med separate styrepapirer for FBA; all behandling skjer i universitetsstyret sammen med resten av institusjonens portefølje, og programspesifikke søkertallsvedlegg for dyrepleie er ikke offentlig nedlastbare utover det som refereres i de samlede sakene.",
    "relevanteProgram": [
      "nord_dyrepleie"
    ]
  },
  {
    "id": "kd",
    "name": "KD/HK-dir",
    "fullName": "Kunnskapsdepartementet / Direktoratet for høyere utdanning og kompetanse",
    "enhet": "Nasjonal styring og finansiering av veterinær- og dyrepleierutdanning (dimensjonering, kandidatmåltall, tilskudd til veterinærdekning)",
    "styresider": [
      "https://www.regjeringen.no/no/dep/kd/id586/",
      "https://www.regjeringen.no/no/national-budget/2026/id3118616/"
    ],
    "status": "partial",
    "dokumenter": [
      {
        "label": "Tildelingsbrev 2026 fra Kunnskapsdepartementet til NMBU (19.12.2025, kap. om nye studieplasser og veterinærutdanning)",
        "url": "https://www.regjeringen.no/contentassets/bd39e5357ca74704a531e63be939a233/tildelingsbrev-2026-norges-miljo-og-biovitenskapelige-universitet.pdf",
        "localPath": "/markedsstatus/vet/KD_Tildelingsbrev_NMBU_2026.pdf",
        "dato": "2025-12-19",
        "storrelseMB": 0.28
      },
      {
        "label": "Den norske veterinærforening: «Statsbudsjettet 2026 – Manglende satsing på veterinærdekning og veterinærberedskap» (nettartikkel)",
        "url": "https://www.vetnett.no/nyhetsarkiv/statsbudsjettet-2026-manglende-satsing-pa-veterinaerdekning-og-veterinaerberedskap",
        "localPath": null,
        "dato": "2025-10-16",
        "storrelseMB": null
      },
      {
        "label": "NMBU: «10 nye studieplasser på veterinærstudiet fra 2025» (nettartikkel om gjeninnføring av pandemiplasser)",
        "url": "https://www.nmbu.no/fakulteter/veterinaerhogskolen/10-nye-studieplasser-pa-veterinaerstudiet-fra-2025",
        "localPath": null,
        "dato": "2024",
        "storrelseMB": null
      }
    ],
    "punkter": [
      "I tildelingsbrevet for 2026 til NMBU (19.12.2025, s. 6-7) legger departementet til grunn at veterinærutdanningen omfattes av føringen om at institusjonene skal opprettholde kapasiteten fra pandemiårene i utdanninger med vedvarende høy etterspørsel i arbeidsmarkedet. NMBU har i sitt satsingsforslag for 2027 bedt om 20 nye veterinærstudieplasser utover dagens nivå; departementet varsler «dialog i 2026 om kapasiteten i veterinærutdanningen», uten å love nye plasser i selve tildelingsbrevet.",
      "Samme tildelingsbrev (s. 6) viser at nye studieplasser innen medisin, odontologi og veterinærmedisin finansieres med en særskilt høy sats på 313 350 kr per 60-studiepoengenhet, mot en standardsats på 107 650 kr for de fleste andre fagområder (bl.a. de 155 nye sykepleieplassene og 100 nye kvanteteknologiplassene i 2026-budsjettet) — en konkret indikasjon på at veterinærutdanning regnes som vesentlig dyrere å dimensjonere opp enn de fleste andre studier.",
      "Historisk ble 20 veterinærstudieplasser innført midlertidig under pandemien (revidert nasjonalbudsjett 2020, fra 70 til 90 plasser), og kuttet igjen da den midlertidige finansieringen løp ut i 2023. Ti plasser ble gjeninnført i revidert nasjonalbudsjett 2024, og de resterende ti ble gjort varige gjennom statsbudsjettet for 2025 (NMBUs egen omtale; bekreftet i tildelingsbrevet 2026 og i fakultetsstyresakene over) — kapasiteten er dermed tilbake på 90 plasser fra og med opptaket 2025, men ikke ytterligere økt for 2026.",
      "Den norske veterinærforening reagerer i sin omtale av statsbudsjettet 2026 (16.10.2025) på at det ikke er bevilget nye veterinærstudieplasser, at statlige rekrutteringsmidler til distriktsveterinærer er kuttet fra 4 til 3 mill. kr, og at den kommunale tilskuddsordningen for veterinærdekning kun økes med 2,6 % — noe foreningen mener i praksis spises opp av prisvekst og betyr at staten fortsatt dekker under 40 % av kommunenes rapporterte behov for veterinærtilskudd."
    ],
    "oppsummering": "Nasjonalt er de 20 veterinærstudieplassene som ble kuttet etter pandemien, gjenopprettet gjennom to omganger (RNB 2024 og statsbudsjett 2025), og Kunnskapsdepartementet legger selv til grunn i tildelingsbrevet for 2026 at veterinærutdanning omfattes av kravet om å opprettholde pandemikapasitet — samtidig som departementet ikke bevilger flere plasser for 2026, kun varsler videre dialog om kapasiteten. Bransjeorganisasjonen Den norske veterinærforening omtaler 2026-budsjettet som utilstrekkelig på tvers av studieplasser, rekruttering og kommunal veterinærdekning, i en tid regjeringen selv har utpekt til «totalberedskapsår». Status er merket delvis fordi det ikke finnes ett samlet, offentlig HK-dir/KD-dokument om dimensjonering av dyrepleie spesifikt; det nasjonale bildet for dyrepleie må leses ut av Nords og NMBUs egne styresaker.",
    "relevanteProgram": [
      "nmbu_veterinaer",
      "nmbu_dyrepleie",
      "nord_dyrepleie"
    ]
  }
];
