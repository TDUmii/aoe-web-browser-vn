# Kiểm tra 3.0 - 13/11/2026

## Chơi mạng và Vercel 3.1.0

Máy chủ WebSocket riêng hỗ trợ native protocol 11, mã phòng năm ký tự, tạo/tham gia phòng, thiết lập, vị trí người chơi/AI, chat, bắt đầu, ready barrier, đồng bộ lệnh theo tick 50 ms, tạm dừng và phát hiện hash khác nhau. Có giới hạn số phòng, kết nối, kích thước lệnh, hàng đợi và kiểm tra Origin.

Hai phiên Chrome riêng đã tạo/tham gia cùng phòng qua giao diện game, vào bản đồ thật và tiến tới tick 690. Sau thao tác chọn quân và chuột phải, hai client có cùng hash tại tick 100, 200, 300, 400, 500, 600; hash tick 600 là 39550200 ở cả hai bên. Không có page error. Bằng chứng nằm ở `.impeccable/review/multiplayer-3.1.0/qa.json` và ảnh trong cùng thư mục. Đây là kiểm tra máy chủ Node cục bộ một tiến trình, không chứng minh tính bền vững nhiều instance Vercel.

18 tests đạt, gồm protocol hai client, AI xen giữa chỗ người thật, kiểm tra dữ liệu biên và WebSocket thật chấp nhận Origin đúng/từ chối Origin khác. Chat/tạm dừng được kiểm tra protocol, chưa thử bằng giao diện trong lượt hai client này.

Dự án Vercel hiện có `tdu-mi/aoe-web-browser-vn` được xác thực, liên kết và nối repo `TDUmii/aoe-web-browser-vn`; giữ nguyên dự án và lịch sử. API asset và API multiplayer được build trong cùng dự án. Multiplayer vẫn là thử nghiệm: phòng trong bộ nhớ một instance; kết nối Hobby tối đa 300 giây, chưa nối lại hoặc khôi phục trận.

Kiểm tra công khai trực tiếp trên `https://aoe-web-browser-vn.vercel.app/`, không mock hoặc thay tệp cục bộ: hai phiên trình duyệt tạo/tham gia phòng qua menu, vào trận thật, cùng nhận lệnh tại tick 208 và tiến tới tick 405. Hash cả hai bên giống nhau tại tick 100/200/300/400, lần lượt 561398971, 3170169123, 2971227415, 152420466. Không có page error hoặc lỗi WebSocket. Báo cáo `production-qa.json` và ảnh `production-*.png` nằm trong thư mục kiểm tra multiplayer ở trên. Đây là lượt thử ngắn, không kiểm chứng trận dài hoặc các instance khác nhau.

Một số yêu cầu graphics/799.slp, graphics/411.slp, border/20005.slp, sounds/5073.ogg và sounds/-1.ogg trả 404. HEAD trực tiếp cùng đường dẫn trên nguồn Viva La RTS cũng trả 404 cho cả năm tệp; không phải do bộ lọc trên Vercel. Lượt thử vẫn hiển thị quân, nhận lệnh và đồng bộ thế giới. Các endpoint telemetry/bug không được proxy. GitHub Pages trả 200 và trỏ tới Vercel; deployment Vercel được tạo tự động từ commit nhánh main.

## Cập nhật chuột 3.0.3

Kiểm tra Chrome headless với hai hồ sơ thử riêng: bản công khai 3.0.2 và bản ứng viên dùng mã hỗ trợ mới cùng tài nguyên game thực. Trong đoạn di chuột, số lần vẽ sprite nhỏ lên canvas đang hiển thị giảm từ 158 xuống 0; thuộc tính cursor chuyển từ none sang URL PNG native. Không có page error hoặc tràn ngang. H chọn Nhà chính, kéo tạo vùng chọn và chuột phải có phản hồi trực quan trong trận. Ảnh và báo cáo nằm trong `.impeccable/review/mouse-3.0.3/`.

Thời gian callback vẽ game trung vị 11 ms trước, 10 ms sau; p95 lần lượt 14,3 và 14,4 ms. Đây không phải bằng chứng tăng FPS hoặc đo độ trễ phần cứng. Thay đổi tách vị trí con trỏ khỏi vòng vẽ game. Các kiểm tra đơn vị kiểm tra cache bitmap, điểm bấm, giới hạn kích thước, fallback và patch không đồng thời vẽ sprite.

Chơi mạng vẫn chưa được triển khai trên máy chủ này. Mã giao diện công khai của nguồn có luồng tạo/tham gia phòng và giao thức WebSocket cùng host; dự án chưa có dịch vụ phòng và đồng bộ lệnh theo tick tương ứng. Không tạo hoặc tham gia phòng upstream trong lần kiểm tra này.

## Cập nhật độ rõ chữ 3.0.2

7/7 tests đạt. Ba kiểm tra mới xác nhận viền chữ có mức phủ trung gian, màu đen của bóng chữ là màu đục, phép vẽ sau có thể che chữ, clipping và chế độ đo chữ nhị phân được giữ, và patch từ chối renderer sai phiên bản.

Chrome thực giữ được nhiều giá trị alpha ở giữa 0 và 255 thay vì chỉ mask bật/tắt. Font ghi nhận là Segoe UI 600 16px, 14px, 600 28px và 600 14px. Menu, thiết lập, trận đấu, hộp tạm dừng, lưu trận và viewport 390px được chụp trong `.impeccable/review/readable-3.0.2/`; không ghi nhận page error. Kiểm tra độc lập cho kết quả ship trong phạm vi sửa độ rõ chữ. Bản thử dùng tệp giao diện/renderer ứng viên với tài nguyên game thật từ host công khai, không giả lập gameplay.

## Cập nhật phông 3.0.1

Đổi font Canvas sang Tahoma trước khi khởi động, gồm cả measureText và fillText qua cùng font native. Chrome thực ghi nhận bold 16px, 13px, bold 28px và bold 13px đều dùng Tahoma; không còn Copperplate trong các nhánh menu/HUD đã kiểm tra. Ảnh menu, thiết lập, trận đấu, menu tạm dừng và viewport 390px đã kiểm tra không phát sinh tràn ngang. 4/4 tests hiện có đạt. Nét chữ vẫn chịu cách raster palette của bộ máy gốc.

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
