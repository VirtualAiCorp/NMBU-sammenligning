// GENERERT av scripts/build-pris-campus.py 2026-09-24 – ikke rediger for hånd.
// Kilder: programsidene (studieavgift, data/<fakultet>/kilder/studieavgift.json) og DBH/HKDIR tabell 124 (registrerte per campus, høst).
export interface Studieavgift { perAar: number; perSemester?: number; internPerAar?: number; merknad?: string; url: string; hentet: string; }
export interface CampusAar { aar: number; campuser: { navn: string; antall: number }[]; }
export const STUDIEAVGIFT: Record<string, Studieavgift> = {
 "bi_oa": {
  "perAar": 86800,
  "merknad": "Deltid (nett): 43 400 kr per år.",
  "url": "https://www.bi.no/studier-og-kurs/bachelorstudier/okonomi-og-administrasjon/",
  "hentet": "2026-09-24"
 },
 "bi_dbh": {
  "perAar": 106400,
  "url": "https://www.bi.no/studier-og-kurs/bachelorstudier/digital-business/",
  "hentet": "2026-09-24"
 },
 "bi_dsb": {
  "perAar": 106400,
  "url": "https://www.bi.no/studier-og-kurs/bachelorstudier/data-science-for-business/",
  "hentet": "2026-09-24"
 },
 "kristiania_oa": {
  "perAar": 84000,
  "perSemester": 42000,
  "url": "https://www.kristiania.no/studier/bachelor/okonomi-og-administrasjon/",
  "hentet": "2026-09-24"
 },
 "kristiania_bod": {
  "perAar": 84000,
  "perSemester": 42000,
  "merknad": "Programsiden videresender til økonomi og administrasjon; prisen er derfra.",
  "url": "https://www.kristiania.no/studier/bachelor/okonomi-og-administrasjon/",
  "hentet": "2026-09-24"
 },
 "bi_moa": {
  "perAar": 128200,
  "internPerAar": 110700,
  "merknad": "Eksterne søkere; BIs egne bachelorkandidater betaler 110 700 kr.",
  "url": "https://www.bi.no/studier-og-kurs/masterstudier/business/",
  "hentet": "2026-09-24"
 },
 "bi_mecon": {
  "perAar": 128200,
  "internPerAar": 110700,
  "merknad": "MSc in Applied Economics tar ikke opp nye studenter; prisen gjelder etterfølgeren MSc in Business, major in Economics (eksterne søkere).",
  "url": "https://www.bi.no/studier-og-kurs/masterstudier/business/major-in-economics/",
  "hentet": "2026-09-24"
 },
 "bi_mei": {
  "perAar": 128200,
  "internPerAar": 110700,
  "merknad": "Eksterne søkere; BIs egne bachelorkandidater betaler 110 700 kr.",
  "url": "https://www.bi.no/studier-og-kurs/masterstudier/innovation-and-entrepreneurship/",
  "hentet": "2026-09-24"
 },
 "kristiania_mei": {
  "perAar": 117800,
  "perSemester": 58900,
  "url": "https://www.kristiania.no/studier/master/innovasjonsledelse/",
  "hentet": "2026-09-24"
 }
};
export const CAMPUS: Record<string, CampusAar[]> = {"bi_oa": [{"aar": 2021, "campuser": [{"navn": "Oslo", "antall": 1451}, {"navn": "Bergen", "antall": 985}, {"navn": "Trondheim", "antall": 566}, {"navn": "Nett", "antall": 323}, {"navn": "Stavanger", "antall": 285}]}, {"aar": 2022, "campuser": [{"navn": "Oslo", "antall": 1226}, {"navn": "Bergen", "antall": 969}, {"navn": "Trondheim", "antall": 544}, {"navn": "Nett", "antall": 285}, {"navn": "Stavanger", "antall": 237}]}, {"aar": 2023, "campuser": [{"navn": "Oslo", "antall": 1222}, {"navn": "Bergen", "antall": 1032}, {"navn": "Trondheim", "antall": 600}, {"navn": "Nett", "antall": 262}, {"navn": "Stavanger", "antall": 229}]}, {"aar": 2024, "campuser": [{"navn": "Oslo", "antall": 1188}, {"navn": "Bergen", "antall": 1112}, {"navn": "Trondheim", "antall": 679}, {"navn": "Nett", "antall": 331}, {"navn": "Stavanger", "antall": 233}]}, {"aar": 2025, "campuser": [{"navn": "Oslo", "antall": 1279}, {"navn": "Bergen", "antall": 1222}, {"navn": "Trondheim", "antall": 823}, {"navn": "Nett", "antall": 396}, {"navn": "Stavanger", "antall": 258}]}], "bi_dbh": [{"aar": 2022, "campuser": [{"navn": "Oslo", "antall": 19}]}, {"aar": 2023, "campuser": [{"navn": "Oslo", "antall": 53}]}, {"aar": 2024, "campuser": [{"navn": "Oslo", "antall": 89}]}, {"aar": 2025, "campuser": [{"navn": "Oslo", "antall": 134}]}], "bi_dsb": [{"aar": 2021, "campuser": [{"navn": "Oslo", "antall": 119}]}, {"aar": 2022, "campuser": [{"navn": "Oslo", "antall": 135}]}, {"aar": 2023, "campuser": [{"navn": "Oslo", "antall": 147}]}, {"aar": 2024, "campuser": [{"navn": "Oslo", "antall": 172}]}, {"aar": 2025, "campuser": [{"navn": "Oslo", "antall": 186}]}], "bi_moa": [{"aar": 2021, "campuser": [{"navn": "Oslo", "antall": 664}, {"navn": "Bergen", "antall": 47}]}, {"aar": 2022, "campuser": [{"navn": "Oslo", "antall": 608}, {"navn": "Bergen", "antall": 46}]}, {"aar": 2023, "campuser": [{"navn": "Oslo", "antall": 545}, {"navn": "Bergen", "antall": 48}]}, {"aar": 2024, "campuser": [{"navn": "Oslo", "antall": 595}, {"navn": "Bergen", "antall": 51}]}, {"aar": 2025, "campuser": [{"navn": "Oslo", "antall": 619}, {"navn": "Bergen", "antall": 54}]}], "bi_mecon": [{"aar": 2021, "campuser": [{"navn": "Oslo", "antall": 19}]}, {"aar": 2022, "campuser": [{"navn": "Oslo", "antall": 15}]}, {"aar": 2023, "campuser": [{"navn": "Oslo", "antall": 6}]}, {"aar": 2024, "campuser": [{"navn": "Oslo", "antall": 3}]}], "bi_mei": [{"aar": 2021, "campuser": [{"navn": "Oslo", "antall": 32}]}, {"aar": 2022, "campuser": [{"navn": "Oslo", "antall": 29}]}, {"aar": 2023, "campuser": [{"navn": "Oslo", "antall": 35}]}, {"aar": 2024, "campuser": [{"navn": "Oslo", "antall": 36}]}, {"aar": 2025, "campuser": [{"navn": "Oslo", "antall": 32}]}], "kristiania_oa": [{"aar": 2021, "campuser": [{"navn": "Oslo", "antall": 208}]}, {"aar": 2022, "campuser": [{"navn": "Oslo", "antall": 207}]}, {"aar": 2023, "campuser": [{"navn": "Oslo", "antall": 217}]}, {"aar": 2024, "campuser": [{"navn": "Oslo", "antall": 211}]}, {"aar": 2025, "campuser": [{"navn": "Oslo", "antall": 286}]}], "kristiania_bod": [{"aar": 2021, "campuser": [{"navn": "Oslo", "antall": 92}]}, {"aar": 2022, "campuser": [{"navn": "Oslo", "antall": 64}]}, {"aar": 2023, "campuser": [{"navn": "Oslo", "antall": 51}]}, {"aar": 2024, "campuser": [{"navn": "Oslo", "antall": 50}]}, {"aar": 2025, "campuser": [{"navn": "Oslo", "antall": 55}]}], "kristiania_mei": [{"aar": 2021, "campuser": [{"navn": "Oslo", "antall": 34}]}, {"aar": 2022, "campuser": [{"navn": "Oslo", "antall": 33}]}, {"aar": 2023, "campuser": [{"navn": "Oslo", "antall": 38}]}, {"aar": 2024, "campuser": [{"navn": "Oslo", "antall": 44}]}, {"aar": 2025, "campuser": [{"navn": "Oslo", "antall": 57}]}]};
