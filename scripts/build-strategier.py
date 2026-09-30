#!/usr/bin/env python3
"""Strategigjennomgangen for markedsstatus → kilde/public/markedsstatus/<fakultet>/strategier.json

Leser data/<fakultet>/strategier/<institusjon>.json (én fil per institusjon, research med kildelenker) og
data/<fakultet>/strategier/_syntese.json (funn på tvers: går igjen, skiller seg ut, aktuelt for fakultetet),
kontrollerer temaer, kildehenvisninger og sitatlengde, og skriver én fil som StrategierMot2030.tsx laster.
Rekkefølgen på institusjonene følger data/<fakultet>/markedsstatus.json.

Kilder som er PDF-er har feltet «pdf» (sti relativt til kilde/public/markedsstatus/<fakultet>/). Skriptet sjekker at fila
finnes, og at sidetall («side» på satsinger og mål, «sider» i syntesens «kilder») er fysiske sidetall i PDF-en: positive
heltall eller strenger som «5–6», og ikke større enn antall sider.

Bruk: python3 scripts/build-strategier.py [fakultet]   (standard: hh)
"""
import json
import re
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMAER = ["Bærekraft", "Digitalisering og KI", "Internasjonalisering", "Akkreditering og rangering", "Samspill med arbeidslivet",
          "Livslang læring og EVU", "Forskning", "Studiekvalitet og læringsmiljø", "Regional rolle", "Rekruttering og studietilbud",
          "Teknologi og tverrfaglighet", "Innovasjon og entreprenørskap", "Økonomi og ressurser", "Campus og infrastruktur",
          "Mangfold og likestilling", "Annet"]
# Markedsstatus-id → strategifil-id der de avviker
ALIAS = {"hiø": "hiof", "hiof": "hiof"}
# Korte navn i tabeller og merkelapper
KORTNAVN = {"hiof": "HiØ", "kristiania": "Kristiania"}


def antall_sider(sti):
    """Antall sider i en PDF uten eksterne pakker: /Root → /Pages → /Count (tåler objektstrømmer og inkrementelle oppdateringer)."""
    data = sti.read_bytes()
    obj = {}
    for m in re.finditer(rb'(?<![\d])(\d+)\s+\d+\s+obj\b(.*?)endobj', data, re.S):
        obj[int(m.group(1))] = m.group(2)
    for kropp in list(obj.values()):
        if not re.search(rb'/Type\s*/ObjStm', kropp):
            continue
        try:
            s = re.search(rb'stream\r?\n', kropp)
            ut = zlib.decompress(kropp[s.end():kropp.rfind(b'endstream')])
            antall = int(re.search(rb'/N\s+(\d+)', kropp).group(1))
            forst = int(re.search(rb'/First\s+(\d+)', kropp).group(1))
        except Exception:
            continue
        tall = list(map(int, ut[:forst].split()))[:2 * antall]
        par = list(zip(tall[0::2], tall[1::2]))
        for i, (nr, off) in enumerate(par):
            slutt = forst + par[i + 1][1] if i + 1 < len(par) else len(ut)
            obj.setdefault(nr, ut[forst + off:slutt])
    rot = re.findall(rb'/Root\s+(\d+)\s+\d+\s+R', data)
    kat = obj.get(int(rot[-1]), b'') if rot else b''
    p = re.search(rb'/Pages\s+(\d+)\s+\d+\s+R', kat)
    c = re.search(rb'/Count\s+(\d+)', obj.get(int(p.group(1)), b'')) if p else None
    return int(c.group(1)) if c else None


def sidefeil(side, maks):
    """Tom streng hvis «side» er gyldig: positivt heltall eller «a–b» (a ≤ b), og ikke over maks når maks er kjent."""
    if isinstance(side, bool) or not isinstance(side, (int, str)):
        return f"ugyldig sidetall {side!r}"
    if isinstance(side, int):
        fra = til = side
    else:
        m = re.fullmatch(r"\s*(\d+)\s*(?:[–-]\s*(\d+))?\s*", side)
        if not m:
            return f"ugyldig sidetall {side!r}"
        fra, til = int(m.group(1)), int(m.group(2) or m.group(1))
    if fra < 1 or til < fra:
        return f"ugyldig sidetall {side!r}"
    if maks and til > maks:
        return f"side {side} finnes ikke (PDF-en har {maks} sider)"
    return ""


