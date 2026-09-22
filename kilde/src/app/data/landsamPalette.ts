// Farger for LANDSAM-opptaksanalysen. NMBU alltid mørkegrønn; kjente institusjoner får
// samme farger som i resten av appen; ukjente id-er får en deterministisk fallback.
import { LANDSAM_GROUPS } from './landsamAdmissionData';

export const LANDSAM_PALETTE: Record<string, string> = {
  nmbu:     '#025C4F', // NMBU green
  uio:      '#C8102E', // UiO red
  uib:      '#005CA9', // UiB blue
  ntnu:     '#00509E', // NTNU blue-dark
  uit:      '#003349', // UiT
  uis:      '#7B3FA0', // UiS purple
  uia:      '#E05C2A', // UiA orange
  oslomet:  '#4E7FC4', // OsloMet
  hvl:      '#1F6F8B', // HVL
  aho:      '#9B3D9B', // AHO
  nord:     '#5A9E3F', // Nord
  inn:      '#B8860B', // INN
  usn:      '#8B4513', // USN
  hivolda:  '#6B7B8C', // HVO
  bi:       '#1B2A6B', // BI
};

export const LANDSAM_FALLBACK_PALETTE = [
  '#2E7D32', '#1565C0', '#AD1457', '#EF6C00', '#6A1B9A', '#00838F', '#5D4037', '#9E9D24',
];

const ALL_IDS: string[] = LANDSAM_GROUPS.flatMap((g) => g.entries.map((e) => e.id));

export function landsamColorFor(id: string): string {
  if (id.startsWith('nmbu')) return LANDSAM_PALETTE.nmbu;
  const prefix = id.split('_')[0];
  if (LANDSAM_PALETTE[prefix]) return LANDSAM_PALETTE[prefix];
  const idx = Math.max(0, ALL_IDS.indexOf(id));
  return LANDSAM_FALLBACK_PALETTE[idx % LANDSAM_FALLBACK_PALETTE.length];
}
