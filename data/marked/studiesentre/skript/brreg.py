import json,urllib.request,urllib.parse,os,sys
# Stier relativt til repoet (skriptet ligger i data/marked/studiesentre/skript/)
ROT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','..','..'))
B=os.path.join(ROT,'data/marked/studiesentre/kilder/brreg')
d=json.load(open(os.path.join(ROT,'data/marked/studiesteder/studiesteder.json')))
used={s['institusjon'] for s in d['steder']}
def get(url,fn):
    p=os.path.join(B,fn)
    if os.path.exists(p): return json.load(open(p))
    r=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={'Accept':'application/json'})))
    json.dump(r,open(p,'w'),ensure_ascii=False); return r
for k,v in d['institusjoner'].items():
    if k not in used: continue
    q=urllib.parse.quote(v['n'])
    r=get(f'https://data.brreg.no/enhetsregisteret/api/enheter?navn={q}&size=10',f'sok_{k}.json')
    hits=r.get('_embedded',{}).get('enheter',[])
    print(k,v['k'],'->',[(h['organisasjonsnummer'],h['navn'],h.get('naeringskode1',{}).get('kode')) for h in hits[:4]])
