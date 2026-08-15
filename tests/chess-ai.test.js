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

    test('Mate in 1 (Level 5 should find it)', () => {
        const ai = new ChessAI(5);
        
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
        const aiLvl3 = new ChessAI(5);

        engine.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        
        aiLvl1.getBestMove(engine);
        const nodesLvl1 = aiLvl1.nodes;

        aiLvl3.getBestMove(engine);
        const nodesLvl3 = aiLvl3.nodes;

        expect(nodesLvl3).toBeGreaterThan(nodesLvl1);
    });
});
