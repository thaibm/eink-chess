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

    var DOUBLED_PAWN_PENALTY = 20;
    var ISOLATED_PAWN_PENALTY = 15;
    // Indexed by "squares left to travel to the promotion rank" (1..6 in
    // practice; index 0 is unused since a pawn on the promotion rank has
    // already promoted). Endgame doubles this bonus, per standard passed-
    // pawn theory: an unstoppable runner is often worth more than a piece
    // once major material is off the board.
    var PASSED_PAWN_BONUS = [0, 200, 130, 90, 60, 30, 15, 5];

    // Mate scores are offset by ply-from-root so shorter mates are always
    // preferred over longer ones. MATE_THRESHOLD separates "this is a mate
    // score" from "this is a material/positional eval" — normal evals from
    // this piece-value scale never get anywhere close to it.
    var MATE_SCORE = 100000;
    var MATE_THRESHOLD = 90000;

    // Move-ordering tiers, strictly separated so a tier never overlaps the
    // next (e.g. the weakest capture must still outrank every killer move).
    var ORDER_TT_MOVE = 1000000;
    var ORDER_CAPTURE_BASE = 100000;
    var ORDER_KILLER = 50000;

    // Transposition table: fixed-size, lazily-allocated array (power of two
    // for a cheap bitmask index) so memory stays bounded regardless of how
    // long a game runs — important on Kindle's limited RAM. ~65536 slots at
    // a handful of numeric/reference fields each lands around the ~5MB
    // budget this project's architecture notes call out as acceptable.
    var TT_SIZE = 1 << 16;
    var TT_INDEX_MASK = TT_SIZE - 1;
    var TT_FLAG_EXACT = 0;
    var TT_FLAG_LOWERBOUND = 1;
    var TT_FLAG_UPPERBOUND = 2;

    // Sentinel thrown by checkTime() to unwind the search when the time
    // budget runs out. A dedicated object (not a string/Error) so it can be
    // identified with a strict `===` check and never be confused with a
    // genuine bug surfacing as some other thrown value.
    var TIME_UP = { timeUp: true };

    // Per-level search configuration. Levels 1/2 stay on a fixed shallow
    // depth with score noise (deliberately weak/inconsistent play). Level 3
    // uses time-boxed iterative deepening with no noise (play as well as
    // the time budget allows).
    var LEVEL_CONFIG = {
        1: { fixedDepth: 1, noise: 80 },
        2: { fixedDepth: 2, noise: 30 },
        3: { maxDepth: 8, timeBudgetMs: 1200 }
    };

    function ChessAI(level) {
        this.level = level || 1; // 1, 2, or 3
        this.tt = new Array(TT_SIZE);
        this.killers = [];
        this.nodeCount = 0;
        this.deadline = Infinity;

        // Stats from the most recent getBestMove() call, for diagnostics
        // (e.g. an on-screen debug readout). Not used by search logic
        // itself - purely informational.
        this.lastElapsedMs = 0;
        this.lastDepthReached = 0;
        this.lastUsedBook = false;
    }

    // Clears search state that should not leak between separate games (the
    // transposition table and killer moves are only meaningful within the
    // context of the position tree they were built from). Call this when
    // starting a new game with a reused ChessAI instance.
    ChessAI.prototype.resetSearchState = function() {
        this.tt = new Array(TT_SIZE);
        this.killers = [];
    };

    // Called at the top of every search node. Throws TIME_UP once the
    // configured deadline has passed. Checked every 256 nodes rather than
    // every single node (an actual Date read on every node would itself be
    // a meaningful per-node cost), but kept tight rather than the more
    // "efficient" 2048 some engines use: this project's target device
    // (Kindle's old, likely non-JIT JavaScriptCore) is untested and could
    // be an order of magnitude slower per node than a modern desktop JS
    // engine, and a coarser check interval directly multiplies the worst-
    // case overrun past the deadline. 256 trades a little more clock-
    // reading overhead for a much tighter worst-case bound until this has
    // been measured on real hardware.
    ChessAI.prototype.checkTime = function() {
        this.nodeCount++;
        if ((this.nodeCount & 255) === 0 && new Date().getTime() >= this.deadline) {
            throw TIME_UP;
        }
    };

    // Converts a score about to be stored in the TT into one that is
    // independent of ply-from-root, and back again on retrieval. Without
    // this, a mate score cached deep in one search branch would report the
    // wrong mate distance if that same position is later reached at a
    // different ply — a well-documented TT correctness pitfall (see Chess
    // Programming Wiki, "Score" / mate scoring in transposition tables).
    ChessAI.prototype.scoreToTT = function(score, ply) {
        if (score >= MATE_THRESHOLD) return score + ply;
        if (score <= -MATE_THRESHOLD) return score - ply;
        return score;
    };

    ChessAI.prototype.scoreFromTT = function(score, ply) {
        if (score >= MATE_THRESHOLD) return score - ply;
        if (score <= -MATE_THRESHOLD) return score + ply;
        return score;
    };

    ChessAI.prototype.probeTT = function(key) {
        var entry = this.tt[key & TT_INDEX_MASK];
        if (entry && entry.key === key) return entry;
        return null;
    };

    // Depth-preferred replacement: a shallower re-search of the same
    // position is not allowed to evict a deeper, more valuable result.
    ChessAI.prototype.storeTT = function(key, depth, score, flag, moveDescriptor, ply) {
        var index = key & TT_INDEX_MASK;
        var existing = this.tt[index];
        if (existing && existing.key === key && existing.depth > depth) {
            return;
        }
        this.tt[index] = {
            key: key,
            depth: depth,
            score: this.scoreToTT(score, ply),
            flag: flag,
            move: moveDescriptor
        };
    };

    // Two killer slots per ply. Killers are a within-search heuristic (they
    // only mean something relative to the tree currently being searched),
    // so this.killers is reset per getBestMove call for level 3, not
    // persisted across separate move decisions.
    ChessAI.prototype.recordKiller = function(ply, move) {
        var slot = this.killers[ply];
        if (!slot) {
            slot = [null, null];
            this.killers[ply] = slot;
        }
        if (slot[0] && slot[0].fromR === move.from.r && slot[0].fromC === move.from.c &&
            slot[0].toR === move.to.r && slot[0].toC === move.to.c) {
            return; // already the primary killer for this ply
        }
        slot[1] = slot[0];
        slot[0] = { fromR: move.from.r, fromC: move.from.c, toR: move.to.r, toC: move.to.c };
    };

    ChessAI.prototype.isKillerMove = function(ply, move) {
        var slot = this.killers[ply];
        if (!slot) return false;
        for (var i = 0; i < slot.length; i++) {
            var k = slot[i];
            if (k && k.fromR === move.from.r && k.fromC === move.from.c &&
                k.toR === move.to.r && k.toC === move.to.c) {
                return true;
            }
        }
        return false;
    };

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

    // Move ordering, strictly tiered so alpha-beta prunes as much as
    // possible: the transposition table's remembered best move first (it's
    // the single strongest hint available), then captures/promotions via
    // MVV-LVA (Most Valuable Victim - Least Valuable Attacker: a pawn
    // taking a queen is tried well before a queen taking a pawn), then
    // killer moves (quiet moves that caused a beta cutoff elsewhere at this
    // same ply), then everything else in whatever order it was generated.
    // ttMove/ply are optional — pass null/undefined when ordering a list
    // that has neither (e.g. quiescence's capture-only lists).
    ChessAI.prototype.orderMoves = function(moves, ttMove, ply) {
        var self = this;
        moves.sort(function(a, b) {
            return self.moveOrderScore(b, ttMove, ply) - self.moveOrderScore(a, ttMove, ply);
        });
        return moves;
    };

    ChessAI.prototype.moveOrderScore = function(move, ttMove, ply) {
        if (ttMove && move.from.r === ttMove.fromR && move.from.c === ttMove.fromC &&
            move.to.r === ttMove.toR && move.to.c === ttMove.toC) {
            return ORDER_TT_MOVE;
        }
        if (move.captured || move.promotion) {
            var mvvLva = 0;
            if (move.captured) {
                var victimVal = Math.abs(PIECE_VALUES[move.captured] || 0);
                var attackerVal = Math.abs(PIECE_VALUES[move.piece] || 0);
                mvvLva = 10 * victimVal - attackerVal;
            }
            if (move.promotion) mvvLva += 9000;
            return ORDER_CAPTURE_BASE + mvvLva;
        }
        if (ply !== undefined && ply !== null && this.isKillerMove(ply, move)) {
            return ORDER_KILLER;
        }
        return 0;
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
                // Mirror both axes for black. Most tables are left-right
                // symmetric so this is a no-op for them, but PST_QUEEN is
                // NOT symmetric (e.g. row 6: index 2 = 5, index 5 = 0), so
                // skipping the column mirror silently mis-scores black's
                // queen on those squares. Mirroring unconditionally is
                // correct for every table, not just the asymmetric one.
                var evalCol = isW ? c : 7 - c;

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

        score += this.evaluatePawnStructure(engine, isEndgame);

        return score;
    };

    // Penalizes doubled/isolated pawns and rewards passed pawns. Returns a
    // score from White's perspective (positive favors White), added into
    // evaluatePosition's material+PST total.
    ChessAI.prototype.evaluatePawnStructure = function(engine, isEndgame) {
        var whiteFiles = [0, 0, 0, 0, 0, 0, 0, 0];
        var blackFiles = [0, 0, 0, 0, 0, 0, 0, 0];
        var whitePawnSquares = [];
        var blackPawnSquares = [];
        var r, c, p;

        for (r = 0; r < 8; r++) {
            for (c = 0; c < 8; c++) {
                p = engine.board[r][c];
                if (p === 'P') {
                    whiteFiles[c]++;
                    whitePawnSquares.push({ r: r, c: c });
                } else if (p === 'p') {
                    blackFiles[c]++;
                    blackPawnSquares.push({ r: r, c: c });
                }
            }
        }

        var score = 0;
        var i;

        // Doubled pawns: penalize every pawn beyond the first on a file.
        for (c = 0; c < 8; c++) {
            if (whiteFiles[c] > 1) score -= DOUBLED_PAWN_PENALTY * (whiteFiles[c] - 1);
            if (blackFiles[c] > 1) score += DOUBLED_PAWN_PENALTY * (blackFiles[c] - 1);
        }

        // Isolated pawns: no friendly pawn on either adjacent file.
        for (i = 0; i < whitePawnSquares.length; i++) {
            c = whitePawnSquares[i].c;
            var hasNeighborW = (c > 0 && whiteFiles[c - 1] > 0) || (c < 7 && whiteFiles[c + 1] > 0);
            if (!hasNeighborW) score -= ISOLATED_PAWN_PENALTY;
        }
        for (i = 0; i < blackPawnSquares.length; i++) {
            c = blackPawnSquares[i].c;
            var hasNeighborB = (c > 0 && blackFiles[c - 1] > 0) || (c < 7 && blackFiles[c + 1] > 0);
            if (!hasNeighborB) score += ISOLATED_PAWN_PENALTY;
        }

        // Passed pawns: no enemy pawn on this file or an adjacent file
        // standing between this pawn and its promotion square.
        for (i = 0; i < whitePawnSquares.length; i++) {
            r = whitePawnSquares[i].r;
            c = whitePawnSquares[i].c;
            if (!this.hasBlockingPawn(blackPawnSquares, c, r, -1)) {
                var bonusW = PASSED_PAWN_BONUS[r] || 0;
                if (isEndgame) bonusW *= 2;
                score += bonusW;
            }
        }
        for (i = 0; i < blackPawnSquares.length; i++) {
            r = blackPawnSquares[i].r;
            c = blackPawnSquares[i].c;
            if (!this.hasBlockingPawn(whitePawnSquares, c, r, 1)) {
                var bonusB = PASSED_PAWN_BONUS[7 - r] || 0;
                if (isEndgame) bonusB *= 2;
                score -= bonusB;
            }
        }

        return score;
    };

    // direction -1: "enemy" pawns with a smaller row (closer to rank 8->1,
    // i.e. ahead of a White pawn's path toward row 0) count as blocking.
    // direction  1: enemy pawns with a larger row (ahead of a Black pawn's
    // path toward row 7) count as blocking.
    ChessAI.prototype.hasBlockingPawn = function(enemyPawnSquares, file, rank, direction) {
        for (var i = 0; i < enemyPawnSquares.length; i++) {
            var sq = enemyPawnSquares[i];
            if (sq.c < file - 1 || sq.c > file + 1) continue;
            if (direction === -1 && sq.r < rank) return true;
            if (direction === 1 && sq.r > rank) return true;
        }
        return false;
    };

    ChessAI.prototype.quiescence = function(engine, alpha, beta, isMaximizing, qDepth) {
        this.checkTime();

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

        var moverColor = engine.turn;
        var pseudoMoves = engine.getPseudoLegalMovesForColor(moverColor);
        var captureMoves = [];
        for (var k = 0; k < pseudoMoves.length; k++) {
            if (pseudoMoves[k].captured || pseudoMoves[k].promotion) {
                captureMoves.push(pseudoMoves[k]);
            }
        }
        captureMoves = this.orderMoves(captureMoves, null, null);

        if (isMaximizing) {
            var maxEval = standPat;
            for (var i = 0; i < captureMoves.length; i++) {
                var move = captureMoves[i];
                engine.makeMoveRaw(move);
                var illegal = false;
                var evalScore;
                try {
                    if (engine.isCheck(moverColor)) {
                        illegal = true;
                    } else {
                        evalScore = this.quiescence(engine, alpha, beta, false, qDepth - 1);
                    }
                } finally {
                    engine.undoMoveRaw(move);
                }
                if (illegal) continue;

                if (evalScore > maxEval) maxEval = evalScore;
                if (evalScore > alpha) alpha = evalScore;
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            var minEval = standPat;
            for (var j = 0; j < captureMoves.length; j++) {
                var moveB = captureMoves[j];
                engine.makeMoveRaw(moveB);
                var illegalB = false;
                var evalScoreMin;
                try {
                    if (engine.isCheck(moverColor)) {
                        illegalB = true;
                    } else {
                        evalScoreMin = this.quiescence(engine, alpha, beta, true, qDepth - 1);
                    }
                } finally {
                    engine.undoMoveRaw(moveB);
                }
                if (illegalB) continue;

                if (evalScoreMin < minEval) minEval = evalScoreMin;
                if (evalScoreMin < beta) beta = evalScoreMin;
                if (beta <= alpha) break;
            }
            return minEval;
        }
    };

    // ply = distance in plies from the position the player is actually
    // looking at (the getBestMove call's root passes ply=1 to its
    // immediate children, incrementing by 1 each recursive call). Mate
    // scores are computed relative to this so shorter mates are always
    // preferred, and the TT mate-score adjustment (scoreToTT/scoreFromTT)
    // depends on it to stay correct across nodes reached at different plies.
    ChessAI.prototype.minimax = function(engine, depth, alpha, beta, isMaximizing, ply) {
        this.checkTime();

        var origAlpha = alpha;
        var origBeta = beta;
        var zobristKey = engine.computeZobristKey();
        var ttEntry = this.probeTT(zobristKey);
        var ttMove = ttEntry ? ttEntry.move : null;

        if (ttEntry && ttEntry.depth >= depth) {
            var ttScore = this.scoreFromTT(ttEntry.score, ply);
            if (ttEntry.flag === TT_FLAG_EXACT) {
                return ttScore;
            } else if (ttEntry.flag === TT_FLAG_LOWERBOUND) {
                if (ttScore > alpha) alpha = ttScore;
            } else if (ttEntry.flag === TT_FLAG_UPPERBOUND) {
                if (ttScore < beta) beta = ttScore;
            }
            if (alpha >= beta) {
                return ttScore;
            }
        }

        if (depth === 0) {
            // For level 3, we use quiescence search to avoid horizon effect
            if (this.level === 3) {
                return this.quiescence(engine, alpha, beta, isMaximizing, 4); // Max 4 plies of quiescence
            } else {
                return this.evaluatePosition(engine);
            }
        }

        var moverColor = engine.turn;
        var pseudoMoves = engine.getPseudoLegalMovesForColor(moverColor);
        pseudoMoves = this.orderMoves(pseudoMoves, ttMove, ply);

        var legalMoveCount = 0;
        var bestScore = isMaximizing ? -Infinity : Infinity;
        var bestMoveHere = null;

        if (isMaximizing) {
            for (var i = 0; i < pseudoMoves.length; i++) {
                var move = pseudoMoves[i];
                engine.makeMoveRaw(move);
                var illegal = false;
                var evalScore;
                try {
                    if (engine.isCheck(moverColor)) {
                        illegal = true;
                    } else {
                        evalScore = this.minimax(engine, depth - 1, alpha, beta, false, ply + 1);
                    }
                } finally {
                    engine.undoMoveRaw(move);
                }
                if (illegal) continue;
                legalMoveCount++;

                if (evalScore > bestScore) {
                    bestScore = evalScore;
                    bestMoveHere = move;
                }
                if (evalScore > alpha) alpha = evalScore;
                if (beta <= alpha) {
                    if (!move.captured && !move.promotion) this.recordKiller(ply, move);
                    break; // Beta cut-off
                }
            }
        } else {
            for (var j = 0; j < pseudoMoves.length; j++) {
                var moveB = pseudoMoves[j];
                engine.makeMoveRaw(moveB);
                var illegalB = false;
                var evalScoreMin;
                try {
                    if (engine.isCheck(moverColor)) {
                        illegalB = true;
                    } else {
                        evalScoreMin = this.minimax(engine, depth - 1, alpha, beta, true, ply + 1);
                    }
                } finally {
                    engine.undoMoveRaw(moveB);
                }
                if (illegalB) continue;
                legalMoveCount++;

                if (evalScoreMin < bestScore) {
                    bestScore = evalScoreMin;
                    bestMoveHere = moveB;
                }
                if (evalScoreMin < beta) beta = evalScoreMin;
                if (beta <= alpha) {
                    if (!moveB.captured && !moveB.promotion) this.recordKiller(ply, moveB);
                    break; // Alpha cut-off
                }
            }
        }

        if (legalMoveCount === 0) {
            if (engine.isCheck(moverColor)) {
                return isMaximizing ? -(MATE_SCORE - ply) : (MATE_SCORE - ply);
            }
            return 0; // Stalemate
        }

        var flag;
        if (bestScore <= origAlpha) {
            flag = TT_FLAG_UPPERBOUND;
        } else if (bestScore >= origBeta) {
            flag = TT_FLAG_LOWERBOUND;
        } else {
            flag = TT_FLAG_EXACT;
        }
        var moveDescriptor = bestMoveHere ? {
            fromR: bestMoveHere.from.r, fromC: bestMoveHere.from.c,
            toR: bestMoveHere.to.r, toC: bestMoveHere.to.c
        } : null;
        this.storeTT(zobristKey, depth, bestScore, flag, moveDescriptor, ply);

        return bestScore;
    };

    ChessAI.prototype.getBestMove = function(engine) {
        this.lastElapsedMs = 0;
        this.lastDepthReached = 0;
        this.lastUsedBook = false;

        // Try opening book first
        if (this.level === 3) {
            var bookMove = this.getOpeningMove(engine);
            if (bookMove) {
                this.lastUsedBook = true;
                return bookMove;
            }
        }

        var rootMoves = engine.getAllLegalMoves(engine.turn);
        if (rootMoves.length === 0) return null;
        if (rootMoves.length === 1) return rootMoves[0]; // nothing to decide, save the battery

        var isMaximizing = engine.turn === 'w';

        // Shuffle first so ties aren't always broken in board-scan order,
        // then let move ordering push the strongest candidates to the front.
        rootMoves.sort(function() { return 0.5 - Math.random(); });

        if (this.level === 3) {
            return this.getBestMoveIterativeDeepening(engine, rootMoves, isMaximizing);
        }
        return this.getBestMoveFixedDepth(engine, rootMoves, isMaximizing);
    };

    // Levels 1-2: unchanged behavior from before this upgrade — a single
    // fixed-depth full-width search per root move, with per-move random
    // noise added afterward so the bot plays deliberately weak/inconsistent
    // (that's the point of these levels, not a bug). No time budget needed:
    // depth 1-2 completes essentially instantly.
    ChessAI.prototype.getBestMoveFixedDepth = function(engine, rootMoves, isMaximizing) {
        var config = LEVEL_CONFIG[this.level] || LEVEL_CONFIG[1];
        this.deadline = Infinity;
        this.killers = []; // don't let a prior level-3 search's killers leak in here
        var searchStart = new Date().getTime();

        rootMoves = this.orderMoves(rootMoves, null, 0);

        var bestMove = rootMoves[0];
        var bestScore = isMaximizing ? -Infinity : Infinity;

        for (var i = 0; i < rootMoves.length; i++) {
            var move = rootMoves[i];
            engine.makeMoveRaw(move);
            var score;
            try {
                score = this.minimax(engine, config.fixedDepth - 1, -Infinity, Infinity, !isMaximizing, 1);
            } finally {
                engine.undoMoveRaw(move);
            }

            if (config.noise > 0) {
                score += (Math.random() * config.noise * 2) - config.noise;
            }

            if (isMaximizing ? score > bestScore : score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        this.lastDepthReached = config.fixedDepth;
        this.lastElapsedMs = new Date().getTime() - searchStart;
        return bestMove;
    };

    // Level 3: iterative deepening within a wall-clock time budget. Each
    // iteration searches one ply deeper than the last, feeding the previous
    // iteration's best move to the front of the root move list so alpha-beta
    // starts with its tightest possible window — this is what lets the same
    // time budget reach a meaningfully greater depth than a single fixed-
    // depth search would. If the budget runs out mid-iteration, that
    // iteration's incomplete result is discarded and the last fully-
    // completed iteration's move is returned — never a partial answer.
    ChessAI.prototype.getBestMoveIterativeDeepening = function(engine, rootMoves, isMaximizing) {
        var config = LEVEL_CONFIG[3];
        this.killers = [];
        this.nodeCount = 0;
        var searchStart = new Date().getTime();
        this.deadline = searchStart + config.timeBudgetMs;

        rootMoves = this.orderMoves(rootMoves, null, 0);

        var bestMove = rootMoves[0];
        var bestScore = isMaximizing ? -Infinity : Infinity;
        var depthReached = 0;

        for (var depth = 1; depth <= config.maxDepth; depth++) {
            var iterationBestMove = null;
            var iterationBestScore = isMaximizing ? -Infinity : Infinity;
            var alpha = -Infinity;
            var beta = Infinity;
            var timedOut = false;

            for (var i = 0; i < rootMoves.length; i++) {
                var move = rootMoves[i];
                engine.makeMoveRaw(move);
                var score;
                try {
                    score = this.minimax(engine, depth - 1, alpha, beta, !isMaximizing, 1);
                } catch (e) {
                    if (e === TIME_UP) {
                        timedOut = true;
                    } else {
                        throw e;
                    }
                } finally {
                    engine.undoMoveRaw(move);
                }
                if (timedOut) break;

                if (isMaximizing ? score > iterationBestScore : score < iterationBestScore) {
                    iterationBestScore = score;
                    iterationBestMove = move;
                }
                if (isMaximizing) {
                    if (score > alpha) alpha = score;
                } else {
                    if (score < beta) beta = score;
                }
            }

            if (timedOut || iterationBestMove === null) {
                break; // discard this incomplete iteration, keep the previous one
            }

            bestMove = iterationBestMove;
            bestScore = iterationBestScore;
            depthReached = depth;
            rootMoves = this.moveToFront(rootMoves, bestMove);

            if (Math.abs(bestScore) >= MATE_THRESHOLD) {
                break; // forced mate found; searching deeper cannot improve on it
            }
            if (new Date().getTime() >= this.deadline) {
                break;
            }
        }

        this.lastDepthReached = depthReached;
        this.lastElapsedMs = new Date().getTime() - searchStart;
        return bestMove;
    };

    ChessAI.prototype.moveToFront = function(moves, targetMove) {
        var idx = -1;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i] === targetMove) { idx = i; break; }
        }
        if (idx > 0) {
            var reordered = moves.slice();
            var moved = reordered.splice(idx, 1)[0];
            reordered.unshift(moved);
            return reordered;
        }
        return moves;
    };

    root.ChessAI = ChessAI;

})(typeof window !== 'undefined' ? window : this);
