import { readdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const paths = [];
async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await scan(path);
    else if (/\.(tsx?|css)$/.test(path)) paths.push(path);
  }
}
await scan('src/app/(site)');
await scan('src/components');
paths.push('src/app/globals.css', 'src/app/layout.tsx', 'src/app/not-found.tsx', 'src/app/error.tsx');
let tooLong = 0;
for (const path of paths) {
  const source = await readFile(path, 'utf8');
  source.split(/\r?\n/).forEach((line, i) => {
    if ([...line].length > 140) { tooLong++; console.log(`${path}:${i + 1}`); }
  });
}
console.log(`Ön yüz kapsamı: ${paths.length} TS/TSX/CSS dosyası; 140 karakteri aşan satır: ${tooLong}`);
assert.equal(tooLong, 0);
