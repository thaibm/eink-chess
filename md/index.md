# EinkChess — Chess for E-ink E-readers

> Canonical HTML: <https://einkchess.fun/>

EinkChess is a free, browser-based chess app built specifically for E-ink screens
(Amazon Kindle, Kobo, Boox). It is pure ES5 JavaScript with no animations, no
gradients and no WebAssembly, so it runs on the Kindle Experimental Browser and
other legacy WebKit engines. Everything runs client-side — no account required,
no install, no server-side engine.

## Modes

### Play vs Bot (AI)
Practice against the Tomitank 7.0 engine across 10 difficulty levels, roughly
ELO 400 (Level 1) through ELO 2400 (Level 10). Your bot ELO is tracked locally
after each match. Choose White or Black before starting.

- Page: <https://einkchess.fun/play-bot-v2.html>
- Free and unlimited, fully offline once loaded.

### Chess Puzzles
Tactical puzzles sourced from the Lichess open puzzle database, bucketed by
rating from 400 to 3400 ELO. The puzzle feed adapts to your puzzle ELO, and
higher rating tiers unlock as you improve (800, 1200, 1600, 2000, 2400, 2800,
3100).

- Page: <https://einkchess.fun/puzzles.html>

### Post-Game Analysis
Replay a finished game move by move with an evaluation advantage readout and
per-move tactical feedback.

- Page: <https://einkchess.fun/analysis.html>

### Settings
Configure piece style, Undo availability, move hint dots, and per-move review
badges.

- Page: <https://einkchess.fun/settings.html>

## E-ink design constraints

- No CSS transitions, keyframes, blur shadows or gradients — they cause ghosting.
- High-contrast monochrome palette; selection shown with thick outlines.
- Incremental DOM patching so only changed squares redraw (fast partial refresh).
- A **Refresh** button flashes the screen white for 200ms to clear ghosting.
- Touch targets are at least 44x44px.
- ES5 only: no `const`/`let`, arrow functions, classes, WASM or Web Workers.

## Languages

English and Vietnamese, switchable from the header.

## Machine-readable resources

- Agent capability manifest: </.well-known/ai-catalog.json>
- API catalog (RFC 9727): </.well-known/api-catalog>
- Agent skills index: </.well-known/agent-skills/index.json>
- Puzzle data API docs: </docs/api.md>
- Sitemap: </sitemap.xml>

## Support

EinkChess is free. Donations via Ko-fi (`ko-fi.com/sendwebtokindle`) or Momo.
Powered by <https://sendwebtokindle.xyz>.
