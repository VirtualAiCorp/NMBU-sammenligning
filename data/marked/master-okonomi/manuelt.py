#!/usr/bin/env python3
"""Håndførte felt per program (A2). Skriver manuelt.json. Kilder: programsidene i kilder/programsider/ (se _urls.tsv),
lest 17.10.2026. Alt som ikke står her, er ikke kontrollert mot programsiden."""
import json, os
H = '2026-10-17'
U = {}  # id -> url fra _urls.tsv
for l in open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kilder/programsider/_urls.tsv'), encoding='utf-8'):
    p = l.rstrip('\n').split('\t')
    if len(p) >= 2: U[p[0]] = p[1]

def k(snitt, bachelor, side, **kw):
    d = {'snittkrav': snitt, 'bachelorkrav': bachelor, 'kilde': U.get(side, side), 'hentet': H}
    d.update(kw); return d

UHR = 'Bachelor i økonomi og administrasjon eller tilsvarende som dekker UHR-ØAs minimumskrav (120 sp økonomisk-administrative fag)'
BI_KRAV = k('B (GPA 3,50 på ECTS-skala)', 'Bachelor i økonomi og administrasjon, finans eller økonomi, eller bachelor med minst 80 sp i relevant fagområde; i tillegg programspesifikke krav', 'bi_opptakskrav_msc',
            merknad='BIs generelle krav for masterstudier; programspesifikke krav står på engelske sider og er ikke lest.')
