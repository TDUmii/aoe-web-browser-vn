# Phân tích Viva La RTS bằng REA

Ngày kiểm tra: 13/11/2026. Đích: https://vivalarts.com/.

## Bằng chứng

- HTTP GET trang chủ trả 200. Entry hiện tại là `/assets/index-CjR_UlqN.js`.
- REA `analyze_javascript_application` đọc tĩnh các module danh mục game và shell đã tải công khai. Bản ghi gốc: `ev_6f151ba4026478401979c45aab6d5957d92b5aa0fab235b2f4d79f368cfa5af1`. Phân tích được giới hạn ở hai module, không phải toàn bộ game.
- `games-CIPulCdv.js` khai báo Age of Empires (`aoe1`) là game công khai, gốc tài nguyên `/dev-assets/aoe1`. Lựa chọn game được nhớ trên origin Viva La RTS.
- REA `capture_browser_scenario` khởi chạy Chrome với hồ sơ tạm, mở trang và bấm thẻ AOE. Bản ghi: `ev_afee282393f1982bfd4b2d4aa30637ab4f8ad497528bea91551b31e46998ee04`. Trình duyệt tạm đã được REA đóng sau capture.
- Entry có route phát triển `aoe1map`, nhưng `entry-oM5BGyMI.js` yêu cầu devmode. Giao diện mới không dùng route này hoặc tự bật cờ nội bộ.
- Không tìm thấy API `postMessage` để wrapper tự chọn game trong các module đã xem. Không coi việc chưa thấy là bằng chứng không có API ở mọi module khác.
- Response trang chủ tại thời điểm kiểm tra không có `X-Frame-Options` hoặc CSP chặn nhúng. Đây là quan sát kỹ thuật, không phải giấy phép sao chép hay cam kết trang sẽ cho nhúng mãi.

## Quyết định triển khai

Người dùng chọn chơi Viva La RTS ngay trong website mới với giao diện hỗ trợ tiếng Việt. Vì vậy bản 2.0 dùng iframe tải từ origin gốc, kèm hướng dẫn chọn AOE lần đầu. Không sao chép engine, tài nguyên thương mại hoặc backend; không dùng giả lập hay các bộ game EXE cũ.

Khung game cho phép script, cùng origin nội bộ của Viva, biểu mẫu, khóa con trỏ, popup và fullscreen cần cho game. Không cấp quyền tải file hoặc điều hướng trang cha qua sandbox. Nút mở tab riêng là lối khôi phục khi game không chạy trong khung.

Trang legal của Viva: https://vivalarts.com/legal/index.html. Trang ghi đây là dự án fan phi thương mại và nội dung thuộc các chủ sở hữu. Chưa tìm thấy giấy phép phát hành lại engine hoặc tài nguyên.

## Giới hạn

Đây là phân tích module công khai và hành vi trình duyệt có giới hạn, không phải audit bảo mật toàn bộ Viva La RTS. Không kết luận tương đương hoàn toàn với AOE gốc, không bảo đảm multiplayer, save cloud hoặc mọi chiến dịch. Giao diện hỗ trợ không thể sửa menu game trên origin khác; menu có thể vẫn bằng tiếng Anh.
