import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Sparkles, X, Send, Loader2, RotateCcw, ChevronDown, ChevronUp, FileText, BarChart2, BookOpen, PanelRight, PanelRightClose, Maximize2, Minimize2, ArrowRight } from 'lucide-react';
import { FACULTY_META } from '../data/facultyMeta';
import type { KiModus, KiNaviger } from './KiChatKnapp';
import { StyrepapirIndeks, TekstIndeks, type StyrepapirTekst, type Treff } from '../data/styrepapirSok';
import { loadFacultyBase, ALL_FACULTY_IDS, type FacultyId, type MarketInstitution } from '../data/faculties';
import { KiSvarTekst } from './KiSvarTekst';

/**
 * KI-chatten nede i hjørnet. For hvert spørsmål søker den (i nettleseren) i
 *   - nøkkeltall per program (public/ki/<fakultet>-data.json, build-ki-grunnlag.py)            → [D1..]
 *   - styrepapirene for fakultetet brukeren står på (public/markedsstatus/<fakultet>/tekst.json) → [1..] og sammendrag [S1..]
 *   - metodedokumentasjonen (public/ki/metode.json)                                              → [M1..]
 * og sender spørsmålet, de siste meldingene og de beste treffene til /api/chat (Mistral). Samtalen huskes i fanen.
 */
// gruppe, program, tekst, flagg (n = NMBU, h = hovedkonkurrent, r = rangering, o = oversikt over NMBUs program), fakultet, gruppe-id,
// og for oversiktslinjene: [fakultet, gruppe-id, programnavn] i samme rekkefølge som i teksten
type DataLinje = [string, string, string, string?, string?, string?, [string, string, string][]?];
interface Kilder { data: DataLinje[]; dok: Treff[]; sammendrag: string[]; metode: [string, string][] }
interface Melding { rolle: 'bruker' | 'assistent'; tekst: string; kilder?: Kilder; ubekreftet?: string[]; feil?: boolean; modell?: string; sporsmal?: string; omfang?: FacultyId[] }
interface Storrelse { w: number; h: number; sw: number }
const klem = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
/** Åpne/lukke-animasjonen (ms) og kurven: rask start, myk landing */
const VARIGHET = 280;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Sider i fakultetene og ordene i spørsmålet som peker dit (for «Ta meg til»), og merket på nøkkeltallslinjene for
 * den modulen (build-ki-grunnlag.py). Opptak er standard for nøkkeltall. Rekkefølgen avgjør ved flere treff.
 */
const SIDER: [RegExp, string, string, string?][] = [
  [/strategi|handlingsplan|satsing|satser på|visjon/i, 'markedsstatus', 'Markedsstatus · Strategier mot 2030', 'STRATEGIER'],
  [/gjennomf|frafall|fullf|normert tid|startkull/i, 'gjennomforing', 'Gjennomføring'],
  [/engelsk|innreisende|utveksling|utenlandsk|statsborger/i, 'studentene', 'Studentene', 'STUDENTENE'],
  [/studiebarometer|tilfreds|undervisningen\b|undervisningskvalitet|tilbakemeld|veiledning|læringsmiljø|yrkesrelevans|engasjement|vurderingsform|helhetsvurdering/i, 'studiebarometer', 'Studiebarometeret', 'STUDIEBAROMETERET'],
  [/emne|karakter|stryk|eksamen/i, 'emner', 'Emner og karakterer', 'EMNER OG KARAKTERER'],
  [/ungdomskull|\d+-åring|søkergrunnlag|befolkning|framskriv|videregående|\bvgs\b|matematikk|\bR[12]\b|\bS[12]\b|vg3|årskull/i, 'sokergrunnlag', 'Søkergrunnlaget', 'SØKERGRUNNLAGET'],
  [/fagmiljø|ansatte|tilsatte|årsverk|publiser|førstestilling|stipendiat|nivå 2|forskningsråd|forskningsmidler|forskningsfinansiering|eu-prosjekt|horizon|suksessrate/i, 'fagmiljo', 'Fagmiljøet', 'FAGMILJØET'],
  [/alder|(over|under) \d+ år|\d+ år (eller )?(eldre|yngre)|eldre enn|yngre enn|registrerte studenter/i, 'studentene', 'Studentene', 'STUDENTENE'],
  [/statsbudsjett|regnskap|driftsresultat|skolepenger|statstilskudd/i, 'okonomi', 'Økonomi'],
  [/inntekt|finansieringssystem|studiepoengproduksjon/i, 'inntekt', 'Inntekt'],
  [/arbeidsmarked|lønn|ledighet|yrke|jobb etter|nyutdannede/i, 'arbeidsmarked', 'Arbeidsmarkedet', 'ARBEIDSMARKEDET'],
  [/bolig|husleie|leiepris/i, 'bolig', 'Bolig'],
];
const finnSide = (q: string) => SIDER.find(([re]) => re.test(q));
/** Modulen en nøkkeltallslinje hører til (merket først i teksten), ellers opptak (null). */
const modulAv = (l: DataLinje) => /^(?:RANGERING )?(STUDENTENE|STUDIEBAROMETERET|EMNER OG KARAKTERER|FAGMILJØET|SØKERGRUNNLAGET|STRATEGIER|ARBEIDSMARKEDET)\b/.exec(l[2])?.[1] ?? null;
/** Moduler som ikke hører til et program, men til fakultet/institusjon (fagmiljøet) eller fylke (søkergrunnlaget). */
const FELLES_MODUL = new Set(['FAGMILJØET', 'SØKERGRUNNLAGET', 'STRATEGIER']);
/** Sidene for hele NMBU (App: Faculty-verdiene «nmbu-…»). */
/** Fakulteter med «Strategier mot 2030» i markedsstatus (som MED_STRATEGIER i FacultyMarketStatus.tsx) */
const MED_STRATEGIER = new Set<FacultyId>(['hh']);
const NMBU_SIDE: Record<string, string> = { 'nmbu-fagmiljo': 'Fagmiljøet', 'nmbu-sokergrunnlag': 'Søkergrunnlaget' };
interface Maal { fak: string; visning: string; gruppe?: string; tekst: string; anker?: string }

