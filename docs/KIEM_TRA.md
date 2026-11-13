# Kiểm tra 3.0 - 13/11/2026

## Kiểm tra tự động

`npm test`: 4 tests đạt, gồm máy chủ không lộ Git/tệp hệ thống, bộ lọc tài nguyên cố định, dịch chuỗi có placeholder/nội dung đặc biệt và bất biến dữ liệu gameplay khi dịch chiến dịch.

`node --check` cho boot, API và Worker sinh ra đã qua. `git diff --check` đã qua.

Kiểm tra trên 12 binary màn chơi thực, parse bằng parser công khai gốc: 12 màn, 48 phần văn bản đã dịch; so sánh sâu mọi thuộc tính khác giống nguyên bản, gồm bản đồ, đơn vị, trigger, người chơi và điều kiện thắng. Guard phát hiện sai tên màn/phiên bản đã qua. Các bản binary dùng cho nghiên cứu không đưa vào Git.

1.756 bản dịch ID được so với 2.522 mục inventory gốc: không sai tham số printf hoặc tham số đánh số. Một phần inventory gốc là metadata/font/tên riêng hoặc mã lỗi Windows, nên tỷ lệ số ID không tương đương tỷ lệ nội dung chơi.

## Kiểm tra thực tế bằng Chrome

Viewport chính 1440 x 900, hồ sơ thử tạm, không dùng hồ sơ trình duyệt cá nhân.

- Mở trực tiếp menu AOE tiếng Việt, không có toolbar hỗ trợ ngoài.
- Vào Chơi đơn, Bản đồ ngẫu nhiên và thiết lập trận tiếng Việt.
- Vào bản đồ, chọn dân, mở bảng xây dựng và xây Nhà dân với chi phí 30 gỗ.
- Chọn Nhà chính, tạo Dân làng với chi phí 50 lương thực và thấy tiến trình huấn luyện.
- Mở menu trong trận, lưu tên `Kiem tra Viet`, mở danh sách tải và tải lại bản lưu.
- Vào chiến dịch Ai Cập, mở màn Săn bắn, đọc hướng dẫn/mục tiêu Tạo 7 dân làng bằng tiếng Việt rồi vào bản đồ nhiệm vụ.
- Link Sites đã được xuất bản thành công và người dùng yêu cầu đặt công khai. HTTP không đăng nhập trả 200.

Ảnh các bước nằm trong `.impeccable/review/v3/` trên máy phát triển, không đưa vào repo. Không dùng fixture giả để tuyên bố engine hoạt động.

Chưa chơi hết 12 nhiệm vụ tới chiến thắng, chưa kiểm tra mọi công nghệ/đơn vị, trình đọc màn hình hoặc thiết bị cảm ứng thật. Chơi mạng không có backend trên host dự án; các endpoint telemetry/lobby/bug của nguồn gốc không được proxy. Một số yêu cầu tới các đường đó trả lỗi mạng dự kiến, không được coi là lỗi asset AOE.
