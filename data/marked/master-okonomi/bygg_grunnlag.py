#!/usr/bin/env python3
"""A2 – masterlandskapet i økonomi. Steg 1: kodeliste og programgrupper fra DBH 347, tall fra DBH 379/123/104/707/124.

Leser bare cache (kilder/ her, og data/*/kilder/dbh-cache/ for 123/104/707). Skriver grunnlag.json i denne mappa.
Kjør: python3 -I data/marked/master-okonomi/bygg_grunnlag.py
"""
import collections, glob, gzip, json, os, re

HER = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HER)))
K = os.path.join(HER, 'kilder')
NUS = {c['code']: c['name'] for c in json.load(open(os.path.join(ROOT, 'data/nmbu/kilder/nus2000_ssb_klass36_hentet_2026-09-23.json')))['codes']}
YEARS = ['2021', '2022', '2023', '2024', '2025']

INSTKORT = {'0232': 'HiMolde', '0236': 'HVO', '0238': 'HVL', '0256': 'HiØ', '0264': 'INN', '1177': 'INN', '1110': 'UiO', '1120': 'UiB',
            '1130': 'UiT', '1150': 'NTNU', '1160': 'UiS', '1171': 'UiA', '1173': 'NMBU', '1174': 'Nord', '1175': 'OsloMet',
            '1176': 'USN', '1240': 'NHH', '8208': 'VID', '8241': 'BI', '8253': 'Kristiania'}
PRIVAT = {'8241', '8253', '8208'}
INSTFAM = {'0264': '1177'}  # INN: 0264 til og med 2024, 1177 fra 2025

# --- Utvalg ---------------------------------------------------------------------------------------------
# Med: NUS 734 (samfunnsøkonomi), 741/742/744/749 (økonomisk-administrative fag), MPA-kodene i 731 og
# forretningsjus 737909, pluss navngitte koder utenfor disse NUS-gruppene (KAT_EKSTRA).
NUS_MED = ('734', '741', '742', '744', '749')
NUS_EKSTRA = {'731108', '731116', '731124', '737909', '739921', '641158'}
KAT_EKSTRA = {
    ('1150', 'MENTRE'): 'innovasjon', ('1150', 'MIENTRE'): 'innovasjon', ('1110', 'MNM2-ENT'): 'innovasjon',
    ('0238', 'MA-INN'): 'innovasjon', ('0238', 'MA-INND'): 'innovasjon', ('1171', 'M-SHIFTTEK'): 'innovasjon', ('8253', 'MDI'): 'innovasjon',
    ('1130', 'M-MATFIN'): 'finans', ('1120', 'MAMN-AKTUA'): 'finans',
    ('1120', 'MASV-ITØK'): 'okit', ('1110', 'MNM2-INL'): 'okit', ('1110', 'MNME-ITLED'): 'okit', ('1176', 'MASMIS'): 'okit', ('1176', 'MASDIG'): 'okit',
    ('1173', 'M-EUTV'): 'eiendom', ('1173', 'M-EUTV-DEL'): 'eiendom', ('1150', 'MEIENDOM'): 'eiendom', ('1150', 'MAEIENDOM'): 'eiendom',
    ('0238', 'EIE-MA'): 'eiendom', ('1173', 'M-EIE'): 'eiendom',
    ('1150', 'MTIØT'): 'induok', ('1171', 'MASTINDØK5'): 'induok', ('1173', 'M-IØ'): 'induok', ('1160', 'M-INDØKG5'): 'induok',
    ('1171', 'MASTINDØK'): 'induok', ('1160', 'M-INDØKG'): 'induok', ('1176', 'MASINDØK'): 'induok', ('1160', 'SI-INDØKG'): 'induok',
    ('1110', 'MFM2-EMHEM'): 'helseok', ('1110', 'MFM2-HEPAM'): 'helseok', ('1120', 'MATF-HEVID'): 'helseok',
    ('1130', 'EM-SEAFOOD'): 'mba', ('1150', 'MTS'): 'ledelse', ('1150', 'MTDO'): 'ledelse',
    ('0232', '80'): 'logistikk', ('0232', '92'): 'logistikk', ('0232', '86'): 'logistikk',
    ('0256', 'OLM'): 'ledelse', ('0238', 'MADL'): 'ledelse', ('1130', 'M-ORGLED'): 'ledelse',
    ('1120', 'MASV-PUBAD'): 'mpa', ('1240', 'MASV-OFFOR'): 'mpa',
}
for c in ['3210', '3200', '3100', 'UDX', 'UMI', 'UMX', 'MFX', 'MFT', 'MDM', 'MDX', '3110', 'MBD', 'MBX', 'UBD', 'UBX', 'UDB']:
    KAT_EKSTRA[('8253', c)] = 'okit'
