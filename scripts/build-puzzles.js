var fs = require('fs');
var readline = require('readline');
var path = require('path');
var childProcess = require('child_process');

// ============================================================
// PUZZLE BUILD SCRIPT — Folder-Based Weekly Rotation
// Reads lichess_db_puzzle.csv.zst (local or remote),
// filters by RatingDeviation, reservoir-samples 200/bucket (configurable),
// outputs data/puzzles/{ELO}/{NNN}.json + manifest.js
// ============================================================

var OUTPUT_DIR = path.join(__dirname, '..', 'data', 'puzzles');
var HTML_FILE = path.join(__dirname, '..', 'puzzles.html');
var ZST_FILE = path.join(__dirname, '..', 'lichess_db_puzzle.csv.zst');

// --- Configuration Defaults ---
var PUZZLES_PER_BUCKET = 200;   // Default puzzles per ELO bucket
var PUZZLES_PER_FILE = 100;     // Puzzles per JSON file
var MIN_ELO = 400;
var MAX_ELO = 2800;
var MAX_RD = 100;               // RatingDeviation <= 100

// --- Parse CLI args ---
var fetchLichess = process.argv.indexOf('--fetch-lichess') !== -1;
var cleanOnly = process.argv.indexOf('--clean-only') !== -1;

for (var a = 0; a < process.argv.length; a++) {
    var arg = process.argv[a];
    if (arg.indexOf('--count=') === 0) {
        var parsedCount = parseInt(arg.substring(8), 10);
        if (!isNaN(parsedCount) && parsedCount > 0) {
            PUZZLES_PER_BUCKET = parsedCount;
        }
    }
}

function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        var files = fs.readdirSync(folderPath);
        for (var fi = 0; fi < files.length; fi++) {
            var curPath = path.join(folderPath, files[fi]);
            if (fs.statSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        }
        fs.rmdirSync(folderPath);
    }
}

function cleanOutputDir() {
    if (fs.existsSync(OUTPUT_DIR)) {
        // Clean all files and subdirectories inside data/puzzles
        var entries = fs.readdirSync(OUTPUT_DIR);
        for (var idx = 0; idx < entries.length; idx++) {
            var entryPath = path.join(OUTPUT_DIR, entries[idx]);
            var stat = fs.statSync(entryPath);
            if (stat.isDirectory()) {
                deleteFolderRecursive(entryPath);
            } else {
                fs.unlinkSync(entryPath);
            }
        }
    } else {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    console.log('Cleaned output directory: ' + OUTPUT_DIR);
}

if (cleanOnly) {
    cleanOutputDir();
    console.log('Clean-only mode complete.');
    process.exit(0);
}

// --- Reservoir Sampling Buckets ---
var buckets = {};       // { '1200': [puzzle1, puzzle2, ...] }
var bucketCounts = {};  // { '1200': total_seen }

for (var i = MIN_ELO; i <= MAX_ELO; i += 100) {
    buckets[i] = [];
    bucketCounts[i] = 0;
}

function getBucket(elo) {
    var rounded = Math.floor(elo / 100) * 100;
    if (rounded < MIN_ELO) return -1;
    if (rounded > MAX_ELO) return -1;
    return rounded;
}

/**
 * Reservoir sampling: maintains a uniformly random sample of size PUZZLES_PER_BUCKET.
 * Each new item has probability (PUZZLES_PER_BUCKET / items_seen) of being included.
 */
function addToBucket(bucket, puzzle) {
    bucketCounts[bucket]++;
    var count = bucketCounts[bucket];

    if (buckets[bucket].length < PUZZLES_PER_BUCKET) {
        // Still filling the reservoir
        buckets[bucket].push(puzzle);
    } else {
        // Reservoir sampling: replace random element with probability PUZZLES_PER_BUCKET/count
        var j = Math.floor(Math.random() * count);
        if (j < PUZZLES_PER_BUCKET) {
            buckets[bucket][j] = puzzle;
        }
    }
}

function updatePuzzlesHtmlVersion(versionStr) {
    if (!fs.existsSync(HTML_FILE)) return;
    try {
        var content = fs.readFileSync(HTML_FILE, 'utf8');
        var regex = /(<script\s+src=["']data\/puzzles\/manifest\.js)(\?v=[^"']*)?(["']><\/script>)/i;
        if (regex.test(content)) {
            var updated = content.replace(regex, '$1?v=' + versionStr + '$3');
            fs.writeFileSync(HTML_FILE, updated, 'utf8');
            console.log('Updated manifest.js version query parameter in puzzles.html (?v=' + versionStr + ')');
        }
    } catch (e) {
        console.warn('Warning: Could not update puzzles.html version query parameter:', e.message);
    }
}

function writeOutput() {
    cleanOutputDir();

    var manifest = {};
    var totalPuzzles = 0;
    var totalFiles = 0;

    console.log('\n=== Puzzle Build Results ===');
    console.log('Bucket | Puzzles | Files | Seen (total qualifying)');
    console.log('-------|---------|-------|------------------------');

    var sortedKeys = Object.keys(buckets).sort(function(a, b) { return parseInt(a) - parseInt(b); });

    for (var ki = 0; ki < sortedKeys.length; ki++) {
        var key = sortedKeys[ki];
        var puzzles = buckets[key];
        if (puzzles.length === 0) {
            manifest[key] = 0;
            console.log('  ' + key + '  |    0    |   0   | ' + bucketCounts[key]);
            continue;
        }

        // Shuffle for extra randomness
        shuffle(puzzles);

        // Create bucket directory
        var bucketDir = path.join(OUTPUT_DIR, key);
        if (!fs.existsSync(bucketDir)) {
            fs.mkdirSync(bucketDir, { recursive: true });
        }

        // Split into files of PUZZLES_PER_FILE
        var fileCount = Math.ceil(puzzles.length / PUZZLES_PER_FILE);
        for (var f = 0; f < fileCount; f++) {
            var start = f * PUZZLES_PER_FILE;
            var end = Math.min(start + PUZZLES_PER_FILE, puzzles.length);
            var chunk = puzzles.slice(start, end);

            var fileNum = String(f + 1);
            while (fileNum.length < 3) fileNum = '0' + fileNum;
            var filePath = path.join(bucketDir, fileNum + '.json');
            fs.writeFileSync(filePath, JSON.stringify(chunk));
        }

        manifest[key] = fileCount;
        totalPuzzles += puzzles.length;
        totalFiles += fileCount;

        var pad = key.length < 5 ? ' ' : '';
        console.log('  ' + key + pad + ' |  ' + padNum(puzzles.length, 5) + '  |   ' + fileCount + '   | ' + bucketCounts[key]);
    }

    // Generate version timestamp YYYYMMDD_HHMMSS
    var now = new Date();
    var versionStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);

    // Write manifest.js
    var manifestContent = '// Auto-generated by build-puzzles.js — ' + now.toISOString().split('T')[0] + '\n';
    manifestContent += 'var PUZZLE_MANIFEST_VERSION = ' + JSON.stringify(versionStr) + ';\n';
    manifestContent += 'var PUZZLE_MANIFEST = ' + JSON.stringify(manifest) + ';\n';
    fs.writeFileSync(path.join(OUTPUT_DIR, 'manifest.js'), manifestContent);

    // Sync version to puzzles.html
    updatePuzzlesHtmlVersion(versionStr);

    console.log('-------|---------|-------|------------------------');
    console.log('Total: ' + totalPuzzles + ' puzzles in ' + totalFiles + ' files across ' + sortedKeys.length + ' buckets');
    console.log('Manifest written to: data/puzzles/manifest.js (Version: ' + versionStr + ')');
    console.log('Done!\n');
}

