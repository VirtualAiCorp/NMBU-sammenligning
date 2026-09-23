/**
 * Generates URLs for course descriptions at Norwegian educational institutions.
 * Based on URL patterns discovered for each institution from their course registries.
 *
 * Data hentet: 2026-09-23
 */

interface InstitusjonsMønster {
  monster?: string;
  kodeform?: 'lower' | 'upper' | 'asis';
  strip?: string[];
}

const INSTITUSJONER: Record<string, InstitusjonsMønster> = {
  '1110': { // UiO
    monster: undefined,
  },
  '1120': { // UiB
    monster: 'https://www4.uib.no/emner/{kode}',
    kodeform: 'upper',
    strip: ['-\\d+$', '-0$'],
  },
  '1130': { // UiT
    monster: undefined,
  },
  '1150': { // NTNU
    monster: 'https://www.ntnu.no/studier/emner/{kode}',
    kodeform: 'upper',
    strip: ['-\\d+$'],
  },
  '1160': { // UiS
    monster: 'https://www.uis.no/course/{kode}',
    kodeform: 'lower',
    strip: ['-\\d+$'],
  },
  '1171': { // UiA
    monster: undefined,
  },
  '1173': { // NMBU
    monster: 'https://www.nmbu.no/emne/{kode}',
    kodeform: 'lower',
    strip: ['-\\d+$'],
  },
  '1175': { // OsloMet
    monster: undefined,
  },
  '1176': { // USN
    monster: undefined,
  },
  '1177': { // INN
    monster: undefined,
  },
  '1220': { // AHO
    monster: undefined,
  },
  '1240': { // NHH
    monster: undefined,
  },
  '1260': { // NIH
    monster: undefined,
  },
  '1407': { // Oslo Nye
    monster: undefined,
  },
  '0232': { // HiMolde
    monster: undefined,
  },
  '0236': { // HVO
    monster: 'https://www.hivolda.no/emne/{kode}',
    kodeform: 'lower',
    strip: ['-\\d+$'],
  },
  '0238': { // HVL
    monster: undefined,
  },
  '0256': { // HiØ
    monster: undefined,
  },
  '8202': { // LDH
    monster: undefined,
  },
  '8208': { // VID
    monster: undefined,
  },
  '8223': { // NLA
    monster: undefined,
  },
  '8241': { // BI
    monster: undefined,
  },
  '8253': { // Kristiania
    monster: undefined,
  },
};

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
 * @returns URL to course description, or null if no URL pattern exists for institution
 *
 * @example
 * emneUrl('1173', 'AOS229-B-1')
 * // => "https://www.nmbu.no/emne/aos229-b"
 *
 * emneUrl('1150', 'TMA4100-1')
 * // => "https://www.ntnu.no/studier/emner/TMA4100"
 */
export function emneUrl(institusjonskode: string, dbhKode: string): string | null {
  const mønster = INSTITUSJONER[institusjonskode];

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

  return mønster.monster.replace('{kode}', processedCode);
}

/**
 * Date when URL patterns were last discovered/verified
 */
export const EMNE_URL_HENTET = '2026-09-23';
