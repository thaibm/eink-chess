# ♟ EinkChess — einkchess.fun

Xây dựng ứng dụng web Chess tối ưu cho Kindle e-reader, domain **einkchess.fun**, repo riêng tại `/Users/thaibuiminh/Projects/eink-chess/`. Hỗ trợ 3 chế độ chơi: vs Bot (đa cấp độ, tính ELO), Puzzle (giải đố thích ứng ELO), và PvP online (chơi với bạn).

## User Review Required

> [!IMPORTANT]
> **Kindle Experimental Browser & E-ink UX:**
> - Không dùng animations/transitions nặng (tránh hiện tượng chớp màn e-ink liên tục).
> - **Hiển thị nước vừa đi (Last Move Indicator):** Tự động đánh dấu **cả 2 ô cờ** vừa di chuyển (**ô xuất phát `from`** và **ô đích đến `to`**, áp dụng cho cả nước đi của người chơi, bot hay đối thủ) bằng **đường viền nét đứt rõ nét (`outline: 2px dashed #000; outline-offset: -2px;`)**. Giúp người dùng nhận biết ngay lập tức bot vừa đi quân nào từ đâu đến đâu mà không cần animation.
> - Phản hồi tương tác thị giác (Visual Feedback) dùng ký hiệu đen trắng rõ nét: Icon Tick `✔` (thành công) và Icon Cross `✖` (nước đi sai).
> - Action button quan trọng như **Đầu hàng (Resign)** cần có modal xác nhận (Confirm modal) dạng text đơn giản để tránh chạm nhầm do độ trễ cảm ứng của màn hình E-ink.
> - **Điểm ELO luôn hiển thị trên Header** ở mọi trang.

> [!NOTE]
> **Đề xuất phân tách ELO (Rating System):**
> Giống như Lichess & Chess.com, kỹ năng giải thế cờ và kỹ năng đánh cờ thực chiến có thước đo khác nhau. Đề xuất:
> - **ELO Bot (Game Rating):** Khởi đầu 1200, tăng/giảm khi thắng/thua/hòa/đầu hàng Bot theo công thức Elo tiêu chuẩn.
> - **ELO Puzzle (Tactics Rating):** Khởi đầu 1200, tăng/giảm khi giải đố đúng/sai/dùng gợi ý.
> - Trên Header có thể hiển thị: `♟ EinkChess | ELO: 1200 (Puzzle: 1250)` hoặc hiển thị ELO tương ứng với mode đang chơi.

---

## Gameplay & Action Buttons Chi Tiết

### 1. Header Chung (Áp dụng cho tất cả các trang)
- **Logo / Tên:** `♟ EinkChess` (Bấm vào để về Trang chủ)
- **ELO Badge:** Hiển thị nổi bật `★ ELO: 1200` (hoặc `Bot ELO: 1200 | Puzzle ELO: 1250`)
- **Nav Button:** [🏠 Home / Menu]

---

### 2. Chế độ Chơi với Bot (`play-bot.html`)

#### Action Buttons:
- **[↩ Đi lại (Undo)]**: Lùi lại 2 nước (nước của máy + nước của người chơi). Cho phép thử lại nước cờ.
- **[🏳 Đầu hàng (Resign)]**: Hiện popup xác nhận: *"Bạn có chắc chắn muốn đầu hàng?"*
  - Nếu xác nhận: Kết thúc ván, xử Thua cho người chơi, trừ ELO, hiện popup kết quả.
- **[🔄 Xoay bàn (Flip)]**: Đổi góc nhìn quân Trắng / Đen.
- **[💡 Gợi ý (Hints: On/Off)]**: Bật/tắt chấm hiển thị các ô hợp lệ khi chọn quân.
- **[🆕 Ván mới (New Game)]**: Bắt đầu lại ván mới với setting tùy chọn.

#### Cơ chế ELO vs Bot:
- Mỗi level bot có ELO định danh (Level 1: 400, Level 2: 800, Level 3: 1200, ... Level 8: 2750).
- Sau khi ván kết thúc (Chiếu hết, Đầu hàng, Hết giờ, Hòa cờ):
  - **Thắng:** Cộng ELO $\Delta = K \times (1 - E)$ (thắng bot ELO cao cộng nhiều, bot thấp cộng ít).
  - **Thua / Đầu hàng:** Trừ ELO $\Delta = K \times (0 - E)$.
  - **Hòa:** Điều chỉnh nhẹ theo chênh lệch trình độ.
