import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Search, Sparkles, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { StyrepapirIndeks, marker, type StyrepapirTekst, type Treff } from '../data/styrepapirSok';
import type { MarketInstitution } from '../data/faculties';

/**
 * «Søk og spør i styrepapirene»: søk i teksten fra PDF-ene i markedsstatus (i nettleseren), med dokument og sidetall og lenke
 * rett til siden. «Lag svar med KI» sender spørsmålet og de beste utdragene (ikke hele dokumentene) til Mistral via
 * Cloudflare-funksjonen /api/markedsstatus-svar, og svaret viser kildene som [1], [2] … .
 */
const EKSEMPLER = ['opptaksrammer 2027', 'nye studieprogram økonomi', 'budsjett underskudd', 'nedleggelse av studieprogram', 'studieplasser økonomi og administrasjon'];

export function StyrepapirSok({ fakultet, fakultetNavn, institusjonsdata = [] }: { fakultet: string; fakultetNavn: string; institusjonsdata?: MarketInstitution[] }) {
  const [data, setData] = useState<StyrepapirTekst | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [sokt, setSokt] = useState('');
  const [inst, setInst] = useState('');
  const [svar, setSvar] = useState<{ tekst: string; kilder: Treff[]; sammendrag: string[]; modell?: string } | null>(null);
  const [svarFeil, setSvarFeil] = useState<string | null>(null);
  const [laster, setLaster] = useState(false);
  const aktiv = useRef(false);

  const hent = () => {
    if (aktiv.current) return;
    aktiv.current = true;
    fetch(`${import.meta.env.BASE_URL}markedsstatus/${fakultet}/tekst.json`)
      .then((r) => (r.ok && (r.headers.get('content-type') ?? '').includes('json') ? r.json() : Promise.reject(new Error('mangler'))))
      .then(setData).catch(() => setFeil('Teksten fra styrepapirene er ikke lastet opp for dette fakultetet ennå.'));
  };
  useEffect(() => { setData(null); setFeil(null); aktiv.current = false; setSvar(null); }, [fakultet]);

  const indeks = useMemo(() => (data ? new StyrepapirIndeks(data) : null), [data]);
  const institusjoner = useMemo(() => (data ? [...new Set(data.docs.map((d) => d.inst))].sort((a, b) => a.localeCompare(b, 'nb')) : []), [data]);
  // Nevnes en institusjon i spørsmålet («Hva sier UiA om …»), brukes den som filter i stedet for som søkeord.
  // «INN» og «Nord» er også vanlige ord, så de må skrives med riktig store bokstaver.
  const tolket = useMemo(() => {
    if (inst || !sokt) return { tekst: sokt, inst: inst };
    for (const i of institusjoner) {
      const vanlig = ['inn', 'nord'].includes(i.toLowerCase());
      const re = new RegExp(`(^|[^\\p{L}])${i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^\\p{L}])`, vanlig ? 'u' : 'iu');
      if (re.test(sokt)) return { tekst: sokt.replace(re, '$1'), inst: i };
    }
    return { tekst: sokt, inst: '' };
  }, [sokt, inst, institusjoner]);
  const treff = useMemo(() => (indeks && tolket.tekst ? indeks.sok(tolket.tekst, 12, tolket.inst || undefined) : []), [indeks, tolket]);

  const sok = (tekst = q) => { hent(); setSokt(tekst.trim()); setSvar(null); setSvarFeil(null); };

  const lagSvar = async () => {
    if (!treff.length) return;
    setLaster(true); setSvar(null); setSvarFeil(null);
    // Kuraterte sammendrag (markedsstatus-kortene) for institusjonene i treffene, i treffrekkefølge, maks 6
    const instIRekkefolge = [...new Set(treff.map((t) => t.dok.inst))].slice(0, 6);
    const sammendrag = instIRekkefolge.map((navn) => institusjonsdata.find((i) => i.name === navn)).filter((i): i is MarketInstitution => !!i)
      .map((i) => ({ inst: i.name, enhet: i.enhet, oppsummering: i.oppsummering, punkter: i.punkter }));
    try {
      const r = await fetch('/api/markedsstatus-svar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sporsmal: sokt, fakultet: fakultetNavn, sammendrag, utdrag: treff.map((t) => ({ nr: t.nr, inst: t.dok.inst, dok: t.dok.label, dato: t.dok.dato, side: t.side, tekst: t.tekst })) }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.svar) throw new Error(j?.feil ?? (r.status === 404 ? 'KI-svar er ikke tilgjengelig her (bare på den publiserte siden).' : `Feil ${r.status}`));
      setSvar({ tekst: j.svar, kilder: treff, sammendrag: sammendrag.map((s) => s.inst), modell: j.modell });
    } catch (e) {
      setSvarFeil(e instanceof Error ? e.message : 'Noe gikk galt.');
    } finally { setLaster(false); }
  };

  const kildeLenke = (t: Treff) => `${t.dok.fil}#page=${t.side}`;

  return (
    <div className="rounded-xl p-6" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff' }}>
      <div className="flex items-center gap-2 mb-1" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>
        <Search className="w-4 h-4" /> Søk og spør i styrepapirene
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--nmbu-neutral-2)', lineHeight: 1.6 }}>
        Søk i teksten fra alle dokumentene under (side for side). Treffene viser institusjon, dokument og sidetall, med lenke rett til siden.
        «Lag svar med KI» lar Mistral (EU) oppsummere svaret ut fra de beste treffene, med kildehenvisninger. Sjekk alltid kilden.
      </p>
      <form onSubmit={(e) => { e.preventDefault(); sok(); }} className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={hent} placeholder="F.eks. «Hva sier UiA om opptaksrammer for 2027?»"
          className="flex-1 min-w-[240px] px-3 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', color: 'var(--nmbu-neutral)' }} />
        {institusjoner.length > 0 && (
          <select value={inst} onChange={(e) => { setInst(e.target.value); setSvar(null); }} className="px-3 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--nmbu-neutral-3)', backgroundColor: '#fff', color: 'var(--nmbu-neutral-1)' }}>
            <option value="">Alle institusjoner</option>
            {institusjoner.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        )}
        <button type="submit" className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', fontWeight: 600 }}>Søk</button>
      </form>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {EKSEMPLER.map((e) => (
          <button key={e} onClick={() => { setQ(e); sok(e); }} className="px-2.5 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'var(--nmbu-beige-light)', color: 'var(--nmbu-neutral-1)' }}>{e}</button>
        ))}
      </div>

      {feil && <div className="mt-3 text-xs" style={{ color: '#b91c1c' }}>{feil}</div>}
      {sokt && !data && !feil && <div className="mt-3 text-xs flex items-center gap-2" style={{ color: 'var(--nmbu-neutral-2)' }}><Loader2 className="w-3.5 h-3.5 animate-spin" /> Laster teksten fra styrepapirene …</div>}
      {sokt && data && treff.length === 0 && <div className="mt-3 text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>Ingen treff på «{sokt}». Prøv andre ord (f.eks. «studieplasser» i stedet for «opptaksrammer»).</div>}

      {treff.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <div className="text-xs" style={{ color: 'var(--nmbu-neutral-2)' }}>{treff.length} beste treff for «{sokt}»{tolket.inst ? ` i dokumentene fra ${tolket.inst}` : ''}</div>
            <button onClick={lagSvar} disabled={laster} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              style={{ backgroundColor: 'var(--nmbu-green-4)', color: 'var(--nmbu-green-dark)', fontWeight: 600, opacity: laster ? 0.6 : 1 }}>
              {laster ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Lag svar med KI (Mistral)
            </button>
          </div>

          {svarFeil && <div className="mb-3 text-xs rounded-lg px-3 py-2" style={{ backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>{svarFeil}</div>}
          {svar && (
            <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: 'var(--nmbu-beige-light)', border: '1px solid var(--nmbu-green-3)', lineHeight: 1.65, color: 'var(--nmbu-neutral)' }}>
              <div className="flex items-center gap-1.5 mb-1 text-xs" style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}><Sparkles className="w-3.5 h-3.5" /> KI-svar ({svar.modell ?? 'Mistral'}), ut fra treffene under og sammendragene i kortene</div>
              <SvarTekst tekst={svar.tekst} kilder={svar.kilder} sammendrag={svar.sammendrag} lenke={kildeLenke} />
              <div className="text-xs mt-1" style={{ color: 'var(--nmbu-neutral-2)' }}>KI kan ta feil. Klikk på kildenumrene for å se siden i dokumentet; [S1] osv. viser til sammendragene i institusjonskortene lenger ned.</div>
            </div>
          )}

          <ol className="space-y-2">
            {treff.map((t) => (
              <li key={`${t.dok.fil}-${t.side}`} className="rounded-lg px-3 py-2" style={{ border: '1px solid var(--nmbu-beige-light)', backgroundColor: 'var(--nmbu-beige-light)' }}>
                <div className="flex items-center gap-2 flex-wrap text-xs mb-1">
                  <span className="px-1.5 rounded" style={{ backgroundColor: 'var(--nmbu-green-dark)', color: '#fff', fontWeight: 700 }}>{t.nr}</span>
                  <span style={{ fontWeight: 700, color: 'var(--nmbu-green-dark)' }}>{t.dok.inst}</span>
                  <FileText className="w-3 h-3" style={{ color: 'var(--nmbu-neutral-2)' }} />
                  <span style={{ color: 'var(--nmbu-neutral-1)' }}>{t.dok.label}{t.dok.dato ? ` (${t.dok.dato})` : ''}</span>
                  <a href={kildeLenke(t)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 ml-auto" style={{ color: 'var(--nmbu-green-dark)', fontWeight: 600 }}>
                    side {t.side} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-xs" style={{ color: 'var(--nmbu-neutral-1)', lineHeight: 1.55 }}>
                  {marker(t.utdrag, sokt).map((b, i) => (b.m ? <mark key={i} style={{ backgroundColor: '#FDE68A', color: 'inherit', padding: 0 }}>{b.t}</mark> : <span key={i}>{b.t}</span>))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/** Enkel visning av svaret: **fet**, punktlister og kildehenvisninger [n] (lenke til siden) og [Sn] (sammendrag). */
function SvarTekst({ tekst, kilder, sammendrag, lenke }: { tekst: string; kilder: Treff[]; sammendrag: string[]; lenke: (t: Treff) => string }) {
  const inline = (linje: string, k: string) => linje.split(/(\*\*[^*]+\*\*|\[S?\d+\])/).map((del, j) => {
    const fet = del.match(/^\*\*([^*]+)\*\*$/);
    if (fet) return <b key={`${k}-${j}`} style={{ color: 'var(--nmbu-green-dark)' }}>{fet[1]}</b>;
    const kilde = del.match(/^\[(\d+)\]$/);
    const t = kilde ? kilder.find((x) => x.nr === Number(kilde[1])) : undefined;
    if (t) return <a key={`${k}-${j}`} href={lenke(t)} target="_blank" rel="noreferrer" title={`${t.dok.inst}: ${t.dok.label}, side ${t.side}`} style={{ color: 'var(--nmbu-green-dark)', fontWeight: 700 }}>{del}</a>;
    const s = del.match(/^\[S(\d+)\]$/);
    if (s && sammendrag[Number(s[1]) - 1]) return <span key={`${k}-${j}`} title={`Sammendraget for ${sammendrag[Number(s[1]) - 1]} i institusjonskortet`} style={{ color: 'var(--nmbu-green-6)', fontWeight: 700, cursor: 'help' }}>{del}</span>;
    return <span key={`${k}-${j}`}>{del}</span>;
  });
  const linjer = tekst.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const ut: ReactNode[] = [];
  let liste: ReactNode[] = [];
  const tomListe = (k: number) => { if (liste.length) { ut.push(<ul key={`ul${k}`} className="list-disc pl-5 mb-2">{liste}</ul>); liste = []; } };
  linjer.forEach((l, i) => {
    const m = l.match(/^[-•*]\s+(.*)$/);
    if (m) liste.push(<li key={i} className="mb-0.5">{inline(m[1], String(i))}</li>);
    else { tomListe(i); ut.push(<p key={i} className="mb-1.5">{inline(l.replace(/^#+\s*/, ''), String(i))}</p>); }
  });
  tomListe(linjer.length);
  return <>{ut}</>;
}
