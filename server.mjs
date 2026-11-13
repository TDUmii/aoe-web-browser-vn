import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import engine, { allowedAsset } from './api/engine.js';

const files = new Map([
  ['/', ['public/index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['public/index.html', 'text/html; charset=utf-8']],
  ['/boot.js', ['public/boot.js', 'text/javascript; charset=utf-8']],
  ['/localize.js', ['public/localize.js', 'text/javascript; charset=utf-8']],
  ['/game-font.js', ['public/game-font.js', 'text/javascript; charset=utf-8']],
  ['/campaign-localize.js', ['public/campaign-localize.js', 'text/javascript; charset=utf-8']],
  ['/game.css', ['public/game.css', 'text/css; charset=utf-8']],
  ['/vi-game.json', ['public/vi-game.json', 'application/json; charset=utf-8']],
  ['/vi-ui.json', ['public/vi-ui.json', 'application/json; charset=utf-8']],
  ['/campaign-vi.json', ['public/campaign-vi.json', 'application/json; charset=utf-8']],
  ['/favicon.svg', ['public/favicon.svg', 'image/svg+xml']],
]);

export function makeServer() {
  return createServer(async (request, response) => {
    const path = new URL(request.url, 'http://localhost').pathname;
    if (allowedAsset(path)) return engine(request, response, path);
    const entry = files.get(path);
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    if (!entry) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Không tìm thấy trang.');
      return;
    }
    try {
      const body = await readFile(new URL(entry[0], import.meta.url));
      response.writeHead(200, {
        'Content-Type': entry[1],
        'Content-Length': body.length,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      }).end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(500).end('Không đọc được tài nguyên trang.');
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 8097);
  const server = makeServer();
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Đế Chế Web: http://127.0.0.1:${port}`));
}
