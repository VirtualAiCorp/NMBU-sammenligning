"""DBH 379 (søkertall og møtte) for alle institusjoner, nivå B3/B4/M5, 2021–2026.
a) Årstall × institusjon × program × opptakstype × kvalifisert (søkere, tilbud, akseptert, møtt)
b) samme, bare prioritet 1 (førstevalg)
c) prioritet 1 × kjønn (kvinneandel blant førstevalg)"""
from dbh import hent, body, item
G = ["Årstall", "Institusjonskode", "Studieprogramkode", "Opptakstype"]
for aar in ["2021", "2022", "2023", "2024", "2025", "2026"]:
    f = [item("Årstall", [aar]), item("Nivåkode", ["B3", "B4", "M5"])]
    a = hent(body(379, f, group_by=G + ["Kvalifisert"]), f"379_tot_{aar}")
    b = hent(body(379, f + [item("Prioritet", ["1"])], group_by=G), f"379_prio1_{aar}")
    c = hent(body(379, f + [item("Prioritet", ["1"])], group_by=G + ["Kjønn"]), f"379_prio1_kjonn_{aar}")
    print(aar, len(a), len(b), len(c))
