import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Run the actual interceptor in isolation: no emulator/game boot or mirrored implementation.
const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const start = source.indexOf('function installXhrInterceptor()');
const end = source.indexOf('// ─── 32-bit shell bootstrap', start);
assert.ok(start >= 0 && end > start);
class XHR {
  open(method, url) { this.url = url; }
  send() { this.network = true; }
  setRequestHeader() {}
}
class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(result => { this.result = result; this.onload(); });
  }
}
const bytes = Uint8Array.from({ length: 70000 }, (_, index) => index % 256);
const context = vm.createContext({
  window: { XMLHttpRequest: XHR }, FileReader, Uint8Array,
  location: { hostname: 'localhost' }, FS_BASE: '/fs/', SITE_BASE: '/',
  VIRTUAL_APP_ZIP: 'userapp.zip', isAoePlayer: true, log() {},
  state: { appZipBlob: new Blob([bytes]), fontOverlayBlob: new Blob([new Uint8Array([7, 8, 9])]) }
});
vm.runInContext(source.slice(start, end) + '\ninstallXhrInterceptor();', context);
function request(url, type, range) {
  return new Promise(resolve => {
    const xhr = new XHR(); xhr.responseType = type;
    xhr.open('GET', url);
    if (range) xhr.setRequestHeader('Range', range);
    xhr.onload = () => resolve(xhr); xhr.send();
  });
}
const binary = await request('/fs/userapp.zip', 'arraybuffer');
assert.equal(binary.status, 200);
assert.equal(Object.hasOwn(binary, 'responseText'), false, 'binary response must not allocate a duplicate byte string');
assert.deepEqual(new Uint8Array(binary.response), bytes);
const ranged = await request('/fs/userapp.zip', 'arraybuffer', 'bytes=32760-32780');
assert.equal(ranged.status, 206);
assert.deepEqual(new Uint8Array(ranged.response), bytes.slice(32760, 32781));
const text = await request('/fs/userapp.zip', '');
assert.equal(text.responseText.length, bytes.length);
assert.equal(text.responseText.charCodeAt(65535), bytes[65535]);
const overlay = await request('/fs/wine1.7.55-v8-min-online.zip', 'arraybuffer');
assert.deepEqual([...new Uint8Array(overlay.response)], [7, 8, 9]);
const ordinary = new XHR(); ordinary.open('GET', '/unrelated'); ordinary.send();
assert.equal(ordinary.network, true, 'ordinary requests retain the browser network path');
console.log('Full-package XHR: binary/text/range/embedded overlay and network passthrough passed.');

// Exercise the real hosted downloader with ordered parts and incomplete HTTP data.
const downloadStart = source.indexOf('async function downloadFullArchive(config)');
const downloadEnd = source.indexOf('\nasync function launchFullGame()', downloadStart);
assert.ok(downloadStart >= 0 && downloadEnd > downloadStart);
const fetched = [];
const progress = {};
const downloader = vm.createContext({
  Blob, URL, Number, Array,
  location: { href: 'https://example.test/aoe/index.html' },
  els: { bootProgress: progress }, setStatus() {}, formatBytes: value => String(value),
  fetch: async url => {
    fetched.push(String(url));
    return new Response(url.pathname.endsWith('one.part') ? new Uint8Array([1, 2]) : new Uint8Array([3]));
  },
});
vm.runInContext(source.slice(downloadStart, downloadEnd) + '\nthis.download = downloadFullArchive;', downloader);
const hosted = await downloader.download({ gameParts: [
  { url: 'assets/one.part', size: 2 }, { url: 'assets/two.part', size: 1 },
] });
assert.deepEqual([...new Uint8Array(await hosted.arrayBuffer())], [1, 2, 3]);
assert.deepEqual(fetched, ['https://example.test/aoe/assets/one.part', 'https://example.test/aoe/assets/two.part']);
assert.equal(progress.max, 100, 'download and runtime use the same percentage scale');
assert.equal(progress.value, 100);
const single = await downloader.download({ game: 'assets/one.part' });
assert.equal(single.size, 2, 'single hosted archive remains supported');
await assert.rejects(downloader.download({ gameParts: [{ url: 'assets/one.part', size: 3 }] }), /chưa đủ/);
await assert.rejects(downloader.download({ gameParts: [{ url: 'assets/one.part', size: 301 * 1024 * 1024 }] }), /300 MB/);
await assert.rejects(downloader.download({ gameParts: [{ url: 'file:///game.zip' }] }), /Địa chỉ/);
downloader.fetch = async () => new Response('missing', { status: 404 });
await assert.rejects(downloader.download({ game: 'assets/missing.part' }), /HTTP 404/);
const launchBody = source.slice(downloadEnd, source.indexOf('// After an exe is staged', downloadEnd));
assert.equal(launchBody.includes('AoEPlayer.begin()'), false, 'download must not start the Wine boot watchdog');
console.log('Hosted download: ordered parts, project paths, size/HTTP errors and boot-watchdog timing passed.');
