# Đế Chế Web VN

## Chơi trên web với tiếng Việt

Mở **https://tdumii.github.io/aoe-web-browser-vn/viet-hoa.html**. Lưu nút **Đế Chế tiếng Việt** vào thanh dấu trang một lần, mở Viva La RTS và bấm dấu trang trong tab game. Công cụ đổi văn bản và font ngay trong tab, không yêu cầu ZIP game hay máy chủ local. Sau khi tải lại game, bấm lại dấu trang.

Bản dịch có 924 mục, tập trung vào menu, tạo trận, quân/công trình, nâng cấp, thao tác, lưu/tải và ngoại giao. Chưa dịch toàn bộ truyện chiến dịch, lịch sử và các mô tả trợ giúp dài. Game tiếp tục do Viva La RTS cung cấp; trang này chỉ phát hành bản dịch và công cụ áp dụng cá nhân, không sao chép game của họ. Công cụ nhận diện module đang được trang sử dụng, nên có thể cần cập nhật khi website thay đổi cấu trúc.

Nếu đã có trình quản lý userscript, có thể cài `assets/vivalarts-vi.user.js` để tự bật dịch. Chỉ dùng trong trang `https://vivalarts.com/`. Không cần cài trình quản lý userscript khi dùng dấu trang.

Nguồn bản dịch: `assets/vivalarts-vi.json`; chương trình áp dụng: `scripts/vivalarts-translator.js`; build lại bằng `npm run build:vi`. Bản dịch được viết mới, không kèm mã nguồn hoặc hình/âm thanh của game.

## Bản Win32 chạy bằng Boxedwine đã chuẩn bị trước đó

Chơi **Age of Empires: The Rise of Rome đầy đủ** bằng trình duyệt, có giao diện tiếng Việt. Dùng Boxedwine + Wine + WebAssembly, bộ game được đọc ngay trên máy của bạn.

**Trạng thái bản Boxedwine:** bộ game thương mại vẫn được giữ cục bộ. Website công khai mặc định chuyển sang trang bật tiếng Việt cho Viva La RTS ở trên.

## Mở chơi

Trên máy đã chuẩn bị bộ game, chạy `choi-aoe.cmd` hoặc `npm start`, sau đó mở **http://localhost:8097/**. Máy chủ tự dùng gói tại `local-game/aoe-standard-web/aoe-full.zip`.

Trên website GitHub Pages, bấm **Chọn gói game đầy đủ (.zip)** và chọn `aoe-full.zip` đã chuẩn bị. Bộ game không được gửi lên máy chủ. Website không tự mở bản Trial.

## Nạp tự động từ website

Khi có bộ dữ liệu được phép lưu trữ và phân phối trên website, đặt `edition` thành `full` trong `game-config.json` và dùng `game` trỏ tới ZIP đã đóng gói. Trình duyệt tự nạp rồi khởi động, không yêu cầu người chơi tải tệp thủ công, chọn ZIP hoặc chạy máy chủ trên máy.

Với hosting giới hạn kích thước từng tệp, có thể chia ZIP thành các phần nhị phân liên tiếp, đặt trong `assets/` và cấu hình `gameParts` theo đúng thứ tự:

```json
{
  "edition": "full",
  "gameParts": [
    { "url": "assets/game/package-01.part", "size": 47185920 },
    { "url": "assets/game/package-02.part", "size": 34033018 }
  ]
}
```

Đây là cấu trúc minh họa, không phải các tệp game đã có trên website. `size` là số byte chính xác của từng phần. URL tương đối giữ đúng đường dẫn GitHub Pages. Loader kiểm tra kích thước, hiển thị phần đang nạp và chỉ bắt đầu giới hạn chờ khởi động Wine sau khi nạp xong dữ liệu. Tổng ZIP tối đa 300 MiB. Nguồn runtime GPL/LGPL không cấp quyền phân phối dữ liệu game thương mại; xem [NOTICE.md](NOTICE.md).

