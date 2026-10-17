#!/usr/bin/env python3
"""Profiler av handelshøyskolene og de økonomisk-administrative miljøene i Norge (oppgave A3).

Skriver data/marked/handelshoyskoler/profiler.json: én post per miljø, med nøkler som er kompatible med
kilde/src/app/data/konkurrenter.ts (id, kort, navn, inst, enhet, enhetNavn, studiested, nettside, uhr, programmer).

Tallgrunnlag (alt hentes fra cache; ingen nettkall her):
  DBH (HK-dir), cache i data/nmbu/kilder/dbh-fagmiljo/ (fra scripts/build-staff.py) og kilder/dbh/ (dbh_hent.py):
    225 årsverk per avdeling og stillingskode  -> faglige årsverk (UN1+UN3+UN4), rekruttering (UN2),
                                                 førstestillinger, professorer, dosenter, professor II
    123 registrerte studenter (høst)           373 publiseringspoeng og publikasjoner
    374 publisering per nivå (nivå 2-andel av forfatterandeler, HK-dirs definisjon)
    900 studiepoengproduksjon per emneeiende avdeling (studentårsverk = 60 sp)
    101 avlagte doktorgrader per avdeling og program     347 (nivå FU) ph.d.-programmene med navn
  Forskningsrådet, Prosjektbanken (nfr_hent.py): utbetalt per år til enheten (minimumstall).
  kilde/public/fagmiljo/forskning.json (scripts/build-forskning.py): NFR og EU (CORDIS) på institusjonsnivå.
  data/rangering/skoler.json: akkrediteringer og rangeringer (kilder per post).
  data/hh/strategier/<id>.json: strategidokumenter, visjon og satsinger (kilder per dokument).
  data/hh/markedsstatus.json: punkter fra styrepapirer (kilde i parentes per punkt).
  data/hh/programkart.json: programmene i HHs sammenligninger (entryId).
  Kvalitative felt som ikke finnes i datafilene over (ledelse, organisering, campuser, nylige endringer) står i
  MANUELT nedenfor, med kilde og hentedato per opplysning. Se docs/marked/handelshoyskoler.md.

Bruk:
  python3 data/marked/handelshoyskoler/bygg_profiler.py
"""
import collections
import datetime as dt
import json
import re
from pathlib import Path

HER = Path(__file__).resolve().parent
ROOT = HER.parents[2]
DF = ROOT / "data" / "nmbu" / "kilder" / "dbh-fagmiljo"
EGEN = HER / "kilder" / "dbh"
PB = HER / "kilder" / "prosjektbanken"
AAR = ["2021", "2022", "2023", "2024", "2025"]

UN = {}
for r in json.loads((DF / "220_stillingskoder.json").read_text())[1:]:
    UN[r["Stillingskode"]] = (r.get("Stillingskategorikode") or "", r.get("Stillingsbenevnelse") or "")
FORSTE = {k for k, (c, n) in UN.items() if c == "UN1" and re.search(r"professor|førsteamanuensis|dosent|førstelektor", n, re.I)}
PROFESSOR = {"1013", "1404"}          # professor (ordinær stilling); professor II telles for seg
DOSENT = {"1532", "1012"}             # dosent, høgskoledosent
PROF2 = {"8013", "9301"}              # professor II (bistilling)


def les(tabell, inst):
    for d in (DF, EGEN):
        f = d / f"{tabell}_{inst}.json"
        if f.exists():
            rows = json.loads(f.read_text(encoding="utf-8"))
            return [r for r in rows if "status" not in r]
    return []


def fl(v):
    try:
        return float(v or 0)
    except (TypeError, ValueError):
        return 0.0


def r1(x, n=1):
    return None if x is None else round(x, n)


