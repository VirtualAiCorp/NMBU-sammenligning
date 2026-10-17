"""Kobler Samordna-studiekoder til DBH-programkoder ved å sammenligne tall, ikke navn.

Metode: for hvert Samordna-program og år 2021–2025 letes det i DBH 379 (opptakstype N = Samordna, prioritet 1)
ved samme institusjon etter programkoder med samme antall førstevalgssøkere (avvik ≤ max(2, 3 %)). «Alle søkere»
brukes som kontroll. Der én DBH-kode dekker flere studiesteder, prøves summer av 2–3 Samordna-program med
navnelikhet. Resultat: ../kilder/kobling_so_dbh.json med bevis per år.
"""
import itertools
import json
import os
from collections import defaultdict

from felles import (AAR_DBH, KILDER, SO_INST, les_347, les_379, les_katalog, les_so_sokertall, norm)
from utvalg import EKSTRA, utvalg

STOPP = {"og", "i", "med", "for", "of", "and", "in", "the", "bachelor", "deltid", "nettbasert", "master", "årsstudium"}


def tok(s):
    return set(norm(s).split()) - STOPP


def okonomi_dbh(rad):
    nus = rad.get("NUS-kode") or ""
    return rad.get("Studiumkode") == "ØA" or nus[:2] in ("64", "74") or nus[:3] in ("634", "734")


# Navnet i DBH er et annet enn hos Samordna; koblingen bygger bare på tallene (førstevalg likt alle år 2021–2025).
MANUELL = {("223452", "OFFBV")}


def naer(a, b):
    return a is not None and b is not None and abs(a - b) <= max(2, 0.03 * max(a, b))


