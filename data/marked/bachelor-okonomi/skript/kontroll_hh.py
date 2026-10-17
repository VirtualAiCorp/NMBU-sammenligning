"""Sammenligner HH-programkartet (data/hh/programkart.json + dbh-programkart.json) med Samordna-katalogen og
tallkoblingen i ../kilder/kobling_so_dbh.json. Skriver ../kilder/kontroll_hh.json og skriver funn til skjerm."""
import json
import os

from felles import KILDER, ROOT, les_347, les_katalog, les_so_sokertall

so = les_so_sokertall()
kat = les_katalog()
r347 = les_347()
kb = json.load(open(os.path.join(KILDER, "kobling_so_dbh.json"), encoding="utf-8"))
pk = json.load(open(os.path.join(ROOT, "data/hh/programkart.json"), encoding="utf-8"))
dk = {p["entryId"]: p for p in json.load(open(os.path.join(ROOT, "data/hh/dbh-programkart.json"), encoding="utf-8"))["programs"]}
funn = []
for g in pk["groups"]:
    for p in g["programs"]:
        k = p.get("studiekode")
        m = dk.get(p["id"], {})
        hh_koder = set(m.get("studieprogramkoder") or [])
        if not k:
            continue
        rec = {"entryId": p["id"], "gruppe": g["id"], "studiekode": k, "programnavnHH": p["programnavn"], "typeHH": p["type"],
               "studiestedHH": p["studiested"], "dbhHH": sorted(hh_koder)}
        s = so.get(k)
        if not s:
            rec["funn"] = ["Studiekoden finnes ikke i Samordnas søkertall 2021–2026."]
            funn.append(rec)
            continue
        poster = kat.get(k, {})
        typer = sorted({(x["studyProgrammeType"]["name"], x.get("numCredits")) for x in poster.values()})
        rec["samordnaNavn"] = s["navn"]
        rec["samordnaType"] = typer
        rec["samordnaSted"] = sorted({x["teachingLocation"]["name"] for x in poster.values()})
        f = []
        if p["type"] == "bachelor" and typer and all(t[0] == "Årsstudium" for t in typer):
            f.append(f"Merket bachelor i HH-kartet, men Samordna har programmet som årsstudium (60 sp): «{s['navn'][-1]}».")
        if p["type"] == "bachelor" and typer and all(t[0] in ("Master", "Profesjonsstudium") for t in typer) and k not in ("191345", "191340"):
            f.append("Merket bachelor i HH-kartet, men Samordna har programmet som femårig master.")
        tall = {d["kode"] for d in kb.get(k, {}).get("dbh", [])}
        rec["dbhTall"] = sorted(tall)
        if tall and hh_koder and not (tall & hh_koder):
            f.append(f"DBH-koden i HH-kartet ({', '.join(sorted(hh_koder))}) har ikke Samordna-søkerne til programmet; "
                     f"tallene peker på {', '.join(sorted(tall))}.")
        elif tall and hh_koder - tall:
            ekstra = []
            for c in sorted(hh_koder - tall):
                inst = m.get("institusjonskode")
                navn = r347.get((inst, c), {}).get("rad", {}).get("Studieprogramnavn", "?")
                eier = [x for x, v in kb.items() if x != k and any(d["kode"] == c and d["inst"] == inst for d in v["dbh"])]
                ekstra.append(f"{c} ({navn})" + (f" – koden har Samordna-søkerne til {', '.join(eier)} ({so[eier[0]]['navn'][-1]})" if eier else ""))
            f.append("HH-kartet har i tillegg kode(r) uten Samordna-søkere til dette programmet: " + "; ".join(ekstra) + ".")
        if not hh_koder and tall:
            f.append(f"HH-kartet mangler DBH-kode; tallene peker på {', '.join(sorted(tall))}.")
        # Ny Samordna-kode fra 2024 eller senere: finnes en nedlagt kode på samme sted?
        aar = sorted(poster)
        if aar and aar[0] >= "2024" and p["type"] == "bachelor":
            sted = {x["teachingLocation"]["name"] for x in poster.values()}
            for k2, s2 in so.items():
                if k2 == k or k2[:3] != k[:3] or s2["utdanningstype"] != s["utdanningstype"]:
                    continue
                p2 = kat.get(k2, {})
                if not p2 or "2026" in p2 or max(p2) < "2022":
                    continue
                if {x["teachingLocation"]["name"] for x in p2.values()} & sted and \
                        any(x["studyProgrammeType"]["name"] == "Bachelor" for x in p2.values()):
                    f.append(f"Samordna-koden er ny fra {aar[0]}; programmet på samme studiested hadde før kode {k2} "
                             f"«{s2['navn'][-1]}» ({min(p2)}–{max(p2)}). Tidsserien i HH-kartet starter derfor {aar[0]}.")
        if f:
            rec["funn"] = f
            funn.append(rec)
json.dump(funn, open(os.path.join(KILDER, "kontroll_hh.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for r in funn:
    print(r["entryId"], r["studiekode"], r["programnavnHH"])
    for x in r["funn"]:
        print("   -", x)
