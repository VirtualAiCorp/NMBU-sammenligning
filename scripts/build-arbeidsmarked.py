#!/usr/bin/env python3
"""Arbeidsmarkedet etter utdanning: lønn, ledighet, sysselsetting og yrker per programgruppe → kilde/public/arbeidsmarked/data.json

Formål: kortet «Arbeidsmarkedet etter utdanning» per fakultet (handlingsplan A4 i docs/nye-datakilder-utvidelse.md).
Alle tall er NASJONALE per fagfelt eller utdanningstype, ikke per institusjon.

Kilder (åpne API-er uten innlogging, rådata bufres i data/nmbu/kilder/arbeidsmarked/):
  SSB 14378  Utdanningsfordelt månedslønn etter fagfelt (NUS), utdanningsnivå og år etter fullført utdanning, heltid.
             PxWebApi v0, JSON-stat2, CC BY 4.0. Median, gjennomsnitt og antall arbeidsforhold for 0–2 og 3–4 år,
             de fem siste årene.
  SSB 11930  Andel sysselsatte i befolkningen etter fagfelt (1 siffer), utdanningsnivå og alder, hele landet, 25–29 år.
             Nærmeste åpne SSB-tabell for sysselsetting blant unge med høyere utdanning. Det finnes ingen åpen SSB-tabell
             for ledighet blant nyutdannede per detaljert fagfelt.
  utdanning.no (api.utdanning.no, åpent, men uversjonert):
             /sammenligning/arbeidsledighet   ledighet per uno_id (alle og nyutdannede 1–3 år), november 2024
             /sammenligning/arbeidsmarked     yrkesfordeling (STYRK08) per seks-sifret NUS-kode (nus2styrk08) eller
                                              per uno_id (uno_id2styrk08)
Koblingen programgruppe → NUS-fagfelt og uno_id er kuratert i data/nmbu/arbeidsmarked-kobling.json (NUS-kodene for
NMBU-programmene er fra DBH tabell 347). Programgruppene leses fra kilde/src/app/data/<fak>AdmissionData.json.

Bruk: python3 scripts/build-arbeidsmarked.py [--refresh]
  --refresh  henter alle rådata på nytt (ellers brukes bufferen, og bare manglende utdanning.no-nøkler hentes)
"""
import argparse
import datetime as dt
import itertools
import json
import ssl
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data" / "nmbu" / "kilder" / "arbeidsmarked"
KOBLING = ROOT / "data" / "nmbu" / "arbeidsmarked-kobling.json"
KLASS = ROOT / "data" / "nmbu" / "kilder" / "nus2000_ssb_klass36_hentet_2026-09-23.json"
DATA = ROOT / "kilde" / "src" / "app" / "data"
OUT = ROOT / "kilde" / "public" / "arbeidsmarked" / "data.json"
FAKULTETER = ["hh", "landsam", "realtek", "biovit", "kbm", "mina", "vet"]
UNO = "https://api.utdanning.no"
PERIODER = {"0-2": "00-02", "3-4": "03-04"}           # nøkkel i utdata → kode i SSB 14378
NIVAA = {"bachelor": "3", "master": "4"}               # SSB 14378/11930: 3 = nivå 6 (1–4 år), 4 = nivå 7–8 (over 4 år)
IKKE_YRKE = {"9994", "9995", "9996", "9997", "9998", "9999"}  # uføretrygd, ledig, ikke i arbeid, i utdanning, selvstendig
MIN_PERSONER_NUS = 100                                 # færre personer med NUS-koden → bruk uno_id for yrkene
MIN_NYUTDANNET = 100                                   # færre nyutdannede arbeidstakere → ingen ledighetsandel for dem
YRKESFELT = ["styrk08", "styrk08_navn", "antall_personer", "andel_personer", "antall_13", "antall_710", "kildedato"]


def ctx():
    return ssl.create_default_context(cafile="/etc/ssl/cert.pem")


