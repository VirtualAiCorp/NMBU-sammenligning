// GENERERT av scripts/build-completion.py 2026-09-23 – ikke rediger for hånd.
// Kilde: DBH/HKDIR tabell 707 (gjennomføring og frafall per startkull), 123 (registrerte, høst), 110 (nye), 104 (kandidater), 335 (studiepoeng iht. plan).
import type { LandsamLevel } from './landsamAdmissionData';

export interface CompletionCohort {
  aar: number; normertAar: number | null; nivaa: string | null; startkull: number; startkullKvinner: number;
  fullfortNormert: number; fullfortNormertKvinner: number; fullfort1: number; fullfort2: number;
  studerer: number; studerer1: number; studerer2: number; frafalt: number; frafalt1: number; frafalt2: number;
  /** DBH 706: grad på samme nivå ved samme institusjon. */ inst: CompletionRef | null;
  /** DBH 705: grad på samme nivå hvor som helst i sektoren; frafall = ute av høyere utdanning. */ sektor: CompletionRef | null;
}
export interface CompletionRef { fullfortNormert: number; fullfort1: number; fullfort2: number; frafalt: number; frafalt2: number; }
export interface CompletionYear {
  aar: number; registrerte: number | null; registrerteKvinner: number | null; nye: number | null; nyeKvinner: number | null;
  kandidater: number | null; kandidaterKvinner: number | null; spPlanlagt: number | null; spGjennomfort: number | null;
}
export interface CompletionProgram {
  entryId: string; shortName: string; institusjon: string; isNmbu: boolean; programnavn: string; dbhKoder: string[];
  kull: CompletionCohort[]; aar: CompletionYear[];
}
export interface CompletionGroup { id: string; label: string; level: LandsamLevel; nmbuIds: string[]; defaultIds: string[]; programs: CompletionProgram[]; }

export const COMPLETION_HENTET = '2026-09-23';

