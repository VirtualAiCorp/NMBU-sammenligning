# Bygger data/marked/studiesentre/campus.json fra studiesteder.json + manuelt innsamlede adresser.
# Geokoding og kommunenummer: Kartverkets adressesøk (cachet i kilder/kartverket/).
import json, os, urllib.request, urllib.parse, time

ROT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))  # repoets rot
UT = f'{ROT}/data/marked/studiesentre/campus.json'
CACHE = f'{ROT}/data/marked/studiesentre/kilder/kartverket'
os.makedirs(CACHE, exist_ok=True)
HENTET = '2026-10-17'
ss = json.load(open(f'{ROT}/data/marked/studiesteder/studiesteder.json'))
steder = {s['id']: s for s in ss['steder']}
inst = ss['institusjoner']

FYLKE = {'03': 'Oslo', '11': 'Rogaland', '15': 'Møre og Romsdal', '18': 'Nordland', '21': 'Svalbard',
         '31': 'Østfold', '32': 'Akershus', '33': 'Buskerud', '34': 'Innlandet', '39': 'Vestfold',
         '40': 'Telemark', '42': 'Agder', '46': 'Vestland', '50': 'Trøndelag', '55': 'Troms', '56': 'Finnmark'}

BRREG = 'https://data.brreg.no/enhetsregisteret/api/underenheter?overordnetEnhet='
STAT = 'Staten (Kunnskapsdepartementet)'

