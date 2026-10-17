#!/usr/bin/env python3
"""
Bygger datafilene til NMBU-siden «Markedet» (?marked) fra kartleggingene i data/marked/:

  data/marked/nasjonal-katalog/   Samordna- og DBH-katalogen (B1)          → oversikt.json, program-<fagfelt>.json
  data/marked/studieresultater/   studenttall, kull og inntekt per program  → nøkkeltall i program-<fagfelt>.json, aggregater.json
  data/marked/bachelor-okonomi/   bachelorlandskapet i økonomi (A1)          → okonomi.json
  data/marked/master-okonomi/     masterlandskapet i økonomi (A2)            → okonomi.json
  data/marked/handelshoyskoler/   profilene av økonomimiljøene (A3)          → okonomi.json (uten ledelse)
  data/marked/studiesteder/       institusjon × studiested (Samordna + DBH 124) → studiesteder.json, `ss` i program-<fagfelt>.json

Skriver til kilde/public/marked/. Leser bare de ferdige filene i data/marked/*, ingen nettkall.
Kjøring: python3 scripts/build-marked.py
"""
import json
import re
import sys
from pathlib import Path

ROT = Path(__file__).resolve().parent.parent
M = ROT / 'data' / 'marked'
UT = ROT / 'kilde' / 'public' / 'marked'

SO_AAR = ['2021', '2022', '2023', '2024', '2025', '2026']
DBH_AAR = ['2021', '2022', '2023', '2024', '2025']
SR_AAR = [str(a) for a in range(2019, 2026)]
GRAD = {'bachelor', 'arsstudium', 'master5', 'master2', 'erfaringsmaster'}
MAKS_BYTE = 1_500_000


def les(sti: Path):
    with open(sti, encoding='utf-8') as f:
        return json.load(f)


def skriv(navn: str, data) -> int:
    UT.mkdir(parents=True, exist_ok=True)
    tekst = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    (UT / navn).write_text(tekst, encoding='utf-8')
    n = len(tekst.encode('utf-8'))
    print(f'  {navn:32s} {n / 1000:8.1f} kB')
    if n > MAKS_BYTE:
        sys.exit(f'FEIL: {navn} er {n} byte, over grensen på {MAKS_BYTE}. Del opp fila.')
    return n


def rund(v, d=1):
    return None if v is None else round(v, d)


def tall(v):
    """0 er en gyldig verdi (poenggrense 0 = alle inn), None betyr manglende."""
    return v if isinstance(v, (int, float)) else None


# ── Grunnlag ─────────────────────────────────────────────────────────────────
katalog = M / 'nasjonal-katalog'
fagfelt = les(katalog / 'fagfelt.json')['fagfelt']
institusjoner = les(katalog / 'institusjoner.json')
marked = les(katalog / 'marked.json')
indeks = les(katalog / 'program' / 'indeks.json')

sr_dir = M / 'studieresultater'
sr_indeks = les(sr_dir / 'program-indeks.json')
sr_alias = les(sr_dir / 'alias.json').get('nokler', {})
sr_inst = sr_indeks['institusjoner']
aggregater = les(sr_dir / 'aggregater.json')

# Studiestedene (data/marked/studiesteder/skript/bygg.py): koblingen program → studiested(er)
ss_dir = M / 'studiesteder'
ss_data = les(ss_dir / 'studiesteder.json')
ss_kobling = les(ss_dir / 'program-steder.json')
ss_kontroll = les(ss_dir / 'kontroll.json')
ss_ok = {s['id'] for s in ss_data['steder']}


def ss_so(kode: str):
    sid = ss_kobling['so'].get(kode)
    return [sid] if sid in ss_ok else None


