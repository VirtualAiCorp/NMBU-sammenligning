#!/usr/bin/env python3
"""Økonomi og styringsindikatorer per institusjon (DBH/HKDIR) → kilde/src/app/data/economyData.ts/.json

Kilder (cache i data/nmbu/kilder/dbh-okonomi/):
  902  Økonomiske nøkkeltall per institusjon og år, i 1 000 kr: driftsinntekter og -kostnader, statstilskudd,
       Forskningsrådet (NFR), regionale forskningsfond (RFF), EU, bidrags- og oppdragsinntekter, lønnskostnad,
       avsetninger, balanse, og for private høyskoler «Eksamensavgift private høyskoler» (= skolepengeinntekter).
       Regnskapspakkene (700–703) er rå kontodata og brukes ikke.
  750  Kunnskapsdepartementets styringsindikatorer (verdi, teller, nevner per parameter). NB: KDs «faglig
       årsverk» i nevneren inkluderer rekrutteringsstillinger; fagmiljøkortet bruker faglige årsverk uten dem.
  Studentårsverk (DBH 900) hentes fra staffData.json (build-staff.py) for inntekter per studentårsverk.
Institusjonene er de samme som i fagmiljøkortet. INN: 0264 (til og med 2024) og 1177 (fra 2025) slås sammen.

Bruk:
  python3 scripts/build-economy.py [--refresh]
"""
import argparse
import datetime as dt
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("blc", ROOT / "scripts" / "build-landsam-courses.py")
blc = importlib.util.module_from_spec(spec); spec.loader.exec_module(blc)
CACHE = ROOT / "data" / "nmbu" / "kilder" / "dbh-okonomi"
Y0, Y1 = "2019", "2025"
FELT = {"Driftsinntekter": "driftsinntekter", "Driftskostnader": "driftskostnader", "Statstilskudd": "statstilskudd",
        "NFR": "nfr", "RFF": "rff", "EU": "eu", "Bidragsinntekter": "bidrag", "Oppdragsinntekter": "oppdrag",
        "Lønnskostnad": "lonn", "Avsetning": "avsetning", "Totalkapital": "totalkapital",
        "Eksamensavgift private høyskoler": "skolepenger"}
SAMME = {"0264": "1177"}


def q(tid, inst, variabler):
    return {"tabell_id": tid, "api_versjon": 1, "statuslinje": "J", "kodetekst": "N", "desimal_separator": ".",
            "variabler": variabler,
            "filter": [{"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [inst]}},
                       {"variabel": "Årstall", "selection": {"filter": "between", "values": [Y0, Y1]}}]}


def fl(v):
    try:
        return float(str(v).strip())
    except (TypeError, ValueError):
        return None


def ts(s):
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    staff = json.load(open(ROOT / "kilde" / "src" / "app" / "data" / "staffData.json", encoding="utf-8"))
    units = staff["institusjoner"]
    params = {}
    out = []
    for u in units:
        codes = [c for c, k in SAMME.items() if k == u["inst"]] + [u["inst"]]
        years = {}
        for c in codes:
            rows = []
            try:
                rows = blc.fetch_dbh(q(902, c, ["Institusjonskode", "Årstall"] + list(FELT)), CACHE / f"902_{c}.json", a.refresh)
            except json.JSONDecodeError:
                pass
            for r in rows:
                y = years.setdefault(int(r["Årstall"]), {})
                for k, f in FELT.items():
                    v = fl(r.get(k))
                    if v is not None and f not in y:
                        y[f] = round(v)
        sarv = {y["aar"]: y.get("studentarsverk") for y in u["years"]}
        ind = {}
        rows = []
        try:
            rows = blc.fetch_dbh(q(750, u["inst"], ["Institusjonskode", "Styringsparam", "Styringparam tekst", "Årstall", "Teller", "Nevner", "Verdi"]),
                                 CACHE / f"750_{u['inst']}.json", a.refresh)
        except json.JSONDecodeError:
            pass
        for r in rows:
            p = r["Styringsparam"]
            params.setdefault(p, (r.get("Styringparam tekst") or "").strip())
            v = fl(r.get("Verdi"))
            if v is not None:
                ind.setdefault(p, {})[r["Årstall"]] = [v, fl(r.get("Teller")), fl(r.get("Nevner"))]
        out.append({"id": u["id"], "inst": u["inst"], "kort": u["kort"], "isNmbu": u["isNmbu"],
                    "years": [{"aar": y, **{f: years[y].get(f) for f in FELT.values()}, "studentarsverk": sarv.get(y)} for y in sorted(years)],
                    "ind": ind})

    today = dt.date.today().isoformat()
    felt = list(FELT.values())
    L = [f"// GENERERT av scripts/build-economy.py {today} – ikke rediger for hånd.",
         "// Kilde: DBH/HKDIR 902 (økonomiske nøkkeltall, 1 000 kr), 750 (KDs styringsindikatorer), 900 via staffData (studentårsverk).",
         "export interface EconYear { aar: number; " + " ".join(f"{f}: number | null;" for f in felt) + " studentarsverk: number | null; }",
         "/** [verdi, teller, nevner] per år */",
         "export interface EconUnit { id: string; inst: string; kort: string; isNmbu: boolean; years: EconYear[]; ind: Record<string, Record<string, [number, number | null, number | null]>>; }",
         f"export const ECON_HENTET = {ts(today)};",
         "export const ECON_PARAMS: { id: string; tekst: string }[] = ["]
    L += [f"  {{ id: {ts(k)}, tekst: {ts(v)} }}," for k, v in sorted(params.items(), key=lambda kv: int(kv[0]))]
    L += ["];", "export const ECON_UNITS: EconUnit[] = ["]
    def num(v):
        return "null" if v is None else (str(int(v)) if float(v).is_integer() else str(round(v, 4)))
    for u in out:
        yrs = ", ".join("{ " + ", ".join(f"{k}: {num(v)}" for k, v in y.items()) + " }" for y in u["years"])
        ind = ", ".join(f"'{p}': {{ " + ", ".join(f"'{y}': [{', '.join(num(x) for x in vals)}]" for y, vals in sorted(d.items())) + " }" for p, d in sorted(u["ind"].items(), key=lambda kv: int(kv[0])))
        L.append(f"  {{ id: {ts(u['id'])}, inst: {ts(u['inst'])}, kort: {ts(u['kort'])}, isNmbu: {'true' if u['isNmbu'] else 'false'}, years: [{yrs}], ind: {{ {ind} }} }},")
    L += ["];", ""]
    dest = ROOT / "kilde" / "src" / "app" / "data" / "economyData.ts"
    dest.write_text("\n".join(L), encoding="utf-8")
    json.dump({"generert": today, "params": params, "units": out}, open(str(dest)[:-3] + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(out)} institusjoner, {len(params)} styringsparametre. Skrev {dest.name}")


if __name__ == "__main__":
    main()
