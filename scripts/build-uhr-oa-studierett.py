#!/usr/bin/env python3
"""ØA-studentene gjennom UHR-kjernen: karakterene til kandidatene med BØA-studierett, område for område.

For hver institusjon × UHR-område (13 emneområder i courseMapping2.ts) og fagområde (bedriftsøkonomi, administrasjon,
samfunnsøkonomi, metode, etikk og hele kjernen) × år 2021–2025 beregnes for
  (a) ØA-studentene: DBH 308 per studieprogram (308_* karakterer per semester, 308pt_* totalt per år), og
  (b) alle på emnene: DBH 308 per emne (308e_* karakterer, 308et_* totalt),
n (kandidater med A–F), studiepoengvektet snitt (A=5 … F=0), strykprosent F/(A–F), andel G/H og skjermet andel.

Hvilke emner som dekker hvert område og år, kommer fra forslag-listene i data/hh/uhr-gjennomgang.json (med aarFra/aarTil
for forgjengerkoder). courseMapping2.ts endres ikke. Programkodene per institusjon kommer fra hhProgrammer i
uhr-gjennomgang.json → data/hh/dbh-programkart.json (samme som hhCourseData.json, groups[id='oa']).
Studiepoeng per emne og år fra DBH 208 (forslaget brukes når 208 mangler).

Skriver kilde/public/uhr/oa-studierett.json. Kjøres med: python3 scripts/build-uhr-oa-studierett.py
"""
import gzip, json, re, sys, collections
from pathlib import Path

ROT = Path(__file__).resolve().parent.parent
CACHE = ROT / 'data/hh/kilder/dbh-cache'
GJ = json.loads((ROT / 'data/hh/uhr-gjennomgang.json').read_text())
PK = {p['entryId']: p for p in json.loads((ROT / 'data/hh/dbh-programkart.json').read_text())['programs']}
UT = ROT / 'kilde/public/uhr/oa-studierett.json'
AAR = list(range(2021, 2026))
KAR = 'ABCDEF'
POENG = dict(zip(KAR, (5, 4, 3, 2, 1, 0)))

# Fagområdene (UHR-ØA 2018) og emneområdene i courseMapping2.ts. Innføringsemnet (okonomi1) telles i bedriftsøkonomi,
# slik som i studiepoengtellingen i UHR-gjennomgangen (spEtterGjennomgangen).
FAG = [
    ('bedriftsokonomisk', 'Bedriftsøkonomi', ['finansregnskap', 'okonomistyring', 'investering', 'okonomi1']),
    ('administrasjon', 'Administrasjon', ['markedsforing', 'organisasjon', 'strategi']),
    ('samfunnsokonomi', 'Samfunnsøkonomi', ['makrookonomi', 'mikrookonomi']),
    ('metodefag', 'Metode', ['matematikk', 'statistikk', 'metode']),
    ('etikk', 'Etikk', ['etikk']),
]
OMR_NAVN = {
    'finansregnskap': 'Finansregnskap', 'okonomistyring': 'Økonomistyring', 'investering': 'Investering og finansiering',
    'okonomi1': 'Innføring i bedriftsøkonomi', 'markedsforing': 'Markedsføring', 'organisasjon': 'Organisasjon og ledelse',
    'strategi': 'Foretaksstrategi', 'makrookonomi': 'Makroøkonomi', 'mikrookonomi': 'Mikroøkonomi',
    'matematikk': 'Matematikk', 'statistikk': 'Statistikk', 'metode': 'Samfunnsvitenskapelig metode',
    'etikk': 'Etikk, samfunnsansvar og bærekraft',
}

# Programkoder som ikke står i dbh-programkart.json (nettstudiene), og institusjonskoder som har byttet
# (Høgskolen i Innlandet 0264 til og med 2024, Universitetet i Innlandet 1177 fra 2025).
EKSTRA_PROGRAM = {
    'kristiania_nett_x': ('8253', ['BOA']),
    'inn_nett_x': ('1177', ['BAØKAH', 'BAØKA']),
    'uit_nett_x': ('1130', ['B-ØKADMN']),
}
INST_FILER = {'1177': ['0264', '1177']}

