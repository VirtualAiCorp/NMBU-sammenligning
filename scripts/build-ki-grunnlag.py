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
KORT = {"hh": "HH", "landsam": "LANDSAM", "realtek": "REALTEK", "biovit": "BIOVIT", "kbm": "KBM", "mina": "MINA", "vet": "VET"}
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


def gnavn(g, ekstra=""):
    """Gruppenavn med nivå, uten dobbelt nivå når etiketten alt har det («Kjemi (2-årig master)»)."""
    niv = "" if re.search(r"\((?:\d-årig )?(?:master|bachelor)", g["label"], re.I) else NIVAA.get(g["level"], g["level"])
    deler = ", ".join(x for x in (niv, ekstra) if x)
    return f"{g['label']} ({deler})" if deler else g["label"]


def json_les(navn):
    p = DATA / navn
    return json.load(open(p, encoding="utf-8")) if p.exists() else None


def data_linjer(fak):
    """Én linje per program: [gruppe, program, tekst, flagg, fakultet, gruppe-id] (de to siste brukes til «Ta meg til»)."""
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
            navn = f"{gnavn(g)} · {e['shortName']}{' (NMBU)' if e['id'] in g['nmbuIds'] else ''} · {e.get('institusjon', '')}, {e.get('studiested', '')}"
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
                if d.get("vl_ord") is not None or d.get("vl_fv") is not None:
                    tot = (d.get("vl_ord") or 0) + (d.get("vl_fv") or 0)
                    tots = (d.get("vls_ord") or 0) + (d.get("vls_fv") or 0)
                    ting.append(f"søkere på venteliste etter hovedopptaket {nf(tot)} i alt (ordinær {nf(d.get('vl_ord'))} + førstegangsvitnemål {nf(d.get('vl_fv'))})"
                                + (f", etter suppleringsopptaket {nf(tots)} i alt (ordinær {nf(d.get('vls_ord'))} + førstegangsvitnemål {nf(d.get('vls_fv'))})" if d.get("vls_ord") is not None or d.get("vls_fv") is not None else ""))
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
                linjer.append([gnavn(g), e["shortName"], f"{navn}. " + ". ".join(deler) + ".", flagg, fak, g["id"]])
    return linjer + rangeringer(adm, comp, sb, fak) + oversikt([(fak, adm, comp, sb)], f"{KORT[fak]} ({FAKULTETER[fak]})")


def rangeringer(adm, comp, sb, fak):
    """Ferdig sorterte rangeringer per programgruppe (flagg «r»), slik at modellen slipper å sortere tall selv."""
    ut = []
    kull = {p["entryId"]: p for g in (comp or {}).get("groups", []) for p in g["programs"]}
    for g in (adm or {}).get("groups", []):
        gn = gnavn(g)
        navn = lambda e: f"{e['shortName']}{' (NMBU)' if e['id'] in g['nmbuIds'] and 'NMBU' not in e['shortName'] else ''} ({e.get('studiested', '')})"

        def ranger(tittel, verdier, dec, enhet="", apne=None):
            verdier = [(e, v) for e, v in verdier if v is not None]
            if len(verdier) < 2 and not apne:
                return
            verdier.sort(key=lambda x: -x[1])
            liste = "; ".join(f"{i + 1}. {navn(e)} {nf(v, dec)}{enhet}" for i, (e, v) in enumerate(verdier))
            nmbu = [f"NMBU{'' if e['shortName'] == 'NMBU' else ' (' + e['shortName'] + ')'} er nr. {i + 1} av {len(verdier)}" for i, (e, v) in enumerate(verdier) if e["id"] in g["nmbuIds"]]
            tekst = f"RANGERING {tittel} · {gn}, høyest først: {liste}."
            if nmbu:
                tekst += " " + "; ".join(nmbu) + "."
            if apne:
                tekst += f" Alle kvalifiserte fikk tilbud (ingen poenggrense): {', '.join(navn(e) for e in apne)}."
            ut.append([gn, "rangering", tekst, "r", fak, g["id"]])

        for y in sorted({y for e in g["entries"] for y in e["years"]}, reverse=True)[:2]:
            d = {e["id"]: e["years"].get(y) or {} for e in g["entries"]}
            for felt, tittel in (("pg_ord", "poenggrense ordinær kvote"), ("pg_fv", "poenggrense førstegangsvitnemål")):
                vals = [(e, d[e["id"]].get(felt)) for e in g["entries"] if d[e["id"]].get(felt)]
                apne = [e for e in g["entries"] if d[e["id"]].get(felt) == 0]
                if vals or apne:
                    ranger(f"{y} {tittel} (hovedopptak)", vals, 1, apne=apne)
            ranger(f"{y} førstevalgssøkere per studieplass", [(e, d[e["id"]]["fvS"] / d[e["id"]]["plasser"] if d[e["id"]].get("fvS") is not None and d[e["id"]].get("plasser") else None) for e in g["entries"]], 2)
            ranger(f"{y} søkere på venteliste etter hovedopptaket (ordinær + førstegangsvitnemål)",
                   [(e, (d[e["id"]].get("vl_ord") or 0) + (d[e["id"]].get("vl_fv") or 0) if d[e["id"]].get("vl_ord") is not None or d[e["id"]].get("vl_fv") is not None else None) for e in g["entries"]], 0)
        gj = []
        for e in g["entries"]:
            siste = [x for x in (kull.get(e["id"]) or {}).get("kull", []) if x.get("startkull") and x.get("normertAar") and x["normertAar"] <= 2025]
            if siste:
                gj.append((e, 100 * siste[-1]["fullfortNormert"] / siste[-1]["startkull"]))
        ranger("fullført på normert tid, siste startkull", gj, 1, " %")
        ranger("Studiebarometeret helhetsvurdering, siste år", [(e, (sb.get(e["id"]) or {}).get("scores", {}).get("helhetsvurdering")) for e in g["entries"]], 1)
    return ut


