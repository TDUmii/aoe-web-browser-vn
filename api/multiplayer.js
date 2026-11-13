import { createServer } from 'node:http';
import { attachMultiplayer } from '../multiplayer/websocket.mjs';

const server = createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify({ game: 'aoe1', multiplayer: 'experimental', storage: 'single-instance' }));
});
attachMultiplayer(server);
export default server;
