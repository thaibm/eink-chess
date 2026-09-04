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
  - **Tọa độ hàng & cột (Board Coordinates):** Hiển thị rõ ràng tên cột (`a` - `h`) ở góc dưới cùng bên phải của các ô hàng cuối và số thứ tự hàng (`1` - `8`) ở góc trên cùng bên trái của các ô cột ngoài cùng bên trái. Tọa độ tự động đổi chiều khi xoay bàn cờ (`flip` / đổi bên cầm quân) và tối ưu độ tương phản (chữ sẫm màu trên ô sáng, chữ trắng trên ô tối).

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

### 2.5. Bố cục Trang chủ (Home Screen 3-Section Balanced Layout)
- Trang chủ hiển thị trực quan 3 thẻ chức năng chính:
  1. **Chơi với Máy (Bot AI)**: Tomitank / Minimax offline, hiển thị ELO Bot tương ứng.
  2. **Giải Đố Cờ Thế (Puzzles)**: Tải động bài tập chiến thuật thích ứng, hiển thị ELO Puzzle tương ứng.
  3. **Cài Đặt (Settings)**: Tùy chỉnh giao diện quân cờ, chế độ Undo, hiển thị gợi ý và đánh giá nước đi (`settings.html`).
- **Tỉ lệ phân bổ:** Mỗi khối chế độ chiếm xấp xỉ ~30% không gian dọc màn hình (`min-height: 25-28vh`), tăng kích thước chữ (Title 16-17px, Desc 14px, Button 15px) và touch target (nút bấm chính min 44px) giúp người dùng Kindle dễ nhìn và chạm chính xác tuyệt đối mà không cần cuộn trang.
- **Chân trang (Footer):** Hiển thị thông tin ghi nhận "Powered by sendwebtokindle.xyz" (`https://sendwebtokindle.xyz`) có hỗ trợ đa ngôn ngữ (`footer.powered_by`).

