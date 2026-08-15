const ChessEngine = require('../js/chess-engine.js');
const ChessAI = require('../js/chess-ai.js');

describe('ChessAI AI Engine', () => {
    let engine;

    beforeEach(() => {
        engine = new ChessEngine();
    });

    test('Evaluation Function - Material Advantage', () => {
        const ai = new ChessAI(1);
        
        // Equal position
        engine.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        const initialScore = ai.evaluatePosition(engine);
        expect(initialScore).toBe(0);

        // White is up a Queen
        engine.loadFEN('rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); // Black missing queen
        const whiteWinningScore = ai.evaluatePosition(engine);
        expect(whiteWinningScore).toBeGreaterThan(500); 
    });

    test('Evaluation Function - Piece Square Tables (PST)', () => {
        const ai = new ChessAI(1);
        
        // Pawn in center vs Pawn on edge
        engine.loadFEN('8/8/8/8/4P3/8/8/8 w - - 0 1'); // e4 pawn
        const centerScore = ai.evaluatePosition(engine);

        engine.loadFEN('8/8/8/8/8/8/P7/8 w - - 0 1'); // a2 pawn
        const edgeScore = ai.evaluatePosition(engine);

        expect(centerScore).toBeGreaterThan(edgeScore);
    });

    test('Mate in 1 (Level 3 should find it)', () => {
        const ai = new ChessAI(3);
        
        // White to move, Qh7# is mate
        engine.loadFEN('r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1'); 
        const bestMove = ai.getBestMove(engine);

        expect(bestMove).not.toBeNull();
        expect(bestMove.from.r).toBe(3); // h5
        expect(bestMove.from.c).toBe(7); // h
        expect(bestMove.to.r).toBe(1);   // f7
        expect(bestMove.to.c).toBe(5);   // f
    });

    test('Defend against check', () => {
        const ai = new ChessAI(2);
        
        // Black to move, king is in check by white Rook on e1
        engine.loadFEN('4k3/8/8/8/8/8/8/4R3 b - - 0 1');
        
        const bestMove = ai.getBestMove(engine);
        // The only legal moves are king moves
        expect(bestMove).not.toBeNull();
        expect(bestMove.piece).toBe('k'); 
    });

    test('Level Scaling - Depth vs Nodes', () => {
        const aiLvl1 = new ChessAI(1);
        const aiLvl5 = new ChessAI(5);

        // Deliberately NOT the starting position: level 5 answers known
        // opening theory from a small book instantly (0 nodes searched),
        // which would make this test measure "does the book exist" instead
        // of "does deeper search visit more nodes". A midgame position with
        // no book entry isolates the actual thing being tested.
        engine.loadFEN('r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP1B1PPP/R2QKB1R w KQ - 4 8');

        aiLvl1.getBestMove(engine);
        const nodesLvl1 = aiLvl1.nodes;

        aiLvl5.getBestMove(engine);
        const nodesLvl5 = aiLvl5.nodes;

        // Level 5 (time-boxed iterative deepening + quiescence) should
        // evaluate significantly more nodes than Level 1 (fixed depth 1)
        expect(nodesLvl5).toBeGreaterThan(nodesLvl1);
    });
});
