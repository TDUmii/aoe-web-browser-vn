// Personal translation overlay. No game code, media, credentials or save data are copied.
// The build replaces this token with our Vietnamese strings.
(() => {
  'use strict';
  const start = () => {
  const locale = __UMI_VI_LOCALE__;
  const stateKey = '__umiAoeVietnamese';
  if (location.origin !== 'https://vivalarts.com') {
    alert('Mở https://vivalarts.com, chọn Age of Empires rồi bấm Đế Chế tiếng Việt.');
    return;
  }
  function notify(message, error = false) {
    let box = document.getElementById('umi-aoe-vietnamese-status');
    if (!box) {
      box = document.createElement('div');
      box.id = 'umi-aoe-vietnamese-status';
      box.setAttribute('role', 'status');
      box.style.cssText = 'position:fixed;top:48px;right:12px;z-index:2147483647;max-width:min(440px,90vw);padding:12px 16px;background:#19170f;color:#fff0cd;border:1px solid #b99853;border-radius:6px;font:15px/1.5 Arial,sans-serif;box-shadow:0 4px 16px #0008;pointer-events:none';
      document.body.append(box);
    }
    box.textContent = message;
    box.style.borderColor = error ? '#ef9a75' : '#b99853';
    clearTimeout(box.hideTimer);
    box.hideTimer = setTimeout(() => box.remove(), error ? 15000 : 6000);
  }
  if (window[stateKey]) {
    notify(window[stateKey].applied ? 'Tiếng Việt đã được bật trong tab game này.' : 'Đang bật tiếng Việt...');
    return;
  }
  const state = window[stateKey] = { version: locale.version, applied: false, phrases: new Map() };
  function translateText(text) {
    if (typeof text !== 'string') return text;
    const direct = state.phrases.get(text);
    if (direct !== undefined) return direct;
    const trimmed = text.trim();
    const translated = state.phrases.get(trimmed);
    return translated === undefined ? text : text.replace(trimmed, translated);
  }
  function moduleCandidates(urls, kind) {
    return [...new Set(urls)].filter(value => {
      try {
        const url = new URL(value, location.href);
        return url.origin === location.origin && !url.search && !url.hash &&
          new RegExp('/assets/' + kind + '-[A-Za-z0-9_-]+\\.js$').test(url.pathname);
      } catch { return false; }
    });
  }
  async function discoverModules() {
    const loaded = performance.getEntriesByType('resource').map(entry => entry.name);
    const main = document.querySelector('script[type="module"][src]');
    if (main && new URL(main.src).origin === location.origin) {
      const response = await fetch(main.src);
      if (!response.ok) throw new Error('Không đọc được bộ chạy game trên website. Hãy tải lại trang rồi thử lại.');
      const source = await response.text();
      for (const match of source.matchAll(/assets\/(?:strings|loadbar)-[A-Za-z0-9_-]+\.js/g)) {
        loaded.push(new URL('/' + match[0], location.origin).href);
      }
    }
    let strings, fonts;
    for (const url of moduleCandidates(loaded, 'strings')) {
      const module = await import(url);
      strings = Object.values(module).find(value => value && typeof value === 'object' &&
        value.language && typeof value.language === 'object' && value.languagex && typeof value.languagex === 'object');
      if (strings) break;
    }
    for (const url of moduleCandidates(loaded, 'loadbar')) {
      const module = await import(url);
      fonts = Object.values(module).find(value => value && typeof value === 'object' &&
        [0, 1, 4, 6, 7, 9, 10, 11].every(key => typeof value[key] === 'string' && /\d+px/.test(value[key])));
      if (fonts) break;
    }
    if (!strings || !fonts) throw new Error('Website đã đổi bộ chạy hoặc AoE chưa mở xong. Chọn Age of Empires rồi bấm lại dấu trang.');
    return { strings, fonts };
  }
  function addPhrase(english, vietnamese) {
    if (typeof english !== 'string' || !english || english === vietnamese) return;
    state.phrases.set(english, vietnamese);
    state.phrases.set(english.toUpperCase(), vietnamese.toUpperCase());
  }
  function patchCanvas() {
    const prototypes = [window.CanvasRenderingContext2D?.prototype, window.OffscreenCanvasRenderingContext2D?.prototype];
    for (const prototype of prototypes.filter(Boolean)) {
      for (const name of ['fillText', 'strokeText', 'measureText']) {
        const original = prototype[name];
        if (typeof original !== 'function') continue;
        prototype[name] = function (...args) {
          if (args.length) args[0] = translateText(args[0]);
          return Reflect.apply(original, this, args);
        };
      }
    }
  }
  function translateNode(root) {
    const visit = node => {
      if (node.nodeType !== 3 || /^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(node.parentElement?.tagName || '')) return;
      const translated = translateText(node.nodeValue);
      if (translated !== node.nodeValue) node.nodeValue = translated;
    };
    visit(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) visit(node);
  }
  state.ready = (async () => {
    notify('Đang bật giao diện tiếng Việt cho Đế Chế...');
    // Selecting the existing public game does not create a multiplayer room or account.
    const gameCard = [...document.querySelectorAll('button')].find(button =>
      /AGE OF EMPIRES\s+1997/.test(button.innerText) && !/EMPIRES II/.test(button.innerText));
    if (gameCard) {
      gameCard.click();
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    const { strings, fonts } = await discoverModules();
    for (const [id, vietnamese] of Object.entries(locale.strings)) {
      for (const dictionary of [strings.language, strings.languagex]) {
        if (Object.hasOwn(dictionary, id)) {
          addPhrase(dictionary[id], vietnamese);
          dictionary[id] = vietnamese;
        }
      }
    }
    const controls = {
      'SWITCH GAME': 'ĐỔI GAME', 'REPORT A BUG': 'BÁO LỖI', 'MORE': 'THÊM',
      'Report a Bug': 'Báo lỗi', 'Cheats': 'Mã lệnh',
      'CHOOSE A GAME': 'CHỌN GAME', 'ALL GAMES': 'TẤT CẢ GAME', 'BACK': 'QUAY LẠI',
      'CLOUD SAVES': 'BẢN LƯU ĐÁM MÂY', 'OPTIONS': 'TÙY CHỌN',
      'Name': 'Tên', 'Civ': 'Dân tộc', 'Player': 'Người chơi', 'Team': 'Đội',
      'Settings': 'Thiết lập', 'You': 'Bạn', 'Computer': 'Máy', 'Menu': 'Menu',
    };
    for (const [english, vietnamese] of Object.entries(controls)) addPhrase(english, vietnamese);
    for (const key of Object.keys(fonts)) {
      fonts[key] = fonts[key].replace(/(\d+px)\s+.+$/, '$1 "Arial", sans-serif');
    }
    patchCanvas();
    translateNode(document.body);
    state.observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'characterData') translateNode(record.target);
        else for (const node of record.addedNodes) translateNode(node);
      }
    });
    state.observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    state.applied = true;
    state.count = Object.keys(locale.strings).length;
    notify('Đã bật tiếng Việt. Chọn Chơi đơn → Bản đồ ngẫu nhiên để vào trận.');
  })().catch(error => {
    state.observer?.disconnect();
    delete window[stateKey];
    notify(error instanceof TypeError
      ? 'Không tải được bản dịch. Kiểm tra mạng rồi bấm lại dấu trang.'
      : error.message, true);
  });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
