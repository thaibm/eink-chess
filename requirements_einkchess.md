# 📋 TÀI LIỆU ĐẶC TẢ YÊU CẦU DỰ ÁN EINKCHESS (einkchess.fun)

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

- **Tên dự án:** EinkChess
- **Tên miền dự kiến:** `einkchess.fun`
- **Mục tiêu:** Xây dựng ứng dụng web chơi cờ vua (Chess Web App) được thiết kế và tối ưu hóa đặc biệt dành riêng cho các thiết bị máy đọc sách màn hình E-ink (chủ đạo là Amazon Kindle).
- **Thiết bị hỗ trợ:** Hỗ trợ mọi thiết bị có trình duyệt web (Kindle cũ, Paperwhite, Oasis, Scribe, Kobo, Boox, Máy tính, iPad, v.v.). Giao diện sử dụng thuật toán Auto-Scaling để tự động tính toán kích thước màn hình `innerWidth/innerHeight` và hiển thị bàn cờ lớn nhất có thể mà **không bao giờ bị cuộn trang (no-scroll)**.

---

## 2. NGUYÊN TẮC THIẾT KẾ & GIAO DIỆN CHO E-INK (UI/UX)

### 2.1. Bảng màu & Tương phản (High Contrast Monochrome)
- **Tông màu chủ đạo:** Đen - Trắng - Xám tương phản cao, tối ưu tuyệt đối cho màn hình mực điện tử E-ink.
- **Bàn cờ:**
  - Ô sáng (Light squares): Màu trắng / xám rất nhạt (`#f0f0f0`).
  - Ô tối (Dark squares): Màu xám (`#888888` hoặc `#2a2a2a`), không dùng màu đen tuyền để tránh làm chìm quân cờ đen.
- **Quân cờ:**
  - Quân Trắng (White pieces): Sử dụng ký hiệu quân cờ nét đen rỗng ruột (outline glyph: ♔, ♕, ♖, ♗, ♘, ♙) màu đen, không sử dụng đổ bóng (text-shadow) hoặc viền phụ để đảm bảo độ sắc nét cao nhất.
  - Quân Đen (Black pieces): Sử dụng ký hiệu quân cờ đặc màu đen (filled glyph: ♚, ♛, ♜, ♝, ♞, ♟) màu đen, không sử dụng đổ bóng (text-shadow) hoặc viền phụ.
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

### 2.3. Khởi tạo & Cấu hình giao diện (Zero-Config)
- Ứng dụng hoạt động theo cơ chế **Zero-Config** (Không cần cài đặt thông số thiết bị thủ công).
- Ngay khi tải trang, hệ thống lập tức tự động nhận diện tỷ lệ màn hình (Auto-Scaling Layout) để vẽ bàn cờ vừa khít thiết bị. 
- Có thể tùy chọn ngôn ngữ mặc định (Tiếng Việt / Tiếng Anh) nếu cần. Thông tin cấu hình được lưu vào `localStorage`.

### 2.4. Kích thước tương tác (Touch Targets)
- Các nút bấm, menu, và ô cờ phải có kích thước đủ lớn (tối thiểu 44x44px) để dễ dàng thao tác bằng ngón tay trên màn hình E-ink.
- Cần có khoảng cách (margin/padding) hợp lý giữa các nút bấm để tránh chạm nhầm, do màn hình E-ink có độ trễ cảm ứng và phản hồi hiển thị chậm.

### 2.5. Bố cục Trang chủ (Home Screen 3-Mode Balanced Layout)
- Trang chủ hiển thị trực quan 3 thẻ chế độ chơi chính:
  1. **Chơi với Máy (Bot AI)**: Minimax offline 3 cấp độ, tính điểm ELO Bot.
  2. **Giải Đố Cờ Thế (Puzzles)**: 500+ bài tập chiến thuật Lichess thích ứng ELO Puzzle.
  3. **Chơi với Bạn Bè (PvP Online)**: Phòng đấu qua Game Code 6 ký tự kết nối realtime.
- **Tỉ lệ phân bổ:** Mỗi khối chế độ chiếm xấp xỉ ~30% không gian dọc màn hình (`min-height: 27-30vh`), tăng kích thước chữ (Title 17-18px, Desc 14px, Button 15-16px) và touch target (nút bấm chính min 44-48px) giúp người dùng Kindle dễ nhìn và chạm chính xác tuyệt đối mà không cần cuộn trang.

