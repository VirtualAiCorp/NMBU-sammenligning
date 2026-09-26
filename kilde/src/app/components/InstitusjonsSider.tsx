import { EconomyComparison } from './EconomyComparison';
import { StaffComparison } from './StaffComparison';
import { ECON_UNITS } from '../data/economyData';
import { STAFF_INSTITUTIONS, STAFF_FACULTIES, STAFF_NMBU_FACULTIES } from '../data/staffData';
import type { FacultyMeta } from '../data/facultyMeta';
import { FACULTY_META } from '../data/facultyMeta';
import { Forskningsfinansiering } from './Forskningsfinansiering';
import { NmbuProduksjon } from './NmbuProduksjon';

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
  const nmbuFak = fakUnits.find((u) => u.isNmbu)?.fakultetskode;
  // Forskningsfinansiering: NMBU og fakultetet først, så institusjonene i fakultetets sammenligninger
  const forskEnheter: [string, string, boolean][] = [
    ['1173', 'NMBU (hele)', true],
    ...(nmbuFak ? [[`1173_${nmbuFak}`, `NMBU ${fac.shortLabel}`, true] as [string, string, boolean]] : []),
    ...STAFF_INSTITUTIONS.filter((u) => !u.isNmbu && instCodes.has(u.inst)).map((u): [string, string, boolean] => [u.inst, u.kort, false]),
  ];
  return (
    <>
    <StaffComparison key={fac.id} views={[
      { id: 'fakultet', label: 'Fakultet mot fakultet', units: fakUnits, unitLabel: (u) => `${u.kort} · ${u.navn}`,
        note: `${fac.label} mot fakultetene som eier konkurrentprogrammene i fakultetets sammenligninger (DBH 347). Fakulteter som bare eier svakere sammenligninger er ikke valgt fra start.` },
      { id: 'institusjon', label: 'Institusjon mot institusjon', unitLabel: (u) => u.kort,
        units: STAFF_INSTITUTIONS.filter((u) => instCodes.has(u.inst)).map((u) => ({ ...u, hoved: u.isNmbu || hovedInst.has(u.inst) })) },
    ]} />
    <Forskningsfinansiering enheter={forskEnheter} visOkonomi={fac.id === 'hh'} />
    </>
  );
}

export function NmbuEconomyPage() {
  return (
    <>
      <EconomyComparison units={ECON_UNITS} />
      <NmbuProduksjon />
    </>
  );
}

export function NmbuStaffPage() {
  return (
    <>
    <StaffComparison views={[
      { id: 'institusjon', label: 'Institusjonene', units: STAFF_INSTITUTIONS, unitLabel: (u) => u.kort,
        note: 'Alle institusjonene som har minst ett konkurrentprogram i fakultetenes sammenligninger.' },
      { id: 'nmbu', label: 'NMBUs fakulteter', units: STAFF_NMBU_FACULTIES, unitLabel: (u) => u.navn },
    ]} />
    <Forskningsfinansiering tittel="Forskningsfinansiering: institusjonene" enheter={STAFF_INSTITUTIONS.map((u): [string, string, boolean] => [u.inst, u.kort, u.isNmbu])} />
    <Forskningsfinansiering tittel="Forskningsfinansiering: NMBUs fakulteter" enheter={STAFF_NMBU_FACULTIES.filter((u) => u.fakultetskode).map((u): [string, string, boolean] => [`1173_${u.fakultetskode}`, Object.values(FACULTY_META).find((m) => m.label === u.navn)?.shortLabel ?? u.navn, false]).concat([['1173_ikkeFordelt', 'Ikke fordelt (NMBU sentralt)', false]])} />
    </>
  );
}
