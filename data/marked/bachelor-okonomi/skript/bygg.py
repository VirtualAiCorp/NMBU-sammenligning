"""Bygger data/marked/bachelor-okonomi/programmer.json (+ arsstudier.json, dbh_uten_opptak.json, topp15.json).

Kjør etter hent_347.py, hent_347_alle.py, hent_379.py, hent_123_104.py, hent_124.py og kobling.py:
  python3 bygg.py
"""
import gzip
import json
import os
import re
from collections import defaultdict

from felles import (AAR_DBH, AAR_PG, AAR_SO, KILDER, KORT, PRIVATE, ROOT, SAMME_INST, SO_INST, UT, les_123_104, les_347,
                    les_379, les_katalog, les_poenggrenser, les_so_sokertall, norm)
from kobling import okonomi_dbh, tok
from utvalg import fagomraade, type_av, utvalg

HENTET = "2026-10-17"

# Institusjoner uten Samordna-opptak der alle økonomiprogram (NUS 64/634 eller studium ØA) tas med
LOKALE_INST = {"8241", "8253", "1407", "8247"}
# Program ved disse som har annen NUS-kode, men hører hjemme i landskapet (alle merket grensetilfelle)
DBH_EKSTRA = {
    ("8253", "2110"): "økonomi og IT", ("8253", "2110-B"): "økonomi og IT", ("8253", "21101"): "økonomi og IT",
    ("8253", "21101-B"): "økonomi og IT", ("8253", "2115"): "markedsføring og kommunikasjon",
    ("8253", "BRO"): "økonomi og IT", ("8253", "BTM"): "økonomi og IT", ("8253", "BSI"): "markedsføring og kommunikasjon",
    ("8253", "BHI"): "sport management", ("1407", "BHR_N"): "administrasjon og ledelse",
    ("1407", "BHR_S"): "administrasjon og ledelse", ("1407", "PSY-HR_N"): "administrasjon og ledelse",
    ("1407", "PSY-HR_S"): "administrasjon og ledelse",
}
# Uspesifiserte/fritt sammensatte bachelorkoder som ikke er program i vanlig forstand
UTELATT = {("8241", "DIP"), ("1174", "BASELVHHN"), ("1174", "BASELVHHN2"), ("0264", "B3FRI2017"), ("0264", "B3FRI8"),
           ("1177", "B3FRI2017"), ("1177", "B3FRI8")}
INST_NAVN = {
    "8241": "Handelshøyskolen BI", "8253": "Høyskolen Kristiania", "1407": "Oslo Nye Høyskole",
    "8247": "Høgskulen for grøn utvikling",
}
ALIAS = {"ringerike": ["hønefoss", "ringerike"], "hønefoss": ["hønefoss", "ringerike"], "midt-telemark": ["bø"],
         "horten": ["vestfold"], "åmot": ["rena"], "rena": ["rena"], "harstad - hárstták": ["harstad"],
         "oslo": ["oslo", "pilestredet", "staffeldtsgate", "adamstuen"], "bergen": ["bergen"],
         "trondheim": ["trondheim", "gløshaugen", "dragvoll", "moholt", "kalvskinnet", "øya", "tunga", "tyholt",
                       "lerkendal", "solsiden"], "kristiansand": ["kristiansand", "gimlekollen"],
         "stavanger": ["stavanger"], "ås": ["ås"]}


def les_124():
    ut = defaultdict(lambda: defaultdict(dict))  # (inst, kode) -> år -> {campus: antall}
    for y in AAR_DBH:
        p = os.path.join(KILDER, "dbh", f"124_{y}.json.gz")
        for r in json.load(gzip.open(p, "rt", encoding="utf-8"))["data"]:
            n = int(r.get("Antall") or 0)
            if n:
                ut[(r["Institusjonskode"], r["Studieprogramkode"])][y][r["Stednavn campus"]] = n
    return ut


