import { readdir, readFile } from 'node:fs/promises';

async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (path !== 'src/generated') await scan(path);
    } else if (/\.(tsx?|css)$/.test(path)) {
      const text = await readFile(path, 'utf8');
      text.split(/\r?\n/).forEach((line, i) => {
        if ([...line].length > 140) console.log(`${path}:${i + 1} (${[...line].length})`);
      });
    }
  }
}
await scan('src');
