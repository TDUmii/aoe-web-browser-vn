// Áp dụng bản Việt hóa giao diện trình chạy AOE, không thay đổi engine.
// Chạy một lần sau khi clone: node scripts/apply-vi.mjs
import fs from 'node:fs';
import path from 'node:path';
const file = path.join(process.cwd(), 'index.html');
let html = fs.readFileSync(file, 'utf8');
const translations = [
 ['<html lang="en">', '<html lang="vi">'],
 ['<title>WindowsAppPlayer — run .exe / .msi in your browser</title>', '<title>Đế Chế Web VN - Chạy AOE trong trình duyệt</title>'],
 ['<div class="logo">🪟</div>', '<div class="logo">ĐC</div>'],
 ['<h1>WindowsAppPlayer</h1>', '<h1>Đế Chế Web VN</h1>'],
 ['Windows apps in your browser — Wine + WebAssembly, no VM, nothing uploaded', 'AOE gốc trên web - chạy ngay trong trình duyệt bằng WebAssembly'],
 ['Runs locally in your browser tab — zero uploads', 'Game xử lý trên máy của bạn - không tải file game lên máy chủ'],
 ['Run Windows apps <span class="grad">right in your browser</span>', 'Chơi Đế Chế <span class="grad">ngay trên web</span>'],
 ['Drop a <b>.exe</b>, <b>.msi</b>, or <b>.zip</b> and it launches on an emulated PC —', 'Chọn thư mục AOE hoặc một file <b>.zip</b> chứa đầy đủ game để chạy trên trình giả lập —'],
 ['real Wine, real WebAssembly, <b>no VM and nothing leaves your machine</b>.', 'dùng Wine và WebAssembly, <b>file game được xử lý ngay trên trình duyệt của bạn</b>.'],
 ['Load an app</h3>', 'Chọn bộ cài AOE</h3>'],
 ['aria-label="Choose an executable"', 'aria-label="Chọn thư mục hoặc file game"'],
 ['Drop a <b>.exe</b>, <b>.msi</b>, or <b>.zip</b>', 'Thả thư mục game, <b>.exe</b> hoặc <b>.zip</b>'],
 ['or click to browse — files stay on this machine', 'hoặc nhấn để chọn file - không cần tải game lên server'],
 ['>Folder</button>', '>Thư mục</button>'],
 ['Multiple programs found — pick one:', 'Tìm thấy nhiều chương trình - chọn EMPIRESX.EXE hoặc EMPIRES.EXE:'],
 ['> Engine</h3>', '> Bộ giả lập</h3>'],
 ['Wine 1.7.55 · classic apps · fast fetch', 'Wine 1.7.55 · phù hợp AOE cổ điển'],
 ['wine64 · modern apps · ~205 MB first boot', 'wine64 · không khuyến nghị cho AOE 1'],
 ['Not sure? Just Run — the engine is picked automatically from the EXE header.', 'Với AOE 1 / Rise of Rome, hãy dùng 32-bit. Phải có đầy đủ file game, không chỉ một file EXE.'],
 ['>3</span> Run</h3>', '>3</span> Chơi ngay</h3>'],
 ['▶&ensp;Run</button>', '▶&ensp;Khởi chạy</button>'],
 ['Try demo (7-Zip)</button>', 'Thử trình giả lập (7-Zip)</button>'],
 ['⬇&ensp;Download changed files</button>', '⬇&ensp;Tải file lưu / thay đổi</button>'],
 ['■&ensp;Stop / reset</button>', '■&ensp;Dừng / khởi động lại</button>'],
 ['Pick an app, or try the demo. First 32-bit run downloads the Wine system (~50&nbsp;MB, once).', 'Chọn thư mục AOE hoặc file ZIP để chơi. Lần đầu chạy cần tải runtime Wine (~50 MB).'],
 ['Classic Win32 apps (~1995–2010) run best on the 32-bit engine; wine64 handles newer 64-bit apps (experimental). Emulated speed, no GPU acceleration.', 'AOE gốc hoạt động theo chế độ giả lập nên có thể chậm hơn bản cài Windows. Chức năng và tương thích AOE chưa được xác nhận cho đến khi kiểm thử với bộ game thực.'],
 ['>Console</h3>', '>Nhật ký kỹ thuật</h3>'],
 ["The app's window will appear here", 'Màn hình AOE sẽ xuất hiện tại đây'],
 ['Click the screen to give it keyboard focus', 'Nhấp vào màn hình để điều khiển bằng bàn phím'],
 ['Your files never leave this browser tab.', 'File game không được tải lên máy chủ.'],
 ['<div id="entryPickerWrap" hidden>', '<div id="entryPickerWrap" hidden>']
];
let missed = 0;
for (const [before, after] of translations) {
  if (!html.includes(before)) { console.warn('Chưa thấy chuỗi:', before); missed++; continue; }
  html = html.replace(before, after);
}
// Màu chủ đạo phù hợp RTS cổ điển, không tác động game canvas.
html = html.replace('    --accent: #818cf8;', '    --accent: #d6b46a;')
  .replace('    --accent-strong: #6366f1;', '    --accent-strong: #8b6b31;')
  .replace('    --cyan: #22d3ee;', '    --cyan: #a5b68c;')
  .replace('<script src="app.js"></script>', '<script src="app.js"></script>')
  .replace('<meta name="viewport" content="width=device-width, initial-scale=1">','<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="description" content="Chơi Age of Empires 1 / Rise of Rome qua trình giả lập WebAssembly. Dùng file game trên máy cá nhân.">');
fs.writeFileSync(file, html);
console.log('Đã Việt hóa launcher; các chuỗi chưa khớp:', missed);