UTE = {('1173', 'M-AR'), ('1173', 'M-ARE'), ('1150', 'MPRSPED')}  # arealplanlegging; spesialpedagogikk med feil NUS (741122)
KAT_RETT = {('1174', 'MAHRM'): 'ledelse', ('1174', 'MAHRM90D'): 'ledelse', ('1174', 'MAENM'): 'ledelse', ('1171', 'M-SHIFTINN'): 'innovasjon',
            ('1171', 'M-SHIFTOKO'): 'innovasjon', ('1150', 'MSCE'): 'biookonomi', ('1171', 'M-INTBUS'): 'marked', ('1150', '860MIB'): 'marked',
            ('8253', 'MSR'): 'ledelse', ('8253', 'MSR-B'): 'ledelse', ('1173', 'M-GEP'): 'samfok', ('8241', 'MSCMSAEH'): 'samfok',
            ('8241', 'MSCMSLOH'): 'ledelse', ('8241', 'MSCMSMAH'): 'marked', ('8241', 'MSCMSMLH'): 'marked', ('8241', 'MSCMSCMH'): 'marked',
            ('0232', '87'): 'reiseliv', ('1160', 'M-SERLIB'): 'ledelse', ('1176', 'MSM'): 'ledelse', ('1171', 'M-SUSTMGT'): 'ledelse',
            ('8253', 'MMK'): 'marked', ('1240', 'MASTERMERK'): 'ledelse', ('1240', 'FINANCE21'): 'finans_erf',
            ('1240', 'FINANCE'): 'finans_erf', ('1240', 'FINTECH'): 'finans_erf', ('1173', 'M-ØR'): 'energi_ressurs', ('1173', 'M-LEDØK'): 'ledelse',
            ('1174', 'MAHL'): 'ledelse', ('1174', 'MBAL'): 'mba', ('1174', 'MBAØØ'): 'mba', ('8241', 'HRS'): 'mrr'}
for c in ['M2ULED', 'EM-UTDL', 'M-UTDL', 'UVME-UTLED', 'MSKOL', 'MASTLEDUTD']:
    for i in ('0264', '1177', '1130', '1110', '1150', '1240'):
        KAT_RETT[(i, c)] = 'utdledelse'


def kategori(nusk, navn, niva):
    n = navn.lower()
    if nusk.startswith('734'):
        if re.search(r'bioøkonom|bioecon', n): return 'biookonomi'
        if re.search(r'energi|energy|ressurs|resource|miljø|environment', n): return 'energi_ressurs'
        return 'samfok'
    if nusk in ('731108', '731116', '731124', '731199'): return 'mpa'
    if nusk in ('741108', '741109', '741135', '641158') or re.search(r'\bmba\b', n): return 'mba'
    if nusk == '737909': return 'forretningsjus'
    if nusk in ('741130', '741118') or re.search(r'regnskap|revisj|accounting|audit', n): return 'mrr'
    if re.search(r'financ|finans', n): return 'finans'
    if re.search(r'entrepren|innovasj|innovation', n) or nusk in ('741136', '741151', '739921'): return 'innovasjon'
    if re.search(r'analytics|data science|informasjonssystem|information system|digital', n): return 'okit'
    if re.search(r'energi|energy', n): return 'energi_ressurs'
    if re.search(r'eiendom|real estate', n): return 'eiendom'
    if nusk in ('741125', '741133', '741121', '741131', '741112', '741123'): return 'oa'
    if nusk.startswith('7422') or re.search(r'marked|marketing|merkevare|brand', n): return 'marked'
    if nusk.startswith('744'): return 'reiseliv'
    return 'ledelse'


# --- Gruppering til program ----------------------------------------------------------------------------
GRUPPE = {}
for c in ['MASTER04', 'MASTER15', 'MASTER21', 'MASTER22', 'MASTER24', 'MASTER25', 'MASTER25-G', 'M25', 'MASTER-PUB']:
    GRUPPE[('1240', c)] = 'nhh_moa'
