// Røyktest: klikker gjennom alle fakulteter, moduler og NMBU-sider i dashboard-oppsettet og rapporterer sidefeil,
// konsollfeil, tomme sider, hvite flater i mørk modus og NMBU-grønt som ikke følger fargetemaet.
// Krever playwright-core og Chrome: kjør fra en mappe der playwright-core er installert, f.eks.
//   npm i playwright-core && node /sti/til/scripts/royktest.mjs http://localhost:5173 nmbu:light,nmbu:dark,vac:light
// Skjermbilder av funn og royk/rapport.json skrives i gjeldende mappe.
import { chromium } from 'playwright-core';
import fs from 'fs';
const BASE = process.argv[2] ?? 'http://localhost:5173';
const KONFIG = (process.argv[3] ?? 'nmbu:light').split(',').map((k) => k.split(':'));
const FAK = ['HH', 'REALTEK', 'LANDSAM', 'MINA', 'VET', 'BIOVIT', 'KBM'];
const MOD = ['Opptak', 'Emner og karakterer', 'Gjennomføring', 'Studentene', 'Studiebarometeret', 'Markedsstatus', 'Inntekt', 'Arbeidsmarkedet', 'Fagmiljøet', 'Søkergrunnlaget', 'Bolig', 'Økonomi'];
const NMBU = ['Oversikt', 'Alle emner ved NMBU', 'Fagmiljøet', 'Søkergrunnlaget', 'Bolig og studentboliger', 'Økonomi'];
const b = await chromium.launch({ channel: 'chrome', headless: true });
const rapport = []; let besokt = 0;
for (const [farge, modus] of KONFIG) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'nb-NO' });
  await ctx.addInitScript(([f, m]) => { localStorage.setItem('fargetema', f); localStorage.setItem('theme', m); localStorage.setItem('layout', 'dashboard'); localStorage.setItem('nmbu-sidemeny', 'bred'); }, [farge, modus]);
  const p = await ctx.newPage();
  let feil = [];
  p.on('pageerror', (e) => feil.push('SIDEFEIL ' + e.message.slice(0, 200)));
  p.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource.*(api\/chat|404)/.test(m.text())) feil.push('KONSOLL ' + m.text().slice(0, 200)); });
  await p.goto(BASE, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  const aside = p.locator('aside').first();
  const sjekk = async (navn) => {
    await p.waitForTimeout(1300);
    const info = await p.evaluate(([farge, modus]) => {
      const main = document.querySelector('main');
      const tekst = (main?.innerText ?? '').trim().length;
      const synlig = (el) => { const r = el.getBoundingClientRect(); return r.width > 30 && r.height > 12 && r.bottom > 0 && r.top < innerHeight * 3; };
      let hvit = 0, gronn = 0; const eks = [];
      for (const el of main ? main.querySelectorAll('*') : []) {
        if (!synlig(el)) continue;
        const cs = getComputedStyle(el);
        if (modus === 'dark' && cs.backgroundColor === 'rgb(255, 255, 255)') { hvit++; if (eks.length < 3) eks.push('hvit:' + el.tagName + '.' + String(el.className).slice(0, 30)); }
        if (farge !== 'nmbu' && [cs.backgroundColor, cs.color, cs.borderTopColor].some((c) => c === 'rgb(2, 92, 79)' || c === 'rgb(0, 154, 129)')) { gronn++; if (eks.length < 6) eks.push('grønn:' + el.tagName + '.' + String(el.className).slice(0, 30) + ' ' + (el.getAttribute('style') ?? '').slice(0, 60)); }
      }
      return { tekst, hvit, gronn, eks };
    }, [farge, modus]);
    besokt++;
    const r = { konfig: `${farge}/${modus}`, side: navn, feil: [...new Set(feil)], ...info };
    if (r.feil.length || r.tekst < 80 || r.hvit || r.gronn) {
      rapport.push(r);
      await p.screenshot({ path: `royk/${farge}-${modus}-${navn.replace(/[^a-zA-ZæøåÆØÅ0-9]+/g, '_')}.png` });
    }
    feil = [];
  };
  for (const f of FAK) {
    await aside.getByRole('button', { name: new RegExp(`^${f}\\b`) }).first().click();
    await sjekk(`${f} · Oversikt`);
    for (const m of MOD) {
      const knapp = aside.getByRole('button', { name: m, exact: true }).filter({ visible: true }).first();
      if (!(await knapp.count())) continue;
      await knapp.click();
      await sjekk(`${f} · ${m}`);
    }
    if (f === 'HH') {
      for (const m of ['Opptak H26 (intern)', 'Opprinnelig HH-analyse']) {
        const k = aside.getByRole('button', { name: m }).filter({ visible: true }).first();
        if (await k.count()) { await k.click(); await sjekk(`HH · ${m}`); await aside.getByRole('button', { name: /^HH\b/ }).first().click(); await p.waitForTimeout(400); }
      }
    }
  }
  for (const n of NMBU) {
    await aside.getByRole('button', { name: n, exact: true }).last().click();
    await sjekk(`NMBU · ${n}`);
  }
  await ctx.close();
  console.log(`${farge}/${modus}: ferdig`);
}
await b.close();
fs.writeFileSync('royk/rapport.json', JSON.stringify(rapport, null, 1));
console.log('besøkt:', besokt, 'funn:', rapport.length);
for (const r of rapport) console.log(`- [${r.konfig}] ${r.side}: tekst=${r.tekst} hvit=${r.hvit} grønn=${r.gronn} ${r.feil.join(' | ')} ${r.eks.join(' ; ')}`);
