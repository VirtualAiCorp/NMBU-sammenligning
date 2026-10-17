"""Hvilke Samordna-program og DBH-program (lokalt opptak) som er med, og hvordan de klassifiseres.

Samordna: alle program med utdanningstype «Økonomisk-administrative fag» pluss en håndplukket liste fra andre
utdanningstyper (EKSTRA). Nivå fra Samordnas katalog (studyProgrammeType + numCredits): Bachelor -> bachelor,
Master/Profesjonsstudium 300 sp -> femårig, Årsstudium -> årsstudium (egen fil).
"""
import re

# studiekode -> (fagområde, grensetilfelle, merknad)
EKSTRA = {
    "203526": ("økonomi og jus", False, "Juridiske fag hos Samordna."),
    "222867": ("økonomi og jus", False, "Juridiske fag hos Samordna."),
    "184540": ("finans", True, "Realfag hos Samordna; femårig integrert master (aktuarfag)."),
    "185381": ("finans", True, "Realfag hos Samordna (matematikkprogram med finans og forsikring)."),
    "185862": ("finans", True, "Realfag hos Samordna; nedlagt etter 2023 (erstattet av 185381)."),
    "184306": ("økonomi og IT", True, "Realfag hos Samordna; med i HH-programkartet (ØLIT)."),
    "185370": ("økonomi og IT", False, "Informasjonsteknologi hos Samordna; med i HH-programkartet (ØLIT)."),
    "194422": ("økonomi og IT", False, "Informasjonsteknologi hos Samordna; med i HH-programkartet (ØLIT)."),
    "222955": ("økonomi og IT", False, "Informasjonsteknologi hos Samordna; med i HH-programkartet (ØLIT)."),
    "201260": ("økonomi og IT", True, "IT-program; med i HH-programkartet (ØLIT) som svakere sammenligning."),
    "222395": ("økonomi og IT", True, "IT-program; med i HH-programkartet (ØLIT) som svakere sammenligning."),
    "222449": ("økonomi og IT", True, "IT-program (samme program som 222395, studiested Bø)."),
    "222453": ("økonomi og IT", True, "IT-program (samme program som 222395, studiested Vestfold); siste opptak 2021."),
    "224453": ("økonomi og IT", True, "IT-program; med i HH-programkartet (ØLIT) som svakere sammenligning."),
    "184803": ("økonomi og IT", True, "Sivilingeniør (femårig) i IT og økonomi."),
    "194470": ("logistikk og shipping", False, "Teknologiske fag – maritime hos Samordna."),
    "222044": ("logistikk og shipping", False, "Teknologiske fag – maritime hos Samordna."),
    "203330": ("reiseliv og hotell", True, "Reiselivsfag hos Samordna (Handelshøgskulen HVL)."),
    "217255": ("reiseliv og hotell", True, "Reiselivsfag hos Samordna (Norsk hotellhøgskole, Handelshøyskolen ved UiS)."),
    "217317": ("reiseliv og hotell", True, "Reiselivsfag hos Samordna; siste opptak 2024."),
    "217470": ("markedsføring og service", False, "Reiselivsfag hos Samordna; med i HH-programkartet (ØLIT)."),
    "217525": ("markedsføring og service", False, "Reiselivsfag hos Samordna; samme DBH-program som 217470."),
    "209317": ("reiseliv og hotell", True, "Reiselivsfag hos Samordna; siste opptak 2022."),
    "209319": ("reiseliv og hotell", True, "Reiselivsfag hos Samordna; siste opptak 2022."),
    "209591": ("reiseliv og hotell", True, "Reiselivsfag hos Samordna; siste opptak 2023."),
    "209479": ("filosofi, politikk og økonomi", True, "Historiefag hos Samordna."),
    "185588": ("filosofi, politikk og økonomi", True, "Historiefag hos Samordna."),
    "185892": ("språk og økonomi", True, "Språkfag hos Samordna; nytt 2026."),
    "150486": ("sport management", True, "Idrettsfag hos Samordna."),
    "211488": ("sport management", True, "Samfunnsfag hos Samordna."),
    "224895": ("innovasjon og entreprenørskap", True, "Teknologiske fag – annet hos Samordna."),
    "211841": ("administrasjon og ledelse", True, "Samfunnsfag hos Samordna (politikk, juss og administrasjon)."),
    "204903": ("administrasjon og ledelse", False, "Samfunnsfag hos Samordna; HRM i Mo i Rana, siste opptak 2021 (samme DBH-program som 204591/204955)."),
    "192230": ("eiendom", False, "Samfunnsfag hos Samordna; femårig master i eiendom ved NMBU."),
}

