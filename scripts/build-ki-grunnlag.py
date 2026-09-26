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
UTELAT = {"3", "4", "5", "6", "8", "9", "10", "16", "18", "19", "22", "24", "33", "37"}


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
                    if max(d.get("pgs_ord") or 0, d.get("pgs_fv") or 0) > 90:
                        ting.append("(disse grensene etter suppleringsopptaket er på institusjonens egen poengskala med opptaksprøve og kan ikke sammenlignes med vanlige poenggrenser)")
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
                deler.append(f"Studiebarometeret {s.get('latestYear') or max((h['year'] for h in s.get('history', [])), default='(siste år)')}: helhetsvurdering {nf(s['scores']['helhetsvurdering'], 1)} av 5 ({s.get('respondents')} svar)")
            i = intl.get(e["id"], {})
            iy = sorted(i)[-1] if i else None
            if iy and i[iy].get("eng") is not None:
                deler.append(f"{iy}: {nf(i[iy]['eng'], 1)} % av studiepoengene i emner på engelsk" + (f", {nf(i[iy]['inn'], 1)} % innreisende utvekslingsstudenter i emnene" if i[iy].get("inn") is not None else ""))
            if deler:
                # 4. felt: «n» = NMBUs program, «h» = hovedkonkurrent (valgt som standard i opptaksanalysen), «» = øvrige
                flagg = "n" if e["id"] in g["nmbuIds"] else ("h" if e["id"] in g["defaultIds"] else "")
                linjer.append([gnavn(g), e["shortName"], f"{navn}. " + ". ".join(deler) + ".", flagg, fak, g["id"]])
    moduler = modul_linjer(fak, adm, sb)
    return (linjer + moduler + rangeringer(adm, comp, sb, fak) + oversikt([(fak, adm, comp, sb)], f"{KORT[fak]} ({FAKULTETER[fak]})")
            + emnetype_linjer(fak, adm) + fagmiljo_fakultet(fak) + strategi_linjer(fak))


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
        stud, kurs = student_data(fak), kurs_data(fak)
        def siste_stud(e):
            a = [x for x in (stud.get(e["id"]) or {}).get("aar", []) if x.get("total")]
            return a[-1] if a else None
        ranger("andel registrerte studenter 25 år eller eldre, siste høst", [(e, pst((siste_stud(e) or {}).get("a29", 0) + (siste_stud(e) or {}).get("a30", 0), (siste_stud(e) or {}).get("total"))) if siste_stud(e) else (e, None) for e in g["entries"]], 1, " %")
        ranger("andel utenlandske statsborgere blant registrerte, siste høst", [(e, pst((siste_stud(e) or {}).get("utenlandske"), (siste_stud(e) or {}).get("total"))) if siste_stud(e) and siste_stud(e).get("utenlandske") is not None else (e, None) for e in g["entries"]], 1, " %")
        k_aar = max((y["year"] for e in g["entries"] for c in (kurs.get(e["id"]) or {}).get("courses", []) for y in c.get("years", [])), default=None)
        if k_aar:
            ki = [(e, karakterer((kurs.get(e["id"]) or {}).get("courses", []), k_aar)) for e in g["entries"] if kurs.get(e["id"])]
            ranger(f"{k_aar} karakterindeks (A=5 … F=0) over programmets emner", [(e, a["snitt"]) for e, a in ki], 2)
            ranger(f"{k_aar} strykprosent (F) over programmets emner", [(e, a["stryk"]) for e, a in ki], 1, " %")
        for dim in ("undervisning", "tilbakemeldinger", "laeringsmiljo", "yrkesrelevans"):
            ranger(f"Studiebarometeret {SB_NAVN[dim]}, siste år", [(e, ((sb.get(e["id"]) or {}).get("scores") or {}).get(dim)) for e in g["entries"]], 1)
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
    for n in range(0, len(prog), 30):
        del_ = prog[n:n + 30]
        alle = "; ".join(pnavn(f, g, e) for f, g, e, _, _ in del_)
        ut.append([f"Oversikt {omfang}", "oversikt", f"OVERSIKT {omfang}: NMBUs programgrupper i sammenligningen ({len(prog)}){f', {n + 1}–{n + len(del_)}' if len(prog) > 30 else ''}: {alle}.", "o",
                   del_[0][0], del_[0][1]["id"], [[f, g["id"], pnavn(f, g, e)] for f, g, e, _, _ in del_]])

    def linje(tittel, verdier, dec, enhet="", apne=None, lavest=False):
        verdier = [(x[0], x[1], x[2] if len(x) > 2 else "") for x in verdier if x[1] is not None]
        if not verdier and not apne:
            return
        verdier.sort(key=lambda x: x[1] if lavest else -x[1])
        # Lange lister (hele NMBU) deles i biter under tegngrensen i chat.ts, med plassnummer bevart i hver bit
        punkter = [(p, f"{i + 1}. {pnavn(*p[:3])} {nf(v, dec)}{enhet}{f' ({t})' if t else ''}") for i, (p, v, t) in enumerate(verdier)]
        hode = f"OVERSIKT {omfang} · {tittel}, {'lavest' if lavest else 'høyest'} først ({len(verdier)} program)"
        biter, bit = [], []
        for p, pkt in punkter:
            if bit and len(hode) + sum(len(x) + 2 for _, x in bit) + len(pkt) > 2250:
                biter.append(bit); bit = []
            bit.append((p, pkt))
        biter.append(bit)
        for n, bit in enumerate(biter):
            tekst = f"{hode}{f', del {n + 1} av {len(biter)}' if len(biter) > 1 else ''}: {'; '.join(x for _, x in bit) or '(ingen)'}."
            rekke = [p for p, _ in bit]
            if apne and n == len(biter) - 1:
                tekst += f" Alle kvalifiserte fikk tilbud (ingen poenggrense): {', '.join(pnavn(*p[:3]) for p in apne)}."
                rekke += list(apne)
            if rekke:
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
            x = siste[-1]
            t = f"startkull {x['aar']}, {x['startkull']} studenter"
            gj.append((p, 100 * x["fullfortNormert"] / x["startkull"], t))
            ff.append((p, 100 * x["frafalt"] / x["startkull"], t))
    linje("fullført på normert tid, siste startkull", gj, 1, " %")
    linje("frafall, siste startkull", ff, 1, " %")
    linje("Studiebarometeret helhetsvurdering, siste år", [(p, ((p[4] or {}).get("scores") or {}).get("helhetsvurdering")) for p in prog], 1)
    stud = {}; kurs = {}
    for fak in {p[0] for p in prog}:
        stud.update(student_data(fak)); kurs.update(kurs_data(fak))
    a25 = []
    for p in prog:
        a = [x for x in (stud.get(p[2]["id"]) or {}).get("aar", []) if x.get("total")]
        if a:
            x = a[-1]
            a25.append((p, pst((x.get("a29") or 0) + (x.get("a30") or 0), x["total"]), f"høsten {x['aar']}, {x['total']} registrerte"))
    linje("andel registrerte studenter 25 år eller eldre", a25, 1, " %")
    k_aar = max((y["year"] for p in prog for c in (kurs.get(p[2]["id"]) or {}).get("courses", []) for y in c.get("years", [])), default=None)
    if k_aar:
        ki = [(p, karakterer((kurs.get(p[2]["id"]) or {}).get("courses", []), k_aar)) for p in prog if kurs.get(p[2]["id"])]
        linje(f"{k_aar} karakterindeks (A=5 … F=0) over programmets emner", [(p, a["snitt"]) for p, a in ki], 2)
        linje(f"{k_aar} strykprosent (F) over programmets emner", [(p, a["stryk"]) for p, a in ki], 1, " %")
    return ut


