#!/usr/bin/env python3
"""Forskningsfinansiering for modulen «Fagmiljøet»: hvor godt NMBU lykkes med eksterne forskningsmidler,
målt mot konkurrentene → kilde/public/fagmiljo/forskning.json

Formål:
  Per institusjon (DBH-kode fra staffData.json) og år (siste fem hele år):
  - Forskningsrådet (NFR): søknader, innvilgede, suksessrate og innvilget beløp etter søknadsår, samt
    Forskningsrådets utbetalinger per år fra Prosjektbanken.
  - EU (CORDIS): deltakelser, koordinatorroller og EU-bidrag i Horizon Europe og Horizon 2020 etter signeringsår.
  - Fagområdet «Økonomi» (NFR-fag) per institusjon, som sammenligningsgrunnlag for Handelshøyskolen.
  - NMBU-fakultetene: NFR-søknader (fordelt etter prosjektansvarlig enhet), utbetalinger fra Prosjektbanken
    og publiseringsprofil fra NVA.

Kilder (alle åpne, ingen innlogging):
  Forskningsrådet, søknader v2   https://github.com/Forskningsradet/open-data (datasets/soknader2/dataset.csv), NLOD 2.0.
                                 NB: inneholder ikke søknader fra det nye saksbehandlingssystemet Tibi.
  Forskningsrådet, Prosjektbanken https://prosjektbanken.forskningsradet.no (samme REST-API som nettsiden bruker:
                                 /prosjektbanken/rest/explore/statistics), utbetalt beløp per år og organisasjon.
  CORDIS (EU-kommisjonen)        https://cordis.europa.eu/data/cordis-HORIZONprojects-csv.zip og
                                 https://cordis.europa.eu/data/cordis-h2020projects-csv.zip (organization.csv, project.csv),
                                 gjenbruk etter Kommisjonens beslutning 2011/833/EU med kildehenvisning.
                                 Match på vatNumber (NO + orgnr + MVA); UiA, INN og HVL mangler vatNumber og matches på PIC.
  NVA (Sikt)                     https://api.nva.unit.no/search/resources (aggregeringer per Cristin-enhet og år).

Personvern: prosjektledernavn (NFR) og bidragsytere (NVA) lagres ikke. Cachen inneholder bare de kolonnene som trengs.

Cache (gzip) i data/nmbu/kilder/forskning/. Store råfiler lastes ned til en midlertidig mappe og slettes etterpå.

Bruk:
  python3 scripts/build-forskning.py              # bruker cache der den finnes
  python3 scripts/build-forskning.py --refresh    # henter alt på nytt
  python3 scripts/build-forskning.py --fra 2021 --til 2025
"""
import argparse
import csv
import datetime as dt
import gzip
import io
import json
import re
import shutil
import ssl
import tempfile
import time
import urllib.parse
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data" / "nmbu" / "kilder" / "forskning"
STAFF = ROOT / "kilde" / "src" / "app" / "data" / "staffData.json"
EIERSKAP = ROOT / "kilde" / "src" / "app" / "data" / "eierskapData.json"
UT = ROOT / "kilde" / "public" / "fagmiljo" / "forskning.json"

NFR_CSV = "https://raw.githubusercontent.com/Forskningsradet/open-data/main/datasets/soknader2/dataset.csv"
NFR_README = "https://raw.githubusercontent.com/Forskningsradet/open-data/main/datasets/soknader2/README.md"
PB_REST = "https://prosjektbanken.forskningsradet.no/prosjektbanken/rest/explore/statistics"
CORDIS = {
    "horizonEurope": ("Horizon Europe (2021–2027)", "https://cordis.europa.eu/data/cordis-HORIZONprojects-csv.zip"),
    "horizon2020": ("Horizon 2020 (2014–2020)", "https://cordis.europa.eu/data/cordis-h2020projects-csv.zip"),
}
NVA_SOK = "https://api.nva.unit.no/search/resources"
NVA_ORG = "https://api.nva.unit.no/cristin/organization/"

