#!/usr/bin/env python3
"""
Bygger datafila til HH-modulen «Studiesentre og eksamenssteder» (?studiesentre) fra kartleggingen i
data/marked/studiesentre/:

  nord.json       studiesentre og kompetansesentre fra Trøndelag og nordover
  sor.json        studiesentre og læringssentre fra Møre og Romsdal, Innlandet og sørover
  campus.json     campusene og studiestedene til universitetene og høgskolene (144 steder)
  ordninger.json  ordninger for eksamen et annet sted / for andre institusjoner

Skriver kilde/public/studiesentre/data.json (kompakt). Leser bare de ferdige filene, ingen nettkall.
Kjøring: python3 scripts/build-studiesentre.py   (status-og-metode §61)

For hvert sted settes:
  kat       studiesenter | campus | annet
  status    bekreftet  = avvikler eksamen og kilden bekrefter at kandidater fra andre institusjoner tas imot
            avvikler   = avvikler eksamen, men det er uklart for hvem
            nei        = kilden sier uttrykkelig at eksterne kandidater ikke tas imot (f.eks. HVL, UiA)
            ukjent     = ingen kilde om eksamen (null i kildefilene betyr ukjent, ikke nei)
  landsdel, km (luftlinje fra NMBU Ås), pris der den er oppgitt, og anbefalt (campus-rapporten §5 + tre studiesentre).

Personvern: bare felles kontaktinformasjon. Skriptet stopper hvis en e-postadresse ser personlig ut (fornavn.etternavn@)
og ikke står på hvitelisten over kjente fellesadresser.
"""
import json
import math
import re
import sys
from pathlib import Path

ROT = Path(__file__).resolve().parent.parent
D = ROT / 'data' / 'marked' / 'studiesentre'
UT = ROT / 'kilde' / 'public' / 'studiesentre' / 'data.json'
MAKS_BYTE = 600_000
AS = (59.6664, 10.7681)  # NMBU campus Ås

# ── Personvern ──────────────────────────────────────────────────────────────
PERSONLIG = re.compile(r'^[a-zæøå]+\.[a-zæøå]+@', re.I)
EPOST = re.compile(r'[\w.+-]+@[\w-]+(?:\.[\w-]+)+')
# Fellesadresser som har formen «ord.ord@», kontrollert manuelt 17.10.2026 (servicetorg, karrieresentre, FHS).
HVITELISTE = {
    'fhs.kontakt@mil.no',
    'ki.gd@innlandetfylke.no', 'ki.hadeland@innlandetfylke.no', 'ki.no@innlandetfylke.no', 'ki.so@innlandetfylke.no',
    'ki.valdres@innlandetfylke.no',
    'servicetorg.bo@usn.no', 'servicetorg.hallingdal@usn.no', 'servicetorg.kongsberg@usn.no', 'servicetorg.notodden@usn.no',
    'servicetorg.ringerike@usn.no', 'servicetorg.vestfold@usn.no',
}

# ── Kategori, landsdel ──────────────────────────────────────────────────────
KATEGORI = {
    'campus': 'campus',
    'studiesenter': 'studiesenter', 'læringssenter': 'studiesenter',
    'kunnskapspark': 'annet', 'kompetansesenter': 'annet', 'voksenopplæring': 'annet', 'annet': 'annet',
}
LANDSDEL = {
    'Finnmark': 'Nord-Norge', 'Troms': 'Nord-Norge', 'Nordland': 'Nord-Norge', 'Svalbard': 'Nord-Norge',
    'Trøndelag': 'Trøndelag',
    'Møre og Romsdal': 'Vestlandet', 'Vestland': 'Vestlandet', 'Rogaland': 'Vestlandet',
    'Agder': 'Sørlandet',
    'Telemark': 'Østlandet', 'Vestfold': 'Østlandet', 'Buskerud': 'Østlandet', 'Akershus': 'Østlandet', 'Oslo': 'Østlandet',
    'Østfold': 'Østlandet', 'Innlandet': 'Østlandet',
}
LANDSDELER = ['Nord-Norge', 'Trøndelag', 'Vestlandet', 'Sørlandet', 'Østlandet']

