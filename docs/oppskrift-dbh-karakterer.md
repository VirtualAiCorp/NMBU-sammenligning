# Oppskrift: karakterer per emne fra ulike studiesteder (DBH-API, HK-dir)

Bruk DBH sitt åpne API, ikke Karakterweb. Karakterweb bygger på de samme
DBH-tabellene, men det er unødvendig tungvint å hente derfra.

## Endepunkt
POST https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData
Content-Type: application/json. Ingen API-nøkkel trengs.
Svaret er en liste: element [0] er status ({antall, melding}), resten er rader.

## Tabellene
- 308 «Karakterer (aggregert)»: karakterfordelingen. Én rad er institusjon +
  studieprogram + emnekode + karakter + antall kandidater. Har IKKE emnenavn.
- 208 «Emner»: emneregisteret (emnenavn, studiepoeng, nivå, fag, status).
  Brukes til å sette navn på emnekodene fra 308.
- 347 «Studieprogram-grunnregister»: studieprogramkoder og -navn per
  institusjon. Brukes til å finne riktig Studieprogramkode.
- NB: 906 «Eksamensdata detaljert» har INGEN karakterfelt. Ikke bruk den.

## Spørring mot 308 (karakterer)
{
  "tabell_id": 308, "api_versjon": 1, "statuslinje": "J", "kodetekst": "J",
  "desimal_separator": ".",
  "groupBy": ["Institusjonskode","Avdelingskode","Årstall","Semester",
              "Studieprogramkode","Emnekode","Karakter"],
  "sortBy": ["Institusjonskode"],
  "filter": [
    {"variabel":"Institusjonskode","selection":{"filter":"item","values":["1173","1120"],"exclude":[""]}},
    {"variabel":"Årstall","selection":{"filter":"top","values":["2"],"exclude":[""]}}
  ]
}
- "top" med ["2"] gir de to siste årene. Bytt til "item" med bestemte år ved behov.
- Tallfeltet er "Antall kandidater totalt".

## Spørring mot 208 (emnenavn)
Samme oppsett, men med "tabell_id": 208, "variabler": ["*"] og filter på
Institusjonskode, Avdelingskode ("filter":"all","values":["*"]) og Årstall (top 2).

## Utregning
- Karakterpoeng: A=5, B=4, C=3, D=2, E=1, F=0. Snitt = sum(poeng × antall) / sum(antall).
- Strykprosent = antall F / antall med bokstavkarakter.
- G = bestått og H = ikke bestått (emner uten bokstavkarakter). Hold dem UTENFOR
  snittet og vis dem som egen beståttandel.
- Fordeling per emne: andel A–F i prosent, fin som stablet søyle (A grønn → F rød).

## Kobling og fallgruver
1. Emnenavn: koble 308 og 208 på (Institusjonskode, Studieprogramkode, Emnekode).
   Finnes ikke treff, prøv (Institusjonskode, Emnekode) alene. 208 registrerer
   emnet under ett «eier»-program, mens 308 fører karakteren på studentens eget
   program. Omtrent en tredjedel av emnene får likevel ikke navn. Vis da emnekoden.
2. Størrelse: 308 for hele landet er om lag 390 000 rader / 170 MB for to år.
   Filtrer ALLTID på Institusjonskode på serversiden, og filtrer ned til
   studieprogrammene du trenger før noe lagres på disk.
3. Studieprogramkode i DBH er institusjonens interne FS-kode. Den er ikke den
   samme som studiekoden i Samordna opptak. Skal du koble mot SO, må det skje på
   institusjon + normalisert programnavn (fjern «Bachelor i», «deltid» osv.).
   Avvis tvetydige treff: en feil kode gir et helt annet programs karakterer.
4. Variabelnavn varierer mellom tabeller (f.eks. heter avdeling «Avdkode» i
   tabell 707). Hent riktig oppsett ved å åpne https://dbh.hkdir.no/dbhapiklient/
   i en ekte nettleser, skrive tabellnummeret i «Tabell»-feltet og kopiere den
   ferdige «Spørring»-JSON-en. Siden er en JS-app, så en vanlig
   fetch/WebFetch gir ingenting.
5. Etterslep: DBH ligger omtrent ett år bak. Sjekk hvilket år som faktisk
   finnes før du lover ferske tall.
6. Flere varianter av et program i SO kan peke til samme DBH-program og få
   identiske tall. Det er ikke en feil, men ta det med som forbehold.

## Institusjonskoder
Finner du i 347-svaret (feltet Institusjonskode sammen med institusjonsnavnet),
for eksempel NMBU = 1173.
