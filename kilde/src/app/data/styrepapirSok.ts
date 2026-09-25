/**
 * Søk i teksten fra styrepapirene (markedsstatus). Indeksen bygges i nettleseren fra
 * public/markedsstatus/<fakultet>/tekst.json (scripts/build-markedsstatus-tekst.py): BM25 over utdrag på om lag
 * 1 200 tegn, med enkel norsk ordstamming. Ingen tekst sendes noe sted for å søke.
 */

export interface StyrepapirDok { inst: string; label: string; dato: string | null; fil: string }
export interface StyrepapirTekst { fakultet: string; hentet: string | null; docs: StyrepapirDok[]; chunks: [number, number, string][] }
export interface Treff { nr: number; dok: StyrepapirDok; side: number; tekst: string; score: number; utdrag: string }

const STOPP = new Set(('og i på til av for som er det at en et med den de om ikke har var fra kan skal vil ved eller men også sin sine sitt så '
  + 'blir ble bli være vært hva hvem hvor når hvordan hvilke hvilken denne dette disse der her etter over under mot mellom inn ut opp '
  + 'jeg du vi dere han hun seg oss meg deg sier si sa mye mer mest noe noen alle hver hele the of and to in').split(' '));
const ENDELSER = ['ene', 'ane', 'ende', 'ert', 'ers', 'ens', 'ets', 'het', 'er', 'en', 'et', 'e', 'a', 's'];

export function stamme(ord: string): string {
  for (const e of ENDELSER) if (ord.length - e.length >= 4 && ord.endsWith(e)) return ord.slice(0, -e.length);
  return ord;
}
export function tokens(t: string): string[] {
  return t.toLowerCase().replace(/[^a-z0-9æøåäöéü]+/g, ' ').split(' ').filter((w) => w.length > 1 && !STOPP.has(w)).map(stamme);
}

// Synonymer: spørsmålsord som også skal finne beslektede ord i dokumentene (vektes ned til 60 %).
const SYNONYMER: Record<string, string[]> = {
  opptaksramme: ['studieplass', 'opptak'], opptaksrammer: ['studieplasser', 'opptak'], studieplasser: ['opptaksramme', 'plasser'],
  nedleggelse: ['avvikling', 'nedlegging', 'avvikle'], nedlegging: ['nedleggelse', 'avvikling'], avvikling: ['nedleggelse', 'nedlegging'],
  underskudd: ['negativt', 'merforbruk', 'resultat'], overskudd: ['mindreforbruk', 'resultat'], søkertall: ['søkere', 'førstevalgssøkere'],
  studieprogram: ['program', 'studietilbud'], nye: ['ny', 'etablering', 'oppstart'], økonomi: ['økonomisk', 'budsjett'],
  kutt: ['nedbemanning', 'innsparing', 'reduksjon'], strategi: ['strategiplan', 'handlingsplan'], samarbeid: ['avtale', 'partnerskap'],
};
const synonymStammer = (q: string) => {
  const ord = q.toLowerCase().replace(/[^a-z0-9æøåäöéü]+/g, ' ').split(' ');
  return [...new Set(ord.flatMap((w) => SYNONYMER[w] ?? []).flatMap((w) => tokens(w)))];
};

export class StyrepapirIndeks {
  private post = new Map<string, [number, number][]>();
  private len: number[] = [];
  private snitt = 0;
  constructor(public data: StyrepapirTekst) {
    data.chunks.forEach(([, , t], i) => {
      const tf = new Map<string, number>();
      const tk = tokens(t);
      tk.forEach((w) => tf.set(w, (tf.get(w) ?? 0) + 1));
      this.len[i] = tk.length;
      tf.forEach((n, w) => { let l = this.post.get(w); if (!l) this.post.set(w, (l = [])); l.push([i, n]); });
    });
    this.snitt = this.len.reduce((s, x) => s + x, 0) / Math.max(1, this.len.length);
  }

  sok(sporsmal: string, antall = 8, inst?: string): Treff[] {
    const q = [...new Set(tokens(sporsmal))];
    const syn = synonymStammer(sporsmal).filter((w) => !q.includes(w));
    const N = this.len.length, k1 = 1.4, b = 0.75;
    const score = new Map<number, number>();
    const treffOrd = new Map<number, number>();
    for (const w of [...q, ...syn]) {
      const l = this.post.get(w);
      if (!l) continue;
      const idf = Math.log(1 + (N - l.length + 0.5) / (l.length + 0.5)) * (syn.includes(w) ? 0.6 : 1);
      for (const [i, tf] of l) {
        if (inst && this.data.docs[this.data.chunks[i][0]].inst !== inst) continue;
        const s = idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * this.len[i]) / this.snitt));
        score.set(i, (score.get(i) ?? 0) + s);
        treffOrd.set(i, (treffOrd.get(i) ?? 0) + 1);
      }
    }
    // Belønn utdrag som dekker flere av ordene i spørsmålet
    const rangert = [...score.entries()].map(([i, s]) => [i, s * (1 + 0.5 * ((treffOrd.get(i) ?? 1) - 1))] as [number, number])
      .sort((a, b) => b[1] - a[1]);
    const ut: Treff[] = [];
    const sett = new Set<string>();
    const perDok = new Map<number, number>();
    for (const [i, s] of rangert) {
      const [d, side, tekst] = this.data.chunks[i];
      const key = `${d}:${side}`;
      if (sett.has(key) || (perDok.get(d) ?? 0) >= 2) continue; // én treff per side, maks to per dokument
      sett.add(key);
      perDok.set(d, (perDok.get(d) ?? 0) + 1);
      ut.push({ nr: ut.length + 1, dok: this.data.docs[d], side, tekst, score: s, utdrag: utsnitt(tekst, q) });
      if (ut.length >= antall) break;
    }
    return ut;
  }
}

/** Om lag 320 tegn rundt stedet med flest treff. */
function utsnitt(t: string, q: string[]): string {
  const ord = t.split(/(\s+)/);
  let best = 0, bestPos = 0, pos = 0;
  const vindu = 50;
  const treff = ord.map((w) => (q.includes(stamme(w.toLowerCase().replace(/[^a-z0-9æøåäöéü]/g, ''))) ? 1 : 0));
  for (let i = 0; i < ord.length; i++) {
    const n = treff.slice(i, i + vindu).reduce<number>((s, x) => s + x, 0);
    if (n > best) { best = n; bestPos = pos; }
    pos += ord[i].length;
  }
  const start = Math.max(0, bestPos - 60);
  const s = t.slice(start, start + 360).replace(/\s+/g, ' ').trim();
  return (start > 0 ? '… ' : '') + s + (start + 360 < t.length ? ' …' : '');
}

/** Deler en tekst i biter med markering av ord som matcher spørsmålet. */
export function marker(t: string, sporsmal: string): { t: string; m: boolean }[] {
  const q = new Set(tokens(sporsmal));
  return t.split(/(\s+)/).map((w) => ({ t: w, m: q.has(stamme(w.toLowerCase().replace(/[^a-z0-9æøåäöéü]/g, ''))) }));
}
