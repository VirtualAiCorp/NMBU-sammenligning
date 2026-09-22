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
    id: 'bioteknologi', label: 'Bioteknologi', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_bioteknologi', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Bioteknologi (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/bachelor/bioteknologi', 'https://www.nmbu.no/fakulteter/fakultet-kjemi-bioteknologi-og-matvitenskap/studieplaner-bachelor-i-bioteknologi', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-06/Studieplan%20B%20BIOTEK%202026.pdf'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 150,
        merknad: 'Kilde er NMBUs fargekodede rutenett-studieplan for kull 2026 (énpage PDF «Studieplan B BIOTEK 2026»), hentet fra fakultetssiden for Kjemi, bioteknologi og matvitenskap. Rutenettet oppgir en samlet studiepoengsum på 155 sp for de tre årene (65+55+35), hvorav 150 sp er knyttet til navngitte emnekoder (listet over) og 5 sp er en umerket augustblokk i 3. år (ingen emnenavn/-kode oppgitt i kilden, så den er ikke tatt med i obligatoriske-listen). totaltStudiepoeng er satt til standard 180 sp for et treårig bachelorprogram; differansen på 30 sp (25 sp ukjent fordypning/valgfritt + 5 sp umerket augustblokk) dekkes av valgfrie/fordypningsemner i 3. år som ikke fremgår av rutenettet. To par emner er obligatoriske alternativer (studenten velger én av to): STAT210 (august, 2. år) eller STAT200 Regresjon (januar, 2. år); BIO211 (januar, 3. år) eller BIO233 Eksperimentell miljømikrobiologi (vår, 3. år). Kun én av hvert par er ført opp i obligatoriske-listen, med den andre nevnt i merknad-feltet på emnet; studiepoengsummen for paret er uansett kun talt én gang (5 sp). PHI100 er oppført tilsvarende som i nmbu_maskin.json ford i kilden lister PHI100/PHI101 sammen (alt. PHI101/PHI102). KJM007 Forkurs i kjemi (januar, 1. år) er et frivillig nullpoengs forkurs og er ikke tatt med. Kildedokumentet beskriver ingen egne studieretninger/spesialiseringer for dette programmet.',
        obligatoriske: [
          {
            emnekode: 'BIO101', emnenavn: 'Introduksjon i bioteknologi og kjemi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO101-1'], merknad: 'Augustblokk før høstsemesteret.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 38, H: 0, total: 38, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 0, total: 32, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 41, H: 0, total: 41, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 33, H: 0, total: 33, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 41, H: 0, total: 41, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO102', emnenavn: 'Anvendt bioteknologi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO102-1'],
            years: [
              { year: 2023, A: 0, B: 22, C: 14, D: 3, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.49, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 6, B: 14, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.81, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 6, B: 20, C: 7, D: 7, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BIO100', emnenavn: 'Cellebiologi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO100-1'],
            years: [
              { year: 2021, A: 19, B: 15, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 4.56, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 11, B: 14, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4.29, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 13, B: 24, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 4.35, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 9, B: 23, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 4.17, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 22, B: 11, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 4.45, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MAT100', emnenavn: 'Brukerkurs i matematikk', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'STIN100', emnenavn: 'Biologisk data-analyse', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['STIN100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 45, H: 0, total: 45, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 31, H: 0, total: 31, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 39, H: 3, total: 42, snitt: null, strykprosent: null, bestattprosent: 92.9, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 0, total: 32, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 43, H: 4, total: 47, snitt: null, strykprosent: null, bestattprosent: 91.5, skjult: 0 },
            ],
          },
          {
            emnekode: 'KJM100', emnenavn: 'Generell kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM100-1'],
            years: [
              { year: 2021, A: 8, B: 18, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 4.13, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 8, B: 20, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.97, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 8, B: 12, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.17, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 20, B: 15, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 4.27, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 21, B: 7, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 4.44, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'STAT100', emnenavn: 'Statistikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['STAT100-1'],
            years: [
              { year: 2021, A: 9, B: 5, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.76, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2022, A: 14, B: 7, C: 8, D: 7, E: 5, F: 0, G: 0, H: 0, total: 41, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 12, C: 9, D: 8, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.14, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 4, B: 16, C: 12, D: 4, E: 3, F: 0, G: 0, H: 0, total: 39, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 9, B: 6, C: 4, D: 5, E: 10, F: 9, G: 0, H: 0, total: 43, snitt: 2.35, strykprosent: 20.9, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO120', emnenavn: 'Genetikk introduksjonskurs', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO120-1'],
            years: [
              { year: 2021, A: 3, B: 27, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 4.1, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 16, B: 22, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 4.42, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 13, B: 18, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 4.42, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 29, B: 11, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 4.72, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 20, B: 13, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 4.61, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'STAT210', emnenavn: 'Forsøksplanlegging og variansanalyse', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['STAT210-1'], merknad: 'Augustblokk. Obligatorisk valg mellom STAT210 (tas i augustblokk) og STAT200 Regresjon (tas i januarblokk) - studieplanen krever minst ett av de to.',
            years: [
              { year: 2021, A: 3, B: 6, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.47, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 7, C: 6, D: 4, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.18, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 4, B: 11, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.76, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 4, C: 8, D: 7, E: 3, F: 0, G: 0, H: 0, total: 22, snitt: 2.59, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 12, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.57, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'KJM110', emnenavn: 'Organisk kjemi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['KJM110-1'],
            years: [
              { year: 2021, A: 5, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.36, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 6, C: 6, D: 0, E: 0, F: 5, G: 0, H: 0, total: 17, snitt: 2.47, strykprosent: 29.4, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 9, C: 9, D: 7, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.08, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 11, C: 16, D: 3, E: 7, F: 5, G: 0, H: 0, total: 42, snitt: 2.5, strykprosent: 11.9, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 5, B: 7, C: 11, D: 6, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 8 },
            ],
          },
          {
            emnekode: 'PHI100', emnenavn: 'Examen philosophicum', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['PHI100-1'], merknad: 'Studieplanen lister PHI100/PHI101 sammen (alt. PHI101/PHI102) - studenten velger en av de likeverdige variantene.',
            years: [
              { year: 2021, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2024, A: 0, B: 5, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'BIO130', emnenavn: 'Generell mikrobiologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO130-1'],
            years: [
              { year: 2021, A: 12, B: 12, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 4.2, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 12, B: 18, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 4.24, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 9, B: 13, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.9, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 17, B: 12, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 4.28, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 17, B: 10, C: 4, D: 3, E: 0, F: 3, G: 0, H: 0, total: 37, snitt: 3.86, strykprosent: 8.1, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIN210', emnenavn: 'Bioinformatikk', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BIN210-1'],
            years: [
              { year: 2021, A: 6, B: 11, C: 15, D: 3, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 7, B: 7, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.05, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 4, B: 17, C: 22, D: 6, E: 0, F: 0, G: 0, H: 0, total: 49, snitt: 3.39, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 6, B: 17, C: 9, D: 4, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 3.69, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 8, C: 20, D: 6, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.06, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'KJB200', emnenavn: 'Biokjemi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['KJB200-1'],
            years: [
              { year: 2021, A: 8, B: 10, C: 3, D: 5, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.81, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 3, B: 12, C: 7, D: 5, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.48, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 5, B: 19, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.91, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 7, B: 15, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4.04, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 3, B: 12, C: 11, D: 7, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'KJB201', emnenavn: 'Laboratoriekurs i biokjemi og matkjemi', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['KJB201-1'],
            years: [
              { year: 2021, A: 7, B: 12, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4.04, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 3, B: 11, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 9, B: 15, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 5, B: 11, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.84, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 6, B: 15, C: 12, D: 4, E: 0, F: 3, G: 0, H: 0, total: 40, snitt: 3.35, strykprosent: 7.5, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO210', emnenavn: 'Molekylærbiologi', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BIO210-1'],
            years: [
              { year: 2021, A: 9, B: 8, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.82, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 16, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4.73, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 6, B: 20, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.91, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 18, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.69, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 6, B: 17, C: 11, D: 3, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.7, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO235', emnenavn: 'Introduksjon til produktutvikling og produksjon i utvalgte bioteknologibedrifter', studiepoeng: 5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BIO235-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 10, H: 0, total: 10, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO211', emnenavn: 'Laboratorieøvelser i molekylærbiologi', studiepoeng: 5, aar: 3, semester: 'januarblokk',
            dbhEmnekoder: ['BIO211-1'], merknad: 'Obligatorisk valg mellom BIO211 (tas i januarblokk) og BIO233 Eksperimentell miljømikrobiologi (tas i vårsemesteret) - studieplanen krever minst ett av de to.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 31, H: 0, total: 31, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 30, H: 0, total: 30, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO230', emnenavn: 'Generell mikrobiologi II', studiepoeng: 5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BIO230-1'],
            years: [
              { year: 2021, A: 6, B: 10, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.72, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 5, B: 12, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.05, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 4, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.06, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 7, C: 15, D: 3, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.16, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 7, B: 4, C: 10, D: 4, E: 0, F: 3, G: 0, H: 0, total: 28, snitt: 3.18, strykprosent: 10.7, bestattprosent: null, skjult: 1 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uib_molekylarbiologi', shortName: 'UiB Molekylærbiologi', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Molekylærbiologi (bachelor)',
        studieplanAar: '2025/2026', kilder: ['https://www.uib.no/studier/BAMN-MOL', 'https://www4.uib.no/studier/program/molekylaerbiologi-bachelor/plan'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 120,
        merknad: 'Kilde er UiBs programside og tilhørende «plan»-side for BAMN-MOL. Alle emnene i studieplanen er 10 studiepoeng (standard UiB-norm, 3 emner per semester = 30 sp). 3. semester har i tillegg et valgfritt emne i matematikk/statistikk (10 sp, ikke navngitt i kilden) som ikke er tatt med. 5. semester er satt av til tre fullt valgfrie emner (30 sp, anbefalt utvekslingssemester) og er ikke tatt med. 6. semester består av Examen philosophicum (10 sp) pluss to valgfrie emner (20 sp, ikke navngitt); kun exphil er tatt med. obligatoriskeStudiepoeng (120) = summen av de 12 navngitte emnene; sammen med valgfrie emner (10 sem3 + 30 sem5 + 20 sem6 = 60 sp) gir dette totaltStudiepoeng=180. Kildedokumentet beskriver ingen egne navngitte studieretninger/spesialiseringer for bachelorprogrammet - studenten velger selv fordypning gjennom valgfrie emner i 3., 5. og 6. semester.',
        obligatoriske: [
          {
            emnekode: 'MOL100', emnenavn: 'Innføring i molekylærbiologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MOL100-0'],
            years: [
              { year: 2021, A: 4, B: 18, C: 13, D: 11, E: 0, F: 0, G: 0, H: 0, total: 46, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 10, B: 11, C: 10, D: 9, E: 4, F: 5, G: 0, H: 0, total: 49, snitt: 2.98, strykprosent: 10.2, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 6, B: 24, C: 11, D: 10, E: 4, F: 0, G: 0, H: 0, total: 55, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 11, B: 15, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 3.83, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 10, B: 13, C: 22, D: 3, E: 0, F: 0, G: 0, H: 0, total: 48, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 8 },
            ],
          },
          {
            emnekode: 'MAT101', emnenavn: 'Brukarkurs i matematikk I', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MAT101-0'], merknad: 'Obligatorisk valg mellom MAT101 Brukarkurs i matematikk I og MAT111 Grunnkurs i matematikk I.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 33, H: 3, total: 36, snitt: null, strykprosent: null, bestattprosent: 91.7, skjult: 2 },
              { year: 2022, A: 5, B: 6, C: 7, D: 10, E: 8, F: 3, G: 0, H: 0, total: 39, snitt: 2.51, strykprosent: 7.7, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 6, C: 7, D: 7, E: 7, F: 0, G: 0, H: 0, total: 27, snitt: 2.44, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 3, C: 14, D: 3, E: 6, F: 0, G: 0, H: 0, total: 26, snitt: 2.54, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 5, B: 5, C: 3, D: 8, E: 8, F: 6, G: 0, H: 0, total: 35, snitt: 2.23, strykprosent: 17.1, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'KJEM110', emnenavn: 'Kjemi og energi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJEM110-0'],
            years: [
              { year: 2021, A: 0, B: 15, C: 15, D: 8, E: 0, F: 4, G: 0, H: 0, total: 42, snitt: 2.88, strykprosent: 9.5, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 5, B: 9, C: 9, D: 15, E: 10, F: 13, G: 0, H: 0, total: 61, snitt: 2.1, strykprosent: 21.3, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 4, B: 5, C: 13, D: 3, E: 10, F: 19, G: 0, H: 0, total: 54, snitt: 1.76, strykprosent: 35.2, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 7, C: 15, D: 12, E: 5, F: 6, G: 0, H: 0, total: 45, snitt: 2.27, strykprosent: 13.3, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 5, C: 14, D: 15, E: 10, F: 11, G: 0, H: 0, total: 55, snitt: 1.85, strykprosent: 20, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MOL102', emnenavn: 'Eksperimentell molekylærbiologi I', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MOL102-0'],
            years: [
              { year: 2024, A: 0, B: 8, C: 16, D: 15, E: 3, F: 0, G: 0, H: 0, total: 42, snitt: 2.69, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 6, B: 16, C: 15, D: 8, E: 3, F: 0, G: 0, H: 0, total: 48, snitt: 3.29, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'INF100', emnenavn: 'Programmering I', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['INF100-0'],
            years: [
              { year: 2021, A: 0, B: 6, C: 9, D: 18, E: 10, F: 5, G: 0, H: 0, total: 48, snitt: 2.02, strykprosent: 10.4, bestattprosent: null, skjult: 8 },
              { year: 2022, A: 3, B: 6, C: 12, D: 12, E: 7, F: 0, G: 0, H: 0, total: 40, snitt: 2.65, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 3, B: 10, C: 15, D: 12, E: 7, F: 0, G: 0, H: 0, total: 47, snitt: 2.79, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 3, B: 7, C: 6, D: 9, E: 12, F: 3, G: 0, H: 0, total: 40, snitt: 2.27, strykprosent: 7.5, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 8, C: 9, D: 7, E: 4, F: 0, G: 0, H: 0, total: 28, snitt: 2.75, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'KJEM130', emnenavn: 'Organisk kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJEM130-0'],
            years: [
              { year: 2021, A: 6, B: 7, C: 7, D: 14, E: 7, F: 5, G: 0, H: 0, total: 46, snitt: 2.48, strykprosent: 10.9, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 8, B: 10, C: 13, D: 6, E: 0, F: 5, G: 0, H: 0, total: 42, snitt: 3.12, strykprosent: 11.9, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 12, B: 9, C: 12, D: 6, E: 4, F: 5, G: 0, H: 0, total: 48, snitt: 3.08, strykprosent: 10.4, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 9, B: 15, C: 12, D: 6, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2025, A: 8, B: 10, C: 8, D: 9, E: 0, F: 3, G: 0, H: 0, total: 38, snitt: 3.21, strykprosent: 7.9, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'MOL103', emnenavn: 'Genstruktur, -funksjon og applikasjonar', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MOL103-0'],
            years: [
              { year: 2021, A: 12, B: 15, C: 15, D: 9, E: 3, F: 0, G: 0, H: 0, total: 54, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 8, B: 13, C: 22, D: 5, E: 3, F: 0, G: 0, H: 0, total: 51, snitt: 3.35, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 6, B: 14, C: 12, D: 7, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.49, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 5, B: 11, C: 15, D: 10, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.27, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 4, B: 15, C: 17, D: 0, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'MOL200', emnenavn: 'Metabolisme; reaksjonar, regulering og kompartmentalisering', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MOL200-0'],
            years: [
              { year: 2021, A: 3, B: 9, C: 19, D: 3, E: 3, F: 0, G: 0, H: 0, total: 37, snitt: 3.16, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 8, B: 10, C: 10, D: 9, E: 8, F: 0, G: 0, H: 0, total: 45, snitt: 3.02, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 8, B: 9, C: 11, D: 8, E: 7, F: 0, G: 0, H: 0, total: 43, snitt: 3.07, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 6, B: 9, C: 11, D: 3, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 17, B: 15, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 44, snitt: 4.05, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MOL201', emnenavn: 'Molekylær cellebiologi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MOL201-0'],
            years: [
              { year: 2021, A: 4, B: 8, C: 7, D: 15, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.03, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 5, B: 3, C: 7, D: 12, E: 5, F: 0, G: 0, H: 0, total: 32, snitt: 2.72, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 8, B: 11, C: 7, D: 11, E: 10, F: 0, G: 0, H: 0, total: 47, snitt: 2.91, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 8, B: 9, C: 7, D: 8, E: 8, F: 3, G: 0, H: 0, total: 43, snitt: 2.81, strykprosent: 7, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 10, B: 13, C: 8, D: 8, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'MOL204', emnenavn: 'Anvendt bioinformatikk', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MOL204-0'],
            years: [
              { year: 2021, A: 9, B: 16, C: 16, D: 13, E: 0, F: 14, G: 0, H: 0, total: 68, snitt: 2.69, strykprosent: 20.6, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 19, C: 21, D: 6, E: 7, F: 3, G: 0, H: 0, total: 56, snitt: 2.82, strykprosent: 5.4, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2024, A: 3, B: 6, C: 8, D: 6, E: 5, F: 0, G: 0, H: 0, total: 28, snitt: 2.86, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 3, B: 26, C: 3, D: 4, E: 0, F: 3, G: 0, H: 0, total: 39, snitt: 3.49, strykprosent: 7.7, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MOL222', emnenavn: 'Eksperimentell molekylærbiologi II', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MOL222-0'],
            years: [
              { year: 2021, A: 6, B: 9, C: 13, D: 0, E: 3, F: 0, G: 0, H: 0, total: 31, snitt: 3.48, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 4, B: 14, C: 13, D: 6, E: 3, F: 0, G: 0, H: 0, total: 40, snitt: 3.25, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 7, B: 11, C: 17, D: 5, E: 5, F: 0, G: 0, H: 0, total: 45, snitt: 3.22, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 6, B: 12, C: 15, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.73, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 5, B: 16, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.74, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'EXPHIL-MNSEM', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['EXPHIL-MNSEM-0'], merknad: 'Studieplanen gir valget mellom seminarvarianten EXPHIL-MNSEM og de andre exphil-variantene ved UiB (bl.a. EXPHIL-MNEKS).',
            years: [
              { year: 2022, A: 0, B: 6, C: 11, D: 3, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.15, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 4, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.4, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2024, A: 0, B: 8, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 3, B: 9, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.88, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uit_bioteknologi', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Bioteknologi (bachelor)',
        studieplanAar: '2025/2026', kilder: ['https://uit.no/utdanning/studieprogram/b-biotek', 'https://uit.no/utdanning/program/oppbygging?studkode=B-BIOTEK&p_document_id=268961', 'https://uit.no/Content/868763/cache=20263108124003/Bachelorgradsprogram%20i%20bioteknologi%20studieplan%20des%202024%20-%20fra%20kull%202025.pdf'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 135,
        merknad: 'Kilde er UiTs studieplan-PDF godkjent 19.9.2024, oppdatert desember 2024, gjeldende fra kull 2025 («Bachelorgradsprogram i bioteknologi»). Studiet er selv delt inn i «obligatoriske programfag (130 stp), valgfag (30 stp) og fellesfag (20 stp)». 4. semester er satt av til «VALG av emnepakke eller utveksling» (30 stp, helt fritt) og er ikke tatt med. To ukodede valgkategorier er heller ikke tatt med som egne emner: «Microemne» (5 stp, 2. semester - fritt valg blant mikroemner å 2,5 stp eller mer) og «5 stp Microemner» (6. semester). I 6. semester må studenten også velge 2 av 4 navngitte statistikk-mikroemner (STA-0001 Sannsynlighetsregning, STA-0002 Data-analysering, STA-0003 Hypotesetesting, STA-0004 Regresjons- og variansanalyse - hvert à 2,5 stp, totalt 5 stp); siden valget er mellom 4 alternativer uten én fast kombinasjon, er ingen av disse ført opp som egne obligatoriske emner. obligatoriskeStudiepoeng (135) = summen av de 13 navngitte emnene over; sammen med de ukodede valgkategoriene (30+5+5+5=45 stp) gir dette totaltStudiepoeng=180. Kildedokumentet beskriver ingen egne navngitte studieretninger/spesialiseringer.',
        obligatoriske: [
          {
            emnekode: 'BIO-1505', emnenavn: 'Innføring i bioteknologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO-1505-1'],
            years: [
              { year: 2023, A: 3, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'KJE-1001', emnenavn: 'Introduksjon til kjemi og kjemisk biologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJE-1001-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 3, D: 6, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 6, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.8, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 3, snitt: 1, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 4, D: 0, E: 0, F: 3, G: 0, H: 0, total: 7, snitt: 1.71, strykprosent: 42.9, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MAT-0001', emnenavn: 'Brukerkurs i matematikk', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MAT-0001-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 0, total: 14, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 10, H: 0, total: 10, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 5, H: 0, total: 5, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 4, H: 0, total: 4, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'MBI-1002', emnenavn: 'Celle- og molekylærbiologi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MBI-1002-1'],
            years: [
              { year: 2021, A: 5, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.13, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 3, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 4, B: 6, C: 0, D: 5, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'KJE-1002', emnenavn: 'Organisk kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJE-1002-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 3, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 3, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'BIO-1601', emnenavn: 'Innføring i mikrobiologi', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO-1601-1'],
            years: [
              { year: 2021, A: 3, B: 5, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.69, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 3, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 6, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.13, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 6, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'KJE-2002', emnenavn: 'Biological chemistry', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['KJE-2002-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO-2630', emnenavn: 'Genetikk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Obligatorisk valg mellom BIO-2630 Genetikk og KJE-1003 Praktisk organisk kjemi (begge 10 stp).',
            years: [],
          },
          {
            emnekode: 'BIO-2601', emnenavn: 'Generell mikrobiologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO-2601-1'],
            years: [
              { year: 2021, A: 4, B: 4, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 3, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BIO-2606', emnenavn: 'Generell og marin bioteknologi', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BIO-2606-1'],
            years: [
              { year: 2021, A: 3, B: 5, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 9, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO-2608', emnenavn: 'Metoder i molekylær bioteknologi', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BIO-2608-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 4, total: 17, snitt: null, strykprosent: null, bestattprosent: 76.5, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 4, total: 12, snitt: null, strykprosent: null, bestattprosent: 66.7, skjult: 4 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 0, total: 7, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 4 },
              { year: 2024, A: 3, B: 3, C: 3, D: 0, E: 0, F: 3, G: 0, H: 0, total: 12, snitt: 3, strykprosent: 25, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 0, total: 7, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'KJE-2004', emnenavn: 'Bioinformatics - An introduction', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['KJE-2004-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.71, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 9 },
              { year: 2023, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2024, A: 0, B: 4, C: 4, D: 0, E: 0, F: 4, G: 0, H: 0, total: 12, snitt: 2.33, strykprosent: 33.3, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 8 },
            ],
          },
          {
            emnekode: 'BIO-2610', emnenavn: 'Bachelor thesis in Biotechnology', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BIO-2610-1'], merknad: 'Obligatorisk valg mellom BIO-2610 (bacheloroppgave i bioteknologi) og KJE-2010 Bachelorprosjekt i kjemi (begge 10 stp).',
            years: [
              { year: 2021, A: 4, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 10, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.77, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'FIL-0700', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['FIL-0700-1'], merknad: 'Studieplanen skriver bare «Ex Phil (10 stp)» uten emnekode; FIL-0700 er Tromsø-varianten - andre UiT-varianter (FIL-0701/0702/0704) kan også oppfylle kravet.',
            years: [
              { year: 2021, A: 0, B: 4, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 3, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.3, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 3, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_bioteknologi_alesund', shortName: 'NTNU Ålesund', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Bioteknologi, Ålesund (bachelor)',
        studieplanAar: '2025/2026', kilder: ['https://www.ntnu.no/studier/427bt', 'https://www.ntnu.no/studier/427bt/studiets-oppbygning', 'https://www.ntnu.no/web/studier/studieplan?p_p_id=studyprogrammeplannerportlet_WAR_studyprogrammeplannerportlet_INSTANCE_KzJMPh2hQuXL&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=studyplan&p_p_cacheability=cacheLevelPage&code=427BT&year=2025'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 180,
        merknad: 'Kilde er NTNUs studieplan-API (studyprogrammeplannerportlet, resource_id=studyplan) for 427BT, kull 2025. Alle 22 emner i programmet er obligatoriske - programmet har ingen valgfag eller egne studieretninger. Studiepoengsummen per semester er jevnt 30 sp (7,5 sp x 4 emner, unntatt 5. og 6. semester som har noen større emner: MB301712 Anvendt bioteknologi 15 sp og BTA3002 Bacheloroppgave 22,5 sp). HMS0001 er et obligatorisk 0-poengs HMS-kurs.',
        obligatoriske: [
          {
            emnekode: 'BR100121', emnenavn: 'Matematikk og statistikk', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BR100121-1'],
            years: [
              { year: 2022, A: 6, B: 10, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.1, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 6, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.25, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 4, B: 6, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.88, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 0, D: 4, E: 0, F: 5, G: 0, H: 0, total: 9, snitt: 0.89, strykprosent: 55.6, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'BTA1001', emnenavn: 'Generell mikrobiologi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BTA1001-1'],
            years: [
              { year: 2021, A: 7, B: 8, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.16, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 11, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.65, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 8, C: 0, D: 5, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.23, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 7, C: 6, D: 6, E: 3, F: 0, G: 0, H: 0, total: 22, snitt: 2.77, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 4, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.14, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'HBIOA1004', emnenavn: 'Generell kjemi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HBIOA1004-1'],
            years: [
              { year: 2021, A: 8, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.36, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 7, B: 8, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.1, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 6, B: 4, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 4, B: 8, C: 4, D: 0, E: 4, F: 0, G: 0, H: 0, total: 20, snitt: 3.4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 4, B: 3, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 10, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'HBIOA1005', emnenavn: 'Anatomi, fysiologi og histologi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HBIOA1005-1'],
            years: [
              { year: 2021, A: 0, B: 6, C: 0, D: 5, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.09, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 0, B: 5, C: 5, D: 3, E: 0, F: 5, G: 0, H: 0, total: 18, snitt: 2.28, strykprosent: 27.8, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 6, C: 0, D: 0, E: 0, F: 4, G: 0, H: 0, total: 10, snitt: 2.4, strykprosent: 40, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 0, B: 3, C: 3, D: 7, E: 3, F: 4, G: 0, H: 0, total: 20, snitt: 1.9, strykprosent: 20, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 3, C: 4, D: 0, E: 4, F: 3, G: 0, H: 0, total: 14, snitt: 2, strykprosent: 21.4, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'HMS0001', emnenavn: 'HMS-kurs for 1. årsstudenter', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0001-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 0, total: 15, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BTA2004', emnenavn: 'Grunnleggende bioteknologi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BTA2004-1'],
            years: [
              { year: 2022, A: 4, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 6, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 0, total: 32, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'HBIOA1002', emnenavn: 'Organisk kjemi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['HBIOA1002-1'],
            years: [
              { year: 2021, A: 5, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.38, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2022, A: 3, B: 7, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 13, snitt: 3.54, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 11, B: 3, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.1, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 6, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.25, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 3, B: 5, C: 8, D: 0, E: 0, F: 4, G: 0, H: 0, total: 20, snitt: 2.95, strykprosent: 20, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'HBIOA1003', emnenavn: 'Biokjemi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['HBIOA1003-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 13, D: 4, E: 0, F: 3, G: 0, H: 0, total: 20, snitt: 2.35, strykprosent: 15, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 0, C: 5, D: 3, E: 0, F: 3, G: 0, H: 0, total: 11, snitt: 1.91, strykprosent: 27.3, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 0, B: 3, C: 7, D: 3, E: 6, F: 0, G: 0, H: 0, total: 19, snitt: 2.37, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 5, D: 3, E: 0, F: 5, G: 0, H: 0, total: 13, snitt: 1.62, strykprosent: 38.5, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 4, C: 3, D: 5, E: 3, F: 8, G: 0, H: 0, total: 23, snitt: 1.65, strykprosent: 34.8, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'HBIOA1006', emnenavn: 'Instrumentell analyse I', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['HBIOA1006-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 6, D: 7, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 2.82, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 0, B: 4, C: 4, D: 5, E: 4, F: 0, G: 0, H: 0, total: 17, snitt: 2.47, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 6, C: 3, D: 5, E: 4, F: 3, G: 0, H: 0, total: 21, snitt: 2.24, strykprosent: 14.3, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 3, D: 4, E: 4, F: 6, G: 0, H: 0, total: 17, snitt: 1.24, strykprosent: 35.3, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 0, C: 3, D: 6, E: 8, F: 5, G: 0, H: 0, total: 22, snitt: 1.32, strykprosent: 22.7, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'BTA2001', emnenavn: 'Ernæring', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BTA2001-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 8, D: 5, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 2.62, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 0, B: 0, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2023, A: 0, B: 8, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 5, C: 5, D: 5, E: 3, F: 0, G: 0, H: 0, total: 18, snitt: 2.67, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 3, C: 7, D: 3, E: 3, F: 3, G: 0, H: 0, total: 19, snitt: 2.21, strykprosent: 15.8, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BTA2002', emnenavn: 'Mikrobiell økologi', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BTA2002-1'],
            years: [
              { year: 2021, A: 9, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.22, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 9, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 8, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.29, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 6, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.23, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 10, B: 5, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.05, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'HBIOA2004', emnenavn: 'Celle- og molekylærbiologi', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['HBIOA2004-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 3, E: 5, F: 6, G: 0, H: 0, total: 14, snitt: 0.79, strykprosent: 42.9, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 6, D: 0, E: 0, F: 5, G: 0, H: 0, total: 11, snitt: 1.64, strykprosent: 45.5, bestattprosent: null, skjult: 13 },
              { year: 2023, A: 3, B: 5, C: 3, D: 5, E: 3, F: 0, G: 0, H: 0, total: 19, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 3, B: 0, C: 0, D: 4, E: 0, F: 5, G: 0, H: 0, total: 12, snitt: 1.92, strykprosent: 41.7, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 4, C: 6, D: 0, E: 0, F: 8, G: 0, H: 0, total: 18, snitt: 1.89, strykprosent: 44.4, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'HBIOA2005', emnenavn: 'Instrumentell analyse II', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['HBIOA2005-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 4, D: 4, E: 3, F: 7, G: 0, H: 0, total: 18, snitt: 1.28, strykprosent: 38.9, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 6, E: 4, F: 0, G: 0, H: 0, total: 10, snitt: 1.6, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2023, A: 0, B: 6, C: 5, D: 5, E: 3, F: 0, G: 0, H: 0, total: 19, snitt: 2.74, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 0, D: 5, E: 7, F: 0, G: 0, H: 0, total: 12, snitt: 1.42, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 0, B: 0, C: 5, D: 8, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 2.38, strykprosent: 0, bestattprosent: null, skjult: 8 },
            ],
          },
          {
            emnekode: 'BIA1001', emnenavn: 'Marint råstoff', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BIA1001-1'],
            years: [
              { year: 2021, A: 0, B: 10, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 10, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 7, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.22, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 5, C: 4, D: 3, E: 0, F: 3, G: 0, H: 0, total: 15, snitt: 2.53, strykprosent: 20, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'EXPH0300', emnenavn: 'Examen philosophicum for naturvitenskap og teknologi', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['EXPH0300-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 7, D: 5, E: 3, F: 0, G: 0, H: 0, total: 15, snitt: 2.27, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 4, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.08, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 5, C: 7, D: 6, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 2.94, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 4, D: 7, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 2.36, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'HBIOA2003', emnenavn: 'Immunologi og immunologiske teknikker', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['HBIOA2003-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 4, D: 3, E: 6, F: 4, G: 0, H: 0, total: 17, snitt: 1.41, strykprosent: 23.5, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 5, C: 0, D: 0, E: 7, F: 7, G: 0, H: 0, total: 19, snitt: 1.42, strykprosent: 36.8, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 0, C: 6, D: 6, E: 6, F: 5, G: 0, H: 0, total: 23, snitt: 1.57, strykprosent: 21.7, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 3, C: 0, D: 4, E: 3, F: 6, G: 0, H: 0, total: 16, snitt: 1.44, strykprosent: 37.5, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'HBIOA2007', emnenavn: 'Anvendt bioinformatikk', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['HBIOA2007-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 0, total: 14, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BI2081', emnenavn: 'Natur, miljø og bærekraft', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BI2081-1'],
            years: [
              { year: 2023, A: 0, B: 5, C: 0, D: 3, E: 4, F: 0, G: 0, H: 0, total: 12, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 9, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.32, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 6, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.21, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BTA3001', emnenavn: 'Prosessteknologi', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BTA3001-1'],
            years: [
              { year: 2022, A: 0, B: 3, C: 0, D: 0, E: 5, F: 0, G: 0, H: 0, total: 8, snitt: 2.12, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 4, B: 0, C: 4, D: 0, E: 0, F: 3, G: 0, H: 0, total: 11, snitt: 2.91, strykprosent: 27.3, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 3, B: 4, C: 4, D: 5, E: 4, F: 0, G: 0, H: 0, total: 20, snitt: 2.85, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 3, B: 0, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.3, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'MB301712', emnenavn: 'Anvendt bioteknologi', studiepoeng: 15, aar: 3, semester: 'høst',
            dbhEmnekoder: ['MB301712-1'],
            years: [
              { year: 2021, A: 4, B: 5, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.93, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 7, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 5, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.38, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 9, B: 5, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.28, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 7, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.64, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BTA3002', emnenavn: 'Bacheloroppgave for bioteknologi', studiepoeng: 22.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BTA3002-1'],
            years: [
              { year: 2022, A: 5, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.36, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 5, B: 11, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.31, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 10, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.54, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 17, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'MN304012', emnenavn: 'Kvalitetssikring og sertifisering', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['MN304012-1'],
            years: [
              { year: 2021, A: 6, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 4, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.07, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 6, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 4, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.09, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 10, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.54, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_bioteknologi_5aar', shortName: 'NTNU Trondheim', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Bioteknologi (master 5 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.ntnu.no/studier/mbiot5', 'https://www.ntnu.no/studier/mbiot5/studiets-oppbygning', 'https://www.ntnu.no/studier/studieplan#programmeCode=MBIOT5&year=2026'],
        totaltStudiepoeng: 300, obligatoriskeStudiepoeng: 180,
        merknad: 'Kilde er NTNUs interaktive studieplan for kull 2026 (studieplan#programmeCode=MBIOT5&year=2026), lest ut via nettleser siden emnetabellene lastes med JavaScript. Programmet er et realfagsløp (ikke sivilingeniør). De tre første semestrene er felles for alle. I 1. år høst velges MA0001 eller MA1101 (samme innhold, ulikt læringsutbytte-nivå, 7,5 sp), i 1. år vår MA0002 eller MA1102 (7,5 sp) - obligatoriske valg, ikke ført opp som egne rader. I 2. år høst velges ett av fire «områdeemner» (ØKO1001, ITO1000, IØ2000, BI2081, alle 7,5 sp) - obligatorisk valg, ikke ført opp. Retningsvalg (veivalg) skjer innen 3. år med frist oppgitt til 2028-06-10 for dette kullet; de tre veivalgene er Biokjemi og biopolymerkjemi, Molekylærbiologi og Systembiologi. Utover de emnene som er ført opp under hvert veivalg, inneholder hvert semester fra 3. år også valgfrie emner (status V/VB) som ikke er obligatoriske og derfor ikke er tatt med. I tillegg er Eksperter i team (EiT) obligatorisk som kategori i 4. år vår, men studenten velger selv landsby/emne - ingen enkelt emnekode er obligatorisk, og EiT er derfor ikke ført opp med egen rad eller studiepoeng. I 5. år vår kan et obligatorisk valg mellom BI3091 og BT3091 «spesialpensum» (7,5 sp, status M1B) komme i tillegg til masteroppgaven ved enkelte institutter; dette er ikke talt med i obligatoriskeStudiepoeng. Total studiepoengsum er antatt 300 (5 år × 60 sp) i tråd med et 5-årig masterprogram; siden ikke alle rader hadde eksplisitt sp-sum kunne ikke totalen verifiseres emne for emne.',
        obligatoriske: [
          {
            emnekode: 'EXPH0300', emnenavn: 'Examen philosophicum for naturvitenskap og teknologi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['EXPH0300-1'],
            years: [
              { year: 2021, A: 0, B: 15, C: 21, D: 3, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.31, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 7, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.39, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 15, C: 22, D: 4, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.27, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'HMS0001', emnenavn: 'HMS-kurs for 1. årsstudenter', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0001-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 40, H: 0, total: 40, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 31, H: 0, total: 31, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 0, total: 32, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BT1101', emnenavn: 'Introduksjon til bioteknologi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BT1101-1'],
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 34, H: 0, total: 34, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 0, total: 35, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 36, H: 0, total: 36, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'KJ1004', emnenavn: 'Generell kjemi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJ1004-1'],
            years: [
              { year: 2025, A: 22, B: 0, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 4.41, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BI1001', emnenavn: 'Celle- og molekylærbiologi', studiepoeng: 15, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BI1001-1'],
            years: [
              { year: 2021, A: 0, B: 11, C: 12, D: 5, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.21, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 3, B: 14, C: 20, D: 0, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.54, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 5, C: 11, D: 10, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 2.81, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 9, C: 15, D: 4, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.18, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 7, B: 8, C: 9, D: 4, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'TKJ4103', emnenavn: 'Organisk kjemi grunnkurs', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'ST0103', emnenavn: 'Brukerkurs i statistikk', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['ST0103-1'],
            years: [
              { year: 2021, A: 4, B: 5, C: 4, D: 4, E: 4, F: 3, G: 0, H: 0, total: 24, snitt: 2.67, strykprosent: 12.5, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 6, B: 11, C: 13, D: 7, E: 3, F: 4, G: 0, H: 0, total: 44, snitt: 2.95, strykprosent: 9.1, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 3, B: 5, C: 5, D: 5, E: 3, F: 0, G: 0, H: 0, total: 21, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 10, B: 8, C: 5, D: 0, E: 3, F: 0, G: 0, H: 0, total: 26, snitt: 3.85, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 15, B: 3, C: 5, D: 4, E: 3, F: 0, G: 0, H: 0, total: 30, snitt: 3.77, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'TBT4102', emnenavn: 'Biokjemi 1', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['TBT4102-1'],
            years: [
              { year: 2021, A: 4, B: 7, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 10, C: 14, D: 9, E: 3, F: 3, G: 0, H: 0, total: 39, snitt: 2.64, strykprosent: 7.7, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 5, B: 5, C: 4, D: 6, E: 3, F: 0, G: 0, H: 0, total: 23, snitt: 3.13, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 3, B: 7, C: 7, D: 5, E: 0, F: 4, G: 0, H: 0, total: 26, snitt: 2.85, strykprosent: 15.4, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 11, B: 6, C: 6, D: 3, E: 0, F: 4, G: 0, H: 0, total: 30, snitt: 3.43, strykprosent: 13.3, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'TDT4110', emnenavn: 'Informasjonsteknologi, grunnkurs', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['TDT4110-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2022, A: 0, B: 16, C: 7, D: 4, E: 3, F: 0, G: 0, H: 0, total: 30, snitt: 3.2, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 3, D: 11, E: 5, F: 4, G: 0, H: 0, total: 23, snitt: 1.57, strykprosent: 17.4, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 3, B: 4, C: 10, D: 18, E: 12, F: 4, G: 0, H: 0, total: 51, snitt: 2.14, strykprosent: 7.8, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 3, B: 8, C: 9, D: 6, E: 5, F: 0, G: 0, H: 0, total: 31, snitt: 2.94, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BT2100', emnenavn: 'Beregningsbasert bioteknologi', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BT2100-1'],
            years: [
              { year: 2022, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 21, B: 8, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 4.17, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 8, B: 7, C: 4, D: 0, E: 3, F: 0, G: 0, H: 0, total: 22, snitt: 3.77, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 10, B: 9, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 4.16, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'TBT4107', emnenavn: 'Biokjemi 2', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['TBT4107-1'],
            years: [
              { year: 2021, A: 0, B: 8, C: 9, D: 3, E: 5, F: 3, G: 0, H: 0, total: 28, snitt: 2.5, strykprosent: 10.7, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 5, D: 5, E: 3, F: 10, G: 0, H: 0, total: 23, snitt: 1.22, strykprosent: 43.5, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 7, C: 10, D: 7, E: 6, F: 8, G: 0, H: 0, total: 38, snitt: 2.05, strykprosent: 21.1, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 4, C: 6, D: 3, E: 4, F: 5, G: 0, H: 0, total: 22, snitt: 2, strykprosent: 22.7, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 0, B: 8, C: 5, D: 7, E: 0, F: 4, G: 0, H: 0, total: 24, snitt: 2.54, strykprosent: 16.7, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'TBT4110', emnenavn: 'Mikrobiologi', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['TBT4110-1'],
            years: [
              { year: 2021, A: 3, B: 11, C: 12, D: 0, E: 3, F: 0, G: 0, H: 0, total: 29, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 6, C: 10, D: 3, E: 6, F: 0, G: 0, H: 0, total: 25, snitt: 2.64, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 11, C: 10, D: 3, E: 4, F: 0, G: 0, H: 0, total: 28, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2024, A: 4, B: 6, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 17, B: 8, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'TKJ4162', emnenavn: 'Fysikalsk kjemi: Kjemisk termodynamikk', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['TKJ4162-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 0, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'BI2014', emnenavn: 'Molekylærbiologi', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BI2014-1'], merknad: 'Obligatorisk i alle tre veivalg (Biokjemi og biopolymerkjemi, Molekylærbiologi, Systembiologi).',
            years: [
              { year: 2021, A: 0, B: 0, C: 13, D: 10, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 2.57, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 0, B: 0, C: 14, D: 5, E: 0, F: 3, G: 0, H: 0, total: 22, snitt: 2.36, strykprosent: 13.6, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 4, B: 5, C: 8, D: 9, E: 0, F: 5, G: 0, H: 0, total: 31, snitt: 2.65, strykprosent: 16.1, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 4, C: 0, D: 0, E: 0, F: 4, G: 0, H: 0, total: 8, snitt: 2, strykprosent: 50, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 5, B: 7, C: 7, D: 0, E: 0, F: 5, G: 0, H: 0, total: 24, snitt: 3.08, strykprosent: 20.8, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BT3220', emnenavn: 'Videregående bioteknologi', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BT3220-1'], merknad: 'Obligatorisk i alle tre veivalg.',
            years: [
              { year: 2021, A: 6, B: 16, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 24, B: 13, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 4.65, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 11, B: 15, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 4.42, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 4, B: 14, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.05, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'ST2304', emnenavn: 'Statistisk modellering for biologer/bioteknologer', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['ST2304-1'], merknad: 'Obligatorisk i alle tre veivalg.',
            years: [
              { year: 2021, A: 0, B: 17, C: 12, D: 4, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.39, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 3, B: 5, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 3, C: 9, D: 3, E: 4, F: 0, G: 0, H: 0, total: 19, snitt: 2.58, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 6, C: 10, D: 8, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 2.92, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 4, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.08, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'HMS0003', emnenavn: 'HMS-kurs for masterstudenter', studiepoeng: 0, aar: 4, semester: 'høst',
            dbhEmnekoder: ['HMS0003-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 38, H: 0, total: 38, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'HBIOT3910', emnenavn: 'Masteroppgave i bioteknologi', studiepoeng: 60, aar: 4, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Studieplanen fører opp masteroppgaven som et obligatorisk valg (status M1A) mellom fire emnekoder etter hvilket institutt/studiested masteroppgaven skrives ved: HBIOT3910 (institutt for bioteknologi og matvitenskap, 2 deler à 30 sp i 4. år), BIOTBT3900 (samme institutt, 4 deler à 15 sp over 4. og 5. år), BIOTBI3900 (institutt for biologi, 4 deler) og BIOTBA3900 (IBA Ålesund, 4 deler). Alle gir 60 sp totalt og er reelt obligatoriske for alle studenter, men studieplanen viser ikke selve emnekoden/semesterplasseringen som identisk for alle - HBIOT3910 er brukt som representativ kode her.',
            years: [],
          },
        ],
        spesialiseringer: [
          { navn: 'Biokjemi og biopolymerkjemi', obligatoriske: [
            {
              emnekode: 'KJ2050', emnenavn: 'Analytisk kjemi, grunnkurs', studiepoeng: 7.5, aar: 3, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'TBT4135', emnenavn: 'Biopolymerer', studiepoeng: 7.5, aar: 4, semester: 'høst',
              dbhEmnekoder: ['TBT4135-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
                { year: 2022, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 7 },
                { year: 2024, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 1 },
                { year: 2025, A: 0, B: 0, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 4 },
              ],
            },
          ] },
          { navn: 'Molekylærbiologi', obligatoriske: [
            {
              emnekode: 'BI2015', emnenavn: 'Molekylærbiologi, laboratoriekurs', studiepoeng: 7.5, aar: 3, semester: 'høst',
              dbhEmnekoder: ['BI2015-1'],
              years: [
                { year: 2021, A: 4, B: 12, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.77, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2022, A: 0, B: 5, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.15, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2023, A: 6, B: 8, C: 4, D: 0, E: 3, F: 0, G: 0, H: 0, total: 21, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 1 },
                { year: 2024, A: 0, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 5 },
                { year: 2025, A: 3, B: 5, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 2 },
              ],
            },
            {
              emnekode: 'BI2012', emnenavn: 'Cellebiologi', studiepoeng: 7.5, aar: 3, semester: 'vår',
              dbhEmnekoder: ['BI2012-1'],
              years: [
                { year: 2021, A: 4, B: 12, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.95, strykprosent: 0, bestattprosent: null, skjult: 4 },
                { year: 2022, A: 6, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.19, strykprosent: 0, bestattprosent: null, skjult: 0 },
                { year: 2023, A: 0, B: 0, C: 7, D: 3, E: 4, F: 0, G: 0, H: 0, total: 14, snitt: 2.21, strykprosent: 0, bestattprosent: null, skjult: 5 },
                { year: 2024, A: 3, B: 7, C: 4, D: 3, E: 0, F: 3, G: 0, H: 0, total: 20, snitt: 3.05, strykprosent: 15, bestattprosent: null, skjult: 2 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 8 },
              ],
            },
            {
              emnekode: 'BI3016', emnenavn: 'Molekylær cellebiologi', studiepoeng: 7.5, aar: 4, semester: 'høst',
              dbhEmnekoder: ['BI3016-1'],
              years: [
                { year: 2021, A: 4, B: 5, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 1 },
                { year: 2022, A: 0, B: 0, C: 8, D: 0, E: 3, F: 0, G: 0, H: 0, total: 11, snitt: 2.45, strykprosent: 0, bestattprosent: null, skjult: 7 },
                { year: 2023, A: 0, B: 0, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 8 },
                { year: 2024, A: 3, B: 0, C: 4, D: 0, E: 0, F: 6, G: 0, H: 0, total: 13, snitt: 2.08, strykprosent: 46.2, bestattprosent: null, skjult: 4 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
              ],
            },
          ] },
          { navn: 'Systembiologi', obligatoriske: [
            {
              emnekode: 'TMA4413', emnenavn: 'Matematikk 2D: Lineær algebra og differensialligninger', studiepoeng: 7.5, aar: 3, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'TBT4165', emnenavn: 'Systembiologi og biologiske nettverk', studiepoeng: 7.5, aar: 3, semester: 'vår',
              dbhEmnekoder: ['TBT4165-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2022, A: 3, B: 5, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.92, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2023, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2024, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 8 },
                { year: 2025, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              ],
            },
            {
              emnekode: 'TKP4195', emnenavn: 'Bio-system teknologi', studiepoeng: 7.5, aar: 4, semester: 'vår',
              dbhEmnekoder: ['TKP4195-1'],
              years: [
                { year: 2021, A: 0, B: 5, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 4 },
                { year: 2022, A: 4, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.44, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2023, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2024, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
                { year: 2025, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              ],
            },
          ] },
        ],
      },
      {
        entryId: 'uio_biovitenskap', shortName: 'UiO Biovitenskap', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Biovitenskap (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'oslomet_ing_bioteknologi_kjemi', shortName: 'OsloMet', institusjon: 'OsloMet - storbyuniversitetet', isNmbu: false, programnavn: 'Ingeniør, bioteknologi og kjemi (bachelor)',
        studieplanAar: '2026 (kull høst 2026)', kilder: ['https://www.oslomet.no/studier/tkd/bioteknologi-kjemiingenior', 'https://student.oslomet.no/studier/-/studieinfo/programplan/HINGKJEMI/2026/H%C3%98ST'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 160,
        merknad: 'Kilde er programplanen for kull HINGKJEMI gjeldende fra høst 2026 på student.oslomet.no, lest ut interaktivt (retningsvalget «Bioteknologi og kjemi», ikke tretermin-varianten «Bioteknologi og kjemi for tretermin» som er et alternativt studieløp over flere terminer per år for samme grad). I 3. år høst er kun KJM3500 (10 sp) obligatorisk; de resterende 20 sp fylles med valgfrie emner (status «Valgbart») blant KJVE3510 Analytisk kjemi II, MEK3100 Avansert Python-programmering for ingeniører, DAVE3700 Matematikk 3000, DAVE3710 Akademisk Engelsk og BYGG3200 Planlegging, behandling og drift av vann og avløp - disse er ikke tatt med i obligatoriske-lista. Programmet er 180 sp over 6 semestre (3 år).',
        obligatoriske: [
          {
            emnekode: 'KJM1100', emnenavn: 'Helse, miljø og sikkerhet', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJM1100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 97, H: 0, total: 97, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 39, H: 3, total: 42, snitt: null, strykprosent: null, bestattprosent: 92.9, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 57, H: 5, total: 62, snitt: null, strykprosent: null, bestattprosent: 91.9, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 57, H: 10, total: 67, snitt: null, strykprosent: null, bestattprosent: 85.1, skjult: 0 },
            ],
          },
          {
            emnekode: 'MEK1000', emnenavn: 'Matematikk 1000', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MEK1000-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 5, D: 6, E: 6, F: 13, G: 5, H: 3, total: 38, snitt: 1.1, strykprosent: 43.3, bestattprosent: 62.5, skjult: 3 },
              { year: 2022, A: 0, B: 5, C: 6, D: 6, E: 12, F: 12, G: 0, H: 0, total: 41, snitt: 1.51, strykprosent: 29.3, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 0, C: 3, D: 8, E: 11, F: 20, G: 0, H: 0, total: 42, snitt: 0.86, strykprosent: 47.6, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 3, B: 0, C: 12, D: 6, E: 13, F: 13, G: 0, H: 0, total: 47, snitt: 1.62, strykprosent: 27.7, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 4, C: 12, D: 11, E: 11, F: 11, G: 0, H: 0, total: 49, snitt: 1.73, strykprosent: 22.4, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'MEK1300', emnenavn: 'Introduksjon til python-programmering', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MEK1300-1'],
            years: [
              { year: 2021, A: 4, B: 10, C: 21, D: 5, E: 5, F: 13, G: 0, H: 0, total: 58, snitt: 2.38, strykprosent: 22.4, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 0, C: 9, D: 15, E: 10, F: 14, G: 0, H: 0, total: 51, snitt: 1.61, strykprosent: 27.5, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 8, C: 19, D: 15, E: 10, F: 5, G: 0, H: 0, total: 57, snitt: 2.26, strykprosent: 8.8, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 6, B: 17, C: 11, D: 10, E: 10, F: 12, G: 0, H: 0, total: 66, snitt: 2.44, strykprosent: 18.2, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 5, C: 18, D: 9, E: 14, F: 5, G: 0, H: 0, total: 51, snitt: 2.08, strykprosent: 9.8, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'KJPE1300', emnenavn: 'Generell kjemi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJPE1300-1'],
            years: [
              { year: 2021, A: 9, B: 13, C: 13, D: 10, E: 10, F: 9, G: 0, H: 0, total: 64, snitt: 2.59, strykprosent: 14.1, bestattprosent: null, skjult: 9 },
              { year: 2022, A: 8, B: 8, C: 5, D: 3, E: 10, F: 10, G: 0, H: 0, total: 44, snitt: 2.34, strykprosent: 22.7, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 9, B: 4, C: 11, D: 5, E: 5, F: 4, G: 0, H: 0, total: 38, snitt: 2.87, strykprosent: 10.5, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 8, B: 6, C: 10, D: 6, E: 9, F: 15, G: 0, H: 0, total: 54, snitt: 2.13, strykprosent: 27.8, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 12, B: 6, C: 24, D: 8, E: 3, F: 5, G: 0, H: 0, total: 58, snitt: 3.02, strykprosent: 8.6, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'MEK1400', emnenavn: 'Fysikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MEK1400-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 92, H: 7, total: 99, snitt: null, strykprosent: null, bestattprosent: 92.9, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 4, D: 0, E: 16, F: 18, G: 0, H: 0, total: 38, snitt: 0.74, strykprosent: 47.4, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 0, B: 0, C: 4, D: 5, E: 11, F: 16, G: 0, H: 0, total: 36, snitt: 0.92, strykprosent: 44.4, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 4, B: 4, C: 8, D: 11, E: 21, F: 23, G: 0, H: 0, total: 71, snitt: 1.45, strykprosent: 32.4, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 3, D: 5, E: 17, F: 49, G: 0, H: 0, total: 74, snitt: 0.49, strykprosent: 66.2, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'KJM1400', emnenavn: 'Organisk kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM1400-1'],
            years: [
              { year: 2021, A: 8, B: 11, C: 31, D: 14, E: 4, F: 15, G: 0, H: 0, total: 83, snitt: 2.52, strykprosent: 18.1, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 4, B: 6, C: 17, D: 7, E: 0, F: 33, G: 0, H: 0, total: 67, snitt: 1.63, strykprosent: 49.3, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 6, B: 6, C: 9, D: 15, E: 0, F: 12, G: 0, H: 0, total: 48, snitt: 2.31, strykprosent: 25, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 5, C: 14, D: 10, E: 11, F: 25, G: 0, H: 0, total: 65, snitt: 1.43, strykprosent: 38.5, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 6, C: 15, D: 9, E: 7, F: 16, G: 0, H: 0, total: 53, snitt: 1.77, strykprosent: 30.2, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'KJM1500', emnenavn: 'Fysikalsk kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM1500-1'],
            years: [
              { year: 2021, A: 9, B: 15, C: 9, D: 9, E: 10, F: 7, G: 0, H: 0, total: 59, snitt: 2.71, strykprosent: 11.9, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 16, B: 10, C: 7, D: 11, E: 15, F: 13, G: 0, H: 0, total: 72, snitt: 2.47, strykprosent: 18.1, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 6, B: 7, C: 9, D: 4, E: 9, F: 8, G: 0, H: 0, total: 43, snitt: 2.37, strykprosent: 18.6, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 13, B: 10, C: 10, D: 7, E: 7, F: 20, G: 0, H: 0, total: 67, snitt: 2.33, strykprosent: 29.9, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 9, B: 11, C: 3, D: 3, E: 12, F: 17, G: 0, H: 0, total: 55, snitt: 2.11, strykprosent: 30.9, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'KJM2400', emnenavn: 'Biokjemi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['KJM2400-1'],
            years: [
              { year: 2021, A: 6, B: 7, C: 9, D: 10, E: 6, F: 4, G: 0, H: 0, total: 42, snitt: 2.64, strykprosent: 9.5, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 7, B: 9, C: 13, D: 3, E: 13, F: 10, G: 0, H: 0, total: 55, snitt: 2.35, strykprosent: 18.2, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 4, B: 6, C: 14, D: 10, E: 6, F: 6, G: 0, H: 0, total: 46, snitt: 2.43, strykprosent: 13, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 8, B: 18, C: 26, D: 13, E: 13, F: 12, G: 0, H: 0, total: 90, snitt: 2.54, strykprosent: 13.3, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 6, B: 8, C: 8, D: 3, E: 7, F: 5, G: 0, H: 0, total: 37, snitt: 2.68, strykprosent: 13.5, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'MEK2000', emnenavn: 'Matematikk 2000', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MEK2000-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 6, D: 12, E: 11, F: 18, G: 0, H: 0, total: 47, snitt: 1.13, strykprosent: 38.3, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 6, B: 13, C: 19, D: 7, E: 13, F: 13, G: 0, H: 0, total: 71, snitt: 2.34, strykprosent: 18.3, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 4, B: 3, C: 7, D: 3, E: 8, F: 15, G: 0, H: 0, total: 40, snitt: 1.68, strykprosent: 37.5, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 7, D: 9, E: 8, F: 28, G: 0, H: 0, total: 52, snitt: 0.9, strykprosent: 53.8, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 0, C: 8, D: 7, E: 11, F: 32, G: 0, H: 0, total: 58, snitt: 0.84, strykprosent: 55.2, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'KJTS2100', emnenavn: 'Kjemiteknikk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['KJTS2100-1'],
            years: [
              { year: 2021, A: 10, B: 6, C: 16, D: 4, E: 4, F: 11, G: 0, H: 0, total: 51, snitt: 2.63, strykprosent: 21.6, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 12, B: 0, C: 13, D: 5, E: 3, F: 3, G: 0, H: 0, total: 36, snitt: 3.11, strykprosent: 8.3, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 13, B: 3, C: 13, D: 8, E: 3, F: 20, G: 0, H: 0, total: 60, snitt: 2.25, strykprosent: 33.3, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 9, B: 8, C: 11, D: 4, E: 11, F: 11, G: 0, H: 0, total: 54, snitt: 2.39, strykprosent: 20.4, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 9, B: 3, C: 15, D: 7, E: 4, F: 9, G: 0, H: 0, total: 47, snitt: 2.55, strykprosent: 19.1, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'KJM3100', emnenavn: 'Bioteknologi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['KJM3100-1'],
            years: [
              { year: 2024, A: 0, B: 5, C: 11, D: 0, E: 0, F: 3, G: 0, H: 0, total: 19, snitt: 2.79, strykprosent: 15.8, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 8, B: 20, C: 18, D: 0, E: 0, F: 7, G: 0, H: 0, total: 53, snitt: 3.28, strykprosent: 13.2, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'MEK2200', emnenavn: 'Statistikk og risikoanalyse', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MEK2200-1'],
            years: [
              { year: 2021, A: 0, B: 12, C: 19, D: 6, E: 4, F: 8, G: 0, H: 0, total: 49, snitt: 2.47, strykprosent: 16.3, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 3, B: 5, C: 18, D: 9, E: 3, F: 15, G: 0, H: 0, total: 53, snitt: 2.08, strykprosent: 28.3, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 3, B: 6, C: 15, D: 7, E: 3, F: 10, G: 0, H: 0, total: 44, snitt: 2.3, strykprosent: 22.7, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 5, B: 10, C: 6, D: 4, E: 0, F: 5, G: 0, H: 0, total: 30, snitt: 3.03, strykprosent: 16.7, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 10, C: 15, D: 6, E: 3, F: 15, G: 0, H: 0, total: 49, snitt: 2.04, strykprosent: 30.6, bestattprosent: null, skjult: 11 },
            ],
          },
          {
            emnekode: 'KJM2300', emnenavn: 'Analytisk kjemi I', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['KJM2300-1'],
            years: [
              { year: 2021, A: 0, B: 11, C: 8, D: 11, E: 8, F: 19, G: 0, H: 0, total: 57, snitt: 1.72, strykprosent: 33.3, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 5, C: 13, D: 8, E: 6, F: 19, G: 0, H: 0, total: 51, snitt: 1.59, strykprosent: 37.3, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 5, B: 9, C: 6, D: 6, E: 10, F: 22, G: 0, H: 0, total: 58, snitt: 1.74, strykprosent: 37.9, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 3, B: 5, C: 0, D: 4, E: 6, F: 23, G: 0, H: 0, total: 41, snitt: 1.2, strykprosent: 56.1, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 5, B: 9, C: 13, D: 6, E: 8, F: 14, G: 0, H: 0, total: 55, snitt: 2.18, strykprosent: 25.5, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'KJM3500', emnenavn: 'Molekylær- og cellebiologi', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['KJM3500-1'],
            years: [
              { year: 2021, A: 10, B: 6, C: 11, D: 6, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.61, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 3, B: 4, C: 4, D: 4, E: 12, F: 8, G: 0, H: 0, total: 35, snitt: 1.8, strykprosent: 22.9, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 3, B: 10, C: 14, D: 0, E: 11, F: 5, G: 0, H: 0, total: 43, snitt: 2.51, strykprosent: 11.6, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 7, B: 9, C: 13, D: 4, E: 0, F: 7, G: 0, H: 0, total: 40, snitt: 2.95, strykprosent: 17.5, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 10, B: 24, C: 13, D: 13, E: 0, F: 3, G: 0, H: 0, total: 63, snitt: 3.35, strykprosent: 4.8, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'STKD6610', emnenavn: 'Technology and Society II', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['STKD6610-1'],
            years: [
              { year: 2023, A: 0, B: 8, C: 10, D: 5, E: 0, F: 6, G: 0, H: 0, total: 29, snitt: 2.48, strykprosent: 20.7, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 3, G: 0, H: 0, total: 3, snitt: 0, strykprosent: 100, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'KJTS3900', emnenavn: 'Bacheloroppgave', studiepoeng: 20, aar: 3, semester: 'vår',
            dbhEmnekoder: ['KJTS3900-1'],
            years: [
              { year: 2021, A: 8, B: 8, C: 10, D: 8, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.47, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 8, B: 16, C: 15, D: 5, E: 0, F: 0, G: 0, H: 0, total: 44, snitt: 3.61, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 6, B: 17, C: 11, D: 4, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 3.66, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 7, B: 9, C: 16, D: 3, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 8, B: 7, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.7, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'kjemi', label: 'Kjemi', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_kjemi', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Kjemi (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/bachelor/kjemi', 'https://www.nmbu.no/fakulteter/fakultet-kjemi-bioteknologi-og-matvitenskap/studieplaner-bachelor-i-kjemi', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-06/B-KJEMI%20kull%202026.pdf'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 125,
        merknad: 'Kilde er NMBUs fargekodede rutenett-studieplan for kull 2026 (énsides PDF «B-KJEMI kull 2026»). Dokumentet oppgir selv «Felles emner: 125 sp. I tillegg velges minst 20 sp valgfrie kjemiemner», og årssummene i rutenettet (60+55+10=125) stemmer eksakt med de 14 navngitte emnene over. Fargekoding i PDF-en skiller obligatoriske emner (grønne celler) fra eksempler på valgfrie emner (kremfargede/hvite celler); følgende emner er vist i rutenettet som eksempler på valgfrie kjemi-/statistikkemner og er IKKE tatt med i obligatoriske-listen: STAT200 Regresjon (alt. til STAT210, vist i 2. år januar), STAT210 Forsøksplanlegging og variansanalyse (vist i 3. år august), KJM211, MILJØ200, KJM311, KJM314 og KJM315 (alle vist i 3. år uten fast plassering/grønnfarge). Celle-bredden (antall 5-sp-kolonner en emnecelle dekker) er brukt til å fastslå studiepoeng per emne, kontrollert mot radens/årets oppgitte sum; blant annet er PHI100 her 10 sp (i motsetning til 5 sp i nmbu_bioteknologi.json, der celle-bredden og radsummen tilsier en kortere variant) - dette gjenspeiler at de to programmenes egne rutenett viser ulik bredde for PHI100-cellen. totaltStudiepoeng er satt til standard 180 sp for et treårig bachelorprogram; differansen på 55 sp (180-125) dekkes av valgfrie emner i 2. og 3. år, hvorav minst 20 sp må være kjemiemner (jf. teksten øverst i kilden). Kildedokumentet beskriver ingen egne studieretninger/spesialiseringer for dette programmet.',
        obligatoriske: [
          {
            emnekode: 'BIO101', emnenavn: 'Introduksjon i bioteknologi og kjemi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO101-1'], merknad: 'Augustblokk før høstsemesteret.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 10, H: 0, total: 10, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO100', emnenavn: 'Cellebiologi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO100-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 3, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 11, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.73, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 7, B: 11, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.39, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MATH100', emnenavn: 'Matematikk', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MATH100-1'], merknad: 'Obligatorisk valg mellom MATH100 og MATH121 (studieplanen lister «Matematikk MATH100 eller MATH121»).',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 5, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2022, A: 0, B: 0, C: 0, D: 3, E: 3, F: 0, G: 0, H: 0, total: 6, snitt: 1.5, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 0, C: 3, D: 0, E: 6, F: 0, G: 0, H: 0, total: 9, snitt: 1.67, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 0, B: 3, C: 0, D: 0, E: 4, F: 0, G: 0, H: 0, total: 7, snitt: 2.29, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 0, C: 5, D: 3, E: 3, F: 5, G: 0, H: 0, total: 16, snitt: 1.5, strykprosent: 31.2, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'INF120', emnenavn: 'Programmering og databehandling', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['INF120-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 0, C: 9, D: 4, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 2.69, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 7, D: 8, E: 3, F: 0, G: 0, H: 0, total: 18, snitt: 2.22, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'KJM100', emnenavn: 'Generell kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM100-1'],
            years: [
              { year: 2021, A: 4, B: 5, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.59, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 3, B: 6, C: 3, D: 3, E: 0, F: 3, G: 0, H: 0, total: 18, snitt: 3, strykprosent: 16.7, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 5, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 11, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4.26, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 5, B: 7, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'STAT100', emnenavn: 'Statistikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['STAT100-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 3, D: 0, E: 3, F: 0, G: 0, H: 0, total: 11, snitt: 2.91, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 3, B: 0, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 0, B: 0, C: 0, D: 4, E: 3, F: 0, G: 0, H: 0, total: 7, snitt: 1.57, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 5, C: 5, D: 0, E: 4, F: 0, G: 0, H: 0, total: 14, snitt: 2.79, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 0, C: 0, D: 3, E: 0, F: 7, G: 0, H: 0, total: 10, snitt: 0.6, strykprosent: 70, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'FYS100', emnenavn: 'Fysikk og natur', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['FYS100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 0, total: 15, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 5, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 0, B: 4, C: 0, D: 0, E: 4, F: 0, G: 0, H: 0, total: 8, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 4, B: 6, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 0, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'KJM110', emnenavn: 'Organisk kjemi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['KJM110-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2024, A: 3, B: 6, C: 5, D: 0, E: 4, F: 0, G: 0, H: 0, total: 18, snitt: 3.22, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 3, C: 0, D: 0, E: 0, F: 3, G: 0, H: 0, total: 6, snitt: 2, strykprosent: 50, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'PHI100', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['PHI100-1'], merknad: 'Studieplanen lister PHI100 (alt. PHI101/PHI102) - studenten velger en av de likeverdige variantene.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 9 },
              { year: 2022, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 9 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 3, G: 0, H: 0, total: 3, snitt: 0, strykprosent: 100, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'INF201', emnenavn: 'Videregående programmering', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['INF201-1'],
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 0, total: 14, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'KJB200', emnenavn: 'Biokjemi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['KJB200-1'],
            years: [
              { year: 2021, A: 3, B: 4, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.47, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 4, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 4, B: 4, C: 5, D: 4, E: 0, F: 4, G: 0, H: 0, total: 21, snitt: 2.81, strykprosent: 19, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'KJM120', emnenavn: 'Uorganisk kjemi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['KJM120-1'],
            years: [
              { year: 2021, A: 10, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.43, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 4, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.1, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 4, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 3, B: 7, C: 4, D: 0, E: 0, F: 3, G: 0, H: 0, total: 17, snitt: 3.24, strykprosent: 17.6, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'KJM230', emnenavn: 'Fysikalsk kjemi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['KJM230-1'],
            years: [
              { year: 2021, A: 4, B: 4, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.82, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 4, B: 0, C: 3, D: 0, E: 3, F: 0, G: 0, H: 0, total: 10, snitt: 3.2, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 5, B: 0, C: 0, D: 0, E: 0, F: 7, G: 0, H: 0, total: 12, snitt: 2.08, strykprosent: 58.3, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 4, B: 6, C: 0, D: 7, E: 6, F: 7, G: 0, H: 0, total: 30, snitt: 2.13, strykprosent: 23.3, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'KJM240', emnenavn: 'Analytisk kjemi', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['KJM240-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 4, D: 11, E: 4, F: 10, G: 0, H: 0, total: 29, snitt: 1.31, strykprosent: 34.5, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 0, C: 3, D: 0, E: 0, F: 4, G: 0, H: 0, total: 7, snitt: 1.29, strykprosent: 57.1, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 0, B: 3, C: 0, D: 0, E: 0, F: 3, G: 0, H: 0, total: 6, snitt: 2, strykprosent: 50, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 9, H: 8, total: 17, snitt: null, strykprosent: null, bestattprosent: 52.9, skjult: 2 },
              { year: 2025, A: 0, B: 5, C: 5, D: 4, E: 8, F: 0, G: 0, H: 3, total: 25, snitt: 2.32, strykprosent: 0, bestattprosent: 0, skjult: 4 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uio_kjemi_biokjemi', shortName: 'UiO', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Kjemi og biokjemi (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.uio.no/studier/program/kjemi-biokjemi/', 'https://www.uio.no/studier/program/kjemi-biokjemi/oppbygging/', 'https://www.uio.no/studier/program/kjemi-biokjemi/studieretninger/kjemi/oppbygging/', 'https://www.uio.no/studier/program/kjemi-biokjemi/studieretninger/biokjemi/oppbygging/'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 80,
        merknad: 'Bachelorprogrammet er delt i to studieretninger fra opptak: Kjemi og Biokjemi. De 100 studiepoengene «obligatoriske fellesemner» er identiske for begge retninger, men to av dem er reelt obligatoriske valg mellom alternativer og er derfor ikke ført opp som egne rader: MAT1050 eller MAT1100 (10 sp, 1. semester) og FYS1001 eller FYS1100 eller det nedlagte FYS-MEK1110 (10 sp, 2. semester). Disse to valgene utgjør de resterende 20 av de 100 sp fellesemner (80 sp er ført opp som faste rader over). Utover fellesemnene krever hver retning i tillegg «obligatoriske fordypningsemner»: Kjemi-retningen krever 40 sp fordypning som i sin helhet består av valg (MAT1060 eller MAT1110, 10 sp; KJM2500 eller KJM2601, 10 sp; og «velg 2 av» en liste på 13 emner, 20 sp) - ingen enkeltemner er derfor reelt obligatoriske for denne retningen utover fellesemnene, og spesialiseringens obligatoriske-liste er tom. Biokjemi-retningen krever 30 sp fordypning: BIOS2910 eller det utfasede BIOS2900 (10 sp, valg - ikke ført opp), BIOS3900 Biokjemi 2 (10 sp, uten alternativ - ført opp under spesialisering) og 10 valgfrie sp blant seks navngitte emner (BIOS1110, KJM2500, KJM3310, KJM3400, BIOS3910, BIOS3010). Resten av programmet (40 sp for Kjemi, 50 sp for Biokjemi) er utviklingssemester/frie emner i 5. og 6. semester. Total obligatorisk sp på tvers av hele programmet varierer dermed mellom retningene (Kjemi: 80 sp felles + 0 sp fast fordypning = 80; Biokjemi: 80 sp felles + 10 sp fast fordypning = 90); obligatoriskeStudiepoeng i denne filen viser bare det retningsuavhengige fellestallet (80).',
        obligatoriske: [
          {
            emnekode: 'KJM1101', emnenavn: 'Generell kjemi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJM1101-1'],
            years: [
              { year: 2021, A: 4, B: 3, C: 10, D: 0, E: 4, F: 9, G: 0, H: 0, total: 30, snitt: 2.2, strykprosent: 30, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 10, B: 4, C: 8, D: 4, E: 5, F: 9, G: 0, H: 0, total: 40, snitt: 2.58, strykprosent: 22.5, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 5, C: 8, D: 3, E: 3, F: 3, G: 0, H: 0, total: 22, snitt: 2.41, strykprosent: 13.6, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 4, B: 9, C: 9, D: 5, E: 0, F: 6, G: 0, H: 0, total: 33, snitt: 2.82, strykprosent: 18.2, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 4, B: 5, C: 7, D: 7, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.26, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'IN-KJM1900', emnenavn: 'Introduksjon i programmering for kjemikere', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['IN-KJM1900-1'],
            years: [
              { year: 2021, A: 3, B: 0, C: 11, D: 5, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.05, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 7, B: 6, C: 13, D: 4, E: 4, F: 5, G: 0, H: 0, total: 39, snitt: 2.82, strykprosent: 12.8, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 5, C: 7, D: 4, E: 0, F: 4, G: 0, H: 0, total: 20, snitt: 2.45, strykprosent: 20, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 3, B: 7, C: 4, D: 5, E: 0, F: 6, G: 0, H: 0, total: 25, snitt: 2.6, strykprosent: 24, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 4, B: 9, C: 0, D: 6, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'HMS0501', emnenavn: 'Sikkerhet og fysisk miljø', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0501-1'], merknad: 'Del av et obligatorisk HMS-kurspakke i 1. semester sammen med HMS0502, HMS0503, HMS0505 og HMS0507 (alle 0 sp).',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 42, H: 0, total: 42, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'HMS0502', emnenavn: 'Utviklende læringsmiljø', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0502-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 0, total: 29, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 40, H: 0, total: 40, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 0, total: 29, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'HMS0503', emnenavn: 'Laboratoriesikkerhet', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0503-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 39, H: 0, total: 39, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'HMS0505', emnenavn: 'El-sikkerhet', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0505-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 0, total: 29, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 41, H: 0, total: 41, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'HMS0507', emnenavn: 'Brannsikkerhet', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0507-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 45, H: 0, total: 45, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'KJM1111', emnenavn: 'Organisk kjemi I', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM1111-1'],
            years: [
              { year: 2021, A: 4, B: 8, C: 16, D: 3, E: 5, F: 0, G: 0, H: 0, total: 36, snitt: 3.08, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 3, B: 0, C: 0, D: 4, E: 6, F: 7, G: 0, H: 0, total: 20, snitt: 1.45, strykprosent: 35, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 3, B: 3, C: 5, D: 5, E: 3, F: 18, G: 0, H: 0, total: 37, snitt: 1.49, strykprosent: 48.6, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 3, B: 4, C: 8, D: 5, E: 0, F: 11, G: 0, H: 0, total: 31, snitt: 2.1, strykprosent: 35.5, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 4, C: 8, D: 6, E: 3, F: 7, G: 0, H: 0, total: 28, snitt: 1.96, strykprosent: 25, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'KJM1121', emnenavn: 'Uorganisk kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM1121-1'], merknad: 'Kan i noen løp utsettes til 4. semester ved valg av MAT1110 i fordypningsblokken (se merknad på programnivå).',
            years: [
              { year: 2021, A: 3, B: 11, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.77, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 4, B: 3, C: 7, D: 5, E: 3, F: 15, G: 0, H: 0, total: 37, snitt: 1.78, strykprosent: 40.5, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 4, B: 5, C: 5, D: 6, E: 3, F: 7, G: 0, H: 0, total: 30, snitt: 2.33, strykprosent: 23.3, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 6, C: 6, D: 0, E: 3, F: 6, G: 0, H: 0, total: 21, snitt: 2.14, strykprosent: 28.6, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'KJM1130', emnenavn: 'Fysikalsk kjemi I - termodynamikk og kinetikk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['KJM1130-1'],
            years: [
              { year: 2021, A: 3, B: 4, C: 11, D: 5, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.22, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 0, C: 3, D: 4, E: 3, F: 12, G: 0, H: 0, total: 22, snitt: 0.91, strykprosent: 54.5, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 4, B: 3, C: 6, D: 0, E: 5, F: 10, G: 0, H: 0, total: 28, snitt: 1.96, strykprosent: 35.7, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 4, B: 5, C: 10, D: 0, E: 4, F: 6, G: 0, H: 0, total: 29, snitt: 2.55, strykprosent: 20.7, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 6, B: 8, C: 3, D: 3, E: 0, F: 4, G: 0, H: 0, total: 24, snitt: 3.21, strykprosent: 16.7, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'KJM2400', emnenavn: 'Analytisk kjemi I', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['KJM2400-1'], merknad: 'For studieretningen Biokjemi kan KJM2400 og EXPHIL03 bytte plass mellom 3. og 5. semester (begge emnene er obligatoriske uansett rekkefølge).',
            years: [
              { year: 2021, A: 4, B: 6, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.61, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 5, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 6, B: 7, C: 11, D: 3, E: 0, F: 8, G: 0, H: 0, total: 35, snitt: 2.77, strykprosent: 22.9, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 3, B: 14, C: 4, D: 0, E: 0, F: 4, G: 0, H: 0, total: 25, snitt: 3.32, strykprosent: 16, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 6, B: 9, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.11, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'EXPHIL03', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['EXPHIL03-1'], merknad: 'For studieretningen Biokjemi kan EXPHIL03 og KJM2400 bytte plass mellom 3. og 5. semester (begge emnene er obligatoriske uansett rekkefølge).',
            years: [
              { year: 2021, A: 3, B: 4, C: 12, D: 3, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.32, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 6, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.23, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 3, B: 5, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.73, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 5, B: 3, C: 11, D: 0, E: 0, F: 3, G: 0, H: 0, total: 22, snitt: 3.18, strykprosent: 13.6, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 8, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'KJM1140', emnenavn: 'Biokjemi 1 for kjemikere', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['KJM1140-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 4, B: 0, C: 3, D: 3, E: 4, F: 0, G: 0, H: 0, total: 14, snitt: 2.79, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 5, B: 4, C: 3, D: 0, E: 0, F: 4, G: 0, H: 0, total: 16, snitt: 3.12, strykprosent: 25, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 0, C: 5, D: 5, E: 0, F: 12, G: 0, H: 0, total: 22, snitt: 1.14, strykprosent: 54.5, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 11, B: 0, C: 6, D: 4, E: 3, F: 4, G: 0, H: 0, total: 28, snitt: 3, strykprosent: 14.3, bestattprosent: null, skjult: 1 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Kjemi', obligatoriske: [
          ] },
          { navn: 'Biokjemi', obligatoriske: [
            {
              emnekode: 'BIOS3900', emnenavn: 'Biokjemi 2', studiepoeng: 10, aar: 3, semester: 'vår',
              dbhEmnekoder: ['BIOS3900-1'],
              years: [
                { year: 2021, A: 0, B: 3, C: 4, D: 0, E: 0, F: 3, G: 0, H: 0, total: 10, snitt: 2.4, strykprosent: 30, bestattprosent: null, skjult: 1 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 3, F: 4, G: 0, H: 0, total: 7, snitt: 0.43, strykprosent: 57.1, bestattprosent: null, skjult: 4 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 8 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              ],
            },
          ] },
        ],
      },
      {
        entryId: 'uib_kjemi', shortName: 'UiB', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Kjemi (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_kjemi', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Kjemi (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uis_biologisk_kjemi', shortName: 'UiS', institusjon: 'Universitetet i Stavanger', isNmbu: false, programnavn: 'Biologisk kjemi (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uit_kjemi', shortName: 'UiT Kjemi', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Kjemi (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uit_baerekraftig_kjemi', shortName: 'UiT Bærekraftig kjemi', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Bærekraftig kjemi og innovasjon (master 5 år)',
        studieplanAar: '2025/2026', kilder: ['https://uit.no/utdanning/program/868642/baerekraftig_kjemi_og_innovasjon_sivilingenior_-', 'https://uit.no/Content/919919/cache=20263108124437/Studieplan%20Sivilingeni%C3%B8r%20i%20b%C3%A6rekraftig%20kjemi%20og%20innovasjon%20fra%20h%C3%B8st%202026%20-%20publisert%2002.02.26.pdf'],
        totaltStudiepoeng: 300, obligatoriskeStudiepoeng: 270,
        merknad: 'Programmet startet med opptak høsten 2025; kilden er studieplanen godkjent 18.10.2024 og revidert 09.12.2025 (for kull fra høst 2026), hentet fra en PDF med semesteroversikt lenket fra programsiden. PDF-en manglet maskinlesbar tekst i selve oppbyggingstabellen (bildeinnhold); tabellen er derfor lest av som bilde. Studieplanen deler de 300 studiepoengene i «programemner» (240 sp, obligatoriske fagemner), «obligatoriske fellesemner» (30 sp: Examen philosophicum 10 sp, Bærekraft og innovasjon 10 sp, og «digitale mikroemner» 4×2,5 sp = 10 sp) og valgemner (30 sp, hele 7. semester/4. år høst, kan erstattes av utveksling eller opphold ved UNIS). De 10 studiepoengene med «digitale mikroemner» i 4. år vår er ikke brutt ned i enkeltemner her fordi de konkrete emnekodene ikke er oppgitt i kildene - obligatoriskeStudiepoeng (270) inkluderer likevel disse 10 sp, mens listen over enkeltemner bare summerer til 260 sp. Examen philosophicum er ført med FIL-0700 (10 sp) i 2. år høst i tabellen, mens brødteksten kaller det «10 sp» uten kode; det er FIL-0700 (Tromsøvarianten) som er brukt konsekvent i emnelisten. MNF-2001 Realfagspraksis (10 sp) dekker 3 av minst 6 obligatoriske ukers arbeidspraksis; resten skaffes av studenten selv og er ikke et eget emne. 7. semester (4. år høst) er rent valgfag/utveksling og er ikke tatt med.',
        obligatoriske: [
          {
            emnekode: 'KJE-1001', emnenavn: 'Introduksjon til kjemi og kjemisk biologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'INF-0101', emnenavn: 'Innføring i programmering', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'INF-0102', emnenavn: 'Beregningsorientert programmering', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MAT-1507', emnenavn: 'Matematikk 1 for ingeniører', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJE-1102', emnenavn: 'Organisk kjemi og biomolekyler', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Studieplanens alfabetiske emneliste kaller emnet «Innføring i organiske og biologiske molekyler - struktur og reaktivitet»; tabellen over studieprogrammets oppbygning bruker det kortere navnet.',
            years: [],
          },
          {
            emnekode: 'MAT-1516', emnenavn: 'Matematikk 2 for ingeniører', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJE-1006', emnenavn: 'Miljøkjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJE-1003', emnenavn: 'Praktisk organisk kjemi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'FIL-0700', emnenavn: 'Examen philosophicum, Tromsøvarianten', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJE-1054', emnenavn: 'Innføring i uorganisk kjemi', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJE-1055', emnenavn: 'Innføring i fysikalsk kjemi', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'TEK-1504', emnenavn: 'Fysikk', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'PRO-2613', emnenavn: 'Innføring i prosessteknologi', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJE-2007', emnenavn: 'Green chemistry', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Kalt «Grønn kjemi» i tabellen over studieprogrammets oppbygning, «Green chemistry» i den alfabetiske emnelisten.',
            years: [],
          },
          {
            emnekode: 'TEK-2504', emnenavn: 'Innovasjon', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'TEK-2505', emnenavn: 'Forretningsledelse', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'TVR-3000', emnenavn: 'Bærekraft og innovasjon', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Merket som «fellesfag» (obligatorisk fellesemne på tvers av sivilingeniørprogrammene ved fakultetet) i tabellen.',
            years: [],
          },
          {
            emnekode: 'TEK-2007', emnenavn: 'Sustainable Design and Life Cycle Assessments', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'STA-1501', emnenavn: 'Introduksjon til sannsynlighetsregning og statistikk for ingeniører', studiepoeng: 5, aar: 3, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'TEK-2800', emnenavn: 'Matematikk 3 for ingeniører', studiepoeng: 5, aar: 3, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJE-2003', emnenavn: 'Introduction to analytical chemistry', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'PRO-2607', emnenavn: 'Kjemiteknikk og statistisk prosesskontroll', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MNF-2001', emnenavn: 'Realfagspraksis', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Dekker 3 av de minst 6 ukene obligatorisk arbeidspraksis studiet krever.',
            years: [],
          },
          {
            emnekode: 'KJE-3320', emnenavn: 'Advanced Chemical Structure and Reactivity', studiepoeng: 10, aar: 4, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJE-3317', emnenavn: 'Applied Spectroscopy', studiepoeng: 10, aar: 4, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJE-3504', emnenavn: 'Topics in Sustainable Materials', studiepoeng: 10, aar: 5, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'FAR-3311', emnenavn: 'Avansert analytisk kjemi', studiepoeng: 5, aar: 5, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'FAR-3312', emnenavn: 'Avansert praktisk analytisk kjemi', studiepoeng: 5, aar: 5, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJE-3830', emnenavn: 'Project paper', studiepoeng: 10, aar: 5, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJE-3930', emnenavn: 'Master\'s Thesis in Sustainable Chemistry and Innovation', studiepoeng: 30, aar: 5, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'matvitenskap', label: 'Matvitenskap og ernæring', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_matvitenskap_ernaring', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Matvitenskap og ernæring (bachelor)',
        studieplanAar: '2023/2024', kilder: ['https://www.nmbu.no/studier/master-5-aar/matvitenskap-og-ernaering', 'https://www.nmbu.no/fakultet/kbm/for-kbm-studenter/studieplaner-og-oppbygning/matvitenskap', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2023-10/Studieplan%20for%20matvitenskap%20og%20ern%C3%A6ring%20M-MATVIT%202023-2024.pdf'],
        totaltStudiepoeng: 300, obligatoriskeStudiepoeng: 155,
        merknad: 'Programmet «Matvitenskap og ernæring» (M-MATVIT, studiekode 192948) er NMBUs tidligere 5-årige integrerte sivilingeniør-/mastergradsprogram innen mat, som ikke lenger tar opp nye studenter (siste opptak var i 2024) - det er erstattet av Bachelor i Mat, teknologi og helse og Master (2 år) i Mat, teknologi og helse. Siste publiserte studieplan er for kull 2023 (2023/2024), hentet fra NMBUs fakultetsside for studieplaner i matvitenskap; nyere kull-planer finnes ikke fordi programmet er avviklet. Kilde er en 4-siders fargekodet rutenett-studieplan: side 1 viser «Felles emner» (1.-3. år, 155 sp), side 2-4 viser de tre studieretningene (4.-5. år) hver for seg. Rutenettets fargekoding skiller navngitte obligatoriske emner fra to typer ukodede kategorier som er ekskludert fra obligatoriske-listen: «Valgfrie emner» (hele høstsemesteret 3. år, ca. 20-25 sp) og «Rom for teknologiemner» (et fast antall sp per semester i 4.-5. år hvor studenten velger blant teknologiemner uten at studieplanen oppgir en fast emnekode) - unntaket er studieretning EBH, der «Rom for teknologiemner» (10 sp, 4. år vår) og den ukodede kategorien «Emnegruppe biomedisin» (40 sp, 4. år) tydelig inngår i studieretningens egne sp-summer (60+60=120 sp for 4.-5. år) uten at de kan knyttes til navngitte emnekoder, og er derfor heller ikke tatt med som egne emner i obligatoriske-listen for EBH (kun PHI100 og Masteroppgave er kodede emner der). obligatoriskeStudiepoeng (155) gjelder kun de felles emnene i 1.-3. år, i tråd med praksisen i ntnu_midt.json; faktisk obligatorisk/navngitt sp-sum per studieretning for 4.-5. år er 90 (PUN), 85 (MKH) og 70 (EBH, hvorav 50 sp er ukodede kategorier som ikke telles). totaltStudiepoeng er satt til standard 300 sp for et 5-årig program. PHI100 (Examen philosophicum, alt. PHI101) og MVI321/KJM110/MVI100 (emner som ifølge rutenettet starter i augustblokk og fortsetter inn i høstsemesteret, med sp fordelt på begge periodene) er notert med egne merknader per emne. Denne filen brukes uendret for både nmbu_matvitenskap_ernaring og nmbu_matvitenskap_ernaring_hist (samme nedlagte program, jf. oppgavebeskrivelsen).',
        obligatoriske: [
          {
            emnekode: 'MVI100', emnenavn: 'Introduksjon til matvitenskap', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MVI100-2'], merknad: 'Starter i augustblokk (5 sp) og fortsetter i høstsemesteret (5 sp) - studieplanens rutenett lister emnet i begge periodene.',
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'MATH100', emnenavn: 'Brukerkurs i matematikk', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MATH100-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 3, snitt: 1, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'STIN100', emnenavn: 'Biologisk data-analyse', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO100', emnenavn: 'Cellebiologi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO100-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 3, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.43, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'HFX133', emnenavn: 'Utfordringer for framtidas matproduksjon', studiepoeng: 5, aar: 1, semester: 'januarblokk',
            dbhEmnekoder: ['HFX133-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'KJM100', emnenavn: 'Generell kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM100-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'STAT100', emnenavn: 'Statistikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['STAT100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 3, D: 0, E: 6, F: 0, G: 0, H: 0, total: 9, snitt: 1.67, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MVI180', emnenavn: 'Prosessteknologi I', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJM110', emnenavn: 'Organisk kjemi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['KJM110-1'], merknad: 'Starter i augustblokk (5 sp) og fortsetter i høstsemesteret (5 sp).',
            years: [
              { year: 2021, A: 5, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.56, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MVI275', emnenavn: 'Matplanter', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MVI275-1'],
            years: [
              { year: 2021, A: 0, B: 7, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.41, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 6, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.55, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'KJB100', emnenavn: 'Introduksjon til biokjemi', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO130', emnenavn: 'Generell mikrobiologi I', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO130-1'],
            years: [
              { year: 2021, A: 4, B: 5, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI240', emnenavn: 'Sensorisk analyse', studiepoeng: 5, aar: 2, semester: 'januarblokk',
            dbhEmnekoder: ['MVI240-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 0, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI220', emnenavn: 'Næringsmiddelmikrobiologi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MVI220-1'],
            years: [
              { year: 2021, A: 0, B: 10, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 4, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.4, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MVI202', emnenavn: 'Matkjemi', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJB201', emnenavn: 'Laboratoriekurs i biokjemi og matkjemi', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'HFE200', emnenavn: 'Generell ernæring', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['HFE200-1'],
            years: [
              { year: 2021, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI250', emnenavn: 'Emballeringsteknologi', studiepoeng: 5, aar: 3, semester: 'januarblokk',
            dbhEmnekoder: ['MVI250-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MVI273', emnenavn: 'Melk og melkebehandling', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['MVI273-1'],
            years: [
              { year: 2021, A: 0, B: 15, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.23, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 5, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.42, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI274', emnenavn: 'Muskelmat - råvare og teknologi', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['MVI274-1'],
            years: [
              { year: 2021, A: 3, B: 6, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.45, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 5, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.45, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 3, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI261', emnenavn: 'Prosessteknologi II', studiepoeng: 5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['MVI261-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 0, D: 5, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.89, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI230', emnenavn: 'Matvaretrygghet og hygiene', studiepoeng: 5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['MVI230-1'],
            years: [
              { year: 2021, A: 6, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.4, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 3, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.83, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Produksjon og utvikling av næringsmidler (PUN)', obligatoriske: [
            {
              emnekode: 'MVI321', emnenavn: 'Fermenteringsmikrobiologi', studiepoeng: 5, aar: 4, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Augustblokk før høstsemesteret.',
              years: [],
            },
            {
              emnekode: 'MVI310', emnenavn: 'Makronæringsstoffer, deres struktur og funksjonalitet', studiepoeng: 10, aar: 4, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'PHI100', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 4, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Studieplanen lister PHI100/PHI101 - studenten velger en av de likeverdige variantene.',
              years: [],
            },
            {
              emnekode: 'MVI395', emnenavn: 'Trygghet i industrielle prosesser', studiepoeng: 10, aar: 4, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MVI340', emnenavn: 'Sensorikk og forbrukeraksept', studiepoeng: 5, aar: 4, semester: 'juniblokk',
              dbhEmnekoder: ['MVI340-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
              ],
            },
            {
              emnekode: 'MVI361', emnenavn: 'Enhetsoperasjoner', studiepoeng: 10, aar: 5, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MVI385', emnenavn: 'Produktutvikling', studiepoeng: 10, aar: 5, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MASTEROPPGAVE', emnenavn: 'Masteroppgave', studiepoeng: 30, aar: 5, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
          ] },
          { navn: 'Matvaretrygghet, -kvalitet og -hygiene (MKH)', obligatoriske: [
            {
              emnekode: 'MVI321', emnenavn: 'Fermenteringsmikrobiologi', studiepoeng: 5, aar: 4, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Augustblokk før høstsemesteret.',
              years: [],
            },
            {
              emnekode: 'MVI393', emnenavn: 'Kjemisk mattrygghet', studiepoeng: 5, aar: 4, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'BIO210', emnenavn: 'Molekylærbiologi', studiepoeng: 10, aar: 4, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'PHI100', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 4, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Studieplanen lister PHI100/PHI101 - studenten velger en av de likeverdige variantene.',
              years: [],
            },
            {
              emnekode: 'BIO211', emnenavn: 'Laboratorieøvelser i molekylærbiologi', studiepoeng: 5, aar: 4, semester: 'januarblokk',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MVI322', emnenavn: 'Patogene mikroorganismer', studiepoeng: 10, aar: 4, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MVI395', emnenavn: 'Trygghet i industrielle prosesser', studiepoeng: 10, aar: 4, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MASTEROPPGAVE', emnenavn: 'Masteroppgave', studiepoeng: 30, aar: 5, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
          ] },
          { navn: 'Ernæring, biomedisin og helse (EBH)', obligatoriske: [
            {
              emnekode: 'PHI100', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 4, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Studieplanen lister PHI100/PHI101 - studenten velger en av de likeverdige variantene.',
              years: [],
            },
            {
              emnekode: 'MASTEROPPGAVE', emnenavn: 'Masteroppgave', studiepoeng: 60, aar: 5, semester: 'vår',
              dbhEmnekoder: [], merknad: '60 sp totalt (30 sp høst + 30 sp vår ifølge rutenettet) - dobbelt så stort som masteroppgaven i de to andre studieretningene (30 sp), som kompensasjon for at 4. år i EBH i hovedsak består av den ukodede kategorien «Emnegruppe biomedisin» (40 sp) og «Rom for teknologiemner» (10 sp) i stedet for navngitte emner.',
              years: [],
            },
          ] },
        ],
      },
      {
        entryId: 'uib_ernaring', shortName: 'UiB', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Ernæring (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uit_ernaring', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Ernæring (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uio_klinisk_ernaring', shortName: 'UiO Klinisk ernæring', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Klinisk ernæring (master 5 år)',
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
    id: 'matteknologi', label: 'Mat, teknologi og helse', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_mat_teknologi_helse', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Mat, teknologi og helse (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/bachelor/mat-teknologi-og-helse', 'https://www.nmbu.no/fakulteter/fakultet-kjemi-bioteknologi-og-matvitenskap/studieplaner-bachelor-i-mat-teknologi-og', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-09/Studieplan%20for%20B-MAT%20Mat%2C%20teknologi%20og%20helse%202026-2027%20%281%29.pdf'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 150,
        merknad: 'Kilde er NMBUs fargekodede rutenett-studieplan for kull 2026 (énsides PDF «Studieplan for B-MAT Mat, teknologi og helse 2026-2027»), lest med PyMuPDFs tabell-gjenkjenning for å få eksakte cellespørsmål (antall 5-sp-kolonner per emne), kontrollert mot radenes/årets oppgitte sp-summer (60+60+30=150, som stemmer eksakt med de 21 navngitte emnene). Rutenettet har en umerket «Valgfrie emner»-rad i 3. år høst (ingen emnekode oppgitt, normalt 20-25 sp) som ikke er tatt med i obligatoriske-listen. totaltStudiepoeng er satt til standard 180 sp for et treårig bachelorprogram; differansen på 30 sp (180-150) dekkes av valgfrie emner i 3. år høst. MATH100 og STIN100 står i samme sammenslåtte celle i kilden («MATH100 Brukerkurs matematikk / STIN100 Biologisk data-analyse», 10 sp totalt) og er her delt i to å 5 sp hver, i tråd med praksis for samme emnepar i nmbu_matvitenskap_ernaring.json (der de opptrer i samme celleformat). Dette programmet er etterfølgeren til det nedlagte 5-årige M-MATVIT-programmet (se nmbu_matvitenskap_ernaring.json) og bygges videre med en egen 2-årig master (nmbu_mat_teknologi_helse2). Kildedokumentet beskriver ingen egne studieretninger/spesialiseringer for selve bachelorprogrammet.',
        obligatoriske: [
          {
            emnekode: 'MVI100', emnenavn: 'Introduksjon til matvitenskap', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MVI100-2'], merknad: 'Augustblokk før høstsemesteret.',
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'BIO100', emnenavn: 'Cellebiologi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO100-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 3, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.43, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MATH100', emnenavn: 'Brukerkurs i matematikk', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MATH100-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 3, snitt: 1, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'STIN100', emnenavn: 'Biologisk data-analyse', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'PHI100', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'HFX133', emnenavn: 'Utfordringer for framtidas matproduksjon', studiepoeng: 5, aar: 1, semester: 'januarblokk',
            dbhEmnekoder: ['HFX133-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'KJM100', emnenavn: 'Generell kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM100-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'STAT100', emnenavn: 'Statistikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['STAT100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 3, D: 0, E: 6, F: 0, G: 0, H: 0, total: 9, snitt: 1.67, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MVI180', emnenavn: 'Prosessteknologi I', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJM110', emnenavn: 'Organisk kjemi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['KJM110-1'],
            years: [
              { year: 2021, A: 5, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.56, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MVI275', emnenavn: 'Matplanter', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MVI275-1'],
            years: [
              { year: 2021, A: 0, B: 7, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.41, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 6, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.55, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'BIO130', emnenavn: 'Generell mikrobiologi I', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO130-1'],
            years: [
              { year: 2021, A: 4, B: 5, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'KJB100', emnenavn: 'Introduksjon til biokjemi', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MVI240', emnenavn: 'Sensorisk analyse', studiepoeng: 5, aar: 2, semester: 'januarblokk',
            dbhEmnekoder: ['MVI240-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 0, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI220', emnenavn: 'Næringsmiddelmikrobiologi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MVI220-1'],
            years: [
              { year: 2021, A: 0, B: 10, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 4, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.4, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MVI230', emnenavn: 'Matvaretrygghet og hygiene', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MVI230-1'],
            years: [
              { year: 2021, A: 6, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.4, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 3, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.83, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'MVI202', emnenavn: 'Matkjemi', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MVI291', emnenavn: 'Kosthold og helse', studiepoeng: 5, aar: 2, semester: 'juniblokk',
            dbhEmnekoder: ['MVI291-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI250', emnenavn: 'Emballeringsteknologi', studiepoeng: 5, aar: 3, semester: 'januarblokk',
            dbhEmnekoder: ['MVI250-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MVI273', emnenavn: 'Melk og melkebehandling', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['MVI273-1'],
            years: [
              { year: 2021, A: 0, B: 15, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.23, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 5, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.42, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI274', emnenavn: 'Muskelmat - råvare og teknologi', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['MVI274-1'],
            years: [
              { year: 2021, A: 3, B: 6, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.45, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 5, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.45, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 3, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI261', emnenavn: 'Prosessteknologi II', studiepoeng: 5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['MVI261-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 0, D: 5, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.89, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_matvitenskap', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Matvitenskap, teknologi og bærekraft (bachelor)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'nmbu_matvitenskap_ernaring_hist', shortName: 'NMBU Matvitenskap og ernæring', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Matvitenskap og ernæring (bachelor)',
        studieplanAar: '2023/2024', kilder: ['https://www.nmbu.no/studier/master-5-aar/matvitenskap-og-ernaering', 'https://www.nmbu.no/fakultet/kbm/for-kbm-studenter/studieplaner-og-oppbygning/matvitenskap', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2023-10/Studieplan%20for%20matvitenskap%20og%20ern%C3%A6ring%20M-MATVIT%202023-2024.pdf'],
        totaltStudiepoeng: 300, obligatoriskeStudiepoeng: 155,
        merknad: 'Programmet «Matvitenskap og ernæring» (M-MATVIT, studiekode 192948) er NMBUs tidligere 5-årige integrerte sivilingeniør-/mastergradsprogram innen mat, som ikke lenger tar opp nye studenter (siste opptak var i 2024) - det er erstattet av Bachelor i Mat, teknologi og helse og Master (2 år) i Mat, teknologi og helse. Siste publiserte studieplan er for kull 2023 (2023/2024), hentet fra NMBUs fakultetsside for studieplaner i matvitenskap; nyere kull-planer finnes ikke fordi programmet er avviklet. Kilde er en 4-siders fargekodet rutenett-studieplan: side 1 viser «Felles emner» (1.-3. år, 155 sp), side 2-4 viser de tre studieretningene (4.-5. år) hver for seg. Rutenettets fargekoding skiller navngitte obligatoriske emner fra to typer ukodede kategorier som er ekskludert fra obligatoriske-listen: «Valgfrie emner» (hele høstsemesteret 3. år, ca. 20-25 sp) og «Rom for teknologiemner» (et fast antall sp per semester i 4.-5. år hvor studenten velger blant teknologiemner uten at studieplanen oppgir en fast emnekode) - unntaket er studieretning EBH, der «Rom for teknologiemner» (10 sp, 4. år vår) og den ukodede kategorien «Emnegruppe biomedisin» (40 sp, 4. år) tydelig inngår i studieretningens egne sp-summer (60+60=120 sp for 4.-5. år) uten at de kan knyttes til navngitte emnekoder, og er derfor heller ikke tatt med som egne emner i obligatoriske-listen for EBH (kun PHI100 og Masteroppgave er kodede emner der). obligatoriskeStudiepoeng (155) gjelder kun de felles emnene i 1.-3. år, i tråd med praksisen i ntnu_midt.json; faktisk obligatorisk/navngitt sp-sum per studieretning for 4.-5. år er 90 (PUN), 85 (MKH) og 70 (EBH, hvorav 50 sp er ukodede kategorier som ikke telles). totaltStudiepoeng er satt til standard 300 sp for et 5-årig program. PHI100 (Examen philosophicum, alt. PHI101) og MVI321/KJM110/MVI100 (emner som ifølge rutenettet starter i augustblokk og fortsetter inn i høstsemesteret, med sp fordelt på begge periodene) er notert med egne merknader per emne. Denne filen brukes uendret for både nmbu_matvitenskap_ernaring og nmbu_matvitenskap_ernaring_hist (samme nedlagte program, jf. oppgavebeskrivelsen).',
        obligatoriske: [
          {
            emnekode: 'MVI100', emnenavn: 'Introduksjon til matvitenskap', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MVI100-2'], merknad: 'Starter i augustblokk (5 sp) og fortsetter i høstsemesteret (5 sp) - studieplanens rutenett lister emnet i begge periodene.',
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'MATH100', emnenavn: 'Brukerkurs i matematikk', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MATH100-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 3, snitt: 1, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'STIN100', emnenavn: 'Biologisk data-analyse', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO100', emnenavn: 'Cellebiologi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO100-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 3, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.43, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'HFX133', emnenavn: 'Utfordringer for framtidas matproduksjon', studiepoeng: 5, aar: 1, semester: 'januarblokk',
            dbhEmnekoder: ['HFX133-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'KJM100', emnenavn: 'Generell kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM100-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'STAT100', emnenavn: 'Statistikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['STAT100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 3, D: 0, E: 6, F: 0, G: 0, H: 0, total: 9, snitt: 1.67, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MVI180', emnenavn: 'Prosessteknologi I', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJM110', emnenavn: 'Organisk kjemi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['KJM110-1'], merknad: 'Starter i augustblokk (5 sp) og fortsetter i høstsemesteret (5 sp).',
            years: [
              { year: 2021, A: 5, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.56, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MVI275', emnenavn: 'Matplanter', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MVI275-1'],
            years: [
              { year: 2021, A: 0, B: 7, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.41, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 6, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.55, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'KJB100', emnenavn: 'Introduksjon til biokjemi', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO130', emnenavn: 'Generell mikrobiologi I', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO130-1'],
            years: [
              { year: 2021, A: 4, B: 5, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI240', emnenavn: 'Sensorisk analyse', studiepoeng: 5, aar: 2, semester: 'januarblokk',
            dbhEmnekoder: ['MVI240-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 0, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI220', emnenavn: 'Næringsmiddelmikrobiologi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MVI220-1'],
            years: [
              { year: 2021, A: 0, B: 10, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 4, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.4, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MVI202', emnenavn: 'Matkjemi', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJB201', emnenavn: 'Laboratoriekurs i biokjemi og matkjemi', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'HFE200', emnenavn: 'Generell ernæring', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['HFE200-1'],
            years: [
              { year: 2021, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI250', emnenavn: 'Emballeringsteknologi', studiepoeng: 5, aar: 3, semester: 'januarblokk',
            dbhEmnekoder: ['MVI250-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MVI273', emnenavn: 'Melk og melkebehandling', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['MVI273-1'],
            years: [
              { year: 2021, A: 0, B: 15, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.23, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 5, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.42, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI274', emnenavn: 'Muskelmat - råvare og teknologi', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['MVI274-1'],
            years: [
              { year: 2021, A: 3, B: 6, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.45, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 5, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.45, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 3, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI261', emnenavn: 'Prosessteknologi II', studiepoeng: 5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['MVI261-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 0, D: 5, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.89, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MVI230', emnenavn: 'Matvaretrygghet og hygiene', studiepoeng: 5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['MVI230-1'],
            years: [
              { year: 2021, A: 6, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.4, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 3, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.83, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Produksjon og utvikling av næringsmidler (PUN)', obligatoriske: [
            {
              emnekode: 'MVI321', emnenavn: 'Fermenteringsmikrobiologi', studiepoeng: 5, aar: 4, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Augustblokk før høstsemesteret.',
              years: [],
            },
            {
              emnekode: 'MVI310', emnenavn: 'Makronæringsstoffer, deres struktur og funksjonalitet', studiepoeng: 10, aar: 4, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'PHI100', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 4, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Studieplanen lister PHI100/PHI101 - studenten velger en av de likeverdige variantene.',
              years: [],
            },
            {
              emnekode: 'MVI395', emnenavn: 'Trygghet i industrielle prosesser', studiepoeng: 10, aar: 4, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MVI340', emnenavn: 'Sensorikk og forbrukeraksept', studiepoeng: 5, aar: 4, semester: 'juniblokk',
              dbhEmnekoder: ['MVI340-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 2 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
              ],
            },
            {
              emnekode: 'MVI361', emnenavn: 'Enhetsoperasjoner', studiepoeng: 10, aar: 5, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MVI385', emnenavn: 'Produktutvikling', studiepoeng: 10, aar: 5, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MASTEROPPGAVE', emnenavn: 'Masteroppgave', studiepoeng: 30, aar: 5, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
          ] },
          { navn: 'Matvaretrygghet, -kvalitet og -hygiene (MKH)', obligatoriske: [
            {
              emnekode: 'MVI321', emnenavn: 'Fermenteringsmikrobiologi', studiepoeng: 5, aar: 4, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Augustblokk før høstsemesteret.',
              years: [],
            },
            {
              emnekode: 'MVI393', emnenavn: 'Kjemisk mattrygghet', studiepoeng: 5, aar: 4, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'BIO210', emnenavn: 'Molekylærbiologi', studiepoeng: 10, aar: 4, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'PHI100', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 4, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Studieplanen lister PHI100/PHI101 - studenten velger en av de likeverdige variantene.',
              years: [],
            },
            {
              emnekode: 'BIO211', emnenavn: 'Laboratorieøvelser i molekylærbiologi', studiepoeng: 5, aar: 4, semester: 'januarblokk',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MVI322', emnenavn: 'Patogene mikroorganismer', studiepoeng: 10, aar: 4, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MVI395', emnenavn: 'Trygghet i industrielle prosesser', studiepoeng: 10, aar: 4, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'MASTEROPPGAVE', emnenavn: 'Masteroppgave', studiepoeng: 30, aar: 5, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
          ] },
          { navn: 'Ernæring, biomedisin og helse (EBH)', obligatoriske: [
            {
              emnekode: 'PHI100', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 4, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Studieplanen lister PHI100/PHI101 - studenten velger en av de likeverdige variantene.',
              years: [],
            },
            {
              emnekode: 'MASTEROPPGAVE', emnenavn: 'Masteroppgave', studiepoeng: 60, aar: 5, semester: 'vår',
              dbhEmnekoder: [], merknad: '60 sp totalt (30 sp høst + 30 sp vår ifølge rutenettet) - dobbelt så stort som masteroppgaven i de to andre studieretningene (30 sp), som kompensasjon for at 4. år i EBH i hovedsak består av den ukodede kategorien «Emnegruppe biomedisin» (40 sp) og «Rom for teknologiemner» (10 sp) i stedet for navngitte emner.',
              years: [],
            },
          ] },
        ],
      },
      {
        entryId: 'uit_fiskeri_havbruk', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Fiskeri- og havbruksvitenskap (bachelor)',
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
    id: 'bioteknologi2', label: 'Bioteknologi (2-årig master)', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_bioteknologi2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Bioteknologi (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/bioteknologi', 'https://www.nmbu.no/fakulteter/fakultet-kjemi-bioteknologi-og-matvitenskap/studieplaner-master-i-bioteknologi', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-05/Studieplan%20M%20BIOTEK%202026.pdf'],
        totaltStudiepoeng: 125, obligatoriskeStudiepoeng: 65,
        merknad: 'Kilde er en 4-siders PDF med fire «Eksempelplaner» (Molekylærbiologi, Mikrobiologi, Biokjemi, Genetikk/Genomvitenskap) pluss en emneliste (side 4). Disse eksempelplanene er illøstrasjoner på hvordan valgfrie emner kan kombineres ut fra ønsket fordypningsretning - de er IKKE formelle, obligatoriske studieretninger («programsiden omtaler dem selv som mulige retninger studenten kan vinkle masterprogrammet mot, ikke faste spesialiseringer»), og er derfor ikke lagt inn under spesialiseringer i denne filen. Det eneste som er identisk og fast i alle fire eksempelplanene er: BIO305 Introduksjonsemne for masterstudenter på KBM (5 sp, augustblokk 1. år) og masteroppgaven M60-BIOTEK (60 sp, 2. år). Resten av 1. år (60 av 65 sp) er valgfrie emner som varierer mellom eksempelplanene (STAT210, KJB310, BIO322, BIN315, BIO341, BIO301, BIO336, BIO330, BIO321, BIN300, BIO326, BIO325 m.fl. - se side 4 i kilden for full liste med emnekoder, semester og studiepoeng). totaltStudiepoeng (125) og obligatoriskeStudiepoeng (65) følger rutenettets egne årssummer (65 for 1. år + 60 for 2. år), der kun BIO305 og M60-BIOTEK har fast plassering/emnekode.',
        obligatoriske: [
          {
            emnekode: 'BIO305', emnenavn: 'Introduksjonsemne for masterstudenter på KBM', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO305-1'], merknad: 'Augustblokk før høstsemesteret.',
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 0, total: 32, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'M60-BIOTEK', emnenavn: 'Masteroppgave', studiepoeng: 60, aar: 2, semester: 'vår',
            dbhEmnekoder: ['M60-BIOTEK-1'], merknad: '60 sp totalt fordelt over 2. år (5 sp august + 25 sp høst + 5 sp januar + 20 sp vår + 5 sp juni, ifølge rutenettet).',
            years: [
              { year: 2021, A: 11, B: 15, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 4.23, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 10, B: 13, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 4.27, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 7, B: 13, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4.17, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 13, B: 11, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 4.23, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 9, B: 16, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 4.17, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uib_molekylarbiologi2', shortName: 'UiB Molekylærbiologi', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Molekylærbiologi (master 2 år)',
        studieplanAar: '2025/2026', kilder: ['https://www.uib.no/studier/MAMN-MOL', 'https://www4.uib.no/studier/program/molekylaerbiologi-master/plan'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 90,
        merknad: 'Kilde er UiBs programside MAMN-MOL og tilhørende «plan»-side. Kun tre emner er obligatoriske: MOL300 Praktisk molekylærbiologi (20 sp, 1. semester), MOL310 Strukturell molekylærbiologi (10 sp, 2. semester) og masteroppgaven MOL399 (60 sp, 3.-4. semester). Resten av 1.-2. semester (30 sp: 10 sp i 1. semester + 20 sp i 2. semester) er valgfrie emner på 200- eller 300-nivå, valgt i samråd med veileder ut fra tema for masteroppgaven (et emne i bioinformatikk anbefales); ingen bestemt kombinasjon er obligatorisk, og disse er derfor ikke tatt med i obligatoriske-listen. Kildedokumentet beskriver ingen egne navngitte studieretninger/spesialiseringer for masterprogrammet.',
        obligatoriske: [
          {
            emnekode: 'MOL300', emnenavn: 'Praktisk molekylærbiologi', studiepoeng: 20, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MOL300-0'],
            years: [
              { year: 2021, A: 0, B: 4, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 3, B: 5, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 4, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.92, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 3, B: 10, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.7, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 4, B: 7, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.88, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'MOL310', emnenavn: 'Strukturell molekylærbiologi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MOL310-0'],
            years: [
              { year: 2021, A: 0, B: 15, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.71, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 5, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 0, B: 0, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 2.57, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 4, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 6, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 9 },
            ],
          },
          {
            emnekode: 'MOL399', emnenavn: 'Masteroppgåve i molekylærbiologi', studiepoeng: 60, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MOL399-0'], merknad: '60 sp, skrives over 3. og 4. semester (2. studieår) med innleveringsfrist 15. november eller 1. juni.',
            years: [
              { year: 2021, A: 6, B: 13, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.32, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 7, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.58, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 4, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.33, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 5, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.56, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 8, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.67, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_msbiotech', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Bioteknologi (master 2 år)',
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
    id: 'kjemi2', label: 'Kjemi (2-årig master)', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_kjemi2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Kjemi (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/kjemi', 'https://www.nmbu.no/fakulteter/fakultet-kjemi-bioteknologi-og-matvitenskap/studieplaner-master-i-kjemi', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-06/M-KJEMI%20kull%202026.pdf'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 60,
        merknad: 'Kilde er NMBUs énsides rutenett-studieplan for kull 2026 («M-KJEMI kull 2026»). Programmet har INGEN navngitte obligatoriske emner utover selve masteroppgaven: hele 1. år (60 sp) er fritt sammensatt av valgemner, kun bundet av kravet «minst 30 sp kjemiemner og minst 30 sp masteremner (emnekode på 300-tallet)» oppgitt øverst i kilden - rutenettcellene for 1. år er tomme bortsett fra denne teksthenvisningen (15 sp masteremner nevnt både høst og vår). 2. år består utelukkende av masteroppgaven (30 sp høst + 30 sp vår = 60 sp), skrevet «Masteroppgave» uten egen emnekode i kilden. totaltStudiepoeng er satt til standard 120 sp for et 2-årig masterprogram (60+60 ifølge rutenettets egne årssummer). Kildedokumentet beskriver ingen egne navngitte studieretninger for dette programmet - studenten velger selv fordypning innen naturstoffkjemi, analytisk kjemi (organisk/uorganisk) eller miljø- og radiokjemi via valg av emner og masteroppgavetema, jf. programsiden.',
        obligatoriske: [
          {
            emnekode: 'MASTEROPPGAVE', emnenavn: 'Masteroppgave', studiepoeng: 60, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: '60 sp totalt (30 sp høst + 30 sp vår ifølge rutenettet).',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uio_kjemi2', shortName: 'UiO', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Kjemi (master 2 år)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uib_kjemi2', shortName: 'UiB', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Kjemi (master 2 år)',
        studieplanAar: null, kilder: [],
        totaltStudiepoeng: null, obligatoriskeStudiepoeng: null,
        merknad: 'Studieplan ikke hentet ennå.',
        obligatoriske: [
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_mschem', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Kjemi (master 2 år)',
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
    id: 'matteknologi2', label: 'Mat, teknologi og helse (2-årig master)', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_mat_teknologi_helse2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Mat, teknologi og helse (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/mat-teknologi-og-helse', 'https://www.nmbu.no/fakulteter/fakultet-kjemi-bioteknologi-og-matvitenskap/studieplaner-master-i-mat-teknologi-og-helse', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-09/Studieplan%20for%20M-MAT%20Mat%2C%20teknologi%20og%20helse%202026-2027%20%281%29.pdf'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 75,
        merknad: 'Kilde er NMBUs énsides rutenett-studieplan for kull 2026 («M-MAT kull 2026»), der årene er nummerert «4. år»/«5. år» fordi dette 2-årige masterprogrammet bygger direkte videre på den 3-årige bacheloren (årstellingen er videreført fra B-MAT, jf. nmbu_mat_teknologi_helse.json); i denne filen er de regnet om til år 1 og 2 for masterprogrammet. Utenom de 6 navngitte emnene over (45 sp) og masteroppgaven (30 sp), består resten av programmet (45 sp) av en umerket kategori «Teknologiemner / valgfrie emner» uten fast emnekode, i tråd med programsidens omtale av at studenten velger minst 20 sp teknologiemner ut fra egne interesser. totaltStudiepoeng er satt til standard 120 sp for et 2-årig masterprogram; obligatoriskeStudiepoeng (75) er summen av de navngitte emnene inkl. masteroppgaven (rutenettets egne årssummer 25+50=75). Kildedokumentet beskriver ingen egne navngitte studieretninger.',
        obligatoriske: [
          {
            emnekode: 'BIO305', emnenavn: 'Masterforberedende emne', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MVI310', emnenavn: 'Makronæringsstoffer, deres struktur og funksjonalitet', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MVI310-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'MVI395', emnenavn: 'Trygghet i industrielle prosesser', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MVI395-1'],
            years: [
              { year: 2021, A: 8, B: 5, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.11, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 8, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'MVI361', emnenavn: 'Enhetsoperasjoner', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MVI361-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'MVI385', emnenavn: 'Produktutvikling', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MVI385-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 5, H: 0, total: 5, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'MASTEROPPGAVE', emnenavn: 'Masteroppgave', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_ftmamat', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Matvitenskap, teknologi og bærekraft (master 2 år)',
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
];
