# ♟ EinkChess — einkchess.fun

Ứng dụng web chơi cờ vua tối ưu hóa đặc biệt dành riêng cho máy đọc sách màn hình mực điện tử E-ink (Amazon Kindle Basic, Paperwhite, Oasis, Scribe, Kobo, Boox, v.v.).

---

## 🌟 Tính Năng Nổi Bật (Phase 1 MVP)

- **Tối ưu tuyệt đối cho E-ink & Kindle:**
  - Không hiệu ứng animation/transition gây chớp màn hình.
  - Giao diện đơn sắc (Monochrome) tương phản cao.
  - Đánh dấu 2 ô cờ vừa di chuyển (`from` & `to`) bằng đường viền nét đứt (`dashed outline`) rõ nét.
  - **Thiết kế Zero-Scroll:** Toàn bộ bàn cờ, header và nút bấm vừa vặn 100% trong 1 khung hình, không có thanh cuộn.
  - Tương thích hoàn toàn JavaScript ES5 cho trình duyệt cũ **Kindle Experimental Web Browser**.
- **Chơi với Bot AI (Offline & Miễn phí 100%):**
  - 3 Cấp độ Bot Minimax offline: Cấp 1 (~400 ELO), Cấp 2 (~800 ELO), Cấp 3 (~1200 ELO).
  - Tự động tính toán và cập nhật điểm ELO chuẩn sau mỗi ván cờ.
  - Hỗ trợ nút **Đi lại (Undo)** và **Đầu hàng (Resign)** có popup xác nhận tránh chạm nhầm.
  - Popup chọn cấp độ & bên cầm quân trước khi vào bàn cờ.
- **Trang Cài Đặt Thiết Bị:**
  - Danh sách chọn dòng máy (Kindle Basic, Paperwhite, Oasis, Scribe) dạng thẻ nút chạm trực quan (không dùng dropdown `<select>` bị lỗi trên Kindle).
  - Tự động điều chỉnh kích thước bàn cờ theo độ phân giải thiết bị.
- **Tracking Active Users & Lượt truy cập:**
  - Gửi Beacon Ping siêu nhẹ (~500 bytes XHR) tự động đếm Realtime (10m), DAU (hôm nay), WAU, MAU, YAU.
- **Ủng hộ tác giả (Donate Ko-fi):**
  - Tích hợp Modal hiển thị Mã QR Ko-fi độ nét cao để người dùng quét ủng hộ bằng điện thoại.

---

## 🚀 Hướng Dẫn Chạy Project ở Local Terminal

Do project là web tĩnh (Static Web thuần HTML/CSS/JS ES5), bạn có thể dùng bất kỳ lệnh nào dưới đây trong terminal tại thư mục project:

### Cách 1: Dùng Python 3 (Khuyên dùng - Có sẵn trên macOS)
```bash
cd /Users/thaibuiminh/Projects/eink-chess
python3 -m http.server 8080
```

### Cách 2: Dùng Node.js (npx serve hoặc http-server)
```bash
npx serve -l 8080 .
# hoặc
npx http-server -p 8080
```

### Cách 3: Dùng PHP (nếu có)
```bash
php -S 0.0.0.0:8080
```

---

## 📱 Hướng Dẫn Mở & Test trên Máy Kindle

1. Đảm bảo Kindle và máy tính đang kết nối **chung 1 mạng Wi-Fi**.
2. Tìm địa chỉ IP nội bộ của máy Mac:
   - Mở Terminal và gõ: `ipconfig getifaddr en0` (hoặc `en1`).
   - Sẽ nhận được IP dạng: `192.168.1.xxx` (hoặc `192.168.100.xxx`).
3. Mở **Experimental Web Browser** trên Kindle và truy cập:
   ```
   http://<IP-máy-tính>:8080
   ```
   *(Ví dụ: `http://192.168.100.202:8080`)*

---

## 📂 Cấu Trúc Thư Mục

