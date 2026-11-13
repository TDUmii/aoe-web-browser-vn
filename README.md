# Đế Chế Web

Chơi Viva La RTS ngay trong website, với thanh điều khiển, hướng dẫn và bảng thuật ngữ tiếng Việt.

**Mở để chơi:** https://tdumii.github.io/aoe-web-browser-vn/

Chọn **Age of Empires** trong khung game, rồi chọn **Single Player**. Viva La RTS hiện chưa cung cấp đường dẫn công khai để tự chọn AOE từ website khác. Lần truy cập sau có thể nhớ game đã chọn, tùy trình duyệt và dữ liệu của Viva La RTS.

## Bản 2.0

- Viết lại giao diện và mã hỗ trợ từ đầu. Game chiếm phần lớn màn hình.
- Toàn màn hình, mở tab riêng, xác nhận trước khi tải lại.
- Hướng dẫn tiếng Việt và tra cứu 20 thuật ngữ có thể tìm không dấu.
- Thông báo mất mạng hoặc tải chậm; kết nối trở lại không tự tải lại trận.
- Không còn Boxedwine, Wine, game EXE, gói ZIP, bookmarklet hoặc userscript trong bản nguồn hiện tại.

Menu và nội dung game do Viva La RTS cung cấp, có thể vẫn là tiếng Anh. Đây là giao diện hỗ trợ chơi, không phải engine AOE độc lập hoặc bản Việt hóa toàn bộ game.

## Chạy để phát triển

Cần Node.js 20 trở lên. Không cần cài thư viện.

```powershell
npm start
npm test
```

Mở http://127.0.0.1:8097/. Máy chủ phát triển chỉ phục vụ bốn tệp của giao diện, không phục vụ `.git`, tài liệu, bản lưu hay dữ liệu trên máy. Có thể đặt biến `PORT` nếu cổng mặc định đã được sử dụng.

Website xuất bản bằng GitHub Pages từ nhánh `main`, thư mục gốc. Không cần bước build. Các liên kết CSS/JS dùng đường dẫn tương đối để hoạt động tại đường dẫn con của GitHub Pages.

## Dữ liệu lưu và giới hạn

Game cần kết nối Internet tới https://vivalarts.com/. Website này không sao chép engine, hình ảnh, âm thanh, bản đồ hoặc backend của Viva La RTS. Nếu họ đổi chính sách nhúng hoặc dịch vụ không truy cập được, dùng **Mở tab riêng**.

Hãy lưu trong game trước khi tải lại hoặc đổi tab. Dữ liệu lưu khi chơi nhúng và khi mở trực tiếp có thể khác nhau do cách trình duyệt phân vùng dữ liệu website. Giao diện này không đọc, xuất hoặc sửa bản lưu của Viva La RTS.

Xem [NOTICE.md](NOTICE.md) về nguồn game và [docs/PHAN_TICH_REA.md](docs/PHAN_TICH_REA.md) về phạm vi phân tích.
