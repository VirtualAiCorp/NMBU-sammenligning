#!/usr/bin/env python3
"""Siteringsmål fra OpenAlex for den interne rangeringen (fanen «Siteringer» og kartet). Uavhengig av tidsskriftlister.

OpenAlex (https://openalex.org, data CC0). Uten API-nøkkel og uten e-postadresse: OpenAlex gir 1 000 kreditter per døgn
uten nøkkel (oktober 2026). Et listekall koster 1 kreditt, et søk (`.search`) 10, enkeltoppslag (/works/doi:…,
/sources/issn:…) 0. Skriptet leser `x-ratelimit-remaining` og stopper før reserven (--reserve) er brukt opp, så det kan
kjøres videre neste døgn (cachen husker det som er hentet). Bare feltene vi trenger hentes (`select=`). Forfatternavn
lagres aldri: for enheter som avgrenses på tilknytningstekst hentes `authorships`, men bare et ja/nei per verk
(«enheten står i tilknytningen») og to antall (`bare`, `annen`) lagres, aldri tilknytningsteksten.

Tre deler:
  norge    NVA-artiklene med DOI (data/rangering/openalex/nva-doi/, scripts/rangering/hent_nva_doi.py) slås opp i
           OpenAlex i bunter på 100 DOI-er (filter=doi:a|b|…). Cache: openalex/norge-doi.json {doi: mål | null}.
  tittel   NVA-artikler uten DOI: tidsskriftet slås opp på ISSN (gratis enkeltoppslag), og alle verk i tidsskriftet i de
           aktuelle årene hentes (filter=primary_location.source.id, opptil 25 små tidsskrift per kall). Treff bare når
           normalisert tittel er lik, året er ±1 og treffet er entydig (gjøres i sitering.py). Bare tidsskrift med
           høyst --maks-verk verk i perioden, de med flest artikler uten DOI først, til --maks-kall er brukt.
           Cache: openalex/tittel/<kilde-id>.json.
  norden   Enhetene i data/rangering/openalex/enheter-norden.json (Danmark, Sverige, Finland) og enheter-norge.json (Norge,
           samme metode, til artikkeltelling på tvers av land og kontroll mot NVA), per år. --land no,dk,se,fi velger land.
           Cache: openalex/norden/<enhet>/<år>.json. Hentes nyeste år først. Enheter med samme filter (NTNU og NTNU HH)
           hentes én gang. Tekstenheter: `enhet` = mønstertreff, `bare`/`annen` = antall forfattere ved
           foreldreinstitusjonen med bare universitetsnavnet / med en annen underenhet (bare tall, ingen tekst); hvilke verk
           som hører til enheten, avgjøres ved lesing med i_enheten() (mønstertreff + «bare-regelen», se BARE_FELT).

Per verk lagres: OpenAlex-id (bare i cachen), år, type, fwci, citation_normalized_percentile (verdi, topp 10 %, topp 1 %),
cited_by_count og underfelt (primary_topic). I `norden` også DOI (`doi`), tidsskrift som OpenAlex-kilde (`kilde`, «S…»,
fra primary_location.source) og `issn_l`, så artiklene kan settes på AJG-nivå per tidsskrift. Eldre cachefiler uten
`kilde`/`doi`/`bare`/`annen` kan fortsatt leses (sitering.py og i_enheten() bruker bare feltene som finnes). Ut av cachen
går bare aggregater per enhet og år (sitering.py, openalex_mot_nva.py).

Bruk:
  python3 scripts/rangering/hent_openalex.py norge
  python3 scripts/rangering/hent_openalex.py tittel [--maks-kall 60]
  python3 scripts/rangering/hent_openalex.py norden [--land no] [--enhet se_lund] [--fra 2016] [--til 2025] [--refresh]
  python3 scripts/rangering/hent_openalex.py kreditt         # viser gjenstående kreditter (koster 1)
"""
import argparse
import collections
import http.client
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RANG = ROOT / "data" / "rangering"
OA = RANG / "openalex"
API = "https://api.openalex.org"
UA = "NMBU-sammenligning (intern rangering, siteringsmaal)"  # ingen e-postadresse
MAAL = "id,doi,publication_year,type,fwci,citation_normalized_percentile,cited_by_count"
PAUSE = 1.1  # sekunder mellom kall (høflig, og OpenAlex svarte 429 ved raske kall i tidligere test)


