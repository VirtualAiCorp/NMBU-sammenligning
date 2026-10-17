"""DBH 124 (registrerte studenter per campus) for alle institusjoner, nivå B3/B4/M5, høst 2021–2025."""
from dbh import hent, body, item
G = ["Årstall", "Institusjonskode", "Studieprogramkode", "Stednavn campus"]
for aar in ["2021", "2022", "2023", "2024", "2025"]:
    d = hent(body(124, [item("Årstall", [aar]), item("Semester", ["3"]), item("Nivåkode", ["B3", "B4", "M5"])], group_by=G), f"124_{aar}")
    print(aar, len(d), d[:1])