function padNum(num, width) {
    var s = String(num);
    while (s.length < width) s = ' ' + s;
    return s;
}

function shuffle(arr) {
    for (var si = arr.length - 1; si > 0; si--) {
        var sj = Math.floor(Math.random() * (si + 1));
        var tmp = arr[si];
        arr[si] = arr[sj];
        arr[sj] = tmp;
    }
}

// ============================================================
// MAIN: Create input stream and process
// ============================================================

function getInputStream(callback) {
    if (fetchLichess) {
        console.log('Downloading from Lichess...');
        console.log('URL: https://database.lichess.org/lichess_db_puzzle.csv.zst');
        var curl = childProcess.spawn('curl', ['-s', 'https://database.lichess.org/lichess_db_puzzle.csv.zst']);
        var zstd = childProcess.spawn('zstd', ['-d', '-c']);
        curl.stdout.pipe(zstd.stdin);
        curl.stderr.on('data', function(data) {
            process.stderr.write('[curl] ' + data);
        });
        zstd.stderr.on('data', function(data) {
            process.stderr.write('[zstd] ' + data);
        });
        callback(zstd.stdout);
    } else {
        // Default: read local .zst file
        if (!fs.existsSync(ZST_FILE)) {
            console.error('Error: ' + ZST_FILE + ' not found.');
            console.error('Run with --fetch-lichess to download from Lichess, or place the file in the project root.');
            process.exit(1);
        }
        console.log('Reading local file: ' + ZST_FILE);
        var zstd = childProcess.spawn('zstd', ['-d', '-c', ZST_FILE]);
        zstd.stderr.on('data', function(data) {
            process.stderr.write('[zstd] ' + data);
        });
        callback(zstd.stdout);
    }
}

getInputStream(function(inputStream) {
    var rl = readline.createInterface({
        input: inputStream,
        output: process.stdout,
        terminal: false
    });

    var isHeader = true;
    var totalProcessed = 0;
    var totalQualifying = 0;

    console.log('Filtering: RatingDeviation <= ' + MAX_RD + ', ELO range ' + MIN_ELO + '-' + MAX_ELO);
    console.log('Sampling: ' + PUZZLES_PER_BUCKET + ' puzzles/bucket (reservoir sampling)');
    console.log('Processing...\n');

    rl.on('line', function(line) {
        if (isHeader) {
            isHeader = false;
            return;
        }

        totalProcessed++;
        if (totalProcessed % 500000 === 0) {
            process.stdout.write('\r  Processed ' + (totalProcessed / 1000000).toFixed(1) + 'M lines...');
        }

        var parts = line.split(',');
        if (parts.length < 11) return;

        var rating = parseInt(parts[3], 10);
        var rd = parseInt(parts[4], 10);

        // Fast reject before creating object
        if (rd > MAX_RD) return;
        var bucket = getBucket(rating);
        if (bucket === -1) return;

        totalQualifying++;

        var puzzle = {
            PuzzleId: parts[0],
            FEN: parts[1],
            Moves: parts[2],
            Rating: rating,
            RatingDeviation: rd,
            Popularity: parseInt(parts[5], 10),
            NbPlays: parseInt(parts[6], 10),
            Themes: parts[7]
        };

        addToBucket(bucket, puzzle);
    });

    rl.on('close', function() {
        process.stdout.write('\r');
        console.log('Processed ' + totalProcessed + ' total lines.');
        console.log('Qualifying puzzles (RD<=' + MAX_RD + '): ' + totalQualifying);
        writeOutput();
    });
});
