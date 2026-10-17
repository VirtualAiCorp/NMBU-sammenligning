import sys, json, urllib.parse, urllib.request
for q in sys.argv[1:]:
    u = 'https://ws.geonorge.no/adresser/v1/sok?' + urllib.parse.urlencode({'sok': q, 'treffPerSide': 3, 'utkoordsys': 4258})
    d = json.load(urllib.request.urlopen(u, timeout=30))
    print('>>', q, '| treff:', d['metadata']['totaltAntallTreff'])
    for a in d['adresser'][:3]:
        p = a['representasjonspunkt']
        print('   ', a['adressetekst'], a['postnummer'], a['poststed'], a['kommunenavn'], a['kommunenummer'], round(p['lat'],6), round(p['lon'],6))
