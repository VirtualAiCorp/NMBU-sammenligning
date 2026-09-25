#!/usr/bin/env python3
"""Kunnskapsgrunnlag for KI-chatten → kilde/public/ki/ (lastes lat av chatten)

  <fakultet>-data.json  én tekstlinje per program og år med nøkkeltallene fra de genererte datafilene (opptak inkl.
                        supplering og DBH 571, gjennomføring per startkull, Studiebarometeret, engelsk undervisning og
                        innreisende). Chatten søker i linjene (BM25) og sender de mest relevante til modellen som [Dn].
  metode.json           metodedokumentasjonen (docs/status-og-metode.md) delt per avsnitt, uten interne/tekniske avsnitt.
Styrepapirene hentes fra kilde/public/markedsstatus/<fakultet>/tekst.json (build-markedsstatus-tekst.py).
Den interne opptaksanalysen (kryptert) er aldri med.

Bruk: python3 scripts/build-ki-grunnlag.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "kilde" / "src" / "app" / "data"
UT = ROOT / "kilde" / "public" / "ki"
FAKULTETER = {"hh": "Handelshøyskolen", "landsam": "Fakultet for landskap og samfunn", "realtek": "Fakultet for realfag og teknologi",
              "biovit": "Fakultet for biovitenskap", "kbm": "Fakultet for kjemi, bioteknologi og matvitenskap",
              "mina": "Fakultet for miljøvitenskap og naturforvaltning", "vet": "Veterinærhøgskolen"}
NIVAA = {"bachelor": "bachelor", "master5": "femårig master", "master2": "toårig master"}
# Metodeavsnitt som er relevante for brukerne (ikke arbeidsform, kommandoer, passord, intern analyse eller teknikk)
UTELAT = {"3", "4", "5", "6", "8", "9", "10", "16", "18", "19", "22", "24"}


def nf(v, d=0):
    if v is None:
        return "–"
    s = f"{v:,.{d}f}".replace(",", " ").replace(".", ",")
    return s


def pg(v):
    return "–" if v is None else ("alle kvalifiserte" if v == 0 else nf(v, 1))


def json_les(navn):
    p = DATA / navn
    return json.load(open(p, encoding="utf-8")) if p.exists() else None


def data_linjer(fak):
    adm = json_les(f"{fak}AdmissionData.json")
    comp = json_les(f"{fak}CompletionData.json")
    sb_p = ROOT / "data" / fak / "studiebarometer.json"
    sb = {e["entryId"]: e for e in json.load(open(sb_p, encoding="utf-8"))} if sb_p.exists() else {}
    intl_ts = (DATA / "internasjonalData.ts").read_text(encoding="utf-8")
    m = re.search(r"INTERNASJONAL: Record<string, Record<string, InternasjonalAar>> = (\{.*\});", intl_ts, re.S)
    intl = json.loads(m.group(1)) if m else {}
    kull = {p["entryId"]: p for g in (comp or {}).get("groups", []) for p in g["programs"]}
    linjer = []
    for g in (adm or {}).get("groups", []):
        for e in g["entries"]:
            navn = f"{g['label']} ({NIVAA.get(g['level'], g['level'])}) · {e['shortName']}{' (NMBU)' if e['id'] in g['nmbuIds'] else ''} · {e.get('institusjon', '')}, {e.get('studiested', '')}"
            deler = []
            for y in sorted(e["years"], reverse=True)[:3]:
                d = e["years"][y]
                ting = []
                if d.get("alleS") is not None: ting.append(f"{nf(d['alleS'])} søkere")
                if d.get("fvS") is not None: ting.append(f"{nf(d['fvS'])} førstevalgssøkere")
                if d.get("plasser"): ting.append(f"{nf(d['plasser'])} studieplasser")
                if d.get("kvalifiserte") is not None: ting.append(f"{nf(d['kvalifiserte'])} kvalifiserte")
                if d.get("tilbud") is not None: ting.append(f"{nf(d['tilbud'])} tilbud")
                if d.get("mott") is not None: ting.append(f"{nf(d['mott'])} møtt")
                if d.get("pg_ord") is not None or d.get("pg_fv") is not None:
                    ting.append(f"poenggrense hovedopptak ordinær {pg(d.get('pg_ord'))} / førstegangsvitnemål {pg(d.get('pg_fv'))}")
                if d.get("pgs_ord") is not None or d.get("pgs_fv") is not None:
                    ting.append(f"etter suppleringsopptaket ordinær {pg(d.get('pgs_ord'))} / førstegangsvitnemål {pg(d.get('pgs_fv'))}")
                if d.get("op_mott") is not None: ting.append(f"snitt opptakspoeng for de som møtte {nf(d['op_mott'], 1)}")
                if d.get("kp_mott") is not None and d.get("op_mott") is None: ting.append(f"snitt karakterpoeng for de som møtte {nf(d['kp_mott'], 1)} (lokalt opptak)")
                if d.get("kvinner") is not None: ting.append(f"{nf(d['kvinner'], 1)} % kvinner blant førstevalgssøkerne")
                if ting:
                    deler.append(f"{y}: " + ", ".join(ting))
            k = kull.get(e["id"])
            if k:
                siste = [x for x in k.get("kull", []) if x.get("startkull") and x.get("normertAar") and x["normertAar"] <= 2025]
                if siste:
                    x = siste[-1]
                    deler.append(f"gjennomføring startkull {x['aar']} ({x['startkull']} studenter): {nf(100 * x['fullfortNormert'] / x['startkull'], 1)} % fullført på normert tid, {nf(100 * x['frafalt'] / x['startkull'], 1)} % frafall")
                reg = [a for a in k.get("aar", []) if a.get("registrerte")]
                if reg:
                    deler.append(f"registrerte studenter {reg[-1]['aar']}: {nf(reg[-1]['registrerte'])}")
            s = sb.get(e["id"])
            if s and s.get("scores", {}).get("helhetsvurdering") is not None:
                deler.append(f"Studiebarometeret {s.get('latestYear')}: helhetsvurdering {nf(s['scores']['helhetsvurdering'], 1)} av 5 ({s.get('respondents')} svar)")
            i = intl.get(e["id"], {})
            iy = sorted(i)[-1] if i else None
            if iy and i[iy].get("eng") is not None:
                deler.append(f"{iy}: {nf(i[iy]['eng'], 1)} % av studiepoengene i emner på engelsk" + (f", {nf(i[iy]['inn'], 1)} % innreisende utvekslingsstudenter i emnene" if i[iy].get("inn") is not None else ""))
            if deler:
                # 4. felt: «n» = NMBUs program, «h» = hovedkonkurrent (valgt som standard i opptaksanalysen), «» = øvrige
                flagg = "n" if e["id"] in g["nmbuIds"] else ("h" if e["id"] in g["defaultIds"] else "")
                linjer.append([f"{g['label']} ({NIVAA.get(g['level'], g['level'])})", e["shortName"], f"{navn}. " + ". ".join(deler) + ".", flagg])
    return linjer


def metode():
    tekst = (ROOT / "docs" / "status-og-metode.md").read_text(encoding="utf-8")
    ut = []
    for blokk in re.split(r"\n(?=## )", tekst):
        m = re.match(r"## (\d+)\. (.+)", blokk)
        if not m or m.group(1) in UTELAT:
            continue
        tittel = f"§{m.group(1)} {m.group(2).strip()}"
        kropp = blokk.split("\n", 1)[1] if "\n" in blokk else ""
        kropp = re.sub(r"`", "", kropp).strip()
        biter, cur = [], ""
        for avsnitt in re.split(r"\n(?=- \*\*|\n)", kropp):
            if len(cur) + len(avsnitt) > 1500 and cur:
                biter.append(cur.strip()); cur = ""
            cur += "\n" + avsnitt
        if cur.strip():
            biter.append(cur.strip())
        ut += [[tittel, b] for b in biter]
    return ut


def main():
    UT.mkdir(parents=True, exist_ok=True)
    for fak, navn in FAKULTETER.items():
        l = data_linjer(fak)
        json.dump({"fakultet": fak, "navn": navn, "linjer": l}, open(UT / f"{fak}-data.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        print(f"{fak}: {len(l)} programlinjer, {(UT / f'{fak}-data.json').stat().st_size // 1024} kB")
    m = metode()
    json.dump({"avsnitt": m}, open(UT / "metode.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"metode: {len(m)} biter, {(UT / 'metode.json').stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()
