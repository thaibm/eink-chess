# Kế Hoạch Cập Nhật UI cho `chess.html` (Theo `play-bot-v2`)

> [!IMPORTANT]
> **Phạm vi**: CHỈ thay đổi CSS `<style>` và cấu trúc HTML DOM. **Giữ nguyên 100%** logic JS (Section 1-6, Section 7 game logic, Section 8 Chat Data). Các hàm JS cần sửa **chỉ giới hạn** ở DOM element IDs references, `fixBoardSize()`, và `showStats()` (chuyển stats thành modal).

## Quyết Định Đã Xác Nhận

| # | Câu hỏi | Quyết định |
|---|---------|------------|
| Q1 | Header buttons (Donate, Language, Menu) | **CÓ** — Thêm đầy đủ giống `play-bot-v2` |
| Q2 | Thanh `#history` (PGN dưới bàn cờ) | **ẨN** — `display: none`, giữ DOM để JS không crash |
| Q3 | `#stats-box` (bảng thống kê cuối ván) | **Chuyển thành Modal Popup** |

---

## Phân Tích Hiện Trạng

### Khác biệt kiến trúc cốt lõi giữa 2 file

| | [`chess.html`](file:///Users/thaibuiminh/Projects/eink-chess/chess.html) | [`play-bot-v2.html`](file:///Users/thaibuiminh/Projects/eink-chess/play-bot-v2.html) |
|---|---|---|
| **Kích thước** | ~12,000 dòng (monolith — CSS + HTML + engine + AI + UI logic) | ~1,010 dòng (CSS external `einkchess.css`, JS external modules) |
| **Chess Engine** | Inline: board logic, legal moves, FEN/UCI, Tomi Worker, Opening Book, AI Persona, Classify, Review — tất cả trong `<script>` duy nhất | External: `chess-engine.js`, `chess-ai-v2.js`, `chess-board.js`, `chess-storage.js`, `chess-i18n.js` |
| **Board Rendering** | Tự tay render: `buildBoardOnce()` tạo 64 `<div>` float-left, `renderBoard()` update inline | `ChessBoard` module (external `chess-board.js`) |
| **Sizing** | `fixBoardSize()` — tính board size từ viewport, gán pixel size cho ô cờ | `ChessBoard` module tự xử lý |
| **Controls Layout** | 1 hàng ngang trên bàn cờ (`ctrl-row`), 3 cột: Cấp độ / Đổi bên / Ván mới | Header trên, Status bar giữa, Action bar dưới bàn cờ |
| **Status/Captured** | 2 thanh riêng biệt: `#status` (click → PGN overlay), `#captured-bar` (show khi có quân bắt) | 1 thanh tích hợp: `#status-bar` (captured trái/phải, text giữa) |
| **Review Mode** | Switch UI: ẩn `#clr-toggle` + `#rank-display`, hiện `#nav-toggle` + `#phase-nav` | Không có review mode |
| **Modals** | PGN overlay (`#detail-overlay`), Promotion (`#promo-bg`), Rank overlay (`#rank-overlay`) | Setup modal, Bot info modal, Resign modal, Game over modal, Donate modal |

---

## Rủi Ro Đã Xác Định

> [!WARNING]
> **Rủi ro 1**: Hàng chục function JS tham chiếu DOM element bằng ID. Bỏ sót 1 ID khi restructure DOM → runtime crash trên Kindle. → Giải pháp: Audit đầy đủ ở Bước 0.

> [!WARNING]
> **Rủi ro 2**: Review Mode (`showStats()`) thao tác trực tiếp ẩn/hiện `#clr-toggle`, `#captured-bar`, `#nav-toggle`, `#rank-display`, `#phase-nav`. → Giải pháp: Giữ nguyên tất cả ID, chỉ thay đổi vị trí DOM.

> [!WARNING]
> **Rủi ro 3**: `fixBoardSize()` dòng 4528: `board.parentNode.parentNode` phụ thuộc DOM hierarchy. → Giải pháp: Đổi sang `getElementById('board-wrap').parentNode` hoặc dùng ID trực tiếp.

> [!CAUTION]
> **Rủi ro 4**: `showRankOverlay()` đo kích thước `#board` để sizing overlay. → Giải pháp: Không thay đổi nesting level của `#board`.

---

## Kế Hoạch Thực Thi Chia Nhỏ (8 Bước)

### Bước 0: Audit DOM References — Checklist An Toàn

```
IDs quan trọng (KHÔNG ĐƯỢC ĐỔI TÊN hoặc XÓA):
├── Board: #board, #board-wrap, #coach-svg, #svg-arrows
├── Controls: #rank-sel, #rank-display, #clr-toggle, #captured-bar,
│             #cap-black, #cap-white, #cap-center, #main-btn, #split-btn,
│             #nav-toggle, #phase-nav, #ctrl-wrap-el
├── Status: #status, #stats-box, #history
├── Game wrap: #game-wrap
├── Overlays: #detail-overlay, #detail-moves, #detail-log, #detail-summary,
│             #detail-log-title, #detail-syslog-title, #detail-syslog,
│             #promo-bg, #promo-row, #rank-overlay, #rank-list
└── IDs MỚI sẽ thêm: #header-bar, #status-cap-white, #status-cap-black,
                       #status-text-inner, #stats-overlay
```

---

### Bước 1: CSS-Only Changes (Không Đụng HTML/JS)

**Mục tiêu**: Cập nhật toàn bộ CSS trong `<style>` mà KHÔNG thay đổi bất kỳ element HTML hay JS nào.

**Thay đổi cụ thể**:
1. **Font**: `Georgia, 'Times New Roman', serif` → `"Amazon Ember", "Helvetica Neue", Helvetica, Arial, sans-serif`
   - Áp dụng ở `body`, `.rank-sel`, `.rank-display`, `.btn`, `.clr-btn`, `.btn-nav .nav-btn`
2. **Tap highlight**: Thêm `-webkit-tap-highlight-color: transparent` vào `*`
3. **Bảng màu ô cờ**: `.sq.dark` → `#b0b0b0` (từ `#d0d0d0`)
4. **Selected state**: `.sq.sel` → `outline: 3px solid #000; outline-offset: -3px; background: #d8d8d8;` (bỏ `background: #555`, bỏ `.sq.sel .piece { color: #fff }`)
5. **Last move**: `.sq.lm-f`, `.sq.lm-t` → `outline: 2px dashed #000; outline-offset: -2px;` (thay vì `background: #a0a0a0`)
6. **Check state**: `.sq.chk` giữ `background: #888`
7. **Controls height**: Giảm từ `55px` → `38px` (`.rank-sel`, `.rank-display`, `.btn`, `.clr-btn`, `.captured-bar`, `.btn-split .btn`, `.btn-nav`, `.btn-nav .nav-btn`)
8. **Nút border**: `border: 2px solid #000` (thống nhất)
9. **Board border**: `.board` → `border: 2px solid #000` (từ `1px`)

**Kiểm tra**: Mở trang → font đổi, màu ô cờ đổi, nút nhỏ gọn hơn. Mọi logic giữ nguyên.

---

### Bước 2: Thêm Header Bar (Giống `play-bot-v2`)

**Mục tiêu**: Thêm header bar mới với Logo, Donate, Language toggle, Menu — giống cấu trúc [`play-bot-v2.html` dòng 17-29](file:///Users/thaibuiminh/Projects/eink-chess/play-bot-v2.html#L17-L29).

**HTML thêm** (ngay sau `<div id="game-wrap">`):
```html
<div class="header-bar" id="header-bar">
    <span class="header-logo">EinkChess</span>
    <span class="header-center"></span>
    <span class="header-actions">
        <button class="hdr-btn hdr-btn-donate" onclick="showDetailOverlay()">PGN</button>
        <a href="index.html" class="hdr-btn">Menu</a>
    </span>
</div>
```

> [!NOTE]
> Nút "PGN" trong header thay thế chức năng của thanh `#history` (sẽ ẩn ở Bước 4). Click vào sẽ gọi `showDetailOverlay()` (hàm đã có sẵn). `chess.html` không dùng i18n nên không cần `data-i18n`.

**CSS thêm**:
```css
.header-bar {
    display: table;
    width: 100%;
    border-bottom: 2px solid #000;
    padding: 2px 4px;
    min-height: 28px;
    line-height: 24px;
}
.header-bar .header-logo {
    display: table-cell;
    font-weight: bold;
    font-size: 14px;
    vertical-align: middle;
    white-space: nowrap;
    width: 1%;
    padding-right: 6px;
}
.header-bar .header-center {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
}
.header-bar .header-actions {
    display: table-cell;
    text-align: right;
    vertical-align: middle;
    white-space: nowrap;
    width: 1%;
}
.hdr-btn {
    display: inline-block;
    padding: 2px 6px;
    font-size: 12px;
    font-weight: bold;
    border: 2px solid #000;
    background: #fff;
    color: #000;
    text-decoration: none;
    cursor: pointer;
    margin-left: 2px;
    vertical-align: middle;
}
.hdr-btn:active {
    background: #000;
    color: #fff;
}
.hdr-btn-donate {
    border-style: dashed;
    background: #f0f0f0;
}
```

**JS sửa**: Cập nhật `fixBoardSize()` — thêm `#header-bar` vào phép tính `nonBoardH`.

**Kiểm tra**: Header hiện ở trên cùng với logo + các nút. Layout cũ bên dưới vẫn hoạt động.

---

### Bước 3: Restructure Status Bar — Gộp Status + Captured

**Mục tiêu**: Biến `#status` thành thanh 3 cột tích hợp (captured trái + status text giữa + captured phải), giống [`play-bot-v2.html` dòng 35-39](file:///Users/thaibuiminh/Projects/eink-chess/play-bot-v2.html#L35-L39).

**Thay đổi HTML** — Sửa `#status` từ:
```html
<div class="status" id="status" onclick="showDetailOverlay()">Lượt của bạn</div>
```
Thành:
```html
<div class="status-bar-new" id="status" onclick="showDetailOverlay()">
    <span class="status-cap-side" id="status-cap-white"></span>
    <span class="status-text-inner" id="status-text-inner">Lượt của bạn</span>
    <span class="status-cap-side" id="status-cap-black"></span>
</div>
```

**CSS thêm**:
```css
.status-bar-new {
    display: table;
    width: 100%;
    border: 2px solid #000;
    padding: 2px 4px;
    min-height: 26px;
    background: #f9f9f9;
    cursor: pointer;
    table-layout: fixed;
}
.status-cap-side {
    display: table-cell;
    vertical-align: middle;
    width: 26%;
    font-size: 15px;
    line-height: 1;
    overflow: hidden;
    white-space: nowrap;
    letter-spacing: -1px;
}
#status-cap-white { text-align: left; padding-left: 2px; }
#status-cap-black { text-align: right; padding-right: 2px; }
.status-text-inner {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
    font-size: 12px;
    font-weight: bold;
    line-height: 1.2;
    width: 48%;
}
```

**JS sửa (nhỏ)**:
1. Trong `updateCaptured()`: Ngoài ghi vào `#cap-black`/`#cap-white` (cũ, giữ cho an toàn), **thêm ghi** vào `#status-cap-white`/`#status-cap-black`.
2. Trong `setStatusText(el, cls, txt)` và `setStatus()`: Thay vì set `el.textContent`, target vào `#status-text-inner` bên trong.
3. **Giữ nguyên** `#captured-bar` trong DOM (ẩn vĩnh viễn) — để `showColorBtn()` / `showStats()` không crash.

**Kiểm tra**: Status bar mới hiển thị 3 cột gọn, quân bắt hai bên, text giữa. Logic game vẫn chạy.

---

### Bước 4: Ẩn Thanh History + Di Chuyển Controls Xuống Dưới

**Mục tiêu**: 
- Ẩn `#history` (giữ DOM, set `display: none` trong CSS).
- Chuyển `#ctrl-wrap-el` từ **trên** bàn cờ xuống **dưới** bàn cờ.

**DOM layout mới bên trong `#game-wrap`**:
```
├── #header-bar          (28px)    ← Bước 2
├── #status              (28px)    ← Bước 3 (gộp status + captured)
├── .board-outer
│   ├── #board-wrap
│   │   ├── #board
│   │   └── #coach-svg
│   └── #history                   ← DISPLAY: NONE (ẩn, giữ DOM)
├── #ctrl-wrap-el        (38px)    ← MOVED HERE (dưới bàn cờ)
└── #stats-box                     ← Sẽ chuyển thành modal ở Bước 5
```

**CSS thêm**:
```css
.history {
    display: none !important;  /* Ẩn vĩnh viễn — PGN xem qua nút PGN ở header */
}
```

**JS sửa — `fixBoardSize()`**: Cập nhật phép tính `nonBoardH`:
```javascript
var headerH = headerEl ? headerEl.offsetHeight : 28;
var statusH = statusEl ? statusEl.offsetHeight : 28;
var ctrlH = ctrl ? ctrl.offsetHeight : 38;
// histH = 0 (đã ẩn), statsH = 0 (đã chuyển thành modal)
var safeOffset = 8;
var nonBoardH = headerH + statusH + ctrlH + safeOffset;
```

> [!NOTE]
> `#history` element giữ nguyên trong DOM vì JS ([`newGame()` dòng 4431](file:///Users/thaibuiminh/Projects/eink-chess/chess.html#L4431), [dòng 4461](file:///Users/thaibuiminh/Projects/eink-chess/chess.html#L4461)) set `textContent` trên nó. Nếu xóa → null reference crash.

**Kiểm tra**: Board chiếm gần hết viewport, controls ở dưới thuận tay, history ẩn nhưng JS không crash.

---

### Bước 5: Chuyển Stats-Box Thành Modal Popup

**Mục tiêu**: Thay vì hiển thị `#stats-box` inline (chiếm chỗ layout), chuyển thành modal overlay popup khi ván kết thúc.

**HTML thêm** (ngoài `#game-wrap`, cùng level với `#detail-overlay`):
```html
<div class="stats-overlay" id="stats-overlay" onclick="hideStatsOverlay()">
    <div class="stats-overlay-box" onclick="event.stopPropagation()">
        <div class="stats-overlay-title">Thong ke van dau</div>
        <div id="stats-box"></div>
        <div class="stats-overlay-nav">
            <div class="btn-nav" id="nav-toggle-modal" style="display:none">
                <button class="nav-btn nav-prev" onclick="reviewStep(-1)">&#9664;</button>
                <button class="nav-btn nav-next" onclick="reviewStep(1)">&#9654;</button>
            </div>
            <div class="btn-nav" id="phase-nav-modal" style="display:none">
                <button class="nav-btn nav-prev" onclick="reviewPhaseJump(-1)">&#9198;</button>
                <button class="nav-btn nav-next" onclick="reviewPhaseJump(1)">&#9197;</button>
            </div>
        </div>
        <button class="detail-close" onclick="hideStatsOverlay()">Van moi</button>
    </div>
</div>
```

> [!NOTE]
> Navigation buttons (◀/▶ review step, ⏮/⏭ phase jump) chuyển vào modal thay vì nằm trong `#ctrl-wrap-el`. `#nav-toggle` và `#phase-nav` **CŨ** trong ctrl-wrap-el vẫn giữ DOM (ẩn vĩnh viễn) để `showStats()` không crash — nhưng thêm hiện bản mới trong modal.

**CSS thêm**:
```css
.stats-overlay {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.55);
    z-index: 350;
    overflow-y: auto;
}
.stats-overlay.show { display: block; }
.stats-overlay-box {
    background: #fff;
    margin: 30px auto;
    padding: 16px;
    max-width: 400px;
    border: 2px solid #000;
}
.stats-overlay-title {
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 8px;
    border-bottom: 2px solid #000;
    padding-bottom: 4px;
    text-align: center;
}
.stats-overlay-nav {
    margin-top: 10px;
}
```

**JS sửa — `showStats()`**:
```javascript
function showStats() {
    // ... (giữ nguyên logic build HTML cho #stats-box) ...
    
    // Thay vì hiển thị inline, hiện modal overlay
    var overlay = document.getElementById('stats-overlay');
    if (overlay) overlay.className = 'stats-overlay show';
    
    // Kích hoạt review mode
    gReviewPly = gUciHist.length;
    
    // Hiện nav buttons TRONG MODAL (thay vì trong ctrl-wrap-el)
    var navModal = document.getElementById('nav-toggle-modal');
    var phaseModal = document.getElementById('phase-nav-modal');
    if (navModal) navModal.style.display = 'block';
    if (phaseModal) phaseModal.style.display = 'block';
    
    // Giữ nguyên các thao tác cũ trên #clr-toggle, #nav-toggle, etc. (an toàn)
    var clr = document.getElementById('clr-toggle');
    var bar = document.getElementById('captured-bar');
    var nav = document.getElementById('nav-toggle');
    if (clr) clr.style.display = 'none';
    if (bar) bar.style.display = 'none';
    if (nav) nav.style.display = 'none'; // ẩn bản cũ
    var rankDisp = document.getElementById('rank-display');
    var phaseNav = document.getElementById('phase-nav');
    if (rankDisp) rankDisp.style.display = 'none';
    if (phaseNav) phaseNav.style.display = 'none'; // ẩn bản cũ
}

function hideStatsOverlay() {
    var overlay = document.getElementById('stats-overlay');
    if (overlay) overlay.className = 'stats-overlay';
    newGame(); // Bắt đầu ván mới khi đóng overlay
}
```

**Kiểm tra**: Ván kết thúc → modal popup hiện stats + nav buttons. Bấm "Ván mới" đóng modal, bắt đầu ván mới. Board không bị giật layout.

---

### Bước 6: Rewrite `fixBoardSize()` — Pixel-Perfect Sizing

**Mục tiêu**: Board size tính bằng số nguyên chia hết cho 8, không subpixel. Tính toán dựa trên layout mới (header + status + board + controls).

**Sửa `fixBoardSize()`**:
```javascript
function fixBoardSize() {
    var vw = window.innerWidth || document.documentElement.clientWidth || 320;
    var vh = window.innerHeight || document.documentElement.clientHeight || 480;
    
    var headerEl = document.getElementById('header-bar');
    var statusEl = document.getElementById('status');
    var ctrl = document.getElementById('ctrl-wrap-el');
    
    var headerH = headerEl ? headerEl.offsetHeight : 28;
    var statusH = statusEl ? statusEl.offsetHeight : 28;
    var ctrlH = ctrl ? ctrl.offsetHeight : 38;
    var safeOffset = 8;
    
    var nonBoardH = headerH + statusH + ctrlH + safeOffset;
    var availableH = vh - nonBoardH;
    var availableW = vw - 4; // 2px border each side
    
    var maxBoardSize = Math.min(availableW, availableH);
    if (maxBoardSize < 80) maxBoardSize = 80;
    var sqSize = Math.floor(maxBoardSize / 8);
    var exactBoardSize = sqSize * 8;
    
    // Apply sizes
    var bd = document.getElementById('board');
    if (!bd) return;
    bd.style.width = exactBoardSize + 'px';
    bd.style.height = exactBoardSize + 'px';
    
    // boardOuter = .board-outer (board -> board-wrap -> board-outer)
    var boardOuter = document.getElementById('board').parentNode.parentNode;
    if (boardOuter) boardOuter.style.width = (exactBoardSize + 4) + 'px';
    
    var wrap = document.getElementById('game-wrap');
    if (wrap) wrap.style.maxWidth = (exactBoardSize + 12) + 'px';
    
    // Cell sizes (pixel integers — no subpixel)
    if (sqSize === gCellH) return;
    gCellH = sqSize;
    var fontSize = Math.floor(sqSize * 0.75);
    var cells = bd.children;
    for (var i = 0; i < cells.length; i++) {
        cells[i].style.width = sqSize + 'px';
        cells[i].style.height = sqSize + 'px';
        cells[i].style.lineHeight = sqSize + 'px';
        cells[i].style.fontSize = fontSize + 'px';
    }
    
    // Coach SVG
    var svg = document.getElementById('coach-svg');
    if (svg) {
        svg.style.width = exactBoardSize + 'px';
        svg.style.height = exactBoardSize + 'px';
    }
}
```

**Kiểm tra**: Trên nhiều viewport sizes — board luôn vừa khít, ô cờ pixel-perfect, không cuộn.

---

### Bước 7: Tối Ưu Modals Styling

**Mục tiêu**: Cập nhật style modals theo phong cách `play-bot-v2`.

1. **`#detail-overlay` / `.detail-box`**: Border `2px solid #000`, nút Đóng `min-height: 44px`, font sans-serif
2. **`#promo-bg` / `.promo-box`**: Border `2px solid #000`, padding gọn
3. **`#rank-overlay` / `.rank-list`**: Border `3px solid #000` (giữ nguyên), `.rank-item` min-height 44px

**Chỉ CSS changes, không đụng HTML/JS.**

---

### Bước 8: Build + Kiểm Tra Trực Quan

1. **Cache busting**: Increment version parameter (không áp dụng — chess.html là monolith, CSS inline)
2. Chạy `npm run build` để cập nhật `dist/`
3. Kiểm tra trên browser ở các viewport:
   - 600×800 (Kindle Basic 6")
   - 1072×1448 (Kindle Paperwhite)
   - 390×844 (iPhone)
   - 1280×800 (Landscape)
4. **Verify checklist**:
   - [ ] Zero-scroll ở tất cả viewports
   - [ ] Header hiện đúng: Logo + PGN + Menu
   - [ ] Rank selector click → overlay đúng kích thước
   - [ ] Đổi bên → board lật, nút đổi label
   - [ ] Status bar hiện captured pieces + status text gộp
   - [ ] Ván kết thúc → stats modal popup (không inline)
   - [ ] Stats modal: nav buttons ◀/▶ hoạt động, phase jump ⏮/⏭ hoạt động
   - [ ] Stats modal: badge/arrow hiện đúng trên bàn cờ phía sau
   - [ ] PGN overlay mở/đóng bình thường (qua nút PGN ở header)
   - [ ] Promotion dialog hiện đúng
   - [ ] `#history` ẩn nhưng JS không crash (newGame set textContent OK)
5. Cập nhật [`requirements_einkchess.md`](file:///Users/thaibuiminh/Projects/eink-chess/requirements_einkchess.md) theo Rule #8

---

## Tóm Tắt Khác Biệt UI Cũ vs UI Mới

| Thành phần | UI Hiện Tại | UI Mới |
|:---|:---|:---|
| **Scroll** | Tràn dọc trên portrait | **Zero-Scroll** |
| **Font** | `Georgia` serif | `Amazon Ember` sans-serif |
| **Header** | Không có | **Có** (logo + PGN + Menu) |
| **Controls** | Trên bàn cờ, nút 55px | **Dưới bàn cờ**, nút 38px |
| **Status+Captured** | 2 thanh riêng ~95px | **1 thanh tích hợp ~28px** |
| **History bar** | Hiển thị PGN, ~32px | **Ẩn** (PGN qua header button) |
| **Stats** | Inline box dưới status | **Modal popup** |
| **Review Nav** | Trong ctrl-row (thay thế buttons) | **Trong stats modal** |
| **Ô cờ tối** | `#d0d0d0` | `#b0b0b0` |
| **Selected** | `background: #555 + white text` | `outline: 3px solid #000 + #d8d8d8` |
| **Last move** | `background: #a0a0a0` | `outline: 2px dashed #000` |
| **Ô cờ sizing** | `width: 12.5%` | **Pixel integer** (`sqSize × sqSize`) |
| **Logic** | Nguyên bản | **100% không sửa** |
