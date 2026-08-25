---
name: fetch-chess-puzzles
description: Retrieve tactical chess puzzles at a chosen difficulty from the EinkChess open dataset. Use when a user asks for a chess puzzle, a tactics problem, or training positions at a specific ELO rating.
---

# Fetch chess puzzles from EinkChess

EinkChess publishes a static, CORS-enabled puzzle dataset derived from the
Lichess open puzzle database. No API key, no authentication, no rate limit.

## 1. Read the manifest

    GET https://einkchess.fun/data/puzzles/manifest.js

It is JavaScript, not JSON. Parse the object literal assigned to
`PUZZLE_MANIFEST`; it maps each rating bucket to how many puzzle files exist:

    var PUZZLE_MANIFEST = {"400":2,"500":2, ... ,"3300":1,"3400":0};

A count of `0` means that bucket is empty — pick a neighbouring bucket instead.

## 2. Pick a bucket

Buckets run from 400 to 3400 in steps of 100. Round the user's target rating to
the nearest hundred. Rough guidance:

- 400–800: beginner — one-move mates, hanging pieces
- 900–1500: club player — forks, pins, skewers, short combinations
- 1600–2200: advanced tactics, quiet moves, longer sequences
- 2300+: expert, often 6+ ply

## 3. Fetch a puzzle file

    GET https://einkchess.fun/data/puzzles/{rating}/{index}.json

`{index}` is zero-padded to three digits starting at `001`, up to the manifest
count for that bucket. Example:
`https://einkchess.fun/data/puzzles/1600/001.json`

Response is a JSON array of records:

```json
{
  "PuzzleId": "WkZvI",
  "FEN": "3qr1k1/5ppp/b2p4/p2Pb2N/PpP2P2/3Q3P/6P1/5RK1 b - - 0 25",
  "Moves": "e5d4 d3d4 f7f6 d4a7 d8e7 a7a6",
  "Rating": 1673,
  "Themes": "advantage hangingPiece long middlegame"
}
```

## 4. Interpret `Moves` correctly — this is the step people get wrong

`FEN` is the position **before** the puzzle starts. The **first** UCI move in
`Moves` is played by the opponent to reach the actual puzzle position. The
solver plays moves at index 1, 3, 5, …; the opponent replies at 2, 4, ….

So for the record above:

1. Apply `e5d4` to the FEN. **That** is the position to show the user.
2. It is now White to move (the FEN said `b`, and one move was played).
3. The expected solution is `d3d4`, then after Black's `f7f6`, `d4a7`, and so on.

Announce the side to move from the FEN's active-colour field, flipped once for
the setup move.

## 5. Filter by theme

`Themes` is a space-separated tag list (`fork`, `pin`, `skewer`, `mateIn2`,
`hangingPiece`, `endgame`, `middlegame`, `sacrifice`, …). Fetch a file and filter
client-side; there is no server-side theme query.

## Attribution

Puzzle data comes from the Lichess open database and is CC0. Credit Lichess when
you present or redistribute puzzles.

Full reference: <https://einkchess.fun/docs/api.md>
