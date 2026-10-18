#!/usr/bin/env python3
"""Anslag på «aktive forskere» fra OpenAlex: distinkte forfattere med tilknytning til en enhet som har minst N artikler
(type article) i et treårsvindu. Kontroll av årsverksnevnere (se data/rangering/inspirasjon/nevner-felles.md).
Henter verk (1 kreditt per 200 verk) med filteret authorships.institutions.lineage:<OpenAlex-id>,publication_year:Y1-Y2,
type:article, og teller lokalt. Enheter under institusjonsnivå (HH ved NMBU/UiS) avgrenses lokalt på rå tilknytningstekst
(raw_affiliation_strings) blant forfattere som har foreldreinstitusjonen. Forfatter-id-er holdes bare i minnet; ut går
bare tellinger. Nøkkel: OPENALEX_API_KEY i kilde/.env.local (skrives aldri ut).
Bruk: python3 scripts/rangering/openalex_aktive_forfattere.py 2021 2023 nhh bi cbs
"""
import sys,json,re,collections
import json,re,time,urllib.request,urllib.parse,urllib.error
from pathlib import Path
ROOT=Path('/Users/mathiassmogeli/Desktop/BOA-sammenligning')
def key():
    for l in (ROOT/'kilde/.env.local').read_text().splitlines():
        if l.startswith('OPENALEX_API_KEY='): return l.split('=',1)[1].strip().strip('"')
KEY=key()
state={'left':None,'used':0}
def get(path,params):
    p=dict(params); p['api_key']=KEY
    url='https://api.openalex.org'+path+'?'+urllib.parse.urlencode(p,safe=':|,/<>')
    for t in range(5):
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'NMBU-sammenligning (intern rangering)','Accept':'application/json'})
            with urllib.request.urlopen(req,timeout=120) as r:
                state['left']=r.headers.get('x-ratelimit-remaining'); state['used']+=int(r.headers.get('x-ratelimit-credits-used') or 0)
                d=json.load(r)
            time.sleep(0.4); return d
        except urllib.error.HTTPError as e:
            if e.code==429: time.sleep(8*(t+1)); continue
            raise SystemExit(f'HTTP {e.code} for {path}')
        except Exception as e:
            if t==4: raise
            time.sleep(3*(t+1))

UNITS={
 'nhh':dict(inst=['I931913249'],pat=None,fields=None),
 'bi':dict(inst=['I181046868'],pat=None,fields=None),
 'cbs':dict(inst=['I180519160'],pat=None,fields=None),
 'sse':dict(inst=['I180242103'],pat=None,fields=None),
 'hanken':dict(inst=['I5085271'],pat=None,fields=None),
 'molde':dict(inst=['I182204967'],pat=None,fields=None),
 'uis':dict(inst=['I92008406'],pat=None,fields=None),
 'nmbu':dict(inst=['I54108979'],pat=None,fields=None),
 'nmbu_hh':dict(inst=['I54108979'],pat=r'School of Economics and Business|Handelsh(ø|o)yskolen|Handelsh(ø|o)gskolen|School of Economics & Business|Faculty of Economics|School of Business',fields='14|20|18|33'),
 'uis_hh':dict(inst=['I92008406'],pat=r'UiS Business School|Business School|Handelsh(ø|o)gskolen|Handelsh(ø|o)yskolen|Handelshøgskole',fields='14|20|18|33'),
}
# Fakultetsenheter i Danmark/Sverige: mønster og foreldreinstitusjon fra data/rangering/openalex/enheter-norden.json
try:
    for _e in json.load(open(ROOT/'data/rangering/openalex/enheter-norden.json'))['enheter']:
        if _e['id'] in ('se_lund','dk_aarhus'):
            UNITS[_e['id']]=dict(inst=[_e['openalex']],pat=_e['monster'],fields='|'.join(map(str,_e['felt'])))
except Exception:
    pass
def fetch(u,y1,y2,types='article'):
    c=UNITS[u]
    flt=f"authorships.institutions.lineage:{'|'.join(c['inst'])},publication_year:{y1}-{y2}"
    if types: flt+=f",type:{types}"
    if c['fields']: flt+=f",primary_topic.field.id:{c['fields']}"
    works=[];page=1
    while True:
        d=get('/works',{'filter':flt,'per_page':200,'page':page,'select':'id,publication_year,type,authorships'})
        works+=d['results']
        if len(works)>=d['meta']['count'] or not d['results'] or page*200>=10000: break
        page+=1
    return works,d['meta']['count']
def count(u,works):
    c=UNITS[u]; ids=set(c['inst']); pat=re.compile(c['pat']) if c['pat'] else None
    per=collections.Counter(); nwork=0
    for w in works:
        seen=set(); hit=False
        for a in w.get('authorships') or []:
            insts={i['id'].rsplit('/',1)[-1] for i in a.get('institutions') or []}
            lin=set()
            ok=False
            # lineage-filter used server side; locally require the institution (or child) in authorship
            if c['inst'][0] in insts or any(c['inst'][0] in (i.get('lineage') or []) or c['inst'][0]==i['id'].rsplit('/',1)[-1] for i in a.get('institutions') or []): ok=True
            if not ok: continue
            if pat and not any(pat.search(s) for s in (a.get('raw_affiliation_strings') or [])): continue
            aid=(a.get('author') or {}).get('id')
            if aid: seen.add(aid); hit=True
        if hit: nwork+=1
        for s in seen: per[s]+=1
    return per,nwork
if __name__=='__main__':
    res={}
    units=sys.argv[3:] or list(UNITS)
    y1,y2=sys.argv[1],sys.argv[2]
    for u in units:
        works,tot=fetch(u,y1,y2)
        per,nw=count(u,works)
        r={'works_server':tot,'works_hentet':len(works),'works_treff':nw,'forfattere_n1':len(per),'n2':sum(1 for v in per.values() if v>=2),'n3':sum(1 for v in per.values() if v>=3),'n5':sum(1 for v in per.values() if v>=5)}
        res[u]=r; print(u,y1,y2,r,'kreditter igjen',state['left'],flush=True)
    print(json.dumps(res,ensure_ascii=False))