# ── Moduler utover opptak: Studentene, Studiebarometeret, emner og karakterer, fagmiljøet, søkergrunnlaget ──
SB_NAVN = {"helhetsvurdering": "helhetsvurdering", "undervisning": "undervisning", "tilbakemeldinger": "tilbakemelding og veiledning",
           "vurderingsformer": "vurderingsformer", "laeringsmiljo": "læringsmiljø", "organisering": "organisering",
           "yrkesrelevans": "yrkesrelevans", "engasjement": "eget engasjement"}
MIN_KANDIDATER = 10  # samme terskel som emnesiden bruker som standard


def pst(a, b, d=1):
    return None if not b else 100 * (a or 0) / b


def student_data(fak):
    d = json_les(f"{fak}StudentData.json")
    return {p["entryId"]: p for g in (d or {}).get("groups", []) for p in g["programs"]}


def kurs_data(fak):
    d = json_les(f"{fak}CourseData.json")
    return {p["entryId"]: p for g in (d or {}).get("groups", []) for p in g["programs"]}


def karakterer(emner, aar):
    """Kandidatvektet karakterindeks (A=5 … F=0) over emner med minst MIN_KANDIDATER, som emnesiden."""
    gr = dict(A=0, B=0, C=0, D=0, E=0, F=0); G = H = n = kand = 0
    for c in emner:
        d = next((y for y in c.get("years", []) if y["year"] == aar), None)
        if not d or d["total"] <= 0 or d["total"] < MIN_KANDIDATER:
            continue
        n += 1; kand += d["total"]
        for k in gr:
            gr[k] += d.get(k) or 0
        G += d.get("G") or 0; H += d.get("H") or 0
    bokst = sum(gr.values())
    return {
        "emner": n, "kandidater": kand, "bokstav": bokst,
        "snitt": (5 * gr["A"] + 4 * gr["B"] + 3 * gr["C"] + 2 * gr["D"] + gr["E"]) / bokst if bokst else None,
        "stryk": 100 * gr["F"] / bokst if bokst else None,
        "bestatt": 100 * G / (G + H) if G + H else None,
    }


