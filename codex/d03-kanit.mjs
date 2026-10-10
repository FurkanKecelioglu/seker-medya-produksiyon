import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const key = process.argv[2];
const commands = {
  tsc: ['npx tsc --noEmit', 'cmd.exe', ['/d', '/s', '/c', 'npx.cmd tsc --noEmit']],
  lint: ['npm run lint', 'cmd.exe', ['/d', '/s', '/c', 'npm.cmd run lint']],
  api: ['npm test', 'cmd.exe', ['/d', '/s', '/c', 'npm.cmd test']],
  awk: ["awk 'length > 140' (node codex/awk-kontrol.mjs)", process.execPath, ['codex/awk-kontrol.mjs']],
  vitrin: ['node codex/e2e-vitrin.mjs', process.execPath, ['codex/e2e-vitrin.mjs']],
  panel: ['node codex/e2e-panel.mjs', process.execPath, ['codex/e2e-panel.mjs']],
  film: ['node codex/d03-film-denetim.mjs', process.execPath, ['codex/d03-film-denetim.mjs']],
  ek: ['node codex/d03-ek-denetim.mjs', process.execPath, ['codex/d03-ek-denetim.mjs']],
  giris1: ['node codex/e2e-giris.mjs codex/kanit/d03-tur1', process.execPath,
    ['codex/e2e-giris.mjs', 'codex/kanit/d03-tur1']],
  giris2: ['node codex/e2e-giris.mjs codex/ekran', process.execPath, ['codex/e2e-giris.mjs', 'codex/ekran']],
  encoding: ['rg -n "[ÃÄÅ]" src', 'rg', ['-n', '[ÃÄÅ]', 'src']],
  buttons: ['rg -n "<button(?![^>]*type=)" src --pcre2', 'rg', ['-n', '<button(?![^>]*type=)', 'src', '--pcre2']],
  colors: ['rg -n "#[0-9a-fA-F]{3,8}\\b" src/components/site/giris', 'rg',
    ['-n', '#[0-9a-fA-F]{3,8}\\b', 'src/components/site/giris']],
};
const [label, binary, args] = commands[key] ?? [];
if (!binary) throw new Error('Bilinmeyen komut');
console.log(`$ ${label}`);
const child = spawn(binary, args, { windowsHide: true });
let output = '';
for (const stream of [child.stdout, child.stderr]) stream.on('data', b => {
  output += b.toString(); process.stdout.write(b);
});
const code = await new Promise((resolve, reject) => {
  child.on('error', reject); child.on('exit', resolve);
});
await writeFile(`codex/kanit/d03-${key}.txt`, `$ ${label}\n${output || '(boş çıktı)\n'}Çıkış kodu: ${code}\n`);
process.exitCode = ['encoding', 'buttons', 'colors'].includes(key) && code === 1 ? 0 : code;
