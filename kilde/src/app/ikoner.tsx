/**
 * Ikonene i hele appen (§62 i docs/status-og-metode.md). Mellomlag mellom koden og Hugeicons.
 *
 * Koden brukte lucide-react fram til oktober 2026. For at ingen komponent skulle måtte skrives om, eksporterer denne
 * fila komponenter med de SAMME NAVNENE som Lucide-ikonene koden brukte (TrendingUp, BookOpen …), men tegnet med
 * <HugeiconsIcon> og stroke-rounded-ikoner fra @hugeicons/core-free-icons (gratis). Typen LucideIcon finnes fortsatt
 * (alias for Ikon), så eksisterende typer virker som før.
 *
 * Størrelse: som i Lucide er standard 24 px, men width/height settes som SVG-attributter, så Tailwind-klasser som
 * w-4 h-4 (og size-4 i ui-komponentene) vinner over dem. Ikonet arver altså størrelsen fra className når size ikke
 * er satt. Strek: Hugeicons sin egen (1,5). Sender koden strokeWidth, brukes den, men aldri på ikoner med fylte
 * flater (strek() under): HugeiconsIcon legger ellers strek på alle deler og tetter hullene i fylte ikoner.
 *
 * Sidemenyen og modulkortene (MENY nederst) bruker Pro-ikoner i duotone-rounded via proEllers(): til brukeren har
 * kjørt `cd scripts/hugeicons-pro && ./hent.sh` (som skriver ikoner-pro.ts) vises det vanlige strekikonet. Bygget
 * trenger aldri lisensnøkkelen eller npm.hugeicons.com.
 *
 * Nytt ikon: finn eksportnavnet i node_modules/@hugeicons/core-free-icons (eller på hugeicons.com), legg det til i
 * importen, i tabellen og som en linje under. Skal det i menyen, legg det også i MENY og i
 * scripts/hugeicons-pro/valg.mjs.
 *
 * Mappingen Lucide → Hugeicons (stroke-rounded). * = også i MENY (duotone-rounded når Pro-ikonene er hentet).
 *
 *   Lucide              Hugeicons                       Lucide              Hugeicons
 *   ------------------  ------------------------------  ------------------  ------------------------------
 *   AlertCircle         AlertCircleIcon                 Lock *              SquareLock02Icon
 *   AlertTriangle       Alert02Icon                     Map                 MapsIcon
 *   Archive *           Archive03Icon                   MapPin              Location01Icon
 *   Armchair            ArmchairIcon                    MapPinOff           LocationOffline01Icon
 *   ArrowDown           ArrowDown02Icon                 MapPinned *         MapsLocation01Icon
 *   ArrowLeft           ArrowLeft02Icon                 Maximize2           ArrowExpand01Icon
 *   ArrowRight          ArrowRight02Icon                Menu                Menu01Icon
 *   ArrowUp             ArrowUp02Icon                   MessageCircle       Message01Icon
 *   ArrowUpDown         ArrowUpDownIcon                 Microscope *        MicroscopeIcon
 *   ArrowUpRight        ArrowUpRight01Icon              Minimize2           ArrowShrink02Icon
 *   Atom *              Atom02Icon                      Minus, MinusIcon    MinusSignIcon
 *   Award               Award05Icon                     MinusCircle         MinusSignCircleIcon
 *   Baby *              Baby01Icon                      Monitor             ComputerIcon
 *   Banknote            Money03Icon                     Moon                Moon02Icon
 *   BarChart2           ChartColumnIcon                 MoreHorizontal(Icon) MoreHorizontalIcon
 *   BarChart3           Analytics01Icon                 Newspaper           News01Icon
 *   BookMarked          BookBookmark01Icon              PanelLeft(Icon)     SidebarLeftIcon
 *   BookOpen *          BookOpen01Icon                  PanelLeftClose      PanelLeftCloseIcon
 *   Briefcase *         Briefcase01Icon                 PanelLeftOpen       PanelLeftOpenIcon
 *   Building2 *         Building06Icon                  PanelRight          SidebarRightIcon
 *   Calculator          Calculator01Icon                PanelRightClose     PanelRightCloseIcon
 *   CalendarClock       CalendarClockIcon               PanelTop            LayoutTopIcon
 *   Check, CheckIcon    Tick02Icon                      PanelsTopLeft       Layout01Icon
 *   CheckCircle(2)      CheckmarkCircle02Icon           PawPrint *          PawPrintIcon
 *   ChevronDown(Icon)   ArrowDown01Icon                 PieChart *          PieChartIcon
 *   ChevronLeft(Icon)   ArrowLeft01Icon                 PiggyBank           PiggyBankIcon
 *   ChevronRight(Icon)  ArrowRight01Icon                Presentation        Presentation01Icon
 *   ChevronUp(Icon)     ArrowUp01Icon                   Quote               QuoteDownIcon
 *   ChevronsUpDown      UnfoldMoreIcon                  Repeat              RepeatIcon
 *   CircleDot           CircleDotIcon                   RotateCcw           RefreshIcon
 *   CircleIcon          CircleIcon                      Scale               BalanceScaleIcon
 *   ClipboardList       TaskDaily01Icon                 ScatterChart        ChartScatterIcon
 *   Clock               Clock01Icon                     School              School01Icon
 *   Coins *             Coins01Icon                     Search(Icon)        Search01Icon
 *   Columns3            LayoutThreeColumnIcon           Send                SentIcon
 *   Command             CommandIcon                     ShieldAlert         SecurityWarningIcon
 *   Compass             CompassIcon                     ShieldCheck         SecurityCheckIcon
 *   CornerDownLeft      CornerDownLeftIcon              SlidersHorizontal   FilterHorizontalIcon
 *   Download            Download04Icon                  Smartphone          SmartPhone01Icon
 *   ExternalLink        LinkSquare02Icon                Sparkles            SparklesIcon
 *   Eye                 ViewIcon                        Star *              StarIcon
 *   FileText            File02Icon                      Sun                 Sun03Icon
 *   Filter              FilterIcon                      Table2              TableIcon
 *   FlaskConical *      TestTube01Icon                  Tablet              Tablet01Icon
 *   GalleryVerticalEnd  GalleryVerticalEndIcon          Target              Target03Icon
 *   Globe2 *            Globe02Icon                     TreePine *          PineTreeIcon
 *   GraduationCap *     Mortarboard02Icon               Trees *             Tree06Icon
 *   GripVerticalIcon    DragDropVerticalIcon            TrendingDown        TradeDownIcon
 *   HelpCircle          HelpCircleIcon                  TrendingUp *        TradeUpIcon
 *   Home *              Home03Icon                      Trophy              ChampionIcon
 *   Info                InformationCircleIcon           Users *             UserMultipleIcon
 *   Landmark *          BankIcon                        Wallet *            Wallet01Icon
 *   Layers *            Layers01Icon                    Wifi                Wifi01Icon
 *   LayoutDashboard *   DashboardSquare01Icon           Wrench              Wrench01Icon
 *   LayoutGrid *        GridViewIcon                    X, XIcon            Cancel01Icon
 *   Leaf *              Leaf01Icon
 *   Lightbulb           Idea01Icon
 *   Link2               Link02Icon
 *   ListOrdered         LeftToRightListNumberIcon
 *   Loader2             Loading03Icon
 */
