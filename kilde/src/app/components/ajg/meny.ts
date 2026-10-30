/** Menyen i AJG-Analyse HH: grupper og sider (id = hash-ruten). */
import {
  BarChart3, BookOpen, ClipboardList, FileText, Globe2, Home, Layers, ScatterChart, Table2, TrendingUp, Trophy, type LucideIcon,
} from '../../ikoner';
import type { SideId } from './sider';

export const MENY: { tittel: string; punkter: { id: SideId; label: string; ikon: LucideIcon; tekst: string }[] }[] = [
  { tittel: 'Oversikt', punkter: [{ id: 'oversikt', label: 'Forside', ikon: Home, tekst: 'Hovedfunn og nøkkeltall' }] },
  {
    tittel: 'Spørsmålene', punkter: [
      { id: 'fordeling', label: '1 Fordeling', ikon: BarChart3, tekst: 'Samfunnsøkonomi mot andre fagområder per skole' },
      { id: 'utvikling', label: '2 Utvikling over tid', ikon: TrendingUp, tekst: 'Andelen samfunnsøkonomi 2016–2025' },
      { id: 'internasjonalt', label: '3 Internasjonalt', ikon: Globe2, tekst: 'Typiske skoler og toppskoler i Europa og verden' },
      { id: 'niva', label: '4 Nivå per fagområde', ikon: Layers, tekst: 'Kvantitet eller også kvalitet? ECON mot andre felt' },
      { id: 'fagfelt', label: 'Nivå per AJG-fagfelt', ikon: ScatterChart, tekst: 'Samme nivåsjekk for alle 22 fagfelt' },
    ],
  },
  {
    tittel: 'Data', punkter: [
      { id: 'lista', label: 'AJG-lista kontrollert', ikon: ClipboardList, tekst: 'Vår uthenting mot de offentlige tallene' },
      { id: 'tidsskrift', label: 'Tidsskrift', ikon: Table2, tekst: 'AJG-nivå og antall artikler per tidsskrift' },
      { id: 'hh', label: 'HH NMBU-artikler', ikon: FileText, tekst: 'Alle NVI-artikler 2021–2025 med AJG-nivå' },
      { id: 'metode', label: 'Metode og forbehold', ikon: BookOpen, tekst: 'Kilder, avgrensninger og statistikk' },
      { id: 'rangering', label: 'Rangeringen', ikon: Trophy, tekst: 'Rangering av handelshøyskolene (utkast), som i NMBU-sammenligningen' },
    ],
  },
];
