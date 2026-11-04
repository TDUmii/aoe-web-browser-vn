import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../player.js', import.meta.url), 'utf8');
function player() {
  const elements = new Map(), timers = new Map();
  let now = 1000, nextTimer = 1, reloads = 0, confirms = 0, confirmResult = false;
  function element(id) {
    if (!elements.has(id)) {
      const classes = new Set(), events = new Map();
      elements.set(id, {
        disabled: true, textContent: '', hidden: false,
        classList: { add: key => classes.add(key), remove: key => classes.delete(key), contains: key => classes.has(key) },
        addEventListener: (name, handler) => events.set(name, handler),
        dispatchEvent: event => events.get(event.type)?.(event), focus() {},
        showModal() {}, getContext(type, attributes) { return { type, attributes }; }
      });
    }
    return elements.get(id);
  }
  const windowEvents = new Map();
  const context = vm.createContext({
    document: { getElementById: element, body: element('body'), addEventListener() {} },
    location: { search: '', reload: () => reloads++ },
    URLSearchParams, Uint8Array, CustomEvent: class { constructor(type) { this.type = type; } },
    performance: { now: () => now },
    setTimeout: (callback, delay) => { const id = nextTimer++; timers.set(id, { callback, delay }); return id; },
    clearTimeout: id => timers.delete(id),
    setInterval: () => 1, clearInterval() {},
    addEventListener: (name, handler) => windowEvents.set(name, handler),
    confirm: () => { confirms++; return confirmResult; },
    Module: { ctx: {
      drawingBufferWidth: 800, drawingBufferHeight: 600, isContextLost: () => false,
      readPixels(x, y, w, h, format, type, pixel) { pixel.set(context.visible ? [90, 80, 70, 255] : [0, 0, 0, 255]); }
    } }
  });
  context.window = context;
  vm.runInContext(source, context);
  return {
    context, element, timers,
    frame(visible) { context.visible = visible; now += 1000; context.AoEPlayer.onFrame(); },
    get reloads() { return reloads; }, get confirms() { return confirms; },
    acceptReload() { confirmResult = true; }
  };
}
const choosing = player();
assert.equal(choosing.element('canvas').getContext('webgl').attributes.preserveDrawingBuffer, true, 'paused dialogs retain a readable frame');
assert.equal(choosing.timers.size, 0, 'file selection has no boot timeout');
choosing.context.AoEPlayer.begin();
assert.equal(choosing.timers.size, 1, 'loading a full package starts the boot watchdog');
choosing.context.AoEPlayer.idle();
assert.equal(choosing.timers.size, 0, 'returning to the file picker cancels boot timeout');
const p = player();
p.context.AoEPlayer.onStatus('Running...');
p.frame(false);
assert.equal(p.element('overlay').classList.contains('is-hidden'), false, 'black frame stays covered');
p.frame(true);
assert.equal(p.element('overlay').classList.contains('is-hidden'), true, 'visible game frame removes cover');
assert.equal(p.element('exportSaves').disabled, false);
assert.equal(p.timers.size, 0, 'first image cancels startup watchdog');
p.element('recovery').dispatchEvent({ type: 'click' });
assert.equal(p.confirms, 1);
assert.equal(p.reloads, 0, 'reload preserves live session when confirmation declined');
p.acceptReload(); p.element('recovery').dispatchEvent({ type: 'click' });
assert.equal(p.reloads, 1);
let prevented = false;
p.element('canvas').dispatchEvent({ type: 'webglcontextlost', preventDefault() { prevented = true; } });
assert.equal(prevented, true);
assert.equal(p.element('overlay').classList.contains('is-hidden'), false, 'context loss reveals recovery cover after readiness');
assert.match(p.element('welcomeMessage').textContent, /bộ xử lý đồ họa/);
const stalled = player();
stalled.context.AoEPlayer.onStatus('Running...');
const watchdog = [...stalled.timers.values()].find(timer => timer.delay === 120000);
assert.ok(watchdog, 'startup timeout remains armed after Running');
watchdog.callback();
stalled.frame(true);
assert.equal(stalled.element('overlay').classList.contains('is-hidden'), false);
assert.match(stalled.element('welcomeMessage').textContent, /chưa hiển thị/);
const aborted = player();
aborted.context.AoEPlayer.fail('Bộ giả lập đã dừng do lỗi.');
aborted.context.AoEPlayer.onStatus('Running...'); aborted.frame(true);
assert.equal(aborted.element('overlay').classList.contains('is-hidden'), false);
console.log('Player: black/visible frames, stalled startup, loss/abort recovery and reload protection passed.');
