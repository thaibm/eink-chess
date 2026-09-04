# ♟ EinkChess (`chess.html`) — Tổng Quan Tính Năng & Hướng Dẫn Sử Dụng

`chess.html` là giao diện chơi cờ vua với AI nâng cao trên EinkChess, được thiết kế tối ưu riêng biệt cho màn hình mực điện tử E-ink (Kindle, Kobo, Boox) và các thiết bị di động, tích hợp động cơ tính toán Tomitank 7.0, thư viện khai cuộc, hệ thống đánh giá nước đi tức thì và chế độ xem lại ván cờ trực quan.

---

## 🌟 I. TỔNG HỢP CÁC TÍNH NĂNG NỔI BẬT

### 1. 🖥 Thiết Kế Tối Ưu Cho E-ink (Zero-Scroll & High Contrast)
- **Vừa khít màn hình tuyệt đối (Zero-Scroll)**: Không xuất hiện thanh cuộn dọc hoặc ngang trên mọi loại màn hình (Kindle Basic 6", Paperwhite 6.8", Oasis 7", Scribe 10.2", máy tính bảng, điện thoại).
- **Thuật toán tự động tính toán kích thước ô cờ**: Đo đạc không gian khả dụng của viewport theo thời gian thực và chia thành các số nguyên pixel chia hết cho 8, đảm bảo 64 ô cờ nằm khít 8x8 mà không bị lệch subpixel.
- **Bảng màu đơn sắc tương phản cao (Monochrome High Contrast)**:
  - Ô sáng: `#ffffff` (trắng tinh khiết).
  - Ô tối: `#b0b0b0` (xám sáng tương phản cao trên nền E-ink).
  - Ô vua bị chiếu: `#888888`.
  - Ô đang chọn: Viền đậm nét liền `outline: 3px solid #000; outline-offset: -3px; background: #d8d8d8;`.
  - Nước đi gần nhất: Viền nét đứt `outline: 2px dashed #000; outline-offset: -2px;`.
- **Triệt tiêu animation**: Không dùng CSS transition, animation xoay, làm mờ (`blur`) hay gradient, ngăn chặn tình trạng chớp mực liên tục và giảm thiểu hiện tượng lưu ảnh (ghosting).

### 2. 🧠 Động Cơ AI Tomitank 7.0 & Cân Chỉnh ELO Chuẩn Mực
- **10 Cấp độ AI (ELO 400 — 2400)**: Phù hợp cho người mới bắt đầu (Cấp 1 - 3), người chơi phổ thông (Cấp 4 - 6), và người chơi nâng cao (Cấp 7 - 10).
- **Thư viện khai cuộc đồ sộ (`BOOK_MAP`)**: Hơn 1,084 biến thể khai cuộc quốc tế (Ruy Lopez, Sicilian Defense, French Defense, Caro-Kann, Queen's Gambit, King's Indian...) tự động kích hoạt theo các nhánh biến thể.
- **10 Nhân cách AI độc đáo (`AI_PERSONA_LIST`)**: Mỗi cấp độ AI mang một phong cách chơi riêng (London White, Sicilian Black, Petrov Black...) kèm kế hoạch dài hạn (`plan`) và xác suất đi nước yếu (`noise`) tự nhiên.
- **Lưới an toàn chống Blunder ngớ ngẩn (Blunder Guard)**: Cân chỉnh để AI ở cấp thấp chơi nước yếu tự nhiên nhưng không tự nguyện dâng quân vô lý.

