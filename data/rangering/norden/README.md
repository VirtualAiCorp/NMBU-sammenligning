# Nordiske enheter i kartet (fanen «Kart» i rangeringen)

Foreløpige publiseringstall for handelshøyskoler og økonomimiljøer i Danmark, Sverige og Finland, og kartpunkt for de
norske enhetene. Brukes bare av fanen «Kart» (`?rangering&fane=kart`) og er **ikke del av den norske rangeringen**.
Filene krypteres inn i rangeringsdataene av `scripts/build-rangering.py` (feltet `norden`), sammen med resten.

| Fil | Innhold |
|---|---|
| `norge.json` | By og koordinater (hovedcampus) for de 18 enhetene i `../skoler.json`. Tallene for Norge regnes i nettleseren fra rangeringsdataene. |
| `danmark.json`, `sverige.json`, `finland.json` | Én fil per land: metode, forbehold og enheter med koordinater, akkrediteringer og tall per periode. |

Kildene er utforskningsrapportene i `../inspirasjon/norden-<land>.md` (skrevet av agenter 7.10.2026; de redigeres ikke).

## Felt per enhet

`id` (prefiks `dk_`, `se_`, `fi_`), `navn`, `kort`, `alias` (navn slik raden står i rapportens tabeller; brukes av
skriptet), `by`, `lat`/`lon` (WGS84, hovedcampus), `referanse` (som UiB/UiO økonomi), `akkrediteringer`
(`[{type, status, aar}]`; `null` = ikke fylt inn), `forbehold` (tekst per enhet), `perioder` og ev. `enhetskontroll`.

Hver periode (`{fra, til, …}`) har bare **aggregerte tall for hele perioden** (sum, ikke snitt per år):

| Felt | Betydning |
|---|---|
| `artikler` | Vitenskapelige artikler i perioden (hel telling) |
| `ajg4`, `ajg4s`, `ajg3` | Artikler på AJG 2024 nivå 4/4*, 4* og 3+ |
| `arsverk` | Sum faglige årsverk i perioden **med** stipendiater/doktorander (≈ HK-dirs UN1 + UN2) |
| `arsverkUtenStip` | Sum faglige årsverk **uten** stipendiater/doktorander (≈ NHHs nevner) |
| `ajg4Per100`, `ajg3Per100` | Per 100 årsverk og år (sum artikler / sum årsverk × 100), med stipendiater |
| `ajg4Per100UtenStip`, `ajg3Per100UtenStip` | Det samme uten stipendiater |
| `artiklerPer100`, `ajgDekning` (%), `niva2`/`niva2Per100` (JUFO 2–3 i Finland), `abdc`/`abdcPer100` (A*/A), `abdcAs` (A*), `ft50`, `ftUtd` (FT50 ∪ UTD24) | Tilleggstall som vises i detaljpanelet |
| `anslag` (true), `telling` («hel»), `kilde`, `merknad` | Merking |

Rapportens egne tall legges inn slik de står. Mangler en rate, men antall og nevner finnes, regner byggeskriptet den ut
og merker den som `beregnet` (vises i forbeholdene). Ukjente felt slippes ikke gjennom til nettleseren. **Aldri AJG-nivå
per tidsskrift** i disse filene.

Perioden velges i kartet for Norge (treårsvindu eller ett år). For de andre landene brukes perioden som passer eksakt, ellers
den som overlapper mest (merket med *).

## Slik legges nye tall inn

1. Les rapporten og sjekk enhetene (navn, by, koordinater, akkrediteringer). Legg til eller endre enheter for hånd.
2. Prøv skriptet, som leser markdown-tabellene og kjenner igjen kolonner og rader (på `alias`):
   ```
   python3 scripts/rangering/norden_til_json.py les data/rangering/inspirasjon/norden-<land>.md <land> --periode 2023-2025
   python3 scripts/rangering/norden_til_json.py les … --skriv      # lagrer når tørrkjøringen ser riktig ut
   ```
   Tabeller med «/100» eller «per 100» i overskriften blir hovedperioden; tabeller med AJG-kolonner uten det blir
   `enhetskontroll`. Rader som ikke passer (f.eks. rapportens norske sammenligningsrader) hoppes over. Det virker rett fram
   for Finland; Danmark og Sverige ble lagt inn for hånd (ett år med Pure-tall og egen nevnerkolonne i Danmark,
   snitt per år og to nevnere i Sverige), men skriptet gjenkjenner også de danske kolonnene.
3. Bruk **ikke** rapportenes norske sammenligningstall; Norge vises alltid med tallene fra rangeringsdataene.
4. `python3 scripts/rangering/norden_til_json.py sjekk` (felt, dobbel id, koordinater innenfor kartet).
5. `/usr/local/bin/python3 scripts/build-rangering.py` (uten `--testpassord` før commit).

`python3 scripts/rangering/norden_til_json.py mal <land>` skriver en tom enhet med alle felt.

## Kartgrunnlaget

`kilde/src/app/components/rangering/norden-kart.json` (39 kB) lages av `scripts/rangering/lag_nordenkart.py` fra
Natural Earth 1:50m Admin 0 – Countries (offentlig eiendom, https://www.naturalearthdata.com/about/terms-of-use/) i
TopoJSON-utgaven world-atlas 2.0.2 (ISC-lisens, © Mike Bostock, https://github.com/topojson/world-atlas). Klippet til
Norden, forenklet og avrundet til to desimaler. Kartet tegnes som innebygd SVG uten kartfliser og uten kall til tredjeparter.
