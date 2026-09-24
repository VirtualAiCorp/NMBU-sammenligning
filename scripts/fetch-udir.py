#!/usr/bin/env python3
"""Rekrutteringsgrunnlaget fra videregående skole → kilde/public/sokergrunnlag/udir.json.

Kilde: Statistikkportalen (statistikkportalen.udir.no), som er Udirs egen rapporteringsmotor bak
statistikkbanken på udir.no. Dette er IKKE api.statistikkbanken.udir.no (det åpne REST-API-et der
dekker foreløpig bare Elevundersøkelsen, jf. https://apikonsoll.statistikkbanken.udir.no/ →
Dokumentasjon: «Foreløpig omfatter dette åtte tabeller knyttet til Elevundersøkelsen»). Statistikk-
portalen krever ikke innlogging og returnerer nøyaktig de samme (allerede skjermede/prikkede) tallene
som vises åpent på udir.no/tall-og-forskning/statistikk/statistikkbank/ — det er samme motor som
siden selv bruker (funnet via performance.getEntriesByType('resource') i nettleseren, dokumentert i
det åpne swagger-oppsettet på statistikkportalen.udir.no/api/rapportering/swagger).

Tabeller brukt (skjema/tabell/rapportNr/rapportVersjon i URL-stien):
  VGO/ResultatFagV/2/5   Karakterer i videregående skole (samme tabell som
                         udir.no/.../karakterer-vgs/). Rad­hierarki Fag→Nasjonalt→Fylke→Enhet.
  VGO/GjennomfoeringV/1/1  Gjennomføring i videregående, sortert etter fylke (samme tabell som
                         udir.no/.../gjennomforing-av-videregaende-opplaring--sortert-etter-fylke/).
  VGO/ElevV/4/2          Elevtall i videregående skole – utdanningsprogram og trinn.

Fagkoder for matematikk (begge reformer, slik at tidsserien henger sammen over LK06→LK20):
  R1: REA3022 (LK06) / REA3056 (LK20)   R2: REA3024 (LK06) / REA3058 (LK20)
  S1: REA3026 (LK06) / REA3060 (LK20)   S2: REA3028 (LK06) / REA3062 (LK20)
  (Kun standpunktkarakter-varianten er brukt, ikke de separate «muntlig»-fagkodene REA3023/57 osv.
  Standpunkt (KaraktertypeID=1) er primærkilde; skriftlig eksamen (KaraktertypeID=3) brukes som
  fallback der standpunkt mangler/er skjermet, jf. oppgaveteksten.)

Filterparametre følger swagger-dokumentasjonen på statistikkportalen.udir.no/api/rapportering/swagger
(parameter «filter», delfiltre adskilt med «_», verdier i parentes). «radSti» styrer hvilke rader i
rad­hierarkiet som hentes (F.eks. «31572.1» = Hele landet under fag 31572, «31572.1.*» = alle fylker
under det igjen). EnhetID-verdiene i ResultatFagV/GjennomfoeringV dekker HELE reformhistorikken i én
og samme liste (gamle og nye fylkesnumre er ulike EnhetID-er med samme «kode»-felt = fylkenummer),
så gammel og ny fylkesinndeling hentes ut i samme spørring uten manuell fylkeskobling per år.

Bruk:
  python3 scripts/fetch-udir.py [--refresh]
"""
import argparse
import datetime as dt
import json
import ssl
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KDIR = ROOT / "data" / "nmbu" / "kilder" / "udir"
OUT = ROOT / "kilde" / "public" / "sokergrunnlag" / "udir.json"
API = "https://statistikkportalen.udir.no/api/rapportering/rest/v1/Statistikk"

# 2024-fylkesinndelingen (oppgitt i oppgaveteksten) + «0» for hele landet.
FYLKER_2024 = {
    "0": "Hele landet", "31": "Østfold", "32": "Akershus", "33": "Buskerud", "03": "Oslo",
    "34": "Innlandet", "39": "Vestfold", "40": "Telemark", "42": "Agder", "11": "Rogaland",
    "46": "Vestland", "15": "Møre og Romsdal", "50": "Trøndelag", "18": "Nordland",
    "55": "Troms", "56": "Finnmark",
}
# Eldre regioner som dukker opp i tidsseriene (2020–2023-sammenslåingen og perioden før den).
# Kodene og navnene er Udirs egne; vi finner ikke på noen fordeling til 2024-fylkene.
FYLKER_GAMLE = {
    "30": "Viken (2020–2023)", "38": "Vestfold og Telemark (2020–2023)",
    "54": "Troms og Finnmark (2020–2023)",
    "01": "Østfold (til 2019)", "02": "Akershus (til 2019)", "04": "Hedmark (til 2019)",
    "05": "Oppland (til 2019)", "06": "Buskerud (til 2019)", "07": "Vestfold (til 2019)",
    "08": "Telemark (til 2019)", "09": "Aust-Agder (til 2019)", "10": "Vest-Agder (til 2019)",
    "12": "Hordaland (til 2019)", "14": "Sogn og Fjordane (til 2019)",
    "16": "Sør-Trøndelag (til 2017)", "17": "Nord-Trøndelag (til 2017)",
    "19": "Troms (til 2019)", "20": "Finnmark (til 2019)",
}
FYLKER = {**FYLKER_2024, **FYLKER_GAMLE}