### 2.6. Chuẩn Giao Diện Zero-Scroll & Kiến Trúc Mô-Đun (`chess.html`)
- **Định hướng thiết kế:** Đồng bộ 100% ngôn ngữ thiết kế từ `play-bot` / `play-bot-v2.html` vào `chess.html`, đảm bảo vừa khít khung nhìn tuyệt đối không xuất hiện thanh cuộn trên mọi màn hình E-ink (Kindle 6", Paperwhite, Kobo, Oasis...).
- **Kiến trúc mô-đun hóa độc lập (Modular Architecture):** Để chuẩn bị thay thế hoàn toàn `play-bot.html` và `play-bot-v2.html`, file monolith `chess.html` được tái cấu trúc thành các module tái sử dụng:
  1. `css/chess-game.css`: Toàn bộ stylesheet giao diện game, review pills, badges và modal overlays.
  2. `js/tomitank-source.js`: Mã nguồn engine Tomitank 7.0 (~411KB) được tái sử dụng trực tiếp qua `window.TOMITANK_SOURCE`, triệt tiêu 100% mã trùng lặp trong HTML.
  3. `js/chess-book.js`: Thư viện khai cuộc `BOOK_MAP` (~1,084 biến thể) và thuật toán tra cứu nước đi sách `openingBookMove()`.
  4. `js/chess-persona.js`: Danh sách 10 Bot Persona và từ điển đối thoại song ngữ `CHAT_TEXT_VI` / `CHAT_TEXT_EN` qua `randChat()`.
  5. `js/chess-review.js`: Thuật toán phân loại nước đi `classifyMove()` (Brilliant, Great, Best, Inaccuracy, Mistake, Blunder) và Static Exchange Evaluation (`seeFull`).
  6. `js/chess-coach.js`: Lớp phủ SVG vẽ mũi tên trực quan hướng dẫn nước đi (`drawCoachArrow()`, `clearCoachArrows()`).
  7. `chess.html`: Controller mỏng điều phối DOM và vòng đời trò chơi.
- **Cấu trúc phân bổ 4 tầng dọc:**
  1. **Header Bar:** Thu nhỏ thành 1 dòng (Logo EinkChess, nút xem PGN Overlay, nút Menu trở về `index.html`).
  2. **Thanh Trạng Thái Tích Hợp (Status Bar 3 Cột):** Gộp hiển thị quân cờ bị bắt (Trắng bên trái, Đen bên phải) và thông báo lượt đi / phản hồi phân tích nước đi ở chính giữa.
  3. **Bàn Cờ Auto-Scaling:** Tự động tính toán kích thước số nguyên pixel chia hết cho 8 dựa trên chiều cao còn lại của viewport, sử dụng `box-sizing: content-box` để 64 ô cờ nằm vừa khít 8x8 không bị rớt dòng.
  4. **Thanh Điều Khiển Dưới Bàn Cờ (Action Controls - Chuẩn Play-Bot-v2 5 Nút):** 
     - 5 nút cân đối 20% mỗi nút: `Xin thua` (Resign), `Lật bàn` (Flip), nút thông tin trận đấu ở giữa `#bot-meta` (`Cấp X · ELO`, `.puzzle-meta-box`), `Refresh` (Xử lý lưu ảnh ghosting), `Ván mới` (New Game).
     - Chiều cao tối ưu 42px, viền đơn sắc 2px solid, nút Ván mới nổi bật nền đen `btn-primary`, nút bot-meta nền xám `#f0f0f0`.
- **Modal Thông Tin Trận Đấu (Match Information Modal `#bot-info-modal` - tương tự Play-Bot-v2):**
  - Mở ra khi người chơi nhấn vào nút `#bot-meta` ở giữa thanh điều khiển Footer.
  - Hiển thị Bảng Matchup (Người chơi ELO + Bên cầm quân vs Tên Bot, Cấp độ & ELO tương ứng), Thẻ dự tính điểm ELO cược FIDE (Thắng / Hòa / Thua tính động theo chênh lệch trình độ), và Đặc tính Bot (mô tả phong cách, thời gian nghĩ và tỷ lệ blunder theo từng cấp độ), kèm nút "Đóng" không làm gián đoạn ván cờ.
- **Modal Cấu Hình Ván Đấu (Match Setup Modal `#setup-modal`):**
  - Gộp toàn bộ tùy chọn chọn Cấp độ (10 cấp từ Cấp 1 đến Cấp 10 kèm nhãn ELO tương ứng) và Chọn bên cầm quân (Trắng đi trước, Đen đi sau, Ngẫu nhiên) vào Modal Popup `#setup-modal`.
  - Nút "Ván mới" tại Footer và trong Popup Thống kê khi bấm sẽ mở Modal Cấu hình này. Sau khi người chơi bấm "Bắt Đầu", hệ thống lưu cấp độ, cập nhật nhãn nút `#bot-meta` ở giữa thanh Footer và khởi tạo ván cờ với màu quân đã chọn (nếu chọn Đen, AI cầm Trắng và tự động đi trước).
- **Modal Kết Thúc Trận Đấu & Xác Nhận Đầu Hàng (Game Over & Confirm Resign Modals - Chuẩn Play-Bot-v2):**
  - **Modal Xác Nhận Đầu Hàng (`#resign-modal`):** Khi người chơi nhấn nút "Xin thua / Đầu hàng", popup xác nhận hiện ra tránh bấm nhầm trên màn hình cảm ứng E-ink với 2 nút "Hủy" và "Đồng ý đầu hàng".
  - **Modal Kết Thúc Ván Đấu (`#gameover-modal`):** Khi trận đấu kết thúc (Chiếu hết, Đầu hàng, Hòa cờ do Stalemate / Luật 50 nước / Lặp 3 lần / Không đủ quân), hiển thị popup Game Over chuẩn với:
    - Tiêu đề kết quả rõ ràng (Chiếu hết thắng/thua, Đầu hàng, Hòa cờ).
    - Thẻ cập nhật điểm ELO trực quan (`oldElo (±delta) → newElo`).
    - 3 nút điều hướng: `[Trang chủ]` (`index.html`), `[Phân tích ván đấu]` (`goToAnalysis()`) dẫn sang `analysis.html`, và `[Ván mới]` (`openSetupModal()`).
  - Tự động lưu toàn bộ dữ liệu ván đấu vào `ChessStorage.saveAnalysisGame()` ngay khi trận đấu kết thúc.
  - Thay thế hoàn toàn chế độ xem lại tại chỗ (In-page review mode) cũ, tập trung hóa trải nghiệm phân tích toàn diện, xem lại nước đi, huy hiệu và mũi tên chiến thuật sang `analysis.html`.
  - Tự động lưu toàn bộ trạng thái ván cờ (`gRank`, `gPC`, `gFlip`, `gB`, `gTurn`, `gEP`, `gCasB`, `gHalf`, `gFull`, `gHist`, `gUciHist`, `gLast`, `gCapturedBlack`, `gCapturedWhite`) vào `localStorage` (`einkchess_monolith_saved_game`) sau mỗi nước đi hợp lệ.
  - Khi người dùng tải lại trang (F5/Refresh) hoặc mở lại trình duyệt, hệ thống tự động khôi phục đúng trạng thái bàn cờ, highlight nước đi cuối và tự kích hoạt Bot tính toán nếu đến lượt đi của Bot.
  - Tự động dọn dẹp bộ nhớ lưu trữ khi ván cờ kết thúc (Chiếu hết, Stalemate, Hòa luật 50 nước, Lặp lại 3 lần, Hết quân chiếu hết, hoặc khi một bên Đầu hàng / bấm Ván mới).
- **Đồng Bộ & Áp Dụng Toàn Diện Cấu Hình Từ Trang Settings (Settings Configurations Support tương tự Play-Bot-v2):**
  - **Piece Theme (Kiểu quân cờ):** Hỗ trợ 3 theme thông qua `ChessStorage.getPieceTheme()`: Chess.com (PNG `ejgfv`), Lichess (SVG `cburnett`), và Unicode (`unicode`) hiển thị trên 64 ô bàn cờ, modal phong cấp và thanh quân bị bắt.
  - **Show Move Hints (Gợi ý nước đi):** Bật/tắt các chấm tròn gợi ý nước đi hợp lệ (`.dot-marker`, `.ring-marker`) theo `ChessStorage.getShowHints()`.
  - **Allow Undo (Cho phép đi lại):** Hiển thị/ẩn nút `[Đi lại]` trên thanh Footer theo `ChessStorage.getAllowUndo()`. Khi kích hoạt, hoàn tác 2 nước đi (nước Bot và nước người chơi) qua cơ chế replay stack sạch sẽ.
  - **Auto Refresh on Modal Close (Tự động làm mới khi đóng popup):** Tự động gọi `handleRefresh(120)` xóa bóng mờ E-ink khi đóng các popup Modal (Cấu hình ván đấu, Thông tin trận đấu, Thống kê, PGN) theo `ChessStorage.getAutoRefreshModal()`.
  - **Default Bot Level & Side:** Tự động áp dụng cấp độ và bên cầm quân mặc định từ `ChessStorage` khi mở Setup Modal.
- **Hỗ Trợ Song Ngữ Toàn Diện (Multi-language i18n Support tương tự Play-Bot-v2):**
  - Tích hợp `js/chess-i18n.js` với 2 ngôn ngữ: Tiếng Việt (`vi`) và Tiếng Anh (`en`).
  - Nút chuyển đổi ngôn ngữ (`#btn-lang-toggle`) trên Header cho phép đổi nhanh `EN` / `VI` không cần tải lại trang.
  - Tự động dịch toàn bộ giao diện: Header, Menu, thanh điều khiển Footer (`Undo`, `Resign`, `Flip`, `Refresh`, `New Game`), Modal Cấu hình ván đấu, Modal Thông tin trận đấu, Modal Thống kê, Modal PGN, Khung phong cấp, và trạng thái lượt đi / chiếu / kết thúc ván cờ.
  - **Hỗ trợ song ngữ cho hệ thống câu thoại Bot (Bot Chat Banter i18n):** Tích hợp song song 2 từ điển câu thoại (`CHAT_TEXT_VI` và `CHAT_TEXT_EN`) gồm 34 danh mục cảm xúc, nhận xét khai cuộc, tàn cuộc, chiếu tướng, phản ứng blunder/brilliant và câu giục đi cờ tự động thích ứng theo ngôn ngữ được chọn qua `randChat()`.
- **Lựa Chọn Phiên Bản Bot Từ Modal Trang Chủ (Bot Version Launcher from Home Modal):**
  - Modal chọn cấu hình ván cờ trên `index.html` cung cấp 2 lựa chọn khởi động:
    - Nút **`Bot v1`**: Điều hướng tới `play-bot-v2.html?new=1&lvl=...&side=...` với thông số cấp độ và bên cầm quân đã chọn.
    - Nút **`Play Bot V2`**: Điều hướng tới `chess.html?new=1&lvl=...&side=...` với thông số cấp độ và bên cầm quân đã chọn.
  - Trang `chess.html` hỗ trợ nhận các tham số URL (`?new=1&lvl=...&side=...`) để tự động khởi tạo đúng cấp độ AI và bên cầm quân theo yêu cầu.

---

## 3. RÀNG BUỘC KỸ THUẬT & TƯƠNG THÍCH (TECHNICAL CONSTRAINTS)

### 3.1. Trình duyệt Kindle Experimental Browser
- Trình duyệt trên máy đọc sách Kindle là **Experimental Web Browser** (dựa trên WebKit cũ), **không phải** Silk Browser (Silk chỉ có trên Fire Tablet).
- **Ràng buộc & Giải pháp tương thích Firmware cũ (5.13, 5.16, Paperwhite 3):**
  - **Không hỗ trợ WebAssembly (WASM)** $\rightarrow$ Không thể chạy trực tiếp Stockfish WASM trên client Kindle.
  - **Không hỗ trợ Web Workers** $\rightarrow$ Tính toán AI nặng trên client sẽ khóa UI.
  - **JavaScript Engine hạn chế:** Bắt buộc tuân thủ **ES5** (không dùng `const`, `let`, arrow functions `() => {}`, template literals `` ` `` , `class`, `async/await`, `fetch` nếu không có fallback XHR).
  - **CSS:** Không hỗ trợ CSS `clamp()`, `aspect-ratio`, flexbox `gap`. Bàn cờ sử dụng layout table-cell đồng nhất (`display: table-row`, `display: table-cell; height: 12.5%`) kết hợp tính toán kích thước bàn cờ và `fontSize` quân cờ qua JavaScript để tránh lỗi `position: absolute` bị tính sai chiều cao (lệch top) trên WebKit cũ.
  - **Cơ chế Touch & Click Delegation (Chuẩn ChessTwinkle):**
    - Đăng ký bộ lắng nghe sự kiện ngay tại Container bàn cờ (`table.onclick`, `table.ontouchstart`, `table.onmousedown`) để bắt sự kiện chạm lập tức khi người dùng vừa chạm vào màn hình e-ink.
    - Xử lý `onFastInput` với `e.preventDefault()` để ngăn chặn trình duyệt Kindle sinh thêm click trễ hoặc cuộn trang ngoài ý muốn, đồng thời giới hạn throttle (120ms) và khử trùng lặp click (700ms).
    - Tra cứu ô cờ tương ứng bằng cách duyệt ngược cây DOM `tgt = tgt.parentNode` cho đến khi tìm thấy phần tử có thuộc tính `data-r` và `data-c`.
    - Các Modal Overlay luôn có thuộc tính tường minh `style.display = 'block'` / `style.display = 'none'` để tránh overlay vô hình chặn touch hit trên các lớp DOM bên dưới.
  - **Touch Highlight:** Loại bỏ tap highlight (`-webkit-tap-highlight-color: transparent`) để tránh sinh thêm chu kỳ chớp màn hình e-ink khi chạm.

### 3.2. Kỹ thuật Render tối ưu E-ink (Incremental DOM Patching)
- Mỗi lần DOM thay đổi gây thay đổi pixel sẽ kích hoạt e-ink refresh.
- Thay vì vẽ lại toàn bộ 64 ô cờ khi có nước đi mới, engine chỉ so sánh diff và cập nhật đúng 2-4 phần tử DOM (`<div>`) của các ô có thay đổi (ô xuất phát, ô đích, ô bắt quân qua đường/nhập thành).
- Giúp Kindle tận dụng chế độ làm mới một phần (fast partial refresh), không bị giật/chớp toàn màn hình.

### 3.3. Quản lý Cache (Cache Busting)
- Trình duyệt trên các thiết bị E-ink (đặc biệt là Kindle) thường cache file tĩnh (CSS, JS) rất mạnh và người dùng cực kỳ khó thao tác xóa cache thủ công.
- **Ràng buộc:** Bắt buộc phải gắn thêm tham số phiên bản (version query parameter, ví dụ `?v=1.0.1` hoặc timestamp `?v=20240815`) vào tất cả các thẻ `<script src="...">` và `<link rel="stylesheet" href="...">`.
- Mỗi khi chỉnh sửa bất kỳ file CSS hay JS nào, **phải cập nhật lại mã version này** trong các file HTML tương ứng để đảm bảo thiết bị tải phiên bản mới nhất.

### 3.4. Tự động Khử Lưu Ảnh khi Đóng Popup (Auto Refresh on Popup Close)
- Màn hình E-ink có đặc tính lưu ảnh (ghosting) vật lý rõ rệt sau khi hiển thị các lớp phủ (`modal-overlay` bán trong suốt) và các hộp thoại popup.
- **Cơ chế tùy chọn (Settings):** Tính năng này được quản lý qua tùy chọn trong trang Cài đặt (`settings.html`), lưu trữ trong `localStorage` (`einkchess_auto_refresh_modal`), **mặc định là TẮT (OFF / `false`)**.
- **Khi tính năng được Bật (ON):** Khi đóng bất kỳ popup/modal nào trên màn hình chơi (`play-bot-v2.html` và `puzzles.html`), hệ thống tự động kích hoạt hàm refresh màn hình (`handleRefresh(120)` hoặc `PuzzleManager.refreshScreen(120)`):
  - **Độ trễ ổn định trạng thái (120ms Settlement Delay):** Áp dụng độ trễ 120ms trước khi tạo overlay trắng. Khoảng trễ này đảm bảo trình duyệt WebKit trên Kindle hoàn tất việc ẩn lớp DOM modal và vẽ lại bàn cờ tĩnh, đưa phần cứng E-ink về trạng thái nghỉ trước khi kích hoạt chu kỳ refresh vật lý (hoàn toàn tương đương trạng thái khi người chơi ấn nút Refresh thủ công).
  - Tạo một overlay trắng phủ toàn màn hình `#ffffff` trong 200ms để kích hoạt chu kỳ refresh vật lý của màn hình E-ink, xóa sạch bóng mờ của popup vừa đóng, sau đó gỡ bỏ overlay và gọi `board.render()`.
  - **Phạm vi áp dụng:** Áp dụng cho toàn bộ các popup: Setup/Level modal, Game Over modal, Bot/Puzzle Info modal, Confirm Resign modal, Confirm Hint/Skip modal, Donate Ko-fi modal (`ChessBackend.onCloseDonate`), và Pawn Promotion modal (`board.onClosePromotion`).
  - **Chống nháy trắng dư thừa:**
    - Có cờ debounce guard (`isRefreshing` / `_isRefreshing`) chống tạo nhiều overlay khi thao tác nhanh hoặc gọi lồng nhau.
    - Trong `play-bot-v2.html`, khi người chơi bấm "New Game" từ Game Over popup để mở tiếp Match Setup popup, hệ thống không kích hoạt refresh ngay lúc đóng Game Over, mà chỉ refresh sau khi Match Setup popup đóng lại, đảm bảo giao diện hiển thị mượt mà không nhấp nháy gián đoạn.
- **Nút Làm mới thủ công:** Nút **`[Refresh]`** trên action bar của bàn cờ luôn luôn hoạt động bình thường độc lập với cài đặt này.

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
- Chọn cấp độ khó (10 Levels - được sắp xếp thành 2 dòng, mỗi dòng 5 cấp độ để tối ưu touch targets trên thiết bị E-ink):

| Cấp độ | Tên gọi | ELO Ước tính | Cơ chế xử lý (Tomitank Web Worker) | Yêu cầu mạng |
| :--- | :--- | :--- | :--- | :--- |
| **Level 1** | Người mới (Beginner) | ~400 | Giới hạn 200ms + Noise (200cp, 80% chance) | Offline |
| **Level 2** | Tập sự (Novice) | ~600 | Giới hạn 400ms + Noise (150cp, 65% chance) | Offline |
| **Level 3** | Dễ (Casual) | ~800 | Giới hạn 700ms + Noise (110cp, 50% chance) | Offline |
| **Level 4** | Trung bình (Intermediate) | ~1000 | Giới hạn 1000ms + Noise (75cp, 35% chance) | Offline |
| **Level 5** | Câu lạc bộ (Club) | ~1200 | Giới hạn 1500ms + Noise (50cp, 25% chance) | Offline |
| **Level 6** | Bán chuyên (Semi-Pro) | ~1400 | Giới hạn 2000ms + Noise (35cp, 18% chance) | Offline |
| **Level 7** | Chuyên gia (Expert) | ~1600 | Giới hạn 4000ms + Noise (20cp, 10% chance) | Offline |
| **Level 8** | Kiện tướng (Master) | ~1800 | Giới hạn 6000ms + Noise (15cp, 5% chance) | Offline |
| **Level 9** | Đại kiện tướng (Grandmaster) | ~2200 | Giới hạn 8000ms (Max sức mạnh, không Noise) | Offline |
| **Level 10** | Siêu cấp (Super GM) | ~2400 | Giới hạn 12000ms (Max sức mạnh, không Noise) | Offline |

- **Tùy chọn Đánh giá nước đi (Move Review: Bật/Tắt):** Người chơi có thể bật hoặc tắt tính năng đánh giá nước đi trong modal Cài đặt ván đấu (lưu tự động vào `ChessStorage`).

***Giải thích về thuật toán tạo độ khó tự nhiên & Đánh giá nước đi cho Offline Bot V2 (Tomitank):***
- **Sử dụng Engine Tomitank 100% Offline qua Web Worker:** Tất cả 10 cấp độ đều hoạt động offline bằng engine Tomitank (đã tối ưu Hash 16MB cho Kindle).
- **Thuật toán MultiPV & Noise Injection:** Khác với AI Minimax cũ (ngây ngô và dễ bị bắt bài), Bot V2 mô phỏng tư duy con người bằng cách dùng MultiPV để tìm top 4 nước đi tốt nhất (`best4rootmoves`). Ở các cấp độ thấp (1-8), Bot có tỷ lệ (chance) cố ý chọn nước đi sai lầm trong ngưỡng điểm hao hụt (noiseCp) để "giả lập" con người đánh hỏng.
- **Phân tích nước đi (Move Evaluation & Badges):** Ứng dụng theo dõi chênh lệch điểm số (Centipawn Loss: $\Delta cp$) sau khi Bot tính toán nước phản hồi để phân loại chất lượng nước đi của người chơi:
  - $\le 10\text{ cp}$: **`★` Nước đi tốt nhất (Best Move)**
  - $11 - 50\text{ cp}$: **`✔` Nước đi tốt (Good Move)**
  - $51 - 150\text{ cp}$: **`?!` Kém chính xác (Inaccuracy)**
  - $151 - 300\text{ cp}$: **`?` Sai lầm (Mistake)**
  - $> 300\text{ cp}$: **`??` Đại sai lầm (Blunder)**
- **Hiển thị kép (Dual Display):**
  - **Huy hiệu trên bàn cờ (`.sq-review-badge`):** Gắn tại góc ô cờ đích mà người chơi vừa đi tới (tương thích khi xoay bàn cờ và reset khi Đi lại/Ván mới).
  - **Nhãn trên Thanh trạng thái (Status Bar):** Hiển thị trực tiếp nhãn đánh giá tương ứng (ví dụ: `[★ Nước đi tốt nhất] - Lượt của Bạn`).

#### B. Giao diện Status Bar & Quân cờ bị ăn:
- **Thanh trạng thái 3 phần (Compact 3-column table):**
  - **Cột trái:** Hiển thị danh sách quân Trắng đã bị ăn (`♙`, `♘`, `♗`, `♖`, `♕`), sắp xếp theo thứ tự giá trị giảm dần.
  - **Cột giữa:** Hiển thị đánh giá nước đi của người chơi, lượt đi hiện tại (Trắng/Đen), báo Chiếu (`[CHIẾU]`), trạng thái Bot đang tính toán.
  - **Cột phải:** Hiển thị danh sách quân Đen đã bị ăn (`♟`, `♞`, `♝`, `♜`, `♛`), sắp xếp theo thứ tự giá trị giảm dần.
- Tự động cập nhật đồng bộ sau mỗi nước đi và khi thực hiện Đi lại (Undo).

#### C. Action Buttons trên màn hình:
- **`[↩ Đi lại (Undo)]`**: Lùi lại 2 nước cờ gần nhất (nước đi của bot và nước đi của người chơi).
- **`[🏳 Đầu hàng (Resign)]`**:
  - Mở popup xác nhận: *"Bạn có chắc chắn muốn đầu hàng?"*
  - Nếu xác nhận: Kết thúc ván, xử Thua cho người chơi, trừ điểm ELO Bot.
- **`[🔄 Xoay bàn (Flip)]`**: Đảo chiều góc nhìn bàn cờ 180 độ.
- **`[🔄 Làm mới (Refresh)]`**: Hiển thị overlay trắng toàn màn hình trong 200ms để kích hoạt E-ink refresh vật lý, giúp xóa hiện tượng ám màn (ghosting), sau đó tự động ẩn đi và vẽ lại bàn cờ sắc nét.
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
- **Auto-save & Resume Game State (Lưu và Khôi phục ván đấu):**
  - Tự động lưu toàn bộ trạng thái ván cờ vào `localStorage` (`einkchess_saved_bot_game`) sau mỗi nước đi của người chơi, nước đi của Bot, hoặc khi Đi lại (Undo), cũng như sự kiện thoát trang (`beforeunload`/`pagehide`).
  - Dữ liệu lưu gồm: Cấp độ Bot (`botLevel`), bên cầm quân (`playerSide`), engine state (`fen`, `history`, `positionCounts`, `turn`, `castling`, `epSquare`, `halfmoveClock`), và nước đi gần nhất (`lastMove`).
  - **Tải lại trang (Reload / F5):** Trực tiếp khôi phục bàn cờ, thế cờ và lượt đi đang chơi dở mà không khởi động lại ván mới hay mở popup cài đặt. Nếu đến lượt Bot đi dở, Bot sẽ tự động suy nghĩ và đi tiếp.
  - **Trang chủ (`index.html`):** Thẻ Play vs Bot tự động nhận diện trạng thái ván cờ. Nếu đang có ván đấu dở, thẻ trực tiếp hiển thị 2 nút bấm song song: `[Tiếp tục ván đấu (Continue Match)]` (chuyển ngay vào bàn cờ chơi tiếp mà không cần qua popup trung gian) và `[Ván mới (New Game)]` (mở modal cấu hình 10 cấp độ mới). Nếu không có ván dở, hiển thị nút `[Chơi với Bot AI (Play vs AI Bot)]`.
  - **Xóa trạng thái đã lưu:** Khi ván đấu kết thúc tự nhiên (Chiếu hết, Hòa) hoặc người chơi chủ động Đầu hàng (Resign), hệ thống tự động xóa dữ liệu ván đấu đã lưu trong `localStorage` để sẵn sàng cho ván mới tiếp theo.

---

### 4.2. Chế độ Giải Đố / Cờ Thế (Puzzles)

#### A. Nguồn dữ liệu & Ghép câu đố:
- **Nguồn dữ liệu:** Lichess Open Database (`lichess_db_puzzle.csv.zst`, ~6 triệu câu đố, lưu Git LFS).
- **Kiến trúc Folder-Based:** Dữ liệu puzzle được tổ chức theo folder `data/puzzles/{ELO}/`, mỗi folder chứa các file JSON 100 câu. File `manifest.js` khai báo số lượng file mỗi bucket và mã `PUZZLE_MANIFEST_VERSION` (timestamp).
- **Clean & Replace Triệt Để:** Script `scripts/build-puzzles.js` dọn dẹp sạch sẽ 100% thư mục `data/puzzles/` trước khi sinh mới, tránh tồn đọng file cũ.
- **Weekly Rotation & Manual Trigger:**
  - Tự động xoay vòng qua GitHub Actions mỗi thứ Hai (`0 2 * * 1`) hoặc kích hoạt thủ công (Manual Trigger) qua `workflow_dispatch` với tùy chỉnh `puzzles_per_bucket` và `clean_only`.
  - **Tự động mở Pull Request (`auto/refresh-puzzles`):** Do nhánh `main` được bảo vệ (branch protection), GitHub Action tự động tạo PR để chủ dự án review và merge an toàn thay vì push trực tiếp.
  - Hỗ trợ lệnh CLI cục bộ: `npm run puzzles:fetch` (tải trực tiếp từ Lichess), `npm run puzzles:build` (build từ file `.zst` local), và `npm run puzzles:clean`.
  - Tự động cập nhật query param version trong `puzzles.html` (`manifest.js?v=TIMESTAMP`) và gắn query param `?v=` khi XHR fetch JSON để chống cache trên trình duyệt E-ink/Kindle.
- Phân bổ dải ELO câu đố rộng từ **400 đến 3400** (31 dải, Đủ mọi cấp từ dễ đến siêu khó, kiện tướng và siêu đại kiện tướng).
- **Bộ lọc RatingDeviation linh hoạt:** Áp dụng `RatingDeviation <= 100` cho ELO < 3000 để lọc câu đố chuẩn xác, và mở rộng `RatingDeviation <= 300` cho các câu đố ELO đỉnh cao $\ge 3000$ để thu thập tối đa các thế cờ hiếm từ Kiện tướng / Siêu máy tính.
- **Cơ chế ghép thế cờ & Tự động đổi bucket theo ELO:** Hệ thống tự động lấy câu đố có rating xấp xỉ điểm **Puzzle ELO** hiện tại của người dùng (làm tròn xuống mốc 100). Mỗi khi tải trang hoặc chuyển sang câu đố tiếp theo (`nextPuzzle()`), hệ thống đọc lại điểm ELO mới nhất trong Storage, tự động tính lại bucket (`Math.floor(elo / 100) * 100`) và thực hiện tải file JSON mới tương ứng với dải ELO mới nếu người dùng tăng/giảm vượt mốc 100 điểm. Client random chọn 1 file ~28KB từ folder bucket tương ứng.

#### B. Quy trình Gameplay (Flow):
1. Tải thế cờ FEN lên bàn cờ.
2. Bot tự động đi nước cờ đầu tiên (nước cờ của đối thủ tạo ra thế cờ cần giải).
3. Người dùng thực hiện nước đi giải đố:
   - **TRƯỜNG HỢP ĐI ĐÚNG:**
     - Status bar hiển thị nhãn tick lớn `✔`: *"Chính xác! ✔"*.
     - Nếu câu đố còn các nước tiếp theo trong kịch bản: Bot tự động đi nước phản đòn sau 0.5s, người chơi tiếp tục giải nước kế tiếp.
      - Nếu đã hoàn thành toàn bộ chuỗi nước đi:
        - Hiển thị popup: *"Giải đố thành công! ♔"*.
        - Cập nhật điểm ELO và chuỗi giải đúng (Streak).
        - Cung cấp 2 nút bấm: **`[Tiếp theo]`** và **`[Trang chủ]`**.
   - **TRƯỜNG HỢP ĐI SAI:**
     - Status bar hiển thị nhãn cross lớn `✖`: *"Chưa chính xác! ✖"*.
     - Đánh dấu trạng thái `hasFailed = true` (phán quyết 1 lần duy nhất), reset chuỗi Streak.
     - **KHÔNG trừ ELO ngay** — cho phép người chơi thử lại.
     - Khi giải xong (dù đã sai trước đó): áp dụng trừ ELO proportional.

#### C. Hiển thị Thông tin Câu đố & Thống kê Người chơi (Puzzle Meta & Player Stats Modal):
- **Nút Thông tin Thế cờ (#puzzle-meta - Action Bar Cột 3):** Hiển thị ngắn gọn thông tin câu đố dạng nút bấm (`#PuzzleId · ELO`, ví dụ: `#Xvpch · 1598 ELO`).
  - Khi người chơi click vào nút `#puzzle-meta`, hiển thị popup Modal **Thông tin Thế cờ & Kỷ lục Người chơi** (`#puzzle-info-modal`):
    - **Phần 1 - Thống kê Người chơi (Nhấn mạnh ELO & Thanh Tiến trình Cấp độ):**
      - Thẻ ELO Người chơi (`.player-elo-banner`) với viền dày, tương phản cao, số điểm to rõ ràng kèm icon `♟`.
      - **Thanh Tiến trình Cấp độ (.level-progress-tracker):** Hiển thị trực quan icon quân cờ chuẩn Unicode của Cấp hiện tại và Cấp tiếp theo, thanh phần trăm tiến độ ELO (`%`) và số điểm ELO còn lại để thăng cấp (ví dụ: `♙ Lvl 1 (400) ───[60%]─── ♘ Lvl 2 (800) · Cần thêm 150 ELO để lên ♘ Tập sự`).
      - Chuỗi giải đúng hiện tại (`Current Streak`) kèm icon vector lửa.
      - Kỷ lục chuỗi cao nhất (`Max/Best Streak`) kèm icon vector cúp.
    - **Phần 2 - Thông tin Thế cờ hiện tại:** Mã câu đố (`#PuzzleId`), Độ khó thế cờ (`Rating ELO`), Bên bạn cầm quân (`White/Black`). (Chủ đề đòn thế `Themes` chỉ hiển thị sau khi giải xong trong `#gameover-modal` để tránh spoil chiến thuật).
    - Nút bấm `[Đóng (Close)]`.
- **Nút Trạng thái Thống nhất trên Header (.header-status-btn):**
  - **Màn Giải cờ thế (`puzzles.html`):** Gộp ELO và Chuỗi (`Streak`) vào 1 nút bấm trung tâm (`[ ELO: 400 · Streak: 0 ]`). Khi bấm mở ngay modal Hành trình giải cờ thế (`#skill-modal`).
  - **Màn Đấu Bot (`play-bot.html`):** Gộp Bot ELO và Cấp độ Bot vào 1 nút bấm trung tâm (`[ ELO: 1600 · (Bot Lvl 1 - ELO ~800) ]`). Khi bấm mở modal Cài đặt ván đấu (`#setup-modal`).
- **Trong Modal Hoàn thành (#gameover-modal):** Hiển thị kết quả giải đố, biến động ELO, thanh Tiến trình Cấp độ trực quan kèm icon quân cờ (`.level-progress-tracker`), và danh sách chủ đề đòn thế (`Themes`). Không hiển thị liên kết ra ngoài để tối ưu trải nghiệm tập trung.

#### D. Quy tắc tính điểm ELO Puzzle (Proportional System):
- **Công thức:** $E = 1 / (1 + 10^{(puzzleRating - playerELO) / 400})$, $K = 32$
- **Giải đúng ngay từ đầu (clean, không dùng gợi ý):** $+\text{round}(K \times (1 - E))$, tối thiểu $+3$. Tăng chuỗi Streak và tự động cập nhật Kỷ lục chuỗi (`max_streak`).
- **Dùng Gợi ý (Hint):** Bị trừ điểm ELO proportional ngay khi xác nhận xem gợi ý ($-\text{round}(K \times E)$), Reset chuỗi Streak về 0. Sau khi đã dùng gợi ý, người dùng đi sai hoặc giải xong sẽ $+0 \text{ ELO}$ (không bị trừ điểm thêm).
- **Đi sai (không dùng gợi ý) rồi giải xong / Bấm Bỏ qua:** $-\text{round}(K \times E)$, Reset chuỗi Streak về 0.
  - Sai câu dễ → phạt nặng (VD: puzzle 800, player 1200 → $-29$)
  - Sai câu khó → phạt nhẹ (VD: puzzle 1800, player 1200 → $-3$)

#### E. Action Buttons trong màn Giải đố (Bố cục 5 Cột Dàn Đều Ngang Hàng):
- Áp dụng cấu trúc lưới đồng bộ `.action-bar-grid` chia 5 cột với khoảng cách phân bổ đều (`border-spacing: 4px`):
  - **Cột 1 (Bottom-Left):** Nút **`[Hành trình (Journey)]`** (`#btn-level`): Mở popup Hành trình giải cờ thế (`#skill-modal`), hiển thị tiến độ mở khóa các cấp độ và cho phép chọn chuyển đổi giữa các cấp độ đã mở.
  - **Cột 2:** Nút **`[Làm mới (Refresh)]`** (`#btn-refresh`): Tạo flash trắng 200ms để refresh vật lý màn hình E-ink, xóa bóng mờ ghosting.
  - **Cột 3 (Center):** Nút **`[Thông tin Thế cờ / Thống kê]`** (`.puzzle-meta-box`, `#puzzle-meta`): Chiều cao chuẩn 44px, viền 2px đồng bộ hoàn toàn với các nút bấm, hiển thị `#ID · ELO`. Khi bấm mở popup `#puzzle-info-modal`.
  - **Cột 4:** Nút **`[♙ Gợi ý (Hint)]`** (`#btn-hint`, ẩn đi khi đã hoàn thành câu đố):
    - Khi bấm **`[Gợi ý]`** lần đầu trong câu đố: Hiển thị popup xác nhận (`Confirm Hint Modal`), chỉ rõ số điểm ELO sẽ bị trừ (VD: *"Bạn có chắc muốn xem gợi ý cho thế cờ này? Điểm ELO sẽ bị trừ 16 ELO và chuỗi Streak về 0"*).
    - Nếu người dùng bấm `[Hủy]`: Đóng popup, không tiết lộ gợi ý và giữ nguyên điểm ELO.
    - Nếu người dùng bấm `[Đồng ý xem gợi ý]`: Đóng popup, áp dụng trừ ELO proportional ngay lập tức, reset chuỗi Streak về 0, đánh dấu `hintUsed = true`, highlight ô chứa quân cờ cần đi (`board.selectedSquare`) và hiển thị các ô đi hợp lệ.
    - Nếu người dùng bấm lại `[Gợi ý]` sau khi đã xác nhận trước đó: Hệ thống tự động re-highlight ô cờ gợi ý mà không hiển thị popup và không trừ thêm điểm.
  - **Cột 5 (Bottom-Right):** Nút **`[⏭ Bỏ qua (Skip)]`** (`#btn-skip`) khi đang giải dở, tự động chuyển thành nút **`[Tiếp theo (Next)]`** (`#btn-next`) nổi bật khi câu đố đã giải xong.
    - Khi bấm **`[Bỏ qua]`**: Hiển thị popup xác nhận (`Confirm Skip Modal`), chỉ rõ số điểm ELO sẽ bị trừ (VD: *"Bạn có chắc muốn bỏ qua thế cờ này? Điểm ELO sẽ bị trừ 16 ELO và chuỗi Streak về 0"*).
    - Nếu người dùng bấm `[Hủy]`: Đóng popup, giữ nguyên ván cờ.
    - Nếu người dùng bấm `[Đồng ý bỏ qua]`: Đóng popup, áp dụng trừ ELO proportional theo công thức, reset chuỗi Streak về 0, cập nhật điểm trên Header và tải câu đố mới.
    - Khi bấm **`[Tiếp theo]`**: Đóng popup kết quả và tải câu đố mới.

#### F. Cơ chế Lưu trạng thái đang giải dở (In-Progress Puzzle Auto-Save):
- Tự động lưu trạng thái câu đố đang giải dở (`puzzle`, `currentMoveIndex`, `hasFailed`, `hintUsed`) vào `localStorage` (`einkchess_saved_puzzle`).
- **Khôi phục khi tải lại trang (Reload/Resume):** Khi người dùng reload trang hoặc mở lại trình duyệt, hệ thống tự động nhận diện và khôi phục đúng câu đố đang giải cùng tiến độ nước đi, trạng thái đã sai (`hasFailed`) hoặc đã dùng gợi ý (`hintUsed`).
- **Chống gian lận (Anti-Cheat):** Ngăn chặn người chơi tải lại trang để đổi câu đố khác hoặc xóa cờ phạm quy/gợi ý mà không bị trừ điểm ELO. Muốn đổi câu khác bắt buộc phải bấm **`[Bỏ qua]`** (bị trừ ELO proportional theo quy định).
- **Xóa trạng thái lưu:** Tự động xóa khỏi `localStorage` khi câu đố đã hoàn thành (`puzzleSolved`), khi bấm **`[Tiếp theo]`** (`nextPuzzle`), hoặc khi xác nhận **`[Đồng ý bỏ qua]`** (`confirmSkip`).

#### G. Hành trình Giải Cờ Thế & Quản lý Cấp độ Mở khóa theo ELO (Puzzle Journey & Tier Progression):
- **Cơ chế Khởi đầu & Reset 1 lần (Migration v1):**
  - Khi bắt đầu hoặc sau đợt cập nhật lộ trình mới, dữ liệu người chơi được reset 1 lần duy nhất về mốc ban đầu: `puzzle_elo = 400`, `puzzle_streak = 0`, `max_unlocked_level = 1`.
  - Hiển thị popup **`[HÀNH TRÌNH GIẢI CỜ THẾ (PUZZLE JOURNEY)]`** để giới thiệu lộ trình, mặc định chọn Level 1 và khóa các Level 2–8.
- **8 Cấp độ trong Lộ trình:**
  1. **Cấp 1 (~400 ELO):** Mới chơi / Beginner (*Mở khóa mặc định / Dễ nhất*).
  2. **Cấp 2 (~800 ELO):** Tập sự / Casual (Biết luật cơ bản).
  3. **Cấp 3 (~1200 ELO):** Trung bình / Intermediate (Nắm vững chiến thuật).
  4. **Cấp 4 (~1600 ELO):** Nâng cao / Advanced (Chiến thuật phức tạp).
  5. **Cấp 5 (~2000 ELO):** Chuyên gia / Expert (Thế cờ bán chuyên).
  6. **Cấp 6 (~2400 ELO):** Kiện tướng / Master (Đòn phối hợp đỉnh cao).
  7. **Cấp 7 (~2800 ELO):** Đại kiện tướng / Grandmaster (Thử thách siêu cấp).
  8. **Cấp 8 (~3100+ ELO):** Huyền thoại / Super GM (Đỉnh cao tối thượng).
- **Giao diện Khóa / Mở Khóa trên E-ink:**
  - Các cấp độ chưa mở khóa hiển thị biểu tượng icon Lock dạng vector inline SVG (tránh lỗi font emoji trên trình duyệt WebKit Kindle), dòng chữ `Đã khóa (Cần {elo} ELO)` / `Locked (Reach {elo} ELO)`, style viền xám đứt đoạn, nền xám nhạt (`.puzzle-skill-btn.locked`), vô hiệu hóa thao tác click (`disabled`).
  - Các cấp độ đã mở khóa có thể click chọn tự do, hiển thị nút viền đen rõ nét. Cấp độ đang chọn được tô nền đen chữ trắng (`.puzzle-skill-btn.active`).
- **Cơ chế Mở khóa Tự động khi Leo ELO:**
  - Mỗi khi người chơi giải đố thành công và điểm ELO tăng vượt ngưỡng của cấp độ tiếp theo, cấp độ mới sẽ được tự động mở khóa và lưu vào `einkchess_puzzle_max_unlocked_lvl`.
- **Chuyển đổi linh hoạt giữa các Level đã mở:**
  - Người chơi có thể tự do mở modal Hành trình (`#skill-modal`) qua nút **`[Hành trình (Journey)]`** trên thanh Action Bar.
  - **Modal Footer linh hoạt:**
    - **Lần đầu tiên vào Puzzle:** Nút **`[Đóng (Close)]`** được ẩn đi (`display: none`), nút **`[Bắt đầu Hành trình mới (Start New Journey)]`** chuyển thành Primary toàn chiều rộng (`btn btn-primary btn-block`) để bắt buộc người chơi thiết lập cấp độ khởi đầu. Người chơi không thể tắt modal ra màn hình trống.
    - **Khi đã thiết lập (Người chơi thông thường):** Modal hiển thị 2 nút: Nút **`[Đóng (Close)]`** màu đen nổi bật (Primary) giúp người dùng an tâm đóng modal mà không đổi trạng thái; Nút **`[Bắt đầu Hành trình mới (Start New Journey)]`** viền trắng (Secondary) chỉ dùng khi người chơi chủ động muốn chọn lại cấp độ và khởi tạo lại điểm ELO.
  - Khi chọn chuyển về level thấp hơn (VD: đang ở Level 4 chuyển về Level 1), điểm ELO hiện tại được đặt về mốc của Level 1 (400 ELO) để giải đố từ đầu, nhưng **không làm mất cấp độ cao nhất đã mở khóa (`max_unlocked_level = 4`)**. Người chơi vẫn có thể mở lại Journey để chuyển đến các cấp độ 2, 3, 4 bất cứ lúc nào.

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
  - `einkchess_puzzle_elo`: Điểm ELO giải đố (Mặc định: 400).
  - `einkchess_puzzle_streak`: Chuỗi câu đố giải đúng liên tiếp hiện tại và kỷ lục.
  - `einkchess_puzzle_setup_done`: Đánh dấu đã hoàn tất chọn trình độ giải đố khởi đầu (`true` / `false`).
  - `einkchess_saved_bot_game`: Trạng thái bàn cờ, lịch sử nước đi ván đang chơi dở với Bot.
  - `einkchess_saved_puzzle`: Trạng thái câu đố đang giải dở (object gồm puzzle data, index nước cờ, trạng thái sai/gợi ý).
  - `einkchess_pid`: UUID định danh thiết bị duy nhất.
  - `einkchess_pvp_code`: Mã phòng PvP đang hoạt động.
  - `einkchess_quota`: Object lưu trữ số lượt chơi đã dùng trong ngày (`{ date: 'YYYY-MM-DD', bot_cloud: 0, puzzle: 0, pvp: 0 }`).
  - `einkchess_default_bot_lvl`: Cấu hình độ khó của Bot AI được chọn gần nhất (Mặc định: 1).
  - `einkchess_default_side`: Bên cầm quân được chọn gần nhất (Trắng `w` / Đen `b`, mặc định: `w`).
  - `einkchess_auto_refresh_modal`: Tùy chọn Bật/Tắt tự động nháy trắng làm mới màn hình khi đóng popup (Mặc định: `false`).

### 5.3. Tracking Active Users & Trang Thống Kê (DAU / MAU / Realtime)
- **Mục tiêu:** Đếm người dùng thực tế và phân tích lưu lượng mà không gây nặng máy Kindle.
- **Cơ chế hoạt động:**
  - Client gửi **Beacon Ping** siêu nhẹ (~500 bytes XHR) khi khởi động app và khi bắt đầu ván cờ mới.
  - Gửi kèm: `device_id` (UUID), `device_type` (Kindle Basic, Paperwhite, Oasis, Scribe, Desktop), `lang`, `action_type` (`pageview`, `play_bot`, `play_bot_resume`, `play_puzzle`, `play_pvp`).
  - Backend lưu vào bảng `active_pings` / tổng hợp số liệu qua SQL View `v_traffic_stats` (khử trùng lặp theo từng `device_id`, tính toán dựa trên bản ghi mới nhất của mỗi thiết bị):
    - **Realtime Users:** Số thiết bị active trong 10 phút, 30 phút, và 60 phút (1 giờ) gần nhất.
    - **DAU / WAU / MAU / YAU:** Số thiết bị duy nhất hôm nay / 7 ngày qua / 30 ngày qua / 365 ngày qua (Rolling window).
    - **Device Views:** Số lượt thiết bị xem hôm nay (`device_views_today`) và tổng lượt thiết bị xem tích lũy toàn thời gian (`total_device_views_all_time`).
- **Trang Cài Đặt Trò Chơi (`settings.html`):**
  - Cung cấp trang tùy chọn cài đặt trò chơi (Game Settings) công khai, liên kết từ thẻ thứ 3 trên Trang chủ `index.html`.
  - Thiết kế tối giản, độ tương phản cao, phông chữ lớn và tối ưu hóa touch targets (min 44px) cho thiết bị E-ink.
  - **Tùy chọn Cài đặt Cho phép Đi lại (Allow Undo Setting):**
    - Cho phép người chơi Bật (ON) / Tắt (OFF) tính năng Đi lại (Undo) khi chơi cờ với Bot.
    - Trạng thái được lưu trong `localStorage` (`einkchess_allow_undo`), mặc định là Tắt (`false`).
    - Áp dụng đồng bộ cho toàn bộ Bot v1 (`play-bot.html`) và Bot v2 (`play-bot-v2.html`): khi Tắt, nút Undo sẽ tự động ẩn và thao tác đi lại bị vô hiệu hóa; khi Bật, nút Undo hiển thị và hoạt động bình thường.
  - **Tùy chọn Cài đặt Giao diện Quân cờ (Piece Theme Setting):**
    - Cho phép người chơi chọn giữa 3 kiểu hiển thị quân cờ:
      1. `Chess.com` (`ejgfv` - Mặc định): Bộ quân cờ PNG chuẩn phong cách Neo, đã được xử lý tăng cường tương phản cao (quân Đen thân đen tuyền viền trắng nổi; quân Trắng giữ nguyên màu thân và bóng đổ gốc, nét vẽ bên trong và viền bao ngoài nâng cấp thành đen tuyền `#000000` sắc nét) lưu trữ offline tại `images/pieces/ejgfv/`.
      2. `Lichess` (`cburnett`): Bộ quân cờ SVG vector chuẩn cburnett tương phản cao siêu nhẹ (<1KB/file), sắc nét ở mọi độ phân giải E-ink, lưu trữ offline tại `images/pieces/cburnett/`.
      3. `Unicode` (`unicode`): Ký tự cờ văn bản cổ điển (`♔`, `♚`, ...).
    - Trạng thái được lưu trong `localStorage` (`einkchess_piece_theme`), mặc định là `Chess.com` (`ejgfv`).
    - Nút chọn theme trên trang Cài đặt (`settings.html`) hiển thị trực tiếp icon quân Mã Trắng tương ứng (`wn.png`, `wn.svg`, `♞`) thay cho text, có `title`/`aria-label` cho trợ năng.
    - Tự động tương thích và hiển thị đồng bộ trên bàn cờ (`ChessBoard`), danh sách quân đã ăn (`captured-white`, `captured-black`) và hộp thoại phong cấp (Promotion Dialog) ở tất cả các chế độ chơi (`play-bot-v2`, `play-bot`, `puzzles`, `analysis`).
  - **Tùy chọn Gợi ý nước đi (Show Hints):** Bật/Tắt hiển thị các chấm tròn gợi ý nước đi hợp lệ.
  - **Tùy chọn Đánh giá nước đi (Move Review):** Bật/Tắt huy hiệu đánh giá và nhận xét chiến thuật tức thì sau mỗi nước đi khi đấu Bot v2.
  - **Tùy chọn Tự động làm mới khi đóng popup (Auto Refresh on Popup Close):**
    - Cho phép người chơi Bật (ON) / Tắt (OFF) tự động flash trắng khử bóng mờ sau khi đóng các popup (mặc định: `false` / TẮT). Khi Bật, hệ thống áp dụng cơ chế 120ms Settlement Delay và 200ms white overlay khi đóng bất kỳ modal nào. Nút Refresh thủ công trên action bar luôn hoạt động độc lập không phụ thuộc cài đặt này.

- **Trang Thống Kê Lưu Lượng Nội Bộ (`stats.html`):**
  - Trang báo cáo lưu lượng truy cập và phân tích người chơi dành riêng cho quản trị viên / nhà phát triển.
  - Không hiển thị công khai trên giao diện người dùng thông thường (đã gỡ bỏ toàn bộ liên kết điều hướng từ Trang chủ và sitemap công khai, chặn bot tìm kiếm qua `robots.txt`).
  - Truy cập trực tiếp qua URL `stats.html`.
  - Truy vấn trực tiếp REST API từ Supabase, hiển thị các mốc Realtime (10m, 30m, 60m) cùng các số liệu lưu lượng (DAU, WAU, MAU, YAU, Device Views).
  - **Biểu đồ Line Daily Active Users (DAU Trend - 7D / 30D / 90D):**
    - Sử dụng kỹ thuật Pure SVG (ES5 Vanilla JS), không phụ thuộc thư viện bên thứ 3, tối ưu độ tương phản đơn sắc nét cao cho màn hình E-ink (không animation, không blur/shadow).
    - Cung cấp nhóm nút chuyển đổi nhanh 3 mốc: `7 Ngày (7D)`, `30 Ngày (30D)`, `90 Ngày (90D)`.
    - Hiển thị thống kê tóm tắt nhanh: Trung bình DAU (`Average`) và Đỉnh DAU (`Peak`) trong khoảng thời gian đã chọn.
    - Trục tung Y có lưới tọa độ đứt nét xám nhạt tự động căn chỉnh mốc tối đa; trục hoành X đánh dấu các mốc ngày (DD/MM); đường biểu diễn nét đen đậm (`stroke-width: 2.5px`) kèm các điểm chấm tròn và nhãn số lượng người dùng.
    - Đồng bộ truy vấn qua SQL View `v_daily_active_users` (tổng hợp `COUNT(DISTINCT device_id)` theo ngày trong 90 ngày qua) và tự động sinh dữ liệu mẫu hợp lý khi ở chế độ ngoại tuyến (Offline Mode).
  - Tự động fallback sang chế độ ngoại tuyến (Offline Mode) an toàn khi chưa cấu hình Supabase URL/Anon Key trong khi mục Cài đặt và biểu đồ mẫu vẫn hoạt động trơn tru.

### 5.4. Cơ chế Quota Freemium & Lộ trình Tính phí
1. **Chế độ Miễn phí Hoàn toàn (Free & Unlimited):**
   - **Bot Level 1-3:** Chạy 100% Local Minimax offline trên client, **KHÔNG giới hạn số ván chơi** và **KHÔNG tính vào quota**.
2. **Hạn mức Miễn phí Hàng ngày (Daily Free Tier - Reset 00:00 mỗi ngày):**
   - ☁ **Bot Level 4-8 (Cloud AI):** Miễn phí **3 ván/ngày**.
   - 🧩 **Giải đố (Puzzles):** Miễn phí **3 câu đố/ngày**.
   - 👥 **Đấu với bạn (PvP Online):** Miễn phí **3 trận/ngày**.
   - Khi hết lượt, hiển thị thông báo thân thiện và gợi ý chuyển sang Bot Level 1-3 hoặc ủng hộ tác giả.
3. **Lộ trình Tính phí & Ủng hộ (Monetization):**
   - **Giai đoạn 1 (Hiện tại): Donate — Support me on Ko-fi & Momo:**
     - Tích hợp nút **`[☕ Ủng hộ tác giả (Support on Ko-fi)]`** trên Header / Footer / Popup khi hết lượt.
      - Hiển thị **Mã QR Ko-fi (`https://ko-fi.com/sendwebtokindle`) & Momo** rõ nét để người dùng dùng điện thoại quét và donate nhanh chóng.
   - **Giai đoạn 2 (Tương lai khi SEO & User Base lớn): Gói Đăng ký định kỳ (Subscription):**
     - Đăng ký theo tháng/năm qua kích hoạt thiết bị bằng QR Code từ điện thoại.
     - Mở khóa chơi không giới hạn mọi chế độ.

### 5.5. Kiến trúc Backend Độc lập & Dễ Dàng Di Chuyển (Portable Backend)
- Thiết kế **API Service Adapter** ở tầng Frontend (`js/chess-backend.js`).
- Chuẩn hóa toàn bộ RESTful API endpoint (`/api/ping`, `/api/quota`, `/api/pvp/*`).
- Cơ sở dữ liệu sử dụng **PostgreSQL chuẩn (Standard SQL)**:
  - Có thể chạy trực tiếp trên Supabase (hiện tại).
  - Khi cần scale-up, dễ dàng migrate 100% sang VPS riêng (Docker + Node.js/Go/Python + PostgreSQL + Redis) chỉ bằng việc thay đổi base URL `API_ENDPOINT` trong file config mà không phải sửa lại code client.

### 5.6. Cấu hình Deploy & Quy trình Đóng gói (Vercel & Cloudflare Pages)
- **Quy trình build và đóng gói tách biệt:** Để tránh triển khai các file không cần thiết (như `node_modules`, `tests/` và các tệp cấu hình dev) lên hosting, dự án sử dụng quy trình build qua Node.js script:
  - Thư mục build đầu ra: `dist/`
  - Lệnh build: `npm run build` (lệnh này sẽ thực thi script `scripts/build.js`).
  - Cơ chế nhúng biến môi trường khi build (Build-time Injection):
    1. Trình build dọn dẹp và tạo thư mục `dist/`, sau đó sao chép toàn bộ các tệp tin tĩnh cần thiết bao gồm `*.html`, `css/`, và `js/` vào đó.
    2. Đọc các biến môi trường `SUPABASE_URL` và `SUPABASE_ANON_KEY` từ môi trường build và thực hiện tìm kiếm - thay thế các chuỗi placeholder tương ứng (`%%SUPABASE_URL%%`, `%%SUPABASE_ANON_KEY%%`) trong file output `dist/js/chess-backend.js`. Điều này giúp bảo mật thông tin kết nối Supabase mà không cần phải ghi cứng hay commit key vào Git.
    3. Trong môi trường phát triển cục bộ (Local Dev) mà không chạy qua tiến trình build, file gốc `js/chess-backend.js` vẫn giữ nguyên chuỗi placeholder. Hệ thống đã tích hợp cơ chế kiểm tra an toàn tự động phát hiện placeholder và vô hiệu hóa telemetry một cách êm thấm, tránh gây lỗi JavaScript trên trình duyệt.
- **Cấu hình trên Vercel / Cloudflare Pages Dashboard:**
  - **Build command:** `npm run build`
  - **Build output directory / Publish directory:** `dist`
  - **Environment Variables:** Đặt hai biến `SUPABASE_URL` và `SUPABASE_ANON_KEY` tương ứng với API Endpoint dự án Supabase của bạn trong Settings của Vercel Dashboard.

### 5.7. SEO & Khả năng Khám phá bởi AI Agent (Agent Discovery)
- **Mục tiêu:** Site phải được crawler truyền thống lập chỉ mục và được các AI agent đọc hiểu qua các giao thức khám phá chuẩn (RFC 9309, RFC 8288, RFC 9727, Content Signals, ARD, Agent Skills Discovery).
- **Chính sách nội dung với AI:** Cho phép **mọi** crawler thu thập và lập chỉ mục, cho phép agent đọc để trả lời câu hỏi người dùng, nhưng **từ chối** dùng nội dung để huấn luyện mô hình sinh.
  - Khai báo bằng `Content-Signal: search=yes, ai-input=yes, ai-train=no` trong `robots.txt`.
  - Chỉ thị `Content-Signal` phải được **lặp lại trong từng nhóm `User-agent`**, vì theo RFC 9309 crawler chỉ áp dụng nhóm khớp cụ thể nhất và **không kế thừa** chỉ thị từ nhóm `*`.
- **Các tệp khám phá tĩnh (phát sinh tại thư mục gốc):**

| Tệp | Vai trò |
|---|---|
| `robots.txt` | Quy tắc crawl + `Content-Signal` + trỏ tới sitemap. Chặn 2 trang legacy `chess-old.html`, `puzzles-old.html` để tránh trùng lặp nội dung. |
| `sitemap.xml` | 5 URL chuẩn tắc (home, play-bot-v2, puzzles, analysis, stats). |
| `.well-known/api-catalog` | Danh mục API theo RFC 9727, kiểu `application/linkset+json`. |
| `.well-known/ai-catalog.json` | Manifest ARD mô tả năng lực site, mỗi entry có `representativeQueries` để registry tạo embedding. |
| `.well-known/agent-skills/index.json` | Chỉ mục Agent Skills Discovery v0.2.0, kèm digest `sha256` từng skill. |
| `.well-known/agent-skills/*/SKILL.md` | 2 skill: `fetch-chess-puzzles`, `play-chess-on-eink`. |
| `docs/api.md`, `docs/openapi.json` | Tài liệu và đặc tả OpenAPI 3.1 cho bộ dữ liệu puzzle tĩnh (chỉ đọc, có CORS, không cần khóa). |
| `md/*.md` | Bản Markdown của từng trang, dùng cho content negotiation. |

- **Tự động hóa (chống lệch dữ liệu):** `scripts/build-seo.js` sinh lại `agent-skills/index.json` (băm `sha256` thực tế của từng `SKILL.md`, đọc `description` từ frontmatter) và `sitemap.xml` (`lastmod` theo mtime tệp). Script này được `scripts/build.js` gọi **trước** khi copy sang `dist/`, nên digest và ngày cập nhật không bao giờ lệch với nội dung thật.
- **Markdown for Agents (Content Negotiation):** Request kèm `Accept: text/markdown` tới trang HTML sẽ nhận bản Markdown tương ứng; trình duyệt thường vẫn nhận HTML. Response gắn `Vary: Accept` để CDN không trộn cache.
- **Cấu hình `vercel.json` — lý do dùng `routes` thay vì `headers`/`rewrites`:** Trên Vercel, `rewrites` chỉ chạy **sau** khi kiểm tra filesystem, nên rewrite cho `/puzzles.html` sẽ không bao giờ kích hoạt vì tệp đó có thật. Chỉ `routes` chạy **trước** filesystem. Vercel **không cho phép** dùng chung `routes` với `headers`/`rewrites`/`redirects`/`cleanUrls`, do đó toàn bộ quy tắc (Link header, Content-Type, CORS, content negotiation) đều nằm trong mảng `routes`.
  - `vercel.json` đặt ở **gốc repo**, không copy vào `dist/` — Vercel đọc tệp này từ gốc repository chứ không phải từ thư mục output.
  - Link header (RFC 8288) toàn site trỏ tới `api-catalog`, `service-desc`, `service-doc` và `describedby`.
  - Thẻ `rel="alternate"` (bản Markdown) đặt trong `<head>` từng trang **chứ không** thêm Link header thứ hai, tránh việc hai route cùng ghi một header key và đè lên nhau.
- **Thẻ `<head>` chuẩn tắc:** Mỗi trang chính có `<link rel="canonical">` (URL tuyệt đối) và `<link rel="alternate" type="text/markdown">` trỏ tới bản Markdown.
- **Phạm vi không triển khai (có chủ đích):** Không phát hành `openid-configuration`, `oauth-protected-resource`, `auth.md`, MCP Server Card hay bản ghi DNS-AID. EinkChess **không có** backend ứng dụng, API cần xác thực hay MCP server; công bố metadata trỏ tới endpoint không tồn tại sẽ khiến agent thật đi vào ngõ cụt. Ngoài ra Vercel DNS không hỗ trợ bản ghi SVCB/HTTPS và ký DNSSEC nên DNS-AID không khả thi trên hạ tầng hiện tại.

---

## 6. LỘ TRÌNH TRIỂN KHAI THEO GIAI ĐOẠN (5 PHASES)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: MVP - Core Engine, Board, Bot 1-3, i18n VI/EN, Ping, Ko-fi QR │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Online AI - Chess-API.com (Level 4-8), Quota 3 matches/day   │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Puzzle Mode - Tải động ELO Puzzle, Quota 3 puzzles/day       │
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
- **[TÍCH HỢP NGAY TỪ PHASE 1] Donate Ko-fi & Momo QR:**
  - [x] Tích hợp nút `[☕ Donate / Ủng hộ]` trên Header và Footer.
  - [x] Xây dựng Modal hiển thị Mã QR song song (Ko-fi và Momo) độ nét cao, tối ưu hóa hiển thị side-by-side trên màn hình E-ink.

### Phase 2 — Online AI (Level 4-8 Kiện Tướng + Quota 3 trận/ngày)
- Xây dựng `js/chess-api-client.js`: Giao tiếp API `POST https://chess-api.com/v1` qua XHR.
- Tích hợp 5 cấp độ nâng cao (~1400 đến ~2400 ELO), độ sâu tính toán depth 4 đến 18.
- Áp dụng Quota 3 trận Cloud AI/ngày (tự động reset 00:00).
- Xử lý trạng thái "Đang suy nghĩ..." và cơ chế tự động fallback về local engine khi mất mạng.

### Phase 3 — Puzzle Mode (Giải Đố Thích Ứng ELO)
- **Nguồn Dữ Liệu Câu Đố:**
  - [x] Sử dụng Lichess Open Database (`https://database.lichess.org/#puzzles`) — file `lichess_db_puzzle.csv.zst` (~6 triệu câu đố, nén Zstandard, lưu Git LFS).
  - [x] Viết script `scripts/build-puzzles.js` (Node.js): reservoir sampling từ ~5.3M câu đố (RD ≤ 100), tạo kiến trúc folder `data/puzzles/{ELO}/{NNN}.json` + `manifest.js`.
  - [x] Output: 25 folders (400→2800), mỗi folder 2 file × 100 puzzles = 5,000 puzzles tổng, ~1.2MB.
  - [x] Hỗ trợ các chế độ: `node scripts/build-puzzles.js` (đọc .zst local), `--fetch-lichess` (download từ Lichess), `--count=N` (tùy biến số lượng), `--clean-only` (xóa sạch thư mục).
  - [x] GitHub Actions weekly cron & manual trigger (`.github/workflows/refresh-puzzles.yml`): tự động xoay vòng bộ puzzle mỗi thứ Hai hoặc bấm nút Run workflow thủ công với các tham số tùy chọn.
- **Giao diện `puzzles.html`:**
  - [x] Kế thừa layout chuẩn E-ink từ `play-bot.html` (header ELO + streak, board container, status bar hiển thị lượt đi & quân bị bắt nằm dưới bàn cờ và trên action bar, action bar 5 cột: Level, Refresh, Puzzle Meta, Hint, Skip/Next).
  - [x] Nút hành động: Cấp độ (Level), Làm mới (Refresh), Gợi ý (♙ Hint), Bỏ qua (Skip), Tiếp theo (Next). Không dùng emoji tránh lỗi font Kindle.
  - [x] Modal hoàn thành gọn nhẹ (`max-width: 320px`, căn giữa) hiển thị kết quả ELO thay đổi.
  - [x] Scripts load order: `chess-engine.js` → `chess-storage.js` → `chess-i18n.js` → `chess-backend.js` → `chess-board.js` → `manifest.js` → `chess-puzzles.js`.
- **Logic `js/chess-puzzles.js` (ES5 thuần):**
  - [x] `PuzzleManager.init()`: Khởi tạo `ChessI18n.init()`, tạo `ChessEngine` + `ChessBoard`, gọi `ChessStorage.applyAutoLayout()`.
  - [x] `loadPuzzle()`: Đọc `PUZZLE_MANIFEST`, random chọn file, fetch `data/puzzles/{ELO}/{NNN}.json` qua `XMLHttpRequest`. Fallback sang bucket gần nhất nếu không tìm thấy. Tự động kiểm tra và khôi phục câu đố đang giải dở qua `resumePuzzle()`.
  - [x] `pickPuzzle(puzzles)`: Lọc bỏ ID đã chơi (hash lookup O(1) từ `ChessStorage.getPlayedPuzzlesHash()`), random chọn 1 câu chưa chơi. Nếu hết → clear lịch sử và dùng lại toàn bộ.
  - [x] `startPuzzle(puzzle)`: Load FEN, parse UCI Moves, xác định `puzzleColor` (đối diện với bên đi trước trong FEN), tự động đi nước đầu của đối thủ (move[0]), set `currentMoveIndex = 1`, lưu trạng thái qua `saveCurrentPuzzleState()`.
  - [x] `handlePlayerMove(move)`: Nhận object move từ `ChessBoard.onMove()`, so khớp `{from, to, promotion}` với UCI expected. Đúng → `applyUciMove` + bot reply. Sai → set `hasFailed = true` + reset streak (KHÔNG trừ ELO ngay), lưu trạng thái để chống reload reset sai.
  - [x] `useHint()` / `confirmHint()` / `closeHintModal()`: Mở modal xác nhận với số điểm ELO sẽ bị trừ. Khi xác nhận, áp dụng trừ proportional ELO ngay, reset streak về 0, highlight ô quân cờ (`board.selectedSquare`), đánh dấu `hintUsed = true` và lưu trạng thái. Nhấn lại Hint khi đã dùng sẽ re-highlight mà không trừ thêm điểm.
  - [x] `puzzleSolved()`: Proportional ELO — clean solve: `+round(K×(1−E))` min +3, failed (không dùng hint): `−round(K×E)`, hint used: +0 (vì điểm đã bị trừ khi xác nhận gợi ý, không bị trừ thêm lần 2 khi giải xong). Xóa saved puzzle khỏi localStorage và hiển thị modal kết quả.
  - [x] `skipPuzzle()` / `confirmSkip()`: Áp dụng proportional ELO loss, reset streak, xóa saved puzzle và tải câu mới.
  - [x] `updateTurnStatus()`: Hiển thị "Lượt Trắng đi" / "Lượt Đen đi" / "Đối thủ đang đi..." tương ứng trạng thái.
  - [x] `updateCapturedPieces()`: Hiển thị quân bị bắt trên status bar.
- **Cập nhật `js/chess-storage.js`:**
  - [x] Thêm STORAGE_KEYS: `PUZZLE_STREAK`, `PUZZLE_MAX_STREAK`, `PLAYED_PUZZLES`, `SAVED_PUZZLE`.
  - [x] Thêm hàm: `getPuzzleStreak()`, `setPuzzleStreak()`, `getMaxPuzzleStreak()`, `setMaxPuzzleStreak()`, `getPlayedPuzzles()`, `getPlayedPuzzlesHash()` (O(1) lookup), `addPlayedPuzzle(id)` (giới hạn 5000 ID gần nhất), `clearPlayedPuzzles()`, `savePuzzle(state)`, `getSavedPuzzle()`, `clearSavedPuzzle()`.
- **Cập nhật `js/chess-i18n.js`:**
  - [x] Thêm các key dịch VI/EN cho Puzzle Mode: `puzzle.btn_level`, `puzzle.btn_hint`, `puzzle.btn_skip`, `puzzle.btn_next`, `puzzle.turn_white`, `puzzle.turn_black`, `puzzle.bot_moving`, `puzzle.status_correct`, `puzzle.status_incorrect`, `puzzle.status_hint_used`, `puzzle.status_playing`, `puzzle.status_skipped`, `puzzle.streak`, `puzzle.success_title`, `puzzle.success_msg`, `puzzle.failed_title`, `puzzle.failed_msg`, `puzzle.hint_solved_msg`, `puzzle.confirm_hint_title`, `puzzle.confirm_hint_body`, `puzzle.btn_confirm_hint`, `puzzle.confirm_skip_title`, `puzzle.confirm_skip_body`, `puzzle.btn_confirm_skip`, `puzzle.elo_change`, `puzzle.info_modal_title`, `puzzle.info_section_puzzle`, `puzzle.info_section_player`, `puzzle.info_puzzle_id`, `puzzle.info_puzzle_elo`, `puzzle.info_player_side`, `puzzle.info_themes`, `puzzle.info_player_elo`, `puzzle.info_current_streak`, `puzzle.info_max_streak`.
  - [x] Thêm hàm alias `getTranslation(key, params)` → `this.t(key, params)`.
- **Cập nhật `index.html`:**
  - [x] Nút "Bắt đầu Giải đố" trỏ trực tiếp `window.location.href='puzzles.html'` (thay vì mở modal "coming soon").
- [x] Chưa Áp dụng Quota 3 câu đố/ngày.

### Phase 5 — Phân Tích Sau Ván Đấu (Post-Game Analysis) & Dashboard
- **Màn hình Phân Tích `analysis.html`:**
  - [x] Thiết kế giao diện 1 màn hình chuẩn E-ink không cuộn (Zero-Scroll Kindle Layout): Bàn cờ vuông bên trái + Bảng danh sách lịch sử nước đi 2 cột (Trắng/Đen) cuộn dọc bên phải (tự động cuộn theo nước đang chọn và gắn huy hiệu đánh giá `★`, `✔`, `?!`, `?`, `??`) + Footer chia 2 cột (Cột trái: 4 phím điều hướng `|<`, `<`, `>`, `>|` dạng lưới 2x2 chuẩn cảm ứng E-ink ≥38-44px; Cột phải: Thẻ phân tích nước đi chứa Điểm số, Huy hiệu, Nước đi thay thế tốt nhất và Lời giải thích chiến thuật) + Đồ thị diễn biến lợi thế (Evaluation Advantage Trend Chart đơn sắc với đường cơ sở `0.0` và con trỏ chỉ vị trí nước đi đồng bộ) + Nút "Summary" (Tổng quan ván đấu) tích hợp gọn gàng trên thanh Header.
  - [x] **Cơ chế Phân tích toàn bộ ván đấu (Option B - Batch Analysis):** Khi mở trang phân tích, hiển thị Modal chọn mức độ thời gian tính toán mỗi nước đi (600ms Nhanh ~5-6 ply, 1200ms Kỹ lưỡng ~7-8 ply, 2000ms Chuyên sâu ~8-9+ ply) kèm tổng thời gian tính toán ước tính động theo số lượng nước của ván cờ. Sau khi bấm Bắt đầu, hiển thị thanh tiến trình đơn sắc (Progress Bar `border: 2px solid #000; background: #000; width: X%`) chạy phân tích toàn bộ ván đấu.
  - [x] **Hiển thị thông số Engine thực tế (Engine Diagnostics Benchmark):** Hiển thị trực tiếp `Depth` (độ sâu tối đa đạt được), `Time` (thời gian tính toán thực tế ms) và `Nodes` (tổng số vị trí duyệt) trên từng thẻ nước đi và tính toán `Độ sâu TB (Avg Depth)` & `Thời gian tính / nước` trong Bảng tổng quan ván đấu. Giúp người dùng trên Kindle kiểm nghiệm năng lực tính toán phần cứng thực tế.
  - [x] **Duyệt nước đi tức thì với Huy hiệu:** Toàn bộ nước đi trên bảng lịch sử đã được gắn sẵn huy hiệu đánh giá (`1. e4★ e5✔`...), người chơi có thể bấm tới/lui hoặc chạm vào bất kỳ nước nào để xem phân tích và giải thích ngay lập tức.
  - [x] Bộ nhận diện đòn chiến thuật & đánh giá nước đi (>20 trường hợp): Đòn bắt đôi (Fork/Royal Fork), ghim/xiên quân (Pin/Skewer), đòn tấn công mở (Discovered attack), ăn quân miễn phí (Free piece), sai lầm mất quân (Hanging piece blunder), đổi quân có lợi/thua thiệt (Trades), phong cấp (Promotion), tốt thông (Passed pawn), kiểm soát trung tâm (Center control), phát triển quân (Piece development), chiếm cột mở (Open file), chiếm tiền đồn (Outpost), giải vây (Defense), đơn giản hóa thế cờ (Simplification), v.v.
  - [x] Hỗ trợ song ngữ Tiếng Việt & Tiếng Anh (`ChessI18n`) chuyển đổi trực tiếp trên Header.
  - [x] Tích hợp nút "Phân tích ván đấu" vào Modal Game Over của `play-bot-v2.html` và lưu dữ liệu ván đấu tự động qua `ChessStorage.saveAnalysisGame()`.
  - [x] Tích hợp nút "Xem lại & Phân tích ván trước" trên màn hình chính `index.html` trong Modal Cấu hình ván mới nếu có dữ liệu ván đấu đã chơi trước đó.
  - [x] Chuyển đổi hiển thị điểm ELO trên `index.html`: Bỏ huy hiệu ELO ở thanh Header chung, đưa điểm ELO tương ứng vào từng thẻ chế độ (`#bot-elo-badge` tại thẻ Play vs Bot, `#puzzle-elo-badge` tại thẻ Chess Puzzles).
  - [x] Tách riêng trang Cài đặt (`settings.html`) và Thống kê lưu lượng (`stats.html`):
    - Thẻ thứ 3 trên Trang chủ chuyển thành "Cài đặt (Settings)" dẫn trực tiếp vào `settings.html`.
    - `settings.html` chứa toàn bộ tùy chỉnh: Cho phép Đi lại (Undo), Giao diện quân cờ (Theme), Gợi ý nước đi (Show Hints) và Đánh giá nước đi (Move Review).
    - `stats.html` tách thành trang quản trị lưu lượng nội bộ (Traffic Overview, Biểu đồ hoạt động người dùng DAU / WAU / MAU 7D/30D/90D SVG đa chế độ với cửa sổ rolling 7 ngày / 30 ngày, thống kê TB và đỉnh, hỗ trợ chạm/rê chuột vào từng điểm để xem giá trị chi tiết), gỡ bỏ liên kết từ trang chủ và sitemap công khai, chặn crawler qua `robots.txt`.
  - [x] Chuyển đổi hiển thị ELO và thông tin cấp độ Bot trên `play-bot-v2.html`: Loại bỏ huy hiệu ELO/Bot info trên thanh Header, tích hợp thành 1 item dạng nút bấm (`#bot-meta`, `.puzzle-meta-box`) nằm ở vị trí chính giữa trên cùng một hàng của thanh nút điều khiển Footer (Action Bar). Rút gọn nội dung sang định dạng siêu gọn `Lvl {lvl} · {elo}` (EN) / `Cấp {lvl} · {elo}` (VI) (VD: `Lvl 1 · 400` / `Cấp 1 · 400`). Khi nhấn vào nút `#bot-meta`, hiển thị popup **Thông tin Trận đấu (Match Information Modal)** bao gồm: ELO người chơi & bên cầm quân, cấp độ & engine Bot, bảng dự tính điểm ELO cược (Win / Draw / Loss), đặc tính AI tương ứng theo cấp độ, và nút Đóng (Close) không làm gián đoạn ván cờ đang chơi.
  - [x] Loại bỏ nút "Hints: ON/OFF" trên thanh Action Bar của `play-bot-v2.html` và `play-bot.html`, giúp thanh điều khiển gọn gàng còn 6 nút chuẩn cân đối.
  - [x] Loại bỏ tùy chọn "3. Move Review" khỏi modal thiết lập ván đấu trên Trang chủ `index.html` và `play-bot-v2.html`, giúp popup mở ván tinh gọn và thao tác nhanh chóng hơn.
  - [x] Bàn cờ tại màn hình phân tích `analysis.html` được thiết lập ở chế độ chỉ xem (`readOnly: true`, `interactive: false`), vô hiệu hóa việc chọn quân và highlight nước đi khi chạm vào các ô bàn cờ.
  - [x] **Tái Sử Dụng & Nâng Cấp Module Phân Loại Nước Đi (`js/chess-review.js`):** Tích hợp sâu thư viện `chess-review.js` vào `analysis.html`, bổ sung thuật toán phân loại nước đi chuyên sâu: Nước đi Thiên tài (Brilliant `!!`), Nước đi Xuất sắc (Great `!`), Tối ưu (`★`), Tốt (`✔`), Kém chính xác (`?!`), Sai lầm (`?`), Đại sai lầm (`??`), Bỏ lỡ thắng cuộc (Missed Win), Bỏ lỡ chiếu hết (Missed Mate) dựa trên chênh lệch đánh giá và kiểm tra tĩnh Static Exchange Evaluation (SEE).
  - [x] **Mũi Tên Chỉ Đường Chiến Thuật Trực Quan (Tactical Coach Arrows):** Lớp phủ SVG trên bàn cờ phân tích (`#analysis-coach-svg`) tự động hiển thị mũi tên trực quan chuẩn tương phản cao E-ink:
    - Mũi tên xanh lá cây (`green`): Chỉ ra nước đi tối ưu mà đáng lẽ người chơi nên đi (`bestMove`).
    - Mũi tên xanh mòng két (`teal`): Chỉ ra nước đi trừng phạt của đối phương khi người chơi mắc sai lầm/blunder/bỏ lỡ nước thắng (`punishMove`).
    - Tự động xoay tọa độ mũi tên theo góc nhìn bàn cờ (`flip`).
  - [x] **Huy Hiệu Trực Quan Trên Ô Cờ (On-Board Move Badges):** Hiển thị trực tiếp huy hiệu đánh giá (`!!`, `!`, `★`, `✔`, `?!`, `?`, `??`) trên ô cờ đích của nước vừa đi đồng bộ với bảng lịch sử.
  - [x] **Đồng Bộ Thời Gian Tính Toán:** Giá trị thời gian chọn trong Modal Cấu hình (600ms, 1200ms, 2000ms) được truyền trực tiếp vào `ai.analyze(fen, thinkTime)` và điều chỉnh phân loại `ChessReview.classifyMove(...)`.

### Phase 6 — PvP Online & Polish Toàn Diện (Tạm hoãn / Ẩn trên Trang chủ)
- [ ] Thẻ "Chơi với Bạn bè (PvP)" đang tạm thời được comment ẩn trên `index.html`.
- Cập nhật `sql/schema.sql` cho bảng `chess_games` và `user_quotas`.
- Hoàn thiện module PvP trong `js/chess-backend.js`.
- Xây dựng `play-friend.html` và `js/chess-pvp.js`: Tạo phòng mã 6 ký tự, kết nối đồng bộ nước đi bằng polling 8s, nút Đầu hàng / Xin hòa (Chưa Quota 3 trận/ngày).
- Kiểm tra toàn diện tương thích ES5, tối ưu tốc độ phản hồi trên thiết bị Kindle thực tế.

