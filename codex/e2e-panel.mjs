import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { config } from 'dotenv';
import sharp from 'sharp';

config({ quiet: true });
assert.ok(process.env.SEED_SIFRE_YONETICI, 'Giriş sırrı ortamda bulunamadı.');
const base = process.env.PANEL_TEST_URL || 'http://localhost:3060';
const stamp = Date.now();
const ip = `192.0.2.${1 + stamp % 200}`;
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
await context.route(`${base}/api/**`, route => route.continue({
  headers: { ...route.request().headers(), 'x-real-ip': ip },
}));
const errors = [];
const expectedErrors = [];
const blocked = new WeakSet();
context.on('page', p => {
  if (process.env.PANEL_DEBUG_CONSOLE) {
    p.context().newCDPSession(p).then(async session => {
      await session.send('Runtime.enable');
      session.on('Runtime.consoleAPICalled', event => {
        if (event.type === 'error' && event.args.some(a => String(a.value).includes("hasn't mounted"))) {
          console.log('REACT ÇAĞRI İZİ', p.url(), JSON.stringify(event.stackTrace));
        }
      });
    });
  }
  p.on('pageerror', e => errors.push(`pageerror ${p.url()}: ${e.message}`));
  p.on('console', m => {
    if (m.type() !== 'error') return;
    const url = m.location().url;
    const http = /Failed to load resource:.*status of (400|401|404)/.test(m.text());
    const knownRejection = url === `${base}/api/panel/ben` || url === `${base}/api/panel/giris` ||
      url === `${base}/api/panel/sifre` || url.startsWith(`${base}/api/panel/teklifler?`) ||
      url.startsWith(`${base}/projeler/e2e-proje-${stamp}`);
    const intentionalBlock = blocked.has(p) && /net::ERR_FAILED/.test(m.text());
    if ((http && knownRejection) || intentionalBlock) expectedErrors.push(`${m.text()} (${url})`);
    else errors.push(`console.error ${p.url()}: ${m.text()} (${url})`);
  });
});
const page = await context.newPage();
const site = await context.newPage();
await mkdir('codex/ekran', { recursive: true });
const jpg = await sharp({ create: { width: 1600, height: 900, channels: 3, background: '#47596d' } })
  .composite([{ input: Buffer.from('<svg width="1600" height="900"><circle cx="800" cy="450" r="250" fill="#c33343"/></svg>') }])
  .jpeg().toBuffer();
const photo = name => ({ name, mimeType: 'image/jpeg', buffer: jpg });
let projectId;
let serviceId;
let brandId;
let oldLocation;
let locationChanged = false;
let authenticated = false;
let failure;

async function visit(p, path) {
  const r = await p.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
  assert.ok(r.status() < 400, `${path}: ${r.status()}`);
  await p.locator('h1').waitFor();
  await p.evaluate(() => document.fonts.ready);
  if (path.startsWith('/panel')) await p.locator('.panel[data-hazir=true]').waitFor();
  return r;
}

async function screen(name, p = page, fullPage = false) {
  if (p.viewportSize().width === 1440 && await p.locator('.p-sidebar:visible').count()) {
    const sidebar = await p.locator('.p-sidebar').boundingBox();
    const workspace = await p.locator('.p-workspace').boundingBox();
    assert.equal(sidebar.x, 0, 'Masaüstü menüsü solda olmalı.');
    assert.equal(sidebar.width, 260, 'Masaüstü menüsü 260 px olmalı.');
    assert.equal(workspace.x, 260, 'İçerik sol menünün sağından başlamalı.');
    assert.ok(workspace.width >= 1100, 'Masaüstü içerik alanı daralmamalı.');
  }
  if (fullPage) {
    for (const img of await p.locator('img:visible').all()) {
      await img.scrollIntoViewIfNeeded();
      await p.waitForTimeout(100);
    }
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  }
  await p.waitForTimeout(250);
  await p.screenshot({ path: `codex/ekran/${name}`, fullPage });
}