def ss_dbh(inst: str, kode: str):
    """Studiestedene til et DBH-program, flest studenter siste år først (uplasserte tas ikke med)."""
    k = ss_kobling['dbh'].get(f'{inst}_{kode.strip()}')
    steder = [x for x in (k or {}).get('steder', []) if x['id'] in ss_ok]
    ids = [x['id'] for x in steder if (x.get('andelSisteAar') or 0) > 0]
    # Alle studentene siste år var uplassert: bruk stedene fra tidligere år.
    # Står programmet bare med 0 (skjermet) i DBH 124, brukes campusen DBH oppgir likevel.
    ids = ids or [x['id'] for x in sorted(steder, key=lambda x: -sum(x['reg'].values()))]
    return ids or None


# Alle studieresultat-program, lastet per institusjon (13 MB samlet; bare feltene vi trenger beholdes).
sr_prog: dict[str, dict] = {}
for f in sorted((sr_dir / 'program').glob('*.json')):
    for nokkel, p in les(f)['program'].items():
        sr_prog[nokkel] = p


def sr_nokkel(inst: str, kode: str):
    k = f'{inst}_{kode.strip()}'
    if k in sr_prog:
        return k
    a = sr_alias.get(k)
    return a if a in sr_prog else None


def sr_slank(nokkel: str):
    """Nøkkeltall og tidsserier fra studieresultatene (DBH 123/110/104/707/900)."""
    p = sr_prog[nokkel]
    nk = p.get('nokkel', {}) or {}
    aar = p.get('aar', {}) or {}
    serie = lambda felt: [tall(aar.get(a, {}).get(felt)) for a in SR_AAR]
    prikket = sorted({f for a in SR_AAR for f in (aar.get(a, {}).get('p') or []) if f in ('reg', 'nye', 'kand')})
    inn_aar = nk.get('innAar')
    inn_info = (aar.get(str(inn_aar), {}) or {}).get('inn') or {} if inn_aar else {}
    inn_serie = [tall(((aar.get(a, {}) or {}).get('inn') or {}).get('total')) for a in SR_AAR]
    ut = {
        'key': nokkel,
        'nv': p.get('nivaa'),
        'fg': p.get('faggruppe'),
        'reg': serie('reg'), 'nye': serie('nye'), 'kand': serie('kand'),
        'fn': rund(nk.get('fullfortNormertAndel'), 4), 'kg': nk.get('kullGrunnlag'), 'ka': nk.get('kullAar'),
        'fr': rund(nk.get('frafallNormertAndel'), 4),
        'f2': rund(nk.get('fullfort2Andel'), 4), 'k2': nk.get('kull2Grunnlag'),
        'inn': nk.get('inn'), 'innAar': inn_aar, 'innPerReg': nk.get('innPerReg'), 'innS': inn_serie,
    }
    if inn_info.get('hypotetisk') or (sr_inst.get(p.get('inst'), {}) or {}).get('privat'):
        ut['hyp'] = True
    if inn_info.get('forelopig'):
        ut['forelopig'] = True
    if prikket:
        ut['pr'] = prikket
    return {k: v for k, v in ut.items() if v is not None}


# ── Programmene per fagfelt ─────────────────────────────────────────────────
NIVA_SO = {'Bachelor': 'bachelor', 'Årsstudium': 'arsstudium', 'Master': 'master', 'Kandidat': 'master', 'Profesjonsstudium': 'profesjon'}
NIVA_DBH = {'B3': ('bachelor', None), 'B4': ('bachelor', None), 'AR': ('arsstudium', None), 'M2': ('master', '2-årig'),
            'M5': ('master', '5-årig'), 'ME': ('master', 'erfaringsbasert'), 'MX': ('master', 'erfaringsbasert'),
            'PR': ('profesjon', None)}

alle_so: list[dict] = []
alle_dbh: dict[str, dict] = {}
for f in sorted((katalog / 'program').glob('*.json')):
    if f.name == 'indeks.json':
        continue
    for r in les(f)['program']:
        if r['type'] == 'so':
            alle_so.append(r)
        else:
            alle_dbh[r['id']] = r


def avdeling(r):
    """Fakultet/avdeling for program med lokalt opptak (DBH har ikke studiested); «uspesifisert» tas ikke med."""
    a = r.get('fakultet') or r.get('avdeling')
    return None if not a or 'uspesifisert' in a else a


