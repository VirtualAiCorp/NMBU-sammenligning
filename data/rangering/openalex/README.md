# Siteringsmål fra OpenAlex (fanen «Siteringer» og kartet i rangeringen)

Siteringsmål per enhet og år fra [OpenAlex](https://openalex.org) (data under CC0), uavhengig av tidsskriftlister:
snitt og median FWCI, andel og antall blant de 10 % og 1 % mest siterte i felt og år, siteringer per artikkel og
topp 10 % per 100 faglige årsverk. Brukes av fanen «Siteringer» (`?rangering&fane=sitering`) og kartet. Metoden står i
`docs/status-og-metode.md` §50.

Bare denne README-en, `enheter-norden.json` og `hh-internasjonalt.json` ligger i git. Alt annet her er rå cache (gitignored) og hentes på nytt med
skriptene. Ingen forfatternavn lagres, heller ikke i cachen. Ut til rangeringsdataene går bare aggregater per enhet og år.

| Fil/mappe | Innhold | Laget av |
|---|---|---|
| `enheter-norden.json` | Hvordan hver enhet i Danmark, Sverige og Finland avgrenses i OpenAlex (institusjon, tilknytningstekst eller fagfelt), med usikkerhet | for hånd |
| `nva-doi/<skole>/<år>.json` | NVA-id → DOI for artiklene i `../nva/` (den eksisterende NVA-cachen endres ikke) | `scripts/rangering/hent_nva_doi.py` |
| `norge-doi.json` | DOI → OpenAlex-mål (FWCI, persentil, topp 10/1 %, siteringer, år, type) | `hent_openalex.py norge` |
| `tittel/_kilder.json`, `tittel/S….json` | Tidsskrift (ISSN → OpenAlex-kilde) og verkene i tidsskriftene, for artikler uten DOI | `hent_openalex.py tittel` |
| `norden/<enhet>/<år>.json` | Verk per nordisk enhet og år med mål og et ja/nei for om enheten står i tilknytningen | `hent_openalex.py norden` |
| `hh-internasjonalt.json` | Referansesettet for fagfeltprofilen: frittstående handelshøyskoler (Norden, Europa) med OpenAlex-id-er (i git) | for hånd |
| `ajg-kilder.json` | ISSN → OpenAlex-kilde for AJG-tidsskriftene (ingen AJG-nivåer) | `hent_ajg_profil.py kilder` |
| `ajg-volum.json` | Artikler per år i AJG-tidsskriftene, per AJG-fagfelt og nivågruppe (1–2, 3, 4/4*) | `hent_ajg_profil.py volum` |
| `hh-profil/<skole>/<år>.json` | Artikler per tidsskrift (kilde-id) og år for skolene i `hh-internasjonalt.json` | `hent_ajg_profil.py skoler` |

## Kjøre på nytt

```
python3 scripts/fetch-nva-artikler.py                      # NVA-artiklene (hvis ikke hentet)
python3 scripts/rangering/hent_nva_doi.py                  # DOI per NVA-artikkel (NVA, gratis, ~2 min)
python3 scripts/rangering/hent_openalex.py kreditt         # hvor mange OpenAlex-kreditter som er igjen i dag
python3 scripts/rangering/hent_openalex.py norge           # ~150 kreditter (bunter på 100 DOI-er)
python3 scripts/rangering/hent_openalex.py tittel --min 2 --maks-kall 60
python3 scripts/rangering/hent_openalex.py norden          # ~300–500 kreditter for 2016–2025, nyeste år først
python3 scripts/rangering/sitering.py                      # kontroll: treffrate og tabell (lagrer ingenting)
python3 scripts/rangering/hent_ajg_profil.py kilder        # fagfeltprofilen: AJG-tidsskrift → OpenAlex (~70 kreditter)
python3 scripts/rangering/hent_ajg_profil.py volum         # artikler per AJG-fagfelt og år (~70 kreditter)
python3 scripts/rangering/hent_ajg_profil.py skoler        # internasjonale handelshøyskoler (~300–400 kreditter, 2016–2025)
/usr/local/bin/python3 scripts/build-rangering.py          # bygger rangeringsdataene med feltet `sitering`
```

- **Kreditter:** OpenAlex gir 1 000 kreditter per døgn uten nøkkel (oktober 2026; nullstilles ved midnatt UTC). Et
  listekall koster 1, et søk 10, enkeltoppslag 0. Skriptet stopper med en reserve (`--reserve`, standard 40) og kan
  kjøres videre neste døgn: det som er hentet, hentes ikke på nytt (bruk `--refresh` for å hente på nytt).
  Med gratis API-nøkkel (openalex.org/settings/api) får vi egen kvote (1 USD per døgn ≈ 10 000 kreditter) og cursor-paging:
  legg linja `OPENALEX_API_KEY=…` i `kilde/.env.local` (gitignored), eller sett miljøvariabelen. Skriptene sender den som
  `api_key`, skriver aldri ut nøkkelen og lagrer den ikke i cachen. Uten nøkkel brukes den delte gratiskvoten.
  Svarer API-et 401/402/403, stopper skriptet.
- **Oppdatering:** siteringene endrer seg hele tiden. Slett `norge-doi.json`, `tittel/` og `norden/` for å hente ferske tall.
- **Ny nordisk enhet:** legg den i `enheter-norden.json` (samme id som i `../norden/<land>.json`) og kjør
  `hent_openalex.py norden --enhet <id>`.
