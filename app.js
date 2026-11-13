const game = document.querySelector('#game');
const player = document.querySelector('#player');
const statusText = document.querySelector('#status-text');
const help = document.querySelector('#help');
const reloadDialog = document.querySelector('#reload-dialog');
let pageStatus = 'Đang mở Viva La RTS...';
let loadTimer;
const projectRoot = new URL('./', document.currentScript.src);

function renderStatus() {
  statusText.textContent = navigator.onLine ? pageStatus : 'Bạn đang ngoại tuyến. Kiểm tra kết nối mạng; trận game sẽ không tự tải lại.';
  document.querySelector('#status').classList.toggle('notice', !navigator.onLine || pageStatus.includes('lâu'));
}

function startLoadTimer() {
  clearTimeout(loadTimer);
  pageStatus = 'Đang mở Viva La RTS...';
  renderStatus();
  loadTimer = setTimeout(() => {
    pageStatus = 'Game đang mở lâu hơn dự kiến. Bạn có thể thử Mở tab riêng.';
    renderStatus();
  }, 25000);
}

game.addEventListener('load', () => {
  if (!game.hasAttribute('src')) return;
  clearTimeout(loadTimer);
  pageStatus = 'Chọn Age of Empires để bắt đầu. Nếu khung trống, thử Mở tab riêng.';
  renderStatus();
});
window.addEventListener('offline', renderStatus);
window.addEventListener('online', renderStatus);

async function openGame() {
  // Earlier emulator workers added isolation headers that can block this iframe.
  // Match this project's two exact script URLs; leave other sites and saves alone.
  const obsoleteWorkers = new Set([
    new URL('coi-serviceworker.js', projectRoot).href,
    new URL('64/coi-serviceworker.js', projectRoot).href,
  ]);
  try {
    if ('serviceWorker' in navigator) {
      const controlledByOldWorker = obsoleteWorkers.has(navigator.serviceWorker.controller?.scriptURL);
      let removed = false;
      for (const registration of await navigator.serviceWorker.getRegistrations()) {
        if ([registration.active, registration.waiting, registration.installing].some(worker => obsoleteWorkers.has(worker?.scriptURL))) {
          removed = (await registration.unregister()) || removed;
        }
      }
      if (controlledByOldWorker && removed) {
        pageStatus = 'Đang chuyển từ trình chơi cũ sang bản mới...';
        renderStatus();
        location.reload();
        return;
      }
    }
  } catch {
    // Storage-restricted browsers can still try the game or open its own tab.
  }
  startLoadTimer();
  game.src = game.dataset.src;
}
openGame();

document.querySelector('#help-open').addEventListener('click', () => help.showModal());
document.querySelector('#quick-help').addEventListener('click', () => help.showModal());
document.querySelector('#help-close').addEventListener('click', () => help.close());
document.querySelector('#reload').addEventListener('click', () => {
  reloadDialog.returnValue = 'cancel';
  reloadDialog.showModal();
});
reloadDialog.addEventListener('close', () => {
  if (reloadDialog.returnValue !== 'reload') return;
  startLoadTimer();
  game.src = 'https://vivalarts.com/';
});

const fullscreenButton = document.querySelector('#fullscreen');
fullscreenButton.addEventListener('click', async () => {
  if (!document.fullscreenEnabled || !player.requestFullscreen) {
    pageStatus = 'Trình duyệt này chưa hỗ trợ toàn màn hình. Bạn có thể thử Mở tab riêng.';
    renderStatus();
    return;
  }
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await player.requestFullscreen();
  } catch {
    pageStatus = 'Chưa mở được toàn màn hình. Hãy thử lại hoặc dùng Mở tab riêng.';
    renderStatus();
  }
});
document.addEventListener('fullscreenchange', () => {
  const active = document.fullscreenElement === player;
  document.querySelector('#fullscreen-label').textContent = active ? 'Thoát toàn màn hình' : 'Toàn màn hình';
  fullscreenButton.setAttribute('aria-pressed', String(active));
});

const terms = [
  ['Single Player', 'Chơi một người'], ['Multiplayer', 'Chơi nhiều người'],
  ['Campaign', 'Chiến dịch'], ['Scenario', 'Kịch bản'], ['Random Map', 'Bản đồ ngẫu nhiên'],
  ['Civilization', 'Nền văn minh'], ['Difficulty', 'Độ khó'], ['Population', 'Dân số'],
  ['Villager', 'Dân làng'], ['Town Center', 'Nhà chính'], ['House', 'Nhà dân'],
  ['Barracks', 'Nhà lính'], ['Food', 'Thực phẩm'], ['Wood', 'Gỗ'], ['Gold', 'Vàng'],
  ['Stone', 'Đá'], ['Research', 'Nghiên cứu'], ['Diplomacy', 'Ngoại giao'],
  ['Save Game', 'Lưu trận'], ['Load Game', 'Mở trận đã lưu'],
];
const normalize = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
const termList = document.querySelector('#terms');
const search = document.querySelector('#term-search');
function renderTerms() {
  const query = normalize(search.value.trim());
  const matches = terms.filter(pair => normalize(pair.join(' ')).includes(query));
  termList.replaceChildren(...matches.map(([english, vietnamese]) => {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const definition = document.createElement('dd');
    term.textContent = english;
    definition.textContent = vietnamese;
    row.append(term, definition);
    return row;
  }));
  document.querySelector('#no-terms').hidden = matches.length > 0;
}
search.addEventListener('input', renderTerms);
renderTerms();
