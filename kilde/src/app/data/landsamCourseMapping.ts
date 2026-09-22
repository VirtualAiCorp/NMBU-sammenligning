// GENERERT av scripts/build-landsam-course-mapping.py – ikke rediger for hånd. (Stub inntil generatoren er kjørt.)
//
// PLASSHOLDER: koblingene under er satt manuelt ved å lese emnenavnene i
// landsamCourseData.json og plukke de emnene som *sannsynligvis* dekker samme fag.
// De er IKKE kontrollert mot studieplanene, og skal erstattes av generatoren så
// snart den faktiske kartleggingen foreligger. Emnekodene er ekte og finnes i
// LANDSAM_COURSE_GROUPS, slik at fanen viser reelle tall mens vi venter.

export interface CourseTypeLink { entryId: string; emnekoder: string[]; merknad?: string; }
export interface CourseType { id: string; label: string; kategori?: string; desc?: string; note?: string; links: CourseTypeLink[]; }
export interface GroupCourseMapping { groupId: string; note?: string; courseTypes: CourseType[]; }

export const LANDSAM_COURSE_MAPPING: GroupCourseMapping[] = [
  {
    groupId: 'eiendom',
    note: 'Plassholder-kobling. NMBUs femårige eiendomsmaster måles mot HVLs landmåling og eiendomsdesign og mot bachelorene i eiendomsmegling. Der faget er delt i flere emner, summeres karakterene.',
    courseTypes: [
      {
        id: 'eiendomsjus',
        label: 'Eiendomsjus',
        kategori: 'Juss',
        desc: 'Rettsreglene om fast eiendom: rettigheter, overdragelse og meglerens plikter.',
        note: 'Programmene deler faget ulikt. NMBU har et innføringsemne og et emne om rettigheter, meglerbachelorene har to til tre «jus for eiendomsmeglere»-emner som summeres.',
        links: [
          { entryId: 'nmbu_eiendom',        emnekoder: ['JUS110-1', 'JUS310-1'], merknad: 'Innføring i eiendomsjus + Rettigheter i fast eiendom' },
          { entryId: 'hvl_landmaling',      emnekoder: ['LEI300-1'],             merknad: 'Eiendom, matrikkel og jordskifte' },
          { entryId: 'hvl_eiendomsmegling', emnekoder: ['EM6-1003-1', 'EM6-2000-1'] },
          { entryId: 'nord_eiendomsmegling', emnekoder: ['RE217E-1', 'RET2004-1'] },
          { entryId: 'inn_eiendomsmegling', emnekoder: ['3JUS210-1', '3JUS300-1'], merknad: 'Jus II og Jus III; INN navngir ikke emnene som eiendomsjus' },
          { entryId: 'usn_eiendomsmegling', emnekoder: ['EML101B-1', 'EML201B-1'] },
        ],
      },
      {
        id: 'kart-landmaling-gis',
        label: 'Kart, landmåling og GIS',
        kategori: 'Kart og geomatikk',
        desc: 'Oppmåling av eiendom, kartgrunnlag og geografiske informasjonssystemer.',
        note: 'Bare NMBU og HVL Bergen har dette faget; meglerbachelorene har ingen tilsvarende emner.',
        links: [
          { entryId: 'nmbu_eiendom',   emnekoder: ['EIE105-1', 'LAD102-1'], merknad: 'Kart- og landmålingslære + GIS praktisk introduksjon' },
          { entryId: 'hvl_landmaling', emnekoder: ['LEI105-1', 'LEI111-1'], merknad: 'Eiendomslandmåling + GIS og analyse' },
        ],
      },
      {
        id: 'avsluttende-oppgave',
        label: 'Avsluttende oppgave',
        kategori: 'Avsluttende arbeid',
        desc: 'Masteroppgave ved NMBU, bacheloroppgave ved de øvrige.',
        note: 'Oppgavene har ulik størrelse (30 studiepoeng ved NMBU mot 15–20 ved bachelorene), så karakterene er bare grovt sammenlignbare.',
        links: [
          { entryId: 'nmbu_eiendom',        emnekoder: ['M30-EIE-1'] },
          { entryId: 'hvl_landmaling',      emnekoder: ['LEI350-1'] },
          { entryId: 'hvl_eiendomsmegling', emnekoder: ['BO6-2011-1'] },
          { entryId: 'inn_eiendomsmegling', emnekoder: ['3EDMBA300-1'] },
          { entryId: 'usn_eiendomsmegling', emnekoder: ['BAC3040-1'] },
        ],
      },
    ],
  },
  {
    groupId: 'byregion',
    note: 'Plassholder-kobling. NMBUs femårige planleggerutdanning måles mot bachelorer i samfunns- og byplanlegging og mot NTNUs toårige master i fysisk planlegging.',
    courseTypes: [
      {
        id: 'plan-og-forvaltningsrett',
        label: 'Plan- og forvaltningsrett',
        kategori: 'Juss',
        desc: 'Plan- og bygningsloven, forvaltningsrett og saksbehandling i planprosesser.',
        note: 'NMBU har faget delt i to emner (planlegging og byggesak) som summeres. De øvrige har bredere forvaltningsrettsemner, så koblingen er grov.',
        links: [
          { entryId: 'nmbu_byreg',              emnekoder: ['JUS320-1', 'JUS321-1'], merknad: 'Plan- og bygningsrett I + II' },
          { entryId: 'nord_geografi_samfplan',  emnekoder: ['JUR1001-1'] },
          { entryId: 'uia_samfunnsplanlegging', emnekoder: ['JU-200-1'] },
          { entryId: 'hivolda_planlegging',     emnekoder: ['GOV121-1'] },
          { entryId: 'ntnu_fysisk_planlegging', emnekoder: ['AAR4815-1'], merknad: 'Plan og byggeprosess' },
        ],
      },
      {
        id: 'gis-og-kartanalyse',
        label: 'GIS og kartanalyse',
        kategori: 'Metode og verktøy',
        desc: 'Geografiske informasjonssystemer, kartografi og romlig analyse i planlegging.',
        links: [
          { entryId: 'nmbu_byreg',              emnekoder: ['LAD102-1', 'LAD103-1'] },
          { entryId: 'uit_samfunnsplanlegging', emnekoder: ['SPL-2012-1'] },
          { entryId: 'nord_geografi_samfplan',  emnekoder: ['GEO1009-1', 'GEO1043-1'] },
          { entryId: 'hivolda_planlegging',     emnekoder: ['IPA173-1', 'PLA121-1'], merknad: 'Emnene er byttet ut i studieplanen; begge tas med' },
          { entryId: 'ntnu_fysisk_planlegging', emnekoder: ['AAR4841-1'] },
        ],
      },
      {
        id: 'avsluttende-oppgave',
        label: 'Avsluttende oppgave',
        kategori: 'Avsluttende arbeid',
        desc: 'Masteroppgave ved NMBU og NTNU, bacheloroppgave ved de øvrige.',
        note: 'Oppgavene har ulik størrelse (30 studiepoeng på master mot 20 på bachelor).',
        links: [
          { entryId: 'nmbu_byreg',                emnekoder: ['M30-BYREG-1'] },
          { entryId: 'uis_byplan_samfsikkerhet',  emnekoder: ['BYSBAC-1'] },
          { entryId: 'uis_ing_bygg_byplan',       emnekoder: ['BYGBBAC-1'], merknad: 'Bare studieretningen byplanlegging' },
          { entryId: 'uit_samfunnsplanlegging',   emnekoder: ['SPL-2003-1'] },
          { entryId: 'nord_geografi_samfplan',    emnekoder: ['GEO2003-1'] },
          { entryId: 'uia_samfunnsplanlegging',   emnekoder: ['SV-301-1'] },
          { entryId: 'hivolda_planlegging',       emnekoder: ['IPA210A-1'] },
          { entryId: 'ntnu_fysisk_planlegging',   emnekoder: ['FP4400-1'] },
        ],
      },
    ],
  },
];
