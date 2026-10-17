#!/usr/bin/env python3
"""UHR-kartlegging 2.0: legger de sikre rettelsene fra UHR-gjennomgangen 17.10.2026 inn i courseMapping2.ts.

Den opprinnelige kartleggingen (courseMapping.ts, «Opprinnelig HH-analyse») røres ikke.
Kilde for rettelsene: data/hh/uhr-forslag-endringer.md (seksjonen «Sikker») og data/hh/uhr-gjennomgang.json
(etikkområdet). «Legg til i området» og forgjengerkoder (tidsserier) krever flere emner per område og er ikke med her.

Kjøres én gang på courseMapping2.ts slik den var etter OsloMet- og HiØ-rettelsene (idempotent for verdiendringer).
"""
import json, re, sys
from pathlib import Path

ROT = Path(__file__).resolve().parent.parent
FIL = ROT / 'kilde/src/app/data/courseMapping2.ts'
GJ = json.loads((ROT / 'data/hh/uhr-gjennomgang.json').read_text())
KURS = json.loads((ROT / 'kilde/src/app/data/hhCourseData.json').read_text())

# Karakterer fra DBH 308 (hele emnet, siste år) til fallbackGrades når koden byttes
DBH: dict[str, dict] = {}
for g in KURS['groups']:
    for p in g['programs']:
        for c in p['courses']:
            rader = [y for y in (c.get('emnenivaa') or c['years']) if y['total'] > 0]
            if rader:
                k = c['emnekode'].split('-')[0].upper() if not re.match(r'^[A-ZÆØÅ]+-\d', c['emnekode']) else c['emnekode'].rsplit('-', 1)[0].upper()
                if k not in DBH or rader[-1]['year'] > DBH[k]['year']:
                    DBH[k] = rader[-1]

S75, S5, S10, S15 = '7,5 sp', '5 sp', '10 sp', '15 sp'
ALLE11 = ['finansregnskap', 'okonomistyring', 'investering', 'markedsforing', 'organisasjon', 'strategi',
          'makrookonomi', 'mikrookonomi', 'matematikk', 'statistikk', 'metode']

# (område, institusjon) -> studiepoeng
SP: dict[tuple[str, str], str] = {}
def sp(inst, omr, verdi):
    for o in omr: SP[(o, inst)] = verdi
sp('nmbu', ['markedsforing', 'makrookonomi', 'organisasjon', 'metode'], S5)
sp('uia', ['okonomistyring', 'investering', 'markedsforing', 'organisasjon', 'mikrookonomi', 'matematikk', 'metode',
           'finansregnskap', 'strategi', 'makrookonomi', 'statistikk'], S75)
sp('usn', ['markedsforing', 'organisasjon', 'finansregnskap', 'okonomistyring', 'investering', 'strategi',
           'makrookonomi', 'mikrookonomi', 'matematikk', 'statistikk', 'metode', 'okonomi1'], S75)
sp('inn', ['investering', 'markedsforing', 'organisasjon', 'strategi', 'finansregnskap', 'okonomistyring', 'metode'], S75)
sp('nord', ['okonomistyring', 'investering', 'markedsforing', 'makrookonomi', 'mikrookonomi', 'matematikk', 'statistikk',
            'finansregnskap', 'organisasjon', 'metode'], S75)
sp('hvl', ALLE11, S75)
sp('kristiania', ['finansregnskap', 'okonomistyring', 'investering', 'organisasjon', 'strategi', 'makrookonomi',
                  'mikrookonomi', 'matematikk', 'statistikk', 'okonomi1', 'markedsforing', 'metode'], S75)
sp('uit', ['investering', 'markedsforing', 'organisasjon', 'matematikk'], S75)
sp('nla', ['makrookonomi', 'mikrookonomi', 'matematikk', 'statistikk'], S10)
sp('himolde', ['finansregnskap', 'okonomistyring', 'markedsforing', 'strategi', 'makrookonomi', 'mikrookonomi',
               'matematikk', 'statistikk', 'metode', 'organisasjon'], S75)
sp('himolde', ['investering'], S15)
sp('inn_rena', ['investering', 'markedsforing', 'organisasjon', 'strategi', 'finansregnskap', 'okonomistyring'], S75)
sp('ntnu_gjovik', ALLE11, S75)
sp('ntnu_alesund', ['finansregnskap', 'investering', 'markedsforing', 'organisasjon', 'strategi', 'makrookonomi',
                    'mikrookonomi', 'matematikk', 'statistikk', 'metode'], S75)
