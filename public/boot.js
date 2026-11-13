const opening = document.querySelector('#opening');
const message = document.querySelector('#opening-message');
const retry = document.querySelector('#try-again');
import { installDisplayTranslations } from './localize.js?v=3.0.0';
import { applyCampaignVietnamese } from './campaign-localize.js?v=3.0.0';
import { installGameFont } from './game-font.js?v=3.0.2';
import { installReadableText } from './readable-text.js?v=3.0.2';
installGameFont();
installReadableText();
retry.addEventListener('click', () => location.reload());

try {
  // These are public browser modules identified by the REA investigation.
  // Patch the dictionaries before loading modules that cache display labels.
  const [translations, phrases, campaigns] = await Promise.all(['vi-game.json', 'vi-ui.json', 'campaign-vi.json'].map(file => fetch(`${file}?v=3.0.0`).then(response => {
    if (!response.ok) throw new Error('translation-unavailable');
    return response.json();
  })));
  installDisplayTranslations(phrases);
  const { t: strings } = await import('/assets/strings-D2PwFU4r.js');
  Object.assign(strings.language, translations);
  Object.assign(strings.languagex, translations);
  for (const id of [102, 103, 104, 110, 113, 116, 119, 122, 125, 128, 131]) {
    strings.language[id] = strings.languagex[id] = 'Segoe UI';
  }
  const games = await import('/assets/games-CIPulCdv.js');
  games.v('aoe1');
  games.h();
  message.textContent = 'Đang chuẩn bị nhiệm vụ tiếng Việt...';
  const { n: loadCampaignScenario } = await import('/assets/scenario-CCQEnV9K.js');
  await applyCampaignVietnamese(loadCampaignScenario, campaigns);
  // Normal public startup. Never enable developer flags or gated links.
  await import('/assets/index-CjR_UlqN.js');
  opening.hidden = true;
} catch (error) {
  message.textContent = navigator.onLine
    ? 'Chưa tải được game. Bạn kiểm tra kết nối rồi thử mở lại nhé.'
    : 'Bạn đang ngoại tuyến. Kết nối Internet rồi thử mở lại nhé.';
  retry.hidden = false;
  console.error('Không mở được Đế Chế:', error.message);
}
