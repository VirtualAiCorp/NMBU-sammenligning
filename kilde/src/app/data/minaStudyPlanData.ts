// GENERERT av scripts/build-landsam-studyplans.py 2026-09-23 – ikke rediger for hånd.
// Kilde: data/landsam/studieplaner/*.json (obligatoriske emner fra studieplanene) koblet til DBH tabell 308/208.
// Karakterer er summert over dbhEmnekoder per år; snitt A=5…F=0 over bokstavkarakterer.
import type { LandsamLevel } from './landsamAdmissionData';
import type { CourseGradeYear } from './landsamCourseData';

export interface PlanCourse {
  emnekode: string; emnenavn: string; studiepoeng: number | null; aar: number | null; semester: string | null;
  dbhEmnekoder: string[]; merknad?: string; years: CourseGradeYear[];
}
export interface PlanSpecialisation { navn: string; obligatoriske: PlanCourse[]; }
export interface ProgramStudyPlan {
  entryId: string; shortName: string; institusjon: string; isNmbu: boolean; programnavn: string;
  studieplanAar: string | null; kilder: string[]; totaltStudiepoeng: number | null; obligatoriskeStudiepoeng: number | null;
  merknad?: string; obligatoriske: PlanCourse[]; spesialiseringer: PlanSpecialisation[];
}
export interface LandsamStudyPlanGroup { id: string; label: string; level: LandsamLevel; programs: ProgramStudyPlan[]; }

