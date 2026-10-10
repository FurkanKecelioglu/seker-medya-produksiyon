import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

const commands = {
  tsc: ['npx tsc --noEmit', 'npx.cmd', ['tsc', '--noEmit']],
  lint: ['npm run lint', 'npm.cmd', ['run', 'lint']],
  api: ['npm test', 'npm.cmd', ['test']],
  'panel-1': ['node codex/e2e-panel.mjs', process.execPath, ['codex/e2e-panel.mjs']],
  'panel-2': ['node codex/e2e-panel.mjs', process.execPath, ['codex/e2e-panel.mjs']],
  vitrin: ['node codex/e2e-vitrin.mjs', process.execPath, ['codex/e2e-vitrin.mjs']],
  build: ['node codex/uretim-panel-prova.mjs build', process.execPath, ['codex/uretim-panel-prova.mjs', 'build']],
  'api-wrapper': ['node codex/panel-api-kontrol.mjs', process.execPath, ['codex/panel-api-kontrol.mjs']],
  'panel-prod': ['PANEL_TEST_URL=http://localhost:3062 node codex/e2e-panel.mjs', process.execPath, ['codex/e2e-panel.mjs']],
};
const key = process.argv[2];
if (!commands[key]) throw new Error('Bilinmeyen kanıt komutu');
await mkdir('codex/kanit', { recursive: true });
const [label, binary, args] = commands[key];
console.log(`$ ${label}`);
const env = key === 'panel-prod' ? { ...process.env, PANEL_TEST_URL: 'http://localhost:3062' } : process.env;
const child = binary.endsWith('.cmd')
  ? spawn('cmd.exe', ['/d', '/s', '/c', [binary, ...args].join(' ')], { windowsHide: true, env })
  : spawn(binary, args, { windowsHide: true, env });
let output = '';
child.stdout.on('data', b => { output += b.toString(); process.stdout.write(b); });
child.stderr.on('data', b => { output += b.toString(); process.stderr.write(b); });
const code = await new Promise((resolve, reject) => {
  child.on('error', reject); child.on('exit', resolve);
});
await writeFile(`codex/kanit/02-${key}.txt`, `$ ${label}\n${output}\nÇıkış kodu: ${code}\n`, 'utf8');
process.exitCode = code ?? 1;