import { forwardRef, type ForwardRefExoticComponent, type RefAttributes, type SVGProps } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  Alert02Icon, AlertCircleIcon, Analytics01Icon, Archive03Icon, ArmchairIcon, ArrowDown01Icon, ArrowDown02Icon,
  ArrowExpand01Icon, ArrowLeft01Icon, ArrowLeft02Icon, ArrowRight01Icon, ArrowRight02Icon, ArrowShrink02Icon,
  ArrowUp01Icon, ArrowUp02Icon, ArrowUpDownIcon, ArrowUpRight01Icon, Atom02Icon, Award05Icon, Baby01Icon,
  BalanceScaleIcon, BankIcon, BookBookmark01Icon, BookOpen01Icon, Briefcase01Icon, Building06Icon, Calculator01Icon,
  CalendarClockIcon, Cancel01Icon, ChampionIcon, ChartColumnIcon, ChartScatterIcon, CheckmarkCircle02Icon,
  CircleDotIcon, CircleIcon as CircleData, Clock01Icon, Coins01Icon, CommandIcon, CompassIcon, ComputerIcon,
  CornerDownLeftIcon, DashboardSquare01Icon, Download04Icon, DragDropVerticalIcon, File02Icon, FilterHorizontalIcon,
  FilterIcon, GalleryVerticalEndIcon, Globe02Icon, GridViewIcon, HelpCircleIcon, Home03Icon, Idea01Icon,
  InformationCircleIcon, Layers01Icon, Layout01Icon, LayoutThreeColumnIcon, LayoutTopIcon, Leaf01Icon,
  LeftToRightListNumberIcon, Link02Icon, LinkSquare02Icon, Loading03Icon, Location01Icon, LocationOffline01Icon,
  MapsIcon, MapsLocation01Icon, Menu01Icon, Message01Icon, MicroscopeIcon, MinusSignCircleIcon, MinusSignIcon,
  Money03Icon, Moon02Icon, MoreHorizontalIcon as MoreHorizontalData, Mortarboard02Icon, News01Icon, PanelLeftCloseIcon, PanelLeftOpenIcon,
  PanelRightCloseIcon, PawPrintIcon, PieChartIcon, PiggyBankIcon, PineTreeIcon, Presentation01Icon, QuoteDownIcon,
  RefreshIcon, RepeatIcon, School01Icon, Search01Icon, SecurityCheckIcon, SecurityWarningIcon, SentIcon,
  SidebarLeftIcon, SidebarRightIcon, SmartPhone01Icon, SparklesIcon, SquareLock02Icon, StarIcon, Sun03Icon,
  TableIcon, Tablet01Icon, Target03Icon, TaskDaily01Icon, TestTube01Icon, Tick02Icon, TradeDownIcon, TradeUpIcon,
  Tree06Icon, UnfoldMoreIcon, UserMultipleIcon, ViewIcon, Wallet01Icon, Wifi01Icon, Wrench01Icon,
} from '@hugeicons/core-free-icons';
import * as pro from './ikoner-pro';

