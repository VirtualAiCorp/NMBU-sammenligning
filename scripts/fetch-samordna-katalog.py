#!/usr/bin/env python3
"""Studieplasser 2016–2026 og «ledige plasser»-flagget fra Samordna opptak → kilde/public/studieplasser/data.json.

Kilde: Samordnas søke-API for søkerportalen, POST https://sok.samordnaopptak.no/api/v1/search. Dette er det samme
API-et som den offentlige studietabellen på samordnaopptak.no bruker, og det krever ingen innlogging. API-et er
UDOKUMENTERT (feltnavn kan endres uten varsel) — se fallgruvene i docs/nye-datakilder-utvidelse.md §3 og
prøvefilene i data/nmbu/kilder/nye-kilder/ (samordna_search_eksempel_nmbu_boa_2026.json viser alle felt for én
post, samordna_studieplasser_2016-2026_nmbu_og_okonomi.csv og samordna_studietilbud_2026_med_ledigflagg.json viser
hvilke felt som er brukt her).

Hvert opptaksår er et eget «admission.id» i API-et. NOM-opptakene (ordinært opptak) 2016–2026 er kontrollert
manuelt i denne økten (26.09.2026, sjekket admission.name i svaret for hver id) og er id 1, 3, 4, 5, 6, 8, 10, 12,
14, 16, 18 — se ID_TIL_AAR. Det hentes ETT kall per år med stor «size» (3000, katalogen har i overkant av 1300–1400
program per år), altså 11 kall totalt for hele tidsserien. Bare offentlige programfelt brukes (samme felt som vises
åpent i studietabellen); ingen søkerdata (`/applicant`, `/applications`) og ingen innlogging.

Koblingsnøkkelen er `studyProgrammeInstitutionCode` (f.eks. «192369» for NMBU Økonomi og administrasjon), som er
identisk med feltet «studiekode» i kilde/src/app/data/<fak>AdmissionData.json for fak i hh, landsam, realtek,
biovit, kbm, mina, vet.

«ledig2026» er feltet `offerVacanciesSinceLast` i det gjeldende opptaket (2026, id 18). Feltet nullstilles når et
opptak arkiveres, så det kan bare leses ut for det nyeste året. Tolkningen «var på lista over ledige studieplasser»
er IKKE bekreftet av Samordna (se §3 i notatet over) og er merket som forbehold i «merknader» i output-filen.

Rådata caches gzip-komprimert i data/nmbu/kilder/samordna-katalog/<år>.json.gz, én fil per opptaksår, slik at
skriptet kan kjøres på nytt (f.eks. for å bygge om data.json) uten å belaste API-et igjen. Bruk --refresh for å
hente alle år på nytt uansett cache.

Vi er høflige mot API-et: én pause på 1,5 sekund mellom hvert faktiske nettverkskall (ikke mellom kall som svares
fra cache), og en User-Agent som identifiserer prosjektet og en kontakt-e-post.

Output kilde/public/studieplasser/data.json (kompakt UTF-8):
  hentet, kilder, merknader, og
  program: studiekode -> {
    navn, institusjon         (bare for studiekoder som finnes i en AdmissionData-fil)
    plasser: {år: antall studieplasser}
    nytt: første år programmet finnes i katalogen (utelatt hvis det er 2016, altså «alltid vært der»)
    nedlagt: true + sisteAar  (hvis studiekoden mangler i det siste hentede opptaket)
    avlyst: true              (hvis isCancelled=true i siste treff for studiekoden)
    ledig2026, ledigSistSett  (dato = hentedato for 2026-katalogen, bare når ledig2026 er true)
  }
  For studiekoder som ikke finnes i noen AdmissionData-fil er bare plasser og ledig2026 tatt med, for å holde
  filen kompakt (katalogen har langt flere program enn de ~198 NMBU følger med på).

Bruk:
  python3 scripts/fetch-samordna-katalog.py [--refresh]
"""
import gzip
import json
import ssl
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data" / "nmbu" / "kilder" / "samordna-katalog"
OUT = ROOT / "kilde" / "public" / "studieplasser" / "data.json"
API = "https://sok.samordnaopptak.no/api/v1/search"
UA = ("NMBU-sammenligning-datainnsamling/1.0 (ikke-kommersiell studentanalyse; "
      "kontakt: mathias.sydtangen.smogeli@nmbu.no)")

# Kontrollert manuelt 26.09.2026 (admission.name i API-svaret for hver id). NOM = ordinært opptak.
ID_TIL_AAR = {1: 2016, 3: 2017, 4: 2018, 5: 2019, 6: 2020, 8: 2021, 10: 2022, 12: 2023, 14: 2024, 16: 2025, 18: 2026}
SISTE_AAR = max(ID_TIL_AAR.values())

FAKULTETER = ["hh", "landsam", "realtek", "biovit", "kbm", "mina", "vet"]
ADMISSION_DATA_DIR = ROOT / "kilde" / "src" / "app" / "data"


def ssl_ctx():
    try:
        return ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    except Exception:
        return ssl.create_default_context()


def hent_admissiondata_koder():
    """Alle studiekoder (SO-koder) som brukes i programkartet, på tvers av fakultetene."""
    koder = set()
    for fak in FAKULTETER:
        sti = ADMISSION_DATA_DIR / f"{fak}AdmissionData.json"
        if not sti.exists():
            continue
        d = json.loads(sti.read_text(encoding="utf-8"))
        for g in d.get("groups", []):
            for e in g.get("entries", []):
                if e.get("studiekode"):
                    koder.add(str(e["studiekode"]))
    return koder


