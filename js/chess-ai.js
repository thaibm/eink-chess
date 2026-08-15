/**
 * ====================================================================
 * CHESS AI (LOCAL MINIMAX — ES5 COMPLIANT) — EinkChess
 * Offline AI engine with Alpha-Beta pruning & Piece-Square Tables (PST)
 * Level 1: Beginner (~600 ELO)
 * Level 2: Casual (~1100 ELO)
 * Level 3: Club (~1600 ELO)
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
        this.nodes = 0; // For debugging/stats
    }

    ChessAI.prototype.evaluatePosition = function(engine) {
        var score = 0;
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                var p = engine.board[r][c];
                if (!p) continue;

                var val = Math.abs(PIECE_VALUES[p]) || 0;
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

                score += isW ? (val + pstVal) : -(val + pstVal);
            }
        }
        return score;
    };

    // MVV-LVA Move Ordering
    ChessAI.prototype.orderMoves = function(moves) {
        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            var score = 0;
            if (move.captured) {
                var victimValue = Math.abs(PIECE_VALUES[move.captured] || 0);
                var attackerValue = Math.abs(PIECE_VALUES[move.piece] || 0);
                // MVV-LVA score: 10 * Victim - Attacker
                score = 10 * victimValue - attackerValue;
            }
            if (move.promotion) {
                score += Math.abs(PIECE_VALUES[move.promotion] || 0);
            }
            move.sortScore = score;
        }
        moves.sort(function(a, b) {
            return b.sortScore - a.sortScore;
        });
        return moves;
    };

    ChessAI.prototype.quiescenceSearch = function(engine, alpha, beta, isMaximizing) {
        this.nodes++;
        var standPat = this.evaluatePosition(engine);

        if (isMaximizing) {
            if (standPat >= beta) return beta;
            if (alpha < standPat) alpha = standPat;
        } else {
            if (standPat <= alpha) return alpha;
            if (beta > standPat) beta = standPat;
        }

        var moves = engine.getAllLegalMoves(engine.turn);
        var captureMoves = [];
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].captured || moves[i].promotion) {
                captureMoves.push(moves[i]);
            }
        }
        captureMoves = this.orderMoves(captureMoves);

        if (isMaximizing) {
            for (var j = 0; j < captureMoves.length; j++) {
                engine.makeMoveRaw(captureMoves[j]);
                var score = this.quiescenceSearch(engine, alpha, beta, false);
                engine.undoMoveRaw(captureMoves[j]);

                if (score >= beta) return beta;
                if (score > alpha) alpha = score;
            }
            return alpha;
        } else {
            for (var k = 0; k < captureMoves.length; k++) {
                engine.makeMoveRaw(captureMoves[k]);
                var scoreMin = this.quiescenceSearch(engine, alpha, beta, true);
                engine.undoMoveRaw(captureMoves[k]);

                if (scoreMin <= alpha) return alpha;
                if (scoreMin < beta) beta = scoreMin;
            }
            return beta;
        }
    };

    ChessAI.prototype.minimax = function(engine, depth, alpha, beta, isMaximizing) {
        this.nodes++;
        if (depth === 0) {
            return this.quiescenceSearch(engine, alpha, beta, isMaximizing);
        }

        var moves = engine.getAllLegalMoves(engine.turn);
        if (moves.length === 0) {
            if (engine.isCheck(engine.turn)) {
                return isMaximizing ? -30000 + (10 - depth) : 30000 - (10 - depth);
            }
            return 0; // Stalemate
        }

        moves = this.orderMoves(moves);

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
        this.nodes = 0;
        var moves = engine.getAllLegalMoves(engine.turn);
        if (moves.length === 0) return null;

        var isMaximizing = engine.turn === 'w';
        var depth = 1;
        var noise = 0;

        if (this.level === 1) {
            depth = 2;
            noise = 50; // Beginner (~800)
        } else if (this.level === 2) {
            depth = 2;
            noise = 10; // Novice (~1000)
        } else if (this.level === 3) {
            depth = 3;
            noise = 15; // Casual (~1200)
        } else if (this.level === 4) {
            depth = 3;
            noise = 5;  // Intermediate (~1400)
        } else if (this.level === 5) {
            depth = 3;
            noise = 0;  // Club (Accurate ~1600)
        }

        var bestMove = null;
        var bestScore = isMaximizing ? -999999 : 999999;

        // Shuffle moves to avoid repetitive games, then apply MVV-LVA
        moves.sort(function() { return 0.5 - Math.random(); });
        moves = this.orderMoves(moves);

        var alpha = -999999;
        var beta = 999999;

        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            engine.makeMoveRaw(move);
            var score = this.minimax(engine, depth - 1, alpha, beta, !isMaximizing);
            engine.undoMoveRaw(move);

            if (noise > 0) {
                score += (Math.random() * noise * 2) - noise;
            }

            if (isMaximizing) {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                if (score > alpha) alpha = score;
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                if (score < beta) beta = score;
            }
        }
        
        console.log('AI Level ' + this.level + ' searched ' + this.nodes + ' nodes. Best score: ' + bestScore);
        return bestMove;
    };

    root.ChessAI = ChessAI;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ChessAI;
    }

})(typeof window !== 'undefined' ? window : this);
