// Pro-ikonene appen bruker. Navnet er eksportnavnet i Hugeicons (se hugeicons.com eller «./hent.sh sok <ord>»).
// Stil er valgfri; standard er stroke-rounded.  Stiler: stroke-rounded, solid-rounded, duotone-rounded
// Etter endring: kjør ./hent.sh og commit kilde/src/app/ikoner-pro.ts.
//
// Alle stroke-rounded-ikoner er gratis og ligger alt i @hugeicons/core-free-icons. Pro gir bare de andre stilene, så
// det er dem som hører hjemme her. kilde/src/app/ikoner.tsx henter dem med proEllers() (MENY) og viser strekikonet
// til de er hentet.
//
// Duotone-rounded i sidemenyen og modulkortene (oktober 2026): fakultetsmodulene, NMBU-sidene og styringssidene i
// AppShells.tsx og arbeidsflate/navigasjon.ts, tegnet av IkonRutenett/Listerad i arbeidsflate/Byggeklosser.tsx.
// Samme navn som i MENY i ikoner.tsx (kommentaren viser Lucide-navnet koden bruker).
const DUO = "duotone-rounded";
export const VALG = [
  { navn: "Archive03Icon", stil: DUO }, // Archive (Opprinnelig HH-analyse)
  { navn: "Atom02Icon", stil: DUO }, // Atom (REALTEK)
  { navn: "Baby01Icon", stil: DUO }, // Baby (Søkergrunnlaget)
  { navn: "BookOpen01Icon", stil: DUO }, // BookOpen (Emner og karakterer)
  { navn: "Briefcase01Icon", stil: DUO }, // Briefcase (Arbeidsmarkedet)
  { navn: "Building06Icon", stil: DUO }, // Building2 (HH, Konkurrentene)
  { navn: "Coins01Icon", stil: DUO }, // Coins (Inntekt)
  { navn: "TestTube01Icon", stil: DUO }, // FlaskConical (KBM)
  { navn: "Globe02Icon", stil: DUO }, // Globe2 (Markedsstatus)
  { navn: "Mortarboard02Icon", stil: DUO }, // GraduationCap (Gjennomføring, Utdanning)
  { navn: "Home03Icon", stil: DUO }, // Home (Bolig)
  { navn: "BankIcon", stil: DUO }, // Landmark (Økonomi)
  { navn: "Layers01Icon", stil: DUO }, // Layers (UHR-kartlegging 2.0)
  { navn: "DashboardSquare01Icon", stil: DUO }, // LayoutDashboard (NMBU-forsiden)
  { navn: "GridViewIcon", stil: DUO }, // LayoutGrid (Oversikt)
  { navn: "Leaf01Icon", stil: DUO }, // Leaf (BIOVIT)
  { navn: "SquareLock02Icon", stil: DUO }, // Lock (interne sider)
  { navn: "MapsLocation01Icon", stil: DUO }, // MapPinned (Studiesentre)
  { navn: "MicroscopeIcon", stil: DUO }, // Microscope (Fagmiljøet)
  { navn: "PawPrintIcon", stil: DUO }, // PawPrint (VET)
  { navn: "PieChartIcon", stil: DUO }, // PieChart (Markedet)
  { navn: "StarIcon", stil: DUO }, // Star (Studiebarometeret)
  { navn: "PineTreeIcon", stil: DUO }, // TreePine (MINA)
  { navn: "Tree06Icon", stil: DUO }, // Trees (LANDSAM)
  { navn: "TradeUpIcon", stil: DUO }, // TrendingUp (Opptak)
  { navn: "UserMultipleIcon", stil: DUO }, // Users (Studentene)
  { navn: "Wallet01Icon", stil: DUO }, // Wallet (Økonomi og drift)
];
