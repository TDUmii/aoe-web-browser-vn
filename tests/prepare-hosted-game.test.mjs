import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { prepareHostedGame } from '../scripts/prepare-hosted-game.mjs';

const root = await mkdtemp(join(tmpdir(), 'aoe-hosted-test-'));
try {
  const source = join(root, 'input.zip'), output = join(root, 'output');
  const input = Buffer.alloc(45 * 1024 * 1024 + 17, 0x71);
  input.write('PK'); input[input.length - 1] = 0x23;
  await writeFile(source, input);
  const config = await prepareHostedGame(source, output);
  assert.equal(config.gameParts.length, 2);
  assert.equal(config.gameParts[0].size, 45 * 1024 * 1024);
  const assembled = [];
  for (const part of config.gameParts) {
    assert.match(part.url, /^assets\/game\/[a-f0-9]{16}-\d{2}\.part$/);
    const bytes = await readFile(join(output, part.url));
    assert.equal(bytes.length, part.size); assembled.push(bytes);
  }
  assert.deepEqual(Buffer.concat(assembled), input);
  assert.equal(config.sha256, createHash('sha256').update(input).digest('hex'));
  assert.deepEqual(await prepareHostedGame(source, output), config, 'identical repeat is safe');
  await writeFile(join(output, config.gameParts[1].url), 'conflict');
  await assert.rejects(prepareHostedGame(source, output), /Refusing to overwrite/);
  assert.equal((await readFile(join(output, config.gameParts[1].url))).toString(), 'conflict');
  const oversized = join(root, 'large.zip');
  const { open } = await import('node:fs/promises');
  const large = await open(oversized, 'w'); await large.truncate(300 * 1024 * 1024 + 1); await large.close();
  await assert.rejects(prepareHostedGame(oversized, join(root, 'large-output')), /300 MiB/);
  console.log('Hosted preparation: real part boundary/reassembly, hashes, repeat, conflicts and cap passed.');
} finally {
  // root is the exact directory returned by mkdtemp above; never derive cleanup from CLI input.
  await rm(root, { recursive: true, force: true });
}