def api_nokkel():
    """OpenAlex-nøkkel fra miljøvariabelen OPENALEX_API_KEY eller linja OPENALEX_API_KEY=… i kilde/.env.local
    (gitignored). Uten nøkkel: delt gratiskvote (1 000 kreditter per døgn per IP, ingen cursor-paging forbi side 1).
    Med gratis nøkkel: egen kvote (1 USD per døgn ≈ 10 000 kreditter). Nøkkelen skrives aldri ut eller lagres i cachen."""
    if os.environ.get("OPENALEX_API_KEY"):
        return os.environ["OPENALEX_API_KEY"].strip()
    env = ROOT / "kilde" / ".env.local"
    for linje in env.read_text(encoding="utf-8").splitlines() if env.exists() else []:
        if linje.startswith("OPENALEX_API_KEY="):
            return linje.split("=", 1)[1].strip().strip('"') or None
    return None


def uten_nokkel(url):
    return re.sub(r"([?&]api_key=)[^&]*", r"\1…", url)


class TomForKreditt(Exception):
    pass


class Klient:
    def __init__(self, reserve):
        self.reserve = reserve
        self.igjen = None
        self.brukt = 0
        self.nokkel = api_nokkel()
        print("OpenAlex: med API-nøkkel (egen kvote)." if self.nokkel else "OpenAlex: uten API-nøkkel (delt gratiskvote).")

    def hent(self, sti, params=None, kost=1):
        if self.igjen is not None and self.igjen - kost < self.reserve:
            raise TomForKreditt(f"{self.igjen} kreditter igjen (reserve {self.reserve})")
        params = {**(params or {}), **({"api_key": self.nokkel} if self.nokkel else {})}
        url = API + sti + ("?" + urllib.parse.urlencode(params, safe=":|,/") if params else "")
        for forsok in range(5):
            try:
                req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": UA})
                with urllib.request.urlopen(req, timeout=90) as r:
                    rest = r.headers.get("x-ratelimit-remaining")
                    if rest is not None:
                        self.igjen = int(rest)
                    self.brukt += int(r.headers.get("x-ratelimit-credits-used") or 0)
                    data = json.load(r)
                time.sleep(PAUSE)
                return data
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    time.sleep(PAUSE)
                    return None
                if e.code in (401, 402, 403):
                    raise SystemExit(f"OpenAlex svarte {e.code} ({uten_nokkel(url)[:160]}): "
                                     + ("sjekk at OPENALEX_API_KEY er riktig og aktivert (lenken i e-posten)." if self.nokkel else "API-et krever trolig nøkkel for dette (se api_nokkel()).") + " Stopper.")
                if e.code == 429:
                    vent = int(e.headers.get("Retry-After") or 0)
                    rest = e.headers.get("x-ratelimit-remaining")
                    if rest is not None and int(rest) <= 0 or vent > 120:
                        raise TomForKreditt(f"429 og tom kvote (Retry-After {vent} s)")
                    time.sleep(max(vent, 5 * (forsok + 1)))
                    continue
                if forsok == 4:
                    raise
                time.sleep(3 * (forsok + 1))
            except (urllib.error.URLError, TimeoutError, http.client.HTTPException, ConnectionError):
                if forsok == 4:
                    raise
                time.sleep(3 * (forsok + 1))
        raise RuntimeError("for mange forsøk")