def bokstav(snitt):
    return "A" if snitt >= 4.5 else "B" if snitt >= 3.5 else "C" if snitt >= 2.5 else "D" if snitt >= 1.5 else "E" if snitt >= 0.5 else "F"


def modul_linjer(fak, adm, sb):
    """Én linje per program og modul (STUDENTENE, STUDIEBAROMETERET, EMNER OG KARAKTERER), samme gruppe og flagg som opptakslinjen."""
    stud, kurs = student_data(fak), kurs_data(fak)
    ut = []
    for g in (adm or {}).get("groups", []):
        for e in g["entries"]:
            flagg = "n" if e["id"] in g["nmbuIds"] else ("h" if e["id"] in g["defaultIds"] else "")
            hode = f"{gnavn(g)} · {e['shortName']}{' (NMBU)' if e['id'] in g['nmbuIds'] else ''} · {e.get('institusjon', '')}, {e.get('studiested', '')}"
            ny = lambda tekst: ut.append([gnavn(g), e["shortName"], tekst, flagg, fak, g["id"]])

            p = stud.get(e["id"])
            aar = [a for a in (p or {}).get("aar", []) if a.get("total")]
            if aar:
                deler = []
                for a in aar[::-1][:3]:
                    t = a["total"]
                    grupper = [("21 år eller yngre", a.get("a21")), ("22–24 år", a.get("a24")), ("25–29 år", a.get("a29")), ("30 år eller eldre", a.get("a30"))]
                    tekst = f"høsten {a['aar']}: {nf(t)} registrerte studenter; alder " + ", ".join(f"{n} {nf(pst(v, t), 1)} % ({nf(v)})" for n, v in grupper)
                    sum_alder = sum(v or 0 for _, v in grupper)
                    if sum_alder < t:
                        tekst += f" (aldersgruppene summerer til {nf(sum_alder)} fordi DBH skjermer grupper på 1–2 personer)"
                    if a.get("utenlandske") is not None:
                        tekst += f"; utenlandske statsborgere {nf(a['utenlandske'])} ({nf(pst(a['utenlandske'], t), 1)} %)"
                    if a.get("utveksling") is not None:
                        tekst += f"; på utveksling ut (vår + høst) {nf(a['utveksling'])} ({nf(pst(a['utveksling'], t), 1)} per 100 registrerte)"
                    deler.append(tekst)
                ny(f"STUDENTENE · {hode}. Registrerte studenter, alder, utenlandske statsborgere og utveksling (DBH 60/135/142): " + ". ".join(deler) + ".")

            s = sb.get(e["id"])
            if s and any(v is not None for v in (s.get("scores") or {}).values()):
                sc = s["scores"]
                sb_aar = s.get("latestYear") or max((h["year"] for h in s.get("history", [])), default="(siste år)")
                tekst = (f"STUDIEBAROMETERET · {hode}. Studiebarometeret {sb_aar} ({nf(s.get('respondents'))} svar"
                         + (f", svarprosent {nf(s['responseRate'], 1)} %" if s.get("responseRate") is not None else "") + "), skår av 5: "
                         + ", ".join(f"{SB_NAVN[k]} {nf(v, 1)}" for k, v in sc.items() if v is not None and k in SB_NAVN) + ".")
                fa = s.get("fieldAverage") or {}
                if fa:
                    tekst += f" Snitt for sammenligningsgruppen ({s.get('fieldLabel', 'fagfeltet')}): " + ", ".join(f"{SB_NAVN[k]} {nf(v, 1)}" for k, v in fa.items() if v is not None and k in SB_NAVN) + "."
                hist = [h for h in s.get("history", []) if any(v is not None for v in (h.get("scores") or {}).values())]
                if len(hist) > 1:
                    tekst += " Over tid (alle indeksene per år): " + "; ".join(f"{h['year']}: " + ", ".join(f"{SB_NAVN[k]} {nf(v, 1)}" for k, v in h["scores"].items() if v is not None and k in SB_NAVN) for h in hist) + "."
                if s.get("warning"):
                    tekst += f" Merknad: {s['warning']}"
                ny(tekst)

            k = kurs.get(e["id"])
            if k and k.get("courses"):
                alle_aar = sorted({y["year"] for c in k["courses"] for y in c.get("years", [])}, reverse=True)
                deler = []
                for aar in alle_aar[:3]:
                    a = karakterer(k["courses"], aar)
                    if not a["emner"]:
                        continue
                    t = f"{aar}: {a['emner']} emner med minst {MIN_KANDIDATER} kandidater, {nf(a['kandidater'])} kandidater"
                    if a["snitt"] is not None:
                        t += f", karakterindeks {nf(a['snitt'], 2)} ({bokstav(a['snitt'])}), stryk (F) {nf(a['stryk'], 1)} % av bokstavkarakterene (minimum; DBH skjermer små grupper)"
                    if a["bestatt"] is not None:
                        t += f", bestått i emner med bestått/ikke bestått {nf(a['bestatt'], 1)} %"
                    deler.append(t)
                if deler:
                    siste = alle_aar[0]
                    store = sorted(((c, next((y for y in c["years"] if y["year"] == siste), None)) for c in k["courses"]), key=lambda x: -(x[1] or {}).get("total", 0))
                    store = [(c, d) for c, d in store if d and d["total"] >= MIN_KANDIDATER][:6]
                    emnetekst = "; ".join(f"{c['emnekode']} {c.get('emnenavn') or ''} ({nf(d['total'])} kandidater"
                                          + (f", snitt {nf(d['snitt'], 2)}" if d.get("snitt") is not None else "")
                                          + (f", stryk {nf(d['strykprosent'], 1)} %" if d.get("strykprosent") is not None else "") + ")" for c, d in store)
                    ny(f"EMNER OG KARAKTERER · {hode}. Karakterindeks = kandidatvektet snitt over emnene programmets studenter tok (A=5 … F=0), DBH 308 på programnivå: "
                       + ". ".join(deler) + "." + (f" Største emner {siste}: {emnetekst}." if emnetekst else ""))
    return ut


