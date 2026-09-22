// GENERERT av scripts/build-realtek-data.py – stub. Ikke rediger for hånd.
// Tom foreløpig: generatoren skriver over hele filen når REALTEK-tallene legges inn.
// Eksportnavnene er med vilje de samme som i landsamAdmissionData.ts, slik at
// generatoren kan gjenbrukes; registeret i faculties.ts gir dem REALTEK-navn.
import type { LandsamGroup } from './landsamAdmissionData';

export type { LandsamGroup, LandsamLevel } from './landsamAdmissionData';

export const LANDSAM_YEARS = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'] as const;

export const LANDSAM_GROUPS: LandsamGroup[] = [];
