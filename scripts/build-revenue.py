#!/usr/bin/env python3
"""Anslått resultatbasert inntekt per studieprogram (finansieringssystemet fra 2025) → kilde/src/app/data/revenueData.ts/.json

Modell (Kunnskapsdepartementets finansieringssystem, gjeldende fra budsjettåret 2025):
  - Studiepoeng: egenfinansierte studiepoeng (60-studiepoengsenheter) × sats for kategori 1, 2 eller 3.
  - Fullføring av gradsprogram: antall fullførte grader × fast sats (kategori G3).
  - Uttelling kommer to år etter produksjonen: studiepoeng og kandidater i år Y betales i budsjettåret Y + 2.
    Satser for Y + 2 brukes når de finnes (DBH 908); ellers siste kjente satser (merket som foreløpig).
Kilder:
  900  Studiepoeng per studentens studieprogram («Progkode student») og emnets finansieringskategori
       («Finmodekode emne»), «Ny produksjon egentfin» (bare egenfinansiert produksjon gir uttelling).
       DBH har omkodet produksjonen fra 2023 til de nye kategoriene 1–3.
  908  Satser per kategori og budsjettår («Studiepoeng» per 60 sp; G3 «Beløp» per fullført grad).
  104  Ferdige kandidater per program (fra <fakultet>CompletionData.json) som tilnærming for fullførte gradsprogram;
       DBH har ingen egen tabell for G3-indikatoren ennå (907 slutter med den gamle kandidatindikatoren i 2022).
Avgrensninger: studiepoengene tilskrives programmet studenten går på, uansett hvilket fakultet som eier emnet.
Doktorgrader, EU, NFR og basisbevilgning er ikke med. Tallene er anslag, ikke NMBUs faktiske fordeling internt.

Bruk:
  python3 scripts/build-revenue.py [--refresh]
"""
import argparse
import datetime as dt
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("blc", ROOT / "scripts" / "build-landsam-courses.py")
blc = importlib.util.module_from_spec(spec); spec.loader.exec_module(blc)
CACHE = ROOT / "data" / "nmbu" / "kilder" / "dbh-finansiering"
FAKULTETER = ["landsam", "realtek", "kbm", "mina", "biovit", "vet", "hh"]
AAR = ["2023", "2024", "2025"]


