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
    id: 'biologi', label: 'Biologi', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_biologi', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Biologi (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/bachelor/biologi', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-05/B-BIOL_2026_27.pdf'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 95,
        merknad: 'Kilde er NMBUs fargekodede rutenett-studieplan for kull 2026 (B-BIOL), hentet som PDF fra nmbu.no/studier/bachelor/biologi (lenke «Last ned detaljert studieplan»). Programmet er 180 sp totalt, hvorav 120 sp er obligatoriske for alle (studieplanens tabell 1, med tillegg til 125 sp avhengig av valg, se under), minimum 30 sp skal være biologiske emner (elektivt, ikke i obligatoriske-listen), og resterende ca. 30 sp er fritt valgfrie. I studieplanens obligatoriske emneliste er tre emnepar fargekodet med fotnoten «velg minst ett emne fra hver fargekode»: (1) BIO200 Molekylærgenetikk i eukaryoter (5 sp, januarblokk 3. år) / BIO210 Molekylærbiologi (10 sp, høst 3. år) – gult; (2) MATH100 Brukerkurs i matematikk / MATH121 Kalkulus (begge 10 sp, høst 1. år, valgt etter matematikkbakgrunn) – grønt; (3) PHI100 Examen philosophicum / PHI101 Examen philosophicum, seminarversjon (begge 10 sp, høst 1. år) – oransje. Disse tre valgparene er obligatoriske valg mellom alternativer og er derfor IKKE tatt med i obligatoriske-listen (jf. oppgavens regler), men er obligatoriske for alle studenter i den forstand at minst ett emne fra hvert par må fullføres. De 13 emnene i obligatoriske-listen over (95 sp) er de eneste uten alternativ – dvs. rene, entydige obligatoriske emner. Summen 95 sp (liste) + minimum 25 sp (ett emne fra hvert av de tre fargeparene, billigste alternativ BIO200+MATH+PHI) = 120 sp, mens 95 + 30 sp (BIO210 i stedet for BIO200 + MATH + PHI) = 125 sp, i tråd med studieplanens egen sum «120 (125)». Emnenavn og studiepoeng er hentet direkte fra studieplan-PDF-en. Studieplanen definerer ingen egne studieretninger/spesialiseringer med separate obligatoriske emnelister.',
        obligatoriske: [
          {
            emnekode: 'BIO140', emnenavn: 'Innføringsemne i biologi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO140-1'], merknad: 'Augustblokk før høstsemesteret.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 53, H: 0, total: 53, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 42, H: 0, total: 42, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 40, H: 0, total: 40, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 58, H: 0, total: 58, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 55, H: 0, total: 55, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO100', emnenavn: 'Cellebiologi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO100-1'],
            years: [
              { year: 2021, A: 11, B: 37, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 48, snitt: 4.23, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 10, B: 20, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 4.11, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 11, B: 23, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 4.15, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 7, B: 36, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 56, snitt: 3.89, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 18, B: 28, C: 9, D: 0, E: 0, F: 3, G: 0, H: 0, total: 58, snitt: 3.95, strykprosent: 5.2, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'ZOOL100', emnenavn: 'Generell zoologi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ZOOL100-1'], merknad: 'Har et feltkurs sammen med BOT100 i juniblokk.',
            years: [
              { year: 2021, A: 11, B: 13, C: 14, D: 6, E: 0, F: 0, G: 0, H: 0, total: 44, snitt: 3.66, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 13, B: 25, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 47, snitt: 4.02, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 6, B: 13, C: 11, D: 8, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 3.45, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 6, B: 14, C: 12, D: 4, E: 3, F: 0, G: 0, H: 0, total: 39, snitt: 3.41, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 5, B: 21, C: 13, D: 6, E: 10, F: 0, G: 0, H: 0, total: 55, snitt: 3.09, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BOT100', emnenavn: 'Plantediversitet', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BOT100-1'], merknad: 'Har et feltkurs sammen med ZOOL100 i juniblokk.',
            years: [
              { year: 2021, A: 7, B: 26, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 43, snitt: 3.86, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 5, B: 14, C: 17, D: 5, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.46, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 16, C: 18, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.47, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 6, B: 9, C: 14, D: 6, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 6, B: 12, C: 11, D: 16, E: 0, F: 6, G: 0, H: 0, total: 51, snitt: 2.8, strykprosent: 11.8, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'ECOL100', emnenavn: 'Grunnleggende økologi', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['ECOL100-1'],
            years: [
              { year: 2021, A: 5, B: 16, C: 18, D: 7, E: 3, F: 0, G: 0, H: 0, total: 49, snitt: 3.27, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 6, B: 20, C: 18, D: 0, E: 0, F: 0, G: 0, H: 0, total: 44, snitt: 3.73, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 9, B: 17, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 3.92, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 14, B: 20, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 4.3, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 7, B: 25, C: 19, D: 0, E: 0, F: 0, G: 0, H: 0, total: 51, snitt: 3.76, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'KJM100', emnenavn: 'Generell kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM100-1'], merknad: 'For studenter med svakt matematikkgrunnlag gis et ikke-studiepoenggivende forkurs (KJM007) normalt i januarblokk.',
            years: [
              { year: 2021, A: 10, B: 13, C: 9, D: 8, E: 4, F: 0, G: 0, H: 0, total: 44, snitt: 3.39, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 3, B: 12, C: 14, D: 17, E: 3, F: 0, G: 0, H: 0, total: 49, snitt: 2.9, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 7, B: 13, C: 8, D: 6, E: 0, F: 3, G: 0, H: 0, total: 37, snitt: 3.32, strykprosent: 8.1, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 11, B: 17, C: 7, D: 6, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.8, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 18, B: 15, C: 12, D: 3, E: 4, F: 4, G: 0, H: 0, total: 56, snitt: 3.5, strykprosent: 7.1, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO130', emnenavn: 'Generell mikrobiologi I', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO130-1'],
            years: [
              { year: 2021, A: 12, B: 14, C: 14, D: 3, E: 0, F: 0, G: 0, H: 0, total: 43, snitt: 3.81, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 12, B: 17, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.9, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 12, B: 14, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.97, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 5, B: 17, C: 15, D: 4, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 12, B: 11, C: 13, D: 10, E: 0, F: 3, G: 0, H: 0, total: 49, snitt: 3.33, strykprosent: 6.1, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BOT130', emnenavn: 'Grunnleggende plantefysiologi', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BOT130-1'],
            years: [
              { year: 2021, A: 5, B: 11, C: 16, D: 8, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 5, B: 11, C: 18, D: 3, E: 4, F: 0, G: 0, H: 0, total: 41, snitt: 3.24, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 7, B: 11, C: 12, D: 5, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 5, B: 14, C: 13, D: 7, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 9, B: 9, C: 17, D: 8, E: 4, F: 6, G: 0, H: 0, total: 53, snitt: 2.87, strykprosent: 11.3, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'STIN100', emnenavn: 'Biologisk dataanalyse', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['STIN100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 44, H: 0, total: 44, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 37, H: 0, total: 37, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 38, H: 0, total: 38, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 40, H: 4, total: 44, snitt: null, strykprosent: null, bestattprosent: 90.9, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 52, H: 0, total: 52, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'BIO120', emnenavn: 'Genetikk', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BIO120-1'],
            years: [
              { year: 2021, A: 7, B: 31, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 4.18, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 9, B: 21, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 4.08, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 19, B: 17, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 4.31, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 21, B: 14, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 4.44, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 19, B: 20, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 42, snitt: 4.38, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'STAT100', emnenavn: 'Statistikk', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['STAT100-1'], merknad: 'Kan i stedet tas i høstparallellen ifølge studieplanens fotnote.',
            years: [
              { year: 2021, A: 9, B: 10, C: 11, D: 5, E: 4, F: 0, G: 0, H: 0, total: 39, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 4, B: 5, C: 5, D: 6, E: 8, F: 5, G: 0, H: 0, total: 33, snitt: 2.27, strykprosent: 15.2, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 4, B: 8, C: 7, D: 12, E: 6, F: 0, G: 0, H: 0, total: 37, snitt: 2.78, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 5, B: 8, C: 7, D: 10, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.27, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 6, C: 9, D: 8, E: 12, F: 19, G: 0, H: 0, total: 54, snitt: 1.46, strykprosent: 35.2, bestattprosent: null, skjult: 8 },
            ],
          },
          {
            emnekode: 'BIO223', emnenavn: 'Evolusjonsbiologi', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BIO223-1'],
            years: [
              { year: 2021, A: 0, B: 9, C: 16, D: 7, E: 3, F: 5, G: 0, H: 0, total: 40, snitt: 2.52, strykprosent: 12.5, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 10, C: 15, D: 8, E: 6, F: 3, G: 0, H: 0, total: 42, snitt: 2.55, strykprosent: 7.1, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 3, B: 5, C: 12, D: 4, E: 4, F: 7, G: 0, H: 0, total: 35, snitt: 2.37, strykprosent: 20, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 4, B: 8, C: 18, D: 7, E: 3, F: 4, G: 0, H: 0, total: 44, snitt: 2.8, strykprosent: 9.1, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 6, C: 11, D: 4, E: 6, F: 4, G: 0, H: 0, total: 31, snitt: 2.29, strykprosent: 12.9, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'HFX201', emnenavn: 'Fysiologi', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['HFX201-1'],
            years: [
              { year: 2021, A: 14, B: 14, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 4.24, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 12, B: 15, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 4.3, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 10, B: 11, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.77, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 13, B: 26, C: 12, D: 5, E: 0, F: 0, G: 0, H: 0, total: 56, snitt: 3.84, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 3, B: 8, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.7, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uio_biovitenskap', shortName: 'UiO', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Biovitenskap (bachelor)',
        studieplanAar: '2025/2026', kilder: ['https://www.uio.no/studier/program/biovitenskap/', 'https://www.uio.no/studier/program/biovitenskap/oppbygging/', 'https://www.uio.no/studier/program/biovitenskap/studieretninger/beregningsbiologi/oppbygging/', 'https://www.uio.no/studier/program/biovitenskap/studieretninger/biomangfold-evolusjon/oppbygging/', 'https://www.uio.no/studier/program/biovitenskap/studieretninger/molekylarbiologi/oppbygging/'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 60,
        merknad: 'Kilder er UiOs sider «Biovitenskap (bachelor) – Oppbygging og gjennomføring» og de tre studieretningssidenes egne oppbygging-undersider (hentet via nettleser 22.09.2026). Programmet er 180 sp totalt over 3 år, med gjeldende oppbygging for studieløp fra og med høst 2025 (en eldre ordning for høst 2024 eller tidligere er omtalt på samme side, men ikke brukt her). Struktur: Obligatoriske fellesemner 50 sp (BIOS1101, BIOS1110, BIOS1120, BIOS1150, KJM1003) + Examen philosophicum (EXPHIL03) 10 sp + obligatoriske fordypningsemner 80–90 sp (studieretningsavhengig, se spesialiseringer) + utviklingssemester/frie emner 30–40 sp. Studenten må velge én av tre studieretninger innen utgangen av 1. semester: Beregningsbiologi og bioinformatikk (krever bestått matematikk R2), Biomangfold/økologi/evolusjon, og Molekylærbiologi og biomedisin. Alle tre er ført under «spesialiseringer», med kun de emnene som er 100 % fast obligatoriske innenfor hver retning (uten valgalternativ) i emnelisten; obligatoriske valg mellom navngitte alternativer (f.eks. STK1000/MAT1050) og «velg X av følgende»-elektivpooler er beskrevet i den enkelte spesialiserings egen merknad, ikke ført som emner, i tråd med oppgavens regel om at obligatoriske valg mellom alternativer skal stå i merknad. HMS-emnene (0 sp) er obligatoriske, men studiepoenggivende null, og er ført som ett samleoppføring. Ingen obligatorisk bacheloroppgave er beskrevet i studieplanen for dette programmet.',
        obligatoriske: [
          {
            emnekode: 'BIOS1101', emnenavn: 'Innføring i beregningsmodeller for biovitenskap', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIOS1101-1'],
            years: [
              { year: 2025, A: 16, B: 26, C: 31, D: 17, E: 10, F: 19, G: 0, H: 0, total: 119, snitt: 2.7, strykprosent: 16, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIOS1110', emnenavn: 'Celle- og molekylærbiologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIOS1110-1'],
            years: [
              { year: 2021, A: 3, B: 9, C: 18, D: 32, E: 19, F: 28, G: 0, H: 0, total: 109, snitt: 1.72, strykprosent: 25.7, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 8, B: 10, C: 29, D: 24, E: 34, F: 49, G: 0, H: 0, total: 154, snitt: 1.62, strykprosent: 31.8, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 14, B: 27, C: 32, D: 22, E: 10, F: 43, G: 0, H: 0, total: 148, snitt: 2.22, strykprosent: 29.1, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 10, B: 17, C: 26, D: 24, E: 19, F: 34, G: 0, H: 0, total: 130, snitt: 2.02, strykprosent: 26.2, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 7, B: 12, C: 31, D: 39, E: 27, F: 47, G: 0, H: 0, total: 163, snitt: 1.72, strykprosent: 28.8, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'BIOS1150', emnenavn: 'Biologisk mangfold', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIOS1150-1'],
            years: [
              { year: 2021, A: 4, B: 35, C: 24, D: 11, E: 5, F: 3, G: 0, H: 0, total: 82, snitt: 3.16, strykprosent: 3.7, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 8, B: 9, C: 20, D: 18, E: 7, F: 26, G: 0, H: 0, total: 88, snitt: 2.03, strykprosent: 29.5, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 9, B: 21, C: 34, D: 12, E: 6, F: 5, G: 0, H: 0, total: 87, snitt: 3, strykprosent: 5.7, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 19, B: 32, C: 22, D: 7, E: 7, F: 20, G: 0, H: 0, total: 107, snitt: 2.9, strykprosent: 18.7, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 36, B: 63, C: 60, D: 23, E: 16, F: 11, G: 0, H: 0, total: 209, snitt: 3.22, strykprosent: 5.3, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'HMS', emnenavn: 'Helse, miljø og sikkerhet', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0501-1', 'HMS0502-1', 'HMS0503-1', 'HMS0504-1', 'HMS0505-1', 'HMS0507-1'], merknad: 'Obligatorisk, studiepoenggivende null: HMS0501 Sikkerhet og fysisk miljø, HMS0502 Utviklende læringsmiljø, HMS0503 Laboratoriesikkerhet, HMS0505 El-sikkerhet, HMS0507 Brannsikkerhet. Tas i begynnelsen av 1. semester.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 437, H: 0, total: 437, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 3 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 737, H: 0, total: 737, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 618, H: 0, total: 618, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 4 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 648, H: 0, total: 648, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 746, H: 0, total: 746, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 8 },
            ],
          },
          {
            emnekode: 'BIOS1120', emnenavn: 'Fysiologi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIOS1120-1'],
            years: [
              { year: 2021, A: 12, B: 12, C: 29, D: 15, E: 6, F: 14, G: 0, H: 0, total: 88, snitt: 2.62, strykprosent: 15.9, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 5, B: 5, C: 20, D: 16, E: 19, F: 41, G: 0, H: 0, total: 106, snitt: 1.47, strykprosent: 38.7, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 9, B: 21, C: 39, D: 18, E: 12, F: 12, G: 0, H: 0, total: 111, snitt: 2.65, strykprosent: 10.8, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 13, B: 19, C: 30, D: 12, E: 22, F: 28, G: 0, H: 0, total: 124, snitt: 2.23, strykprosent: 22.6, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 5, B: 15, C: 26, D: 30, E: 18, F: 42, G: 0, H: 0, total: 136, snitt: 1.77, strykprosent: 30.9, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'KJM1003', emnenavn: 'Kjemi for biologer', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'EXPHIL03', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['EXPHIL03-1'], merknad: 'Tas normalt i 3. semester (studieretningene Biomangfold/økologi/evolusjon og Molekylærbiologi/biomedisin); i studieretningen Beregningsbiologi og bioinformatikk er den flyttet til 5. semester (år 3, høst) for å gi plass til matematikkemnene tidligere i løpet.',
            years: [
              { year: 2021, A: 14, B: 19, C: 20, D: 5, E: 5, F: 5, G: 0, H: 0, total: 68, snitt: 3.25, strykprosent: 7.4, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 9, B: 15, C: 16, D: 7, E: 0, F: 0, G: 0, H: 0, total: 47, snitt: 3.55, strykprosent: 0, bestattprosent: null, skjult: 10 },
              { year: 2023, A: 3, B: 10, C: 17, D: 14, E: 3, F: 0, G: 0, H: 0, total: 47, snitt: 2.91, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 14, B: 24, C: 25, D: 4, E: 0, F: 0, G: 0, H: 0, total: 67, snitt: 3.72, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 14, B: 26, C: 25, D: 15, E: 4, F: 3, G: 0, H: 0, total: 87, snitt: 3.25, strykprosent: 3.4, bestattprosent: null, skjult: 1 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Beregningsbiologi og bioinformatikk', obligatoriske: [
          ] },
          { navn: 'Biomangfold, økologi og evolusjon', obligatoriske: [
          ] },
          { navn: 'Molekylærbiologi og biomedisin', obligatoriske: [
          ] },
        ],
      },
      {
        entryId: 'uib_biologi', shortName: 'UiB Biologi', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Biologi (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www4.uib.no/studier/program/biologi-bachelor', 'https://www4.uib.no/studier/program/biologi-bachelor/plan'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 100,
        merknad: 'Kilde er UiBs studieplanside for BAMN-BIO Bachelorprogram i biologi, høst 2026 (www4.uib.no/studier/program/biologi-bachelor/plan). Programmet er 180 sp totalt, hvorav 120 sp er obligatoriske. Studieplanen deler de obligatoriske 120 sp i tre grupper: «Innføringsemne» (20 sp: matematikk MAT101/MAT111 + examen philosophicum EXPHIL-MNSEM/EXPHIL-MNEKS), «Obligatorisk emne» (10 sp: INF100), og «Spesialisering» (90 sp: BIO100, BIO101, BIO102, BIO103, BIO104, MOL100, KJEM109, STAT101, PHYS101). Merk at UiBs eget begrep «Spesialisering» her betyr en fast fellespakke av 9 emner à 10 sp som ALLE studenter tar (ikke et valg mellom studieretninger) – disse er derfor ført direkte i obligatoriske-listen, ikke under spesialiseringer-feltet. MAT101 (Matematiske metoder 1) / MAT111 (Grunnkurs i matematikk I) er et obligatorisk valg mellom to alternative matematikkemner (10 sp, 1. semester, avhengig av forkunnskaper), og EXPHIL-MNSEM (seminarversjon) / EXPHIL-MNEKS (eksamensversjon) er et obligatorisk valg mellom to eksamensformer av examen philosophicum (10 sp, 4. semester) – begge er obligatoriske valg mellom alternativer og er derfor IKKE ført i obligatoriske-listen (kun i denne merknaden), i tråd med oppgavens regel. 100 sp (listen over) + 20 sp (matematikk- og exphil-alternativene) = 120 sp. Resterende 60 sp er valgfrie emner (5.–6. semester, ofte brukt til utveksling). Rekkefølge: 1. semester BIO100, MAT101/MAT111, MOL100; 2. semester BIO101, INF100, KJEM109; 3. semester BIO102, PHYS101, STAT101; 4. semester BIO103, BIO104, EXPHIL-MNSEM/EXPHIL-MNEKS; 5.–6. semester valgemne eller utveksling. Studieplanen beskriver ingen obligatorisk bacheloroppgave.',
        obligatoriske: [
          {
            emnekode: 'BIO100', emnenavn: 'Biologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO100-0'],
            years: [
              { year: 2021, A: 16, B: 28, C: 43, D: 16, E: 11, F: 6, G: 0, H: 0, total: 120, snitt: 3.03, strykprosent: 5, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 11, B: 28, C: 39, D: 18, E: 10, F: 4, G: 0, H: 0, total: 110, snitt: 3, strykprosent: 3.6, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 13, B: 26, C: 38, D: 24, E: 5, F: 8, G: 0, H: 0, total: 114, snitt: 2.95, strykprosent: 7, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 14, B: 26, C: 29, D: 18, E: 8, F: 7, G: 0, H: 0, total: 102, snitt: 2.99, strykprosent: 6.9, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 13, B: 26, C: 26, D: 13, E: 4, F: 0, G: 0, H: 0, total: 82, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MOL100', emnenavn: 'Molekylærbiologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MOL100-0'],
            years: [
              { year: 2021, A: 3, B: 8, C: 24, D: 17, E: 13, F: 3, G: 0, H: 0, total: 68, snitt: 2.44, strykprosent: 4.4, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 11, B: 31, C: 40, D: 38, E: 30, F: 31, G: 0, H: 0, total: 181, snitt: 2.24, strykprosent: 17.1, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 10, B: 20, C: 33, D: 29, E: 31, F: 19, G: 0, H: 0, total: 142, snitt: 2.24, strykprosent: 13.4, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 13, B: 29, C: 35, D: 27, E: 22, F: 3, G: 0, H: 0, total: 129, snitt: 2.81, strykprosent: 2.3, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 21, B: 23, C: 14, D: 11, E: 11, F: 4, G: 0, H: 0, total: 84, snitt: 3.24, strykprosent: 4.8, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BIO101', emnenavn: 'Biologi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO101-0'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 87, H: 20, total: 107, snitt: null, strykprosent: null, bestattprosent: 81.3, skjult: 0 },
              { year: 2022, A: 5, B: 17, C: 28, D: 22, E: 0, F: 31, G: 0, H: 0, total: 103, snitt: 2.15, strykprosent: 30.1, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 11, B: 23, C: 33, D: 24, E: 9, F: 3, G: 0, H: 0, total: 103, snitt: 2.94, strykprosent: 2.9, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 9, B: 35, C: 30, D: 15, E: 9, F: 0, G: 0, H: 0, total: 98, snitt: 3.2, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 10, B: 23, C: 32, D: 11, E: 13, F: 0, G: 0, H: 0, total: 89, snitt: 3.07, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'INF100', emnenavn: 'Programmering I', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['INF100-0'],
            years: [
              { year: 2021, A: 8, B: 6, C: 27, D: 27, E: 28, F: 19, G: 0, H: 0, total: 115, snitt: 1.97, strykprosent: 16.5, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 10, C: 18, D: 25, E: 33, F: 12, G: 0, H: 0, total: 98, snitt: 1.81, strykprosent: 12.2, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 3, B: 19, C: 26, D: 17, E: 13, F: 13, G: 0, H: 0, total: 91, snitt: 2.37, strykprosent: 14.3, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 3, B: 12, C: 7, D: 15, E: 53, F: 18, G: 0, H: 0, total: 108, snitt: 1.55, strykprosent: 16.7, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 6, B: 10, C: 19, D: 11, E: 28, F: 15, G: 0, H: 0, total: 89, snitt: 1.99, strykprosent: 16.9, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'KJEM109', emnenavn: 'Kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJEM109-0'],
            years: [
              { year: 2023, A: 5, B: 5, C: 34, D: 29, E: 11, F: 4, G: 0, H: 0, total: 88, snitt: 2.45, strykprosent: 4.5, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 6, B: 17, C: 23, D: 17, E: 19, F: 19, G: 0, H: 0, total: 101, snitt: 2.18, strykprosent: 18.8, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 10, B: 27, C: 26, D: 13, E: 5, F: 7, G: 0, H: 0, total: 88, snitt: 3.03, strykprosent: 8, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIO102', emnenavn: 'Biologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO102-0'],
            years: [
              { year: 2021, A: 16, B: 28, C: 13, D: 3, E: 6, F: 0, G: 0, H: 0, total: 66, snitt: 3.68, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 15, B: 36, C: 23, D: 12, E: 6, F: 7, G: 0, H: 0, total: 99, snitt: 3.21, strykprosent: 7.1, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 21, B: 26, C: 20, D: 18, E: 6, F: 0, G: 0, H: 0, total: 91, snitt: 3.42, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 15, B: 20, C: 24, D: 15, E: 5, F: 0, G: 0, H: 0, total: 79, snitt: 3.32, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 20, B: 33, C: 17, D: 12, E: 3, F: 0, G: 0, H: 0, total: 85, snitt: 3.65, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'PHYS101', emnenavn: 'Fysikk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['PHYS101-0'],
            years: [
              { year: 2021, A: 0, B: 5, C: 13, D: 9, E: 4, F: 6, G: 0, H: 0, total: 37, snitt: 2.19, strykprosent: 16.2, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 3, C: 12, D: 9, E: 13, F: 25, G: 0, H: 0, total: 62, snitt: 1.27, strykprosent: 40.3, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 4, B: 12, C: 44, D: 41, E: 36, F: 34, G: 0, H: 0, total: 171, snitt: 1.86, strykprosent: 19.9, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 5, B: 8, C: 14, D: 18, E: 21, F: 27, G: 0, H: 0, total: 93, snitt: 1.68, strykprosent: 29, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 0, C: 12, D: 17, E: 21, F: 54, G: 0, H: 0, total: 104, snitt: 0.88, strykprosent: 51.9, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'STAT101', emnenavn: 'Statistikk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['STAT101-0'],
            years: [
              { year: 2021, A: 0, B: 0, C: 3, D: 0, E: 0, F: 0, G: 54, H: 10, total: 67, snitt: 3, strykprosent: 0, bestattprosent: 84.4, skjult: 2 },
              { year: 2022, A: 5, B: 10, C: 15, D: 11, E: 14, F: 28, G: 7, H: 3, total: 93, snitt: 1.76, strykprosent: 33.7, bestattprosent: 70, skjult: 0 },
              { year: 2023, A: 19, B: 18, C: 22, D: 6, E: 13, F: 31, G: 0, H: 0, total: 109, snitt: 2.37, strykprosent: 28.4, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 9, B: 17, C: 23, D: 16, E: 19, F: 31, G: 0, H: 0, total: 115, snitt: 2.03, strykprosent: 27, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 16, B: 21, C: 24, D: 9, E: 12, F: 37, G: 0, H: 0, total: 119, snitt: 2.24, strykprosent: 31.1, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO103', emnenavn: 'Biologi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BIO103-0'],
            years: [
              { year: 2021, A: 5, B: 11, C: 23, D: 5, E: 0, F: 0, G: 0, H: 0, total: 44, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 15, D: 15, E: 7, F: 37, G: 0, H: 0, total: 74, snitt: 1.11, strykprosent: 50, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 5, B: 11, C: 39, D: 22, E: 20, F: 8, G: 0, H: 0, total: 105, snitt: 2.38, strykprosent: 7.6, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 6, B: 19, C: 30, D: 15, E: 16, F: 10, G: 0, H: 0, total: 96, snitt: 2.52, strykprosent: 10.4, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 12, B: 12, C: 26, D: 13, E: 9, F: 4, G: 0, H: 0, total: 76, snitt: 2.91, strykprosent: 5.3, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'BIO104', emnenavn: 'Biologi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BIO104-0'],
            years: [
              { year: 2021, A: 0, B: 20, C: 18, D: 8, E: 0, F: 0, G: 0, H: 0, total: 46, snitt: 3.26, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 4, C: 13, D: 19, E: 13, F: 16, G: 0, H: 0, total: 65, snitt: 1.63, strykprosent: 24.6, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 4, B: 20, C: 24, D: 26, E: 24, F: 18, G: 0, H: 0, total: 116, snitt: 2.14, strykprosent: 15.5, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 7, B: 14, C: 17, D: 24, E: 17, F: 27, G: 0, H: 0, total: 106, snitt: 1.95, strykprosent: 25.5, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 11, B: 22, C: 19, D: 12, E: 8, F: 19, G: 0, H: 0, total: 91, snitt: 2.55, strykprosent: 20.9, bestattprosent: null, skjult: 2 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_biologi', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Biologi (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.ntnu.no/studier/bbi', 'https://www.ntnu.no/studier/bbi/studiets-oppbygning', 'https://www.ntnu.no/studier/studieplan#programmeCode=BBI&year=2026'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 112.5,
        merknad: 'Kilde er NTNUs studieplan-API for programkode BBI, år 2026 (hentet via www.ntnu.no/studier/studieplan#programmeCode=BBI&year=2026, som er en JavaScript-app; de strukturerte dataene ble hentet direkte fra det underliggende JSON-endepunktet portlet-appen selv kaller), samt oversiktssiden «Studiets oppbygning». Programmet er 180 sp over 6 semester (3 år). Semester 1–3 er felles for alle (90 sp, ført i obligatoriske-listen: BI1003, HMS0001, MA0001, KJ1004, BI1001, BI1002, BI1006, BI1007, ST0103, BI1014). Fra og med 4. semester velger studenten en av tre tverrfaglige «Fag 2»-fagpakker (studieretninger i NTNUs studieplandata): Kjemi, Matematikk/statistikk eller Bærekraft – disse er ført under spesialiseringer, med kun de emnene som er 100 % fast obligatoriske innenfor hver fagpakke (studyChoice-kode «O» uten valgalternativ) i emnelisten; øvrige obligatoriske krav som er valg mellom navngitte alternativer (studyChoice-koder som «M1A», «15A», «MAX1A») er beskrevet i den enkelte fagpakkes egen merknad, i tråd med oppgavens regel om at obligatoriske valg mellom alternativer skal stå i merknad, ikke i emnelisten. EXPH0300 (Examen philosophicum for naturvitenskap og teknologi, 4. semester) og BI2900 (Bacheloroppgave i biologi, 15 sp, 6. semester) er identiske obligatoriske emner i alle tre fagpakkene og er derfor ført i hovedlisten (obligatoriske) fremfor under den enkelte spesialisering. Studiepoeng er hentet direkte fra studieplandataene (mange NTNU-emner er 7,5 eller 15 sp, ikke 10 sp).',
        obligatoriske: [
          {
            emnekode: 'BI1003', emnenavn: 'Økologi, atferd, evolusjon og bærekraft', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BI1003-1'],
            years: [
              { year: 2021, A: 0, B: 40, C: 42, D: 10, E: 0, F: 0, G: 0, H: 0, total: 92, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 6, B: 19, C: 39, D: 8, E: 4, F: 0, G: 0, H: 0, total: 76, snitt: 3.2, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 8, B: 69, C: 64, D: 19, E: 0, F: 0, G: 0, H: 0, total: 160, snitt: 3.41, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 34, C: 36, D: 10, E: 0, F: 0, G: 0, H: 0, total: 80, snitt: 3.3, strykprosent: 0, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'HMS0001', emnenavn: 'HMS-kurs for 1. årsstudenter', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0001-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 78, H: 0, total: 78, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 79, H: 0, total: 79, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 77, H: 0, total: 77, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 59, H: 0, total: 59, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'MA0001', emnenavn: 'Brukerkurs i matematikk A', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MA0001-1'],
            years: [
              { year: 2021, A: 25, B: 14, C: 19, D: 5, E: 0, F: 4, G: 0, H: 0, total: 67, snitt: 3.7, strykprosent: 6, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 7, B: 10, C: 14, D: 15, E: 15, F: 24, G: 0, H: 0, total: 85, snitt: 1.91, strykprosent: 28.2, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 3, B: 8, C: 19, D: 19, E: 17, F: 21, G: 0, H: 0, total: 87, snitt: 1.83, strykprosent: 24.1, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 5, B: 21, C: 28, D: 12, E: 26, F: 27, G: 0, H: 0, total: 119, snitt: 2.04, strykprosent: 22.7, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 58, B: 40, C: 29, D: 16, E: 9, F: 8, G: 0, H: 0, total: 160, snitt: 3.61, strykprosent: 5, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'KJ1004', emnenavn: 'Generell kjemi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJ1004-1'],
            years: [
              { year: 2025, A: 19, B: 29, C: 11, D: 9, E: 3, F: 4, G: 0, H: 0, total: 75, snitt: 3.53, strykprosent: 5.3, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BI1001', emnenavn: 'Celle- og molekylærbiologi', studiepoeng: 15, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BI1001-1'],
            years: [
              { year: 2021, A: 3, B: 24, C: 39, D: 25, E: 0, F: 0, G: 0, H: 0, total: 91, snitt: 3.05, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 25, C: 22, D: 28, E: 0, F: 13, G: 0, H: 0, total: 88, snitt: 2.52, strykprosent: 14.8, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 11, C: 26, D: 25, E: 3, F: 12, G: 0, H: 0, total: 77, snitt: 2.27, strykprosent: 15.6, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 3, B: 20, C: 28, D: 30, E: 0, F: 7, G: 0, H: 0, total: 88, snitt: 2.72, strykprosent: 8, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 11, B: 25, C: 17, D: 5, E: 5, F: 10, G: 0, H: 0, total: 73, snitt: 3.03, strykprosent: 13.7, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BI1002', emnenavn: 'Faunistikk og floristikk', studiepoeng: 15, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BI1002-1'], merknad: 'Har obligatoriske ekskursjoner (dags- og flerdagsekskursjoner) i løpet av vår og sommer.',
            years: [
              { year: 2021, A: 16, B: 41, C: 16, D: 5, E: 0, F: 0, G: 0, H: 0, total: 78, snitt: 3.87, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 9, B: 28, C: 24, D: 10, E: 4, F: 0, G: 0, H: 0, total: 75, snitt: 3.37, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 11, B: 40, C: 18, D: 0, E: 0, F: 0, G: 0, H: 0, total: 69, snitt: 3.9, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 24, B: 43, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 81, snitt: 4.12, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 15, B: 33, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 60, snitt: 4.05, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BI1006', emnenavn: 'Dyrenes struktur og funksjon', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BI1006-1'],
            years: [
              { year: 2021, A: 3, B: 48, C: 24, D: 0, E: 0, F: 0, G: 0, H: 0, total: 75, snitt: 3.72, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 21, C: 44, D: 12, E: 0, F: 0, G: 0, H: 0, total: 77, snitt: 3.12, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 4, B: 32, C: 25, D: 12, E: 0, F: 0, G: 0, H: 0, total: 73, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 3, B: 33, C: 44, D: 9, E: 0, F: 3, G: 0, H: 0, total: 92, snitt: 3.23, strykprosent: 3.3, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 22, C: 20, D: 10, E: 0, F: 0, G: 0, H: 0, total: 52, snitt: 3.23, strykprosent: 0, bestattprosent: null, skjult: 9 },
            ],
          },
          {
            emnekode: 'BI1007', emnenavn: 'Plantenes struktur og funksjon', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BI1007-1'],
            years: [
              { year: 2021, A: 4, B: 32, C: 32, D: 0, E: 0, F: 4, G: 0, H: 0, total: 72, snitt: 3.39, strykprosent: 5.6, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 4, B: 12, C: 24, D: 15, E: 4, F: 4, G: 0, H: 0, total: 63, snitt: 2.76, strykprosent: 6.3, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 36, C: 24, D: 6, E: 5, F: 0, G: 0, H: 0, total: 71, snitt: 3.28, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2024, A: 3, B: 54, C: 19, D: 5, E: 0, F: 0, G: 0, H: 0, total: 81, snitt: 3.68, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 16, B: 30, C: 10, D: 0, E: 0, F: 5, G: 0, H: 0, total: 61, snitt: 3.77, strykprosent: 8.2, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'ST0103', emnenavn: 'Brukerkurs i statistikk', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['ST0103-1'],
            years: [
              { year: 2021, A: 5, B: 6, C: 11, D: 10, E: 11, F: 8, G: 0, H: 0, total: 51, snitt: 2.22, strykprosent: 15.7, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 7, B: 16, C: 19, D: 19, E: 10, F: 0, G: 0, H: 0, total: 71, snitt: 2.87, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 9, B: 15, C: 23, D: 20, E: 10, F: 3, G: 0, H: 0, total: 80, snitt: 2.8, strykprosent: 3.8, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 16, B: 16, C: 16, D: 20, E: 11, F: 16, G: 0, H: 0, total: 95, snitt: 2.56, strykprosent: 16.8, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 39, B: 20, C: 23, D: 10, E: 4, F: 6, G: 0, H: 0, total: 102, snitt: 3.61, strykprosent: 5.9, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BI1014', emnenavn: 'Kvantitativ biologi', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'EXPH0300', emnenavn: 'Examen philosophicum for naturvitenskap og teknologi', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['EXPH0300-1'], merknad: 'Inngår identisk som obligatorisk emne i alle tre «Fag 2»-fagpakkene (Kjemi, Matematikk/statistikk, Bærekraft) og er dermed reelt obligatorisk for alle, uavhengig av valgt fagpakke.',
            years: [
              { year: 2021, A: 10, B: 22, C: 26, D: 6, E: 0, F: 0, G: 0, H: 0, total: 64, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 3, B: 22, C: 24, D: 10, E: 0, F: 0, G: 0, H: 0, total: 59, snitt: 3.31, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 3, B: 20, C: 22, D: 13, E: 0, F: 3, G: 0, H: 0, total: 61, snitt: 3.07, strykprosent: 4.9, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 18, C: 25, D: 21, E: 0, F: 0, G: 0, H: 0, total: 64, snitt: 2.95, strykprosent: 0, bestattprosent: null, skjult: 13 },
              { year: 2025, A: 0, B: 11, C: 25, D: 10, E: 0, F: 5, G: 0, H: 0, total: 51, snitt: 2.73, strykprosent: 9.8, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'BI2900', emnenavn: 'Bacheloroppgave i biologi', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Inngår identisk som obligatorisk emne i alle tre «Fag 2»-fagpakkene og er dermed reelt obligatorisk for alle.',
            years: [],
          },
        ],
        spesialiseringer: [
          { navn: 'Fag 2: Kjemi', obligatoriske: [
          ] },
          { navn: 'Fag 2: Matematikk og statistikk', obligatoriske: [
          ] },
          { navn: 'Fag 2: Bærekraft', obligatoriske: [
          ] },
        ],
      },
      {
        entryId: 'uit_biologi', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Biologi (bachelor)',
        studieplanAar: '2025/2026', kilder: ['https://uit.no/utdanning/program/274284/biologi_-_bachelor', 'https://uit.no/Content/868704/cache=20263108123957/Studieplan_B-BIO_f.o.m._kull_2025.pdf'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 140,
        merknad: 'Kilde er UiTs studieplan-PDF «Studieplan Bachelorgradsprogram i biologi» (godkjent 19.9.2024, oppdatert 01.11.2024, gjeldende f.o.m. kull 2025), lenket fra programsiden uit.no/utdanning/program/274284/biologi_-_bachelor (fanen «Oppbygging av studiet»). Programmet er 180 sp totalt: 120 sp biologirelaterte emner, 10 sp kjemi, 10 sp filosofi/vitenskapsteori, 10 sp valgfritt mellom «mikroemner» (2,5 sp-emner) eller praksisemnet MNF-2001 Realfagspraksis (4. semester, obligatorisk valg mellom alternativer – ikke ført i listen), og et fritt valgfagssemester på 30 sp i 5. semester (koordinert emnepakke fra annet fagfelt, utveksling eller opphold ved UNIS på Svalbard). De 14 emnene i obligatoriske-listen (140 sp) er alle uten valgalternativ. 140 + 10 (mikroemner/MNF-2001) + 30 (valgfagssemester) = 180 sp. Emnekoden for molekylær- og cellebiologiemnet i 2. semester er trykt som «MBI-1xxx» i selve studieplandokumentet, uten et konkret tall. Studieplanen beskriver ingen egen bacheloroppgave og ingen formelle studieretninger med separate obligatoriske emnelister.',
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
            dbhEmnekoder: [], merknad: 'Emnekoden er trykt eksakt slik i studieplan-PDF-en («MBI-1xxx»), uten en spesifikk firesifret kode – trolig fordi kurstilbudet/kodenummeret varierer mellom kull.',
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
        entryId: 'nord_biologi', shortName: 'Nord', institusjon: 'Nord universitet', isNmbu: false, programnavn: 'Biologi (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nord.no/studier/biologi-bachelor', 'https://www.nord.no/studier/studieplaner/biologi-babii-bachelor-host-2026'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 120,
        merknad: 'Kilde er Nord universitets studieplanside for Biologi (BABII), kull høst 2026 (www.nord.no/studier/studieplaner/biologi-babii-bachelor-host-2026). Programmet er 180 sp, undervisningsspråk engelsk, studiested Bodø. De to første studieårene (1.–4. semester, 120 sp) består utelukkende av obligatoriske emner, ført i listen over. Tredje studieår (5.–6. semester, 60 sp) består kun av valgfrie emner – en lang liste å velge blant (bl.a. BIO2024, PRA2060 Praksis i biologi, ECO2009, BIO2012, BIO2011, BIO2005, BIO1008, BIO2023, BIO2022, BIO2019, BIO2016, BIO2015, BIO2014, samt BIO2017 Bacheloroppgave i biologi 15 sp), utveksling eller opphold ved UNIS på Svalbard. Bacheloroppgaven (BIO2017) er dermed valgfri, ikke obligatorisk, for dette programmet, og er derfor ikke ført i obligatoriske-listen. Ingen egne obligatoriske studieretninger/spesialiseringer er beskrevet.',
        obligatoriske: [
          {
            emnekode: 'BIO1015', emnenavn: 'Biologisk mangfold 1 - protister og planter', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO1015-1'],
            years: [
              { year: 2024, A: 7, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.54, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 9, B: 11, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4.26, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO1017', emnenavn: 'Økologi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO1017-1'],
            years: [
              { year: 2024, A: 0, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 14, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.58, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BIO1016', emnenavn: 'Biologisk mangfold 2 - Invertebrater', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO1016-1'],
            years: [
              { year: 2024, A: 3, B: 6, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.92, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 11, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.61, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'KJE1002', emnenavn: 'Prinsipper i kjemi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJE1002-1'],
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 4, E: 0, F: 5, G: 0, H: 0, total: 9, snitt: 0.89, strykprosent: 55.6, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 0, B: 6, C: 0, D: 0, E: 5, F: 5, G: 0, H: 0, total: 16, snitt: 1.81, strykprosent: 31.2, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'KJE1001', emnenavn: 'Laboratoriesikkerhet', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJE1001-1'],
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 59, H: 0, total: 59, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 82, H: 0, total: 82, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'MAT1014', emnenavn: 'Matematikk og statistikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MAT1014-1'],
            years: [
              { year: 2025, A: 5, B: 0, C: 0, D: 0, E: 0, F: 5, G: 0, H: 0, total: 10, snitt: 2.5, strykprosent: 50, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'BIO1018', emnenavn: 'Essensiell cellebiologi og biokjemi', studiepoeng: 15, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO1018-1'],
            years: [
              { year: 2025, A: 0, B: 5, C: 0, D: 0, E: 0, F: 3, G: 0, H: 0, total: 8, snitt: 2.5, strykprosent: 37.5, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'BIO1013', emnenavn: 'Evolusjon og genetikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO1013-1'],
            years: [
              { year: 2025, A: 4, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.89, strykprosent: 0, bestattprosent: null, skjult: 9 },
            ],
          },
          {
            emnekode: 'BIO2009', emnenavn: 'Molekylær cellebiologi', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO2009-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 3, D: 0, E: 4, F: 5, G: 0, H: 0, total: 12, snitt: 1.08, strykprosent: 41.7, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MET1006', emnenavn: 'Vitenskapelige metoder', studiepoeng: 15, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MET1006-1'],
            years: [
              { year: 2025, A: 8, B: 3, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.83, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO1019', emnenavn: 'Biologisk mangfold 3 - Vertebrater', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO1019-1'],
            years: [
              { year: 2025, A: 6, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.23, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'BIO2010', emnenavn: 'Marinbiologi og oseanografi', studiepoeng: 15, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO1026', emnenavn: 'Zoofysiologi og embryologi', studiepoeng: 15, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uia_biologi', shortName: 'UiA', institusjon: 'Universitetet i Agder', isNmbu: false, programnavn: 'Biologi (bachelor)',
        studieplanAar: '2026-2029', kilder: ['https://www.uia.no/studier/program/biologi-bachelor/', 'https://www.uia.no/studier/program/biologi-bachelor/studieplaner/2026h.html'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 180,
        merknad: 'Kilde er UiAs studieplanside for Biologi, bachelorprogram (2026–2029) (www.uia.no/studier/program/biologi-bachelor/studieplaner/2026h.html). Programmet er 180 sp, med en fast, obligatorisk emnerekkefølge i standardløpet – 1., 2., 3. og 6. semester består utelukkende av obligatoriske emner (jf. programsidens egen tekst), og i 4. og 5. semester kan de tre ordinære obligatoriske emnene erstattes av emner ved Universitetssenteret på Svalbard (UNIS), et utvekslingsopphold (UTVOPP, 30 sp) eller (kun 5. semester) internship-emnet PRA205 (10 sp), etter søknad og godkjenning. Siden dette er en søknadsbasert erstatning av det ordinære obligatoriske løpet og ikke et fast valg mellom navngitte alternativer i studieplanens rutenett, er de 18 emnene i standardløpet (180 sp) ført i obligatoriske-listen, med merknad om erstatningsmuligheten på de aktuelle emnene i 4. og 5. semester. BIO300 Bacheloroppgave (20 sp) er programmets obligatoriske avsluttende fordypningsarbeid i 6. semester. EX-100 Examen philosophicum kan alternativt tas i 2. eller 3. studieår i stedet for fast i 6. semester. Programmet har ingen egne, navngitte studieretninger med separate obligatoriske emnelister.',
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
            dbhEmnekoder: ['ORG001-1'], merknad: 'Obligatorisk deltakelse ved studiestart.',
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
            dbhEmnekoder: ['KJ-213-1'], merknad: 'Kan erstattes av emner ved UNIS (Svalbard) eller et utvekslingsopphold på 30 sp, etter søknad og godkjenning.',
            years: [
              { year: 2022, A: 8, B: 14, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4.07, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 6, D: 3, E: 4, F: 5, G: 0, H: 0, total: 18, snitt: 1.56, strykprosent: 27.8, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 3, B: 0, C: 7, D: 6, E: 0, F: 4, G: 0, H: 0, total: 20, snitt: 2.4, strykprosent: 20, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 4, C: 0, D: 6, E: 4, F: 3, G: 0, H: 0, total: 17, snitt: 1.88, strykprosent: 17.6, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'MA-143', emnenavn: 'Biostatistikk', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MA-143-1'], merknad: 'Kan erstattes av emner ved UNIS (Svalbard) eller et utvekslingsopphold på 30 sp, etter søknad og godkjenning.',
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
            dbhEmnekoder: ['MA-168-1'], merknad: 'Kan erstattes av emner ved UNIS (Svalbard) eller et utvekslingsopphold på 30 sp, etter søknad og godkjenning.',
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
            dbhEmnekoder: ['BIO201-1'], merknad: 'Kan erstattes av PRA205 Internship, emner ved UNIS (Svalbard) eller et utvekslingsopphold på 30 sp, etter søknad og godkjenning.',
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
            dbhEmnekoder: ['BIO204-1'], merknad: 'Kan erstattes av PRA205 Internship, emner ved UNIS (Svalbard) eller et utvekslingsopphold på 30 sp, etter søknad og godkjenning.',
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
            dbhEmnekoder: ['BIO207-1'], merknad: 'Kan erstattes av PRA205 Internship, emner ved UNIS (Svalbard) eller et utvekslingsopphold på 30 sp, etter søknad og godkjenning.',
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
            dbhEmnekoder: ['EX-100-1'], merknad: 'Kan alternativt tas vår eller høst i 2. eller 3. studieår i stedet for fast plassering i 6. semester.',
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
        ],
      },
      {
        entryId: 'uib_molekylaerbiologi', shortName: 'UiB Molekylærbiologi', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Molekylærbiologi (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www4.uib.no/studier/program/molekylaerbiologi-bachelor', 'https://www4.uib.no/studier/program/molekylaerbiologi-bachelor/plan'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 100,
        merknad: 'Kilde er UiBs studieplanside for BAMN-MOL Bachelorprogram i molekylærbiologi, høst 2026 (www4.uib.no/studier/program/molekylaerbiologi-bachelor/plan). Programmet er 180 sp totalt. Studieplanen deler dei obligatoriske krava i «Obligatoriske emne» (examen philosophicum, MAT101/MAT111, INF100) og «Spesialisering» (100 sp, ein fast fellespakke som ALLE studentar tek, ikkje eit val mellom studieretningar): MOL100, MOL102, MOL103, MOL200, MOL201, MOL204, MOL222, KJEM110, KJEM130 (9 emne à 10 sp = 90 sp) pluss eitt valemne i statistikk eller matematikk (10 sp). INF100 og dei 9 namngjevne spesialiseringsemna (til saman 100 sp) er ført direkte i obligatoriske-lista over, sidan dei er reelt obligatoriske for alle utan noko val. MAT101 (Matematiske metoder 1) / MAT111 (Grunnkurs i matematikk I) er eit obligatorisk val mellom to alternative matematikkemne (10 sp, 1. semester), EXPHIL-MNSEM/EXPHIL-MNEKS er eit val mellom to eksamensformer av examen philosophicum (10 sp, 6. semester), og «eitt valemne i statistikk eller matematikk» (10 sp, 3. semester) er eit ope obligatorisk krav utan fast namngjeve emne – alle tre er difor IKKJE førte i obligatoriske-lista (kun i denne merknaden), i tråd med oppgåva sin regel om at obligatoriske val mellom alternativ skal stå i merknad. 100 sp (lista over) + 10 (MAT101/111) + 10 (matematikkvalg) + 10 (EXPHIL) = 130 sp fast obligatorisk/fastlagt innhald; resterande 50 sp er tilrådde/frie valemne (5. og delar av 6. semester). Tilrådd rekkefølgje: 1. semester KJEM110, MAT101/MAT111, MOL100; 2. semester INF100, KJEM130, MOL102; 3. semester MOL200, MOL103, matematikkvalg; 4. semester MOL201, MOL222, MOL204; 5. semester tre valemne (utveksling passar best her); 6. semester EXPHIL-MNSEM/EXPHIL-MNEKS og to valemne. Programmet har ingen eigne obligatoriske studieretningar og ingen obligatorisk bacheloroppgåve er skildra.',
        obligatoriske: [
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
            emnekode: 'MOL102', emnenavn: 'Eksperimentell molekylærbiologi I', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MOL102-0'],
            years: [
              { year: 2024, A: 0, B: 8, C: 16, D: 15, E: 3, F: 0, G: 0, H: 0, total: 42, snitt: 2.69, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 6, B: 16, C: 15, D: 8, E: 3, F: 0, G: 0, H: 0, total: 48, snitt: 3.29, strykprosent: 0, bestattprosent: null, skjult: 3 },
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
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'husdyr', label: 'Husdyrvitenskap', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_husdyr', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Husdyrvitenskap (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/bachelor/husdyrvitenskap', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-06/Bachelor%20Husdyrvitenskap%20-%202026.pdf'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 110,
        merknad: 'Kilde er NMBUs studieplan-PDF for Bachelor i husdyrvitenskap (B-HV), kull 2026, lenket fra «Studieplaner for studenter ved BIOVIT» (nmbu.no/fakulteter/fakultet-biovitenskap/vare-studenter-biovit). Programmet er 180 sp, hvorav 125 sp er obligatoriske (resten, 55 sp, er valgfrie emner inkl. bacheloroppgave i 3. studieår, som er valgfritt tilrettelagt for utveksling eller internship). Av de 125 obligatoriske sp er 110 sp de 14 entydig navngitte emnene i listen over, uten valgalternativ. De resterende 15 obligatoriske sp er to valg mellom alternativer, og er derfor IKKE ført i emnelisten, i tråd med oppgavens regel: (1) PHI100 Ex.phil / PHI101 Ex.phil seminarversjon (10 sp, høst, år 1), og (2) «velg også et av disse emnene»: BIO200 Molekylærgenetikk i eukaryoter / ECN260 Landbrukspolitikk I / HET203 Dyrevelferd (5 sp, januarblokk, år 2). 110 + 10 + 5 = 125 sp, i tråd med studieplanens egen sum. Studieplanen definerer ingen egne obligatoriske studieretninger/spesialiseringer med separate obligatoriske emnelister – i stedet finnes fire pooler av «valgfrie emner» (generelle, ernæring/fôrteknologi, etologi/husdyrmiljø, husdyravl/genetikk) som studenten fritt kan kombinere for å bygge en fordypning, og disse regnes ikke som obligatoriske. Ingen obligatorisk bacheloroppgave er ført i emnelisten, siden den (jf. studieplanens 55 valgfrie sp) ikke er skilt ut som et eget, navngitt obligatorisk emne i kildematerialet.',
        obligatoriske: [
          {
            emnekode: 'HFX131', emnenavn: 'Introduksjon til norsk husdyr- og akvakulturproduksjon', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HFX131-1'], merknad: 'Augustblokk før høstsemesteret.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'HFX132', emnenavn: 'Husdyrbiologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HFX132-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.26, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 3, B: 4, C: 4, D: 4, E: 0, F: 3, G: 0, H: 0, total: 18, snitt: 2.83, strykprosent: 16.7, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 3, C: 7, D: 0, E: 0, F: 3, G: 0, H: 0, total: 13, snitt: 2.54, strykprosent: 23.1, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 5, C: 3, D: 0, E: 0, F: 3, G: 0, H: 0, total: 11, snitt: 2.64, strykprosent: 27.3, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 3, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 2.92, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'STIN100', emnenavn: 'Biologisk dataanalyse', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['STIN100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 10, H: 0, total: 10, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'HFX133', emnenavn: 'Utfordringer for framtidas matproduksjon', studiepoeng: 5, aar: 1, semester: 'januarblokk',
            dbhEmnekoder: ['HFX133-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 7, total: 34, snitt: null, strykprosent: null, bestattprosent: 79.4, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 10, D: 5, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.67, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 3, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.27, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'BUS100', emnenavn: 'Grunnleggende bedriftsøkonomi', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BUS100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 3, total: 30, snitt: null, strykprosent: null, bestattprosent: 90, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 4, D: 5, E: 4, F: 0, G: 0, H: 0, total: 13, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 0, B: 0, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 2.57, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 4, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'BIO120', emnenavn: 'Genetikk, introduksjonskurs', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO120-1'],
            years: [
              { year: 2021, A: 0, B: 14, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 8, C: 0, D: 4, E: 0, F: 5, G: 0, H: 0, total: 17, snitt: 2.35, strykprosent: 29.4, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 7, B: 5, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 12, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'KJM100', emnenavn: 'Generell kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM100-1'],
            years: [
              { year: 2021, A: 0, B: 6, C: 10, D: 3, E: 3, F: 0, G: 0, H: 0, total: 22, snitt: 2.86, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 3, C: 0, D: 6, E: 6, F: 5, G: 0, H: 0, total: 20, snitt: 1.5, strykprosent: 25, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 4, C: 4, D: 5, E: 4, F: 0, G: 0, H: 0, total: 17, snitt: 2.47, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 6, D: 0, E: 3, F: 0, G: 0, H: 0, total: 9, snitt: 2.33, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'HET201', emnenavn: 'Husdyretologi', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['HET201-1'], merknad: 'Augustblokk før høstsemesteret.',
            years: [
              { year: 2021, A: 0, B: 9, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 8, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 4, B: 10, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.82, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 7, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.41, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'HFX201', emnenavn: 'Fysiologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['HFX201-1'],
            years: [
              { year: 2021, A: 5, B: 15, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.96, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 6, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.92, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 4, B: 4, C: 8, D: 4, E: 3, F: 0, G: 0, H: 0, total: 23, snitt: 3.09, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 3, C: 3, D: 5, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 2.82, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'STAT100', emnenavn: 'Statistikk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['STAT100-1'], merknad: 'Studieplanen oppgir semester «Høst/Vår»; plassert i år 2 høst i studieplanens eget rutenett.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 5, E: 7, F: 6, G: 0, H: 0, total: 18, snitt: 0.94, strykprosent: 33.3, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 3, B: 0, C: 3, D: 3, E: 4, F: 3, G: 0, H: 0, total: 16, snitt: 2.12, strykprosent: 18.8, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 0, C: 5, D: 3, E: 7, F: 4, G: 0, H: 0, total: 19, snitt: 1.47, strykprosent: 21.1, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 0, C: 0, D: 3, E: 3, F: 9, G: 0, H: 0, total: 15, snitt: 0.6, strykprosent: 60, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 0, B: 0, C: 0, D: 7, E: 3, F: 11, G: 0, H: 0, total: 21, snitt: 0.81, strykprosent: 52.4, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'KJB100', emnenavn: 'Introduksjon til biokjemi', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['KJB100-1'],
            years: [
              { year: 2021, A: 3, B: 0, C: 3, D: 5, E: 6, F: 8, G: 0, H: 0, total: 25, snitt: 1.6, strykprosent: 32, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 5, D: 3, E: 0, F: 6, G: 0, H: 0, total: 14, snitt: 1.5, strykprosent: 42.9, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 0, C: 8, D: 5, E: 0, F: 7, G: 0, H: 0, total: 20, snitt: 1.7, strykprosent: 35, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 11, D: 6, E: 0, F: 6, G: 0, H: 0, total: 23, snitt: 1.96, strykprosent: 26.1, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 3, D: 8, E: 0, F: 6, G: 0, H: 0, total: 17, snitt: 1.47, strykprosent: 35.3, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'HFE200', emnenavn: 'Generell ernæring', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['HFE200-1'],
            years: [
              { year: 2021, A: 8, B: 7, C: 11, D: 8, E: 4, F: 6, G: 0, H: 0, total: 44, snitt: 2.75, strykprosent: 13.6, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 5, C: 6, D: 8, E: 3, F: 6, G: 0, H: 0, total: 28, snitt: 2.04, strykprosent: 21.4, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 3, D: 3, E: 5, F: 3, G: 0, H: 0, total: 14, snitt: 1.43, strykprosent: 21.4, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 6, B: 0, C: 7, D: 4, E: 0, F: 4, G: 0, H: 0, total: 21, snitt: 2.81, strykprosent: 19, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 4, B: 3, C: 6, D: 7, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.2, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'HFA200', emnenavn: 'Generell husdyravl', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['HFA200-1'],
            years: [
              { year: 2021, A: 0, B: 13, C: 17, D: 4, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.26, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 14, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.74, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 4, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.92, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 4, B: 4, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.63, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 4, B: 9, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'SDG200', emnenavn: 'Bærekraftige matproduksjonssystemer', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['SDG200-1'],
            years: [
              { year: 2021, A: 0, B: 6, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.3, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 4, B: 3, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.4, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 4, B: 0, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 8, C: 15, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.35, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 3, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'nord_husdyr', shortName: 'Nord Husdyrvitenskap', institusjon: 'Nord universitet', isNmbu: false, programnavn: 'Husdyrvitenskap (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nord.no/studier/husdyrvitenskap-bachelor', 'https://www.nord.no/studier/studieplaner/husdyrvitenskap-321-bachelor-host-2026'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 135,
        merknad: 'Kilde er Nord universitets studieplanside for Husdyrvitenskap (321), kull høst 2026, studiested Steinkjer (www.nord.no/studier/studieplaner/husdyrvitenskap-321-bachelor-host-2026). Programmet er 180 sp. De 17 emnene i obligatoriske-listen (135 sp) er faste for alle studenter. I 2., 4. og 6. semester fylles resten av semesterets 30 sp med ett eller flere «anbefalte valgemner» (2. semester: HUS1009 Sports- og familiedyr, 7,5 sp; 4. semester: HUS2007 Småfeproduksjon, REG1003 Landbruksregnskap, HUS2009 Bygningsprosjektering, til sammen 22,5 sp; 6. semester: MAT1014 Matematikk og statistikk, HUS2012 Praksis i husdyrvitenskap, HUS2008 Fjørfeproduksjon, til sammen 15 sp) – disse kan også erstattes med emner fra andre studieprogram (f.eks. Skogfag, Naturforvaltning, Økonomi og administrasjon) etter godkjenning, og er derfor ikke ført som obligatoriske. HUS2010 Bacheloroppgave i husdyrvitenskap (15 sp, 6. semester) er obligatorisk. Ingen egne obligatoriske studieretninger/spesialiseringer er beskrevet.',
        obligatoriske: [
          {
            emnekode: 'HUS1005', emnenavn: 'Husdyrenes anatomi og fysiologi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HUS1005-1'],
            years: [
              { year: 2024, A: 0, B: 3, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 2.9, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 4, D: 3, E: 5, F: 0, G: 0, H: 0, total: 12, snitt: 1.92, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'KJE1001', emnenavn: 'Laboratoriesikkerhet', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJE1001-1'],
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 0, total: 15, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'KJE1000', emnenavn: 'Grunnleggende kjemi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJE1000-1'],
            years: [
              { year: 2024, A: 0, B: 0, C: 3, D: 4, E: 3, F: 3, G: 0, H: 0, total: 13, snitt: 1.54, strykprosent: 23.1, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 14, G: 0, H: 0, total: 14, snitt: 0, strykprosent: 100, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'HUS1007', emnenavn: 'Husdyrmiljø og -teknologi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HUS1007-1'],
            years: [
              { year: 2024, A: 0, B: 0, C: 6, D: 0, E: 0, F: 3, G: 0, H: 0, total: 9, snitt: 2, strykprosent: 33.3, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 4, C: 6, D: 4, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'HUS1006', emnenavn: 'Dyrevelferd og etologi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HUS1006-1'],
            years: [
              { year: 2024, A: 0, B: 3, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 2.9, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 4, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.4, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'HUS1008', emnenavn: 'Husdyrernæring 1', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['HUS1008-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 2.43, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'BIO1009', emnenavn: 'Cellebiologi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO1009-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 3, D: 4, E: 3, F: 0, G: 0, H: 0, total: 10, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIO1008', emnenavn: 'Bærekraft, klima og etikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO1008-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 5, D: 5, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'HUS2005', emnenavn: 'Byggeteknikk', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['HUS2005-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 8, D: 5, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 2.62, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'ECO1014', emnenavn: 'Bedriftsøkonomi for landbruket', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['ECO1014-1'],
            years: [
              { year: 2021, A: 3, B: 3, C: 9, D: 4, E: 7, F: 6, G: 0, H: 0, total: 32, snitt: 2.16, strykprosent: 18.8, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 0, C: 5, D: 4, E: 5, F: 4, G: 0, H: 0, total: 18, snitt: 1.56, strykprosent: 22.2, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 6, F: 0, G: 0, H: 0, total: 6, snitt: 1, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2024, A: 0, B: 5, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 8, snitt: 2.88, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 4, C: 3, D: 5, E: 4, F: 0, G: 0, H: 0, total: 16, snitt: 2.44, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'HUS2004', emnenavn: 'Husdyrernæring 2', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['HUS2004-1'],
            years: [
              { year: 2025, A: 0, B: 3, C: 4, D: 8, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.67, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'HUS1004', emnenavn: 'Fôrdyrking og fôrmidler', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['HUS1004-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 7, E: 9, F: 7, G: 0, H: 0, total: 23, snitt: 1, strykprosent: 30.4, bestattprosent: null, skjult: 9 },
              { year: 2022, A: 0, B: 0, C: 0, D: 6, E: 8, F: 4, G: 0, H: 0, total: 18, snitt: 1.11, strykprosent: 22.2, bestattprosent: null, skjult: 9 },
              { year: 2023, A: 0, B: 3, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 5, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 4, C: 4, D: 8, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 2.75, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'HUS2006', emnenavn: 'Svineproduksjon', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MET1005', emnenavn: 'Akademisk skriving og metode', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'HUS2011', emnenavn: 'Storfeproduksjon og driftsøkonomi', studiepoeng: 15, aar: 3, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'HUS3301', emnenavn: 'Landbrukspolitikk', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['HUS3301-1'],
            years: [
              { year: 2021, A: 0, B: 6, C: 13, D: 9, E: 7, F: 3, G: 0, H: 0, total: 38, snitt: 2.32, strykprosent: 7.9, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 4, C: 6, D: 0, E: 9, F: 0, G: 0, H: 0, total: 19, snitt: 2.26, strykprosent: 0, bestattprosent: null, skjult: 10 },
              { year: 2023, A: 0, B: 0, C: 6, D: 3, E: 3, F: 3, G: 0, H: 0, total: 15, snitt: 1.8, strykprosent: 20, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 0, D: 6, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2025, A: 0, B: 5, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'HUS2010', emnenavn: 'Bacheloroppgave i husdyrvitenskap', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['HUS2010-1'],
            years: [
              { year: 2021, A: 8, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.29, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'inn_agronomi_husdyr', shortName: 'INN Agronomi', institusjon: 'Universitetet i Innlandet', isNmbu: false, programnavn: 'Agronomi (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.inn.no/studier/vare-studier/bachelor-i-agronomi/', 'https://studiekatalog.edutorium.no/inn/nb/program/BAAGRO/2026'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 180,
        merknad: 'Kilde er Universitetet i Innlandets studiekatalog for BAAGRO Bachelor i agronomi, startsemester høst 2026, studiested Blæstad (studiekatalog.edutorium.no/inn/nb/program/BAAGRO/2026). Programmet er 180 sp, og studiemodell-tabellen i kilden merker samtlige 18 emner med typekode «O» (Obligatorisk) – det finnes ingen valgfrie («V») emner i studiemodellen, så hele graden på 180 sp er obligatorisk for alle studenter. Programmet deler et felles første studieår med bachelor i landbruksteknikk (også tilgjengelig som årsstudium i jordbruk), og flere emner i år 2–3 er felles med landbruksteknikk-programmet (merket i den enkelte emnes merknad). Programmet har ingen egne, valgfrie studieretninger; det er ett samlet, integrert studieløp som dekker både plante- og husdyrfag. Denne filen er brukt for BIOVIT-programkartets «husdyr»-sammenligningsgruppe (identisk innhold, bortsett fra entryId, som inn_agronomi.json, som brukes for «plante»-gruppen). De tre husdyrrelevante emnene (AGR2203 Husdyrernæring, AGR2302 Husdyrhold, 6JB242 Husdyrmiljø og innendørsmekanisering, til sammen 30 sp) er i tillegg ført under spesialiseringer som en tematisk gruppering, jf. oppgavens instruks om at husdyrspesialiseringens emner skal stå der – disse emnene er fortsatt obligatoriske for alle og er derfor også med i hovedlisten obligatoriske ovenfor, siden programmet ikke har noen reell valgfri studieretning.',
        obligatoriske: [
          {
            emnekode: 'AGR1101', emnenavn: 'Naturgrunnlaget', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['AGR1101-1'],
            years: [
              { year: 2021, A: 4, B: 7, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.55, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 3, total: 21, snitt: null, strykprosent: null, bestattprosent: 85.7, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'LAN1101', emnenavn: 'Innføring i landbruk', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['LAN1101-1'], merknad: 'Felles emne med bachelor i landbruksteknikk.',
            years: [
              { year: 2021, A: 6, B: 6, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.71, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 11, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.61, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 3, B: 4, C: 9, D: 0, E: 0, F: 3, G: 0, H: 0, total: 19, snitt: 3.05, strykprosent: 15.8, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 5, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.71, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: '6JB295', emnenavn: 'Rapport og analyse', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['6JB295-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 3, total: 23, snitt: null, strykprosent: null, bestattprosent: 87, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 3, C: 5, D: 0, E: 0, F: 0, G: 15, H: 0, total: 23, snitt: 3.38, strykprosent: 0, bestattprosent: 100, skjult: 9 },
            ],
          },
          {
            emnekode: 'AGR1102', emnenavn: 'Landbruk, miljø og samfunn', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['AGR1102-1'],
            years: [
              { year: 2022, A: 0, B: 6, C: 0, D: 7, E: 4, F: 0, G: 0, H: 0, total: 17, snitt: 2.47, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 4, B: 0, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.29, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 4, C: 6, D: 0, E: 5, F: 0, G: 0, H: 0, total: 15, snitt: 2.6, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.56, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'AGR1103', emnenavn: 'Planter og produksjon', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['AGR1103-1'],
            years: [
              { year: 2022, A: 0, B: 4, C: 8, D: 8, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 2.8, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'LAN1102', emnenavn: 'Landbruksmaskiner', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['LAN1102-1'], merknad: 'Felles emne med bachelor i landbruksteknikk.',
            years: [
              { year: 2022, A: 3, B: 11, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.81, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 3, total: 15, snitt: null, strykprosent: null, bestattprosent: 80, skjult: 2 },
            ],
          },
          {
            emnekode: 'AGR2201', emnenavn: 'Plantevern og plantehelse', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['AGR2201-1'],
            years: [
              { year: 2022, A: 4, B: 6, C: 11, D: 4, E: 3, F: 0, G: 0, H: 0, total: 28, snitt: 3.14, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 5, total: 24, snitt: null, strykprosent: null, bestattprosent: 79.2, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 3, total: 15, snitt: null, strykprosent: null, bestattprosent: 80, skjult: 2 },
            ],
          },
          {
            emnekode: '6JB121', emnenavn: 'Biologi', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['6JB121-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 7, D: 12, E: 9, F: 0, G: 0, H: 0, total: 28, snitt: 1.93, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 3, C: 10, D: 6, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 2.84, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 5, B: 6, C: 4, D: 3, E: 3, F: 0, G: 0, H: 0, total: 21, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 9 },
            ],
          },
          {
            emnekode: '6JB201', emnenavn: 'Landbruksøkonomi og grønt entreprenørskap', studiepoeng: 15, aar: 2, semester: 'høst',
            dbhEmnekoder: ['6JB201-1'], merknad: 'Felles emne med bachelor i landbruksteknikk.',
            years: [
              { year: 2021, A: 0, B: 13, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.68, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 8, B: 18, C: 22, D: 4, E: 0, F: 0, G: 0, H: 0, total: 52, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 5, B: 6, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.68, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 6, B: 8, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.18, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 3, C: 4, D: 0, E: 3, F: 0, G: 0, H: 0, total: 10, snitt: 2.7, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'AGR2203', emnenavn: 'Husdyrernæring', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['AGR2203-1'],
            years: [
              { year: 2023, A: 0, B: 7, C: 14, D: 4, E: 4, F: 0, G: 0, H: 0, total: 29, snitt: 2.83, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 4, C: 9, D: 7, E: 4, F: 0, G: 0, H: 0, total: 24, snitt: 2.54, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 6, D: 7, E: 7, F: 3, G: 0, H: 0, total: 23, snitt: 1.7, strykprosent: 13, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'LAN2202', emnenavn: 'Feltmekanisering 1 – våronn', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['LAN2202-1'], merknad: 'Felles emne med bachelor i landbruksteknikk.',
            years: [
              { year: 2023, A: 5, B: 13, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.96, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 6, B: 10, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.16, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 6, B: 7, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.12, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'AGR2202', emnenavn: 'Vitenskapelig metode og statistikk', studiepoeng: 15, aar: 2, semester: 'vår',
            dbhEmnekoder: ['AGR2202-1'],
            years: [
              { year: 2023, A: 0, B: 4, C: 11, D: 5, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 2.95, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'AGR2301', emnenavn: 'Planteforedling og diversitet', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['AGR2301-1'],
            years: [
              { year: 2023, A: 5, B: 13, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.92, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 10, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.59, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 5, B: 9, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.06, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'AGR2302', emnenavn: 'Husdyrhold', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['AGR2302-1'],
            years: [
              { year: 2023, A: 6, B: 6, C: 8, D: 7, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.41, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 7, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.21, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 3, B: 6, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'LAN2301', emnenavn: 'Feltmekanisering 2 – høstonn', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['LAN2301-1'], merknad: 'Felles emne med bachelor i landbruksteknikk.',
            years: [
              { year: 2023, A: 5, B: 11, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.91, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 6, B: 8, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.11, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 6, B: 10, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.16, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'LAN2302', emnenavn: 'Presisjonsjordbruk', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['LAN2302-1'], merknad: 'Felles emne med bachelor i landbruksteknikk.',
            years: [
              { year: 2023, A: 6, B: 14, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4.13, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 9, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.45, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 8, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.47, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: '6JB242', emnenavn: 'Husdyrmiljø og innendørsmekanisering', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['6JB242-1'], merknad: 'Felles emne med bachelor i landbruksteknikk.',
            years: [
              { year: 2021, A: 0, B: 10, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 16, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.7, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 3, B: 14, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.8, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 7, B: 0, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.7, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: '6JB297', emnenavn: 'Bacheloroppgave i agronomi', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['6JB297-1'],
            years: [
              { year: 2021, A: 9, B: 4, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.95, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 8, B: 6, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 7, B: 4, C: 5, D: 6, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.55, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 4, B: 8, C: 12, D: 3, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.48, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 6, B: 0, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Husdyr (tematisk gruppering av obligatoriske emner)', obligatoriske: [
          ] },
        ],
      },
      {
        entryId: 'nord_dyrepleie', shortName: 'Nord Dyrepleie', institusjon: 'Nord universitet', isNmbu: false, programnavn: 'Dyrepleie (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nord.no/studier/dyrepleie-bachelor', 'https://www.nord.no/studier/studieplaner/dyrepleie-badyr-bachelor-host-2026'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 165,
        merknad: 'Kilde er Nord universitets studieplanside for Dyrepleie (BADYR), kull høst 2026, studiested Bodø (www.nord.no/studier/studieplaner/dyrepleie-badyr-bachelor-host-2026). Programmet er 180 sp. Praksis utgjør nesten et helt studieår, fordelt på PRA2057 (7 uker, 2. år vår) og PRA2058 (19 uker, hele 5. semester/3. år høst), i tillegg til praksis integrert i DYR1005 (4 uker, 1. år). De 15 emnene i obligatoriske-listen (165 sp) er faste for alle studenter. I 6. semester fyller et valgfritt element resten av semesterets 30 sp (15 sp) fra en liste merket «Valgemner»: enten DYR2009 Bacheloroppgave i dyrepleie (15 sp) alene, eller kombinasjonen MAT1014 Matematikk og statistikk + BIO1013 Evolusjon og genetikk (7,5 + 7,5 sp). Bacheloroppgaven er dermed valgfri, ikke obligatorisk, for dette programmet, og er derfor ikke ført i obligatoriske-listen. Ingen egne obligatoriske studieretninger/spesialiseringer er beskrevet.',
        obligatoriske: [
          {
            emnekode: 'KJE1001', emnenavn: 'Laboratoriesikkerhet', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJE1001-1'],
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
            emnekode: 'DYR1004', emnenavn: 'Anatomi, fysiologi og generell patologi', studiepoeng: 15, aar: 1, semester: 'helår',
            dbhEmnekoder: ['DYR1004-1'], merknad: 'Årsemne (høst + vår); studiepoeng registreres i studieplanen ved fullføring i 2. semester.',
            years: [
              { year: 2025, A: 3, B: 4, C: 6, D: 22, E: 10, F: 14, G: 0, H: 0, total: 59, snitt: 1.75, strykprosent: 23.7, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'DYR1005', emnenavn: 'Introduksjon til dyrepleie og dyrehelse', studiepoeng: 15, aar: 1, semester: 'helår',
            dbhEmnekoder: ['DYR1005-1'], merknad: 'Årsemne (høst + vår); studiepoeng registreres i studieplanen ved fullføring i 2. semester. Inkluderer 4 uker praksis i 2. semester.',
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
            dbhEmnekoder: [], merknad: '7 uker praksis.',
            years: [],
          },
          {
            emnekode: 'DYR2006', emnenavn: 'Klinisk dyrepleie og farmakologi', studiepoeng: 22.5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'PRA2058', emnenavn: 'Praktiske studier 3', studiepoeng: 30, aar: 3, semester: 'høst',
            dbhEmnekoder: [], merknad: '19 uker praksis; utgjør hele 5. semester.',
            years: [],
          },
          {
            emnekode: 'DYR2008', emnenavn: 'Regelverk, yrkesetikk og psykisk helse', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'DYR2007', emnenavn: 'Forsøksdyr og komparativ dyrehelse', studiepoeng: 7.5, aar: 3, semester: 'vår',
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
    id: 'plante', label: 'Plantevitenskap', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_plante', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Plantevitenskap (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/bachelor/plantevitenskap', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-05/B-PV_2026_27.pdf'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 115,
        merknad: 'Kilde er NMBUs fargekodede studieplan-PDF for Bachelor i plantevitenskap (B-PV), opptak 2026, lenket fra «Studieplaner for studenter ved BIOVIT». Programmet er 180 sp, hvorav 130 sp er obligatoriske (125 sp dersom PLV210+PLV211 velges i stedet for PLV200, se merknad på PLV200), pluss minimum 30 sp plantevitenskapelige emner (elektivt, ikke ført i listen) og resten fritt valgfritt. De 13 emnene i obligatoriske-listen over (115 sp) er uten valgalternativ. To obligatoriske krav er valg mellom alternativer og derfor IKKE ført i listen, i tråd med oppgavens regel: (1) PHI100 Examen philosophicum / PHI101 Ex.phil seminarversjon / PHI102 (engelsk, vårparallell) (10 sp, høst år 1); (2) BIO260 / PJH205 Semesteroppgave (5 sp, vår år 3) – en obligatorisk semesteroppgave som registreres under én av to alternative emnekoder avhengig av fagretning. 115 (listen) + 10 (PHI) + 5 (semesteroppgave) = 130 sp, i tråd med studieplanens egen sum. Studieplanen definerer ingen egne obligatoriske studieretninger/spesialiseringer med separate emnelister; «grønn liste»-emnene (minimum 30 sp) og de øvrige valgfrie emnepoolene (internship, biologi/bioteknologi/kjemi, bærekraft/landbruk, teknologi/klima/miljø, økonomi/ledelse/samfunnsfag, verktøysfag) er elektive og ikke ført som obligatoriske.',
        obligatoriske: [
          {
            emnekode: 'PJH102', emnenavn: 'Innføring i plantevitenskap', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['PJH102-1'], merknad: 'Augustblokk før høstsemesteret.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 10, H: 0, total: 10, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 0, total: 14, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BOT130', emnenavn: 'Grunnleggende plantefysiologi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BOT130-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 6, D: 5, E: 5, F: 0, G: 0, H: 0, total: 19, snitt: 2.37, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 0, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 3, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 6, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 0, C: 7, D: 0, E: 3, F: 0, G: 0, H: 0, total: 10, snitt: 2.4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 0, C: 4, D: 0, E: 0, F: 3, G: 0, H: 0, total: 7, snitt: 1.71, strykprosent: 42.9, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'STIN100', emnenavn: 'Biologisk dataanalyse', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['STIN100-1'],
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 3, total: 14, snitt: null, strykprosent: null, bestattprosent: 78.6, skjult: 0 },
            ],
          },
          {
            emnekode: 'HFX133', emnenavn: 'Utfordringer for framtidas matproduksjon', studiepoeng: 5, aar: 1, semester: 'januarblokk',
            dbhEmnekoder: ['HFX133-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 3, total: 23, snitt: null, strykprosent: null, bestattprosent: 87, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 3, total: 21, snitt: null, strykprosent: null, bestattprosent: 85.7, skjult: 0 },
              { year: 2023, A: 0, B: 9, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'KJM100', emnenavn: 'Generell kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM100-1'],
            years: [
              { year: 2021, A: 3, B: 6, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 0, C: 5, D: 5, E: 7, F: 0, G: 0, H: 0, total: 17, snitt: 1.88, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 4, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 0, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 5, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 8 },
            ],
          },
          {
            emnekode: 'BOT100', emnenavn: 'Plantediversitet', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BOT100-1'], merknad: 'Har et feltkurs sammen med ZOOL220 i juniblokk.',
            years: [
              { year: 2021, A: 0, B: 14, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.82, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 11, C: 0, D: 5, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 4, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 3, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 5, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.17, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO120', emnenavn: 'Genetikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO120-1'],
            years: [
              { year: 2021, A: 0, B: 9, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 6, C: 3, D: 4, E: 0, F: 4, G: 0, H: 0, total: 17, snitt: 2.41, strykprosent: 23.5, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 4, C: 3, D: 0, E: 0, F: 3, G: 0, H: 0, total: 10, snitt: 2.5, strykprosent: 30, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'ZOOL220', emnenavn: 'Insekter og edderkoppdyr', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Har et feltkurs sammen med BOT100 i juniblokk.',
            years: [],
          },
          {
            emnekode: 'JORD100', emnenavn: 'Jordlære', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['JORD100-1'],
            years: [
              { year: 2022, A: 0, B: 7, C: 0, D: 3, E: 0, F: 6, G: 0, H: 0, total: 16, snitt: 2.12, strykprosent: 37.5, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 4, C: 5, D: 0, E: 4, F: 0, G: 0, H: 0, total: 13, snitt: 2.69, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'BIO130', emnenavn: 'Generell mikrobiologi I', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO130-1'],
            years: [
              { year: 2021, A: 5, B: 8, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.7, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 3, B: 0, C: 3, D: 0, E: 0, F: 5, G: 0, H: 0, total: 11, snitt: 2.18, strykprosent: 45.5, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 3, B: 3, C: 4, D: 0, E: 0, F: 4, G: 0, H: 0, total: 14, snitt: 2.79, strykprosent: 28.6, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 3, C: 3, D: 0, E: 0, F: 4, G: 0, H: 0, total: 10, snitt: 2.1, strykprosent: 40, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 5, B: 0, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BOT200', emnenavn: 'Plantefysiologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BOT200-1'],
            years: [
              { year: 2021, A: 0, B: 4, C: 5, D: 5, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 3, C: 4, D: 0, E: 4, F: 0, G: 0, H: 0, total: 11, snitt: 2.55, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 3, C: 3, D: 5, E: 0, F: 3, G: 0, H: 0, total: 14, snitt: 2.21, strykprosent: 21.4, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 12 },
              { year: 2025, A: 0, B: 3, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'STAT100', emnenavn: 'Statistikk', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['STAT100-1'], merknad: 'Kan også tas i høstparallellen.',
            years: [
              { year: 2021, A: 0, B: 0, C: 3, D: 6, E: 12, F: 6, G: 0, H: 0, total: 27, snitt: 1.22, strykprosent: 22.2, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 3, B: 0, C: 0, D: 7, E: 3, F: 3, G: 0, H: 0, total: 16, snitt: 2, strykprosent: 18.8, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 9 },
              { year: 2024, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 11 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'JORD230', emnenavn: 'Jord som vekstmedium', studiepoeng: 15, aar: 3, semester: 'høst',
            dbhEmnekoder: ['JORD230-1'], merknad: 'Intensivemne som strekker seg over augustblokk og høstparallell i 3. år.',
            years: [
              { year: 2021, A: 0, B: 5, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.15, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 0, B: 3, C: 4, D: 0, E: 0, F: 6, G: 0, H: 0, total: 13, snitt: 1.85, strykprosent: 46.2, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 3, C: 3, D: 3, E: 0, F: 4, G: 0, H: 0, total: 13, snitt: 2.08, strykprosent: 30.8, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 0, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'PLV200', emnenavn: 'Sykdommer, skadedyr og ugras i jord- og hagebruk', studiepoeng: 15, aar: 3, semester: 'høst',
            dbhEmnekoder: ['PLV200-1'], merknad: 'Intensivemne som strekker seg over juniblokk (2. år), augustblokk og høstparallell (3. år). Kan erstattes av PLV210 Plantevern i grøntanlegg (5 sp) + PLV211 (5 sp), til sammen 10 sp, for studenter som vil fordype seg i grøntmiljø – da blir obligatoriskeStudiepoeng 5 sp lavere (125 sp totalt i stedet for 130), jf. studieplanens egen sum «130 (125)».',
            years: [
              { year: 2021, A: 0, B: 8, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 6, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 6, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'inn_agronomi', shortName: 'INN Agronomi', institusjon: 'Universitetet i Innlandet', isNmbu: false, programnavn: 'Agronomi (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.inn.no/studier/vare-studier/bachelor-i-agronomi/', 'https://studiekatalog.edutorium.no/inn/nb/program/BAAGRO/2026'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 180,
        merknad: 'Kilde er Universitetet i Innlandets studiekatalog for BAAGRO Bachelor i agronomi, startsemester høst 2026, studiested Blæstad (studiekatalog.edutorium.no/inn/nb/program/BAAGRO/2026). Programmet er 180 sp, og studiemodell-tabellen i kilden merker samtlige 18 emner med typekode «O» (Obligatorisk) – det finnes ingen valgfrie («V») emner i studiemodellen, så hele graden på 180 sp er obligatorisk for alle studenter. Programmet deler et felles første studieår med bachelor i landbruksteknikk (også tilgjengelig som årsstudium i jordbruk), og flere emner i år 2–3 er felles med landbruksteknikk-programmet (merket i den enkelte emnes merknad). Programmet har ingen egne, valgfrie studieretninger; det er ett samlet, integrert studieløp som dekker både plante- og husdyrfag. Denne filen er brukt for BIOVIT-programkartets «plante»-sammenligningsgruppe (samme kilde og innhold som inn_agronomi_husdyr.json, som brukes for «husdyr»-gruppen; se sistnevnte fil for en tematisk merking av de husdyrrelevante emnene under spesialiseringer).',
        obligatoriske: [
          {
            emnekode: 'AGR1101', emnenavn: 'Naturgrunnlaget', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['AGR1101-1'],
            years: [
              { year: 2021, A: 4, B: 7, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.55, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 3, total: 21, snitt: null, strykprosent: null, bestattprosent: 85.7, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'LAN1101', emnenavn: 'Innføring i landbruk', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['LAN1101-1'], merknad: 'Felles emne med bachelor i landbruksteknikk.',
            years: [
              { year: 2021, A: 6, B: 6, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.71, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 11, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.61, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 3, B: 4, C: 9, D: 0, E: 0, F: 3, G: 0, H: 0, total: 19, snitt: 3.05, strykprosent: 15.8, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 5, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.71, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: '6JB295', emnenavn: 'Rapport og analyse', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['6JB295-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 3, total: 23, snitt: null, strykprosent: null, bestattprosent: 87, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 3, C: 5, D: 0, E: 0, F: 0, G: 15, H: 0, total: 23, snitt: 3.38, strykprosent: 0, bestattprosent: 100, skjult: 9 },
            ],
          },
          {
            emnekode: 'AGR1102', emnenavn: 'Landbruk, miljø og samfunn', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['AGR1102-1'],
            years: [
              { year: 2022, A: 0, B: 6, C: 0, D: 7, E: 4, F: 0, G: 0, H: 0, total: 17, snitt: 2.47, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 4, B: 0, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.29, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 4, C: 6, D: 0, E: 5, F: 0, G: 0, H: 0, total: 15, snitt: 2.6, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.56, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'AGR1103', emnenavn: 'Planter og produksjon', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['AGR1103-1'],
            years: [
              { year: 2022, A: 0, B: 4, C: 8, D: 8, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 2.8, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'LAN1102', emnenavn: 'Landbruksmaskiner', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['LAN1102-1'], merknad: 'Felles emne med bachelor i landbruksteknikk.',
            years: [
              { year: 2022, A: 3, B: 11, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.81, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 3, total: 15, snitt: null, strykprosent: null, bestattprosent: 80, skjult: 2 },
            ],
          },
          {
            emnekode: 'AGR2201', emnenavn: 'Plantevern og plantehelse', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['AGR2201-1'],
            years: [
              { year: 2022, A: 4, B: 6, C: 11, D: 4, E: 3, F: 0, G: 0, H: 0, total: 28, snitt: 3.14, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 5, total: 24, snitt: null, strykprosent: null, bestattprosent: 79.2, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 3, total: 15, snitt: null, strykprosent: null, bestattprosent: 80, skjult: 2 },
            ],
          },
          {
            emnekode: '6JB121', emnenavn: 'Biologi', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['6JB121-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 7, D: 12, E: 9, F: 0, G: 0, H: 0, total: 28, snitt: 1.93, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 3, C: 10, D: 6, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 2.84, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 5, B: 6, C: 4, D: 3, E: 3, F: 0, G: 0, H: 0, total: 21, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 9 },
            ],
          },
          {
            emnekode: '6JB201', emnenavn: 'Landbruksøkonomi og grønt entreprenørskap', studiepoeng: 15, aar: 2, semester: 'høst',
            dbhEmnekoder: ['6JB201-1'], merknad: 'Felles emne med bachelor i landbruksteknikk.',
            years: [
              { year: 2021, A: 0, B: 13, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.68, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 8, B: 18, C: 22, D: 4, E: 0, F: 0, G: 0, H: 0, total: 52, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 5, B: 6, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.68, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 6, B: 8, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.18, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 3, C: 4, D: 0, E: 3, F: 0, G: 0, H: 0, total: 10, snitt: 2.7, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'AGR2203', emnenavn: 'Husdyrernæring', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['AGR2203-1'],
            years: [
              { year: 2023, A: 0, B: 7, C: 14, D: 4, E: 4, F: 0, G: 0, H: 0, total: 29, snitt: 2.83, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 4, C: 9, D: 7, E: 4, F: 0, G: 0, H: 0, total: 24, snitt: 2.54, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 6, D: 7, E: 7, F: 3, G: 0, H: 0, total: 23, snitt: 1.7, strykprosent: 13, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'LAN2202', emnenavn: 'Feltmekanisering 1 – våronn', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['LAN2202-1'], merknad: 'Felles emne med bachelor i landbruksteknikk.',
            years: [
              { year: 2023, A: 5, B: 13, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.96, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 6, B: 10, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.16, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 6, B: 7, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.12, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'AGR2202', emnenavn: 'Vitenskapelig metode og statistikk', studiepoeng: 15, aar: 2, semester: 'vår',
            dbhEmnekoder: ['AGR2202-1'],
            years: [
              { year: 2023, A: 0, B: 4, C: 11, D: 5, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 2.95, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'AGR2301', emnenavn: 'Planteforedling og diversitet', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['AGR2301-1'],
            years: [
              { year: 2023, A: 5, B: 13, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.92, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 10, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.59, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 5, B: 9, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.06, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'AGR2302', emnenavn: 'Husdyrhold', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['AGR2302-1'],
            years: [
              { year: 2023, A: 6, B: 6, C: 8, D: 7, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.41, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 7, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.21, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 3, B: 6, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'LAN2301', emnenavn: 'Feltmekanisering 2 – høstonn', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['LAN2301-1'], merknad: 'Felles emne med bachelor i landbruksteknikk.',
            years: [
              { year: 2023, A: 5, B: 11, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.91, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 6, B: 8, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.11, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 6, B: 10, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4.16, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'LAN2302', emnenavn: 'Presisjonsjordbruk', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['LAN2302-1'], merknad: 'Felles emne med bachelor i landbruksteknikk.',
            years: [
              { year: 2023, A: 6, B: 14, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4.13, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 9, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.45, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 8, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.47, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: '6JB242', emnenavn: 'Husdyrmiljø og innendørsmekanisering', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['6JB242-1'], merknad: 'Felles emne med bachelor i landbruksteknikk.',
            years: [
              { year: 2021, A: 0, B: 10, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 16, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.7, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 3, B: 14, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 3.8, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 7, B: 0, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.7, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: '6JB297', emnenavn: 'Bacheloroppgave i agronomi', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['6JB297-1'],
            years: [
              { year: 2021, A: 9, B: 4, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.95, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 8, B: 6, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 7, B: 4, C: 5, D: 6, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.55, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 4, B: 8, C: 12, D: 3, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.48, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 6, B: 0, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'inn_landbruksteknikk', shortName: 'INN Landbruksteknikk', institusjon: 'Universitetet i Innlandet', isNmbu: false, programnavn: 'Landbruksteknikk (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.inn.no/studier/vare-studier/bachelor-i-landbruksteknikk/', 'https://studiekatalog.edutorium.no/inn/nb/program/BALA/2026'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 180,
        merknad: 'Kilde er Universitetet i Innlandets studiekatalog for BALA Bachelor i landbruksteknikk, startsemester høst 2026, studiested Blæstad (studiekatalog.edutorium.no/inn/nb/program/BALA/2026). Programmet er 180 sp, og studiemodell-tabellen merker samtlige 18 emner med typekode «O» (Obligatorisk) – ingen valgfrie emner i studiemodellen, så hele graden er obligatorisk. Programmet deler et felles første studieår med bachelor i agronomi (også tilgjengelig som årsstudium i jordbruk), og flere emner i år 2–3 er felles med agronomiprogrammet (merket i den enkelte emnes merknad). Ingen egne valgfrie studieretninger er beskrevet.',
        obligatoriske: [
          {
            emnekode: 'LAN1101', emnenavn: 'Innføring i landbruk', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['LAN1101-1'], merknad: 'Felles emne med bachelor i agronomi.',
            years: [
              { year: 2021, A: 0, B: 3, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 6, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.2, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 5, D: 0, E: 3, F: 0, G: 0, H: 0, total: 8, snitt: 2.25, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'AGR1101', emnenavn: 'Naturgrunnlaget', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['AGR1101-1'], merknad: 'Felles emne med bachelor i agronomi.',
            years: [
              { year: 2021, A: 0, B: 3, C: 9, D: 3, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: '6JB295', emnenavn: 'Rapport og analyse', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['6JB295-1'], merknad: 'Felles emne med bachelor i agronomi.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 5, H: 0, total: 5, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 3, B: 5, C: 4, D: 0, E: 0, F: 0, G: 14, H: 0, total: 26, snitt: 3.92, strykprosent: 0, bestattprosent: 100, skjult: 4 },
            ],
          },
          {
            emnekode: 'AGR1102', emnenavn: 'Landbruk, miljø og samfunn', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['AGR1102-1'], merknad: 'Felles emne med bachelor i agronomi.',
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 5, E: 4, F: 0, G: 0, H: 0, total: 9, snitt: 1.56, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 6, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.25, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'AGR1103', emnenavn: 'Planter og produksjon', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['AGR1103-1'], merknad: 'Felles emne med bachelor i agronomi.',
            years: [
              { year: 2022, A: 0, B: 3, C: 4, D: 8, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.67, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 0, total: 14, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'LAN1102', emnenavn: 'Landbruksmaskiner', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['LAN1102-1'], merknad: 'Felles emne med bachelor i agronomi.',
            years: [
              { year: 2022, A: 0, B: 8, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 10, H: 0, total: 10, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 4 },
            ],
          },
          {
            emnekode: '6JB132', emnenavn: 'Fysikk', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['6JB132-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 3, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 2.86, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 3, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.43, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2025, A: 5, B: 3, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 11, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: '6JB201', emnenavn: 'Landbruksøkonomi og grønt entreprenørskap', studiepoeng: 15, aar: 2, semester: 'høst',
            dbhEmnekoder: ['6JB201-1'], merknad: 'Felles emne med bachelor i agronomi.',
            years: [
              { year: 2021, A: 4, B: 5, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 4, B: 7, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.71, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2024, A: 0, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 0, B: 5, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.25, strykprosent: 0, bestattprosent: null, skjult: 7 },
            ],
          },
          {
            emnekode: 'LAN2304', emnenavn: 'Utvikling og dimensjonering av landbruksmaskiner', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['LAN2304-1'],
            years: [
              { year: 2023, A: 0, B: 4, C: 4, D: 0, E: 0, F: 0, G: 9, H: 0, total: 17, snitt: 3.5, strykprosent: 0, bestattprosent: 100, skjult: 5 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 0, total: 14, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'AGR2202', emnenavn: 'Vitenskapelig metode og statistikk', studiepoeng: 15, aar: 2, semester: 'vår',
            dbhEmnekoder: ['AGR2202-1'], merknad: 'Felles emne med bachelor i agronomi.',
            years: [
              { year: 2023, A: 0, B: 0, C: 3, D: 6, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.33, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 3, total: 18, snitt: null, strykprosent: null, bestattprosent: 83.3, skjult: 0 },
            ],
          },
          {
            emnekode: 'LAN2202', emnenavn: 'Feltmekanisering 1 – våronn', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['LAN2202-1'], merknad: 'Felles emne med bachelor i agronomi.',
            years: [
              { year: 2023, A: 0, B: 5, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.17, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 3, D: 5, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 2.38, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 8, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.73, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'LAN2203', emnenavn: 'Traktorer og basismaskiner', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['LAN2203-1'],
            years: [
              { year: 2023, A: 0, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 4, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 5, B: 9, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'LAN2301', emnenavn: 'Feltmekanisering 2 – høstonn', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['LAN2301-1'], merknad: 'Felles emne med bachelor i agronomi.',
            years: [
              { year: 2023, A: 0, B: 4, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.08, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 4, B: 5, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'LAN2201', emnenavn: 'Behandling og lagring av planteprodukter', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['LAN2201-1'],
            years: [
              { year: 2022, A: 5, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.14, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 11, H: 0, total: 11, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 0, total: 14, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'LAN2302', emnenavn: 'Presisjonsjordbruk', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['LAN2302-1'], merknad: 'Felles emne med bachelor i agronomi.',
            years: [
              { year: 2023, A: 3, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.3, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 5, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 4, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.31, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'LAN2303', emnenavn: 'Bygningsteknikk', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['LAN2303-1'],
            years: [
              { year: 2023, A: 0, B: 8, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 3, B: 3, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: '6JB242', emnenavn: 'Husdyrmiljø og innendørsmekanisering', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['6JB242-1'], merknad: 'Felles emne med bachelor i agronomi.',
            years: [
              { year: 2021, A: 3, B: 6, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 9, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 4, B: 0, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: '6JB299', emnenavn: 'Bacheloroppgave i landbruksteknikk', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: ['6JB299-1'],
            years: [
              { year: 2021, A: 0, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 4, B: 4, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.86, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 4, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.08, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 5, B: 3, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.18, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 8 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'akvakultur', label: 'Akvakultur', level: 'bachelor',
    programs: [
      {
        entryId: 'nmbu_akvakultur', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Akvakultur (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/bachelor/akvakultur', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-07/B-AKVA%202026%20Studieplan.pdf'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 110,
        merknad: 'Kilde er NMBUs studieplan-PDF for Bachelor i akvakultur (B-AKVA), opptak 2026, lenket fra «Studieplaner for studenter ved BIOVIT». Programmet er 180 sp, hvorav 130 sp er obligatoriske og 50 sp valgfrie (3. studieår er i hovedsak tilrettelagt for valgfrie emner, internship eller utveksling). De 14 emnene i obligatoriske-listen over (110 sp) er uten valgalternativ. Tre obligatoriske krav er valg mellom alternativer og er derfor IKKE ført i listen, i tråd med oppgavens regel: (1) AQB250 Bærekraftig akvakultur – avl og genetikk / BIO200 Molekylærgenetikk – «velg minst ett av disse emnene» (minimum 5 sp, høst år 3 / januarblokk år 2); (2) PHI100/PHI101 Ex.phil (evt. seminarversjon) / PHI102 Ex.phil engelsk versjon – «velg minst ett av Ex.Phil-emnene» (10 sp, høst år 1, kan byttes til vår); (3) BUS100 Grunnleggende bedriftsøkonomi / INN200 Økonomistyring – «velg kun ett av disse emnene» (5 sp, vår/høst år 2). 110 (listen) + 5 (AQB250/BIO200) + 10 (Ex.Phil) + 5 (BUS100/INN200) = 130 sp, i tråd med studieplanens egen sum. Studieplanen definerer ingen egne obligatoriske studieretninger/spesialiseringer med separate emnelister – de valgfrie emnene er i stedet gruppert i fem ikke-obligatoriske fordypningspooler (generelle, genombiologi/avl, produksjonsteknikk/RAS, produktkvalitet/fôr/ernæring), samt en valgfri bacheloroppgave B-AA (15 sp, høst/vår) som ikke er obligatorisk og derfor ikke ført i listen.',
        obligatoriske: [
          {
            emnekode: 'AQX100', emnenavn: 'Intro til norsk akvakulturproduksjon', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['AQX100-1'], merknad: 'Augustblokk før høstsemesteret.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 0, total: 15, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'AQX110', emnenavn: 'Akvalabb', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['AQX110-1'],
            years: [
              { year: 2021, A: 18, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4.64, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO100', emnenavn: 'Cellebiologi', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO100-1'],
            years: [
              { year: 2021, A: 0, B: 9, C: 7, D: 6, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.14, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 0, B: 5, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 4, C: 7, D: 0, E: 0, F: 7, G: 0, H: 0, total: 18, snitt: 2.06, strykprosent: 38.9, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 10, C: 9, D: 0, E: 0, F: 3, G: 0, H: 0, total: 22, snitt: 3.05, strykprosent: 13.6, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 4, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.08, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'HFX133', emnenavn: 'Utfordringer for framtidas matproduksjon', studiepoeng: 5, aar: 1, semester: 'januarblokk',
            dbhEmnekoder: ['HFX133-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 4, total: 24, snitt: null, strykprosent: null, bestattprosent: 83.3, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 7, D: 7, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 7, D: 6, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 2.54, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'AQX120', emnenavn: 'Intensiv akvakultur', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['AQX120-1'],
            years: [
              { year: 2022, A: 6, B: 8, C: 13, D: 0, E: 3, F: 0, G: 0, H: 0, total: 30, snitt: 3.47, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 3, B: 6, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 5, B: 3, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.87, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'KJM100', emnenavn: 'Generell kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJM100-1'],
            years: [
              { year: 2022, A: 0, B: 4, C: 4, D: 0, E: 7, F: 0, G: 0, H: 0, total: 15, snitt: 2.33, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 7, D: 5, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 2.58, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 4, C: 3, D: 4, E: 3, F: 0, G: 0, H: 0, total: 14, snitt: 2.57, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 3, B: 4, C: 0, D: 4, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.55, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'BIO120', emnenavn: 'Genetikk, introduksjonskurs', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO120-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 6, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.38, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 11, B: 10, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.21, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 9, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.69, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'KJB100', emnenavn: 'Introduksjon til biokjemi', studiepoeng: 5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['KJB100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 2.57, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 8, D: 5, E: 0, F: 7, G: 0, H: 0, total: 20, snitt: 1.7, strykprosent: 35, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 5, D: 5, E: 0, F: 5, G: 0, H: 0, total: 15, snitt: 1.67, strykprosent: 33.3, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 10, D: 3, E: 0, F: 4, G: 0, H: 0, total: 17, snitt: 2.12, strykprosent: 23.5, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 3, B: 0, C: 4, D: 9, E: 0, F: 3, G: 0, H: 0, total: 19, snitt: 2.37, strykprosent: 15.8, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'STIN100', emnenavn: 'Biologisk dataanalyse', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['STIN100-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 10, H: 0, total: 10, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 4, total: 21, snitt: null, strykprosent: null, bestattprosent: 81, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'AQX201', emnenavn: 'Fiskehelsebiologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['AQX201-1'],
            years: [
              { year: 2022, A: 7, B: 11, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.96, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 5, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.42, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 4, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 4, B: 5, C: 5, D: 0, E: 3, F: 0, G: 0, H: 0, total: 17, snitt: 3.41, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'SDG200', emnenavn: 'Bærekraftige matproduksjonssystemer', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['SDG200-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 3, snitt: 1, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 4, B: 7, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.79, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 6, B: 3, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'HFE200', emnenavn: 'Generell ernæring', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['HFE200-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 3, G: 0, H: 0, total: 3, snitt: 0, strykprosent: 100, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 0, C: 6, D: 6, E: 3, F: 5, G: 0, H: 0, total: 20, snitt: 1.65, strykprosent: 25, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 9, D: 0, E: 4, F: 0, G: 0, H: 0, total: 13, snitt: 2.38, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'STAT100', emnenavn: 'Statistikk', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['STAT100-1'], merknad: 'Studieplanen oppgir semester «Høst/Vår»; plassert i år 2 vår i studieplanens eget rutenett.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 4, C: 0, D: 3, E: 3, F: 4, G: 0, H: 0, total: 14, snitt: 1.79, strykprosent: 28.6, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 6, D: 3, E: 3, F: 3, G: 0, H: 0, total: 15, snitt: 1.8, strykprosent: 20, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 4, C: 0, D: 7, E: 0, F: 4, G: 0, H: 0, total: 15, snitt: 2, strykprosent: 26.7, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 3, C: 0, D: 0, E: 5, F: 10, G: 0, H: 0, total: 18, snitt: 0.94, strykprosent: 55.6, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'AQP255', emnenavn: 'Akvatisk miljø i akvakultur', studiepoeng: 5, aar: 3, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'nord_havbruksdrift', shortName: 'Nord', institusjon: 'Nord universitet', isNmbu: false, programnavn: 'Havbruksdrift og ledelse (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.nord.no/studier/havbruksdrift-og-ledelse-bachelor', 'https://www.nord.no/studier/studieplaner/havbruksdrift-og-ledelse-bahbl-bachelor-host-2026'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 172.5,
        merknad: 'Kilde er Nord universitets studieplanside for Havbruksdrift og ledelse (BAHBL), kull høst 2026, studiested Bodø (www.nord.no/studier/studieplaner/havbruksdrift-og-ledelse-bahbl-bachelor-host-2026). Programmet er 180 sp. De 19 emnene i obligatoriske-listen (172,5 sp) er faste for alle studenter, inkludert HAV2019 Bacheloroppgave i havbruksdrift og ledelse (15 sp, 6. semester), som IKKE står under overskriften «Valgfrie emner» og derfor regnes som obligatorisk. I 6. semester fyller ett valgfritt emne (7,5 sp) resten av semesterets 30 sp: enten MAT1014 Matematikk og statistikk eller HAV2020 Kvalitetsledelse i havbruk (obligatorisk valg mellom alternativer, ikke ført i listen). 172,5 + 7,5 = 180 sp. Ingen egne obligatoriske studieretninger/spesialiseringer er beskrevet.',
        obligatoriske: [
          {
            emnekode: 'KJE1001', emnenavn: 'Laboratoriesikkerhet', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJE1001-1'],
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 57, H: 0, total: 57, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 74, H: 0, total: 74, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'ECO1002', emnenavn: 'Bedriftsøkonomisk analyse med programvare', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ECO1002-1'],
            years: [
              { year: 2021, A: 0, B: 22, C: 14, D: 3, E: 0, F: 5, G: 0, H: 0, total: 44, snitt: 3.09, strykprosent: 11.4, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 22, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.65, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 0, B: 7, C: 24, D: 0, E: 0, F: 20, G: 0, H: 0, total: 51, snitt: 1.96, strykprosent: 39.2, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 15, B: 45, C: 23, D: 8, E: 0, F: 27, G: 0, H: 0, total: 118, snitt: 2.88, strykprosent: 22.9, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 32, C: 21, D: 0, E: 0, F: 40, G: 0, H: 0, total: 93, snitt: 2.05, strykprosent: 43, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'MET1005', emnenavn: 'Akademisk skriving og metode', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MET1005-1'],
            years: [
              { year: 2024, A: 8, B: 12, C: 16, D: 11, E: 0, F: 0, G: 0, H: 0, total: 47, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 13, B: 17, C: 21, D: 13, E: 7, F: 3, G: 0, H: 0, total: 74, snitt: 3.09, strykprosent: 4.1, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'HAV1002', emnenavn: 'Fiskebiologi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HAV1002-1'],
            years: [
              { year: 2024, A: 5, B: 14, C: 12, D: 12, E: 3, F: 6, G: 0, H: 0, total: 52, snitt: 2.77, strykprosent: 11.5, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 12, B: 11, C: 12, D: 10, E: 10, F: 11, G: 0, H: 0, total: 66, snitt: 2.58, strykprosent: 16.7, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'KJE1000', emnenavn: 'Grunnleggende kjemi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJE1000-1'],
            years: [
              { year: 2024, A: 0, B: 3, C: 4, D: 12, E: 14, F: 17, G: 0, H: 0, total: 50, snitt: 1.24, strykprosent: 34, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 4, B: 7, C: 11, D: 10, E: 7, F: 37, G: 0, H: 0, total: 76, snitt: 1.42, strykprosent: 48.7, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'HAV2012', emnenavn: 'Produksjon av laksefisk', studiepoeng: 15, aar: 1, semester: 'vår',
            dbhEmnekoder: ['HAV2012-1'],
            years: [
              { year: 2025, A: 0, B: 5, C: 25, D: 17, E: 3, F: 3, G: 0, H: 0, total: 53, snitt: 2.49, strykprosent: 5.7, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'FIN1001', emnenavn: 'Innføring i regnskap', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['FIN1001-1'],
            years: [
              { year: 2025, A: 0, B: 5, C: 8, D: 3, E: 5, F: 27, G: 0, H: 0, total: 48, snitt: 1.15, strykprosent: 56.2, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'BIO1009', emnenavn: 'Cellebiologi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO1009-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 10, D: 12, E: 10, F: 27, G: 0, H: 0, total: 59, snitt: 1.08, strykprosent: 45.8, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'HAV2015', emnenavn: 'Fiskeernæring og produktkvalitet', studiepoeng: 15, aar: 2, semester: 'høst',
            dbhEmnekoder: ['HAV2015-1'],
            years: [
              { year: 2025, A: 0, B: 4, C: 20, D: 8, E: 4, F: 8, G: 0, H: 0, total: 44, snitt: 2.18, strykprosent: 18.2, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'HAV2014', emnenavn: 'Fiskehelse', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['HAV2014-1'],
            years: [
              { year: 2025, A: 6, B: 18, C: 9, D: 6, E: 4, F: 0, G: 0, H: 0, total: 43, snitt: 3.37, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'HAV2013', emnenavn: 'Marine arter i oppdrett', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['HAV2013-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 10, D: 13, E: 6, F: 12, G: 0, H: 0, total: 41, snitt: 1.51, strykprosent: 29.3, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'HAV2017', emnenavn: 'Praksis i havbruksdrift og ledelse', studiepoeng: 22.5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'HAV2016', emnenavn: 'Fiskevelferd', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'LED2006', emnenavn: 'Ledelse', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'HAV2021', emnenavn: 'Havbruksøkonomi', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'HAV2018', emnenavn: 'Havbruksforvaltning', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'RET1005', emnenavn: 'Arbeidsrett', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'HAV2011', emnenavn: 'Praksisseminar', studiepoeng: 0, aar: 3, semester: 'høst',
            dbhEmnekoder: ['HAV2011-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 44, H: 0, total: 44, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 41, H: 0, total: 41, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 103, H: 0, total: 103, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO1008', emnenavn: 'Bærekraft, klima og etikk', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'HAV2019', emnenavn: 'Bacheloroppgave i havbruksdrift og ledelse', studiepoeng: 15, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_biomarin', shortName: 'NTNU Biomarin innovasjon', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Biomarin innovasjon (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.ntnu.no/studier/298bmi', 'https://www.ntnu.no/studier/298bmi/studiets-oppbygning', 'https://www.ntnu.no/studier/studieplan#programmeCode=298BMI&year=2026'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 127.5,
        merknad: 'Kilde er NTNUs studieplan-API for programkode 298BMI (Biomarin innovasjon, bachelor, studiested Ålesund), år 2026, hentet direkte fra det underliggende JSON-endepunktet bak www.ntnu.no/studier/studieplan#programmeCode=298BMI&year=2026 (se metode-merknad i ntnu_biologi.json). Programmet er 180 sp over 6 semester. Kildedataene for kursgruppen (298BMI-2026-OBL/VALG) har feltet «Det vil bli endringer i 2. og 3. året - oppdateres våren 2027», dvs. planen for 2. og 3. studieår for kull 2026 er markert som foreløpig/ikke ferdig oppdatert i NTNUs system. De 18 emnene i obligatoriske-listen (127,5 sp) er de med studyChoice-kode «O» (fast obligatorisk, uten valgalternativ) i periode 1–5. Følgende obligatoriske krav er valg mellom alternativer og er derfor IKKE ført i listen, i tråd med oppgavens regel: (1) periode 1: AM101020 Praktisk økonomi med regning / AR100919 Matematikk for økonomer – minst 1 emne fra gruppe A (7,5 sp); (2) periode 5: BIA3004 Akvakultur forskningstemaer / BTA2001 Ernæring – minst 1 emne fra gruppe C (7,5 sp); (3) periode 6: AI301212 Fra ide til bedrift / BIA3002 Bacheloroppgave – minst 1 emne fra gruppe A (15 sp). Bacheloroppgaven er dermed valgfri (ett av to alternativ i 6. semester), ikke entydig obligatorisk, i denne studieplanversjonen. Periode 4 og 6 har i tillegg egne pooler av fritt valgfrie emner (kode «V»: AL101816, AR100219, BIA2003 i periode 4; AH301408, BIA3001, AL302030 i periode 6) som ikke er obligatoriske. Programmet har ingen egne, navngitte studieretninger i studieplandataene for dette kullet.',
        obligatoriske: [
          {
            emnekode: 'HMS0001', emnenavn: 'HMS-kurs for 1. årsstudenter', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0001-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 41, H: 0, total: 41, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 33, H: 0, total: 33, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 43, H: 0, total: 43, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'MB102019', emnenavn: 'Biomarin verdiskaping', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MB102019-1'],
            years: [
              { year: 2021, A: 12, B: 19, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 4.13, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 15, B: 11, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 4.28, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 12, B: 15, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 4.26, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 14, B: 25, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 44, snitt: 4.2, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 11, B: 17, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 3.95, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BI2081', emnenavn: 'Natur, miljø og bærekraft', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BI2081-1'],
            years: [
              { year: 2021, A: 0, B: 10, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.48, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 12, C: 13, D: 4, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.28, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 7, C: 9, D: 8, E: 5, F: 0, G: 0, H: 0, total: 29, snitt: 2.62, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 11, D: 7, E: 3, F: 0, G: 0, H: 0, total: 21, snitt: 2.38, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 10, C: 8, D: 6, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.17, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'HBIOA1013', emnenavn: 'Introduksjon til Kjemi', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BBL1002', emnenavn: 'Generell mikrobiologi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MB104314', emnenavn: 'Marin biologi', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MB104314-1'],
            years: [
              { year: 2021, A: 0, B: 7, C: 15, D: 8, E: 5, F: 0, G: 0, H: 0, total: 35, snitt: 2.69, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 22, D: 14, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 2.61, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 3, B: 4, C: 5, D: 12, E: 9, F: 4, G: 0, H: 0, total: 37, snitt: 2.14, strykprosent: 10.8, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 8, C: 11, D: 5, E: 5, F: 0, G: 0, H: 0, total: 29, snitt: 2.76, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 11, C: 10, D: 12, E: 7, F: 0, G: 0, H: 0, total: 40, snitt: 2.62, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'AI101500', emnenavn: 'Designdrevet innovasjon', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['AI101500-1'],
            years: [
              { year: 2024, A: 9, B: 17, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 4.13, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 15, B: 21, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 4.24, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'IBA1001', emnenavn: 'Vitenskapelig metode', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'AE101124', emnenavn: 'Økonomisk styring I', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['AE101124-1'],
            years: [
              { year: 2025, A: 0, B: 11, C: 7, D: 10, E: 0, F: 3, G: 0, H: 0, total: 31, snitt: 2.74, strykprosent: 9.7, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BIA2001', emnenavn: 'Marin økologi', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIA2001-1'],
            years: [
              { year: 2021, A: 0, B: 10, C: 12, D: 5, E: 4, F: 0, G: 0, H: 0, total: 31, snitt: 2.9, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 12, C: 10, D: 9, E: 3, F: 0, G: 0, H: 0, total: 34, snitt: 2.91, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 11, C: 9, D: 6, E: 3, F: 0, G: 0, H: 0, total: 29, snitt: 2.97, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 10, C: 9, D: 5, E: 3, F: 0, G: 0, H: 0, total: 27, snitt: 2.96, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 9, C: 16, D: 9, E: 4, F: 0, G: 0, H: 0, total: 38, snitt: 2.79, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'AI201312', emnenavn: 'Entreprenørskap og forretningsutvikling', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['AI201312-1'],
            years: [
              { year: 2021, A: 9, B: 11, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 7, B: 12, C: 8, D: 5, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.66, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 3, B: 35, C: 28, D: 0, E: 0, F: 0, G: 0, H: 0, total: 66, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 22, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.71, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 12, B: 21, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 38, snitt: 4.18, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'MN304012', emnenavn: 'Kvalitetssikring og sertifisering', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MN304012-1'],
            years: [
              { year: 2021, A: 3, B: 8, C: 6, D: 7, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.29, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 4, B: 8, C: 9, D: 4, E: 3, F: 0, G: 0, H: 0, total: 28, snitt: 3.21, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 8, C: 16, D: 4, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.14, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 6, B: 17, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.88, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 3, B: 12, C: 12, D: 3, E: 4, F: 0, G: 0, H: 0, total: 34, snitt: 3.21, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIA2002', emnenavn: 'Akvakultur', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BIA2002-1'],
            years: [
              { year: 2021, A: 12, B: 12, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 4.24, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 11, B: 15, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 4.23, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 9, B: 9, C: 11, D: 4, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.7, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 12, B: 9, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.91, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 6, C: 11, D: 6, E: 5, F: 0, G: 0, H: 0, total: 28, snitt: 2.64, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'BIA2004', emnenavn: 'Sjømatforedling', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BIA2004-1'],
            years: [
              { year: 2021, A: 0, B: 11, C: 7, D: 8, E: 4, F: 0, G: 0, H: 0, total: 30, snitt: 2.83, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 17, C: 5, D: 0, E: 3, F: 3, G: 0, H: 0, total: 31, snitt: 3.26, strykprosent: 9.7, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 13, C: 11, D: 7, E: 3, F: 0, G: 0, H: 0, total: 34, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 5, C: 9, D: 11, E: 4, F: 0, G: 0, H: 0, total: 29, snitt: 2.52, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 7, C: 17, D: 5, E: 3, F: 0, G: 0, H: 0, total: 32, snitt: 2.88, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'AI201400', emnenavn: 'Innovation and intrapreneurship', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['AI201400-1'],
            years: [
              { year: 2024, A: 0, B: 7, C: 14, D: 6, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.04, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 11, B: 14, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 4.24, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'EXPH0300', emnenavn: 'Examen philosophicum for naturvitenskap og teknologi', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['EXPH0300-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 14, D: 9, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 2.77, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 6, C: 19, D: 9, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 2.91, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 3, C: 13, D: 12, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 2.68, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 4, C: 11, D: 10, E: 0, F: 5, G: 0, H: 0, total: 30, snitt: 2.3, strykprosent: 16.7, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 3, C: 13, D: 12, E: 5, F: 6, G: 0, H: 0, total: 39, snitt: 2.05, strykprosent: 15.4, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIA3003', emnenavn: 'Innføring i vitenskapelig metode', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BIA3003-1'],
            years: [
              { year: 2021, A: 4, B: 18, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4.18, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 9, B: 17, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 4.35, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 12, B: 16, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4.43, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 3, B: 13, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.68, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 4, B: 12, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.63, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'AI303700', emnenavn: 'Tverrfaglig innovasjon', studiepoeng: 7.5, aar: 3, semester: 'høst',
            dbhEmnekoder: ['AI303700-1'],
            years: [
              { year: 2023, A: 15, B: 9, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 4.34, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 3, B: 18, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.86, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 7, B: 12, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.96, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_ing_havbruk', shortName: 'NTNU Ing. havbruk', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Ingeniør, havbruk (bachelor)',
        studieplanAar: '2026/2027', kilder: ['https://www.ntnu.no/studier/bihav', 'https://www.ntnu.no/studier/bihav/studiets-oppbygning', 'https://www.ntnu.no/studier/studieplan#programmeCode=BIHAV&year=2026'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 120,
        merknad: 'Kilde er NTNUs studieplan-API for programkode BIHAV (Ingeniør, havbruk, bachelor i ingeniørfag, Trondheim), år 2026, hentet direkte fra det underliggende JSON-endepunktet (se metode-merknad i ntnu_biologi.json). Programmet er 180 sp over 6 semester. De 17 emnene i obligatoriske-listen (120 sp) er de med studyChoice-kode «O» i periode 1, 2, 3, 4 og 6. Følgende krav er valg mellom alternativer og er derfor IKKE ført i listen, i tråd med oppgavens regel: (1) 4. semester: velg ett av BI1013 Celle- og molekylærbiologi/TMR4247 Marin teknikk 3/TPK4125 Mekatronikk/TVM4110 Vannmiljø og -kvalitet (7,5 sp) – valget kan være førende for hvilke emner som kan velges i 5. semester; (2) 6. semester: BMR3930/BI3102, begge med samme tittel «Bacheloroppgave, BIHAV havbruksingeniør» (22,5 sp) – studenten skal ta nøyaktig én av disse to instituttkodene avhengig av hvilket institutt bachelorveilederen er ansatt ved, så bacheloroppgaven er reelt obligatorisk (22,5 sp), men registrert under to alternative emnekoder. 5. semester (30 sp) består utelukkende av valgbare emner: minst ett emne med status M1C (MAST2003, TBT4102 eller TMR4167), maksimalt ett emne med status MAXMIN1A (TIØ4295, TPK4100, TIØ4120 eller TLOG2007), og resten fylles med valgbare emner (VA/VB-kode) innen biologi og/eller marin teknikk – ingen av disse er ført som obligatoriske. 120 (listen) + 7,5 (valg 4. semester) + 22,5 (bacheloroppgave 6. semester) + 30 (5. semester, fullt valgfritt) = 180 sp. Programmet har ingen egne, navngitte studieretninger i studieplandataene.',
        obligatoriske: [
          {
            emnekode: 'HMS0001', emnenavn: 'HMS-kurs for 1. årsstudenter', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HMS0001-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 0, total: 35, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 41, H: 0, total: 41, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'INGT1002', emnenavn: 'Programmering, numerikk og sikkerhet', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['INGT1002-1'],
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 12, total: 38, snitt: null, strykprosent: null, bestattprosent: 68.4, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 49, H: 8, total: 57, snitt: null, strykprosent: null, bestattprosent: 86, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 39, H: 3, total: 42, snitt: null, strykprosent: null, bestattprosent: 92.9, skjult: 0 },
            ],
          },
          {
            emnekode: 'MEKT1101', emnenavn: 'Mekanikk 1', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MEKT1101-1'],
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 5, E: 16, F: 9, G: 0, H: 0, total: 30, snitt: 0.87, strykprosent: 30, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 9, B: 5, C: 11, D: 10, E: 4, F: 12, G: 0, H: 0, total: 51, snitt: 2.39, strykprosent: 23.5, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 6, D: 8, E: 12, F: 19, G: 0, H: 0, total: 45, snitt: 1.02, strykprosent: 42.2, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'IMAT1002', emnenavn: 'Matematikk for ingeniørfag 1', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['IMAT1002-1'],
            years: [
              { year: 2023, A: 0, B: 6, C: 10, D: 11, E: 8, F: 0, G: 0, H: 0, total: 35, snitt: 2.4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 4, B: 3, C: 8, D: 8, E: 9, F: 7, G: 0, H: 0, total: 39, snitt: 2.08, strykprosent: 17.9, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 8, C: 8, D: 8, E: 12, F: 11, G: 0, H: 0, total: 47, snitt: 1.79, strykprosent: 23.4, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BI1011', emnenavn: 'Laksens biologi i oppdrett – settefiskproduksjon, håndtering og miljø', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BI1011-1'],
            years: [
              { year: 2023, A: 3, B: 27, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 3.83, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 8, B: 28, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 43, snitt: 4.02, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 5, B: 26, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.88, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'IMAT2022', emnenavn: 'Matematikk for ingeniørfag 2 B', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['IMAT2022-1'],
            years: [
              { year: 2024, A: 0, B: 10, C: 10, D: 10, E: 0, F: 8, G: 0, H: 0, total: 38, snitt: 2.37, strykprosent: 21.1, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 10, C: 12, D: 13, E: 0, F: 11, G: 0, H: 0, total: 46, snitt: 2.22, strykprosent: 23.9, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'TKT4123', emnenavn: 'Mekanikk 2', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BI1012', emnenavn: 'Laks – matfisk, interaksjon med merdmiljø og marin teknikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BI1012-1'],
            years: [
              { year: 2024, A: 3, B: 6, C: 20, D: 8, E: 0, F: 0, G: 0, H: 0, total: 37, snitt: 3.11, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 4, B: 15, C: 16, D: 3, E: 0, F: 4, G: 0, H: 0, total: 42, snitt: 3.19, strykprosent: 9.5, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'IFYT1000', emnenavn: 'Fysikk', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['IFYT1000-1'],
            years: [
              { year: 2024, A: 0, B: 5, C: 11, D: 8, E: 9, F: 0, G: 0, H: 0, total: 33, snitt: 2.36, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 6, B: 9, C: 8, D: 7, E: 6, F: 3, G: 0, H: 0, total: 39, snitt: 2.82, strykprosent: 7.7, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BMR3000', emnenavn: 'Havbruksteknologi, prosjektering og drift', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BMR3000-1'],
            years: [
              { year: 2022, A: 0, B: 5, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 4, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 5, B: 7, C: 20, D: 6, E: 0, F: 3, G: 0, H: 0, total: 41, snitt: 3.05, strykprosent: 7.3, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 8, C: 18, D: 8, E: 0, F: 3, G: 0, H: 0, total: 37, snitt: 2.76, strykprosent: 8.1, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'EXPH0600', emnenavn: 'Examen philosophicum for ingeniørfag', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'ISTT1001', emnenavn: 'Statistikk', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: ['ISTT1001-1'],
            years: [
              { year: 2021, A: 3, B: 7, C: 7, D: 5, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 11, C: 13, D: 4, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.42, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 4, C: 15, D: 3, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.05, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 7, B: 17, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 33, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 6, B: 18, C: 7, D: 7, E: 0, F: 3, G: 0, H: 0, total: 41, snitt: 3.34, strykprosent: 7.3, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'KJ1005', emnenavn: 'Generell kjemi', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BT3102', emnenavn: 'Grunnleggende om resirkulerende akvakultursystemer (RAS)', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BT3102-1'],
            years: [
              { year: 2022, A: 0, B: 23, C: 22, D: 0, E: 0, F: 0, G: 0, H: 0, total: 45, snitt: 3.51, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 7, B: 9, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 10, B: 12, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 36, snitt: 3.78, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'FENT2002', emnenavn: 'Fluidmekanikk og hydraulikk', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['FENT2002-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 5, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2024, A: 0, B: 5, C: 0, D: 0, E: 4, F: 0, G: 0, H: 0, total: 9, snitt: 2.67, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 6, C: 5, D: 13, E: 4, F: 11, G: 0, H: 0, total: 39, snitt: 1.77, strykprosent: 28.2, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'BI1009', emnenavn: 'Fiskehelse og velferd', studiepoeng: 7.5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BI1009-1'],
            years: [
              { year: 2022, A: 0, B: 14, C: 9, D: 8, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.19, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 10, C: 14, D: 3, E: 0, F: 0, G: 0, H: 0, total: 27, snitt: 3.26, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 7, C: 9, D: 5, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.1, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 6, B: 25, C: 27, D: 12, E: 4, F: 0, G: 0, H: 0, total: 74, snitt: 3.23, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'INGT2301', emnenavn: 'Ingeniørfaglig systemtenkning', studiepoeng: 7.5, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uit_fiskeri_havbruk', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Fiskeri- og havbruksvitenskap (master 5 år)',
        studieplanAar: '2025/2026', kilder: ['https://uit.no/go/target/268899/1B66060A685CD95EE0632F03F60AE5F6 (Fiskeri- og havbruksvitenskap - bachelor)', 'https://uit.no/Content/915965/cache=20262209145837/Studieplan%20for%20bachelor%20i%20fiskeri-%20og%20havbruksvitenskap%20fra%20kull%202025.pdf'],
        totaltStudiepoeng: 180, obligatoriskeStudiepoeng: 140,
        merknad: 'VIKTIG AVVIK FRA PROGRAMKARTET: programkart.json beskriver entryId uit_fiskeri_havbruk som «Fiskeri- og havbruksvitenskap (master 5 år)», studiekode 186331, med url .../269552/fiskeri-_og_havbruksvitenskap_-_master. Denne URL-en er død (viser tom side/omdirigerer til uit.no forside per 22.09.2026), og UiTs nåværende studiekatalog (uit.no/utdanning) lister IKKE noe integrert 5-årig masterprogram i fiskeri- og havbruksvitenskap – kun et frittstående 3-årig bachelorprogram (Fiskeri- og havbruksvitenskap, bachelor, 180 sp, Tromsø) etterfulgt av et separat 2-årig masterprogram («fiskerikandidat», opptak krever minimum C i snitt fra bacheloren). Studiekode 186331 ser ut til å tilhøre bachelorprogrammet (jf. tredjepartskilder som studievalg.no). Denne filen er derfor bygget på studieplanen for BACHELORPROGRAMMET (kull 2025, godkjent 19.9.2024, 180 sp, 6 semester), som er det som faktisk finnes og er søkbart under denne studiekoden – «master 5 år»-merkingen i programkartet bør vurderes oppdatert eller fjernet. Kilde: uit.no/Content/915965/.../Studieplan for bachelor i fiskeri- og havbruksvitenskap fra kull 2025.pdf. De 14 emnene i obligatoriske-listen (140 sp) er faste for alle studenter i 1., 2., 3. og 6. semester. 5. semester (30 sp) består utelukkende av valgpakker (anbefalt innen havbruk, forvaltning eller økonomi) eller utveksling, og er derfor ikke ført. I 6. semester velges i tillegg ett av tre 10 sp-emner (obligatorisk valg mellom alternativer, ikke ført i listen): FSK-2043 Strategi og markedsføring for sjømatnæringen / BIO-2002 Dyrefysiologi / GIS. 140 (listen) + 30 (5. semester) + 10 (valg 6. semester) = 180 sp. Programmet har ingen egne, navngitte studieretninger med separate obligatoriske emnelister; kandidater som fullfører kvalifiserer til opptak på masterprogrammet i fiskeri- og havbruksvitenskap ved UiT.',
        obligatoriske: [
          {
            emnekode: 'FSK-1100', emnenavn: 'Introduksjon til fiskeri- og havbruksvitenskap', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['FSK-1100-1'],
            years: [
              { year: 2021, A: 4, B: 16, C: 23, D: 12, E: 0, F: 0, G: 0, H: 0, total: 55, snitt: 3.22, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 4, B: 7, C: 23, D: 14, E: 9, F: 0, G: 0, H: 0, total: 57, snitt: 2.7, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 7, B: 3, C: 14, D: 16, E: 6, F: 4, G: 0, H: 0, total: 50, snitt: 2.54, strykprosent: 8, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 5, B: 15, C: 14, D: 13, E: 0, F: 0, G: 0, H: 0, total: 47, snitt: 3.26, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 14, C: 22, D: 11, E: 5, F: 0, G: 0, H: 0, total: 52, snitt: 2.87, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'KJE-1001', emnenavn: 'Introduksjon til kjemi og kjemisk biologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJE-1001-1'],
            years: [
              { year: 2023, A: 0, B: 7, C: 7, D: 14, E: 12, F: 6, G: 0, H: 0, total: 46, snitt: 1.93, strykprosent: 13, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 9, D: 9, E: 11, F: 15, G: 0, H: 0, total: 44, snitt: 1.27, strykprosent: 34.1, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 0, C: 9, D: 14, E: 18, F: 23, G: 0, H: 0, total: 64, snitt: 1.14, strykprosent: 35.9, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BED-1007', emnenavn: 'Matematikk for økonomer', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'FSK-1020', emnenavn: 'Bærekraft og etikk', studiepoeng: 2.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['FSK-1020-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 53, H: 0, total: 53, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO-1501', emnenavn: 'Akvatisk økologi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'FSK-1122', emnenavn: 'Biokjemi og mikrobiologi for FHV', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['FSK-1122-1'],
            years: [
              { year: 2021, A: 4, B: 10, C: 24, D: 5, E: 0, F: 0, G: 0, H: 0, total: 43, snitt: 3.3, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 5, C: 23, D: 20, E: 3, F: 0, G: 0, H: 0, total: 51, snitt: 2.59, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 7, C: 15, D: 15, E: 10, F: 4, G: 0, H: 0, total: 51, snitt: 2.22, strykprosent: 7.8, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 17, C: 19, D: 4, E: 0, F: 0, G: 0, H: 0, total: 40, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 0, B: 6, C: 16, D: 15, E: 6, F: 0, G: 0, H: 0, total: 43, snitt: 2.51, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'FSK-1121', emnenavn: 'Statistikk og metode for FHV', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['FSK-1121-1'],
            years: [
              { year: 2021, A: 3, B: 14, C: 21, D: 3, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.41, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 21, B: 16, C: 8, D: 4, E: 3, F: 0, G: 0, H: 0, total: 52, snitt: 3.92, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 9, B: 13, C: 12, D: 7, E: 4, F: 7, G: 0, H: 0, total: 52, snitt: 2.9, strykprosent: 13.5, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 6, B: 17, C: 11, D: 7, E: 6, F: 0, G: 0, H: 0, total: 47, snitt: 3.21, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 3, B: 15, C: 17, D: 4, E: 3, F: 0, G: 0, H: 0, total: 42, snitt: 3.26, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'FSK-1123', emnenavn: 'Økonomi for FHV', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['FSK-1123-1'],
            years: [
              { year: 2021, A: 3, B: 7, C: 20, D: 10, E: 0, F: 3, G: 0, H: 0, total: 43, snitt: 2.86, strykprosent: 7, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 31, B: 19, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 53, snitt: 4.47, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 6, B: 5, C: 14, D: 9, E: 6, F: 10, G: 0, H: 0, total: 50, snitt: 2.32, strykprosent: 20, bestattprosent: null, skjult: 9 },
              { year: 2024, A: 7, B: 6, C: 13, D: 11, E: 8, F: 0, G: 0, H: 0, total: 45, snitt: 2.84, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 6, B: 10, C: 17, D: 8, E: 3, F: 0, G: 0, H: 0, total: 44, snitt: 3.18, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO-2406', emnenavn: 'Introduction to Fish Biology', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO-2407', emnenavn: 'Introduction to Aquaculture', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'FSK-2408', emnenavn: 'Havbruksforvaltning', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'FSK-2409', emnenavn: 'Bedriftsøkonomi for FHV', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'FSK-2020', emnenavn: 'Bærekraftig fiskeri', studiepoeng: 30, aar: 2, semester: 'vår',
            dbhEmnekoder: ['FSK-2020-1'], merknad: 'Ett samlet 30 sp-emne internt sammensatt av fire delemner à 7,5 sp: fiskeribiologi, ressursøkonomi, forvaltning og redskapsteknologi.',
            years: [
              { year: 2021, A: 0, B: 11, C: 14, D: 10, E: 0, F: 0, G: 0, H: 0, total: 35, snitt: 3.03, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 12, C: 27, D: 9, E: 0, F: 4, G: 0, H: 0, total: 52, snitt: 2.83, strykprosent: 7.7, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 17, C: 21, D: 13, E: 0, F: 0, G: 0, H: 0, total: 51, snitt: 3.08, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 14, C: 13, D: 6, E: 0, F: 11, G: 0, H: 0, total: 44, snitt: 2.43, strykprosent: 25, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 6, C: 26, D: 9, E: 4, F: 3, G: 0, H: 0, total: 48, snitt: 2.58, strykprosent: 6.2, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'FSK-2041', emnenavn: 'Sjømatproduksjon', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['FSK-2041-1'],
            years: [
              { year: 2024, A: 5, B: 15, C: 18, D: 7, E: 5, F: 0, G: 0, H: 0, total: 50, snitt: 3.16, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 9, C: 14, D: 12, E: 6, F: 0, G: 0, H: 0, total: 41, snitt: 2.63, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'FSK-2042', emnenavn: 'Praksis for en bærekraftig sjømatnæring', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['FSK-2042-1'], merknad: 'Obligatorisk praksisemne, tre ukers praksisopphold fordelt utover semesteret.',
            years: [
              { year: 2024, A: 6, B: 16, C: 26, D: 0, E: 0, F: 0, G: 0, H: 0, total: 48, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 12, C: 22, D: 5, E: 0, F: 0, G: 0, H: 0, total: 39, snitt: 3.18, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uib_havbruk', shortName: 'UiB Havbruk', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Havbruk, sivilingeniør (master 5 år)',
        studieplanAar: '2026/2027', kilder: ['https://www4.uib.no/studier/program/havbruk-integrert-masterprogram-sivilingenior', 'https://www4.uib.no/studier/program/havbruk-integrert-masterprogram-sivilingenior/plan'],
        totaltStudiepoeng: 300, obligatoriskeStudiepoeng: 250,
        merknad: 'Kilde er UiBs studieplanside for MAMN-HAVSJ Integrert masterprogram i havbruk (sivilingeniør), høst 2026 (www4.uib.no/studier/program/havbruk-integrert-masterprogram-sivilingenior/plan). Programmet er et 5-årig (10 semester) integrert sivilingeniørprogram på 300 sp totalt: emnedel 240 sp + individuell masteroppgave 60 sp (HAVB399). De 21 emnene/oppføringene i obligatoriske-listen over (250 sp) er uten valgalternativ (bortsett fra selve masteroppgavens fleksible 60/30+30-fordeling, som er notert i egen merknad på HAVB399). To obligatoriske krav er valg mellom alternativer og derfor IKKE ført i listen, i tråd med oppgavens regel: MAT101/MAT111 (10 sp, 1. semester) og MAT102/MAT112 (10 sp, 2. semester), begge valgt etter matematikkbakgrunn. 5. semester (30 sp, høst år 3) består utelukkende av «Frie studiepoeng»/utveksling og er derfor ikke ført. 250 (listen) + 20 (matematikkvalgene) + 30 (5. semester, fritt) = 300 sp. Studieplanens krav til progresjon fastslår at alle emner til og med 6. semester (inkl. valgfrie) må være bestått før oppstart av masteroppgaven. Programmet har ingen egne navngitte studieretninger med separate obligatoriske emnelister ut over selve hovedstudieplanen.',
        obligatoriske: [
          {
            emnekode: 'BIO100', emnenavn: 'Biologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO100-0'],
            years: [
              { year: 2021, A: 0, B: 5, C: 6, D: 4, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.07, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 7, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 6, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 3, B: 7, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.87, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 3, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.21, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIF100', emnenavn: 'Grunnkurs i bioinformatikk', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIF100-0'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
            ],
          },
          {
            emnekode: 'INF100', emnenavn: 'Programmering I', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['INF100-0'],
            years: [
              { year: 2021, A: 0, B: 4, C: 7, D: 9, E: 8, F: 0, G: 0, H: 0, total: 28, snitt: 2.25, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2022, A: 0, B: 0, C: 0, D: 12, E: 3, F: 0, G: 0, H: 0, total: 15, snitt: 1.8, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 3, B: 5, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 0, D: 7, E: 4, F: 0, G: 0, H: 0, total: 11, snitt: 1.64, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2025, A: 0, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'BIF101', emnenavn: 'Molekylærbiologisk bioinformatikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIF101-0'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 17, H: 0, total: 17, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 4, D: 7, E: 3, F: 0, G: 0, H: 0, total: 14, snitt: 2.07, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 9, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 4, B: 6, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.82, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 8, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'BIO280', emnenavn: 'Havbruksbiologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO280-0'],
            years: [
              { year: 2021, A: 5, B: 6, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 6, B: 0, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.33, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 6, B: 6, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.79, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 7, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.24, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 7, B: 8, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.22, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'PHYS101', emnenavn: 'Fysikk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['PHYS101-0'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 3, G: 0, H: 0, total: 3, snitt: 0, strykprosent: 100, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 4, B: 5, C: 5, D: 4, E: 0, F: 7, G: 0, H: 0, total: 25, snitt: 2.52, strykprosent: 28, bestattprosent: null, skjult: 8 },
              { year: 2023, A: 0, B: 3, C: 5, D: 3, E: 0, F: 4, G: 0, H: 0, total: 15, snitt: 2.2, strykprosent: 26.7, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 8, C: 10, D: 5, E: 4, F: 0, G: 0, H: 0, total: 27, snitt: 2.81, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 0, B: 0, C: 9, D: 3, E: 4, F: 0, G: 0, H: 0, total: 16, snitt: 2.31, strykprosent: 0, bestattprosent: null, skjult: 8 },
            ],
          },
          {
            emnekode: 'BIO291', emnenavn: 'Fiskefysiologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO291-0'],
            years: [
              { year: 2021, A: 4, B: 3, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.65, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 3, B: 0, C: 3, D: 5, E: 0, F: 4, G: 0, H: 0, total: 15, snitt: 2.27, strykprosent: 26.7, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 8, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.31, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 3, B: 7, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 13, snitt: 3.54, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 3, B: 6, C: 0, D: 8, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.24, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'BIF200', emnenavn: 'Statistikk for bioinformatikk', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BIF200-0'],
            years: [
              { year: 2021, A: 4, B: 4, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.8, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 4, B: 0, C: 4, D: 6, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.14, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 3, C: 0, D: 6, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.67, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 5, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 9, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'EXPHIL', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Emnekoden er oppgitt som «EXPHIL» uten variantsuffiks i studieplanens rutenett (jf. UiBs vanlige varianter EXPHIL-MNSEM/EXPHIL-MNEKS).',
            years: [],
          },
          {
            emnekode: 'KJEM109', emnenavn: 'Kjemi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['KJEM109-0'],
            years: [
              { year: 2023, A: 0, B: 3, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.3, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 3, B: 0, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.17, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2025, A: 0, B: 6, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIO205', emnenavn: 'Fiskesykdommer', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BIO205-0'],
            years: [
              { year: 2021, A: 6, B: 10, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 9, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 14, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 3, B: 9, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 3, B: 15, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.17, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO208', emnenavn: 'Akvakultur', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BIO208-0'],
            years: [
              { year: 2021, A: 7, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.44, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 10, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.77, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 5, B: 8, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.12, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 3, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.27, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 9, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'STAT110', emnenavn: 'Statistikk I', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['STAT110-0'],
            years: [
              { year: 2021, A: 0, B: 3, C: 9, D: 3, E: 3, F: 5, G: 0, H: 0, total: 23, snitt: 2.09, strykprosent: 21.7, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 0, C: 4, D: 4, E: 0, F: 7, G: 0, H: 0, total: 15, snitt: 1.33, strykprosent: 46.7, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 0, C: 6, D: 3, E: 3, F: 3, G: 0, H: 0, total: 15, snitt: 1.8, strykprosent: 20, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 3, E: 4, F: 6, G: 0, H: 0, total: 13, snitt: 0.77, strykprosent: 46.2, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 0, C: 6, D: 10, E: 5, F: 0, G: 0, H: 0, total: 21, snitt: 2.05, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'INNOV201', emnenavn: 'Innovasjon', studiepoeng: 10, aar: 4, semester: 'høst',
            dbhEmnekoder: ['INNOV201-0'],
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO300', emnenavn: 'Populasjonsgenetikk', studiepoeng: 10, aar: 4, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Oppgitt i studieplanens rutenett som «(BIO300 A+B)», dvs. sammensatt av to deler.',
            years: [],
          },
          {
            emnekode: 'BIO213', emnenavn: 'Akvakultur - avl og genetikk', studiepoeng: 10, aar: 4, semester: 'høst',
            dbhEmnekoder: ['BIO213-0'],
            years: [
              { year: 2021, A: 0, B: 3, C: 4, D: 6, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 2.77, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 5, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.08, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 0, B: 4, C: 8, D: 3, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.07, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'LAS301', emnenavn: 'Laboratoriedyrkunnskap, del 1', studiepoeng: 5, aar: 4, semester: 'vår',
            dbhEmnekoder: ['LAS301-0'], merknad: 'Oppgitt sammen med LAS303 som «LAS301 og LAS303 (10 sp)» i studieplanens rutenett; studiepoeng er fordelt likt (5+5) mellom de to i mangel av annen fordeling i kilden.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 9, H: 0, total: 9, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 18, H: 0, total: 18, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'LAS303', emnenavn: 'Laboratoriedyrkunnskap, del 2', studiepoeng: 5, aar: 4, semester: 'vår',
            dbhEmnekoder: ['LAS303-0'], merknad: 'Se merknad på LAS301.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 0, total: 14, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 0, total: 15, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO207', emnenavn: 'Fiskeernæring', studiepoeng: 10, aar: 4, semester: 'vår',
            dbhEmnekoder: ['BIO207-0'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 3, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4.38, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 3, B: 5, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.92, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 4, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.57, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 5, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4.62, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO382', emnenavn: 'Avlsforskning i akvakultur', studiepoeng: 10, aar: 4, semester: 'vår',
            dbhEmnekoder: ['BIO382-0'],
            years: [
              { year: 2021, A: 0, B: 12, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 7, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.24, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 3, B: 0, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 6, C: 14, D: 4, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 3.08, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 8, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.42, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'HAVB399', emnenavn: 'Masteroppgave i havbruk', studiepoeng: 60, aar: 5, semester: 'helår',
            dbhEmnekoder: [], merknad: 'Masteroppgave (fortrinnsvis 60 sp, men 30 sp oppgave + 30 sp kurs er også mulig), gjennomføres over 9. og 10. semester (5. år).',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uib_fiskehelse', shortName: 'UiB Fiskehelse', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Fiskehelse – akvamedisin (master 5 år)',
        studieplanAar: '2026/2027', kilder: ['https://www4.uib.no/studier/program/fiskehelse-akvamedisin-profesjon', 'https://www4.uib.no/studier/program/fiskehelse-akvamedisin-profesjon/plan'],
        totaltStudiepoeng: 300, obligatoriskeStudiepoeng: 290,
        merknad: 'Kilde er UiBs studieplanside for Profesjonsstudium i fiskehelse - akvamedisin, høst 2026 (www4.uib.no/studier/program/fiskehelse-akvamedisin-profesjon/plan). Programmet er et integrert 5-årig profesjonsstudium (10 semester) på 300 sp totalt: emnedel 240 sp + masteroppgave 60 sp (FISK399). Fullført grad gir den lovbeskyttede tittelen Fiskehelsebiolog. I motsetning til uib_havbruk (samme fakultet) har dette programmet INGEN egen valgfri/frie studiepoeng-periode eller utvekslingssemester – «alle emnene i graden skal være bestått før oppstart av masteroppgåva». Kun ett obligatorisk valg mellom alternativer finnes, og er derfor IKKE ført i listen, i tråd med oppgavens regel: MAT101/MAT111 (10 sp, 1. semester, valgt etter matematikkbakgrunn). Enkelte emnekoder i kildens rutenett (BIO205A, LAS301/LAS303, BIO300A/BIO300B, BIF210) er oppgitt uten eksplisitt studiepoengtall for hvert delemne; studiepoeng for disse er anslått ut fra at hvert semester skal summere til 30 sp (se egne merknader per emne). 290 (listen) + 10 (MAT101/MAT111) = 300 sp. Programmet har ingen egne navngitte studieretninger med separate obligatoriske emnelister.',
        obligatoriske: [
          {
            emnekode: 'BIF100', emnenavn: 'Grunnkurs i bioinformatikk', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIF100-0'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO100', emnenavn: 'Biologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO100-0'],
            years: [
              { year: 2021, A: 5, B: 7, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 3, B: 4, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.71, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 4, B: 11, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.86, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 10, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 5, B: 9, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.95, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIF200', emnenavn: 'Statistikk for bioinformatikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIF200-0'],
            years: [
              { year: 2021, A: 0, B: 14, C: 19, D: 8, E: 0, F: 0, G: 0, H: 0, total: 41, snitt: 3.15, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 3, B: 12, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.95, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 4, B: 4, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 3, B: 9, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 5, B: 7, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIF101', emnenavn: 'Molekylærbiologisk bioinformatikk', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIF101-0'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 3, C: 7, D: 3, E: 3, F: 0, G: 0, H: 0, total: 16, snitt: 2.62, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 3, B: 9, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 10, B: 11, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.48, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 10, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'KJEM109', emnenavn: 'Kjemi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['KJEM109-0'],
            years: [
              { year: 2023, A: 0, B: 8, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 3, B: 11, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 6, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIO213', emnenavn: 'Akvakultur - avl og genetikk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO213-0'],
            years: [
              { year: 2021, A: 0, B: 0, C: 8, D: 6, E: 3, F: 3, G: 0, H: 0, total: 20, snitt: 1.95, strykprosent: 15, bestattprosent: null, skjult: 7 },
              { year: 2022, A: 0, B: 0, C: 4, D: 6, E: 4, F: 0, G: 0, H: 0, total: 14, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2023, A: 0, B: 9, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.25, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 3, B: 11, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.85, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 4, C: 7, D: 3, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.07, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIO291', emnenavn: 'Fiskefysiologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO291-0'],
            years: [
              { year: 2021, A: 3, B: 8, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.55, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 5, B: 5, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.52, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 3, B: 3, C: 4, D: 0, E: 3, F: 0, G: 0, H: 0, total: 13, snitt: 3.23, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 4, B: 10, C: 4, D: 5, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 3, B: 5, C: 3, D: 6, E: 0, F: 4, G: 0, H: 0, total: 21, snitt: 2.67, strykprosent: 19, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIO280', emnenavn: 'Havbruksbiologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO280-0'],
            years: [
              { year: 2021, A: 10, B: 4, C: 4, D: 4, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.91, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 9, B: 6, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.95, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 9, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.69, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 12, B: 3, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.29, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 10, B: 0, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.31, strykprosent: 0, bestattprosent: null, skjult: 8 },
            ],
          },
          {
            emnekode: 'EXPHIL', emnenavn: 'Examen philosophicum', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Emnekoden er oppgitt som «EXPHIL» uten variantsuffiks i studieplanens rutenett.',
            years: [],
          },
          {
            emnekode: 'BIO103', emnenavn: 'Biologi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BIO103-0'],
            years: [
              { year: 2021, A: 0, B: 7, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.41, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 7, D: 3, E: 0, F: 11, G: 0, H: 0, total: 21, snitt: 1.29, strykprosent: 52.4, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 3, B: 4, C: 8, D: 5, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.25, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 6, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.6, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 9, B: 8, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.3, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BIO205A', emnenavn: 'Fiskesykdommer, del A', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BIO205A-0'], merknad: 'Studiepoeng er anslått til 5 ut fra semestersummen (30 sp), siden kilden kun oppgir «BIO205A» uten eksplisitt studiepoengtall for delemnet.',
            years: [
              { year: 2021, A: 13, B: 9, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 4.13, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 3, B: 8, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 8, B: 16, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.33, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 4, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.29, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 25, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 25, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'LAS301', emnenavn: 'Laboratoriedyrkunnskap, del 1', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: ['LAS301-0'], merknad: 'Studiepoeng anslått til 5 (sammen med LAS303 i 6. semester utgjør de til sammen 10 sp, jf. tilsvarende emnepar i uib_havbruk.json).',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 3, total: 19, snitt: null, strykprosent: null, bestattprosent: 84.2, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 22, H: 0, total: 22, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO206', emnenavn: 'Fiskesykdommer', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BIO206-0'],
            years: [
              { year: 2021, A: 0, B: 0, C: 12, D: 4, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 2.75, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 4, C: 6, D: 5, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 5, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.28, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 6, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.2, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 3, B: 12, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.9, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BIO273', emnenavn: 'Fiskeimmunologi', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BIO273-0'],
            years: [
              { year: 2021, A: 0, B: 11, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.58, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 4, B: 12, C: 18, D: 0, E: 0, F: 0, G: 0, H: 0, total: 34, snitt: 3.59, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 4, B: 7, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.71, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 5, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 12, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'MOL100', emnenavn: 'Innføring i molekylærbiologi', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['MOL100-0'],
            years: [
              { year: 2021, A: 0, B: 0, C: 3, D: 3, E: 0, F: 3, G: 0, H: 0, total: 9, snitt: 1.67, strykprosent: 33.3, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 0, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2023, A: 4, B: 3, C: 6, D: 6, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 3.26, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 8 },
              { year: 2025, A: 9, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.53, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'LAS303', emnenavn: 'Laboratoriedyrkunnskap, del 2', studiepoeng: 5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['LAS303-0'], merknad: 'Se merknad på LAS301.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 0, total: 15, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO207', emnenavn: 'Fiskeernæring', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BIO207-0'],
            years: [
              { year: 2021, A: 5, B: 11, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.31, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 3, B: 8, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.93, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 8, B: 13, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 24, snitt: 4.21, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 16, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 9, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.6, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO274', emnenavn: 'Fiskepatologi', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BIO274-0'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 6, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 10, C: 15, D: 7, E: 0, F: 0, G: 0, H: 0, total: 32, snitt: 3.09, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 0, C: 9, D: 7, E: 0, F: 4, G: 0, H: 0, total: 20, snitt: 2.05, strykprosent: 20, bestattprosent: null, skjult: 8 },
              { year: 2025, A: 3, B: 5, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.79, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIF210', emnenavn: 'Lovverk og forvaltning', studiepoeng: 5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BIF210-0'], merknad: 'Studiepoeng er anslått til 5 ut fra semestersummen (30 sp).',
            years: [
              { year: 2022, A: 4, B: 17, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 4.19, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 4, B: 16, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.2, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 11, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.61, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO381', emnenavn: 'Fiskesykdommer, virus og bakterier', studiepoeng: 10, aar: 4, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO374', emnenavn: 'Fiskesykdommer, parasitter', studiepoeng: 10, aar: 4, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO300A', emnenavn: 'Populasjonsgenetikk, del A', studiepoeng: 5, aar: 4, semester: 'høst',
            dbhEmnekoder: ['BIO300A-0'], merknad: 'Studiepoeng anslått til 5 (BIO300A og BIO300B utgjør til sammen 10 sp, jf. tilsvarende emne i uib_havbruk.json der BIO300 A+B er ført samlet som 10 sp).',
            years: [
              { year: 2021, A: 0, B: 4, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 5, C: 5, D: 7, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 2.88, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 10, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.48, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 0, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.56, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'BIO300B', emnenavn: 'Populasjonsgenetikk, del B', studiepoeng: 5, aar: 4, semester: 'høst',
            dbhEmnekoder: ['BIO300B-0'], merknad: 'Se merknad på BIO300A.',
            years: [
              { year: 2021, A: 0, B: 0, C: 4, D: 6, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 2.4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 16, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.76, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 3, C: 8, D: 8, E: 0, F: 0, G: 0, H: 0, total: 19, snitt: 2.74, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 3, B: 9, C: 11, D: 0, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.65, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 8, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.73, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'BIO371', emnenavn: 'Fiskehelseforvaltning', studiepoeng: 10, aar: 4, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIF310', emnenavn: 'Praksis i fiskehelsetjenesten', studiepoeng: 10, aar: 4, semester: 'vår',
            dbhEmnekoder: ['BIF310-0'], merknad: 'Praksisemne. Kan unntaksvis gjennomføres parallelt med masteroppgaven, men må være bestått før avsluttende mastereksamen.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 0, total: 26, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 0, total: 15, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO372', emnenavn: 'Fiskehelse, klinisk diagnostikk og behandling', studiepoeng: 10, aar: 4, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'FISK399', emnenavn: 'Masteroppgave i fiskehelse', studiepoeng: 60, aar: 5, semester: 'helår',
            dbhEmnekoder: ['FISK399-0'], merknad: 'Selvstendig vitenskapelig arbeid, 60 sp, gjennomføres over 9. og 10. semester (5. år). Alle andre emner i graden skal være bestått før oppstart (unntatt praksisdelen av BIF310).',
            years: [
              { year: 2021, A: 6, B: 4, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.81, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 0, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.7, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 6, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 14, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.82, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 8, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.53, strykprosent: 0, bestattprosent: null, skjult: 7 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'biologi2', label: 'Biologi (2-årig master)', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_biologi2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Biologi (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/biologi', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-05/Studieplan%20master%20i%20biologi%20kull%202026.pdf'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 65,
        merknad: 'Kilde er studieplanen «Master i Biologi (M-BIOL), Opptak 2026», hentet fra fakultetets samleside for studieplaner. Felles for alle fire studieretninger: BIO302 (5 sp) og en masteroppgave på 60 sp (M60-BIOL), i tillegg til studieretningsspesifikke obligatoriske emner og minimum 30 sp på 300-nivå totalt (inkl. BIO302 og studieretningsemner på 300-nivå). Studenter som mangler statistikk fra bachelor må ta STAT100 i tillegg. Utover emnene ført opp under «spesialiseringer» krever hver studieretning obligatoriske VALG mellom flere alternative emner, som ikke er ført opp som enkeltemner: Plantebiologi må i tillegg velge minst ett av BIO324, BIO327 eller BOT345 (10 sp); Dyrebiologi må velge én av tre emnekombinasjoner (BIO314+BIO315, eller HET300+HET301, eller ZOOL240+PLV330 pluss minst 5 sp relaterte 300-nivåemner); Genombiologi må i tillegg velge minst ett av BIO325/BIO326 (10 sp) og minst ett av BIN310/BIN315 (10 sp), og (dersom statistikk/bioinformatikk mangler fra bachelor) minst ett av BIN250/BIN210; Evolusjonsbiologi og molekylær økologi må (dersom det mangler fra bachelor) ta minst ett av BIN250/BIN210. Disse valgkravene gjør at reelt obligatorisk omfang per studieretning typisk blir 75–95 sp avhengig av bakgrunn og valg, mot obligatoriskeStudiepoeng=65 som kun teller de emnene som er ubetinget obligatoriske for alle (BIO302 + masteroppgave) pluss retningens ubetinget obligatoriske emner ført opp under spesialiseringer (BIO322 for Genombiologi; BIO321+BIO328 for Evolusjonsbiologi og molekylær økologi). Resterende studiepoeng er valgfrie emner (200- eller 300-nivå), og planen foreslår en lang liste egnede valgemner i et eget vedlegg (tabell 1).',
        obligatoriske: [
          {
            emnekode: 'BIO302', emnenavn: 'Introduksjonsemne til masterstudier på BIOVIT', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO302-1'], merknad: 'Ligger i augustblokk (før høstparallell). Felles for alle fire studieretninger.',
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'M60-BIOL', emnenavn: 'Masteroppgave', studiepoeng: 60, aar: 2, semester: 'vår',
            dbhEmnekoder: ['M60-BIOL-1'], merknad: 'Går over høstparallell og vårparallell i 2. studieår (planlegging anbefales startet allerede i januarblokk/vårparallell 1. år). Felles for alle fire studieretninger.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 3, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 5, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.36, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Plantebiologi', obligatoriske: [
            {
              emnekode: 'BOT200', emnenavn: 'Plantefysiologi', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Obligatorisk kun for studenter som ikke har dette emnet eller tilsvarende fra bachelorgraden.',
              years: [],
            },
          ] },
          { navn: 'Dyrebiologi', obligatoriske: [
            {
              emnekode: 'HFX201', emnenavn: 'Fysiologi', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Obligatorisk kun for studenter som ikke har dette emnet eller tilsvarende fra bachelorgraden.',
              years: [],
            },
          ] },
          { navn: 'Genombiologi', obligatoriske: [
            {
              emnekode: 'BIO322', emnenavn: 'Advanced Topics in Genomics', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIO322-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 6, H: 0, total: 6, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 9, H: 0, total: 9, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 6, H: 0, total: 6, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 0, total: 7, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              ],
            },
          ] },
          { navn: 'Evolusjonsbiologi og molekylær økologi', obligatoriske: [
            {
              emnekode: 'BIO321', emnenavn: 'Population Genetics and Molecular Evolution', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIO321-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
                { year: 2023, A: 3, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 0 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 6 },
                { year: 2025, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              ],
            },
            {
              emnekode: 'BIO328', emnenavn: 'Environmental DNA: Principles, Methods, and Applications in Ecology and Environmental Monitoring', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
          ] },
        ],
      },
      {
        entryId: 'uio_biovitenskap2', shortName: 'UiO', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Biovitenskap (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.uio.no/studier/program/biovitenskap-master/', 'https://www.uio.no/studier/program/biovitenskap-master/oppbygging/', 'https://www.uio.no/studier/program/biovitenskap-master/studieretninger/biomangfold/oppbygging/', 'https://www.uio.no/studier/program/biovitenskap-master/studieretninger/cellebiologi/oppbygging/', 'https://www.uio.no/studier/program/biovitenskap-master/studieretninger/genetikk/oppbygging/', 'https://www.uio.no/studier/program/biovitenskap-master/studieretninger/marinbiologi/oppbygging/', 'https://www.uio.no/studier/program/biovitenskap-master/studieretninger/molekylarbiologi/oppbygging/', 'https://www.uio.no/studier/program/biovitenskap-master/studieretninger/toksikologi/oppbygging/', 'https://www.uio.no/studier/program/biovitenskap-master/studieretninger/okologi/oppbygging/'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 60,
        merknad: 'Kilde er UiOs løpende studieplansider for «Biovitenskap (master, 2 år)», hentet 22.09.2026 (nettbasert, ikke en datert PDF; studieplanAar er derfor satt til inneværende opptaksår). Programmet har sju studieretninger. Felles for alle: HMS-emner (0 sp) og en masteroppgave på 60 sp. Fem av sju studieretninger har i tillegg to navngitte, ubetinget obligatoriske BIOS-emner à 10 sp (ført opp under spesialiseringer over); de to resterende (Biomangfold og systematikk, og Økologi og evolusjon) har INGEN emnespesifikke obligatoriske krav utover HMS og masteroppgave – der kan studenten «velge fritt blant alle masteremnene innen Biovitenskap», og «obligatoriske» er derfor tom for disse to. Alle retninger har for øvrig 40 sp valgfrie masteremner (kan velges fra hele biovitenskapsporteføljen, inntil 2–10 sp kan tas som spesialpensum). obligatoriskeStudiepoeng (60) teller kun de emnene som er ubetinget felles for alle sju retninger (HMS + masteroppgave); reelt obligatorisk omfang blir 80 sp for de fem retningene med egne BIOS-emner.',
        obligatoriske: [
          {
            emnekode: 'HMS0501/HMS0502/HMS0503/HMS0507', emnenavn: 'Helse, miljø og sikkerhet (HMS)', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Fire 0-poengs HMS-emner som skal tas i begynnelsen av 1. semester; fritak dersom tilsvarende emner er bestått tidligere ved UiO. For studieretningene Biomangfold og systematikk, Marinbiologi og limnologi, Toksikologi og miljøvitenskap samt Økologi og evolusjon kommer i tillegg HMS0504 – Feltsikkerhet. Felles for alle sju studieretninger.',
            years: [],
          },
          {
            emnekode: 'Masteroppgave', emnenavn: 'Masteroppgave', studiepoeng: 60, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ingen egen emnekode oppgitt på UiOs studieplansider. Oppgaven starter typisk i 2. semester (10 sp) og fortsetter gjennom 3. semester (20 sp) og 4. semester (30 sp) – dvs. den strekker seg over store deler av 1. og hele 2. studieår. Felles for alle sju studieretninger; fast 60 sp uansett retning.',
            years: [],
          },
        ],
        spesialiseringer: [
          { navn: 'Biomangfold og systematikk', obligatoriske: [
          ] },
          { navn: 'Cellebiologi, fysiologi og nevrovitenskap', obligatoriske: [
            {
              emnekode: 'BIOS4010', emnenavn: 'Arbeidsmetoder i molekylærbiologi og biokjemi I', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIOS4010-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 45, H: 0, total: 45, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 48, H: 5, total: 53, snitt: null, strykprosent: null, bestattprosent: 90.6, skjult: 0 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 0, total: 35, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 56, H: 6, total: 62, snitt: null, strykprosent: null, bestattprosent: 90.3, skjult: 0 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 39, H: 0, total: 39, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              ],
            },
            {
              emnekode: 'BIOS4030', emnenavn: 'Cellebiologiske arbeidsmetoder', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIOS4030-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 24, H: 0, total: 24, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 25, H: 0, total: 25, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 30, H: 0, total: 30, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              ],
            },
          ] },
          { navn: 'Genetikk og utviklingsbiologi', obligatoriske: [
            {
              emnekode: 'BIOS4010', emnenavn: 'Arbeidsmetoder i molekylærbiologi og biokjemi I', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIOS4010-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 45, H: 0, total: 45, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 48, H: 5, total: 53, snitt: null, strykprosent: null, bestattprosent: 90.6, skjult: 0 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 0, total: 35, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 56, H: 6, total: 62, snitt: null, strykprosent: null, bestattprosent: 90.3, skjult: 0 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 39, H: 0, total: 39, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              ],
            },
            {
              emnekode: 'BIOS4020', emnenavn: 'Arbeidsmetoder i molekylærbiologi og biokjemi II', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIOS4020-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 37, H: 0, total: 37, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 8, total: 34, snitt: null, strykprosent: null, bestattprosent: 76.5, skjult: 0 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 43, H: 0, total: 43, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 5, total: 37, snitt: null, strykprosent: null, bestattprosent: 86.5, skjult: 0 },
              ],
            },
          ] },
          { navn: 'Marinbiologi og limnologi', obligatoriske: [
            {
              emnekode: 'BIOS4310', emnenavn: 'Marin Ecology I', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
            {
              emnekode: 'BIOS4410', emnenavn: 'Marine Ecology II', studiepoeng: 10, aar: 1, semester: 'vår',
              dbhEmnekoder: [],
              years: [],
            },
          ] },
          { navn: 'Molekylærbiologi og biokjemi', obligatoriske: [
            {
              emnekode: 'BIOS4010', emnenavn: 'Arbeidsmetoder i molekylærbiologi og biokjemi I', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIOS4010-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 45, H: 0, total: 45, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 48, H: 5, total: 53, snitt: null, strykprosent: null, bestattprosent: 90.6, skjult: 0 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 35, H: 0, total: 35, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 56, H: 6, total: 62, snitt: null, strykprosent: null, bestattprosent: 90.3, skjult: 0 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 39, H: 0, total: 39, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              ],
            },
            {
              emnekode: 'BIOS4020', emnenavn: 'Arbeidsmetoder i molekylærbiologi og biokjemi II', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIOS4020-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 37, H: 0, total: 37, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 26, H: 8, total: 34, snitt: null, strykprosent: null, bestattprosent: 76.5, skjult: 0 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 43, H: 0, total: 43, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
                { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 5, total: 37, snitt: null, strykprosent: null, bestattprosent: 86.5, skjult: 0 },
              ],
            },
          ] },
          { navn: 'Toksikologi og miljøvitenskap', obligatoriske: [
            {
              emnekode: 'BIOS4500', emnenavn: 'Generell toksikologi', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BIOS4500-1'],
              years: [
                { year: 2021, A: 0, B: 5, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 3 },
                { year: 2022, A: 0, B: 3, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 4 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
                { year: 2024, A: 0, B: 0, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 5 },
                { year: 2025, A: 0, B: 9, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              ],
            },
            {
              emnekode: 'BIOS5400', emnenavn: 'Human toksikologi og økotoksikologi', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: [],
              years: [],
            },
          ] },
          { navn: 'Økologi og evolusjon', obligatoriske: [
          ] },
        ],
      },
      {
        entryId: 'uib_biologi2', shortName: 'UiB', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Biologi (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www4.uib.no/studier/program/biologi-master', 'https://www4.uib.no/studier/program/biologi-master/plan'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 70,
        merknad: 'Kilde er UiBs programside «Biologi (master)» med studieplanseksjonen «Studiets oppbygging», hentet 22.09.2026 (nettbasert, ikke en datert PDF; studieplanAar er derfor satt til inneværende opptaksår, høst 2026). Programmet har IKKE formelle studieretninger med egne obligatoriske emnepakker: ut over BIO300A, BIO300B og masteroppgaven består hele 1. studieår (40 sp) av «valemne» som studenten velger fritt blant masternivåemner ved Institutt for biovitenskap, se full emneoversikt via instituttets nettsider. Programsiden nevner syv uformelle spesialiseringstema som styrer valg av emner og tema for masteroppgave, men ingen av dem har et fastsatt obligatorisk pensum: terrestrisk økologi, marinbiologi, fiskeribiologi og forvaltning, mikrobiologi, miljøtoksikologi, havbruk og utviklingsbiologi, og fysiologi og ernæring. «spesialiseringer» er derfor tom. obligatoriskeStudiepoeng (70 = 5 + 5 + 60) dekker dermed hele det obligatoriske kravet i programmet, siden ingen retningsspesifikke emner finnes.',
        obligatoriske: [
          {
            emnekode: 'BIO300A', emnenavn: 'Akademisk skriving', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO300A-0'],
            years: [
              { year: 2021, A: 11, B: 27, C: 13, D: 6, E: 0, F: 0, G: 0, H: 0, total: 57, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 41, H: 0, total: 41, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2023, A: 0, B: 12, C: 18, D: 0, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 17, B: 30, C: 15, D: 9, E: 3, F: 0, G: 0, H: 0, total: 74, snitt: 3.66, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 26, C: 20, D: 6, E: 0, F: 0, G: 0, H: 0, total: 52, snitt: 3.38, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIO300B', emnenavn: 'Biostatistikk', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO300B-0'],
            years: [
              { year: 2021, A: 9, B: 22, C: 15, D: 9, E: 0, F: 0, G: 0, H: 0, total: 55, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 17, B: 20, C: 0, D: 3, E: 0, F: 3, G: 0, H: 0, total: 43, snitt: 3.98, strykprosent: 7, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 6, B: 16, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.93, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 28, B: 29, C: 12, D: 4, E: 0, F: 0, G: 0, H: 0, total: 73, snitt: 4.11, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 10, B: 29, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 53, snitt: 3.92, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'Masteroppgave', emnenavn: 'Masteroppgave', studiepoeng: 60, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Ingen egen emnekode oppgitt på UiBs studieplanside. Fordelt med 30 sp i 3. semester (høst, 2. år) og 30 sp i 4. semester (vår, 2. år), dvs. hele 2. studieår.',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'ntnu_biologi2', shortName: 'NTNU', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Biologi (master 2 år)',
        studieplanAar: '2025/2026', kilder: ['https://www.ntnu.no/studier/msbio', 'https://www.ntnu.no/studier/studieplan#programmeCode=MSBIO&year=0', 'https://www.ntnu.no/web/studier/studieplan?p_p_id=studyprogrammeplannerportlet_WAR_studyprogrammeplannerportlet_INSTANCE_KzJMPh2hQuXL&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=studyplan&p_p_cacheability=cacheLevelPage&code=MSBIO&year=2025'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 67.5,
        merknad: 'Kilde er NTNUs studieplan-API (studyprogrammeplannerportlet, resource_id=studyplan) for MSBIO, lest via kull 2025 (fullstendig 2-årig plan; kull 2026 er foreløpig ikke fullt publisert). Programmet har fire studieretninger; alle fire deler HMS0003, BI3086, BI3085 og masteroppgaven BI3900 (til sammen 67,5 sp). To retninger har i tillegg ett navngitt obligatorisk fagemne (ført opp under spesialiseringer): BI3016 for Cell and Molecular Biology og BI3024 for Physiology. De to andre retningene har ingen egne obligatoriske enkeltemner utover fellesdelen: Ecology, Behaviour, Evolution and Biosystematics krever i stedet et obligatorisk VALG av minst 2 emner fra en egen «gruppe A» (bl.a. BI3052, BI3106, BI3036, BI3040, BI3082, BI3051, RFEL3082); Biodiversity and Systematics (Nabis) er et nordisk utvekslingsprogram (nabismaster.org) der studieplanen nevner et obligatorisk emne «Fundamental and Molecular Systematics» ved en av partnerinstitusjonene, men uten egen NTNU-emnekode, og er derfor ikke ført opp som enkeltemne. I tillegg er Experts in Teamwork (EiT, 7,5 sp, vårparallell 1. år) en obligatorisk emnekategori for de tre retningene Ecology/Evolution/Biosystematics, Cell and Molecular Biology og Physiology (ikke Nabis) – studenten velger selv «landsby» blant et stort antall emnekoder (f.eks. BEIT4013, TDT4857, TIØ4852 m.fl.), og NTNUs studieplan-API koder disse som «Elective» selv om EiT reelt sett er obligatorisk; ingen enkelt emnekode er derfor obligatorisk her. obligatoriskeStudiepoeng (67,5) teller kun de fire fellesemnene pluss retningens eget fagemne der det finnes; reelt obligatorisk omfang blir 75 sp for Cell and Molecular Biology og Physiology (inkl. EiT), og 75 sp for Ecology/Evolution/Biosystematics når EiT og minst 2 emner fra gruppe A (15 sp) regnes med, mot 67,5 sp for Nabis.',
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
            emnekode: 'BI3086', emnenavn: 'How to do Science', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BI3086-1'], merknad: 'Felles for alle fire studieretninger.',
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 31, H: 0, total: 31, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
            ],
          },
          {
            emnekode: 'BI3085', emnenavn: 'Biology without borders', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BI3085-1'], merknad: 'Langsgående emne registrert i fire deler («part 1 of 4» til «part 4 of 4»), ett per semester gjennom hele studiet (1.–4. semester); de 7,5 studiepoengene tildeles samlet ved fullføring i 4. semester. Felles for alle fire studieretninger.',
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 21, H: 0, total: 21, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 0, total: 14, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 2 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 4, total: 19, snitt: null, strykprosent: null, bestattprosent: 78.9, skjult: 0 },
            ],
          },
          {
            emnekode: 'BI3900', emnenavn: 'Master Thesis in Biology', studiepoeng: 60, aar: 2, semester: 'vår',
            dbhEmnekoder: ['BI3900-1'], merknad: 'Langsgående masteroppgave registrert i fire deler gjennom hele studiet (1.–4. semester); de 60 studiepoengene tildeles samlet ved fullføring i 4. semester. For studieretningen Cell and Molecular Biology kan oppgaven i stedet registreres som BT3920 «Master Thesis in Biology at IBT» (samme omfang, 60 sp, ved Institutt for bioteknologi og matvitenskap). Felles for alle fire studieretninger.',
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
        entryId: 'uit_biologi2', shortName: 'UiT', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Biologi (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://uit.no/utdanning/program/269576/biologi_-_master', 'https://en.uit.no/education/program/270464/biology_-_master', 'https://en.uit.no/Content/916698/cache=20262808095126/Study%20plan%20Master%20in%20Biology%202026.pdf'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 70,
        merknad: 'Kilde er UiTs «Program description: Biology – Master\'s Program, 120 ECTS», godkjent av fakultetsstyret 17.06.2025, publisert som PDF på programsiden («Study plan Master in Biology 2026»). Programmet har sju studieretninger (opptak skjer direkte til retning via egne søknadskoder). Felles for alle: fire HMS-emner (0 sp), TVR-3000 (10 sp) og masteroppgaven BIO-3950 (60 sp). Hver studieretning har i tillegg 20–30 sp egne obligatoriske fagemner i 1. studieår (ført opp under spesialiseringer); BIO-3012 «Ecological methodology» går igjen som obligatorisk 2. semester-emne i fem av de sju retningene (alle unntatt Arctic Animal Biology og Molecular Environmental Biology, som har egne emner i den posisjonen). For Ecology and Sustainability er det i tillegg et obligatorisk, men fritt valgt, «Elective course within the topic of ecology» (10 sp) i 2. semester – ikke ført opp som enkeltemne siden studenten velger konkret emne selv. For studier med eksperimenter på forsøksdyr er ett av tre dyreforsøkskurs obligatorisk (BIO-3503 Aquatic Animal Welfare, «Animal Experimentation for Wildlife Researchers» ved NMBU, eller CAREiN ved UiB), avhengig av dyremodell – heller ikke ført opp siden det avhenger av masterprosjektet. Minst 60 sp emner kreves utover masteroppgaven; studenter kan ta opptil 20 sp emner på 2000-nivå og inntil 10 sp på 1000-nivå etter søknad. obligatoriskeStudiepoeng (70 = 10 + 60) teller kun det som er ubetinget felles for alle sju retninger; reelt obligatorisk omfang blir 90–100 sp når retningens egne emner (20–30 sp) regnes med.',
        obligatoriske: [
          {
            emnekode: 'HMS-0501/0502/0503/0504', emnenavn: 'Compulsory safety courses (Safety in the laboratory, workshop and on sea and land expeditions; First aid; UiT\'s regulations for field work and sea-going expeditions; Biological material)', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Fire 0-poengs HMS-emner ved semesterstart. Felles for alle sju studieretninger.',
            years: [],
          },
          {
            emnekode: 'TVR-3000', emnenavn: 'On sustainability, innovation and collaborative learning', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Tverrfaglig emne med studenter fra andre masterprogram ved UiT. Felles for alle sju studieretninger.',
            years: [],
          },
          {
            emnekode: 'BIO-3950', emnenavn: 'Master\'s Thesis Biology', studiepoeng: 60, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO-3950-1'], merknad: '30 sp i 3. semester (høst, 2. år) og 30 sp i 4. semester (vår, 2. år). Kan i praksis startes allerede i 1. eller 2. semester. Felles for alle sju studieretninger.',
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
          { navn: 'Arctic Animal Biology', obligatoriske: [
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
          { navn: 'Arctic Marine Ecology', obligatoriske: [
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
          { navn: 'Arctic Marine Ecotoxicology', obligatoriske: [
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
          { navn: 'Ecology and Sustainability', obligatoriske: [
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
          { navn: 'Freshwater Ecology', obligatoriske: [
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
          { navn: 'Molecular Environmental Biology', obligatoriske: [
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
          { navn: 'Northern Populations and Ecosystems', obligatoriske: [
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
      {
        entryId: 'nord_biovitenskap2', shortName: 'Nord', institusjon: 'Nord universitet', isNmbu: false, programnavn: 'Biovitenskap (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nord.no/studier/biovitenskap-master', 'https://www.nord.no/studier/studieplaner/biovitenskap-mabio-master-host-2026', 'https://www.nord.no/studier/akvakultur-master-i-biovitenskap-master', 'https://www.nord.no/studier/genomikk-master-i-biovitenskap-master', 'https://www.nord.no/studier/marin-okologi-master-i-biovitenskap-master', 'https://www.nord.no/studier/husdyrvitenskap-master-i-biovitenskap-master', 'https://www.nord.no/studier/terrestrisk-okologi-og-naturforvaltning-master-i-biovitenskap-master'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 15,
        merknad: 'Kilde er Nords nettbaserte studieplanverktøy «Studieplan - Biovitenskap, MABIO-master, høst 2026» samt de fem retningssidene. Nords studieplan er en dynamisk «kurvmodell»: utover de tre felles emnene (MET5019, KJ301F, MET5020, til sammen 15 sp) består resten av programmet av containerposter uten forhåndsdefinerte emnekoder – «Anbefalte valgemner pr. studiested» (Bodø/Steinkjer) og «Spesialisering» (egne containere for hver av de fire retningene som var aktive i planverktøyet for kull 2026: Marin økologi, Akvakultur, Genomikk og Terrestrisk økologi og naturforvaltning). Konkrete emnekoder for disse containerne publiseres ikke i studieplanen eller på retningssidene; retningssidene henviser tilbake til samme studieplanside for emneinnhold, uten å oppgi noen liste. «obligatoriske» er derfor tom for alle fem retninger. Masteroppgaven kan være på 30 eller 60 studiepoeng (bekreftet eksplisitt på Akvakultur-siden; programmets 120 sp/4-semesterstruktur tilsier at dette gjelder generelt), men det er ikke oppgitt noen egen emnekode for oppgaven i planverktøyet, og den er derfor ikke ført opp som enkeltemne. Retningen «Animal science» (husdyrvitenskap, Steinkjer) er beskrevet i programteksten og har en egen programside, men var IKKE blant containerne i selve semesterplanen for kull 2026, og programsiden for husdyrvitenskap/animal science oppgir eksplisitt: «Dette studieprogrammet er vedtatt å ikke starte høst 2026» – dvs. denne studieretningen tas ikke opp for kullet studieplanen gjelder for. entryId nord_husdyr2 og nord_akvakultur2 i programkartet viser til de tilsvarende retningene innenfor dette samme Nord-programmet og har egne filer med identisk fellesdel.',
        obligatoriske: [
          {
            emnekode: 'MET5019', emnenavn: 'Vitenskapelig kommunikasjon', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MET5019-1'], merknad: 'Felles for alle studieretninger/studiesteder (Bodø og Steinkjer).',
            years: [
              { year: 2025, A: 0, B: 8, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'KJ301F', emnenavn: 'Laboratoriesikkerhet master', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJ301F-1'], merknad: '0-poengs sikkerhetskurs, må gjennomføres før bruk av spesialrom/-utstyr eller prosedyrer med forhøyet risiko. Felles for alle studieretninger.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 0, total: 32, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 4, total: 32, snitt: null, strykprosent: null, bestattprosent: 87.5, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 3, total: 32, snitt: null, strykprosent: null, bestattprosent: 90.6, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'MET5020', emnenavn: 'Biologisk dataanalyse', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Felles for alle studieretninger.',
            years: [],
          },
        ],
        spesialiseringer: [
          { navn: 'Akvakultur (Bodø)', obligatoriske: [
          ] },
          { navn: 'Genomikk (Bodø)', obligatoriske: [
          ] },
          { navn: 'Marin økologi (Bodø)', obligatoriske: [
          ] },
          { navn: 'Terrestrisk økologi og naturforvaltning (Steinkjer)', obligatoriske: [
          ] },
          { navn: 'Animal science / Husdyrvitenskap (Steinkjer)', obligatoriske: [
          ] },
        ],
      },
    ],
  },
  {
    id: 'husdyr2', label: 'Husdyrvitenskap (2-årig master)', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_husdyr2', shortName: 'NMBU Husdyrvitenskap', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Husdyrvitenskap (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/husdyrvitenskap', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-06/M-HV-%202026.pdf', 'https://www.nmbu.no/fakulteter/fakultet-biovitenskap/vare-studenter-biovit'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 65,
        merknad: 'Kilde er den engelskspråklige studieplanen «Master i Husdyrvitenskap (M-HV) / Master in Animal Science (M-AS), Opptak 2026», hentet fra fakultetets samleside for studieplaner (samme mal brukes for norske og internasjonale søkere). Programmet har ikke faste obligatoriske emnepakker per fordypningsretning – i stedet gjelder generelle poengkrav: minimum 50 sp husdyrfaglige emner, minimum 35 sp på 300-nivå (hvorav minst 25 sp husdyrfaglig), i tillegg til de to obligatoriske elementene over. Studentene velger selv emner innenfor tre uformelle fagfelt (avl/genetikk, ernæring/fôrteknologi, etologi/dyrevelferd), og planen lister ca. 20 relevante/anbefalte emner (bl.a. BIN300, HFA350, BIN310, BIO321, BIO322, HFA300, HFA303, HFA304, HET300, HET301, HET255, HFE302, HFE303, HFE305, HFE314, HFX307, BINT301, SDG300, SDG301) uten at noen av disse er påkrevd for alle studenter – de er derfor ikke ført opp som «obligatoriske» eller i «spesialiseringer», siden ingen konkret emnekombinasjon er bundet til en navngitt studieretning i selve studieplandokumentet. Programmet er koblet til tittelen «Sivilagronom Husdyr» (fem-årig løp for norske studenter), som krever 60 sp innen en egen liste stjernemerkede emner (bl.a. BINT301, ECN260, HET203, HFA300, HFA303, HFA350, HFE202, HFE205, HFE302, HFE303, HFE305, HFE314, HFX253, HFX255, HFX256, SDG201, SDG300) – dette er en tilleggstittel og ikke et obligatorisk krav i selve masterprogrammet. obligatoriskeStudiepoeng (65 = 5 + 60) forutsetter anbefalt 60 sp masteroppgave; med 45 sp eller 30 sp oppgave blir summen hhv. 50 eller 35 sp.',
        obligatoriske: [
          {
            emnekode: 'BIN250', emnenavn: 'Quantitative skills in BioScience', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIN250-1'], merknad: 'Det obligatoriske statistikkravet på 5 sp dekkes av BIN250. STIN300 (Statistical Programming in R, januarblokk, år 2) er «også anbefalt» i planen, men fremstår som et alternativ/tillegg og ikke et andre obligatorisk emne.',
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 19, H: 0, total: 19, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'M60-HV', emnenavn: 'Masteroppgave', studiepoeng: 60, aar: 2, semester: 'vår',
            dbhEmnekoder: ['M60-HV-1'], merknad: '60 sp er anbefalt omfang og lagt til grunn her. Studenten kan i stedet velge en masteroppgave på 45 sp (emnekode M45-HV) eller 30 sp (M30-HV) dersom vedkommende trenger å ta flere emner for å oppfylle kravene til bachelorgraden. Oppgaven strekker seg i praksis over deler av høstparallellen og hele vårparallellen i 2. år.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 3, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'nord_husdyr2', shortName: 'Nord', institusjon: 'Nord universitet', isNmbu: false, programnavn: 'Biovitenskap, studieretning husdyrvitenskap (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nord.no/studier/biovitenskap-master', 'https://www.nord.no/studier/studieplaner/biovitenskap-mabio-master-host-2026', 'https://www.nord.no/studier/husdyrvitenskap-master-i-biovitenskap-master'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 15,
        merknad: 'VIKTIG: Programsiden for denne studieretningen (Animal science / Husdyrvitenskap, Steinkjer) oppgir eksplisitt: «Dette studieprogrammet er vedtatt å ikke starte høst 2026». Studieretningen var derfor heller ikke blant de fire containerne («Spesialisering») i Nords nettbaserte semesterplan-verktøy for kull 2026 (kun Marin økologi, Akvakultur, Genomikk og Terrestrisk økologi og naturforvaltning var aktive der). Det er dermed ikke mulig å hente en gjeldende, kullspesifikk emneliste for husdyrvitenskapsretningen akkurat nå; «spesialiseringer» er derfor tom. Programmets tre felles emner (MET5019, KJ301F, MET5020, til sammen 15 sp) gjelder uansett for hele Biovitenskap-programmet og er ført opp i «obligatoriske». Retningsbeskrivelsen (fra husdyrvitenskap-siden, når den var/blir aktiv) er faglig rettet mot dyrevelferd, klimafotavtrykk, biologisk mangfold, One Health og teknologiutvikling i husdyrnæringen, men uten publiserte emnekoder. Masteroppgaven i programmet kan normalt være på 30 eller 60 studiepoeng (bekreftet for Akvakultur-retningen; ikke retningsspesifikt bekreftet for husdyrvitenskap siden retningen ikke er aktiv for dette kullet), uten egen oppgitt emnekode i planverktøyet. Se nord_biovitenskap2.json for hovedbeskrivelsen av programmet og de øvrige fire studieretningene.',
        obligatoriske: [
          {
            emnekode: 'MET5019', emnenavn: 'Vitenskapelig kommunikasjon', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MET5019-1'], merknad: 'Felles for hele masterprogrammet i biovitenskap (alle studieretninger og studiesteder).',
            years: [
              { year: 2025, A: 0, B: 8, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'KJ301F', emnenavn: 'Laboratoriesikkerhet master', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJ301F-1'], merknad: '0-poengs sikkerhetskurs, må gjennomføres før bruk av spesialrom/-utstyr eller prosedyrer med forhøyet risiko.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 0, total: 32, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 4, total: 32, snitt: null, strykprosent: null, bestattprosent: 87.5, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 3, total: 32, snitt: null, strykprosent: null, bestattprosent: 90.6, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'MET5020', emnenavn: 'Biologisk dataanalyse', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Felles for hele masterprogrammet i biovitenskap.',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'nmbu_emabg', shortName: 'NMBU EMABG', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'European Master in Animal Biodiversity and Genomics (master 2 år)',
        studieplanAar: '2025/2026', kilder: ['https://www.nmbu.no/studier/master-2-aar/european-master-animal-biodiversity-and-genomics', 'https://www.emabg.eu/curriculum/', 'https://www.emabg.eu/study-tracks-all/'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 25,
        merknad: 'EMABG er en felles Erasmus Mundus-mastergrad (Erasmus Mundus Joint Master) mellom NMBU og fem partneruniversiteter (BOKU Wien, Wageningen/WUR, Universität Göttingen/UGOE, AgroParisTech/APT og SLU). Det finnes ingen NMBU-PDF-studieplan for dette programmet (det er ikke del av fakultetets ordinære studieplansamling); kildene er programmets NMBU-side og konsortiets egne curriculum-/study-tracks-sider (emabg.eu), hentet 22.09.2026. Alle studenter tar 1. semester (35 sp) ved NMBU: de tre emnene i «obligatoriske» over (25 sp) pluss et obligatorisk VALG mellom BIO321 (Population Genetics and Molecular Evolution) eller BIO322 (Advanced Topics in Genomics), 10 sp – ikke ført opp som enkeltemne siden det er et valg mellom alternativer. Deretter velger studenten ett av fem mobilitetsspor («tracks»), som hver har egne obligatoriske emner ved et partneruniversitet i 2.–3. semester og avsluttende masteroppgave i 4. semester, ført opp under «spesialiseringer». Spor 4 og 5 har i tillegg et felles obligatorisk valg i 2. semester ved NMBU mellom HFA300 (Animal Breeding and Conservation Plans) eller BIN300 (Statistical Genomics), 10 sp, samt 15 sp valgfrie emner – heller ikke ført opp som enkeltemne. Oppgavestørrelsen («masteroppgave») VARIERER kraftig mellom sporene: fire av fem spor har en avsluttende oppgave på 30 sp i 4. semester, mens spor 2 (NMBU–WUR) i tillegg har en 30 sp oppgave («ABG80330 MSc thesis») i 3. semester ved WUR – dvs. 60 sp oppgavearbeid totalt for dette sporet. Mange av emnene ved partneruniversitetene (BOKU, APT, SLU) har ingen offisiell emnekode i kildematerialet; emnenavnet er da brukt i feltet «emnekode» slik oppgaven krever («aldri finn opp koder»). Ettersom credit-summene i kildene ikke alltid går eksakt opp til 30 sp per semester (avrunding/elektiver varierer per spor), er de oppgitt slik konsortiet selv skriver dem. obligatoriskeStudiepoeng (25) teller kun de tre ubetinget felles NMBU-emnene i 1. semester; reelt obligatorisk omfang per spor er langt høyere når spesialiseringens emner og masteroppgave(r) regnes med (typisk 90–120 sp avhengig av spor og elektivandel).',
        obligatoriske: [
          {
            emnekode: 'ABG300', emnenavn: 'EMABG - Introduction course', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['ABG300-1'], merknad: '1. semester, alltid ved NMBU, felles for alle fem mobilitetsspor («tracks»).',
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 10, H: 0, total: 10, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'HFA303', emnenavn: 'Biological Consequences of Selection in Animal Breeding', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: '1. semester, alltid ved NMBU, felles for alle fem spor.',
            years: [],
          },
          {
            emnekode: 'HFA350', emnenavn: 'From phenotypes to breeding values', studiepoeng: 15, aar: 1, semester: 'høst',
            dbhEmnekoder: ['HFA350-1'], merknad: '1. semester, alltid ved NMBU, felles for alle fem spor.',
            years: [
              { year: 2025, A: 4, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Designing and implementing breeding programmes for small populations (NMBU–BOKU, Wien)', obligatoriske: [
            {
              emnekode: 'Genetics of diversity', emnenavn: 'Genetics of diversity', studiepoeng: 3, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: 'Ingen emnekode oppgitt i kildematerialet fra BOKU; emnenavnet er brukt som identifikator. Del av 2.–3. semester (vårparallell 1. år t.o.m. høstparallell 2. år) ved BOKU, Wien.',
              years: [],
            },
            {
              emnekode: 'Animal breeding and the sustainable development goals', emnenavn: 'Animal breeding and the sustainable development goals', studiepoeng: 3, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: 'Ingen emnekode oppgitt. 2.–3. semester ved BOKU.',
              years: [],
            },
            {
              emnekode: 'Transformative development', emnenavn: 'Transformative development', studiepoeng: 3, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: 'Ingen emnekode oppgitt. 2.–3. semester ved BOKU.',
              years: [],
            },
            {
              emnekode: 'Animal husbandry in tropical and subtropical regions', emnenavn: 'Animal husbandry in tropical and subtropical regions', studiepoeng: 3, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: 'Ingen emnekode oppgitt. 2.–3. semester ved BOKU.',
              years: [],
            },
            {
              emnekode: 'Project design and sustainable development goals (SDGs)', emnenavn: 'Project design and sustainable development goals (SDGs)', studiepoeng: 3, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: 'Ingen emnekode oppgitt. 2.–3. semester ved BOKU.',
              years: [],
            },
            {
              emnekode: 'Scientific communication and impacts', emnenavn: 'Scientific communication and impacts', studiepoeng: 3, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: 'Ingen emnekode oppgitt. 2.–3. semester ved BOKU.',
              years: [],
            },
            {
              emnekode: 'Contribution of animal breeding to global food security', emnenavn: 'Contribution of animal breeding to global food security', studiepoeng: 3, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: 'Ingen emnekode oppgitt. 2.–3. semester ved BOKU.',
              years: [],
            },
            {
              emnekode: 'Master Thesis', emnenavn: 'Master Thesis', studiepoeng: 30, aar: 2, semester: 'vår',
              dbhEmnekoder: [], merknad: '4. semester ved NMBU. Ingen egen emnekode oppgitt i kildematerialet.',
              years: [],
            },
          ] },
          { navn: 'Conservation genomics for rare and endangered breeds and species (NMBU–WUR, Wageningen)', obligatoriske: [
            {
              emnekode: 'ABG60306', emnenavn: 'Breeding Lab', studiepoeng: 6, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: '2. semester ved Wageningen University & Research (WUR).',
              years: [],
            },
            {
              emnekode: 'MAT20306', emnenavn: 'Advanced Statistics', studiepoeng: 6, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: '2. semester ved WUR.',
              years: [],
            },
            {
              emnekode: 'ABG80330', emnenavn: 'MSc thesis Animal Breeding and Genomics', studiepoeng: 30, aar: 2, semester: 'høst',
              dbhEmnekoder: [], merknad: '3. semester ved WUR, i tillegg til masteroppgaven ved NMBU i 4. semester – se merknad om oppgavestørrelse.',
              years: [],
            },
            {
              emnekode: 'Master Thesis', emnenavn: 'Master Thesis', studiepoeng: 30, aar: 2, semester: 'vår',
              dbhEmnekoder: [], merknad: '4. semester ved NMBU.',
              years: [],
            },
          ] },
          { navn: 'One health: Health and welfare in humans and animals (NMBU–UGOE, Göttingen)', obligatoriske: [
            {
              emnekode: 'M.Cp.0016', emnenavn: 'Practical Statistics and Experimental Design in Agriculture', studiepoeng: 6, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: '2.–3. semester ved Universität Göttingen (UGOE).',
              years: [],
            },
            {
              emnekode: 'M.iPAB.0002', emnenavn: 'Breeding schemes and programs in plant and animal breeding', studiepoeng: 6, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: '2.–3. semester ved UGOE.',
              years: [],
            },
            {
              emnekode: 'M.iPAB.0006', emnenavn: 'Breeding informatics', studiepoeng: 9, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: '2.–3. semester ved UGOE.',
              years: [],
            },
            {
              emnekode: 'M.iPAB.0016', emnenavn: 'Applied effective R programming in animal breeding and genetics', studiepoeng: 3, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: '2.–3. semester ved UGOE.',
              years: [],
            },
            {
              emnekode: 'M.iPAB.0020', emnenavn: 'Breeding Lab Internship', studiepoeng: 9, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: '2.–3. semester ved UGOE.',
              years: [],
            },
            {
              emnekode: 'P.AG.0085', emnenavn: 'Computing in Science - Basics of Computational Biology', studiepoeng: 3, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: '2.–3. semester ved UGOE.',
              years: [],
            },
            {
              emnekode: 'M.iPAB.0001', emnenavn: 'Quantitative genetics and population genetics', studiepoeng: 6, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: '2.–3. semester ved UGOE.',
              years: [],
            },
            {
              emnekode: 'M.iPAB.0003', emnenavn: 'Statistical genetics, breeding informatics and experimental design', studiepoeng: 6, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: '2.–3. semester ved UGOE.',
              years: [],
            },
            {
              emnekode: 'M.iPAB.0007', emnenavn: 'Biotechnology and molecular genetics in plant and animal breeding', studiepoeng: 6, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: '2.–3. semester ved UGOE.',
              years: [],
            },
            {
              emnekode: 'M.iPAB.0024', emnenavn: 'Farm animal genetic resources', studiepoeng: 3, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: '2.–3. semester ved UGOE.',
              years: [],
            },
            {
              emnekode: 'M.SIA.A02M', emnenavn: 'Epidemiology of international and tropical animal infectious diseases', studiepoeng: 6, aar: 1, semester: 'vår',
              dbhEmnekoder: [], merknad: '2.–3. semester ved UGOE.',
              years: [],
            },
            {
              emnekode: 'Master Thesis', emnenavn: 'Master Thesis', studiepoeng: 30, aar: 2, semester: 'vår',
              dbhEmnekoder: [], merknad: '4. semester ved NMBU.',
              years: [],
            },
          ] },
          { navn: 'Understanding biodiversity: integrative biology (NMBU–APT, AgroParisTech)', obligatoriske: [
            {
              emnekode: 'SDG300', emnenavn: 'Sustainability Goals and Food System Redesign', studiepoeng: 5, aar: 1, semester: 'vår',
              dbhEmnekoder: ['SDG300-1'], merknad: '2. semester ved NMBU. NMBUs egen emnebeskrivelse lister emnet som SDG300 «Sustainable development goals in plant and animal food systems».',
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 6, H: 0, total: 6, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 4, H: 0, total: 4, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 5, H: 0, total: 5, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 5, H: 0, total: 5, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              ],
            },
            {
              emnekode: 'Advanced approaches in Animal Sciences', emnenavn: 'Advanced approaches in Animal Sciences', studiepoeng: 12, aar: 2, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Ingen emnekode oppgitt. 3. semester ved AgroParisTech (APT); ett av tre emneblokker som til sammen utgjør 30 sp.',
              years: [],
            },
            {
              emnekode: 'Foundations for Animal sciences and Transversal tools', emnenavn: 'Foundations for Animal sciences and Transversal tools', studiepoeng: 13, aar: 2, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Ingen emnekode oppgitt. 3. semester ved APT.',
              years: [],
            },
            {
              emnekode: 'Practical work experiences and Soft skills', emnenavn: 'Practical work experiences and Soft skills', studiepoeng: 5, aar: 2, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Ingen emnekode oppgitt. 3. semester ved APT.',
              years: [],
            },
            {
              emnekode: 'Research Thesis', emnenavn: 'Research Thesis', studiepoeng: 30, aar: 2, semester: 'vår',
              dbhEmnekoder: [], merknad: '4. semester ved APT (ikke ved NMBU, i motsetning til de andre sporene).',
              years: [],
            },
          ] },
          { navn: 'Bioinformatics applied to biodiversity and genomics (NMBU–SLU, Uppsala/Umeå)', obligatoriske: [
            {
              emnekode: 'SDG300', emnenavn: 'Sustainability Goals and Food System Redesign', studiepoeng: 5, aar: 1, semester: 'vår',
              dbhEmnekoder: ['SDG300-1'], merknad: '2. semester ved NMBU.',
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 6, H: 0, total: 6, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 4, H: 0, total: 4, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 5, H: 0, total: 5, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
                { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 5, H: 0, total: 5, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              ],
            },
            {
              emnekode: 'Genome analysis', emnenavn: 'Genome analysis', studiepoeng: 15, aar: 2, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Ingen emnekode oppgitt. 3. semester ved Sveriges lantbruksuniversitet (SLU).',
              years: [],
            },
            {
              emnekode: 'Bioinformatics', emnenavn: 'Bioinformatics', studiepoeng: 15, aar: 2, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Ingen emnekode oppgitt. 3. semester ved SLU.',
              years: [],
            },
            {
              emnekode: 'Master Thesis', emnenavn: 'Master Thesis', studiepoeng: 30, aar: 2, semester: 'vår',
              dbhEmnekoder: [], merknad: '4. semester ved SLU. Studiepoeng er ikke eksplisitt oppgitt i kildematerialet og er satt til 30 sp ut fra programmets standard semesterstruktur (30 sp per semester).',
              years: [],
            },
          ] },
        ],
      },
    ],
  },
  {
    id: 'plante2', label: 'Plantevitenskap (2-årig master)', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_plante2', shortName: 'NMBU Plantevitenskap', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Plantevitenskap (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/plantevitenskap', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-05/M-PV%20Studieplan%202026-2027_1.pdf', 'https://www.nmbu.no/fakulteter/fakultet-biovitenskap/vare-studenter-biovit'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 65,
        merknad: 'Kilde er studieplanen «Master i Plantevitenskap (M-PV) 2026», hentet fra fakultetets samleside for studieplaner. Felles for alle tre studieretninger: BIO302 (5 sp), en masteroppgave på 30 eller 60 sp (M30-PV/M60-PV), og minimum 30 sp på 300-nivå totalt. Studenter uten jordfag (JORD100 e.l.) fra bachelor må ta dette i masteren, og inntil 10 sp av GEO100/JORD100/BOT130/STAT100 kan telle med. To av studieretningene har ingen enkeltemner som er ubetinget obligatoriske, kun et obligatorisk VALG innen en emneliste, og «obligatoriske» er derfor tom for dem her: Planteproduksjon og plantevern må velge minimum 30 sp blant PJH341, PLV321, PLV330, PLV340, BIO324, PJH360 og JORD330, samt (dersom emnet mangler fra bachelor) minst ett av PJH212/PJH230/PJH240/PJH250. Plantebioteknologi må velge minimum 30 sp blant BIO321, BIO327, BOT345, BIO300, BIO324 og BIO325, samt (dersom det mangler fra bachelor) minst ett av BIO200/BIO244. Grøntmiljø har derimot to ubetinget obligatoriske emner (BOT200 og PHG316, ført opp under spesialiseringer) og krever i tillegg (dersom emnet mangler fra bachelor) at studenten tar et av PHG213, PHG215, PLV210/PLV211, JORD230 eller LAA221. Programmet gir engelskspråklig vitnemål for studieretningene Planteproduksjon og plantevern og Plantebioteknologi. Programmet er koblet til tittelen «Sivilagronom planter» (80 sp fra en egen emneliste, hvorav minst 30 sp på 300-nivå og minst 30 sp innen PJH/PLV-emnekoder) – dette er en tilleggstittel og ikke et krav i selve masterprogrammet. obligatoriskeStudiepoeng (65 = 5 + 60) forutsetter 60 sp masteroppgave; med 30 sp oppgave blir summen 35 sp, pluss ev. studieretningens obligatoriske emner.',
        obligatoriske: [
          {
            emnekode: 'BIO302', emnenavn: 'Introduksjonsemne til masterstudier på BIOVIT', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO302-1'], merknad: 'Ligger i augustblokk. Felles for alle tre studieretninger.',
            years: [
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 0, total: 7, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 23, H: 0, total: 23, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'M60-PV', emnenavn: 'Masteroppgave', studiepoeng: 60, aar: 2, semester: 'vår',
            dbhEmnekoder: ['M60-PV-1'], merknad: '60 sp er lagt til grunn her. Studenten kan i stedet velge en masteroppgave på 30 sp (emnekode M30-PV). Oppgaven kan starte allerede med feltarbeid i augustblokk/juniblokk 1. år og kan i sin helhet legges til høstparallell + vårparallell 2. år (60 sp) eller kun vårparallell 2. år (30 sp). Felles for alle tre studieretninger.',
            years: [
              { year: 2021, A: 3, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.43, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 5, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 3, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.43, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 5, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.38, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Planteproduksjon og plantevern', obligatoriske: [
          ] },
          { navn: 'Plantebioteknologi', obligatoriske: [
          ] },
          { navn: 'Grøntmiljø', obligatoriske: [
            {
              emnekode: 'BOT200', emnenavn: 'Plantefysiologi', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: ['BOT200-1'],
              years: [
                { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
                { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
                { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
                { year: 2024, A: 0, B: 0, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 3 },
              ],
            },
            {
              emnekode: 'PHG316', emnenavn: 'Grøntanlegg og landskapspleie', studiepoeng: 10, aar: 1, semester: 'høst',
              dbhEmnekoder: [], merknad: 'Ligger i augustblokk/høstparallell. Planen oppgir at emnet «tilbys 2027/28», dvs. annethvert år.',
              years: [],
            },
          ] },
        ],
      },
      {
        entryId: 'inn_baerekraftig_jordbruk', shortName: 'INN', institusjon: 'Universitetet i Innlandet', isNmbu: false, programnavn: 'Bærekraftig jordbruk (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.inn.no/studier/vare-studier/master-i-berekraftig-jordbruk/', 'https://studiekatalog.edutorium.no/inn/nb/program/MABJO'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 120,
        merknad: 'VIKTIG AVVIK: programkartets oppføring inn_baerekraftig_jordbruk er typet «master2» (2-årig, sammenlignet med NMBUs toårige mastere), men dette INN-programmet er offisielt et TREÅRIG deltidsstudium («normert til tre år på deltid», nett- og samlingsbasert), fortsatt på 120 sp totalt. programnavn er derfor satt til «Bærekraftig jordbruk (master, 3 år deltid)» for å reflektere kilden korrekt; aar-feltene i obligatoriske-listen er satt til 1/2 ut fra sp-progresjon (40/40/40 sp per studieår), ikke ut fra semestrenes kalenderår. Kilde er Edutorium-studiekatalogens emnemodell for MABJO (kull høst 2026), som viser alle åtte emner merket «O» (obligatorisk) uten valgfrie emner eller studieretninger – programmet har derfor ingen spesialiseringer, og hele graden (120 sp) er obligatorisk. Studenter som mangler 15 sp jordbruksfaglig bakgrunn må i tillegg ta det nettbaserte bro-emnet LAN1101N «Innføring i landbruk» i 1. semester; dette er et opptakskrav/tilleggsemne og ikke en del av selve 120 sp-graden, og er derfor ikke ført opp i obligatoriske-listen. Opptak skjer i to kvoter (50/50): kvote 1 for søkere med bachelor i agronomi, landbruksteknikk, husdyr- eller plantevitenskap, kvote 2 for søkere med annen bachelorbakgrunn.',
        obligatoriske: [
          {
            emnekode: 'MBJ4001S', emnenavn: 'Jordøkologi og jordkvalitet', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MBJ4001S-1'],
            years: [
              { year: 2022, A: 6, B: 3, C: 6, D: 0, E: 0, F: 3, G: 0, H: 0, total: 18, snitt: 3.33, strykprosent: 16.7, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 5, B: 6, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 3.94, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 8 },
            ],
          },
          {
            emnekode: 'MBJ4002S', emnenavn: 'Forskningsmetode og dataanalyse', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MBJ4002S-1'],
            years: [
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 20, H: 0, total: 20, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 4, total: 18, snitt: null, strykprosent: null, bestattprosent: 77.8, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 14, H: 0, total: 14, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 7, H: 0, total: 7, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'MBJ4003S', emnenavn: 'Sentrale temaer i økologi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MBJ4003S-1'],
            years: [
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 16, H: 0, total: 16, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 9, H: 5, total: 14, snitt: null, strykprosent: null, bestattprosent: 64.3, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 4, E: 0, F: 0, G: 4, H: 0, total: 8, snitt: 2, strykprosent: 0, bestattprosent: 100, skjult: 3 },
            ],
          },
          {
            emnekode: 'MBJ4004S', emnenavn: 'Studiedesign og statistisk metode', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MBJ4004S-1'],
            years: [
              { year: 2023, A: 0, B: 4, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.31, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 6, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.25, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'MBJ4005S', emnenavn: 'Teknologi og bærekraftig jordbruk', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MBJ4005S-1'],
            years: [
              { year: 2023, A: 10, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.67, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 4, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'MBJ4006S', emnenavn: 'Forvaltning, rådgiving og innovasjon', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['MBJ4006S-1'],
            years: [
              { year: 2023, A: 0, B: 6, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.13, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 0, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'MBJ4007S', emnenavn: 'Agroøkologi', studiepoeng: 15, aar: 2, semester: 'vår',
            dbhEmnekoder: ['MBJ4007S-1'],
            years: [
              { year: 2024, A: 8, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.28, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 4, B: 0, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
            ],
          },
          {
            emnekode: 'MBJ4900S', emnenavn: 'Masteroppgave i bærekraftig jordbruk', studiepoeng: 45, aar: 2, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Fordelt med 5 sp i 2. år vår, 20 sp i 3. år høst og 20 sp i 3. år vår (dvs. hovedsakelig hele 3. studieår).',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'nmbu_agroekologi2', shortName: 'NMBU Agroøkologi', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Agroøkologi / Agroecology (master 2 år)',
        studieplanAar: '2025/2026', kilder: ['https://www.nmbu.no/studier/master-2-aar/agroecology', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2025-03/Master%20AE%202025-26.pdf', 'https://www.nmbu.no/fakulteter/fakultet-biovitenskap/vare-studenter-biovit'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 100,
        merknad: 'Kilde er den engelskspråklige studieplanen «Master in Agroecology (M-AE), Admission 2025», hentet fra fakultetets samleside for studieplaner; nyeste tilgjengelige versjon der er 2025/2026 (ingen 2026/2027-versjon var lagt ut per 22.09.2026, og programmets egen NMBU-side lenket ikke til noen PDF direkte). Programmet er internasjonalt og har ikke egne norskspråklige studieretninger med separate obligatoriske emnepakker; i stedet finnes en «enkeltgrad»-variant (kun ved NMBU) og en «dobbeltgrad»-variant i samarbeid med ISARA/FESIA i Frankrike (student ved NMBU første semester, deretter evt. utveksling og tredje semester ved ISARA, fjerde semester 30 sp masteroppgave). Begge variantene har de samme obligatoriske emnene PAE302 og PAE306; forskjellen er kun i oppgavestørrelse (fast 30 sp i dobbeltgraden vs. valgfritt 30/60 sp i enkeltgraden) og hvor resten av studiet gjennomføres, og er derfor ikke ført opp som egne «spesialiseringer». obligatoriskeStudiepoeng (100 = 30 + 10 + 60) forutsetter 60 sp masteroppgave; med 30 sp oppgave (obligatorisk for dobbeltgradsstudenter, valgfritt for øvrige) blir summen 70 sp. Resterende studiepoeng er valgfrie emner på 200- eller 300-nivå; planen foreslår en liste aktuelle valgemner (bl.a. innen bærekraft, utviklingsstudier og jordfag).',
        obligatoriske: [
          {
            emnekode: 'PAE302', emnenavn: 'Agroecology: Action learning in farming and food systems', studiepoeng: 30, aar: 1, semester: 'høst',
            dbhEmnekoder: ['PAE302-1'], merknad: 'Går over augustblokk og høstparallell. Felles startemne for både enkeltgrad og dobbeltgrad med ISARA/FESIA (Frankrike).',
            years: [
              { year: 2021, A: 0, B: 19, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 31, snitt: 3.61, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 8, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 3, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.33, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 3, B: 5, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.85, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'PAE306', emnenavn: 'Agroecology: Action oriented research', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['PAE306-1'],
            years: [
              { year: 2023, A: 0, B: 3, C: 0, D: 0, E: 0, F: 4, G: 0, H: 0, total: 7, snitt: 1.71, strykprosent: 57.1, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'M60-AE', emnenavn: 'Master\'s thesis', studiepoeng: 60, aar: 2, semester: 'vår',
            dbhEmnekoder: ['M60-AE-1'], merknad: '60 sp er lagt til grunn her (høstparallell + vårparallell 2. år). Studenten kan i stedet velge en masteroppgave på 30 sp (emnekode M30-AE, kun vårparallell 2. år); dobbeltgradsstudenter med ISARA/FESIA skriver alltid en oppgave på 30 sp.',
            years: [
              { year: 2021, A: 4, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
  {
    id: 'akvakultur2', label: 'Akvakultur (2-årig master)', level: 'master2',
    programs: [
      {
        entryId: 'nmbu_akvakultur2', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Aquaculture (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nmbu.no/studier/master-2-aar/aquaculture', 'https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2026-06/M-AA%202026%20Study%20plan.pdf', 'https://www.nmbu.no/fakulteter/fakultet-biovitenskap/vare-studenter-biovit'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 80,
        merknad: 'Kilde er den engelskspråklige studieplanen «Master in Aquaculture (M-AA), Admissions 2026», hentet fra fakultetets samleside for studieplaner. Programmet har ingen navngitte studieretninger med egne obligatoriske emnepakker – utover de tre obligatoriske emnene og masteroppgaven velger studenten fritt blant en lang liste valgfrie emner innen fem uformelle temaer (avl/genombiologi, etologi/fiskehelse, ernæring/produktkvalitet/fôrteknologi, drift/anleggsteknologi, samt generelle emner), med krav om minimum 30 sp på 300-nivå totalt. obligatoriskeStudiepoeng (80 = 5 + 5 + 10 + 60) forutsetter 60 sp masteroppgave; med 45 eller 30 sp oppgave blir summen hhv. 65 eller 50 sp.',
        obligatoriske: [
          {
            emnekode: 'AQX251', emnenavn: 'Sustainability and welfare in aquaculture', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['AQX251-1'], merknad: 'Ligger i augustblokk.',
            years: [
              { year: 2021, A: 3, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.3, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 4, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.09, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 6, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.2, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 9, B: 13, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 4.11, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 5, B: 12, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 4.1, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO314', emnenavn: 'Fish physiology', studiepoeng: 5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['BIO314-1'],
            years: [
              { year: 2021, A: 3, B: 4, C: 4, D: 7, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 3.17, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 4, B: 7, C: 13, D: 4, E: 0, F: 0, G: 0, H: 0, total: 28, snitt: 3.39, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 4, B: 7, C: 5, D: 5, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.48, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 14, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 4, B: 0, C: 6, D: 6, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.12, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'AQX300', emnenavn: 'Applied Aquaculture', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['AQX300-1'],
            years: [
              { year: 2022, A: 9, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 4.64, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 10, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 18, snitt: 4.56, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 11, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.65, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 5, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.33, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'M60-AA', emnenavn: 'Master thesis', studiepoeng: 60, aar: 2, semester: 'vår',
            dbhEmnekoder: ['M60-AA-1'], merknad: '60 sp er lagt til grunn her (går over høstparallell og vårparallell 2. år). Studenten kan i stedet velge en oppgave på 45 sp (M45-AA) eller 30 sp (M30-AA) og fylle resten av 2. år med valgfrie emner.',
            years: [
              { year: 2021, A: 0, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 4, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 3, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 3, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 3 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uit_fiskeri_havbruk2', shortName: 'UiT Fiskeri og havbruk', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Fiskeri- og havbruksvitenskap (master 2 år)',
        studieplanAar: '2025/2026', kilder: ['https://uit.no/utdanning/program/268941/fiskeri-_og_havbruksvitenskap_-_master', 'https://uit.no/Content/915964/cache=20262209152237/Studieplan%20for%20master%20i%20fiskeri-og%20havbruksvitenskap%20fra%20kull%202025.PDF'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 80,
        merknad: 'Kilde er «Studieplan for master i fiskeri- og havbruksvitenskap fra kull 2025», godkjent av fakultetsstyret ved BFE-fakultetet 17.06.2025. Programmet er tverrfaglig og har ingen formelle, bindende studieretninger med obligatoriske emnepakker: 1. og 2. semester (60 sp) består av BED-3200, SVF-3004 og 40 sp «fordypningsemner» som studenten velger fritt, men studieplanen lister fem «anbefalte fordypningsretninger» (ført opp under spesialiseringer, alle med tom obligatorisk-liste siden ingen enkeltemner er påkrevd) for faglig sammenheng: Forvaltning (bl.a. BIO-3516/FSK-3624, SVF-3555, FSK-3012, FSK-3009), Havbruk (bl.a. BIO-2504, SVF-3555/FSK-3004, BIO-3011, BIO-3503, SVF-3650/BIO-3512), Ressursøkonomi (bl.a. SOK-3600, SVF-3555, FSK-3009, SOK-3XXX Cost-benefit analysis), Sjømat (bl.a. BIO-3607, FSK-3004, BIO-3503, FSK-3009, SVF-3650) og Marked (bl.a. BED-3074/BED-3111, BED-3003, FSK-3009, BED-3113/BED-3101). Teksten presiserer at «andre alternativer og kombinasjoner kan velges» og at studenter også kan ta emner utenfor Norges fiskerihøgskole. obligatoriskeStudiepoeng (80 = 10 + 10 + 60) forutsetter 60 sp masteroppgave; med 30 sp oppgave blir summen 50 sp, men da erstattes 30 sp av oppgaven med obligatoriske fordypningsemner i 3. semester (fritt valgt innenfor rammen over).',
        obligatoriske: [
          {
            emnekode: 'BED-3200', emnenavn: 'Fellesemnet (bærekraft, innovasjon og samarbeidslæring)', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: [], merknad: 'Tverrfaglig fellesemne sammen med studenter fra andre studieprogram.',
            years: [],
          },
          {
            emnekode: 'SVF-3004', emnenavn: 'Kvantitative forskningsmetoder 1', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['SVF-3004-1'], merknad: 'Omtalt i studieplanen som «et obligatorisk metodeemne».',
            years: [
              { year: 2022, A: 0, B: 4, C: 6, D: 4, E: 3, F: 0, G: 0, H: 0, total: 17, snitt: 2.65, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 3, B: 6, C: 12, D: 6, E: 3, F: 0, G: 0, H: 0, total: 30, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2024, A: 0, B: 0, C: 5, D: 7, E: 3, F: 4, G: 0, H: 0, total: 19, snitt: 1.68, strykprosent: 21.1, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 3, B: 6, C: 7, D: 5, E: 3, F: 0, G: 0, H: 0, total: 24, snitt: 3.04, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'FSK-3960', emnenavn: 'Masteroppgave i Fiskeri- og havbruksvitenskap', studiepoeng: 60, aar: 2, semester: 'vår',
            dbhEmnekoder: ['FSK-3960-1', 'FSK-3960-2'], merknad: '60 sp er vanligst (30 sp i 3. semester høst + 30 sp i 4. semester vår, «alternativ a»). Alternativt kan studenten skrive en oppgave på 30 sp (emnekode FSK-3961, kun i 4. semester, «alternativ b»), og bruke 3. semester på fordypningsemner tilsvarende 30 sp i stedet.',
            years: [
              { year: 2021, A: 5, B: 9, C: 4, D: 0, E: 3, F: 0, G: 0, H: 0, total: 21, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 4, B: 20, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 29, snitt: 3.97, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 7, B: 5, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 26, snitt: 3.73, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 5, B: 11, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 30, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 9, C: 10, D: 4, E: 0, F: 0, G: 0, H: 0, total: 23, snitt: 3.22, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
        ],
        spesialiseringer: [
          { navn: 'Forvaltning', obligatoriske: [
          ] },
          { navn: 'Havbruk', obligatoriske: [
          ] },
          { navn: 'Ressursøkonomi', obligatoriske: [
          ] },
          { navn: 'Sjømat', obligatoriske: [
          ] },
          { navn: 'Marked', obligatoriske: [
          ] },
        ],
      },
      {
        entryId: 'nord_akvakultur2', shortName: 'Nord', institusjon: 'Nord universitet', isNmbu: false, programnavn: 'Biovitenskap, studieretning akvakultur (master 2 år)',
        studieplanAar: '2026/2027', kilder: ['https://www.nord.no/studier/biovitenskap-master', 'https://www.nord.no/studier/studieplaner/biovitenskap-mabio-master-host-2026', 'https://www.nord.no/studier/akvakultur-master-i-biovitenskap-master'],
        totaltStudiepoeng: 120, obligatoriskeStudiepoeng: 15,
        merknad: 'Kilde er Nords nettbaserte studieplanverktøy «Studieplan - Biovitenskap, MABIO-master, høst 2026» samt retningssiden for Akvakultur (Bodø, ved forskningsstasjonen Mørkvedbukta). Utover de tre felles emnene (MET5019, KJ301F, MET5020, til sammen 15 sp) er retningen i planverktøyet en tom container («Spesialisering - Akvakultur - Bodø», 0 sp) uten forhåndsdefinerte emnekoder – studenten setter selv sammen fordypningsemner (f.eks. innen akvakulturernæring, fiskefysiologi, fiskehelse, kvalitet/matsikkerhet) i samråd med veileder, og retningssiden lister ingen konkrete emnekoder. «spesialiseringer» er derfor tom for denne filen (ingen fast obligatorisk emnepakke er publisert). Masteroppgaven kan være på 30 eller 60 studiepoeng (studentens eget valg); velges 30 sp kan studenten i tillegg ta valgemner innen f.eks. økonomi og ledelse ved andre fakulteter ved Nord universitet. Praktisk arbeid kan gjøres ved universitetets forskningsstasjon i Mørkvedbukta eller i samarbeid med næringen. Se nord_biovitenskap2.json for hovedbeskrivelsen av programmet og de øvrige fire studieretningene.',
        obligatoriske: [
          {
            emnekode: 'MET5019', emnenavn: 'Vitenskapelig kommunikasjon', studiepoeng: 7.5, aar: 1, semester: 'høst',
            dbhEmnekoder: ['MET5019-1'], merknad: 'Felles for hele masterprogrammet i biovitenskap (alle studieretninger og studiesteder).',
            years: [
              { year: 2025, A: 0, B: 8, C: 14, D: 0, E: 0, F: 0, G: 0, H: 0, total: 22, snitt: 3.36, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'KJ301F', emnenavn: 'Laboratoriesikkerhet master', studiepoeng: 0, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJ301F-1'], merknad: '0-poengs sikkerhetskurs, må gjennomføres før bruk av spesialrom/-utstyr eller prosedyrer med forhøyet risiko.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 32, H: 0, total: 32, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 27, H: 0, total: 27, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 4, total: 32, snitt: null, strykprosent: null, bestattprosent: 87.5, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 29, H: 3, total: 32, snitt: null, strykprosent: null, bestattprosent: 90.6, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 28, H: 0, total: 28, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'MET5020', emnenavn: 'Biologisk dataanalyse', studiepoeng: 7.5, aar: 1, semester: 'vår',
            dbhEmnekoder: [], merknad: 'Felles for hele masterprogrammet i biovitenskap.',
            years: [],
          },
        ],
        spesialiseringer: [
        ],
      },
      {
        entryId: 'uit_akvamedisin2', shortName: 'UiT Akvamedisin', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Akvamedisin (master) (5-årig profesjonsstudium)',
        studieplanAar: '2025/2026', kilder: ['https://uit.no/utdanning/program/268952/akvamedisin_-_master', 'https://uit.no/Content/869356/cache=20261709103752/Studieplan%20i%20Akvamedisin%20-%20fra%20kull%202025.pdf'],
        totaltStudiepoeng: 300, obligatoriskeStudiepoeng: 300,
        merknad: 'VIKTIG AVVIK: programkartets oppføring uit_akvamedisin2 er typet «master2» (2-årig), men programmet bak URL-en og studieplan-PDF-en («Studieplan i Akvamedisin - fra kull 2025», godkjent 20.12.2024) er faktisk et 5-årig INTEGRERT profesjonsstudium på 300 studiepoeng (10 semestre), ikke en frittstående 2-årig mastergrad – programnavnet er derfor satt til «Akvamedisin (integrert master, 5 år)» og totaltStudiepoeng til 300 for å reflektere kildematerialet korrekt. Det finnes ikke noen egen 2-årig Akvamedisin-master ved UiT å hente data fra i stedet; programsiden 268952 er entydig 5-årig. Studiet er et lukket profesjonsløp uten valgfrie emner og uten studieretninger – praktisk talt alle emner i studieplanen er obligatoriske (teksten sier «de fleste emnene ... er obligatoriske»), og «spesialiseringer» er derfor tom. For å kunne starte på 7. semester (4. år) må sju navngitte emner (KJE-1001, BIO-1501, MBI-1002, BIO-2406, BIO-2601, KJE-2002, MBI-2015, til sammen 170 sp) være bestått, med maks 10 sp «hengefag» utover disse. Seks emner undervises på engelsk (KJE-2002, BIO-2406, BIO-2504, BIO-3503, BIO-3519, BIO-3609). Fullført grad kvalifiserer til offentlig autorisasjon som fiskehelsebiolog. obligatoriskeStudiepoeng er satt lik totaltStudiepoeng (300) siden hele studieplanen er obligatorisk uten valgfrihet.',
        obligatoriske: [
          {
            emnekode: 'AKV-1400', emnenavn: 'Introduksjon til akvakultur og fiskehelse', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['AKV-1400-1'],
            years: [
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'FIL-0700', emnenavn: 'Examen philosophicum, Tromsøvarianten', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['FIL-0700-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 13, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 0, B: 0, C: 10, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 5, C: 10, D: 4, E: 0, F: 3, G: 0, H: 0, total: 22, snitt: 2.64, strykprosent: 13.6, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 4, D: 3, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 2.57, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 6, snitt: 2.5, strykprosent: 0, bestattprosent: null, skjult: 6 },
            ],
          },
          {
            emnekode: 'KJE-1001', emnenavn: 'Introduksjon til kjemi og kjemisk biologi', studiepoeng: 10, aar: 1, semester: 'høst',
            dbhEmnekoder: ['KJE-1001-1'],
            years: [
              { year: 2021, A: 4, B: 8, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 4, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.57, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 0, C: 8, D: 6, E: 3, F: 0, G: 0, H: 0, total: 17, snitt: 2.29, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 0, C: 4, D: 0, E: 0, F: 3, G: 0, H: 0, total: 7, snitt: 1.71, strykprosent: 42.9, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 3, snitt: 1, strykprosent: 0, bestattprosent: null, skjult: 11 },
            ],
          },
          {
            emnekode: 'BIO-1501', emnenavn: 'Akvatisk økologi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO-1501-1'],
            years: [
              { year: 2021, A: 0, B: 3, C: 12, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 3.2, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 4, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.33, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 4, C: 5, D: 5, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 2.93, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 3, B: 6, C: 6, D: 6, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.29, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 3 },
            ],
          },
          {
            emnekode: 'BIO-1601', emnenavn: 'Innføring i mikrobiologi', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: ['BIO-1601-1'],
            years: [
              { year: 2021, A: 0, B: 5, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 0, C: 10, D: 3, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 2.77, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2023, A: 0, B: 0, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 7 },
              { year: 2024, A: 5, B: 8, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 21, snitt: 3.86, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 5, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.5, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'FSK-1121', emnenavn: 'Statistikk og metode i fiskeri/havbruksvitenskap', studiepoeng: 5, aar: 1, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MBI-1002', emnenavn: 'Celle- og molekylærbiologi', studiepoeng: 10, aar: 1, semester: 'vår',
            dbhEmnekoder: ['MBI-1002-1'],
            years: [
              { year: 2021, A: 0, B: 8, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.73, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2022, A: 3, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.23, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 6, D: 5, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 2.55, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 3, B: 5, C: 8, D: 4, E: 0, F: 0, G: 0, H: 0, total: 20, snitt: 3.35, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 3, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 3.43, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIO-2406', emnenavn: 'Introduction to fish biology', studiepoeng: 7.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO-2601', emnenavn: 'Generell mikrobiologi', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: ['BIO-2601-1'],
            years: [
              { year: 2021, A: 3, B: 6, C: 0, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 4, C: 0, D: 0, E: 3, F: 0, G: 0, H: 0, total: 7, snitt: 2.71, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 3, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.83, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 3, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.27, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 6, D: 3, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.67, strykprosent: 0, bestattprosent: null, skjult: 9 },
            ],
          },
          {
            emnekode: 'FSK-1020', emnenavn: 'Etikk, bærekraft og tverrfaglighet', studiepoeng: 2.5, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'KJE-2002', emnenavn: 'Biological chemistry', studiepoeng: 10, aar: 2, semester: 'høst',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'AKV-2400', emnenavn: 'Produksjonsbiologi i fiskeoppdrett', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'AKV-2410', emnenavn: 'Profesjonskompetanse i akvamedisin I', studiepoeng: 5, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'MBI-2015', emnenavn: 'Menneskets fysiologi', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'FSK-2002', emnenavn: 'Havbruksrett', studiepoeng: 10, aar: 2, semester: 'vår',
            dbhEmnekoder: ['FSK-2002-1'],
            years: [
              { year: 2021, A: 12, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 17, snitt: 4.71, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 12, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 4.75, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2023, A: 6, B: 0, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 4.09, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 5, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 15, snitt: 4.33, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 9, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.56, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO-2504', emnenavn: 'Fish physiology', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BIO-2504-1'],
            years: [
              { year: 2021, A: 3, B: 5, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.85, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 3, C: 0, D: 3, E: 3, F: 0, G: 0, H: 0, total: 9, snitt: 2.33, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 0, C: 3, D: 4, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 2.43, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2024, A: 0, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 8, C: 8, D: 0, E: 3, F: 0, G: 0, H: 0, total: 19, snitt: 3.11, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIO-2604', emnenavn: 'Fiskesykdommer', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BIO-2604-1'],
            years: [
              { year: 2021, A: 0, B: 6, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.25, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 0, C: 6, D: 4, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 2.6, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2023, A: 0, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 0, C: 6, D: 3, E: 0, F: 4, G: 0, H: 0, total: 13, snitt: 1.85, strykprosent: 30.8, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 6, C: 6, D: 4, E: 4, F: 3, G: 0, H: 0, total: 23, snitt: 2.35, strykprosent: 13, bestattprosent: null, skjult: 5 },
            ],
          },
          {
            emnekode: 'BIO-3609', emnenavn: 'Basal and comparative immunology', studiepoeng: 10, aar: 3, semester: 'høst',
            dbhEmnekoder: ['BIO-3609-1'],
            years: [
              { year: 2021, A: 3, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.33, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 3, F: 4, G: 0, H: 0, total: 7, snitt: 0.43, strykprosent: 57.1, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 4, C: 5, D: 3, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.08, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2024, A: 0, B: 3, C: 4, D: 0, E: 0, F: 3, G: 0, H: 0, total: 10, snitt: 2.4, strykprosent: 30, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 0, B: 6, C: 6, D: 6, E: 0, F: 4, G: 0, H: 0, total: 22, snitt: 2.45, strykprosent: 18.2, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'AKV-2420', emnenavn: 'Profesjonskompetanse i akvamedisin II', studiepoeng: 5, aar: 3, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO-2602', emnenavn: 'Fiskeernæring', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BIO-2602-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 7, D: 0, E: 3, F: 0, G: 0, H: 0, total: 10, snitt: 2.4, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2022, A: 0, B: 0, C: 9, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2023, A: 0, B: 0, C: 3, D: 5, E: 3, F: 0, G: 0, H: 0, total: 11, snitt: 2, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 0, C: 5, D: 3, E: 3, F: 0, G: 0, H: 0, total: 11, snitt: 2.18, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2025, A: 0, B: 0, C: 7, D: 5, E: 4, F: 0, G: 0, H: 0, total: 16, snitt: 2.19, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO-2605', emnenavn: 'Fiskepatologi', studiepoeng: 10, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BIO-2605-1'],
            years: [
              { year: 2021, A: 5, B: 3, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 3, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 8, snitt: 4.38, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 3, B: 4, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 3.77, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2024, A: 0, B: 7, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.64, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2025, A: 0, B: 7, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.7, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'BIO-3503', emnenavn: 'Aquatic animal welfare', studiepoeng: 5, aar: 3, semester: 'vår',
            dbhEmnekoder: ['BIO-3503-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 9, H: 0, total: 9, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 0, total: 15, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 13, H: 0, total: 13, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2025, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO-3519', emnenavn: 'Parasites and epidemiology', studiepoeng: 10, aar: 4, semester: 'høst',
            dbhEmnekoder: ['BIO-3519-1'],
            years: [
              { year: 2021, A: 3, B: 7, C: 3, D: 3, E: 0, F: 0, G: 0, H: 0, total: 16, snitt: 3.62, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2022, A: 0, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2023, A: 0, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 10, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 5 },
              { year: 2025, A: 3, B: 4, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.91, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO-3607', emnenavn: 'Matvaretrygghet', studiepoeng: 10, aar: 4, semester: 'høst',
            dbhEmnekoder: ['BIO-3607-1'],
            years: [
              { year: 2021, A: 4, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.08, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 4, B: 6, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 4.4, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 7, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2025, A: 3, B: 3, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.75, strykprosent: 0, bestattprosent: null, skjult: 1 },
            ],
          },
          {
            emnekode: 'FSK-2010', emnenavn: 'Oppdrettsteknologi', studiepoeng: 10, aar: 4, semester: 'høst',
            dbhEmnekoder: ['FSK-2010-1'],
            years: [
              { year: 2021, A: 0, B: 10, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 14, snitt: 3.71, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2022, A: 0, B: 5, C: 7, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.42, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 0, B: 8, C: 4, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2024, A: 0, B: 0, C: 3, D: 6, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 2.33, strykprosent: 0, bestattprosent: null, skjult: 6 },
              { year: 2025, A: 0, B: 3, C: 8, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.27, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'AKV-3410', emnenavn: 'Profesjonskompetanse i akvamedisin III', studiepoeng: 5, aar: 4, semester: 'vår',
            dbhEmnekoder: [],
            years: [],
          },
          {
            emnekode: 'BIO-3602', emnenavn: 'Farmakologi', studiepoeng: 10, aar: 4, semester: 'vår',
            dbhEmnekoder: ['BIO-3602-1'],
            years: [
              { year: 2021, A: 4, B: 5, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 4.08, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2022, A: 0, B: 5, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 10, snitt: 3.5, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2023, A: 0, B: 4, C: 5, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.44, strykprosent: 0, bestattprosent: null, skjult: 3 },
              { year: 2024, A: 0, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 5, snitt: 4, strykprosent: 0, bestattprosent: null, skjult: 9 },
              { year: 2025, A: 0, B: 6, C: 3, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 3.67, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
          {
            emnekode: 'BIO-3613', emnenavn: 'Fiskevelferd i havbruk', studiepoeng: 5, aar: 4, semester: 'vår',
            dbhEmnekoder: ['BIO-3613-1'],
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 0, total: 15, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 1 },
              { year: 2023, A: 0, B: 0, C: 7, D: 4, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 2.64, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 0, B: 5, C: 6, D: 0, E: 0, F: 0, G: 0, H: 0, total: 11, snitt: 3.45, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2025, A: 0, B: 3, C: 5, D: 4, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 2.92, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO-3630', emnenavn: 'Helsekontroll og klinikk i havbruk', studiepoeng: 10, aar: 4, semester: 'vår',
            dbhEmnekoder: ['BIO-3630-1'], merknad: 'Praksisemne (feltkurs, ca. 10 dager) med helsekontroll på settefisk- og matfiskanlegg i samarbeid med ekstern fiskehelsetjeneste.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 8, H: 0, total: 8, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2022, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 15, H: 0, total: 15, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2023, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 12, H: 0, total: 12, snitt: null, strykprosent: null, bestattprosent: 100, skjult: 0 },
              { year: 2024, A: 12, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 12, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 0 },
              { year: 2025, A: 13, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 5, strykprosent: 0, bestattprosent: null, skjult: 0 },
            ],
          },
          {
            emnekode: 'BIO-3955', emnenavn: 'Mastergradsoppgave i akvamedisin', studiepoeng: 60, aar: 5, semester: 'helår',
            dbhEmnekoder: ['BIO-3955-1'], merknad: 'Hele 5. studieår (9. og 10. semester) er satt av til masteroppgaven.',
            years: [
              { year: 2021, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 0, snitt: null, strykprosent: null, bestattprosent: null, skjult: 4 },
              { year: 2022, A: 3, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 7, snitt: 4.43, strykprosent: 0, bestattprosent: null, skjult: 1 },
              { year: 2023, A: 5, B: 8, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 13, snitt: 4.38, strykprosent: 0, bestattprosent: null, skjult: 2 },
              { year: 2024, A: 4, B: 5, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.44, strykprosent: 0, bestattprosent: null, skjult: 4 },
              { year: 2025, A: 5, B: 4, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, total: 9, snitt: 4.56, strykprosent: 0, bestattprosent: null, skjult: 4 },
            ],
          },
        ],
        spesialiseringer: [
        ],
      },
    ],
  },
];