async function write(path, method, act, status = 200) {
  const pending = page.waitForResponse(r => r.url() === `${base}/api/panel${path}` && r.request().method() === method);
  const [r] = await Promise.all([pending, act()]);
  console.log(`${method} ${path} → ${r.status()}`);
  assert.equal(r.status(), status);
  return r;
}

async function login(wrong = true) {
  await visit(page, '/panel/giris');
  await page.locator('button[type=submit]').waitFor({ state: 'visible' });
  await page.waitForFunction(() => !document.querySelector('button[type=submit]').disabled);
  if (page.viewportSize().width === 390) await screen('10-giris-390.png');
  const loginWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(loginWidth <= page.viewportSize().width);
  console.log(`j) /panel/giris: scrollWidth=${loginWidth} <= ${page.viewportSize().width}`);
  await page.locator('[name=kullaniciAdi]').fill('yonetici');
  if (wrong) {
    await page.locator('[name=sifre]').fill('bilerek-yanlis-sifre');
    await write('/giris', 'POST', () => page.locator('button[type=submit]').click(), 401);
    await page.getByRole('alert').filter({ hasText: 'Kullanıcı adı ya da şifre hatalı' }).waitFor();
    assert.ok(!page.url().includes('sifre'));
  }
  await page.locator('[name=sifre]').fill(process.env.SEED_SIFRE_YONETICI);
  await write('/giris', 'POST', () => page.locator('button[type=submit]').click());
  await page.waitForURL('**/panel/teklifler');
  await page.locator('[role=tab][data-durum=YENI]').waitFor();
  authenticated = true;
}

async function makeOffer(width) {
  await visit(site, '/teklif-al');
  await site.waitForFunction(() => !document.querySelector('button[type=submit]').disabled);
  await site.locator('[name=ad]').fill('E2E Panel');
  await site.locator('[name=telefon]').fill('05551234567');
  await site.locator('[name=eposta]').fill('e2e@example.com');
  await site.locator('[name=firma]').fill('E2E Firma');
  await site.locator('[name=hizmet]').selectOption({ label: 'Diğer' });
  const message = `E2E Panel ${stamp} ${width}: Gerçek vitrin formundan gelen teklif talebi.\n` +
    'Çekim\nKurgu\nSes\nRenk\nTeslim';
  await site.locator('[name=mesaj]').fill(message);
  await site.locator('[name=kvkk]').check();
  await site.waitForTimeout(3100);
  const pending = site.waitForResponse(r => r.url() === `${base}/api/teklif` && r.request().method() === 'POST');
  const [offerResponse] = await Promise.all([pending, site.locator('button[type=submit]').click()]);
  assert.equal(offerResponse.status(), 201);
  console.log(`c/${width}) Vitrin formu POST /api/teklif → 201 (3.1 sn beklendi)`);
  await visit(page, '/panel/teklifler');
  await page.locator('[data-yeni-teklif]:visible').first().waitFor();
  const badge = Number(await page.locator('[data-yeni-teklif]:visible').first().getAttribute('data-yeni-teklif'));
  assert.ok(badge >= 1);
  await page.waitForFunction(n => document.title.startsWith(`(${n})`), badge);
  const card = page.locator('[data-talep-id]').filter({ hasText: message });
  await card.waitFor();
  await card.getByRole('button', { name: 'devamı', exact: true }).click();
  assert.equal(await card.locator('.p-message').evaluate(el => el.scrollHeight <= el.clientHeight + 1), true);
  console.log(`c/${width}) Kısa ama çok satırlı mesajın devamı açıldı; metin kırpılmıyor.`);
  const id = await card.getAttribute('data-talep-id');
  assert.match(await card.getByRole('link', { name: "WhatsApp'tan yaz" }).getAttribute('href'), /^https:\/\/wa.me\/90/);
  assert.match(await card.getByRole('link', { name: 'Ara', exact: true }).getAttribute('href'), /^tel:\+90/);
  const tabNew = page.locator('[data-durum=YENI]');
  const tabCalled = page.locator('[data-durum=ARANDI]');
  const countsBefore = [Number(await tabNew.locator('span').textContent()), Number(await tabCalled.locator('span').textContent())];
  await write(`/teklifler/${id}`, 'PATCH', () => card.locator('select').selectOption('ARANDI'));
  await card.waitFor({ state: 'detached' });
  await page.waitForFunction(expected => Number(document.querySelector('[data-durum=YENI] span')?.textContent) === expected,
    countsBefore[0] - 1);
  assert.equal(Number(await tabNew.locator('span').textContent()), countsBefore[0] - 1);
  assert.equal(Number(await tabCalled.locator('span').textContent()), countsBefore[1] + 1);
  await tabCalled.click();
  const called = page.locator(`[data-talep-id="${id}"]`);
  await called.waitFor();
  await called.locator('textarea').fill(`E2E iç not ${stamp} ${width}`);
  await write(`/teklifler/${id}`, 'PATCH', () => called.getByRole('button', { name: 'Notu kaydet' }).click());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.panel[data-hazir=true]').waitFor();
  await page.locator('[data-durum=ARANDI]').click();
  await called.waitFor();
  assert.equal(await called.locator('textarea').inputValue(), `E2E iç not ${stamp} ${width}`);
  console.log(`c/${width}) Talep #${id}, rozet=${badge}; bağlantılar, sekme adetleri ve kalıcı not doğrulandı.`);
  await screen(width === 390 ? '11-teklifler-390.png' : '12-teklifler-1440.png');
}