/** Ikondata (det <HugeiconsIcon icon={…} /> tar imot). */
export type IkonData = IconSvgElement;

/** Props som Lucide-ikonene tok imot, og som koden fortsatt sender. */
export type IkonProps = Omit<SVGProps<SVGSVGElement>, 'ref' | 'strokeWidth'> & {
  size?: number | string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
};

/** Et ikon som komponent: <Ikon className="w-4 h-4" />. */
export type Ikon = ForwardRefExoticComponent<IkonProps & RefAttributes<SVGSVGElement>>;
/** Gammelt navn fra lucide-react, beholdt så eksisterende typer virker. */
export type LucideIcon = Ikon;
export type LucideProps = IkonProps;

/** Har ikonet en fylt flate? (Pro duotone/solid og noen få gratisikoner.) */
export function erFylt(ikon: IkonData): boolean {
  return ikon.some(([, a]) => {
    const fill = (a as Record<string, unknown>).fill;
    return typeof fill === 'string' && fill !== 'none';
  });
}

/**
 * strokeWidth for et ikon: undefined for ikoner med fylte deler. HugeiconsIcon legger strek på ALLE deler når den får
 * strokeWidth, og på en fylt flate tetter det hullene eller gjør ikonet klumpete (samme regel som i simuleringsverktøyet).
 */
export function strek(ikon: IkonData, bredde: number | undefined): number | undefined {
  return bredde === undefined || erFylt(ikon) ? undefined : bredde;
}

/**
 * Et Pro-ikon fra ikoner-pro.ts når det er hentet (scripts/hugeicons-pro, ./hent.sh), ellers gratisikonet. Slik kan
 * koden be om duotone-varianten før brukeren har kjørt skriptet, og bygget feiler aldri på et ikon som mangler.
 */
export function proEllers(navn: string, reserve: IkonData): IkonData {
  return (pro as unknown as Record<string, IkonData | undefined>)[navn] ?? reserve;
}

/** Lager en ikonkomponent med Lucide-grensesnittet av Hugeicons-data. */
function lag(data: IkonData, visningsnavn: string): Ikon {
  const K = forwardRef<SVGSVGElement, IkonProps>(({ size, strokeWidth, absoluteStrokeWidth, ...rest }, ref) => {
    const merket = rest['aria-label'] !== undefined || rest['aria-labelledby'] !== undefined || rest.title !== undefined;
    return (
      <HugeiconsIcon
        ref={ref}
        icon={data}
        size={size ?? 24}
        strokeWidth={strek(data, strokeWidth === undefined ? undefined : Number(strokeWidth))}
        absoluteStrokeWidth={absoluteStrokeWidth}
        aria-hidden={merket ? undefined : true}
        role={rest.title !== undefined && rest.role === undefined ? 'img' : undefined}
        aria-label={rest.title !== undefined && rest['aria-label'] === undefined ? String(rest.title) : undefined}
        {...rest}
      />
    );
  });
  K.displayName = visningsnavn;
  return K;
}