# ── Dubletter: sor.json har fire universitetscampuser som også står i campus.json. De slås sammen inn i campusposten. ──
SOR_TIL_CAMPUS = {
    'usn-hallingdal-gol': '1176-hallingdal',
    'hvl-haugesund': '0238-haugesund',
    'hvl-forde-sunnfjord': '0238-forde',
    'hvl-sogndal': '0238-sogndal',
}

# ── Uttrykkelig nei på institusjonsnivå (gjelder alle campusene) ────────────
INSTITUSJON_NEI = {
    'HVL': ('HVL skriver at eksamen i campuslokalene er for HVL-studenter, og at eksterne studenter ikke kan ta eksamen der.',
            'https://www.hvl.no/student/eksamen/'),
}

# ── Studiesentre der teksten (ikke feltet eksamenFor) bekrefter kandidater fra andre institusjoner ──
TEKST_BEKREFTER = {
    'ssmt-finnsnes-senja': 'Eksamenssiden: studenter kan avlegge eksamen ved senteret mot egenandel; studenten søker selv sin institusjon om ekstern eksamen. UiT bruker senteret som godkjent eksamenssted.',
    'tsh-tynset': 'Senteret skriver at studenter kan avlegge eksamen der selv om de studerer ved et annet studiested, skriftlig og muntlig, etter eksamensreglementet.',
    'kirkenes-kompetansesenter-sor-varanger': '«Vi arrangerer eksamen for utdanningsinstitusjoner, høgskoler og universitet» (eksamenssiden, datert 2009). Uklart om tilbudet gjelder i dag.',
}

# ── Priser (kontrollert mot kildeteksten: tallet må stå i merknaden eller eksamenFor) ──
PRIS = {
    'ssmt-finnsnes-senja': (600, '600 kr per student per eksamen. Betales av studenten (egenandel til senteret).'),
    'campus-nord-troms-nordreisa': (750, '750 kr per student per eksamen for studenter fra andre institusjoner, betalt av studenten (administrasjon og tilrettelegging). Gratis for UiT-studenter. Kilde: campusnt.no; den eldre NTSS-siden med 500/800 kr er utdatert.'),
    'kirkenes-kompetansesenter-sor-varanger': (650, '650 kr per student per eksamen pluss eksamensvakt og porto (opplysning fra 2009, ikke bekreftet i dag).'),
}
USN_PRIS = (2500, '2 500 kr per student per eksamen pluss ev. eksamensvakt. Betales av studenten ved den andre institusjonen (merknadene til USNs forskrift § 7-17 (5)).')

