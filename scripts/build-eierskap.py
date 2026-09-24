#!/usr/bin/env python3
"""Eierskap, styre, ledelse, siste årsregnskap (Brønnøysund) og statsbudsjettet per institusjon
→ kilde/src/app/data/eierskapData.ts/.json

Kilder:
  Enhetsregisteret  https://data.brreg.no/enhetsregisteret/api/enheter/{orgnr}         organisasjonsform, ansatte, stiftet
                    https://data.brreg.no/enhetsregisteret/api/enheter/{orgnr}/roller  styreleder, daglig leder (rektor), styre
  Regnskapsregisteret https://data.brreg.no/regnskapsregisteret/regnskap/{orgnr}       siste årsregnskap (bare private; statlige
                    institusjoner (ORGL) leverer ikke årsregnskap hit). Friskere enn DBH 902 og med årsresultat.
  Statsbudsjettet   Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1 «Rammeløyving over kap. 260 per universitet og
                    høgskule i 2026» (i 1 000 kr). Statlige: post 50, private: post 70. Nytt budsjett legges fram i oktober;
                    legg til en linje i STATSBUDSJETT og kjør på nytt.
Bare navn på styreleder og daglig leder tas med (offentlige roller); fødselsdatoer og øvrige styremedlemmer lagres ikke.

Bruk:
  python3 scripts/build-eierskap.py [--refresh]
"""
import argparse
import datetime as dt
import html
import json
import re
import ssl
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data" / "nmbu" / "kilder" / "brreg"
SB = ROOT / "data" / "nmbu" / "kilder" / "statsbudsjett"
# DBH-institusjonskode → organisasjonsnummer (hovedenheten, kontrollert mot navn i Enhetsregisteret 24.09.2026)
ORGNR = {
    "1173": "969159570", "1150": "974767880", "1110": "971035854", "1120": "874789542", "1130": "970422528",
    "1160": "971564679", "1171": "970546200", "1174": "970940243", "1175": "997058925", "1176": "911770709",
    "1177": "918108467", "0238": "917641404", "0256": "971567376", "0236": "974809672", "1220": "971526378",
    "1240": "974789523", "0232": "971555483", "8241": "971228865", "8253": "954831604", "8223": "995189186",
}
# Kjente datterselskap (Regnskapsregisteret sier bare om enheten er morselskap)
DATTER = {"8253": [{"navn": "Fagskolen Kristiania AS", "orgnr": "998632307"}]}
# Statsbudsjettet: år → (kilde-URL, lokal fil). Navnene i tabellen er på nynorsk.
STATSBUDSJETT = {
    "2026": ("https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7",
             SB / "prop1s_2025-2026_kd_vedlegg_kap260.html", "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1"),
}
SB_NAVN = {
    "Arkitektur- og designhøgskolen i Oslo": "1220", "Høgskolen i Molde, vitskapleg høgskole i logistikk": "0232",
    "Høgskolen i Østfold": "0256", "Høgskulen i Volda": "0236", "Høgskulen på Vestlandet": "0238", "Nord universitet": "1174",
    "Noregs handelshøgskole": "1240", "Noregs miljø- og biovitskaplege universitet": "1173",
    "Noregs teknisk-naturvitskaplege universitet": "1150", "OsloMet – storbyuniversitetet": "1175",
    "Universitetet i Agder": "1171", "Universitetet i Bergen": "1120", "Universitetet i Innlandet": "1177",
    "Universitetet i Oslo": "1110", "Universitetet i Stavanger": "1160", "Universitetet i Søraust-Noreg": "1176",
    "Universitetet i Tromsø – Noregs arktiske universitet": "1130", "Handelshøyskolen BI": "8241",
    "Høyskolen Kristiania": "8253", "NLA Høgskolen": "8223",
}
ORGFORM = {"ORGL": "Statlig forvaltningsorgan", "STI": "Stiftelse", "AS": "Aksjeselskap"}


def ctx():
    try:
        return ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    except Exception:
        return ssl.create_default_context()


