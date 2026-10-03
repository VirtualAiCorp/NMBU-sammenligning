# Etterprøving 5: modellen i Handelshøyskolerangeringen

Uavhengig gjenberegning i Python av `Handelshoyskolerangering.tsx` (`lagIndikatorer`, `lagResultat`, `trinnFor`, `effektiveVekter`, `beregn`) mot `rangering-klartekst.json`. Dato 03.10.2026.

## Konklusjon

- **Ingen avvik.** Python gir nøyaktig de samme poengsummene som appen med standardvekter (alle 15 avrundede tall stemmer), og nøyaktig de samme plassene for alle 15 skoler og alle 8 trinn for forskningsandel (50–85 %). Totalt 120 av 120 plasser er like.
- **Ingen logiske feil funnet** i de seks punktene du ba om å få sjekket (se tabell 3). Delt plass, `plassI` med null, referanser utenfor normaliseringen (når «med referanser» er av), vekt-0-indikator og `ceil(n/3)` virker som beskrevet.
- **Tre forhold som er valg i modellen, ikke feil, men som bør stå i metodeteksten:**
  1. Nivå 0 og «u» løftes av ABDC/FT50 (32 artikler i alt over 2021–25 over de 15 skolene, største effekt BI med 10 og INN med 6). Rangeringen endres ikke av det (plassene er identiske uten løfting).
  2. Manglende AJG 4/4* (ajgNhh) rammer 7 av 15 skoler. Vekten (10 av 75) fordeles på alle andre mål, også i utdanning, ikke bare i forskning. Rangeringen er følsom for dette: uten ajgNhh blir topp 3 ved 75 % UiA, UiS og NHH (NTNU faller fra 1 til 5).
  3. Slår man på «med referanser», blir også referansene med i min–maks-grunnlaget og får plass; de 15 skolene flyttes ned (HH NMBU 6 til 9, Nord 13 til 17), fordi tre store referanser (NTNU ØK m.fl.) kommer inn i rekken. Det er riktig oppførsel, men tallene er ikke sammenlignbare med visningen uten referanser.
- **Robusthet:** de samme fem skolene (NHH, NTNU, BI, UiS, UiA) er topp 5 ved alle 8 trinn og med alle tre metodene (min–maks, rangsum, z-skår). Rekkefølgen innad i topp 5 er derimot ikke robust, særlig ved rangsum (se tabell 4).

## 1. Poengsum ved standardvekter (forskning 75 %)

Y1 = 2025 (sisteDbhAar), lagdelt periode 2021–2025, nevner `uff`, vekter 1/3/5, brøktelling. Normalisering blant de 15 skolene som ikke er referanser.

| Plass | Skole | Python (2 desimaler) | Python avrundet | Appen viste | Avvik | Mangler n mål |
|---|---|---|---|---|---|---|
| 1 | NTNU | 74,58 | 75 | 75 | 0 | 0 |
| 2 | NHH | 73,27 | 73 | 73 | 0 | 0 |
| 3 | UiA | 71,22 | 71 | 71 | 0 | 0 |
| 4 | BI | 70,97 | 71 | 71 | 0 | 2 (poenggrense, førstevalg) |
| 5 | UiS | 69,77 | 70 | 70 | 0 | 0 |
| 6 | HH NMBU | 44,47 | 44 | 44 | 0 | 0 |
| 7 | OsloMet | 43,46 | 43 | 43 | 0 | 1 (ajgNhh) |
| 8 | INN | 41,49 | 41 | 41 | 0 | 2 (ajgNhh, Studiebarometer) |
| 9 | Kristiania | 39,34 | 39 | 39 | 0 | 3 (ajgNhh, poenggrense, førstevalg) |
| 10 | HiMolde | 37,93 | 38 | 38 | 0 | 2 (ajgNhh, poenggrense) |
| 11 | USN | 32,59 | 33 | 33 | 0 | 1 (ajgNhh) |
| 12 | HVL | 22,03 | 22 | 22 | 0 | 1 (ajgNhh) |
| 13 | Nord | 20,63 | 21 | 21 | 0 | 1 (poenggrense) |
| 14 | UiT | 20,36 | 20 | 20 | 0 | 0 |
| 15 | HiØ | 5,89 | 6 | 6 | 0 | 2 (ajgNhh, poenggrense) |