def main():
    so = les_so_sokertall()
    kat = les_katalog()
    r347 = les_347()
    r379 = les_379()
    valgt = {k: v for k, v in utvalg(so, kat).items() if v["niva"] != "årsstudium"}
    # DBH N-tall per institusjon og år
    dbh_n = defaultdict(dict)  # (inst, år) -> {kode: {fv, alle}}
    for (inst, kode), aar in r379.items():
        for y, typer in aar.items():
            n = typer.get("N")
            if n and n.get("fv", 0) + n.get("alle", 0) > 0:
                dbh_n[(inst, y)][kode] = n
    kobling = {}
    brukt = defaultdict(lambda: defaultdict(list))  # (inst, år, kode) -> [so-koder]
    for k, v in valgt.items():
        insts = SO_INST.get(k[:3], [])
        fv = so[k]["maal"].get("Førstevalgssøkere", {})
        alle = so[k]["maal"].get("Alle søkere", {})
        bevis = []
        for y in AAR_DBH:
            if not fv.get(y):
                continue
            treff = []
            tk = tok(" ".join(so[k]["navn"]))
            for inst in insts:
                for kode, n in dbh_n.get((inst, y), {}).items():
                    rad = r347.get((inst, kode), {}).get("rad", {})
                    likhet = len(tk & tok(rad.get("Studieprogramnavn", "")))
                    if (k, kode) not in MANUELL and (likhet < 1 or not (okonomi_dbh(rad) or k in EKSTRA or likhet >= 2)):
                        continue
                    if naer(n.get("fv"), fv[y]):
                        treff.append((inst, kode, n.get("fv"), n.get("alle"), naer(n.get("alle"), alle.get(y)), likhet))
            # foretrekk treff som også stemmer på alle søkere, deretter størst navnelikhet
            sikre = [t for t in treff if t[4]]
            if len(sikre) >= 1:
                treff = sikre
            if len(treff) > 1:
                best = max(t[5] for t in treff)
                treff = [t for t in treff if t[5] == best]
            if len(treff) == 1:
                inst, kode, a, b, ok, _ = treff[0]
                bevis.append({"aar": y, "inst": inst, "kode": kode, "fv_so": fv[y], "fv_dbh": a, "alle_so": alle.get(y),
                              "alle_dbh": b, "alle_stemmer": ok, "metode": "eksakt"})
                brukt[(inst, y)][kode].append(k)
            elif len(treff) > 1:
                bevis.append({"aar": y, "flertydig": [(t[0], t[1]) for t in treff], "fv_so": fv[y], "metode": "flertydig"})
        kobling[k] = {"bevis": bevis}
    # Summer: DBH-koder uten eksakt treff (eller der flere SO-program deler kode)
    for (inst, y), koder in dbh_n.items():
        for kode, n in koder.items():
            if kode in brukt[(inst, y)]:
                continue
            kand = [k for k in valgt if inst in SO_INST.get(k[:3], []) and so[k]["maal"].get("Førstevalgssøkere", {}).get(y)
                    and not any(b.get("aar") == y and b.get("metode") == "eksakt" for b in kobling[k]["bevis"])]
            rad = r347.get((inst, kode), {}).get("rad", {})
            navn_dbh = tok(rad.get("Studieprogramnavn", ""))
            minst = 1 if okonomi_dbh(rad) else 2
            kand = [k for k in kand if len(navn_dbh & tok(so[k]["navn"][0])) >= minst]
            if len(kand) > 12:
                continue
            beste = None
            for r in range(2, min(6, len(kand)) + 1):
                for combo in itertools.combinations(kand, r):
                    s = sum(so[k]["maal"]["Førstevalgssøkere"][y] for k in combo)
                    if not naer(n.get("fv"), s):
                        continue
                    diff = abs(s - n.get("fv"))
                    if beste is None or (diff, -len(combo)) < (beste[0], -len(beste[1])):
                        beste = (diff, combo, s)
            if beste:
                _, combo, s = beste
                sa = sum(so[k]["maal"].get("Alle søkere", {}).get(y, 0) for k in combo)
                for k in combo:
                    kobling[k]["bevis"].append({"aar": y, "inst": inst, "kode": kode, "fv_so_sum": s, "fv_dbh": n.get("fv"),
                                                "alle_so_sum": sa, "alle_dbh": n.get("alle"), "deler_med": [c for c in combo if c != k],
                                                "metode": "sum"})
                    brukt[(inst, y)][kode].append(k)
    # Oppsummer per SO-kode
    for k, v in kobling.items():
        koder = defaultdict(list)
        for b in v["bevis"]:
            if "kode" in b:
                koder[(b["inst"], b["kode"])].append(b["aar"])
        v["dbh"] = [{"inst": i, "kode": c, "aar": sorted(a)} for (i, c), a in sorted(koder.items(), key=lambda kv: min(kv[1]))]
        aar_med_fv = [y for y in AAR_DBH if so[k]["maal"].get("Førstevalgssøkere", {}).get(y)]
        dekket = sorted({b["aar"] for b in v["bevis"] if "kode" in b})
        v["aar_med_soekere"] = aar_med_fv
        v["aar_koblet"] = dekket
    json.dump(kobling, open(os.path.join(KILDER, "kobling_so_dbh.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    ok = sum(1 for v in kobling.values() if v["dbh"])
    full = sum(1 for v in kobling.values() if v["aar_med_soekere"] and set(v["aar_med_soekere"]) <= set(v["aar_koblet"]))
    print(f"{len(kobling)} SO-program, {ok} med minst én DBH-kode, {full} koblet alle år 2021–2025")
    for k, v in sorted(kobling.items()):
        if set(v["aar_med_soekere"]) - set(v["aar_koblet"]):
            print("  mangler", k, so[k]["navn"][0][:50], "mangler år", sorted(set(v["aar_med_soekere"]) - set(v["aar_koblet"])), "har", [(d["kode"], d["aar"]) for d in v["dbh"]],
                  [b.get("flertydig") for b in v["bevis"] if b.get("flertydig")][:1])


if __name__ == "__main__":
    main()
