# Đế Chế Web VN

Đây là phiên bản giao diện tiếng Việt dựa trên [WindowsAppPlayer](https://github.com/bassdrum4/windowsappplayer) để thử chạy **Age of Empires 1 / Rise of Rome bản Windows 32-bit** trong trình duyệt.

**Trạng thái:** Launcher chạy được. Chưa kiểm chứng gameplay AOE vì chưa tìm được dữ liệu game trên máy. Đừng nhầm với một bản AOE đã tích hợp và chơi được ngay.

## Chạy trên máy

1. Mở PowerShell tại thư mục dự án.
2. Chạy `npm run setup` để tải runtime Boxedwine/Wine nếu chưa có.
3. Chạy `npm start`.
4. Mở `http://localhost:8097/`.
5. Chọn **Thư mục** chứa bản game đã được cài, hoặc tạo ZIP của thư mục game gồm `EMPIRES.EXE` / `EMPIRESX.EXE`, thư mục `DATA`, `SOUND`, v.v.
6. Giữ chế độ **32-bit** và nhấn **Khởi chạy**.

Để kiểm chứng bộ giả lập trước, nhấn **Thử trình giả lập (7-Zip)**.

## Lưu ý thực tế

- Các tệp AOE được chọn từ thiết bị của bạn, không được tải lên máy chủ.
- Trang không bao gồm game, data, bản quyền hay bản dịch bên trong `LANGUAGE.DLL`.
- Chỉ giao diện launcher đã Việt hóa; việc Việt hóa nội dung game chỉ có thể thực hiện sau khi xác nhận bản game và kiểm tra file ngôn ngữ.
- Tương thích DirectDraw, âm thanh, tốc độ và lưu game vẫn cần được kiểm chứng thực tế.
- Các file thay đổi trong bộ giả lập nằm ở RAM; dùng nút **Tải file lưu / thay đổi** trước khi làm mới trang.
- Cải thiện kích thước hiển thị không tạo ra texture HD; muốn nét hơn thực sự cần bản game/asset tương ứng.
- Repo chứa mã nguồn và công cụ; `runtime/`, `fs/`, `demo/` được tải bằng `npm run setup` và không commit vào repo.

## Ghi công

Dựa trên WindowsAppPlayer, Boxedwine, Wine và exebrowser. Giữ nguyên các thông báo giấy phép trong `LICENSE` và `NOTICE.md`.
