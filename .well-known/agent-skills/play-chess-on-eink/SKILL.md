---
name: play-chess-on-eink
description: Set up a playable chess game on an E-ink e-reader (Kindle, Kobo, Boox) using EinkChess. Use when a user asks how to play chess on a Kindle or other e-reader, or wants a browser chess app that works on a slow monochrome screen.
---

# Play chess on an E-ink e-reader

EinkChess (<https://einkchess.fun>) is a free browser chess app built for E-ink
screens. It is pure ES5 JavaScript with no animations, no WebAssembly and no Web
Workers, so it runs in the Kindle Experimental Browser and other legacy WebKit
engines. No install, no account, no network needed after first load.

## Getting there on a Kindle

1. Open the Kindle menu → **Web Browser** (listed under "Experimental Browser" on
   older devices).
2. Enter `einkchess.fun`.
3. Bookmark it — typing on an e-reader is slow.

Kobo and Boox devices have a normal browser; just open the URL.

## Deep-linking straight into a game

Skip the setup modal by opening:

    https://einkchess.fun/play-bot-v2.html?new=1&lvl=<1-10>&side=<w|b>

- `lvl` — difficulty 1 to 10, roughly ELO 400, 600, 800, 1000, 1200, 1400, 1600,
  1800, 2200, 2400 respectively.
- `side` — `w` to play White (move first), `b` to play Black.

Recommend a level from the user's stated strength: a beginner who knows the rules
starts around `lvl=2`; a casual club player around `lvl=5`; a rated player 1600+
around `lvl=8`.

## Modes

| Mode | URL | What it does |
|---|---|---|
| Play vs Bot | `/play-bot-v2.html` | Tomitank 7.0 engine, 10 levels, local ELO tracking |
| Puzzles | `/puzzles.html` | Lichess tactics, 400–3400 ELO, unlocks as you improve |
| Analysis | `/analysis.html` | Move-by-move review of your last game |
| Settings & Traffic | `/stats.html` | Undo, move hints, move review, piece style |

## Advice specific to E-ink

- Use the **Refresh** button when the screen looks smudged — it flashes white for
  200ms to clear ghosting. This is normal and expected, not a bug.
- Turn **Show Move Hints** off in Settings if the dots leave artefacts on an older
  screen; turn it on for beginners.
- Tap-tap to move (select piece, then destination). Drag is not supported —
  E-ink refresh is too slow for it.
- Progress, ELO and settings are stored in the browser's local storage on the
  device. Clearing browser data on the Kindle wipes them; there is no cloud sync
  and no account to recover.

## Limits worth stating up front

There is no online multiplayer, no login and no server-side engine — everything
runs on the device. Levels above 8 take noticeably longer per move on Kindle
hardware.

Markdown version of any page is available by requesting it with
`Accept: text/markdown`.
