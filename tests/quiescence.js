const ChessEngine = require('../js/chess-engine.js');
const ChessAI = require('../js/chess-ai.js');
let engine = new ChessEngine();
engine.loadFEN('3r2k1/8/8/8/3p4/2N5/8/3Q2K1 w - - 0 1');

let ai = new ChessAI(3);
ai.nodes = 0;
let m = { from: {r:5, c:2}, to: {r:4, c:3}, piece: 'N', captured: 'p', promotion: null }; // Nxd4
engine.makeMoveRaw(m);
let score = ai.minimax(engine, 1, -999999, 999999, false, true); // Depth 2 - 1 = 1, minimizing
engine.undoMoveRaw(m);
console.log("Score for Nxd4 with Quiescence:", score);

let ai2 = new ChessAI(2);
engine.makeMoveRaw(m);
let score2 = ai2.minimax(engine, 1, -999999, 999999, false, false);
engine.undoMoveRaw(m);
console.log("Score for Nxd4 NO Quiescence:", score2);
