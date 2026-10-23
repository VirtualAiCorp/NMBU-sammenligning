#!/usr/bin/env python3
"""Fagmiljøet over tid: tilsatte og publisering 2010–2025 per institusjon, fakultet og institutt, med sammenslåinger
(DBH/HKDIR) → kilde/public/fagmiljo/historikk/<kode>.json + index.json

To serier per nivå:
  rapportert     Tallene slik de ligger i DBH: per institusjonskode (dagens og forløperne), per fakultetskode og per
                 avdelingskode, med fakultetstilhørigheten som gjaldt det året (DBH 210, gyldig fra/til).
  sammenlignbar  Dagens institusjon og dagens fakulteter/institutter bakover: forløperne summeres inn for årene før
                 sammenslåingen, og nedlagte avdelinger kobles til dagens enheter. Det som ikke lar seg koble, står
                 som egen «Ikke koblet»-post (så summen alltid er lik institusjonstotalen) og merkes som brudd.

Kilder (per institusjonskode, cache i data/nmbu/kilder/dbh-historikk/dbh-cache/):
  225  Tilsatte (årsverk) per år × avdeling × stillingskode; kategori via 220 som i build-staff.py
       (UN1/UN3/UN4 faglige, UN2 rekruttering, resten teknisk/administrativt). Antall kvinner/menn i 225 er også
       årsverk, ikke personer.
  373  Publikasjoner, forfatterandeler og publiseringspoeng per år × avdeling. Avdeling 000000 er institusjonstotalen
       og brukes bare på institusjonsnivå (antall publikasjoner kan ikke summeres over avdelinger).
  374  Publiseringspoeng per kvalitetsnivå (nivå 2-andel).
  210  Avdelinger: fakultet, navn og gyldighetsperiode.
  Oppslag av forløpernes koder: 225 og 373 for alle institusjoner, gruppert på institusjonskode (med kodetekst).

Sammenslåingene står i data/nmbu/historikk/fusjoner.json, manuelle avdelingskoblinger i
data/nmbu/historikk/avdelingskobling.json. Kontroller og alt som ikke lot seg koble: data/nmbu/historikk/rapport.md.

Uten nettilgang til DBH faller skriptet tilbake på cachen fra build-staff.py (data/nmbu/kilder/dbh-fagmiljo/,
2019–2025, bare dagens koder) og skriver hvilke år og koder som mangler.

Bruk:
  python3 scripts/build-historikk.py [--refresh] [--fra 2010] [--til 2025]
"""
import argparse
import collections
import datetime as dt
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("blc", ROOT / "scripts" / "build-landsam-courses.py")
blc = importlib.util.module_from_spec(spec); spec.loader.exec_module(blc)

CACHE = ROOT / "data" / "nmbu" / "kilder" / "dbh-historikk" / "dbh-cache"
FALLBACK = ROOT / "data" / "nmbu" / "kilder" / "dbh-fagmiljo"
FUSJONER = ROOT / "data" / "nmbu" / "historikk" / "fusjoner.json"
KOBLING = ROOT / "data" / "nmbu" / "historikk" / "avdelingskobling.json"
RAPPORT = ROOT / "data" / "nmbu" / "historikk" / "rapport.md"
UT = ROOT / "kilde" / "public" / "fagmiljo" / "historikk"
FORSTE = re.compile(r"professor|førsteamanuensis|dosent|førstelektor", re.I)

# Rekkefølgen på målene i hver årsverdi (lista i JSON-en). Speiles i FagmiljoHistorikk.tsx.
M = ["aw", "fa", "re", "fo", "kvf", "pu", "pp", "fd", "n2", "p4"]
# aw alle årsverk · fa faglige årsverk · re rekruttering · fo førstestillinger · kvf kvinner i faglige stillinger (årsverk)
# pu antall publikasjoner · pp publiseringspoeng · fd forfatterandeler · n2 poeng på nivå 2 · p4 poeng i 374 (nevner for nivå 2-andel)
TILSATT = {"aw", "fa", "re", "fo", "kvf"}
PUBL = {"pu", "pp", "fd"}
NIVA = {"n2", "p4"}


def fl(v):
    try:
        return float(v or 0)
    except (TypeError, ValueError):
        return 0.0