def dbh_til_sr(dbh_id: str):
    _, inst, kode = dbh_id.split(':', 2)
    return sr_nokkel(inst, kode)


# Hvor mange Samordna-koder deler hver DBH-kode (flere studiesteder på én kode)?
deling: dict[str, int] = {}
for r in alle_so:
    for d in r.get('dbh') or []:
        k = dbh_til_sr(d)
        if k:
            deling[k] = deling.get(k, 0) + 1

program_per_felt: dict[str, list] = {ff['id']: [] for ff in fagfelt}
koblet = {'so': 0, 'soMedSr': 0, 'lokalt': 0, 'lokaltMedSr': 0}

for r in alle_so:
    a = {}
    for y in SO_AAR:
        v = r.get('aar', {}).get(y)
        if not v:
            continue
        a[y] = [tall(v.get('sokere')), tall(v.get('forstevalg')), tall(v.get('plasser')), tall(v.get('kvalifiserte')),
                tall(v.get('tilbud')), tall(v.get('pgOrd')), tall(v.get('pgFv'))]
    niv = NIVA_SO.get(r.get('programtype'), 'annet')
    rad = {
        'id': r['id'], 'k': r['kode'], 'n': r['navn'], 'i': r['inst'], 'st': r.get('sted'), 'ff': r['fagfelt'],
        'niv': niv, 'sp': r.get('studiepoeng'), 'nett': bool(r.get('nett')), 'deltid': r.get('heltid') is False,
        'status': r.get('status'), 'fra': r.get('forsteAar'), 'til': r.get('sisteAar'), 'a': a,
    }
    if niv == 'master':
        rad['var'] = '5-årig'
    if r.get('ledig2026'):
        rad['ledig'] = True
    if r.get('url'):
        rad['url'] = r['url']
    dbh = [d for d in (r.get('dbh') or [])]
    if dbh:
        rad['dbh'] = [d.split(':', 1)[1].replace(':', '_') for d in dbh]
    if r.get('koblingMerknad'):
        rad['km'] = r['koblingMerknad']
    if ss_so(r['kode']):
        rad['ss'] = ss_so(r['kode'])
    nokkel = next((k for k in (dbh_til_sr(d) for d in dbh) if k), None)
    koblet['so'] += 1
    if nokkel:
        rad['sr'] = sr_slank(nokkel)
        if deling.get(nokkel, 0) > 1:
            rad['sr']['delt'] = deling[nokkel]
        koblet['soMedSr'] += 1
    program_per_felt.setdefault(r['fagfelt'], []).append(rad)

# Gradsprogram med bare lokalt opptak (DBH 379 opptakstype L), f.eks. BI, Kristiania og toårige mastere.
for r in alle_dbh.values():
    if r.get('nivaagruppe') not in GRAD or r.get('so'):
        continue
    if not any('L' in v for v in (r.get('aar') or {}).values()):
        continue
    niv, var = NIVA_DBH.get(r.get('nivaa'), ('annet', None))
    a = {}
    for y in DBH_AAR:
        v = (r.get('aar', {}).get(y) or {}).get('L')
        if not v:
            continue
        a[y] = [tall(v.get('sokere')), tall(v.get('forstevalg')), None, tall(v.get('kvalifiserte')), tall(v.get('tilbud')),
                None, None, tall(v.get('mott'))]
    rad = {
        'id': r['id'], 'k': r['kode'], 'n': r['navn'], 'i': r['inst'], 'st': avdeling(r),
        'ff': r['fagfelt'], 'niv': niv, 'sp': r.get('studiepoeng'), 'nett': None,
        'deltid': (r.get('heltid') is not None and r.get('heltid') < 1), 'lok': True, 'status': r.get('status'),
        'fra': min(a) if a else None, 'til': max(a) if a else None, 'a': a,
        'dbh': [f"{r['inst']}_{r['kode']}"],
    }
    if var:
        rad['var'] = var
    if ss_dbh(r['inst'], r['kode']):
        rad['ss'] = ss_dbh(r['inst'], r['kode'])
        koblet['lokaltMedSted'] = koblet.get('lokaltMedSted', 0) + 1
    nokkel = sr_nokkel(r['inst'], r['kode'])
    koblet['lokalt'] += 1
    if nokkel:
        rad['sr'] = sr_slank(nokkel)
        koblet['lokaltMedSr'] += 1
    program_per_felt.setdefault(r['fagfelt'], []).append(rad)

