// Plain Node helpers for playing ChessAI-vs-ChessAI games and scoring a
// "higher" level against a "lower" one. Deliberately has no Jest
// dependency (no describe/test/expect) so it can be required both from
// Jest test files and from plain `node` scripts (e.g. calibration-level5.js).
const ChessEngine = require('../js/chess-engine.js');
const ChessAI = require('../js/chess-ai.js');

function moveKey(m) {
    return m.from.r + ',' + m.from.c + '->' + m.to.r + ',' + m.to.c + (m.promotion || '');
}

function playGame(levelWhite, levelBlack, maxPlies) {
    const engine = new ChessEngine();
    const whiteAi = new ChessAI(levelWhite);
    const blackAi = new ChessAI(levelBlack);
    let plies = 0;

    while (plies < maxPlies) {
        const status = engine.isGameOver();
        if (status.over) return { winner: status.winner, plies: plies };

        const mover = engine.turn === 'w' ? whiteAi : blackAi;
        const legal = engine.getAllLegalMoves(engine.turn);
        const move = mover.getBestMove(engine);
        if (!move) {
            if (legal.length > 0) {
                throw new Error('AI returned no move despite ' + legal.length + ' legal moves (ply ' + plies + ')');
            }
            return { winner: null, plies: plies };
        }
        if (legal.map(moveKey).indexOf(moveKey(move)) === -1) {
            throw new Error('AI returned an illegal move at ply ' + plies + ': ' + moveKey(move));
        }
        engine.makeMove(move);
        plies++;
    }
    return { winner: null, plies: plies };
}

// Plays `games` games between the two levels, alternating which one is
// White each game so neither benefits from the first-move edge, and
// returns the higher level's score as a fraction (win=1, draw=0.5, loss=0).
function scoreHigherLevel(higherLevel, lowerLevel, games, maxPlies) {
    let higherScore = 0;
    for (let g = 0; g < games; g++) {
        const higherIsWhite = g % 2 === 0;
        const whiteLevel = higherIsWhite ? higherLevel : lowerLevel;
        const blackLevel = higherIsWhite ? lowerLevel : higherLevel;
        const outcome = playGame(whiteLevel, blackLevel, maxPlies);

        if (outcome.winner === null) {
            higherScore += 0.5;
        } else if ((outcome.winner === 'w') === higherIsWhite) {
            higherScore += 1;
        }
    }
    return higherScore / games;
}

module.exports = { playGame, scoreHigherLevel };
