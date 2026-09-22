// GENERERT av scripts/build-landsam-course-mapping.py 2026-09-23 – ikke rediger for hånd.
// Kilde: data/landsam/emnekobling/*.json (manuelt kartlagt mot studieplanene).
export interface CourseTypeLink { entryId: string; emnekoder: string[]; merknad?: string; }
export interface CourseType { id: string; label: string; kategori?: string; desc?: string; note?: string; links: CourseTypeLink[]; }
export interface GroupCourseMapping { groupId: string; note?: string; courseTypes: CourseType[]; }

export const LANDSAM_COURSE_MAPPING: GroupCourseMapping[] = [
  {
    groupId: 'fornybar2',
    note: 'Den viktigste forskjellen i denne gruppen er at NMBUs master er tverrfaglig og bygd på realfag kombinert med økonomi og samfunnsfag, mens UiA, NTNU og HVL er sivilingeniørutdanninger og UiO ligger et sted imellom. Det slår rett ut i emnekoblingene: NMBU har ingen emner i kraftsystem, kraftelektronikk eller elektriske maskiner, og UiAs og UiOs emner på dette feltet (ENE411 Power Systems Dynamics, ENE505 Power Electronics, ENE506 Smartgrid Systems, MAS409 Elektriske motordrifter, TEK5370 Grid, smartgrid og IoT) er derfor ikke koblet. Motsatt har NMBU økonomi- og forvaltningsemner som de tekniske programmene mangler, og NTNUs bygningsenergiemner (TEP4235, TEP4260, TEP4255) og HVLs forbrenning- og CFD-emner har heller ingen motstykker. NMBU la om emnekodene rundt 2023, fra FORN- til FORNY-serien; begge kodesettene er tatt med der emnene svarer til hverandre. NTNUs «Bærekraftig energi» har svært tynne data: ingen rapporterte kandidater i 2025 og bare noen få i 2024, så alle koblingene dit hviler på summen for 2021-2025. Terskelen for å ta med et emne er derfor satt til minst ti kandidater samlet i perioden 2021-2025 for alle programmene i gruppen. NMBUs BUS230 Operasjonsanalyse og HMS-kursene uten studiepoeng (ORG001) er ikke koblet.',
    courseTypes: [
      {
        id: 'energisystemanalyse', label: 'Energisystemanalyse og modellering', kategori: 'Energi',
        desc: 'Modellering, simulering og scenarioanalyse av energisystemer: energibalanser, systemgrenser og hvordan produksjon, lagring og forbruk spiller sammen.',
        note: 'HVL har ikke noe eget systemanalyseemne; der ligger systemperspektivet innbakt i MAS502 Energy resources & conversion devices og MAS520 Design for Sustainable Energy Technology.',
        links: [
          { entryId: 'nmbu_fornybar2', emnekoder: ['FORNY360-1', 'FORN330-1', 'FORNY260-1'], merknad: 'Analyser av fornybare energisystemer (10 sp); FORNY360 erstattet FORN330 fra 2023' },
          { entryId: 'uio_fornybare_energisystemer2', emnekoder: ['TEK5340-1'], merknad: 'Energisystemanalyse: modellering, metoder og scenarioer, 10 sp' },
          { entryId: 'uia_fornybar2', emnekoder: ['ENE418-G'], merknad: 'Data Analysis and Modelling Techniques in Renewable Energy, 7,5 sp' },
          { entryId: 'ntnu_baerekraftig_energi2', emnekoder: ['TEP4240-1'], merknad: 'Systemsimulering, 7,5 sp; siste rapporterte kandidater i 2024' },
        ],
      },
      {
        id: 'energiokonomi', label: 'Energiøkonomi og energimarkeder', kategori: 'Økonomi',
        desc: 'Kraft- og energimarkedenes virkemåte, regulering og energipolitikk, samt prosjekt- og investeringsanalyse og klima- og ressursøkonomi.',
        note: 'Dette er NMBUs faglige tyngdepunkt i gruppen, med sju emner fordelt på flere fagmiljøer, men hvert enkelt emne har få kandidater. UiAs IND417 er et generelt bedriftsøkonomiemne og ikke et energiøkonomiemne, og er tatt med som en svakere kobling.',
        links: [
          { entryId: 'nmbu_fornybar2', emnekoder: ['MINA330-1', 'ECN372-1', 'ECN280-1', 'ECN380-1', 'ECN170-1', 'FORN230-1', 'RØP330-1'], merknad: 'MINA330 Prosjektøkonomi for fornybar energi og skogbruk (10 sp) er det største; ECN-emnene dekker energi-, klima- og ressursøkonomi' },
          { entryId: 'uio_fornybare_energisystemer2', emnekoder: ['TEK5350-1', 'TEK5410-1', 'TEK5420-1'], merknad: 'Energimarkeder og regulering (10 sp) + to 5 sp-emner om modellering av kraftsystemet og norsk energiomstilling' },
          { entryId: 'uia_fornybar2', emnekoder: ['IND417-G'], merknad: 'Bedriftsøkonomisk analyse 1, 7,5 sp; generelt økonomiemne, ikke energispesifikt' },
          { entryId: 'ntnu_baerekraftig_energi2', emnekoder: ['TIØ4585-1', 'TET4185-1'], merknad: 'Energimarkedsdesign og -politikk + Kraftmarkeder, ressurs og miljø, 7,5 sp hver; få kandidater' },
          { entryId: 'hvl_energiteknologi2', emnekoder: ['MAS504-1'], merknad: 'Energiøkonomi, 10 sp' },
        ],
      },
      {
        id: 'solenergi', label: 'Solenergi', kategori: 'Energi',
        desc: 'Solressursen, solcelleteknologi og dimensjonering og lønnsomhet for solenergianlegg.',
        note: 'NTNU og HVL har ingen frittstående solenergiemner med rapporterte karakterer på disse programmene. Vinklingen er ulik: NMBU legger vekt på ressursgrunnlag og lønnsomhet, mens UiA og UiO går dypere inn i selve celleteknologien.',
        links: [
          { entryId: 'nmbu_fornybar2', emnekoder: ['FORNY305-1', 'FORN360-1'], merknad: 'Solenergi - ressursgrunnlag, lønnsomhet og valg av løsninger (10 sp); FORNY305 erstattet FORN360 fra 2023' },
          { entryId: 'uio_fornybare_energisystemer2', emnekoder: ['TEK5330-1', 'TEK5310-1'], merknad: 'Solenergisystemer (10 sp) + Solceller (10 sp)' },
          { entryId: 'uia_fornybar2', emnekoder: ['ENE419-G'], merknad: 'Solar Cell Technology and Applications, 7,5 sp' },
        ],
      },
      {
        id: 'vind-og-vannkraft', label: 'Vind- og vannkraft', kategori: 'Energi',
        desc: 'Vind- og vannressurser, turbinteknologi, strømningslære og utbygging av vind- og vannkraftanlegg.',
        note: 'Bare NMBU og UiA har emner på feltet. NMBU dekker vind og vann i ett emne med vekt på ressursgrunnlag og lønnsomhet, mens UiA har ett teknisk emne for hver av dem. UiO, NTNU og HVL har ingen tilsvarende emner med rapporterte karakterer.',
        links: [
          { entryId: 'nmbu_fornybar2', emnekoder: ['FORNY300-1', 'FORN300-1'], merknad: 'Vind- og vannkraft - ressurs, teknologi og energi (10 sp); FORNY300 erstattet FORN300 fra 2023' },
          { entryId: 'uia_fornybar2', emnekoder: ['ENE416-G', 'ENE410-G'], merknad: 'Wind Energy + Fluid Dynamics and Hydro Power, 7,5 sp hver' },
        ],
      },
      {
        id: 'bioenergi', label: 'Bioenergi og biodrivstoff', kategori: 'Energi',
        desc: 'Biomasse som energiressurs, konvertering til varme, kraft og drivstoff, og bærekraft og marked for bioenergi.',
        note: 'Bioenergi er et NMBU-særtrekk, knyttet til skog- og bioøkonomimiljøet på Ås. HVLs emne er det eneste sammenlignbare, og det er nytt med få kandidater. UiO, UiA og NTNU har ingen bioenergiemner på disse programmene.',
        links: [
          { entryId: 'nmbu_fornybar2', emnekoder: ['FORNY310-1', 'FORN310-1'], merknad: 'Bioenergi - marked og bærekraft; FORNY310 (5 sp) erstattet FORN310 (10 sp) fra 2023 og er smalere enn forgjengeren' },
          { entryId: 'hvl_energiteknologi2', emnekoder: ['MAS531-1'], merknad: 'Bio- and E-fuels, 10 sp; få kandidater' },
        ],
      },
      {
        id: 'energilagring', label: 'Energilagring, batterier og hydrogen', kategori: 'Energi',
        desc: 'Lagring og distribusjon av energi: batteriteknologi og elektrokjemi, hydrogen og brenselceller, og hvordan lagring bygges inn i energisystemet.',
        note: 'NMBUs emne er et systememne om distribusjon og lagring og går ikke inn i elektrokjemien, mens de tre andre har egne emner om batterier og hydrogen hver for seg. NMBU hadde siste kandidater på lagringsemnet i 2023, og emnet er ikke videreført i FORNY-serien.',
        links: [
          { entryId: 'nmbu_fornybar2', emnekoder: ['FORN240-1', 'FORNY240-1'], merknad: 'Energidistribusjon- og -lagringssystemer, 5 sp; siste kandidater i 2023' },
          { entryId: 'uio_fornybare_energisystemer2', emnekoder: ['TEK5440-1', 'TEK5320-1', 'TEK5390-1'], merknad: 'Batterier: teknologi og systemer, Batteriteknologi og Hydrogenteknologi, 10 sp hver' },
          { entryId: 'uia_fornybar2', emnekoder: ['ENE417-G', 'ENE423-G', 'ENE422-G'], merknad: 'Hydrogen and Fuel Cell Technologies, Batterisystemer og Batterielektrokjemi, 7,5 sp hver' },
          { entryId: 'hvl_energiteknologi2', emnekoder: ['MAS534-1', 'MAS539-1'], merknad: 'Electrochemistry for Batteries, Electrolyzers and Fuel Cell Systems + Hydrogenteknologi, 10 sp hver' },
        ],
      },
      {
        id: 'baerekraftsanalyse', label: 'Bærekraftsanalyse og livsløpsvurdering', kategori: 'Miljø',
        desc: 'Livsløpsvurdering (LCA), sirkulær økonomi, miljøledelse og bærekraftsrapportering for energi- og materialsystemer.',
        note: 'NMBUs LCA-emne FORN220 hadde siste kandidater i 2023 og er ikke erstattet; i dag dekkes feltet av bærekraftsrapportering (BUS311) og avfalls- og kretsløpsemnet FORNY320. UiAs to emner har få kandidater.',
        links: [
          { entryId: 'nmbu_fornybar2', emnekoder: ['BUS311-1', 'FORNY320-1', 'FORN220-1'], merknad: 'Miljøledelse og bærekraftrapportering (5 sp), Ressurser i kretsløp (5 sp) og Livsløpsvurdering (10 sp, avviklet)' },
          { entryId: 'uia_fornybar2', emnekoder: ['BYG404-G', 'ING402-1'], merknad: 'Livsløpsanalyse av konstruksjoner + Circular economy and eco-design, 7,5 sp hver; få kandidater' },
          { entryId: 'ntnu_baerekraftig_energi2', emnekoder: ['TEP4223-1'], merknad: 'Livssyklusanalyse, 7,5 sp; emnet deles med NTNUs master i industriell økologi' },
          { entryId: 'hvl_energiteknologi2', emnekoder: ['MAS503-1'], merknad: 'Innføring i bærekraftsanalyser, 5 sp' },
        ],
      },
      {
        id: 'forskningsmetode', label: 'Vitenskapsteori, metode og statistikk', kategori: 'Metode',
        desc: 'Vitenskapsteori og forskningsmetode, kvantitativ metode og statistikk, og vitenskapelig kommunikasjon.',
        note: 'NMBUs AOS341 Kvantitative metoder hadde siste kandidater i 2023, og i dag er STAT200 Regresjon det vanligste statistikkemnet på programmet. UiO har ikke noe eget metodeemne; der ligger metodedelen i prosjektemnet TEK5380. NTNUs SPRÅK3501 dekker bare formidlingsdelen og er en svakere kobling.',
        links: [
          { entryId: 'nmbu_fornybar2', emnekoder: ['AOS341-1', 'STAT200-1', 'MINA311-1'], merknad: 'AOS341 Kvantitative metoder (5 sp, avviklet), STAT200 Regresjon (5 sp) og MINA311 Samfunnsvitenskapelig forskningsmetode (10 sp)' },
          { entryId: 'ntnu_baerekraftig_energi2', emnekoder: ['SPRÅK3501-1'], merknad: 'Vitenskapelig kommunikasjon for ingeniører, 7,5 sp; dekker bare formidlingsdelen' },
          { entryId: 'hvl_energiteknologi2', emnekoder: ['MOA256-1'], merknad: 'Vitenskapsteori og metoder, 5 sp' },
        ],
      },
      {
        id: 'fordypningsprosjekt', label: 'Fordypningsprosjekt og spesialpensum', kategori: 'Oppgave',
        desc: 'Individuelt veiledet prosjekt eller selvvalgt pensum som forbereder masteroppgaven.',
        note: 'Alle fem programmene har en slik ordning, men omfanget varierer sterkt: NMBUs spesialpensum har individuelt fastsatt omfang, UiO og UiA har prosjektemner på 10 og 7,5 sp, HVL har et veiledet selvstudium på 10 sp, og NTNU har den mest omfattende varianten med fordypningsemne (7,5 sp) og fordypningsprosjekt (15 sp) i høstsemesteret før oppgaven.',
        links: [
          { entryId: 'nmbu_fornybar2', emnekoder: ['SPE-M-FORNY-1'], merknad: 'Spesialpensum' },
          { entryId: 'uio_fornybare_energisystemer2', emnekoder: ['TEK5380-1'], merknad: 'Prosjekt innen fornybar energi, 10 sp' },
          { entryId: 'uia_fornybar2', emnekoder: ['ENE503-G', 'ENE504-G'], merknad: 'Energy Research Project 1 (7,5 sp) og 2 (15 sp)' },
          { entryId: 'ntnu_baerekraftig_energi2', emnekoder: ['TEP4506-1', 'TEP4521-1', 'TIØ4580-1'], merknad: 'fordypningsemne (7,5 sp) og fordypningsprosjekt (15 sp); egen prosjektkode for markedsretningen' },
          { entryId: 'hvl_energiteknologi2', emnekoder: ['MAS550-1'], merknad: 'Veiledet selvstudium, 10 sp' },
        ],
      },
      {
        id: 'masteroppgave', label: 'Masteroppgave', kategori: 'Oppgave',
        desc: 'Selvstendig vitenskapelig arbeid som avslutter masterstudiet.',
        note: 'Her er programmene like: alle fem har masteroppgave på 30 sp, altså ett semester. Det skiller fornybar energi fra økologi- og biologimasterne i MINA-porteføljen, der oppgaven er på 60 sp. NTNU har egen oppgavekode for teknologiretningen (TEP4906) og markedsretningen (TIØ4980), og begge er tatt med.',
        links: [
          { entryId: 'nmbu_fornybar2', emnekoder: ['M30-FORNY-1'], merknad: '30 sp' },
          { entryId: 'uio_fornybare_energisystemer2', emnekoder: ['TEK5930-2'], merknad: '30 sp; oppgaven føres på det felles teknologisystemprogrammet' },
          { entryId: 'uia_fornybar2', emnekoder: ['ENE500-G'], merknad: '30 sp' },
          { entryId: 'ntnu_baerekraftig_energi2', emnekoder: ['TEP4906-1', 'TIØ4980-1'], merknad: '30 sp; en kode per studieretning' },
          { entryId: 'hvl_energiteknologi2', emnekoder: ['MAS595-1'], merknad: '30 sp' },
        ],
      },
    ],
  },
  {
    groupId: 'miljonatur2',
    note: 'Gruppen er faglig bred, og overlappen varierer sterkt fra program til program. NMBUs miljøvitenskap er bygd på miljøkjemi, jord og vann; NTNUs miljøtoksikologi treffer godt på miljøkjemi- og økotoksikologisiden; geofagsmasterne ved UiO og UiB deler jord-, vann-, geokjemi- og klimatemaene, men har i tillegg store geologiske fagfelt (tektonikk, sedimentologi, seismikk) uten motstykke ved NMBU. NTNUs «Industrial Ecology» viste seg å overlappe svært lite: programmet er bygd på livsløpsvurdering, materialstrømanalyse, kryssløpsanalyse og miljøøkonomi, og NMBUs miljøvitenskap har ingen emner i dette med rapporterte karakterer (FORN220 Livsløpsvurdering ligger på fornybar energi-masteren). NTNU Industriell økologi er derfor bare koblet på masteroppgave, fordypningsprosjekt og fagseminar. NMBUs forgjengerprogram «Miljø og naturressurser» (siste opptak 2021) har data for 2021-2023 og er tatt med der emnene er de samme eller direkte forløpere; tallene er små. Fordi programmene er små, er terskelen for å ta med et emne satt til minst ti kandidater samlet i perioden 2021-2025. HMS- og sikkerhetskurs uten studiepoeng (HMS0003, HMS0501-HMS0507) er utelatt. Emner som ikke er koblet fordi de mangler motstykke: NMBUs miljøforvaltningsrett (JUS220), UiOs og UiBs geofarer-, tektonikk-, sedimentologi- og seismikkemner, NTNU Miljøtoksikologis arktiske Svalbard-emner (AT330, AT331), og hele NTNU Industriell økologis fagportefølje. Det finnes heller ingen GIS- eller fjernmålingskobling: NMBUs miljøvitenskap har ikke noe slikt emne med rapporterte karakterer, mens UiO og UiB har flere.',
    courseTypes: [
      {
        id: 'forskningsmetode', label: 'Vitenskapelig metode, feltarbeid og formidling', kategori: 'Metode',
        desc: 'Vitenskapsteori og forskningsdesign, innsamling og kvalitetsvurdering av felt- og laboratoriedata, og vitenskapelig skriving og presentasjon.',
        note: 'NMBUs MILJØ302 er et feltbasert augustblokkemne der studentene samler inn jord- og vannprøver i et nedbørfelt, analyserer dem og presenterer resultatene som poster og muntlig framlegg. Det vurderes bestått/ikke bestått og slår derfor ikke ut på karaktersnittet. Det samme gjelder NTNUs BI3086 (0 sp).',
        links: [
          { entryId: 'nmbu_miljovitenskap2', emnekoder: ['MILJØ302-1', 'MINA310-1', 'LNG250-1'], merknad: 'MILJØ302 Miljøvitenskap (5 sp, obligatorisk, bestått/ikke bestått) + MINA310 Naturvitenskapelig metode + LNG250 Akademisk skriving' },
          { entryId: 'nmbu_mina2_forgjenger', emnekoder: ['MINA302-1', 'ECOL300-1'], merknad: 'MINA302 Introduksjon til masterstudiet (5 sp) var forgjengerens obligatoriske innføringsemne' },
          { entryId: 'ntnu_miljotoks2', emnekoder: ['RFEL3070-1', 'BI3086-1', 'BI3052-1'], merknad: 'RFEL3070 Scientific Seminars in Environmental Toxicology and Chemistry (7,5 sp) er programmets obligatoriske seminaremne' },
          { entryId: 'ntnu_industriell_okologi2', emnekoder: ['TEP4305-1'], merknad: 'seminar i kritisk gjennomgang og formidling av vitenskap, 7,5 sp; siste kandidater i 2023' },
          { entryId: 'uio_geofag2', emnekoder: ['GEO4012-1', 'GEO5550-1'], merknad: 'Vitenskapelig skriving og presentasjon (5 sp) + fagseminar (5 sp)' },
          { entryId: 'uib_geovitenskap2', emnekoder: ['GEOV300-0'], merknad: 'Akademisk skriving og kommunikasjon i geovitenskap, 5 sp' },
        ],
      },
      {
        id: 'miljokjemi-okotoksikologi', label: 'Miljøkjemi og økotoksikologi', kategori: 'Miljø',
        desc: 'Miljøgifters kjemi, spredning og omdanning i naturen, effekter på organismer, og analysemetoder for miljøkjemi.',
        note: 'Dette er den sterkeste koblingen i gruppen. NTNUs miljøtoksikologimaster har hele sin kjerne her, med seks emner fordelt på økotoksikologi (BI-emner) og analytisk og organisk miljøkjemi (KJ-emner), mens NMBU dekker feltet med to-tre valgemner. UiOs og UiBs emner er geokjemisk vinklet og dekker forurensning i grunn og berg mer enn i organismer.',
        links: [
          { entryId: 'nmbu_miljovitenskap2', emnekoder: ['FMI310-1', 'FMI312-1', 'MILJØ200-1'], merknad: 'Miljøgifter og økotoksikologi (10 sp), Human miljøkjemi (10 sp) og Forurensning og miljø (10 sp)' },
          { entryId: 'nmbu_mina2_forgjenger', emnekoder: ['FMI310-1', 'FMI309-1', 'FMI330-1'], merknad: 'forgjengeren hadde en egen studieretning i miljøgifter og økotoksikologi; få kandidater per emne' },
          { entryId: 'ntnu_miljotoks2', emnekoder: ['BI3072-1', 'BI3071-1', 'BI3075-1', 'BI3073-1', 'KJ3073-1', 'KJ3050-1'], merknad: 'miljøtoksikologi, avansert og eksperimentell økotoksikologi, gentoksikologi, analytisk miljøkjemi og marin organisk miljøkjemi, 7,5 sp hver' },
          { entryId: 'uio_geofag2', emnekoder: ['GEO4161-1'], merknad: 'Forurensninger i geomiljøet, 10 sp; få kandidater' },
          { entryId: 'uib_geovitenskap2', emnekoder: ['GEOV243-0'], merknad: 'Miljøgeokjemi, 10 sp' },
        ],
      },
      {
        id: 'jord-og-forurenset-grunn', label: 'Jord og forurenset grunn', kategori: 'Miljø',
        desc: 'Jordas kjemiske og fysiske egenskaper, jordanalyser, jordhelse og håndtering av forurenset grunn.',
        note: 'Jordfag er et NMBU-særtrekk i denne gruppen. UiO dekker den anvendte delen gjennom miljøgeologi og kjemiske prosesser i jord og grunnvann, mens verken NTNU-programmene eller UiB har jordfaglige emner.',
        links: [
          { entryId: 'nmbu_miljovitenskap2', emnekoder: ['JORD310-1', 'JORD213-1', 'JORD210-2', 'JORD330-1'], merknad: 'Jordforurensning og bærekraft (10 sp) er programmets største fagemne' },
          { entryId: 'nmbu_mina2_forgjenger', emnekoder: ['JORD310-1', 'JORD212-1', 'JORD101-1', 'JORD210-1'], merknad: 'forgjengeren hadde en egen studieretning i jord og miljø' },
          { entryId: 'uio_geofag2', emnekoder: ['GEO4100-1', 'GEO5900-1'], merknad: 'Miljøgeologi (10 sp) + Kjemiske prosesser i jord og grunnvann (10 sp)' },
        ],
      },
      {
        id: 'vann-og-hydrologi', label: 'Vann, vannforurensning og hydrologi', kategori: 'Vann',
        desc: 'Vannkvalitet og vannforurensning, limnologiske metoder, tiltaksplanlegging i vannforvaltningen, og hydrologi og hydrogeologi.',
        note: 'Koblingen er tematisk bred og dekker to litt ulike tradisjoner: NMBUs emner er rettet mot vannkvalitet, forurensning og forvaltning av vannforekomster, mens UiOs emner er rene hydrologi- og hydrogeologiemner om vannets kretsløp og bevegelse i grunnen. Felles for dem er nedbørfeltet som analyseenhet. Verken NTNU-programmene eller UiB har vannfaglige emner som er direkte sammenlignbare.',
        links: [
          { entryId: 'nmbu_miljovitenskap2', emnekoder: ['VANN300-1', 'VANN310-1', 'MILJØ210-1', 'VANN211-1', 'VANN210-1', 'VANN301-1'], merknad: 'Vannforurensning (10 sp), Tiltaksplanlegging i vannforvaltning (10 sp) og Biogeokjemi for vann- og avløpsforvaltning (10 sp) er de største' },
          { entryId: 'nmbu_mina2_forgjenger', emnekoder: ['VANN211-1', 'VANN311-1', 'VANN300-1', 'VANN301-1', 'VANN301-V22', 'VANN210-1', 'GEO300-1'], merknad: 'forgjengeren hadde en egen studieretning i limnologi og vannressurser; VANN301 endret kode og navn i 2022' },
          { entryId: 'uio_geofag2', emnekoder: ['GEO4190-1', 'GEO4320-1', 'GEO4360-1', 'GEO4340-1'], merknad: 'Hydrogeologi, Hydrologisk modellering, Feltmetoder i hydrogeologi og Fluvial hydrologi' },
        ],
      },
      {
        id: 'globale-miljoendringer', label: 'Globale miljøendringer og paleoklima', kategori: 'Klima',
        desc: 'Jordsystemet og samspillet mellom atmosfære, hav, is og land, klimaendringer i nåtid og fortid, og hvordan klimahistorien leses ut av sedimenter og iskjerner.',
        note: 'NTNU Miljøtoksikologi har ingen klimaemner. NTNU Industriell økologis TEP4300 Klimavern handler om klimatiltak og utslippsreduksjon, ikke om jordsystemet, og er derfor ikke koblet her. NMBUs GEO310 har svært få kandidater.',
        links: [
          { entryId: 'nmbu_miljovitenskap2', emnekoder: ['MILJØ300-1', 'GEO310-1'], merknad: 'Globale miljøendringer og jordsystemet (10 sp) + Paleomiljø og klimaendringer (10 sp)' },
          { entryId: 'nmbu_mina2_forgjenger', emnekoder: ['MINA300-1'], merknad: 'Globale miljøendringer og jordsystemet; samme emne som dagens MILJØ300, med gammel kode' },
          { entryId: 'uio_geofag2', emnekoder: ['GEO4990-1', 'GEO4140-1'], merknad: 'The Earth System (10 sp) + Miljøstratigrafi (10 sp)' },
          { entryId: 'uib_geovitenskap2', emnekoder: ['GEOV222-0', 'GEOV324-0'], merknad: 'Paleoklimatologi (10 sp) + Paleoklima i polare strøk (5 sp)' },
        ],
      },
      {
        id: 'spesialpensum-fordypning', label: 'Spesialpensum og fordypningsprosjekt', kategori: 'Oppgave',
        desc: 'Individuelt veiledet arbeid utenom de ordinære emnene: selvvalgt pensum eller et prosjekt som forbereder masteroppgaven.',
        note: 'Alle programmene utenom forgjengeren har en slik ordning, men den er organisert ulikt: NMBU, NTNU Miljøtoksikologi, UiO og UiB har spesialpensum med individuelt fastsatt omfang, mens NTNU Industriell økologi har et strukturert prosjektemne på 15 sp som leder fram mot masteroppgaven på 30 sp. UiB har tre parallelle spesialpensumkoder.',
        links: [
          { entryId: 'nmbu_miljovitenskap2', emnekoder: ['SPE-M-MINA-2'], merknad: 'Spesialpensum' },
          { entryId: 'ntnu_miljotoks2', emnekoder: ['KJ3091-2', 'BI3091-1'], merknad: 'spesialpensum til mastergraden, 7,5 sp' },
          { entryId: 'ntnu_industriell_okologi2', emnekoder: ['TEP5100-1'], merknad: 'Industriell økologi, prosjekt, 15 sp' },
          { entryId: 'uio_geofag2', emnekoder: ['GEOSP050-1', 'GEOSP100-1'], merknad: 'spesialpensum geofag, 5 og 10 sp' },
          { entryId: 'uib_geovitenskap2', emnekoder: ['Z-GEOV-0', 'Z-GEOV-A-0', 'Z-GEOV-B-0'], merknad: 'tre spesialpensumkoder med varierende omfang' },
        ],
      },
      {
        id: 'masteroppgave', label: 'Masteroppgave', kategori: 'Oppgave',
        desc: 'Selvstendig vitenskapelig arbeid som avslutter masterstudiet.',
        note: 'Omfanget varierer mest i denne gruppen: NMBUs miljøvitenskap har 45 sp som hovedvariant i dagens studieplan, men 60 sp-varianten er fortsatt den mest brukte i tallene, og 30 sp finnes også. NTNU Miljøtoksikologi, UiO og UiB har alle 60 sp, mens NTNU Industriell økologi har 30 sp pluss et eget prosjektemne på 15 sp. NTNU Miljøtoksikologi og forgjengerprogrammet ved NMBU har hver to oppgavekoder, en per studieretning.',
        links: [
          { entryId: 'nmbu_miljovitenskap2', emnekoder: ['M60-MILJØ-1', 'M45-MILJØ-1', 'M30-MILJØ-1'], merknad: '60, 45 og 30 sp' },
          { entryId: 'nmbu_mina2_forgjenger', emnekoder: ['M60-MINA-1', 'M60-MILJØ-1'], merknad: '60 sp; kullene fra det nedlagte programmet leverte dels på den nye koden' },
          { entryId: 'ntnu_miljotoks2', emnekoder: ['BIENV3900-1', 'KJ3910-1'], merknad: '60 sp; egen kode for biologi- og kjemiretningen' },
          { entryId: 'ntnu_industriell_okologi2', emnekoder: ['TEP4930-1'], merknad: '30 sp' },
          { entryId: 'uio_geofag2', emnekoder: ['GEO5960-2'], merknad: '60 sp' },
          { entryId: 'uib_geovitenskap2', emnekoder: ['GEOV399-0'], merknad: '60 sp' },
        ],
      },
    ],
  },
  {
    groupId: 'naturforvaltning2',
    note: 'Dette er den gruppen i MINA-porteføljen med best faglig overlapp: alle fire programmene kombinerer økologi med forvaltning, og har både metodeemner, GIS og en stor masteroppgave. Oppbyggingen er likevel ulik. NMBU har mange små obligatoriske emner (5 sp) og en masteroppgave på 45 sp, NTNU har en felles kjerne på 30 sp og deretter to studieretninger (biologi og geografi) med hver sin 60 sp-oppgave, USN har tre obligatoriske emner og seks frie 7,5 sp-valgemner, og INNs «Anvendt økologi» har hele graden obligatorisk. USN byttet studieplan rundt 2022, da de gamle 10 sp-emnene (4301, 4311, 4308) ble erstattet av EE-emner på 7,5 sp, og INN la om fra 6EV- til MAOK-emner i 2024; begge kodesettene er tatt med der de dekker samme tema. NTNUs og INNs HMS-kurs uten studiepoeng er utelatt. Emner som ikke er koblet fordi de bare finnes ett sted: NMBUs restaureringsøkologi (ECOL350), naturkartlegging (BOT270) og besøksforvaltning (REIS320), USNs molekylærgenetikk (EE508, 4328) og økotoksikologi (EE507, 4308), og INNs viltovervåkingsemner. INN inngår også i gruppen okologi2, med samme emnedata.',
    courseTypes: [
      {
        id: 'statistikk-studiedesign', label: 'Statistikk og studiedesign', kategori: 'Metode',
        desc: 'Studiedesign, statistisk modellering og analyse av økologiske og forvaltningsfaglige data.',
        note: 'NMBU har ikke noe obligatorisk statistikkemne på masternivå; studenter uten statistikk fra før må ta STAT100 på bachelornivå, som ikke rapporteres på masterprogrammet. ECOL340 er valgfritt, men tas av de fleste.',
        links: [
          { entryId: 'nmbu_naturforvaltning2', emnekoder: ['ECOL340-1'], merknad: '5 sp, dataanalyse i R' },
          { entryId: 'ntnu_naturressurs2', emnekoder: ['BI3052-1', 'BI3051-1'], merknad: 'studiedesign + kvantitative analyser, 7,5 sp hver; obligatorisk valg i biologiretningen' },
          { entryId: 'usn_okologi_miljoforvaltning2', emnekoder: ['EE502-1'], merknad: 'Statistics and Study Design, 7,5 sp, obligatorisk' },
          { entryId: 'inn_anvendt_okologi_nf2', emnekoder: ['MAOK4002-1', 'MAOK4006-1', '6EV311-1', '6EV321-1', '6EV323-1'], merknad: 'MAOK4002 Biostatistics (10 sp) erstattet 6EV311 fra 2024' },
        ],
      },
      {
        id: 'forskningsmetode', label: 'Vitenskapelig metode og forskningsprosess', kategori: 'Metode',
        desc: 'Vitenskapsteori, forskningsdesign, økologiske feltmetoder og vitenskapelig formidling.',
        note: 'NMBU byttet fra ECOL300 til MINA310 fra og med 2023, og har i tillegg MINA311 Samfunnsvitenskapelig forskningsmetode (10 sp) som alternativ. NTNUs BI3086 How to do Science gir ingen studiepoeng og vurderes bestått/ikke bestått. USNs to gamle metodeemner hadde siste kandidater i 2022.',
        links: [
          { entryId: 'nmbu_naturforvaltning2', emnekoder: ['MINA310-1', 'ECOL300-1', 'MINA311-1'], merknad: 'obligatorisk valg mellom MINA310 (5 sp) og MINA311 (10 sp)' },
          { entryId: 'ntnu_naturressurs2', emnekoder: ['RFEL3080-1', 'BI3086-1'], merknad: 'RFEL3080 Scientific Research Seminar (7,5 sp) er obligatorisk; BI3086 er på 0 sp' },
          { entryId: 'usn_okologi_miljoforvaltning2', emnekoder: ['4301-1', '4311-1'], merknad: 'Natural Science Methods og Ecological Methods, 10 sp hver; erstattet av EE-emnene fra 2022' },
          { entryId: 'inn_anvendt_okologi_nf2', emnekoder: ['MAOK4005-1'], merknad: 'Research process and topics, 10 sp' },
        ],
      },
      {
        id: 'naturforvaltning-kjerne', label: 'Naturforvaltning og økosystemtjenester', kategori: 'Forvaltning',
        desc: 'Forvaltningsapparatet, virkemidlene og avveiingene i praktisk natur- og naturressursforvaltning, inkludert økosystemtjenester.',
        note: 'USN har ikke noe generelt forvaltningsemne; programmet er bygd opp av økologiske og miljøfaglige valgemner, og forvaltningsdelen ligger innbakt i disse.',
        links: [
          { entryId: 'nmbu_naturforvaltning2', emnekoder: ['NATF302-1', 'NATF301-1'], merknad: 'Norsk naturforvaltning + Praktisk naturforvaltning, 5 sp hver, begge obligatoriske' },
          { entryId: 'ntnu_naturressurs2', emnekoder: ['RFEL3082-1', 'RFEL3083-1'], merknad: 'Sustainable Management of Ecosystem Services (obligatorisk) + praksisemnet Bærekraftig forvaltning' },
          { entryId: 'inn_anvendt_okologi_nf2', emnekoder: ['6EV322-1'], merknad: 'Human dimensions in ecosystem management, 7,5 sp; siste kull 2023' },
        ],
      },
      {
        id: 'bevaringsbiologi', label: 'Bevaringsbiologi', kategori: 'Økologi og natur',
        desc: 'Teori og metoder for å bevare arter og økosystemer: små populasjoner, fragmentering, rødlister og vernevurderinger.',
        note: 'USN har to emner på feltet, et generelt og et anvendt. INN har ikke noe frittstående emne i bevaringsbiologi.',
        links: [
          { entryId: 'nmbu_naturforvaltning2', emnekoder: ['NATF300-1'], merknad: '5 sp' },
          { entryId: 'ntnu_naturressurs2', emnekoder: ['BI3082-1'], merknad: 'Avansert bevaringsbiologi, 7,5 sp; få kandidater på dette programmet' },
          { entryId: 'usn_okologi_miljoforvaltning2', emnekoder: ['EE510-1', 'EE511-1'], merknad: 'Applied Conservation Biology + Conservation Biology, 7,5 sp hver' },
        ],
      },
      {
        id: 'gis-fjernmaling', label: 'GIS, fjernmåling og romlig analyse', kategori: 'Metode',
        desc: 'Geografiske informasjonssystemer, fjernmåling, landskapsanalyse og analyse av romlige data.',
        note: 'NMBU har bare et praktisk introduksjonsemne på 5 sp, og det er et bachelornivåemne (LAD102) som masterstudentene tar. De tre andre programmene har GIS og fjernmåling på masternivå.',
        links: [
          { entryId: 'nmbu_naturforvaltning2', emnekoder: ['LAD102-1'], merknad: 'GIS - praktisk introduksjon, 5 sp' },
          { entryId: 'ntnu_naturressurs2', emnekoder: ['GEOG3523-1', 'GEOG3527-1'], merknad: 'GIS-datafangst og kartlegging + GIS-verktøy for klimastudier, 7,5 sp hver; obligatorisk valg i geografiretningen' },
          { entryId: 'usn_okologi_miljoforvaltning2', emnekoder: ['EE509-1', 'MSM4330-1'], merknad: 'Landscape Analysis and Remote Sensing + Spatial analyses, 7,5 sp hver' },
          { entryId: 'inn_anvendt_okologi_nf2', emnekoder: ['SKO4003S-1', 'MAOK4110-1', '6EV324-1'], merknad: 'SKO4003S Geographic Information Systems (10 sp) erstattet MAOK4110 GIS fra 2025; 6EV324 dekker romlige dyredata' },
        ],
      },
      {
        id: 'vilt-og-fiskeforvaltning', label: 'Vilt- og fiskeforvaltning', kategori: 'Forvaltning',
        desc: 'Bestandsovervåking, høsting og forvaltning av vilt og ferskvannsfisk, og håndtering av konflikter rundt rovvilt og hjortevilt.',
        note: 'NTNUs naturressursforvaltning har ingen vilt- eller fiskeemner. USNs eneste emne på feltet er lite. Dette er derimot INNs faglige tyngdepunkt, med flere emner i viltovervåking og viltøkologi.',
        links: [
          { entryId: 'nmbu_naturforvaltning2', emnekoder: ['NATF330-1', 'NATF340-1'], merknad: 'Viltforvaltning + Fiskeforvaltning, 10 sp hver' },
          { entryId: 'usn_okologi_miljoforvaltning2', emnekoder: ['NF214-1'], merknad: 'Wildlife Conflict Management, 7,5 sp; få kandidater' },
          { entryId: 'inn_anvendt_okologi_nf2', emnekoder: ['MAOK4004-1', 'MAOK4140-1', 'MAOK4003-1', '6EV314-1'], merknad: 'viltovervåking, anvendt viltøkologi og radiotelemetri' },
        ],
      },
      {
        id: 'vann-og-vassdrag', label: 'Ferskvann og vannforvaltning', kategori: 'Vann',
        desc: 'Økologi i elver og innsjøer, vannkvalitet og forvaltning av vannforekomster etter vannforskriften.',
        note: 'Verken NTNU eller INN har vannfaglige emner på disse programmene.',
        links: [
          { entryId: 'nmbu_naturforvaltning2', emnekoder: ['ECOL380-1', 'VANN210-1'], merknad: 'Økologi og forvaltning av elver og innsjøer + Ferskvannsøkologi, 10 sp hver' },
          { entryId: 'usn_okologi_miljoforvaltning2', emnekoder: ['EE503-1'], merknad: 'Bærekraftig vannforvaltning, 7,5 sp; et av de mest tatte valgemnene' },
        ],
      },
      {
        id: 'arealplanlegging-miljorett', label: 'Arealplanlegging og miljørett', kategori: 'Forvaltning',
        desc: 'Plan- og bygningsloven, naturmangfoldloven og annen miljøforvaltningsrett, og hvordan arealplanlegging foregår i kommuner og stat.',
        note: 'Dette er den tydeligste forskjellen mellom NMBU og de andre: NMBU har fire juss- og planleggingsemner i programmet, og alle fire er obligatoriske eller nær obligatoriske. NTNUs GEOG3030 dekker planleggingsdelen, men ikke jussen. USN og INN har ingen emner på feltet.',
        links: [
          { entryId: 'nmbu_naturforvaltning2', emnekoder: ['APL240-1', 'APL241-1', 'JUS220-1', 'JUS320-1'], merknad: 'Miljø og planlegging del 1 og 2, Miljøforvaltningsrett og Plan- og bygningsrett I, 5 sp hver' },
          { entryId: 'ntnu_naturressurs2', emnekoder: ['GEOG3030-1'], merknad: 'Natural Resources Planning and Management, 7,5 sp, obligatorisk; programmets største emne' },
        ],
      },
      {
        id: 'tverrfaglig-baerekraft', label: 'Tverrfaglig bærekraftsarbeid', kategori: 'Metode',
        desc: 'Tverrfaglig prosjektarbeid om bærekraftskonflikter, der studenter fra ulike fag må håndtere motstridende hensyn og interesser.',
        note: 'NMBU tilbyr emnet i en norsk (MINA320) og en engelsk (MINA321) versjon, og begge kodene er tatt med. USN og INN har ikke noe tilsvarende emne.',
        links: [
          { entryId: 'nmbu_naturforvaltning2', emnekoder: ['MINA320-1', 'MINA321-1'], merknad: '5 sp, obligatorisk; MINA320 er den norske versjonen' },
          { entryId: 'ntnu_naturressurs2', emnekoder: ['RFEL3081-1'], merknad: 'Interdisciplinary Project for Environmental Sustainability, 7,5 sp, obligatorisk' },
        ],
      },
      {
        id: 'masteroppgave', label: 'Masteroppgave', kategori: 'Oppgave',
        desc: 'Selvstendig vitenskapelig arbeid som avslutter masterstudiet.',
        note: 'Omfanget varierer mye: NMBU har 45 sp som hovedvariant, mens NTNU, USN og INN alle har 60 sp. NMBU har også hatt 30 og 60 sp-varianter, og alle tre kodene er tatt med. NTNU har egen oppgavekode for hver av de to studieretningene.',
        links: [
          { entryId: 'nmbu_naturforvaltning2', emnekoder: ['M45-NF-1', 'M30-NF-1', 'M60-NF-1'], merknad: '45 sp er hovedvarianten i dagens studieplan' },
          { entryId: 'ntnu_naturressurs2', emnekoder: ['NATRBI3900-1', 'GEOG3940-1'], merknad: '60 sp; biologiretningen og geografiretningen har hver sin kode' },
          { entryId: 'usn_okologi_miljoforvaltning2', emnekoder: ['4317-1'], merknad: '60 sp' },
          { entryId: 'inn_anvendt_okologi_nf2', emnekoder: ['6EV399-1'], merknad: '60 sp' },
        ],
      },
    ],
  },
  {
    groupId: 'okologi2',
    note: 'De fire programmene har liten felles obligatorisk kjerne, slik toårige mastere flest har: NMBU har 90 sp obligatorisk (inkludert en 60 sp masteroppgave) fordelt på seks 5 sp-emner, INN har hele graden obligatorisk, mens NTNU og UiT er rene paraplyprogrammer i biologi med henholdsvis fire og sju studieretninger og nesten bare valgemner. Den reelle overlappen ligger derfor i metodeemnene, masteroppgaven og et knippe økologiske kjernetemaer. INN la om studieplanen i 2024: de gamle 6EV-emnene ble erstattet av MAOK-emner, og begge kodesettene er tatt med der de dekker samme tema. NTNUs og UiTs HMS- og sikkerhetskurs (HMS0003, HMS-0501 til HMS-0504) er utelatt, fordi de er obligatoriske kurs uten studiepoeng og uten faglig motstykke ved NMBU. Emner som ikke er koblet fordi de bare finnes ett sted: NMBUs restaureringsøkologi (ECOL350) og tropiske emner (NATF320, ECOL330), INNs viltovervåkingsemner (MAOK4004, MAOK4140, 6EV314, 6EV315), NTNUs celle- og molekylærbiologi (BI3016, BI3013) og genetikk (BI3083), og UiTs marine og arktiske emner (BIO-3009, BIO-3013, BIO-3029, BIO-3506), som følger av at UiT-programmet er bygd rundt arktisk marin biologi.',
    courseTypes: [
      {
        id: 'statistikk-studiedesign', label: 'Statistikk og studiedesign', kategori: 'Metode',
        desc: 'Studiedesign, statistisk modellering og analyse av økologiske data, i praksis med R som verktøy.',
        note: 'Omfanget varierer mye: NMBU dekker dette i ett 5 sp-emne, NTNU i to 7,5 sp-emner, UiT i ett 10 sp-emne, mens INN har en hel serie statistikkemner.',
        links: [
          { entryId: 'nmbu_okologi2', emnekoder: ['ECOL340-1'], merknad: '5 sp, utforsking og analyse av data i økologi og naturforvaltning' },
          { entryId: 'inn_anvendt_okologi2', emnekoder: ['MAOK4002-1', 'MAOK4006-1', '6EV311-1', '6EV321-1', '6EV323-1'], merknad: 'MAOK4002 Biostatistics (10 sp) erstattet 6EV311 Study design and statistical modelling fra 2024' },
          { entryId: 'ntnu_biologi2', emnekoder: ['BI3052-1', 'BI3051-1'], merknad: 'studiedesign + kvantitative analyser i økologi og evolusjon, 7,5 sp hver' },
          { entryId: 'uit_biologi2', emnekoder: ['BIO-3012-1'], merknad: '10 sp, obligatorisk i fem av sju studieretninger' },
        ],
      },
      {
        id: 'forskningsmetode', label: 'Vitenskapelig metode og forskningsprosess', kategori: 'Metode',
        desc: 'Vitenskapsteori, forskningsprosessen fra problemstilling til publisering, feltbasert datainnsamling og vitenskapelig formidling.',
        note: 'NMBU byttet fra ECOL300 til MINA310 fra og med 2023. NTNUs BI3086 How to do Science gir ingen studiepoeng og vurderes bestått/ikke bestått, og slår derfor ikke ut på karaktersnittet.',
        links: [
          { entryId: 'nmbu_okologi2', emnekoder: ['MINA310-1', 'ECOL300-1', 'ECOL302-1'], merknad: 'MINA310 Naturvitenskapelig metode (5 sp) + ECOL302 Økologisk forskning (5 sp), et treukers feltbasert forskningsemne som avsluttes med studentkonferanse' },
          { entryId: 'inn_anvendt_okologi2', emnekoder: ['MAOK4005-1'], merknad: 'Research process and topics, 10 sp' },
          { entryId: 'ntnu_biologi2', emnekoder: ['BI3086-1'], merknad: '0 sp, bestått/ikke bestått' },
          { entryId: 'uit_biologi2', emnekoder: ['BIO-3529-1', 'BIO-3529-2'], merknad: 'Academic skills, 5 sp; ny emneversjon fra 2025' },
        ],
      },
      {
        id: 'populasjonsokologi', label: 'Populasjons- og samfunnsøkologi', kategori: 'Økologi og natur',
        desc: 'Populasjonsdynamikk, artsinteraksjoner, atferdsøkologi og økologisk-evolusjonær teori.',
        note: 'INNs «Concepts in ecology» er et bredere teoriemne som også dekker populasjons- og samfunnsøkologi, og er derfor en delvis, ikke fullstendig, parallell.',
        links: [
          { entryId: 'nmbu_okologi2', emnekoder: ['ZOOL310-1'], merknad: 'Atferds- og populasjonsøkologi, 10 sp' },
          { entryId: 'inn_anvendt_okologi2', emnekoder: ['MAOK4001-1', '6EV310-1'], merknad: 'MAOK4001 (5 sp) erstattet 6EV310 (7,5 sp) fra 2024' },
          { entryId: 'ntnu_biologi2', emnekoder: ['BI3106-1', 'BI3040-1'], merknad: 'økologisk og evolusjonær dynamikk + atferdsøkologi, 7,5 sp hver' },
          { entryId: 'uit_biologi2', emnekoder: ['BIO-3505-1'], merknad: 'Ecological Interactions, 10 sp' },
        ],
      },
      {
        id: 'bevaringsbiologi', label: 'Bevaringsbiologi', kategori: 'Økologi og natur',
        desc: 'Teori og metoder for å bevare arter og økosystemer: små populasjoner, fragmentering, rødlister og vernevurderinger.',
        note: 'Verken INN eller UiT har et frittstående emne i bevaringsbiologi. INN dekker temaet innbakt i forvaltnings- og viltemnene, og UiTs nærmeste emne, BIO-3004 Ecosystem-based management, er et forvaltningsemne og ikke koblet her.',
        links: [
          { entryId: 'nmbu_okologi2', emnekoder: ['NATF300-1'], merknad: '5 sp, obligatorisk' },
          { entryId: 'ntnu_biologi2', emnekoder: ['BI3082-1'], merknad: 'Avansert bevaringsbiologi, 7,5 sp' },
        ],
      },
      {
        id: 'globale-miljoendringer', label: 'Globale miljøendringer og økologi', kategori: 'Økologi og natur',
        desc: 'Hvordan klimaendringer, arealbruk og annen menneskelig påvirkning endrer økosystemene.',
        note: 'NTNUs biologimaster har ikke et eget emne om globale miljøendringer. INNs 6EV320 hadde siste kandidater i 2023 og er ikke erstattet av et tilsvarende MAOK-emne.',
        links: [
          { entryId: 'nmbu_okologi2', emnekoder: ['ECOL310-1'], merknad: '5 sp, obligatorisk; programmets største emne målt i kandidater' },
          { entryId: 'inn_anvendt_okologi2', emnekoder: ['6EV320-1'], merknad: 'Human impacts on ecological systems, 15 sp; siste kull 2023' },
          { entryId: 'uit_biologi2', emnekoder: ['BIO-3015-1'], merknad: 'arktisk marin systemøkologi og klimaendringer, 10 sp' },
        ],
      },
      {
        id: 'gis-romlig-analyse', label: 'GIS og romlig analyse', kategori: 'Metode',
        desc: 'Geografiske informasjonssystemer, karttyper og analyse av romlige økologiske data.',
        note: 'GIS er et tyngdepunkt ved INN, som har både et generelt GIS-emne og et eget emne i analyse av romlige dyredata, mens NMBU bare har et praktisk introduksjonsemne på 5 sp. NTNUs biologimaster har ingen GIS-emner; NTNUs GIS-tilbud ligger på naturressursforvaltningsprogrammet.',
        links: [
          { entryId: 'nmbu_okologi2', emnekoder: ['LAD102-1'], merknad: 'GIS - praktisk introduksjon, 5 sp' },
          { entryId: 'inn_anvendt_okologi2', emnekoder: ['SKO4003S-1', 'MAOK4110-1', '6EV324-1'], merknad: 'SKO4003S Geographic Information Systems (10 sp) erstattet MAOK4110 GIS (7,5 sp) fra 2025' },
          { entryId: 'uit_biologi2', emnekoder: ['BIO-3111-1'], merknad: 'GIS og jordobservasjon, 10 sp; siste kandidater i 2023' },
        ],
      },
      {
        id: 'menneske-vilt', label: 'Menneske-vilt-interaksjoner', kategori: 'Forvaltning',
        desc: 'Konflikter og sameksistens mellom mennesker og vilt, og samfunnsfaglige sider ved økosystemforvaltning.',
        note: 'Dette er INNs faglige signatur, og programmet har flere emner på feltet. Verken NTNU eller UiT har noe tilsvarende. INNs rene viltovervåkingsemner (MAOK4004 Wildlife monitoring, MAOK4140 Applied Wildlife Ecology, 6EV314 radiotelemetri) er ikke koblet, fordi NMBUs økologimaster ikke har noen motsvarighet til dem.',
        links: [
          { entryId: 'nmbu_okologi2', emnekoder: ['NATF350-1'], merknad: 'Interaksjoner mellom mennesker og vilt, 5 sp' },
          { entryId: 'inn_anvendt_okologi2', emnekoder: ['6EV322-1', 'MAOK4003-1'], merknad: 'Human dimensions in ecosystem management (7,5 sp) + Wildlife in the Anthropocene (15 sp)' },
        ],
      },
      {
        id: 'ferskvannsokologi', label: 'Ferskvannsøkologi', kategori: 'Økologi og natur',
        desc: 'Økologi i elver og innsjøer, limnologiske prosesser og forvaltning av ferskvannsforekomster.',
        note: 'Alle tre emnene er valgemner med få kandidater. INN har ingen ferskvannsemner.',
        links: [
          { entryId: 'nmbu_okologi2', emnekoder: ['ECOL380-1'], merknad: 'Økologi og forvaltning av elver og innsjøer, 10 sp' },
          { entryId: 'ntnu_biologi2', emnekoder: ['BI3037-1'], merknad: 'Ferskvannsøkologi, 7,5 sp; svært få kandidater' },
          { entryId: 'uit_biologi2', emnekoder: ['BIO-3518-2', 'BIO-3521-1'], merknad: 'Northern inland waters and global change (10 sp) + seminar i ferskvannsøkologi (5 sp)' },
        ],
      },
      {
        id: 'masteroppgave', label: 'Masteroppgave', kategori: 'Oppgave',
        desc: 'Selvstendig vitenskapelig arbeid som avslutter masterstudiet.',
        note: 'Alle fire programmene har masteroppgave på 60 sp, altså et helt studieår. Det skiller denne gruppen fra NMBUs skog- og naturforvaltningsmastere, der oppgaven er på 30 eller 45 sp.',
        links: [
          { entryId: 'nmbu_okologi2', emnekoder: ['M60-ECOL-1'], merknad: '60 sp' },
          { entryId: 'inn_anvendt_okologi2', emnekoder: ['6EV399-1'], merknad: '60 sp; emnekoden er beholdt fra den gamle studieplanen' },
          { entryId: 'ntnu_biologi2', emnekoder: ['BI3900-1'], merknad: '60 sp' },
          { entryId: 'uit_biologi2', emnekoder: ['BIO-3950-1'], merknad: '60 sp' },
        ],
      },
    ],
  },
  {
    groupId: 'skogfag',
    note: 'Gruppa sammenligner to skogbruksbachelorer som er bygd helt ulikt. NMBUs bachelor i skogfag er et universitetsløp med 145 av 180 sp obligatorisk, der realfag (matematikk, statistikk, jordlære) og økonomi utgjør en stor del av grunnlaget. Universitetet i Innlandets bachelor i skogfag på Evenstad er 100 % obligatorisk og klart mer yrkesrettet, med store emner i foryngelseshogst og produksjonsskog, praksisemne og ingen egne matematikkemner. Nord universitets bachelor i skogfag er utelatt fordi DBH bare har rapportert karakterer for ett emne (SKO1000 Innføring i skogfag, 12 kandidater i 2025) – programmet hadde første opptak i 2025. INNs bachelor i utmarksforvaltning (entryId inn_utmark_skog) er en svakere sammenligning og er bare koblet der de to INN-programmene faktisk deler emner; de samme emnene er koblet en gang til under gruppen for økologi og naturforvaltning, der programmet heter inn_utmarksforvaltning. Fire deler av NMBU-løpet har ingen parallell hos INN og er derfor ikke satt opp som emnetyper: matematikk (MATH100 Brukerkurs i matematikk og ECN102 Innføring i matematikk for økonomer), skogskader (SKOG201 og SKOG202, tidligere kodet FEP201 og FEP202), skogtaksering (SKOG205 Inventering og ressurskartlegging) og examen philosophicum (PHI100/PHI101/PHI102). Motsatt har INN et obligatorisk praksisemne (SKO1170) og en bacheloroppgave (6EV299) som NMBUs skogfagsbachelor ikke har – NMBU avslutter i stedet med øvingskurset SKOG250.',
    courseTypes: [
      {
        id: 'skogforvaltning-innforing', label: 'Skogforvaltning og skognæring (innføring)', kategori: 'Skogfag',
        desc: 'Innføringsemnet i skogbruk: skogressursene, skognæringens verdikjeder og rammene for forvaltningen av skogen.',
        note: 'NMBU samler stoffet i ett stort førstesemesteremne på 10 sp, mens INN deler det på SKO1101 Skognæringen i Norge (7,5 sp). SKO1104 Boreal forest sector er den eldre, engelskspråklige kodeversjonen og har ingen kandidater etter 2023. Emnet er felles for INNs to Evenstad-bachelorer.',
        links: [
          { entryId: 'nmbu_skogfag', emnekoder: ['SKOG100-1'] },
          { entryId: 'inn_skogfag', emnekoder: ['SKO1101-1', 'SKO1104-1'], merknad: 'Skognæringen i Norge; SKO1104 Boreal forest sector er den eldre kodeversjonen.' },
          { entryId: 'inn_utmark_skog', emnekoder: ['SKO1101-1'], merknad: 'Samme emne som på INNs skogfagsbachelor.' },
        ],
      },
      {
        id: 'skogokologi', label: 'Skogøkologi og skogproduksjon', kategori: 'Skogfag',
        desc: 'Skogens biologi og økologi: treslagene, voksestedet, bonitet og tilvekst.',
        note: 'INNs SKO1106 Applied Forest Ecology er engelskspråklig og ligger i tredje studieår, mens NMBUs SKOG200 ligger i første. INNs utmarksforvaltning har ikke noe skogøkologiemne; der dekkes økologien av de generelle økologiemnene (se emnetypen Generell økologi).',
        links: [
          { entryId: 'nmbu_skogfag', emnekoder: ['SKOG200-1'], merknad: 'Skogens biologi, økologi og produksjon.' },
          { entryId: 'inn_skogfag', emnekoder: ['SKO1106-1'] },
        ],
      },
      {
        id: 'skogskjotsel', label: 'Skogskjøtsel og skogbehandling', kategori: 'Skogfag',
        desc: 'Foryngelse, hogstformer, ungskogpleie og behandling av bestandet gjennom omløpet.',
        note: 'Omfanget er svært ulikt: INN har to emner à 15 sp i andre studieår, altså 30 sp, mot NMBUs ene emne på 10 sp. INNs utmarksforvaltning har ingen skogskjøtselsemner.',
        links: [
          { entryId: 'nmbu_skogfag', emnekoder: ['SKOG220-1'], merknad: 'Skogbehandling, 10 sp.' },
          { entryId: 'inn_skogfag', emnekoder: ['SKO2202-1', 'SKO2203-1'], merknad: 'Foryngelseshogst og Produksjonsskog, 15 sp hver.' },
        ],
      },
      {
        id: 'skogplanlegging', label: 'Skogbruksplanlegging og skogøkonomi', kategori: 'Skogfag',
        desc: 'Økonomisk planlegging i skogbruket: hogstmodenhet, avvirkningsberegning og lønnsomhet i skogbedriften.',
        note: 'NMBUs SKOG250 er et tverrfaglig øvingskurs i skogforvaltning på 10 sp i juniblokka og er tatt med fordi det er den praktiske planleggingsdelen av studiet. Skogtaksering er ikke satt opp som egen emnetype: NMBU har SKOG205 Inventering og ressurskartlegging, mens INN dekker taksering inne i SKO2203 Produksjonsskog.',
        links: [
          { entryId: 'nmbu_skogfag', emnekoder: ['SKOG230-1', 'SKOG250-1'], merknad: 'Ressursøkonomi og planlegging i skogbruket og øvingskurset i tverrfaglig analyse.' },
          { entryId: 'inn_skogfag', emnekoder: ['SKO2260-1'], merknad: 'Skogøkonomi.' },
        ],
      },
      {
        id: 'treteknologi', label: 'Treteknologi og skogindustri', kategori: 'Skogfag',
        desc: 'Trevirkets egenskaper og foredling, og verdikjeden fra tømmer til ferdig produkt.',
        note: 'NMBU har tre emner på til sammen 20 sp, INN ett på 7,5 sp. TRE210 Trelastindustri er valgemne ved NMBU og har få kandidater.',
        links: [
          { entryId: 'nmbu_skogfag', emnekoder: ['TRE200-1', 'SKOG210-1', 'TRE210-1'], merknad: 'Treteknologi I, Skogprodukter og materialteknologi og Trelastindustri.' },
          { entryId: 'inn_skogfag', emnekoder: ['SKO1103-1'], merknad: 'Tømmerets verdikjede.' },
        ],
      },
      {
        id: 'driftsteknikk', label: 'Skogteknologi, drift og logistikk', kategori: 'Skogfag',
        desc: 'Hogstmaskiner og driftsapparat, skogsveier og transport av tømmer ut av skogen.',
        note: 'Koblingen er delvis: INNs SKO1110 Landbruksvei dekker bare veidelen, mens NMBUs SKOG240 også omfatter driftsapparat og logistikk. SKOG101 Skogteknologi finnes i to kodeversjoner; -2 er den som brukes nå.',
        links: [
          { entryId: 'nmbu_skogfag', emnekoder: ['SKOG240-1', 'SKOG101-2', 'SKOG101-1'], merknad: 'Skoglig driftsteknikk og logistikk og Skogteknologi (to kodeversjoner).' },
          { entryId: 'inn_skogfag', emnekoder: ['SKO1110-1'], merknad: 'Landbruksvei.' },
        ],
      },
      {
        id: 'okonomi', label: 'Økonomi', kategori: 'Økonomi',
        desc: 'Innføring i samfunns- og bedriftsøkonomi, medregnet miljø- og ressursøkonomi.',
        note: 'NMBUs studieplan for kull 2026 har ECN101 Samfunnsøkonomi for miljø og utvikling (10 sp), men DBH har ikke rapportert kandidater på det emnet for skogfagsprogrammet; de rapporterte økonomiemnene er ECN110 og ECN170. UTM1160 Ressurs- og miljøøkonomi ved INN har ingen kandidater etter 2023.',
        links: [
          { entryId: 'nmbu_skogfag', emnekoder: ['ECN110-1', 'ECN170-1'], merknad: 'Mikroøkonomi I og Miljø- og ressursøkonomi.' },
          { entryId: 'inn_skogfag', emnekoder: ['SKO1160-1', 'UTM1160-1'], merknad: 'Grunnleggende økonomi og Ressurs- og miljøøkonomi.' },
          { entryId: 'inn_utmark_skog', emnekoder: ['UTM1160-1', 'SKO1160-1'] },
        ],
      },
      {
        id: 'gis', label: 'GIS og geografisk analyse', kategori: 'Metode',
        desc: 'Kartgrunnlag, geografiske informasjonssystemer og romlig analyse av arealdata.',
        note: 'INN har to emner: et innføringsemne i første eller andre studieår og et analyseemne i tredje. NMBU har bare innføringsemnet LAD102; GMGI210 Geografiske informasjonssystemer har nesten ingen kandidater fra skogfagsprogrammet og er ikke koblet.',
        links: [
          { entryId: 'nmbu_skogfag', emnekoder: ['LAD102-1'], merknad: 'GIS - praktisk introduksjon, 5 sp.' },
          { entryId: 'inn_skogfag', emnekoder: ['6EV153-1', 'SKO2153-1'], merknad: 'Introduksjon til geografiske informasjonssystemer og Geografisk analyse.' },
          { entryId: 'inn_utmark_skog', emnekoder: ['6EV153-1', 'SKO2153-1'] },
        ],
      },
      {
        id: 'jordlare', label: 'Jordlære og naturgrunnlag', kategori: 'Geofag',
        desc: 'Jordsmonn, geologi, landformer og vegetasjon som grunnlag for skogproduksjonen.',
        note: 'INNs SKO1105 Naturgrunnlaget (15 sp) samler jord, geologi og vegetasjon i ett emne og har erstattet de eldre emnene 6EV131 Geologi og landformer og 6EV130 Vegetasjon og kretsløp, som ikke har kandidater etter 2023. NMBU har bare jorddelen, på 5 sp. JORD101 er den gamle kodeversjonen av JORD100.',
        links: [
          { entryId: 'nmbu_skogfag', emnekoder: ['JORD100-1', 'JORD101-1'], merknad: 'Jordlære; JORD101 er den eldre kodeversjonen.' },
          { entryId: 'inn_skogfag', emnekoder: ['SKO1105-1', '6EV131-1', '6EV130-1'], merknad: 'Naturgrunnlaget; 6EV131 og 6EV130 er forgjengerne.' },
          { entryId: 'inn_utmark_skog', emnekoder: ['SKO1105-1', '6EV131-1', '6EV130-1'] },
        ],
      },
      {
        id: 'statistikk', label: 'Statistikk og vitenskapelig metode', kategori: 'Metode',
        desc: 'Sannsynlighetsregning, statistisk analyse og vitenskapelig arbeidsmetode med rapportskriving.',
        note: 'INNs 6EV298 er på 15 sp og kombinerer metode, statistikk og oppgaveskriving; NMBUs STAT100 er et rent statistikkemne på 10 sp. 6EV198 Rapport og analyse er forgjengeren til 6EV298.',
        links: [
          { entryId: 'nmbu_skogfag', emnekoder: ['STAT100-1'] },
          { entryId: 'inn_skogfag', emnekoder: ['6EV298-1', '6EV198-1'], merknad: 'Vitenskapelig metode og statistikk; 6EV198 Rapport og analyse er forgjengeren.' },
          { entryId: 'inn_utmark_skog', emnekoder: ['6EV298-1', '6EV198-1'] },
        ],
      },
      {
        id: 'juss', label: 'Juss og forvaltningsrett', kategori: 'Forvaltning',
        desc: 'Juridisk metode, norsk rettssystem og reglene for offentlig saksbehandling i natur- og skogforvaltningen.',
        note: 'NMBUs JUS100 er et generelt innføringsemne i juridisk metode, mens INNs SKO1154 er spisset mot forvaltningsrett. Begge er obligatoriske.',
        links: [
          { entryId: 'nmbu_skogfag', emnekoder: ['JUS100-1'], merknad: 'Juridisk metode og norsk rettssystem.' },
          { entryId: 'inn_skogfag', emnekoder: ['SKO1154-1'], merknad: 'Forvaltningsrett.' },
          { entryId: 'inn_utmark_skog', emnekoder: ['SKO1154-1'] },
        ],
      },
      {
        id: 'arealforvaltning', label: 'Arealforvaltning og naturvern', kategori: 'Forvaltning',
        desc: 'Vern, arealbruk og forvaltning av natur- og utmarksarealer.',
        note: 'Dette er den løseste koblingen i gruppa: NMBUs NATF200 handler om vern og forvaltning av norsk natur, mens INNs 6EV155 Arealforvaltning er rettet mot arealbruk og plansystemet. De overlapper på forvaltningsdelen, men ikke fullt ut.',
        links: [
          { entryId: 'nmbu_skogfag', emnekoder: ['NATF200-1'], merknad: 'Vern og forvaltning av norsk natur, januarblokk.' },
          { entryId: 'inn_skogfag', emnekoder: ['6EV155-1'] },
          { entryId: 'inn_utmark_skog', emnekoder: ['6EV155-1'] },
        ],
      },
      {
        id: 'okologi', label: 'Generell økologi', kategori: 'Økologi og natur',
        desc: 'Grunnleggende økologi: populasjoner, samfunn, økosystemer og biologisk mangfold.',
        note: 'NMBUs ECOL100 er innføringsemnet på 5 sp i første studieår; ECOL200 Generell økologi er valgemne for skogfagsstudentene og har få kandidater og er derfor ikke koblet. INNs UTM1133 Økologi har erstattet 6EV133 Økologi og mangfold (15 sp).',
        links: [
          { entryId: 'nmbu_skogfag', emnekoder: ['ECOL100-1'], merknad: 'Grunnleggende økologi, 5 sp.' },
          { entryId: 'inn_skogfag', emnekoder: ['UTM1133-1', '6EV133-1'], merknad: 'Økologi; 6EV133 Økologi og mangfold er forgjengeren.' },
          { entryId: 'inn_utmark_skog', emnekoder: ['UTM1133-1', '6EV133-1'] },
        ],
      },
    ],
  },
  {
    groupId: 'skogfag2',
    note: 'Gruppen har bare to programmer, og de er bygd svært ulikt: NMBUs master er et toårig heltidsstudium på Ås med en liten obligatorisk kjerne (55 sp) og stor valgfrihet, mens INNs «Bærekraftig skogforvaltning» er et treårig nett- og samlingsbasert deltidsstudium der alle ti emnene (120 sp) er obligatoriske. INN hadde første opptak i 2024, så halvparten av emnene i studieplanen har ennå ingen rapporterte karakterer i DBH - det gjelder blant annet masteroppgaven SKO4900S, SKO4007S Beslutningsanalyse, SKO4006S Prosjektledelse og MBJ4004S Studiedesign og statistisk metode. Fordi programmene er små, er terskelen for å ta med et emne satt til minst ti kandidater samlet i perioden 2021-2025, ikke ti kandidater i siste årgang. Det er bare funnet tre reelle emnetyper. Emner som står uten motstykke og derfor ikke er koblet: NMBUs skogøkologi (SKOG304, tidligere SKS300), skoglig driftsteknikk (SKOG340), prosjektøkonomi (MINA330), treteknologi (TRE300) og tverrfaglig bærekraft (MINA320/MINA321) har ingen INN-emne; INNs bærekraftige skogproduksjon (SKO4002S), GIS (SKO4003S), areal- og eiendomsforvaltning (SKO4001S) og innføringsemnet i skogbruk (SKO2250) har ingen motsvarighet i NMBUs masterdata, fordi NMBUs skogskjøtsel- og GIS-emner ligger på bachelornivå og ikke rapporteres på masterprogrammet. Masteroppgaven er heller ikke koblet, siden INNs oppgave ennå ikke har kandidater.',
    courseTypes: [
      {
        id: 'forskningsmetode', label: 'Forskningsmetode og dataanalyse', kategori: 'Metode',
        desc: 'Vitenskapelig metode, forskningsdesign og analyse av data i skog- og naturfaglige problemstillinger.',
        note: 'NMBU byttet fra ECOL300 til MINA310 fra og med 2023, og begge kodene er tatt med. INNs andre metodeemne, MBJ4004S Studiedesign og statistisk metode (10 sp), ligger i 2. studieår og har ennå ingen rapporterte karakterer.',
        links: [
          { entryId: 'nmbu_skogfag2', emnekoder: ['MINA310-1', 'ECOL300-1'], merknad: '5 sp; obligatorisk valg mellom MINA310 og MINA311 Samfunnsvitenskapelig forskningsmetode' },
          { entryId: 'inn_skogforvaltning2', emnekoder: ['MBJ4002S-1'], merknad: '10 sp, obligatorisk i 1. studieår' },
        ],
      },
      {
        id: 'flerbruk-skog', label: 'Flerbruk og flerbruksplanlegging i skog', kategori: 'Skogfag',
        desc: 'Skogens mange bruksformål - tømmer, friluftsliv, biologisk mangfold, karbon og reindrift - og hvordan hensynene avveies mot hverandre i praktisk skogforvaltning.',
        note: 'Dette er den klareste parallellen mellom de to programmene: begge emnene er obligatoriske, går på 10 sp og ligger i første studieår.',
        links: [
          { entryId: 'nmbu_skogfag2', emnekoder: ['SKOG302-1'], merknad: '10 sp, obligatorisk; går over Augustblokk og høstparallell' },
          { entryId: 'inn_skogforvaltning2', emnekoder: ['SKO4004S-1'], merknad: '10 sp, obligatorisk i 1. studieår' },
        ],
      },
      {
        id: 'skogkartlegging-planlegging', label: 'Skogkartlegging og skogplanlegging', kategori: 'Skogfag',
        desc: 'Taksering og kartlegging av skogressurser, og bruk av ressursdataene til å sette opp og vurdere skogbruksplaner.',
        note: 'NMBU deler faget i et takseringsemne (SKOG305) og et planleggingsemne (SKOG300). Hos INN dekkes takseringsdelen av SKO4005S Ressurskartlegging, mens selve plandelen ligger i SKO4007S Beslutningsanalyse i 3. studieår, som ennå ikke har rapporterte karakterer.',
        links: [
          { entryId: 'nmbu_skogfag2', emnekoder: ['SKOG300-1', 'SKOG305-1'], merknad: 'SKOG300 Skogplanlegging (10 sp) er programmets største emne; SKOG305 Utvalgsbasert skogkartlegging (5 sp) har få kandidater' },
          { entryId: 'inn_skogforvaltning2', emnekoder: ['SKO4005S-1'], merknad: '10 sp, obligatorisk i 2. studieår' },
        ],
      },
    ],
  },
];
