/**
 * ====================================================================
 * CHESS COACH (ES5 COMPLIANT) — EinkChess Visual Arrow & Annotation Module
 * SVG Arrow overlays for Best Moves, Mistakes and Tactical Hints
 * Optimized for high-contrast E-ink screens (clean lines, zero blur)
 * ====================================================================
 */

(function(root) {
    'use strict';

    function ChessCoach(svgId, arrowsGroupId) {
        this.svgId = svgId || 'coach-svg';
        this.arrowsGroupId = arrowsGroupId || 'svg-arrows';
    }

    ChessCoach.prototype.sqCtr = function(s, isFlip) {
        var r = s >> 3, f = s & 7;
        var dr = isFlip ? r : 7 - r;
        var dc = isFlip ? 7 - f : f;
        return { x: dc + 0.5, y: dr + 0.5 };
    };

    ChessCoach.prototype.drawArrow = function(from, to, color, isFlip) {
        var g = document.getElementById(this.arrowsGroupId);
        if (!g) return;
        var fc = this.sqCtr(from, isFlip), tc = this.sqCtr(to, isFlip);
        var dx = tc.x - fc.x, dy = tc.y - fc.y;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len < 0.01) return;
        var scale = Math.min(1, len);
        var startOff = 0.16 + 0.12 * scale, endOff = 0.22 + 0.16 * scale, sw = 0.06 + 0.04 * scale;
        var curveFactor = 0.05 * scale;
        var ex = tc.x - dx / len * endOff, ey = tc.y - dy / len * endOff;
        var sx = fc.x + dx / len * startOff, sy = fc.y + dy / len * startOff;
        var mid = { x: (sx + ex) / 2, y: (sy + ey) / 2 };
        var px = -dy / len * curveFactor, py = dx / len * curveFactor;
        var markMap = { green: 'arr-grn', teal: 'arr-teal', purple: 'arr-pur' };
        var markId = markMap[color] || 'arr-grn';
        var stroke = { green: 'rgba(0,0,0,0.85)', teal: 'rgba(80,80,80,0.8)', purple: 'rgba(120,120,120,0.8)' }[color] || 'rgba(0,0,0,0.85)';
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        var d = len < 1.5 ? 'M' + sx + ',' + sy + ' L' + ex + ',' + ey
            : 'M' + sx + ',' + sy + ' Q' + (mid.x + px) + ',' + (mid.y + py) + ' ' + ex + ',' + ey;
        path.setAttribute('d', d);
        path.setAttribute('stroke', stroke);
        path.setAttribute('stroke-width', String(sw));
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#' + markId + ')');
        g.appendChild(path);

        var svg = document.getElementById(this.svgId);
        if (svg) svg.style.display = 'block';
    };

    ChessCoach.prototype.clearArrows = function() {
        var g = document.getElementById(this.arrowsGroupId);
        if (g) g.innerHTML = '';
        var svg = document.getElementById(this.svgId);
        if (svg) svg.style.display = 'none';
    };

    var defaultCoach = new ChessCoach();

    root.ChessCoach = ChessCoach;
    root.coachInstance = defaultCoach;

    // Backward compatibility helper
    root.drawCoachArrow = function(from, to, color, isFlip) {
        defaultCoach.drawArrow(from, to, color, isFlip !== undefined ? isFlip : (typeof gFlip !== 'undefined' ? gFlip : false));
    };
    root.clearCoachArrows = function() {
        defaultCoach.clearArrows();
    };

})(typeof window !== 'undefined' ? window : this);
