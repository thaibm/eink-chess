/**
 * ====================================================================
 * CHESS STORAGE (LOCALSTORAGE & ELO MANAGER — ES5 COMPLIANT)
 * Manages device UUID, ratings, auto-save state, local quotas
 * ====================================================================
 */

(function(root) {
    'use strict';

    var STORAGE_KEYS = {
        PID: 'einkchess_pid',
        DEVICE: 'einkchess_device',
        LANG: 'einkchess_lang',
        BOT_ELO: 'einkchess_bot_elo',
        PUZZLE_ELO: 'einkchess_puzzle_elo',
        PUZZLE_STREAK: 'einkchess_puzzle_streak',
        PUZZLE_MAX_STREAK: 'einkchess_puzzle_max_streak',
        PUZZLE_SETUP_DONE: 'einkchess_puzzle_setup_done',
        PUZZLE_MAX_UNLOCKED_LEVEL: 'einkchess_puzzle_max_unlocked_lvl',
        PUZZLE_JOURNEY_MIGRATED: 'einkchess_puzzle_journey_migrated_v1',
        PLAYED_PUZZLES: 'einkchess_played_puzzles',
        SAVED_BOT_GAME: 'einkchess_saved_bot_game',
        SAVED_PUZZLE: 'einkchess_saved_puzzle',
        QUOTA: 'einkchess_quota',
        DEFAULT_BOT_LEVEL: 'einkchess_default_bot_lvl',
        DEFAULT_BOT_LEVEL_V2: 'einkchess_default_bot_lvl_v2',
        DEFAULT_SIDE: 'einkchess_default_side',
        DEFAULT_BOT_REVIEW: 'einkchess_default_bot_review',
        ALLOW_UNDO: 'einkchess_allow_undo',
        SAVED_BOT_GAME_V2: 'einkchess_saved_bot_game_v2',
        ANALYSIS_GAME: 'einkchess_analysis_game'
    };

    function generateUUID() {
        var d = new Date().getTime();
        var d2 = (typeof performance !== 'undefined' && performance.now && (performance.now() * 1000)) || 0;
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;
            if (d > 0) {
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    var ChessStorage = {

        // Safe LocalStorage Get/Set
        get: function(key, defaultVal) {
            try {
                var item = localStorage.getItem(key);
                return item !== null ? JSON.parse(item) : defaultVal;
            } catch (e) {
                return defaultVal;
            }
        },

        set: function(key, val) {
            try {
                localStorage.setItem(key, JSON.stringify(val));
                return true;
            } catch (e) {
                return false;
            }
        },

        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                return false;
            }
        },

        // --- Device Identification & Auto Layout ---
        getDeviceId: function() {
            var pid = this.get(STORAGE_KEYS.PID, null);
            if (!pid) {
                pid = generateUUID();
                this.set(STORAGE_KEYS.PID, pid);
            }
            return pid;
        },

        getDeviceType: function() {
            return this.get(STORAGE_KEYS.DEVICE, 'kindle');
        },

        applyAutoLayout: function() {
            if (typeof window === 'undefined' || typeof document === 'undefined') return;
            
            var winW = window.innerWidth || document.documentElement.clientWidth || 600;
            var winH = window.innerHeight || document.documentElement.clientHeight || 800;

            var isGameScreen = !!document.querySelector('.board-container');
            var container = document.querySelector('.app-container');

            if (!isGameScreen) {
                if (container) {
                    container.style.maxWidth = '560px';
                    container.style.width = '100%';
                }
                return;
            }

            var header = document.querySelector('.header');
            var statusBar = document.querySelector('.status-bar');
            var actionBar = document.querySelector('.action-bar');

            var headerH = header ? header.offsetHeight : 0;
            var statusH = statusBar ? statusBar.offsetHeight : 0;
            var actionH = actionBar ? actionBar.offsetHeight : 0;

            // Calculate safe padding/margin offset to avoid scrollbars (~20px)
            var totalOffsets = 20;

            var availableH = winH - headerH - statusH - actionH - totalOffsets;
            var availableW = winW - 12; // 6px padding on both sides of container

            var maxBoardSize = Math.min(availableW, availableH);

            if (container) {
                container.style.maxWidth = (maxBoardSize + 12) + 'px';
                container.style.width = '100%';
            }
            
            var boardContainer = document.querySelector('.board-container');
            if (boardContainer) {
                boardContainer.style.width = maxBoardSize + 'px';
                boardContainer.style.height = maxBoardSize + 'px';
                boardContainer.style.maxWidth = maxBoardSize + 'px';
            }
            
            // Update piece font-size (proportional 75% of square size)
            var pieceSize = Math.floor((maxBoardSize / 8) * 0.75);
            var styleId = 'dynamic-piece-style';
            var styleEl = document.getElementById(styleId);
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
            }
            styleEl.innerHTML = '.piece { font-size: ' + pieceSize + 'px !important; line-height: 1 !important; }';
        },

        getLang: function() {
            return this.get(STORAGE_KEYS.LANG, 'en');
        },

        setLang: function(lang) {
            return this.set(STORAGE_KEYS.LANG, lang);
        },

        // --- ELO Management ---
        getBotElo: function() {
            return parseInt(this.get(STORAGE_KEYS.BOT_ELO, 1200), 10);
        },

        setBotElo: function(elo) {
            return this.set(STORAGE_KEYS.BOT_ELO, Math.max(100, Math.round(elo)));
        },

        getPuzzleElo: function() {
            return parseInt(this.get(STORAGE_KEYS.PUZZLE_ELO, 400), 10);
        },

        setPuzzleElo: function(elo) {
            return this.set(STORAGE_KEYS.PUZZLE_ELO, Math.max(100, Math.round(elo)));
        },

        hasChosenPuzzleSkill: function() {
            return !!this.get(STORAGE_KEYS.PUZZLE_SETUP_DONE, false);
        },

        setPuzzleSkillChosen: function(val) {
            return this.set(STORAGE_KEYS.PUZZLE_SETUP_DONE, val !== false);
        },

        getPuzzleStreak: function() {
            return parseInt(this.get(STORAGE_KEYS.PUZZLE_STREAK, 0), 10);
        },

        setPuzzleStreak: function(streak) {
            var s = Math.max(0, parseInt(streak, 10) || 0);
            this.set(STORAGE_KEYS.PUZZLE_STREAK, s);
            var maxS = this.getMaxPuzzleStreak();
            if (s > maxS) {
                this.setMaxPuzzleStreak(s);
            }
            return s;
        },

        getMaxPuzzleStreak: function() {
            return parseInt(this.get(STORAGE_KEYS.PUZZLE_MAX_STREAK, 0), 10);
        },

        setMaxPuzzleStreak: function(maxStreak) {
            var validMax = Math.max(0, parseInt(maxStreak, 10) || 0);
            return this.set(STORAGE_KEYS.PUZZLE_MAX_STREAK, validMax);
        },

        getMaxUnlockedPuzzleLevel: function() {
            this.checkAndMigratePuzzleJourney();
            return Math.max(1, Math.min(8, parseInt(this.get(STORAGE_KEYS.PUZZLE_MAX_UNLOCKED_LEVEL, 1), 10)));
        },

        setMaxUnlockedPuzzleLevel: function(lvl) {
            var validLvl = Math.max(1, Math.min(8, parseInt(lvl, 10) || 1));
            return this.set(STORAGE_KEYS.PUZZLE_MAX_UNLOCKED_LEVEL, validLvl);
        },

        checkAndMigratePuzzleJourney: function() {
            var migrated = this.get(STORAGE_KEYS.PUZZLE_JOURNEY_MIGRATED, false);
            if (!migrated) {
                this.set(STORAGE_KEYS.PUZZLE_ELO, 400);
                this.set(STORAGE_KEYS.PUZZLE_STREAK, 0);
                this.set(STORAGE_KEYS.PUZZLE_MAX_UNLOCKED_LEVEL, 1);
                this.set(STORAGE_KEYS.PUZZLE_SETUP_DONE, false);
                this.remove(STORAGE_KEYS.SAVED_PUZZLE);
                this.set(STORAGE_KEYS.PUZZLE_JOURNEY_MIGRATED, true);
            }
        },

        getPlayedPuzzles: function() {
            return this.get(STORAGE_KEYS.PLAYED_PUZZLES, []);
        },

        /**
         * Returns played puzzles as a hash object for O(1) lookup.
         * Used by chess-puzzles.js to efficiently filter out played puzzles.
         */
        getPlayedPuzzlesHash: function() {
            var played = this.getPlayedPuzzles();
            var hash = {};
            for (var i = 0; i < played.length; i++) {
                hash[played[i]] = true;
            }
            return hash;
        },

        addPlayedPuzzle: function(puzzleId) {
            var played = this.getPlayedPuzzles();
            if (played.indexOf(puzzleId) === -1) {
                played.push(puzzleId);
                // Limit stored IDs to the latest 5000 (increased from 1000 for larger puzzle sets)
                if (played.length > 5000) {
                    played.shift();
                }
                this.set(STORAGE_KEYS.PLAYED_PUZZLES, played);
            }
        },

        clearPlayedPuzzles: function() {
            return this.remove(STORAGE_KEYS.PLAYED_PUZZLES);
        },

        // Calculate ELO update
        calculateEloDelta: function(playerElo, opponentElo, score, kFactor) {
            kFactor = kFactor || 32;
            var expected = 1.0 / (1.0 + Math.pow(10, (opponentElo - playerElo) / 400.0));
            var delta = Math.round(kFactor * (score - expected));
            return delta;
        },

        updateBotElo: function(opponentElo, score) {
            var current = this.getBotElo();
            var delta = this.calculateEloDelta(current, opponentElo, score, 32);
            var newElo = Math.max(100, current + delta);
            this.setBotElo(newElo);
            return { oldElo: current, newElo: newElo, delta: delta };
        },

        // --- Auto-Save Game State ---
        saveBotGame: function(gameState) {
            return this.set(STORAGE_KEYS.SAVED_BOT_GAME, gameState);
        },

        getSavedBotGame: function() {
            return this.get(STORAGE_KEYS.SAVED_BOT_GAME, null);
        },

        clearSavedBotGame: function() {
            return this.remove(STORAGE_KEYS.SAVED_BOT_GAME);
        },

        saveBotGameV2: function(gameState) {
            return this.set(STORAGE_KEYS.SAVED_BOT_GAME_V2, gameState);
        },

        getSavedBotGameV2: function() {
            return this.get(STORAGE_KEYS.SAVED_BOT_GAME_V2, null);
        },

        clearSavedBotGameV2: function() {
            return this.remove(STORAGE_KEYS.SAVED_BOT_GAME_V2);
        },

        // --- Post-Game Analysis State ---
        saveAnalysisGame: function(analysisData) {
            return this.set(STORAGE_KEYS.ANALYSIS_GAME, analysisData);
        },

        getAnalysisGame: function() {
            return this.get(STORAGE_KEYS.ANALYSIS_GAME, null);
        },

        clearAnalysisGame: function() {
            return this.remove(STORAGE_KEYS.ANALYSIS_GAME);
        },

        // --- Auto-Save Puzzle State ---
        savePuzzle: function(puzzleState) {
            return this.set(STORAGE_KEYS.SAVED_PUZZLE, puzzleState);
        },

        getSavedPuzzle: function() {
            return this.get(STORAGE_KEYS.SAVED_PUZZLE, null);
        },

        clearSavedPuzzle: function() {
            return this.remove(STORAGE_KEYS.SAVED_PUZZLE);
        },

        // --- Default Bot Match Config ---
        getDefaultBotLevel: function() { return this.get(STORAGE_KEYS.DEFAULT_BOT_LEVEL, 1); },
        setDefaultBotLevel: function(lvl) { this.set(STORAGE_KEYS.DEFAULT_BOT_LEVEL, lvl); },
        
        getDefaultBotLevelV2: function() { return this.get(STORAGE_KEYS.DEFAULT_BOT_LEVEL_V2, 1); },
        setDefaultBotLevelV2: function(lvl) { this.set(STORAGE_KEYS.DEFAULT_BOT_LEVEL_V2, parseInt(lvl, 10)); },

        getDefaultSide: function() {
            return this.get(STORAGE_KEYS.DEFAULT_SIDE, 'w');
        },

        setDefaultSide: function(side) {
            return this.set(STORAGE_KEYS.DEFAULT_SIDE, side);
        },

        getDefaultBotReview: function() {
            return this.get(STORAGE_KEYS.DEFAULT_BOT_REVIEW, false);
        },

        setDefaultBotReview: function(enabled) {
            return this.set(STORAGE_KEYS.DEFAULT_BOT_REVIEW, !!enabled);
        },

        // --- Allow Undo Setting (for Bot v1 & v2) ---
        getAllowUndo: function() {
            return this.get(STORAGE_KEYS.ALLOW_UNDO, false);
        },

        setAllowUndo: function(allow) {
            return this.set(STORAGE_KEYS.ALLOW_UNDO, !!allow);
        },

        // --- Local Quota Management ---
        getTodayString: function() {
            var d = new Date();
            var month = ('0' + (d.getMonth() + 1)).slice(-2);
            var day = ('0' + d.getDate()).slice(-2);
            return d.getFullYear() + '-' + month + '-' + day;
        },

        getQuota: function() {
            var today = this.getTodayString();
            var quota = this.get(STORAGE_KEYS.QUOTA, null);
            if (!quota || quota.date !== today) {
                quota = {
                    date: today,
                    bot_cloud: 0,
                    puzzle: 0,
                    pvp: 0
                };
                this.set(STORAGE_KEYS.QUOTA, quota);
            }
            return quota;
        },

        consumeQuota: function(type) {
            var quota = this.getQuota();
            if (type === 'bot_cloud') quota.bot_cloud = (quota.bot_cloud || 0) + 1;
            else if (type === 'puzzle') quota.puzzle = (quota.puzzle || 0) + 1;
            else if (type === 'pvp') quota.pvp = (quota.pvp || 0) + 1;
            this.set(STORAGE_KEYS.QUOTA, quota);
            return quota;
        }
    };

    root.ChessStorage = ChessStorage;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ChessStorage;
    }

    // Automatically attach resize/orientationchange events to recalculate layout
    if (typeof window !== 'undefined') {
        var layoutTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(layoutTimeout);
            layoutTimeout = setTimeout(function() {
                ChessStorage.applyAutoLayout();
            }, 100);
        });
        window.addEventListener('orientationchange', function() {
            setTimeout(function() {
                ChessStorage.applyAutoLayout();
            }, 200);
        });
    }

})(typeof window !== 'undefined' ? window : this);
