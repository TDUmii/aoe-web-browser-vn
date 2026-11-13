import assert from 'node:assert/strict';
import { test } from 'node:test';
import { once } from 'node:events';
import { makeServer } from '../server.mjs';
import { allowedAsset } from '../api/engine.js';
import { translateText } from '../public/localize.js';

test('direct game server serves local UI and blocks unrelated files and writes', async () => {
  const server = makeServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(origin);
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-type'), /^text\/html/);
    assert.match(await page.text(), /id="screen"/);
    const script = await fetch(`${origin}/boot.js`, { method: 'HEAD' });
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

test('display translation preserves commands, whitespace, counts and user content', () => {
  const phrases = { Cancel: 'Hủy', Off: 'Tắt', 'Queue a farm to reseed (right click: take one back)': 'Gieo lại ruộng' };
  assert.equal(translateText('  Cancel ', phrases), '  Hủy ');
  assert.equal(translateText('Player 8', phrases), 'Người chơi 8');
  assert.equal(translateText('Edge Scroll: Off', phrases), 'Cuộn mép: Tắt');
  assert.equal(translateText(' · Game time 01:42', phrases), ' · Thời gian trận 01:42');
  assert.equal(translateText('Queue a farm to reseed (right click: take one back) (3)', phrases), 'Gieo lại ruộng (3)');
  assert.equal(translateText('pepperoni pizza', phrases), 'pepperoni pizza');
  assert.equal(translateText('Nguyễn Văn An', phrases), 'Nguyễn Văn An');
  for (const name of ['constructor', 'toString', '__proto__']) {
    assert.equal(translateText(name, phrases), name);
  }
  assert.equal(translateText('Custom', { Custom: { value: 'invalid' } }), 'Custom');
  assert.equal(translateText('Inherited', Object.create({ Inherited: 'Không dùng' })), 'Inherited');
  assert.equal(translateText('Edge Scroll: toString', phrases), 'Cuộn mép: toString');
  const farm = 'Queue a farm to reseed (right click: take one back) (2)';
  assert.equal(translateText(farm, {}), farm);
});

test('asset relay accepts only public modules and AOE assets on its fixed origin', () => {
  assert.equal(allowedAsset('/assets/strings-D2PwFU4r.js'), true);
  assert.equal(allowedAsset('/dev-assets/aoe1/web/interfac/50500.bin'), true);
  assert.equal(allowedAsset('/art/logo/favicon-32.png'), true);
  assert.equal(allowedAsset('/dev-assets/graphics/ui/menu_button_1.png'), true);
  assert.equal(allowedAsset('/dev-assets/aoe1/web/ai/AGGRESSIVE%203%20ATTACKERS.PER'), true);
  assert.equal(allowedAsset('/dev-assets/aoe1/web/ai/AGGRESSIVE 3 ATTACKERS.PER'), true);
  assert.equal(allowedAsset('/dev-assets/aoe1/web/ai/Defend%20(2)-player.PER'), true);
  for (const path of [
    '/dev-assets/aoe1/web/%2e%2e/private.txt',
    '/dev-assets/aoe1/web/%252e%252e/private.txt',
    '/dev-assets/aoe1/web/ai/AGGRESSIVE%25203.PER',
    '/dev-assets/aoe1/web/ai/bad%5cname.PER',
    '/dev-assets/aoe1/web/ai/bad%00name.PER',
    '/dev-assets/aoe1/web/ai/bad%0aname.PER',
    '/dev-assets/aoe1/web/ai/bad%7fname.PER',
    '/dev-assets/aoe1/web/ai/bad%3fname.PER',
    '/dev-assets/aoe1/web/ai/bad%23name.PER',
    '/dev-assets/aoe1/web/ai/bad%zzname.PER',
    '/dev-assets/aoe1/web/game%2eexe',
    '/dev-assets/aoe1/web/game.EXE%20',
    '/dev-assets/aoe1/web/game.zip',
    '/dev-assets/aoe1/web/game.7z',
  ]) assert.equal(allowedAsset(path), false, path);
  assert.equal(allowedAsset('/dev-assets/aoe1/web/game.exe'), false);
  for (const path of [null, '', 'https://example.com/file.js', '//example.com/assets/a.js', '/assets/../secret.js', '/assets/%2e%2e/private.js', '/dev-assets/aoe1/rig/private.txt', '/dev-assets/warcraft/game.bin', '/lobby', '/bugs', '/assets/a.js?url=https://example.com', '/assets/a.js\\other']) {
    assert.equal(allowedAsset(path), false, String(path));
  }
});
