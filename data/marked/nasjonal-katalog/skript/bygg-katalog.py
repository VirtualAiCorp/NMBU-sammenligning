#!/usr/bin/env python3
"""Bygger den nasjonale programkatalogen og markedsoversikten (B1) fra rådata i kilder/.

Kjør først hent-dbh.py, hent-samordna.py og hent-nus.py. Dette skriptet bruker ikke nettet.

Output (data/marked/nasjonal-katalog/):
  program.json  eller  program/<fagfelt>.json + program/indeks.json (deles når samlet fil > 3 MB)
      To slags rader, skilt med «type»:
        «dbh»  ett studieprogram i DBH 347 (alle institusjoner, alle nivåer, aktive og nedlagte 2021–2026),
               med søkertall fra DBH 379 per år (lokalt opptak L og nasjonalt opptak N) og koblingen til
               Samordnas studiekoder.
        «so»   én studiekode i Samordna opptak (studietilbud per studiested), med søkere, førstevalg,
               plasser, kvalifiserte, tilbud, poenggrenser, ventelister og ledigflagg per år 2021–2026,
               og koblingen til DBH-programmet.
      Radene i de to gruppene skal ikke summeres sammen (det er to linser på det samme markedet).
  fagskole.json       Samordnas fagskoleopptak (programnivå 2021–2026), holdt utenfor UH-markedet.
  fagfelt.json        fagfeltinndelingen (NUS-faggrupper og Samordnas utdanningstyper -> fagfelt), hvilke
                      NMBU-fakultet som har program i feltet, og nøkkeltall per felt.
  institusjoner.json  institusjonsregister (DBH 211 + Samordna) med årstall per institusjon.
  marked.json         markedsandeler 2021–2026 (Samordna-linsen: førstevalgssøkere) per institusjon og per
                      fagfelt × nivå, NMBUs andel per felt, vinnere og tapere; DBH-linsen 2021–2025.
  kontroll.json       dekning, koblingskvalitet og kontroll mot de manuelle koblingene i data/<fak>/.

Bruk:
  python3 data/marked/nasjonal-katalog/skript/bygg-katalog.py
"""
from __future__ import annotations

import collections
import csv
import json
import re
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from felles import KATALOG, KILDER, REPO, heltall, les_cache, ord_sett, skriv_json, tall  # noqa: E402

AAR = ["2021", "2022", "2023", "2024", "2025", "2026"]
DBH_AAR = ["2021", "2022", "2023", "2024", "2025"]   # DBH 379 for 2026 er bare vårsemesteret ennå
SISTE = "2026"
GRENSE_BYTES = 3_000_000
NMBU = "1173"

# ---------------------------------------------------------------------------------------------------------
# Fagfelt. Primærnøkkel: NUS-faggruppe (siffer 2–3 i den sekssifrede NUS-koden fra DBH 347).
# Reserve når programmet ikke har DBH-kobling: Samordnas utdanningstype.
# ---------------------------------------------------------------------------------------------------------
FAGFELT = [
    # id, navn, NUS-faggrupper, Samordna-utdanningstyper (prefiks)
    ("okonomi", "Økonomi og administrasjon", ["41", "42", "44", "49", "34"],
     ["Økonomisk-administrative fag", "Reiselivsfag"]),
    ("helse", "Helse- og sosialfag", ["61", "62", "63", "64", "65", "66", "69"], ["Helsefag"]),
    ("veterinaer", "Veterinærfag", ["67"], ["Helsefag - veterinær"]),
    ("laerer", "Lærerutdanning og pedagogikk", ["21", "22", "23", "24", "25", "29"],
     ["Lærerutdanninger", "Pedagogiske fag"]),
    ("teknologi", "Teknologi og ingeniørfag", ["55", "57", "58", "59"], ["Teknologiske fag"]),
    ("it", "IT og datateknologi", ["54"], ["Informasjonsteknologi"]),
    ("naturvitenskap", "Naturvitenskap og matematikk", ["51", "52", "53", "56"], ["Realfag"]),
    ("landbruk", "Landbruk, havbruk og naturforvaltning", ["71", "72", "74", "79"], ["Land- og havbruk"]),
    ("samfunn", "Samfunnsvitenskap og psykologi", ["31", "32", "33", "36", "38", "39"], ["Samfunnsfag"]),
    ("jus", "Jus", ["37"], ["Juridiske fag"]),
    ("medier", "Medier og kommunikasjon", ["35"], ["Mediefag"]),
    ("humaniora", "Humaniora, språk og religion", ["01", "11", "12", "13", "14", "19"],
     ["Språkfag", "Historiefag"]),
    ("kunst", "Kunst, musikk og design", ["15", "16"], ["Estetiske fag"]),
    ("idrett", "Idrett", ["68"], ["Idrettsfag"]),
    ("sikkerhet", "Samferdsel, sikkerhet og forsvar", ["81", "82", "89"], []),
    ("uoppgitt", "Uoppgitt fagfelt", ["09", "99"], []),
]
FAGFELT_NAVN = {f[0]: f[1] for f in FAGFELT}
NUS_TIL_FELT = {g: f[0] for f in FAGFELT for g in f[2]}


def felt_fra_so_type(utdtype: str | None) -> str | None:
    if not utdtype:
        return None
    beste = None
    for fid, _n, _g, typer in FAGFELT:
        for t in typer:
            if utdtype == t or utdtype.startswith(t):
                if beste is None or len(t) > beste[1]:
                    beste = (fid, len(t))
    return beste[0] if beste else None


def felt_fra_nus(nus: str | None) -> str | None:
    if not nus or len(nus) < 3:
        return None
    return NUS_TIL_FELT.get(nus[1:3])


# Nivågrupper for markedsanalysen
NIVAA_DBH = {"B3": "bachelor", "B4": "bachelor", "AR": "arsstudium", "M5": "master5", "PR": "master5",
             "M2": "master2", "ME": "erfaringsmaster", "MX": "erfaringsmaster", "FU": "ph.d.",
             "LN": "annet", "HN": "annet", "HK": "annet", "VS": "annet", "YU": "annet"}
