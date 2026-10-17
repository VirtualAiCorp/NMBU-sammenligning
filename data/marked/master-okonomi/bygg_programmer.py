#!/usr/bin/env python3
"""A2 – masterlandskapet i økonomi. Steg 2: programmer.json fra grunnlag.json + manuelt.json + SO-cache + skoler.json + HH-programkart.
Kjør: python3 -I data/marked/master-okonomi/bygg_grunnlag.py && python3 -I data/marked/master-okonomi/manuelt.py && python3 -I data/marked/master-okonomi/bygg_programmer.py
"""
import collections, csv, json, os, re

HER = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HER)))
G = json.load(open(os.path.join(HER, 'grunnlag.json'), encoding='utf-8'))
MAN = json.load(open(os.path.join(HER, 'manuelt.json'), encoding='utf-8'))
AAR = ['2021', '2022', '2023', '2024', '2025']
KAT = {'oa': 'Økonomi og administrasjon (siviløkonom m.fl.)', 'samfok': 'Samfunnsøkonomi og økonometri', 'finans': 'Finans', 'mrr': 'Regnskap og revisjon',
       'innovasjon': 'Innovasjon og entreprenørskap', 'ledelse': 'Ledelse, organisasjon og HR', 'okit': 'Økonomi og IT / business analytics',
       'energi_ressurs': 'Energi-, ressurs- og miljøøkonomi', 'biookonomi': 'Bioøkonomi og sirkulær økonomi', 'eiendom': 'Eiendom',
       'marked': 'Markedsføring og internasjonal business', 'forretningsjus': 'Forretningsjus og økonomi', 'mba': 'MBA / Executive MBA',
       'finans_erf': 'Erfaringsbasert finans', 'mpa': 'Offentlig administrasjon (MPA)', 'utdledelse': 'Utdannings- og skoleledelse',
       'helseok': 'Helseøkonomi og -ledelse', 'induok': 'Industriell økonomi (siv.ing.)', 'logistikk': 'Logistikk', 'reiseliv': 'Reiseliv og hotell'}
PERIFER = {'utdledelse', 'helseok', 'induok', 'logistikk', 'reiseliv'}
TYPE = {'M2': '2-årig', 'ME': 'erfaringsbasert', 'MX': 'erfaringsbasert', 'M5': '5-årig integrert'}
PRIVAT = {'8241', '8253', '8208'}
NORMERT = {'M2': 2, 'M5': 5, 'ME': 2, 'MX': 2}  # ME/MX: antatt 2 år (deltid 90 sp); se merknad i rapporten
SISTE707 = 2025
INSTKORT = {'0232': 'HiMolde', '0238': 'HVL', '0256': 'HiØ', '0264': 'INN', '1177': 'INN', '1110': 'UiO', '1120': 'UiB', '1130': 'UiT', '1150': 'NTNU',
            '1160': 'UiS', '1171': 'UiA', '1173': 'NMBU', '1174': 'Nord', '1175': 'OsloMet', '1176': 'USN', '1240': 'NHH', '8208': 'VID', '8241': 'BI', '8253': 'Kristiania'}
CAMPUS_RENS = [(r'^Handelshøyskolen BI - campus ', ''), (r'^Campus ', ''), (r'^UiT Norges arktiske universitet i ', ''), (r'^NHH ', ''),
               (r'^Universitetet i Stavanger$', 'Stavanger'), (r'^Universitetet i Bergen$', 'Bergen'), (r'^UiO$', 'Oslo (Blindern)')]


def rens_campus(n):
    for a, b in CAMPUS_RENS:
        n = re.sub(a, b, n)
    return n


def summer(dicts):
    out = collections.defaultdict(lambda: collections.Counter())
    for d in dicts:
        for y, v in d.items():
            out[y].update(v)
    return {y: dict(v) for y, v in sorted(out.items())}