def hent(url, fil, refresh):
    if fil.exists() and not refresh:
        return json.load(open(fil, encoding="utf-8"))
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"Accept": "application/json"}), timeout=60, context=ctx()) as r:
            d = json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        d = None if e.code == 404 else (_ for _ in ()).throw(e)
    fil.parent.mkdir(parents=True, exist_ok=True)
    json.dump(d, open(fil, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return d


def navn(p):
    n = (p or {}).get("navn") or {}
    return " ".join(x for x in (n.get("fornavn"), n.get("mellomnavn"), n.get("etternavn")) if x) or None


def statsbudsjett(refresh):
    ut = {}
    for aar, (url, fil, kilde) in STATSBUDSJETT.items():
        if refresh or not fil.exists():
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60, context=ctx()) as r:
                fil.write_bytes(r.read())
        s = fil.read_text(encoding="utf-8")
        tab = next(t for t in re.findall(r"<table.*?</table>", s, re.S) if "Private verksemder" in t or "Statlege verksemder" in t)
        del_ = None
        for rad in re.findall(r"<tr.*?</tr>", tab, re.S):
            c = [html.unescape(re.sub(r"<[^>]+>", "", x)).replace("\xa0", " ").strip() for x in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", rad, re.S)]
            if len(c) < 2:
                continue
            if c[0].startswith("Statlege"):
                del_ = "statlig"
            elif c[0].startswith("Private"):
                del_ = "privat"
            inst = SB_NAVN.get(c[0])
            if inst and re.sub(r"\s", "", c[1]).isdigit():
                ut.setdefault(inst, {})[aar] = {"belop": int(re.sub(r"\s", "", c[1])) * 1000, "post": 50 if del_ == "statlig" else 70,
                                                "kilde": kilde, "url": url}
    mangler = sorted(set(SB_NAVN.values()) - set(ut))
    if mangler:
        print("ADVARSEL: ikke funnet i statsbudsjettet:", mangler)
    return ut


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    sb = statsbudsjett(a.refresh)
    enheter = []
    for inst, org in ORGNR.items():
        e = hent(f"https://data.brreg.no/enhetsregisteret/api/enheter/{org}", CACHE / f"enhet_{org}.json", a.refresh)
        rol = hent(f"https://data.brreg.no/enhetsregisteret/api/enheter/{org}/roller", CACHE / f"roller_{org}.json", a.refresh) or {}
        form = e["organisasjonsform"]["kode"]
        rs = None
        if form != "ORGL":
            r = hent(f"https://data.brreg.no/regnskapsregisteret/regnskap/{org}", CACHE / f"regnskap_{org}.json", a.refresh)
            if r:
                r = max(r, key=lambda x: x["regnskapsperiode"]["tilDato"])
                res = r["resultatregnskapResultat"]
                rs = {"aar": int(r["regnskapsperiode"]["tilDato"][:4]), "morselskap": bool(r["virksomhet"].get("morselskap")),
                      "driftsinntekter": res["driftsresultat"]["driftsinntekter"]["sumDriftsinntekter"],
                      "driftskostnader": res["driftsresultat"]["driftskostnad"]["sumDriftskostnad"],
                      "driftsresultat": res["driftsresultat"]["driftsresultat"],
                      "finansnetto": res["finansresultat"]["nettoFinans"], "aarsresultat": res["aarsresultat"],
                      "egenkapital": r["egenkapitalGjeld"]["egenkapital"]["sumEgenkapital"],
                      "sumEiendeler": r["eiendeler"]["sumEiendeler"]}
        styreleder = dagligLeder = None
        styre = 0
        for g in rol.get("rollegrupper", []):
            for r in g["roller"]:
                if r.get("fratraadt"):
                    continue
                t = r["type"]["kode"]
                if t == "DAGL":
                    dagligLeder = navn(r.get("person"))
                elif t == "LEDE":
                    styreleder = navn(r.get("person"))
                if g["type"]["kode"] == "STYR" and t in ("LEDE", "NEST", "MEDL"):
                    styre += 1
        enheter.append({"inst": inst, "orgnr": org, "navn": e["navn"], "orgform": ORGFORM.get(form, e["organisasjonsform"]["beskrivelse"]),
                        "privat": form != "ORGL", "stiftet": e.get("stiftelsesdato"), "ansatte": e.get("antallAnsatte"),
                        "styreleder": styreleder, "dagligLeder": dagligLeder, "styremedlemmer": styre,
                        "datterselskap": DATTER.get(inst, []), "regnskap": rs, "statsbudsjett": sb.get(inst, {})})
    today = dt.date.today().isoformat()
    L = [f"// GENERERT av scripts/build-eierskap.py {today} – ikke rediger for hånd.",
         "// Kilder: Brønnøysundregistrene (Enhetsregisteret, roller, Regnskapsregisteret) og Prop. 1 S (statsbudsjettet, kap. 260).",
         "export interface Arsregnskap { aar: number; morselskap: boolean; driftsinntekter: number; driftskostnader: number; driftsresultat: number; finansnetto: number; aarsresultat: number; egenkapital: number; sumEiendeler: number; }",
         "export interface Statsbudsjettlinje { belop: number; post: number; kilde: string; url: string; }",
         "export interface Eierskap { inst: string; orgnr: string; navn: string; orgform: string; privat: boolean; stiftet: string | null; ansatte: number | null;",
         "  styreleder: string | null; dagligLeder: string | null; styremedlemmer: number; datterselskap: { navn: string; orgnr: string }[];",
         "  regnskap: Arsregnskap | null; statsbudsjett: Record<string, Statsbudsjettlinje>; }",
         f"export const EIERSKAP_HENTET = '{today}';",
         f"export const EIERSKAP: Record<string, Eierskap> = {json.dumps({x['inst']: x for x in enheter}, ensure_ascii=False, indent=1)};", ""]
    dest = ROOT / "kilde" / "src" / "app" / "data" / "eierskapData.ts"
    dest.write_text("\n".join(L), encoding="utf-8")
    json.dump({"generert": today, "enheter": enheter}, open(str(dest)[:-3] + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for x in enheter:
        r = x["regnskap"]
        print(f"{x['inst']} {x['navn'][:40]:40} {x['orgform'][:12]:12} ans={x['ansatte']} leder={x['dagligLeder']} styreleder={x['styreleder']} "
              f"sb2026={x['statsbudsjett'].get('2026', {}).get('belop')} " + (f"regnskap {r['aar']}: drift {r['driftsresultat']/1e6:.1f} mill" if r else ""))


if __name__ == "__main__":
    main()
