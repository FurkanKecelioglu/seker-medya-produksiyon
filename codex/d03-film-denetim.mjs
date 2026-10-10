import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import 'dotenv/config';

const U = 'http://localhost:3060';
const browser = await chromium.launch({ channel: 'chrome' });
const panel = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p = await panel.newPage();
let uploaded = false;
let url;
async function inspect(q) {
  return q.evaluate(() => {
    const e = document.querySelector('[data-giris-perde]');
    const c = getComputedStyle(e);
    const v = e.querySelector('video');
    return { display: c.display, visibility: c.visibility, pointer: c.pointerEvents,
      overflow: getComputedStyle(document.documentElement).overflow,
      count: e.querySelectorAll('video').length, source: v?.currentSrc, paused: v?.paused,
      ended: v?.ended, currentTime: v?.currentTime, duration: v?.duration,
      events: window.d03Events ?? [] };
  });
}
const hidden = d => d.display === 'none' || d.visibility === 'hidden';
async function context(options = {}) {
  const c = await browser.newContext(options);
  await c.addInitScript(() => {
    window.d03Events = [];
    for (const name of ['playing', 'ended', 'error']) document.addEventListener(name, e => {
      if (e.target.closest?.('[data-giris-perde]')) window.d03Events.push(name);
    }, true);
  });
  return c;
}
try {
  await p.goto(`${U}/panel/giris`);
  await p.getByLabel('Kullanıcı adı').fill('yonetici');
  await p.getByLabel('Şifre', { exact: true }).fill(process.env.SEED_SIFRE_YONETICI);
  await p.waitForFunction(() => !document.querySelector('button[type=submit]').disabled);
  await p.getByRole('button', { name: /Giriş/ }).click();
  await p.waitForURL('**/panel/teklifler');
  await p.goto(`${U}/panel/ayarlar`);
  const card = p.locator('[data-medya="giris_videosu"]');
  await card.waitFor();
  const before = await (await panel.request.get(`${U}/api/panel/ayarlar`)).json();
  assert.equal(before.medya.giris_videosu, null, 'Var olan kullanıcı filmi üzerine yazılmaz.');
  assert.equal(before.medya.giris_videosu_mobil, null, 'Var olan kullanıcı filmi üzerine yazılmaz.');
  const bytes = await p.evaluate(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 180;
    const ctx = canvas.getContext('2d'); const stream = canvas.captureStream(25);
    const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
      .find(t => MediaRecorder.isTypeSupported(t));
    const recorder = new MediaRecorder(stream, { mimeType }); const chunks = [];
    const done = new Promise(r => { recorder.onstop = r; });
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.start(); const start = performance.now();
    const draw = () => {
      const t = performance.now() - start;
      ctx.fillStyle = 'rgb(18, 23, 30)'; ctx.fillRect(0, 0, 320, 180);
      ctx.fillStyle = 'rgb(235, 65, 65)'; ctx.fillRect(t / 8 % 280, 60, 40, 60);
      if (t < 1100) requestAnimationFrame(draw); else recorder.stop();
    };
    draw(); await done; stream.getTracks().forEach(t => t.stop());
    return Array.from(new Uint8Array(await new Blob(chunks, { type: 'video/webm' }).arrayBuffer()));
  });
  await mkdir('codex/kanit/d03', { recursive: true });
  await writeFile('codex/kanit/d03/gercek-film.webm', Buffer.from(bytes));
  const responsePromise = p.waitForResponse(r => r.url().endsWith('/ayarlar/medya/giris_videosu') &&
    r.request().method() === 'POST');
  await card.locator('input[type=file]').setInputFiles({
    name: 'd03-gercek-film.webm', mimeType: 'video/webm', buffer: Buffer.from(bytes),
  });
  const response = await responsePromise;
  assert.equal(response.status(), 201); uploaded = true; url = (await response.json()).url;
  console.log(`Panel yükleme: POST 201; MediaRecorder WebM ${bytes.length} bayt.`);
  await card.getByRole('button', { name: 'Sil', exact: true }).waitFor();
  for (const width of [1440, 390]) {
    const c = await context({ viewport: { width, height: width === 1440 ? 900 : 844 } });
    const q = await c.newPage(); const requests = []; const errors = [];
    q.on('request', r => { if (r.url().includes(url)) requests.push(r.url()); });
    q.on('pageerror', e => errors.push(e.message));
    q.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await q.goto(`${U}/`, { waitUntil: 'domcontentloaded' });
    await q.waitForFunction(() => document.querySelector('[data-giris-perde] video')?.currentTime > .05);
    const playing = await inspect(q);
    assert.equal(playing.count, 1); assert.ok(playing.source.endsWith(url));
    assert.equal(playing.paused, false); assert.ok(playing.events.includes('playing'));
    await q.waitForFunction(() => document.querySelector('[data-giris-perde] video')?.ended);
    await q.waitForTimeout(350);
    const end = await inspect(q); assert.ok(hidden(end)); assert.notEqual(end.overflow, 'hidden');
    assert.ok(end.events.includes('ended')); assert.deepEqual(errors, []);
    console.log(width, 'oynatma / ended:', JSON.stringify({ playing, end, requests: requests.length, errors }));
    await c.close();
  }
  for (const label of ['bozuk', 'donma', 'gec', 'metadata']) {
    const c = await context(); const q = await c.newPage();
    if (label === 'bozuk') await c.route(`**${url}`, route => route.fulfill({
      status: 200, contentType: 'video/webm', body: Buffer.from(bytes.slice(0, 32)),
    }));
    if (label === 'metadata') await c.route(`**${url}`, () => new Promise(() => {}));
    const t = Date.now(); await q.goto(`${U}/`, { waitUntil: 'domcontentloaded' });
    if (label === 'donma' || label === 'gec') {
      await q.waitForFunction(() => document.querySelector('[data-giris-perde] video')?.currentTime > .05);
      if (label === 'donma') await q.locator('[data-giris-perde] video').evaluate(v => v.pause());
      else await q.getByRole('button', { name: 'Geç' }).click();
    }
    try {
      await q.waitForFunction(() => getComputedStyle(document.querySelector('[data-giris-perde]')).display === 'none',
        null, { timeout: label === 'metadata' ? 15000 : 7000 });
    } catch (e) {
      console.log(label, 'zaman aşımı:', JSON.stringify(await inspect(q)));
      throw e;
    }
    const result = await inspect(q);
    assert.ok(hidden(result)); assert.notEqual(result.overflow, 'hidden');
    if (label === 'gec') assert.equal(result.paused, true);
    console.log(label, `kapanış ${Date.now() - t} ms:`, JSON.stringify(result));
    await c.close();
  }
  for (const label of ['reduced', 'saveData']) {
    const c = await context(label === 'reduced' ? { reducedMotion: 'reduce' } : {});
    if (label === 'saveData') await c.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', { value: { saveData: true } });
    });
    const q = await c.newPage(); const requests = [];
    q.on('request', r => { if (r.url().includes(url)) requests.push(r.url()); });
    await q.goto(`${U}/`); await q.waitForTimeout(400);
    assert.equal(await q.locator('[data-giris-perde] video').count(), 0);
    assert.deepEqual(requests, []); console.log(label, 'film öğesi 0; film isteği 0.');
    await c.close();
  }
} finally {
  try {
    if (uploaded) {
      await p.goto(`${U}/panel/ayarlar`);
      const card = p.locator('[data-medya="giris_videosu"]');
      await card.getByRole('button', { name: 'Sil', exact: true }).click();
      const responsePromise = p.waitForResponse(r => r.url().endsWith('/ayarlar/medya/giris_videosu') &&
        r.request().method() === 'DELETE');
      await p.getByRole('button', { name: 'Evet, sil' }).click();
      assert.equal((await responsePromise).status(), 200);
      const after = await (await panel.request.get(`${U}/api/panel/ayarlar`)).json();
      assert.equal(after.medya.giris_videosu, null); assert.equal(after.medya.giris_videosu_mobil, null);
      assert.equal((await panel.request.get(`${U}${url}`)).status(), 404);
      console.log('Panelden SİL: DELETE 200; iki film alanı null; yüklenen dosya GET 404.');
    }
  } finally { await browser.close(); }
}
