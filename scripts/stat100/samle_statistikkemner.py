"""Samler statistikkemner ved universiteter med handelshøyskole (+ NHH og BI som referanse) fra DBH-cachene i
BOA-sammenligning. Skriver emner.json som lag_xlsx.py bruker."""
import json, gzip, glob, re, collections, urllib.parse, sys
B = "/Users/mathiassmogeli/Desktop/BOA-sammenligning/"
KW = sys.argv[1]; UT = sys.argv[2]
INST = {  # kode: (kort, navn, karakterweb-slug, HH-avgrensning, type)
 "1173": ("NMBU", "Norges miljø- og biovitenskapelige universitet", "nmbu", {"fak": {"470"}}, "Universitet"),
 "1150": ("NTNU", "Norges teknisk-naturvitenskapelige universitet", "ntnu", {"fak": {"230"}}, "Universitet"),
 "1171": ("UiA", "Universitetet i Agder", "uia", {"fak": {"415"}}, "Universitet"),
 "1160": ("UiS", "Universitetet i Stavanger", "uis", {"fak": {"230"}}, "Universitet"),
 "1130": ("UiT", "UiT Norges arktiske universitet", "uit", {"avd": {"540230"}}, "Universitet"),
 "1174": ("Nord", "Nord universitet", "nord", {"fak": {"510"}}, "Universitet"),
 "1176": ("USN", "Universitetet i Sørøst-Norge", "usn", {"fak": {"620"}}, "Universitet"),
 "1175": ("OsloMet", "OsloMet – storbyuniversitetet", "oslomet", {"avd": {"530350"}}, "Universitet"),
 "1177": ("INN", "Universitetet i Innlandet", "inn", {"fak": {"440"}}, "Universitet"),
 "1240": ("NHH", "Norges Handelshøyskole", "nhh", {"alle": True}, "Ren handelshøyskole (referanse)"),
 "8241": ("BI", "Handelshøyskolen BI", "bi", {"alle": True}, "Ren handelshøyskole (referanse)"),
}
HH_NAVN = {"1173": "Handelshøyskolen (fakultet 470)", "1150": "Fakultet for økonomi (230)", "1171": "Handelshøyskolen ved UiA (415)",
 "1160": "Handelshøyskolen ved UiS (230)", "1130": "Handelshøgskolen (institutt 540230)", "1174": "Handelshøgskolen Nord (510)",
 "1176": "Handelshøyskolen USN (620)", "1175": "Handelshøyskolen OsloMet (institutt 530350)",
 "1177": "Handelshøgskolen i Innlandet (fakultet 440)", "1240": "Hele NHH", "8241": "Hele BI"}
# Statistikkemnet i bachelor i økonomi og administrasjon (kuratert i courseMapping.ts, «Statistikk for økonomer»)
OA = {"1173": {"STAT100"}, "1171": {"ME-111"}, "1176": {"MET1010"}, "1240": {"MET2"}, "8241": {"MET2920"},
      "1175": {"ØAMET1100"}, "1150": {"MET1002", "AR100219", "REA1154"}, "1130": {"BED-2065", "BED-2501"},
      "1160": {"BØK356"}, "1177": {"ØKA1026", "SMET130"}, "1174": {"STT1001"}}
STAT = re.compile(r"statist|biostat", re.I)
UTE = re.compile(r"spillstatistikk|game statistics|statistisk (fysikk|mekanikk|termodynamikk)|statistical (physics|mechanics|thermodynamics)|termodynamikk", re.I)
NAVN_OK = re.compile(r"økonom|economist|economics|business|bedrift|administrasj|finans|financ|revisj|regnskap|accounting|handels|marked", re.I)
PROG_OK = re.compile(r"økonomi|okonomi|economics|economy|business|siviløkonom|revisjon|regnskap|finans|financ|accounting|handels", re.I)
IND_OK = re.compile(r"industriell økonomi|industrial economics", re.I)
UPLASSERT = re.compile(r"uplassert|enkeltemne|ikke (tilknyttet|knyttet)|uten studierett|privatist|^\\?$", re.I)
NIVA = {"LN": "Lavere grad", "HN": "Høyere grad", "FU": "Ph.d.", "VS": "Videreutdanning", "AR": "Årsenhet", "": ""}

def last(navn, inst):
    f = sorted(glob.glob(f"{B}data/*/kilder/dbh-cache/{navn}_{inst}_5y.json.gz"))[0]
    return json.load(gzip.open(f))[1:]

def base(k, inst=""):
    b = re.sub(r"-\d+$", "", k)
    return b if inst == "1173" else re.sub(r"-[A-Z]$", "", b)  # NTNU/UiA o.a.: -A/-G er variant, ved NMBU er -B del av koden

def emneurl(inst, kode):
    b = base(kode, inst); q = urllib.parse.quote
    m = {"1173": ("https://www.nmbu.no/emne/" + q(b.lower()), "direkte"),
         "1150": ("https://www.ntnu.no/studier/emner/" + q(b.upper()), "direkte"),
         "1171": ("https://www.uia.no/studier/emner/?q=" + q(b.upper()), "søk"),
         "1160": ("https://www.uis.no/course/" + q(b.lower()), "direkte"),
         "1130": ("https://uit.no/utdanning/aktivt/emne/" + q(b.upper()), "direkte"),
         "1174": ("https://www.nord.no/studier/emner/" + q(b.upper()), "direkte"),
         "1175": ("https://student.oslomet.no/studier/-/studieinfo/emne/" + q(b.upper()) + "/", "direkte"),
         "1177": ("https://studiekatalog.edutorium.no/inn/emne/" + q(b.upper()), "direkte"),
         "1240": ("https://www.nhh.no/en/search/?q=" + q(b.upper()), "søk"),
         "1176": ("https://www.usn.no/sok?q=" + q(b.upper()), "søk")}
    if inst == "8241":
        mm = re.match(r"^([A-ZÆØÅ]+)(\d{4})\d?$", b)
        return (f"https://www.bi.no/studier-og-kurs/kursbeskrivelser/?subjectCode={q(mm[1])}&courseNumber={mm[2]}", "direkte") if mm else ("", "mangler")
    return m.get(inst, ("", "mangler"))