def oversikt(kilder, omfang):
    """OVERSIKT-linjer (flagg «o»): NMBUs egne program innen et fakultet (eller hele NMBU) sortert per mål, for spørsmål
    som «hvilket KBM-program har høyest poenggrense?». 7. felt lister [fakultet, gruppe-id, programnavn] i samme rekkefølge
    som i teksten, slik at «Ta meg til» kan peke på programmet svaret nevner."""
    hele = len(kilder) > 1
    prog = []  # (fak, gruppe, entry, kull, sb)
    for fak, adm, comp, sb in kilder:
        kull = {p["entryId"]: p for g in (comp or {}).get("groups", []) for p in g["programs"]}
        for g in (adm or {}).get("groups", []):
            for e in g["entries"]:
                if e["id"] in g["nmbuIds"]:
                    prog.append((fak, g, e, kull.get(e["id"]), sb.get(e["id"])))
    if not prog:
        return []
    def pnavn(fak, g, e):
        n = gnavn(g, KORT[fak] if hele else "")
        if e["shortName"] != "NMBU" and sum(1 for x in prog if x[1] is g) > 1:
            n += f" – {e['shortName']}"
        return n
    ut = []
    alle = "; ".join(pnavn(f, g, e) for f, g, e, _, _ in prog)
    ut.append([f"Oversikt {omfang}", "oversikt", f"OVERSIKT {omfang}: NMBUs programgrupper i sammenligningen ({len(prog)}): {alle}.", "o",
               prog[0][0], prog[0][1]["id"], [[f, g["id"], pnavn(f, g, e)] for f, g, e, _, _ in prog]])

    def linje(tittel, verdier, dec, enhet="", apne=None, lavest=False):
        verdier = [x for x in verdier if x[1] is not None]
        if not verdier and not apne:
            return
        verdier.sort(key=lambda x: x[1] if lavest else -x[1])
        liste = "; ".join(f"{i + 1}. {pnavn(*p[:3])} {nf(v, dec)}{enhet}" for i, (p, v) in enumerate(verdier))
        tekst = f"OVERSIKT {omfang} · {tittel}, {'lavest' if lavest else 'høyest'} først: {liste or '(ingen)'}."
        if apne:
            tekst += f" Alle kvalifiserte fikk tilbud (ingen poenggrense): {', '.join(pnavn(*p[:3]) for p in apne)}."
        rekke = [p for p, _ in verdier] + list(apne or [])
        ut.append([f"Oversikt {omfang}", "oversikt", tekst, "o", rekke[0][0], rekke[0][1]["id"], [[p[0], p[1]["id"], pnavn(*p[:3])] for p in rekke]])

    aar = lambda felt: max((y for _, _, e, _, _ in prog for y, d in e["years"].items() if d.get(felt) is not None), default=None)
    for felt, tittel in (("pg_ord", "poenggrense ordinær kvote (hovedopptak)"), ("pg_fv", "poenggrense førstegangsvitnemål (hovedopptak)")):
        y = aar(felt)
        if y:
            d = lambda p: p[2]["years"].get(y) or {}
            linje(f"{y} {tittel}", [(p, d(p).get(felt)) for p in prog if d(p).get(felt)], 1, apne=[p for p in prog if d(p).get(felt) == 0])
    y = aar("op_mott")
    if y:
        linje(f"{y} snitt opptakspoeng for de som møtte", [(p, (p[2]["years"].get(y) or {}).get("op_mott")) for p in prog], 1)
    y = aar("fvS")
    if y:
        d = lambda p: p[2]["years"].get(y) or {}
        linje(f"{y} førstevalgssøkere per studieplass", [(p, d(p)["fvS"] / d(p)["plasser"] if d(p).get("fvS") is not None and d(p).get("plasser") else None) for p in prog], 2)
        linje(f"{y} søkere i alt", [(p, d(p).get("alleS")) for p in prog], 0)
    gj, ff = [], []
    for p in prog:
        siste = [x for x in (p[3] or {}).get("kull", []) if x.get("startkull") and x.get("normertAar") and x["normertAar"] <= 2025]
        if siste:
            gj.append((p, 100 * siste[-1]["fullfortNormert"] / siste[-1]["startkull"]))
            ff.append((p, 100 * siste[-1]["frafalt"] / siste[-1]["startkull"]))
    linje("fullført på normert tid, siste startkull", gj, 1, " %")
    linje("frafall, siste startkull", ff, 1, " %")
    linje("Studiebarometeret helhetsvurdering, siste år", [(p, ((p[4] or {}).get("scores") or {}).get("helhetsvurdering")) for p in prog], 1)
    return ut


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
    grunnlag = []
    for fak in FAKULTETER:
        sb_p = ROOT / "data" / fak / "studiebarometer.json"
        grunnlag.append((fak, json_les(f"{fak}AdmissionData.json"), json_les(f"{fak}CompletionData.json"),
                         {e["entryId"]: e for e in json.load(open(sb_p, encoding="utf-8"))} if sb_p.exists() else {}))
    o = oversikt(grunnlag, "hele NMBU")
    json.dump({"fakultet": None, "navn": "Hele NMBU", "linjer": o}, open(UT / "nmbu-data.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"nmbu: {len(o)} oversiktslinjer")
    m = metode()
    json.dump({"avsnitt": m}, open(UT / "metode.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"metode: {len(m)} biter, {(UT / 'metode.json').stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()
