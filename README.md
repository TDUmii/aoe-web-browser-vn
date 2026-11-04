# Đế Chế Web VN

Chạy **Age of Empires 1997 Trial** bằng Boxedwine + Wine + WebAssembly trong trình duyệt. Menu đã Việt hóa; nội dung chiến dịch vẫn có phần tiếng Anh.

- [Bản web đang công khai](https://tdumii.github.io/aoe-web-browser-vn/)
- [Chi tiết Việt hóa, nguồn và giới hạn](README.VI.md)

## Chơi trên máy tính

Cần Node.js 18 trở lên. Nếu đã có runtime và dữ liệu game trong checkout:

```powershell
npm start
```

Mở **http://localhost:8097/**. Hoặc chạy `choi-aoe.cmd`. Nếu thiếu bộ chạy, dùng `npm run setup` trước. Cần chuột và bàn phím; nên dùng Chrome hoặc Edge.

Trong game chọn **Chơi đơn → Chiến dịch**, nhập tên người chơi rồi chọn bài. Bản Trial có chiến dịch giới hạn. Mục **Bản đồ ngẫu nhiên** chỉ mở trang giới thiệu tính năng của bản đầy đủ.

## Giữ bản lưu qua lần mở trang

1. Mở **Menu → Lưu ván chơi** trong game và lưu ván.
2. Bấm **Xuất bản lưu** bên dưới game để tải ZIP về máy.
3. Lần sau, nhập ZIP bằng **Nhập bản lưu** ở menu chính rồi vào **Chơi đơn → Tải ván chơi**.

Đóng hoặc tải lại trang xóa dữ liệu trong phiên. ZIP lưu chỉ chứa các tệp ván chơi của Trial; không phải ảnh chụp RAM hay toàn bộ bộ cài game. Nhập sẽ thay thế các bản lưu trùng tên.

## Giới hạn thực tế

- Đây là Trial 1997, không phải **The Rise of Rome** đầy đủ.
- Chưa hỗ trợ kết nối online nhiều người trong trình chơi web này.
- Game gốc 800 × 600; làm mịn canvas không tạo đồ họa HD.
- Dùng giả lập CPU nên hiệu năng tùy máy; chưa có kiểm thử trận dài hoặc máy yếu.
- Việt hóa menu không đồng nghĩa toàn bộ văn bản chiến dịch đã dịch.

## Phát triển

```powershell
npm test
```

Các kiểm tra bao phủ phát hiện khung hình, lỗi khởi động và xuất/nhập ZIP lưu. Cần kiểm thử trình duyệt thật để xác nhận game tải lại được ván. Trình chơi chỉ bỏ màn hình tải sau khi lấy được mẫu pixel có hình từ vòng dựng hình của runtime; có hình chưa chứng minh menu hoặc một trận đã chạy hoàn chỉnh.

`index.html` và `play.html` dùng cùng giao diện. `launcher.html?manual=1` là công cụ chạy tệp Windows riêng. `scripts/build-site.mjs` đóng gói website tĩnh.

Runtime: GPL/LGPL; font: OFL với tên UmiVN; dữ liệu Trial và bản dịch có điều kiện riêng. Xem [NOTICE.md](NOTICE.md), [LICENSE](LICENSE), [trial-eula.txt](trial-eula.txt) và nguồn trong README.VI.md.
