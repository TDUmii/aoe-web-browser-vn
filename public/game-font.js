export function installGameFont() {
  // Change the family before the engine measures or caches glyphs.
  // Preserve its pixel sizes, weights and native font getter.
  for (const type of [globalThis.CanvasRenderingContext2D, globalThis.OffscreenCanvasRenderingContext2D]) {
    const prototype = type?.prototype;
    if (!prototype) continue;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'font');
    if (!descriptor?.get || !descriptor?.set || !descriptor.configurable) continue;
    Object.defineProperty(prototype, 'font', {
      ...descriptor,
      set(value) {
        const font = typeof value === 'string'
          ? value.replace(/^(.*?\b\d+(?:\.\d+)?px)\s+.+$/, '$1 Tahoma, "Segoe UI", Arial, sans-serif')
          : value;
        descriptor.set.call(this, font);
      },
    });
  }
}
