# Đế Chế Web VN

**Website hiện tại:** https://tdumii.github.io/aoe-web-browser-vn/

**Trình chạy AOE gốc:** https://tdumii.github.io/aoe-web-browser-vn/launcher.html

## Trạng thái kiểm thử (02/11/2026)

- Đã thử **Age of Empires 1997 Trial thật** trên WindowsAppPlayer/Boxedwine WebAssembly: chương trình khởi chạy và menu AOE hiện trên canvas 800 × 600.
- Đã tải bộ Việt hóa cộng đồng và thử thay `Language.dll` trong bản Trial. Chuỗi tiếng Việt của patch xuất hiện, nhưng **mã font TCVN3 chưa hiển thị đúng qua Wine 1.7.55**. Ví dụ “Kịch bản” đang có thể hiển thị sai dấu. Chưa thể công bố là bản Việt hóa hoàn chỉnh.
- Chưa thử xong một trận và chưa có **Rise of Rome đầy đủ**. Không gộp demo vào repo public.
- Trang chủ hiện chuyển hướng sang Sky Farmer, **không có Việt hóa trong game** và không phải máy chủ riêng.
- Launcher được sửa các lỗi: đường dẫn runtime dưới `/launcher.html`, ZIP picker tự nạp JSZip, tự ưu tiên EXE AOE, tránh lỗi download-manager cướp request ZIP trên localhost, không kích hoạt COI service worker ở chế độ launcher 32-bit.
- Các thay đổi nhằm tăng tính tương thích; không đảm bảo game đầy đủ hoặc tiếng Việt chạy được trên máy khác.

## Nguồn tải và bản Việt hóa

- **Bản Trial chính thức phục vụ kiểm thử:** https://www.boxedwine.org/wp-content/uploads/2018/02/MSAoE.exe
- **Hướng dẫn và bản Việt hóa cộng đồng:** https://beyeucup.aoe.vn/cach-choi-aoe/huong-dan-tai-va-cai-dat-ban-aoe-viet-hoa-chuan-tieng-viet-5752.html
- **Tệp Việt hóa do bài hướng dẫn dẫn tới:** https://drive.google.com/file/d/1kM3SjMgGbWUnhckOqoA1uj5vFotK-q2U/view

Bộ Việt hóa có 2 lựa chọn `.VnArial` và `.VnTime`, các tệp `Language.dll`, `Languagex.dll`, và font `.TTF`. Tải tại nguồn cộng đồng và **tự kiểm tra tệp trước khi sử dụng**. Bộ dịch không phải patch Unicode hiện đại.

## Chạy launcher local

1. Có Node.js 18+ và mã nguồn dự án.
2. Chạy `npm run setup`, rồi `npm start`.
3. Mở http://localhost:8097/launcher.html.
4. Chọn ZIP/thư mục chứa đầy đủ game, launcher tự ưu tiên `EMPIRESX.EXE` hoặc `EMPIRES.EXE`.
5. Chọn giả lập 32-bit và nhấn **Khởi chạy**.

File game xử lý ngay trên trình duyệt. Bấm **Tải file lưu / thay đổi** trước khi refresh vì lưu trữ của bộ giả lập không tự bền vững.

**Không commit file game hay bản vá từ Google Drive lên GitHub công khai.** Thư mục `local-game/` được gitignore.

## Ghi công

Bộ chạy ứng dụng Windows dựa trên [WindowsAppPlayer](https://github.com/bassdrum4/windowsappplayer), [Boxedwine](https://www.boxedwine.org/), và Wine. Giữ nguyên `LICENSE` và `NOTICE.md`. Age of Empires thuộc chủ sở hữu tương ứng.
