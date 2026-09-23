#!/usr/bin/env python3
"""
build-studiebarometer.py

Henter Studiebarometeret-resultater (studiebarometeret.no) for alle
studieprogrammer i data/<fakultet>/dbh-programkart.json og skriver:
  1. data/<fakultet>/kilder/studiebarometer/<entryId>.json  (rådata-mellomlager)
  2. data/<fakultet>/studiebarometer.json                    (samlet JSON)
  3. kilde/src/app/data/<fakultet>StudiebarometerData.ts     (TS-modul)

Nettsted-struktur (verifisert manuelt 22.09.2026):
  - Hovedside  /no/student/studieprogram/<inst>_<kode>            (siste år)
      <div id="compare-page" data-props='…HTML-escapet JSON…'>
      comparison.categories[8] (Undervisning … Helhetsvurdering), hver med
      programs[0] = programmet selv (scores[0].value, isSufficient) og
      programs[1].id == "index-avg" (feltgjennomsnitt, location = «Av alle …»).
      header.programs[0].info[] har fritekst-linjer: «Antall respondenter: N
      (R %)», «Tallene er fra ÅÅÅÅ», og ev. warning/help ved få svar
      («NB: få svarende»). Feltene kan stå i enten .label eller .text.
  - /tidsserie  – SAMME data-props-format, men scores[] har ett element per
      år (meterLabel = årstall som streng), typisk 2022–2025 (ikke alltid
      2021 – siden starter tydeligvis der dataene finnes).
  - /detaljer   – IKKE data-props/JSON (avvik fra det som var antatt kjent
      ved oppstart av dette skriptet) – underspørsmålene ligger i statisk
      HTML, i to <table>: «Overordnet tilfredshet» (→ helhetsvurdering) og
      «Indekser i detalj» (→ de 7 andre dimensjonene, seksjonert med
      <tr class="section_header">). Skriptet parser disse med regex.
  - Ugyldig inst_kode-kombinasjon gir IKKE HTTP 404, men 302-redirect til
      forsiden («/»). Skriptet behandler enhver ikke-200-status, eller en
      200-side uten compare-page/riktig id, som "ikke funnet".

Bruk:
    python3 scripts/build-studiebarometer.py landsam
    python3 scripts/build-studiebarometer.py realtek --refresh

Kun standardbibliotek. SSL: prøver ssl.create_default_context(cafile=…),
faller tilbake på curl via subprocess (macOS python.org-installasjoner
mangler ofte et fylt CA-lager, og cert-verifiseringen feiler selv med
/etc/ssl/cert.pem — se _fetch()).
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import ssl
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent

BASE = "https://www.studiebarometeret.no"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.0 Safari/605.1.15")
SLEEP_S = 0.5
HTTP_TIMEOUT = 20

_CA_BUNDLES = ["/etc/ssl/cert.pem", "/etc/ssl/certs/ca-certificates.crt"]

# ─── Dimensjoner ──────────────────────────────────────────────────────────

DIMENSIONS = [
    "undervisning", "tilbakemeldinger", "vurderingsformer", "laeringsmiljo",
    "organisering", "yrkesrelevans", "engasjement", "helhetsvurdering",
]

DIMENSION_LABELS = {
    "undervisning": "Undervisning",
    "tilbakemeldinger": "Tilbakemeldinger",
    "vurderingsformer": "Vurderingsformer",
    "laeringsmiljo": "Læringsmiljø",
    "organisering": "Organisering",
    "yrkesrelevans": "Tilknytning til yrkeslivet",
    "engasjement": "Eget engasjement",
    "helhetsvurdering": "Helhetsvurdering",
}

# Navn i comparison.categories[].name (hovedside/tidsserie) -> dimensjonsnøkkel
CATEGORY_NAME_TO_DIM = {v: k for k, v in DIMENSION_LABELS.items()}

# Overskrifter i /detaljer «Indekser i detalj» + «Overordnet tilfredshet»
DETAIL_SECTION_TO_DIM = dict(CATEGORY_NAME_TO_DIM)
DETAIL_SECTION_TO_DIM["Overordnet tilfredshet"] = "helhetsvurdering"


def empty_scores() -> dict:
    return {d: None for d in DIMENSIONS}


# ─── Nettverk ─────────────────────────────────────────────────────────────

def _fetch_urllib(url: str) -> tuple[int, str] | None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        try:
            with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as r:
                return r.status, r.read().decode("utf-8", errors="replace")
        except urllib.error.URLError as e:
            if isinstance(e.reason, ssl.SSLCertVerificationError) or "CERTIFICATE_VERIFY_FAILED" in str(e):
                for bundle in _CA_BUNDLES:
                    if os.path.exists(bundle):
                        ctx = ssl.create_default_context(cafile=bundle)
                        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT, context=ctx) as r:
                            return r.status, r.read().decode("utf-8", errors="replace")
            raise
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")
    except Exception:
        return None


def _fetch_curl(url: str) -> tuple[int, str] | None:
    fd, tmp_path = tempfile.mkstemp(prefix="sb_", suffix=".html")
    os.close(fd)
    try:
        result = subprocess.run(
            ["curl", "-sS", "--max-time", str(HTTP_TIMEOUT), "-A", UA,
             "-o", tmp_path, "-w", "%{http_code}", url],
            capture_output=True, text=True,
        )
        code_str = (result.stdout or "").strip()
        code = int(code_str) if code_str.isdigit() else 0
        with open(tmp_path, "r", encoding="utf-8", errors="replace") as f:
            body = f.read()
        return code, body
    except Exception:
        return None
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


def fetch(url: str) -> tuple[int, str]:
    """GET uten å følge redirects. Prøver urllib (via ssl-cafile) først,
    faller tilbake på curl (subprocess) hvis urllib feiler av SSL-grunner."""
    r = _fetch_urllib(url)
    if r is None:
        r = _fetch_curl(url)
    if r is None:
        return 0, ""
    return r


# ─── Parsing av data-props (hovedside / tidsserie) ────────────────────────

COMPARE_PROPS_RE = re.compile(r"<div id=\"compare-page\" data-props='(.*?)'>", re.S)


def parse_compare_props(body: str) -> dict | None:
    m = COMPARE_PROPS_RE.search(body)
    if not m:
        return None
    raw = html.unescape(m.group(1))
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def parse_no_number(s: str | None) -> float | None:
    if s is None:
        return None
    s = s.strip()
    if not s or s == "-":
        return None
    try:
        return round(float(s.replace(",", ".")), 1)
    except ValueError:
        return None


def parse_no_int(s: str | None) -> int | None:
    if s is None:
        return None
    s = s.strip().replace("\xa0", "").replace(" ", "")
    if not s:
        return None
    try:
        return int(s)
    except ValueError:
        return None


# ─── Én kandidat (inst, kode) → forsøk å finne et gyldig sbId ─────────────

def try_fetch_main_by_id(sb_id: str) -> tuple[str, dict] | None:
    """Henter https://.../studieprogram/<sbId> og sjekker at siden faktisk
    svarer med dette programmet (302->'/' ved ugyldig id gir ikke treff her,
    men sjekken dobbeltsjekker uansett kilde)."""
    url = f"{BASE}/no/student/studieprogram/{urllib.parse.quote(sb_id)}"
    status, body = fetch(url)
    time.sleep(SLEEP_S)
    if status != 200:
        return None
    data = parse_compare_props(body)
    if not data:
        return None
    comp = data.get("comparison") or {}
    cats = comp.get("categories") or []
    if not cats:
        return None
    first_prog = (cats[0].get("programs") or [{}])[0]
    if str(first_prog.get("id", "")).lower() != sb_id.lower():
        return None
    return url, data


def try_fetch_main(inst: str, kode: str) -> tuple[str, str, dict] | None:
    """Prøver https://.../studieprogram/<inst>_<kode-lower>. Returnerer
    (sbId, url, parsed_json) ved treff, ellers None."""
    sb_id = f"{inst}_{kode.lower()}"
    got = try_fetch_main_by_id(sb_id)
    if not got:
        return None
    return sb_id, got[0], got[1]


# Søke-API-et som studiebarometeret.no sitt eget søkefelt bruker (funnet via
# data-props på /no/student/finn – ikke dokumentert, men stabilt nok til
# bruk her). Trengs fordi mange sbId-er IKKE er "<inst>_<dbh-kode>": f.eks.
# er HVL Bergens landmåling-bachelor "238_leie-bergen" (uten ledende 0 i
# institusjonskoden, og med campus-suffiks), ikke "0238_leie".
#
# VIKTIG (funnet empirisk): ?query=<tekst>&i=<institusjon> filtrerer IKKE
# faktisk på institusjon når query er ikke-tom (i=1173 og i=9999999 ga nesten
# identisk treffliste for samme fritekst-query) – og fritekst-søket matcher
# bare navn/beskrivelse, ikke DBH-studieprogramkoden («OFFBV» gir 0 treff selv
# om programmet finnes som «236_offbv»). Derfor: hent i stedet HELE
# institusjonens katalog med tom query + gyldig i=<institusjon> (det filteret
# fungerer), paginert med &p=<n>, og match lokalt mot koden/navnet. Katalogen
# mellomlagres per institusjon for kjøringen (mange programmer deler
# institusjon).
SEARCH_ENDPOINT = f"{BASE}/no/api/student/finn"

_catalog_cache: dict[str, list[dict]] = {}


def _search_page(query: str, inst_filter: str, page: int) -> tuple[list[dict], int]:
    params = {"query": query, "i": inst_filter}
    if page > 1:
        params["p"] = str(page)
    url = f"{SEARCH_ENDPOINT}?{urllib.parse.urlencode(params)}"
    status, body = fetch(url)
    time.sleep(SLEEP_S)
    if status != 200:
        return [], 0
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return [], 0
    return data.get("hits") or [], data.get("numberHits") or 0


def get_institution_catalog(inst_filter: str, tried: list[str]) -> list[dict]:
    """Alle studieprogram-oppføringer Studiebarometeret har for én
    institusjon (query="" + i=<inst>, paginert). Mellomlagret per kjøring."""
    if inst_filter in _catalog_cache:
        return _catalog_cache[inst_filter]
    all_hits: list[dict] = []
    seen_ids: set[str] = set()
    page = 1
    total = None
    while True:
        hits, number_hits = _search_page("", inst_filter, page)
        if total is None:
            total = number_hits
        if not hits:
            break
        new = 0
        for h in hits:
            hid = h.get("id")
            if hid and hid not in seen_ids:
                seen_ids.add(hid)
                all_hits.append(h)
                new += 1
        if new == 0:
            break  # ingen nye treff -> antagelig gjentar seg, stopp
        page += 1
        if len(all_hits) >= (total or 0) or page > 40:
            break  # 40 sider = 400 programmer bør dekke selv de største institusjonene
    tried.append(f"katalog:i={inst_filter} ({len(all_hits)} programmer)")
    _catalog_cache[inst_filter] = all_hits
    return all_hits


def _slug(s: str | None) -> str:
    return re.sub(r"[^a-zæøå0-9]", "", (s or "").lower())


# Ord som er for generiske til å telle som innholdsord når vi sammenligner
# programnavn – gradsbetegnelser og bindeord som varierer fritt mellom DBH-
# navnet og Studiebarometeret sitt navn på samme program, og som ellers gir
# falske treff mellom to ULIKE programmer som tilfeldigvis deler dem (typisk
# "Master i teknologi" som suffiks på et helt fakultets programnavn hos UiS).
_NAME_STOPWORDS = {
    "master", "bachelor", "masterprogram", "masterstudium", "bachelorstudium",
    "siviløkonom", "sivilingeniør", "femårig", "integrert", "erfaringsbasert",
    "deltid", "nettbasert", "nettstudium", "studium", "programmet", "program",
    "alle", "linjer", "med", "for", "fra", "paa", "på", "til", "av", "og", "i",
    "teknologi", "ingeniørfag", "siv", "ing", "år",
}
_VARIANT_SUFFIX_RE = re.compile(
    r",?\s*(deltid|nettbasert|nettstudium|samlingsbasert|arbeidsplassbasert|kveld)\b.*$"
)


def _content_words(s: str | None) -> set[str]:
    words = re.findall(r"[a-zæøå0-9]+", (s or "").lower())
    return {w for w in words if w not in _NAME_STOPWORDS and len(w) >= 3}


def _jaccard(a: str, b: str) -> float:
    wa, wb = _content_words(a), _content_words(b)
    if not wa or not wb:
        return 0.0
    return len(wa & wb) / len(wa | wb)


def _variant_key(name: str) -> str:
    """Slår sammen deltid/nettbasert-varianter av samme program til én gruppe
    før vi rangerer treff, slik at f.eks. «X» og «X, deltid» ikke sluker
    hverandres 'plass nr. 2' og kunstig visker ut margin-sjekken."""
    return _VARIANT_SUFFIX_RE.sub("", (name or "").lower()).strip()


def _degree_level(s: str | None) -> str | None:
    sl = (s or "").lower()
    if "master" in sl or "sivilingeniør" in sl or "siviløkonom" in sl:
        return "master"
    if "bachelor" in sl:
        return "bachelor"
    return None


# Minste innholds-Jaccard OG minste margin til nest beste (ulike) treff vi
# godtar når vi må velge basert på navn alene (kode ikke funnet i katalogen).
# Kalibrert mot ekte treff som scorer 1.0 med solid margin (UiS
# "Byplanlegging" → 1.0/0.5; UiA "Industriell økonomi og teknologiledelse" →
# 1.0/0.75) og falske treff der programmet faktisk IKKE finnes på
# Studiebarometeret, som scorer lavt og/eller uten margin (NMBU "Global
# økonomi og politikk" → 0.25/0.0; INN "Eiendomsmegling" → 0.0/0.0).
NAME_MATCH_MIN_SCORE = 0.5
NAME_MATCH_MIN_MARGIN = 0.3


def find_sb_id_via_search(prog: dict, studiested: str | None, programnavn: str | None,
                           tried: list[str]) -> tuple[str, str, dict] | None:
    """Fallback når det direkte gjettede <inst>_<kode>-URL-et ikke traff:
    henter institusjonens fulle katalog og matcher lokalt, først på kode
    (evt. med campus-suffiks), så på navnelikhet."""
    insts = prog.get("institusjonskoder") or [prog["institusjonskode"]]
    koder = prog.get("studieprogramkoder") or []
    studiested_slug = _slug(studiested)
    first_letter = _slug(studiested).strip()[:1] if studiested else ""

    def narrow_by_campus(cands: list[dict]) -> list[dict]:
        if len(cands) <= 1:
            return cands
        if studiested_slug:
            narrowed = [h for h in cands if studiested_slug in _slug(h.get("id", ""))]
            if narrowed:
                return narrowed
        if first_letter:
            narrowed = [
                h for h in cands
                if (str(h.get("id", "")).rsplit("-", 1)[-1] if "-" in str(h.get("id", "")) else "") == first_letter
            ]
            if narrowed:
                return narrowed
        return cands

    for inst in insts:
        try:
            inst_i = str(int(inst))
        except ValueError:
            inst_i = inst

        catalog = get_institution_catalog(inst_i, tried)
        if not catalog:
            continue

        # 1) Kodematch: id-en er "<inst>_<kode>" eller "<inst>_<kode>-<campus>".
        # Prøver også koden med ev. trailing sifre fjernet ("MASTINDØK5" ->
        # "mastindøk") – DBH markerer varianter (5-årig, 2-årig) med et siffer
        # på slutten som selve Studiebarometer-sbId-en ofte ikke har.
        for kode in koder:
            kode_l = kode.lower()
            kode_variants = [kode_l]
            stripped = re.sub(r"\d+$", "", kode_l)
            if stripped and stripped != kode_l:
                kode_variants.append(stripped)
            cands: list[dict] = []
            for kv in kode_variants:
                exact = f"{inst_i}_{kv}"
                cands = [
                    h for h in catalog
                    if str(h.get("id", "")).lower() == exact
                    or str(h.get("id", "")).lower().startswith(exact + "-")
                ]
                if cands:
                    break
            if cands:
                chosen = narrow_by_campus(cands)[0]
                sb_id = chosen["id"]
                got = try_fetch_main_by_id(sb_id)
                if got:
                    return sb_id, got[0], got[1]

        # 2) Navnematch blant alt institusjonen har, hvis ingen kode traff.
        # Krever både en absolutt minste innholds-Jaccard OG en klar margin
        # til nest beste, ULIKE program (se NAME_MATCH_MIN_SCORE/-MARGIN) –
        # uten det plukker den lett feil program ved delt boilerplate
        # ("Global økonomi og politikk" ~ "Økonomi og administrasjon", begge
        # inneholder "økonomi" og "master").
        if programnavn:
            cands = narrow_by_campus(catalog) if studiested_slug or first_letter else catalog
            groups: dict[str, tuple[float, dict]] = {}
            for h in cands:
                key = _variant_key(h.get("name", ""))
                score = _jaccard(programnavn, h.get("name", ""))
                if key not in groups or score > groups[key][0]:
                    groups[key] = (score, h)
            ranked = sorted(groups.values(), key=lambda t: t[0], reverse=True)
            if ranked:
                best_score, best_hit = ranked[0]
                second_score = ranked[1][0] if len(ranked) > 1 else 0.0
                margin = best_score - second_score
                accept = best_score >= NAME_MATCH_MIN_SCORE and margin >= NAME_MATCH_MIN_MARGIN
                if not accept and best_score >= NAME_MATCH_MIN_SCORE and margin == 0.0:
                    # Uavgjort på tema (f.eks. bachelor- og mastervariant med
                    # samme kjerneord) – avgjør på hvilken som matcher
                    # gradsnivået i programnavn, hvis bare én gjør det.
                    tied = [(s, h) for s, h in ranked if s == best_score]
                    target_level = _degree_level(programnavn)
                    level_matches = [h for _, h in tied if _degree_level(h.get("name", "")) == target_level] \
                        if target_level else []
                    if len(level_matches) == 1:
                        best_hit = level_matches[0]
                        accept = True
                tried.append(
                    f"navnematch:{programnavn!r}~={best_hit.get('name')!r} "
                    f"(score {best_score:.2f}, margin {margin:.2f}, godtatt={accept})"
                )
                if accept:
                    sb_id = best_hit["id"]
                    got = try_fetch_main_by_id(sb_id)
                    if got:
                        return sb_id, got[0], got[1]
    return None


def find_sb_id(prog: dict, studiested: str | None = None,
                programnavn: str | None = None) -> tuple[str | None, str | None, dict | None, list[str]]:
    """Prøver alle institusjonskode x studieprogramkode-kombinasjoner direkte
    (raskt, treffer i de fleste tilfeller), og faller tilbake på søke-API-et
    (find_sb_id_via_search) når ingen av dem gir treff.
    Returnerer (sbId, url, main_json, forsøkte_id-er/søk)."""
    insts = prog.get("institusjonskoder") or [prog["institusjonskode"]]
    koder = prog.get("studieprogramkoder") or []
    tried: list[str] = []
    # Fast sbId i dbh-programkart (f.eks. BI per campus: «8241_dipøah-b») går foran gjetting og søk.
    if prog.get("sbId"):
        tried.append(prog["sbId"])
        got = try_fetch_main_by_id(prog["sbId"])
        if got:
            return prog["sbId"], got[0], got[1], tried
    for inst in insts:
        for kode in koder:
            sb_id_guess = f"{inst}_{kode.lower()}"
            tried.append(sb_id_guess)
            hit = try_fetch_main(inst, kode)
            if hit:
                return hit[0], hit[1], hit[2], tried

    via_search = find_sb_id_via_search(prog, studiested, programnavn, tried)
    if via_search:
        return via_search[0], via_search[1], via_search[2], tried
    return None, None, None, tried


# ─── /tidsserie ────────────────────────────────────────────────────────────

def fetch_tidsserie(sb_id: str) -> dict | None:
    url = f"{BASE}/no/student/studieprogram/{urllib.parse.quote(sb_id)}/tidsserie"
    status, body = fetch(url)
    time.sleep(SLEEP_S)
    if status != 200:
        return None
    return parse_compare_props(body)


def build_history(tidsserie_json: dict | None, sb_id: str) -> list[dict]:
    if not tidsserie_json:
        return []
    comp = tidsserie_json.get("comparison") or {}
    cats = comp.get("categories") or []
    by_year: dict[int, dict] = {}
    for cat in cats:
        dim = CATEGORY_NAME_TO_DIM.get(cat.get("name"))
        if not dim:
            continue
        progs = cat.get("programs") or []
        own = next((p for p in progs if str(p.get("id", "")).lower() == sb_id.lower()), None)
        if not own:
            continue
        for score in own.get("scores") or []:
            year_s = score.get("meterLabel")
            if not year_s or not str(year_s).isdigit():
                continue
            year = int(year_s)
            by_year.setdefault(year, empty_scores())
            if score.get("isSufficient", True):
                by_year[year][dim] = parse_no_number(score.get("value"))
            else:
                by_year[year][dim] = None
    return [{"year": y, "scores": by_year[y]} for y in sorted(by_year)]


# ─── /detaljer (statisk HTML, ikke data-props) ────────────────────────────

TR_RE = re.compile(r"<tr([^>]*)>(.*?)</tr>", re.S)
SECTION_HEADER_NAME_RE = re.compile(r"<td>\s*(.*?)\s*<span class=\"arrow\">", re.S)
DATA_ROW_RE = re.compile(r"<td>(.*?)</td>\s*<td class=\"score\">([^<]*)</td>", re.S)


def fetch_detaljer(sb_id: str) -> str | None:
    url = f"{BASE}/no/student/studieprogram/{urllib.parse.quote(sb_id)}/detaljer"
    status, body = fetch(url)
    time.sleep(SLEEP_S)
    if status != 200:
        return None
    return body


def parse_detaljer(detaljer_html: str | None) -> dict:
    """Returnerer { dimensjonsnøkkel: [ {text, value}, ... ] }."""
    result: dict[str, list[dict]] = {}
    if not detaljer_html:
        return result

    # Begge tabellene ("Overordnet tilfredshet" og "Indekser i detalj") ligger
    # mellom sin <h2> og neste <h2> (eller slutten av <main>).
    h2_positions = [(m.start(), html.unescape(m.group(1).strip()))
                     for m in re.finditer(r"<h2>(.*?)<span class=\"arrow\">", detaljer_html, re.S)]
    for i, (pos, title) in enumerate(h2_positions):
        if title not in ("Overordnet tilfredshet", "Indekser i detalj"):
            continue
        end = h2_positions[i + 1][0] if i + 1 < len(h2_positions) else len(detaljer_html)
        section = detaljer_html[pos:end]

        current_dim: str | None = None
        if title == "Overordnet tilfredshet":
            current_dim = "helhetsvurdering"

        for tr_match in TR_RE.finditer(section):
            attrs, content = tr_match.group(1), tr_match.group(2)
            if "section_header" in attrs:
                name_m = SECTION_HEADER_NAME_RE.search(content)
                if name_m:
                    current_dim = DETAIL_SECTION_TO_DIM.get(html.unescape(name_m.group(1).strip()))
                continue
            if "info" in attrs and "score" not in content:
                continue
            if current_dim is None:
                continue
            data_m = DATA_ROW_RE.search(content)
            if not data_m:
                continue
            text = html.unescape(re.sub(r"<[^>]+>", "", data_m.group(1))).strip()
            value = parse_no_number(html.unescape(data_m.group(2)))
            if not text:
                continue
            result.setdefault(current_dim, []).append({"text": text, "value": value})
    return result


# ─── Hovedside → scores/fieldAverage/warning ──────────────────────────────

RESPONDENTS_RE = re.compile(r"Antall respondenter:\s*(\d[\d\s ]*)\s*\(([\d,]+)\s*%\)")
YEAR_RE = re.compile(r"Tallene er fra (\d{4})")


def parse_main(main_json: dict, sb_id: str) -> dict:
    comp = main_json.get("comparison") or {}
    cats = comp.get("categories") or []
    scores = empty_scores()
    field_avg = empty_scores()
    field_label: str | None = None

    for cat in cats:
        dim = CATEGORY_NAME_TO_DIM.get(cat.get("name"))
        if not dim:
            continue
        progs = cat.get("programs") or []
        own = next((p for p in progs if str(p.get("id", "")).lower() == sb_id.lower()), None)
        avg = next((p for p in progs if p.get("id") == "index-avg"), None)
        if own and own.get("scores"):
            s0 = own["scores"][0]
            scores[dim] = parse_no_number(s0.get("value")) if s0.get("isSufficient", True) else None
        if avg and avg.get("scores"):
            a0 = avg["scores"][0]
            field_avg[dim] = parse_no_number(a0.get("value"))
            if field_label is None:
                field_label = avg.get("location")

    hdr = main_json.get("header") or {}
    hdr_progs = hdr.get("programs") or [{}]
    info_items = hdr_progs[0].get("info") or []

    latest_year: int | None = None
    respondents: int | None = None
    response_rate: float | None = None
    warning: str | None = None

    for item in info_items:
        text_blob = " ".join(filter(None, [item.get("label"), item.get("text")]))
        ym = YEAR_RE.search(text_blob)
        if ym:
            latest_year = int(ym.group(1))
        rm = RESPONDENTS_RE.search(text_blob)
        if rm:
            respondents = parse_no_int(rm.group(1))
            response_rate = parse_no_number(rm.group(2))
        if item.get("warning") and not warning:
            w = item["warning"]
            if item.get("help"):
                w = f"{w} ({item['help']})"
            warning = w

    if warning is None and any(v is None for v in scores.values()):
        warning = "For få svar til å vise resultat i én eller flere kategorier."

    return {
        "scores": scores,
        "fieldAverage": field_avg,
        "fieldLabel": field_label,
        "latestYear": latest_year,
        "respondents": respondents,
        "responseRate": response_rate,
        "warning": warning,
    }


# ─── Cache ──────────────────────────────────────────────────────────────

def cache_path(fakultet: str, entry_id: str) -> Path:
    return REPO_ROOT / "data" / fakultet / "kilder" / "studiebarometer" / f"{entry_id}.json"


def load_cache(fakultet: str, entry_id: str) -> dict | None:
    p = cache_path(fakultet, entry_id)
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def save_cache(fakultet: str, entry_id: str, payload: dict) -> None:
    p = cache_path(fakultet, entry_id)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


# ─── Program-/gruppekart ───────────────────────────────────────────────────

def load_group_info(fakultet: str) -> dict[str, dict]:
    """entryId -> {groupId, shortName, institusjon, programnavn, isNmbu}"""
    path = REPO_ROOT / "data" / fakultet / "programkart.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    out: dict[str, dict] = {}
    for group in data.get("groups", []):
        for prog in group.get("programs", []):
            out[prog["id"]] = {
                "groupId": group["id"],
                "shortName": prog.get("shortName", prog["id"]),
                "institusjon": prog.get("institusjon", ""),
                "programnavn": prog.get("programnavn", ""),
                "isNmbu": bool(prog.get("isNmbu", False)),
                "studiested": prog.get("studiested", ""),
            }
    return out


# ─── Ett program, ende-til-ende ────────────────────────────────────────────

def process_program(fakultet: str, prog: dict, group_info: dict[str, dict], refresh: bool) -> dict:
    entry_id = prog["entryId"]
    ginfo = group_info.get(entry_id, {
        "groupId": entry_id, "shortName": entry_id, "institusjon": "", "programnavn": "", "isNmbu": False,
        "studiested": "",
    })

    cached = None if refresh else load_cache(fakultet, entry_id)

    if cached is not None:
        sb_id = cached.get("sbId")
        url = cached.get("url")
        main_json = cached.get("main")
        tidsserie_json = cached.get("tidsserie")
        detaljer_html = cached.get("detaljerHtml")
        tried = cached.get("tried", [])
    else:
        sb_id, url, main_json, tried = find_sb_id(prog, ginfo.get("studiested"), ginfo.get("programnavn"))
        tidsserie_json = fetch_tidsserie(sb_id) if sb_id else None
        detaljer_html = fetch_detaljer(sb_id) if sb_id else None
        save_cache(fakultet, entry_id, {
            "sbId": sb_id, "url": url, "tried": tried,
            "main": main_json, "tidsserie": tidsserie_json, "detaljerHtml": detaljer_html,
            "hentet": date.today().isoformat(),
        })

    if not sb_id or not main_json:
        entry = {
            "entryId": entry_id,
            "groupId": ginfo["groupId"],
            "shortName": ginfo["shortName"],
            "institusjon": ginfo["institusjon"],
            "programnavn": ginfo["programnavn"],
            "isNmbu": ginfo["isNmbu"],
            "sbId": None,
            "url": None,
            "latestYear": None,
            "respondents": None,
            "responseRate": None,
            "scores": empty_scores(),
            "fieldAverage": empty_scores(),
            "fieldLabel": None,
            "history": [],
            "subquestions": {},
            "warning": f"Ikke funnet i Studiebarometeret (prøvde: {', '.join(tried) or 'ingen kombinasjoner'}).",
            "_status": "not_found",
        }
        return entry

    parsed = parse_main(main_json, sb_id)
    history = build_history(tidsserie_json, sb_id)
    subquestions = parse_detaljer(detaljer_html)

    status = "found"
    if parsed["warning"] and any(v is None for v in parsed["scores"].values()):
        status = "too_few"
    elif parsed["warning"]:
        status = "found_warning"

    entry = {
        "entryId": entry_id,
        "groupId": ginfo["groupId"],
        "shortName": ginfo["shortName"],
        "institusjon": ginfo["institusjon"],
        "programnavn": ginfo["programnavn"],
        "isNmbu": ginfo["isNmbu"],
        "sbId": sb_id,
        "url": url,
        "latestYear": parsed["latestYear"],
        "respondents": parsed["respondents"],
        "responseRate": parsed["responseRate"],
        "scores": parsed["scores"],
        "fieldAverage": parsed["fieldAverage"],
        "fieldLabel": parsed["fieldLabel"],
        "history": history,
        "subquestions": subquestions,
        "warning": " ".join(x for x in (prog.get("sbMerknad"), parsed["warning"]) if x) or None,
        "_status": status,
    }
    return entry


# ─── TS/JSON-emisjon ────────────────────────────────────────────────────────

def ts_num(v) -> str:
    return "null" if v is None else repr(v) if isinstance(v, float) else str(v)


def ts_str(v: str | None) -> str:
    if v is None:
        return "null"
    return json.dumps(v, ensure_ascii=False)


def ts_scores(scores: dict) -> str:
    parts = [f"{d}: {ts_num(scores[d])}" for d in DIMENSIONS]
    return "{ " + ", ".join(parts) + " }"


def ts_history(history: list[dict]) -> str:
    if not history:
        return "[]"
    rows = []
    for h in history:
        rows.append(f"    {{ year: {h['year']}, scores: {ts_scores(h['scores'])} }}")
    return "[\n" + ",\n".join(rows) + ",\n  ]"


def ts_subquestions(subq: dict) -> str:
    if not subq:
        return "{}"
    lines = []
    for dim in DIMENSIONS:
        items = subq.get(dim)
        if not items:
            continue
        entries = ", ".join(
            f"{{ text: {ts_str(it['text'])}, value: {ts_num(it['value'])} }}" for it in items
        )
        lines.append(f"    {dim}: [{entries}]")
    if not lines:
        return "{}"
    return "{\n" + ",\n".join(lines) + ",\n  }"


def entry_to_ts(e: dict) -> str:
    return (
        "  {\n"
        f"    entryId: {ts_str(e['entryId'])},\n"
        f"    groupId: {ts_str(e['groupId'])},\n"
        f"    shortName: {ts_str(e['shortName'])},\n"
        f"    institusjon: {ts_str(e['institusjon'])},\n"
        f"    programnavn: {ts_str(e['programnavn'])},\n"
        f"    isNmbu: {'true' if e['isNmbu'] else 'false'},\n"
        f"    sbId: {ts_str(e['sbId'])},\n"
        f"    url: {ts_str(e['url'])},\n"
        f"    latestYear: {ts_num(e['latestYear'])},\n"
        f"    respondents: {ts_num(e['respondents'])},\n"
        f"    responseRate: {ts_num(e['responseRate'])},\n"
        f"    scores: {ts_scores(e['scores'])},\n"
        f"    fieldAverage: {ts_scores(e['fieldAverage'])},\n"
        f"    fieldLabel: {ts_str(e['fieldLabel'])},\n"
        f"    history: {ts_history(e['history'])},\n"
        f"    subquestions: {ts_subquestions(e['subquestions'])},\n"
        f"    warning: {ts_str(e['warning'])},\n"
        "  }"
    )


TS_HEADER_TMPL = """// GENERERT av scripts/build-studiebarometer.py {dato} – ikke rediger for hånd. Kilde: studiebarometeret.no
export type SbDimension = 'undervisning' | 'tilbakemeldinger' | 'vurderingsformer' | 'laeringsmiljo' | 'organisering' | 'yrkesrelevans' | 'engasjement' | 'helhetsvurdering';
export interface SbScores {{ undervisning: number | null; tilbakemeldinger: number | null; vurderingsformer: number | null; laeringsmiljo: number | null; organisering: number | null; yrkesrelevans: number | null; engasjement: number | null; helhetsvurdering: number | null; }}
export interface SbSubquestion {{ text: string; value: number | null; }}
export interface SbEntry {{
  entryId: string; groupId: string; shortName: string; institusjon: string; programnavn: string; isNmbu: boolean;
  sbId: string | null;                    // e.g. '1173_m-eie'; null when not found
  url: string | null;
  latestYear: number | null; respondents: number | null; responseRate: number | null;   // percent
  scores: SbScores;                        // latest year
  fieldAverage: SbScores; fieldLabel: string | null;   // «Av alle …»
  history: {{ year: number; scores: SbScores }}[];       // from /tidsserie, oldest first
  subquestions: Partial<Record<SbDimension, SbSubquestion[]>>;   // from /detaljer, latest year
  warning: string | null;                  // e.g. too few answers / not found
}}
export const SB_DIMENSION_LABELS: Record<SbDimension, string> = {{ undervisning: 'Undervisning', tilbakemeldinger: 'Tilbakemeldinger', vurderingsformer: 'Vurderingsformer', laeringsmiljo: 'Læringsmiljø', organisering: 'Organisering', yrkesrelevans: 'Tilknytning til yrkeslivet', engasjement: 'Eget engasjement', helhetsvurdering: 'Helhetsvurdering' }};
export const STUDIEBAROMETER_ENTRIES: SbEntry[] = [
{body}
];
"""


def write_outputs(fakultet: str, entries: list[dict]) -> tuple[Path, Path]:
    json_path = REPO_ROOT / "data" / fakultet / "studiebarometer.json"
    ts_path = REPO_ROOT / "kilde" / "src" / "app" / "data" / f"{fakultet}StudiebarometerData.ts"

    json_entries = [{k: v for k, v in e.items() if not k.startswith("_")} for e in entries]
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(json_entries, ensure_ascii=False, indent=2), encoding="utf-8")

    body = ",\n".join(entry_to_ts(e) for e in entries)
    ts_path.parent.mkdir(parents=True, exist_ok=True)
    ts_path.write_text(
        TS_HEADER_TMPL.format(dato=date.today().isoformat(), body=body),
        encoding="utf-8",
    )
    return json_path, ts_path


# ─── main ──────────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("fakultet", help="f.eks. landsam, realtek, biovit, kbm, mina")
    ap.add_argument("--refresh", action="store_true", help="ignorer mellomlager, hent alt på nytt")
    args = ap.parse_args()

    dbh_path = REPO_ROOT / "data" / args.fakultet / "dbh-programkart.json"
    if not dbh_path.exists():
        print(f"-- hopper over {args.fakultet}: {dbh_path} finnes ikke", file=sys.stderr)
        return 0

    dbh_data = json.loads(dbh_path.read_text(encoding="utf-8"))
    programs = dbh_data.get("programs", [])
    group_info = load_group_info(args.fakultet)

    entries = []
    for i, prog in enumerate(programs, 1):
        entry = process_program(args.fakultet, prog, group_info, args.refresh)
        entries.append(entry)
        status = entry["_status"]
        marker = {"found": "OK", "found_warning": "OK*", "too_few": "FÅ", "not_found": "--"}[status]
        print(f"  [{i:>3}/{len(programs)}] {marker:>4}  {entry['shortName']:<22} {entry['sbId'] or '(ikke funnet)'}")

    json_path, ts_path = write_outputs(args.fakultet, entries)

    n_found = sum(1 for e in entries if e["_status"] in ("found", "found_warning"))
    n_few = sum(1 for e in entries if e["_status"] == "too_few")
    n_missing = sum(1 for e in entries if e["_status"] == "not_found")

    print(f"\n== {args.fakultet}: {len(entries)} programmer ==")
    print(f"  Funnet:          {n_found}")
    print(f"  For få svar:     {n_few}")
    print(f"  Ikke funnet:     {n_missing}")
    print(f"  Skrev: {json_path.relative_to(REPO_ROOT)}")
    print(f"  Skrev: {ts_path.relative_to(REPO_ROOT)}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
