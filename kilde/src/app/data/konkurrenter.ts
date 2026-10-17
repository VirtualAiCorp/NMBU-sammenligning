// Konkurrentprofilene under Handelshøyskolen: én institusjon om gangen, satt sammen av dataene HH allerede har
// (opptak, emner og karakterer, gjennomføring, studentene, Studiebarometeret, fagmiljø og økonomi) pluss
// UHR-kartleggingen i courseMapping.ts. Nye konkurrenter legges til her; programmene må finnes i data/hh/programkart.json.

export interface KonkurrentProgram {
  /** Oppføringen i HHs programkart (opptak, gjennomføring, studentene, Studiebarometeret, emner). */
  entryId: string;
  /** NMBU-programmet det sammenlignes med, eller null når NMBU ikke har et tilsvarende program. */
  nmbuId: string | null;
  /** Opptaksgruppen i HH-dataene (oa, moa, mei …). */
  gruppe: string;
  etikett: string;
}

export interface Konkurrent {
  id: string;
  kort: string;
  navn: string;
  /** DBH-institusjonskode. */
  inst: string;
  /** Enheten i staffData (DBH 210) som eier økonomiprogrammene. */
  enhet: string;
  enhetNavn: string;
  studiested: string;
  nettside: string;
  /** Nøkkelen i COURSE_MAPPING (UHR-rammeplanen for bachelor i økonomi og administrasjon). */
  uhr: string;
  programmer: KonkurrentProgram[];
  merknad?: string;
}

export const KONKURRENTER: Konkurrent[] = [
  {
    id: 'oslomet',
    kort: 'OsloMet',
    navn: 'OsloMet – storbyuniversitetet',
    inst: '1175',
    enhet: '1175_530',
    enhetNavn: 'Fakultet for samfunnsvitenskap (SAM)',
    studiested: 'Oslo (Pilestredet)',
    nettside: 'https://www.oslomet.no/studier/sam/okonomi-administrasjon',
    uhr: 'oslomet',
    programmer: [
      { entryId: 'oslomet_oa', nmbuId: 'nmbu_oa', gruppe: 'oa', etikett: 'Økonomi og administrasjon (bachelor)' },
      { entryId: 'oslomet_siv', nmbuId: null, gruppe: 'oa', etikett: 'Økonomi og administrasjon, siviløkonom (5 år)' },
      { entryId: 'oslomet_moa', nmbuId: 'nmbu_moa', gruppe: 'moa', etikett: 'Økonomi og administrasjon (master)' },
      { entryId: 'oslomet_mei', nmbuId: 'nmbu_mei', gruppe: 'mei', etikett: 'Entreprenørskap (master)' },
    ],
    merknad: 'Handelshøyskolen ved OsloMet er ikke egen enhet i DBH. Fagmiljøtallene gjelder hele SAM-fakultetet, som også har journalistikk, sosialfag og offentlig administrasjon.',
  },
  {
    id: 'hiof',
    kort: 'HiØ',
    navn: 'Høgskolen i Østfold',
    inst: '0256',
    enhet: '0256_370',
    enhetNavn: 'Fakultet for informasjonsteknologi, ingeniørfag og økonomi',
    studiested: 'Halden',
    nettside: 'https://www.hiof.no/studier/programmer/bokad-bachelorstudium-i-okonomi-og-administrasjon/oppbygging/',
    uhr: 'hio',
    programmer: [
      { entryId: 'hiof_oa', nmbuId: 'nmbu_oa', gruppe: 'oa', etikett: 'Økonomi og administrasjon (bachelor)' },
      { entryId: 'hiof_is', nmbuId: 'nmbu_olit', gruppe: 'olit', etikett: 'Informasjonssystemer (bachelor)' },
    ],
    merknad: 'Økonomifagene ved HiØ ligger i samme fakultet som IT og ingeniørfag, så fagmiljøtallene gjelder hele fakultetet. HiØ har ingen master i økonomi og administrasjon i HHs sammenligninger.',
  },
];

/** Neste institusjoner i rekken (vises som «kommer»). */
export const KONKURRENTER_KOMMER = ['USN', 'INN', 'Kristiania', 'BI'];

export const konkurrent = (id: string | null | undefined) => KONKURRENTER.find((k) => k.id === id) ?? KONKURRENTER[0];