# ---------- institusjonsnivå ----------
# eier, sentralbord, felles e-post, digitalt eksamenssystem (med kilde), kontaktkilde
I = {
 '0217': dict(eier=STAT, tlf='78 44 84 00', ep='postmottak@samiskhs.no', web='https://samas.no', dig='WISEflow', digk='https://samas.no/nb/eksamen', kk=BRREG+'971519363'),
 '0232': dict(eier=STAT, tlf='71 21 40 00', ep='post@himolde.no', web='https://www.himolde.no', dig='WISEflow (erstattet Inspera 1. april 2026)', digk='https://www.himolde.no/studier/eksamen/', kk='https://www.himolde.no/om/kontakt-oss/index.html'),
 '0236': dict(eier=STAT, tlf='70 07 50 00', ep='postmottak@hivolda.no', web='https://www.hivolda.no', dig=None, digk=None, kk=BRREG+'974809672'),
 '0238': dict(eier=STAT, tlf='55 58 58 00', ep='post@hvl.no', web='https://www.hvl.no', dig='WISEflow', digk='https://www.hvl.no/student/eksamen/', kk='https://www.hvl.no/en/about/contact-information/', eksep='eksamen@hvl.no'),
 '0256': dict(eier=STAT, tlf='69 60 80 00', ep='postmottak@hiof.no', web='https://www.hiof.no', dig='WISEflow (fra høsten 2025)', digk='https://www.hiof.no/studier/eksamen/', kk='https://www.hiof.no/om/kontaktinformasjon/'),
 '1110': dict(eier=STAT, tlf='22 85 50 50', ep='postmottak@admin.uio.no', web='https://www.uio.no', dig='Inspera (WISEflow i enkelte eksamener)', digk='https://www.uio.no/studier/eksamen/', kk=BRREG+'971035854'),
 '1120': dict(eier=STAT, tlf='55 58 00 00', ep='postmottak@uib.no', web='https://www.uib.no', dig=None, digk=None, kk=BRREG+'874789542', eksep='eksamen@uib.no'),
 '1130': dict(eier=STAT, tlf='77 64 40 00', ep='postmottak@uit.no', web='https://uit.no', dig='WISEflow', digk='https://uit.no/eksamen', kk='https://uit.no/om/kontakt'),
 '1150': dict(eier=STAT, tlf='73 59 50 00', ep='postmottak@ntnu.no', web='https://www.ntnu.no', dig='Inspera', digk='https://i.ntnu.no/wiki/-/wiki/Norsk/eksamenslokaler', kk='https://www.ntnu.no/kontakt', eksep='eksamen@adm.ntnu.no'),
 '1160': dict(eier=STAT, tlf='51 83 10 00', ep='post@uis.no', web='https://www.uis.no', dig='WISEflow (Inspera i enkelte hjemmeeksamener)', digk='https://www.uis.no/nb/eksamen', kk='https://www.uis.no/nb/om-uis/kontaktinformasjon-til-uis'),
 '1171': dict(eier=STAT, tlf='38 14 10 00', ep='post@uia.no', web='https://www.uia.no', dig='Inspera, under bytte til WISEflow', digk='https://www.uia.no/studier/for-studenter/eksamen/index.html', kk='https://www.uia.no/om-uia/kontakt/'),
 '1173': dict(eier=STAT, tlf='67 23 00 00', ep='post@nmbu.no', web='https://www.nmbu.no', dig='WISEflow', digk='https://www.nmbu.no/student/eksamen', kk='https://www.nmbu.no/om/kontakt-oss', eksep='eksamen@nmbu.no'),
 '1174': dict(eier=STAT, tlf='75 51 70 00', ep='postmottak@nord.no', web='https://www.nord.no', dig='WISEflow fra 1. september 2026 (før: Inspera)', digk='https://www.nord.no/student/eksamen', kk='https://www.nord.no/om/kontakt-oss'),
 '1175': dict(eier=STAT, tlf='67 23 50 00', ep='post@oslomet.no', web='https://www.oslomet.no', dig='WISEflow (Inspera faset ut våren 2026)', digk='https://student.oslomet.no/skoleeksamen', kk='https://www.oslomet.no/om/kontakt'),
 '1176': dict(eier=STAT, tlf='31 00 80 00', ep='postmottak@usn.no', web='https://www.usn.no', dig='WISEflow', digk='https://www.usn.no/studier/digital-eksamen/studenter/skoleeksamen/', kk='https://www.usn.no/om-usn/kontakt-oss/'),
 '1177': dict(eier=STAT, tlf='62 43 00 00', ep=None, web='https://www.inn.no', dig='WISEflow (fra 23. februar 2026)', digk='https://www.inn.no/for-studenter/eksamen/', kk='https://www.inn.no/om-universitetet/kontakt-oss/'),
 '1210': dict(eier=STAT, tlf='23 36 70 00', ep='post@nmh.no', web='https://nmh.no', dig=None, digk=None, kk=BRREG+'974761106'),
 '1220': dict(eier=STAT, tlf='22 99 70 00', ep='postmottak@aho.no', web='https://aho.no', dig=None, digk=None, kk=BRREG+'971526378'),
 '1240': dict(eier=STAT, tlf='55 95 90 00', ep='postmottak@nhh.no', web='https://www.nhh.no', dig='WISEflow', digk='https://www.nhh.no/for-studenter/eksamen/', kk=BRREG+'974789523'),
 '1260': dict(eier=STAT, tlf=None, ep='postmottak@nih.no', web='https://www.nih.no', dig=None, digk=None, kk=BRREG+'971526033'),
 '1301': dict(eier='Staten (Justis- og beredskapsdepartementet)', tlf='23 19 99 00', ep='postmottak@phs.no', web='https://www.phs.no', dig=None, digk=None, kk=BRREG+'974761017'),
 '1302': dict(eier='Staten (Justis- og beredskapsdepartementet)', tlf='23 06 71 00', ep='krus@krus.no', web='https://www.krus.no', dig=None, digk=None, kk=BRREG+'938264457'),
 '1303': dict(eier='Staten (Forsvarsdepartementet)', tlf=None, ep='fhs.kontakt@mil.no', web='https://www.forsvaret.no/hogskole', dig=None, digk=None, kk=BRREG+'995967219'),
 '1401': dict(eier='Norsk barnebokinstitutt (stiftelse)', tlf='23 13 13 70', ep='post@barnebokinstituttet.no', web='https://www.barnebokinstituttet.no', dig=None, digk=None, kk=BRREG+'971493704'),
 '1404': dict(eier='NSKI Høyskole AS', tlf='40 06 50 06', ep='kontakt@nski.no', web='https://www.nski.no', dig=None, digk=None, kk=BRREG+'993396486'),
 '1405': dict(eier='Norsk Gestaltinstitutt AS', tlf='22 59 16 50', ep='ngi@gestalt.no', web='https://www.gestalt.no', dig=None, digk=None, kk=BRREG+'977266718'),
 '1406': dict(eier='Norges Høyskole for Helsefag AS', tlf='23 20 11 00', ep='post@nhfh.no', web='https://www.nhfh.no', dig=None, digk=None, kk=BRREG+'963786123'),
 '1407': dict(eier='Oslo Nye Høyskole AS', tlf='23 23 38 20', ep='hei@oslonh.no', web='https://www.oslonyehoyskole.no', dig=None, digk=None, kk=BRREG+'992061030'),
 '1409': dict(eier='Noroff University College AS', tlf='38 00 00 00', ep=None, web='https://www.noroff.no', dig=None, digk=None, kk=BRREG+'997731859'),
 '1410': dict(eier='Stiftinga Skrivekunstakademiet', tlf='55 23 04 50', ep='post@skrivekunst.no', web='https://www.skrivekunst.no', dig=None, digk=None, kk=BRREG+'977155169'),
 '1412': dict(eier=None, tlf=None, ep=None, web=None, dig=None, digk=None, kk=None),
 '1413': dict(eier='Høyskolen for yrkesfag AS', tlf=None, ep=None, web='https://www.hfy.no', dig=None, digk=None, kk=BRREG+'916829329'),
 '6220': dict(eier=STAT, tlf='22 99 55 00', ep='khio@khio.no', web='https://khio.no', dig=None, digk=None, kk=BRREG+'977027233'),
 '8202': dict(eier='Lovisenberg Diakonale Høgskole AS', tlf='22 35 82 00', ep='admin@ldh.no', web='https://www.ldh.no', dig=None, digk=None, kk=BRREG+'994881078'),
 '8208': dict(eier='VID vitenskapelige høgskole AS', tlf='990 90 005', ep='post@vid.no', web='https://www.vid.no', dig=None, digk=None, kk='https://www.vid.no/om/kontakt'),
 '8221': dict(eier='MF vitenskapelig høyskole (stiftelse)', tlf='22 59 05 00', ep='post@mf.no', web='https://www.mf.no', dig=None, digk=None, kk=BRREG+'917387079'),
 '8223': dict(eier='NLA Høgskolen AS', tlf='55 54 07 00', ep='post@nla.no', web='https://www.nla.no', dig='WISEflow', digk='https://www.nla.no/for-studenter/eksamen/', kk='https://www.nla.no/studere-ved-nla/vare-studiesteder'),
 '8224': dict(eier='Dronning Mauds Minne Høgskole (stiftelse)', tlf='73 80 52 00', ep='post@dmmh.no', web='https://dmmh.no', dig=None, digk=None, kk=BRREG+'971574747'),
 '8225': dict(eier='Stiftelsen Steinerhøyskolen', tlf='22 54 05 90', ep=None, web='https://www.steinerhoyskolen.no', dig=None, digk=None, kk=BRREG+'971513470'),
 '8227': dict(eier='Stiftelsen Barratt Due musikkinstitutt', tlf='22 06 86 86', ep=None, web='https://www.barrattdue.no', dig=None, digk=None, kk=BRREG+'960472675'),
 '8228': dict(eier=None, tlf=None, ep=None, web=None, dig=None, digk=None, kk=None),
 '8232': dict(eier='Ansgar høyskole AS', tlf='38 10 65 00', ep=None, web='https://ansgarhoyskole.no', dig=None, digk=None, kk=BRREG+'989205544', eksep='eksamen@ansgarskolen.no'),
 '8234': dict(eier='Fjellhaug Internasjonale Høgskole AS', tlf='23 23 24 00', ep='post@fjellhaug.no', web='https://www.fih.fjellhaug.no', dig=None, digk=None, kk=BRREG+'914086434'),
 '8235': dict(eier=None, tlf=None, ep=None, web=None, dig=None, digk=None, kk=None),
 '8241': dict(eier='Stiftelsen Handelshøyskolen BI', tlf='464 10 000', ep='info@bi.no', web='https://www.bi.no', dig='WISEflow', digk='https://www.bi.no/studere-ved-bi/eksamensinformasjon/', kk='https://www.bi.no/om-bi/kontakt-oss/'),
 '8243': dict(eier='Stiftelsen Bergen Arkitekthøgskole', tlf='55 36 38 80', ep=None, web='https://www.bas.org', dig=None, digk=None, kk=BRREG+'977155061'),
 '8247': dict(eier='Høgskulen for grøn utvikling (stiftelse)', tlf=None, ep=None, web=None, dig=None, digk=None, kk=BRREG+'923717803'),
 '8248': dict(eier='Høyskolen for ledelse og teologi AS', tlf='67 10 35 40', ep='post@hlt.no', web='https://hlt.no', dig=None, digk=None, kk=BRREG+'993470708'),
 '8253': dict(eier='Høyskolen Kristiania – Ernst G. Mortensens stiftelse', tlf='22 59 60 00', ep='postmottak@kristiania.no', web='https://www.kristiania.no', dig='WISEflow', digk='https://www.kristiania.no/contentassets/4c370b506a0d453ea2c881c2425e213b/oppmelding-til-eksamen-for-nettstudenter-h26.pdf', kk='https://www.kristiania.no/om-kristiania/kontakt-oss/'),
 '8254': dict(eier='Høyskolen for dansekunst AS', tlf=None, ep=None, web=None, dig=None, digk=None, kk=BRREG+'812348442'),
}

