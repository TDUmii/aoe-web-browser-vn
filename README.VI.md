# Đế Chế Web VN

**Website:** https://tdumii.github.io/aoe-web-browser-vn/

**Cách chơi web hiện tại:** dùng nút dấu trang ở [trang bật tiếng Việt](https://tdumii.github.io/aoe-web-browser-vn/viet-hoa.html) để Việt hóa ngay trong tab AoE trên Viva La RTS. Có 924 mục giao diện được dịch, chưa gồm toàn bộ cốt truyện chiến dịch. Không cần tải ZIP game hoặc chạy máy chủ trên máy. Xem [README chính](README.md#chơi-trên-web-với-tiếng-việt).

**Bản hiện tại dùng Rise of Rome đầy đủ** với gói game/CD trên máy. Mở bằng `choi-aoe.cmd` hoặc đọc [README chính](README.md). Các mục Trial dưới đây ghi lại bản cũ; phần cập nhật đầy đủ nằm cuối tài liệu.

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

## Bản sửa chơi thử ngày 04/11/2026

- Sửa lỗi ánh xạ font TCVN3 bị áp dụng chồng giữa các Unicode cmap. Bảng glyph gốc được sao chép trước khi chỉnh, và builder kiểm tra lại mọi ánh xạ trong font đã serialize. Overlay dùng phiên bản cache mới.
- Thay thời gian chờ cứng 22 giây bằng kiểm tra mẫu pixel ngay trong vòng dựng hình WebGL. Có hình chưa đồng nghĩa menu sẵn sàng. Nếu sau 120 giây chưa có hình, trình chơi hiện khôi phục.
- Có nút Toàn màn hình, Cách chơi, Xuất bản lưu và Nhập bản lưu. Lưu ván trong Menu của game trước khi xuất; đóng hoặc tải lại trang xóa dữ liệu chưa xuất.
- ZIP lưu chỉ nhận các tệp .gam trong SAVEGAME và metadata game*.nfo. Có giới hạn kích thước, số tệp và kiểm tra đường dẫn trước khi nhập. Tệp trùng tên sẽ được thay thế.
- README chính đã đổi từ hướng dẫn WindowsAppPlayer chung sang hướng dẫn đúng AoE Trial.

Kiểm tra source: `npm test`. Kiểm tra font: chạy `python scripts/build-vn-overlay.py` với fontTools đã cài và Wine overlay nguồn. Không cần tạo lại font khi chỉ muốn chơi.

Kiểm thử thực tế ngày 04/11/2026 trên Chromium máy tính: vào chiến dịch Bronze Age Art of War, chọn và ra lệnh di chuyển đơn vị, lưu ván, xuất ZIP, tải lại trang, nhập ZIP rồi tải lại đúng bản đồ và vị trí quân. AudioContext đã chạy sau thao tác người dùng; chưa xác nhận chất lượng âm thanh bằng tai, trận dài, máy yếu hoặc chơi mạng. Giao diện hướng dẫn đã kiểm tra ở chiều rộng 390 px; gameplay chỉ được xác nhận trên máy tính 1280 × 720.


## Rise of Rome đầy đủ, màn hình lớn và font trong game (04/11/2026)

Giao diện mới đọc gói `aoe-full.zip` đã chuẩn bị trên máy, không tự chạy bản Trial. Máy chủ local đọc `local-game/aoe-standard-web/game-config.json`; website tĩnh cho người chơi chọn ZIP. Khung game không còn giới hạn 800 px hiển thị, vẫn giữ tỷ lệ 4:3. Game gốc tiếp tục vẽ ở 800 × 600.

Bộ chạy giữ cả executable AoE gốc và Rise of Rome, thiết lập thông tin cài đặt trong Wine và gắn nội dung đĩa vào CD ảo. Executable giữ nguyên byte từ nguồn đã tải; script chỉ điều chỉnh resource tên font trong DLL bản dịch sang UmiVN. Không cài font hoặc sửa registry Windows. Bộ game/CD đầy đủ nằm riêng trong `local-game`, không đưa lên Git.

Bộ `.VnArial` của gói dịch đã thử thực tế nhưng hiển thị sai ký tự trong Wine. Bản cuối dùng UmiVN từ Liberation Sans theo OFL, có kiểm tra bảng glyph; font hộp thoại Win32 cũng được cấu hình trong Wine. Hỗ trợ bản lưu `.gmx` của Rise of Rome và `.gam` cũ. Các bản lưu có sẵn trong bộ nguồn được bỏ khỏi gói mới, nguồn gốc không bị sửa.

Đã thử vào Bản đồ ngẫu nhiên với hai người chơi, chọn và ra lệnh cho dân, lưu ván, xuất ZIP rồi nhập ở phiên mở mới. Kiểm tra ở cửa sổ 1920 × 1080 cho khung game khoảng 1349 × 1012. Chưa xác nhận trận dài, hiệu năng máy yếu hoặc chơi nhiều người qua mạng. Xem README chính để mở chơi và chuẩn bị lại gói.
