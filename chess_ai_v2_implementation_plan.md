# Parallel Development: Tomitank Web Worker Engine & Move Analysis

To ensure a safe and bug-free implementation, we will develop the new Tomitank AI in parallel with the existing Minimax AI. **Crucially, all existing actions and features of the current app (Undo, Resign, Flip, Refresh, Hints, Auto-Save/Resume, Setup Modal) will be fully preserved in the V2 version.**

## User Review Required: 10-Level Offline ELO Mapping (Final)

> [!IMPORTANT]
> Bảng ELO và cấu hình thông minh (chuẩn 100% từ `chess-twinkle`) cho AI Tomitank V2:
> 
> | Cấp độ | Thời gian (ms) | Tỷ lệ mắc lỗi (Chance) | Lệch chuẩn tối đa (cpLoss) | ELO Ước lượng |
> | :--- | :--- | :--- | :--- | :--- |
> | **Level 1** | 200ms | 50% | 180 (Sơ hở vị trí) | ~400 (Mới học chơi) |
> | **Level 2** | 400ms | 40% | 130 (Mất 1 tốt) | ~600 (Tập sự) |
> | **Level 3** | 700ms | 30% | 90 (Nước đi thụ động) | ~800 (Nghiệp dư) |
> | **Level 4** | 1000ms | 25% | 60 (Lỗi nhỏ) | ~1000 (Trung bình yếu) |
> | **Level 5** | 1500ms | 20% | 40 (Thiếu chính xác nhẹ) | ~1200 (Trung bình khá) |
> | **Level 6** | 2000ms | 15% | 25 (Nước đi thiếu chính xác) | ~1400 (Bán chuyên) |
> | **Level 7** | 4000ms | 10% | 15 (Rất ít sai sót) | ~1600 (Chuyên gia) |
> | **Level 8** | 6000ms | 0% | 0 (Đánh chuẩn tuyệt đối) | ~1800 (Kiện tướng) |
> | **Level 9** | 8000ms | 0% | 0 (Đánh chuẩn tuyệt đối) | ~2200 (Đại kiện tướng) |
> | **Level 10**| 12000ms | 0% | 0 (Đánh chuẩn tuyệt đối) | ~2400 (Siêu cấp) |

## Proposed Execution Phases

### Phase 1: Engine Extraction & Basic Worker
**Goal:** Successfully run the Tomitank engine in a background Web Worker.
- **[NEW] `js/tomitank-source.js`**: Extract the raw Tomitank ES5 engine string (lines 7486-11974 of `chess-twinkle.html`).
- **[NEW] `js/chess-ai-v2.js`**: Create `ChessAIV2` class. Initialize Web Worker via `Blob`. Apply Kindle fixes: `_tomiDeferredSetTimeout` polyfill and `setoption name Hash value 16`. Implement async `getBestMove(engine, callback)`.

### Phase 2: Game Flow Integration (V2) & Feature Preservation
**Goal:** Create a playable V2 interface that interacts with the new async AI while keeping all old features.
- **[NEW] `play-bot-v2.html`**: Duplicate `play-bot.html` but link it to `tomitank-source.js` and `chess-ai-v2.js`.
- Refactor `makeBotMove()` to use the asynchronous `ai.getBestMove`.
- **Ensure Preservation:** Guarantee that Undo, Resign, Flip, Refresh, Hints, and the Game Setup Modal function exactly as they do in V1, adapted for the async worker flow if necessary.

### Phase 3: Human-like AI (Noise) & Offline 10 Levels
**Goal:** Implement the 10-level scale (50ms -> 4000ms) and human-mistake simulator.
- **[MODIFY] `js/chess-ai-v2.js`**: 
  - Parse MultiPV `info` and implement the `AI_MOVE_NOISE_CFG` logic exactly as outlined in the ELO table above to select sub-optimal root moves and simulate human play.

### Phase 4: Move Analysis (MultiPV) & Badges
**Goal:** Analyze user moves and display visual feedback (Brilliant, Blunder, etc.).
- **[MODIFY] `js/chess-ai-v2.js`**: Evaluate `cpLoss` to classify the user's move: `Brilliant` (!!), `Great` (!), `Best` (★), `Inaccuracy` (?!), `Mistake` (?), `Blunder` (??).
- **[MODIFY] `js/chess-board.js` & `css/einkchess.css`**: Add CSS classes for UI badges (`.sq-review-badge`) and render them over squares.
- **[MODIFY] `play-bot-v2.html`**: Update Status Bar to display move evaluation text.

### Phase 5: Synchronous Opening Book & Documentation
**Goal:** Optimize performance for old devices in the early game & update project specs.
- **[MODIFY] `js/chess-ai-v2.js`**: Integrate a static opening book (FEN -> Move) to bypass Worker initialization for the first 3-5 moves.
- **[MODIFY] `requirements_einkchess.md`**: 
  - Note the exception to Rule 5 for the Bot V2 Web Worker.
  - Document the Kindle fixes (Blob inject, `setTimeout`, Hash 16MB).
  - Update the Bot Level table to reflect the new 10 Offline Levels (400-2400).
  - Document the Move Analysis feature (Centipawn evaluation, Badges) and Opening Book integration.

## Verification Plan
- Play Level 1 and verify the bot consistently drops pieces (plays at a 400 ELO level).
- Play Level 10 and verify it thinks for 4 seconds and plays flawlessly.
- Play poorly and ensure the "Blunder" (??) badge appears.
- Test all action buttons (Undo, Resign, Flip, Refresh) in `play-bot-v2.html` to ensure nothing was lost.
