import { chromium } from 'playwright-core';
import { config } from 'dotenv';
config({ quiet: true });
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await context.request.post('http://localhost:3060/api/panel/giris', {
  data: { kullaniciAdi: 'yonetici', sifre: process.env.SEED_SIFRE_YONETICI }, headers: { 'x-real-ip': '192.0.2.250' },
});
const page = await context.newPage();
const session = await context.newCDPSession(page);
await session.send('Runtime.enable');
session.on('Runtime.consoleAPICalled', e => {
  if (e.type === 'error') console.log('ÇAĞRI İZİ', page.url(), JSON.stringify(e.stackTrace));
});
page.on('console', m => { if (m.type() === 'error') console.log('HATA', m.text()); });
page.on('pageerror', e => console.log('PAGEERROR', e.message));
try {
  for (let tur = 0; tur < 3; tur++) {
    for (const path of ['teklifler', 'projeler', 'projeler/yeni', 'galeri', 'hizmetler', 'markalar', 'ayarlar', 'kayitlar', 'sifre']) {
      await page.goto(`http://localhost:3060/panel/${path}`, { waitUntil: 'domcontentloaded' });
      await page.locator('.panel[data-hazir=true]').waitFor();
      await page.waitForTimeout(350);
      console.log(`${tur + 1}) /panel/${path}`);
    }
  }
} finally { await browser.close(); }
