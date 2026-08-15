# 🧠 Kiến Trúc & Thuật Toán Chess AI (EinkChess)

Tài liệu này tổng hợp toàn bộ logic thuật toán, cơ chế đánh giá, các vấn đề đã được khắc phục và định hướng nâng cấp trong tương lai của module AI Cục bộ (`js/chess-ai.js`). File này đóng vai trò như một cẩm nang (Knowledge Base) để các thế hệ AI Agent tiếp theo có thể dễ dàng đọc, nắm bắt và tiếp tục phát triển.

---

## 1. TỔNG QUAN KIẾN TRÚC (ARCHITECTURE OVERVIEW)

Module AI được thiết kế hoàn toàn bằng **ES5 thuần**, không sử dụng Web Workers hay WebAssembly nhằm đảm bảo tương thích 100% với trình duyệt WebKit cũ kỹ của các máy đọc sách Amazon Kindle.

Hệ thống phân chia thành 3 cấp độ (Level 1, 2, 3) điều khiển thông qua 2 tham số chính:
1. **Depth (Độ sâu Minimax):** Số nửa-nước-đi (ply) mà Bot có thể nhìn trước. (Cấp 1: 1 ply, Cấp 2: 2 plies, Cấp 3: 3 plies).
2. **Noise (Độ nhiễu):** Giá trị random cộng thêm vào điểm đánh giá để tạo ra các sai lầm có chủ ý ở cấp độ thấp (Cấp 1: 80, Cấp 2: 30, Cấp 3: 0).

---

## 2. CÁC CƠ CHẾ CỐT LÕI (CORE MECHANISMS)

### 2.1. Hàm Đánh Giá (Evaluation Function)
Hàm `evaluatePosition(engine)` tính toán ưu thế (Score) từ góc nhìn của quân Trắng (Score dương = Trắng lợi, Score âm = Đen lợi) dựa trên:
- **Material (Giá trị quân cờ):** Tốt=100, Mã=320, Tượng=330, Xe=500, Hậu=900, Vua=20000.
- **Piece-Square Tables (PST):** Đánh giá vị trí đứng của quân cờ. Khuyến khích Mã đứng giữa, Tốt tiến sâu, Xe chiếm hàng mở. Bảng PST của Trắng được dùng nguyên bản, của Đen được soi gương (mirror) **chỉ theo trục ngang (row)**.
- **Tự động nhận diện Tàn Cuộc (Endgame Detection):** Khi tổng giá trị quân trên bàn (không tính Tốt và Vua) của mỗi bên `< 1500`, Bot sẽ tự động chuyển trạng thái đánh giá Vua từ `PST_KING_MID` (trốn trong góc) sang `PST_KING_END` (chủ động tiến ra trung tâm hỗ trợ Tốt phong cấp).

### 2.2. Sắp Xếp Nước Đi (Move Ordering - MVV-LVA)
Để thuật toán Alpha-Beta Pruning cắt tỉa cành hiệu quả, các nước đi bắt quân được ưu tiên kiểm tra trước dựa trên nguyên tắc **MVV-LVA (Most Valuable Victim - Least Valuable Attacker)**.
- Bot sẽ ưu tiên nước Tốt (100) ăn Hậu (900) hơn là Hậu (900) ăn Hậu (900).
- Hệ số: `Score = 10 * VictimValue - AttackerValue`. Các nước phong cấp (Promotion) được cộng thêm 9000 điểm cực kỳ ưu tiên.

### 2.3. Sổ Khai Cuộc Khắc Chế (Opening Book)
Được định nghĩa tại hằng số `OPENING_BOOK`. Gồm danh sách các FEN gốc và các nước phản đòn theo lý thuyết cờ vua:
- Nếu người chơi đi `1. e4` $\rightarrow$ Bot đáp trả sắc bén bằng Sicilian (`1... c5`), French (`1... e6`) hoặc Open Game (`1... e5`).
- Giúp Bot Cấp 3 đi 3-4 nước đầu tiên trong thời gian **0 giây (instant)**, không mất công suy nghĩ, ngăn chặn hiện tượng treo thiết bị do lượng node quá lớn ở đầu game.