# ── Markedsandeler (Samordna, førstevalg) per fagfelt × institusjon × nivå ──
NIV_KORT = {'bachelor': 'b', 'arsstudium': 'a', 'master5': 'm'}
fv: dict[str, dict[str, dict[str, list]]] = {}


def legg_til(ff: str, inst: str, niv: str, verdier: list):
    d = fv.setdefault(ff, {}).setdefault(inst, {}).setdefault(niv, [0] * len(SO_AAR))
    for i, v in enumerate(verdier):
        d[i] += v


for r in alle_so:
    niv = NIV_KORT.get(r.get('nivaagruppe'))
    if not niv:
        continue
    verdier = [(r.get('aar', {}).get(y) or {}).get('forstevalg') or 0 for y in SO_AAR]
    legg_til(r['fagfelt'], r['inst'], niv, verdier)
    legg_til('alle', r['inst'], niv, verdier)

# Kontroll mot katalogens egne andeler (marked.json): NMBUs andel av alle førstevalg per fagfelt og år.
avvik = []
for ff, nivaer in marked['samordna'].items():
    fasit = (nivaer.get('alle') or {}).get('nmbuAndel') or {}
    for i, y in enumerate(SO_AAR):
        tot = sum(sum(v[i] for v in d.values()) for d in fv.get(ff, {}).values())
        nm = sum(v[i] for v in fv.get(ff, {}).get('1173', {}).values())
        andel = round(100 * nm / tot, 2) if tot else 0.0
        if y in fasit and abs(andel - fasit[y]) > 0.011:
            avvik.append((ff, y, andel, fasit[y]))
if avvik:
    sys.exit(f'FEIL: markedsandelene avviker fra marked.json: {avvik[:5]}')

# Møtte (DBH 379, alle opptakstyper, med private) per fagfelt × institusjon × nivå, 2021–2025.
DBH_NIV = {'bachelor': 'b', 'arsstudium': 'a', 'master5': 'm5', 'master2': 'm2', 'erfaringsmaster': 'me'}
mott: dict[str, dict] = {}
for ff, nivaer in marked['dbh'].items():
    for niv, kort in DBH_NIV.items():
        blokk = nivaer.get(niv)
        if not blokk:
            continue
        for i, y in enumerate(DBH_AAR):
            for inst, v in ((blokk.get('aar') or {}).get(y, {}).get('institusjoner') or {}).items():
                d = mott.setdefault(ff, {}).setdefault(inst, {}).setdefault(kort, [0] * len(DBH_AAR))
                d[i] += v.get('mott') or 0

# NMBUs årsstudier (forklarer veksten i økonomi og administrasjon)
nmbu_ars = []
for r in alle_so:
    if r['inst'] == '1173' and r.get('nivaagruppe') == 'arsstudium':
        nmbu_ars.append({'k': r['kode'], 'n': r['navn'], 'ff': r['fagfelt'],
                         'fv': [(r.get('aar', {}).get(y) or {}).get('forstevalg') for y in SO_AAR]})

# ── oversikt.json ────────────────────────────────────────────────────────────
inst_ut = {}
for i in institusjoner['institusjoner'] if isinstance(institusjoner['institusjoner'], list) else institusjoner['institusjoner'].values():
    kode = i['kode']
    inst_ut[kode] = {'n': i['navn'], 'k': i.get('kortnavn') or i['navn'], 't': i.get('type'), 's': i.get('sektor'),
                     'so': bool(i.get('samordna'))}