export const LANDSAM_STUDYPLAN_GROUPS: LandsamStudyPlanGroup[] = [
  {
    id: 'skogfag', label: 'Skogfag', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_skogfag', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Skogfag (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/bachelor/skogfag', 'https://static02.nmbu.no/mina/studier/B-SF.php'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 145,
        merknad: 'Kilde er NMBUs fargekodede rutenett-studieplan for kull 2026 (static02.nmbu.no/mina/studier/B-SF.php), linket fra programsiden nmbu.no/studier/bachelor/skogfag. Rutenettets kolonner er 5 sp brede («5 stp/10 stp/.../30 stp»), og hvert emnes reelle studiepoeng er lest ut fra cellens colspan-verdi (colspan × 5 sp), kryssjekket mot studiepoengtallet på nmbu.no/emne/<kode> (Augustblokk/Januarblokk/Juniblokk-cellene bruker alltid full radbredde av rene formateringshensyn og er derfor IKKE brukt til å lese av studiepoeng med mindre kilden selv oppgir tallet, f.eks. «SKOG250 - 10 stp» og «TRE200 - 5 stp»). De 19 navngitte obligatoriske emnene summerer til 145 sp av totalt 180 sp. De resterende 35 sp er valgfrie: studieplanen lister syv ikke-obligatoriske eksempelplaner/anbefalte emnepakker (Økonomi- og forvaltningsfag, Datavitenskap og GIS, Skogbiologi, Skogteknologi, Kartlegging og planlegging, Skogskjøtsel, Ett semester i utlandet) uten faste obligatoriske emnelister, og krever i tillegg at studenten velger minst ett av MINA250 Tverrfaglig konsekvensanalyse (10 sp, januarblokk+vårparallell) eller NATF200 Vern og forvaltning av norsk natur (5 sp, januarblokk), anbefalt i siste semester. Siden dette er et reelt valg mellom to ulike emner med ulikt studiepoengomfang, og ikke en fast obligatorisk emnekode, er det holdt utenfor obligatoriske-listen og obligatoriskeStudiepoeng, i tråd med regelen om at obligatoriske valg mellom alternativer føres i merknad. REAL101 (Matematikk for naturvitere, 10 sp) har i studieplanen en fotnote om at MATH-INF100 (Beregningsbasert matematikk i praksis, også 10 sp) kan velges i stedet; dette er et reelt 1:1-alternativ og er derfor ført som én linje (REAL101) med merknad, tilsvarende praksis for PHI100/PHI101 i nmbu_maskin.json. Emner merket «Augustblokk» med samme emnekode som i høstparallell-raden (SKOG100 i år 1, SKOG220 i år 3) er 10 sp-emner der halvparten (5 sp, iht. kolonnebredden i høstparallell-raden) undervises i augustblokka rett før høstsemesteret og resten i selve høstparallellen; SKOG201 i år 2 er derimot en egen 5 sp-emnekode som kun står i Augustblokk-raden alene (ikke også i høstparallell-raden for år 2), og er satt til semester «høst» med augustblokk-merknad. Emnenavn er hentet fra NMBUs emnesøk (nmbu.no/emne/<kode>).',
        obligatoriske: [
          {
            emnekode: 'SKOG100', emnenavn: 'Skogforvaltning', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SKOG100-1'], merknad: '10 sp totalt, fordelt med 5 sp i augustblokk (før høstsemesteret) og 5 sp i høstparallell, jf. rutenettets kolonnebredder og NMBUs emnesøk.',
            years: [
              { year: 2021, A: 0, B: 7, C: 4, D: 7, E: 0, F: 3, G: 0, H: 0, total: 21, snitt: 2.57, strykprosent: 14.3, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 6, C: 0, D: 7, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 2.92, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 13, C: 8, D: 3, E: 0, F: 3, G: 0, H: 0, total: 27, snitt: 3.04, strykprosent: 11.1, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 16, C: 6, D: 7, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.31, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 3, B: 13, C: 8, D: 9, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.3, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'REAL101', emnenavn: 'Matematikk for naturvitere', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Studieplanen gir valget mellom REAL101 og MATH-INF100 (Beregningsbasert matematikk i praksis).',
            years: [],
          },
          {
            emnekode: 'LAD102', emnenavn: 'GIS - praktisk introduksjon', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['LAD102-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 10, total: 37, snitt: null, strykprosent: null, bestattprosent: 73, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 10, total: 30, snitt: null, strykprosent: null, bestattprosent: 66.7, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 13, total: 32, snitt: null, strykprosent: null, bestattprosent: 59.4, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 7, total: 42, snitt: null, strykprosent: null, bestattprosent: 83.3, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 7, total: 34, snitt: null, strykprosent: null, bestattprosent: 79.4, skjult: 2 },
            ],
          },
          {
            emnekode: 'JUS100', emnenavn: 'Juridisk metode og norsk rettssystem', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['JUS100-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 4, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.22, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 6, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.14, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 4, C: 5, D: 8, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 2.76, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 5, C: 11, D: 17, E: 15, F: 6, G: 0, H: 0, total: 54, snitt: 1.89, strykprosent: 11.1, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'SKOG200', emnenavn: 'Skogens biologi, økologi og produksjon', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['SKOG200-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 8, D: 4, E: 3, F: 0, G: 0, H: 0, total: 18, snitt: 2.61, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 4, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 9, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.29, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 6, D: 9, E: 3, F: 3, G: 0, H: 0, total: 21, snitt: 1.86, strykprosent: 14.3, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 9, D: 14, E: 7, F: 0, G: 0, H: 0, total: 30, snitt: 2.07, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'SKOG205', emnenavn: 'Inventering og ressurskartlegging', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['SKOG205-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.07, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 3, C: 5, D: 0, E: 0, F: 5, G: 0, H: 0, total: 13, snitt: 2.08, strykprosent: 38.5, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 9, C: 6, D: 6, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.14, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 4, B: 13, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 4, B: 7, C: 15, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'ECOL100', emnenavn: 'Innføring i økologi', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['ECOL100-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 13, D: 6, E: 4, F: 3, G: 0, H: 0, total: 29, snitt: 2.31, strykprosent: 10.3, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 6, C: 5, D: 5, E: 6, F: 0, G: 0, H: 0, total: 22, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 6, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.12, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 5, B: 6, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 14, C: 8, D: 6, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.29, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'ECN101', emnenavn: 'Samfunnsøkonomi for miljø og utvikling', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'SKOG101', emnenavn: 'Skogteknologi', studiepoeng: 5, aar: 1, semester: 'juniblokk',
            dbhEmnekoder: ['SKOG101-1', 'SKOG101-2'],
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 5, H: 0, total: 5, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'SKOG201', emnenavn: 'Skader og sykdommer på skogstrær', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['SKOG201-1'], merknad: 'Augustblokk før høstsemesteret.',
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 6, C: 6, D: 3, E: 0, F: 4, G: 0, H: 0, total: 19, snitt: 2.53, strykprosent: 21.1, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'PHI100', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['PHI100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 0, B: 0, C: 0, D: 4, E: 3, F: 0, G: 0, H: 0, total: 7, snitt: 1.57, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 0, B: 0, C: 0, D: 3, E: 0, F: 3, G: 0, H: 0, total: 6, snitt: 1, strykprosent: 50, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 4, G: 0, H: 0, total: 4, snitt: 0, strykprosent: 100, bestattprosent: null, skjult: 8 },
              { year: 2025, A: 0, B: 3, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'JORD100', emnenavn: 'Jordlære', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['JORD100-1'],
            years: [
              { year: 2022, A: 0, B: 4, C: 4, D: 3, E: 0, F: 5, G: 0, H: 0, total: 16, snitt: 2.12, strykprosent: 31.2, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 4, C: 4, D: 4, E: 0, F: 3, G: 0, H: 0, total: 15, snitt: 2.4, strykprosent: 20, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 5, C: 0, D: 10, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.67, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 5, C: 13, D: 10, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 2.82, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'SKOG202', emnenavn: 'Betydningen av insekter og sopper i produksjonsskog', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['SKOG202-1'],
            years: [
              { year: 2022, A: 0, B: 4, C: 11, D: 5, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 2.95, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2024, A: 0, B: 4, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.09, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 3, B: 7, C: 5, D: 4, E: 0, F: 3, G: 0, H: 0, total: 22, snitt: 3, strykprosent: 13.6, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'TRE200', emnenavn: 'Treteknologi I', studiepoeng: 5, aar: 2, semester: 'januarblokk',
            dbhEmnekoder: ['TRE200-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 0, total: 15, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 4, B: 6, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.93, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2025, A: 0, B: 9, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'SKOG210', emnenavn: 'Skogprodukter og materialteknologi', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['SKOG210-1'],
            years: [
              { year: 2021, A: 3, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 5, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.42, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 5, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 7, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 11, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.65, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'SKOG240', emnenavn: 'Skoglig driftsteknikk og logistikk', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['SKOG240-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.27, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 9, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 3, B: 9, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 4, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.33, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 9, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'SKOG220', emnenavn: 'Skogbehandling', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['SKOG220-1'], merknad: '10 sp totalt, fordelt med 5 sp i augustblokk (før høstsemesteret) og 5 sp i høstparallell, jf. rutenettets kolonnebredder og NMBUs emnesøk.',
            years: [
              { year: 2021, A: 3, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.82, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 3, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 4, C: 7, D: 7, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 2.83, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 3, B: 5, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.85, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 6, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.35, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'STAT100', emnenavn: 'Statistikk', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['STAT100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 3, E: 6, F: 10, G: 0, H: 0, total: 19, snitt: 0.63, strykprosent: 52.6, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 11 },
              { year: 2023, A: 0, B: 6, C: 0, D: 0, E: 5, F: 7, G: 0, H: 0, total: 18, snitt: 1.61, strykprosent: 38.9, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 3, C: 4, D: 3, E: 6, F: 9, G: 0, H: 0, total: 25, snitt: 1.44, strykprosent: 36, bestattprosent: null, skjult: 8 },
              { year: 2025, A: 3, B: 0, C: 0, D: 4, E: 10, F: 11, G: 0, H: 0, total: 28, snitt: 1.18, strykprosent: 39.3, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'SKOG250', emnenavn: 'Skogforvaltning - øvingskurs i tverrfaglig analyse', studiepoeng: 10, aar: 3, semester: 'juniblokk',
            dbhEmnekoder: ['SKOG250-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 0, total: 14, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'SKOG230', emnenavn: 'Ressursøkonomi og planlegging i skogbruket', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['SKOG230-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.42, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 10 },
              { year: 2023, A: 3, B: 6, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 8, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'inn_skogfag', shortName: 'INN', institusjon: 'Universitetet i Innlandet', isNmbu: false, programnavn: 'Skogfag (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.inn.no/studier/vare-studier/bachelor-i-skogfag/', 'https://studiekatalog.edutorium.no/inn/nb/program/SKO/'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 180,
        merknad: 'Kilde er Universitetet i Innlandets studiekatalog (studiekatalog.edutorium.no/inn/nb/program/SKO/), linket fra programsiden inn.no/studier/vare-studier/bachelor-i-skogfag/ som «Studieplan». Emnetabellen i studiekatalogen («Studiemodeller») merker samtlige 19 emner med type «O» (Obligatorisk) fordelt over seks semestre (26H, 27V, 27H, 28V, 28H, 29V) a 30 sp hvert, og programmet har verken valgfrie («V») emner eller praksisemner utover det obligatoriske SKO1170. Programmet er derfor 100 % obligatorisk, 180 av 180 sp. Studiestedet er Evenstad, undervisningsspråk norsk/engelsk (SKO1106 Applied Forest Ecology undervises på engelsk). Emnenavn er hentet direkte fra samme tabell i studiekatalogen.',
        obligatoriske: [
          {
            emnekode: 'SKO1105', emnenavn: 'Naturgrunnlaget', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SKO1105-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 9, H: 0, total: 9, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 4, total: 11, snitt: null, strykprosent: null, bestattprosent: 63.6, skjult: 1 },
              { year: 2024, A: 0, B: 3, C: 4, D: 0, E: 0, F: 0, G: 3, H: 0, total: 10, snitt: 3.43, strykprosent: 0, bestattprosent: 100, skjult: 4 },
              { year: 2025, A: 8, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.73, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'SKO1101', emnenavn: 'Skognæringen i Norge', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SKO1101-1'],
            years: [
              { year: 2021, A: 0, B: 6, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2024, A: 3, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 3, C: 18, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.14, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: '6EV153', emnenavn: 'Introduksjon til geografiske informasjonssystemer', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['6EV153-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 3, D: 6, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.33, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 17, C: 31, D: 7, E: 0, F: 5, G: 0, H: 0, total: 60, snitt: 2.92, strykprosent: 8.3, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 0, total: 15, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'SKO1103', emnenavn: 'Tømmerets verdikjede', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['SKO1103-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 13, D: 3, E: 0, F: 4, G: 0, H: 0, total: 20, snitt: 2.25, strykprosent: 20, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 0, B: 0, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 2.43, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'SKO1110', emnenavn: 'Landbruksvei', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['SKO1110-1'],
            years: [
              { year: 2021, A: 0, B: 9, C: 4, D: 5, E: 5, F: 0, G: 0, H: 0, total: 23, snitt: 2.74, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 5, D: 5, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'SKO1160', emnenavn: 'Grunnleggende økonomi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['SKO1160-1'],
            years: [
              { year: 2023, A: 5, B: 6, C: 7, D: 6, E: 6, F: 5, G: 0, H: 0, total: 35, snitt: 2.51, strykprosent: 14.3, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 4, D: 0, E: 4, F: 0, G: 0, H: 0, total: 8, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 3, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'UTM1133', emnenavn: 'Økologi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['UTM1133-1'],
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 3, snitt: 1, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 0, D: 4, E: 0, F: 5, G: 0, H: 0, total: 9, snitt: 0.89, strykprosent: 55.6, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 5, D: 9, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.36, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'SKO2202', emnenavn: 'Foryngelseshogst', studiepoeng: 15, aar: 2, semester: 'høst',
            dbhEmnekoder: ['SKO2202-1'],
            years: [
              { year: 2021, A: 5, B: 7, C: 9, D: 0, E: 3, F: 0, G: 0, H: 0, total: 24, snitt: 3.46, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 3, B: 6, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.8, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 3, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.83, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'SKO2203', emnenavn: 'Produksjonsskog', studiepoeng: 15, aar: 2, semester: 'høst',
            dbhEmnekoder: ['SKO2203-1'],
            years: [
              { year: 2021, A: 7, B: 9, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4.05, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 7, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.27, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 3, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.3, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: '6EV298', emnenavn: 'Vitenskapelig metode og statistikk', studiepoeng: 15, aar: 2, semester: 'vår',
            dbhEmnekoder: ['6EV298-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 5, D: 5, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 9, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.45, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 5, D: 5, E: 3, F: 0, G: 0, H: 0, total: 13, snitt: 2.15, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 0, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 4, F: 0, G: 0, H: 0, total: 4, snitt: 1, strykprosent: 0, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'SKO1170', emnenavn: 'Praksis i næring eller forvaltning', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['SKO1170-1'],
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 0, total: 7, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 3 },
            ],
          },
          {
            emnekode: 'SKO2260', emnenavn: 'Skogøkonomi', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['SKO2260-1'],
            years: [
              { year: 2024, A: 0, B: 3, C: 3, D: 0, E: 3, F: 0, G: 0, H: 0, total: 9, snitt: 2.67, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'SKO2153', emnenavn: 'Geografisk analyse', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['SKO2153-1'],
            years: [
              { year: 2024, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 0, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'SKO1154', emnenavn: 'Forvaltningsrett', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['SKO1154-1'],
            years: [
              { year: 2022, A: 6, B: 11, C: 5, D: 0, E: 3, F: 0, G: 0, H: 0, total: 25, snitt: 3.68, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 3, B: 3, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 3, snitt: 1, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 0, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'UTM2260', emnenavn: 'Bærekraftig næringsutvikling og innovasjon', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['UTM2260-1'],
            years: [
              { year: 2021, A: 3, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 6, B: 5, C: 5, D: 0, E: 5, F: 0, G: 0, H: 0, total: 21, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 8 },
            ],
          },
          {
            emnekode: 'SKO1106', emnenavn: 'Applied Forest Ecology', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['SKO1106-1'], merknad: 'Undervises på engelsk, både for norske og utenlandske studenter (jf. studieplanens tekst om tredje studieår).',
            years: [
              { year: 2024, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 0, D: 3, E: 0, F: 4, G: 0, H: 0, total: 7, snitt: 0.86, strykprosent: 57.1, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: '6EV155', emnenavn: 'Arealforvaltning', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['6EV155-1'],
            years: [
              { year: 2022, A: 0, B: 3, C: 7, D: 4, E: 3, F: 0, G: 0, H: 0, total: 17, snitt: 2.59, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 3, D: 5, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 2.38, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 4, G: 0, H: 0, total: 4, snitt: 0, strykprosent: 100, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'SKO2270', emnenavn: 'Flerbruksskjøtsel', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: '6EV299', emnenavn: 'Bacheloroppgave', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'nord_skogfag', shortName: 'Nord', institusjon: 'Nord universitet', isNmbu: false, programnavn: 'Skogfag (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nord.no/studier/skogfag-bachelor', 'https://www.nord.no/studier/studieplaner/skogfag-baskog-bachelor-host-2026'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 150,
        merknad: 'Kilde er Nord universitets studieplan for BASKOG, kull høst 2026 (nord.no/studier/studieplaner/skogfag-baskog-bachelor-host-2026), linket fra programsiden nord.no/studier/skogfag-bachelor. 3. år høst (5. semester, 30 sp) er et rent valgfritt semester («Valgemner») der studenten velger mellom «Emnepakke campus A», «Emnepakke campus B» eller utveksling; kildesiden viser disse kun som plassholderkoder (BASKOG-H26-CAMPUS-A/B/UTVEKSLIN) med 0 sp og lister ikke de konkrete emnene i hver pakke, så innholdet er ikke ført opp her. Disse 30 sp er holdt utenfor obligatoriske-listen og obligatoriskeStudiepoeng. I 4. semester (2. år vår) er ORG1001/STT1001 et reelt 1:1-valg mellom to obligatoriske alternativemner (markert «Obligatoriske emner – valg 1 av 2» i kilden) og er derfor ført som én linje (ORG1001) med merknad om alternativet, tilsvarende praksis for REAL101/MATH-INF100 i nmbu_skogfag.json. De 19 navngitte obligatoriske emnene (inkl. ORG1001-valget, ekskl. semester 5) summerer til 150 sp; sammen med 30 sp valgfritt semester 5 blir totalt 180 sp. Emnenavn, koder og studiepoeng er hentet direkte fra studieplan-siden.',
        obligatoriske: [
          {
            emnekode: 'KJE1001', emnenavn: 'Laboratoriesikkerhet', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: '0 sp, men obligatorisk i studieplanen.',
            years: [],
          },
          {
            emnekode: 'GEO2011', emnenavn: 'Geografisk informasjonsbehandling', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'GEO1010', emnenavn: 'Kartlære og datafangst', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO1004', emnenavn: 'Naturtyper, klima og geologi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'SKO1000', emnenavn: 'Innføring i skogfag', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SKO1000-1'],
            years: [
              { year: 2025, A: 4, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.33, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'ECO1008', emnenavn: 'Innføring i økonomi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO1008', emnenavn: 'Bærekraft, klima og etikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO1011', emnenavn: 'Innføring i botanikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'SKO1001', emnenavn: 'Metoder i skogskjøtsel', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'NAF1001', emnenavn: 'Rettslære for naturforvaltere', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MET1005', emnenavn: 'Akademisk skriving og metode', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Progresjonskrav: må være bestått før bacheloroppgaven (SKO2010).',
            years: [],
          },
          {
            emnekode: 'SKO2000', emnenavn: 'Driftsteknikk og logistikk', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MAT1001', emnenavn: 'Matematikk', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'GEO2012', emnenavn: 'Geografisk analyse', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'PRA2067', emnenavn: 'Praksis i skogfag', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Krever minst 60 sp bestått før praksis.',
            years: [],
          },
          {
            emnekode: 'SKO2001', emnenavn: 'Trevirkets anvendelse', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'ORG1001', emnenavn: 'Organisasjon', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Studieplanen lister dette som «Obligatoriske emner – valg 1 av 2», dvs. studenten velger enten ORG1001 Organisasjon eller STT1001 Statistikk.',
            years: [],
          },
          {
            emnekode: 'SKO2003', emnenavn: 'Den bærekraftige skogen', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'SKO2002', emnenavn: 'Skogens helse og dynamikk', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'SKO2010', emnenavn: 'Bacheloroppgave i skogfag', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Krever minst 90 sp bestått og bestått MET1005 Akademisk skriving og metode.',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'inn_utmark_skog', shortName: 'INN Utmarksforvaltning', institusjon: 'Universitetet i Innlandet', isNmbu: false, programnavn: 'Utmarksforvaltning (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.inn.no/studier/vare-studier/bachelor-i-utmarksforvaltning/', 'https://studiekatalog.edutorium.no/inn/nb/program/UTM'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 165,
        merknad: 'Kilde er Universitetet i Innlandets studiekatalog (studiekatalog.edutorium.no/inn/nb/program/UTM), linket fra programsiden inn.no/studier/vare-studier/bachelor-i-utmarksforvaltning/ som «Studieplan». Studiemodell-tabellen merker emnene med type «O» (obligatorisk) eller «V» (valgfritt); i semester 4 (2. år vår) og semester 5 (3. år høst) må studenten velge fordypning mellom «Forskning og forvaltning» (6AE124 Evolution / UTM2240 Praksis i viltøkologi) og «Næring og forvaltning» (SKO1160 Grunnleggende økonomi / UTM2260 Bærekraftig næringsutvikling og innovasjon), jf. tabellens egen fotnotetekst. Disse to fordypningsspesifikke valgemnene (7,5 sp hver, 15 sp totalt) er derfor ført under spesialiseringer og IKKE i obligatoriske-listen. De 18 rent obligatoriske emnene (uten valg) summerer til 165 sp; sammen med 15 sp fordypningsvalg blir totalt 180 sp per student. Studiekatalogens egen bunnsum i tabellen («Sum (195 totalt)») er en naiv sum av samtlige rader inkl. BEGGE fordypningsalternativer i hvert av de to valgsemestrene (165 + 7.5+7.5 + 7.5+7.5 = 195), ikke det reelle studiepoengomfanget en student faktisk tar (180). totaltStudiepoeng er derfor satt til 180 i tråd med standard bachelorlengde og skjemaets øvrige eksempler, ikke til kildetabellens 195. Emnenavn er hentet direkte fra samme tabell i studiekatalogen. Programmet deler flere emner med inn_skogfag (samme institusjon/studiested Evenstad): SKO1105, SKO1101, UTM1133, 6EV153, SKO1154, 6EV298, SKO2153, 6EV155, 6EV299.',
        obligatoriske: [
          {
            emnekode: 'SKO1105', emnenavn: 'Naturgrunnlaget', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SKO1105-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 3, B: 8, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.74, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 7, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.58, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'UTM1100', emnenavn: 'Biologi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['UTM1100-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 6, D: 3, E: 0, F: 5, G: 0, H: 0, total: 19, snitt: 2.32, strykprosent: 26.3, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 7, B: 4, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.79, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 7, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.54, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 5, C: 6, D: 0, E: 3, F: 0, G: 0, H: 0, total: 14, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 5, B: 3, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'SKO1101', emnenavn: 'Skognæringen i Norge', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SKO1101-1'],
            years: [
              { year: 2021, A: 0, B: 8, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 5, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.17, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'UTM1120', emnenavn: 'Ferskvannsøkologi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['UTM1120-1'],
            years: [
              { year: 2023, A: 3, B: 6, C: 3, D: 6, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 4, C: 9, D: 4, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 3, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: '6EV132', emnenavn: 'Norsk fauna', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['6EV132-1'],
            years: [
              { year: 2021, A: 3, B: 15, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.91, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 6, D: 11, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 2.35, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 9, B: 0, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.12, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'UTM1133', emnenavn: 'Økologi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['UTM1133-1'],
            years: [
              { year: 2023, A: 0, B: 6, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.46, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 5, D: 6, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 2.45, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 3, C: 4, D: 6, E: 0, F: 4, G: 0, H: 0, total: 17, snitt: 2.12, strykprosent: 23.5, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'UTM1140', emnenavn: 'Wildlife ecology', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['UTM1140-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 6, D: 3, E: 0, F: 7, G: 0, H: 0, total: 20, snitt: 2, strykprosent: 35, bestattprosent: null, skjult: 8 },
              { year: 2022, A: 5, B: 3, C: 0, D: 7, E: 3, F: 4, G: 0, H: 0, total: 22, snitt: 2.45, strykprosent: 18.2, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 4, B: 3, C: 8, D: 0, E: 0, F: 3, G: 0, H: 0, total: 18, snitt: 3.11, strykprosent: 16.7, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 4, C: 6, D: 5, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 3, B: 6, C: 6, D: 4, E: 4, F: 0, G: 0, H: 0, total: 23, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'UTM2220', emnenavn: 'Fiskeforvaltning', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['UTM2220-1'],
            years: [
              { year: 2021, A: 5, B: 8, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 3, B: 10, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.59, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 9, C: 17, D: 7, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.06, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 5, D: 5, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 5, C: 5, D: 8, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 2.83, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'UTM2140', emnenavn: 'Viltforvaltning', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['UTM2140-1'],
            years: [
              { year: 2023, A: 4, B: 6, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.93, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 7, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.64, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 4, B: 4, C: 4, D: 0, E: 0, F: 4, G: 0, H: 0, total: 16, snitt: 3, strykprosent: 25, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: '6EV153', emnenavn: 'Introduksjon til geografiske informasjonssystemer', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['6EV153-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 4, B: 16, C: 8, D: 10, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 3.37, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'SKO1154', emnenavn: 'Forvaltningsrett', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['SKO1154-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 3, B: 0, C: 7, D: 4, E: 0, F: 3, G: 0, H: 0, total: 17, snitt: 2.59, strykprosent: 17.6, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 5, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 5, B: 5, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: '6EV298', emnenavn: 'Vitenskapelig metode og statistikk', studiepoeng: 15, aar: 2, semester: 'vår',
            dbhEmnekoder: ['6EV298-1'],
            years: [
              { year: 2021, A: 0, B: 10, C: 9, D: 4, E: 0, F: 4, G: 0, H: 0, total: 27, snitt: 2.78, strykprosent: 14.8, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 9, C: 3, D: 5, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.24, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 5, D: 9, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.36, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 16, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 3, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: '6EV150', emnenavn: 'Naturoppsyn', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['6EV150-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 6, H: 0, total: 6, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'UTM1176', emnenavn: 'Large predator ecology and management', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['UTM1176-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 7, B: 4, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.06, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: '6EV175', emnenavn: 'Biomedisin', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['6EV175-1'],
            years: [
              { year: 2021, A: 0, B: 9, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 3, C: 9, D: 6, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 2.83, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 3, B: 3, C: 5, D: 5, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.25, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 4, F: 0, G: 0, H: 0, total: 4, snitt: 1, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'SKO2153', emnenavn: 'Geografisk analyse', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['SKO2153-1'],
            years: [
              { year: 2024, A: 6, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.2, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 3, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'UTM1151', emnenavn: 'Besøksforvaltning og naturveiledning', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['UTM1151-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2022, A: 0, B: 0, C: 7, D: 8, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.47, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 0, B: 4, C: 3, D: 0, E: 4, F: 0, G: 0, H: 0, total: 11, snitt: 2.64, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 3, C: 3, D: 8, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.64, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 4, D: 4, E: 3, F: 0, G: 0, H: 0, total: 11, snitt: 2.09, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: '6EV155', emnenavn: 'Arealforvaltning', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['6EV155-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 3, B: 7, C: 4, D: 0, E: 4, F: 0, G: 0, H: 0, total: 18, snitt: 3.28, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: '6EV299', emnenavn: 'Bacheloroppgave', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['6EV299-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.17, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 9, C: 8, D: 0, E: 3, F: 0, G: 0, H: 0, total: 20, snitt: 3.15, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 0, B: 8, C: 4, D: 3, E: 0, F: 3, G: 0, H: 0, total: 18, snitt: 2.78, strykprosent: 16.7, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 4, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2025, A: 6, B: 5, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Forskning og forvaltning', obligatoriske: [
          ] },
          { navn: 'Næring og forvaltning', obligatoriske: [
          ] },
        ],
      },
    ],
  },
  {
    id: 'okologi', label: 'Økologi og naturforvaltning', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_okologi', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Økologi og naturforvaltning (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/bachelor/okologi-og-naturforvaltning', 'https://static02.nmbu.no/mina/studier/B-OEN.php'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 130,
        merknad: 'Kilde er NMBUs fargekodede rutenett-studieplan for kull 2026 (static02.nmbu.no/mina/studier/B-OEN.php, programkode B-ØN), linket fra programsiden nmbu.no/studier/bachelor/okologi-og-naturforvaltning. Studiepoeng er lest av fra cellenes colspan (kolonnebredde 5 sp) i rutenettet, kryssjekket mot nmbu.no/emne/<kode>. De 17 navngitte obligatoriske emnene (NATF100 og MINA250 telt én gang hver, selv om de fordeler seg over to rader/semestre i rutenettet) summerer til 130 sp av totalt 180 sp. De resterende 50 sp er dels valgfrie eksempelplaner/fordypningspakker uten faste obligatoriske emnelister (Fiske- og viltforvaltning, Ferskvannsforvaltning, Forurensning, Skogforvaltning, Zoologisk fordypning, Botanisk fordypning, Miljøøkonomi, Fornybar energi, Naturbasert reiseliv, Biologi, utenlandsopphold høst/vår, ett semester på Svalbard), dels to obligatoriske valg utenfor rutenettet: «Velg minst ett av følgende emner» (GEO100 Geologi 10 sp eller JORD100 Jordlære 5 sp, begge høstparallell) og «Pluss minst ett av følgende emner» (NATF230 Viltbiologi og forvaltning 15 sp høstparallell, NATF240 Fiskeøkologi og forvaltning 10 sp vårparallell, eller VANN210 Ferskvannsøkologi 10 sp høstparallell). Disse to valgene har alternativer med ulikt studiepoengomfang og er derfor holdt utenfor obligatoriske-listen og obligatoriskeStudiepoeng, i tråd med regelen om at obligatoriske valg mellom alternativer føres i merknad. Feltkurs-komponentene nevnt i juniblokk (i ZOOL100/ZOOL220/BOT100 i år 1, og i ZOOL210/BOT270 i år 2) er del av de respektive emnene, ikke egne emnekoder, og er derfor ikke ført opp separat. Emnenavn er hentet fra NMBUs emnesøk (nmbu.no/emne/<kode>).',
        obligatoriske: [
          {
            emnekode: 'NATF100', emnenavn: 'Innføringskurs i naturforvaltning', studiepoeng: 10, aar: 1, semester: 'helår',
            dbhEmnekoder: ['NATF100-1'], merknad: '10 sp, undervises både i augustblokk/høstparallell og i vårparallell (5 sp hvert semester, iht. rutenettets kolonnebredder).',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 0, total: 35, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 30, H: 0, total: 30, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 0, total: 32, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 0, total: 29, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 0, total: 32, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'ZOOL100', emnenavn: 'Generell zoologi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ZOOL100-1'],
            years: [
              { year: 2021, A: 10, B: 12, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 4.03, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 10, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.71, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 10, B: 8, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.17, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 7, B: 13, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.35, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 11, B: 11, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.97, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'MATH-INF100', emnenavn: 'Beregningsbasert matematikk i praksis', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'PHI100', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['PHI100-1'], merknad: 'Studieplanen gir valget mellom PHI100 og seminarversjonen PHI101 (samme forelesninger, ulikt seminar-/vurderingsopplegg).',
            years: [
              { year: 2021, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 6, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'NATF200', emnenavn: 'Vern og forvaltning av norsk natur', studiepoeng: 5, aar: 1, semester: 'januarblokk',
            dbhEmnekoder: ['NATF200-1'],
            years: [
              { year: 2021, A: 9, B: 12, C: 7, D: 6, E: 3, F: 0, G: 0, H: 0, total: 37, snitt: 3.49, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 3, B: 6, C: 8, D: 5, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.32, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 5, B: 17, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.87, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 9, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 11, B: 10, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4.14, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'BOT100', emnenavn: 'Plantediversitet', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BOT100-1'],
            years: [
              { year: 2021, A: 3, B: 17, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.77, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 7, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.76, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 9, C: 12, D: 3, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.25, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 13, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.4, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 10, C: 9, D: 4, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.26, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'ZOOL220', emnenavn: 'Insekter og edderkoppdyr', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['ZOOL220-1'],
            years: [
              { year: 2021, A: 4, B: 15, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.85, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 3, B: 11, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 13, C: 14, D: 4, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.29, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 10, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.37, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 4, B: 7, C: 13, D: 4, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.39, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'KJM100', emnenavn: 'Generell kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM100-1'],
            years: [
              { year: 2021, A: 0, B: 12, C: 11, D: 6, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.21, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 9, C: 3, D: 3, E: 3, F: 0, G: 0, H: 0, total: 18, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 3, B: 11, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.77, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 7, B: 5, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.76, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 14, B: 4, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.21, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'SKOG102', emnenavn: 'Innføring i skogforvaltning', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['SKOG102-1'], merknad: 'Studieplanens fotnote sier at SKOG100 (Skogforvaltning) kan tas i stedet for SKOG102; NMBUs emnesøk oppgir SKOG100 til 10 sp mot SKOG102s 5 sp, så de to alternativene er ikke nødvendigvis like store i praksis – uoverensstemmelsen er ikke videre forklart i kilden.',
            years: [
              { year: 2021, A: 0, B: 8, C: 11, D: 3, E: 5, F: 0, G: 0, H: 0, total: 27, snitt: 2.81, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 5, B: 6, C: 5, D: 7, E: 5, F: 0, G: 0, H: 0, total: 28, snitt: 2.96, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 13, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.72, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 8, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 8, B: 14, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'STAT100', emnenavn: 'Statistikk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['STAT100-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 5, D: 4, E: 7, F: 10, G: 0, H: 0, total: 31, snitt: 1.61, strykprosent: 32.3, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 10, B: 4, C: 8, D: 0, E: 3, F: 0, G: 0, H: 0, total: 25, snitt: 3.72, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 3, B: 8, C: 6, D: 6, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.35, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 5, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 6, B: 0, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'LAD102', emnenavn: 'GIS - praktisk introduksjon', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['LAD102-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 31, H: 3, total: 34, snitt: null, strykprosent: null, bestattprosent: 91.2, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 4 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 3, total: 24, snitt: null, strykprosent: null, bestattprosent: 87.5, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'ZOOL210', emnenavn: 'Virveldyr', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['ZOOL210-1'],
            years: [
              { year: 2021, A: 8, B: 16, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.85, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 6, B: 17, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4.04, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 9, B: 10, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4.22, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 6, B: 15, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4.08, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 5, B: 11, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.95, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'ECOL200', emnenavn: 'Generell økologi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['ECOL200-1'],
            years: [
              { year: 2021, A: 5, B: 8, C: 13, D: 6, E: 5, F: 0, G: 0, H: 0, total: 37, snitt: 3.05, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 4, B: 10, C: 16, D: 4, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.41, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'ECN170', emnenavn: 'Miljø- og ressursøkonomi', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['ECN170-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 38, H: 6, total: 44, snitt: null, strykprosent: null, bestattprosent: 86.4, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 41, H: 3, total: 44, snitt: null, strykprosent: null, bestattprosent: 93.2, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 4, total: 32, snitt: null, strykprosent: null, bestattprosent: 87.5, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 4 },
            ],
          },
          {
            emnekode: 'BOT270', emnenavn: 'Kartlegging av natur', studiepoeng: 5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BOT270-1'],
            years: [
              { year: 2021, A: 4, B: 10, C: 16, D: 5, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.37, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 3, B: 12, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 3, B: 6, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.55, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 6, C: 23, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.21, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 5, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'JUS201', emnenavn: 'Offentlig saksbehandling og forvaltningsrett', studiepoeng: 5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['JUS201-1'],
            years: [
              { year: 2021, A: 0, B: 15, C: 16, D: 0, E: 0, F: 6, G: 0, H: 0, total: 37, snitt: 2.92, strykprosent: 16.2, bestattprosent: null, skjult: 8 },
              { year: 2022, A: 3, B: 10, C: 4, D: 3, E: 3, F: 0, G: 0, H: 0, total: 23, snitt: 3.3, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 4, B: 7, C: 6, D: 0, E: 0, F: 5, G: 0, H: 0, total: 22, snitt: 3, strykprosent: 22.7, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 11, C: 14, D: 3, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.29, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 4, B: 7, C: 9, D: 7, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.3, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MINA250', emnenavn: 'Tverrfaglig konsekvensanalyse', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['MINA250-1'], merknad: '10 sp, undervises i januarblokk og vårparallell (5 sp hvert, iht. rutenettets kolonnebredder).',
            years: [
              { year: 2023, A: 5, B: 19, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 25, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 11, B: 14, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 4.2, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'ECOL201', emnenavn: 'Økologisk fordypningsoppgave', studiepoeng: 5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['ECOL201-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 6, H: 0, total: 6, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 6, H: 0, total: 6, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 3, H: 0, total: 3, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'inn_utmarksforvaltning', shortName: 'INN', institusjon: 'Universitetet i Innlandet', isNmbu: false, programnavn: 'Utmarksforvaltning (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.inn.no/studier/vare-studier/bachelor-i-utmarksforvaltning/', 'https://studiekatalog.edutorium.no/inn/nb/program/UTM'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 165,
        merknad: 'Kilde er Universitetet i Innlandets studiekatalog (studiekatalog.edutorium.no/inn/nb/program/UTM), linket fra programsiden inn.no/studier/vare-studier/bachelor-i-utmarksforvaltning/ som «Studieplan». Studiemodell-tabellen merker emnene med type «O» (obligatorisk) eller «V» (valgfritt); i semester 4 (2. år vår) og semester 5 (3. år høst) må studenten velge fordypning mellom «Forskning og forvaltning» (6AE124 Evolution / UTM2240 Praksis i viltøkologi) og «Næring og forvaltning» (SKO1160 Grunnleggende økonomi / UTM2260 Bærekraftig næringsutvikling og innovasjon), jf. tabellens egen fotnotetekst. Disse to fordypningsspesifikke valgemnene (7,5 sp hver, 15 sp totalt) er derfor ført under spesialiseringer og IKKE i obligatoriske-listen. De 18 rent obligatoriske emnene (uten valg) summerer til 165 sp; sammen med 15 sp fordypningsvalg blir totalt 180 sp per student. Studiekatalogens egen bunnsum i tabellen («Sum (195 totalt)») er en naiv sum av samtlige rader inkl. BEGGE fordypningsalternativer i hvert av de to valgsemestrene (165 + 7.5+7.5 + 7.5+7.5 = 195), ikke det reelle studiepoengomfanget en student faktisk tar (180). totaltStudiepoeng er derfor satt til 180 i tråd med standard bachelorlengde og skjemaets øvrige eksempler, ikke til kildetabellens 195. Emnenavn er hentet direkte fra samme tabell i studiekatalogen. Programmet deler flere emner med inn_skogfag (samme institusjon/studiested Evenstad): SKO1105, SKO1101, UTM1133, 6EV153, SKO1154, 6EV298, SKO2153, 6EV155, 6EV299.',
        obligatoriske: [
          {
            emnekode: 'SKO1105', emnenavn: 'Naturgrunnlaget', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SKO1105-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 3, B: 8, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.74, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 7, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.58, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'UTM1100', emnenavn: 'Biologi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['UTM1100-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 6, D: 3, E: 0, F: 5, G: 0, H: 0, total: 19, snitt: 2.32, strykprosent: 26.3, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 7, B: 4, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.79, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 7, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.54, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 5, C: 6, D: 0, E: 3, F: 0, G: 0, H: 0, total: 14, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 5, B: 3, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'SKO1101', emnenavn: 'Skognæringen i Norge', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SKO1101-1'],
            years: [
              { year: 2021, A: 0, B: 8, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 5, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.17, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'UTM1120', emnenavn: 'Ferskvannsøkologi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['UTM1120-1'],
            years: [
              { year: 2023, A: 3, B: 6, C: 3, D: 6, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 4, C: 9, D: 4, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 3, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: '6EV132', emnenavn: 'Norsk fauna', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['6EV132-1'],
            years: [
              { year: 2021, A: 3, B: 15, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.91, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 6, D: 11, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 2.35, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 9, B: 0, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.12, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'UTM1133', emnenavn: 'Økologi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['UTM1133-1'],
            years: [
              { year: 2023, A: 0, B: 6, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.46, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 5, D: 6, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 2.45, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 3, C: 4, D: 6, E: 0, F: 4, G: 0, H: 0, total: 17, snitt: 2.12, strykprosent: 23.5, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'UTM1140', emnenavn: 'Wildlife ecology', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['UTM1140-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 6, D: 3, E: 0, F: 7, G: 0, H: 0, total: 20, snitt: 2, strykprosent: 35, bestattprosent: null, skjult: 8 },
              { year: 2022, A: 5, B: 3, C: 0, D: 7, E: 3, F: 4, G: 0, H: 0, total: 22, snitt: 2.45, strykprosent: 18.2, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 4, B: 3, C: 8, D: 0, E: 0, F: 3, G: 0, H: 0, total: 18, snitt: 3.11, strykprosent: 16.7, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 4, C: 6, D: 5, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 3, B: 6, C: 6, D: 4, E: 4, F: 0, G: 0, H: 0, total: 23, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'UTM2220', emnenavn: 'Fiskeforvaltning', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['UTM2220-1'],
            years: [
              { year: 2021, A: 5, B: 8, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 3, B: 10, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.59, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 9, C: 17, D: 7, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.06, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 5, D: 5, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 5, C: 5, D: 8, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 2.83, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'UTM2140', emnenavn: 'Viltforvaltning', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['UTM2140-1'],
            years: [
              { year: 2023, A: 4, B: 6, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.93, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 7, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.64, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 4, B: 4, C: 4, D: 0, E: 0, F: 4, G: 0, H: 0, total: 16, snitt: 3, strykprosent: 25, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: '6EV153', emnenavn: 'Introduksjon til geografiske informasjonssystemer', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['6EV153-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 4, B: 16, C: 8, D: 10, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 3.37, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'SKO1154', emnenavn: 'Forvaltningsrett', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['SKO1154-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 3, B: 0, C: 7, D: 4, E: 0, F: 3, G: 0, H: 0, total: 17, snitt: 2.59, strykprosent: 17.6, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 5, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 5, B: 5, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: '6EV298', emnenavn: 'Vitenskapelig metode og statistikk', studiepoeng: 15, aar: 2, semester: 'vår',
            dbhEmnekoder: ['6EV298-1'],
            years: [
              { year: 2021, A: 0, B: 10, C: 9, D: 4, E: 0, F: 4, G: 0, H: 0, total: 27, snitt: 2.78, strykprosent: 14.8, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 9, C: 3, D: 5, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.24, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 5, D: 9, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.36, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 16, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 3, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: '6EV150', emnenavn: 'Naturoppsyn', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['6EV150-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 6, H: 0, total: 6, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'UTM1176', emnenavn: 'Large predator ecology and management', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['UTM1176-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 7, B: 4, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.06, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: '6EV175', emnenavn: 'Biomedisin', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['6EV175-1'],
            years: [
              { year: 2021, A: 0, B: 9, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 3, C: 9, D: 6, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 2.83, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 3, B: 3, C: 5, D: 5, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.25, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 4, F: 0, G: 0, H: 0, total: 4, snitt: 1, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'SKO2153', emnenavn: 'Geografisk analyse', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['SKO2153-1'],
            years: [
              { year: 2024, A: 6, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.2, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 3, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'UTM1151', emnenavn: 'Besøksforvaltning og naturveiledning', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['UTM1151-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2022, A: 0, B: 0, C: 7, D: 8, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.47, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 0, B: 4, C: 3, D: 0, E: 4, F: 0, G: 0, H: 0, total: 11, snitt: 2.64, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 3, C: 3, D: 8, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.64, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 4, D: 4, E: 3, F: 0, G: 0, H: 0, total: 11, snitt: 2.09, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: '6EV155', emnenavn: 'Arealforvaltning', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['6EV155-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 3, B: 7, C: 4, D: 0, E: 4, F: 0, G: 0, H: 0, total: 18, snitt: 3.28, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: '6EV299', emnenavn: 'Bacheloroppgave', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['6EV299-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.17, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 9, C: 8, D: 0, E: 3, F: 0, G: 0, H: 0, total: 20, snitt: 3.15, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 0, B: 8, C: 4, D: 3, E: 0, F: 3, G: 0, H: 0, total: 18, snitt: 2.78, strykprosent: 16.7, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 4, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2025, A: 6, B: 5, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Forskning og forvaltning', obligatoriske: [
          ] },
          { navn: 'Næring og forvaltning', obligatoriske: [
          ] },
        ],
      },
      {
        entryId: 'nord_naturforvaltning', shortName: 'Nord', institusjon: 'Nord universitet', isNmbu: false, programnavn: 'Naturforvaltning (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nord.no/studier/naturforvaltning-bachelor', 'https://www.nord.no/studier/studieplaner/naturforvaltning-224-bachelor-host-2026'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 135,
        merknad: 'Kilde er Nord universitets studieplan for Naturforvaltning (kode 224), kull høst 2026 (nord.no/studier/studieplaner/naturforvaltning-224-bachelor-host-2026), linket fra programsiden nord.no/studier/naturforvaltning-bachelor. Programmet er 180 sp totalt. 4. semester (2. år vår) er et rent valgfritt semester (30 sp) der studenten velger 4 av 7 tilbudte valgemner à 7,5 sp (NAF2003 Internasjonal naturforvaltning, BIO2015 Molekylær økologi, GEO2012 Geografisk analyse, MAT1014 Matematikk og statistikk, NAF2004 Naturovervåking, BIO2008 Atferd og evolusjon, BIO2027 Zoologi 2); samme emnepool tilbys på nytt i 6. semester der studenten i tillegg velger 1 av de 7 (7,5 sp) for å fylle opp semesteret sammen med NAF2008 og andre del av bacheloroppgaven. Siden dette er en fri valgfagpool (ikke faste obligatoriske spesialiseringsretninger), er den holdt utenfor obligatoriske-listen og spesialiseringer, kun beskrevet her, tilsvarende praksis for valgfagpoolen i uia_ing_mekatronikk.json. De 18 navngitte obligatoriske emnene (BAC360 telt én gang) summerer til 135 sp; sammen med 30+7,5=37,5 sp valgfritt gir det 172,5 sp – kildesiden viser et gap på 7,5 sp i 5. semester (høst, 3. år) der summen av oppførte emner (NAF2007+GEO2014+ØKO2003+BAC360 del 1 à 0 sp) bare blir 22,5 sp av forventet 30 sp; dette er ikke forklart i kilden og trolig en visningsdetalj knyttet til at bacheloroppgavens første del krediteres med 0 sp inntil den er fullført. totaltStudiepoeng er satt til 180 i tråd med programsidens eget oppgitte «Studiepoeng: 180». Emnenavn, koder og studiepoeng er hentet direkte fra studieplan-siden.',
        obligatoriske: [
          {
            emnekode: 'KJE1001', emnenavn: 'Laboratoriesikkerhet', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJE1001-1'], merknad: '0 sp, men obligatorisk i studieplanen.',
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'GEO1010', emnenavn: 'Kartlære og datafangst', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['GEO1010-1'],
            years: [
              { year: 2024, A: 0, B: 0, C: 4, D: 9, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 2.31, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 4, C: 11, D: 4, E: 6, F: 0, G: 0, H: 0, total: 25, snitt: 2.52, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO1004', emnenavn: 'Naturtyper, klima og geologi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO1004-1'],
            years: [
              { year: 2024, A: 0, B: 5, C: 4, D: 0, E: 0, F: 3, G: 0, H: 0, total: 12, snitt: 2.67, strykprosent: 25, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 3, B: 5, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'NAF1000', emnenavn: 'Fisk- og viltforvaltning', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['NAF1000-1'],
            years: [
              { year: 2024, A: 8, B: 3, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 9, B: 5, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.1, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'KJE1000', emnenavn: 'Grunnleggende kjemi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJE1000-1'],
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 5, E: 4, F: 5, G: 0, H: 0, total: 14, snitt: 1, strykprosent: 35.7, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 18, G: 0, H: 0, total: 18, snitt: 0, strykprosent: 100, bestattprosent: null, skjult: 8 },
            ],
          },
          {
            emnekode: 'BIO1014', emnenavn: 'Innføring i zoologi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO1011', emnenavn: 'Innføring i botanikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO1011-1'],
            years: [
              { year: 2025, A: 0, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'BIO1009', emnenavn: 'Cellebiologi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO1009-1'],
            years: [
              { year: 2025, A: 0, B: 3, C: 3, D: 3, E: 0, F: 5, G: 0, H: 0, total: 14, snitt: 1.93, strykprosent: 35.7, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'BIO1008', emnenavn: 'Bærekraft, klima og etikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO1008-1'],
            years: [
              { year: 2025, A: 0, B: 6, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.46, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MET1005', emnenavn: 'Akademisk skriving og metode', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MET1005-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'GEO2011', emnenavn: 'Geografisk informasjonsbehandling', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['GEO2011-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 8, D: 4, E: 4, F: 0, G: 0, H: 0, total: 16, snitt: 2.25, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'NAF1001', emnenavn: 'Rettslære for naturforvaltere', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['NAF1001-1'],
            years: [
              { year: 2025, A: 0, B: 3, C: 6, D: 5, E: 3, F: 0, G: 0, H: 0, total: 17, snitt: 2.53, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'ØKO2002', emnenavn: 'Populasjonsøkologi', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['ØKO2002-1'],
            years: [
              { year: 2025, A: 4, B: 5, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'NAF2007', emnenavn: 'Arealbruk i naturforvaltning', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'GEO2014', emnenavn: 'Arealplanlegging', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'ØKO2003', emnenavn: 'Økosystemer og miljøutfordringer', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'NAF2008', emnenavn: 'Forvaltning av biologisk mangfold', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BAC360', emnenavn: 'Bacheloroppgave i naturforvaltning', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BAC360-1'], merknad: 'Registreres i to deler: «1/2» i 5. semester (høst, 0 sp vist) og «2/2» i 6. semester (vår, 15 sp), ført her samlet som ett emne på 15 sp i 3. år vår.',
            years: [
              { year: 2021, A: 0, B: 12, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 5, B: 9, C: 7, D: 7, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 6, B: 7, C: 7, D: 5, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 4, B: 10, C: 11, D: 3, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.54, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 3, B: 10, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.89, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'usn_naturmiljoforvaltning', shortName: 'USN', institusjon: 'Universitetet i Sørøst-Norge', isNmbu: false, programnavn: 'Natur- og miljøforvaltning (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.usn.no/studier/bachelor-i-natur-og-miljoforvaltning/', 'https://www.usn.no/studier/studie-og-emneplaner/#/studieplan/315_2026_HØST'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 97.5,
        merknad: 'Kilde er USNs interaktive studiemodell for Bachelor i natur- og miljøforvaltning, kull 2026 høst (studieprogramkode 315), tilgjengelig via nettleservirkomponenten på usn.no/studier/studie-og-emneplaner/#/studieplan/315_2026_HØST (rute #/studiemodel/315_2026_HØST viser selve emnetabellen). Siden er en JavaScript-app (web components) der studiemodell-tabellen bare lastes ved navigering internt i appen, og innholdet er derfor hentet ut direkte fra den renderte DOM-strukturen. USNs egen tabell skiller eksplisitt mellom «Obligatoriske emner» (97,5 sp, de 12 emnene i obligatoriske-listen over, fordelt 2026 høst / 2027 vår / 2027 høst / 2028 vår) og «Valgemner» (82,5 sp i 3.–6. semester). Valgemnene er ikke frie, men styrt av flere obligatoriske delvalg: 3. semester (7,5 sp, 2027 høst) krever minst én av FM201 Arbeidsmiljø og HMS eller NF210 Vegetasjonsøkologi; 4. semester (15 sp, 2028 vår) krever minst to av FM202 Fysiologi og toksikologi, FM203 Grunnvann og vannforsyning, NF211 Populasjons- og adferdsøkologi, NF212 Viltøkologi og viltforvaltning; 5. semester (30 sp, 2028 høst, «utviklingssemesteret») krever minst én av NMARB30 Arbeidslivsrelevant praksis eller NMBA30 Bacheloroppgave (begge 30 sp) – altså er selve bacheloroppgaven her et reelt alternativ til praksis, ikke fast obligatorisk, og studenter kan i stedet reise på utveksling eller til UNIS/Svalbard; 6. semester (30 sp, 2029 vår) krever minst fire av FM204 Miljøforurensning (15 sp), NM113 Soil Ecology, NM115 Ferskvannsfisk og vannressursforvaltning, NF213 Naturkartlegging og overvåking, NF214 Wildlife Conflict Management, NM117 Naturvariasjon satt i system (NiN). Siden alle disse er kategorisert som «Valgemner» av kilden selv (ikke «Obligatoriske emner»), og alternativene har ulikt studiepoengomfang/antall som skal velges, er de holdt utenfor obligatoriske-listen og obligatoriskeStudiepoeng, og bare beskrevet her, i tråd med regelen om at obligatoriske valg mellom alternativer føres i merknad. 97,5 sp obligatorisk + 82,5 sp valgfritt (med de nevnte delkravene) = 180 sp totalt, i samsvar med programsidens «Studiepoeng: 180».',
        obligatoriske: [
          {
            emnekode: 'NM101', emnenavn: 'Geologi og landskap', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['NM101-1'],
            years: [
              { year: 2022, A: 11, B: 12, C: 15, D: 6, E: 0, F: 0, G: 0, H: 0, total: 44, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 7, B: 7, C: 8, D: 3, E: 0, F: 3, G: 0, H: 0, total: 28, snitt: 3.32, strykprosent: 10.7, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 4, B: 11, C: 12, D: 4, E: 4, F: 0, G: 0, H: 0, total: 35, snitt: 3.2, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 15, B: 7, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 4.28, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'NM102', emnenavn: 'Bærekraftsmål og bevaringsbiologi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['NM102-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 51, H: 0, total: 51, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 6, B: 23, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 12, B: 12, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 4.16, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'NM103', emnenavn: 'Økologi og evolusjon', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['NM103-1'],
            years: [
              { year: 2022, A: 11, B: 9, C: 9, D: 7, E: 4, F: 4, G: 0, H: 0, total: 44, snitt: 3.09, strykprosent: 9.1, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 5, B: 7, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 6, C: 14, D: 11, E: 0, F: 5, G: 0, H: 0, total: 36, snitt: 2.44, strykprosent: 13.9, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 9, B: 12, C: 5, D: 5, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.81, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'NM104', emnenavn: 'Klima og Miljø', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['NM104-1'],
            years: [
              { year: 2023, A: 3, B: 5, C: 5, D: 12, E: 6, F: 14, G: 0, H: 0, total: 45, snitt: 1.78, strykprosent: 31.1, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 0, C: 4, D: 6, E: 6, F: 10, G: 0, H: 0, total: 26, snitt: 1.15, strykprosent: 38.5, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 4, B: 4, C: 9, D: 10, E: 3, F: 15, G: 0, H: 0, total: 45, snitt: 1.91, strykprosent: 33.3, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'NM105', emnenavn: 'Cellebiologi og genetikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['NM105-1'],
            years: [
              { year: 2023, A: 8, B: 12, C: 7, D: 7, E: 0, F: 4, G: 0, H: 0, total: 38, snitt: 3.24, strykprosent: 10.5, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 11, B: 5, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.26, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 10, B: 8, C: 6, D: 6, E: 0, F: 3, G: 0, H: 0, total: 33, snitt: 3.39, strykprosent: 9.1, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'NM106', emnenavn: 'Floristikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['NM106-1'],
            years: [
              { year: 2023, A: 21, B: 11, C: 3, D: 3, E: 0, F: 3, G: 0, H: 0, total: 41, snitt: 4, strykprosent: 7.3, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 5, B: 10, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.81, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 12, B: 10, C: 9, D: 3, E: 0, F: 8, G: 0, H: 0, total: 42, snitt: 3.17, strykprosent: 19, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'NM107', emnenavn: 'Faunistikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['NM107-1'],
            years: [
              { year: 2023, A: 6, B: 21, C: 10, D: 5, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 8, B: 6, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.86, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 3, B: 7, C: 16, D: 6, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.22, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'NM109', emnenavn: 'Arealplanlegging', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['NM109-1'],
            years: [
              { year: 2023, A: 6, B: 22, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 3.81, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 16, B: 16, C: 19, D: 8, E: 0, F: 0, G: 0, H: 0, total: 59, snitt: 3.68, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'NM110', emnenavn: 'Anvendt statistikk', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['NM110-1'],
            years: [
              { year: 2023, A: 7, B: 8, C: 9, D: 9, E: 7, F: 0, G: 0, H: 0, total: 40, snitt: 2.98, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 17, B: 16, C: 13, D: 9, E: 3, F: 0, G: 0, H: 0, total: 58, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'GIS3000', emnenavn: 'Geografiske informasjonssystemer', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['GIS3000-1'],
            years: [
              { year: 2023, A: 4, B: 14, C: 12, D: 7, E: 3, F: 0, G: 0, H: 0, total: 40, snitt: 3.23, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 8, D: 8, E: 5, F: 0, G: 0, H: 0, total: 21, snitt: 2.14, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 0, B: 9, C: 12, D: 5, E: 3, F: 4, G: 0, H: 0, total: 33, snitt: 2.58, strykprosent: 12.1, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'NM111', emnenavn: 'Ferskvannsøkologi', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['NM111-1'],
            years: [
              { year: 2024, A: 0, B: 12, C: 18, D: 0, E: 0, F: 8, G: 0, H: 0, total: 38, snitt: 2.68, strykprosent: 21.1, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 0, B: 0, C: 6, D: 7, E: 0, F: 6, G: 0, H: 0, total: 19, snitt: 1.68, strykprosent: 31.6, bestattprosent: null, skjult: 13 },
            ],
          },
          {
            emnekode: 'NM112', emnenavn: 'Anvendt kjemi', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['NM112-1'],
            years: [
              { year: 2024, A: 3, B: 8, C: 7, D: 15, E: 0, F: 9, G: 0, H: 0, total: 42, snitt: 2.33, strykprosent: 21.4, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 3, B: 6, C: 6, D: 4, E: 9, F: 4, G: 0, H: 0, total: 32, snitt: 2.31, strykprosent: 12.5, bestattprosent: null, skjult: 1 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uit_biologi', shortName: 'UiT Biologi', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Biologi (bachelor)',
        studieplanAar: '2025/2026', kilder: ['https://uit.no/utdanning/program/274284/biologi_-_bachelor', 'https://uit.no/Content/868704/cache=20263108123957/Studieplan_B-BIO_f.o.m._kull_2025.pdf'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 150,
        merknad: 'Kilde er UiTs studieplan for Bachelorgradsprogram i biologi (B-BIO), godkjent 19.9.2024, gjeldende f.o.m. kull 2025 (PDF hentet fra uit.no, lenket fra programsiden uit.no/utdanning/program/274284/biologi_-_bachelor). 5. semester (3. år høst, 30 sp) er et rent valgfritt semester («Valgemne/UNIS/Utveksling» i alle tre kolonner) uten faste emnekoder oppgitt i studieplanens oppbygningstabell, og er derfor holdt utenfor obligatoriske-listen. De 14 navngitte obligatoriske emnene (inkl. MNF-2001-valget) summerer til 150 sp; sammen med 30 sp valgfritt 5. semester blir det 180 sp totalt, i samsvar med studieplanens «Studieprogrammet består av 180 studiepoeng». Studieplanen selv bryter ikke ned de 180 sp i obligatorisk/valgfritt på samme måte som denne filen, men beskriver at 120 sp er biologirelaterte emner, 10 sp kjemi, 10 sp filosofi/vitenskapsteori, og at studenten i tillegg velger 10 sp mikroemner eller praksis (MNF-2001) — dette er konsistent med tabellen over. Emnekoden for emnet i 2. semester er i kildens egen tabell oppgitt som «MBI-1xxx» (ikke en fullstendig, spesifikk kode); dette er gjengitt uendret. studieplanAar er satt til 2025/2026 fordi kildedokumentet eksplisitt gjelder «f.o.m. kull 2025» og ingen nyere versjon ble funnet.',
        obligatoriske: [
          {
            emnekode: 'BIO-1009', emnenavn: 'Biologiske ressurser i nord', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO-1009-1'],
            years: [
              { year: 2025, A: 4, B: 9, C: 6, D: 4, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO-1010', emnenavn: 'Evolusjon og adferd', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO-1010-1'],
            years: [
              { year: 2025, A: 17, B: 6, C: 0, D: 8, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 4.03, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIO-1011', emnenavn: 'Økologi og biologisk mangfold', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO-1011-1'],
            years: [
              { year: 2025, A: 3, B: 12, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.72, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'FIL-0700', emnenavn: 'Ex. Phil.', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['FIL-0700-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 8, D: 6, E: 0, F: 3, G: 0, H: 0, total: 20, snitt: 2.4, strykprosent: 15, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 4, B: 6, C: 10, D: 5, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 9, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.3, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 4, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.08, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 5, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 10 },
            ],
          },
          {
            emnekode: 'MBI-1xxx', emnenavn: 'Molekylær- og cellebiologi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Studieplanens egen oppbygningstabell oppgir emnekoden som «MBI-1xxx» (uspesifisert), uten en fast firesifret kode. Gjengitt slik kilden selv skriver det, jf. regelen om å aldri finne opp emnekoder.',
            years: [],
          },
          {
            emnekode: 'BIO-1104', emnenavn: 'Zoologi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO-1104-1'],
            years: [
              { year: 2021, A: 3, B: 9, C: 20, D: 11, E: 0, F: 0, G: 0, H: 0, total: 43, snitt: 3.09, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 5, B: 10, C: 18, D: 5, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 3.39, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 5, C: 7, D: 6, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 2.94, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 4, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 3, B: 7, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'KJE-1001', emnenavn: 'Introduksjon til kjemi og kjemisk biologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['KJE-1001-1'],
            years: [
              { year: 2021, A: 7, B: 15, C: 8, D: 12, E: 3, F: 0, G: 0, H: 0, total: 45, snitt: 3.24, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 6, C: 5, D: 6, E: 5, F: 0, G: 0, H: 0, total: 22, snitt: 2.55, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 8, D: 7, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.53, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 4, B: 7, C: 6, D: 6, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.39, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'BIO-2004', emnenavn: 'Studiedesign og dataanalyse i biologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO-2004-1'],
            years: [
              { year: 2021, A: 3, B: 13, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 4, B: 11, C: 10, D: 7, E: 4, F: 0, G: 0, H: 0, total: 36, snitt: 3.11, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 9, C: 17, D: 6, E: 3, F: 0, G: 0, H: 0, total: 35, snitt: 2.91, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 3, C: 7, D: 7, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 2.76, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 5, C: 17, D: 3, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.08, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIO-1012', emnenavn: 'Botanikk og mykologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MNF-2001', emnenavn: 'Realfagspraksis', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MNF-2001-1'], merknad: 'Studieplanen gir valget mellom MNF-2001 Realfagspraksis og «Mikroemner» (et sett 2,5 sp-mikroemner som til sammen utgjør 10 sp).',
            years: [
              { year: 2025, A: 3, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO-2019', emnenavn: 'Mikrobiologi og molekylære metoder', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MBI-2015', emnenavn: 'Menneskets fysiologi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO-2020', emnenavn: 'Advanced ecology', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO-2021', emnenavn: 'Marine biology', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO-2022', emnenavn: 'Plant physiology and biotechnology', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uia_biologi', shortName: 'UiA Biologi', institusjon: 'Universitetet i Agder', isNmbu: false, programnavn: 'Biologi (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.uia.no/studier/biologi', 'https://www.uia.no/studier/program/biologi-bachelor/studieplaner/2026h.html'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 180,
        merknad: 'Kilde er UiAs studieplan for Biologi, bachelorprogram (2026–2029) (uia.no, hentet via nettleser). Studiemodellen viser en «standard»-obligatorisk løype gjennom alle 6 semestre (180 sp, inkl. 0 sp-kurset ORG001 HMS-kurs), men for 4. og 5. semester kan studenten i stedet velge studieretning UNIS (Svalbard), Utveksling, eller for 5. semester også Internship (PRA205) — disse er ført som spesialiseringer siden kilden oppgir konkrete emner/koder for dem, i motsetning til f.eks. Nord universitets tilsvarende campus-valg der bare plassholderkoder uten emneinnhold var tilgjengelig. Siden studenten uansett kun kan følge ett spor per semester og standardsporet alene gir nøyaktig 180 sp, er obligatoriskeStudiepoeng satt til 180 (standardsporet), og UNIS/Utveksling/Internship-emnene er ikke medregnet i obligatoriskeStudiepoeng. EX-100 kan ifølge kilden tas i et annet semester enn oppført (2. eller 3. studieår, vår eller høst), men er plassert i 3. år vår i tråd med studiemodell-tabellens standardplassering. Emnenavn, koder og studiepoeng er hentet direkte fra studieplan-siden.',
        obligatoriske: [
          {
            emnekode: 'BIO104', emnenavn: 'Human fysiologi og anatomi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO104-1'],
            years: [
              { year: 2021, A: 0, B: 17, C: 25, D: 14, E: 7, F: 0, G: 0, H: 0, total: 63, snitt: 2.83, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 0, B: 5, C: 8, D: 13, E: 0, F: 3, G: 0, H: 0, total: 29, snitt: 2.41, strykprosent: 10.3, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 4, C: 12, D: 6, E: 4, F: 0, G: 0, H: 0, total: 26, snitt: 2.62, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 0, C: 8, D: 0, E: 0, F: 4, G: 0, H: 0, total: 12, snitt: 2, strykprosent: 33.3, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 5, B: 5, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.07, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'BIO111', emnenavn: 'Cellebiologi med genetikk', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO111-1'],
            years: [
              { year: 2021, A: 0, B: 6, C: 7, D: 6, E: 6, F: 6, G: 0, H: 0, total: 31, snitt: 2.03, strykprosent: 19.4, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 3, B: 5, C: 10, D: 6, E: 4, F: 0, G: 0, H: 0, total: 28, snitt: 2.89, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 3, B: 5, C: 8, D: 0, E: 3, F: 6, G: 0, H: 0, total: 25, snitt: 2.48, strykprosent: 24, bestattprosent: null, skjult: 7 },
              { year: 2024, A: 4, B: 5, C: 3, D: 0, E: 4, F: 0, G: 0, H: 0, total: 16, snitt: 3.31, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 4, B: 3, C: 3, D: 5, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.4, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'BIO112', emnenavn: 'Introduksjon til biologien', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO112-1'],
            years: [
              { year: 2021, A: 5, B: 6, C: 8, D: 10, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.21, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 4, B: 8, C: 12, D: 4, E: 5, F: 0, G: 0, H: 0, total: 33, snitt: 3.06, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 11, C: 6, D: 8, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.12, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 5, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.07, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 5, D: 8, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 2.38, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'ORG001', emnenavn: 'HMS-kurs', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ORG001-1'], merknad: '0 sp, men obligatorisk deltakelse ved studiestart.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 0, total: 32, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 31, H: 3, total: 34, snitt: null, strykprosent: null, bestattprosent: 91.2, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO102', emnenavn: 'Botanikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO102-1'],
            years: [
              { year: 2021, A: 4, B: 7, C: 12, D: 11, E: 4, F: 0, G: 0, H: 0, total: 38, snitt: 2.89, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 3, C: 4, D: 8, E: 11, F: 10, G: 0, H: 0, total: 36, snitt: 1.42, strykprosent: 27.8, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 7, C: 8, D: 5, E: 10, F: 7, G: 0, H: 0, total: 37, snitt: 1.95, strykprosent: 18.9, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 4, C: 0, D: 6, E: 8, F: 8, G: 0, H: 0, total: 26, snitt: 1.38, strykprosent: 30.8, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 0, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 2.77, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIO103', emnenavn: 'Zoologi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO103-1'],
            years: [
              { year: 2021, A: 4, B: 13, C: 10, D: 7, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.41, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 3, B: 6, C: 8, D: 5, E: 3, F: 3, G: 0, H: 0, total: 28, snitt: 2.71, strykprosent: 10.7, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 3, B: 10, C: 7, D: 5, E: 0, F: 3, G: 0, H: 0, total: 28, snitt: 3.07, strykprosent: 10.7, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 3, C: 12, D: 5, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 2.9, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 3, B: 0, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.2, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BIO113', emnenavn: 'Evolusjonsbiologi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO113-1'],
            years: [
              { year: 2021, A: 6, B: 11, C: 18, D: 3, E: 3, F: 0, G: 0, H: 0, total: 41, snitt: 3.34, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 9, C: 14, D: 3, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.23, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 3, C: 10, D: 4, E: 5, F: 3, G: 0, H: 0, total: 25, snitt: 2.2, strykprosent: 12, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 11, D: 7, E: 6, F: 0, G: 0, H: 0, total: 24, snitt: 2.21, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 5, D: 0, E: 4, F: 0, G: 0, H: 0, total: 9, snitt: 2.11, strykprosent: 0, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'BIO206', emnenavn: 'Generell økologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO206-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 14, D: 15, E: 3, F: 0, G: 0, H: 0, total: 36, snitt: 2.53, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 3, C: 3, D: 8, E: 7, F: 3, G: 0, H: 0, total: 24, snitt: 1.83, strykprosent: 12.5, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 5, C: 8, D: 5, E: 6, F: 3, G: 0, H: 0, total: 27, snitt: 2.22, strykprosent: 11.1, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 5, B: 6, C: 16, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.59, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 3, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'KJ-111', emnenavn: 'Generell kjemi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['KJ-111-1'],
            years: [
              { year: 2021, A: 13, B: 11, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 4.16, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 7, B: 9, C: 3, D: 0, E: 0, F: 4, G: 0, H: 0, total: 23, snitt: 3.48, strykprosent: 17.4, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 4, D: 4, E: 5, F: 8, G: 0, H: 0, total: 21, snitt: 1.19, strykprosent: 38.1, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 7, D: 0, E: 10, F: 6, G: 0, H: 0, total: 23, snitt: 1.35, strykprosent: 26.1, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 0, B: 0, C: 4, D: 0, E: 0, F: 3, G: 0, H: 0, total: 7, snitt: 1.71, strykprosent: 42.9, bestattprosent: null, skjult: 9 },
            ],
          },
          {
            emnekode: 'ML-208', emnenavn: 'Molekylærbiologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['ML-208-1'],
            years: [
              { year: 2021, A: 0, B: 11, C: 7, D: 7, E: 7, F: 4, G: 0, H: 0, total: 36, snitt: 2.39, strykprosent: 11.1, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 3, C: 10, D: 0, E: 6, F: 5, G: 0, H: 0, total: 24, snitt: 2, strykprosent: 20.8, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 6, B: 0, C: 6, D: 11, E: 0, F: 3, G: 0, H: 0, total: 26, snitt: 2.69, strykprosent: 11.5, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 4, C: 3, D: 7, E: 4, F: 5, G: 0, H: 0, total: 23, snitt: 1.87, strykprosent: 21.7, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 4, F: 3, G: 0, H: 0, total: 7, snitt: 0.57, strykprosent: 42.9, bestattprosent: null, skjult: 10 },
            ],
          },
          {
            emnekode: 'KJ-213', emnenavn: 'Organisk kjemi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['KJ-213-1'], merknad: 'Del av standardsporet i 4. semester; studenten kan i stedet velge studieretning UNIS eller Utveksling for dette semesteret (se spesialiseringer).',
            years: [
              { year: 2022, A: 8, B: 14, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4.07, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 6, D: 3, E: 4, F: 5, G: 0, H: 0, total: 18, snitt: 1.56, strykprosent: 27.8, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 3, B: 0, C: 7, D: 6, E: 0, F: 4, G: 0, H: 0, total: 20, snitt: 2.4, strykprosent: 20, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 4, C: 0, D: 6, E: 4, F: 3, G: 0, H: 0, total: 17, snitt: 1.88, strykprosent: 17.6, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'MA-143', emnenavn: 'Biostatistikk', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MA-143-1'], merknad: 'Del av standardsporet i 4. semester; studenten kan i stedet velge studieretning UNIS eller Utveksling for dette semesteret (se spesialiseringer).',
            years: [
              { year: 2021, A: 0, B: 5, C: 16, D: 4, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.04, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 0, B: 9, C: 16, D: 3, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.21, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 3, B: 4, C: 5, D: 3, E: 4, F: 0, G: 0, H: 0, total: 19, snitt: 2.95, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 5, B: 4, C: 8, D: 0, E: 0, F: 8, G: 0, H: 0, total: 25, snitt: 2.6, strykprosent: 32, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 5, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.42, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'MA-168', emnenavn: 'Matematikk for biologer', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MA-168-1'], merknad: 'Del av standardsporet i 4. semester; studenten kan i stedet velge studieretning UNIS eller Utveksling for dette semesteret (se spesialiseringer).',
            years: [
              { year: 2021, A: 0, B: 0, C: 7, D: 6, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 2.54, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 4, B: 6, C: 10, D: 4, E: 0, F: 5, G: 0, H: 0, total: 29, snitt: 2.83, strykprosent: 17.2, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 4, B: 4, C: 6, D: 0, E: 0, F: 5, G: 0, H: 0, total: 19, snitt: 2.84, strykprosent: 26.3, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 3, C: 6, D: 3, E: 5, F: 8, G: 0, H: 3, total: 28, snitt: 1.64, strykprosent: 32, bestattprosent: 0, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 8, D: 5, E: 3, F: 0, G: 0, H: 0, total: 16, snitt: 2.31, strykprosent: 0, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'BIO201', emnenavn: 'Akvatisk økologi', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BIO201-1'], merknad: 'Del av standardsporet i 5. semester; studenten kan i stedet velge studieretning Internship, UNIS eller Utveksling for dette semesteret (se spesialiseringer).',
            years: [
              { year: 2021, A: 0, B: 10, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.71, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 18, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.69, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 4, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.1, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 7, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 3, C: 12, D: 3, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO204', emnenavn: 'Zoophysiology', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BIO204-1'], merknad: 'Del av standardsporet i 5. semester; studenten kan i stedet velge studieretning Internship, UNIS eller Utveksling for dette semesteret (se spesialiseringer).',
            years: [
              { year: 2021, A: 0, B: 0, C: 7, D: 5, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 2.58, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 5, C: 16, D: 5, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 4, C: 3, D: 5, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 2.92, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 4, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 9, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO207', emnenavn: 'Marin bevaringsbiologi', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BIO207-1'], merknad: 'Del av standardsporet i 5. semester; studenten kan i stedet velge studieretning Internship, UNIS eller Utveksling for dette semesteret (se spesialiseringer).',
            years: [
              { year: 2021, A: 0, B: 8, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 5, B: 19, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 3.76, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 5, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.42, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 8, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BIO300', emnenavn: 'Bacheloroppgave', studiepoeng: 20, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BIO300-1'],
            years: [
              { year: 2021, A: 6, B: 16, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.82, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 4, B: 11, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.86, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 9, B: 16, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 4.06, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 3, B: 10, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.73, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 12, C: 0, D: 6, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'EX-100', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['EX-100-1'], merknad: 'Kan også tas vår eller høst i 2. eller 3. studieår, ikke nødvendigvis samtidig med bacheloroppgaven.',
            years: [
              { year: 2021, A: 3, B: 7, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.59, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 3, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 2.94, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 11, C: 14, D: 6, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.16, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 5, C: 6, D: 7, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 2.89, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 7 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'UNIS (Svalbard)', obligatoriske: [
          ] },
          { navn: 'Utveksling', obligatoriske: [
          ] },
          { navn: 'Internship', obligatoriske: [
          ] },
        ],
      },
    ],
  },
  {
    id: 'miljonatur', label: 'Miljø og naturressurser', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_miljonatur', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Miljø og naturressurser (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/bachelor/miljo-og-naturressurser', 'https://static02.nmbu.no/mina/studier/B-MILJØ.php'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 135,
        merknad: 'Kilde er NMBUs fargekodede rutenett-studieplan for kull 2026 (static02.nmbu.no/mina/studier/B-MILJØ.php), linket fra programsiden nmbu.no/studier/bachelor/miljo-og-naturressurser. Studiepoeng er lest av fra cellenes colspan (kolonnebredde 5 sp), kryssjekket mot nmbu.no/emne/<kode> (bl.a. bekreftet at MILJØ100 er 10 sp totalt: 5 sp augustblokk + 5 sp høstparallell, samme mønster som MINA250 og NATF100/SKOG100/SKOG220 i beslektede MINA-studieplaner). De 15 navngitte obligatoriske emnene summerer til 135 sp av totalt 180 sp. De resterende 45 sp er dels frie eksempelplaner/emnepakker uten faste emnelister (Geologi, Hydrologi, Jord og miljø, Limnologi, Miljøgifter og økotoksikologi, Miljøkjemi, Ressursforvaltning), dels et obligatorisk minstekrav utenfor rutenettet: «Velg minst 20 studiepoeng blant» FMI210 Generell miljøtoksikologi (10 sp vår), FYS140 Klimaendringer, bærekraft og tilpasninger (5 sp høst), GEO210 Kvartærgeologi (10 sp vår), GEO220 Hydrogeologi (10 sp vår), INF120 Programmering og databehandling (10 sp høst), JORD210 Dynamisk modellering i jord-plante-atmosfære systemet (10 sp høst), JORD230 Jord som vekstmedium (15 sp, augustblokk+høstparallell), KJM220 Vannkjemi (10 sp høst), KJM240 Analytisk kjemi (10 sp høst), VANN210 Ferskvannsøkologi (10 sp høst), VANN220 Vannressurser og vannforsyning (5 sp vår), «pluss minst 5 studiepoeng blant» GEO250 Jord og geologi i landskapet (5 sp juniblokk) eller GEO320 Hydrogeologi - feltkurs (5 sp juniblokk) — til sammen minst 25 sp fra en fleksibel emnepool. Siden dette er et minstekrav fra en stor pool av alternativer (ikke faste, navngitte obligatoriske emner), er det holdt utenfor obligatoriske-listen og obligatoriskeStudiepoeng, i tråd med regelen om at obligatoriske valg mellom alternativer føres i merknad. Emnenavn er hentet fra NMBUs emnesøk (nmbu.no/emne/<kode>).',
        obligatoriske: [
          {
            emnekode: 'MILJØ100', emnenavn: 'Miljø, naturressurser og radioaktivitet', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: '10 sp totalt, fordelt med 5 sp i augustblokk (før høstsemesteret) og 5 sp i høstparallell, jf. rutenettets kolonnebredder og NMBUs emnesøk.',
            years: [],
          },
          {
            emnekode: 'MATH-INF100', emnenavn: 'Beregningsbasert matematikk i praksis', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Studieplanen gir valget mellom MATH-INF100 og MATH121 (Kalkulus); MATH121 anbefales for studenter med matematikk R2 fra videregående skole.',
            years: [],
          },
          {
            emnekode: 'GEO100', emnenavn: 'Geologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['GEO100-1'],
            years: [
              { year: 2021, A: 0, B: 7, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.19, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 5, B: 8, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.78, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'ZOOL100', emnenavn: 'Generell zoologi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ZOOL100-1'],
            years: [
              { year: 2021, A: 0, B: 7, C: 5, D: 6, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.06, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 3, B: 7, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'FYS101', emnenavn: 'Mekanikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Studieplanen gir valget mellom FYS101 og FYS100; FYS101 anbefales for studenter med fysikk 1 og matematikk R2 fra videregående skole.',
            years: [],
          },
          {
            emnekode: 'KJM100', emnenavn: 'Generell kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM100-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 4, D: 6, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.86, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BOT100', emnenavn: 'Plantediversitet', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BOT100-1'],
            years: [
              { year: 2021, A: 0, B: 11, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.35, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 3, C: 4, D: 5, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 2.83, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'PHI100', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['PHI100-1'], merknad: 'Studieplanen gir valget mellom PHI100 og seminarversjonen PHI101.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'JORD100', emnenavn: 'Jordlære', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['JORD100-1'],
            years: [
              { year: 2022, A: 0, B: 4, C: 0, D: 5, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.89, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO130', emnenavn: 'Mikrobiologi', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO130-1'],
            years: [
              { year: 2021, A: 7, B: 3, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.78, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'LAD102', emnenavn: 'GIS - praktisk introduksjon', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['LAD102-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 3, total: 17, snitt: null, strykprosent: null, bestattprosent: 82.4, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 4 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'VANN200', emnenavn: 'Vannkvalitet og vannforurensning', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['VANN200-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 3, total: 14, snitt: null, strykprosent: null, bestattprosent: 78.6, skjult: 1 },
              { year: 2022, A: 0, B: 4, C: 3, D: 7, E: 0, F: 3, G: 0, H: 0, total: 17, snitt: 2.29, strykprosent: 17.6, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'KJM120', emnenavn: 'Organisk kjemi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['KJM120-1'],
            years: [
              { year: 2021, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 3, B: 3, C: 6, D: 3, E: 0, F: 3, G: 0, H: 0, total: 18, snitt: 2.83, strykprosent: 16.7, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 3, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MILJØ200', emnenavn: 'Forurensning og miljø', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['MILJØ200-1'],
            years: [
              { year: 2022, A: 3, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'STAT100', emnenavn: 'Statistikk', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['STAT100-1'], merknad: 'Studieplanens fotnote sier STAT100 kan tas høst eller vår.',
            years: [
              { year: 2021, A: 7, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.4, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2022, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 3, G: 0, H: 0, total: 3, snitt: 0, strykprosent: 100, bestattprosent: null, skjult: 11 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 3, G: 0, H: 0, total: 3, snitt: 0, strykprosent: 100, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MINA250', emnenavn: 'Tverrfaglig konsekvensanalyse', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['MINA250-1'], merknad: '10 sp, undervises i januarblokk og vårparallell (5 sp hvert, iht. rutenettets kolonnebredder).',
            years: [
              { year: 2023, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 6, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.55, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uio_klima_miljo_menneske', shortName: 'UiO Klima, miljø og menneske', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Klima, miljø og menneske (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.uio.no/studier/program/klima-miljo-menneske/', 'https://www.uio.no/studier/program/klima-miljo-menneske/oppbygging/'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 70,
        merknad: 'Kilde er UiOs oppbygging-side for bachelorprogrammet Klima, miljø og menneske (uio.no/studier/program/klima-miljo-menneske/oppbygging/, sist endret 18.8.2026). Programmet er 180 sp: felles kjerneemner (obligatoriske-listen over, 70 sp inkl. bacheloroppgaven KLM3090 i 6. semester) + fordypning (80 sp, avhengig av valgt fordypning fra og med 3. semester) + frie emner (30 sp, kan brukes til valgfrie UiO-emner, utveksling eller sertifikat) + ex.phil./ex.fac. (delvis overlappende med kjerneemnene over). Programmet tilbyr seks fordypninger: Klima, miljø og menneske; Filosofi; Historie; Idéhistorie; Kulturhistorie; og Sosialantropologi. For fordypningen «Klima, miljø og menneske» selv (130-gruppen) er det ingen ekstra faste obligatoriske emner utover kjerneemnene over — resten av dens 130 sp fylles av et krav om minst 30 sp fra en liste (B-LAB2010, ECON1922, JUR1520, JUR1911, TFF3219) pluss resterende sp fra en lengre valgfri liste (bl.a. IDE2019, IDE2058, KUN2203, KUN2580, ENG2507, ILN2301, MEVIT2615, MEVIT2616, PSY2506, REL2020, SOSGEO2302, SOSANT2510, STV2250, STV2547, TIK2101, TIK2111); denne er derfor ikke ført som egen spesialisering. Fordypningene Filosofi, Historie og Sosialantropologi har egne faste obligatoriske fordypningsemner utover kjerneemnene, ført under spesialiseringer over; i tillegg krever hver av dem 20 (filosofi og historie, i 6. semester) eller 10 (sosialantropologi) sp valgfrie fordypningsemner på 2000-nivå innen faget, samt at 5. semester («utviklingssemesteret») er fritt/utveksling (30 sp) for alle tre. Fordypningene Idéhistorie og Kulturhistorie er nevnt i kilden som valgbare alternativer, men den hentede oppbygging-siden inneholdt ikke egne semestertabeller/obligatoriske emnelister for disse to (mulig at innholdet lastes dynamisk og ikke var med i den statiske HTML-en som ble hentet); de er derfor ikke tatt med som spesialiseringer her for å unngå å finne opp emnekoder. Sem. 2-valget mellom KULH2011 og SVEXFAC03 er ført som én linje (KULH2011) med merknad, tilsvarende praksis for lignende valg i andre filer i dette datasettet.',
        obligatoriske: [
          {
            emnekode: 'KLM1000', emnenavn: 'Mennesker, makt og miljø', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KLM1000-1'],
            years: [
              { year: 2025, A: 4, B: 4, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.42, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'GEO1000', emnenavn: 'Klima og bærekraft: Naturlige prosesser og menneskets påvirkning', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['GEO1000-1'],
            years: [
              { year: 2025, A: 5, B: 6, C: 3, D: 0, E: 0, F: 4, G: 0, H: 0, total: 18, snitt: 3.22, strykprosent: 22.2, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'EXPHIL03', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EXPHIL03-1'],
            years: [
              { year: 2025, A: 0, B: 3, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.27, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'FIL2390', emnenavn: 'Miljøfilosofi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'HIS2170', emnenavn: 'Climate and History: From the Little Ice Age to Global Warming', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KULH2011', emnenavn: 'The Cultural History of Nature', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Studieplanen gir valget mellom KULH2011 og SVEXFAC03 (Examen facultatum, samfunnsvitenskapelig variant) som tredje emne i 2. semester; hvilket som er obligatorisk/valgfritt varierer noe med hvilken fordypning studenten senere velger.',
            years: [],
          },
          {
            emnekode: 'KLM3090', emnenavn: 'Bacheloroppgave i klima, miljø og menneske', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Obligatorisk for alle fordypninger i 6. semester (tverrfaglig bacheloroppgave).',
            years: [],
          },
        ],
        spesialiseringer: [
          { navn: 'Filosofi', obligatoriske: [
          ] },
          { navn: 'Historie', obligatoriske: [
          ] },
          { navn: 'Sosialantropologi', obligatoriske: [
          ] },
        ],
      },
      {
        entryId: 'uio_geologi_geografi', shortName: 'UiO Geologi og geografi', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Geologi og geografi (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.uio.no/studier/program/geologi/', 'https://www.uio.no/studier/program/geologi/oppbygging/', 'https://www.uio.no/studier/program/geologi/studieretninger/geografi/oppbygging/', 'https://www.uio.no/studier/program/geologi/studieretninger/geologi/oppbygging/'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 80,
        merknad: 'Kilde er UiOs oppbygging-side for Geologi og geografi (bachelor) (uio.no/studier/program/geologi/oppbygging/, sist endret 25.3.2026), samt de to studieretningenes egne oppbygging-sider for Geografi og Geologi. Programmet er 180 sp: obligatoriske fellesemner (80 sp, felles for begge studieretninger, obligatoriske-listen over) + obligatoriske fordypningsemner (60 sp for geografi, 80 sp for geologi) + utviklingssemester/frie emner (40 sp for geografi, 20 sp for geologi). Studieplanen viser gjeldende studieløp for studenter tatt opp høsten 2022 eller senere (en eldre variant for kull 2021 og tidligere, med andre sp-tall og nedlagte emner som FYS-MEK1110/MAT-IN1105, er ikke brukt her). For Geografi er GEO2210, GEO3460 og GEO3000 (ført under spesialiseringer, 30 sp) obligatoriske for alle på retningen; i tillegg kreves 10 sp valgt fra GEO2330/GEO3032/GEO3515 og 20 sp valgt (to av tre) fra STK1000/MAT1120/KJM1101 — disse to valgpoolene (30 sp) er ikke ført som faste emner. For Geologi er STK1000, KJM1101, GEO2110, GEO2130, GEO2140 og GEO3010 (ført under spesialiseringer, 60 sp) obligatoriske, pluss et valg mellom GEO2150 (Petrologi og geokjemi) og GEO2160 (Paleontologi og paleoøkologi) (10 sp) og et fritt valg av ett fordypningsemne (10 sp) fra en lengre liste (GEO2150/GEO2160, GEO3000, GEO3030, GEO3032, GEO3100, GEO3211, GEO3240) — disse 20 sp er ikke ført som faste emner, i tråd med regelen om at obligatoriske valg mellom alternativer føres i merknad. Alle fysikk/matematikk-alternativer merket med stjerne (*) i kilden er for studenter med R2-bakgrunn. Emnenavn, koder og studiepoeng er hentet direkte fra de tre oppbygging-sidene.',
        obligatoriske: [
          {
            emnekode: 'GEO1100', emnenavn: 'Jordens utvikling', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['GEO1100-1'], merknad: 'I begynnelsen av 1. semester kreves i tillegg obligatoriske, studiepoenggivende HMS-emner (HMS0501, HMS0502, HMS0503, HMS0504, HMS0507, og HMS0505 for enkelte emner); disse gir 0 sp og er ikke ført som egne linjer.',
            years: [
              { year: 2021, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 3, C: 14, D: 8, E: 3, F: 16, G: 0, H: 0, total: 44, snitt: 1.66, strykprosent: 36.4, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 6, C: 7, D: 4, E: 3, F: 4, G: 0, H: 0, total: 24, snitt: 2.33, strykprosent: 16.7, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 3, B: 4, C: 17, D: 6, E: 0, F: 10, G: 0, H: 0, total: 40, snitt: 2.35, strykprosent: 25, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 4, C: 22, D: 3, E: 0, F: 7, G: 0, H: 0, total: 36, snitt: 2.44, strykprosent: 19.4, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'IN1900', emnenavn: 'Introduksjon i programmering for naturvitenskapelige anvendelser', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Studieplanen gir valget mellom IN1900 og IN-GEO1900 (Introduksjon i programmering for geofagstudenter).',
            years: [],
          },
          {
            emnekode: 'MAT1050', emnenavn: 'Matematikk for anvendelser 1', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MAT1050-1'], merknad: 'Studieplanen gir valget mellom MAT1050 og MAT1100 (Kalkulus); MAT1100 er et alternativ for studenter med R2-bakgrunn.',
            years: [
              { year: 2022, A: 3, B: 12, C: 8, D: 6, E: 0, F: 7, G: 0, H: 0, total: 36, snitt: 2.75, strykprosent: 19.4, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 5, D: 7, E: 0, F: 15, G: 0, H: 0, total: 27, snitt: 1.07, strykprosent: 55.6, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 14, C: 12, D: 3, E: 0, F: 9, G: 0, H: 0, total: 38, snitt: 2.58, strykprosent: 23.7, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 3, C: 0, D: 7, E: 11, F: 20, G: 0, H: 0, total: 41, snitt: 0.9, strykprosent: 48.8, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'GEO1110', emnenavn: 'Jordens indre og ytre prosesser', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['GEO1110-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 4, D: 3, E: 0, F: 3, G: 0, H: 0, total: 15, snitt: 2.53, strykprosent: 20, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 3, B: 9, C: 8, D: 13, E: 0, F: 8, G: 0, H: 0, total: 41, snitt: 2.46, strykprosent: 19.5, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 3, B: 6, C: 3, D: 7, E: 0, F: 3, G: 0, H: 0, total: 22, snitt: 2.82, strykprosent: 13.6, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 3, C: 13, D: 7, E: 4, F: 6, G: 0, H: 0, total: 33, snitt: 2.09, strykprosent: 18.2, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'FYS1001', emnenavn: 'Innføring i fysikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['FYS1001-1'], merknad: 'Studieplanen gir valget mellom FYS1001 og FYS1100 (Mekanikk og modellering); FYS1100 er et alternativ for studenter med R2-bakgrunn.',
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 4, C: 9, D: 6, E: 5, F: 13, G: 0, H: 0, total: 37, snitt: 1.62, strykprosent: 35.1, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 3, C: 4, D: 8, E: 5, F: 11, G: 0, H: 0, total: 31, snitt: 1.45, strykprosent: 35.5, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 4, C: 14, D: 6, E: 11, F: 10, G: 0, H: 0, total: 45, snitt: 1.8, strykprosent: 22.2, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MAT1060', emnenavn: 'Matematikk for anvendelser 2', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MAT1060-1'], merknad: 'Studieplanen gir valget mellom MAT1060 og MAT1110 (Kalkulus og lineær algebra); MAT1110 er et alternativ for studenter med R2-bakgrunn.',
            years: [
              { year: 2023, A: 3, B: 13, C: 13, D: 3, E: 0, F: 5, G: 0, H: 0, total: 37, snitt: 3.03, strykprosent: 13.5, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 3, C: 5, D: 9, E: 3, F: 0, G: 0, H: 0, total: 20, snitt: 2.4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 6, C: 16, D: 5, E: 0, F: 4, G: 0, H: 0, total: 31, snitt: 2.65, strykprosent: 12.9, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'GEO2120', emnenavn: 'Sedimentologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['GEO2120-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.09, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 4, B: 3, C: 12, D: 7, E: 3, F: 5, G: 0, H: 0, total: 34, snitt: 2.5, strykprosent: 14.7, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 6, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.17, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 8, C: 12, D: 8, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'EXPHIL03', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['EXPHIL03-1'], merknad: 'Plassert i 5. semester (3. år høst) i standard studieløp; på studieretning geologi kan EXPHIL03 og fordypningsemnet i 5./6. semester bytte plass.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 0, C: 3, D: 5, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 2.38, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 0, B: 0, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 4, B: 7, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.63, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 3, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.23, strykprosent: 0, bestattprosent: null, skjult: 9 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Geografi', obligatoriske: [
          ] },
          { navn: 'Geologi', obligatoriske: [
          ] },
        ],
      },
      {
        entryId: 'uib_geovitenskap', shortName: 'UiB', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Geovitenskap, retning geologi (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_geologi', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Geologi (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'hvl_geologi_geofare', shortName: 'HVL', institusjon: 'Høgskulen på Vestlandet', isNmbu: false, programnavn: 'Geologi og geofare (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.hvl.no/studier/studieprogram/geologi-og-geofare/', 'https://www.hvl.no/studier/studieprogram/geologi-og-geofare/2026h/studieplan/', 'https://www.hvl.no/studier/studieprogram/geologi-og-geofare/2026h/utdanningsplan/'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 160,
        merknad: 'Kilde er HVLs utdanningsplan for Bachelor i geologi og geofare, kull haust 2026 (hvl.no/studier/studieprogram/geologi-og-geofare/2026h/utdanningsplan/), linket fra studieplan-oversikten (.../2026h/studieplan/) som «Sjå emneoversikt for kull 2026». Utdanningsplanens «Oversikt» viser kravstruktur Fellesemne 160 sp + Valfag 20 sp = 180 sp totalt. Fellesemne-delen består av 13 faste obligatoriske emner (130 sp, 1.–4. semester + GE482 i 5. semester) + bacheloroppgaven GE491 (20 sp, 6. semester) = 150 sp, pluss et valg i 5. semester mellom ME420 Statistikk og PL413 Miljø- og forvaltningsrett (10 sp) for å nå 160 sp; dette valget er ført som én linje (ME420) med merknad, i tråd med regelen om at obligatoriske valg mellom alternativer føres i merknad. Valfag-delen (20 sp, 5.–6. semester) er tre navngitte, faste emnekombinasjoner («Krav: 20 studiepoeng» hver) — Arealplanlegging, Snøskred og arealplanlegging, og Snøskred og programmering — ført under spesialiseringer siden studenten velger én av disse fullstendige emnepakkene. Emnenavn, koder, semesterplassering og studiepoeng er hentet direkte fra utdanningsplan-siden.',
        obligatoriske: [
          {
            emnekode: 'GE406', emnenavn: 'Geologi grunnkurs', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['GE406-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 14, D: 9, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 2.81, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 3, C: 14, D: 8, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 2.8, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 3, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 3, C: 8, D: 6, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 2.82, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 4, C: 15, D: 9, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 2.82, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'GE413', emnenavn: 'Kartlære og GIS', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['GE413-1'],
            years: [
              { year: 2021, A: 0, B: 10, C: 7, D: 5, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.23, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 10, C: 8, D: 5, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.22, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 7, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 5, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.31, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 6, C: 15, D: 6, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MA414', emnenavn: 'Matematikk naturfag', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MA414-3'],
            years: [
              { year: 2021, A: 0, B: 4, C: 0, D: 7, E: 4, F: 12, G: 0, H: 0, total: 27, snitt: 1.26, strykprosent: 44.4, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 4, C: 7, D: 4, E: 4, F: 8, G: 0, H: 0, total: 27, snitt: 1.81, strykprosent: 29.6, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 3, B: 5, C: 3, D: 0, E: 3, F: 5, G: 0, H: 0, total: 19, snitt: 2.47, strykprosent: 26.3, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 3, B: 0, C: 5, D: 5, E: 7, F: 3, G: 0, H: 0, total: 23, snitt: 2.04, strykprosent: 13, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 4, B: 3, C: 4, D: 4, E: 8, F: 10, G: 0, H: 0, total: 33, snitt: 1.82, strykprosent: 30.3, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'FY400', emnenavn: 'Innføring i fysikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['FY400-1'],
            years: [
              { year: 2021, A: 5, B: 5, C: 7, D: 3, E: 3, F: 0, G: 0, H: 0, total: 23, snitt: 3.26, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 7, C: 0, D: 4, E: 3, F: 8, G: 0, H: 0, total: 22, snitt: 1.77, strykprosent: 36.4, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 7, C: 4, D: 0, E: 5, F: 5, G: 0, H: 0, total: 21, snitt: 2.14, strykprosent: 23.8, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 4, D: 0, E: 3, F: 6, G: 0, H: 0, total: 13, snitt: 1.15, strykprosent: 46.2, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 4, C: 3, D: 5, E: 8, F: 5, G: 0, H: 0, total: 25, snitt: 1.72, strykprosent: 20, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'GE408', emnenavn: 'Mineralogi og petrografi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['GE408-1'],
            years: [
              { year: 2021, A: 3, B: 0, C: 8, D: 7, E: 0, F: 4, G: 0, H: 0, total: 22, snitt: 2.41, strykprosent: 18.2, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 3, B: 6, C: 5, D: 5, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.37, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 3, B: 10, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.8, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 3, B: 0, C: 6, D: 0, E: 0, F: 3, G: 0, H: 0, total: 12, snitt: 2.75, strykprosent: 25, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 0, C: 7, D: 5, E: 4, F: 4, G: 0, H: 0, total: 20, snitt: 1.75, strykprosent: 20, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'GE436', emnenavn: 'Sedimentologi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['GE436-1'],
            years: [
              { year: 2021, A: 0, B: 7, C: 11, D: 4, E: 4, F: 0, G: 0, H: 0, total: 26, snitt: 2.81, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 5, C: 6, D: 4, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.07, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 4, C: 13, D: 6, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 2.91, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 3, B: 3, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 4, C: 8, D: 6, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 2.89, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'GE407', emnenavn: 'Anvendt geofysikk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['GE407-2'],
            years: [
              { year: 2021, A: 0, B: 3, C: 8, D: 7, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 2.78, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 4, B: 4, C: 6, D: 4, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 3, B: 3, C: 10, D: 5, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.19, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 3, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.27, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 7, D: 3, E: 0, F: 3, G: 0, H: 0, total: 13, snitt: 2.08, strykprosent: 23.1, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'GE414', emnenavn: 'Strukturgeologi og tektonikk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['GE414-2'],
            years: [
              { year: 2021, A: 0, B: 3, C: 8, D: 0, E: 0, F: 8, G: 0, H: 0, total: 19, snitt: 1.89, strykprosent: 42.1, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 4, C: 4, D: 7, E: 0, F: 8, G: 0, H: 0, total: 23, snitt: 1.83, strykprosent: 34.8, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 8, D: 7, E: 5, F: 4, G: 0, H: 0, total: 24, snitt: 1.79, strykprosent: 16.7, bestattprosent: null, skjult: 7 },
              { year: 2024, A: 0, B: 5, C: 12, D: 0, E: 0, F: 4, G: 0, H: 0, total: 21, snitt: 2.67, strykprosent: 19, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 6, D: 4, E: 0, F: 4, G: 0, H: 0, total: 14, snitt: 1.86, strykprosent: 28.6, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'GE486', emnenavn: 'Glasialgeologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['GE486-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 6, D: 7, E: 0, F: 3, G: 0, H: 0, total: 19, snitt: 2.32, strykprosent: 15.8, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 4, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.06, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 4, C: 12, D: 6, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 2.91, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 4, B: 5, C: 5, D: 0, E: 3, F: 0, G: 0, H: 0, total: 17, snitt: 3.41, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 3, B: 5, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.85, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'GE481', emnenavn: 'Ingeniørgeologi, geoteknikk og overvaking av ustabile fjellsider', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['GE481-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 4, D: 4, E: 3, F: 0, G: 0, H: 0, total: 14, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 4, C: 5, D: 0, E: 0, F: 7, G: 0, H: 0, total: 16, snitt: 1.94, strykprosent: 43.8, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 0, B: 6, C: 5, D: 3, E: 3, F: 4, G: 0, H: 0, total: 21, snitt: 2.29, strykprosent: 19, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 3, C: 12, D: 5, E: 4, F: 4, G: 0, H: 0, total: 28, snitt: 2.21, strykprosent: 14.3, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 3, C: 5, D: 3, E: 3, F: 0, G: 0, H: 0, total: 14, snitt: 2.57, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'GE483', emnenavn: 'Climate Change', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['GE483-1'],
            years: [
              { year: 2021, A: 0, B: 6, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 4, B: 3, C: 4, D: 5, E: 3, F: 0, G: 0, H: 0, total: 19, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 4, B: 3, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.61, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 3, B: 4, C: 8, D: 4, E: 3, F: 4, G: 0, H: 0, total: 26, snitt: 2.54, strykprosent: 15.4, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 5, C: 9, D: 4, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.06, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'GE484', emnenavn: 'Geofare og skredkartlegging', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['GE484-1'],
            years: [
              { year: 2021, A: 0, B: 6, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.4, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 4, C: 6, D: 0, E: 0, F: 4, G: 0, H: 0, total: 14, snitt: 2.43, strykprosent: 28.6, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 3, B: 7, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 3, B: 7, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 3, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.87, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'GE482', emnenavn: 'Hydrogeologi', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['GE482-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 5, D: 8, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 2.76, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 0, C: 9, D: 4, E: 0, F: 3, G: 0, H: 0, total: 16, snitt: 2.19, strykprosent: 18.8, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 4, C: 7, D: 0, E: 5, F: 0, G: 0, H: 0, total: 16, snitt: 2.62, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 3, C: 11, D: 4, E: 3, F: 3, G: 0, H: 0, total: 24, snitt: 2.33, strykprosent: 12.5, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 6, D: 0, E: 3, F: 3, G: 0, H: 0, total: 12, snitt: 1.75, strykprosent: 25, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'ME420', emnenavn: 'Statistikk', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['ME420-4'], merknad: 'Del av «fellesemne»-kravet (160 sp) i 5. semester; studenten velger ett av ME420 Statistikk og PL413 Miljø- og forvaltningsrett.',
            years: [
              { year: 2021, A: 10, B: 0, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.25, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 4, B: 9, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 4, B: 9, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.81, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 4, B: 8, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.8, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 10, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'GE491', emnenavn: 'Bacheloroppgåve i geologi', studiepoeng: 20, aar: 3, semester: 'vår',
            dbhEmnekoder: ['GE491-2'],
            years: [
              { year: 2021, A: 0, B: 0, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 2.75, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 3, B: 4, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.59, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 6, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 15, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 8, B: 7, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.1, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Arealplanlegging', obligatoriske: [
          ] },
          { navn: 'Snøskred og arealplanlegging', obligatoriske: [
          ] },
          { navn: 'Snøskred og programmering', obligatoriske: [
          ] },
        ],
      },
    ],
  },
  {
    id: 'fornybar', label: 'Fornybar energi', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_fornybar', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Fornybar energi (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'hvl_fornybar', shortName: 'HVL', institusjon: 'Høgskulen på Vestlandet', isNmbu: false, programnavn: 'Fornybar energi (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_ing_fornybar_trondheim', shortName: 'NTNU Trondheim', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Ingeniør, fornybar energi (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_ing_fornybar_gjovik', shortName: 'NTNU Gjøvik', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Ingeniør, fornybar energi (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_ing_fornybar_alesund', shortName: 'NTNU Ålesund', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Ingeniør, fornybar energi (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uia_ing_fornybar', shortName: 'UiA', institusjon: 'Universitetet i Agder', isNmbu: false, programnavn: 'Ingeniør, fornybar energi (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uit_fornybar', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Fornybar energi (master 5 år)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'radioaktivitet', label: 'Radioaktivitet og miljø', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_radioaktivitet', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Radioaktivitet og miljø (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'skogfag2', label: 'Skogfag (2-årig master)', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_skogfag2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Skogfag (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/skogfag', 'https://static02.nmbu.no/mina/studier/M-SF.php?sprx=n&aarx=2026'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 55,
        merknad: 'Kilde er MINA-fakultetets studieplan-verktøy for kullet med studiestart høsten 2026 (fullstendig 2-årig plan; identisk struktur for kullet 2025). Utover de fire faste emnene over stiller programmet to obligatoriske valgkrav som ikke er ført opp som enkeltemner: (1) ett metodeemne må velges mellom MINA310 Naturvitenskapelig metode (5 sp, vår) og MINA311 Samfunnsvitenskapelig forskningsmetode (10 sp, vår); (2) minst 30 sp må velges blant en liste med skogfaglige emner (MINA305, MINA330, SKOG303, SKOG304, SKOG305, SKOG340, TRE300 m.fl.). Studenter uten bachelor i skogfag må i tillegg ta SKOG230 og SKOG250 (20 sp) pluss minst 10 sp fra en tilleggsliste. De obligatoriske faste emnene (55 sp) pluss metodekrav (5–10 sp) og fordypningskrav (30 sp) bringer summen opp mot totalt 120 sp for graden. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'SKOG302', emnenavn: 'Flerbruk og flerbruksplanlegging i skog', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SKOG302-1'], merknad: 'Går over Augustblokk og Høstparallell samme semester.',
            years: [
              { year: 2021, A: 3, B: 9, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.52, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 5, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.38, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.7, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 5, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.38, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MINA321', emnenavn: 'Tverrfaglig samarbeid og kontroverser om bærekraft - engelsk versjon', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MINA321-1'], merknad: 'Ligger i Januarblokk. MINA320 (norsk versjon av samme emne) kan tas i høstparallellen i stedet.',
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'SKOG300', emnenavn: 'Skogplanlegging', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['SKOG300-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 5, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 4, C: 9, D: 4, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 3, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.83, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'M30-SF', emnenavn: 'Masteroppgave', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: ['M30-SF-1'],
            years: [
              { year: 2021, A: 4, B: 6, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.65, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 5, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.07, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2024, A: 3, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4.38, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 9, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.69, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'inn_skogforvaltning2', shortName: 'INN', institusjon: 'Universitetet i Innlandet', isNmbu: false, programnavn: 'Bærekraftig skogforvaltning (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.inn.no/studier/vare-studier/master-i-berekraftig-skogforvaltning/', 'https://studiekatalog.edutorium.no/inn/nb/program/MASKO'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 120,
        merknad: 'Programmet er formelt organisert som et 3-årig nett- og samlingsbasert deltidsstudium (120 sp, 20 sp per semester over 6 semestre: 2026H-2029V), ikke et 2-årig heltidsstudium, selv om det inngår i sammenligningsgruppen «master 2 år». Feltet «aar» er derfor satt til 1-3 for å reflektere den faktiske studiemodellen. Alle 10 emner er obligatoriske (type O) og summerer seg til 120 sp, altså hele graden - det finnes ingen valgemner eller studieretninger i studiemodellen. Kilde er INNs studiekatalog (edutorium), studiemodell-tabellen for kullet med studiestart høst 2026.',
        obligatoriske: [
          {
            emnekode: 'SKO4004S', emnenavn: 'Flerbruk i skog: teori og praksis', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SKO4004S-1'],
            years: [
              { year: 2025, A: 7, B: 9, C: 12, D: 5, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.55, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MBJ4002S', emnenavn: 'Forskningsmetode og dataanalyse', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MBJ4002S-1'],
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'SKO4003S', emnenavn: 'Geographic Information Systems', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['SKO4003S-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 0, total: 15, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 3 },
            ],
          },
          {
            emnekode: 'SKO4002S', emnenavn: 'Bærekraftig skogbruk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['SKO4002S-1'],
            years: [
              { year: 2025, A: 0, B: 3, C: 3, D: 4, E: 4, F: 0, G: 0, H: 0, total: 14, snitt: 2.36, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'SKO4001S', emnenavn: 'Areal- og eiendomsforvaltning', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['SKO4001S-1'],
            years: [
              { year: 2024, A: 0, B: 4, C: 6, D: 5, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'SKO4005S', emnenavn: 'Ressurskartlegging', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['SKO4005S-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 2.64, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'SKO4006S', emnenavn: 'Prosjektledelse', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MBJ4004S', emnenavn: 'Studiedesign og statistisk metode', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'SKO4007S', emnenavn: 'Beslutningsanalyse', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'SKO4900S', emnenavn: 'Masteroppgave i bærekraftig skogforvaltning', studiepoeng: 30, aar: 3, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Går over to semestre: 10 sp i 3. år høst og 20 sp i 3. år vår, ifølge studiemodell-tabellen.',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'okologi2', label: 'Økologi (2-årig master)', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_okologi2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Økologi (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/okologi', 'https://static02.nmbu.no/mina/studier/M-ECOL.php?sprx=n&aarx=2026'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 90,
        merknad: 'Kilde er MINA-fakultetets studieplan-verktøy for kullet med studiestart høsten 2026. Utover de sju emnene over (90 sp obligatorisk kjerne, inkl. masteroppgaven på 60 sp) stiller programmet krav om at minst ett 300-nivå spesialiseringsemne innen økologi må inngå for å oppnå mastergraden i økologi - dette er et obligatorisk valg mellom alternativer (bl.a. BIO328 Miljø-DNA, BOT300 Planteøkologi, ECOL330 Tropisk regnskogsøkologi, ECOL380 Elve- og innsjøøkologi, FMI310 Miljøgifter og økotoksikologi, LAA370 Landskapsøkologi, NATF320 Tropisk økologi og naturforvaltning, NATF350 Menneske-vilt-interaksjoner, SKOG304 Skogøkologi, ZOOL300 Insektøkologi m.fl., 5-15 sp hver) og er derfor ikke ført opp som enkeltemne. De resterende ca. 30 sp av graden fylles med dette spesialiseringsemnet pluss frie valgemner. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'NATF300', emnenavn: 'Bevaringsbiologi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['NATF300-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 6, D: 4, E: 4, F: 0, G: 0, H: 0, total: 17, snitt: 2.47, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 6, B: 7, C: 0, D: 5, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.78, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 5, B: 11, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.05, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 8, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 4, B: 5, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.81, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'ECOL310', emnenavn: 'Økologiske effekter av globale miljøendringer', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECOL310-1'],
            years: [
              { year: 2021, A: 5, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.42, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 9, B: 7, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.25, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 11, B: 16, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 4.27, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 6, B: 10, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.05, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 11, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.55, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'ECOL302', emnenavn: 'Økologisk forskning', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECOL302-1'], merknad: 'Ligger i Augustblokk.',
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'MINA310', emnenavn: 'Naturvitenskapelig metode', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MINA310-1'],
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'ECOL350', emnenavn: 'Restaureringsøkologi', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['ECOL350-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'MINA321', emnenavn: 'Tverrfaglig samarbeid og kontroverser om bærekraft - engelsk versjon', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MINA321-1'], merknad: 'Ligger i Januarblokk. MINA320 (norsk versjon av samme emne) kan tas i høstsemesteret av studenter som behersker norsk.',
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 0, total: 14, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'M60-ECOL', emnenavn: 'Masteroppgave', studiepoeng: 60, aar: 2, semester: 'høst',
            dbhEmnekoder: ['M60-ECOL-1'], merknad: 'Går over hele 2. studieår (30 sp høst + 30 sp vår), altså begge semestre i år 2.',
            years: [
              { year: 2021, A: 6, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.19, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 5, B: 8, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.95, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 8, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 6, B: 10, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.16, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 6, B: 10, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.05, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'inn_anvendt_okologi2', shortName: 'INN', institusjon: 'Universitetet i Innlandet', isNmbu: false, programnavn: 'Anvendt økologi (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.inn.no/studier/vare-studier/master-i-anvendt-okologi/', 'https://studiekatalog.edutorium.no/inn/nb/program/MAOK'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 120,
        merknad: 'Toårig heltids campusstudium (Evenstad) med studiestart høst 2026. Alle ni emner i hovedstudiemodellen er merket «O» (obligatorisk) i INNs studiekatalog og summerer seg nøyaktig til 120 sp (25+35+30+30 per semester), så det finnes ingen valgfri spesialisering innenfor de 120 sp. Katalogen lister i tillegg en egen liten valgfagsmodell (6EV315 Chemical and physical capture of Scandinavian Mammals, MAOK4006 Biostatistics II, 2,5 sp hver, «V»-type) som ikke inngår i de obligatoriske 120 sp. Programmet «Anvendt økologi» ved INN inngår i to sammenligningsgrupper i programkart.json (okologi2 og naturforvaltning2); denne filen brukes for begge (inn_anvendt_okologi2 og inn_anvendt_okologi_nf2), da det er samme studieplan. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'MAOK4001', emnenavn: 'Concepts in ecology', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MAOK4001-1'],
            years: [
              { year: 2024, A: 0, B: 7, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.24, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 9, B: 6, C: 9, D: 5, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.66, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MAOK4002', emnenavn: 'Biostatistics', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MAOK4002-1'],
            years: [
              { year: 2024, A: 6, B: 4, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.72, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 3, C: 11, D: 3, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'MAOK4012', emnenavn: 'Nature in the Anthropocene', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MAOK4013', emnenavn: 'Wildlife population health', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MAOK4011', emnenavn: 'Human-Wildlife Conflicts and Coexistence', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'SKO4003S', emnenavn: 'Geographic Information Systems', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['SKO4003S-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'MAOK4004', emnenavn: 'Wildlife monitoring', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MAOK4004-1'],
            years: [
              { year: 2025, A: 0, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MAOK4005', emnenavn: 'Research process and topics', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MAOK4005-1'],
            years: [
              { year: 2025, A: 10, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.67, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: '6EV399', emnenavn: 'Master thesis in applied ecology', studiepoeng: 60, aar: 1, semester: 'vår',
            dbhEmnekoder: ['6EV399-1'], merknad: 'Går over tre semestre ifølge studiemodell-tabellen: 10 sp i 1. år vår, 20 sp i 2. år høst og 30 sp i 2. år vår (totalt 60 sp).',
            years: [
              { year: 2021, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 3, B: 18, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.89, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 3, B: 9, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2025, A: 8, B: 7, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4.05, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_biologi2', shortName: 'NTNU Biologi', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Biologi (master 2 år)',
        studieplanAar: '2025/2026', kilder: ['https://www.ntnu.no/studier/msbio', 'https://www.ntnu.no/studier/studieplan#programmeCode=MSBIO&year=0', 'https://www.ntnu.no/web/studier/studieplan?p_p_id=studyprogrammeplannerportlet_WAR_studyprogrammeplannerportlet_INSTANCE_KzJMPh2hQuXL&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=studyplan&p_p_cacheability=cacheLevelPage&code=MSBIO&year=2025'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 67.5,
        merknad: 'Kilde er NTNUs studieplan-API (studyprogrammeplannerportlet, resource_id=studyplan) for MSBIO, lest for kull 2025 (fullstendig 4-periodig/2-årig plan, oppdatert 12.05.2026); kull 2026 har foreløpig ingen publisert studieplan. Programmet har fire studieretninger (Ecology/Behaviour/Evolution/Biosystematics, Cell and Molecular Biology, Physiology, Biodiversity and Systematics/Nabis), valgt av studenten ved opptak eller tidlig i studiet. I studieretningen «Ecology, Behaviour, Evolution and Biosystematics» finnes ingen rent obligatoriske enkeltemner utover fellesdelen; i stedet kreves minst 2 emner fra en gruppe A (BI3052 Study Design og BI3106 Ecological and evolutionary dynamics i 1. år høst; BI3036 Plant Ecology, BI3040 Behavioural Ecology og BI3082 Advanced Conservation Biology i 1. år vår; BI3051 Quantitative Analyses in Biology i 2. år høst - alle 7,5 sp), et obligatorisk valg mellom alternativer og derfor ikke ført opp som enkeltemner. I studieretningen «Cell and Molecular Biology» er masteroppgaven et obligatorisk valg mellom BI3900 (Master Thesis in Biology, ført opp i fellesdelen) og BT3920 (Master Thesis in Biology at IBT), begge 60 sp over fire semestre. Experts in Teamwork (EiT, 7,5 sp, 1. år vår) er obligatorisk for alle fire studieretninger, men studenten velger selv blant et stort antall emnekoder og er derfor ikke ført opp som enkeltemne. «Biodiversity and Systematics (Nabis)» har ingen studieretningsspesifikke obligatoriske emner utover fellesdelen i studieplan-API-et. BI3086 «How to do Science» (0 sp, 1. år høst) er merket obligatorisk for studieretningene Ecology og Cell and Molecular Biology i API-dataene, men ikke for Physiology eller Biodiversity and Systematics - dette fremstår som en inkonsistens i kildedataene og er derfor ikke ført opp i noen av listene. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'HMS0003', emnenavn: 'Health, Safety and Environment (HSE) course for master students', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0003-1'], merknad: 'Felles for alle fire studieretninger.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 50, H: 0, total: 50, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 36, H: 0, total: 36, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'BI3085', emnenavn: 'Biology without borders', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BI3085-1'], merknad: 'Går over alle fire semestre (del 1-4 av 4), 7,5 sp totalt. Felles for alle fire studieretninger.',
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 0, total: 14, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 4, total: 19, snitt: null, strykprosent: null, bestattprosent: 78.9, skjult: 0 },
            ],
          },
          {
            emnekode: 'BI3900', emnenavn: 'Master Thesis in Biology', studiepoeng: 60, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BI3900-1'], merknad: 'Går over alle fire semestre (del 1-4 av 4), 60 sp totalt. Obligatorisk for studieretningene Ecology/Behaviour/Evolution/Biosystematics, Physiology og Biodiversity and Systematics (Nabis). I studieretningen Cell and Molecular Biology er dette et obligatorisk valg mellom BI3900 og BT3920 (Master Thesis in Biology at IBT) - se merknad på den studieretningen.',
            years: [
              { year: 2021, A: 7, B: 6, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.05, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 7, B: 14, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 4.04, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 3, B: 16, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.88, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2025, A: 7, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.54, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Ecology, Behaviour, Evolution and Biosystematics', obligatoriske: [
          ] },
          { navn: 'Cell and Molecular Biology', obligatoriske: [
            {
              emnekode: 'BI3016', emnenavn: 'Molecular Cell Biology', studiepoeng: 7.5, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BI3016-1'],
              years: [
                { year: 2021, A: 0, B: 4, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
                { year: 2022, A: 0, B: 0, C: 5, D: 4, E: 0, F: 6, G: 0, H: 0, total: 15, snitt: 1.53, strykprosent: 40, bestattprosent: null, skjult: 4 },
                { year: 2023, A: 0, B: 3, C: 9, D: 4, E: 0, F: 3, G: 0, H: 0, total: 19, snitt: 2.47, strykprosent: 15.8, bestattprosent: null, skjult: 3 },
                { year: 2024, A: 3, B: 3, C: 0, D: 3, E: 0, F: 7, G: 0, H: 0, total: 16, snitt: 2.06, strykprosent: 43.8, bestattprosent: null, skjult: 5 },
                { year: 2025, A: 0, B: 0, C: 4, D: 0, E: 0, F: 6, G: 0, H: 0, total: 10, snitt: 1.2, strykprosent: 60, bestattprosent: null, skjult: 6 },
              ],
            },
          ] },
          { navn: 'Physiology', obligatoriske: [
            {
              emnekode: 'BI3024', emnenavn: 'Advanced Physiology', studiepoeng: 7.5, aar: 1, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
          ] },
          { navn: 'Biodiversity and Systematics (Nabis)', obligatoriske: [
          ] },
        ],
      },
      {
        entryId: 'uit_biologi2', shortName: 'UiT Biologi', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Biology (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://uit.no/utdanning/program/270464/biology_-_master', 'https://uit.no/Content/916698/cache=20262808095126/Study%20plan%20Master%20in%20Biology%202026.pdf'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 70,
        merknad: 'Kilde er programbeskrivelsen («Study plan Master in Biology») godkjent av fakultetsstyret 17.06.2025, hentet fra en 2026-datert PDF-lenke på programsiden. Studiet er et toårig heltids campusstudium i Tromsø med sju spesialiseringer valgt ved opptak (søkerkode per spesialisering). Studentene skal fullføre emner for minst 60 sp i de to første semestrene (10+10+10 sp-format per semester), hvorav de spesialiseringsspesifikke obligatoriske emnene over er en del; resten fylles med valgfrie emner etter studentens interesse/prosjekt. Alle spesialiseringer krever i tillegg 4 sikkerhetskurs uten studiepoeng (HMS-0501 til HMS-0504) og TVR-3000 i 1. semester. BIO-3012 (Ecological methodology) er obligatorisk i fem av de sju spesialiseringene, men ikke i «Arctic animal biology» og «Molecular environmental biology», der andre emner dekker tilsvarende plass. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet. Denne filen dekker uit_biologi2, som inngår i sammenligningsgruppen økologi2.',
        obligatoriske: [
          {
            emnekode: 'TVR-3000', emnenavn: 'on sustainability, innovation and collaborative learning', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Felles for alle sju spesialiseringer. I tillegg må alle studenter gjennomføre fire sikkerhetskurs uten studiepoeng ved semesterstart (HMS-0501, HMS-0502, HMS-0503, HMS-0504).',
            years: [],
          },
          {
            emnekode: 'BIO-3950', emnenavn: 'Master\'s Thesis Biology', studiepoeng: 60, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO-3950-1'], merknad: 'Går over hele 2. studieår (3. og 4. semester, 30 sp hvert semester). Felles for alle sju spesialiseringer.',
            years: [
              { year: 2021, A: 8, B: 15, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 9, B: 24, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 4.02, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 6, B: 27, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.88, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 10, B: 14, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.92, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 6, B: 16, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.85, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Arctic animal biology', obligatoriske: [
            {
              emnekode: 'BIO-3035', emnenavn: 'Arctic Animal Biology: Physiological and Behavioural Adaptations to the Environment', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'BIO-3014', emnenavn: 'Biological timekeeping', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'BIO-3036', emnenavn: 'Arctic Animal Biology: Exploring Physiological Control Mechanisms', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
          ] },
          { navn: 'Arctic marine ecology', obligatoriske: [
            {
              emnekode: 'BIO-3015', emnenavn: 'Arctic Marine System Biology and Climate Change', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIO-3015-1'],
              years: [
                { year: 2021, A: 0, B: 8, C: 4, D: 5, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.18, strykprosent: 0, bestattprosent: null, skjult: 5 },
                { year: 2022, A: 0, B: 11, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.65, strykprosent: 0, bestattprosent: null, skjult: 6 },
                { year: 2023, A: 8, B: 8, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.26, strykprosent: 0, bestattprosent: null, skjult: 0 },
                { year: 2024, A: 15, B: 12, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 4.56, strykprosent: 0, bestattprosent: null, skjult: 0 },
                { year: 2025, A: 11, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.58, strykprosent: 0, bestattprosent: null, skjult: 1 },
              ],
            },
            {
              emnekode: 'BIO-3012', emnenavn: 'Ecological methodology: Study design and statistical analysis', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: ['BIO-3012-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 40, H: 3, total: 43, snitt: null, strykprosent: null, bestattprosent: 93, skjult: 2 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 43, H: 8, total: 51, snitt: null, strykprosent: null, bestattprosent: 84.3, skjult: 1 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 9, total: 44, snitt: null, strykprosent: null, bestattprosent: 79.5, skjult: 0 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 42, H: 5, total: 47, snitt: null, strykprosent: null, bestattprosent: 89.4, skjult: 1 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 46, H: 0, total: 46, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              ],
            },
          ] },
          { navn: 'Arctic marine ecotoxicology', obligatoriske: [
            {
              emnekode: 'BIO-3009', emnenavn: 'Arctic Marine Pollution', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIO-3009-1'],
              years: [
                { year: 2021, A: 3, B: 5, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.37, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2022, A: 3, B: 7, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 0 },
                { year: 2023, A: 3, B: 5, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.73, strykprosent: 0, bestattprosent: null, skjult: 0 },
                { year: 2024, A: 8, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.29, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2025, A: 0, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              ],
            },
            {
              emnekode: 'BIO-3012', emnenavn: 'Ecological methodology: Study design and statistical analysis', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: ['BIO-3012-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 40, H: 3, total: 43, snitt: null, strykprosent: null, bestattprosent: 93, skjult: 2 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 43, H: 8, total: 51, snitt: null, strykprosent: null, bestattprosent: 84.3, skjult: 1 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 9, total: 44, snitt: null, strykprosent: null, bestattprosent: 79.5, skjult: 0 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 42, H: 5, total: 47, snitt: null, strykprosent: null, bestattprosent: 89.4, skjult: 1 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 46, H: 0, total: 46, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              ],
            },
            {
              emnekode: 'BIO-3020', emnenavn: 'Fundamentals of Ecotoxicology', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: ['BIO-3020-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2022, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2023, A: 0, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 1 },
                { year: 2024, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 6 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
              ],
            },
          ] },
          { navn: 'Ecology and sustainability', obligatoriske: [
            {
              emnekode: 'BIO-3021', emnenavn: 'Sustainability Science', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIO-3021-1'],
              years: [
                { year: 2022, A: 0, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2023, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 1 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
              ],
            },
            {
              emnekode: 'BIO-3012', emnenavn: 'Ecological methodology: Study design and statistical analysis', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: ['BIO-3012-1'], merknad: 'I tillegg kreves et valgfritt emne innen økologi-temaet (10 sp, vår) - obligatorisk valg mellom flere emner, ikke ført opp som enkeltemne.',
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 40, H: 3, total: 43, snitt: null, strykprosent: null, bestattprosent: 93, skjult: 2 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 43, H: 8, total: 51, snitt: null, strykprosent: null, bestattprosent: 84.3, skjult: 1 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 9, total: 44, snitt: null, strykprosent: null, bestattprosent: 79.5, skjult: 0 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 42, H: 5, total: 47, snitt: null, strykprosent: null, bestattprosent: 89.4, skjult: 1 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 46, H: 0, total: 46, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              ],
            },
          ] },
          { navn: 'Freshwater ecology', obligatoriske: [
            {
              emnekode: 'BIO-3505', emnenavn: 'Ecological Interactions', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIO-3505-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
                { year: 2022, A: 3, B: 6, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.86, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2024, A: 3, B: 9, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 1 },
                { year: 2025, A: 4, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.89, strykprosent: 0, bestattprosent: null, skjult: 2 },
              ],
            },
            {
              emnekode: 'BIO-3012', emnenavn: 'Ecological methodology: Study design and statistical analysis', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: ['BIO-3012-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 40, H: 3, total: 43, snitt: null, strykprosent: null, bestattprosent: 93, skjult: 2 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 43, H: 8, total: 51, snitt: null, strykprosent: null, bestattprosent: 84.3, skjult: 1 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 9, total: 44, snitt: null, strykprosent: null, bestattprosent: 79.5, skjult: 0 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 42, H: 5, total: 47, snitt: null, strykprosent: null, bestattprosent: 89.4, skjult: 1 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 46, H: 0, total: 46, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              ],
            },
            {
              emnekode: 'BIO-3518', emnenavn: 'Northern Inland Waters and Climate Change', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: ['BIO-3518-2'],
              years: [
                { year: 2022, A: 3, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 1 },
                { year: 2023, A: 0, B: 8, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 1 },
                { year: 2024, A: 0, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2025, A: 3, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 0 },
              ],
            },
          ] },
          { navn: 'Molecular environmental biology', obligatoriske: [
            {
              emnekode: 'BIO-3037', emnenavn: 'Molecular Methods in Plant Biology', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'BIO-3038', emnenavn: 'Molecular Methods in Environmental Microbiology', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'BIO-3027', emnenavn: 'Scientific Programming with Python in the life sciences', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: ['BIO-3027-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 4, H: 0, total: 4, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 3, H: 0, total: 3, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 0, total: 7, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 5, H: 0, total: 5, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 0, total: 7, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              ],
            },
          ] },
          { navn: 'Northern populations and ecosystems', obligatoriske: [
            {
              emnekode: 'BIO-3013', emnenavn: 'Northern Food Web Ecology', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIO-3013-1'],
              years: [
                { year: 2021, A: 3, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 7 },
                { year: 2023, A: 0, B: 0, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 10 },
                { year: 2024, A: 4, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.08, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2025, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 8 },
              ],
            },
            {
              emnekode: 'BIO-3012', emnenavn: 'Ecological methodology: Study design and statistical analysis', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: ['BIO-3012-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 40, H: 3, total: 43, snitt: null, strykprosent: null, bestattprosent: 93, skjult: 2 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 43, H: 8, total: 51, snitt: null, strykprosent: null, bestattprosent: 84.3, skjult: 1 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 9, total: 44, snitt: null, strykprosent: null, bestattprosent: 79.5, skjult: 0 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 42, H: 5, total: 47, snitt: null, strykprosent: null, bestattprosent: 89.4, skjult: 1 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 46, H: 0, total: 46, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              ],
            },
          ] },
        ],
      },
    ],
  },
  {
    id: 'naturforvaltning2', label: 'Naturforvaltning (2-årig master)', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_naturforvaltning2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Naturforvaltning (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/naturforvaltning', 'https://static02.nmbu.no/mina/studier/M-NF.php?sprx=n&aarx=2026'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 75,
        merknad: 'Kilde er MINA-fakultetets studieplan-verktøy for kullet med studiestart høsten 2026. Utover de sju emnene over (75 sp) stiller programmet flere obligatoriske valgkrav som ikke er ført opp som enkeltemner: (1) studenter uten bakgrunn i statistikk må i tillegg ta STAT100 Statistikk (10 sp); (2) ett metodeemne må velges mellom MAST301 (5 sp), MINA310 (5 sp) og MINA311 (10 sp); (3) minst 15 sp og minst to av en liste 300-nivå emner (bl.a. ECN375, ECOL310, ECOL350, ECOL380, EDS348 m.fl.) må inngå i graden. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'JUS220', emnenavn: 'Miljøforvaltningsrett', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['JUS220-1'],
            years: [
              { year: 2021, A: 3, B: 5, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.35, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 12, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.82, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 5, B: 8, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.12, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 4, B: 8, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.84, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 3, B: 13, C: 3, D: 5, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MINA320', emnenavn: 'Tverrfaglig samarbeid og kontroverser om bærekraft', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MINA320-1'], merknad: 'MINA321 (engelsk versjon av samme emne) kan tas i Januarblokk i stedet.',
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 0, total: 29, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'NATF302', emnenavn: 'Norsk naturforvaltning', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['NATF302-1'], merknad: 'Ligger i Augustblokk.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 33, H: 0, total: 33, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'APL240', emnenavn: 'Miljø og planlegging, del 1', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['APL240-1'],
            years: [
              { year: 2021, A: 0, B: 11, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 3, B: 5, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.42, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 6, B: 12, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.96, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 4, B: 8, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.89, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 5, B: 6, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.89, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'APL241', emnenavn: 'Miljø og planlegging, del 2', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['APL241-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'NATF301', emnenavn: 'Praktisk naturforvaltning', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['NATF301-1'], merknad: 'Kan erstattes av NATF370 Arbeidslivserfaring i økologi og naturforvaltning.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 0, total: 29, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'M45-NF', emnenavn: 'Masteroppgave', studiepoeng: 45, aar: 2, semester: 'høst',
            dbhEmnekoder: ['M45-NF-1'], merknad: 'Går over tre deler ifølge studieplan-tabellen: 10 sp feltarbeid i Juniblokk 1. år, 5 sp i 2. år høst og 30 sp i 2. år vår (totalt 45 sp). Nettsiden lenker feilaktig emnekoden som «m60-nf», men den koden finnes ikke hos NMBU; den fungerende emnesiden er M45-NF Masteroppgave (45 sp), som stemmer med sp-summen i tabellen.',
            years: [
              { year: 2024, A: 0, B: 11, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 7, B: 9, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.15, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_naturressurs2', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Naturressursforvaltning (master 2 år)',
        studieplanAar: '2025/2026', kilder: ['https://www.ntnu.no/studier/msnarm', 'https://www.ntnu.no/studier/studieplan#programmeCode=MSNARM&year=0', 'https://www.ntnu.no/web/studier/studieplan?p_p_id=studyprogrammeplannerportlet_WAR_studyprogrammeplannerportlet_INSTANCE_KzJMPh2hQuXL&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=studyplan&p_p_cacheability=cacheLevelPage&code=MSNARM&year=2025'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 30,
        merknad: 'Kilde er NTNUs studieplan-API (studyprogrammeplannerportlet, resource_id=studyplan) for MSNARM, lest for kull 2025 (fullstendig 4-periodig/2-årig plan, oppdatert 12.05.2026); kull 2026 har foreløpig ingen publisert studieplan. Programmet har to studieretninger (Biology og Geography) med felles kjerne (30 sp) i 1. år, men egen masteroppgave (60 sp, NATRBI3900 for Biology / GEOG3940 for Geography) i 2. år. Studieretningen Geography har i tillegg et obligatorisk krav om minst ett emne fra en gruppe A (GEOG3005 Qualitative Methods, GEOG3006 Quantitative Methods eller GEOG3523 GIS Data Capture and Mapping, alle 7,5 sp, 1. år høst) - et obligatorisk valg mellom alternativer og derfor ikke ført opp som enkeltemne. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'HMS0003', emnenavn: 'Health, Safety and Environment (HSE) course for master students', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0003-1'], merknad: 'Ført opp som obligatorisk for studieretningen Biology i studieplan-API-et; ikke listet for studieretningen Geography, som trolig er en inkonsistens i kildedataene.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 0, total: 7, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'GEOG3030', emnenavn: 'Natural Resources Planning and Management', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['GEOG3030-1'], merknad: 'Felles for begge studieretninger.',
            years: [
              { year: 2021, A: 0, B: 8, C: 14, D: 20, E: 3, F: 0, G: 0, H: 0, total: 45, snitt: 2.6, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 8, C: 17, D: 7, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.03, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 4, B: 8, C: 6, D: 6, E: 4, F: 0, G: 0, H: 0, total: 28, snitt: 3.07, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 10, C: 7, D: 5, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.23, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 5, B: 9, C: 20, D: 4, E: 3, F: 0, G: 0, H: 0, total: 41, snitt: 3.22, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'RFEL3081', emnenavn: 'Interdisciplinary Project for Environmental Sustainability', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['RFEL3081-1'], merknad: 'Felles for begge studieretninger.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'RFEL3080', emnenavn: 'Scientific Research Seminar in Natural Resource Management', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['RFEL3080-1'], merknad: 'Går over alle fire semestre (del 1-4 av 4), 7,5 sp totalt. Felles for begge studieretninger.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 0, total: 35, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'RFEL3082', emnenavn: 'Sustainable Management of Ecosystem Services', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['RFEL3082-1'], merknad: 'Felles for begge studieretninger.',
            years: [
              { year: 2021, A: 20, B: 11, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 5, B: 15, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.74, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 4, B: 12, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.71, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 5, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.36, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 4, B: 6, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.88, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Biology', obligatoriske: [
            {
              emnekode: 'BI3086', emnenavn: 'How to do Science', studiepoeng: 0, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BI3086-1'],
              years: [
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 0, total: 7, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              ],
            },
            {
              emnekode: 'NATRBI3900', emnenavn: 'Master Thesis in Natural Resources Management - Biology', studiepoeng: 60, aar: 2, semester: 'høst',
              dbhEmnekoder: ['NATRBI3900-1'], merknad: 'Går over hele 2. studieår (del 1-2 av 2, periode 3 og 4).',
              years: [
                { year: 2021, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 7 },
                { year: 2023, A: 0, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 6 },
                { year: 2024, A: 0, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2025, A: 4, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              ],
            },
          ] },
          { navn: 'Geography', obligatoriske: [
            {
              emnekode: 'GEOG3940', emnenavn: 'Master\'s Thesis - Natural Resources Management - Geography', studiepoeng: 60, aar: 2, semester: 'høst',
              dbhEmnekoder: ['GEOG3940-1'], merknad: 'Går over hele 2. studieår (del 1-2 av 2, periode 3 og 4).',
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
                { year: 2022, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
                { year: 2023, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
                { year: 2025, A: 3, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 1 },
              ],
            },
          ] },
        ],
      },
      {
        entryId: 'usn_okologi_miljoforvaltning2', shortName: 'USN', institusjon: 'Universitetet i Sørøst-Norge', isNmbu: false, programnavn: 'Økologi og miljøforvaltning (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.usn.no/studier/master-i-okologi-og-miljoforvaltning/', 'https://www.usn.no/studier/studie-og-emneplaner/#/studieplan/1918_2026_HØST'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 75,
        merknad: 'Kilde er USNs studiemodell-verktøy for kullet med studiestart høst 2026 (emnekode 1918). Programmet har ingen studieretninger. Utover de tre obligatoriske emnene (75 sp) skal studenten ta totalt 6 valgemner à 7,5 sp (45 sp) blant EE503 Bærekraftig vannforvaltning, EE504 Habitat Ecology, EE506 Individual Project, MSM4330 Spatial analyses (alle høst), EE507 Ecotoxicology, EE508 Applied Molecular Genetics, EE509 Landscape Analysis and Remote Sensing, EEWORK Approved Practice og EE511 Conservation Biology (alle vår) - fri valgfrihet, ikke ført opp som enkeltemner. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'EE501', emnenavn: 'Climate Change and Ecology', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EE501-1'],
            years: [
              { year: 2022, A: 0, B: 7, C: 11, D: 8, E: 16, F: 11, G: 0, H: 0, total: 53, snitt: 1.75, strykprosent: 20.8, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 3, D: 4, E: 5, F: 4, G: 0, H: 0, total: 16, snitt: 1.38, strykprosent: 25, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 3, B: 5, C: 9, D: 7, E: 7, F: 8, G: 0, H: 0, total: 39, snitt: 2.13, strykprosent: 20.5, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 5, B: 11, C: 6, D: 8, E: 7, F: 0, G: 0, H: 0, total: 37, snitt: 2.97, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'EE502', emnenavn: 'Statistics and Study Design', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EE502-1'],
            years: [
              { year: 2022, A: 0, B: 16, C: 14, D: 9, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.18, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 3, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 9, C: 21, D: 5, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.11, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 3, B: 6, C: 12, D: 4, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.32, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: '4317', emnenavn: 'Masteroppgave', studiepoeng: 60, aar: 2, semester: 'høst',
            dbhEmnekoder: ['4317-1'], merknad: 'Går over 2 semestre ifølge studiemodellen: 2. år høst og 2. år vår.',
            years: [
              { year: 2021, A: 0, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 0, B: 8, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 7, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.25, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 10, B: 13, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 4.22, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2025, A: 6, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.38, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'inn_anvendt_okologi_nf2', shortName: 'INN', institusjon: 'Universitetet i Innlandet', isNmbu: false, programnavn: 'Anvendt økologi (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.inn.no/studier/vare-studier/master-i-anvendt-okologi/', 'https://studiekatalog.edutorium.no/inn/nb/program/MAOK'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 120,
        merknad: 'Toårig heltids campusstudium (Evenstad) med studiestart høst 2026. Alle ni emner i hovedstudiemodellen er merket «O» (obligatorisk) i INNs studiekatalog og summerer seg nøyaktig til 120 sp (25+35+30+30 per semester), så det finnes ingen valgfri spesialisering innenfor de 120 sp. Katalogen lister i tillegg en egen liten valgfagsmodell (6EV315 Chemical and physical capture of Scandinavian Mammals, MAOK4006 Biostatistics II, 2,5 sp hver, «V»-type) som ikke inngår i de obligatoriske 120 sp. Programmet «Anvendt økologi» ved INN inngår i to sammenligningsgrupper i programkart.json (okologi2 og naturforvaltning2); denne filen brukes for begge (inn_anvendt_okologi2 og inn_anvendt_okologi_nf2), da det er samme studieplan. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'MAOK4001', emnenavn: 'Concepts in ecology', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MAOK4001-1'],
            years: [
              { year: 2024, A: 0, B: 7, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.24, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 9, B: 6, C: 9, D: 5, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.66, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MAOK4002', emnenavn: 'Biostatistics', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MAOK4002-1'],
            years: [
              { year: 2024, A: 6, B: 4, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.72, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 3, C: 11, D: 3, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'MAOK4012', emnenavn: 'Nature in the Anthropocene', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MAOK4013', emnenavn: 'Wildlife population health', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MAOK4011', emnenavn: 'Human-Wildlife Conflicts and Coexistence', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'SKO4003S', emnenavn: 'Geographic Information Systems', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['SKO4003S-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'MAOK4004', emnenavn: 'Wildlife monitoring', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MAOK4004-1'],
            years: [
              { year: 2025, A: 0, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MAOK4005', emnenavn: 'Research process and topics', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MAOK4005-1'],
            years: [
              { year: 2025, A: 10, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.67, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: '6EV399', emnenavn: 'Master thesis in applied ecology', studiepoeng: 60, aar: 1, semester: 'vår',
            dbhEmnekoder: ['6EV399-1'], merknad: 'Går over tre semestre ifølge studiemodell-tabellen: 10 sp i 1. år vår, 20 sp i 2. år høst og 30 sp i 2. år vår (totalt 60 sp).',
            years: [
              { year: 2021, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 3, B: 18, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.89, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 3, B: 9, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2025, A: 8, B: 7, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4.05, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'miljonatur2', label: 'Miljøvitenskap (2-årig master)', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_miljovitenskap2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Miljøvitenskap (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/miljovitenskap', 'https://static02.nmbu.no/mina/studier/M-MILJ%C3%98.php?sprx=n&aarx=2026'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 55,
        merknad: 'Kilde er MINA-fakultetets studieplan-verktøy for kullet med studiestart høsten 2026. Utover de tre emnene over (55 sp) stiller programmet krav om at minst to hovedemner innen miljøvitenskap må inngå for å oppnå mastergraden (bl.a. FMI310 Miljøgifter og økotoksikologi, GEO300 Videregående hydrogeologi, GEO310 Paleomiljø og klimaendringer, JORD310 Jordforurensning og bærekraft, JORD330 Jordhelse og bærekraftig bruk av jordressurser, MILJØ300 Globale miljøendringer og jordsystemet, VANN300 Vannforurensning m.fl., alle 10 sp) - et obligatorisk valg mellom alternativer og derfor ikke ført opp som enkeltemner. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'MILJO302', emnenavn: 'Miljøvitenskap', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Ligger i Augustblokk. Emnekode skrives MILJØ302 på NMBUs sider.',
            years: [],
          },
          {
            emnekode: 'MINA321', emnenavn: 'Tverrfaglig samarbeid og kontroverser om bærekraft - engelsk versjon', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MINA321-1'], merknad: 'Ligger i Januarblokk. MINA320 (norsk versjon av samme emne) kan tas i høstparallellen i stedet.',
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 5, H: 0, total: 5, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 0, total: 7, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'M45-MILJO', emnenavn: 'Masteroppgave', studiepoeng: 45, aar: 2, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Går over to semestre: 15 sp i 2. år høst og 30 sp i 2. år vår. Emnekode skrives M45-MILJØ på NMBUs sider.',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'nmbu_mina2_forgjenger', shortName: 'NMBU Miljø og naturressurser', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Miljø og naturressurser (master 2 år, forgjenger)',
        studieplanAar: '2021/2022', kilder: ['https://static02.nmbu.no/mina/studier/M-MINA.php?sprx=n&aarx=2021', 'https://static02.nmbu.no/mina/studier/M-MINA.php?srex=mo&sprx=n&aarx=2021', 'https://static02.nmbu.no/mina/studier/M-MINA.php?srex=ge&sprx=n&aarx=2021', 'https://static02.nmbu.no/mina/studier/M-MINA.php?srex=jm&sprx=n&aarx=2021', 'https://static02.nmbu.no/mina/studier/M-MINA.php?srex=li&sprx=n&aarx=2021', 'https://static02.nmbu.no/mina/studier/M-MINA.php?srex=ro&sprx=n&aarx=2021'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 65,
        merknad: 'Miljø og naturressurser (M-MINA) er en nedlagt forgjenger til dagens Miljøvitenskap (M-MILJØ) ved NMBU/MINA; siste opptak var høsten 2021. Programsiden nmbu.no/studier/master-2-aar/miljovitenskap fra programkart.json peker i dag til etterfølgerprogrammet og inneholder ikke lenger denne studieplanen - dataene her er hentet fra MINA-fakultetets arkiverte studieplan-verktøy for kullet med studiestart høsten 2021 (fullstendig 2-årig plan, gyldig til og med 2022/2023). Programmet hadde fem studieretninger valgt av studenten: Miljøgifter og økotoksikologi, Geologi, Jord og miljø, Limnologi og vannressurser og Radioøkologi. Alle fem retninger har MINA302 og masteroppgaven felles (65 sp), pluss retningsspesifikke obligatoriske emner (20-25 sp). I tillegg krever studieplanen at minst 30 studiepoeng totalt i graden består av 300-nivå emner («Til sammen må minst 30 studiepoeng bestå av 300-emner») - et krav på tvers av frie valgemner, ikke ført opp som enkeltemne. Flere av emnene (VANN301, VANN311, FMI330, KJM350, KJM351, ECOL300) er ikke lenger i NMBUs aktive emnekatalog; studiepoeng for disse er bekreftet via Wayback Machine-arkiverte emnesider fra studieåret 2021/2022. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette (nedlagte) programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'MINA302', emnenavn: 'Introduksjon til masterstudiet i miljø og naturressurser', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MINA302-1'], merknad: 'Ligger i Augustblokk. Felles for alle fem studieretninger.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'MASTER-OPPGAVEN', emnenavn: 'Masteroppgave', studiepoeng: 60, aar: 2, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Går over hele 2. studieår. Studieplanteksten sier eksplisitt at studenten arbeider med en masteroppgave på enten 30 eller 60 studiepoeng i løpet av det siste studieåret; grid-siden oppgir ingen hyperkoblet emnekode for oppgaven (bare teksten «MASTER-OPPGAVEN»), så feltet gjengir denne teksten i mangel av en offisiell emnekode. 60 sp er satt som representativ verdi; ved 30 sp-alternativet frigjøres 30 sp til ekstra emner. Felles for alle fem studieretninger.',
            years: [],
          },
        ],
        spesialiseringer: [
          { navn: 'Miljøgifter og økotoksikologi', obligatoriske: [
            {
              emnekode: 'FMI312', emnenavn: 'Human miljøkjemi', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['FMI312-1'],
              years: [
                { year: 2021, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              ],
            },
            {
              emnekode: 'FMI310', emnenavn: 'Miljøgifter og økotoksikologi', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: ['FMI310-1'], merknad: 'Går over Vårparallell og Januarblokk.',
              years: [
                { year: 2021, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              ],
            },
            {
              emnekode: 'FMI330', emnenavn: 'Effekter og biomarkørmetoder i økotoksikologi', studiepoeng: 5, aar: 2, semester: 'høst',
              dbhEmnekoder: ['FMI330-1'], merknad: 'Ligger i Augustblokk.',
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 6, H: 0, total: 6, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              ],
            },
          ] },
          { navn: 'Geologi', obligatoriske: [
            {
              emnekode: 'GEO310', emnenavn: 'Paleomiljø og klimaendringer', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'GEO300', emnenavn: 'Videregående hydrogeologi', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: ['GEO300-1'],
              years: [
                { year: 2021, A: 0, B: 3, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 0 },
              ],
            },
          ] },
          { navn: 'Jord og miljø', obligatoriske: [
            {
              emnekode: 'JORD310', emnenavn: 'Jordforurensning og bærekraft', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: ['JORD310-1'],
              years: [
                { year: 2021, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2022, A: 0, B: 0, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 4 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              ],
            },
            {
              emnekode: 'GEO300', emnenavn: 'Videregående hydrogeologi', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: ['GEO300-1'],
              years: [
                { year: 2021, A: 0, B: 3, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 0 },
              ],
            },
          ] },
          { navn: 'Limnologi og vannressurser', obligatoriske: [
            {
              emnekode: 'VANN300', emnenavn: 'Vannforurensning', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['VANN300-1'],
              years: [
                { year: 2021, A: 0, B: 3, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
              ],
            },
            {
              emnekode: 'VANN301', emnenavn: 'Tiltak mot forurensning av vannforekomster', studiepoeng: 5, aar: 1, semester: 'vår',
              dbhEmnekoder: ['VANN301-1'], merknad: 'Ligger i Januarblokk.',
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 0, total: 7, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              ],
            },
            {
              emnekode: 'VANN211', emnenavn: 'Limnologiske metoder', studiepoeng: 5, aar: 1, semester: 'vår',
              dbhEmnekoder: ['VANN211-1'], merknad: 'Ligger i Juniblokk.',
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 6, H: 0, total: 6, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              ],
            },
            {
              emnekode: 'VANN311', emnenavn: 'Feltkurs i alpin limnologi', studiepoeng: 5, aar: 2, semester: 'høst',
              dbhEmnekoder: ['VANN311-1'], merknad: 'Ligger i Augustblokk.',
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 5, H: 0, total: 5, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 0, total: 7, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              ],
            },
          ] },
          { navn: 'Radioøkologi', obligatoriske: [
            {
              emnekode: 'KJM350', emnenavn: 'Radiokjemi', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Går over Høstparallell og Augustblokk.',
              years: [],
            },
            {
              emnekode: 'ECOL300', emnenavn: 'Naturvitenskapelig metode', studiepoeng: 5, aar: 1, semester: 'vår',
              dbhEmnekoder: ['ECOL300-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 4, H: 0, total: 4, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 5, H: 0, total: 5, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              ],
            },
            {
              emnekode: 'KJM351', emnenavn: 'Eksperimentell radioøkologi', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: 'Går over Vårparallell og Januarblokk.',
              years: [],
            },
          ] },
        ],
      },
      {
        entryId: 'ntnu_miljotoks2', shortName: 'NTNU Miljøtoksikologi', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Miljøtoksikologi og naturmiljøkjemi (master 2 år)',
        studieplanAar: '2025/2026', kilder: ['https://www.ntnu.no/studier/msenvitox', 'https://www.ntnu.no/studier/studieplan#programmeCode=MSENVITOX&year=0', 'https://www.ntnu.no/web/studier/studieplan?p_p_id=studyprogrammeplannerportlet_WAR_studyprogrammeplannerportlet_INSTANCE_KzJMPh2hQuXL&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=studyplan&p_p_cacheability=cacheLevelPage&code=MSENVITOX&year=2025'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 7.5,
        merknad: 'Kilde er NTNUs studieplan-API (studyprogrammeplannerportlet, resource_id=studyplan) for MSENVITOX, lest for kull 2025 (fullstendig 4-periodig/2-årig plan, oppdatert 18.09.2026); kull 2026 har foreløpig ingen publisert studieplan. Programmet har to studieretninger (Environmental Chemistry og Environmental Toxicology), hver med egen masteroppgave (60 sp) som løper over alle fire semestre parallelt med emnene, i motsetning til de fleste andre NTNU-programmer der masteroppgaven kommer i 2. år. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'HMS0003', emnenavn: 'Health, Safety and Environment (HSE) course for master students', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0003-1'], merknad: 'Felles for begge studieretninger.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BI3086', emnenavn: 'How to do Science', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BI3086-1'], merknad: 'Felles for begge studieretninger.',
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 0, total: 7, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 9, H: 0, total: 9, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'RFEL3070', emnenavn: 'Scientific Seminars in Environmental Toxicology and Chemistry', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['RFEL3070-1'], merknad: 'Går over alle fire semestre (del 1-4 av 4), 7,5 sp totalt. Felles for begge studieretninger.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 10, H: 0, total: 10, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Environmental Chemistry', obligatoriske: [
            {
              emnekode: 'KJ3910', emnenavn: 'Master Thesis in Environmental Chemistry', studiepoeng: 60, aar: 1, semester: 'høst',
              dbhEmnekoder: ['KJ3910-1'], merknad: 'Går over alle fire semestre (del 1-4 av 4), 60 sp totalt - starter allerede i 1. år høst.',
              years: [
                { year: 2021, A: 8, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.73, strykprosent: 0, bestattprosent: null, skjult: 5 },
                { year: 2022, A: 9, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.53, strykprosent: 0, bestattprosent: null, skjult: 4 },
                { year: 2023, A: 6, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.67, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 8 },
              ],
            },
            {
              emnekode: 'KJ3073', emnenavn: 'Analytical Environmental Chemistry', studiepoeng: 7.5, aar: 1, semester: 'vår',
              dbhEmnekoder: ['KJ3073-1'],
              years: [
                { year: 2021, A: 10, B: 13, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4.43, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2022, A: 8, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.47, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2023, A: 9, B: 11, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
                { year: 2024, A: 4, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.1, strykprosent: 0, bestattprosent: null, skjult: 0 },
                { year: 2025, A: 0, B: 5, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 2 },
              ],
            },
          ] },
          { navn: 'Environmental Toxicology', obligatoriske: [
            {
              emnekode: 'BI3071', emnenavn: 'Advanced Ecotoxicology', studiepoeng: 7.5, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BI3071-1'],
              years: [
                { year: 2021, A: 4, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.33, strykprosent: 0, bestattprosent: null, skjult: 5 },
                { year: 2022, A: 5, B: 8, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2023, A: 5, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.45, strykprosent: 0, bestattprosent: null, skjult: 5 },
                { year: 2024, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 5 },
                { year: 2025, A: 0, B: 5, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 3 },
              ],
            },
            {
              emnekode: 'BI3072', emnenavn: 'Environmental Toxicology', studiepoeng: 7.5, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BI3072-1'],
              years: [
                { year: 2021, A: 4, B: 4, C: 4, D: 4, E: 3, F: 0, G: 0, H: 0, total: 19, snitt: 3.11, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2022, A: 3, B: 4, C: 10, D: 5, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.23, strykprosent: 0, bestattprosent: null, skjult: 5 },
                { year: 2023, A: 3, B: 4, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 5 },
                { year: 2024, A: 3, B: 8, C: 0, D: 3, E: 0, F: 4, G: 0, H: 0, total: 18, snitt: 2.94, strykprosent: 22.2, bestattprosent: null, skjult: 5 },
                { year: 2025, A: 5, B: 8, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.82, strykprosent: 0, bestattprosent: null, skjult: 5 },
              ],
            },
            {
              emnekode: 'BIENV3900', emnenavn: 'Master Thesis in Environmental Toxicology and Chemistry', studiepoeng: 60, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIENV3900-1'], merknad: 'Går over alle fire semestre (del 1-4 av 4), 60 sp totalt - starter allerede i 1. år høst.',
              years: [
                { year: 2021, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
                { year: 2023, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2024, A: 3, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2025, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              ],
            },
            {
              emnekode: 'BI3075', emnenavn: 'Experimental Ecotoxicology', studiepoeng: 7.5, aar: 2, semester: 'høst',
              dbhEmnekoder: ['BI3075-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2022, A: 3, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.43, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2023, A: 5, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.45, strykprosent: 0, bestattprosent: null, skjult: 0 },
                { year: 2024, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
              ],
            },
          ] },
        ],
      },
      {
        entryId: 'ntnu_industriell_okologi2', shortName: 'NTNU Industriell økologi', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Industrial Ecology (master 2 år)',
        studieplanAar: '2025/2026', kilder: ['https://www.ntnu.no/studier/msindecol', 'https://www.ntnu.no/studier/studieplan#programmeCode=MSINDECOL&year=0', 'https://www.ntnu.no/web/studier/studieplan?p_p_id=studyprogrammeplannerportlet_WAR_studyprogrammeplannerportlet_INSTANCE_KzJMPh2hQuXL&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=studyplan&p_p_cacheability=cacheLevelPage&code=MSINDECOL&year=2025'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 30,
        merknad: 'Kilde er NTNUs studieplan-API (studyprogrammeplannerportlet, resource_id=studyplan) for MSINDECOL, lest for kull 2025 (fullstendig 4-periodig/2-årig plan, oppdatert 12.05.2026); kull 2026 har foreløpig kun 1. år publisert. Programmet har ingen studieretninger, men studentens valg av emner i 2. år styrer hvilken av tre likeverdige, avdelingsspesifikke emnekoder som brukes for prosjektoppgaven og masteroppgaven. I 3. semester (2. år høst) er et prosjektemne på 15 sp obligatorisk, men koden varier etter fakultet (POL3520, TEP5100 eller TIØ5235 - alle «Industrial Ecology Project», gjensidig utelukkende). I 4. semester (2. år vår) er masteroppgaven på 30 sp obligatorisk, med tilsvarende fakultetsspesifikk kode (POL3920, TEP4930 eller TIØ4955). Ifølge emnegruppebeskrivelsen er også enkelte 2.-semesteremner betinget obligatoriske avhengig av hvilken masteroppgave-kode man sikter mot: minst to av TEP4220/TEP4222/TEP4290 kreves ved TEP4930-oppgave, TIØ4195 kreves ved TIØ4955-oppgave, og POL1003 + POL3004 kreves ved POL3920-oppgave. Disse er ikke ført opp som faste enkeltemner siden de avhenger av studentens valg av oppgavespor. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'TEP4221', emnenavn: 'Python for Sustainability Analysis', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['TEP4221-1'], merknad: 'Byttet navn til «Python for Industrial Ecology» fra og med kullet 2026.',
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 47, H: 3, total: 50, snitt: null, strykprosent: null, bestattprosent: 94, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 36, H: 0, total: 36, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 41, H: 0, total: 41, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'TEP4223', emnenavn: 'Life Cycle Assessment', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['TEP4223-1'],
            years: [
              { year: 2021, A: 5, B: 28, C: 30, D: 10, E: 0, F: 3, G: 0, H: 0, total: 76, snitt: 3.25, strykprosent: 3.9, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 18, B: 30, C: 14, D: 8, E: 6, F: 5, G: 0, H: 0, total: 81, snitt: 3.38, strykprosent: 6.2, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 10, B: 24, C: 18, D: 12, E: 9, F: 4, G: 0, H: 0, total: 77, snitt: 3.03, strykprosent: 5.2, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 5, B: 15, C: 15, D: 7, E: 4, F: 0, G: 0, H: 0, total: 46, snitt: 3.22, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 5, B: 28, C: 14, D: 12, E: 0, F: 0, G: 0, H: 0, total: 59, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'TEP4285', emnenavn: 'Material Flow Analysis (MFA1)', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['TEP4285-1'],
            years: [
              { year: 2021, A: 4, B: 13, C: 18, D: 0, E: 4, F: 0, G: 0, H: 0, total: 39, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 4, B: 5, C: 9, D: 7, E: 0, F: 4, G: 0, H: 0, total: 29, snitt: 2.79, strykprosent: 13.8, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 3, B: 8, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.7, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 6, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.46, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 4, B: 5, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.76, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'TEP4300', emnenavn: 'Climate Change Mitigation', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['TEP4300-1'],
            years: [
              { year: 2021, A: 5, B: 21, C: 31, D: 14, E: 5, F: 4, G: 0, H: 0, total: 80, snitt: 2.94, strykprosent: 5, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 4, B: 6, C: 8, D: 14, E: 7, F: 8, G: 0, H: 0, total: 47, snitt: 2.19, strykprosent: 17, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 7, B: 15, C: 29, D: 19, E: 15, F: 4, G: 0, H: 0, total: 89, snitt: 2.64, strykprosent: 4.5, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 6, B: 16, C: 23, D: 21, E: 11, F: 0, G: 0, H: 0, total: 77, snitt: 2.81, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 8, B: 15, C: 29, D: 12, E: 4, F: 0, G: 0, H: 0, total: 68, snitt: 3.16, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uio_geofag2', shortName: 'UiO Geofag', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Geofag (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.uio.no/studier/program/geofag-master/', 'https://www.uio.no/studier/program/geofag-master/oppbygging/', 'https://www.uio.no/studier/program/geofag-master/studieretninger/anvendt-bassenganalyse/oppbygging/', 'https://www.uio.no/studier/program/geofag-master/studieretninger/jordens-strukturer-og-planetere-prosesser/oppbygging/', 'https://www.uio.no/studier/program/geofag-master/studieretninger/miljogeofag-geofarer-geomatikk/oppbygging/', 'https://www.uio.no/studier/program/geofag-master/studieretninger/vann-og-klima/oppbygging/'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 60,
        merknad: 'Kilde er programmets «Oppbygging og gjennomføring»-sider på uio.no (evigrønne sider uten årstall-kull). Programmet har 4 studieretninger; for studenter med geofaglig bakgrunn kreves 20-50 sp obligatoriske emner (avhengig av retning) pluss masteroppgave (60 sp); studenter uten geofaglig bakgrunn må ta 40 sp obligatoriske emner. I tre av de fire studieretningene finnes ingen enkelt fast obligatorisk emnekode - i stedet må studenten velge minst 20 sp (40 sp uten geofaglig bakgrunn) fra en liste med retningsspesifikke emner, som er et obligatorisk kvantum snarere enn faste enkeltemner og derfor ikke ført opp i obligatoriske-listen: «Anvendt bassenganalyse» velger blant GEO4014, GEO4240, GEO4216, GEO4250, GEO4260, GEO4850 (10 sp hver); «Jordens strukturer og planetære prosesser» velger blant GEO4120, GEO4151, GEO4131, GEO4620, GEO4140, GEO4840, GEO-AST4410, GEO5900, GEO4630, GEO4810, GEO4812, GEO4822 (10 sp hver); «Miljøgeofag, geofarer og geomatikk» velger blant GEO4034, GEO4151, GEO4100, GEO4171, GEO4120, GEO4360 (5 sp), GEO4131, GEO4432, GEO4140, GEO4460, GEO4161, GEO4530, GEO4190, GEO5900, GEO4410, GEO4420, GEO4515, GEO4520 (10 sp hver ellers). Studieretningen «Vann og klima» har ett fast obligatorisk emne (GEO4990, 10 sp) pluss et kvantumskrav om minst 10 sp til (30 sp uten geofaglig bakgrunn) fra en liste med emner innen hydrologi, glasiologi, meteorologi og oseanografi. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'HMS0501', emnenavn: 'Sikkerhet og fysisk miljø', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0501-1'], merknad: 'Felles for alle fire studieretninger. Gir ingen studiepoeng.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 42, H: 0, total: 42, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'HMS0502', emnenavn: 'Utviklende læringsmiljø', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0502-1'], merknad: 'Felles for alle fire studieretninger. Gir ingen studiepoeng.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 30, H: 0, total: 30, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 39, H: 0, total: 39, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'HMS0503', emnenavn: 'Laboratoriesikkerhet', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0503-1'], merknad: 'Felles for alle fire studieretninger. Gir ingen studiepoeng.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 30, H: 0, total: 30, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 33, H: 0, total: 33, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 36, H: 0, total: 36, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'HMS0504', emnenavn: 'Feltsikkerhet', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0504-1'], merknad: 'Felles for alle fire studieretninger. Gir ingen studiepoeng.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 0, total: 29, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 38, H: 0, total: 38, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'MASTEROPPGAVE', emnenavn: 'Masteroppgave', studiepoeng: 60, aar: 2, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Studieplanen oppgir ingen felles emnekode for oppgaven (den varierer trolig med veileder/tema); «MASTEROPPGAVE» gjengir betegnelsen fra studieplanteksten. Arbeidet starter fra 2. eller 3. semester (dvs. 1. år vår eller 2. år høst) og avsluttes i 4. semester (2. år vår); 2. år høst er brukt som representativ plassering. Felles for alle fire studieretninger.',
            years: [],
          },
        ],
        spesialiseringer: [
          { navn: 'Anvendt bassenganalyse: prosesser, ressurser og livets utvikling', obligatoriske: [
          ] },
          { navn: 'Jordens strukturer og planetære prosesser', obligatoriske: [
          ] },
          { navn: 'Miljøgeofag, geofarer og geomatikk', obligatoriske: [
          ] },
          { navn: 'Vann og klima', obligatoriske: [
            {
              emnekode: 'GEO4990', emnenavn: 'The Earth System', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['GEO4990-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
                { year: 2022, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2023, A: 0, B: 5, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2024, A: 0, B: 9, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2025, A: 0, B: 4, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 3 },
              ],
            },
          ] },
        ],
      },
      {
        entryId: 'uib_geovitenskap2', shortName: 'UiB Geovitskap', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Geovitskap (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.uib.no/studieprogram/MAMN-GEOV', 'https://www4.uib.no/studier/MAMN-GEOV', 'https://www4.uib.no/studier/program/geovitskap-master/plan'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 60,
        merknad: 'Programmet har ingen formelle studieretningar. Studieplanteksten er eksplisitt: «Studieprogrammet har ikkje obligatoriske emne» - i staden består programmet av ein pensumdel (60 sp, frie 200- og 300-nivå emne valt ut frå kva masteroppgåve studenten vel og fagleg bakgrunn, sett opp saman med rettleiar) og ein dokumentasjonsdel/masteroppgåve (60 sp). Studentar knyter seg til éi av fire uformelle forskingsgrupper ved Institutt for geovitskap under arbeidet med masteroppgåva (Kvartærgeologi og paleoklima, Geokjemi og geobiologi, Geodynamikk og bassengstudium, Geofysikk), men dette er ikkje studieretningar med eigne obligatoriske emnelister. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'MASTEROPPGAVE', emnenavn: 'Masteroppgåve', studiepoeng: 60, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Studieplanen oppgir eksplisitt at programmet «ikkje har obligatoriske emne» og gir ingen offisiell emnekode for oppgåva; «MASTEROPPGAVE» gjengir betegnelsen frå studieplanteksten (dokumentasjonsdelen). Oppgåva/rettleiingsforholdet blir sett opp i ein milepælsplan tidleg i studiet og strekker seg gjennom heile studieløpet parallelt med pensumdelen.',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'fornybar2', label: 'Fornybar energi (2-årig master)', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_fornybar2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Fornybar energi (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/fornybar-energi', 'https://static02.nmbu.no/mina/studier/M-FORNY.php?sprx=n&aarx=2026'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 75,
        merknad: 'Kilde er MINA-fakultetets studieplan-verktøy for kullet med studiestart høsten 2026. Utover de seks emnene over (75 sp) stiller programmet to obligatoriske krav som ikke er ført opp som enkeltemner: (1) alle må velge ett metodeemne mellom MINA310 Naturvitenskapelig metode (5 sp, vår) og MINA311 Samfunnsvitenskapelig forskningsmetode (10 sp, vår); (2) studenter som ikke tidligere har bestått FORNY200 Fornybare energikilder og -teknologier (10 sp), FORNY210 Bioenergi - teknologi og verdikjeder (5 sp) og MINA250 Tverrfaglig konsekvensanalyse (10 sp) eller tilsvarende, må ta disse i tillegg. Programmet oppgir også to anbefalte (ikke obligatoriske) eksempelplaner: Miljøanalyser og Energisystemanalyse. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'FORNY300', emnenavn: 'Vind- og vannkraft – ressurs, teknologi og energi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['FORNY300-1'], merknad: 'Går over Høstparallell og Augustblokk samme semester.',
            years: [
              { year: 2022, A: 5, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.33, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 5, B: 16, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4.04, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 3, B: 9, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.88, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'MINA320', emnenavn: 'Tverrfaglig samarbeid og kontroverser om bærekraft', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MINA320-1'], merknad: 'MINA321 (engelsk versjon av samme emne) kan tas i Januarblokk i stedet.',
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'MINA330', emnenavn: 'Prosjektøkonomi for fornybar energi og skogbruk', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MINA330-1'],
            years: [
              { year: 2022, A: 4, B: 5, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.68, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 3, B: 11, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 8, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.73, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 6, B: 3, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.88, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'BUS230', emnenavn: 'Operasjonsanalyse', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BUS230-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 3 },
              { year: 2022, A: 0, B: 0, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.56, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 3, C: 8, D: 4, E: 3, F: 0, G: 0, H: 0, total: 18, snitt: 2.61, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 3, C: 12, D: 4, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 2.95, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 3, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 8 },
            ],
          },
          {
            emnekode: 'FORNY360', emnenavn: 'Analyser av fornybare energisystemer', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['FORNY360-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 2.62, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 3, B: 6, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 8, C: 9, D: 9, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 2.96, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 3, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 2.86, strykprosent: 0, bestattprosent: null, skjult: 8 },
            ],
          },
          {
            emnekode: 'M30-FORNY', emnenavn: 'Masteroppgave', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: ['M30-FORNY-1'],
            years: [
              { year: 2021, A: 4, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.08, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 7, B: 11, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.39, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 12, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 4, B: 5, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.65, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 3, B: 11, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.85, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uio_fornybare_energisystemer2', shortName: 'UiO', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Fornybare energisystemer (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.uio.no/studier/program/fornybar-energi-master/', 'https://www.uio.no/studier/program/fornybar-energi-master/oppbygging/'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 100,
        merknad: 'Kilde er programmets «Oppbygging og gjennomføring»-side på uio.no. Programmet har ingen studieretninger. Utover de fire faste breddeemnene og prosjektemnet (40 sp) og masteroppgaven (60 sp standard) skal studenten velge 20 sp (30 sp ved kort oppgave) fordypningsemner fra en liste (TEK4000, TEK4090, TEK5330, TEK5340, TEK5390, TEK5530, TEK5410, TEK5420, TEK5430, TEK5440, TEK5450, TEK5600 m.fl., i samråd med veileder) - fri valgfrihet, ikke ført opp som enkeltemner. obligatoriskeStudiepoeng (100) forutsetter standardvalget med lang (60 sp) masteroppgave; ved kort oppgave (30 sp) blir obligatorisk sum 70 sp. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'TEK5300', emnenavn: 'Renewable Energy: Science and Technology', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['TEK5300-1'],
            years: [
              { year: 2021, A: 0, B: 6, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 3, B: 6, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 4, B: 5, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.08, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 3, C: 0, D: 3, E: 7, F: 3, G: 0, H: 0, total: 16, snitt: 1.56, strykprosent: 18.8, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 6, C: 4, D: 4, E: 3, F: 0, G: 0, H: 0, total: 17, snitt: 2.76, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'TEK5350', emnenavn: 'Energy Markets and Regulation', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['TEK5350-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 5, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 3, C: 5, D: 5, E: 3, F: 0, G: 0, H: 0, total: 16, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 5, B: 8, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.12, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 5, B: 3, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.08, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'TEK5370', emnenavn: 'Grid, Smartgrid and IoT', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['TEK5370-1'],
            years: [
              { year: 2021, A: 4, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 5, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.14, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 5, B: 3, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.71, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 6, B: 4, C: 3, D: 6, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 4, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'TEK5380', emnenavn: 'Prosjekt innen fornybar energi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['TEK5380-1'],
            years: [
              { year: 2021, A: 4, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.1, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 4, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.33, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 4, B: 3, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.47, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 5, B: 3, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.81, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 5, B: 8, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.06, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MASTEROPPGAVE', emnenavn: 'Masteroppgave', studiepoeng: 60, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Standardvalget er en lang oppgave på 60 sp; en kort oppgave på 30 sp kan velges i stedet (anbefalt ved utveksling), noe som frigjør 30 sp til fordypnings-/frie emner. Studieplanen oppgir ingen offisiell emnekode; «MASTEROPPGAVE» gjengir betegnelsen fra studieplanteksten. For lang oppgave starter arbeidet allerede i 1. år vår (2. semester) og går gjennom 2. år (3. og 4. semester).',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uia_fornybar2', shortName: 'UiA', institusjon: 'Universitetet i Agder', isNmbu: false, programnavn: 'Fornybar energi, sivilingeniør (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.uia.no/studier/program/fornybar-energi-master-2-ar/', 'https://www.uia.no/studier/program/fornybar-energi-master-2-ar/studieplaner/', 'https://www.uia.no/studier/program/fornybar-energi-master-2-ar/studieplaner/2026h.html'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 52.5,
        merknad: 'Kilde er UiAs studiemodell-verktøy for kullet med studiestart høst 2026 (campus Grimstad, engelskspråklig). Programmet tilbys både heltid og deltid; kun heltidsvariantene er lagt til grunn her, og deltidsvarianten («Part time study - Renewable energy») er utelatt. Programmet har tre heltids studieretninger: «Renewable energy: General specialization» (kalt «Fornybare energikilder» på programkartet), «Offshore Wind» (Havvind) og «Battery Technology» (Batteriteknologi). dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'ORG001', emnenavn: 'Health, Safety and Environment', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ORG001-1'], merknad: 'Felles for alle tre studieretninger (heltid). Gir ingen studiepoeng.',
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 9, total: 22, snitt: null, strykprosent: null, bestattprosent: 59.1, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 4, H: 0, total: 4, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 9, H: 0, total: 9, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'ENE505', emnenavn: 'Power Electronics for Renewable Energy', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Felles for alle tre studieretninger (heltid).',
            years: [],
          },
          {
            emnekode: 'ENE418', emnenavn: 'Data Analysis and Modelling Techniques in Renewable Energy', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Felles for alle tre studieretninger (heltid).',
            years: [],
          },
          {
            emnekode: 'ENE506', emnenavn: 'Smartgrid Systems', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Felles for alle tre studieretninger (heltid).',
            years: [],
          },
          {
            emnekode: 'ENE500', emnenavn: 'Master\'s Thesis Renewable Energy', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Felles for alle tre studieretninger (heltid).',
            years: [],
          },
        ],
        spesialiseringer: [
          { navn: 'Fornybare energikilder (General specialization)', obligatoriske: [
            {
              emnekode: 'MAS416', emnenavn: 'Modelling and Simulation of Mechatronic Systems', studiepoeng: 7.5, aar: 1, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'ENE411', emnenavn: 'Power Systems Dynamics', studiepoeng: 7.5, aar: 1, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MAS409', emnenavn: 'Electric Motor Drives', studiepoeng: 7.5, aar: 1, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'ENE503', emnenavn: 'Energy Research Project 1', studiepoeng: 7.5, aar: 2, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
          ] },
          { navn: 'Havvind', obligatoriske: [
            {
              emnekode: 'ENE416', emnenavn: 'Wind Energy', studiepoeng: 7.5, aar: 1, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MAS416', emnenavn: 'Modelling and Simulation of Mechatronic Systems', studiepoeng: 7.5, aar: 1, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'ENE411', emnenavn: 'Power Systems Dynamics', studiepoeng: 7.5, aar: 1, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MAS409', emnenavn: 'Electric Motor Drives', studiepoeng: 7.5, aar: 1, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'BYG404', emnenavn: 'Life-cycle assessment and optimization of constructions', studiepoeng: 7.5, aar: 2, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'ENE504', emnenavn: 'Energy Research Project 2', studiepoeng: 15, aar: 2, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
          ] },
          { navn: 'Batteriteknologi', obligatoriske: [
            {
              emnekode: 'ENE423', emnenavn: 'Battery systems', studiepoeng: 7.5, aar: 1, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'ENE421', emnenavn: 'Simulation of batteries', studiepoeng: 7.5, aar: 1, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'ENE422', emnenavn: 'Battery Electrochemistry', studiepoeng: 7.5, aar: 1, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'ENE504', emnenavn: 'Energy Research Project 2', studiepoeng: 15, aar: 2, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'ENE507', emnenavn: 'Battery simulation lab', studiepoeng: 7.5, aar: 2, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
          ] },
        ],
      },
      {
        entryId: 'ntnu_baerekraftig_energi2', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Bærekraftig energi (master 2 år)',
        studieplanAar: '2025/2026', kilder: ['https://www.ntnu.no/studier/msse', 'https://www.ntnu.no/studier/studieplan#programmeCode=MSSE&year=0', 'https://www.ntnu.no/web/studier/studieplan?p_p_id=studyprogrammeplannerportlet_WAR_studyprogrammeplannerportlet_INSTANCE_KzJMPh2hQuXL&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=studyplan&p_p_cacheability=cacheLevelPage&code=MSSE&year=2025'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 7.5,
        merknad: 'Kilde er NTNUs studieplan-API (studyprogrammeplannerportlet, resource_id=studyplan) for MSSE, lest for kull 2025 (fullstendig 4-periodig/2-årig plan, oppdatert 12.05.2026); kull 2026 har foreløpig kun 1. år publisert. Programmet har tre studieretninger (Gas Technology, Sustainable Heat Pumping Processes and Systems, Sustainable Energy Use in Buildings). Kun TEP4240 System Simulation er felles obligatorisk for alle tre retninger; øvrige emner, inkl. masteroppgaven, har retningsspesifikke koder og er derfor ført opp under hver studieretning (Gas Technology og Sustainable Heat Pumping Processes and Systems deler for øvrig samme emnekoder for spesialiseringsemner og masteroppgave, TEP4506/TEP4521/TEP4906, mens Sustainable Energy Use in Buildings har egne koder TEP4530/TEP4535/TEP4910 for tilsvarende emner). I tillegg stiller hver studieretning kvantumskrav om et gitt antall emner fra egne emnegrupper (typisk «minst 2 emner fra gruppe A» i 1. år høst, «minst 2 fra gruppe B» i 1. år vår, «minst 1 fra gruppe A/B» i 2. år høst) - disse er valgfrie innenfor kvoten og derfor ikke ført opp som enkeltemner. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'TEP4240', emnenavn: 'System Simulation', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['TEP4240-1'], merknad: 'Felles for alle tre studieretninger.',
            years: [
              { year: 2021, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 8, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Gas Technology', obligatoriske: [
            {
              emnekode: 'TEP4185', emnenavn: 'Gas Process Technology', studiepoeng: 7.5, aar: 1, semester: 'høst',
              dbhEmnekoder: ['TEP4185-1'],
              years: [
                { year: 2021, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2022, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
              ],
            },
            {
              emnekode: 'TEP4215', emnenavn: 'Energy Efficiency and Process Integration', studiepoeng: 7.5, aar: 1, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'TEP4506', emnenavn: 'Sustainable Energy Systems, Specialization Course', studiepoeng: 7.5, aar: 2, semester: 'høst',
              dbhEmnekoder: ['TEP4506-1'],
              years: [
                { year: 2022, A: 3, B: 5, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.79, strykprosent: 0, bestattprosent: null, skjult: 0 },
                { year: 2023, A: 4, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2024, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 0 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              ],
            },
            {
              emnekode: 'TEP4521', emnenavn: 'Sustainable Energy Systems, Specialization Project', studiepoeng: 15, aar: 2, semester: 'høst',
              dbhEmnekoder: ['TEP4521-1'],
              years: [
                { year: 2022, A: 6, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.6, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2023, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2024, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              ],
            },
            {
              emnekode: 'TEP4906', emnenavn: 'Sustainable energy systems, master thesis', studiepoeng: 30, aar: 2, semester: 'vår',
              dbhEmnekoder: ['TEP4906-1'],
              years: [
                { year: 2023, A: 4, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 6 },
                { year: 2024, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
              ],
            },
          ] },
          { navn: 'Sustainable Heat Pumping Processes and Systems', obligatoriske: [
            {
              emnekode: 'TEP4185', emnenavn: 'Gas Process Technology', studiepoeng: 7.5, aar: 1, semester: 'høst',
              dbhEmnekoder: ['TEP4185-1'],
              years: [
                { year: 2021, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2022, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
              ],
            },
            {
              emnekode: 'TEP4255', emnenavn: 'Heat Pumping Processes and Systems', studiepoeng: 7.5, aar: 1, semester: 'vår',
              dbhEmnekoder: ['TEP4255-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
                { year: 2022, A: 4, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.57, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2023, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
              ],
            },
            {
              emnekode: 'TEP4506', emnenavn: 'Sustainable Energy Systems, Specialization Course', studiepoeng: 7.5, aar: 2, semester: 'høst',
              dbhEmnekoder: ['TEP4506-1'],
              years: [
                { year: 2022, A: 3, B: 5, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.79, strykprosent: 0, bestattprosent: null, skjult: 0 },
                { year: 2023, A: 4, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2024, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 0 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              ],
            },
            {
              emnekode: 'TEP4521', emnenavn: 'Sustainable Energy Systems, Specialization Project', studiepoeng: 15, aar: 2, semester: 'høst',
              dbhEmnekoder: ['TEP4521-1'],
              years: [
                { year: 2022, A: 6, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.6, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2023, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2024, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              ],
            },
            {
              emnekode: 'TEP4906', emnenavn: 'Sustainable energy systems, master thesis', studiepoeng: 30, aar: 2, semester: 'vår',
              dbhEmnekoder: ['TEP4906-1'],
              years: [
                { year: 2023, A: 4, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 6 },
                { year: 2024, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
              ],
            },
          ] },
          { navn: 'Sustainable Energy Use in Buildings', obligatoriske: [
            {
              emnekode: 'TEP4235', emnenavn: 'Energy Management in Buildings', studiepoeng: 7.5, aar: 1, semester: 'høst',
              dbhEmnekoder: ['TEP4235-1'],
              years: [
                { year: 2021, A: 0, B: 5, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.31, strykprosent: 0, bestattprosent: null, skjult: 1 },
                { year: 2022, A: 0, B: 0, C: 3, D: 0, E: 3, F: 0, G: 0, H: 0, total: 6, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              ],
            },
            {
              emnekode: 'TEP4245', emnenavn: 'HVAC Engineering', studiepoeng: 7.5, aar: 1, semester: 'vår',
              dbhEmnekoder: ['TEP4245-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 3, H: 0, total: 3, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
                { year: 2022, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
                { year: 2023, A: 0, B: 0, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              ],
            },
            {
              emnekode: 'TEP4260', emnenavn: 'Heat Pumps for Heating and Cooling of Buildings', studiepoeng: 7.5, aar: 1, semester: 'vår',
              dbhEmnekoder: ['TEP4260-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
                { year: 2022, A: 0, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 4 },
                { year: 2023, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              ],
            },
            {
              emnekode: 'TEP4530', emnenavn: 'Energy and Indoor Environment, Specialization Project', studiepoeng: 15, aar: 2, semester: 'høst',
              dbhEmnekoder: ['TEP4530-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
                { year: 2022, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2023, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              ],
            },
            {
              emnekode: 'TEP4535', emnenavn: 'Thermal Energy and Indoor Environment, Specialization Course', studiepoeng: 7.5, aar: 2, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'TEP4910', emnenavn: 'Energy and Indoor Environment, Master\'s Thesis', studiepoeng: 30, aar: 2, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
          ] },
        ],
      },
      {
        entryId: 'hvl_energiteknologi2', shortName: 'HVL', institusjon: 'Høgskulen på Vestlandet', isNmbu: false, programnavn: 'Bærekraftig energiteknologi, sivilingeniør (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.hvl.no/studier/studieprogram/berekraftig-energiteknologi/', 'https://www.hvl.no/studier/studieprogram/berekraftig-energiteknologi/2026h/studieplan/', 'https://www.hvl.no/studier/studieprogram/berekraftig-energiteknologi/2026h/utdanningsplan/'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 80,
        merknad: 'Kilde er HVLs utdanningsplan-verktøy for kullet med studiestart høst 2026. Programmet har ingen studieretninger. Fellesemnene (40 sp) er obligatoriske for alle. Studenten velger mellom to veier for den individuelle oppgaven: 30 sp masteroppgave (MAS550 10 sp i 2. år høst + MAS595 30 sp i 2. år vår, standardveien - brukt her) eller 50 sp masteroppgave (MAS550 10 sp allerede i 1. år vår + MAS599 50 sp i 2. år høst). obligatoriskeStudiepoeng (80) gjelder standardveien; ved 50 sp-alternativet blir obligatorisk sum 100 sp. Utover dette velger studenten 20 sp valgemner i 2. semester og 20 sp i 3. semester (10+10 sp ved 50 sp-alternativet) fra to uformelle emnegrupper: energisystem/komponenter (MAS501, MAS532, MAS533, MAS534, MAS536, MAS538, MAS539) og havenergi (MAS532, MAS540, MAS541) - fri valgfrihet, ikke ført opp som enkeltemner. dbhEmnekoder er ikke fylt ut siden DBH-rapportering for dette programmet ikke er slått opp i dette arbeidet.',
        obligatoriske: [
          {
            emnekode: 'MAS502', emnenavn: 'Energy resources & conversion devices', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MAS502-1'],
            years: [
              { year: 2023, A: 0, B: 4, C: 5, D: 3, E: 3, F: 0, G: 0, H: 0, total: 15, snitt: 2.67, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 4, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.07, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MAS503', emnenavn: 'Innføring i berekraftsanalysar', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MAS503-1'],
            years: [
              { year: 2023, A: 5, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.36, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 6, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.6, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 4, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.27, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MAS504', emnenavn: 'Energiøkonomi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MAS504-1'],
            years: [
              { year: 2023, A: 5, B: 8, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 5, B: 7, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.06, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MOA256', emnenavn: 'Vitskapsteori og metodar', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MOA256-1'],
            years: [
              { year: 2023, A: 0, B: 7, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.21, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 2.75, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 7, D: 5, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 2.58, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MAS520', emnenavn: 'Design for Sustainable Energy Technology', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MAS520-1'],
            years: [
              { year: 2024, A: 0, B: 7, C: 0, D: 7, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 5, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.45, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'MAS550', emnenavn: 'Rettleia sjølvstudium', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MAS550-1'], merknad: 'Plassering gjelder standardveien med 30 sp masteroppgåve (semester 3). Ved valg av 50 sp masteroppgåve tas emnet i stedet i 1. år vår (semester 2).',
            years: [
              { year: 2024, A: 0, B: 12, C: 11, D: 3, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.35, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 4, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.24, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'MAS595', emnenavn: 'Masteroppgåve', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MAS595-1'], merknad: 'Standardvegen (30 sp, semester 4). Alternativet er MAS599 Masteroppgåve på 50 sp i semester 3 (2. år høst), da med MAS550 flyttet til 1. år vår - se merknad på MAS550. Med 50 sp-alternativet reduseres antall sp valgemner tilsvarende.',
            years: [
              { year: 2025, A: 4, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
];
