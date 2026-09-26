#!/usr/bin/env python3
"""Tar et datert øyeblikksbilde av hvilke studieprogram som står på Samordnas liste over ledige studieplasser akkurat
nå, og lagrer det som data/nmbu/kilder/samordna-ledige/<dato>.json.

Bakgrunn: etter hovedopptaket publiserer Samordna en liste over program med ledige plasser (`offerVacancies=true`
i søke-API-et), fra 19.7. til den fjernes rundt 30.9. når restplassene er fylt opp. Flagget vises bare mens
opptaket er «Published» — når opptaket arkiveres på nyåret nullstilles det, og historikken finnes ikke lenger i
API-et (se docs/nye-datakilder-utvidelse.md §3). Skal vi bygge en tidsserie over NÅR programmene fylles opp, må vi
derfor ta jevnlige øyeblikksbilder selv mens vinduet er åpent.

Samme API som fetch-samordna-katalog.py (POST https://sok.samordnaopptak.no/api/v1/search), men med et ekstra
filter på `offerVacancies` i tillegg til gjeldende opptak, så kallet er lite (bare programmene som faktisk har
ledige plasser nå, typisk et lite mindretall av katalogen).

Skriptet gjør bare selve hentingen og lagringen — det planlegger IKKE seg selv. Tanken er en planlagt oppgave
(cron/scheduled task) to ganger i uka fra 19.7. til 30.9., men det settes opp separat og er utenfor denne
leveransen.

Bruk:
  python3 scripts/fetch-samordna-ledige.py [--admission-id N]

  --admission-id: hvilket opptak som skal sjekkes (id i Samordnas API). Standard er GJELDENDE_ADMISSION_ID
  nedenfor, som må oppdateres til det nye årets id når et nytt opptak åpner (se ID_TIL_AAR i
  fetch-samordna-katalog.py for kjente id-er; det nyeste ikke-arkiverte opptaket er det som skal brukes).
"""
import argparse
import json
import ssl
import time
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UT_DIR = ROOT / "data" / "nmbu" / "kilder" / "samordna-ledige"
API = "https://sok.samordnaopptak.no/api/v1/search"
UA = ("NMBU-sammenligning-datainnsamling/1.0 (ikke-kommersiell studentanalyse; "
      "kontakt: mathias.sydtangen.smogeli@nmbu.no)")

# Opptaket dette gjelder for. 18 = 2026 (se ID_TIL_AAR i fetch-samordna-katalog.py). Oppdater når neste opptak
# åpner og får ledige plasser (typisk et nytt, større id-tall midt på sommeren).
GJELDENDE_ADMISSION_ID = 18


def ssl_ctx():
    try:
        return ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    except Exception:
        return ssl.create_default_context()


def hent_ledige(admission_id):
    body = json.dumps({
        "filter": [
            {"term": {"admission.id": admission_id}},
            {"term": {"offerVacancies": True}},
        ],
        "size": 2000,
    }).encode("utf-8")
    req = urllib.request.Request(
        API, data=body, method="POST",
        headers={"Content-Type": "application/json", "User-Agent": UA},
    )
    siste_feil = None
    for forsok in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30, context=ssl_ctx()) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError) as e:
            siste_feil = e
            time.sleep(2 * (forsok + 1))
    raise SystemExit(f"Klarte ikke å hente ledige plasser for opptak {admission_id}: {siste_feil}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--admission-id", type=int, default=GJELDENDE_ADMISSION_ID)
    args = ap.parse_args()

    d = hent_ledige(args.admission_id)
    dato = date.today().isoformat()
    program = []
    for post in d.get("data", []):
        kode = post.get("studyProgrammeInstitutionCode")
        if not kode:
            continue
        program.append({
            "studiekode": str(kode),
            "navn": post.get("names", {}).get("NB"),
            "institusjon": (post.get("institution") or {}).get("shortName"),
            "maxVacancies": post.get("maxVacancies"),
        })

    UT_DIR.mkdir(parents=True, exist_ok=True)
    ut_fil = UT_DIR / f"{dato}.json"
    resultat = {
        "hentet": dato,
        "kilde": f"POST {API} — admission.id={args.admission_id}, offerVacancies=true",
        "antall": len(program),
        "program": program,
    }
    with open(ut_fil, "w", encoding="utf-8") as f:
        json.dump(resultat, f, ensure_ascii=False, indent=2)

    print(f"Skrev {ut_fil.relative_to(ROOT)}: {len(program)} program med ledige plasser nå "
          f"(opptak {args.admission_id}).")


if __name__ == "__main__":
    main()
