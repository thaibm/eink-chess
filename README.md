# ♟ EinkChess — [einkchess.fun](https://einkchess.fun)

> 🚀 **Powered by [SendWebToKindle.xyz](https://sendwebtokindle.xyz)** — Convert & send web articles into EPUB for Kindle:  
> · 🔒 **100% Client-Side Privacy** 
>
> · 📑 **Automated TOC** 
>
> · ✏️ **Live Preview & Edit** 
>
> · 🔗 **Merge Multiple Articles**

[**English**](#-english) | [**Tiếng Việt**](#-tiếng-việt)

---

## 🇬🇧 English

**EinkChess** is a web-based chess game specifically designed and optimized for E-ink e-readers (Amazon Kindle Basic, Paperwhite, Oasis, Scribe, Kobo, Onyx Boox, etc.).

👉 **Play now at:** [https://einkchess.fun](https://einkchess.fun)  
⚡ **Part of the ecosystem:** [SendWebToKindle.xyz](https://sendwebtokindle.xyz) — *Extract & merge multiple web articles into a single Kindle EPUB with automated TOC, live preview/editing, and 100% client-side privacy.*

### 🌟 Current Features

- **Fully Optimized for E-ink & Kindle:**
  - No animations/transitions to prevent screen flashing.
  - High-contrast monochrome user interface.
  - Clear markers for the last moved piece (`from` & `to` squares) using a distinct dashed outline.
  - **Zero-Scroll Design:** The board, header, and action buttons fit 100% into a single viewport without scrollbars.
  - Pure ES5 JavaScript compatibility for legacy browsers like the **Kindle Experimental Web Browser**.
- **Play vs Bot AI (100% Free & Offline):**
  - 5 Offline Minimax Bot levels: Level 1 (~800 ELO) to Level 5 (~1600 ELO).
  - Automatic ELO calculation and updates after each game.
  - Safe actions with **Undo** and **Resign** buttons requiring confirmation popups to prevent accidental taps.
  - Interactive setup dialog to choose game settings (side and difficulty) before starting.
- **Chess Tactics Puzzles (Lichess Database):**
  - Sourced from the Lichess Open Database spanning 31 ELO buckets from 400 to 3400.
  - Elo-adaptive puzzle matchmaking automatically delivering puzzles matching your current rating.
  - Initial skill selection onboarding (8 levels from 400 to 3100+ ELO) for players of all strengths.
  - Proportional ELO scoring system and winning streak tracking.
  - Interactive actions including **Hint**, **Skip** (with confirmation & proportional penalty), and in-progress puzzle auto-save / resume (anti-cheat).
  - Puzzle badges (`#PuzzleId · ELO`), tactical themes, and direct Lichess analysis board links.
- **Device Settings Page:**
  - A touch-friendly list of device presets (Kindle Basic, Paperwhite, Oasis, Scribe) using card layout instead of standard dropdowns (which are buggy on Kindle).
  - Auto-responsive chess board scaling tailored to the screen resolution of the selected device.
- **Minimalist Telemetry Tracking:**
  - Lightweight Beacon Ping (~500 bytes XHR) for real-time (10m), DAU, WAU, MAU, and YAU tracking.
- **Support the Author (Donate Ko-fi):**
  - Integrated high-quality [Ko-fi](https://ko-fi.com/sendwebtokindle) QR code modal for easy mobile scanning.
- **Planned Features (Future Roadmap):**
  - **Phase 2 — Advanced Cloud AI:** Integrate strong external chess engines for master level difficulty (~1500 - 2750 ELO).
  - **Phase 4 — Online PvP:** Create custom rooms with 6-character codes to play online with friends, synchronized via a lightweight polling system.
  - **Phase 5 — Detailed Stats Dashboard:** Historic ELO charts, win/loss ratios, winning streaks, and further deep optimizations for E-ink devices.

---

## 🇻🇳 Tiếng Việt

**EinkChess** là ứng dụng web chơi cờ vua được tối ưu hóa đặc biệt dành riêng cho các thiết bị màn hình mực điện tử E-ink (Amazon Kindle Basic, Paperwhite, Oasis, Scribe, Kobo, Onyx Boox, v.v.).

👉 **Chơi ngay tại:** [https://einkchess.fun](https://einkchess.fun)  
⚡ **Dự án thuộc hệ sinh thái:** [SendWebToKindle.xyz](https://sendwebtokindle.xyz) — *Gộp nhiều bài viết web thành EPUB gửi Kindle, tự động tạo mục lục (TOC), chỉnh sửa trực quan và bảo mật 100% tại trình duyệt.*

### 🌟 Tính Năng Hiện Tại

- **Tối ưu tuyệt đối cho E-ink & Kindle:**
  - Không hiệu ứng animation/transition gây chớp nháy màn hình.
  - Giao diện đơn sắc (Monochrome) tương phát cao.
  - Đánh dấu 2 ô cờ vừa di chuyển (`from` & `to`) bằng đường viền nét đứt (`dashed outline`) rõ nét.
  - **Thiết kế Zero-Scroll:** Toàn bộ bàn cờ, header và nút bấm vừa vặn 100% trong 1 khung hình, không có thanh cuộn.
  - Tương thích hoàn toàn JavaScript ES5 cho trình duyệt cũ **Kindle Experimental Web Browser**.
- **Chơi với Bot AI (Offline & Miễn phí 100%):**
  - 5 Cấp độ Bot Minimax offline: Cấp 1 (~800), Cấp 2 (~1000), Cấp 3 (~1200), Cấp 4 (~1400), Cấp 5 (~1600 ELO).
  - Tự động tính toán và cập nhật điểm ELO chuẩn sau mỗi ván cờ.
  - Hỗ trợ nút **Đi lại (Undo)** và **Đầu hàng (Resign)** có popup xác nhận tránh chạm nhầm.
  - Popup chọn cấp độ & bên cầm quân trước khi vào bàn cờ.
- **Giải Đố Cờ Thế (Tactics Puzzle Mode - Lichess Database):**
  - 31 dải ELO (từ 400 đến 3400) trích xuất từ Lichess Open Database.
  - Tự động điều chỉnh độ khó và ghép thế cờ thích ứng theo điểm **Puzzle ELO** của người chơi.
  - Setup trình độ khởi đầu (Onboarding 8 cấp độ từ 400 đến 3100+ ELO) khi mới bắt đầu hoặc chọn lại bất kỳ lúc nào.
  - Hệ thống tính điểm ELO chuẩn xác (Proportional rating system) và đếm chuỗi giải đúng (Streak).
  - Hỗ trợ nút **Gợi ý (Hint)**, nút **Bỏ qua (Skip)** có xác nhận trừ điểm, và tự động lưu/khôi phục tiến độ câu đố (chống gian lận/reload).
  - Hiển thị badge mã thế cờ (`#PuzzleId · ELO`), chủ đề chiến thuật (Themes), và link phân tích ván đấu Lichess.
- **Trang Cài Đặt Thiết Bị:**
  - Danh sách chọn dòng máy (Kindle Basic, Paperwhite, Oasis, Scribe) dạng thẻ nút chạm trực quan (không dùng dropdown `<select>` bị lỗi trên Kindle).
  - Tự động điều chỉnh kích thước bàn cờ theo độ phân giải thiết bị.
- **Tracking Active Users & Lượt truy cập:**
  - Gửi Beacon Ping siêu nhẹ (~500 bytes XHR) tự động đếm Realtime (10m), DAU (hôm nay), WAU, MAU, YAU.
- **Ủng hộ tác giả (Donate Ko-fi):**
  - Tích hợp Modal hiển thị Mã QR [Ko-fi](https://ko-fi.com/sendwebtokindle) độ nét cao để người dùng quét ủng hộ bằng điện thoại.
- **Tính Năng Dự Kiến (Lộ Trình Tương Lai):**
  - **Phase 2 — Đấu AI Cloud Nâng Cao:** Tích hợp engine mạnh mẽ từ API bên ngoài, nâng cấp độ khó lên mức Kiện tướng (~1500 - 2750 ELO).
  - **Phase 4 — PvP Online:** Cho phép tạo phòng đấu online với bạn bè bằng mã 6 ký tự, đồng bộ nước đi thời gian thực.
  - **Phase 5 — Bảng Thống Kê Chi Tiết:** Biểu đồ lịch sử ELO, thống kê tỉ lệ thắng/thua, chuỗi thắng (streak), và tiếp tục tối ưu hóa sâu trải nghiệm E-ink.

---