NIVAA_SO = {"Bachelor": "bachelor", "Årsstudium": "arsstudium", "Master": "master5",
            "Profesjonsstudium": "master5", "Kandidat": "master5"}
NIVAAGRUPPER = ["alle", "bachelor", "arsstudium", "master5"]

NMBU_FAK = {"470": "HH", "460": "REALTEK", "420": "LANDSAM", "430": "MINA", "450": "BIOVIT", "440": "KBM",
            "410": "VET"}


# ---------------------------------------------------------------------------------------------------------
def last_dbh():
    d = KILDER / "dbh"
    inst211 = {r["Institusjonskode"]: r for r in les_cache(d / "211.json.gz")}
    avd210 = collections.defaultdict(list)
    for r in les_cache(d / "210.json.gz"):
        avd210[(r["Institusjonskode"], r["Avdelingskode"])].append(r)
    r347 = []
    for aar in AAR:
        for sem in ("1", "3"):
            r347 += les_cache(d / f"347_{aar}_{sem}.json.gz")
    r370 = []
    for aar in ["2020"] + AAR:
        r370 += les_cache(d / f"370_{aar}.json.gz")
    r379 = {}
    for aar in AAR:
        r379[aar] = (les_cache(d / f"379_{aar}.json.gz"), les_cache(d / f"379fv_{aar}.json.gz"))
    return inst211, avd210, r347, r370, r379


def inst_norm_fn(inst211):
    """DBH-institusjonskode -> gjeldende kode (sammenslåtte institusjoner, f.eks. 0264 HINN -> 1177 INN)."""
    def f(kode: str) -> str:
        r = inst211.get(kode)
        if r and r.get("Institusjonskode (sammenslått)") and r["Institusjonskode (sammenslått)"] != kode:
            return r["Institusjonskode (sammenslått)"]
        return kode
    return f


def sem_nokkel(aar: str, sem: str) -> int:
    return int(aar) * 10 + int(sem)


def bygg_dbh_program(inst211, avd210, r347, inorm):
    """Ett program per (normalisert institusjon, studieprogramkode). Siste forekomst vinner for attributter."""
    prog = {}
    r347.sort(key=lambda r: sem_nokkel(r["Årstall"], r["Semester"]))
    siste_sem = max(sem_nokkel(r["Årstall"], r["Semester"]) for r in r347)
    for r in r347:
        inst = inorm(r["Institusjonskode"])
        k = (inst, r["Studieprogramkode"])
        p = prog.setdefault(k, {"aarSett": set(), "navnHist": [], "instKoder": set()})
        p["aarSett"].add(r["Årstall"])
        p["instKoder"].add(r["Institusjonskode"])
        p["sisteSem"] = sem_nokkel(r["Årstall"], r["Semester"])
        navn = (r.get("Studieprogramnavn") or "").strip()
        if navn and (not p["navnHist"] or p["navnHist"][-1] != navn):
            p["navnHist"].append(navn)
        p["r"] = r
    ut = {}
    for (inst, kode), p in prog.items():
        r = p["r"]
        avd = r.get("Avdelingskode")
        fak = None
        kandidater = avd210.get((r["Institusjonskode"], avd)) or []
        if kandidater:
            a = max(kandidater, key=lambda x: int(x.get("Gyldig til") or 0))
            fak = (a.get("Fakultetskode"), a.get("Fakultetsnavn"))
        tilbys_til = r.get("Tilbys til") or ""
        if p["sisteSem"] == siste_sem:
            status = "aktiv"
            try:
                if tilbys_til and int(tilbys_til) < siste_sem:
                    status = "utfases"
            except ValueError:
                pass
        else:
            status = "nedlagt"
        nus = (r.get("NUS-kode") or "").strip() or None
        rad = {
            "id": f"dbh:{inst}:{kode}", "type": "dbh", "inst": inst, "kode": kode,
            "navn": p["navnHist"][-1] if p["navnHist"] else kode,
            "avdeling": r.get("Avdelingsnavn"),
            "fakultet": fak[1] if fak else None, "fakultetskode": fak[0] if fak else None,
            "nivaa": r.get("Nivåkode"), "nivaagruppe": NIVAA_DBH.get(r.get("Nivåkode") or "", "annet"),
            "studiepoeng": tall(r.get("Studiepoeng")), "heltid": tall(r.get("Andel av heltid")),
            "nus": nus, "studium": r.get("Studiumkode"),
            "videreutdanning": r.get("Videreutd.") not in (None, "0"),
            "sprak": r.get("Underv.språk"), "tilbysFra": r.get("Tilbys fra"), "tilbysTil": tilbys_til or None,
            "egenfinansiering": tall(r.get("Prosent egenfinansiering")),
            "status": status, "aarIDbh": sorted(p["aarSett"]),
        }
        if len(p["navnHist"]) > 1:
            rad["tidligereNavn"] = p["navnHist"][:-1]
        if p["instKoder"] != {inst}:
            rad["dbhInstKoder"] = sorted(p["instKoder"])
        if fak and inst == NMBU:
            rad["nmbuFakultet"] = NMBU_FAK.get(fak[0])
        ut[(inst, kode)] = rad
    return ut


def legg_til_379(dbhprog, r379, inorm):
    """Søkertall per DBH-program og år (sum vår + høst), per opptakstype."""
    tom = 0
    for aar in DBH_AAR:
        alle, fv = r379[aar]
        agg = collections.defaultdict(lambda: collections.Counter())
        for r in alle:
            k = (inorm(r["Institusjonskode"]), r["Studieprogramkode"], r["Opptakstype"])
            c = agg[k]
            s = heltall(r.get("Søknadsalternativer")) or 0
            c["sokere"] += s
            if r.get("Kvalifisert") == "1":
                c["kvalifiserte"] += s
            c["tilbud"] += heltall(r.get("Tilbud om opptak")) or 0
            c["akseptert"] += heltall(r.get("Akseptert tilbud")) or 0
            c["mott"] += heltall(r.get("Møtt til studiestart")) or 0
        for r in fv:
            k = (inorm(r["Institusjonskode"]), r["Studieprogramkode"], r["Opptakstype"])
            agg[k]["forstevalg"] += heltall(r.get("Søknadsalternativer")) or 0
        for (inst, kode, ot), c in agg.items():
            p = dbhprog.get((inst, kode))
            if p is None:
                tom += 1
                continue
            verdier = {k: v for k, v in c.items() if v}
            if verdier:
                p.setdefault("aar", {}).setdefault(aar, {})[ot] = verdier
    return tom