# ---------- campusnivå ----------
# id: (campusnavn, adresse, postnr, poststed, geokode-gate eller None, nettside, adressekilde, ekstra dict)
U = 'https://uit.no/studiesteder'
UE = 'https://uit.no/eksamen'
NK = 'https://www.nord.no/om/kontakt-oss'
INK = 'https://www.inn.no/om-universitetet/kontakt-oss/'
HVK = 'https://www.hvl.no/en/about/contact-information/'
C = {
 # Samisk høgskole
 '0217-kautokeino': ('Samisk høgskole, Kautokeino (Diehtosiida)', 'Hánnoluohkká 45', '9520', 'Kautokeino', None, 'https://samas.no', BRREG+'971519363', {}),
 # HiMolde
 '0232-molde': ('Høgskolen i Molde, studiested Molde', 'Britvegen 2', '6410', 'Molde', None, 'https://www.himolde.no', 'https://www.himolde.no/om/kontakt-oss/index.html', {}),
 '0232-kristiansund': ('Høgskolen i Molde, studiested Kristiansund (Campus Kristiansund)', 'Fosnagata 12', '6509', 'Kristiansund', None, 'https://www.himolde.no', 'https://www.himolde.no/om/kontakt-oss/index.html', {'merknad': 'HiMolde holder til i 3. etasje på Campus Kristiansund.'}),
 # Volda
 '0236-volda': ('Høgskulen i Volda', 'Joplassvegen 11', '6103', 'Volda', None, 'https://www.hivolda.no', BRREG+'974809672', {}),
 # HVL
 '0238-bergen': ('HVL campus Bergen (Kronstad)', 'Inndalsveien 28', '5063', 'Bergen', None, 'https://www.hvl.no', HVK, {}),
 '0238-forde': ('HVL campus Førde', 'Svanehaugvegen 1', '6812', 'Førde', None, 'https://www.hvl.no', HVK, {}),
 '0238-haugesund': ('HVL campus Haugesund', 'Bjørnsons gate 45', '5528', 'Haugesund', None, 'https://www.hvl.no', HVK, {}),
 '0238-sogndal': ('HVL campus Sogndal', 'Røyrgata 6', '6856', 'Sogndal', None, 'https://www.hvl.no', HVK, {}),
 '0238-stord': ('HVL campus Stord', 'Klingenbergvegen 4', '5414', 'Stord', None, 'https://www.hvl.no', HVK, {}),
 # HiØ
 '0256-halden': ('Høgskolen i Østfold, campus Halden (Remmen)', 'B R A veien 4', '1783', 'Halden', None, 'https://www.hiof.no', 'https://www.hiof.no/om/kontaktinformasjon/', {'tilbyr': True, 'andre': True, 'eksep': 'eksamen-halden@hiof.no', 'kilder': ['https://www.hiof.no/studier/eksamen/Ekstern-eksamen/index.html'],
   'for': ['Egne studenter', 'Studenter ved andre norske universiteter og høgskoler (skriftlig eksamen, etter søknad innen 15. oktober / 1. april)']}),
 '0256-fredrikstad': ('Høgskolen i Østfold, campus Fredrikstad', 'Kobberslagerstredet 5', '1671', 'Kråkerøy', None, 'https://www.hiof.no', 'https://www.hiof.no/om/kontaktinformasjon/', {'tilbyr': True, 'andre': False, 'eksep': 'eksamen-fred@hiof.no', 'kilder': ['https://www.hiof.no/studier/eksamen/Ekstern-eksamen/index.html'],
   'for': ['Egne studenter'], 'merknad': 'HiØ oppgir at campus Fredrikstad ikke har kapasitet til å ta imot studenter fra andre læresteder.'}),
 # UiO / UiB
 '1110-oslo': ('Universitetet i Oslo, Blindern', 'Problemveien 7', '0371', 'Oslo', None, 'https://www.uio.no', BRREG+'971035854', {'lokaler': 'Skriftlige skoleeksamener i stor grad i Silurveien 2 (OsloMets eksamenslokaler), ifølge uio.no/studier/eksamen', 'tilbyr': True, 'kilder': ['https://www.uio.no/studier/eksamen/']}),
 '1120-bergen': ('Universitetet i Bergen', 'Muséplassen 1', '5007', 'Bergen', None, 'https://www.uib.no', BRREG+'874789542', {'tilbyr': True, 'andre': True, 'kilder': ['https://www4.uib.no/for-studenter/utveksling/ekstern-eksamen-for-utvekslingsstudenter'],
   'for': ['Egne studenter', 'Utvekslingsstudenter ved UiB som tar hjemuniversitetets eksamen («ekstern eksamen»), søknad minst 4 uker før, hverdager kl. 9–16'],
   'merknad': 'Ordningen gjelder studenter med studierett ved UiB; den er ikke en åpen tjeneste for andre institusjoners studenter.'}),
 # UiT
 '1130-tromso': ('UiT campus Tromsø (Breivika)', 'Hansine Hansens veg 18', '9019', 'Tromsø', None, U, U, {'tilbyr': True, 'lokaler': 'Kraft sportssenter (Framstredet 79), Administrasjonsbygget og Teorifagbygget hus 1 (Universitetsvegen 22)', 'kilder': [UE]}),
 '1130-alta': ('UiT campus Alta', 'Follumsvei 39', '9510', 'Alta', None, U, U, {'tilbyr': True, 'lokaler': 'Campus Alta, Follumsvei 39', 'kilder': [UE]}),
 '1130-bardufoss': ('UiT studiested Bardufoss', 'Bardufoss lufthavn', '9325', 'Bardufoss', None, U, U, {}),
 '1130-bodo': ('UiT studiested Bodø', 'Havnegata 9', '8006', 'Bodø', None, U, U, {'tilbyr': True, 'lokaler': 'Torggården, Kudalsveien 6 (rom 120 og 121)', 'kilder': [UE], 'merknad': 'Besøksadresse Postgården, Havnegata 9; undervisningslokale i Torggården, Kudalsveien 6.'}),
 '1130-finnsnes': ('UiT eksamenssted Finnsnes (Studiesenter Midt-Troms)', 'Bernhard Lunds vei 4', '9300', 'Finnsnes', None, UE, UE, {'tilbyr': True, 'lokaler': 'Studiesenteret Midt-Troms AS, Kunnskaps- og Næringsparken Senja', 'kilder': [UE], 'merknad': 'Ikke en UiT-campus, men et studiesenter som UiT bruker som eksamenssted. Også aktuell i studiesenterkartleggingen.'}),
 '1130-hammerfest': ('UiT campus Hammerfest', 'Kransvikveien 35', '9601', 'Hammerfest', None, U, U, {'tilbyr': True, 'lokaler': 'Elsa Semmelmanns vei 1 (rom 222–233)', 'kilder': [UE]}),
 '1130-harstad': ('UiT campus Harstad', 'Havnegata 5', '9404', 'Harstad', None, U, U, {'tilbyr': True, 'lokaler': 'Havnegata 1 (2. etg.) og Havnegata 5', 'kilder': [UE]}),
 '1130-kabelvag': ('UiT Filmkunstskolen i Kabelvåg', 'Tore Hjorts gate 22', '8310', 'Kabelvåg', None, U, U, {}),
 '1130-kirkenes': ('UiT campus Kirkenes', 'Wiulls gate 5', '9900', 'Kirkenes', None, U, U, {'tilbyr': True, 'lokaler': 'UiTs campuslokaler i Wiulls gate 3–5 (Sparebankbygget)', 'kilder': [UE], 'adressetekst': 'Wiulls gate 3–5'}),
 '1130-mo-i-rana': ('UiT studiested Mo i Rana (Campus Helgeland)', 'Nytorget 5', '8622', 'Mo i Rana', None, U, U, {'tilbyr': True, 'lokaler': 'Torggata, Mo i Rana (ifølge uit.no/eksamen)', 'kilder': [UE], 'merknad': 'Samme adresse som Nord universitets Campus Helgeland.'}),
 '1130-narvik': ('UiT campus Narvik', 'Lodve Langes gate 2', '8514', 'Narvik', None, U, U, {'tilbyr': True, 'lokaler': 'Lodve Langes gate 2', 'kilder': [UE]}),
 '1130-svalbard': ('UiT studiested Svalbard', 'Svalbard forskningspark', '9171', 'Longyearbyen', None, U, U, {}),
 # NTNU
 '1150-trondheim': ('NTNU Trondheim (Gløshaugen m.fl.)', 'Høgskoleringen 1', '7034', 'Trondheim', None, 'https://www.ntnu.no', BRREG+'974767880', {'tilbyr': True, 'lokaler': 'Eksamenshuset Sluppen (Sluppenvegen 14) og Dragvoll idrettssenter', 'kilder': ['https://i.ntnu.no/wiki/-/wiki/Norsk/eksamenslokaler', 'https://i.ntnu.no/wiki/-/wiki/Norsk/Eksamen+fra+utenlandsk+universitet+-+fjerneksamen'],
   'andre': True, 'for': ['Egne studenter', 'Fjerneksamen: skriftlige eksamener fra utenlandske universiteter for NTNU-studenter på utveksling og innreisende utvekslingsstudenter']}),
 '1150-gjovik': ('NTNU i Gjøvik', 'Teknologivegen 22', '2815', 'Gjøvik', None, 'https://www.ntnu.no', BRREG+'974767880', {'tilbyr': True, 'lokaler': 'Mustad og A-, B-, G-, H-, S- og T-bygget', 'kilder': ['https://i.ntnu.no/wiki/-/wiki/Norsk/eksamenslokaler'], 'eksep': None}),
 '1150-alesund': ('NTNU i Ålesund', 'Larsgårdsvegen 2', '6009', 'Ålesund', None, 'https://www.ntnu.no', BRREG+'974767880', {'tilbyr': True, 'lokaler': 'Ankeret, Lanterna og Gnisten', 'kilder': ['https://i.ntnu.no/wiki/-/wiki/Norsk/eksamenslokaler']}),
 # UiS
 '1160-stavanger': ('Universitetet i Stavanger, campus Ullandhaug', 'Kjell Arholms gate 41', '4021', 'Stavanger', None, 'https://www.uis.no', 'https://www.uis.no/nb/om-uis/kontaktinformasjon-til-uis', {}),
 # UiA
 '1171-kristiansand': ('Universitetet i Agder, campus Kristiansand', 'Universitetsveien 25', '4630', 'Kristiansand', None, 'https://www.uia.no', 'https://www.uia.no/om-uia/kontakt/', {'tilbyr': True, 'andre': False, 'kilder': ['https://www.uia.no/studier/for-studenter/eksamen/ekstern-eksamen.html'], 'for': ['Egne studenter'],
   'merknad': 'UiA oppgir at universitetet fra 1. januar 2025 ikke lenger generelt tilbyr å avholde eksamen på campus for andre (unntak: utvekslingsstudenter).'}),
 '1171-grimstad': ('Universitetet i Agder, campus Grimstad', 'Jon Lilletuns vei 9', '4879', 'Grimstad', None, 'https://www.uia.no', 'https://www.uia.no/om-uia/kontakt/', {'tilbyr': True, 'andre': False, 'kilder': ['https://www.uia.no/studier/for-studenter/eksamen/ekstern-eksamen.html'], 'for': ['Egne studenter'],
   'merknad': 'Samme regel som Kristiansand: ingen generell eksamensavvikling for andre fra 1. januar 2025.'}),
 # NMBU
 '1173-as': ('NMBU campus Ås', 'Universitetstunet 3', '1433', 'Ås', None, 'https://www.nmbu.no', 'https://www.nmbu.no/om/kontakt-oss', {'tilbyr': True, 'kilder': ['https://www.nmbu.no/student/eksamen'], 'for': ['Egne studenter'],
   'merknad': 'Hjemmeinstitusjonen. Romplassering for skoleeksamen publiseres i Studentweb 1–2 uker før.'}),
 # Nord
 '1174-bodo': ('Nord universitet, Bodø (Mørkved)', 'Universitetsalléen 11', '8026', 'Bodø', None, NK, NK, {'tlf': '75 51 70 00', 'ep2': 'servicetorget@nord.no'}),
 '1174-levanger': ('Nord universitet, Levanger', 'Høgskoleveien 27', '7600', 'Levanger', None, NK, NK, {'tlf': '74 02 27 30', 'ep2': 'servicetorget@nord.no'}),
 '1174-mo-i-rana': ('Nord universitet, Campus Helgeland (Mo i Rana)', 'Nytorget 5', '8622', 'Mo i Rana', None, NK, NK, {'tlf': '75 51 70 00', 'ep2': 'servicetorget@nord.no', 'merknad': 'Campus Helgeland huser også Kunnskapsparken Helgeland og Nordlandsforskning; UiT oppgir samme besøksadresse.'}),
 '1174-namsos': ('Nord universitet, Namsos', 'Finn Christiansens veg 1', '7804', 'Namsos', None, NK, NK, {'tlf': '74 21 23 00', 'ep2': 'servicetorget@nord.no'}),
 '1174-nesna': ('Nord universitet, Nesna', 'Nesna Lærerhøgskole 1', '8700', 'Nesna', None, NK, NK, {'tlf': '75 05 78 19', 'ep2': 'servicetorget@nord.no', 'merknad': 'Nesna er samlingsbasert (ingen daglig undervisning).'}),
 '1174-steinkjer': ('Nord universitet, Steinkjer', 'Skolegata 22', '7713', 'Steinkjer', None, NK, NK, {'tlf': '74 11 20 39', 'ep2': 'servicetorget@nord.no'}),
 '1174-stjordal': ('Nord universitet, Stjørdal', 'Wessels veg 75', '7502', 'Stjørdal', None, NK, NK, {'tlf': '74 82 37 70', 'ep2': 'servicetorget@nord.no'}),
 '1174-vesteralen': ('Nord universitet, Vesterålen (Stokmarknes)', 'Richard Withs plass 2', '8450', 'Stokmarknes', None, NK, NK, {'merknad': 'I Hurtigrutens Hus.'}),
 # OsloMet
 '1175-oslo': ('OsloMet, studiested Pilestredet', 'Pilestredet 46', '0167', 'Oslo', None, 'https://www.oslomet.no', 'https://www.oslomet.no/om/kontakt', {'tilbyr': True, 'lokaler': 'Silurveien 2 (eksamenslokaler med stasjonære PC-er; brukes også av UiO)', 'kilder': ['https://student.oslomet.no/skoleeksamen']}),
 '1175-kjeller': ('OsloMet, studiested Kjeller', 'Kunnskapsveien 55', '2007', 'Kjeller', None, 'https://www.oslomet.no', 'https://www.oslomet.no/om/kontakt', {'tlf': '67 23 84 85', 'ep2': 'servicetorget-kjeller@oslomet.no'}),
 # USN
 **{f'1176-{k}': (f'USN campus {n}', a, p, ps, None, f'https://www.usn.no/om-usn/campusene/{s}/', f'https://www.usn.no/om-usn/campusene/{s}/',
     {'tilbyr': True, 'andre': True, 'ep2': e, 'tlf': t, 'kilder': ['https://www.usn.no/getfile.php/13530009-1774344760/usn.no/om_USN/Regelverk/Merknader%20til%20forskrift%20om%20studier%20og%20eksamen%20ved%20USN.pdf'],
      'for': ['Egne studenter', 'Studenter ved andre utdanningsinstitusjoner etter søknad (2 500 kr per eksamen per student + ev. eksamensvakt), forskrift § 7-17 (5)']})
    for k, n, a, p, ps, s, e, t in [
     ('bo', 'Bø', 'Gullbringvegen 36', '3800', 'Bø i Telemark', 'bo', 'servicetorg.bo@usn.no', '31 00 80 00'),
     ('drammen', 'Drammen', 'Grønland 58', '3045', 'Drammen', 'drammen', None, None),
     ('hallingdal', 'Hallingdal', 'Sentrumsvegen 60', '3550', 'Gol', 'hallingdal', 'servicetorg.hallingdal@usn.no', None),
     ('honefoss', 'Ringerike (Hønefoss)', 'Bredalsveien 14', '3511', 'Hønefoss', 'honefoss', 'servicetorg.ringerike@usn.no', None),
     ('kongsberg', 'Kongsberg', 'Hasbergs vei 36', '3616', 'Kongsberg', 'kongsberg', 'servicetorg.kongsberg@usn.no', '31 00 80 70'),
     ('notodden', 'Notodden', 'Lærerskoleveien 40', '3679', 'Notodden', 'notodden', 'servicetorg.notodden@usn.no', '31 00 80 00'),
     ('porsgrunn', 'Porsgrunn', 'Kjølnes ring 56', '3918', 'Porsgrunn', 'porsgrunn', None, None),
     ('rauland', 'Rauland', 'Akademiet 2', '3864', 'Rauland', 'rauland', 'rauland@usn.no', '35 95 29 00'),
     ('vestfold', 'Vestfold (Bakkenteigen)', 'Raveien 215', '3184', 'Borre', 'vestfold', 'servicetorg.vestfold@usn.no', '31 00 80 90')]},
 # INN
 '1177-blaestad': ('INN studiested Blæstad', 'Høyvangvegen 40', '2322', 'Ridabu', None, 'https://www.inn.no/om-universitetet/studiested-blestad/', INK, {}),
 '1177-elverum': ('INN studiested Elverum (Terningen Arena)', 'Hamarvegen 112', '2406', 'Elverum', None, 'https://www.inn.no/om-universitetet/studiested-elverum/', INK, {}),
 '1177-evenstad': ('INN studiested Evenstad', 'Anne Evenstads veg 80', '2480', 'Koppang', None, 'https://www.inn.no/om-universitetet/studiested-evenstad/', INK, {}),
 '1177-hamar': ('INN studiested Hamar', 'Holsetgata 31', '2318', 'Hamar', None, 'https://www.inn.no/om-universitetet/studiested-hamar/', INK, {}),
 '1177-kongsvinger': ('INN desentralisert studiested Kongsvinger (Høgskolesenteret i Kongsvinger)', 'Strandvegen 3', '2212', 'Kongsvinger', None, 'https://www.inn.no/om-universitetet/desentralisert-studiested-kongsvinger/', INK,
   {'tilbyr': True, 'kilder': ['https://www.inn.no/studier/vare-studier/arsstudium-i-bedriftsokonomi---nettbasert/'], 'for': ['Egne studenter, blant annet nettstudenter i bedriftsøkonomi'], 'merknad': 'Campus Kongsvinger er et høgskolesenter som INN leverer studier til; også aktuelt i studiesenterkartleggingen.'}),
 '1177-lillehammer': ('INN studiested Lillehammer', 'Vormstuguvegen 2', '2624', 'Lillehammer', None, 'https://www.inn.no/om-universitetet/studiested-lillehammer/', INK,
   {'tilbyr': True, 'kilder': ['https://www.inn.no/studier/vare-studier/arsstudium-i-bedriftsokonomi---nettbasert/'], 'for': ['Egne studenter, blant annet nettstudenter i bedriftsøkonomi']}),
 '1177-rena': ('INN studiested Rena', 'Telthusveien 12', '2450', 'Rena', None, 'https://www.inn.no/om-universitetet/studiested-rena/', INK,
   {'tilbyr': True, 'eksep': 'eksamenhhs@inn.no', 'kilder': ['https://www.inn.no/studier/vare-studier/arsstudium-i-bedriftsokonomi---nettbasert/', 'https://www.inn.no/om-universitetet/studiested-rena/'], 'for': ['Egne studenter, blant annet nettstudenter i bedriftsøkonomi']}),
 '1177-tynset': ('INN desentralisert studiested Tynset (Tynset studie- og høgskolesenter)', 'Fedraheimveien 1', '2500', 'Tynset', None, 'https://www.inn.no/om-universitetet/desentralisert-studiested-tynset/', INK, {'merknad': 'Studie- og høgskolesenter; også aktuelt i studiesenterkartleggingen.'}),
 # Statlige høgskoler o.l.
 '1210-oslo': ('Norges musikkhøgskole', 'Slemdalsveien 11', '0369', 'Oslo', None, 'https://nmh.no', BRREG+'974761106', {}),
 '1220-oslo': ('Arkitektur- og designhøgskolen i Oslo', 'Maridalsveien 29', '0175', 'Oslo', None, 'https://aho.no', BRREG+'971526378', {}),
 '1240-bergen': ('NHH, Helleveien', 'Helleveien 30', '5045', 'Bergen', None, 'https://www.nhh.no', BRREG+'974789523', {}),
 '1240-oslo': ('NHH, avdeling Oslo', 'Drammensveien 44', '0271', 'Oslo', None, 'https://www.nhh.no', BRREG+'974789523', {}),
 '1260-oslo': ('Norges idrettshøgskole', 'Sognsveien 220', '0863', 'Oslo', None, 'https://www.nih.no', BRREG+'971526033', {}),
 '1301-oslo': ('Politihøgskolen, Oslo', 'Slemdalsveien 5', '0369', 'Oslo', None, 'https://www.phs.no', BRREG+'974761017', {}),
 '1301-bodo': ('Politihøgskolen, Bodø', 'Slekkåsveien', '8026', 'Bodø', None, 'https://www.phs.no', BRREG+'974761017', {}),
 '1301-stavern': ('Politihøgskolen, Stavern', 'Fredriksvern verft 57', '3290', 'Stavern', None, 'https://www.phs.no', BRREG+'974761017', {}),
 '1301-kongsvinger': ('Politihøgskolen, utdanningssenter Kongsvinger', 'Motjernsvegen 21', '2213', 'Kongsvinger', None, 'https://www.phs.no', BRREG+'974761017', {}),
 '1302-lillestrom': ('Høgskolen for kriminalomsorg (KRUS)', 'Solheimsgata 21', '2000', 'Lillestrøm', None, 'https://www.krus.no', BRREG+'938264457', {}),
 '1303-bergen': ('Forsvarets høgskole, Sjøkrigsskolen', 'Sjøkrigsskoleveien 32', '5165', 'Laksevåg', None, 'https://www.forsvaret.no/hogskole', BRREG+'995967219', {}),
 '1303-oslo': ('Forsvarets høgskole, Oslo (Akershus festning) og Krigsskolen', None, None, None, None, 'https://www.forsvaret.no/hogskole', BRREG+'995967219', {'merknad': 'Brreg oppgir «Oslo Mil/Akershus», 0015 Oslo (militær postadresse). Krigsskolen: Utfartsveien 2, 0593 Oslo.'}),
 '1303-trondheim': ('Forsvarets høgskole, Luftkrigsskolen', None, None, None, None, 'https://www.forsvaret.no/hogskole', BRREG+'995967219', {'merknad': 'Brreg oppgir «Kuhaugen leir, Trondheim mil», 7004 Trondheim.'}),
 '1303-lillehammer': ('Forsvarets høgskole, Cyberingeniørskolen (Jørstadmoen)', 'Jørstadmovegen 600', '2625', 'Fåberg', None, 'https://www.forsvaret.no/hogskole', BRREG+'995967219', {}),
 '6220-oslo': ('Kunsthøgskolen i Oslo', 'Fossveien 24', '0551', 'Oslo', None, 'https://khio.no', BRREG+'977027233', {}),
 # Private
 '1401-oslo': ('Norsk barnebokinstitutt', 'Observatoriegata 1B', '0254', 'Oslo', None, 'https://www.barnebokinstituttet.no', BRREG+'971493704', {}),
 '1404-oslo': ('NSKI Høyskole', 'St. Olavs gate 32', '0166', 'Oslo', None, 'https://www.nski.no', BRREG+'993396486', {}),
 '1405-oslo': ('Norsk Gestaltinstitutt', 'Kjørbokollen 30', '1337', 'Sandvika', None, 'https://www.gestalt.no', BRREG+'977266718', {'merknad': 'DBH fører studiestedet i Oslo, mens Brreg oppgir adresse i Sandvika (Bærum).'}),
 '1406-oslo': ('Norges Høyskole for Helsefag', 'Pilestredet 56', '0167', 'Oslo', None, 'https://www.nhfh.no', BRREG+'963786123', {}),
 '1407-oslo': ('Oslo Nye Høyskole', 'Ullevålsveien 76', '0454', 'Oslo', None, 'https://www.oslonyehoyskole.no', BRREG+'992061030', {}),
 '1409-kristiansand': ('Noroff University College, Kristiansand', 'Tordenskjolds gate 9', '4612', 'Kristiansand', None, 'https://www.noroff.no', BRREG+'997731859', {}),
 '1410-bergen': ('Skrivekunstakademiet', 'Georgernes verft 12', '5011', 'Bergen', None, 'https://www.skrivekunst.no', BRREG+'977155169', {}),
 '1413-gjovik': ('Høyskolen for yrkesfag, Gjøvik', 'Studievegen 7', '2815', 'Gjøvik', None, 'https://www.hfy.no', BRREG+'916829329', {}),
 '8202-oslo': ('Lovisenberg diakonale høgskole', 'Lovisenberggata 15B', '0456', 'Oslo', None, 'https://www.ldh.no', BRREG+'994881078', {}),
 '8208-oslo': ('VID Oslo (Diakonveien)', 'Diakonveien 14', '0370', 'Oslo', None, 'https://www.vid.no', 'https://www.vid.no/om/kontakt', {'adressetekst': 'Diakonveien 12–18', 'merknad': 'VID Oslo har også lokaler i Tollbugata 34, 0158 Oslo.'}),
 '8208-bergen': ('VID Bergen', 'Ulriksdal 10', '5009', 'Bergen', None, 'https://www.vid.no', 'https://www.vid.no/om/kontakt', {}),
 '8208-stavanger': ('VID Stavanger', 'Misjonsmarka 12', '4024', 'Stavanger', None, 'https://www.vid.no', 'https://www.vid.no/om/kontakt', {}),
 '8208-sandvika': ('VID Sandvika', 'Otto Sverdrups plass 4', '1337', 'Sandvika', None, 'https://www.vid.no', 'https://www.vid.no/om/kontakt', {}),
 '8208-tromso': ('VID Tromsø', 'Sykehusvegen 23', '9019', 'Tromsø', None, 'https://www.vid.no', 'https://www.vid.no/om/kontakt', {'merknad': 'I SIVA innovasjonssenter.'}),
 '8208-sandnessjoen': ('VID Helgeland (Sandnessjøen)', 'Novikveien 47', '8800', 'Sandnessjøen', None, 'https://www.vid.no', 'https://www.vid.no/om/kontakt', {'merknad': 'Holder til ved Sandnessjøen videregående skole; ingen fast resepsjon.'}),
 '8221-oslo': ('MF vitenskapelig høyskole', 'Gydas vei 4', '0363', 'Oslo', None, 'https://www.mf.no', BRREG+'917387079', {}),
 '8223-bergen': ('NLA Bergen (Sandviken og Kalfaret)', 'Amalie Skrams vei 3', '5036', 'Bergen', None, 'https://www.nla.no/studere-ved-nla/vare-studiesteder', 'https://www.nla.no/studere-ved-nla/vare-studiesteder', {'merknad': 'Også campus Kalfaret, Kalfarveien 31, 5018 Bergen.'}),
 '8223-oslo': ('NLA Oslo', 'Pilestredet Park 33', '0176', 'Oslo', None, 'https://www.nla.no/studere-ved-nla/vare-studiesteder', 'https://www.nla.no/studere-ved-nla/vare-studiesteder', {}),
 '8223-kristiansand': ('NLA Kristiansand (Gimlekollen)', 'Bergtoras vei 120', '4633', 'Kristiansand', None, 'https://www.nla.no/studere-ved-nla/vare-studiesteder', 'https://www.nla.no/studere-ved-nla/vare-studiesteder', {}),
 '8223-stavanger': ('NLA Stavanger', 'Tjensvollveien 44', '4021', 'Stavanger', None, 'https://www.nla.no/studere-ved-nla/vare-studiesteder', 'https://www.nla.no/studere-ved-nla/vare-studiesteder', {}),
 '8223-trondheim': ('NLA studiesenter Trondheim', 'Prinsens gate 22B', '7012', 'Trondheim', None, 'https://www.nla.no/studere-ved-nla/vare-studiesteder', 'https://www.nla.no/studere-ved-nla/vare-studiesteder', {}),
 '8224-trondheim': ('Dronning Mauds Minne Høgskole', 'Thrond Nergaards veg 7', '7044', 'Trondheim', None, 'https://dmmh.no', BRREG+'971574747', {}),
 '8225-oslo': ('Steinerhøyskolen', 'Professor Dahls gate 30', '0260', 'Oslo', None, 'https://www.steinerhoyskolen.no', BRREG+'971513470', {}),
 '8227-oslo': ('Barratt Due musikkinstitutt', 'Lyder Sagens gate 2', '0358', 'Oslo', None, 'https://www.barrattdue.no', BRREG+'960472675', {}),
 '8232-kristiansand': ('Ansgar høyskole', 'Fredrik Franssons vei 4', '4635', 'Kristiansand', None, 'https://ansgarhoyskole.no', BRREG+'989205544', {}),
 '8234-oslo': ('Fjellhaug Internasjonale Høgskole', 'Sinsenveien 15', '0572', 'Oslo', None, 'https://www.fih.fjellhaug.no', BRREG+'914086434', {}),
 **{f'8241-{k}': (f'BI campus {n}', a, p, ps, None, f'https://www.bi.no/studere-ved-bi/campus-{k}/', 'https://www.bi.no/om-bi/kontakt-oss/',
     {'tilbyr': True, 'kilder': ['https://www.bi.no/studere-ved-bi/eksamensinformasjon/'], 'for': ['Egne studenter (BI oppgir at eksamen også kan avlegges ved eksamenssteder utenom BIs studiesteder)']})
    for k, n, a, p, ps in [('oslo', 'Oslo (Nydalen)', 'Nydalsveien 37', '0484', 'Oslo'), ('bergen', 'Bergen', 'Kong Christian Frederiks plass 5', '5006', 'Bergen'),
                           ('stavanger', 'Stavanger', 'Byfjordparken 17', '4007', 'Stavanger'), ('trondheim', 'Trondheim', 'Brattørkaia 16', '7010', 'Trondheim')]},
 '8243-bergen': ('Bergen Arkitekthøgskole', 'Sandviksbodene 61A', '5035', 'Bergen', None, 'https://www.bas.org', BRREG+'977155061', {}),
 '8247-jaeren': ('Høgskulen for grøn utvikling', 'Arne Garborgs veg 22', '4340', 'Bryne', None, None, BRREG+'923717803', {'merknad': 'DBH fører studiestedet i Klepp (Jæren), mens Brreg oppgir adresse på Bryne (Time).'}),
 '8248-baerum': ('Høyskolen for ledelse og teologi', 'Michelets vei 62', '1368', 'Stabekk', None, 'https://hlt.no', BRREG+'993470708', {}),
 '8253-oslo': ('Kristiania campus Oslo (Kvadraturen)', 'Kirkegata 24', '0153', 'Oslo', None, 'https://www.kristiania.no/om-kristiania/kontakt-oss/', 'https://www.kristiania.no/om-kristiania/kontakt-oss/',
   {'adressetekst': 'Kirkegata 24–26', 'tilbyr': True, 'kilder': ['https://www.kristiania.no/contentassets/4c370b506a0d453ea2c881c2425e213b/oppmelding-til-eksamen-for-nettstudenter-h26.pdf'], 'for': ['Egne studenter, også nettstudenter med skoleeksamen («On-campus Oslo»)'],
    'merknad': 'Kristiania har også Fjerdingen (Christian Krohgs gate 32) og Urtegata 9 i Oslo.'}),
 '8253-bergen': ('Kristiania campus Bergen (Hansaparken)', 'Kalfarveien 78C', '5022', 'Bergen', None, 'https://www.kristiania.no/om-kristiania/kontakt-oss/', 'https://www.kristiania.no/om-kristiania/kontakt-oss/',
   {'tilbyr': True, 'kilder': ['https://www.kristiania.no/contentassets/4c370b506a0d453ea2c881c2425e213b/oppmelding-til-eksamen-for-nettstudenter-h26.pdf'], 'for': ['Egne studenter, også nettstudenter med skoleeksamen («On-campus Bergen»)']}),
 '8254-oslo': ('Høyskolen for dansekunst', 'Marstrandgata 8', '0566', 'Oslo', None, None, BRREG+'812348442', {}),
}

