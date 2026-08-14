# 📋 TÀI LIỆU ĐẶC TẢ YÊU CẦU DỰ ÁN EINKCHESS (einkchess.fun)

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

- **Tên dự án:** EinkChess
- **Tên miền dự kiến:** `einkchess.fun`
- **Mục tiêu:** Xây dựng ứng dụng web chơi cờ vua (Chess Web App) được thiết kế và tối ưu hóa đặc biệt dành riêng cho các thiết bị máy đọc sách màn hình E-ink (chủ đạo là Amazon Kindle).
- **Thiết bị hỗ trợ:**
  - Amazon Kindle Basic (6", 600×800)
  - Amazon Kindle Paperwhite (6" 1072×1448 & 6.8" 1236×1648)
  - Amazon Kindle Oasis (7", 1264×1680)
  - Amazon Kindle Scribe (10.2", 1860×2480)
  - Các thiết bị E-reader khác (Kobo, Boox, v.v.) có trình duyệt web.

---

## 2. NGUYÊN TẮC THIẾT KẾ & GIAO DIỆN CHO E-INK (UI/UX)

### 2.1. Bảng màu & Tương phản (High Contrast Monochrome)
- **Tông màu chủ đạo:** Đen - Trắng - Xám tương phản cao, tối ưu tuyệt đối cho màn hình mực điện tử E-ink.
- **Bàn cờ:**
  - Ô sáng (Light squares): Màu trắng / xám rất nhạt (`#f0f0f0`).
  - Ô tối (Dark squares): Màu xám (`#888888` hoặc `#2a2a2a`), không dùng màu đen tuyền để tránh làm chìm quân cờ đen.
- **Quân cờ:**
  - Quân Trắng (White pieces): Nền trắng, viền ngoài đen 2px, ký hiệu quân cờ nét đen (outline glyph: ♔, ♕, ♖, ♗, ♘, ♙).
  - Quân Đen (Black pieces): Nền đen (hoặc viền đen nổi bật), ký hiệu quân cờ đặc màu trắng/đen (filled glyph: ♚, ♛, ♜, ♝, ♞, ♟).
- **Phản hồi tương tác thị giác (Visual Feedback):**
  - **Không dùng animations / CSS transitions / gradient / box-shadow mờ / opacity animation** (tránh làm màn e-ink bị chớp nháy làm mới liên tục).
  - **Ô được chọn (Selected square):** Đường viền nét liền đen đậm 3px (`outline: 3px solid #000; outline-offset: -3px;`).
  - **Nước đi hợp lệ (Hints on):** Vòng tròn viền xám hoặc inset ring nét đơn giản.
  - **Nước đi vừa thực hiện (Last move indicator):** Đánh dấu rõ ràng **cả 2 ô cờ** liên quan đến nước đi vừa thực hiện (gồm **ô xuất phát `from`** và **ô đích đến `to`**, áp dụng cho cả nước đi của người dùng, của Bot hoặc đối thủ) bằng **đường viền nét đứt đen/xám đậm rõ nét (`outline: 2px dashed #000; outline-offset: -2px;`)**. Điều này giúp người chơi trên màn hình E-ink ngay lập tức nhận diện được quân cờ vừa di chuyển từ đâu đến đâu mà không cần animation.
  - **Ký hiệu trạng thái:** Icon Tick lớn `✔` (chính xác/thành công) và Icon Cross lớn `✖` (sai/lỗi).

### 2.2. Header chung (Persistent Header)
- Xuất hiện trên tất cả các trang / chế độ:
  - Logo / Tiêu đề: `♟ EinkChess` (Nhấp vào để quay về Trang chủ).
  - **Hiển thị điểm ELO:** Hiển thị nổi bật trên thanh tiêu đề: `★ ELO: 1200` (hoặc `Bot ELO: 1200 | Puzzle ELO: 1250`).
  - Nút điều hướng: `[🏠 Trang chủ / Menu]`.

### 2.3. Khởi tạo & Cấu hình thiết bị
- Ở lần đầu truy cập, hiển thị màn hình cài đặt:
  - Chọn dòng máy Kindle (hoặc bấm Tự động phát hiện theo kích thước màn hình).
  - Chọn ngôn ngữ mặc định (Tiếng Việt / Tiếng Anh).
- Thông tin cấu hình được lưu vào `localStorage`, chỉ cần thiết lập 1 lần, các lần sau tự động áp dụng giao diện tối ưu theo độ phân giải của máy.

---

## 3. RÀNG BUỘC KỸ THUẬT & TƯƠNG THÍCH (TECHNICAL CONSTRAINTS)

### 3.1. Trình duyệt Kindle Experimental Browser
- Trình duyệt trên máy đọc sách Kindle là **Experimental Web Browser** (dựa trên WebKit cũ), **không phải** Silk Browser (Silk chỉ có trên Fire Tablet).
- **Ràng buộc:**
  - **Không hỗ trợ WebAssembly (WASM)** $\rightarrow$ Không thể chạy trực tiếp Stockfish WASM trên client Kindle.
  - **Không hỗ trợ Web Workers** $\rightarrow$ Tính toán AI nặng trên client sẽ khóa UI.
  - **JavaScript Engine hạn chế:** Bắt buộc tuân thủ **ES5** (không dùng `const`, `let`, arrow functions `() => {}`, template literals `` ` `` , `class`, `async/await`, `fetch` nếu không có fallback XHR).
  - **CSS:** Không hỗ trợ CSS `clamp()`, `aspect-ratio`, flexbox `gap`. Cần sử dụng fallback truyền thống (`padding-bottom: 100%` cho hình vuông, tính `fontSize` bằng JavaScript).
  - **Touch:** Loại bỏ tap highlight (`-webkit-tap-highlight-color: transparent`) để tránh sinh thêm chu kỳ chớp màn hình e-ink khi chạm.

### 3.2. Kỹ thuật Render tối ưu E-ink (Incremental DOM Patching)
- Mỗi lần DOM thay đổi gây thay đổi pixel sẽ kích hoạt e-ink refresh.
- Thay vì vẽ lại toàn bộ 64 ô cờ khi có nước đi mới, engine chỉ so sánh diff và cập nhật đúng 2-4 phần tử DOM (`<div>`) của các ô có thay đổi (ô xuất phát, ô đích, ô bắt quân qua đường/nhập thành).
- Giúp Kindle tận dụng chế độ làm mới một phần (fast partial refresh), không bị giật/chớp toàn màn hình.

---

## 4. CHI TIẾT CÁC CHẾ ĐỘ CHƠI (GAME MODES)

```
                       ┌─────────────────────────┐
                       │     ♟ EinkChess Home    │
                       └────────────┬────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│ 🤖 Chơi với Bot │        │   🧩 Giải Đố    │        │ 👥 Chơi với Bạn │
│  (8 Cấp độ ELO) │        │ (Lichess Puzzle)│        │  (PvP qua Code) │
└─────────────────┘        └─────────────────┘        └─────────────────┘
```

---

### 4.1. Chế độ Chơi với Bot (Play vs Computer)

#### A. Cấu hình trước ván:
- Chọn bên cầm quân: Trắng / Đen.
- Chọn cấp độ khó (8 Levels):

| Cấp độ | Tên gọi | ELO Ước tính | Cơ chế xử lý | Yêu cầu mạng |
| :--- | :--- | :--- | :--- | :--- |
| **Level 1** | Người mới (Beginner) | ~400 | Local JS Minimax (Depth 1, Noise cao) | Offline |
| **Level 2** | Dễ (Casual) | ~800 | Local JS Minimax (Depth 2, Noise vừa) | Offline |
| **Level 3** | Câu lạc bộ (Club) | ~1200 | Local JS Minimax (Depth 3, Quiescence) | Offline |
| **Level 4** | Trung cấp (Intermediate) | ~1500 | Chess-API.com (Stockfish 18, Depth 4) | Cần Internet (☁) |
| **Level 5** | Nâng cao (Advanced) | ~1800 | Chess-API.com (Stockfish 18, Depth 7) | Cần Internet (☁) |
| **Level 6** | Chuyên gia (Expert) | ~2000 | Chess-API.com (Stockfish 18, Depth 10) | Cần Internet (☁) |
| **Level 7** | Kiện tướng (Master) | ~2350 | Chess-API.com (Stockfish 18, Depth 12) | Cần Internet (☁) |
| **Level 8** | Đại kiện tướng (Grandmaster)| ~2750 | Chess-API.com (Stockfish 18, Depth 18) | Cần Internet (☁) |

#### B. Action Buttons trên màn hình:
- **`[↩ Đi lại (Undo)]`**: Lùi lại 2 nước cờ gần nhất (nước đi của bot và nước đi của người chơi).
- **`[🏳 Đầu hàng (Resign)]`**:
  - Mở popup xác nhận: *"Bạn có chắc chắn muốn đầu hàng?"*
  - Nếu xác nhận: Kết thúc ván, xử Thua cho người chơi, trừ điểm ELO Bot.
- **`[🔄 Xoay bàn (Flip)]`**: Đảo chiều góc nhìn bàn cờ 180 độ.
- **`[💡 Gợi ý (Hints: Bật/Tắt)]`**: Bật/tắt hiển thị các ô đi hợp lệ khi chạm vào quân cờ.
- **`[🆕 Ván mới (New Game)]`**: Bắt đầu lại ván cờ mới.

#### C. Quy tắc tính ELO & Kết thúc ván:
- Điểm ELO cập nhật theo công thức Elo chuẩn dựa trên kết quả ván đấu và mức chênh lệch trình độ giữa người chơi và Bot:
  - **Thắng:** $+ \Delta ELO$ (Thắng bot ELO cao cộng nhiều, bot thấp cộng ít).
  - **Thua / Đầu hàng:** $- \Delta ELO$.
  - **Hòa:** Điều chỉnh nhẹ theo kỳ vọng.
- **Popup kết quả ván đấu:** Hiển thị thắng/thua/hòa, lý do (Chiếu hết, Đầu hàng, Stalemate, 50-move rule), điểm ELO thay đổi (Ví dụ: `+16 → 1216`), kèm 2 nút bấm: `[Chơi tiếp]` và `[Trang chủ]`.
- **Auto-save:** Tự động lưu thế cờ sau mỗi nước đi vào `localStorage`, khi mở lại trình duyệt sẽ hiển thị thông báo tiếp tục ván cũ.

---

### 4.2. Chế độ Giải Đố / Cờ Thế (Puzzles)

#### A. Nguồn dữ liệu & Ghép câu đố:
- Sử dụng cơ sở dữ liệu **500+ Puzzles** trích xuất từ **Lichess Puzzle Database (CC0 License)**.
- Phân bổ dải ELO câu đố rộng từ 600 đến 2600+ (Đủ mọi cấp từ dễ đến siêu khó, đòn phối hợp, chiếu hết 1-3 nước, tàn cuộc, ghim quân, bắt đôi).
- **Cơ chế ghép thế cờ:** Hệ thống tự động chọn câu đố có rating xấp xỉ điểm **Puzzle ELO** hiện tại của người dùng (trong phạm vi $\pm 100$ ELO).

#### B. Quy trình Gameplay (Flow):
1. Tải thế cờ FEN lên bàn cờ.
2. Bot tự động đi nước cờ đầu tiên (nước cờ của đối thủ tạo ra thế cờ cần giải).
3. Người dùng thực hiện nước đi giải đố:
   - **TRƯỜNG HỢP ĐI ĐÚNG:**
     - Status bar hiển thị nhãn tick lớn `✔`: *"Chính xác! ✔"*.
     - Nếu câu đố còn các nước tiếp theo trong kịch bản: Bot tự động đi nước phản đòn sau 0.5s, người chơi tiếp tục giải nước kế tiếp.
     - Nếu đã hoàn thành toàn bộ chuỗi nước đi:
       - Hiển thị popup: *"Giải đố thành công! 🎉"*.
       - Cập nhật điểm ELO và chuỗi giải đúng (Streak).
       - Cung cấp 2 nút bấm: **`[🧩 Câu tiếp theo]`** và **`[🏠 Trang chủ]`**.
   - **TRƯỜNG HỢP ĐI SAI:**
     - Status bar hiển thị nhãn cross lớn `✖`: *"Chưa chính xác! ✖"*.
     - **Tự động Undo** nước vừa đi sai về vị trí trước đó để người chơi suy nghĩ lại.
     - Đánh dấu trạng thái câu đố là *Đã có lỗi* (nếu giải xong sau đó sẽ chỉ nhận tối đa $+0\text{ ELO}$).

#### C. Quy tắc tính điểm ELO Puzzle:
- **Giải đúng ngay từ đầu (không dùng gợi ý):** Cộng điểm ELO Puzzle ($+X\text{ ELO}$), tăng chuỗi Streak liên tiếp.
- **Giải đúng nhưng có bấm Gợi ý:** $+0\text{ ELO}$ (không tăng không giảm), bảo lưu chuỗi streak.
- **Bấm Xem đáp án / Bỏ cuộc:** Trừ điểm ELO Puzzle ($-Y\text{ ELO}$), Reset chuỗi Streak về 0.

#### D. Action Buttons trong màn Giải đố:
- **`[💡 Gợi ý (Hint)]`**:
  - Nhấp lần 1: Highlight ô chứa quân cờ cần di chuyển.
  - Nhấp lần 2: Highlight ô đích cần đi tới.
  - Đánh dấu trạng thái *"Đã dùng gợi ý"*.
- **`[👁 Xem đáp án (Show Solution)]`**: Tự động biểu diễn lần lượt các nước đi chính xác trên bàn cờ. Tính là Thất bại $\rightarrow$ Trừ ELO.
- **`[⏭ Bỏ qua (Skip)]`**: Bỏ qua chuyển sang câu đố khác.
- **`[🔄 Thử lại (Retry)]`**: Đặt lại thế cờ ban đầu của câu đố.

---

### 4.3. Chế độ Chơi với Bạn Bè (Play a Friend - PvP Online)

#### A. Kiến trúc kết nối:
- Backend: **Supabase** (PostgreSQL RPC + Polling chu kỳ 8 giây qua XHR thuần, không dùng WebSocket nặng).
- Nhận diện người chơi: UUID ngẫu nhiên tạo một lần và lưu trong `localStorage`.

#### B. Quy trình tạo & tham gia phòng:
- **Người tạo phòng:** Nhập tên (tùy chọn) $\rightarrow$ Bấm `[Tạo phòng]` $\rightarrow$ Nhận Game Code gồm 6 ký tự (VD: `CK8N2A`). Người tạo mặc định cầm quân Trắng.
- **Người tham gia:** Nhập Game Code nhận được $\rightarrow$ Bấm `[Tham gia]`. Người tham gia mặc định cầm quân Đen (bàn cờ tự động xoay góc nhìn).
- **Link mời trực tiếp:** Hỗ trợ link định dạng `einkchess.fun/play-friend.html?join=CK8N2A`.

#### C. Action Buttons & Tính năng trong phòng:
- **`[🏳 Đầu hàng (Resign)]`**: Mở modal xác nhận. Khi xác nhận, gửi trạng thái `resigned` lên server, đối phương nhận thông báo thắng ngay trong chu kỳ poll tiếp theo.
- **`[🤝 Xin hòa (Offer Draw)]`**: Gửi tín hiệu đề nghị hòa cờ tới đối phương.
- **`[📋 Copy Code / Link]`**: Sao chép mã phòng hoặc link mời.
- **`[🚪 Rời phòng (Leave Game)]`**: Tạm rời khỏi phòng (ván cờ vẫn được bảo lưu trên server).
- **Nhận diện trạng thái đối thủ:**
  - `In game`: Đang online trong vòng 30s.
  - `Away`: Không tương tác từ 30s đến 2 phút.
  - `Left`: Đã bấm Rời phòng hoặc mất kết nối quá 2 phút.

---

## 5. HỆ THỐNG ĐA NGÔN NGỮ & LƯU TRỮ (I18N & STORAGE)

### 5.1. Đa ngôn ngữ (i18n)
- Hỗ trợ 2 ngôn ngữ: **Tiếng Việt (VI)** và **Tiếng Anh (EN)**.
- Cơ chế:
  - Tự động nhận diện theo `navigator.language`.
  - Cho phép người dùng chuyển đổi thủ công tại Trang chủ / Menu.
  - Sử dụng từ điển JavaScript thuần (Object literal) dung lượng cực nhẹ (~5KB), không dùng thư viện ngoài.

### 5.2. Quản lý lưu trữ LocalStorage
- Mọi thao tác đều được bọc trong `try / catch` an toàn.
- Dữ liệu lưu trữ gồm:
  - `einkchess_device`: Dòng máy Kindle đã chọn.
  - `einkchess_lang`: Ngôn ngữ giao diện (`vi` / `en`).
  - `einkchess_bot_elo`: Điểm ELO đấu với Bot (Mặc định: 1200).
  - `einkchess_puzzle_elo`: Điểm ELO giải đố (Mặc định: 1200).
  - `einkchess_puzzle_streak`: Chuỗi câu đố giải đúng liên tiếp hiện tại và kỷ lục.
  - `einkchess_saved_game`: Trạng thái bàn cờ, lịch sử nước đi ván đang chơi dở với Bot.
  - `einkchess_pid`: UUID định danh thiết bị cho chế độ PvP.
  - `einkchess_pvp_code`: Mã phòng PvP đang hoạt động.

---

## 6. LỘ TRÌNH TRIỂN KHAI THEO GIAI ĐOẠN (5 PHASES)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: MVP - Core Engine, Board, Chơi với Bot (Local AI 1-3), ELO   │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Online AI - Tích hợp Chess-API.com (Level 4-8 Kiện tướng)    │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Puzzle Mode - 500 Puzzles Lichess, Gợi ý, Tick/Cross, ELO     │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 4: PvP Online - Chơi với bạn qua Game Code (Supabase Polling)   │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 5: Song ngữ VI/EN, Thống kê cá nhân Dashboard, Polish SEO       │
└────────────────────────────────────────────────────────────────────────┘
```

### Phase 1 — MVP (Local Engine, Bot AI Level 1-3, Action Buttons, ELO)
- Xây dựng `js/chess-engine.js`: Luật cờ vua hoàn chỉnh, FEN parser/serializer, SAN notation, kiểm tra chiếu hết / hòa cờ.
- Xây dựng `js/chess-ai.js`: Minimax + Alpha-Beta pruning + PST table (Level 1: ~400, Level 2: ~800, Level 3: ~1200).
- Xây dựng `css/einkchess.css`: Hệ màu đơn sắc tương phản cao, layout responsive theo các dòng Kindle. Cài đặt viền nét đứt cho 2 ô nước vừa đi (`.sq.last-from, .sq.last-to { outline: 2px dashed #000; outline-offset: -2px; }`).
- Xây dựng `js/chess-board.js`: Render DOM gia tăng (Incremental), xử lý touch, nút Undo, modal Đầu hàng.
- Xây dựng `index.html` và `play-bot.html`: Giao diện trang chủ và màn hình chơi với bot có ELO Header.
- Xây dựng `js/chess-storage.js`: Quản lý lưu game và tính toán ELO cơ bản.

### Phase 2 — Online AI (Level 4-8 Kiện Tướng)
- Xây dựng `js/chess-api-client.js`: Giao tiếp API `POST https://chess-api.com/v1` qua XHR.
- Tích hợp 5 cấp độ nâng cao (~1500 đến ~2750 ELO), độ sâu tính toán depth 4 đến 18.
- Xử lý trạng thái "Đang suy nghĩ..." và cơ chế tự động fallback về local engine khi mất mạng.

### Phase 3 — Puzzle Mode (Giải Đố Thích Ứng ELO)
- Xây dựng `build/build-puzzles.js`: Script trích xuất và lọc 500 câu đố chất lượng cao từ Lichess database ra `data/puzzles.json`.
- Xây dựng `puzzles.html` và `js/chess-puzzles.js`: Giao diện giải đố, cơ chế so khớp nước đi, biểu tượng Tick/Cross, gợi ý 2 cấp độ và hệ thống tính ELO Puzzle.

### Phase 4 — PvP Online (Chơi với bạn)
- Thiết lập bảng `chess_games` và các PostgreSQL RPC functions trên Supabase (`sql/schema.sql`).
- Xây dựng `play-friend.html` và `js/chess-pvp.js`: Tạo phòng mã 6 ký tự, kết nối đồng bộ nước đi bằng polling 8s, nút Đầu hàng / Xin hòa.

### Phase 5 — Song Ngữ, Dashboard Thống Kê & Tối Ưu Hoàn Thiện
- Xây dựng `js/chess-i18n.js`: Hệ thống dịch song ngữ Tiếng Việt & Tiếng Anh.
- Màn hình thống kê chi tiết trên `index.html`: Lịch sử đấu, tỷ lệ thắng, biểu đồ ELO, kỷ lục streak.
- Kiểm tra toàn diện tương thích ES5, tối ưu tốc độ phản hồi trên thiết bị Kindle thực tế.
