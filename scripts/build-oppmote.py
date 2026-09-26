#!/usr/bin/env python3
"""
build-oppmote.py

Genererer oppmøte- og strykstatistikk per emne fra DBH/HKDIR sitt åpne API,
tabell 905 «Eksamensdata» (oppmeldt, møtt, bestått, stryk). Se
docs/nye-datakilder-utvidelse.md (§2 «DBH 905 Eksamensdata», §3 fallgruver om
BI og skjerming) og docs/oppskrift-dbh-karakterer.md (samme DBH-API, samme
POST-endepunkt, samme skjermingsregler – 905 er ikke dokumentert der, men
kallmønsteret er identisk).

Omfang: alle emner som allerede vises på nettsiden, dvs. courses[] under
groups[].programs[] i kilde/src/app/data/<fak>CourseData.json, for
fak = hh, landsam, realtek, biovit, kbm, mina, vet.

Nettverk: ETT POST-kall mot 905 PER (DBH-institusjonskode, spørringstype) –
ikke ett kall per emne. To spørringstyper per institusjon:
  - emnenivå:      groupBy Institusjonskode, Årstall, Emnekode
  - institusjonstotal: groupBy Institusjonskode, Årstall (uten Emnekode)
Svarene mellomlagres gzip-komprimert i --cache slik at gjentatte kjøringer er
offline med mindre --refresh er satt.

Noen programmer har en DBH-institusjonskode skrevet som to koder slått sammen
med "+" (f.eks. "0264+1177" for Høgskolen i Hedmark -> Universitetet i
Innlandet, som byttet DBH-kode). Da hentes og summeres begge kodene, og
resultatet lagres under nøkkelen "<opprinnelig kode med +>|<emnekode>" – altså
akkurat den strengen som står i dbhInstitusjonskode i kildedataene, slik at
frontend kan slå opp direkte med samme streng. Institusjonskode "" (ikke satt)
hoppes over.

Skjerming: DBH skjermer små tall (< 3) for brukere uten institusjonstilgang –
de vises da som 0 i stedet for det virkelige (lave) tallet, uten noe eget
flagg i JSON-svaret. Dette skriptet kan ikke skille en skjermet celle fra en
ekte 0, og gjør heller ikke noe forsøk på å regne den ut (se merknader-feltet
i hver utdatafil). BI (institusjonskode 8241) oppgir «oppmeldt» = «møtt» i
DBH 905 og har dermed ikke reelt oppmøte å hente derfra; dette – og andre
institusjoner med samme mønster – oppdages automatisk (se
finn_institusjoner_uten_oppmote()) og merkes i utdata.

Bruk:
    python3 scripts/build-oppmote.py
    python3 scripts/build-oppmote.py --fak hh landsam --refresh
    python3 scripts/build-oppmote.py --years 2021 2022 2023 2024 2025 --stikkprove

Kun standardbibliotek (json, urllib, argparse, gzip).
"""
from __future__ import annotations

import argparse
import gzip
import json
import os
import ssl
import sys
import urllib.error
import urllib.request
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent

DEFAULT_COURSE_DATA_DIR = REPO_ROOT / "kilde/src/app/data"
DEFAULT_CACHE_DIR = REPO_ROOT / "data/nmbu/kilder/dbh905"
DEFAULT_OUT_DIR = REPO_ROOT / "kilde/public/emner/oppmote"
FAKULTETER = ["hh", "landsam", "realtek", "biovit", "kbm", "mina", "vet"]
DEFAULT_YEARS = [2021, 2022, 2023, 2024, 2025]

DBH_URL = "https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData"
HTTP_TIMEOUT = 300

# Kjente institusjoner som (per docs/nye-datakilder-utvidelse.md §3) oppgir
# oppmeldt = møtt i DBH 905, og dermed ikke har reelt oppmøte å vise.
KJENTE_UTEN_OPPMOTE = {"8241"}  # BI

# Enkelte python.org-installasjoner på macOS mangler et fylt CA-sertifikatlager.
_FALLBACK_CA_BUNDLES = ["/etc/ssl/cert.pem", "/etc/ssl/certs/ca-certificates.crt"]


