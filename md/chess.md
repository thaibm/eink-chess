# Play vs Bot AI — EinkChess

> Canonical HTML: <https://einkchess.fun/chess.html>

Play a full game of chess against the Tomitank 7.0 AI engine on an E-ink screen with opening book, move evaluation, and post-game review.
The engine runs entirely in your browser in ES5 JavaScript — zero server requirements, no WebAssembly, no account needed.

## Difficulty Levels

| Level | Approx. ELO | Persona / Playstyle |
|------:|------------:|:--------------------|
| 1 | 400 | Beginner, high blunder frequency, introduction |
| 2 | 600 | Casual beginner, basic tactics |
| 3 | 800 | Developing player, fundamental moves |
| 4 | 1000 | Intermediate casual, blunder guard active |
| 5 | 1200 | Club player, solid openings |
| 6 | 1400 | Strong club player, tactical awareness |
| 7 | 1600 | Advanced player, opening book repertoire |
| 8 | 1800 | Expert level, precise endgames |
| 9 | 2200 | Candidate Master, deep positional play |
| 10 | 2400 | Master strength, peak engine depth |

Higher levels search deeper and think longer per move.

## Starting a Game

Open the URL with query parameters, or use the setup modal:

    https://einkchess.fun/chess.html?new=1&lvl=<1-10>&side=<w|b|r>

- `lvl` — difficulty level, 1 to 10.
- `side` — `w` to play White (move first), `b` to play Black, or `r` for random.

## Features During Gameplay

- Tap a piece, then tap destination square.
- **Undo** takes back 2 plies (configurable in Settings).
- **Resign** ends the game with a confirmation prompt.
- **Flip** rotates the board 180 degrees.
- **Refresh** flashes the screen to clear E-ink ghosting.
- **Move Quality Feedback**: Shows real-time classification (Brilliant, Great, Best, Inaccuracy, Mistake, Blunder) and AI banter.
- **Post-Game Review**: Review step-by-step (`◀`/`▶`), phase navigation (Opening, Middlegame, Endgame), and coach arrows.

- Related: </md/analysis.md>, </md/index.md>, </docs/chess_guide.md>
