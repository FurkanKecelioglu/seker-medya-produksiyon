import { config } from 'dotenv';
import { spawn } from 'node:child_process';

config({ quiet: true });
// Yerel parola yalnız alt sürecin ortamına gider; komut satırına ve günlüğe yazılmaz.
const env = { ...process.env, TEST_SIFRE: process.env.SEED_SIFRE_YONETICI };
const child = spawn('cmd.exe', ['/d', '/s', '/c', 'npm test'], {
  env, stdio: 'inherit', windowsHide: true,
});
child.on('exit', code => { process.exitCode = code ?? 1; });