# ── Anbefalte samarbeidssteder: campus-rapporten §5 (13 + reserve) og de tre studiesentrene som bekrefter eksamen for andre ──
ANBEFALT = {
    '1130-alta': (1, 'anbefalt', 'Finnmark', 'Eksamenslokaler på campus (uit.no/eksamen). UiT har allerede et nett av godkjente eksamenssteder i Nord-Norge. Ingen regel for andres kandidater, så det krever en avtale.', None),
    '1130-tromso': (2, 'anbefalt', 'Troms', 'Største studiested i nord med faste eksamenslokaler (Kraft sportssenter, Administrasjonsbygget og Teorifagbygget). Krever avtale.', None),
    '1130-harstad': (3, 'anbefalt', 'Sør-Troms, Ofoten og Vesterålen', 'Eksamenslokaler i Havnegata 1 og 5. Ingen regel for andres kandidater.', None),
    '1174-bodo': (4, 'anbefalt', 'Salten', 'Nords hovedcampus. UiT bruker Torggården ved campus til eksamen. Nord-forskriften åpner for egne avtaler. WISEflow fra 1.9.2026.', None),
    '1174-mo-i-rana': (5, 'anbefalt', 'Helgeland', 'Campus Helgeland er allerede delt mellom Nord, UiT og Kunnskapsparken Helgeland, og UiT bruker stedet til eksamen.', None),
    '1150-trondheim': (6, 'anbefalt', 'Trøndelag', 'Egne eksamenshus (Sluppen), og NTNU avvikler fjerneksamen for utenlandske universiteter. NTNU er restriktiv overfor andre, så BI Trondheim er alternativet. Inspera, ikke WISEflow.', 'BI Trondheim (Brattørkaia 16)'),
    '0232-molde': (7, 'anbefalt', 'Møre og Romsdal', 'Skoleeksamen med WISEflow fra april 2026. Campus Kristiansund kan brukes i tillegg. Ingen regel for andres kandidater.', 'Campus Kristiansund'),
    '1120-bergen': (8, 'anbefalt', 'Hordaland', 'Etablert rutine for andre institusjoners eksamener («ekstern eksamen»), i dag bare for utvekslingsstudenter med studierett ved UiB.', 'HVL Bergen'),
    '1160-stavanger': (9, 'anbefalt', 'Rogaland', 'Skoleeksamen ved UiS, hovedsakelig WISEflow. Ingen regel for andres kandidater.', 'BI Stavanger'),
    '1171-kristiansand': (10, 'anbefalt', 'Agder', 'Egne eksamenslokaler. UiA avholder fra 1.1.2025 ikke lenger generelt eksamen for andre, så det må bli en institusjonsavtale.', 'NLA Gimlekollen eller Ansgar'),
    '1176-porsgrunn': (11, 'anbefalt', 'Telemark (Grenland), Buskerud og Vestfold', 'USN er den sikreste partneren: forskriftsfestet rett til å søke for andres kandidater, 2 500 kr per kandidat pluss vakt, og det gjelder alle USN-campusene.', 'Alle USN-campuser'),
    '1177-lillehammer': (12, 'anbefalt', 'Innlandet', 'Eksamenssted for INNs egne nettstudenter i bedriftsøkonomi. INN er selv restriktiv, så det må bli en institusjonsavtale.', 'INN Rena'),
    '0256-halden': (13, 'reserve', 'Østfold (reserve)', 'HiØ tar dokumentert imot kandidater fra andre norske læresteder til skriftlig eksamen i Halden, men ligger nær Ås. Mest aktuelt som pilot eller modell.', None),
    'campus-nord-troms-nordreisa': (14, 'studiesenter', 'Nord-Troms', 'Studiesenteret avvikler lokal eksamen for studenter fra alle norske institusjoner som tillater det, og er godkjent eksamenssted for UiT. Svært relevant som modell.', None),
    'ssmt-finnsnes-senja': (15, 'studiesenter', 'Midt-Troms', 'Tilbyr lokaler og tilrettelegging for eksamen for 600 kr per eksamen, og er godkjent eksamenssted for UiT. Auditorier og undervisningsrom i Kunnskaps- og Næringsparken Senja.', None),
    'tsh-tynset': (16, 'studiesenter', 'Nord-Østerdal', 'Skriver at studenter fra andre studiesteder kan avlegge eksamen der, skriftlig og muntlig. Lokaler i Nord-Østerdal videregående skole.', None),
}

# Nedgradert etter kontroll 17.10.2026: «bekreftet» skal bety at NMBU-studenter kan tas imot i dag.
NEDGRADER = {
    'kirkenes-kompetansesenter-sor-varanger': 'Eksamenssiden er fra 2009; ordningen er ikke bekreftet i dag.',
    '1150-trondheim': 'NTNU avvikler fjerneksamen bare for utenlandske universiteter og egne utvekslingsstudenter, ikke for norske institusjoners studenter.',
    '1120-bergen': 'UiBs «ekstern eksamen» gjelder bare utvekslingsstudenter med studierett ved UiB, ikke andre norske institusjoners studenter.',
}

