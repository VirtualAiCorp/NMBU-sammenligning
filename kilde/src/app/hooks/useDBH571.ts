import { useState, useEffect } from 'react';
import { fetchDBH571, type DBH571Row } from '../services/dbhService';
import { DBH_CODE_TO_APPIDS, isOABachelorProgram } from '../data/dbhInstitutionMap';

export interface DBHPoengEntry {
  avgPoeng: number;
  year: string;
  programCode: string;
  allPrograms: boolean; // true when we fell back to all programs (no ØA code matched)
}

export interface DBH571State {
  loading: boolean;
  error: string | null;
  byAppId: Record<string, DBHPoengEntry | null>;
  latestYear: string | null;
  rawProgramCodes: string[]; // for debugging
}

// Columns that are NOT the metric value
const SKIP_COLS = new Set([
  'Institusjonskode', 'Institusjonsnavn',
  'Årstall', 'Årstallsnavn',
  'Studieprogramkode', 'Studieprogramnavn',
]);

function findMetricValue(row: DBH571Row): number | null {
  for (const [k, v] of Object.entries(row)) {
    if (SKIP_COLS.has(k)) continue;
    // Check for numeric value (DBH uses floats for characteristic points)
    if (typeof v === 'number' && isFinite(v) && v > 0) return v;
    // Handle string-encoded numbers
    if (typeof v === 'string' && v.trim() !== '') {
      const n = parseFloat(v.replace(',', '.'));
      if (!isNaN(n) && n > 0) return n;
    }
  }
  return null;
}

function buildState(rows: DBH571Row[]): DBH571State {
  const years = [...new Set(rows.map((r) => String(r['Årstall'] ?? '')))].sort();
  const latestYear = years[years.length - 1] ?? null;
  const rawProgramCodes = [...new Set(rows.map((r) => String(r['Studieprogramkode'] ?? '')))].sort();

  // instCode → programCode → year → values[]
  const grouped: Record<string, Record<string, Record<string, number[]>>> = {};
  for (const row of rows) {
    const inst = String(row['Institusjonskode'] ?? '');
    const prog = String(row['Studieprogramkode'] ?? '');
    const year = String(row['Årstall'] ?? '');
    const val = findMetricValue(row);
    if (!inst || !prog || !year || val === null) continue;
    grouped[inst] ??= {};
    grouped[inst][prog] ??= {};
    grouped[inst][prog][year] ??= [];
    grouped[inst][prog][year].push(val);
  }

  const byAppId: Record<string, DBHPoengEntry | null> = {};

  for (const [instCode, programs] of Object.entries(grouped)) {
    const appIds = DBH_CODE_TO_APPIDS[instCode];
    if (!appIds?.length) continue;

    // Try to match ØA bachelor programs first
    const oaCodes = Object.keys(programs).filter(isOABachelorProgram);
    // Fall back to ALL programs if none match (so we always show something)
    const codesToUse = oaCodes.length > 0 ? oaCodes : Object.keys(programs);
    const isAllPrograms = oaCodes.length === 0;

    // Use latest year; fall back to any available year
    const targetYear = latestYear ?? '';
    const vals: number[] = [];
    let usedYear = targetYear;

    for (const code of codesToUse) {
      const yearVals = programs[code][targetYear];
      if (yearVals?.length) vals.push(...yearVals);
    }

    // If no data for latest year, try previous year
    if (vals.length === 0 && years.length > 1) {
      usedYear = years[years.length - 2];
      for (const code of codesToUse) {
        const yearVals = programs[code][usedYear];
        if (yearVals?.length) vals.push(...yearVals);
      }
    }

    const avg = vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
    const entry: DBHPoengEntry | null =
      avg !== null
        ? {
            avgPoeng: avg,
            year: usedYear,
            programCode: oaCodes[0] ?? codesToUse[0] ?? '',
            allPrograms: isAllPrograms,
          }
        : null;

    for (const appId of appIds) byAppId[appId] = entry;
  }

  return { loading: false, error: null, byAppId, latestYear, rawProgramCodes };
}

// Module-level cache — resets when the module reloads (dev hot reload)
let _cached: DBH571State | null = null;
let _fetchPromise: Promise<DBH571State> | null = null;

export function useDBH571(): DBH571State {
  const [state, setState] = useState<DBH571State>(
    _cached ?? { loading: true, error: null, byAppId: {}, latestYear: null, rawProgramCodes: [] }
  );

  useEffect(() => {
    if (_cached) {
      setState(_cached);
      return;
    }
    if (!_fetchPromise) {
      _fetchPromise = fetchDBH571()
        .then((rows) => {
          const s = buildState(rows);
          _cached = s;
          return s;
        })
        .catch((err) => {
          const s: DBH571State = {
            loading: false,
            error: String(err),
            byAppId: {},
            latestYear: null,
            rawProgramCodes: [],
          };
          _cached = s;
          return s;
        });
    }
    _fetchPromise.then(setState);
  }, []);

  return state;
}
