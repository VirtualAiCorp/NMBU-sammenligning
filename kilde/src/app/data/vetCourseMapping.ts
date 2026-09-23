// GENERERT av scripts/build-landsam-course-mapping.py 2026-09-23 – ikke rediger for hånd.
// Kilde: data/landsam/emnekobling/*.json (manuelt kartlagt mot studieplanene).
export interface CourseTypeLink { entryId: string; emnekoder: string[]; merknad?: string; }
export interface CourseType { id: string; label: string; kategori?: string; desc?: string; note?: string; links: CourseTypeLink[]; }
export interface GroupCourseMapping { groupId: string; note?: string; courseTypes: CourseType[]; }

export const LANDSAM_COURSE_MAPPING: GroupCourseMapping[] = [
  {
    groupId: 'dyrepleie',
    note: 'NMBU og Nord bygger dyrepleierstudiet svært likt (begge er 180 sp/3-årige profesjonsutdanninger med praksis hvert år), men NMBU underviser i store, sammenslåtte emner (f.eks. ett 25 sp-emne for sykdomslære og dyrepleie), mens Nord har mange mindre emner. Nord har i tillegg byttet emnekodesystem to ganger i perioden DBH-dataene dekker (2021–2025): eldste kull (2021–2022) bruker en kodeserie med BI-/KJ-/MA-prefiks, kull 2023 en mellomserie (bl.a. DYR1001–DYR2003, BI2xxF, FIL1001, MAT1011), og kull 2024+ gjeldende kodeserie (DYR1004–DYR2009, KJE10xx, BIO10xx, MET1005, PRA20xx). Alle tre generasjoner er koblet der de finnes i karakterdataene; nyeste generasjons emner i 2. og 3. studieår (DYR2006–DYR2009, PRA2057/2058) har ingen karakterer ennå siden kull 2024 (første under gjeldende plan) først når dit i 2026/27. Rene realfagsemner uten motstykke hos NMBU (kjemi, cellebiologi, matematikk) er ikke koblet.',
    courseTypes: [
      {
        id: 'anatomi-fysiologi', label: 'Anatomi og fysiologi', kategori: 'Grunnleggende biologi',
        desc: 'Dyrets kroppsbygning og organenes normale funksjon.',
        note: 'NMBUs DYR203 er rendyrket anatomi/fysiologi (10 sp). Nords gjeldende DYR1004 er bredere og inkluderer også generell patologi (15 sp); eldre BI145F dekket bare anatomi/fysiologi for dyrepleiere (10 sp, uten patologidelen).',
        links: [
          { entryId: 'nmbu_dyrepleie', emnekoder: ['DYR203-1'] },
          { entryId: 'nord_dyrepleie', emnekoder: ['DYR1004-1', 'BI145F-1'], merknad: 'DYR1004 (gjeldende, 15 sp, inkl. generell patologi) og BI145F (kull 2021–2023, 10 sp, uten patologidel).' },
        ],
      },
      {
        id: 'atferd-stell', label: 'Atferd og dyrehold', kategori: 'Grunnleggende dyrepleie',
        desc: 'Dyrenes naturlige atferd, behov og grunnleggende stell.',
        note: 'Svært likt omfang og navn på begge programmer.',
        links: [
          { entryId: 'nmbu_dyrepleie', emnekoder: ['DYR201-1'], merknad: 'Atferd og stell, 10 sp.' },
          { entryId: 'nord_dyrepleie', emnekoder: ['DYR1006-1', 'DYR1001-1'], merknad: 'Begge heter «Atferd og dyrehold», 7,5 sp – DYR1006 er gjeldende kode (kull 2024+), DYR1001 den forrige (kull 2023 og eldre).' },
        ],
      },
      {
        id: 'sykdomslare-dyrepleie', label: 'Sykdomslære og klinisk dyrepleie', kategori: 'Klinisk dyrepleie',
        desc: 'Sykdomslære og praktisk dyrepleie ved sykdom – det faglige tyngdepunktet i studiet.',
        note: 'NMBU samler alt i ett stort emne på 25 sp i 2. studieår. Nord sprer det på flere mindre emner over 2.–3. semester (gjeldende kode) eller 2 emner (eldre kode); ernæringsdelen er lagt inn i Nords emne fra og med gjeldende plan.',
        links: [
          { entryId: 'nmbu_dyrepleie', emnekoder: ['DYR206-1'], merknad: 'Sykdomslære og dyrepleie, 25 sp.' },
          { entryId: 'nord_dyrepleie', emnekoder: ['DYR2005-1', 'DYR1002-1', 'DYR2001-1'], merknad: 'DYR2005 Sykdomslære og ernæring (gjeldende, 15 sp) tilsvarer til sammen DYR1002 Sykdomslære 1 (7,5 sp) + DYR2001 Sykdomslære 2 (5 sp) i forrige kodegenerasjon.' },
        ],
      },
      {
        id: 'farmakologi', label: 'Farmakologi og legemiddellære', kategori: 'Klinisk dyrepleie',
        desc: 'Legemidler, dosering og bruk hos dyr.',
        note: 'NMBU slår sammen infeksjonsbiologi og legemiddellære i ett emne. Nords gjeldende versjon (DYR2006) har ingen karakterer ennå; forrige generasjon hadde et rendyrket farmakologiemne (BI242F).',
        links: [
          { entryId: 'nmbu_dyrepleie', emnekoder: ['DYR204-1'], merknad: 'Infeksjonsbiologi og legemiddellære, 10 sp – legemiddeldelen er den sammenlignbare halvparten.' },
          { entryId: 'nord_dyrepleie', emnekoder: ['BI242F-1'], merknad: 'DYR2006 Klinisk dyrepleie og farmakologi (gjeldende, 22,5 sp, ingen karakterdata i DBH ennå – kull 2024 tar emnet våren 2026) og BI242F Teoretisk og anvendt farmakologi (forrige generasjon, 10 sp).' },
        ],
      },
      {
        id: 'klinisk-praksis', label: 'Klinisk praksis', kategori: 'Praksis',
        desc: 'Veiledet klinisk praksis på dyreklinikk, internt og eksternt.',
        note: 'Begge programmer har praksis hvert studieår, men NMBU deler i intern (år 1) og ekstern (år 2–3) praksis ved navngitte NMBU-/samarbeidsklinikker, mens Nord bruker en løpende serie praksisemner (PRA-kode) som øker i omfang for hvert år. Nords nyeste praksisemner (PRA2057/PRA2058) har ingen karakterer ennå.',
        links: [
          { entryId: 'nmbu_dyrepleie', emnekoder: ['DYR205-1', 'DYR207-1', 'DYR211-1'], merknad: 'Intern klinisk praksis (år 1, 20 sp), ekstern klinisk praksis (år 2, 33,5 sp) og avsluttende klinisk praksis (år 3, 16,5 sp).' },
          { entryId: 'nord_dyrepleie', emnekoder: ['PRA1000-1', 'PRA2004-1', 'PRA2024-1', 'PRA2000-1'], merknad: 'Forrige kodegenerasjon: Praktiske studier I (2,5 sp), Praktiske studier 2 (10 sp), Praktiske studier 3 (30 sp) og valgfri praksis i utlandet (20 sp). Gjeldende plans PRA2057 (7,5 sp) og PRA2058 (30 sp) har ingen karakterdata ennå.' },
        ],
      },
      {
        id: 'forsoksdyrlare', label: 'Forsøksdyrlære', kategori: 'Klinisk dyrepleie',
        desc: 'Regelverk, dyrevelferd og prosedyrer knyttet til forsøksdyr.',
        note: 'Sammenlignbart innhold og omfang.',
        links: [
          { entryId: 'nmbu_dyrepleie', emnekoder: ['DYR202-1', 'DYR202-2'], merknad: 'Forsøksdyrlære, 10 sp.' },
          { entryId: 'nord_dyrepleie', emnekoder: ['BI243F-1'], merknad: 'BI243F Forsøksdyr og eksotiske dyr (forrige generasjon, 5 sp). DYR2007 Forsøksdyr og komparativ dyrehelse (gjeldende, 7,5 sp) har ingen karakterdata i DBH ennå.' },
        ],
      },
      {
        id: 'dyrevelferd-etikk', label: 'Dyrevelferd, regelverk og yrkesetikk', kategori: 'Profesjonsfag',
        desc: 'Dyrevelferd, profesjonsetikk og regelverket dyrepleiere jobber under.',
        note: 'NMBU har dyrevelferd som egen gjennomgående tråd i alle tre studieår (flere emnekoder). Nord dekker det samme under «regelverk og yrkesetikk», som skiftet navn/kode fra kull 2024.',
        links: [
          { entryId: 'nmbu_dyrepleie', emnekoder: ['DYR208-1', 'DYR208-2', 'DYR215-1', 'VET327-1'], merknad: 'Dyrevelferd og profesjonsetikk (7 sp i 3. studieår) samt de mindre dyrevelferdsemnene DYR215 og VET327 fra tidligere kull.' },
          { entryId: 'nord_dyrepleie', emnekoder: ['BI248F-1'], merknad: 'BI248F Regelverk og yrkesetikk (forrige generasjon, 5 sp). DYR2008 Regelverk, yrkesetikk og psykisk helse (gjeldende, 7,5 sp, utvidet med psykisk helse-tema) har ingen karakterdata ennå.' },
        ],
      },
      {
        id: 'laboratoriediagnostikk', label: 'Laboratoriediagnostikk', kategori: 'Klinisk dyrepleie',
        desc: 'Laboratorieprøver og -prosedyrer i dyreklinikk.',
        note: 'Sammenlignbart innhold; Nords emne dekker i tillegg praktiske prosedyrer generelt.',
        links: [
          { entryId: 'nmbu_dyrepleie', emnekoder: ['DYR214-1'], merknad: 'Laboratoriediagnostikk, 5 sp.' },
          { entryId: 'nord_dyrepleie', emnekoder: ['DYR2004-1'], merknad: 'Prosedyrer og laboratoriearbeid i dyrepleie, 7,5 sp (gjeldende kode).' },
        ],
      },
      {
        id: 'metode-skriving', label: 'Forskningsmetodikk og akademisk skriving', kategori: 'Metode',
        desc: 'Vitenskapelig metode, statistikk og skriftlig fremstilling, som forberedelse til bacheloroppgaven.',
        note: 'Sammenlignbart formål og plassering (rett før/i forbindelse med bacheloroppgaven).',
        links: [
          { entryId: 'nmbu_dyrepleie', emnekoder: ['DYR210-1'], merknad: 'Forskningsmetodikk, statistikk og oppgaveskriving, 5 sp.' },
          { entryId: 'nord_dyrepleie', emnekoder: ['MET1005-1', 'MET2000-1'], merknad: 'MET1005 Akademisk skriving og metode (gjeldende, 7,5 sp) og MET2000 Innføring i vitenskapelig metode og skriving (forrige generasjon, 5 sp).' },
        ],
      },
      {
        id: 'oppgave', label: 'Bacheloroppgave', kategori: 'Oppgave',
        desc: 'Det selvstendige avsluttende arbeidet i graden.',
        note: 'NMBUs DYR209 (15 sp) er obligatorisk for alle. Hos Nord er bacheloroppgaven ett av to alternative valg i siste semester (det andre er to teoriemner) – DYR2009 (gjeldende, 15 sp) har ingen karakterdata ennå; DYR2000 (forrige generasjon) er mindre (10 sp).',
        links: [
          { entryId: 'nmbu_dyrepleie', emnekoder: ['DYR209-1'] },
          { entryId: 'nord_dyrepleie', emnekoder: ['DYR2000-1'], merknad: 'DYR2000 (forrige generasjon, 10 sp, med karakterdata) og DYR2009 (gjeldende, 15 sp, ingen karakterdata ennå).' },
        ],
      },
      {
        id: 'exphil-etikk', label: 'Ex. phil. / etikk og bærekraft', kategori: 'Fellesemner',
        desc: 'Examen philosophicum eller tilsvarende innføring i etikk, vitenskapsteori og (hos Nord) bærekraft.',
        note: 'NMBUs Ex.phil. arrangeres av Handelshøgskolen og er rendyrket filosofi/vitenskapsteori. Nords emne er bredere og kombinerer etikk med bærekraft og samfunnsansvar/klima – noe svakere sammenligning, men nærmeste motstykke.',
        links: [
          { entryId: 'nmbu_dyrepleie', emnekoder: ['PHI100-1', 'PHI101-1'], merknad: 'Examen philosophicum, 10 sp (vanlig eller seminarversjon).' },
          { entryId: 'nord_dyrepleie', emnekoder: ['BIO1008-1', 'FIL1001-1'], merknad: 'BIO1008 Bærekraft, klima og etikk (gjeldende, 7,5 sp) og FIL1001 Ex. Phil. Etikk, bærekraft og samfunnsansvar (forrige generasjon, 7,5 sp).' },
        ],
      },
    ],
  },
];