def emnetype_linjer(fak, adm):
    """Emnesammenligning per emnetype (koblingene i <fak>CourseMapping.json): NMBU mot konkurrentenes tilsvarende emner."""
    m = json_les(f"{fak}CourseMapping.json")
    if not m:
        return []
    kurs = kurs_data(fak)
    grupper = {g["id"]: g for g in (adm or {}).get("groups", [])}
    navn = {e["id"]: e for g in grupper.values() for e in g["entries"]}
    ut = []
    for mg in m.get("groups", []):
        g = grupper.get(mg["groupId"])
        if not g:
            continue
        for ct in mg.get("courseTypes", []):
            alle_aar = sorted({y["year"] for k in ct.get("koblinger", []) for kode in k["emnekoder"]
                               for c in (kurs.get(k["entryId"]) or {}).get("courses", []) if c["emnekode"] == kode for y in c.get("years", [])}, reverse=True)
            for aar in alle_aar[:1]:
                deler = []
                for k in ct.get("koblinger", []):
                    p = kurs.get(k["entryId"])
                    if not p:
                        continue
                    emner = [c for c in p["courses"] if c["emnekode"] in k["emnekoder"]]
                    a = karakterer(emner, aar)
                    if not a["emner"]:
                        continue
                    e = navn.get(k["entryId"], {"shortName": p.get("shortName", k["entryId"])})
                    t = f"{e['shortName']}{' (NMBU)' if k['entryId'] in g['nmbuIds'] else ''} ({', '.join(c['emnekode'] + ' ' + (c.get('emnenavn') or '') for c in emner)}): {nf(a['kandidater'])} kandidater"
                    if a["snitt"] is not None:
                        t += f", karakterindeks {nf(a['snitt'], 2)} ({bokstav(a['snitt'])}), stryk {nf(a['stryk'], 1)} %"
                    if a["bestatt"] is not None:
                        t += f", bestått {nf(a['bestatt'], 1)} %"
                    deler.append(t)
                if len(deler) >= 2:
                    ut.append([gnavn(g), "emnetype", f"EMNER OG KARAKTERER · emnetype «{ct['label']}» ({ct.get('kategori', '')}) i {gnavn(g)}, {aar} (tilsvarende emner hos NMBU og konkurrentene, emner med minst {MIN_KANDIDATER} kandidater): "
                               + "; ".join(deler) + "." + (f" Merknad: {ct['note']}" if ct.get("note") else ""), "e", fak, g["id"]])
    return ut


