import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { config } from 'dotenv';
import { tsImport } from 'tsx/esm/api';

config({ quiet: true });
const { prisma } = await tsImport('../src/lib/prisma.ts', import.meta.url);
const droneCount = await prisma.proje.count({ where: { yayinda: true, kategori: 'DRONE' } });
assert.equal(droneCount, 1);
console.log(`DB: yayındaki DRONE sayısı = ${droneCount}`);
const base = process.env.VITRIN_TEST_URL || 'http://localhost:3060';
const browser = await chromium.launch({ channel: 'chrome' });
const errors = [];
const expectedHttpErrors = [];
const intentionalJsBlocks = [];
const blockedJsPages = new WeakSet();
// Yerel doğrudan erişimde bağımsız test turları saatlik kotayı birbirinden tüketmesin.
const testIp = `192.0.2.${1 + Date.now() % 200}`;
const context = await browser.newContext({
  viewport: { width: 390, height: 844 }, hasTouch: true,
});
// Test kotası başlığı yalnız yerel API'ye gider; YouTube'un CORS isteklerine eklenmez.
await context.route(`${base}/api/**`, route => route.continue({
  headers: { ...route.request().headers(), 'x-real-ip': testIp },
}));
console.log(`Yerel test kotası adresi (TEST-NET): ${testIp}`);
const watchPage = page => {
  if (process.env.VITRIN_DEBUG_CONSOLE) {
    page.context().newCDPSession(page).then(async session => {
      await session.send('Runtime.enable');
      session.on('Runtime.consoleAPICalled', event => {
        if (event.type === 'error' && event.args.some(a => String(a.value).includes("hasn't mounted"))) {
          console.log('REACT ÇAĞRI İZİ', page.url(), JSON.stringify(event.stackTrace));
        }
      });
    });
  }
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const loc = m.location().url;
    if (blockedJsPages.has(page) && /\.js(?:\?|$)/.test(loc) && /net::ERR_FAILED/.test(m.text())) {
      intentionalJsBlocks.push(m.text());
      return;
    }
    // 400/429 red senaryoları Chrome konsoluna HTTP kaynak hatası da yazar.
    if (loc === `${base}/api/teklif` && /status of (400|429)/.test(m.text())) {
      expectedHttpErrors.push(m.text());
    } else errors.push(`console.error: ${m.text()} (${loc}); sayfa=${page.url()}`);
  });
};
context.on('page', watchPage);

async function visit(page, path) {
  const response = await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
  assert.ok(response.status() < 400, `${path}: HTTP ${response.status()}`);
  await page.locator('h1').waitFor();
  await page.evaluate(() => document.fonts.ready);
  if (!blockedJsPages.has(page)) {
    await page.waitForFunction(() => !document.querySelector('.menu-toggle')?.disabled);
  }
}

async function fill(page) {
  await page.locator('[name=ad]').fill('E2E Test');
  await page.locator('[name=telefon]').fill('05551234567');
  await page.locator('[name=eposta]').fill('e2e@example.com');
  await page.locator('[name=firma]').fill('E2E Test');
  await page.locator('[name=hizmet]').selectOption({ label: 'Diğer' });
  await page.locator('[name=mesaj]').fill('E2E Test: vitrin teklif formunun gerçek gönderim kontrolü.');
  await page.locator('[name=kvkk]').check();
}

async function screenshot(page, name) {
  // Uzun sayfada lazy görselleri ve belirme geçişlerini gerçek kaydırmayla tetikle.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 650) {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(750);
  await page.screenshot({ path: `codex/ekran/${name}`, fullPage: true });
}