def ts(s):
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def fl(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()

    # Satser (908)
    rows = blc.fetch_dbh({"tabell_id": 908, "api_versjon": 1, "statuslinje": "J", "kodetekst": "N", "desimal_separator": ".",
                          "variabler": ["Årstall", "Finansierings-kategori", "Belop", "Studiepoeng"],
                          "filter": [{"variabel": "Årstall", "selection": {"filter": "between", "values": ["2025", "2030"]}}]},
                         CACHE / "908_satser.json", a.refresh)
    satser = {}
    for r in rows:
        y, k = r["Årstall"], r["Finansierings-kategori"]
        if k in ("1", "2", "3") and r.get("Studiepoeng"):
            satser.setdefault(y, {})[k] = fl(r["Studiepoeng"])
        if k == "G3" and r.get("Belop"):
            satser.setdefault(y, {})["G3"] = fl(r["Belop"])
    kjente = sorted(y for y in satser if all(k in satser[y] for k in ("1", "2", "3", "G3")))
    print("satser for budsjettår:", kjente)

    faks = {}
    insts = set()
    for fak in FAKULTETER:
        pk = json.load(open(ROOT / "data" / fak / "programkart.json", encoding="utf-8"))
        dk = {p["entryId"]: p for p in json.load(open(ROOT / "data" / fak / "dbh-programkart.json", encoding="utf-8"))["programs"]}
        comp = json.load(open(ROOT / "kilde" / "src" / "app" / "data" / f"{fak}CompletionData.json", encoding="utf-8"))
        kand = {p["entryId"]: {str(y["aar"]): y.get("kandidater") for y in p["aar"]} for g in comp["groups"] for p in g["programs"]}
        reg = {p["entryId"]: {str(y["aar"]): y.get("registrerte") for y in p["aar"]} for g in comp["groups"] for p in g["programs"]}
        faks[fak] = (pk, dk, kand, reg)
        for p in dk.values():
            insts.update(p.get("institusjonskoder") or [p["institusjonskode"]])

    sp = {}
    for inst in sorted(insts):
        rows = []
        try:
            rows = blc.fetch_dbh({"tabell_id": 900, "api_versjon": 1, "statuslinje": "J", "kodetekst": "N", "desimal_separator": ".",
                                  "groupBy": ["Årstall", "Progkode student", "Finmodekode emne"],
                                  "filter": [{"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [inst]}},
                                             {"variabel": "Årstall", "selection": {"filter": "between", "values": [AAR[0], AAR[-1]]}}]},
                                 CACHE / f"900p_{inst}.json", a.refresh)
        except json.JSONDecodeError:
            pass
        for r in rows:
            k = r.get("Finmodekode emne")
            if k not in ("1", "2", "3"):
                continue
            d = sp.setdefault((inst, r.get("Progkode student")), {}).setdefault(r["Årstall"], {"1": 0.0, "2": 0.0, "3": 0.0})
            d[k] += fl(r.get("Ny produksjon egentfin"))

    out = {}
    n_prog = 0
    for fak, (pk, dk, kand, reg) in faks.items():
        groups = []
        for g in pk["groups"]:
            progs = []
            for p in g["programs"]:
                m = dk.get(p["id"])
                if not m or not m.get("studieprogramkoder"):
                    continue
                icodes = m.get("institusjonskoder") or [m["institusjonskode"]]
                years = []
                for y in AAR:
                    s = {"1": 0.0, "2": 0.0, "3": 0.0}
                    har = False
                    for i in icodes:
                        for c in m["studieprogramkoder"]:
                            d = sp.get((i, c), {}).get(y)
                            if d:
                                har = True
                                for k in s:
                                    s[k] += d[k]
                    if not har:
                        continue
                    budsjett = str(int(y) + 2)
                    sats_aar = budsjett if budsjett in satser and budsjett in kjente else kjente[-1]
                    st = satser[sats_aar]
                    k_ant = kand.get(p["id"], {}).get(y)
                    inn_sp = sum(s[k] * st[k] for k in s)
                    inn_k = (k_ant or 0) * st["G3"]
                    years.append({"aar": int(y), "budsjettaar": int(budsjett), "satsAar": int(sats_aar), "forelopig": sats_aar != budsjett,
                                  "sp1": round(s["1"], 1), "sp2": round(s["2"], 1), "sp3": round(s["3"], 1),
                                  "kandidater": k_ant, "registrerte": reg.get(p["id"], {}).get(y), "innSp": round(inn_sp), "innFullforing": round(inn_k), "total": round(inn_sp + inn_k)})
                if years:
                    progs.append({"entryId": p["id"], "shortName": p["shortName"], "institusjon": p["institusjon"], "isNmbu": bool(p.get("isNmbu")),
                                  "programnavn": p.get("programnavn", ""), "years": years})
                    n_prog += 1
            groups.append({"id": g["id"], "label": g["label"], "level": g["level"], "nmbuIds": [p["id"] for p in g["programs"] if p.get("isNmbu")],
                           "defaultIds": [p["id"] for p in g["programs"] if p.get("default")], "programs": progs})
        out[fak] = groups

    today = dt.date.today().isoformat()
    def yr(y):
        return "{ " + ", ".join(f"{k}: {'null' if v is None else ('true' if v is True else 'false' if v is False else v)}" for k, v in y.items()) + " }"
    L = [f"// GENERERT av scripts/build-revenue.py {today} – ikke rediger for hånd.",
         "// Anslått resultatbasert inntekt per program: DBH 900 (egenfinansierte studiepoeng per kategori), 908 (satser), 104 (kandidater).",
         "import type { LandsamLevel } from './landsamAdmissionData';",
         "export interface RevenueYear { aar: number; budsjettaar: number; satsAar: number; forelopig: boolean; sp1: number; sp2: number; sp3: number;",
         "  kandidater: number | null; registrerte: number | null; innSp: number; innFullforing: number; total: number; }",
         "export interface RevenueProgram { entryId: string; shortName: string; institusjon: string; isNmbu: boolean; programnavn: string; years: RevenueYear[]; }",
         "export interface RevenueGroup { id: string; label: string; level: LandsamLevel; nmbuIds: string[]; defaultIds: string[]; programs: RevenueProgram[]; }",
         f"export const REVENUE_HENTET = {ts(today)};",
         "/** Satser per budsjettår: kategori 1–3 per 60 studiepoeng, G3 per fullført grad (kr). */",
         "export const REVENUE_SATSER: Record<string, { '1': number; '2': number; '3': number; G3: number }> = {"]
    L += [f"  '{y}': {{ '1': {int(satser[y]['1'])}, '2': {int(satser[y]['2'])}, '3': {int(satser[y]['3'])}, G3: {int(satser[y]['G3'])} }}," for y in kjente]
    L += ["};", "export const REVENUE_GROUPS: Record<string, RevenueGroup[]> = {"]
    for fak, groups in out.items():
        L.append(f" {fak}: [")
        for g in groups:
            L.append(f"  {{ id: {ts(g['id'])}, label: {ts(g['label'])}, level: {ts(g['level'])}, nmbuIds: [{', '.join(ts(x) for x in g['nmbuIds'])}], defaultIds: [{', '.join(ts(x) for x in g['defaultIds'])}], programs: [")
            for p in g["programs"]:
                L.append(f"    {{ entryId: {ts(p['entryId'])}, shortName: {ts(p['shortName'])}, institusjon: {ts(p['institusjon'])}, isNmbu: {'true' if p['isNmbu'] else 'false'}, "
                         f"programnavn: {ts(p['programnavn'])}, years: [{', '.join(yr(y) for y in p['years'])}] }},")
            L.append("  ] },")
        L.append(" ],")
    L += ["};", ""]
    dest = ROOT / "kilde" / "src" / "app" / "data" / "revenueData.ts"
    dest.write_text("\n".join(L), encoding="utf-8")
    json.dump({"generert": today, "satser": {y: satser[y] for y in kjente}, "grupper": out}, open(str(dest)[:-3] + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{n_prog} program med inntektsanslag. Skrev {dest.name}")


if __name__ == "__main__":
    main()
