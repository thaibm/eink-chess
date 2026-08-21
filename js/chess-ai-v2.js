(function(root) {
    'use strict';

    function ChessAIV2(level) {
        this.level = level || 1;
        this.worker = null;
        this.isWorkerReady = false;
        this.onMoveFound = null; // Callback for when worker finishes
        this.currentEngine = null; // Stored engine reference
        
        this.initWorker();
    }

    ChessAIV2.prototype.initWorker = function() {
        if (!window.TOMITANK_SOURCE) {
            console.error("TOMITANK_SOURCE is not defined.");
            return;
        }

        // [PPW3-FIX] Kindle Paperwhite 3 (WebKit) workaround for Web Worker setTimeout bugs
        var fixScript = "function _tomiDeferredSetTimeout(fn, delay) { return setTimeout(fn, delay); }\n";
        var workerSrc = window.TOMITANK_SOURCE.replace(/setTimeout\(/g, "_tomiDeferredSetTimeout(");
        workerSrc = fixScript + workerSrc;

        console.log("ChessAIV2: Initializing worker, level =", this.level);
        
        var blob = new Blob([workerSrc], { type: 'application/javascript' });
        var workerUrl = window.URL.createObjectURL(blob);
        
        console.log("ChessAIV2: Blob URL created:", workerUrl);
        this.worker = new Worker(workerUrl);
        
        var self = this;
        var _pendingUci = null;
        var _lastInfoScore = 0;
        
        this.worker.onerror = function(err) {
            console.error("ChessAIV2: Worker error captured:", err.message, "at", err.filename, ":", err.lineno);
        };
        
        this.worker.onmessage = function(e) {
            var msg = e.data;
            console.log("ChessAIV2: Worker sent message ->", msg);
            if (typeof msg !== 'string') return;
            
            if (msg === 'uciok') {
                self.isWorkerReady = true;
                console.log("ChessAIV2: Worker is ready (uciok)");
                // Limit Hash to 16MB for Kindle low memory
                self.worker.postMessage('setoption name Hash value 16');
                self.worker.postMessage('ucinewgame');
                self.worker.postMessage('isready');
            } else if (msg.indexOf('info ') === 0 && msg.indexOf('score cp ') > 0 && msg.indexOf('nodes ') > 0) {
                // Parse score to use for cpLoss calculation later
                var match = msg.match(/score (cp|mate) (-?\d+)/);
                if (match) {
                    _lastInfoScore = match[1] === 'mate' ? (parseInt(match[2], 10) > 0 ? 99999 : -99999) : parseInt(match[2], 10);
                }
            } else if (msg.indexOf('bestmove') === 0) {
                var parts = msg.split(' ');
                _pendingUci = parts[1]; // e.g. "e2e4"
                console.log("ChessAIV2: Parsed pending bestmove ->", _pendingUci);
            } else if (msg.indexOf('best4rootmoves ') === 0) {
                var bestUci = _pendingUci;
                _pendingUci = null;
                
                var best4 = null;
                try {
                    best4 = JSON.parse(msg.slice('best4rootmoves '.length));
                } catch (err) {
                    console.error("ChessAIV2: Failed to parse best4rootmoves JSON:", err);
                }
                
                console.log("ChessAIV2: Received best4rootmoves ->", best4, "pending move:", bestUci);
                
                if (self.onMoveFound) {
                    var cb = self.onMoveFound;
                    self.onMoveFound = null;
                    
                    // Apply Noise if applicable
                    bestUci = self.applyNoise(bestUci, best4, _lastInfoScore);
                    
                    var moveObj = self.uciToMoveObj(bestUci, self.currentEngine);
                    self.currentEngine = null; // Clear reference
                    console.log("ChessAIV2: Calling callback with moveObj:", moveObj);
                    cb(moveObj, _lastInfoScore);
                } else {
                    console.warn("ChessAIV2: best4rootmoves received but self.onMoveFound is null!");
                }
            }
        };

        console.log("ChessAIV2: Sending tankyworker and uci command to worker.");
        this.worker.postMessage('tankyworker');
        this.worker.postMessage('uci');
    };

    ChessAIV2.prototype.applyNoise = function(bestUci, best4, bestScore) {
        if (this.level > 7 || !best4 || best4.length < 2) return bestUci;
        
        var AI_MOVE_NOISE_CFG = [
            { noiseCp: 0, chance: 0 },       // Level 0 (unused)
            { noiseCp: 180, chance: 0.50 },  // Level 1
            { noiseCp: 130, chance: 0.40 },  // Level 2
            { noiseCp: 90, chance: 0.30 },   // Level 3
            { noiseCp: 60, chance: 0.25 },   // Level 4
            { noiseCp: 40, chance: 0.20 },   // Level 5
            { noiseCp: 25, chance: 0.15 },   // Level 6
            { noiseCp: 15, chance: 0.10 },   // Level 7
            { noiseCp: 0, chance: 0.00 }     // Level 8
        ];
        
        var cfg = AI_MOVE_NOISE_CFG[this.level];
        if (!cfg) return bestUci;
        
        if (Math.random() >= cfg.chance) return bestUci; // Roll failed, play best move
        
        var candidates = [];
        for (var i = 0; i < best4.length; i++) {
            var cand = best4[i];
            if (!cand || !cand.move || cand.move === bestUci) continue;
            
            var cpLoss = bestScore - cand.score;
            if (cpLoss < 0) cpLoss = 0; // Just in case
            
            if (cpLoss <= cfg.noiseCp) {
                candidates.push(cand.move);
            }
        }
        
        if (candidates.length > 0) {
            // Pick a random sub-optimal move
            var pickIdx = Math.floor(Math.random() * candidates.length);
            console.log("AI Applied Noise: Replaced " + bestUci + " with " + candidates[pickIdx]);
            return candidates[pickIdx];
        }
        
        return bestUci;
    };

    ChessAIV2.prototype.uciToMoveObj = function(uci, engine) {
        if (!uci || uci.length < 4 || uci === '(none)') return null;
        var fromCol = uci.charCodeAt(0) - 97; // 'a' = 97
        var fromRow = 8 - parseInt(uci.charAt(1), 10);
        var toCol = uci.charCodeAt(2) - 97;
        var toRow = 8 - parseInt(uci.charAt(3), 10);
        
        var promo = null;
        if (uci.length === 5) {
            promo = uci.charAt(4).toLowerCase();
        }
        
        if (engine) {
            var legalMoves = engine.getAllLegalMoves(engine.turn);
            for (var i = 0; i < legalMoves.length; i++) {
                var m = legalMoves[i];
                if (m.from.r === fromRow && m.from.c === fromCol &&
                    m.to.r === toRow && m.to.c === toCol) {
                    if (promo) {
                        if (m.promotion && m.promotion.toLowerCase() === promo) {
                            return m;
                        }
                    } else {
                        return m;
                    }
                }
            }
        }
        
        // Fallback to bare object if engine is not provided or move not found
        var move = {
            from: { r: fromRow, c: fromCol },
            to: { r: toRow, c: toCol }
        };
        if (promo) {
            move.promotion = promo;
        }
        return move;
    };

    ChessAIV2.prototype.getBestMove = function(engine, callback) {
        console.log("ChessAIV2: getBestMove requested. isWorkerReady =", this.isWorkerReady, "level =", this.level);
        if (!this.worker || !this.isWorkerReady) {
            console.warn("ChessAIV2: Worker not ready yet. Returning callback(null) fallback.");
            // Fallback: return null so UI doesn't hang indefinitely.
            if (callback) callback(null);
            return;
        }
        
        this.currentEngine = engine; // Store reference
        this.onMoveFound = callback;

        // Time limits (ms)
        var ELO_TIME_MAP = {
            1: 200, 2: 400, 3: 700, 4: 1000, 5: 1500,
            6: 2000, 7: 4000, 8: 6000, 9: 8000, 10: 12000
        };
        var thinkTime = ELO_TIME_MAP[this.level] || 1000;

        var fen = engine.toFEN();
        console.log("ChessAIV2: Posting to worker -> position fen:", fen, "go movetime:", thinkTime);
        this.worker.postMessage('position fen ' + fen);
        this.worker.postMessage('go movetime ' + thinkTime);
    };

    // Update level during runtime
    ChessAIV2.prototype.setLevel = function(level) {
        this.level = level;
    };

    root.ChessAIV2 = ChessAIV2;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ChessAIV2;
    }

})(typeof window !== 'undefined' ? window : this);
