export interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
}

export interface CourseGradeData {
  university: string;
  courseCode: string;
  grades: GradeDistribution;
  description: string;
  credits: string;
  examForm: string;
}

const UNIVERSITY_NAMES: Record<string, string> = {
  hiof: 'HiØ',
  nmbu: 'NMBU',
  uia: 'UiA',
  usn: 'USN',
  nhh: 'NHH',
  bi: 'BI',
  kristiania: 'Kristiania',
  oslomet: 'OsloMet',
  ntnu: 'NTNU',
  uit: 'UiT',
};

const MOCK_COURSE_DATA: Record<string, CourseGradeData[]> = {
  finansregnskap: [
    {
      university: 'hiof', courseCode: 'ØA100',
      grades: { A: 45, B: 67, C: 89, D: 34, E: 23, F: 12 },
      description: 'Emnet gir grunnleggende kunnskap i finansregnskap og bokføring. Studentene lærer å registrere transaksjoner, utarbeide resultatregnskap og balanse, samt gjennomføre enkel regnskapsanalyse.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'nmbu', courseCode: 'BUS110',
      grades: { A: 41, B: 74, C: 98, D: 37, E: 22, F: 13 },
      description: 'Grunnleggende finansregnskap med fokus på norsk regnskapslovgivning og god regnskapsskikk. Sentrale temaer er dobbelt bokholderi, resultatregnskap, balanse og kontantstrøm.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
    {
      university: 'uia', courseCode: 'BE-205',
      grades: { A: 42, B: 68, C: 82, D: 36, E: 21, F: 11 },
      description: 'Finansregnskap med vekt på norske regnskapsprinsipper og regnskapslovgivning. Dekker bokføring, årsavslutning og grunnleggende regnskapsanalyse.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'usn', courseCode: 'BØK1101',
      grades: { A: 39, B: 65, C: 91, D: 40, E: 25, F: 14 },
      description: 'Introduksjon til finansregnskap og regnskapsteori. Emnet dekker bokføring etter norsk standard, utarbeidelse av årsregnskap og grunnleggende analyse av regnskapstall.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
    {
      university: 'nhh', courseCode: 'REG1210',
      grades: { A: 89, B: 112, C: 78, D: 23, E: 12, F: 6 },
      description: 'Grundig innføring i finansregnskap etter norsk regnskapsstandard og IFRS. Vektlegger regnskapsteori, verdivurdering og analyse av årsregnskap.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'bi', courseCode: 'FIN1001',
      grades: { A: 71, B: 98, C: 91, D: 31, E: 15, F: 9 },
      description: 'Grunnleggende finansregnskap med vekt på regnskapsprinsipper, analyse og tolkning. Gir kunnskap om norsk regnskapslovgivning, årsregnskap og finansiell analyse.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'kristiania', courseCode: 'BØK1101',
      grades: { A: 48, B: 73, C: 88, D: 33, E: 19, F: 10 },
      description: 'Grunnleggende forståelse av finansregnskap og bokføring. Studenten lærer å utarbeide og tolke årsregnskap i henhold til norsk regnskapsstandard.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
    {
      university: 'oslomet', courseCode: 'REGNSKAP1',
      grades: { A: 52, B: 81, C: 102, D: 38, E: 19, F: 8 },
      description: 'Finansregnskap for økonomer med fokus på registrering av transaksjoner og utarbeidelse av årsregnskap. Dekker norsk regnskapslov og god regnskapsskikk.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'ntnu', courseCode: 'ØKONREG',
      grades: { A: 61, B: 93, C: 87, D: 29, E: 18, F: 12 },
      description: 'Økonomi og regnskap med fokus på grunnleggende regnskapsforståelse. Dekker bokføring, budsjettering og enkel kostnadsanalyse, tilpasset økonomi- og ingeniørstudenter.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'uit', courseCode: 'BED-1505',
      grades: { A: 38, B: 72, C: 95, D: 41, E: 28, F: 15 },
      description: 'Finansregnskap med fokus på det norske regnskapssystemet. Dekker grunnleggende bokføring, årsoppgjørsprosessen og analyse av regnskapstall.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
  ],
  okonomi1: [
    {
      university: 'hiof', courseCode: 'ØA101',
      grades: { A: 38, B: 71, C: 98, D: 42, E: 27, F: 14 },
      description: 'Introduksjon til mikro- og makroøkonomi. Emnet gir grunnleggende forståelse av markedsmekanismer, prisdannelse, nasjonaløkonomi og konjunktursvingninger.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'nmbu', courseCode: 'BUS120',
      grades: { A: 44, B: 78, C: 101, D: 36, E: 21, F: 11 },
      description: 'Grunnleggende bedriftsøkonomi med fokus på kostnadsteori, kalkulasjon og lønnsomhetsanalyse. Emnet gir verktøy for økonomisk styring av bedrifter.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'uia', courseCode: 'BE-101',
      grades: { A: 39, B: 65, C: 86, D: 39, E: 23, F: 13 },
      description: 'Innføring i bedriftsøkonomi med vekt på kostnadsanalyse, selvkostkalkulasjon og bidragskalkulasjon. Gir grunnlag for budsjettering og lønnsomhetsvurderinger.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'usn', courseCode: 'BØK1100',
      grades: { A: 36, B: 68, C: 95, D: 41, E: 26, F: 15 },
      description: 'Grunnleggende bedriftsøkonomi som dekker kostnads- og inntektsanalyse, kalkulasjonsmetoder, budsjettering og investerings- og finansieringsteori.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
    {
      university: 'nhh', courseCode: 'ECO1410',
      grades: { A: 92, B: 118, C: 81, D: 21, E: 9, F: 4 },
      description: 'Mikroøkonomisk analyse med vekt på konsument- og produsentatferd, markedslikevekt og velferdsøkonomi. Rigourøs innføring i moderne mikroøkonomisk teori.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'bi', courseCode: 'ECO1010',
      grades: { A: 67, B: 95, C: 88, D: 28, E: 17, F: 11 },
      description: 'Innføring i mikroøkonomi med fokus på markedsteori, prisdannelse og konkurranseformer. Emnet gir analytiske verktøy for å forstå og vurdere markedsmekanismer.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'kristiania', courseCode: 'BED1100',
      grades: { A: 46, B: 75, C: 90, D: 35, E: 20, F: 12 },
      description: 'Grunnleggende bedriftsøkonomi med fokus på kalkulasjon, budsjettering og lønnsomhetsanalyse. Legger grunnlag for videre studier i økonomi og ledelse.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
    {
      university: 'oslomet', courseCode: 'ECON1000',
      grades: { A: 49, B: 84, C: 106, D: 35, E: 22, F: 9 },
      description: 'Innføring i mikroøkonomi og nasjonaløkonomi. Emnet dekker grunnleggende markedsteori, prisdannelse, makroøkonomiske modeller og norsk økonomi.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'ntnu', courseCode: 'ØKAD1000',
      grades: { A: 58, B: 89, C: 94, D: 33, E: 19, F: 13 },
      description: 'Innføring i bedriftsøkonomiske analyser. Emnet dekker kalkulasjon, budsjettering, investering og finansiering, tilpasset studenter ved økonomi- og administrasjonsstudiet.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'uit', courseCode: 'BED-1010',
      grades: { A: 41, B: 68, C: 102, D: 38, E: 24, F: 17 },
      description: 'Grunnleggende bedriftsøkonomi med fokus på kostnadsteori, kalkulasjon, budsjettering og lønnsomhetsanalyse. Gir innføring i sentrale verktøy for styring av bedrifter.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
  ],
  statistikk: [
    {
      university: 'hiof', courseCode: 'ØA105',
      grades: { A: 32, B: 58, C: 87, D: 51, E: 34, F: 23 },
      description: 'Grunnleggende statistikk for økonomi- og administrasjonsstudenter. Emnet dekker deskriptiv statistikk, sannsynlighetsregning, hypotesetesting og enkel regresjonsanalyse.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'nmbu', courseCode: 'BUS230',
      grades: { A: 37, B: 63, C: 91, D: 48, E: 30, F: 18 },
      description: 'Kvantitative metoder med fokus på statistisk analyse for næringslivsapplikasjoner. Emnet dekker sannsynlighetsregning, statistisk inferens og regresjonsanalyse.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
    {
      university: 'uia', courseCode: 'BE-210',
      grades: { A: 36, B: 62, C: 83, D: 44, E: 28, F: 17 },
      description: 'Statistikk og metode for økonomi- og administrasjonsstudenter. Gir grunnleggende forståelse for kvantitative analyser, statistisk testing og bruk av statistikkverktøy.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'usn', courseCode: 'BØK2100',
      grades: { A: 33, B: 59, C: 88, D: 50, E: 32, F: 21 },
      description: 'Statistikk og metode med vekt på dataanalyse og tolkning av resultater. Emnet dekker sannsynlighetsregning, statistiske fordelinger, hypotesetesting og regresjonsanalyse.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
    {
      university: 'nhh', courseCode: 'DSC1410',
      grades: { A: 78, B: 105, C: 89, D: 31, E: 15, F: 7 },
      description: 'Statistikk og datavitenskap for økonomer. Emnet dekker statistisk teori, regresjonsanalyse og grunnleggende maskinlæring, med vekt på praktisk anvendelse.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'bi', courseCode: 'STAT1001',
      grades: { A: 59, B: 86, C: 94, D: 35, E: 21, F: 13 },
      description: 'Statistikk med vekt på næringslivsanvendelser. Emnet gir kunnskap om statistiske metoder og analyseverktøy som brukes i forskning og praksis.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'kristiania', courseCode: 'MET1100',
      grades: { A: 40, B: 66, C: 85, D: 46, E: 29, F: 16 },
      description: 'Metode og statistikk med fokus på kvantitative forskningsmetoder. Dekker datainnsamling, analyse og tolkning av statistiske resultater i en næringslivskontekst.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
    {
      university: 'oslomet', courseCode: 'STAT1000',
      grades: { A: 44, B: 73, C: 98, D: 43, E: 27, F: 15 },
      description: 'Grunnleggende statistikk for samfunnsvitenskapelige og økonomiske studier. Emnet dekker deskriptiv statistikk, sannsynlighetsregning og statistisk inferens.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'ntnu', courseCode: 'STAT1000',
      grades: { A: 51, B: 79, C: 91, D: 38, E: 25, F: 16 },
      description: 'Statistikk med anvendelser i økonomi og ledelse. Emnet dekker sannsynlighetsteori, estimering, hypotesetesting og enkel lineær regresjon.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'uit', courseCode: 'BED-1020',
      grades: { A: 35, B: 61, C: 92, D: 47, E: 31, F: 19 },
      description: 'Statistikk og metode for bedriftsøkonomer. Dekker grunnleggende sannsynlighetsteori, statistisk inferens og regresjonsanalyse med praktiske anvendelser.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
  ],
  markedsforing: [
    {
      university: 'hiof', courseCode: 'ØA110',
      grades: { A: 51, B: 79, C: 92, D: 31, E: 18, F: 9 },
      description: 'Grunnleggende markedsføring med fokus på markedsplanlegging, segmentering, målgruppevurdering og markedsføringsmiksen. Emnet gir praktisk kunnskap om markedsføring.',
      credits: '10 sp', examForm: 'Skriftlig eksamen og hjemmeeksamen',
    },
    {
      university: 'nmbu', courseCode: 'BUS140',
      grades: { A: 55, B: 82, C: 89, D: 28, E: 16, F: 8 },
      description: 'Markedsføring og forbrukeratferd med vekt på strategisk markedstenkning. Dekker markedsanalyse, merkevarebygging og digital markedsføring.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'uia', courseCode: 'BE-150',
      grades: { A: 48, B: 71, C: 86, D: 32, E: 19, F: 11 },
      description: 'Innføring i markedsføring med vekt på markedsorientering, kjøpsatferd og markedsstrategier. Emnet gir grunnlag for strategiske markedsføringsbeslutninger.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'usn', courseCode: 'MRK1200',
      grades: { A: 46, B: 70, C: 88, D: 33, E: 20, F: 12 },
      description: 'Grunnleggende markedsføring med fokus på markedsplanlegging og gjennomføring. Dekker markedssegmentering, produktutvikling, prissetting og distribusjon.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
    {
      university: 'nhh', courseCode: 'MRK1210',
      grades: { A: 95, B: 121, C: 76, D: 18, E: 8, F: 3 },
      description: 'Strategisk markedsføring med vekt på markedsanalyse, posisjonering og merkevarebygging. Emnet gir dybdekunnskap i moderne markedsføringsteori og -praksis.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'bi', courseCode: 'MAR1010',
      grades: { A: 73, B: 99, C: 85, D: 24, E: 13, F: 8 },
      description: 'Introduksjon til markedsføring med fokus på markedsplanlegging og forbrukeratferd. Emnet dekker sentrale teorier og modeller i moderne markedsføring.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'kristiania', courseCode: 'MRK1100',
      grades: { A: 57, B: 84, C: 87, D: 27, E: 16, F: 9 },
      description: 'Grunnleggende markedsføring med fokus på forbrukeratferd, merkevarebygging og digital markedsføring. Emnet er tilpasset fremtidens markedsføringslandskap.',
      credits: '10 sp', examForm: 'Skriftlig eksamen og mappe',
    },
    {
      university: 'oslomet', courseCode: 'MARK1000',
      grades: { A: 58, B: 87, C: 101, D: 29, E: 16, F: 7 },
      description: 'Introduksjon til markedsføring for økonomi- og administrasjonsstudenter. Dekker markedsplanlegging, markedsstrategier og praktisk markedsføring.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'ntnu', courseCode: 'MRK1000',
      grades: { A: 65, B: 91, C: 88, D: 26, E: 15, F: 10 },
      description: 'Markedsføring med fokus på næringslivsapplikasjoner. Emnet dekker markedsanalyse, kundeadferd og markedsstrategier med et praktisk og analytisk perspektiv.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'uit', courseCode: 'BED-1015',
      grades: { A: 47, B: 74, C: 97, D: 34, E: 21, F: 12 },
      description: 'Grunnleggende markedsføring med fokus på markedsplanlegging, markedssegmentering og markedsstrategier. Gir innføring i moderne markedstenkning.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
  ],
  organisasjon: [
    {
      university: 'hiof', courseCode: 'ØA115',
      grades: { A: 47, B: 76, C: 95, D: 36, E: 22, F: 11 },
      description: 'Organisasjonsteori og ledelse med vekt på organisasjonsformer, motivasjonsteori og ledelsesstiler. Emnet gir grunnlag for å forstå og lede moderne organisasjoner.',
      credits: '10 sp', examForm: 'Hjemmeeksamen',
    },
    {
      university: 'nmbu', courseCode: 'BUS150',
      grades: { A: 50, B: 79, C: 96, D: 33, E: 20, F: 10 },
      description: 'Organisasjon og ledelse med fokus på organisasjonsdesign, lederskap og organisasjonskultur. Emnet dekker sentrale teorier om atferd i organisasjoner.',
      credits: '10 sp', examForm: 'Skriftlig eksamen og hjemmeeksamen',
    },
    {
      university: 'uia', courseCode: 'BE-160',
      grades: { A: 45, B: 68, C: 84, D: 35, E: 21, F: 12 },
      description: 'Organisasjonsteori og ledelse med vekt på organisasjonsstruktur, motivasjon og endringsledelse. Gir forståelse for samspillet mellom individ, gruppe og organisasjon.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'usn', courseCode: 'ORG1200',
      grades: { A: 43, B: 70, C: 90, D: 37, E: 23, F: 13 },
      description: 'Organisasjon og ledelse med fokus på organisasjonsatferd, motivasjonsteori og strategisk ledelse. Dekker sentrale perspektiver på moderne organisasjoner.',
      credits: '10 sp', examForm: 'Hjemmeeksamen',
    },
    {
      university: 'nhh', courseCode: 'STR1210',
      grades: { A: 91, B: 116, C: 79, D: 20, E: 10, F: 5 },
      description: 'Strategisk ledelse og organisasjon med vekt på konkurransestrategi, organisasjonsdesign og strategisk endringsarbeid. Rigourøs innføring i strategifaget.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'bi', courseCode: 'ORG1010',
      grades: { A: 69, B: 93, C: 87, D: 26, E: 15, F: 9 },
      description: 'Organisasjonsatferd med fokus på individ, gruppe og organisasjon. Emnet dekker motivasjon, ledelse, kommunikasjon og organisasjonskultur.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'kristiania', courseCode: 'ORG1100',
      grades: { A: 52, B: 78, C: 88, D: 31, E: 18, F: 10 },
      description: 'Grunnleggende organisasjonsteori og ledelse. Dekker organisasjonsformer, motivasjonsteori, lederskap og organisasjonskultur i et moderne perspektiv.',
      credits: '10 sp', examForm: 'Mappe og muntlig eksamen',
    },
    {
      university: 'oslomet', courseCode: 'ORG1000',
      grades: { A: 54, B: 83, C: 103, D: 32, E: 19, F: 8 },
      description: 'Organisasjonsteori og ledelse med fokus på organisasjonsstrukturer, gruppearbeid og ledelsesteori. Emnet gir grunnlag for å forstå organisasjoner i praksis.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'ntnu', courseCode: 'ORG1000',
      grades: { A: 62, B: 88, C: 90, D: 28, E: 17, F: 11 },
      description: 'Organisasjon og ledelse for teknologer og økonomer. Emnet dekker organisasjonsdesign, ledelsesteori og organisasjonsatferd med praktiske eksempler.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'uit', courseCode: 'BED-1025',
      grades: { A: 43, B: 71, C: 99, D: 39, E: 25, F: 13 },
      description: 'Organisasjon og ledelse med fokus på organisasjonsformer, gruppearbeid, motivasjon og lederskap. Gir grunnleggende forståelse for atferd i organisasjoner.',
      credits: '10 sp', examForm: 'Hjemmeeksamen',
    },
  ],
  makrookonomi: [
    {
      university: 'hiof', courseCode: 'ØA201',
      grades: { A: 35, B: 64, C: 91, D: 45, E: 29, F: 16 },
      description: 'Makroøkonomisk teori og politikk med fokus på nasjonalregnskap, pengepolitikk og finanspolitikk. Emnet gir grunnlag for å analysere og forstå norsk og internasjonal økonomi.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'nmbu', courseCode: 'BUS220',
      grades: { A: 40, B: 69, C: 94, D: 43, E: 27, F: 15 },
      description: 'Makroøkonomi med fokus på nasjonaløkonomiske modeller og politikkanalyse. Dekker IS-LM-modellen, arbeidsmarked, inflasjon og langsiktig vekst.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
    {
      university: 'uia', courseCode: 'BE-220',
      grades: { A: 37, B: 63, C: 85, D: 41, E: 26, F: 15 },
      description: 'Makroøkonomisk teori med vekt på keynesianisme, monetarisme og nyere makroøkonomisk tankegang. Emnet dekker produksjon, sysselsetting, inflasjon og pengepolitikk.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'usn', courseCode: 'BØK2200',
      grades: { A: 34, B: 62, C: 88, D: 44, E: 28, F: 17 },
      description: 'Makroøkonomi med fokus på nasjonalregnskapet, konjunktursvingninger og stabiliseringspolitikk. Emnet gir verktøy for å analysere makroøkonomiske problemstillinger.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
    {
      university: 'nhh', courseCode: 'ECO2410',
      grades: { A: 85, B: 109, C: 84, D: 25, E: 11, F: 6 },
      description: 'Avansert makroøkonomisk teori med vekt på dynamiske modeller, vekstteori og internasjonal økonomi. Rigourøs behandling av moderne makroøkonomikk.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'bi', courseCode: 'ECO2010',
      grades: { A: 64, B: 89, C: 91, D: 31, E: 18, F: 12 },
      description: 'Makroøkonomi med fokus på moderne makroøkonomisk teori og politikkanalyse. Emnet dekker aggregert tilbud og etterspørsel, pengepolitikk og finanspolitikk.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'kristiania', courseCode: 'SAM1200',
      grades: { A: 42, B: 67, C: 87, D: 40, E: 24, F: 14 },
      description: 'Makroøkonomi og samfunnsøkonomi med fokus på nasjonale og internasjonale økonomiske systemer. Emnet gir forståelse for makroøkonomiske sammenhenger og politikkvirkninger.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'oslomet', courseCode: 'MAKRO1000',
      grades: { A: 46, B: 77, C: 99, D: 38, E: 23, F: 11 },
      description: 'Makroøkonomi med fokus på nasjonalregnskapet, konjunkturer, inflasjon og norsk pengepolitikk. Emnet gir grunnlag for å forstå makroøkonomiske sammenhenger.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'ntnu', courseCode: 'MAKRO1000',
      grades: { A: 55, B: 82, C: 93, D: 35, E: 21, F: 14 },
      description: 'Makroøkonomi med vekt på analytiske modeller for nasjonaløkonomien. Dekker IS-LM, Mundell-Fleming og vekstmodeller med næringslivsapplikasjoner.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'uit', courseCode: 'BED-2010',
      grades: { A: 38, B: 67, C: 95, D: 42, E: 26, F: 18 },
      description: 'Makroøkonomisk teori og politikk med fokus på konjunkturanalyse, pengepolitikk og finanspolitikk. Gir grunnlag for å forstå og analysere norsk økonomi.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
  ],
  mikrookonomi: [
    {
      university: 'hiof', courseCode: 'ØA202',
      grades: { A: 33, B: 61, C: 89, D: 47, E: 31, F: 18 },
      description: 'Mikroøkonomi med vekt på konsument- og produsentatferd, markedslikevekt og velferdsøkonomi. Emnet gir analytiske verktøy for å forstå markedsmekanismer.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'nmbu', courseCode: 'BUS221',
      grades: { A: 38, B: 64, C: 92, D: 45, E: 29, F: 17 },
      description: 'Mikroøkonomisk analyse med fokus på ressursallokering, prisdannelse og markedssvikt. Dekker konsumentteori, produksjonsteori og markedsstrukturer.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
    {
      university: 'uia', courseCode: 'BE-225',
      grades: { A: 35, B: 61, C: 83, D: 43, E: 28, F: 16 },
      description: 'Mikroøkonomisk teori med vekt på konsument og produsent, markedsformer og velferdsøkonomi. Emnet gir analytisk grunnlag for å forstå og vurdere markedsatferd.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'usn', courseCode: 'BØK2201',
      grades: { A: 32, B: 59, C: 86, D: 46, E: 30, F: 19 },
      description: 'Mikroøkonomi med fokus på markedsteori, prisdannelse og konkurranseformer. Emnet dekker konsumentteori, produksjonsteori og markedslikevekt.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
    {
      university: 'nhh', courseCode: 'ECO2420',
      grades: { A: 83, B: 107, C: 86, D: 27, E: 12, F: 7 },
      description: 'Avansert mikroøkonomisk teori med vekt på spillteori, informasjonsøkonomi og kontraktsteori. Rigourøs behandling av sentrale temaer i moderne mikroøkonomikk.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'bi', courseCode: 'ECO2020',
      grades: { A: 62, B: 87, C: 89, D: 33, E: 19, F: 13 },
      description: 'Mikroøkonomi med fokus på markedsstruktur, prissetting og strategisk atferd. Emnet gir analytisk kunnskap om markedsmekanismer og bedriftsstrategi.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'kristiania', courseCode: 'SAM1201',
      grades: { A: 39, B: 64, C: 85, D: 42, E: 26, F: 15 },
      description: 'Mikroøkonomi og markedsteori med fokus på konsument- og bedriftsatferd, markedsstrukturer og ressursallokering. Gir forståelse for mikroøkonomiske sammenhenger.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'oslomet', courseCode: 'MIKRO1000',
      grades: { A: 44, B: 75, C: 97, D: 40, E: 25, F: 13 },
      description: 'Mikroøkonomi med fokus på konsumentteori, produksjonsteori og markedslikevekt. Emnet gir analytiske verktøy for å forstå og vurdere markedsatferd.',
      credits: '10 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'ntnu', courseCode: 'MIKRO1000',
      grades: { A: 53, B: 80, C: 91, D: 37, E: 23, F: 15 },
      description: 'Mikroøkonomisk teori med vekt på analytiske modeller for konsument- og produsentatferd. Dekker markedslikevekt, markedssvikt og samfunnsøkonomisk velferd.',
      credits: '7,5 sp', examForm: 'Skriftlig eksamen',
    },
    {
      university: 'uit', courseCode: 'BED-2015',
      grades: { A: 36, B: 65, C: 93, D: 44, E: 28, F: 19 },
      description: 'Mikroøkonomisk teori og anvendelse med fokus på konsument- og produsentatferd, markedsstrukturer og velferdsøkonomisk analyse.',
      credits: '10 sp', examForm: 'Skriftlig skoleeksamen',
    },
  ],
};

export function getCourseData(courseCode: string, universities: string[]): CourseGradeData[] {
  const courseData = MOCK_COURSE_DATA[courseCode] || [];
  return courseData.filter(data => universities.includes(data.university));
}

export function getUniversityName(universityId: string): string {
  return UNIVERSITY_NAMES[universityId] || universityId;
}

export function getCourseCodeForUniversity(courseType: string, universityId: string): string {
  const courseData = MOCK_COURSE_DATA[courseType] || [];
  const found = courseData.find(d => d.university === universityId);
  return found?.courseCode || '';
}
