# NOTICE — provenance and licenses

WindowsAppPlayer runs Windows applications in the browser by packaging three
open-source projects:

## Boxedwine — GPL-2.0
- Project: https://www.boxedwine.org/ · Source: https://github.com/danoon2/Boxedwine
- Files: `runtime/boxedwine.wasm`, `runtime/boxedwine.js`,
  `runtime/boxedwine-shell.js`, `runtime/browserfs.boxedwine.js`
- These are the Emscripten/WASM build of Boxedwine (x86 CPU interpreter +
  fake Linux kernel), as packaged by the exebrowser project. The
  `browserfs.boxedwine.js` file is BrowserFS with exebrowser's patch keeping
  on-demand root-zip fetches on same-origin paths.

## Wine 1.7.55 — LGPL-2.1
- Project: https://www.winehq.org/
- Files: `fs/fullWine1.7.55-v8` (root filesystem zip, range-fetched),
  `fs/wine1.7.55-v8-min-online.zip` (overlay with an audio-driver registry
  selection so apps can use the emulated OSS sound card). Both are Boxedwine's
  Wine filesystem zips; the overlay is the upstream file with one registry key
  (`Software\\Wine\\Drivers` → `Audio=oss`) documented at
  https://github.com/andrewnakas/exebrowser/blob/main/public/boxedwine/apps/NOTICE.md

## exebrowser glue — GPL-2.0
- Source: https://github.com/andrewnakas/exebrowser (© Andrew Nakas)
- `app.js` in this project is adapted from its `public/app.js` (user-file
  staging, virtual app zip + XHR interception, shell/Config injection,
  writable-layer export), reworked for a single Wine variant and local serving.
- `LICENSE` in this directory is the GPL-2.0 text applicable to this derived
  combination.

## JSZip — MIT
- File: `runtime/jszip.min.js` (bundled with Boxedwine's web build).

## Demo app — 7-Zip 9.20 (LGPL-2.1 + BSD)
- File: `demo/7-zip.zip`, unmodified, from exebrowser's license-clean app
  collection. https://www.7-zip.org/

## Trademarks
"Windows" is a trademark of Microsoft Corporation. This project is not
affiliated with, endorsed by, or sponsored by Microsoft, WineHQ, CodeWeavers,
or the Boxedwine project.

## AOE 1997 Trial (Microsoft / Ensemble Studios)
- Original noncommercial trial distribution obtained from https://www.boxedwine.org/wp-content/uploads/2018/02/MSAoE.exe
- The EULA shipped with the trial is included as `trial-eula.txt` and in the browser bundle.
- The game data in `demo/aoe-vn-trial.css` is a ZIP-format archive containing the trial's resource files and an adapted community language resource. This is not a full Rise of Rome copy.

## Vietnamese translation (community aoe.vn)
- Original Vietnamese translation resource: https://beyeucup.aoe.vn/cach-choi-aoe/huong-dan-tai-va-cai-dat-ban-aoe-viet-hoa-chuan-tieng-viet-5752.html
- The adapted `Language.dll` uses the source's TCVN3 strings and points to the custom UmiVN font name for the emulated environment.
- Attribution to aoe.vn for the translated strings. AOE VN Web is independently maintained.

## UmiVN font mapping
- `assets/vn-wine-overlay.css` is a ZIP-format Wine overlay. The two remapped fonts are derived from Liberation Sans, subject to the SIL Open Font License 1.1, with their family renamed to `UmiVN` to avoid the reserved font name `Liberation`.
- The original SIL Open Font License and copyright notices are preserved inside the overlay ZIP.
- Source for generating this font overlay from the upstream files is `scripts/build-vn-overlay.py`. No restricted TCVN3 font collections are included in this overlay.
