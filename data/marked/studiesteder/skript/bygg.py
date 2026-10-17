#!/usr/bin/env python3
"""Bygger den samlede studiestedslista (institusjon × studiested) fra Samordna og DBH 124.

Leser:
  ../kilder/124_<år>.json.gz          DBH 124, registrerte per program og campus, høst 2019–2025 (hent.py)
  ../kilder/123_inst.json.gz          DBH 123, registrerte per institusjon, høst (kontrollsum)
  ../kilder/bulk_662.csv.gz           DBH 662, campusregisteret (bare til opptelling i kontrollen)
  ../kilder/geo/                      SSB-kommuneendringer og Kartverket (geo.py, hentes ved behov)
  data/marked/nasjonal-katalog/       Samordna-kodene (sted, kommune, fylke, førstevalg) og DBH-programmene (fagfelt, nivå)
  data/hh/programkart.json            bare lest, for kontrollen av campusfeil i HH-kartet (ingenting rettes)

Skriver (data/marked/studiesteder/):
  studiesteder.json    én post per institusjon × studiested, med kilde, program, registrerte 2019–2025, førstevalg 2021–2026
  program-steder.json  koblingstabellen programkode → studiested(er) med studentfordeling
  kontroll.json        sum per institusjon mot DBH 123, steder bare i én kilde, uplasserte studenter
  hh-campusfeil.json   campusfeil i data/hh/programkart.json (rapport, ikke rettet)

Kjøring: python3 data/marked/studiesteder/skript/bygg.py
"""
import csv
import gzip
import io
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

import geo

HER = Path(__file__).resolve().parent
UT = HER.parent
KILDER = UT / "kilder"
ROT = UT.parent.parent.parent
KATALOG = ROT / "data" / "marked" / "nasjonal-katalog"
SR = ROT / "data" / "marked" / "studieresultater"

AAR = [str(a) for a in range(2019, 2026)]
FV_AAR = [str(a) for a in range(2021, 2027)]
NIVAER = ["bachelor", "master", "arsstudium", "profesjon", "annet"]
NIV_124 = {"B3": "bachelor", "B4": "bachelor", "M2": "master", "M5": "master", "ME": "master", "MX": "master",
           "AR": "arsstudium", "PR": "profesjon"}
NIV_SO = {"Bachelor": "bachelor", "Årsstudium": "arsstudium", "Master": "master", "Kandidat": "master",
          "Profesjonsstudium": "profesjon"}
# Store byer: alle campusene til én institusjon i kommunen slås sammen til ett studiested (Gløshaugen, Dragvoll … → Trondheim).
BYER = {"0301", "5001", "4601", "1103", "4204", "1804", "5501"}
# Manuelle rettelser per (institusjon, stedkode i DBH 124): (stedsnavn, kommunenummer) eller None = uplassert.
OVERSTYR = {
    ("1240", "NHH-OSL"): ("Oslo", "0301"),          # DBH oppgir Bergen kommune for NHH Oslo
    ("1240", "NHH-UTB"): None,                      # «NHH Utenbys»
    ("0217", "SH"): ("Kautokeino", "5612"),
    ("0217", "KARASJOK"): ("Karasjok", "5610"),     # Kárášjoga joatkaskuvla, oppgitt som 9999
    ("1303", "KJE"): ("Kristiansand", "4204"),      # Kjevik, oppgitt som 9999
    ("1176", "RINGERIKE"): ("Hønefoss", "3305"),    # Campus Ringerike fikk navnet Campus Hønefoss
}
PREFIKS = re.compile(r"^(UiT Norges arktiske universitet (i|på) |Handelshøyskolen BI - campus |Politihøgskolen [Ss]tudiested |"
                     r"[Ss]tudiested |Campus |Studiesenter |Avdeling |\(NMH på\) NTNU )", re.I)
INSTITUSJONSAKTIG = re.compile(r"høgskole|høyskole|høgskule|universitet|institutt|skolen|akademi|company|senter|^\d+$", re.I)
FORKORTELSE = re.compile(r"^[A-ZÆØÅ][A-Za-zÆØÅæøå]?[A-ZÆØÅ]{1,4}$")  # UiO, MF, NIH, AHO OSLO osv.
NETT = re.compile(r"nett|online", re.I)
LAND = {"Spania": "Spania", "Avdeling Aarhus": "Aarhus (Danmark)", "Avdeling København": "København (Danmark)",
        "BI Fudan": "Shanghai (Kina)", "Atlantis Medisinske Høgskole Spania": "Spania"}