# ---------------------------------------------------------------------------------------------------------
def last_rapporttabell(navn: str) -> list[dict]:
    s = (KILDER / "sokertallrapport" / f"{navn}.html").read_text(encoding="utf-8")
    m = re.search(r"allData\s*=\s*", s)
    obj, _ = json.JSONDecoder().raw_decode(s[m.end():])
    return obj["default"]


NK = {"Alle søkere": "sokere", "Førstevalgssøkere": "forstevalg", "Studieplasser": "plasser",
      "Førstevalgssøkere (kvinner)": "kvinneandelFv", "Antall kvalifiserte": "kvalifiserte",
      "Antall tilbud": "tilbud"}


def bygg_so_tabell(rader: list[dict]) -> dict:
    """Programnivåtabellen (én rad per studiekode × nøkkeltall). Samme kode kan stå flere ganger med ulikt navn
    for ulike år (navnebytte); radene slås sammen per år."""
    so = {}
    for r in rader:
        kode = (r.get("Studie- kode") or "").strip()
        if not kode:
            continue
        p = so.setdefault(kode, {"kode": kode, "aar": {}, "navnPerAar": {}, "inst": r["Institusjon"],
                                 "sted": r.get("Studie- sted"), "utdtype": r.get("Utdannings- type")})
        felt = NK.get(r["Nøkkeltall"])
        for aar in AAR:
            v = r.get(aar)
            if v is None or v == "":
                continue
            x = tall(v)
            if x is None:
                continue
            if felt == "kvinneandelFv":
                x = round(x, 1)
            else:
                x = int(x)
            p["aar"].setdefault(aar, {})[felt] = x
            p["navnPerAar"][aar] = r["Studienavn"]
    return so


def last_tableau() -> dict:
    """Poenggrenser og ventelister per studiekode og år (2020–2026)."""
    ut = collections.defaultdict(dict)
    with open(KILDER / "so_poenggrenser_venteliste.csv", encoding="utf-8") as f:
        for r in csv.DictReader(f, delimiter=";"):
            kode = r["Studiekode"].replace(" ", "").replace(" ", "")
            aar = r["År"]
            if aar not in AAR:
                continue
            kv = "Ord" if r["Kvote"].startswith("Ordinær") else "Fv"
            supp = "Supp" if r["Opptaksrunde"].startswith("Supp") else ""
            raw = (r["Measure Values"] or "").strip()
            if r["Measure Names"] == "Poenggrense":
                try:
                    v = float(raw.replace(",", "."))
                except ValueError:
                    continue
                if v == -1:      # sentinel: runden/kvoten fantes ikke
                    continue
                ut[(kode, aar)][f"pg{kv}{supp}"] = v
            else:
                try:
                    v = int(raw.replace(",", "").replace(" ", ""))   # «1,435» = 1435 (tusenskille)
                except ValueError:
                    continue
                if v < 0:
                    continue
                ut[(kode, aar)][f"vl{kv}{supp}"] = v
            ut[(kode, aar)]["_navn"] = r["Studienavn"]
            ut[(kode, aar)]["_lsted"] = r["Lærested"]
    return ut


def last_sok_api() -> dict:
    ut = {}
    for aar in ["2020"] + AAR:
        f = KILDER / "samordna-sok" / f"{aar}.json.gz"
        if not f.exists():
            continue
        import gzip
        for p in json.load(gzip.open(f, "rt", encoding="utf-8"))["data"]:
            ut[(p["studyProgrammeInstitutionCode"], aar)] = p
    return ut