/** Programgrupper i kildene: vanlige linjer gir én, oversiktslinjene alle programmene de lister. */
const grupperI = (linjer: DataLinje[]) => linjer.flatMap((l) => (l[3] === 'o' && l[6] ? l[6] : l[4] ? [[l[4], l[5] ?? '', l[0]] as [string, string, string]] : []));
const utenNivaa = (navn: string) => navn.replace(/\s*\(.*$/, '').trim();
/** «Kjemi (bachelor, KBM)» → «Kjemi (bachelor)», «Økonomi og administrasjon (master) (HH)» → «… (master)» */
const utenFak = (navn: string) => navn.replace(/,\s*[A-ZÆØÅ]+\)$/, ')').replace(/\s*\([A-ZÆØÅ]+\)$/, '');
const esc = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * «Ta meg til»: siden som hører til svaret. Fakultetet er det spørsmålet gjelder (omfang), og programmet er det svaret
 * nevner først blant programmene i kildene det siterer (ellers alle kildene); står ingen nevnt, brukes det mest siterte.
 */
function finnMaal(m: Melding, fakultet: FacultyId | null, visning: string, gjeldendeGruppe?: string): Maal[] {
  const k = m.kilder;
  if (!k) return [];
  const refs = [...m.tekst.matchAll(/\[((?:[SDM]?\d+\s*,\s*)*[SDM]?\d+)\]/gi)].flatMap((x) => x[1].split(/\s*,\s*/));
  const dRefs = refs.filter((r) => /^D\d+$/i.test(r)).map((r) => k.data[Number(r.slice(1)) - 1]).filter(Boolean);
  const dokRefs = refs.filter((r) => /^\d+$/.test(r)).length;
  const iOmfang = (gs: [string, string, string][]) => { const i = gs.filter((g) => m.omfang?.includes(g[0] as FacultyId)); return m.omfang?.length && i.length ? i : gs; };
  const tekst = m.tekst.toLowerCase();
  let kand = iOmfang(grupperI(dRefs.length ? dRefs : k.data));
  const ut: Maal[] = [];
  if (kand.length) {
    const pos = (navn: string) => {
      const hel = tekst.indexOf(utenFak(navn).toLowerCase());
      if (hel >= 0) return hel - 0.5; // fullt navn med nivå slår bare programnavnet
      const re = new RegExp(`(^|[^a-zæøå])${esc(utenNivaa(navn).toLowerCase())}($|[^a-zæøå])`);
      const t = re.exec(tekst);
      return t ? t.index : Infinity;
    };
    // Nevner svaret ingen av programmene i kildene det siterer, se i alle kildene
    if (!kand.some((g) => pos(g[2]) < Infinity)) { const alle = iOmfang(grupperI(k.data)); if (alle.some((g) => pos(g[2]) < Infinity)) kand = alle; }
    const teller = new Map<string, number>();
    kand.forEach((g) => teller.set(`${g[0]}|${g[1]}`, (teller.get(`${g[0]}|${g[1]}`) ?? 0) + 1));
    const unike = [...new Map(kand.map((g) => [`${g[0]}|${g[1]}`, g])).values()];
    unike.sort((a, b) => pos(a[2]) - pos(b[2]) || (teller.get(`${b[0]}|${b[1]}`)! - teller.get(`${a[0]}|${a[1]}`)!));
    const [fk, gid, navn] = unike[0];
    const side = finnSide(m.sporsmal ?? '');
    if (NMBU_SIDE[fk]) {
      // Linjer fra sidene for hele NMBU: står brukeren på et fakultet, vis fakultetets utgave av siden
      const vis = fk === 'nmbu-sokergrunnlag' ? 'sokergrunnlag' : 'fagmiljo';
      const fakMaal = fk === 'nmbu-sokergrunnlag' && fakultet ? fakultet : null;
      if (fakMaal && visning !== vis) ut.push({ fak: fakMaal, visning: vis, tekst: `${FACULTY_META[fakMaal].shortLabel} · ${NMBU_SIDE[fk]}` });
      else if (!fakMaal) ut.push({ fak: fk, visning: 'landing', tekst: `Hele NMBU · ${NMBU_SIDE[fk]}` });
    } else if (FACULTY_META[fk as FacultyId]) {
      const fak = fk as FacultyId;
      const vis = side ? side[1] : 'analyse';
      const gruppe = (vis === 'analyse' || vis === 'emner') && gid ? gid : undefined;
      const anker = side?.[3] === 'STRATEGIER' && MED_STRATEGIER.has(fak) ? 'strategier' : undefined;
      const sidenavn = side?.[3] === 'STRATEGIER' && !anker ? 'Markedsstatus' : side ? side[2] : 'Opptak';
      if (!(fak === fakultet && vis === visning && !anker && (!gruppe || gruppe === gjeldendeGruppe))) {
        ut.push({ fak, visning: vis, gruppe, anker, tekst: `${FACULTY_META[fak].shortLabel} · ${sidenavn}${gruppe ? ` · ${utenFak(navn)}` : ''}` });
      }
    }
  }
  const dokFak = m.omfang?.length === 1 ? m.omfang[0] : fakultet;
  if (dokFak && (dokRefs > 0 || (!dRefs.length && k.dok.length && !k.data.length)) && !(visning === 'markedsstatus' && dokFak === fakultet)) {
    ut.push({ fak: dokFak, visning: 'markedsstatus', tekst: `${FACULTY_META[dokFak].shortLabel} · Markedsstatus (styrepapirene)` });
  }
  return ut.slice(0, 2);
}