KR_C = 'C (karaktersnitt minst 2,5)'
M = {
 # --- NMBU ---
 'nmbu_m_oa': {'sivilokonom': True, 'opptakskrav': k('Ikke oppgitt på programsiden', UHR, 'nmbu_m_oa', poenggrense='3,20 (2025)', studieplasser=85)},
 'nmbu_m_econ': {'sivilokonom': False, 'opptakskrav': k('C', 'Bachelor i samfunnsøkonomi eller tilsvarende (matematikk, statistikk, mikro og makro)', 'nmbu_m_econ', poenggrense='C/3,00 (2025)', studieplasser=25), 'sprak': 'engelsk'},
 'nmbu_m_ei': {'sivilokonom': False, 'opptakskrav': k('C', 'Alle bachelorgrader (breddemaster); motivasjonsbrev', 'nmbu_m_ei', poenggrense='3,0 (2025)', studieplasser=35)},
 'nmbu_m_bioec': {'sivilokonom': False, 'opptakskrav': k('Ikke oppgitt på programsiden', 'Bachelor innen natur- eller samfunnsvitenskap med relevant spesialisering', 'nmbu_m_bioec', poenggrense='3,0 (2025)', studieplasser=35)},
 'nmbu_m_eeg': {'sivilokonom': False, 'opptakskrav': k('C', 'Bachelor i økonomi, statsvitenskap, geografi, utviklingsstudier e.l. med minst to emner i økonomi, matematikk eller statistikk', 'nmbu_m_eeg', poenggrense='C/3,00 (2025)', studieplasser=35), 'sprak': 'engelsk'},
 'nmbu_m_gep': {'sivilokonom': False, 'opptakskrav': k('C', 'Som M-EEG', 'nmbu_m_gep', poenggrense='C/3,00 (2025)', studieplasser=25), 'sprak': 'engelsk'},
 'nmbu_eutv': {'sivilokonom': False, 'opptakskrav': k('C (2,5)', 'Bachelor i økonomi, jus, eiendomsfag, planfag eller byggteknikk, og mikro- og makroøkonomi', 'nmbu_eutv', poenggrense='3,5 (2024, inkl. tilleggspoeng)', studieplasser=30), 'merknad': 'Deltidsvarianten tas ikke opp fra 2025.'},
 # --- NHH ---
 'nhh_moa': {'sivilokonom': True, 'opptakskrav': k('Ingen fast grense oppgitt; søkerne rangeres etter karaktersnitt', UHR, 'nhh_opptak_moa', merknad='NHHs egne bachelorkandidater er garantert plass (utdanning.no).')},
 'nhh_msc': {'sivilokonom': None, 'opptakskrav': k('Om lag B (GPA)', 'Internasjonalt opptak, egne krav per major', 'utd_nhh_no_masters_economics'), 'sprak': 'engelsk'},
 'nhh_mrr': {'sivilokonom': None, 'opptakskrav': k('Ikke oppgitt på opptakssiden', 'BØA eller fireårig siviløkonom, eller BRR med bestått revisoreksamen (C i hver), eller fagkrav', 'nhh_mrr_opptak')},
 # --- BI ---
 'bi_mscmsbuh': {'sivilokonom': True, 'opptakskrav': BI_KRAV, 'skolepenger': {'perAar': 128200, 'internPerAar': 110700, 'kilde': 'https://www.bi.no/studier-og-kurs/masterstudier/business/', 'hentet': '2026-09-24', 'merknad': 'Fra data/hh/kilder/studieavgift.json (bi_moa).'},
                 'merknad': 'BI: «Du kan også kvalifisere for den norske profesjonstittelen siviløkonom» (programsiden).'},
 'bi_mscmsfeh': {'opptakskrav': BI_KRAV, 'skolepenger': {'perAar': 128200, 'internPerAar': 110700, 'kilde': U['bi_mscmsfeh'], 'hentet': H}},
 'bi_mscmsqfh': {'opptakskrav': BI_KRAV, 'skolepenger': {'perAar': 128200, 'internPerAar': 110700, 'kilde': U['bi_mscmsqfh'], 'hentet': H}},
 'bi_mscmssfh': {'opptakskrav': BI_KRAV, 'skolepenger': {'perAar': 128200, 'internPerAar': 110700, 'kilde': U['bi_mscmssfh'], 'hentet': H}},
 'bi_mscmsanh': {'opptakskrav': BI_KRAV, 'skolepenger': {'perAar': 135600, 'internPerAar': 117100, 'kilde': U['bi_mscmsanh'], 'hentet': H}},
 'bi_mscmsdsh': {'opptakskrav': BI_KRAV, 'skolepenger': {'perAar': 135600, 'internPerAar': 117100, 'kilde': U['bi_mscmsdsh'], 'hentet': H}},
 'bi_mscmseih': {'opptakskrav': BI_KRAV, 'skolepenger': {'perAar': 128200, 'internPerAar': 110700, 'kilde': U['bi_mscmseih'], 'hentet': H}},
 'bi_mscmsloh': {'opptakskrav': BI_KRAV, 'skolepenger': {'perAar': 128200, 'internPerAar': 110700, 'kilde': U['bi_mscmsloh'], 'hentet': H}},
 'bi_mscmsmah': {'opptakskrav': BI_KRAV, 'skolepenger': {'perAar': 128200, 'internPerAar': 110700, 'kilde': U['bi_mscmsmah'], 'hentet': H}},
 'bi_mscmsrrh': {'opptakskrav': dict(BI_KRAV, merknad='BIs generelle masterkrav antatt; ikke bekreftet på programsiden for regnskap og revisjon.'), 'merknad': 'Revisorgodkjenning krever C eller bedre i alle fag (programsiden).'},
 'bi_mscmsaeh': {'merknad': 'Tar ikke opp nye studenter; etterfølgeren er MSc in Business, major in Economics (data/hh/kilder/studieavgift.json).'},
 'bi_msc': {'merknad': 'Samlekode «Master of Science» uten søkere i DBH 379; trolig utveksling/overgangsstudenter. Holdt utenfor summene.', 'iSum': False},
 # --- NTNU ---
 'ntnu_oamsc': {'sivilokonom': True, 'opptakskrav': k('C', 'BØA-planen av november 2018 (120 sp økadm, 102,5 sp i faggruppene)', 'ntnu_oamsc_opptak')},
 'ntnu_msivok5': {'sivilokonom': True, 'opptakskrav': k('Samordna opptak (poenggrense)', 'Generell studiekompetanse + R1 eller S1+S2 (MATRS)', 'ntnu_msivok5_opptak', studieplasser=105)},
 'ntnu_msok': {'sivilokonom': False, 'opptakskrav': k('C (B-garanti)', 'Bachelor med minst 90 sp samfunnsøkonomi inkl. metode', 'ntnu_msok_opptak', studieplasser=25, merknad='Siden sier at informasjonen gjelder 2023/2024.')},
 'ntnu_mfinok': {'sivilokonom': False, 'opptakskrav': k('C', 'Bachelor med godkjent fordypning (BØA etter NRØA-plan forhåndsgodkjent)', 'ntnu_mfinok_opptak', studieplasser=25)},
 'ntnu_mrr': {'sivilokonom': None, 'opptakskrav': k('C', 'BØA, BRR eller tilsvarende (120 sp økadm etter UHR-planen)', 'ntnu_mrr_opptak')},
 'ntnu_mientre': {'opptakskrav': k('Helhetsvurdering (karakterer, erfaring, motivasjon); intervju', 'Ingeniørbachelor (MIENTRE)', 'ntnu_mientre_opptak', studieplasser=35, merknad='Om lag 35 studenter i året for begge retningene samlet.')},
 'ntnu_mentre': {'opptakskrav': k('Helhetsvurdering (karakterer, erfaring, motivasjon); intervju', 'Realfaglig, humanistisk eller samfunnsvitenskapelig bachelor (MENTRE)', 'ntnu_mientre_opptak')},
 'ntnu_msmi': {'opptakskrav': k('C', 'Bachelor i ØA, markedsføring, innovasjon, entreprenørskap, ledelse e.l.', 'utd_ntnu_no_management_innovation_and_sustainable_business_development___masters_programme'), 'sprak': 'engelsk'},
 'ntnu_miids': {'opptakskrav': k('C', 'Bachelor i relevante fag (organisasjon/innovasjon, ØA, logistikk, cybersikkerhet m.m.)', 'ntnu_miids_opptak')},
 'ntnu_mentresam': {'opptakskrav': k('C', 'Bachelor med minst 80 sp samfunnsvitenskap, økadm eller annet relevant', 'ntnu_mentresam_opptak')},
 'ntnu_oamlt': {'opptakskrav': k('C', 'Ingeniørbachelor med matematikk og statistikk', 'ntnu_oamlt')},
 'ntnu_eiendom': {'opptakskrav': k('Ikke oppgitt', 'Tre år høyere utdanning med minst 80 sp relevante fag', 'ntnu_maeiendom_opptak')},
 'ntnu_860mib': {'sivilokonom': True, 'merknad': 'Programmet omtales som «MSc in International Business and Marketing (“Siviløkonom”)» på utdanning.no.', 'sprak': 'engelsk'},
 # --- OsloMet ---
 'oslomet_masoa': {'sivilokonom': True, 'opptakskrav': k('C', 'BØA, BRR eller tilsvarende som oppfyller UHR-ØA-planen 2018', 'oslomet_masoa_plan', studieplasser=110, merknad='Utdanning.no oppgir 110 plasser for «Økonomi og administrasjon – master» og 34 for «…– siviløkonom – master»; begge ser ut til å ligge under DBH-koden MASØA. Studieretningen regnskap og revisjon har eget opptak.')},
 # --- UiA ---
 'uia_mastokad': {'sivilokonom': True, 'opptakskrav': k('C (vektet)', UHR + ' (2018)', 'utd_uia_no_okonomi_og_administrasjon___sivilokonom_masterprogram')},
 'uia_mastrev': {'sivilokonom': True, 'opptakskrav': k('Ikke oppgitt (C i alle emner kreves for revisorgodkjenning)', UHR, 'utd_uia_no_regnskap_og_revisjon___sivilokonom_masterprogram')},
 'uia_mastokad5': {'sivilokonom': True, 'opptakskrav': k('Samordna opptak (poenggrense)', 'Generell studiekompetanse + R1 eller S1+S2', 'utd_uia_no_okonomi_og_administrasjon___sivilokonom_5_arig_masterprogra', studieplasser=100)},
 'uia_m_shiftoko': {'sivilokonom': None, 'merknad': 'NUS-kode 741125 (siviløkonom) i DBH 347, men ingen registrerte studenter eller søkere på koden; trolig erstattet.'},
 # --- UiS ---
 'uis_m_okad': {'sivilokonom': True, 'opptakskrav': k('C', 'BØA eller BRR, eller 120 sp økadm etter UHR-planen', 'utd_uis_no_okonomi_og_administrasjon___master')},
 'uis_m_regrev': {'sivilokonom': None, 'opptakskrav': k('3,0 (C)', 'Se utfyllende regler', 'utd_uis_no_regnskap_og_revisjon___master')},
 # --- Nord ---
 'nord_mabed': {'sivilokonom': True, 'opptakskrav': k('C', '120 sp økadm etter UHR-planen', 'utd_nord_no_sivilokonom_master_i_okonomi_og_administrasjon')},
 'nord_msb5': {'sivilokonom': True, 'opptakskrav': k('Samordna opptak (poenggrense)', 'Generell studiekompetanse + MATRS', 'utd_nord_no_sivilokonom_master_i_okonomi_og_administrasjon_0', studieplasser=15)},
 'nord_maenm': {'opptakskrav': k('C', 'Bachelor i økadm eller samfunnsfag med minst 20 sp organisasjon/ledelse og 5 sp metode', 'utd_nord_no_master_i_baerekraftig_ledelse_og_arktiske_perspektiver')},
 'nord_maent': {'opptakskrav': k('Ikke oppgitt; rangering etter karakterer', 'Bachelor (180 sp) og ett av tre fordypningskrav', 'nord_maent_plan')},
 # --- INN ---
 'inn_moa': {'sivilokonom': True, 'opptakskrav': k('C', UHR, 'utd_inn_no_master_i_okonomi_og_ledelse___sivilokonom___hovedprofil_okonomistyring'), 'merknad': 'Hovedprofilene økonomistyring og markedsføringsledelse (Rena) er slått sammen; heltid og deltid.'},
 'inn_moa_ba': {'sivilokonom': True, 'opptakskrav': k('C', UHR, 'utd_inn_no_master_i_okonomi_og_ledelse___sivilokonom___hovedprofil_business_analytics_0')},
 # --- UiT ---
 'uit_moa': {'sivilokonom': True, 'opptakskrav': k('3,0 («sterk C»)', '120 sp økadm (90 sp obligatoriske + 30 sp videreføring)', 'utd_uit_no_okonomi_og_administrasjon_sivilokonom___master', studieplasser=40), 'merknad': 'Heltid i Tromsø; deltid nett og samlinger i Alta/Harstad.'},
 'uit_mrr': {'opptakskrav': k('3,0 («ren C»)', 'Fagkrav etter UHR-planen', 'utd_uit_no_regnskap_og_revisjon___master_0', studieplasser=40)},
 'uit_m_samfok': {'sivilokonom': False, 'opptakskrav': k('2,5 («svak C»)', 'Bachelor med samfunnsøkonomi', 'utd_uit_no_samfunnsokonomi_med_datavitenskap___master')},
 'uit_em_mba': {'opptakskrav': k('C (2,5)', 'Bachelor + yrkespraksis (erfaringsbasert)', 'utd_uit_no_strategisk_ledelse_og_okonomi___erfaringsbasert_master')},
 # --- HVL, USN, HiMolde ---
 'hvl_msb': {'sivilokonom': True, 'opptakskrav': k('C (hele bachelorgraden)', UHR, 'utd_hvl_no_okonomi_og_administrasjon_sivilokonom')},
 'usn_masivokled': {'sivilokonom': True, 'merknad': 'Fire spesialiseringer (bedriftsøkonomisk analyse, innovasjon og entreprenørskap, markedsføringsledelse, strategi og ledelse), Hønefoss. Snittkrav ikke funnet.'},
 'usn_siv5': {'sivilokonom': True, 'opptakskrav': k('Samordna opptak (poenggrense)', 'Generell studiekompetanse + MATRS', 'utd_usn_no_sivilokonom___5_arig', studieplasser=40)},
 'himolde_89': {'sivilokonom': None, 'merknad': 'Engelskspråklig (Master in Economics and Business Administration) ifølge utdanning.no. Snittkrav ikke funnet.', 'sprak': 'engelsk'},
 # --- UiO, UiB ---
 'uio_svm2_econ': {'sivilokonom': False, 'opptakskrav': k('C', 'Bachelor med minst 80 sp fordypning fastsatt av programmet', 'uio_econ_admission', studieplasser=77), 'sprak': 'engelsk'},
 'uio_mnm2_ent': {'opptakskrav': k('C (vektet)', 'Bachelor med minst 80 sp fordypning fastsatt av programmet', 'uio_ent_admission', studieplasser=25)},
 'uio_svm5_econ': {'sivilokonom': False, 'opptakskrav': k('Samordna opptak (poenggrense)', 'Generell studiekompetanse + R1 eller S1+S2', 'utd_uio_no_samfunnsokonomisk_analyse_master')},
 'uib_prof_sok': {'sivilokonom': False, 'opptakskrav': k('Samordna opptak (poenggrense)', 'Generell studiekompetanse + matematikkrav', 'utd_uib_no_samfunnsokonomi_profesjon', studieplasser=22)},
 # --- Kristiania ---
 'kristiania_min': {'opptakskrav': k('Ikke oppgitt', 'Bachelor (180 sp) med krav til fagområder', 'kristiania_min'), 'skolepenger': {'perSemester': 58900, 'perAar': 117800, 'kilde': U['kristiania_min'], 'hentet': H}},
 'kristiania_ledelse': {'opptakskrav': k(KR_C, 'Bachelor (180 sp) med krav til fagområder', 'kristiania_ledelse'), 'skolepenger': {'perSemester': 58900, 'perAar': 117800, 'kilde': U['kristiania_ledelse'], 'hentet': H}},
 'kristiania_hr': {'opptakskrav': k(KR_C, 'Bachelor (180 sp) med krav til fagområder', 'kristiania_hr'), 'skolepenger': {'perSemester': 58900, 'perAar': 117800, 'kilde': U['kristiania_hr'], 'hentet': H}},
 'kristiania_markedsforing': {'opptakskrav': k(KR_C, 'Bachelor (180 sp) med krav til fagområder og metodefag', 'kristiania_mf'), 'skolepenger': {'perSemester': 58900, 'perAar': 117800, 'kilde': U['kristiania_mf'], 'hentet': H}},
 'kristiania_orgpsyk': {'opptakskrav': k(KR_C, 'Bachelor (180 sp) med krav til fagområder', 'kristiania_orgpsyk'), 'skolepenger': {'perSemester': 58900, 'perAar': 117800, 'kilde': U['kristiania_orgpsyk'], 'hentet': H}},
 'vid_verdi': {'merknad': 'Privat, men statsfinansiert høyskole; skolepenger ikke kontrollert.'},
 'vid_verdi_erf': {'merknad': 'Privat, men statsfinansiert høyskole; skolepenger ikke kontrollert.'},
}
# Program som finnes på utdanning.no / programsidene, men ikke i DBH 347 ennå (nye 2026) eller registrert som bachelor i DBH.
EKSTRA = [
 {'id': 'kristiania_okled', 'institusjon': 'Høyskolen Kristiania', 'instKort': 'Kristiania', 'instKode': '8253', 'navn': 'Master i økonomi og ledelse', 'kategori': 'oa', 'type': '2-årig', 'campus': ['Oslo'],
  'sivilokonom': True, 'kilde': U['utd_kristiania_no_master_i_okonomi_og_ledelse'], 'merknad': 'Ny siviløkonomutdanning («kvalifiserer til tittelen siviløkonom», utdanning.no). Ingen DBH-kode i 347 per 17.10.2026.'},
 {'id': 'kristiania_msc_finman', 'institusjon': 'Høyskolen Kristiania', 'instKort': 'Kristiania', 'instKode': '8253', 'navn': 'Master of Science in Financial Management (nett)', 'kategori': 'finans', 'type': '2-årig', 'campus': ['Nett'],
  'kilde': U['utd_kristiania_no_master_science_financial_management'], 'merknad': 'Nettstudium, fleksibel oppstart og løpende opptak. Ingen DBH-kode funnet i 347.'},
 {'id': 'kristiania_mba_nett', 'institusjon': 'Høyskolen Kristiania', 'instKort': 'Kristiania', 'instKode': '8253', 'navn': 'Master of Business Administration (nett)', 'kategori': 'mba', 'type': 'erfaringsbasert', 'campus': ['Nett'],
  'kilde': U['utd_kristiania_no_master_business_administration'], 'merknad': 'Nettstudium, fleksibel oppstart. Ingen DBH-kode funnet i 347; type antatt.'},
 {'id': 'oslomet_siv5', 'institusjon': 'OsloMet – storbyuniversitetet', 'instKort': 'OsloMet', 'instKode': '1175', 'navn': 'Økonomi og administrasjon – siviløkonom, femårig', 'kategori': 'oa', 'type': '5-årig løp (3+2)', 'campus': ['Pilestredet'],
  'sivilokonom': True, 'soKode': '215345', 'kilde': U['utd_oslomet_no_okonomi_og_administrasjon___sivilokonom_femarig'], 'iMasterSum': False,
  'merknad': 'Registrert som bachelor (OKADSIV, B3, 180 sp) i DBH 347; masterdelen er MASØA. Studieplasser 120 (utdanning.no). HH-programkartet fører den som master5.'},
 {'id': 'bi_siv5', 'institusjon': 'Handelshøyskolen BI', 'instKort': 'BI', 'instKode': '8241', 'navn': 'Siviløkonomstudiet (5 år)', 'kategori': 'oa', 'type': '5-årig løp (3+2)', 'campus': ['Oslo'],
  'sivilokonom': True, 'kilde': U['utd_bi_no_sivilokonomstudiet_heltid'], 'iMasterSum': False, 'merknad': 'Femårig løp, 300 sp (utdanning.no). DBH-kode ikke identifisert.'},
]
SO_M5 = {'ntnu_msivok5': '194345', 'uia_mastokad5': '201345', 'nord_msb5': '204345', 'usn_siv5': '222345', 'ntnu_msok_5': '194818', 'uib_prof_sok': '184698',
         'uio_svm5_econ': '185698', 'uib_masv_itok': '184803', 'uib_mamn_aktua': '184540', 'ntnu_mtiot': '194767', 'uia_mastindok5': '201767', 'nmbu_m_io': '192767',
         'uis_m_indokg5': '217813', 'nmbu_m_eie': '192230', 'oslomet_siv5': '215345'}
json.dump({'hentet': H, 'program': M, 'ekstra': EKSTRA, 'soM5': SO_M5}, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'manuelt.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(M), 'program med håndførte felt,', len(EKSTRA), 'ekstra')
