import json, re, csv, itertools, statistics as st
from pathlib import Path
R=Path.home()/'Desktop/BOA-sammenligning/data/rangering'
maal=json.loads((R/'tidsskrift/anslag/maal.json').read_text())
def issn(s):
    s=re.sub(r"[^0-9Xx]","",str(s or "")).upper(); return f"{s[:4]}-{s[4:]}" if len(s)==8 else None
def les(f,kol,krav=None):
    m={}
    for r in csv.DictReader(open(R/'tidsskrift'/f,encoding='utf-8-sig')):
        if krav and r.get(krav)!='1': continue
        for k in ('issn','eissn'):
            i=issn(r.get(k))
            if i: m[i]=r.get(kol) if kol else '1'
    return m
abdc=les('abdc.csv','rating'); ft=les('ft50.csv',None,'ft50_2026'); utd=les('utd24.csv',None)
idx={}
for k,v in maal.items():
    for i in (v.get('issn'),v.get('eissn')):
        if i: idx[i]=v
fasit=json.loads((R/'ajg-nhh-rapport.json').read_text())['skoler']
SK=['nhh','bi','nmbu','nord','uia','uis','uit']
art={}
for sid in SK:
    for y in ['2020','2021','2022','2023','2024']:
        a=json.loads((R/'nva'/sid/f'{y}.json').read_text())['artikler']
        L=[]
        for x in a:
            ii=[i for i in (issn(x.get('issn')),issn(x.get('eissn'))) if i]
            j=next((idx[i] for i in ii if i in idx),{})
            L.append(dict(nvi=x.get('nvi'),abdc=next((abdc[i] for i in ii if i in abdc),None),ft=any(i in ft or i in utd for i in ii),
                          sit=j.get('sit2'),h=j.get('h'),jufo=str(j.get('jufo') or ''),dk=str(j.get('dk') or ''),niva=x.get('niva')))
        art[(sid,y)]=L
def corr(x,y):
    mx,my=st.mean(x),st.mean(y); a=sum((p-mx)*(q-my) for p,q in zip(x,y)); b=(sum((p-mx)**2 for p in x)*sum((q-my)**2 for q in y))**.5; return a/b if b else 0
def spear(x,y):
    rk=lambda v:[sorted(v,reverse=True).index(e) for e in v]; return corr(rk(x),rk(y))
def evaluer(regel, nvi=True, niva='top'):
    obs,pred=[],[]
    so,sp={},{}
    for (sid,y),L in art.items():
        if niva=='3' and y=='2022': continue
        f=fasit[sid][y]; o=(f['4*']['n']+f['4']['n']) if niva=='top' else f['3']['n']
        p=sum(1 for a in L if (a['nvi'] or not nvi) and regel(a))
        obs.append(o); pred.append(p); so[sid]=so.get(sid,0)+o; sp[sid]=sp.get(sid,0)+p
    mae=st.mean(abs(a-b) for a,b in zip(obs,pred)); tot=sum(pred)/max(1,sum(obs))
    return dict(mae=round(mae,1), forhold=round(tot,2), r=round(corr(obs,pred),3), spearman_skole=round(spear(list(so.values()),list(sp.values())),2), skole={k:(so[k],sp[k]) for k in so})
ut={}
top={
 'FT50/UTD24':lambda a:a['ft'],
 'FT ∪ ABDC A*':lambda a:a['ft'] or a['abdc']=='A*',
 'FT ∪ (A* ∧ JUFO3)':lambda a:a['ft'] or (a['abdc']=='A*' and a['jufo']=='3'),
}
for th in [2,3,4,5,6,7,8,10]:
    top[f'FT ∪ (A* ∧ sit≥{th})']=(lambda t:lambda a:a['ft'] or (a['abdc']=='A*' and (a['sit'] or 0)>=t))(th)
    top[f'FT ∪ (A* ∧ (JUFO3 ∨ sit≥{th}))']=(lambda t:lambda a:a['ft'] or (a['abdc']=='A*' and (a['jufo']=='3' or (a['sit'] or 0)>=t)))(th)
for h in [80,120,160,200,250]:
    top[f'FT ∪ (A* ∧ h≥{h})']=(lambda t:lambda a:a['ft'] or (a['abdc']=='A*' and (a['h'] or 0)>=t))(h)
res=[]
for n,f in top.items():
    for nvi in (True,False):
        e=evaluer(f,nvi); res.append((e['mae'],n,nvi,e))
res.sort(key=lambda x:x[0])
print("TOPP (AJG 4/4*): beste 8 etter MAE")
for m,n,nvi,e in res[:8]: print(f"  {n:34s} nvi={nvi!s:5s} MAE {e['mae']:5} forhold {e['forhold']} r {e['r']} spearman {e['spearman_skole']}")
best=res[0]; print("  per skole (fasit, anslag):",best[3]['skole'])
ut['top']=res[:8]
# nivå 3 gitt beste topp
bt=top[best[1]]
tre={
 'ABDC A (ikke topp)':lambda a:not bt(a) and a['abdc']=='A',
 'ABDC A* eller A (ikke topp)':lambda a:not bt(a) and a['abdc'] in ('A*','A'),
 '(A*|A) ∧ JUFO≥2 (ikke topp)':lambda a:not bt(a) and a['abdc'] in ('A*','A') and a['jufo'] in ('2','3'),
}
for th in [1,1.5,2,2.5,3,4]:
    tre[f'(A*|A) ∧ sit≥{th} (ikke topp)']=(lambda t:lambda a:not bt(a) and a['abdc'] in ('A*','A') and (a['sit'] or 0)>=t)(th)
    tre[f'(A* ∨ (A ∧ sit≥{th})) (ikke topp)']=(lambda t:lambda a:not bt(a) and (a['abdc']=='A*' or (a['abdc']=='A' and (a['sit'] or 0)>=t)))(th)
r3=[]
for n,f in tre.items():
    e=evaluer(f,best[2],'3'); r3.append((e['mae'],n,e))
r3.sort(key=lambda x:x[0])
print("NIVÅ 3: beste 6")
for m,n,e in r3[:6]: print(f"  {n:38s} MAE {e['mae']:5} forhold {e['forhold']} r {e['r']} spearman {e['spearman_skole']}")
print("  per skole:",r3[0][2]['skole'])


print("\n=== VALGTE REGLER ===")
T=lambda a:a['ft'] or (a['abdc']=='A*' and (a['sit'] or 0)>=5)
for navn,f,niva in [('topp: FT ∪ (A* ∧ sit≥5)',T,'top'),('3: (A*|A) ∧ sit≥4, ikke topp',lambda a:not T(a) and a['abdc'] in ('A*','A') and (a['sit'] or 0)>=4,'3'),('3: (A*|A) ∧ JUFO≥2, ikke topp',lambda a:not T(a) and a['abdc'] in ('A*','A') and a['jufo'] in ('2','3'),'3')]:
    e=evaluer(f,True,niva); print(navn, {k:e[k] for k in ('mae','forhold','r','spearman_skole')}); print('   ', e['skole'])
# per år for topp
for sid in SK:
    print(sid, [(y, fasit[sid][y]['4*']['n']+fasit[sid][y]['4']['n'], sum(1 for a in art[(sid,y)] if a['nvi'] and T(a))) for y in ['2020','2021','2022','2023','2024']])