MERKNAD = {
    'hvl': 'Avviker sterkt: ØA-studentene har langt lavere stryk enn alle på emnene. Mange som stryker, har trolig ikke '
           'ØA-studierett (privatister, andre programmer, tapt studierett). Bruk tallene med varsomhet.',
    'ntnu': 'BØA-koden dekket også Gjøvik og Ålesund i 2022–2024; emnekodene skiller campusene.',
    'ntnu_gjovik': 'Lå under felleskoden BØA i 2022–2024 (tatt med via NTNUs programkoder).',
    'ntnu_alesund': 'Lå under felleskoden BØA i 2022–2024 (tatt med via NTNUs programkoder).',
    'nord': 'Bodø og Steinkjer har samme DBH-kode og er slått sammen.',
    'usn': 'DBH-koden OKLED dekker alle campuser.',
    'bi': 'DIPØAH dekker alle campuser.',
    'nla': 'Oslo, Kristiansand og Bergen er summert.',
    'inn': 'Institusjonskode 0264 til og med 2024, 1177 fra 2025.',
    'onh': 'Ikke i DBH-cachen; ingen tall.',
    'inn_nett': 'BAØKA (deltid) og BAØKAH (heltid på nett, fra 2025) er slått sammen.',
}


def last(tabell: str, inst: str) -> list[dict]:
    f = CACHE / f'{tabell}_{inst}_5y.json.gz'
    if not f.exists():
        return []
    d = json.load(gzip.open(f))
    return d[1:]


def baser(kode: str, inst: str) -> set[str]:
    """Kodene en DBH-emnekode kan svare til i forslagslistene: BUS110-1 → BUS110, BED-1002NETT-1 → BED-1002NETT,
    UiA BE-111-G → BE-111, NTNU BØA1200-A → BØA1200. BI fører delvurderinger som eget siffer: MET29201 → MET2920."""
    ut = {kode}
    m = re.fullmatch(r'(.+)-[0-9A-ZÆØÅ]{1,3}', kode)
    if m:
        ut.add(m.group(1))
    if inst == '8241' and re.fullmatch(r'[A-ZÆØÅ]{2,4}\d{5}', kode):
        ut.add(kode[:-1])
    return ut


def tall(x) -> int:
    try:
        return int(x or 0)
    except ValueError:
        return 0


