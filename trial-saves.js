/* Local save-file transfer for the bundled 1997 trial. No automatic persistence. */
(function (host) {
  'use strict';
  const LIMIT = 32 * 1024 * 1024, MAX_FILES = 256;
  function allowed(path) {
    return /^appdir\/userapp\/(?:savegame\/[^\/\\:]+\.gam|(?:savegame\/)?game\d+\.nfo)$/i.test(path)
      && !path.split('/').some(p => p === '.' || p === '..') && !/[\x00-\x1f]/.test(path);
  }
  function mounted() {
    const fs = host.BrowserFS && host.BrowserFS.BFSRequire('fs');
    const mount = (host.__BoxedwineConfig?.appDirPrefix || '').replace(/\/$/, '');
    const overlay = fs?.getRootFS()?.mntMap?.[mount];
    if (!mount || !overlay?.getOverlayedFileSystems) throw new Error('Hãy chờ game mở xong rồi thử lại.');
    return { fs, mount, writable: overlay.getOverlayedFileSystems().writable };
  }
  function collect(layer, path = '/') {
    const files = [];
    for (const name of layer.readdirSync(path)) {
      const full = path.replace(/\/$/, '') + '/' + name;
      if (layer.statSync(full).isDirectory()) files.push(...collect(layer, full));
      else if (allowed('appdir' + full)) files.push(full);
    }
    return files;
  }
  function makeArchive() {
    const { fs, mount, writable } = mounted();
    const paths = collect(writable), zip = new host.JSZip();
    let total = 0;
    if (!paths.length) throw new Error('Chưa có bản lưu. Hãy lưu trận trong game trước.');
    if (paths.length > MAX_FILES) throw new Error('Có quá nhiều tệp bản lưu.');
    for (const path of paths) {
      const bytes = fs.readFileSync(mount + path);
      total += bytes.length;
      if (total > LIMIT) throw new Error('Bản lưu vượt giới hạn 32 MB.');
      zip.file('appdir' + path, new Uint8Array(bytes));
    }
    return { bytes: zip.generate({ type: 'uint8array', compression: 'DEFLATE' }), count: paths.length };
  }
  function validateArchive(bytes) {
    if (bytes.byteLength > LIMIT) throw new Error('Tệp ZIP vượt giới hạn 32 MB.');
    const zip = new host.JSZip(bytes), staged = [];
    let total = 0;
    for (const [path, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue;
      if (!allowed(path)) throw new Error('ZIP chứa tệp không phải bản lưu AoE Trial.');
      if (staged.length >= MAX_FILES) throw new Error('ZIP có quá nhiều tệp.');
      const declared = entry._data?.uncompressedSize;
      if (!Number.isFinite(declared) || declared < 0 || total + declared > LIMIT) throw new Error('Dữ liệu giải nén vượt giới hạn 32 MB.');
      const data = entry.asUint8Array();
      total += data.length;
      if (total > LIMIT || data.length !== declared) throw new Error('Dữ liệu bản lưu không hợp lệ.');
      if (staged.some(f => f.path.toLowerCase() === path.toLowerCase())) throw new Error('ZIP chứa tên tệp trùng nhau.');
      staged.push({ path, data });
    }
    if (!staged.length) throw new Error('ZIP không chứa bản lưu AoE Trial.');
    return staged;
  }
  const api = {
    allowed, makeArchive, validateArchive,
    async export() {
      const { bytes, count } = makeArchive();
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/zip' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'aoe-trial-saves.zip'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return count;
    },
    async import(file) {
      if (!file || file.size > LIMIT) throw new Error('Hãy chọn tệp ZIP bản lưu, tối đa 32 MB.');
      const staged = validateArchive(new Uint8Array(await file.arrayBuffer()));
      const { fs, mount } = mounted();
      const Buffer = host.BrowserFS.BFSRequire('buffer').Buffer;
      // Validate every entry before touching the live filesystem; overwrite save files only.
      for (const { path, data } of staged) {
        const parts = path.slice('appdir/'.length).split('/');
        let target = mount;
        for (let i = 0; i < parts.length; i++) {
          // Wine resolves DOS paths without case; BrowserFS itself does not.
          const existing = fs.readdirSync(target).find(name => name.toLowerCase() === parts[i].toLowerCase());
          target += '/' + (existing || parts[i]);
          if (i < parts.length - 1 && !fs.existsSync(target)) fs.mkdirSync(target);
        }
        fs.writeFileSync(target, new Buffer(data));
      }
      return staged.length;
    }
  };
  host.AoETrialSaves = api;
  if (typeof document === 'undefined') return;
  const message = document.getElementById('saveMessage');
  async function run(action, success) {
    try { const count = await action(); if (message) message.textContent = success(count); }
    catch (error) { if (message) message.textContent = error.message; }
  }
  document.getElementById('exportSaves')?.addEventListener('click', () => run(() => api.export(), n => `Đã xuất ${n} tệp bản lưu. Giữ tệp ZIP để nhập ở lần chơi sau.`));
  const input = document.getElementById('saveImport');
  document.getElementById('importSaves')?.addEventListener('click', () => input?.click());
  input?.addEventListener('change', () => {
    const file = input.files[0]; input.value = '';
    if (file) run(() => api.import(file), n => `Đã nhập ${n} tệp. Mở Tải ván chơi trong game để tiếp tục; tệp trùng tên đã được thay thế.`);
  });
})(typeof window === 'undefined' ? globalThis : window);
