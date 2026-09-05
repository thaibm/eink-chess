const ChessEngine = require('../js/chess-engine.js');

function createMockElement(tag) {
    var children = [];
    var attributes = {};
    return {
        tagName: tag.toUpperCase(),
        className: '',
        innerHTML: '',
        style: {},
        attributes: attributes,
        children: children,
        parentNode: null,
        setAttribute: function(k, v) { attributes[k] = String(v); },
        getAttribute: function(k) { return attributes[k] !== undefined ? attributes[k] : null; },
        removeAttribute: function(k) { delete attributes[k]; },
        appendChild: function(c) { children.push(c); c.parentNode = this; return c; },
        getElementsByTagName: function(t) {
            var tagUpper = t.toUpperCase();
            var res = [];
            for (var i = 0; i < children.length; i++) {
                if (children[i].tagName === tagUpper) res.push(children[i]);
                var sub = children[i].getElementsByTagName(t);
                for (var j = 0; j < sub.length; j++) res.push(sub[j]);
            }
            return res;
        },
        getElementsByClassName: function(cls) {
            var targetClasses = cls.split(' ').filter(Boolean);
            var res = [];
            function traverse(node) {
                var nodeClasses = (node.className || '').split(' ').filter(Boolean);
                var allMatch = targetClasses.length > 0 && targetClasses.every(function(c) {
                    return nodeClasses.indexOf(c) !== -1;
                });
                if (allMatch) res.push(node);
                for (var k = 0; k < node.children.length; k++) {
                    traverse(node.children[k]);
                }
            }
            for (var i = 0; i < children.length; i++) {
                traverse(children[i]);
            }
            return res;
        },
        querySelector: function(sel) {
            if (sel.charAt(0) === '.') {
                var clsName = sel.substring(1).replace(/\./g, ' ');
                var found = this.getElementsByClassName(clsName);
                return found.length > 0 ? found[0] : null;
            }
            return null;
        }
    };
}

global.document = {
    getElementById: function(id) {
        if (!this.elements) this.elements = {};
        if (!this.elements[id]) {
            this.elements[id] = createMockElement('div');
            this.elements[id].id = id;
        }
        return this.elements[id];
    },
    createElement: function(tag) {
        return createMockElement(tag);
    },
    body: createMockElement('body')
};

global.window = global;
require('../js/chess-board.js');

describe('ChessBoard DOM & Touch/Click Delegation (ChessTwinkle pattern)', () => {
    let engine;
    let board;
    let lastMoved;

    beforeEach(() => {
        global.document.elements = {};
        engine = new ChessEngine();
        lastMoved = null;
        board = new global.ChessBoard('board-container', {
            engine: engine,
            orientation: 'w',
            onMove: function(move) {
                lastMoved = move;
                engine.makeMove(move);
                board.setLastMove(move.from, move.to);
            }
        });
    });

    test('Board DOM structure is created with 64 squares with data-r and data-c', () => {
        expect(board.squaresDOM.length).toBe(8);
        expect(board.squaresDOM[0].length).toBe(8);
        
        const firstSquare = board.squaresDOM[0][0];
        expect(firstSquare.getAttribute('data-r')).toBe('0');
        expect(firstSquare.getAttribute('data-c')).toBe('0');
    });

    test('Container level click delegation resolves square correctly', () => {
        const table = global.document.getElementById('board-container').children[0];
        expect(typeof table.onclick).toBe('function');
        expect(typeof table.ontouchstart).toBe('function');
        expect(typeof table.onmousedown).toBe('function');

        // Simulate touch on piece-inner at row 6, col 4 (e2 pawn)
        const sq = board.squaresDOM[6][4];
        const pieceInner = sq.getElementsByClassName('piece-inner')[0] || sq.children[2].children[0];

        // Call ontouchstart with pieceInner as target
        table.ontouchstart({
            target: pieceInner,
            preventDefault: function() {}
        });

        expect(board.selectedSquare).toEqual({ r: 6, c: 4 });
        expect(board.validMoves.length).toBe(2);
    });

    test('Clicking valid destination executes move through onMove callback', () => {
        // Select e2
        board.handleSquareClick(6, 4);
        // Click e4 (row 4, col 4)
        board.handleSquareClick(4, 4);

        expect(lastMoved).not.toBeNull();
        expect(lastMoved.from).toEqual({ r: 6, c: 4 });
        expect(lastMoved.to).toEqual({ r: 4, c: 4 });
        expect(board.selectedSquare).toBeNull();
    });

    test('Clicking the same selected piece deselects it', () => {
        board.handleSquareClick(6, 4);
        expect(board.selectedSquare).toEqual({ r: 6, c: 4 });

        board.handleSquareClick(6, 4);
        expect(board.selectedSquare).toBeNull();
    });

    test('Clicking an invalid empty square clears selection', () => {
        board.handleSquareClick(6, 4);
        expect(board.selectedSquare).toEqual({ r: 6, c: 4 });

        board.handleSquareClick(5, 0);
        expect(board.selectedSquare).toBeNull();
    });

    test('Orientation black correctly maps visual click to logical coordinates', () => {
        board.setOrientation('b');
        board.handleSquareClick(1, 3);
        expect(board.selectedSquare).toEqual({ r: 6, c: 4 });
    });

    test('setInteractive(false) prevents square selection and setInteractive(true) restores it', () => {
        board.setInteractive(false);
        expect(board.interactive).toBe(false);
        board.handleSquareClick(6, 4);
        expect(board.selectedSquare).toBeNull();

        board.setInteractive(true);
        expect(board.interactive).toBe(true);
        board.handleSquareClick(6, 4);
        expect(board.selectedSquare).toEqual({ r: 6, c: 4 });
    });

    test('setEngine restores interactivity on non-readOnly boards', () => {
        board.setInteractive(false);
        expect(board.interactive).toBe(false);

        const newEngine = new ChessEngine();
        board.setEngine(newEngine);
        expect(board.interactive).toBe(true);
    });
});