# Fagområde ut fra navn (rekkefølgen betyr noe)
FAG = [
    (r"sport management|idrettsledelse", "sport management"),
    (r"music business|musikk", "kultur- og musikkledelse"),
    (r"samfunnsøkonomi|økonomi og datavitenskap|økonomi og finans", "samfunnsøkonomi"),
    (r"siviløkonom", "økonomi og administrasjon"),
    (r"økonomi og administrasjon|bedriftsøkonomi|business administration|økonomi og ledelse|økonomi, ledelse og bærekraft"
     r"|økonomi, administrasjon og internasjonal|bærekraftsøkonomi|business, economics", "økonomi og administrasjon"),
    (r"regnskap|revisjon|revisor", "regnskap og revisjon"),
    (r"finans", "finans"),
    (r"eiendom", "eiendom"),
    (r"logistikk|supply chain|shipping|skipsfart|innkjøp", "logistikk og shipping"),
    (r"entrepren|innovasjon|forretningsutvikling|nyskaping|kreativ næring|kreativitet", "innovasjon og entreprenørskap"),
    (r"digital|data science|informatikk|\bit\b|teknologi|e-business", "økonomi og IT"),
    (r"marked|salg|merkevare|kommunikasjon|\bpr\b|varehandel|retail|handel|service", "markedsføring og kommunikasjon"),
    (r"reiseliv|hotell|turisme|opplevelse", "reiseliv og hotell"),
    (r"hr\b|human resource|personal|organisasjon|ledelse|management|administrasjon|planlegging", "administrasjon og ledelse"),
    (r"jus|juss", "økonomi og jus"),
    (r"økonomi", "økonomi og administrasjon"),
]


def fagomraade(navn):
    n = navn.lower()
    for pat, f in FAG:
        if re.search(pat, n):
            return f
    return "annet"


def type_av(fag, navn, hh_grupper=()):
    """BØA / samf. / annet. BØA = økonomi og administrasjon, siviløkonom og de generelle «økonomi og ledelse»-bachelorene
    (USN, NTNU Gjøvik, BI, Kristiania) som HH-programkartet også regner som ØA-konkurrenter."""
    n = navn.lower()
    if fag == "samfunnsøkonomi":
        return "samf."
    if "oa" in hh_grupper:
        return "BØA"
    if re.search(r"økonomi og administrasjon|siviløkonom|business administration|business, economics|"
                 r"^(bachelor i )?økonomi og ledelse|økonomi, administrasjon og internasjonal", n) and "jus" not in n:
        return "BØA"
    return "annet"


def niva_av(kat_poster, navn):
    typer = {(p["studyProgrammeType"]["name"], p.get("numCredits")) for p in kat_poster}
    if any(t == "Bachelor" for t, _ in typer):
        return "bachelor"
    if any(t in ("Master", "Profesjonsstudium") for t, _ in typer):
        return "femårig"
    if any(t == "Årsstudium" for t, _ in typer):
        return "årsstudium"
    n = navn.lower()
    if "årsstudium" in n:
        return "årsstudium"
    if "master" in n or "siviløkonom" in n:
        return "femårig"
    return "bachelor"


def utvalg(so, kat):
    """studiekode -> {niva, fag, type, grensetilfelle, merknad}"""
    ut = {}
    for k, p in so.items():
        okadm = p["utdanningstype"] == "Økonomisk-administrative fag"
        if not okadm and k not in EKSTRA:
            continue
        poster = list(kat.get(k, {}).values())
        navn = p["navn"][-1]
        niva = niva_av(poster, navn)
        if k in EKSTRA:
            fag, grense, merk = EKSTRA[k]
        else:
            fag, grense, merk = fagomraade(navn), False, None
        ut[k] = {"niva": niva, "fag": fag, "type": type_av(fag, navn), "grensetilfelle": grense, "merknad": merk}
    return ut
