/**
 * Generates URLs for course descriptions at Norwegian educational institutions.
 * Based on URL patterns discovered for each institution from their course registries.
 *
 * For institutions without a direct per-course URL, `type: 'sok'` means the
 * generated URL is a search-results page (not the course page itself) where
 * the course typically appears as (one of) the top hits.
 *
 * Data hentet: 2026-09-23
 */

interface InstitusjonsMønster {
  monster?: string;
  kodeform?: 'lower' | 'upper' | 'asis';
  strip?: string[];
  /** 'direkte' = monster resolves straight to the course page. 'sok' = monster is a search URL. */
  type?: 'direkte' | 'sok';
  /** Egen funksjon for institusjoner uten enkelt mønster (BI, Kristiania). */
  lag?: (dbhKode: string) => string | null;
}

const INSTITUSJONER: Record<string, InstitusjonsMønster> = {
  '1110': { // UiO
    monster: 'https://www.uio.no/?vrtx=searchuio&query={kode}',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'sok',
  },
  '1120': { // UiB
    monster: 'https://www4.uib.no/emner/{kode}',
    kodeform: 'upper',
    strip: ['-\\d+$', '-0$'],
    type: 'direkte',
  },
  '1130': { // UiT
    monster: 'https://uit.no/utdanning/aktivt/emne/{kode}',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'direkte',
  },
  '1150': { // NTNU
    monster: 'https://www.ntnu.no/studier/emner/{kode}',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'direkte',
  },
  '1160': { // UiS
    monster: 'https://www.uis.no/course/{kode}',
    kodeform: 'lower',
    strip: ['-\\d+$'],
    type: 'direkte',
  },
  '1171': { // UiA — emnesidene ligger under år/semester (2026/host eller /var), så søk i emnekatalogen er robust
    monster: 'https://www.uia.no/studier/emner/?q={kode}',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'sok',
  },
  '1173': { // NMBU
    monster: 'https://www.nmbu.no/emne/{kode}',
    kodeform: 'lower',
    strip: ['-\\d+$'],
    type: 'direkte',
  },
  '1174': { // Nord
    monster: 'https://www.nord.no/studier/emner/{kode}',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'direkte',
  },
  '1175': { // OsloMet
    monster: 'https://student.oslomet.no/studier/-/studieinfo/emne/{kode}/',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'direkte',
  },
  '1176': { // USN
    monster: undefined,
  },
  '1177': { // INN
    monster: 'https://studiekatalog.edutorium.no/inn/emne/{kode}',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'direkte',
  },
  '1220': { // AHO — emnekoder har mellomrom (f.eks. "80 112"), kodes til %20
    monster: 'https://aho.no/?vrtx=search&query={kode}',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'sok',
  },
  '1240': { // NHH
    monster: 'https://www.nhh.no/en/search/?q={kode}',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'sok',
  },
  '1260': { // NIH
    monster: 'https://www.nih.no/?vrtx=search&query={kode}',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'sok',
  },
  '1407': { // Oslo Nye
    monster: 'https://oslonyehoyskole.no/search/node?keys={kode}',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'sok',
  },
  '0232': { // HiMolde
    monster: 'https://www.himolde.no/?vrtx=search&query={kode}',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'sok',
  },
  '0236': { // HVO
    monster: 'https://www.hivolda.no/emne/{kode}',
    kodeform: 'lower',
    strip: ['-\\d+$'],
    type: 'direkte',
  },
  '0238': { // HVL
    monster: 'https://www.hvl.no/studier/studieprogram/emne/{kode}',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'direkte',
  },
  '0256': { // HiØ
    monster: 'https://www.hiof.no/?vrtx=search&query={kode}',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'sok',
  },
  '8202': { // LDH
    monster: undefined,
  },
  '8208': { // VID
    monster: undefined,
  },
  '8223': { // NLA
    monster: 'https://www.nla.no/emneplan/{kode}/',
    kodeform: 'upper',
    strip: ['-\\d+$'],
    type: 'direkte',
  },
  '8241': { // BI — kursbeskrivelser; DBH-koden er bokstaver + 4 siffer + versjonssiffer (GRA65553 → GRA 6555)
    lag: (kode) => {
      const m = kode.replace(/-\d+$/, '').match(/^([A-ZÆØÅ]+)(\d{4})\d?$/);
      return m ? `https://www.bi.no/studier-og-kurs/kursbeskrivelser/?subjectCode=${encodeURIComponent(m[1])}&courseNumber=${m[2]}` : null;
    },
  },
  '8253': { // Kristiania — emnesiden ligger under fakultet/nivå; slås opp i public/emner/url-8253.json (lastes i bakgrunnen)
    lag: (kode) => {
      const o = kristianiaOppslag;
      const v = o?.k[kode];
      if (!o || v === undefined) return null;
      const [i, seg] = Array.isArray(v) ? v : [v, kode.replace(/-\d+$/, '').toLowerCase().replace(/ /g, '-')];
      return `${o.base}${o.p[i]}/${encodeURIComponent(seg)}/`;
    },
  },
};