# Forskningsrådets kortnavn (feltet «kortnavn») per DBH-kode. Eldre navn på sammenslåtte institusjoner er tatt med.
NFR_KORTNAVN = {
    "1173": {"NMBU"}, "1150": {"NTNU"}, "1110": {"UIO"}, "1120": {"UIB"}, "1130": {"UIT"}, "1160": {"UIS"},
    "1171": {"UIA"}, "1174": {"NORD", "UIN"}, "1175": {"OSLOMET", "HIOA"}, "1176": {"USN", "HSN"},
    "1177": {"HINN", "INN"}, "0238": {"HVL"}, "0256": {"HIØ"}, "0236": {"HVO"}, "1220": {"AHO"}, "1240": {"NHH"},
    "0232": {"HIM"}, "8241": {"BI"}, "8253": {"CK"}, "8223": {"NLA"},
}
# Forskningsrådets kontraktspartkode (kp1), brukt når kortnavn mangler
NFR_KP1 = {"105": "1173", "104": "1150", "102": "1110", "101": "1120", "103": "1130", "106": "1160", "107": "1171",
           "108": "1174", "109": "1175", "110": "1176", "329": "1177", "328": "0238", "324": "0256", "312": "0236",
           "201": "1220", "202": "1240", "212": "0232", "209": "8241", "422": "8253", "403": "8223"}
# Navn på nivå 3 (UoH-sektor) i Prosjektbanken → DBH-kode
PB_NAVN = {
    "NORGES MILJØ- OG BIOVITENSKAPELIGE UNIVERSITET (NMBU)": "1173",
    "Fakultet for landskap og samfunn - fag/forskning": "1173_landsam",  # NMBU-enhet som ligger løst på nivå 3
    "NORGES TEKNISK-NATURVITENSKAPELIGE UNIVERSITET NTNU": "1150", "UNIVERSITETET I OSLO": "1110",
    "UNIVERSITETET I BERGEN": "1120", "UNIVERSITETET I TROMSØ - NORGES ARKTISKE UNIVERSITET": "1130",
    "UNIVERSITETET I STAVANGER": "1160", "UNIVERSITETET I AGDER": "1171", "NORD UNIVERSITET": "1174",
    "OSLOMET - STORBYUNIVERSITETET": "1175", "UNIVERSITETET I SØRØST-NORGE": "1176", "UNIVERSITETET I INNLANDET": "1177",
    "HØGSKULEN PÅ VESTLANDET": "0238", "HØGSKOLEN I ØSTFOLD": "0256", "HØGSKULEN I VOLDA": "0236",
    "ARKITEKTUR- OG DESIGNHØGSKOLEN I OSLO": "1220", "NORGES HANDELSHØYSKOLE": "1240", "HØGSKOLEN I MOLDE": "0232",
    "STIFTELSEN HANDELSHØYSKOLEN BI": "8241", "HØYSKOLEN KRISTIANIA - ERNST G MORTENSENS STIFTELSE": "8253",
    "NLA HØGSKOLEN AS": "8223",
}
# CORDIS: deltakere uten vatNumber matches på PIC (organisationID), kontrollert mot navn 26.09.2026
CORDIS_PIC = {"998822969": "1171", "915857802": "1177", "916768923": "0238"}
CORDIS_ROLLER = {"coordinator", "participant", "thirdParty"}  # associatedPartner får ikke EU-bidrag

# NMBU-fakultetene: DBH-fakultetskode → (Cristin-enhet i NVA, navnemønstre for prosjektansvarlig enhet i NFR-data)
NMBU_FAK = {
    "410": ("192.16.0.0", ["VETERINÆR", "PARAKLINISKE", "PREKLINISKE", "PRODUKSJONSDYRMEDISIN",
                           "FAMILIEDYRMEDISIN", "DYRESYKEHUSET", "AVD SANDNES"]),
    "420": ("192.13.0.0", ["LANDSKAP OG SAMFUNN", "NORAGRIC", "BY- OG REGIONPLANLEGGING", "EIENDOM OG JUSS",
                           "FOLKEHELSEVITENSKAP", "LANDSKAPSARKITEKTUR"]),
    "430": ("192.14.0.0", ["MILJØVITENSKAP", "NATURFORVALTNING"]),
    "440": ("192.12.0.0", ["KJEMI, BIOTEKNOLOGI"]),
    "450": ("192.10.0.0", ["FAKULTET FOR BIOVITENSKAP", "HUSDYR- OG AKVAKULTUR", "PLANTEVITENSKAP", "CIGENE"]),
    "460": ("192.15.0.0", ["REALFAG OG TEKNOLOGI", "MATEMATISKE REALFAG", "DATAVITENSKAP", "GEOMATIKK"]),
    "470": ("192.11.0.0", ["HANDELSHØYSKOLEN"]),
}
# Navn på NMBU-enheter på nivå 4 i Prosjektbanken → fakultetskode
PB_FAK = {"VETERINÆRHØGSKOLEN": "410", "FAKULTET FOR LANDSKAP OG SAMFUNN": "420",
          "FAKULTET FOR MILJØVITENSKAP OG NATURFORVALTNING": "430", "FAKULTET FOR KJEMI, BIOTEKNOLOGI OG MATVITENSKAP": "440",
          "FAKULTET FOR BIOVITENSKAP": "450", "FAKULTET FOR REALFAG OG TEKNOLOGI": "460", "HANDELSHØYSKOLEN": "470"}
