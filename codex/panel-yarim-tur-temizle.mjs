import { config } from 'dotenv';
import assert from 'node:assert/strict';
config({ quiet: true });
const base = 'http://localhost:3062';
const login = await fetch(`${base}/api/panel/giris`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'x-real-ip': '192.0.2.251' },
  body: JSON.stringify({ kullaniciAdi: 'yonetici', sifre: process.env.SEED_SIFRE_YONETICI }),
});
assert.equal(login.status, 200);
const cookie = login.headers.get('set-cookie').split(';')[0];
const get = await fetch(`${base}/api/panel/projeler/40`, { headers: { Cookie: cookie } });
if (get.status === 404) console.log('Yarım turdaki proje #40 zaten silinmiş → 404.');
else {
  assert.equal(get.status, 200);
  const project = await get.json();
  assert.match(project.baslik, /^E2E Proje [0-9]+$/);
  assert.equal(project.yayinda, false);
  const response = await fetch(`${base}/api/panel/projeler/40`, { method: 'DELETE', headers: { Cookie: cookie } });
  assert.equal(response.status, 200);
  console.log('Yarım turdaki kendi taslak projesi #40 API üzerinden silindi → 200.');
}
