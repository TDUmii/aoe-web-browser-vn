import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({ console, Uint8Array, ArrayBuffer, setTimeout, clearTimeout });
context.window = context;
context.navigator = { userAgent: 'node-test' };
context.setImmediate = setImmediate;
vm.runInContext(readFileSync(new URL('../runtime/browserfs.boxedwine.js', import.meta.url), 'utf8'), context);
const realBrowserFS = context.BrowserFS;
const Buffer = realBrowserFS.BFSRequire('buffer').Buffer;
vm.runInContext(readFileSync(new URL('../runtime/jszip.min.js', import.meta.url), 'utf8'), context);
vm.runInContext(readFileSync(new URL('../trial-saves.js', import.meta.url), 'utf8'), context);
const api = context.AoETrialSaves;
const payload = new Uint8Array([1, 2, 3, 4]);
const files = new Map([['/home/app/userapp/savegame/test.gam', payload]]);
const dirs = new Set(['/home', '/home/app', '/home/app/userapp', '/home/app/userapp/savegame']);
const fs = {
  getRootFS: () => ({ mntMap: { '/home/app': { getOverlayedFileSystems: () => ({ writable: {
    readdirSync(path) { return path === '/' ? ['userapp'] : path === '/userapp' ? ['savegame'] : ['test.gam']; },
    statSync(path) { return { isDirectory: () => !path.endsWith('.gam') }; }
  } }) } } }),
  readFileSync: path => files.get(path),
  readdirSync: path => [...new Set([...dirs, ...files.keys()].filter(p => p.startsWith(path + '/') && !p.slice(path.length + 1).includes('/')).map(p => p.slice(path.length + 1)))],
  existsSync: path => dirs.has(path),
  mkdirSync: path => dirs.add(path),
  writeFileSync: (path, bytes) => {
    assert.equal(typeof bytes.copy, 'function', 'BrowserFS requires its Buffer, not a plain Uint8Array');
    files.set(path, bytes);
  }
};
context.BrowserFS = { BFSRequire: name => name === 'buffer' ? { Buffer } : fs };
context.__BoxedwineConfig = { appDirPrefix: '/home/app/' };
const archive = api.makeArchive();
assert.equal(archive.count, 1);
files.clear();
assert.equal(await api.import({ size: archive.bytes.length, arrayBuffer: async () => archive.bytes.buffer }), 1);
assert.deepEqual([...files.get('/home/app/userapp/savegame/test.gam')], [...payload]);
dirs.delete('/home/app/userapp/savegame');
dirs.add('/home/app/userapp/SAVEGAME');
files.clear();
files.set('/home/app/userapp/SAVEGAME/TEST.GAM', new Uint8Array([9]));
await api.import({ size: archive.bytes.length, arrayBuffer: async () => archive.bytes.buffer });
assert.equal(files.size, 1, 'case-insensitive import overwrites the existing save');
assert.deepEqual([...files.get('/home/app/userapp/SAVEGAME/TEST.GAM')], [...payload]);
assert.equal(dirs.has('/home/app/userapp/savegame'), false, 'import must not create a second save directory');
for (const path of ['system/windows/file.gam', 'appdir/userapp/empires.exe', 'appdir/userapp/savegame/../bad.gam', 'appdir/userapp/savegame/a\\b.gam']) {
  const zip = new context.JSZip();
  zip.file('appdir/userapp/savegame/good.gam', payload);
  zip.file(path, payload);
  const bytes = zip.generate({ type: 'uint8array' });
  const before = files.size;
  await assert.rejects(api.import({ size: bytes.length, arrayBuffer: async () => bytes.buffer }));
  assert.equal(files.size, before, 'invalid archive must not write any entries');
}
assert.throws(() => api.validateArchive(new Uint8Array(32 * 1024 * 1024 + 1)));
const oversized = new context.JSZip();
oversized.file('appdir/userapp/savegame/large.gam', new Uint8Array(32 * 1024 * 1024 + 1));
assert.throws(() => api.validateArchive(oversized.generate({ type: 'uint8array', compression: 'DEFLATE' })), /32 MB/);
// Exercise the shipped BrowserFS filesystem and Buffer implementation as well.
context.BrowserFS = realBrowserFS;
const memory = new realBrowserFS.FileSystem.InMemory();
memory.getOverlayedFileSystems = () => ({ writable: memory });
const mounts = new realBrowserFS.FileSystem.MountableFileSystem();
mounts.mount('/home/app', memory);
realBrowserFS.initialize(mounts);
const realFs = realBrowserFS.BFSRequire('fs');
realFs.mkdirSync('/home/app/userapp');
realFs.mkdirSync('/home/app/userapp/SAVEGAME');
await api.import({ size: archive.bytes.length, arrayBuffer: async () => archive.bytes.buffer });
assert.deepEqual([...realFs.readFileSync('/home/app/userapp/SAVEGAME/test.gam')], [...payload]);
assert.equal(api.makeArchive().count, 1);
// Live Rise of Rome saves use .gmx; preserve legacy .gam alongside them.
const ror = new context.JSZip();
ror.file('appdir/userapp/savegame/rome.gmx', new Uint8Array([5, 6, 7]));
const rorBytes = ror.generate({ type: 'uint8array' });
await api.import({ size: rorBytes.length, arrayBuffer: async () => rorBytes.buffer });
assert.deepEqual([...realFs.readFileSync('/home/app/userapp/SAVEGAME/rome.gmx')], [5, 6, 7]);
const both = api.validateArchive(api.makeArchive().bytes);
assert.equal(both.length, 2, 'export preserves both legacy .gam and expansion .gmx saves');
assert.deepEqual([...both.find(f => /rome\.gmx$/i.test(f.path)).data], [5, 6, 7]);
console.log('AoE saves: real BrowserFS/JSZip .gam/.gmx roundtrip and ZIP validation passed.');
