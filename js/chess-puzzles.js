/**
 * ====================================================================
 * CHESS PUZZLES MANAGER (ES5 COMPLIANT FOR KINDLE)
 * Handles downloading puzzles, tracking ELO, validating user moves.
 * Uses folder-based puzzle architecture with manifest.js.
 * Implements proportional ELO gain/loss system.
 * ====================================================================
 */

(function(root) {
    'use strict';

    function getStorage() {
        if (typeof ChessStorage !== 'undefined') return ChessStorage;
        if (root && root.ChessStorage) return root.ChessStorage;
        if (typeof window !== 'undefined' && window.ChessStorage) return window.ChessStorage;
        if (typeof global !== 'undefined' && global.ChessStorage) return global.ChessStorage;
        return null;
    }

    function getI18n() {
        if (typeof ChessI18n !== 'undefined') return ChessI18n;
        if (root && root.ChessI18n) return root.ChessI18n;
        if (typeof window !== 'undefined' && window.ChessI18n) return window.ChessI18n;
        if (typeof global !== 'undefined' && global.ChessI18n) return global.ChessI18n;
        return null;
    }

    function getBackend() {
        if (typeof ChessBackend !== 'undefined') return ChessBackend;
        if (root && root.ChessBackend) return root.ChessBackend;
        if (typeof window !== 'undefined' && window.ChessBackend) return window.ChessBackend;
        if (typeof global !== 'undefined' && global.ChessBackend) return global.ChessBackend;
        return null;
    }

    var PuzzleManager = {
        engine: null,
        board: null,
        
        currentPuzzle: null,
        solutionMoves: [], // array of UCI strings ['e2e4', 'e7e5']
        currentMoveIndex: 0,
        
        isPlayerTurn: false,
        puzzleColor: 'w', // color the player plays
        hasFailed: false,  // set true on first wrong move (proportional ELO)
        isSolved: false,   // set true when puzzle is completed

        // ELO bucket range
        MIN_BUCKET: 400,
        MAX_BUCKET: 2800,
        selectedInitialElo: 400,

        init: function() {
            var self = this;
            var i18n = getI18n();
            if (i18n) {
                i18n.init();
                i18n.onChange(function() {
                    self.updateHeaderUI();
                    self.updateTurnStatus();
                });
            }

            var storage = getStorage();
            if (storage && storage.applyAutoLayout) {
                storage.applyAutoLayout();
            }

            this.engine = new ChessEngine();
            this.board = new ChessBoard('board-container', {
                engine: this.engine,
                orientation: 'w',
                onMove: function(move) {
                    self.handlePlayerMove(move);
                }
            });

            this.updateHeaderUI();
            this.updateActionBarUI();

            // Send telemetry ping
            var backend = getBackend();
            if (backend && backend.sendPing) {
                backend.sendPing('play_puzzle', '/puzzles.html');
            }

            if (storage && !storage.hasChosenPuzzleSkill()) {
                this.selectedInitialElo = 400;
                this.openSkillModal();
            } else {
                this.loadPuzzle();
            }
        },

        openSkillModal: function() {
            if (typeof document === 'undefined') return;
            var storage = getStorage();
            var curElo = storage ? storage.getPuzzleElo() : 400;
            this.selectSkillLevel(curElo || 400);
            var modal = document.getElementById('skill-modal');
            if (modal) {
                modal.className = 'modal-overlay active';
                modal.style.display = 'block';
            }
        },

        closeSkillModal: function() {
            if (typeof document === 'undefined') return;
            var modal = document.getElementById('skill-modal');
            if (modal) {
                modal.className = 'modal-overlay';
                modal.style.display = 'none';
            }
        },

        selectSkillLevel: function(elo) {
            this.selectedInitialElo = parseInt(elo, 10) || 400;
            if (typeof document === 'undefined') return;
            var btns = document.querySelectorAll('.puzzle-skill-btn');
            for (var i = 0; i < btns.length; i++) {
                var btnElo = parseInt(btns[i].getAttribute('data-elo'), 10);
                if (btnElo === this.selectedInitialElo) {
                    btns[i].className = 'puzzle-skill-btn active';
                } else {
                    btns[i].className = 'puzzle-skill-btn';
                }
            }
        },

        confirmSkillLevel: function() {
            var elo = this.selectedInitialElo || 400;
            var storage = getStorage();
            if (storage) {
                storage.setPuzzleElo(elo);
                storage.setPuzzleSkillChosen(true);
            }
            this.closeSkillModal();
            this.updateHeaderUI();
            this.loadPuzzle();
        },

        updateActionBarUI: function() {
            if (typeof document === 'undefined') return;
            var skipBtn = document.getElementById('btn-skip');
            var nextBtn = document.getElementById('btn-next');
            var hintBtn = document.getElementById('btn-hint');

            if (this.isSolved) {
                if (skipBtn) skipBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = '';
                if (hintBtn) hintBtn.style.display = 'none';
            } else {
                if (skipBtn) skipBtn.style.display = '';
                if (nextBtn) nextBtn.style.display = 'none';
                if (hintBtn) hintBtn.style.display = '';
            }
        },

        updateHeaderUI: function() {
            if (typeof document === 'undefined') return;
            var storage = getStorage();
            var elo = storage ? storage.getPuzzleElo() : 400;
            var streak = storage ? storage.getPuzzleStreak() : 0;
            var eloBadge = document.getElementById('puzzle-elo-badge');
            var streakBadge = document.getElementById('puzzle-streak-name');
            var metaBadge = document.getElementById('puzzle-meta');
            var i18n = getI18n();
            if (eloBadge) eloBadge.innerText = 'ELO: ' + elo;
            if (streakBadge) {
                var txt = i18n ? i18n.t('puzzle.streak', { streak: streak }) : ('Streak: ' + streak);
                streakBadge.innerText = txt;
            }
            if (metaBadge) {
                if (this.currentPuzzle) {
                    var pId = this.currentPuzzle.PuzzleId || '';
                    var pElo = this.currentPuzzle.Rating || 0;
                    var metaTxt = i18n ? i18n.t('puzzle.meta_info', { id: pId, elo: pElo }) : ('#' + pId + ' · ' + pElo + ' ELO');
                    metaBadge.innerText = metaTxt;
                } else {
                    metaBadge.innerText = '-';
                }
            }
        },

        setStatus: function(msgKey, params) {
            if (typeof document === 'undefined') return;
            var statusEl = document.getElementById('status-text');
            if (statusEl) {
                var i18n = getI18n();
                var text = i18n ? i18n.t(msgKey, params) : msgKey;
                statusEl.innerText = text;
            }
        },

        updateTurnStatus: function() {
            if (this.isSolved) return;
            if (!this.isPlayerTurn && this.currentMoveIndex < this.solutionMoves.length) {
                this.setStatus('puzzle.bot_moving');
                return;
            }
            if (this.puzzleColor === 'b') {
                this.setStatus('puzzle.turn_black');
            } else {
                this.setStatus('puzzle.turn_white');
            }
        },

        updateCapturedPieces: function() {
            if (typeof document === 'undefined') return;
            var capWhiteEl = document.getElementById('captured-white');
            var capBlackEl = document.getElementById('captured-black');
            if (capWhiteEl && capBlackEl && this.engine) {
                var caps = this.engine.getCapturedPieces();
                var wHtml = '';
                for (var i = 0; i < caps.white.length; i++) {
                    wHtml += this.engine.getGlyph(caps.white[i]);
                }
                capWhiteEl.innerHTML = wHtml;

                var bHtml = '';
                for (var j = 0; j < caps.black.length; j++) {
                    bHtml += this.engine.getGlyph(caps.black[j]);
                }
                capBlackEl.innerHTML = bHtml;
            }
        },

        /**
         * Calculate the expected score (E) for ELO formula.
         * E = 1 / (1 + 10^((puzzleRating - playerELO) / 400))
         */
        calculateExpected: function(playerElo, puzzleRating) {
            return 1.0 / (1.0 + Math.pow(10, (puzzleRating - playerElo) / 400.0));
        },

        /**
         * Apply proportional ELO change.
         * @param {boolean} solved - true if player solved correctly (clean, no hint)
         * @param {boolean} failed - true if player had a wrong move or skipped/gave up
         * @returns {{ oldElo: number, newElo: number, delta: number }}
         */
        applyEloChange: function(solved, failed) {
            var K = 32;
            var storage = getStorage();
            var elo = storage ? storage.getPuzzleElo() : 400;
            var pElo = (this.currentPuzzle && this.currentPuzzle.Rating) ? parseInt(this.currentPuzzle.Rating, 10) : elo;
            var expected = this.calculateExpected(elo, pElo);
            var delta = 0;

            if (solved && !failed) {
                // Clean solve: +ELO proportional, min +3
                delta = Math.round(K * (1 - expected));
                if (delta < 3) delta = 3;
            } else if (failed) {
                // Failed or skipped: -ELO proportional
                delta = -Math.round(K * expected);
                if (delta >= 0) delta = -1; // Guarantee at least -1 loss on fail/skip
                if (delta < -32) delta = -32;
            }
            // hint used: delta stays 0

            var newElo = Math.max(100, elo + delta);
            if (storage) {
                storage.setPuzzleElo(newElo);
            }
            return { oldElo: elo, newElo: newElo, delta: delta };
        },

        /**
         * Save current puzzle state to localStorage for persistence across reloads.
         */
        saveCurrentPuzzleState: function() {
            var storage = getStorage();
            if (!storage || !this.currentPuzzle || this.isSolved) return;
            storage.savePuzzle({
                puzzle: this.currentPuzzle,
                currentMoveIndex: this.currentMoveIndex,
                hasFailed: !!this.hasFailed,
                hintUsed: !!(this.currentPuzzle && this.currentPuzzle.hintUsed)
            });
        },

        /**
         * Resume an in-progress puzzle loaded from localStorage.
         */
        resumePuzzle: function(saved) {
            this.currentPuzzle = saved.puzzle;
            this.hasFailed = !!saved.hasFailed;
            this.isSolved = false;
            this.currentPuzzle.hintUsed = !!saved.hintUsed;
            this.updateActionBarUI();

            this.engine.loadFEN(saved.puzzle.FEN);
            this.solutionMoves = saved.puzzle.Moves.split(' ');
            this.puzzleColor = this.engine.turn === 'w' ? 'b' : 'w';

            if (this.board) {
                this.board.orientation = this.puzzleColor;
                this.board.setEngine(this.engine);
            }

            var targetIndex = typeof saved.currentMoveIndex === 'number' ? saved.currentMoveIndex : 1;
            for (var i = 0; i < targetIndex && i < this.solutionMoves.length; i++) {
                this.applyUciMove(this.solutionMoves[i]);
            }
            this.currentMoveIndex = targetIndex;

            this.updateHeaderUI();
            this.updateCapturedPieces();

            if (this.currentMoveIndex < this.solutionMoves.length && this.currentMoveIndex % 2 === 0) {
                this.isPlayerTurn = false;
                this.setStatus('puzzle.bot_moving');
                var self = this;
                setTimeout(function() {
                    self.botReply();
                }, 500);
            } else {
                this.isPlayerTurn = true;
                this.updateTurnStatus();
            }
        },

        /**
         * Load a puzzle from the folder-based structure or resume an in-progress puzzle.
         * Reads PUZZLE_MANIFEST to pick a random file from the appropriate bucket.
         */
        loadPuzzle: function() {
            var self = this;
            var storage = getStorage();

            // Check if there is an in-progress saved puzzle to resume
            var saved = storage ? storage.getSavedPuzzle() : null;
            if (saved && saved.puzzle && saved.puzzle.FEN && saved.puzzle.Moves) {
                try {
                    this.resumePuzzle(saved);
                    return;
                } catch (e) {
                    console.error('Error resuming saved puzzle', e);
                    if (storage) storage.clearSavedPuzzle();
                }
            }

            this.isSolved = false;
            this.hasFailed = false;
            this.updateActionBarUI();
            this.setStatus('puzzle.status_playing');

            var elo = storage ? storage.getPuzzleElo() : 400;
            var bucket = Math.floor(elo / 100) * 100;
            if (bucket < this.MIN_BUCKET) bucket = this.MIN_BUCKET;
            if (bucket > this.MAX_BUCKET) bucket = this.MAX_BUCKET;

            // Read manifest to find number of files in this bucket
            var manifest = (typeof PUZZLE_MANIFEST !== 'undefined') ? PUZZLE_MANIFEST : null;
            var manifestVer = (typeof PUZZLE_MANIFEST_VERSION !== 'undefined') ? PUZZLE_MANIFEST_VERSION : '';
            var cacheBust = manifestVer ? ('?v=' + encodeURIComponent(manifestVer)) : '';
            var fileCount = 0;
            var url = '';

            if (manifest && manifest[bucket] && manifest[bucket] > 0) {
                fileCount = manifest[bucket];
                // Pick a random file number (1-indexed, zero-padded to 3 digits)
                var fileNum = Math.floor(Math.random() * fileCount) + 1;
                var fileStr = String(fileNum);
                while (fileStr.length < 3) fileStr = '0' + fileStr;
                url = 'data/puzzles/' + bucket + '/' + fileStr + '.json' + cacheBust;
            } else {
                // Fallback: try to find the nearest bucket with puzzles
                var nearest = this.findNearestBucket(bucket, manifest);
                if (nearest !== null && manifest && manifest[nearest] > 0) {
                    fileCount = manifest[nearest];
                    var nFileNum = Math.floor(Math.random() * fileCount) + 1;
                    var nFileStr = String(nFileNum);
                    while (nFileStr.length < 3) nFileStr = '0' + nFileStr;
                    url = 'data/puzzles/' + nearest + '/' + nFileStr + '.json' + cacheBust;
                    bucket = nearest;
                } else {
                    // Last resort: fallback to old flat file format
                    url = 'data/puzzles/' + bucket + '.json' + cacheBust;
                }
            }

            if (typeof XMLHttpRequest === 'undefined') return;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            var puzzles = JSON.parse(xhr.responseText);
                            self.pickPuzzle(puzzles);
                        } catch (e) {
                            console.error('Error parsing puzzle file', e);
                        }
                    } else {
                        // Fallback to 1200 bucket if current bucket missing
                        if (bucket !== 1200) {
                            console.warn('Bucket ' + bucket + ' not found, falling back to 1200');
                            if (storage) {
                                storage.setPuzzleElo(1200);
                            }
                            self.loadPuzzle();
                        }
                    }
                }
            };
            xhr.send();
        },

        /**
         * Find the nearest bucket that has puzzles in the manifest.
         */
        findNearestBucket: function(bucket, manifest) {
            if (!manifest) return null;
            // Search outward from current bucket
            for (var offset = 100; offset <= 2400; offset += 100) {
                var lower = bucket - offset;
                var higher = bucket + offset;
                if (lower >= this.MIN_BUCKET && manifest[lower] && manifest[lower] > 0) return lower;
                if (higher <= this.MAX_BUCKET && manifest[higher] && manifest[higher] > 0) return higher;
            }
            return null;
        },

        pickPuzzle: function(puzzles) {
            var storage = getStorage();
            var played = storage ? storage.getPlayedPuzzlesHash() : {};
            var unplayed = [];
            for (var i = 0; i < puzzles.length; i++) {
                if (!played[puzzles[i].PuzzleId]) {
                    unplayed.push(puzzles[i]);
                }
            }

            if (unplayed.length === 0) {
                // If all played in this file, clear history and use all
                if (storage) {
                    storage.clearPlayedPuzzles();
                }
                unplayed = puzzles;
            }

            var rIdx = Math.floor(Math.random() * unplayed.length);
            this.startPuzzle(unplayed[rIdx]);
        },

        startPuzzle: function(puzzle) {
            this.currentPuzzle = puzzle;
            this.hasFailed = false;
            this.isSolved = false;
            this.currentPuzzle.hintUsed = false;
            this.updateActionBarUI();

            var storage = getStorage();
            if (storage) {
                storage.addPlayedPuzzle(puzzle.PuzzleId);
            }

            this.engine.loadFEN(puzzle.FEN);
            this.solutionMoves = puzzle.Moves.split(' ');
            this.currentMoveIndex = 0;

            // In Lichess puzzles, the FEN is the state *before* the opponent's first move.
            // The first move in the solution is ALWAYS the opponent's move.
            // Then it's our turn.
            
            this.puzzleColor = this.engine.turn === 'w' ? 'b' : 'w';
            if (this.board) {
                this.board.orientation = this.puzzleColor;
                this.board.setEngine(this.engine);
            }

            var firstMoveStr = this.solutionMoves[0];
            this.applyUciMove(firstMoveStr);
            this.currentMoveIndex = 1; // Now it's player's turn to play move[1]

            this.isPlayerTurn = true;

            this.saveCurrentPuzzleState();

            this.updateHeaderUI();
            this.updateTurnStatus();
            this.updateCapturedPieces();
        },

        algebraicToCoords: function(alg) {
            var c = alg.charCodeAt(0) - 97;
            var r = 8 - parseInt(alg.charAt(1), 10);
            return { r: r, c: c };
        },

        coordsToAlgebraic: function(r, c) {
            return String.fromCharCode(97 + c) + (8 - r);
        },

        applyUciMove: function(uciStr) {
            if (!this.engine) return false;
            var fromAlg = uciStr.substring(0, 2);
            var toAlg = uciStr.substring(2, 4);
            var promo = uciStr.length === 5 ? uciStr.charAt(4) : null;

            var from = this.algebraicToCoords(fromAlg);
            var to = this.algebraicToCoords(toAlg);

            var legalMoves = this.engine.getLegalMoves(from.r, from.c);
            for (var i = 0; i < legalMoves.length; i++) {
                var m = legalMoves[i];
                if (m.to.r === to.r && m.to.c === to.c) {
                    if (promo && m.promotion) {
                        if (m.promotion.toLowerCase() === promo.toLowerCase()) {
                            this.engine.makeMove(m);
                            if (this.board) this.board.setLastMove(from, to);
                            return true;
                        }
                    } else {
                        this.engine.makeMove(m);
                        if (this.board) this.board.setLastMove(from, to);
                        return true;
                    }
                }
            }
            return false;
        },

        handlePlayerMove: function(move) {
            if (!this.isPlayerTurn || !this.currentPuzzle || !move || !move.from || !move.to || this.isSolved) {
                if (this.board) this.board.render(); // Re-render to clear pending move attempt
                return;
            }

            var from = move.from;
            var to = move.to;
            var promo = move.promotion;

            var expectedUci = this.solutionMoves[this.currentMoveIndex];
            var expectedFrom = this.algebraicToCoords(expectedUci.substring(0, 2));
            var expectedTo = this.algebraicToCoords(expectedUci.substring(2, 4));
            var expectedPromo = expectedUci.length === 5 ? expectedUci.charAt(4) : null;

            if (from.r === expectedFrom.r && from.c === expectedFrom.c &&
                to.r === expectedTo.r && to.c === expectedTo.c &&
                (!expectedPromo || (promo || '').toLowerCase() === expectedPromo.toLowerCase())) {
                
                // Correct Move!
                this.setStatus('puzzle.status_correct');
                this.applyUciMove(expectedUci);
                this.updateCapturedPieces();
                this.currentMoveIndex++;

                if (this.currentMoveIndex >= this.solutionMoves.length) {
                    this.puzzleSolved();
                } else {
                    // Bot replies
                    this.isPlayerTurn = false;
                    this.setStatus('puzzle.bot_moving');
                    var self = this;
                    setTimeout(function() {
                        self.botReply();
                    }, 500); // Small delay for E-ink to digest
                }

            } else {
                // Incorrect Move!
                this.setStatus('puzzle.status_incorrect');
                if (this.board) {
                    this.board.selectedSquare = null;
                    this.board.render(); // Re-render to clear incorrect move attempt
                }
                
                // Mark as failed on FIRST wrong move only (proportional ELO applied later)
                if (!this.hasFailed) {
                    this.hasFailed = true;
                    var storage = getStorage();
                    if (storage) {
                        storage.setPuzzleStreak(0);
                    }
                }
                this.saveCurrentPuzzleState();
                this.updateHeaderUI();
            }
        },

        botReply: function() {
            if (this.currentMoveIndex >= this.solutionMoves.length) {
                this.puzzleSolved();
                return;
            }
            var replyUci = this.solutionMoves[this.currentMoveIndex];
            this.applyUciMove(replyUci);
            this.currentMoveIndex++;
            this.isPlayerTurn = true;
            this.updateCapturedPieces();
            this.updateTurnStatus();

            if (this.currentMoveIndex >= this.solutionMoves.length) {
                this.puzzleSolved();
            } else {
                this.saveCurrentPuzzleState();
            }
        },

        useHint: function() {
            if (!this.isPlayerTurn || !this.currentPuzzle || this.isSolved) return;
            
            // If hint was already confirmed and used for this puzzle, re-highlight directly
            if (this.currentPuzzle.hintUsed) {
                this.highlightHintMove();
                return;
            }

            var penalty = this.getHintPenalty();
            var i18n = getI18n();

            if (typeof document !== 'undefined') {
                var modal = document.getElementById('hint-confirm-modal');
                var body = document.getElementById('hint-modal-body');
                var title = document.getElementById('hint-modal-title');

                if (title && i18n) {
                    title.innerText = i18n.t('puzzle.confirm_hint_title');
                }
                if (body) {
                    var bodyText = i18n ? i18n.t('puzzle.confirm_hint_body', { penalty: penalty }) : ('Are you sure you want to use a hint for this puzzle?<br>You will lose <strong>' + penalty + ' ELO</strong> and your Streak will reset to 0.');
                    body.innerHTML = bodyText;
                }

                if (modal) {
                    modal.className = 'modal-overlay active';
                    modal.style.display = 'block';
                }
            }
        },

        closeHintModal: function() {
            if (typeof document === 'undefined') return;
            var modal = document.getElementById('hint-confirm-modal');
            if (modal) {
                modal.className = 'modal-overlay';
                modal.style.display = 'none';
            }
        },

        confirmHint: function() {
            this.closeHintModal();
            if (!this.currentPuzzle || this.isSolved) return;

            // Apply proportional ELO loss immediately upon confirming hint
            var result = this.applyEloChange(false, true);
            var storage = getStorage();
            if (storage) {
                storage.setPuzzleStreak(0);
            }
            this.updateHeaderUI();

            this.currentPuzzle.hintUsed = true;
            this.highlightHintMove();

            var i18n = getI18n();
            var deltaStr = result.delta < 0 ? String(result.delta) : ('-' + Math.abs(result.delta));
            if (i18n) {
                this.setStatus('puzzle.status_hint_used', { delta: deltaStr });
            }

            this.saveCurrentPuzzleState();
        },

        highlightHintMove: function() {
            if (!this.currentPuzzle || this.currentMoveIndex >= this.solutionMoves.length) return;
            var expectedUci = this.solutionMoves[this.currentMoveIndex];
            var expectedFrom = this.algebraicToCoords(expectedUci.substring(0, 2));

            if (this.board && this.engine) {
                this.board.selectedSquare = expectedFrom;
                this.board.validMoves = this.engine.getLegalMoves(expectedFrom.r, expectedFrom.c);
                this.board.render();
            }
        },

        getHintPenalty: function() {
            return this.getSkipPenalty();
        },

        getSkipPenalty: function() {
            var K = 32;
            var storage = getStorage();
            var elo = storage ? storage.getPuzzleElo() : 400;
            var pElo = (this.currentPuzzle && this.currentPuzzle.Rating) ? parseInt(this.currentPuzzle.Rating, 10) : elo;
            var expected = this.calculateExpected(elo, pElo);
            var delta = -Math.round(K * expected);
            if (delta >= 0) delta = -1;
            if (delta < -32) delta = -32;
            return Math.abs(delta);
        },

        skipPuzzle: function() {
            if (!this.currentPuzzle || this.isSolved) return;
            var penalty = this.getSkipPenalty();
            var i18n = getI18n();

            if (typeof document !== 'undefined') {
                var modal = document.getElementById('skip-confirm-modal');
                var body = document.getElementById('skip-modal-body');
                var title = document.getElementById('skip-modal-title');

                if (title && i18n) {
                    title.innerText = i18n.t('puzzle.confirm_skip_title');
                }
                if (body) {
                    var bodyText = i18n ? i18n.t('puzzle.confirm_skip_body', { penalty: penalty }) : ('Are you sure you want to skip this puzzle?<br>You will lose <strong>' + penalty + ' ELO</strong> and your Streak will reset to 0.');
                    body.innerHTML = bodyText;
                }

                if (modal) {
                    modal.className = 'modal-overlay active';
                    modal.style.display = 'block';
                }
            }
        },

        closeSkipModal: function() {
            if (typeof document === 'undefined') return;
            var modal = document.getElementById('skip-confirm-modal');
            if (modal) {
                modal.className = 'modal-overlay';
                modal.style.display = 'none';
            }
        },

        confirmSkip: function() {
            this.closeSkipModal();
            if (!this.currentPuzzle || this.isSolved) return;

            var storage = getStorage();
            if (storage) {
                storage.clearSavedPuzzle();
            }

            // Apply proportional ELO loss on skip
            var result = this.applyEloChange(false, true);
            if (storage) {
                storage.setPuzzleStreak(0);
            }
            this.updateHeaderUI();

            var i18n = getI18n();
            var deltaStr = result.delta < 0 ? String(result.delta) : ('-' + Math.abs(result.delta));
            if (i18n) {
                this.setStatus('puzzle.status_skipped', { delta: deltaStr });
            }

            this.loadPuzzle();
        },

        nextPuzzle: function() {
            this.closeModal();
            var storage = getStorage();
            if (storage) {
                storage.clearSavedPuzzle();
            }
            this.loadPuzzle();
        },

        puzzleSolved: function() {
            this.isPlayerTurn = false;
            this.isSolved = true;
            this.updateActionBarUI();

            var storage = getStorage();
            if (storage) {
                storage.clearSavedPuzzle();
            }

            var hintUsed = this.currentPuzzle && this.currentPuzzle.hintUsed;
            var i18n = getI18n();

            // Apply proportional ELO change based on outcome
            var result;
            if (hintUsed) {
                // Hint used: 0 ELO change
                var curElo = storage ? storage.getPuzzleElo() : 400;
                result = { oldElo: curElo, newElo: curElo, delta: 0 };
            } else if (this.hasFailed) {
                // Had wrong move(s): proportional loss
                result = this.applyEloChange(false, true);
            } else {
                // Clean solve: proportional gain
                result = this.applyEloChange(true, false);
                // Increment streak only on clean solve
                if (storage) {
                    var streak = storage.getPuzzleStreak() + 1;
                    storage.setPuzzleStreak(streak);
                }
            }

            this.updateHeaderUI();
            
            if (typeof document === 'undefined') return;

            // Show Game Over Modal
            var modal = document.getElementById('gameover-modal');
            var body = document.getElementById('gameover-body');
            var title = document.getElementById('gameover-title');
            var pElo = (this.currentPuzzle && this.currentPuzzle.Rating) ? parseInt(this.currentPuzzle.Rating, 10) : 0;
            
            // Prepare Themes & Analysis Link
            var themes = (this.currentPuzzle && this.currentPuzzle.Themes) ? this.currentPuzzle.Themes : '';
            var themesHtml = '';
            if (themes) {
                var themesLabel = i18n ? i18n.t('puzzle.themes_label') : 'Themes:';
                var themesList = themes.split(' ').join(', ');
                themesHtml = '<div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #000; font-size: 12px; word-break: break-word;">' +
                    '<strong>' + themesLabel + '</strong> ' + themesList +
                    '</div>';
            }

            var pId = (this.currentPuzzle && this.currentPuzzle.PuzzleId) ? this.currentPuzzle.PuzzleId : '';
            var analysisHtml = '';
            if (pId) {
                var analysisLabel = i18n ? i18n.t('puzzle.lichess_analysis') : 'Analyze on Lichess ↗';
                analysisHtml = '<div style="margin-top: 8px;">' +
                    '<a href="https://lichess.org/training/' + pId + '" target="_blank" class="btn btn-sm" style="text-decoration: none; display: inline-block; font-size: 11px; padding: 4px 8px;">' + analysisLabel + '</a>' +
                    '</div>';
            }

            // Set title and body based on outcome
            if (hintUsed) {
                if (title) {
                    title.innerText = i18n ? i18n.t('puzzle.success_title') : 'Puzzle Solved! ♔';
                }
                var hintMsg = i18n ? i18n.t('puzzle.hint_solved_msg', { elo: pElo }) : ('You solved the ' + pElo + ' ELO puzzle with a hint.');
                var hintEloStr = i18n ? i18n.t('puzzle.elo_change', { elo: result.newElo, delta: '+0' }) : ('ELO: ' + result.newElo + ' (+0)');
                if (body) {
                    body.innerHTML = '<div style="margin-bottom: 6px;">' + hintMsg + '</div>' +
                        '<div style="font-size: 16px; font-weight: bold;">' + hintEloStr + '</div>' +
                        themesHtml +
                        analysisHtml;
                }
            } else if (this.hasFailed) {
                if (title) {
                    title.innerText = i18n ? i18n.t('puzzle.failed_title') : 'Solved with mistakes';
                }
                var failedMsg = i18n ? i18n.t('puzzle.failed_msg', { elo: pElo }) : ('You solved the ' + pElo + ' ELO puzzle after mistakes.');
                var deltaStr = result.delta < 0 ? String(result.delta) : ('-' + Math.abs(result.delta));
                var failedEloStr = i18n ? i18n.t('puzzle.elo_change', { elo: result.newElo, delta: deltaStr }) : ('ELO: ' + result.newElo + ' (' + deltaStr + ')');
                if (body) {
                    body.innerHTML = '<div style="margin-bottom: 6px;">' + failedMsg + '</div>' +
                        '<div style="font-size: 16px; font-weight: bold;">' + failedEloStr + '</div>' +
                        themesHtml +
                        analysisHtml;
                }
            } else {
                if (title) {
                    title.innerText = i18n ? i18n.t('puzzle.success_title') : 'Puzzle Solved! ♔';
                }
                var succMsg = i18n ? i18n.t('puzzle.success_msg', { elo: pElo }) : ('You solved a ' + pElo + ' ELO puzzle.');
                var succDeltaStr = '+' + result.delta;
                var succEloStr = i18n ? i18n.t('puzzle.elo_change', { elo: result.newElo, delta: succDeltaStr }) : ('ELO: ' + result.newElo + ' (' + succDeltaStr + ')');
                if (body) {
                    body.innerHTML = '<div style="margin-bottom: 6px;">' + succMsg + '</div>' +
                        '<div style="font-size: 16px; font-weight: bold;">' + succEloStr + '</div>' +
                        themesHtml +
                        analysisHtml;
                }
            }
            
            if (modal) {
                modal.className = 'modal-overlay active';
                modal.style.display = 'block';
            }
        },

        closeModal: function() {
            if (typeof document === 'undefined') return;
            var modal = document.getElementById('gameover-modal');
            if (modal) {
                modal.className = 'modal-overlay';
                modal.style.display = 'none';
            }
        },

        refreshScreen: function() {
            if (typeof document === 'undefined') return;
            var overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.zIndex = '99999';
            overlay.style.backgroundColor = '#ffffff';
            document.body.appendChild(overlay);

            var self = this;
            setTimeout(function() {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                if (self.board) {
                    self.board.render();
                }
            }, 200);
        }
    };

    root.PuzzleManager = PuzzleManager;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = PuzzleManager;
    }

    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', function() {
            if (document.getElementById('puzzle-elo-badge')) {
                PuzzleManager.init();
            }
        });
    }

})(typeof window !== 'undefined' ? window : this);