def main():
    fak = sys.argv[1] if len(sys.argv) > 1 else "hh"
    mappe = ROOT / "data" / fak / "strategier"
    rekke = [ALIAS.get(i["id"].lower(), i["id"].lower()) for i in json.load(open(ROOT / "data" / fak / "markedsstatus.json", encoding="utf-8"))["institusjoner"]]
    filer = {p.stem: json.load(open(p, encoding="utf-8")) for p in sorted(mappe.glob("*.json")) if not p.stem.startswith("_")}
    pdfmappe = ROOT / "kilde" / "public" / "markedsstatus" / fak
    inst, avvik = [], []
    sidetall = {}  # (institusjon, kildeindeks) → antall sider i lokal PDF (None hvis ukjent eller ingen PDF)
    for iid in sorted(filer, key=lambda x: rekke.index(x) if x in rekke else 99):
        d = filer[iid]
        d["navn"] = KORTNAVN.get(iid, d["navn"])
        n = len(d.get("strategier", []))
        for k, kilde in enumerate(d.get("strategier", [])):
            sidetall[(iid, k)] = None
            if kilde.get("pdf"):
                sti = pdfmappe / kilde["pdf"]
                if not sti.is_file():
                    avvik.append(f"{iid}: kilde {k} peker på {kilde['pdf']}, som ikke finnes")
                elif not sti.read_bytes()[:5].startswith(b"%PDF"):
                    avvik.append(f"{iid}: kilde {k}: {kilde['pdf']} er ikke en PDF")
                else:
                    sidetall[(iid, k)] = antall_sider(sti)
                    if not sidetall[(iid, k)]:
                        avvik.append(f"{iid}: kilde {k}: fant ikke sidetallet i {kilde['pdf']}")
        for s in d.get("satsinger", []):
            if s.get("tema") not in TEMAER:
                avvik.append(f"{iid}: ukjent tema «{s.get('tema')}» → Annet")
                s["tema"] = "Annet"
        for liste in (d.get("satsinger", []), d.get("maal", [])):
            for x in liste:
                if x.get("kilde") is not None and not (isinstance(x["kilde"], int) and 0 <= x["kilde"] < n):
                    avvik.append(f"{iid}: kilde {x.get('kilde')} finnes ikke")
                    x["kilde"] = None
                if x.get("side") is not None:
                    feil = sidefeil(x["side"], sidetall.get((iid, x.get("kilde"))))
                    if feil:
                        avvik.append(f"{iid}: «{x['tekst'][:40]}…»: {feil}")
        if d.get("sitat") and len(d["sitat"].get("tekst", "").split()) >= 15:
            avvik.append(f"{iid}: sitatet er 15 ord eller mer, tatt ut")
            d["sitat"] = None
        inst.append(d)
    syntese_p = mappe / "_syntese.json"
    syntese = json.load(open(syntese_p, encoding="utf-8")) if syntese_p.exists() else None
    if syntese:
        ids = {i["id"] for i in inst}
        antall_kilder = {i["id"]: len(i.get("strategier", [])) for i in inst}
        for x in syntese.get("skillerSeg", []):
            if x["inst"] not in ids:
                avvik.append(f"syntese: ukjent institusjon {x['inst']}")
        for del_ in ("gaarIgjen", "skillerSeg", "forHH"):
            for x in syntese.get(del_, []):
                navn = f"syntese {del_} «{x.get('tittel', '')[:40]}»"
                if not x.get("kilder"):
                    avvik.append(f"{navn}: mangler kilder")
                for kk in x.get("kilder", []):
                    iid, k = kk.get("inst"), kk.get("kilde")
                    if iid not in ids:
                        avvik.append(f"{navn}: ukjent institusjon {iid}")
                        continue
                    if not (isinstance(k, int) and not isinstance(k, bool) and 0 <= k < antall_kilder[iid]):
                        avvik.append(f"{navn}: {iid} har ingen kilde {k}")
                        continue
                    if not isinstance(kk.get("sider", []), list):
                        avvik.append(f"{navn}: {iid} kilde {k}: «sider» skal være en liste")
                        continue
                    for side in kk.get("sider", []):
                        feil = sidefeil(side, sidetall.get((iid, k)))
                        if feil:
                            avvik.append(f"{navn}: {iid} kilde {k}: {feil}")
    hentet = max((i.get("hentet") or "" for i in inst), default="")
    ut = ROOT / "kilde" / "public" / "markedsstatus" / fak / "strategier.json"
    ut.parent.mkdir(parents=True, exist_ok=True)
    json.dump({"hentet": hentet, "temaer": TEMAER, "institusjoner": inst, "syntese": syntese}, open(ut, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{fak}: {len(inst)} institusjoner, {sum(len(i.get('satsinger', [])) for i in inst)} satsinger, "
          f"{sum(len(i.get('strategier', [])) for i in inst)} dokumenter → {ut.relative_to(ROOT)} ({ut.stat().st_size // 1024} kB)")
    for a in avvik:
        print("  !", a)


if __name__ == "__main__":
    main()
