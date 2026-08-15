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

                var pieceHolder = document.createElement('div');
                pieceHolder.className = 'piece';
                var pieceInner = document.createElement('div');
                pieceInner.className = 'piece-inner';
                pieceHolder.appendChild(pieceInner);
                sq.appendChild(pieceHolder);

                var self = this;
                (function(row, col) {
                    sq.onclick = function() {
                        self.handleSquareClick(row, col);
                    };
                })(r, c);

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

    ChessBoard.prototype.setEngine = function(engine) {
        this.engine = engine;
        this.selectedSquare = null;
        this.validMoves = [];
        this.lastMove = null;
        this.render();
    };

    ChessBoard.prototype.setLastMove = function(from, to) {
        this.lastMove = (from && to) ? { from: from, to: to } : null;
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
            var targetMove = null;
            for (var i = 0; i < this.validMoves.length; i++) {
                var m = this.validMoves[i];
                if (m.to.r === logR && m.to.c === logC) {
                    targetMove = m;
                    break;
                }
            }

            if (targetMove) {
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
            }
        }
    };

    root.ChessBoard = ChessBoard;

})(typeof window !== 'undefined' ? window : this);
