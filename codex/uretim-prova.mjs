import { cp, mkdir, symlink, lstat, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { config } from 'dotenv';
import { tmpdir } from 'node:os';

const root = process.cwd();
const stage = resolve(tmpdir(), 'produksiyon-vitrin-prova-01-20261010');
await mkdir(stage, { recursive: true });
const items = [
  'src', 'public', 'package.json', 'tsconfig.json', 'next.config.ts', 'postcss.config.mjs', 'next-env.d.ts', '.gitignore',
];
for (const item of items) {
  try { await lstat(resolve(root, item)); } catch { continue; }
  await cp(resolve(root, item), resolve(stage, item), { recursive: true });
}
const modules = resolve(stage, 'node_modules');
try { await lstat(modules); } catch { await symlink(resolve(root, 'node_modules'), modules, 'junction'); }
config({ path: resolve(root, '.env'), quiet: true });
// Sırlar dosyaya kopyalanmaz; prova sürecine yalnız bellekten aktarılır.
const env = { ...process.env, TZ: 'UTC', NODE_ENV: 'production' };
const mode = process.argv[2] || 'build';
const args = mode === 'start' ? ['start', '-p', '3061', '-H', '127.0.0.1'] : ['build', '--webpack'];
const child = spawn(process.execPath, [resolve(root, 'node_modules/next/dist/bin/next'), ...args], {
  cwd: stage, env, stdio: 'inherit', windowsHide: true,
});
child.on('exit', code => { process.exitCode = code ?? 1; });
process.on('SIGINT', () => child.kill());
if (mode === 'build') {
  console.log('Prova: ayrı kaynak kopyası; ortak paketler; TZ=UTC; .env kopyalanmadı.');
} else {
  const buildId = (await readFile(resolve(stage, '.next/BUILD_ID'), 'utf8')).trim();
  console.log(`Prova üretim BUILD_ID: ${buildId}`);
}