# --------------------------------------------------------------------------------------------- enhetene
# avd: liste med avdelingskoder (eksakt) eller prefikser som slutter på «*». None = hele institusjonen.
# fak: fakultetsnivået (staffData-enheten) som prefiks. inst: én eller flere DBH-koder (INN 0264 -> 1177).
ENHETER = [
    dict(id="nhh", kort="NHH", inst=["1240"], enhet="1240_000000", avd=None, fak=None),
    dict(id="bi", kort="BI", inst=["8241"], enhet="8241_000000", avd=None, fak=None),
    dict(id="nmbu", kort="NMBU", inst=["1173"], enhet="1173_470", avd=["47*"], fak=["47*"]),
    dict(id="uia", kort="UiA", inst=["1171"], enhet="1171_415", avd=["415*"], fak=["415*"]),
    dict(id="uis", kort="UiS", inst=["1160"], enhet="1160_230", avd=["23*"], fak=["23*"], tillegg={"nhs": ["210245"]}),
    dict(id="nord", kort="Nord", inst=["1174"], enhet="1174_510", avd=["51*"], fak=["51*"]),
    dict(id="ntnu", kort="NTNU", inst=["1150"], enhet="1150_230", avd=["230210", "230230"], fak=["230*"],
         tillegg={"hhsAlene": ["230210"], "samfunnsokonomi": ["230230"]}),
    dict(id="usn", kort="USN", inst=["1176"], enhet="1176_620", avd=["62*"], fak=["62*"]),
    dict(id="oslomet", kort="OsloMet", inst=["1175"], enhet="1175_530", avd=["530350"], fak=["53*"]),
    dict(id="uit", kort="UiT", inst=["1130"], enhet="1130_540", avd=["540230"], fak=["54*"]),
    dict(id="hvl", kort="HVL", inst=["0238"], enhet="0238_250", avd=["250350"], fak=["25*"]),
    dict(id="inn", kort="INN", inst=["0264", "1177"], enhet="1177_440", avd=["440400", "440500"], fak=["44*"]),
    dict(id="himolde", kort="HiMolde", inst=["0232"], enhet="0232_462", avd=["461*", "462*"], fak=["461*", "462*"],
         tillegg={"logistikk": ["461*"], "okonomiSamfunn": ["462*"]}),
    dict(id="kristiania", kort="Kristiania", inst=["8253"], enhet="8253_310",
         avd=["31*", "33*", "38*"], fak=["31*", "33*", "38*"]),
    dict(id="hiof", kort="HiØ", inst=["0256"], enhet="0256_370", avd=["370300"], fak=["37*"]),
    dict(id="nla", kort="NLA", inst=["8223"], enhet="8223_540", avd=["54*"], fak=["54*"], tillegg={"institusjon": "HEL"}),
    dict(id="onh", kort="ONH", inst=["1407"], enhet="1407_240", avd=["24*"], fak=["24*"], tillegg={"institusjon": "HEL"}),
    dict(id="uib_okon", kort="UiB økonomi", inst=["1120"], enhet="1120_210", avd=["210620"], fak=["21*"], referanse=True),
    dict(id="uio_okon", kort="UiO økonomi", inst=["1110"], enhet="1110_210", avd=["210620"], fak=["21*"], referanse=True),
]
# NB: Fakultetskoden er tre første siffer i avdelingskoden for disse institusjonene (kontrollert mot DBH 210),
# bortsett fra Molde (to avdelinger 461/462) og Kristiania (310+330 t.o.m. 2025, 380 fra 2026).


def treff(avd, mønstre):
    if mønstre is None:
        return True
    for m in mønstre:
        if m.endswith("*"):
            if avd.startswith(m[:-1]):
                return True
        elif avd == m:
            return True
    return False


