#!/usr/bin/env python3
"""Søkbar tekst fra styrepapirene i markedsstatus → kilde/public/markedsstatus/<fakultet>/tekst.json (lastes lat)

Henter teksten side for side fra PDF-ene i data/<fakultet>/pdf/ (samme filer som vises i markedsstatus) og deler hver
side i utdrag på om lag 1 200 tegn. Nettsiden søker i utdragene (BM25 i nettleseren) og viser dokument og sidetall, med
lenke rett til siden i PDF-en. KI-svaret (Mistral) får bare de beste utdragene, aldri hele dokumentene.
Styrepapirene er offentlige dokumenter; teksten publiseres bare som søkegrunnlag med lenke til originalen.

Bruk: python3 scripts/build-markedsstatus-tekst.py [fakultet ...]
"""
import collections
import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
FAKULTETER = ["hh", "landsam", "realtek", "biovit", "kbm", "mina", "vet"]
MAKS = 1200


def rens(t: str) -> str:
    t = t.replace("\u00ad", "").replace("\ufb01", "fi").replace("\ufb02", "fl").replace("\ufb00", "ff").replace("\ufb03", "ffi").replace("\ufb04", "ffl")
    t = t.replace("\u019f", "ti").replace("\u01a9", "tt").replace("\u01ab", "ft")  # Calibri-ligaturer som pypdf gir som Ɵ/Ʃ/ƫ
    t = re.sub(r"-\n(?=[a-zæøå])", "", t)          # orddeling over linjeskift
    t = re.sub(r"[ \t ]+", " ", t)
    t = re.sub(r"\s*\n\s*", "\n", t)
    return t.strip()


def del_opp(t: str):
    if len(t) <= MAKS:
        return [t] if t else []
    biter, cur = [], ""
    for avsnitt in re.split(r"\n(?=\S)", t):
        if len(cur) + len(avsnitt) > MAKS and cur:
            biter.append(cur.strip()); cur = cur[-150:]  # litt overlapp
        cur += "\n" + avsnitt
        while len(cur) > MAKS * 1.6:
            biter.append(cur[:MAKS].strip()); cur = cur[MAKS - 150:]
    if cur.strip():
        biter.append(cur.strip())
    return biter


def bygg(fak: str):
    ms = ROOT / "data" / fak / "markedsstatus.json"
    if not ms.exists():
        return
    d = json.load(open(ms, encoding="utf-8"))
    docs, chunks, sider, tomme = [], [], 0, []
    for inst in d["institusjoner"]:
        for dok in inst.get("dokumenter", []):
            fn = dok.get("filnavn")
            p = ROOT / "data" / fak / "pdf" / fn if fn else None
            if not p or not p.exists():
                continue
            try:
                r = PdfReader(str(p))
            except Exception as e:
                print(f"  kunne ikke lese {fn}: {e}"); continue
            # Topp- og bunntekster (linjer som går igjen på mange sider i dokumentet) fjernes, ellers dominerer de søket
            sidetekst = []
            for page in r.pages:
                try:
                    sidetekst.append(rens(page.extract_text() or ""))
                except Exception:
                    sidetekst.append("")
            norm = lambda l: re.sub(r"\d+", "#", l.strip().lower())
            teller = collections.Counter(n for t in sidetekst for n in {norm(l) for l in t.split("\n") if l.strip()})
            grense = max(3, int(0.3 * len(sidetekst)))
            gjentatt = {n for n, c in teller.items() if c >= grense and len(n) < 200}
            sidetekst = ["\n".join(l for l in t.split("\n") if norm(l) not in gjentatt) for t in sidetekst]
            di = len(docs)
            docs.append({"inst": inst["name"], "label": dok["label"], "dato": dok.get("dato"), "fil": f"/markedsstatus/{fak}/{fn}"})
            tekst_i_dok = 0
            for side, t in enumerate(sidetekst, start=1):
                sider += 1
                for b in del_opp(t):
                    if len(b) >= 40:
                        chunks.append([di, side, b]); tekst_i_dok += len(b)
            if tekst_i_dok < 200:
                tomme.append(fn)
    ut = ROOT / "kilde" / "public" / "markedsstatus" / fak / "tekst.json"
    ut.parent.mkdir(parents=True, exist_ok=True)
    json.dump({"fakultet": fak, "hentet": d.get("hentet"), "docs": docs, "chunks": chunks}, open(ut, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{fak}: {len(docs)} dokumenter, {sider} sider, {len(chunks)} utdrag, {ut.stat().st_size // 1024} kB"
          + (f". Uten tekst (skannet?): {', '.join(tomme)}" if tomme else ""))


if __name__ == "__main__":
    for f in (sys.argv[1:] or FAKULTETER):
        bygg(f)
