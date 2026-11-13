import { randomBytes, randomInt } from 'node:crypto';

export const AOE_BUILD = '8b338ddc1fd0b8ff';
const id = () => randomBytes(5).toString('hex').toUpperCase();
const defaults = { mode: 'random', mapType: 3, mapSize: 3, victoryType: 0, victoryAmount: 0,
  startingAge: 0, resourceLevel: 0, difficulty: 2, pathFinding: 0, fullVisibility: false,
  fixedPositions: true, fullTechTree: false, popLimit: 50, cheats: false };
const optionValues = { mode: ['random', 'deathmatch'], mapType: [0,1,2,3,4,5,6,7,8],
  mapSize: [0,1,2,3,4,5], victoryType: [0,1,7,8], startingAge: [0,1,2,3,4,5],
  resourceLevel: [0,2,3], difficulty: [0,1,2,3,4], pathFinding: [0,1,2],
  popLimit: [25,50,75,100,125,150,175,200] };
const validOption = (key, value) => optionValues[key] ? optionValues[key].includes(value)
  : key === 'victoryAmount' ? Number.isInteger(value) && value >= 0 && value <= 15000
  : typeof defaults[key] === 'boolean' && typeof value === 'boolean';

// Rooms belong to one running server. Deploy a single instance or add a shared
// coordinator before running multiple instances.
export function createRooms({ tickMs = 50, maxClients = 256, maxRooms = 64 } = {}) {
  const rooms = new Map();
  const clients = new Set();
  const send = (client, message) => client.send(message);
  const error = (client, msg) => send(client, { t: 'error', code: 'invalid', msg });
  function view(room, client) {
    return { code: room.code, game: 'aoe1', public: room.public, you: client.seat,
      slots: room.slots, aoe1: room.options, canStart: !room.match && room.clients.length >= 2 };
  }
  function update(room) {
    for (const client of room.clients) send(client, { t: 'room', room: view(room, client) });
    for (const client of clients) {
      if (client.watch === 'rooms') send(client, { t: 'rooms', game: 'aoe1', rooms: [...rooms.values()]
        .filter(r => r.public && !r.match).map(r => ({ code: r.code, host: r.clients[0].nick,
          count: r.clients.length, size: 8, taken: r.clients.length, seats: r.slots.filter(s => s.kind === 'human' || s.kind === 'open').length })) });
      if (client.watch === 'lobby') send(client, { t: 'lobby', pools: [], rooms: [] });
    }
  }
  function leave(client) {
    const room = client.room;
    if (!room) return;
    client.room = null;
    if (room.match) {
      clearInterval(room.match.timer);
      for (const other of room.clients) if (other !== client) {
        send(other, { t: 'error', code: 'gone', msg: 'Một người chơi đã rời trận.' });
        other.room = null;
      }
      rooms.delete(room.code);
      update({ clients: [] });
      return;
    }
    if (room.clients[0] === client) {
      for (const other of room.clients.slice(1)) { other.room = null; send(other, { t: 'roomClosed', reason: 'Chủ phòng đã rời.' }); }
      rooms.delete(room.code);
      update({ clients: [] });
    } else {
      room.clients.splice(room.clients.indexOf(client), 1);
      room.slots[client.seat] = { kind: 'open', aoe1Civ: 17, aoe1Colour: client.seat, team: 1 };
      update(room);
    }
  }
  function connect(sendMessage) {
    if (clients.size >= maxClients) {
      sendMessage({ t: 'error', code: 'full', msg: 'Máy chủ đã đầy.' });
      return { receive() {}, close() {} };
    }
    const client = { send: sendMessage, nick: 'PLAYER', room: null, hello: false };
    clients.add(client);
    return {
      receive(message) {
        if (!clients.has(client)) return;
        if (!message || typeof message !== 'object' || Array.isArray(message)) return error(client, 'Gói tin không hợp lệ.');
        if (message.t === 'hello') {
          if (message.proto !== 11 || message.game && message.game !== 'aoe1' || message.games?.aoe1 !== AOE_BUILD)
            return send(client, { t: 'error', code: 'version', msg: 'Phiên bản trò chơi không khớp.' });
          client.nick = String(message.nick || 'PLAYER').slice(0, 16);
          client.hello = true;
          return send(client, { t: 'welcome' });
        }
        if (['roomsWatch', 'lobbyWatch'].includes(message.t)) {
          client.watch = message.t === 'roomsWatch' ? 'rooms' : 'lobby';
          return update({ clients: [] });
        }
        if (!client.hello) return error(client, 'Hãy kết nối trước.');
        if (message.t === 'createRoom') {
          if (client.room) return error(client, 'Bạn đã ở trong phòng.');
          if (rooms.size >= maxRooms) return error(client, 'Máy chủ đã đầy phòng.');
          let code; do { code = id().slice(0, 5); } while (rooms.has(code));
          const room = { code, public: !!message.public, clients: [client],
            slots: Array.from({ length: 8 }, (_, i) => ({ kind: i ? 'open' : 'human', nick: i ? undefined : client.nick, aoe1Civ: 17, aoe1Colour: i, team: 1 })),
            options: { ...defaults } };
          client.room = room; client.seat = 0; rooms.set(room.code, room); return update(room);
        }
        if (message.t === 'joinRoom') {
          if (client.room) return error(client, 'Bạn đã ở trong phòng.');
          const room = rooms.get(String(message.code).toUpperCase());
          if (!room || room.match || room.clients.length >= 8) return error(client, 'Phòng không còn chỗ trống.');
          const slot = room.slots.findIndex(s => s.kind === 'open');
          if (slot < 0) return error(client, 'Phòng không còn chỗ trống.');
          client.room = room; client.seat = slot; room.clients.push(client);
          room.slots[slot] = { ...room.slots[slot], kind: 'human', nick: client.nick };
          return update(room);
        }
        const room = client.room;
        if (!room) return error(client, 'Bạn chưa vào phòng.');
        const match = room.match;
        const slot = match ? client.gameSlot : client.seat;
        if (message.t === 'leaveRoom' || message.t === 'leaveGame') return leave(client);
        if (message.t === 'chatSend') {
          const text = String(message.text || '').trim().slice(0, 200);
          if (text) for (const other of room.clients) send(other, { t: 'chat', slot, nick: client.nick, text });
          return;
        }
        if (match) {
          if (message.t === 'ready') {
            if (match.stopped) return;
            match.ready.add(client);
            if (match.ready.size === room.clients.length && !match.timer) match.timer = setInterval(() => {
              if (match.paused && Date.now() < match.pauseUntil) return;
              if (match.paused) {
                match.paused = false;
                for (const other of room.clients) send(other, { t: 'unpaused', slot, nick: client.nick });
              }
              const tick = ++match.tick;
              const cmds = match.pending.splice(0).map(c => [tick, c]);
              for (const other of room.clients) send(other, { t: 'ticks', from: tick, to: tick, cmds });
            }, tickMs);
            return;
          }
          if (message.t === 'cmd') {
            if (match.pending.length < 128 && message.c && typeof message.c === 'object')
              if (typeof message.c.c === 'string' && message.c.c.length <= 8192 && /^(?:[0-9a-fA-F]{2})+$/.test(message.c.c))
                match.pending.push({ p: slot + 1, c: message.c.c });
            return;
          }
          if (message.t === 'pauseGame' || message.t === 'resumeGame') {
            match.paused = message.t === 'pauseGame';
            match.pauseUntil = Date.now() + 60000;
            for (const other of room.clients) send(other, match.paused
              ? { t: 'paused', slot, nick: client.nick, left: 3, endsInMs: 60000 }
              : { t: 'unpaused', slot, nick: client.nick });
            return;
          }
          if (message.t === 'hash') {
            if (!Number.isInteger(message.tick) || message.tick < 0 || message.tick > match.tick + 1 ||
              !Number.isInteger(message.h) || message.h < 0 || message.h > 0xffffffff) return;
            const hashes = match.hashes.get(message.tick) || new Map();
            hashes.set(slot, message.h); match.hashes.set(message.tick, hashes);
            if (match.hashes.size > 100) match.hashes.delete(match.hashes.keys().next().value);
            if (hashes.size === room.clients.length) {
              if (new Set(hashes.values()).size > 1) {
                clearInterval(match.timer); match.timer = null;
                match.stopped = true;
                for (const other of room.clients) send(other, { t: 'desync', tick: message.tick });
              }
              match.hashes.delete(message.tick);
            }
            return;
          }
          return;
        }
        if (message.t === 'setAoe1Seat') {
          const index = message.index;
          if (!Number.isInteger(index) || !room.slots[index] || index !== slot && (slot !== 0 || room.slots[index].kind === 'human')) return error(client, 'Không thể đổi người chơi này.');
          for (const [key, field, min, max] of [['civ', 'aoe1Civ', 1, 17], ['colour', 'aoe1Colour', 0, 7], ['team', 'team', 1, 5]])
            if (Number.isInteger(message[key]) && message[key] >= min && message[key] <= max) room.slots[index][field] = message[key];
          return update(room);
        }
        if (slot !== 0) return error(client, 'Chỉ chủ phòng có thể thay đổi cài đặt.');
        if (message.t === 'setAoe1') {
          for (const key of Object.keys(defaults)) if (validOption(key, message.options?.[key])) room.options[key] = message.options[key];
          return update(room);
        }
        if (message.t === 'setSlot') {
          if (Number.isInteger(message.index) && room.slots[message.index] && room.slots[message.index].kind !== 'human' && ['open', 'closed', 'ai'].includes(message.kind))
            room.slots[message.index].kind = message.kind;
          return update(room);
        }
        if (message.t === 'startGame') {
          if (room.clients.length < 2) return error(client, 'Cần ít nhất hai người chơi.');
          room.match = { tick: -1, seed: randomInt(1, 2147483647), id: id(), ready: new Set(), pending: [], hashes: new Map(), timer: null, paused: false };
          const activeSeats = room.slots.map((s, index) => ({ ...s, index })).filter(s => s.kind === 'human' || s.kind === 'ai');
          for (const other of room.clients) other.gameSlot = activeSeats.findIndex(s => s.index === other.seat);
          const setup = { seed: room.match.seed, mapSeed: randomInt(1, 2147483647), options: room.options,
            seats: activeSeats.map(s => ({ human: s.kind === 'human',
              civ: s.aoe1Civ === 17 ? randomInt(1, 17) : s.aoe1Civ, colour: s.aoe1Colour, team: s.team, name: s.nick || 'Máy tính' })) };
          for (const other of room.clients) send(other, { t: 'start', game: 'aoe1', gameId: room.match.id,
            seed: room.match.seed, slot: other.gameSlot, humanSlots: room.clients.map(c => c.gameSlot), slots: room.clients.map(c => room.slots[c.seat]),
            delayTicks: 2, hashPeriod: 100, setup });
        }
      },
      close() { leave(client); clients.delete(client); },
    };
  }
  return { connect, close() { for (const room of rooms.values()) clearInterval(room.match?.timer); rooms.clear(); clients.clear(); } };
}
