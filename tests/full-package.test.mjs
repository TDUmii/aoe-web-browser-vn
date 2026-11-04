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