def nokkeltall(inst_koder, mønstre, hel_inst=False):
    """Per år: årsverk, studenter, studiepoeng, publisering for avdelingene som treffer mønstrene."""
    acc = collections.defaultdict(lambda: collections.defaultdict(float))
    for inst in inst_koder:
        for r in les("225", inst):
            y, avd = r.get("Årstall"), r.get("Avdelingskode", "")
            if y not in AAR or not treff(avd, mønstre):
                continue
            kode, v = r.get("Stillingskode"), fl(r.get("Antall årsverk"))
            kat = UN.get(kode, ("", ""))[0]
            a = acc[y]
            a["n225"] += 1
            a["arsverk"] += v
            if kat in ("UN1", "UN3", "UN4"):
                a["faglige"] += v
            if kat == "UN1":
                a["un1"] += v
            if kat == "UN2":
                a["rekruttering"] += v
            if kode in FORSTE:
                a["forste"] += v
            if kode in PROFESSOR:
                a["professorer"] += v
            if kode in DOSENT:
                a["dosenter"] += v
            if kode in PROF2:
                a["professorII"] += v
            if kode == "1352":
                a["postdoktorer"] += v
        for r in les("123", inst):
            y, avd = r.get("Årstall"), r.get("Avdelingskode", "")
            if y in AAR and treff(avd, mønstre):
                acc[y]["n123"] += 1
                acc[y]["studenter"] += fl(r.get("Antall totalt"))
        for r in les("900", inst):
            y, avd = r.get("Årstall"), r.get("Avdkode emne", "")
            if y in AAR and treff(avd, mønstre):
                acc[y]["n900"] += 1
                acc[y]["studentarsverk"] += fl(r.get("Ny produksjon totalt"))
                acc[y]["studentarsverkEgen"] += fl(r.get("Ny produksjon egentfin"))
        rows373 = les("373", inst)
        har_total = any(x.get("Avdelingskode") == "000000" for x in rows373)
        for r in rows373:
            y, avd = r.get("Årstall"), r.get("Avdelingskode", "")
            if y not in AAR:
                continue
            ok = (avd == "000000") if (hel_inst and har_total) else (avd != "000000" and treff(avd, mønstre))
            if ok:
                acc[y]["n373"] += 1
                acc[y]["publPoeng"] += fl(r.get("Publiseringspoeng"))
                acc[y]["publikasjoner"] += fl(r.get("Antall publikasjoner"))
        rows374 = les("374", inst)
        bare_total = bool(rows374) and all(x.get("Avdelingskode") == "000000" for x in rows374)
        for r in rows374:
            y, avd = r.get("Årstall"), r.get("Avdelingskode", "")
            # 374 sin totalrad er ufullstendig for noen institusjoner: summer avdelingene (også for hele inst.),
            # unntatt når institusjonen bare rapporterer totalraden (NLA, ONH).
            if y not in AAR or not treff(avd, mønstre):
                continue
            if avd == "000000" and not (hel_inst and bare_total):
                continue
            fa, pp = fl(r.get("Forfatterandeler")), fl(r.get("Publiseringspoeng"))
            acc[y]["fa"] += fa
            acc[y]["pp"] += pp
            if str(r.get("Kvalitetsniva")) == "2":
                acc[y]["fa2"] += fa
                acc[y]["pp2"] += pp
    ut = {}
    for y in AAR:
        a = acc.get(y)
        if not a or (a.get("faglige", 0) == 0 and a.get("studenter", 0) == 0 and a.get("publPoeng", 0) == 0):
            continue
        f, hk = a.get("faglige", 0), a.get("un1", 0) + a.get("rekruttering", 0)
        ut[y] = {
            "fagligeArsverk": r1(f), "rekrutteringArsverk": r1(a.get("rekruttering", 0)),
            "alleArsverk": r1(a.get("arsverk", 0)),
            "forstestillingArsverk": r1(a.get("forste", 0)),
            "andelForstestilling": r1(100 * a["forste"] / f) if f else None,
            "professorArsverk": r1(a.get("professorer", 0)),
            "andelProfessor": r1(100 * a.get("professorer", 0) / f) if f else None,
            "dosentArsverk": r1(a.get("dosenter", 0)), "professorIIArsverk": r1(a.get("professorII", 0)),
            "registrerteStudenter": int(a.get("studenter", 0)),
            "studentarsverk": r1(a.get("studentarsverk", 0)),
            "studiepoeng": int(round(60 * a.get("studentarsverk", 0), -2)) if a.get("studentarsverk") else 0,
            "studentarsverkPerFagligArsverk": r1(a["studentarsverk"] / f) if f and a.get("studentarsverk") else None,
            "publiseringspoeng": r1(a.get("publPoeng", 0)), "publikasjoner": int(a.get("publikasjoner", 0)),
            "poengPerFagligArsverk": r1(a["publPoeng"] / f, 2) if f else None,
            "poengPerArsverkHkdir": r1(a["publPoeng"] / hk, 2) if hk else None,
            "andelNiva2": r1(100 * a["fa2"] / a["fa"]) if a.get("fa") else None,
            "andelNiva2Poeng": r1(100 * a["pp2"] / a["pp"]) if a.get("pp") else None,
        }
        # Felt uten rader i DBH for enheten (f.eks. NLA-årsverk på gamle campuskoder, ONH-studenter bare på 000000)
        # settes til null, ikke 0.
        tom = {"n225": ["fagligeArsverk", "rekrutteringArsverk", "alleArsverk", "forstestillingArsverk", "andelForstestilling",
                        "professorArsverk", "andelProfessor", "dosentArsverk", "professorIIArsverk",
                        "studentarsverkPerFagligArsverk", "poengPerFagligArsverk", "poengPerArsverkHkdir"],
               "n123": ["registrerteStudenter"], "n900": ["studentarsverk", "studiepoeng", "studentarsverkPerFagligArsverk"],
               "n373": ["publiseringspoeng", "publikasjoner", "poengPerFagligArsverk", "poengPerArsverkHkdir"]}
        for n, felt in tom.items():
            if not a.get(n):
                for k in felt:
                    ut[y][k] = None
    return ut