def hent_json(url, body=None):
    """GET (eller POST med JSON-kropp) med tidsavbrudd og ett nytt forsøk."""
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json", "User-Agent": "nmbu-sammenligning/arbeidsmarked (åpne data)"}
    for forsok in range(2):
        try:
            req = urllib.request.Request(url, data=data, headers=headers)
            return json.loads(urllib.request.urlopen(req, context=ctx(), timeout=120).read())
        except Exception as e:  # noqa: BLE001 – vi vil prøve én gang til uansett feiltype
            if forsok:
                raise
            print(f"  nytt forsøk etter feil: {e}", file=sys.stderr)
            time.sleep(3)


def sel(code, vals, filt="item"):
    return {"code": code, "selection": {"filter": filt, "values": vals}}


def ssb(tabell, query, fil, refresh):
    p = CACHE / fil
    if p.exists() and not refresh:
        return json.load(open(p, encoding="utf-8"))
    print(f"Henter SSB {tabell} …")
    d = hent_json(f"https://data.ssb.no/api/v0/no/table/{tabell}", {"query": query, "response": {"format": "json-stat2"}})
    json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False)
    return d


def celler(d):
    dims = [list(d["dimension"][i]["category"]["index"]) for i in d["id"]]
    return dict(zip(itertools.product(*dims), d["value"]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    CACHE.mkdir(parents=True, exist_ok=True)
    kobling = json.load(open(KOBLING, encoding="utf-8"))
    klass = {c["code"]: c["name"] for c in json.load(open(KLASS, encoding="utf-8"))["codes"]}

    # --- SSB 14378: alle fagfelt, heltid, månedslønn, de fem siste årene ---
    meta = hent_json("https://data.ssb.no/api/v0/no/table/14378") if a.refresh or not (CACHE / "ssb_14378.json").exists() else None
    fagfelt = [v for v in meta["variables"] if v["code"] == "Fagfelt"][0]["values"] if meta else []
    lonn = ssb("14378", [sel("MaaleMetode", ["01", "02", "10"]), sel("UtdNivaa", ["3", "4"]),
                         sel("AntAarEtterUtd", list(PERIODER.values())), sel("Fagfelt", fagfelt),
                         sel("AvtaltArbTid", ["5"]), sel("ContentsCode", ["Manedslonn"]), sel("Tid", ["5"], "top")],
               "ssb_14378.json", a.refresh)
    L = celler(lonn)
    aarL = list(lonn["dimension"]["Tid"]["category"]["index"])
    sisteL = aarL[-1]
    ffNavn = lonn["dimension"]["Fagfelt"]["category"]["label"]

    # --- SSB 11930: sysselsettingsandel 25–29 år per fagfelt (1 siffer) og nivå, hele landet ---
    syss = ssb("11930", [sel("Region", ["0"]), sel("Kjonn", ["0"]), sel("Alder", ["25-29"]),
                         sel("Fagfelt", ["00", "0", "1", "2", "3", "4", "5", "6", "7", "8"]), sel("UtdNivaa", ["3", "4"]),
                         sel("ContentsCode", ["SysselsatteBefolk"]), sel("Tid", ["5"], "top")],
               "ssb_11930.json", a.refresh)
    S = celler(syss)
    aarS = list(syss["dimension"]["Tid"]["category"]["index"])
    fagfelt1Navn = syss["dimension"]["Fagfelt"]["category"]["label"]

    # --- utdanning.no: ledighet (ett kall for alle uno_id-er) ---
    alleUno = sorted({u for fak in FAKULTETER for k in kobling.get(fak, {}).values() for u in k["unoIds"]})
    pL = CACHE / "utdanningno_arbeidsledighet.json"
    ledig = json.load(open(pL, encoding="utf-8")) if pL.exists() and not a.refresh else {}
    mangler = [u for u in alleUno if u not in ledig.get("_spurt", [])]
    if mangler:
        print(f"Henter ledighet fra utdanning.no for {len(alleUno)} uno_id-er …")
        svar = hent_json(f"{UNO}/sammenligning/arbeidsledighet?uno_id={','.join(alleUno)}")
        ledig = {"_hentet": dt.date.today().isoformat(), "_spurt": alleUno, **svar}
        json.dump(ledig, open(pL, "w", encoding="utf-8"), ensure_ascii=False)

    # --- utdanning.no: yrkesfordeling per NUS-kode og per uno_id ---
    pY = CACHE / "utdanningno_yrker.json"
    yrker = json.load(open(pY, encoding="utf-8")) if pY.exists() and not a.refresh else {}
    nokler = sorted({f"nus:{k['nusProgram'][0]}" for fak in FAKULTETER for k in kobling.get(fak, {}).values()} |
                    {f"uno:{u}" for u in alleUno})
    nye = [n for n in nokler if n not in yrker]
    for i, n in enumerate(nye):
        typ, kode = n.split(":")
        q = {"nus": kode, "retning": "nus2styrk08"} if typ == "nus" else {"uno_id": kode, "retning": "uno_id2styrk08"}
        print(f"  yrker {i + 1}/{len(nye)}: {n}")
        d = hent_json(f"{UNO}/sammenligning/arbeidsmarked?{urllib.parse.urlencode(q)}")
        # Bufferen holdes liten: bare feltene vi bruker (svaret har mange nuller og lange id-er)
        yrker[n] = [{f: x.get(f) for f in YRKESFELT} for x in d.get("response", {}).get("docs", [])]
        time.sleep(0.3)  # skånsomt mot et åpent, men uversjonert API
    if nye or not pY.exists():
        yrker["_hentet"] = dt.date.today().isoformat()
        json.dump(yrker, open(pY, "w", encoding="utf-8"), ensure_ascii=False)

    # --- hjelpefunksjoner for én gruppe ---
    def har(kode, niv, per):
        return L.get(("01", niv, per, kode, "5", "Manedslonn", sisteL)) is not None

    def lonn_periode(kode, niv, per):
        if kode is None:
            return None
        return {"nus": kode, "nusNavn": ffNavn.get(kode), "nusNivaa": len(kode),
                "median": L.get(("01", niv, per, kode, "5", "Manedslonn", sisteL)),
                "gjennomsnitt": L.get(("02", niv, per, kode, "5", "Manedslonn", sisteL)),
                "antall": L.get(("10", niv, per, kode, "5", "Manedslonn", sisteL)),
                "trend": {y: L.get(("01", niv, per, kode, "5", "Manedslonn", y)) for y in aarL}}

    def lonn_perioder(kjede, niv):
        """Velg fagfeltkode i kjeden (SSB skjuler små celler). Samme kode for 0–2 og 3–4 år når det går, slik at
        periodene kan sammenlignes. Ellers første kode med tall for hver periode for seg."""
        begge = next((k for k in kjede if all(har(k, niv, p) for p in PERIODER.values())), None)
        if begge:
            return {p: lonn_periode(begge, niv, kode) for p, kode in PERIODER.items()}
        return {p: lonn_periode(next((k for k in kjede if har(k, niv, kode)), None), niv, kode)
                for p, kode in PERIODER.items()}

    def ledighet(unoIds):
        for u in unoIds:
            agg = (ledig.get(u) or {}).get("aggregert")
            if not agg or agg.get("arbeidsledige_andel") is None:
                continue
            n13 = agg.get("arbeidstakere_antall13") or 0
            return {"unoId": u, "tittel": agg.get("tittel"),
                    "prosent": round(agg["arbeidsledige_andel"] * 100, 1),
                    "prosentNyutdannet": round(agg["arbeidsledige_andel13"] * 100, 1)
                    if agg.get("arbeidsledige_andel13") is not None and n13 >= MIN_NYUTDANNET else None,
                    "arbeidstakere": agg.get("arbeidstakere_antall"), "arbeidstakereNyutdannet": n13 or None,
                    "maaletidspunkt": (agg.get("kildedato") or "")[:10]}
        return None

    def topp_yrker(k):
        kandidater = []
        if not k.get("yrkerFraUno"):
            kandidater.append(("nus", k["nusProgram"][0]))
        kandidater += [("uno_id", u) for u in k["unoIds"]]
        for typ, kode in kandidater:
            docs = yrker.get(f"{'nus' if typ == 'nus' else 'uno'}:{kode}") or []
            personer = sum(x.get("antall_personer") or 0 for x in docs)
            if not docs or (typ == "nus" and personer < MIN_PERSONER_NUS):
                continue
            ekte = [x for x in docs if x.get("styrk08") and x["styrk08"][0] not in IKKE_YRKE]
            ekte.sort(key=lambda x: -(x.get("antall_personer") or 0))
            ut = [{"navn": x["styrk08_navn"], "styrk08": x["styrk08"][0],
                   "andel": round((x.get("andel_personer") if x.get("andel_personer") is not None
                                   else x["antall_personer"] / personer) * 100, 1),
                   "antall": x["antall_personer"]} for x in ekte[:5]]
            return ut, {"type": typ, "kode": kode, "personer": personer,
                        "maaletidspunkt": (docs[0].get("kildedato") or "")[:10]}
        return [], None

    # --- bygg utdata per fakultet og gruppe ---
    fakUt, dekning, advarsler = {}, {}, []
    for fak in FAKULTETER:
        grupper = json.load(open(DATA / f"{fak}AdmissionData.json", encoding="utf-8"))["groups"]
        kob = kobling.get(fak, {})
        for ekstra in set(kob) - {g["id"] for g in grupper}:
            advarsler.append(f"{fak}/{ekstra}: finnes i koblingen, men ikke i {fak}AdmissionData.json")
        fakUt[fak] = {}
        dk = {"grupper": len(grupper), "koblet": 0, "medLonn": 0, "medLedighet": 0, "medYrker": 0, "presis": 0}
        for g in grupper:
            k = kob.get(g["id"])
            grad = "bachelor" if g["level"] == "bachelor" else "master"
            if not k:
                advarsler.append(f"{fak}/{g['id']}: mangler i koblingen")
                fakUt[fak][g["id"]] = {"label": g["label"], "nivaa": g["level"], "grad": grad, "koblet": False,
                                       "grunn": "Ikke kuratert ennå."}
                continue
            niv = NIVAA[grad]
            perioder = lonn_perioder(k["ssbFagfelt"], niv)
            harLonn = perioder["0-2"] is not None
            kvalitet = k["kvalitet"]
            if harLonn and perioder["0-2"]["nusNivaa"] == 1:
                kvalitet = "grov"  # fagfelt på ett siffer er alltid grovt
            forste = perioder["0-2"] or perioder["3-4"]
            ff1 = (forste["nus"] if forste else k["ssbFagfelt"][0])[0]
            ys, yg = topp_yrker(k)
            led = ledighet(k["unoIds"])
            rad = {
                "label": g["label"], "nivaa": g["level"], "grad": grad, "koblet": True,
                "nus": forste["nus"] if forste else None, "nusNavn": forste["nusNavn"] if forste else None,
                "nusProgram": [{"kode": c, "navn": klass.get(c)} for c in k["nusProgram"]],
                "lonn": {"aar": int(sisteL), "maal": "månedslønn, heltid", **perioder} if harLonn or perioder["3-4"] else None,
                "ledighet": led,
                "sysselsetting": {"fagfelt": ff1, "fagfeltNavn": fagfelt1Navn.get(ff1), "alder": "25–29",
                                  "prosent": S.get(("0", "0", "25-29", ff1, niv, "SysselsatteBefolk", aarS[-1])),
                                  "trend": {y: S.get(("0", "0", "25-29", ff1, niv, "SysselsatteBefolk", y)) for y in aarS}},
                "yrker": ys, "yrkerGrunnlag": yg,
                "unoIds": k["unoIds"], "koblingsKvalitet": kvalitet, "begrunnelse": k["begrunnelse"],
            }
            if not harLonn:
                rad["lonnMangler"] = ("SSB skjuler cellene for dette fagfeltet og nivået (for få arbeidsforhold), og et "
                                      "høyere nivå i NUS ville vært misvisende.")
            fakUt[fak][g["id"]] = rad
            dk["koblet"] += 1
            dk["medLonn"] += harLonn
            dk["medLedighet"] += led is not None
            dk["medYrker"] += bool(ys)
            dk["presis"] += kvalitet == "presis"
        dekning[fak] = dk

    ut = {
        "hentet": dt.date.today().isoformat(),
        "kilder": [
            {"navn": "SSB 14378 Utdanningsfordelt månedslønn og antall år etter fullført utdanning (CC BY 4.0)",
             "url": "https://www.ssb.no/statbank/table/14378"},
            {"navn": "SSB 11930 Andel sysselsatte i befolkningen etter fagfelt, utdanningsnivå og alder (CC BY 4.0)",
             "url": "https://www.ssb.no/statbank/table/11930"},
            {"navn": "utdanning.no: arbeidsledighet og yrkesfordeling per utdanning (sammenlign.utdanning.no)",
             "url": "https://sammenlign.utdanning.no"},
            {"navn": "utdanning.no API (åpent, uversjonert)", "url": "https://api.utdanning.no/openapi.json"},
            {"navn": "DBH tabell 347 Studieprogrammer (NUS-koder for NMBU-programmene), HK-dir, NLOD",
             "url": "https://dbh.hkdir.no"},
            {"navn": "SSB Klass 36 NUS2000", "url": "https://www.ssb.no/klass/klassifikasjoner/36"},
        ],
        "merknader": [
            "Alle tall er nasjonale per fagfelt (SSB) eller per utdanningstype (utdanning.no), ikke per institusjon. De "
            "viser arbeidsmarkedet for alle med tilsvarende utdanning i Norge, ikke for NMBU-kandidatene særskilt.",
            f"Lønn: SSB 14378, månedslønn for heltidsansatte i november {sisteL} (avtalt lønn, uregelmessige tillegg, "
            "bonus og provisjon, ikke overtid). «0–2 år» og «3–4 år» regnes fra høyeste fullførte utdanning.",
            "Bachelor er SSBs nivå 6 (universitet og høgskole, 1–4 år). Master er nivå 7–8 (over 4 år), som også tar med "
            "ph.d. og skiller ikke mellom toårige og femårige master.",
            "SSB skjuler celler med få arbeidsforhold. Da brukes neste nivå i NUS (3 → 2 siffer, for noen grupper 1). "
            "Samme gruppe brukes for 0–2 og 3–4 år når begge har tall, slik at periodene kan sammenlignes. Feltet "
            "nusNivaa viser hvilket nivå tallene er fra, og nus/nusNavn hvilken gruppe.",
            "koblingsKvalitet «grov» betyr at programmet er en liten del av en bred gruppe eller sekkegruppe, eller at "
            "tallene er fra et høyere NUS-nivå. Koblingen er kuratert i data/nmbu/arbeidsmarked-kobling.json.",
            "Ledighet: utdanning.no, registrert ledige i prosent av arbeidstakere og ledige med utdanningen, november 2024. "
            "«Nyutdannet» er fullført for 1–3 år siden. Den vises ikke når færre enn 100 nyutdannede er i arbeid.",
            "Yrker: utdanning.no (STYRK08), alle personer med utdanningen uansett alder og år siden fullført, november 2024. "
            "Andelen er av alle med utdanningen, også dem som ikke er i arbeid. Uføre, ledige, personer i utdanning, "
            "selvstendig næringsdrivende og «ikke i arbeid» er tatt ut av topp 5. Yrkene hentes for programmets egen "
            "NUS-kode når minst 100 personer har den, ellers for uno_id (yrkerGrunnlag viser hvilken).",
            f"Sysselsetting: SSB 11930, andel sysselsatte 25–29 år i hele fagfeltet (1 siffer) og nivået, 4. kvartal "
            f"{aarS[-1]}. Mange med bachelor i denne alderen studerer videre, så andelen er lavere for bachelor.",
            "utdanning.no-API-et er åpent, men ikke versjonert og kan endres uten varsel.",
        ],
        "aar": {"lonn": [int(y) for y in aarL], "sysselsetting": [int(y) for y in aarS]},
        "dekning": dekning,
        "fakulteter": fakUt,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(ut, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Skrev {OUT.relative_to(ROOT)} ({OUT.stat().st_size / 1024:.0f} kB)")
    for fak, dk in dekning.items():
        print(f"  {fak:8} {dk['koblet']}/{dk['grupper']} koblet · lønn {dk['medLonn']} · ledighet {dk['medLedighet']} · "
              f"yrker {dk['medYrker']} · presis {dk['presis']}")
    for adv in advarsler:
        print(f"  ADVARSEL: {adv}")


if __name__ == "__main__":
    main()
