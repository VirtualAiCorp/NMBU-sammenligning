"""Karakterer i statistikkemnet for ØA-studentene (programnivå, DBH 308) ved de 11 institusjonene."""
import json, gzip, glob, collections, sys
B = "/Users/mathiassmogeli/Desktop/BOA-sammenligning/"
UT = sys.argv[1]
def last(n, i): return json.load(gzip.open(sorted(glob.glob(f"{B}data/*/kilder/dbh-cache/{n}_{i}_5y.json.gz"))[0]))[1:]
KORT = {"1173": "NMBU", "1150": "NTNU", "1171": "UiA", "1160": "UiS", "1130": "UiT", "1174": "Nord", "1176": "USN", "1175": "OsloMet", "1177": "INN", "1240": "NHH", "8241": "BI"}
# Statistikkemnet i ØA-bacheloren, med forgjenger/etterfølger når koden er byttet
EMNER = {"1173": ["STAT100-1"], "1150": ["MET1002-A", "SØK1004-1", "AR100219-1", "REA1154-1"], "1171": ["ME-111-1"],
         "1160": ["BØK356-1"], "1130": ["BED-2011-1", "BED-2065-1", "BED-2066-1"], "1174": ["STT1001-1"],
         "1176": ["STA1000-1", "MET1010-1"], "1175": ["ØAMET1100-1"], "1177": ["3MET130-1", "ØKA1026-1", "SMET130-1"],
         "1240": ["MET2-1"], "8241": ["MET29201"]}
pk = json.load(open(B + "data/hh/dbh-programkart.json"))["programs"]
progs = {}  # (inst, kode) → (entryId, navn, type)
for p in pk:
    e = p["entryId"]; typ = e.split("_")[-1]
    if p["institusjonskode"] in KORT and (typ in ("oa", "siv") or e in ("nmbu_samf", "nmbu_olit")):
        t = {"oa": "Bachelor ØA", "siv": "Siviløkonom 5 år", "samf": "Bachelor samfunnsøkonomi", "olit": "Bachelor ØLIT"}[typ]
        for k in p["studieprogramkoder"]: progs.setdefault((p["institusjonskode"], k), (e, p["studieprogramnavn"], t))  # felles kode (Nord): hovedcampus først
# Studiested, studiekode og poenggrenser per program (entryId) fra HH-sammenligningen (Samordna opptak)
adm = json.load(open(B + "kilde/src/app/data/hhAdmissionData.json", encoding="utf-8"))
ADM = {e["id"]: e for g in adm["groups"] for e in g["entries"]}
SEMDIR = sys.argv[2]
# NTNU bruker samme ØA-programkode på alle campusene; statistikkemnet viser campus (studiested og poenggrense derfra)
EMNE_CAMPUS = {("ntnu_oa", "AR100219-1"): "ntnu_alesund_oa", ("ntnu_oa", "REA1154-1"): "ntnu_gjovik_oa"}
def sted(e, emne): return EMNE_CAMPUS.get((e, emne), e)
# Poenggrenser i hovedopptaket (Samordna opptak, Tableau-eksport 2020–2026): 0 = alle kvalifiserte, -1 = kvoten ikke brukt
import csv
PG = collections.defaultdict(dict)
for rad in csv.DictReader(open(B + "data/realtek/kilder/so_poenggrenser_2020-2026_hentet_2026-09-22.csv", encoding="utf-8"), delimiter=";"):
    if rad["Opptaksrunde"] != "Hovedopptak": continue
    v = float(rad["Poenggrense"].replace(",", ".")); v = None if v == -1 else v
    PG[(rad["Studiekode"].replace(" ", ""), rad["År"])]["ord" if rad["Kvote"] == "Ordinær kvote" else "fv"] = v
# Forgjengerkoder der studiet fikk ny studiekode (NTNU Ålesund og Gjøvik fra 2025)
FORGJENGER = {"194515": "194414", "194591": "194369"}
def grenser(sk):
    ut = {}
    for y in map(str, range(2020, 2027)):
        v = PG.get((sk, y)) or PG.get((FORGJENGER.get(sk, ""), y))
        if v: ut[y] = v
    return ut
ut = []
for inst, emner in EMNER.items():
    navn = {x["Emnekode"]: x["Emnenavn"] for x in last("208", inst)}
    g = collections.defaultdict(collections.Counter); tot = collections.Counter(); pnavn = {}; koder = collections.defaultdict(set)
    gs = collections.defaultdict(collections.Counter); ts = collections.Counter()  # per semester (1 = vår, 3 = høst)
    for x in json.load(open(f"{SEMDIR}/308st_{inst}.json", encoding="utf-8"))[1:]:
        key = progs.get((inst, x["Studieprogramkode"]))
        if key: ts[(key[0], x["Emnekode"], x["Årstall"], x["Semester"])] += int(x["Antall kandidater totalt"] or 0)
    for x in last("308", inst):
        key = progs.get((inst, x["Studieprogramkode"]))
        if key and x["Emnekode"] in emner and x["Årstall"] >= "2021":
            g[(key[0], x["Emnekode"], x["Årstall"])][x["Karakter"]] += int(x["Antall kandidater totalt"] or 0)
            gs[(key[0], x["Emnekode"], x["Årstall"], x["Semester"])][x["Karakter"]] += int(x["Antall kandidater totalt"] or 0)
            pnavn[key[0]] = key; koder[(key[0], x["Emnekode"])].add(x["Studieprogramkode"])
    for x in last("308pt", inst):
        key = progs.get((inst, x["Studieprogramkode"]))
        if key and x["Emnekode"] in emner:
            tot[(key[0], x["Emnekode"], x["Årstall"])] += int(x["Antall kandidater totalt"] or 0)
            pnavn[key[0]] = key; koder[(key[0], x["Emnekode"])].add(x["Studieprogramkode"])
    for (e, emne, aar) in sorted(set(g) | set(tot)):
        ut.append({"inst": inst, "kort": KORT[inst], "entry": e, "prognavn": pnavn[e][1], "type": pnavn[e][2], "koder": sorted(koder[(e, emne)]),
                   "emne": emne, "emnenavn": navn.get(emne, ""), "aar": aar, "karakterer": dict(g.get((e, emne, aar), {})), "total": tot.get((e, emne, aar), 0),
                   "sem": {sm: {"karakterer": dict(gs.get((e, emne, aar, sm), {})), "total": ts.get((e, emne, aar, sm), 0)} for sm in ("1", "3")},
                   "studiested": (ADM.get(sted(e, emne)) or {}).get("studiested") or "", "studiekode": (ADM.get(sted(e, emne)) or {}).get("studiekode") or "",
                   "grenser": grenser((ADM.get(sted(e, emne)) or {}).get("studiekode") or "")})
json.dump(ut, open(UT, "w", encoding="utf-8"), ensure_ascii=False)
s = collections.defaultdict(int)
for r in ut:
    if r["aar"] >= "2023": s[(r["kort"], r["entry"], r["emne"])] += r["total"]
for k, v in sorted(s.items()): print(k, v)
