import { spawnSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const checks = [
  ['npx tsc --noEmit', 'cmd.exe', ['/d', '/s', '/c', 'npx tsc --noEmit']],
  ['npm run lint', 'cmd.exe', ['/d', '/s', '/c', 'npm run lint']],
  ['rg -n "[ÃÄÅ]" src', 'rg', ['-n', '[ÃÄÅ]', 'src']],
  ['rg -n "<button(?![^>]*type=)" src --pcre2', 'rg', ['-n', '<button(?![^>]*type=)', 'src', '--pcre2']],
  ['rg -n "<form(?![^>]*method=)" src --pcre2', 'rg', ['-n', '<form(?![^>]*method=)', 'src', '--pcre2']],
  [
    'rg -n "#[0-9a-fA-F]{3,8}\\b" src --glob "!src/app/globals.css" --glob "!src/generated/**"',
    'rg', ['-n', '#[0-9a-fA-F]{3,8}\\b', 'src', '--glob', '!src/app/globals.css', '--glob', '!src/generated/**'],
  ],
  [
    'rg -n "Şeker Medya|Hikâyenizi|0532|Çankırı" src -g "!src/lib/**" -g "!src/generated/**"',
    'rg', ['-n', 'Şeker Medya|Hikâyenizi|0532|Çankırı', 'src', '-g', '!src/lib/**', '-g', '!src/generated/**'],
  ],
  ['node codex/satir-kontrol.mjs', process.execPath, ['codex/satir-kontrol.mjs']],
  ['node codex/korunan-kontrol.mjs', process.execPath, ['codex/korunan-kontrol.mjs']],
  ['git status --short', 'git', ['status', '--short']],
];
const results = [];
for (const [command, program, args] of checks) {
  const result = spawnSync(program, args, { encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
  if (result.error) throw result.error;
  const output = result.stdout + result.stderr;
  results.push({ command, output, code: result.status });
  console.log(`$ ${command}\n${output}[çıkış: ${result.status}]`);
}
await writeFile('codex/RAPOR/kanitlar.json', JSON.stringify(results, null, 2), 'utf8');
if (results.some(r => r.code !== 0 && !(r.command.startsWith('rg ') && r.code === 1))) process.exitCode = 1;
