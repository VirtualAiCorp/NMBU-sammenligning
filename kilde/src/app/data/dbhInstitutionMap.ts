// DBH institution codes → app university IDs
export const DBH_CODE_TO_APPIDS: Record<string, string[]> = {
  '1150': ['ntnu', 'ntnu_gjovik', 'ntnu_alesund'],
  '1160': ['uit', 'uit_alta', 'uit_harstad'],
  '1171': ['uia'],
  '1173': ['nhh'],
  '1174': ['nord', 'nord_steinkjer'],
  '1175': ['hvl', 'hvl_bergen', 'hvl_haugesund', 'hvl_sogndal'],
  '1176': ['uis'],
  '1177': ['inn', 'inn_rena'],
  '1178': ['usn', 'usn_honefoss', 'usn_bo', 'usn_kongsberg'],
  '1182': ['oslomet'],
  '1183': ['nmbu'],
  '1185': ['nla', 'nla_oslo', 'nla_bergen', 'nla_krs'],
  '4390': ['bi'],
  '8034': ['kristiania'],
  '1059': ['hio'],
  '1060': ['himolde'],
};

// App ID → primary DBH institution code
export const APPID_TO_DBH_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(DBH_CODE_TO_APPIDS).flatMap(([code, ids]) => ids.map((id) => [id, code]))
);

// Patterns to identify ØA bachelor programs from institutional program codes.
// DBH institutional codes vary widely; these patterns aim for broad but accurate coverage.
const OA_PATTERNS: RegExp[] = [
  /^BAØK/i,       // BAØKAH, BAØKAD, BAØKON etc. (most common)
  /^BØKA/i,       // BØKAH, BØKAD
  /^B-ØKA/i,      // B-ØKAH etc.
  /^BØK[^L]/i,    // BØK* but NOT BØKLEØ (NHH siviløkonom)
  /^B.*ØKON/i,    // BØKON, BAØKON etc.
  /ØKON.*BAC/i,   // ...ØKONBAC...
  /^BØKON/i,
  /^BBAØK/i,
  /^BATØK/i,
  /^ØKADBAC/i,
  /^OA-BACH/i,    // Some use OA prefix
  /^ØABAC/i,
  /ØK.*ADM.*H$/i, // ØKonomi og ADMinistrasjon Heltid
];

const EXCLUDE_PATTERNS: RegExp[] = [
  /BØKLEØ/i,       // NHH siviløkonom (specific)
  /SIV.*ØKON/i,    // Siviløkonom programs
  /^MSIV/i,
  /MASTER/i,
  /^MA[A-ZÆØÅ]/,  // MA-prefix programs (masters)
  /PHD/i,
  /DR\.?PHIL/i,
  /VIDERE/i,
  /ERFARINGS/i,
  /ETTER.*UTDANN/i,
];

export function isOABachelorProgram(code: string): boolean {
  if (EXCLUDE_PATTERNS.some((p) => p.test(code))) return false;
  return OA_PATTERNS.some((p) => p.test(code));
}