- Popup kết thúc ván hiển thị: Kết quả, ELO thay đổi (Ví dụ: `+15 → 1215`), nút `[Chơi tiếp]` và `[Trang chủ]`.

---

### 3. Chế độ Giải đố / Cờ thế (`puzzles.html`)

#### Gameplay Flow chi tiết:
1. **Khởi tạo & Ghép câu đố:**
   - Hệ thống tự động chọn câu đố trong database có rating tương đương ELO Puzzle của người dùng (trong khoảng $\pm 100$ ELO).
   - Bàn cờ hiển thị thế trận FEN.
   - Bot tự động đi nước cờ đầu tiên (nước cờ của đối thủ tạo ra thế cờ cần giải).
   - Status bar thông báo: *"Bên [Trắng/Đen] đi — Tìm nước cờ tối ưu nhất!"*

2. **Người dùng thực hiện nước đi:**
   - **Trường hợp ĐI ĐÚNG:**
     - Hiển thị ký hiệu `✔` lớn / icon tick rõ nét trên status bar: *"Chính xác! ✔"*.
     - Nếu câu đố còn các nước tiếp theo: Máy tự động phản hồi nước cờ đáp lại trong kịch bản puzzle sau 0.5s, người dùng tiếp tục giải nước tiếp theo.
     - Nếu đã hoàn thành toàn bộ chuỗi nước đi:
       - Hiển thị popup chiến thắng: *"Giải đố thành công! 🎉"*.
       - **Tính điểm ELO Puzzle:**
         - Nếu **KHÔNG dùng gợi ý**: Cộng điểm ELO (`+X ELO`), tăng chuỗi Streak (`Streak: 5`).
         - Nếu **CÓ dùng gợi ý**: `+0 ELO`, giữ nguyên rating.
       - Buttons trong popup: **[🧩 Câu tiếp theo]** | **[🏠 Trang chủ]**.
   - **Trường hợp ĐI SAI:**
     - Hiển thị ký hiệu `✖` / icon cross: *"Chưa chính xác! ✖"*.
     - Tự động **Undo** nước vừa đi sai về vị trí trước đó để người chơi suy nghĩ lại.
     - Đánh dấu trạng thái puzzle hiện tại là *Đã có lỗi* (khi hoàn thành sau đó sẽ chỉ nhận tối đa `+0 ELO`).
     - Cho phép người chơi thử lại không giới hạn hoặc bấm xem đáp án.

3. **Action Buttons trong màn Giải đố:**
   - **[💡 Gợi ý (Hint)]**: 
     - Nhấp lần 1: Highlight ô quân cờ cần đi (Piece hint).
     - Nhấp lần 2: Highlight ô đích đến (Target hint).
     - Ghi nhận trạng thái *"Đã dùng gợi ý"* (Kết quả khi giải xong sẽ là `+0 ELO`).
   - **[👁 Xem đáp án (Show Solution)]**:
     - Tự động đi từng nước chính xác trên bàn cờ.
     - Xử Thất bại câu đố: **Trừ ELO Puzzle** (`-Y ELO`), Reset streak về 0.
     - Hiện nút **[🧩 Câu tiếp theo]** | **[🏠 Trang chủ]**.
   - **[⏭ Bỏ qua (Skip)]**: Chuyển sang puzzle khác (coi như không hoàn thành / trừ điểm nhẹ nếu muốn).
   - **[🔄 Thử lại từ đầu (Retry)]**: Đặt lại thế cờ ban đầu.

---

### 4. Chế độ Chơi với bạn (`play-friend.html`)

#### Action Buttons:
- **[🏳 Đầu hàng (Resign)]**: Hiện popup xác nhận. Khi xác nhận, gửi trạng thái `resigned` lên Supabase RPC, đối phương nhận thông báo thắng ngay trong chu kỳ poll tiếp theo.
- **[🤝 Xin hòa (Offer Draw)]**: Gửi tín hiệu đề nghị hòa cờ tới đối phương.
- **[📋 Copy Code / Link]**: Sao chép mã phòng hoặc URL mời `einkchess.fun/play-friend.html?join=XXXXXX`.
- **[🚪 Rời phòng (Leave Game)]**: Rời khỏi phòng chơi (ván cờ vẫn được lưu).

---

## Open Questions & Clarifications

1. **Rating khởi đầu:** ELO khởi đầu mặc định là `1200` (chuẩn quốc tế). Có cho phép người dùng tự chọn mức ban đầu (Mới chơi 800 / Trung bình 1200 / Cao thủ 1600) trong màn setup lần đầu không?
2. **Supabase PvP:** Sẽ cấu hình kết nối thông qua file config/storage khi triển khai Phase 4.

