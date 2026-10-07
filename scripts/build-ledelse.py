#!/usr/bin/env python3
"""Styringstall for NMBU til inngangene «Økonomi og drift» og «Utdanning» → kilde/public/ledelse/nmbu.json

Kildefiler (håndregistrert fra offentlige PDF-er, se docs/ledelse-kilder.md):
  data/nmbu/ledelse/kilder.json        kildeliste: id, tittel, dato, url, fil (PDF i kilde/public/ledelse/kilder/)
  data/nmbu/ledelse/okonomi*.json      serier og tekst for «Økonomi og drift»
  data/nmbu/ledelse/utdanning*.json    serier og tekst for «Utdanning»

Hver punktverdi har kilde og fysisk PDF-side. I kildefilene kan et punkt også ha
  «raa»    teksten slik den står på siden (brukes av --kontroller, skrives ikke ut)
  «bilde»  true når tabellen er et bilde i PDF-en og tallet er lest visuelt (hoppes over av --kontroller)

Kilder:
  - NMBUs universitetsstyre, offentlige saksdokumenter på https://opengov.360online.com/Meetings/nmbu
    (tertialrapporter, årsplaner og rammer, opptaksrammer, orienteringer om opptak, utviklingsavtale, etatsstyring)
  - NMBUs årsrapporter med årsregnskap (https://www.nmbu.no/om/arsrapporter-nmbu)
  - Kunnskapsdepartementet: tildelingsbrev, utviklingsavtale og «Orientering om statsbudsjettet for universitet og
    høgskular» (regjeringen.no)

Validering (skrives som avvik, og skriptet avslutter med kode 1 ved feil):
  - hver punktverdi og hver tekst har en kilde som finnes i kilder.json, og side er et heltall ≥ 1 eller null
  - PDF-en til hver brukte kilde finnes i kilde/public/ledelse/kilder/ og er under 20 MB
  - side er ikke større enn antall sider i PDF-en (krever pypdf)
  - nivaa, type og periode har gyldige verdier, og ingen serie har to punkter med samme periode og type
  - --kontroller: «raa» finnes på oppgitt side i PDF-en (krever pypdf)

Bruk:
  python3 scripts/build-ledelse.py                 # bygg og valider
  python3 scripts/build-ledelse.py --kontroller    # også sjekk hvert tall mot PDF-teksten (pip install pypdf)
  python3 scripts/build-ledelse.py --hent          # last ned PDF-er som mangler i kilde/public/ledelse/kilder/
"""
import argparse
import json
import re
import ssl
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "nmbu" / "ledelse"
PUBLIC = ROOT / "kilde" / "public"
PDFDIR = PUBLIC / "ledelse" / "kilder"
OUT = PUBLIC / "ledelse" / "nmbu.json"

NIVAA = {"NMBU", "hh", "realtek", "landsam", "mina", "vet", "biovit", "kbm"}
TYPER = {"år", "tertial", "kvartal", "prognose", "budsjett", "mål"}
PERIODE = re.compile(r"^\d{4}(-T[1-3]|-Q[1-4])?$")
MAKS_PDF = 20 * 1024 * 1024
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"

avvik = []   # feil som stopper bygget
merk = []    # advarsler


def feil(msg):
    avvik.append(msg)


def les(p):
    return json.loads(p.read_text(encoding="utf-8"))


def hent_pdf(k):
    mål = PDFDIR / k["fil"]
    ctx = ssl.create_default_context(cafile="/etc/ssl/cert.pem") if Path("/etc/ssl/cert.pem").exists() else None
    req = urllib.request.Request(k["url"], headers={"User-Agent": UA})
    data = urllib.request.urlopen(req, context=ctx, timeout=120).read()
    if not data.startswith(b"%PDF"):
        raise RuntimeError("svaret er ikke en PDF")
    mål.write_bytes(data)
    print(f"  hentet {k['fil']} ({len(data) / 1e6:.1f} MB)")


class Pdfer:
    """Leser sidetekst med pypdf ved behov (valgfritt)."""

    def __init__(self):
        try:
            from pypdf import PdfReader  # noqa: F401
            self.ok = True
        except ImportError:
            self.ok = False
        self.cache = {}

    def sider(self, fil):
        if fil not in self.cache:
            from pypdf import PdfReader
            r = PdfReader(str(PDFDIR / fil))
            self.cache[fil] = [None] * len(r.pages)
            self.cache[fil + "#r"] = r
        return self.cache[fil]

    def tekst(self, fil, side):
        s = self.sider(fil)
        if s[side - 1] is None:
            t = self.cache[fil + "#r"].pages[side - 1].extract_text() or ""
            s[side - 1] = norm(t)
        return s[side - 1]