Merk at de 5 øverste ligger innenfor 4,8 poeng, og at toppen (NTNU 74,6 mot NHH 73,3) er en forskjell på 1,3 poeng. Skille mellom plass 5 og 6 er stort (25 poeng).

## 2. Plasser ved forskningsandel 50–85 %

Alle celler er sammenlignet med de oppgitte plassene. Alle stemmer.

| Skole | 50 | 55 | 60 | 65 | 70 | 75 | 80 | 85 | Python = oppgitt |
|---|---|---|---|---|---|---|---|---|---|
| NHH | 1 | 1 | 1 | 1 | 1 | 2 | 3 | 5 | ja |
| NTNU | 2 | 2 | 2 | 2 | 2 | 1 | 1 | 2 | ja |
| BI | 3 | 3 | 3 | 3 | 3 | 4 | 5 | 4 | ja |
| UiS | 4 | 4 | 5 | 5 | 5 | 5 | 4 | 3 | ja |
| UiA | 5 | 5 | 4 | 4 | 4 | 3 | 2 | 1 | ja |
| OsloMet | 6 | 6 | 6 | 6 | 6 | 7 | 8 | 9 | ja |
| HH NMBU | 7 | 7 | 7 | 7 | 7 | 6 | 6 | 7 | ja |
| HiMolde | 8 | 9 | 9 | 10 | 10 | 10 | 10 | 10 | ja |
| Kristiania | 9 | 8 | 8 | 9 | 9 | 9 | 9 | 8 | ja |
| HVL | 10 | 11 | 12 | 12 | 12 | 12 | 14 | 14 | ja |
| INN | 11 | 10 | 10 | 8 | 8 | 8 | 7 | 6 | ja |
| USN | 12 | 12 | 11 | 11 | 11 | 11 | 11 | 11 | ja |
| Nord | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | ja |
| UiT | 14 | 14 | 14 | 14 | 14 | 14 | 12 | 12 | ja |
| HiØ | 15 | 15 | 15 | 15 | 15 | 15 | 15 | 15 | ja |

Nærmeste to poengsummer ved hvert trinn er minst 0,05 poeng fra hverandre (trinn 60), ellers 0,15–0,29. Ingen faktiske likheter, så delt plass inntreffer ikke i dagens data.

## 3. Logikksjekk av TypeScript-koden

| Punkt | Funn | Vurdering |
|---|---|---|
| Delt plass ved like poeng | `1 + antall med strengt høyere poeng + 1e-9` gir konkurranserangering (1,2,2,4). Ingen like poeng i data (minste avstand 0,05). | Riktig. Toleransen 1e-9 er ikke transitiv i teorien, men uten betydning. |
| `plassI` og null | `v == null` gir null, og null-verdier telles ikke som «høyere». | Riktig. Liten ulikhet: `norm` gir null når færre enn 2 verdier finnes, men `plassI` gir likevel en plass. Uten effekt i dagens data. |
| Normalisering og referanser | `verdier` bygges fra `skoler` som er filtrert med `t.medRef \|\| !s.referanse`. Referansene er altså utenfor som standard og med når «med referanser» er på. | Riktig og tilsiktet. Effekt av «med referanser» på de 15 (Python, forskning 75): HH NMBU 6 til 9, Nord 13 til 17, HiØ 15 til 18 (referansene tar plassene 6–8). Normaliserer man med alle 18 men rangerer bare de 15, flytter bare Nord (14) og UiT (13). |
| ABDC A/A* (vekt 0) og «mangler n mål» | `mangler` telles bare når `eut[id] > 0`. Vekt-0-indikatoren (abdcA) har dessuten verdi for alle skoler. | Riktig. Påvirker ikke tellingen. |
| Lagdelt mål, nivå 0 og «u» | `trinnFor` gir norsk nivå 0 og «u» trinnet `null`, som har vekt 0 i `vektet` (bare basis/hoy/topp summeres). Men ABDC eller FT50 kan løfte dem: 32 slike artikler totalt (BI 10, INN 6, NHH 4, UiA 3, NTNU 2, Kristiania 2, HiØ 1, HH NMBU 1, UiS 1, Nord 1, UiT 1; øvrige 0). Uten løfting er alle plasser uendret ved 75 %, 50 % og 85 %. | Ikke en feil. Valget («høyeste nivå teller») bør nevnes: en nivå-0-artikkel i et ABDC-A-tidsskrift telles som «høy». |
| Grupper med tredjedeler | `ceil(n/3)` og `ceil(2n/3)`; n = antall med plass. n = 15 gir 5/5/5, n = 18 (med referanser) gir 6/6/6, n = 16 gir 6/5/5. | Riktig. |
| Tidsvindu og nevner | Artikler summeres over 5 år og deles på gjennomsnittlig uff per år (ikke sum over 5 år). Det gir en konstant faktor 5 for alle skoler og påvirker ikke min–maks. HVL mangler DBH 2021–2023, så nevneren er snitt av 2024–25 (ingen feil, men svakere grunnlag). | Riktig. |
| Fordeling av manglende vekt | `sum / w` fordeler vekten til manglende mål forholdsmessig på alle øvrige mål (også i andre dimensjoner). Skole uten ajgNhh får utdanningsandel 20 / 90 = 22 % mot 20 % ellers. | Som beskrevet i oppdraget, men gir et skjevt grunnlag for 7 skoler. Se konklusjon punkt 2. |
| Akkrediteringsmål | Teller alle oppføringer med AACSB/EQUIS/AMBA i navn/type, uavhengig av status. NHH 3, BI 3, HH NMBU 1, UiA 1, øvrige 0. UiS og USN har «EFMD Programme Accreditation» som ikke teller (riktig, det er programakkreditering). AMBA hos NHH gjelder bare Executive MBA, men teller likt. | Riktig i koden. AMBA-nyansen er et metodevalg. |
| Merkelapp | Indikatoren «Poeng per faglig årsverk» bruker `poengPerUff` (publiseringspoeng / UN1+UN2 inkl. rekruttering), ikke `poengPerFaglig` (som i dataene er delt på `utenStip`). Forklaringsteksten beskriver det riktig. | Navnet er løst formulert, tallene er riktige. |