STATUS_TEKST = {
    'bekreftet': 'Bekreftet for andre institusjoner',
    'avvikler': 'Avvikler eksamen (uklart for hvem)',
    'nei': 'Ingen eksamen for eksterne',
    'ukjent': 'Ukjent',
}


def les(navn: str):
    with open(D / navn, encoding='utf-8') as f:
        return json.load(f)


def km(lat, lon):
    if lat is None or lon is None:
        return None
    r = 6371.0
    p1, p2 = math.radians(AS[0]), math.radians(lat)
    dp, dl = p2 - p1, math.radians(lon - AS[1])
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(2 * r * math.asin(math.sqrt(a)))


def eksterne(eksamen_for):
    """Linjene i eksamenFor som gjelder andre enn egne studenter."""
    return [e for e in (eksamen_for or []) if not e.lower().startswith('egne studenter')]


def status_campus(c):
    kort = c.get('institusjonKort')
    if c.get('tarImotAndre') is False:
        return 'nei', 'Institusjonen tar ikke imot kandidater fra andre institusjoner på dette stedet (kilden: ' + ('; '.join(c.get('eksamenFor') or []) or 'eksamenssiden') + ').'
    if kort in INSTITUSJON_NEI:
        return 'nei', INSTITUSJON_NEI[kort][0]
    if c.get('tilbyrEksamen') and c.get('tarImotAndre'):
        return 'bekreftet', 'Skriftlig regel for kandidater fra andre institusjoner: ' + '; '.join(eksterne(c.get('eksamenFor')))
    if c.get('tilbyrEksamen'):
        return 'avvikler', 'Skoleeksamen på stedet er bekreftet, men ingen regel for kandidater fra andre institusjoner er funnet.'
    return 'ukjent', 'Ingen kilde om eksamen på stedet.'


def status_senter(s):
    if s.get('tilbyrEksamen') is False:
        return 'nei', 'Kilden sier at eksterne kandidater ikke kan ta eksamen her.'
    if s.get('tilbyrEksamen') and s['id'] in TEKST_BEKREFTER:
        return 'bekreftet', TEKST_BEKREFTER[s['id']]
    if s.get('tilbyrEksamen') and s.get('eksamenFor'):
        return 'bekreftet', 'Avvikler eksamen for ' + ', '.join(s['eksamenFor']) + ' og andre institusjoner som tillater lokal eksamen.'
    if s.get('tilbyrEksamen'):
        return 'avvikler', 'Kilden nevner eksamen på stedet, men ikke hvilke institusjoner eller kandidater det gjelder.'
    return 'ukjent', 'Eksamen er ikke nevnt i kildene.'


