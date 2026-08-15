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

    var OPENING_BOOK = {
        // --- 1. WHITE'S FIRST MOVES ---
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': [
            { rFrom: 6, cFrom: 4, rTo: 4, cTo: 4 }, // e4 (King's Pawn)
            { rFrom: 6, cFrom: 3, rTo: 4, cTo: 3 }  // d4 (Queen's Pawn)
        ],

        // --- 2. BLACK'S RESPONSES TO WHITE'S FIRST MOVES ---
        // White plays 1. e4 -> Black counters with Sicilian (c5) or French (e6) or e5
        'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3': [
            { rFrom: 1, cFrom: 2, rTo: 3, cTo: 2 }, // c5 (Sicilian Defense - counter attack)
            { rFrom: 1, cFrom: 4, rTo: 3, cTo: 4 }, // e5 (Open Game - solid)
            { rFrom: 1, cFrom: 4, rTo: 2, cTo: 4 }  // e6 (French Defense - solid counter)
        ],
        // White plays 1. d4 -> Black counters with Indian Defense (Nf6) or d5
        'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3': [
            { rFrom: 0, cFrom: 6, rTo: 2, cTo: 5 }, // Nf6 (Indian Defense)
            { rFrom: 1, cFrom: 3, rTo: 3, cTo: 3 }  // d5 (Closed Game)
        ],
        // White plays 1. c4 (English Opening) -> Black counters with e5 or c5
        'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3': [
            { rFrom: 1, cFrom: 4, rTo: 3, cTo: 4 }, // e5 (Reversed Sicilian)
            { rFrom: 1, cFrom: 2, rTo: 3, cTo: 2 }  // c5 (Symmetrical)
        ],
        // White plays 1. Nf3 (Reti Opening) -> Black counters with d5 or Nf6
        'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq -': [
            { rFrom: 1, cFrom: 3, rTo: 3, cTo: 3 }, // d5
            { rFrom: 0, cFrom: 6, rTo: 2, cTo: 5 }  // Nf6
        ],

        // --- 3. WHITE'S COUNTERS TO BLACK'S DEFENSES ---
        // Black played 1... c5 (Sicilian) -> White counters with 2. Nf3 or Nc3
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6': [
            { rFrom: 7, cFrom: 6, rTo: 5, cTo: 5 }, // Nf3 (Open Sicilian path)
            { rFrom: 7, cFrom: 1, rTo: 5, cTo: 2 }  // Nc3 (Closed Sicilian path)
        ],
        // Black played 1... e5 -> White plays 2. Nf3 (attacking e5)
        'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6': [
            { rFrom: 7, cFrom: 6, rTo: 5, cTo: 5 }  // Nf3
        ],
        // Black played 1... e6 (French) -> White plays 2. d4 (taking center)
        'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': [
            { rFrom: 6, cFrom: 3, rTo: 4, cTo: 3 }  // d4
        ],
        // Black played 1... Nf6 (Indian) -> White plays 2. c4 (controlling d5)
        'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -': [
            { rFrom: 6, cFrom: 2, rTo: 4, cTo: 2 }  // c4
        ],
        // Black played 1... d5 -> White plays 2. c4 (Queen's Gambit) or 2. Nf3
        'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6': [
            { rFrom: 6, cFrom: 2, rTo: 4, cTo: 2 }, // c4 (Queen's Gambit)
            { rFrom: 7, cFrom: 6, rTo: 5, cTo: 5 }  // Nf3
        ],

        // --- 4. BLACK'S CONTINUATIONS ---
        // 1. e4 e5 2. Nf3 -> Black counters with 2... Nc6 (defending e5)
        'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -': [
            { rFrom: 0, cFrom: 1, rTo: 2, cTo: 2 }  // Nc6
        ],
        // 1. e4 c5 2. Nf3 -> Black continues with 2... d6 or 2... Nc6
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -': [
            { rFrom: 1, cFrom: 3, rTo: 2, cTo: 3 }, // d6 (Najdorf/Dragon path)
            { rFrom: 0, cFrom: 1, rTo: 2, cTo: 2 }  // Nc6
        ],
        // 1. d4 d5 2. c4 -> Black plays 2... e6 (QGD) or 2... c6 (Slav)
        'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3': [
            { rFrom: 1, cFrom: 4, rTo: 2, cTo: 4 }, // e6 (Queen's Gambit Declined)
            { rFrom: 1, cFrom: 2, rTo: 2, cTo: 2 }  // c6 (Slav Defense)
        ]
    };

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

    var PST_KING_END = [
        [-50,-40,-30,-20,-20,-30,-40,-50],
        [-30,-20,-10,  0,  0,-10,-20,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-30,  0,  0,  0,  0,-30,-30],
        [-50,-30,-30,-30,-30,-30,-30,-50]
    ];

    function ChessAI(level) {
        this.level = level || 1; // 1, 2, or 3
    }

    ChessAI.prototype.getOpeningMove = function(engine) {
        var posKey = engine.getPosKey();
        var bookMoves = OPENING_BOOK[posKey];
        if (bookMoves && bookMoves.length > 0) {
            // Pick a random move from the book
            var moveData = bookMoves[Math.floor(Math.random() * bookMoves.length)];
            
            // Map our simple book object to engine's actual move object
            var legalMoves = engine.getAllLegalMoves(engine.turn);
            for (var i = 0; i < legalMoves.length; i++) {
                var m = legalMoves[i];
                if (m.from.r === moveData.rFrom && m.from.c === moveData.cFrom && 
                    m.to.r === moveData.rTo && m.to.c === moveData.cTo) {
                    return m;
                }
            }
        }
        return null;
    };

    ChessAI.prototype.orderMoves = function(moves) {
        // MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
        moves.sort(function(a, b) {
            var scoreA = 0;
            var scoreB = 0;
            if (a.captured) {
                var valA = Math.abs(PIECE_VALUES[a.captured] || 0);
                var attA = Math.abs(PIECE_VALUES[a.piece] || 0);
                scoreA = 10 * valA - attA; // Tốt ăn Hậu = 9000 - 100 = 8900. Hậu ăn Hậu = 9000 - 900 = 8100
            }
            if (b.captured) {
                var valB = Math.abs(PIECE_VALUES[b.captured] || 0);
                var attB = Math.abs(PIECE_VALUES[b.piece] || 0);
                scoreB = 10 * valB - attB;
            }
            // Promotion is also highly prioritized
            if (a.promotion) scoreA += 9000;
            if (b.promotion) scoreB += 9000;
            
            return scoreB - scoreA;
        });
        return moves;
    };

    ChessAI.prototype.evaluatePosition = function(engine) {
        var score = 0;
        var whiteMaterial = 0;
        var blackMaterial = 0;

        // Calculate material to determine if it's endgame
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                var p = engine.board[r][c];
                if (!p) continue;
                var val = Math.abs(PIECE_VALUES[p] || 0);
                var pType = p.toUpperCase();
                // Exclude pawns and kings from material count for endgame phase detection
                if (pType !== 'P' && pType !== 'K') {
                    if (p === pType) whiteMaterial += val;
                    else blackMaterial += val;
                }
            }
        }
        
        var isEndgame = whiteMaterial < 1500 && blackMaterial < 1500;

        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                var p = engine.board[r][c];
                if (!p) continue;

                var val = PIECE_VALUES[p] || 0;
                var pType = p.toUpperCase();
                var isW = p === pType;
                var pstVal = 0;

                var evalRow = isW ? r : 7 - r;
                var evalCol = c; // Fixed bug: PST are mostly symmetrical, don't mirror column for black.

                if (pType === 'P') pstVal = PST_PAWN[evalRow][evalCol];
                else if (pType === 'N') pstVal = PST_KNIGHT[evalRow][evalCol];
                else if (pType === 'B') pstVal = PST_BISHOP[evalRow][evalCol];
                else if (pType === 'R') pstVal = PST_ROOK[evalRow][evalCol];
                else if (pType === 'Q') pstVal = PST_QUEEN[evalRow][evalCol];
                else if (pType === 'K') {
                    pstVal = isEndgame ? PST_KING_END[evalRow][evalCol] : PST_KING_MID[evalRow][evalCol];
                }

                score += isW ? (val + pstVal) : (val - pstVal);
            }
        }
        return score;
    };

    ChessAI.prototype.quiescence = function(engine, alpha, beta, isMaximizing, qDepth) {
        var standPat = this.evaluatePosition(engine);
        
        if (isMaximizing) {
            if (standPat >= beta) return beta;
            if (standPat > alpha) alpha = standPat;
        } else {
            if (standPat <= alpha) return alpha;
            if (standPat < beta) beta = standPat;
        }

        if (qDepth <= 0) {
            return standPat;
        }

        var moves = engine.getAllLegalMoves(engine.turn);
        // Only evaluate capture moves and promotions
        var captureMoves = [];
        for (var k=0; k<moves.length; k++) {
            if (moves[k].captured || moves[k].promotion) {
                captureMoves.push(moves[k]);
            }
        }
        captureMoves = this.orderMoves(captureMoves);

        if (isMaximizing) {
            var maxEval = standPat;
            for (var i = 0; i < captureMoves.length; i++) {
                engine.makeMoveRaw(captureMoves[i]);
                var evalScore = this.quiescence(engine, alpha, beta, false, qDepth - 1);
                engine.undoMoveRaw(captureMoves[i]);

                if (evalScore > maxEval) maxEval = evalScore;
                if (evalScore > alpha) alpha = evalScore;
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            var minEval = standPat;
            for (var j = 0; j < captureMoves.length; j++) {
                engine.makeMoveRaw(captureMoves[j]);
                var evalScoreMin = this.quiescence(engine, alpha, beta, true, qDepth - 1);
                engine.undoMoveRaw(captureMoves[j]);

                if (evalScoreMin < minEval) minEval = evalScoreMin;
                if (evalScoreMin < beta) beta = evalScoreMin;
                if (beta <= alpha) break;
            }
            return minEval;
        }
    };

    ChessAI.prototype.minimax = function(engine, depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            // For level 3, we use quiescence search to avoid horizon effect
            if (this.level === 3) {
                return this.quiescence(engine, alpha, beta, isMaximizing, 4); // Max 4 plies of quiescence
            } else {
                return this.evaluatePosition(engine);
            }
        }

        var moves = engine.getAllLegalMoves(engine.turn);
        if (moves.length === 0) {
            if (engine.isCheck(engine.turn)) {
                return isMaximizing ? -30000 + (10 - depth) : 30000 - (10 - depth);
            }
            return 0; // Stalemate
        }

        // Move ordering: Prioritize captures with MVV-LVA
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
        // Try opening book first
        if (this.level === 3) {
            var bookMove = this.getOpeningMove(engine);
            if (bookMove) return bookMove;
        }

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
        
        // Also apply MVV-LVA on top of shuffle at the root for better alpha-beta pruning
        moves = this.orderMoves(moves);

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
