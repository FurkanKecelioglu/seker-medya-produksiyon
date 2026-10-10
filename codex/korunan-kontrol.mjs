import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const baseline = JSON.parse((await readFile('codex/RAPOR/korunan-baslangic.json', 'utf8')).replace(/^\uFEFF/, ''));
let changed = 0;
for (const row of baseline) {
  const hash = createHash('sha256').update(await readFile(row.chemin)).digest('hex').toUpperCase();
  if (hash !== row.hash) { changed++; console.log(`DEĞİŞMİŞ: ${row.chemin}`); }
}
console.log(`Korunan dosya sayısı: ${baseline.length}; değişen: ${changed}`);
if (changed) process.exitCode = 1;