# ── Les DBH per institusjonskode (én gang) ────────────────────────────────────────────────────────────────────────────
class Inst:
    """Alt lagres per full DBH-emnekode (med versjon/delvurdering); `koder` slår opp fra forslagskoden."""
    def __init__(self, kode: str):
        self.prog_kar = collections.defaultdict(collections.Counter)   # (prog, kode, år) → {karakter: n}
        self.prog_tot = collections.Counter()                          # (prog, kode, år) → total
        self.emne_kar = collections.defaultdict(collections.Counter)   # (kode, år) → {karakter: n}
        self.emne_tot = collections.Counter()                          # (kode, år) → total
        self.sp = {}                                                   # (kode, år) → sp
        self.sp_siste = {}                                             # kode → (år, sp)
        self.navn = {}                                                 # forslagskode → emnenavn
        self.index = collections.defaultdict(set)                      # forslagskode → {DBH-koder}
        for fil in INST_FILER.get(kode, [kode]):
            def reg(k):
                for b in baser(k, fil):
                    self.index[b].add(k)
                return k
            for r in last('308', fil):
                self.prog_kar[(r['Studieprogramkode'], reg(r['Emnekode']), int(r['Årstall']))][r['Karakter']] += tall(r['Antall kandidater totalt'])
            for r in last('308pt', fil):
                self.prog_tot[(r['Studieprogramkode'], reg(r['Emnekode']), int(r['Årstall']))] += tall(r['Antall kandidater totalt'])
            for r in last('308e', fil):
                self.emne_kar[(reg(r['Emnekode']), int(r['Årstall']))][r['Karakter']] += tall(r['Antall kandidater totalt'])
            for r in last('308et', fil):
                self.emne_tot[(reg(r['Emnekode']), int(r['Årstall']))] += tall(r['Antall kandidater totalt'])
            for r in last('208', fil):
                k, aar = reg(r['Emnekode']), int(r['Årstall'])
                try:
                    sp = float(r['Studiepoeng'])
                except (TypeError, ValueError):
                    continue
                if sp <= 0:
                    continue
                self.sp.setdefault((k, aar), sp)
                if k not in self.sp_siste or aar > self.sp_siste[k][0]:
                    self.sp_siste[k] = (aar, sp)
                for b in baser(k, fil):
                    self.navn.setdefault(b, r.get('Emnenavn') or '')

    def vekt(self, dbhkode: str, aar: int, sp_kurs: float) -> float:
        """Andel av emnet en DBH-kode utgjør: 1 for en hel versjon, sp/sp_kurs for en delvurdering (BI)."""
        sp = self.sp.get((dbhkode, aar)) or (self.sp_siste.get(dbhkode) or (0, None))[1]
        return 1.0 if not sp else min(sp / sp_kurs, 1.0)


INST_CACHE: dict[str, Inst] = {}
def inst_data(kode: str) -> Inst:
    if kode not in INST_CACHE:
        INST_CACHE[kode] = Inst(kode)
    return INST_CACHE[kode]


def programkoder(hh: list[str]) -> tuple[str | None, list[str]]:
    kode, koder = None, []
    for e in hh:
        if e in PK:
            kode = kode or PK[e]['institusjonskode']; koder += PK[e]['studieprogramkoder']
        elif e in EKSTRA_PROGRAM:
            kode = kode or EKSTRA_PROGRAM[e][0]; koder += EKSTRA_PROGRAM[e][1]
    return kode, list(dict.fromkeys(koder))


# ── Beregning ─────────────────────────────────────────────────────────────────────────────────────────────────────────
def celle(rader: list[tuple[float, collections.Counter, float]]):
    """rader: (sp, karakterer, total) per emne. Gir {n, s, f, g, k (+ gh, x)} eller None.
    snitt = Σ sp·poeng / Σ sp·n(A–F); stryk = ΣF / Σn(A–F); skjult = total − (A–H)."""
    naf = sum(sum(k[c] for c in KAR) for _, k, _ in rader)
    gh = sum(k['G'] + k['H'] for _, k, _ in rader)
    kjent = naf + gh
    skjult = sum(max(t - (sum(k[c] for c in KAR) + k['G'] + k['H']), 0) for _, k, t in rader)
    if kjent + skjult < 0.5:
        return None
    vekt = sum(sp * sum(k[c] for c in KAR) for sp, k, _ in rader)
    snitt = sum(sp * sum(POENG[c] * k[c] for c in KAR) for sp, k, _ in rader) / vekt if vekt else None
    f = sum(k['F'] for _, k, _ in rader)
    ut = {'n': round(naf), 's': round(snitt, 2) if snitt is not None else None,
          'f': round(100 * f / naf, 1) if naf else None,
          'g': round(100 * gh / kjent, 1) if kjent else None,
          'k': round(100 * skjult / (kjent + skjult), 1)}
    if round(gh):
        ut['gh'] = round(gh)
    if round(skjult):
        ut['x'] = round(skjult)
    return ut


def i_aar(f: dict, aar: int) -> bool:
    return (f.get('aarFra') is None or aar >= f['aarFra']) and (f.get('aarTil') is None or aar <= f['aarTil'])


