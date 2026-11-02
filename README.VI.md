# Đế Chế Web VN

**Vào thẳng game:** https://tdumii.github.io/aoe-web-browser-vn/

AOE 1997 **Trial** được chạy trong trình duyệt bằng Boxedwine + Wine + WebAssembly. Trang mở trực tiếp canvas game, không có cột nút hoặc yêu cầu chọn EXE/ZIP.

## Việt hóa trong game

- Bản dịch dựa trên **gói Việt hóa cộng đồng aoe.vn**: https://beyeucup.aoe.vn/cach-choi-aoe/huong-dan-tai-va-cai-dat-ban-aoe-viet-hoa-chuan-tieng-viet-5752.html
- Các resource `STRINGTABLE` của `Language.dll` được giữ theo **TCVN3 (ABC)** vì AOE 1997 dùng API ANSI; chỉ chuyển sang Unicode khiến nhiều ký tự thành `?`.
- Tên font trong bản DLL được đổi từ `.VNArial` sang **UmiVN**. Bảng ánh xạ glyph của hai font nguồn mở (Liberation Sans Regular/Bold) trong bộ Wine được điều chỉnh để đọc đúng dữ liệu TCVN3. Phần font được đổi tên theo điều khoản **SIL Open Font License**; văn bản giấy phép đi kèm trong runtime archive.
- **Đã kiểm thử được tiếng Việt có dấu ở menu chính**: Chơi đơn, Chơi nối mạng, Trợ giúp, Kịch bản, Thoát. Chưa kiểm tra toàn bộ chuỗi tiếng Việt trong tất cả màn hình hoặc một trận hoàn chỉnh.

## Tối ưu hiệu năng và tải dữ liệu

- Gói game được nén sẵn dưới cấu trúc `userapp/`, để Boxedwine dùng trực tiếp; không giải nén rồi đóng gói lại thành ZIP 45 MB trong JavaScript.
- Dung lượng gói game hiện khoảng **23,7 MB**, thay vì 25 MB bản đóng gói thử trước.
- Wine font overlay khoảng **9,75 MB**, thay vì 12,3 MB trong bản nghiên cứu. Không bao gồm 105 font TCVN3 tải từ cộng đồng.
- Wine root filesystem được tải **theo các yêu cầu HTTP Range**, không bắt buộc tải trọn 50 MB ngay từ đầu.
- Các file ZIP nhị phân được phục vụ dưới đường dẫn đuôi `.css` với nội dung ZIP không đổi để tránh tiện ích IDM chặn phản hồi tải trong trình duyệt; **đây không phải mã CSS**.
- Tệp tĩnh được phân phối qua GitHub Pages CDN, sử dụng bộ nhớ đệm HTTP mặc định của trình duyệt.

## Giới hạn

- Đây là **Age of Empires 1 Trial 1997**, không phải Age of Empires: The Rise of Rome hay bản thương mại đầy đủ. Một số tính năng, nền văn minh, bản đồ và chế độ mạng sẽ bị giới hạn.
- Độ phân giải game gốc là **800 × 600**. Trình duyệt phóng to pixel, không nâng cấp sprite/texture HD.
- Âm thanh, hiệu năng, lưu game và các màn hình ngoài menu cần tiếp tục kiểm thử trên laptop thực tế.
- Không phải bản phát hành được Microsoft, Ensemble Studios hoặc aoe.vn bảo trợ.

## Nguồn và giấy phép

- Trình giả lập: [WindowsAppPlayer](https://github.com/bassdrum4/windowsappplayer), [Boxedwine](https://www.boxedwine.org/), Wine. Xem `NOTICE.md` và `LICENSE`.
- Bản Trial được lấy từ [Boxedwine](https://www.boxedwine.org/wp-content/uploads/2018/02/MSAoE.exe), có EULA gốc tại `trial-eula.txt` và trong gói game. Phân phối phục vụ mục đích cá nhân/phi thương mại.
- Dịch thuật: cộng đồng **aoe.vn**. Tên tác giả/nguồn được giữ trong tài liệu này.
- Font được biến đổi từ Liberation Sans (OFL), có đổi tên thành **UmiVN** để tuân thủ điều kiện Reserved Font Name.

## Cách chạy local

```powershell
npm run setup
npm start
```

Mở `http://localhost:8097/`. Để xem log kỹ thuật thêm `?debug=1` vào URL. Muốn chạy bộ game riêng, truy cập `/launcher.html?manual=1`.

Nguồn tạo bản vá font: `scripts/build-vn-overlay.py`. Source được đẩy công khai, game được tải tự động từ website; không cần UmiBridge để chơi.

## Khắc phục màn hình đen và nét chữ (02/11/2026)

- Trước đây, trang ẩn lớp tải ngay sau khi bộ giả lập báo **Running**, dù AOE còn đang giải mã hình ảnh và nạp menu. Giờ trạng thái tải tiếp tục hiển thị trong giai đoạn mở game; không để người chơi nhìn màn hình đen không giải thích.
- Nếu runtime không khởi động hoặc mất WebGL context, website hiển thị cảnh báo và nút **Khởi động lại**. Khi chơi có nút **↻ Tải lại** rất nhỏ ở góc dưới phải để cứu phiên đen màn hình.
- Gói game được kiểm tra dung lượng và chữ ký ZIP trước khi chạy để tránh giả lập khởi động trên tệp tải lỗi.
- Màn hình AOE được hiển thị ở kích thước gốc tối đa 800×600 (không phóng to răng cưa) và dùng bộ lọc làm mịn của trình duyệt. Đây là cải thiện hiển thị; **font gốc bên trong AOE 1997 vẫn bị giới hạn bởi engine và dữ liệu 800×600**.
- Game đã được kiểm thử vào menu và màn hình chọn chiến dịch, chưa khẳng định tất cả tình trạng treo/mất hình trên mọi laptop đã được xử lý.