export const COMPLETION_GROUPS: CompletionGroup[] = [
  {
    id: 'veterinaer', label: 'Veterinærmedisin', level: 'master5', nmbuIds: ['nmbu_veterinaermedisin'], defaultIds: ['nmbu_veterinaermedisin'],
    programs: [
      {
        entryId: 'nmbu_veterinaermedisin', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Veterinærmedisin (profesjonsstudium)', dbhKoder: ['VET'],
        kull: [
        ],
        aar: [
          { aar: 2016, registrerte: null, registrerteKvinner: null, nye: null, nyeKvinner: null, kandidater: 57, kandidaterKvinner: 45, spPlanlagt: 19536.5, spGjennomfort: 18603.5 },
          { aar: 2017, registrerte: 427, registrerteKvinner: 380, nye: 66, nyeKvinner: 61, kandidater: 64, kandidaterKvinner: 37, spPlanlagt: 23695.5, spGjennomfort: 21653.5 },
          { aar: 2018, registrerte: 426, registrerteKvinner: 374, nye: 63, nyeKvinner: 53, kandidater: 64, kandidaterKvinner: 23, spPlanlagt: 22171, spGjennomfort: 21674.5 },
          { aar: 2019, registrerte: 426, registrerteKvinner: 369, nye: 72, nyeKvinner: 55, kandidater: 68, kandidaterKvinner: 59, spPlanlagt: 22429, spGjennomfort: 20607 },
          { aar: 2020, registrerte: 424, registrerteKvinner: 361, nye: 79, nyeKvinner: 66, kandidater: 70, kandidaterKvinner: 60, spPlanlagt: 20486, spGjennomfort: 21630.5 },
          { aar: 2021, registrerte: 435, registrerteKvinner: 373, nye: 77, nyeKvinner: 65, kandidater: 58, kandidaterKvinner: 14, spPlanlagt: 25805, spGjennomfort: 23440 },
          { aar: 2022, registrerte: 457, registrerteKvinner: 398, nye: 80, nyeKvinner: 71, kandidater: 61, kandidaterKvinner: 38, spPlanlagt: 24957.5, spGjennomfort: 22462 },
          { aar: 2023, registrerte: 497, registrerteKvinner: 430, nye: 89, nyeKvinner: 78, kandidater: 62, kandidaterKvinner: 56, spPlanlagt: 25434, spGjennomfort: 25251.5 },
          { aar: 2024, registrerte: 507, registrerteKvinner: 438, nye: 76, nyeKvinner: 65, kandidater: 62, kandidaterKvinner: 53, spPlanlagt: 27003, spGjennomfort: 25816.5 },
          { aar: 2025, registrerte: 514, registrerteKvinner: 440, nye: 76, nyeKvinner: 61, kandidater: 71, kandidaterKvinner: 59, spPlanlagt: 25949, spGjennomfort: 26033 },
        ],
      },
      {
        entryId: 'uio_medisin', shortName: 'UiO Medisin', institusjon: 'Universitetet i Oslo', isNmbu: false, programnavn: 'Medisin (profesjonsstudium)', dbhKoder: ['MEDISIN'],
        kull: [
          { aar: 2014, normertAar: 2020, nivaa: 'PR', startkull: 133, startkullKvinner: 91, fullfortNormert: 68, fullfortNormertKvinner: 46, fullfort1: 88, fullfort2: 91, studerer: 27, studerer1: 9, studerer2: 3, frafalt: 38, frafalt1: 36, frafalt2: 39, inst: { fullfortNormert: 68, fullfort1: 89, fullfort2: 92, frafalt: 39, frafalt2: 38 }, sektor: { fullfortNormert: 68, fullfort1: 89, fullfort2: 92, frafalt: 35, frafalt2: 37 } },
          { aar: 2015, normertAar: 2021, nivaa: 'PR', startkull: 137, startkullKvinner: 91, fullfortNormert: 53, fullfortNormertKvinner: 35, fullfort1: 79, fullfort2: 81, studerer: 40, studerer1: 12, studerer2: 7, frafalt: 44, frafalt1: 46, frafalt2: 49, inst: { fullfortNormert: 53, fullfort1: 80, fullfort2: 83, frafalt: 48, frafalt2: 52 }, sektor: { fullfortNormert: 53, fullfort1: 80, fullfort2: 84, frafalt: 40, frafalt2: 44 } },
          { aar: 2016, normertAar: 2022, nivaa: 'PR', startkull: 131, startkullKvinner: 92, fullfortNormert: 57, fullfortNormertKvinner: 38, fullfort1: 75, fullfort2: 85, studerer: 42, studerer1: 22, studerer2: 10, frafalt: 32, frafalt1: 34, frafalt2: 36, inst: { fullfortNormert: 58, fullfort1: 76, fullfort2: 87, frafalt: 35, frafalt2: 40 }, sektor: { fullfortNormert: 58, fullfort1: 76, fullfort2: 87, frafalt: 29, frafalt2: 31 } },
          { aar: 2017, normertAar: 2023, nivaa: 'PR', startkull: 119, startkullKvinner: 86, fullfortNormert: 68, fullfortNormertKvinner: 45, fullfort1: 104, fullfort2: 107, studerer: 44, studerer1: 8, studerer2: 5, frafalt: 7, frafalt1: 7, frafalt2: 7, inst: { fullfortNormert: 68, fullfort1: 104, fullfort2: 107, frafalt: 7, frafalt2: 8 }, sektor: { fullfortNormert: 68, fullfort1: 104, fullfort2: 107, frafalt: 5, frafalt2: 5 } },
          { aar: 2018, normertAar: 2024, nivaa: 'PR', startkull: 124, startkullKvinner: 82, fullfortNormert: 72, fullfortNormertKvinner: 43, fullfort1: 106, fullfort2: 0, studerer: 47, studerer1: 11, studerer2: 0, frafalt: 5, frafalt1: 7, frafalt2: 0, inst: { fullfortNormert: 72, fullfort1: 106, fullfort2: 0, frafalt: 9, frafalt2: 0 }, sektor: { fullfortNormert: 72, fullfort1: 106, fullfort2: 0, frafalt: 5, frafalt2: 0 } },
          { aar: 2019, normertAar: 2025, nivaa: 'PR', startkull: 115, startkullKvinner: 76, fullfortNormert: 73, fullfortNormertKvinner: 55, fullfort1: 0, fullfort2: 0, studerer: 34, studerer1: 0, studerer2: 0, frafalt: 8, frafalt1: 0, frafalt2: 0, inst: { fullfortNormert: 74, fullfort1: 0, fullfort2: 0, frafalt: 14, frafalt2: 0 }, sektor: { fullfortNormert: 74, fullfort1: 0, fullfort2: 0, frafalt: 6, frafalt2: 0 } },
        ],
        aar: [
          { aar: 2016, registrerte: null, registrerteKvinner: null, nye: null, nyeKvinner: null, kandidater: 188, kandidaterKvinner: 115, spPlanlagt: 65661, spGjennomfort: 62949 },
          { aar: 2017, registrerte: 1244, registrerteKvinner: 878, nye: 195, nyeKvinner: 140, kandidater: 179, kandidaterKvinner: 122, spPlanlagt: 67985, spGjennomfort: 64631 },
          { aar: 2018, registrerte: 1286, registrerteKvinner: 906, nye: 160, nyeKvinner: 112, kandidater: 189, kandidaterKvinner: 125, spPlanlagt: 69026, spGjennomfort: 66288 },
          { aar: 2019, registrerte: 1278, registrerteKvinner: 901, nye: 157, nyeKvinner: 96, kandidater: 205, kandidaterKvinner: 135, spPlanlagt: 71802, spGjennomfort: 69537 },
          { aar: 2020, registrerte: 1320, registrerteKvinner: 949, nye: 189, nyeKvinner: 144, kandidater: 186, kandidaterKvinner: 136, spPlanlagt: 72486, spGjennomfort: 70356 },
          { aar: 2021, registrerte: 1361, registrerteKvinner: 986, nye: 168, nyeKvinner: 122, kandidater: 160, kandidaterKvinner: 104, spPlanlagt: 74114, spGjennomfort: 72555 },
          { aar: 2022, registrerte: 1399, registrerteKvinner: 1008, nye: 161, nyeKvinner: 106, kandidater: 185, kandidaterKvinner: 138, spPlanlagt: 75485, spGjennomfort: 73098 },
          { aar: 2023, registrerte: 1441, registrerteKvinner: 1014, nye: 183, nyeKvinner: 116, kandidater: 206, kandidaterKvinner: 151, spPlanlagt: 78032, spGjennomfort: 75887 },
          { aar: 2024, registrerte: 1459, registrerteKvinner: 1015, nye: 188, nyeKvinner: 122, kandidater: 212, kandidaterKvinner: 155, spPlanlagt: 80607, spGjennomfort: 78128 },
          { aar: 2025, registrerte: 1497, registrerteKvinner: 1033, nye: 190, nyeKvinner: 132, kandidater: 229, kandidaterKvinner: 167, spPlanlagt: 81263, spGjennomfort: 78596 },
          { aar: 2026, registrerte: null, registrerteKvinner: null, nye: 86, nyeKvinner: 64, kandidater: null, kandidaterKvinner: null, spPlanlagt: null, spGjennomfort: null },
        ],
      },
      {
        entryId: 'uib_medisin', shortName: 'UiB Medisin', institusjon: 'Universitetet i Bergen', isNmbu: false, programnavn: 'Medisin (profesjonsstudium)', dbhKoder: ['PRMEDISIN'],
        kull: [
          { aar: 2014, normertAar: 2020, nivaa: 'PR', startkull: 179, startkullKvinner: 133, fullfortNormert: 63, fullfortNormertKvinner: 46, fullfort1: 139, fullfort2: 156, studerer: 101, studerer1: 24, studerer2: 6, frafalt: 15, frafalt1: 16, frafalt2: 17, inst: { fullfortNormert: 63, fullfort1: 141, fullfort2: 161, frafalt: 14, frafalt2: 13 }, sektor: { fullfortNormert: 63, fullfort1: 141, fullfort2: 161, frafalt: 0, frafalt2: 5 } },
          { aar: 2015, normertAar: 2021, nivaa: 'PR', startkull: 164, startkullKvinner: 124, fullfortNormert: 56, fullfortNormertKvinner: 50, fullfort1: 137, fullfort2: 149, studerer: 102, studerer1: 22, studerer2: 10, frafalt: 6, frafalt1: 5, frafalt2: 5, inst: { fullfortNormert: 56, fullfort1: 137, fullfort2: 149, frafalt: 7, frafalt2: 7 }, sektor: { fullfortNormert: 56, fullfort1: 137, fullfort2: 149, frafalt: 5, frafalt2: 4 } },
          { aar: 2016, normertAar: 2022, nivaa: 'PR', startkull: 173, startkullKvinner: 130, fullfortNormert: 52, fullfortNormertKvinner: 38, fullfort1: 140, fullfort2: 144, studerer: 106, studerer1: 15, studerer2: 10, frafalt: 15, frafalt1: 18, frafalt2: 19, inst: { fullfortNormert: 54, fullfort1: 142, fullfort2: 149, frafalt: 12, frafalt2: 13 }, sektor: { fullfortNormert: 54, fullfort1: 143, fullfort2: 150, frafalt: 3, frafalt2: 10 } },
          { aar: 2017, normertAar: 2023, nivaa: 'PR', startkull: 181, startkullKvinner: 123, fullfortNormert: 60, fullfortNormertKvinner: 43, fullfort1: 143, fullfort2: 160, studerer: 111, studerer1: 27, studerer2: 8, frafalt: 10, frafalt1: 11, frafalt2: 13, inst: { fullfortNormert: 60, fullfort1: 144, fullfort2: 161, frafalt: 11, frafalt2: 12 }, sektor: { fullfortNormert: 61, fullfort1: 145, fullfort2: 162, frafalt: 4, frafalt2: 6 } },
          { aar: 2018, normertAar: 2024, nivaa: 'PR', startkull: 170, startkullKvinner: 110, fullfortNormert: 64, fullfortNormertKvinner: 40, fullfort1: 143, fullfort2: 0, studerer: 96, studerer1: 14, studerer2: 0, frafalt: 10, frafalt1: 13, frafalt2: 0, inst: { fullfortNormert: 64, fullfort1: 146, fullfort2: 0, frafalt: 8, frafalt2: 0 }, sektor: { fullfortNormert: 64, fullfort1: 146, fullfort2: 0, frafalt: 0, frafalt2: 0 } },
          { aar: 2019, normertAar: 2025, nivaa: 'PR', startkull: 185, startkullKvinner: 135, fullfortNormert: 57, fullfortNormertKvinner: 37, fullfort1: 0, fullfort2: 0, studerer: 111, studerer1: 0, studerer2: 0, frafalt: 17, frafalt1: 0, frafalt2: 0, inst: { fullfortNormert: 57, fullfort1: 0, fullfort2: 0, frafalt: 12, frafalt2: 0 }, sektor: { fullfortNormert: 57, fullfort1: 0, fullfort2: 0, frafalt: 4, frafalt2: 0 } },
        ],
        aar: [
          { aar: 2016, registrerte: null, registrerteKvinner: null, nye: null, nyeKvinner: null, kandidater: 152, kandidaterKvinner: 94, spPlanlagt: 56608, spGjennomfort: 54251 },
          { aar: 2017, registrerte: 1012, registrerteKvinner: 711, nye: 148, nyeKvinner: 100, kandidater: 133, kandidaterKvinner: 80, spPlanlagt: 60582, spGjennomfort: 57555 },
          { aar: 2018, registrerte: 988, registrerteKvinner: 701, nye: 129, nyeKvinner: 80, kandidater: 170, kandidaterKvinner: 111, spPlanlagt: 57922.5, spGjennomfort: 57854 },
          { aar: 2019, registrerte: 1019, registrerteKvinner: 736, nye: 146, nyeKvinner: 105, kandidater: 153, kandidaterKvinner: 102, spPlanlagt: 55249, spGjennomfort: 53152 },
          { aar: 2020, registrerte: 1060, registrerteKvinner: 770, nye: 171, nyeKvinner: 126, kandidater: 148, kandidaterKvinner: 113, spPlanlagt: 57118, spGjennomfort: 55874 },
          { aar: 2021, registrerte: 1081, registrerteKvinner: 774, nye: 168, nyeKvinner: 125, kandidater: 147, kandidaterKvinner: 112, spPlanlagt: 61669, spGjennomfort: 59892 },
          { aar: 2022, registrerte: 1116, registrerteKvinner: 810, nye: 172, nyeKvinner: 129, kandidater: 163, kandidaterKvinner: 130, spPlanlagt: 62130, spGjennomfort: 60356 },
          { aar: 2023, registrerte: 1144, registrerteKvinner: 819, nye: 173, nyeKvinner: 121, kandidater: 160, kandidaterKvinner: 112, spPlanlagt: 62479, spGjennomfort: 61552 },
          { aar: 2024, registrerte: 1221, registrerteKvinner: 887, nye: 196, nyeKvinner: 150, kandidater: 157, kandidaterKvinner: 100, spPlanlagt: 65404, spGjennomfort: 63357.5 },
          { aar: 2025, registrerte: 1300, registrerteKvinner: 962, nye: 213, nyeKvinner: 165, kandidater: 156, kandidaterKvinner: 107, spPlanlagt: 68783, spGjennomfort: 65707.5 },
        ],
      },
      {
        entryId: 'ntnu_medisin', shortName: 'NTNU Medisin', institusjon: 'Norges teknisk-naturvitenskapelige universitet', isNmbu: false, programnavn: 'Medisin (profesjonsstudium)', dbhKoder: ['CMED'],
        kull: [
          { aar: 2014, normertAar: 2020, nivaa: 'PR', startkull: 119, startkullKvinner: 79, fullfortNormert: 68, fullfortNormertKvinner: 44, fullfort1: 96, fullfort2: 100, studerer: 39, studerer1: 9, studerer2: 5, frafalt: 12, frafalt1: 14, frafalt2: 14, inst: { fullfortNormert: 68, fullfort1: 100, fullfort2: 105, frafalt: 9, frafalt2: 7 }, sektor: { fullfortNormert: 68, fullfort1: 100, fullfort2: 105, frafalt: 3, frafalt2: 5 } },
          { aar: 2015, normertAar: 2021, nivaa: 'PR', startkull: 130, startkullKvinner: 86, fullfortNormert: 90, fullfortNormertKvinner: 60, fullfort1: 110, fullfort2: 117, studerer: 32, studerer1: 10, studerer2: 3, frafalt: 8, frafalt1: 10, frafalt2: 10, inst: { fullfortNormert: 90, fullfort1: 110, fullfort2: 117, frafalt: 8, frafalt2: 8 }, sektor: { fullfortNormert: 90, fullfort1: 110, fullfort2: 117, frafalt: 3, frafalt2: 6 } },
          { aar: 2016, normertAar: 2022, nivaa: 'PR', startkull: 137, startkullKvinner: 90, fullfortNormert: 97, fullfortNormertKvinner: 65, fullfort1: 120, fullfort2: 124, studerer: 29, studerer1: 5, studerer2: 0, frafalt: 11, frafalt1: 12, frafalt2: 12, inst: { fullfortNormert: 97, fullfort1: 120, fullfort2: 125, frafalt: 11, frafalt2: 10 }, sektor: { fullfortNormert: 97, fullfort1: 120, fullfort2: 125, frafalt: 6, frafalt2: 9 } },
          { aar: 2017, normertAar: 2023, nivaa: 'PR', startkull: 139, startkullKvinner: 92, fullfortNormert: 96, fullfortNormertKvinner: 62, fullfort1: 120, fullfort2: 124, studerer: 32, studerer1: 9, studerer2: 3, frafalt: 11, frafalt1: 10, frafalt2: 12, inst: { fullfortNormert: 97, fullfort1: 122, fullfort2: 128, frafalt: 7, frafalt2: 7 }, sektor: { fullfortNormert: 97, fullfort1: 122, fullfort2: 128, frafalt: 3, frafalt2: 5 } },
          { aar: 2018, normertAar: 2024, nivaa: 'PR', startkull: 140, startkullKvinner: 94, fullfortNormert: 97, fullfortNormertKvinner: 65, fullfort1: 118, fullfort2: 0, studerer: 33, studerer1: 11, studerer2: 0, frafalt: 10, frafalt1: 11, frafalt2: 0, inst: { fullfortNormert: 98, fullfort1: 122, fullfort2: 0, frafalt: 8, frafalt2: 0 }, sektor: { fullfortNormert: 98, fullfort1: 122, fullfort2: 0, frafalt: 4, frafalt2: 0 } },
          { aar: 2019, normertAar: 2025, nivaa: 'PR', startkull: 153, startkullKvinner: 113, fullfortNormert: 108, fullfortNormertKvinner: 77, fullfort1: 0, fullfort2: 0, studerer: 33, studerer1: 0, studerer2: 0, frafalt: 12, frafalt1: 0, frafalt2: 0, inst: { fullfortNormert: 109, fullfort1: 0, fullfort2: 0, frafalt: 17, frafalt2: 0 }, sektor: { fullfortNormert: 110, fullfort1: 0, fullfort2: 0, frafalt: 4, frafalt2: 0 } },
        ],
        aar: [
          { aar: 2016, registrerte: null, registrerteKvinner: null, nye: null, nyeKvinner: null, kandidater: 103, kandidaterKvinner: 70, spPlanlagt: 42639, spGjennomfort: 40173 },
          { aar: 2017, registrerte: 715, registrerteKvinner: 472, nye: 115, nyeKvinner: 76, kandidater: 111, kandidaterKvinner: 69, spPlanlagt: 40761.5, spGjennomfort: 38136.5 },
          { aar: 2018, registrerte: 757, registrerteKvinner: 509, nye: 107, nyeKvinner: 73, kandidater: 87, kandidaterKvinner: 49, spPlanlagt: 41711, spGjennomfort: 39886 },
          { aar: 2019, registrerte: 784, registrerteKvinner: 533, nye: 116, nyeKvinner: 87, kandidater: 114, kandidaterKvinner: 76, spPlanlagt: 43742, spGjennomfort: 40903 },
          { aar: 2020, registrerte: 822, registrerteKvinner: 562, nye: 110, nyeKvinner: 81, kandidater: 104, kandidaterKvinner: 69, spPlanlagt: 46312.5, spGjennomfort: 44378.5 },
          { aar: 2021, registrerte: 798, registrerteKvinner: 558, nye: 97, nyeKvinner: 68, kandidater: 113, kandidaterKvinner: 75, spPlanlagt: 46995, spGjennomfort: 44557.5 },
          { aar: 2022, registrerte: 817, registrerteKvinner: 577, nye: 111, nyeKvinner: 81, kandidater: 123, kandidaterKvinner: 81, spPlanlagt: 46860, spGjennomfort: 44310 },
          { aar: 2023, registrerte: 830, registrerteKvinner: 592, nye: 110, nyeKvinner: 81, kandidater: 124, kandidaterKvinner: 84, spPlanlagt: 48495, spGjennomfort: 45870 },
          { aar: 2024, registrerte: 865, registrerteKvinner: 619, nye: 110, nyeKvinner: 84, kandidater: 124, kandidaterKvinner: 83, spPlanlagt: 50295, spGjennomfort: 45832.5 },
          { aar: 2025, registrerte: 914, registrerteKvinner: 649, nye: 131, nyeKvinner: 97, kandidater: 132, kandidaterKvinner: 95, spPlanlagt: 50557.5, spGjennomfort: 45930 },
        ],
      },
      {
        entryId: 'uit_medisin', shortName: 'UiT Medisin', institusjon: 'UiT Norges arktiske universitet', isNmbu: false, programnavn: 'Medisin (profesjonsstudium)', dbhKoder: ['MEDISIN'],
        kull: [
          { aar: 2014, normertAar: 2020, nivaa: 'PR', startkull: 108, startkullKvinner: 71, fullfortNormert: 63, fullfortNormertKvinner: 42, fullfort1: 77, fullfort2: 79, studerer: 30, studerer1: 15, studerer2: 10, frafalt: 15, frafalt1: 16, frafalt2: 19, inst: { fullfortNormert: 64, fullfort1: 80, fullfort2: 84, frafalt: 8, frafalt2: 12 }, sektor: { fullfortNormert: 64, fullfort1: 81, fullfort2: 85, frafalt: 4, frafalt2: 9 } },
          { aar: 2015, normertAar: 2021, nivaa: 'PR', startkull: 119, startkullKvinner: 83, fullfortNormert: 71, fullfortNormertKvinner: 52, fullfort1: 93, fullfort2: 96, studerer: 42, studerer1: 17, studerer2: 6, frafalt: 6, frafalt1: 9, frafalt2: 17, inst: { fullfortNormert: 71, fullfort1: 93, fullfort2: 96, frafalt: 9, frafalt2: 18 }, sektor: { fullfortNormert: 71, fullfort1: 93, fullfort2: 96, frafalt: 3, frafalt2: 16 } },
          { aar: 2016, normertAar: 2022, nivaa: 'PR', startkull: 128, startkullKvinner: 89, fullfortNormert: 71, fullfortNormertKvinner: 50, fullfort1: 102, fullfort2: 102, studerer: 47, studerer1: 15, studerer2: 9, frafalt: 10, frafalt1: 11, frafalt2: 17, inst: { fullfortNormert: 71, fullfort1: 103, fullfort2: 104, frafalt: 7, frafalt2: 16 }, sektor: { fullfortNormert: 71, fullfort1: 103, fullfort2: 104, frafalt: 3, frafalt2: 11 } },
          { aar: 2017, normertAar: 2023, nivaa: 'PR', startkull: 107, startkullKvinner: 69, fullfortNormert: 74, fullfortNormertKvinner: 45, fullfort1: 83, fullfort2: 84, studerer: 24, studerer1: 13, studerer2: 7, frafalt: 9, frafalt1: 11, frafalt2: 16, inst: { fullfortNormert: 74, fullfort1: 84, fullfort2: 86, frafalt: 9, frafalt2: 16 }, sektor: { fullfortNormert: 74, fullfort1: 84, fullfort2: 86, frafalt: 6, frafalt2: 11 } },
          { aar: 2018, normertAar: 2024, nivaa: 'PR', startkull: 112, startkullKvinner: 76, fullfortNormert: 62, fullfortNormertKvinner: 38, fullfort1: 79, fullfort2: 0, studerer: 37, studerer1: 19, studerer2: 0, frafalt: 13, frafalt1: 14, frafalt2: 0, inst: { fullfortNormert: 62, fullfort1: 81, fullfort2: 0, frafalt: 15, frafalt2: 0 }, sektor: { fullfortNormert: 62, fullfort1: 81, fullfort2: 0, frafalt: 7, frafalt2: 0 } },
          { aar: 2019, normertAar: 2025, nivaa: 'PR', startkull: 127, startkullKvinner: 94, fullfortNormert: 73, fullfortNormertKvinner: 51, fullfort1: 0, fullfort2: 0, studerer: 38, studerer1: 0, studerer2: 0, frafalt: 16, frafalt1: 0, frafalt2: 0, inst: { fullfortNormert: 73, fullfort1: 0, fullfort2: 0, frafalt: 13, frafalt2: 0 }, sektor: { fullfortNormert: 73, fullfort1: 0, fullfort2: 0, frafalt: 4, frafalt2: 0 } },
        ],
        aar: [
          { aar: 2016, registrerte: null, registrerteKvinner: null, nye: null, nyeKvinner: null, kandidater: 81, kandidaterKvinner: 55, spPlanlagt: 31764, spGjennomfort: 30554 },
          { aar: 2017, registrerte: 633, registrerteKvinner: 436, nye: 87, nyeKvinner: 56, kandidater: 75, kandidaterKvinner: 49, spPlanlagt: 33246, spGjennomfort: 32736 },
          { aar: 2018, registrerte: 632, registrerteKvinner: 431, nye: 91, nyeKvinner: 63, kandidater: 86, kandidaterKvinner: 59, spPlanlagt: 34447, spGjennomfort: 33810 },
          { aar: 2019, registrerte: 654, registrerteKvinner: 452, nye: 96, nyeKvinner: 68, kandidater: 77, kandidaterKvinner: 50, spPlanlagt: 34131, spGjennomfort: 33130 },
          { aar: 2020, registrerte: 661, registrerteKvinner: 462, nye: 102, nyeKvinner: 78, kandidater: 101, kandidaterKvinner: 64, spPlanlagt: 37260, spGjennomfort: 36270 },
          { aar: 2021, registrerte: 695, registrerteKvinner: 480, nye: 112, nyeKvinner: 81, kandidater: 91, kandidaterKvinner: 60, spPlanlagt: 38923, spGjennomfort: 36510 },
          { aar: 2022, registrerte: 738, registrerteKvinner: 510, nye: 111, nyeKvinner: 84, kandidater: 92, kandidaterKvinner: 66, spPlanlagt: 37271.5, spGjennomfort: 36054.5 },
          { aar: 2023, registrerte: 777, registrerteKvinner: 536, nye: 135, nyeKvinner: 89, kandidater: 107, kandidaterKvinner: 70, spPlanlagt: 41666, spGjennomfort: 39016 },
          { aar: 2024, registrerte: 825, registrerteKvinner: 572, nye: 139, nyeKvinner: 91, kandidater: 85, kandidaterKvinner: 53, spPlanlagt: 48647.5, spGjennomfort: 45267.5 },
          { aar: 2025, registrerte: 897, registrerteKvinner: 621, nye: 136, nyeKvinner: 98, kandidater: 90, kandidaterKvinner: 56, spPlanlagt: 48200, spGjennomfort: 45787 },
        ],
      },
    ],
  },
  {
    id: 'dyrepleie', label: 'Dyrepleie', level: 'bachelor', nmbuIds: ['nmbu_dyrepleie'], defaultIds: ['nmbu_dyrepleie', 'nord_dyrepleie'],
    programs: [
      {
        entryId: 'nmbu_dyrepleie', shortName: 'NMBU', institusjon: 'Norges miljø- og biovitenskapelige universitet', isNmbu: true, programnavn: 'Dyrepleie (bachelor)', dbhKoder: ['B-DYR'],
        kull: [
          { aar: 2016, normertAar: 2019, nivaa: 'B3', startkull: 29, startkullKvinner: 27, fullfortNormert: 15, fullfortNormertKvinner: 14, fullfort1: 16, fullfort2: 16, studerer: 0, studerer1: 0, studerer2: 0, frafalt: 12, frafalt1: 12, frafalt2: 12, inst: { fullfortNormert: 15, fullfort1: 16, fullfort2: 16, frafalt: 13, frafalt2: 13 }, sektor: { fullfortNormert: 16, fullfort1: 21, fullfort2: 22, frafalt: 4, frafalt2: 0 } },
          { aar: 2017, normertAar: 2020, nivaa: 'B3', startkull: 50, startkullKvinner: 48, fullfortNormert: 38, fullfortNormertKvinner: 37, fullfort1: 39, fullfort2: 40, studerer: 6, studerer1: 6, studerer2: 5, frafalt: 6, frafalt1: 5, frafalt2: 5, inst: { fullfortNormert: 38, fullfort1: 39, fullfort2: 40, frafalt: 10, frafalt2: 10 }, sektor: { fullfortNormert: 38, fullfort1: 40, fullfort2: 41, frafalt: 4, frafalt2: 3 } },
          { aar: 2018, normertAar: 2021, nivaa: 'B3', startkull: 32, startkullKvinner: 31, fullfortNormert: 25, fullfortNormertKvinner: 25, fullfort1: 27, fullfort2: 27, studerer: 3, studerer1: 0, studerer2: 0, frafalt: 4, frafalt1: 4, frafalt2: 4, inst: { fullfortNormert: 25, fullfort1: 27, fullfort2: 27, frafalt: 5, frafalt2: 5 }, sektor: { fullfortNormert: 25, fullfort1: 27, fullfort2: 27, frafalt: 3, frafalt2: 3 } },
          { aar: 2019, normertAar: 2022, nivaa: 'B3', startkull: 30, startkullKvinner: 29, fullfortNormert: 19, fullfortNormertKvinner: 19, fullfort1: 19, fullfort2: 19, studerer: 6, studerer1: 3, studerer2: 3, frafalt: 5, frafalt1: 8, frafalt2: 8, inst: { fullfortNormert: 19, fullfort1: 19, fullfort2: 19, frafalt: 10, frafalt2: 11 }, sektor: { fullfortNormert: 19, fullfort1: 20, fullfort2: 21, frafalt: 0, frafalt2: 3 } },
          { aar: 2020, normertAar: 2023, nivaa: 'B3', startkull: 27, startkullKvinner: 25, fullfortNormert: 20, fullfortNormertKvinner: 20, fullfort1: 22, fullfort2: 22, studerer: 5, studerer1: 3, studerer2: 3, frafalt: 0, frafalt1: 0, frafalt2: 0, inst: { fullfortNormert: 20, fullfort1: 22, fullfort2: 22, frafalt: 5, frafalt2: 5 }, sektor: { fullfortNormert: 20, fullfort1: 22, fullfort2: 22, frafalt: 0, frafalt2: 0 } },
          { aar: 2021, normertAar: 2024, nivaa: 'B3', startkull: 28, startkullKvinner: 25, fullfortNormert: 18, fullfortNormertKvinner: 16, fullfort1: 19, fullfort2: 0, studerer: 4, studerer1: 3, studerer2: 0, frafalt: 6, frafalt1: 6, frafalt2: 0, inst: { fullfortNormert: 18, fullfort1: 19, fullfort2: 0, frafalt: 9, frafalt2: 0 }, sektor: { fullfortNormert: 18, fullfort1: 19, fullfort2: 0, frafalt: 4, frafalt2: 0 } },
          { aar: 2022, normertAar: 2025, nivaa: 'B3', startkull: 31, startkullKvinner: 29, fullfortNormert: 21, fullfortNormertKvinner: 21, fullfort1: 0, fullfort2: 0, studerer: 5, studerer1: 0, studerer2: 0, frafalt: 5, frafalt1: 0, frafalt2: 0, inst: { fullfortNormert: 21, fullfort1: 0, fullfort2: 0, frafalt: 7, frafalt2: 0 }, sektor: { fullfortNormert: 21, fullfort1: 0, fullfort2: 0, frafalt: 0, frafalt2: 0 } },
        ],
        aar: [
          { aar: 2016, registrerte: null, registrerteKvinner: null, nye: null, nyeKvinner: null, kandidater: null, kandidaterKvinner: null, spPlanlagt: 1880, spGjennomfort: 1790 },
          { aar: 2017, registrerte: 68, registrerteKvinner: 64, nye: 31, nyeKvinner: 0, kandidater: 18, kandidaterKvinner: 0, spPlanlagt: 3910, spGjennomfort: 3660 },
          { aar: 2018, registrerte: 69, registrerteKvinner: 0, nye: 24, nyeKvinner: 0, kandidater: 18, kandidaterKvinner: 0, spPlanlagt: 3770, spGjennomfort: 3570 },
          { aar: 2019, registrerte: 78, registrerteKvinner: 0, nye: 26, nyeKvinner: 0, kandidater: 16, kandidaterKvinner: 0, spPlanlagt: 4280, spGjennomfort: 3960 },
          { aar: 2020, registrerte: 76, registrerteKvinner: 73, nye: 25, nyeKvinner: 0, kandidater: 19, kandidaterKvinner: 0, spPlanlagt: 4147, spGjennomfort: 4172 },
          { aar: 2021, registrerte: 68, registrerteKvinner: 63, nye: 24, nyeKvinner: 21, kandidater: 25, kandidaterKvinner: 0, spPlanlagt: 4407.5, spGjennomfort: 4166 },
          { aar: 2022, registrerte: 77, registrerteKvinner: 71, nye: 24, nyeKvinner: 0, kandidater: 20, kandidaterKvinner: 0, spPlanlagt: 4484.5, spGjennomfort: 4106.5 },
          { aar: 2023, registrerte: 76, registrerteKvinner: 67, nye: 26, nyeKvinner: 22, kandidater: 20, kandidaterKvinner: 0, spPlanlagt: 4597, spGjennomfort: 4302 },
          { aar: 2024, registrerte: 85, registrerteKvinner: 78, nye: 29, nyeKvinner: 26, kandidater: 19, kandidaterKvinner: 16, spPlanlagt: 4801, spGjennomfort: 4391 },
          { aar: 2025, registrerte: 97, registrerteKvinner: 87, nye: 41, nyeKvinner: 38, kandidater: 22, kandidaterKvinner: 0, spPlanlagt: 5015, spGjennomfort: 4465 },
        ],
      },
      {
        entryId: 'nord_dyrepleie', shortName: 'Nord', institusjon: 'Nord universitet', isNmbu: false, programnavn: 'Dyrepleie (bachelor)', dbhKoder: ['BADYR'],
        kull: [
          { aar: 2016, normertAar: 2019, nivaa: 'B3', startkull: 35, startkullKvinner: 34, fullfortNormert: 16, fullfortNormertKvinner: 15, fullfort1: 21, fullfort2: 23, studerer: 9, studerer1: 4, studerer2: 0, frafalt: 10, frafalt1: 10, frafalt2: 10, inst: { fullfortNormert: 16, fullfort1: 21, fullfort2: 23, frafalt: 11, frafalt2: 11 }, sektor: { fullfortNormert: 16, fullfort1: 22, fullfort2: 25, frafalt: 7, frafalt2: 5 } },
          { aar: 2017, normertAar: 2020, nivaa: 'B3', startkull: 38, startkullKvinner: 37, fullfortNormert: 27, fullfortNormertKvinner: 27, fullfort1: 28, fullfort2: 28, studerer: 0, studerer1: 0, studerer2: 0, frafalt: 9, frafalt1: 9, frafalt2: 9, inst: { fullfortNormert: 27, fullfort1: 28, fullfort2: 28, frafalt: 9, frafalt2: 10 }, sektor: { fullfortNormert: 27, fullfort1: 30, fullfort2: 30, frafalt: 6, frafalt2: 6 } },
          { aar: 2018, normertAar: 2021, nivaa: 'B3', startkull: 28, startkullKvinner: 27, fullfortNormert: 23, fullfortNormertKvinner: 23, fullfort1: 23, fullfort2: 23, studerer: 0, studerer1: 0, studerer2: 0, frafalt: 4, frafalt1: 4, frafalt2: 4, inst: { fullfortNormert: 23, fullfort1: 23, fullfort2: 23, frafalt: 5, frafalt2: 5 }, sektor: { fullfortNormert: 23, fullfort1: 23, fullfort2: 24, frafalt: 4, frafalt2: 4 } },
          { aar: 2019, normertAar: 2022, nivaa: 'B3', startkull: 33, startkullKvinner: 33, fullfortNormert: 29, fullfortNormertKvinner: 29, fullfort1: 29, fullfort2: 29, studerer: 0, studerer1: 0, studerer2: 0, frafalt: 4, frafalt1: 4, frafalt2: 4, inst: { fullfortNormert: 29, fullfort1: 29, fullfort2: 29, frafalt: 4, frafalt2: 4 }, sektor: { fullfortNormert: 29, fullfort1: 30, fullfort2: 30, frafalt: 3, frafalt2: 3 } },
          { aar: 2020, normertAar: 2023, nivaa: 'B3', startkull: 47, startkullKvinner: 45, fullfortNormert: 28, fullfortNormertKvinner: 28, fullfort1: 28, fullfort2: 30, studerer: 7, studerer1: 3, studerer2: 0, frafalt: 12, frafalt1: 16, frafalt2: 15, inst: { fullfortNormert: 28, fullfort1: 28, fullfort2: 30, frafalt: 14, frafalt2: 17 }, sektor: { fullfortNormert: 29, fullfort1: 31, fullfort2: 34, frafalt: 9, frafalt2: 11 } },
          { aar: 2021, normertAar: 2024, nivaa: 'B3', startkull: 43, startkullKvinner: 42, fullfortNormert: 28, fullfortNormertKvinner: 28, fullfort1: 31, fullfort2: 0, studerer: 5, studerer1: 0, studerer2: 0, frafalt: 10, frafalt1: 10, frafalt2: 0, inst: { fullfortNormert: 28, fullfort1: 31, fullfort2: 0, frafalt: 10, frafalt2: 0 }, sektor: { fullfortNormert: 28, fullfort1: 32, fullfort2: 0, frafalt: 7, frafalt2: 0 } },
          { aar: 2022, normertAar: 2025, nivaa: 'B3', startkull: 47, startkullKvinner: 46, fullfortNormert: 11, fullfortNormertKvinner: 11, fullfort1: 0, fullfort2: 0, studerer: 17, studerer1: 0, studerer2: 0, frafalt: 19, frafalt1: 0, frafalt2: 0, inst: { fullfortNormert: 11, fullfort1: 0, fullfort2: 0, frafalt: 23, frafalt2: 0 }, sektor: { fullfortNormert: 11, fullfort1: 0, fullfort2: 0, frafalt: 15, frafalt2: 0 } },
        ],
        aar: [
          { aar: 2016, registrerte: null, registrerteKvinner: null, nye: null, nyeKvinner: null, kandidater: null, kandidaterKvinner: null, spPlanlagt: 2750, spGjennomfort: 2300 },
          { aar: 2017, registrerte: 89, registrerteKvinner: 86, nye: 33, nyeKvinner: 0, kandidater: null, kandidaterKvinner: null, spPlanlagt: 4300, spGjennomfort: 3890 },
          { aar: 2018, registrerte: 90, registrerteKvinner: 0, nye: 26, nyeKvinner: 0, kandidater: 21, kandidaterKvinner: 0, spPlanlagt: 4792.5, spGjennomfort: 4445 },
          { aar: 2019, registrerte: 94, registrerteKvinner: 0, nye: 29, nyeKvinner: 0, kandidater: 24, kandidaterKvinner: 0, spPlanlagt: 4910, spGjennomfort: 4705 },
          { aar: 2020, registrerte: 106, registrerteKvinner: 0, nye: 41, nyeKvinner: 0, kandidater: 26, kandidaterKvinner: 0, spPlanlagt: 5545, spGjennomfort: 5260 },
          { aar: 2021, registrerte: 116, registrerteKvinner: 0, nye: 41, nyeKvinner: 0, kandidater: 24, kandidaterKvinner: 0, spPlanlagt: 6322.5, spGjennomfort: 5550 },
          { aar: 2022, registrerte: 126, registrerteKvinner: 0, nye: 47, nyeKvinner: 0, kandidater: 29, kandidaterKvinner: 0, spPlanlagt: 6912.5, spGjennomfort: 5392.5 },
          { aar: 2023, registrerte: 123, registrerteKvinner: 119, nye: 53, nyeKvinner: 0, kandidater: 28, kandidaterKvinner: 0, spPlanlagt: 6407.5, spGjennomfort: 5825 },
          { aar: 2024, registrerte: 112, registrerteKvinner: 108, nye: 43, nyeKvinner: 0, kandidater: 28, kandidaterKvinner: 0, spPlanlagt: 5532.5, spGjennomfort: 4712.5 },
          { aar: 2025, registrerte: 147, registrerteKvinner: 142, nye: 55, nyeKvinner: 0, kandidater: 14, kandidaterKvinner: 0, spPlanlagt: 7205, spGjennomfort: 6525 },
        ],
      },
    ],
  },
];