# ---------------------------------------------------------------------------------------------------------
def main() -> None:
    hentet = date.today().isoformat()
    inst211, avd210, r347, r370, r379 = last_dbh()
    inorm = inst_norm_fn(inst211)
    dbhprog = bygg_dbh_program(inst211, avd210, r347, inorm)
    uten_379 = legg_til_379(dbhprog, r379, inorm)

    tabell = bygg_so_tabell(last_rapporttabell("grunndata_tabell_2_uhg_hoved_26"))
    tableau = last_tableau()
    api = last_sok_api()

    # SO-institusjon -> DBH-institusjon: stemmer på studieprogramnummer i DBH 370 (Studietypekode)
    so_inst_info = {}
    for (kode, aar), p in api.items():
        i = p["institution"]
        so_inst_info[i["institutionNumber"]] = {"soNr": i["institutionNumber"], "soNavn": i["name"],
                                                "soKort": i.get("shortName"), "sektor": i.get("sector"),
                                                "kategori": (i.get("institutionCategory") or {}).get("name")}
    sonum = collections.defaultdict(set)
    for (kode, aar), p in api.items():
        sonum[(aar, p["studyProgrammeNumber"])].add(p["institution"]["institutionNumber"])
    stemmer = collections.Counter()
    for r in r370:
        st = (r.get("Studietypekode") or "").zfill(3)
        for i in sonum.get((r["Årstall"], st), ()):
            stemmer[(inorm(r["Institusjonskode"]), i)] += 1
    so_til_dbh_inst = {}
    for (d, i), n in stemmer.most_common():
        if i not in so_til_dbh_inst and d not in so_til_dbh_inst.values():
            so_til_dbh_inst[i] = d
    navn_til_sonr = {v["soNavn"]: k for k, v in so_inst_info.items()}
    kort_til_sonr = {v["soKort"]: k for k, v in so_inst_info.items()}

    # SO-kode -> DBH-program per år fra 370
    kobling370 = collections.defaultdict(lambda: collections.defaultdict(set))   # sokode -> aar -> {(inst,kode)}
    dbh_sonr = {d: i for i, d in so_til_dbh_inst.items()}
    for r in r370:
        inst = inorm(r["Institusjonskode"])
        sonr = dbh_sonr.get(inst)
        if sonr is None:
            continue
        sokode = f"{sonr}{(r.get('Studietypekode') or '').zfill(3)}"
        kobling370[sokode][r["Årstall"]].add((inst, r["Studieprogramkode"]))

    # ---------------- SO-rader
    alle_sokoder = set(tabell)
    for (kode, aar) in tableau:
        alle_sokoder.add(kode)
    for (kode, aar) in api:
        if aar in AAR:
            alle_sokoder.add(kode)
    sorader = {}
    for kode in sorted(alle_sokoder):
        t = tabell.get(kode, {})
        rad = {"id": f"so:{kode}", "type": "so", "kode": kode}
        aarsdata = {}
        for aar in AAR:
            d = dict(t.get("aar", {}).get(aar, {}))
            tb = tableau.get((kode, aar), {})
            for k, v in tb.items():
                if not k.startswith("_"):
                    d[k] = v
            a = api.get((kode, aar))
            if a is not None:
                if a.get("numStudyPlaces") is not None:
                    d["plasserKatalog"] = a["numStudyPlaces"]
                if a.get("isCancelled"):
                    d["avlyst"] = True
            if d:
                aarsdata[aar] = d
        if not aarsdata:
            continue
        aar_med_data = sorted(aarsdata)
        # attributter fra siste API-treff
        siste_api = None
        for aar in reversed(["2020"] + AAR):
            if (kode, aar) in api:
                siste_api = api[(kode, aar)]
                break
        if siste_api:
            i = siste_api["institution"]
            sonr = i["institutionNumber"]
            tl = siste_api.get("teachingLocation") or {}
            mun = tl.get("municipality") or {}
            rad.update({
                "navn": (siste_api.get("names") or {}).get("NB"),
                "soInst": sonr, "inst": so_til_dbh_inst.get(sonr),
                "sted": tl.get("name"), "kommune": mun.get("id"), "kommunenavn": mun.get("name"),
                "fylke": mun.get("countyName"),
                "programtype": (siste_api.get("studyProgrammeType") or {}).get("name"),
                "studiepoeng": siste_api.get("numCredits"),
                "omrade": (siste_api.get("mainEducationArea") or {}).get("id"),
                "heltid": siste_api.get("isFullTime"), "nett": siste_api.get("isOnline"),
                "samlingsbasert": siste_api.get("isBlendedLearning"),
                "skolepenger": siste_api.get("hasTuitionFee"),
                "url": siste_api.get("url"),
            })
            if siste_api["admission"]["name"] == SISTE:
                rad["ledig2026"] = bool(siste_api.get("offerVacanciesSinceLast"))
        if t:
            rad.setdefault("navn", t["navnPerAar"][max(t["navnPerAar"])])
            if not rad.get("navn"):
                rad["navn"] = t["navnPerAar"][max(t["navnPerAar"])]
            rad["utdtype"] = t.get("utdtype")
            rad.setdefault("sted", t.get("sted"))
            if "soInst" not in rad:
                sonr = navn_til_sonr.get(t["inst"])
                rad["soInst"] = sonr
                rad["inst"] = so_til_dbh_inst.get(sonr)
            navn_hist = []
            for aar in sorted(t["navnPerAar"]):
                n = t["navnPerAar"][aar]
                if not navn_hist or navn_hist[-1] != n:
                    navn_hist.append(n)
            if len(navn_hist) > 1:
                rad["tidligereNavn"] = navn_hist[:-1]
        if "soInst" not in rad:
            tb = next((tableau[(kode, a)] for a in reversed(AAR) if (kode, a) in tableau), None)
            if tb:
                rad["navn"] = tb["_navn"]
                sonr = kort_til_sonr.get(tb["_lsted"])
                rad["soInst"] = sonr
                rad["inst"] = so_til_dbh_inst.get(sonr)
        if not rad.get("utdtype"):
            tb = next((tableau[(kode, a)] for a in reversed(AAR) if (kode, a) in tableau), None)
            if tb is None:
                pass
        rad["nivaagruppe"] = NIVAA_SO.get(rad.get("programtype") or "", None)
        forste, siste = aar_med_data[0], aar_med_data[-1]
        avlyst_siste = aarsdata.get(SISTE, {}).get("avlyst")
        if siste < SISTE:
            rad["status"] = "nedlagt"
        elif avlyst_siste:
            rad["status"] = "avlyst"
        else:
            rad["status"] = "aktiv"
        rad["forsteAar"], rad["sisteAar"] = forste, siste
        rad["aar"] = aarsdata
        sorader[kode] = rad

    # ---------------- SO -> DBH-kobling
    dbh_per_inst = collections.defaultdict(list)
    for (inst, kode), p in dbhprog.items():
        dbh_per_inst[inst].append(p)
    so_niva_til_dbh = {"bachelor": {"B3", "B4"}, "arsstudium": {"AR"}, "master5": {"M5", "PR", "M2"}}
    koblet = collections.Counter()
    for kode, rad in sorader.items():
        k = kobling370.get(kode)
        if k:
            siste_aar = max(k)
            treff = sorted(k[siste_aar])
            rad["dbh"] = [f"dbh:{i}:{c}" for i, c in treff]
            rad["kobling"] = "dbh370"
            rad["koblingAar"] = siste_aar
            tidligere = sorted({f"dbh:{i}:{c}" for a, sett in k.items() for i, c in sett} - set(rad["dbh"]))
            if tidligere:
                rad["dbhTidligere"] = tidligere
            koblet["dbh370"] += 1
            continue
        # navnekobling innen institusjonen, samme nivå, aktiv i samme periode
        inst = rad.get("inst")
        if not inst:
            koblet["ingen_inst"] += 1
            continue
        mal = ord_sett(rad.get("navn") or "")
        if not mal:
            koblet["ingen"] += 1
            continue
        lov = so_niva_til_dbh.get(rad.get("nivaagruppe") or "", None)
        kand = []
        for p in dbh_per_inst.get(inst, []):
            if lov and p["nivaa"] not in lov:
                continue
            if p.get("videreutdanning"):
                continue
            if not set(p["aarIDbh"]) & set(AAR[AAR.index(rad["forsteAar"]):]):
                continue
            o = ord_sett(p["navn"])
            if not o:
                continue
            j = len(mal & o) / len(mal | o)
            kand.append((j, p["id"]))
        kand.sort(reverse=True)
        if kand and kand[0][0] >= 0.75 and (len(kand) == 1 or kand[0][0] - kand[1][0] >= 0.25):
            rad["dbh"] = [kand[0][1]]
            rad["kobling"] = "navn"
            rad["koblingSikkerhet"] = round(kand[0][0], 2)
            koblet["navn"] += 1
        else:
            koblet["ingen"] += 1

    dbh_id = {p["id"]: p for p in dbhprog.values()}
    for kode, rad in sorader.items():
        for did in rad.get("dbh", []):
            p = dbh_id.get(did)
            if p is not None:
                p.setdefault("so", []).append(kode)
                lov = so_niva_til_dbh.get(rad.get("nivaagruppe") or "")
                if lov and p["nivaa"] not in lov:
                    # f.eks. femårig master i Samordna som registreres på bachelorprogrammet (3+2) i DBH
                    rad["koblingMerknad"] = f"nivåavvik: Samordna {rad.get('programtype')}, DBH {p['nivaa']}"
    for p in dbhprog.values():
        if "so" in p:
            p["so"] = sorted(set(p["so"]))

    # ---------------- fagfelt
    nus_navn = {c["code"]: c["name"] for c in json.loads((KILDER / "nus_klass36.json").read_text())["codes"]}
    for p in dbhprog.values():
        f = felt_fra_nus(p["nus"])
        p["fagfelt"] = f or "uoppgitt"
        p["fagfeltKilde"] = "nus" if f else "ingen"
        if p["nus"]:
            p["nusNavn"] = nus_navn.get(p["nus"])
            p["nusFaggruppe"] = nus_navn.get(p["nus"][:3])
    for rad in sorader.values():
        f = None
        for did in rad.get("dbh", []):
            p = dbh_id.get(did)
            if p and p.get("nus"):
                f = felt_fra_nus(p["nus"])
                if f:
                    rad["nus"] = p["nus"]
                    rad["fagfeltKilde"] = "nus"
                    break
        if not f:
            f = felt_fra_so_type(rad.get("utdtype"))
            if f:
                rad["fagfeltKilde"] = "so_utdtype"
        if not f:
            # reserve: Samordnas hovedområde i søke-API-et
            omr = {"ØKADM": "okonomi", "HELSEFAG": "helse", "LÆRER": "laerer", "TEKNO": "teknologi",
                   "INFOTEKN": "it", "REALFAG": "naturvitenskap", "LANDBRUK": "landbruk", "SAMFUNN": "samfunn",
                   "JUS": "jus", "MEDIEFAG": "medier", "SPRÅK": "humaniora", "HISTORIE": "humaniora",
                   "ESTETISK": "kunst", "IDRETT": "idrett", "PEDFAG": "laerer", "REISELIV": "okonomi"}
            f = omr.get(rad.get("omrade") or "")
            if f:
                rad["fagfeltKilde"] = "so_omrade"
        rad["fagfelt"] = f or "uoppgitt"
        rad["fagfeltSo"] = felt_fra_so_type(rad.get("utdtype"))
        # NMBU-fakultet via DBH-koblingen
        for did in rad.get("dbh", []):
            p = dbh_id.get(did)
            if p and p.get("nmbuFakultet"):
                rad["nmbuFakultet"] = p["nmbuFakultet"]
                break

    # ---------------- institusjoner
    inst_navn = {}
    for (inst, kode), p in dbhprog.items():
        r = inst211.get(inst, {})
        inst_navn[inst] = r.get("Institusjonsnavn")
    dbh_sonr = {d: i for i, d in so_til_dbh_inst.items()}
    t4 = last_rapporttabell("grunndata_tabell_4_uhg_hoved_26")
    t4_inst = collections.defaultdict(dict)
    for r in t4:
        sonr = navn_til_sonr.get(r["Institusjon"])
        felt = NK.get(r["Nøkkeltall"])
        for aar in AAR:
            x = tall(r.get(aar))
            if x is not None:
                t4_inst[sonr].setdefault(aar, {})[felt] = round(x, 1) if felt == "kvinneandelFv" else int(x)
    institusjoner = {}
    alle_inst = set(inst_navn) | {d for d in so_til_dbh_inst.values()}
    for inst in sorted(alle_inst):
        r = inst211.get(inst, {})
        typ = r.get("Typenavn") or ""
        rec = {"kode": inst, "navn": r.get("Institusjonsnavn") or inst_navn.get(inst), "kortnavn": r.get("Kortnavn"),
               "type": typ, "sektor": "privat" if "rivat" in typ else ("offentlig" if typ else None),
               "sammenslattFra": sorted(k for k, v in inst211.items()
                                        if v.get("Institusjonskode (sammenslått)") == inst and k != inst
                                        and int(v.get("Gyldig til") or 0) >= 20201)}
        sonr = dbh_sonr.get(inst)
        if sonr is not None:
            s = so_inst_info[sonr]
            rec.update({"samordna": True, "soNr": sonr, "soNavn": s["soNavn"], "soKort": s["soKort"]})
            rec["samordnaUnike"] = t4_inst.get(sonr, {})
        else:
            rec["samordna"] = False
        dp = [p for p in dbhprog.values() if p["inst"] == inst]
        rec["antallProgram"] = {
            "dbhAktive": sum(1 for p in dp if p["status"] != "nedlagt"),
            "dbhAktiveGrad": sum(1 for p in dp if p["status"] != "nedlagt" and not p["videreutdanning"]
                                 and p["nivaagruppe"] not in ("annet", "ph.d.")),
            "dbhAlle": len(dp),
            "soAktive": sum(1 for s in sorader.values() if s.get("inst") == inst and s["status"] == "aktiv"),
        }
        if inst == NMBU:
            rec["nmbu"] = True
        institusjoner[inst] = rec

    # ---------------- markedet, Samordna-linsen: førstevalgssøkere
    def tom():
        return collections.Counter()
    so_marked = collections.defaultdict(lambda: collections.defaultdict(tom))   # (felt,niva) -> aar -> Counter
    so_inst = collections.defaultdict(lambda: collections.defaultdict(tom))     # (felt,niva,aar) -> inst -> Counter
    for rad in sorader.values():
        inst = rad.get("inst") or f"so{rad.get('soInst')}"
        for aar, d in rad["aar"].items():
            for felt in (rad["fagfelt"], "alle"):
                for niv in ("alle", rad.get("nivaagruppe")):
                    if not niv:
                        continue
                    c = so_marked[(felt, niv)][aar]
                    ci = so_inst[(felt, niv, aar)][inst]
                    for k in ("sokere", "forstevalg", "plasser", "kvalifiserte", "tilbud"):
                        if d.get(k) is not None:
                            c[k] += d[k]
                            ci[k] += d[k]
                    if d.get("forstevalg") is not None:
                        c["program"] += 1
                        ci["program"] += 1

    def andeler(felt, niv):
        ut = {}
        for aar in AAR:
            tot = so_marked[(felt, niv)][aar]
            if not tot.get("forstevalg"):
                continue
            inst = {}
            for i, c in so_inst[(felt, niv, aar)].items():
                if c.get("forstevalg"):
                    inst[i] = {"forstevalg": c["forstevalg"], "andel": round(100 * c["forstevalg"] / tot["forstevalg"], 2),
                               "sokere": c.get("sokere", 0), "plasser": c.get("plasser", 0),
                               "tilbud": c.get("tilbud", 0), "program": c.get("program", 0)}
            ut[aar] = {"total": dict(tot), "institusjoner": dict(sorted(inst.items(), key=lambda kv: -kv[1]["forstevalg"]))}
        return ut

    def vinnere_tapere(serie, fra="2021", til=SISTE, n=5):
        if fra not in serie or til not in serie:
            return {}
        a, b = serie[fra]["institusjoner"], serie[til]["institusjoner"]
        rader = []
        for i in set(a) | set(b):
            fa, fb = a.get(i, {}).get("forstevalg", 0), b.get(i, {}).get("forstevalg", 0)
            pa, pb = a.get(i, {}).get("andel", 0.0), b.get(i, {}).get("andel", 0.0)
            rader.append({"inst": i, "fv" + fra: fa, "fv" + til: fb, "endring": fb - fa,
                          "endringProsent": round(100 * (fb - fa) / fa, 1) if fa else None,
                          "andel" + fra: pa, "andel" + til: pb, "endringPp": round(pb - pa, 2)})
        rader.sort(key=lambda r: -r["endringPp"])
        return {"fra": fra, "til": til, "vinnere": [r for r in rader if r["endringPp"] > 0][:n],
                "tapere": [r for r in reversed(rader) if r["endringPp"] < 0][:n]}

    marked_felt = {}
    for felt in ["alle"] + [f[0] for f in FAGFELT]:
        marked_felt[felt] = {}
        for niv in NIVAAGRUPPER:
            serie = andeler(felt, niv)
            if not serie:
                continue
            nm = {aar: serie[aar]["institusjoner"].get(NMBU, {}).get("andel", 0.0) for aar in serie}
            marked_felt[felt][niv] = {
                "aar": serie,
                "nmbuAndel": nm,
                "vinnereTapere": vinnere_tapere(serie),
                "vinnereTapere2025": vinnere_tapere(serie, "2025", SISTE),
            }

    # program-vinnere og -tapere nasjonalt (Samordna, aktive i både 2021 og 2026)
    prog_endring = []
    for rad in sorader.values():
        a, b = rad["aar"].get("2021", {}).get("forstevalg"), rad["aar"].get(SISTE, {}).get("forstevalg")
        if a is None or b is None:
            continue
        prog_endring.append({"id": rad["id"], "navn": rad.get("navn"), "inst": rad.get("inst"),
                             "fagfelt": rad["fagfelt"], "fv2021": a, "fv2026": b, "endring": b - a,
                             "endringProsent": round(100 * (b - a) / a, 1) if a else None})
    prog_endring.sort(key=lambda r: -r["endring"])
    prog_vt = {"vinnere": prog_endring[:20], "tapere": list(reversed(prog_endring[-20:])),
               "vinnereProsentMin50": sorted([r for r in prog_endring if r["fv2021"] >= 50],
                                            key=lambda r: -r["endringProsent"])[:20],
               "tapereProsentMin50": sorted([r for r in prog_endring if r["fv2021"] >= 50],
                                           key=lambda r: r["endringProsent"])[:20]}

    # ---------------- markedet, DBH-linsen (alle institusjoner inkl. private utenfor Samordna), 2021–2025
    dbh_marked = collections.defaultdict(lambda: collections.defaultdict(tom))
    dbh_inst = collections.defaultdict(lambda: collections.defaultdict(tom))
    for p in dbhprog.values():
        if p["videreutdanning"] or p["nivaagruppe"] in ("annet", "ph.d."):
            continue
        for aar, ot in p.get("aar", {}).items():
            for typ, c in ot.items():
                for felt in (p["fagfelt"], "alle"):
                    for niv in ("alle", p["nivaagruppe"]):
                        m = dbh_marked[(felt, niv)][aar]
                        mi = dbh_inst[(felt, niv, aar)][p["inst"]]
                        for k in ("sokere", "forstevalg", "kvalifiserte", "tilbud", "akseptert", "mott"):
                            m[k] += c.get(k, 0)
                            m[f"{k}{typ}"] += c.get(k, 0)
                            mi[k] += c.get(k, 0)
    dbh_felt = {}
    for felt in ["alle"] + [f[0] for f in FAGFELT]:
        dbh_felt[felt] = {}
        for niv in ["alle", "bachelor", "arsstudium", "master5", "master2", "erfaringsmaster"]:
            serie = {}
            for aar in DBH_AAR:
                tot = dbh_marked[(felt, niv)][aar]
                if not tot.get("mott"):
                    continue
                inst = {i: {"mott": c["mott"], "andelMott": round(100 * c["mott"] / tot["mott"], 2),
                            "sokere": c["sokere"], "forstevalg": c["forstevalg"], "tilbud": c["tilbud"]}
                        for i, c in dbh_inst[(felt, niv, aar)].items() if c.get("mott")}
                serie[aar] = {"total": dict(tot), "institusjoner": dict(sorted(inst.items(), key=lambda kv: -kv[1]["mott"]))}
            if serie:
                dbh_felt[felt][niv] = {"aar": serie,
                                       "nmbuAndelMott": {a: serie[a]["institusjoner"].get(NMBU, {}).get("andelMott", 0.0)
                                                         for a in serie}}

    # institusjonsnivå: sum førstevalg og andel per år (Samordna-linsen, alle felt, alle nivå)
    for inst, rec in institusjoner.items():
        s = {}
        for aar in AAR:
            x = marked_felt["alle"]["alle"]["aar"].get(aar, {}).get("institusjoner", {}).get(inst)
            if x:
                s[aar] = x
        if s:
            rec["samordnaProgramsum"] = s
        d = {}
        for aar in DBH_AAR:
            x = dbh_felt["alle"].get("alle", {}).get("aar", {}).get(aar, {}).get("institusjoner", {}).get(inst)
            if x:
                d[aar] = x
        if d:
            rec["dbhGradsprogram"] = d

    # ---------------- fagfelt.json
    fagfelt_ut = []
    for fid, navn, grupper, typer in FAGFELT:
        nmbu_p = [p for p in dbhprog.values() if p["inst"] == NMBU and p["fagfelt"] == fid and p["status"] != "nedlagt"
                  and not p["videreutdanning"] and p["nivaagruppe"] not in ("annet", "ph.d.")]
        fak = collections.defaultdict(list)
        for p in nmbu_p:
            fak[p.get("nmbuFakultet") or ("NMBU sentralt" if p.get("fakultetskode") == "000" else p.get("fakultet"))
                or "ukjent"].append(f"{p['navn']} ({p['nivaa']})")
        nmbu_so = [s for s in sorader.values() if s.get("inst") == NMBU and s["fagfelt"] == fid and s["status"] == "aktiv"]
        fagfelt_ut.append({
            "id": fid, "navn": navn,
            "nusFaggrupper": {g: nus_navn.get("6" + g) or nus_navn.get("7" + g) for g in grupper},
            "samordnaUtdanningstyper": typer,
            "antall": {
                "dbhProgramAktive": sum(1 for p in dbhprog.values() if p["fagfelt"] == fid and p["status"] != "nedlagt"),
                "dbhGradsprogramAktive": sum(1 for p in dbhprog.values() if p["fagfelt"] == fid and p["status"] != "nedlagt"
                                             and not p["videreutdanning"] and p["nivaagruppe"] not in ("annet", "ph.d.")),
                "soProgramAktive": sum(1 for s in sorader.values() if s["fagfelt"] == fid and s["status"] == "aktiv"),
            },
            "nmbuFakulteter": [{"fakultet": k, "antallProgram": len(v), "program": sorted(v)}
                               for k, v in sorted(fak.items(), key=lambda kv: -len(kv[1]))],
            "nmbuKonkurrerer": bool(nmbu_p or nmbu_so),
            "nmbuSamordnaProgram": sorted(f"{s['navn']} ({s['kode']})" for s in nmbu_so),
            "samordna2026": marked_felt[fid].get("alle", {}).get("aar", {}).get(SISTE, {}).get("total"),
            "nmbuAndelFv": marked_felt[fid].get("alle", {}).get("nmbuAndel"),
        })

    # ---------------- kontroll mot manuelle koblinger i data/<fak>/
    fasit = {}
    for fak in ["hh", "landsam", "realtek", "biovit", "kbm", "mina", "vet"]:
        pk, dk = REPO / "data" / fak / "programkart.json", REPO / "data" / fak / "dbh-programkart.json"
        if not pk.exists() or not dk.exists():
            continue
        dbhmap = {p["entryId"]: p for p in json.loads(dk.read_text())["programs"]}
        for g in json.loads(pk.read_text()).get("groups", []):
            for e in g.get("programs", g.get("entries", [])):
                sk, eid = e.get("studiekode"), e.get("id")
                if sk and eid in dbhmap:
                    d = dbhmap[eid]
                    fasit[str(sk)] = {(inorm(d["institusjonskode"]), c) for c in d["studieprogramkoder"]}
    kontroll = collections.Counter()
    avvik = []
    for sk, forv in fasit.items():
        rad = sorader.get(sk)
        if not rad:
            kontroll["fasit_ikke_i_katalog"] += 1
            continue
        fått = {tuple(x.split(":")[1:3]) for x in rad.get("dbh", [])}
        if not fått:
            kontroll["fasit_uten_kobling"] += 1
            avvik.append({"so": sk, "navn": rad.get("navn"), "forventet": sorted(":".join(x) for x in forv), "fikk": []})
        elif fått & forv:
            kontroll[f"enig_{rad.get('kobling')}"] += 1
        else:
            kontroll[f"uenig_{rad.get('kobling')}"] += 1
            avvik.append({"so": sk, "navn": rad.get("navn"), "forventet": sorted(":".join(x) for x in forv),
                          "fikk": sorted(":".join(x) for x in fått), "kobling": rad.get("kobling")})

    # ---------------- fagskole (Samordna)
    fagskole = bygg_so_tabell(last_rapporttabell("grunndata_tabell_2_hyu_hoved"))
    fagskole_ut = []
    for kode, p in sorted(fagskole.items()):
        navn_siste = p["navnPerAar"][max(p["navnPerAar"])] if p["navnPerAar"] else None
        fagskole_ut.append({"kode": kode, "navn": navn_siste, "institusjon": p["inst"], "sted": p["sted"],
                            "utdtype": p["utdtype"], "fagfelt": felt_fra_so_type(p["utdtype"]) or "uoppgitt",
                            "aar": p["aar"]})

    # ---------------- skriv
    def rens(d):
        return {k: v for k, v in d.items() if v not in (None, [], {}, "")}

    dbh_rader = [rens(p) for p in sorted(dbhprog.values(), key=lambda p: p["id"])]
    so_rader = [rens(s) for s in sorted(sorader.values(), key=lambda s: s["id"])]
    alle = so_rader + dbh_rader
    meta = {
        "hentet": hentet,
        "beskrivelse": "Nasjonal programkatalog: alle studieprogram i DBH 347 (type dbh) og alle studiekoder i "
                       "Samordna opptak 2021–2026 (type so). Se docs/marked/nasjonal-katalog.md.",
        "kilder": [
            "DBH 347, 370, 379, 210, 211 (dbh-data.dataporten-api.no), hentet " + hentet,
            "Samordna/HK-dir søkertallrapport 2026, programnivå 2021–2026 (sokertallrapport.samordnaopptak.no)",
            "SO-datavarehuset (Tableau): poenggrenser og ventelister 2020–2026",
            "Samordnas søke-API (sok.samordnaopptak.no/api/v1/search), opptakene 2020–2026",
            "SSB Klass 36 (NUS2000)",
        ],
        "felt": {
            "so.aar": "sokere, forstevalg, plasser, kvinneandelFv (%), kvalifiserte, tilbud (søkertallrapporten); "
                      "pgOrd, pgFv (poenggrense hovedopptak, 0 = alle kvalifiserte), pgOrdSupp, pgFvSupp "
                      "(suppleringsopptak), vlOrd, vlFv, vlOrdSupp, vlFvSupp (søkere på venteliste); "
                      "plasserKatalog (planlagte plasser i søkeportalen), avlyst",
            "dbh.aar": "per opptakstype L (lokalt) og N (nasjonalt/Samordna): sokere (søknadsalternativer), "
                       "forstevalg (prioritet 1), kvalifiserte, tilbud, akseptert, mott (DBH 379, sum vår+høst)",
        },
    }
    rå = json.dumps(alle, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    progdir = KATALOG / "program"
    if len(rå) <= GRENSE_BYTES:
        skriv_json(KATALOG / "program.json", {**meta, "program": alle})
        programfiler = ["program.json"]
    else:
        per = collections.defaultdict(list)
        for r in alle:
            per[r.get("fagfelt", "uoppgitt")].append(r)
        indeks = {**meta, "filer": {}}
        for f, rader in sorted(per.items()):
            skriv_json(progdir / f"{f}.json", {"fagfelt": f, "navn": FAGFELT_NAVN.get(f), "program": rader})
            indeks["filer"][f] = {"fil": f"program/{f}.json", "navn": FAGFELT_NAVN.get(f),
                                  "so": sum(1 for r in rader if r["type"] == "so"),
                                  "dbh": sum(1 for r in rader if r["type"] == "dbh"),
                                  "bytes": (progdir / f"{f}.json").stat().st_size}
        skriv_json(progdir / "indeks.json", indeks, kompakt=False)
        programfiler = [f"program/{f}.json" for f in sorted(per)] + ["program/indeks.json"]
        gammel = KATALOG / "program.json"
        if gammel.exists():
            gammel.unlink()

    skriv_json(KATALOG / "fagskole.json", {"hentet": hentet, "kilde": "Samordna/HK-dir søkertallrapport 2026, "
               "fagskoler (grunndata_tabell_2_hyu_hoved)", "merknad": "Holdt utenfor UH-markedet i marked.json.",
               "program": fagskole_ut})
    skriv_json(KATALOG / "fagfelt.json", {"hentet": hentet, "regel": "Fagfelt settes fra NUS-faggruppen (siffer 2–3 "
               "i NUS-koden) til DBH-programmet. Samordna-koder uten DBH-kobling får fagfelt fra Samordnas "
               "utdanningstype, deretter fra hovedområdet i søke-API-et.", "fagfelt": fagfelt_ut}, kompakt=False)
    skriv_json(KATALOG / "institusjoner.json", {"hentet": hentet, "institusjoner": list(institusjoner.values())})
    skriv_json(KATALOG / "marked.json", {
        "hentet": hentet,
        "metode": {
            "samordna": "Markedsandel = institusjonens andel av alle førstevalgssøkere (hver søker har ett "
                        "førstevalg, så summen er unike personer). Grunnlag: programnivåtabellen fra "
                        "søkertallrapporten 2026 (UH, hovedopptaket), 2021–2026. 'sokere' er søknader (en søker "
                        "kan stå på inntil ti program), ikke personer.",
            "dbh": "DBH 379, gradsprogram (bachelor, årsstudium, master), både lokalt og nasjonalt opptak, "
                   "2021–2025. Andel = andel av møtt til studiestart. Tar med private utenfor Samordna "
                   "(BI, Kristiania m.fl.). Små celler er skjermet i DBH.",
            "nivaa": "bachelor, arsstudium, master5 (integrert master og profesjonsstudium i Samordna).",
        },
        "samordna": marked_felt,
        "dbh": dbh_felt,
        "programEndring2021til2026": prog_vt,
    })
    skriv_json(KATALOG / "kontroll.json", {
        "hentet": hentet,
        "antall": {"dbhProgram": len(dbh_rader), "dbhAktive": sum(1 for p in dbh_rader if p["status"] != "nedlagt"),
                   "soKoder": len(so_rader), "soAktive2026": sum(1 for s in so_rader if s["status"] == "aktiv"),
                   "fagskoleKoder": len(fagskole_ut), "institusjoner": len(institusjoner),
                   "rader379UtenProgramI347": uten_379},
        "soInstTilDbh": {str(k): v for k, v in sorted(so_til_dbh_inst.items())},
        "koblingSoDbh": dict(koblet),
        "kontrollMotManuelleKoblinger": dict(kontroll),
        "avvikMotManuelle": avvik,
        "fagfeltKildeSo": dict(collections.Counter(s.get("fagfeltKilde", "ingen") for s in so_rader)),
        "fagfeltFordeling": {
            "so": dict(collections.Counter(s["fagfelt"] for s in so_rader)),
            "dbh": dict(collections.Counter(p["fagfelt"] for p in dbh_rader)),
        },
        "soUtenSokertall": [s["kode"] for s in so_rader if not any("forstevalg" in d for d in s["aar"].values())],
        "programfiler": programfiler,
    }, kompakt=False)
    print(f"DBH-program: {len(dbh_rader)}  SO-koder: {len(so_rader)}  fagskole: {len(fagskole_ut)}")
    print("SO->DBH:", dict(koblet))
    print("kontroll mot manuelle:", dict(kontroll))
    print("filer:", programfiler)


if __name__ == "__main__":
    main()