for c in ['MSC23', 'MSC24', 'MSC25']: GRUPPE[('1240', c)] = 'nhh_msc'
for c in ['ACC', 'BAN', 'BUS', 'ECN', 'ECO', 'ENE', 'FIE', 'IB', 'MBM', 'NBD', 'STR']:
    GRUPPE[('1240', c)] = 'nhh_majorkoder'; KAT_RETT[('1240', c)] = 'oa'
for c in ['MRR', 'MRR08', 'MRR08-PUB']: GRUPPE[('1240', c)] = 'nhh_mrr'
for c in ['MBA', 'MBA21']: GRUPPE[('1240', c)] = 'nhh_emba'
for c in ['MASTRA', 'MASTRA22']: GRUPPE[('1240', c)] = 'nhh_emba_strategi'
for c in ['MØST', 'MØST21']: GRUPPE[('1240', c)] = 'nhh_emba_okstyring'
for c in ['FINANCE', 'FINANCE21', 'FINTECH']: GRUPPE[('1240', c)] = 'nhh_exec_finans'
for c in ['SEAFOOD', 'SEAFOOD23']: GRUPPE[('1240', c)] = 'nhh_emba_seafood'
for c in ['BRAND', 'MASTERMERK']: GRUPPE[('1240', c)] = 'nhh_exec_merkevare'
for c in ['MØLDBH', 'MØLDBD', 'MØLØH', 'MØLØD', 'MØLMH', 'MØLMD']: GRUPPE[('1177', c)] = 'inn_moa'
for c in ['MØLBAH', 'MØLBAD']: GRUPPE[('1177', c)] = 'inn_moa_ba'
for c in ['MAMPA', 'MOLSD120', 'MAPAD']: GRUPPE[('1177', c)] = 'inn_mpa_dybde'
for c in ['MAMPAB', 'MAPAB', 'MOLSD90']: GRUPPE[('1177', c)] = 'inn_mpa_erf'
for c in ['M-ØKADM', 'M-ØKADM-A', 'M-ØKADM-D', 'M-ØKADMD']: GRUPPE[('1130', c)] = 'uit_moa'
for c in ['M-REGRE', 'M-REV']: GRUPPE[('1130', c)] = 'uit_mrr'
for c in ['SIVØKLEDR', 'SIVØKLEDK', 'MASTSIVØK', 'MASTSIVØKK']: GRUPPE[('1176', c)] = 'usn_siv5'
for c in ['MAIL', 'MAIL-D', 'MAIL-E']: GRUPPE[('1176', c)] = 'usn_mail'
for c in ['MAITM', 'MAITMD']: GRUPPE[('1176', c)] = 'usn_maitm'
for c in ['EMM', 'EMM2']: GRUPPE[('1176', c)] = 'usn_emm'
for c in ['MASMIS', 'MASDIG']: GRUPPE[('1176', c)] = 'usn_digled'
for c in ['M-MANBUS', 'M-MANBUS-D', 'M-MGTBD']: GRUPPE[('1171', c)] = 'uia_manbus'
for c in ['MA-INN', 'MA-INND']: GRUPPE[('0238', c)] = 'hvl_mainn'
for c in ['M-EUTV', 'M-EUTV-DEL']: GRUPPE[('1173', c)] = 'nmbu_eutv'
for c in ['MEIENDOM']: GRUPPE[('1150', c)] = 'ntnu_eiendom_erf'
for c in ['MAEIENDOM']: GRUPPE[('1150', c)] = 'ntnu_eiendom'
for c in ['MAVERDI90D', 'MAVERDI90H']: GRUPPE[('8208', c)] = 'vid_verdi_erf'
for c in ['MAVERDIDEL', 'MAVERDIHEL']: GRUPPE[('8208', c)] = 'vid_verdi'
for c in ['MBA', 'MBACH']: GRUPPE[('8241', c)] = 'bi_emba'
for c in ['MBAE', 'MBATO', 'MBATR']: GRUPPE[('1174', c)] = 'nord_mba'
for c in ['MAHRM', 'MAHRM90D']: GRUPPE[('1174', c)] = 'nord_hrm'
# Kristiania: -B = Bergen; X-kodene er deltid/annen studieform av samme program
for c in ['MLS', 'MLS-B']: GRUPPE[('8253', c)] = 'kristiania_ledelse'
for c in ['MLO', 'MLO-B']: GRUPPE[('8253', c)] = 'kristiania_orgpsyk'
for c in ['MSR', 'MSR-B']: GRUPPE[('8253', c)] = 'kristiania_hr'
for c in ['MME', 'MME-B', 'MML']: GRUPPE[('8253', c)] = 'kristiania_markedsforing'
for c in ['MEX', 'MEY']: GRUPPE[('8253', c)] = 'kristiania_erf_ledelse'
for c in ['MKN', 'MKX']: GRUPPE[('8253', c)] = 'kristiania_erf_kreativ'
for c in ['MLE', 'MLE-R', 'MMA', 'MOD', 'MOP']: GRUPPE[('8253', c)] = 'kristiania_praktisk_lederskap'
for c in ['MBD', 'MBX', 'UBD', 'UBX']: GRUPPE[('8253', c)] = 'kristiania_is_ba'
for c in ['3110', '3210', 'UDB', 'UDX']: GRUPPE[('8253', c)] = 'kristiania_is_dbs'
for c in ['3100', '3200', 'UMI', 'UMX']: GRUPPE[('8253', c)] = 'kristiania_is_mi'
for c in ['MDM', 'MDX']: GRUPPE[('8253', c)] = 'kristiania_is_dm'
for c in ['MFT', 'MFX']: GRUPPE[('8253', c)] = 'kristiania_is_fintech'
for c in ['M-INDØKG', 'SI-INDØKG']: GRUPPE[('1160', c)] = 'uis_induok'


