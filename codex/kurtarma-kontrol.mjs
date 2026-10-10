import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

const source = resolve(tmpdir(), 'produksiyon-vitrin-paket-kurtarma-01-20261010');
const target = resolve('node_modules');
let total = 0;
let wrong = 0;
async function check(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, e.name);
    if (e.isDirectory()) await check(path);
    else if (e.isFile()) {
      const other = resolve(target, relative(source, path));
      const hash = b => createHash('sha256').update(b).digest('hex');
      try {
        if (hash(await readFile(path)) !== hash(await readFile(other))) { wrong++; console.log(relative(source, path)); }
      } catch { wrong++; console.log(`Eksik: ${relative(source, path)}`); }
      total++;
    }
  }
}
await check(source);
console.log(`Geri alınan paket dosyaları: ${total}; SHA-256 farklı/eksik: ${wrong}`);
if (wrong) process.exitCode = 1;