# Steder uten egen dokumentert adresse (merknad)
UTEN = {
 '0217-karasjok': 'Ingen egen campusadresse funnet. DBH-navnevarianter tyder på undervisning i lånte lokaler (Kárášjoga joatkaskuvla).',
 '0217-roros': 'Ingen egen campusadresse funnet (desentralisert tilbud).',
 '0217-sijti-jarnge': 'Samisk kultursenter i Hattfjelldal; ingen registrerte studenter 2025. Adresse ikke kartlagt.',
 '0236-kristiansund': 'Desentralisert tilbud i Kristiansund (6 studenter 2025); adresse ikke dokumentert.',
 '0238-floro': 'Ingen registrerte studenter 2025; adresse ikke kartlagt.',
 '0256-indre-ostfold': 'Desentralisert tilbud (95 studenter 2025); adresse ikke dokumentert.',
 '1150-kristiansund': 'Desentralisert NTNU-tilbud (31 studenter 2025); adresse ikke dokumentert.',
 '1150-levanger': 'Desentralisert NTNU-tilbud (62 studenter 2025); adresse ikke dokumentert.',
 '1173-oslo': 'Sju registrerte 2025; ingen NMBU-campus i Oslo (veterinærmiljøet flyttet til Ås).',
 '1173-svalbard': 'Ingen registrerte 2025; undervisning ev. via UNIS.',
 '1174-kolvereid': 'Ingen registrerte 2025 (tidligere studiested).', '1174-meraker': 'Ingen registrerte 2025 (Samordna-kode).',
 '1174-narvik': 'Ingen registrerte 2025 (Samordna-kode).', '1174-orkland': 'Ingen registrerte 2025.',
 '1174-sandnessjoen': 'Ingen registrerte 2025; Brreg har underenheten «Nord universitet studiested Sandnessjøen» uten gateadresse.',
 '1174-storen': 'Ingen registrerte 2025.', '1174-tromso': 'Ingen registrerte 2025.',
 '1175-sandvika': 'Ingen registrerte 2025.', '1175-stavanger': 'Ingen registrerte 2025.',
 '1210-trondheim': 'Ingen registrerte 2025.', '1220-tromso': 'Ingen registrerte 2025.',
 '1301-alta': 'Desentralisert (26 studenter 2025); adresse ikke dokumentert.',
 '1303-kristiansand': 'Forsvarets høgskole (56 studenter 2025); adresse ikke dokumentert.', '1303-ullensaker': 'Ingen registrerte 2025.',
 '1409-oslo': 'Ingen registrerte 2025.', '1412-lillehammer': 'Ikke funnet i Enhetsregisteret under dette navnet; adresse ikke kartlagt.',
 '1413-porsgrunn': 'Adresse ikke dokumentert.', '8208-sandnes': 'Ingen registrerte 2025.',
 '8224-kristiansund': 'Desentralisert DMMH-tilbud (77 studenter 2025); Brreg-adressen er usikker, ikke brukt.',
 '8224-orkanger': 'Ingen registrerte 2025.', '8224-alesund': 'Ingen registrerte 2025.',
 '8228-oslo': 'Ingen registrerte 2025; ikke funnet i Enhetsregisteret.', '8235-oslo': 'Ingen registrerte 2025; ikke funnet i Enhetsregisteret.',
 '8248-stavanger': 'Ingen registrerte 2025.',
}