FAG_MAAL = [("sarv", "studentårsverk per faglig årsverk", 1), ("stud", "registrerte studenter per faglig årsverk", 1), ("publ", "publiseringspoeng per faglig årsverk", 2),
            ("niva2", "andel nivå 2 av publiseringspoengene (%)", 1), ("forste", "andel førstestillinger av faglige årsverk (%)", 1), ("kvinner", "kvinneandel blant faglige årsverk (%)", 1)]


def fag_verdier(y):
    f = y.get("faglige")
    return {"sarv": y["studentarsverk"] / f if f and y.get("studentarsverk") is not None else None,
            "stud": y["studenter"] / f if f and y.get("studenter") is not None else None,
            "publ": y["publPoeng"] / f if f and y.get("publPoeng") is not None else None,
            "niva2": y.get("niva2Andel"), "forste": pst(y.get("forste"), f), "kvinner": pst(y.get("fagligeKvinner"), f)}


def fagmiljo_linjer(enheter, gruppe, fak, gid, navn):
    ut = []
    siste = max((y["aar"] for u in enheter for y in u.get("years", [])), default=None)
    if not siste:
        return ut
    for u in enheter:
        ys = {y["aar"]: y for y in u.get("years", [])}
        y = ys.get(siste)
        if not y:
            continue
        v = fag_verdier(y)
        tekst = (f"FAGMILJØET · {navn(u)}{' (NMBU)' if u.get('isNmbu') else ''} {siste} (DBH): faglige årsverk {nf(y.get('faglige'), 1)}, rekrutteringsårsverk (stipendiat, postdoktor) {nf(y.get('rekruttering'), 1)}, "
                 f"alle årsverk {nf(y.get('arsverk'), 1)}, registrerte studenter {nf(y.get('studenter'))}, studentårsverk {nf(y.get('studentarsverk'), 1)}, publiseringspoeng {nf(y.get('publPoeng'), 1)}; "
                 + ", ".join(f"{t} {nf(v[k], d)}" for k, t, d in FAG_MAAL if v[k] is not None) + ".")
        forr = ys.get(siste - 1)
        if forr and fag_verdier(forr)["sarv"] is not None:
            tekst += f" {siste - 1}: studentårsverk per faglig årsverk {nf(fag_verdier(forr)['sarv'], 1)}, publiseringspoeng per faglig årsverk {nf(fag_verdier(forr)['publ'], 2)}."
        ut.append([gruppe, u.get("kort", ""), tekst, "f" if not u.get("isNmbu") else "n", fak, gid])
    for k, t, d in FAG_MAAL[:3]:
        verdier = sorted(((u, fag_verdier(next((y for y in u.get("years", []) if y["aar"] == siste), {}) or {})[k]) for u in enheter), key=lambda x: -(x[1] or -1))
        verdier = [(u, x) for u, x in verdier if x is not None]
        if len(verdier) > 1:
            liste = "; ".join(f"{i + 1}. {navn(u)} {nf(x, d)}" for i, (u, x) in enumerate(verdier))
            nm = [f"NMBU er nr. {i + 1} av {len(verdier)}" for i, (u, _) in enumerate(verdier) if u.get("isNmbu")]
            ut.append([gruppe, "rangering", f"RANGERING FAGMILJØET {siste} {t} · {gruppe}, høyest først: {liste}." + (f" {nm[0]}." if nm else ""), "r", fak, gid])
    return ut