def campus_treff(steder, campus):
    c = campus.lower()
    for s in steder:
        s = (s or "").lower()
        for a in ALIAS.get(s, [s]):
            if a and a in c:
                return True
    return False


def hh_oppslag():
    pk = json.load(open(os.path.join(ROOT, "data/hh/programkart.json"), encoding="utf-8"))
    dk = json.load(open(os.path.join(ROOT, "data/hh/dbh-programkart.json"), encoding="utf-8"))
    dbh = {p["entryId"]: p for p in dk["programs"]}
    paa_so, paa_dbh = defaultdict(list), defaultdict(list)
    for g in pk["groups"]:
        for p in g["programs"]:
            m = dbh.get(p["id"], {})
            info = {"gruppe": g["id"], "gruppenavn": g["label"], "entryId": p["id"], "default": p.get("default", False),
                    "programnavnHH": p["programnavn"], "studiekodeHH": p.get("studiekode"),
                    "dbhKoderHH": m.get("studieprogramkoder") or []}
            if p.get("studiekode"):
                paa_so[p["studiekode"]].append(info)
            for inst in (m.get("institusjonskoder") or [m.get("institusjonskode")]):
                for c in m.get("studieprogramkoder") or []:
                    paa_dbh[(inst, c)].append(info)
    return paa_so, paa_dbh


def serie(d, aar):
    return {y: d[y] for y in aar if d.get(y) is not None}


