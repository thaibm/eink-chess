# ♟ EinkChess — Kế hoạch Triển khai (einkchess.fun)

Xây dựng ứng dụng web Chess tối ưu cho Kindle e-reader và các thiết bị màn hình E-ink. Hỗ trợ 3 chế độ chơi: vs Bot (8 cấp độ, ELO), Puzzle (giải đố thích ứng ELO), và PvP online (chơi với bạn qua mã code).

## User Review Required

> [!IMPORTANT]
> **Điểm mấu chốt kiến trúc & Quy tắc vận hành:**
> 1. **Phase 1 MVP bao gồm:**
>    - Core Engine + Board (ES5, tối ưu E-ink với viền nét đứt cho 2 ô vừa đi).
>    - Bot Level 1-3 (Minimax offline, **hoàn toàn miễn phí & không giới hạn**).
>    - **Active User & Traffic Tracking:** Đếm Realtime, DAU, WAU, MAU, YAU và tổng pageviews qua Beacon Ping siêu nhẹ (~500 bytes).
>    - **Donate Ko-fi:** Nút donate và Modal hiển thị Mã QR rõ nét cho người dùng quét bằng điện thoại.
> 2. **Hạn mức Free hàng ngày (Daily Quota - Reset 00:00):**
>    - 🤖 **Bot Level 1-3:** Unlimited Free.
>    - ☁ **Bot Level 4-8 (Cloud Stockfish):** 3 ván/ngày.
>    - 🧩 **Puzzle (Cờ thế):** 3 câu đố/ngày.
>    - 👥 **PvP (Chơi với bạn):** 3 trận/ngày.
> 3. **Kiến trúc Portable Backend:** Tách riêng tầng API Adapter (`js/chess-backend.js`) và Database chuẩn PostgreSQL (`sql/schema.sql`). Hoạt động ngay trên Supabase Free tier và sẵn sàng di chuyển sang VPS riêng khi scale up chỉ cần đổi 1 dòng URL cấu hình.

---

## Cấu trúc Dự án (Architecture Overview)

```
eink-chess/                             ← Repo root
├── index.html                          ← Trang chủ: Device setup, ELO Header, Menu, Donate Ko-fi QR, Ping tracking
├── play-bot.html                       ← Chơi với bot: Level 1-3 (Unlimited), ELO, Undo, Resign, Donate QR
├── puzzles.html                        ← Giải đố: 500 Puzzles Lichess, Tick/Cross feedback, Quota 3/ngày
├── play-friend.html                    ← Chơi với bạn: Tạo/nhập mã phòng, Quota 3/ngày
├── css/
│   └── einkchess.css                   ← Giao diện Đen-Trắng tương phản cao tối ưu E-ink (Dashed outline)
├── js/
│   ├── chess-engine.js                 ← Engine cờ vua thuần ES5, FEN, SAN, Move validation
│   ├── chess-ai.js                     ← Local Minimax AI (Level 1-3, chạy offline, free)
│   ├── chess-api-client.js             ← Chess-API.com REST client (Level 4-8 Stockfish)
│   ├── chess-board.js                  ← Board renderer (Incremental DOM, Last move dashed outline)
│   ├── chess-puzzles.js                ← Puzzle Manager (ELO matching, Hints, Solution check)
│   ├── chess-pvp.js                    ← PvP client (Sync trạng thái phòng và nước đi)
│   ├── chess-storage.js                ← Quản lý LocalStorage (Device ID, ELO, Local Quota cache)
│   ├── chess-backend.js                ← [PHASE 1] Portable Backend Adapter (Active Ping, Traffic Count, Quota)
│   └── chess-i18n.js                   ← Đa ngôn ngữ VI / EN
├── data/
│   └── puzzles.json                    ← 500 Puzzles bundle (Phân bổ rating 600-2600)
├── build/
│   └── build-puzzles.js                ← Script lọc và nén 500 puzzles từ Lichess CSV
└── sql/
    └── schema.sql                      ← [PHASE 1] PostgreSQL Schema (active_pings, page_views, user_quotas, chess_games)
```

---

## Thiết kế Chi tiết: Tracking & Quota & Portable Backend

