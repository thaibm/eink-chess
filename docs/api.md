# EinkChess Public Data API

EinkChess has no application backend — the chess engine, puzzle logic and rating
tracking all run in the browser. What it does publish is a **static, read-only,
CORS-enabled puzzle dataset** served from the same origin. Any client or agent may
fetch it directly over HTTPS.

Base URL: `https://einkchess.fun`

Machine-readable description: [`/docs/openapi.json`](https://einkchess.fun/docs/openapi.json)

## Endpoints

### `GET /data/puzzles/manifest.js`

Content-Type: `text/javascript`

A JavaScript file (not JSON — it is loaded with a plain `<script>` tag so it works
on legacy Kindle WebKit) declaring two globals:

```js
var PUZZLE_MANIFEST_VERSION = "20260820111022";
var PUZZLE_MANIFEST = {"400":2,"500":2, ... ,"3400":0};
```

- `PUZZLE_MANIFEST_VERSION` — build timestamp, used for cache busting.
- `PUZZLE_MANIFEST` — maps each rating bucket to the number of puzzle files
  available in that bucket. A value of `0` means the bucket is empty.

### `GET /data/puzzles/{rating}/{index}.json`

Content-Type: `application/json`

- `{rating}` — rating bucket, 400 to 3400 in steps of 100 (31 buckets).
- `{index}` — zero-padded 3-digit file number starting at `001`, up to the count
  given for that bucket in `PUZZLE_MANIFEST`.

Example: `https://einkchess.fun/data/puzzles/1600/001.json`

Returns a JSON array of puzzle records:

```json
[
  {
    "PuzzleId": "WkZvI",
    "FEN": "3qr1k1/5ppp/b2p4/p2Pb2N/PpP2P2/3Q3P/6P1/5RK1 b - - 0 25",
    "Moves": "e5d4 d3d4 f7f6 d4a7 d8e7 a7a6",
    "Rating": 1673,
    "RatingDeviation": 74,
    "Popularity": 96,
    "NbPlays": 15208,
    "Themes": "advantage hangingPiece long middlegame"
  }
]
```

| Field | Type | Meaning |
|---|---|---|
| `PuzzleId` | string | Lichess puzzle identifier |
| `FEN` | string | Position **before** the opponent's setup move |
| `Moves` | string | Space-separated UCI moves. The **first** move is played by the engine to reach the puzzle position; the solver plays every subsequent odd-indexed move. |
| `Rating` | number | Lichess difficulty rating |
| `RatingDeviation` | number | Rating uncertainty |
| `Popularity` | number | Lichess popularity score |
| `NbPlays` | number | Times played on Lichess |
| `Themes` | string | Space-separated tactical theme tags |

## Usage notes

- All responses are static files on a CDN; there is no rate limit, no auth, and
  no API key. Please cache rather than re-fetching in a loop.
- The dataset is regenerated weekly from the Lichess open puzzle database.
- Puzzle data originates from Lichess and is distributed under
  [CC0](https://database.lichess.org/) — attribute Lichess when you reuse it.

## What is intentionally absent

There is no login, no protected API, no OAuth server and no MCP server. Player
ratings, settings and game history live in the browser's local storage and are
never uploaded, so there is nothing for an agent to authenticate against.
