#!/usr/bin/env python3
"""Interne emnetall fra FS (før DBH har publisert dem) → kryptert kilde/public/intern/emner-fs.json

Leser de håndførte, aggregerte tallene fra FS-rapporter i data/nmbu/kilder/fs-lokalt/*.json (gitignored; én fil per
emne og termin, se stat100-2026-var.json). Ingen personer: bare antall per studieprogram og karakterfordeling for hele
emnet. Program med færre enn MIN_N studenter med resultat (bestått + stryk) slås sammen til «Øvrige program», og
resten av emnet (programmene på de sidene av FS-rapporten som ikke er ført inn) legges i samme rad.

Krypteres som de andre interne sidene: AES-256-GCM, nøkkel fra PBKDF2-SHA256 (310 000 iterasjoner) av INTERN_PASSORD i
kilde/.env.local. Emnekodene (ikke tallene) skrives ukryptert til kilde/public/emner-fs-indeks.json, så appen vet hvor
låsen skal vises.
Vises i «Alle emner ved NMBU» etter opplåsing.

Bruk:
  python3 scripts/build-emner-fs-intern.py [--testpassord X]
"""
import argparse
import base64
import glob
import importlib.util
import json
import os
from pathlib import Path

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ROOT = Path(__file__).resolve().parent.parent
KILDE = ROOT / "data" / "nmbu" / "kilder" / "fs-lokalt"
OUT = ROOT / "kilde" / "public" / "intern" / "emner-fs.json"
# Ukryptert liste over emnekoder med FS-tall (bare kodene), så appen vet hvor låsen skal vises.
# Ligger utenfor intern/, der kildevakten krever ren kryptert konvolutt.
INDEKS = ROOT / "kilde" / "public" / "emner-fs-indeks.json"
ITER = 310_000
MIN_N = 3  # som DBH skjermer 1–2: program med færre studenter med resultat vises ikke for seg

spec = importlib.util.spec_from_file_location("oi", ROOT / "scripts" / "build-opptak-intern.py")
oi = importlib.util.module_from_spec(spec); spec.loader.exec_module(oi)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--testpassord", help="krypter med et kastepassord for lokal test (aldri commit resultatet)")
    a = ap.parse_args()

    emner = {}
    for f in sorted(glob.glob(str(KILDE / "*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        h = d["hele"]
        prog, ovrig = {}, {"eksMeldt": 0, "bestatt": 0, "stryk": 0, "ikkeMott": 0, "antall": 0}
        for pk, (eks, best, stryk, ikke, snitt) in d["programmer"].items():
            if best + stryk >= MIN_N:
                prog[pk] = {"eksMeldt": eks, "bestatt": best, "stryk": stryk, "ikkeMott": ikke, "snitt": snitt}
            else:
                for k, v in (("eksMeldt", eks), ("bestatt", best), ("stryk", stryk), ("ikkeMott", ikke)):
                    ovrig[k] += v
                ovrig["antall"] += 1
        # Programmene som ikke er ført inn (resten av FS-rapporten) = hele emnet minus summen av de innførte
        innf_b = sum(v[1] for v in d["programmer"].values()); innf_s = sum(v[2] for v in d["programmer"].values())
        ovrig["bestatt"] += h["bestatt"] - innf_b; ovrig["stryk"] += h["stryk"] - innf_s
        ovrig["ikkeFort"] = (h["bestatt"] - innf_b) + (h["stryk"] - innf_s) > 0
        emner.setdefault(d["emne"], []).append({"termin": d["termin"], "kilde": d["kilde"].split(" (")[0], "hele": h,
                                                 "programmer": prog, "ovrige": ovrig})
    ut = {"versjon": 1, "emner": emner}

    pw = a.testpassord or oi.passord()[0]
    salt, iv = os.urandom(16), os.urandom(12)
    key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITER).derive(pw.encode("utf-8"))
    ct = AESGCM(key).encrypt(iv, json.dumps(ut, ensure_ascii=False).encode("utf-8"), None)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    json.dump({"v": 1, "alg": "AES-256-GCM/PBKDF2-SHA256", "iter": ITER, "salt": base64.b64encode(salt).decode(),
               "iv": base64.b64encode(iv).decode(), "data": base64.b64encode(ct).decode()},
              open(OUT, "w", encoding="utf-8"))
    json.dump({"emner": sorted(emner)}, open(INDEKS, "w", encoding="utf-8"), ensure_ascii=False)
    print(f"{OUT.relative_to(ROOT)}: {', '.join(f'{k} ({len(v)} termin)' for k, v in emner.items())}"
          + (" – TESTPASSORD, ikke commit" if a.testpassord else ""))


if __name__ == "__main__":
    main()
