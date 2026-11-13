import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { applyCampaignVietnamese } from '../public/campaign-localize.js';

test('campaign localization preserves identity, map, units and victory conditions', async () => {
  const catalog = JSON.parse(await readFile(new URL('../public/campaign-vi.json', import.meta.url), 'utf8'));
  assert.equal(catalog.campaigns.length, 12);
  assert.equal(new Set(catalog.campaigns.map(entry => entry.index)).size, 12);
  const scenarios = new Map(catalog.campaigns.map(entry => [entry.index, {
    name: entry.expectedName, map: { width: 64, height: 64 }, units: [{ id: 1, health: 25 }],
    victory: { type: 'population', count: 7 }, triggers: [{ enabled: true }], description: 'Original',
  }]));
  const gameplay = structuredClone([...scenarios]);
  const count = await applyCampaignVietnamese(async (file, index) => {
    assert.equal(file, 'ASCENT_1.CPN');
    return scenarios.get(index);
  }, catalog);
  assert.equal(count, 48);
  for (const [index, before] of gameplay) {
    const after = scenarios.get(index);
    for (const field of ['name', 'map', 'units', 'victory', 'triggers']) assert.deepEqual(after[field], before[field]);
    assert.match(after.description, /[ăâđêôơư]/i);
  }
  await assert.rejects(() => applyCampaignVietnamese(async () => ({ name: 'different-version.scn' }), { campaigns: [catalog.campaigns[0]] }), /campaign-version-mismatch/);
});
