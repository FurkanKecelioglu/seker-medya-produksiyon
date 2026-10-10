import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';

const [name, program, ...args] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(name) || !program) throw new Error('Kayıt adı ve komut gerekli');
const log = createWriteStream(`codex/RAPOR/${name}.txt`);
const child = spawn(program === 'node' ? process.execPath : program, args, {
  stdio: ['inherit', 'pipe', 'pipe'], windowsHide: true,
});
child.stdout.on('data', chunk => { process.stdout.write(chunk); log.write(chunk); });
child.stderr.on('data', chunk => { process.stderr.write(chunk); log.write(chunk); });
child.on('exit', code => {
  log.end();
  process.exitCode = code ?? 1;
});