import re as _re
def _hent(params, fn):
    if os.path.exists(fn): return json.load(open(fn))
    url = 'https://ws.geonorge.no/adresser/v1/sok?' + urllib.parse.urlencode(params)
    r = json.load(urllib.request.urlopen(url, timeout=30)); time.sleep(0.15)
    json.dump(r, open(fn, 'w'), ensure_ascii=False); return r

def geokod(gate, postnr):
    base = os.path.join(CACHE, f'{postnr}_{gate}'.replace('/', '_').replace(' ', '_'))
    m = _re.match(r'^(.*?)\s+(\d+)\s*([A-Za-z]?)$', gate)
    navn, nr, bokst = (m.group(1), int(m.group(2)), m.group(3).upper()) if m else (gate, None, '')
    norm = lambda s: s.lower().replace('vegen', 'veien').replace('veg', 'vei').replace(' ', '').replace('.', '')
    for i, params in enumerate([{'sok': gate, 'postnummer': postnr, 'treffPerSide': 10},
                                {'sok': gate, 'postnummer': postnr, 'treffPerSide': 10, 'fuzzy': 'true'}]):
        a = _hent(params, f'{base}_{i}.json').get('adresser') or []
        if nr is None: continue
        same = [x for x in a if x.get('nummer') == nr and norm(x['adressenavn'])[:6] == norm(navn)[:6]]
        exact = [x for x in same if (x.get('bokstav') or '').upper() == bokst]
        if exact: return exact[0], ('eksakt' if i == 0 else 'fuzzy: ' + exact[0]['adressetekst'])
        if same: return same[0], 'samme nummer, annen bokstav: ' + same[0]['adressetekst']
    return None, 'ingen treff'

