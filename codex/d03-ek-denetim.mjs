import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { writeFile, readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import 'dotenv/config';

const U = process.env.GIRIS_URL ?? 'http://localhost:3060/';
const base = new URL(U).origin;
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const width of [1440, 390]) {
    const c = await browser.newContext({ viewport: { width, height: width === 1440 ? 900 : 844 } });
    const p = await c.newPage(); const images = [];
    p.on('request', r => { if (new URL(r.url()).pathname === '/_next/image') images.push(r.url()); });
    await p.goto(U); await p.waitForTimeout(5500);
    const groups = {};
    for (const address of images) {
      const u = new URL(address); const key = `${u.searchParams.get('url')} | w=${u.searchParams.get('w')}`;
      groups[key] = (groups[key] ?? 0) + 1;
    }
    assert.ok(images.length > 0); assert.ok(Object.values(groups).every(n => n === 1));
    const src = await p.locator('.hero-media img').first().evaluate(e => e.currentSrc);
    console.log('Açılış currentSrc:', src);
    assert.equal(images.filter(url => url === src).length, 1);
    await writeFile(`codex/kanit/d03/ag-${width}.json`, JSON.stringify(groups, null, 2));
    console.log(width, 'ağ:', JSON.stringify({ acilis: src, acilisIstek: 1, tumGruplarBirKez: true, toplam: images.length }));
    const ax = await (await c.newCDPSession(p)).send('Accessibility.getFullAXTree');
    await writeFile(`codex/kanit/d03/ax-${width}.json`, JSON.stringify(ax, null, 2));
    await c.close();
  }
  const slow = await browser.newContext();
  await slow.route('**/*.css*', async route => {
    const response = await route.fetch(); await new Promise(r => setTimeout(r, 3500));
    await route.fulfill({ response });
  });
  const sp = await slow.newPage(); await sp.goto(U, { waitUntil: 'domcontentloaded' });
  await sp.waitForTimeout(2300);
  const s = await sp.locator('[data-giris-perde]').evaluate(e => ({
    elapsed: Number(e.getAnimations()[0]?.currentTime), display: getComputedStyle(e).display,
    durum: document.documentElement.dataset.giris,
  }));
  assert.equal(s.display, 'block'); console.log('CSS 3500 ms gecikme + 2300 ms sahne:', JSON.stringify(s));
  await slow.close();
  for (const reduce of [false, true]) {
    const c = await browser.newContext({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
    await c.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', { value: { saveData: true } });
      Storage.prototype.getItem = () => { throw new Error('D03 depolama engeli'); };
    });
    const p = await c.newPage(); await p.goto(U);
    assert.equal(await p.locator('[data-giris-perde]').isVisible(), false);
    console.log('saveData + engelli storage / reduce=', reduce, ': perde yok'); await c.close();
  }
  const cssOnly = await browser.newContext(); const cp = await cssOnly.newPage();
  await cssOnly.route('**/_next/**/*.js*', route => route.abort());
  await cp.goto(U, { waitUntil: 'domcontentloaded' });
  const lock = await cp.evaluate(() => getComputedStyle(document.documentElement).overflow);
  assert.equal(lock, 'hidden'); await cp.waitForTimeout(5000);
  const cssResult = await cp.locator('[data-giris-perde]').evaluate(e => ({
    visibility: getComputedStyle(e).visibility, pointer: getComputedStyle(e).pointerEvents,
    overflow: getComputedStyle(document.documentElement).overflow,
  }));
  assert.equal(cssResult.visibility, 'hidden'); assert.equal(cssResult.pointer, 'none');
  assert.notEqual(cssResult.overflow, 'hidden');
  console.log('React yüklenmedi, saf CSS emniyet:', JSON.stringify(cssResult)); await cssOnly.close();
  const panel = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  assert.ok((await panel.request.post(`${base}/api/panel/giris`, {
    data: { kullaniciAdi: 'yonetici', sifre: process.env.SEED_SIFRE_YONETICI },
  })).ok());
  const projects = await (await panel.request.get(`${base}/api/panel/projeler`)).json();
  const pp = await panel.newPage();
  await pp.goto(`${base}/panel/projeler/${projects.projeler[0].id}`);
  await pp.locator('.panel[data-hazir=true]').waitFor(); await pp.locator('.p-card').first().waitFor();
  await pp.evaluate(() => document.fonts.ready);
  await pp.screenshot({ path: 'codex/ekran/13b-proje-duzenle-1440.png', fullPage: true });
  await pp.evaluate(() => scrollTo({ top: 700, behavior: 'instant' })); await pp.waitForTimeout(150);
  const menu = await pp.locator('.p-sidebar').evaluate(e => ({
    height: e.getBoundingClientRect().height, top: e.getBoundingClientRect().top,
    position: getComputedStyle(e).position, overflow: getComputedStyle(e).overflowY, viewport: innerHeight,
  }));
  assert.equal(menu.height, 900); assert.equal(menu.top, 0); assert.equal(menu.overflow, 'auto');
  console.log('Menü 700 px kaydırılmış:', JSON.stringify(menu));
  await pp.screenshot({ path: 'codex/ekran/13c-proje-duzenle-kaydirilmis-1440.png' });
  await panel.close();
  const baseline = JSON.parse(await readFile('codex/kanit/d03/korunan-once.json', 'utf8'));
  const current = {};
  async function walk(dir) {
    for (const f of await readdir(dir, { withFileTypes: true })) {
      const path = `${dir}/${f.name}`;
      if (f.isDirectory()) await walk(path);
      else current[path] = createHash('sha256').update(await readFile(path)).digest('hex');
    }
  }
  for (const dir of ['src/lib', 'src/app/api', 'prisma', 'tests', 'tools']) await walk(dir);
  assert.deepEqual(current, baseline);
  console.log(`Korunan ${Object.keys(current).length} dosya: SHA-256 aynı; eklenen/silinen/değişen 0.`);
  console.log('GET localhost:3060 →', (await fetch('http://localhost:3060')).status);
} finally { await browser.close(); }
