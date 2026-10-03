# AJG-anslag: kalibrering (03.10.2026)

AJG 2024 kan ikke hentes maskinelt (Chartered ABS' vilkår forbyr skraping; nettsiden har ingen eksport). Vi lager derfor
et anslag fra åpne kilder og kalibrerer det mot de eneste offentlige AJG-tallene for norske handelshøyskoler:
NHH Research Report 2024, tabell 4, 5 og 31 (ABS 4*, 4 og 3 per skole og år, 2020–2024).

**Fasit:** NHH, BI, NMBU, Nord, UiA, UiS og UiT, 2020–2024 (35 skole-år). NTNU er holdt utenfor fordi NHH bare teller
NTNU Handelshøyskolen. For nivå 3 er 2022 holdt utenfor (antallene i tabell 31 er feil det året).
**Våre tall:** NVI-rapporterte artikler i NVA med minst én forfatter ved enheten.
**Åpne mål per tidsskrift:** ABDC 2025, FT50 (2026), UTD24, JUFO-nivå (CC BY 4.0), OpenAlex 2-års gj.sn. sitering (CC0).
SCImago ble ikke brukt (robotsjekk).

## Valgte regler

| Nivå | Regel | Korrelasjon per skole-år | Totalt mot fasit | Rekkefølge skoler (Spearman) |
|---|---|---|---|---|
| ≈ AJG 4/4* | FT50/UTD24, eller ABDC A* med sitering ≥ 5 | 0,976 | 1,09 | 0,93 |
| ≈ AJG 3 | ikke topp, ABDC A* eller A, JUFO ≥ 2 | 0,916 | 1,15 | 0,91 |

Testet ellers: bare FT50/UTD24, FT ∪ ABDC A* (1,8 × fasit), terskler på sitering 2–10, h-indeks 80–250, JUFO 3,
egne terskler per ABDC-fagfelt (35 vs 38). De valgte reglene ga best balanse mellom feil og rekkefølge.

## Per skole, AJG 4/4*, sum 2020–2024 (fasit / anslag)

NHH 163 / 148 · BI 261 / 222 · Nord 19 / 20 · UiA 21 / 43 · UiS 20 / 51 · UiT 8 / 36 · NMBU 4 / 19

**Kjent skjevhet:** anslaget gir 2–5 ganger så mange toppartikler som NHH-tabellen for de mindre skolene. Tidsskriftene
som gir utslaget er stort sett høyt rangerte (Research Policy, Management Science, Tourism Management, Annals of Tourism
Research, Energy Economics, World Development), så en del av forskjellen skyldes trolig at NHH avgrenser enhetene
annerledes. Per årsverk gir skjevheten for høye tall for UiS, UiA, UiT og NMBU. Målet har derfor vekt 5 (ikke 10) i
rangeringen, og NHH-rapportens tall vises som eget kontrollmål (vekt 0).

Skript: `scripts/rangering/hent_tidsskriftmaal.py`, `scripts/rangering/ajg_anslag.py`,
`scripts/rangering/ajg_anslag_kalibrering.py`.