sp('uit_nett', ['investering', 'markedsforing', 'organisasjon', 'matematikk'], S75)

# (område, institusjon) -> (ny kode, nytt navn eller None)
KODE: dict[tuple[str, str], tuple[str, str | None]] = {
    ('statistikk', 'ntnu'): ('SØK1004', None),
    ('strategi', 'uia'): ('ORG209', 'Strategisk ledelse'),
    ('okonomi1', 'usn'): ('BØK1000', None),
    ('metode', 'nord'): ('MET1001', 'Anvendt metode'),
    ('okonomistyring', 'bi'): ('BØK3561', 'Prestasjonsstyring'),
    ('okonomi1', 'bi'): ('BØK3430', 'Innføring i bedriftsøkonomi og finans'),
    ('okonomistyring', 'uit'): ('BED-2019', 'Driftsregnskap og budsjettering'),
    ('metode', 'uit'): ('BED-2011', 'Samfunnsvitenskapelig metode og statistikk'),
    ('okonomi1', 'uit'): ('BED-1013', 'Bedriftsøkonomisk analyse'),
    ('statistikk', 'inn_rena'): ('3MET130', None),
    ('finansregnskap', 'inn_nett'): ('SREV100', 'Grunnleggende regnskap'),
}
NAVN: dict[tuple[str, str], str] = {('okonomi1', 'nmbu'): 'Bedriftsøkonomiske sammenhenger'}
FJERN = [('okonomi1', 'uia'), ('okonomi1', 'himolde')]
NYE: list[tuple[str, str, str, str, str]] = [  # område, institusjon, kode, navn, sp
    ('okonomi1', 'inn', 'ØKA1016', 'Grunnleggende bedriftsøkonomi', S75),
    ('okonomi1', 'nord', 'ECO1002', 'Bedriftsøkonomisk analyse med programvare', S75),
    ('okonomi1', 'hvl', 'BØA113', 'Innføring i bedriftsøkonomi og regnskap', S75),
    ('okonomi1', 'inn_rena', '3BED100', 'Grunnleggende bedriftsøkonomi', S75),
    ('okonomi1', 'ntnu_gjovik', 'SMF1194', 'Bedriftsøkonomi', S75),
    ('okonomi1', 'ntnu_alesund', 'AE101108', 'Bedriftsøkonomi med regnskap', S75),
    ('okonomi1', 'kristiania_nett', '6324', 'Bedriftsøkonomi', S75),
    ('organisasjon', 'inn_nett', 'SORG100', 'Organisasjonsforståelse', S75),
    ('okonomi1', 'inn_nett', 'SBED100', 'Grunnleggende bedriftsøkonomi', S75),
    ('okonomi1', 'uit_nett', 'BED-1502', 'Bedriftsøkonomisk analyse', S75),
]

src = FIL.read_text()
endret: list[str] = []

def blokk(omr: str, inst: str):
    """(start, slutt) for COURSE_MAPPING[omr][inst], eller None."""
    i = src.index(f'\n  {omr}: {{\n')
    slutt_omr = src.index('\n  },\n', i)
    m = re.compile(rf'\n    {re.escape(inst)}: {{\n').search(src, i, slutt_omr)
    if not m: return None
    j = src.index('\n    },\n', m.start()) + len('\n    },')
    return m.start() + 1, j + 1

def sett(tekst: str, felt: str, verdi: str) -> str:
    return re.sub(rf"({felt}: )'[^']*'", lambda m: f"{m.group(1)}'{verdi}'", tekst, count=1)

def karakterer(kode: str) -> str | None:
    y = DBH.get(kode.upper())
    return None if not y else '{ ' + ', '.join(f'{b}: {y[b]}' for b in 'ABCDEF') + ' }'

