import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import WebSocket from 'ws';
import { attachMultiplayer } from '../multiplayer/websocket.mjs';
import { AOE_BUILD } from '../multiplayer/rooms.mjs';

test('WebSocket accepts same-origin native watcher and rejects foreign origins', async () => {
  const server = createServer();
  attachMultiplayer(server);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const host = `127.0.0.1:${server.address().port}`;
  const url = `ws://${host}/ws/${AOE_BUILD}`;
  let good;
  try {
    good = new WebSocket(url, { origin: `http://${host}` });
    await once(good, 'open');
    const reply = once(good, 'message');
    good.send(JSON.stringify({ t: 'roomsWatch', game: 'aoe1', mp: AOE_BUILD, proto: 11 }));
    assert.equal(JSON.parse(String((await reply)[0])).t, 'rooms');
    const bad = new WebSocket(url, { origin: 'http://foreign.example' });
    const error = await new Promise(resolve => {
      bad.once('error', resolve);
      bad.once('open', () => { bad.terminate(); resolve(null); });
    });
    assert.ok(error, 'foreign Origin must not open a socket');
  } finally {
    good?.terminate();
    await new Promise(resolve => server.close(resolve));
  }
});
