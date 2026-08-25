# Play vs Bot — EinkChess

> Canonical HTML: <https://einkchess.fun/play-bot-v2.html>

Play a full game of chess against the Tomitank 7.0 AI engine on an E-ink screen.
The engine runs entirely in your browser in ES5 JavaScript — no server, no
WebAssembly, no account.

## Difficulty levels

| Level | Approx. ELO |
|------:|------------:|
| 1 | 400 |
| 2 | 600 |
| 3 | 800 |
| 4 | 1000 |
| 5 | 1200 |
| 6 | 1400 |
| 7 | 1600 |
| 8 | 1800 |
| 9 | 2200 |
| 10 | 2400 |

Higher levels search deeper and think longer per move.

## Starting a game

Open the URL with query parameters, or use the setup modal on the home page:

    https://einkchess.fun/play-bot-v2.html?new=1&lvl=<1-10>&side=<w|b>

- `lvl` — difficulty level, 1 to 10.
- `side` — `w` to play White (move first) or `b` to play Black.

## During the game

- Tap a piece, then tap a destination square. Legal-move dots can be toggled in Settings.
- **Undo** takes back your last move (can be disabled in Settings).
- **Resign** ends the game after a confirmation prompt.
- **Refresh** flashes the screen white to clear E-ink ghosting.
- Move Review shows an evaluation badge and tactical feedback after each move.

Your bot ELO is stored locally in the browser and updates after each finished game.
When a game ends you can jump straight to post-game analysis.

- Related: </md/analysis.md>, </md/index.md>