```
eink-chess/
├── index.html                  # Trang chủ: Menu chế độ, Popup cài đặt ván cờ, ELO Header, Donate QR
├── settings.html               # Trang Cài đặt thiết bị Kindle (chọn dòng máy)
├── play-bot.html               # Màn hình chơi với Bot AI (Zero-scroll, Undo, Resign, ELO)
├── css/
│   └── einkchess.css           # Stylesheet tối ưu E-ink monochrome, viền nét đứt, responsive
├── js/
│   ├── chess-engine.js         # Luật cờ vua chuẩn ES5, FEN, SAN, Check/Checkmate/Stalemate
│   ├── chess-ai.js             # Minimax AI + Alpha-Beta + PST tables (Level 1-3)
│   ├── chess-board.js          # Renderer DOM gia tăng, xử lý cảm ứng, hints, flip
│   ├── chess-storage.js        # Quản lý LocalStorage, Device UUID, ELO rating, Auto-save
│   └── chess-backend.js        # Adapter gửi Telemetry Ping đếm Active Users & Quota
└── sql/
    └── schema.sql              # Database Schema PostgreSQL / Supabase (active_pings, v_traffic_stats)
```

---

## ☁️ Hướng Dẫn Deploy Lên Cloudflare Pages & Supabase

### 1. Database & Backend (Supabase Free Tier):
1. Đăng ký/đăng nhập [supabase.com](https://supabase.com) $\rightarrow$ Tạo New Project.
2. Vào tab **SQL Editor** $\rightarrow$ Dán nội dung file `sql/schema.sql` $\rightarrow$ Nhấn **Run**.
3. Copy `Project URL` và `anon public key` trong Settings > API và điền vào `js/chess-backend.js`.

### 2. Frontend Hosting (Cloudflare Pages - Unlimited Bandwidth Free):
1. Đẩy code lên GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete Phase 1 EinkChess MVP"
   git push origin main
   ```
2. Đăng nhập [dash.cloudflare.com](https://dash.cloudflare.com) $\rightarrow$ **Workers & Pages** $\rightarrow$ **Create application** $\rightarrow$ **Pages** $\rightarrow$ Chọn repo GitHub `eink-chess`.
3. Bấm **Deploy**.
4. Vào mục **Custom domains** gán tên miền `einkchess.fun` $\rightarrow$ Cloudflare tự động cấp phát chứng chỉ bảo mật HTTPS miễn phí.

---

## 📊 Hướng Dẫn Xem Thống Kê Active Users & Traffic (Tracking)

Hệ thống ghi nhận lưu lượng qua bảng `active_pings` và tổng hợp tự động qua SQL View `v_traffic_stats` (trong `sql/schema.sql`).

### Cách 1: Xem qua SQL Editor (Supabase / DBeaver / TablePlus)

1. **Xem toàn bộ chỉ số tổng hợp (Realtime 10 phút, DAU, WAU, MAU, YAU, Pageviews):**
   ```sql
   SELECT * FROM v_traffic_stats;
   ```
   * `realtime_active_10m`: Số thiết bị hoạt động trong 10 phút gần nhất.
   * `dau_today`: Daily Active Users (thiết bị duy nhất hôm nay).
   * `wau_this_week`: Weekly Active Users (tuần này).
   * `mau_this_month`: Monthly Active Users (tháng này).
   * `yau_this_year`: Yearly Active Users (năm nay).
   * `pageviews_today`: Số lượt tải trang hôm nay.
   * `total_pageviews_all_time`: Tổng lượt truy cập tích lũy.

2. **Xem 50 tương tác / ping mới nhất:**
   ```sql
   SELECT * FROM active_pings ORDER BY created_at DESC LIMIT 50;
   ```

3. **Xem thống kê phân loại theo dòng thiết bị (Kindle vs Desktop):**
   ```sql
   SELECT 
       device_type,
       COUNT(DISTINCT device_id) AS unique_devices,
       COUNT(*) AS total_interactions
   FROM active_pings
   GROUP BY device_type;
   ```

### Cách 2: Xem qua REST API (curl / Postman / Dashboard)

Supabase tự động cung cấp REST API cho View `v_traffic_stats`:
```bash
curl -X GET 'https://<PROJECT-REF>.supabase.co/rest/v1/v_traffic_stats' \
  -H "apikey: <YOUR_SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <YOUR_SUPABASE_ANON_KEY>"
```