def bytt_kode(tekst: str, kode: str, navn: str | None) -> str:
    tekst = sett(tekst, 'codeShort', kode.lower())
    tekst = sett(tekst, 'displayCode', kode)
    if navn: tekst = sett(tekst, 'courseName', navn)
    k = karakterer(kode)
    if k: tekst = re.sub(r'fallbackGrades: \{[^}]*\}', f'fallbackGrades: {k}', tekst, count=1)
    # Lenker, læringsutbytte og vurderingsdetaljer gjaldt det gamle emnet
    tekst = re.sub(r"\n      courseUrl: '[^']*',", '', tekst)
    tekst = re.sub(r"\n      learningOutcomes: \{[\s\S]*?\n      \},", '', tekst)
    tekst = re.sub(r"\n      assessmentDetails: '(?:[^'\\]|\\.)*',", '', tekst)
    return tekst

def erstatt(omr, inst, fn):
    global src
    b = blokk(omr, inst)
    if not b: print(f'MANGLER {omr}.{inst}', file=sys.stderr); return
    ny = fn(src[b[0]:b[1]])
    if ny != src[b[0]:b[1]]: endret.append(f'{omr}.{inst}')
    src = src[:b[0]] + ny + src[b[1]:]

for (omr, inst), v in SP.items(): erstatt(omr, inst, lambda t, v=v: sett(t, 'credits', v))
for (omr, inst), (kode, navn) in KODE.items(): erstatt(omr, inst, lambda t, k=kode, n=navn: bytt_kode(t, k, n))
for (omr, inst), navn in NAVN.items(): erstatt(omr, inst, lambda t, n=navn: sett(t, 'courseName', n))

# UiT: makro og mikro er byttet om (samme feil som OsloMet). Bytt hele oppføringene, behold beskrivelsen.
def uit_bytt():
    global src
    a, b = blokk('makrookonomi', 'uit'), blokk('mikrookonomi', 'uit')
    ta, tb = src[a[0]:a[1]], src[b[0]:b[1]]
    if "displayCode: 'SOK-1010'" in ta: return  # allerede byttet
    def med_beskrivelse(kropp, fra):
        d = re.search(r"\n      description: '(?:[^'\\]|\\.)*',", fra).group(0)
        return re.sub(r"\n      description: '(?:[^'\\]|\\.)*',", lambda _: d, kropp, count=1)
    na, nb = med_beskrivelse(tb, ta), med_beskrivelse(ta, tb)
    na = re.sub(r"\n      courseUrl: '[^']*',", '', na); nb = re.sub(r"\n      courseUrl: '[^']*',", '', nb)
    src = src[:a[0]] + na + src[a[1]:b[0]] + nb + src[b[1]:]
    endret.extend(['makrookonomi.uit', 'mikrookonomi.uit'])
uit_bytt()

for omr, inst in FJERN:
    b = blokk(omr, inst)
    if b: src = src[:b[0]] + src[b[1]:]; endret.append(f'{omr}.{inst} (fjernet)')

def ny_oppforing(inst, kode, navn, sp_, beskrivelse, merknad=None, verifisert=True):
    k = karakterer(kode) or '{ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }'
    linjer = [f"    {inst}: {{",
              f"      institute: '{inst}', codeShort: '{kode.lower()}', displayCode: '{kode}',",
              f"      courseName: '{navn}', verified: {'true' if verifisert else 'false'},",
              f"      fallbackGrades: {k},",
              f"      description: '{beskrivelse}',",
              f"      credits: '{sp_}', examForm: 'Se emnesiden',"]
    if merknad: linjer.append(f"      note: '{merknad}',")
    linjer.append('    },')
    return '\n'.join(linjer) + '\n'

BESKR = {
    'okonomi1': 'Innføring i bedriftsøkonomi (ikke en del av UHR-kjernen).',
    'organisasjon': 'Organisasjonsteori og ledelse.',
    'etikk': 'Etikk, samfunnsansvar og bærekraft (UHR-krav fra 2018, minst 7,5 sp).',
}
def legg_til(omr, inst, tekst):
    global src
    if blokk(omr, inst): return
    i = src.index(f'\n  {omr}: {{\n'); j = src.index('\n  },\n', i) + 1
    src = src[:j] + tekst + src[j:]
    endret.append(f'{omr}.{inst} (ny)')

for omr, inst, kode, navn, sp_ in NYE:
    legg_til(omr, inst, ny_oppforing(inst, kode, navn, sp_, BESKR[omr]))