def kort_id(u):
    return (u or "").rsplit("/", 1)[-1] or None


def maal_av(w):
    """Det vi lagrer per verk (ingen navn)."""
    p = w.get("citation_normalized_percentile") or {}
    return {"oa": kort_id(w.get("id")), "aar": w.get("publication_year"), "type": w.get("type"),
            "fwci": w.get("fwci"), "pct": p.get("value"), "t10": p.get("is_in_top_10_percent"),
            "t1": p.get("is_in_top_1_percent"), "sit": w.get("cited_by_count")}


def norm_doi(d):
    d = re.sub(r"^(https?://)?(dx\.)?doi\.org/", "", str(d or "").strip(), flags=re.I).lower()
    return d or None


def les_json(f, standard):
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else standard


def skriv_json(f, obj):
    f.parent.mkdir(parents=True, exist_ok=True)
    tmp = f.with_suffix(".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    tmp.replace(f)


# ── Norge: DOI-oppslag i bunter ─────────────────────────────────────────────
def nva_doi():
    """Alle DOI-er i NVA-DOI-cachen (unike)."""
    ut = set()
    for f in sorted((OA / "nva-doi").glob("*/*.json")):
        ut |= {d for d in json.loads(f.read_text(encoding="utf-8"))["doi"].values() if d}
    return ut


def kjor_norge(k, a):
    f = OA / "norge-doi.json"
    cache = les_json(f, {"hentet": None, "doi": {}})
    alle = sorted(nva_doi())
    mangler = [d for d in alle if d not in cache["doi"]]
    # DOI-er med tegn som bryter filtersyntaksen (komma, |) slås opp enkeltvis (gratis enkeltoppslag)
    rare = [d for d in mangler if re.search(r"[,|\s]", d)]
    vanlige = [d for d in mangler if d not in rare]
    print(f"Norge: {len(alle)} unike DOI-er, {len(mangler)} ikke slått opp ennå ({len(rare)} enkeltvis).")
    try:
        for i in range(0, len(vanlige), 100):
            bunt = vanlige[i:i + 100]
            d = k.hent("/works", {"filter": "doi:" + "|".join(bunt), "select": MAAL, "per-page": 200})
            funnet = {}
            for w in (d or {}).get("results", []):
                funnet[norm_doi(w.get("doi"))] = maal_av(w)
            for x in bunt:
                cache["doi"][x] = funnet.get(x)
            if (i // 100) % 10 == 0:
                cache["hentet"] = time.strftime("%Y-%m-%d"); skriv_json(f, cache)
                print(f"  {i + len(bunt)}/{len(vanlige)}  treff i bunten {len(funnet)}/{len(bunt)}  kreditter igjen {k.igjen}")
        for x in rare:
            w = k.hent("/works/doi:" + urllib.parse.quote(x, safe="/:"), {"select": MAAL}, kost=0)
            cache["doi"][x] = maal_av(w) if w else None
    except TomForKreditt as e:
        print("Stopper:", e)
    cache["hentet"] = time.strftime("%Y-%m-%d"); skriv_json(f, cache)
    n = sum(1 for v in cache["doi"].values() if v)
    print(f"Norge: {n} av {len(cache['doi'])} DOI-er funnet i OpenAlex. Kreditter brukt {k.brukt}, igjen {k.igjen}.")


# ── Norge: tittel + ISSN + år for artikler uten DOI ─────────────────────────
def uten_doi():
    """(issn-liste, år, tittel) for NVA-artikler uten DOI, unike på NVA-id."""
    sett, ut = set(), []
    for f in sorted((RANG / "nva").glob("*/*.json")):
        d = json.loads(f.read_text(encoding="utf-8"))
        g = OA / "nva-doi" / d["skole"] / f"{d['aar']}.json"
        dd = json.loads(g.read_text(encoding="utf-8"))["doi"] if g.exists() else {}
        for x in d["artikler"]:
            if dd.get(x["id"]) or x["id"] in sett:
                continue
            sett.add(x["id"])
            iss = [i for i in (x.get("issn"), x.get("eissn")) if i]
            if iss:
                ut.append((iss, int(d["aar"]), x.get("tittel") or ""))
    return ut


def kjor_tittel(k, a):
    kilder_f = OA / "tittel" / "_kilder.json"
    kilder = les_json(kilder_f, {})  # issn → {id, verk} | null
    art = uten_doi()
    per_issn = collections.Counter()
    aar_per = collections.defaultdict(set)
    for iss, aar, _ in art:
        per_issn[iss[0]] += 1
        for i in iss:
            aar_per[i].add(aar)
    # Slå opp tidsskriftene (gratis enkeltoppslag) for alle ISSN med minst --min artikler uten DOI
    kand = [i for i, n in per_issn.most_common() if n >= a.min]
    alle_issn = {i for iss, _, _ in art for i in iss if any(j in kand for j in iss)}
    for i in sorted(alle_issn):
        if i in kilder:
            continue
        s = k.hent("/sources/issn:" + i, {"select": "id,display_name,works_count,counts_by_year"}, kost=0)
        kilder[i] = None if not s else {"id": kort_id(s.get("id")),
                                        "aar": {str(c["year"]): c["works_count"] for c in s.get("counts_by_year") or []},
                                        "verk": s.get("works_count")}
        if len(kilder) % 25 == 0:
            skriv_json(kilder_f, kilder)
    skriv_json(kilder_f, kilder)
    # Velg kilder: minst én artikkel uten DOI, og høyst --maks-verk verk i årene vi trenger
    valgt = {}
    for iss, aar, _ in art:
        for i in iss:
            s = kilder.get(i)
            if not s:
                continue
            ar = sorted(aar_per[iss[0]] | aar_per[i])
            fra, til = min(ar) - 1, max(ar) + 1
            volum = sum(v for y, v in s["aar"].items() if fra <= int(y) <= til) if s["aar"] else s["verk"] or 0
            if volum <= a.maks_verk:
                v = valgt.setdefault(s["id"], {"n": 0, "fra": fra, "til": til, "volum": volum})
                v["n"] += 1; v["fra"] = min(v["fra"], fra); v["til"] = max(v["til"], til)
            break
    rekke = sorted(((sid, v) for sid, v in valgt.items() if not (OA / "tittel" / f"{sid}.json").exists()), key=lambda x: -x[1]["n"])
    print(f"Tittel: {len(art)} artikler uten DOI med ISSN, {len(kand)} ISSN med minst {a.min}, {len(valgt)} tidsskrift i OpenAlex "
          f"med høyst {a.maks_verk} verk; {len(rekke)} ikke hentet ennå.")
    kall = 0
    try:
        # Små tidsskrift samles i ett kall (opptil 25 kilder og ~600 verk), store hentes for seg
        i = 0
        while i < len(rekke) and kall < a.maks_kall:
            bunt, sum_v = [], 0
            while i < len(rekke) and len(bunt) < 25 and (not bunt or sum_v + rekke[i][1]["volum"] <= 600):
                bunt.append(rekke[i]); sum_v += rekke[i][1]["volum"]; i += 1
            fra = min(v["fra"] for _, v in bunt); til = max(v["til"] for _, v in bunt)
            per = collections.defaultdict(list)
            cur = "*"
            while cur and kall < a.maks_kall + 5:
                d = k.hent("/works", {"filter": f"primary_location.source.id:{'|'.join(s for s, _ in bunt)},publication_year:{fra}-{til}",
                                      "select": MAAL + ",title,primary_location", "per-page": 200, "cursor": cur})
                kall += 1
                for w in (d or {}).get("results", []):
                    src = kort_id(((w.get("primary_location") or {}).get("source") or {}).get("id"))
                    per[src].append({**maal_av(w), "tittel": (w.get("title") or "")[:300], "doi": norm_doi(w.get("doi"))})
                cur = (d or {}).get("meta", {}).get("next_cursor")
            for sid, _ in bunt:
                skriv_json(OA / "tittel" / f"{sid}.json", {"hentet": time.strftime("%Y-%m-%d"), "fra": fra, "til": til, "verk": per.get(sid, [])})
            print(f"  {len(bunt)} tidsskrift {fra}–{til}: {sum(len(per.get(s, [])) for s, _ in bunt)} verk; kreditter igjen {k.igjen}")
    except TomForKreditt as e:
        print("Stopper:", e)
    print(f"Tittel: {kall} kall. Kreditter brukt {k.brukt}, igjen {k.igjen}.")


# ── Norden: per enhet og år ─────────────────────────────────────────────────
# Organisasjonsord: står ett av disse igjen i en tilknytningstekst når universitetsnavnet er tatt bort, nevner teksten en
# underenhet (fakultet, institutt, senter, sykehus osv.). Står ingen igjen, er teksten «bare universitetsnavnet» (`bare`).
ORGORD = re.compile(r"\b(facult|fakultet|department|dept\b|depart|institut|school|sch\b|centre|center|cent\b|senter|division|"
                    r"unit\b|section|sektion|seksjon|avdeling|avdelning|afdeling|centrum|laborator|lab\b|labs\b|group|gruppe|program|college|hospital|sykehus|"
                    r"klinik|clinic|museum|librar|bibliotek|office|research|forsk|studies|academy|akademi|handels|business|"
                    r"economics|management|science|engineering|medicin|nursing|health|helse|chair|graduate|ministry|"
                    r"directorate|agency|association|foundation|stiftelse|council|board)",
                    re.I)
# Regelen for tilknytninger med bare universitetsnavnet («bare-regelen», samme for alle land; se README og
# data/rangering/inspirasjon/openalex-norden-artikler.md). Et verk telles med i en tekstenhet uten mønstertreff hvis
#   1. minst én forfatter ved foreldreinstitusjonen bare har universitetsnavnet (`bare` > 0),
#   2. ingen forfatter der nevner en annen underenhet (`annen` = 0),
#   3. verket har primærfagfelt 14 (Business, Management and Accounting) eller 20 (Economics, Econometrics and Finance), og
#   4. enheten eier fagfeltene ved foreldreinstitusjonen: blant foreldreinstitusjonens verk i felt 14/20 der en underenhet
#      kan leses (mønstertreff eller annen underenhet), 2016–2025, er minst BARE_TERSKEL enhetens (bare_andel()).
# Punkt 4 gjør at regelen ikke brukes der flere fagmiljøer deler feltene (NTNU HH ved siden av samfunnsøkonomi og IØT,
# OsloMet med NOVA/AFI/SIFO osv.). `enhet` i cachen er alltid bare mønstertreffet; regelen brukes ved lesing (i_enheten()).
BARE_FELT = (14, 20)
BARE_TERSKEL = 0.60
BARE_REGEL = True
_BARE_ANDEL = {}


def foreldre_ider(e):
    return [x for x in e["openalex"].split("|") if x]


def _forelder_tekst(raa, s, forel):
    return len(raa) == 1 or not forel or forel.search(s)


def klassifiser(w, e):
    """(enhet, bare, annen) for et verk i en tekstenhet. enhet: en forfatter ved foreldreinstitusjonen har en rå
    tilknytningstekst som passer `monster` (og ikke `unntak`). bare: antall slike forfattere uten treff som bare har
    universitetsnavnet (`uninavn`, ellers `foreldre`) og ingen organisasjonsord. annen: antall forfattere ved
    foreldreinstitusjonen som verken treffer eller har bare universitetsnavnet (en annen underenhet står i teksten).
    Navn leses ikke og lagres ikke."""
    mon = re.compile(e["monster"], re.I)
    unn = re.compile(e["unntak"], re.I) if e.get("unntak") else None
    forel = re.compile(e["foreldre"], re.I) if e.get("foreldre") else None
    uni = re.compile(e.get("uninavn") or e.get("foreldre") or "$^", re.I)
    pid = {API.replace("api.", "") + "/" + i for i in foreldre_ider(e)}
    treff, bare, annen = False, 0, 0
    for au in w.get("authorships") or []:
        ved = any(pid & set(i.get("lineage") or []) or i.get("id") in pid for i in au.get("institutions") or [])
        if not ved:
            continue
        raa = au.get("raw_affiliation_strings") or []
        relevante = [s for s in raa if _forelder_tekst(raa, s, forel)]
        if any(mon.search(s) and not (unn and unn.search(s)) for s in relevante):
            treff = True
        elif any(uni.search(s) and not ORGORD.search(uni.sub(" ", s)) for s in relevante):
            bare += 1
        elif relevante:
            annen += 1
    return treff, bare, annen


def enhet_treff(w, e):
    """Står enheten i tilknytningsteksten til en forfatter ved foreldreinstitusjonen? (Navn leses ikke og lagres ikke.)"""
    return klassifiser(w, e)[0]


def bare_andel(e):
    """Andelen av foreldreinstitusjonens verk i BARE_FELT med lesbar underenhet som er enhetens (fra cachen, 2016–2025).
    None hvis cachen mangler `annen` (eldre cache) eller ikke finnes."""
    if e["id"] not in _BARE_ANDEL:
        treff = andre = 0
        gammel = False
        for f in (OA / "norden" / e["id"]).glob("*.json"):
            for w in json.loads(f.read_text(encoding="utf-8"))["verk"]:
                if (w.get("uf") or 0) // 100 not in BARE_FELT:
                    continue
                if "annen" not in w:
                    gammel = True
                treff += bool(w.get("enhet"))
                andre += bool(not w.get("enhet") and w.get("annen"))
        _BARE_ANDEL[e["id"]] = None if gammel or not (treff + andre) else treff / (treff + andre)
    return _BARE_ANDEL[e["id"]]


def i_enheten(w, e, regel=None):
    """Hører et lagret verk (fra cachen) til enheten? Tekstenheter: mønstertreff (`enhet`), eller bare-regelen (se
    BARE_FELT/BARE_TERSKEL over; regel=False slår den av). Fagenheter: ikke i `utenUnderfelt`. Institusjon: alltid.
    Gamle cachefiler uten `bare`/`annen` gir bare mønstertreffet."""
    regel = BARE_REGEL if regel is None else regel
    if e["metode"] == "tekst":
        if w.get("enhet"):
            return True
        if not regel or not (w.get("bare") or 0) or (w.get("annen") or 0) or (w.get("uf") or 0) // 100 not in BARE_FELT:
            return False
        andel = bare_andel(e)
        return andel is not None and andel >= BARE_TERSKEL
    if e["metode"] == "fag":
        return w.get("uf") not in (e.get("utenUnderfelt") or [])
    return True


def enheter(land=None):
    """Alle enheter: enheter-norden.json (Danmark, Sverige, Finland) + enheter-norge.json (Norge), med `land`."""
    ut = []
    for fil, standard in (("enheter-norden.json", None), ("enheter-norge.json", "no")):
        f = OA / fil
        for e in (json.loads(f.read_text(encoding="utf-8"))["enheter"] if f.exists() else []):
            e = {**e, "land": e.get("land") or standard or e["id"].split("_", 1)[0]}
            if land is None or e["land"] in land:
                ut.append(e)
    return ut


def kjor_norden(k, a):
    cfg = enheter(a.land.split(",") if a.land else None)
    if a.enhet:
        cfg = [e for e in cfg if e["id"] in a.enhet.split(",")]
    aar = list(range(a.til, a.fra - 1, -1))
    minne = {}  # filter → rå verk, så enheter med samme foreldreinstitusjon og fagfelt (NTNU, NTNU HH) hentes én gang
    try:
        for y in aar:  # nyeste år først for alle enheter, så eldre (stopper kreditten, er de viktigste årene hentet)
            for e in cfg:
                f = OA / "norden" / e["id"] / f"{y}.json"
                if f.exists() and not a.refresh:
                    continue
                filt = [f"authorships.institutions.lineage:{'|'.join(foreldre_ider(e))}", f"publication_year:{y}",
                        "type:article|review"]
                if e.get("felt"):
                    filt.append("primary_topic.field.id:" + "|".join(str(x) for x in e["felt"]))
                sel = MAAL + ",primary_topic,primary_location" + (",authorships" if e["metode"] == "tekst" else "")
                nokkel = (",".join(filt), e["metode"] == "tekst")
                sider = 0
                if nokkel not in minne:
                    raa_verk, cur = [], "*"
                    while cur:
                        d = k.hent("/works", {"filter": nokkel[0], "select": sel, "per-page": 200, "cursor": cur})
                        sider += 1
                        raa_verk += (d or {}).get("results", [])
                        cur = (d or {}).get("meta", {}).get("next_cursor") if (d or {}).get("results") else None
                    minne.clear()  # bare siste filter holdes i minnet (enhetene med samme forelder står etter hverandre)
                    minne[nokkel] = raa_verk
                verk = []
                for w in minne[nokkel]:
                    m = maal_av(w)
                    pt = w.get("primary_topic") or {}
                    m["uf"] = int(kort_id((pt.get("subfield") or {}).get("id")) or 0) or None
                    src = (w.get("primary_location") or {}).get("source") or {}
                    m["doi"] = norm_doi(w.get("doi"))
                    m["kilde"] = kort_id(src.get("id"))
                    m["issn_l"] = src.get("issn_l")
                    if e["metode"] == "tekst":
                        m["enhet"], m["bare"], m["annen"] = klassifiser(w, e)
                    verk.append(m)
                skriv_json(f, {"enhet": e["id"], "aar": y, "hentet": time.strftime("%Y-%m-%d"), "metode": e["metode"],
                               "filter": nokkel[0], "verk": verk})
                treff = sum(1 for v in verk if i_enheten(v, e)) if e["metode"] != "institusjon" else len(verk)
                print(f"  {e['id']} {y}: {len(verk)} verk hentet ({sider} sider), {treff} i enheten; kreditter igjen {k.igjen}")
    except TomForKreditt as e:
        print("Stopper:", e)
    print(f"Norden: kreditter brukt {k.brukt}, igjen {k.igjen}.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("del_", choices=["norge", "tittel", "norden", "kreditt"])
    ap.add_argument("--reserve", type=int, default=40, help="stopp når så mange kreditter er igjen")
    ap.add_argument("--maks-kall", type=int, default=60)
    ap.add_argument("--maks-verk", type=int, default=1500, help="tittel: største tidsskrift (verk i perioden)")
    ap.add_argument("--min", type=int, default=1, help="tittel: minste antall artikler uten DOI per ISSN")
    ap.add_argument("--enhet")
    ap.add_argument("--land", help="norden: bare disse landene (no,dk,se,fi)")
    ap.add_argument("--fra", type=int, default=2016)
    ap.add_argument("--til", type=int, default=2025)
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    k = Klient(a.reserve)
    if a.del_ == "kreditt":
        k.hent("/works", {"filter": "publication_year:2024", "select": "id", "per-page": 1})
        print("Kreditter igjen i dag:", k.igjen)
        return
    {"norge": kjor_norge, "tittel": kjor_tittel, "norden": kjor_norden}[a.del_](k, a)


if __name__ == "__main__":
    sys.exit(main())
