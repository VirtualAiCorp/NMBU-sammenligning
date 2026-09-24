import { ExternalLink, Wallet } from 'lucide-react';
import { CAMPUS, STUDIEAVGIFT } from '../data/prisCampusData';
import type { LandsamGroup } from '../data/landsamAdmissionData';

/**
 * Studieavgift og campusfordeling for de private konkurrentene i en programgruppe (BI og Kristiania).
 * NMBU og de andre statlige tar ikke studieavgift for ordinære gradsstudier.
 */
const nf = (v: number) => v.toLocaleString('nb-NO');

export function PrisOgCampus({ group, colorFor }: { group: LandsamGroup; colorFor: (id: string) => string }) {
  const rader = group.entries.filter((e) => STUDIEAVGIFT[e.id] || CAMPUS[e.id]);
  if (!rader.length) return null;
  const nmbu = group.entries.find((e) => group.nmbuIds.includes(e.id));
  const hentet = rader.map((e) => STUDIEAVGIFT[e.id]?.hentet).find(Boolean);
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: '#fff', border: '1px solid var(--nmbu-neutral-3)' }}>
      <div className="flex items-center gap-2 mb-1" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>
        <Wallet className="w-4 h-4" /> Pris og studiested hos de private
      </div>
      <div style={{ fontSize: 12, color: 'var(--nmbu-neutral-2)', marginBottom: 10 }}>
        Studieavgift for studieåret 2026–2027 fra programsidene, og hvor studentene går (registrerte studenter høsten, alle årskull, DBH 124).
        BIs opptakstall over gjelder alle campuser og nett samlet.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: 'var(--nmbu-beige-light)', borderBottom: '2px solid var(--nmbu-neutral-3)', color: 'var(--nmbu-neutral-2)' }}>
              <th className="px-3 py-2 text-left">Program</th>
              <th className="px-3 py-2 text-right whitespace-nowrap">Studieavgift per år</th>
              <th className="px-3 py-2 text-right whitespace-nowrap">Hele løpet</th>
              <th className="px-3 py-2 text-left">Registrerte per campus</th>
            </tr>
          </thead>
          <tbody>
            {nmbu && (
              <tr style={{ borderBottom: '1px solid var(--nmbu-beige-light)', backgroundColor: 'var(--nmbu-green-4)' }}>
                <td className="px-3 py-2" style={{ fontWeight: 600 }}><span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: colorFor(nmbu.id) }} />{nmbu.shortName}</td>
                <td className="px-3 py-2 text-right" style={{ fontWeight: 700 }}>0 kr</td>
                <td className="px-3 py-2 text-right">0 kr</td>
                <td className="px-3 py-2" style={{ color: 'var(--nmbu-neutral-2)' }}>Ås · bare semesteravgift til studentsamskipnaden, som ved de andre statlige</td>
              </tr>
            )}
            {rader.map((e) => {
              const p = STUDIEAVGIFT[e.id];
              const c = CAMPUS[e.id]?.at(-1);
              const sum = c ? c.campuser.reduce((s, x) => s + x.antall, 0) : 0;
              const aar = group.level === 'bachelor' ? 3 : 2;
              return (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--nmbu-beige-light)' }}>
                  <td className="px-3 py-2" style={{ fontWeight: 600 }}>
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: colorFor(e.id) }} />{e.shortName}
                    {p?.merknad && <div style={{ fontSize: 10, fontWeight: 400, color: 'var(--nmbu-neutral-2)', maxWidth: 320 }}>{p.merknad}</div>}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap" style={{ fontWeight: 700 }}>
                    {p ? <a href={p.url} target="_blank" rel="noreferrer" title="Programsiden" className="inline-flex items-center gap-1" style={{ color: 'var(--nmbu-green-dark)' }}>{nf(p.perAar)} kr <ExternalLink className="w-3 h-3" /></a> : '–'}
                    {p?.perSemester && <div style={{ fontSize: 10, fontWeight: 400, color: 'var(--nmbu-neutral-2)' }}>{nf(p.perSemester)} kr per semester</div>}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{p ? `${nf(p.perAar * aar)} kr` : '–'}</td>
                  <td className="px-3 py-2">
                    {c ? (
                      <div className="flex flex-col gap-1" style={{ minWidth: 260 }}>
                        <div className="flex h-2 rounded overflow-hidden" style={{ backgroundColor: 'var(--nmbu-beige-light)' }}>
                          {c.campuser.map((x, i) => <div key={x.navn} title={`${x.navn}: ${nf(x.antall)}`} style={{ width: `${(100 * x.antall) / sum}%`, backgroundColor: colorFor(e.id), opacity: 1 - i * 0.16 }} />)}
                        </div>
                        <div style={{ fontSize: 11 }}>
                          {c.campuser.map((x) => `${x.navn} ${nf(x.antall)} (${Math.round((100 * x.antall) / sum)} %)`).join(' · ')}
                          <span style={{ color: 'var(--nmbu-neutral-2)' }}> · høsten {c.aar}</span>
                        </div>
                      </div>
                    ) : '–'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 11, color: 'var(--nmbu-neutral-2)', marginTop: 6 }}>
        «Hele løpet» = pris per år × normert tid ({group.level === 'bachelor' ? '3 år' : '2 år'}), uten prisøkning. BI-masterne: pris for eksterne søkere (BIs egne kandidater betaler mindre).
        Kristiania oppgir pris per semester. Priser hentet {hentet}; oppdateres hver vår.
      </div>
    </div>
  );
}