---

## Proposed Changes

### Kiến trúc tổng quan

```
eink-chess/                             ← Repo: /Users/thaibuiminh/Projects/eink-chess/
├── index.html                          ← Trang chủ: Device setup, Mode selection, Stats, ELO display
├── play-bot.html                       ← Chơi với bot: Undo, Resign, ELO update
├── puzzles.html                        ← Giải đố: Tick/Cross feedback, Hint, Auto-undo, Puzzle ELO
├── play-friend.html                    ← Chơi với bạn: Resign, Draw offer, Room Code
├── css/
│   └── einkchess.css                   ← Stylesheet tối ưu E-ink (Đen-Trắng tương phản cao)
├── js/
│   ├── chess-engine.js                 ← Core engine, FEN parser, Move generator
│   ├── chess-ai.js                     ← Local Minimax AI (Level 1-3)
│   ├── chess-api-client.js             ← Chess-API.com REST client (Level 4-8)
│   ├── chess-board.js                  ← Board renderer (Incremental DOM, Tick/Cross indicators)
│   ├── chess-puzzles.js                ← Puzzle Manager (ELO matching, Hint logic, Solution check)
│   ├── chess-pvp.js                    ← Supabase PvP client
│   ├── chess-storage.js                ← Quản lý ELO (Bot & Puzzle), Stats, Auto-save
│   └── chess-i18n.js                   ← Đa ngôn ngữ VI / EN
├── data/
│   └── puzzles.json                    ← 500 Puzzles bundle (Phân bổ rating 600-2600)
├── build/
│   └── build-puzzles.js                ← Script tải và trích xuất puzzles từ Lichess CSV
└── sql/
    └── schema.sql                      ← Cấu trúc DB và PostgreSQL RPC cho PvP
```

---

## Phân pha triển khai chi tiết

### Phase 1 — MVP: Core Engine + Board + Chơi với Bot (Local AI) + ELO Header

> **Mục tiêu:** Bản phát hành đầu tiên chơi hoàn chỉnh với Bot trên Kindle, có nút Undo, Resign và hệ thống tính ELO Header.

**Deliverables:**
- `index.html`: Giao diện khởi đầu chọn thiết bị Kindle, hiển thị ELO Header, menu chế độ.
- `play-bot.html`: Bàn cờ với action buttons: **[Undo]**, **[Đầu hàng (Resign)]**, **[Xoay bàn]**, **[Gợi ý]**, **[Ván mới]**.
- `css/einkchess.css`: Bảng màu tương phản cao (quân trắng outline đen, quân đen solid black, ô trắng/xám), kích thước responsive theo thiết bị Kindle. Cài đặt viền nét đứt cho 2 ô nước vừa đi (`.sq.last-from, .sq.last-to { outline: 2px dashed #000; outline-offset: -2px; }`).
- `js/chess-engine.js`: Engine đầy đủ luật cờ vua, FEN, SAN, kiểm tra chiếu hết, hòa cờ.
- `js/chess-ai.js`: Minimax + Alpha-Beta AI (3 cấp độ: ~400, ~800, ~1200 ELO).
- `js/chess-board.js`: Render DOM gia tăng (Incremental), hiển thị nhãn nước đi, confirm dialogs.
- `js/chess-storage.js`: Lưu cấu hình máy, ván cờ dở dang, điểm ELO Bot.

**Verification Checklist Phase 1:**
- [ ] Chơi hết ván cờ với bot mượt mà, không giật lag.
- [ ] Nút **Undo** lùi 2 nước chính xác.
- [ ] Nút **Đầu hàng** hiện modal xác nhận -> xác nhận thì xử thua, trừ ELO.
- [ ] Điểm ELO trên Header cập nhật ngay sau khi kết thúc ván.
- [ ] Tắt trình duyệt mở lại -> tự động hỏi tiếp tục ván cũ.

---

### Phase 2 — Online AI: Chess-API.com (Level 4-8 Kiện Tướng)

> **Mục tiêu:** Mở rộng lên 8 cấp độ, tích hợp Stockfish 18 NNUE online cho cấp độ cao.

**Deliverables:**
- `js/chess-api-client.js`: Gửi FEN qua `POST https://chess-api.com/v1`, xử lý timeout và fallback.
- `play-bot.html`: Selector 8 cấp độ (~400 đến ~2750 ELO), gắn icon ☁ cho cấp độ cần mạng.
- Xử lý trạng thái "Đang suy nghĩ..." mượt mà trên e-ink.

