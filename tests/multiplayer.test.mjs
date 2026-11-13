import test from 'node:test';
import assert from 'node:assert/strict';
import { createRooms, AOE_BUILD } from '../multiplayer/rooms.mjs';

test('two clients create/join, share seed, tick commands, pause and desync', async () => {
  const rooms = createRooms({ tickMs: 5 });
  try {
    const a = [], b = [];
    const host = rooms.connect(m => a.push(m)), guest = rooms.connect(m => b.push(m));
    for (const client of [host, guest]) client.receive({ t: 'hello', proto: 11, game: 'aoe1', games: { aoe1: AOE_BUILD } });
    host.receive({ t: 'createRoom', game: 'aoe1' });
    guest.receive({ t: 'joinRoom', code: a.at(-1).room.code });
    assert.equal(a.at(-1).room.canStart, true);
    guest.receive({ t: 'startGame' });
    assert.equal(b.at(-1).t, 'error');
    host.receive({ t: 'startGame' });
    const startA = a.at(-1), startB = b.at(-1);
    assert.equal(startA.t, 'start');
    assert.equal(startA.seed, startB.seed);
    assert.equal(startB.slot, 1);
    host.receive({ t: 'ready' }); guest.receive({ t: 'ready' });
    assert.deepEqual(startA.setup, startB.setup);
    guest.receive({ t: 'cmd', c: { p: 1, c: '010203' } });
    await new Promise(r => setTimeout(r, 18));
    const ticksA = a.filter(m => m.t === 'ticks'), ticksB = b.filter(m => m.t === 'ticks');
    assert.deepEqual(ticksA, ticksB);
    assert.equal(ticksA[0].cmds[0][1].p, 2);
    host.receive({ t: 'pauseGame' });
    const count = a.filter(m => m.t === 'ticks').length;
    await new Promise(r => setTimeout(r, 12));
    assert.equal(a.filter(m => m.t === 'ticks').length, count);
    guest.receive({ t: 'resumeGame' });
    host.receive({ t: 'hash', tick: 0, h: 1 }); guest.receive({ t: 'hash', tick: 0, h: 2 });
    assert.equal(a.at(-1).t, 'desync');
  } finally { rooms.close(); }
});

test('AI between human seats keeps lobby seat and simulation player distinct', () => {
  const rooms = createRooms();
  try {
    const a = [], b = [];
    const host = rooms.connect(m => a.push(m)), guest = rooms.connect(m => b.push(m));
    for (const client of [host, guest]) client.receive({ t: 'hello', proto: 11, games: { aoe1: AOE_BUILD } });
    host.receive({ t: 'createRoom' });
    const code = a.at(-1).room.code;
    assert.equal(code.length, 5);
    host.receive({ t: 'setSlot', index: 1, kind: 'ai' });
    host.receive({ t: 'setSlot', index: 2, kind: 'closed' });
    guest.receive({ t: 'joinRoom', code });
    assert.equal(b.at(-1).room.you, 3);
    host.receive({ t: 'startGame' });
    assert.equal(b.at(-1).slot, 2);
    assert.deepEqual(b.at(-1).humanSlots, [0, 2]);
    assert.equal(b.at(-1).setup.seats[1].human, false);
  } finally { rooms.close(); }
});

test('invalid slot indices and native options are bounded and room capacity recovers', () => {
  const rooms = createRooms({ maxRooms: 1, maxClients: 3 });
  try {
    const a = [], b = [], rejected = [];
    const host = rooms.connect(m => a.push(m)), guest = rooms.connect(m => b.push(m));
    rooms.connect(() => {});
    rooms.connect(m => rejected.push(m));
    assert.equal(rejected[0].code, 'full');
    for (const c of [host, guest]) c.receive({ t: 'hello', proto: 11, games: { aoe1: AOE_BUILD } });
    host.receive({ t: 'createRoom' });
    for (const index of [-1, 8, 100, 1.5]) assert.doesNotThrow(() => host.receive({ t: 'setSlot', index, kind: 'ai' }));
    host.receive({ t: 'setAoe1', options: { mapSize: 999, popLimit: Infinity, mode: {}, mapType: -1, cheats: 'true', difficulty: 4 } });
    const options = a.at(-1).room.aoe1;
    assert.equal(options.mapSize, 3);
    assert.equal(options.popLimit, 50);
    assert.equal(options.cheats, false);
    assert.equal(options.difficulty, 4);
    guest.receive({ t: 'createRoom' });
    assert.equal(b.at(-1).t, 'error');
    host.close();
    host.receive({ t: 'createRoom' }); // closed sessions cannot allocate rooms
    guest.receive({ t: 'createRoom' });
    assert.equal(b.at(-1).t, 'room');
  } finally { rooms.close(); }
});