// ---- Stroke-rounded (gratis), med Lucide-navnene koden bruker -------------------------------------------------------

export const AlertCircle = lag(AlertCircleIcon, 'AlertCircle');
export const AlertTriangle = lag(Alert02Icon, 'AlertTriangle');
export const Archive = lag(Archive03Icon, 'Archive');
export const Armchair = lag(ArmchairIcon, 'Armchair');
export const ArrowDown = lag(ArrowDown02Icon, 'ArrowDown');
export const ArrowLeft = lag(ArrowLeft02Icon, 'ArrowLeft');
export const ArrowRight = lag(ArrowRight02Icon, 'ArrowRight');
export const ArrowUp = lag(ArrowUp02Icon, 'ArrowUp');
export const ArrowUpDown = lag(ArrowUpDownIcon, 'ArrowUpDown');
export const ArrowUpRight = lag(ArrowUpRight01Icon, 'ArrowUpRight');
export const Atom = lag(Atom02Icon, 'Atom');
export const Award = lag(Award05Icon, 'Award');
export const Baby = lag(Baby01Icon, 'Baby');
export const Banknote = lag(Money03Icon, 'Banknote');
export const BarChart2 = lag(ChartColumnIcon, 'BarChart2');
export const BarChart3 = lag(Analytics01Icon, 'BarChart3');
export const BookMarked = lag(BookBookmark01Icon, 'BookMarked');
export const BookOpen = lag(BookOpen01Icon, 'BookOpen');
export const Briefcase = lag(Briefcase01Icon, 'Briefcase');
export const Building2 = lag(Building06Icon, 'Building2');
export const Calculator = lag(Calculator01Icon, 'Calculator');
export const CalendarClock = lag(CalendarClockIcon, 'CalendarClock');
export const Check = lag(Tick02Icon, 'Check');
export const CheckIcon = Check;
export const CheckCircle = lag(CheckmarkCircle02Icon, 'CheckCircle');
export const CheckCircle2 = CheckCircle;
export const ChevronDown = lag(ArrowDown01Icon, 'ChevronDown');
export const ChevronDownIcon = ChevronDown;
export const ChevronLeft = lag(ArrowLeft01Icon, 'ChevronLeft');
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRight = lag(ArrowRight01Icon, 'ChevronRight');
export const ChevronRightIcon = ChevronRight;
export const ChevronUp = lag(ArrowUp01Icon, 'ChevronUp');
export const ChevronUpIcon = ChevronUp;
export const ChevronsUpDown = lag(UnfoldMoreIcon, 'ChevronsUpDown');
export const CircleDot = lag(CircleDotIcon, 'CircleDot');
export const CircleIcon = lag(CircleData, 'CircleIcon');
export const ClipboardList = lag(TaskDaily01Icon, 'ClipboardList');
export const Clock = lag(Clock01Icon, 'Clock');
export const Coins = lag(Coins01Icon, 'Coins');
export const Columns3 = lag(LayoutThreeColumnIcon, 'Columns3');
export const Command = lag(CommandIcon, 'Command');
export const Compass = lag(CompassIcon, 'Compass');
export const CornerDownLeft = lag(CornerDownLeftIcon, 'CornerDownLeft');
export const Download = lag(Download04Icon, 'Download');
export const ExternalLink = lag(LinkSquare02Icon, 'ExternalLink');
export const Eye = lag(ViewIcon, 'Eye');
export const FileText = lag(File02Icon, 'FileText');
export const Filter = lag(FilterIcon, 'Filter');
export const FlaskConical = lag(TestTube01Icon, 'FlaskConical');
export const GalleryVerticalEnd = lag(GalleryVerticalEndIcon, 'GalleryVerticalEnd');
export const Globe2 = lag(Globe02Icon, 'Globe2');
export const GraduationCap = lag(Mortarboard02Icon, 'GraduationCap');
export const GripVerticalIcon = lag(DragDropVerticalIcon, 'GripVerticalIcon');
export const HelpCircle = lag(HelpCircleIcon, 'HelpCircle');
export const Home = lag(Home03Icon, 'Home');
export const Info = lag(InformationCircleIcon, 'Info');
export const Landmark = lag(BankIcon, 'Landmark');
export const Layers = lag(Layers01Icon, 'Layers');
export const LayoutDashboard = lag(DashboardSquare01Icon, 'LayoutDashboard');
export const LayoutGrid = lag(GridViewIcon, 'LayoutGrid');
export const Leaf = lag(Leaf01Icon, 'Leaf');
export const Lightbulb = lag(Idea01Icon, 'Lightbulb');
export const Link2 = lag(Link02Icon, 'Link2');
export const ListOrdered = lag(LeftToRightListNumberIcon, 'ListOrdered');
export const Loader2 = lag(Loading03Icon, 'Loader2');
export const Lock = lag(SquareLock02Icon, 'Lock');
export const Map = lag(MapsIcon, 'Map');
export const MapPin = lag(Location01Icon, 'MapPin');
export const MapPinOff = lag(LocationOffline01Icon, 'MapPinOff');
export const MapPinned = lag(MapsLocation01Icon, 'MapPinned');
export const Maximize2 = lag(ArrowExpand01Icon, 'Maximize2');
export const Menu = lag(Menu01Icon, 'Menu');
export const MessageCircle = lag(Message01Icon, 'MessageCircle');
export const Microscope = lag(MicroscopeIcon, 'Microscope');
export const Minimize2 = lag(ArrowShrink02Icon, 'Minimize2');
export const Minus = lag(MinusSignIcon, 'Minus');
export const MinusIcon = Minus;
export const MinusCircle = lag(MinusSignCircleIcon, 'MinusCircle');
export const Monitor = lag(ComputerIcon, 'Monitor');
export const Moon = lag(Moon02Icon, 'Moon');
export const MoreHorizontal = lag(MoreHorizontalData, 'MoreHorizontal');
export const MoreHorizontalIcon = MoreHorizontal;
export const Newspaper = lag(News01Icon, 'Newspaper');
export const PanelLeft = lag(SidebarLeftIcon, 'PanelLeft');
export const PanelLeftIcon = PanelLeft;
export const PanelLeftClose = lag(PanelLeftCloseIcon, 'PanelLeftClose');
export const PanelLeftOpen = lag(PanelLeftOpenIcon, 'PanelLeftOpen');
export const PanelRight = lag(SidebarRightIcon, 'PanelRight');
export const PanelRightClose = lag(PanelRightCloseIcon, 'PanelRightClose');
export const PanelTop = lag(LayoutTopIcon, 'PanelTop');
export const PanelsTopLeft = lag(Layout01Icon, 'PanelsTopLeft');
export const PawPrint = lag(PawPrintIcon, 'PawPrint');
export const PieChart = lag(PieChartIcon, 'PieChart');
export const PiggyBank = lag(PiggyBankIcon, 'PiggyBank');
export const Presentation = lag(Presentation01Icon, 'Presentation');
export const Quote = lag(QuoteDownIcon, 'Quote');
export const Repeat = lag(RepeatIcon, 'Repeat');
export const RotateCcw = lag(RefreshIcon, 'RotateCcw');
export const Scale = lag(BalanceScaleIcon, 'Scale');
export const ScatterChart = lag(ChartScatterIcon, 'ScatterChart');
export const School = lag(School01Icon, 'School');
export const Search = lag(Search01Icon, 'Search');
export const SearchIcon = Search;
export const Send = lag(SentIcon, 'Send');
export const ShieldAlert = lag(SecurityWarningIcon, 'ShieldAlert');
export const ShieldCheck = lag(SecurityCheckIcon, 'ShieldCheck');
export const SlidersHorizontal = lag(FilterHorizontalIcon, 'SlidersHorizontal');
export const Smartphone = lag(SmartPhone01Icon, 'Smartphone');
export const Sparkles = lag(SparklesIcon, 'Sparkles');
export const Star = lag(StarIcon, 'Star');
export const Sun = lag(Sun03Icon, 'Sun');
export const Table2 = lag(TableIcon, 'Table2');
export const Tablet = lag(Tablet01Icon, 'Tablet');
export const Target = lag(Target03Icon, 'Target');
export const TreePine = lag(PineTreeIcon, 'TreePine');
export const Trees = lag(Tree06Icon, 'Trees');
export const TrendingDown = lag(TradeDownIcon, 'TrendingDown');
export const TrendingUp = lag(TradeUpIcon, 'TrendingUp');
export const Trophy = lag(ChampionIcon, 'Trophy');
export const Users = lag(UserMultipleIcon, 'Users');
export const Wallet = lag(Wallet01Icon, 'Wallet');
export const Wifi = lag(Wifi01Icon, 'Wifi');
export const Wrench = lag(Wrench01Icon, 'Wrench');
export const X = lag(Cancel01Icon, 'X');
export const XIcon = X;

