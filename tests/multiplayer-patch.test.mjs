import assert from 'node:assert/strict';
import { test } from 'node:test';
import { patchMultiplayer } from '../multiplayer/patch.mjs';

const modelPath = '/assets/model-BbESgICJ.js';
const connections = 'i=[{id:`rooms`,text:`Internet - Viva La RTS rooms`},{id:`quick`,text:`Quick Match - one against one`}]';

test('native multiplayer menu offers the supported room flow', () => {
  const source = `before;${connections};after`;
  assert.equal(patchMultiplayer(modelPath, source), 'before;i=[{id:`rooms`,text:`Internet - Tạo hoặc tham gia phòng`}];after');
  assert.equal(patchMultiplayer('/assets/other.js', source), source);
});

test('unexpected upstream multiplayer versions fail closed', () => {
  assert.throws(() => patchMultiplayer(modelPath, 'changed'), /Unsupported multiplayer menu version/);
  assert.throws(() => patchMultiplayer(modelPath, connections + connections), /Unsupported multiplayer menu version/);
});
