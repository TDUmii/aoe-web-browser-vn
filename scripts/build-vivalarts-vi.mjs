import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const template = readFileSync(new URL('scripts/vivalarts-translator.js', root), 'utf8');
const locale = JSON.parse(readFileSync(new URL('assets/vivalarts-vi.json', root), 'utf8'));
if (locale.version !== 1 || !locale.strings || !Object.entries(locale.strings).every(([key, value]) => /^\d+$/.test(key) && typeof value === 'string')) {
  throw new Error('Invalid Vietnamese locale.');
}
const metadata = `// ==UserScript==
// @name         Đế Chế tiếng Việt - Viva La RTS
// @namespace    https://tdumii.github.io/aoe-web-browser-vn/
// @version      1.0.0
// @description  Việt hóa giao diện AoE trong tab game của bạn. Không kèm dữ liệu game.
// @match        https://vivalarts.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
`;
writeFileSync(new URL('assets/vivalarts-vi.user.js', root), metadata + template.replace('__UMI_VI_LOCALE__', JSON.stringify(locale)));
console.log(`Vietnamese overlay built: ${Object.keys(locale.strings).length} translated IDs.`);