---

## 3. RÀNG BUỘC KỸ THUẬT & TƯƠNG THÍCH (TECHNICAL CONSTRAINTS)

### 3.1. Trình duyệt Kindle Experimental Browser
- Trình duyệt trên máy đọc sách Kindle là **Experimental Web Browser** (dựa trên WebKit cũ), **không phải** Silk Browser (Silk chỉ có trên Fire Tablet).
- **Ràng buộc:**
  - **Không hỗ trợ WebAssembly (WASM)** $\rightarrow$ Không thể chạy trực tiếp Stockfish WASM trên client Kindle.
  - **Không hỗ trợ Web Workers** $\rightarrow$ Tính toán AI nặng trên client sẽ khóa UI.
  - **JavaScript Engine hạn chế:** Bắt buộc tuân thủ **ES5** (không dùng `const`, `let`, arrow functions `() => {}`, template literals `` ` `` , `class`, `async/await`, `fetch` nếu không có fallback XHR).
  - **CSS:** Không hỗ trợ CSS `clamp()`, `aspect-ratio`, flexbox `gap`. Bàn cờ sử dụng layout table-cell đồng nhất (`display: table-row`, `display: table-cell; height: 12.5%`) kết hợp tính toán kích thước bàn cờ và `fontSize` quân cờ qua JavaScript để tránh lỗi `position: absolute` bị tính sai chiều cao (lệch top) trên WebKit cũ.
  - **Touch:** Loại bỏ tap highlight (`-webkit-tap-highlight-color: transparent`) để tránh sinh thêm chu kỳ chớp màn hình e-ink khi chạm.

### 3.2. Kỹ thuật Render tối ưu E-ink (Incremental DOM Patching)
- Mỗi lần DOM thay đổi gây thay đổi pixel sẽ kích hoạt e-ink refresh.
- Thay vì vẽ lại toàn bộ 64 ô cờ khi có nước đi mới, engine chỉ so sánh diff và cập nhật đúng 2-4 phần tử DOM (`<div>`) của các ô có thay đổi (ô xuất phát, ô đích, ô bắt quân qua đường/nhập thành).
- Giúp Kindle tận dụng chế độ làm mới một phần (fast partial refresh), không bị giật/chớp toàn màn hình.

### 3.3. Quản lý Cache (Cache Busting)
- Trình duyệt trên các thiết bị E-ink (đặc biệt là Kindle) thường cache file tĩnh (CSS, JS) rất mạnh và người dùng cực kỳ khó thao tác xóa cache thủ công.
- **Ràng buộc:** Bắt buộc phải gắn thêm tham số phiên bản (version query parameter, ví dụ `?v=1.0.1` hoặc timestamp `?v=20240815`) vào tất cả các thẻ `<script src="...">` và `<link rel="stylesheet" href="...">`.
- Mỗi khi chỉnh sửa bất kỳ file CSS hay JS nào, **phải cập nhật lại mã version này** trong các file HTML tương ứng để đảm bảo thiết bị tải phiên bản mới nhất.

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
| **Level 1** | Người mới (Beginner) | ~800 | Local JS Minimax (Depth 1, Không Quiescence) | Offline |
| **Level 2** | Tập sự (Novice) | ~1000 | Local JS Minimax (Depth 2, Không Quiescence) | Offline |
| **Level 3** | Dễ (Casual) | ~1200 | Local JS Minimax (Depth 2, Có Quiescence) | Offline |
| **Level 4** | Trung bình (Intermediate) | ~1400 | Local JS Minimax (Depth 3, Không Quiescence) | Offline |
| **Level 5** | Câu lạc bộ (Club) | ~1600 | Local JS Minimax (Depth 3, Có Quiescence) | Offline |
| **Level 6** | Bán chuyên (Semi-Pro) | ~1800 | Chess-API.com (Stockfish 18, Depth 7) | Cần Internet (☁) |
| **Level 7** | Chuyên gia (Expert) | ~2000 | Chess-API.com (Stockfish 18, Depth 10) | Cần Internet (☁) |
| **Level 8** | Dự bị Kiện tướng (Candidate) | ~2200 | Chess-API.com (Stockfish 18, Depth 12) | Cần Internet (☁) |
| **Level 9** | Kiện tướng (Master) | ~2400 | Chess-API.com (Stockfish 18, Depth 14) | Cần Internet (☁) |
| **Level 10** | Đại kiện tướng (Grandmaster)| ~2750 | Chess-API.com (Stockfish 18, Depth 18) | Cần Internet (☁) |

***Giải thích về thuật toán tạo độ khó tự nhiên cho Offline Bot:***
- **Khái niệm Depth (Độ sâu tìm kiếm):** Số lượng nửa-nước đi (Ply) mà bot nhìn trước được. Depth càng cao, bot càng giỏi về dàn quân chiến lược và thế trận.
- **Khái niệm Quiescence Search (Tính toán ăn quân tĩnh):** Một thuật toán bổ trợ bắt buộc để giải quyết lỗi "Horizon Effect". Nếu không có Quiescence, bot có thể ăn 1 con Tượng đang được bảo vệ ở cuối độ sâu tìm kiếm vì nó tưởng nó "lãi" (không nhìn thấy nước tiếp theo kẻ thù sẽ ăn lại).
- **Mô phỏng tư duy con người qua từng Level:**
  - **Level 1 (Depth 1):** Rất thiển cận, chỉ nhìn 1 bước. Chỉ quan tâm ăn quân ngay lập tức, dính mọi bẫy cờ 2 nước.
  - **Level 2 (Depth 2, No Quiescence):** Nhìn được 1 lượt đi (mình đi, địch đi). Có thể thấy trước một số mối đe dọa cơ bản nhưng vẫn tính toán sai trong các chuỗi đổi quân (Horizon Effect).
  - **Level 3 (Depth 2, With Quiescence):** Cẩn thận hơn, không bị dính bẫy đổi quân cơ bản nhưng tư duy chiến lược ngắn hạn.
  - **Level 4 (Depth 3, No Quiescence):** Nhìn sâu hơn về thế trận (điều quân tốt hơn), nhưng thỉnh thoảng tính nhầm/tính sót ở nước thứ 4 của một pha đổi quân phức tạp. Đây là lỗi cực kỳ đặc trưng của người chơi hệ trung bình-khá.
  - **Level 5 (Depth 3, With Quiescence):** Bot offline mạnh nhất, tính toán sâu cả về thế trận lẫn chuỗi trao đổi quân. Đạt ELO ổn định ~1600.

#### B. Giao diện Status Bar & Quân cờ bị ăn:
- **Thanh trạng thái 3 phần (Compact 3-column table):**
  - **Cột trái:** Hiển thị danh sách quân Trắng đã bị ăn (`♙`, `♘`, `♗`, `♖`, `♕`), sắp xếp theo thứ tự giá trị giảm dần.
  - **Cột giữa:** Hiển thị lượt đi hiện tại (Trắng/Đen), báo Chiếu (`[CHIẾU]`), trạng thái Bot đang tính toán.
  - **Cột phải:** Hiển thị danh sách quân Đen đã bị ăn (`♟`, `♞`, `♝`, `♜`, `♛`), sắp xếp theo thứ tự giá trị giảm dần.
- Tự động cập nhật đồng bộ sau mỗi nước đi và khi thực hiện Đi lại (Undo).

#### C. Action Buttons trên màn hình:
- **`[↩ Đi lại (Undo)]`**: Lùi lại 2 nước cờ gần nhất (nước đi của bot và nước đi của người chơi).
- **`[🏳 Đầu hàng (Resign)]`**:
  - Mở popup xác nhận: *"Bạn có chắc chắn muốn đầu hàng?"*
  - Nếu xác nhận: Kết thúc ván, xử Thua cho người chơi, trừ điểm ELO Bot.
- **`[🔄 Xoay bàn (Flip)]`**: Đảo chiều góc nhìn bàn cờ 180 độ.
- **`[💡 Gợi ý (Hints: Bật/Tắt)]`**: Bật/tắt hiển thị các ô đi hợp lệ khi chạm vào quân cờ.
- **`[🆕 Ván mới (New Game)]`**: Bắt đầu lại ván cờ mới.

#### D. Phong cấp Tốt (Pawn Promotion Selection):
- Khi tốt di chuyển đến hàng cuối cùng (hàng 8 đối với quân Trắng, hàng 1 đối với quân Đen), hệ thống **không tự động phong Hậu** mà hiển thị modal chọn quân phong cấp tương tác tối ưu cho E-ink:
  - **4 lựa chọn phong cấp:** Hậu (Queen `♕`/`♛`), Xe (Rook `♖`/`♜`), Tượng (Bishop `♗`/`♝`), Mã (Knight `♘`/`♞`).
  - **Giao diện Touch Target:** Mỗi nút quân phong cấp có kích thước lớn (chiều cao tối thiểu 52px, viền kép đậm 2px), glyph rõ nét và tên quân cờ đa ngữ (VI/EN).
  - **Nút Hủy (Cancel):** Cho phép người chơi hủy nước đi nếu chạm nhầm ô đích và chọn lại nước đi khác.
  - Tương thích 100% với bàn cờ xoay (Flipped board) và hỗ trợ đa ngôn ngữ.

#### E. Quy tắc tính ELO & Kết thúc ván:
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

## 5. HỆ THỐNG ĐA NGÔN NGỮ, LƯU TRỮ & QUOTA (I18N, STORAGE & MONETIZATION)

### 5.1. Đa ngôn ngữ (i18n)
- Hỗ trợ 2 ngôn ngữ: **Tiếng Anh (EN - Mặc định)** và **Tiếng Việt (VI)**.
- Cơ chế:
  - Mặc định khởi tạo giao diện tiếng Anh (`en`).
  - Cho phép người dùng chuyển đổi thủ công tại Persistent Header (`[VI | EN]`) và lưu vào `localStorage` (`einkchess_lang`).
  - Sử dụng từ điển JavaScript thuần (Object literal) dung lượng cực nhẹ (~5KB), không dùng thư viện ngoài.

### 5.2. Quản lý lưu trữ LocalStorage
- Mọi thao tác đều được bọc trong `try / catch` an toàn.
- Dữ liệu lưu trữ gồm:
  - `einkchess_lang`: Ngôn ngữ giao diện (`en` / `vi`, mặc định: `en`).
  - `einkchess_bot_elo`: Điểm ELO đấu với Bot (Mặc định: 1200).
  - `einkchess_puzzle_elo`: Điểm ELO giải đố (Mặc định: 1200).
  - `einkchess_puzzle_streak`: Chuỗi câu đố giải đúng liên tiếp hiện tại và kỷ lục.
  - `einkchess_saved_game`: Trạng thái bàn cờ, lịch sử nước đi ván đang chơi dở với Bot.
  - `einkchess_pid`: UUID định danh thiết bị duy nhất.
  - `einkchess_pvp_code`: Mã phòng PvP đang hoạt động.
  - `einkchess_quota`: Object lưu trữ số lượt chơi đã dùng trong ngày (`{ date: 'YYYY-MM-DD', bot_cloud: 0, puzzle: 0, pvp: 0 }`).
  - `einkchess_default_bot_lvl`: Cấu hình độ khó của Bot AI được chọn gần nhất (Mặc định: 1).
  - `einkchess_default_side`: Bên cầm quân được chọn gần nhất (Trắng `w` / Đen `b`, mặc định: `w`).

### 5.3. Tracking Active Users (DAU / MAU / Realtime)
- **Mục tiêu:** Đếm người dùng thực tế và phân tích lưu lượng mà không gây nặng máy Kindle.
- **Cơ chế hoạt động:**
  - Client gửi **Beacon Ping** siêu nhẹ (~500 bytes XHR) khi khởi động app và khi bắt đầu ván cờ mới.
  - Gửi kèm: `device_id` (UUID), `device_type` (Kindle Basic, Paperwhite, Oasis, Scribe, Desktop), `lang`, `action_type`.
  - Backend lưu vào bảng `active_pings` / tổng hợp số liệu:
    - **Realtime Users:** Số thiết bị active trong 10 phút gần nhất.
    - **DAU / MAU:** Số thiết bị duy nhất trong ngày / tháng.
    - **Thống kê thiết bị & chế độ chơi:** Báo cáo tỉ lệ máy đọc sách và mức độ yêu thích từng chế độ.

### 5.4. Cơ chế Quota Freemium & Lộ trình Tính phí
1. **Chế độ Miễn phí Hoàn toàn (Free & Unlimited):**
   - **Bot Level 1-3:** Chạy 100% Local Minimax offline trên client, **KHÔNG giới hạn số ván chơi** và **KHÔNG tính vào quota**.
2. **Hạn mức Miễn phí Hàng ngày (Daily Free Tier - Reset 00:00 mỗi ngày):**
   - ☁ **Bot Level 4-8 (Cloud AI):** Miễn phí **3 ván/ngày**.
   - 🧩 **Giải đố (Puzzles):** Miễn phí **3 câu đố/ngày**.
   - 👥 **Đấu với bạn (PvP Online):** Miễn phí **3 trận/ngày**.
   - Khi hết lượt, hiển thị thông báo thân thiện và gợi ý chuyển sang Bot Level 1-3 hoặc ủng hộ tác giả.
3. **Lộ trình Tính phí & Ủng hộ (Monetization):**
   - **Giai đoạn 1 (Hiện tại): Donate — Support me on Ko-fi:**
     - Tích hợp nút **`[☕ Ủng hộ tác giả (Support on Ko-fi)]`** trên Header / Footer / Popup khi hết lượt.
     - Hiển thị **Mã QR Ko-fi** rõ nét để người dùng dùng điện thoại quét và donate nhanh chóng.
   - **Giai đoạn 2 (Tương lai khi SEO & User Base lớn): Gói Đăng ký định kỳ (Subscription):**
     - Đăng ký theo tháng/năm qua kích hoạt thiết bị bằng QR Code từ điện thoại.
     - Mở khóa chơi không giới hạn mọi chế độ.

### 5.5. Kiến trúc Backend Độc lập & Dễ Dàng Di Chuyển (Portable Backend)
- Thiết kế **API Service Adapter** ở tầng Frontend (`js/chess-backend.js`).
- Chuẩn hóa toàn bộ RESTful API endpoint (`/api/ping`, `/api/quota`, `/api/pvp/*`).
- Cơ sở dữ liệu sử dụng **PostgreSQL chuẩn (Standard SQL)**:
  - Có thể chạy trực tiếp trên Supabase (hiện tại).
  - Khi cần scale-up, dễ dàng migrate 100% sang VPS riêng (Docker + Node.js/Go/Python + PostgreSQL + Redis) chỉ bằng việc thay đổi base URL `API_ENDPOINT` trong file config mà không phải sửa lại code client.

---

## 6. LỘ TRÌNH TRIỂN KHAI THEO GIAI ĐOẠN (5 PHASES)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: MVP - Core Engine, Board, Bot 1-3, i18n VI/EN, Ping, Ko-fi QR │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Online AI - Chess-API.com (Level 4-8), Quota 3 matches/day   │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Puzzle Mode - 500 Puzzles Lichess, Quota 3 puzzles/day       │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 4: PvP Online - Chơi với bạn, Quota 3 PvP/day, Supabase Backend │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 5: Dashboard Thống Kê Nâng Cao, Polish SEO & Trải Nghiệm E-ink  │
└────────────────────────────────────────────────────────────────────────┘
```

### Phase 1 — MVP (Local Engine, Bot AI Level 1-3 Unlimited, Song Ngữ VI/EN, Active Tracking, Ko-fi Donate, ELO Header)
- **Core Engine & Board:**
  - [x] Xây dựng `js/chess-engine.js`: Luật cờ vua hoàn chỉnh, FEN parser/serializer, SAN notation, kiểm tra chiếu hết / hòa cờ.
  - [x] Xây dựng `js/chess-ai.js`: Minimax + Alpha-Beta pruning + PST table (Level 1: ~400, Level 2: ~800, Level 3: ~1200) - Hoàn toàn miễn phí không giới hạn.
  - [x] Xây dựng `css/einkchess.css`: Hệ màu đơn sắc tương phản cao, layout responsive theo các dòng Kindle. Cài đặt viền nét đứt cho 2 ô nước vừa đi (`.sq.last-from, .sq.last-to { outline: 2px dashed #000; outline-offset: -2px; }`).
  - [x] Xây dựng `js/chess-board.js`: Render DOM gia tăng (Incremental), xử lý touch, nút Undo, modal Đầu hàng.
  - [x] Xây dựng `index.html` và `play-bot.html`: Giao diện trang chủ và màn hình chơi với bot có ELO Header.
  - [x] Xây dựng `js/chess-storage.js`: Quản lý lưu game, UUID thiết bị (`pid`), và tính toán ELO cơ bản.
- **[TÍCH HỢP NGAY TỪ PHASE 1] Đa ngôn ngữ Song ngữ VI / EN (Multi-language i18n):**
  - [x] Xây dựng `js/chess-i18n.js`: Hệ thống từ điển song ngữ Tiếng Việt & Tiếng Anh chuẩn ES5 thuần không thư viện ngoài, tự động nhận diện locale và lưu tùy chọn vào `localStorage`.
  - [x] Tích hợp nút chuyển đổi nhanh ngôn ngữ `[VI | EN]` trên Header ở mọi màn hình (`index.html`, `play-bot.html`), chuyển đổi tức thì không làm mất trạng thái ván cờ.
- **[TÍCH HỢP NGAY TỪ PHASE 1] Active User & Traffic Tracking:**
  - [x] Xây dựng `sql/schema.sql`: Bảng `active_pings` / `page_views` và PostgreSQL functions tính Realtime, DAU, WAU, MAU, YAU và tổng lượt truy cập.
  - [x] Xây dựng `js/chess-backend.js`: Tầng adapter gửi Beacon Ping tự động siêu nhẹ (~500 bytes) mỗi khi mở trang hoặc thực hiện ván cờ.
- **[TÍCH HỢP NGAY TỪ PHASE 1] Donate Ko-fi QR:**
  - [x] Tích hợp nút `[☕ Donate / Ủng hộ]` trên Header và Footer.
  - [x] Xây dựng Modal hiển thị Mã QR Ko-fi độ nét cao (tối ưu màn hình E-ink) để người dùng quét ủng hộ qua điện thoại.

### Phase 2 — Online AI (Level 4-8 Kiện Tướng + Quota 3 trận/ngày)
- Xây dựng `js/chess-api-client.js`: Giao tiếp API `POST https://chess-api.com/v1` qua XHR.
- Tích hợp 5 cấp độ nâng cao (~1500 đến ~2750 ELO), độ sâu tính toán depth 4 đến 18.
- Áp dụng Quota 3 trận Cloud AI/ngày (tự động reset 00:00).
- Xử lý trạng thái "Đang suy nghĩ..." và cơ chế tự động fallback về local engine khi mất mạng.

### Phase 3 — Puzzle Mode (Giải Đố Thích Ứng ELO + Quota 3 câu/ngày)
- Xây dựng `build/build-puzzles.js`: Script trích xuất và lọc 500 câu đố chất lượng cao từ Lichess database ra `data/puzzles.json`.
- Xây dựng `puzzles.html` và `js/chess-puzzles.js`: Giao diện giải đố, cơ chế so khớp nước đi, biểu tượng Tick/Cross, gợi ý 2 cấp độ và hệ thống tính ELO Puzzle.
- Áp dụng Quota 3 câu đố/ngày.

### Phase 4 — PvP Online (Chơi với bạn + Đồng bộ nước đi)
- Cập nhật `sql/schema.sql` cho bảng `chess_games` và `user_quotas`.
- Hoàn thiện module PvP trong `js/chess-backend.js`.
- Xây dựng `play-friend.html` và `js/chess-pvp.js`: Tạo phòng mã 6 ký tự, kết nối đồng bộ nước đi bằng polling 8s, nút Đầu hàng / Xin hòa (Quota 3 trận/ngày).

### Phase 5 — Dashboard Thống Kê Nâng Cao & Polish Toàn Diện
- Màn hình thống kê chi tiết trên `index.html`: Lịch sử đấu, tỷ lệ thắng, biểu đồ ELO, kỷ lục streak.
- Kiểm tra toàn diện tương thích ES5, tối ưu tốc độ phản hồi trên thiết bị Kindle thực tế.

