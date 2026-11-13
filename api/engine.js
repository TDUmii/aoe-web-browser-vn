import https from 'node:https';
import { assetPath } from '../asset-policy.js';
import { patchRenderer } from '../renderer-patch.js';

export function allowedAsset(path) {
  return assetPath(path) !== null;
}

export default function engine(request, response, pathOverride) {
  const path = assetPath(pathOverride ?? new URL(request.url, 'http://localhost').searchParams.get('path'));
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  if (path === null) {
    response.writeHead(404).end();
    return;
  }
  // The origin is fixed, with no browser cookies, authorization or query forwarded.
  const upstream = https.request(new URL(path, 'https://vivalarts.com'), {
    method: request.method,
    headers: { 'User-Agent': 'DeCheWeb/3.0 public-game-loader' },
    timeout: 30000,
  }, source => {
    if (path === '/assets/loadbar-COOfBw5G.js' && request.method === 'GET' && source.statusCode === 200) {
      let text = '';
      source.setEncoding('utf8');
      source.on('data', chunk => { text += chunk; });
      source.on('end', () => {
        try {
          const body = patchRenderer(path, text);
          response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
          response.end(body);
        } catch {
          response.writeHead(502, { 'Cache-Control': 'no-store' }).end();
        }
      });
      source.on('error', () => response.destroy());
      return;
    }
    response.writeHead(source.statusCode, {
      'Content-Type': source.headers['content-type'] || 'application/octet-stream',
      'Cache-Control': source.statusCode === 200 ? 'public, max-age=3600, s-maxage=86400' : 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
    });
    source.on('error', () => response.destroy());
    source.pipe(response);
  });
  upstream.on('timeout', () => upstream.destroy(new Error('upstream-timeout')));
  upstream.on('error', () => {
    if (!response.headersSent) response.writeHead(502, { 'Cache-Control': 'no-store' });
    response.end();
  });
  response.on('close', () => upstream.destroy());
  upstream.end();
}
