// GENERERT av scripts/build-eierskap.py 2026-09-24 – ikke rediger for hånd.
// Kilder: Brønnøysundregistrene (Enhetsregisteret, roller, Regnskapsregisteret) og Prop. 1 S (statsbudsjettet, kap. 260).
export interface Arsregnskap { aar: number; morselskap: boolean; driftsinntekter: number; driftskostnader: number; driftsresultat: number; finansnetto: number; aarsresultat: number; egenkapital: number; sumEiendeler: number; }
export interface Statsbudsjettlinje { belop: number; post: number; kilde: string; url: string; }
export interface Eierskap { inst: string; orgnr: string; navn: string; orgform: string; privat: boolean; stiftet: string | null; ansatte: number | null;
  styreleder: string | null; dagligLeder: string | null; styremedlemmer: number; datterselskap: { navn: string; orgnr: string }[];
  regnskap: Arsregnskap | null; statsbudsjett: Record<string, Statsbudsjettlinje>; }
export const EIERSKAP_HENTET = '2026-09-24';
export const EIERSKAP: Record<string, Eierskap> = {
 "1173": {
  "inst": "1173",
  "orgnr": "969159570",
  "navn": "NORGES MILJØ- OG BIOVITENSKAPELIGE UNIVERSITET (NMBU)",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 2310,
  "styreleder": "Solve Sæbø",
  "dagligLeder": "Per Eirik Lund",
  "styremedlemmer": 11,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 1695344000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "1150": {
  "inst": "1150",
  "orgnr": "974767880",
  "navn": "NORGES TEKNISK-NATURVITENSKAPELIGE UNIVERSITET NTNU",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 10585,
  "styreleder": null,
  "dagligLeder": "Bjørn Haugstad",
  "styremedlemmer": 0,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 8583369000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "1110": {
  "inst": "1110",
  "orgnr": "971035854",
  "navn": "UNIVERSITETET I OSLO",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 9039,
  "styreleder": "Ragnhild Helene Hennum",
  "dagligLeder": "Ellen Johanne Grov Caesar",
  "styremedlemmer": 11,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 7302468000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "1120": {
  "inst": "1120",
  "orgnr": "874789542",
  "navn": "UNIVERSITETET I BERGEN",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 5453,
  "styreleder": "Margareth Hagen",
  "dagligLeder": "Tore Tungodden",
  "styremedlemmer": 11,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 4589045000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "1130": {
  "inst": "1130",
  "orgnr": "970422528",
  "navn": "UNIVERSITETET I TROMSØ - NORGES ARKTISKE UNIVERSITET",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 5004,
  "styreleder": null,
  "dagligLeder": "Odd Arne Paulsen",
  "styremedlemmer": 0,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 4276564000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "1160": {
  "inst": "1160",
  "orgnr": "971564679",
  "navn": "UNIVERSITETET I STAVANGER",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 2519,
  "styreleder": "Anne Marit Panengstuen",
  "dagligLeder": "Klaus Mohn",
  "styremedlemmer": 13,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 2054484000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "1171": {
  "inst": "1171",
  "orgnr": "970546200",
  "navn": "UNIVERSITETET I AGDER",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 2069,
  "styreleder": "Sunniva Whittaker",
  "dagligLeder": "Seunn Smith-Tønnessen",
  "styremedlemmer": 11,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 1990904000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "1174": {
  "inst": "1174",
  "orgnr": "970940243",
  "navn": "NORD UNIVERSITET",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 1871,
  "styreleder": "Øyvind Fylling-Jensen",
  "dagligLeder": "Hanne Eleonora Solheim Hansen",
  "styremedlemmer": 11,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 1846729000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "1175": {
  "inst": "1175",
  "orgnr": "997058925",
  "navn": "OSLOMET - STORBYUNIVERSITETET",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 3436,
  "styreleder": null,
  "dagligLeder": "Christen Krogh",
  "styremedlemmer": 0,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 3229635000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "1176": {
  "inst": "1176",
  "orgnr": "911770709",
  "navn": "UNIVERSITETET I SØRØST-NORGE",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 2534,
  "styreleder": null,
  "dagligLeder": "Pia Cecilie Bing-Jonsson",
  "styremedlemmer": 0,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 2353196000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "1177": {
  "inst": "1177",
  "orgnr": "918108467",
  "navn": "UNIVERSITETET I INNLANDET",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 1687,
  "styreleder": "Maren Kyllingstad",
  "dagligLeder": "Peer Jacob Svenkerud",
  "styremedlemmer": 6,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 1531613000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "0238": {
  "inst": "0238",
  "orgnr": "917641404",
  "navn": "HØGSKULEN PÅ VESTLANDET",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 2475,
  "styreleder": "Arvid Hallén",
  "dagligLeder": "Helge Skugstad",
  "styremedlemmer": 10,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 2539260000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "0256": {
  "inst": "0256",
  "orgnr": "971567376",
  "navn": "HØGSKOLEN I ØSTFOLD",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 848,
  "styreleder": null,
  "dagligLeder": "Knut-Walther Nordahl",
  "styremedlemmer": 0,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 896629000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "0236": {
  "inst": "0236",
  "orgnr": "974809672",
  "navn": "HØGSKULEN I VOLDA",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 419,
  "styreleder": "Odd Helge Mjellem Tonheim",
  "dagligLeder": "Jan Olav Baarøy",
  "styremedlemmer": 11,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 450550000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "1220": {
  "inst": "1220",
  "orgnr": "971526378",
  "navn": "ARKITEKTUR- OG DESIGNHØGSKOLEN I OSLO",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 245,
  "styreleder": null,
  "dagligLeder": "Ulrika Olofsdotter Espmark Herlofsen",
  "styremedlemmer": 0,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 273704000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "1240": {
  "inst": "1240",
  "orgnr": "974789523",
  "navn": "NORGES HANDELSHØYSKOLE",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 651,
  "styreleder": "Martin Skancke",
  "dagligLeder": "Helge Thorbjørnsen",
  "styremedlemmer": 11,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 669219000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "0232": {
  "inst": "0232",
  "orgnr": "971555483",
  "navn": "HØGSKOLEN I MOLDE",
  "orgform": "Statlig forvaltningsorgan",
  "privat": false,
  "stiftet": null,
  "ansatte": 431,
  "styreleder": "Elin Mordal",
  "dagligLeder": "Øyvind Sørensen",
  "styremedlemmer": 11,
  "datterselskap": [],
  "regnskap": null,
  "statsbudsjett": {
   "2026": {
    "belop": 347036000,
    "post": 50,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "8241": {
  "inst": "8241",
  "orgnr": "971228865",
  "navn": "STIFTELSEN HANDELSHØYSKOLEN BI",
  "orgform": "Stiftelse",
  "privat": true,
  "stiftet": "1968-07-01",
  "ansatte": 1847,
  "styreleder": "Egil Olav Hogna",
  "dagligLeder": "Egil Matsen",
  "styremedlemmer": 8,
  "datterselskap": [],
  "regnskap": {
   "aar": 2025,
   "morselskap": true,
   "driftsinntekter": 2194022000.0,
   "driftskostnader": 2161280000.0,
   "driftsresultat": 32742000.0,
   "finansnetto": -13017000.0,
   "aarsresultat": 18088000.0,
   "egenkapital": 1007046000.0,
   "sumEiendeler": 2063492000.0
  },
  "statsbudsjett": {
   "2026": {
    "belop": 445553000,
    "post": 70,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "8253": {
  "inst": "8253",
  "orgnr": "954831604",
  "navn": "HØYSKOLEN KRISTIANIA - ERNST G MORTENSENS STIFTELSE",
  "orgform": "Stiftelse",
  "privat": true,
  "stiftet": "1976-10-04",
  "ansatte": 1140,
  "styreleder": "Kyrre Lekve",
  "dagligLeder": "Solfrid Lind",
  "styremedlemmer": 10,
  "datterselskap": [
   {
    "navn": "Fagskolen Kristiania AS",
    "orgnr": "998632307"
   }
  ],
  "regnskap": {
   "aar": 2025,
   "morselskap": true,
   "driftsinntekter": 1454242565.0,
   "driftskostnader": 1557829269.0,
   "driftsresultat": -103586704.0,
   "finansnetto": 49678216.0,
   "aarsresultat": -53908488.0,
   "egenkapital": 732171758.0,
   "sumEiendeler": 1306785060.0
  },
  "statsbudsjett": {
   "2026": {
    "belop": 409598000,
    "post": 70,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 },
 "8223": {
  "inst": "8223",
  "orgnr": "995189186",
  "navn": "NLA HØGSKOLEN AS",
  "orgform": "Aksjeselskap",
  "privat": true,
  "stiftet": "2009-12-09",
  "ansatte": 336,
  "styreleder": "Magne Suphellen",
  "dagligLeder": "Sigbjørn Reidar Sødal",
  "styremedlemmer": 10,
  "datterselskap": [],
  "regnskap": {
   "aar": 2025,
   "morselskap": false,
   "driftsinntekter": 432807012.0,
   "driftskostnader": 418690591.0,
   "driftsresultat": 14116421.0,
   "finansnetto": 11046892.0,
   "aarsresultat": 25163313.0,
   "egenkapital": 163497825.0,
   "sumEiendeler": 271055079.0
  },
  "statsbudsjett": {
   "2026": {
    "belop": 349873000,
    "post": 70,
    "kilde": "Prop. 1 S (2025–2026) Kunnskapsdepartementet, tabell 2.1",
    "url": "https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123553/?ch=7"
   }
  }
 }
};