ut, stat = [], collections.Counter()
for inst, (kort, inavn, slug, hh, typ) in INST.items():
    r208 = last("208", inst)
    fak = {}
    for x in json.load(open(f"{B}data/rangering/dbh/210_{inst}.json"))[1:]:
        if x.get("Gyldig til", "") >= "20241" or x["Avdelingskode"] not in fak:
            fak[x["Avdelingskode"]] = (x.get("Fakultetskode") or "", x.get("Fakultetsnavn") or "")
    per = collections.defaultdict(list)
    for x in r208: per[x["Emnekode"]].append(x)
    kw = {c["codeShort"].lower(): c for c in json.load(open(f"{KW}/{slug}.json"))["courses"]}
    oa = OA.get(inst, set())
    g = collections.defaultdict(lambda: collections.Counter())
    for x in last("308e", inst): g[(x["Emnekode"], x["Årstall"])][x["Karakter"]] += int(x["Antall kandidater totalt"] or 0)
    tot = {(x["Emnekode"], x["Årstall"]): int(x["Antall kandidater totalt"] or 0) for x in last("308et", inst)}
    pk = collections.defaultdict(collections.Counter)  # emne → program → kandidater 2023–2025
    for x in last("308pt", inst):
        if x["Årstall"] >= "2023":
            pk[x["Emnekode"]][x.get("Studieprogramnavn") or x.get("Studieprogramkode") or "?"] += int(x["Antall kandidater totalt"] or 0)
    for kode, rows in per.items():
        navn = sorted(rows, key=lambda x: x["Årstall"])[-1]["Emnenavn"]
        b = base(kode, inst).upper()
        if inst == "8241" and b[-1:].isdigit() and re.match(r"^[A-Z]+\d{5}$", b): b = b[:-1]  # BI: MET29201 → MET2920
        if not ((STAT.search(navn) and not UTE.search(navn)) or b in oa): continue
        aar = sorted({x["Årstall"] for x in rows})
        if aar[-1] < "2024": stat["inaktiv"] += 1; continue
        siste = [x for x in rows if x["Årstall"] == aar[-1]]
        avd = collections.Counter((x["Avdelingskode"], x["Avdelingsnavn"]) for x in siste).most_common(1)[0][0]
        fk, fn = fak.get(avd[0], ("", ""))
        hh_eid = bool(hh.get("alle")) or fk in hh.get("fak", set()) or avd[0] in hh.get("avd", set())
        nyere = [x for x in rows if x["Årstall"] >= "2024"]
        prog = sorted({(x.get("Studieprogramkode") or "", x.get("Studieprogramnavn") or "") for x in nyere if x.get("Studieprogramkode")})
        okprog = [p for p in prog if PROG_OK.search(p[1])]
        # karakterweb
        kand = [b.lower(), base(kode, "1173").lower(), kode.lower()]
        kwk = next((k for k in kand if k in kw), None)
        karakterer = {a: dict(g.get((kode, a), {})) for a in ("2021", "2022", "2023", "2024", "2025")}
        url, ltype = emneurl(inst, kode)
        ut.append({"inst": inst, "kort": kort, "type": typ, "kode": kode, "visningskode": b, "navn": navn,
                   "niva": NIVA.get(siste[0].get("Nivåkode") or "", siste[0].get("Nivåkode")), "sp": float(siste[0].get("Studiepoeng") or 0),
                   "avd": avd[0], "avdnavn": avd[1], "fakkode": fk, "faknavn": fn, "hh_enhet": HH_NAVN[inst], "hh_eid": hh_eid,
                   "emneurl": url, "lenketype": ltype,
                   "kw": f"https://karakterweb.no/{slug}/{urllib.parse.quote(kwk)}" if kwk else "",
                   "aar": aar, "karakterer": karakterer, "totaler": {a: tot.get((kode, a)) for a in karakterer},
                   "navn_ok": (NAVN_OK.search(navn) or [None])[0] if NAVN_OK.search(navn) else "",
                   "prog_antall": len(prog), "prog_ok": len(okprog), "prog_ok_navn": [p[1] for p in okprog][:4],
                   "prog_andre": [p[1] for p in prog if p not in okprog][:4], "oa": b in oa,
                   "kand_prog": [[n, c, bool(PROG_OK.search(n)) and not IND_OK.search(n), bool(UPLASSERT.search(n))] for n, c in pk.get(kode, collections.Counter()).most_common() if c > 0]})
        stat[kort] += 1
json.dump(ut, open(UT, "w", encoding="utf-8"), ensure_ascii=False)
print(dict(stat), "sum", len(ut), "uten kw", sum(1 for e in ut if not e["kw"]), "oa funnet", sum(e["oa"] for e in ut))
missing = [(i, c) for i, s in OA.items() for c in s if not any(e["inst"] == i and e["visningskode"] == c for e in ut)]
print("ØA-emner som mangler:", missing)
