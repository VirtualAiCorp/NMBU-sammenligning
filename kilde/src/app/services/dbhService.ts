export interface DBH571Row {
  Institusjonskode: string;
  Årstall: string;
  Studieprogramkode: string;
  [key: string]: string | number | null;
}

// fetch() runs in the user's browser (not on the cloud server), so the user's
// home/office IP is used. DBH API has Access-Control-Allow-Origin: *.
const DBH_API_URL = 'https://dbh.hkdir.no/api/Tabeller/hentJSONTabellData';

// Known DBH institution codes for Norwegian ØA institutions
const OA_INSTITUTION_CODES = [
  '1150', // NTNU
  '1160', // UiT
  '1171', // UiA
  '1173', // NHH
  '1174', // Nord
  '1175', // HVL
  '1176', // UiS
  '1177', // INN
  '1178', // USN
  '1182', // OsloMet
  '1183', // NMBU
  '1185', // NLA
  '1059', // HiØ (Høgskolen i Østfold)
  '1060', // Høgskolen i Molde
  '4390', // BI
  '8034', // Kristiania
];

export async function fetchDBH571(): Promise<DBH571Row[]> {
  const res = await fetch(DBH_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tabell_id: 571,
      api_versjon: 1,
      statuslinje: 'J',
      kodetekst: 'J',
      desimal_separator: '.',
      // Simplified groupBy — no Avdelingskode or Semester to reduce complexity
      groupBy: ['Institusjonskode', 'Årstall', 'Studieprogramkode'],
      sortBy: ['Institusjonskode', 'Årstall'],
      filter: [
        {
          variabel: 'Institusjonskode',
          selection: { filter: 'item', values: OA_INSTITUTION_CODES, exclude: [''] },
        },
        {
          variabel: 'Årstall',
          selection: { filter: 'item', values: ['2025', '2024'], exclude: [''] },
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`DBH API feil: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('Uventet svar fra DBH API');
  // Log response for debugging column names and program codes
  if (data.length > 0) {
    console.log('[DBH 571] Kolonner:', Object.keys(data[0]));
    console.log('[DBH 571] Eksempelrad:', data[0]);
    console.log('[DBH 571] Rader totalt:', data.length);
    const progCodes = [...new Set(data.map((r: DBH571Row) => String(r['Studieprogramkode'] ?? '')))].sort();
    console.log('[DBH 571] Programkoder:', progCodes.slice(0, 50));
  }
  return data;
}
