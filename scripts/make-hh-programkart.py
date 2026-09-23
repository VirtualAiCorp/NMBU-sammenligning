#!/usr/bin/env python3
"""Lager data/hh/programkart.json og data/hh/dbh-programkart.json for Handelshøyskolen på standardformatet.

Konkurrentene er de samme som i den opprinnelige HH-analysen (fullAdmissionData.ts for økonomi og administrasjon,
samfData.ts for samfunnsøkonomi, masterThesisData.ts for siviløkonom-masterne), supplert med Økonomi, ledelse og IT
(søk i Samordnas programliste) og masterne i samfunnsøkonomi og entreprenørskap/innovasjon (DBH 347).
DBH-programkodene er funnet i DBH 347 (data/hh/kilder/dbh347/<inst>.json) ut fra navn, nivå, avdeling og år.

Kjøres én gang (og ved endringer i listene under); programkartet er deretter kilden for resten av kjeden.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NAVN = {
    "1173": "Norges miljø- og biovitenskapelige universitet", "1240": "Norges Handelshøyskole", "1150": "Norges teknisk-naturvitenskapelige universitet",
    "1175": "OsloMet – storbyuniversitetet", "1171": "Universitetet i Agder", "1130": "UiT Norges arktiske universitet", "1160": "Universitetet i Stavanger",
    "1176": "Universitetet i Sørøst-Norge", "1177": "Universitetet i Innlandet", "1174": "Nord universitet", "0238": "Høgskulen på Vestlandet",
    "8223": "NLA Høgskolen", "0256": "Høgskolen i Østfold", "0232": "Høgskolen i Molde", "1110": "Universitetet i Oslo", "1120": "Universitetet i Bergen",
    "8241": "Handelshøyskolen BI", "8253": "Høyskolen Kristiania",
}
BI_LOKALT = "Lokalt opptak hos BI (ikke Samordna); tall fra DBH 379. Opptakstallene gjelder alle BIs campuser (Oslo, Bergen, Trondheim, Stavanger) og nett samlet."
K_LOKALT = "Lokalt opptak hos Kristiania (ikke Samordna); tall fra DBH 379."
INN = ["0264", "1177"]

# (id, kort, inst, studiested, programnavn, SO-kode|None, type, default, dbh-koder, merknad)
OA = [
    ("nmbu_oa", "NMBU", "1173", "Ås", "Økonomi og administrasjon (bachelor)", "192369", "bachelor", True, ["B-ØA"], None),
    ("nhh_oa", "NHH", "1240", "Bergen", "Økonomi og administrasjon (bachelor)", "191345", "bachelor", True, ["BACHELOR15", "BACHELOR"], None),
    ("ntnu_oa", "NTNU", "1150", "Trondheim", "Økonomi og administrasjon (bachelor)", "194035", "bachelor", True, ["ØABACHELOR", "BØA", "BØAT"], None),
    ("ntnu_alesund_oa", "NTNU Ålesund", "1150", "Ålesund", "Økonomi og administrasjon (bachelor)", "194515", "bachelor", False, ["ØA369", "BØKADIB"], None),
    ("ntnu_gjovik_oa", "NTNU Gjøvik", "1150", "Gjøvik", "Økonomi, ledelse og bærekraft (bachelor)", "194591", "bachelor", False, ["BØKLED", "BØKLEDC"], None),
    ("oslomet_oa", "OsloMet", "1175", "Oslo", "Økonomi og administrasjon (bachelor)", "215369", "bachelor", True, ["OKAD"], None),
    ("uia_oa", "UiA", "1171", "Kristiansand", "Økonomi og administrasjon (bachelor)", "201369", "bachelor", True, ["BACØKAD"], None),
    ("uit_oa", "UiT Tromsø", "1130", "Tromsø", "Økonomi og administrasjon (bachelor)", "186369", "bachelor", False, ["B-ØKADM", "B-ØA"], "UiT har flere koder for samme program; Tromsø er antatt å være B-ØKADM/B-ØA."),
    ("uit_alta_oa", "UiT Alta", "1130", "Alta", "Økonomi og administrasjon (bachelor)", "186468", "bachelor", False, ["B-ØKADM-A"], None),
    ("uit_harstad_oa", "UiT Harstad", "1130", "Harstad", "Økonomi og administrasjon (bachelor)", "186035", "bachelor", False, ["ØKBA"], "Antatt kode for Harstad."),
    ("uis_oa", "UiS", "1160", "Stavanger", "Økonomi og administrasjon (bachelor)", "217369", "bachelor", True, ["B-ØKAD"], None),
    ("usn_oa", "USN Drammen", "1176", "Drammen", "Økonomi og ledelse (bachelor)", "222330", "bachelor", True, ["OKLED"], "Fra 2025 én felles DBH-kode for alle USN-studiestedene."),
    ("usn_honefoss_oa", "USN Hønefoss", "1176", "Ringerike", "Økonomi og ledelse (bachelor)", "222097", "bachelor", False, ["ØKLEDR"], None),
    ("usn_bo_oa", "USN Bø", "1176", "Midt-Telemark", "Økonomi og ledelse (bachelor)", "222164", "bachelor", False, [], "Ingen egen DBH-kode funnet for Bø; bare opptakstall."),
    ("usn_kongsberg_oa", "USN Kongsberg", "1176", "Kongsberg", "Økonomi og ledelse (bachelor)", "222625", "bachelor", False, ["BACHØKADK"], None),
    ("inn_oa", "INN Lillehammer", "INN", "Lillehammer", "Økonomi og administrasjon (bachelor)", "209035", "bachelor", True, ["ØKBAC"], "Antatt kode for Lillehammer."),
    ("inn_rena_oa", "INN Rena", "INN", "Åmot", "Økonomi og administrasjon (bachelor)", "209369", "bachelor", False, ["BØADM"], "Antatt kode for Rena."),
    ("nord_oa", "Nord Bodø", "1174", "Bodø", "Økonomi og ledelse (bachelor)", "204342", "bachelor", True, ["BAØKLED"], "Samme DBH-kode for Bodø og Steinkjer."),
    ("nord_steinkjer_oa", "Nord Steinkjer", "1174", "Steinkjer", "Økonomi og ledelse (bachelor)", "204404", "bachelor", False, ["BAØKLED"], "Samme DBH-kode for Bodø og Steinkjer."),
    ("hvl_bergen_oa", "HVL Bergen", "0238", "Bergen", "Økonomi og administrasjon (bachelor)", "203369", "bachelor", True, ["ØAU3"], None),
    ("hvl_haugesund_oa", "HVL Haugesund", "0238", "Haugesund", "Økonomi og administrasjon (bachelor)", "203404", "bachelor", False, ["ØKB"], None),
    ("hvl_sogndal_oa", "HVL Sogndal", "0238", "Sogndal", "Økonomi og administrasjon (bachelor)", "203515", "bachelor", False, ["ØKOB"], None),
    ("nla_oslo_oa", "NLA Oslo", "8223", "Oslo", "Økonomi og administrasjon (bachelor)", "254470", "bachelor", False, ["4ØKADM"], None),
    ("nla_bergen_oa", "NLA Bergen", "8223", "Bergen", "Økonomi og administrasjon (bachelor)", "254515", "bachelor", False, ["ØKADM"], None),
    ("nla_krs_oa", "NLA Kristiansand", "8223", "Kristiansand", "Økonomi og administrasjon (bachelor)", "254035", "bachelor", False, ["3ØKADM"], None),
    ("hiof_oa", "HiØ", "0256", "Halden", "Økonomi og administrasjon (bachelor)", "224035", "bachelor", True, ["BOKAD"], None),
    ("himolde_oa", "HiMolde", "0232", "Molde", "Økonomi og administrasjon (bachelor)", "211369", "bachelor", False, ["07"], None),
    ("bi_oa", "BI", "8241", "Oslo", "Økonomi og administrasjon (bachelor)", None, "bachelor", True, ["DIPØAH"], BI_LOKALT),
    ("kristiania_oa", "Kristiania", "8253", "Oslo", "Økonomi og ledelse (bachelor)", None, "bachelor", True, ["BOL"],
     K_LOKALT + " Programmet heter «Økonomi og administrasjon» fra høsten 2026; DBH-koden kan endre seg."),
    ("ntnu_siv", "NTNU siviløkonom", "1150", "Trondheim", "Økonomi og administrasjon, siviløkonom (5 år)", "194345", "master5", False, ["MSIVØK5"], "Femårig løp; svakere sammenligning."),
    ("oslomet_siv", "OsloMet siviløkonom", "1175", "Oslo", "Økonomi og administrasjon, siviløkonom (5 år)", "215345", "master5", False, ["OKADSIV"], "Femårig løp; svakere sammenligning."),
    ("uia_siv", "UiA siviløkonom", "1171", "Kristiansand", "Økonomi og administrasjon, siviløkonom (5 år)", "201345", "master5", False, ["MASTØKAD5"], "Femårig løp; svakere sammenligning."),
    ("usn_siv", "USN siviløkonom", "1176", "Ringerike", "Siviløkonom, integrert (5 år)", "222345", "master5", False, ["SIVØKLEDR"], "Femårig løp; svakere sammenligning."),
]
SAMF = [
    ("nmbu_samf", "NMBU", "1173", "Ås", "Samfunnsøkonomi (bachelor)", "192468", "bachelor", True, ["B-ECON"], None),
    ("uio_samf", "UiO", "1110", "Oslo", "Samfunnsøkonomi (bachelor)", "185898", "bachelor", True, ["SVB-ECON"], None),
    ("uib_samf", "UiB", "1120", "Bergen", "Samfunnsøkonomi (bachelor)", "184369", "bachelor", True, ["BASV-SØK"], None),
    ("ntnu_samf", "NTNU", "1150", "Trondheim", "Samfunnsøkonomi (bachelor)", "194898", "bachelor", True, ["BSØK"], None),
    ("uit_samf", "UiT", "1130", "Tromsø", "Samfunnsøkonomi med datavitenskap (bachelor)", "186898", "bachelor", True, ["B-SAMFOK"], None),
    ("uio_finans", "UiO Øk. og finans", "1110", "Oslo", "Samfunnsøkonomi, økonomi og finans (bachelor)", "185369", "bachelor", False, [], "Ingen egen DBH-kode funnet; bare opptakstall."),
]
OLIT = [
    ("nmbu_olit", "NMBU", "1173", "Ås", "Økonomi, ledelse og IT (bachelor)", "192591", "bachelor", True, ["B-ØLIT"], None),
    ("hvl_dol", "HVL", "0238", "Bergen", "Digital økonomi og ledelse (bachelor)", "203218", "bachelor", True, [], "Ingen egen DBH-kode funnet; bare opptakstall."),
    ("ntnu_dfu", "NTNU", "1150", "Trondheim", "Digital forretningsutvikling (bachelor)", "194422", "bachelor", True, ["ITBAITBEDR"], None),
    ("uio_inl", "UiO", "1110", "Oslo", "Informatikk: digital økonomi og ledelse (bachelor)", "185370", "bachelor", True, ["MNB-INL"], None),
    ("uia_itis", "UiA", "1171", "Kristiansand", "IT og informasjonssystemer (bachelor)", "201260", "bachelor", True, ["BACIT"], None),
    ("usn_itled", "USN", "1176", "Horten", "IT og ledelse (bachelor)", "222955", "bachelor", True, ["ITLED"], None),
    ("usn_itis", "USN IT og IS", "1176", "Ringerike", "IT og informasjonssystemer (bachelor)", "222395", "bachelor", False, ["ITIS"], None),
    ("hiof_is", "HiØ", "0256", "Halden", "Informasjonssystemer (bachelor)", "224453", "bachelor", True, ["ITBINF"], None),
    ("uib_imo", "UiB", "1120", "Bergen", "Informatikk-matematikk-økonomi (bachelor)", "184306", "bachelor", False, ["BATF-IMØ"], None),
    ("uis_digserv", "UiS", "1160", "Stavanger", "Digital serviceledelse (bachelor)", "217470", "bachelor", False, ["B-DIGSERV"], "UiS har to Samordna-koder (dataanalyse og tjenesteinnovasjon) på samme DBH-program."),
    ("nord_edf", "Nord", "1174", "Mo i Rana", "Økonomi, digitalisering og forretningsutvikling (bachelor)", "204453", "bachelor", False, ["INSBA"], None),
    ("bi_dbh", "BI Digital Business", "8241", "Oslo", "Bachelor of Digital Business", None, "bachelor", False, ["DIPDBH"], BI_LOKALT + " Engelskspråklig; svakere sammenligning."),
    ("bi_dsb", "BI Data Science", "8241", "Oslo", "Bachelor of Data Science for Business", None, "bachelor", False, ["DIPBTH"], BI_LOKALT + " Engelskspråklig; svakere sammenligning."),
    ("kristiania_bod", "Kristiania", "8253", "Oslo", "Digitalisering og økonomi (bachelor)", None, "bachelor", False, ["BOD"], K_LOKALT + " Svakere sammenligning. Programsiden videresender nå til økonomi og administrasjon (høsten 2026)."),
]
NHH_MA = ["MASTER04", "MASTER15", "MASTER21", "MASTER22", "MASTER24", "MASTER25", "M25", "MSC23", "MSC24", "MSC25"]
INN_MA = ["MØLDBH", "MØLDBD", "MØLØH", "MØLØD", "MØLMH", "MØLMD", "MØLBAH", "MØLBAD"]
MOA = [
    ("nmbu_moa", "NMBU", "1173", "Ås", "Økonomi og administrasjon (master 2 år)", None, "master2", True, ["M-ØA"], None),
    ("nhh_moa", "NHH", "1240", "Bergen", "Økonomi og administrasjon (master 2 år)", None, "master2", True, NHH_MA, "NHH har mange årskull-koder for masterstudiet; alle er slått sammen (ikke spesialiseringene)."),
    ("bi_moa", "BI", "8241", "Oslo", "Master of Science in Business", None, "master2", True, ["MSCMSBUH"], None),
    ("ntnu_moa", "NTNU", "1150", "Trondheim", "Økonomi og administrasjon (master 2 år)", None, "master2", True, ["ØAMSC"], None),
    ("oslomet_moa", "OsloMet", "1175", "Oslo", "Økonomi og administrasjon (master 2 år)", None, "master2", True, ["MASØA"], None),
    ("uia_moa", "UiA", "1171", "Kristiansand", "Økonomi og administrasjon, siviløkonom (master 2 år)", None, "master2", True, ["MASTØKAD"], None),
    ("uis_moa", "UiS", "1160", "Stavanger", "Økonomi og administrasjon (master 2 år)", None, "master2", True, ["M-ØKAD"], None),
    ("usn_moa", "USN", "1176", "Ringerike", "Økonomi og ledelse, siviløkonom (master 2 år)", None, "master2", True, ["MASIVØKLED"], None),
    ("nord_moa", "Nord", "1174", "Bodø", "Siviløkonom / MSc in Business (master 2 år)", None, "master2", True, ["MABED"], None),
    ("inn_moa", "INN", "INN", "Lillehammer", "Økonomi og ledelse (master 2 år)", None, "master2", True, INN_MA, "Alle fordypninger og heltid/deltid slått sammen."),
    ("uit_moa", "UiT", "1130", "Tromsø", "Økonomi og administrasjon, siviløkonom (master 2 år)", None, "master2", False, ["M-ØKADM", "M-ØKADM-D"], None),
    ("hvl_moa", "HVL", "0238", "Bergen", "Økonomi og administrasjon, siviløkonom (master 2 år)", None, "master2", False, ["MSB"], None),
]
MECON = [
    ("nmbu_mecon", "NMBU", "1173", "Ås", "Samfunnsøkonomi og bærekraft (master 2 år)", None, "master2", True, ["M-ECON"], None),
    ("uio_mecon", "UiO", "1110", "Oslo", "Economics (master 2 år)", None, "master2", True, ["SVM2-ECON"], None),
    ("uib_mecon", "UiB", "1120", "Bergen", "Samfunnsøkonomi (master 2 år)", None, "master2", True, ["MASV-SØK"], None),
    ("ntnu_mecon", "NTNU", "1150", "Trondheim", "Samfunnsøkonomi (master 2 år)", None, "master2", True, ["MSØK"], None),
    ("uit_mecon", "UiT", "1130", "Tromsø", "Samfunnsøkonomi (master 2 år)", None, "master2", True, ["M-SAMFOK"], None),
    ("bi_mecon", "BI", "8241", "Oslo", "Master of Science in Applied Economics", None, "master2", True, ["MSCMSAEH"], "Engelskspråklig master i anvendt økonomi. Siste opptak i DBH 379 er 2023; programmet har fortsatt studenter i 2025 (DBH 347)."),
]
MEI = [
    ("nmbu_mei", "NMBU", "1173", "Ås", "Entreprenørskap og innovasjon (master 2 år)", None, "master2", True, ["M-EI"], None),
    ("ntnu_mei", "NTNU Entreprenørskolen", "1150", "Trondheim", "NTNUs Entreprenørskole (master 2 år)", None, "master2", True, ["MIENTRE"], None),
    ("ntnu_ment", "NTNU Entreprenørskap", "1150", "Trondheim", "Entreprenørskap (master 2 år)", None, "master2", False, ["MENTRE"], None),
    ("nord_mei", "Nord", "1174", "Bodø", "Entreprenørskap og forretningsutvikling (master 2 år)", None, "master2", True, ["MAENT"], None),
    ("bi_mei", "BI", "8241", "Oslo", "MSc in Entrepreneurship and Innovation", None, "master2", True, ["MSCMSEIH"], None),
    ("uio_mei", "UiO", "1110", "Oslo", "Entreprenørskap og innovasjonsledelse (master 2 år)", None, "master2", True, ["MNM2-ENT"], None),
    ("oslomet_mei", "OsloMet", "1175", "Oslo", "Entreprenørskap (master 2 år)", None, "master2", True, ["MAENT"], None),
    ("uia_mei", "UiA", "1171", "Kristiansand", "Shift entreprenørskap og innovasjon (master 2 år)", None, "master2", False, ["M-SHIFTINN"], None),
    ("kristiania_mei", "Kristiania", "8253", "Oslo", "Innovasjonsledelse (master 2 år)", None, "master2", True, ["MIN"], None),
]
GRUPPER = [
    ("oa", "Økonomi og administrasjon", "bachelor", OA,
     "Sammenligner NMBUs bachelor i økonomi og administrasjon med de samme programmene som i den opprinnelige HH-analysen.",
     "Samme konkurrentliste som i den opprinnelige HH-opptaksanalysen. De femårige siviløkonomløpene er tatt med som svakere sammenligning (default false). BI og Kristiania tar opp lokalt, ikke gjennom Samordna: søkere, tilbud og møtt er fra DBH 379, de har ingen poenggrense, og BIs tall gjelder alle campuser samlet."),
    ("samf", "Samfunnsøkonomi", "bachelor", SAMF,
     "Sammenligner NMBUs bachelor i samfunnsøkonomi med de breie samfunnsøkonomiprogrammene ved universitetene.",
     "Samme konkurrenter som i den opprinnelige HH-analysen (samfData)."),
    ("olit", "Økonomi, ledelse og IT", "bachelor", OLIT,
     "Sammenligner NMBUs bachelor i økonomi, ledelse og IT med program som kombinerer økonomi/ledelse og IT eller informasjonssystemer.",
     "Nærmeste tilsvarende program funnet i Samordnas programliste. IT og informasjonssystemer (UiA, USN, HiØ) er mer IT-tunge; Informatikk-matematikk-økonomi (UiB) og Digital serviceledelse (UiS) er svakere sammenligninger (default false), det samme er BIs Digital Business og Data Science for Business og Kristianias Digitalisering og økonomi (lokale opptak, DBH 379)."),
    ("moa", "Økonomi og administrasjon (master)", "master2", MOA,
     "Sammenligner NMBUs toårige master i økonomi og administrasjon (siviløkonom) med siviløkonomstudiene ved de andre handelshøyskolene.",
     "Lokale opptak (ikke Samordna); søkertall, tilbud og møtt fra DBH 379. Samme institusjoner som i den opprinnelige masteroppgaveanalysen."),
    ("mecon", "Samfunnsøkonomi (master)", "master2", MECON,
     "Sammenligner NMBUs master i samfunnsøkonomi og bærekraft med masterprogrammene i samfunnsøkonomi.",
     "Lokale opptak; tall fra DBH 379. NMBUs nye master i samfunnsøkonomi og miljøforvaltning (M-EEG, fra 2024) er ikke med ennå."),
    ("mei", "Entreprenørskap og innovasjon (master)", "master2", MEI,
     "Sammenligner NMBUs master i entreprenørskap og innovasjon med entreprenørskapsmasterne ved andre institusjoner.",
     "Lokale opptak; tall fra DBH 379."),
]
URL = {
    "nmbu_oa": "https://www.nmbu.no/studier/bachelor/okonomi-og-administrasjon",
    "nmbu_samf": "https://www.nmbu.no/studier/bachelor/samfunnsokonomi",
    "nmbu_olit": "https://www.nmbu.no/studier/bachelor/okonomi-ledelse-og-it",
    "nmbu_moa": "https://www.nmbu.no/studier/master-2-aar/okonomi-og-administrasjon",
    "nmbu_mecon": "https://www.nmbu.no/studier/master-2-aar/samfunnsokonomi-og-baerekraft",
    "nmbu_mei": "https://www.nmbu.no/studier/master-2-aar/entreprenorskap-og-innovasjon",
    "bi_oa": "https://www.bi.no/studier-og-kurs/bachelorstudier/okonomi-og-administrasjon/",
    "bi_dbh": "https://www.bi.no/studier-og-kurs/bachelorstudier/digital-business/",
    "bi_dsb": "https://www.bi.no/studier-og-kurs/bachelorstudier/data-science-for-business/",
    "kristiania_oa": "https://www.kristiania.no/studier/bachelor/okonomi-og-administrasjon/",
    "kristiania_mei": "https://www.kristiania.no/studier/master/innovasjonsledelse/",
}

# Studiebarometeret per campus for BI (sbId-suffiks -o/-b/-t/-s/-n). BI Oslo har for få svar på økonomi og administrasjon.
SBID = {
    "bi_oa": ("8241_dipøah-b", "Studiebarometeret: BI Bergen (Oslo har for få svar). Opptakstallene gjelder hele BI."),
    "bi_dbh": ("8241_dipdbh-o", None),
    "bi_dsb": ("8241_dipbth-o", None),
}


def main():
    pk = {"hentet": "2026-09-23", "groups": []}
    dk = {"hentet": "2026-09-23", "institusjoner": {k: v for k, v in NAVN.items()} | {"0264": "Høgskolen i Innlandet (institusjonskode før 2025)"}, "programs": []}
    for gid, label, level, rows, desc, note in GRUPPER:
        progs = []
        for pid, kort, inst, sted, navn, so, typ, default, koder, merknad in rows:
            inst_navn = NAVN["1177"] if inst == "INN" else NAVN[inst]
            progs.append({"id": pid, "shortName": kort, "institusjon": inst_navn, "studiested": sted, "programnavn": navn,
                          "studiekode": so, "type": typ, "isNmbu": inst == "1173", "default": default,
                          "source": "SO" if so else "local", "url": URL.get(pid), "localData": None})
            if koder:
                d = {"entryId": pid, "institusjonskode": "1177" if inst == "INN" else inst, "studieprogramkoder": koder, "studieprogramnavn": navn,
                     "nivaakode": "M2" if typ == "master2" else ("M5" if typ == "master5" else "B3")}
                if inst == "INN":
                    d["institusjonskoder"] = INN
                if merknad:
                    d["merknad"] = merknad
                if pid in SBID:
                    d["sbId"], sbm = SBID[pid]
                    if sbm:
                        d["sbMerknad"] = sbm
                dk["programs"].append(d)
        pk["groups"].append({"id": gid, "label": label, "level": level, "desc": desc, "note": note, "programs": progs})
    d = ROOT / "data" / "hh"
    d.mkdir(parents=True, exist_ok=True)
    # Eksisterende localData (fylt av fill-local-admissions) beholdes ved ny kjøring
    gammel = d / "programkart.json"
    if gammel.exists():
        old = {p["id"]: p.get("localData") for g in json.load(open(gammel, encoding="utf-8"))["groups"] for p in g["programs"]}
        for g in pk["groups"]:
            for p in g["programs"]:
                if old.get(p["id"]):
                    p["localData"] = old[p["id"]]
    json.dump(pk, open(gammel, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    json.dump(dk, open(d / "dbh-programkart.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"{sum(len(g['programs']) for g in pk['groups'])} program i {len(pk['groups'])} grupper; {len(dk['programs'])} med DBH-koder")


if __name__ == "__main__":
    main()