### 3. 🎯 Hệ Thống Phân Loại Chất Lượng Nước Đi (Move Quality Classification)
Đánh giá ngay lập tức từng nước đi của người chơi theo chuẩn phân tích quốc tế:
- **`!! Brilliant`** (Nước đi thiên tài): Nước cờ hi sinh quân bất ngờ nhưng đem lại ưu thế vượt trội.
- **`! Great Move`** (Nước đi xuất sắc): Nước đi độc nhất vô nhị, vượt trội hẳn so với các lựa chọn khác.
- **`★ Best Move`** (Nước đi tối ưu): Nước cờ mạnh nhất theo đánh giá của động cơ tính toán.
- **`[!] Great Defense`** (Phòng thủ xuất sắc): Nước cờ kiên cường giúp vượt qua thế hiểm nghèo.
- **`? Mistake`** (Sai sót): Nước cờ làm suy giảm ưu thế.
- **`?? Blunder`** (Sai lầm nghiêm trọng): Nước cờ làm đảo lộn cục diện ván cờ.
- **`[+] Missed Win` / `[#] Missed Mate`**: Bỏ lỡ cơ hội chiến thắng hoặc chiếu hết.
- **Bình luận cảm xúc AI (Bot Banter)**: Máy tự động phản hồi bằng những câu thoại sinh động (Tiếng Việt / Tiếng Anh) khi người chơi đi nước hay hoặc mắc sai lầm.

### 4. 🔍 Chế Độ Xem Lại Ván Cờ Chuyên Sâu (Game Review Mode)
Tự động kích hoạt ngay sau khi ván cờ kết thúc:
- **Bảng thống kê ván đấu**: Tổng kết số lượng nước đi theo từng nhãn (Brilliant, Great, Best, Mistake, Blunder).
- **Tua nước đi linh hoạt**: 
  - Tua từng nước: `[ ◀ Nước trước ]` và `[ Nước sau ▶ ]`.
  - Nhảy nhanh đến giai đoạn: `[ Khai cuộc ]`, `[ Trung cuộc ]`, `[ Tàn cuộc ]`.
  - Nhảy trực tiếp đến sai lầm: Bấm trực tiếp vào các mục trong bảng thống kê (ví dụ bấm vào `?? Blunder 2`) để máy tự động nhảy tới nước đi lỗi.
- **Mũi tên trực quan (Coach Arrows)**: Vẽ mũi tên trên bàn cờ chỉ ra nước đi tối ưu lẽ ra nên đi (màu đậm) và hướng phản công của đối thủ (màu xám).
- **Huy hiệu trên bàn cờ (Review Badges)**: Ô cờ đích hiển thị biểu tượng tròn (`!!`, `!`, `★`, `??`, `?`) để dễ dàng nhận diện.

### 5. 🛠 Tiện Ích & Tích Hợp Hệ Thống Toàn Diện
- **Tự động lưu ván cờ (Auto-save / Resume)**: Tự động lưu thế cờ sau mỗi nước đi; khi mở lại trình duyệt hoặc tải lại trang, ván cờ được khôi phục nguyên vẹn.
- **Hỗ trợ Song ngữ tức thì (VI / EN)**: Nút chuyển đổi nhanh Tiếng Việt / Tiếng Anh trên thanh tiêu đề.
- **Tương thích trang Cài đặt (Settings)**:
  - Tự động áp dụng theme quân cờ yêu thích: Chess.com (PNG), Lichess (SVG), hoặc Unicode.
  - Tự động bật/tắt nút `Đi lại` (Undo).
  - Tự động bật/tắt gợi ý nước đi (Move Hints).
  - Tự động làm mới màn hình (Clear ghosting) khi đóng các popup.
- **Biên bản PGN Modal**: Xem và sao chép toàn bộ biên bản ván cờ chuẩn PGN, nhật ký thời gian suy nghĩ và số node đã tính toán của động cơ.

---

## 📖 II. HƯỚNG DẪN SỬ DỤNG CHO NGƯỜI DÙNG

### 1. Bắt Đầu Ván Đấu & Chọn Cấp Độ
1. Nhấn nút **`Ván mới`** (nằm ở góc phải dưới bàn cờ).
2. Hộp thoại **Cấu Hình Ván Đấu** sẽ xuất hiện:
   - **Chọn cấp độ AI**: Chạm chọn từ `Cấp 1 (~400 ELO)` đến `Cấp 10 (~2400 ELO)`.
   - **Chọn bên cầm quân**: Chọn `Trắng (Đi trước)`, `Đen (Đi sau)` hoặc `Ngẫu nhiên`.
3. Nhấn **`Bắt Đầu`** để bắt đầu chơi. (Nếu bạn chọn bên Đen, máy sẽ tự động đi trước nước đầu tiên).