async function expired(width) {
  await visit(page, '/panel/teklifler');
  await page.locator('[data-talep-id]').first().waitFor();
  let navigationCount = 0;
  const listener = request => {
    if (request.isNavigationRequest() && request.resourceType() === 'document' &&
      request.frame() === page.mainFrame() && new URL(request.url()).pathname === '/panel/giris') navigationCount++;
  };
  page.on('request', listener);
  await context.clearCookies();
  await write('/teklifler?durum=YENI&sayfa=1', 'GET', () => page.getByRole('button', { name: 'Yenile' }).click(), 401);
  await page.waitForURL('**/panel/giris');
  await page.waitForTimeout(500);
  assert.equal(navigationCount, 1);
  page.off('request', listener);
  authenticated = false;
  console.log(`h/${width}) Çerezler silindi; 401 → giriş yönlendirmesi = ${navigationCount}`);
}

try {
  await login();
  console.log('a/390) Yanlış giriş mesajı ve doğru giriş → /panel/teklifler; URL’de şifre yok.');
  const nojsContext = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const nojs = await nojsContext.newPage();
  blocked.add(nojs);
  await nojs.route('**/*.js', r => r.abort());
  await nojs.goto(`${base}/panel/giris`);
  assert.equal(await nojs.locator('button[type=submit]').isDisabled(), true);
  assert.equal(await nojs.locator('form').getAttribute('method'), 'post');
  assert.ok(!/sifre=|kullaniciAdi=/.test(nojs.url()));
  await nojsContext.close();
  console.log('b) JS kapalı: düğme disabled, method=post, URL alan sızıntısı yok.');
  await makeOffer(390);

  const title = `E2E Proje ${stamp}`;
  await visit(page, '/panel/projeler/yeni');
  await page.locator('[name=baslik]').fill(title);
  await page.locator('[name=kategori]').selectOption('DRONE');
  await page.locator('[name=ozet]').fill('E2E projesinin kapak, fotoğraf ve yayın kontrolü.');
  await page.locator('[name=videoAdresi]').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const created = await write('/projeler', 'POST', () => page.getByRole('button', { name: 'Taslak oluştur' }).click(), 201);
  const project = await created.json();
  projectId = project.id;
  assert.equal(project.yayinda, false);
  await page.waitForURL(`**/panel/projeler/${projectId}`);
  await page.locator('[name=baslik]').waitFor();
  const draft = await site.goto(`${base}${project.adres}`);
  assert.equal(draft.status(), 404);
  console.log(`d) Taslak ${project.adres} → 404`);
  await page.locator('[name=musteri]').fill('E2E medya sırasında korunacak');
  await write(`/projeler/${projectId}/kapak`, 'POST', () => page.getByLabel('Kapak yükle').setInputFiles(photo('kapak.jpg')), 201);
  await page.locator('.p-cover img[src^="/yuklemeler/"]').first().waitFor();
  await page.waitForFunction(() => document.querySelector('.p-cover img[src^="/yuklemeler/"]')?.naturalWidth > 0);
  assert.equal(await page.locator('[name=musteri]').inputValue(), 'E2E medya sırasında korunacak');
  console.log('d) Kapak yüklendi; henüz kaydedilmemiş müşteri alanı korundu.');
  const uploaded = [];
  const uploadTimeline = [];
  const sentUpload = r => {
    if (r.url() === `${base}/api/panel/fotolar` && r.method() === 'POST') uploadTimeline.push('POST');
  };
  const uploads = async r => {
    if (r.url() === `${base}/api/panel/fotolar` && r.request().method() === 'POST') {
      uploaded.push(r); uploadTimeline.push(String(r.status()));
    }
  };
  page.on('request', sentUpload);
  page.on('response', uploads);
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  // Gerçek isteği kısa süre bekleterek mobil yükleme listesinin ara durumunu görüntüleriz.
  await page.route('**/api/panel/fotolar', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    if (!uploaded.length) await gate;
    await route.continue();
  });
  await page.getByLabel('Fotoğraf yükle', { exact: true }).setInputFiles([photo('foto-1.jpg'), photo('foto-2.jpg')]);
  await page.locator('[data-yukleme-durum="yükleniyor"]').waitFor();
  await page.locator('[data-yukleme-durum="bekliyor"]').waitFor();
  await page.locator('.p-upload-list').scrollIntoViewIfNeeded();
  await screen('14-proje-yukleme-390.png');
  const uploadResponse = page.waitForResponse(r => r.url() === `${base}/api/panel/fotolar` && r.request().method() === 'POST');
  release();
  const firstUploaded = await uploadResponse;
  assert.equal(firstUploaded.status(), 201);
  const secondUploaded = page.waitForResponse(r => r.url() === `${base}/api/panel/fotolar` &&
    r.request().method() === 'POST' && r !== firstUploaded);
  await page.waitForFunction(() => document.querySelectorAll('[data-yukleme-durum=tamam]').length === 2);
  assert.equal((await secondUploaded).status(), 201);
  await page.unroute('**/api/panel/fotolar');
  page.off('request', sentUpload);
  page.off('response', uploads);
  assert.equal(uploaded.length, 2);
  assert.deepEqual(uploadTimeline, ['POST', '201', 'POST', '201']);
  console.log(`Fotoğraf istek sırası: ${uploadTimeline.join(' → ')}`);
  for (const r of uploaded) { console.log(`POST /fotolar → ${r.status()}`); assert.equal(r.status(), 201); }
  await page.locator('[data-foto-id]').nth(1).waitFor();
  const secondPhoto = await page.locator('[data-foto-id]').nth(1).getAttribute('data-foto-id');
  await write('/siralama', 'PUT', () => page.locator('[data-foto-id]').nth(1).getByRole('button', { name: 'Yukarı taşı' }).click());
  await page.waitForFunction(id => document.querySelector('[data-foto-id]')?.getAttribute('data-foto-id') === id, secondPhoto);
  console.log('d) Birlikte seçilen 2 fotoğraf: 2 ayrı POST 201; ikinci fotoğraf artık ilk sırada.');
  const editorWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(editorWidth <= 390);
  console.log(`j) /panel/projeler/${projectId}: scrollWidth=${editorWidth} <= 390`);
  await page.setViewportSize({ width: 1440, height: 900 });
  await screen('13-proje-duzenle-1440.png', page, true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel('Yayında', { exact: true }).check();
  await write(`/projeler/${projectId}`, 'PATCH', () => page.getByRole('button', { name: 'Projeyi kaydet' }).click());
  const published = await site.goto(`${base}${project.adres}`);
  assert.equal(published.status(), 200);
  await site.getByRole('heading', { name: title, exact: true }).waitFor();
  console.log(`d) Yayında ${project.adres} → 200, başlık proje H1’inde doğrulandı.`);
  await page.getByRole('button', { name: 'Sil', exact: true }).last().click();
  const confirm = page.getByRole('dialog', { name: 'Silme onayı' });
  await confirm.waitFor();
  assert.match(await confirm.textContent(), /Fotoğraflarıyla birlikte silinir, geri alınamaz/);
  assert.match(await confirm.textContent(), new RegExp(title));
  await screen('19-sil-onay-390.png');
  await write(`/projeler/${projectId}`, 'DELETE', () => confirm.getByRole('button', { name: 'Evet, sil' }).click());
  const deletedId = projectId; projectId = undefined;
  await page.waitForURL('**/panel/projeler');
  await page.locator('.p-list').waitFor();
  assert.equal(await page.locator(`[data-proje-id="${deletedId}"]`).count(), 0);
  assert.equal((await site.goto(`${base}${project.adres}`)).status(), 404);
  console.log('d) DELETE 200; proje listede yok; vitrin tekrar 404.');

  await visit(page, '/panel/ayarlar');
  const location = page.locator('[name=konum_satiri]');
  await location.waitFor(); oldLocation = await location.inputValue();
  await page.setViewportSize({ width: 1440, height: 900 });
  await screen('15-ayarlar-1440.png', page, true);
  await page.setViewportSize({ width: 390, height: 844 });
  await screen('16-ayarlar-390.png', page, true);
  await location.fill('E2E Konum');
  const setting = await write('/ayarlar', 'PATCH', () => page.getByRole('button', { name: 'Değişiklikleri kaydet' }).click());
  assert.deepEqual(setting.request().postDataJSON(), { konum_satiri: 'E2E Konum' });
  console.log(`e) PATCH gövdesi: ${setting.request().postData()}`);
  locationChanged = true;
  await visit(site, '/');
  assert.equal(await site.locator('.hero-location').textContent(), 'E2E Konum');
  await location.fill(oldLocation);
  await write('/ayarlar', 'PATCH', () => page.getByRole('button', { name: 'Değişiklikleri kaydet' }).click());
  locationChanged = false;
  await visit(site, '/');
  assert.equal(await site.locator('.hero-location').textContent(), oldLocation);
  console.log('e) Ana sayfa konumu değişti ve eski değerine döndü.');

  const serviceName = `E2E Hizmet ${stamp}`;
  await visit(page, '/panel/hizmetler');
  await page.getByRole('button', { name: 'Hizmet ekle' }).click();
  let modal = page.getByRole('dialog', { name: 'Hizmet ekle' });
  await modal.locator('[name=baslik]').fill(serviceName);
  await modal.locator('[name=ozet]').fill('E2E hizmet açıklaması.');
  await modal.getByLabel('Aktif', { exact: true }).uncheck();
  const service = await write('/hizmetler', 'POST', () => modal.getByRole('button', { name: 'Hizmeti kaydet' }).click(), 201);
  serviceId = (await service.json()).id;
  const serviceCard = page.locator(`[data-hizmet-id="${serviceId}"]`);
  await serviceCard.waitFor();
  assert.equal(await serviceCard.locator('h2').textContent(), serviceName);
  await visit(site, '/hizmetler');
  assert.equal(await site.locator('.service-row').filter({ hasText: serviceName }).count(), 0);
  await serviceCard.getByRole('button', { name: 'Düzenle' }).click();
  modal = page.getByRole('dialog', { name: 'Hizmet düzenle' });
  await modal.getByLabel('Aktif', { exact: true }).check();
  await write(`/hizmetler/${serviceId}`, 'PATCH', () => modal.getByRole('button', { name: 'Hizmeti kaydet' }).click());
  await visit(site, '/hizmetler');
  await site.locator('.service-row').filter({ hasText: serviceName }).waitFor();
  await serviceCard.getByRole('button', { name: 'Sil', exact: true }).click();
  await write(`/hizmetler/${serviceId}`, 'DELETE', () => page.getByRole('dialog').getByRole('button', { name: 'Evet, sil' }).click());
  serviceId = undefined;
  await serviceCard.waitFor({ state: 'detached' });
  await visit(site, '/hizmetler');
  assert.equal(await site.locator('.service-row').filter({ hasText: serviceName }).count(), 0);
  console.log('f) Hizmet kendi kartında; pasif vitrinde yok → aktif var → onaylı silme sonrası yok.');

  const brandName = `E2E Marka ${stamp}`;
  await visit(page, '/panel/markalar');
  await page.getByRole('button', { name: 'Marka ekle' }).click();
  modal = page.getByRole('dialog', { name: 'Marka ekle' });
  await modal.locator('[name=ad]').fill(brandName);
  await modal.locator('[name=logo]').setInputFiles(photo('logo.jpg'));
  const brand = await write('/markalar', 'POST', () => modal.getByRole('button', { name: 'Markayı kaydet' }).click(), 201);
  brandId = (await brand.json()).id;
  const brandCard = page.locator(`[data-marka-id="${brandId}"]`);
  await brandCard.waitFor();
  assert.equal(await brandCard.locator('h2').textContent(), brandName);
  await visit(site, '/');
  await site.locator('.brands-grid img').first().waitFor();
  assert.equal(await site.locator(`.brands-grid img[alt="${brandName}"]`).count(), 1);
  await write(`/markalar/${brandId}`, 'PATCH', () => brandCard.getByLabel('Aktif', { exact: true }).uncheck());
  await visit(site, '/');
  assert.equal(await site.locator(`.brands-grid img[alt="${brandName}"]`).count(), 0);
  await brandCard.getByRole('button', { name: 'Sil', exact: true }).click();
  await write(`/markalar/${brandId}`, 'DELETE', () => page.getByRole('dialog').getByRole('button', { name: 'Evet, sil' }).click());
  brandId = undefined;
  await brandCard.waitFor({ state: 'detached' });
  console.log('g) Logolu marka kendi kartında ve vitrinde var; pasif vitrinde yok; onaylı silindi.');

  await visit(page, '/panel/sifre');
  await page.locator('[name=eskiSifre]').fill('bilerek-yanlis-eski');
  await page.locator('[name=yeniSifre]').fill('E2E-gecici-sifre-A');
  await page.locator('[name=tekrar]').fill('E2E-gecici-sifre-B');
  let passwordRequests = 0;
  const countPassword = r => { if (r.url().endsWith('/api/panel/sifre') && r.method() === 'POST') passwordRequests++; };
  page.on('request', countPassword);
  await page.getByRole('button', { name: 'Şifreyi değiştir' }).click();
  await page.getByRole('alert').filter({ hasText: 'Yeni şifreler eşleşmiyor' }).waitFor();
  assert.equal(passwordRequests, 0);
  await page.locator('[name=tekrar]').fill('E2E-gecici-sifre-A');
  await write('/sifre', 'POST', () => page.getByRole('button', { name: 'Şifreyi değiştir' }).click(), 400);
  await page.getByRole('alert').filter({ hasText: 'Mevcut şifre yanlış' }).waitFor();
  page.off('request', countPassword);
  console.log('i) Eşleşmeyen şifre: istek=0; yanlış eski şifre POST 400; gerçek şifre değiştirilmedi.');

  for (const path of ['/panel/teklifler', '/panel/projeler', '/panel/projeler/yeni', '/panel/galeri',
    '/panel/hizmetler', '/panel/markalar', '/panel/ayarlar', '/panel/kayitlar', '/panel/sifre']) {
    await visit(page, path);
    await page.waitForTimeout(300);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(width <= 390, `${path}: ${width}`);
    assert.equal(await page.locator('.site-header,.site-footer,.floating-whatsapp,.hero').count(), 0);
    console.log(`j) ${path}: scrollWidth=${width} <= 390; vitrin kabuğu=0`);
    if (path === '/panel/kayitlar') {
      await page.locator('[data-kayit-id]').first().waitFor();
      await screen('18-kayitlar-390.png');
    }
    await page.setViewportSize({ width: 360, height: 844 });
    const smallWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(smallWidth <= 360, `${path}: ${smallWidth}`);
    console.log(`Ek mobil) ${path}: scrollWidth=${smallWidth} <= 360`);
    await page.setViewportSize({ width: 390, height: 844 });
  }
  await page.getByRole('button', { name: 'Diğer', exact: true }).click();
  await page.getByRole('dialog', { name: 'Diğer', exact: true }).waitFor();
  await screen('17-menu-diger-390.png');
  for (let n = 0; n < 12; n++) {
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => !!document.activeElement.closest('dialog')), true);
  }
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog[open]').count(), 0);
  await visit(site, '/');
  assert.equal(await site.locator('.site-header').count(), 1);
  assert.equal(await site.locator('.floating-whatsapp').count(), 1);
  console.log('k) Panel: üst bölüm/WhatsApp=0; vitrin: üst bölüm=1, WhatsApp=1. Çekmece odak ve ESC geçti.');
  await screen('01b-ana-ilk-ekran-390.png', site);
  await site.setViewportSize({ width: 1440, height: 900 });
  await visit(site, '/');
  await screen('01b-ana-ilk-ekran-1440.png', site);
  await visit(site, '/projeler');
  await screen('03b-projeler-1440.png', site);
  console.log('D01) 16:9 proje kartları, firma adı tekrarının kaldırılması ve açılış üst degradenin ekranları alındı.');
  await expired(390);
  await page.setViewportSize({ width: 1440, height: 900 });
  await login();
  console.log('a/1440) Yanlış giriş ve doğru giriş doğrulandı.');
  await makeOffer(1440);
  await expired(1440);
  console.log(`Beklenen olumsuz HTTP senaryolarının Chrome kaynak hata kayıtları: ${expectedErrors.length}`);
  console.log(`pageerror + uygulama console.error: ${errors.length}`);
  errors.forEach(e => console.log(e));
  assert.equal(errors.length, 0);
  console.log('SONUÇ: TÜM PANEL SENARYOLARI GEÇTİ');
} catch (e) {
  failure = e;
  try {
    const state = await site.evaluate(() => ({
      yol: location.pathname,
      formlar: Array.from(document.forms).map(f => ({ gecerli: f.checkValidity(),
        alanlar: Array.from(f.elements).filter(e => e.validity && !e.validity.valid).map(e => e.name) })),
      dugmeler: Array.from(document.querySelectorAll('button[type=submit]')).map(b => ({ metin: b.textContent, kapali: b.disabled })),
    }));
    console.log('Hata anındaki vitrin formu durumu:', JSON.stringify(state));
    await site.screenshot({ path: 'codex/kanit/02-hata-vitrin.png' });
  } catch (diagnosticError) { console.log('Hata ekranı alınamadı:', diagnosticError.name); }
} finally {
  try {
  // Yarım kalan tur bile yalnız bu turun oluşturduğu içerikleri API üzerinden temizler.
  const needsCleanup = projectId || serviceId || brandId || locationChanged;
  if (needsCleanup) {
    if (!authenticated) {
      const response = await context.request.post(`${base}/api/panel/giris`, {
        data: { kullaniciAdi: 'yonetici', sifre: process.env.SEED_SIFRE_YONETICI }, headers: { 'x-real-ip': ip },
      });
      assert.equal(response.status(), 200);
    }
    for (const [path, id] of [['projeler', projectId], ['hizmetler', serviceId], ['markalar', brandId]]) {
      if (!id) continue;
      const r = await context.request.delete(`${base}/api/panel/${path}/${id}`);
      console.log(`Temizlik DELETE /${path}/${id} → ${r.status()}`);
      assert.equal(r.status(), 200);
    }
    if (locationChanged) {
      const r = await context.request.patch(`${base}/api/panel/ayarlar`, { data: { konum_satiri: oldLocation } });
      assert.equal(r.status(), 200); console.log('Temizlik: konum_satiri eski değerine döndü → 200');
    }
  }
  } catch (e) { failure ??= e; }
  finally { await browser.close(); }
}
if (failure) {
  // Playwright istek hataları çerez başlığını da içerir; kanıtta sır taşınmamalı.
  const message = String(failure.message).replace(/seker_oturum=[A-Za-z0-9_.-]+/g, 'seker_oturum=[gizlendi]');
  console.error(`Panel E2E başarısız: ${message}`);
  process.exitCode = 1;
}
