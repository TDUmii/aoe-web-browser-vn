import assert from 'node:assert/strict';
import { test } from 'node:test';
import { once } from 'node:events';
import { makeServer } from '../server.mjs';

test('development server serves the player and cannot expose local game files or Git data', async () => {
  const server = makeServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(origin);
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-type'), /^text\/html/);
    assert.match(await page.text(), /https:\/\/vivalarts\.com\//);
    const script = await fetch(`${origin}/app.js`, { method: 'HEAD' });
    assert.equal(script.status, 200);
    assert.match(script.headers.get('content-type'), /javascript/);
    assert.equal(await script.text(), '');
    for (const path of ['/.git/config', '/local-game/aoe-full.zip', '/64/index.html', '/server.mjs', '/%2e%2e/README.md']) {
      assert.equal((await fetch(origin + path)).status, 404, path);
    }
    assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
