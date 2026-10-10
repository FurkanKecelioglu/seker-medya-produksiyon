import { readFile } from 'node:fs/promises';
import { config } from 'dotenv';
import assert from 'node:assert/strict';

config({ quiet: true });
const report = await readFile('codex/RAPOR/RAPOR-01.md', 'utf8');
for (const title of [
  'Yapılan adımlar', 'Kanıt çıktıları', 'Ekran görüntüleri', 'Yapılamayanlar ve sebebi',
  'Arka uçtan beklenen', 'Kullanıcıdan beklenen',
]) assert.ok(report.includes(`## ${title}`));
for (const key of ['SEED_SIFRE_YONETICI', 'SESSION_SECRET', 'TEKLIF_JETON_SECRET', 'DATABASE_URL']) {
  const value = process.env[key];
  if (value) assert.equal(report.includes(value), false, `${key} raporda bulunmamalı`);
}
assert.equal(report.split('SONUÇ: TÜM VİTRİN SENARYOLARI GEÇTİ').length - 1, 3);
console.log('Rapor: 6 zorunlu bölüm; 3 başarılı E2E çıktısı; gizli ortam değerleri yok.');
const response = await fetch('http://localhost:3060');
assert.equal(response.status, 200);
console.log('Dev ön izleme: http://localhost:3060 → HTTP 200');