ut = []; logg = []
for sid, s in steder.items():
    if s['type'] != 'sted': continue
    k = s['institusjon']; ii = I[k]
    rec = {'id': sid, 'navn': None, 'type': 'campus', 'institusjon': inst[k]['n'], 'institusjonKort': inst[k]['k'], 'eier': ii['eier'],
           'adresse': None, 'postnr': None, 'poststed': None, 'kommune': s['kommune'], 'kommunenr': s['kommunenummer'], 'fylke': s['fylke'],
           'lat': None, 'lon': None, 'nettside': ii['web'], 'epost': ii['ep'], 'telefon': ii['tlf'],
           'tilbyrEksamen': None, 'eksamenFor': None, 'tarImotAndre': None, 'eksamenskontorEpost': ii.get('eksep'),
           'digitalEksamen': ii['dig'], 'lokaler': None, 'studenter2025': s['registrerte']['2025'], 'merknad': None,
           'kilde': [], 'hentet': HENTET, 'sikkerhet': 'lav'}
    kilder = []
    if sid in C:
        navn, adr, pnr, psted, _, web, akilde, x = C[sid]
        rec['navn'] = navn; rec['nettside'] = web or rec['nettside']
        if akilde: kilder.append(akilde)
        if adr:
            hit, status = geokod(adr, pnr)
            rec['adresse'] = x.get('adressetekst', adr); rec['postnr'] = pnr; rec['poststed'] = psted
            if hit:
                rec['lat'] = round(hit['representasjonspunkt']['lat'], 6); rec['lon'] = round(hit['representasjonspunkt']['lon'], 6)
                kn = hit['kommunenummer']; rec['kommunenr'] = kn; rec['kommune'] = hit['kommunenavn'].title().replace('Og', 'og')
                rec['fylke'] = FYLKE.get(kn[:2], rec['fylke'])
                if hit['postnummer'] != pnr: logg.append(f'{sid}: postnr {pnr} -> Kartverket {hit["postnummer"]} {hit["adressetekst"]}')
                kilder.append('https://ws.geonorge.no/adresser/v1/sok?' + urllib.parse.urlencode({'sok': adr, 'postnummer': pnr}))
                rec['sikkerhet'] = 'høy' if not akilde.startswith(BRREG) else 'middels'
                if status != 'eksakt': logg.append(f'{sid}: Kartverket {status}')
            else:
                logg.append(f'{sid}: Kartverket fant ikke «{adr}, {pnr}»')
                rec['sikkerhet'] = 'middels' if not akilde.startswith(BRREG) else 'lav'
                rec['merknad'] = 'Adressen ble ikke funnet i Kartverkets adressesøk; koordinatene er omtrentlige (studiesteder.json).'
                if s.get('koordinater'): rec['lat'], rec['lon'] = s['koordinater']
        rec['tilbyrEksamen'] = x.get('tilbyr'); rec['tarImotAndre'] = x.get('andre'); rec['eksamenFor'] = x.get('for') or (['Egne studenter'] if x.get('tilbyr') else None)
        rec['lokaler'] = x.get('lokaler')
        if x.get('tlf'): rec['telefon'] = x['tlf']
        if x.get('ep2'): rec['epost'] = x['ep2'] + (f', {ii["ep"]}' if ii['ep'] and ii['ep'] != x['ep2'] else '')
        if 'eksep' in x: rec['eksamenskontorEpost'] = x['eksep']
        if x.get('merknad'): rec['merknad'] = ((rec['merknad'] + ' ') if rec['merknad'] else '') + x['merknad']
        kilder += x.get('kilder', [])
    else:
        rec['navn'] = f"{inst[k]['k']} {s['stedsnavn']}"
        rec['merknad'] = UTEN.get(sid, 'Adresse ikke kartlagt.')
        rec['lat'], rec['lon'] = s['koordinater'] if s.get('koordinater') else (None, None)
        rec['merknad'] += ' Koordinatene er omtrentlige (studiesteder.json, Kartverket stedsnavn/kommune), ikke en adresse.'
        kilder.append('data/marked/studiesteder/studiesteder.json')
    if ii['digk'] and rec['digitalEksamen']: kilder.append(ii['digk'])
    if ii['kk'] and ii['kk'] not in kilder: kilder.append(ii['kk'])
    if rec['tilbyrEksamen'] is None and rec['digitalEksamen'] and rec['studenter2025'] and sid in C and rec['adresse']:
        pass  # ikke dikt opp: tilbyrEksamen settes bare der en kilde bekrefter eksamenslokaler på stedet
    rec['kilde'] = list(dict.fromkeys(kilder))
    ut.append(rec)

