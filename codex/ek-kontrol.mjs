import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';

const base = process.env.VITRIN_TEST_URL || 'http://localhost:3061';
const paths = ['/', '/hakkimizda', '/hizmetler', '/projeler', '/galeri', '/iletisim', '/teklif-al'];
for (const path of paths) {
  const response = await fetch(`${base}${path}`);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.equal(response.headers.has('x-nextjs-prerender'), false);
  assert.ok(!/s-maxage=31536000/.test(response.headers.get('cache-control') || ''));
  assert.match(html, /<h1[ >]/);
  assert.match(html, /<meta name="description"/);
  assert.match(html, /<meta property="og:/);
  console.log(`${path}: HTTP 200; ilk HTML'de H1 + description + OG; donmuş önbellek yok.`);
}
for (const path of ['/olmayan-sayfa', '/projeler/olmayan-proje']) {
  const response = await fetch(`${base}${path}`);
  const html = await response.text();
  assert.equal(response.status, 404);
  assert.match(html, /Bu sahne bulunamadı/);
  assert.match(html, /noindex/);
  console.log(`${path}: HTTP 404; noindex var. Ekranın gerçek DOM'u aşağıda tarayıcıda denetlenir.`);
}
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
for (const path of ['/olmayan-sayfa', '/projeler/olmayan-proje']) {
  await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Bu sahne bulunamadı.' }).waitFor();
  assert.ok(await page.getByRole('link', { name: 'Proje Teklifi Al', exact: true }).first().isVisible());
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const font = await page.locator('h1').evaluate(el => getComputedStyle(el).fontFamily);
  assert.equal(background, 'rgb(9, 9, 9)');
  assert.match(font, /Oswald/);
  console.log(`${path}: tarayıcıda Türkçe H1 ve teklif bağlantısı görünür; koyu tema + Oswald doğru.`);
}
await page.goto(`${base}/projeler?kategori=gecersiz`, { waitUntil: 'domcontentloaded' });
assert.equal(await page.locator('[data-project-card]').count(), 8);
assert.equal(await page.locator('.category-tabs [aria-current]').textContent(), 'Tümü 8');
console.log('Geçersiz kategori: Tümü seçili, 8 yayın projesi.');
await page.goto(`${base}/teklif-al`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !document.querySelector('button[type=submit]').disabled);
await page.locator('[name=ad]').fill('E2E Test');
await page.locator('[name=telefon]').fill('05551234567');
await page.locator('[name=mesaj]').fill('E2E Test: alan bazlı hata görünürlüğü kontrolü.');
await page.locator('[name=kvkk]').check();
// Bu iki kontrol yalnız istemcinin hata sunumunu sınar; gerçek API kanıtı e2e-vitrin'dedir.
await page.route('**/api/teklif', route => route.fulfill({
  status: 400, contentType: 'application/json', body: JSON.stringify({ hata: 'Telefon numarası geçersiz.', alan: 'telefon' }),
}));
await page.locator('button[type=submit]').click();
await page.locator('.field-error').waitFor();
assert.equal(await page.locator('[name=telefon]').getAttribute('aria-invalid'), 'true');
assert.match(await page.locator('.field-error').textContent(), /Telefon numarası/);
console.log('İstemci hata sunumu (400 yanıt benzetimi): mesaj telefon altında; aria-invalid=true.');
await page.unroute('**/api/teklif');
await page.route('**/api/teklif', route => route.fulfill({
  status: 429, contentType: 'application/json', body: JSON.stringify({ hata: 'Çok fazla talep gönderildi. Telefon ile ulaşın.' }),
}));
await page.locator('button[type=submit]').click();
await page.locator('.form-error').waitFor();
assert.match(await page.locator('.form-error').textContent(), /Çok fazla talep/);
console.log('İstemci hata sunumu (429 yanıt benzetimi): mesaj form üstünde; düğme yeniden etkin.');
await browser.close();
