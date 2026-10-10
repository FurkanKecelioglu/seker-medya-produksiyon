import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const out = process.argv[2] ?? 'codex/ekran';
const U = process.env.GIRIS_URL ?? 'http://localhost:3060/';
assert.equal(new URL(U).pathname, '/', 'Giriş sınaması gerçek ana sayfada çalışmalı.');
await mkdir(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const errors = [];
const watch = p => {
  p.on('pageerror', e => errors.push(`pageerror ${e.message}`));
  p.on('console', m => { if (m.type() === 'error') errors.push(`console.error ${m.text()}`); });
};
async function state(p) {
  return p.evaluate(() => {
    const pe = document.querySelector('[data-giris-perde]');
    const cs = getComputedStyle(pe);
    const h = document.querySelector('.hero-content');
    const g = pe.firstElementChild;
    const button = document.querySelector('[data-giris-gec]');
    const gc = getComputedStyle(button);
    return { durum: document.documentElement.dataset.giris, display: cs.display,
      visibility: cs.visibility, opacity: Number(cs.opacity), pointer: cs.pointerEvents,
      blur: Number(getComputedStyle(g).filter.match(/blur\(([^p]+)/)?.[1] ?? 0),
      elapsed: Number(pe.getAnimations()[0]?.currentTime ?? 0), inert: pe.inert,
      heroOpacity: Number(getComputedStyle(h).opacity), heroAnimation: getComputedStyle(h).animationName,
      kardes: pe.parentElement === h.closest('.hero').parentElement,
      overflow: getComputedStyle(document.documentElement).overflow,
      button: { width: button.offsetWidth, height: button.offsetHeight, visible: gc.visibility === 'visible' },
      scrollWidth: document.documentElement.scrollWidth };
  });
}
const hidden = d => d.display === 'none' || d.visibility === 'hidden';
try {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const c = await b.newContext({ viewport: { width: w, height: h },
      recordVideo: { dir: out, size: { width: w, height: h } } });
    const p = await c.newPage(); watch(p);
    await p.goto(U, { waitUntil: 'domcontentloaded' });
    const initial = await state(p);
    assert.equal(hidden(initial), false);
    assert.equal(initial.kardes, true);
    assert.match(initial.heroAnimation, /metinGel/);
    assert.equal(initial.overflow, 'hidden');
    assert.ok(initial.button.width >= 44 && initial.button.height >= 44 && initial.button.visible);
    const cdp = await c.newCDPSession(p);
    await cdp.send('Accessibility.enable');
    const ax = await cdp.send('Accessibility.getFullAXTree');
    await writeFile(`${out}/ax-ilk-kare-${w}.json`, JSON.stringify(ax, null, 2));
    const headings = ax.nodes.filter(n => !n.ignored && n.role?.value === 'heading');
    assert.ok(headings.some(n => n.properties?.some(x => x.name === 'level' && x.value.value === 1)));
    assert.ok(ax.nodes.some(n => !n.ignored && n.role?.value === 'button' && n.name?.value === 'Geç'));
    console.log(w, 'ilk kare / AX', JSON.stringify({ ...initial, h1: true, gecAX: true }));
    for (const [t, name] of [[300, '30-giris-0.3s'], [1000, '31-giris-1.0s'],
      [2200, '32-giris-2.2s'], [2600, null], [3400, '33-giris-3.4s'], [5000, '34-giris-bitti']]) {
      const d0 = await state(p);
      await p.waitForTimeout(Math.max(0, t - (d0.elapsed || (d0.durum === 'gecildi' ? t : 0))));
      const d = await state(p);
      console.log(w, t, JSON.stringify(d));
      if (t === 300) assert.ok(await p.getByText('REC', { exact: true }).isVisible());
      if (t === 1000) assert.ok(d.blur > 10);
      if (t === 2600) assert.ok(d.blur < 2, `Odak netleşmedi: ${d.blur}`);
      if (t === 3400) assert.equal(d.heroOpacity, 0);
      if (t === 5000) {
        assert.ok(hidden(d)); assert.equal(d.pointer, 'none'); assert.notEqual(d.overflow, 'hidden');
        assert.equal(d.inert, true); assert.equal(d.heroOpacity, 1);
        await p.locator('#hero-title').click();
      }
      assert.ok(d.scrollWidth <= w);
      if (name) await p.screenshot({ path: `${out}/${name}-${w}.png` });
    }
    const video = p.video();
    await c.close();
    await video.saveAs(`${out}/giris-${w}.webm`);
    const c2 = await b.newContext({ viewport: { width: w, height: h } });
    const p2 = await c2.newPage(); watch(p2);
    await p2.goto(U, { waitUntil: 'domcontentloaded' });
    await p2.waitForFunction(() => document.querySelector('[data-giris-gec]')?.onclick);
    await p2.locator('[data-giris-gec]').focus();
    assert.ok(await p2.evaluate(() => document.activeElement.hasAttribute('data-giris-gec')));
    await p2.getByRole('button', { name: 'Geç' }).click();
    await p2.waitForTimeout(450);
    assert.ok(hidden(await state(p2)));
    await p2.reload({ waitUntil: 'domcontentloaded' });
    assert.equal((await state(p2)).display, 'none');
    console.log(w, 'Geç odak / 450 ms / yenileme ilk boya: geçti');
    await c2.close();
    const esc = await b.newContext({ viewport: { width: w, height: h } });
    const ep = await esc.newPage(); watch(ep);
    await ep.goto(U, { waitUntil: 'domcontentloaded' });
    await ep.waitForFunction(() => document.querySelector('[data-giris-gec]')?.onclick);
    await ep.keyboard.press('Escape'); await ep.waitForTimeout(450);
    assert.ok(hidden(await state(ep))); console.log(w, 'ESC: geçti');
    await esc.close();
    for (const [label, options] of [['reduced', { reducedMotion: 'reduce' }], ['JS yok', { javaScriptEnabled: false }]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: h }, ...options });
      const q = await ctx.newPage(); watch(q);
      await q.goto(U, { waitUntil: 'domcontentloaded' });
      assert.equal(await q.locator('[data-giris-perde]').isVisible(), false);
      assert.ok(await q.locator('#hero-title').isVisible()); console.log(w, `${label}: perde yok, H1 görünür`);
      await ctx.close();
    }
    const other = await b.newContext(); const op = await other.newPage(); watch(op);
    await op.goto(new URL('/projeler', U).href, { waitUntil: 'domcontentloaded' });
    assert.equal(await op.locator('[data-giris-perde]').count(), 0);
    console.log(w, '/projeler doğrudan: perde yok'); await other.close();
  }
  console.log('pageerror + console.error:', JSON.stringify(errors));
  assert.deepEqual(errors, []);
  console.log('Giriş ana sayfa denetimi: geçti (1440 + 390).');
} finally { await b.close(); }
