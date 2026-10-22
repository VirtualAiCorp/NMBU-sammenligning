#!/usr/bin/env python3
"""Nevner (faglige årsverk per år) for de nordiske enhetene i Skandinavia-sammenligningen, med kvalitetsmerke.

Leser kildetallene agentene samlet 18.10.2026 (data/rangering/norden/nevner/{sverige,danmark,felles}.csv, rapportene i
data/rangering/inspirasjon/nevner-*.md) og Vipunen-API-et for Finland, og velger ÉN nevner per enhet og år etter
reglene i REGLER under. Norge er ikke med her: de norske enhetene bruker DBH-årsverkene fra build-rangering.py.

To varianter, som i AJG-sammenligningen:
  med   ≈ HK-dirs UN1 + stipendiater + postdoktorer (faglige + stipendiater/doktorander og postdoktorer)
  uten  ≈ NHHs nevner (uten stipendiater/doktorander)

Kvalitet (vises i fanen):
  god      tall for selve enheten (enheten er hele institusjonen, eller fakultetets egne tall)
  middels  tall for en kjent, litt annen avgrensning (hele fakultetet med andre fag, rekonstruert, fagfelt som
           samsvarer med artikkelavgrensningen)
  svak     fagområdet for hele universitetet (UKÄ-faggruppe, dansk hovedområde SAMF): en ramme, ikke enheten

Skriver data/rangering/norden/nevner/nevner.json (i git; bare aggregater). Vipunen-svaret mellomlagres i
data/rangering/norden/nevner/vipunen-aggregat.json (i git, aggregert per universitet, år og karrieretrinn).

Bruk:
  python3 scripts/rangering/lag_nevner_norden.py            # bruker mellomlagret Vipunen hvis den finnes
  python3 scripts/rangering/lag_nevner_norden.py --vipunen  # henter Vipunen på nytt (åpent API, ingen nøkkel)
"""
import argparse
import csv
import datetime as dt
import json
import sys
import time
import urllib.request
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
NEV = ROOT / "data" / "rangering" / "norden" / "nevner"
AAR = range(2016, 2026)
UA = "NMBU-sammenligning (studierådgiverne HH)"

UKA = "UKÄ (statistik-api.uka.se, tabell 56 forskande och undervisande personal og 139 doktorander, heltidsekvivalenter)"
DKUNI = "Danske Universiteter, nøgletal C (VIP-årsværk, 1 924 timer)"
VIPUNEN = "Vipunen (opetus- ja tutkimushenkilökunta, henkilötyövuodet)"

# Per enhet: kvalitet, kort forklaring, kilde og hvilke tall (fil, mål, filter på nivå/kilde-URL) som er «med» og «uten».
# «med» kan være en sum av flere mål. None = finnes ikke.
REGLER = {
    "dk_cbs": dict(kvalitet="god", nivaa="Hele CBS", kilde=DKUNI,
                   med=[("danmark", "vip", "dkuni")], uten=[("danmark", "vip_uten_phd", None)],
                   forklaring="CBS er hele institusjonen. Uten stipendiater er regnet fra årsrapportens fordeling (ph.d.-årsverk trukket fra)."),
    "dk_aarhus": dict(kvalitet="middels", nivaa="Hele Aarhus BSS-fakultetet", kilde="AU i tal, tabell F1A (VIP-årsværk)",
                      med=[("danmark", "vip", "fakultet Aarhus BSS")], uten=[("danmark", "vip_uten_phd", None)],
                      forklaring="Hele fakultetet, også jus, psykologi og statskundskab. Artiklene er avgrenset til de samme fagene."),
    "dk_ku": dict(kvalitet="svak", nivaa="KU Det Samfundsvidenskabelige Fakultet uten jus", kilde="KUs økonominøgletal (VIP-årsværk)",
                  med=[("danmark", "vip", "fakultet SAMF")], uten=None,
                  forklaring="Hele samfunnsvitenskapelige fakultet uten jus, mens artiklene gjelder Økonomisk Institut. Raten blir for lav."),
    "dk_sdu": dict(kvalitet="svak", nivaa="SDU, hovedområde SAMF", kilde=DKUNI,
                   med=[("danmark", "vip", None)], uten=None,
                   forklaring="Hele det samfunnsvitenskapelige hovedområdet ved SDU (også jus og statskundskab). Øvre ramme for nevneren, så raten blir for lav."),
    "dk_aau": dict(kvalitet="svak", nivaa="AAU, hovedområde SAMF", kilde=DKUNI,
                   med=[("danmark", "vip", None)], uten=None,
                   forklaring="Hele det samfunnsvitenskapelige hovedområdet ved AAU. Øvre ramme for nevneren, så raten blir for lav."),
    "dk_ruc": dict(kvalitet="svak", nivaa="RUC, hovedområde SAMF", kilde=DKUNI,
                   med=[("danmark", "vip", None)], uten=None,
                   forklaring="Hele det samfunnsvitenskapelige hovedområdet ved RUC. Øvre ramme for nevneren, så raten blir for lav."),
    "se_sse": dict(kvalitet="god", nivaa="Hele SSE", kilde=UKA,
                   med=[("sverige", "forsk_underv", None), ("sverige", "doktorander", None)], uten=[("sverige", "forsk_underv", None)],
                   forklaring="SSE er hele institusjonen; UKÄ-faggruppen dekker praktisk talt hele skolen. Svenske doktorander er ofte på stipend, ikke ansatt."),
    "se_gu": dict(kvalitet="middels", nivaa="Handelshögskolan vid GU (rekonstruert)", kilde=UKA,
                  med=[("sverige", "forsk_underv_hh_rekonstruert_med_jus", None), ("sverige", "doktorander_hh_rekonstruert_med_jus", None)],
                  uten=[("sverige", "forsk_underv_hh_rekonstruert_med_jus", None)],
                  forklaring="UKÄ-faggruppene Ekonomi och näringsliv + Juridik + Social och ekonomisk geografi ved GU, som treffer fakultetets egne personaltall innen ±5 % (2020–2025)."),
}
for _id, _navn in [("se_lund", "Lunds universitet"), ("se_jibs", "Jönköping University"), ("se_umea", "Umeå universitet"),
                   ("se_orebro", "Örebro universitet"), ("se_lnu", "Linnéuniversitetet"), ("se_karlstad", "Karlstads universitet"),
                   ("se_su", "Stockholms universitet"), ("se_uu", "Uppsala universitet"), ("se_liu", "Linköpings universitet")]:
    REGLER[_id] = dict(kvalitet="svak", nivaa=f"{_navn}, UKÄ-faggruppen Ekonomi och näringsliv", kilde=UKA,
                       med=[("sverige", "forsk_underv", None), ("sverige", "doktorander", None)], uten=[("sverige", "forsk_underv", None)],
                       forklaring="Faggruppen for hele lärosätet, ikke skolen. Statistikk, informatikk og økonomisk historie er kodet i andre faggrupper, så nevneren er ofte for lav og raten for høy.")
