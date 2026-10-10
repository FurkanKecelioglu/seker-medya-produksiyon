import { readdir, readFile, writeFile } from 'node:fs/promises';
import { config } from 'dotenv';

config({ quiet: true });
const secret = process.env.SEED_SIFRE_YONETICI;
if (!secret) throw new Error('Kontrol için giriş sırrı bulunamadı.');
if (process.argv.includes('--mask-existing-log')) {
  const path = 'codex/RAPOR/codex-01.log';
  const bytes = await readFile(path);
  const needle = Buffer.from(secret);
  let offset = 0;
  let matches = 0;
  while ((offset = bytes.indexOf(needle, offset)) >= 0) {
    bytes.fill(42, offset, offset + needle.length);
    offset += needle.length;
    matches++;
  }
  if (matches) await writeFile(path, bytes);
  console.log(`Önceki günlükte maskelenen şifre değeri: ${matches}; diğer baytlar korunur.`);
}
const found = [];
let count = 0;
async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${item.name}`;
    if (item.isDirectory()) await walk(path);
    else if (/\.(md|mjs|txt|log|ps1)$/.test(item.name)) {
      count++;
      if ((await readFile(path, 'utf8')).includes(secret)) found.push(path);
    }
  }
}
await walk('codex');
const output = `$ node codex/panel-sir-kontrol.mjs\nKontrol edilen metin dosyası: ${count}; şifre içeren: ${found.length}\n`;
console.log(output.trimEnd());
for (const path of found) console.log(path);
await writeFile('codex/kanit/02-sir-kontrol.txt', output, 'utf8');
process.exitCode = found.length ? 1 : 0;