def hent_opptak(admission_id, refresh):
    aar = ID_TIL_AAR[admission_id]
    cache_fil = CACHE / f"{aar}.json.gz"
    if cache_fil.exists() and not refresh:
        with gzip.open(cache_fil, "rt", encoding="utf-8") as f:
            return json.load(f), False

    body = json.dumps({"filter": [{"term": {"admission.id": admission_id}}], "size": 3000}).encode("utf-8")
    req = urllib.request.Request(
        API, data=body, method="POST",
        headers={"Content-Type": "application/json", "User-Agent": UA},
    )
    siste_feil = None
    for forsok in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30, context=ssl_ctx()) as resp:
                raw = resp.read()
            break
        except (urllib.error.URLError, TimeoutError) as e:
            siste_feil = e
            time.sleep(2 * (forsok + 1))
    else:
        raise SystemExit(f"Klarte ikke å hente opptak {admission_id} ({aar}): {siste_feil}")

    d = json.loads(raw.decode("utf-8"))
    CACHE.mkdir(parents=True, exist_ok=True)
    with gzip.open(cache_fil, "wt", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False)
    return d, True


def main(refresh=False):
    admdata_koder = hent_admissiondata_koder()
    program = {}  # studiekode -> arbeidsdata

    for admission_id in sorted(ID_TIL_AAR, key=lambda i: ID_TIL_AAR[i]):
        aar = ID_TIL_AAR[admission_id]
        d, hentet_na = hent_opptak(admission_id, refresh)
        for post in d.get("data", []):
            kode = post.get("studyProgrammeInstitutionCode")
            if not kode:
                continue
            kode = str(kode)
            p = program.setdefault(kode, {"plasser": {}})
            plasser = post.get("numStudyPlaces")
            if plasser is not None:
                p["plasser"][str(aar)] = plasser
            p["_navn"] = post.get("names", {}).get("NB")
            p["_institusjon"] = (post.get("institution") or {}).get("name")
            p["_siste_aar_sett"] = aar
            p["_avlyst_siste"] = bool(post.get("isCancelled"))
            if aar == SISTE_AAR:
                p["_ledig"] = bool(post.get("offerVacanciesSinceLast"))
        if hentet_na:
            time.sleep(1.5)  # høflig pause mellom faktiske kall

    hentedato = time.strftime("%Y-%m-%d")
    ut = {}
    for kode, p in program.items():
        aar_funnet = sorted(int(a) for a in p["plasser"])
        forste = aar_funnet[0] if aar_funnet else None
        siste = aar_funnet[-1] if aar_funnet else None

        post = {"plasser": dict(sorted(p["plasser"].items(), key=lambda kv: int(kv[0])))}
        if forste is not None and forste > min(ID_TIL_AAR.values()):
            post["nytt"] = forste
        if siste is not None and siste < SISTE_AAR:
            post["nedlagt"] = True
            post["sisteAar"] = siste
        if p.get("_avlyst_siste"):
            post["avlyst"] = True
        post["ledig2026"] = bool(p.get("_ledig", False))
        if post["ledig2026"]:
            post["ledigSistSett"] = hentedato

        if kode in admdata_koder:
            post = {"navn": p.get("_navn"), "institusjon": p.get("_institusjon"), **post}
        ut[kode] = post

    OUT.parent.mkdir(parents=True, exist_ok=True)
    resultat = {
        "hentet": hentedato,
        "kilder": [
            "POST https://sok.samordnaopptak.no/api/v1/search — NOM-opptakene 2016-2026 "
            "(admission.id 1, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18), size 3000, bare offentlige programfelt. "
            "Udokumentert API, samme kall som den offentlige studietabellen bruker."
        ],
        "merknader": (
            "«ledig2026» er feltet offerVacanciesSinceLast i 2026-opptaket (id 18) — tolket som «var på lista over "
            "ledige studieplasser i 2026», en tolkning som ikke er bekreftet av Samordna (se "
            "docs/nye-datakilder-utvidelse.md §3). Feltet nullstilles når et opptak arkiveres, så det finnes bare "
            "for det siste hentede året. «nedlagt» betyr at studiekoden fantes i et tidligere opptak, men ikke i "
            "det siste. «avlyst» er isCancelled=true i siste treff for studiekoden. For studiekoder som ikke er "
            "koblet til programkartet (AdmissionData-filene for hh/landsam/realtek/biovit/kbm/mina/vet) er bare "
            "plasser og ledig2026 tatt med."
        ),
        "program": ut,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(resultat, f, ensure_ascii=False, separators=(",", ":"))

    med_navn = sum(1 for k in ut if k in admdata_koder)
    print(f"Skrev {OUT.relative_to(ROOT)}: {len(ut)} studiekoder totalt, {med_navn} koblet til AdmissionData "
          f"(av {len(admdata_koder)} studiekoder i programkartet).")
    manglende = admdata_koder - set(ut)
    if manglende:
        print(f"OBS: {len(manglende)} studiekoder i AdmissionData ble IKKE funnet i Samordna-katalogen: "
              + ", ".join(sorted(manglende)))


if __name__ == "__main__":
    main(refresh="--refresh" in sys.argv)