def slug(s):
    s = s.lower()
    for a, b in (('æ', 'ae'), ('ø', 'o'), ('å', 'a'), ('é', 'e')):
        s = s.replace(a, b)
    return re.sub(r'[^a-z0-9]+', '_', s).strip('_')[:40]


def last(name):
    p = os.path.join(K, name)
    return json.load(gzip.open(p, 'rt')) if p.endswith('.gz') else json.load(open(p))


def cache(tab, inst):
    for p in sorted(glob.glob(os.path.join(ROOT, 'data/*/kilder/dbh-cache', f'{tab}_{inst}.json*'))) + \
             sorted(glob.glob(os.path.join(K, f'{tab}_{inst}.json*'))):
        d = json.load(gzip.open(p, 'rt')) if p.endswith('.gz') else json.load(open(p))
        return [r for r in d if 'status' not in r], os.path.relpath(p, ROOT)
    return None, None


def main():
    rows347 = []
    for y in range(2021, 2027):
        rows347 += last(f'dbh347_master_{y}_hentet_2026-10-17.json.gz')
    by = collections.defaultdict(list)
    for r in rows347:
        by[(r['Institusjonskode'], r['Studieprogramkode'])].append(r)
    koder = []
    for (inst, kode), rs in by.items():
        rs.sort(key=lambda r: (r['Årstall'], r['Semester']))
        s = rs[-1]
        nusk = s['NUS-kode']
        if (inst, kode) in UTE:
            continue
        if not (nusk[:3] in NUS_MED or nusk in NUS_EKSTRA or (inst, kode) in KAT_EKSTRA):
            continue
        kat = KAT_RETT.get((inst, kode)) or KAT_EKSTRA.get((inst, kode)) or kategori(nusk, s['Studieprogramnavn'], s['Nivåkode'])
        fam = INSTFAM.get(inst, inst)
        g = GRUPPE.get((fam, kode)) or GRUPPE.get((inst, kode)) or f"{slug(INSTKORT[fam])}_{slug(kode)}"
        koder.append({'gruppe': g, 'inst': inst, 'instFam': fam, 'kode': kode, 'navn': s['Studieprogramnavn'], 'niva': s['Nivåkode'],
                      'nus': nusk, 'nusNavn': NUS.get(nusk), 'kat': kat, 'aar347': sorted({r['Årstall'] for r in rs}),
                      'navnHist': sorted({r['Studieprogramnavn'] for r in rs}), 'avd': s['Avdelingsnavn'], 'avdKode': s['Avdelingskode'],
                      'heltid': float(s['Andel av heltid']), 'sp': float(s['Studiepoeng']), 'egenfin': float(s['Prosent egenfinansiering']),
                      'org': s['Organisering'], 'sprak': s['Underv.språk'], 'tilbysFra': s['Tilbys fra'], 'tilbysTil': s['Tilbys til'],
                      'instNavn': s['Institusjonsnavn'], 'finKat': s['Finansierings-kategori']})
    # --- tall ---
    A = last('dbh379_A_alle_inst_2021-2026_hentet_2026-10-17.json.gz')
    B = last('dbh379_B_prioritet_alle_inst_2021-2026_hentet_2026-10-17.json.gz')
    c124 = last('dbh124_campus_hentet_2026-10-17.json.gz') if os.path.exists(os.path.join(K, 'dbh124_campus_hentet_2026-10-17.json.gz')) else []
    kset = {(k['inst'], k['kode']) for k in koder}
    opp = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.Counter()))  # (inst,kode),opptakstype -> år
    for r in A:
        key = (r['Institusjonskode'], r['Studieprogramkode'])
        if key not in kset: continue
        y = r['Årstall'] + ('v' if r['Årstall'] == '2026' else '')
        c = opp[(key, r['Opptakstype'])][y]
        n = int(r['Søknadsalternativer'] or 0)
        c['sokere'] += n
        if r['Kvalifisert'] == '1': c['kvalifiserte'] += n
        c['tilbud'] += int(r['Tilbud om opptak'] or 0); c['jaSvar'] += int(r['Akseptert tilbud'] or 0); c['mott'] += int(r['Møtt til studiestart'] or 0)
    for r in B:
        key = (r['Institusjonskode'], r['Studieprogramkode'])
        if key in kset and r['Prioritet'] == '1':
            y = r['Årstall'] + ('v' if r['Årstall'] == '2026' else '')
            opp[(key, r['Opptakstype'])][y]['forstevalg'] += int(r['Søknadsalternativer'] or 0)
    reg = collections.defaultdict(collections.Counter); kand = collections.defaultdict(collections.Counter)
    kull = collections.defaultdict(dict); kilder_brukt = set()
    for inst in sorted({k['inst'] for k in koder}):
        mine = {k['kode'] for k in koder if k['inst'] == inst}
        d, src = cache('123', inst)
        if d:
            kilder_brukt.add(src)
            for r in d:
                if r['Studieprogramkode'] in mine and r.get('Semester') == '3' and r['Årstall'] in YEARS:
                    reg[(inst, r['Studieprogramkode'])][r['Årstall']] += int(r['Antall totalt'] or 0)
        d, src = cache('104', inst)
        if d:
            kilder_brukt.add(src)
            for r in d:
                if r['Studieprogramkode'] in mine and r['Årstall'] in YEARS:
                    kand[(inst, r['Studieprogramkode'])][r['Årstall']] += int(r['Antall totalt'] or 0)
        d, src = cache('707t', inst)
        if d:
            kilder_brukt.add(src)
            for r in d:
                if r['Studieprogramkode'] in mine:
                    kk = kull[(inst, r['Studieprogramkode'])].setdefault(r['Årstall'], collections.Counter())
                    for f_ in ('Startkull', 'Fullført normert', 'Fullført normert1', 'Fullført normert2', 'Studerer', 'Studerer2', 'Frafalt', 'Frafalt2'):
                        kk[f_] += int(r.get(f_) or 0)
                    kk['_niva'] = r.get('Nivåkode')
    campus = collections.defaultdict(collections.Counter)
    for r in c124:
        key = (r['Institusjonskode'], r['Studieprogramkode'])
        if key in kset:
            campus[key][r.get('Stednavn campus') or r.get('Stedkode campus') or '?'] += int(float(r.get('Antall') or 0))
    for k in koder:
        key = (k['inst'], k['kode'])
        k['opptakL'] = {y: dict(v) for y, v in sorted(opp[(key, 'L')].items())}
        k['opptakN'] = {y: dict(v) for y, v in sorted(opp[(key, 'N')].items())}
        k['registrerte'] = dict(sorted(reg[key].items()))
        k['kandidater'] = dict(sorted(kand[key].items()))
        k['kull707'] = {y: {kk: v for kk, v in c.items()} for y, c in sorted(kull[key].items())}
        k['campus124'] = dict(campus[key])
    json.dump({'koder': koder, 'cacheBrukt': sorted(kilder_brukt)}, open(os.path.join(HER, 'grunnlag.json'), 'w'), ensure_ascii=False, indent=1)
    g = collections.defaultdict(list)
    for k in koder: g[k['gruppe']].append(k)
    print(len(koder), 'koder,', len(g), 'grupper')


if __name__ == '__main__':
    main()