/** Fakultetene spørsmålet handler om: nevnt ved navn, eller via et NMBU-program (fra oversikten over hele NMBU). */
// Forkortelser som også er vanlige ord (VET = «vet») krever store bokstaver
const FAK_ORD: [FacultyId, RegExp][] = [
  ['hh', /\bHH\b|handelsh[øo][gy]skolen/i],
  ['landsam', /\blandsam\b|landskap og samfunn/i],
  ['realtek', /\brealtek\b|realfag og teknologi/i],
  ['biovit', /\bbiovit\b|fakultet for biovitenskap/i],
  ['kbm', /\bkbm\b|kjemi, bioteknologi og mat/i],
  ['mina', /\bmina\b|miljøvitenskap og naturforvaltning/i],
  ['vet', /\bVET\b|[Vv]eterinærh[øo]gskolen/],
];
const HELE_NMBU = /hele nmbu|alle fakultet|hvilke[tn]? fakultet|på tvers av fakultet|(ved|på) nmbu\b.*(høyest|lavest|flest|færrest|best|svakest)|(høyest|lavest|flest|færrest|best|svakest).*(ved|på) nmbu\b/i;
const OVERSIKTSSPORSMAL = /høyest|lavest|\bbest|svakest|flest|færrest|hvilke[tn]? (av )?(studie|program)|ranger|alle (studie|program)|oversikt|sammenlign(e|ing)? (programm|studi)/i;
type Omfang = { fak: FacultyId[] | 'alle'; grupper: [string, string, string][]; navngitt: boolean };
function finnOmfang(q: string, alleGrupper: [string, string, string][], fakultet: FacultyId | null): Omfang | null {
  if (HELE_NMBU.test(q)) return { fak: 'alle', grupper: [], navngitt: true };
  const nevnt = FAK_ORD.filter(([, re]) => re.test(q)).map(([f]) => f);
  if (nevnt.length) return { fak: nevnt, grupper: [], navngitt: true };
  const ql = q.toLowerCase();
  // Programnavn i spørsmålet (lengste først, så «Kjemi og bioteknologi» ikke også teller som «Kjemi»)
  const navn = [...new Set(alleGrupper.map((g) => utenNivaa(g[2])))].filter((n) => n.length >= 5).sort((a, b) => b.length - a.length);
  let rest = ql; const funnet: string[] = [];
  for (const n of navn) {
    const re = new RegExp(`(^|[^a-zæøå])${esc(n.toLowerCase())}($|[^a-zæøå])`);
    if (re.test(rest)) { funnet.push(n); rest = rest.replace(re, '$1 $2'); }
  }
  if (!funnet.length) return null;
  let grupper = alleGrupper.filter((g) => funnet.includes(utenNivaa(g[2])));
  if (fakultet && grupper.some((g) => g[0] === fakultet)) grupper = grupper.filter((g) => g[0] === fakultet);
  return { fak: [...new Set(grupper.map((g) => g[0] as FacultyId))], grupper, navngitt: false };
}

const LAGRING = 'ki-chat-samtale';
const base = () => import.meta.env.BASE_URL;
const hentJson = async <T,>(fil: string): Promise<T | null> => {
  try { const r = await fetch(`${base()}${fil}`); return r.ok && (r.headers.get('content-type') ?? '').includes('json') ? ((await r.json()) as T) : null; } catch { return null; }
};

