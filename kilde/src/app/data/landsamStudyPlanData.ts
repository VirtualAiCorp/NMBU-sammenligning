// GENERERT av scripts/build-landsam-studyplans.py 2026-09-22 – ikke rediger for hånd.
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
    id: 'eiendom', label: 'Eiendom', level: 'master5',
    programs: [
      {
        entryId: 'nmbu_eiendom', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Eiendom (master 5 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-5-aar/eiendom', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-08/2026%20Studieplan%20for%20M-EIE.pdf'],
        totaltStudiepoeng: 300, obligatoriskeStudiepoeng: 260,
        merknad: 'Kilde er NMBUs studieplan-PDF for opptak høsten 2026 (sist oppdatert 06.08.2026). Studieplanen oppgir 300 sp totalt, hvorav 260 obligatoriske og 40 valgfrie. De valgfrie 5 sp-blokkene ligger i 1. år vår (10 sp), 2. år vår (5), 3. år høst (15), 4. år høst (5) og 4. år vår (5). Semesterplasseringen av EIE302, JUS322, JUS331 og MAST303 i 4. og 5. år er rekonstruert fra semestersummene i matrisen (35/30/30/30/30/30/30/30/27,5/27,5 = 300) fordi PDF-uttrekket ikke bevarer kolonneposisjonene; fordelingen summerer seg nøyaktig til 260 obligatoriske sp. NMBU tilbyr i tillegg tilpassede studieplaner for studenter med bachelor eller master i rettsvitenskap (egne PDF-er fra 2025); disse er ikke tatt med her. EIE101 «Innføring i eiendomsfag I» finnes i DBH-tallene, men inngår ikke i studieplanen for 2026 – den hører til et eldre kull.',
        obligatoriske: [
          {
            emnekode: 'EIE100', emnenavn: 'Innføring i eiendomsfag II', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EIE100-1'], merknad: 'Augustblokk + høstparallell.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 31, H: 0, total: 31, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 34, H: 0, total: 34, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 34, H: 0, total: 34, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 39, H: 0, total: 39, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 37, H: 0, total: 37, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'JUS100', emnenavn: 'Juridisk metode og norsk rettssystem', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['JUS100-1'],
            years: [
              { year: 2021, A: 3, B: 19, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.76, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 21, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.85, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 11, C: 14, D: 3, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.5, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 15, C: 10, D: 5, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.57, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 9, C: 14, D: 7, E: 8, F: 0, G: 0, H: 0, total: 42, snitt: 2.86, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PHI100', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['PHI100-1', 'PHI101-1'], merknad: 'Studieplanen gir valget mellom PHI100 og seminarversjonen PHI101; begge DBH-kodene er tatt med.',
            years: [
              { year: 2021, A: 0, B: 8, C: 5, D: 3, E: 3, F: 0, G: 0, H: 0, total: 19, snitt: 2.95, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 7, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.38, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 14, C: 11, D: 0, E: 0, F: 3, G: 0, H: 0, total: 32, snitt: 3.41, strykprosent: 9.4, bestattprosent: null },
              { year: 2024, A: 5, B: 7, C: 11, D: 3, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.54, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 6, B: 10, C: 11, D: 4, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.58, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUS110', emnenavn: 'Innføring i eiendomsjuss', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['JUS110-1'],
            years: [
              { year: 2021, A: 5, B: 17, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.79, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 9, C: 12, D: 11, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.11, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 6, B: 10, C: 13, D: 0, E: 5, F: 0, G: 0, H: 0, total: 34, snitt: 3.35, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 16, C: 12, D: 6, E: 3, F: 5, G: 0, H: 0, total: 46, snitt: 2.93, strykprosent: 10.9, bestattprosent: null },
              { year: 2025, A: 6, B: 14, C: 15, D: 6, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.49, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUS201', emnenavn: 'Offentlig saksbehandling og forvaltningsrett', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['JUS201-1'],
            years: [
              { year: 2021, A: 6, B: 15, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.82, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 7, B: 15, C: 12, D: 3, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.7, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 10, C: 13, D: 5, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.18, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 15, C: 11, D: 6, E: 3, F: 0, G: 0, H: 0, total: 39, snitt: 3.28, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 14, C: 13, D: 6, E: 0, F: 4, G: 0, H: 0, total: 42, snitt: 3.14, strykprosent: 9.5, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUS102', emnenavn: 'Forretningsjus I', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['JUS102-1'],
            years: [
              { year: 2021, A: 0, B: 10, C: 15, D: 11, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 2.97, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 5, C: 14, D: 7, E: 7, F: 0, G: 0, H: 0, total: 33, snitt: 2.52, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 5, C: 17, D: 8, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.2, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 9, C: 16, D: 6, E: 4, F: 0, G: 0, H: 0, total: 38, snitt: 3.03, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 19, C: 13, D: 6, E: 0, F: 0, G: 0, H: 0, total: 43, snitt: 3.53, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EIE202', emnenavn: 'Eiendomshistorie', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['EIE202-1'],
            years: [
              { year: 2021, A: 4, B: 13, C: 23, D: 3, E: 0, F: 0, G: 0, H: 0, total: 43, snitt: 3.42, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 9, C: 11, D: 7, E: 4, F: 4, G: 0, H: 0, total: 38, snitt: 2.68, strykprosent: 10.5, bestattprosent: null },
              { year: 2023, A: 0, B: 6, C: 13, D: 9, E: 3, F: 0, G: 0, H: 0, total: 31, snitt: 2.71, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 4, C: 12, D: 12, E: 6, F: 0, G: 0, H: 0, total: 37, snitt: 2.62, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 4, C: 16, D: 10, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BUS100', emnenavn: 'Grunnleggende bedriftsøkonomi', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BUS100-1'], merknad: 'DBH-navnet er «Bedriften – innføring i bedriftsøkonomiske sammenhenger». Nettversjonen BUS100F-1 er ikke tatt med.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 0, total: 35, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 5, C: 12, D: 6, E: 4, F: 4, G: 0, H: 0, total: 31, snitt: 2.32, strykprosent: 12.9, bestattprosent: null },
              { year: 2023, A: 0, B: 9, C: 9, D: 9, E: 5, F: 3, G: 0, H: 0, total: 35, snitt: 2.46, strykprosent: 8.6, bestattprosent: null },
              { year: 2024, A: 7, B: 6, C: 10, D: 5, E: 3, F: 0, G: 0, H: 0, total: 31, snitt: 3.29, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 13, B: 8, C: 8, D: 3, E: 3, F: 0, G: 0, H: 0, total: 35, snitt: 3.71, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUS220', emnenavn: 'Miljøforvaltningsrett', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['JUS220-1'],
            years: [
              { year: 2021, A: 3, B: 8, C: 12, D: 9, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.16, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 6, C: 18, D: 8, E: 3, F: 0, G: 0, H: 0, total: 39, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 3, B: 6, C: 18, D: 6, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.18, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 10, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.44, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 7, B: 8, C: 9, D: 5, E: 4, F: 0, G: 0, H: 0, total: 33, snitt: 3.27, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'LAD102', emnenavn: 'GIS - praktisk introduksjon', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['LAD102-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 7, total: 39, snitt: null, strykprosent: null, bestattprosent: 82.1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 37, H: 7, total: 44, snitt: null, strykprosent: null, bestattprosent: 84.1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 33, H: 10, total: 43, snitt: null, strykprosent: null, bestattprosent: 76.7 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 36, H: 4, total: 40, snitt: null, strykprosent: null, bestattprosent: 90 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 7, total: 39, snitt: null, strykprosent: null, bestattprosent: 82.1 },
            ],
          },
          {
            emnekode: 'LAD103', emnenavn: 'Kartografi og geodatakilder i planlegging', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['LAD103-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 40, H: 0, total: 40, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 38, H: 0, total: 38, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 40, H: 0, total: 40, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 30, H: 0, total: 30, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 0, total: 35, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'EIE105', emnenavn: 'Kart- og landmålingslære', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['EIE105-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 36, H: 0, total: 36, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 39, H: 0, total: 39, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 36, H: 0, total: 36, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 33, H: 0, total: 33, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 37, H: 0, total: 37, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'AOS240', emnenavn: 'Samfunnsvitenskapelig metode', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['AOS240-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 3, B: 7, C: 18, D: 5, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.24, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 11, B: 16, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 4.12, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 16, C: 15, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.52, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 7, B: 17, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.94, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUS320', emnenavn: 'Plan- og bygningsrett I - planlegging og gjennomføringsvirkemidler', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['JUS320-1'],
            years: [
              { year: 2021, A: 4, B: 15, C: 16, D: 9, E: 0, F: 0, G: 0, H: 0, total: 44, snitt: 3.32, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 10, C: 7, D: 4, E: 4, F: 3, G: 0, H: 0, total: 31, snitt: 2.84, strykprosent: 9.7, bestattprosent: null },
              { year: 2023, A: 12, B: 13, C: 12, D: 4, E: 3, F: 0, G: 0, H: 0, total: 44, snitt: 3.61, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 20, C: 12, D: 5, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 3.6, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 9, C: 11, D: 7, E: 3, F: 0, G: 0, H: 0, total: 35, snitt: 3.17, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EIE200', emnenavn: 'Eiendomsregistrering og eiendomsdanning', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['EIE200-1'],
            years: [
              { year: 2021, A: 5, B: 16, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.74, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 17, C: 8, D: 4, E: 3, F: 0, G: 0, H: 0, total: 36, snitt: 3.42, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 6, B: 19, C: 9, D: 5, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.67, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 26, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 3.68, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 12, C: 15, D: 3, E: 4, F: 0, G: 0, H: 0, total: 34, snitt: 3.03, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EIE222', emnenavn: 'Verdsetting av fast eiendom', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['EIE222-1'],
            years: [
              { year: 2021, A: 4, B: 22, C: 9, D: 4, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.67, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 25, C: 9, D: 5, E: 0, F: 0, G: 0, H: 0, total: 45, snitt: 3.71, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 6, B: 19, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.91, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 5, C: 9, D: 8, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.19, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 8, C: 21, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.48, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EIE310', emnenavn: 'Eiendomsmarked og analyse', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['EIE310-1'], merknad: 'Det er lagt til rette for utveksling høsten i 3. året.',
            years: [
              { year: 2021, A: 0, B: 15, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.58, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 22, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.63, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 11, B: 10, C: 12, D: 6, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.67, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 6, B: 13, C: 24, D: 0, E: 0, F: 0, G: 0, H: 0, total: 43, snitt: 3.58, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 10, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.53, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUS321', emnenavn: 'Plan- og bygningsrett II - byggesak', studiepoeng: 5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['JUS321-1'],
            years: [
              { year: 2021, A: 6, B: 11, C: 14, D: 4, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.54, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 7, C: 12, D: 4, E: 0, F: 3, G: 0, H: 0, total: 32, snitt: 3.19, strykprosent: 9.4, bestattprosent: null },
              { year: 2023, A: 9, B: 15, C: 9, D: 4, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.78, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 6, B: 13, C: 16, D: 0, E: 0, F: 3, G: 0, H: 0, total: 38, snitt: 3.42, strykprosent: 7.9, bestattprosent: null },
              { year: 2025, A: 0, B: 5, C: 8, D: 5, E: 3, F: 0, G: 0, H: 0, total: 21, snitt: 2.71, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EIE280', emnenavn: 'Land Rights', studiepoeng: 5, aar: 3, semester: 'januarblokk',
            dbhEmnekoder: ['EIE280-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 41, H: 0, total: 41, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 49, H: 0, total: 49, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'JUS310', emnenavn: 'Rettigheter i fast eiendom', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['JUS310-1'],
            years: [
              { year: 2021, A: 7, B: 8, C: 8, D: 3, E: 0, F: 4, G: 0, H: 0, total: 30, snitt: 3.23, strykprosent: 13.3, bestattprosent: null },
              { year: 2022, A: 3, B: 6, C: 9, D: 6, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.25, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 15, C: 15, D: 7, E: 5, F: 0, G: 0, H: 0, total: 42, snitt: 2.95, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 11, C: 13, D: 7, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.13, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 13, C: 8, D: 8, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.34, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'APL350', emnenavn: 'Prosjektutvikling og prosjektgjennomføring', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['APL350-1'],
            years: [
              { year: 2021, A: 3, B: 13, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.68, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 10, B: 15, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 4.06, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 8, B: 14, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.97, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 8, B: 14, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.91, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 10, B: 11, C: 13, D: 3, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.76, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUS311', emnenavn: 'Overføring av fast eiendom', studiepoeng: 5, aar: 4, semester: 'høst',
            dbhEmnekoder: ['JUS311-1'],
            years: [
              { year: 2021, A: 5, B: 14, C: 4, D: 8, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.52, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 13, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.92, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 15, C: 8, D: 7, E: 3, F: 0, G: 0, H: 0, total: 37, snitt: 3.27, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 8, B: 14, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.88, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 6, C: 6, D: 7, E: 3, F: 0, G: 0, H: 0, total: 27, snitt: 3.11, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EIE306', emnenavn: 'Forhandlinger og konflikthåndtering', studiepoeng: 5, aar: 4, semester: 'høst',
            dbhEmnekoder: ['EIE306-1', 'EIE306-2'], merknad: 'EIE306-2 er 5 sp-versjonen som gjelder nå; EIE306-1 er den gamle 10 sp-versjonen.',
            years: [
              { year: 2021, A: 3, B: 13, C: 14, D: 8, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 3.29, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 14, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.56, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 3, B: 5, C: 13, D: 5, E: 4, F: 0, G: 0, H: 0, total: 30, snitt: 2.93, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 16, C: 21, D: 4, E: 0, F: 0, G: 0, H: 0, total: 44, snitt: 3.41, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 11, C: 19, D: 3, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.43, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EIE320', emnenavn: 'Ekspropriasjon og grunnerverv', studiepoeng: 10, aar: 4, semester: 'høst',
            dbhEmnekoder: ['EIE320-1'], merknad: 'Fortsetter i januarblokka.',
            years: [
              { year: 2021, A: 5, B: 16, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.9, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 13, C: 5, D: 9, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.44, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 7, B: 18, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4.04, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 9, B: 19, C: 4, D: 3, E: 4, F: 0, G: 0, H: 0, total: 39, snitt: 3.67, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 15, C: 19, D: 0, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.64, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EIE302', emnenavn: 'Jordskiftearbeid', studiepoeng: 5, aar: 4, semester: 'høst',
            dbhEmnekoder: ['EIE302-1', 'EIE302-2', 'EIE302-3'], merknad: 'Kalles «Materielt jordskifte» i matrisen på side 1 i studieplanen. DBH har tre versjoner på 10/15/10 sp.',
            years: [
              { year: 2021, A: 0, B: 13, C: 13, D: 5, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.26, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 11, C: 16, D: 4, E: 0, F: 3, G: 0, H: 0, total: 34, snitt: 2.94, strykprosent: 8.8, bestattprosent: null },
              { year: 2023, A: 3, B: 14, C: 13, D: 6, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 3.39, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 10, C: 8, D: 8, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.33, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 13, C: 12, D: 9, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.36, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUS322', emnenavn: 'Spesiell forvaltningsrett, skjønn og skjønnsprosess', studiepoeng: 10, aar: 4, semester: 'vår',
            dbhEmnekoder: ['JUS322-1'], merknad: 'DBH-koden JUS322-1 er registrert med 5 sp; studieplanen 2026 oppgir 10 sp.',
            years: [
              { year: 2021, A: 0, B: 4, C: 10, D: 10, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 2.75, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 9, C: 8, D: 6, E: 5, F: 3, G: 0, H: 0, total: 34, snitt: 2.71, strykprosent: 8.8, bestattprosent: null },
              { year: 2023, A: 3, B: 11, C: 8, D: 4, E: 3, F: 5, G: 0, H: 0, total: 34, snitt: 2.76, strykprosent: 14.7, bestattprosent: null },
              { year: 2024, A: 4, B: 15, C: 9, D: 4, E: 4, F: 0, G: 0, H: 0, total: 36, snitt: 3.31, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 11, C: 12, D: 7, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.3, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'AOS340', emnenavn: 'Kvalitativ metode', studiepoeng: 5, aar: 4, semester: 'vår',
            dbhEmnekoder: ['AOS340-1'],
            years: [
              { year: 2021, A: 0, B: 13, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.59, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 8, C: 11, D: 4, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.5, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 14, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.56, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 16, C: 11, D: 5, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 3.53, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 10, B: 20, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 4.18, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUS331', emnenavn: 'Prosess og jordskifte', studiepoeng: 20, aar: 4, semester: 'vår',
            dbhEmnekoder: ['JUS331-1', 'JUS331-2'], merknad: 'Går over to semestre (4. år vår og 5. år høst). Plasseringen er utledet av semestersummene i studieplanen (27,5 sp begge semestre) og er noe usikker.',
            years: [
              { year: 2021, A: 5, B: 7, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.58, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 9, C: 12, D: 6, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.45, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 8, B: 9, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.85, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 7, B: 12, C: 10, D: 6, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.57, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 6, B: 4, C: 17, D: 6, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.3, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'MAST303', emnenavn: 'Planlegging av masteroppgaven ved Eiendom og Eiendomsutvikling', studiepoeng: 5, aar: 4, semester: 'vår',
            dbhEmnekoder: ['MAST303-1'], merknad: '2,5 sp i 4. år vår og 2,5 sp i 5. år høst.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 34, H: 0, total: 34, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 30, H: 0, total: 30, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 38, H: 0, total: 38, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 34, H: 0, total: 34, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'EIE304', emnenavn: 'Feltarbeid i eiendomsfag', studiepoeng: 10, aar: 5, semester: 'høst',
            dbhEmnekoder: ['EIE304-1'],
            years: [
              { year: 2021, A: 4, B: 18, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.9, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 23, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.79, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 11, B: 20, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 4.35, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 32, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 7, B: 19, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.97, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'M30-EIE', emnenavn: 'Masteroppgave', studiepoeng: 30, aar: 5, semester: 'vår',
            dbhEmnekoder: ['M30-EIE-1'],
            years: [
              { year: 2021, A: 14, B: 3, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4.12, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 8, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.71, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 11, B: 18, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 4.38, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 13, B: 11, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.54, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 8, B: 17, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 4.03, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'hvl_landmaling', shortName: 'HVL Bergen', institusjon: 'Høgskulen på Vestlandet', isNmbu: false, programnavn: 'Landmåling og eiendomsdesign',
        studieplanAar: '2026/2027', kilder: ['https://www.hvl.no/studier/studieprogram/landmaling-og-eiendomsdesign/', 'https://www.hvl.no/studier/studieprogram/landmaling-og-eiendomsdesign/2026h/studieplan/', 'https://www.hvl.no/studier/studieprogram/landmaling-og-eiendomsdesign/2026h/utdanningsplan/'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 155,
        merknad: 'Kilde er HVLs utdanningsplan for kull haust 2026; kull 2025 har identisk emnesammensetning. Studiet har 155 sp obligatoriske emner og 25 sp valemne i 3. studieår (BYG111, BYG112, BYG130, BYG305, LEI303, LEI304, LEI305, LEI310, BYG113, LEI110, LEI116). Studieplanen ble lagt kraftig om fra kull 2025: de nye kodene LEI121, LEI122, LEI123, LEI124, LEI200, LEI210 og LEI302 erstatter blant annet BYG102, BYG110, BYG119/BYG123, LEI300 og LEI301, som var obligatoriske til og med kull 2024. Sju av 16 obligatoriske emner har derfor ennå ingen karakterdata i DBH; DBH-tallene for programmet kommer fortsatt fra den gamle emnestrukturen.',
        obligatoriske: [
          {
            emnekode: 'LEI100', emnenavn: 'Innføring i eigedomsfaga', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['LEI100-1'],
            years: [
              { year: 2021, A: 0, B: 7, C: 19, D: 3, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.14, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 7, C: 19, D: 20, E: 0, F: 7, G: 0, H: 0, total: 53, snitt: 2.36, strykprosent: 13.2, bestattprosent: null },
              { year: 2023, A: 0, B: 5, C: 17, D: 15, E: 3, F: 9, G: 0, H: 0, total: 49, snitt: 2.12, strykprosent: 18.4, bestattprosent: null },
              { year: 2024, A: 0, B: 22, C: 28, D: 20, E: 0, F: 9, G: 0, H: 0, total: 79, snitt: 2.68, strykprosent: 11.4, bestattprosent: null },
              { year: 2025, A: 10, B: 30, C: 30, D: 6, E: 0, F: 0, G: 0, H: 0, total: 76, snitt: 3.58, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'LEI102', emnenavn: 'Matematikk', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['LEI102-1'],
            years: [
              { year: 2021, A: 0, B: 6, C: 14, D: 12, E: 4, F: 0, G: 0, H: 0, total: 36, snitt: 2.61, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 7, B: 9, C: 14, D: 6, E: 4, F: 12, G: 0, H: 0, total: 52, snitt: 2.48, strykprosent: 23.1, bestattprosent: null },
              { year: 2023, A: 0, B: 6, C: 6, D: 5, E: 9, F: 13, G: 0, H: 0, total: 39, snitt: 1.56, strykprosent: 33.3, bestattprosent: null },
              { year: 2024, A: 11, B: 14, C: 15, D: 9, E: 11, F: 19, G: 0, H: 0, total: 79, snitt: 2.34, strykprosent: 24.1, bestattprosent: null },
              { year: 2025, A: 6, B: 11, C: 22, D: 8, E: 16, F: 20, G: 0, H: 0, total: 83, snitt: 2.07, strykprosent: 24.1, bestattprosent: null },
            ],
          },
          {
            emnekode: 'LEI117', emnenavn: 'Innføring i geomatikk og geo-informatikk', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['LEI117-1'],
            years: [
              { year: 2021, A: 4, B: 9, C: 18, D: 4, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.37, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 12, C: 15, D: 14, E: 9, F: 0, G: 0, H: 0, total: 54, snitt: 2.78, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 7, C: 16, D: 7, E: 6, F: 5, G: 0, H: 0, total: 41, snitt: 2.34, strykprosent: 12.2, bestattprosent: null },
              { year: 2024, A: 6, B: 14, C: 21, D: 25, E: 8, F: 6, G: 0, H: 0, total: 80, snitt: 2.59, strykprosent: 7.5, bestattprosent: null },
              { year: 2025, A: 6, B: 14, C: 23, D: 18, E: 11, F: 5, G: 0, H: 0, total: 77, snitt: 2.62, strykprosent: 6.5, bestattprosent: null },
            ],
          },
          {
            emnekode: 'LEI121', emnenavn: 'Landmåling', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ny emnekode fra kull 2025; ingen DBH-karakterer ennå. Erstatter deler av BYG102 «Statistikk og landmåling».',
            years: [],
          },
          {
            emnekode: 'LEI122', emnenavn: 'Eigedom og matrikkel', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ny emnekode fra kull 2025; ingen DBH-karakterer ennå. Erstatter deler av LEI300 «Eiendom, matrikkel og jordskifte».',
            years: [],
          },
          {
            emnekode: 'LEI123', emnenavn: 'Klarlegging av grenser, mekling og rettsfastsetjing', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ny emnekode fra kull 2025; ingen DBH-karakterer ennå. Overtar stoff fra LEI300/LEI301.',
            years: [],
          },
          {
            emnekode: 'LEI124', emnenavn: 'Introduksjon til fjernmåling', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ny emnekode fra kull 2025; ingen DBH-karakterer ennå.',
            years: [],
          },
          {
            emnekode: 'LEI104', emnenavn: 'Eigedomsdanning ved oppmålingsforretning', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['LEI104-1'],
            years: [
              { year: 2021, A: 3, B: 22, C: 11, D: 3, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.64, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 8, B: 11, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.86, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 7, B: 12, C: 13, D: 6, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 3.53, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 8, B: 13, C: 9, D: 4, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.74, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 24, B: 18, C: 19, D: 6, E: 0, F: 0, G: 0, H: 0, total: 67, snitt: 3.9, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'LEI105', emnenavn: 'Eigedomslandmåling', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['LEI105-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 20, D: 8, E: 6, F: 4, G: 0, H: 0, total: 38, snitt: 2.16, strykprosent: 10.5, bestattprosent: null },
              { year: 2022, A: 0, B: 5, C: 13, D: 3, E: 5, F: 4, G: 0, H: 0, total: 30, snitt: 2.33, strykprosent: 13.3, bestattprosent: null },
              { year: 2023, A: 0, B: 6, C: 12, D: 13, E: 5, F: 0, G: 0, H: 0, total: 36, snitt: 2.53, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 4, C: 9, D: 9, E: 6, F: 7, G: 0, H: 0, total: 35, snitt: 1.91, strykprosent: 20, bestattprosent: null },
              { year: 2025, A: 8, B: 12, C: 29, D: 11, E: 4, F: 4, G: 0, H: 0, total: 68, snitt: 2.96, strykprosent: 5.9, bestattprosent: null },
            ],
          },
          {
            emnekode: 'LEI200', emnenavn: 'Digital prosjektgjennomføring', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Ny emnekode fra kull 2025; ingen DBH-karakterer ennå. Avløser BYG119/BYG123 «Tegning DAK/BIM».',
            years: [],
          },
          {
            emnekode: 'LEI107', emnenavn: 'Ingeniørlandmåling', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['LEI107-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 13, D: 6, E: 7, F: 4, G: 0, H: 0, total: 35, snitt: 2.23, strykprosent: 11.4, bestattprosent: null },
              { year: 2022, A: 4, B: 7, C: 8, D: 4, E: 11, F: 6, G: 0, H: 0, total: 40, snitt: 2.27, strykprosent: 15, bestattprosent: null },
              { year: 2023, A: 0, B: 3, C: 14, D: 4, E: 5, F: 0, G: 0, H: 0, total: 26, snitt: 2.58, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 7, C: 20, D: 3, E: 5, F: 0, G: 0, H: 0, total: 35, snitt: 2.83, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 6, B: 21, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.81, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'LEI113', emnenavn: 'Økonomi og ressursforvaltning', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['LEI113-1'],
            years: [
              { year: 2021, A: 0, B: 9, C: 11, D: 7, E: 5, F: 4, G: 0, H: 0, total: 36, snitt: 2.44, strykprosent: 11.1, bestattprosent: null },
              { year: 2022, A: 0, B: 6, C: 22, D: 11, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 2.87, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 9, C: 10, D: 4, E: 0, F: 3, G: 0, H: 0, total: 26, snitt: 2.85, strykprosent: 11.5, bestattprosent: null },
              { year: 2024, A: 0, B: 8, C: 16, D: 10, E: 0, F: 8, G: 0, H: 0, total: 42, snitt: 2.38, strykprosent: 19, bestattprosent: null },
              { year: 2025, A: 0, B: 9, C: 10, D: 10, E: 0, F: 7, G: 0, H: 0, total: 36, snitt: 2.39, strykprosent: 19.4, bestattprosent: null },
            ],
          },
          {
            emnekode: 'LEI210', emnenavn: 'Arealplanlegging', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ny emnekode fra kull 2025; ingen DBH-karakterer ennå. Avløser BYG110 «Vei- og arealplanlegging».',
            years: [],
          },
          {
            emnekode: 'LEI111', emnenavn: 'Geografiske informasjonssystem og analysar', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['LEI111-1'],
            years: [
              { year: 2021, A: 0, B: 12, C: 16, D: 3, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.29, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 7, C: 14, D: 11, E: 5, F: 0, G: 0, H: 0, total: 40, snitt: 2.8, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 3, B: 8, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.61, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 9, B: 20, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 4.12, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 11, C: 16, D: 4, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.23, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'LEI302', emnenavn: 'Rettsendring og skjønn', studiepoeng: 5, aar: 3, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Ny emnekode fra kull 2025; ingen DBH-karakterer ennå. Avløser LEI301 «Jordskifterett og saksbehandling».',
            years: [],
          },
          {
            emnekode: 'LEI350', emnenavn: 'Bacheloroppgåve - Landmåling og eigedomsdesign', studiepoeng: 20, aar: 3, semester: 'høst',
            dbhEmnekoder: ['LEI350-1'], merknad: 'Utdanningsplanen plasserer oppgaven i 5. semester, men den går i praksis over 5. og 6. semester. LEI150-1 er den eldre koden for samme oppgave.',
            years: [
              { year: 2022, A: 3, B: 12, C: 18, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.55, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 14, C: 17, D: 3, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.54, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 8, B: 6, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.88, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 20, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.91, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'hvl_eiendomsmegling', shortName: 'HVL Sogndal', institusjon: 'Høgskulen på Vestlandet', isNmbu: false, programnavn: 'Eiendomsmegling, økonomi og jus',
        studieplanAar: '2026/2027', kilder: ['https://www.hvl.no/studier/studieprogram/eiendomsmegling-okonomi-og-jus/', 'https://www.hvl.no/studier/studieprogram/eiendomsmegling-okonomi-og-jus/2026h/utdanningsplan/', 'https://www.hvl.no/studier/studieprogram/eiendomsmegling-okonomi-og-jus/2025h/utdanningsplan/'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 150,
        merknad: 'Kilde er HVLs utdanningsplan for kull haust 2026. 150 av 180 sp er obligatoriske; 30 sp er valgfrie emner i 4. semester (BØ6-2008 Internship, BØA117, BØA205, MF6-2000, OR6-1008, OR6-2003, RE6-2004). Planen ble endret fra kull 2025 til 2026: BØA119 «Danning og akademisk handverk» er nytt i 1. semester, BØA113 er flyttet fra 1. til 3. semester, BØA202 «Etikk, samfunnsansvar og bærekraft» er tatt ut av den obligatoriske kjernen, og bacheloroppgaven er flyttet fra 5. til 6. semester med to varianter (BO6-2011 og BO6-2008). Utdanningsplanen tar selv forbehold om endringer i 2. studieår. HVL oppgir ikke studiepoeng per emne ut over det som står i planen; alle emner utenom oppgaven er 7,5 sp.',
        obligatoriske: [
          {
            emnekode: 'BØA111', emnenavn: 'Matematikk for økonomar', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BØA111-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 4, D: 4, E: 5, F: 14, G: 0, H: 0, total: 27, snitt: 0.93, strykprosent: 51.9, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 4, D: 4, E: 9, F: 14, G: 0, H: 0, total: 31, snitt: 0.94, strykprosent: 45.2, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 0, D: 4, E: 8, F: 37, G: 0, H: 0, total: 49, snitt: 0.33, strykprosent: 75.5, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 4, D: 3, E: 9, F: 51, G: 0, H: 0, total: 67, snitt: 0.4, strykprosent: 76.1, bestattprosent: null },
              { year: 2025, A: 0, B: 4, C: 3, D: 0, E: 13, F: 34, G: 0, H: 0, total: 54, snitt: 0.7, strykprosent: 63, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BØA112', emnenavn: 'Organisasjon og leiing', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BØA112-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 3, D: 12, E: 9, F: 6, G: 0, H: 0, total: 30, snitt: 1.4, strykprosent: 20, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 3, D: 4, E: 13, F: 17, G: 0, H: 0, total: 37, snitt: 0.81, strykprosent: 45.9, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 10, D: 11, E: 18, F: 11, G: 0, H: 0, total: 50, snitt: 1.4, strykprosent: 22, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 3, D: 18, E: 18, F: 15, G: 0, H: 0, total: 54, snitt: 1.17, strykprosent: 27.8, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 5, D: 15, E: 24, F: 8, G: 0, H: 0, total: 52, snitt: 1.33, strykprosent: 15.4, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BØA119', emnenavn: 'Danning og akademisk handverk', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Nytt emne fra kull 2026; ingen DBH-karakterer ennå. Erstatter BØA113 i 1. semester.',
            years: [],
          },
          {
            emnekode: 'EM6-1003', emnenavn: 'Jus for eigedomsmeglarar 1', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EM6-1003-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 11, D: 10, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 2.81, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 6, C: 6, D: 7, E: 6, F: 4, G: 0, H: 0, total: 33, snitt: 2.48, strykprosent: 12.1, bestattprosent: null },
              { year: 2023, A: 4, B: 8, C: 4, D: 11, E: 12, F: 6, G: 0, H: 0, total: 45, snitt: 2.18, strykprosent: 13.3, bestattprosent: null },
              { year: 2024, A: 0, B: 8, C: 9, D: 13, E: 12, F: 8, G: 0, H: 0, total: 50, snitt: 1.94, strykprosent: 16, bestattprosent: null },
              { year: 2025, A: 3, B: 8, C: 11, D: 8, E: 4, F: 5, G: 0, H: 0, total: 39, snitt: 2.56, strykprosent: 12.8, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BØA116', emnenavn: 'Marknadsføring', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BØA116-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 0, D: 8, E: 5, F: 0, G: 0, H: 0, total: 17, snitt: 2.18, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 4, D: 10, E: 6, F: 0, G: 0, H: 0, total: 20, snitt: 1.9, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 3, C: 12, D: 9, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 2.75, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 10, D: 13, E: 3, F: 0, G: 0, H: 0, total: 26, snitt: 2.27, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 6, C: 47, D: 21, E: 3, F: 0, G: 0, H: 0, total: 77, snitt: 2.73, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BØA118', emnenavn: 'Makroøkonomi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BØA118-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 6, E: 8, F: 6, G: 0, H: 0, total: 20, snitt: 1, strykprosent: 30, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 9, F: 7, G: 0, H: 0, total: 16, snitt: 0.56, strykprosent: 43.8, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 6, D: 7, E: 5, F: 11, G: 0, H: 0, total: 29, snitt: 1.28, strykprosent: 37.9, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 9, F: 37, G: 0, H: 0, total: 46, snitt: 0.2, strykprosent: 80.4, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 0, D: 3, E: 17, F: 31, G: 0, H: 0, total: 51, snitt: 0.45, strykprosent: 60.8, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EM6-1001', emnenavn: 'Praktisk eigedomsmekling 1', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['EM6-1001-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 6, D: 12, E: 5, F: 0, G: 0, H: 0, total: 23, snitt: 2.04, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 5, C: 13, D: 7, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 2.92, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 3, B: 4, C: 6, D: 10, E: 0, F: 4, G: 0, H: 0, total: 27, snitt: 2.56, strykprosent: 14.8, bestattprosent: null },
              { year: 2024, A: 4, B: 5, C: 17, D: 4, E: 9, F: 0, G: 0, H: 0, total: 39, snitt: 2.77, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 6, C: 12, D: 15, E: 8, F: 12, G: 0, H: 0, total: 53, snitt: 1.85, strykprosent: 22.6, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EM6-2000', emnenavn: 'Jus for eigedomsmeglarar 2', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['EM6-2000-1'],
            years: [
              { year: 2021, A: 0, B: 7, C: 11, D: 5, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.09, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 4, C: 13, D: 5, E: 4, F: 0, G: 0, H: 0, total: 26, snitt: 2.65, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 5, C: 11, D: 8, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 2.88, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 9, C: 14, D: 10, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 3.14, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 0, C: 9, D: 12, E: 11, F: 5, G: 0, H: 0, total: 40, snitt: 1.93, strykprosent: 12.5, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BØA113', emnenavn: 'Innføring i bedriftsøkonomi og rekneskap', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BØA113-1'], merknad: 'Flyttet fra 1. til 3. semester i kull 2026.',
            years: [
              { year: 2021, A: 0, B: 3, C: 7, D: 5, E: 6, F: 6, G: 0, H: 0, total: 27, snitt: 1.81, strykprosent: 22.2, bestattprosent: null },
              { year: 2022, A: 0, B: 4, C: 0, D: 3, E: 4, F: 20, G: 0, H: 0, total: 31, snitt: 0.84, strykprosent: 64.5, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 4, D: 6, E: 16, F: 25, G: 0, H: 0, total: 51, snitt: 0.78, strykprosent: 49, bestattprosent: null },
              { year: 2024, A: 0, B: 4, C: 4, D: 6, E: 10, F: 41, G: 0, H: 0, total: 65, snitt: 0.77, strykprosent: 63.1, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 13, D: 12, E: 11, F: 24, G: 0, H: 0, total: 60, snitt: 1.23, strykprosent: 40, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EM6-1002', emnenavn: 'Oppgjør av eigedomshandel', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['EM6-1002-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 3, D: 4, E: 0, F: 7, G: 0, H: 0, total: 14, snitt: 1.21, strykprosent: 50, bestattprosent: null },
              { year: 2022, A: 6, B: 12, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.33, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 13, C: 4, D: 0, E: 0, F: 3, G: 0, H: 0, total: 20, snitt: 3.2, strykprosent: 15, bestattprosent: null },
              { year: 2024, A: 3, B: 18, C: 14, D: 10, E: 4, F: 8, G: 0, H: 0, total: 57, snitt: 2.68, strykprosent: 14, bestattprosent: null },
              { year: 2025, A: 5, B: 14, C: 5, D: 6, E: 0, F: 10, G: 0, H: 0, total: 40, snitt: 2.7, strykprosent: 25, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ME6-1001', emnenavn: 'Statistikk og marknadsanalyse', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['ME6-1001-1'], merknad: 'DBH-navnet er «Statistikk».',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 5, F: 7, G: 0, H: 0, total: 12, snitt: 0.42, strykprosent: 58.3, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 4, D: 6, E: 5, F: 5, G: 0, H: 0, total: 20, snitt: 1.45, strykprosent: 25, bestattprosent: null },
              { year: 2023, A: 3, B: 7, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.76, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 8, C: 3, D: 0, E: 4, F: 0, G: 0, H: 0, total: 19, snitt: 3.42, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 5, C: 11, D: 21, E: 27, F: 8, G: 0, H: 0, total: 72, snitt: 1.69, strykprosent: 11.1, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PL233', emnenavn: 'Innføring i arealplanlegging', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Ny emnekode; DBH-karakterene for programmet ligger på den eldre 10 sp-koden PL433-1 med samme emnenavn.',
            years: [],
          },
          {
            emnekode: 'BØA204', emnenavn: 'Investering og finansiering', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BØA204-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 4, F: 12, G: 0, H: 0, total: 16, snitt: 0.25, strykprosent: 75, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 11, D: 6, E: 3, F: 7, G: 0, H: 0, total: 27, snitt: 1.78, strykprosent: 25.9, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 8, D: 4, E: 0, F: 10, G: 0, H: 0, total: 22, snitt: 1.45, strykprosent: 45.5, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 3, D: 8, E: 8, F: 18, G: 0, H: 0, total: 37, snitt: 0.89, strykprosent: 48.6, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EM6-2003', emnenavn: 'Praktisk eigedomsmegling 2', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['EM6-2003-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 6, D: 7, E: 5, F: 0, G: 0, H: 0, total: 18, snitt: 2.06, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 4, C: 3, D: 7, E: 6, F: 0, G: 0, H: 0, total: 20, snitt: 2.25, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 3, D: 18, E: 3, F: 0, G: 0, H: 0, total: 24, snitt: 2, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 5, C: 9, D: 10, E: 3, F: 0, G: 0, H: 0, total: 27, snitt: 2.59, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 3, C: 5, D: 10, E: 12, F: 0, G: 0, H: 0, total: 30, snitt: 1.97, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JU6-1004', emnenavn: 'Skatte- og avgiftsrett for eigedomsmeglarar', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['JU6-1004-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 3, D: 0, E: 6, F: 9, G: 0, H: 0, total: 18, snitt: 0.83, strykprosent: 50, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 0, D: 4, E: 5, F: 9, G: 0, H: 0, total: 18, snitt: 0.72, strykprosent: 50, bestattprosent: null },
              { year: 2023, A: 0, B: 4, C: 5, D: 9, E: 0, F: 9, G: 0, H: 0, total: 27, snitt: 1.81, strykprosent: 33.3, bestattprosent: null },
              { year: 2024, A: 0, B: 3, C: 11, D: 5, E: 0, F: 9, G: 0, H: 0, total: 28, snitt: 1.96, strykprosent: 32.1, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 11, D: 8, E: 9, F: 3, G: 0, H: 0, total: 31, snitt: 1.87, strykprosent: 9.7, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ME6-1002', emnenavn: 'Samfunnsvitskapleg metode', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['ME6-1002-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 4, D: 7, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.8, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 0, D: 11, E: 7, F: 0, G: 0, H: 0, total: 18, snitt: 1.61, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 4, D: 15, E: 3, F: 0, G: 0, H: 0, total: 22, snitt: 2.05, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 0, D: 7, E: 10, F: 0, G: 0, H: 0, total: 17, snitt: 1.41, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 3, C: 13, D: 9, E: 6, F: 0, G: 0, H: 0, total: 31, snitt: 2.42, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BO6-2009', emnenavn: 'Munnleg eksamen for bachelor i eiendomsmegling', studiepoeng: 0, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BO6-2009-1'], merknad: '0 sp, men obligatorisk avsluttende eksamen.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 10, H: 0, total: 10, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 0, total: 15, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'EM6-2002', emnenavn: 'Jus for eigedomsmeglarar 3', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['EM6-2002-1'],
            years: [
              { year: 2021, A: 3, B: 0, C: 5, D: 5, E: 5, F: 0, G: 0, H: 0, total: 18, snitt: 2.5, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 3, C: 5, D: 7, E: 4, F: 0, G: 0, H: 0, total: 19, snitt: 2.37, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 6, C: 10, D: 0, E: 3, F: 0, G: 0, H: 0, total: 19, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 7, C: 16, D: 9, E: 18, F: 3, G: 0, H: 0, total: 58, snitt: 2.36, strykprosent: 5.2, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EM6-3000', emnenavn: 'Anvendt finans for eigedomsmarknaden', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['EM6-3000-1', 'EM6-2005-1'], merknad: 'EM6-2005-1 er den eldre koden for samme emne.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 5, E: 0, F: 3, G: 0, H: 0, total: 8, snitt: 1.25, strykprosent: 37.5, bestattprosent: null },
              { year: 2022, A: 0, B: 3, C: 3, D: 3, E: 7, F: 4, G: 0, H: 0, total: 20, snitt: 1.7, strykprosent: 20, bestattprosent: null },
              { year: 2023, A: 3, B: 3, C: 4, D: 5, E: 4, F: 0, G: 0, H: 0, total: 19, snitt: 2.79, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 6, C: 3, D: 4, E: 6, F: 0, G: 0, H: 0, total: 22, snitt: 2.82, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 6, C: 4, D: 4, E: 5, F: 9, G: 0, H: 0, total: 28, snitt: 1.75, strykprosent: 32.1, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BO6-2011', emnenavn: 'Bacheloroppgåve', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BO6-2011-1'], merknad: 'Obligatorisk oppgave, men studenten velger mellom BO6-2011 (ordinær) og BO6-2008 (praksisbasert bacheloroppgave). BO6-2008 har ingen DBH-karakterer ennå.',
            years: [
              { year: 2021, A: 4, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.09, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 5, C: 6, D: 4, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.07, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 3, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.2, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 3, C: 15, D: 3, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 10, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.43, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'nord_eiendomsmegling', shortName: 'Nord', institusjon: 'Nord universitet', isNmbu: false, programnavn: 'Eiendomsmegling og markedsanalyser',
        studieplanAar: '2026/2027', kilder: ['https://www.nord.no/studier/eiendomsmegling-og-markedsanalyser-bachelor', 'https://www.nord.no/studier/studieplaner/eiendomsmegling-og-markedsanalyser-baeme-bachelor-host-2026'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 172.5,
        merknad: 'Kilde er Nords studieplan for kull haust 2026. 172,5 av 180 sp er obligatoriske; det eneste valget er ett 7,5 sp valgemne i 5. semester (MAF2005 Digital markedsføring og kundeverdi eller MAF1008 Personlig salg i internasjonale markeder). Studiet har ingen egen bacheloroppgave; avsluttende arbeid ligger i RE214E Praktisk eiendomsmegling III, som går over de to siste semestrene og avsluttes med muntlig eksamen. Studiemodellen følger forskrift om eiendomsmegling § 4-2 og UHR-ØAs anbefaling. Alle 22 obligatoriske emner lar seg koble til DBH-koder.',
        obligatoriske: [
          {
            emnekode: 'MAT1001', emnenavn: 'Matematikk', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MAT1001-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 7, D: 5, E: 0, F: 9, G: 0, H: 0, total: 24, snitt: 1.79, strykprosent: 37.5, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 0, D: 4, E: 4, F: 23, G: 0, H: 0, total: 31, snitt: 0.39, strykprosent: 74.2, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 9, D: 10, E: 6, F: 25, G: 0, H: 0, total: 50, snitt: 1.06, strykprosent: 50, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 0, D: 6, E: 0, F: 38, G: 0, H: 0, total: 44, snitt: 0.27, strykprosent: 86.4, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 0, D: 4, E: 0, F: 41, G: 0, H: 0, total: 45, snitt: 0.18, strykprosent: 91.1, bestattprosent: null },
            ],
          },
          {
            emnekode: 'RE215E', emnenavn: 'Praktisk eiendomsmegling I', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['RE215E-1'],
            years: [
              { year: 2021, A: 3, B: 11, C: 13, D: 14, E: 9, F: 5, G: 0, H: 0, total: 55, snitt: 2.45, strykprosent: 9.1, bestattprosent: null },
              { year: 2022, A: 0, B: 4, C: 8, D: 11, E: 8, F: 0, G: 0, H: 0, total: 31, snitt: 2.26, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 6, D: 10, E: 14, F: 9, G: 0, H: 0, total: 39, snitt: 1.33, strykprosent: 23.1, bestattprosent: null },
              { year: 2024, A: 0, B: 3, C: 9, D: 11, E: 7, F: 8, G: 0, H: 0, total: 38, snitt: 1.79, strykprosent: 21.1, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 9, D: 8, E: 12, F: 6, G: 0, H: 0, total: 35, snitt: 1.57, strykprosent: 17.1, bestattprosent: null },
            ],
          },
          {
            emnekode: 'RE217E', emnenavn: 'Jus for eiendomsmeglere I', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['RE217E-1'],
            years: [
              { year: 2021, A: 5, B: 8, C: 25, D: 11, E: 4, F: 4, G: 0, H: 0, total: 57, snitt: 2.77, strykprosent: 7, bestattprosent: null },
              { year: 2022, A: 0, B: 4, C: 8, D: 12, E: 5, F: 0, G: 0, H: 0, total: 29, snitt: 2.38, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 10, D: 16, E: 9, F: 0, G: 0, H: 0, total: 35, snitt: 2.03, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 7, C: 11, D: 4, E: 0, F: 3, G: 0, H: 0, total: 29, snitt: 3.07, strykprosent: 10.3, bestattprosent: null },
              { year: 2025, A: 3, B: 5, C: 20, D: 8, E: 4, F: 0, G: 0, H: 0, total: 40, snitt: 2.88, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECO1002', emnenavn: 'Bedriftsøkonomisk analyse med programvare', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECO1002-1'],
            years: [
              { year: 2021, A: 0, B: 9, C: 18, D: 3, E: 0, F: 7, G: 0, H: 0, total: 37, snitt: 2.59, strykprosent: 18.9, bestattprosent: null },
              { year: 2022, A: 0, B: 10, C: 10, D: 0, E: 0, F: 4, G: 0, H: 0, total: 24, snitt: 2.92, strykprosent: 16.7, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 7, D: 7, E: 0, F: 22, G: 0, H: 0, total: 36, snitt: 0.97, strykprosent: 61.1, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 7, D: 0, E: 0, F: 22, G: 0, H: 0, total: 29, snitt: 0.72, strykprosent: 75.9, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 11, D: 3, E: 0, F: 32, G: 0, H: 0, total: 46, snitt: 0.85, strykprosent: 69.6, bestattprosent: null },
            ],
          },
          {
            emnekode: 'RE216E', emnenavn: 'Praktisk eiendomsmegling II', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['RE216E-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 5, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 2, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 9, C: 15, D: 17, E: 8, F: 3, G: 0, H: 0, total: 52, snitt: 2.37, strykprosent: 5.8, bestattprosent: null },
              { year: 2023, A: 0, B: 4, C: 4, D: 10, E: 7, F: 4, G: 0, H: 0, total: 29, snitt: 1.9, strykprosent: 13.8, bestattprosent: null },
              { year: 2024, A: 0, B: 3, C: 7, D: 10, E: 9, F: 5, G: 0, H: 0, total: 34, snitt: 1.82, strykprosent: 14.7, bestattprosent: null },
              { year: 2025, A: 5, B: 5, C: 3, D: 9, E: 7, F: 5, G: 0, H: 0, total: 34, snitt: 2.32, strykprosent: 14.7, bestattprosent: null },
            ],
          },
          {
            emnekode: 'RET2004', emnenavn: 'Jus for eiendomsmeglere II', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['RET2004-1', 'RE207E-1'], merknad: 'RE207E-1 er den eldre 10 sp-koden for samme emne.',
            years: [
              { year: 2021, A: 3, B: 0, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.33, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 7, C: 22, D: 15, E: 3, F: 0, G: 0, H: 0, total: 51, snitt: 2.88, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 3, C: 7, D: 9, E: 8, F: 0, G: 0, H: 0, total: 27, snitt: 2.19, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 0, D: 17, E: 16, F: 0, G: 0, H: 0, total: 33, snitt: 1.52, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 5, C: 3, D: 6, E: 7, F: 3, G: 0, H: 0, total: 27, snitt: 2.33, strykprosent: 11.1, bestattprosent: null },
            ],
          },
          {
            emnekode: 'FIN1001', emnenavn: 'Innføring i regnskap', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['FIN1001-1'],
            years: [
              { year: 2021, A: 0, B: 7, C: 4, D: 11, E: 0, F: 4, G: 0, H: 0, total: 26, snitt: 2.38, strykprosent: 15.4, bestattprosent: null },
              { year: 2022, A: 5, B: 6, C: 5, D: 4, E: 3, F: 6, G: 0, H: 0, total: 29, snitt: 2.59, strykprosent: 20.7, bestattprosent: null },
              { year: 2023, A: 0, B: 5, C: 0, D: 8, E: 5, F: 6, G: 0, H: 0, total: 24, snitt: 1.71, strykprosent: 25, bestattprosent: null },
              { year: 2024, A: 0, B: 3, C: 6, D: 8, E: 5, F: 10, G: 0, H: 0, total: 32, snitt: 1.59, strykprosent: 31.2, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 5, D: 0, E: 5, F: 9, G: 0, H: 0, total: 19, snitt: 1.05, strykprosent: 47.4, bestattprosent: null },
            ],
          },
          {
            emnekode: 'STT1001', emnenavn: 'Statistikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['STT1001-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 11, D: 5, E: 3, F: 6, G: 0, H: 0, total: 29, snitt: 2.14, strykprosent: 20.7, bestattprosent: null },
              { year: 2022, A: 0, B: 8, C: 10, D: 3, E: 0, F: 3, G: 0, H: 0, total: 24, snitt: 2.83, strykprosent: 12.5, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 3, D: 10, E: 4, F: 12, G: 0, H: 0, total: 29, snitt: 1.14, strykprosent: 41.4, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 6, D: 6, E: 3, F: 16, G: 0, H: 0, total: 31, snitt: 1.06, strykprosent: 51.6, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 3, D: 0, E: 0, F: 23, G: 0, H: 0, total: 26, snitt: 0.35, strykprosent: 88.5, bestattprosent: null },
            ],
          },
          {
            emnekode: 'FIN1002', emnenavn: 'Finansiering og investering', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['FIN1002-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 4, D: 10, E: 9, F: 0, G: 0, H: 0, total: 26, snitt: 2.04, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 5, C: 9, D: 9, E: 7, F: 0, G: 0, H: 0, total: 30, snitt: 2.4, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 3, C: 11, D: 7, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 2.81, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 5, D: 10, E: 7, F: 7, G: 0, H: 0, total: 29, snitt: 1.45, strykprosent: 24.1, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 0, D: 3, E: 3, F: 11, G: 0, H: 0, total: 17, snitt: 0.53, strykprosent: 64.7, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECO1001', emnenavn: 'Samfunnsøkonomi, mikro', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['ECO1001-1'],
            years: [
              { year: 2021, A: 3, B: 0, C: 3, D: 6, E: 6, F: 5, G: 0, H: 0, total: 23, snitt: 1.83, strykprosent: 21.7, bestattprosent: null },
              { year: 2022, A: 3, B: 4, C: 3, D: 6, E: 11, F: 6, G: 0, H: 0, total: 33, snitt: 1.91, strykprosent: 18.2, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 15, D: 5, E: 3, F: 4, G: 0, H: 0, total: 27, snitt: 2.15, strykprosent: 14.8, bestattprosent: null },
              { year: 2024, A: 0, B: 4, C: 0, D: 4, E: 4, F: 13, G: 0, H: 0, total: 25, snitt: 1.12, strykprosent: 52, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 3, F: 16, G: 0, H: 0, total: 19, snitt: 0.16, strykprosent: 84.2, bestattprosent: null },
            ],
          },
          {
            emnekode: 'MAF1001', emnenavn: 'Markedsføring', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MAF1001-1'],
            years: [
              { year: 2022, A: 6, B: 19, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4.24, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 8, C: 7, D: 7, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.05, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 4, C: 22, D: 3, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.03, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 9, D: 8, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 2.53, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'FIL1001', emnenavn: 'Ex. Phil. Etikk, bærekraft og samfunnsansvar', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['FIL1001-1'],
            years: [
              { year: 2022, A: 0, B: 6, C: 10, D: 4, E: 3, F: 0, G: 0, H: 0, total: 23, snitt: 2.83, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 0, C: 12, D: 6, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.17, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 3, C: 0, D: 12, E: 5, F: 8, G: 0, H: 0, total: 33, snitt: 2, strykprosent: 24.2, bestattprosent: null },
              { year: 2025, A: 0, B: 9, C: 5, D: 5, E: 6, F: 3, G: 0, H: 0, total: 28, snitt: 2.39, strykprosent: 10.7, bestattprosent: null },
            ],
          },
          {
            emnekode: 'MET1001', emnenavn: 'Anvendt metode', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MET1001-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 9, D: 9, E: 6, F: 0, G: 0, H: 0, total: 24, snitt: 2.12, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 5, C: 8, D: 12, E: 3, F: 0, G: 0, H: 0, total: 28, snitt: 2.54, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 8, D: 7, E: 3, F: 3, G: 0, H: 0, total: 21, snitt: 1.95, strykprosent: 14.3, bestattprosent: null },
              { year: 2025, A: 0, B: 5, C: 8, D: 12, E: 3, F: 3, G: 0, H: 0, total: 31, snitt: 2.29, strykprosent: 9.7, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECO1003', emnenavn: 'Samfunnsøkonomi, makro', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['ECO1003-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 5, F: 0, G: 0, H: 0, total: 5, snitt: 1, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 7, C: 11, D: 3, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.19, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 8, C: 4, D: 6, E: 0, F: 4, G: 0, H: 0, total: 22, snitt: 2.55, strykprosent: 18.2, bestattprosent: null },
              { year: 2024, A: 0, B: 9, C: 6, D: 5, E: 0, F: 5, G: 0, H: 0, total: 25, snitt: 2.56, strykprosent: 20, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 7, D: 7, E: 4, F: 10, G: 0, H: 0, total: 28, snitt: 1.39, strykprosent: 35.7, bestattprosent: null },
            ],
          },
          {
            emnekode: 'RET1001', emnenavn: 'Rettslære', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['RET1001-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 11, D: 12, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 2.65, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 4, C: 5, D: 10, E: 4, F: 0, G: 0, H: 0, total: 23, snitt: 2.39, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 13, D: 10, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 2.57, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 7, C: 7, D: 9, E: 3, F: 0, G: 0, H: 0, total: 26, snitt: 2.69, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ORG1001', emnenavn: 'Organisasjon', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['ORG1001-1'],
            years: [
              { year: 2021, A: 3, B: 10, C: 6, D: 6, E: 4, F: 0, G: 0, H: 0, total: 29, snitt: 3.07, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 8, C: 10, D: 5, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.13, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 4, C: 9, D: 6, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 2.89, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 6, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.42, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'RET1007', emnenavn: 'Innføring i eiendomsutvikling', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['RET1007-1', 'RET1006-1'], merknad: 'RET1006-1 er den eldre 10 sp-koden for samme emne.',
            years: [
              { year: 2023, A: 0, B: 7, C: 10, D: 8, E: 4, F: 0, G: 0, H: 0, total: 29, snitt: 2.69, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 10, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.43, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 7, C: 8, D: 7, E: 3, F: 0, G: 0, H: 0, total: 25, snitt: 2.76, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'RET1003', emnenavn: 'Oppgjør for eiendomsmeglere', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['RET1003-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 5, G: 5, H: 3, total: 13, snitt: 0, strykprosent: 100, bestattprosent: 62.5 },
              { year: 2022, A: 4, B: 6, C: 3, D: 0, E: 0, F: 14, G: 0, H: 0, total: 27, snitt: 1.96, strykprosent: 51.9, bestattprosent: null },
              { year: 2023, A: 5, B: 11, C: 0, D: 4, E: 3, F: 19, G: 0, H: 0, total: 42, snitt: 1.9, strykprosent: 45.2, bestattprosent: null },
              { year: 2024, A: 5, B: 16, C: 4, D: 0, E: 5, F: 7, G: 0, H: 0, total: 37, snitt: 2.86, strykprosent: 18.9, bestattprosent: null },
              { year: 2025, A: 8, B: 10, C: 0, D: 0, E: 3, F: 7, G: 0, H: 0, total: 28, snitt: 2.96, strykprosent: 25, bestattprosent: null },
            ],
          },
          {
            emnekode: 'RET1004', emnenavn: 'Skatt og avgift for eiendomsmeglere', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['RET1004-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.43, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 0, C: 9, D: 3, E: 4, F: 0, G: 0, H: 0, total: 19, snitt: 2.74, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 7, C: 6, D: 6, E: 10, F: 0, G: 0, H: 0, total: 29, snitt: 2.34, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 5, C: 8, D: 5, E: 5, F: 3, G: 0, H: 0, total: 26, snitt: 2.27, strykprosent: 11.5, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 3, D: 11, E: 8, F: 9, G: 0, H: 0, total: 31, snitt: 1.26, strykprosent: 29, bestattprosent: null },
            ],
          },
          {
            emnekode: 'RE214E', emnenavn: 'Praktisk eiendomsmegling III', studiepoeng: 15, aar: 3, semester: 'helår',
            dbhEmnekoder: ['RE214E-1'], merknad: 'Går over 5. og 6. semester (0 sp i 5. semester, 15 sp i 6.). Avsluttes med obligatorisk muntlig eksamen.',
            years: [
              { year: 2021, A: 0, B: 0, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 2.64, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 7, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.37, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 13, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.57, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 10, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.67, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'REG1002', emnenavn: 'Driftsregnskap og budsjettering', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['REG1002-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 5, F: 0, G: 0, H: 0, total: 5, snitt: 1, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 0, D: 4, E: 10, F: 0, G: 0, H: 0, total: 14, snitt: 1.29, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 8, C: 6, D: 0, E: 3, F: 0, G: 0, H: 0, total: 17, snitt: 3.12, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 3, C: 5, D: 5, E: 8, F: 4, G: 0, H: 0, total: 25, snitt: 1.8, strykprosent: 16, bestattprosent: null },
              { year: 2025, A: 0, B: 3, C: 6, D: 4, E: 0, F: 8, G: 0, H: 0, total: 21, snitt: 1.81, strykprosent: 38.1, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ORG2001', emnenavn: 'Internasjonal foretagsstrategi', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['ORG2001-1'],
            years: [
              { year: 2025, A: 6, B: 4, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.57, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'inn_eiendomsmegling', shortName: 'INN', institusjon: 'Universitetet i Innlandet', isNmbu: false, programnavn: 'Eiendomsmegling',
        studieplanAar: '2023/2024', kilder: ['https://studiekatalog.edutorium.no/inn/nb/program/EIENDOM/2023', 'https://studiekatalog.edutorium.no/inn/nb/program/EIENDOM'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 150,
        merknad: 'Programsiden på inn.no er tatt ned (lenken i programkartet er null, og www.inn.no/studier/studietilbud/... redirigerer til studieoversikten). Nyeste publiserte studieplan i INNs studiekatalog er for kull 2023 høst; katalogen lister ingen startsemestre etter 2023, så studiet ser ut til å være lagt ned etter opptaket i 2023 og siste kull ble ferdig våren 2026. Studieplanen for kull 2023 er derfor brukt. 150 av 180 sp er obligatoriske; 30 sp er valgemner fordelt på 2. semester (7,5 sp: 3MET130 eller 3MET100), 4. semester (15 sp: 3SAM120 eller 3REG160) og 5. semester (7,5 sp: 3REV220). Alle obligatoriske emner lar seg koble til DBH-koder.',
        obligatoriske: [
          {
            emnekode: '3EDM100', emnenavn: 'Praktisk eiendomsmegling I', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['3EDM100-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 12, D: 8, E: 7, F: 3, G: 0, H: 0, total: 35, snitt: 2.26, strykprosent: 8.6, bestattprosent: null },
              { year: 2022, A: 0, B: 4, C: 12, D: 19, E: 6, F: 0, G: 0, H: 0, total: 41, snitt: 2.34, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 16, D: 11, E: 7, F: 5, G: 0, H: 0, total: 39, snitt: 1.97, strykprosent: 12.8, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 4, F: 0, G: 0, H: 0, total: 4, snitt: 1, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: '3MET120', emnenavn: 'Matematikk for økonomer', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['3MET120-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 4, D: 4, E: 3, F: 31, G: 0, H: 0, total: 42, snitt: 0.55, strykprosent: 73.8, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 9, D: 6, E: 11, F: 36, G: 0, H: 0, total: 62, snitt: 0.81, strykprosent: 58.1, bestattprosent: null },
              { year: 2023, A: 0, B: 3, C: 0, D: 5, E: 6, F: 33, G: 0, H: 0, total: 47, snitt: 0.6, strykprosent: 70.2, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 7, F: 13, G: 0, H: 0, total: 20, snitt: 0.35, strykprosent: 65, bestattprosent: null },
            ],
          },
          {
            emnekode: '3REV100', emnenavn: 'Grunnleggende regnskap', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['3REV100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 6, F: 14, G: 0, H: 0, total: 20, snitt: 0.3, strykprosent: 70, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 3, D: 4, E: 20, F: 34, G: 0, H: 0, total: 61, snitt: 0.61, strykprosent: 55.7, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 4, D: 8, E: 6, F: 33, G: 0, H: 0, total: 51, snitt: 0.67, strykprosent: 64.7, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 4, F: 19, G: 0, H: 0, total: 23, snitt: 0.17, strykprosent: 82.6, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 4, G: 0, H: 0, total: 4, snitt: 0, strykprosent: 100, bestattprosent: null },
            ],
          },
          {
            emnekode: '3MAR100', emnenavn: 'Markedsføring', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['3MAR100-1'],
            years: [
              { year: 2021, A: 3, B: 6, C: 12, D: 15, E: 5, F: 5, G: 0, H: 0, total: 46, snitt: 2.39, strykprosent: 10.9, bestattprosent: null },
              { year: 2022, A: 0, B: 8, C: 19, D: 9, E: 4, F: 0, G: 0, H: 0, total: 40, snitt: 2.77, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 4, C: 12, D: 12, E: 9, F: 0, G: 0, H: 0, total: 37, snitt: 2.3, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: '3EDM200', emnenavn: 'Praktisk eiendomsmegling II', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['3EDM200-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 10, D: 21, E: 9, F: 0, G: 0, H: 0, total: 40, snitt: 2.02, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 9, D: 11, E: 3, F: 0, G: 0, H: 0, total: 23, snitt: 2.26, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 0, C: 14, D: 12, E: 6, F: 0, G: 0, H: 0, total: 36, snitt: 2.56, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 15, D: 14, E: 4, F: 0, G: 0, H: 0, total: 33, snitt: 2.33, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: '3BED100', emnenavn: 'Grunnleggende bedriftsøkonomi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['3BED100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 18, F: 37, G: 0, H: 0, total: 55, snitt: 0.33, strykprosent: 67.3, bestattprosent: null },
              { year: 2022, A: 0, B: 3, C: 10, D: 6, E: 5, F: 13, G: 0, H: 0, total: 37, snitt: 1.59, strykprosent: 35.1, bestattprosent: null },
              { year: 2023, A: 3, B: 0, C: 6, D: 4, E: 13, F: 13, G: 0, H: 0, total: 39, snitt: 1.38, strykprosent: 33.3, bestattprosent: null },
              { year: 2024, A: 3, B: 6, C: 12, D: 4, E: 10, F: 4, G: 0, H: 0, total: 39, snitt: 2.38, strykprosent: 10.3, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: '3JUS200', emnenavn: 'Jus I - rettslære', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['3JUS200-1'], merknad: 'DBH-navnet på 3JUS200-1 er «Foretaksrett»; emnet er omdøpt i studieplanen for kull 2023.',
            years: [
              { year: 2022, A: 0, B: 6, C: 10, D: 4, E: 5, F: 0, G: 0, H: 0, total: 25, snitt: 2.68, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 5, C: 15, D: 9, E: 8, F: 0, G: 0, H: 0, total: 37, snitt: 2.46, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 6, C: 11, D: 8, E: 6, F: 0, G: 0, H: 0, total: 31, snitt: 2.55, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: '3JUS210', emnenavn: 'Jus II', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['3JUS210-1'],
            years: [
              { year: 2021, A: 3, B: 12, C: 7, D: 12, E: 6, F: 3, G: 0, H: 0, total: 43, snitt: 2.65, strykprosent: 7, bestattprosent: null },
              { year: 2022, A: 0, B: 9, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.27, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 3, C: 11, D: 9, E: 4, F: 7, G: 0, H: 0, total: 34, snitt: 1.97, strykprosent: 20.6, bestattprosent: null },
              { year: 2024, A: 0, B: 5, C: 12, D: 8, E: 7, F: 0, G: 0, H: 0, total: 32, snitt: 2.47, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: '3EDM300', emnenavn: 'Praktisk eiendomsmegling III', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['3EDM300-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 8, E: 14, F: 0, G: 0, H: 0, total: 22, snitt: 1.36, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 4, C: 14, D: 5, E: 4, F: 0, G: 0, H: 0, total: 27, snitt: 2.67, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 6, C: 13, D: 12, E: 5, F: 0, G: 0, H: 0, total: 36, snitt: 2.56, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 5, C: 14, D: 10, E: 5, F: 0, G: 0, H: 0, total: 34, snitt: 2.56, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: '3MET200', emnenavn: 'Samfunnsvitenskapelig metode', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['3MET200-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 3, E: 5, F: 28, G: 0, H: 0, total: 36, snitt: 0.31, strykprosent: 77.8, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 9, D: 13, E: 15, F: 15, G: 0, H: 0, total: 52, snitt: 1.31, strykprosent: 28.8, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 3, D: 10, E: 12, F: 11, G: 0, H: 0, total: 36, snitt: 1.14, strykprosent: 30.6, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 5, D: 10, E: 6, F: 20, G: 0, H: 0, total: 41, snitt: 1, strykprosent: 48.8, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 0, D: 4, E: 3, F: 4, G: 0, H: 0, total: 11, snitt: 1, strykprosent: 36.4, bestattprosent: null },
            ],
          },
          {
            emnekode: '3ORG100', emnenavn: 'Organisasjonsforståelse', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['3ORG100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 14, E: 6, F: 5, G: 0, H: 0, total: 25, snitt: 1.36, strykprosent: 20, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 4, D: 4, E: 6, F: 4, G: 0, H: 0, total: 18, snitt: 1.44, strykprosent: 22.2, bestattprosent: null },
              { year: 2023, A: 0, B: 3, C: 13, D: 12, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 2.68, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 0, total: 32, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: '3BED200', emnenavn: 'Investering og finansiering', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['3BED200-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 3, D: 0, E: 16, F: 25, G: 0, H: 0, total: 44, snitt: 0.57, strykprosent: 56.8, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 0, D: 6, E: 15, F: 28, G: 0, H: 0, total: 49, snitt: 0.55, strykprosent: 57.1, bestattprosent: null },
              { year: 2023, A: 0, B: 5, C: 3, D: 6, E: 3, F: 17, G: 0, H: 0, total: 34, snitt: 1.29, strykprosent: 50, bestattprosent: null },
              { year: 2024, A: 4, B: 6, C: 0, D: 4, E: 0, F: 16, G: 0, H: 0, total: 30, snitt: 1.73, strykprosent: 53.3, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 7, D: 4, E: 9, F: 16, G: 0, H: 0, total: 36, snitt: 1.06, strykprosent: 44.4, bestattprosent: null },
            ],
          },
          {
            emnekode: '3SAM100', emnenavn: 'Makroøkonomi', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['3SAM100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 4, D: 7, E: 11, F: 9, G: 0, H: 0, total: 31, snitt: 1.19, strykprosent: 29, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 4, D: 9, E: 9, F: 11, G: 0, H: 0, total: 33, snitt: 1.18, strykprosent: 33.3, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 4, D: 3, E: 10, F: 19, G: 0, H: 0, total: 36, snitt: 0.78, strykprosent: 52.8, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 0, D: 4, E: 10, F: 10, G: 0, H: 0, total: 24, snitt: 0.75, strykprosent: 41.7, bestattprosent: null },
              { year: 2025, A: 0, B: 4, C: 5, D: 3, E: 13, F: 12, G: 0, H: 0, total: 37, snitt: 1.35, strykprosent: 32.4, bestattprosent: null },
            ],
          },
          {
            emnekode: '3JUS300', emnenavn: 'Jus III', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['3JUS300-1'],
            years: [
              { year: 2021, A: 4, B: 5, C: 14, D: 5, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.29, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 5, C: 8, D: 9, E: 5, F: 0, G: 0, H: 0, total: 30, snitt: 2.73, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 4, C: 7, D: 3, E: 4, F: 0, G: 0, H: 0, total: 18, snitt: 2.61, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 6, C: 9, D: 3, E: 5, F: 0, G: 0, H: 0, total: 23, snitt: 2.7, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 4, C: 12, D: 13, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 2.69, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: '3LED300', emnenavn: 'Strategi', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['3LED300-1'],
            years: [
              { year: 2021, A: 6, B: 9, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.67, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 5, C: 10, D: 6, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.21, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 10, B: 4, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.24, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 7, B: 10, C: 7, D: 6, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.6, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 8, B: 7, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4.05, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: '3JUS330', emnenavn: 'Skatte- og avgiftsrett for eiendomsmeglere', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['3JUS330-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 0, D: 11, E: 14, F: 27, G: 0, H: 0, total: 56, snitt: 0.93, strykprosent: 48.2, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 3, D: 5, E: 14, F: 13, G: 0, H: 0, total: 35, snitt: 0.94, strykprosent: 37.1, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 4, D: 3, E: 9, F: 17, G: 0, H: 0, total: 33, snitt: 0.82, strykprosent: 51.5, bestattprosent: null },
              { year: 2024, A: 0, B: 3, C: 3, D: 6, E: 9, F: 12, G: 0, H: 0, total: 33, snitt: 1.27, strykprosent: 36.4, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 5, D: 9, E: 5, F: 14, G: 0, H: 0, total: 33, snitt: 1.15, strykprosent: 42.4, bestattprosent: null },
            ],
          },
          {
            emnekode: '3EDM210', emnenavn: 'Oppgjør for eiendomsmeglere', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['3EDM210-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 3, D: 0, E: 4, F: 4, G: 0, H: 0, total: 11, snitt: 1.18, strykprosent: 36.4, bestattprosent: null },
              { year: 2022, A: 0, B: 4, C: 6, D: 9, E: 7, F: 14, G: 0, H: 0, total: 40, snitt: 1.48, strykprosent: 35, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 0, D: 3, E: 7, F: 26, G: 0, H: 0, total: 36, snitt: 0.36, strykprosent: 72.2, bestattprosent: null },
              { year: 2024, A: 0, B: 4, C: 5, D: 6, E: 5, F: 12, G: 0, H: 0, total: 32, snitt: 1.5, strykprosent: 37.5, bestattprosent: null },
              { year: 2025, A: 0, B: 5, C: 4, D: 8, E: 3, F: 14, G: 0, H: 0, total: 34, snitt: 1.5, strykprosent: 41.2, bestattprosent: null },
            ],
          },
          {
            emnekode: '3MAR200', emnenavn: 'Salg og salgsledelse', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['3MAR200-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 14, D: 7, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 2.88, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 6, C: 11, D: 10, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 2.85, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 6, C: 17, D: 8, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 2.94, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 9, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.29, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 7, C: 7, D: 6, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.05, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: '3EDM350', emnenavn: 'Praksis med fordypningsoppgave / Bacheloroppgave', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['3EDM350-1', '3EDMBA300-1'], merknad: 'Obligatorisk avsluttende arbeid på 15 sp, men studenten velger mellom 3EDM350 (praksis med fordypningsoppgave) og 3EDMBA300 (bacheloroppgave eiendomsmegling). Begge DBH-kodene er tatt med.',
            years: [
              { year: 2021, A: 5, B: 11, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.31, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 14, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.64, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 16, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.96, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 10, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.87, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 9, B: 12, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.43, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'usn_eiendomsmegling', shortName: 'USN', institusjon: 'Universitetet i Sørøst-Norge', isNmbu: false, programnavn: 'Eiendomsmegling',
        studieplanAar: '2026/2027', kilder: ['https://www.usn.no/studier/bachelor-i-eiendomsmegling/', 'https://www.usn.no/studier/studie-og-emneplaner/#/studieplan/368_2026_H%C3%98ST'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 180,
        merknad: 'Kilde er USNs studiemodell for kull 2026 høst (studieplanen for 2027 høst er ennå ikke klar, og USN viser selv 2026-planen som illustrasjon). Hele graden er i praksis obligatorisk: 22 emner à 7,5 sp pluss 15 sp der studenten må velge minst ett av INT3020 (internship) og BAC3040 (bacheloroppgave) – begge er ført opp som obligatoriske her, men bare 15 sp av dem inngår i totalen på 180. USN har gjennom flere kull byttet emnekoder på støttefagene; der DBH har både gammel og ny kode for samme emne, er begge tatt med. To emner i den nye planen, ORG1010 «Organisering og ledelse» og MAR2020 «Markedskommunikasjon», har ennå ingen karakterdata på sin egen kode; tallene ligger på ORL1000-1 respektive MKO2000-1/IMR104B-1. EML302B «Eiendomsmegling IV» (15 sp) finnes i DBH-tallene, men er tatt ut av studiemodellen for kull 2026.',
        obligatoriske: [
          {
            emnekode: 'EML100B', emnenavn: 'Eiendomsmegling og etikk I', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EML100B-1'],
            years: [
              { year: 2021, A: 0, B: 17, C: 25, D: 20, E: 0, F: 0, G: 0, H: 0, total: 62, snitt: 2.95, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 4, C: 20, D: 20, E: 14, F: 0, G: 0, H: 0, total: 61, snitt: 2.38, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 5, C: 11, D: 15, E: 18, F: 13, G: 0, H: 0, total: 62, snitt: 1.63, strykprosent: 21, bestattprosent: null },
              { year: 2024, A: 0, B: 8, C: 24, D: 19, E: 10, F: 5, G: 0, H: 0, total: 66, snitt: 2.3, strykprosent: 7.6, bestattprosent: null },
              { year: 2025, A: 0, B: 20, C: 36, D: 12, E: 8, F: 11, G: 0, H: 0, total: 87, snitt: 2.53, strykprosent: 12.6, bestattprosent: null },
            ],
          },
          {
            emnekode: 'REG1000', emnenavn: 'Grunnleggende regnskap', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['REG1000-1'],
            years: [
              { year: 2021, A: 3, B: 8, C: 17, D: 10, E: 7, F: 14, G: 0, H: 0, total: 59, snitt: 2.12, strykprosent: 23.7, bestattprosent: null },
              { year: 2022, A: 0, B: 14, C: 16, D: 9, E: 11, F: 13, G: 0, H: 0, total: 63, snitt: 2.11, strykprosent: 20.6, bestattprosent: null },
              { year: 2023, A: 0, B: 15, C: 19, D: 11, E: 13, F: 4, G: 0, H: 0, total: 62, snitt: 2.45, strykprosent: 6.5, bestattprosent: null },
              { year: 2024, A: 0, B: 6, C: 20, D: 13, E: 10, F: 0, G: 0, H: 0, total: 49, snitt: 2.45, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 6, C: 12, D: 26, E: 18, F: 12, G: 0, H: 0, total: 74, snitt: 1.76, strykprosent: 16.2, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUR1000', emnenavn: 'Rettslære', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['JUR1000-1', 'RET2000-1'], merknad: 'RET2000-1 er en parallell/eldre kode for samme rettslærekurs i DBH.',
            years: [
              { year: 2021, A: 6, B: 20, C: 19, D: 15, E: 6, F: 0, G: 0, H: 0, total: 66, snitt: 3.08, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 7, C: 22, D: 12, E: 13, F: 4, G: 0, H: 0, total: 58, snitt: 2.26, strykprosent: 6.9, bestattprosent: null },
              { year: 2023, A: 10, B: 8, C: 15, D: 15, E: 9, F: 4, G: 0, H: 0, total: 61, snitt: 2.72, strykprosent: 6.6, bestattprosent: null },
              { year: 2024, A: 3, B: 10, C: 17, D: 15, E: 7, F: 6, G: 0, H: 0, total: 58, snitt: 2.47, strykprosent: 10.3, bestattprosent: null },
              { year: 2025, A: 13, B: 20, C: 26, D: 14, E: 0, F: 4, G: 0, H: 0, total: 77, snitt: 3.26, strykprosent: 5.2, bestattprosent: null },
            ],
          },
          {
            emnekode: 'MET1000', emnenavn: 'Matematikk for økonomer', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MET1000-1', 'MAT1000-1'], merknad: 'MAT1000-1 er den eldre koden for samme emne.',
            years: [
              { year: 2021, A: 12, B: 9, C: 16, D: 6, E: 9, F: 18, G: 0, H: 0, total: 70, snitt: 2.36, strykprosent: 25.7, bestattprosent: null },
              { year: 2022, A: 7, B: 5, C: 12, D: 13, E: 12, F: 19, G: 0, H: 0, total: 68, snitt: 1.9, strykprosent: 27.9, bestattprosent: null },
              { year: 2023, A: 6, B: 10, C: 7, D: 10, E: 21, F: 17, G: 0, H: 0, total: 71, snitt: 1.86, strykprosent: 23.9, bestattprosent: null },
              { year: 2024, A: 8, B: 5, C: 6, D: 8, E: 11, F: 16, G: 0, H: 0, total: 54, snitt: 1.94, strykprosent: 29.6, bestattprosent: null },
              { year: 2025, A: 9, B: 14, C: 7, D: 12, E: 15, F: 30, G: 0, H: 0, total: 87, snitt: 1.85, strykprosent: 34.5, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EML101B', emnenavn: 'Jus for eiendomsmeglere I', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['EML101B-1'],
            years: [
              { year: 2021, A: 0, B: 15, C: 27, D: 12, E: 0, F: 3, G: 0, H: 0, total: 57, snitt: 2.89, strykprosent: 5.3, bestattprosent: null },
              { year: 2022, A: 13, B: 12, C: 18, D: 9, E: 4, F: 5, G: 0, H: 0, total: 61, snitt: 3.1, strykprosent: 8.2, bestattprosent: null },
              { year: 2023, A: 3, B: 15, C: 18, D: 16, E: 4, F: 4, G: 0, H: 0, total: 60, snitt: 2.75, strykprosent: 6.7, bestattprosent: null },
              { year: 2024, A: 8, B: 9, C: 18, D: 12, E: 3, F: 8, G: 0, H: 0, total: 58, snitt: 2.71, strykprosent: 13.8, bestattprosent: null },
              { year: 2025, A: 9, B: 11, C: 13, D: 11, E: 4, F: 7, G: 0, H: 0, total: 55, snitt: 2.8, strykprosent: 12.7, bestattprosent: null },
            ],
          },
          {
            emnekode: 'MET1010', emnenavn: 'Statistikk for økonomer', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MET1010-1', 'STA1000-1'], merknad: 'STA1000-1 er den eldre koden for samme emne.',
            years: [
              { year: 2021, A: 3, B: 6, C: 17, D: 11, E: 13, F: 9, G: 0, H: 0, total: 59, snitt: 2.12, strykprosent: 15.3, bestattprosent: null },
              { year: 2022, A: 12, B: 14, C: 16, D: 4, E: 6, F: 0, G: 0, H: 0, total: 52, snitt: 3.42, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 7, C: 8, D: 15, E: 13, F: 17, G: 0, H: 0, total: 60, snitt: 1.58, strykprosent: 28.3, bestattprosent: null },
              { year: 2024, A: 0, B: 4, C: 11, D: 7, E: 25, F: 34, G: 0, H: 0, total: 81, snitt: 1.09, strykprosent: 42, bestattprosent: null },
              { year: 2025, A: 10, B: 12, C: 11, D: 10, E: 4, F: 10, G: 0, H: 0, total: 57, snitt: 2.72, strykprosent: 17.5, bestattprosent: null },
            ],
          },
          {
            emnekode: 'REG1010', emnenavn: 'Finansregnskap med analyse', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['REG1010-1', 'FIN1000-1'], merknad: 'FIN1000-1 er den eldre koden for samme emne.',
            years: [
              { year: 2021, A: 6, B: 8, C: 15, D: 7, E: 9, F: 15, G: 0, H: 0, total: 60, snitt: 2.17, strykprosent: 25, bestattprosent: null },
              { year: 2022, A: 5, B: 7, C: 16, D: 15, E: 12, F: 11, G: 0, H: 0, total: 66, snitt: 2.17, strykprosent: 16.7, bestattprosent: null },
              { year: 2023, A: 0, B: 3, C: 6, D: 14, E: 17, F: 21, G: 0, H: 0, total: 61, snitt: 1.23, strykprosent: 34.4, bestattprosent: null },
              { year: 2024, A: 0, B: 3, C: 12, D: 13, E: 7, F: 23, G: 0, H: 0, total: 58, snitt: 1.4, strykprosent: 39.7, bestattprosent: null },
              { year: 2025, A: 0, B: 4, C: 7, D: 13, E: 19, F: 29, G: 0, H: 0, total: 72, snitt: 1.14, strykprosent: 40.3, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BØK1000', emnenavn: 'Bedriftsøkonomi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BØK1000-1', 'BED1000-1'], merknad: 'BED1000-1 er den eldre koden for samme emne.',
            years: [
              { year: 2021, A: 12, B: 8, C: 10, D: 6, E: 5, F: 13, G: 0, H: 0, total: 54, snitt: 2.57, strykprosent: 24.1, bestattprosent: null },
              { year: 2022, A: 8, B: 13, C: 14, D: 5, E: 9, F: 6, G: 0, H: 0, total: 55, snitt: 2.78, strykprosent: 10.9, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 10, D: 9, E: 21, F: 18, G: 0, H: 0, total: 58, snitt: 1.19, strykprosent: 31, bestattprosent: null },
              { year: 2024, A: 5, B: 15, C: 9, D: 4, E: 10, F: 5, G: 0, H: 0, total: 48, snitt: 2.71, strykprosent: 10.4, bestattprosent: null },
              { year: 2025, A: 0, B: 5, C: 9, D: 5, E: 23, F: 20, G: 0, H: 0, total: 62, snitt: 1.29, strykprosent: 32.3, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EML200B', emnenavn: 'Eiendomsmegling II', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['EML200B-1'],
            years: [
              { year: 2021, A: 4, B: 10, C: 11, D: 4, E: 5, F: 5, G: 0, H: 0, total: 39, snitt: 2.72, strykprosent: 12.8, bestattprosent: null },
              { year: 2022, A: 7, B: 9, C: 9, D: 12, E: 10, F: 9, G: 0, H: 0, total: 56, snitt: 2.36, strykprosent: 16.1, bestattprosent: null },
              { year: 2023, A: 0, B: 11, C: 20, D: 9, E: 8, F: 7, G: 0, H: 0, total: 55, snitt: 2.36, strykprosent: 12.7, bestattprosent: null },
              { year: 2024, A: 0, B: 7, C: 18, D: 17, E: 3, F: 0, G: 0, H: 0, total: 45, snitt: 2.64, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 17, C: 15, D: 9, E: 3, F: 0, G: 0, H: 0, total: 49, snitt: 3.24, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'MAR1000', emnenavn: 'Markedsføringsledelse', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MAR1000-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 14, D: 5, E: 5, F: 0, G: 0, H: 0, total: 28, snitt: 2.61, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 8, C: 11, D: 15, E: 6, F: 7, G: 0, H: 0, total: 47, snitt: 2.15, strykprosent: 14.9, bestattprosent: null },
              { year: 2023, A: 0, B: 10, C: 11, D: 8, E: 13, F: 8, G: 0, H: 0, total: 50, snitt: 2.04, strykprosent: 16, bestattprosent: null },
              { year: 2024, A: 6, B: 8, C: 18, D: 7, E: 3, F: 0, G: 0, H: 0, total: 42, snitt: 3.17, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 0, C: 23, D: 12, E: 4, F: 3, G: 0, H: 0, total: 46, snitt: 2.54, strykprosent: 6.5, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EML201B', emnenavn: 'Jus for eiendomsmeglere II', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['EML201B-1'],
            years: [
              { year: 2021, A: 4, B: 3, C: 20, D: 14, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 2.93, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 12, C: 22, D: 11, E: 6, F: 0, G: 0, H: 0, total: 55, snitt: 2.95, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 8, C: 16, D: 13, E: 0, F: 4, G: 0, H: 0, total: 46, snitt: 2.85, strykprosent: 8.7, bestattprosent: null },
              { year: 2024, A: 6, B: 11, C: 23, D: 5, E: 0, F: 0, G: 0, H: 0, total: 45, snitt: 3.4, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 10, C: 20, D: 11, E: 0, F: 0, G: 0, H: 0, total: 45, snitt: 3.16, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'SØK1000', emnenavn: 'Mikroøkonomi', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['SØK1000-1', 'MIK2000-1'], merknad: 'MIK2000-1 er den eldre koden for samme emne.',
            years: [
              { year: 2021, A: 0, B: 0, C: 4, D: 15, E: 4, F: 12, G: 0, H: 0, total: 35, snitt: 1.31, strykprosent: 34.3, bestattprosent: null },
              { year: 2022, A: 0, B: 7, C: 14, D: 18, E: 11, F: 9, G: 0, H: 0, total: 59, snitt: 1.98, strykprosent: 15.3, bestattprosent: null },
              { year: 2023, A: 0, B: 4, C: 11, D: 8, E: 11, F: 12, G: 0, H: 0, total: 46, snitt: 1.65, strykprosent: 26.1, bestattprosent: null },
              { year: 2024, A: 6, B: 5, C: 14, D: 7, E: 12, F: 14, G: 0, H: 0, total: 58, snitt: 2.03, strykprosent: 24.1, bestattprosent: null },
              { year: 2025, A: 3, B: 0, C: 3, D: 14, E: 16, F: 14, G: 0, H: 0, total: 50, snitt: 1.36, strykprosent: 28, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ORG1010', emnenavn: 'Organisering og ledelse', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ny emnekode; DBH-karakterene for programmet ligger på den eldre koden ORL1000-1 med samme emnenavn.',
            years: [],
          },
          {
            emnekode: 'MET1020', emnenavn: 'Samfunnsvitenskapelig metode', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MET1020-1', 'SAM2000-1'], merknad: 'SAM2000-1 er den eldre koden for samme emne.',
            years: [
              { year: 2021, A: 0, B: 8, C: 13, D: 10, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 2.94, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 10, D: 18, E: 10, F: 0, G: 0, H: 0, total: 38, snitt: 2, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 4, C: 9, D: 18, E: 10, F: 6, G: 0, H: 0, total: 47, snitt: 1.89, strykprosent: 12.8, bestattprosent: null },
              { year: 2024, A: 0, B: 6, C: 11, D: 10, E: 13, F: 3, G: 0, H: 0, total: 43, snitt: 2.09, strykprosent: 7, bestattprosent: null },
              { year: 2025, A: 6, B: 16, C: 12, D: 7, E: 0, F: 3, G: 0, H: 0, total: 44, snitt: 3.27, strykprosent: 6.8, bestattprosent: null },
            ],
          },
          {
            emnekode: 'SØK1010', emnenavn: 'Makroøkonomi', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['SØK1010-1', 'MAK2000-1'], merknad: 'MAK2000-1 er den eldre koden for samme emne.',
            years: [
              { year: 2021, A: 0, B: 8, C: 6, D: 11, E: 11, F: 9, G: 0, H: 0, total: 45, snitt: 1.84, strykprosent: 20, bestattprosent: null },
              { year: 2022, A: 0, B: 3, C: 14, D: 12, E: 9, F: 3, G: 0, H: 0, total: 41, snitt: 2.12, strykprosent: 7.3, bestattprosent: null },
              { year: 2023, A: 4, B: 5, C: 20, D: 9, E: 4, F: 6, G: 0, H: 0, total: 48, snitt: 2.54, strykprosent: 12.5, bestattprosent: null },
              { year: 2024, A: 0, B: 4, C: 9, D: 12, E: 8, F: 9, G: 0, H: 0, total: 42, snitt: 1.79, strykprosent: 21.4, bestattprosent: null },
              { year: 2025, A: 7, B: 5, C: 12, D: 6, E: 16, F: 12, G: 0, H: 0, total: 58, snitt: 2.05, strykprosent: 20.7, bestattprosent: null },
            ],
          },
          {
            emnekode: 'MAR2020', emnenavn: 'Markedskommunikasjon', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ny emnekode; DBH-karakterene ligger på de eldre kodene MKO2000-1 og IMR104B-1 med samme emnenavn.',
            years: [],
          },
          {
            emnekode: 'FIN2000', emnenavn: 'Finansiering og investering', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['FIN2000-1', 'INV2000-1'], merknad: 'INV2000-1 er en parallell kode for samme emne.',
            years: [
              { year: 2021, A: 0, B: 3, C: 4, D: 5, E: 13, F: 12, G: 0, H: 0, total: 37, snitt: 1.27, strykprosent: 32.4, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 11, D: 13, E: 8, F: 9, G: 0, H: 0, total: 41, snitt: 1.63, strykprosent: 22, bestattprosent: null },
              { year: 2023, A: 0, B: 5, C: 6, D: 8, E: 14, F: 14, G: 0, H: 0, total: 47, snitt: 1.45, strykprosent: 29.8, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 7, D: 6, E: 11, F: 23, G: 0, H: 0, total: 47, snitt: 0.94, strykprosent: 48.9, bestattprosent: null },
              { year: 2025, A: 3, B: 3, C: 11, D: 10, E: 18, F: 11, G: 0, H: 0, total: 56, snitt: 1.75, strykprosent: 19.6, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EML300B', emnenavn: 'Skatt- og avgiftsrett for eiendomsmeglere', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['EML300B-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 12, D: 7, E: 5, F: 14, G: 0, H: 0, total: 41, snitt: 1.63, strykprosent: 34.1, bestattprosent: null },
              { year: 2022, A: 4, B: 7, C: 11, D: 10, E: 9, F: 18, G: 0, H: 0, total: 59, snitt: 1.86, strykprosent: 30.5, bestattprosent: null },
              { year: 2023, A: 12, B: 8, C: 13, D: 3, E: 8, F: 10, G: 0, H: 0, total: 54, snitt: 2.69, strykprosent: 18.5, bestattprosent: null },
              { year: 2024, A: 0, B: 9, C: 7, D: 7, E: 12, F: 13, G: 0, H: 0, total: 48, snitt: 1.73, strykprosent: 27.1, bestattprosent: null },
              { year: 2025, A: 6, B: 8, C: 10, D: 6, E: 17, F: 16, G: 0, H: 0, total: 63, snitt: 1.92, strykprosent: 25.4, bestattprosent: null },
            ],
          },
          {
            emnekode: 'STR1000', emnenavn: 'Strategisk ledelse', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['STR1000-1', 'STR2000-1'], merknad: 'STR2000-1 er den eldre koden for samme emne.',
            years: [
              { year: 2021, A: 3, B: 13, C: 12, D: 3, E: 3, F: 0, G: 0, H: 0, total: 34, snitt: 3.29, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 11, C: 19, D: 4, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.21, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 17, C: 22, D: 0, E: 0, F: 0, G: 0, H: 0, total: 43, snitt: 3.58, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 13, C: 11, D: 11, E: 3, F: 0, G: 0, H: 0, total: 38, snitt: 2.89, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 22, C: 17, D: 0, E: 0, F: 0, G: 0, H: 0, total: 43, snitt: 3.7, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EML301B', emnenavn: 'Eiendomsmegling III, etikk og samfunnsansvar', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['EML301B-1'],
            years: [
              { year: 2021, A: 4, B: 7, C: 10, D: 14, E: 5, F: 0, G: 0, H: 0, total: 40, snitt: 2.77, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 9, B: 17, C: 5, D: 0, E: 0, F: 3, G: 0, H: 0, total: 34, snitt: 3.76, strykprosent: 8.8, bestattprosent: null },
              { year: 2023, A: 5, B: 13, C: 16, D: 6, E: 7, F: 3, G: 0, H: 0, total: 50, snitt: 2.88, strykprosent: 6, bestattprosent: null },
              { year: 2024, A: 6, B: 6, C: 17, D: 8, E: 3, F: 0, G: 0, H: 0, total: 40, snitt: 3.1, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 6, B: 9, C: 15, D: 8, E: 3, F: 4, G: 0, H: 0, total: 45, snitt: 2.89, strykprosent: 8.9, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EML303B', emnenavn: 'Oppgjør og regnskap for eiendomshandel', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['EML303B-1'],
            years: [
              { year: 2021, A: 12, B: 8, C: 6, D: 5, E: 0, F: 5, G: 0, H: 0, total: 36, snitt: 3.33, strykprosent: 13.9, bestattprosent: null },
              { year: 2022, A: 9, B: 10, C: 9, D: 5, E: 3, F: 10, G: 0, H: 0, total: 46, snitt: 2.72, strykprosent: 21.7, bestattprosent: null },
              { year: 2023, A: 9, B: 7, C: 6, D: 7, E: 5, F: 12, G: 0, H: 0, total: 46, snitt: 2.39, strykprosent: 26.1, bestattprosent: null },
              { year: 2024, A: 5, B: 19, C: 18, D: 4, E: 0, F: 7, G: 0, H: 0, total: 53, snitt: 3.08, strykprosent: 13.2, bestattprosent: null },
              { year: 2025, A: 3, B: 13, C: 7, D: 11, E: 8, F: 3, G: 0, H: 0, total: 45, snitt: 2.62, strykprosent: 6.7, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EML304B', emnenavn: 'Eiendomsfinansiering', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['EML304B-1'],
            years: [
              { year: 2021, A: 9, B: 4, C: 6, D: 8, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.52, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 5, C: 11, D: 13, E: 7, F: 0, G: 0, H: 0, total: 39, snitt: 2.59, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 3, C: 21, D: 5, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.24, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 8, B: 16, C: 19, D: 0, E: 4, F: 0, G: 0, H: 0, total: 47, snitt: 3.51, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 5, C: 15, D: 13, E: 11, F: 3, G: 0, H: 0, total: 47, snitt: 2.17, strykprosent: 6.4, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BAC3040', emnenavn: 'Bacheloroppgave i eiendomsmegling', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BAC3040-1'], merknad: 'Studiemodellen merker BAC3040 og INT3020 som valgemner, men «velg minst én av INT3020 og BAC3040» gjør de 15 sp obligatoriske.',
            years: [
              { year: 2025, A: 0, B: 6, C: 3, D: 10, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 2.79, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'INT3020', emnenavn: 'Internship i eiendomsmegling', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['INT3020-1'], merknad: 'Alternativ til BAC3040; studenten må ta minst én av de to.',
            years: [
              { year: 2025, A: 0, B: 5, C: 12, D: 8, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 2.88, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'bi_eiendomsmegling', shortName: 'BI', institusjon: 'Handelshøyskolen BI', isNmbu: false, programnavn: 'Bachelor i eiendomsmegling, jus og økonomi',
        studieplanAar: '2026/2027', kilder: ['https://www.bi.no/studier-og-kurs/bachelorstudier/eiendomsmegling-jus-okonomi/', 'https://www.bi.no/studier-og-kurs/bachelorstudier/eiendomsmegling-jus-okonomi/valgkurs-bachelor-i-eiendomsmegling/'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 135,
        merknad: 'Kilde er BIs studieplan på programsiden (studieplanene oppdateres årlig i juni og gjelder fra neste studieår, altså 2026/2027). BI oppgir bare emnenavn i studieplanen; emnekodene er hentet fra lenkene til kursbeskrivelsene på samme side, og DBH-kodene er kode + versjonssiffer (EMS3521 -> EMS35211). 135 sp er obligatoriske. 4. og 5. semester er fleksible: BI lister MRK3580 og ORG3403 i begge semestre og 15 sp «internship, utveksling og valgkurs» i hvert av dem, slik at de to emnene tas én gang og de resterende 45 sp fylles med valgkurs, internship eller utveksling. Merk at BI rapporterer svært høye kandidattall på flere av disse emnene i DBH fordi emnene deles med andre BI-bachelorer; tallene er derfor ikke rene programtall.',
        obligatoriske: [
          {
            emnekode: 'EMS3521', emnenavn: 'Eiendomsjus I', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EMS35211'],
            years: [
              { year: 2021, A: 16, B: 71, C: 80, D: 96, E: 67, F: 33, G: 0, H: 0, total: 363, snitt: 2.38, strykprosent: 9.1, bestattprosent: null },
              { year: 2022, A: 12, B: 61, C: 111, D: 83, E: 43, F: 23, G: 0, H: 0, total: 333, snitt: 2.54, strykprosent: 6.9, bestattprosent: null },
              { year: 2023, A: 73, B: 227, C: 346, D: 250, E: 202, F: 144, G: 0, H: 0, total: 1242, snitt: 2.43, strykprosent: 11.6, bestattprosent: null },
              { year: 2024, A: 10, B: 107, C: 192, D: 174, E: 145, F: 110, G: 0, H: 0, total: 738, snitt: 2.1, strykprosent: 14.9, bestattprosent: null },
              { year: 2025, A: 6, B: 83, C: 148, D: 136, E: 169, F: 156, G: 0, H: 0, total: 698, snitt: 1.79, strykprosent: 22.3, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EMS3416', emnenavn: 'Jus og eiendomsmegling', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EMS34161'],
            years: [
              { year: 2021, A: 16, B: 71, C: 58, D: 97, E: 96, F: 48, G: 0, H: 0, total: 386, snitt: 2.15, strykprosent: 12.4, bestattprosent: null },
              { year: 2022, A: 0, B: 34, C: 59, D: 105, E: 198, F: 238, G: 0, H: 0, total: 634, snitt: 1.14, strykprosent: 37.5, bestattprosent: null },
              { year: 2023, A: 18, B: 148, C: 184, D: 186, E: 186, F: 169, G: 0, H: 0, total: 891, snitt: 2.01, strykprosent: 19, bestattprosent: null },
              { year: 2024, A: 25, B: 116, C: 157, D: 164, E: 148, F: 115, G: 0, H: 0, total: 725, snitt: 2.12, strykprosent: 15.9, bestattprosent: null },
              { year: 2025, A: 28, B: 112, C: 161, D: 144, E: 124, F: 120, G: 0, H: 0, total: 689, snitt: 2.15, strykprosent: 17.4, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BØK3430', emnenavn: 'Innføring i bedriftsøkonomi og finans', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BØK34301'], merknad: 'DBH-navnet er «Innføring i bed.øk. & finans».',
            years: [
              { year: 2023, A: 27, B: 78, C: 121, D: 89, E: 125, F: 238, G: 0, H: 0, total: 678, snitt: 1.64, strykprosent: 35.1, bestattprosent: null },
              { year: 2024, A: 9, B: 67, C: 117, D: 97, E: 131, F: 255, G: 0, H: 0, total: 676, snitt: 1.46, strykprosent: 37.7, bestattprosent: null },
              { year: 2025, A: 32, B: 83, C: 125, D: 96, E: 117, F: 227, G: 0, H: 0, total: 680, snitt: 1.73, strykprosent: 33.4, bestattprosent: null },
            ],
          },
          {
            emnekode: 'SØK3420', emnenavn: 'Samfunnsøkonomi I', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SØK34201'],
            years: [
              { year: 2023, A: 48, B: 214, C: 276, D: 218, E: 191, F: 182, G: 0, H: 0, total: 1129, snitt: 2.26, strykprosent: 16.1, bestattprosent: null },
              { year: 2024, A: 8, B: 79, C: 142, D: 176, E: 164, F: 186, G: 0, H: 0, total: 755, snitt: 1.72, strykprosent: 24.6, bestattprosent: null },
              { year: 2025, A: 10, B: 86, C: 145, D: 137, E: 164, F: 201, G: 0, H: 0, total: 743, snitt: 1.71, strykprosent: 27.1, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EMS3524', emnenavn: 'Eiendomsjus II', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['EMS35241'],
            years: [
              { year: 2021, A: 12, B: 49, C: 58, D: 60, E: 37, F: 8, G: 0, H: 0, total: 224, snitt: 2.62, strykprosent: 3.6, bestattprosent: null },
              { year: 2022, A: 10, B: 61, C: 91, D: 66, E: 79, F: 43, G: 0, H: 0, total: 350, snitt: 2.22, strykprosent: 12.3, bestattprosent: null },
              { year: 2023, A: 30, B: 68, C: 75, D: 72, E: 53, F: 21, G: 0, H: 0, total: 319, snitt: 2.65, strykprosent: 6.6, bestattprosent: null },
              { year: 2024, A: 30, B: 172, C: 262, D: 234, E: 279, F: 154, G: 0, H: 0, total: 1131, snitt: 2.1, strykprosent: 13.6, bestattprosent: null },
              { year: 2025, A: 22, B: 114, C: 175, D: 130, E: 139, F: 85, G: 0, H: 0, total: 665, snitt: 2.24, strykprosent: 12.8, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EMS3528', emnenavn: 'Eiendomsmegling I', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['EMS35281', 'EMS35252'], merknad: 'EMS35252 er en 15 sp-variant av Eiendomsmegling I i DBH.',
            years: [
              { year: 2021, A: 7, B: 63, C: 92, D: 82, E: 68, F: 70, G: 0, H: 0, total: 382, snitt: 2.08, strykprosent: 18.3, bestattprosent: null },
              { year: 2022, A: 0, B: 43, C: 81, D: 88, E: 74, F: 51, G: 0, H: 0, total: 337, snitt: 1.97, strykprosent: 15.1, bestattprosent: null },
              { year: 2023, A: 32, B: 99, C: 119, D: 114, E: 97, F: 61, G: 0, H: 0, total: 522, snitt: 2.37, strykprosent: 11.7, bestattprosent: null },
              { year: 2024, A: 18, B: 88, C: 151, D: 144, E: 169, F: 106, G: 0, H: 0, total: 676, snitt: 2, strykprosent: 15.7, bestattprosent: null },
              { year: 2025, A: 0, B: 48, C: 115, D: 203, E: 174, F: 133, G: 0, H: 0, total: 673, snitt: 1.66, strykprosent: 19.8, bestattprosent: null },
            ],
          },
          {
            emnekode: 'MET2910', emnenavn: 'Matematikk for økonomer', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MET29107', 'MET29104', 'MET29106', 'MET29105', 'MET29102', 'MET29101', 'MET29103'], merknad: 'BI rapporterer matematikkemnet på mange delkoder i DBH (hel- og deleksamener); alle er tatt med.',
            years: [
              { year: 2021, A: 134, B: 143, C: 60, D: 9, E: 13, F: 17, G: 491, H: 0, total: 867, snitt: 3.86, strykprosent: 4.5, bestattprosent: 100 },
              { year: 2022, A: 87, B: 87, C: 102, D: 98, E: 126, F: 453, G: 982, H: 0, total: 1935, snitt: 1.48, strykprosent: 47.5, bestattprosent: 100 },
              { year: 2023, A: 112, B: 149, C: 179, D: 163, E: 192, F: 561, G: 563, H: 0, total: 1919, snitt: 1.63, strykprosent: 41.4, bestattprosent: 100 },
              { year: 2024, A: 21, B: 43, C: 117, D: 142, E: 146, F: 331, G: 14, H: 0, total: 814, snitt: 1.32, strykprosent: 41.4, bestattprosent: 100 },
              { year: 2025, A: 11, B: 9, C: 47, D: 96, E: 146, F: 479, G: 0, H: 0, total: 788, snitt: 0.72, strykprosent: 60.8, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BØK3423', emnenavn: 'Finans', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BØK34231', 'BØK34232', 'BØK34233'], merknad: 'Rapporteres som hel- og deleksamener i DBH.',
            years: [
              { year: 2021, A: 34, B: 59, C: 73, D: 81, E: 81, F: 117, G: 0, H: 0, total: 445, snitt: 1.95, strykprosent: 26.3, bestattprosent: null },
              { year: 2022, A: 0, B: 12, C: 26, D: 68, E: 85, F: 240, G: 0, H: 0, total: 431, snitt: 0.81, strykprosent: 55.7, bestattprosent: null },
              { year: 2023, A: 7, B: 33, C: 71, D: 109, E: 177, F: 376, G: 0, H: 0, total: 773, snitt: 1, strykprosent: 48.6, bestattprosent: null },
              { year: 2024, A: 80, B: 190, C: 385, D: 294, E: 250, F: 259, G: 0, H: 0, total: 1458, snitt: 2.16, strykprosent: 17.8, bestattprosent: null },
              { year: 2025, A: 47, B: 176, C: 416, D: 209, E: 260, F: 324, G: 0, H: 0, total: 1432, snitt: 2, strykprosent: 22.6, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EMS3670', emnenavn: 'Eiendomsutvikling', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['EMS36701'],
            years: [
              { year: 2021, A: 18, B: 51, C: 64, D: 9, E: 0, F: 0, G: 0, H: 0, total: 142, snitt: 3.55, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 13, B: 67, C: 93, D: 36, E: 0, F: 0, G: 0, H: 0, total: 209, snitt: 3.27, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 39, B: 78, C: 95, D: 98, E: 3, F: 0, G: 0, H: 0, total: 313, snitt: 3.17, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 53, B: 183, C: 331, D: 153, E: 49, F: 25, G: 0, H: 0, total: 794, snitt: 2.95, strykprosent: 3.1, bestattprosent: null },
              { year: 2025, A: 59, B: 138, C: 392, D: 294, E: 111, F: 17, G: 0, H: 0, total: 1011, snitt: 2.69, strykprosent: 1.7, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EMS3666', emnenavn: 'Eiendomsmegling II', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['EMS36661'],
            years: [
              { year: 2021, A: 5, B: 39, C: 49, D: 59, E: 66, F: 20, G: 0, H: 0, total: 238, snitt: 2.15, strykprosent: 8.4, bestattprosent: null },
              { year: 2022, A: 5, B: 46, C: 66, D: 84, E: 73, F: 87, G: 0, H: 0, total: 361, snitt: 1.8, strykprosent: 24.1, bestattprosent: null },
              { year: 2023, A: 25, B: 53, C: 50, D: 73, E: 92, F: 71, G: 0, H: 0, total: 364, snitt: 1.99, strykprosent: 19.5, bestattprosent: null },
              { year: 2024, A: 114, B: 219, C: 194, D: 200, E: 211, F: 141, G: 0, H: 0, total: 1079, snitt: 2.45, strykprosent: 13.1, bestattprosent: null },
              { year: 2025, A: 0, B: 40, C: 79, D: 124, E: 165, F: 184, G: 0, H: 0, total: 592, snitt: 1.37, strykprosent: 31.1, bestattprosent: null },
            ],
          },
          {
            emnekode: 'SØK3500', emnenavn: 'Samfunnsøkonomi II', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['SØK35001'],
            years: [
              { year: 2024, A: 40, B: 87, C: 185, D: 180, E: 177, F: 233, G: 0, H: 0, total: 902, snitt: 1.82, strykprosent: 25.8, bestattprosent: null },
              { year: 2025, A: 6, B: 47, C: 92, D: 152, E: 143, F: 274, G: 0, H: 0, total: 714, snitt: 1.32, strykprosent: 38.4, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EMS3651', emnenavn: 'Oppgjør av eiendomshandler', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['EMS36511'],
            years: [
              { year: 2021, A: 11, B: 27, C: 58, D: 66, E: 49, F: 21, G: 0, H: 0, total: 232, snitt: 2.23, strykprosent: 9.1, bestattprosent: null },
              { year: 2022, A: 16, B: 38, C: 59, D: 82, E: 74, F: 36, G: 0, H: 0, total: 305, snitt: 2.12, strykprosent: 11.8, bestattprosent: null },
              { year: 2023, A: 14, B: 33, C: 67, D: 87, E: 71, F: 41, G: 0, H: 0, total: 313, snitt: 2.07, strykprosent: 13.1, bestattprosent: null },
              { year: 2024, A: 43, B: 139, C: 251, D: 320, E: 209, F: 87, G: 0, H: 0, total: 1049, snitt: 2.26, strykprosent: 8.3, bestattprosent: null },
              { year: 2025, A: 22, B: 69, C: 115, D: 139, E: 140, F: 74, G: 0, H: 0, total: 559, snitt: 2.06, strykprosent: 13.2, bestattprosent: null },
            ],
          },
          {
            emnekode: 'MRK3580', emnenavn: 'Markedsføringsledelse og strategi', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MRK35801'], merknad: 'BIs publiserte studieplan lister emnet både i 4. og 5. semester; 4. og 5. semester er fleksible (internship/utveksling/valgkurs), og emnet tas i ett av dem.',
            years: [
              { year: 2025, A: 9, B: 32, C: 87, D: 92, E: 143, F: 182, G: 0, H: 0, total: 545, snitt: 1.4, strykprosent: 33.4, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ORG3403', emnenavn: 'Organisasjonsatferd og ledelse', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['ORG34031'], merknad: 'Samme som MRK3580: listet både i 4. og 5. semester i BIs studieplan.',
            years: [
              { year: 2025, A: 0, B: 12, C: 45, D: 164, E: 212, F: 55, G: 0, H: 0, total: 488, snitt: 1.48, strykprosent: 11.3, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EMS3642', emnenavn: 'Eiendomsjus III', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['EMS36422'],
            years: [
              { year: 2021, A: 9, B: 47, C: 43, D: 32, E: 12, F: 0, G: 0, H: 0, total: 143, snitt: 3.06, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 34, C: 79, D: 47, E: 20, F: 21, G: 0, H: 0, total: 206, snitt: 2.49, strykprosent: 10.2, bestattprosent: null },
              { year: 2023, A: 5, B: 29, C: 89, D: 99, E: 77, F: 13, G: 0, H: 0, total: 312, snitt: 2.19, strykprosent: 4.2, bestattprosent: null },
              { year: 2024, A: 14, B: 55, C: 63, D: 65, E: 65, F: 35, G: 0, H: 0, total: 297, snitt: 2.27, strykprosent: 11.8, bestattprosent: null },
              { year: 2025, A: 4, B: 78, C: 134, D: 121, E: 101, F: 84, G: 0, H: 0, total: 522, snitt: 2.06, strykprosent: 16.1, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EMS3623', emnenavn: 'Eiendomsmegling III', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['EMS36231'],
            years: [
              { year: 2021, A: 3, B: 31, C: 40, D: 34, E: 26, F: 24, G: 0, H: 0, total: 158, snitt: 2.23, strykprosent: 15.2, bestattprosent: null },
              { year: 2022, A: 20, B: 61, C: 47, D: 42, E: 19, F: 31, G: 0, H: 0, total: 220, snitt: 2.67, strykprosent: 14.1, bestattprosent: null },
              { year: 2023, A: 27, B: 64, C: 71, D: 67, E: 74, F: 23, G: 0, H: 0, total: 326, snitt: 2.49, strykprosent: 7.1, bestattprosent: null },
              { year: 2024, A: 36, B: 70, C: 87, D: 60, E: 24, F: 13, G: 0, H: 0, total: 290, snitt: 2.98, strykprosent: 4.5, bestattprosent: null },
              { year: 2025, A: 13, B: 67, C: 130, D: 121, E: 120, F: 49, G: 0, H: 0, total: 500, snitt: 2.17, strykprosent: 9.8, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EMS3618', emnenavn: 'Muntlig eksamen for eiendomsmeglerstudiet', studiepoeng: 0, aar: 3, semester: 'vår',
            dbhEmnekoder: ['EMS36181'], merknad: '0 sp, men obligatorisk muntlig eksamen i 6. semester.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 17, G: 134, H: 0, total: 151, snitt: 0, strykprosent: 100, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 20, G: 195, H: 0, total: 215, snitt: 0, strykprosent: 100, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 33, G: 286, H: 0, total: 319, snitt: 0, strykprosent: 100, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 37, G: 276, H: 0, total: 313, snitt: 0, strykprosent: 100, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 79, G: 444, H: 0, total: 523, snitt: 0, strykprosent: 100, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'STR3610', emnenavn: 'Doing Sustainable Business', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['STR36101'],
            years: [
              { year: 2025, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'landskapsarkitektur', label: 'Landskapsarkitektur', level: 'master5',
    programs: [
      {
        entryId: 'nmbu_la', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Landskapsarkitektur (master 5 år)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'aho_la', shortName: 'AHO', institusjon: 'Arkitektur- og designhøgskolen i Oslo', isNmbu: false, programnavn: 'Landskapsarkitektur',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'hvl_landskapsplanlegging_la', shortName: 'HVL Sogndal', institusjon: 'Høgskulen på Vestlandet', isNmbu: false, programnavn: 'Landskapsplanlegging med landskapsarkitektur',
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
    id: 'byregion', label: 'By- og regionplanlegging', level: 'master5',
    programs: [
      {
        entryId: 'nmbu_byreg', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'By- og regionplanlegging (master 5 år)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uis_byplanlegging', shortName: 'UiS', institusjon: 'Universitetet i Stavanger', isNmbu: false, programnavn: 'Byplanlegging',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uis_byplan_samfsikkerhet', shortName: 'UiS (bachelor)', institusjon: 'Universitetet i Stavanger', isNmbu: false, programnavn: 'Byplanlegging og samfunnssikkerhet',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uis_ing_bygg_byplan', shortName: 'UiS (ingeniør)', institusjon: 'Universitetet i Stavanger', isNmbu: false, programnavn: 'Ingeniør, bygg, studieretning byplanlegging',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uit_samfunnsplanlegging', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Samfunnsplanlegging',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'nord_geografi_samfplan', shortName: 'Nord', institusjon: 'Nord universitet', isNmbu: false, programnavn: 'Geografi og samfunnsplanlegging',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uia_samfunnsplanlegging', shortName: 'UiA', institusjon: 'Universitetet i Agder', isNmbu: false, programnavn: 'Samfunnsplanlegging og kommunikasjon',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'hivolda_planlegging', shortName: 'HVO', institusjon: 'Høgskulen i Volda', isNmbu: false, programnavn: 'Planlegging, administrasjon og ledelse',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_fysisk_planlegging', shortName: 'NTNU (master 2 år)', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Fysisk planlegging (fra 2026 Byplanlegging, master 2 år)',
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
    id: 'landskapsingenior', label: 'Landskapsingeniør', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_landskapsing', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Landskapsingeniør (bachelor)',
        studieplanAar: '2025/2026', kilder: ['https://www.nmbu.no/studier/bachelor/landskapsingenior', 'https://www.nmbu.no/studier/studieplan-landskapsingenior-20252026', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/inline-images/Studieplan%20B-LI%202025_2026_0.pdf'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 137.5,
        merknad: 'Kilde er NMBUs studieplan-PDF for kullet 2025/2026. Obligatorisk portefølje er 137,5 sp, som stemmer med programsidens «137,5 studiepoeng obligatoriske emner»; de resterende 42,5 sp er valgfrie og må velges i løpet av de tre årene (anbefalte emner ligger i Canvas-rommet for B-LI). Januarblokk og vårparallell i 2. år er holdt fri for timeplansikrede emner og brukes til valgfrie emner og eventuelt praksis (PRAK202). Semesterkodene i planen (1-1 til 3-4) er tolket som augustblokk, høstparallell, januarblokk, vårparallell og juniblokk.',
        obligatoriske: [
          {
            emnekode: 'LAA115', emnenavn: 'Introduksjon til profesjonsstudiet', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['LAA115-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 30, H: 0, total: 30, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'GEO100', emnenavn: 'Geologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['GEO100-1'],
            years: [
              { year: 2021, A: 0, B: 10, C: 11, D: 0, E: 0, F: 3, G: 0, H: 0, total: 24, snitt: 3.04, strykprosent: 12.5, bestattprosent: null },
              { year: 2022, A: 0, B: 4, C: 5, D: 10, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 2.68, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 7, C: 12, D: 5, E: 0, F: 5, G: 0, H: 0, total: 29, snitt: 2.55, strykprosent: 17.2, bestattprosent: null },
              { year: 2024, A: 0, B: 11, C: 14, D: 5, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.2, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 7, C: 6, D: 3, E: 0, F: 6, G: 0, H: 0, total: 25, snitt: 2.68, strykprosent: 24, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PHI100', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['PHI100-1', 'PHI101-1'], merknad: 'Studieplanen gir valget mellom PHI100 og seminarversjonen PHI101.',
            years: [
              { year: 2021, A: 0, B: 3, C: 7, D: 3, E: 0, F: 4, G: 0, H: 0, total: 17, snitt: 2.29, strykprosent: 23.5, bestattprosent: null },
              { year: 2022, A: 0, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.5, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 10, C: 4, D: 4, E: 3, F: 0, G: 0, H: 0, total: 21, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 11, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.86, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 4, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'LAD100', emnenavn: 'Landskapsdata', studiepoeng: 5, aar: 1, semester: 'januarblokk',
            dbhEmnekoder: ['LAD100-1'], merknad: 'DBH-navnet er «Introduksjon til digitale verktøy»; emnet er omdøpt.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 51, H: 0, total: 51, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 44, H: 0, total: 44, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'THT200', emnenavn: 'Bærekraftig overvannshåndtering', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['THT200-2', 'THT200-1'], merknad: 'THT200-2 er dagens 7,5 sp-versjon; THT200-1 var «Vannteknikk for landskapsplanleggere» (10 sp).',
            years: [
              { year: 2021, A: 5, B: 12, C: 4, D: 4, E: 0, F: 3, G: 0, H: 0, total: 28, snitt: 3.32, strykprosent: 10.7, bestattprosent: null },
              { year: 2022, A: 4, B: 9, C: 7, D: 3, E: 0, F: 3, G: 0, H: 0, total: 26, snitt: 3.19, strykprosent: 11.5, bestattprosent: null },
              { year: 2023, A: 8, B: 6, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.1, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 12, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.76, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 12, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.48, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'LAA222', emnenavn: 'Konkurransegrunnlag og anleggsteknikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['LAA222-2'], merknad: 'Erstatter det eldre emnet LAA221 «Konkurransegrunnlag» (5 sp), som ligger på egen kode i DBH.',
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'JORD160', emnenavn: 'Introduksjon om jord', studiepoeng: 5, aar: 1, semester: 'juniblokk',
            dbhEmnekoder: ['JORD160-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 3, total: 23, snitt: null, strykprosent: null, bestattprosent: 87 },
              { year: 2022, A: 0, B: 10, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.37, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 6, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.74, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 9, C: 5, D: 7, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.46, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 12, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.78, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PHG113', emnenavn: 'Landskapsplanter – Økologi og bærekraftig plantebruk', studiepoeng: 20, aar: 2, semester: 'høst',
            dbhEmnekoder: ['PHG113-2', 'PHG113-1'], merknad: 'PHG113-2 er dagens 20 sp-versjon; PHG113-1 var 10 sp.',
            years: [
              { year: 2021, A: 0, B: 3, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.18, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 12, D: 3, E: 5, F: 0, G: 0, H: 0, total: 20, snitt: 2.35, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 5, C: 5, D: 8, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 2.83, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 17, D: 8, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 2.68, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 6, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.67, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'LAA231', emnenavn: 'Bærekraftig landskapsforvaltning', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['LAA231-1', 'LAA231-2'],
            years: [
              { year: 2021, A: 15, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4.55, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 7, B: 13, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.35, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 10, B: 12, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4.45, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 6, C: 0, D: 9, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.8, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 17, C: 19, D: 11, E: 0, F: 0, G: 0, H: 0, total: 51, snitt: 3.27, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PHG213', emnenavn: 'Landskapsplanter - Planteplan i praksis', studiepoeng: 5, aar: 2, semester: 'juniblokk',
            dbhEmnekoder: ['PHG213-1'], merknad: 'Studieplanen oppgir 5 sp, mens DBH-koden PHG213-1 er registrert med 15 sp.',
            years: [
              { year: 2021, A: 6, B: 4, C: 6, D: 0, E: 0, F: 7, G: 0, H: 0, total: 23, snitt: 2.78, strykprosent: 30.4, bestattprosent: null },
              { year: 2022, A: 3, B: 10, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.5, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 17, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.85, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 10, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.94, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 8, C: 15, D: 3, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.19, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PHG215', emnenavn: 'Landskapsplanter – Etablering, skjøtsel og bevaring', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['PHG215-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 9, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.56, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 6, B: 11, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.1, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 11, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.42, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 15, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.65, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PLV210', emnenavn: 'Plantevern i grøntanlegg', studiepoeng: 5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['PLV210-1'],
            years: [
              { year: 2021, A: 0, B: 12, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.57, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 15, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 6, B: 11, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.1, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 16, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.8, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 14, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.26, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'LAA233', emnenavn: 'Prosjektledelse og gjennomføring', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['LAA233-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 0, total: 29, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 31, H: 0, total: 31, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 3, total: 20, snitt: null, strykprosent: null, bestattprosent: 85 },
            ],
          },
          {
            emnekode: 'LAA216', emnenavn: 'Prosjektering med konkurransegrunnlag', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['LAA216-1'], merknad: 'DBH-navnet er «Konstruksjonsteknikk»; emnet er omdøpt.',
            years: [
              { year: 2021, A: 9, B: 8, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4.04, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 4, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.61, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 10, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.53, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 10, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.43, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 11, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.52, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'B15-LI', emnenavn: 'Bacheloroppgave', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['B15-LI-1'],
            years: [
              { year: 2021, A: 3, B: 10, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.8, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 10, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.8, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 11, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.61, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 6, B: 7, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.95, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 10, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.37, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'hvl_landskapsplanlegging', shortName: 'HVL Sogndal', institusjon: 'Høgskulen på Vestlandet', isNmbu: false, programnavn: 'Landskapsplanlegging med landskapsarkitektur',
        studieplanAar: '2026/2027', kilder: ['https://www.hvl.no/studier/studieprogram/landskapsplanlegging-med-landskapsarkitektur/', 'https://www.hvl.no/studier/studieprogram/landskapsplanlegging-med-landskapsarkitektur/2026h/utdanningsplan/'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 180,
        merknad: 'Kilde er HVLs utdanningsplan for kull haust 2026; kull 2025 har identisk emnesammensetning. Hele graden på 180 sp er obligatorisk – programmet har ingen valgfrie emner. PL461 «Kulturlandskapsskjøtsel» finnes i DBH-tallene, men inngår ikke i planen for 2025/2026 og 2026/2027; emnet hører til en eldre versjon av studieplanen. Det samme programmet ligger i programkartet både i gruppa «landskapsingeniør» (entryId hvl_landskapsplanlegging) og i gruppa «landskapsarkitektur» (hvl_landskapsplanlegging_la).',
        obligatoriske: [
          {
            emnekode: 'BI424', emnenavn: 'Botanikk grunnkurs', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BI424-1'],
            years: [
              { year: 2021, A: 0, B: 13, C: 16, D: 8, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.14, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 8, C: 13, D: 7, E: 0, F: 3, G: 0, H: 0, total: 31, snitt: 2.74, strykprosent: 9.7, bestattprosent: null },
              { year: 2023, A: 3, B: 10, C: 13, D: 9, E: 0, F: 5, G: 0, H: 0, total: 40, snitt: 2.8, strykprosent: 12.5, bestattprosent: null },
              { year: 2024, A: 0, B: 7, C: 13, D: 12, E: 4, F: 4, G: 0, H: 0, total: 40, snitt: 2.38, strykprosent: 10, bestattprosent: null },
              { year: 2025, A: 5, B: 12, C: 12, D: 8, E: 4, F: 13, G: 0, H: 0, total: 54, snitt: 2.39, strykprosent: 24.1, bestattprosent: null },
            ],
          },
          {
            emnekode: 'GE413', emnenavn: 'Kartlære og GIS', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['GE413-1'],
            years: [
              { year: 2021, A: 0, B: 13, C: 13, D: 13, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 6, C: 12, D: 6, E: 0, F: 3, G: 0, H: 0, total: 27, snitt: 2.67, strykprosent: 11.1, bestattprosent: null },
              { year: 2023, A: 4, B: 7, C: 18, D: 12, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.07, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 11, C: 16, D: 8, E: 3, F: 0, G: 0, H: 0, total: 38, snitt: 2.92, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 7, C: 17, D: 10, E: 4, F: 7, G: 0, H: 0, total: 45, snitt: 2.29, strykprosent: 15.6, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PL425', emnenavn: 'Rom og design', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['PL425-2'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 34, H: 0, total: 34, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 39, H: 0, total: 39, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 43, H: 0, total: 43, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 46, H: 0, total: 46, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'BI436', emnenavn: 'Grønstruktur og urban vegetasjon', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BI436-1'],
            years: [
              { year: 2021, A: 8, B: 17, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 4.14, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 8, B: 16, C: 0, D: 3, E: 0, F: 3, G: 0, H: 0, total: 30, snitt: 3.67, strykprosent: 10, bestattprosent: null },
              { year: 2023, A: 8, B: 10, C: 6, D: 0, E: 0, F: 7, G: 0, H: 0, total: 31, snitt: 3.16, strykprosent: 22.6, bestattprosent: null },
              { year: 2024, A: 7, B: 24, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.97, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 11, B: 21, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 4.05, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BI445', emnenavn: 'Økologi grunnkurs', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BI445-3'],
            years: [
              { year: 2021, A: 7, B: 7, C: 14, D: 3, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.58, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 15, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.73, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 14, C: 8, D: 5, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.33, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 9, B: 18, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.92, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 12, B: 14, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.9, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PL471', emnenavn: 'Kulturmiljøforvaltning', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['PL471-2'],
            years: [
              { year: 2021, A: 5, B: 6, C: 15, D: 12, E: 3, F: 0, G: 0, H: 0, total: 41, snitt: 2.95, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 12, C: 10, D: 6, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.44, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 3, B: 4, C: 11, D: 6, E: 4, F: 0, G: 0, H: 0, total: 28, snitt: 2.86, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 12, C: 12, D: 9, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.09, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 13, C: 18, D: 7, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.29, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'GE406', emnenavn: 'Geologi grunnkurs', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['GE406-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 9, D: 11, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 2.71, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 3, C: 12, D: 4, E: 4, F: 0, G: 0, H: 0, total: 23, snitt: 2.61, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 5, D: 6, E: 5, F: 11, G: 0, H: 0, total: 27, snitt: 1.19, strykprosent: 40.7, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 18, D: 12, E: 8, F: 3, G: 0, H: 0, total: 41, snitt: 2.1, strykprosent: 7.3, bestattprosent: null },
              { year: 2025, A: 0, B: 3, C: 14, D: 6, E: 7, F: 12, G: 0, H: 0, total: 42, snitt: 1.74, strykprosent: 28.6, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ME420', emnenavn: 'Statistikk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['ME420-4'],
            years: [
              { year: 2021, A: 0, B: 10, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.45, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 9, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.73, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 5, C: 13, D: 3, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.4, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 18, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.9, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 9, B: 10, C: 15, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.82, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PL416', emnenavn: 'Landskapsanalyse', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['PL416-2'],
            years: [
              { year: 2021, A: 0, B: 7, C: 15, D: 7, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 8, B: 7, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.77, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 3, B: 6, C: 8, D: 5, E: 3, F: 0, G: 0, H: 0, total: 25, snitt: 3.04, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 7, C: 14, D: 7, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 5, C: 20, D: 10, E: 4, F: 0, G: 0, H: 0, total: 39, snitt: 2.67, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BI434', emnenavn: 'Vegetasjonsøkologi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BI434-1'],
            years: [
              { year: 2021, A: 4, B: 8, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.57, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.3, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 5, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.33, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 3, C: 13, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 9, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.33, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'BI435', emnenavn: 'Landskapsøkologi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BI435-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 10, D: 5, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 5, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.06, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 3, C: 7, D: 9, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 2.68, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 3, C: 12, D: 3, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 4, C: 7, D: 4, E: 3, F: 3, G: 0, H: 0, total: 24, snitt: 2.62, strykprosent: 12.5, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PL412', emnenavn: 'Landskapsinngrep', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['PL412-2'],
            years: [
              { year: 2021, A: 6, B: 14, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.3, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 4, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.33, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 8, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.57, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 12, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.6, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 7, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.76, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PL413', emnenavn: 'Miljø- og forvaltningsrett', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['PL413-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.33, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 16, C: 19, D: 15, E: 0, F: 0, G: 0, H: 0, total: 50, snitt: 3.02, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 9, C: 6, D: 5, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.2, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 5, C: 14, D: 8, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 2.89, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PL417', emnenavn: 'Arealplanlegging', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['PL417-1'],
            years: [
              { year: 2021, A: 0, B: 7, C: 9, D: 3, E: 0, F: 3, G: 0, H: 0, total: 22, snitt: 2.77, strykprosent: 13.6, bestattprosent: null },
              { year: 2022, A: 3, B: 10, C: 11, D: 4, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.43, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 14, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.96, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 9, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.5, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 11, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.7, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PL462', emnenavn: 'Naturrestaurering', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['PL462-1'],
            years: [
              { year: 2024, A: 0, B: 5, C: 9, D: 5, E: 3, F: 0, G: 0, H: 0, total: 22, snitt: 2.73, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 7, C: 12, D: 8, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 2.96, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PL418', emnenavn: 'Reguleringsplanlegging', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['PL418-1'],
            years: [
              { year: 2021, A: 10, B: 4, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.88, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 9, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.81, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 9, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.65, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 14, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.8, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 9, B: 0, C: 6, D: 6, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.57, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PL491', emnenavn: 'Bacheloroppgåve i Landskapsplanlegging med landskapsarkitektur', studiepoeng: 20, aar: 3, semester: 'vår',
            dbhEmnekoder: ['PL491-1'],
            years: [
              { year: 2021, A: 7, B: 10, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4.09, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 8, B: 6, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.95, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 7, B: 15, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.97, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 12, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.29, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 12, B: 3, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'miljoutvikling', label: 'Internasjonale miljø- og utviklingsstudier', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_ims', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Internasjonale miljø- og utviklingsstudier (bachelor)',
        studieplanAar: '2025/2026', kilder: ['https://www.nmbu.no/studier/bachelor/internasjonale-miljo-og-utviklingsstudier', 'https://www.nmbu.no/en/studies/study-plan-bachelors-study-international-environment-and-development-studies-202526', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2025-06/B-IEDS%202025%20Study%20plan.pdf'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 90,
        merknad: 'Studieplanen er den engelske B-IEDS-planen for kullet 2025/26 (PDF lenket fra programsiden). 90 av 180 studiepoeng er obligatoriske: hele første studieår (60 sp) pluss høstparallellen i andre år (30 sp). I tillegg må minst 55 sp velges blant betingede valgemner (bl.a. B15-DS bacheloroppgave 15 sp, EDS313 internship, feltkursene EDS210 Tanzania og EDS272 India, EDS245, EDS285, EDS330, EDS370, AOS236, ECN230, APL280, BOT200, BOT201, MINA321), og 35 sp er helt frie emner som kan tas ved NMBU eller på utveksling. Bacheloroppgaven er IKKE obligatorisk i dette programmet - den er et betinget valgemne som anbefales for dem som vil videre på master. Merk at programsiden på nmbu.no oppgir «115 studiepoeng obligatoriske emner», mens selve studieplanen (tabell 2) lister 90 sp; vi har fulgt studieplanen. Alle ti obligatoriske emner er koblet til DBH-koder.',
        obligatoriske: [
          {
            emnekode: 'EDS101', emnenavn: 'Introduksjon til miljø og utvikling', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EDS101-1'], merknad: 'Augustblokk',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 41, H: 0, total: 41, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 40, H: 0, total: 40, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 49, H: 0, total: 49, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 50, H: 0, total: 50, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 31, H: 0, total: 31, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'EDS102', emnenavn: 'Introduksjon til utviklingstenkning', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EDS102-1'],
            years: [
              { year: 2021, A: 11, B: 11, C: 11, D: 6, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.69, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 8, C: 8, D: 10, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.31, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 9, B: 8, C: 12, D: 16, E: 8, F: 0, G: 0, H: 0, total: 53, snitt: 2.89, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 9, B: 20, C: 17, D: 0, E: 0, F: 0, G: 0, H: 0, total: 46, snitt: 3.83, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 14, B: 11, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.95, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EDS260', emnenavn: 'Globale miljøforandringer', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EDS260-1'],
            years: [
              { year: 2021, A: 13, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.81, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 13, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.65, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 34, B: 40, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 85, snitt: 4.27, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 22, B: 19, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 47, snitt: 4.34, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 9, B: 21, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 4.18, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EDS261', emnenavn: 'Globale miljøforandringer - seminarer', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EDS261-1'], merknad: 'Studieplanen kaller emnet EDS260E i emnebeskrivelsen, men EDS261 i emnetabellen; DBH bruker EDS261',
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 49, H: 6, total: 55, snitt: null, strykprosent: null, bestattprosent: 89.1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 48, H: 0, total: 48, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 34, H: 3, total: 37, snitt: null, strykprosent: null, bestattprosent: 91.9 },
            ],
          },
          {
            emnekode: 'ECN101', emnenavn: 'Samfunnsøkonomi for miljø og utvikling', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['ECN101-1'],
            years: [
              { year: 2021, A: 15, B: 11, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 10, B: 7, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4.08, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 10, B: 17, C: 26, D: 0, E: 3, F: 0, G: 0, H: 0, total: 56, snitt: 3.55, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 6, B: 6, C: 15, D: 11, E: 7, F: 3, G: 0, H: 0, total: 48, snitt: 2.67, strykprosent: 6.2, bestattprosent: null },
              { year: 2025, A: 0, B: 5, C: 15, D: 11, E: 10, F: 3, G: 0, H: 0, total: 44, snitt: 2.2, strykprosent: 6.8, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PHI102', emnenavn: 'Examen philosophicum - engelsk versjon', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['PHI102-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 3, B: 17, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.88, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 0, total: 35, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 44, H: 0, total: 44, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 40, H: 0, total: 40, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'ECOL200', emnenavn: 'Generell økologi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['ECOL200-1'],
            years: [
              { year: 2021, A: 9, B: 13, C: 23, D: 0, E: 3, F: 0, G: 0, H: 0, total: 48, snitt: 3.52, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 18, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 3.61, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 63, H: 0, total: 63, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 49, H: 0, total: 49, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 7, total: 42, snitt: null, strykprosent: null, bestattprosent: 83.3 },
            ],
          },
          {
            emnekode: 'EDS115', emnenavn: 'Innføring i forskningsmetode', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['EDS115-1'],
            years: [
              { year: 2021, A: 21, B: 41, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 66, snitt: 4.26, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 16, C: 10, D: 5, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 3.58, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 15, B: 22, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 4.24, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 8, B: 19, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 4.06, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EDS225', emnenavn: 'Linking Ecological and Social Resilience', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['EDS225-1'],
            years: [
              { year: 2021, A: 3, B: 9, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.75, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 9, B: 9, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4.08, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 10, B: 11, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.91, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 13, B: 7, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 4.06, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 10, B: 11, C: 7, D: 3, E: 4, F: 3, G: 0, H: 0, total: 38, snitt: 3.29, strykprosent: 7.9, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EDS230', emnenavn: 'Global utvikling og bistand', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['EDS230-1'],
            years: [
              { year: 2021, A: 6, B: 28, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 4.05, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 7, B: 15, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 4.07, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 4, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.33, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 14, B: 15, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 4.3, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 14, B: 27, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 47, snitt: 4.17, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uio_utvikling_baerekraft', shortName: 'UiO', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Utviklingsstudier og bærekraft',
        studieplanAar: '2026/2027', kilder: ['https://www.uio.no/studier/program/utviklingsstudier/', 'https://www.uio.no/studier/program/utviklingsstudier/oppbygging/', 'https://www.uio.no/studier/program/utviklingsstudier/oppbygging/samfunnsgeografi.html', 'https://www.uio.no/studier/program/utviklingsstudier/oppbygging/samfunnsokonomi.html', 'https://www.uio.no/studier/program/utviklingsstudier/oppbygging/sosialantropologi.html', 'https://www.uio.no/studier/program/utviklingsstudier/oppbygging/statsvitenskap.html'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 110,
        merknad: 'Programmet er delt i obligatoriske emner (90 sp), fordypning (50-70 sp), frie emner (inntil 20 sp) og ex.phil./ex.fac. (20 sp). Vi har regnet ex.phil. og ex.fac. som obligatoriske, slik oppgaven ber om, og oppgir derfor 110 obligatoriske studiepoeng. De to første semestrene er felles for alle, deretter avhenger løpet av hvilken av de fire fordypningene studenten velger. Fordypningen i statsvitenskap krever i tillegg to fordypningsemner på STV 2000-nivå (ett i internasjonal politikk og ett fra et annet fagområde) som studenten velger selv - disse er ikke ført opp som enkeltemner. Fordypningen i samfunnsøkonomi krever i tillegg ett valgfritt ECON-emne på 2000-/3000-nivå, og sosialantropologi 10 sp valgfrie SOSANT-emner på 2000-nivå. Fordypningsløpet i sosialantropologi ble endret fra og med kullet 2026 (SOSANT2700 erstatter SOSANT2000).',
        obligatoriske: [
          {
            emnekode: 'UTV1000', emnenavn: 'Innføring i utviklingsstudier og bærekraft', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['UTV1000-1'],
            years: [
              { year: 2021, A: 11, B: 21, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 4.02, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 7, B: 18, C: 17, D: 4, E: 0, F: 0, G: 0, H: 0, total: 46, snitt: 3.61, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 6, B: 13, C: 18, D: 5, E: 0, F: 3, G: 0, H: 0, total: 45, snitt: 3.24, strykprosent: 6.7, bestattprosent: null },
              { year: 2024, A: 0, B: 15, C: 22, D: 11, E: 0, F: 0, G: 0, H: 0, total: 48, snitt: 3.08, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 6, B: 15, C: 16, D: 5, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 3.52, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'SGO2500', emnenavn: 'North/South Development: Energy transitions', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SGO2500-1'],
            years: [
              { year: 2021, A: 5, B: 10, C: 16, D: 8, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.31, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 7, B: 11, C: 15, D: 11, E: 0, F: 0, G: 0, H: 0, total: 44, snitt: 3.32, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 3, B: 8, C: 19, D: 10, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 3.1, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 14, C: 29, D: 8, E: 0, F: 0, G: 0, H: 0, total: 54, snitt: 3.22, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 19, C: 19, D: 3, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.39, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'SVEXFAC03', emnenavn: 'Examen facultatum, samfunnsvitenskapelig variant', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SVEXFAC03-1'],
            years: [
              { year: 2021, A: 5, B: 10, C: 13, D: 4, E: 0, F: 6, G: 0, H: 0, total: 38, snitt: 2.95, strykprosent: 15.8, bestattprosent: null },
              { year: 2022, A: 0, B: 7, C: 16, D: 6, E: 5, F: 7, G: 0, H: 0, total: 41, snitt: 2.27, strykprosent: 17.1, bestattprosent: null },
              { year: 2023, A: 3, B: 8, C: 12, D: 11, E: 3, F: 5, G: 0, H: 0, total: 42, snitt: 2.57, strykprosent: 11.9, bestattprosent: null },
              { year: 2024, A: 0, B: 11, C: 18, D: 13, E: 0, F: 3, G: 0, H: 0, total: 45, snitt: 2.76, strykprosent: 6.7, bestattprosent: null },
              { year: 2025, A: 3, B: 10, C: 22, D: 0, E: 0, F: 4, G: 0, H: 0, total: 39, snitt: 3.1, strykprosent: 10.3, bestattprosent: null },
            ],
          },
          {
            emnekode: 'STV1300', emnenavn: 'Comparative Politics', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['STV1300-1'],
            years: [
              { year: 2021, A: 7, B: 11, C: 22, D: 8, E: 4, F: 0, G: 0, H: 0, total: 52, snitt: 3.17, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 6, C: 16, D: 10, E: 3, F: 0, G: 0, H: 0, total: 35, snitt: 2.71, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 13, C: 16, D: 5, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.24, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 11, C: 13, D: 10, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.19, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 4, C: 18, D: 15, E: 3, F: 0, G: 0, H: 0, total: 43, snitt: 2.74, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECON1910', emnenavn: 'Poverty and Distribution in Developing Countries', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['ECON1910-1'],
            years: [
              { year: 2021, A: 13, B: 15, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 4.05, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 15, B: 15, C: 3, D: 0, E: 3, F: 0, G: 0, H: 0, total: 36, snitt: 4.08, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 3, B: 16, C: 8, D: 5, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.53, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 16, C: 6, D: 6, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.61, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 10, B: 17, C: 11, D: 8, E: 0, F: 0, G: 0, H: 0, total: 46, snitt: 3.63, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'SOSANT2530', emnenavn: 'Development', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['SOSANT2530-1'],
            years: [
              { year: 2021, A: 9, B: 15, C: 9, D: 6, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.69, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 12, C: 13, D: 10, E: 3, F: 3, G: 0, H: 0, total: 41, snitt: 2.68, strykprosent: 7.3, bestattprosent: null },
              { year: 2023, A: 0, B: 16, C: 19, D: 4, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.31, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 16, C: 15, D: 3, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.51, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 11, C: 14, D: 9, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.31, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UTV2001', emnenavn: 'Utvikling og bærekraft i praksis', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['UTV2001-1'], merknad: 'Het UTV2000 for kull 2020-2021; begge koder finnes i DBH',
            years: [
              { year: 2023, A: 3, B: 9, C: 17, D: 4, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.33, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 10, C: 14, D: 5, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.39, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 13, C: 14, D: 7, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.41, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EXPHIL03', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['EXPHIL03-1'], merknad: 'Ligger i 4. semester i fordypningene sosialantropologi og statsvitenskap',
            years: [
              { year: 2021, A: 0, B: 10, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.62, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 16, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.84, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 11, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.88, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 8, B: 15, C: 13, D: 3, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.72, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.17, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UTV3091', emnenavn: 'Avslutningsemne i utviklingsstudier og bærekraft', studiepoeng: 30, aar: 3, semester: 'vår',
            dbhEmnekoder: ['UTV3091-1'], merknad: 'Fyller hele 6. semester',
            years: [
              { year: 2021, A: 6, B: 20, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.97, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 13, B: 9, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4.25, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 9, B: 13, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.94, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 7, B: 8, C: 12, D: 3, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.63, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 13, B: 10, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 4.06, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Samfunnsgeografi', obligatoriske: [
            {
              emnekode: 'SGO1001', emnenavn: 'Innføring i samfunnsgeografi', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: ['SGO1001-1'],
              years: [
                { year: 2021, A: 0, B: 8, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.57, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 3, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 3, B: 5, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'SGO2400', emnenavn: 'Politisk geografi', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: ['SGO2400-1'], merknad: 'Velg mellom SGO2400 og SGO2200 Economic geography: Globalisation and regional development (SGO2200-1)',
              years: [
                { year: 2021, A: 7, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.64, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 3, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4.5, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'SOSGEO2302', emnenavn: 'Environment and Society', studiepoeng: 10, aar: 2, semester: 'vår',
              dbhEmnekoder: ['SOSGEO2302-1', 'SGO2302-1'], merknad: 'Emnet ligger i DBH både som SOSGEO2302 og som den eldre koden SGO2302',
              years: [
                { year: 2021, A: 4, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.92, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 0, B: 5, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.13, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 3, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 0, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.7, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'SGO2250', emnenavn: 'Sustainability Transitions, Innovation and Social Change', studiepoeng: 10, aar: 2, semester: 'vår',
              dbhEmnekoder: ['SGO2250-1', 'SGO3200-1'], merknad: 'SGO3200 er 3000-nivåvarianten av samme emne i DBH',
              years: [
                { year: 2023, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 4, B: 3, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'SOSGEO1120', emnenavn: 'Kvantitativ metode', studiepoeng: 10, aar: 2, semester: 'vår',
              dbhEmnekoder: ['SOSGEO1120-1'], merknad: 'Velg mellom SOSGEO1120 og SVMET1010 Kvalitative metoder; SVMET1010 har ingen karakterdata under dette programmet i DBH',
              years: [
                { year: 2021, A: 0, B: 3, C: 3, D: 5, E: 3, F: 0, G: 0, H: 0, total: 14, snitt: 2.43, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 0, B: 0, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.56, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 0, B: 0, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 2, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 3, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4.5, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 4, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.92, strykprosent: 0, bestattprosent: null },
              ],
            },
          ] },
          { navn: 'Samfunnsøkonomi', obligatoriske: [
            {
              emnekode: 'ECON1100', emnenavn: 'Matematikk I', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: ['ECON1100-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 3, G: 0, H: 0, total: 3, snitt: 0, strykprosent: 100, bestattprosent: null },
                { year: 2022, A: 0, B: 0, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 2.62, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 0, B: 0, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 2, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'ECON1210', emnenavn: 'Mikroøkonomi 1', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: ['ECON1210-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 4, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 5, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'ECON1310', emnenavn: 'Makroøkonomi 1', studiepoeng: 10, aar: 2, semester: 'vår',
              dbhEmnekoder: ['ECON1310-1'],
              years: [
                { year: 2023, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'ECON2130', emnenavn: 'Statistikk for økonomer', studiepoeng: 10, aar: 2, semester: 'vår',
              dbhEmnekoder: ['ECON2130-1'],
              years: [
                { year: 2022, A: 0, B: 3, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 0, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.5, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'ECON2220', emnenavn: 'Mikroøkonomi 2', studiepoeng: 10, aar: 2, semester: 'vår',
              dbhEmnekoder: ['ECON2220-1'],
              years: [
                { year: 2022, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'ECON2310', emnenavn: 'Makroøkonomi 2', studiepoeng: 10, aar: 3, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Ingen karakterdata på ECON2310 under dette programmet i DBH (koden finnes derimot under UiOs bachelor i internasjonale studier)',
              years: [],
            },
          ] },
          { navn: 'Sosialantropologi', obligatoriske: [
            {
              emnekode: 'SOSANT1000', emnenavn: 'Innføring i sosialantropologi', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: ['SOSANT1000-1'],
              years: [
                { year: 2021, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'SOSANT1050', emnenavn: 'Etnografisk metode', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: ['SOSANT1050-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 2.57, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 3, H: 0, total: 3, snitt: null, strykprosent: null, bestattprosent: 100 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 3, H: 0, total: 3, snitt: null, strykprosent: null, bestattprosent: 100 },
              ],
            },
            {
              emnekode: 'SOSANT1200', emnenavn: 'Politikk, makt og ulikhet', studiepoeng: 10, aar: 2, semester: 'vår',
              dbhEmnekoder: ['SOSANT1200-1'], merknad: 'Het tidligere Politisk antropologi',
              years: [
                { year: 2022, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'SOSANT2700', emnenavn: 'History and Theory of Anthropology', studiepoeng: 10, aar: 2, semester: 'vår',
              dbhEmnekoder: [], merknad: 'Nytt emne for kullet 2026; erstatter SOSANT2000 Central themes in contemporary anthropology (SOSANT2000-1), som gjaldt for kullet 2025. Ingen DBH-data ennå',
              years: [],
            },
            {
              emnekode: 'SOSANT2510', emnenavn: 'Environmental Anthropology', studiepoeng: 10, aar: 3, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Ingen karakterdata under dette programmet i DBH',
              years: [],
            },
          ] },
          { navn: 'Statsvitenskap', obligatoriske: [
            {
              emnekode: 'STV1200', emnenavn: 'Internasjonal politikk', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: ['STV1200-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 0, B: 5, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.38, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 7, B: 8, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 3, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.82, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 0, B: 7, C: 7, D: 7, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'STV1100', emnenavn: 'Politisk teori', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: ['STV1100-1', 'STV1400-1'], merknad: 'Velg ett av STV1100 Politisk teori og STV1400 Offentlig politikk og administrasjon',
              years: [
                { year: 2021, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 0, B: 4, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 7, B: 8, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.86, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 0, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 0, B: 6, C: 9, D: 8, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 2.91, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'STV1020', emnenavn: 'Politisk analyse 2: Forskningsdesign og kvantitative metoder', studiepoeng: 10, aar: 2, semester: 'vår',
              dbhEmnekoder: ['STV1020-1'],
              years: [
                { year: 2021, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 0, B: 4, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.14, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 3, B: 7, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.68, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 0, B: 6, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.2, strykprosent: 0, bestattprosent: null },
              ],
            },
          ] },
        ],
      },
      {
        entryId: 'oslomet_utviklingsstudier', shortName: 'OsloMet', institusjon: 'OsloMet - storbyuniversitetet', isNmbu: false, programnavn: 'Utviklingsstudier, bachelor',
        studieplanAar: '2025/2026', kilder: ['https://www.oslomet.no/studier/lui/utviklingsstudier', 'https://student.oslomet.no/studier/-/studieinfo/programplan/UTVBA/2025/H%C3%98ST', 'https://student.oslomet.no/studier/-/studieinfo/programplan/UTVBA/2026/H%C3%98ST'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 150,
        merknad: 'OsloMets programplan er nesten helt bundet: alle 180 studiepoengene er definerte emner, og det finnes ingen frie valgemner. 150 sp er felles obligatoriske emner; i 6. semester velger studenten mellom to løp på 30 sp (teorivarianten UTVB3300 eller det hospiteringsbaserte løpet UTVB3901), og begge inneholder en individuell bacheloroppgave. Fjerde og femte semester kan erstattes av utveksling (inntil 60 sp fra annen institusjon), men tredje og sjette semester må tas ved OsloMet. Programplanen for kullet 2026 er identisk med 2025. Alle ti felles obligatoriske emner og begge sjettesemester-emnene er koblet til DBH-koder.',
        obligatoriske: [
          {
            emnekode: 'UTVB1100', emnenavn: 'Introduksjon til utviklingsstudier', studiepoeng: 20, aar: 1, semester: 'høst',
            dbhEmnekoder: ['UTVB1100-1'],
            years: [
              { year: 2021, A: 5, B: 6, C: 13, D: 6, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.33, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 5, C: 19, D: 8, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 2.91, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 7, C: 19, D: 6, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.03, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 7, C: 12, D: 5, E: 0, F: 6, G: 0, H: 0, total: 30, snitt: 2.47, strykprosent: 20, bestattprosent: null },
              { year: 2025, A: 6, B: 4, C: 9, D: 12, E: 3, F: 9, G: 0, H: 0, total: 43, snitt: 2.33, strykprosent: 20.9, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UTVB1300', emnenavn: 'Innføring i metoder og vitenskapsteori', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['UTVB1300-1'],
            years: [
              { year: 2021, A: 3, B: 13, C: 25, D: 5, E: 0, F: 0, G: 0, H: 0, total: 46, snitt: 3.3, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 8, C: 7, D: 7, E: 0, F: 4, G: 0, H: 0, total: 26, snitt: 2.58, strykprosent: 15.4, bestattprosent: null },
              { year: 2023, A: 0, B: 12, C: 15, D: 5, E: 0, F: 19, G: 0, H: 0, total: 51, snitt: 2.02, strykprosent: 37.3, bestattprosent: null },
              { year: 2024, A: 3, B: 14, C: 25, D: 17, E: 3, F: 15, G: 0, H: 0, total: 77, snitt: 2.38, strykprosent: 19.5, bestattprosent: null },
              { year: 2025, A: 5, B: 12, C: 8, D: 4, E: 0, F: 13, G: 0, H: 0, total: 42, snitt: 2.5, strykprosent: 31, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UTVB1200', emnenavn: 'Regionalkunnskap og globalhistorie', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['UTVB1200-1'],
            years: [
              { year: 2021, A: 4, B: 9, C: 12, D: 5, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.4, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 11, B: 12, C: 8, D: 5, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 3.81, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 9, B: 8, C: 13, D: 4, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.65, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 12, B: 7, C: 7, D: 5, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.84, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UTVB1400', emnenavn: 'Feltarbeid i utviklingsstudier', studiepoeng: 20, aar: 1, semester: 'vår',
            dbhEmnekoder: ['UTVB1400-1'],
            years: [
              { year: 2021, A: 12, B: 12, C: 18, D: 3, E: 0, F: 0, G: 0, H: 0, total: 45, snitt: 3.73, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 12, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.66, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 20, C: 11, D: 0, E: 3, F: 0, G: 0, H: 0, total: 34, snitt: 3.41, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 14, C: 14, D: 6, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.24, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 31, H: 4, total: 35, snitt: null, strykprosent: null, bestattprosent: 88.6 },
            ],
          },
          {
            emnekode: 'UTVB2000', emnenavn: 'Makt og politikk', studiepoeng: 30, aar: 2, semester: 'høst',
            dbhEmnekoder: ['UTVB2000-1'],
            years: [
              { year: 2021, A: 7, B: 11, C: 22, D: 5, E: 0, F: 0, G: 0, H: 0, total: 45, snitt: 3.44, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 18, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.72, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 3, B: 15, C: 15, D: 4, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.46, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 16, C: 13, D: 9, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.32, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 15, C: 11, D: 9, E: 0, F: 3, G: 0, H: 0, total: 43, snitt: 3.16, strykprosent: 7, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UTVB2100', emnenavn: 'Utvikling og migrasjon', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['UTVB2100-1'], merknad: 'Undervises på engelsk (Development and Migration)',
            years: [
              { year: 2021, A: 6, B: 11, C: 15, D: 6, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 3.45, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 5, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.36, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 4, C: 6, D: 3, E: 4, F: 0, G: 0, H: 0, total: 20, snitt: 2.95, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 5, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.55, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UTVB2400', emnenavn: 'Medier og utvikling', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['UTVB2400-1'], merknad: 'Undervises på engelsk (Media and Development)',
            years: [
              { year: 2021, A: 11, B: 9, C: 13, D: 3, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 3.78, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 5, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.76, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 5, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.44, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 6, B: 5, C: 4, D: 4, E: 3, F: 3, G: 0, H: 0, total: 25, snitt: 2.92, strykprosent: 12, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UTVB2500', emnenavn: 'Veivalg for bærekraftig utvikling', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['UTVB2500-1'], merknad: 'Undervises på engelsk (Choices of Sustainability Transitions)',
            years: [
              { year: 2025, A: 0, B: 13, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.62, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UTVB2210', emnenavn: 'Education and Religion in Development', studiepoeng: 15, aar: 3, semester: 'høst',
            dbhEmnekoder: ['UTVB2210-1', 'UTVB2200-1'], merknad: 'UTVB2200 er den eldre 10 sp-varianten av samme emne i DBH',
            years: [
              { year: 2021, A: 10, B: 12, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 3.78, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 8, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 3, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.33, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 7, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.6, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 8, B: 7, C: 10, D: 4, E: 0, F: 3, G: 0, H: 0, total: 32, snitt: 3.31, strykprosent: 9.4, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UTVB3003', emnenavn: 'En introduksjon til utviklingsindustrien', studiepoeng: 15, aar: 3, semester: 'høst',
            dbhEmnekoder: ['UTVB3003-1', 'UTVB3002-1'], merknad: 'UTVB3002 er den eldre 10 sp-varianten av samme emne i DBH',
            years: [
              { year: 2021, A: 5, B: 11, C: 15, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.68, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 9, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.75, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 13, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.38, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 8, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.06, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 7, B: 11, C: 15, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.76, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Teorivariant (6. semester)', obligatoriske: [
            {
              emnekode: 'UTVB3300', emnenavn: 'Teorier om utvikling, globalisering og sosial endring', studiepoeng: 30, aar: 3, semester: 'vår',
              dbhEmnekoder: ['UTVB3300-1'], merknad: 'Inkluderer individuell bacheloroppgave',
              years: [
                { year: 2021, A: 4, B: 15, C: 8, D: 0, E: 0, F: 4, G: 0, H: 0, total: 31, snitt: 3.35, strykprosent: 12.9, bestattprosent: null },
                { year: 2022, A: 4, B: 5, C: 16, D: 3, E: 0, F: 3, G: 0, H: 0, total: 31, snitt: 3.03, strykprosent: 9.7, bestattprosent: null },
                { year: 2023, A: 7, B: 11, C: 19, D: 3, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 3.55, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 3, B: 8, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.7, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 5, B: 14, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.92, strykprosent: 0, bestattprosent: null },
              ],
            },
          ] },
          { navn: 'Hospiteringsvariant (6. semester)', obligatoriske: [
            {
              emnekode: 'UTVB3901', emnenavn: 'Hospitering i utviklingsindustrien - med bacheloroppgave', studiepoeng: 30, aar: 3, semester: 'vår',
              dbhEmnekoder: ['UTVB3901-1'], merknad: 'Begrenset antall plasser; krever bestått UTVB3002/UTVB3003',
              years: [
                { year: 2021, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 4, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 5, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 3, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.43, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 3, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.43, strykprosent: 0, bestattprosent: null },
              ],
            },
          ] },
        ],
      },
      {
        entryId: 'uia_globale_utviklingsstudier', shortName: 'UiA', institusjon: 'Universitetet i Agder', isNmbu: false, programnavn: 'Globale utviklingsstudier, bachelor',
        studieplanAar: '2026/2027', kilder: ['https://www.uia.no/studier/program/globale-utviklingsstudier-bachelor/', 'https://www.uia.no/studier/program/globale-utviklingsstudier-bachelor/studieplaner/2026h.html', 'https://www.uia.no/studier/program/globale-utviklingsstudier-bachelor/studieplaner/2025h.html'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 140,
        merknad: 'Studieplanen for kullet 2026-2029 er identisk med 2025-2028. 140 av 180 studiepoeng er obligatoriske. De resterende 40 sp er en «minor»/breddeenhet: 10 sp i 3. semester og hele 4. semester (30 sp). Studenten velger mellom utveksling eller en av breddeenhetene engelsk, Communication and Media, Gender, Power and Diversity, Political Science, Study of Religions in Asia, Sociology, spansk eller Sustainable Transformation. Disse er valgfrie pakker og er derfor ikke ført opp som spesialiseringer med obligatoriske emner. Både examen facultatum (EX-104) og examen philosophicum (EX-112) er obligatoriske. Alle 13 obligatoriske emner er koblet til DBH-koder.',
        obligatoriske: [
          {
            emnekode: 'EX-104', emnenavn: 'Examen facultatum - social science theory', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EX-104-1'],
            years: [
              { year: 2021, A: 10, B: 13, C: 17, D: 7, E: 0, F: 3, G: 0, H: 0, total: 50, snitt: 3.34, strykprosent: 6, bestattprosent: null },
              { year: 2022, A: 12, B: 13, C: 13, D: 8, E: 5, F: 4, G: 0, H: 0, total: 55, snitt: 3.13, strykprosent: 7.3, bestattprosent: null },
              { year: 2023, A: 14, B: 13, C: 15, D: 7, E: 0, F: 4, G: 0, H: 0, total: 53, snitt: 3.42, strykprosent: 7.5, bestattprosent: null },
              { year: 2024, A: 14, B: 15, C: 13, D: 13, E: 0, F: 6, G: 0, H: 0, total: 61, snitt: 3.2, strykprosent: 9.8, bestattprosent: null },
              { year: 2025, A: 7, B: 9, C: 19, D: 10, E: 4, F: 0, G: 0, H: 0, total: 49, snitt: 3.1, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UT-113', emnenavn: 'Introduction to Global Development Studies', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['UT-113-2'],
            years: [
              { year: 2021, A: 4, B: 7, C: 23, D: 12, E: 0, F: 0, G: 0, H: 0, total: 46, snitt: 3.07, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 11, C: 16, D: 15, E: 5, F: 0, G: 0, H: 0, total: 52, snitt: 2.92, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 6, B: 9, C: 22, D: 8, E: 0, F: 0, G: 0, H: 0, total: 45, snitt: 3.29, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 15, B: 27, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 55, snitt: 3.98, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 13, C: 16, D: 11, E: 6, F: 3, G: 0, H: 0, total: 52, snitt: 2.75, strykprosent: 5.8, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UT-114', emnenavn: 'Culture and development', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['UT-114-1'],
            years: [
              { year: 2021, A: 8, B: 17, C: 12, D: 8, E: 0, F: 0, G: 0, H: 0, total: 45, snitt: 3.56, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 9, B: 19, C: 18, D: 5, E: 0, F: 5, G: 0, H: 0, total: 56, snitt: 3.3, strykprosent: 8.9, bestattprosent: null },
              { year: 2023, A: 7, B: 11, C: 20, D: 3, E: 4, F: 0, G: 0, H: 0, total: 45, snitt: 3.31, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 9, B: 21, C: 13, D: 13, E: 0, F: 0, G: 0, H: 0, total: 56, snitt: 3.46, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 10, B: 16, C: 13, D: 12, E: 0, F: 0, G: 0, H: 0, total: 51, snitt: 3.47, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UT-101', emnenavn: 'Global Political Economy', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['UT-101-3'],
            years: [
              { year: 2021, A: 4, B: 6, C: 18, D: 3, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.35, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 14, C: 21, D: 0, E: 3, F: 0, G: 0, H: 0, total: 42, snitt: 3.38, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 3, B: 21, C: 20, D: 6, E: 0, F: 0, G: 0, H: 0, total: 50, snitt: 3.42, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 10, C: 20, D: 10, E: 0, F: 0, G: 0, H: 0, total: 43, snitt: 3.14, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 16, C: 19, D: 15, E: 0, F: 0, G: 0, H: 0, total: 50, snitt: 3.02, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UT-107', emnenavn: 'Power, resistance and development', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['UT-107-4'], merknad: 'Norsk tittel: Makt, motstand og utvikling',
            years: [
              { year: 2021, A: 4, B: 10, C: 11, D: 8, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.3, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 11, B: 19, C: 11, D: 3, E: 0, F: 0, G: 0, H: 0, total: 44, snitt: 3.86, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 14, B: 15, C: 17, D: 6, E: 0, F: 0, G: 0, H: 0, total: 52, snitt: 3.71, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 10, B: 15, C: 12, D: 5, E: 3, F: 0, G: 0, H: 0, total: 45, snitt: 3.53, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 34, B: 8, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 53, snitt: 4.36, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UT-109', emnenavn: 'Field Course', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['UT-109-2'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 30, H: 0, total: 30, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 47, H: 0, total: 47, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 44, H: 0, total: 44, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 42, H: 0, total: 42, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 51, H: 0, total: 51, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'EX-112', emnenavn: 'Exam Philosophicum (English)', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['EX-112-1'],
            years: [
              { year: 2021, A: 0, B: 6, C: 10, D: 5, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.05, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 7, D: 9, E: 6, F: 6, G: 0, H: 0, total: 28, snitt: 1.61, strykprosent: 21.4, bestattprosent: null },
              { year: 2023, A: 4, B: 9, C: 8, D: 16, E: 0, F: 11, G: 0, H: 0, total: 48, snitt: 2.33, strykprosent: 22.9, bestattprosent: null },
              { year: 2024, A: 0, B: 15, C: 20, D: 7, E: 6, F: 4, G: 0, H: 0, total: 52, snitt: 2.69, strykprosent: 7.7, bestattprosent: null },
              { year: 2025, A: 0, B: 8, C: 14, D: 6, E: 3, F: 3, G: 0, H: 0, total: 34, snitt: 2.62, strykprosent: 8.8, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UT-204', emnenavn: 'The political ecology of global environmental challenges', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['UT-204-2'],
            years: [
              { year: 2021, A: 0, B: 8, C: 5, D: 0, E: 0, F: 3, G: 0, H: 0, total: 16, snitt: 2.94, strykprosent: 18.8, bestattprosent: null },
              { year: 2022, A: 10, B: 12, C: 16, D: 4, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 3.67, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 8, B: 12, C: 20, D: 7, E: 0, F: 0, G: 0, H: 0, total: 47, snitt: 3.45, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 6, B: 17, C: 19, D: 3, E: 0, F: 0, G: 0, H: 0, total: 45, snitt: 3.58, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 29, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 3.93, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ME-107', emnenavn: 'Research Methods', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['ME-107-1'],
            years: [
              { year: 2021, A: 5, B: 10, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.83, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 5, C: 7, D: 6, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.46, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 7, B: 8, C: 17, D: 0, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.69, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 22, C: 15, D: 0, E: 0, F: 3, G: 0, H: 0, total: 44, snitt: 3.48, strykprosent: 6.8, bestattprosent: null },
              { year: 2025, A: 15, B: 31, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 46, snitt: 4.33, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UT-203', emnenavn: 'Global Development and Regional Analysis', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['UT-203-1'],
            years: [
              { year: 2021, A: 7, B: 11, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.96, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 7, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.73, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 8, B: 11, C: 8, D: 5, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.69, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 10, B: 16, C: 16, D: 0, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 3.86, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 15, C: 13, D: 8, E: 5, F: 3, G: 0, H: 0, total: 48, snitt: 2.92, strykprosent: 6.2, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UT-300', emnenavn: 'Critical Perspectives and Current Debates in Global Development', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['UT-300-1'],
            years: [
              { year: 2021, A: 11, B: 8, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.25, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 12, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.57, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 18, B: 10, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 4.31, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 14, B: 16, C: 16, D: 0, E: 0, F: 0, G: 0, H: 0, total: 46, snitt: 3.96, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 21, B: 15, C: 11, D: 4, E: 0, F: 0, G: 0, H: 0, total: 51, snitt: 4.04, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'UT-200', emnenavn: 'Field Work', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['UT-200-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 0, total: 35, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 44, H: 0, total: 44, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'UT-201', emnenavn: 'Bachelor\'s Thesis in Global Development Studies', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['UT-201-2'],
            years: [
              { year: 2021, A: 3, B: 11, C: 4, D: 7, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.4, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 7, C: 9, D: 0, E: 0, F: 3, G: 0, H: 0, total: 22, snitt: 3.18, strykprosent: 13.6, bestattprosent: null },
              { year: 2023, A: 5, B: 4, C: 5, D: 6, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.4, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 6, B: 10, C: 15, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.71, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 10, B: 14, C: 12, D: 4, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 3.75, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uio_internasjonale_studier', shortName: 'UiO (int.stud.)', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Internasjonale studier',
        studieplanAar: '2026/2027', kilder: ['https://www.uio.no/studier/program/internasjonale-studier/', 'https://www.uio.no/studier/program/internasjonale-studier/oppbygging/', 'https://www.uio.no/studier/program/internasjonale-studier/oppbygging/anbefaltlop_historie.html', 'https://www.uio.no/studier/program/internasjonale-studier/oppbygging/anbefalt_lop_jus.html', 'https://www.uio.no/studier/program/internasjonale-studier/oppbygging/anbefalt_lop_statsvit.html', 'https://www.uio.no/studier/program/internasjonale-studier/oppbygging/anbefaltlop_samfok.html'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 110,
        merknad: 'Programmet består av fellesemner (110 sp) og fordypning/frie emner (70 sp). Alle studenter må velge én av fire fordypninger: historie, jus, statsvitenskap eller samfunnsøkonomi. Ett av de 110 fellespoengene er et «valgfritt historie-emne» uten fast emnekode, og ett er et valg mellom fire IP-emner på STV 2000-nivå - disse er ført opp med henholdsvis tom kobling og fire alternative DBH-koder. Fordypningene i statsvitenskap og historie har i tillegg 30 sp valgfrie fordypningsemner (STV 2000-nivå innen politisk teori, komparativ politikk og offentlig politikk / HIS 2000-nivå) og 30 sp frie emner; fordypningen i jus krever seks juridiske emner (60 sp), hvorav minst tre fra listen over INTER-relevante JUR-emner; fordypningen i samfunnsøkonomi krever i tillegg ett valgfritt ECON-emne. Disse valgene har ingen faste emnekoder og er derfor ikke ført opp. År/semester for fordypningsemnene følger det anbefalte løpet; UiO publiserer egne tabeller for studenter med og uten utveksling, og plasseringen kan variere mellom dem.',
        obligatoriske: [
          {
            emnekode: 'INTER1000', emnenavn: 'Innføringsemne i internasjonale studier', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['INTER1000-1'],
            years: [
              { year: 2021, A: 5, B: 23, C: 29, D: 0, E: 0, F: 0, G: 0, H: 0, total: 57, snitt: 3.58, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 16, C: 21, D: 3, E: 0, F: 0, G: 0, H: 0, total: 45, snitt: 3.51, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 7, B: 29, C: 33, D: 7, E: 0, F: 0, G: 0, H: 0, total: 76, snitt: 3.47, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 6, B: 38, C: 29, D: 9, E: 0, F: 0, G: 0, H: 0, total: 82, snitt: 3.5, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 9, B: 26, C: 24, D: 3, E: 0, F: 0, G: 0, H: 0, total: 62, snitt: 3.66, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'STV1200', emnenavn: 'Internasjonal politikk', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['STV1200-1'],
            years: [
              { year: 2021, A: 12, B: 26, C: 20, D: 3, E: 0, F: 0, G: 0, H: 0, total: 61, snitt: 3.77, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 23, C: 15, D: 5, E: 0, F: 0, G: 0, H: 0, total: 49, snitt: 3.61, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 23, B: 27, C: 25, D: 4, E: 0, F: 0, G: 0, H: 0, total: 79, snitt: 3.87, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 17, B: 27, C: 27, D: 7, E: 0, F: 0, G: 0, H: 0, total: 78, snitt: 3.69, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 10, B: 28, C: 22, D: 5, E: 4, F: 0, G: 0, H: 0, total: 69, snitt: 3.51, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EXPHIL03', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EXPHIL03-1'],
            years: [
              { year: 2021, A: 13, B: 17, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 44, snitt: 3.98, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 8, B: 20, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 3.9, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 12, B: 27, C: 14, D: 5, E: 0, F: 0, G: 0, H: 0, total: 58, snitt: 3.79, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 18, B: 26, C: 17, D: 5, E: 0, F: 0, G: 0, H: 0, total: 66, snitt: 3.86, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 14, B: 23, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 50, snitt: 4.02, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'HIS1410INTER', emnenavn: 'Nyere historie fra ca. 1800 til vår tid for Internasjonale studier', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['HIS1410INTER-1'],
            years: [
              { year: 2021, A: 17, B: 35, C: 22, D: 0, E: 0, F: 0, G: 0, H: 0, total: 74, snitt: 3.93, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 7, B: 16, C: 19, D: 9, E: 3, F: 0, G: 0, H: 0, total: 54, snitt: 3.28, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 16, C: 19, D: 6, E: 3, F: 0, G: 0, H: 0, total: 48, snitt: 3.25, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 17, B: 38, C: 17, D: 0, E: 0, F: 0, G: 0, H: 0, total: 72, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 13, B: 27, C: 23, D: 10, E: 0, F: 0, G: 0, H: 0, total: 73, snitt: 3.59, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECON1410', emnenavn: 'Internasjonal økonomi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['ECON1410-1'],
            years: [
              { year: 2021, A: 14, B: 30, C: 24, D: 14, E: 0, F: 0, G: 0, H: 0, total: 82, snitt: 3.54, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 15, B: 22, C: 18, D: 5, E: 0, F: 0, G: 0, H: 0, total: 60, snitt: 3.78, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 12, B: 28, C: 6, D: 4, E: 0, F: 0, G: 0, H: 0, total: 50, snitt: 3.96, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 20, B: 23, C: 16, D: 3, E: 4, F: 0, G: 0, H: 0, total: 66, snitt: 3.79, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 21, B: 18, C: 24, D: 12, E: 0, F: 3, G: 0, H: 0, total: 78, snitt: 3.5, strykprosent: 3.8, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUROFF1410', emnenavn: 'Folkerett', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['JUROFF1410-1'],
            years: [
              { year: 2021, A: 15, B: 37, C: 28, D: 5, E: 0, F: 0, G: 0, H: 0, total: 85, snitt: 3.73, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 7, B: 34, C: 16, D: 4, E: 0, F: 0, G: 0, H: 0, total: 61, snitt: 3.72, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 7, B: 18, C: 20, D: 5, E: 4, F: 0, G: 0, H: 0, total: 54, snitt: 3.35, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 15, B: 32, C: 24, D: 6, E: 0, F: 0, G: 0, H: 0, total: 77, snitt: 3.73, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 85, H: 4, total: 89, snitt: null, strykprosent: null, bestattprosent: 95.5 },
            ],
          },
          {
            emnekode: 'INTER2000', emnenavn: 'Case Work in International Studies', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['INTER2000-1'], merknad: 'Ligger i 5. semester i det anbefalte løpet for fordypning i samfunnsøkonomi',
            years: [
              { year: 2021, A: 21, B: 35, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 56, snitt: 4.38, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 19, B: 32, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 54, snitt: 4.3, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 15, B: 25, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 4.38, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 36, B: 39, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 75, snitt: 4.48, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 42, B: 21, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 66, snitt: 4.59, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'SVEXFAC03', emnenavn: 'Examen facultatum, samfunnsvitenskapelig variant', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['SVEXFAC03-1'], merknad: 'Tas i 3. eller 4. semester. Studenter med fordypning i jus tar JFEXFAC04 i stedet, og historiestudenter kan bytte til EXFAC03-HARK',
            years: [
              { year: 2021, A: 16, B: 14, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 4.05, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 12, B: 12, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.89, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 19, B: 10, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 4.29, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 12, B: 13, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 4.12, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 8, B: 14, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.77, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'STV2220', emnenavn: 'Internasjonal politisk økonomi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['STV2220-1', 'STV2230-1', 'STV2235-1', 'STV2250-1'], merknad: 'Ett IP-emne på 2000-nivå er obligatorisk: velg mellom STV2220, STV2230 International Security Policy, STV2235 Conflict and Human Rights in International Politics og STV2250 International Environmental and Resource Politics',
            years: [
              { year: 2021, A: 24, B: 25, C: 15, D: 0, E: 0, F: 0, G: 0, H: 0, total: 64, snitt: 4.14, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 17, B: 21, C: 20, D: 0, E: 0, F: 0, G: 0, H: 0, total: 58, snitt: 3.95, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 30, C: 19, D: 0, E: 0, F: 0, G: 0, H: 0, total: 53, snitt: 3.72, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 22, B: 26, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 56, snitt: 4.25, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 21, B: 27, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 52, snitt: 4.33, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'Valgfritt historie-emne', emnenavn: 'Valgfritt historie-emne på bachelornivå', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Programplanen krever ett historieemne, men angir ingen bestemt emnekode; kan ikke kobles til én DBH-kode',
            years: [],
          },
          {
            emnekode: 'INTER3090', emnenavn: 'Oppgaveemne i internasjonale studier', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['INTER3090-1'], merknad: 'Bacheloroppgaven',
            years: [
              { year: 2021, A: 15, B: 23, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 48, snitt: 4.1, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 16, B: 29, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 59, snitt: 4.03, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 25, B: 22, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 59, snitt: 4.22, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 11, B: 24, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 46, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 14, B: 24, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 45, snitt: 4.16, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Historie', obligatoriske: [
            {
              emnekode: 'HIS1210INTER', emnenavn: 'Eldre historie fram til ca. 1800 for Internasjonale studier', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: ['HIS1210INTER-1'],
              years: [
                { year: 2021, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 3, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.43, strykprosent: 0, bestattprosent: null },
              ],
            },
          ] },
          { navn: 'Jus', obligatoriske: [
            {
              emnekode: 'JFEXFAC04', emnenavn: 'Examen facultatum, rettsvitenskapelig variant', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: ['JFEXFAC04-1'], merknad: 'Erstatter SVEXFAC03 for denne fordypningen',
              years: [
                { year: 2021, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 0, B: 0, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.56, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'STV1020', emnenavn: 'Politisk analyse 2: Forskningsdesign og kvantitative metoder', studiepoeng: 10, aar: 2, semester: 'vår',
              dbhEmnekoder: ['STV1020-1', 'STV1010-1'], merknad: 'Velg mellom STV1020 og STV1010 Politisk analyse 1: Forskningsdesign og kvalitative metoder',
              years: [
                { year: 2021, A: 15, B: 24, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 48, snitt: 4.12, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 12, B: 23, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 47, snitt: 3.94, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 13, B: 11, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 4.03, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 8, B: 17, C: 7, D: 5, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.76, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 34, B: 14, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 54, snitt: 4.52, strykprosent: 0, bestattprosent: null },
              ],
            },
          ] },
          { navn: 'Statsvitenskap', obligatoriske: [
            {
              emnekode: 'STV1020', emnenavn: 'Politisk analyse 2: Forskningsdesign og kvantitative metoder', studiepoeng: 10, aar: 2, semester: 'vår',
              dbhEmnekoder: ['STV1020-1'], merknad: 'Obligatorisk metodeemne',
              years: [
                { year: 2021, A: 15, B: 24, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 48, snitt: 4.12, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 12, B: 23, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 47, snitt: 3.94, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 9, B: 11, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.9, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 8, B: 14, C: 7, D: 5, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.74, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 34, B: 14, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 54, snitt: 4.52, strykprosent: 0, bestattprosent: null },
              ],
            },
          ] },
          { navn: 'Samfunnsøkonomi', obligatoriske: [
            {
              emnekode: 'ECON1100', emnenavn: 'Matematikk I', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: ['ECON1100-1'],
              years: [
                { year: 2021, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 3, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.75, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 4, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 5, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'ECON1210', emnenavn: 'Mikroøkonomi 1', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: ['ECON1210-1'],
              years: [
                { year: 2021, A: 9, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.75, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'ECON1310', emnenavn: 'Makroøkonomi 1', studiepoeng: 10, aar: 2, semester: 'vår',
              dbhEmnekoder: ['ECON1310-1'],
              years: [
                { year: 2021, A: 5, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4.62, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 4, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.57, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 5, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 5, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'ECON2220', emnenavn: 'Mikroøkonomi 2', studiepoeng: 10, aar: 2, semester: 'vår',
              dbhEmnekoder: ['ECON2220-1'],
              years: [
                { year: 2021, A: 4, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 5, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 3, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'ECON2310', emnenavn: 'Makroøkonomi 2', studiepoeng: 10, aar: 3, semester: 'høst',
              dbhEmnekoder: ['ECON2310-1'],
              years: [
                { year: 2022, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'ECON2130', emnenavn: 'Statistikk for økonomer', studiepoeng: 10, aar: 3, semester: 'vår',
              dbhEmnekoder: ['ECON2130-1'],
              years: [
                { year: 2021, A: 3, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4.5, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null },
              ],
            },
          ] },
        ],
      },
      {
        entryId: 'inn_internasjonale_studier', shortName: 'INN', institusjon: 'Universitetet i Innlandet', isNmbu: false, programnavn: 'Internasjonale studier , bachelor',
        studieplanAar: '2026/2027', kilder: ['https://www.inn.no/studier/vare-studier/bachelor-i-internasjonale-studier/', 'https://studiekatalog.edutorium.no/inn/nb/program/BAINTHIS/'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 110,
        merknad: 'Studieplanen gjelder kullet med oppstart høst 2026 (BAINTHIS i INNs studiekatalog). 110 av 180 studiepoeng er obligatoriske, fordelt på 11 emner à 10 sp. Hele 4. semester (30 sp) er valgemner eller utveksling; i 5. semester er 20 sp valgfrie, og minst ett av valgemnene må være et metodeemne (INT2009 Kvalitative metoder eller INT2010 Samfunnsvitenskapelige metoder og statistikk); i 6. semester er 20 sp valgfrie i tillegg til bacheloroppgaven. Examen philosophicum (INT1009) er obligatorisk, mens examen facultatum (INT1016) bare er ett av mange valgemner i 5. semester og derfor ikke ført opp som obligatorisk. Programmet har hatt flere emnekodeskifter de siste årene (bl.a. INT2011/INT2002 -> INT2016 for bacheloroppgaven, og 15 sp-varianter som INT2012/INT2018 Global Justice). Alle 11 obligatoriske emner er koblet til DBH-koder.',
        obligatoriske: [
          {
            emnekode: 'INT1009', emnenavn: 'Examen philosophicum for internasjonale studier', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['INT1009-1'],
            years: [
              { year: 2021, A: 4, B: 9, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.54, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 3, C: 14, D: 6, E: 3, F: 0, G: 0, H: 0, total: 26, snitt: 2.65, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 6, C: 17, D: 9, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 3.14, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 20, C: 21, D: 3, E: 0, F: 0, G: 0, H: 0, total: 47, snitt: 3.49, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 10, C: 19, D: 21, E: 4, F: 0, G: 0, H: 0, total: 54, snitt: 2.65, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'INT1000', emnenavn: 'Internasjonale studier: en historisk innføring', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['INT1000-1'],
            years: [
              { year: 2024, A: 3, B: 7, C: 22, D: 10, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 3.07, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 4, C: 31, D: 13, E: 0, F: 5, G: 0, H: 0, total: 53, snitt: 2.55, strykprosent: 9.4, bestattprosent: null },
            ],
          },
          {
            emnekode: 'INT1018', emnenavn: 'Det korte tyvende århundre - politikk, økonomi, ideologi og sosiale endringer 1914-1989', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['INT1018-1'],
            years: [
              { year: 2024, A: 3, B: 9, C: 17, D: 9, E: 3, F: 3, G: 0, H: 0, total: 44, snitt: 2.8, strykprosent: 6.8, bestattprosent: null },
              { year: 2025, A: 0, B: 4, C: 25, D: 15, E: 8, F: 4, G: 0, H: 0, total: 56, snitt: 2.3, strykprosent: 7.1, bestattprosent: null },
            ],
          },
          {
            emnekode: 'INT1022', emnenavn: 'Global samtidshistorie: verden siden 1989', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['INT1022-1'],
            years: [
              { year: 2025, A: 3, B: 7, C: 7, D: 11, E: 12, F: 3, G: 0, H: 0, total: 43, snitt: 2.28, strykprosent: 7, bestattprosent: null },
            ],
          },
          {
            emnekode: 'INT1014', emnenavn: 'Politisk teori', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['INT1014-1'], merknad: 'Undervises på engelsk (Political Theory)',
            years: [
              { year: 2023, A: 5, B: 7, C: 7, D: 7, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.38, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 6, C: 18, D: 8, E: 5, F: 0, G: 0, H: 0, total: 37, snitt: 2.68, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 10, C: 23, D: 8, E: 3, F: 0, G: 0, H: 0, total: 44, snitt: 2.91, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'INT1015', emnenavn: 'Internasjonal politikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['INT1015-1'],
            years: [
              { year: 2023, A: 3, B: 8, C: 6, D: 8, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.24, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 9, B: 9, C: 17, D: 10, E: 4, F: 0, G: 0, H: 0, total: 49, snitt: 3.18, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 7, C: 10, D: 20, E: 4, F: 0, G: 0, H: 0, total: 41, snitt: 2.49, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'INT1017', emnenavn: 'Sammenlignende politikk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['INT1017-1'], merknad: 'DBH-navn: Comparative Politics',
            years: [
              { year: 2023, A: 7, B: 11, C: 15, D: 17, E: 4, F: 0, G: 0, H: 0, total: 54, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 6, B: 14, C: 22, D: 4, E: 0, F: 0, G: 0, H: 0, total: 46, snitt: 3.48, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 7, B: 12, C: 17, D: 11, E: 4, F: 0, G: 0, H: 0, total: 51, snitt: 3.14, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'INT1021', emnenavn: 'Sikkerhetspolitikk internasjonalt og i Norge - en teoretisk og historisk innføring', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['INT1021-1'],
            years: [
              { year: 2025, A: 3, B: 9, C: 21, D: 20, E: 6, F: 7, G: 0, H: 0, total: 66, snitt: 2.42, strykprosent: 10.6, bestattprosent: null },
            ],
          },
          {
            emnekode: 'INT2007', emnenavn: 'War and Peace', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['INT2007-1'],
            years: [
              { year: 2023, A: 8, B: 10, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4.13, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 11, B: 16, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 4.09, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 8, C: 13, D: 14, E: 4, F: 0, G: 0, H: 0, total: 43, snitt: 2.86, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'INT1019', emnenavn: 'Internasjonal politisk økonomi: teori og historie', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['INT1019-1'],
            years: [
              { year: 2024, A: 5, B: 5, C: 5, D: 6, E: 6, F: 0, G: 0, H: 0, total: 27, snitt: 2.89, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 3, C: 0, D: 5, E: 5, F: 4, G: 0, H: 0, total: 17, snitt: 1.59, strykprosent: 23.5, bestattprosent: null },
            ],
          },
          {
            emnekode: 'INT2016', emnenavn: 'Bacheloroppgave i internasjonale studier', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['INT2016-1'],
            years: [
              { year: 2025, A: 0, B: 5, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.07, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'nord_internasjonale_relasjoner_b', shortName: 'Nord', institusjon: 'Nord universitet', isNmbu: false, programnavn: 'Internasjonale relasjoner, bachelor',
        studieplanAar: '2026/2027', kilder: ['https://www.nord.no/studier/internasjonale-relasjoner-bachelor', 'https://www.nord.no/studier/studieplaner/internasjonale-relasjoner-baint-bachelor-host-2026', 'https://www.nord.no/studier/studieplaner/internasjonale-relasjoner-baint-bachelor-host-2025'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 150,
        merknad: 'Studieplanen for kullet høst 2026 er identisk med kullet høst 2025. 150 av 180 studiepoeng er obligatoriske; hele 5. semester (30 sp) er utveksling eller valgemner ved Nord. Både examen philosophicum (FIL1005) og examen facultatum (EXF1000) er obligatoriske, og bacheloroppgaven er obligatorisk i siste semester. Tre emnekoder i studieplanen mangler direkte motstykke i DBH-dataene fordi Nord har skiftet koder: PO111LS/PO112LS (DBH: PO111S/PO112S, samme navn og omfang), STA2008 (DBH: STA2004, samme navn, 20 sp i DBH) og STA2009 Bacheloroppgave (DBH: IN200S Bacheloroppgave, 10 sp i DBH). Disse er koblet til forgjengerkodene, med merknad på hvert emne. 14 av 14 obligatoriske emner har dermed en DBH-kobling, men fire av dem via forgjengerkode i stedet for eksakt kodetreff.',
        obligatoriske: [
          {
            emnekode: 'STA1006', emnenavn: 'Innføring i internasjonale relasjoner', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['STA1006-1'], merknad: 'DBH-navn: Innføring i internasjonale relasjoner som akademisk disiplin',
            years: [
              { year: 2023, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 7, B: 6, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.05, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.43, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'STA1007', emnenavn: 'Globale utfordringer og internasjonalt samarbeid', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['STA1007-1'],
            years: [
              { year: 2025, A: 4, B: 6, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.53, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PO114S', emnenavn: 'Komparativ politikk', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['PO114S-2'],
            years: [
              { year: 2021, A: 7, B: 7, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.05, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 4, C: 0, D: 7, E: 4, F: 0, G: 0, H: 0, total: 15, snitt: 2.27, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.14, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 11, B: 7, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.96, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PO112LS', emnenavn: 'Politiske ideologier', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['PO112S-3'], merknad: 'Studieplanen oppgir koden PO112LS; DBH registrerer emnet som PO112S med samme navn',
            years: [
              { year: 2021, A: 4, B: 6, C: 9, D: 4, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.43, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 4, C: 7, D: 8, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 2.79, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 0, C: 0, D: 0, E: 0, F: 3, G: 0, H: 0, total: 7, snitt: 2.86, strykprosent: 42.9, bestattprosent: null },
              { year: 2024, A: 0, B: 5, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.25, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 5, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.45, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PO111LS', emnenavn: 'Norsk politikk og Norge i verden', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['PO111S-2'], merknad: 'Studieplanen oppgir koden PO111LS; DBH registrerer emnet som PO111S med samme navn',
            years: [
              { year: 2021, A: 3, B: 7, C: 5, D: 4, E: 0, F: 3, G: 0, H: 0, total: 22, snitt: 3, strykprosent: 13.6, bestattprosent: null },
              { year: 2022, A: 0, B: 7, C: 6, D: 6, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.05, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 8, C: 6, D: 0, E: 3, F: 0, G: 0, H: 0, total: 17, snitt: 3.12, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'HIS1004', emnenavn: 'Moderne historie (1850-2020)', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['HIS1004-1'],
            years: [
              { year: 2024, A: 0, B: 0, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 2.5, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 7, B: 12, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.96, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'STA1004', emnenavn: 'Kina i internasjonal politikk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['STA1004-1'],
            years: [
              { year: 2022, A: 0, B: 7, C: 0, D: 0, E: 0, F: 3, G: 0, H: 0, total: 10, snitt: 2.8, strykprosent: 30, bestattprosent: null },
              { year: 2023, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 11, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.65, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'FIL1005', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['FIL1005-1'],
            years: [
              { year: 2023, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 6, C: 6, D: 4, E: 0, F: 4, G: 0, H: 0, total: 20, snitt: 2.5, strykprosent: 20, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EXF1000', emnenavn: 'Examen facultatum', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['EXF1000-1'],
            years: [
              { year: 2023, A: 0, B: 0, C: 4, D: 0, E: 0, F: 5, G: 0, H: 0, total: 9, snitt: 1.33, strykprosent: 55.6, bestattprosent: null },
              { year: 2024, A: 4, B: 3, C: 5, D: 5, E: 4, F: 0, G: 0, H: 0, total: 21, snitt: 2.9, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'STA2003', emnenavn: 'Internasjonal utvikling og bistandspolitikk', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['STA2003-1'],
            years: [
              { year: 2021, A: 6, B: 5, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.85, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 6, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.95, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 4, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.31, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 5, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ME118S', emnenavn: 'Innføring i samfunnsvitenskapelig metode', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['ME118S-1'],
            years: [
              { year: 2021, A: 0, B: 9, C: 10, D: 6, E: 10, F: 5, G: 0, H: 0, total: 40, snitt: 2.2, strykprosent: 12.5, bestattprosent: null },
              { year: 2022, A: 0, B: 3, C: 4, D: 6, E: 3, F: 5, G: 0, H: 0, total: 21, snitt: 1.86, strykprosent: 23.8, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 2.5, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 7, D: 3, E: 0, F: 3, G: 0, H: 0, total: 13, snitt: 2.08, strykprosent: 23.1, bestattprosent: null },
              { year: 2025, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'STA2008', emnenavn: 'Internasjonale konflikter og terrorisme', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['STA2004-1'], merknad: 'Ny kode og halvert omfang; DBH har karakterdata på forgjengeren STA2004 (20 sp) med identisk navn til og med 2025',
            years: [
              { year: 2021, A: 0, B: 9, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.64, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 7, B: 3, C: 9, D: 6, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.44, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 6, C: 3, D: 6, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 3, C: 6, D: 0, E: 0, F: 4, G: 0, H: 0, total: 13, snitt: 2.31, strykprosent: 30.8, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 3, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PO216S', emnenavn: 'Europeisk sikkerhetspolitikk', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['PO216S-1'], merknad: 'DBH-navn: Sikkerhetspolitikk',
            years: [
              { year: 2022, A: 7, B: 11, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 5, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.87, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 8, C: 9, D: 3, E: 4, F: 0, G: 0, H: 0, total: 24, snitt: 2.88, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 4, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.4, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'STA2009', emnenavn: 'Bacheloroppgave', studiepoeng: 20, aar: 3, semester: 'vår',
            dbhEmnekoder: ['IN200S-1'], merknad: 'Ny kode og utvidet omfang; DBH har karakterdata på forgjengeren IN200S Bacheloroppgave (10 sp) til og med 2025',
            years: [
              { year: 2021, A: 5, B: 7, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.78, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.33, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 6, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.07, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 3, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.75, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'eiendomsutvikling', label: 'Eiendomsutvikling', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_eiendomsutvikling', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Eiendomsutvikling (master 2 år)',
        studieplanAar: '2024/2025', kilder: ['https://www.nmbu.no/studier/master-2-aar/eiendomsutvikling', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2024-08/M-EUTV%20heltid%20-%20Studieplan%202024.pdf'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 120,
        merknad: 'Nyeste publiserte studieplan er PDF-en for oppstart høsten 2024 (redigert 22.08.2024); programsiden lenker ikke til noen 2025- eller 2026-versjon, og forsøk på tilsvarende filnavn for 2025/2026 gir 404. De obligatoriske emnene summerer seg til 120 sp, altså hele graden. Studieplanen viser i tillegg en 5 sp «mulig valgfag»-luke i 1. år høstparallell med JUS220 (Miljøforvaltningsrett), EIE280 (Land rights) og EIE222 (Verdsetting av fast eiendom) som aktuelle emner; semestersummene i matrisen (25/30/35/30 = 120) går ikke helt opp med denne luken, så valgfriheten er trolig en mulighet til å bytte ut eller supplere et emne. PRAK203 (Praksisbasert læring) og BUS133 finnes i DBH-tallene, men er valgfrie og ikke del av den obligatoriske kjernen.',
        obligatoriske: [
          {
            emnekode: 'EIE311', emnenavn: 'Eiendomsutvikling, kalkyle og verdsetting', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EIE311-1'],
            years: [
              { year: 2021, A: 0, B: 7, C: 8, D: 10, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 2.88, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 6, C: 8, D: 5, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.05, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 6, B: 6, C: 8, D: 10, E: 7, F: 8, G: 0, H: 0, total: 45, snitt: 2.33, strykprosent: 17.8, bestattprosent: null },
              { year: 2024, A: 0, B: 5, C: 5, D: 3, E: 4, F: 0, G: 0, H: 0, total: 17, snitt: 2.65, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 5, C: 9, D: 6, E: 4, F: 3, G: 0, H: 0, total: 27, snitt: 2.33, strykprosent: 11.1, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EIE310', emnenavn: 'Eiendomsmarked og analyse', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EIE310-1'],
            years: [
              { year: 2021, A: 6, B: 12, C: 4, D: 0, E: 0, F: 3, G: 0, H: 0, total: 25, snitt: 3.6, strykprosent: 12, bestattprosent: null },
              { year: 2022, A: 8, B: 15, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 4.15, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 14, B: 11, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 4.11, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 13, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.62, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 6, B: 8, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.74, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EIE306', emnenavn: 'Forhandlinger og konflikthåndtering', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EIE306-2'], merknad: 'EIE306-2 er 5 sp-versjonen. Den eldre 10 sp-versjonen EIE306-1 er ikke rapportert for dette programmet i DBH.',
            years: [
              { year: 2023, A: 0, B: 8, C: 11, D: 13, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 2.84, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 9, D: 7, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 2.56, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 5, C: 19, D: 6, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 2.97, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'APL350', emnenavn: 'Prosjektutvikling og prosjektgjennomføring', studiepoeng: 15, aar: 1, semester: 'vår',
            dbhEmnekoder: ['APL350-1'],
            years: [
              { year: 2021, A: 6, B: 10, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.05, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 7, B: 11, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4.14, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 12, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.88, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 10, B: 14, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 4.06, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 9, B: 3, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.11, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUS310', emnenavn: 'Rettigheter i fast eiendom', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['JUS310-1'],
            years: [
              { year: 2021, A: 4, B: 6, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.82, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 5, D: 6, E: 3, F: 0, G: 0, H: 0, total: 14, snitt: 2.14, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 4, C: 5, D: 6, E: 4, F: 3, G: 0, H: 0, total: 22, snitt: 2.14, strykprosent: 13.6, bestattprosent: null },
              { year: 2024, A: 0, B: 4, C: 6, D: 8, E: 6, F: 3, G: 0, H: 0, total: 27, snitt: 2.07, strykprosent: 11.1, bestattprosent: null },
              { year: 2025, A: 0, B: 5, C: 4, D: 7, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 2.88, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUS320', emnenavn: 'Plan- og bygningsrett I - planlegging og gjennomføringsvirkemidler', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['JUS320-1'],
            years: [
              { year: 2021, A: 0, B: 11, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.69, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 3, C: 6, D: 5, E: 6, F: 0, G: 0, H: 0, total: 20, snitt: 2.3, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 5, C: 8, D: 8, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 2.86, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 7, C: 10, D: 9, E: 4, F: 0, G: 0, H: 0, total: 33, snitt: 2.88, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 3, D: 3, E: 5, F: 0, G: 0, H: 0, total: 11, snitt: 1.82, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'MAST303', emnenavn: 'Planlegging av masteroppgaven ved Eiendom og Eiendomsutvikling', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MAST303-1'], merknad: 'Går over to semestre: 2,5 sp i 1. år vår og 2,5 sp i 2. år høst.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 33, H: 0, total: 33, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'LAA350', emnenavn: 'Prosjekter i byutvikling. Arkitektur, form og rom', studiepoeng: 20, aar: 2, semester: 'høst',
            dbhEmnekoder: ['LAA350-1'], merknad: 'LAA350-1 ligger i DBH-tallene for dette programmet.',
            years: [
              { year: 2021, A: 6, B: 8, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.05, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 8, B: 5, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.86, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 3, B: 17, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.96, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 17, B: 6, C: 7, D: 5, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 12, B: 0, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.33, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUS311', emnenavn: 'Overføring av fast eiendom', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['JUS311-1'],
            years: [
              { year: 2021, A: 3, B: 10, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.94, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 5, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.06, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 6, C: 5, D: 7, E: 3, F: 0, G: 0, H: 0, total: 21, snitt: 2.67, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 4, C: 6, D: 5, E: 0, F: 5, G: 0, H: 0, total: 23, snitt: 2.57, strykprosent: 21.7, bestattprosent: null },
              { year: 2025, A: 0, B: 4, C: 3, D: 0, E: 0, F: 3, G: 0, H: 0, total: 10, snitt: 2.5, strykprosent: 30, bestattprosent: null },
            ],
          },
          {
            emnekode: 'JUS321', emnenavn: 'Plan- og bygningsrett II - byggesak', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['JUS321-1'],
            years: [
              { year: 2021, A: 0, B: 7, C: 10, D: 5, E: 3, F: 4, G: 0, H: 0, total: 29, snitt: 2.45, strykprosent: 13.8, bestattprosent: null },
              { year: 2022, A: 0, B: 5, C: 10, D: 4, E: 0, F: 4, G: 0, H: 0, total: 23, snitt: 2.52, strykprosent: 17.4, bestattprosent: null },
              { year: 2023, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 4, C: 6, D: 7, E: 9, F: 6, G: 0, H: 0, total: 32, snitt: 1.78, strykprosent: 18.8, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 12, D: 4, E: 6, F: 0, G: 0, H: 0, total: 22, snitt: 2.27, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'M30-EUTV', emnenavn: 'Masteroppgave', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: ['M30-EUTV-1'],
            years: [
              { year: 2021, A: 16, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4.7, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 12, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.1, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 7, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.35, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 7, B: 9, C: 3, D: 3, E: 3, F: 0, G: 0, H: 0, total: 25, snitt: 3.56, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 6, B: 14, C: 11, D: 0, E: 3, F: 0, G: 0, H: 0, total: 34, snitt: 3.59, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_eiendomsutvikling', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Eiendomsutvikling og -forvaltning (master 2 år)',
        studieplanAar: '2025/2026', kilder: ['https://www.ntnu.no/studier/maeiendom', 'https://www.ntnu.no/studier/maeiendom/studiets-oppbygning', 'https://www.ntnu.no/studier/studieplan#programmeCode=MAEIENDOM&year=2025'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 105,
        merknad: 'Kilde er NTNUs studieplan for kull 2025 (1. år 2025–2026, 2. år 2026–2027). Av 120 sp er 105 obligatoriske: fire emner i 1. semester, tre i 2. semester (inkludert Eksperter i team), tre i 3. semester og masteroppgaven på 30 sp i 4. semester. Studenten velger selv ett valgbart emne på 7,5 sp i både 2. og 3. semester, til sammen 15 sp – anbefalte valgemner er blant annet AAR4215 Reguleringsplanlegging, TBA4155, TIØ4215, TIØ4252, TPK5100 og TEP4235. Eksperter i team er ført opp som ett obligatorisk emne fordi landsbyen velges fritt; de DBH-kodene som er listet, er EiT-landsbyene med registrerte kandidater fra programmet.',
        obligatoriske: [
          {
            emnekode: 'AAR4235', emnenavn: 'Eiendomsøkonomi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['AAR4235-1'],
            years: [
              { year: 2021, A: 4, B: 11, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.73, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 6, C: 9, D: 7, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.2, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 5, C: 8, D: 10, E: 5, F: 0, G: 0, H: 0, total: 28, snitt: 2.46, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 12, C: 7, D: 3, E: 3, F: 0, G: 0, H: 0, total: 25, snitt: 3.12, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 7, C: 16, D: 10, E: 4, F: 0, G: 0, H: 0, total: 37, snitt: 2.7, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'AAR4815', emnenavn: 'Plan og byggeprosess', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['AAR4815-1'],
            years: [
              { year: 2021, A: 4, B: 15, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.88, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 10, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.79, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 12, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.79, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 8, B: 10, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4.13, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 6, B: 15, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.71, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'AAR4827', emnenavn: 'Eiendomsforvaltning - Facility Management', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['AAR4827-1', 'AAR4821-1'], merknad: 'AAR4821-1 «Bærekraftig eiendomsforvaltning - FM» ligger også i DBH-tallene og er den eldre koden for emnet.',
            years: [
              { year: 2021, A: 8, B: 33, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 52, snitt: 3.94, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 16, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.86, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 7, B: 17, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 4.07, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 7, B: 12, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.93, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 9, B: 18, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 4, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'FP4100', emnenavn: 'Arkitektur og stedsforming', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['FP4100-1'],
            years: [
              { year: 2021, A: 0, B: 25, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 24, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.83, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 14, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.56, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 10, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.45, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 13, B: 20, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 4.28, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'HMS0005', emnenavn: 'HMS-kurs for studenter ved MAEIENDOM, MFYSPL og UEP', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0005-1'], merknad: '0 sp, men obligatorisk.',
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 44, H: 0, total: 44, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 0, total: 29, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'AAR4950', emnenavn: 'Programmering og evaluering av bygninger', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['AAR4950-1'],
            years: [
              { year: 2021, A: 9, B: 12, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4.2, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 7, B: 15, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 4.12, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 8, B: 18, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 4.17, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 7, B: 19, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 4.27, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 8, B: 17, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4.32, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'TBA4170', emnenavn: 'Transformasjon og ny bruk av eksisterende bygninger', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['TBA4170-1'],
            years: [
              { year: 2021, A: 21, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.88, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 8, B: 16, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 4.19, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 17, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 4.63, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 17, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 4.63, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 14, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.58, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EiT', emnenavn: 'Eksperter i team (landsby velges fritt)', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['TBA4856-1', 'TBA4859-1', 'TBA4860-1', 'TDT4857-1', 'TIØ4850-2'], merknad: 'Eksperter i team er obligatorisk for alle NTNU-studenter i 4. årskurs, men landsbyen velges fritt fra en lang liste. DBH-kodene her er de EiT-landsbyene som faktisk har kandidater fra dette programmet.',
            years: [
              { year: 2021, A: 4, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.36, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.57, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 6, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 5, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'AAR4828', emnenavn: 'Eiendomsutvikling', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['AAR4828-1'],
            years: [
              { year: 2021, A: 8, B: 17, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4.18, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 7, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.6, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 19, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.7, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 10, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.07, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'AAR4831', emnenavn: 'Bærekraft og muliggjørende teknologier', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['AAR4831-1'],
            years: [
              { year: 2023, A: 3, B: 6, C: 15, D: 3, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.33, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 11, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.95, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 11, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.21, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'AAR4874', emnenavn: 'Teori og metoder for masteroppgaver', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['AAR4874-1'],
            years: [
              { year: 2021, A: 0, B: 14, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.7, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 8, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.54, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 11, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.64, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 6, C: 16, D: 3, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.12, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 8, C: 11, D: 4, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.17, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'AAR4992', emnenavn: 'Masteroppgave i eiendomsutvikling og -forvaltning', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: ['AAR4992-1'],
            years: [
              { year: 2021, A: 6, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.43, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 9, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.5, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 6, C: 12, D: 4, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.09, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 5, C: 8, D: 6, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.38, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 11, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.58, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'folkehelse', label: 'Folkehelsevitenskap', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_folkehelse', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Folkehelsevitenskap (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/folkehelsevitenskap', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-08/FOL%20Studieplan%202026-27%20.pdf'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 80,
        merknad: 'Studieplanen for undervisningsåret 2026-27 (M-FOL). 80 av 120 studiepoeng er obligatoriske: fire felles emner på 300-nivå (50 sp) pluss masteroppgaven (30 sp). I tillegg må minst 25 sp velges blant betingede valgemner (FHV314, FHV310, FHV372, APL240, APL241, FMI312, FHV313, AOS339, EDS355), og 15 sp er helt frie emner, hvorav inntil 5 sp kan være på 100-nivå. Studiet tilbys også på deltid over fire år med samme krav. Tredje semester er tilrettelagt for utveksling. Alle fem obligatoriske emner er koblet til DBH-koder. Merk at AOS339 Strategisk ledelse erstatter AOS337 fra høsten 2026 blant valgemnene.',
        obligatoriske: [
          {
            emnekode: 'FHV330', emnenavn: 'Folkehelsevitenskap - innføringsemne', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['FHV330-1'],
            years: [
              { year: 2021, A: 5, B: 5, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.94, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 12, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.67, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 6, B: 7, C: 6, D: 5, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.58, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.36, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 8, B: 0, C: 9, D: 3, E: 0, F: 5, G: 0, H: 0, total: 25, snitt: 2.92, strykprosent: 20, bestattprosent: null },
            ],
          },
          {
            emnekode: 'FHV315', emnenavn: 'Vitenskapsteori og forskningsmetoder', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['FHV315-1'], merknad: 'Det gis ikke fritak på grunnlag av examen philosophicum eller examen facultatum',
            years: [
              { year: 2021, A: 0, B: 15, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.65, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 10, C: 11, D: 0, E: 0, F: 3, G: 0, H: 0, total: 24, snitt: 3.04, strykprosent: 12.5, bestattprosent: null },
              { year: 2023, A: 0, B: 8, C: 13, D: 3, E: 0, F: 5, G: 0, H: 0, total: 29, snitt: 2.66, strykprosent: 17.2, bestattprosent: null },
              { year: 2024, A: 0, B: 9, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.47, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 6, C: 6, D: 0, E: 0, F: 8, G: 0, H: 0, total: 20, snitt: 2.1, strykprosent: 40, bestattprosent: null },
            ],
          },
          {
            emnekode: 'FHV320', emnenavn: 'Epidemiologi og geografiske informasjonssystemer', studiepoeng: 15, aar: 1, semester: 'vår',
            dbhEmnekoder: ['FHV320-1'],
            years: [
              { year: 2021, A: 13, B: 10, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 4.38, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 7, B: 12, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4.05, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 7, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.64, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 5, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.59, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 8, B: 5, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.31, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'FHV353', emnenavn: 'Prosjektplan masteroppgave i folkehelsevitenskap', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['FHV353-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 3, total: 25, snitt: null, strykprosent: null, bestattprosent: 88 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'M30-FOL', emnenavn: 'Masteroppgave', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: ['M30-FOL-1'], merknad: 'Januarblokk + vårparallell. Deltidsstudenter tar emnet som M30-FOLDEL, som ikke har egne karakterdata i DBH',
            years: [
              { year: 2021, A: 3, B: 15, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.17, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 16, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.96, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 6, B: 10, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 10, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.06, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 3, B: 14, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.87, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_folkehelse', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Folkehelse (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.ntnu.no/studier/mfhls', 'https://www.ntnu.no/studier/mfhls/studiets-oppbygning', 'https://www.ntnu.no/studier/studieplan#programmeCode=MFHLS&year=2026'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 97.5,
        merknad: 'Studieplanen er hentet fra NTNUs studieplanverktøy for kullet 2026 (identisk med kullet 2025). Obligatorisk: fire emner i 1. semester (30 sp), to emner + ett av to metodeemner + Eksperter i team i 2. semester (30 sp), prosjektplan i 3. semester (7,5 sp) og masteroppgave i 4. semester (30 sp) - til sammen 97,5 sp. De resterende 22,5 sp er valgemner: to valgemner i 3. semester velges blant FH3001 Arbeid og helse, FH3008 Helseøkonomi og folkehelse, FH3009 Aldring og folkehelse og SYT3411 Folkehelse - barn og unge. MERK avvik i kildene: teksten under «studiets oppbygning» på ntnu.no omtaler en masteroppgave på 45 sp, mens studieplantabellen for kull 2025 og 2026 viser FH3902 på 30 sp. Vi har fulgt studieplantabellen. Det finnes også deltidsløp med masteroppgave på henholdsvis 45 og 30 sp. Summen av emnene i studieplantabellen er 112,5 sp (97,5 obligatorisk + 15 sp valgemner), så 7,5 sp i 3. semester er ikke spesifisert i tabellen. Tre obligatoriske elementer mangler DBH-kobling: SYT3408, FH3902 (DBH har forgjengeren FH3901, 45 sp) og Eksperter i team (varierende emnekode).',
        obligatoriske: [
          {
            emnekode: 'FH3012', emnenavn: 'Folkehelse 1 - en innføring i folkehelse', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['FH3012-1'],
            years: [
              { year: 2024, A: 0, B: 11, C: 13, D: 3, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.3, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 10, C: 15, D: 7, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.09, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'MH3002', emnenavn: 'Epidemiologi I', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MH3002-1'],
            years: [
              { year: 2021, A: 8, B: 9, C: 6, D: 6, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.66, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 10, C: 5, D: 3, E: 4, F: 0, G: 0, H: 0, total: 22, snitt: 2.95, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 11, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.3, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 9, B: 17, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.86, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 6, B: 19, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.8, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'MH3012', emnenavn: 'Kvalitative metoder 1', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MH3012-1'],
            years: [
              { year: 2024, A: 7, B: 9, C: 9, D: 4, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.66, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 9, B: 20, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 4.15, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'MH3022', emnenavn: 'Statistiske og epidemiologiske metoder 1', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MH3022-1'],
            years: [
              { year: 2024, A: 4, B: 12, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.59, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 13, B: 10, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.94, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'FH3010', emnenavn: 'Systematisk folkehelsearbeid', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['FH3010-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 33, H: 0, total: 33, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 3, total: 22, snitt: null, strykprosent: null, bestattprosent: 86.4 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 30, H: 0, total: 30, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'FH3013', emnenavn: 'Nye perspektiver på folkehelse', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['FH3013-1'],
            years: [
              { year: 2025, A: 7, B: 14, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'MH3014', emnenavn: 'Kvalitative metoder 2', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MH3014-1', 'MH3024-1'], merknad: 'Studieplanen merker MH3014 Kvalitative metoder 2 og MH3024 Statistiske og epidemiologiske metoder 2 som MAX1A - studenten tar ett av dem',
            years: [
              { year: 2025, A: 4, B: 16, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'Eksperter i team', emnenavn: 'Eksperter i team (landsby velges av studenten)', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Obligatorisk i alle NTNUs masterprogram, men emnekoden avhenger av hvilken landsby studenten kommer inn på. I DBH-dataene for dette programmet finnes EIT3020, ISA3800 og ISA3801',
            years: [],
          },
          {
            emnekode: 'SYT3408', emnenavn: 'Prosjektplan', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Ingen karakterdata på SYT3408 under dette programmet i DBH',
            years: [],
          },
          {
            emnekode: 'FH3902', emnenavn: 'Masteroppgave i folkehelse', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ingen karakterdata på FH3902 i DBH; DBH har forgjengeren FH3901 Masteroppgave i folkehelse på 45 sp',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uio_folkehelsearbeid', shortName: 'UiO', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Folkehelsearbeid og bærekraftige helsetjenester (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.uio.no/studier/program/folkehelsevitenskap-og-epidemiologi/studieretninger/folkehelsevitenskap-og-berekraftige-helsetjenester/', 'https://www.uio.no/studier/program/folkehelsevitenskap-og-epidemiologi/studieretninger/folkehelsevitenskap-og-berekraftige-helsetjenester/oppbygging/', 'https://www.uio.no/studier/program/folkehelsevitenskap-og-epidemiologi/oppbygging/', 'https://www.uio.no/studier/program/folkehelsevitenskap-og-epidemiologi/studieretninger/epidemiologi/oppbygging/'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 100,
        merknad: 'Studieretningen ligger under masterprogrammet Folkehelsevitenskap og epidemiologi, som har to studieretninger (epidemiologi og folkehelsearbeid og bærekraftige helsetjenester). Programmet har ingen egen felles emnelisteside; de programfelles obligatoriske emnene er identifisert som de emnene begge studieretningene har felles i studieløpet fra høst 2026: FHE4000, FHE4010, FHE4020, FHE4030 og FHE4040 (50 sp). Under spesialiseringen er studieretningens egne obligatoriske emner ført opp: metodeemnet FHE4110/INTHE4032 (5 sp) og masteroppgaven FHE5080 (45 sp). Til sammen 100 obligatoriske sp av 120; de resterende 20 sp er valgfrie emner (5 sp i 2. semester og 15 sp i 3./4. semester). VIKTIG: studieplanen ble lagt helt om fra og med høsten 2026, og de fleste nye emnekodene har derfor ingen karakterdata i DBH ennå (DBH-dataene dekker 2021-2025). Bare FHE4000 og FHE4110 lar seg koble. Den forrige planen (studieløp 2023-2025) hadde disse obligatoriske emnene, som alle finnes i DBH: 1. semester FHE4000, FHE4200 Helsepedagogikk og helsekommunikasjon, HELSEF4410 Introduction to Qualitative Methods og INTHE4020 Introduction to Quantitative Methods; 2. semester FHE4210 Folkehelse og aldring, HELSEF4510 Medical and Health Related Research Ethics og HELSEF4420/HELSEF4430 fordypning i kvalitativ/kvantitativ metode; 3. semester FHE5200 Folkehelse og ikke-smittsomme sykdommer, FHE5000 Folkehelseetikk, FHE5210 Sosial ulikhet i helse og FHE5010 Komplekse intervensjoner og implementering; 4. semester FHE5090 Masteroppgave (30 sp). Flere av disse emnene er nå merket nedlagt.',
        obligatoriske: [
          {
            emnekode: 'FHE4000', emnenavn: 'Innføring i folkehelse, epidemiologi og bærekraft', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['FHE4000-1'],
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 39, H: 0, total: 39, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 44, H: 0, total: 44, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 67, H: 0, total: 67, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'FHE4010', emnenavn: 'Introduction to Research Methods', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Nytt emne fra høsten 2026; ingen karakterdata i DBH ennå',
            years: [],
          },
          {
            emnekode: 'FHE4020', emnenavn: 'Public Health Epidemiology', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Nytt emne fra høsten 2026; ingen karakterdata i DBH ennå',
            years: [],
          },
          {
            emnekode: 'FHE4030', emnenavn: 'Ikke smittsomme sykdommer - folkehelse og bærekraftige tjenester', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Nytt emne fra våren 2027; DBH har forgjengeren FHE5200 Folkehelse og ikke-smittsomme sykdommer (5 sp)',
            years: [],
          },
          {
            emnekode: 'FHE4040', emnenavn: 'Project Planning and Research Ethics', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Nytt emne fra våren 2027; ingen karakterdata i DBH ennå',
            years: [],
          },
        ],
        spesialiseringer: [
          { navn: 'Folkehelsearbeid og bærekraftige helsetjenester', obligatoriske: [
            {
              emnekode: 'FHE4110', emnenavn: 'Fundamentals in Data Management and Statistics', studiepoeng: 5, aar: 1, semester: 'vår',
              dbhEmnekoder: ['FHE4110-1'], merknad: 'Studenten velger ett av to metodeemner: FHE4110 (kvantitativ) eller INTHE4032 Advanced Module in Qualitative Methods, avhengig av metode i masteroppgaven. INTHE4032 har ingen karakterdata i DBH',
              years: [
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 0, total: 14, snitt: null, strykprosent: null, bestattprosent: 100 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100 },
              ],
            },
            {
              emnekode: 'FHE5080', emnenavn: 'Masteroppgave', studiepoeng: 45, aar: 2, semester: 'helår',
              dbhEmnekoder: [], merknad: 'Går over 3. og 4. semester. Nytt emne fra 2027; DBH har forgjengeren FHE5090 Masteroppgave (30 sp)',
              years: [],
            },
          ] },
        ],
      },
    ],
  },
  {
    id: 'globalokonomi', label: 'Global økonomi og politikk', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_gep', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Global økonomi og politikk (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/global-okonomi-og-politikk', 'https://www.nmbu.no/en/studies/programme-structure-master-global-economy-and-politics-2026', 'https://www.nmbu.no/en/faculties/school-economics-and-business/programme-structure-master-global-economy-and-politics-2025'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 85,
        merknad: 'Studieplanen for opptakskullet høsten 2026 er lagt til grunn; NMBUs norske programside lenker fortsatt til 2025-planen, som er tatt med som kilde og som skiller seg på tre punkter (EDS374A lå i 3. semester, ECN330 var anbefalt valgemne i 1. semester, og M0-GEP fantes ikke). Utenom de obligatoriske emnene består graden av: (1) et EDS-emne i 2. semester valgt blant EDS380 International Organizations, EDS374B International Relations Theory og EDS377 Foreign Policymaking and the Politics of Europe (10 sp), (2) en metodepakke i 3. semester – enten AOS340 Kvalitativ metode (5 sp) + AOS341 Kvantitative metoder (5 sp) eller ECN201 Econometrics (10 sp), og (3) et fritt valgemne på 5 sp i 2. semester (anbefalt: ECN306, BUS360 eller ECN320). Disse valgene er ikke ført opp som obligatoriske. obligatoriskeStudiepoeng (85) teller ikke ECN215, som bare er obligatorisk for studenter uten mikroøkonomi på mellomnivå fra før. M-GEP er et nytt program, og DBH har foreløpig karakterdata for bare 5 av de 9 obligatoriske emnene (ECN350, EDS379, M0-GEP og M30-GEP mangler).',
        obligatoriske: [
          {
            emnekode: 'ECN340', emnenavn: 'Introduction to Economics, the Global Economy and Environmental Governance', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECN340-1'], merknad: 'Augustblokk.',
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 3, total: 18, snitt: null, strykprosent: null, bestattprosent: 83.3 },
            ],
          },
          {
            emnekode: 'ECN215', emnenavn: 'Intermediate Microeconomics - Consumers, Producers, Market and Welfare', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECN215-1'], merknad: 'Obligatorisk kun for studenter som ikke har mikroøkonomi på mellomnivå i bachelorgraden; øvrige tar et valgfritt emne i stedet (f.eks. ECN306). Ikke regnet med i obligatoriskeStudiepoeng.',
            years: [
              { year: 2025, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECN230', emnenavn: 'International Trade, Policy and Development', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECN230-1'],
            years: [
              { year: 2025, A: 4, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EDS374A', emnenavn: 'International Relations Theory', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EDS374A-1'], merknad: 'Flyttet fra 3. til 1. semester i 2026-planen (lå i år 2 høst i 2025-planen).',
            years: [
              { year: 2025, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECN350', emnenavn: 'Development and Global Change', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ingen DBH-karakterdata for dette emnet i datasettet for programmet.',
            years: [],
          },
          {
            emnekode: 'ECN330', emnenavn: 'Economic Integration and Trade Liberalization', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['ECN330-1'], merknad: 'Var anbefalt valgemne i 1. semester i 2025-planen, obligatorisk i 3. semester i 2026-planen.',
            years: [
              { year: 2025, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EDS379', emnenavn: 'Global Political Economy', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Ingen DBH-karakterdata for dette emnet i datasettet for programmet.',
            years: [],
          },
          {
            emnekode: 'M0-GEP', emnenavn: 'Planning the Master\'s Thesis', studiepoeng: 0, aar: 2, semester: 'høst',
            dbhEmnekoder: [], merknad: '0 sp, ny i 2026-planen.',
            years: [],
          },
          {
            emnekode: 'M30-GEP', emnenavn: 'Master Thesis', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ingen DBH-karakterdata ennå – programmet er nytt.',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'globaleutvikling', label: 'Globale utviklingsstudier', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_globale_utviklingsstudier', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Globale utviklingsstudier (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/globale-utviklingsstudier', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-07/M-GDS%20Study%20Structure%202026-2027.pdf'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 70,
        merknad: 'Kilde er studieplan-PDF-en «M-GDS Study Structure 2026-2027» lenket fra programsiden. Programmet har ingen formelle spesialiseringer. Resten av graden (50 sp) er valgemner, internship (EDS313, 10–30 sp) og/eller utveksling i 3. semester; PDF-en lister anbefalte valgemner (bl.a. EDS370, EDS225, EDS230, EDS260, EDS355, EDS379, EDS341, EDS349, EDS246, EDS285), men studentene kan velge fritt blant NMBU-emner på 200-/300-nivå. Merk at PDF-ens egen oppsummering («40 sp obligatorisk + 30 sp masteroppgave + 40 sp valgemner») ikke summerer til 120; emnetabellen gir 70 sp obligatorisk og 50 sp valgfritt, og tabellen er lagt til grunn her. Alle fem obligatoriske emner er koblet til DBH-koder.',
        obligatoriske: [
          {
            emnekode: 'EDS201', emnenavn: 'Introduction to Development Studies', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EDS201-1'], merknad: 'Augustblokk.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'EDS305', emnenavn: 'Development Theory and Politics', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EDS305-1'],
            years: [
              { year: 2021, A: 0, B: 16, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.43, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.44, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 3, B: 16, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 9, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.95, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 8, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.59, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EDS312', emnenavn: 'Research Methods', studiepoeng: 15, aar: 1, semester: 'helår',
            dbhEmnekoder: ['EDS312-1'], merknad: 'Går over høst- og vårparallellen; alle 15 sp godskrives om våren.',
            years: [
              { year: 2021, A: 6, B: 14, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.96, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 17, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4.26, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 3, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.43, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 11, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.89, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 10, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.67, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECN352', emnenavn: 'Poverty and Inequality', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['ECN352-1'],
            years: [
              { year: 2021, A: 3, B: 19, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.93, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 16, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.96, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 5, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.5, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 11, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.73, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 6, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.43, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'M30-DS', emnenavn: 'Master\'s Thesis', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: ['M30-DS-1'], merknad: 'Kan utvides til 60 sp; da faller valgemnene i 3. semester bort.',
            years: [
              { year: 2021, A: 4, B: 8, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.94, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 14, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.95, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 6, B: 13, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4.14, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uio_decc', shortName: 'UiO', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Development, Environment and Cultural Change (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.uio.no/english/studies/programmes/ces-master/', 'https://www.uio.no/english/studies/programmes/ces-master/structure/'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 100,
        merknad: 'Programmet har ingen studieretninger. De obligatoriske emnene utgjør 100 av 120 sp; de resterende 20 sp er valgemner i 2. semester, valgt fra en liste som oppdateres årlig (bl.a. GLOBE4019, GLOBE4029, GLOBE4910 Internship, GLOBE4508, GLOBE4511, GLOBE4512). Viktig forbehold: emneporteføljen er i ferd med å skifte kodeprefiks fra SUMxxxx til GLOBExxxx etter at Senter for utvikling og miljø ble del av Senter for global bærekraft 1.6.2025. DBH-datasettet inneholder både gamle SUM-koder og de nye GLOBE-kodene for de to første emnene, men bare SUM-kodene for Text Lab og masteroppgaven. Der emnet er det samme, men koden endret, er den gamle koden ført opp i dbhEmnekoder og forklart i merknaden på emnet.',
        obligatoriske: [
          {
            emnekode: 'GLOBE4200', emnenavn: 'Advanced Introduction to Development and Environment', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['GLOBE4200-1', 'SUM4200-1'], merknad: 'Emnet skiftet kode fra SUM4200 til GLOBE4200 da Senter for utvikling og miljø ble del av Senter for global bærekraft 1.6.2025. Begge DBH-kodene er tatt med for å fange historiske karakterdata.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 0, total: 29, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'GLOBE4100', emnenavn: 'Research Methods and Project Design', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['GLOBE4100-1', 'SUM4100-1'], merknad: 'Kodeskifte SUM4100 → GLOBE4100 fra 2025. Begge DBH-kodene tatt med.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 4, total: 21, snitt: null, strykprosent: null, bestattprosent: 81 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 4, total: 30, snitt: null, strykprosent: null, bestattprosent: 86.7 },
            ],
          },
          {
            emnekode: 'GLOBE4300', emnenavn: 'Text Lab', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['SUM4300-1'], merknad: 'Obligatorisk for programstudenter med oppstart fra august 2020. DBH har foreløpig bare den gamle koden SUM4300-1 for emnet.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'GLOBE4091', emnenavn: 'Master\'s Thesis in Development, Environment and Cultural Change', studiepoeng: 60, aar: 2, semester: 'helår',
            dbhEmnekoder: ['SUM4091-1'], merknad: '60 sp masteroppgave som går over 3. og 4. semester. DBH har foreløpig bare den gamle koden SUM4091-1.',
            years: [
              { year: 2021, A: 5, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.56, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 13, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4.09, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 11, B: 12, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 4.26, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 9, B: 6, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.26, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 10, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.35, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'intmiljo', label: 'Internasjonale miljøstudier', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_intmiljo', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Internasjonale miljøstudier (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/internasjonale-miljostudier', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-07/M-IES%20Study%20Structure%202026-2027.pdf'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 60,
        merknad: 'Kilde er studieplan-PDF-en «M-IES Study Structure 2026-2027» lenket fra programsiden. Graden består av 30 sp obligatoriske emner, 30 sp masteroppgave, minst 20 sp kjerneemner valgt fra en fast liste på fire emner, og 40 sp valgemner/internship/utveksling. Kjerneemnene er ikke en spesialisering, men et bundet valg, og er derfor lagt i spesialiseringer med forklarende navn; aar er satt til null fordi PDF-en bare angir parallell, ikke studieår. Alle fire obligatoriske emner og alle fire kjerneemner er koblet til DBH-koder, men koblingen for EDS237 er usikker (kodeskifte fra EDS330).',
        obligatoriske: [
          {
            emnekode: 'EDS303', emnenavn: 'Introduction to International Environmental Studies', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EDS303-1'], merknad: 'Augustblokk.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 0, total: 29, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'EDS306', emnenavn: 'Green Transformations in Theory and Practice', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EDS306-1'],
            years: [
              { year: 2021, A: 5, B: 12, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.73, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 7, B: 9, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.92, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 10, C: 8, D: 5, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.54, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 7, B: 9, C: 4, D: 10, E: 4, F: 0, G: 0, H: 0, total: 34, snitt: 3.15, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 7, B: 7, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.05, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EDS312', emnenavn: 'Research Methods', studiepoeng: 15, aar: 1, semester: 'helår',
            dbhEmnekoder: ['EDS312-1'], merknad: 'Går over høst- og vårparallellen; alle 15 sp godskrives om våren.',
            years: [
              { year: 2021, A: 11, B: 12, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 4.1, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 8, B: 12, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 6, B: 13, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.32, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 9, B: 12, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.25, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 11, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.11, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'M30-IES', emnenavn: 'Master\'s Thesis', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: ['M30-IES-1'], merknad: 'Kan utvides til 60 sp; da faller valgemnene i 3. semester bort.',
            years: [
              { year: 2021, A: 8, B: 11, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.42, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 6, B: 11, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.35, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 7, B: 12, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 7, B: 6, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.18, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 5, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.36, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Kjerneemner – minst 20 sp må velges blant disse (ikke en formell spesialisering)', obligatoriske: [
            {
              emnekode: 'EDS355', emnenavn: 'Climate Change and Society', studiepoeng: 10, aar: null, semester: 'høst',
              dbhEmnekoder: ['EDS355-1'], merknad: 'Høstparallell; år 1 eller år 2.',
              years: [
                { year: 2021, A: 3, B: 8, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.82, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 3, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.33, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 6, B: 9, C: 6, D: 0, E: 0, F: 3, G: 0, H: 0, total: 24, snitt: 3.5, strykprosent: 12.5, bestattprosent: null },
                { year: 2024, A: 3, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.3, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'EDS348', emnenavn: 'Global Environmental Governance', studiepoeng: 10, aar: null, semester: 'vår',
              dbhEmnekoder: ['EDS348-1'], merknad: 'Vårparallell; år 1 eller år 2.',
              years: [
                { year: 2021, A: 6, B: 9, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.17, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 6, B: 12, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.96, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 5, B: 9, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 6, B: 23, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 3.92, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 6, B: 6, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.06, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'EDS352', emnenavn: 'Agroecology and Development', studiepoeng: 10, aar: null, semester: 'vår',
              dbhEmnekoder: ['EDS352-1'], merknad: 'Vårparallell; år 1 eller år 2.',
              years: [
                { year: 2021, A: 3, B: 11, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.21, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 4, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.4, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 3, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.33, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 3, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.91, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 3, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'EDS237', emnenavn: 'Political Ecology', studiepoeng: 10, aar: null, semester: 'høst',
              dbhEmnekoder: ['EDS330-1'], merknad: 'Ikke tilbudt 2026–2027; studentene kan ta EDS351 eller EDS285 i stedet det året. EDS237 er ny kode for emnet som tidligere het EDS330 Politisk økologi – DBH-koden EDS330-1 er ført opp på dette grunnlaget og bør kontrolleres mot emnekatalogen.',
              years: [
                { year: 2021, A: 6, B: 8, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 4, B: 4, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.64, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 6, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.67, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 5, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.42, strykprosent: 0, bestattprosent: null },
              ],
            },
          ] },
        ],
      },
    ],
  },
  {
    id: 'intrelasjoner', label: 'Internasjonale relasjoner', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_intrel', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Internasjonale relasjoner (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/internasjonale-relasjoner', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2025-12/Program%20structure%20of%20Master%20in%20International%20Relations%202026-2027.pdf'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 70,
        merknad: 'Kilde er studieplan-PDF-en «Program structure of Master in International Relations 2026-2027» lenket fra programsiden. PDF-en lister eksplisitt fem obligatoriske emner (70 sp). Programmet har ingen spesialiseringer; de resterende 50 sp er valgemner, internship (EDS313, 10–30 sp) og/eller utveksling i 3. semester. Mange av IR-valgemnene går annethvert år (partalls- eller oddetallsår), så det faktiske tilbudet varierer. Alle fem obligatoriske emner er koblet til DBH-koder.',
        obligatoriske: [
          {
            emnekode: 'EDS203', emnenavn: 'Introduction to International Relations', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EDS203-1'], merknad: 'Augustblokk.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 34, H: 0, total: 34, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 13, total: 35, snitt: null, strykprosent: null, bestattprosent: 62.9 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 30, H: 0, total: 30, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 53, H: 0, total: 53, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'EDS374A', emnenavn: 'International Relations Theory', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EDS374A-1'],
            years: [
              { year: 2021, A: 4, B: 11, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.86, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 15, C: 12, D: 6, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 3.42, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 9, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.56, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 12, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.62, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 7, B: 25, C: 21, D: 0, E: 0, F: 0, G: 0, H: 0, total: 53, snitt: 3.74, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EDS312', emnenavn: 'Research Methods', studiepoeng: 15, aar: 1, semester: 'helår',
            dbhEmnekoder: ['EDS312-1'], merknad: 'Går over høst- og vårparallellen; alle 15 sp godskrives om våren.',
            years: [
              { year: 2021, A: 7, B: 17, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.93, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 14, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.61, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 19, C: 11, D: 4, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.44, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 11, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.31, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 17, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.61, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'EDS374B', emnenavn: 'International Relations Theory', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['EDS374B-1'],
            years: [
              { year: 2021, A: 7, B: 11, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.04, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 9, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.47, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 22, C: 4, D: 0, E: 0, F: 3, G: 0, H: 0, total: 34, snitt: 3.68, strykprosent: 8.8, bestattprosent: null },
              { year: 2024, A: 15, B: 6, C: 0, D: 0, E: 0, F: 3, G: 0, H: 0, total: 24, snitt: 4.12, strykprosent: 12.5, bestattprosent: null },
              { year: 2025, A: 11, B: 18, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 4.38, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'M30-IR', emnenavn: 'Master Thesis', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: ['M30-IR-1'], merknad: 'Kan utvides til 60 sp; da faller valgemnene i 3. semester bort.',
            years: [
              { year: 2021, A: 6, B: 17, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 4.12, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 9, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.85, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 7, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.94, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 8, B: 12, C: 13, D: 0, E: 0, F: 5, G: 0, H: 0, total: 38, snitt: 3.34, strykprosent: 13.2, bestattprosent: null },
              { year: 2025, A: 7, B: 4, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.95, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uio_pecos', shortName: 'UiO', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Peace and Conflict Studies (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.uio.no/english/studies/programmes/peace-master/', 'https://www.uio.no/english/studies/programmes/peace-master/structure/index%20PECOS.html', 'https://www.uio.no/english/studies/programmes/peace-master/structure/'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 80,
        merknad: 'Programmet er lagt om: fra og med opptakskullet høsten 2027 heter det Peace, Conflict, and Democracy Studies, og de obligatoriske emnene får nye koder (STV4001, STV4002, STV4003, STV4911, STV4096). Her er planen for kull til og med høsten 2026 lagt til grunn, siden den svarer til DBH-kodene i datasettet. I tillegg til de 80 obligatoriske sp må studentene velge ett metodeemne (10 sp) i 3. semester blant STV4030A Digital Data in Political Science, STV4030B Qualitative Data in Political Science og STV4030C Survey design for political scientists – DBH har karakterdata for STV4030A-1 og STV4030B-1, men ikke for STV4030C. De siste 30 sp er frie valgemner i 2. semester, i praksis hele masteremneporteføljen ved Institutt for statsvitenskap. Alle fem obligatoriske emner er koblet til DBH-koder.',
        obligatoriske: [
          {
            emnekode: 'PECOS4025', emnenavn: 'Analytic perspectives on peace and conflict', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['PECOS4025-1'],
            years: [
              { year: 2022, A: 0, B: 6, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.12, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 6, C: 9, D: 5, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.44, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 6, B: 9, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.88, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 6, B: 8, C: 16, D: 4, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.47, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PECOS4022', emnenavn: 'Applied Statistics for Peace and Conflict Studies', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['PECOS4022-1'],
            years: [
              { year: 2021, A: 5, B: 5, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.92, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 9, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.86, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 9, B: 6, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.2, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 4, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.78, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 6, B: 13, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.71, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'PECOS4010', emnenavn: 'Conflict and state building', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['PECOS4010-1'],
            years: [
              { year: 2021, A: 6, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.19, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 7, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.47, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 6, B: 15, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4.08, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 8, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.47, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 8, B: 17, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 4.1, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'STV4911', emnenavn: 'Design Seminar', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['STV4911-1'],
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'PECOS4096', emnenavn: 'Master\'s Thesis', studiepoeng: 45, aar: 2, semester: 'helår',
            dbhEmnekoder: ['PECOS4096-1'], merknad: '45 sp; arbeidet går over 3. og 4. semester (15 sp i 3. semester, 30 sp i 4.).',
            years: [
              { year: 2021, A: 0, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.38, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.4, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 10, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.77, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 4, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4.5, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 7, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.25, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'landskapglobal', label: 'Landskapsarkitektur for global bærekraft', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_gla', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Landskapsarkitektur for global bærekraft (master 2 år)',
        studieplanAar: '2025/2026', kilder: ['https://www.nmbu.no/studier/master-2-aar/landskapsarkitektur-global-baerekraft', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2025-12/GLA%20Studieplan%202025%202026.pdf'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 90,
        merknad: 'Kilde er studieplan-PDF-en datert 08.08.2025, funnet på den engelske programsiden; den norske programsiden lenker fortsatt til 2024-versjonen, som har samme obligatoriske emner. Ingen 2026/2027-versjon er publisert per 22.09.2026. PDF-en sier uttrykkelig at «all the courses in the table are mandatory» – 90 av 120 sp. De resterende 30 sp velges fra anbefalte emnepakker med tre perspektiver (Development, Ecological, Planning), men pakkene er anbefalinger, ikke formelle spesialiseringer, og er derfor ikke ført opp under spesialiseringer. Alle seks obligatoriske emner er koblet til DBH-koder.',
        obligatoriske: [
          {
            emnekode: 'GLA301', emnenavn: 'Introduction to Landscape Architecture for Global Sustainability', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['GLA301-1'], merknad: 'Augustblokk. Må være bestått før GLA305.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 10, H: 0, total: 10, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'GLA302', emnenavn: 'Design-research studio in landscape architecture', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['GLA302-1'],
            years: [
              { year: 2021, A: 0, B: 23, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'GLA303', emnenavn: 'Landscape in a Globalised World: Historical and Theoretical Perspectives', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['GLA303-1'],
            years: [
              { year: 2021, A: 18, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 5, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 10, B: 12, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4.45, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.45, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 6, B: 19, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4.24, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'GLA304', emnenavn: 'Implementing landscape sustainability in an urban context', studiepoeng: 15, aar: 1, semester: 'vår',
            dbhEmnekoder: ['GLA304-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.14, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.38, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 4, B: 20, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.17, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.56, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'GLA305', emnenavn: 'Social sustainability in a context of vulnerability', studiepoeng: 15, aar: 2, semester: 'høst',
            dbhEmnekoder: ['GLA305-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 5, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.38, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 7, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.25, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 6, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.67, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 8, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.62, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'M30-GLA', emnenavn: 'Master thesis', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: ['M30-GLA-1'],
            years: [
              { year: 2023, A: 5, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.17, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 8, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.33, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 0, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'samfok_miljo', label: 'Samfunnsøkonomi og miljøforvaltning', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_eeg', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Samfunnsøkonomi og miljøforvaltning (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/samfunnsokonomi-og-miljoforvaltning', 'https://www.nmbu.no/studier/programme-structure-master-economics-and-environmental-governance-2026', 'https://www.nmbu.no/en/studies/programme-structure-master-economics-and-environmental-governance-2025'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 80,
        merknad: 'Studieplanen for opptakskullet høsten 2026 er lagt til grunn; 2025-planen er tatt med som kilde og skiller seg ved at EDS355 lå i 3. semester, metodepakken lå i 1. semester, ECN215 kunne byttes mot EDS306, og M0-EEG ikke fantes. De 20 sp valgemner tas enten som én av de to profilene (ført opp under spesialiseringer) eller fritt blant NMBUs emner. I tillegg må alle ta en metodepakke på 10 sp i 3. semester: enten AOS340 Kvalitativ metode (5 sp) + AOS341 Kvantitative metoder (5 sp), eller ECN201 Econometrics / ECN301 Econometric Methods (10 sp); dette bundne valget er ikke ført opp som obligatorisk. obligatoriskeStudiepoeng (80) teller ikke ECN215. M-EEG er et nytt program, og DBH har foreløpig karakterdata for bare 4 av de 9 obligatoriske emnene (EDS355, ECN375, EDS348, M0-EEG og M30-EEG mangler) og for ingen av profilemnene.',
        obligatoriske: [
          {
            emnekode: 'ECN340', emnenavn: 'Introduction to Economics, the Global Economy and Environmental Governance', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECN340-1'], merknad: 'Augustblokk.',
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 5, H: 0, total: 5, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 4, total: 20, snitt: null, strykprosent: null, bestattprosent: 80 },
            ],
          },
          {
            emnekode: 'ECN215', emnenavn: 'Intermediate Microeconomics - Consumers, Producers, Market and Welfare', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECN215-1'], merknad: 'Obligatorisk kun for studenter som ikke har mikroøkonomi på mellomnivå i bachelorgraden; øvrige tar et valgemne, f.eks. EDS306. Ikke regnet med i obligatoriskeStudiepoeng.',
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 5, F: 3, G: 0, H: 0, total: 8, snitt: 0.62, strykprosent: 37.5, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECN306', emnenavn: 'Economics of Sustainability', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECN306-1'],
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 3, H: 0, total: 3, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'EDS355', emnenavn: 'Climate Change and Society', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Lå i 3. semester i 2025-planen, flyttet til 1. semester i 2026-planen. Ingen DBH-karakterdata for emnet i datasettet for dette programmet.',
            years: [],
          },
          {
            emnekode: 'ECN375', emnenavn: 'Natural Resource and Environmental Economics', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ingen DBH-karakterdata for emnet i datasettet for dette programmet.',
            years: [],
          },
          {
            emnekode: 'EDS348', emnenavn: 'Global Environmental Governance', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ingen DBH-karakterdata for emnet i datasettet for dette programmet.',
            years: [],
          },
          {
            emnekode: 'ECN372', emnenavn: 'Climate Economics', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['ECN372-1'],
            years: [
              { year: 2025, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'M0-EEG', emnenavn: 'Planning the Master\'s Thesis', studiepoeng: 0, aar: 2, semester: 'høst',
            dbhEmnekoder: [], merknad: '0 sp, ny i 2026-planen.',
            years: [],
          },
          {
            emnekode: 'M30-EEG', emnenavn: 'Master Thesis', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ingen DBH-karakterdata ennå – programmet er nytt.',
            years: [],
          },
        ],
        spesialiseringer: [
          { navn: 'Profil i økologisk økonomi (Ecological Economics)', obligatoriske: [
            {
              emnekode: 'EDS330', emnenavn: 'Political Ecology', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: 'Ingen DBH-karakterdata for emnet i datasettet for dette programmet.',
              years: [],
            },
            {
              emnekode: 'EDS351', emnenavn: 'Ecological Economics and Degrowth', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Ingen DBH-karakterdata for emnet i datasettet for dette programmet.',
              years: [],
            },
          ] },
          { navn: 'Profil i energiøkonomi (Energy Economics)', obligatoriske: [
            {
              emnekode: 'ECN280', emnenavn: 'Energy Economics', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: 'Ingen DBH-karakterdata for emnet i datasettet for dette programmet.',
              years: [],
            },
            {
              emnekode: 'ECN380', emnenavn: 'Energy Markets and Regulation', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Ingen DBH-karakterdata for emnet i datasettet for dette programmet.',
              years: [],
            },
          ] },
        ],
      },
      {
        entryId: 'ntnu_msok', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Samfunnsøkonomi (master 2 år)',
        studieplanAar: '2024/2025', kilder: ['https://www.ntnu.no/studier/msok', 'https://www.ntnu.no/studier/msok/studiets-oppbygning'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 90,
        merknad: 'NTNU har per 22.09.2026 ikke publisert en nyere oppbyggingsside enn den som står merket «Informasjonen er gyldig for studieåret 2024/2025»; både programsiden for studiestart 2026 og NTNUs studieplanverktøy peker til denne siden, og 2024/2025-planen er derfor lagt til grunn. Programmet har ingen navngitte spesialiseringer: hele 3. semester (30 sp) er valgbare spesialiseringsemner, i hovedsak SØK3500-emnene (SØK3531–SØK3541) og finansemner, og flere av dem går bare annethvert år eller som selvstudium. Alle obligatoriske emner utenom Eksperter i team er koblet til én DBH-kode; Eksperter i team er koblet til de fem landsbykodene i datasettet. Merk at DBH-datasettet også inneholder eldre obligatoriske emner (SØK3514, SØK3517, SØK3522, SØK3523) som ikke lenger står i studieplanen.',
        obligatoriske: [
          {
            emnekode: 'SØK3004', emnenavn: 'Videregående matematisk analyse', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SØK3004-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 0, total: 32, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 12, B: 5, C: 3, D: 0, E: 3, F: 3, G: 0, H: 0, total: 26, snitt: 3.54, strykprosent: 11.5, bestattprosent: null },
              { year: 2023, A: 14, B: 12, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 3.9, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 5, C: 5, D: 3, E: 3, F: 4, G: 0, H: 0, total: 20, snitt: 2.2, strykprosent: 20, bestattprosent: null },
              { year: 2025, A: 8, B: 11, C: 9, D: 0, E: 6, F: 0, G: 0, H: 0, total: 34, snitt: 3.44, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'SØK3006', emnenavn: 'Valuta, olje og makroøkonomisk politikk', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SØK3006-1'],
            years: [
              { year: 2021, A: 6, B: 6, C: 9, D: 4, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.56, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 7, C: 6, D: 5, E: 4, F: 4, G: 0, H: 0, total: 29, snitt: 2.59, strykprosent: 13.8, bestattprosent: null },
              { year: 2023, A: 6, B: 0, C: 5, D: 4, E: 0, F: 9, G: 0, H: 0, total: 24, snitt: 2.21, strykprosent: 37.5, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 4, D: 0, E: 5, F: 4, G: 0, H: 0, total: 13, snitt: 1.31, strykprosent: 30.8, bestattprosent: null },
              { year: 2025, A: 0, B: 8, C: 9, D: 9, E: 3, F: 0, G: 0, H: 0, total: 29, snitt: 2.76, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'SØK3007', emnenavn: 'Skatt, beslutningsatferd og økonomisk politikk', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['SØK3007-1'],
            years: [
              { year: 2021, A: 4, B: 9, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.48, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 3, C: 3, D: 4, E: 0, F: 5, G: 0, H: 0, total: 15, snitt: 1.93, strykprosent: 33.3, bestattprosent: null },
              { year: 2023, A: 0, B: 5, C: 6, D: 7, E: 3, F: 0, G: 0, H: 0, total: 21, snitt: 2.62, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 3, C: 4, D: 3, E: 3, F: 9, G: 0, H: 0, total: 22, snitt: 1.5, strykprosent: 40.9, bestattprosent: null },
              { year: 2025, A: 0, B: 0, C: 6, D: 12, E: 4, F: 0, G: 0, H: 0, total: 22, snitt: 2.09, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'SØK3001', emnenavn: 'Videregående økonometri', studiepoeng: 15, aar: 1, semester: 'vår',
            dbhEmnekoder: ['SØK3001-1'],
            years: [
              { year: 2021, A: 4, B: 11, C: 10, D: 3, E: 0, F: 4, G: 0, H: 0, total: 32, snitt: 3.12, strykprosent: 12.5, bestattprosent: null },
              { year: 2022, A: 0, B: 6, C: 10, D: 10, E: 0, F: 7, G: 0, H: 0, total: 33, snitt: 2.24, strykprosent: 21.2, bestattprosent: null },
              { year: 2023, A: 3, B: 0, C: 7, D: 8, E: 6, F: 3, G: 0, H: 0, total: 27, snitt: 2.15, strykprosent: 11.1, bestattprosent: null },
              { year: 2024, A: 0, B: 12, C: 8, D: 4, E: 4, F: 7, G: 0, H: 0, total: 35, snitt: 2.4, strykprosent: 20, bestattprosent: null },
              { year: 2025, A: 3, B: 8, C: 4, D: 4, E: 0, F: 5, G: 0, H: 0, total: 24, snitt: 2.79, strykprosent: 20.8, bestattprosent: null },
            ],
          },
          {
            emnekode: 'SØK3008', emnenavn: 'Insentiver, informasjon og arbeidskontrakter', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['SØK3008-1'],
            years: [
              { year: 2021, A: 9, B: 9, C: 6, D: 7, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.65, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 5, B: 7, C: 5, D: 5, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.55, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 3, D: 8, E: 0, F: 5, G: 0, H: 0, total: 16, snitt: 1.56, strykprosent: 31.2, bestattprosent: null },
              { year: 2024, A: 0, B: 3, C: 5, D: 7, E: 4, F: 6, G: 0, H: 0, total: 25, snitt: 1.8, strykprosent: 24, bestattprosent: null },
              { year: 2025, A: 0, B: 4, C: 0, D: 4, E: 0, F: 8, G: 0, H: 0, total: 16, snitt: 1.5, strykprosent: 50, bestattprosent: null },
            ],
          },
          {
            emnekode: 'AAR4914-3', emnenavn: 'Eksperter i team', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['AAR4914-3', 'BEIT4013-1', 'POL3801-1', 'SØK3801-1', 'TET4850-3'], merknad: 'Studieplanen oppgir ingen emnekode – studenten velger landsby, og hver landsby har sin egen kode. emnekode er derfor satt til null. DBH-kodene er de EiT-landsbyene datasettet har karakterdata for på dette programmet (bl.a. SØK3801 Verdien mellom fjellene og POL3801 Vekst og utvikling).',
            years: [
              { year: 2021, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 6, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.67, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'SØK3900', emnenavn: 'Masteroppgave', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: ['SØK3900-1'],
            years: [
              { year: 2021, A: 0, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 9, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.47, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 5, B: 6, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.54, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 7, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.21, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 9, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.81, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uio_economics', shortName: 'UiO', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Economics (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.uio.no/english/studies/programmes/economics-master/', 'https://www.uio.no/english/studies/programmes/economics-master/structure/'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 70,
        merknad: 'Oppbyggingssiden gjelder studenter tatt opp høsten 2019 eller senere og var sist oppdatert 10.04.2026; den er dermed gjeldende plan for 2026/2027. Felles obligatorisk kjerne er 40 sp emner + 30 sp masteroppgave = 70 sp. Har du allerede tatt et av kjerneemnene i bachelorgraden ved UiO, må det erstattes med et valgfritt ECON4000-emne. Studieretningen Economics har ingen ekstra obligatoriske emner (50 sp frie ECON4000-emner). Studieretningen Environmental-, Resource- and Development Economics har tre obligatoriske emner (30 sp), men legges ned fra høsten 2026 – den er tatt med fordi DBH-dataene dekker kull som fulgte den. Studieretningen Research krever «two courses from the list» av ECON5000-emner (20 sp i viderekomne emner), men oppbyggingssiden navngir ikke emnene; de er derfor ikke ført opp, selv om datasettet inneholder ECON5200 Advanced Microeconomics og ECON5300 Advanced Macroeconomic Theory. Alle fem felles obligatoriske emner og alle tre ERDEC-emner er koblet til DBH-koder.',
        obligatoriske: [
          {
            emnekode: 'ECON4120', emnenavn: 'Mathematics 2: Calculus and Linear Algebra', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECON4120-1'],
            years: [
              { year: 2021, A: 4, B: 13, C: 17, D: 6, E: 9, F: 13, G: 0, H: 0, total: 62, snitt: 2.32, strykprosent: 21, bestattprosent: null },
              { year: 2022, A: 8, B: 7, C: 7, D: 10, E: 7, F: 6, G: 0, H: 0, total: 45, snitt: 2.58, strykprosent: 13.3, bestattprosent: null },
              { year: 2023, A: 5, B: 0, C: 11, D: 5, E: 4, F: 8, G: 0, H: 0, total: 33, snitt: 2.18, strykprosent: 24.2, bestattprosent: null },
              { year: 2024, A: 0, B: 8, C: 16, D: 7, E: 9, F: 13, G: 0, H: 0, total: 53, snitt: 1.94, strykprosent: 24.5, bestattprosent: null },
              { year: 2025, A: 8, B: 11, C: 17, D: 6, E: 8, F: 17, G: 0, H: 0, total: 67, snitt: 2.31, strykprosent: 25.4, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECON4220', emnenavn: 'Microeconomics 3', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECON4220-1'],
            years: [
              { year: 2021, A: 5, B: 14, C: 14, D: 18, E: 8, F: 6, G: 0, H: 0, total: 65, snitt: 2.57, strykprosent: 9.2, bestattprosent: null },
              { year: 2022, A: 5, B: 13, C: 15, D: 11, E: 0, F: 0, G: 0, H: 0, total: 44, snitt: 3.27, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 7, C: 6, D: 6, E: 8, F: 6, G: 0, H: 0, total: 33, snitt: 2, strykprosent: 18.2, bestattprosent: null },
              { year: 2024, A: 5, B: 12, C: 23, D: 16, E: 4, F: 3, G: 0, H: 0, total: 63, snitt: 2.83, strykprosent: 4.8, bestattprosent: null },
              { year: 2025, A: 5, B: 20, C: 26, D: 20, E: 4, F: 0, G: 0, H: 0, total: 75, snitt: 3.03, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECON4310', emnenavn: 'Macroeconomic Theory', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECON4310-1'],
            years: [
              { year: 2021, A: 12, B: 29, C: 25, D: 4, E: 4, F: 0, G: 0, H: 0, total: 74, snitt: 3.55, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 13, B: 16, C: 5, D: 11, E: 8, F: 0, G: 0, H: 0, total: 53, snitt: 3.28, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 7, B: 12, C: 13, D: 7, E: 5, F: 0, G: 0, H: 0, total: 44, snitt: 3.2, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 5, B: 18, C: 17, D: 12, E: 8, F: 8, G: 0, H: 0, total: 68, snitt: 2.65, strykprosent: 11.8, bestattprosent: null },
              { year: 2025, A: 10, B: 20, C: 21, D: 15, E: 9, F: 6, G: 0, H: 0, total: 81, snitt: 2.86, strykprosent: 7.4, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECON4150', emnenavn: 'Introductory Econometrics', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['ECON4150-1'],
            years: [
              { year: 2021, A: 15, B: 15, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 3.98, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 0, C: 11, D: 3, E: 9, F: 3, G: 0, H: 0, total: 26, snitt: 1.85, strykprosent: 11.5, bestattprosent: null },
              { year: 2023, A: 5, B: 0, C: 7, D: 4, E: 3, F: 0, G: 0, H: 0, total: 19, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 3, B: 3, C: 0, D: 3, E: 0, F: 4, G: 0, H: 0, total: 13, snitt: 2.54, strykprosent: 30.8, bestattprosent: null },
              { year: 2025, A: 0, B: 5, C: 5, D: 9, E: 5, F: 4, G: 0, H: 0, total: 28, snitt: 2.07, strykprosent: 14.3, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECON4091', emnenavn: 'Master Thesis', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: ['ECON4091-1'],
            years: [
              { year: 2021, A: 11, B: 21, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 45, snitt: 3.96, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 13, B: 28, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 53, snitt: 4.02, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 12, B: 23, C: 16, D: 0, E: 0, F: 0, G: 0, H: 0, total: 51, snitt: 3.92, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 20, B: 12, C: 15, D: 3, E: 0, F: 0, G: 0, H: 0, total: 50, snitt: 3.98, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 10, B: 17, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 4.09, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Economics (studieretning)', obligatoriske: [
          ] },
          { navn: 'Environmental-, Resource- and Development Economics (ERDEC) – nedlagt fra høsten 2026', obligatoriske: [
            {
              emnekode: 'ECON4910', emnenavn: 'Environmental Economics', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: ['ECON4910-1'],
              years: [
                { year: 2021, A: 4, B: 6, C: 9, D: 3, E: 3, F: 0, G: 0, H: 0, total: 25, snitt: 3.2, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 4, B: 7, C: 8, D: 0, E: 4, F: 0, G: 0, H: 0, total: 23, snitt: 3.3, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 0, B: 0, C: 3, D: 4, E: 4, F: 3, G: 0, H: 0, total: 14, snitt: 1.5, strykprosent: 21.4, bestattprosent: null },
                { year: 2024, A: 3, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 4, B: 0, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.5, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'ECON4915', emnenavn: 'Development Economics', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: ['ECON4915-1'],
              years: [
                { year: 2021, A: 7, B: 15, C: 15, D: 5, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 3.57, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 6, B: 13, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.89, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 9, B: 8, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.88, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 5, B: 5, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.63, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 8, B: 7, C: 10, D: 5, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.6, strykprosent: 0, bestattprosent: null },
              ],
            },
            {
              emnekode: 'ECON4925', emnenavn: 'Resource Economics', studiepoeng: 10, aar: 2, semester: 'høst',
              dbhEmnekoder: ['ECON4925-1'],
              years: [
                { year: 2021, A: 4, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2022, A: 0, B: 4, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.1, strykprosent: 0, bestattprosent: null },
                { year: 2023, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null },
                { year: 2024, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null },
                { year: 2025, A: 0, B: 6, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.55, strykprosent: 0, bestattprosent: null },
              ],
            },
          ] },
          { navn: 'Research (studieretning)', obligatoriske: [
          ] },
        ],
      },
      {
        entryId: 'uib_samfunnsokonomi', shortName: 'UiB', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Samfunnsøkonomi (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www4.uib.no/studier/program/samfunnsokonomi-master', 'https://www4.uib.no/studier/program/samfunnsokonomi-master/plan'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 70,
        merknad: 'Kilde er «Studieplan for MASV-SØK Masterprogram i samfunnsøkonomi, høst 2026» på uib.no. Studieplanen sier uttrykkelig at ECON310, ECON330, ECON340 og ECON380 er obligatoriske, i tillegg til masteroppgåva ECON391. Programmet har ingen formelle spesialiseringar: de resterende 50 sp er fem valgemner på 300-nivå (tre i 2. semester, to i 3. semester), og utveksling anbefales i 2. semester. Alle fem obligatoriske emner er koblet til DBH-koder.',
        obligatoriske: [
          {
            emnekode: 'ECON310', emnenavn: 'Mikroøkonomisk analyse', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECON310-0'],
            years: [
              { year: 2021, A: 3, B: 13, C: 10, D: 3, E: 4, F: 0, G: 0, H: 0, total: 33, snitt: 3.24, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 3, C: 8, D: 4, E: 3, F: 0, G: 0, H: 0, total: 18, snitt: 2.61, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 0, C: 6, D: 8, E: 6, F: 5, G: 0, H: 0, total: 25, snitt: 1.6, strykprosent: 20, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 6, D: 6, E: 9, F: 4, G: 0, H: 0, total: 25, snitt: 1.56, strykprosent: 16, bestattprosent: null },
              { year: 2025, A: 0, B: 8, C: 11, D: 8, E: 4, F: 3, G: 0, H: 0, total: 34, snitt: 2.5, strykprosent: 8.8, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECON330', emnenavn: 'Makroøkonomisk analyse', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECON330-0'],
            years: [
              { year: 2021, A: 0, B: 7, C: 14, D: 4, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.12, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 3, B: 0, C: 0, D: 6, E: 3, F: 4, G: 0, H: 0, total: 16, snitt: 1.88, strykprosent: 25, bestattprosent: null },
              { year: 2023, A: 0, B: 8, C: 3, D: 4, E: 10, F: 0, G: 0, H: 0, total: 25, snitt: 2.36, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 3, D: 5, E: 9, F: 5, G: 0, H: 0, total: 22, snitt: 1.27, strykprosent: 22.7, bestattprosent: null },
              { year: 2025, A: 5, B: 6, C: 11, D: 5, E: 4, F: 0, G: 0, H: 0, total: 31, snitt: 3.1, strykprosent: 0, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECON340', emnenavn: 'Økonometri I', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECON340-0'],
            years: [
              { year: 2021, A: 0, B: 10, C: 10, D: 7, E: 4, F: 0, G: 0, H: 0, total: 31, snitt: 2.84, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 0, B: 6, C: 9, D: 6, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 7, C: 8, D: 7, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 5, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.12, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 6, B: 12, C: 11, D: 3, E: 0, F: 3, G: 0, H: 0, total: 35, snitt: 3.34, strykprosent: 8.6, bestattprosent: null },
            ],
          },
          {
            emnekode: 'ECON380', emnenavn: 'Forberedelsesemne for masteroppgåva', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['ECON380-0'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100 },
            ],
          },
          {
            emnekode: 'ECON391', emnenavn: 'Masteroppgåve', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: ['ECON391-0'], merknad: 'Normert til 30 sp, typisk 40–60 sider.',
            years: [
              { year: 2021, A: 4, B: 12, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.25, strykprosent: 0, bestattprosent: null },
              { year: 2022, A: 4, B: 10, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.86, strykprosent: 0, bestattprosent: null },
              { year: 2023, A: 0, B: 11, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.42, strykprosent: 0, bestattprosent: null },
              { year: 2024, A: 0, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 3, strykprosent: 0, bestattprosent: null },
              { year: 2025, A: 4, B: 13, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4, strykprosent: 0, bestattprosent: null },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
];
