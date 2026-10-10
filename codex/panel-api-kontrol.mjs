import assert from 'node:assert/strict';
import { tsImport } from 'tsx/esm/api';

const { api, ApiHatasi } = await tsImport('../src/components/panel/api.ts', import.meta.url);
let redirects = 0;
globalThis.window = { location: { replace: path => { assert.equal(path, '/panel/giris'); redirects++; } } };
globalThis.fetch = async () => new Response(JSON.stringify({ hata: 'Oturum açmanız gerekiyor' }), { status: 401 });
const outcomes = await Promise.allSettled(Array.from({ length: 5 }, () => api('/ben')));
assert.equal(outcomes.filter(r => r.status === 'rejected' && r.reason instanceof ApiHatasi).length, 5);
assert.equal(redirects, 1);
console.log('API sarmalayıcısı: eşzamanlı 5 adet 401 → 1 yönlendirme, 5 Türkçe hata.');
globalThis.fetch = async () => { throw new TypeError('Network failure'); };
await assert.rejects(() => api('/ben'), /Sunucuya ulaşılamadı/);
console.log('API sarmalayıcısı: ağ kopması Türkçe mesaja dönüştü.');
globalThis.fetch = async (_url, options) => {
  assert.ok(options.body instanceof FormData);
  assert.equal(options.headers, undefined);
  return new Response(JSON.stringify({ ok: true }), { status: 201 });
};
await api('/fotolar', 'POST', new FormData());
console.log('API sarmalayıcısı: FormData korunur; multipart sınırını tarayıcı üretir.');