// ---- Duotone-rounded (Pro) for sidemenyen og modulkortene ----------------------------------------------------------

/**
 * Menyikon: duotone-rounded fra ikoner-pro.ts når det er hentet, ellers det samme strekikonet som over. `navn` er
 * eksportnavnet i Hugeicons (det som står i scripts/hugeicons-pro/valg.mjs); hent-ikoner.mjs skriver det som
 * <Navn uten Icon>DuotoneRoundedProIcon.
 */
function duo(navn: string, strekData: IkonData, visningsnavn: string): Ikon {
  return lag(proEllers(`${navn.replace(/Icon$/, '')}DuotoneRoundedProIcon`, strekData), `${visningsnavn}Duo`);
}

/**
 * Ikonene i sidemenyen og modulkortene: fakultetsmodulene, NMBU-sidene og styringssidene (AppShells.tsx,
 * arbeidsflate/navigasjon.ts), som IkonRutenett og Listerad (arbeidsflate/Byggeklosser.tsx) tegner. Samme nøkler som
 * Lucide-navnene over. Hold lista i takt med scripts/hugeicons-pro/valg.mjs.
 */
export const MENY = {
  Archive: duo('Archive03Icon', Archive03Icon, 'Archive'),
  Atom: duo('Atom02Icon', Atom02Icon, 'Atom'),
  Baby: duo('Baby01Icon', Baby01Icon, 'Baby'),
  BookOpen: duo('BookOpen01Icon', BookOpen01Icon, 'BookOpen'),
  Briefcase: duo('Briefcase01Icon', Briefcase01Icon, 'Briefcase'),
  Building2: duo('Building06Icon', Building06Icon, 'Building2'),
  Coins: duo('Coins01Icon', Coins01Icon, 'Coins'),
  FlaskConical: duo('TestTube01Icon', TestTube01Icon, 'FlaskConical'),
  Globe2: duo('Globe02Icon', Globe02Icon, 'Globe2'),
  GraduationCap: duo('Mortarboard02Icon', Mortarboard02Icon, 'GraduationCap'),
  Home: duo('Home03Icon', Home03Icon, 'Home'),
  Landmark: duo('BankIcon', BankIcon, 'Landmark'),
  Layers: duo('Layers01Icon', Layers01Icon, 'Layers'),
  LayoutDashboard: duo('DashboardSquare01Icon', DashboardSquare01Icon, 'LayoutDashboard'),
  LayoutGrid: duo('GridViewIcon', GridViewIcon, 'LayoutGrid'),
  Leaf: duo('Leaf01Icon', Leaf01Icon, 'Leaf'),
  Lock: duo('SquareLock02Icon', SquareLock02Icon, 'Lock'),
  MapPinned: duo('MapsLocation01Icon', MapsLocation01Icon, 'MapPinned'),
  Microscope: duo('MicroscopeIcon', MicroscopeIcon, 'Microscope'),
  PawPrint: duo('PawPrintIcon', PawPrintIcon, 'PawPrint'),
  PieChart: duo('PieChartIcon', PieChartIcon, 'PieChart'),
  Star: duo('StarIcon', StarIcon, 'Star'),
  TreePine: duo('PineTreeIcon', PineTreeIcon, 'TreePine'),
  Trees: duo('Tree06Icon', Tree06Icon, 'Trees'),
  TrendingUp: duo('TradeUpIcon', TradeUpIcon, 'TrendingUp'),
  Users: duo('UserMultipleIcon', UserMultipleIcon, 'Users'),
  Wallet: duo('Wallet01Icon', Wallet01Icon, 'Wallet'),
} as const satisfies Record<string, Ikon>;
