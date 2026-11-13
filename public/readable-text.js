export function createReadableText() {
  const surfacePalettes = new WeakMap();
  const blends = new WeakMap();

  function blendedIndex(palette, foreground, background, coverage) {
    let cache = blends.get(palette);
    if (!cache) blends.set(palette, cache = new Map());
    const key = (foreground << 11) | (background << 3) | coverage;
    if (cache.has(key)) return cache.get(key);
    const fg = palette[foreground], bg = palette[background];
    const alpha = coverage / 8;
    const red = (fg & 255) * alpha + (bg & 255) * (1 - alpha);
    const green = ((fg >>> 8) & 255) * alpha + ((bg >>> 8) & 255) * (1 - alpha);
    const blue = ((fg >>> 16) & 255) * alpha + ((bg >>> 16) & 255) * (1 - alpha);
    let nearest = background, distance = Infinity;
    for (let index = 0; index < palette.length; index++) {
      const colour = palette[index];
      const error = ((colour & 255) - red) ** 2 + (((colour >>> 8) & 255) - green) ** 2 + (((colour >>> 16) & 255) - blue) ** 2;
      if (error < distance) { distance = error; nearest = index; }
    }
    cache.set(key, nearest);
    return nearest;
  }

  return {
    bindPalette(surface, palette) { surfacePalettes.set(surface, palette); },
    drawGlyph(surface, glyph, x, y, foreground) {
      const palette = surfacePalettes.get(surface);
      const clip = surface.clip;
      for (let row = 0; row < glyph.h; row++) {
        const targetY = y + row;
        if (targetY < clip.y || targetY >= clip.y + clip.h) continue;
        for (let column = 0; column < glyph.w; column++) {
          const targetX = x + column;
          if (targetX < clip.x || targetX >= clip.x + clip.w) continue;
          const alpha = glyph.mask[row * glyph.w + column];
          if (!alpha) continue;
          const offset = targetY * surface.w + targetX;
          if (!palette) {
            // Preserve binary drawing for measurement surfaces and first frames.
            if (alpha >= 128) surface.px[offset] = foreground;
            continue;
          }
          const coverage = Math.round(alpha * 8 / 255);
          if (coverage === 8) surface.px[offset] = foreground;
          else if (coverage > 0) surface.px[offset] = blendedIndex(palette, foreground, surface.px[offset], coverage);
        }
      }
    },
  };
}

export function installReadableText() {
  globalThis.__aoeReadableText = createReadableText();
}
