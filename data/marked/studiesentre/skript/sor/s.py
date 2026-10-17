import sys, re
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from h import hent, tekst
pat = re.compile(r'eksam|adresse|post@|kontakt@|@|tlf|telefon|sentralbord|\b\d{4} [A-ZÆØÅ][a-zæøå]+|inspera|wiseflow|eksamensrom|grupperom|lesesal', re.I)
lp = re.compile(r'kontakt|om-|om_|omoss|eksam|student|lokal|rom', re.I)
hode = 1500
args = sys.argv[1:]
if args and args[0].startswith('--hode='):
    hode = int(args.pop(0)[7:])
for u in args:
    p = hent(u)
    try:
        raw = open(p, encoding='utf-8', errors='ignore').read()
    except FileNotFoundError:
        print(f'##### {u} FEIL: ikke hentet'); continue
    t = tekst(raw, True)
    lines = [l.strip() for l in t.split('\n') if len(l.strip()) > 1]
    plain = [re.sub(r'\[[^\]]*\]', '', l).strip() for l in lines]
    print(f'##### {u} ({len(raw)} b)')
    print(' | '.join(x for x in plain if x)[:hode])
    print('-- treff:')
    seen = set()
    for l in plain:
        if l and pat.search(l) and l not in seen:
            seen.add(l); print('  ', l[:300])
    links = sorted(set(re.findall(r'href="([^"#]+)"', raw)))
    print('-- lenker:', ' '.join(x for x in links if lp.search(x))[:1500])
