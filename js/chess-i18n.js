/**
 * ====================================================================
 * CHESS I18N — MULTI-LANGUAGE SYSTEM (ES5 COMPLIANT FOR KINDLE E-INK)
 * Supports Vietnamese (vi) and English (en) with zero external deps.
 * ====================================================================
 */

(function (root) {
    'use strict';

    var translations = {
        vi: {
            'header.logo': 'EinkChess',
            'header.bot_elo': 'ELO Đấu Máy: {elo}',
            'header.puzzle_elo': 'ELO Cờ Thế: {elo}',
            'header.elo': 'ELO: {elo}',
            'header.donate': 'Ủng hộ',
            'header.menu': 'Menu',
            'header.lang_btn': 'English',

            'home.bot_card_title': 'Chơi với Máy (Bot AI)',
            'home.bot_card_tag': 'Free &amp; Không giới hạn',
            'home.bot_card_desc': 'Tập luyện cờ vua với 3 cấp độ Bot Minimax offline (Người mới, Dễ, Câu lạc bộ). Tính điểm ELO sau mỗi ván đấu.',
            'home.bot_card_btn': 'Chơi với Bot AI',
            'home.bot_card_btn_resume': 'Tiếp tục ván đấu',
            'home.bot_card_btn_new': 'Ván mới',
            'home.saved_game_tag': 'Đang có ván dở (Cấp {lvl})',
            'home.puzzle_card_title': 'Giải Đố Cờ Thế (Puzzles)',
            'home.puzzle_card_tag': '500+ Puzzles',
            'home.puzzle_card_desc': 'Rèn luyện tư duy chiến thuật với kho câu đố phong phú từ Lichess. Tự động thích ứng theo điểm ELO.',
            'home.puzzle_card_btn': 'Bắt đầu Giải đố',
            'home.friend_card_title': 'Chơi với Bạn Bè (PvP)',
            'home.friend_card_tag': 'Online 1 vs 1',
            'home.friend_card_desc': 'Tạo phòng đấu hoặc tham gia qua mã Game Code 6 ký tự để so tài trực tiếp cùng bạn bè qua mạng.',
            'home.friend_card_btn': 'Đấu với Bạn bè',
            'home.mode_coming_soon': 'Chế độ này đang được hoàn thiện và sẽ sớm ra mắt trong bản cập nhật kế tiếp!',
            'home.setup_modal_title': 'CHỌN CẤU HÌNH VÁN CỜ',
            'home.setup_level_label': '1. Chọn Cấp độ Bot AI:',
            'home.level_1': 'Cấp 1 (~800)',
            'home.level_2': 'Cấp 2 (~1000)',
            'home.level_3': 'Cấp 3 (~1200)',
            'home.level_4': 'Cấp 4 (~1400)',
            'home.level_5': 'Cấp 5 (~1600)',
            'home.setup_side_label': '2. Chọn Bên cầm quân:',
            'home.side_white': 'Trắng (Đi trước)',
            'home.side_black': 'Đen (Đi sau)',
            'home.btn_launch': 'Vào Bàn Cờ',

            'game.bot_level_1': '(Bot Cấp 1 - ELO ~800)',
            'game.bot_level_2': '(Bot Cấp 2 - ELO ~1000)',
            'game.bot_level_3': '(Bot Cấp 3 - ELO ~1200)',
            'game.bot_level_4': '(Bot Cấp 4 - ELO ~1400)',
            'game.bot_level_5': '(Bot Cấp 5 - ELO ~1600)',
            'game.turn_white': 'Trắng',
            'game.turn_black': 'Đen',
            'game.player_you': 'Bạn',
            'game.player_bot': 'Bot',
            'game.status_turn': 'Lượt {turn} ({player})',
            'game.status_check': '[CHIẾU] Lượt {turn} ({player})',
            'game.status_thinking': 'Bot đang tính toán...',
            'game.btn_undo': 'Đi lại',
            'game.btn_resign': 'Đầu hàng',
            'game.btn_flip': 'Xoay bàn',
            'game.btn_hints_on': 'Gợi ý: Bật',
            'game.btn_hints_off': 'Gợi ý: Tắt',
            'game.btn_new_game': 'Ván mới',
            'game.btn_home': 'Trang chủ',

            'game.setup_title': 'CÀI ĐẶT VÁN ĐẤU VỚI BOT',
            'game.btn_start_game': 'Bắt đầu Ván cờ',

            'game.promotion_title': 'CHỌN QUÂN PHONG CẤP',
            'game.promotion_queen': 'Hậu',
            'game.promotion_rook': 'Xe',
            'game.promotion_bishop': 'Tượng',
            'game.promotion_knight': 'Mã',

            'game.resign_title': 'Xác nhận đầu hàng',
            'game.resign_body': 'Bạn có chắc chắn muốn nhận thua ván cờ này không?<br>Điểm ELO của bạn sẽ bị trừ theo kết quả thua cuộc.',
            'game.btn_cancel': 'Hủy',
            'game.btn_confirm_resign': 'Đồng ý đầu hàng',
            'game.resigned_title': 'BẠN ĐÃ ĐẦU HÀNG',
            'game.resigned_msg': 'Bạn đã chấp nhận đầu hàng trước Bot.<br>',

            'game.gameover_title': 'Kết thúc ván đấu',
            'game.win_checkmate_title': 'BẠN ĐÃ CHIẾU HẾT (THẮNG)',
            'game.win_checkmate_msg': 'Chúc mừng bạn đã giành chiến thắng trước Bot!<br>',
            'game.loss_checkmate_title': 'BẠN ĐÃ BỊ CHIẾU HẾT (THUA)',
            'game.loss_checkmate_msg': 'Bot đã giành chiến thắng.<br>',
            'game.draw_stalemate_title': 'HÒA CỜ (HẾT NƯỚC ĐI - STALEMATE)',
            'game.draw_stalemate_msg': 'Ván cờ kết thúc với kết quả Hòa cờ (Stalemate).<br>',
            'game.draw_threefold_title': 'HÒA CỜ (LẶP LẠI 3 LẦN)',
            'game.draw_threefold_msg': 'Ván cờ lặp lại thế cờ 3 lần &rarr; Hòa cờ.<br>',
            'game.draw_50_title': 'HÒA CỜ (LUẬT 50 NƯỚC)',
            'game.draw_50_msg': 'Không có tốt di chuyển và không bắt quân sau 50 nước &rarr; Hòa cờ.<br>',
            'game.draw_material_title': 'HÒA CỜ (KHÔNG ĐỦ LỰC LƯỢNG)',
            'game.draw_material_msg': 'Hai bên không đủ lực lượng để chiếu hết &rarr; Hòa cờ.<br>',
            'game.elo_update_label': 'Điểm ELO cập nhật:',

            'donate.title': 'Ủng hộ tác giả EinkChess',
            'donate.body': 'EinkChess là dự án phi lợi nhuận tối ưu cho cộng đồng người dùng Kindle.<br><br>Bạn có thể dùng điện thoại <strong>quét mã QR bên dưới</strong> để mời tác giả một tách cà phê trên Ko-fi:',
            'donate.note': 'Sự ủng hộ của bạn giúp duy trì server và phát triển thêm nhiều tính năng mới!',
            'donate.btn_close': 'Đóng'
        },
        en: {
            'header.logo': 'EinkChess',
            'header.bot_elo': 'Bot ELO: {elo}',
            'header.puzzle_elo': 'Puzzle ELO: {elo}',
            'header.elo': 'ELO: {elo}',
            'header.donate': 'Support',
            'header.menu': 'Menu',
            'header.lang_btn': 'Tiếng Việt',

            'home.bot_card_title': 'Play vs Bot (AI)',
            'home.bot_card_tag': 'Free &amp; Unlimited',
            'home.bot_card_desc': 'Practice chess against 3 offline Minimax Bot levels (Beginner, Casual, Club). Track ELO rating after each match.',
            'home.bot_card_btn': 'Play vs AI Bot',
            'home.bot_card_btn_resume': 'Continue Match',
            'home.bot_card_btn_new': 'New Game',
            'home.saved_game_tag': 'In Progress (Lvl {lvl})',
            'home.puzzle_card_title': 'Chess Puzzles',
            'home.puzzle_card_tag': '500+ Puzzles',
            'home.puzzle_card_desc': 'Sharpen tactical skills with rich puzzles from Lichess. Automatically adapt to your Puzzle ELO rating.',
            'home.puzzle_card_btn': 'Start Puzzles',
            'home.friend_card_title': 'Play a Friend (PvP)',
            'home.friend_card_tag': 'Online 1 vs 1',
            'home.friend_card_desc': 'Create a game room or join with a 6-character code to play live chess matches with your friends.',
            'home.friend_card_btn': 'Play a Friend',
            'home.mode_coming_soon': 'This mode is currently under development and coming soon in the next update!',
            'home.setup_modal_title': 'GAME CONFIGURATION',
            'home.setup_level_label': '1. Select AI Bot Level:',
            'home.level_1': 'Level 1 (~800)',
            'home.level_2': 'Level 2 (~1000)',
            'home.level_3': 'Level 3 (~1200)',
            'home.level_4': 'Level 4 (~1400)',
            'home.level_5': 'Level 5 (~1600)',
            'home.setup_side_label': '2. Select Your Side:',
            'home.side_white': 'White (First)',
            'home.side_black': 'Black (Second)',
            'home.btn_launch': 'Enter Board',

            'game.bot_level_1': '(Bot Level 1 - ELO ~800)',
            'game.bot_level_2': '(Bot Level 2 - ELO ~1000)',
            'game.bot_level_3': '(Bot Level 3 - ELO ~1200)',
            'game.bot_level_4': '(Bot Level 4 - ELO ~1400)',
            'game.bot_level_5': '(Bot Level 5 - ELO ~1600)',
            'game.turn_white': 'White',
            'game.turn_black': 'Black',
            'game.player_you': 'You',
            'game.player_bot': 'Bot',
            'game.status_turn': "{turn}'s turn ({player})",
            'game.status_check': '[CHECK] {turn} to move ({player})',
            'game.status_thinking': 'Bot is thinking...',
            'game.btn_undo': 'Undo',
            'game.btn_resign': 'Resign',
            'game.btn_flip': 'Flip',
            'game.btn_hints_on': 'Hints: ON',
            'game.btn_hints_off': 'Hints: OFF',
            'game.btn_new_game': 'New Game',
            'game.btn_home': 'Home',

            'game.setup_title': 'BOT MATCH SETUP',
            'game.btn_start_game': 'Start Match',

            'game.promotion_title': 'PAWN PROMOTION',
            'game.promotion_queen': 'Queen',
            'game.promotion_rook': 'Rook',
            'game.promotion_bishop': 'Bishop',
            'game.promotion_knight': 'Knight',

            'game.resign_title': 'Confirm Resignation',
            'game.resign_body': 'Are you sure you want to resign this game?<br>Your ELO rating will be reduced for a loss.',
            'game.btn_cancel': 'Cancel',
            'game.btn_confirm_resign': 'Yes, Resign',
            'game.resigned_title': 'YOU RESIGNED',
            'game.resigned_msg': 'You surrendered the game to the Bot.<br>',

            'game.gameover_title': 'Game Over',
            'game.win_checkmate_title': 'CHECKMATE - YOU WON!',
            'game.win_checkmate_msg': 'Congratulations! You defeated the Bot.<br>',
            'game.loss_checkmate_title': 'CHECKMATE - YOU LOST',
            'game.loss_checkmate_msg': 'The Bot has won the match.<br>',
            'game.draw_stalemate_title': 'DRAW (STALEMATE)',
            'game.draw_stalemate_msg': 'The game ended in a draw by stalemate.<br>',
            'game.draw_threefold_title': 'DRAW (THREEFOLD REPETITION)',
            'game.draw_threefold_msg': 'Position repeated 3 times &rarr; Draw.<br>',
            'game.draw_50_title': 'DRAW (50-MOVE RULE)',
            'game.draw_50_msg': 'No pawn move or capture in 50 moves &rarr; Draw.<br>',
            'game.draw_material_title': 'DRAW (INSUFFICIENT MATERIAL)',
            'game.draw_material_msg': 'Insufficient material to checkmate &rarr; Draw.<br>',
            'game.elo_update_label': 'Updated ELO Rating:',

            'donate.title': 'Support EinkChess',
            'donate.body': 'EinkChess is a non-profit chess app optimized for Kindle e-readers.<br><br>You can scan the <strong>QR code below</strong> with your phone to buy me a coffee on Ko-fi:',
            'donate.note': 'Your support helps maintain servers and build more features!',
            'donate.btn_close': 'Close'
        }
    };

    var currentLang = 'en';
    var listeners = [];

    var ChessI18n = {
        init: function () {
            var saved = null;
            if (typeof root.ChessStorage !== 'undefined') {
                saved = root.ChessStorage.getLang();
            }

            if (saved && (saved === 'vi' || saved === 'en')) {
                currentLang = saved;
            } else {
                currentLang = 'en';
                if (typeof root.ChessStorage !== 'undefined') {
                    root.ChessStorage.setLang(currentLang);
                }
            }

            if (typeof document !== 'undefined' && document.documentElement) {
                document.documentElement.lang = currentLang;
            }

            this.applyTranslations();
            return currentLang;
        },

        getLang: function () {
            return currentLang;
        },

        setLang: function (lang) {
            if (lang !== 'vi' && lang !== 'en') return;
            currentLang = lang;
            if (typeof root.ChessStorage !== 'undefined') {
                root.ChessStorage.setLang(lang);
            }
            if (typeof document !== 'undefined' && document.documentElement) {
                document.documentElement.lang = lang;
            }
            this.applyTranslations();
            this.notifyListeners();
        },

        toggleLang: function () {
            var nextLang = currentLang === 'vi' ? 'en' : 'vi';
            this.setLang(nextLang);
            return nextLang;
        },

        t: function (key, params) {
            var dict = translations[currentLang] || translations.en || translations.vi;
            var text = dict[key];
            if (typeof text === 'undefined') {
                text = (translations.en && translations.en[key]) || (translations.vi && translations.vi[key]) || key;
            }

            if (params && typeof params === 'object') {
                for (var prop in params) {
                    if (params.hasOwnProperty(prop)) {
                        text = text.replace(new RegExp('\\{' + prop + '\\}', 'g'), params[prop]);
                    }
                }
            }
            return text;
        },

        applyTranslations: function (rootEl) {
            if (typeof document === 'undefined') return;
            var container = rootEl || document;

            // Translate innerHTML/textContent elements
            var elements = container.querySelectorAll('[data-i18n]');
            for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                var key = el.getAttribute('data-i18n');
                if (key) {
                    el.innerHTML = this.t(key);
                }
            }

            // Translate placeholder attributes
            var pElements = container.querySelectorAll('[data-i18n-placeholder]');
            for (var j = 0; j < pElements.length; j++) {
                var pEl = pElements[j];
                var pKey = pEl.getAttribute('data-i18n-placeholder');
                if (pKey) {
                    pEl.setAttribute('placeholder', this.t(pKey));
                }
            }

            // Update language switcher buttons if any
            var langBtns = container.querySelectorAll('.btn-lang-toggle');
            for (var k = 0; k < langBtns.length; k++) {
                var btn = langBtns[k];
                btn.innerHTML = currentLang === 'vi' ? 'EN' : 'VI';
                btn.setAttribute('title', currentLang === 'vi' ? 'Switch to English' : 'Đổi sang Tiếng Việt');
            }
        },

        onChange: function (fn) {
            if (typeof fn === 'function') {
                listeners.push(fn);
            }
        },

        notifyListeners: function () {
            for (var i = 0; i < listeners.length; i++) {
                try {
                    listeners[i](currentLang);
                } catch (e) { }
            }
        }
    };

    root.ChessI18n = ChessI18n;

})(typeof window !== 'undefined' ? window : this);
