import { chromium } from 'playwright-core';
import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import 'dotenv/config';

await mkdir('codex/kanit/d03', { recursive: true });
const hashes = {};
async function hashTree(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${item.name}`;
    if (item.isDirectory()) await hashTree(path);
    else hashes[path] = createHash('sha256').update(await readFile(path)).digest('hex');
  }
}
for (const dir of ['src/lib', 'src/app/api', 'prisma', 'tests', 'tools']) await hashTree(dir);
await writeFile('codex/kanit/d03/korunan-once.json', JSON.stringify(hashes, null, 2));
const b = await chromium.launch({ channel: 'chrome' });
try {
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.goto('http://localhost:3060/');
  console.log('Kardeş / metin animasyonu:', await p.evaluate(() => {
    const pe = document.querySelector('[data-giris-perde]');
    const hero = document.querySelector('.hero');
    return { kardes: pe.parentElement === hero.parentElement,
      animation: getComputedStyle(document.querySelector('.hero-content')).animationName };
  }));
  await c.close();
  const slow = await b.newContext();
  await slow.route('**/*.css*', async route => {
    const response = await route.fetch();
    await new Promise(r => setTimeout(r, 3500));
    await route.fulfill({ response });
  });
  const q = await slow.newPage();
  await q.goto('http://localhost:3060/', { waitUntil: 'domcontentloaded' });
  await q.waitForTimeout(2300);
  console.log('3500 ms CSS gecikmesi + 2300 ms sahne:', await q.evaluate(() => ({
    durum: document.documentElement.dataset.giris,
    display: getComputedStyle(document.querySelector('[data-giris-perde]')).display,
    elapsed: document.querySelector('[data-giris-perde]').getAnimations().map(a => a.currentTime),
  })));
  await slow.close();
  const denied = await b.newContext();
  await denied.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', { value: { saveData: true } });
    Storage.prototype.getItem = () => { throw new Error('D03 depolama engeli'); };
  });
  const dp = await denied.newPage();
  await dp.goto('http://localhost:3060/');
  console.log('saveData + engelli storage:', await dp.locator('[data-giris-perde]').evaluate(e => ({
    durum: document.documentElement.dataset.giris, display: getComputedStyle(e).display,
  })));
  await denied.close();
  const panel = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const r = await panel.request.post('http://localhost:3060/api/panel/giris', {
    data: { kullaniciAdi: 'yonetici', sifre: process.env.SEED_SIFRE_YONETICI },
  });
  if (!r.ok()) throw new Error(`Panel giriş ${r.status()}`);
  const pp = await panel.newPage();
  const projects = await (await panel.request.get('http://localhost:3060/api/panel/projeler')).json();
  await pp.goto(`http://localhost:3060/panel/projeler/${projects.projeler[0].id}`);
  await pp.locator('.p-card').first().waitFor();
  console.log('Menü önce:', await pp.locator('.p-sidebar').evaluate(e => ({
    height: e.getBoundingClientRect().height, viewport: innerHeight,
    position: getComputedStyle(e).position, top: getComputedStyle(e).top,
  })));
  await pp.evaluate(() => scrollTo({ top: 700, behavior: 'instant' }));
  await pp.waitForTimeout(100);
  console.log('Menü kaydırılmış önce:', await pp.locator('.p-sidebar').evaluate(e => ({
    top: e.getBoundingClientRect().top, height: e.getBoundingClientRect().height,
  })));
  await panel.close();
} finally { await b.close(); }
