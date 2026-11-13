# Đế Chế tiếng Việt - bản 3.0

Giao diện bình thường chỉ có game gốc. Không có thanh thương hiệu, bảng tra từ, sidebar hoặc iframe nhúng Viva La RTS do dự án tự tạo. Giữ nguyên nền, bố cục, nút và các hiệu ứng của AOE; thay nội dung văn bản mà bộ máy hiển thị đọc.

Trang chiếm toàn viewport, nền đen. Game giữ tỉ lệ theo bộ máy gốc, có vùng đen hai bên nếu màn hình không cùng tỉ lệ. Bản 3.0.1 dùng Tahoma, dự phòng Segoe UI/Arial, cho chữ Canvas và các trường font của AOE. Cài phông trước khi engine đo chữ và tạo cache, giữ nguyên cỡ và độ đậm. Không tạo lại chữ nhãn hiệu nằm trong hình gốc.

Từ 3.0.2, chữ dùng Segoe UI, độ đậm 600 thay cho bold và các cỡ dưới 14px tăng 1px. Renderer giữ alpha gốc của glyph, pha màu trực tiếp trong framebuffer palette theo 8 mức và giữ clipping/thứ tự vẽ của game. Không phát lại chữ trên một lớp nổi sau hộp thoại. Canvas dùng nội suy mượt khi phóng to; chữ nhãn hiệu và hình gốc giữ nguyên.

Màn chờ chỉ hiện thông báo đang mở game và chuẩn bị nhiệm vụ tiếng Việt. Lỗi tải có thông báo tiếng Việt cùng nút thử lại có focus rõ và chiều cao tối thiểu 44px. Màn này ẩn sau khi module khởi động sẵn sàng.

Bản đồ ngẫu nhiên và nội dung hướng dẫn Ai Cập là hai luồng chơi tiếng Việt đã triển khai. Giữ các số liệu, phím tắt, ID và tên tệp nội bộ của game. Bản dịch ưu tiên thuật ngữ đã dùng trong game: Dân làng, Nhà chính, Nhà dân, Trại bộ binh, Kho chứa, Cảng, Thuyền cá, Phù thủy.

Ảnh kiểm tra thực tế nằm ở `.impeccable/review/v3/` (không đưa vào Git), gồm menu, thiết lập trận, chọn dân, xây nhà, tạo dân, lưu/tải, hướng dẫn và bản đồ nhiệm vụ. Đối với điện thoại, game có giới hạn thao tác gốc; bản này ưu tiên máy tính có chuột và bàn phím, chưa tuyên bố kiểm chứng toàn bộ cảm ứng.