def body(tid, inst, y0, y1, group_by=None, variabler=None, years=True, kodetekst="N"):
    sel = {"filter": "all", "values": ["*"]} if inst == "*" else {"filter": "item", "values": [inst]}
    f = [{"variabel": "Institusjonskode", "selection": sel}]
    if years:
        f.append({"variabel": "Årstall", "selection": {"filter": "between", "values": [str(y0), str(y1)]}})
    b = {"tabell_id": tid, "api_versjon": 1, "statuslinje": "J", "kodetekst": kodetekst, "desimal_separator": ".", "filter": f}
    if group_by:
        b["groupBy"] = group_by
    if variabler:
        b["variabler"] = variabler
    return b


class Henter:
    """DBH først (med cache), ellers cachen fra build-staff.py. Holder regnskap over hvor hver tabell kom fra."""

    def __init__(self, refresh, y0, y1):
        self.refresh, self.y0, self.y1 = refresh, y0, y1
        self.logg = []  # (tabell, kode, kilde, år)

    def __call__(self, tid, inst, b, navn):
        try:
            rows = blc.fetch_dbh(b, CACHE / navn, self.refresh)
        except json.JSONDecodeError:
            rows = []
        kilde = "DBH"
        if not rows and inst != "*":
            rows, kilde = self.reserve(tid, inst), "cache (build-staff, 2019–2025)"
            if not rows:
                kilde = "mangler"
        aar = sorted({int(r["Årstall"]) for r in rows if r.get("Årstall")})
        self.logg.append((tid, inst, kilde if rows else "mangler", aar))
        return rows

    def reserve(self, tid, inst):
        p = FALLBACK / (f"{tid}_stillingskoder.json" if tid == 220 else f"{tid}_{inst}.json")
        if not blc.cache_finnes(p):
            return []
        data = json.loads(blc.les_cache(p))
        if not isinstance(data, list):
            return []
        rows = [r for r in data[1:] if isinstance(r, dict)]
        return [r for r in rows if not r.get("Årstall") or self.y0 <= int(r["Årstall"]) <= self.y1]


def norm(s):
    s = (s or "").lower()
    s = re.sub(r"\b(institutt|instituttet|avdeling|avdelingen|seksjon|fakultet|fakultetet)\b( for| i)?", " ", s)
    return re.sub(r"[^a-zæøå0-9]+", " ", s).strip()


def periode_int(s, standard):
    try:
        return int(str(s))
    except (TypeError, ValueError):
        return standard


class Avdelinger:
    """DBH 210 for én institusjonskode: hvilken fakultetskode og hvilket navn en avdeling hadde et gitt år."""

    def __init__(self, rows):
        self.p = collections.defaultdict(list)
        self.faknavn = {}
        for r in rows:
            a = r.get("Avdelingskode")
            if not a:
                continue
            fra, til = periode_int(r.get("Gyldig fra"), 0), periode_int(r.get("Gyldig til"), 99999)
            per = {"fra": fra, "til": til, "fak": r.get("Fakultetskode") or a[:3], "fakNavn": r.get("Fakultetsnavn") or "",
                   "navn": r.get("Avdelingsnavn") or r.get("Avdelingsnavn bokmål") or ""}
            self.p[a].append(per)
            k = per["fak"]
            if per["fakNavn"] and (k not in self.faknavn or til >= self.faknavn[k][1]):
                self.faknavn[k] = (per["fakNavn"], til)
        for v in self.p.values():
            v.sort(key=lambda x: x["fra"])

    def ved(self, avd, aar):
        ps = self.p.get(avd)
        if not ps:
            return None
        for t in (aar * 10 + 3, aar * 10 + 1, aar * 10 + 2):
            for x in ps:
                if x["fra"] <= t <= x["til"]:
                    return x
        # utenfor alle perioder: nærmeste periode
        return min(ps, key=lambda x: min(abs(x["fra"] - aar * 10), abs(x["til"] - aar * 10)))

    def navn(self, avd, aar=None):
        """Avdelingsnavnet; mangler det i 210 (eldre uttrekk), fakultetsnavnet med avdelingskoden."""
        x = self.ved(avd, aar) if aar else (self.p[avd][-1] if self.p.get(avd) else None)
        if not x:
            return ""
        return x.get("navn") or (f"{x['fakNavn']} ({avd})" if x.get("fakNavn") else "")

    def fak_navn(self, fak):
        return self.faknavn.get(fak, ("",))[0]

    def gjeldende(self, aar):
        """Avdelinger som gjelder høsten `aar` (dagens struktur når aar = siste år)."""
        t = aar * 10 + 3
        return {a: x for a, ps in self.p.items() for x in ps if x["fra"] <= t <= x["til"]}