### 1. Database Schema Chuẩn (PostgreSQL) — Chạy được trên Supabase hoặc Custom VPS
```sql
-- 1. Bảng ghi nhận Lượt truy cập & Active Users (DAU/WAU/MAU/YAU/Realtime)
CREATE TABLE IF NOT EXISTS active_pings (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL,
    device_type VARCHAR(32) DEFAULT 'kindle',
    lang VARCHAR(8) DEFAULT 'vi',
    action_type VARCHAR(32) DEFAULT 'ping', -- 'ping', 'pageview', 'play_bot', 'play_puzzle', 'play_pvp'
    page_url VARCHAR(64) DEFAULT '/',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_active_pings_created_at ON active_pings(created_at);
CREATE INDEX idx_active_pings_device ON active_pings(device_id, created_at);

-- View thống kê nhanh Realtime, DAU, WAU, MAU, YAU
CREATE OR REPLACE VIEW v_traffic_stats AS
SELECT
    COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '10 minutes' THEN device_id END) AS realtime_active_10m,
    COUNT(DISTINCT CASE WHEN created_at >= CURRENT_DATE THEN device_id END) AS dau_today,
    COUNT(DISTINCT CASE WHEN created_at >= DATE_TRUNC('week', CURRENT_DATE) THEN device_id END) AS wau_this_week,
    COUNT(DISTINCT CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN device_id END) AS mau_this_month,
    COUNT(DISTINCT CASE WHEN created_at >= DATE_TRUNC('year', CURRENT_DATE) THEN device_id END) AS yau_this_year,
    COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) AS pageviews_today,
    COUNT(*) AS total_pageviews_all_time
FROM active_pings;

-- 2. Bảng Quản lý Quota Ngày & Trạng thái VIP / Donate
CREATE TABLE IF NOT EXISTS user_quotas (
    device_id VARCHAR(64) NOT NULL,
    quota_date DATE NOT NULL DEFAULT CURRENT_DATE,
    bot_cloud_count INT DEFAULT 0,
    puzzle_count INT DEFAULT 0,
    pvp_count INT DEFAULT 0,
    is_vip BOOLEAN DEFAULT FALSE,
    vip_expire_at TIMESTAMPTZ,
    PRIMARY KEY (device_id, quota_date)
);

-- 3. Bảng Phòng cờ PvP Online
CREATE TABLE IF NOT EXISTS chess_games (
    game_code VARCHAR(8) PRIMARY KEY,
    white_pid VARCHAR(64) NOT NULL,
    black_pid VARCHAR(64),
    fen VARCHAR(128) NOT NULL,
    last_move VARCHAR(16),
    status VARCHAR(32) DEFAULT 'waiting', -- 'waiting', 'active', 'finished'
    turn VARCHAR(2) DEFAULT 'w',
    result VARCHAR(32),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Tầng Portable Adapter (`js/chess-backend.js`)
File này đóng vai trò cầu nối duy nhất giữa Client và Server (chuẩn ES5 tương thích Kindle):
- Cấu hình chỉ cần 1 dòng: `var BACKEND_URL = 'https://your-supabase-url.supabase.co' || 'https://api.einkchess.fun';`
- Cung cấp:
  - `sendPing(action, page)`: Gửi heartbeat đếm Active User & lượt xem trang.
  - `checkQuota(mode)`: Kiểm tra xem thiết bị còn lượt chơi trong ngày không.
  - `consumeQuota(mode)`: Tăng biến đếm quota khi bắt đầu ván.
  - `getPvPState(code)` & `submitPvPMove(code, moveData)`: Đồng bộ ván đấu.

### 3. Hiển thị QR Donate Ko-fi trên Kindle (Tối ưu E-ink)
- Nút bấm `[☕ Ủng hộ (Donate)]` trên thanh Header và Footer.
- Modal đơn giản, tương phản cao:
  - Tiêu đề: `☕ Ủng hộ EinkChess trên Ko-fi`
  - Hình ảnh: Mã QR tĩnh sắc nét đen-trắng dẫn tới trang Ko-fi.
  - URL text rõ nét: `ko-fi.com/thaibm` (hoặc username của bạn).
  - Lời nhắn cảm ơn và giải thích giúp duy trì hệ thống.

---

## Lộ trình Triển khai 5 Giai đoạn

### Phase 1 — MVP: Core Engine + Board + Bot 1-3 + Active Tracking + Ko-fi Donate + ELO Header
- Xây dựng `js/chess-engine.js`: Toàn bộ luật cờ vua, FEN, SAN, Move Generator (ES5).
- Xây dựng `js/chess-ai.js`: Minimax + Alpha-Beta AI (Level 1: 400, Level 2: 800, Level 3: 1200) — **Chạy offline, hoàn toàn miễn phí & không giới hạn**.
- Xây dựng `css/einkchess.css`: Layout responsive cho các dòng máy Kindle, đường viền nét đứt (`dashed outline`) cho 2 ô nước vừa đi.
- Xây dựng `js/chess-storage.js`: Sinh & lưu `device_id` (UUID), ELO rating, Auto-save.
- Xây dựng `sql/schema.sql`: Khởi tạo bảng tracking & views thống kê DAU/WAU/MAU/YAU.
- Xây dựng `js/chess-backend.js`: Adapter gửi ping tracking & sync quota.
- Xây dựng `js/chess-board.js`: Render DOM gia tăng (Incremental), Action buttons: Undo, Resign confirm modal, Flip, New game.
- Xây dựng `index.html` và `play-bot.html`: Giao diện chính kèm Header ELO, nút Donate và Modal Mã QR Ko-fi.

### Phase 2 — Online AI: Level 4-8 Kiện Tướng + Quota 3 ván/ngày
- Xây dựng `js/chess-api-client.js`: Kết nối Chess-API.com (Stockfish 18 NNUE).
- Tích hợp Quota 3 trận Cloud AI/ngày (kiểm tra `localStorage` và backend).
- Xử lý thông báo khi hết lượt Cloud: gợi ý chơi tiếp Bot Level 1-3 hoặc Ko-fi donate.

### Phase 3 — Puzzle Mode (Giải Đố Thích Ứng ELO) + Quota 3 câu/ngày
- Lọc và đóng gói 500 câu đố Lichess vào `data/puzzles.json`.
- Xây dựng `puzzles.html` và `js/chess-puzzles.js` (Tick/Cross feedback, Hint 2 cấp độ, Puzzle ELO).
- Quota 3 câu đố miễn phí/ngày.

### Phase 4 — PvP Online + Portable Backend Adapter
- Cập nhật module PvP trong `js/chess-backend.js` và `sql/schema.sql`.
- Xây dựng `play-friend.html` và `js/chess-pvp.js` (Tạo/nhập mã 6 ký tự, Polling 8s, Quota 3 trận/ngày).

### Phase 5 — Song Ngữ VI/EN, Dashboard Thống Kê & Polish Toàn Diện
- Xây dựng `js/chess-i18n.js` (Song ngữ Tiếng Việt / Tiếng Anh).
- Dashboard thống kê trên `index.html`, kiểm tra tương thích trình duyệt Kindle thực tế.

---

## Kế hoạch Triển khai Phase 1 (MVP)

Chúng ta sẽ bắt đầu thực hiện **Phase 1** ngay lập tức:
1. Thiết lập cấu trúc thư mục repo `eink-chess/`.
2. Tạo file `sql/schema.sql` (bảng tracking active_pings, views DAU/WAU/MAU/YAU, user_quotas).
3. Tạo file `css/einkchess.css` (hệ màu monochrome, dashed outline, responsive Kindle).
4. Tạo `js/chess-engine.js` (Core chess engine ES5).
5. Tạo `js/chess-ai.js` (Local Minimax AI Level 1-3).
6. Tạo `js/chess-storage.js` (Lưu device UUID, ELO, auto-save).
7. Tạo `js/chess-backend.js` (Adapter gửi ping telemetry siêu nhẹ & quota).
8. Tạo `js/chess-board.js` (DOM incremental, visual feedback).
9. Tạo `index.html` và `play-bot.html` (đầy đủ Donate Ko-fi QR modal, ELO Header, Action buttons).
