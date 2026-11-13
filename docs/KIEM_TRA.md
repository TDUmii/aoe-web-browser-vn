# Kiểm tra bản 2.0 - 13/11/2026

## Kiểm tra có thể chạy lại

`npm test` chạy test máy chủ bằng Node.js, không cần thư viện: phục vụ trang và JS đúng MIME, HEAD không trả body, từ chối truy cập Git/dữ liệu game cũ/tệp máy chủ và từ chối phương thức ghi.

`node --check app.js` và `node --check server.mjs` đã qua. `git diff --check` không còn lỗi khoảng trắng.

## Kiểm tra trình duyệt

Chrome 157 trên Windows, viewport 1440 x 900 và 390 x 844.

| Phạm vi | Kết quả |
| --- | --- |
| Fixture cách ly mạng | Tìm thuật ngữ không dấu/chữ hoa, không có kết quả, đóng hướng dẫn bằng Escape và trả focus đã qua. |
| Fixture cách ly mạng | Hủy tải lại hoặc Escape không điều hướng iframe; xác nhận tải lại điều hướng đúng một lần. |
| Fixture cách ly mạng | Ngoại tuyến và trở lại online không tải lại iframe. |
| Fixture cách ly mạng | Vào/thoát fullscreen toàn player, nhãn và trạng thái nút cập nhật. |
| Fixture cách ly mạng | Thông báo sau 25 giây tải chậm và phục hồi sau khi iframe tải muộn đã qua bằng đồng hồ ảo. |
| Fixture service worker | Chỉ unregister hai scriptURL cũ chính xác của dự án; giữ worker của project khác. Không thử mọi phiên bản worker từng tồn tại trên thiết bị người dùng. |
| Live Viva La RTS | Khung sandbox mở được game picker; chọn Age of Empires, Single Player, Random Map và Start Game tới gameplay thật. Thử chọn dân và ra lệnh di chuyển. |
| Giao diện | Không tràn ngang ở hai viewport đã kiểm tra. Hướng dẫn và glossary cuộn dọc trên điện thoại. |

Kiểm tra live không dùng phản hồi giả. Kiểm tra fixture chỉ xác nhận hành vi wrapper, không chứng minh engine game hoạt động. Browser không ghi nhận page error trong lượt live đã thực hiện.

Reviewer độc lập xem bốn ảnh desktop/mobile và mã wrapper, đưa disposition `ship`. Detector Impeccable chỉ chạy được chế độ regex do thiếu parser; không coi đó là kiểm toán contrast bằng computed styles.

Chưa kiểm tra toàn bộ chiến dịch, multiplayer, cloud save, trình đọc màn hình hoặc thiết bị cảm ứng thật. Không suy ra độ tương đương hoàn toàn với AOE gốc.

## Dọn dữ liệu cũ trên máy

Đã xóa các bộ game/giả lập cũ tại `D:\Code\AOE-Web-Browser` (gồm `local-game`, `_site`, `64`, `demo`, `fs`, `runtime` và mã nguồn cũ), gói `D:\Download\aoe-full.zip`, dự án thử `D:\Code\AOE-Web-VN` và log QA cũ. Giữ `.git` và lịch sử; không viết lại lịch sử. Shortcut Desktop được cập nhật về URL trang chủ mới.

Kiểm tra cây nguồn mới không có EXE, DLL, ZIP, ISO hoặc WASM. Không tuyên bố đã tìm mọi bản game trên toàn bộ ổ đĩa.

Microsoft Defender Quick Scan hoàn thành lúc 08:25 ngày 13/11/2026 (giờ Việt Nam), không có phát hiện mới trong khoảng quét. Đây là quick scan, không phải chứng nhận toàn bộ máy sạch mã độc và không xác định lại các file đã xóa có nhiễm hay không.