Følsomhet for ajgNhh (min–maks, standard ellers):

| Forskningsandel | NHH | NTNU | BI | UiS | UiA | HH NMBU |
|---|---|---|---|---|---|---|
| 50 (standard) | 1 | 2 | 3 | 4 | 5 | 7 |
| 50 (ajgNhh = 0) | 1 | 3 | 2 | 5 | 4 | 7 |
| 75 (standard) | 2 | 1 | 4 | 5 | 3 | 6 |
| 75 (ajgNhh = 0) | 3 | 5 | 4 | 2 | 1 | 6 |
| 85 (standard) | 5 | 2 | 4 | 3 | 1 | 7 |
| 85 (ajgNhh = 0) | 5 | 4 | 3 | 2 | 1 | 6 |

## 4. Robusthet: min–maks mot rangsum og z-skår

Samme vekter, samme manglende-regel. Rangsum bruker rang (0–100 lineært, gjennomsnittsrang ved likhet) per mål i stedet for min–maks-verdi. z-skår bruker populasjonsstandardavvik.

Topp 5 i rekkefølge:

| Forskningsandel | Min–maks | Rangsum | z-skår |
|---|---|---|---|
| 50 | NHH, NTNU, BI, UiS, UiA | BI, NHH, NTNU, UiS, UiA | NHH, NTNU, BI, UiA, UiS |
| 65 | NHH, NTNU, BI, UiA, UiS | BI, NTNU, NHH, UiS, UiA | NHH, NTNU, BI, UiA, UiS |
| 75 | NTNU, NHH, UiA, BI, UiS | BI, NTNU, UiS, UiA, NHH | NTNU, UiA, NHH, BI, UiS |
| 85 | UiA, NTNU, UiS, BI, NHH | UiS, UiA, BI, NTNU, NHH | UiA, NTNU, UiS, BI, NHH |

Samsvar med min–maks over alle 15 skoler:

| Forskningsandel | Spearman rangsum | Spearman z | Topp 5 samme sett (rangsum) | Topp 5 samme sett (z) |
|---|---|---|---|---|
| 50 | 0,975 | 0,986 | ja | ja |
| 55 | 0,964 | 0,979 | ja | ja |
| 60 | 0,964 | 0,986 | ja | ja |
| 65 | 0,968 | 0,996 | ja | ja |
| 70 | 0,936 | 0,989 | ja | ja |
| 75 | 0,925 | 0,979 | ja | ja |
| 80 | 0,925 | 0,989 | ja | ja |
| 85 | 0,961 | 0,996 | ja | ja |

