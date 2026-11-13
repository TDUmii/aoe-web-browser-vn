import { WebSocketServer } from 'ws';
import { createRooms, AOE_BUILD } from './rooms.mjs';

export function attachMultiplayer(server) {
  const rooms = createRooms();
  const sockets = new WebSocketServer({ noServer: true, maxPayload: 32768 });
  server.on('upgrade', (request, socket, head) => {
    let path;
    try {
      path = new URL(request.url, 'http://localhost').pathname;
      if (request.headers.origin) {
        const origin = new URL(request.headers.origin);
        const protocol = request.headers['x-forwarded-proto']?.split(',')[0].trim() || (request.socket.encrypted ? 'https' : 'http');
        if (origin.host !== request.headers.host || origin.protocol !== `${protocol}:`) return socket.destroy();
      }
    } catch { return socket.destroy(); }
    if (![ `/ws/${AOE_BUILD}`, '/api/multiplayer' ].includes(path) || sockets.clients.size >= 256) return socket.destroy();
    sockets.handleUpgrade(request, socket, head, ws => sockets.emit('connection', ws));
  });
  sockets.on('connection', ws => {
    const session = rooms.connect(message => {
      if (ws.readyState !== 1) return;
      const data = JSON.stringify(message);
      if (data.length > 2 * 1024 * 1024 || ws.bufferedAmount > 2 * 1024 * 1024) return ws.terminate();
      ws.send(data);
    });
    ws.alive = true;
    ws.on('pong', () => { ws.alive = true; });
    let windowStart = Date.now(), count = 0;
    ws.on('message', data => {
      if (Date.now() - windowStart >= 1000) { windowStart = Date.now(); count = 0; }
      if (++count > 120) return ws.close(1008, 'Quá nhiều tin nhắn.');
      try { session.receive(JSON.parse(String(data))); } catch { ws.close(1007, 'Gói tin không hợp lệ.'); }
    });
    ws.on('close', () => session.close());
    ws.on('error', () => {});
  });
  const heartbeat = setInterval(() => {
    for (const ws of sockets.clients) {
      if (!ws.alive) { ws.terminate(); continue; }
      ws.alive = false;
      ws.ping();
    }
  }, 30000);
  heartbeat.unref();
  server.on('close', () => {
    clearInterval(heartbeat);
    rooms.close();
    for (const ws of sockets.clients) ws.terminate();
    sockets.close();
  });
  return sockets;
}
