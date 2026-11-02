# Đế Chế Web VN

**Mở website để vào game AOE ngay:** https://tdumii.github.io/aoe-web-browser-vn/

**Trang chơi trực tiếp:** https://tdumii.github.io/aoe-web-browser-vn/play.html

## Thực tế đang có

- Age of Empires **1997 Trial** (bản demo Windows gốc) chạy trên BoxedWine/WASM trong trình duyệt.
- Không yêu cầu chọn EXE, cài app hay truyền file game từ laptop khác; trình duyệt tự tải gói trial khoảng 24 MB và runtime.
- Trong kiểm thử local, game hiện menu gốc và có thể vào **Single Player Menu / Random Map** bằng bàn phím.
- Đây chỉ là **bản demo của AOE 1 năm 1997**, không phải bản thương mại đầy đủ và không bao gồm Rise of Rome.
- **Chưa có tiếng Việt bên trong game**. Bộ Việt hóa cộng đồng dùng TCVN3 và bị sai font khi chạy dưới Wine bản này; chưa nên tuyên bố Việt hóa thành công.
- Chưa xác nhận chơi hết một trận hay khả năng lưu trò chơi dài hạn. Có thể gặp hạn chế hiệu năng, âm thanh hoặc chức năng online.

## Bản trial và điều khoản

Bộ dữ liệu trial được trích xuất đầy đủ từ installer Age of Empires Trial được Boxedwine lưu trữ tại:

https://www.boxedwine.org/wp-content/uploads/2018/02/MSAoE.exe

Gói `demo/aoe-trial-1997.dat` là ZIP lưu nguyên 129 tệp từ bản Trial đã được giải nén và sắp lại vào các thư mục DATA, SOUND, v.v. Nội dung tài nguyên, EXE và DLL **giữ nguyên**, bao gồm EULA. Mục đích sử dụng phi thương mại. `trial-eula.txt` là bản sao EULA đi kèm trong gói.

Game thuộc Microsoft / Ensemble Studios. Dự án không được các đơn vị đó bảo trợ.

## Thử bản tiếng Việt bằng file của bạn

Launcher truyền thống: https://tdumii.github.io/aoe-web-browser-vn/launcher.html?manual=1

Nguồn Việt hóa cộng đồng: https://beyeucup.aoe.vn/cach-choi-aoe/huong-dan-tai-va-cai-dat-ban-aoe-viet-hoa-chuan-tieng-viet-5752.html

Hiện các tệp `Language.dll` cộng đồng **không được phân phối qua repo**. Hạn chế TCVN3 trên Wine vẫn chưa giải quyết.

## Kiểm thử và phát triển

```sh
npm run setup
npm start
```

Mở http://localhost:8097/play.html.

Source trình giả lập dựa trên [WindowsAppPlayer](https://github.com/bassdrum4/windowsappplayer) và [Boxedwine](https://www.boxedwine.org/). Giữ nguyên các tệp LICENSE và NOTICE.md của upstream. Hiện đã có chế độ tự chọn và tải bản Trial trong `app.js`. Runtime được tải từ upstream bởi `scripts/fetch-runtime.mjs`.

Các tệp thử nghiệm cá nhân trong `local-game/` được giữ local, không commit vào repo.