Ved 75 % flytter rangsum 11 av 15 skoler og z-skår 6. Størst endring med rangsum: NHH 2 til 5, BI 4 til 1, UiS 5 til 3, HH NMBU 6 til 8, INN 8 til 6. Med z-skår: NHH 2 til 3, UiA 3 til 2, UiT 14 til 12, HVL 12 til 14.
Konklusjon: settet i topp 5 er robust, men hvem som er nummer 1 er det ikke (NTNU, BI, UiA og NHH kan alle bli nummer 1 avhengig av andel og metode). Det bør vises som plassintervall, slik appen allerede gjør.

## Kode

Tre skript (Python 3, bare standardbiblioteket). `modell.py` er selve gjenimplementeringen; `k2.py` sammenligner plassene i tabell 2 og viser akkrediteringer; `k3.py` kjører robusthet, referanse-, nivå-0- og ajgNhh-testene.

### modell.py

```python
#!/usr/bin/env python3
"""Uavhengig gjenberegning av Handelshoyskolerangering.tsx (standardvekter, 15 skoler uten referanser)."""
import json, math, statistics, os

DATA = os.path.expanduser('~/Desktop/BOA-sammenligning/data/rangering/rangering-klartekst.json')
D = json.load(open(DATA))
SK_ALLE = D['skoler']
DIM_STD = {'Forskning': 75, 'Utdanning': 20, 'Fagmiljø': 3, 'Anerkjennelse': 2}
DIMS = list(DIM_STD)
FORSK_TRINN = [50, 55, 60, 65, 70, 75, 80, 85]
RANG = {'null': 0, 'basis': 1, 'hoy': 2, 'topp': 3}


def snitt(xs):
    v = [x for x in xs if x is not None and math.isfinite(x)]
    return sum(v) / len(v) if v else None


def siste_dbh_aar():
    for y in range(D['aar'][1], D['aar'][0] - 1, -1):
        n = sum(1 for s in SK_ALLE if (s['dbh'].get(str(y)) or {}).get('publPoeng') is not None)
        if n >= len(SK_ALLE) / 2:
            return y
    return D['aar'][1]


Y1 = siste_dbh_aar()
LAG = dict(fra=Y1 - 4, til=Y1, brok=True, nevner='uff', vekter={'basis': 1, 'hoy': 3, 'topp': 5},
           abdc=True, ft=True, ajg=True)


def aar_rekke(a, b):
    return [str(y) for y in range(a, b + 1)]


def trinn_for(nk, lag):
    niva, abdc, ft, ajg = nk.split('|')
    t = 'hoy' if niva == '2' else 'basis' if niva == '1' else 'null'
    def opp(x):
        nonlocal t
        if RANG[x] > RANG[t]:
            t = x
    if lag['abdc'] and abdc and abdc != '-':
        opp('topp' if abdc == 'A*' else 'hoy' if abdc == 'A' else 'basis')
    if lag['ft'] and ft and ft != '-':
        opp('topp')
    if lag['ajg'] and ajg and ajg not in ('-', '?'):
        opp('topp' if ajg in ('4', '4*') else 'hoy' if ajg == '3' else 'basis')
    return t


def lag_per_arsverk(s, lag=LAG, detalj=False):
    per = {'null': 0.0, 'basis': 0.0, 'hoy': 0.0, 'topp': 0.0}
    aar = aar_rekke(lag['fra'], lag['til'])
    for y in aar:
        for nk, (n, frac) in ((s['artikler'].get(y) or {}).get('komb') or {}).items():
            per[trinn_for(nk, lag)] += frac if lag['brok'] else n
    vektet = sum(per[t] * lag['vekter'][t] for t in ('basis', 'hoy', 'topp'))
    uff = snitt([(s['dbh'].get(y) or {}).get('uff' if lag['nevner'] == 'uff' else 'utenStip') for y in aar])
    r = vektet / uff if uff else None   # JS: uff ? ... : null  (0 og null -> null)
    return (r, per, vektet, uff) if detalj else r


def art_sum(s, aar):
    n = ft = utd = intl = ajg34 = ajgN = abdcA = 0
    for y in aar:
        a = s['artikler'].get(y)
        if not a:
            continue
        n += a['n']; ft += a['ft50']; utd += a['utd24']
        intl += (a.get('intlAndel') or 0) * a['n'] / 100
        if a.get('ajg'):
            ajgN += a['n']
            ajg34 += (a['ajg'].get('3', 0)) + (a['ajg'].get('4', 0)) + (a['ajg'].get('4*', 0))
        abdcA += a['abdc'].get('A*', 0) + a['abdc'].get('A', 0)
    return dict(n=n, ft=ft, utd=utd, intl=intl, ajg34=ajg34, ajgN=ajgN, abdcA=abdcA)


def akk_navn(s):
    out = []
    for a in s.get('akkreditering') or []:
        out.append(a if isinstance(a, str) else str(a.get('navn') or a.get('type') or a.get('akkreditering') or ''))
    return [x for x in out if x]


def indikatorer(lag=LAG):
    tre = aar_rekke(Y1 - 2, Y1); fem = aar_rekke(Y1 - 4, Y1)
    harAjg = D['lister']['ajg']
    dbh = lambda s, y, k: (s['dbh'].get(y) or {}).get(k)
    def v_ajgnhh(s):
        if not s.get('ajgNhh'):
            return None
        xs = []
        for y in ['2022', '2023', '2024']:
            a = s['ajgNhh'].get(y)
            xs.append(((a.get('4*') or {}).get('perFte', 0) + (a.get('4') or {}).get('perFte', 0)) if a else None)
        return snitt(xs)
    def v_ft(s):
        a = art_sum(s, fem); uff = snitt([dbh(s, y, 'uff') for y in fem])
        return 100 * max(a['ft'], a['utd']) / uff if uff else None
    def v_intl(s):
        a = art_sum(s, fem); return 100 * a['intl'] / a['n'] if a['n'] else None
    def v_x(s):
        a = art_sum(s, fem)
        if harAjg:
            return 100 * a['ajg34'] / a['ajgN'] if a['ajgN'] else None
        return 100 * a['abdcA'] / a['n'] if a['n'] else None
    oa = lambda s, k: (s['utdanning'].get('oa') or {}).get(k)
    I = [
        ('poeng', 'Forskning', 25, lambda s: snitt([dbh(s, y, 'poengPerUff') for y in tre])),
        ('lag', 'Forskning', 25, lambda s: lag_per_arsverk(s, lag)),
        ('niva2', 'Forskning', 5, lambda s: snitt([dbh(s, y, 'niva2Andel') for y in tre])),
        ('ajg34' if harAjg else 'abdcA', 'Forskning', 0, v_x),
        ('ajgNhh', 'Forskning', 10, v_ajgnhh),
        ('ft50', 'Forskning', 5, v_ft),
        ('intl', 'Forskning', 5, v_intl),
        ('pg', 'Utdanning', 7, lambda s: oa(s, 'poenggrenseMaks')),
        ('fv', 'Utdanning', 5, lambda s: oa(s, 'fvPerPlass')),
        ('sb', 'Utdanning', 5, lambda s: oa(s, 'studiebarometer')),
        ('normert', 'Utdanning', 3, lambda s: oa(s, 'normertTid')),
        ('forste', 'Fagmiljø', 3, lambda s: dbh(s, str(Y1), 'forsteAndel')),
        ('akk', 'Anerkjennelse', 2, lambda s: len([n for n in akk_navn(s) if any(k in n.upper() for k in ('AACSB', 'EQUIS', 'AMBA'))])),
    ]
    return I


def effektive_vekter(ind, vekt, forsk):
    andel = {'Forskning': forsk}
    rest = [d for d in DIMS if d != 'Forskning']
    std = sum(DIM_STD[d] for d in rest)
    for d in rest:
        andel[d] = (100 - forsk) * DIM_STD[d] / std
    ut = {}
    for d in DIMS:
        mine = [i for i in ind if i[1] == d]
        sm = sum(vekt.get(i[0], 0) for i in mine)
        for i in mine:
            ut[i[0]] = andel[d] * vekt.get(i[0], 0) / sm if sm else 0
    return ut


def plasser_std(sc):
    """Samme som TS: delt plass ved like poeng (toleranse 1e-9)."""
    return [None if x is None else 1 + sum(1 for y in sc if y is not None and y > x + 1e-9) for x in sc]


def beregn(skoler, ind, vekt, forsk, metode='minmaks', plassfn=plasser_std, ref_i_norm=None):
    verdier = {i[0]: [i[3](s) for s in skoler] for i in ind}
    normpop = verdier if ref_i_norm is None else {i[0]: [i[3](s) for s in ref_i_norm] for i in ind}
    def norm(id_, v):
        xs = [x for x in normpop[id_] if x is not None]
        if v is None or len(xs) < 2:
            return None
        if metode == 'minmaks':
            lo, hi = min(xs), max(xs)
            return 50 if hi == lo else 100 * (v - lo) / (hi - lo)
        if metode == 'z':
            m = statistics.fmean(xs); sd = statistics.pstdev(xs)
            return 0 if sd == 0 else (v - m) / sd
        if metode == 'rang':  # rangsum: persentilrang 0..100 (gjennomsnittsrang ved likhet)
            lavere = sum(1 for x in xs if x < v); lik = sum(1 for x in xs if x == v)
            r = lavere + (lik - 1) / 2   # 0-basert
            return 100 * r / (len(xs) - 1)
    eut = effektive_vekter(ind, vekt, forsk)
    sc = []; mangler = []
    for k in range(len(skoler)):
        sm = w = 0; mg = 0
        for i in ind:
            n = norm(i[0], verdier[i[0]][k])
            if n is None:
                if eut[i[0]] > 0: mg += 1
                continue
            sm += n * eut[i[0]]; w += eut[i[0]]
        sc.append(sm / w if w else None); mangler.append(mg)
    return sc, plassfn(sc), mangler


SKOLER = [s for s in SK_ALLE if not s['referanse']]
IND = indikatorer()
VEKT = {i[0]: i[2] for i in IND}

if __name__ == '__main__':
    print('Y1', Y1, 'antall', len(SKOLER))
    sc, pl, mg = beregn(SKOLER, IND, VEKT, 75)
    for s, a, p, m in sorted(zip(SKOLER, sc, pl, mg), key=lambda t: t[2]):
        print(p, s['kort'], round(a, 2), m)
```