for kode, i in sr_inst.items():
    inst_ut.setdefault(kode, {'n': i['navn'], 'k': i.get('kortnavn') or i['navn'], 't': i.get('type'),
                              's': 'privat' if i.get('privat') else 'offentlig', 'so': False})
    if i.get('privat'):
        inst_ut[kode]['privat'] = True

# Kortnavn slik de brukes ellers på nettstedet (DBH-forkortelsene er lite kjente for noen institusjoner).
KORT = {'1174': 'Nord', '8253': 'Kristiania', '0232': 'HiMolde', '0236': 'Volda', '0217': 'Samisk høgskole',
        '1210': 'NMH', '8247': 'HGUt'}
for kode, k in KORT.items():
    if kode in inst_ut:
        inst_ut[kode]['k'] = k

felt_ut = [{'id': ff['id'], 'n': ff['navn'], 'nus': ff.get('nusFaggrupper') or {}} for ff in fagfelt]

hentet = marked.get('hentet') or indeks.get('hentet')
oversikt = {
    'hentet': hentet,
    'aar': SO_AAR,
    'dbhAar': DBH_AAR,
    'fagfelt': felt_ut,
    'inst': inst_ut,
    'fv': fv,
    'mott': mott,
    'nmbuArsstudier': nmbu_ars,
    'antall': {ff: len(v) for ff, v in program_per_felt.items()},
    'kobling': koblet,
    'kilder': {
        'samordna': 'Samordna opptak/HK-dir, søker- og tilbudstall til nedlasting (grunndata tabell 2, oppdatert 23.07.2026), poenggrenser og ventelister (SO-datavarehuset), søke-API-et 2021–2026',
        'dbh': 'DBH/HK-dir tabell 347 (studieprogram), 370 (studieplasser, kobling til Samordna), 379 (søkere og møtte), 210/211 (avdeling og institusjon)',
        'studieresultater': 'DBH/HK-dir tabell 123, 110, 104, 335, 707, 60, 135, 142, 900, 907 og 908 (2019–2025)',
        'hentet': hentet,
    },
}

# ── aggregater.json: NUS-faggruppe × nivå (kvartiler mellom program) ─────────
agg_ut = {}
for k, g in aggregater['faggruppe'].items():
    niv = k.split('|')[0]
    if niv not in NIVA_DBH:
        continue
    fd = g.get('fordeling') or {}
    agg_ut[k] = {'n': g.get('navn'), 'ant': g.get('antallProgram'),
                 'fd': {f: {kk: rund(vv, 4) for kk, vv in fd[f].items()} for f in ('fullfortNormertAndel', 'frafallNormertAndel', 'fullfort2Andel', 'innPerReg', 'reg') if fd.get(f)}}

# ── okonomi.json: bachelor (A1), master (A2), handelshøyskolene (A3) ──────────
bach = les(M / 'bachelor-okonomi' / 'programmer.json')
topp15 = les(M / 'bachelor-okonomi' / 'topp15.json')
sammendrag = les(M / 'bachelor-okonomi' / 'sammendrag.json')
mast = les(M / 'master-okonomi' / 'programmer.json')
prof = les(M / 'handelshoyskoler' / 'profiler.json')


def aarsdict(d, aar):
    if not d:
        return None
    ut = [tall(d.get(y)) for y in aar]
    return ut if any(v is not None for v in ut) else None