// Indeksene bygges én gang per fane og gjenbrukes
const cache = new Map<string, Promise<unknown>>();
function engang<T>(nokkel: string, lag: () => Promise<T>): Promise<T> {
  if (!cache.has(nokkel)) {
    // Mislykkede hentinger (null eller feil) glemmes, så neste spørsmål prøver igjen
    const p = lag().then((v) => { if (v == null) cache.delete(nokkel); return v; }, (e) => { cache.delete(nokkel); throw e; });
    cache.set(nokkel, p);
  }
  return cache.get(nokkel) as Promise<T>;
}
const dataFil = (f: string) => engang(`fil:${f}`, () => hentJson<{ linjer: DataLinje[] }>(`ki/${f}-data.json`));
/** Nøkkeltallene for fakultetene i omfanget; flere fakulteter (eller hele NMBU) får også oversikten over hele NMBU. */
const dataIndeks = (fak: FacultyId[] | 'alle') => {
  const liste = fak === 'alle' ? [...ALL_FACULTY_IDS] : fak;
  const filer: string[] = [...liste, ...(liste.length > 1 ? ['nmbu'] : []), 'felles'];
  return engang(`data:${filer.join(',')}`, async () => {
    const d = await Promise.all(filer.map(dataFil));
    return new TekstIndeks<DataLinje>(d.flatMap((f) => f?.linjer ?? []), (l) => l[2]);
  });
};
const metodeIndeks = () => engang('metode', async () => {
  const m = await hentJson<{ avsnitt: [string, string][] }>('ki/metode.json');
  return new TekstIndeks<[string, string]>(m?.avsnitt ?? [], (a) => `${a[0]} ${a[1]}`);
});
const dokIndeks = (fak: FacultyId) => engang(`dok:${fak}`, async () => {
  const [t, b] = await Promise.all([hentJson<StyrepapirTekst>(`markedsstatus/${fak}/tekst.json`), loadFacultyBase(fak)]);
  return { indeks: t ? new StyrepapirIndeks(t) : null, institusjoner: b.marketStatus as MarketInstitution[] };
});

/**
 * Nøkkeltall til modellen: finner programgruppen spørsmålet handler om (flest av de beste treffene) og sender da
 * NMBUs program først, så hovedkonkurrentene og de mest relevante av de andre i gruppen. Treff i andre grupper tas med
 * etterpå hvis det er plass. Uten tydelig gruppe brukes de beste treffene som de er. Spørsmål om et helt fakultet
 * (eller hele NMBU) får oversiktslinjene over NMBUs egne program først.
 */
/** De n mest relevante linjene for spørsmålet innen et utvalg; treffer ingen, de første n. */
function relevante(linjer: DataLinje[], q: string, n: number): DataLinje[] {
  if (linjer.length <= n) return linjer;
  const t = new TekstIndeks<DataLinje>(linjer, (l) => l[2]).sok(q, n);
  return [...t, ...linjer.filter((l) => !t.includes(l))].slice(0, n);
}