`node scripts/prepare-hosted-game.mjs <source.zip> <output-directory>` tạo các phần 45 MiB và cấu hình tương ứng để kiểm thử việc nạp qua HTTP. Script không tải lên hosting và không sửa cấu hình website hiện tại. Mặc định đầu ra ở `local-game/hosted-game`, được loại khỏi Git. Chỉ phát hành dữ liệu khi có quyền phân phối phù hợp.

Dùng Chrome hoặc Edge trên máy tính, có chuột và bàn phím. Trong game chọn **Chơi đơn → Bản đồ ngẫu nhiên**, chọn số máy rồi bấm **Bắt đầu**. Nên thử 2 người chơi trước trên máy yếu.

Khung game giãn theo cửa sổ và giữ tỷ lệ 4:3. Độ phân giải vẽ của game gốc vẫn là 800 × 600, nên phóng to không tạo sprite HD.

## Lưu ván

Lưu ván qua **Menu → Lưu ván chơi**, rồi bấm **Xuất bản lưu** dưới game để giữ ZIP. Lần sau chọn **Nhập bản lưu**, vào **Chơi đơn → Tải ván chơi**. Hỗ trợ `.gmx` của Rise of Rome và `.gam` cũ. Nhập thay thế bản lưu trùng tên. Đóng hoặc tải lại trang sẽ mất dữ liệu chưa xuất.

## Chuẩn bị lại từ bộ nguồn trên máy

Cần Python với `fontTools`, `pefile` và Node.js 18 trở lên. Gói đã kiểm tra bao gồm bộ game và nội dung đĩa CD được gắn vào ổ CD ảo của Wine, khoảng 270 MB. Mặc định các script dùng bộ nguồn offline đã chuẩn bị dưới `local-game/aoe-nphunghung/game-staging`; chúng không tự tải hoặc phát hành game.

```powershell
python scripts/build-vn-font-overlay.py
python scripts/prepare-full-game.py --cd-root "local-game/aoe-gold-cdroot-complete"
npm start
```

Bản dịch dùng resource của [aoe.vn](https://beyeucup.aoe.vn/cach-choi-aoe/huong-dan-tai-va-cai-dat-ban-aoe-viet-hoa-chuan-tieng-viet-5752.html). Các font gốc `.VnArial` hiển thị sai dấu trong Wine; script giữ chuỗi TCVN3 và đổi tên font trong DLL sang UmiVN, dùng cmap đã sửa của Liberation Sans theo OFL. Font hộp thoại Win32 được cấu hình trong Wine, không cài font hoặc sửa registry Windows.

Nguồn bộ offline đã kiểm tra: [bài của uploader nphunghung](https://nphunghung.com/download-game-de-che-1-aoe-1/). Executable được giữ nguyên byte. Script lọc ván lưu/tên người chơi có sẵn trong nguồn khi tạo ZIP; thư mục nguồn không bị sửa.

## Kiểm tra và phạm vi

```powershell
npm test
```

Các kiểm tra bao phủ phát hiện hình ảnh, lỗi khởi động, bộ nhớ XHR nhị phân và nhập/xuất bản lưu với BrowserFS/JSZip thực. Hiệu năng trận dài, máy yếu và chơi mạng chưa được xác nhận. Bản đồ ngẫu nhiên và thao tác đơn vị cần kiểm tra trong trình duyệt thật; emulator báo Running chưa chứng minh game đã lên.

Đã kiểm thử riêng việc trình duyệt tự nạp 6 phần HTTP, vào menu tiếng Việt và tạo trận mới mà không mở bộ chọn tệp. Dữ liệu của phép thử được phục vụ qua tuyến kiểm thử riêng, không được tải lên GitHub Pages. Phép thử không xác nhận rằng website công khai đã kèm bản game đầy đủ. Mô phỏng lỗi tải dữ liệu cũng đã kiểm tra thông báo tiếng Việt và nút tải lại.

Bộ game đầy đủ ở `local-game/` được giữ riêng, không đưa vào Git hoặc gói website tĩnh. Các tệp Trial cũ vẫn được giữ để đối chiếu nhưng không tự chạy. Runtime, nguồn và giấy phép xem [NOTICE.md](NOTICE.md), [LICENSE](LICENSE).
