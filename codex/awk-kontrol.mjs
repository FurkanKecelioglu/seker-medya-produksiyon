import { spawnSync } from 'node:child_process';

const args = '--files src --path-separator / -g "*.tsx" -g "*.ts" -g "*.css" -g "!src/generated/**"';
const command = `awk 'length > 140 {print FILENAME":"FNR}' $(rg ${args})`;
const result = spawnSync('C:/laragon/bin/git/bin/bash.exe', ['--noprofile', '--norc', '-c', command], {
  env: { ...process.env, LC_ALL: 'en_US.UTF-8', MSYS_NO_PATHCONV: '1' }, encoding: 'utf8', windowsHide: true,
});
if (result.error) throw result.error;
process.stdout.write(result.stdout + result.stderr);
process.exitCode = result.status ?? 1;