def fagmiljo_fakultet(fak):
    d = json_les("staffData.json")
    enheter = (d or {}).get("fakulteter", {}).get(fak, [])
    return fagmiljo_linjer(enheter, f"Fagmiljøet {KORT[fak]} (fakultet mot fakultet)", fak, "", lambda u: f"{u['kort']} {u['navn']}")


def fagmiljo_nmbu():
    d = json_les("staffData.json") or {}
    ut = fagmiljo_linjer(d.get("institusjoner", []), "Fagmiljøet: institusjonene", "nmbu-fagmiljo", "", lambda u: u["kort"])
    nmbu_fak = [us[0] for us in d.get("fakulteter", {}).values() if us and us[0].get("isNmbu")]
    ut += fagmiljo_linjer([{**u, "isNmbu": False} for u in nmbu_fak], "Fagmiljøet: NMBUs fakulteter", "nmbu-fagmiljo", "", lambda u: u["navn"])
    return ut


def sokergrunnlag():
    """SSB-kullene per fylke (faktiske og framskrevne) og Udir-tallene (matematikk, gjennomføring, Vg3) → felles-data.json."""
    rot = ROOT / "kilde" / "public" / "sokergrunnlag"
    ut = []
    s = json.load(open(rot / "ssb.json", encoding="utf-8"))
    aar = s["aar"]
    idx = lambda y: aar.index(y) if y in aar else None
    sum_alder = lambda f, alder, y: sum((s["alder"][f].get(str(a)) or [0] * len(aar))[idx(y)] or 0 for a in alder) if idx(y) is not None else None
    siste_faktisk = s["forsteFramskrevne"] - 1
    punkter = [2016, siste_faktisk, 2030, 2035, 2040, 2045]
    steder = {}
    for sted, f in s.get("stedFylke", {}).items():
        steder.setdefault(f, []).append(sted)
    endring = []
    for f in s["rekkefolge"]:
        navn = s["fylker"][f]
        deler = []
        for lbl, alder in (("19-åringer", [19]), ("19–24 år", range(19, 25)), ("16–18 år", [16, 17, 18])):
            deler.append(f"{lbl}: " + ", ".join(f"{y} {nf(sum_alder(f, alder, y))}" for y in punkter if idx(y) is not None))
        a0, a1 = sum_alder(f, [19], siste_faktisk), sum_alder(f, [19], 2035)
        if a0 and a1 and f != "0":
            endring.append((navn, 100 * (a1 - a0) / a0))
        ut.append(["Søkergrunnlaget", navn, f"SØKERGRUNNLAGET · {navn}: befolkning etter alder (SSB 07459 til {siste_faktisk}, SSB 14746 framskrevet fra {s['forsteFramskrevne']}, hovedalternativet). "
                   + "; ".join(deler) + "." + (f" Studiesteder i fylket i sammenligningene: {', '.join(sorted(steder[f]))}." if f in steder else ""), "s", "nmbu-sokergrunnlag", ""])
    if endring:
        endring.sort(key=lambda x: -x[1])
        ut.append(["Søkergrunnlaget", "rangering", f"RANGERING SØKERGRUNNLAGET endring i antall 19-åringer fra {siste_faktisk} til 2035 (SSB, hovedalternativet), sortert fra størst økning til størst nedgang (negative tall er nedgang): "
                   + "; ".join(f"{i + 1}. {n} {'+' if v >= 0 else ''}{nf(v, 1)} %" for i, (n, v) in enumerate(endring)) + ".", "r", "nmbu-sokergrunnlag", ""])
    u = json.load(open(rot / "udir.json", encoding="utf-8"))
    for f in s["rekkefolge"]:
        navn = u["fylker"].get(f, s["fylker"][f])
        deler = []
        for fag, per in u.get("matematikk", {}).items():
            rad = per.get(f) or {}
            sist = sorted(rad)[-3:]
            if sist:
                deler.append(f"{fag}: " + ", ".join(f"{sk} {nf(rad[sk].get('elever'))} elever, snitt {nf(rad[sk].get('snitt'), 1)}" for sk in sist))
        gj = u.get("gjennomforing", {}).get(f) or {}
        if gj:
            k = sorted(gj)[-1]
            deler.append(f"fullført og bestått videregående innen {gj[k].get('aar')} år, kull som startet {k}: {nf(gj[k].get('andel'), 1)} %")
        vg3 = u.get("vg3Studieforberedende", {}).get(f) or {}
        if vg3:
            deler.append("elever i Vg3 studieforberedende: " + ", ".join(f"{k} {nf(v)}" for k, v in sorted(vg3.items())[-3:]))
        if deler:
            ut.append(["Søkergrunnlaget", navn, f"SØKERGRUNNLAGET · videregående i {navn} (Udir, standpunktkarakterer): " + "; ".join(deler) + ".", "s", "nmbu-sokergrunnlag", ""])
    return ut