### 2. Thao Tác Đi Quân Trên Màn Hình E-ink
- **Cách đi quân**: Chạm vào quân cờ bạn muốn đi (ô cờ sẽ có viền đen đậm biểu thị đang chọn) $\rightarrow$ Chạm tiếp vào ô cờ đích hợp lệ để di chuyển.
- **Hủy chọn quân**: Chạm lại vào chính quân cờ đó hoặc chạm vào một quân cờ khác của bạn.
- **Phong cấp Tốt**: Khi Tốt đi đến hàng cuối cùng, hộp thoại phong cấp sẽ hiện ra để bạn chọn: Hậu (`♛`), Xe (`♜`), Tượng (`♝`), Mã (`♞`).

### 3. Sử Dụng Các Phím Chức Năng Dưới Bàn Cờ
| Nút Bấm | Chức Năng | Ghi Chú |
| :--- | :--- | :--- |
| **`Đi lại` (Undo)** | Hoàn tác lại 2 nước đi (nước máy vừa đi và nước trước đó của bạn). | *Chỉ hiển thị nếu tính năng Cho phép đi lại được bật trong Cài đặt.* |
| **`Xin thua` (Resign)** | Nhận thua ván đấu để kết thúc ván và chuyển sang chế độ phân tích. | Sẽ có popup xác nhận để tránh chạm nhầm. |
| **`Lật bàn` (Flip)** | Xoay ngược góc nhìn bàn cờ 180 độ. | Tiện lợi khi bạn cầm quân Đen hoặc muốn xem từ góc nhìn đối thủ. |
| **`[Cấp X · ELO]`** | Nút trung tâm hiển thị thông tin đối thủ. | **Chạm vào nút này** để mở popup xem chi tiết ELO, dự tính điểm thắng/hòa/thua và đặc tính bot. |
| **`Refresh`** | Làm mới toàn bộ màn hình (chớp đen trắng 1 lần). | Dùng để xóa sạch bóng mờ mực điện tử (ghosting) trên màn hình Kindle. |
| **`Ván mới`** | Mở bảng cấu hình để bắt đầu một ván chơi mới. | Nút nổi bật viền đen nền đen. |

### 4. Cách Xem Lại Ván Cờ Sau Khi Kết Thúc (Review Mode)
1. Khi ván cờ kết thúc (Chiếu hết, Hòa, hoặc Xin thua), bảng **Thống Kê Ván Đấu** sẽ tự động hiện lên.
2. Nhấn nút **`Xem lại`** trên popup để vào chế độ phân tích.
3. Dưới bàn cờ sẽ tự động chuyển thành thanh điều khiển xem lại:
   - Nhấn **`◀`** hoặc **`▶`** để xem lại từng nước đi.
   - Nhấn **`Khai`**, **`Trung`**, **`Tàn`** để nhảy đến giai đoạn khai cuộc, trung cuộc hoặc tàn cuộc.
   - Nhấn **`⏮`** để quay về nước đầu tiên hoặc **`⏭`** để nhảy tới thế cờ cuối cùng.
   - Quan sát **Huy hiệu trên ô cờ** và **Mũi tên chỉ đường**:
     - Mũi tên màu đậm chỉ ra nước cờ máy khuyên bạn nên đi.
     - Mũi tên màu xám chỉ ra cách đối thủ sẽ khai thác sai lầm đó.
4. Muốn bắt đầu ván khác, chỉ cần nhấn **`Ván mới`**.

### 5. Xem Biên Bản PGN & Đổi Ngôn Ngữ
- **Đổi ngôn ngữ**: Chạm vào nút **`EN`** hoặc **`VI`** ở góc trên bên phải màn hình Header để chuyển đổi qua lại giữa Tiếng Việt và Tiếng Anh.
- **Xem PGN**: Chạm vào nút **`PGN`** trên Header hoặc chạm vào **Thanh trạng thái dưới bàn cờ** để mở toàn bộ biên bản ván cờ, xem log tính toán chi tiết và sao chép PGN.
- **Về trang chủ**: Nhấn vào chữ **`EinkChess`** hoặc nút **`Menu`** trên Header.
