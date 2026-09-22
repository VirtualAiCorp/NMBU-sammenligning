// Gjør det valgte fakultetet tilgjengelig for underkomponentene i de generiske
// fakultetsskjermene, slik at de slipper å ta imot `faculty` som prop i hvert ledd.
// Toppkomponentene (LandsamLanding, LandsamAdmissionAnalysis, LandsamCourseAnalysis)
// tar fortsatt imot `faculty` som prop og legger det ut her.
import { createContext, useContext } from 'react';
import { FACULTIES, type FacultyData } from './faculties';
import { landsamColorForGroups } from './landsamPalette';

export const FacultyContext = createContext<FacultyData>(FACULTIES.landsam);

export function useFaculty(): FacultyData {
  return useContext(FacultyContext);
}

/** Fargefunksjonen for fakultetet i konteksten. */
export function useFacultyColor(): (id: string) => string {
  return landsamColorForGroups(useFaculty().admissionGroups);
}
