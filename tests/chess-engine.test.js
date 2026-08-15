const ChessEngine = require('../js/chess-engine.js');

function moveAlg(engine, fromAlg, toAlg, promo) {
    const fromR = 8 - parseInt(fromAlg[1]);
    const fromC = fromAlg.charCodeAt(0) - 97;
    const toR = 8 - parseInt(toAlg[1]);
    const toC = toAlg.charCodeAt(0) - 97;
    
    const moves = engine.getAllLegalMoves(engine.turn);
    const move = moves.find(m => 
        m.from.r === fromR && m.from.c === fromC && 
        m.to.r === toR && m.to.c === toC &&
        m.promotion === (promo || null)
    );
    if (move) {
        engine.makeMove(move);
        return move;
    }
    return null;
}

describe('ChessEngine Rules', () => {
    let engine;

    beforeEach(() => {
        engine = new ChessEngine();
    });

    test('Initial FEN loading', () => {
        expect(engine.toFEN()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    });

    test('Basic Pawn Move', () => {
        const move = moveAlg(engine, 'e2', 'e4');
        expect(move).not.toBeNull();
        expect(move.piece).toBe('P');
        expect(engine.board[4][4]).toBe('P'); // e4
        expect(engine.board[6][4]).toBeNull(); // e2
        expect(engine.turn).toBe('b');
    });

    test('Pawn Capture', () => {
        engine.loadFEN('rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1');
        const move = moveAlg(engine, 'd4', 'e5');
        expect(move).not.toBeNull();
        expect(move.captured).toBe('p');
        expect(engine.board[3][4]).toBe('P');
    });

    test('Castling (Kingside White)', () => {
        engine.loadFEN('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
        const moves = engine.getAllLegalMoves('w');
        const castlingMove = moves.find(m => m.from.r === 7 && m.from.c === 4 && m.to.r === 7 && m.to.c === 6);
        expect(castlingMove).not.toBeUndefined();
        
        const res = moveAlg(engine, 'e1', 'g1');
        expect(res).not.toBeNull();
        expect(engine.board[7][6]).toBe('K'); 
        expect(engine.board[7][5]).toBe('R'); 
        expect(engine.castling.K).toBe(false);
    });

    test('Castling Blocked by Piece', () => {
        engine.loadFEN('r3k2r/8/8/8/8/8/8/R3K1NR w KQkq - 0 1'); // Knight on g1
        const moves = engine.getAllLegalMoves('w');
        const castlingMove = moves.find(m => m.from.r === 7 && m.from.c === 4 && m.to.r === 7 && m.to.c === 6);
        expect(castlingMove).toBeUndefined();
    });

    test('En Passant', () => {
        engine.loadFEN('rnbqkbnr/pppp1ppp/8/4pP2/8/8/PPPPP1PP/RNBQKBNR w KQkq e6 0 1');
        const move = moveAlg(engine, 'f5', 'e6');
        expect(move).not.toBeNull();
        expect(move.isEnPassant).toBe(true); 
        expect(engine.board[2][4]).toBe('P'); // e6
        expect(engine.board[3][4]).toBeNull(); // e5
    });

    test('Pawn Promotion', () => {
        engine.loadFEN('rnbqkbn1/pppppppP/8/8/8/8/PPPPPPP1/RNBQKBNR w KQq - 0 1');
        const move = moveAlg(engine, 'h7', 'h8', 'Q');
        expect(move).not.toBeNull();
        expect(move.promotion).toBe('Q');
        expect(engine.board[0][7]).toBe('Q'); // h8
    });

    test('Check Detection', () => {
        engine.loadFEN('rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1');
        expect(engine.isCheck('b')).toBe(false);

        engine.loadFEN('rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1');
        moveAlg(engine, 'd4', 'e5');
        moveAlg(engine, 'f8', 'b4'); // Black bishop checks white king
        expect(engine.isCheck('w')).toBe(true);
    });

    test('Checkmate Detection', () => {
        engine.loadFEN('rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1');
        expect(engine.isCheckmate()).toBe(false);

        engine.loadFEN('r1bqkbnr/pppp1Qpp/2n5/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1'); // Scholar's mate
        expect(engine.isCheckmate()).toBe(true);
    });

    test('Stalemate Detection', () => {
        engine.loadFEN('K7/8/8/8/8/8/8/8 w - - 0 1');
        expect(engine.isStalemate()).toBe(false);

        engine.loadFEN('7k/5K2/6Q1/8/8/8/8/8 b - - 0 1'); // Black is stalemated
        expect(engine.isCheckmate()).toBe(false);
        expect(engine.isStalemate()).toBe(true);
    });

    test('Export and Import State with Move History and Undo', () => {
        // Play 3 moves: e2-e4, e7-e5, g1-f3
        moveAlg(engine, 'e2', 'e4');
        moveAlg(engine, 'e7', 'e5');
        moveAlg(engine, 'g1', 'f3');

        expect(engine.history.length).toBe(3);
        const originalFEN = engine.toFEN();

        // Export state (JSON serialization simulation)
        const state = engine.exportState();
        const jsonString = JSON.stringify(state);
        const parsedState = JSON.parse(jsonString);

        // Create fresh engine and import
        const restoredEngine = new ChessEngine();
        restoredEngine.importState(parsedState);

        expect(restoredEngine.toFEN()).toBe(originalFEN);
        expect(restoredEngine.history.length).toBe(3);
        expect(restoredEngine.turn).toBe('b');

        // Test Undo on restored engine
        const undoneMove1 = restoredEngine.undoMove();
        expect(undoneMove1).not.toBeNull();
        expect(undoneMove1.from.r).toBe(7); // g1
        expect(undoneMove1.from.c).toBe(6);
        expect(undoneMove1.to.r).toBe(5);   // f3
        expect(undoneMove1.to.c).toBe(5);
        expect(restoredEngine.turn).toBe('w');
        expect(restoredEngine.history.length).toBe(2);

        // Make another move on restored engine
        const newMove = moveAlg(restoredEngine, 'd2', 'd4');
        expect(newMove).not.toBeNull();
        expect(restoredEngine.history.length).toBe(3);
        expect(restoredEngine.turn).toBe('b');
    });
});
