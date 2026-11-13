import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createNativeCursor } from '../public/native-cursor.js';

function fixture(fail = false) {
  const bitmaps = [];
  let resized, windowResize, reads = 0, displayWidth = 1600, displayHeight = 1200;
  const document = {
    defaultView: { addEventListener(type, callback) { if (type === 'resize') windowResize = callback; }, ResizeObserver: class {
      constructor(callback) { resized = callback; }
      observe() {}
    } },
    createElement() {
      const bitmap = { getContext: () => ({ drawImage() {} }),
        toDataURL() { if (fail) throw Error('encoding'); return 'data:image/png;base64,test'; } };
      bitmaps.push(bitmap);
      return bitmap;
    },
  };
  let writes = 0, cursor;
  const canvas = { width: 800, height: 600, clientWidth: 1600, clientHeight: 1200,
    style: { get cursor() { return cursor; }, set cursor(value) { cursor = value; writes++; } },
    getBoundingClientRect() { reads++; return { width: displayWidth, height: displayHeight }; } };
  return { helper: createNativeCursor(document), canvas, bitmaps,
    writes: () => writes,
    reads: () => reads,
    resize(width, height) { displayWidth = width; displayHeight = height;
      resized([{ target: canvas, contentRect: { width, height } }]); },
    transform(width, height) { displayWidth = width; displayHeight = height; windowResize(); } };
}

test('native artwork and hotspots scale, cache encoding and avoid style churn', () => {
  const f = fixture(), image = { width: 32, height: 16 };
  f.helper.update(f.canvas, image, 7, 5);
  assert.equal(f.canvas.style.cursor, 'url("data:image/png;base64,test") 14 10, default');
  assert.deepEqual([f.bitmaps[0].width, f.bitmaps[0].height], [64, 32]);
  f.helper.update(f.canvas, image, 7, 5);
  assert.equal(f.bitmaps.length, 1);
  assert.equal(f.writes(), 1);
  assert.equal(f.reads(), 1, 'repeated frames do not read layout');
  f.resize(800, 600);
  f.helper.update(f.canvas, image, 7, 5);
  assert.equal(f.bitmaps.length, 2);
  assert.match(f.canvas.style.cursor, / 7 5, default$/);
  f.resize(1600, 1200);
  f.helper.update(f.canvas, image, 7, 5);
  assert.equal(f.bitmaps.length, 2);
});

test('CSS transforms use visual bounds and window resize refreshes once next update', () => {
  const f = fixture(), image = { width: 32, height: 16 };
  f.canvas.clientWidth = 800;
  f.canvas.clientHeight = 600;
  f.transform(1200, 900);
  f.helper.update(f.canvas, image, 8, 4);
  assert.deepEqual([f.bitmaps[0].width, f.bitmaps[0].height], [48, 24]);
  assert.match(f.canvas.style.cursor, / 12 6, default$/);
  assert.equal(f.reads(), 1);
  f.transform(800, 600);
  assert.equal(f.reads(), 1, 'resize listener defers measurement until update');
  f.helper.update(f.canvas, image, 8, 4);
  f.helper.update(f.canvas, image, 8, 4);
  assert.equal(f.reads(), 2);
  assert.deepEqual([f.bitmaps[1].width, f.bitmaps[1].height], [32, 16]);
});

test('oversized artwork keeps aspect ratio within 128 and clamps hotspots', () => {
  const f = fixture();
  f.helper.update(f.canvas, { width: 256, height: 64 }, 500, -1);
  assert.deepEqual([f.bitmaps[0].width, f.bitmaps[0].height], [128, 32]);
  assert.match(f.canvas.style.cursor, / 127 0, default$/);
});

test('missing artwork and encoding failures restore default and cache failures', () => {
  const f = fixture(true), image = { width: 32, height: 32 };
  f.helper.update(f.canvas, image);
  f.helper.update(f.canvas, image);
  assert.equal(f.canvas.style.cursor, 'default');
  assert.equal(f.bitmaps.length, 1);
  f.canvas.style.cursor = 'none';
  f.helper.update(f.canvas, null);
  assert.equal(f.canvas.style.cursor, 'default');
});
