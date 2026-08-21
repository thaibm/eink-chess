/**
 * ====================================================================
 * CHESS BOARD (DOM INCREMENTAL RENDERER — ES5 COMPLIANT) — EinkChess
 * High contrast E-ink renderer, Touch/Click handler, Last Move Dashed Outlines
 * ====================================================================
 */

(function(root) {
    'use strict';

    function ChessBoard(containerId, options) {
        this.container = document.getElementById(containerId);
        this.options = options || {};
        this.orientation = this.options.orientation || 'w'; // 'w' or 'b'
        this.showHints = this.options.showHints !== false;

        this.selectedSquare = null; // { r, c }
        this.validMoves = [];       // array of legal moves for selectedSquare
        this.lastMove = null;       // { from: {r,c}, to: {r,c} }
        this.reviewBadge = null;    // { r: 0..7, c: 0..7, symbol: '★', isDark: true }
        this.squaresDOM = [];       // 8x8 matrix of DOM elements

        this.engine = this.options.engine || null;
        this.onMove = this.options.onMove || function() {};

        this.buildBoard();
    }

    ChessBoard.prototype.buildBoard = function() {
        if (!this.container) return;
        this.container.innerHTML = '';

        var table = document.createElement('div');
        table.className = 'chess-board';

        var self = this;
        var lastFastInputTime = 0;

        function onFastInput(e) {
            var now = Date.now ? Date.now() : new Date().getTime();
            if (lastFastInputTime && now - lastFastInputTime < 80) {
                if (e && e.preventDefault) e.preventDefault();
                return false;
            }
            lastFastInputTime = now;
            if (e && e.preventDefault) e.preventDefault();
            onContainerClick(e, true);
            return false;
        }

        function onContainerClick(e, fromTouch) {
            var now = Date.now ? Date.now() : new Date().getTime();
            if (!fromTouch && lastFastInputTime && (now - lastFastInputTime < 300)) {
                return false;
            }

            var tgt = (e && (e.target || e.srcElement)) || null;
            if (tgt === table && e && e.touches && e.touches[0] && document.elementFromPoint) {
                tgt = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY) || tgt;
            }
            while (tgt && tgt.getAttribute && (tgt.getAttribute('data-r') === null || tgt.getAttribute('data-c') === null)) {
                tgt = tgt.parentNode;
            }
            if (!tgt || !tgt.getAttribute) return;

            var rAttr = tgt.getAttribute('data-r');
            var cAttr = tgt.getAttribute('data-c');
            if (rAttr === null || cAttr === null) return;

            var r = parseInt(rAttr, 10);
            var c = parseInt(cAttr, 10);
            if (isNaN(r) || isNaN(c)) return;

            self.handleSquareClick(r, c);
            return false;
        }

        table.onclick = onContainerClick;
        table.ontouchstart = onFastInput;
        table.onmousedown = onFastInput;

        this.squaresDOM = [];
        for (var r = 0; r < 8; r++) {
            var rowDOM = document.createElement('div');
            rowDOM.className = 'board-row';
            var rowSquares = [];

            for (var c = 0; c < 8; c++) {
                var sq = document.createElement('div');
                sq.className = 'sq ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
                sq.setAttribute('data-r', r);
                sq.setAttribute('data-c', c);

                (function(rowIdx, colIdx, sqElem) {
                    function onCellInput(e) {
                        var now = Date.now ? Date.now() : new Date().getTime();
                        if (lastFastInputTime && now - lastFastInputTime < 80) {
                            if (e && e.preventDefault) e.preventDefault();
                            return false;
                        }
                        lastFastInputTime = now;
                        if (e && e.preventDefault) e.preventDefault();
                        self.handleSquareClick(rowIdx, colIdx);
                        return false;
                    }
                    sqElem.onclick = onCellInput;
                    sqElem.ontouchstart = onCellInput;
                    sqElem.onmousedown = onCellInput;
                })(r, c, sq);

                var pieceHolder = document.createElement('div');
                pieceHolder.className = 'piece';
                var pieceInner = document.createElement('div');
                pieceInner.className = 'piece-inner';
                pieceHolder.appendChild(pieceInner);
                sq.appendChild(pieceHolder);

                rowDOM.appendChild(sq);
                rowSquares.push(sq);
            }
            table.appendChild(rowDOM);
            this.squaresDOM.push(rowSquares);
        }

        this.container.appendChild(table);
        this.render();
    };

    ChessBoard.prototype.flip = function() {
        this.orientation = this.orientation === 'w' ? 'b' : 'w';
        this.render();
    };

    ChessBoard.prototype.setOrientation = function(orientation) {
        this.orientation = (orientation === 'b') ? 'b' : 'w';
        this.render();
    };

    ChessBoard.prototype.setEngine = function(engine) {
        this.engine = engine;
        this.selectedSquare = null;
        this.validMoves = [];
        this.lastMove = null;
        this.reviewBadge = null;
        this.render();
    };

    ChessBoard.prototype.setLastMove = function(from, to) {
        this.lastMove = (from && to) ? { from: from, to: to } : null;
        this.render();
    };

    ChessBoard.prototype.setReviewBadge = function(r, c, symbol, isDark) {
        if (r !== null && typeof r !== 'undefined' && c !== null && typeof c !== 'undefined' && symbol) {
            this.reviewBadge = { r: r, c: c, symbol: symbol, isDark: !!isDark };
        } else {
            this.reviewBadge = null;
        }
        this.render();
    };

    ChessBoard.prototype.clearReviewBadge = function() {
        this.reviewBadge = null;
        this.render();
    };

    ChessBoard.prototype.handleSquareClick = function(r, c) {
        if (!this.engine) return;

        // If flipped, map visual click back to logical coordinates
        var logR = this.orientation === 'w' ? r : 7 - r;
        var logC = this.orientation === 'w' ? c : 7 - c;

        // If square is already selected, try to move or deselect
        if (this.selectedSquare) {
            // Check if clicked one of the valid destination squares
            var matchingMoves = [];
            for (var i = 0; i < this.validMoves.length; i++) {
                var m = this.validMoves[i];
                if (m.to.r === logR && m.to.c === logC) {
                    matchingMoves.push(m);
                }
            }

            if (matchingMoves.length > 0) {
                // Check if this move requires pawn promotion piece selection
                if (matchingMoves.length > 1 && matchingMoves[0].promotion) {
                    this.showPromotionDialog(matchingMoves);
                    return;
                }

                var targetMove = matchingMoves[0];
                // Execute move
                this.selectedSquare = null;
                this.validMoves = [];
                this.onMove(targetMove);
                return;
            }

            // If clicking the same selected piece -> Deselect
            if (this.selectedSquare.r === logR && this.selectedSquare.c === logC) {
                this.selectedSquare = null;
                this.validMoves = [];
                this.render();
                return;
            }
        }

        // Try selecting new piece
        var piece = this.engine.board[logR][logC];
        if (piece && this.engine.getColor(piece) === this.engine.turn) {
            this.selectedSquare = { r: logR, c: logC };
            this.validMoves = this.engine.getLegalMoves(logR, logC);
        } else {
            this.selectedSquare = null;
            this.validMoves = [];
        }

        this.render();
    };

    ChessBoard.prototype.getPromotionModal = function() {
        var modal = document.getElementById('chessboard-promo-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'chessboard-promo-modal';
            modal.className = 'modal-overlay';
            modal.innerHTML =
                '<div class="modal-box" style="max-width: 380px; text-align: center;">' +
                    '<div class="modal-title" id="chessboard-promo-title" style="text-align: center;">' +
                        (typeof ChessI18n !== 'undefined' ? ChessI18n.t('game.promotion_title') : 'PROMOTION') +
                    '</div>' +
                    '<div class="modal-body" style="padding: 6px 0;">' +
                        '<div class="promo-options" id="chessboard-promo-options"></div>' +
                    '</div>' +
                    '<div class="modal-footer" style="text-align: center;">' +
                        '<button class="btn" id="chessboard-promo-cancel" style="min-width: 100px;">' +
                            (typeof ChessI18n !== 'undefined' ? ChessI18n.t('game.btn_cancel') : 'Cancel') +
                        '</button>' +
                    '</div>' +
                '</div>';
            document.body.appendChild(modal);
        }
        return modal;
    };

    ChessBoard.prototype.showPromotionDialog = function(matchingMoves) {
        var self = this;
        var modal = this.getPromotionModal();
        var titleEl = document.getElementById('chessboard-promo-title');
        var optionsEl = document.getElementById('chessboard-promo-options');
        var cancelBtn = document.getElementById('chessboard-promo-cancel');

        if (titleEl && typeof ChessI18n !== 'undefined') {
            titleEl.innerHTML = ChessI18n.t('game.promotion_title');
        }
        if (cancelBtn && typeof ChessI18n !== 'undefined') {
            cancelBtn.innerHTML = ChessI18n.t('game.btn_cancel');
        }

        optionsEl.innerHTML = '';

        for (var i = 0; i < matchingMoves.length; i++) {
            var move = matchingMoves[i];
            var promoPiece = move.promotion;
            var pUpper = promoPiece.toUpperCase();

            var glyph = this.engine ? this.engine.getGlyph(promoPiece) : '';
            var labelKey = 'game.promotion_' + (pUpper === 'Q' ? 'queen' : pUpper === 'R' ? 'rook' : pUpper === 'B' ? 'bishop' : 'knight');
            var label = typeof ChessI18n !== 'undefined' ? ChessI18n.t(labelKey) : pUpper;

            var btn = document.createElement('div');
            btn.className = 'promo-btn';
            btn.innerHTML = '<span class="promo-piece-glyph">' + glyph + '</span><span class="promo-piece-name">' + label + '</span>';

            (function(selectedMove) {
                btn.onclick = function() {
                    modal.className = 'modal-overlay';
                    modal.style.display = 'none';
                    self.selectedSquare = null;
                    self.validMoves = [];
                    self.onMove(selectedMove);
                };
            })(move);

            optionsEl.appendChild(btn);
        }

        cancelBtn.onclick = function() {
            modal.className = 'modal-overlay';
            modal.style.display = 'none';
            self.selectedSquare = null;
            self.validMoves = [];
            self.render();
        };

        modal.className = 'modal-overlay active';
        modal.style.display = 'block';
    };

    ChessBoard.prototype.render = function() {
        if (!this.engine || this.squaresDOM.length === 0) return;

        var inCheckColor = this.engine.isCheck(this.engine.turn) ? this.engine.turn : null;
        var kingPos = inCheckColor ? this.engine.findKing(inCheckColor) : null;

        for (var visualR = 0; visualR < 8; visualR++) {
            for (var visualC = 0; visualC < 8; visualC++) {
                var logR = this.orientation === 'w' ? visualR : 7 - visualR;
                var logC = this.orientation === 'w' ? visualC : 7 - visualC;

                var sqDOM = this.squaresDOM[visualR][visualC];
                var piece = this.engine.board[logR][logC];
                var isLight = (logR + logC) % 2 === 0;

                // Base classes
                var cls = 'sq ' + (isLight ? 'light' : 'dark');

                // Selected square
                if (this.selectedSquare && this.selectedSquare.r === logR && this.selectedSquare.c === logC) {
                    cls += ' selected';
                }

                // Last move dashed outline (both from & to squares)
                if (this.lastMove) {
                    if (this.lastMove.from.r === logR && this.lastMove.from.c === logC) {
                        cls += ' last-from';
                    }
                    if (this.lastMove.to.r === logR && this.lastMove.to.c === logC) {
                        cls += ' last-to';
                    }
                }

                // King in check
                if (kingPos && kingPos.r === logR && kingPos.c === logC) {
                    cls += ' in-check';
                }

                // Hints for legal destination squares
                if (this.showHints && this.validMoves.length > 0) {
                    for (var h = 0; h < this.validMoves.length; h++) {
                        var vm = this.validMoves[h];
                        if (vm.to.r === logR && vm.to.c === logC) {
                            cls += vm.captured ? ' hint-capture' : ' hint-move';
                            break;
                        }
                    }
                }

                sqDOM.className = cls;

                // Update piece glyph inside
                var pieceInner = sqDOM.getElementsByTagName('div')[0].getElementsByTagName('div')[0];
                if (piece) {
                    var isWhitePiece = this.engine.isWhite(piece);
                    pieceInner.className = 'piece-inner ' + (isWhitePiece ? 'piece-w' : 'piece-b');
                    pieceInner.innerHTML = this.engine.getGlyph(piece);
                } else {
                    pieceInner.className = 'piece-inner';
                    pieceInner.innerHTML = '';
                }

                // Update review badge if present on this square
                var hasBadge = (this.reviewBadge && this.reviewBadge.r === logR && this.reviewBadge.c === logC);
                var badgeEl = sqDOM.querySelector ? sqDOM.querySelector('.sq-review-badge') : null;

                if (hasBadge) {
                    if (!badgeEl) {
                        badgeEl = document.createElement('div');
                        sqDOM.appendChild(badgeEl);
                    }
                    badgeEl.className = 'sq-review-badge' + (this.reviewBadge.isDark ? ' bg-dark' : '');
                    badgeEl.innerHTML = this.reviewBadge.symbol;
                } else if (badgeEl && badgeEl.parentNode === sqDOM) {
                    sqDOM.removeChild(badgeEl);
                }
            }
        }
    };

    root.ChessBoard = ChessBoard;

})(typeof window !== 'undefined' ? window : this);
