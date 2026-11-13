export function translateText(text, phrases) {
  if (typeof text !== 'string') return text;
  const value = text.trim();
  const lookup = key => Object.hasOwn(phrases, key) && typeof phrases[key] === 'string' ? phrases[key] : undefined;
  let translated = lookup(value);
  if (!translated && /^Player \d+$/.test(value)) translated = value.replace('Player ', 'Người chơi ');
  if (!translated && value.startsWith('Edge Scroll: ')) {
    const state = value.slice(13);
    translated = `Cuộn mép: ${lookup(state) ?? state}`;
  }
  if (!translated && value.startsWith('· Game time ')) translated = value.replace('Game time ', 'Thời gian trận ');
  const farm = 'Queue a farm to reseed (right click: take one back)';
  if (!translated && value.startsWith(farm)) translated = (lookup(farm) ?? farm) + value.slice(farm.length);
  return translated ? text.replace(value, translated) : text;
}

export function installDisplayTranslations(phrases) {
  // Translate display strings only. Never rewrite commands, data keys or game logic.
  for (const method of ['fillText', 'strokeText', 'measureText']) {
    const original = CanvasRenderingContext2D.prototype[method];
    CanvasRenderingContext2D.prototype[method] = function (text, ...args) {
      return original.call(this, translateText(text, phrases), ...args);
    };
  }
  const attributes = ['title', 'aria-label', 'placeholder'];
  function translateNode(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      if (!root.parentElement?.closest('script,style,textarea,input,[contenteditable]')) {
        const translated = translateText(root.nodeValue, phrases);
        if (translated !== root.nodeValue) root.nodeValue = translated;
      }
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    for (const attribute of attributes) {
      if (!root.hasAttribute(attribute)) continue;
      const original = root.getAttribute(attribute);
      const translated = translateText(original, phrases);
      if (translated !== original) root.setAttribute(attribute, translated);
    }
    for (const child of root.childNodes) translateNode(child);
  }
  translateNode(document.body);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'childList') for (const node of record.addedNodes) translateNode(node);
      else translateNode(record.target);
    }
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes });
}