def disputaser(inst_koder, mønstre):
    per_aar, per_prog = collections.Counter(), collections.Counter()
    for inst in inst_koder:
        for r in les("101", inst):
            y, avd = r.get("Årstall"), r.get("Avdelingskode", "")
            if y in AAR and treff(avd, mønstre):
                n = int(fl(r.get("Antall totalt")))
                per_aar[y] += n
                per_prog[r.get("Studieprogramkode")] += n
    navn = {}
    for inst in inst_koder:
        f = EGEN / f"347fu_{inst}.json"
        if f.exists():
            for r in json.loads(f.read_text())[1:]:
                navn[(inst, r["Studieprogramkode"])] = (r.get("Studieprogramnavn"), r.get("Avdelingskode"), r.get("Avdelingsnavn"))
    prog = []
    for k, n in per_prog.most_common():
        nv = next((v for (i, kk), v in sorted(navn.items(), reverse=True) if kk == k), (None, None, None))
        prog.append({"kode": k, "navn": nv[0], "eierAvdeling": nv[1], "eierAvdelingNavn": nv[2], "disputaser2021_2025": n})
    return {"perAar": {y: per_aar.get(y, 0) for y in AAR}, "sum2021_2025": sum(per_aar.values()), "programmer": prog}


def pb_enhet(inst, navnmønster, niva=4, fak_slug=None):
    """Prosjektbanken: utbetalt per år (mill. kr) til enheter med navn som treffer mønsteret."""
    ut = {}
    for y in AAR:
        if niva == 4:
            f = PB / f"niva4_{inst}_{y}.json"
        else:
            f = PB / f"niva5_{inst}_{fak_slug}_{y}.json"
        if not f.exists():
            continue
        d = json.loads(f.read_text())
        s = sum(x["sum"] for x in d["calculations"]["sums"] if re.search(navnmønster, x["displayName"], re.I))
        ut[y] = round(s / 1e6, 2)
    return ut