ut.sort(key=lambda r: (-(r['lat'] or 0)))
meta = {'beskrivelse': 'Campus og studiesteder ved norske universiteter og høgskoler, med adresse, kontakt og eksamensinformasjon, som grunnlag for å finne samarbeidssteder for fysisk eksamen for NMBU.',
        'hentet': HENTET, 'antall': len(ut),
        'felt': {'tilbyrEksamen': 'true når en kilde bekrefter skriftlig skoleeksamen/eksamenslokaler på stedet, ellers null (ukjent)',
                 'tarImotAndre': 'true/false når institusjonen har en dokumentert regel for kandidater fra andre institusjoner på stedet, ellers null',
                 'eksamenFor': 'hvem stedet avvikler eksamen for, ifølge kilden',
                 'digitalEksamen': 'institusjonens digitale eksamenssystem ifølge egne nettsider (oktober 2026)',
                 'sikkerhet': 'høy = adresse fra institusjonens egen side og funnet hos Kartverket; middels = adresse fra Enhetsregisteret (Brreg) eller ikke vegadresse; lav = ingen adresse, koordinater fra studiesteder.json',
                 'kilde': 'liste over kilde-URL-er (adresse, Kartverket-oppslag, eksamensinformasjon)'},
        'kilder': {'adresser': 'Institusjonenes kontakt-/campussider, ellers Enhetsregisteret (data.brreg.no, underenheter)', 'koordinater': 'Kartverkets adressesøk (ws.geonorge.no/adresser/v1)',
                   'studenter2025': 'data/marked/studiesteder/studiesteder.json (DBH 124, høst 2025)'},
        'personvern': 'Bare organisasjonens kontaktinformasjon (sentralbord, felles e-post, eksamenskontorets fellesadresse). E-postadresser i Brreg som inneholder personnavn er utelatt.'}
json.dump({'meta': meta, 'campus': ut}, open(UT, 'w'), ensure_ascii=False, indent=1)
print(len(ut), 'poster'); print('\n'.join(logg))
from collections import Counter
print(Counter(r['sikkerhet'] for r in ut))