**Verification Checklist Phase 2:**
- [ ] Level 4-8 đánh chuẩn xác nước đi của Stockfish.
- [ ] Thắng/thua bot cấp cao cộng/trừ ELO đúng công thức.
- [ ] Xử lý mất mạng/lỗi API: thông báo thân thiện, cho phép retry.

---

### Phase 3 — Puzzle Mode (Giải Đố Thích Ứng ELO)

> **Mục tiêu:** Chế độ luyện cờ thế với 500 câu đố Lichess, phản hồi Tick/Cross, gợi ý thông minh và hệ thống ELO Puzzle.

**Deliverables:**
- `puzzles.html`: Giao diện giải đố chuyên dụng. Action buttons: **[Gợi ý]**, **[Xem đáp án]**, **[Thử lại]**, **[Câu tiếp]**.
- `js/chess-puzzles.js`: Quản lý logic giải đố, kiểm tra từng bước đi, cấp gợi ý 2 cấp độ (quân cờ / ô đến).
- `data/puzzles.json`: Bộ dữ liệu 500 puzzles phân chia theo thang điểm ELO.
- `build/build-puzzles.js`: Script Node.js lọc và xuất dữ liệu puzzle từ Lichess database.
- Cập nhật `chess-storage.js`: Lưu Puzzle ELO, Chuỗi thắng (Streak), Tỷ lệ giải đúng.

**Verification Checklist Phase 3:**
- [ ] Nước đi đúng hiện icon `✔`, bot phản hồi nước đối phó tự động.
- [ ] Nước đi sai hiện icon `✖`, tự động undo để người chơi đi lại.
- [ ] Giải đúng không gợi ý -> Cộng Puzzle ELO, tăng streak.
- [ ] Dùng gợi ý -> Giải xong cộng `+0 ELO`.
- [ ] Bấm xem đáp án / bỏ cuộc -> Trừ Puzzle ELO, reset streak.
- [ ] Popup hoàn thành hiển thị ELO mới và 2 nút [Câu tiếp theo] / [Trang chủ].

---

### Phase 4 — PvP Online (Chơi với bạn qua Game Code)

> **Mục tiêu:** Chơi cờ 2 người từ xa qua mã phòng 6 ký tự trên Supabase.

**Deliverables:**
- `play-friend.html`: Giao diện tạo phòng, nhập mã, hiển thị mã phòng to rõ.
- Action buttons: **[Đầu hàng]**, **[Xin hòa]**, **[Sao chép link/mã]**, **[Rời phòng]**.
- `js/chess-pvp.js`: Client giao tiếp Supabase PostgreSQL RPC (Polling 8s).
- `sql/schema.sql`: Script khởi tạo database và RPC function trên Supabase.

**Verification Checklist Phase 4:**
- [ ] Tạo phòng -> Tạo mã code 6 ký tự.
- [ ] Người thứ 2 nhập mã -> Vào bàn cờ đồng bộ.
- [ ] Nút Đầu hàng gửi thông báo tức thì cho đối thủ.
- [ ] Polling 8s cập nhật nước cờ mà không gây reload toàn bộ trang.

---

### Phase 5 — Song Ngữ VI/EN + Thống Kê Chi Tiết + Polish

> **Mục tiêu:** Hoàn thiện giao diện song ngữ, bảng thống kê và tối ưu trải nghiệm đọc trên e-ink.

**Deliverables:**
- `js/chess-i18n.js`: Hệ thống dịch song ngữ Tiếng Việt & Tiếng Anh.
- Màn hình thống kê chi tiết trên `index.html`: Lịch sử đấu, tỷ lệ thắng, biểu đồ ELO, kỷ lục streak.
- Tối ưu SEO, meta tags, favicon chuẩn e-ink.

---

## Kế hoạch Triển khai (Bắt đầu với Phase 1)

Tôi sẽ tiến hành triển khai **Phase 1 (MVP)** trước:
1. Tạo thư mục cấu trúc trong `/Users/thaibuiminh/Projects/eink-chess/`.
2. Viết `css/einkchess.css` và `js/chess-engine.js`.
3. Viết `js/chess-ai.js` (Local Minimax Level 1-3).
4. Viết `js/chess-storage.js` (Lưu game, lưu ELO Bot/Puzzle).
5. Xây dựng `js/chess-board.js`, `index.html` và `play-bot.html` (đầy đủ các nút Undo, Resign modal, ELO Header, viền nét đứt cho 2 ô nước vừa đi).
6. Kiểm tra tương thích ES5 cho trình duyệt Kindle.
