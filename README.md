# Đế Chế tiếng Việt

**Chơi ngay:** https://aoe-web-browser-vn.vercel.app/

Mã nguồn ở repo GitHub `TDUmii/aoe-web-browser-vn`; Vercel chạy trang game và API trong dự án `tdu-mi/aoe-web-browser-vn`. Nhánh main được nối với Vercel. GitHub Pages chuyển tới link Vercel của chủ repo.

Mở thẳng vào AOE, toàn bộ vùng chơi dành cho game. Bản 3.0 áp dụng tiếng Việt vào dữ liệu mà game thực sự dùng: tên đơn vị/công trình/công nghệ, lệnh, mô tả, tài nguyên, thông báo và nội dung chiến dịch hướng dẫn. Không còn khung iframe hoặc bảng tra từ bên ngoài.

Bản 3.0.1 đổi chữ menu, nhãn trong trận và nội dung Canvas sang Tahoma để dễ đọc tiếng Việt hơn. Phông mới được áp dụng trước khi game đo/vẽ chữ; giữ nguyên cỡ chữ, độ đậm và bố cục của game.

Bản 3.0.2 chuyển sang Segoe UI, giảm độ đậm, tăng chữ nhỏ thêm 1px và giữ lại các mức nét mờ ở viền chữ thay vì ép mọi pixel thành bật/tắt. Phóng to canvas dùng nội suy mượt hơn. Nền và lớp hộp thoại vẫn được vẽ theo đúng thứ tự của game.

Bản 3.0.3 chuyển biểu tượng chuột của menu và trận đấu sang con trỏ trình duyệt, giữ hình và điểm bấm tương ứng. Vị trí con trỏ không còn phải đợi game vẽ xong khung hình; các thao tác chọn quân, kéo vùng chọn và ra lệnh vẫn đi qua bộ xử lý gốc.

Bản 3.1.0 thêm máy chủ chơi mạng riêng với phòng, mã mời, thiết lập trận, chat, lệnh theo tick, tạm dừng và kiểm tra đồng bộ. Hai phiên Chrome đã vào cùng trận qua giao diện game, ra lệnh di chuyển và có hash thế giới giống nhau tới tick 600 khi chạy cục bộ và tick 400 trong lượt thử trực tiếp trên Vercel. Xem giới hạn chơi mạng bên dưới.

## Chơi bằng tiếng Việt

- **Chơi đơn > Bản đồ ngẫu nhiên:** thiết lập trận, nhãn trong trận, xây dựng, tạo quân, mô tả trợ giúp, menu tạm dừng và lưu/tải bằng tiếng Việt.
- **Chơi đơn > Chiến dịch > Ai Cập trỗi dậy - Hướng dẫn:** đủ 12 màn, gồm phần giới thiệu, mục tiêu, gợi ý, kết quả sau chiến thắng và ghi chú lịch sử.
- Bản dịch có 1.756 chuỗi theo ID và bộ chuỗi hiển thị bổ sung. Tham số số lượng và chi phí được giữ nguyên. Tên riêng lịch sử giữ nguyên khi thích hợp.
- Game dùng chuột và bàn phím trên máy tính. Dữ liệu lưu ở trình duyệt của địa chỉ đang chơi; không tự chuyển từ Viva La RTS hoặc bản web cũ.

Các chiến dịch khác ngoài 12 màn Ai Cập chưa dịch toàn bộ cốt truyện. Thuyết minh, âm thanh và một số chữ nằm sẵn trong hình gốc vẫn giữ nguyên.

## Chơi mạng thử nghiệm

Vào **Chơi mạng (thử nghiệm)**, nhập tên, chọn kết nối Internet rồi tạo phòng. Người thứ hai mở cùng địa chỉ game, chọn tham gia bằng mã phòng. Chủ phòng chỉnh bản đồ và bấm Bắt đầu trận khi đủ hai người. Ghép trận nhanh chưa triển khai nên không đưa vào danh sách lựa chọn.

Máy chủ hiện giữ phòng trong một tiến trình. Trên Vercel, các kết nối có thể tới các instance khác nhau, và gói Hobby đóng kết nối Function sau tối đa 300 giây, tính cả thời gian ở phòng. Vì vậy bản Vercel dùng để thử kết nối ngắn, chưa phù hợp trận dài. Chưa có kết nối lại sau khi đứt mạng; thoát hoặc tải lại trang sẽ kết thúc trận. Chỉ nên chơi thử với người quen, chưa có kiểm tra chống gian lận cho lệnh nhị phân.

Để thử trận dài trong cùng LAN, chạy một máy chủ Node duy nhất với `HOST=0.0.0.0` và cho cả hai máy truy cập địa chỉ LAN của máy chủ, cổng 8097. Mặc định máy chủ chỉ bind loopback. Không dùng server nhiều instance cho trận dài khi chưa thêm bộ điều phối phòng dùng chung.

## Chạy mã nguồn

Cần Node.js 20 trở lên và thư viện WebSocket `ws` được khóa trong package-lock.json.

```powershell
npm ci
npm start
npm test
npm run build:worker
```

Mở http://127.0.0.1:8097/. Máy chủ bind vào loopback và chỉ phục vụ các tệp giao diện được liệt kê cùng tài nguyên AOE công khai được kiểm tra đường dẫn. Không phục vụ `.git`, tệp hệ thống hoặc gói game EXE.

`public/` chứa trang game và bản dịch. `api/engine.js` phục vụ tài nguyên trên Vercel nếu triển khai cấu hình `vercel.json`. `scripts/build-worker.mjs` tạo Cloudflare Worker độc lập cho Sites. Worker chứa mã hỗ trợ/bản dịch của dự án, lấy các module và dữ liệu game từ nguồn công khai khi có yêu cầu; không đóng gói engine hoặc art của bên thứ ba vào Git.

GitHub Pages chỉ chạy tệp tĩnh nên trang gốc tại https://tdumii.github.io/aoe-web-browser-vn/ chuyển sang máy chủ game mới. Repo Git hiện có và lịch sử được giữ nguyên.

## Phụ thuộc nguồn game

Engine JavaScript và dữ liệu chạy từ nội dung công khai của https://vivalarts.com/. Không có EXE, crack, DLL, ZIP hay giả lập trong bản nguồn này. Cần Internet. Nếu Viva La RTS thay phiên bản hoặc ngừng phục vụ các module đã phân tích, bộ nạp cần cập nhật.

Bộ nạp chỉ lấy GET/HEAD từ host cố định, không chuyển cookie/Authorization, không proxy đăng nhập hoặc dịch vụ riêng tư, không sửa cờ developer và không thay điều kiện thắng.

Xem [nguồn và quyền sử dụng](NOTICE.md), [phân tích REA](docs/PHAN_TICH_REA.md) và [kết quả kiểm tra](docs/KIEM_TRA.md).
