"""Lager ft50.csv og utd24.csv med ISSN fra Crossref (api.crossref.org/journals).
Titlene er skrevet inn for hånd fra de offisielle listene (se data/rangering/tidsskrift/kilder.md).
Kjør: python3 scripts/rangering/lister_issn.py"""
import csv, json, os, re, sys, time, urllib.parse, urllib.request
from pathlib import Path
sys.path.insert(0, os.path.dirname(__file__))
from issn import normaliser

ROT = Path(__file__).resolve().parents[2] / 'data/rangering/tidsskrift'
MAILTO = 'mathias.sydtangen.smogeli@nmbu.no'

# (tittel som i listen, i FT50 2016, i FT50 2026, i UTD24, Crossref-søk/forventet tittel)
J = [
 ('Academy of Management Annals', 0,1,0, None),
 ('Academy of Management Journal', 1,1,1, None),
 ('Academy of Management Review', 1,1,1, None),
 ('Accounting, Organizations and Society', 1,1,0, None),
 ('The Accounting Review', 1,1,1, None),
 ('Administrative Science Quarterly', 1,1,1, None),
 ('American Economic Review', 1,1,0, None),
 ('American Sociological Review', 0,1,0, None),
 ('Contemporary Accounting Research', 1,1,0, None),
 ('Econometrica', 1,1,0, None),
 ('Entrepreneurship Theory and Practice', 1,1,0, None),
 ('Harvard Business Review', 1,1,0, None),
 ('Human Relations', 1,0,0, None),
 ('Human Resource Management', 1,1,0, None),
 ('Information Systems Research', 1,1,1, None),
 ('INFORMS Journal on Computing', 0,0,1, None),
 ('Journal of Accounting and Economics', 1,1,1, None),
 ('Journal of Accounting Research', 1,1,1, None),
 ('Journal of Applied Psychology', 1,1,0, None),
 ('Journal of Business Ethics', 1,0,0, None),
 ('Journal of Business Venturing', 1,1,0, None),
 ('Journal of Consumer Psychology', 1,1,0, None),
 ('Journal of Consumer Research', 1,1,1, None),
 ('Journal of Finance', 1,1,1, 'The Journal of Finance'),
 ('Journal of Financial and Quantitative Analysis', 1,1,0, None),
 ('Journal of Financial Economics', 1,1,1, None),
 ('Journal of International Business Studies', 1,1,1, None),
 ('Journal of Management', 1,1,0, None),
 ('Journal of Management Information Systems', 1,1,0, None),
 ('Journal of Management Studies', 1,1,0, None),
 ('Journal of Marketing', 1,1,1, None),
 ('Journal of Marketing Research', 1,1,1, None),
 ('Journal of Operations Management', 1,1,1, None),
 ('Journal of Political Economy', 1,1,0, None),
 ('Journal of the Academy of Marketing Science', 1,1,0, None),
 ('Management Science', 1,1,1, None),
 ('Manufacturing & Service Operations Management', 1,1,1, None),
 ('Marketing Science', 1,1,1, None),
 ('MIS Quarterly', 1,1,1, None),
 ('MIT Sloan Management Review', 1,1,0, None),
 ('Operations Research', 1,1,1, None),
 ('Organization Science', 1,1,1, None),
 ('Organization Studies', 1,0,0, None),
 ('Organizational Behavior and Human Decision Processes', 1,1,0, None),
 ('Production and Operations Management', 1,1,1, None),
 ('Psychological Science', 0,1,0, None),
 ('Quarterly Journal of Economics', 1,1,0, 'The Quarterly Journal of Economics'),
 ('Research Policy', 1,1,0, None),
 ('Review of Accounting Studies', 1,1,0, None),
 ('Review of Economic Studies', 1,1,0, 'The Review of Economic Studies'),
 ('Review of Finance', 1,1,0, None),
 ('Review of Financial Studies', 1,1,1, 'The Review of Financial Studies'),
 ('Strategic Entrepreneurship Journal', 1,1,0, None),
 ('Strategic Management Journal', 1,1,1, None),
]

def enkel(t):
    t = t.lower().replace('&', 'and')
    t = re.sub(r'^the\s+', '', t)
    return re.sub(r'[^a-z0-9]+', ' ', t).strip()