def _open_url(req: urllib.request.Request, timeout: int):
    try:
        return urllib.request.urlopen(req, timeout=timeout)
    except urllib.error.URLError as e:
        if isinstance(e.reason, ssl.SSLCertVerificationError) or "CERTIFICATE_VERIFY_FAILED" in str(e):
            for bundle in _FALLBACK_CA_BUNDLES:
                if os.path.exists(bundle):
                    ctx = ssl.create_default_context(cafile=bundle)
                    return urllib.request.urlopen(req, timeout=timeout, context=ctx)
        raise


# ───────────────────────────── DBH-API (tabell 905) ─────────────────────────

def dbh_query_905_emne(institusjonskode: str, years: list[str]) -> dict:
    """Oppmeldt/møtt/bestått/stryk PER EMNE og år, for hele institusjonen
    (uavhengig av studieprogram – tellevariablene kan ikke stå i groupBy)."""
    return {
        "tabell_id": 905,
        "api_versjon": 1,
        "statuslinje": "J",
        "kodetekst": "J",
        "desimal_separator": ".",
        "groupBy": ["Institusjonskode", "Årstall", "Emnekode"],
        "sortBy": ["Institusjonskode"],
        "filter": [
            {"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [institusjonskode], "exclude": [""]}},
            {"variabel": "Årstall", "selection": {"filter": "item", "values": years, "exclude": [""]}},
        ],
    }


def dbh_query_905_institusjon(institusjonskode: str, years: list[str]) -> dict:
    """Institusjonstotal (uten Emnekode i groupBy) per år."""
    return {
        "tabell_id": 905,
        "api_versjon": 1,
        "statuslinje": "J",
        "kodetekst": "J",
        "desimal_separator": ".",
        "groupBy": ["Institusjonskode", "Årstall"],
        "sortBy": ["Institusjonskode"],
        "filter": [
            {"variabel": "Institusjonskode", "selection": {"filter": "item", "values": [institusjonskode], "exclude": [""]}},
            {"variabel": "Årstall", "selection": {"filter": "item", "values": years, "exclude": [""]}},
        ],
    }


def cache_finnes(cache_path: Path) -> bool:
    return cache_path.exists() or Path(str(cache_path) + ".gz").exists()


def les_cache(cache_path: Path) -> str:
    if cache_path.exists():
        return cache_path.read_text(encoding="utf-8")
    with gzip.open(str(cache_path) + ".gz", "rt", encoding="utf-8") as f:
        return f.read()


def skriv_cache(cache_path: Path, tekst: str) -> None:
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    with gzip.open(str(cache_path) + ".gz", "wt", encoding="utf-8", compresslevel=6) as f:
        f.write(tekst)
    if cache_path.exists():
        cache_path.unlink()


def fetch_dbh(query: dict, cache_path: Path, refresh: bool) -> list:
    """POSTer mot DBH-API-et, eller leser fra (gzip-)cache. Returnerer
    raden-listen (uten status-elementet). Cacher alltid det RÅ svaret."""
    if cache_finnes(cache_path) and not refresh:
        raw_text = les_cache(cache_path)
        print(f"  [cache] {cache_path.name} ({len(raw_text) / 1_000_000:.2f} MB)", file=sys.stderr)
        data = json.loads(raw_text)
    else:
        body = json.dumps(query, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            DBH_URL, data=body, headers={"Content-Type": "application/json"}, method="POST",
        )
        inst = query["filter"][0]["selection"]["values"]
        print(f"  [nett]  POST tabell 905 inst={inst} groupBy={query['groupBy']} ...", file=sys.stderr)
        try:
            with _open_url(req, HTTP_TIMEOUT) as resp:
                raw = resp.read()
        except urllib.error.URLError as e:
            print(f"  [FEIL]  {cache_path.name}: {e}", file=sys.stderr)
            return []
        data = json.loads(raw.decode("utf-8"))
        skriv_cache(cache_path, json.dumps(data, ensure_ascii=False))

    if isinstance(data, dict):
        print(f"  [FEIL]  uventet svar (dict) for {cache_path.name}: {data}", file=sys.stderr)
        return []
    if not data:
        print(f"  [FEIL]  tomt svar for {cache_path.name}", file=sys.stderr)
        return []

    status = data[0].get("status", {})
    print(f"  [status] {cache_path.name}: antall={status.get('antall')} melding={status.get('melding')!r}", file=sys.stderr)
    return data[1:]


# ───────────────────────────── hjelpefunksjoner ──────────────────────────────

def num(raw):
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        return raw
    raw = str(raw).strip()
    if raw == "":
        return None
    try:
        f = float(raw)
    except ValueError:
        return None
    # DBH-tellevariabler er heltall (bortsett fra eksamensprod, som vi ikke bruker her)
    return int(round(f))


def prosent(teller, nevner):
    if teller is None or nevner is None or nevner == 0:
        return None
    return round(100.0 * teller / nevner, 1)


def split_institusjonskoder(kode: str) -> list[str]:
    """"0264+1177" -> ["0264", "1177"]. Enkeltkode gis tilbake som ett-element-liste."""
    return [k for k in str(kode).split("+") if k]


# ───────────────────────────── innlesing av kildedata ────────────────────────

def last_course_data(fak: str, course_data_dir: Path) -> dict:
    path = course_data_dir / f"{fak}CourseData.json"
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def emnekoder_for_fak(course_data: dict) -> dict[str, set[str]]:
    """dbhInstitusjonskode (originalstreng, evt. med '+') -> sett av emnekoder
    som forekommer under den koden i denne fak-fila."""
    ut: dict[str, set[str]] = {}
    for g in course_data.get("groups", []):
        for p in g.get("programs", []):
            kode = p.get("dbhInstitusjonskode") or ""
            if not kode:
                continue
            emner = {c["emnekode"] for c in p.get("courses", []) if c.get("emnekode")}
            if not emner:
                continue
            ut.setdefault(kode, set()).update(emner)
    return ut


# ───────────────────────────── hovedlogikk ───────────────────────────────────

def hent_institusjon_data(inst: str, years: list[str], cache_dir: Path, refresh: bool):
    """Henter (emne-rader, totalrader) for én enkelt (ikke-sammensatt)
    DBH-institusjonskode. Returnerer (emne_dict, total_dict):
      emne_dict:  emnekode -> {år -> rad}
      total_dict: år -> rad
    """
    emne_rows = fetch_dbh(
        dbh_query_905_emne(inst, years), cache_dir / f"905_emne_{inst}.json", refresh,
    )
    total_rows = fetch_dbh(
        dbh_query_905_institusjon(inst, years), cache_dir / f"905_institusjon_{inst}.json", refresh,
    )

    emne_dict: dict[str, dict[str, dict]] = {}
    for row in emne_rows:
        emnekode = row.get("Emnekode")
        aar = row.get("Årstall")
        if not emnekode or not aar:
            continue
        emne_dict.setdefault(emnekode, {})[aar] = row

    total_dict: dict[str, dict] = {}
    for row in total_rows:
        aar = row.get("Årstall")
        if aar:
            total_dict[aar] = row

    return emne_dict, total_dict


def rad_til_tall(row: dict) -> dict:
    oppmeldt = num(row.get("Oppmeldt totalt"))
    mott = num(row.get("Møtt til eksamen"))
    bestatt = num(row.get("Bestått"))
    stryk = num(row.get("Antall kandidater stryk"))
    return {
        "oppmeldt": oppmeldt,
        "mott": mott,
        "bestatt": bestatt,
        "stryk": stryk,
        "oppmoteandel": prosent(mott, oppmeldt),
        "strykAvOppmeldte": prosent(stryk, oppmeldt),
        "strykAvMott": prosent(stryk, mott),
    }


def finn_institusjoner_uten_oppmote(alle_totaler: dict[str, dict[str, dict]]) -> set[str]:
    """En institusjon flagges som «rapporterer ikke oppmøte» hvis oppmeldt ==
    møtt i ALLE år med oppmeldt > 0 (samme mønster som BI, se
    docs/nye-datakilder-utvidelse.md §3)."""
    ut = set(KJENTE_UTEN_OPPMOTE)
    for inst, per_aar in alle_totaler.items():
        rader = [r for r in per_aar.values() if num(r.get("Oppmeldt totalt"))]
        if not rader:
            continue
        if all(num(r.get("Oppmeldt totalt")) == num(r.get("Møtt til eksamen")) for r in rader):
            ut.add(inst)
    return ut


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--fak", nargs="*", default=FAKULTETER, help="Hvilke fakulteter (standard: alle sju)")
    ap.add_argument("--years", nargs="*", type=int, default=DEFAULT_YEARS, help="Årstall (standard: 2021-2025)")
    ap.add_argument("--course-data-dir", type=Path, default=DEFAULT_COURSE_DATA_DIR)
    ap.add_argument("--cache-dir", type=Path, default=DEFAULT_CACHE_DIR)
    ap.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR)
    ap.add_argument("--refresh", action="store_true", help="Ignorer cache, hent alt på nytt fra DBH")
    ap.add_argument("--stikkprove", action="store_true", help="Skriv ut 3 stikkprøveemner til stderr for manuell kontroll")
    args = ap.parse_args()

    years = [str(y) for y in args.years]
    hentet_tidspunkt = __import__("datetime").datetime.now().isoformat(timespec="seconds")

    # 1) Les alle fak-filer, finn hvilke (institusjonskode-streng, emnekode) som trengs.
    fak_course_data = {}
    fak_kode_emner: dict[str, dict[str, set[str]]] = {}
    for fak in args.fak:
        cd = last_course_data(fak, args.course_data_dir)
        fak_course_data[fak] = cd
        fak_kode_emner[fak] = emnekoder_for_fak(cd)

    # 2) Samle ALLE enkeltinstitusjonskoder (splittet på "+") som trengs, på tvers av fakulteter.
    alle_enkeltkoder: set[str] = set()
    for kode_emner in fak_kode_emner.values():
        for kode in kode_emner:
            alle_enkeltkoder.update(split_institusjonskoder(kode))
    alle_enkeltkoder.discard("")

    print(f"[info] {len(alle_enkeltkoder)} DBH-institusjonskoder å hente: {sorted(alle_enkeltkoder)}", file=sys.stderr)

    # 3) Ett kall (emnenivå) + ett kall (institusjonstotal) PER institusjonskode.
    emne_data: dict[str, dict[str, dict[str, dict]]] = {}   # inst -> emnekode -> år -> rad
    total_data: dict[str, dict[str, dict]] = {}             # inst -> år -> rad
    for inst in sorted(alle_enkeltkoder):
        emne_dict, total_dict = hent_institusjon_data(inst, years, args.cache_dir, args.refresh)
        emne_data[inst] = emne_dict
        total_data[inst] = total_dict

    uten_oppmote = finn_institusjoner_uten_oppmote(total_data)
    print(f"[info] institusjoner uten reelt oppmøte (oppmeldt=møtt): {sorted(uten_oppmote)}", file=sys.stderr)

    # 4) Skriv institusjoner.json (institusjonstotal per år, for ALLE institusjonskoder som forekommer).
    institusjoner_ut = {}
    for inst in sorted(alle_enkeltkoder):
        per_aar = {}
        for aar in years:
            row = total_data.get(inst, {}).get(aar)
            if row is None:
                continue
            per_aar[aar] = rad_til_tall(row)
        institusjoner_ut[inst] = {
            "oppmoteRapportert": inst not in uten_oppmote,
            "aar": per_aar,
        }
    args.out_dir.mkdir(parents=True, exist_ok=True)
    inst_merknader = [
        "Kilde: DBH/HK-dir, tabell 905 «Eksamensdata» (dbh-data.dataporten-api.no), NLOD.",
        "Institusjonstotal per år, groupBy Institusjonskode+Årstall (uten Emnekode).",
        "oppmoteRapportert=false betyr at institusjonen har oppmeldt==møtt i alle år med data "
        "(samme mønster som BI/8241) – oppmøtet er da ikke reelt målbart fra denne tabellen.",
        "Skjerming: DBH skjuler celler under 3 for brukere uten institusjonstilgang. Slike celler "
        "vises som 0 i kildedataene og kan IKKE skilles fra en ekte 0 her.",
    ]
    (args.out_dir / "institusjoner.json").write_text(
        json.dumps({
            "hentet": hentet_tidspunkt,
            "aar": years,
            "merknader": inst_merknader,
            "institusjoner": institusjoner_ut,
        }, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    # 5) Skriv <fak>.json per fakultet: kun emnene som faktisk vises for det fakultetet.
    dekning_rapport = []
    for fak in args.fak:
        kode_emner = fak_kode_emner[fak]
        emner_ut = {}
        antall_emner_totalt = 0
        antall_med_tall = 0
        insts_uten_oppmote_i_fak = set()

        for kode, emnekoder in kode_emner.items():
            enkeltkoder = split_institusjonskoder(kode)
            if any(k in uten_oppmote for k in enkeltkoder):
                insts_uten_oppmote_i_fak.add(kode)

            for emnekode in sorted(emnekoder):
                antall_emner_totalt += 1
                per_aar = {}
                for aar in years:
                    # Summer over enkeltkodene (normalt bare én) for hvert år.
                    delrader = []
                    for k in enkeltkoder:
                        row = emne_data.get(k, {}).get(emnekode, {}).get(aar)
                        if row is not None:
                            delrader.append(row)
                    if not delrader:
                        continue
                    if len(delrader) == 1:
                        tall = rad_til_tall(delrader[0])
                    else:
                        summert = {
                            "Oppmeldt totalt": sum(num(r.get("Oppmeldt totalt")) or 0 for r in delrader),
                            "Møtt til eksamen": sum(num(r.get("Møtt til eksamen")) or 0 for r in delrader),
                            "Bestått": sum(num(r.get("Bestått")) or 0 for r in delrader),
                            "Antall kandidater stryk": sum(num(r.get("Antall kandidater stryk")) or 0 for r in delrader),
                        }
                        tall = rad_til_tall(summert)
                    per_aar[aar] = tall

                if per_aar:
                    antall_med_tall += 1
                    emner_ut[f"{kode}|{emnekode}"] = per_aar

        dekning = round(100.0 * antall_med_tall / antall_emner_totalt, 1) if antall_emner_totalt else 0.0
        dekning_rapport.append((fak, antall_med_tall, antall_emner_totalt, dekning))

        merknader = [
            "Kilde: DBH/HK-dir, tabell 905 «Eksamensdata» (dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData), NLOD-lisens.",
            "Omfatter kun emnene som allerede vises for dette fakultetet i kilde/src/app/data/"
            f"{fak}CourseData.json, hentet for årene {years[0]}-{years[-1]}.",
            "Nøkkel: '<dbhInstitusjonskode>|<emnekode>' – institusjonskoden er den samme strengen "
            "som dbhInstitusjonskode i CourseData-fila (kan være to koder slått sammen med '+', "
            "f.eks. '0264+1177' for Høgskolen i Hedmark -> Universitetet i Innlandet; da er tallene "
            "summert over begge kodene).",
            "oppmoteandel = møtt/oppmeldt i %, strykAvOppmeldte = stryk/oppmeldt i %, "
            "strykAvMott = stryk/møtt i %. Alle prosenter er null hvis nevneren er 0 eller mangler.",
            "Skjerming: DBH skjuler celler under 3 (uten institusjonstilgang/Feide-token). Skjulte "
            "celler vises som 0 i kildedataene og kan ikke skilles fra en ekte 0 her – lave tall "
            "(spesielt stryk=0 på små emner) må tolkes med forbehold.",
        ]
        if insts_uten_oppmote_i_fak:
            merknader.append(
                "Institusjonskoder uten reelt oppmøte i denne fila (oppmeldt=møtt i DBH 905, "
                "«oppmøte ikke rapportert»): " + ", ".join(sorted(insts_uten_oppmote_i_fak)) + "."
            )

        (args.out_dir / f"{fak}.json").write_text(
            json.dumps({
                "hentet": hentet_tidspunkt,
                "aar": years,
                "merknader": merknader,
                "emner": emner_ut,
            }, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )

    # 6) Dekningsrapport.
    print("\n[dekning] andel emner med oppmøtetall per fakultet:", file=sys.stderr)
    for fak, med, tot, pct in dekning_rapport:
        print(f"  {fak:8s}  {med:4d}/{tot:<4d}  ({pct}%)", file=sys.stderr)

    # 7) Valgfri stikkprøve.
    if args.stikkprove:
        print("\n[stikkprøve]", file=sys.stderr)
        talt = 0
        for fak in args.fak:
            path = args.out_dir / f"{fak}.json"
            data = json.loads(path.read_text(encoding="utf-8"))
            for nokkel, per_aar in data["emner"].items():
                if talt >= 3:
                    break
                if not per_aar:
                    continue
                siste_aar = sorted(per_aar.keys())[-1]
                print(f"  {fak} {nokkel} {siste_aar}: {per_aar[siste_aar]}", file=sys.stderr)
                talt += 1
            if talt >= 3:
                break


if __name__ == "__main__":
    main()
