import { EconomyComparison } from './EconomyComparison';
import { StaffComparison } from './StaffComparison';
import { ECON_UNITS } from '../data/economyData';
import { STAFF_INSTITUTIONS, STAFF_FACULTIES, STAFF_NMBU_FACULTIES } from '../data/staffData';
import type { FacultyMeta } from '../data/facultyMeta';

/**
 * Økonomi- og fagmiljøsidene (per fakultet og for hele NMBU). Egen modul, slik at økonomi- og tilsattdataene
 * lastes først når en av sidene åpnes.
 */
export function FacultyEconomyPage({ fac }: { fac: FacultyMeta }) {
  const fakUnits = STAFF_FACULTIES[fac.id] ?? [];
  const insts = new Set(fakUnits.map((u) => u.inst));
  return <EconomyComparison key={fac.id} units={ECON_UNITS.filter((u) => u.isNmbu || insts.has(u.inst))} hovedInst={fakUnits.filter((u) => u.hoved).map((u) => u.inst)} />;
}

export function FacultyStaffPage({ fac }: { fac: FacultyMeta }) {
  const fakUnits = STAFF_FACULTIES[fac.id] ?? [];
  const instCodes = new Set(fakUnits.map((u) => u.inst));
  const hovedInst = new Set(fakUnits.filter((u) => u.hoved).map((u) => u.inst));
  return (
    <StaffComparison key={fac.id} views={[
      { id: 'fakultet', label: 'Fakultet mot fakultet', units: fakUnits, unitLabel: (u) => `${u.kort} · ${u.navn}`,
        note: `${fac.label} mot fakultetene som eier konkurrentprogrammene i fakultetets sammenligninger (DBH 347). Fakulteter som bare eier svakere sammenligninger er ikke valgt fra start.` },
      { id: 'institusjon', label: 'Institusjon mot institusjon', unitLabel: (u) => u.kort,
        units: STAFF_INSTITUTIONS.filter((u) => instCodes.has(u.inst)).map((u) => ({ ...u, hoved: u.isNmbu || hovedInst.has(u.inst) })) },
    ]} />
  );
}

export function NmbuEconomyPage() {
  return <EconomyComparison units={ECON_UNITS} />;
}

export function NmbuStaffPage() {
  return (
    <StaffComparison views={[
      { id: 'institusjon', label: 'Institusjonene', units: STAFF_INSTITUTIONS, unitLabel: (u) => u.kort,
        note: 'Alle institusjonene som har minst ett konkurrentprogram i fakultetenes sammenligninger.' },
      { id: 'nmbu', label: 'NMBUs fakulteter', units: STAFF_NMBU_FACULTIES, unitLabel: (u) => u.navn },
    ]} />
  );
}