# Prosjektbanken-oppslag per enhet: (inst, regex på enhetsnavn, nivå, fakultets-slug for nivå 5, merknad)
PB_OPPSLAG = {
    "nhh": ("1240", r".", 4, None, "Hele NHH (institusjonsnivå + instituttene)."),
    "bi": ("8241", r".", 4, None, "Hele BI."),
    "nmbu": ("1173", r"^HANDELSHØYSKOLEN$", 4, None, None),
    "uia": ("1171", r"HANDELSHØYSKOLEN VED UIA", 4, None, None),
    "uis": ("1160", r"HANDELSHØGSKOLEN VED UIS", 4, None, None),
    "nord": ("1174", r"HANDELSHØGSKOLEN", 4, None, None),
    "ntnu": ("1150", r"FAKULTET FOR ØKONOMI", 4, None, "Hele Fakultet for økonomi (Prosjektbanken fordeler ikke på institutt)."),
    "usn": ("1176", r"USN HANDELSHØYSKOLEN", 4, None, None),
    "oslomet": ("1175", r"Handelshøyskolen ved OsloMet", 5, "fakultetforsamfunnsvitenskap", None),
    "uit": ("1130", r"Handelshøgskolen ved UiT", 5, "fakultetforbiovitenskapfiskeriogøkonomi",
            "Bare 2021 har beløp ført på Handelshøgskolen; senere år ligger på fakultets- eller institusjonsnivå."),
    "hvl": None, "himolde": ("0232", r".", 4, None, "Hele HiMolde (ikke fordelt på avdeling i Prosjektbanken)."),
    "inn": ("1177", r"HANDELSHØGSKOLEN INNLANDET", 4, None, None),
    "kristiania": ("8253", r".", 4, None, "Hele Kristiania (ikke fordelt på fakultet)."),
    "hiof": ("0256", r"INFORMASJONSTEKNOLOGI, INGENIØRFAG OG ØKONOMI", 4, None, "Hele fakultetet IIØ."),
    "nla": ("8223", r".", 4, None, "Hele NLA."),
    "onh": None,
    "uib_okon": ("1120", r"^Institutt for økonomi$", 5, "detsamfunnsvitenskapeligefakultet",
                 "Prosjektbanken gir samme svar for UiB og UiO når filteret er fakultetsnavnet (begge heter Det samfunnsvitenskapelige "
                 "fakultet); instituttet er derfor skilt ut på navn. Mye ligger på fakultets- og institusjonsnivå."),
    "uio_okon": ("1110", r"^Økonomisk institutt$", 5, "detsamfunnsvitenskapeligefakultet",
                 "Se merknaden for UiB: instituttet er skilt ut på navn."),
}

# --------------------------------------------------------------------------------------------- manuelt
H = "2026-10-17"


