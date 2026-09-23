#!/usr/bin/env python3
"""Fagmiljøet: tilsatte, studenter per faglig årsverk og publisering per institusjon og per fakultet (DBH/HKDIR).

Kilder (per institusjon, cache i data/nmbu/kilder/dbh-fagmiljo/):
  225  Tilsatte (årsverk) per år × avdeling × stillingskode. Stillingskode → kategori via 220:
       UN1 faglige stillinger (professor, førsteamanuensis, lektor, forsker ...), UN2 rekruttering (stipendiat,
       postdoktor), UN3 faglige ledere (dekan, instituttleder ...), UN4 andre undervisningsstillinger,
       ST/AD teknisk og administrativt. «Faglige årsverk» = UN1 + UN3 + UN4 (uten rekruttering).
       Førstestillinger = professor, dosent, førsteamanuensis, førstelektor.
  123  Registrerte studenter (høst) per år × avdeling.
  373  Publiseringspoeng og antall publikasjoner per år × avdeling. Avdeling 000000 er institusjonstotalen
       (lik summen av avdelingene) og brukes bare på institusjonsnivå.
  374  Publiseringspoeng per kvalitetsnivå (nivå 2-andel).
  900  Studiepoengproduksjon per avdeling som eier emnet («Ny produksjon totalt», i 60-studiepoengsenheter =
       studentårsverk). Mindre sårbart enn registrerte studenter for mange enkeltemne- og deltidsstudenter.
  210  Avdeling → fakultet (fakultetskode og -navn).
  347  Studieprogram → eierens avdelingskode. Konkurrentfakultetet for et NMBU-fakultet er fakultetet som eier
       konkurrentprogrammene i fakultetets dbh-programkart (ingen skjønn).

Bruk:
  python3 scripts/build-staff.py [--refresh]
"""
import argparse
import collections
import datetime as dt
import importlib.util
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("blc", ROOT / "scripts" / "build-landsam-courses.py")
blc = importlib.util.module_from_spec(spec); spec.loader.exec_module(blc)

Y0, Y1 = "2019", "2025"
CACHE = ROOT / "data" / "nmbu" / "kilder" / "dbh-fagmiljo"
FAKULTETER = {"landsam": "420", "realtek": "460", "kbm": "440", "mina": "430", "biovit": "450", "vet": "410", "hh": "470"}
KORT = {"1173": "NMBU", "1150": "NTNU", "1110": "UiO", "1120": "UiB", "1130": "UiT", "1160": "UiS", "1171": "UiA",
        "1174": "Nord", "1175": "OsloMet", "1176": "USN", "1177": "INN", "0264": "INN", "0238": "HVL", "0256": "HiØ",
        "0236": "HVO", "1220": "AHO", "1240": "NHH", "8241": "BI", "8223": "NLA", "0232": "HiMolde", "8253": "Kristiania"}
# INN byttet kode 0264 → 1177 i 2025: slås sammen til én enhet.
SAMME = {"0264": "1177"}
FORSTE = re.compile(r"professor|førsteamanuensis|dosent|førstelektor", re.I)


