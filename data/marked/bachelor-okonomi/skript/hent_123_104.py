"""DBH 123 (registrerte studenter, høst) og 104 (ferdige kandidater, år) for alle institusjoner, nivå B3/B4/M5, 2021–2026."""
from dbh import hent, body, item
G = ["Årstall", "Semester", "Institusjonskode", "Studieprogramkode"]
for aar in ["2021", "2022", "2023", "2024", "2025", "2026"]:
    f = [item("Årstall", [aar]), item("Nivåkode", ["B3", "B4", "M5"])]
    a = hent(body(123, f, group_by=G), f"123_{aar}")
    b = hent(body(104, f, group_by=G), f"104_{aar}")
    print(aar, len(a), len(b))
