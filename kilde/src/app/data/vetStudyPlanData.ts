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
    id: 'veterinaer', label: 'Veterinærmedisin', level: 'master5',
    programs: [
      {
        entryId: 'nmbu_veterinaermedisin', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Veterinærmedisin (profesjonsstudium)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/veterinaermedisin-profesjonsstudium', 'https://www.nmbu.no/sites/default/files/2026-08/Studieplan%20av%202021%20VET%20h26v27%20vedtat%20UU%20%2822.05.26%29%20%282%29.docx'],
        totaltStudiepoeng: 330, obligatoriskeStudiepoeng: 321,
        merknad: 'Kilde er NMBUs «Studieplan av 2021 for veterinærstudiet», vedtatt UU-vet 22.5.2026 (.docx, konvertert til tekst for uthenting), lastet ned fra programsiden nmbu.no/studier/veterinaermedisin-profesjonsstudium. Studiet er et sammenhengende 11-semesters (5½–6 år, 330 sp) profesjonsstudium der samme emne ofte strekker seg over to semestre; slike emner er ført på det semesteret de starter, med sp-fordelingen forklart i merknad, for å unngå dobbelttelling i totalsummen. To lange «tråder» (VET352 Profesjonslære og VET353 Dyrevelferd) løper gjennom hele studiet med egen delkode per år. DBH-karakterdataene (2021–2025) i denne kjeden dekker bare år 1–4 av 2021-planen fullt ut, pluss ett enkeltemne i år 5 (VET352-6, kjøttkontroll): kull 2021 er første kull under den nye planen og når først 5.–6. studieår i 2025/26–2026/27, så emnene VET366A–VET369B, VET-SLUTTEKSAMEN, VET-VALGFRI og VET352-7 har ingen karakterer i DBH ennå. DBH har i tillegg en helt annen serie eldre emnekoder (VET302–VET341) fra 2013-studieplanen, brukt av kull før 2021 – disse er utenfor denne studieplanens 2021-pensum og er derfor ikke koblet her. Studiepoengtallet «obligatoriskeStudiepoeng» (321) er summen av alle emner i listen unntatt «Valgfri del» (9 sp); studiet har ellers ingen formelle spesialiseringsretninger i gjeldende plan (2021-planen fjernet «differensiering»-valgene fra 2013-planen, som fortsatt finnes som gamle DBH-koder VET328–VET332).',
        obligatoriske: [
          {
            emnekode: 'VET350', emnenavn: 'Husdyrets grunnleggende behov og miljø', studiepoeng: 4, aar: 1, semester: 'høst',
            dbhEmnekoder: ['VET350-1'], merknad: '2,5 uker undervisning, inkludert 4 uker husdyrpraksis (se VET350B) og 1 morgenvakt på produksjonsdyrklinikken.',
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 85, H: 0, total: 85, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 91, H: 0, total: 91, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 100, H: 0, total: 100, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 81, H: 0, total: 81, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'VET350B', emnenavn: 'Husdyrpraksis', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['VET350B-1'], merknad: '4 uker, gir ikke egne studiepoeng – inngår i VET350.',
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 83, H: 7, total: 90, snitt: null, strykprosent: null, bestattprosent: 92.2, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 87, H: 0, total: 87, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 95, H: 0, total: 95, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 82, H: 0, total: 82, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'VET351', emnenavn: 'Virveldyrets oppbygging og funksjon', studiepoeng: 20, aar: 1, semester: 'høst',
            dbhEmnekoder: ['VET351-1'], merknad: '13,5 uker.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 81, H: 7, total: 88, snitt: null, strykprosent: null, bestattprosent: 92, skjult: 0 },
              { year: 2022, A: 0, B: 8, C: 24, D: 26, E: 20, F: 10, G: 5, H: 0, total: 93, snitt: 2, strykprosent: 11.4, bestattprosent: 100, skjult: 2 },
              { year: 2023, A: 3, B: 21, C: 32, D: 27, E: 17, F: 10, G: 0, H: 0, total: 110, snitt: 2.42, strykprosent: 9.1, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 6, B: 27, C: 20, D: 17, E: 10, F: 6, G: 0, H: 0, total: 86, snitt: 2.81, strykprosent: 7, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 4, B: 28, C: 26, D: 15, E: 10, F: 14, G: 0, H: 0, total: 97, snitt: 2.58, strykprosent: 14.4, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'VET352A', emnenavn: 'Profesjonslære A', studiepoeng: 3, aar: 1, semester: 'høst',
            dbhEmnekoder: ['VET352-1-1'], merknad: 'Profesjonslæretråden går gjennom hele studiet (VET352A i år 1–2, VET352 i år 3–6). År 1: 2 uker/3 sp totalt, fordelt med 1 uke i høstsemesteret og 1 uke i vårsemesteret (samme oppføring i begge semestre i kildedokumentet, ført her kun i høst for å unngå dobbelttelling).',
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 85, H: 0, total: 85, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 92, H: 0, total: 92, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 99, H: 0, total: 99, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 82, H: 0, total: 82, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'VET353A', emnenavn: 'Dyrevelferd A', studiepoeng: 3, aar: 1, semester: 'høst',
            dbhEmnekoder: ['VET353-1-1'], merknad: 'Dyrevelferdstråden går gjennom hele studiet. År 1: 2 uker/3 sp totalt, fordelt med 1 uke i høstsemesteret og 1 uke i vårsemesteret (ført her kun i høst for å unngå dobbelttelling).',
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 87, H: 0, total: 87, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 92, H: 0, total: 92, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 98, H: 0, total: 98, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 82, H: 0, total: 82, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'VET354A', emnenavn: 'Organsystemer 1', studiepoeng: 21, aar: 1, semester: 'vår',
            dbhEmnekoder: ['VET354A-1'], merknad: '14 uker. Dekker bevegelsesapparat, sirkulasjon, respirasjon, urinorganer og fordøyelsesapparat.',
            years: [
              { year: 2023, A: 4, B: 17, C: 30, D: 24, E: 15, F: 0, G: 0, H: 0, total: 90, snitt: 2.68, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 4, B: 11, C: 28, D: 30, E: 18, F: 15, G: 0, H: 0, total: 106, snitt: 2.13, strykprosent: 14.2, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 4, B: 13, C: 17, D: 24, E: 18, F: 14, G: 0, H: 0, total: 90, snitt: 2.1, strykprosent: 15.6, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'VET354B', emnenavn: 'Ernæring og metabolisme', studiepoeng: 9, aar: 1, semester: 'vår',
            dbhEmnekoder: ['VET354B-1'], merknad: '6 uker.',
            years: [
              { year: 2023, A: 10, B: 12, C: 21, D: 27, E: 18, F: 8, G: 0, H: 0, total: 96, snitt: 2.43, strykprosent: 8.3, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 12, C: 31, D: 26, E: 24, F: 16, G: 0, H: 0, total: 109, snitt: 1.99, strykprosent: 14.7, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 5, B: 17, C: 18, D: 24, E: 14, F: 10, G: 0, H: 0, total: 88, snitt: 2.38, strykprosent: 11.4, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'VET353A-2', emnenavn: 'Dyrevelferd 2. året', studiepoeng: 3, aar: 2, semester: 'høst',
            dbhEmnekoder: ['VET353A-2-1', 'VET353-2-2', 'VET353-2-1'], merknad: 'Økt fra 1 til 2 uker fra og med kull 2024 (3 sp); eldre kull har en kortere/billigere variant (VET353-2-1, 1,5 sp). Kildedokumentet skriver koden inkonsekvent som «Vet352A-2» ett sted.',
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 86, H: 0, total: 86, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 84, H: 0, total: 84, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 93, H: 0, total: 93, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 76, H: 0, total: 76, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'VET355', emnenavn: 'Organsystemer 2', studiepoeng: 16.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['VET355-1'], merknad: '11 uker. Dekker nervesystem/endokrinologi, reproduksjon/obstetrikk og hud/blod/immunsystem.',
            years: [
              { year: 2022, A: 17, B: 23, C: 23, D: 10, E: 4, F: 3, G: 0, H: 0, total: 80, snitt: 3.38, strykprosent: 3.8, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 18, B: 24, C: 27, D: 12, E: 3, F: 3, G: 0, H: 0, total: 87, snitt: 3.38, strykprosent: 3.4, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 32, B: 27, C: 22, D: 8, E: 0, F: 3, G: 0, H: 0, total: 92, snitt: 3.8, strykprosent: 3.3, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 22, B: 22, C: 20, D: 7, E: 5, F: 0, G: 0, H: 0, total: 76, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'VET356', emnenavn: 'Grunnleggende sykdomslære', studiepoeng: 13.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['VET356-1'], merknad: '9 uker totalt: 5 uker i høstsemesteret, fortsetter med 4 uker i vårsemesteret (2. semester).',
            years: [
              { year: 2023, A: 12, B: 34, C: 19, D: 8, E: 8, F: 6, G: 0, H: 0, total: 87, snitt: 3.18, strykprosent: 6.9, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 7, B: 23, C: 25, D: 17, E: 11, F: 12, G: 0, H: 0, total: 95, snitt: 2.6, strykprosent: 12.6, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 8, B: 41, C: 21, D: 12, E: 11, F: 0, G: 0, H: 0, total: 93, snitt: 3.25, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'VET357', emnenavn: 'Veterinær mikrobiologi', studiepoeng: 16.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['VET357-1'], merknad: '11 uker.',
            years: [
              { year: 2023, A: 9, B: 31, C: 23, D: 14, E: 3, F: 10, G: 0, H: 0, total: 90, snitt: 2.99, strykprosent: 11.1, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 12, B: 23, C: 31, D: 17, E: 0, F: 15, G: 0, H: 0, total: 98, snitt: 2.85, strykprosent: 15.3, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 15, B: 26, C: 34, D: 12, E: 0, F: 29, G: 0, H: 0, total: 116, snitt: 2.63, strykprosent: 25, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'VET358', emnenavn: 'Farmakologi og toksikologi', studiepoeng: 10.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['VET358-1'], merknad: '7 uker.',
            years: [
              { year: 2023, A: 17, B: 31, C: 21, D: 12, E: 0, F: 3, G: 0, H: 0, total: 84, snitt: 3.52, strykprosent: 3.6, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 9, B: 34, C: 26, D: 13, E: 0, F: 6, G: 0, H: 0, total: 88, snitt: 3.24, strykprosent: 6.8, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 21, B: 36, C: 23, D: 9, E: 0, F: 5, G: 0, H: 0, total: 94, snitt: 3.57, strykprosent: 5.3, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'VET359', emnenavn: 'Sykdommer i organsystemer 1', studiepoeng: 24, aar: 3, semester: 'høst',
            dbhEmnekoder: ['VET359-1'], merknad: '16 uker. Onkologi og sykdommer i hud/blod/immunsystem, bevegelsesapparat og fordøyelsesapparat.',
            years: [
              { year: 2023, A: 0, B: 22, C: 33, D: 16, E: 3, F: 0, G: 0, H: 0, total: 74, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 9, C: 28, D: 26, E: 16, F: 5, G: 0, H: 0, total: 84, snitt: 2.24, strykprosent: 6, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 79, H: 12, total: 91, snitt: null, strykprosent: null, bestattprosent: 86.8, skjult: 4 },
            ],
          },
          {
            emnekode: 'VET353A-3', emnenavn: 'Dyrevelferd 3. året', studiepoeng: 1.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['VET353-3-2', 'VET353-3-1'], merknad: 'Fra og med studieåret 25/26 og kull 2023. Credittallet varierer noe mellom kull (1,5 sp for nyeste, 3 sp for eldre variant VET353-3-1).',
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 78, H: 0, total: 78, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 84, H: 0, total: 84, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 87, H: 0, total: 87, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'VET380-STAT', emnenavn: 'Statistikk og epidemiologi', studiepoeng: 5, aar: 3, semester: 'høst',
            dbhEmnekoder: [], merknad: '1 uke/1,5 sp i høstsemesteret, fortsetter med 2,5 uker/3,5 sp i vårsemesteret (samlet 5 sp). Fra og med studieåret 26/27 og kull 2024 – første gjennomføring, ingen karakterdata i DBH ennå. Koden VET380 er samme kode som brukes for litteraturstudie-delen i år 4; det er trolig én løpende «tråd»-kode for flere ulike profesjonslæreelementer.',
            years: [],
          },
          {
            emnekode: 'VET352A-3', emnenavn: 'Profesjonslære A (3. året)', studiepoeng: 2.5, aar: 3, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Fra og med 26/27 og kull 2024, redusert med 1,5 sp sammenlignet med tidligere kull – ingen karakterdata i DBH ennå for denne varianten.',
            years: [],
          },
          {
            emnekode: 'VET360', emnenavn: 'Sykdommer i organsystemer 2', studiepoeng: 27, aar: 3, semester: 'vår',
            dbhEmnekoder: ['VET360-1'], merknad: '18 uker. Sykdommer i sirkulasjon/respirasjon/urinorganer, nervesystem/endokrinologi, og obstetrikk/reproduksjon. Økt med 1,5 sp fra og med kull 2024 (DBH-tallet for VET360-1, 25,5 sp, gjelder eldre kull).',
            years: [
              { year: 2024, A: 9, B: 29, C: 26, D: 11, E: 0, F: 0, G: 0, H: 0, total: 75, snitt: 3.48, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 81, H: 8, total: 89, snitt: null, strykprosent: null, bestattprosent: 91, skjult: 0 },
            ],
          },
          {
            emnekode: 'VET361', emnenavn: 'Systemiske og alvorlig smittsomme sykdommer', studiepoeng: 7.5, aar: 4, semester: 'høst',
            dbhEmnekoder: ['VET361-1'], merknad: '5 uker.',
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 78, H: 0, total: 78, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 77, H: 0, total: 77, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'VET362', emnenavn: 'Besetningsmedisin og ernæring', studiepoeng: 15, aar: 4, semester: 'høst',
            dbhEmnekoder: ['VET362-1'], merknad: '10 uker.',
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 78, H: 4, total: 82, snitt: null, strykprosent: null, bestattprosent: 95.1, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 80, H: 3, total: 83, snitt: null, strykprosent: null, bestattprosent: 96.4, skjult: 0 },
            ],
          },
          {
            emnekode: 'VET380-LITT', emnenavn: 'Litteraturstudie', studiepoeng: 12, aar: 4, semester: 'høst',
            dbhEmnekoder: [], merknad: '1 uke/1,5 sp i høstsemesteret, fortsetter med 7 uker/10,5 sp i vårsemesteret (samlet 12 sp). Fra og med kull 2023 – bruker trolig samme DBH-kode VET380 som statistikk/epidemiologi-delen i år 3, ingen karakterdata i DBH ennå.',
            years: [],
          },
          {
            emnekode: 'VET364', emnenavn: 'Mattrygghet', studiepoeng: 10.5, aar: 4, semester: 'høst',
            dbhEmnekoder: ['VET364-1'], merknad: '2 uker/3 sp i høstsemesteret, fortsetter med 5 uker/7,5 sp i vårsemesteret (totalt 10,5 sp, matcher VET364-1 i DBH). Fra og med kull 2022.',
            years: [
              { year: 2025, A: 20, B: 28, C: 17, D: 9, E: 3, F: 0, G: 0, H: 0, total: 77, snitt: 3.69, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'VET363', emnenavn: 'Vilt og eksotiske dyr', studiepoeng: 2, aar: 4, semester: 'vår',
            dbhEmnekoder: ['VET363-1'], merknad: '1,5 uke.',
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 78, H: 0, total: 78, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'VET353-4', emnenavn: 'Dyrevelferd – forsøksdyrlære', studiepoeng: 1.5, aar: 4, semester: 'vår',
            dbhEmnekoder: ['VET353-4-1'], merknad: '1 uke. Gjaldt kull 2021 og kull 2022 i kildedokumentet – nyere kull kan ha emnet plassert annerledes eller under en annen kode.',
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 78, H: 0, total: 78, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'VET365', emnenavn: 'Innledende klinikk og diagnostikk', studiepoeng: 11.5, aar: 4, semester: 'vår',
            dbhEmnekoder: ['VET365-1'], merknad: '7,5 uker. DBH-tallet for VET365-1 er 10,5 sp; fra og med kull 2023 inkluderer emnet også klinisk kommunikasjon, som trolig forklarer økningen til 11,5 sp i gjeldende plan.',
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 78, H: 0, total: 78, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'VET366A', emnenavn: 'Smådyrmedisin 1', studiepoeng: 21, aar: 5, semester: 'høst',
            dbhEmnekoder: [], merknad: '14 uker (1 leseuke). Gjelder kull 2022, første kull i 5. studieår under 2021-planen nådde dette i 2026/27 – ingen karakterdata i DBH ennå (data i denne kjeden dekker 2021–2025).',
            years: [],
          },
          {
            emnekode: 'VET367A', emnenavn: 'Hestemedisin 1', studiepoeng: 9, aar: 5, semester: 'høst',
            dbhEmnekoder: [], merknad: '6 uker (1 leseuke). Ingen karakterdata i DBH ennå, se merknad på VET366A.',
            years: [],
          },
          {
            emnekode: 'VET368A', emnenavn: 'Produksjonsdyrmedisin og akvamedisin', studiepoeng: 22.5, aar: 5, semester: 'høst',
            dbhEmnekoder: [], merknad: '15 uker (1 leseuke). Ingen karakterdata i DBH ennå, se merknad på VET366A.',
            years: [],
          },
          {
            emnekode: 'VET369A', emnenavn: 'Patologi 1', studiepoeng: 6, aar: 5, semester: 'høst',
            dbhEmnekoder: [], merknad: '4 uker (1 leseuke). Ingen karakterdata i DBH ennå, se merknad på VET366A.',
            years: [],
          },
          {
            emnekode: 'VET352-6', emnenavn: 'Profesjonslære – kjøttkontroll', studiepoeng: 1.5, aar: 5, semester: 'høst',
            dbhEmnekoder: ['VET352-6-1'], merknad: '1 uke. Eneste 5.-årsemne med karakterdata i DBH per 2025 – de kliniske emnene (VET366A–VET369A) er nye under 2021-planen og har ikke fått karakterer ennå.',
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 72, H: 0, total: 72, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'VET-VALGFRI', emnenavn: 'Valgfri del', studiepoeng: 9, aar: 6, semester: 'høst',
            dbhEmnekoder: [], merknad: '6 uker. Valgfritt element i 6. studieår, ikke en enkelt DBH-emnekode – studenten velger selv innhold. Ingen karakterdata i DBH ennå.',
            years: [],
          },
          {
            emnekode: 'VET352-7', emnenavn: 'Profesjonslære – offentlig veterinærmedisin', studiepoeng: 6, aar: 6, semester: 'høst',
            dbhEmnekoder: [], merknad: '4 uker. Ingen karakterdata i DBH ennå.',
            years: [],
          },
          {
            emnekode: 'VET369B', emnenavn: 'Patologi 2', studiepoeng: 3, aar: 6, semester: 'vår',
            dbhEmnekoder: [], merknad: '2 uker. Del av det avsluttende kliniske blokk (sum 10 uker/15 sp sammen med VET366B–VET368B). Ingen karakterdata i DBH ennå.',
            years: [],
          },
          {
            emnekode: 'VET366B', emnenavn: 'Smådyrmedisin 2', studiepoeng: 4.5, aar: 6, semester: 'vår',
            dbhEmnekoder: [], merknad: '3 uker. Ingen karakterdata i DBH ennå.',
            years: [],
          },
          {
            emnekode: 'VET367B', emnenavn: 'Hestemedisin 2', studiepoeng: 3, aar: 6, semester: 'vår',
            dbhEmnekoder: [], merknad: '2 uker. Ingen karakterdata i DBH ennå.',
            years: [],
          },
          {
            emnekode: 'VET368B', emnenavn: 'Produksjonsdyrmedisin', studiepoeng: 4.5, aar: 6, semester: 'vår',
            dbhEmnekoder: [], merknad: '3 uker. Ingen karakterdata i DBH ennå.',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uio_medisin', shortName: 'UiO Medisin', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Medisin (profesjonsstudium)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uib_medisin', shortName: 'UiB Medisin', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Medisin (profesjonsstudium)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_medisin', shortName: 'NTNU Medisin', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Medisin (profesjonsstudium)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uit_medisin', shortName: 'UiT Medisin', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Medisin (profesjonsstudium)',
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
    id: 'dyrepleie', label: 'Dyrepleie', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_dyrepleie', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Dyrepleie (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/bachelor/dyrepleie', 'https://www.nmbu.no/sites/default/files/2026-06/Studieplan%20for%20dyrepleierstudiet%20h26v27.pdf'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 180,
        merknad: 'Kilde er NMBUs offisielle studieplandokument for dyrepleierstudiet, studieåret høst 2026/vår 2027 (vedtatt av Programrådet 5.3.2026 og UU-VET 22.5.2026), lastet ned fra programsiden nmbu.no/studier/bachelor/dyrepleie. Emnet VET327 Dyrevelferd (5 sp, karakterdata 2021–2023 i DBH) finnes i karakterdataene men er ikke lenger i gjeldende studieplan – det er trolig forgjengeren til DYR215 Dyrevelferd (5 sp, innført senere) eller DYR208. PHI100/PHI101 telles som étt obligatorisk element (alternative gjennomføringer av samme Ex.phil.-krav).',
        obligatoriske: [
          {
            emnekode: 'PHI100', emnenavn: 'Examen Philosophicum', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['PHI100-1', 'PHI101-1'], merknad: 'Arrangeres av NMBU Handelshøgskolen, valgfritt mellom vanlig undervisning (PHI100) og seminarversjon (PHI101); studenten melder seg opp selv i Studentweb.',
            years: [
              { year: 2021, A: 0, B: 0, C: 8, D: 8, E: 4, F: 0, G: 0, H: 0, total: 20, snitt: 2.2, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 0, C: 3, D: 5, E: 4, F: 9, G: 0, H: 0, total: 21, snitt: 1.1, strykprosent: 42.9, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 3, C: 5, D: 9, E: 0, F: 10, G: 0, H: 0, total: 27, snitt: 1.67, strykprosent: 37, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 9, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.28, strykprosent: 0, bestattprosent: null, skjult: 13 },
              { year: 2025, A: 0, B: 9, C: 8, D: 7, E: 4, F: 11, G: 0, H: 0, total: 39, snitt: 2, strykprosent: 28.2, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'DYR201', emnenavn: 'Atferd og stell', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['DYR201-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 5, total: 37, snitt: null, strykprosent: null, bestattprosent: 86.5, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 30, H: 8, total: 38, snitt: null, strykprosent: null, bestattprosent: 78.9, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 10, total: 36, snitt: null, strykprosent: null, bestattprosent: 72.2, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 31, H: 15, total: 46, snitt: null, strykprosent: null, bestattprosent: 67.4, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 41, H: 7, total: 48, snitt: null, strykprosent: null, bestattprosent: 85.4, skjult: 0 },
            ],
          },
          {
            emnekode: 'DYR202', emnenavn: 'Forsøksdyrlære', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['DYR202-1', 'DYR202-2'], merknad: '3 uker i 1. semester og 2 uker i 2. semester (vår).',
            years: [
              { year: 2021, A: 5, B: 3, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.87, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 4, B: 16, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.2, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 16, B: 17, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 45, snitt: 4.09, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 7, B: 12, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.79, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 3, B: 11, C: 11, D: 4, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.45, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'DYR203', emnenavn: 'Anatomi og fysiologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['DYR203-1'],
            years: [
              { year: 2021, A: 7, B: 6, C: 5, D: 4, E: 0, F: 3, G: 0, H: 0, total: 25, snitt: 3.28, strykprosent: 12, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 6, B: 5, C: 5, D: 6, E: 5, F: 7, G: 0, H: 0, total: 34, snitt: 2.41, strykprosent: 20.6, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 7, C: 7, D: 0, E: 0, F: 8, G: 0, H: 0, total: 22, snitt: 2.23, strykprosent: 36.4, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 11, B: 4, C: 7, D: 5, E: 0, F: 3, G: 0, H: 0, total: 30, snitt: 3.4, strykprosent: 10, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 3, B: 15, C: 6, D: 5, E: 4, F: 7, G: 0, H: 0, total: 40, snitt: 2.67, strykprosent: 17.5, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'DYR204', emnenavn: 'Infeksjonsbiologi og legemiddellære', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['DYR204-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2022, A: 0, B: 9, C: 6, D: 7, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.09, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 0, C: 6, D: 11, E: 8, F: 3, G: 0, H: 0, total: 28, snitt: 1.71, strykprosent: 10.7, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 8, D: 9, E: 8, F: 4, G: 0, H: 0, total: 29, snitt: 1.72, strykprosent: 13.8, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 11, C: 6, D: 9, E: 4, F: 5, G: 0, H: 0, total: 35, snitt: 2.4, strykprosent: 14.3, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'DYR205', emnenavn: 'Intern klinisk praksis', studiepoeng: 20, aar: 1, semester: 'vår',
            dbhEmnekoder: ['DYR205-1'], merknad: 'Klinikkrotasjoner ved NMBU Veterinærhøgskolen.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 0, total: 29, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 0, total: 29, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'DYR206', emnenavn: 'Sykdomslære og dyrepleie', studiepoeng: 25, aar: 2, semester: 'høst',
            dbhEmnekoder: ['DYR206-1'], merknad: 'Delt i 2 moduler.',
            years: [
              { year: 2021, A: 0, B: 9, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.45, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 5, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.05, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 3, C: 4, D: 7, E: 7, F: 3, G: 0, H: 0, total: 24, snitt: 1.88, strykprosent: 12.5, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 6, D: 9, E: 9, F: 3, G: 0, H: 0, total: 27, snitt: 1.67, strykprosent: 11.1, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 8, total: 28, snitt: null, strykprosent: null, bestattprosent: 71.4, skjult: 2 },
            ],
          },
          {
            emnekode: 'DYR216', emnenavn: 'Klinisk kommunikasjon og forberedelser til yrkeslivet', studiepoeng: 1.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['VET342-1'], merknad: 'Nytt emne fra våren 2027, overlapper det tidligere emnet VET342 Klinisk kommunikasjon, psykisk helse og klinikkdrift. DBH-karakterer 2021–2025 ligger på VET342, som historisk lå i 6. semester (se egen oppføring under år 3) – fra og med kull 2025 flyttes emnet til 4. semester. Koblet mot VET342-1 fordi DYR216 ennå ikke har karakterdata.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'DYR207', emnenavn: 'Ekstern klinisk praksis + OSCE DPL', studiepoeng: 33.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['DYR207-1'], merknad: 'Praksis år 2. Inntil 8 uker kan tas ved en godkjent praksisklinikk i utlandet.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 3, total: 26, snitt: null, strykprosent: null, bestattprosent: 88.5, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 7, total: 28, snitt: null, strykprosent: null, bestattprosent: 75, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 15, total: 34, snitt: null, strykprosent: null, bestattprosent: 55.9, skjult: 0 },
            ],
          },
          {
            emnekode: 'DYR210', emnenavn: 'Forskningsmetodikk, statistikk, oppgaveskriving', studiepoeng: 5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['DYR210-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 3, total: 22, snitt: null, strykprosent: null, bestattprosent: 86.4, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'DYR209', emnenavn: 'Bacheloroppgave', studiepoeng: 15, aar: 3, semester: 'høst',
            dbhEmnekoder: ['DYR209-1'], merknad: '10 uker i undervisningsfrie perioder høst- og vårsemester.',
            years: [
              { year: 2021, A: 14, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 4.35, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 3, B: 14, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 6, B: 9, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.17, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 4, B: 10, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.95, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 3, B: 17, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 23, snitt: 3.74, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'DYR211', emnenavn: 'Avsluttende klinisk praksis', studiepoeng: 16.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['DYR211-1'], merknad: '10 uker (9 uker praksis og 1 uke rehabiliteringskurs).',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'DYR216', emnenavn: 'Klinisk kommunikasjon og forberedelser til yrkeslivet', studiepoeng: 1.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['VET342-1'], merknad: 'Historisk plassering (6. semester, erstatter VET342 – se merknad på år 2-oppføringen). NMBUs offisielle emneoversikt for overgangsåret 2026/27 lister emnet begge steder fordi kull 2024 (3. år) tar det sammen med kull 2025 (2. år) våren 2027; fra og med neste kull ligger emnet bare i 4. semester (år 2).',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'DYR214', emnenavn: 'Laboratoriediagnostikk', studiepoeng: 5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['DYR214-1'], merknad: 'OSCE-eksamen.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'DYR208', emnenavn: 'Dyrevelferd og profesjonsetikk', studiepoeng: 7, aar: 3, semester: 'vår',
            dbhEmnekoder: ['DYR208-1', 'DYR208-2'], merknad: 'DYR208-1 (2 sp, Profesjonsetikk) er den eldre, smalere versjonen av emnet; DYR208-2 (7 sp, Dyrevelferd og profesjonsetikk) er gjeldende versjon.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'nord_dyrepleie', shortName: 'Nord', institusjon: 'Nord universitet', isNmbu: false, programnavn: 'Dyrepleie (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nord.no/studier/dyrepleie-bachelor', 'https://www.nord.no/studier/studieplaner/dyrepleie-badyr-bachelor-host-2026', 'https://www.nord.no/studier/studieplaner/dyrepleie-badyr-bachelor-host-2024'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 180,
        merknad: 'Kilde er nord.no sine offentlige studieplansider, sammenlignet for kullene «Høst 2026» og «Høst 2024» (identisk emneinnhold og studiepoeng – kull 2024 er første kull i gjeldende plan og har rukket lengst). Programmet har byttet emnekodesystem flere ganger: kull 2023 og eldre brukte en annen kodeserie (bl.a. BI145F, KJ100F, FIL1001, MAT1011, PRA1000, DYR1001–DYR2003, BIO1002, BI247F, MET2000, BI242F, PRA2004, PRA2024, BI248F, BI243F, MA116F, DYR2000, PRA2000 – se nord.no/studier/studieplaner/dyrepleie-badyr-bachelor-host-2023), og enda eldre kull (2021/2022) har karakterdata i DBH på en tredje kodeserie (BI122F, BI144F, BI216F, MAR2034, RE105S) som ikke lenger vises på nord.no sine studieplansider (eldste tilgjengelige kull der er 2019). Alle disse eldre kodene finnes i karakterdataene for entryId nord_dyrepleie, men er ikke koblet i denne studieplanfilen siden de tilhører tidligere studieplanversjoner, ikke gjeldende plan. «Valgemner»-blokken i 6. semester er reelt et valg mellom bacheloroppgave og to teoriemner, ikke frie valgemner. Studiet har for øvrig ingen egne spesialiseringsretninger.',
        obligatoriske: [
          {
            emnekode: 'KJE1001', emnenavn: 'Laboratoriesikkerhet', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJE1001-1'], merknad: 'Gir ikke egne studiepoeng.',
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 45, H: 0, total: 45, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 53, H: 0, total: 53, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'KJE1000', emnenavn: 'Grunnleggende kjemi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJE1000-1'],
            years: [
              { year: 2024, A: 0, B: 4, C: 7, D: 14, E: 9, F: 12, G: 0, H: 0, total: 46, snitt: 1.61, strykprosent: 26.1, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 7, C: 9, D: 14, E: 0, F: 35, G: 0, H: 0, total: 65, snitt: 1.28, strykprosent: 53.8, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'DYR1006', emnenavn: 'Atferd og dyrehold', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['DYR1006-1'],
            years: [
              { year: 2024, A: 4, B: 13, C: 18, D: 8, E: 0, F: 0, G: 0, H: 0, total: 43, snitt: 3.3, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 6, B: 17, C: 15, D: 10, E: 5, F: 0, G: 0, H: 0, total: 53, snitt: 3.17, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'DYR1004', emnenavn: 'Anatomi, fysiologi og generell patologi', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['DYR1004-1'], merknad: 'Deles i to like deler (0 sp i 1. semester, 15 sp i 2. semester/vår) ifølge nord.no sitt rutenett; ført samlet her med full sp-verdi for å unngå dobbelttelling.',
            years: [
              { year: 2025, A: 3, B: 4, C: 6, D: 22, E: 10, F: 14, G: 0, H: 0, total: 59, snitt: 1.75, strykprosent: 23.7, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'DYR1005', emnenavn: 'Introduksjon til dyrepleie og dyrehelse', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['DYR1005-1'], merknad: 'Deles i to like deler (0 sp i 1. semester, 15 sp i 2. semester/vår); ført samlet her.',
            years: [
              { year: 2025, A: 0, B: 10, C: 14, D: 13, E: 7, F: 0, G: 0, H: 0, total: 44, snitt: 2.61, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'BIO1009', emnenavn: 'Cellebiologi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO1009-1'],
            years: [
              { year: 2025, A: 3, B: 0, C: 6, D: 8, E: 12, F: 31, G: 0, H: 0, total: 60, snitt: 1.02, strykprosent: 51.7, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIO1008', emnenavn: 'Bærekraft, klima og etikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO1008-1'],
            years: [
              { year: 2025, A: 3, B: 12, C: 19, D: 6, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 3.3, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'DYR2005', emnenavn: 'Sykdomslære og ernæring', studiepoeng: 15, aar: 2, semester: 'høst',
            dbhEmnekoder: ['DYR2005-1'],
            years: [
              { year: 2025, A: 0, B: 4, C: 3, D: 13, E: 7, F: 16, G: 0, H: 0, total: 43, snitt: 1.35, strykprosent: 37.2, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'DYR2004', emnenavn: 'Prosedyrer og laboratoriearbeid i dyrepleie', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['DYR2004-1'],
            years: [
              { year: 2025, A: 3, B: 4, C: 24, D: 8, E: 4, F: 0, G: 0, H: 0, total: 43, snitt: 2.86, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MET1005', emnenavn: 'Akademisk skriving og metode', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MET1005-1'],
            years: [
              { year: 2025, A: 9, B: 10, C: 12, D: 12, E: 0, F: 0, G: 0, H: 0, total: 43, snitt: 3.37, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'PRA2057', emnenavn: 'Praktiske studier 2', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: '4 uker praksis. Ingen karakterdata i DBH ennå: kull 2024 (første kull i gjeldende plan) når dette semesteret våren 2026, rett etter siste årgang i denne kjeden (2025).',
            years: [],
          },
          {
            emnekode: 'DYR2006', emnenavn: 'Klinisk dyrepleie og farmakologi', studiepoeng: 22.5, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ingen karakterdata i DBH ennå, se merknad på PRA2057.',
            years: [],
          },
          {
            emnekode: 'PRA2058', emnenavn: 'Praktiske studier 3', studiepoeng: 30, aar: 3, semester: 'høst',
            dbhEmnekoder: [], merknad: '19 uker praksis. Ingen karakterdata i DBH ennå – kull 2024 begynner dette semesteret høsten 2026.',
            years: [],
          },
          {
            emnekode: 'DYR2008', emnenavn: 'Regelverk, yrkesetikk og psykisk helse', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ingen karakterdata i DBH ennå.',
            years: [],
          },
          {
            emnekode: 'DYR2007', emnenavn: 'Forsøksdyr og komparativ dyrehelse', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ingen karakterdata i DBH ennå.',
            years: [],
          },
          {
            emnekode: 'DYR2009', emnenavn: 'Bacheloroppgave i dyrepleie', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Oppført under «Valgemner» på nord.no sammen med det alternative løpet MAT1014 (Matematikk og statistikk, 7,5 sp) + BIO1013 (Evolusjon og genetikk, 7,5 sp) – studenten velger enten bacheloroppgave eller de to emnene. Bacheloroppgaven er satt som hovedalternativet her siden den er vanlig for en bachelorgrad; se merknad på programnivå. Ingen karakterdata i DBH ennå.',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
];
