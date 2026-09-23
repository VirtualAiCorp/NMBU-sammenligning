// Navn og beskrivelser for fakultetene. Liten modul: brukes av forsiden og menyene uten å laste fakultetsdataene.
export type FacultyId = 'hh' | 'landsam' | 'realtek' | 'biovit' | 'kbm' | 'mina' | 'vet';

export interface FacultyMeta {
  id: FacultyId;
  /** Fullt navn, f.eks. «Fakultet for landskap og samfunn». */
  label: string;
  /** Kortform, f.eks. «LANDSAM». */
  shortLabel: string;
  /** Undertittel på fakultetskortet. */
  subtitle: string;
  /** Beskrivelsen på fakultetskortet. */
  desc: string;
}

export const FACULTY_META: Record<FacultyId, FacultyMeta> = {
  hh: {
    id: 'hh',
    label: 'Handelshøyskolen',
    shortLabel: 'HH',
    subtitle: 'Økonomi og administrasjon, samfunnsøkonomi, økonomi, ledelse og IT',
    desc: 'Handelshøyskolen på samme format som de andre fakultetene: opptak, emnekarakterer, gjennomføring, studentene, Studiebarometeret, fagmiljø, bolig, økonomi og inntekt, mot de samme konkurrentene som i den opprinnelige HH-analysen.',
  },
  landsam: {
    id: 'landsam',
    label: 'Fakultet for landskap og samfunn',
    shortLabel: 'LANDSAM',
    subtitle: 'Eiendom, landskapsarkitektur, by- og regionplanlegging m.fl.',
    desc: 'Opptakstall, poenggrenser, emnekarakterer, emnekobling på tvers, studieplaner, Studiebarometeret og markedsstatus for fakultetets studieprogram, sammenlignet med konkurrerende program.',
  },
  realtek: {
    id: 'realtek',
    label: 'Fakultet for realfag og teknologi',
    shortLabel: 'REALTEK',
    subtitle: 'Sivilingeniør, datavitenskap, industriell økonomi m.fl.',
    desc: 'Opptakstall, poenggrenser, emnekarakterer, emnekobling på tvers, studieplaner, Studiebarometeret og markedsstatus for fakultetets studieprogram, sammenlignet med konkurrerende program.',
  },
  biovit: {
    id: 'biovit',
    label: 'Fakultet for biovitenskap',
    shortLabel: 'BIOVIT',
    subtitle: 'Biologi, husdyr, planter og akvakultur',
    desc: 'Opptakstall, poenggrenser, emnekarakterer, emnekobling på tvers, studieplaner, Studiebarometeret og markedsstatus for fakultetets studieprogram, sammenlignet med konkurrerende program.',
  },
  kbm: {
    id: 'kbm',
    label: 'Fakultet for kjemi, bioteknologi og matvitenskap',
    shortLabel: 'KBM',
    subtitle: 'Bioteknologi, kjemi og matvitenskap',
    desc: 'Opptakstall, poenggrenser, emnekarakterer, emnekobling på tvers, studieplaner, Studiebarometeret og markedsstatus for fakultetets studieprogram, sammenlignet med konkurrerende program.',
  },
  mina: {
    id: 'mina',
    label: 'Fakultet for miljøvitenskap og naturforvaltning',
    shortLabel: 'MINA',
    subtitle: 'Skogfag, økologi, naturforvaltning og fornybar energi',
    desc: 'Opptakstall, poenggrenser, emnekarakterer, emnekobling på tvers, studieplaner, Studiebarometeret og markedsstatus for fakultetets studieprogram, sammenlignet med konkurrerende program.',
  },
  vet: {
    id: 'vet',
    label: 'Veterinærhøgskolen',
    shortLabel: 'VET',
    subtitle: 'Veterinærmedisin og dyrepleie',
    desc: 'Opptakstall, poenggrenser, emnekarakterer, studieplaner, Studiebarometeret og markedsstatus for veterinærmedisin og dyrepleie. Veterinærmedisin er eneste norske tilbud og vises med medisinstudiene som referanse; dyrepleie sammenlignes med Nord universitet.',
  },
};

export const FACULTY_IDS: FacultyId[] = ['landsam', 'realtek', 'biovit', 'kbm', 'mina', 'vet'];
/** Alle fakulteter med standardformat, inkludert Handelshøyskolen (som har eget kort på forsiden). */
export const ALL_FACULTY_IDS: FacultyId[] = ['hh', ...FACULTY_IDS];

/** Vises når et fakultet ennå ikke har noen data i de genererte modulene. */
export const INGEN_DATA_TEKST = 'Ingen data lagt inn ennå for dette fakultetet';
