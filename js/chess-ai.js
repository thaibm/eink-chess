/**
 * ====================================================================
 * CHESS AI (LOCAL MINIMAX — ES5 COMPLIANT) — EinkChess
 * Offline AI engine with Alpha-Beta pruning & Piece-Square Tables (PST)
 * Level 1: Beginner (~400 ELO)
 * Level 2: Casual (~800 ELO)
 * Level 3: Club (~1200 ELO)
 * 100% Free & Unlimited on Client
 * ====================================================================
 */

(function(root) {
    'use strict';

    var PIECE_VALUES = {
        'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000,
        'p': -100, 'n': -320, 'b': -330, 'r': -500, 'q': -900, 'k': -20000
    };

    // Piece-Square Tables for positional evaluation (from White's perspective)
    var PST_PAWN = [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5,  5, 10, 25, 25, 10,  5,  5],
        [0,  0,  0, 20, 20,  0,  0,  0],
        [5, -5,-10,  0,  0,-10, -5,  5],
        [5, 10, 10,-20,-20, 10, 10,  5],
        [0,  0,  0,  0,  0,  0,  0,  0]
    ];

    var PST_KNIGHT = [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
    ];

    var PST_BISHOP = [
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
    ];

    var PST_ROOK = [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [5, 10, 10, 10, 10, 10, 10,  5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [0,  0,  0,  5,  5,  0,  0,  0]
    ];

    var PST_QUEEN = [
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [-5,  0,  5,  5,  5,  5,  0, -5],
        [0,  0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
    ];

    var PST_KING_MID = [
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [20, 20,  0,  0,  0,  0, 20, 20],
        [20, 30, 10,  0,  0, 10, 30, 20]
    ];

    function ChessAI(level) {
        this.level = level || 1; // 1, 2, or 3
    }

    ChessAI.prototype.evaluatePosition = function(engine) {
        var score = 0;
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                var p = engine.board[r][c];
                if (!p) continue;

                var val = PIECE_VALUES[p] || 0;
                var pType = p.toUpperCase();
                var isW = p === pType;
                var pstVal = 0;

                var evalRow = isW ? r : 7 - r;
                var evalCol = isW ? c : 7 - c;

                if (pType === 'P') pstVal = PST_PAWN[evalRow][evalCol];
                else if (pType === 'N') pstVal = PST_KNIGHT[evalRow][evalCol];
                else if (pType === 'B') pstVal = PST_BISHOP[evalRow][evalCol];
                else if (pType === 'R') pstVal = PST_ROOK[evalRow][evalCol];
                else if (pType === 'Q') pstVal = PST_QUEEN[evalRow][evalCol];
                else if (pType === 'K') pstVal = PST_KING_MID[evalRow][evalCol];

                score += isW ? (val + pstVal) : (val - pstVal);
            }
        }
        return score;
    };

    ChessAI.prototype.minimax = function(engine, depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return this.evaluatePosition(engine);
        }

        var moves = engine.getAllLegalMoves(engine.turn);
        if (moves.length === 0) {
            if (engine.isCheck(engine.turn)) {
                return isMaximizing ? -30000 + (10 - depth) : 30000 - (10 - depth);
            }
            return 0; // Stalemate
        }

        // Move ordering: Prioritize captures
        moves.sort(function(a, b) {
            var valA = a.captured ? Math.abs(PIECE_VALUES[a.captured] || 0) : 0;
            var valB = b.captured ? Math.abs(PIECE_VALUES[b.captured] || 0) : 0;
            return valB - valA;
        });

        if (isMaximizing) {
            var maxEval = -999999;
            for (var i = 0; i < moves.length; i++) {
                engine.makeMoveRaw(moves[i]);
                var evalScore = this.minimax(engine, depth - 1, alpha, beta, false);
                engine.undoMoveRaw(moves[i]);

                if (evalScore > maxEval) maxEval = evalScore;
                if (evalScore > alpha) alpha = evalScore;
                if (beta <= alpha) break; // Beta cut-off
            }
            return maxEval;
        } else {
            var minEval = 999999;
            for (var j = 0; j < moves.length; j++) {
                engine.makeMoveRaw(moves[j]);
                var evalScoreMin = this.minimax(engine, depth - 1, alpha, beta, true);
                engine.undoMoveRaw(moves[j]);

                if (evalScoreMin < minEval) minEval = evalScoreMin;
                if (evalScoreMin < beta) beta = evalScoreMin;
                if (beta <= alpha) break; // Alpha cut-off
            }
            return minEval;
        }
    };

    ChessAI.prototype.getBestMove = function(engine) {
        var moves = engine.getAllLegalMoves(engine.turn);
        if (moves.length === 0) return null;

        var isMaximizing = engine.turn === 'w';
        var depth = 1;
        var noise = 0;

        if (this.level === 1) {
            depth = 1;
            noise = 80; // High randomness
        } else if (this.level === 2) {
            depth = 2;
            noise = 30; // Medium randomness
        } else if (this.level === 3) {
            depth = 3;
            noise = 0;  // Accurate
        }

        var bestMove = null;
        var bestScore = isMaximizing ? -999999 : 999999;

        // Shuffle moves to avoid repetitive games
        moves.sort(function() { return 0.5 - Math.random(); });

        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            engine.makeMoveRaw(move);
            var score = this.minimax(engine, depth - 1, -999999, 999999, !isMaximizing);
            engine.undoMoveRaw(move);

            // Add slight randomness based on level
            if (noise > 0) {
                score += (Math.random() * noise * 2) - noise;
            }

            if (isMaximizing) {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
        }

        return bestMove;
    };

    root.ChessAI = ChessAI;

})(typeof window !== 'undefined' ? window : this);
