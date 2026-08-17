// Manual calibration check for Level 5 vs Level 4 - kept out of the default
// `npm test` (Jest only auto-runs *.test.js) because a statistically solid
// sample here costs real wall-clock time: level 5 is time-boxed at ~1.2s
// per move, so 8 games can take several minutes. Run explicitly via:
//   npm run test:calibration
// This is the same methodology used to find and confirm the fix for the
// level 4 miscalibration bug (see the "Fix Level 4 difficulty" commit):
// play real games, alternate colors, score the higher level, expect it to
// win convincingly rather than trusting the LEVEL_CONFIG numbers on faith.
const { scoreHigherLevel } = require('./ladder-helpers.js');

const GAMES = 8;
const MAX_PLIES = 100;

console.log('Playing ' + GAMES + ' games, Level 5 vs Level 4 (alternating colors)...');
console.log('This takes a few minutes - level 5 is time-boxed at ~1.2s/move.\n');

const start = Date.now();
const score = scoreHigherLevel(5, 4, GAMES, MAX_PLIES);
const elapsedSec = ((Date.now() - start) / 1000).toFixed(1);

console.log('Level 5 score vs Level 4: ' + (score * 100).toFixed(1) + '% over ' + GAMES + ' games (' + elapsedSec + 's)');

if (score > 0.5) {
    console.log('PASS: Level 5 plays stronger than Level 4, as the difficulty ladder claims.');
    process.exit(0);
} else {
    console.log('FAIL: Level 5 did NOT score above 50% against Level 4 - the ladder may be miscalibrated (same class of bug as the level 4 fix).');
    process.exit(1);
}