# Matematikkfagene: (visningsnavn, [(FagID LK06, kode), (FagID LK20, kode)]).
MATTEFAG = [
    ("Matematikk R1", [(3576, "REA3022"), (31572, "REA3056")]),
    ("Matematikk R2", [(935, "REA3024"), (31574, "REA3058")]),
    ("Matematikk S1", [(1319, "REA3026"), (31576, "REA3060")]),
    ("Matematikk S2", [(2693, "REA3028"), (31578, "REA3062")]),
]


def ctx():
    try:
        return ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    except Exception:
        return ssl.create_default_context()


def hent(url, cache_navn, refresh, method="GET", timeout=90):
    """GET mot Statistikkportalen, med rå-cache i data/nmbu/kilder/udir/."""
    sti = KDIR / cache_navn
    if sti.exists() and not refresh:
        return json.loads(sti.read_text(encoding="utf-8"))
    req = urllib.request.Request(url, headers={"accept": "*/*", "User-Agent": "nmbu-sammenligning"}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx()) as r:
            raw = r.read()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{url} -> {e.code} {e.read()[:300]!r}") from e
    KDIR.mkdir(parents=True, exist_ok=True)
    sti.write_bytes(raw)
    time.sleep(0.25)
    return json.loads(raw)


def filter_streng(delfiltre):
    """Bygger «filter=»-strengen. delfiltre: dict {DelfilterID: [verdier]}, sortert alfabetisk (jf. dokumentasjonen)."""
    deler = []
    for k in sorted(delfiltre):
        verdier = "_".join(str(v) for v in delfiltre[k])
        deler.append(f"{k}({verdier})")
    return "_".join(deler)


def data_url(skjema, tabell, rnr, rver, radsti, filt, ekstra=""):
    from urllib.parse import quote
    q = f"radSti={quote(radsti, safe='().*_')}&filter={quote(filt, safe='().*_')}&inkluderKoder=true{ekstra}"
    return f"{API}/{skjema}/{tabell}/{rnr}/{rver}/data?{q}"


def leaf_paths(columns):
    """Flater ut den hierarkiske kolonne-metadataen til én tuple-«sti» per faktisk (blad)kolonne."""
    per_level = []
    for lvl in columns:
        navn = []
        for c in lvl:
            navn.extend([c["name"]] * c["columnCount"])
        per_level.append(navn)
    return list(zip(*per_level))


def til_float(s):
    if s is None:
        return None
    s = s.strip()
    if s in ("", "*"):
        return None
    try:
        return float(s.replace(",", "."))
    except ValueError:
        return None


def til_int(s):
    if s is None:
        return None
    s = s.replace("\xa0", " ").strip()
    if s in ("", "*"):
        return None
    try:
        return int(s.replace(" ", ""))
    except ValueError:
        return None


def aar_nokkel(navn):
    """«Foreløpige tall 2025-26» → «2025-26»; «2024-25» → uendret; «2019» → uendret (kullår)."""
    return navn.replace("Foreløpige tall ", "").strip()


def fylkekode(kode, navn):
    if kode == "I":
        return "0"
    return kode