bach_ut = []
for r in bach['programmer']:
    so = r.get('sokere') or {}
    lok = r.get('lokaltOpptak') or {}
    rad = {
        'id': r['id'], 'i': r.get('institusjonKort'), 'ik': r.get('dbhInstitusjonskode'), 'sek': r.get('sektor'),
        'c': r.get('campus'), 'n': r.get('programnavn'), 'fo': r.get('fagomraade'), 't': r.get('type'), 'niv': r.get('nivaa'),
        'sp': r.get('studiepoeng'), 'sf': r.get('studieform'), 'gt': bool(r.get('grensetilfelle')),
        'op': r.get('opptak'), 'so': r.get('soStudiekode'), 'st': r.get('status'),
        'fra': r.get('forsteOpptakSO') or r.get('forsteOpptakDBH'), 'til': r.get('sisteOpptakSO') or r.get('sisteOpptakDBH'),
        'fv': aarsdict(so.get('forstevalg'), SO_AAR), 'pl': aarsdict(r.get('studieplasser'), SO_AAR),
        'pg': aarsdict((r.get('poenggrenser') or {}).get('ordinar'), SO_AAR),
        'lfv': aarsdict({y: (v or {}).get('forstevalg') for y, v in lok.items()}, DBH_AAR),
        'lmott': aarsdict({y: (v or {}).get('mott') for y, v in lok.items()}, DBH_AAR),
        'reg': aarsdict(r.get('registrerte'), DBH_AAR), 'kand': aarsdict(r.get('kandidater'), DBH_AAR),
        'hh': [h.get('gruppenavn') or h.get('gruppe') for h in (r.get('hh') or [])],
        'url': r.get('url'),
    }
    if r.get('studenterDeltKode'):
        rad['delt'] = True
    if r.get('nivaa') == 'femårig' and r.get('type') == 'BØA':
        rad['sivok'] = True
    bach_ut.append({k: v for k, v in rad.items() if v not in (None, [], False) or k in ('gt',)})


def gjennomforing(kull):
    """Fullført på normert tid samlet for de tre siste kullene med nådd normert tid."""
    ferdige = [k for k in (kull or []) if k.get('fullfortNormert') is not None and k.get('startkull')]
    ferdige = sorted(ferdige, key=lambda k: k['startaar'])[-3:]
    n = sum(k['startkull'] for k in ferdige)
    if not ferdige or n == 0:
        return None
    return {'andel': round(100 * sum(k['fullfortNormert'] for k in ferdige) / n, 1), 'n': n,
            'fra': ferdige[0]['startaar'], 'til': ferdige[-1]['startaar']}


mast_ut = []
for r in mast['programmer']:
    op = r.get('opptak') or {}
    so = r.get('so') or {}
    krav = r.get('opptakskrav') or {}
    dbh = r.get('dbh') or {}
    aktive = dbh.get('aktivAar347') or []
    rad = {
        'id': r['id'], 'i': r.get('instKort'), 'ik': r.get('instKode'), 'n': r.get('navn'), 'kat': r.get('kategori'),
        'katN': r.get('kategoriNavn'), 'kj': bool(r.get('kjerne')), 't': r.get('type'), 'pr': bool(r.get('privat')),
        'c': r.get('campus'), 'dt': bool(r.get('deltid')), 'sivok': r.get('sivilokonom'),
        'op': {y: [tall(v.get('sokere')), tall(v.get('forstevalg')), tall(v.get('kvalifiserte')), tall(v.get('tilbud')), tall(v.get('mott'))]
               for y, v in op.items() if y in DBH_AAR and v},
        'opT': r.get('opptakstype'),
        'reg': aarsdict(r.get('registrerte'), DBH_AAR), 'kand': aarsdict(r.get('kandidater'), DBH_AAR),
        'gj': gjennomforing(r.get('gjennomforing')),
        'krav': ({'snitt': krav.get('snittkrav'), 'bach': krav.get('bachelorkrav'), 'kilde': krav.get('kilde'),
                  'hentet': krav.get('hentet'), 'gen': bool(krav.get('generisk'))} if krav else None),
        'skp': (r.get('skolepenger') or {}).get('perAar'),
        'akk': sorted({a.get('type') for a in (r.get('akkreditering') or []) if a.get('status') == 'akkreditert'}),
        'ihh': bool(r.get('iHHProgramkart')), 'hh': (r.get('hhProgramkart') or {}).get('gruppe') if isinstance(r.get('hhProgramkart'), dict) else None,
        'sofv': aarsdict({y: (v or {}).get('forstevalg') for y, v in (so.get('tall') or {}).items()}, SO_AAR) if so else None,
        'aktiv': [aktive[0], aktive[-1]] if aktive else None,
        'flagg': r.get('flagg'), 'iSum': r.get('iSum', True),
    }
    mast_ut.append({k: v for k, v in rad.items() if v not in (None, [], {})})

