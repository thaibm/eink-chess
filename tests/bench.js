const ChessEngine = require('../js/chess-engine.js');
const ChessAI = require('../js/chess-ai.js');
let engine = new ChessEngine();
engine.init();
let ai = new ChessAI(5);
console.time("Depth 4");
ai.level = 5;
let oldMinimax = ai.minimax;
ai.getBestMove = function(engine) {
    this.nodes = 0;
    var moves = engine.getAllLegalMoves(engine.turn);
    var isMaximizing = engine.turn === 'w';
    var depth = 4;
    var bestMove = null;
    var bestScore = isMaximizing ? -999999 : 999999;
    moves = this.orderMoves(moves);
    var alpha = -999999, beta = 999999;
    for (var i = 0; i < moves.length; i++) {
        var move = moves[i];
        engine.makeMoveRaw(move);
        var score = this.minimax(engine, depth - 1, alpha, beta, !isMaximizing);
        engine.undoMoveRaw(move);
        if (isMaximizing) {
            if (score > bestScore) { bestScore = score; bestMove = move; }
            if (score > alpha) alpha = score;
        } else {
            if (score < bestScore) { bestScore = score; bestMove = move; }
            if (score < beta) beta = score;
        }
    }
    console.log("Nodes: " + this.nodes);
    return bestMove;
};
ai.getBestMove(engine);
console.timeEnd("Depth 4");