ut_inst: dict = {}
kontroll_avvik = []
delvurderinger = set()
for key, v in GJ['institusjoner'].items():
    instkode, progs = programkoder(v.get('hhProgrammer') or [])
    meta = {'program': v.get('program'), 'standard': bool(v.get('standardIHH')), 'merknad': MERKNAD.get(key),
            'dbh': instkode, 'programkoder': progs}
    sikkerhet = {o: x.get('sikkerhet') for o, x in v['omraader'].items() if x.get('sikkerhet') and x.get('sikkerhet') != 'sikker'}
    usikre = [o for o, x in v['omraader'].items() if x.get('sikkerhet') not in ('sikker', 'sannsynlig') and x.get('forslag')]
    if not instkode:
        ut_inst[key] = {**meta, 'aar': {}, 'emner': {}, 'usikre': usikre, 'sikkerhet': sikkerhet}
        continue
    D = inst_data(instkode)
    progset = set(progs)
    # ØA-studentene: alle programkodene slått sammen, per full DBH-kode og år
    oa_kar = collections.defaultdict(collections.Counter); oa_tot = collections.Counter()
    for (p, k, a), c in D.prog_kar.items():
        if p in progset:
            oa_kar[(k, a)].update(c)
    for (p, k, a), t in D.prog_tot.items():
        if p in progset:
            oa_tot[(k, a)] += t

    def kurs(kode: str, aar: int, sp_kurs: float, hvem: str):
        """Emnet som helhet: versjonene summeres, delvurderinger vektes med sin andel av studiepoengene."""
        kar, tot = collections.Counter(), 0.0
        for dk in D.index.get(kode, ()):
            kk = oa_kar.get((dk, aar)) if hvem == 'oa' else D.emne_kar.get((dk, aar))
            tt = oa_tot.get((dk, aar), 0) if hvem == 'oa' else D.emne_tot.get((dk, aar), 0)
            if not kk and not tt:
                continue
            w = D.vekt(dk, aar, sp_kurs)
            if w < 1:
                delvurderinger.add((key, kode))
            for c, n in (kk or {}).items():
                kar[c] += w * n
            tot += w * tt
        return kar, tot

    emner_meta: dict = {}
    aar_ut = {}
    for aar in AAR:
        valgt: dict[str, dict[str, float]] = {}  # område → {kode: sp}
        for omr, x in v['omraader'].items():
            if omr not in OMR_NAVN:
                continue
            koder = {}
            for f in x.get('forslag') or []:
                if i_aar(f, aar):
                    k = f['kode'].upper()
                    koder[k] = float(f['sp'])
                    emner_meta.setdefault(k, [D.navn.get(k) or f['navn'], f['sp'], f.get('aarFra'), f.get('aarTil')])
            valgt[omr] = koder

        cache: dict = {}
        def rad(kode, sp, hvem):
            if (kode, hvem) not in cache:
                cache[(kode, hvem)] = kurs(kode, aar, sp, hvem)
            kar, tot = cache[(kode, hvem)]
            return sp, kar, tot

        def samle(koder: dict[str, float], hvem: str):
            return celle([rad(k, sp, hvem) for k, sp in koder.items()])

        omr_ut = {}
        for omr, koder in valgt.items():
            emner = []
            for kode, sp in koder.items():
                a, b = samle({kode: sp}, 'oa'), samle({kode: sp}, 'alle')
                if not a and not b:
                    continue
                if a:
                    a['d'] = [round(rad(kode, sp, 'oa')[1][c]) for c in KAR]
                if b:
                    b['d'] = [round(rad(kode, sp, 'alle')[1][c]) for c in KAR]
                emner.append({'kode': kode, 'sp': sp, 'oa': a, 'alle': b})
            if emner:
                omr_ut[omr] = {'oa': samle(koder, 'oa'), 'alle': samle(koder, 'alle'), 'emner': emner}

        # Fagområdene og kjernen: hver emnekode telles én gang (samme emne kan dekke to områder)
        fag_ut = {}
        alle_koder: dict[str, float] = {}
        for fid, _, omrs in FAG:
            koder: dict[str, float] = {}
            for o in omrs:
                if o in omr_ut:
                    koder.update({k: sp for k, sp in valgt[o].items() if any(e['kode'] == k for e in omr_ut[o]['emner'])})
            alle_koder.update(koder)
            if koder:
                fag_ut[fid] = {'oa': samle(koder, 'oa'), 'alle': samle(koder, 'alle'), 'sp': sum(koder.values())}
        if alle_koder:
            fag_ut['kjerne'] = {'oa': samle(alle_koder, 'oa'), 'alle': samle(alle_koder, 'alle'), 'sp': sum(alle_koder.values())}
        if fag_ut:
            aar_ut[str(aar)] = {'fag': fag_ut, 'omr': omr_ut}

        # Kontroll mot UHR-gjennomgangen (oaKandidaterPerKode = 308pt-total for ØA-programmet, versjoner summert)
        for omr, x in v['omraader'].items():
            for kode, per in (x.get('oaKandidaterPerKode') or {}).items():
                ref = per.get(str(aar))
                naa = sum(oa_tot.get((dk, aar), 0) for dk in D.index.get(kode.upper(), ()))
                if ref is not None and ref != naa:
                    kontroll_avvik.append((key, omr, kode, aar, ref, naa))

    ut_inst[key] = {**meta, 'aar': aar_ut, 'emner': emner_meta, 'usikre': usikre, 'sikkerhet': sikkerhet}