# Profilene: uten ledelse (navnene er uavklarte), uten styresaker og fritekst om personer.
ledere = [p['ledelse']['navn'] for p in prof['profiler'] if (p.get('ledelse') or {}).get('navn')]
ledere_re = re.compile('|'.join(re.escape(n) for n in ledere)) if ledere else None


def uten_navn(tekst):
    return tekst if not (ledere_re and isinstance(tekst, str) and ledere_re.search(tekst)) else None


NOKKEL_FELT = ['fagligeArsverk', 'andelForstestilling', 'andelProfessor', 'registrerteStudenter', 'studentarsverk',
               'studentarsverkPerFagligArsverk', 'publiseringspoeng', 'poengPerFagligArsverk', 'poengPerArsverkHkdir', 'andelNiva2']
prof_ut = []
for p in prof['profiler']:
    miljo = (p.get('nokkeltall') or {}).get('miljo') or {}
    nfr = (((p.get('eksterneMidler') or {}).get('nfrUtbetaltEnhet') or {}).get('millKr')) or {}
    strategi = next((d for d in ((p.get('strategi') or {}).get('dokumenter') or []) if d.get('status') == 'gjeldende'), None)
    rad = {
        'id': p['id'], 'kort': p['kort'], 'navn': p['navn'], 'type': p.get('type'), 'ref': bool(p.get('referanse')),
        'org': (p.get('organisering') or {}).get('type'), 'enhet': p.get('enhetNavn'),
        'n25': {f: miljo.get('2025', {}).get(f) for f in NOKKEL_FELT},
        'n21': {f: miljo.get('2021', {}).get(f) for f in ('fagligeArsverk', 'registrerteStudenter', 'publiseringspoeng')},
        'phd': (p.get('phd') or {}).get('sum2021_2025'),
        'nfr': round(sum(v for v in nfr.values() if v), 1) if nfr else None,
        'akk': [{'type': a.get('type'), 'aar': a.get('aar'), 'status': a.get('status')} for a in (p.get('akkrediteringer') or [])],
        'campus': p.get('campuser') or [],
        'endr': [{'aar': e.get('aar'), 't': e['tekst']} for e in (p.get('nyligeEndringer') or []) if uten_navn(e.get('tekst'))],
        'strategi': ({'t': strategi.get('tittel'), 'url': strategi.get('url')} if strategi and uten_navn(strategi.get('tittel')) else None),
    }
    prof_ut.append(rad)

okonomi = {
    'hentet': bach['meta'].get('hentet'),
    'bachelor': bach_ut,
    'topp15': topp15.get('topp15'),
    'sammendrag': sammendrag,
    'master': mast_ut,
    'masterKategorier': mast['meta'].get('kategorier'),
    'profiler': prof_ut,
    'profilDefinisjoner': prof.get('definisjoner'),
}
# Sikkerhetsnett: ingen ledernavn i fila.
if ledere_re and ledere_re.search(json.dumps(okonomi, ensure_ascii=False)):
    sys.exit('FEIL: et ledernavn ble med i okonomi.json; det skal ikke publiseres før navnene er avklart.')

