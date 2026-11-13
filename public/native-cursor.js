export function createNativeCursor(document = globalThis.document) {
  const images = new WeakMap();
  const canvases = new WeakMap();
  let generation = 0;
  document?.defaultView?.addEventListener?.('resize', () => { generation++; });
  function measure(canvas, state = {}) {
    const rect = canvas.getBoundingClientRect();
    state.width = rect.width || canvas.clientWidth || canvas.width;
    state.height = rect.height || canvas.clientHeight || canvas.height;
    state.generation = generation;
    return state;
  }
  const ResizeObserver = document?.defaultView?.ResizeObserver ?? globalThis.ResizeObserver;
  const observer = ResizeObserver && new ResizeObserver(entries => {
    for (const entry of entries) {
      const state = canvases.get(entry.target);
      if (state) {
        measure(entry.target, state);
      }
    }
  });

  return {
    update(canvas, image, hotX = 0, hotY = 0) {
      let cursor = 'default';
      if (image && image.width > 0 && image.height > 0) {
        let state = canvases.get(canvas);
        if (!state) {
          state = measure(canvas);
          canvases.set(canvas, state);
          observer?.observe(canvas);
        }
        if (state.generation !== generation) measure(canvas, state);
        const scale = Math.min(state.width / canvas.width, state.height / canvas.height,
          128 / image.width, 128 / image.height);
        if (Number.isFinite(scale) && scale > 0) {
          const width = Math.max(1, Math.round(image.width * scale));
          const height = Math.max(1, Math.round(image.height * scale));
          const key = `${width}:${height}`;
          let cache = images.get(image);
          if (!cache) images.set(image, cache = new Map());
          let url = cache.get(key);
          if (url === undefined) {
            try {
              const bitmap = document.createElement('canvas');
              bitmap.width = width;
              bitmap.height = height;
              const context = bitmap.getContext('2d');
              context.imageSmoothingEnabled = false;
              context.drawImage(image, 0, 0, width, height);
              url = bitmap.toDataURL('image/png');
              if (!url.startsWith('data:image/png')) url = null;
            } catch { url = null; }
            cache.set(key, url);
          }
          if (url) {
            const x = Math.max(0, Math.min(width - 1, Math.round(hotX * width / image.width)));
            const y = Math.max(0, Math.min(height - 1, Math.round(hotY * height / image.height)));
            cursor = `url("${url}") ${x} ${y}, default`;
          }
        }
      }
      if (canvas.style.cursor !== cursor) canvas.style.cursor = cursor;
    },
  };
}

export function installNativeCursor() {
  globalThis.__aoeNativeCursor = createNativeCursor();
}