def so_poeng():
    p = os.path.join(ROOT, 'data/hh/kilder/so_poenggrenser_2020-2026_hentet_2026-09-22.csv')
    res = collections.defaultdict(dict)
    for r in csv.DictReader(open(p, encoding='utf-8'), delimiter=';'):
        if r['Opptaksrunde'] != 'Hovedopptak': continue
        sk = re.sub(r'\D', '', r['Studiekode'])
        kv = 'forstegang' if r['Kvote'].startswith('Først') else 'ordinar' if r['Kvote'].startswith('Ordin') else None
        if kv and r['År'] >= '2021':
            v = r['Poenggrense'].replace(',', '.')
            res[sk].setdefault(r['År'], {})[kv] = float(v) if v not in ('', None) else None
    return res


def so_tall():
    p = os.path.join(ROOT, 'data/hh/kilder/so_sokertall_programnivaa_2021-2026_hentet_2026-09-22.json')
    res = collections.defaultdict(dict)
    nk = {'Alle søkere': 'sokere', 'Førstevalgssøkere': 'forstevalg', 'Studieplasser': 'studieplasser', 'Antall kvalifiserte': 'kvalifiserte', 'Antall tilbud': 'tilbud'}
    for r in json.load(open(p, encoding='utf-8')):
        if r['Nøkkeltall'] not in nk: continue
        for y in AAR + ['2026']:
            v = re.sub(r'\D', '', r.get(y) or '')
            if v:
                res[r['Studie- kode']].setdefault(y, {})[nk[r['Nøkkeltall']]] = int(v)
    return res


def akkreditering():
    out = {}
    for s in json.load(open(os.path.join(ROOT, 'data/rangering/skoler.json'), encoding='utf-8')):
        kode = str(s['dbh'].get('institusjonskode') or '')
        a = [{'type': x['type'], 'status': x['status'], 'aar': x.get('aar'), 'kilde': x.get('kilde')} for x in (s.get('akkrediteringer') or [])]
        for kk in re.findall(r'\d{4}', kode):
            if kk not in out or (a and not out[kk]):
                out[kk] = a
    return out


def hh_kart():
    pk = json.load(open(os.path.join(ROOT, 'data/hh/programkart.json'), encoding='utf-8'))
    dk = {p['entryId']: p for p in json.load(open(os.path.join(ROOT, 'data/hh/dbh-programkart.json'), encoding='utf-8'))['programs']}
    m = {}
    for g in pk['groups']:
        for p in g['programs']:
            d = dk.get(p['id']) or {}
            for inst in d.get('institusjonskoder') or [d.get('institusjonskode')]:
                for c in d.get('studieprogramkoder') or []:
                    m.setdefault((inst, c), []).append({'gruppe': g['id'], 'entryId': p['id'], 'default': p.get('default')})
    return m