REGLER["se_lund"]["forklaring"] += " LUSEM oppgir selv 171,8 faglige årsverk (2025/26) mot 135 i faggruppen."

# Finland: Vipunen per universitet og fagfelt (511 samfunnsøkonomi, 512 forretningsøkonomi), samme avgrensning som artiklene
FI = {"fi_aalto": "Aalto-yliopisto", "fi_hanken": "Svenska handelshögskolan", "fi_vaasa": "Vaasan yliopisto",
      "fi_uef": "Itä-Suomen yliopisto", "fi_helsinki": "Helsingin yliopisto", "fi_lut": "Lappeenrannan-Lahden teknillinen yliopisto LUT",
      "fi_turku": "Turun yliopisto", "fi_oulu": "Oulun yliopisto", "fi_jyvaskyla": "Jyväskylän yliopisto",
      "fi_tampere": "Tampereen yliopisto", "fi_abo": "Åbo Akademi"}
FI_FAG = {"fi_helsinki": ("511",)}  # Helsingfors: bare samfunnsøkonomi, som artiklene (OpenAlex-felt 20)
FI_BRUDD = {("fi_vaasa", 2022): "rapporteringsbrudd i Vipunen"}


def tall(x):
    try:
        return float(str(x).replace(",", ".").replace(" ", ""))
    except ValueError:
        return None


def les_csv(navn):
    with open(NEV / f"{navn}.csv", encoding="utf-8") as f:
        return list(csv.DictReader(f, delimiter=";"))