NFR_KOLONNER = ["prosjektnummer", "soknadsfrist", "soknadsdato", "prosjekttype", "prosjektfase", "prosjektansvarlig_type",
                "prosjektansvarlig_navn", "kortnavn", "organisasjonsnummer", "kp1", "kp2", "sektor", "fagomraade", "fag",
                "sokt_belop", "tildelt_belop"]
INNVILGET = {"Bevilgning", "Avsluttet"}


def ctx():
    try:
        return ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    except Exception:
        return ssl.create_default_context()


def get(url, timeout=120):
    req = urllib.request.Request(url, headers={"User-Agent": "NMBU-sammenligning/1.0 (forskningsdata)", "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout, context=ctx()) as r:
        return r.read()


def last_ned(url, fil):
    """Strømmer en stor fil til disk (midlertidig mappe)."""
    req = urllib.request.Request(url, headers={"User-Agent": "NMBU-sammenligning/1.0 (forskningsdata)"})
    with urllib.request.urlopen(req, timeout=600, context=ctx()) as r, open(fil, "wb") as f:
        shutil.copyfileobj(r, f, 1 << 20)


def json_cache(url, fil, refresh, rens=None, pause=0.3):
    """Henter JSON med gzip-cache. rens() kan fjerne felt (f.eks. personnavn) før lagring."""
    if fil.exists() and not refresh:
        return json.loads(gzip.decompress(fil.read_bytes()).decode("utf-8"))
    d = json.loads(get(url).decode("utf-8"))
    if rens:
        d = rens(d)
    fil.parent.mkdir(parents=True, exist_ok=True)
    fil.write_bytes(gzip.compress(json.dumps(d, ensure_ascii=False).encode("utf-8")))
    time.sleep(pause)
    return d


def tall(s):
    s = (s or "").strip().replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return 0.0


def r1(x):
    return round(x, 1)


# ---------------------------------------------------------------- Forskningsrådet, søknader

def nfr_utdrag(refresh, tmp):
    """Laster ned søknadsdatasettet og lagrer et gzip-utdrag med UoH-rader og bare nødvendige kolonner."""
    fil = CACHE / "nfr_soknader2_uoh_utdrag.csv.gz"
    meta = CACHE / "nfr_soknader2_meta.json"
    if fil.exists() and meta.exists() and not refresh:
        return fil, json.loads(meta.read_text(encoding="utf-8"))
    readme = get(NFR_README).decode("utf-8")
    m = re.search(r"Sist oppdatert:\s*([0-9-]+ [0-9:]+)", readme)
    rå = tmp / "nfr.csv"
    print("  laster ned Forskningsrådets søknadsdatasett (~54 MB) …")
    last_ned(NFR_CSV, rå)
    orgnr = {e["orgnr"] for e in json.load(open(EIERSKAP, encoding="utf-8"))["enheter"]}
    kort = set().union(*NFR_KORTNAVN.values())
    n = 0
    with open(rå, encoding="utf-8-sig", newline="") as f, gzip.open(fil, "wt", encoding="utf-8", newline="") as g:
        w = csv.DictWriter(g, fieldnames=NFR_KOLONNER)
        w.writeheader()
        for row in csv.DictReader(f):
            if row["sektor"] != "UoH-sektor" and row["kortnavn"] not in kort and row["organisasjonsnummer"] not in orgnr:
                continue
            ut = {k: row.get(k, "") for k in NFR_KOLONNER}
            if ut["prosjektansvarlig_type"] != "Organisasjon":
                ut["prosjektansvarlig_navn"] = ""  # personlig stipend: navnet er en person
            w.writerow(ut)
            n += 1
    md = {"kilde": NFR_CSV, "sistOppdatert": m.group(1) if m else None, "hentet": dt.date.today().isoformat(), "rader": n}
    meta.write_text(json.dumps(md, ensure_ascii=False, indent=1), encoding="utf-8")
    return fil, md


def nfr_inst(row, orgnr_til_inst):
    for inst, s in NFR_KORTNAVN.items():
        if row["kortnavn"] in s:
            return inst
    if row["organisasjonsnummer"] in orgnr_til_inst:
        return orgnr_til_inst[row["organisasjonsnummer"]]
    kp1 = row["kp1"].split(".")[0]
    return NFR_KP1.get(kp1) if not row["kortnavn"] else None


def nmbu_fak(navn):
    n = (navn or "").upper()
    for fak, (_, mønstre) in NMBU_FAK.items():
        if any(m in n for m in mønstre):
            return fak
    return None


def ny_nfr():
    return {"soknader": 0, "innvilget": 0, "avslag": 0, "underBehandling": 0, "sokt": 0.0, "tildelt": 0.0,
            "psSoknader": 0, "psInnvilget": 0, "psAvslag": 0}


def legg_til(a, row):
    fase = row["prosjektfase"]
    ps = row["prosjekttype"] == "Prosjektstøtte"
    a["soknader"] += 1
    a["sokt"] += tall(row["sokt_belop"])
    a["psSoknader"] += ps
    if fase in INNVILGET:
        a["innvilget"] += 1
        a["psInnvilget"] += ps
        a["tildelt"] += tall(row["tildelt_belop"])
    elif fase == "Avslag":
        a["avslag"] += 1
        a["psAvslag"] += ps
    else:
        a["underBehandling"] += 1


def ferdig_nfr(a):
    def rate(i, av):
        return r1(100 * i / (i + av)) if i + av else None
    return {"soknader": a["soknader"], "innvilget": a["innvilget"], "avslag": a["avslag"],
            "underBehandling": a["underBehandling"], "suksessrate": rate(a["innvilget"], a["avslag"]),
            "soktBelop": r1(a["sokt"] / 1e6), "innvilgetBelop": r1(a["tildelt"] / 1e6),
            "prosjektstotte": {"soknader": a["psSoknader"], "innvilget": a["psInnvilget"],
                               "suksessrate": rate(a["psInnvilget"], a["psAvslag"])}}


def nfr_aggreger(fil, aar, orgnr_til_inst):
    per_inst = defaultdict(lambda: defaultdict(ny_nfr))
    per_fak = defaultdict(lambda: defaultdict(ny_nfr))
    okonomi = defaultdict(lambda: defaultdict(ny_nfr))
    nasjonalt = defaultdict(int)
    with gzip.open(fil, "rt", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            y = (row["soknadsdato"] or row["soknadsfrist"])[:4]
            if not y.isdigit() or int(y) not in aar:
                continue
            nasjonalt[y] += row["sektor"] == "UoH-sektor"
            inst = nfr_inst(row, orgnr_til_inst)
            if not inst:
                continue
            legg_til(per_inst[inst][y], row)
            if row["fag"] == "Økonomi":
                legg_til(okonomi[inst][y], row)
            if inst == "1173":
                legg_til(per_fak[nmbu_fak(row["prosjektansvarlig_navn"]) or "ikkeFordelt"][y], row)

    def ut(d):
        return {k: {str(y): ferdig_nfr(v.get(str(y), ny_nfr())) for y in aar} for k, v in d.items()}
    return ut(per_inst), ut(per_fak), ut(okonomi), dict(nasjonalt)


# ---------------------------------------------------------------- Prosjektbanken, utbetalt per år

def pb_url(**p):
    return PB_REST + "?" + urllib.parse.urlencode({"Kilde": "FORISS", "calcType": "funding", "Sprak": "no", **p})


def pb_sjekk(d, navn):
    # Et ukjent filter ignoreres stille av API-et og gir hele porteføljen (~10 mrd. kr/år). Stopp i så fall.
    if d["calculations"].get("totalFunding", 0) > 5e10:
        raise SystemExit(f"Prosjektbanken: filteret på «{navn}» ser ut til å være ignorert")


def prosjektbanken(aar, refresh):
    """Utbetalt per år: ett kall per institusjon (Organisasjon.3 = navnet på nivå 3, slik nettsiden gjør)."""
    inst_ut, fak_ut = defaultdict(dict), defaultdict(dict)
    for i, (navn, inst) in enumerate(PB_NAVN.items()):
        d = json_cache(pb_url(distribution="Ar", **{"Organisasjon.3": navn}), CACHE / f"prosjektbanken_aar_{inst}_{i}.json.gz", refresh)
        pb_sjekk(d, navn)
        for s in d["calculations"]["sums"]:
            if s["value"].isdigit() and int(s["value"]) in aar:
                inst_ut[inst][s["value"]] = inst_ut[inst].get(s["value"], 0) + s["sum"]
    nmbu = "NORGES MILJØ- OG BIOVITENSKAPELIGE UNIVERSITET (NMBU)"
    for y in aar:
        d = json_cache(pb_url(distribution="Organisasjon", Ar=y, **{"Organisasjon.3": nmbu}),
                       CACHE / f"prosjektbanken_nmbu_enheter_{y}.json.gz", refresh)
        pb_sjekk(d, nmbu)
        for s in d["calculations"]["sums"]:
            fak = PB_FAK.get(s["displayName"].upper()) or "ikkeFordelt"
            fak_ut[fak][str(y)] = fak_ut[fak].get(str(y), 0) + s["sum"]
    # NMBU-enheten som ligger løst på nivå 3 (LANDSAM) legges til både NMBU og fakultetet
    for y, v in inst_ut.pop("1173_landsam", {}).items():
        inst_ut["1173"][y] = inst_ut["1173"].get(y, 0) + v
        fak_ut["420"][y] = fak_ut["420"].get(y, 0) + v
    rund = lambda d: {k: {y: r1(v / 1e6) for y, v in sorted(x.items())} for k, x in d.items()}
    return rund(inst_ut), rund(fak_ut), []


# ---------------------------------------------------------------- CORDIS

def cordis_utdrag(prog, url, refresh, tmp, orgnr_til_inst):
    """Lagrer norske deltakere (bare organisasjonsdata) med prosjektets signerings- og startdato."""
    fil = CACHE / f"cordis_{prog}_norske_deltakere.csv.gz"
    meta = CACHE / f"cordis_{prog}_meta.json"
    if fil.exists() and meta.exists() and not refresh:
        return fil, json.loads(meta.read_text(encoding="utf-8"))
    z_fil = tmp / f"{prog}.zip"
    print(f"  laster ned CORDIS {prog} …")
    last_ned(url, z_fil)
    z = zipfile.ZipFile(z_fil)
    dato = max(i.date_time for i in z.infolist() if i.filename == "organization.csv")
    prosj = {}
    for row in csv.DictReader(io.TextIOWrapper(z.open("project.csv"), encoding="utf-8"), delimiter=";"):
        prosj[row["id"]] = (row["ecSignatureDate"], row["startDate"], row["status"])
    kol = ["projectID", "organisationID", "vatNumber", "name", "role", "ecContribution", "endOfParticipation",
           "ecSignatureDate", "startDate", "status"]
    n = 0
    with gzip.open(fil, "wt", encoding="utf-8", newline="") as g:
        w = csv.DictWriter(g, fieldnames=kol)
        w.writeheader()
        for row in csv.DictReader(io.TextIOWrapper(z.open("organization.csv"), encoding="utf-8"), delimiter=";"):
            if row["country"] != "NO":
                continue
            sig, start, status = prosj.get(row["projectID"], ("", "", ""))
            w.writerow({**{k: row[k] for k in kol[:7]}, "ecSignatureDate": sig, "startDate": start, "status": status})
            n += 1
    md = {"kilde": url, "filDato": "%04d-%02d-%02d" % dato[:3], "hentet": dt.date.today().isoformat(), "norskeRader": n}
    meta.write_text(json.dumps(md, ensure_ascii=False, indent=1), encoding="utf-8")
    return fil, md


def cordis_inst(row, orgnr_til_inst):
    vat = re.sub(r"\D", "", row["vatNumber"] or "")
    if vat in orgnr_til_inst:
        return orgnr_til_inst[vat]
    return CORDIS_PIC.get(row["organisationID"])


def cordis_aggreger(fil, aar, orgnr_til_inst):
    per = defaultdict(lambda: defaultdict(lambda: {"deltakelser": 0, "koordinator": 0, "bidrag": 0.0}))
    tot = defaultdict(lambda: {"deltakelser": 0, "koordinator": 0, "bidrag": 0.0, "prosjekter": set(), "aar": set()})
    navn = defaultdict(set)
    with gzip.open(fil, "rt", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            inst = cordis_inst(row, orgnr_til_inst)
            if not inst or row["role"] not in CORDIS_ROLLER:
                continue
            navn[inst].add(row["name"])
            y = (row["ecSignatureDate"] or row["startDate"])[:4]
            b = tall(row["ecContribution"])
            k = row["role"] == "coordinator"
            t = tot[inst]
            t["deltakelser"] += 1
            t["koordinator"] += k
            t["bidrag"] += b
            t["prosjekter"].add(row["projectID"])
            if y.isdigit():
                t["aar"].add(int(y))
            if y.isdigit() and int(y) in aar:
                a = per[inst][y]
                a["deltakelser"] += 1
                a["koordinator"] += k
                a["bidrag"] += b
    ut = {inst: {str(y): {"deltakelser": v.get(str(y), {}).get("deltakelser", 0),
                          "koordinator": v.get(str(y), {}).get("koordinator", 0),
                          "bidragMillEuro": round(v.get(str(y), {}).get("bidrag", 0.0) / 1e6, 2)} for y in aar}
          for inst, v in per.items()}
    totalt = {inst: {"deltakelser": t["deltakelser"], "prosjekter": len(t["prosjekter"]), "koordinator": t["koordinator"],
                     "bidragMillEuro": round(t["bidrag"] / 1e6, 2),
                     "signeringsaar": [min(t["aar"]), max(t["aar"])] if t["aar"] else None}
              for inst, t in tot.items()}
    return ut, totalt, {k: sorted(v) for k, v in navn.items()}


# ---------------------------------------------------------------- NVA

def uten_personer(d):
    """Fjerner bidragsytere (personnavn) og treff fra NVA-svaret før caching."""
    d = {k: v for k, v in d.items() if k in ("totalHits", "aggregations")}
    d["aggregations"] = {k: v for k, v in (d.get("aggregations") or {}).items()
                         if k in ("type", "fundingSource", "scientificIndex", "files")}
    return d


def nva_profil(unit, aar, refresh):
    ut = {}
    for y in aar:
        q = urllib.parse.urlencode({"unit": NVA_ORG + unit, "publicationYearSince": y, "publicationYearBefore": y + 1,
                                    "aggregation": "all", "size": 0})
        d = json_cache(f"{NVA_SOK}?{q}", CACHE / f"nva_{unit}_{y}.json.gz", refresh, rens=uten_personer)
        agg = d.get("aggregations") or {}
        typ = {x["key"]: x["count"] for x in agg.get("type", [])}
        fin = {x["key"]: x["count"] for x in agg.get("fundingSource", [])}
        ut[str(y)] = {
            "registreringer": d.get("totalHits", 0),
            "vitenskapeligeArtikler": typ.get("AcademicArticle", 0) + typ.get("AcademicLiteratureReview", 0),
            "vitenskapeligeBokerOgKapitler": sum(v for k, v in typ.items() if k in ("AcademicMonograph", "AcademicChapter",
                                                                                   "AcademicCommentary")),
            "nviRapportert": sum(x["count"] for x in agg.get("scientificIndex", [])),
            "doktorgrader": typ.get("DegreePhd", 0),
            "masteroppgaver": typ.get("DegreeMaster", 0),
            "rapporter": sum(v for k, v in typ.items() if k.startswith("Report")),
            "medieOgFormidling": sum(v for k, v in typ.items() if k.startswith("Media") or k.startswith("PopularScience")),
            "foredrag": sum(v for k, v in typ.items() if k in ("ConferenceLecture", "Lecture", "ConferencePoster",
                                                               "OtherPresentation")),
            "medNfrFinansiering": fin.get("NFR", 0),
            "medEuFinansiering": sum(v for k, v in fin.items() if k.startswith("EC/") or k in ("EU", "ERC")),
        }
    return ut


# ---------------------------------------------------------------- hovedløp

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true", help="hent alle kilder på nytt")
    ap.add_argument("--fra", type=int, default=2021)
    ap.add_argument("--til", type=int, default=2025)
    a = ap.parse_args()
    aar = list(range(a.fra, a.til + 1))
    CACHE.mkdir(parents=True, exist_ok=True)

    staff = json.load(open(STAFF, encoding="utf-8"))
    inst_liste = [(i["inst"], i["kort"]) for i in staff["institusjoner"]]
    orgnr_til_inst = {e["orgnr"]: e["inst"] for e in json.load(open(EIERSKAP, encoding="utf-8"))["enheter"]}
    fak_navn, fak_nokkel = {}, {}
    for nokkel, liste in staff["fakulteter"].items():
        for f in liste:
            if f["inst"] == "1173":
                fak_navn[f["fakultetskode"]] = f["navn"]
                fak_nokkel[f["fakultetskode"]] = nokkel

    tmp = Path(tempfile.mkdtemp(prefix="forskning_"))
    try:
        print("Forskningsrådet, søknader")
        nfr_fil, nfr_meta = nfr_utdrag(a.refresh, tmp)
        nfr_i, nfr_f, nfr_ok, nfr_nasj = nfr_aggreger(nfr_fil, aar, orgnr_til_inst)
        print("Forskningsrådet, Prosjektbanken")
        pb_i, pb_f, _ = prosjektbanken(aar, a.refresh)
        print("CORDIS")
        eu, eu_tot, eu_navn, cordis_meta = {}, {}, {}, {}
        for prog, (_, url) in CORDIS.items():
            fil, cordis_meta[prog] = cordis_utdrag(prog, url, a.refresh, tmp, orgnr_til_inst)
            eu[prog], eu_tot[prog], eu_navn[prog] = cordis_aggreger(fil, aar, orgnr_til_inst)
        print("NVA")
        nva_f = {fak: nva_profil(unit, aar, a.refresh) for fak, (unit, _) in NMBU_FAK.items()}
        nva_nmbu = nva_profil("192.0.0.0", aar, a.refresh)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    tom_eu = {str(y): {"deltakelser": 0, "koordinator": 0, "bidragMillEuro": 0.0} for y in aar}
    institusjoner = {}
    for inst, kort in inst_liste:
        e = {"kort": kort,
             "nfr": nfr_i.get(inst),
             "nfrUtbetalt": {str(y): pb_i.get(inst, {}).get(str(y), 0.0) for y in aar},
             "eu": {p: eu[p].get(inst, tom_eu) for p in CORDIS},
             "euTotalt": {p: eu_tot[p].get(inst) for p in CORDIS},
             "euNavn": sorted({n for p in CORDIS for n in eu_navn[p].get(inst, [])})}
        if inst == "1173":
            e["nva"] = nva_nmbu
        institusjoner[inst] = e

    fakulteter = {}
    for fak in NMBU_FAK:
        fakulteter[f"1173_{fak}"] = {"kort": "NMBU", "fak": fak_nokkel.get(fak), "navn": fak_navn.get(fak),
                                     "nfr": nfr_f.get(fak), "nfrUtbetalt": {str(y): pb_f.get(fak, {}).get(str(y), 0.0) for y in aar},
                                     "nva": nva_f[fak]}
    fakulteter["1173_ikkeFordelt"] = {"kort": "NMBU", "fak": None,
                                      "navn": "NMBU, ikke fordelt på fakultet (registrert på universitetsnivå, UB o.l.)",
                                      "nfr": nfr_f.get("ikkeFordelt"),
                                      "nfrUtbetalt": {str(y): pb_f.get("ikkeFordelt", {}).get(str(y), 0.0) for y in aar}}

    # Andel NMBU-søknader som ikke kan fordeles på fakultet
    tot_nmbu = sum(v["soknader"] for v in (nfr_i.get("1173") or {}).values())
    ikke = sum(v["soknader"] for v in (nfr_f.get("ikkeFordelt") or {}).values())
    andel_ikke = r1(100 * ikke / tot_nmbu) if tot_nmbu else None
    pb_tot = sum(sum(v.values()) for v in pb_f.values())
    pb_ikke = sum(pb_f.get("ikkeFordelt", {}).values())
    andel_pb_ikke = r1(100 * pb_ikke / pb_tot) if pb_tot else None

    ut = {
        "hentet": dt.date.today().isoformat(),
        "periode": [a.fra, a.til],
        "kilder": [
            {"navn": "Forskningsrådet – åpne data, søknader (versjon 2)", "url": "https://github.com/Forskningsradet/open-data/tree/main/datasets/soknader2",
             "lisens": "NLOD 2.0", "sistOppdatert": nfr_meta.get("sistOppdatert")},
            {"navn": "Forskningsrådet – Prosjektbanken (utbetalt per år)", "url": "https://prosjektbanken.forskningsradet.no",
             "lisens": "NLOD 2.0"},
            *[{"navn": f"CORDIS – EU-prosjekter, {CORDIS[p][0]}", "url": CORDIS[p][1],
               "lisens": "Gjenbruk med kildehenvisning (Kommisjonens beslutning 2011/833/EU)",
               "sistOppdatert": cordis_meta[p].get("filDato")} for p in CORDIS],
            {"navn": "NVA – Nasjonalt vitenarkiv (Sikt)", "url": "https://nva.sikt.no", "lisens": "Åpent API"},
        ],
        "merknader": [
            "Enheter: innvilgetBelop, soktBelop og nfrUtbetalt i millioner kroner (mill. kr, løpende priser). "
            "bidragMillEuro i millioner euro (mill. euro). suksessrate i prosent.",
            "nfr: fordelt etter søknadsår (søknadsdato, ellers søknadsfrist) og prosjektansvarlig institusjon. "
            "innvilget = prosjektfase Bevilgning eller Avsluttet. suksessrate = innvilget / (innvilget + avslag); "
            "søknader under behandling er holdt utenfor. innvilgetBelop = samlet tildelt beløp for hele prosjektperioden, "
            "ført på søknadsåret. prosjektstotte = bare prosjekttypen «Prosjektstøtte» (konkurranseutsatte forskerprosjekter "
            "o.l.); «Andre» (arrangement, mobilitet m.m.) har langt høyere innvilgelse.",
            "VIKTIG: Forskningsrådets åpne søknadsdatasett inneholder ikke søknader fra det nye saksbehandlingssystemet Tibi. "
            f"Antall UoH-søknader per år i datasettet: {', '.join(f'{y}: {nfr_nasj.get(str(y), 0)}' for y in aar)}. "
            "Fallet fra 2022–2023 skyldes trolig i hovedsak Tibi og ikke færre søknader. Nivåene for 2023–2025 er derfor "
            "ufullstendige; suksessraten gjelder bare søknadene som er med.",
            "Bare prosjektansvarlig institusjon telles. Samarbeidspartnere som får deler av bevilgningen, er ikke med.",
            "nfrUtbetalt: Forskningsrådets utbetalinger per kalenderår til institusjonen som prosjektansvarlig, fra Prosjektbanken. "
            "Ifølge Prosjektbanken er utbetalingene i 2024 betydelig lavere enn før på grunn av overgang til bruttobudsjettering "
            "(tidligere fakturafrist) og derfor ikke sammenlignbare med andre år. Tall for 2026 vises ikke ennå. For NMBU er "
            "enheten «Fakultet for landskap og samfunn - fag/forskning», som Prosjektbanken viser som egen enhet ved siden av "
            "NMBU, lagt til (derfor litt høyere enn NMBU-søylen på nettsiden).",
            "eu: fra CORDIS, fordelt etter år for EU-kommisjonens signering av tilskuddsavtalen (ellers prosjektstart). "
            "deltakelser = roller som koordinator, deltaker (participant) eller tilknyttet enhet (thirdParty); assosierte partnere "
            "uten EU-bidrag er holdt utenfor. bidragMillEuro = sum ecContribution. Match på vatNumber (NO+orgnr+MVA); UiA, INN og "
            "HVL mangler vatNumber i CORDIS og er matchet på PIC. euTotalt = hele programmet uansett år.",
            "Horizon 2020 gjelder utlysninger 2014–2020; signeringer etter 2021 er etterslep. Horizon Europe startet i 2021, "
            "og de første avtalene ble signert sent i 2021 og i 2022.",
            "fagomrade.okonomi: NFR-søknader med fag «Økonomi» (Norsk inndeling av vitenskapsdisipliner), uansett enhet. "
            "Sammenligningsgrunnlag for Handelshøyskolen NMBU; for NMBU omfatter tallet også økonomer utenfor HH.",
            f"fakulteter (NMBU): NFR-søknader er fordelt etter navnet på prosjektansvarlig enhet. {andel_ikke} % av NMBUs søknader "
            f"i perioden er registrert på universitetsnivå og kan ikke fordeles (1173_ikkeFordelt). Tilsvarende er {andel_pb_ikke} % "
            "av utbetalingene i Prosjektbanken ikke fordelt. Fakultetstallene er derfor minimumstall.",
            "nva: registreringer i NVA med publiseringsår og minst én forfatter fra enheten. Samme registrering kan telle for "
            "flere fakulteter. medNfrFinansiering / medEuFinansiering = registreringer der finansieringen er oppgitt. Siste år kan "
            "fortsatt øke noe etter hvert som registreringer kommer inn.",
            "Personopplysninger (prosjektledernavn, forfattere) er ikke lagret.",
        ],
        "institusjoner": institusjoner,
        "fagomrade": {"okonomi": {"navn": "NFR-fag «Økonomi»",
                                  "institusjoner": {inst: {"kort": kort, "nfr": nfr_ok.get(inst)} for inst, kort in inst_liste}}},
        "fakulteter": fakulteter,
    }
    UT.parent.mkdir(parents=True, exist_ok=True)
    UT.write_text(json.dumps(ut, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    # Kontrollutskrift
    print(f"\nSkrev {UT.relative_to(ROOT)} ({UT.stat().st_size / 1024:.0f} kB)")
    print(f"{'inst':<11}" + "".join(f"{y:>16}" for y in aar) + "   HE totalt")
    for inst, kort in inst_liste:
        e = institusjoner[inst]
        celler = []
        for y in aar:
            n = (e["nfr"] or {}).get(str(y)) or {}
            celler.append(f"{n.get('soknader', 0):>4}/{n.get('innvilget', 0):<3}{e['nfrUtbetalt'][str(y)]:>7.1f}")
        he = e["euTotalt"]["horizonEurope"] or {}
        print(f"{kort:<11}" + "".join(f"{c:>16}" for c in celler) + f"   {he.get('deltakelser', 0):>4} {he.get('bidragMillEuro', 0):>7.1f}")
    mangler = [k for k, _ in inst_liste if not institusjoner[k]["nfr"]]
    mangler_eu = [k for k, _ in inst_liste if not any(institusjoner[k]["euTotalt"].values())]
    print("Uten NFR-søknader i perioden:", mangler or "ingen")
    print("Uten CORDIS-deltakelse:", mangler_eu or "ingen")


if __name__ == "__main__":
    main()