def main():
    grupper = collections.defaultdict(list)
    for k in G['koder']:
        grupper[k['gruppe']].append(k)
    sop, sot, akk, hh = so_poeng(), so_tall(), akkreditering(), hh_kart()
    man = MAN['program']
    ut = []
    for gid, ks in sorted(grupper.items()):
        m = man.get(gid, {})
        hoved = max(ks, key=lambda k: (k['registrerte'].get('2025', 0), k['aar347'][-1], k['opptakL'].get('2025', {}).get('sokere', 0)))
        niva = hoved['niva']
        typ = TYPE[niva]
        kat = hoved['kat']
        inst = hoved['instFam']
        instkoder = sorted({k['inst'] for k in ks})
        kodene = sorted({k['kode'] for k in ks})
        navnHist = sorted({n for k in ks for n in k['navnHist']})
        camp = collections.Counter()
        for k in ks:
            for c, v in k['campus124'].items():
                camp[rens_campus(c)] += v
        sivok = m.get('sivilokonom', 'auto')
        if sivok == 'auto':
            sivok = True if any('siviløkonom' in n.lower() for n in navnHist) or hoved['nus'] in ('741125', '741133') else None
        opL = summer([k['opptakL'] for k in ks]); opN = summer([k['opptakN'] for k in ks])
        prim, sek = (opN, opL) if niva == 'M5' else (opL, opN)
        reg = collections.Counter(); kand = collections.Counter()
        for k in ks:
            reg.update(k['registrerte']); kand.update(k['kandidater'])
        kull = collections.defaultdict(collections.Counter)
        for k in ks:
            for y, v in k['kull707'].items():
                kull[y].update({kk: vv for kk, vv in v.items() if kk != '_niva'})
        gj = []
        for y, v in sorted(kull.items()):
            if int(y) < 2015 or not v['Startkull']: continue
            s = v['Startkull']
            nt = NORMERT.get(niva, 2) + int(y)  # normert sluttår; DBH 707 har data til og med 2025
            f1 = v['Fullført normert1'] if nt + 1 <= SISTE707 else None
            f2 = v['Fullført normert2'] if nt + 2 <= SISTE707 else None
            if nt > SISTE707: continue
            gj.append({'startaar': int(y), 'normertSlutt': nt, 'startkull': s, 'fullfortNormert': v['Fullført normert'], 'fullfortPlus1': f1, 'fullfortPlus2': f2,
                       'frafaltPlus2': v['Frafalt2'] if f2 is not None else None, 'andelNormert': round(100 * v['Fullført normert'] / s, 1),
                       'andelPlus1': round(100 * f1 / s, 1) if f1 is not None else None, 'andelPlus2': round(100 * f2 / s, 1) if f2 is not None else None})
        hhm = []
        for k in ks:
            for x in hh.get((k['inst'], k['kode']), []):
                if x not in hhm: hhm.append(x)
        soKode = MAN['soM5'].get(gid)
        hhmaster = [x for x in hhm if x['gruppe'] in ('moa', 'mecon', 'mei', 'bioec')]
        flagg = []
        if not reg.get('2025') and not prim.get('2025'): flagg.append('ingen registrerte eller søkere i 2025 (nedlagt, ny eller annen kode)')
        if niva == 'M5' and opL: flagg.append('5-årig: DBH 379 har også lokalt opptak (inntak til masterdelen); primærtallene er nasjonalt opptak (Samordna)')
        if m.get('iSum') is False: flagg.append('holdt utenfor summer')
        rec = {
            'id': gid, 'institusjon': hoved['instNavn'], 'instKort': INSTKORT.get(inst, inst), 'instKode': inst, 'avdeling': hoved['avd'],
            'navn': hoved['navn'], 'navnHistorikk': navnHist if len(navnHist) > 1 else None,
            'kategori': kat, 'kategoriNavn': KAT[kat], 'kjerne': kat not in PERIFER, 'type': typ, 'privat': inst in PRIVAT,
            'campus': [c for c, _ in camp.most_common()] or None, 'campusRegistrerte2025': dict(camp.most_common()) or None,
            'deltid': any(k['heltid'] < 1 for k in ks), 'sprak': m.get('sprak') or ('engelsk' if hoved['sprak'] == 'ENG' else 'norsk' if hoved['sprak'] == 'NOR' else hoved['sprak']),
            'sivilokonom': sivok,
            'dbh': {'institusjonskoder': instkoder, 'studieprogramkoder': kodene, 'nivakode': niva, 'nus': hoved['nus'], 'nusNavn': hoved['nusNavn'],
                    'aktivAar347': sorted({a for k in ks for a in k['aar347']}), 'studiepoeng': hoved['sp'], 'egenfinansieringProsent': hoved['egenfin']},
            'opptak': {y: prim[y] for y in AAR + ['2026v'] if y in prim} or None,
            'opptakstype': 'nasjonalt (Samordna, DBH 379 N)' if niva == 'M5' else 'lokalt (DBH 379 L)',
            'opptakAnnenType': {y: sek[y] for y in AAR if y in sek} or None,
            'registrerte': {y: reg[y] for y in AAR if y in reg} or None,
            'kandidater': {y: kand[y] for y in AAR if y in kand} or None,
            'gjennomforing': gj or None,
            'opptakskrav': m.get('opptakskrav'),
            'skolepenger': m.get('skolepenger') if inst in PRIVAT else None,
            'akkreditering': akk.get(inst) if akk.get(inst) is not None else ([] if inst in akk else None),
            'iHHProgramkart': bool(hhmaster), 'hhProgramkart': hhm or None,
            'so': ({'kode': soKode, 'poenggrenser': sop.get(soKode), 'tall': sot.get(soKode)} if soKode else None),
            'merknad': m.get('merknad'), 'flagg': flagg or None, 'iSum': m.get('iSum', True),
        }
        if rec['opptakskrav'] is None and typ == 'erfaringsbasert':
            rec['opptakskrav'] = {'snittkrav': None, 'bachelorkrav': 'Nasjonalt minstekrav: bachelorgrad (180 sp) og minst to års relevant yrkespraksis (forskrift om krav til mastergrad § 5); programmets egne krav ikke kontrollert',
                                  'kilde': 'https://lovdata.no/dokument/SF/forskrift/2005-12-01-1392', 'hentet': None, 'generisk': True}
        ut.append(rec)
    for e in MAN['ekstra']:
        soKode = e.get('soKode')
        ut.append({**{k: v for k, v in e.items() if k not in ('instKode', 'soKode', 'kilde', 'kategori')}, 'instKode': e['instKode'], 'kategori': e['kategori'], 'kategoriNavn': KAT[e['kategori']],
                   'kjerne': True, 'privat': e['instKode'] in PRIVAT, 'dbh': None, 'opptak': None, 'registrerte': None, 'kandidater': None, 'gjennomforing': None,
                   'opptakskrav': {'snittkrav': 'Samordna opptak (poenggrense)', 'bachelorkrav': None, 'kilde': e['kilde']} if soKode else None,
                   'url': e['kilde'], 'akkreditering': akk.get(e['instKode']), 'iHHProgramkart': False,
                   'so': {'kode': soKode, 'poenggrenser': sop.get(soKode), 'tall': sot.get(soKode)} if soKode else None,
                   'flagg': ['ikke i DBH som masterprogram'], 'iSum': e.get('iMasterSum', True)})
    meta = {
        'hentet': '2026-10-17', 'antall': len(ut),
        'kilder': {
            'DBH 347': 'https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData (tabell 347, Nivåkode M2/M5/ME/MX, 2021–2026) → kilder/dbh347_master_<år>_hentet_2026-10-17.json.gz',
            'DBH 379': 'tabell 379 gruppert på Institusjonskode, Årstall, Studieprogramkode, Opptakstype (L/N), Kvalifisert / Prioritet=1 → kilder/dbh379_*.json.gz. 2026 = bare våropptak (høst ikke rapportert per 17.10.2026)',
            'DBH 123/104/707': 'gjenbrukt cache data/*/kilder/dbh-cache/ (hentet 23.09.2026); VID (8208) og INN 707 (1177) hentet 17.10.2026 til kilder/',
            'DBH 124': 'registrerte per campus høsten 2025 → kilder/dbh124_campus_hentet_2026-10-17.json.gz',
            'Samordna': 'data/hh/kilder/so_sokertall_programnivaa_2021-2026_hentet_2026-09-22.json og so_poenggrenser_2020-2026_hentet_2026-09-22.csv (5-årige)',
            'Programsider': 'kilder/programsider/ (_urls.tsv har URL og dato)',
            'Akkreditering': 'data/rangering/skoler.json (AACSB-søk 3.10.2026, EQUIS-liste, AMBA); institusjonsnivå',
            'HH-programkart': 'data/hh/programkart.json + dbh-programkart.json'},
        'felt': {'opptak': 'sokere = søknadsalternativer (alle prioriteter), forstevalg = prioritet 1, kvalifiserte, tilbud, jaSvar = akseptert tilbud, mott = møtt til studiestart',
                 'registrerte': 'DBH 123, høstsemesteret, alle studentkategorier', 'kandidater': 'DBH 104, vår+høst',
                 'gjennomforing': 'DBH 707 per startkull: fullført på normert tid, +1 år, +2 år; andeler i prosent av startkull',
                 'sivilokonom': 'true/false fra programside eller navn/NUS (741125, 741133); null = ikke avklart',
                 'kjerne': 'false for perifere kategorier (utdannings-/helseledelse, industriell økonomi, logistikk, reiseliv)'},
        'kategorier': KAT}
    json.dump({'meta': meta, 'programmer': ut}, open(os.path.join(HER, 'programmer.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(len(ut), 'program skrevet')


if __name__ == '__main__':
    main()