def main():
    so = les_so_sokertall()
    kat = les_katalog()
    pg = les_poenggrenser()
    r347 = les_347()
    r379 = les_379()
    r123 = les_123_104()
    r124 = les_124()
    valgt = utvalg(so, kat)
    kobling = json.load(open(os.path.join(KILDER, "kobling_so_dbh.json"), encoding="utf-8"))
    hh_so, hh_dbh = hh_oppslag()

    # Hvilke SO-program deler hver DBH-kode (per år)
    deling = defaultdict(set)
    for k, v in kobling.items():
        for d in v["dbh"]:
            deling[(d["inst"], d["kode"])].add(k)
    koblet_dbh = set(deling)

    # Forgjengerkoder: økonomikoder (B3/B4/M5) uten opptak 2021–2025, men med studenter, ved samme institusjon
    # og med samme normaliserte navn som en koblet kode. Brukes bare for registrerte/kandidater, merket usikker.
    def har_opptak(key):
        return any(t.get("alle", 0) or t.get("fv", 0) for y in AAR_DBH for t in r379.get(key, {}).get(y, {}).values())

    forgjenger_so = defaultdict(list)  # SO-kode -> [(inst, kode)]

    def so_steder(x):
        st = [p.get("teachingLocation", {}).get("name") for p in kat.get(x, {}).values()]
        return [s for s in st if s] + so[x]["steder"]
    uten_opptak = []
    for key, p in r347.items():
        rad = p["rad"]
        if rad["Nivåkode"] not in ("B3", "B4", "M5") or not okonomi_dbh(rad) or key in koblet_dbh or key in UTELATT:
            continue
        if key[0] in LOKALE_INST or har_opptak(key):
            continue
        stud = r123.get(key, {"reg": {}, "kand": {}})
        if not any(stud["reg"].values()) and not any(stud["kand"].values()):
            continue
        n = norm(rad["Studieprogramnavn"])
        inst = SAMME_INST.get(key[0], key[0])
        kand = [k2 for k2 in koblet_dbh if SAMME_INST.get(k2[0], k2[0]) == inst
                and norm(r347.get(k2, {}).get("rad", {}).get("Studieprogramnavn", "")) == n]
        # skill på campus der koden har campus i 124
        camp = {c for y in AAR_DBH for c in r124.get(key, {}).get(y, {})}
        if len(kand) > 1 and camp:
            k3 = [k2 for k2 in kand if {c for y in AAR_DBH for c in r124.get(k2, {}).get(y, {})} & camp]
            kand = k3 or kand
        rec = {"inst": key[0], "kode": key[1], "navn": rad["Studieprogramnavn"], "nus": rad["NUS-kode"],
               "nivaa": rad["Nivåkode"], "tilbysFra": rad.get("Tilbys fra"), "tilbysTil": rad.get("Tilbys til"),
               "campus": sorted(camp), "registrerte": serie(stud["reg"], AAR_DBH), "kandidater": serie(stud["kand"], AAR_DBH),
               "antattForgjengerFor": [f"{a}:{b}" for a, b in kand] if len(kand) == 1 else [],
               "kandidaterForKobling": [f"{a}:{b}" for a, b in kand] if len(kand) > 1 else []}
        # Velg SO-program: én kandidatkode som bare ett SO-program bruker, ellers campus fra DBH 124
        so_kand = sorted({x for k2 in kand for x in deling[k2]})
        if camp and len(so_kand) > 1:
            so_kand = [x for x in so_kand if any(campus_treff(so_steder(x), c) for c in camp)] or so_kand
        if len(so_kand) == 1:
            forgjenger_so[so_kand[0]].append(key)
            rec["antattForgjengerFor"] = [f"so-{so_kand[0]}"]
            rec["kandidaterForKobling"] = []
        else:
            rec["antattForgjengerFor"] = []
            rec["kandidaterForKobling"] = [f"so-{x}" for x in so_kand]
        uten_opptak.append(rec)

    def studenter(keys, steder, delte):
        """Registrerte (høst, DBH 123) og kandidater (DBH 104) summert over kodene som tilhører bare dette programmet.
        Delte koder: registrerte fordeles på campus med DBH 124 når koden har flere campus og ett av dem passer;
        ellers (og for kandidater, som ikke har campus) settes året til null og hele kodens tall legges i «delt»."""
        reg, kand = defaultdict(int), defaultdict(int)
        reg_ukjent, kand_ukjent = set(), set()
        delt = {}
        for key in keys:
            st = r123.get(key, {"reg": {}, "kand": {}})
            if key in delte:
                delt[f"{key[0]}:{key[1]}"] = {"registrerte": serie(st["reg"], AAR_DBH), "kandidater": serie(dict(st["kand"]), AAR_DBH)}
            for y in AAR_DBH:
                if key in delte:
                    camp = r124.get(key, {}).get(y, {})
                    treff = {c: n for c, n in camp.items() if campus_treff(steder, c)}
                    if len(camp) > 1 and treff:
                        reg[y] += sum(treff.values())
                    elif st["reg"].get(y):
                        reg_ukjent.add(y)
                    if st["kand"].get(y):
                        kand_ukjent.add(y)
                else:
                    if st["reg"].get(y) is not None:
                        reg[y] += st["reg"][y]
                    if st["kand"].get(y) is not None:
                        kand[y] += st["kand"][y]
        reg = {y: (None if y in reg_ukjent else v) for y, v in reg.items()}
        for y in reg_ukjent:
            reg[y] = None
        kand = {y: (None if y in kand_ukjent else v) for y, v in kand.items()}
        for y in kand_ukjent:
            kand[y] = None
        return dict(sorted(reg.items())), dict(sorted(kand.items())), delt

    programmer, arsstudier = [], []
    for k, v in sorted(valgt.items()):
        p = so[k]
        kp = kat.get(k, {})
        siste = kp[max(kp)] if kp else None
        navn = p["navn"][-1]
        maal = p["maal"]
        fv = serie(maal.get("Førstevalgssøkere", {}), AAR_SO)
        sokeraar = [y for y in AAR_SO if maal.get("Alle søkere", {}).get(y) is not None]
        kat_aar = sorted(kp)
        start = kat_aar[0] if kat_aar else (sokeraar[0] if sokeraar else None)
        i_2026 = "2026" in kp and not kp["2026"].get("isCancelled")
        if "2026" not in sokeraar and not i_2026:
            status = "nedlagt"
        elif "2026" in kp and kp["2026"].get("isCancelled"):
            status = "avlyst 2026"
        elif start and start >= "2022":
            status = "ny"
        else:
            status = "aktiv"
        steder = []
        for x in kp.values():
            loc = x.get("teachingLocation", {}).get("name")
            if loc and loc not in steder:
                steder.append(loc)
        for s in p["steder"]:
            if s not in steder:
                steder.append(s)
        heltid = None if not siste else siste.get("isFullTime")
        form = "nett" if siste and siste.get("isOnline") else ("samlingsbasert" if siste and siste.get("isBlendedLearning") else "stedbasert")
        if siste is None and re.search(r"nett", navn, re.I):
            form = "nett"
        if heltid is None:
            heltid = not re.search(r"deltid", navn, re.I)
        g = pg.get(k, {})
        rad = {
            "id": f"so-{k}",
            "institusjon": p["institusjon"],
            "institusjonKort": KORT.get(SO_INST.get(k[:3], ["?"])[-1], p["institusjon"]),
            "dbhInstitusjonskode": SO_INST.get(k[:3], [None])[-1],
            "sektor": "privat" if SO_INST.get(k[:3], [""])[-1] in PRIVATE else "offentlig",
            "campus": steder[0] if steder else None,
            "campusAlle": steder,
            "programnavn": navn,
            "programnavnTidligere": p["navn"][:-1],
            "fagomraade": v["fag"],
            "type": v["type"],
            "nivaa": v["niva"],
            "studiepoeng": siste.get("numCredits") if siste else None,
            "heltid": heltid,
            "studieform": form,
            "grensetilfelle": v["grensetilfelle"],
            "opptak": "Samordna",
            "soStudiekode": k,
            "soUtdanningstype": p["utdanningstype"],
            "url": siste.get("url") if siste else None,
            "studieplasser": serie(maal.get("Studieplasser", {}), AAR_SO),
            "sokere": {
                "alle": serie(maal.get("Alle søkere", {}), AAR_SO),
                "forstevalg": fv,
                "forstevalgKvinnerProsent": serie(maal.get("Førstevalgssøkere (kvinner)", {}), AAR_SO),
                "kvalifiserte": serie(maal.get("Antall kvalifiserte", {}), AAR_SO),
                "tilbud": serie(maal.get("Antall tilbud", {}), AAR_SO),
            },
            "poenggrenser": {
                "ordinar": serie(g.get("ord", {}), AAR_PG),
                "forstegangsvitnemal": serie(g.get("fv", {}), AAR_PG),
                "ordinarSupplering": serie(g.get("ord_s", {}), AAR_PG),
                "forstegangsvitnemalSupplering": serie(g.get("fv_s", {}), AAR_PG),
            },
            "lokaltOpptak": None,
            "status": status,
            "forsteOpptakSO": start,
            "sisteOpptakSO": sokeraar[-1] if sokeraar else None,
            "merknader": [m for m in [v["merknad"]] if m],
        }
        if siste and siste.get("hasTuitionFee"):
            rad["merknader"].append("Samordna oppgir at programmet har studieavgift.")
        if v["niva"] == "årsstudium":
            rad.pop("lokaltOpptak")
            rad["hh"] = hh_so.get(k, [])
            arsstudier.append(rad)
            continue
        # DBH-kobling
        kb = kobling.get(k, {"dbh": [], "bevis": []})
        keys = [(d["inst"], d["kode"]) for d in kb["dbh"]]
        delte = {key for key in keys if len(deling[key]) > 1}
        forg = forgjenger_so.get(k, [])
        metoder = sorted({b["metode"] for b in kb["bevis"] if "kode" in b})
        aar_mangler = sorted(set(kb.get("aar_med_soekere", [])) - set(kb.get("aar_koblet", [])))
        if not keys:
            sikkerhet = "ikke funnet"
        elif aar_mangler:
            sikkerhet = "sannsynlig"
        else:
            sikkerhet = "sikker"
        reg, kand, delt = studenter(keys + forg, steder, delte)
        rad["dbhProgramkoder"] = [{"inst": d["inst"], "kode": d["kode"], "aar": d["aar"],
                                   "navnDBH": r347.get((d["inst"], d["kode"]), {}).get("rad", {}).get("Studieprogramnavn"),
                                   "deltMed": sorted(f"so-{x}" for x in deling[(d["inst"], d["kode"])] if x != k)} for d in kb["dbh"]]
        rad["dbhForgjengerkoder"] = [{"inst": a, "kode": b, "navnDBH": r347[(a, b)]["rad"]["Studieprogramnavn"],
                                      "sikkerhet": "usikker"} for a, b in forg]
        rad["dbhKobling"] = {
            "metode": ("DBH 379 (opptakstype N) førstevalgssøkere = Samordnas førstevalgssøkere" +
                       (", eksakt per kode" if "eksakt" in metoder else "") +
                       (", sum av flere studiesteder" if "sum" in metoder else "")) if keys else None,
            "sikkerhet": sikkerhet,
            "aarUtenKobling": aar_mangler,
        }
        mott = defaultdict(int)
        for key in keys:
            if key in delte:
                continue
            for y in AAR_DBH:
                n = r379.get(key, {}).get(y, {}).get("N")
                if n and n.get("mott"):
                    mott[y] += n["mott"]
        rad["mottDBH"] = dict(mott) if not delte else None
        rad["registrerte"] = reg
        rad["kandidater"] = kand
        rad["studenterDeltKode"] = delt or None
        studmerk = []
        if delte:
            studmerk.append("DBH-koden deles med andre studiesteder eller program. Registrerte er fordelt på campus med DBH 124 der "
                            "det går; ellers er året null. Kandidater har ikke campus i DBH 104 og står bare i studenterDeltKode "
                            "(tall for hele koden, skal ikke summeres over radene).")
        if forg:
            studmerk.append("Registrerte og kandidater inkluderer antatte forgjengerkoder uten opptak (samme navn i DBH 347).")
        rad["studenterMerknad"] = studmerk
        rad["hh"] = hh_so.get(k, [])
        programmer.append(rad)

    # DBH-program uten Samordna-opptak (private og offentlige lokale opptak)
    lokale = []
    for key, p in sorted(r347.items()):
        rad = p["rad"]
        inst, kode = key
        if key in koblet_dbh or key in UTELATT or rad["Nivåkode"] not in ("B3", "B4"):
            continue
        ekstra = DBH_EKSTRA.get(key)
        if not (okonomi_dbh(rad) or ekstra):
            continue
        opp = r379.get(key, {})
        l_alle = {y: opp[y]["L"]["alle"] for y in AAR_DBH if opp.get(y, {}).get("L", {}).get("alle")}
        if inst not in LOKALE_INST and not l_alle:
            continue
        stud = r123.get(key, {"reg": {}, "kand": {}})
        if not l_alle and not any(stud["reg"].values()) and not any(stud["kand"].values()):
            continue
        lokale.append(key)
    for key in lokale:
        inst, kode = key
        rad = r347[key]["rad"]
        navn = rad["Studieprogramnavn"]
        fag = ekstra = DBH_EKSTRA.get(key)
        if not fag:
            fag = fagomraade(re.sub(r"^(Bachelor(studium|studiet)?( i| in| of)?|Dobbel bachelor i)\s*", "", navn, flags=re.I))
        grense = bool(ekstra) or (rad.get("NUS-kode") or "").startswith("635") or fag in ("reiseliv og hotell", "sport management", "annet")
        opp = r379.get(key, {})
        lok = {}
        for y in AAR_DBH:
            l = opp.get(y, {}).get("L")
            if not l or not (l.get("alle") or l.get("tilbud") or l.get("mott")):
                continue
            tot = l.get("fv_k", 0) + l.get("fv_m", 0)
            lok[y] = {"alle": l.get("alle"), "forstevalg": l.get("fv") or None,
                      "forstevalgKvinnerProsent": round(100 * l["fv_k"] / tot, 1) if tot and l.get("fv") and tot >= 0.8 * l["fv"] else None,
                      "kvalifiserte": l.get("kvalifiserte"), "tilbud": l.get("tilbud"), "akseptert": l.get("akseptert"),
                      "mott": l.get("mott")}
        stud = r123.get(key, {"reg": {}, "kand": {}})
        camp = defaultdict(int)
        sist_c = max(r124.get(key, {}) or {"": {}})
        for c, n in r124.get(key, {}).get(sist_c, {}).items():
            camp[c.replace("Handelshøyskolen BI - ", "").replace("campus ", "").replace("Campus ", "")] += n
        heltid = float(rad.get("Andel av heltid") or 1) >= 0.99
        org = rad.get("Organisering_kode")
        if org == "3" or kode.startswith("N") and inst == "8253" or kode.endswith("_N") or (camp and set(camp) <= {"Nettstudier", "Nett", "Nettstudium", "Nettbasert"}):
            form = "nett"
        elif org == "2":
            form = "samlingsbasert"
        else:
            form = "stedbasert"
        til = rad.get("Tilbys til") or ""
        fra = rad.get("Tilbys fra") or ""
        opp_aar = sorted(y for y, v in lok.items() if v.get("tilbud") or v.get("mott"))
        reg_aar = sorted(y for y, n in stud["reg"].items() if n)
        slutt = til[:4] if til not in ("", "99999") else None
        if slutt and slutt <= "2026":
            status = "under utfasing" if (opp_aar and opp_aar[-1] == "2025") or (reg_aar and reg_aar[-1] == "2025") else "nedlagt"
        elif not opp_aar and reg_aar and reg_aar[-1] == "2025":
            status = "aktiv (opptak ikke rapportert i DBH 379)"
        elif not opp_aar:
            status = "ingen opptak i DBH 379 2021–2025"
        elif opp_aar[-1] < "2025":
            status = f"ingen opptak etter {opp_aar[-1]}"
        elif opp_aar[0] >= "2022" and (not reg_aar or reg_aar[0] >= "2022"):
            status = "ny"
        else:
            status = "aktiv"
        if slutt and slutt > "2026":
            status += f" (sluttdato {slutt} i DBH 347)"
        if inst == "8241" and kode.endswith("D") and float(rad.get("Andel av heltid") or 1) < 0.99:
            form = "nett"  # BI: D-kodene er deltid på nett (docs/bi-kristiania-datakilder.md)
        campusnavn = sorted(camp, key=lambda c: -camp[c])
        campus_antatt = False
        if not campusnavn:
            campus_antatt = True
            if form == "nett":
                campusnavn = ["nett"]
            elif inst == "8253":
                campusnavn = ["Bergen"] if kode.endswith("-B") else ["Oslo"]
            elif inst in ("8241", "1407"):
                campusnavn = ["Oslo"]
        r = {
            "id": f"dbh-{inst}-{kode}",
            "institusjon": INST_NAVN.get(inst, rad["Institusjonsnavn"]),
            "institusjonKort": KORT.get(inst, rad["Institusjonsnavn"]),
            "dbhInstitusjonskode": inst,
            "sektor": "privat" if inst in PRIVATE else "offentlig",
            "campus": campusnavn[0] if campusnavn else None,
            "campusAlle": campusnavn,
            "campusfordelingRegistrerte": {"aar": sist_c, "antall": dict(camp)} if camp else None,
            "programnavn": navn,
            "programnavnTidligere": [],
            "fagomraade": fag,
            "type": type_av(fag, navn),
            "nivaa": "bachelor",
            "studiepoeng": float(rad.get("Studiepoeng") or 0) or None,
            "heltid": heltid,
            "andelHeltid": float(rad.get("Andel av heltid") or 0),
            "studieform": form,
            "grensetilfelle": grense,
            "opptak": "lokalt",
            "soStudiekode": None,
            "soUtdanningstype": None,
            "url": None,
            "studieplasser": {},
            "sokere": None,
            "poenggrenser": None,
            "lokaltOpptak": lok,
            "status": status,
            "forsteOpptakSO": None,
            "sisteOpptakSO": None,
            "forsteOpptakDBH": opp_aar[0] if opp_aar else None,
            "sisteOpptakDBH": opp_aar[-1] if opp_aar else None,
            "tilbysFraDBH": fra or None,
            "tilbysTilDBH": til or None,
            "merknader": [],
            "dbhProgramkoder": [{"inst": inst, "kode": kode, "aar": sorted(set(lok) | set(stud["reg"])), "navnDBH": navn, "deltMed": []}],
            "dbhForgjengerkoder": [],
            "dbhKobling": {"metode": "DBH-programmet selv (lokalt opptak, DBH 379 opptakstype L)", "sikkerhet": "sikker", "aarUtenKobling": []},
            "mottDBH": {y: v["mott"] for y, v in lok.items() if v.get("mott")},
            "registrerte": serie(stud["reg"], AAR_DBH),
            "kandidater": serie(dict(stud["kand"]), AAR_DBH),
            "studenterMerknad": [],
            "hh": hh_dbh.get(key, []),
        }
        if inst == "8241":
            r["merknader"].append("BIs DBH-koder skiller ikke mellom campus; opptakstallene gjelder alle campuser (og nett) samlet. "
                                  "Campusfordelingen er registrerte studenter fra DBH 124.")
        if campus_antatt and campusnavn:
            r["merknader"].append("Studiested er antatt ut fra koden (ingen registrerte studenter med campus i DBH 124).")
        if kode.endswith("-B") and inst == "8253":
            r["merknader"].append("Kristiania: koder med «-B» er Bergen (DBH 124).")
        if inst in ("0264", "1177"):
            r["merknader"].append("INN byttet institusjonskode fra 0264 til 1177 i 2025.")
        if not lok:
            r["merknader"].append("Ingen søkere i DBH 379 (lokalt opptak) 2021–2025" +
                                  (" – Kristiania rapporterer ikke opptak til nettprogrammene i DBH 379." if inst == "8253" and form == "nett" else "."))
        programmer.append(r)

    # INN: slå sammen 0264/1177-duplikater blant lokale rader
    sett = {}
    for r in list(programmer):
        if r["opptak"] == "lokalt" and r["dbhInstitusjonskode"] in ("0264", "1177"):
            kode = r["dbhProgramkoder"][0]["kode"]
            if kode in sett:
                a = sett[kode]
                for f in ("registrerte", "kandidater", "lokaltOpptak", "mottDBH"):
                    for y, v in (r.get(f) or {}).items():
                        a[f].setdefault(y, v)
                a["dbhProgramkoder"].append(r["dbhProgramkoder"][0])
                programmer.remove(r)
            else:
                sett[kode] = r
                r["dbhInstitusjonskode"] = "1177"
                r["institusjon"] = "Universitetet i Innlandet"

    meta = {
        "hentet": HENTET,
        "beskrivelse": "Bachelorlandskapet i økonomi og administrasjon, samfunnsøkonomi og tilgrensende handelshøyskolefag i Norge. "
                       "Én rad per program og studiested (Samordna-studiekode) eller per DBH-programkode for program med lokalt opptak.",
        "kilder": {
            "samordnaSokertall": "https://sokertallrapport.samordnaopptak.no (grunndata tabell 2, programnivå 2021–2026), cache data/hh/kilder/so_sokertall_programnivaa_2021-2026_hentet_2026-09-22.json",
            "samordnaPoenggrenser": "https://rapport-dv.educloud.no (Tableau-CSV, poenggrenser 2020–2026), cache data/hh/kilder/so_poenggrenser_2020-2026_hentet_2026-09-22.csv",
            "samordnaKatalog": "https://sok.samordnaopptak.no/api/v1/search (programtype, studiepoeng, studieform, URL, studiested), cache data/nmbu/kilder/samordna-katalog/",
            "dbh": "https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData, tabell 347, 379, 123, 104, 124, hentet " + HENTET + ", cache kilder/dbh/",
        },
        "felter": {
            "sokere": "Samordna, hovedopptaket, per år 2021–2026",
            "poenggrenser": "Samordna, hovedopptaket (og supplering), 2020–2026. 0 betyr at alle kvalifiserte søkere fikk tilbud",
            "lokaltOpptak": "DBH 379 opptakstype L, sum av semestre, 2021–2025 (2026 ikke rapportert for høsten)",
            "mottDBH": "DBH 379 «møtt til studiestart» (null når DBH-koden deles med andre program)",
            "registrerte": "DBH 123, høstsemesteret, alle kull på programkoden",
            "kandidater": "DBH 104, ferdige kandidater per år (alle semestre)",
            "type": "BØA = økonomi og administrasjon/siviløkonom; samf. = samfunnsøkonomi; annet = øvrige",
            "nivaa": "bachelor eller femårig (siviløkonom-, integrert master- eller profesjonsløp som tar opp fra videregående)",
            "status": "aktiv, ny (første opptak 2022 eller senere), nedlagt (ikke i Samordna 2026 eller sluttdato i DBH 347), under utfasing, avlyst 2026",
        },
    }
    for r in programmer + arsstudier:
        if any(h["gruppe"] == "oa" for h in r.get("hh", [])):
            r["type"] = "BØA"
    programmer.sort(key=lambda r: (r["institusjonKort"], r["campus"] or "", r["programnavn"]))
    json.dump({"meta": meta, "programmer": programmer}, open(os.path.join(UT, "programmer.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    json.dump({"meta": {"hentet": HENTET, "beskrivelse": "Årsstudier i Samordnas utvalg (økonomisk-administrative fag og tillegg). "
                        "Ikke koblet til DBH."}, "programmer": arsstudier},
              open(os.path.join(UT, "arsstudier.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"meta": {"hentet": HENTET, "beskrivelse": "Økonomikoder i DBH 347 (B3/B4/M5) uten opptak 2021–2025 men med studenter "
                        "eller kandidater: utfasede koder, kullkoder og spesialvarianter. Antatt forgjenger er bare navnelikhet."},
               "koder": uten_opptak},
              open(os.path.join(UT, "dbh_uten_opptak.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    # Topp 15 etter førstevalg 2026
    so_rader = [r for r in programmer if r["opptak"] == "Samordna" and r["sokere"]["forstevalg"].get("2026")]
    topp = sorted(so_rader, key=lambda r: -r["sokere"]["forstevalg"]["2026"])[:15]
    t = [{"plass": i + 1, "id": r["id"], "institusjon": r["institusjonKort"], "campus": r["campus"], "program": r["programnavn"],
          "nivaa": r["nivaa"], "studiekode": r["soStudiekode"], "forstevalg": r["sokere"]["forstevalg"],
          "endring2021_2026": (r["sokere"]["forstevalg"]["2026"] - r["sokere"]["forstevalg"]["2021"]) if r["sokere"]["forstevalg"].get("2021") else None,
          "studieplasser2026": r["studieplasser"].get("2026"), "poenggrenseOrd2026": r["poenggrenser"]["ordinar"].get("2026")}
         for i, r in enumerate(topp)]
    json.dump({"meta": {"hentet": HENTET, "beskrivelse": "De 15 Samordna-programmene i utvalget med flest førstevalgssøkere i 2026 "
                        "(bachelor og femårige; årsstudier og program med lokalt opptak er ikke med fordi 2026-tall mangler)."},
               "topp15": t}, open(os.path.join(UT, "topp15.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(programmer)} program ({sum(1 for r in programmer if r['opptak'] == 'Samordna')} Samordna, "
          f"{sum(1 for r in programmer if r['opptak'] == 'lokalt')} lokalt), {len(arsstudier)} årsstudier, "
          f"{len(uten_opptak)} DBH-koder uten opptak")


if __name__ == "__main__":
    main()
