import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const source = read('scripts/vivalarts-translator.js');
const locale = JSON.parse(read('assets/vivalarts-vi.json'));
assert.equal(locale.version, 1);
assert.ok(Object.keys(locale.strings).length >= 900, 'retain the reviewed menu/gameplay coverage');
for (const [id, text] of Object.entries(locale.strings)) {
  assert.match(id, /^\d+$/);
  assert.equal(typeof text, 'string');
  assert.ok(text.trim(), `translation ${id} must not be blank`);
  assert.doesNotMatch(text, /\uFFFD|__UMI_VI_LOCALE__/);
  assert.doesNotMatch(text.replace(/%%|%[sd]/g, ''), /%/, `unsupported formatting token in ${id}`);
}
// Formatting contracts only, without storing the site's original English text.
for (const [id, tokens] of Object.entries({
  3009: ['%s', '%d'], 9418: ['%s'], 9652: ['%d'],
  9661: ['%s', '%d', '%%'], 9662: ['%s', '%d'], 9819: ['%d', '%%'],
})) assert.deepEqual(locale.strings[id].match(/%%|%[sd]/g), tokens, `formatting contract ${id}`);

const artifact = read('assets/vivalarts-vi.user.js');
assert.doesNotMatch(artifact, /__UMI_VI_LOCALE__/);
const marker = '  const locale = ';
const embeddedStart = artifact.indexOf(marker) + marker.length;
assert.ok(embeddedStart >= marker.length);
const embedded = JSON.parse(artifact.slice(embeddedStart, artifact.indexOf(';\n', embeddedStart)));
assert.deepEqual(embedded, locale, 'published artifact must contain the current version and every translated string');
assert.ok(artifact.endsWith(source.replace('__UMI_VI_LOCALE__', JSON.stringify(locale))), 'artifact must use current overlay implementation');

function extract(name, next) {
  const start = source.indexOf('  function ' + name + '(');
  const end = source.indexOf(next, start);
  assert.ok(start >= 0 && end > start, `find actual ${name} implementation`);
  return source.slice(start, end);
}
const calls = [];
class Canvas {
  fillText(...args) { calls.push({ name: 'fillText', receiver: this, args }); return 'filled'; }
  strokeText(...args) { calls.push({ name: 'strokeText', receiver: this, args }); return 'stroked'; }
  measureText(...args) { calls.push({ name: 'measureText', receiver: this, args }); return { width: args[0].length }; }
}
class Offscreen extends Canvas {}
// Give each real platform its own prototype methods, as browsers do.
for (const name of ['fillText', 'strokeText', 'measureText']) Offscreen.prototype[name] = Canvas.prototype[name];
const context = vm.createContext({
  state: { phrases: new Map([['Play', 'Chơi'], ['PLAY', 'CHƠI']]) }, URL,
  location: { origin: 'https://vivalarts.com', href: 'https://vivalarts.com/' },
  window: { CanvasRenderingContext2D: Canvas, OffscreenCanvasRenderingContext2D: Offscreen },
});
vm.runInContext(extract('translateText', '  function moduleCandidates') +
  extract('moduleCandidates', '  async function discoverModules') +
  extract('patchCanvas', '  function translateNode') +
  '\nthis.api = { translateText, moduleCandidates, patchCanvas };', context);
const { translateText, moduleCandidates, patchCanvas } = context.api;
assert.equal(translateText('Play'), 'Chơi');
assert.equal(translateText(' \tPlay\n'), ' \tChơi\n');
assert.equal(translateText('Player'), 'Player', 'never translate partial matches');
assert.equal(translateText(''), '');
assert.equal(translateText('   '), '   ');
for (const value of [null, undefined, 42, {}, false]) assert.equal(translateText(value), value);
const canonical = 'https://vivalarts.com/assets/strings-Ab_9.js';
assert.deepEqual([...moduleCandidates([
  canonical, canonical, '/assets/strings-Other.js',
  canonical + '?v=1', canonical + '#hash',
  'https://foreign.test/assets/strings-Ab_9.js',
  'https://vivalarts.com.evil.test/assets/strings-Ab_9.js',
  '/assets/loadbar-Ab.js', '/assets/strings-Ab.json', 'http://[invalid',
], 'strings')], [canonical, '/assets/strings-Other.js']);
patchCanvas();
for (const canvas of [new Canvas(), new Offscreen()]) {
  assert.equal(canvas.fillText('Play', 12, 34, 56), 'filled');
  assert.equal(canvas.strokeText('PLAY', 4, 5), 'stroked');
  assert.equal(canvas.measureText('Play').width, 'Chơi'.length);
  const recent = calls.slice(-3);
  assert.ok(recent.every(call => call.receiver === canvas));
  assert.deepEqual(recent.map(call => call.args), [['Chơi', 12, 34, 56], ['CHƠI', 4, 5], ['Chơi']]);
}
console.log(`Viva La RTS Vietnamese: ${Object.keys(locale.strings).length} IDs, formatting, artifact parity, module filtering and canvas forwarding passed.`);
