const { scoreHigherLevel } = require('./ladder-helpers.js');

// Regression guard for the difficulty ladder: each level should actually
// play stronger than the level below it. This is not a given just because
// LEVEL_CONFIG *looks* like it increases in strength (fixedDepth going up,
// quiescence toggled on/off) - it has to be measured. Level 4 previously
// ran one extra ply of search but WITHOUT quiescence, and empirically
// scored only 20.8% against level 3 (i.e. was weaker, not stronger) before
// that was fixed. These tests play real games so a similar miscalibration
// would fail loudly here instead of shipping silently.
//
// Game counts are kept small (this runs real search, not a mock) and the
// pass bar is score > 50% rather than requiring dominance, to stay fast
// and avoid flakiness from any single game's randomness while still
// reliably catching a real regression the size of the one found above.

describe('Difficulty ladder calibration (each level should beat the one below it)', () => {
    // Levels 1-4 are fixed-depth (no time budget) so these run in
    // milliseconds regardless of game count - kept generous for a solid
    // statistical signal, cheap enough to run on every `npm test`.
    //
    // Level 5 vs Level 4 is deliberately NOT covered here: level 5 is
    // time-boxed (~1.2s/move), so a statistically solid sample (need
    // ~8 games - anything smaller, e.g. 3 games, hits exact tie scores
    // like 0.5 by pure chance and flakes even when the ladder is fine)
    // costs several minutes of real wall-clock time. That doesn't belong
    // in the default fast suite. See tests/calibration-level5.js, run
    // manually via `npm run test:calibration` when you actually need to
    // re-verify that leg (e.g. before a PR, after touching level 5's
    // search).
    // 12 games / 80-ply cap: large enough that an exact tie on the 0.5
    // boundary is statistically very unlikely given the measured true gap
    // (71-92% - see the commit that fixed level 4), while staying within a
    // reasonable suite runtime. (A larger sample like 20 games was tried
    // and pushed this single file well past a minute - not worth it for
    // marginally tighter confidence.)
    const GAMES = 12;
    const MAX_PLIES = 80;

    test('Level 2 beats Level 1 more often than not', () => {
        const score = scoreHigherLevel(2, 1, GAMES, MAX_PLIES);
        expect(score).toBeGreaterThan(0.5);
    }, 60000);

    test('Level 3 beats Level 2 more often than not', () => {
        const score = scoreHigherLevel(3, 2, GAMES, MAX_PLIES);
        expect(score).toBeGreaterThan(0.5);
    }, 60000);

    test('Level 4 beats Level 3 more often than not', () => {
        const score = scoreHigherLevel(4, 3, GAMES, MAX_PLIES);
        expect(score).toBeGreaterThan(0.5);
    }, 60000);
});