def les(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def lesgz(p):
    with gzip.open(p, "rt", encoding="utf-8") as f:
        return json.load(f)


def norm(s):
    s = unicodedata.normalize("NFC", (s or "").strip())
    return re.sub(r"\s+", " ", s).lower()


def slug(s):
    t = unicodedata.normalize("NFKD", s.lower().replace("ø", "o").replace("æ", "ae").replace("å", "a"))
    return re.sub(r"[^a-z0-9]+", "-", t.encode("ascii", "ignore").decode()).strip("-")


# ── Grunnlag ─────────────────────────────────────────────────────────────────
inst_liste = les(KATALOG / "institusjoner.json")["institusjoner"]
SAMMENSLATT = {gml: i["kode"] for i in inst_liste for gml in (i.get("sammenslattFra") or [])}
sr_inst = les(SR / "program-indeks.json")["institusjoner"]
INST = {i["kode"]: {"n": i["navn"], "k": i.get("kortnavn") or i["navn"], "p": i.get("sektor") == "privat"} for i in inst_liste}
for k, i in sr_inst.items():
    INST.setdefault(k, {"n": i["navn"], "k": i.get("kortnavn") or i["navn"], "p": bool(i.get("privat"))})
    if i.get("privat"):
        INST[k]["p"] = True
KORT = {"1174": "Nord", "8253": "Kristiania", "0232": "HiMolde", "0236": "Volda", "0217": "Samisk høgskole", "1210": "NMH",
        "8247": "HGUt"}
for k, v in KORT.items():
    if k in INST:
        INST[k]["k"] = v


def inst_kode(k):
    return SAMMENSLATT.get(k, k)


fagfelt = [f["id"] for f in les(KATALOG / "fagfelt.json")["fagfelt"]]
so_rader, dbh_rader = [], {}
for f in sorted((KATALOG / "program").glob("*.json")):
    if f.name == "indeks.json":
        continue
    for r in les(f)["program"]:
        if r["type"] == "so":
            so_rader.append(r)
        else:
            dbh_rader[(r["inst"], r["kode"].strip())] = r

# ── DBH 124 ──────────────────────────────────────────────────────────────────
rader124 = []  # (år, inst, prog, stedkode, stednavn, knr, nivå, org, antall)
inst_navn_124 = {}
for y in AAR:
    for r in lesgz(KILDER / f"124_{y}.json.gz")["data"][1:]:
        inst = inst_kode(r["Institusjonskode"])
        inst_navn_124.setdefault(inst, r.get("Institusjonsnavn"))
        rader124.append((y, inst, (r["Studieprogramkode"] or "").strip(), (r["Stedkode campus"] or "").strip(),
                         (r["Stednavn campus"] or "").strip(), r["Kommunenummer campus"], r["Nivåkode"],
                         r.get("Organisering_kode"), int(r["Antall"] or 0)))
for k, n in inst_navn_124.items():
    INST.setdefault(k, {"n": n, "k": n, "p": True})

steg = geo.kommuneendringer()
# Siste kjente kommune og navn per campus (institusjon + stedkode)
campus = {}
for y, inst, prog, sk, sn, knr, *_ in sorted(rader124, key=lambda x: x[0]):
    c = campus.setdefault((inst, sk), {"navn": Counter(), "knr": None, "aar": set()})
    c["navn"][sn] += 1
    if knr not in ("9999",) or c["knr"] is None:
        c["knr"] = geo.dagens(knr, steg)
    c["aar"].add(y)

so_knr = {geo.dagens(r.get("kommune"), steg) for r in so_rader if r.get("kommune")}
KOMMUNER = geo.kommuner({c["knr"] for c in campus.values()} | so_knr | {v[1] for v in OVERSTYR.values() if v} | BYER)


# Alle stedsnavn Samordna bruker (en DBH-campus med samme navn beholder navnet, f.eks. Mo i Rana i Rana kommune).
SO_STEDER = {norm(d): d.strip() for r in so_rader for d in re.split(r"[/,]", r.get("sted") or "") if d.strip()}


def kommunenavn(knr):
    return (KOMMUNER.get(knr) or {}).get("kommunenavn")


def rens_dbh(inst, sk, navn, knr):
    """→ (type, stedsnavn, kommunenr) der type er sted, nett, utland eller uplassert."""
    if (inst, sk) in OVERSTYR:
        o = OVERSTYR[(inst, sk)]
        if o is None:
            return ("uplassert", navn, None)
        navn, knr = o
    if knr == "9899":
        return ("utland", LAND.get(navn, navn), None)
    if NETT.search(sk) or NETT.search(navn) or (inst == "8241" and sk == "F"):
        return ("nett", "Nettstudier", knr if knr != "9999" else None)
    if knr == "9999" or sk.upper() == "UPLASSERT":
        return ("uplassert", navn, None)
    kn = kommunenavn(knr) or ""
    if knr in BYER:
        return ("sted", kn, knr)
    n = PREFIKS.sub("", navn).strip()
    if "," in n:
        n = n.split(",")[-1].strip()
    n = n.split("/")[0].strip()
    n = re.sub(r" NUC$", "", n)
    if norm(n) in SO_STEDER:
        return ("sted", SO_STEDER[norm(n)], knr)
    if kn and re.search(rf"\b{re.escape(kn)}\b", n, re.I):
        return ("sted", kn, knr)
    if INSTITUSJONSAKTIG.search(n) or FORKORTELSE.match(n) or not n:
        return ("sted", kn, knr)
    return ("sted", n, knr)


def rens_so(r):
    """Samordna-kode → (type, stedsnavn, kommunenr, flere steder?)."""
    sted = (r.get("sted") or "").strip()
    knr = geo.dagens(r.get("kommune"), steg)
    kn = kommunenavn(knr) or ""
    flere = "/" in sted
    deler = [d.strip() for d in re.split(r"[/,]", sted) if d.strip()]
    if "Frankrike" in sted:
        return ("utland", sted.replace(", ", " (") + ")", None, False)
    if knr in BYER:
        return ("sted", kn, knr, flere)
    valgt = next((d for d in deler if norm(d) == norm(kn)), deler[0] if deler else kn)
    return ("sted", valgt, knr, flere)


# ── Studiestedene ────────────────────────────────────────────────────────────
steder = {}  # (inst, navn-normalisert) → post


def post(inst, typ, navn, knr):
    nokkel = (inst, "nett" if typ == "nett" else norm(navn))
    p = steder.get(nokkel)
    if not p:
        p = steder[nokkel] = {"inst": inst, "type": typ, "navn": navn, "knr": knr, "delsteder": Counter(), "kilder": set(),
                              "reg": defaultdict(lambda: defaultdict(lambda: [0] * len(AAR))),
                              "fv": defaultdict(lambda: defaultdict(lambda: [0] * len(FV_AAR))),
                              "dbhProg": defaultdict(set), "soKoder": defaultdict(set), "org": Counter(),
                              "soForm": Counter(), "prog": defaultdict(lambda: [0] * len(AAR)), "so": []}
    if knr and not p["knr"]:
        p["knr"] = knr
    return p


uplassert = defaultdict(lambda: [0] * len(AAR))
campus_til_post = {}
for (inst, sk), c in campus.items():
    navn = c["navn"].most_common(1)[0][0]
    typ, sted, knr = rens_dbh(inst, sk, navn, c["knr"])
    campus_til_post[(inst, sk)] = None if typ == "uplassert" else (typ, sted, knr, list(c["navn"]))

ff_dbh = {}
for y, inst, prog, sk, sn, knr, niv, org, n in rader124:
    m = campus_til_post[(inst, sk)]
    if m is None:
        uplassert[inst][AAR.index(y)] += n
        continue
    typ, sted, kk, navnene = m
    p = post(inst, typ, sted, kk)
    p["kilder"].add("D")
    for nv in navnene:
        if norm(nv) != norm(sted):
            p["delsteder"][nv] += n
    r = dbh_rader.get((inst, prog))
    ff = (r or {}).get("fagfelt") or "uoppgitt"
    nivaa = NIV_124.get(niv, "annet")
    i = AAR.index(y)
    p["reg"][ff][nivaa][i] += n
    p["prog"][(prog, ff, nivaa)][i] += n
    if y == AAR[-1] and n > 0:
        p["dbhProg"][(ff, nivaa)].add(prog)
        p["org"][{"1": "s", "2": "d", "3": "n"}.get(org, "s")] += n

# Har institusjonen en egen nettpost i DBH? Da legges Samordnas nettkoder dit.
har_nett = {k[0] for k, p in steder.items() if p["type"] == "nett"}
so_til_post = {}
for r in so_rader:
    typ, sted, knr, flere = rens_so(r)
    if r.get("nett") and r["inst"] in har_nett:
        typ, sted = "nett", "Nettstudier"
    p = post(r["inst"], typ, sted, knr)
    p["kilder"].add("S")
    if flere:
        p["delsteder"][r["sted"]] += 0
    if typ == "sted" and norm(r.get("sted")) != norm(sted) and not flere:
        p["delsteder"][r["sted"]] += 0
    nivaa = NIV_SO.get(r.get("programtype"), "annet")
    ff = r.get("fagfelt") or "uoppgitt"
    for i, y in enumerate(FV_AAR):
        p["fv"][ff][nivaa][i] += ((r.get("aar") or {}).get(y) or {}).get("forstevalg") or 0
    if r.get("status") == "aktiv":
        p["soKoder"][(ff, nivaa)].add(r["kode"])
        p["soForm"]["koder"] += 1
        if r.get("nett"):
            p["soForm"]["nett"] += 1
        if r.get("samlingsbasert"):
            p["soForm"]["samling"] += 1
    p["so"].append(r)
    so_til_post[r["kode"]] = (r["inst"], "nett" if typ == "nett" else norm(sted))

# Nettpostene plasseres på institusjonens største studiested (registrerte 2025, ellers førstevalg 2026).
hovedsted = {}
for (inst, _), p in steder.items():
    if p["type"] == "sted":
        vekt = (sum(sum(v[-1] for v in d.values()) for d in p["reg"].values()), sum(sum(v[-1] for v in d.values()) for d in p["fv"].values()))
        if inst not in hovedsted or vekt > hovedsted[inst][0]:
            hovedsted[inst] = (vekt, p)
for (inst, _), p in steder.items():
    if p["type"] == "nett" and inst in hovedsted:
        p["knr"] = hovedsted[inst][1]["knr"]
        p["hoved"] = hovedsted[inst][1]

# ── Koordinater ──────────────────────────────────────────────────────────────
punkter = geo.stedspunkt([(p["navn"], p["knr"]) for p in steder.values() if p["type"] == "sted" and p["knr"]])


def koordinat(p):
    if p["type"] == "utland" or not p["knr"]:
        return None, None
    if p.get("hoved"):
        ll, kilde = koordinat(p["hoved"])
        return ll, f"{kilde}; samme punkt som {p['hoved']['navn']}" if kilde else None
    if p["type"] == "sted":
        t = punkter.get((p["navn"], p["knr"]))
        if t:
            return t[0], f"Kartverket stedsnavn ({t[1].lower()})"
    k = KOMMUNER.get(p["knr"]) or {}
    return k.get("punkt"), "Kartverket kommuneinfo (punkt i kommunen)" if k.get("punkt") else None


# ── Postene ut ───────────────────────────────────────────────────────────────
ut_steder = []
id_for = {}
for nokkel, p in sorted(steder.items(), key=lambda kv: (kv[0][0], kv[1]["type"] != "sted", kv[1]["navn"])):
    inst = p["inst"]
    sid = f"{inst}-{'nett' if p['type'] == 'nett' else slug(p['navn'])}"
    id_for[nokkel] = sid
    ll, llkilde = koordinat(p)
    km = KOMMUNER.get(p["knr"]) or {}
    reg_tot = [sum(p["reg"][ff][nv][i] for ff in p["reg"] for nv in p["reg"][ff]) for i in range(len(AAR))]
    fv_tot = [sum(p["fv"][ff][nv][i] for ff in p["fv"] for nv in p["fv"][ff]) for i in range(len(FV_AAR))]
    fordeling = []
    for ff in sorted(set(p["reg"]) | set(p["fv"])):
        for nv in NIVAER:
            reg = p["reg"].get(ff, {}).get(nv) if ff in p["reg"] and nv in p["reg"][ff] else [0] * len(AAR)
            fv = p["fv"].get(ff, {}).get(nv) if ff in p["fv"] and nv in p["fv"][ff] else [0] * len(FV_AAR)
            ndbh = len(p["dbhProg"].get((ff, nv), ()))
            nso = len(p["soKoder"].get((ff, nv), ()))
            if any(reg) or any(fv) or ndbh or nso:
                fordeling.append({"fagfelt": ff, "niva": nv, "dbhProgram": ndbh, "soKoder": nso, "reg": reg, "fv": fv})
    # Største program: DBH etter registrerte siste år, Samordna etter førstevalg 2026
    topp = sorted(p["prog"].items(), key=lambda kv: -kv[1][-1])
    topp_dbh = []
    for (prog, ff, nv), serie in topp[:10]:
        if serie[-1] <= 0:
            break
        r = dbh_rader.get((inst, prog)) or {}
        topp_dbh.append({"kode": prog, "navn": r.get("navn") or prog, "fagfelt": ff, "niva": nv, "reg": serie,
                         "so": r.get("so") or []})
    topp_so = sorted(p["so"], key=lambda r: -(((r.get("aar") or {}).get("2026") or {}).get("forstevalg") or 0))
    topp_so = [{"kode": r["kode"], "navn": r["navn"], "fagfelt": r.get("fagfelt"), "niva": NIV_SO.get(r.get("programtype"), "annet"),
                "status": r.get("status"), "nett": bool(r.get("nett")),
                "fv": [((r.get("aar") or {}).get(y) or {}).get("forstevalg") for y in FV_AAR]}
               for r in topp_so[:8] if r.get("status") == "aktiv"]
    org = p["org"]
    org_sum = sum(org.values())
    ut_steder.append({
        "id": sid, "institusjon": inst, "institusjonKort": INST.get(inst, {}).get("k", inst),
        "type": p["type"], "stedsnavn": p["navn"] if p["type"] != "nett" else "Nettstudier",
        "kommunenummer": p["knr"], "kommune": km.get("kommunenavn"), "fylke": km.get("fylkesnavn"),
        "koordinater": ll, "koordinatkilde": llkilde,
        "kilde": {"SD": "begge", "S": "Samordna", "D": "DBH"}["".join(sorted(p["kilder"], reverse=True))],
        "navnevarianter": sorted(set(p["delsteder"]) - {p["navn"]}),
        "antallProgram": {"soKoder": sum(len(v) for v in p["soKoder"].values()),
                          "dbhMedStudenter": sum(len(v) for v in p["dbhProg"].values())},
        "registrerte": dict(zip(AAR, reg_tot)), "forstevalg": dict(zip(FV_AAR, fv_tot)),
        "organisering2025": {"stedbasert": org.get("s", 0), "desentralisert": org.get("d", 0), "nett": org.get("n", 0),
                             "andelNettDesentralisert": round((org.get("d", 0) + org.get("n", 0)) / org_sum, 4) if org_sum else None},
        "samordnaForm": {"aktiveKoder": p["soForm"].get("koder", 0), "nett": p["soForm"].get("nett", 0),
                         "samlingsbasert": p["soForm"].get("samling", 0)},
        "fordeling": fordeling, "storsteDbh": topp_dbh, "storsteSamordna": topp_so,
    })

# ── Koblingstabellen programkode → studiested(er) ────────────────────────────
dbh_steder = defaultdict(lambda: defaultdict(lambda: [0] * len(AAR)))
for y, inst, prog, sk, sn, knr, niv, org, n in rader124:
    m = campus_til_post[(inst, sk)]
    sid = "uplassert" if m is None else id_for[(inst, "nett" if m[0] == "nett" else norm(m[1]))]
    dbh_steder[f"{inst}_{prog}"][sid][AAR.index(y)] += n
kobling_dbh = {}
for key, d in sorted(dbh_steder.items()):
    siste = next((i for i in range(len(AAR) - 1, -1, -1) if sum(v[i] for v in d.values()) > 0), None)
    tot = sum(v[siste] for v in d.values()) if siste is not None else 0
    kobling_dbh[key] = {
        "aar": AAR[siste] if siste is not None else None,
        "steder": sorted(({"id": sid, "reg": dict(zip(AAR, v)), "andelSisteAar": round(v[siste] / tot, 4) if tot else None}
                          for sid, v in d.items()), key=lambda s: -(s["andelSisteAar"] or 0)),
    }
kobling_so = {k: id_for[v] for k, v in sorted(so_til_post.items())}

# ── Kontroll: sum per institusjon mot DBH 123 ────────────────────────────────
k123 = defaultdict(lambda: [0] * len(AAR))
for r in lesgz(KILDER / "123_inst.json.gz")["data"][1:]:
    if r["Årstall"] in AAR:
        k123[inst_kode(r["Institusjonskode"])][AAR.index(r["Årstall"])] += int(r.get("Antall totalt") or 0)
k124 = defaultdict(lambda: [0] * len(AAR))
for y, inst, *_rest, n in rader124:
    k124[inst][AAR.index(y)] += n
plassert = defaultdict(lambda: [0] * len(AAR))
for s in ut_steder:
    if s["type"] in ("sted", "nett"):
        for i, y in enumerate(AAR):
            plassert[s["institusjon"]][i] += s["registrerte"][y]
kontroll_inst, avvik = [], []
for inst in sorted(set(k123) | set(k124)):
    rad = {"institusjon": inst, "navn": INST.get(inst, {}).get("n"), "dbh123": dict(zip(AAR, k123[inst])),
           "dbh124": dict(zip(AAR, k124[inst])), "medSted": dict(zip(AAR, plassert[inst])),
           "uplassertEllerUtland": dict(zip(AAR, [k124[inst][i] - plassert[inst][i] for i in range(len(AAR))]))}
    kontroll_inst.append(rad)
    for i, y in enumerate(AAR):
        a, b = k123[inst][i], k124[inst][i]
        if a == 0 and b == 0:
            continue
        diff = b - a
        if abs(diff) > max(25, 0.01 * a):
            avvik.append({"institusjon": inst, "navn": rad["navn"], "aar": y, "dbh123": a, "dbh124": b, "differanse": diff})
tot123 = [sum(v[i] for v in k123.values()) for i in range(len(AAR))]
tot124 = [sum(v[i] for v in k124.values()) for i in range(len(AAR))]
totpl = [sum(v[i] for v in plassert.values()) for i in range(len(AAR))]
tot_nett = [sum(s["registrerte"][y] for s in ut_steder if s["type"] == "nett") for y in AAR]

# Dekning: aktive DBH-program og lokale gradsprogram med studiested
aktive = {k for k, r in dbh_rader.items() if r.get("status") == "aktiv"}
aktive_lokalt = {k for k in aktive if any("L" in v for v in (dbh_rader[k].get("aar") or {}).values())}
GRAD = {"bachelor", "arsstudium", "master5", "master2", "erfaringsmaster"}
lokale = {k for k, r in dbh_rader.items() if r.get("nivaagruppe") in GRAD and not r.get("so")
          and any("L" in v for v in (r.get("aar") or {}).values())}


def har_sted(k):
    d = kobling_dbh.get(f"{k[0]}_{k[1]}")
    return bool(d and any(s["id"] != "uplassert" for s in d["steder"]))


dekning = {
    "aktiveDbhProgram": len(aktive), "aktiveDbhMedSted": sum(1 for k in aktive if har_sted(k)),
    "aktiveDbhMedStudenter2025": sum(1 for k in aktive if (kobling_dbh.get(f"{k[0]}_{k[1]}") or {}).get("aar") == "2025"),
    "aktiveMedLokaltOpptak": len(aktive_lokalt), "aktiveMedLokaltOpptakMedSted": sum(1 for k in aktive_lokalt if har_sted(k)),
    "lokaleGradsprogram": len(lokale), "lokaleMedSted": sum(1 for k in lokale if har_sted(k)),
    "samordnaKoder": len(so_rader), "samordnaMedSted": sum(1 for r in so_rader if kobling_so.get(r["kode"])),
    "registrerte2025": tot124[-1], "registrerte2025MedSted": totpl[-1], "registrerte2025Nett": tot_nett[-1],
    "andelStudenterMedSted2025": round(totpl[-1] / tot124[-1], 4),
}

kun_s = [{"id": s["id"], "inst": s["institusjonKort"], "sted": s["stedsnavn"], "aktiveKoder": s["samordnaForm"]["aktiveKoder"]}
         for s in ut_steder if s["kilde"] == "Samordna"]
kun_d = [{"id": s["id"], "inst": s["institusjonKort"], "sted": s["stedsnavn"], "reg2025": s["registrerte"]["2025"]}
         for s in ut_steder if s["kilde"] == "DBH" and s["type"] == "sted"]
c662 = Counter()
with gzip.open(KILDER / "bulk_662.csv.gz", "rt", encoding="utf-8") as f:
    for r in csv.DictReader(f):
        if r["Årstall"] == "2025":
            c662[r["Kommunenummer campus"] == "9999"] += 1

kontroll = {
    "hentet": lesgz(KILDER / "124_2025.json.gz")["hentet"],
    "totalt": {"dbh123": dict(zip(AAR, tot123)), "dbh124": dict(zip(AAR, tot124)), "medSted": dict(zip(AAR, totpl)),
               "nettposter": dict(zip(AAR, tot_nett))},
    "avvik124mot123": avvik,
    "regelAvvik": "listet når |DBH 124 − DBH 123| > max(25, 1 % av DBH 123) for institusjon og år",
    "institusjoner": kontroll_inst,
    "uplassert": {inst: dict(zip(AAR, v)) for inst, v in sorted(uplassert.items()) if any(v)},
    "bareSamordna": kun_s, "bareDbh": kun_d,
    "dekning": dekning,
    "campusregister662_2025": {"oppforinger": sum(c662.values()), "medKommune9999": c662[True]},
    "manuelleRettelser": {f"{k[0]}:{k[1]}": v for k, v in OVERSTYR.items()},
}

# ── Campusfeil i HH-programkartet (rapport, ingenting rettes) ────────────────
hhk = les(ROT / "data" / "hh" / "programkart.json")
hhd = {p["entryId"]: p for p in les(ROT / "data" / "hh" / "dbh-programkart.json")["programs"]}
so_kode = {r["kode"]: r for r in so_rader}
navn_id = {s["id"]: f"{s['institusjonKort']} {s['stedsnavn']}" for s in ut_steder}
bruk = defaultdict(list)
for g in hhk["groups"]:
    for p in g["programs"]:
        d = hhd.get(p["id"])
        if d:
            for kode in d["studieprogramkoder"]:
                bruk[(inst_kode(d["institusjonskode"]), kode)].append((g["id"], p["id"], p.get("studiested")))
hh_feil = []
for g in hhk["groups"]:
    for p in g["programs"]:
        funn = []
        d = hhd.get(p["id"])
        inst = inst_kode(d["institusjonskode"]) if d else None
        sted = p.get("studiested")
        so = so_kode.get(p.get("studiekode") or "")
        if so:
            typ, s_sted, s_knr, _ = rens_so(so)
            # Kartet bruker av og til kommunenavnet (Ringerike, Åmot, Horten); det regnes som samme sted.
            if norm(sted) not in {norm(s_sted), norm(so.get("sted")), norm(kommunenavn(s_knr))}:
                funn.append(f"Samordna-koden {so['kode']} har studiested {so.get('sted')}, kartet sier {sted}")
            niv_so = NIV_SO.get(so.get("programtype"), "annet")
            niv_hh = {"bachelor": "bachelor", "master2": "master", "aarsstudium": "arsstudium"}.get(g["level"], g["level"])
            if niv_so != niv_hh and not (niv_hh == "bachelor" and niv_so == "master"):
                funn.append(f"Samordna-koden {so['kode']} er {so.get('programtype', '').lower()} ({so.get('studiepoeng')} sp), "
                            f"gruppen er {g['level']}")
            koblet = [x.split(":", 2)[2] for x in (so.get("dbh") or [])]
            if d and koblet and not set(koblet) & set(d["studieprogramkoder"]):
                funn.append(f"Samordna-koden {so['kode']} er koblet til DBH-koden {', '.join(koblet)} i DBH 370, "
                            f"kartet bruker {', '.join(d['studieprogramkoder'])}")
        if d:
            fordeling = Counter()
            aar_brukt = None
            for kode in d["studieprogramkoder"]:
                k = kobling_dbh.get(f"{inst}_{kode}")
                if not k or not k["aar"]:
                    continue
                aar_brukt = max(aar_brukt or k["aar"], k["aar"])
            for kode in d["studieprogramkoder"]:
                k = kobling_dbh.get(f"{inst}_{kode}")
                if k and aar_brukt:
                    for s in k["steder"]:
                        fordeling[s["id"]] += s["reg"][aar_brukt]
                for (gid, pid, st) in bruk[(inst, kode)]:
                    if pid != p["id"]:
                        funn.append(f"DBH-koden {kode} brukes også av {pid} ({st}), så studentene telles to ganger")
            tot = sum(fordeling.values())
            if tot:
                deler = [(sid, n / tot) for sid, n in fordeling.most_common() if n / tot >= 0.1]
                if len(deler) > 1:
                    funn.append("DBH-kodene teller flere campuser i " + aar_brukt + ": " +
                                ", ".join(f"{navn_id.get(s, s)} {round(100 * a)} %" for s, a in deler))
                stedsid = next((s["id"] for s in ut_steder if s["institusjon"] == inst and norm(s["stedsnavn"]) == norm(sted)), None)
                hoved = fordeling.most_common(1)[0][0]
                if stedsid and hoved != stedsid and fordeling.get(stedsid, 0) / tot < 0.5:
                    funn.append(f"Peker feil: {round(100 * fordeling.get(stedsid, 0) / tot)} % av studentene på DBH-kodene er i {sted}, "
                                f"flest er i {navn_id.get(hoved, hoved)} ({aar_brukt})")
                if so and tot < 10:
                    fv = ((so.get("aar") or {}).get(aar_brukt) or {}).get("forstevalg") or 0
                    if fv >= 30:
                        funn.append(f"DBH-kodene har bare {tot} registrerte i {aar_brukt}, mens Samordna-koden hadde {fv} førstevalg")
            elif d["studieprogramkoder"]:
                funn.append(f"DBH-kodene {', '.join(d['studieprogramkoder'])} har ingen registrerte i DBH 124 2019–2025")
        if funn:
            hh_feil.append({"gruppe": g["id"], "id": p["id"], "studiested": sted, "studiekode": p.get("studiekode"),
                            "dbh": d["studieprogramkoder"] if d else None, "funn": sorted(set(funn))})

# ── Skriv ────────────────────────────────────────────────────────────────────
def skriv(navn, data, kompakt=False):
    tekst = json.dumps(data, ensure_ascii=False, separators=(",", ":")) if kompakt else json.dumps(data, ensure_ascii=False, indent=1)
    (UT / navn).write_text(tekst, encoding="utf-8")
    print(f"  {navn}: {(UT / navn).stat().st_size / 1000:.0f} kB", file=sys.stderr)


meta = {
    "hentet": kontroll["hentet"],
    "kilder": {
        "dbh124": "DBH/HK-dir tabell 124, registrerte studenter per studieprogram og campus, høst 2019–2025",
        "dbh123": "DBH/HK-dir tabell 123, registrerte studenter per institusjon, høst (kontroll)",
        "samordna": "Samordna opptak via data/marked/nasjonal-katalog (sted, kommune, fylke, førstevalg 2021–2026)",
        "kommuner": "SSB Klass 131 (kommuneendringer) og Kartverket kommuneinfo",
        "koordinater": "Kartverket stedsnavn (by/tettsted/bydel), ellers punkt i kommunen fra Kartverket kommuneinfo",
    },
    "aar": AAR, "fvAar": FV_AAR, "nivaer": NIVAER,
    "metode": "Én post per institusjon × studiested. DBH-campusene i de store byene (Oslo, Bergen, Trondheim, Stavanger, "
              "Kristiansand, Bodø, Tromsø) slås sammen per institusjon. Navnevarianter (Studiested X, Campus X, X/Remmen) "
              "renses. Samordna-koder med flere steder (A/B) legges på stedet som svarer til kommunen. Nettkoder legges på "
              "institusjonens nettpost når DBH har en.",
}
skriv("studiesteder.json", {"meta": meta, "institusjoner": INST, "steder": ut_steder})
skriv("program-steder.json", {"meta": {"hentet": meta["hentet"], "forklaring":
      "dbh: <inst>_<programkode> → studiestedene med registrerte per år (DBH 124, høst) og andel siste år med studenter. "
      "so: Samordna-kode → studiested-id."}, "dbh": kobling_dbh, "so": kobling_so}, kompakt=True)
skriv("kontroll.json", kontroll)
skriv("hh-campusfeil.json", {"meta": {"hentet": meta["hentet"], "forklaring":
      "Automatisk kontroll av data/hh/programkart.json og dbh-programkart.json mot Samordna-stedet og DBH 124. Ingenting er rettet."},
      "funn": hh_feil})

print(f"Studiesteder: {len(ut_steder)} ({Counter(s['type'] for s in ut_steder)}), kilde {Counter(s['kilde'] for s in ut_steder)}",
      file=sys.stderr)
print(f"Uten koordinater: {[s['id'] for s in ut_steder if not s['koordinater'] and s['type'] != 'utland']}", file=sys.stderr)
print(f"Dekning: {dekning}", file=sys.stderr)
print(f"Avvik 124 mot 123: {len(avvik)}; HH-funn: {len(hh_feil)}", file=sys.stderr)
