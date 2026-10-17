"""DBH 347 for alle institusjoner, nivå B3/B4/M5 (alle fagfelt), 2021–2026. Brukes til navnekobling mot Samordna."""
from dbh import hent, body, item
for aar in ["2021", "2022", "2023", "2024", "2025", "2026"]:
    d = hent(body(347, [item("Årstall", [aar]), item("Nivåkode", ["B3", "B4", "M5"])], variabler=["*"]), f"347_alle_B3B4M5_{aar}")
    print(aar, len(d))