def post(r, kilde_fil):
    kat = KATEGORI.get(r['type'])
    if kat is None:
        sys.exit(f'Ukjent type «{r["type"]}» i {kilde_fil} ({r["id"]})')
    st, grunn = status_campus(r) if kat == 'campus' else status_senter(r)
    if r['id'] in NEDGRADER and st == 'bekreftet':
        st, grunn = 'avvikler', NEDGRADER[r['id']] + ' ' + grunn
    fylke = r.get('fylke')
    if fylke not in LANDSDEL:
        sys.exit(f'Ukjent fylke «{fylke}» i {kilde_fil} ({r["id"]})')
    kilder = list(r.get('kilde') or [])
    if kat == 'campus' and r.get('institusjonKort') in INSTITUSJON_NEI and INSTITUSJON_NEI[r['institusjonKort']][1] not in kilder:
        kilder.append(INSTITUSJON_NEI[r['institusjonKort']][1])
    pris = PRIS.get(r['id'])
    if pris and not (str(pris[0]) in (r.get('merknad') or '') + json.dumps(r.get('eksamenFor'), ensure_ascii=False)):
        sys.exit(f'Prisen {pris[0]} kr for {r["id"]} står ikke i kildeteksten')
    if not pris and kat == 'campus' and any('2 500 kr' in e for e in (r.get('eksamenFor') or [])):
        pris = USN_PRIS
    a = ANBEFALT.get(r['id'])
    return {
        'id': r['id'],
        'navn': r['navn'],
        'kat': kat,
        'type': r['type'],
        'inst': r.get('institusjon'),
        'instKort': r.get('institusjonKort'),
        'eier': r.get('eier'),
        'adresse': r.get('adresse'), 'postnr': r.get('postnr'), 'poststed': r.get('poststed'),
        'kommune': r.get('kommune'), 'fylke': fylke, 'landsdel': LANDSDEL[fylke],
        'lat': r.get('lat'), 'lon': r.get('lon'), 'km': km(r.get('lat'), r.get('lon')),
        'nettside': r.get('nettside'), 'epost': r.get('epost'), 'telefon': r.get('telefon'),
        'eksamensEpost': r.get('eksamenskontorEpost'),
        'status': st, 'statusGrunn': grunn,
        'tilbyrEksamen': r.get('tilbyrEksamen'), 'tarImotAndre': r.get('tarImotAndre'),
        'eksamenFor': r.get('eksamenFor'),
        'digital': r.get('digitalEksamen'),
        'lokaler': r.get('lokaler'),
        'studietilbud': r.get('studietilbud') or None,
        'studenter2025': r.get('studenter2025'),
        'prisKr': pris[0] if pris else None, 'pris': pris[1] if pris else None,
        'merknad': r.get('merknad'),
        'merknad2': None,
        'kilde': kilder, 'hentet': r.get('hentet'), 'sikkerhet': r.get('sikkerhet'),
        'kildefil': kilde_fil,
        'anbefalt': {'nr': a[0], 'rolle': a[1], 'omrade': a[2], 'begrunnelse': a[3], 'alternativ': a[4]} if a else None,
        'sammeSted': [],
    }