function velgData(di: TekstIndeks<DataLinje>, q: string, sokeTekst: string, omfang: Omfang | null, heleNmbu: boolean): DataLinje[] {
  const treff = di.sok(q, 40).concat(di.sok(sokeTekst, 20)).filter((l, i, a) => a.indexOf(l) === i);
  const rang = (l: DataLinje) => { const i = treff.indexOf(l); return i < 0 ? 999 : i; };
  const modul = finnSide(q)?.[3] ?? null;
  // Fagmiljøet og søkergrunnlaget: linjene for modulen, mest relevante først, og så de beste andre treffene
  if (modul && FELLES_MODUL.has(modul)) {
    const valgt = di.elementer.filter((l) => modulAv(l) === modul).sort((a, b) => rang(a) - rang(b)).slice(0, 14);
    // Uten linjer for modulen her (f.eks. strategier for andre fakulteter enn HH) brukes vanlig utvalg
    if (valgt.length) return [...valgt, ...treff.filter((l) => !valgt.includes(l)).slice(0, 19 - valgt.length)];
    if (modul === 'STRATEGIER') return []; // bare styrepapirene har noe å si om strategier her
  }
  // Programlinjer for modulen spørsmålet gjelder (uten modul: opptakslinjene); rangeringer og oversikter alltid
  // Studentene: engelskandel og innreisende står i opptakslinjene, så de tas med der
  const passer = (l: DataLinje) => l[3] === 'r' || l[3] === 'o' || modulAv(l) === modul || (modul === 'STUDENTENE' && modulAv(l) === null);
  // Hele NMBU: oversikten på tvers av fakultetene; ellers oversikten per fakultet
  const oversikt = di.elementer.filter((l) => l[3] === 'o' && (l[0] === 'Oversikt hele NMBU') === heleNmbu);
  const fokusOversikt = oversikt.length > 0 && !omfang?.grupper.length && (OVERSIKTSSPORSMAL.test(q) || !!omfang?.navngitt);
  // Egen rangering blant oversiktslinjene: i hele indeksen drukner de i programlinjer med de samme ordene
  const forst = fokusOversikt ? relevante(oversikt, q, 8) : [];
  // Er programmet nevnt i spørsmålet, er det gruppen
  const nevnt = omfang?.grupper.length ? new Set(omfang.grupper.map((g) => `${g[0]}|${g[1]}`)) : null;
  const topp = treff.filter((l) => l[3] !== 'o' && passer(l) && !FELLES_MODUL.has(modulAv(l) ?? '')).slice(0, 8);
  const teller = new Map<string, number>();
  topp.forEach((l) => teller.set(l[0], (teller.get(l[0]) ?? 0) + 1));
  let [gruppe, antall] = [...teller.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['', 0];
  if (nevnt) { const g = di.elementer.find((l) => l[3] !== 'o' && l[5] && nevnt.has(`${l[4]}|${l[5]}`)); if (g) { gruppe = g[0]; antall = 99; } }
  const resten = treff.filter((l) => !forst.includes(l));
  if (!gruppe || antall < 3) {
    // Ingen tydelig programgruppe: linjer for modulen først (NMBUs egne øverst), så de andre treffene. Er det få
    // modultreff i søket, fylles det på med NMBUs linjer for modulen i hele fakultetet.
    const rP = resten.filter(passer);
    const ekstra = rP.length < 6 ? di.elementer.filter((l) => l[3] === 'n' && passer(l) && !rP.includes(l)).sort((a, b) => rang(a) - rang(b)).slice(0, 8) : [];
    const ut = [...forst, ...rP.filter((l) => l[3] === 'n'), ...ekstra, ...rP.filter((l) => l[3] !== 'n'), ...resten.filter((l) => !passer(l))];
    return ut.filter((l, i) => ut.indexOf(l) === i).slice(0, 12);
  }
  const iGruppe = di.elementer.filter((l) => l[0] === gruppe && l[3] !== 'o' && passer(l));
  const valgt = [
    ...forst,
    ...relevante(iGruppe.filter((l) => l[3] === 'r'), q, 4),
    ...iGruppe.filter((l) => l[3] === 'n'),
    ...iGruppe.filter((l) => l[3] === 'h').sort((a, b) => rang(a) - rang(b)),
    ...iGruppe.filter((l) => l[3] === 'e').sort((a, b) => rang(a) - rang(b)).slice(0, 5),
    ...iGruppe.filter((l) => !l[3]).sort((a, b) => rang(a) - rang(b)).slice(0, 6),
  ].slice(0, 18);
  return [...valgt, ...resten.filter((l) => l[0] !== gruppe).slice(0, Math.max(1, 19 - valgt.length))];
}

function forslag(visning: string, fak: FacultyId | null): string[] {
  const nmbu = fak === 'hh' ? 'økonomi og administrasjon' : 'programmene våre';
  const f: Record<string, string[]> = {
    analyse: [`Hvordan ligger poenggrensen for ${nmbu} an mot konkurrentene i 2026?`, 'Hvilke konkurrenter tok opp alle kvalifiserte søkere?', 'Hvordan er tilbudsandel regnet ut?'],
    markedsstatus: ['Hvilke konkurrenter planlegger nye studieprogram?', 'Hvem har økonomiske utfordringer i 2025?', 'Hva sier konkurrentene om opptaksrammer?'],
    gjennomforing: ['Hvilke program har høyest frafall?', 'Hvordan er gjennomføringen vår mot konkurrentene?'],
    studentene: ['Hvor stor andel av undervisningen er på engelsk hos oss og konkurrentene?', 'Hvordan måles innreisende utvekslingsstudenter?'],
  };
  return f[visning] ?? (fak ? [`Hvordan ligger ${nmbu} an mot konkurrentene?`, 'Hvilke konkurrenter planlegger nye studieprogram?', 'Hvordan er tallene på siden hentet?'] : ['Hvilke fakulteter har program som sliter med å fylle opp?', 'Hvordan er tallene på siden hentet?', 'Hva endres i opptaksreglene fra 2028?']);
}

export function KiChatPanel({ apen, lukk, fakultet, visning, sted, modus, setModus, naviger, gruppe }: {
  apen: boolean; lukk: () => void; fakultet: FacultyId | null; visning: string; sted: string; modus: KiModus; setModus: (m: KiModus) => void; naviger: KiNaviger; gruppe?: string;
}) {
  const [str, setStr] = useState<Storrelse>(() => { try { return { w: 440, h: 640, sw: 460, ...JSON.parse(localStorage.getItem('ki-chat-storrelse') ?? '{}') }; } catch { return { w: 440, h: 640, sw: 460 }; } });
  const [liten, setLiten] = useState(() => window.innerWidth < 640);
  useEffect(() => { const f = () => setLiten(window.innerWidth < 640); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  // Animasjon: panelet ligger i DOM-en (vist) litt lenger enn det er åpent, så det kan gli ut; «inne» styrer overgangen
  const [vist, setVist] = useState(apen);
  const [inne, setInne] = useState(false);
  useEffect(() => {
    if (apen) {
      setVist(true);
      let r2 = 0;
      const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setInne(true)); });
      return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
    }
    setInne(false);
    const t = setTimeout(() => setVist(false), VARIGHET);
    return () => clearTimeout(t);
  }, [apen]);
  useEffect(() => { try { localStorage.setItem('ki-chat-storrelse', JSON.stringify(str)); } catch { /* ikke lagret */ } }, [str]);
  // Som sidepanel skyves siden til venstre, så man ser data og chat side om side
  useEffect(() => {
    const rot = document.documentElement;
    const pa = apen && modus === 'side' && !liten;
    document.body.style.transition = `padding-right ${VARIGHET}ms ${EASE}`;
    document.body.style.paddingRight = pa ? `${str.sw}px` : '';
    if (pa) rot.style.setProperty('--ki-side', `${str.sw}px`); else rot.style.removeProperty('--ki-side');
    return () => { document.body.style.paddingRight = ''; rot.style.removeProperty('--ki-side'); };
  }, [apen, modus, str.sw, liten]);
  // Dra i kanten eller hjørnet for å endre størrelse
  const dra = (e: RPointerEvent, akse: 'w' | 'h' | 'wh') => {
    e.preventDefault();
    const x0 = e.clientX, y0 = e.clientY, s0 = { ...str };
    const flytt = (ev: PointerEvent) => {
      const dx = x0 - ev.clientX, dy = y0 - ev.clientY;
      setStr((s) => modus === 'side'
        ? { ...s, sw: klem(s0.sw + dx, 320, window.innerWidth * 0.7) }
        : { ...s, w: akse === 'h' ? s.w : klem(s0.w + dx, 340, window.innerWidth - 40), h: akse === 'w' ? s.h : klem(s0.h + dy, 380, window.innerHeight - 100) });
    };
    const slipp = () => { window.removeEventListener('pointermove', flytt); window.removeEventListener('pointerup', slipp); window.removeEventListener('pointercancel', slipp); document.body.style.userSelect = ''; };
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', flytt); window.addEventListener('pointerup', slipp); window.addEventListener('pointercancel', slipp);
  };
  const gaaTil = (mm: Maal) => {
    // Ankeret velger fanen på siden (Strategier mot 2030 i markedsstatus); settes før navigeringen så siden leser det ved oppstart
    if (mm.anker) location.hash = mm.anker; else if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    naviger(mm.fak, mm.visning, mm.gruppe); if (liten) lukk();
  };
  const [meldinger, setMeldinger] = useState<Melding[]>(() => { try { return JSON.parse(sessionStorage.getItem(LAGRING) ?? '[]'); } catch { return []; } });
  const [tekst, setTekst] = useState('');
  const [venter, setVenter] = useState(false);
  const bunn = useRef<HTMLDivElement>(null);
  const felt = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { try { sessionStorage.setItem(LAGRING, JSON.stringify(meldinger.slice(-20))); } catch { /* ikke lagret */ } }, [meldinger]);
  useEffect(() => { bunn.current?.scrollIntoView({ block: 'end' }); }, [meldinger, venter, apen]);
  useEffect(() => {
    if (!apen) return;
    const t = setTimeout(() => felt.current?.focus(), 50);
    // Escape lukker chatten (fokus går tilbake til knappen, se KiChatKnapp)
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && !e.defaultPrevented) lukk(); };
    window.addEventListener('keydown', esc);
    return () => { clearTimeout(t); window.removeEventListener('keydown', esc); };
  }, [apen]);

  const send = async (sporsmal: string) => {
    const q = sporsmal.trim();
    if (!q || venter) return;
    setTekst('');
    const historikk = meldinger.filter((m) => !m.feil).slice(-6).map((m) => ({ rolle: m.rolle, tekst: m.tekst }));
    setMeldinger((m) => [...m, { rolle: 'bruker', tekst: q }]);
    setVenter(true);
    try {
      // Søket bruker også forrige spørsmål, så følgespørsmål («og for master?») finner riktige kilder
      const forrige = [...meldinger].reverse().find((m) => m.rolle === 'bruker')?.tekst ?? '';
      const sokeTekst = `${q} ${forrige}`;
      // Hvilke fakulteter spørsmålet gjelder: nevnt i spørsmålet, ellers i forrige spørsmål, ellers der brukeren står
      const alleGrupper = grupperI((await dataFil('nmbu'))?.linjer.slice(0, 1) ?? []);
      const omfang = finnOmfang(q, alleGrupper, fakultet) ?? (forrige ? finnOmfang(forrige, alleGrupper, fakultet) : null);
      const faks: FacultyId[] | 'alle' = omfang?.fak ?? (fakultet ? [fakultet] : 'alle');
      const dokFak = faks !== 'alle' && faks.length === 1 ? faks[0] : fakultet;
      const [di, mi, dk] = await Promise.all([dataIndeks(faks), metodeIndeks(), dokFak ? dokIndeks(dokFak) : Promise.resolve(null)]);
      const data = velgData(di, q, sokeTekst, omfang, faks === 'alle');
      const omfangTekst = faks === 'alle' ? 'hele NMBU (alle fakultetene)'
        : [faks.map((f) => `${FACULTY_META[f].shortLabel} (${FACULTY_META[f].label})`).join(', '),
          omfang?.grupper.length ? `programmet ${[...new Set(omfang.grupper.map((g) => utenFak(g[2].replace(/\s+–\s+.*$/, ''))))].join(' / ')}` : ''].filter(Boolean).join(', ');
      const metode = mi.sok(q, 3);
      const dok = dk?.indeks ? dk.indeks.sok(sokeTekst, 6) : [];
      const inst = [...new Set(dok.map((t) => t.dok.inst))].slice(0, 4);
      const sam = inst.map((n) => dk?.institusjoner.find((i) => i.name === n)).filter((i): i is MarketInstitution => !!i);
      const kilder: Kilder = { data, dok, sammendrag: sam.map((s) => s.name), metode };
      const r = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sporsmal: q, historikk, sted, omfang: omfangTekst,
          kilder: {
            data: data.map((l) => ({ tittel: `${l[0]} · ${l[1]}`, tekst: l[2] })),
            dok: dok.map((t) => ({ inst: t.dok.inst, dok: t.dok.label, dato: t.dok.dato, side: t.side, tekst: t.tekst })),
            sammendrag: sam.map((s) => ({ inst: s.name, enhet: s.enhet, oppsummering: s.oppsummering, punkter: s.punkter })),
            metode: metode.map((m) => ({ tittel: m[0], tekst: m[1] })),
          },
        }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.svar) throw new Error(j?.feil ?? (r.status === 404 ? 'KI-chatten er bare tilgjengelig på den publiserte siden.' : `Feil ${r.status}`));
      setMeldinger((m) => [...m, { rolle: 'assistent', tekst: j.svar, kilder, ubekreftet: j.ubekreftet, modell: j.modell, sporsmal: q, omfang: faks === 'alle' ? undefined : faks }]);
    } catch (e) {
      setMeldinger((m) => [...m, { rolle: 'assistent', tekst: e instanceof Error ? e.message : 'Noe gikk galt.', feil: true }]);
    } finally { setVenter(false); }
  };

  if (!vist) return null;
  const skjult = liten ? 'translateY(28px)' : modus === 'side' ? 'translateX(36px)' : modus === 'stor' ? 'translateY(12px) scale(0.98)' : 'translateY(16px) scale(0.95)';
  const rolig = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <div className={`fixed z-[80] flex flex-col overflow-hidden ${liten || modus === 'side' ? '' : 'rounded-2xl'}`}
      style={{
        backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
        opacity: inne ? 1 : 0, transform: inne ? 'none' : skjult, transformOrigin: modus === 'flytende' && !liten ? 'bottom right' : 'center',
        transition: rolig ? 'none' : `opacity ${VARIGHET - 60}ms ease-out, transform ${VARIGHET}ms ${EASE}`, pointerEvents: inne ? undefined : 'none',
        ...(liten ? { inset: 0 }
          : modus === 'side' ? { top: 0, right: 0, bottom: 0, width: str.sw, borderTop: 'none', borderBottom: 'none', borderRight: 'none' }
          : modus === 'stor' ? { top: '4vh', bottom: '4vh', left: 'max(20px, calc(50vw - 600px))', right: 'max(20px, calc(50vw - 600px))' }
          : { right: 20, bottom: 84, width: str.w, height: str.h }),
      }}
      role="dialog" aria-label="KI-chat">
      {/* Håndtak for å endre størrelse (ikke på mobil eller i stort vindu) */}
      {!liten && modus !== 'stor' && (
        <>
          <div onPointerDown={(e) => dra(e, 'w')} title="Dra for å endre bredden" className="absolute left-0 top-0 bottom-0 z-10" style={{ width: 6, cursor: 'ew-resize' }} />
          {modus === 'flytende' && <div onPointerDown={(e) => dra(e, 'h')} className="absolute left-0 right-0 top-0 z-10" style={{ height: 6, cursor: 'ns-resize' }} />}
          {modus === 'flytende' && <div onPointerDown={(e) => dra(e, 'wh')} title="Dra for å endre størrelsen" className="absolute left-0 top-0 z-20" style={{ width: 14, height: 14, cursor: 'nwse-resize' }} />}
        </>
      )}
      {/* Topp */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>
        <Sparkles className="w-4 h-4 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">Spør KI om dataene</div>
          <div className="text-xs truncate" style={{ opacity: 0.75 }}>Du står på: {sted}</div>
        </div>
        {!liten && (
          <>
            <button onClick={() => setModus(modus === 'side' ? 'flytende' : 'side')} title={modus === 'side' ? 'Løsne til flytende vindu' : 'Fest som sidepanel (se siden og chatten samtidig)'} className="p-1.5 rounded-lg" style={{ backgroundColor: modus === 'side' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)' }}>
              {modus === 'side' ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
            </button>
            <button onClick={() => setModus(modus === 'stor' ? 'flytende' : 'stor')} title={modus === 'stor' ? 'Mindre vindu' : 'Stort vindu'} className="p-1.5 rounded-lg" style={{ backgroundColor: modus === 'stor' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)' }}>
              {modus === 'stor' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </>
        )}
        {meldinger.length > 0 && (
          <button onClick={() => setMeldinger([])} title="Ny samtale" className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}><RotateCcw className="w-4 h-4" /></button>
        )}
        <button onClick={lukk} title="Lukk" className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}><X className="w-4 h-4" /></button>
      </div>

      {/* Meldinger */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
        {meldinger.length === 0 && (
          <div className="text-sm" style={{ color: 'var(--nmbu-neutral-1)', lineHeight: 1.6 }}>
            <p className="mb-2">Still spørsmål om studieprogrammene, konkurrentene og tallene på nettsiden. Svarene bygger på nøkkeltallene, styrepapirene{fakultet ? '' : ' (velg et fakultet for styrepapirene)'} og metodebeskrivelsen, med kilder.</p>
            <div className="flex flex-col gap-1.5">
              {forslag(visning, fakultet).map((f) => (
                <button key={f} onClick={() => send(f)} className="text-left text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-green-dark)' }}>{f}</button>
              ))}
            </div>
          </div>
        )}
        {meldinger.map((m, i) => (m.rolle === 'bruker'
          ? <div key={i} className="ml-8 rounded-2xl rounded-br-sm px-3 py-2 text-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff' }}>{m.tekst}</div>
          : <Svar key={i} m={m} maal={finnMaal(m, fakultet, visning, gruppe)} gaaTil={gaaTil} />))}
        {venter && <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}><Loader2 className="w-3.5 h-3.5 animate-spin" /> Søker i kildene og skriver svar …</div>}
        <div ref={bunn} />
      </div>

      {/* Skrivefelt */}
      <form onSubmit={(e) => { e.preventDefault(); send(tekst); }} className="flex items-end gap-2 px-3 py-3" style={{ borderTop: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
        <textarea ref={felt} value={tekst} onChange={(e) => setTekst(e.target.value)} rows={1} maxLength={600}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(tekst); } }}
          placeholder="Skriv et spørsmål …" className="flex-1 resize-none px-3 py-2 rounded-xl text-sm"
          style={{ border: '1px solid var(--nmbu-neutral-3)', maxHeight: 120, backgroundColor: '#fff', color: 'var(--nmbu-neutral)' }} />
        <button type="submit" disabled={venter || !tekst.trim()} className="p-2.5 rounded-xl" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', opacity: venter || !tekst.trim() ? 0.5 : 1 }} aria-label="Send">
          <Send className="w-4 h-4" />
        </button>
      </form>
      <div className="px-4 pb-2 text-[10px]" style={{ color: 'var(--nmbu-neutral-2)', backgroundColor: '#fff' }}>Mistral (EU). KI kan ta feil; sjekk kildene. Ikke skriv personopplysninger.</div>
    </div>
  );
}

