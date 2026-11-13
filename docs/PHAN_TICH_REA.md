# Phân tích REA và bản Việt hóa trong game

Ngày kiểm tra: 13/11/2026. Nguồn công khai: https://vivalarts.com/.

## Kết quả có thể dùng để triển khai

- `strings-D2PwFU4r.js` xuất đối tượng chứa `language` và `languagex` có thể cập nhật. Lookup trong `strings-BfFs0tko.js` đọc `languagex[id]` trước, nên bản dịch được áp dụng vào menu, nhãn và trợ giúp thực tế của game.
- Bộ vẽ AOE dùng Unicode qua Canvas 2D, rồi chuyển mặt nạ chữ sang ảnh palette. Thay trường font bằng Arial cho phép vẽ dấu tiếng Việt.
- `games-CIPulCdv.js` có bộ chọn game công khai. Dùng lựa chọn AOE bình thường trước khi import entry gốc để bỏ màn chọn nhiều game. Không dùng `startAoe1Link` vì đường đó có gate developer.
- Entry AOE nhập gián tiếp module index qua loadbar. Không gọi thêm `aoe1Flow()` song song, tránh hai luồng khởi động.
- `scenario-CCQEnV9K.js` xuất bộ nạp chiến dịch có bộ nhớ đệm. Bản dịch cập nhật đối tượng nhiệm vụ trước khi phần giới thiệu, gợi ý và màn sau chiến thắng sử dụng các trường văn bản.
- Một số nhãn HUD, menu, lưu/tải viết thẳng trong code. Bộ dịch bổ sung dùng phép khớp chuỗi chính xác và một vài mẫu số lượng, xử lý cả đo chữ và vẽ chữ. Không viết lại lệnh cheat, ID hoặc logic simulation.

REA static analysis record: `ev_b4597819ccb1b1499ae5c192e63840c9620b4050681885db08d43af670c78c47`. Phạm vi gồm các module entry, lookup chữ, renderer và loader đã chọn; graph có giới hạn, không phải audit toàn bộ game. REA source-recovery qua Wakaru không khả dụng trên môi trường Windows này; dự án không tuyên bố đã thu được source gốc trước biên dịch hay backend.

## Cách phục vụ

Module và tài nguyên công khai của nguồn gốc không cấp CORS cho website khác. Bản iframe 2.0 không thể sửa nội dung game, nên 3.0 dùng máy chủ phục vụ tài nguyên theo danh sách đường dẫn cho phép. Máy chủ chỉ GET/HEAD tới host cố định, không chuyển cookie/Authorization, không lấy endpoint riêng tư và không mở URL tùy ý.

Mã hỗ trợ và bản dịch nằm trong repo này. Engine/art/âm thanh được stream từ nguồn công khai khi cần, không đóng gói vào Git. Không bật cờ developer hoặc bỏ kiểm tra quyền của nguồn gốc.

## Giới hạn

Phần chơi bản đồ ngẫu nhiên và 12 màn hướng dẫn Ai Cập đã Việt hóa nội dung. Các chiến dịch khác chưa dịch toàn bộ cốt truyện; âm thanh/video và chữ nằm trong ảnh gốc chưa được thay. Bộ khớp chuỗi hiển thị có thể dịch cả một tên người chơi/bản lưu trùng chính xác nhãn giao diện. Module có hash phụ thuộc phiên bản nguồn; cần cập nhật nếu nguồn gốc thay đổi.

REA capture bổ sung ở cuối lượt đã hoàn thành điều hướng/chờ nhưng gặp timeout khi xác nhận dọn trình duyệt. Không coi lượt đó là bằng chứng kiểm thử trọn vẹn; các kiểm tra Chrome độc lập và ảnh thật trong báo cáo kiểm tra được dùng để xác minh gameplay. Trình duyệt tạm của lượt REA được kiểm tra và dọn sau đó.
