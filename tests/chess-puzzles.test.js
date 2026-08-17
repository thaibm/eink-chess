const ChessStorage = require('../js/chess-storage.js');
const PuzzleManager = require('../js/chess-puzzles.js');

global.ChessStorage = ChessStorage;

describe('Chess Puzzle ELO & UX Mechanics', () => {
    let mockStorage = {};

    beforeEach(() => {
        mockStorage = {};
        global.localStorage = {
            getItem: (key) => mockStorage[key] || null,
            setItem: (key, val) => { mockStorage[key] = String(val); },
            removeItem: (key) => { delete mockStorage[key]; }
        };
        ChessStorage.setPuzzleElo(1200);
        ChessStorage.setPuzzleStreak(0);
        PuzzleManager.currentPuzzle = {
            PuzzleId: 'test01',
            FEN: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
            Moves: 'f3e5 c6e5',
            Rating: 1200
        };
        PuzzleManager.isSolved = false;
        PuzzleManager.hasFailed = false;
    });

    test('Initial Puzzle ELO is 1200', () => {
        expect(ChessStorage.getPuzzleElo()).toBe(1200);
        expect(ChessStorage.getPuzzleStreak()).toBe(0);
    });

    test('Clean Solve adds proportional ELO (expected ELO gain ~ +16 for equal rating)', () => {
        const result = PuzzleManager.applyEloChange(true, false);
        expect(result.oldElo).toBe(1200);
        expect(result.delta).toBe(16);
        expect(result.newElo).toBe(1216);
        expect(ChessStorage.getPuzzleElo()).toBe(1216);
    });

    test('Clean solve against higher rating puzzle gives larger ELO gain', () => {
        PuzzleManager.currentPuzzle.Rating = 1600;
        const result = PuzzleManager.applyEloChange(true, false);
        expect(result.delta).toBeGreaterThan(25);
        expect(result.newElo).toBe(1200 + result.delta);
    });

    test('Clean solve against lower rating puzzle gives minimum +3 ELO gain', () => {
        PuzzleManager.currentPuzzle.Rating = 600;
        const result = PuzzleManager.applyEloChange(true, false);
        expect(result.delta).toBe(3);
        expect(result.newElo).toBe(1203);
    });

    test('Failed / Skipped puzzle subtracts proportional ELO', () => {
        const result = PuzzleManager.applyEloChange(false, true);
        expect(result.oldElo).toBe(1200);
        expect(result.delta).toBe(-16);
        expect(result.newElo).toBe(1184);
        expect(ChessStorage.getPuzzleElo()).toBe(1184);
    });

    test('Skipping easy puzzle incurs high penalty', () => {
        PuzzleManager.currentPuzzle.Rating = 800;
        const result = PuzzleManager.applyEloChange(false, true);
        expect(result.delta).toBeLessThanOrEqual(-25);
        expect(ChessStorage.getPuzzleElo()).toBe(1200 + result.delta);
    });

    test('Skipping very hard puzzle incurs low penalty (minimum -1)', () => {
        PuzzleManager.currentPuzzle.Rating = 2400;
        const result = PuzzleManager.applyEloChange(false, true);
        expect(result.delta).toBeLessThan(0);
        expect(result.delta).toBeGreaterThanOrEqual(-4);
    });

    test('Action Bar button visibility state toggling', () => {
        const skipBtn = { style: { display: '' } };
        const nextBtn = { style: { display: 'none' } };
        const hintBtn = { style: { display: '' } };

        global.document = {
            getElementById: (id) => {
                if (id === 'btn-skip') return skipBtn;
                if (id === 'btn-next') return nextBtn;
                if (id === 'btn-hint') return hintBtn;
                return null;
            }
        };

        // Playing state
        PuzzleManager.isSolved = false;
        PuzzleManager.updateActionBarUI();
        expect(skipBtn.style.display).toBe('');
        expect(nextBtn.style.display).toBe('none');
        expect(hintBtn.style.display).toBe('');

        // Solved state
        PuzzleManager.isSolved = true;
        PuzzleManager.updateActionBarUI();
        expect(skipBtn.style.display).toBe('none');
        expect(nextBtn.style.display).toBe('');
        expect(hintBtn.style.display).toBe('none');
    });

    test('getSkipPenalty returns exact absolute loss points', () => {
        PuzzleManager.currentPuzzle.Rating = 1200;
        expect(PuzzleManager.getSkipPenalty()).toBe(16);

        PuzzleManager.currentPuzzle.Rating = 800;
        expect(PuzzleManager.getSkipPenalty()).toBeGreaterThanOrEqual(25);

        PuzzleManager.currentPuzzle.Rating = 2400;
        expect(PuzzleManager.getSkipPenalty()).toBeGreaterThanOrEqual(1);
        expect(PuzzleManager.getSkipPenalty()).toBeLessThanOrEqual(4);
    });

    test('skipPuzzle opens confirmation modal with penalty value', () => {
        const modal = { className: 'modal-overlay', style: { display: 'none' } };
        const body = { innerHTML: '' };
        const title = { innerText: '' };

        global.document = {
            getElementById: (id) => {
                if (id === 'skip-confirm-modal') return modal;
                if (id === 'skip-modal-body') return body;
                if (id === 'skip-modal-title') return title;
                return null;
            }
        };

        PuzzleManager.currentPuzzle.Rating = 1200;
        PuzzleManager.isSolved = false;
        PuzzleManager.skipPuzzle();

        expect(modal.className).toBe('modal-overlay active');
        expect(modal.style.display).toBe('block');
        expect(body.innerHTML).toContain('16 ELO');

        PuzzleManager.closeSkipModal();
        expect(modal.className).toBe('modal-overlay');
        expect(modal.style.display).toBe('none');
    });

    test('ChessStorage can save, retrieve and clear in-progress puzzle state', () => {
        expect(ChessStorage.getSavedPuzzle()).toBeNull();

        const puzzleState = {
            puzzle: { PuzzleId: 'p01', FEN: '8/8/8/8/8/8/8/8 w - - 0 1', Moves: 'e2e4 e7e5', Rating: 1400 },
            currentMoveIndex: 1,
            hasFailed: false,
            hintUsed: false
        };

        ChessStorage.savePuzzle(puzzleState);
        const retrieved = ChessStorage.getSavedPuzzle();
        expect(retrieved).not.toBeNull();
        expect(retrieved.puzzle.PuzzleId).toBe('p01');
        expect(retrieved.currentMoveIndex).toBe(1);

        ChessStorage.clearSavedPuzzle();
        expect(ChessStorage.getSavedPuzzle()).toBeNull();
    });

    test('PuzzleManager saves in-progress state and resumes correctly', () => {
        const ChessEngine = require('../js/chess-engine.js');
        PuzzleManager.engine = new ChessEngine();

        const puzzle = {
            PuzzleId: 'test_save_01',
            FEN: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
            Moves: 'f3e5 c6e5',
            Rating: 1300
        };

        // Start puzzle
        PuzzleManager.startPuzzle(puzzle);

        // Verify it was saved to storage
        const saved = ChessStorage.getSavedPuzzle();
        expect(saved).not.toBeNull();
        expect(saved.puzzle.PuzzleId).toBe('test_save_01');
        expect(saved.currentMoveIndex).toBe(1);
        expect(saved.hasFailed).toBe(false);
        expect(saved.hintUsed).toBe(false);

        // Simulate incorrect move attempt
        PuzzleManager.handlePlayerMove({ from: { r: 0, c: 0 }, to: { r: 1, c: 1 } });
        expect(PuzzleManager.hasFailed).toBe(true);
        const savedAfterFail = ChessStorage.getSavedPuzzle();
        expect(savedAfterFail.hasFailed).toBe(true);

        // Simulate page reload: re-create manager state and resume
        PuzzleManager.currentPuzzle = null;
        PuzzleManager.hasFailed = false;
        PuzzleManager.currentMoveIndex = 0;

        PuzzleManager.resumePuzzle(savedAfterFail);
        expect(PuzzleManager.currentPuzzle.PuzzleId).toBe('test_save_01');
        expect(PuzzleManager.currentMoveIndex).toBe(1);
        expect(PuzzleManager.hasFailed).toBe(true);

        // Confirming skip clears saved puzzle
        PuzzleManager.confirmSkip();
        expect(ChessStorage.getSavedPuzzle()).toBeNull();
    });

    test('Puzzle completion and nextPuzzle clear saved puzzle state', () => {
        const puzzleState = {
            puzzle: { PuzzleId: 'p02', FEN: '8/8/8/8/8/8/8/8 w - - 0 1', Moves: 'e2e4 e7e5', Rating: 1400, Themes: 'fork endgame' },
            currentMoveIndex: 1,
            hasFailed: false,
            hintUsed: false
        };
        ChessStorage.savePuzzle(puzzleState);
        expect(ChessStorage.getSavedPuzzle()).not.toBeNull();

        PuzzleManager.currentPuzzle = puzzleState.puzzle;
        PuzzleManager.puzzleSolved();
        expect(ChessStorage.getSavedPuzzle()).toBeNull();
    });

    test('updateHeaderUI renders puzzle meta text', () => {
        const metaEl = { innerText: '' };
        const eloBadge = { innerText: '' };
        const streakBadge = { innerText: '' };

        global.document = {
            getElementById: (id) => {
                if (id === 'puzzle-meta') return metaEl;
                if (id === 'puzzle-elo-badge') return eloBadge;
                if (id === 'puzzle-streak-name') return streakBadge;
                return null;
            }
        };

        PuzzleManager.currentPuzzle = { PuzzleId: 'xyz12', Rating: 1650 };
        PuzzleManager.updateHeaderUI();
        expect(metaEl.innerText).toContain('xyz12');
        expect(metaEl.innerText).toContain('1650');
    });

    test('puzzleSolved renders Themes and Lichess analysis link in modal body', () => {
        const modal = { className: '', style: { display: 'none' } };
        const body = { innerHTML: '' };
        const title = { innerText: '' };

        global.document = {
            getElementById: (id) => {
                if (id === 'gameover-modal') return modal;
                if (id === 'gameover-body') return body;
                if (id === 'gameover-title') return title;
                return null;
            }
        };

        PuzzleManager.currentPuzzle = {
            PuzzleId: 'abc99',
            Rating: 1500,
            Themes: 'advantage discoveredAttack endgame'
        };
        PuzzleManager.hasFailed = false;
        PuzzleManager.puzzleSolved();

        expect(body.innerHTML).toContain('advantage, discoveredAttack, endgame');
        expect(body.innerHTML).toContain('https://lichess.org/training/abc99');
        expect(body.innerHTML).toContain('Analyze on Lichess');
    });

    test('First-time user has not chosen puzzle skill and defaults to easiest ELO (400)', () => {
        delete mockStorage['einkchess_puzzle_setup_done'];
        delete mockStorage['einkchess_puzzle_elo'];
        expect(ChessStorage.hasChosenPuzzleSkill()).toBe(false);
        expect(ChessStorage.getPuzzleElo()).toBe(400);
    });

    test('PuzzleManager opens skill modal on first time and default selection is 400', () => {
        delete mockStorage['einkchess_puzzle_setup_done'];
        delete mockStorage['einkchess_puzzle_elo'];

        let modalActive = false;
        const modal = {
            className: 'modal-overlay',
            style: { display: 'none' }
        };
        const btn400 = { getAttribute: () => '400', className: 'puzzle-skill-btn' };
        const btn800 = { getAttribute: () => '800', className: 'puzzle-skill-btn' };
        const btn1200 = { getAttribute: () => '1200', className: 'puzzle-skill-btn' };
        const btnList = [btn400, btn800, btn1200];

        global.document = {
            getElementById: (id) => {
                if (id === 'skill-modal') return modal;
                return null;
            },
            querySelectorAll: (sel) => {
                if (sel === '.puzzle-skill-btn') return btnList;
                return [];
            }
        };

        PuzzleManager.openSkillModal();
        expect(modal.className).toBe('modal-overlay active');
        expect(modal.style.display).toBe('block');
        expect(PuzzleManager.selectedInitialElo).toBe(400);
        expect(btn400.className).toBe('puzzle-skill-btn active');
        expect(btn800.className).toBe('puzzle-skill-btn');
    });

    test('Selecting a skill level and confirming updates ELO and marks setup as completed', () => {
        delete mockStorage['einkchess_puzzle_setup_done'];
        delete mockStorage['einkchess_puzzle_elo'];

        const modal = { className: 'modal-overlay active', style: { display: 'block' } };
        const metaEl = { innerText: '' };
        const eloBadge = { innerText: '' };
        const streakBadge = { innerText: '' };
        const btn400 = { getAttribute: () => '400', className: 'puzzle-skill-btn active' };
        const btn800 = { getAttribute: () => '800', className: 'puzzle-skill-btn' };
        const btnList = [btn400, btn800];

        global.document = {
            getElementById: (id) => {
                if (id === 'skill-modal') return modal;
                if (id === 'puzzle-meta') return metaEl;
                if (id === 'puzzle-elo-badge') return eloBadge;
                if (id === 'puzzle-streak-name') return streakBadge;
                return null;
            },
            querySelectorAll: (sel) => {
                if (sel === '.puzzle-skill-btn') return btnList;
                return [];
            }
        };

        // Select 800
        PuzzleManager.selectSkillLevel(800);
        expect(PuzzleManager.selectedInitialElo).toBe(800);
        expect(btn800.className).toBe('puzzle-skill-btn active');
        expect(btn400.className).toBe('puzzle-skill-btn');

        // Confirm
        let loadCalled = false;
        PuzzleManager.loadPuzzle = () => { loadCalled = true; };
        PuzzleManager.confirmSkillLevel();

        expect(ChessStorage.getPuzzleElo()).toBe(800);
        expect(ChessStorage.hasChosenPuzzleSkill()).toBe(true);
        expect(modal.className).toBe('modal-overlay');
        expect(modal.style.display).toBe('none');
        expect(loadCalled).toBe(true);
    });
});


