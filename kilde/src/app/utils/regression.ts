// ── OLS regression with full statistics ──────────────────────────────────────

export interface RegressionResult {
  n: number;
  df: number;
  intercept: number;
  slope: number;
  r2: number;
  r: number;
  seBeta: number;
  tStat: number;
  pValue: number;
}

// Log-gamma via Lanczos approximation (Numerical Recipes)
function lgamma(z: number): number {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
             -1.231739572450155, 1.208650973866179e-3, -5.395239384953e-6];
  let y = z, x = z;
  const t = x + 5.5;
  const s = t - (x + 0.5) * Math.log(t);
  let ser = 1.000000000190015;
  for (const ci of c) { y += 1; ser += ci / y; }
  return -s + Math.log(2.5066282746310005 * ser / x);
}

// Regularised incomplete beta function I_x(a,b) via continued fraction (Lentz)
function ibeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  // Symmetry: use the more-convergent side
  if (x > (a + 1) / (a + b + 2)) return 1 - ibeta(1 - x, b, a);
  const lbeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta) / a;
  const eps = 1e-10, tiny = 1e-30;
  let f = 1, C = 1;
  let D = 1 - (a + b) * x / (a + 1);
  if (Math.abs(D) < tiny) D = tiny;
  D = 1 / D; f = D;
  for (let m = 1; m <= 300; m++) {
    let d = m * (b - m) * x / ((a + 2*m - 1) * (a + 2*m));
    D = 1 + d * D; if (Math.abs(D) < tiny) D = tiny; D = 1/D;
    C = 1 + d / C; if (Math.abs(C) < tiny) C = tiny;
    const delta1 = C * D; f *= delta1;
    d = -(a + m) * (a + b + m) * x / ((a + 2*m) * (a + 2*m + 1));
    D = 1 + d * D; if (Math.abs(D) < tiny) D = tiny; D = 1/D;
    C = 1 + d / C; if (Math.abs(C) < tiny) C = tiny;
    const delta2 = C * D; f *= delta2;
    if (Math.abs(delta2 - 1) < eps) break;
  }
  return front * f;
}

// Two-tailed p-value for t-distribution with df degrees of freedom
function tPValue(t: number, df: number): number {
  const x = df / (df + t * t);
  return ibeta(x, df / 2, 0.5); // = 2 * P(T > |t|)
}

export function fullRegression(pts: { x: number; y: number }[]): RegressionResult | null {
  const n = pts.length;
  if (n < 3) return null;

  const xM = pts.reduce((s, p) => s + p.x, 0) / n;
  const yM = pts.reduce((s, p) => s + p.y, 0) / n;

  const ssXX = pts.reduce((s, p) => s + (p.x - xM) ** 2, 0);
  const ssXY = pts.reduce((s, p) => s + (p.x - xM) * (p.y - yM), 0);
  const ssYY = pts.reduce((s, p) => s + (p.y - yM) ** 2, 0);

  if (ssXX === 0 || ssYY === 0) return null;

  const slope = ssXY / ssXX;
  const intercept = yM - slope * xM;
  const r2 = (ssXY ** 2) / (ssXX * ssYY);
  const r = Math.sign(slope) * Math.sqrt(r2);

  // Residual standard error
  const sse = pts.reduce((s, p) => s + (p.y - (intercept + slope * p.x)) ** 2, 0);
  const df = n - 2;
  const mse = sse / df;
  const seBeta = Math.sqrt(mse / ssXX);
  const tStat = slope / seBeta;
  const pValue = tPValue(Math.abs(tStat), df);

  return { n, df, intercept, slope, r2, r, seBeta, tStat, pValue };
}

export function sigStars(p: number): string {
  if (p < 0.001) return '***';
  if (p < 0.01)  return '**';
  if (p < 0.05)  return '*';
  if (p < 0.1)   return '.';
  return 'ns';
}

export function fmtP(p: number): string {
  if (p < 0.001) return '< 0,001';
  if (p < 0.01)  return p.toFixed(3).replace('.', ',');
  return p.toFixed(3).replace('.', ',');
}
