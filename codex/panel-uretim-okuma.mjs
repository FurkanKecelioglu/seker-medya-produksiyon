import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const base = 'http://localhost:3062';
let output = '$ node codex/panel-uretim-okuma.mjs\n';
const record = text => { console.log(text); output += `${text}\n`; };
for (const path of ['/panel', '/panel/teklifler', '/panel/projeler', '/panel/ayarlar']) {
  const response = await fetch(`${base}${path}`, { redirect: 'manual' });
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), '/panel/giris');
  record(`${path}: oturumsuz HTTP 307 → /panel/giris`);
}
const response = await fetch(`${base}/panel/giris`);
const html = await response.text();
assert.equal(response.status, 200);
assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
assert.match(html, /<form method="post"/);
assert.match(html, /<button type="submit"[^>]*disabled/);
record('/panel/giris: HTTP 200; noindex/nofollow; ilk HTML’de method=post ve disabled gönderim.');
await writeFile('codex/kanit/02-uretim-okuma.txt', output, 'utf8');