### k2.py

```python
from modell import *
import collections
EXP = """NHH 1,1,1,1,1,2,3,5
NTNU 2,2,2,2,2,1,1,2
BI 3,3,3,3,3,4,5,4
UiS 4,4,5,5,5,5,4,3
UiA 5,5,4,4,4,3,2,1
OsloMet 6,6,6,6,6,7,8,9
HH NMBU 7,7,7,7,7,6,6,7
HiMolde 8,9,9,10,10,10,10,10
Kristiania 9,8,8,9,9,9,9,8
HVL 10,11,12,12,12,12,14,14
INN 11,10,10,8,8,8,7,6
USN 12,12,11,11,11,11,11,11
Nord 13,13,13,13,13,13,13,13
UiT 14,14,14,14,14,14,12,12
HiØ 15,15,15,15,15,15,15,15"""
exp={}
for l in EXP.splitlines():
    p=l.rsplit(' ',1); exp[p[0]]=[int(x) for x in p[1].split(',')]
names=[s['kort'] for s in SKOLER]
tab={n:[] for n in names}
for f in FORSK_TRINN:
    sc,pl,mg=beregn(SKOLER,IND,VEKT,f)
    for n,p in zip(names,pl): tab[n].append(p)
av=0
for n in names:
    ok = tab[n]==exp[n]
    print(n,tab[n],'OK' if ok else ('AVVIK exp',exp[n]))
    av+= not ok
print('avvik',av)
# akk
for s in SKOLER:
    print(s['kort'],[(a.get('type'),a.get('status')) if isinstance(a,dict) else a for a in s['akkreditering']])
# ties
sc,pl,mg=beregn(SKOLER,IND,VEKT,75); print(sorted(sc))
# dbh missing
for s in SKOLER:
    print(s['kort'],[y for y in aar_rekke(2021,2025) if (s['dbh'].get(y) or {}).get('uff') is None], [y for y in aar_rekke(2021,2025) if not (s['artikler'].get(y) or {}).get('komb')])
```