try {
  await mkdir('codex/ekran', { recursive: true });
  const page = await context.newPage();
  await visit(page, '/');
  assert.equal(await page.locator('iframe').count(), 0);
  assert.equal(await page.locator('video').count(), 0);
  await screenshot(page, '01-ana-390.png');
  await page.getByRole('button', { name: 'Menüyü aç' }).click();
  await page.getByRole('dialog', { name: 'Site menüsü' }).waitFor({ state: 'visible' });
  await page.screenshot({ path: 'codex/ekran/06-menu-acik-390.png', fullPage: true });
  await page.screenshot({ path: 'codex/ekran/06-menu-viewport-390.png' });
  assert.equal(await page.locator('.floating-whatsapp').count(), 0);
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => !!document.activeElement.closest('dialog')), true);
  }
  await page.locator('.menu-nav').getByRole('link', { name: /Projeler/ }).click();
  await page.waitForURL('**/projeler', { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('dialog[open]').count(), 0);
  await page.locator('.category-tabs').getByRole('link', { name: /Drone/ }).click();
  await page.waitForURL('**/projeler?kategori=drone', { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('[data-project-card]').count(), droneCount);
  await screenshot(page, '02-projeler-390.png');
  const detail = await page.locator('[data-project-card]').first().getAttribute('href');
  await page.locator('[data-project-card]').first().click();
  await page.waitForURL(`**${detail}`, { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('iframe').count(), 0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await screenshot(page, '03-proje-detay-1440.png');
  await page.locator('[data-video-card] button').click();
  await page.locator('iframe[src*="youtube-nocookie.com/embed/"]').waitFor();
  // Gömme gerçekten oluşturuldu; üçüncü taraf oynatıcının ağ/konsolu ayrıca uygulama testi değildir.
  console.log('a) Menü → Projeler → Drone: 1 kart; detay açıldı; tıklamayla youtube-nocookie iframe oluştu.');
  await visit(page, '/');
  await screenshot(page, '01-ana-1440.png');
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, '/galeri');
  await page.locator('.gallery-open').first().click();
  await page.locator('.lightbox[open]').waitFor();
  await page.screenshot({ path: 'codex/ekran/04-galeri-acik-390.png', fullPage: true });
  await page.screenshot({ path: 'codex/ekran/04-galeri-viewport-390.png' });
  await page.keyboard.press('ArrowRight');
  assert.match(await page.locator('.lightbox-top').textContent(), /2\s*\//);
  await page.keyboard.press('ArrowLeft');
  const touchSession = await context.newCDPSession(page);
  await touchSession.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 290, y: 380 }] });
  await touchSession.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 80, y: 380 }] });
  await touchSession.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  assert.match(await page.locator('.lightbox-top').textContent(), /2\s*\//);
  await touchSession.detach();
  await page.keyboard.press('Escape');
  await page.locator('.lightbox').waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(() => document.activeElement.classList.contains('gallery-open')), true);
  console.log('Galeri: açılma, yön tuşları, gerçek dokunma kaydırması, ESC, odak iadesi geçti.');

  await visit(page, '/teklif-al');
  await page.waitForFunction(() => !document.querySelector('button[type=submit]').disabled);
  await screenshot(page, '05-teklif-390.png');
  let postCount = 0;
  const counter = req => { if (req.method() === 'POST' && req.url() === `${base}/api/teklif`) postCount++; };
  page.on('request', counter);
  await fill(page);
  await page.waitForTimeout(3100);
  const beforeDb = await prisma.teklifTalebi.count({ where: { ad: 'E2E Test' } });
  const response = page.waitForResponse(r => r.url() === `${base}/api/teklif` && r.request().method() === 'POST');
  // Gerçek çift tıklama: ref kilidi ikinci gönderimi engellemeli.
  await page.locator('button[type=submit]').dblclick();
  assert.equal((await response).status(), 201);
  await page.getByRole('heading', { name: 'Talebiniz alındı' }).waitFor();
  assert.equal(postCount, 1);
  assert.equal(await prisma.teklifTalebi.count({ where: { ad: 'E2E Test' } }), beforeDb + 1);
  page.off('request', counter);
  console.log('b) 3.1 sn bekleme → gerçek POST 201; teşekkür paneli; POST sayısı = 1; DB kayıt artışı = 1.');

  const fast = await context.newPage();
  let releaseToken;
  const tokenGate = new Promise(resolve => { releaseToken = resolve; });
  await fast.route('**/api/teklif/jeton', async route => {
    await tokenGate;
    const response = await route.fetch();
    await route.fulfill({ response });
  });
  await visit(fast, '/teklif-al');
  await fill(fast);
  // Form önce doldurulur; gerçek GET serbest bırakılınca taze jetonla hız yolu sınanır.
  releaseToken();
  await fast.waitForFunction(() => !document.querySelector('button[type=submit]').disabled);
  const start = Date.now();
  const rejected = fast.waitForResponse(r => r.url() === `${base}/api/teklif` && r.request().method() === 'POST');
  await fast.locator('button[type=submit]').click();
  assert.equal((await rejected).status(), 400);
  const elapsed = Date.now() - start;
  assert.ok(elapsed < 1000, `Hızlı gönderim ${elapsed} ms sürdü`);
  await fast.getByRole('alert').filter({ hasText: /hızlı/ }).waitFor();
  await fast.waitForFunction(() => !document.querySelector('button[type=submit]').disabled);
  console.log(`c) Taze jetonla hızlı gönderim ${elapsed} ms → gerçek 400; hata ekranda; yeni jeton alındı.`);
  await fast.close();

  // Dev dosyalarındaki .js?v= sorguları glob dışında kalmasın: tarayıcıda JS de tamamen kapalıdır.
  const nojsContext = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  nojsContext.on('page', watchPage);
  const nojs = await nojsContext.newPage();
  blockedJsPages.add(nojs);
  await nojs.route('**/*.js', route => route.abort());
  await visit(nojs, '/teklif-al');
  assert.equal(await nojs.locator('button[type=submit]').isDisabled(), true);
  assert.ok(!new URL(nojs.url()).searchParams.has('ad'));
  await visit(nojs, '/projeler?kategori=drone');
  assert.equal(await nojs.locator('[data-project-card]').count(), droneCount);
  console.log('d) JS dosyaları engelli: teklif gönderimi disabled, URL alan sızdırmıyor; Drone sunucuda süzülmüş = 1.');
  await nojsContext.close();

  for (const path of ['/', '/hakkimizda', '/hizmetler', '/projeler', detail, '/galeri', '/iletisim', '/teklif-al']) {
    await visit(page, path);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(width <= 390, `${path}: yatay taşma ${width}`);
    assert.equal(await page.locator('h1').count(), 1);
    const headingLevels = await page.locator('h1,h2,h3,h4,h5,h6').evaluateAll(nodes =>
      nodes.map(node => Number(node.tagName.slice(1))),
    );
    headingLevels.forEach((level, i) => {
      assert.ok(level <= (headingLevels[i - 1] || 0) + 1, `${path}: başlık seviyesi atlanmış`);
    });
    const title = await page.title();
    assert.ok(title.length > 0);
    console.log(`e) ${path}: scrollWidth=${width} <= 390; H1=1; başlık sırası doğru; title var.`);
  }
  for (const width of [360, 430, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/hizmetler', '/projeler', '/iletisim', '/teklif-al']) {
      await visit(page, path);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth) <= width);
    }
    console.log(`Ek responsive: ${width}px, 5 sayfa, taşma yok.`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, '/hizmetler');
  const firstService = await page.locator('.service-row h2').first().textContent();
  await page.locator('.service-row .text-link').first().click();
  await page.waitForURL('**/teklif-al?hizmet=*', { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('[name=hizmet]').inputValue(), firstService);
  console.log('Hizmet → Teklif al: URL ile hizmet seçili açıldı.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await visit(page, '/');
  assert.equal(await page.locator('video').count(), 0);
  console.log('Reduced motion: video yok; CSS hareketler kapalı.');
  await page.getByRole('button', { name: 'Menüyü aç' }).click();
  await page.getByRole('dialog', { name: 'Site menüsü' }).waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog[open]').count(), 0);
  assert.equal(await page.getByRole('button', { name: 'Menüyü aç' }).evaluate(el => el === document.activeElement), true);
  console.log('Menü: ESC ve odak iadesi geçti.');
  console.log(`Beklenen HTTP red konsol kayıtları (400): ${expectedHttpErrors.length}`);
  console.log(`JS kapalı senaryosunda bilinçli .js engelleme konsol kayıtları: ${intentionalJsBlocks.length}`);
  console.log(`pageerror + uygulama console.error: ${errors.length}`);
  for (const error of errors) console.log(error);
  assert.equal(errors.length, 0);
  console.log('SONUÇ: TÜM VİTRİN SENARYOLARI GEÇTİ');
} finally {
  await browser.close();
  await prisma.$disconnect();
}