function Svar({ m, maal, gaaTil }: { m: Melding; maal: Maal[]; gaaTil: (mm: Maal) => void }) {
  const [visKilder, setVisKilder] = useState(false);
  if (m.feil) return <div className="mr-6 rounded-2xl px-3 py-2 text-xs" style={{ backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>{m.tekst}</div>;
  const k = m.kilder;
  const lenke = (t: Treff) => `${t.dok.fil}#page=${t.side}`;
  const antall = k ? k.data.length + k.dok.length + k.metode.length : 0;
  return (
    <div className="mr-4 rounded-2xl rounded-bl-sm px-3 py-2 text-sm" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral)', lineHeight: 1.6 }}>
      <KiSvarTekst tekst={m.tekst} kilde={(ref) => {
        if (!k) return null;
        const d = ref.match(/^D(\d+)$/i); if (d && k.data[Number(d[1]) - 1]) { const l = k.data[Number(d[1]) - 1]; return { tekst: `D${d[1]}`, tittel: `Nøkkeltall: ${l[0]} · ${l[1]}` }; }
        const me = ref.match(/^M(\d+)$/i); if (me && k.metode[Number(me[1]) - 1]) return { tekst: `M${me[1]}`, tittel: `Metode: ${k.metode[Number(me[1]) - 1][0]}` };
        const s = ref.match(/^S(\d+)$/i); if (s && k.sammendrag[Number(s[1]) - 1]) return { tekst: `S${s[1]}`, tittel: `Sammendraget for ${k.sammendrag[Number(s[1]) - 1]} i markedsstatus` };
        const t = /^\d+$/.test(ref) ? k.dok[Number(ref) - 1] : undefined;
        return t ? { tekst: ref, tittel: `${t.dok.inst}: ${t.dok.label}, side ${t.side}`, href: lenke(t) } : null;
      }} />
      {m.ubekreftet && m.ubekreftet.length > 0 && (
        <div className="text-xs rounded px-2 py-1 mt-1" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', color: '#78350F' }}>
          Kontroll: disse tallene står ikke i kildene og kan være beregnet eller feil: <b>{m.ubekreftet.join(', ')}</b>.
        </div>
      )}
      {maal.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {maal.map((mm) => (
            <button key={mm.tekst} onClick={() => gaaTil(mm)} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
              style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 600 }} title="Åpne siden med tallene bak svaret">
              Ta meg til: {mm.tekst} <ArrowRight className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}
      {k && antall > 0 && (
        <div className="mt-1.5">
          <button onClick={() => setVisKilder((v) => !v)} className="flex items-center gap-1 text-xs" style={{ color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>
            {visKilder ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />} Kilder ({antall})
          </button>
          {visKilder && (
            <ul className="mt-1 space-y-1 text-xs" style={{ color: 'var(--nmbu-neutral-1)' }}>
              {k.data.map((l, i) => <li key={`d${i}`} className="flex gap-1.5"><BarChart2 className="w-3 h-3 mt-0.5 shrink-0" /><span><b>D{i + 1}</b> Nøkkeltall: {l[0]} · {l[1]}</span></li>)}
              {k.dok.map((t, i) => <li key={`k${i}`} className="flex gap-1.5"><FileText className="w-3 h-3 mt-0.5 shrink-0" /><a href={lenke(t)} target="_blank" rel="noreferrer" style={{ color: 'var(--nmbu-green-dark)' }}><b>{i + 1}</b> {t.dok.inst}: {t.dok.label}, side {t.side}</a></li>)}
              {k.metode.map((mm, i) => <li key={`m${i}`} className="flex gap-1.5"><BookOpen className="w-3 h-3 mt-0.5 shrink-0" /><span><b>M{i + 1}</b> Metode: {mm[0]}</span></li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
