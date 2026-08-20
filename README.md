# ♟ EinkChess — [einkchess.fun](https://einkchess.fun)

> 🚀 **Powered by [SendWebToKindle.xyz](https://sendwebtokindle.xyz)** — Convert & send web articles into EPUB for Kindle:  
> · 🔒 **100% Client-Side Privacy**  
> · 📑 **Automated TOC**  
> · ✏️ **Live Preview & Edit**  
> · 🔗 **Merge Multiple Articles**

[**English**](#-english) | [**Tiếng Việt**](#-tiếng-việt)

---

## 🇬🇧 English

**EinkChess** is a web-based chess game specifically designed and optimized for E-ink e-readers (Amazon Kindle Basic, Paperwhite, Oasis, Scribe, Kobo, Onyx Boox, etc.).

👉 **Play now at:** [https://einkchess.fun](https://einkchess.fun)  
⚡ **Part of the ecosystem:** [SendWebToKindle.xyz](https://sendwebtokindle.xyz) — *Extract & merge multiple web articles into a single Kindle EPUB with automated TOC, live preview/editing, and 100% client-side privacy.*

### 🌟 Current Features

- **Fully Optimized for E-ink & Kindle:**
  - **Zero Animations & High Contrast:** Pure monochrome palette without animations, transitions, or blurs to eliminate screen flashing.
  - **Dashed Last Move Indicator:** Outlines both `from` and `to` squares (`outline: 2px dashed #000;`) for immediate move identification.
  - **Zero-Scroll & Zero-Config Auto-Scaling:** Automatically detects screen dimensions and scales the board to maximum size within a single viewport without manual configuration or scrollbars.
  - **Touch & Fast-Input Handling:** Large touch targets (min 44x44px), tap highlight removal, and click delegation optimized for old WebKit browsers.
  - **Physical Screen Refresh:** Dedicated **Refresh** button triggering a 200ms clean white flash to eliminate E-ink ghosting.
  - **Incremental DOM Patching:** Updates only modified squares to utilize fast partial screen refreshes.
  - **Legacy ES5 Compatibility:** 100% pure ES5 JavaScript tailored for the **Kindle Experimental Web Browser**.

- **Play vs Bot AI (100% Free & Offline):**
  - 5 Offline Minimax Bot levels: Level 1 (~800 ELO) to Level 5 (~1600 ELO) with Quiescence search on higher tiers.
  - Automatic ELO calculation and instant rating updates after each game.
  - **Safe Actions:** Confirmation modals on **Resign** to prevent accidental forfeits, plus multi-step **Undo**.
  - **Interactive Pawn Promotion:** Clean modal to choose Queen, Rook, Bishop, or Knight, with a Cancel button.
  - **Auto-Save & Resume Game State:** Automatically saves the game to `localStorage`; seamlessly resume in-progress games after reload or from the Home card.
  - **3-Column Status Bar:** Real-time turn indicator, check alerts, and captured piece counts sorted by value.

- **Chess Tactics Puzzles (Lichess Database):**
  - Extracted from the Lichess Open Database spanning 31 ELO buckets (from 400 to 3400 ELO).
  - **Elo-Adaptive Matchmaking:** Automatically delivers puzzles matching your current rating.
  - **Puzzle Journey & Tier Progression:** 8 unlockable progression tiers (from Lvl 1 ~400 ELO to Lvl 8 ~3100+ ELO) that automatically unlock as your ELO increases.
  - **Proportional ELO Scoring & Streak Tracking:** Dynamic rating adjustments based on difficulty, winning streak tracking, and personal best records.
  - **Interactive Gameplay Actions:** **Hint** (with proportional ELO deduction confirmation), **Skip** (with rating penalty confirmation), and **Next**.
  - **Anti-Cheat & State Persistence:** In-progress puzzles automatically persist to prevent cheating or skipping without penalty on page reload.
  - **Puzzle Meta & Player Stats Modal:** Quick view of puzzle rating, player side, level progress bar, current streak, and best streak. Tactical themes are revealed upon puzzle completion.

- **Multi-Language Support (i18n):**
  - Instant toggle between **English (EN - Default)** and **Tiếng Việt (VI)** directly from the persistent header without losing game progress.

- **Public Traffic Stats Page ([stats.html](https://einkchess.fun/stats.html)):**
  - Lightweight Beacon Ping (~500 bytes XHR) collecting privacy-friendly telemetry.
  - Dedicated E-ink public dashboard showing Realtime active users (10m, 30m, 60m), DAU, WAU, MAU, YAU, and Pageviews.

- **Support the Author (Donation):**
  - High-contrast modal displaying dual QR codes for **Ko-fi** (International) and **MoMo** (Vietnam).

### 🚀 Planned Features (Future Roadmap)

- **Phase 2 — Advanced Cloud AI:** Integrate Stockfish 18 via external cloud API for master-level play (Levels 6–10: ~1800 to ~2750 ELO, 3 free games/day quota).
- **Phase 4 — Online PvP (Play a Friend):** Realtime 1v1 multiplayer via 6-character room codes with lightweight 8-second XHR polling.
- **Phase 5 — Personal Historic Stats Dashboard:** Detailed player performance analytics, historic ELO progression charts, and win/loss breakdown.

---

## 🇻🇳 Tiếng Việt

**EinkChess** là ứng dụng web chơi cờ vua được thiết kế và tối ưu hóa đặc biệt dành riêng cho các thiết bị màn hình mực điện tử E-ink (Amazon Kindle Basic, Paperwhite, Oasis, Scribe, Kobo, Onyx Boox, v.v.).

👉 **Chơi ngay tại:** [https://einkchess.fun](https://einkchess.fun)  
⚡ **Dự án thuộc hệ sinh thái:** [SendWebToKindle.xyz](https://sendwebtokindle.xyz) — *Gộp nhiều bài viết web thành EPUB gửi Kindle, tự động tạo mục lục (TOC), chỉnh sửa trực quan và bảo mật 100% tại trình duyệt.*

### 🌟 Tính Năng Hiện Tại

- **Tối ưu tuyệt đối cho E-ink & Kindle:**
  - **Không hiệu ứng & Tương phản cao:** Giao diện đơn sắc (Monochrome) loại bỏ toàn bộ animation/transition/đổ bóng mờ để chống chớp nháy màn hình e-ink.
  - **Đánh dấu nước đi vừa thực hiện:** Viền nét đứt (`outline: 2px dashed #000;`) nổi bật trên cả 2 ô (`from` & `to`) giúp nhận diện nước đi tức thì mà không cần animation.
  - **Thiết kế Zero-Scroll & Zero-Config:** Tự động nhận diện độ phân giải màn hình (Auto-Scaling Layout) để mở rộng bàn cờ tối đa vừa khít trong 1 khung nhìn, không cần cài đặt thủ công và không có thanh cuộn.
  - **Tối ưu cảm ứng:** Nút bấm và ô cờ đạt chuẩn tối thiểu 44x44px, loại bỏ tap highlight và áp dụng cơ chế touch delegation chuẩn xác cho trình duyệt cũ.
  - **Làm mới màn hình vật lý (Refresh):** Nút **Làm mới** tạo chớp trắng 200ms xóa hoàn toàn hiện tượng bóng mờ (ghosting) trên màn hình E-ink.
  - **Render DOM gia tăng (Incremental Patching):** Chỉ cập nhật các ô cờ có thay đổi thực tế để tận dụng chế độ fast partial refresh của Kindle.
  - **Tương thích ES5 thuần:** Hoạt động mượt mà trên **Kindle Experimental Web Browser**.

- **Chơi với Bot AI (Offline & Miễn phí 100%):**
  - 5 Cấp độ Bot Minimax offline: Cấp 1 (~800), Cấp 2 (~1000), Cấp 3 (~1200), Cấp 4 (~1400), Cấp 5 (~1600 ELO) tích hợp Quiescence search ở cấp cao.
  - Tự động tính toán và cập nhật điểm ELO chuẩn sau mỗi ván đấu.
  - **Thao tác an toàn:** Popup xác nhận khi **Đầu hàng (Resign)** tránh chạm nhầm, hỗ trợ nút **Đi lại (Undo)** nhiều bước.
  - **Phong cấp Tốt tương tác:** Modal chọn phong cấp trực quan (Hậu, Xe, Tượng, Mã) kèm nút Hủy.
  - **Tự động lưu & Khôi phục ván đấu (Auto-Save & Resume):** Tự động lưu tiến độ vào `localStorage`; dễ dàng chơi tiếp ván dở khi tải lại trang hoặc bấm `Tiếp tục ván đấu` từ Trang chủ.
  - **Thanh trạng thái 3 cột:** Báo lượt đi, cảnh báo Chiếu và hiển thị chi tiết danh sách quân cờ đã bị ăn của hai bên.

- **Giải Đố Cờ Thế (Tactics Puzzle Mode - Lichess Database):**
  - 31 dải ELO (từ 400 đến 3400) trích xuất từ Lichess Open Database.
  - **Ghép câu đố thích ứng (Elo-Adaptive):** Tự động phân phối câu đố phù hợp chính xác với mức điểm Puzzle ELO hiện tại của người chơi.
  - **Hành trình Giải Cờ Thế (Puzzle Journey):** Lộ trình 8 cấp bậc (từ Cấp 1 ~400 ELO đến Cấp 8 ~3100+ ELO) với cơ chế tự động mở khóa khi leo điểm ELO.
  - **Tính điểm ELO chuẩn xác & Đếm chuỗi:** Hệ thống tính điểm Proportional theo độ khó, đếm chuỗi thắng (Streak) và ghi nhận kỷ lục chuỗi cao nhất (Best Streak).
  - **Hành động tương tác:** **Gợi ý (Hint)** có popup xác nhận trừ điểm, **Bỏ qua (Skip)** có xác nhận trừ điểm, và **Tiếp theo (Next)**.
  - **Chống gian lận & Lưu trạng thái:** Tự động lưu trạng thái câu đố đang giải để chống reload đổi câu đố hay xóa lỗi sai.
  - **Modal Thông tin Thế cờ & Thống kê:** Hiển thị ELO thế cờ, bên cầm quân, thanh tiến trình cấp độ, chuỗi hiện tại và kỷ lục. Chủ đề đòn thế (Themes) hiển thị khi giải xong câu đố.

- **Đa Ngôn Ngữ Song Ngữ (i18n):**
  - Chuyển đổi tức thì giữa **Tiếng Anh (EN - Mặc định)** và **Tiếng Việt (VI)** trên Persistent Header mà không làm mất trạng thái ván cờ.

- **Trang Thống Kê Traffic Công Khai ([stats.html](https://einkchess.fun/stats.html)):**
  - Thu thập telemetry siêu nhẹ qua Beacon Ping (~500 bytes XHR).
  - Trang thống kê tối ưu cho E-ink hiển thị trực tiếp Realtime (10m, 30m, 60m), DAU, WAU, MAU, YAU và tổng lượt xem trang (Pageviews).

- **Ủng Hộ Tác Giả (Donation):**
  - Modal hiển thị song song 2 mã QR **Ko-fi** (Quốc tế) và **MoMo** (Việt Nam) độ tương phản cao.

### 🚀 Tính Năng Dự Kiến (Lộ Trình Tương Lai)

- **Phase 2 — Đấu AI Cloud Nâng Cao:** Tích hợp engine Stockfish 18 từ API bên ngoài, nâng cấp độ khó lên mức Kiện tướng (Level 6–10: ~1800 đến ~2750 ELO, miễn phí 3 trận/ngày).
- **Phase 4 — PvP Online (Chơi với bạn bè):** Tạo phòng thi đấu 1v1 thời gian thực qua Game Code 6 ký tự với cơ chế đồng bộ polling 8s qua XHR nhẹ.
- **Phase 5 — Bảng Thống Kê Cá Nhân Chuyên Sâu:** Biểu đồ lịch sử phát triển ELO, thống kê chi tiết tỷ lệ thắng/thua và phân tích thành tích cá nhân.

---
