import { cp, mkdir, symlink, lstat, writeFile, rmdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { config } from 'dotenv';

const root = process.cwd();
const mode = process.argv[2] ?? 'all';
const stage = resolve(tmpdir(), 'produksiyon-d03-prova-20261010');
await mkdir(stage, { recursive: true });
for (const name of ['src', 'public', 'package.json', 'tsconfig.json', 'next.config.ts', 'postcss.config.mjs',
  'next-env.d.ts', '.gitignore']) {
  try { await lstat(resolve(root, name)); } catch { continue; }
  await cp(resolve(root, name), resolve(stage, name), { recursive: true });
}
try { await lstat(resolve(stage, 'node_modules')); }
catch { await symlink(resolve(root, 'node_modules'), resolve(stage, 'node_modules'), 'junction'); }
config({ path: resolve(root, '.env'), quiet: true });
const env = { ...process.env, TZ: 'UTC', NODE_ENV: 'production' };
let output = '';
function log(chunk) { output += chunk.toString(); process.stdout.write(chunk); }
async function run(args, cwd, childEnv = env) {
  const child = spawn(process.execPath, args, { cwd, env: childEnv, windowsHide: true });
  child.stdout.on('data', log); child.stderr.on('data', log);
  const code = await new Promise((r, reject) => { child.on('exit', r); child.on('error', reject); });
  if (code !== 0) throw new Error(`Prova alt süreci çıkış kodu: ${code}`);
}
const next = resolve(root, 'node_modules/next/dist/bin/next');
let server;
try {
  if (mode !== 'test') {
    log('$ Ayrı kopyada next build --webpack; dev .next korunur; TZ=UTC; sırlar yalnız ortamda.\n');
    await run([next, 'build', '--webpack'], stage);
  }
  if (mode !== 'build') {
  server = spawn(process.execPath, [next, 'start', '-p', '3063', '-H', '127.0.0.1'], {
    cwd: stage, env, windowsHide: true,
  });
  server.stdout.on('data', log); server.stderr.on('data', log);
  let ready = false;
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch('http://localhost:3063')).status === 200) { ready = true; break; } } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  if (!ready) throw new Error('Prova sunucusu açılmadı');
  log('$ GIRIS_URL=http://localhost:3063/ node codex/e2e-giris.mjs codex/kanit/d03-uretim\n');
  await run(['codex/e2e-giris.mjs', 'codex/kanit/d03-uretim'], root,
    { ...env, GIRIS_URL: 'http://localhost:3063/' });
  log('$ TEST_URL=http://localhost:3063 node tests/test-api.mjs (TZ=UTC)\n');
  await run(['tests/test-api.mjs'], root, { ...env, TEST_URL: 'http://localhost:3063' });
  log(`GET dev localhost:3060 → ${(await fetch('http://localhost:3060')).status}\n`);
  }
} finally {
  server?.kill();
  if (mode !== 'build' && (await lstat(resolve(stage, 'node_modules'))).isSymbolicLink()) {
    // rmdir özyinelemeli değildir: yalnız junction kaldırılır, paketlerin içeriği silinmez.
    await rmdir(resolve(stage, 'node_modules'));
    log('Prova paket junction bağlantısı kaldırıldı; asıl node_modules korunur.\n');
  }
  await writeFile(`codex/kanit/d03-uretim${mode === 'build' ? '-build' : ''}.txt`, output);
}
