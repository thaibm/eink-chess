# Kế Hoạch Cập Nhật UI Cho `chess.html` Vừa Vặn Màn Hình (Tương Tự `play-bot-v2`)

> [!IMPORTANT]
> **Phạm vi công việc**: **CHỈ CẬP NHẬT GIAO DIỆN (UI & Layout Styling)**.
> Giữ nguyên 100% toàn bộ logic nghiệp vụ, engine tomitank 7.0, opening book, thuật toán AI, hệ thống đánh giá nước đi và các hàm xử lý trò chơi hiện có.

---

## 1. Mục Tiêu Giao Diện
- **Vừa khít màn hình (Zero-Scroll)**: Không xuất hiện thanh cuộn dọc/ngang trên bất kỳ màn hình nào (Kindle Basic 6", Kindle Paperwhite, máy tính bảng, điện thoại, máy tính).
- **Ngôn ngữ thiết kế tương tự `play-bot-v2.html`**:
  - Giao diện phẳng, đơn sắc (Monochrome High Contrast), viền sắc nét, không đổ bóng, không animation gây chớp mực trên E-ink.
  - Font chữ sans-serif dễ đọc trên màn hình điện tử (`Amazon Ember`, `Helvetica Neue`, sans-serif).
  - Tỉ lệ chiều cao cân đối: Dành tối đa không gian hiển thị cho bàn cờ.

---

## 2. Kế Hoạch Chia Nhỏ Cập Nhật UI (4 Phần)

### 🧩 Phần 1: Cập Nhật CSS & Bảng Màu Đơn Sắc (Styles Only)
*Mục tiêu: Đưa toàn bộ quy chuẩn thẩm mỹ của EinkChess vào thẻ `<style>` của `chess.html`.*

1. **Typography & Reset**:
   - Đổi font toàn bộ trang từ `Georgia` sang `"Amazon Ember", "Helvetica Neue", Helvetica, Arial, sans-serif`.
   - Thiết lập `overflow: hidden`, triệt tiêu tap highlight (`-webkit-tap-highlight-color: transparent`).
2. **Bảng màu Monochrome chuẩn E-ink**:
   - Ô sáng: `#ffffff`, Ô tối: `#b0b0b0` (tương phản sắc nét trên màn Kindle).
   - Ô đang chọn (`.sq.sel`): Viền đậm `outline: 3px solid #000; outline-offset: -3px; background: #d8d8d8;`.
   - Nước đi gần nhất (`.sq.lm-f`, `.sq.lm-t`): Viền nét đứt `outline: 2px dashed #000; outline-offset: -2px;`.
   - Ô vua bị chiếu (`.sq.chk`): Nền `#888888`.
3. **Thanh nút bấm & Điều khiển**:
   - Chuẩn hoá kích thước nút bấm: Chiều cao ~36-40px (thay vì 55px cồng kềnh cũ), viền `2px solid #000`, đảm bảo touch target tối thiểu 44x44px.
   - Nút trạng thái active: Đảo màu tương phản (nền đen, chữ trắng).

---

### 🧩 Phần 2: Tái Cấu Trúc Khung HTML (DOM Layout Structure)
*Mục tiêu: Sắp xếp lại thứ tự các khối giao diện theo chuẩn `play-bot-v2`, giữ nguyên toàn bộ `id` và sự kiện `onclick` để không ảnh hưởng đến code JavaScript.*

Cấu trúc trang từ trên xuống dưới:
1. **Header (1 hàng mỏng ~32px)**:
   - Logo bên trái (`EinkChess` / `ChessTwinkle`).
   - Khối chọn/hiển thị cấp độ ở giữa (`#rank-sel` / `#rank-display`).
   - Nút điều hướng bên phải (về `index.html`).
2. **Thanh Trạng Thái Tích Hợp (Status & Captured Bar ~28px)**:
   - Gom thanh trạng thái `#status` và thanh quân bị bắt `#captured-bar` thành 1 thanh ngang duy nhất:
     - Bên trái: Quân Trắng bị bắt (`#cap-white`).
     - Ở giữa: Trạng thái ván cờ / chất lượng nước đi (`#status`).
     - Bên phải: Quân Đen bị bắt (`#cap-black`).
   - *Hiệu quả: Tiết kiệm ngay gần 30-40px chiều cao màn hình so với việc chia 2 thanh riêng biệt.*
3. **Khu Vực Bàn Cờ (Board Container)**:
   - Giữ nguyên `#board-wrap`, `#board`, và lớp phủ mũi tên SVG `#coach-svg`.
   - Đặt bàn cờ căn giữa màn hình với viền bao quanh sắc nét `2px solid #000`.
4. **Thanh Thao Tác Dưới Bàn Cờ (Action Bar ~38-42px)**:
   - Chuyển toàn bộ các nút điều khiển từ đỉnh trang xuống **dưới bàn cờ** (vị trí tay người dùng cầm Kindle thuận tiện nhất):
     - Chế độ chơi bình thường: Nút **Đổi bên (`#clr-toggle`)**, **Thua/Mới (`#split-btn` / `#main-btn`)**, Nút **Xem PGN (`#history`)**.
     - Chế độ xem lại (Review mode): Nút **Nước trước / Nước sau (`#nav-toggle`)**, **Nhảy giai đoạn (`#phase-nav`)**, **Ván mới**.
5. **Modal Popup (PGN Detail & Phong Cấp)**:
   - Tối ưu giao diện hộp thoại `#detail-overlay` và `#promo-bg` theo phong cách modal hộp của `play-bot-v2` (viền đen 2px, nền trắng, nút Đóng to rõ).

---

### 🧩 Phần 3: Thuật Toán Tự Co Giãn Kích Thước Bàn Cờ (`fixBoardSize`)
*Mục tiêu: Đảm bảo giao diện tự động tính toán kích thước chuẩn từng pixel theo chiều cao & chiều rộng thực tế của màn hình.*

- **Sửa hàm `fixBoardSize()` hiện có**:
  ```javascript
  // Lấy kích thước thực tế của viewport
  var vw = window.innerWidth || document.documentElement.clientWidth || 320;
  var vh = window.innerHeight || document.documentElement.clientHeight || 480;

  // Đo chiều cao thực tế của các phần tử ngoài bàn cờ
  var headerH = headerEl ? headerEl.offsetHeight : 34;
  var statusH = statusEl ? statusEl.offsetHeight : 28;
  var actionH = actionEl ? actionEl.offsetHeight : 42;
  var safeOffset = 16; // Khoảng đệm an toàn chống tràn

  // Tính không gian khả dụng tối đa
  var availableH = vh - headerH - statusH - actionH - safeOffset;
  var availableW = vw - 12; // Cách 6px hai bên viền

  // Kích thước cạnh bàn cờ là giá trị nhỏ hơn giữa chiều rộng và chiều cao khả dụng
  var maxBoardSize = Math.min(availableW, availableH);
  var sqSize = Math.floor(maxBoardSize / 8);
  var exactBoardSize = sqSize * 8; // Số nguyên chia hết cho 8
  ```
- **Áp dụng kích thước**:
  - Gán `width` và `height` của bàn cờ `#board` = `exactBoardSize + 'px'`.
  - Gán kích thước từng ô cờ `.sq`: `width = sqSize + 'px'`, `height = sqSize + 'px'`, `lineHeight = sqSize + 'px'`.
  - Cỡ chữ quân cờ: `fontSize = Math.floor(sqSize * 0.75) + 'px'`.
  - Lớp phủ mũi tên `#coach-svg`: Cập nhật `width` và `height` = `exactBoardSize + 'px'`.
- **Căn giữa toàn bộ giao diện**: Gán `maxWidth = (exactBoardSize + 12) + 'px'` cho container chính.

---

### 🧩 Phần 4: Kiểm Tra Trực Quan & Build Sản Phẩm
*Mục tiêu: Xác nhận giao diện hiển thị hoàn hảo, không lỗi bố cục và đồng bộ bản build.*

1. **Kiểm tra Zero-Scroll trên nhiều tỉ lệ màn hình**:
   - Màn hình tỉ lệ Kindle Basic (600 x 800)
   - Màn hình Kindle Paperwhite / Oasis (1072 x 1448 / 1264 x 1680)
   - Màn hình điện thoại dọc (390 x 844)
   - Màn hình máy tính / xoay ngang (Landscape)
2. **Kiểm tra chuyển đổi trạng thái UI**:
   - Giao diện khi đang chơi ván mới.
   - Giao diện khi kết thúc ván / chuyển sang Review Mode (các nút tua nước đi hiển thị gọn gàng, bàn cờ giữ nguyên kích thước không bị giật nảy).
   - Giao diện khi mở modal PGN/Log và modal Phong cấp tốt.
3. **Thực hiện build**:
   - Chạy `npm run build` để cập nhật file vào thư mục `dist/`.

---

## Tóm Tắt Khác Biệt Giữa UI Cũ & UI Mới

| Thành phần | UI Hiện Tại (`chess.html`) | UI Mới (Theo `play-bot-v2`) |
| :--- | :--- | :--- |
| **Cuộn trang** | Bị tràn dọc trên màn hình portrait (phải cuộn) | **Zero-Scroll** (vừa khít 100% khung nhìn) |
| **Typography** | Font Serif `Georgia` cổ điển, nét dày | Font Sans-serif chuẩn Kindle (`Amazon Ember`) |
| **Controls** | Nằm ở đỉnh trang, nút cao tới 55px | Chuyển xuống **dưới bàn cờ**, nút cao 36-40px gọn gàng |
| **Status & Captured** | Tách thành 2 thanh riêng chiếm ~95px | Tích hợp thành **1 thanh duy nhất** chỉ cao ~28px |
| **Màu sắc bàn cờ** | Ô tối xám đậm `#d0d0d0`, viền dày | Ô tối xám sáng `#b0b0b0`, viền nét đứt/solid chuẩn E-ink |
| **Kích thước ô cờ** | Dùng `width: 12.5%` dễ lỗi subpixel | Dùng **kích thước pixel số nguyên** (`sqSize x sqSize`) |
| **Logic trò chơi** | Nguyên bản | **Giữ nguyên 100% không chỉnh sửa** |
