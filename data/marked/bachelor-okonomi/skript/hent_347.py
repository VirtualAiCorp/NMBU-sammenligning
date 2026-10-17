"""DBH 347 (studieprogramregisteret) for alle institusjoner 2021–2026: NUS 64% (økonomisk-administrative fag),
NUS 634% (samfunnsøkonomi, lavere grad) og NUS 734% (samfunnsøkonomi, høyere grad, for femårige løp),
pluss Studiumkode ØA. Ett kall per år og filter."""
from dbh import hent, body, item, like
for aar in ["2021", "2022", "2023", "2024", "2025", "2026"]:
    for navn, f in [("nus64", like("NUS-kode", ["64%"])), ("nus634", like("NUS-kode", ["634%"])),
                    ("nus734", like("NUS-kode", ["734%"])), ("nus74", like("NUS-kode", ["74%"])),
                    ("studium_oa", item("Studiumkode", ["ØA"]))]:
        d = hent(body(347, [item("Årstall", [aar]), f], variabler=["*"]), f"347_{navn}_{aar}")
        print(aar, navn, len(d))
