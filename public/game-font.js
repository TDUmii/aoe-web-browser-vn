export function installGameFont() {
  // Change the family before the engine measures or caches glyphs.
  // Keep layout roles, slightly enlarge small text and reduce heavy weight.
  for (const type of [globalThis.CanvasRenderingContext2D, globalThis.OffscreenCanvasRenderingContext2D]) {
    const prototype = type?.prototype;
    if (!prototype) continue;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'font');
    if (!descriptor?.get || !descriptor?.set || !descriptor.configurable) continue;
    Object.defineProperty(prototype, 'font', {
      ...descriptor,
      set(value) {
        const font = typeof value === 'string'
          ? value.replace(/^(.*?\b)(\d+(?:\.\d+)?)px\s+.+$/, (_, prefix, size) => {
            const pixels = Number(size);
            const weight = prefix.replace(/\bbold\b/, '600');
            return `${weight}${pixels < 14 ? pixels + 1 : pixels}px "Segoe UI", Tahoma, Arial, sans-serif`;
          })
          : value;
        descriptor.set.call(this, font);
      },
    });
  }
}