# ── studiesteder.json: institusjon × studiested, kompakt ─────────────────────
FF_ID = [ff['id'] for ff in fagfelt]
NIV = ss_data['meta']['nivaer']
TYPE = {'sted': 's', 'nett': 'n', 'utland': 'u'}
KILDE = {'begge': 'SD', 'Samordna': 'S', 'DBH': 'D'}
ss_ut = []
for st in ss_data['steder']:
    o = st['organisering2025']
    rad = {
        'id': st['id'], 'i': st['institusjon'], 'n': st['stedsnavn'], 't': TYPE[st['type']], 'kn': st['kommune'],
        'f': st['fylke'], 'll': st['koordinater'], 'k': KILDE[st['kilde']],
        'ps': st['antallProgram']['soKoder'], 'pd': st['antallProgram']['dbhMedStudenter'],
        'r': [st['registrerte'][y] for y in ss_data['meta']['aar']], 'fv': [st['forstevalg'][y] for y in ss_data['meta']['fvAar']],
        'o': [o['stedbasert'], o['desentralisert'], o['nett']],
        'sf': [st['samordnaForm']['aktiveKoder'], st['samordnaForm']['nett'], st['samordnaForm']['samlingsbasert']],
        'a': [[FF_ID.index(x['fagfelt']) if x['fagfelt'] in FF_ID else FF_ID.index('uoppgitt'), NIV.index(x['niva']),
               x['dbhProgram'], x['soKoder'], *x['reg'], *x['fv']] for x in st['fordeling']],
        'td': [[x['navn'], x['kode'], NIV.index(x['niva']), x['reg'][-1], x['reg'][2]] for x in st['storsteDbh']],
        'ts': [[x['navn'], x['kode'], NIV.index(x['niva']), x['fv'][-1], x['fv'][0], 1 if x['nett'] else 0] for x in st['storsteSamordna']],
    }
    if st['navnevarianter']:
        rad['v'] = st['navnevarianter']
    ss_ut.append(rad)
kt = ss_kontroll['totalt']
studiesteder_ut = {
    'hentet': ss_data['meta']['hentet'], 'aar': ss_data['meta']['aar'], 'fvAar': ss_data['meta']['fvAar'], 'niv': NIV, 'ff': FF_ID,
    'inst': {k: v for k, v in ss_data['institusjoner'].items() if any(s['i'] == k for s in ss_ut)},
    'steder': ss_ut,
    'dekning': ss_kontroll['dekning'],
    'kontroll': {'dbh123': kt['dbh123'], 'dbh124': kt['dbh124'], 'medSted': kt['medSted'], 'nett': kt['nettposter'],
                 'avvik': len(ss_kontroll['avvik124mot123']), 'bareSamordna': len(ss_kontroll['bareSamordna']),
                 'bareDbh': len(ss_kontroll['bareDbh'])},
}

# ── Skriv filene ─────────────────────────────────────────────────────────────
print(f'Skriver til {UT.relative_to(ROT)}/')
for gammel in UT.glob('program-*.json'):
    gammel.unlink()
total = 0
total += skriv('oversikt.json', oversikt)
total += skriv('aggregater.json', agg_ut)
total += skriv('okonomi.json', okonomi)
n_ss = skriv('studiesteder.json', studiesteder_ut)
total += n_ss
if n_ss > 1_000_000:
    sys.exit(f'FEIL: studiesteder.json er {n_ss} byte, over målet på 1 MB.')
for ff, rader in sorted(program_per_felt.items()):
    if not rader:
        continue
    rader.sort(key=lambda x: -((x['a'].get('2026') or x['a'].get('2025') or [0, 0])[1] or 0))
    total += skriv(f'program-{ff}.json', {'fagfelt': ff, 'program': rader})
print(f'  {"sum":32s} {total / 1000:8.1f} kB')
print(f"Program: {koblet['so']} Samordna ({koblet['soMedSr']} med studieresultater), "
      f"{koblet['lokalt']} med bare lokalt opptak ({koblet['lokaltMedSr']} med studieresultater, "
      f"{koblet.get('lokaltMedSted', 0)} med studiested)")
print(f"Studiesteder: {len(ss_ut)} ({sum(1 for s in ss_ut if s['t'] == 's')} steder, {sum(1 for s in ss_ut if s['t'] == 'n')} nett, "
      f"{sum(1 for s in ss_ut if s['t'] == 'u')} i utlandet)")
nm = fv['okonomi'].get('1173', {})
tot26 = sum(sum(v[-1] for v in d.values()) for d in fv['okonomi'].values())
print(f"Kontroll økonomi 2026: NMBU alle {sum(v[-1] for v in nm.values())}, gradsprogram {nm.get('b', [0])[-1] + nm.get('m', [0])[-1]}, "
      f"felt {tot26}")
