// Prepare local hosting artifacts only. This script never uploads game data.
import { createReadStream } from 'node:fs';
import { mkdir, open, readFile, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PART_SIZE = 45 * 1024 * 1024;
const MAX_SIZE = 300 * 1024 * 1024;

async function hashFile(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

async function writeIdentical(path, bytes) {
  await mkdir(dirname(path), { recursive: true });
  try { await writeFile(path, bytes, { flag: 'wx' }); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    if (!(await readFile(path)).equals(bytes)) throw new Error(`Refusing to overwrite different existing file: ${path}`);
  }
}

export async function prepareHostedGame(source, output) {
  const info = await stat(source);
  if (!info.isFile() || info.size === 0 || info.size > MAX_SIZE) throw new Error('Game ZIP must be a nonempty file of at most 300 MiB.');
  const sha256 = await hashFile(source);
  const prefix = sha256.slice(0, 16), parts = [];
  const file = await open(source, 'r');
  try {
    for (let position = 0, index = 1; position < info.size; index++) {
      const buffer = Buffer.alloc(Math.min(PART_SIZE, info.size - position));
      let filled = 0;
      while (filled < buffer.length) {
        const { bytesRead } = await file.read(buffer, filled, buffer.length - filled, position + filled);
        if (!bytesRead) throw new Error('Source file changed or ended during packaging.');
        filled += bytesRead;
      }
      const url = `assets/game/${prefix}-${String(index).padStart(2, '0')}.part`;
      await writeIdentical(join(output, url), buffer);
      parts.push({ url, size: buffer.length });
      position += buffer.length;
    }
  } finally { await file.close(); }
  // Detect a changing input instead of publishing inconsistent part metadata.
  if (await hashFile(source) !== sha256) throw new Error('Source changed during packaging. Keep the input unchanged and retry in a new output directory.');
  const config = {
    edition: 'full', title: 'Đế Chế - Rise of Rome',
    gameParts: parts, size: info.size, sha256,
  };
  await writeIdentical(join(output, 'game-config.json'), Buffer.from(JSON.stringify(config, null, 2) + '\n'));
  return config;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length > 2) throw new Error('Usage: node scripts/prepare-hosted-game.mjs [source.zip] [output-directory]');
  const source = resolve(args[0] || join(ROOT, 'local-game/aoe-standard-web/aoe-full.zip'));
  const output = resolve(args[1] || join(ROOT, 'local-game/hosted-game'));
  const config = await prepareHostedGame(source, output);
  console.log(JSON.stringify({ output, parts: config.gameParts.length, size: config.size, sha256: config.sha256 }, null, 2));
}
