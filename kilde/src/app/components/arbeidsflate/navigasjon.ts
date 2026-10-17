/**
 * Navigasjonsmodellen i arbeidsflaten: modulene gruppert under små overskrifter, ikon per fakultet og sidene for hele
 * NMBU. Modulnavn og ikoner hentes fra FAKULTETSMODULER (AppShells), så menyene i alle oppsett heter det samme.
 */
import { MENY, type LucideIcon } from '../../ikoner';
import { FAKULTETSMODULER, type ShellView } from '../AppShells';
import { ALL_FACULTY_IDS, FACULTY_META, type FacultyId } from '../../data/facultyMeta';
import type { Faculty } from '../FacultyLanding';

export type AfNav = (f: Faculty | null, view?: ShellView, gruppe?: string) => void;

export const UTEN_HH = import.meta.env.VITE_UTEN_HH === '1';
/** Fakultetene i arbeidsflaten. Som på den klassiske forsiden vises ikke Handelshøyskolen i bygget uten HH. */
export const FAKULTETER: FacultyId[] = ALL_FACULTY_IDS.filter((id) => id !== 'hh' || !UTEN_HH);

/** Åpner KI-chatten ved å trykke på den eksisterende knappen (KiChatKnapp eier tilstanden). */
export function apneKiChat() {
  const k = document.querySelector<HTMLButtonElement>('button[aria-label="Åpne KI-chatten"]');
  if (k) { k.click(); return; }
  document.querySelector<HTMLTextAreaElement>('[role="dialog"][aria-label="KI-chat"] textarea')?.focus();
}

export const FAKULTET_IKON: Record<FacultyId, LucideIcon> = {
  hh: MENY.Building2, landsam: MENY.Trees, realtek: MENY.Atom, biovit: MENY.Leaf, kbm: MENY.FlaskConical, mina: MENY.TreePine, vet: MENY.PawPrint,
};

/** Fakultetsnavnet uten «Fakultet for», til sidemenyen: «Realfag og teknologi». */
export const kortNavn = (id: FacultyId) => {
  const l = FACULTY_META[id].label.replace(/^Fakultet for /, '');
  return l.charAt(0).toUpperCase() + l.slice(1);
};

/** Kort beskrivelse per modul (ikonrutenettet og søket). */
export const MODUL_TEKST: Record<Exclude<ShellView, 'landing'>, string> = {
  analyse: 'Søkertall og poenggrenser 2020–2026',
  emner: 'Karakterindeks og emnetabeller',
  gjennomforing: 'Fullført, frafall og studenttall',
  studentene: 'Alder, utenlandske og utveksling',
  studiebarometer: 'Studentenes vurdering, skala 1–5',
  markedsstatus: 'Styrepapirer hos konkurrentene',
  konkurrenter: 'Én konkurrent om gangen mot NMBU',
  studiesentre: 'Samarbeidssteder for fysisk eksamen i hele landet',
  uhr2: 'UHR-kravet mot emnene, rettet versjon',
  arbeidsmarked: 'Lønn, ledighet og yrker',
  sokergrunnlag: 'Ungdomskull og videregående',
  bolig: 'Studentboliger og boligpriser',
  inntekt: 'Anslått resultatbasert finansiering',
  fagmiljo: 'Tilsatte og publisering',
  okonomi: 'Styringsindikatorer',
  intern: 'Passordbeskyttet',
  rangering: 'Utkast: handelshøyskolene rangert, passordbeskyttet',
  stat100: 'Til møtet om STAT100, passordbeskyttet',
};

export type Modul = (typeof FAKULTETSMODULER)[number];
export const modul = (v: ShellView): Modul => FAKULTETSMODULER.find((m) => m.view === v)!;

/** Modulgruppene i sidemenyen for et fakultet. «Intern» og «Konkurrentene» vises bare for Handelshøyskolen. */
export const MODULGRUPPER: { tittel: string; views: ShellView[] }[] = [
  { tittel: 'Oversikt', views: ['landing'] },
  { tittel: 'Opptak og studenter', views: ['analyse', 'emner', 'uhr2', 'gjennomforing', 'studentene', 'studiebarometer'] },
  { tittel: 'Marked og omverden', views: ['konkurrenter', 'studiesentre', 'markedsstatus', 'arbeidsmarked', 'sokergrunnlag', 'bolig'] },
  { tittel: 'Institusjonen', views: ['inntekt', 'fagmiljo', 'okonomi'] },
  { tittel: 'Intern', views: ['intern', 'rangering', 'stat100'] },
];

export const modulerFor = (id: FacultyId, views: ShellView[]) => views.map(modul).filter((m) => !m.kunFor || m.kunFor === id);

export const OPPRINNELIG_HH = { label: 'Opprinnelig HH-analyse', icon: MENY.Archive, tekst: 'Den manuelt kuraterte analysen fra Figma' };

/** Sidene for hele NMBU. */
export const NMBU_SIDER: { f: Faculty; label: string; icon: LucideIcon; tekst: string }[] = [
  { f: 'nmbu-marked', label: 'Markedet', icon: MENY.PieChart, tekst: 'Hele markedet: andeler, alle program og økonomilandskapet' },
  { f: 'nmbu-emner', label: 'Alle emner ved NMBU', icon: MENY.BookOpen, tekst: 'Karakterer i alle NMBUs emner' },
  { f: 'nmbu-fagmiljo', label: 'Fagmiljøet', icon: MENY.Microscope, tekst: 'Tilsatte og publisering, fakultet mot fakultet' },
  { f: 'nmbu-sokergrunnlag', label: 'Søkergrunnlaget', icon: MENY.Baby, tekst: 'Ungdomskullene per fylke fram mot 2045' },
  { f: 'nmbu-bolig', label: 'Bolig og studentboliger', icon: MENY.Home, tekst: 'Ås mot konkurrentenes studiesteder' },
  { f: 'nmbu-okonomi', label: 'Økonomi', icon: MENY.Landmark, tekst: 'Styringsindikatorer mot konkurrentene' },
];
/** Styringsinformasjon for hele NMBU: egne samlesider med fakultetene side om side (egen gruppe øverst i menyen). */
export const NMBU_STYRING: { f: Faculty; label: string; icon: LucideIcon; tekst: string }[] = [
  { f: 'nmbu-okonomi-drift', label: 'Økonomi og drift', icon: MENY.Wallet, tekst: 'Regnskap, finansiering, eksterne midler og bemanning per fakultet' },
  { f: 'nmbu-utdanning', label: 'Utdanning', icon: MENY.GraduationCap, tekst: 'Studiepoeng, gjennomføring, søkere og studieplasser per fakultet' },
];
export const NMBU_OVERSIKT = { label: 'Forside', icon: MENY.LayoutDashboard };
