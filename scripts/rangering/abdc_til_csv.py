"""Gjør ABDC JQL 2025 (offisiell xlsx fra abdc.edu.au) om til data/rangering/tidsskrift/abdc.csv.
Kjør: python scripts/rangering/abdc_til_csv.py  (krever openpyxl)"""
import csv, sys, os
from pathlib import Path
import openpyxl
sys.path.insert(0, os.path.dirname(__file__))
from issn import normaliser

ROT = Path(__file__).resolve().parents[2] / 'data/rangering/tidsskrift'
XLSX = ROT / 'kilde/ABDC-JQL-2025-v3-210926.xlsx'

# Skrivefeil i ABDC-fila (ugyldig kontrollsiffer eller tekst i ISSN-feltet), rettet etter
# oppslag i ISSN-portalen (portal.issn.org) og Crossref 03.10.2026. (tittel, felt) -> riktig verdi
RETTELSER = {
    ('Applied Economic Perspectives and Policy', 'issn'): '2040-5790',   # ABDC: 2040-5804 (=online)
    ('Applied Economic Perspectives and Policy', 'eissn'): '2040-5804',  # ABDC: 2040-5970
    ('Asian Review of Accounting', 'issn'): '1321-7348',                 # ABDC: forlagsnavn
    ('Journal of Case Studies', 'eissn'): '2162-3171',                   # ABDC: 2328-700X (ugyldig)
    ('Journal of Economic Literature', 'issn'): '0022-0515',             # ABDC: 0002-0515
    ('Journal of Heritage Tourism', 'eissn'): '1747-6631',               # ABDC: 1747-6331
    ('Journal of Industrial Relations', 'eissn'): '1472-9296',           # ABDC: 1472-9269
    ('Stanford Social Innovation Review', 'issn'): '1542-7099',          # ABDC: 1542-7009
    ('Third World Quarterly', 'issn'): '0143-6597',                      # ABDC: 0413-6597
    # Review of Marketing and Agricultural Economics: eISSN 0034-3409 er ugyldig og ukjent; utelatt
}

wb = openpyxl.load_workbook(XLSX, read_only=True)
ws = wb['2025 JQL']
rader, hode, avvik = [], None, []
for r in ws.iter_rows(values_only=True):
    celler = [(c.strip() if isinstance(c, str) else c) for c in r]
    if hode is None:
        if 'Journal Title' in celler:
            hode = {navn: i for i, navn in enumerate(celler) if navn}
        continue
    tittel = celler[hode['Journal Title']]
    if not tittel:
        continue
    rating = (celler[hode['2025 rating']] or '').strip()
    raw_p, raw_e = celler[hode['ISSN']], celler[hode['ISSNOnline']]
    p, e = normaliser(raw_p), normaliser(raw_e)
    t = ' '.join(str(tittel).split())
    if (t, 'issn') in RETTELSER: p = RETTELSER[(t, 'issn')]
    if (t, 'eissn') in RETTELSER: e = RETTELSER[(t, 'eissn')]
    if raw_p and not p: avvik.append((tittel, 'issn', raw_p))
    if raw_e and not e: avvik.append((tittel, 'eissn', raw_e))
    if e == p: e = '' if p else e
    rader.append({'tittel': ' '.join(str(tittel).split()), 'issn': p, 'eissn': e,
                  'rating': rating, 'fagfelt': str(celler[hode['FoR']] or '').strip()})

# Dubletter: samme (issn, eissn, tittel) slås sammen; samme ISSN med ulik tittel rapporteres
sett, unike = set(), []
for r in rader:
    n = (r['issn'], r['eissn'], r['tittel'].lower())
    if n in sett: continue
    sett.add(n); unike.append(r)
fra_issn = {}
for r in unike:
    for k in (r['issn'], r['eissn']):
        if k: fra_issn.setdefault(k, []).append(r['tittel'])
dobbel = {k: v for k, v in fra_issn.items() if len(v) > 1}

with open(ROT / 'abdc.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=['tittel', 'issn', 'eissn', 'rating', 'fagfelt'])
    w.writeheader(); w.writerows(unike)

from collections import Counter
print('rader', len(rader), 'unike', len(unike), Counter(r['rating'] for r in unike))
print('ugyldige ISSN (fjernet):', len(avvik)); [print('  ', a) for a in avvik]
print('ISSN delt av flere titler:', len(dobbel)); [print('  ', k, v) for k, v in dobbel.items()]
print('uten noen ISSN:', sum(1 for r in unike if not r['issn'] and not r['eissn']))