def q(tid, inst, group_by=None, variabler=None, extra=None, years=True):
    f = [{"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [inst]}}]
    if years:
        f.append({"variabel": "Årstall", "selection": {"filter": "between", "values": [Y0, Y1]}})
    f += extra or []
    b = {"tabell_id": tid, "api_versjon": 1, "statuslinje": "J", "kodetekst": "N", "desimal_separator": ".", "filter": f}
    if group_by:
        b["groupBy"] = group_by
    if variabler:
        b["variabler"] = variabler
    return b


def fetch(name, body, refresh):
    try:
        return blc.fetch_dbh(body, CACHE / name, refresh)
    except json.JSONDecodeError:
        return []


def fl(v):
    try:
        return float(v or 0)
    except (TypeError, ValueError):
        return 0.0


def ts(s):
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()

    # Stillingskoder → kategori
    st = blc.fetch_dbh({"tabell_id": 220, "api_versjon": 1, "statuslinje": "J", "kodetekst": "J", "desimal_separator": ".",
                        "variabler": ["Stillingskode", "Stillingsbenevnelse", "Stillingskategorikode"],
                        "filter": [{"variabel": "Stillingskode", "selection": {"filter": "all", "values": ["*"]}}]},
                       CACHE / "220_stillingskoder.json", a.refresh)
    kat = {r["Stillingskode"]: r.get("Stillingskategorikode") or "" for r in st}
    forste = {r["Stillingskode"] for r in st if r.get("Stillingskategorikode") == "UN1" and FORSTE.search(r.get("Stillingsbenevnelse") or "")}

    # Programmer per fakultet (for å finne konkurrentfakultetene)
    progs = {}
    insts = {"1173"}
    for fak in FAKULTETER:
        dk = json.load(open(ROOT / "data" / fak / "dbh-programkart.json", encoding="utf-8"))["programs"]
        progs[fak] = dk
        for p in dk:
            insts.update(p.get("institusjonskoder") or [p["institusjonskode"]])

    raw = {}
    for inst in sorted(insts):
        raw[inst] = {
            "225": fetch(f"225_{inst}.json", q(225, inst, ["Årstall", "Avdelingskode", "Stillingskode"]), a.refresh),
            "123": fetch(f"123_{inst}.json", q(123, inst, ["Årstall", "Avdelingskode"], extra=[{"variabel": "Semester", "selection": {"filter": "item", "values": ["3"]}}]), a.refresh),
            "373": fetch(f"373_{inst}.json", q(373, inst, ["Årstall", "Avdelingskode"]), a.refresh),
            "374": fetch(f"374_{inst}.json", q(374, inst, ["Årstall", "Avdelingskode", "Kvalitetsniva"]), a.refresh),
            "900": fetch(f"900_{inst}.json", q(900, inst, ["Årstall", "Avdkode emne"]), a.refresh),
            "210": fetch(f"210_{inst}.json", q(210, inst, variabler=["Institusjonskode", "Avdelingskode", "Fakultetskode", "Fakultetsnavn", "Gyldig fra", "Gyldig til"], years=False), a.refresh),
        }

    def fak_of(inst, avd):
        for r in raw[inst]["210"]:
            if r.get("Avdelingskode") == avd:
                return r.get("Fakultetskode"), r.get("Fakultetsnavn")
        return None, None

    fak_names = {}
    for inst in raw:
        for r in raw[inst]["210"]:
            k = (inst, r.get("Fakultetskode"))
            # siste gyldige navn vinner
            if k not in fak_names or (r.get("Gyldig til") or "") >= fak_names[k][1]:
                fak_names[k] = (r.get("Fakultetsnavn") or "", r.get("Gyldig til") or "")

    def unit_years(inst_codes, fakkode=None):
        """Summerer per år for institusjonen (fakkode None) eller ett fakultet."""
        acc = collections.defaultdict(lambda: collections.defaultdict(float))
        for inst in inst_codes:
            r = raw[inst]
            fmap = {}
            def inside(avd):
                if fakkode is None:
                    return True
                if avd not in fmap:
                    fmap[avd] = fak_of(inst, avd)[0]
                return fmap[avd] == fakkode
            for row in r["225"]:
                if not inside(row.get("Avdelingskode")):
                    continue
                y = acc[int(row["Årstall"])]; k = kat.get(row.get("Stillingskode"), "")
                aw = fl(row.get("Antall årsverk"))
                y["arsverk"] += aw; y["_225"] = 1
                if k in ("UN1", "UN3", "UN4"):
                    y["faglige"] += aw; y["fagligeKvinner"] += fl(row.get("Antall kvinner"))
                elif k == "UN2":
                    y["rekruttering"] += aw
                if row.get("Stillingskode") in forste:
                    y["forste"] += aw
            for row in r["123"]:
                if inside(row.get("Avdelingskode")):
                    y = acc[int(row["Årstall"])]; y["studenter"] += fl(row.get("Antall totalt")); y["_123"] = 1
            for row in r["900"]:
                if inside(row.get("Avdkode emne")):
                    y = acc[int(row["Årstall"])]; y["studentarsverk"] += fl(row.get("Ny produksjon totalt")); y["_900"] = 1
            har_total = any(x.get("Avdelingskode") == "000000" for x in r["373"])
            for row in r["373"]:
                avd = row.get("Avdelingskode")
                # Institusjon: totalraden 000000 der den finnes, ellers summen av avdelingene (f.eks. AHO)
                inst_ok = (avd == "000000") if har_total else True
                if (fakkode is None and inst_ok) or (fakkode is not None and avd != "000000" and inside(avd)):
                    y = acc[int(row["Årstall"])]; y["publPoeng"] += fl(row.get("Publiseringspoeng")); y["publikasjoner"] += fl(row.get("Antall publikasjoner")); y["_373"] = 1
            for row in r["374"]:
                avd = row.get("Avdelingskode")
                if avd != "000000" and inside(avd):
                    y = acc[int(row["Årstall"])]; p = fl(row.get("Publiseringspoeng"))
                    y["_p374"] += p
                    if str(row.get("Kvalitetsniva")) == "2":
                        y["niva2"] += p
        out = []
        for yr in sorted(acc):
            v = acc[yr]
            if v["_373"] and not v["publPoeng"] and not v["publikasjoner"]:
                v["_373"] = 0  # rapportert som 0 poeng og 0 publikasjoner (f.eks. AHO): ikke rapportert
            out.append({"aar": yr,
                        "arsverk": round(v["arsverk"], 1) if v["_225"] else None,
                        "faglige": round(v["faglige"], 1) if v["_225"] else None,
                        "fagligeKvinner": round(v["fagligeKvinner"], 1) if v["_225"] else None,
                        "rekruttering": round(v["rekruttering"], 1) if v["_225"] else None,
                        "forste": round(v["forste"], 1) if v["_225"] else None,
                        "studenter": int(v["studenter"]) if v["_123"] else None,
                        "studentarsverk": round(v["studentarsverk"], 1) if v["_900"] else None,
                        "publPoeng": round(v["publPoeng"], 1) if v["_373"] else None,
                        "publikasjoner": int(v["publikasjoner"]) if v["_373"] else None,
                        "niva2Andel": round(100 * v["niva2"] / v["_p374"], 1) if v["_p374"] else None})
        return [x for x in out if any(x[k] is not None for k in ("faglige", "studenter", "publPoeng"))]

    # Institusjoner (INN slått sammen)
    inst_units = {}
    for inst in sorted(insts):
        key = SAMME.get(inst, inst)
        inst_units.setdefault(key, []).append(inst)
    INST = []
    for key, codes in sorted(inst_units.items(), key=lambda kv: (kv[0] != "1173", KORT.get(kv[0], kv[0]))):
        INST.append({"id": key, "inst": key, "kort": KORT.get(key, key), "navn": KORT.get(key, key),
                     "fakultetskode": None, "isNmbu": key == "1173", "years": unit_years(codes), "programmer": [], "hoved": True})

    # Fakulteter: NMBU-fakultetet + fakultetene som eier konkurrentprogrammene (DBH 347)
    FAK = {}
    for fak, nmbu_kode in FAKULTETER.items():
        owners = collections.OrderedDict()
        pk = json.load(open(ROOT / "data" / fak / "programkart.json", encoding="utf-8"))
        meta = {x["id"]: x for g in pk["groups"] for x in g["programs"]}
        prog_of = collections.defaultdict(set); default_of = collections.defaultdict(bool)
        for p in progs[fak]:
            icodes = p.get("institusjonskoder") or [p["institusjonskode"]]
            if "1173" in icodes:
                continue
            for inst in icodes:
                rows = fetch(f"347_{inst}.json", q(347, inst, variabler=["Institusjonskode", "Avdelingskode", "Studieprogramkode", "Årstall"],
                                                  extra=[{"variabel": "Årstall", "selection": {"filter": "between", "values": ["2023", Y1]}}], years=False), a.refresh) if inst not in raw.get("_347", {}) else raw["_347"][inst]
                raw.setdefault("_347", {})[inst] = rows
                avds = [r["Avdelingskode"] for r in rows if r.get("Studieprogramkode") in set(p["studieprogramkoder"])]
                if not avds:
                    continue
                avd = collections.Counter(avds).most_common(1)[0][0]
                fk, _ = fak_of(inst, avd)
                if fk:
                    key2 = (SAMME.get(inst, inst), fk)
                    owners.setdefault(key2, set()).add(inst)
                    m = meta.get(p["entryId"], {})
                    prog_of[key2].add(m.get("programnavn") or p.get("studieprogramnavn") or p["entryId"])
                    default_of[key2] |= bool(m.get("default"))
        units = [{"id": f"1173_{nmbu_kode}", "inst": "1173", "kort": "NMBU", "fakultetskode": nmbu_kode, "isNmbu": True,
                  "navn": fak_names.get(("1173", nmbu_kode), ("",))[0], "years": unit_years(["1173"], nmbu_kode),
                  "programmer": [], "hoved": True}]
        for (key, fk), codes in owners.items():
            # INN: fakultetskoden kan være ulik under gammel og ny institusjonskode; bruk den som finnes per kode
            yrs = unit_years(sorted(codes), fk)
            if not any(y["faglige"] for y in yrs):
                continue
            units.append({"id": f"{key}_{fk}", "inst": key, "kort": KORT.get(key, key), "fakultetskode": fk, "isNmbu": False,
                          "navn": fak_names.get((sorted(codes)[-1], fk), fak_names.get((sorted(codes)[0], fk), ("",)))[0], "years": yrs,
                          "programmer": sorted(prog_of[(key, fk)]), "hoved": default_of[(key, fk)]})
        # hovedsammenligninger først, deretter flest konkurrentprogram
        FAK[fak] = units[:1] + sorted(units[1:], key=lambda u: (not u["hoved"], -len(u["programmer"]), u["kort"]))

    NMBU_FAK = [{"id": f"1173_{k}", "inst": "1173", "kort": "NMBU", "fakultetskode": k, "isNmbu": True, "hoved": True, "programmer": [],
                 "navn": fak_names.get(("1173", k), ("",))[0], "years": unit_years(["1173"], k)}
                for k in ["410", "420", "430", "440", "450", "460", "470"]]

    today = dt.date.today().isoformat()
    def emit_unit(u):
        yrs = ", ".join("{ " + ", ".join(f"{k}: {'null' if v is None else v}" for k, v in y.items()) + " }" for y in u["years"])
        return (f"  {{ id: {ts(u['id'])}, inst: {ts(u['inst'])}, kort: {ts(u['kort'])}, navn: {ts(u['navn'])}, "
                f"fakultetskode: {ts(u['fakultetskode']) if u['fakultetskode'] else 'null'}, isNmbu: {'true' if u['isNmbu'] else 'false'}, "
                f"hoved: {'true' if u['hoved'] else 'false'}, programmer: [{', '.join(ts(x) for x in u['programmer'])}], years: [{yrs}] }},")
    L = [f"// GENERERT av scripts/build-staff.py {today} – ikke rediger for hånd.",
         "// Kilde: DBH/HKDIR 225 (årsverk), 220 (stillingskategorier), 123 (registrerte studenter, høst), 373/374 (publisering), 210 (avdelinger), 347 (programeier).",
         "export interface StaffYear { aar: number; arsverk: number | null; faglige: number | null; fagligeKvinner: number | null; rekruttering: number | null; forste: number | null;",
         "  studenter: number | null; studentarsverk: number | null; publPoeng: number | null; publikasjoner: number | null; niva2Andel: number | null; }",
         "export interface StaffUnit { id: string; inst: string; kort: string; navn: string; fakultetskode: string | null; isNmbu: boolean;",
         "  /** Eier minst ett av konkurrentprogrammene som er valgt som hovedsammenligning (default). */ hoved: boolean;",
         "  /** Konkurrentprogrammene fra fakultetets programkart som denne enheten eier (DBH 347). */ programmer: string[]; years: StaffYear[]; }",
         f"export const STAFF_HENTET = {ts(today)};",
         "export const STAFF_INSTITUTIONS: StaffUnit[] = ["] + [emit_unit(u) for u in INST] + ["];",
         "export const STAFF_NMBU_FACULTIES: StaffUnit[] = ["] + [emit_unit(u) for u in NMBU_FAK] + ["];",
         "export const STAFF_FACULTIES: Record<string, StaffUnit[]> = {"]
    for fak, units in FAK.items():
        L.append(f" {fak}: [")
        L += [emit_unit(u) for u in units]
        L.append(" ],")
    L += ["};", ""]
    out = ROOT / "kilde" / "src" / "app" / "data" / "staffData.ts"
    out.write_text("\n".join(L), encoding="utf-8")
    json.dump({"generert": today, "institusjoner": INST, "fakulteter": FAK}, open(str(out)[:-3] + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(INST)} institusjoner; fakulteter: " + ", ".join(f"{f} {len(u)}" for f, u in FAK.items()) + f". Skrev {out.name}")


if __name__ == "__main__":
    main()