# ── Etikk, samfunnsansvar og bærekraft: nytt UHR-område ───────────────────────
if "  | 'etikk'" not in src:
    src = src.replace("  | 'mikrookonomi';", "  | 'mikrookonomi'\n  | 'etikk';", 1)
    src = src.replace("export type UhrGroupId = 'bedriftsokonomisk' | 'administrasjon' | 'samfunnsokonomi' | 'metodefag';",
                      "export type UhrGroupId = 'bedriftsokonomisk' | 'administrasjon' | 'samfunnsokonomi' | 'metodefag' | 'etikk';", 1)
    src = src.replace("""      { id: 'metode', label: 'Samfunnsvitenskapelig metode', description: 'Kvantitative og kvalitative forskningsmetoder' },
    ],
  },
];""", """      { id: 'metode', label: 'Samfunnsvitenskapelig metode', description: 'Kvantitative og kvalitative forskningsmetoder' },
    ],
  },
  {
    id: 'etikk',
    label: 'Etikk, samfunnsansvar og bærekraft',
    credits: '7,5 sp',
    courses: [
      { id: 'etikk', label: 'Etikk, samfunnsansvar og bærekraft', description: 'Tverrfaglig; egne emner eller integrert i de andre fagområdene' },
    ],
  },
];""", 1)
    i = src.index('\n};\n\nexport type Accreditation')
    src = src[:i] + "\n\n  // ─── 5. ETIKK, SAMFUNNSANSVAR OG BÆREKRAFT (UHR-ØA 2018) ─────────────────────\n  etikk: {\n  }," + src[i:]

for inst, v in GJ['institusjoner'].items():
    e = v['omraader'].get('etikk')
    if not e or not e.get('forslag'): continue
    sikker = e.get('sikkerhet') == 'sikker'
    f = e['forslag'][0]  # gjeldende emne (forgjengere står i uhr-gjennomgang.json)
    andre = [x for x in e['forslag'][1:] if not x.get('aarTil')]
    merknad = None
    if not sikker:
        merknad = (e.get('bevis') or 'Usikker kobling, se UHR-gjennomgangen.').replace("'", '’')
    if andre:
        tillegg = 'Området dekkes også av ' + ', '.join(f"{x['kode']} {x['navn']} ({str(x['sp']).replace('.', ',')} sp)" for x in andre) + '.'
        merknad = f'{merknad} {tillegg}' if merknad else tillegg
    sp_ = f"{str(f['sp']).replace('.', ',').removesuffix(',0')} sp"
    legg_til('etikk', inst, ny_oppforing(inst, f['kode'], f['navn'].replace("'", '’'), sp_, BESKR['etikk'], merknad, sikker))

# Topptekst
if 'UHR-kartlegging 2.0' not in src:
    src = ("// UHR-kartlegging 2.0 (17.10.2026): kopi av courseMapping.ts med rettelsene fra UHR-gjennomgangen\n"
           "// (docs/uhr-gjennomgang-2026-10-17.md, data/hh/uhr-forslag-endringer.md, skript scripts/build-coursemapping-v2.py)\n"
           "// og det femte UHR-området «Etikk, samfunnsansvar og bærekraft». Den opprinnelige kartleggingen i courseMapping.ts\n"
           "// brukes fortsatt av «Opprinnelig HH-analyse» og endres ikke. fallbackGrades for byttede emner er DBH 308, siste år.\n"
           + src)

FIL.write_text(src)
print(f'{len(endret)} oppføringer endret eller lagt til')
for e in endret: print(' ', e)

# ── Slank utgave av gjennomgangen til visningen «UHR-kartlegging 2.0» (kilde/public/uhr/gjennomgang.json) ──
UT = ROT / 'kilde/public/uhr/gjennomgang.json'
UT.parent.mkdir(parents=True, exist_ok=True)
slank = {
    'generert': GJ.get('generert'),
    'uhrKrav': GJ['uhrKrav'],
    'institusjoner': {
        inst: {
            'program': v.get('program'),
            'omraader': {
                omr: {k: o.get(k) for k in ('status', 'sikkerhet', 'bevis', 'forslag', 'oaKandidater') if o.get(k) is not None}
                for omr, o in v['omraader'].items()
            },
        }
        for inst, v in GJ['institusjoner'].items()
    },
}
UT.write_text(json.dumps(slank, ensure_ascii=False, separators=(',', ':')))
print(f'Skrev {UT.relative_to(ROT)} ({UT.stat().st_size // 1024} kB)')