data = {
    'generert': '2026-10-17',
    'kilde': 'DBH/HK-dir tabell 308 (karakterer per studieprogram og per emne) og 208 (studiepoeng), hentet 22.09.2026; '
             'emnene per UHR-område fra UHR-gjennomgangen 17.10.2026 (data/hh/uhr-gjennomgang.json).',
    'aar': AAR,
    'fag': [{'id': f, 'navn': n, 'omraader': o} for f, n, o in FAG] + [{'id': 'kjerne', 'navn': 'Hele kjernen', 'omraader': []}],
    'omraader': OMR_NAVN,
    'forklaring': {'n': 'kandidater med A–F', 's': 'studiepoengvektet snitt (A=5 … F=0)', 'f': 'strykprosent F/(A–F)',
                   'g': 'andel G/H av kandidatene med kjent resultat (%)', 'k': 'skjermet andel (%)',
                   'gh': 'antall G/H', 'x': 'antall skjermet', 'd': 'fordeling A–F'},
    'institusjoner': ut_inst,
}
UT.parent.mkdir(parents=True, exist_ok=True)
UT.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
print(f'Skrev {UT.relative_to(ROT)} ({UT.stat().st_size // 1024} kB)')

if kontroll_avvik:
    print(f'\n{len(kontroll_avvik)} avvik mot oaKandidaterPerKode i uhr-gjennomgang.json (inst, område, kode, år, ref, nå):')
    for a in kontroll_avvik[:40]:
        print(' ', a)
else:
    print('Kontroll: ØA-kandidatene per kode stemmer med uhr-gjennomgang.json.')
if delvurderinger:
    print(f'\nDelvurderinger (DBH-kode med færre sp enn emnet, vektet): {sorted(delvurderinger)}')

# Kort oversikt: siste år, metode og kjerne
s = lambda c: '–' if not c or c.get('s') is None else f"{c['s']:.2f}/{c['f']:.1f}%/n{c['n']}"
print('\n2025: metode ØA | metode alle | kjerne ØA | kjerne alle')
for k, v in ut_inst.items():
    a = v['aar'].get('2025', {}).get('fag', {})
    m, kj = a.get('metodefag', {}), a.get('kjerne', {})
    print(f"  {k:16} {s(m.get('oa')):22} {s(m.get('alle')):22} {s(kj.get('oa')):22} {s(kj.get('alle'))}")