### k3.py

```python
from modell import *
import itertools, copy
names=[s['kort'] for s in SKOLER]
def rk(metode='minmaks',f=75,vekt=VEKT,ind=IND,skoler=SKOLER,**k):
    sc,pl,mg=beregn(skoler,ind,vekt,f,metode,**k); return dict(zip([s['kort'] for s in skoler],pl)),dict(zip([s['kort'] for s in skoler],sc))
# mangler detalj
eut=effektive_vekter(IND,VEKT,75)
print('mangler per skole (indikatorer med vekt>0)')
for s in SKOLER:
    m=[i[0] for i in IND if i[3](s) is None]
    print(s['kort'],m)
# vekt-0 indikator verdi
print('abdcA ledig?',[ (s['kort'],round(IND[3][3](s),1)) for s in SKOLER if IND[3][3](s) is not None][:3])
# nær-likhet
print('minste gap mellom nabo-score per forsk')
for f in FORSK_TRINN:
    sc=sorted(x for x in beregn(SKOLER,IND,VEKT,f)[0])
    g=min((b-a,a) for a,b in zip(sc,sc[1:])); print(f,round(g[0],3))
# robusthet
print('ROBUSTHET')
for f in (50,65,75,85):
    for m in ('minmaks','rang','z'):
        p,sc=rk(m,f); top=sorted(p,key=lambda n:p[n])[:5]
        print(f,m,top, [p[n] for n in top])
def spearman(a,b):
    ns=list(a); n=len(ns); d=sum((a[x]-b[x])**2 for x in ns); return 1-6*d/(n*(n*n-1))
for f in FORSK_TRINN:
    a,_=rk('minmaks',f); 
    print(f,'rho rang',round(spearman(a,rk('rang',f)[0]),3),'rho z',round(spearman(a,rk('z',f)[0]),3),
      'topp5 lik rang',set(sorted(a,key=a.get)[:5])==set(sorted(rk('rang',f)[0],key=rk('rang',f)[0].get)[:5]),
      'topp5 lik z',set(sorted(a,key=a.get)[:5])==set(sorted(rk('z',f)[0],key=rk('z',f)[0].get)[:5]))
# plass-endring maks
for m in ('rang','z'):
    a,_=rk('minmaks',75); b,_=rk(m,75); print(m,{n:(a[n],b[n]) for n in a if a[n]!=b[n]})
# referanser i normalisering
print('REF i normalisering')
ref=[s for s in SK_ALLE]
p0,s0=rk('minmaks',75)
p1,s1=rk('minmaks',75,skoler=SK_ALLE)
print({n:(p0[n],p1[n]) for n in p0 if p0[n]!=p1[n] or True})
print({s['kort']:p1[s['kort']] for s in SK_ALLE if s['referanse']})
# ref pop for norm only (15 skoler rangert mot normalisering fra alle 18)
sc,pl,mg=beregn(SKOLER,IND,VEKT,75,'minmaks',ref_i_norm=SK_ALLE); print('normpop alle18, de 15 rangert:',dict(zip(names,pl)))
# lagdelt: nivå 0/u løftet
print('LAGDELT: nivå 0/u løftet av ABDC/FT')
for s in SKOLER:
    tot=0;lift=0;lifttrinn={'basis':0,'hoy':0,'topp':0};frac_l=0;tot_all=0
    for y in aar_rekke(2021,2025):
        for nk,(n,fr) in ((s['artikler'].get(y) or {}).get('komb') or {}).items():
            tot_all+=n
            if nk.split('|')[0] in ('0','u'):
                tot+=n; t=trinn_for(nk,LAG)
                if t!='null': lift+=n; lifttrinn[t]+=n; frac_l+=fr
    print(s['kort'],'artikler',tot_all,'nivå0/u',tot,'løftet',lift,lifttrinn,'frac',round(frac_l,1))
# Alternativ: nivå 0/u teller 0 (ikke løftet)
import modell
orig=modell.trinn_for
def trinn_for2(nk,lag):
    if nk.split('|')[0] in ('0','u'): return 'null'
    return orig(nk,lag)
modell.trinn_for=trinn_for2
IND2=indikatorer()
sc,pl,mg=beregn(SKOLER,IND2,VEKT,75); print('uten løfting av 0/u:',dict(zip(names,pl)))
for f in (50,85):
    sc,pl,mg=beregn(SKOLER,IND2,VEKT,f); print(f,dict(zip(names,pl)))
modell.trinn_for=orig
# alt: uten ajgNhh
v2=dict(VEKT); v2['ajgNhh']=0
for f in (50,75,85):
    p,_=rk('minmaks',f,vekt=v2); print('uten ajgNhh',f,p)
# lag-indikatorverdier
for s in SKOLER:
    r,per,vk,uff=lag_per_arsverk(s,detalj=True); print(s['kort'],round(r,2),{k:round(v,1) for k,v in per.items()},round(uff,1))
```
