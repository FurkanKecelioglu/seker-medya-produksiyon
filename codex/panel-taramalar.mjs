import { spawnSync } from 'node:child_process';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

let output = '';
let failed = false;
function record(s) { output += `${s}\n`; console.log(s); }
const checks = [
  ['rg -n "[ÃÄÅ]" src', ['-n', '[ÃÄÅ]', 'src'], 1],
  ['rg -n "<button(?![^>]*type=)" src --pcre2', ['-n', '<button(?![^>]*type=)', 'src', '--pcre2'], 1],
  ['rg -n "<form(?![^>]*method=)" src --pcre2', ['-n', '<form(?![^>]*method=)', 'src', '--pcre2'], 1],
  ['rg -n "toISOString\\(\\)\\.slice" src --glob "!src/lib/**"',
    ['-n', 'toISOString\\(\\)\\.slice', 'src', '--glob', '!src/lib/**'], 1],
  ['rg -n \'accept="image/\\*"\' src', ['-n', 'accept="image/\\*"', 'src'], 1],
  ['rg -n "fetch\\(" src/app/panel src/components/panel',
    ['-n', 'fetch\\(', 'src/app/panel', 'src/components/panel'], 0],
  ['rg -n "#[0-9a-fA-F]{3,8}\\b" src/app/panel src/components/panel',
    ['-n', '#[0-9a-fA-F]{3,8}\\b', 'src/app/panel', 'src/components/panel'], 1],
];
for (const [label, args, expected] of checks) {
  record(`$ ${label}`);
  const r = spawnSync('rg', args, { encoding: 'utf8', windowsHide: true });
  if (r.error) throw r.error;
  if (r.stdout || r.stderr) record((r.stdout + r.stderr).trimEnd());
  record(`Çıkış kodu: ${r.status}`);
  if (r.status !== expected) failed = true;
  if (label.includes('fetch') && r.stdout.trim().split('\n').some(s => !s.startsWith('src/components/panel\\api.ts:'))) {
    failed = true;
  }
}
record('$ awk \'length > 140 {print FILENAME":"FNR}\' $(rg --files src -g "*.tsx" -g "*.ts" -g "*.css" -g "!src/generated/**")');
const awk = spawnSync(process.execPath, ['codex/awk-kontrol.mjs'], { encoding: 'utf8', windowsHide: true });
if (awk.stdout || awk.stderr) record((awk.stdout + awk.stderr).trimEnd());
record(`Çıkış kodu: ${awk.status}`);
if (awk.status !== 0 || awk.stdout.trim()) failed = true;
record('$ git status --short');
const git = spawnSync('git', ['status', '--short'], { encoding: 'utf8', windowsHide: true });
record((git.stdout + git.stderr).trimEnd());
record(`Çıkış kodu: ${git.status}`);
const before = JSON.parse((await readFile('codex/kanit/02-korunan-once.json', 'utf8')).replace(/^\uFEFF/, ''));
const different = [];
for (const entry of before) {
  const data = await readFile(entry.yol);
  const hash = createHash('sha256').update(data).digest('hex').toUpperCase();
  if (hash !== entry.hash) different.push(entry.yol);
}
const allFiles = [];
async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const file = resolve(path, entry.name);
    if (entry.isDirectory()) await walk(file); else allFiles.push(file);
  }
}
for (const path of ['src/lib', 'src/app/api', 'src/app/yuklemeler', 'prisma', 'tests', 'tools', 'dagitim', 'src/generated']) {
  await walk(path);
}
const newFiles = allFiles.filter(p => !before.some(e => e.yol.toLowerCase() === p.toLowerCase()));
record('$ node codex/panel-taramalar.mjs (başlangıç SHA-256 özetleriyle korunan dosyaları karşılaştırma)');
record(`Korunan dosya: ${before.length}; farklı: ${different.length}; yeni: ${newFiles.length}`);
for (const file of [...different, ...newFiles]) record(file);
if (different.length || newFiles.length) failed = true;
await writeFile('codex/kanit/02-taramalar.txt', output, 'utf8');
process.exitCode = failed ? 1 : 0;
