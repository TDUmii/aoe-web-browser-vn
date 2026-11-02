# Đế Chế Web VN - Chơi nhanh

**Website:** https://tdumii.github.io/aoe-web-browser-vn/

## Cách chơi

Mở website là vào trang trò chơi Age of Empires 1 / Rise of Rome. Nội dung chơi được **nhúng trực tiếp từ dịch vụ Sky Farmer** tại https://aoe.skyvalley.me/ nên bạn không phải chuyển file EXE hay ZIP từ máy tính cũ.

Nếu cửa sổ game không hiển thị hoặc gặp lỗi bàn phím, nhấn **☰ Tùy chọn > Mở game gốc** để mở trực tiếp dịch vụ Sky Farmer.

## Thông tin quan trọng

- Đây là một trang truy cập nhanh với UI tiếng Việt. **Game thực tế và dữ liệu game do Sky Farmer lưu trữ/vận hành; repository này không chứa source AOE gốc hay bản dịch nội dung game.**
- Trò chơi có thể thay đổi hoặc ngừng hoạt động theo dịch vụ Sky Farmer. Trang này không sao chép/cung cấp lại file game của họ.
- Độ phân giải, đồ họa và ngôn ngữ bên trong AOE phụ thuộc vào Sky Farmer; trang này không nâng cấp texture hoặc Việt hóa nội dung game.
- Không liên kết hay được Microsoft, Ensemble Studios hoặc Sky Farmer bảo trợ.

## Trình giả lập Windows cũ

Bản thử nghiệm WindowsAppPlayer/Boxedwine trước đó được giữ lại tại:

https://tdumii.github.io/aoe-web-browser-vn/launcher.html

Bản này chỉ dành cho trường hợp bạn có sẵn thư mục AOE trên máy, không tích hợp game. Tương thích game gốc chưa được kiểm chứng.

Để thử trên máy riêng: `npm run setup`, `npm start`, rồi truy cập `http://localhost:8097/launcher.html`.

## Mã nguồn và giấy phép

- Trang chủ tại `index.html` là phần giao diện nhúng của dự án.
- Trình giả lập cũ dựa trên [WindowsAppPlayer](https://github.com/bassdrum4/windowsappplayer), [Boxedwine](https://www.boxedwine.org/) và Wine. Giữ nguyên `LICENSE` và `NOTICE.md` của upstream.
- Không phân phối lại dữ liệu AOE của Microsoft.