def hent_vipunen():
    url = "https://api.vipunen.fi/api/resources/henkilosto/data"
    filt = "tilastovuosi>=2016;kooditTieteenala=in=(511,512)"
    agg = defaultdict(float)
    off = 0
    while True:
        q = "filter=" + filt.replace(">=", "%3E%3D") + f"&limit=5000&offset={off}"
        req = urllib.request.Request(f"{url}?{q}", headers={"User-Agent": UA})
        rader = json.load(urllib.request.urlopen(req, timeout=120))
        for r in rader:
            if r.get("tehtäväjaottelu") != "Opetus- ja tutkimushenkilökunta" or not r.get("yliopisto"):
                continue
            trinn = (r.get("tutkijanuravaiheTaiTuntiopettajuus") or "").split(" ")[0]
            if trinn not in ("I", "II", "III", "IV"):
                continue
            agg[(r["yliopisto"], int(r["tilastovuosi"]), str(r["kooditTieteenala"]), trinn)] += float(r.get("henkilotyovuosi") or 0)
        print(f"  Vipunen: {off + len(rader)} rader")
        if len(rader) < 5000:
            break
        off += 5000
        time.sleep(1)
    ut = [{"yliopisto": u, "aar": y, "tieteenala": t, "trinn": tr, "arsverk": round(v, 2)} for (u, y, t, tr), v in sorted(agg.items())]
    (NEV / "vipunen-aggregat.json").write_text(json.dumps({"hentet": dt.date.today().isoformat(), "kilde": url + "?filter=" + filt,
                                                            "rader": ut}, ensure_ascii=False, indent=1), encoding="utf-8")
    return ut


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vipunen", action="store_true", help="hent Vipunen på nytt")
    a = ap.parse_args()

    kilder = {"sverige": les_csv("sverige"), "danmark": les_csv("danmark")}
    felles = les_csv("felles")

    def verdi(enhet, fil, maal, filt, aar):
        kand = [r for r in kilder[fil] if r["enhet"] == enhet and r["maal"] == maal and r["aar"] == str(aar)
                and r["enhet_type"] == "arsverk"
                and (filt is None or filt in r["nivaa"] or filt in r["kilde_url"])]
        v = [tall(r["verdi"]) for r in kand if tall(r["verdi"]) is not None]
        return v[0] if v else None

    ut = {}
    for enhet, rg in REGLER.items():
        per = {}
        for y in AAR:
            med = [verdi(enhet, f, m, flt, y) for f, m, flt in rg["med"]]
            uten = [verdi(enhet, f, m, flt, y) for f, m, flt in rg["uten"]] if rg["uten"] else [None]
            per[str(y)] = {"med": round(sum(med), 1) if all(x is not None for x in med) else None,
                           "uten": round(sum(uten), 1) if all(x is not None for x in uten) else None}
        ut[enhet] = {k: rg[k] for k in ("kvalitet", "nivaa", "kilde", "forklaring")} | {"aar": per}

    vip = json.loads((NEV / "vipunen-aggregat.json").read_text(encoding="utf-8"))["rader"] \
        if (NEV / "vipunen-aggregat.json").exists() and not a.vipunen else hent_vipunen()
    for enhet, uni in FI.items():
        fag = FI_FAG.get(enhet, ("511", "512"))
        per = {}
        for y in AAR:
            rader = [r for r in vip if r["yliopisto"] == uni and r["aar"] == y and r["tieteenala"] in fag]
            if not rader or (enhet, y) in FI_BRUDD:
                per[str(y)] = {"med": None, "uten": None}
                continue
            per[str(y)] = {"med": round(sum(r["arsverk"] for r in rader), 1),
                           "uten": round(sum(r["arsverk"] for r in rader if r["trinn"] != "I"), 1)}
        hanken = enhet == "fi_hanken"
        ut[enhet] = {"kvalitet": "god" if hanken else "middels",
                     "nivaa": "Hele Hanken" if hanken else f"{uni}, fagfelt {' + '.join(fag)}",
                     "kilde": VIPUNEN,
                     "forklaring": ("Hanken er hele institusjonen (fagfelt 511 + 512 i Vipunen). " if hanken else
                                    "Fagfeltet for hele universitetet, samme avgrensning som artiklene (fagfelt, ikke organisasjonsenhet). ")
                                   + "Med = karrieretrinn I–IV, uten = II–IV."
                                   + "".join(f" {y}: {t}." for (e, y), t in FI_BRUDD.items() if e == enhet),
                     "aar": per}

    # ETER-årsverk for hele institusjonen som kontroll der enheten er hele institusjonen
    for enhet in ("dk_cbs", "se_sse", "fi_hanken"):
        e = {r["aar"]: tall(r["verdi"]) for r in felles if r["enhet"] == enhet and r["maal"] == "eter_acad_fte"}
        ut[enhet]["eter"] = {y: v for y, v in sorted(e.items()) if v is not None}

    mangler = [(e, y) for e, v in ut.items() for y, t in v["aar"].items() if t["med"] is None]
    (NEV / "nevner.json").write_text(json.dumps({
        "generert": dt.date.today().isoformat(),
        "merknad": "Valgt nevner per nordisk enhet og år (scripts/rangering/lag_nevner_norden.py). med ≈ UN1 + stipendiater + postdoktorer, uten ≈ uten stipendiater/doktorander.",
        "enheter": ut}, ensure_ascii=False, indent=1), encoding="utf-8")
    for e, v in ut.items():
        rad = " ".join(f"{t['med'] if t['med'] is not None else '–':>6}" for t in v["aar"].values())
        print(f"{e:13} {v['kvalitet']:8} {rad}")
    print(f"Skrev {NEV / 'nevner.json'} ({len(ut)} enheter, {len(mangler)} enhet-år uten nevner).")


if __name__ == "__main__":
    sys.exit(main())
