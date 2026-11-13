import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { assetPath } from '../asset-policy.js';
import { patchRenderer } from '../renderer-patch.js';
import { patchMultiplayer } from '../multiplayer/patch.mjs';

const project = new URL('../', import.meta.url);
const destination = resolve(process.argv[2] || 'dist');
const types = { html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', json: 'application/json; charset=utf-8', svg: 'image/svg+xml' };
const files = {};
for (const name of await readdir(new URL('public/', project))) {
  const type = types[name.split('.').at(-1)];
  if (type) files['/' + name] = [type, await readFile(new URL('public/' + name, project), 'utf8')];
}
const source = `const files = ${JSON.stringify(files)};
${assetPath.toString()}
${patchRenderer.toString()}
${patchMultiplayer.toString()}
export default { async fetch(request) {
  if (!['GET','HEAD'].includes(request.method)) return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
  const url = new URL(request.url);
  const entry = files[url.pathname === '/' ? '/index.html' : url.pathname];
  if (entry) return new Response(request.method === 'HEAD' ? null : entry[1],{headers:{'Content-Type':entry[0],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});
  const path = assetPath(url.pathname);
  if (!path) return new Response(null,{status:404});
  try {
    const upstream = await fetch(new URL(path,'https://vivalarts.com'),{method:request.method,redirect:'manual',headers:{'User-Agent':'DeCheWeb/3.0 public-game-loader'}});
    if (upstream.status >= 300 && upstream.status < 400) return new Response(null,{status:502});
    const patched = ['/assets/loadbar-COOfBw5G.js','/assets/game-n1fFuRY1.js','/assets/model-BbESgICJ.js'].includes(path) && upstream.ok && request.method === 'GET';
    const body = patched ? patchMultiplayer(path,patchRenderer(path,await upstream.text())) : upstream.body;
    return new Response(body,{status:upstream.status,headers:{'Content-Type':upstream.headers.get('content-type')||'application/octet-stream','Content-Disposition':'inline','Cache-Control':patched?'no-cache':upstream.ok?'public, max-age=3600, s-maxage=86400':'no-store','X-Content-Type-Options':'nosniff'}});
  } catch { return new Response(null,{status:502}); }
}};
`;
await mkdir(join(destination, 'server'), { recursive: true });
await writeFile(join(destination, 'server/index.js'), source);
if (process.argv[3]) {
  await mkdir(join(destination, '.openai'), { recursive: true });
  await writeFile(join(destination, '.openai/hosting.json'), JSON.stringify({ project_id: process.argv[3], d1: null, r2: null }) + '\n');
}
console.log(JSON.stringify({ output: destination, localFiles: Object.keys(files).length, workerBytes: Buffer.byteLength(source) }));