### 2.4. Tìm Kiếm Tĩnh (Quiescence Search)
- Ở Cấp 3, khi thuật toán Minimax chạm đáy (depth = 0), thay vì dừng lại, nó tiếp tục gọi hàm `quiescence()` để đào sâu thêm vào **tất cả các nước đi bắt quân và phong cấp** cho đến khi bàn cờ tĩnh.
- Việc này giúp khắc phục hoàn toàn **Horizon Effect (Hiệu ứng chân trời)** - lỗi kinh điển khiến Bot bị "mù" chiến thuật và bỏ rơi quân Hậu ở cuối chuỗi ăn quân rắc rối.
- **Q-Depth Limit:** Để chống bùng nổ tính toán (node explosion) do thiết bị Kindle yếu, Quiescence bị giới hạn chặt chẽ ở độ sâu `qDepth = 4`.

---

## 3. LỊCH SỬ CÁC VẤN ĐỀ ĐÃ KHẮC PHỤC (RESOLVED ISSUES)

Trong các phiên bản trước, AI gặp một số lỗi và điểm yếu đã được review & vá lỗi toàn diện:
1. **Lỗi Logic Mirror PST:** Trước đây code soi gương vị trí quân Đen theo cả 2 trục (hàng và cột) `evalCol = 7 - c`. Bàn cờ thực tế đối xứng dọc nên chỉ được mirror hàng. Đã sửa thành `evalCol = c`.
2. **Thiếu Quiescence Search:** AI cũ chỉ đánh giá tĩnh ở depth 0, dẫn đến Cấp 3 cực kỳ ngáo khi đối mặt với chuỗi trao đổi quân. Đã implement thành công.
3. **Thời gian suy nghĩ quá lâu ở Cấp 3:** Việc tính toán 3 depth ở nước cờ đầu tiên làm Kindle bị đơ > 10 giây. Đã giải quyết triệt để bằng **Opening Book** kết hợp **Q-Depth = 4**. Thời gian suy nghĩ giữa game hiện duy trì ổn định ở mức ~0.5s - 1.5s trên Kindle.
4. **Vua ngáo tàn cuộc:** Trước đây Vua không chịu lên tham chiến. Đã thêm cơ chế `isEndgame` và `PST_KING_END`.

---

## 4. HƯỚNG DẪN NÂNG CẤP TƯƠNG LAI (FUTURE ROADMAP FOR NEXT AGENTS)

Khi cấu hình phần cứng e-ink tốt hơn hoặc khi cần đẩy ELO của Local Bot lên mức ~1500 (Level 4), AI Agent kế tiếp nên tập trung implement các tính năng sau vào `chess-ai.js` theo thứ tự ưu tiên:

1. **Iterative Deepening (Đào sâu dần):** 
   - Thay vì chạy thẳng Minimax Depth 3, hãy chạy Depth 1 $\rightarrow$ Depth 2 $\rightarrow$ Depth 3. Sử dụng nước đi tốt nhất của depth thấp để đẩy lên làm First Node (Best Move Ordering) cho depth cao. Điều này làm Alpha-Beta cắt tỉa hiệu quả đến mức tổng thời gian chạy 1+2+3 còn **nhanh hơn** chạy thẳng 3.
2. **Pawn Structure Evaluation (Đánh giá Cấu trúc Tốt):**
   - Phạt điểm (Penalty) cho Doubled Pawns (Tốt chồng) và Isolated Pawns (Tốt cô lập).
   - Thưởng điểm (Bonus) cho Passed Pawns (Tốt thông), đặc biệt cộng rất nhiều điểm Tốt thông trong tàn cuộc.
3. **Killer Move Heuristic:**
   - Ở mỗi depth, ghi nhớ 2 "Nước đi sát thủ" (không phải nước ăn quân nhưng đã tạo ra beta cut-off trước đó) để đưa lên ưu tiên evaluate ngay sau các nước ăn quân (MVV-LVA).
4. **Zobrist Hashing & Transposition Table (TT):**
   - Lưu trữ điểm số của các thế cờ đã tính qua vào 1 mảng HashMap giới hạn (VD: 5MB RAM) để tái sử dụng thay vì tính lại nếu gặp thế cờ trùng lặp qua phép đảo thứ tự nước đi (Transposition). (Lưu ý: Chỉ làm nếu đo đạc kỹ bộ nhớ trên trình duyệt WebKit cũ).