def norm(t):
    t = t.replace(" ", " ").replace("−", "-").replace("–", "-").replace(" ", " ")
    return re.sub(r"\s+", " ", t)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kontroller", action="store_true", help="sjekk «raa» mot sideteksten i PDF-en")
    ap.add_argument("--hent", action="store_true", help="last ned PDF-er som mangler")
    a = ap.parse_args()

    kfil = les(DATA / "kilder.json")
    kilder = {k["id"]: k for k in kfil["kilder"]}
    if len(kilder) != len(kfil["kilder"]):
        feil("kilder.json har duplikate id-er")

    PDFDIR.mkdir(parents=True, exist_ok=True)
    if a.hent:
        for k in kfil["kilder"]:
            if k.get("fil") and not (PDFDIR / k["fil"]).exists():
                try:
                    hent_pdf(k)
                except Exception as e:  # noqa: BLE001
                    feil(f"kunne ikke hente {k['id']}: {e}")

    pdf = Pdfer()
    if a.kontroller and not pdf.ok:
        print("pypdf mangler: pip install pypdf (i en venv) for --kontroller", file=sys.stderr)
        sys.exit(2)

    brukt = set()
    ut = {"hentet": kfil["hentet"], "kilder": [], "okonomi": {"serier": [], "tekst": []},
          "utdanning": {"serier": [], "tekst": []}}
    antall = {"punkter": 0, "kontrollert": 0, "bilde": 0}

    def sjekk_side(kid, side, hvor):
        if kid not in kilder:
            feil(f"{hvor}: ukjent kilde «{kid}»")
            return
        brukt.add(kid)
        if side is None:
            if kilder[kid].get("fil"):
                merk.append(f"{hvor}: side mangler for PDF-kilden {kid}")
            return
        if not isinstance(side, int) or side < 1:
            feil(f"{hvor}: ugyldig side {side!r}")
            return
        fil = kilder[kid].get("fil")
        if fil and pdf.ok and (PDFDIR / fil).exists():
            n = len(pdf.sider(fil))
            if side > n:
                feil(f"{hvor}: side {side} finnes ikke ({fil} har {n} sider)")

    for inngang in ("okonomi", "utdanning"):
        filer = sorted(DATA.glob(f"{inngang}*.json"))
        if not filer:
            feil(f"ingen kildefiler for {inngang}")
        ider = set()
        for f in filer:
            d = les(f)
            for s in d.get("serier", []):
                navn = f"{f.name}:{s.get('id')}/{s.get('nivaa')}"
                for felt in ("id", "navn", "enhet", "nivaa", "punkter"):
                    if felt not in s:
                        feil(f"{navn}: mangler {felt}")
                if s.get("nivaa") not in NIVAA:
                    feil(f"{navn}: ugyldig nivaa {s.get('nivaa')!r}")
                nøkkel = (s.get("id"), s.get("nivaa"))
                if nøkkel in ider:
                    feil(f"{navn}: serien finnes to ganger")
                ider.add(nøkkel)
                sett = set()
                punkter = []
                for p in s.get("punkter", []):
                    hvor = f"{navn} {p.get('periode')}/{p.get('type')}"
                    antall["punkter"] += 1
                    if not PERIODE.match(str(p.get("periode", ""))):
                        feil(f"{hvor}: ugyldig periode")
                    if p.get("type") not in TYPER:
                        feil(f"{hvor}: ugyldig type")
                    if not isinstance(p.get("verdi"), (int, float)) or isinstance(p.get("verdi"), bool):
                        feil(f"{hvor}: verdi er ikke et tall")
                    if (p.get("periode"), p.get("type")) in sett:
                        feil(f"{hvor}: dobbelt punkt")
                    sett.add((p.get("periode"), p.get("type")))
                    sjekk_side(p.get("kilde"), p.get("side"), hvor)
                    if a.kontroller and p.get("kilde") in kilder and p.get("side"):
                        if p.get("bilde"):
                            antall["bilde"] += 1
                        elif "raa" not in p:
                            merk.append(f"{hvor}: mangler «raa», ikke kontrollert")
                        else:
                            fil = kilder[p["kilde"]]["fil"]
                            if (PDFDIR / fil).exists():
                                if norm(p["raa"]) in pdf.tekst(fil, p["side"]):
                                    antall["kontrollert"] += 1
                                else:
                                    feil(f"{hvor}: «{p['raa']}» finnes ikke på side {p['side']} i {fil}")
                    punkter.append({k: p[k] for k in ("periode", "type", "verdi", "kilde", "side")})
                rekkefølge = ["år", "tertial", "kvartal", "prognose", "budsjett", "mål"]
                punkter.sort(key=lambda p: (p["periode"], rekkefølge.index(p["type"]) if p["type"] in rekkefølge else 9))
                ut[inngang]["serier"].append({"id": s["id"], "navn": s["navn"], "enhet": s["enhet"],
                                              "nivaa": s["nivaa"], "punkter": punkter})
            for t in d.get("tekst", []):
                hvor = f"{f.name}: tekst «{t.get('tittel')}»"
                if not t.get("kilder"):
                    feil(f"{hvor}: mangler kilder")
                for k in t.get("kilder", []):
                    sjekk_side(k.get("kilde"), k.get("side"), hvor)
                ord_ = len(t.get("tekst", "").split())
                if ord_ > 120:
                    merk.append(f"{hvor}: lang tekst ({ord_} ord)")
                ut[inngang]["tekst"].append({"tittel": t["tittel"], "tekst": t["tekst"],
                                             "kilder": [{"kilde": k["kilde"], "side": k.get("side")} for k in t["kilder"]]})

    # Statsbudsjettet (data/nmbu/ledelse/statsbudsjett-<år>.json): nyeste år skrives som «statsbudsjett». Alle objekter
    # med «kilde» (og «kilde2025» o.l.) sjekkes mot kildelista og sidetallet i PDF-en, som for seriene.
    def gaa(x, hvor):
        if isinstance(x, dict):
            for k, v in x.items():
                if k.startswith("kilde") and k != "kilder" and isinstance(v, str):
                    sjekk_side(v, x.get("side" + k[len("kilde"):]), hvor)
                gaa(v, f"{hvor}/{k}")
        elif isinstance(x, list):
            for i, v in enumerate(x):
                gaa(v, f"{hvor}[{i}]")
    sb = sorted(DATA.glob("statsbudsjett-*.json"))
    if sb:
        d = les(sb[-1])
        d.pop("_merknad", None)
        gaa(d, sb[-1].name)
        ut["statsbudsjett"] = d

    total = 0
    for kid in sorted(brukt, key=lambda x: list(kilder).index(x)):
        k = kilder[kid]
        fil = k.get("fil")
        if fil:
            p = PDFDIR / fil
            if not p.exists():
                feil(f"PDF mangler for {kid}: {p.relative_to(ROOT)} (kjør med --hent)")
            else:
                st = p.stat().st_size
                total += st
                if st > MAKS_PDF:
                    feil(f"{fil} er {st / 1e6:.1f} MB (maks 20 MB)")
                if p.read_bytes()[:4] != b"%PDF":
                    feil(f"{fil} er ikke en PDF")
        ut["kilder"].append({"id": kid, "tittel": k["tittel"], "dato": k.get("dato"), "url": k["url"],
                             "pdf": f"ledelse/kilder/{fil}" if fil else None})
    for kid in kilder:
        if kid not in brukt:
            merk.append(f"kilden {kid} er ikke brukt")
    for p in PDFDIR.glob("*.pdf"):
        if p.name not in {k.get("fil") for k in kilder.values()}:
            merk.append(f"{p.name} ligger i kilder/ men står ikke i kilder.json")

    OUT.write_text(json.dumps(ut, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    ns = {i: len(ut[i]["serier"]) for i in ("okonomi", "utdanning")}
    print(f"Skrev {OUT.relative_to(ROOT)}: {len(ut['kilder'])} kilder ({total / 1e6:.1f} MB PDF), "
          f"økonomi {ns['okonomi']} serier/{len(ut['okonomi']['tekst'])} tekster, "
          f"utdanning {ns['utdanning']} serier/{len(ut['utdanning']['tekst'])} tekster, {antall['punkter']} punkter")
    if a.kontroller:
        print(f"Kontroll mot PDF-tekst: {antall['kontrollert']} funnet, {antall['bilde']} lest fra bilde (ikke kontrollert)")
    for m in merk:
        print("  merk:", m)
    for f in avvik:
        print("  AVVIK:", f)
    sys.exit(1 if avvik else 0)


if __name__ == "__main__":
    main()