def crossref(tittel, forventet):
    url = 'https://api.crossref.org/journals?' + urllib.parse.urlencode(
        {'query': tittel, 'rows': 20, 'mailto': MAILTO})
    with urllib.request.urlopen(url, timeout=30) as r:
        items = json.load(r)['message']['items']
    mål = enkel(forventet or tittel)
    treff = [it for it in items if enkel(it['title']) == mål]
    if not treff:
        return None
    # Flere Crossref-oppføringer med samme tittel: velg den med flest DOI-er
    it = max(treff, key=lambda x: x.get('counts', {}).get('total-dois', 0))
    p = e = ''
    for x in it.get('issn-type', []):
        v = normaliser(x['value'])
        if x['type'] == 'print' and not p: p = v
        elif x['type'] == 'electronic' and not e: e = v
    for x in it.get('ISSN', []):  # uten type: fyll hull
        v = normaliser(x)
        if v and v not in (p, e):
            if not p: p = v
            elif not e: e = v
    if p == e: e = ''
    return it['title'], p, e, it.get('publisher', '')

resultat, mangler = [], []
for tittel, f16, f26, utd, forv in J:
    r = crossref(tittel, forv); time.sleep(0.3)
    if not r:
        mangler.append(tittel); r = ('', '', '', '')
    resultat.append(dict(tittel=tittel, issn=r[1], eissn=r[2], crossref_tittel=r[0],
                         ft50_2016=f16, ft50_2026=f26, utd24=utd))
    print(f'{tittel[:45]:45} {r[1]:10} {r[2]:10} {r[0][:40]} | {r[3][:30]}')
print('MANGLER:', mangler)
json.dump(resultat, open(ROT / 'kilde/crossref-ft50-utd24.json', 'w'), ensure_ascii=False, indent=1)

# --- Supplering og kontroll mot ABDC 2025 (offisiell fil) og manuelle oppslag i ISSN-portalen ---
MANUELT = {  # verifisert i portal.issn.org 03.10.2026 (Crossref mangler eller er ufullstendig)
    'Harvard Business Review': ('0017-8012', ''),
    'Manufacturing & Service Operations Management': ('1523-4614', '1526-5498'),
    # Crossref oppgir 0899-1499 = forløperen ORSA Journal on Computing; gjeldende trykt ISSN er 1091-9856
    'INFORMS Journal on Computing': ('1091-9856', '1526-5528'),
    # Elsevier: Crossref og ABDC oppgir bare trykt ISSN; online-ISSN fra ISSN-portalen
    'Journal of Accounting and Economics': ('0165-4101', '1879-1980'),
    'Journal of Financial Economics': ('0304-405X', '1879-2774'),
}
abdc = {}
with open(ROT / 'abdc.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        abdc[enkel(r['tittel'])] = r
for r in resultat:
    kilde = 'crossref'
    if r['tittel'] in MANUELT:
        r['issn'], r['eissn'] = MANUELT[r['tittel']]; kilde = 'issn-portalen'
    a = abdc.get(enkel(r['tittel'])) or abdc.get(enkel(r['crossref_tittel'] or 'x'))
    if a:
        if not r['issn'] and a['issn']: r['issn'] = a['issn']; kilde += '+abdc'
        if not r['eissn'] and a['eissn'] and a['eissn'] != r['issn']: r['eissn'] = a['eissn']; kilde += '+abdc'
        if {r['issn'], r['eissn']} - {''} != {a['issn'], a['eissn']} - {''}:
            print('AVVIK mot ABDC:', r['tittel'], (r['issn'], r['eissn']), (a['issn'], a['eissn']))
    else:
        print('Ikke i ABDC:', r['tittel'])
    r['issn_kilde'] = kilde
    for k in ('issn', 'eissn'):
        assert r[k] == '' or normaliser(r[k]) == r[k], (r['tittel'], r[k])

def skriv(navn, rader, felt):
    sett = set()
    with open(ROT / navn, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=felt, extrasaction='ignore'); w.writeheader()
        for r in rader:
            n = enkel(r['tittel'])
            assert n not in sett, r['tittel']; sett.add(n)
            w.writerow(r)
    print(navn, len(rader))

ft = [dict(r, tittel=r['tittel'].removeprefix('The ')) if r['tittel'] == 'The Accounting Review' else r
      for r in resultat if r['ft50_2016'] or r['ft50_2026']]
skriv('ft50.csv', ft, ['tittel', 'issn', 'eissn', 'ft50_2026', 'ft50_2016', 'issn_kilde'])
skriv('utd24.csv', [r for r in resultat if r['utd24']], ['tittel', 'issn', 'eissn', 'issn_kilde'])
print('FT50 2026:', sum(r['ft50_2026'] for r in ft), ' FT50 2016:', sum(r['ft50_2016'] for r in ft))
