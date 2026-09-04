/**
 * ====================================================================
 * CHESS PERSONA & CHAT (ES5 COMPLIANT) — EinkChess AI Personas Module
 * 10 Bot Personas with unique playstyles, opening biases and VI/EN dialogue
 * ====================================================================
 */

(function(root) {
    "use strict";

    var W = 1, B = -1;

    var AI_PERSONA_LIST = [
            /* ---------- TRẮNG ---------- */
            {
                id: 'london_white', label: 'London (tr\u1eafng)', color: W,
                bookBias: {
                    '': 'd2d4', 'd2d4 d7d5': 'c1f4', 'd2d4 g8f6': 'g1f3',
                    'd2d4 f7f5': 'g1f3', 'd2d4 b8c6': 'd4d5',
                    'd2d4 g8f6 g1f3 d7d5': 'c1f4', 'd2d4 g8f6 g1f3 e7e6': 'c1f4',
                    'd2d4 g8f6 g1f3 g7g6': 'c1f4'
                },
                plan: [{ piece: 'P', to: 'd4' }, { piece: 'N', to: 'f3' }, { piece: 'B', to: 'f4' },
                { piece: 'P', to: 'e3' }, { piece: 'B', to: 'd3' }, { piece: 'N', to: 'd2' },
                { piece: 'K', to: 'g1' }, { piece: 'P', to: 'c3' }],
                style: { trade: 0, queenEarly: false, openAggr: -1, castleFast: true, flankPawns: 0 }
            },
            {
                id: 'colle_white', label: 'Colle System (tr\u1eafng)', color: W,
                bookBias: { '': 'd2d4' },
                plan: [{ piece: 'P', to: 'd4' }, { piece: 'N', to: 'f3' }, { piece: 'P', to: 'e3' },
                { piece: 'B', to: 'd3' }, { piece: 'K', to: 'g1' }, { piece: 'N', to: 'd2' },
                { piece: 'P', to: 'c3' }, { piece: 'R', to: 'e1' }],
                style: { trade: -1, queenEarly: false, openAggr: -1, castleFast: true, flankPawns: -1 }
            },
            {
                id: 'italian_white', label: 'Italian (tr\u1eafng)', color: W,
                bookBias: { '': 'e2e4', 'e2e4 e7e5': 'g1f3', 'e2e4 e7e5 g1f3 b8c6': 'f1c4' },
                plan: [{ piece: 'P', to: 'e4' }, { piece: 'N', to: 'f3' }, { piece: 'B', to: 'c4' },
                { piece: 'K', to: 'g1' }, { piece: 'P', to: 'c3' }, { piece: 'P', to: 'd3' },
                { piece: 'R', to: 'e1' }],
                style: { trade: -1, queenEarly: false, openAggr: 1, castleFast: true, flankPawns: 0 }
            },
            {
                id: 'ruylopez_white', label: 'Ruy Lopez (tr\u1eafng)', color: W,
                bookBias: { '': 'e2e4', 'e2e4 e7e5': 'g1f3' },
                plan: [{ piece: 'P', to: 'e4' }, { piece: 'N', to: 'f3' }, { piece: 'B', to: 'b5' },
                { piece: 'K', to: 'g1' }, { piece: 'R', to: 'e1' }, { piece: 'P', to: 'c3' },
                { piece: 'P', to: 'd4' }],
                style: { trade: 0, queenEarly: false, openAggr: 1, castleFast: true, flankPawns: 0 }
            },
            {
                id: 'vienna_white', label: 'Vienna (tr\u1eafng)', color: W,
                bookBias: { '': 'e2e4' },
                plan: [{ piece: 'P', to: 'e4' }, { piece: 'N', to: 'c3' }, { piece: 'B', to: 'c4' },
                { piece: 'N', to: 'f3' }, { piece: 'P', to: 'd3' }, { piece: 'K', to: 'g1' }],
                style: { trade: 1, queenEarly: false, openAggr: 1, castleFast: false, flankPawns: 0 }
            },
            {
                id: 'english_white', label: 'English (tr\u1eafng)', color: W,
                bookBias: { '': 'c2c4' },
                plan: [{ piece: 'P', to: 'c4' }, { piece: 'N', to: 'c3' }, { piece: 'P', to: 'g3' },
                { piece: 'B', to: 'g2' }, { piece: 'N', to: 'f3' }, { piece: 'K', to: 'g1' },
                { piece: 'P', to: 'd3' }],
                style: { trade: 0, queenEarly: false, openAggr: -1, castleFast: false, flankPawns: 1 }
            },
            {
                id: 'reti_white', label: 'R\u00e9ti (tr\u1eafng)', color: W,
                bookBias: { '': 'g1f3' },
                plan: [{ piece: 'N', to: 'f3' }, { piece: 'P', to: 'c4' }, { piece: 'P', to: 'g3' },
                { piece: 'B', to: 'g2' }, { piece: 'K', to: 'g1' }, { piece: 'P', to: 'd4' }],
                style: { trade: 0, queenEarly: false, openAggr: -1, castleFast: true, flankPawns: 0 }
            },
            {
                id: 'kia_white', label: 'King\u2019s Indian Attack (tr\u1eafng)', color: W,
                bookBias: { '': 'g1f3' },
                plan: [{ piece: 'N', to: 'f3' }, { piece: 'P', to: 'g3' }, { piece: 'B', to: 'g2' },
                { piece: 'K', to: 'g1' }, { piece: 'P', to: 'd3' }, { piece: 'N', to: 'd2' },
                { piece: 'P', to: 'e4' }, { piece: 'R', to: 'e1' }],
                style: { trade: -1, queenEarly: false, openAggr: 1, castleFast: true, flankPawns: 0 }
            },
            {
                id: 'queensgambit_white', label: 'Queen\u2019s Gambit (tr\u1eafng)', color: W,
                bookBias: { '': 'd2d4', 'd2d4 d7d5': 'c2c4' },
                plan: [{ piece: 'P', to: 'd4' }, { piece: 'P', to: 'c4' }, { piece: 'N', to: 'c3' },
                { piece: 'N', to: 'f3' }, { piece: 'B', to: 'g5' }, { piece: 'P', to: 'e3' }],
                style: { trade: 1, queenEarly: false, openAggr: 0, castleFast: false, flankPawns: 0 }
            },

            /* ---------- ĐEN ---------- */
            {
                id: 'sicilian_black', label: 'Sicilian (\u0111en)', color: B,
                bookBias: {
                    'e2e4': 'c7c5', 'c2c4': 'c7c5', 'g1f3': 'c7c5',
                    'e2e4 c7c5 g1f3': 'd7d6'
                },
                plan: [{ piece: 'P', to: 'c5' }, { piece: 'N', to: 'c6' }, { piece: 'P', to: 'd6' },
                { piece: 'N', to: 'f6' }, { piece: 'P', to: 'e6' }, { piece: 'B', to: 'e7' },
                { piece: 'K', to: 'g8' }],
                style: { trade: 0, queenEarly: false, openAggr: 1, castleFast: true, flankPawns: 0 }
            },
            {
                id: 'kid_black', label: 'King\u2019s Indian (\u0111en)', color: B,
                bookBias: {
                    'd2d4': 'g8f6', 'c2c4': 'g8f6', 'g1f3': 'g8f6', 'e2e4': 'g7g6',
                    'd2d4 g8f6 c2c4': 'g7g6', 'd2d4 g8f6 g1f3': 'g7g6',
                    'd2d4 g8f6 c1g5': 'g7g6', 'd2d4 g8f6 c2c4 g7g6 b1c3': 'f8g7'
                },
                plan: [{ piece: 'N', to: 'f6' }, { piece: 'P', to: 'g6' }, { piece: 'B', to: 'g7' },
                { piece: 'P', to: 'd6' }, { piece: 'K', to: 'g8' }, { piece: 'P', to: 'e5' }],
                style: { trade: -1, queenEarly: false, openAggr: -1, castleFast: true, flankPawns: 0 }
            },
            {
                id: 'grunfeld_black', label: 'Gr\u00fcnfeld (\u0111en)', color: B,
                bookBias: { 'd2d4': 'g8f6', 'c2c4': 'g8f6', 'g1f3': 'g8f6' },
                plan: [{ piece: 'N', to: 'f6' }, { piece: 'P', to: 'g6' }, { piece: 'P', to: 'd5' },
                { piece: 'B', to: 'g7' }, { piece: 'K', to: 'g8' }, { piece: 'P', to: 'c5' }],
                style: { trade: 1, queenEarly: false, openAggr: 1, castleFast: true, flankPawns: 0 }
            },
            {
                id: 'nimzo_black', label: 'Nimzo/QID (\u0111en)', color: B,
                bookBias: { 'd2d4': 'g8f6', 'c2c4': 'g8f6', 'g1f3': 'g8f6' },
                plan: [{ piece: 'N', to: 'f6' }, { piece: 'P', to: 'e6' }, { piece: 'B', to: 'b4' },
                { piece: 'K', to: 'g8' }, { piece: 'P', to: 'd5' }, { piece: 'P', to: 'c5' }],
                style: { trade: 0, queenEarly: false, openAggr: 0, castleFast: true, flankPawns: 0 }
            },
            {
                id: 'slav_black', label: 'Slav (\u0111en)', color: B,
                bookBias: { 'd2d4': 'd7d5', 'c2c4': 'd7d5', 'g1f3': 'd7d5' },
                plan: [{ piece: 'P', to: 'd5' }, { piece: 'P', to: 'c6' }, { piece: 'N', to: 'f6' },
                { piece: 'B', to: 'f5' }, { piece: 'P', to: 'e6' }, { piece: 'N', to: 'd7' }],
                style: { trade: -1, queenEarly: false, openAggr: -1, castleFast: false, flankPawns: 0 }
            },
            {
                id: 'french_black', label: 'French (\u0111en)', color: B,
                bookBias: { 'e2e4': 'e7e6' },
                plan: [{ piece: 'P', to: 'e6' }, { piece: 'P', to: 'd5' }, { piece: 'N', to: 'f6' },
                { piece: 'B', to: 'e7' }, { piece: 'K', to: 'g8' }, { piece: 'P', to: 'c5' },
                { piece: 'N', to: 'c6' }],
                style: { trade: -1, queenEarly: false, openAggr: -1, castleFast: true, flankPawns: 0 }
            },
            {
                id: 'carokann_black', label: 'Caro-Kann (\u0111en)', color: B,
                bookBias: { 'e2e4': 'c7c6' },
                plan: [{ piece: 'P', to: 'c6' }, { piece: 'P', to: 'd5' }, { piece: 'B', to: 'f5' },
                { piece: 'N', to: 'd7' }, { piece: 'N', to: 'f6' }, { piece: 'P', to: 'e6' },
                { piece: 'B', to: 'e7' }, { piece: 'K', to: 'g8' }],
                style: { trade: 1, queenEarly: false, openAggr: -1, castleFast: true, flankPawns: 0 }
            },
            {
                id: 'pirc_black', label: 'Pirc (\u0111en)', color: B,
                bookBias: { 'e2e4': 'd7d6' },
                plan: [{ piece: 'P', to: 'd6' }, { piece: 'N', to: 'f6' }, { piece: 'P', to: 'g6' },
                { piece: 'B', to: 'g7' }, { piece: 'K', to: 'g8' }, { piece: 'P', to: 'c6' }],
                style: { trade: 0, queenEarly: false, openAggr: -1, castleFast: true, flankPawns: 0 }
            },
            {
                id: 'scandinavian_black', label: 'Scandinavian (\u0111en)', color: B,
                bookBias: { 'e2e4': 'd7d5' },
                plan: [{ piece: 'P', to: 'd5' }, { piece: 'Q', to: 'd5' }, { piece: 'N', to: 'f6' },
                { piece: 'P', to: 'c6' }, { piece: 'B', to: 'f5' }, { piece: 'P', to: 'e6' }],
                style: { trade: 0, queenEarly: true, openAggr: 0, castleFast: false, flankPawns: 0 }
            },
            {
                id: 'petrov_black', label: 'Petrov (\u0111en)', color: B,
                bookBias: { 'e2e4': 'e7e5', 'e2e4 e7e5 g1f3': 'g8f6' },
                plan: [{ piece: 'P', to: 'e5' }, { piece: 'N', to: 'f6' }, { piece: 'N', to: 'e4' },
                { piece: 'P', to: 'd5' }, { piece: 'B', to: 'd6' }, { piece: 'K', to: 'g8' }],
                style: { trade: 1, queenEarly: false, openAggr: 0, castleFast: true, flankPawns: 0 }
            }
        ];

    var CHAT_DISPLAY_TIME = 5000;
        var CHAT_DEBUG = false; /* [DEBUG CHAT] Bat 'true' de moi cau chat hien kem [tenBien+xacSuat%] o cuoi, giup xac dinh dung nhanh/dieu kien nao vua kich hoat cau chat do. */

        /* ── Chat probability tiers — chỉnh tần suất TOÀN BỘ chat tại 1 chỗ duy nhất ──
           ALWAYS : sự kiện cơ học bắt buộc phải nói (kết quả ván, feedback classify)
           HIGH   : sự kiện hay/hiếm, đáng chú ý (lật kèo, streak, mốc mở đầu...)
           MED    : tần suất vừa, mốc lặp lại đều nhưng không muốn nói mỗi lần
           LOW    : nhận xét nền, lấp khoảng trống — tránh nói nhiều */
        var CHAT_TIER_ALWAYS = 1.00;
        var CHAT_TIER_HIGH = 0.25;
        var CHAT_TIER_MED = 0.10;
        var CHAT_TIER_LOW = 0.05;

        var CHAT_PROB_OPENING_EARLY = CHAT_TIER_MED;    /* 0.10 */
        var CHAT_PROB_OPENING_MID = CHAT_TIER_MED;    /* 0.10 */
        var CHAT_PROB_AI_EDGE = CHAT_TIER_HIGH;   /* 0.25 — aiWinning/aiLosing, 1 lần/ván */
        var CHAT_PROB_IDLE = CHAT_TIER_LOW;    /* 0.05 */
        var CHAT_PROB_THINKING_GENERIC = 0.95;              /* 5% chủ đề / 95% mặc định */
        var CHAT_PROB_YOUR_TURN_GENERIC = 0.95;              /* 5% chủ đề / 95% mặc định */

        /* Prob cho các chat MỚI */
        var CHAT_PROB_STREAK = CHAT_TIER_HIGH;   /* streak5 / streak8, 25%, 1 lần/mốc */
        var CHAT_PROB_BOOK = CHAT_TIER_HIGH;   /* bookMaster, 25%, 1 lần/ván */
        var CHAT_PROB_SWING = CHAT_TIER_HIGH;   /* aiComeback / aiSlipping, 25%, 1 lần/ván */
        var CHAT_PROB_STYLE = 0.10;             /* styleCautious / styleOpen, 10%, 1 lần/ván */
        var CHAT_PROB_AI_BLUNDER = CHAT_TIER_ALWAYS; /* [Hợp nhất từ ChessTwinkle4EDG] Khôi phục
  100% — trước đây tôi giảm 100%->25% để vá triệu chứng "chat quá dày", nhưng EDG sửa đúng
  GỐC RỄ bằng _matchedBestNotable() (chỉ coi matchedBest=true khi cách biệt rõ ≥60cp với lựa
  chọn #2, xem nơi gọi _classifyFinish) — cách này chính xác hơn hẳn: giữ 100% cho ĐÚNG những
  lúc thực sự đáng ("bạn tìm ra điều tôi lo ngại"), thay vì random 25% trên cả những lần đúng
  lẫn những lần chỉ là nước hiển nhiên/duy nhất hợp lý. */
        var CHAT_PROB_AI_ENDGAME = CHAT_TIER_ALWAYS; /* aiEndgame (đổi tên exchange), 100%, 1 lần/ván */

        var CHAT_TEXT_VI = {

            /* ═══════════════════════════════════════════════════
               NHÓM AI — máy tự nhận xét nước đi của mình
               ═══════════════════════════════════════════════════ */
            /* khi người chơi VỪA đi trúng đúng pv1 (nước máy tự dự đoán là tốt nhất cho đối thủ)
               sau nước AI trước đó — nghĩa là người chơi bắt bài/khai thác đúng ý AI lo ngại.
               Ưu tiên thấp hơn playerBrilliant/playerGreat/playerGreatDef và trạng thái chiếu
               (tự động nhường nhờ cấu trúc return sớm trong _classifyFinish, không cần check thêm) */
            aiBlunder: [
                'Ôi tôi mắc sai lầm...',
                'Tôi bỏ sót mất rồi.',
                'Tôi sơ suất quá!',
                'Tôi mắc sai lầm ngớ ngẩn rồi.',
                'Ầy dà, game khó quá...',
                'Ôi, quân mạnh của tôi!',
                'Đã nhọ còn phải cọ bồn cầu :(',
                'Thôi xong, mất quân chủ lực.',
                'Tôi phải gỡ gạc lại thôi.',
                'Không thấy cách nào tốt hơn...',
                'Bạn tận dụng sai lầm của tôi tốt đấy.'
            ],
            /* khi máy thắng */
            aiWin: [
                'Ván hay đấy! Chơi nữa không?',
                'Good game!',
                'Cố lên, thử lại đi!',
                'Tôi thắng rồi, nhưng bạn vẫn rất đáng gờm.',
                'Không sao đâu, thua ván này mình bày ván khác',
                'Cảm ơn vì một ván cờ vui nha.',
                'Tôi may mắn thôi, đừng nản bạn nhé.',
                'Đừng buồn, ván cờ này còn nhiều điều để học mà.',
                'Hẹn gặp lại nhé!'
            ],
            /* khi máy vừa đi great hoặc brilliant */
            aiGoodMove: [
                'Nước này chắc bạn không ngờ tới.',
                'Phản công nhé!',
                'Đến lượt tôi rồi.',
                'Quân đó không còn nữa, giờ tới bạn.',
                'Tôi tặng bạn một sự mất mát, mời bạn đi tiếp',
                'Một tổn thất nhỏ cho bạn, cố gắng gỡ lại nhé.',
                'Tôi tích lũy lợi thế từ những quân cờ nhỏ này đấy.',
                'Đừng chủ quan nhé, tôi bắt đầu tăng tốc rồi.',
                'Bạn có thấy nguy hiểm chưa? Đến lượt bạn.',
                'Hãy xem bạn đối phó thế nào với nước này.',
                'Có vẻ tôi đã tìm được cách',
                'Tôi sẽ nhận quân này nhé.',
                'Nước này khá lợi cho tôi.',
                'Tôi thấy bạn sơ hở rồi.',
                'Giờ đổi quân có lợi cho tôi đấy.',
                'Tôi nghĩ nước này ổn.',
                'Đây là cơ hội tốt.',
                'Bạn vừa để hở rồi.',
                'Tôi sẽ tận dụng cơ hội này.',
                'Giờ thì tới lượt tôi.',
                'Tôi nghĩ bạn nên cẩn thận.',
                'Thế cờ đang thay đổi rồi.',
                'Áp lực bắt đầu tăng đấy.',
                'Giờ thì không dễ nữa đâu.',
                'Tôi muốn xem bạn xử lý thế nào.',
                'Tôi khá hài lòng với nước này.',
                'Tôi vừa cải thiện vị trí một chút.',
                'Tôi tìm được đường phản công rồi.',
                'Bạn có thấy nguy hiểm chưa?',
                'Đây có thể là bước ngoặt.',
                'Thế trận bắt đầu mở ra rồi.',
                'Tôi đang có cơ hội tốt.',
                'Oke, nước này đỉnh phết.',
                'Tôi vừa thử độ chắc tay của bạn đó.',
                'Tôi đang thấy bàn cờ sáng hơn hẳn.',
                'Nước hay thì phải đi gọn như thế này.',
                'Tôi cook nhẹ một combo thôi ^^',
                'Bạn thấy áp lực chưa?',
                'Ơ hay, tự nhiên thấy bàn cờ dễ thở ghê.',
                'Pha này mà stream là chat spam “cháy” luôn.',
                'Okay, tới phase combat rồi nha.',
                'Không dễ phòng thủ đâu.'
            ],

            /* khi máy đang thua nhẹ (500–1200cp, xác suất 30%) */
            aiLosing: [
                'Bạn ép tui quá đáng rồi đó!',
                'Tui bị bạn ép thế bí rồi.',
                'Chờ đó, tui sẽ bật tôm lại!',
                'Bạn đánh rát quá, tui sợ rồi.',
                'Tui đang cố gỡ lại đây nè.',
                'Đừng tưởng tui dễ bị bắt nạt.',
                'Tui đang lâm vào thế khó rồi.',
                'Bạn làm tui tơi tả quá à!',
                'Cứ chờ xem tui lật kèo nha.',
                'Tôi cần một phép màu rồi.',
                'Có lẽ tôi đang lép vế.',
                'Bạn đang chơi rất chắc chắn.',
                'Bạn đừng vội mừng, tui chưa thua!',
                'Bạn ép tui dữ quá, nhưng tui sẽ tìm cách bật tôm lại!',
                'Tui đang bị ép vào thế bí, nhưng tui vẫn lì lắm nha.',
                'Đừng tưởng tui dễ bắt nạt, đợi tui lật kèo cho bạn xem.',
                'Bạn làm tui tơi tả rồi đó, nhưng tui chưa chịu thua đâu.',
                'Thế cờ này tui đang bất lợi, nhưng chờ đó tui sẽ gỡ.',
                'Đừng vội mừng nha, tui đang chờ cơ hội để bật tôm nè.',
                'Bạn đánh rát thế này thì tui chỉ có nước chịu trận thôi.',
                'Tui đang loay hoay tìm đường gỡ, bạn đừng chủ quan nhé.',
                'Chơi kiểu gì mà ép tui dữ vậy, để xem tui lật thế nào.',
                'Tui bắt đầu thấy ánh sáng cuối đường hầm… mà là tàu hỏa.',
                'Pha này mà gỡ được chắc lên huyền thoại.',
                'Xin nhẹ một đường sống đi bro.',
                'Tui đang gặp nguy hiểm rồi, nhưng vẫn chưa hết hy vọng!'
            ],
            /* khi máy đang hơn nhẹ (500–1200cp, xác suất 30%) */
            aiWinning: [
                'Tui đang nắm thế trận nè!',
                'Ván này tui cửa trên rồi đó.',
                'Đang đà thắng, tui tới đây!',
                'Bạn cẩn thận, tui tới gần rồi.',
                'Thế cờ này tui nắm chắc rồi.',
                'Đừng hòng chạy khỏi tay tui.',
                'Tui đang áp đảo bạn đó nha.',
                'Ván này tui chiếm ưu thế nè.',
                'Đừng chủ quan, tui đang thắng.',
                'Đang có đà, tui tấn công tiếp!',
                'Ván này mà bạn lật được là quá cháy.',
                'Chắc đang cân nhắc một pha comeback đây.',
                'Bạn đã chơi rất tốt, nhưng có lẽ tôi may mắn hơn.',
                'Tôi có chút lợi thế rồi, cố lên nhé!',
                'Hình như tôi đang dẫn trước.',
                'Ván này hấp dẫn quá, tôi đang tiến gần chiến thắng.',
                'Tôi đang có lợi thế khá lớn.',
                'Ván này có vẻ nghiêng về tôi rồi.',
                'Bạn vẫn còn cơ hội đấy.',
                'Đừng bỏ cuộc quá sớm nhé.',
                'Tôi sẽ cố kết thúc chính xác.',
                'Hàng phòng thủ của bạn bắt đầu lung lay rồi đấy.',
                'Thế trận này tui đang nắm trọn, bạn coi chừng bị tui bắt.',
                'Đừng tưởng tui dễ ăn, ván này tui đang chiếm ưu thế nè.',
                'Bạn thấy chưa, tui đang dẫn trước một bước rồi đó nha.',
                'Cục diện đang nghiêng về tui, bạn chuẩn bị tinh thần đi nhé.',
                'Tui đang kiểm soát ván đấu này, bạn đừng hòng xoay chuyển.',
                'Đà này là tui thắng chắc rồi, bạn cố gắng chống đỡ xem.',
                'Thắng lợi đang ở rất gần tui, bạn khó thoát khỏi tay rồi.',
                'Bạn sơ hở một chút là tui lấn lướt ngay, cẩn thận nha.',
                'Tui đang làm chủ cuộc chơi, bạn cứ từ từ mà chịu đòn.',
                'Pha này mà thua nữa chắc tại lag ^^',
                'Bạn đang hơi “đuối meta” rồi đó.',
                'Okay, giờ là phase snowball.',
                'Không khí này có mùi checkmate nhẹ.',
                'Bàn cờ giờ giống sân nhà của tui vậy.',
                'Tui đang đánh như có buff elo.',
                'Thế trận này nhìn mà muốn bật nhạc boss fight.',
                'Tui đang build lợi thế như farm rank cuối mùa.',
                'Tui thấy vua bạn bắt đầu bất ổn rồi nha.',
                'Pha này mà stream chắc chat spam “toang”.',
                'Bạn đang ở trong vùng nguy hiểm rồi đó.',
                'Pha này đúng kiểu “thắng từ từ mới đau”.',
                'Tui đang khiến bàn cờ lệch hẳn về phía mình rồi.',
                'Đừng lo, tui sẽ kết thúc nhẹ nhàng thôi ^^',
                'Cảm giác nắm thế trận trong tay thật là thích ghê luôn nè!'
            ],

            /* ═══════════════════════════════════════════════════
               NHÓM PHẢN ỨNG CHUỖI — dựa trên streak độ chính xác của người chơi
               (best/great/greatDef/brilliant liên tục, xem ACCURATE_LABELS)
               ═══════════════════════════════════════════════════ */
            streak5: [
                'Đi chuẩn phết đấy, cứ giữ phong độ vậy nha!',
                'Bạn đang vào phom rồi đó.',
                'Ổn định ghê, không có sơ hở nào luôn.',
                'Cỡ này tôi phải tập trung hơn rồi đấy.'
            ],
            streak8: [
                'Ơ bạn học ở đâu mà chắc tay dữ vậy 😳',
                'Cỡ này tôi phải nghiêm túc hơn rồi.',
                'Chuỗi nước đi này đỉnh thật sự.',
                'Bạn đang chơi như đọc được nước đi của tôi vậy.'
            ],

            /* ═══════════════════════════════════════════════════
               NHÓM NỀN — one-shot, dựa trên dữ liệu book/phase/swing
               ═══════════════════════════════════════════════════ */
            bookMaster: [
                'Đi đúng bài bản đấy, học kỹ khai cuộc ha.',
                'Chuẩn sách vở luôn, không lệch nước nào.',
                'Bạn thuộc lý thuyết kỹ ghê.'
            ],
            styleCautious: [
                'Ván này cả 2 đánh kiểu thủ thế nhỉ, giữ quân kỹ ghê.',
                'Chưa ai chịu đổi quân cả, căng thẳng thật.',
                'Đánh kiểu chắc chắn vậy, tôi cũng phải cẩn thận hơn.'
            ],
            styleOpen: [
                'Đổi quân dữ dội ghê, chuẩn bị tàn cuộc sớm rồi.',
                'Ván này chơi mở, sòng phẳng đấy!',
                'Đổi quân nhanh vậy, thích chơi rõ ràng nhỉ.'
            ],
            aiComeback: [
                'Ơ hay, vừa lật kèo đó nha.',
                'Comeback ngoạn mục chưa!',
                'Tự nhiên tôi thấy dễ thở hẳn ra.'
            ],
            aiSlipping: [
                'Ơ khoan, sao tự nhiên hụt hơi vậy ta.',
                'Bạn vừa câu được 1 bàn rồi đó.',
                'Ván này vừa quay đầu bất ngờ ghê.'
            ],

            /* ═══════════════════════════════════════════════════
               NHÓM SỰ KIỆN / THÔNG BÁO LƯỢT
               ═══════════════════════════════════════════════════ */
            acceptDraw: [
                'Hòa! Cảm ơn bạn về ván đấu hay.',
                'Tôi đồng ý hòa, chơi lại ván khác nhé.',
                'Kết quả này cũng xứng đáng cho cả hai.',
                'Hòa nhé.',
                'Ván đấu hay đấy.',
                'Khá cân bằng.',
                'Không ai mắc sai lầm quyết định.',
                'Một kết quả hợp lý.',
                'Chúng ta ngang tài rồi.',
                'Tôi nghĩ hòa là công bằng.',
                'Ván này rất căng.',
                'Chơi tốt lắm.',
                'Lần sau phân thắng bại nhé.'
            ],
            aiEndgame: [
                'Giờ đánh tàn cuộc thôi.',
                'Đổi quân xong, cuộc chơi vẫn chưa ngã ngũ.',
                'Không còn hậu, vua sẽ hoạt động nhiều hơn.',
                'Đổi đều rồi, xem ai tàn cuộc giỏi hơn nào.',
                'Chúng ta chuyển sang giai đoạn mới rồi đây.',
                'Giờ là tàn cuộc rồi.',
                'Chúng ta vào phần khó nhất đây.',
                'Ít quân hơn nhưng chưa dễ đâu.',
                'Tàn cuộc luôn cần sự chính xác.',
                'Đây là lúc từng nước đều quan trọng.',
                'Không còn nhiều sai lầm được phép nữa.',
                'Ván cờ giờ đã đơn giản hơn.',
                'Được rồi, chơi chậm thôi.',
                'Giờ là cuộc chiến của tốt và vua.',
                'Tôi thích những ván tàn thế này.',
                'Từng nước giờ đều quan trọng.',
                'Đây là phần khó nhất của ván cờ.',
                'Chỉ một sai lầm là đủ.',
                'Giờ vua phải hoạt động thôi.',
                'Đổi quân chút nhé, tôi nghĩ thế này sẽ thú vị hơn.',
                'Đã đến tàn cuộc rồi, một sai lầm nhỏ là mất cả ván đấu.',
                'Giai đoạn cân não nhất đây, xem ai kiên nhẫn hơn nào.',
                'Quân số tuy ít nhưng tính toán thì không hề giảm đâu nhé.',
                'Trận đấu sắp hạ màn rồi, bạn đã sẵn sàng chưa?',
                'Tàn cuộc này đòi hỏi sự chính xác tuyệt đối đấy.'
            ],
            idle: [
                'Tôi đang tận hưởng ván cờ này.',
                'Cờ vua thật thú vị, phải không?',
                'Mỗi nước đi là một câu chuyện.',
                'Tôi tự hỏi bạn sẽ đi gì tiếp theo.',
                'Tôi thích những nước đi sáng tạo!',
                'Thế cờ này kín kẽ quá.',
                'Đừng để tôi thắng dễ quá nhé.',
                'Bàn cờ đang dần thú vị hơn rồi.',
                'Nhiều lúc chỉ một nước thôi là đổi cả thế trận.',
                'Tôi đang cố đoán kế hoạch của bạn đây.',
                'Không khí căng mà vui ghê.',
                'Tôi thích những ván đấu có nhiều bất ngờ.',
                'Đôi khi thủ tốt còn khó hơn công.',
                'Bạn chơi khá điềm tĩnh nhỉ ^^',
                'Tôi thích cảm giác khi tìm ra một nước hay.',
                'Có những thế cờ nhìn đơn giản mà khó ghê.',
                'Tôi bắt đầu thấy ván này có chiều sâu rồi đó.',
                'Mọi quân cờ đều có vai trò riêng.',
                'Tôi đang hơi tò mò kế hoạch dài hạn của bạn.',
                'Mỗi ván cờ đều có vibe riêng.',
                'Nước đi đẹp luôn khiến bàn cờ thú vị hơn.',
                'Tôi thích cảm giác đấu trí thế này.',
                'Ván này đúng kiểu chill mà căng.',
                'Không khí yên bình… trước cơn bão thôi.',
                'Tôi vẫn đang tìm cơ hội đẹp đây.',
                'Có cảm giác sắp tới đoạn gay cấn rồi.',
                'Đôi lúc nước đơn giản lại mạnh nhất.',
                'Tôi đang đợi một khoảnh khắc bùng nổ.',
                'Ván này mà kéo dài chắc sẽ rất hay.',
                'Ngoài cờ vua ra, tôi còn thích chơi rubik nữa!'
            ],
            offerDraw: [
                'Ván này cân bằng quá, hay là mình hòa nhé?',
                'Tôi thấy khó bên nào thắng, bạn nghĩ sao về một kết quả hòa?',
                'Đánh nữa cũng mệt, hòa được không?',
                'Tôi đề nghị hòa, bạn có đồng ý không?',
                'Cờ này dễ hòa lắm, bạn có muốn bắt tay không?'
            ],
            openingEarly: [
                'Lại gặp nhau rồi, hy vọng ván này sẽ kịch tính!',
                'Các nước đầu thường sẽ đi rất nhanh ^^.',
                'Chúng ta bắt đầu thôi.',
                'Bắt đầu thôi, chúc may mắn nhé!',
                'Khai cuộc nào, xem ai vào form trước nhé.',
                'Good Luck Have Fun nha ^^',
                'Tôi đã sẵn sàng rồi, còn bạn?',
                'Xem hôm nay ai kiểm soát trung tâm tốt hơn nhé.',
                'Đừng premove linh tinh nha ^^',
                'Tôi sẽ cố không blunder quá sớm.',
                'Ván này chơi chill thôi nhé.',
                'Không biết hôm nay bạn thích công hay thủ đây.',
                'Tôi đang tò mò opening của bạn đây.',
                'Nào, xem ai nhập thành trước nhé.',
                'Chơi vui là chính, thắng thua tính sau.',
                'Tôi sẽ cố đọc vị kế hoạch của bạn.',
                'Cứ bình tĩnh triển khai quân nhé.',
                'Khai cuộc là lúc mọi thứ còn rất yên bình.',
                'Tôi thích cảm giác bắt đầu một ván cờ mới.',
                'Chúc bạn có một opening thật mượt.',
                'Chúc bạn một ván cờ vui vẻ!'
            ],
            openingMid: [
                'Khai cuộc này có vẻ thú vị đấy!',
                'Hãy xem bạn chuẩn bị gì nào.',
                'Tôi thích những nước đi cổ điển.',
                'Hmm, một lựa chọn quen thuộc.',
                'Để xem bạn định chơi kiểu gì nhé.',
                'Hy vọng tôi nhớ đúng khai cuộc này.',
                'Bạn thích thế trận chậm à?',
                'Trận này có vẻ sẽ dài đây.',
                'Được rồi, vào việc thôi.',
                'Khởi đầu ổn đấy.',
                'Biến thể này lạ quá, để xem tôi đối phó thế nào.',
                'Tôi sẽ đáp trả bằng một nước cờ chuẩn giáo khoa!',
                'Biến thể này quen thuộc đây, bạn nghiên cứu kỹ rồi à?',
                'Khai cuộc bài bản đấy, để xem tiếp thế nào.',
                'Có mùi middle game căng đây.',
                'Tôi bắt đầu thấy kế hoạch của bạn rồi nhé.',
                'Không khí chiến thuật bắt đầu rồi đây.',
                'Bạn thích kiểm soát trung tâm nhỉ.',
                'Đến đoạn thú vị rồi đó.',
                'Chưa ai muốn lao vào all-in nhỉ.',
                'Tôi thích kiểu khai cuộc linh hoạt thế này.',
                'Khai cuộc tới đây là bắt đầu phải tự nghĩ rồi.',
                'Giờ là lúc kỹ năng thật lên tiếng.',
                'Tôi thấy vài điểm yếu bắt đầu xuất hiện rồi.',
                'Tôi đang cân nhắc kế hoạch dài hạn đây.',
                'Khai cuộc xong rồi, giờ mới là trận đấu thật sự.',
                'Chúng ta đã qua đoạn "warm up" rồi nhé.',
                'Có vẻ bạn đã chuẩn bị rất kỹ khai cuộc này?'
            ],
            resign: [
                'Tôi xin thua, bạn giỏi hơn tôi rồi.',
                'Thua rồi, chúc mừng bạn!',
                'Tôi không thể xoay chuyển được nữa, xin thua.'
            ],
            aiThinking: [
                'Máy đang suy nghĩ...',
                'Máy đang suy nghĩ...',
                'Máy đang suy nghĩ...',
                'Để tôi tính...',
                'Chờ chút, suy nghĩ đã...',
                'Để xem nào...',
                'Một phút suy ngẫm...',
                'Tôi đang tính tiếp...',
                'Cho tôi thêm chút thời gian...',
                'Chờ chút nhé.',
                'Tôi đang tính vài phương án.',
                'Bạn làm tôi phải suy nghĩ rồi.'
            ],
            thinkLong: [
                'Đừng lo, tôi cũng đang bận tính nước tiếp theo.',
                'Bạn cứ từ từ, tôi chờ được.',
                'Nước đi quan trọng đấy, cân nhắc kỹ nhé.',
                'Tôi tranh thủ uống trà trong lúc chờ.',
                'Không vội, thời gian là bạn của ta.',
                'Không cần vội đâu.',
                'Đi nhanh lên nào, tôi hay buồn ngủ lắm ^^',
                'Tới bạn đấy, nhớ động não nhé.',
                'Nước của tôi chill quá phải không? Dễ mà, đi lẹ đi bạn',
                'Cờ bí thì dí tốt đi bạn ^^',
                'Đừng để tôi chờ lâu, tôi dễ mất kiên nhẫn lắm.',
                'Tới bạn, nhưng đừng mắc sai lầm như lần trước nhé.',
                'Tôi cũng từng mất rất lâu ở vị trí này.',
                'Đây đúng là thế khó.',
                'Cứ bình tĩnh suy nghĩ nhé.',
                'Bạn đang tìm nước phản công à?',
                'Ván này căng thật.',
                'Tôi đoán bạn đang thấy điều gì đó.',
                'Chọn kỹ nhé.',
                'Nước đi này khó tính quá hả? Cứ thong thả nhé.',
                'Căng thẳng quá, tôi bắt đầu thấy hồi hộp rồi đây.',
                'Đừng lo, tôi vẫn ở đây chờ siêu phẩm từ bạn.',
                'Ủa, đang tính toán combo bí mật hả bạn?',
                'Tôi thấy bạn đang cân não dữ lắm.',
                'Bạn cứ xoay góc nhìn thêm chút nữa đi.',
                'Đầu óc đang quay như chong chóng à?',
                'Nước đẹp thường đến sau khi nghĩ hơi lâu đó.',
                'Lựa kỹ đi, tôi thích những pha có tính toán.',
                'Tôi đang hóng một nước đi xịn từ bạn đây.',
                'Bình tĩnh, không cần đánh nhanh mà ẩu đâu.',
                'Bạn mà đi chuẩn nước này là tôi cũng phải gật gù.',
                'Đừng để thời gian làm bạn phân tâm nhé.',
                'Có vẻ bạn đang đứng giữa vài lựa chọn khó đây.',
                'Bình tĩnh, đôi khi nước tốt nhất không đến ngay.',
                'Bạn cứ suy nghĩ thêm đi, tôi không vội.',
                'Tôi biết cảm giác này, chọn nước thôi mà như chọn số phận ^^',
                'Giữ cái đầu lạnh nhé, sắp ra quyết định rồi.',
                'Tôi đang thấy bạn tính khá sâu đấy.',
                'Đừng nóng, bàn cờ không chạy mất đâu.',
                'Nước này mà chuẩn thì rất đẹp luôn.',
                'Tôi đang hóng khoảnh khắc bạn bẻ lái đây.',
                'Tôi đoán bạn đang lật qua rất nhiều phương án.',
                'Nhìn lâu thế này chắc có biến rồi.',
                'Tôi vẫn ổn, bạn cứ từ từ nhé.',
                'Không cần vội, nhưng cũng đừng AFK nha ^^',
                'Đang suy nghĩ kiểu “đi gì cũng thấy nguy hiểm” à?',
                'Tôi thích những lúc cả hai đều phải căng não thế này.',
                'Chờ chút nữa thôi, siêu phẩm sắp ra rồi chăng?',
                'Căng như dây đàn, một nước đi sai là hỏng cả ván cờ.'
            ],
            yourTurn: [
                'Tới lượt bạn rồi.',
                'Đến lượt bạn.',
                'Giờ tới bạn.',
                'Mời bạn.',
                'Bóng đã sang sân của bạn, xin mời.',
                'Một nước đi đơn giản, xin mời bạn đáp trả.',
                'Nước cờ của tôi đấy, bạn tính sao?',
                'Đến bạn rồi, đừng để tôi đợi lâu nha!',
                'Tôi đã đi một nước cực kỳ khiêm tốn, mời bạn thể hiện.',
                'Đừng để tôi chờ lâu, tôi dễ mất kiên nhẫn lắm.',
                'Tôi đi xong rồi nha.',
                'Bàn cờ giờ là của bạn.',
                'Tới bạn rồi đó, đừng run tay nhé.',
                'Your move ^^',
                'Bạn có nước nào hay thì đáp trả nhé'
            ],
            youWin: [
                'Chúc mừng nhé!',
                'Bạn chơi rất hay.',
                'Ván này bạn xứng đáng thắng.',
                'Bạn tận dụng cơ hội rất tốt.',
                'Lần sau tôi sẽ cẩn thận hơn.'
            ],
            suggestResign: [
                'Khó quá, làm ván mới nhé?',
                'Thấy khó quá thì có thể xin thua bạn nha!',
                'Bế tắc rồi, nhấn thua đi bạn!',
                'Làm ván mới cho nhẹ đầu nha!',
                'Thấy đuối rồi thì nghỉ tay nhé.',
                'Thấy cá đuối thì xin thua nha bạn ^^',
                'Thằng em mình đang đợi kìa, khó quá thì bạn xin thua rồi đấu với nó nhé',
                'Căng quá, hay mình reset nhỉ?',
                'Thua ván này, bày ván sau đi bạn!',
                'Chơi lại ván mới cho vui nha!',
                'Thế trận này căng lắm, làm ván mới cho nhẹ đầu nhé?',
                'Khó quá thì mình xin thua, đấu lại cho vui nha!',
                'Đừng để thế cờ này làm khó, nhấn thua rồi nghỉ tay nha.',
                'Thua ván này đâu có sao, làm ván mới mình phục thù nè!',
                'Bên kia có ván mới đang chờ, mình khởi động lại nhé?',
                'Thấy đuối quá thì cứ nhấn thua, ván sau tôi nhường bạn!',
                'Cờ này bế tắc quá rồi, mình reset lại đấu ván khác nha.',
                'Nước đi này làm khó bạn hả, thôi xin thua rồi làm lại đi!',
                'Đừng buồn nha, thua một ván rồi mình đấu lại ván mới!',
                'Bạn đã cố hết sức rồi, nghỉ ngơi một chút rồi chơi tiếp!'
            ],

            /* ═══════════════════════════════════════════════════
               NHÓM PLAYER — máy phản ứng nước đi của người
               ═══════════════════════════════════════════════════ */
            playerBrilliant: [
                'Không ngờ bạn lại đi vậy...',
                'Ồ! Nước đó hay đấy.',
                'Thú vị thật.',
                'Tôi chưa nghĩ đến nước đó.',
                'Tuyệt vời! Tôi không ngờ tới nước đó.',
                'Nước cờ xuất sắc đấy!',
                'Tuyệt vời! Tôi phải học hỏi đây.',
                'Cờ cao thủ đây rồi!',
                'Bạn thực sự biết cách gây bất ngờ.',
                'Rất thông minh, tôi phải học hỏi.',
                'Tôi bị lạc nhịp vì nước đi này.',
                'Okay, pha này tôi công nhận.',
                'Bạn vừa tìm ra một ý tưởng cực hay.',
                'Ồ wow, cú này sắc quá.',
                'Bạn đọc vị trí quá tốt.',
                'Pha xử lý này rất đẳng cấp.',
                'Bạn tìm ra tactic đẹp ghê.',
                'Ơ kìa, sao bạn thấy được nước này hay vậy?',
                'Tôi vừa bị outplay nhẹ rồi.',
                'Cú này khiến tôi phải đứng hình vài giây.',
                'Bạn đang chơi rất vào tay đấy.',
                'Nước này làm tôi phải suy nghĩ lại kế hoạch.',
                'Đúng kiểu “nhìn đơn giản nhưng cực mạnh”.',
                'Pha này đáng được lưu highlight luôn.',
                'Nước này nhìn phát tỉnh ngủ luôn.',
                'Bạn đang flex IQ đúng không?',
                'Ui da, tactical monster đây rồi.',
                'Bạn vừa làm tôi nghi ngờ chính mình.',
                'Được rồi, tôi bắt đầu rén thật rồi.',
                'Ủa, sao càng đánh bạn càng ghê vậy?',
                'Ui, nước đi này tôi chưa tính tới! Đỉnh thật.'
            ],
            /* playerBlunder cũ tách thành 4 pool: lần đầu/lặp lại  ×  nhẹ/nặng (xem pickBlunderChat) */
            playerBlunderFirstMild: [
                'Bạn mắc sai lầm rồi.',
                'Hình như bạn vừa sơ suất?',
                'Có vẻ bạn đã bỏ lỡ mối đe dọa.',
                'Đừng nản, ai cũng có lúc nhầm.',
                'Ôi, bạn có chắc không?',
                'Cú này hơi tiếc nha.',
                'Tiếc quá, nước đó cho tôi cơ hội đấy.',
                'Bạn chắc chứ? Tôi thấy có lựa chọn tốt hơn.'
            ],
            playerBlunderFirstMajor: [
                'Đây là cơ hội của tôi rồi.',
                'Blunder! Bạn vừa tự bắn vào chân mình.',
                'Ối, mất nặng đấy... bình tĩnh gỡ lại nhé!',
                'Nước này có mùi “toang” nhẹ.',
                'Ui da, quân cờ biết bay kìa!',
                'Combo tự hủy kích hoạt.',
                'Ủa alo? Sao lại đi vậy?',
                'Pha này hơi “đi vào lòng đất” rồi nha.'
            ],
            playerBlunderRepeatMild: [
                'Lại lỡ tay nữa rồi 😅',
                'Ấy ấy, cẩn thận chút đi bạn ơi.',
                'Bạn có chắc là đang tập trung không?',
                'Cờ của bạn dễ đoán thật.',
                'Ơ, free à? Vậy tôi xin nhé ^^',
                'Bạn vừa click nhầm hả?',
                'Xin lỗi nhưng nước này hơi comedy.'
            ],
            playerBlunderRepeatMajor: [
                'Ơ hay, sao dạo này mất quân hoài vậy ta 😬',
                'Bạn có đang bấm nhầm ô không đấy?',
                'Pha này mà lên recap là top 10 sai lầm luôn.',
                'Bạn vừa để tôi có content rồi ^^',
                'Chán thế, không có thử thách gì cả.',
                'Tôi cứ tưởng bạn chơi hay hơn chứ.',
                'Bạn vừa tự tạo plot twist.',
                'Nước này khiến engine trong tôi bật cười.'
            ],
            playerMissedMate: [
                'May cho tôi đấy, hú hồn!',
                'Thoát rồi! Cơ hội của tôi đây.',
                'Tôi tưởng xong rồi... may quá!',
                'Bạn vừa tha cho tôi đấy.',
                'Chiếu hết mà bỏ qua — tôi sẽ không bỏ lỡ lần này.',
                'Hú vía! Bạn không thấy nước đó à?',
                'Tôi may mắn thật, cảm ơn bạn!'
            ],
            playerMissedWin: [
                'Bạn vừa tặng tôi hy vọng rồi đó.',
                'Tôi nghĩ bạn chiếm thế thắng... nhưng thôi.',
                'Cơ hội của tôi quay lại rồi!',
                'Bạn bỏ lỡ mất rồi, để tôi tận dụng nhé.',
                'Lợi thế của bạn vừa biến mất.',
                'Tôi thở phào rồi, cảm ơn bạn!',
                'Bạn có chắc nước đó là tốt nhất không?'
            ],
            playerGreat: [
                'Nước đi hay!',
                'Hmm, tôi chưa nhìn ra.',
                'Ồ, khá sắc bén đấy.',
                'Tôi vừa bị gây áp lực rồi.',
                'Cũng khó chịu đấy.',
                'Có vài nước khá khó chịu đấy.',
                'Nước này mạnh hơn tôi nghĩ.',
                'Bạn chơi được đấy!',
                'Cũng ra gì đấy :)',
                'Biết chơi đấy :)',
                'Cũng được, nhưng chưa phải hay nhất.',
                'Hợp lý!',
                'Bạn vừa cải thiện vị trí rất tốt.',
                'Bạn đang chơi rất chắc.',
                'Bạn đang khiến ván này khó hơn.',
                'Một chút sơ hở rồi... bạn tận dụng tốt quá.',
                'Bạn nhìn ra rất nhanh đấy.',
                'Được ăn cả, ngã về không rồi.',
                'Á à, chơi hệ tactical à?',
                'Ơ kìa, nay đánh ghê thế.',
                'Bạn cook nước này ngon đấy.',
                'Ui da, cú này hơi cháy.',
                'Không phải dạng vừa đâu nha.',
                'Pha này out trình nha.',
                'Bạn đang flex kỹ năng à ^^',
                'Được đấy bro, đi nét căng luôn.',
                'Nước này slay thật sự.',
                'Bạn vừa làm bàn cờ “ảo ma Canada” rồi.',
                'Chơi vậy ai chơi lại?',
                'Ghê nha, không còn là newbie nữa rồi.',
                'Bạn vừa cho tôi ăn mind game à?',
                'Okay, respect!',
                'Ơ hay, hôm nay phong độ cao dữ vậy?',
                'Đỉnh nóc, kịch trần, bay phấp phới ^^',
                'Ủa gì căng dữ vậy ba.',
                'Nước đi này chất lượng.'
            ],
            playerGreatDef: [
                'Tuyệt vời! Tôi không ngờ tới nước đó.',
                'Nước cờ xuất sắc đấy!',
                'Bạn thực sự biết cách gây bất ngờ.',
                'Rất thông minh, tôi phải học hỏi.',
                'Tôi bị lạc nhịp vì nước đi này.',
                'Ui, nước đi này tôi chưa tính tới! Đỉnh thật.'
            ],
            playerUnderPressure: [
                'Ái chà, nguy hiểm thật!',
                'Bạn đang dồn tôi vào thế khó đấy.',
                'Chiếu à?',
                'Check! Căng thẳng quá.',
                'Tôi phải thoát chiếu đã...',
                'Vua tôi đang gặp nguy hiểm.',
                'Tôi cần cẩn thận hơn.',
                'Bạn đang tăng áp lực rồi.',
                'Khá nguy hiểm đấy.',
                'Ơ kìa, dí vua tôi dữ vậy.',
                'Chiếu gắt vậy trời.',
                'Bạn định all-in luôn hả?',
                'Bạn đang mở chiến dịch săn vua à?',
                'Đánh vậy là hơi “combat” rồi nha.',
                'Ơ từ từ, tôi chưa kịp nhập thành tinh thần.',
                'Check nữa à? Bạn ác vừa thôi chứ ^^',
                'Cho vua tôi một ngày bình yên đi.',
                'Tôi đang cố giữ cái ngai vàng đây.',
                'Được rồi, giờ không thể chơi chill nữa rồi.'
            ]
        };

        var CHAT_TEXT_EN = {
            aiBlunder: [
                'Oops, I made a mistake...',
                'I completely missed that.',
                'Careless of me!',
                'That was a silly blunder.',
                'Oh boy, this game is tough...',
                'Oh no, my piece!',
                'Things just went from bad to worse :(',
                'Well, there goes my key piece.',
                'I need to fight back now.',
                'I saw no better move...',
                'You capitalized on my mistake nicely.'
            ],
            aiWin: [
                'Great game! Rematch?',
                'Good game!',
                'Keep trying, play again!',
                'I won this time, but you played well.',
                'No worries, let us set up another game.',
                'Thank you for a fun match.',
                'I got lucky this time, do not give up.',
                'Do not be sad, every game is a learning opportunity.',
                'See you in the next match!'
            ],
            aiGoodMove: [
                'You probably did not see this coming.',
                'Time to counterattack!',
                'My turn now.',
                'That piece is gone, your move.',
                'A little gift of loss for you, your turn.',
                'A minor setback for you, let us see you recover.',
                'Accumulating small advantages piece by piece.',
                'Do not let your guard down, I am speeding up.',
                'Do you feel the danger? Your turn.',
                'Let us see how you handle this.',
                'Looks like I found a way.',
                'I will gladly take that piece.',
                'This move favors me.',
                'I spotted a weakness.',
                'This trade works in my favor.',
                'I think this is a solid move.',
                'A great opportunity.',
                'You left an opening there.',
                'I will take full advantage of this.',
                'Now it is my show.',
                'You should be careful now.',
                'The tide of the game is turning.',
                'Pressure is mounting.',
                'It will not be easy from here on.',
                'Curious to see your response.',
                'I am quite pleased with this move.',
                'Just improved my position slightly.',
                'Found a path to counter-attack.',
                'Danger is lurking, beware.',
                'This might be the turning point.',
                'The position is opening up.',
                'Looking promising for me.',
                'Clean tactical strike.',
                'Just testing your defenses.'
            ],
            aiLosing: [
                'You are pressing me too hard!',
                'I am cornered here.',
                'Just wait, I will bounce back!',
                'Fierce play, you got me scared.',
                'Struggling to hold on here.',
                'Do not think I will go down easy.',
                'I am in a tough spot.',
                'You are tearing through my defense!',
                'Just wait for my comeback.',
                'I need a miracle right now.',
                'Seems I am falling behind.',
                'You are playing very solidly.',
                'Do not celebrate yet, I have not lost!',
                'Tough defense, but I am finding a way out.',
                'Danger ahead, but hope is not lost!'
            ],
            aiWinning: [
                'I have full control now!',
                'I have the upper hand this game.',
                'Riding the momentum, here I come!',
                'Be careful, I am closing in.',
                'I have got this position locked down.',
                'No escape from this attack.',
                'Overwhelming position for me.',
                'Holding the advantage here.',
                'Do not get complacent, I am winning.',
                'Attacking with full momentum!',
                'If you turn this around, it would be legendary.',
                'You played well, but fortune favors me today.',
                'A nice advantage for me, keep fighting!',
                'Looks like I am in the lead.',
                'Exciting game, nearing victory.',
                'Solid advantage building up.',
                'Things are tilting in my favor.',
                'You still have chances, do not surrender yet.',
                'Your defense is starting to crumble.',
                'Snowball phase activated.',
                'Smells like a checkmate is brewing.',
                'Playing like I have an ELO boost today ^^'
            ],
            streak5: [
                'Spot on moves, keep up the rhythm!',
                'You are really in the zone.',
                'Super solid, zero weaknesses so far.',
                'I need to focus harder against you.'
            ],
            streak8: [
                'Where did you learn to play so accurately? 😳',
                'Time for me to get serious.',
                'Incredible streak of moves!',
                'Playing like you can read my mind.'
            ],
            bookMaster: [
                'Textbook moves! You studied your openings well.',
                'Right out of the book, no deviation.',
                'Deep opening theory knowledge!'
            ],
            styleCautious: [
                'A cautious, defensive game from both sides.',
                'Nobody wants to trade pieces yet, intense tension.',
                'Solid play, I will need to be careful too.'
            ],
            styleOpen: [
                'Heavy trades everywhere, early endgame incoming!',
                'Open and aggressive game, I like it!',
                'Fast exchanges, straight to the point.'
            ],
            aiComeback: [
                'And just like that, the tables have turned!',
                'What a comeback!',
                'Suddenly I can breathe a lot easier.'
            ],
            aiSlipping: [
                'Wait, how did my advantage slip away?',
                'You just snatched the momentum.',
                'An unexpected twist in the game!'
            ],
            acceptDraw: [
                'Draw! Thank you for a great game.',
                'I agree to a draw, let us play again.',
                'A fair outcome for both of us.',
                'Draw agreed.',
                'Good game, well played.',
                'Nicely balanced match.',
                'Neither side made a decisive error.',
                'A reasonable result.',
                'We are evenly matched.',
                'A draw seems only fair.',
                'Very tense game throughout.'
            ],
            aiEndgame: [
                'Time for the endgame.',
                'Trades are done, the battle continues.',
                'Queens are off, kings must step up.',
                'Equal trades, let us test our endgame technique.',
                'Entering a new phase of the match.',
                'The endgame begins now.',
                'Into the deepest part of the game.',
                'Fewer pieces, but not any easier.',
                'Endgames demand absolute precision.',
                'Every single move matters now.',
                'No room for mistakes anymore.',
                'Pawns and kings take center stage.',
                'One slip is all it takes.',
                'King activity will decide this.'
            ],
            idle: [
                'I am really enjoying this match.',
                'Chess is truly fascinating, isn\'t it?',
                'Every move tells a story.',
                'Wondering what you will play next.',
                'I appreciate creative ideas!',
                'This position is tightly knit.',
                'Do not make it too easy for me ^^',
                'The board is getting intriguing.',
                'Sometimes one move changes everything.',
                'Trying to guess your long-term plan.',
                'Tense yet fun atmosphere.',
                'I love games with surprises.',
                'Good defense is often harder than attack.',
                'You play with great calm ^^',
                'Every piece plays its own part.',
                'Calm before the storm.',
                'Waiting for the decisive spark.'
            ],
            offerDraw: [
                'This game is dead even, care for a draw?',
                'Hard to see a win for either side, draw?',
                'A tough grind, would you agree to a draw?',
                'I offer a draw, do you accept?',
                'This position looks drawn, want to shake hands?'
            ],
            openingEarly: [
                'Good to see you, hope for an exciting game!',
                'The opening moves are usually swift ^^',
                'Let us begin!',
                'Game on, good luck!',
                'Opening phase, let us see who settles in first.',
                'Good luck, have fun ^^',
                'I am ready, are you?',
                'Let us see who controls the center today.',
                'Careful with quick premoves ^^',
                'I will try not to blunder early.',
                'A relaxing match ahead.',
                'Curious to see your preferred setup.',
                'Let us see who castles first.',
                'Playing for fun is what matters most.',
                'Smooth development is key.',
                'Have a wonderful game!'
            ],
            openingMid: [
                'An interesting opening choice!',
                'Let us see your preparation.',
                'I appreciate classical setups.',
                'Hmm, a familiar variation.',
                'Let us see your plan unfold.',
                'Hope I remember the theory here.',
                'You like slow, maneuvering games?',
                'This looks like a long contest.',
                'Solid start for both of us.',
                'Opening phase complete, the real game begins.',
                'Tactical tensions are rising.',
                'Warm-up is over, time to focus.'
            ],
            resign: [
                'I resign, you outplayed me.',
                'I give up, congratulations!',
                'No way out of this position, I resign.'
            ],
            aiThinking: [
                'Bot is thinking...',
                'Calculating moves...',
                'Let me see...',
                'Evaluating options...',
                'Give me a moment to think...',
                'Considering deep variations...',
                'Just a second...',
                'Exploring candidate moves...',
                'You got me thinking deeply.'
            ],
            thinkLong: [
                'Take your time, I am calculating my next move too.',
                'No rush, I can wait.',
                'An important move, consider carefully.',
                'Grabbing some tea while I wait ^^',
                'No hurry, time is on our side.',
                'Take all the time you need.',
                'Your turn, take your time.',
                'Stuck? When in doubt, push a pawn ^^',
                'Don\'t keep me waiting too long ^^',
                'Your move, avoid past mistakes.',
                'I have spent a long time in this position before.',
                'A genuinely tricky position.',
                'Stay calm and calculate.',
                'Looking for a counter-punch?',
                'Tense game indeed.',
                'Careful with this choice.',
                'Deep calculation in progress, I see.',
                'Keep a cool head, decision time.'
            ],
            yourTurn: [
                'Your turn now.',
                'Your move.',
                'Over to you.',
                'Please make your move.',
                'Ball is in your court.',
                'A simple move, your response?',
                'That is my move, what is your plan?',
                'Over to you, no rush!',
                'The board is yours.',
                'Your turn, steady hands!',
                'Your move ^^',
                'Show me your best response.'
            ],
            youWin: [
                'Congratulations!',
                'You played wonderfully.',
                'You truly deserved to win this game.',
                'You capitalized on every chance.',
                'I will be sharper next time.'
            ],
            suggestResign: [
                'Tough position, care to start a fresh game?',
                'If it feels overwhelming, you can always resign.',
                'Looks difficult, a reset might be refreshing.',
                'Start a new game for a fresh start ^^',
                'No shame in resigning and trying again!',
                'Tense game, care to restart?',
                'Take a breather and start fresh!',
                'You gave it your best shot, ready for another?'
            ],
            playerBrilliant: [
                'Did not see that coming at all...',
                'Whoa! What a move!',
                'Fascinating!',
                'I had not considered that move.',
                'Brilliant! Completely unexpected.',
                'An outstanding move!',
                'Incredible! I must learn from this.',
                'Grandmaster level tactic right here!',
                'You truly know how to surprise.',
                'Brilliant play, hats off.',
                'Threw me off completely.',
                'Classy execution.',
                'What a sharp blow!',
                'Outstanding tactical vision.',
                'That move deserves a highlight reel!',
                'You just made me question my engine ^^',
                'I am genuinely intimidated now.'
            ],
            playerBlunderFirstMild: [
                'That might be a mistake.',
                'Did you slip up there?',
                'Seems like you missed a threat.',
                'Do not worry, slips happen.',
                'Are you sure about that move?',
                'A bit unfortunate.',
                'Pity, that gives me a chance.',
                'Are you sure? I see a better option.'
            ],
            playerBlunderFirstMajor: [
                'Here is my big chance!',
                'Blunder! That was a self-inflicted blow.',
                'Ouch, heavy loss... stay calm and fight on!',
                'That move looks dangerous for you.',
                'Pieces are flying away!',
                'Self-destruct sequence initiated ^^',
                'Wait, why play that?',
                'That move went sideways fast.'
            ],
            playerBlunderRepeatMild: [
                'Another slip-up 😅',
                'Careful now, watch your pieces.',
                'Are you sure you are focused?',
                'Your moves are getting predictable.',
                'Wait, is that free? I will take it ^^',
                'Did you misclick there?',
                'A bit comical, sorry ^^'
            ],
            playerBlunderRepeatMajor: [
                'Pieces dropping again 😬',
                'Are you sure you clicked the right square?',
                'That one belongs on a blunder reel.',
                'You just gave me some content ^^',
                'A dramatic plot twist!',
                'That move made my engine chuckle.'
            ],
            playerMissedMate: [
                'Lucky me, what a relief!',
                'Narrow escape! Here is my chance.',
                'I thought it was over... phew!',
                'You spared me there.',
                'Missing a mate-in-one — I won\'t miss mine!',
                'Close call! Did you not see that mate?',
                'Fortune smiled on me, thanks!'
            ],
            playerMissedWin: [
                'You just gifted me some hope.',
                'I thought you had a winning grip... but alas.',
                'My chances are back!',
                'You let that win slip, I will take it.',
                'Your advantage just vanished.',
                'I can breathe again, thank you!',
                'Are you sure that was the best move?'
            ],
            playerGreat: [
                'Great move!',
                'Hmm, I didn\'t spot that right away.',
                'Oh, quite sharp!',
                'You are putting serious pressure on me.',
                'Quite troublesome for me.',
                'Stronger than I anticipated.',
                'Nicely played!',
                'Impressive skill :)',
                'Sharp tactical play!',
                'Solid positional improvement.',
                'You are making this game very tough.',
                'A tiny slip on my end... and you pounced.',
                'You spotted that very quickly.',
                'High-level play indeed.',
                'Clean and crisp move.',
                'Respect for that move!',
                'Top tier play ^^',
                'Quality move right there.'
            ],
            playerGreatDef: [
                'Splendid defense! Did not see that coming.',
                'Outstanding defensive move!',
                'You really know how to hold the fort.',
                'Smart defense, I must learn from this.',
                'That defensive resource caught me off guard.'
            ],
            playerUnderPressure: [
                'Whoa, dangerous!',
                'You are pushing me into a tight corner.',
                'Check? Tense moment.',
                'Check! Pressure is on.',
                'I have to escape check first...',
                'My king is under siege.',
                'I need to tread very carefully.',
                'You are dialing up the pressure.',
                'Relentless checking!',
                'Are you launching an all-in attack?',
                'A full-on king hunt, I see.',
                'Another check? Have some mercy ^^',
                'Give my king a peaceful day!',
                'Fighting for my crown here.',
                'No more relaxed play from me now.'
            ]
        };

        var CHAT_TEXT = CHAT_TEXT_VI;

        function randChat(key, prob) {
            var lang = (typeof ChessI18n !== 'undefined' && ChessI18n.getLang) ? ChessI18n.getLang() : 'vi';
            var dict = (lang === 'en' && typeof CHAT_TEXT_EN !== 'undefined') ? CHAT_TEXT_EN : CHAT_TEXT_VI;
            var arr = (dict && dict[key]) ? dict[key] : (CHAT_TEXT_VI[key] || []);
            if (!arr || !arr.length) return '';
            var txt = arr[Math.floor(Math.random() * arr.length)];
            var _p = (prob !== undefined) ? prob : 1.0;
            /* [LOG] Ghi vào log lịch sử (tMark, gộp vào lượt hiện tại khi tFlush) —
               chỉ tên biến chat + tỷ lệ, không ghi nội dung câu chat. Độc lập với
               CHAT_DEBUG (cái đó chỉ nối vào bong bóng chat hiển thị cho người chơi,
               không vào log). */
            tMark('chat:' + key + '=' + Math.round(_p * 100) + '%');
            if (CHAT_DEBUG) {
                /* [DEBUG CHAT] Nhieu diem goi randChat(key) khong truyen prob vi ban
                   than diem goi do la nhanh VO DIEU KIEN (khi da vao toi day nghia la
                   chac chan 100% se chat, khong con roll Math.random() nao nua) — mac
                   dinh 1.0 (100%) cho cac truong hop nay de debug luon co con so, thay
                   vi thieu %. */
                txt += ' [' + key + Math.round(_p * 100) + '%]';
            }
            return txt;
        }

    root.AI_PERSONA_LIST = AI_PERSONA_LIST;
    root.CHAT_DISPLAY_TIME = CHAT_DISPLAY_TIME;
    root.CHAT_DEBUG = CHAT_DEBUG;
    root.CHAT_TIER_ALWAYS = CHAT_TIER_ALWAYS;
    root.CHAT_TIER_HIGH = CHAT_TIER_HIGH;
    root.CHAT_TIER_MED = CHAT_TIER_MED;
    root.CHAT_TIER_LOW = CHAT_TIER_LOW;
    root.CHAT_PROB_OPENING_EARLY = CHAT_PROB_OPENING_EARLY;
    root.CHAT_PROB_OPENING_MID = CHAT_PROB_OPENING_MID;
    root.CHAT_PROB_AI_EDGE = CHAT_PROB_AI_EDGE;
    root.CHAT_PROB_IDLE = CHAT_PROB_IDLE;
    root.CHAT_PROB_THINKING_GENERIC = CHAT_PROB_THINKING_GENERIC;
    root.CHAT_PROB_YOUR_TURN_GENERIC = CHAT_PROB_YOUR_TURN_GENERIC;
    root.CHAT_PROB_STREAK = CHAT_PROB_STREAK;
    root.CHAT_PROB_BOOK = CHAT_PROB_BOOK;
    root.CHAT_PROB_SWING = CHAT_PROB_SWING;
    root.CHAT_PROB_STYLE = CHAT_PROB_STYLE;
    root.CHAT_PROB_AI_BLUNDER = CHAT_PROB_AI_BLUNDER;
    root.CHAT_PROB_AI_ENDGAME = CHAT_PROB_AI_ENDGAME;
    root.CHAT_TEXT_VI = CHAT_TEXT_VI;
    root.CHAT_TEXT_EN = typeof CHAT_TEXT_EN !== "undefined" ? CHAT_TEXT_EN : undefined;
    root.CHAT_TEXT = CHAT_TEXT;
    root.randChat = randChat;

    root.ChessPersona = {
        list: AI_PERSONA_LIST,
        randChat: randChat,
        chatTextVi: CHAT_TEXT_VI,
        chatTextEn: typeof CHAT_TEXT_EN !== "undefined" ? CHAT_TEXT_EN : null
    };
})(typeof window !== "undefined" ? window : this);
