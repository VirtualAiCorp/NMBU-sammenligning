// GENERERT av scripts/build-landsam-course-mapping.py 2026-09-23 – ikke rediger for hånd.
// Kilde: data/landsam/emnekobling/*.json (manuelt kartlagt mot studieplanene).
export interface CourseTypeLink { entryId: string; emnekoder: string[]; merknad?: string; }
export interface CourseType { id: string; label: string; kategori?: string; desc?: string; note?: string; links: CourseTypeLink[]; }
export interface GroupCourseMapping { groupId: string; note?: string; courseTypes: CourseType[]; }

export const LANDSAM_COURSE_MAPPING: GroupCourseMapping[] = [
  {
    groupId: 'bioteknologi',
    note: 'Gruppa rommer fire utdanningstyper. NMBUs bachelor i bioteknologi, UiBs bachelor i molekylærbiologi, UiTs bachelor i bioteknologi og NTNUs treårige bioteknologibachelor i Ålesund er treårige løp; NTNUs bioteknologiprogram i Trondheim er et femårig integrert masterløp, UiOs biovitenskap er en bred biologibachelor med mange studieretninger, og OsloMets bioteknologi- og kjemiingeniør er en treårig ingeniørutdanning med eget opptaksgrunnlag. Sammenligningen er sterkest i biokjemi, cellebiologi/molekylærbiologi og generell kjemi, der alle sju programmene har obligatoriske emner på samme nivå, og svakest i matematikk, der NMBU, UiB, UiT og NTNU alle bruker brukerkurs mens OsloMet har to ingeniørmatematikkemner og UiO ikke har obligatorisk matematikk i det hele tatt. UiTs bioteknologibachelor er liten: de fleste emnene har under ti kandidater i 2024 og 2025, så koblingene for UiT er vurdert mot summen for 2021-2025 i stedet for siste år. Det samme gjelder NMBUs valgemner. To ting lar seg ikke koble: NMBUs bachelor i bioteknologi har ingen bacheloroppgave, så emnetypen «oppgave» er utelatt selv om UiT (BIO-2610), NTNU Ålesund (BTA3002) og OsloMet (KJTS3900) har den; og NMBU har ikke lenger fysikk i studieplanen (FYS100 Fysikk og natur har ingen rapporterte kandidater etter 2023), så fysikk er ikke satt opp som emnetype selv om OsloMet (MEK1400) og UiO (FYS1001) har store fysikkemner. OsloMet har ikke ex.phil; STKD6610 Technology and Society II dekker noe av det samme, men er ikke koblet fordi innholdet er et annet. Merk at NTNU-emnene i Trondheim og UiO-emnene deles med mange andre programmer, slik at kandidattallene her bare er programmets egen andel.',
    courseTypes: [
      {
        id: 'matematikk', label: 'Matematikk', kategori: 'Matematikk og statistikk',
        desc: 'Innføringsemne(r) i matematikk: funksjoner, derivasjon, integrasjon og enkle differensiallikninger, tilpasset biologi- og kjemistudenter.',
        note: 'Nivået er jevnt lavt: NMBU, UiB, UiT og NTNU bruker alle brukerkurs. OsloMet skiller seg ut med to fulle ingeniørmatematikkemner (20 sp). UiOs biovitenskap har ingen obligatorisk matematikk - MAT1050 er valgfritt og har bare ti rapporterte kandidater - og er derfor ikke koblet. NTNU Ålesund har matematikk og statistikk i ett og samme emne (BR100121), som er koblet her og ikke under statistikk.',
        links: [
          { entryId: 'nmbu_bioteknologi', emnekoder: ['MATH100-1'], merknad: 'Brukerkurs i matematikk, 10 sp; MATH121 Kalkulus er den nye, tyngre varianten og har ennå bare åtte rapporterte kandidater.' },
          { entryId: 'uib_molekylarbiologi', emnekoder: ['MAT101-0'], merknad: 'Brukerkurs i matematikk I.' },
          { entryId: 'uit_bioteknologi', emnekoder: ['MAT-0001-1'], merknad: 'Brukerkurs i matematikk.' },
          { entryId: 'ntnu_bioteknologi_alesund', emnekoder: ['BR100121-1'], merknad: 'Matematikk og statistikk i ett emne på 7,5 sp; dekker begge fagene og har derfor mindre matematikk enn de andre.' },
          { entryId: 'ntnu_bioteknologi_5aar', emnekoder: ['MA0001-1', 'MA0002-1'], merknad: 'Brukerkurs i matematikk A og B, til sammen 15 sp.' },
          { entryId: 'oslomet_ing_bioteknologi_kjemi', emnekoder: ['MEK1000-1', 'MEK2000-1'], merknad: 'Matematikk 1000 og Matematikk 2000; klart størst omfang i gruppa.' },
        ],
      },
      {
        id: 'statistikk', label: 'Statistikk', kategori: 'Matematikk og statistikk',
        desc: 'Sannsynlighetsregning, beskrivende statistikk, hypotesetesting, regresjon og forsøksplanlegging.',
        note: 'NTNU i Trondheim har mest statistikk (et brukerkurs og et påbyggingsemne rettet mot biologer). NMBUs STAT210 Forsøksplanlegging og variansanalyse er et obligatorisk valg mot STAT200 Regresjon, og begge er tatt med. NTNU Ålesund er ikke koblet her fordi statistikken deres ligger inne i matematikkemnet BR100121. OsloMets emne inneholder i tillegg risikoanalyse, som ingen av de andre har.',
        links: [
          { entryId: 'nmbu_bioteknologi', emnekoder: ['STAT100-1', 'STAT210-1', 'STAT200-1'], merknad: 'Statistikk (10 sp) og de to 5-sp-emnene Forsøksplanlegging og variansanalyse og Regresjon, der studieplanen krever minst ett av de to.' },
          { entryId: 'uib_molekylarbiologi', emnekoder: ['STAT101-0', 'STAT110-0'], merknad: 'Elementær statistikk; STAT110 Grunnkurs i statistikk er den eldre kodevarianten.' },
          { entryId: 'uit_bioteknologi', emnekoder: ['STA-0001-1'], merknad: 'Brukerkurs i statistikk 1.' },
          { entryId: 'ntnu_bioteknologi_5aar', emnekoder: ['ST0103-1', 'ST2304-1'], merknad: 'Brukerkurs i statistikk og Statistisk modellering for biologer/bioteknologer.' },
          { entryId: 'uio_biovitenskap', emnekoder: ['STK1000-1'], merknad: 'Innføring i anvendt statistikk.' },
          { entryId: 'oslomet_ing_bioteknologi_kjemi', emnekoder: ['MEK2200-1'], merknad: 'Statistikk og risikoanalyse.' },
        ],
      },
      {
        id: 'programmering', label: 'Programmering og dataanalyse', kategori: 'Programmering',
        desc: 'Innføring i programmering og databehandling, som regel i Python eller R, med vekt på beregninger og dataanalyse i biofag.',
        note: 'NMBUs STIN100 Biologisk data-analyse er et R-basert obligatorisk emne og er hovedkoblingen; INF120 Programmering og databehandling er valgfritt på bioteknologi og har få kandidater, men er tatt med fordi det er det rene programmeringsemnet. Verken UiT eller NTNU Ålesund har et obligatorisk programmeringsemne. NTNUs TDT4110 er fellesemnet for alle realfags- og teknologistudenter i Trondheim.',
        links: [
          { entryId: 'nmbu_bioteknologi', emnekoder: ['STIN100-1', 'INF120-1'], merknad: 'Biologisk data-analyse (obligatorisk, 10 sp) og Programmering og databehandling (valgfritt, få kandidater).' },
          { entryId: 'uib_molekylarbiologi', emnekoder: ['INF100-0'], merknad: 'Innføring i programmering / Programmering I.' },
          { entryId: 'ntnu_bioteknologi_5aar', emnekoder: ['TDT4110-1'], merknad: 'Informasjonsteknologi, grunnkurs.' },
          { entryId: 'uio_biovitenskap', emnekoder: ['BIOS1100-1', 'BIOS1101-1'], merknad: 'Innføring i beregningsmodeller for biovitenskap; BIOS1101 er den nye kodeversjonen fra 2025.' },
          { entryId: 'oslomet_ing_bioteknologi_kjemi', emnekoder: ['MEK1300-1', 'MEK3100-1'], merknad: 'Programmering 1 (Introduksjon til python-programmering) og Programmering 2.' },
        ],
      },
      {
        id: 'bioinformatikk', label: 'Bioinformatikk', kategori: 'Programmering',
        desc: 'Analyse av sekvens- og genomdata: databaser, alignment, fylogeni og verktøy for biologiske datasett.',
        note: 'Seks av sju programmer har et bioinformatikkemne. NTNUs BT2100 Beregningsbasert bioteknologi er et bredere beregningsemne, men er nærmeste parallell i Trondheim. OsloMet har ikke bioinformatikk i det hele tatt og er ikke koblet.',
        links: [
          { entryId: 'nmbu_bioteknologi', emnekoder: ['BIN210-1'], merknad: 'Introduksjon i bioinformatikk, 10 sp, obligatorisk i 2. år.' },
          { entryId: 'uib_molekylarbiologi', emnekoder: ['MOL204-0'], merknad: 'Anvendt bioinformatikk.' },
          { entryId: 'uit_bioteknologi', emnekoder: ['KJE-2004-1'], merknad: 'Bioinformatics - An introduction.' },
          { entryId: 'ntnu_bioteknologi_alesund', emnekoder: ['HBIOA2007-1'], merknad: 'Anvendt bioinformatikk.' },
          { entryId: 'ntnu_bioteknologi_5aar', emnekoder: ['BT2100-1'], merknad: 'Beregningsbasert bioteknologi; bredere enn de rene bioinformatikkemnene.' },
          { entryId: 'uio_biovitenskap', emnekoder: ['BIOS3010-1'], merknad: 'Bioinformatikk; ligger på 3000-nivå og er ikke obligatorisk i alle studieretninger.' },
        ],
      },
      {
        id: 'exphil', label: 'Examen philosophicum', kategori: 'Ex.phil',
        desc: 'Fellesemnet i vitenskapsfilosofi, etikk og argumentasjonslære.',
        note: 'OsloMets ingeniørutdanning har ikke ex.phil; STKD6610 Technology and Society II dekker deler av det samme, men er et annet emne og er ikke koblet. NMBU har to likeverdige varianter, og NTNU bruker samme emnekode i Trondheim og Ålesund.',
        links: [
          { entryId: 'nmbu_bioteknologi', emnekoder: ['PHI101-1', 'PHI100-1'], merknad: 'PHI101 er seminarversjonen og den mest brukte på bioteknologi; PHI100 er hovedversjonen.' },
          { entryId: 'uib_molekylarbiologi', emnekoder: ['EXPHIL-MNSEM-0'], merknad: 'Examen philosophicum - seminarmodell.' },
          { entryId: 'uit_bioteknologi', emnekoder: ['FIL-0700-1'], merknad: 'Examen philosophicum, Tromsøvarianten.' },
          { entryId: 'ntnu_bioteknologi_alesund', emnekoder: ['EXPH0300-1'] },
          { entryId: 'ntnu_bioteknologi_5aar', emnekoder: ['EXPH0300-1'], merknad: 'Examen philosophicum for naturvitenskap og teknologi.' },
          { entryId: 'uio_biovitenskap', emnekoder: ['EXPHIL03-1'] },
        ],
      },
      {
        id: 'generell-kjemi', label: 'Generell kjemi', kategori: 'Kjemi',
        desc: 'Grunnleggende kjemi: atomstruktur, binding, støkiometri, likevekt, syre-base og redoks, med laboratoriekurs.',
        note: 'Alle sju programmene har et obligatorisk innføringsemne i kjemi. NTNU i Trondheim har tre kodeversjoner i perioden (KJ1000 på 15 sp, KJ1002 på 15 sp og KJ1004 på 7,5 sp), og UiO to (KJM1002 Innføring i kjemi ble avløst av KJM1101 Generell kjemi). UiBs KJEM110 «Kjemi og energi» og UiTs KJE-1001 dekker både generell kjemi og en del fysikalsk kjemi.',
        links: [
          { entryId: 'nmbu_bioteknologi', emnekoder: ['KJM100-1'], merknad: 'Generell kjemi, 10 sp.' },
          { entryId: 'uib_molekylarbiologi', emnekoder: ['KJEM110-0'], merknad: 'Kjemi og energi.' },
          { entryId: 'uit_bioteknologi', emnekoder: ['KJE-1001-1'], merknad: 'Introduksjon til kjemi og kjemisk biologi.' },
          { entryId: 'ntnu_bioteknologi_alesund', emnekoder: ['HBIOA1004-1'], merknad: 'Generell kjemi.' },
          { entryId: 'ntnu_bioteknologi_5aar', emnekoder: ['KJ1004-1', 'KJ1002-1', 'KJ1000-1'], merknad: 'Tre kodeversjoner av generell kjemi i perioden; KJ1000 og KJ1002 er 15 sp-versjoner med laboratoriekurs, KJ1004 er 7,5 sp.' },
          { entryId: 'uio_biovitenskap', emnekoder: ['KJM1101-1', 'KJM1002-1'], merknad: 'Generell kjemi; KJM1002 Innføring i kjemi er den eldre varianten for biovitenskapsstudenter.' },
          { entryId: 'oslomet_ing_bioteknologi_kjemi', emnekoder: ['KJPE1300-1'], merknad: 'Generell kjemi.' },
        ],
      },
      {
        id: 'organisk-kjemi', label: 'Organisk kjemi', kategori: 'Kjemi',
        desc: 'Organiske forbindelsers struktur, nomenklatur, reaksjonsmekanismer og syntese.',
        note: 'UiOs biovitenskap har ikke organisk kjemi i det hele tatt og er ikke koblet. NTNUs bioteknologiprogram i Trondheim har grunnkurset uten laboratorium (KJ1021), med KJ1020 som den eldre 15 sp-versjonen med lab.',
        links: [
          { entryId: 'nmbu_bioteknologi', emnekoder: ['KJM110-1'], merknad: 'Organisk kjemi, 10 sp, obligatorisk i 2. år.' },
          { entryId: 'uib_molekylarbiologi', emnekoder: ['KJEM130-0'] },
          { entryId: 'uit_bioteknologi', emnekoder: ['KJE-1002-1'], merknad: 'Få kandidater; emnet er obligatorisk, men programmet er lite.' },
          { entryId: 'ntnu_bioteknologi_alesund', emnekoder: ['HBIOA1002-1'] },
          { entryId: 'ntnu_bioteknologi_5aar', emnekoder: ['KJ1021-1', 'KJ1020-1'], merknad: 'Organisk kjemi grunnkurs uten laboratorium; KJ1020 er den eldre 15 sp-versjonen.' },
          { entryId: 'oslomet_ing_bioteknologi_kjemi', emnekoder: ['KJM1400-1'] },
        ],
      },
      {
        id: 'biokjemi', label: 'Biokjemi', kategori: 'Kjemi',
        desc: 'Biomolekylers struktur og funksjon: proteiner, enzymer, karbohydrater, lipider, metabolisme og regulering.',
        note: 'Dette er den sterkeste koblingen i gruppa - alle sju programmene har obligatorisk biokjemi. Merk at OsloMets emnekode KJM2400 er Biokjemi, mens samme kode ved UiO er Analytisk kjemi I. UiBs MOL200 er metabolismeemnet og tilsvarer biokjemidelen. NTNU i Trondheim har dobbelt omfang (Biokjemi 1 og 2), og UiO har Biokjemi 1 på 1000-nivå og Biokjemi 2 på 3000-nivå.',
        links: [
          { entryId: 'nmbu_bioteknologi', emnekoder: ['KJB200-1', 'KJB201-1'], merknad: 'Biokjemi (10 sp) og Laboratoriekurs i biokjemi og matkjemi (5 sp).' },
          { entryId: 'uib_molekylarbiologi', emnekoder: ['MOL200-0'], merknad: 'Metabolisme; reaksjoner, regulering og kompartmentalisering.' },
          { entryId: 'uit_bioteknologi', emnekoder: ['MBI-2001-1'], merknad: 'Biokjemi.' },
          { entryId: 'ntnu_bioteknologi_alesund', emnekoder: ['HBIOA1003-1'], merknad: 'Biokjemi med cellebiologi; dekker også noe av cellebiologien.' },
          { entryId: 'ntnu_bioteknologi_5aar', emnekoder: ['TBT4102-1', 'TBT4107-1'], merknad: 'Biokjemi 1 og 2, begge obligatoriske.' },
          { entryId: 'uio_biovitenskap', emnekoder: ['BIOS1130-1', 'BIOS3900-1'], merknad: 'Biokjemi 1 og Biokjemi 2.' },
          { entryId: 'oslomet_ing_bioteknologi_kjemi', emnekoder: ['KJM2400-1'], merknad: 'OsloMets KJM2400 er emnet Biokjemi.' },
        ],
      },
      {
        id: 'cellebiologi-og-molekylaerbiologi', label: 'Cellebiologi, genetikk og molekylærbiologi', kategori: 'Biologi',
        desc: 'Cellens oppbygning og funksjon, arvelære, genstruktur og -regulering, og molekylærbiologiske metoder.',
        note: 'Alle sju har dette, men omfanget spriker mye: NMBU, UiB og UiO har tre emner hver, mens NTNU Ålesund og OsloMet har alt samlet i ett emne på 7,5-10 sp. NMBUs og UiBs laboratorieemner er tatt med fordi de er obligatoriske og utgjør en stor del av fagområdet.',
        links: [
          { entryId: 'nmbu_bioteknologi', emnekoder: ['BIO100-1', 'BIO120-1', 'BIO210-1', 'BIO211-1'], merknad: 'Cellebiologi, Genetikk, Molekylærbiologi og Laboratorieøvelser i molekylærbiologi.' },
          { entryId: 'uib_molekylarbiologi', emnekoder: ['MOL100-0', 'MOL103-0', 'MOL201-0', 'MOL102-0', 'MOL222-0', 'MOL221-0'], merknad: 'Innføring i molekylærbiologi, Genstruktur og Molekylær cellebiologi, samt de to eksperimentelle emnene; MOL221 er den gamle koden for Eksperimentell molekylærbiologi I.' },
          { entryId: 'uit_bioteknologi', emnekoder: ['MBI-1002-1', 'MBI-2011-1'], merknad: 'Celle- og molekylærbiologi og Molekylær cellebiologi - genetikk og cellesignallering.' },
          { entryId: 'ntnu_bioteknologi_alesund', emnekoder: ['HBIOA2004-1'], merknad: 'Celle- og molekylærbiologi samlet i ett emne.' },
          { entryId: 'ntnu_bioteknologi_5aar', emnekoder: ['BI1001-1', 'BI2012-1', 'BI2014-1', 'BI2015-1'], merknad: 'Celle- og molekylærbiologi (15 sp), Cellebiologi, Molekylærbiologi og laboratoriekurset.' },
          { entryId: 'uio_biovitenskap', emnekoder: ['BIOS1110-1', 'BIOS1140-1', 'BIOS2910-1', 'BIOS2900-1'], merknad: 'Celle- og molekylærbiologi, Evolusjon og genetikk og Molekylærbiologi; BIOS2900 er den eldre koden for molekylærbiologiemnet.' },
          { entryId: 'oslomet_ing_bioteknologi_kjemi', emnekoder: ['KJM3500-1'], merknad: 'Molekylær- og cellebiologi samlet i ett emne.' },
        ],
      },
      {
        id: 'mikrobiologi', label: 'Mikrobiologi', kategori: 'Biologi',
        desc: 'Mikroorganismers oppbygning, vekst, fysiologi, systematikk og økologiske og industrielle roller.',
        note: 'UiBs molekylærbiologibachelor og OsloMets ingeniørutdanning har ikke noe eget mikrobiologiemne og er ikke koblet. NMBU har størst omfang (Generell mikrobiologi I og II). UiOs BIOS3910 er et valgemne på 3000-nivå med relativt få kandidater.',
        links: [
          { entryId: 'nmbu_bioteknologi', emnekoder: ['BIO130-1', 'BIO230-1'], merknad: 'Generell mikrobiologi I og II.' },
          { entryId: 'uit_bioteknologi', emnekoder: ['BIO-1601-1', 'BIO-2601-1'], merknad: 'Innføring i mikrobiologi (5 sp) og Generell mikrobiologi (10 sp).' },
          { entryId: 'ntnu_bioteknologi_alesund', emnekoder: ['BTA1001-1', 'BTA2002-1'], merknad: 'Generell mikrobiologi og Mikrobiell økologi.' },
          { entryId: 'ntnu_bioteknologi_5aar', emnekoder: ['TBT4110-1'], merknad: 'Mikrobiologi, 7,5 sp.' },
          { entryId: 'uio_biovitenskap', emnekoder: ['BIOS3910-1'], merknad: 'Mikrobiologi; valgemne på 3000-nivå med få kandidater.' },
        ],
      },
      {
        id: 'anvendt-bioteknologi', label: 'Bioteknologiske metoder og anvendt bioteknologi', kategori: 'Biologi',
        desc: 'Bioteknologiens metoder og industrielle anvendelser: genteknologi, bioprosesser, produktutvikling og næringsliv.',
        note: 'Dette er kjernen i bioteknologiutdanningene, men ligger svært ulikt i løpene: NMBU og NTNU har innføringsemner i første studieår og påbygging senere, mens UiT og OsloMet legger emnene i tredje år. Verken UiB (molekylærbiologi) eller UiO (biovitenskap) har bioteknologiemner og er ikke koblet. NMBUs BIO235 er et næringslivsrettet emne og har ingen direkte parallell, men er tatt med fordi det er obligatorisk.',
        links: [
          { entryId: 'nmbu_bioteknologi', emnekoder: ['BIO101-1', 'BIO102-1', 'BIO235-1'], merknad: 'Introduksjon i bioteknologi og kjemi, Anvendt bioteknologi og Bioteknologi og kjemi i næringslivet.' },
          { entryId: 'uit_bioteknologi', emnekoder: ['BIO-2606-1', 'BIO-2608-1', 'BIO-1505-1'], merknad: 'Generell og marin bioteknologi, Metoder i molekylær bioteknologi og Innføring i bioteknologi.' },
          { entryId: 'ntnu_bioteknologi_alesund', emnekoder: ['BTA2004-1', 'MB301712-1'], merknad: 'Grunnleggende bioteknologi og Anvendt bioteknologi (15 sp).' },
          { entryId: 'ntnu_bioteknologi_5aar', emnekoder: ['BT1101-1', 'BT3220-1'], merknad: 'Introduksjon til bioteknologi og Videregående bioteknologi.' },
          { entryId: 'oslomet_ing_bioteknologi_kjemi', emnekoder: ['KJM3100-1', 'KJTS3100-1'], merknad: 'Bioteknologi; KJTS3100 er den gamle emnekoden, avløst av KJM3100 fra 2024.' },
        ],
      },
      {
        id: 'fysiologi-og-immunologi', label: 'Fysiologi og immunologi', kategori: 'Biologi',
        desc: 'Menneskets og dyrs organsystemer og deres funksjon, og immunsystemets oppbygning og virkemåte.',
        note: 'Bare fire av sju programmene har dette. NMBUs HFX201 Fysiologi er et valgemne med fallende kandidattall, mens BIO292 Immunsystemet, mat og helse er nytt fra 2024 og har over 25 kandidater begge år. NTNU Ålesund har begge deler obligatorisk, noe som henger sammen med at programmet også kvalifiserer for bioingeniørnære oppgaver. Verken UiB, NTNU Trondheim eller OsloMet har egne emner her.',
        links: [
          { entryId: 'nmbu_bioteknologi', emnekoder: ['BIO292-1', 'HFX201-1', 'MVI292-1'], merknad: 'Immunsystemet, mat og helse (nytt fra 2024) og Fysiologi; MVI292 er den gamle emnekoden for immunologiemnet.' },
          { entryId: 'uit_bioteknologi', emnekoder: ['BIO-2002-1'], merknad: 'Dyrefysiologi; valgemne med svært få rapporterte kandidater.' },
          { entryId: 'ntnu_bioteknologi_alesund', emnekoder: ['HBIOA1005-1', 'HBIOA2003-1'], merknad: 'Anatomi, fysiologi og histologi og Immunologi og immunologiske teknikker, begge obligatoriske.' },
          { entryId: 'uio_biovitenskap', emnekoder: ['BIOS1120-1', 'BIOS3800-1'], merknad: 'Fysiologi og Humanfysiologi.' },
        ],
      },
    ],
  },
  {
    groupId: 'bioteknologi2',
    note: 'Toårige mastere har ingen felles grunnpakke slik femårige løp har: nesten alt utenom masteroppgaven er fordypnings- eller valgemner, og de tre programmene har ulike profiler. NMBUs master i bioteknologi er bredest, med tyngdepunkt i genomikk, mikrobiologi og proteinkjemi; UiBs master i molekylærbiologi er smalere og sterkt laboratorierettet, med forsøksdyrlære som en stor obligatorisk del; NTNUs MSBIOTECH er engelskspråklig og har tyngdepunkt i molekylærgenetikk og industriell bioteknologi. Sammenligningen er derfor smalere enn i bachelorgruppene, og det er bare grunnlag for seks emnetyper. Den er sterkest i masteroppgaven, proteinkjemi/strukturbiologi og genomikk, og svakest i metodefagene, der UiBs forsøksdyrlærekurs (LAS301, LAS302, LAS303) og NMBUs statistikk- og R-emner (STIN300, STAT340, STAT210) ikke har motstykker hos de andre og derfor ikke er koblet. Det samme gjelder NMBUs masterforberedende emner BIO305 og MTH300, NTNUs BI3018 Patentering og teknologietablering og de HMS-kursene alle tre har. Omfanget er også ulikt: NMBUs og UiBs emner er 5-10 sp, NTNUs 7,5 sp, og masteroppgaven er 60 sp ved alle tre.',
    courseTypes: [
      {
        id: 'oppgave', label: 'Masteroppgave', kategori: 'Oppgave',
        desc: 'Det selvstendige avsluttende forskningsarbeidet i graden, 60 studiepoeng.',
        note: 'Alle tre har masteroppgave på 60 sp, og dette er den best rapporterte koblingen i gruppa. NTNU har to emnekoder i perioden for oppgaven ved Institutt for bioteknologi og matvitenskap; BIOTBT3901 er koden som brukes på den toårige masteren, mens BIOTBT3900 bare har enkeltkandidater her og ellers hører til det femårige løpet.',
        links: [
          { entryId: 'nmbu_bioteknologi2', emnekoder: ['M60-BIOTEK-1'], merknad: 'Masteroppgave, 60 sp; jevnt rundt 25-30 kandidater i året.' },
          { entryId: 'uib_molekylarbiologi2', emnekoder: ['MOL399-0'], merknad: 'Masteroppgave i molekylærbiologi, 60 sp.' },
          { entryId: 'ntnu_msbiotech', emnekoder: ['BIOTBT3901-1', 'BIOTBT3900-1'], merknad: 'Masteroppgave i bioteknologi ved Institutt for bioteknologi og matvitenskap; to kodeversjoner.' },
        ],
      },
      {
        id: 'proteinkjemi-og-strukturbiologi', label: 'Proteinkjemi og strukturbiologi', kategori: 'Kjemi',
        desc: 'Proteiners struktur, funksjon og karakterisering, og biopolymerenes egenskaper.',
        note: 'NMBUs KJB310 Proteinkjemi og UiBs MOL310 Strukturell molekylærbiologi er begge obligatoriske fordypningsemner og dekker mye av det samme. NTNUs TBT4135 Biopolymerer er en løsere parallell - den legger mer vekt på polysakkarider og industrielle biopolymerer enn på proteinstruktur - og er nytt med rapporterte kandidattall først fra 2024.',
        links: [
          { entryId: 'nmbu_bioteknologi2', emnekoder: ['KJB310-1'], merknad: 'Proteinkjemi, 10 sp; rundt 20 kandidater i året.' },
          { entryId: 'uib_molekylarbiologi2', emnekoder: ['MOL310-0'], merknad: 'Strukturell molekylærbiologi, 10 sp, obligatorisk.' },
          { entryId: 'ntnu_msbiotech', emnekoder: ['TBT4135-1'], merknad: 'Biopolymerer; svakere parallell, og bare rapportert fra 2024.' },
        ],
      },
      {
        id: 'eksperimentell-molekylaerbiologi', label: 'Eksperimentell molekylærbiologi og laboratoriemetoder', kategori: 'Biologi',
        desc: 'Praktisk laboratoriearbeid med molekylærbiologiske og mikrobiologiske metoder på masternivå.',
        note: 'NMBU og UiB har begge et stort praktisk metodeemne, men vinklingen er ulik: NMBUs BIO332 er mikrobiologisk, UiBs MOL300 er en bred praktisk pakke på 20 sp som er obligatorisk for alle. NTNU har ikke et tilsvarende laboratorieemne på den toårige masteren og er ikke koblet; UiBs MOL220 Teknikker, modellsystemer og aktuelle forskningstemaer er tatt med som den teoretiske metodedelen.',
        links: [
          { entryId: 'nmbu_bioteknologi2', emnekoder: ['BIO332-1'], merknad: 'Eksperimentell molekylær mikrobiologi, 10 sp.' },
          { entryId: 'uib_molekylarbiologi2', emnekoder: ['MOL300-0', 'MOL220-0'], merknad: 'Praktisk biokjemi og molekylærbiologi (20 sp, obligatorisk) og Teknikker, modellsystemer og aktuelle forskningstemaer.' },
        ],
      },
      {
        id: 'genomikk-og-molekylaergenetikk', label: 'Genomikk og molekylærgenetikk', kategori: 'Biologi',
        desc: 'Genomanalyse, funksjonell genomikk, genregulering og molekylærgenetiske metoder.',
        note: 'NMBU har klart størst omfang med tre emner i genomikkfamilien, mens NTNU har ett samlet molekylærgenetikkemne. UiBs MOL213 Utviklingsgenetikk er et lite valgemne med under fem kandidater i året og er ikke koblet; UiBs masterløp dekker genetikken inne i MOL300 og MOL310.',
        links: [
          { entryId: 'nmbu_bioteknologi2', emnekoder: ['BIO322-1', 'BIN315-1', 'BIN310-1'], merknad: 'Avanserte emner i genomikk, Utvalgte emner i funksjonell genomikk og Utvalgte emner i mikrobiell genomikk.' },
          { entryId: 'ntnu_msbiotech', emnekoder: ['TBT4146-1'], merknad: 'Molekylærgenetikk, 7,5 sp; programmets nest største emne.' },
        ],
      },
      {
        id: 'avansert-cellebiologi', label: 'Avansert cellebiologi', kategori: 'Biologi',
        desc: 'Cellulære prosesser på masternivå: signalveier, cellesyklus, transport og cellulær regulering.',
        note: 'NMBUs BIO301 og NTNUs BI3016 er de to direkte parallellene. NTNUs emne har ingen rapporterte kandidater i 2025, mens NMBUs er et valgemne som bare tilbys enkelte år (ingen kandidater i 2022 og 2023). UiB har ikke et eget avansert cellebiologiemne på masteren.',
        links: [
          { entryId: 'nmbu_bioteknologi2', emnekoder: ['BIO301-1'], merknad: 'Avansert cellebiologi, 10 sp; tilbys ikke hvert år.' },
          { entryId: 'ntnu_msbiotech', emnekoder: ['BI3016-1'], merknad: 'Molekylær cellebiologi; ingen rapporterte kandidater i 2025.' },
        ],
      },
      {
        id: 'videregaaende-bioteknologi', label: 'Videregående og anvendt bioteknologi', kategori: 'Biologi',
        desc: 'Bioteknologiens metoder og industrielle anvendelser på masternivå: genredigering, biokatalyse, bioraffinering og bioprosesser.',
        note: 'NTNUs BT3220 er det samlende fordypningsemnet i industriell bioteknologi og deles med det femårige løpet i Trondheim. NMBU har stoffet fordelt på to mindre emner, der CRISPR-emnet er det best rapporterte. UiBs MOL232 Innovasjon i industriell bioteknologi har bare åtte kandidater i ett enkelt år og er ikke koblet.',
        links: [
          { entryId: 'nmbu_bioteknologi2', emnekoder: ['BIO325-1', 'BIO335-1'], merknad: 'CRISPR Genome Editing (10 sp) og Anvendt biokatalyse og bioraffinering (5 sp).' },
          { entryId: 'ntnu_msbiotech', emnekoder: ['BT3220-1'], merknad: 'Videregående bioteknologi, 7,5 sp; deles med det femårige bioteknologiløpet.' },
        ],
      },
    ],
  },
  {
    groupId: 'kjemi',
    note: 'Gruppa er den mest homogene i KBM-materialet: fem av sju programmer er treårige realfagsbachelorer i kjemi eller biologisk kjemi, og de har i praksis den samme kjernen - generell og uorganisk kjemi, organisk kjemi, fysikalsk kjemi og analytisk kjemi. Sammenligningen er derfor sterkest i de fire klassiske kjemiemnene og i ex.phil, og svakest i matematikk og programmering, der opplegget varierer mye. NMBUs kjemibachelor er liten (typisk 10-30 kandidater per emne), så koblingene på NMBU-siden er vurdert mot summen for 2021-2025 og ikke mot siste år alene; flere NMBU-emner har under ti kandidater i enkeltår. To av programmene i gruppa er utelatt fordi DBH nesten ikke har rapportert emnekarakterer for dem: UiTs kjemibachelor (siste opptak 2024) har bare seks emner med til sammen 23 kandidater over hele perioden, og UiTs etterfølger «Bærekraftig kjemi og innovasjon» (første opptak 2025) har ingen emner rapportert. NMBUs kjemibachelor har ingen bacheloroppgave, så emnetypen «oppgave» er utelatt selv om UiO (KJM3020), UiB (KJEM299), NTNU (KJ2900) og UiS (BIOBAC) har den. Kjemiteknikk og prosessteknikk er heller ikke satt opp som emnetype fordi NMBU ikke har noe tilsvarende emne.',
    courseTypes: [
      {
        id: 'matematikk', label: 'Matematikk', kategori: 'Matematikk og statistikk',
        desc: 'Kalkulus og lineær algebra: funksjoner, grenser, derivasjon, integrasjon, rekker og differensiallikninger.',
        note: 'Nivået spriker. UiO og UiB har to emner hver (anvendelsesrettet matematikk 1 og 2 / brukerkurs I og II), NTNUs kjemibachelor bruker brukerkursene MA0001 og MA0002, mens NMBU og UiS bare har ett matematikkemne. NMBU har tre kodeversjoner i perioden: MATH100 Brukerkurs i matematikk er hovedemnet, MATH111 Kalkulus 1 er den gamle koden og MATH121 Kalkulus er den nye, tyngre varianten som studieplanen gir som alternativ til MATH100. NTNUs sivilingeniørmatematikk (TMA-emnene) forekommer med enkeltkandidater og er ikke koblet, siden kjemibachelorstudentene normalt tar brukerkursene.',
        links: [
          { entryId: 'nmbu_kjemi', emnekoder: ['MATH100-1', 'MATH121-1', 'MATH111-1'], merknad: 'Brukerkurs i matematikk, Kalkulus (ny kode) og Kalkulus 1 (gammel kode); studieplanen lar studenten velge MATH100 eller MATH121.' },
          { entryId: 'uio_kjemi_biokjemi', emnekoder: ['MAT1050-1', 'MAT1060-1', 'MAT1100-1'], merknad: 'Matematikk for anvendelser 1 og 2; MAT1100 Kalkulus er den tyngre varianten noen få tar.' },
          { entryId: 'uib_kjemi', emnekoder: ['MAT101-0', 'MAT102-0'], merknad: 'Brukerkurs i matematikk I og II.' },
          { entryId: 'ntnu_kjemi', emnekoder: ['MA0001-1', 'MA0002-1'], merknad: 'Brukerkurs i matematikk A og B.' },
          { entryId: 'uis_biologisk_kjemi', emnekoder: ['MAT100-1'], merknad: 'Matematiske metoder 1; UiS har bare ett matematikkemne.' },
        ],
      },
      {
        id: 'statistikk', label: 'Statistikk', kategori: 'Matematikk og statistikk',
        desc: 'Sannsynlighetsregning, beskrivende statistikk, hypotesetesting og regresjon.',
        note: 'Verken UiOs kjemi- og biokjemibachelor eller UiBs kjemibachelor har obligatorisk statistikk, og de har heller ingen statistikkemner med rapporterte kandidater; de er derfor ikke koblet. NMBUs STAT100 er obligatorisk i første studieår.',
        links: [
          { entryId: 'nmbu_kjemi', emnekoder: ['STAT100-1'], merknad: 'Statistikk, 10 sp, obligatorisk i 1. år.' },
          { entryId: 'ntnu_kjemi', emnekoder: ['ST0103-1'], merknad: 'Brukerkurs i statistikk.' },
          { entryId: 'uis_biologisk_kjemi', emnekoder: ['STA100-1'], merknad: 'Sannsynlighetsregning og statistikk 1.' },
        ],
      },
      {
        id: 'fysikk', label: 'Fysikk', kategori: 'Fysikk',
        desc: 'Innføringsemne i fysikk: mekanikk, varmelære og elektromagnetisme.',
        note: 'UiS\' bachelor i biologisk kjemi har ikke fysikk og er ikke koblet. NMBUs FYS100 Fysikk og natur er et bredt innføringsemne og ligger lavere enn UiBs PHYS101 Grunnkurs i mekanikk og varmelære; NMBUs tyngre FYS101 Mekanikk har bare enkeltkandidater på kjemiprogrammet, men er tatt med for fullstendighetens skyld.',
        links: [
          { entryId: 'nmbu_kjemi', emnekoder: ['FYS100-1', 'FYS101-1'], merknad: 'Fysikk og natur (obligatorisk, 10 sp) og Mekanikk (svært få kandidater).' },
          { entryId: 'uio_kjemi_biokjemi', emnekoder: ['FYS1001-1'], merknad: 'Innføring i fysikk.' },
          { entryId: 'uib_kjemi', emnekoder: ['PHYS101-0'], merknad: 'Grunnkurs i mekanikk og varmelære.' },
          { entryId: 'ntnu_kjemi', emnekoder: ['FY0001-1'], merknad: 'Brukerkurs i fysikk.' },
        ],
      },
      {
        id: 'programmering', label: 'Programmering og dataanalyse', kategori: 'Programmering',
        desc: 'Innføring i programmering, som regel i Python, med vekt på beregninger og databehandling i kjemi.',
        note: 'UiS har ikke programmering i bachelorløpet i biologisk kjemi og er ikke koblet. NMBU er det eneste programmet med to obligatoriske programmeringsemner (INF120 og INF201). UiOs emne er spesiallaget for kjemistudenter, mens NTNUs TDT4110 er fellesemnet for alle realfags- og teknologistudenter og har langt flere kandidater enn programmets egne studenter; NTNUs nye KJ2222 Dataanalyse og visualisering i kjemi er tatt med som den fagnære parallellen.',
        links: [
          { entryId: 'nmbu_kjemi', emnekoder: ['INF120-1', 'INF201-1'], merknad: 'Programmering og databehandling (10 sp) og Videregående programmering (5 sp), begge obligatoriske.' },
          { entryId: 'uio_kjemi_biokjemi', emnekoder: ['IN-KJM1900-1'], merknad: 'Introduksjon i programmering for kjemikere.' },
          { entryId: 'uib_kjemi', emnekoder: ['INF100-0'], merknad: 'Innføring i programmering.' },
          { entryId: 'ntnu_kjemi', emnekoder: ['TDT4110-1', 'KJ2222-1'], merknad: 'Informasjonsteknologi, grunnkurs, og Dataanalyse og visualisering i kjemi (nytt fra 2025).' },
        ],
      },
      {
        id: 'exphil', label: 'Examen philosophicum', kategori: 'Ex.phil',
        desc: 'Fellesemnet i vitenskapsfilosofi, etikk og argumentasjonslære.',
        note: 'Alle fem programmene har ex.phil. NMBU har tre likeverdige varianter (hovedversjon, seminarversjon og engelsk versjon), og seminarversjonen PHI101 er den mest brukte på kjemiprogrammet.',
        links: [
          { entryId: 'nmbu_kjemi', emnekoder: ['PHI101-1', 'PHI100-1', 'PHI102-1'], merknad: 'Seminarversjon, hovedversjon og engelsk versjon av samme emne.' },
          { entryId: 'uio_kjemi_biokjemi', emnekoder: ['EXPHIL03-1'] },
          { entryId: 'uib_kjemi', emnekoder: ['EXPHIL-MNSEM-0'], merknad: 'Examen philosophicum - seminarmodell.' },
          { entryId: 'ntnu_kjemi', emnekoder: ['EXPH0300-1'], merknad: 'Examen philosophicum for naturvitenskap og teknologi.' },
          { entryId: 'uis_biologisk_kjemi', emnekoder: ['HHEXPHIL-1'], merknad: 'Examen philosophicum - HH.' },
        ],
      },
      {
        id: 'generell-og-uorganisk-kjemi', label: 'Generell og uorganisk kjemi', kategori: 'Kjemi',
        desc: 'Atomstruktur, binding, støkiometri, likevekt, syre-base og redoks, samt grunnstoffenes kjemi og periodesystemet.',
        note: 'Alle fem programmene har både et generelt og et uorganisk emne, bortsett fra UiS, der KJE150 Generell kjemi er hovedemnet og KJE220 Anvendt industriell uorganisk kjemi er et mindre valgemne med få kandidater de siste årene. NTNU har tre kodeversjoner av generell kjemi i perioden (KJ1000 på 15 sp avløst av KJ1001 og KJ1003 på 7,5 sp) og to uorganiske emner (TMT4130 og påbyggingen KJ2031).',
        links: [
          { entryId: 'nmbu_kjemi', emnekoder: ['KJM100-1', 'KJM120-1'], merknad: 'Generell kjemi og Uorganisk kjemi, begge 10 sp og obligatoriske.' },
          { entryId: 'uio_kjemi_biokjemi', emnekoder: ['KJM1101-1', 'KJM1121-1'], merknad: 'Generell kjemi og Uorganisk kjemi.' },
          { entryId: 'uib_kjemi', emnekoder: ['KJEM110-0', 'KJEM120-0'], merknad: 'Kjemi og energi og Grunnstoffenes kjemi.' },
          { entryId: 'ntnu_kjemi', emnekoder: ['KJ1001-1', 'KJ1003-1', 'KJ1000-1', 'TMT4130-1', 'KJ2031-1'], merknad: 'Tre kodeversjoner av Generell kjemi, samt Uorganisk kjemi og Videregående uorganisk kjemi.' },
          { entryId: 'uis_biologisk_kjemi', emnekoder: ['KJE150-1', 'KJE220-1'], merknad: 'Generell kjemi og Anvendt industriell uorganisk kjemi; sistnevnte har få kandidater etter 2021.' },
        ],
      },
      {
        id: 'organisk-kjemi', label: 'Organisk kjemi', kategori: 'Kjemi',
        desc: 'Organiske forbindelsers struktur, nomenklatur, reaksjonsmekanismer og syntese, med laboratoriekurs.',
        note: 'Omfanget varierer: NMBU og UiB har et grunnemne pluss et påbyggingsemne, NTNU har teoriemnet og laboratoriekurset som to separate emner, mens UiO og UiS har ett emne hver. NMBUs KJM210 Utvidet organisk kjemi (20 sp) er den gamle sammenslåtte varianten og har ingen kandidater etter 2022.',
        links: [
          { entryId: 'nmbu_kjemi', emnekoder: ['KJM110-1', 'KJM211-1', 'KJM210-1'], merknad: 'Organisk kjemi (obligatorisk), Organisk kjemi II (valgemne) og den nedlagte 20 sp-varianten Utvidet organisk kjemi.' },
          { entryId: 'uio_kjemi_biokjemi', emnekoder: ['KJM1111-1'], merknad: 'Organisk kjemi I.' },
          { entryId: 'uib_kjemi', emnekoder: ['KJEM130-0', 'KJEM131-0'], merknad: 'Organisk kjemi og Organisk syntese og analyse.' },
          { entryId: 'ntnu_kjemi', emnekoder: ['KJ1021-1', 'KJ1024-1', 'KJ1020-1'], merknad: 'Organisk kjemi grunnkurs uten laboratorium og det separate laboratoriekurset; KJ1020 er den eldre 15 sp-versjonen med lab.' },
          { entryId: 'uis_biologisk_kjemi', emnekoder: ['KJE200-1'], merknad: 'Organisk kjemi 1.' },
        ],
      },
      {
        id: 'fysikalsk-kjemi', label: 'Fysikalsk kjemi', kategori: 'Kjemi',
        desc: 'Kjemisk termodynamikk, kinetikk, likevekt, molekylær struktur og spektroskopiens teoretiske grunnlag.',
        note: 'UiS\' bachelor i biologisk kjemi har ikke fysikalsk kjemi og er ikke koblet - det er den tydeligste faglige forskjellen mellom UiS og de andre programmene i gruppa. NTNU og UiB har dobbelt omfang (termodynamikk og molekylær struktur som to emner), NMBU og UiO ett hovedemne hver; UiOs KJM2601 Fysikalsk kjemi II er et valgemne med få kandidater.',
        links: [
          { entryId: 'nmbu_kjemi', emnekoder: ['KJM230-1'], merknad: 'Fysikalsk kjemi, 10 sp, obligatorisk i 2. år.' },
          { entryId: 'uio_kjemi_biokjemi', emnekoder: ['KJM1130-1', 'KJM2601-1'], merknad: 'Fysikalsk kjemi I - termodynamikk og kinetikk, og Fysikalsk kjemi II - kvantekjemi og spektroskopi.' },
          { entryId: 'uib_kjemi', emnekoder: ['KJEM210-0', 'KJEM215-0'], merknad: 'Kjemisk termodynamikk og Molekylær fysikalsk kjemi.' },
          { entryId: 'ntnu_kjemi', emnekoder: ['TKJ4162-1', 'KJ1041-1'], merknad: 'Fysikalsk kjemi: Kjemisk termodynamikk og Fysikalsk kjemi: molekylær struktur.' },
        ],
      },
      {
        id: 'analytisk-kjemi', label: 'Analytisk kjemi', kategori: 'Kjemi',
        desc: 'Kvantitativ analyse, prøvebehandling, kalibrering, kromatografi og spektroskopiske analysemetoder.',
        note: 'Alle fem har analytisk kjemi, men vinklingen er ulik: UiS\' KJE240 Analytisk miljøkjemi er miljørettet, og UiBs KJEM124 Kjemisk syntese og analyse kombinerer syntese og analyse. NMBU har bare grunnemnet KJM240 på bachelornivå; KJM310 Kromatografi ligger på masterprogrammet og er koblet der.',
        links: [
          { entryId: 'nmbu_kjemi', emnekoder: ['KJM240-1'], merknad: 'Analytisk kjemi, 10 sp, obligatorisk i 3. år.' },
          { entryId: 'uio_kjemi_biokjemi', emnekoder: ['KJM2400-1', 'KJM3400-1', 'KJM3000-1'], merknad: 'Analytisk kjemi I, Analytisk kjemi II - separasjonsmetoder og Anvendt spektroskopi.' },
          { entryId: 'uib_kjemi', emnekoder: ['KJEM250-0', 'KJEM124-0'], merknad: 'Analytisk kjemi og Kjemisk syntese og analyse.' },
          { entryId: 'ntnu_kjemi', emnekoder: ['KJ2050-1', 'KJ2053-1', 'KJ2022-1'], merknad: 'Analytisk kjemi grunnkurs, Kromatografi (Analytisk kjemi II) og Spektroskopiske metoder i organisk kjemi.' },
          { entryId: 'uis_biologisk_kjemi', emnekoder: ['KJE240-1'], merknad: 'Analytisk miljøkjemi; tydeligere miljøprofil enn de andre.' },
        ],
      },
      {
        id: 'biokjemi', label: 'Biokjemi', kategori: 'Kjemi',
        desc: 'Biomolekylers struktur og funksjon: proteiner, enzymer, karbohydrater, lipider og metabolisme.',
        note: 'UiBs kjemibachelor har ikke biokjemi - der dekkes biologidelen av MOL100 Innføring i molekylærbiologi, som er koblet under cellebiologi - og er ikke koblet her. NTNUs TBT4102 Biokjemi 1 er et valgemne på kjemibachelorprogrammet med moderate kandidattall. UiS\' BIO200 Biokjemi er obligatorisk og har flest kandidater i gruppa.',
        links: [
          { entryId: 'nmbu_kjemi', emnekoder: ['KJB200-1', 'KJB210-1', 'KJB201-1'], merknad: 'Biokjemi (obligatorisk, 10 sp), Eksperimentell og anvendt biokjemi og Laboratoriekurs i biokjemi og matkjemi.' },
          { entryId: 'uio_kjemi_biokjemi', emnekoder: ['KJM1140-1'], merknad: 'Biokjemi 1 for kjemikere.' },
          { entryId: 'ntnu_kjemi', emnekoder: ['TBT4102-1'], merknad: 'Biokjemi 1; valgemne på kjemibachelorprogrammet.' },
          { entryId: 'uis_biologisk_kjemi', emnekoder: ['BIO200-1'], merknad: 'Biokjemi, 10 sp.' },
        ],
      },
      {
        id: 'cellebiologi-og-molekylaerbiologi', label: 'Cellebiologi og molekylærbiologi', kategori: 'Biologi',
        desc: 'Cellens oppbygning og funksjon, genstruktur og -regulering, og molekylærbiologiske metoder.',
        note: 'Bare tre av fem programmer har biologi i kjemiløpet. NMBU har ett lite cellebiologiemne på 5 sp, UiB ett innføringsemne i molekylærbiologi, mens UiS - som har «biologisk kjemi» som profil - har tre emner og klart størst omfang. Verken UiOs kjemi- og biokjemibachelor eller NTNUs kjemibachelor har obligatorisk celle- eller molekylærbiologi.',
        links: [
          { entryId: 'nmbu_kjemi', emnekoder: ['BIO100-1'], merknad: 'Cellebiologi, 5 sp, obligatorisk i 1. år.' },
          { entryId: 'uib_kjemi', emnekoder: ['MOL100-0'], merknad: 'Innføring i molekylærbiologi.' },
          { entryId: 'uis_biologisk_kjemi', emnekoder: ['BIO100-1', 'BIO210-1', 'BIO230-1'], merknad: 'Cellebiologi, Metoder i bioteknologi og Molekylærgenetikk og bioinformatikk; UiS\' BIO100 har samme emnekode som NMBUs cellebiologiemne, men er et eget 10 sp-emne.' },
        ],
      },
    ],
  },
  {
    groupId: 'kjemi2',
    note: 'Dette er den tynneste gruppa i KBM-materialet. NMBUs toårige master i kjemi er svært liten - masteroppgaven M60-KJEMI har bare tre til fem kandidater i året, og ingen av programmets emner har ti kandidater i 2024 eller 2025 - så alle koblingene på NMBU-siden er vurdert mot summen for 2021-2025. UiBs kjemimaster er i praksis bare rapportert med masteroppgaven; de øvrige emnene der har tre til sju kandidater hver. Toårige mastere har heller ingen felles grunnpakke: alt utenom masteroppgaven er fordypnings- eller valgemner, og de fire programmene har ulike profiler. NMBU og UiO er tydelig analytisk innrettet (kromatografi, massespektrometri, bioanalyse), UiB er organisk-syntetisk, og NTNUs MSCHEM har tyngdepunkt i spektroskopi, kjemometri og akvatisk kjemi. Det er derfor bare grunnlag for fem emnetyper, alle innenfor analytisk kjemi og spektroskopi pluss oppgaven. Følgende lar seg ikke koble: kjemometri og dataanalyse (NTNU TKJ4175 og UiB KJEM225 har det, NMBU ikke med rapporterte kandidater), organisk syntese på masternivå (UiB KJEM232/KJEM231 og NTNU TKJ4130/TKJ4155, der NMBUs KJM312 Naturstoffkjemi bare har seks kandidater samlet), teoretisk kjemi og molekylmodellering (NTNU TKJ4205, TKJ4200), og NMBUs masterforberedende emner BIO305 og MTH300, som ingen av de andre har.',
    courseTypes: [
      {
        id: 'oppgave', label: 'Masteroppgave', kategori: 'Oppgave',
        desc: 'Det selvstendige avsluttende forskningsarbeidet i graden, 60 studiepoeng.',
        note: 'Alle fire har masteroppgave på 60 sp. NMBUs er den klart minste med tre til fem kandidater i året (20 samlet i perioden), mens UiOs har 14-19 i året. NTNUs KJ3900 har ingen rapporterte kandidater i 2023.',
        links: [
          { entryId: 'nmbu_kjemi2', emnekoder: ['M60-KJEMI-1'], merknad: 'Masteroppgave, 60 sp; 20 kandidater samlet 2021-2025.' },
          { entryId: 'uio_kjemi2', emnekoder: ['KJM5960-2'], merknad: 'Kjemi. Masteroppgave, 60 sp.' },
          { entryId: 'uib_kjemi2', emnekoder: ['KJEM399-0'], merknad: 'Masteroppgave i kjemi, 60 sp; det eneste emnet på UiB-masteren med jevn rapportering.' },
          { entryId: 'ntnu_mschem', emnekoder: ['KJ3900-1'], merknad: 'Masteroppgave i kjemi, 60 sp.' },
        ],
      },
      {
        id: 'kromatografi-og-separasjonsmetoder', label: 'Kromatografi og separasjonsmetoder', kategori: 'Kjemi',
        desc: 'Videregående separasjonsmetoder: gass- og væskekromatografi, metodeutvikling og kvantifisering.',
        note: 'NMBUs KJM310 Kromatografi er programmets fagligste kjerneemne, men tilbys ikke hvert år (ingen kandidater i 2022 og 2024). UiOs emne er rettet mot bioanalyse og livsvitenskap, NTNUs mot generell videregående kromatografi. UiB har ikke et eget kromatografiemne på masternivå og er ikke koblet.',
        links: [
          { entryId: 'nmbu_kjemi2', emnekoder: ['KJM310-1'], merknad: 'Kromatografi, 10 sp; tilbys annethvert år.' },
          { entryId: 'uio_kjemi2', emnekoder: ['KJM-FRM5055-1'], merknad: 'Bioanalytisk kjemi II: avanserte separasjonsmetoder.' },
          { entryId: 'ntnu_mschem', emnekoder: ['KJ3059-1'], merknad: 'Videregående kromatografi, 7,5 sp.' },
        ],
      },
      {
        id: 'massespektrometri', label: 'Massespektrometri', kategori: 'Kjemi',
        desc: 'Massespektrometriens prinsipper, ionisering, instrumentering og tolkning av massespektre.',
        note: 'Bare NMBU og UiO har massespektrometri som eget emne. Verken UiB eller NTNU har det frittstående - der ligger stoffet inne i NMR- og strukturoppklaringsemnene, som er koblet under spektroskopi. NMBUs KJM313 har tolv kandidater samlet i perioden og tilbys ikke hvert år.',
        links: [
          { entryId: 'nmbu_kjemi2', emnekoder: ['KJM313-1'], merknad: 'Massespektrometri, 10 sp; tilbys ikke hvert år.' },
          { entryId: 'uio_kjemi2', emnekoder: ['KJM5240-1'], merknad: 'Massespektrometri, 10 sp.' },
        ],
      },
      {
        id: 'spektroskopi-og-strukturoppklaring', label: 'Spektroskopi og strukturoppklaring', kategori: 'Kjemi',
        desc: 'NMR- og annen spektroskopi brukt til å bestemme strukturen til organiske molekyler.',
        note: 'Alle fire har spektroskopi på masternivå, men med ulik tyngde: NTNUs KJ3021 er programmets desidert største emne (14-24 kandidater i året), mens NMBUs KJM311 Organisk spektroskopi har fjorten kandidater samlet og ingen etter 2024. UiB har både et NMR-emne og et bredere strukturoppklaringsemne.',
        links: [
          { entryId: 'nmbu_kjemi2', emnekoder: ['KJM311-1'], merknad: 'Organisk spektroskopi, 10 sp; ingen rapporterte kandidater i 2025.' },
          { entryId: 'uio_kjemi2', emnekoder: ['KJM5280-1'], merknad: 'NMR spektroskopi, 5 sp.' },
          { entryId: 'uib_kjemi2', emnekoder: ['KJEM351-0', 'KJEM235-0'], merknad: 'NMR-spektroskopi og Strukturoppklaring av organiske molekyler.' },
          { entryId: 'ntnu_mschem', emnekoder: ['KJ3021-1'], merknad: 'Kjernemagnetisk resonansspektroskopi; programmets største emne.' },
        ],
      },
      {
        id: 'spesialpensum', label: 'Spesialpensum og selvstendig fordypning', kategori: 'Oppgave',
        desc: 'Individuelt tilpasset lesepensum som forberedelse til masteroppgaven.',
        note: 'Tre av fire programmer har en egen emnekode for individuelt spesialpensum, noe som er vanlig i små mastermiljøer der emneporteføljen ikke dekker alle oppgavetemaer. NMBUs og UiBs varianter er registrert med null studiepoeng i DBH, NTNUs med 7,5 sp. UiO har ikke en slik kode. Karakterene er ikke direkte sammenlignbare, siden pensum settes individuelt.',
        links: [
          { entryId: 'nmbu_kjemi2', emnekoder: ['SPE-M-KJEMI-2'], merknad: 'Spesialpensum; 18 kandidater i 2024, ingen andre år.' },
          { entryId: 'uib_kjemi2', emnekoder: ['Z-KJEM-0'], merknad: 'Spesialpensum.' },
          { entryId: 'ntnu_mschem', emnekoder: ['KJ3091-2'], merknad: 'Spesialpensum til mastergraden, 7,5 sp.' },
        ],
      },
    ],
  },
  {
    groupId: 'matteknologi',
    note: 'Gruppa har bare én reell konkurrent: NTNUs bachelor i matvitenskap, teknologi og bærekraft, som er den eneste andre matvitenskapsutdanningen på bachelornivå i Norge. Sammenligningen mot NTNU er til gjengjeld usedvanlig god - de to programmene har nesten den samme kjernen i mikrobiologi, mattrygghet, matteknologi, prosessteknologi og sensorikk. UiTs «Fiskeri- og havbruksvitenskap» ligger i samme næringskjede, men har tyngdepunkt i havbruk, fiskeri og næringsøkonomi, og er bare koblet der det finnes et reelt faglig motstykke (matematikk, statistikk, kjemi, biokjemi, sjømatproduksjon og innføringsemnet). Merk at de tre NMBU-radene i KBM-materialet - «Mat, teknologi og helse» og de to radene for «Matvitenskap og ernæring» - alle rapporteres under den samme DBH-programkoden B-MAT og derfor har identiske emnelister; koblingene er dermed like for nmbu_mat_teknologi_helse og nmbu_matvitenskap_ernaring_hist. NMBU-tallene er små og stort sett bare rapportert for 2021-2023, fordi det gamle programmet ble avviklet og det nye hadde første opptak i 2025; NMBU-siden er derfor vurdert mot summen for 2021-2025 og ikke mot siste år. Fire emnetyper lar seg ikke sette opp: NMBU har ingen rapporterte kandidater på ex.phil, ingen bacheloroppgave med egen emnekode, ingen programmerings- eller IT-emner (der NTNU har TDT4110/TDT4111), og MVI202 Matkjemi har ingen rapporterte kandidater, slik at NTNUs to store matkjemiemner (MATV1009 Matkjemi 1 og MATV2001 Matkjemi 2) står uten motstykke. NMBUs cellebiologi og genetikk (BIO100, BIO120) har ingen parallell hos NTNU i det hele tatt, og er bare grovt koblet mot UiTs marinbiologiske grunnemne.',
    courseTypes: [
      {
        id: 'matematikk', label: 'Matematikk', kategori: 'Matematikk og statistikk',
        desc: 'Innføringsemne i matematikk tilpasset biofag: funksjoner, derivasjon, integrasjon og enkle modeller.',
        note: 'Alle tre bruker brukerkurs eller anvendelsesrettede emner, så nivået er jevnt. NMBUs MATH100 har bare tre rapporterte kandidater på dette programmet, siden det nye løpet startet i 2025. UiT har tre kodeversjoner i perioden, sist BED-1301 Matematikk for økonomer fra 2025, som viser at UiT-programmet har dreid mot næringsøkonomi.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse', emnekoder: ['MATH100-1'], merknad: 'Brukerkurs i matematikk; svært få rapporterte kandidater.' },
          { entryId: 'nmbu_matvitenskap_ernaring_hist', emnekoder: ['MATH100-1'], merknad: 'Samme emne og samme tall som raden over (felles DBH-programkode B-MAT).' },
          { entryId: 'ntnu_matvitenskap', emnekoder: ['MA0001-1'], merknad: 'Brukerkurs i matematikk A.' },
          { entryId: 'uit_fiskeri_havbruk', emnekoder: ['MAT-0001-1', 'FSK-1102-1', 'BED-1301-1'], merknad: 'Brukerkurs i matematikk, det tidligere Matematikk og metode og det nye Matematikk for økonomer.' },
        ],
      },
      {
        id: 'statistikk', label: 'Statistikk', kategori: 'Matematikk og statistikk',
        desc: 'Beskrivende statistikk, hypotesetesting, regresjon og forsøksplanlegging for matfaglige data.',
        note: 'NTNU har statistikk og sensoriske metoder i ett emne, noe som gjør at MATV2002 også dekker en del av det NMBU har i MVI240 Sensorisk analyse. UiTs emne kombinerer statistikk med vitenskapelig metode.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse', emnekoder: ['STAT100-1'], merknad: 'Statistikk, 10 sp, obligatorisk i 1. år.' },
          { entryId: 'nmbu_matvitenskap_ernaring_hist', emnekoder: ['STAT100-1'], merknad: 'Samme emne og samme tall som raden over.' },
          { entryId: 'ntnu_matvitenskap', emnekoder: ['MATV2002-1'], merknad: 'Statistikk og sensoriske metoder; dekker også sensorikk.' },
          { entryId: 'uit_fiskeri_havbruk', emnekoder: ['FSK-1121-1'], merknad: 'Statistikk og metode for fiskeri- og havbruksvitenskap, 5 sp.' },
        ],
      },
      {
        id: 'innforingsemne', label: 'Innføringsemne i mat og matproduksjon', kategori: 'Ernæring og mat',
        desc: 'Innføring i matsystemet: råvarer, foredling, verdikjede, bærekraft og fagets samfunnsrolle.',
        note: 'Alle tre programmene har et bredt innføringsemne i første studieår. NMBUs MVI100 er et lite augustblokkemne på 5 sp, mens NTNUs MATV1012 og UiTs FSK-1100 er fullverdige 7,5-10 sp-emner med langt flere kandidater. NMBUs HFX133 Utfordringer for framtidas matproduksjon er tatt med fordi den dekker bærekraftsdelen.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse', emnekoder: ['MVI100-2', 'HFX133-1'], merknad: 'Introduksjon til mat, teknologi og helse og Utfordringer for framtidas matproduksjon.' },
          { entryId: 'nmbu_matvitenskap_ernaring_hist', emnekoder: ['MVI100-2', 'HFX133-1'], merknad: 'Samme emner og samme tall som raden over.' },
          { entryId: 'ntnu_matvitenskap', emnekoder: ['MATV1012-1'], merknad: 'Mat, foredlingsteknologi og bærekraft.' },
          { entryId: 'uit_fiskeri_havbruk', emnekoder: ['FSK-1100-1'], merknad: 'Fiskeri- og havbruksvitenskap; bredt innføringsemne på 10 sp.' },
        ],
      },
      {
        id: 'generell-og-organisk-kjemi', label: 'Generell og organisk kjemi', kategori: 'Kjemi',
        desc: 'Grunnleggende kjemi: binding, støkiometri, likevekt og syre-base, samt organiske forbindelsers struktur og reaksjoner.',
        note: 'NMBU er det eneste programmet med et eget organisk kjemiemne på 10 sp; NTNU og UiT har alt samlet i ett innføringsemne. UiT har to kodeversjoner i perioden, der FSK-1101 Kjemi for fiskeri- og havbruksvitenskap (5 sp) ble avløst av det bredere KJE-1001 (10 sp) fra 2023.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse', emnekoder: ['KJM100-1', 'KJM110-1'], merknad: 'Generell kjemi og Organisk kjemi, begge 10 sp.' },
          { entryId: 'nmbu_matvitenskap_ernaring_hist', emnekoder: ['KJM100-1', 'KJM110-1'], merknad: 'Samme emner og samme tall som raden over.' },
          { entryId: 'ntnu_matvitenskap', emnekoder: ['TKJE1006-1'], merknad: 'Generell kjemi, 7,5 sp; NTNU har ikke eget organisk kjemiemne på dette programmet.' },
          { entryId: 'uit_fiskeri_havbruk', emnekoder: ['KJE-1001-1', 'FSK-1101-1'], merknad: 'Introduksjon til kjemi og kjemisk biologi, og den eldre varianten Kjemi for fiskeri- og havbruksvitenskap.' },
        ],
      },
      {
        id: 'biokjemi', label: 'Biokjemi', kategori: 'Kjemi',
        desc: 'Biomolekylers struktur og funksjon: proteiner, enzymer, karbohydrater, lipider og metabolisme.',
        note: 'NMBU har et teoriemne og et eksperimentelt emne på til sammen 20 sp, NTNU ett emne på 7,5 sp. UiTs FSK-1122 dekker biokjemi og mikrobiologi i samme emne og er derfor bare delvis sammenlignbart.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse', emnekoder: ['KJB200-1', 'KJB210-1'], merknad: 'Biokjemi og Eksperimentell og anvendt biokjemi.' },
          { entryId: 'nmbu_matvitenskap_ernaring_hist', emnekoder: ['KJB200-1', 'KJB210-1'], merknad: 'Samme emner og samme tall som raden over.' },
          { entryId: 'ntnu_matvitenskap', emnekoder: ['TBT4102-1'], merknad: 'Biokjemi 1; programmets største emne målt i kandidater.' },
          { entryId: 'uit_fiskeri_havbruk', emnekoder: ['FSK-1122-1', 'FSK-2052-1'], merknad: 'Biokjemi og mikrobiologi for fiskeri- og havbruksvitenskap, og Biokjemi, integrert metabolisme og forringelse av fisk.' },
        ],
      },
      {
        id: 'mikrobiologi', label: 'Mikrobiologi og matmikrobiologi', kategori: 'Biologi',
        desc: 'Mikroorganismers oppbygning og vekst, og deres rolle i produksjon, fermentering og forringelse av mat.',
        note: 'Svært god kobling: begge programmene har både et generelt mikrobiologiemne og et rettet mot næringsmidler. NTNU har tre kodeversjoner i perioden fordi emnene ble omorganisert i 2024. UiT dekker mikrobiologi inne i FSK-1122, som er koblet under biokjemi, og er derfor ikke koblet her.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse', emnekoder: ['BIO130-1', 'MVI220-1'], merknad: 'Generell mikrobiologi I (5 sp) og Næringsmiddelmikrobiologi (10 sp).' },
          { entryId: 'nmbu_matvitenskap_ernaring_hist', emnekoder: ['BIO130-1', 'MVI220-1'], merknad: 'Samme emner og samme tall som raden over.' },
          { entryId: 'ntnu_matvitenskap', emnekoder: ['MATV1007-1', 'MATV1008-1', 'TMAT3001-A'], merknad: 'Mikrobiologi og bioteknologi, Mikrobiologi og mattrygghet (eldre kode) og Matmikrobiologi.' },
        ],
      },
      {
        id: 'mattrygghet-og-kvalitet', label: 'Mattrygghet og kvalitetsledelse', kategori: 'Ernæring og mat',
        desc: 'Hygiene, farevurdering, HACCP, regelverk og kvalitetsstyring i matproduksjon.',
        note: 'NMBUs MVI230 er et lite emne på 5 sp, mens NTNUs tilsvarende emne er på 7,5 sp og i tillegg dekker kvalitetsledelse. UiT har mattrygghet inne i sjømatproduksjonsemnene og er ikke koblet her.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse', emnekoder: ['MVI230-1'], merknad: 'Matvaretrygghet og -hygiene, 5 sp.' },
          { entryId: 'nmbu_matvitenskap_ernaring_hist', emnekoder: ['MVI230-1'], merknad: 'Samme emne og samme tall som raden over.' },
          { entryId: 'ntnu_matvitenskap', emnekoder: ['MATV3003-1', 'TMAT3003-A'], merknad: 'Mattrygghet og kvalitetsledelse; to kodeversjoner av samme emne.' },
        ],
      },
      {
        id: 'matteknologi-raavarer-og-produkter', label: 'Matteknologi: råvarer og produkter', kategori: 'Ernæring og mat',
        desc: 'Råvarenes egenskaper og foredlingen av dem til ferdige produkter - melk, kjøtt, fisk og vegetabilier.',
        note: 'Den tydeligste faglige parallellen i gruppa: begge programmene deler stoffet i en animalsk og en vegetabilsk/melkebasert del, NMBU i MVI273 og MVI274, NTNU i MATV3004 og MATV3002. NMBUs MVI275 Matplanter dekker råvaresiden på plantesiden. UiTs FSK-2041 Sjømatproduksjon er den marine parallellen.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse', emnekoder: ['MVI273-1', 'MVI274-1', 'MVI275-1'], merknad: 'Melk og melkebehandling, Muskelmat - råvare og teknologi og Matplanter, alle 10 sp.' },
          { entryId: 'nmbu_matvitenskap_ernaring_hist', emnekoder: ['MVI273-1', 'MVI274-1', 'MVI275-1'], merknad: 'Samme emner og samme tall som raden over.' },
          { entryId: 'ntnu_matvitenskap', emnekoder: ['MATV3004-1', 'MATV3002-1', 'TMAT3002-A'], merknad: 'Matteknologi - melk og vegetabiler og Matteknologi - kjøtt og fisk; TMAT3002 er den gamle sammenslåtte 15 sp-varianten.' },
          { entryId: 'uit_fiskeri_havbruk', emnekoder: ['FSK-2041-1'], merknad: 'Sjømatproduksjon; dekker bare den marine delen av råvarespekteret.' },
        ],
      },
      {
        id: 'prosessteknologi-og-emballering', label: 'Prosessteknologi og emballering', kategori: 'Ernæring og mat',
        desc: 'Enhetsoperasjoner i næringsmiddelindustrien: varmebehandling, tørking, separasjon og emballeringsteknologi.',
        note: 'NMBU har tre små emner (Prosessteknologi I og II og Emballeringsteknologi), NTNU ett samlet emne på 7,5 sp. UiT har ingen prosessteknologiemner og er ikke koblet. Emballeringsteknologi har ingen direkte parallell hos NTNU, men er tatt med fordi det er obligatorisk hos NMBU og faglig nært prosessdelen.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse', emnekoder: ['MVI261-1', 'MVI280-1', 'MVI250-1'], merknad: 'Prosessteknologi II, Prosessteknologi I og Emballeringsteknologi, alle 5 sp.' },
          { entryId: 'nmbu_matvitenskap_ernaring_hist', emnekoder: ['MVI261-1', 'MVI280-1', 'MVI250-1'], merknad: 'Samme emner og samme tall som raden over.' },
          { entryId: 'ntnu_matvitenskap', emnekoder: ['TMAT1010-A'], merknad: 'Prosessteknologi, 7,5 sp.' },
        ],
      },
      {
        id: 'sensorikk-og-produktutvikling', label: 'Sensorisk analyse og produktutvikling', kategori: 'Ernæring og mat',
        desc: 'Sensoriske metoder, forbrukertesting og utvikling av nye næringsmiddelprodukter.',
        note: 'NTNU har sensorikk og produktutvikling i ett emne med ølbrygging som gjennomgående case, mens NMBU har sensorisk analyse og ølbrygging som to separate emner. NTNUs MATV2002 Statistikk og sensoriske metoder dekker også deler av dette, men er koblet under statistikk. UiT er ikke koblet.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse', emnekoder: ['MVI240-1', 'MVI276-1'], merknad: 'Sensorisk analyse og Ølbrygging, begge 5 sp.' },
          { entryId: 'nmbu_matvitenskap_ernaring_hist', emnekoder: ['MVI240-1', 'MVI276-1'], merknad: 'Samme emner og samme tall som raden over.' },
          { entryId: 'ntnu_matvitenskap', emnekoder: ['TMAT2005-A'], merknad: 'Produktutvikling og sensorisk analyse - brygging av øl.' },
        ],
      },
      {
        id: 'ernaering-mat-og-helse', label: 'Ernæring, mat og helse', kategori: 'Ernæring og mat',
        desc: 'Næringsstoffenes funksjon, kostholdets betydning for helse og samspillet mellom mat og immunsystem.',
        note: 'NTNU har et samlet ernæringsemne på 7,5 sp, mens NMBU har stoffet fordelt på tre emner med svært ulik rapportering: MVI292 Immunsystemet, mat og helse har 32 kandidater samlet, mens MVI291 og HFE200 har tre hver. Sammenligningen bør derfor bygge på MVI292. UiT er ikke koblet.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse', emnekoder: ['MVI292-1', 'MVI291-1', 'HFE200-1'], merknad: 'Immunsystemet, mat og helse, Kosthold og helse og Generell ernæring; de to siste har svært få rapporterte kandidater.' },
          { entryId: 'nmbu_matvitenskap_ernaring_hist', emnekoder: ['MVI292-1', 'MVI291-1', 'HFE200-1'], merknad: 'Samme emner og samme tall som raden over.' },
          { entryId: 'ntnu_matvitenskap', emnekoder: ['TMAT2002-A'], merknad: 'Ernæring, 7,5 sp.' },
        ],
      },
      {
        id: 'cellebiologi-og-genetikk', label: 'Cellebiologi og genetikk', kategori: 'Biologi',
        desc: 'Cellens oppbygning og funksjon og grunnleggende arvelære.',
        note: 'Bare NMBU og UiT har biologiemner i disse løpene, og UiTs er marinbiologisk snarere enn cellebiologisk; koblingen til UiT er derfor svak og tatt med bare som en grov parallell på biologigrunnlaget. NTNUs matvitenskapsbachelor har ikke celle- eller molekylærbiologi i det hele tatt.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse', emnekoder: ['BIO100-1', 'BIO120-1'], merknad: 'Cellebiologi (5 sp) og Genetikk (10 sp).' },
          { entryId: 'nmbu_matvitenskap_ernaring_hist', emnekoder: ['BIO100-1', 'BIO120-1'], merknad: 'Samme emner og samme tall som raden over.' },
          { entryId: 'uit_fiskeri_havbruk', emnekoder: ['FSK-1120-1'], merknad: 'Akvatisk biologi for fiskeri- og havbruksvitenskap; marinbiologisk innretning, så koblingen er svak.' },
        ],
      },
    ],
  },
  {
    groupId: 'matteknologi2',
    note: 'Gruppa har bare to programmer, og de er til gjengjeld nære slektninger: NMBUs og NTNUs toårige mastere i matvitenskap dekker de samme fire kjerneområdene - mattrygghet, matmikrobiologi, næringsmiddelkjemi og prosessering/produktutvikling. Sammenligningen er likevel skjev av to grunner. For det første er masteroppgavene ulike: NMBUs M30-MAT er på 30 sp, NTNUs TMMT5003 på 45 sp. For det andre har NMBU-masteren nesten ingen rapporterte emnekarakterer etter 2022 - bare MVI393 Kjemisk mattrygghet har kandidater i 2024 - mens NTNU har jevn rapportering hele perioden. Alle koblingene på NMBU-siden er derfor vurdert mot summen for 2021-2025, og flere av NMBU-emnene har under ti kandidater samlet; det er markert på hver enkelt kobling. NTNU har dessuten lagt om emneporteføljen i 2025, slik at TMMT-kodene er avløst av MATV-koder; begge kodesettene er tatt med der de svarer til samme emne. Tre ting lar seg ikke koble: NMBUs SPE-M-MAT Spesialpensum har ingen motsvarighet hos NTNU, NTNUs store fellesemne TMMT4001 Bærekraftig matproduksjon og rammebetingelsesemnet TMMT5001 har ingen motsvarighet hos NMBU, og ingen av programmene har matematikk, statistikk eller ex.phil på masternivå.',
    courseTypes: [
      {
        id: 'oppgave', label: 'Masteroppgave', kategori: 'Oppgave',
        desc: 'Det selvstendige avsluttende arbeidet i graden.',
        note: 'Omfanget er ulikt: NMBUs masteroppgave er på 30 sp, NTNUs på 45 sp, så NMBU-studentene har tilsvarende mer emnepoeng. NMBUs M30-MAT har ingen rapporterte kandidater etter 2022, mens NTNUs har fire til ti i året gjennom hele perioden.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse2', emnekoder: ['M30-MAT-1'], merknad: 'Masteroppgave, 30 sp; 25 kandidater samlet, alle i 2021 og 2022.' },
          { entryId: 'ntnu_ftmamat', emnekoder: ['TMMT5003-A'], merknad: 'Masteroppgave i matvitenskap, teknologi og bærekraft, 45 sp.' },
        ],
      },
      {
        id: 'mattrygghet-og-risikostyring', label: 'Mattrygghet og risikostyring', kategori: 'Ernæring og mat',
        desc: 'Farevurdering, kjemisk og mikrobiologisk mattrygghet, risikoanalyse og styring av trygghet i industrielle prosesser.',
        note: 'Den best rapporterte koblingen i gruppa og den tydeligste faglige parallellen. NMBU har et prosessrettet emne (MVI395) og et kjemisk (MVI393), NTNU har trygghetsemnet og risikostyringsemnet, og har to kodeversjoner av trygghetsemnet etter omleggingen i 2025.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse2', emnekoder: ['MVI395-1', 'MVI393-1'], merknad: 'Trygghet i industrielle prosesser (10 sp) og Kjemisk mattrygghet (5 sp); MVI393 er det eneste NMBU-emnet med kandidater etter 2022.' },
          { entryId: 'ntnu_ftmamat', emnekoder: ['TMMT4006-A', 'MATV4010-1', 'TMMT4007-A'], merknad: 'Trygg matproduksjon (to kodeversjoner) og Risikostyring og mattrygghet.' },
        ],
      },
      {
        id: 'matmikrobiologi', label: 'Matmikrobiologi og patogener', kategori: 'Biologi',
        desc: 'Patogene og teknologisk viktige mikroorganismer i mat, deteksjon, vekstbetingelser og bekjempelse.',
        note: 'NMBUs MVI322 Patogene mikroorganismer er rent patogenrettet, mens NTNUs emne også dekker anvendt bioteknologi i matproduksjon og derfor er bredere. Begge emnene er små, og begge mangler rapporterte kandidater de siste årene.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse2', emnekoder: ['MVI322-1'], merknad: 'Patogene mikroorganismer, 10 sp; elleve kandidater, alle i 2021.' },
          { entryId: 'ntnu_ftmamat', emnekoder: ['TMMT4004-A'], merknad: 'Anvendt matmikrobiologi og bioteknologi; bredere enn NMBUs emne, ingen kandidater etter 2023.' },
        ],
      },
      {
        id: 'naeringsmiddelkjemi', label: 'Næringsmiddelkjemi og makronæringsstoffer', kategori: 'Kjemi',
        desc: 'Makronæringsstoffenes kjemiske struktur og funksjonelle egenskaper i matsystemer.',
        note: 'Koblingen er faglig god, men tallgrunnlaget er svakt på begge sider: NMBUs MVI310 har seks rapporterte kandidater samlet (alle i 2021), NTNUs TBT4125 21 kandidater over tre år. Emnet er obligatorisk i NMBUs studieplan, så det lave tallet skyldes at programmet nesten ikke er rapportert etter 2022.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse2', emnekoder: ['MVI310-1'], merknad: 'Makronæringsstoffer, deres struktur og funksjonalitet, 10 sp; svært få rapporterte kandidater.' },
          { entryId: 'ntnu_ftmamat', emnekoder: ['TBT4125-1'], merknad: 'Næringsmiddelkjemi, 7,5 sp; deles med bioteknologiprogrammene i Trondheim.' },
        ],
      },
      {
        id: 'prosessering-og-produktutvikling', label: 'Råvarer, prosessering og produktutvikling', kategori: 'Ernæring og mat',
        desc: 'Enhetsoperasjoner, ressursutnyttelse i matsystemer og utvikling av nye næringsmiddelprodukter.',
        note: 'Dette er den bredeste emnetypen i gruppa, og den samler flere små emner på begge sider. NMBU har egne emner for enhetsoperasjoner, produktutvikling og de enkelte råvaregruppene (kjøtt, melk, korn, alkoholholdig drikke), alle med under ti rapporterte kandidater. NTNU har færre, men større emner, med tyngdepunkt i marine råstoffer og produksjonseffektivitet.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse2', emnekoder: ['MVI361-1', 'MVI385-1', 'MVI386-1', 'MVI381-1', 'MVI274-1', 'MVI382A-1', 'MVI382B-1'], merknad: 'Enhetsoperasjoner, Produktutvikling innen næringsmidler, Meieriteknologi øvingskurs, Aktuelle problemstillinger i kjøttproduksjon, Muskelmat, Alkoholholdig drikke og Kornteknologi; alle med under ti rapporterte kandidater.' },
          { entryId: 'ntnu_ftmamat', emnekoder: ['TMMT5002-A', 'BT3110-1', 'MATV4110-1', 'MATV4004-1'], merknad: 'Produksjonseffektivitet, innovasjon og produktutvikling, Marine næringsmiddelressurser, prosessering og teknologi (to kodeversjoner) og Ressursutnyttelse i matsystemer.' },
        ],
      },
      {
        id: 'sensorikk-og-forsoeksplanlegging', label: 'Sensorisk analyse og forsøksplanlegging', kategori: 'Ernæring og mat',
        desc: 'Beskrivende sensoriske metoder, forbrukertesting og design av forsøk i matforskning.',
        note: 'NTNUs MATV4008 kombinerer sensoriske metoder og forsøksplanlegging i ett emne og er jevnt rapportert, mens NMBUs MVI340 bare har tre kandidater i 2021. Koblingen er faglig presis, men NMBU-tallet er for lite til å tolke.',
        links: [
          { entryId: 'nmbu_mat_teknologi_helse2', emnekoder: ['MVI340-1'], merknad: 'Sensorisk analyse og forbrukeraksept, 5 sp; tre kandidater i 2021, ingen senere.' },
          { entryId: 'ntnu_ftmamat', emnekoder: ['MATV4008-1'], merknad: 'Beskrivende sensoriske metoder og forsøksplanlegging.' },
        ],
      },
    ],
  },
  {
    groupId: 'matvitenskap',
    note: 'Gruppa er den vanskeligste å koble i KBM-materialet, av to grunner. For det første er NMBUs «Matvitenskap og ernæring» et matvitenskapsprogram med ernæring som én av tre studieretninger, mens UiB, UiT og UiO har rene ernæringsutdanninger - UiO til og med et femårig profesjonsstudium i klinisk ernæring. Tyngdepunktet er derfor forskjøvet: NMBU har matteknologi, prosessteknologi og sensorikk som ingen av de andre har, mens UiB, UiT og UiO har klinisk ernæring, anatomi og ernæringsbehandling som NMBU ikke har. For det andre hadde NMBU-programmet siste opptak i 2024, og DBH rapporterer knapt emnekarakterer for det etter 2023; de fleste NMBU-emnene har null kandidater i 2024 og 2025. Koblingene på NMBU-siden er derfor vurdert mot summen for 2021-2025, og flere av dem ligger under ti kandidater samlet. Det gjelder særlig ernæringsemnene, der NMBUs tall er så små at sammenligningen må leses med forbehold - dette er markert på hver enkelt kobling. Tre emnetyper lar seg ikke sette opp i det hele tatt: NMBU-programmet har ingen rapporterte kandidater på ex.phil, ingen bacheloroppgave med egen emnekode, og NMBUs kjemiemner (KJM100 Generell kjemi og KJM110 Organisk kjemi) har ingen motsvarighet hos de tre andre, som legger kjemien inn i integrerte ernærings- og biokjemimoduler. Matteknologi, prosessteknologi, emballering og sensorisk analyse finnes bare hos NMBU og er koblet i gruppen matteknologi i stedet.',
    courseTypes: [
      {
        id: 'matematikk-og-statistikk', label: 'Matematikk og statistikk', kategori: 'Matematikk og statistikk',
        desc: 'Grunnleggende matematikk og statistikk for helse- og biofag: beskrivende statistikk, hypotesetesting, regresjon og epidemiologiske mål.',
        note: 'NMBU er det eneste programmet med et eget matematikkemne; de tre andre har bare statistikk, og da i en medisinsk og epidemiologisk innramming. NMBUs tall er svært små (STAT100 har ni kandidater samlet 2021-2025, MATH100 tre), fordi programmet er under avvikling. UiOs klinisk ernæring har to kodeversjoner av statistikkemnet i perioden.',
        links: [
          { entryId: 'nmbu_matvitenskap_ernaring', emnekoder: ['STAT100-1', 'MATH100-1'], merknad: 'Statistikk og Brukerkurs i matematikk; svært få rapporterte kandidater fordi programmet er under avvikling.' },
          { entryId: 'uib_ernaring', emnekoder: ['MEDSTA-0'], merknad: 'Medisinsk statistikk, 5 sp.' },
          { entryId: 'uit_ernaring', emnekoder: ['ERN-2001-1'], merknad: 'Grunnleggende epidemiologi, statistikk og kostvurdering; 15 sp der statistikken er én av tre deler.' },
          { entryId: 'uio_klinisk_ernaring', emnekoder: ['ERN4000-1', 'ERN4110-1'], merknad: 'Statistikk; ERN4110 Statistikk for masterstudenter i ernæring er den eldre kodeversjonen.' },
        ],
      },
      {
        id: 'innforingsemne', label: 'Innføringsemne i mat og ernæring', kategori: 'Ernæring og mat',
        desc: 'Første emne i studiet: fagfeltets innhold, arbeidsmåter og samfunnsrolle.',
        note: 'Koblingen er strukturell mer enn faglig: alle fire har et innføringsemne i første semester, men innholdet er forskjellig. NMBUs MVI100 handler om matvitenskap og matproduksjon, mens UiB, UiT og UiO introduserer klinisk ernæring og ernæringsfaget. Karaktersnittene bør derfor ikke leses som en sammenligning av samme pensum. NMBUs MVI100-2 er kodeversjonen fra 2025 og har elleve kandidater.',
        links: [
          { entryId: 'nmbu_matvitenskap_ernaring', emnekoder: ['MVI100-2'], merknad: 'Introduksjon til mat, teknologi og helse (tidligere Introduksjon til matvitenskap).' },
          { entryId: 'uib_ernaring', emnekoder: ['NUTR100-0'], merknad: 'Innføring i klinisk ernæring, 10 sp.' },
          { entryId: 'uit_ernaring', emnekoder: ['ERN-1000-1'], merknad: 'Ernæring, individ og samfunn.' },
          { entryId: 'uio_klinisk_ernaring', emnekoder: ['ERN1010-1', 'ERN1100-1'], merknad: 'Innføring i klinisk ernæring (30 sp) og Ernæringsstudiet, Modul 1 (50 sp); begge er store integrerte moduler uten parallell i de andre programmene.' },
        ],
      },
      {
        id: 'biokjemi', label: 'Biokjemi', kategori: 'Kjemi',
        desc: 'Biomolekylers struktur og funksjon: proteiner, enzymer, karbohydrater, lipider og metabolisme.',
        note: 'Dette er den sterkeste faglige koblingen i gruppa. NMBU har et teoriemne og et eksperimentelt emne, UiB har både et generelt biokjemiemne og et ernæringsrettet, mens UiO har biokjemien inne i en stor integrert modul sammen med fysiologi og ernæring, slik at karaktersnittet der ikke bare måler biokjemi.',
        links: [
          { entryId: 'nmbu_matvitenskap_ernaring', emnekoder: ['KJB200-1', 'KJB210-1'], merknad: 'Biokjemi og Eksperimentell og anvendt biokjemi, begge 10 sp.' },
          { entryId: 'uib_ernaring', emnekoder: ['FARM150-0', 'NUTR115-0'], merknad: 'Biokjemi og Ernæringsbiokjemi.' },
          { entryId: 'uit_ernaring', emnekoder: ['MBI-2001-1'], merknad: 'Biokjemi, 10 sp.' },
          { entryId: 'uio_klinisk_ernaring', emnekoder: ['ERN2200R-1'], merknad: 'Fysiologi, ernæring og medisinsk biokjemi; en integrert modul på 24 sp der biokjemi er én av tre deler.' },
        ],
      },
      {
        id: 'cellebiologi-og-genetikk', label: 'Cellebiologi og genetikk', kategori: 'Biologi',
        desc: 'Cellens oppbygning og funksjon, arvelære og molekylærbiologiske grunnbegreper.',
        note: 'UiOs klinisk ernæring har ikke et frittstående celle- eller molekylærbiologiemne - stoffet ligger inne i de store integrerte modulene - og er ikke koblet. NMBUs to emner har begge seksten kandidater samlet i perioden.',
        links: [
          { entryId: 'nmbu_matvitenskap_ernaring', emnekoder: ['BIO100-1', 'BIO120-1'], merknad: 'Cellebiologi (5 sp) og Genetikk (10 sp).' },
          { entryId: 'uib_ernaring', emnekoder: ['FARM260-0'], merknad: 'Molekylær cellebiologi, 10 sp.' },
          { entryId: 'uit_ernaring', emnekoder: ['MBI-1002-1'], merknad: 'Celle- og molekylærbiologi, 15 sp.' },
        ],
      },
      {
        id: 'mikrobiologi', label: 'Mikrobiologi', kategori: 'Biologi',
        desc: 'Mikroorganismers oppbygning, vekst og betydning, med vekt på mikroorganismer i mat.',
        note: 'Bare NMBU og UiT har egne mikrobiologiemner; UiB og UiO har ikke mikrobiologi som frittstående emne og er ikke koblet. NMBU har klart størst omfang, med et generelt emne og et rettet mot næringsmidler, mens UiTs emner er små og bare rapportert for 2021 og 2022.',
        links: [
          { entryId: 'nmbu_matvitenskap_ernaring', emnekoder: ['BIO130-1', 'MVI220-1'], merknad: 'Generell mikrobiologi I (5 sp) og Næringsmiddelmikrobiologi (10 sp).' },
          { entryId: 'uit_ernaring', emnekoder: ['BIO-1601-1', 'ERN-2003-1'], merknad: 'Innføring i mikrobiologi og Immunologi, farmakologi, epigenetikk og mikrobiologi; i sistnevnte er mikrobiologi bare én av fire deler.' },
        ],
      },
      {
        id: 'matvarekunnskap-og-mattrygghet', label: 'Matvarekunnskap og mattrygghet', kategori: 'Ernæring og mat',
        desc: 'Matvaregrupper, sammensetning og kvalitet, hygiene, fremmedstoffer og regelverk for trygg mat.',
        note: 'UiOs klinisk ernæring har ikke et eget matvarekunnskapsemne og er ikke koblet. UiB dekker matvarekunnskap i NUTR150 og fremmedstoffer i toksikologiemnet, som har to kodeversjoner i perioden. NMBUs MVI230 er hygiene- og regelverksemnet.',
        links: [
          { entryId: 'nmbu_matvitenskap_ernaring', emnekoder: ['MVI230-1'], merknad: 'Matvaretrygghet og -hygiene, 5 sp.' },
          { entryId: 'uib_ernaring', emnekoder: ['NUTR150-0', 'BIO307A-0', 'BIO209A-0'], merknad: 'Matvarekunnskap og Næringsmiddeltoksikologi; BIO209A og BIO307A er to kodeversjoner av toksikologiemnet.' },
          { entryId: 'uit_ernaring', emnekoder: ['ERN-2005-1', 'ERN-1001-1'], merknad: 'Matvarekunnskap og matvaretrygghet; to kodeversjoner av samme emne.' },
        ],
      },
      {
        id: 'ernaering-naeringsstoffer-og-kosthold', label: 'Ernæring: næringsstoffer og kosthold', kategori: 'Ernæring og mat',
        desc: 'Makro- og mikronæringsstoffenes funksjon og omsetning, energibehov, kostholdsanbefalinger og kostholdsvurdering.',
        note: 'Dette er kjernefaget i gruppa, men også den svakeste koblingen på NMBU-siden: NMBUs ernæringsemner har bare tre til seks rapporterte kandidater hver i hele perioden 2021-2025, fordi ernæringsretningen var den minste av de tre studieretningene i et program som nå er lagt ned. Tallene fra NMBU bør derfor ikke brukes til å trekke slutninger. UiB, UiT og UiO har alle store obligatoriske emner her, UiO i form av integrerte moduler på 23-30 sp.',
        links: [
          { entryId: 'nmbu_matvitenskap_ernaring', emnekoder: ['HFE200-1', 'MVI291-1', 'MVI201-1'], merknad: 'Generell ernæring, Kosthold og helse og Introduksjon i humane intervensjoner; alle tre har under ti rapporterte kandidater samlet i perioden.' },
          { entryId: 'uib_ernaring', emnekoder: ['NUTR203-0', 'NUTR204-0', 'NUTR244-0'], merknad: 'Ernæringsfysiologi - makronæringsstoffer og mikronæringsstoffer, samt Ernæring og helse på individ- og samfunnsnivå.' },
          { entryId: 'uit_ernaring', emnekoder: ['ERN-2004-1', 'ERN-2011-1', 'ERN-2012-1'], merknad: 'Ernæring, makro- og mikronæringsstoffer (25 sp); ERN-2011 Makronæringsstoffer og energi og ERN-2012 Mikronæringsstoffer er den nye oppdelingen fra 2025.' },
          { entryId: 'uio_klinisk_ernaring', emnekoder: ['ERN2300-1', 'ERN3010-1', 'ERN3000-1'], merknad: 'Mikronæringsstoffer og fremmedstoffer, Metabolisme og livsstilssykdommer og Metoder for å kartlegge kosthold og energiforbruk.' },
        ],
      },
      {
        id: 'immunologi-mat-og-helse', label: 'Immunologi, mat og helse', kategori: 'Ernæring og mat',
        desc: 'Immunsystemets oppbygning og virkemåte, og samspillet mellom kosthold, tarmflora og helse.',
        note: 'Bare NMBU og UiT har immunologi som eget emne i ernæringsløpet. NMBUs MVI292 er det best rapporterte ernæringsnære emnet i programmet (32 kandidater samlet), og er senere videreført som BIO292 på bioteknologiprogrammet. UiTs emne dekker immunologi sammen med farmakologi, epigenetikk og mikrobiologi. UiB og UiO har ikke tilsvarende frittstående emner.',
        links: [
          { entryId: 'nmbu_matvitenskap_ernaring', emnekoder: ['MVI292-1'], merknad: 'Immunsystemet, mat og helse, 10 sp.' },
          { entryId: 'uit_ernaring', emnekoder: ['ERN-2003-1'], merknad: 'Immunologi, farmakologi, epigenetikk og mikrobiologi, 5 sp.' },
        ],
      },
    ],
  },
];