def main():
    nord, sor = les('nord.json'), les('sor.json')
    campus_fil, ordn_fil = les('campus.json'), les('ordninger.json')
    campus = campus_fil['campus']

    # Personvernsjekk på alt som leses (også fritekst og ordningene)
    feil = sorted({e for e in EPOST.findall(json.dumps([nord, sor, campus, ordn_fil], ensure_ascii=False))
                   if PERSONLIG.match(e) and e.lower() not in HVITELISTE})
    if feil:
        sys.exit('Stoppet: e-postadresser som ser personlige ut (fornavn.etternavn@), legg dem på hvitelisten bare hvis de er '
                 'fellesadresser: ' + ', '.join(feil))

    steder = [post(c, 'campus.json') for c in campus]
    per_id = {s['id']: s for s in steder}
    for fil, liste in (('nord.json', nord), ('sor.json', sor)):
        for r in liste:
            if r['id'] in SOR_TIL_CAMPUS:
                c = per_id[SOR_TIL_CAMPUS[r['id']]]
                if km(r['lat'], r['lon']) is not None and c['lat'] is not None:
                    avstand = math.dist((r['lat'], r['lon'] * math.cos(math.radians(r['lat']))), (c['lat'], c['lon'] * math.cos(math.radians(c['lat'])))) * 111
                    if avstand > 2:
                        sys.exit(f'{r["id"]} og {c["id"]} ligger {avstand:.1f} km fra hverandre; sjekk sammenslåingen')
                c['merknad2'] = r['merknad']
                c['kilde'] += [k for k in r['kilde'] if k not in c['kilde']]
                if not c['lokaler'] and r.get('lokaler'):
                    c['lokaler'] = r['lokaler']
                if r.get('tilbyrEksamen') is False and c['status'] != 'nei':
                    sys.exit(f'{r["id"]} sier nei, men {c["id"]} har status {c["status"]}')
                continue
            if r['id'] in per_id:
                sys.exit(f'Duplikat-id {r["id"]}')
            s = post(r, fil)
            steder.append(s)
            per_id[s['id']] = s

    mangler = [i for i in ANBEFALT if i not in per_id]
    if mangler:
        sys.exit('Anbefalte steder finnes ikke i dataene: ' + ', '.join(mangler))

    # Steder i samme bygg eller rett ved hverandre (under 300 m), f.eks. UiT-eksamensstedet og Studiesenteret Midt-Troms.
    # Steder med omtrentlige koordinater (sikkerhet «lav», kommunepunktet) er holdt utenfor.
    med = [s for s in steder if s['lat'] is not None]
    noyaktige = [s for s in med if s['sikkerhet'] != 'lav']
    for i, a in enumerate(noyaktige):
        for b in noyaktige[i + 1:]:
            dy = (a['lat'] - b['lat']) * 111.2
            dx = (a['lon'] - b['lon']) * 111.2 * math.cos(math.radians(a['lat']))
            if math.hypot(dx, dy) < 0.3:
                a['sammeSted'].append(b['id'])
                b['sammeSted'].append(a['id'])

    # Nord til sør; steder uten koordinater sist
    steder.sort(key=lambda s: (s['lat'] is None, -(s['lat'] or 0), s['navn']))

    telling = {
        'steder': len(steder),
        'medKoordinater': len(med),
        'kat': {k: sum(s['kat'] == k for s in steder) for k in ('studiesenter', 'campus', 'annet')},
        'status': {k: sum(s['status'] == k for s in steder) for k in STATUS_TEKST},
        'katStatus': {k: {st: sum(s['kat'] == k and s['status'] == st for s in steder) for st in STATUS_TEKST} for k in ('studiesenter', 'campus', 'annet')},
        'landsdel': {l: sum(s['landsdel'] == l for s in steder) for l in LANDSDELER},
        'anbefalt': sum(s['anbefalt'] is not None for s in steder),
        'medPris': sum(s['prisKr'] is not None for s in steder),
        'sammenslatt': len(SOR_TIL_CAMPUS),
    }
    priser = sorted({s['prisKr'] for s in steder if s['prisKr'] is not None})
    ut = {
        'hentet': campus_fil['meta'].get('hentet') or '2026-10-17',
        'as': {'lat': AS[0], 'lon': AS[1]},
        'statusTekst': STATUS_TEKST,
        'landsdeler': LANDSDELER,
        'telling': telling,
        'priser': {'min': priser[0], 'maks': priser[-1]} if priser else None,
        'steder': steder,
        'ordninger': ordn_fil['ordninger'],
        'kilder': {
            'campus': campus_fil['meta'].get('kilder'),
            'personvern': campus_fil['meta'].get('personvern'),
        },
    }
    tekst = json.dumps(ut, ensure_ascii=False, separators=(',', ':'))
    if len(tekst.encode('utf-8')) > MAKS_BYTE:
        sys.exit(f'data.json ble {len(tekst.encode("utf-8"))} byte (grense {MAKS_BYTE})')
    UT.parent.mkdir(parents=True, exist_ok=True)
    UT.write_text(tekst, encoding='utf-8')
    print(f'Skrev {UT.relative_to(ROT)} ({len(tekst.encode("utf-8")) / 1000:.0f} kB): {len(steder)} steder, {len(ut["ordninger"])} ordninger')
    print('  kategori:', telling['kat'])
    print('  status:  ', telling['status'])
    for k, v in telling['katStatus'].items():
        print(f'    {k}: {v}')
    print('  landsdel:', telling['landsdel'])
    print(f'  anbefalt: {telling["anbefalt"]}, med pris: {telling["medPris"]} ({priser}), sammenslått fra sor.json: {telling["sammenslatt"]}')


if __name__ == '__main__':
    main()