def strategi_linjer(fak):
    """STRATEGIER: konkurrentenes strategier mot 2030 (public/markedsstatus/<fak>/strategier.json, build-strategier.py)."""
    p = ROOT / "kilde" / "public" / "markedsstatus" / fak / "strategier.json"
    if not p.exists():
        return []
    d = json.load(open(p, encoding="utf-8"))
    ut = []
    for i in d["institusjoner"]:
        dok = "; ".join(f"{s['tittel']}{' (' + s['periode'] + ')' if s.get('periode') else ''}{', ' + s['status'] if s.get('status') and s['status'] != 'gjeldende' else ''}" for s in i["strategier"])
        hode = f"STRATEGIER · {i['navn']} ({i['enhet']}). Dokumenter: {dok}."
        tema = {}
        for x in i["satsinger"]:
            tema.setdefault(x["tema"], []).append(x["tekst"])
        deler = [f"{t}: " + " ".join(v) for t, v in tema.items()]
        ekstra = [f"Visjon: {i['visjon']}" if i.get("visjon") else "", f"Særpreg: {i['saerpreg']}" if i.get("saerpreg") else "",
                  f"Tallfestede mål: {' '.join(m['tekst'] for m in i['maal'])}" if i.get("maal") else "",
                  f"Studieporteføljen: {i['studieportefolje']}" if i.get("studieportefolje") else "",
                  f"Akkreditering: {i['akkreditering']}" if i.get("akkreditering") else "", f"Pågår nå: {i['pagaende']}" if i.get("pagaende") else ""]
        # To linjer per institusjon (oversikt og satsinger), så de holder seg under tegngrensen
        # Oversiktslinje og satsinger delt i biter under tegngrensen i chat.ts (2 400)
        forst = f"{hode} " + " ".join(e for e in ekstra if e)
        ut.append(["Strategier mot 2030", i["navn"], forst[:2350], "f", fak, ""])
        bit = f"STRATEGIER · {i['navn']}: satsinger per tema."
        for d_ in deler:
            if len(bit) + len(d_) > 2300:
                ut.append(["Strategier mot 2030", i["navn"], bit, "f", fak, ""])
                bit = f"STRATEGIER · {i['navn']} (forts.):"
            bit += " | " + d_[:2200]
        ut.append(["Strategier mot 2030", i["navn"], bit, "f", fak, ""])
    sy = d.get("syntese")
    if sy:
        for tittel, punkter in (("går igjen", [f"{g['tittel']} ({', '.join(g['inst'])}): {g['tekst']}" for g in sy.get("gaarIgjen", [])]),
                                ("skiller seg ut", [f"{x['inst']} – {x['tittel']}: {x['tekst']}" for x in sy.get("skillerSeg", [])])):
            bit = f"STRATEGIER · på tvers av handelshøyskolene, {tittel}:"
            for pkt in punkter:
                if len(bit) + len(pkt) > 2300:
                    ut.append(["Strategier mot 2030", "syntese", bit, "f", fak, ""])
                    bit = f"STRATEGIER · på tvers av handelshøyskolene, {tittel} (forts.):"
                bit += " | " + pkt
            ut.append(["Strategier mot 2030", "syntese", bit, "f", fak, ""])
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
    o = oversikt(grunnlag, "hele NMBU") + fagmiljo_nmbu()
    json.dump({"fakultet": None, "navn": "Hele NMBU", "linjer": o}, open(UT / "nmbu-data.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"nmbu: {len(o)} oversikts- og fagmiljølinjer")
    f = sokergrunnlag()
    json.dump({"fakultet": None, "navn": "Felles", "linjer": f}, open(UT / "felles-data.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"felles: {len(f)} søkergrunnlagslinjer, {(UT / 'felles-data.json').stat().st_size // 1024} kB")
    m = metode()
    json.dump({"avsnitt": m}, open(UT / "metode.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"metode: {len(m)} biter, {(UT / 'metode.json').stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()
