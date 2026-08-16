# 🛠 EinkChess — Hướng Dẫn Phát Triển (Development Guide)

Tài liệu này hướng dẫn cách chạy thử nghiệm local, cấu trúc thư mục, triển khai (deployment) và xem thống kê lượng người dùng cho dự án EinkChess.

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

## ☁️ Hướng Dẫn Deploy Lên Cloud & Supabase

### 1. Database & Backend (Supabase Free Tier):
1. Đăng ký/đăng nhập [supabase.com](https://supabase.com) $\rightarrow$ Tạo New Project.
2. Vào tab **SQL Editor** $\rightarrow$ Dán nội dung file `sql/schema.sql` $\rightarrow$ Nhấn **Run**.
3. Cấu hình Supabase credentials cho Frontend:
   - **Cách trực tiếp:** Copy `Project URL` và `anon public key` trong Settings > API của Supabase và điền trực tiếp vào `js/chess-backend.js` (nếu deploy tĩnh hoàn toàn).
   - **Cách qua Env Var (Khuyên dùng khi deploy Vercel):** Cấu hình các biến môi trường trên nền tảng hosting, script build sẽ tự động nhúng vào code trước khi xuất bản.

### 2. Frontend Hosting:

#### Cách 1: Deploy lên GitHub Pages (Đơn Giản Nhất)
Vì EinkChess là một trang web tĩnh (Static Web), bạn có thể deploy lên GitHub Pages hoàn toàn miễn phí chỉ trong vài bước:
1. Đảm bảo mã nguồn đã được push lên GitHub (ví dụ: `git push origin main`).
2. Truy cập vào Repository của bạn trên GitHub (ví dụ: `https://github.com/thaibm/eink-chess`).
3. Chọn tab **Settings** ở menu trên cùng của repository.
4. Ở sidebar bên trái, chọn **Pages** (trong mục *Code and automation*).
5. Trong phần **Build and deployment**:
   - **Source**: Chọn `Deploy from a branch`.
   - **Branch**: Chọn `main` (hoặc nhánh chính của bạn) và thư mục `/ (root)`.
6. Nhấp vào nút **Save**.
7. Đợi 1-2 phút để GitHub chạy Action và deploy, sau đó tải lại trang. Bạn sẽ thấy một liên kết hiển thị ở đầu phần cài đặt Pages (ví dụ: `https://thaibm.github.io/eink-chess/`).

#### Cách 2: Deploy lên Cloudflare Pages (Không giới hạn băng thông & Tên miền riêng)
1. Đăng nhập vào [dash.cloudflare.com](https://dash.cloudflare.com) $\rightarrow$ **Workers & Pages** $\rightarrow$ **Create application** $\rightarrow$ **Pages** $\rightarrow$ Kết nối và chọn repo GitHub `eink-chess`.
2. Bấm **Deploy**.
3. (Tùy chọn) Vào mục **Custom domains** để gán tên miền của bạn (ví dụ: `einkchess.fun`), Cloudflare sẽ tự động cấp SSL miễn phí.

#### Cách 3: Deploy lên Vercel (Hỗ trợ Bảo Mật Credentials qua Env Var & Mua Domain Rẻ)
Vercel là một nền tảng tuyệt vời để lưu trữ và quản lý tên miền riêng của bạn một cách tối ưu.
1. Truy cập [vercel.com](https://vercel.com) $\rightarrow$ **Add New...** $\rightarrow$ **Project** $\rightarrow$ Kết nối và chọn repo GitHub `eink-chess`.
2. Cấu hình Build Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Cấu hình Biến môi trường (Environment Variables) để bảo mật Supabase credentials (không bị lộ trên Git):
   - Mở rộng phần **Environment Variables**.
   - Thêm biến `SUPABASE_URL` = `[URL dự án Supabase của bạn]` (ví dụ: `https://xyz.supabase.co`).
   - Thêm biến `SUPABASE_ANON_KEY` = `[Mã anon public key của bạn]`.
4. Nhấn **Deploy**. Quá trình build sẽ chạy script Node.js nhúng tự động thông tin này vào file `js/chess-backend.js` trước khi triển khai.
5. (Tùy chọn) Vào project của bạn trên Vercel $\rightarrow$ **Settings** $\rightarrow$ **Domains** để gán và quản lý tên miền riêng.

---

## 📊 Hướng Dẫn Xem Thống Kê Active Users & Traffic (Tracking)

Hệ thống ghi nhận lưu lượng qua bảng `active_pings` và tổng hợp tự động qua SQL View `v_traffic_stats` (trong `sql/schema.sql`).

### Cách 1: Xem qua trang web hoặc SQL Editor

1. **Xem qua giao diện web của EinkChess:**
   * Truy cập trực tiếp trang `/stats.html` (có liên kết tại chân trang Trang chủ `index.html`) để xem báo cáo thống kê trực quan.

2. **Xem qua SQL Editor (Supabase / DBeaver / TablePlus):**
   ```sql
   SELECT * FROM v_traffic_stats;
   ```
   * `realtime_active_10m`: Số thiết bị hoạt động trong 10 phút gần nhất.
   * `realtime_active_30m`: Số thiết bị hoạt động trong 30 phút gần nhất.
   * `realtime_active_60m`: Số thiết bị hoạt động trong 60 phút (1 giờ) gần nhất.
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