def tom():
    return {k: 0.0 for k in M} | {"_t": 0, "_p": 0, "_n": 0}


def legg_til(acc, v, andel=1.0):
    for k in M:
        acc[k] += v[k] * andel
    acc["_t"] |= v["_t"]; acc["_p"] |= v["_p"]; acc["_n"] |= v["_n"]


def ut_verdi(v, pu=True):
    """Årsverdi som liste i rekkefølgen M; null der tabellen ikke er rapportert."""
    def r(k, d):
        har = v["_t"] if k in TILSATT else (v["_p"] if k in PUBL else v["_n"])
        if not har or (k == "pu" and not pu):
            return None
        return round(v[k], d)
    return [r("aw", 1), r("fa", 1), r("re", 1), r("fo", 1), r("kvf", 1), r("pu", 0), r("pp", 1), r("fd", 2), r("n2", 1), r("p4", 1)]


def serie(per_aar, pu=True):
    return {str(y): ut_verdi(v, pu) for y, v in sorted(per_aar.items()) if v["_t"] or v["_p"] or v["_n"]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    ap.add_argument("--fra", type=int, default=2010)
    ap.add_argument("--til", type=int, default=2025)
    a = ap.parse_args()
    Y0, Y1 = a.fra, a.til
    hent = Henter(a.refresh, Y0, Y1)
    fus = json.load(open(FUSJONER, encoding="utf-8"))
    kob = json.load(open(KOBLING, encoding="utf-8")).get("koblinger", [])
    rapport = [f"# Fagmiljøet over tid: kontrollrapport ({dt.date.today().isoformat()})", "",
               f"Generert av `scripts/build-historikk.py` for {Y0}–{Y1}. Ikke rediger for hånd.", ""]

    # ── Stillingskategorier (220) ──
    st = hent(220, "220", {"tabell_id": 220, "api_versjon": 1, "statuslinje": "J", "kodetekst": "J", "desimal_separator": ".",
                          "variabler": ["Stillingskode", "Stillingsbenevnelse", "Stillingskategorikode"],
                          "filter": [{"variabel": "Stillingskode", "selection": {"filter": "all", "values": ["*"]}}]}, "220_stillingskoder.json")
    kat = {r["Stillingskode"]: r.get("Stillingskategorikode") or "" for r in st}
    forste = {r["Stillingskode"] for r in st if r.get("Stillingskategorikode") == "UN1" and FORSTE.search(r.get("Stillingsbenevnelse") or "")}
    if not kat:
        sys.exit("Fant ikke stillingskodene (DBH 220), verken fra DBH eller cachen. Avbryter.")

    # ── Oppslag av forløpernes koder: alle institusjoner som har rapportert 225 eller 373 i perioden ──
    register = collections.defaultdict(lambda: {"navn": set(), "225": set(), "373": set()})
    for tid in (225, 373):
        for r in hent(tid, "*", body(tid, "*", Y0, Y1, ["Institusjonskode", "Årstall"], kodetekst="J"), f"oppslag_{tid}.json"):
            k = r.get("Institusjonskode")
            if not k:
                continue
            for f, v in r.items():
                if f.lower().startswith("institusjonsnavn") and v:
                    register[k]["navn"].add(v)
            register[k][str(tid)].add(int(r["Årstall"]))
    rapport += ["## Forløpernes institusjonskoder", ""]
    if not register:
        rapport += ["**Oppslaget mot DBH ga ingen svar (mangler nettilgang?).** Forløpere uten fast kode i fusjoner.json er hoppet over.", ""]

    # ── Løs opp kodene ──
    for inst in fus["institusjoner"]:
        kort_kode = {inst["kort"]: inst["kode"], inst["kode"]: inst["kode"]}
        for f in inst["forlopere"]:
            f["_kode"], f["_status"] = f.get("kode"), "fast kode i fusjoner.json" if f.get("kode") else ""
            if not f["_kode"] and register:
                rx = re.compile(f["navnSok"], re.I)
                treff = sorted(k for k, v in register.items() if any(rx.search(n) for n in v["navn"]))
                if len(treff) == 1:
                    f["_kode"], f["_status"] = treff[0], "slått opp i DBH på navn"
                else:
                    f["_status"] = f"{len(treff)} treff på navnSok ({', '.join(treff) or 'ingen'}) – sett kode i fusjoner.json"
            elif not f["_kode"]:
                f["_status"] = "ikke slått opp (ingen svar fra DBH)"
            if f["_kode"]:
                kort_kode[f["kort"]] = f["_kode"]
            navn_dbh = "; ".join(sorted(register.get(f["_kode"], {}).get("navn", []))) if f["_kode"] else ""
            rapport.append(f"- {inst['kort']} ← **{f['kort']}** ({f['navn']}): kode {f['_kode'] or '–'} · {f['_status']}"
                           + (f" · DBH-navn: {navn_dbh}" if navn_dbh else ""))
        inst["_kort_kode"] = kort_kode
    rapport.append("")

    UT.mkdir(parents=True, exist_ok=True)
    indeks = []
    hent_alle = {}
    for inst in fus["institusjoner"]:
        T = inst["kode"]
        koder = [{"kode": T, "kort": inst["kort"], "navn": inst["navn"], "rolle": "dagens", "inn": None, "etterfolger": None}]
        for f in inst["forlopere"]:
            if f["_kode"]:
                koder.append({"kode": f["_kode"], "kort": f["kort"], "navn": f["navn"], "rolle": "forloper", "inn": f["inn"],
                              "etterfolger": inst["_kort_kode"].get(f["etterfolger"], f["etterfolger"]), "merknad": f.get("merknad")})
        kort_av = {k["kode"]: k["kort"] for k in koder}

        # ── Hent og summer per kode × avdeling × år ──
        data = {}   # kode → avd → år → verdi
        totalt = {}  # kode → år → verdi (institusjonsnivå)
        avdreg = {}
        for k in koder:
            c = k["kode"]
            if c not in hent_alle:
                hent_alle[c] = {
                    "225": hent(225, c, body(225, c, Y0, Y1, ["Årstall", "Avdelingskode", "Stillingskode"]), f"225_{c}.json"),
                    "373": hent(373, c, body(373, c, Y0, Y1, ["Årstall", "Avdelingskode"]), f"373_{c}.json"),
                    "374": hent(374, c, body(374, c, Y0, Y1, ["Årstall", "Avdelingskode", "Kvalitetsniva"]), f"374_{c}.json"),
                    "210": hent(210, c, body(210, c, Y0, Y1, variabler=["*"], years=False), f"210_{c}.json"),
                }
            r = hent_alle[c]
            avdreg[c] = Avdelinger(r["210"])
            d = collections.defaultdict(lambda: collections.defaultdict(tom))
            tot = collections.defaultdict(tom)
            for row in r["225"]:
                y = int(row["Årstall"]); avd = row.get("Avdelingskode") or "000000"
                v = d[avd][y]; aw = fl(row.get("Antall årsverk")); kk = kat.get(row.get("Stillingskode"), "")
                v["aw"] += aw; v["_t"] = 1
                if kk in ("UN1", "UN3", "UN4"):
                    v["fa"] += aw; v["kvf"] += fl(row.get("Antall kvinner"))
                elif kk == "UN2":
                    v["re"] += aw
                if row.get("Stillingskode") in forste:
                    v["fo"] += aw
            har_total = any(x.get("Avdelingskode") == "000000" for x in r["373"])
            for row in r["373"]:
                y = int(row["Årstall"]); avd = row.get("Avdelingskode") or "000000"
                tgt = tot[y] if (avd == "000000" and har_total) else d[avd][y]
                tgt["pu"] += fl(row.get("Antall publikasjoner")); tgt["pp"] += fl(row.get("Publiseringspoeng"))
                tgt["fd"] += fl(row.get("Forfatterandeler")); tgt["_p"] = 1
            for row in r["374"]:
                avd = row.get("Avdelingskode") or "000000"
                if avd == "000000" and har_total:
                    continue
                v = d[avd][int(row["Årstall"])]; p = fl(row.get("Publiseringspoeng"))
                v["p4"] += p; v["_n"] = 1
                if str(row.get("Kvalitetsniva")) == "2":
                    v["n2"] += p
            # Institusjonsnivå: tilsatte og nivå 2 summert over avdelinger; publisering fra totalraden der den finnes
            for avd, yrs in d.items():
                for y, v in yrs.items():
                    t = tot[y]
                    for m in TILSATT | NIVA:
                        t[m] += v[m]
                    t["_t"] |= v["_t"]; t["_n"] |= v["_n"]
                    if not har_total:
                        for m in PUBL:
                            t[m] += v[m]
                        t["_p"] |= v["_p"]
            for y, t in tot.items():
                if t["_p"] and not t["pp"] and not t["pu"]:
                    t["_p"] = 0  # 0 poeng og 0 publikasjoner = ikke rapportert (som i build-staff.py)
            data[c], totalt[c] = d, tot
            k["aar"] = sorted(y for y, v in tot.items() if v["_t"] or v["_p"])
            k["pubSumAvd"] = not har_total

        # ── Rapportert: institusjon, fakultet og avdeling per kode ──
        rap_inst = {c: serie(totalt[c]) for c in data}
        rap_fak, rap_avd = {}, {}
        for c, d in data.items():
            reg = avdreg[c]
            fk = collections.defaultdict(lambda: collections.defaultdict(tom))
            fk_aar = collections.defaultdict(set)
            av = {}
            for avd, yrs in d.items():
                for y, v in yrs.items():
                    per = reg.ved(avd, y)
                    fak = per["fak"] if per else avd[:3]
                    legg_til(fk[fak][y], v); fk_aar[fak].add(y)
                ps = reg.p.get(avd, [])
                av[avd] = {"navn": reg.navn(avd) or f"Avdeling {avd}",
                           "fak": (reg.ved(avd, max(yrs)) or {}).get("fak", avd[:3]),
                           "perioder": [{"fra": p["fra"], "til": p["til"], "fak": p["fak"], "navn": p["navn"]} for p in ps],
                           "aar": serie(yrs)}
            rap_fak[c] = {f: {"navn": reg.fak_navn(f) or f"Fakultet {f}", "aar": serie(v, pu=False)} for f, v in fk.items()}
            rap_avd[c] = av

        # ── Sammenlignbar serie i dagens struktur ──
        sist = max((y for y in totalt[T] if totalt[T][y]["_t"]), default=Y1)
        regT = avdreg[T]
        dagens = regT.gjeldende(sist)
        if not dagens:  # mangler 210-perioder: bruk avdelingene med årsverk siste år
            dagens = {avd: {"fak": avd[:3], "navn": "", "fakNavn": ""} for avd, yrs in data[T].items() if sist in yrs}
        dagens_fak = {x["fak"] for x in dagens.values()}
        navneindeks = collections.defaultdict(set)
        faknavnindeks = collections.defaultdict(set)
        for avd, x in dagens.items():
            if x.get("navn"):
                navneindeks[norm(x["navn"])].add(avd)
            if regT.fak_navn(x["fak"]):
                faknavnindeks[norm(regT.fak_navn(x["fak"]))].add(x["fak"])

        merknader = {}

        def koble(c, avd, y):
            """→ liste av (fakultet, avdeling|None, andel, regel). fakultet «ukoblet:<etikett>» når ingenting passer."""
            per = avdreg[c].ved(avd, y) or {"fak": avd[:3], "navn": "", "fakNavn": ""}
            manuelle = [m for m in kob if m.get("inst") == T and m.get("fra") in (c, kort_av.get(c))
                        and (m.get("fraAvd") == avd or (m.get("fraFak") and m.get("fraFak") == per["fak"] and not m.get("fraAvd")))]
            if any(m.get("fraAvd") == avd for m in manuelle):
                manuelle = [m for m in manuelle if m.get("fraAvd") == avd]
            if manuelle:
                ut = []
                for m in manuelle:
                    regel = "manuell (skjønn)" if m.get("skjonn") else "manuell"
                    if m.get("tilAvd"):
                        ut.append(((dagens.get(m["tilAvd"]) or {}).get("fak", m["tilAvd"][:3]), m["tilAvd"], float(m.get("andel", 1)), regel))
                    else:
                        ut.append((m.get("tilFak") or "ufordelt", None, float(m.get("andel", 1)), regel))
                    merknader[(c, avd, regel)] = m.get("merknad") or ""
                return ut
            if c == T and avd in dagens:
                return [(dagens[avd]["fak"], avd, 1.0, "samme kode")]
            if c == T and per["fak"] in dagens_fak:
                return [(per["fak"], None, 1.0, "samme fakultetskode")]
            treff = navneindeks.get(norm(per.get("navn"))) if per.get("navn") else None
            if treff and len(treff) == 1:
                t = next(iter(treff))
                return [(dagens[t]["fak"], t, 1.0, "samme navn")]
            fn = per.get("fakNavn") or avdreg[c].fak_navn(per["fak"])
            treff = faknavnindeks.get(norm(fn)) if fn else None
            if treff and len(treff) == 1:
                return [(next(iter(treff)), None, 1.0, "samme fakultetsnavn")]
            etikett = per.get("fakNavn") or avdreg[c].fak_navn(per["fak"]) or per.get("navn") or f"avdeling {avd}"
            return [(f"ukoblet:{kort_av.get(c, c)}: {etikett}", None, 1.0, "ikke koblet")]

        sm_inst = collections.defaultdict(tom)
        sm_fak = collections.defaultdict(lambda: collections.defaultdict(tom))
        sm_avd = collections.defaultdict(lambda: collections.defaultdict(tom))
        deler = collections.defaultdict(dict)  # år → kode → årsverk (hvem tallene kommer fra)
        regel_aw = collections.defaultdict(lambda: collections.defaultdict(float))  # år → regel → årsverk
        ukoblet = collections.defaultdict(lambda: collections.defaultdict(float))  # etikett → (kode, avd, navn) → årsverk
        # Hva hver dagens enhet bygger på, når det ikke er samme avdelingskode: enhet → (kilde, regel) → år
        bygger = collections.defaultdict(lambda: collections.defaultdict(set))
        utelatt = []
        for k in koder:
            c = k["kode"]
            for y, t in totalt[c].items():
                if k["inn"] is not None and y >= k["inn"]:
                    if t["_t"] or t["_p"]:
                        utelatt.append(f"{k['kort']} ({c}) rapporterer {y}, men er slått sammen fra {k['inn']}: holdt utenfor den sammenlignbare serien")
                    continue
                legg_til(sm_inst[y], t)
                deler[y][c] = round(t["aw"], 1) if t["_t"] else None
            for avd, yrs in data[c].items():
                for y, v in yrs.items():
                    if k["inn"] is not None and y >= k["inn"]:
                        continue
                    for fak, til, andel, regel in koble(c, avd, y):
                        legg_til(sm_fak[fak][y], v, andel)
                        if til:
                            legg_til(sm_avd[til][y], v, andel)
                        else:
                            legg_til(sm_avd[f"{fak}|ikke fordelt"][y], v, andel)
                        regel_aw[y][regel] += v["aw"] * andel
                        if regel != "samme kode":
                            per = avdreg[c].ved(avd, y) or {}
                            kilde_navn = f"{kort_av.get(c, c)}: {per.get('fakNavn') or avdreg[c].fak_navn(per.get('fak', '')) or avdreg[c].navn(avd, y) or avd}"
                            nokkel = (kilde_navn, regel, merknader.get((c, avd, regel), ""))
                            bygger[fak][nokkel].add(y)
                            bygger[til or f"{fak}|ikke fordelt"][(f"{kilde_navn} / {avdreg[c].navn(avd, y) or avd}", regel, nokkel[2])].add(y)
                        if fak.startswith("ukoblet:"):
                            ukoblet[fak[8:]][(c, avd, avdreg[c].navn(avd, y))] += v["aw"] * andel
        # Publikasjoner summert over flere koder teller felles publikasjoner flere ganger; merkes per år
        pu_dobbel = sorted(y for y, dl in deler.items() if len(dl) > 1)

        def fak_navn_dagens(f):
            if f.startswith("ukoblet:"):
                return f"Ikke koblet – {f[8:]}"
            if f == "ufordelt":
                return "Ufordelt"
            return regT.fak_navn(f) or f"Fakultet {f}"

        def bygger_ut(key):
            ut = [{"fra": n, "regel": r, "merknad": m or None, "aar": [min(ys), max(ys)]} for (n, r, m), ys in bygger.get(key, {}).items()]
            return sorted(ut, key=lambda x: (x["aar"][0], x["fra"]))

        sm_fak_ut = [{"id": f, "navn": fak_navn_dagens(f), "ukoblet": f.startswith("ukoblet:") or f == "ufordelt", "aar": serie(v, pu=False),
                      "bygger": bygger_ut(f)} for f, v in sm_fak.items()]
        sm_fak_ut.sort(key=lambda x: (x["ukoblet"], x["id"]))
        sm_avd_ut = []
        for key, v in sm_avd.items():
            if key.endswith("|ikke fordelt"):
                f = key.split("|")[0]
                navn = f"{fak_navn_dagens(f)}: ikke fordelt på institutt" if not f.startswith("ukoblet:") else fak_navn_dagens(f)
                sm_avd_ut.append({"id": key, "navn": navn, "fak": f, "ukoblet": True, "aar": serie(v), "bygger": bygger_ut(key)})
            else:
                sm_avd_ut.append({"id": key, "navn": (dagens.get(key) or {}).get("navn") or regT.navn(key) or f"Avdeling {key}",
                                  "fak": (dagens.get(key) or {}).get("fak", key[:3]), "ukoblet": False, "aar": serie(v), "bygger": bygger_ut(key)})
        sm_avd_ut.sort(key=lambda x: (x["fak"].startswith("ukoblet:"), x["fak"], x["ukoblet"], x["id"]))
        dekning = {str(y): round(100 * (1 - regel_aw[y].get("ikke koblet", 0) / sum(regel_aw[y].values())), 1)
                   for y in sorted(regel_aw) if sum(regel_aw[y].values())}

        # ── Hendelser: fra fusjoner.json + automatisk fra 210 (fakulteter opprettet/nedlagt) ──
        hendelser = [dict(h, kilde="fusjoner.json") for h in inst.get("hendelser", [])]
        for k in koder:
            c, reg = k["kode"], avdreg[k["kode"]]
            fak_per = collections.defaultdict(lambda: [99999, 0])
            for avd, ps in reg.p.items():
                for p in ps:
                    fp = fak_per[p["fak"]]; fp[0] = min(fp[0], p["fra"]); fp[1] = max(fp[1], p["til"])
            opp, ned = collections.defaultdict(list), collections.defaultdict(list)
            for fak, (fra, til) in fak_per.items():
                if Y0 < fra // 10 <= Y1 and (data[c] and min(min(y) for y in data[c].values() if y) < fra // 10):
                    opp[fra // 10].append(reg.fak_navn(fak) or fak)
                if Y0 <= til // 10 < Y1 and til != 99999:
                    ned[til // 10 + (1 if til % 10 == 3 else 0)].append(reg.fak_navn(fak) or fak)
            for y in sorted(set(opp) | set(ned)):
                o, n = sorted(set(opp.get(y, []))), sorted(set(ned.get(y, [])))
                deler_t = ([f"{len(o)} nye fakultetskoder"] if o else []) + ([f"{len(n)} avsluttet"] if n else [])
                hendelser.append({"aar": y, "type": "omorganisering", "kilde": "DBH 210",
                                  "tekst": f"{k['kort']}: {', '.join(deler_t)}",
                                  "detalj": ([f"Nye: {'; '.join(o)}"] if o else []) + ([f"Avsluttet: {'; '.join(n)}"] if n else [])})
        hendelser.sort(key=lambda h: (h["aar"], h["type"] != "fusjon"))

        ut = {
            "kode": T, "kort": inst["kort"], "navn": inst["navn"], "periode": [Y0, Y1], "mal": M,
            "kilde": inst.get("kilde"), "kildeKontrollert": inst.get("kildeKontrollert", True), "merknad": inst.get("merknad"),
            "koder": [{x: k.get(x) for x in ("kode", "kort", "navn", "rolle", "inn", "etterfolger", "merknad", "aar", "pubSumAvd")} for k in koder],
            "forloperUtenKode": [{"kort": f["kort"], "navn": f["navn"], "inn": f["inn"], "status": f["_status"]} for f in inst["forlopere"] if not f["_kode"]],
            "hendelser": hendelser,
            "rapportert": {"inst": rap_inst, "fak": rap_fak, "avd": rap_avd},
            "sammenlignbar": {"inst": serie(sm_inst), "deler": {str(y): v for y, v in sorted(deler.items())}, "puDobbel": pu_dobbel,
                              "fak": sm_fak_ut, "avd": sm_avd_ut, "dekning": dekning, "sisteAar": sist},
        }
        (UT / f"{T}.json").write_text(json.dumps(ut, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        aar_alle = sorted({y for k in koder for y in k["aar"]})
        indeks.append({"kode": T, "kort": inst["kort"], "navn": inst["navn"], "forlopere": [k["kort"] for k in koder[1:]],
                       "forloperUtenKode": [f["kort"] for f in inst["forlopere"] if not f["_kode"]],
                       "aar": [aar_alle[0], aar_alle[-1]] if aar_alle else None,
                       "fusjoner": sorted({h["aar"] for h in inst.get("hendelser", []) if h["type"] in ("fusjon", "kode")})})

        # ── Rapport per institusjon ──
        rapport += [f"## {inst['kort']} ({T})", ""]
        for k in koder:
            forventet = f", skal ha tall til og med {k['inn'] - 1}" if k["inn"] else ""
            ar = k["aar"]
            rapport.append(f"- {k['kort']} ({k['kode']}): tall for {ar[0]}–{ar[-1]}{forventet}" if ar else f"- {k['kort']} ({k['kode']}): ingen tall{forventet}")
            if k["inn"] and ar and ar[-1] != k["inn"] - 1:
                rapport.append(f"  - **Avvik:** siste år med tall er {ar[-1]}, ikke {k['inn'] - 1}. Sjekk «inn» i fusjoner.json.")
        rapport += [f"- {u}" for u in utelatt]
        for f in inst["forlopere"]:
            if not f["_kode"]:
                rapport.append(f"- **Forløper uten kode:** {f['kort']} ({f['navn']}): {f['_status']}. Den sammenlignbare serien mangler denne før {f['inn']}.")
        if pu_dobbel:
            rapport.append(f"- Antall publikasjoner er summert over flere koder i {pu_dobbel[0]}–{pu_dobbel[-1]}: felles publikasjoner telles flere ganger.")
        if dekning:
            lav = {y: d for y, d in dekning.items() if d < 99.5}
            rapport.append("- Andel årsverk koblet til dagens fakulteter: " + (", ".join(f"{y} {d} %" for y, d in lav.items()) if lav else "100 % alle år"))
        if ukoblet:
            rapport += ["", "  Ikke koblet (største først, årsverk summert over årene); legg koblinger i avdelingskobling.json:", ""]
            for etikett, enheter in sorted(ukoblet.items(), key=lambda kv: -sum(kv[1].values())):
                rapport.append(f"  - {etikett}: {sum(enheter.values()):.0f} årsverk")
                for (c, avd, nv), aw in sorted(enheter.items(), key=lambda kv: -kv[1])[:12]:
                    rapport.append(f"    - `{c}` / `{avd}` {nv or ''}: {aw:.0f}")
                if len(enheter) > 12:
                    rapport.append(f"    - … og {len(enheter) - 12} til")
        rapport.append("")

    # ── Datagrunnlag ──
    rapport += ["## Datagrunnlag per tabell og kode", "", "| Tabell | Kode | Kilde | År |", "|---|---|---|---|"]
    for tid, c, kilde, aar in hent.logg:
        rapport.append(f"| {tid} | {c} | {kilde} | {f'{aar[0]}–{aar[-1]}' if aar else '–'} |")
    rapport.append("")
    RAPPORT.write_text("\n".join(rapport), encoding="utf-8")

    kilder_brukt = sorted({k for _, _, k, _ in hent.logg})
    (UT / "index.json").write_text(json.dumps({
        "hentet": dt.date.today().isoformat(), "periode": [Y0, Y1], "mal": M, "datakilder": kilder_brukt,
        "nett": any(k == "DBH" for k in kilder_brukt),
        "institusjoner": sorted(indeks, key=lambda x: (x["kode"] != "1173", x["kort"])),
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(indeks)} institusjoner → {UT.relative_to(ROOT)}; datakilder: {', '.join(kilder_brukt)}. Rapport: {RAPPORT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
