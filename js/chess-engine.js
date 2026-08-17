/**
 * ====================================================================
 * CHESS ENGINE (ES5 COMPLIANT) — EinkChess
 * Core rules, FEN parser/serializer, move generation, SAN notation,
 * check/checkmate/stalemate detection, undo support.
 * ====================================================================
 */

(function(root) {
    'use strict';

    var PIECES = {
        EMPTY: null,
        W_PAWN: 'P', W_KNIGHT: 'N', W_BISHOP: 'B', W_ROOK: 'R', W_QUEEN: 'Q', W_KING: 'K',
        B_PAWN: 'p', B_KNIGHT: 'n', B_BISHOP: 'b', B_ROOK: 'r', B_QUEEN: 'q', B_KING: 'k'
    };

    var GLYPHS = {
        'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔',
        'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚'
    };

    var INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    // --- Zobrist Hashing ---
    // Used by the AI's transposition table to identify positions cheaply.
    // Built once at load time from Math.random(); values are coerced to
    // 32-bit signed ints by the XOR operator, so any random number works.
    var ZOBRIST_PIECES = {};
    (function buildZobristTables() {
        var pieceChars = ['P', 'N', 'B', 'R', 'Q', 'K', 'p', 'n', 'b', 'r', 'q', 'k'];
        var i, sq;
        for (i = 0; i < pieceChars.length; i++) {
            var table = [];
            for (sq = 0; sq < 64; sq++) {
                table.push((Math.random() * 0xFFFFFFFF) | 0);
            }
            ZOBRIST_PIECES[pieceChars[i]] = table;
        }
    })();
    var ZOBRIST_SIDE = (Math.random() * 0xFFFFFFFF) | 0;
    var ZOBRIST_CASTLING = {
        K: (Math.random() * 0xFFFFFFFF) | 0,
        Q: (Math.random() * 0xFFFFFFFF) | 0,
        k: (Math.random() * 0xFFFFFFFF) | 0,
        q: (Math.random() * 0xFFFFFFFF) | 0
    };
    var ZOBRIST_EP_FILE = [];
    (function buildZobristEpFiles() {
        for (var f = 0; f < 8; f++) {
            ZOBRIST_EP_FILE.push((Math.random() * 0xFFFFFFFF) | 0);
        }
    })();

    function ChessEngine(fen) {
        this.board = [];
        this.turn = 'w';
        this.castling = { K: true, Q: true, k: true, q: true };
        this.epSquare = null; // { r: row, c: col }
        this.halfmoveClock = 0;
        this.fullmoveNumber = 1;
        this.history = [];
        this.positionCounts = {};
        this.whiteKingPos = null;
        this.blackKingPos = null;

        this.initBoard();
        this.loadFEN(fen || INITIAL_FEN);
    }

    ChessEngine.prototype.initBoard = function() {
        this.board = [];
        for (var r = 0; r < 8; r++) {
            var row = [];
            for (var c = 0; c < 8; c++) {
                row.push(null);
            }
            this.board.push(row);
        }
    };

    ChessEngine.prototype.isWhite = function(piece) {
        return piece && piece === piece.toUpperCase();
    };

    ChessEngine.prototype.isBlack = function(piece) {
        return piece && piece === piece.toLowerCase();
    };

    ChessEngine.prototype.getColor = function(piece) {
        if (!piece) return null;
        return this.isWhite(piece) ? 'w' : 'b';
    };

    ChessEngine.prototype.getGlyph = function(piece) {
        return GLYPHS[piece] || '';
    };

    // --- FEN Loading & Export ---
    ChessEngine.prototype.loadFEN = function(fen) {
        var parts = (fen || INITIAL_FEN).split(' ');
        var rows = parts[0].split('/');
        this.initBoard();

        for (var r = 0; r < 8; r++) {
            var col = 0;
            var rowStr = rows[r];
            for (var i = 0; i < rowStr.length; i++) {
                var ch = rowStr.charAt(i);
                var num = parseInt(ch, 10);
                if (!isNaN(num)) {
                    col += num;
                } else {
                    this.board[r][col] = ch;
                    col++;
                }
            }
        }

        this.turn = parts[1] || 'w';

        var castlingStr = parts[2] || '-';
        this.castling = {
            K: castlingStr.indexOf('K') !== -1,
            Q: castlingStr.indexOf('Q') !== -1,
            k: castlingStr.indexOf('k') !== -1,
            q: castlingStr.indexOf('q') !== -1
        };

        var epStr = parts[3] || '-';
        if (epStr !== '-' && epStr.length === 2) {
            var epCol = epStr.charCodeAt(0) - 97; // 'a' -> 0
            var epRow = 8 - parseInt(epStr.charAt(1), 10);
            this.epSquare = { r: epRow, c: epCol };
        } else {
            this.epSquare = null;
        }

        this.halfmoveClock = parseInt(parts[4] || '0', 10);
        this.fullmoveNumber = parseInt(parts[5] || '1', 10);
        this.history = [];
        this.positionCounts = {};
        this.recordPosition();
        this.zobristKey = this.computeZobristKey();
        this.locateKings();
    };

    // Full-board scan for both kings' squares. Only called here (once per
    // FEN load, not a hot path) - during play, makeMoveRaw/undoMoveRaw keep
    // whiteKingPos/blackKingPos incrementally up to date, the same
    // snapshot-restore approach already used for zobristKey, so isCheck's
    // king lookup never needs to re-scan the board.
    ChessEngine.prototype.locateKings = function() {
        this.whiteKingPos = null;
        this.blackKingPos = null;
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                var p = this.board[r][c];
                if (p === 'K') this.whiteKingPos = { r: r, c: c };
                else if (p === 'k') this.blackKingPos = { r: r, c: c };
            }
        }
    };

    ChessEngine.prototype.toFEN = function() {
        var fen = '';
        for (var r = 0; r < 8; r++) {
            var empty = 0;
            for (var c = 0; c < 8; c++) {
                var piece = this.board[r][c];
                if (!piece) {
                    empty++;
                } else {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    fen += piece;
                }
            }
            if (empty > 0) fen += empty;
            if (r < 7) fen += '/';
        }

        fen += ' ' + this.turn + ' ';

        var castling = '';
        if (this.castling.K) castling += 'K';
        if (this.castling.Q) castling += 'Q';
        if (this.castling.k) castling += 'k';
        if (this.castling.q) castling += 'q';
        fen += (castling || '-') + ' ';

        if (this.epSquare) {
            fen += String.fromCharCode(97 + this.epSquare.c) + (8 - this.epSquare.r);
        } else {
            fen += '-';
        }

        fen += ' ' + this.halfmoveClock + ' ' + this.fullmoveNumber;
        return fen;
    };

    ChessEngine.prototype.exportState = function() {
        return {
            fen: this.toFEN(),
            history: this.history.slice(0),
            positionCounts: JSON.parse(JSON.stringify(this.positionCounts)),
            turn: this.turn,
            castling: {
                K: this.castling.K,
                Q: this.castling.Q,
                k: this.castling.k,
                q: this.castling.q
            },
            epSquare: this.epSquare ? { r: this.epSquare.r, c: this.epSquare.c } : null,
            halfmoveClock: this.halfmoveClock,
            fullmoveNumber: this.fullmoveNumber
        };
    };

    ChessEngine.prototype.importState = function(state) {
        if (!state || !state.fen) return;
        this.loadFEN(state.fen);
        if (state.history && state.history instanceof Array) {
            this.history = state.history.slice(0);
        }
        if (state.positionCounts) {
            this.positionCounts = JSON.parse(JSON.stringify(state.positionCounts));
        }
        if (state.castling) {
            this.castling = {
                K: !!state.castling.K,
                Q: !!state.castling.Q,
                k: !!state.castling.k,
                q: !!state.castling.q
            };
        }
        if (state.epSquare) {
            this.epSquare = { r: state.epSquare.r, c: state.epSquare.c };
        } else {
            this.epSquare = null;
        }
        if (typeof state.halfmoveClock === 'number') {
            this.halfmoveClock = state.halfmoveClock;
        }
        if (typeof state.fullmoveNumber === 'number') {
            this.fullmoveNumber = state.fullmoveNumber;
        }
        if (state.turn) {
            this.turn = state.turn;
        }
    };

    ChessEngine.prototype.getPosKey = function() {
        var parts = this.toFEN().split(' ');
        return parts[0] + ' ' + parts[1] + ' ' + parts[2] + ' ' + parts[3];
    };

    ChessEngine.prototype.recordPosition = function() {
        var key = this.getPosKey();
        this.positionCounts[key] = (this.positionCounts[key] || 0) + 1;
    };

    // Computes a 32-bit Zobrist hash identifying the current position
    // (board + side to move + castling rights + en passant file).
    // Recomputed from scratch each call rather than maintained incrementally
    // inside makeMoveRaw/undoMoveRaw: it ties the hash directly to actual
    // board state so it can never drift out of sync with it, at the cost of
    // an O(64) scan per call instead of O(1). That trade-off is intentional —
    // correctness over micro-optimization for a hobby-scale search.
    ChessEngine.prototype.computeZobristKey = function() {
        var key = 0;
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                var piece = this.board[r][c];
                if (piece) {
                    key ^= ZOBRIST_PIECES[piece][r * 8 + c];
                }
            }
        }
        if (this.turn === 'b') key ^= ZOBRIST_SIDE;
        if (this.castling.K) key ^= ZOBRIST_CASTLING.K;
        if (this.castling.Q) key ^= ZOBRIST_CASTLING.Q;
        if (this.castling.k) key ^= ZOBRIST_CASTLING.k;
        if (this.castling.q) key ^= ZOBRIST_CASTLING.q;
        if (this.epSquare) key ^= ZOBRIST_EP_FILE[this.epSquare.c];
        return key;
    };

    // O(1) accessor for the incrementally-maintained hash (kept in sync by
    // makeMoveRaw/undoMoveRaw below). Used by the AI's search hot path,
    // where computeZobristKey()'s O(64) rescan at every node was the single
    // largest avoidable per-node cost.
    ChessEngine.prototype.getZobristKey = function() {
        return this.zobristKey;
    };

    // --- Move Generation ---
    ChessEngine.prototype.isInside = function(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    };

    // O(1): whiteKingPos/blackKingPos are kept up to date incrementally by
    // makeMoveRaw/undoMoveRaw rather than rescanned here. This is the most
    // frequently called lookup in the whole engine (isCheck -> findKing
    // runs once per candidate move tried during search, not once per node
    // searched), so avoiding an O(64) board scan here matters more than
    // almost anywhere else in the codebase.
    ChessEngine.prototype.findKing = function(color) {
        return color === 'w' ? this.whiteKingPos : this.blackKingPos;
    };

    ChessEngine.prototype.isSquareAttacked = function(r, c, attackerColor) {
        var pawnDir = attackerColor === 'w' ? 1 : -1; // Pawns attack downwards if white
        var pawn = attackerColor === 'w' ? 'P' : 'p';
        if (this.isInside(r + pawnDir, c - 1) && this.board[r + pawnDir][c - 1] === pawn) return true;
        if (this.isInside(r + pawnDir, c + 1) && this.board[r + pawnDir][c + 1] === pawn) return true;

        // Knight
        var knightOffsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        var knight = attackerColor === 'w' ? 'N' : 'n';
        for (var i = 0; i < knightOffsets.length; i++) {
            var nr = r + knightOffsets[i][0];
            var nc = c + knightOffsets[i][1];
            if (this.isInside(nr, nc) && this.board[nr][nc] === knight) return true;
        }

        // Bishop / Queen diagonals
        var diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        var bishop = attackerColor === 'w' ? 'B' : 'b';
        var queen = attackerColor === 'w' ? 'Q' : 'q';
        for (var d = 0; d < diagDirs.length; d++) {
            var dr = diagDirs[d][0];
            var dc = diagDirs[d][1];
            var step = 1;
            while (true) {
                var tr = r + dr * step;
                var tc = c + dc * step;
                if (!this.isInside(tr, tc)) break;
                var p = this.board[tr][tc];
                if (p) {
                    if (p === bishop || p === queen) return true;
                    break;
                }
                step++;
            }
        }

        // Rook / Queen straights
        var straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        var rook = attackerColor === 'w' ? 'R' : 'r';
        for (var s = 0; s < straightDirs.length; s++) {
            var sr = straightDirs[s][0];
            var sc = straightDirs[s][1];
            var sStep = 1;
            while (true) {
                var strR = r + sr * sStep;
                var strC = c + sc * sStep;
                if (!this.isInside(strR, strC)) break;
                var piece = this.board[strR][strC];
                if (piece) {
                    if (piece === rook || piece === queen) return true;
                    break;
                }
                sStep++;
            }
        }

        // King
        var kingDirs = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        var king = attackerColor === 'w' ? 'K' : 'k';
        for (var k = 0; k < kingDirs.length; k++) {
            var kr = r + kingDirs[k][0];
            var kc = c + kingDirs[k][1];
            if (this.isInside(kr, kc) && this.board[kr][kc] === king) return true;
        }

        return false;
    };

    ChessEngine.prototype.isCheck = function(color) {
        var kPos = this.findKing(color);
        if (!kPos) return false;
        var enemy = color === 'w' ? 'b' : 'w';
        return this.isSquareAttacked(kPos.r, kPos.c, enemy);
    };

    ChessEngine.prototype.getPseudoMoves = function(r, c) {
        var piece = this.board[r][c];
        if (!piece) return [];
        var color = this.getColor(piece);
        var enemyColor = color === 'w' ? 'b' : 'w';
        var pType = piece.toUpperCase();
        var moves = [];

        // Plain closure over `self` instead of addMove.bind(this): getPseudoMoves
        // runs once per piece on every search node, and .bind() allocates a new
        // bound-function object every call purely to carry `this` - a plain
        // closure captures it for free with identical behavior.
        var self = this;
        var addMove = function(toR, toC, isCapture, promo, isEp, isCastle) {
            moves.push({
                from: { r: r, c: c },
                to: { r: toR, c: toC },
                piece: piece,
                captured: isEp ? (color === 'w' ? 'p' : 'P') : (self.board[toR][toC] || null),
                promotion: promo || null,
                isEnPassant: !!isEp,
                isCastling: !!isCastle
            });
        };

        // --- PAWN ---
        if (pType === 'P') {
            var fwd = color === 'w' ? -1 : 1;
            var startRank = color === 'w' ? 6 : 1;
            var promoRank = color === 'w' ? 0 : 7;

            // 1 step forward
            var nxtR = r + fwd;
            if (this.isInside(nxtR, c) && !this.board[nxtR][c]) {
                if (nxtR === promoRank) {
                    var promos = color === 'w' ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
                    for (var pr = 0; pr < promos.length; pr++) {
                        addMove(nxtR, c, false, promos[pr], false, false);
                    }
                } else {
                    addMove(nxtR, c, false, null, false, false);

                    // 2 steps forward
                    var nxtR2 = r + fwd * 2;
                    if (r === startRank && !this.board[nxtR2][c]) {
                        addMove(nxtR2, c, false, null, false, false);
                    }
                }
            }

            // Captures
            var capCols = [c - 1, c + 1];
            for (var cc = 0; cc < capCols.length; cc++) {
                var capC = capCols[cc];
                if (this.isInside(nxtR, capC)) {
                    var target = this.board[nxtR][capC];
                    if (target && this.getColor(target) === enemyColor) {
                        if (nxtR === promoRank) {
                            var pList = color === 'w' ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
                            for (var p = 0; p < pList.length; p++) {
                                addMove(nxtR, capC, true, pList[p], false, false);
                            }
                        } else {
                            addMove(nxtR, capC, true, null, false, false);
                        }
                    } else if (this.epSquare && this.epSquare.r === nxtR && this.epSquare.c === capC) {
                        // En Passant
                        addMove(nxtR, capC, true, null, true, false);
                    }
                }
            }
        }

        // --- KNIGHT ---
        else if (pType === 'N') {
            var nOffsets = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            for (var k = 0; k < nOffsets.length; k++) {
                var knR = r + nOffsets[k][0];
                var knC = c + nOffsets[k][1];
                if (this.isInside(knR, knC)) {
                    var knTarget = this.board[knR][knC];
                    if (!knTarget) {
                        addMove(knR, knC, false, null, false, false);
                    } else if (this.getColor(knTarget) === enemyColor) {
                        addMove(knR, knC, true, null, false, false);
                    }
                }
            }
        }

        // --- BISHOP / ROOK / QUEEN ---
        else if (pType === 'B' || pType === 'R' || pType === 'Q') {
            var dirs = [];
            if (pType === 'B' || pType === 'Q') {
                dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
            }
            if (pType === 'R' || pType === 'Q') {
                dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
            }

            for (var d = 0; d < dirs.length; d++) {
                var sDr = dirs[d][0];
                var sDc = dirs[d][1];
                var count = 1;
                while (true) {
                    var slR = r + sDr * count;
                    var slC = c + sDc * count;
                    if (!this.isInside(slR, slC)) break;
                    var slTarget = this.board[slR][slC];
                    if (!slTarget) {
                        addMove(slR, slC, false, null, false, false);
                    } else {
                        if (this.getColor(slTarget) === enemyColor) {
                            addMove(slR, slC, true, null, false, false);
                        }
                        break;
                    }
                    count++;
                }
            }
        }

        // --- KING ---
        else if (pType === 'K') {
            var kDirs = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];
            for (var kd = 0; kd < kDirs.length; kd++) {
                var kgR = r + kDirs[kd][0];
                var kgC = c + kDirs[kd][1];
                if (this.isInside(kgR, kgC)) {
                    var kgTarget = this.board[kgR][kgC];
                    if (!kgTarget) {
                        addMove(kgR, kgC, false, null, false, false);
                    } else if (this.getColor(kgTarget) === enemyColor) {
                        addMove(kgR, kgC, true, null, false, false);
                    }
                }
            }

            // Castling
            if (!this.isCheck(color)) {
                if (color === 'w' && r === 7 && c === 4) {
                    // White Kingside (e1 -> g1)
                    if (this.castling.K && !this.board[7][5] && !this.board[7][6]) {
                        if (!this.isSquareAttacked(7, 5, 'b') && !this.isSquareAttacked(7, 6, 'b')) {
                            addMove(7, 6, false, null, false, true);
                        }
                    }
                    // White Queenside (e1 -> c1)
                    if (this.castling.Q && !this.board[7][3] && !this.board[7][2] && !this.board[7][1]) {
                        if (!this.isSquareAttacked(7, 3, 'b') && !this.isSquareAttacked(7, 2, 'b')) {
                            addMove(7, 2, false, null, false, true);
                        }
                    }
                } else if (color === 'b' && r === 0 && c === 4) {
                    // Black Kingside (e8 -> g8)
                    if (this.castling.k && !this.board[0][5] && !this.board[0][6]) {
                        if (!this.isSquareAttacked(0, 5, 'w') && !this.isSquareAttacked(0, 6, 'w')) {
                            addMove(0, 6, false, null, false, true);
                        }
                    }
                    // Black Queenside (e8 -> c8)
                    if (this.castling.q && !this.board[0][3] && !this.board[0][2] && !this.board[0][1]) {
                        if (!this.isSquareAttacked(0, 3, 'w') && !this.isSquareAttacked(0, 2, 'w')) {
                            addMove(0, 2, false, null, false, true);
                        }
                    }
                }
            }
        }

        return moves;
    };

    ChessEngine.prototype.getLegalMoves = function(r, c) {
        var piece = this.board[r][c];
        if (!piece || this.getColor(piece) !== this.turn) return [];

        var pseudo = this.getPseudoMoves(r, c);
        var legal = [];
        var color = this.turn;

        for (var i = 0; i < pseudo.length; i++) {
            var move = pseudo[i];
            this.makeMoveRaw(move);
            if (!this.isCheck(color)) {
                legal.push(move);
            }
            this.undoMoveRaw(move);
        }

        return legal;
    };

    ChessEngine.prototype.getAllLegalMoves = function(color) {
        color = color || this.turn;
        var allMoves = [];
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                var piece = this.board[r][c];
                if (piece && this.getColor(piece) === color) {
                    var moves = this.getLegalMoves(r, c);
                    for (var m = 0; m < moves.length; m++) {
                        allMoves.push(moves[m]);
                    }
                }
            }
        }
        return allMoves;
    };

    // Pseudo-legal moves only (does NOT filter out moves that leave the
    // mover's own king in check). Intended for hot search loops (AI minimax/
    // quiescence) that need to test-and-discard illegal moves themselves via
    // makeMoveRaw + isCheck + undoMoveRaw as part of descending into the
    // move anyway — that avoids doing the make/unmake pass twice per move
    // (once to filter, once to actually search) the way getAllLegalMoves +
    // getLegalMoves does. UI code (click handling, hint rendering, checkmate/
    // stalemate detection) should keep using getLegalMoves/getAllLegalMoves,
    // which are fully filtered and called far less often.
    ChessEngine.prototype.getPseudoLegalMovesForColor = function(color) {
        color = color || this.turn;
        var allMoves = [];
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                var piece = this.board[r][c];
                if (piece && this.getColor(piece) === color) {
                    var moves = this.getPseudoMoves(r, c);
                    for (var m = 0; m < moves.length; m++) {
                        allMoves.push(moves[m]);
                    }
                }
            }
        }
        return allMoves;
    };

    // --- Execution of Moves ---
    ChessEngine.prototype.makeMoveRaw = function(move) {
        var fromR = move.from.r;
        var fromC = move.from.c;
        var toR = move.to.r;
        var toC = move.to.c;
        var piece = this.board[fromR][fromC];

        move.prevCastling = { K: this.castling.K, Q: this.castling.Q, k: this.castling.k, q: this.castling.q };
        move.prevEp = this.epSquare;
        move.prevWhiteKingPos = this.whiteKingPos;
        move.prevBlackKingPos = this.blackKingPos;
        if (piece === 'K') {
            this.whiteKingPos = { r: toR, c: toC };
        } else if (piece === 'k') {
            this.blackKingPos = { r: toR, c: toC };
        }
        move.prevHalfmove = this.halfmoveClock;
        move.prevFullmove = this.fullmoveNumber;
        // Snapshot-restore, not reverse-computed: undoMoveRaw just puts this
        // back verbatim, so there's no separate "undo the hash" arithmetic
        // that could drift out of sync with the "apply the hash" arithmetic
        // below - the only place the key is actually computed is here.
        move.prevZobristKey = this.zobristKey;

        this.zobristKey ^= ZOBRIST_PIECES[piece][fromR * 8 + fromC];
        this.board[fromR][fromC] = null;

        // En passant capture
        if (move.isEnPassant) {
            var epCapR = piece === 'P' ? toR + 1 : toR - 1;
            this.zobristKey ^= ZOBRIST_PIECES[move.captured][epCapR * 8 + toC];
            this.board[epCapR][toC] = null;
        } else if (move.captured) {
            // Normal capture: whatever's on the destination square is about
            // to be overwritten below, so remove it from the hash now.
            this.zobristKey ^= ZOBRIST_PIECES[move.captured][toR * 8 + toC];
        }

        // Promotion
        if (move.promotion) {
            this.zobristKey ^= ZOBRIST_PIECES[move.promotion][toR * 8 + toC];
            this.board[toR][toC] = move.promotion;
        } else {
            this.zobristKey ^= ZOBRIST_PIECES[piece][toR * 8 + toC];
            this.board[toR][toC] = piece;
        }

        // Castling rook move
        if (move.isCastling) {
            if (toR === 7 && toC === 6) { // White 0-0
                this.zobristKey ^= ZOBRIST_PIECES['R'][7 * 8 + 7];
                this.zobristKey ^= ZOBRIST_PIECES['R'][7 * 8 + 5];
                this.board[7][5] = 'R';
                this.board[7][7] = null;
            } else if (toR === 7 && toC === 2) { // White 0-0-0
                this.zobristKey ^= ZOBRIST_PIECES['R'][7 * 8 + 0];
                this.zobristKey ^= ZOBRIST_PIECES['R'][7 * 8 + 3];
                this.board[7][3] = 'R';
                this.board[7][0] = null;
            } else if (toR === 0 && toC === 6) { // Black 0-0
                this.zobristKey ^= ZOBRIST_PIECES['r'][0 * 8 + 7];
                this.zobristKey ^= ZOBRIST_PIECES['r'][0 * 8 + 5];
                this.board[0][5] = 'r';
                this.board[0][7] = null;
            } else if (toR === 0 && toC === 2) { // Black 0-0-0
                this.zobristKey ^= ZOBRIST_PIECES['r'][0 * 8 + 0];
                this.zobristKey ^= ZOBRIST_PIECES['r'][0 * 8 + 3];
                this.board[0][3] = 'r';
                this.board[0][0] = null;
            }
        }

        // Update castling rights. Each clear is guarded by "was it still
        // true" so the XOR only fires on an actual true->false transition -
        // makes this safe/idempotent even though several of these
        // conditions can apply to the same move (e.g. a king move trips
        // both the piece==='K' rule and, if it started on e1, nothing else;
        // capturing a rook on its home square trips one of the to*/from*
        // rules independently of who moved).
        if (piece === 'K') {
            if (this.castling.K) { this.zobristKey ^= ZOBRIST_CASTLING.K; this.castling.K = false; }
            if (this.castling.Q) { this.zobristKey ^= ZOBRIST_CASTLING.Q; this.castling.Q = false; }
        }
        if (piece === 'k') {
            if (this.castling.k) { this.zobristKey ^= ZOBRIST_CASTLING.k; this.castling.k = false; }
            if (this.castling.q) { this.zobristKey ^= ZOBRIST_CASTLING.q; this.castling.q = false; }
        }
        if (fromR === 7 && fromC === 0 && this.castling.Q) { this.zobristKey ^= ZOBRIST_CASTLING.Q; this.castling.Q = false; }
        if (fromR === 7 && fromC === 7 && this.castling.K) { this.zobristKey ^= ZOBRIST_CASTLING.K; this.castling.K = false; }
        if (fromR === 0 && fromC === 0 && this.castling.q) { this.zobristKey ^= ZOBRIST_CASTLING.q; this.castling.q = false; }
        if (fromR === 0 && fromC === 7 && this.castling.k) { this.zobristKey ^= ZOBRIST_CASTLING.k; this.castling.k = false; }
        if (toR === 7 && toC === 0 && this.castling.Q) { this.zobristKey ^= ZOBRIST_CASTLING.Q; this.castling.Q = false; }
        if (toR === 7 && toC === 7 && this.castling.K) { this.zobristKey ^= ZOBRIST_CASTLING.K; this.castling.K = false; }
        if (toR === 0 && toC === 0 && this.castling.q) { this.zobristKey ^= ZOBRIST_CASTLING.q; this.castling.q = false; }
        if (toR === 0 && toC === 7 && this.castling.k) { this.zobristKey ^= ZOBRIST_CASTLING.k; this.castling.k = false; }

        // Set en passant square
        if (this.epSquare) {
            this.zobristKey ^= ZOBRIST_EP_FILE[this.epSquare.c];
        }
        if (piece.toUpperCase() === 'P' && Math.abs(toR - fromR) === 2) {
            this.epSquare = { r: (fromR + toR) / 2, c: fromC };
            this.zobristKey ^= ZOBRIST_EP_FILE[this.epSquare.c];
        } else {
            this.epSquare = null;
        }

        // 50-move clock
        if (piece.toUpperCase() === 'P' || move.captured) {
            this.halfmoveClock = 0;
        } else {
            this.halfmoveClock++;
        }

        if (this.turn === 'b') {
            this.fullmoveNumber++;
        }

        this.turn = this.turn === 'w' ? 'b' : 'w';
        this.zobristKey ^= ZOBRIST_SIDE;
    };

    ChessEngine.prototype.undoMoveRaw = function(move) {
        this.turn = this.turn === 'w' ? 'b' : 'w';

        var fromR = move.from.r;
        var fromC = move.from.c;
        var toR = move.to.r;
        var toC = move.to.c;

        this.board[fromR][fromC] = move.piece;
        this.board[toR][toC] = move.captured && !move.isEnPassant ? move.captured : null;

        if (move.isEnPassant) {
            var epCapR = move.piece === 'P' ? toR + 1 : toR - 1;
            this.board[epCapR][toC] = move.captured;
        }

        if (move.isCastling) {
            if (toR === 7 && toC === 6) {
                this.board[7][7] = 'R';
                this.board[7][5] = null;
            } else if (toR === 7 && toC === 2) {
                this.board[7][0] = 'R';
                this.board[7][3] = null;
            } else if (toR === 0 && toC === 6) {
                this.board[0][7] = 'r';
                this.board[0][5] = null;
            } else if (toR === 0 && toC === 2) {
                this.board[0][0] = 'r';
                this.board[0][3] = null;
            }
        }

        this.castling = move.prevCastling;
        this.epSquare = move.prevEp;
        this.whiteKingPos = move.prevWhiteKingPos;
        this.blackKingPos = move.prevBlackKingPos;
        this.halfmoveClock = move.prevHalfmove;
        this.fullmoveNumber = move.prevFullmove;
        this.zobristKey = move.prevZobristKey;
    };

    ChessEngine.prototype.makeMove = function(move) {
        var san = this.moveToSAN(move);
        move.san = san;
        this.makeMoveRaw(move);
        this.history.push(move);
        this.recordPosition();
        return move;
    };

    ChessEngine.prototype.undoMove = function() {
        if (this.history.length === 0) return null;
        var key = this.getPosKey();
        if (this.positionCounts[key]) {
            this.positionCounts[key]--;
            if (this.positionCounts[key] <= 0) delete this.positionCounts[key];
        }

        var move = this.history.pop();
        this.undoMoveRaw(move);
        return move;
    };

    // --- SAN (Standard Algebraic Notation) ---
    ChessEngine.prototype.coordsToAlgebraic = function(r, c) {
        return String.fromCharCode(97 + c) + (8 - r);
    };

    ChessEngine.prototype.moveToSAN = function(move) {
        if (move.isCastling) {
            return (move.to.c === 6) ? 'O-O' : 'O-O-O';
        }

        var piece = move.piece.toUpperCase();
        var fromAlg = this.coordsToAlgebraic(move.from.r, move.from.c);
        var toAlg = this.coordsToAlgebraic(move.to.r, move.to.c);
        var isCap = !!move.captured;

        var san = '';
        if (piece === 'P') {
            if (isCap) {
                san = fromAlg.charAt(0) + 'x' + toAlg;
            } else {
                san = toAlg;
            }
            if (move.promotion) {
                san += '=' + move.promotion.toUpperCase();
            }
        } else {
            san = piece + (isCap ? 'x' : '') + toAlg;
        }

        // Test if check/checkmate
        this.makeMoveRaw(move);
        var enemy = this.turn;
        if (this.isCheck(enemy)) {
            var oppMoves = this.getAllLegalMoves(enemy);
            if (oppMoves.length === 0) {
                san += '#';
            } else {
                san += '+';
            }
        }
        this.undoMoveRaw(move);

        return san;
    };

    // --- Game Status Evaluation ---
    ChessEngine.prototype.isCheckmate = function() {
        return this.isCheck(this.turn) && this.getAllLegalMoves(this.turn).length === 0;
    };

    ChessEngine.prototype.isStalemate = function() {
        return !this.isCheck(this.turn) && this.getAllLegalMoves(this.turn).length === 0;
    };

    ChessEngine.prototype.isThreefoldRepetition = function() {
        var key = this.getPosKey();
        return (this.positionCounts[key] || 0) >= 3;
    };

    ChessEngine.prototype.isFiftyMoveRule = function() {
        return this.halfmoveClock >= 100; // 50 moves per side = 100 halfmoves
    };

    ChessEngine.prototype.isInsufficientMaterial = function() {
        var pieces = [];
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                var p = this.board[r][c];
                if (p) pieces.push(p.toUpperCase());
            }
        }
        if (pieces.length === 2) return true; // K vs K
        if (pieces.length === 3 && (pieces.indexOf('B') !== -1 || pieces.indexOf('N') !== -1)) return true; // K+B vs K or K+N vs K
        return false;
    };

    ChessEngine.prototype.isGameOver = function() {
        if (this.isCheckmate()) return { over: true, result: 'checkmate', winner: this.turn === 'w' ? 'b' : 'w' };
        if (this.isStalemate()) return { over: true, result: 'stalemate', winner: null };
        if (this.isThreefoldRepetition()) return { over: true, result: 'threefold', winner: null };
        if (this.isFiftyMoveRule()) return { over: true, result: 'fifty_moves', winner: null };
        if (this.isInsufficientMaterial()) return { over: true, result: 'insufficient_material', winner: null };
        return { over: false, result: null, winner: null };
    };

    ChessEngine.prototype.getCapturedPieces = function() {
        var capturedW = [];
        var capturedB = [];

        if (this.history && this.history.length > 0) {
            for (var i = 0; i < this.history.length; i++) {
                var m = this.history[i];
                if (m.captured) {
                    if (this.isWhite(m.captured)) {
                        capturedW.push(m.captured);
                    } else {
                        capturedB.push(m.captured);
                    }
                }
            }
        } else {
            // Calculate missing pieces from standard starting set
            var counts = { 'P': 8, 'N': 2, 'B': 2, 'R': 2, 'Q': 1, 'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1 };
            for (var r = 0; r < 8; r++) {
                for (var c = 0; c < 8; c++) {
                    var p = this.board[r][c];
                    if (p && counts[p] !== undefined) {
                        counts[p]--;
                    }
                }
            }
            var piecesList = ['Q', 'R', 'B', 'N', 'P', 'q', 'r', 'b', 'n', 'p'];
            for (var k = 0; k < piecesList.length; k++) {
                var sym = piecesList[k];
                var missing = counts[sym];
                while (missing > 0) {
                    if (this.isWhite(sym)) {
                        capturedW.push(sym);
                    } else {
                        capturedB.push(sym);
                    }
                    missing--;
                }
            }
        }

        var order = { 'Q': 1, 'R': 2, 'B': 3, 'N': 4, 'P': 5, 'q': 1, 'r': 2, 'b': 3, 'n': 4, 'p': 5 };
        capturedW.sort(function(a, b) { return (order[a] || 99) - (order[b] || 99); });
        capturedB.sort(function(a, b) { return (order[a] || 99) - (order[b] || 99); });

        return {
            white: capturedW,
            black: capturedB
        };
    };

    root.ChessEngine = ChessEngine;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ChessEngine;
    }

})(typeof window !== 'undefined' ? window : this);