def hent_tidid_liste(skjema, tabell, rnr, rver, cache_navn, refresh):
    fv = hent(f"{API}/{skjema}/{tabell}/{rnr}/{rver}/filterVerdier", cache_navn, refresh)
    return sorted((int(x["id"]) for x in fv["TidID"]), reverse=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    KDIR.mkdir(parents=True, exist_ok=True)
    merknader = []

    # ── 1) Matematikk: VGO/ResultatFagV/2/5 ──────────────────────────────────────────────
    tidid_matte = hent_tidid_liste("VGO", "ResultatFagV", 2, 5, "resultatfagv_filterverdier.json", a.refresh)
    matematikk = {}
    fagkoder_brukt = []
    for visningsnavn, koder in MATTEFAG:
        fagkoder_brukt.append(f"{visningsnavn}: {', '.join(k for _, k in koder)}")
        radsti = "_".join(f"({fid}.1)_({fid}.1.*)" for fid, _ in koder)
        filt = filter_streng({
            "EierformID": [-10], "KaraktertypeID": [1, 3], "KjoennID": [-10],
            "TidID": tidid_matte, "VisAntallPersoner": [1],
        })
        cache = "matte_" + visningsnavn.split()[-1].lower() + ".json"
        url = data_url("VGO", "ResultatFagV", 2, 5, radsti, filt)
        d = hent(url, cache, a.refresh)
        stier = leaf_paths(d["metadata"]["columns"])
        # index (aar) -> {"standpunkt": (i_snitt, i_antall), "skriftlig": (...)}
        per_aar = {}
        for i, sti in enumerate(stier):
            aar, karaktertype, eierform, kjonn, metrikk = sti
            if eierform != "Alle eierformer" or kjonn != "Alle kjønn":
                continue
            aarnokkel = aar_nokkel(aar)
            slot = per_aar.setdefault(aarnokkel, {})
            gruppe = slot.setdefault(karaktertype, {})
            gruppe[metrikk] = i

        fag_ut = {}
        skriftlig_brukt_for = []
        for row in d["rows"]:
            kode = row.get("kode")
            if kode is None:
                continue
            fnr = fylkekode(kode, row["navn"])
            data = row["data"]
            serie = {}
            for aarnokkel, grupper in per_aar.items():
                elever = snitt = None
                for karaktertype in ("Standpunkt", "Skriftlig eksamen"):
                    g = grupper.get(karaktertype)
                    if not g or "Antall elever" not in g:
                        continue
                    e = til_int(data[g["Antall elever"]])
                    if e is None:
                        continue
                    elever = e
                    snitt = til_float(data[g["Snittkarakter"]]) if "Snittkarakter" in g else None
                    if karaktertype != "Standpunkt":
                        skriftlig_brukt_for.append(f"{fnr}/{aarnokkel}")
                    break
                if elever is not None:
                    serie[aarnokkel] = {"elever": elever, "snitt": snitt}
            if not serie:
                continue
            eksisterende = fag_ut.setdefault(fnr, {})
            for aarnokkel, verdi in serie.items():
                eksisterende.setdefault(aarnokkel, verdi)
        matematikk[visningsnavn] = fag_ut
        if skriftlig_brukt_for:
            merknader.append(
                f"{visningsnavn}: standpunkt manglet/var skjermet for {len(skriftlig_brukt_for)} "
                f"fylke/år-kombinasjoner; skriftlig eksamen er brukt som fallback der (f.eks. "
                f"{skriftlig_brukt_for[0]})."
            )
        print(f"{visningsnavn}: {sum(len(v) for v in fag_ut.values())} fylke/år-punkter "
              f"({len(fag_ut)} fylker/hele landet)")

    merknader.append(
        "Matematikk R1/R2/S1/S2: fagkoder brukt (LK06/LK20, standpunkt, evt. skriftlig eksamen som "
        "fallback) — " + "; ".join(fagkoder_brukt) + "."
    )
    merknader.append(
        "For fylker som fikk tilbake nøyaktig sitt gamle navn i 2024 (Østfold, Vestfold, Telemark, "
        "Troms, Finnmark), viser Udir de samme tallene for årene før 2020 under BÅDE den gamle koden "
        "(f.eks. «01 Østfold (til 2019)») og den gjeldende 2024-koden (f.eks. «31 Østfold») — de er "
        "ikke to ulike målinger, bare samme tall under to fylkeskoder. Fylker som ble slått sammen "
        "eller delt annerledes (Akershus/Buskerud/Aust-Agder/Vest-Agder m.fl.) har bare data under sin "
        "gamle kode for årene før 2020."
    )

    # ── 2) Gjennomføring: VGO/GjennomfoeringV/1/1 ────────────────────────────────────────
    tidid_gj = hent_tidid_liste("VGO", "GjennomfoeringV", 1, 1, "gjennomfoering_filterverdier.json", a.refresh)
    filt_gj = filter_streng({
        "EierformID": [-10], "IndikatorID": [-174], "KjoennID": [-10],
        "ProgramomraadeID": [-10], "TidID": tidid_gj, "VisProsent": [1],
    })
    url_gj = data_url("VGO", "GjennomfoeringV", 1, 1, "(-12)_(-12.*)", filt_gj)
    d_gj = hent(url_gj, "gjennomfoering_data.json", a.refresh)
    stier_gj = leaf_paths(d_gj["metadata"]["columns"])
    aar_idx = {}
    for i, sti in enumerate(stier_gj):
        aar = sti[0]
        if sti[-1] == "Prosent":
            aar_idx[aar] = i
    gjennomforing = {}
    for row in d_gj["rows"]:
        kode = row.get("kode")
        if kode is None:
            continue
        fnr = fylkekode(kode, row["navn"])
        serie = {}
        for aar, i in aar_idx.items():
            andel = til_float(row["data"][i])
            if andel is None:
                continue
            serie[aar] = {"andel": andel, "aar": 6}
        if serie:
            gjennomforing[fnr] = serie
    print(f"Gjennomføring: {sum(len(v) for v in gjennomforing.values())} fylke/kull-punkter")
    merknader.append(
        "Gjennomføring: Udir-tabellen «Fullført» (innen 5/6 år etter start i vg1, «F» i "
        "IndikatorID=-174 i Statistikkportalen). Udir fjernet 11.09.2026 tall for kullene 2006–2013 "
        "fra statistikkbanken pga. et brudd i beregningsgrunnlaget (SSB endret metode); derfor finnes "
        "bare kullene 2014–2019 her. Fylkestallene er på fylkesinndelingen som gjaldt da kullet begynte "
        "(alle disse kullene startet før 2020-sammenslåingen, så det er den gamle inndelingen, f.eks. "
        "«02 Akershus (til 2019)», ikke 2024-fylkene)."
    )

    # ── 3) Vg3 studieforberedende: VGO/ElevV/4/2 ─────────────────────────────────────────
    tidid_vg3 = hent_tidid_liste("VGO", "ElevV", 4, 2, "elevv_filterverdier.json", a.refresh)
    vg3 = {}
    fylker_for_vg3 = {"0": None, **{k: None for k in FYLKER_2024 if k != "0"}}
    # EnhetID-verdier (fra ElevV/4/2 sin filterVerdier) for 2024-fylkene + hele landet.
    ENHET_ID_2024 = {
        "0": -12, "42": -41, "32": -44, "33": -48, "56": -49, "34": -39, "15": -28, "18": -31,
        "03": -17, "11": -25, "40": -46, "55": -47, "50": -36, "39": -45, "46": -42, "31": -43,
    }
    for fnr, enhet_id in ENHET_ID_2024.items():
        delfiltre = {"EierformID": [-10], "KjoennID": [-10], "TidID": tidid_vg3, "TrinnID": [12]}
        if enhet_id != -12:
            delfiltre["EnhetID"] = [enhet_id]
        filt = filter_streng(delfiltre)
        url = data_url("VGO", "ElevV", 4, 2, "-12", filt)
        d = hent(url, f"elevv_vg3_{fnr}.json", a.refresh)
        stier = leaf_paths(d["metadata"]["columns"])
        aar_idx = {sti[0]: i for i, sti in enumerate(stier)}
        for row in d["rows"]:
            if row.get("kode") != "SFB":
                continue
            serie = {}
            for aar, i in aar_idx.items():
                v = til_int(row["data"][i])
                if v is not None:
                    serie[aar_nokkel(aar)] = v
            if serie:
                vg3[fnr] = serie
    print(f"Vg3 studieforberedende: {sum(len(v) for v in vg3.values())} fylke/år-punkter")

    # ── Skriv ut ──────────────────────────────────────────────────────────────────────────
    ut = {
        "hentet": dt.date.today().isoformat(),
        "kilder": [
            {"navn": "Udir – Karakterer i videregående skole", "url": "https://www.udir.no/tall-og-forskning/statistikk/statistikk-videregaende-skole/karakterer-vgs/"},
            {"navn": "Udir – Gjennomføring i videregående, sortert etter fylke", "url": "https://www.udir.no/tall-og-forskning/statistikk/statistikk-videregaende-skole/tall-for-gjennomforing-av-videregaende-opplaring/gjennomforing-av-videregaende-opplaring--sortert-etter-fylke/"},
            {"navn": "Udir – Elevtall i videregående skole", "url": "https://www.udir.no/tall-og-forskning/statistikk/statistikk-videregaende-skole/elevtall-i-videregaende-skole/elevtall-vgo-utdanningsprogram/"},
        ],
        "fylker": FYLKER,
        "matematikk": matematikk,
        "gjennomforing": gjennomforing,
        "vg3Studieforberedende": vg3,
        "merknader": merknader,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(ut, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Skrev {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