interface KristianiaOppslag { base: string; p: string[]; k: Record<string, number | [number, string]> }
let kristianiaOppslag: KristianiaOppslag | null = null;
let lasting: Promise<void> | null = null;

/** Laster oppslagsfilen for Kristianias emnesider (kalles én gang ved oppstart). Til den er lastet, gir emneUrl null for 8253. */
export function lastEmneUrlOppslag(): Promise<void> {
  lasting ??= fetch(`${import.meta.env.BASE_URL}emner/url-8253.json`)
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => { kristianiaOppslag = j; })
    .catch(() => { /* lenkene mangler bare */ });
  return lasting;
}

/**
 * Process a DBH course code by stripping version and format suffixes
 * @param code - DBH course code (e.g. "AOS229-B-1", "MA1101-1", "DIGI100-0")
 * @param stripPatterns - Array of regex patterns to remove
 * @returns Processed code without version suffixes
 */
function stripCode(code: string, stripPatterns?: string[]): string {
  if (!stripPatterns) return code;

  let result = code;
  for (const pattern of stripPatterns) {
    result = result.replace(new RegExp(pattern), '');
  }
  return result;
}

/**
 * Generate a course description URL for a given institution and course code
 *
 * @param institusjonskode - Institution code from DBH (e.g. "1173" for NMBU)
 * @param dbhKode - DBH course code (e.g. "AOS229-B-1")
 * @returns URL to course description (or a search-results URL for `type: 'sok'`
 *   institutions), or null if no URL pattern exists for the institution
 *
 * @example
 * emneUrl('1173', 'AOS229-B-1')
 * // => "https://www.nmbu.no/emne/aos229-b"
 *
 * emneUrl('1150', 'TMA4100-1')
 * // => "https://www.ntnu.no/studier/emner/TMA4100"
 *
 * emneUrl('1220', '80 112-1')
 * // => "https://aho.no/?vrtx=search&query=80%20112" (søk, ikke direkte emneside)
 */
export function emneUrl(institusjonskode: string, dbhKode: string): string | null {
  const mønster = INSTITUSJONER[institusjonskode];

  if (mønster?.lag) return mønster.lag(dbhKode);
  if (!mønster || !mønster.monster) {
    return null;
  }

  // Strip version suffixes from DBH code
  let processedCode = stripCode(dbhKode, mønster.strip);

  // Apply case transformation
  if (mønster.kodeform === 'lower') {
    processedCode = processedCode.toLowerCase();
  } else if (mønster.kodeform === 'upper') {
    processedCode = processedCode.toUpperCase();
  }
  // 'asis' means keep as-is

  // URL-encode the code segment (handles spaces, æøå, etc. safely in both
  // path segments and query strings; leaves normal alphanumerics/hyphens intact)
  const encodedCode = encodeURIComponent(processedCode);

  return mønster.monster.replace('{kode}', encodedCode);
}

/**
 * Date when URL patterns were last discovered/verified
 */
export const EMNE_URL_HENTET = '2026-09-23';
