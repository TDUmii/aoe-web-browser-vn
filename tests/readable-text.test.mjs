import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createReadableText } from '../public/readable-text.js';
import { patchRenderer } from '../renderer-patch.js';

const grey = value => (0xff000000 | value | (value << 8) | (value << 16)) >>> 0;

test('glyph edges retain intermediate coverage and later drawing can cover text', () => {
  const renderer = createReadableText();
  const surface = { w: 5, px: new Uint8Array(5), clip: { x: 0, y: 0, w: 5, h: 1 } };
  renderer.bindPalette(surface, Uint32Array.from([0, 64, 128, 192, 255], grey));
  renderer.drawGlyph(surface, { w: 5, h: 1, mask: Uint8Array.from([0, 64, 128, 192, 255]) }, 0, 0, 4);
  assert.deepEqual([...surface.px], [0, 1, 2, 3, 4]);
  surface.px.fill(3);
  assert.deepEqual([...surface.px], [3, 3, 3, 3, 3]);
  renderer.drawGlyph(surface, { w: 1, h: 1, mask: Uint8Array.of(255) }, 2, 0, 0);
  assert.equal(surface.px[2], 0, 'black shadow is opaque, not transparent');
});

test('glyph drawing keeps clipping and the original binary measurement fallback', () => {
  const renderer = createReadableText();
  const surface = { w: 4, px: new Uint8Array(4), clip: { x: 1, y: 0, w: 2, h: 1 } };
  renderer.drawGlyph(surface, { w: 4, h: 1, mask: Uint8Array.from([255, 127, 128, 255]) }, 0, 0, 4);
  assert.deepEqual([...surface.px], [0, 0, 4, 0]);
});

test('renderer extension rejects source drift and leaves unrelated modules alone', () => {
  const path = '/assets/loadbar-COOfBw5G.js';
  assert.throws(() => patchRenderer(path, 'changed renderer'), /Unsupported text renderer version/);
  assert.equal(patchRenderer('/assets/another.js', 'unchanged'), 'unchanged');
  assert.throws(() => patchRenderer('/assets/game-n1fFuRY1.js', 'changed game'), /Unsupported text renderer version/);
});

test('game cursor uses the native helper while preserving the original fallback', () => {
  const original = 'n&&ie.drawImage(Qn(e,t),O[0]-t.hotX,O[1]-t.hotY),lt(p,n)';
  const patched = patchRenderer('/assets/game-n1fFuRY1.js', original);
  const calls = [];
  const run = new Function('globalThis', 'p', 'n', 'Qn', 'e', 't', 'O', 'ie', 'lt', patched);
  const canvas = {}, image = {}, frame = { hotX: 3, hotY: 4 };
  const helper = { update(...args) { calls.push(args); } };
  const drawImage = (...args) => calls.push(['sprite', ...args]);
  const cursor = (...args) => calls.push(['legacy', ...args]);
  run({ __aoeNativeCursor: helper }, canvas, true, () => image, 0, frame, [10, 20], { drawImage }, cursor);
  assert.deepEqual(calls, [[canvas, image, 3, 4]]);
  calls.length = 0;
  run({ __aoeNativeCursor: helper }, canvas, false, () => image, 0, undefined, null, { drawImage }, cursor);
  assert.deepEqual(calls, [[canvas, null, 0, 0]]);
  calls.length = 0;
  run({}, canvas, true, () => image, 0, frame, [10, 20], { drawImage }, cursor);
  assert.deepEqual(calls, [['sprite', image, 7, 16], ['legacy', canvas, true]]);
});
