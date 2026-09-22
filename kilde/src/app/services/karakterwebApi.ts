// Public preview API — free, no key, returns aggregate bar-chart heights only.
// Authenticated API — api.karakterweb.no/v1 — requires X-Client-Key header.
// Set VITE_KARAKTERWEB_API_KEY in your .env.local to enable per-semester data.
// Free key: send email to kontakt@karakterweb.no (accept terms at /api-docs).

const PREVIEW_BASE = 'https://karakterweb.no/api';
// Authenticated API is proxied through Vite (/karakterweb-api → api.karakterweb.no/v1).
// The X-Client-Key header is added by the proxy in vite.config.ts — never exposed to browser.
const AUTH_BASE    = '/karakterweb-api';

export interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
}

export interface LiveCourseData {
  code: string;
  displayCode: string;
  name: string;
  grades: GradeDistribution;
  avg: string | null;
  totalCandidates: number;
  /** ISO year of the grade data, e.g. 2025. Only set when authenticated API is used. */
  dataYear?: number;
}

// ─── Authenticated API (per-semester, siste år, via Vite proxy) ───────────────

async function fetchAuthenticated(
  institute: string,
  codeShort: string,
): Promise<LiveCourseData | null> {
  try {
    const url = `${AUTH_BASE}/courses/${institute}/${codeShort}?include=grades&year_top=1`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();

    // Response shape: { course, grades: { semesters: [{ year, semester, candidates, distribution: {A,B,C,D,E,F}, averageGrade }] } }
    const semesters: any[] = data.grades?.semesters ?? [];
    if (!semesters.length) return null;

    // Take highest year
    const latest = semesters.reduce((best: any, row: any) =>
      (row.year ?? 0) > (best.year ?? 0) ? row : best, semesters[0]);

    const dist = latest.distribution ?? {};
    const A = dist.A ?? 0;
    const B = dist.B ?? 0;
    const C = dist.C ?? 0;
    const D = dist.D ?? 0;
    const E = dist.E ?? 0;
    const F = dist.F ?? 0;

    return {
      code:            data.course?.courseCode ?? codeShort,
      displayCode:     (data.course?.courseCode ?? codeShort).toUpperCase(),
      name:            data.course?.name ?? '',
      grades:          { A, B, C, D, E, F },
      avg:             latest.averageGrade ?? null,
      totalCandidates: latest.candidates ?? (A + B + C + D + E + F),
      dataYear:        latest.year,
    };
  } catch {
    return null;
  }
}

// ─── Free preview API (aggregate thumbnail heights) ───────────────────────────

async function fetchPreview(
  institute: string,
  codeShort: string,
): Promise<LiveCourseData | null> {
  try {
    const res = await fetch(`${PREVIEW_BASE}/courses?institute=${institute}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const courses: any[] = data.courses ?? [];

    const course = courses.find((c) => {
      const short = (c.codeShort || '').toLowerCase();
      const full  = (c.code     || '').toLowerCase();
      const target = codeShort.toLowerCase();
      return short === target
        || full  === target
        || full.startsWith(target + '-')
        || full === target + '-1';
    });

    if (!course) return null;
    const preview = course.preview;
    if (!preview || preview.scale !== 'A-F' || !Array.isArray(preview.heights)) return null;

    const [A, B, C, D, E, F] = preview.heights;
    return {
      code:            course.code,
      displayCode:     course.code.replace(/-\d+$/, ''),
      name:            course.name,
      grades:          { A, B, C, D, E, F },
      avg:             preview.avg ?? null,
      totalCandidates: course.candidates ?? (A + B + C + D + E + F),
    };
  } catch {
    return null;
  }
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function fetchCourseGrades(
  institute: string,
  codeShort: string,
): Promise<LiveCourseData | null> {
  const result = await fetchAuthenticated(institute, codeShort);
  if (result) return result;
  return fetchPreview(institute, codeShort);
}