def main():
    MANUELT = json.loads((HER / "manuelt.json").read_text(encoding="utf-8"))
    skoler = {s["id"]: s for s in json.loads((ROOT / "data/rangering/skoler.json").read_text())}
    marked = {i["id"]: i for i in json.loads((ROOT / "data/hh/markedsstatus.json").read_text())["institusjoner"]}
    forsk = json.loads((ROOT / "kilde/public/fagmiljo/forskning.json").read_text())
    pk = json.loads((ROOT / "data/hh/programkart.json").read_text())
    staff = json.loads((ROOT / "kilde/src/app/data/staffData.json").read_text())
    staff_ids = {u["id"] for u in staff["fakulteter"]["hh"]}
    prog_per_inst = collections.defaultdict(list)
    for g in pk["groups"]:
        for p in g["programs"]:
            prog_per_inst[p["id"].split("_")[0]].append(
                {"entryId": p["id"], "gruppe": g["id"], "gruppeNavn": g["label"], "programnavn": p["programnavn"],
                 "studiested": p.get("studiested"), "standardIHH": bool(p.get("default"))})
    nmbu_motstykke = {"oa": "nmbu_oa", "moa": "nmbu_moa", "samf": "nmbu_samf", "olit": "nmbu_olit",
                      "mecon": "nmbu_mecon", "mei": "nmbu_mei", "aarsstudier": "nmbu_bel", "bioec": "nmbu_bioec"}

    profiler = []
    for e in ENHETER:
        m = MANUELT[e["id"]]
        hel = e["avd"] is None
        rec = {"id": e["id"], "kort": e["kort"], "navn": m["navn"], "inst": e["inst"][-1],
               "instKoder": e["inst"], "enhet": e["enhet"], "enhetNavn": m["enhetNavn"],
               "enhetIStaffData": e["enhet"] in staff_ids, "referanse": bool(e.get("referanse")),
               "type": m["type"], "organisering": m["organisering"]}
        rec["dbh"] = {
            "institusjonskode": e["inst"], "avdelingskoderMiljo": e["avd"] or ["hele institusjonen"],
            "avdelingskoderFakultet": e["fak"] or ["hele institusjonen"], "merknad": m.get("dbhMerknad"),
        }
        tall = {"miljo": nokkeltall(e["inst"], e["avd"], hel)}
        if not hel and e["fak"] != e["avd"]:
            tall["fakultet"] = nokkeltall(e["inst"], e["fak"])
        for k, v in (e.get("tillegg") or {}).items():
            tall[k] = nokkeltall(e["inst"], None, True) if v == "HEL" else nokkeltall(e["inst"], v)
        rec["nokkeltall"] = tall
        rec["phd"] = {**disputaser(e["inst"], e["avd"]), "merknad": m.get("phdMerknad")}
        # eksterne midler
        ek = {}
        o = PB_OPPSLAG.get(e["id"])
        if o:
            inst, mønster, niva, slug, merk = o
            ek["nfrUtbetaltEnhet"] = {"millKr": pb_enhet(inst, mønster, niva, slug), "merknad": merk,
                                      "kilde": "Forskningsrådet, Prosjektbanken (kilder/prosjektbanken/)"}
        else:
            ek["nfrUtbetaltEnhet"] = {"millKr": None, "merknad": m.get("nfrMerknad") or "Enheten finnes ikke som egen enhet i Prosjektbanken.",
                                      "kilde": "Forskningsrådet, Prosjektbanken"}
        fi = forsk["institusjoner"].get(e["inst"][-1])
        if fi:
            eu = fi.get("eu", {})
            def eusum(prog):
                d = eu.get(prog) or {}
                return {"deltakelser": sum((d.get(y) or {}).get("deltakelser", 0) for y in AAR),
                        "bidragMillEuro": round(sum((d.get(y) or {}).get("bidragMillEuro", 0) for y in AAR), 2)}
            ek["institusjon"] = {
                "nfrUtbetaltMillKr": fi.get("nfrUtbetalt"),
                "euHorizonEurope2021_2025": eusum("horizonEurope"),
                "kilde": "kilde/public/fagmiljo/forskning.json (Prosjektbanken og CORDIS, institusjonsnivå)",
            }
        fo = forsk["fagomrade"]["okonomi"]["institusjoner"].get(e["inst"][-1])
        if fo and fo.get("nfr"):
            ek["nfrFagOkonomi"] = {
                "innvilgetMillKr": {y: (fo["nfr"].get(y) or {}).get("innvilgetBelop") for y in AAR},
                "soknader": {y: (fo["nfr"].get(y) or {}).get("soknader") for y in AAR},
                "merknad": "NFR-fag «Økonomi» på institusjonsnivå, etter søknadsår (åpne søknadsdata v2; Tibi-søknader fra 2023 mangler).",
            }
        ek["boa"] = m.get("boa")
        rec["eksterneMidler"] = ek
        # akkreditering og rangering
        sk = skoler.get({"uib_okon": "uib_okon", "uio_okon": "uio_okon"}.get(e["id"], e["id"]))
        rec["akkrediteringer"] = (sk or {}).get("akkrediteringer", []) + m.get("akkrediteringerTillegg", [])
        rec["akkrediteringMerknad"] = m.get("akkrediteringMerknad")
        rec["rangeringer"] = (sk or {}).get("rangeringer", [])
        rec["ledelse"] = m["ledelse"]
        rec["campuser"] = m["campuser"]
        # strategi
        sf = ROOT / "data/hh/strategier" / f"{e['id']}.json"
        if sf.exists():
            s = json.loads(sf.read_text())
            rec["strategi"] = {
                "visjon": s.get("visjon"),
                "dokumenter": [{"tittel": d["tittel"], "periode": d["periode"], "nivaa": d["nivaa"], "url": d["url"],
                                "status": d.get("status")} for d in s["strategier"]
                               if d["nivaa"] != "handlingsplan" and d.get("status") in ("gjeldende", "under arbeid", "vedtatt", None)][:8],
                "satsinger": sorted({x["tema"] for x in s.get("satsinger", [])}),
                "maal": [x["tekst"] for x in s.get("maal", [])][:6],
                "kilde": f"data/hh/strategier/{e['id']}.json",
            }
        else:
            rec["strategi"] = m.get("strategi")
        rec["nyligeEndringer"] = m.get("endringer", [])
        mk = marked.get({"uib_okon": "uib", "uio_okon": "uio"}.get(e["id"], e["id"]))
        rec["styresaker"] = {
            "punkter": (mk or {}).get("punkter", []) + m.get("styresakerTillegg", []),
            "kilde": "data/hh/markedsstatus.json (styrepapirer, hentet 24.09.2026)" if mk else m.get("styresakerKilde"),
        }
        # programmer og konkurrentforslag
        pid = {"uib_okon": "uib", "uio_okon": "uio"}.get(e["id"], e["id"])
        progs = prog_per_inst.get(pid, [])
        rec["programmerIHH"] = progs
        rec["konkurrentForslag"] = None if e["id"] == "nmbu" else {
            "id": e["id"], "kort": e["kort"], "navn": m["institusjonNavn"], "inst": e["inst"][-1],
            "enhet": e["enhet"], "enhetNavn": m["enhetNavn"], "studiested": m["studiested"], "nettside": m["nettside"],
            "uhr": m.get("uhr"),
            "programmer": [{"entryId": p["entryId"], "nmbuId": None if "_siv" in p["entryId"] else nmbu_motstykke.get(p["gruppe"]),
                            "gruppe": p["gruppe"], "etikett": p["programnavn"]} for p in progs],
            "klar": bool(progs) and e["enhet"] in staff_ids and bool(m.get("uhr")),
            "mangler": [x for x, ok in [("programmer i programkart.json", bool(progs)),
                                        ("enhet i staffData (HH)", e["enhet"] in staff_ids),
                                        ("nøkkel i COURSE_MAPPING", bool(m.get("uhr")))] if not ok],
        }
        rec["usikkerheter"] = m.get("usikkerheter", [])
        profiler.append(rec)

    ut = {
        "generert": dt.date.today().isoformat(),
        "beskrivelse": "Profil per økonomisk-administrativt miljø i Norge (A3). Tall fra DBH, Prosjektbanken og CORDIS; "
                       "kvalitative felt fra strategier, styrepapirer og institusjonenes nettsider. Se docs/marked/handelshoyskoler.md.",
        "definisjoner": {
            "fagligeArsverk": "DBH 225, stillingskategori UN1 + UN3 + UN4 (uten stipendiater og postdoktorer), som staffData.",
            "andelForstestilling": "Årsverk i professor-, dosent-, førsteamanuensis- og førstelektorstillinger (inkl. II-stillinger) / faglige årsverk.",
            "andelProfessor": "Årsverk professor (stillingskode 1013, 1404) / faglige årsverk. Dosenter og professor II står for seg.",
            "poengPerFagligArsverk": "Publiseringspoeng (DBH 373) / faglige årsverk.",
            "poengPerArsverkHkdir": "Publiseringspoeng / (UN1 + UN2), HK-dirs nevner i Tilstandsrapporten (se status-og-metode §42).",
            "andelNiva2": "Nivå 2-forfatterandeler / alle forfatterandeler (DBH 374), HK-dirs definisjon.",
            "andelNiva2Poeng": "Nivå 2-andel av publiseringspoengene (DBH 374), samme definisjon som niva2Andel i staffData.",
            "studentarsverk": "DBH 900, ny produksjon totalt for emner eid av enheten (60 sp = 1).",
            "studiepoeng": "studentarsverk × 60, avrundet til nærmeste hundre.",
            "disputaser": "DBH 101, avlagte doktorgrader der kandidatens avdeling hører til miljøet (alle program).",
            "nfrUtbetaltEnhet": "Prosjektbanken, utbetalt i kalenderåret til prosjekter der enheten er prosjektansvarlig. Minimumstall: "
                                "mye ligger på institusjonsnivå, og 2024 er lavt pga. bruttobudsjettering.",
            "miljo/fakultet": "«miljo» er den minste enheten som bærer navnet (som i rangeringen, data/rangering/skoler.json); "
                              "«fakultet» er enheten i staffData (HHs fagmiljøside) når den er større.",
        },
        "profiler": profiler,
    }
    (HER / "profiler.json").write_text(json.dumps(ut, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Skrev {len(profiler)} profiler til {HER / 'profiler.json'}")


if __name__ == "__main__":
    main()
