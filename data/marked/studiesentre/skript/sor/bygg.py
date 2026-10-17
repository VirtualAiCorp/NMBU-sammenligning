import json, sys, urllib.parse, urllib.request, os
H = '2026-10-17'
NU = 'https://norskeutdanningssentre.no/medlem/oversikt-medlemmer/'
NUB = 'http://norskeutdanningssentre.no/besok-vare-utdanningssentre/'
KD24 = 'https://www.regjeringen.no/no/aktuelt/regjeringa-gir-50-millionar-kroner-til-studiesenter/id3033821/'
KD23 = 'https://www.regjeringen.no/no/aktuelt/regjeringen-fordeler-200-millioner-kroner-til-utdanninger-nart-folk/id2980966/'
HVLEKS = 'https://www.hvl.no/student/eksamen/'
HVLADR = 'https://hvl.no/en/about/contact-information'

def geo(q, velg=None):
    u = 'https://ws.geonorge.no/adresser/v1/sok?' + urllib.parse.urlencode({'sok': q, 'treffPerSide': 5, 'utkoordsys': 4258})
    d = json.load(urllib.request.urlopen(u, timeout=30))
    a = d['adresser']
    if velg:
        a = [x for x in a if x['adressetekst'] == velg]
    if not a:
        return None
    a = a[0]
    p = a['representasjonspunkt']
    return dict(adresse=a['adressetekst'], postnr=a['postnummer'], poststed=a['poststed'].title().replace(' I ', ' i '), kommune=a['kommunenavn'].title(), kommunenr=a['kommunenummer'], lat=round(p['lat'], 6), lon=round(p['lon'], 6))

def post(id, navn, type, eier, fylke, geoq=None, velg=None, adresse=None, postnr=None, poststed=None, kommune=None, kommunenr=None,
         nettside=None, epost=None, telefon=None, tilbyrEksamen=None, eksamenFor=None, digitalEksamen=None, lokaler=None,
         studietilbud=None, nettverk=None, merknad=None, kilde=None, sikkerhet='sannsynlig'):
    r = dict(id=id, navn=navn, type=type, eier=eier, adresse=adresse, postnr=postnr, poststed=poststed, kommune=kommune,
             kommunenr=kommunenr, fylke=fylke, lat=None, lon=None, nettside=nettside, epost=epost, telefon=telefon,
             tilbyrEksamen=tilbyrEksamen, eksamenFor=eksamenFor or [], digitalEksamen=digitalEksamen, lokaler=lokaler,
             studietilbud=studietilbud or [], nettverk=nettverk, merknad=merknad, kilde=kilde or [], hentet=H, sikkerhet=sikkerhet)
    if geoq:
        g = geo(geoq, velg)
        if g is None:
            print('INGEN TREFF:', id, geoq, file=sys.stderr)
        else:
            r.update(g)
            r['kilde'] = r['kilde'] + ['https://ws.geonorge.no/adresser/v1/sok?sok=' + urllib.parse.quote(geoq)]
    return r

HER = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HER, 'poster.py'), encoding='utf-8').read())

ut = os.path.join(HER, '..', '..', 'sor.json')
ids = [p['id'] for p in POSTER]
assert len(ids) == len(set(ids)), 'duplikat-id'
json.dump(POSTER, open(ut, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('skrev', len(POSTER), 'poster til', ut)
