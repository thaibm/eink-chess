/**
 * ====================================================================
 * CHESS REVIEW & CLASSIFY (ES5 COMPLIANT) — EinkChess Game Review Module
 * Move classification (Brilliant, Great, Best, Inaccuracy, Mistake, Blunder),
 * Static Exchange Evaluation (SEE), Win Chance, and Post-Game Review
 * ====================================================================
 */

(function(root) {
    "use strict";

    var W = 1, B = -1, E = 0;
    var PVAL = [0, 100, 320, 330, 500, 900, 20000];

    function rk(s) { return s >> 3; }
    function fl(s) { return s & 7; }
    function sq(r, f) { return (r << 3) | f; }
    function ob(r, f) { return r >= 0 && r < 8 && f >= 0 && f < 8; }
    function col(p) { return p > 0 ? W : p < 0 ? B : 0; }
    function typ(p) { return p < 0 ? -p : p; }

    var LABEL_TEXT = {
        brilliant: '!! Brilliant — Nước đi thiên tài!',
        great: '! Great Move — Nước đi xuất sắc!',
        best: '★ Best Move',
        greatDef: '[!] Great Defense — Phòng thủ xuất sắc!',
        missedWin: '[+] Missed Win — Bỏ lỡ cơ hội thắng!',
        missedMate: '[#] Missed Mate — Bỏ lỡ chiếu hết!',
        mistake: '? Mistake — Có nước tốt hơn',
        blunder: '?? Blunder — Sai lầm nghiêm trọng!'
    };

    var LABEL_CSS = {
        brilliant: 'brilliant', great: 'great', best: 'best',
        greatDef: 'great', missedWin: 'mistake', missedMate: 'blunder',
        mistake: 'mistake', blunder: 'blunder'
    };

    var REVIEW_BADGE_MAP = {
        brilliant: { cls: 'rb-brilliant', sym: '!!' },
        great: { cls: 'rb-great', sym: '!' },
        greatDef: { cls: 'rb-great', sym: '!' },
        best: { cls: 'rb-best', sym: '★' },
        blunder: { cls: 'rb-blunder', sym: '??' },
        mistake: { cls: 'rb-mistake', sym: '?' },
        missedMate: { cls: 'rb-missed', sym: '??' },
        missedWin: { cls: 'rb-missed', sym: '?' }
    };

    function winPct(cp) {
        return 100 / (1 + Math.pow(10, -cp / 400));
    }

    function seeFull(board, toSq, initVal, sideFirst) {
            var simB = board.slice();   /* bản sao — không mutate board thật */

            /* Lấy attacker nhỏ nhất của bên `side` còn trên board, trả về {sq, val} hoặc null */
            function lva(side) {
                var bestSq = -1, bestVal = 999999;
                var r2 = rk(toSq), f2 = fl(toSq), p, r, f, sq2, cand;

                /* Tốt */
                var pawnRank = (side === W) ? r2 - 1 : r2 + 1;
                for (var df2 = -1; df2 <= 1; df2 += 2) {
                    var pf = f2 + df2;
                    if (!ob(pawnRank, pf)) continue;
                    cand = simB[sq(pawnRank, pf)];
                    if (cand && col(cand) === side && typ(cand) === 1 && PVAL[1] < bestVal) { bestSq = sq(pawnRank, pf); bestVal = PVAL[1]; }
                }
                /* Mã */
                var NR2 = [2, 2, -2, -2, 1, -1, 1, -1], NF2 = [1, -1, 1, -1, 2, 2, -2, -2];
                for (var ni = 0; ni < 8; ni++) {
                    sq2 = sq(r2 + NR2[ni], f2 + NF2[ni]);
                    if (sq2 < 0 || sq2 > 63) continue;
                    if (!ob(r2 + NR2[ni], f2 + NF2[ni])) continue;
                    cand = simB[sq2];
                    if (cand && col(cand) === side && typ(cand) === 2 && PVAL[2] < bestVal) { bestSq = sq2; bestVal = PVAL[2]; }
                }
                /* Tượng + Hậu (chéo) */
                var DD = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
                for (var di = 0; di < 4; di++) {
                    r = r2 + DD[di][0]; f = f2 + DD[di][1];
                    while (ob(r, f)) {
                        p = simB[sq(r, f)];
                        if (p) {
                            if (col(p) === side && (typ(p) === 3 || typ(p) === 5) && PVAL[typ(p)] < bestVal) { bestSq = sq(r, f); bestVal = PVAL[typ(p)]; }
                            break;
                        }
                        r += DD[di][0]; f += DD[di][1];
                    }
                }
                /* Xe + Hậu (thẳng) */
                var SD = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                for (var si = 0; si < 4; si++) {
                    r = r2 + SD[si][0]; f = f2 + SD[si][1];
                    while (ob(r, f)) {
                        p = simB[sq(r, f)];
                        if (p) {
                            if (col(p) === side && (typ(p) === 4 || typ(p) === 5) && PVAL[typ(p)] < bestVal) { bestSq = sq(r, f); bestVal = PVAL[typ(p)]; }
                            break;
                        }
                        r += SD[si][0]; f += SD[si][1];
                    }
                }
                /* Vua */
                var KR = [1, 0, -1, 0, 1, 1, -1, -1], KF = [0, 1, 0, -1, 1, -1, 1, -1];
                for (var ki = 0; ki < 8; ki++) {
                    if (!ob(r2 + KR[ki], f2 + KF[ki])) continue;
                    sq2 = sq(r2 + KR[ki], f2 + KF[ki]);
                    cand = simB[sq2];
                    if (cand && col(cand) === side && typ(cand) === 6 && PVAL[6] < bestVal) { bestSq = sq2; bestVal = PVAL[6]; }
                }
                return bestSq >= 0 ? { sq: bestSq, val: bestVal } : null;
            }

            /* [FIX BUG NGHIÊM TRỌNG — 27/07] Công thức backward pass CŨ
               (`gain[depth-1]=-Math.max(-gain[depth-1],gain[depth])` rồi
               `return gain[0]-initVal`) tính SAI — đã verify bằng test độc lập:
               ngay cả trường hợp ĐƠN GIẢN NHẤT (Hậu bị 1 Tượng ăn TỰ DO, không ai
               bảo vệ, không có nước ăn lại nào) cũng bị hàm báo "an toàn" (kết quả
               âm) thay vì đúng ra phải là "mất trắng Hậu" (kết quả +900). Đây
               chính là nguyên nhân AI đi Hậu vào ô bị Tượng ăn tự do (Qb8 rồi
               10.Bxb8) mà toàn bộ lưới an toàn (aiMoveIsSafe/blunder-guard) không
               chặn được — vì playerPieceHangsAfterMove()/seeNegative() dựa hoàn
               toàn vào seeFull() này.
          
               Công thức ĐÚNG (minimax lùi chuẩn, đã verify bằng số cụ thể cho cả
               2 case: treo tự do và có quân bảo vệ đổi lại):
                 victims[] = dãy giá trị quân bị ăn ở MỖI lượt (y hệt forward pass
                             cũ, không đổi — forward pass cũ vốn ĐÚNG, chỉ backward
                             pass sai).
                 f(cuối+1) = 0 (hết quân tấn công, không ăn thêm được nữa)
                 f(d) = max(0, victims[d] - f(d+1))  — bên tới lượt ở ply d chỉ ăn
                        nếu có lợi RÒNG sau khi trừ đi phần đối phương ăn lại tối
                        ưu ở các lượt sau; nếu không lợi thì "đứng yên" (dừng chuỗi,
                        +0).
                 Kết quả cuối = f(1) = lợi ròng TỐI ƯU cho sideFirst (bên ăn trước).
                        LUÔN ≥0 (vì có lựa chọn "không ăn gì cả" làm sàn). */
            var victims = [];
            var side = sideFirst;
            var victimVal = initVal;
            var depth = 0;

            while (depth < 12) {
                var att = lva(side);
                if (!att) break;                   /* bên này không còn quân tấn công */
                victims.push(victimVal);          /* nếu ăn ở lượt này, thu được victimVal */
                /* Mô phỏng: di chuyển attacker đến toSq (x-ray: quân sau lộ ra) */
                simB[toSq] = simB[att.sq];
                simB[att.sq] = E;
                victimVal = att.val;              /* quân vừa ăn là con mồi lượt tiếp */
                side = -side;
                depth++;
            }

            var f = 0;
            for (var d = victims.length - 1; d >= 0; d--) {
                f = Math.max(0, victims[d] - f);
            }
            return f;
            /* f > 0: sideFirst (bên ăn trước) có lợi ròng qua chuỗi trao đổi tại
               toSq — dùng trực tiếp, KHÔNG trừ initVal (khác bản cũ). */
        }

    function seeNegative(board, toSq, playerCol) {
            if (!attacked(board, toSq, -playerCol)) return false;  /* fast-path */
            var p = board[toSq];
            if (!p) return false;
            var seeScore = seeFull(board, toSq, PVAL[typ(p)], -playerCol);
            /* seeScore > 20: địch thắng chuỗi → đây là hi sinh thực sự của player */
            return seeScore > 20;
        }

    function playerMissedHanging(boardBefore, playerMv, playerCol) {
            /* Did player fail to capture a hanging piece? */
            if (!boardBefore) return false;
            var oppCol = -playerCol;
            var epB = (typeof playerMv._epBefore === 'number') ? playerMv._epBefore : -1;
            var casB = (typeof playerMv._casBefore === 'number') ? playerMv._casBefore : CAS_ALL;
            var legalBefore = null; // tính lười, chỉ khi thực sự có ứng viên
            for (var i = 0; i < 64; i++) {
                var p = boardBefore[i];
                if (!p || col(p) !== oppCol || typ(p) < 2) continue;
                /* Is this opponent piece hanging (attacked by player, not defended)? */
                if (attacked(boardBefore, i, playerCol) && !attacked(boardBefore, i, oppCol)) {
                    /* Player didn't take it */
                    if (playerMv[1] !== i) {
                        /* [FIX ghim] chỉ tính "bỏ lỡ" nếu có nước đi HỢP LỆ thật ăn được
                           quân này — loại trừ trường hợp quân tấn công duy nhất đang bị
                           ghim (attacked() chỉ kiểm tra pseudo-legal, không biết đi sẽ
                           lộ Vua). */
                        if (!legalBefore) legalBefore = legalMoves(boardBefore, playerCol, epB, casB);
                        for (var j = 0; j < legalBefore.length; j++) {
                            if (legalBefore[j][1] === i) return true;
                        }
                    }
                }
            }
            return false;
        }

    function playerPieceHangsAfterMove(boardAfter, playerMv, playerCol) {
            var to = playerMv[1];
            var p = boardAfter[to];
            if (!p || col(p) !== playerCol || typ(p) < 2) return false;
            if (typ(p) === 6) return false;  /* vua không thể "hang" */
            if (!attacked(boardAfter, to, -playerCol)) return false;  /* fast-path */
            /* Địch tấn công đầu tiên (sideFirst = -playerCol).
               seeScore > 20: địch thắng chuỗi → quân player thực sự bị treo. */
            var seeScore = seeFull(boardAfter, to, PVAL[typ(p)], -playerCol);
            return seeScore > 20;
        }

    function findHangingPieceValueExcept(board, playerCol, exceptSq) {
            var maxVal = 0;
            for (var sq = 0; sq < 64; sq++) {
                if (sq === exceptSq) continue;
                var p = board[sq];
                if (!p || col(p) !== playerCol || typ(p) < 2 || typ(p) === 6) continue;
                if (!attacked(board, sq, -playerCol)) continue;
                var seeScore = seeFull(board, sq, PVAL[typ(p)], -playerCol);
                if (seeScore > 20 && seeScore > maxVal) maxVal = seeScore;
            }
            return maxVal;
        }

    function classifyMove(data) {
            var evalBefore = (typeof data.evalBefore === 'number' && isFinite(data.evalBefore)) ? data.evalBefore : 0;
            var evalBest = (typeof data.evalBest === 'number' && isFinite(data.evalBest)) ? data.evalBest : evalBefore;
            var evalActual = (typeof data.evalActual === 'number' && isFinite(data.evalActual)) ? data.evalActual : evalBefore;
            var mateBest = (typeof data.mateBest === 'number' && isFinite(data.mateBest)) ? data.mateBest : null;
            var mateActual = (typeof data.mateActual === 'number' && isFinite(data.mateActual)) ? data.mateActual : null;
            var shallowBest = (typeof data.shallowBest === 'number' && isFinite(data.shallowBest)) ? data.shallowBest : evalBest;
            var shallowActual = (typeof data.shallowActual === 'number' && isFinite(data.shallowActual)) ? data.shallowActual : evalActual;
            var isSacrifice = !!data.isSacrifice;
            var materialLost = (typeof data.materialLost === 'number' && isFinite(data.materialLost)) ? data.materialLost : 0;
            var numGoodAlt = (typeof data.numGoodAlt === 'number' && isFinite(data.numGoodAlt)) ? data.numGoodAlt : 1;
            var rating = (typeof data.rating === 'number' && isFinite(data.rating)) ? data.rating : 1500;
            var eval2ndBest = (typeof data.eval2ndBest === 'number' && isFinite(data.eval2ndBest)) ? data.eval2ndBest : null;

            var strictness = 1.0;
            if (rating < 900) strictness = 1.20;
            else if (rating < 1400) strictness = 1.10;
            else if (rating < 2000) strictness = 1.00;
            else if (rating < 2400) strictness = 0.92;
            else strictness = 0.85;

            var cpLoss = Math.max(0, evalBest - evalActual);
            var cpLossShallow = Math.max(0, shallowBest - shallowActual);

            /* [FIX mate-vs-mate] Khi CA truoc va sau nuoc di deu dang bi mate
               (mateBest<0 && mateActual<0 — chi kha thi tu khi co mate-in-N THAT qua
               gPendingMateN/epr2.mateN; truoc day _mateBest/_mateActual chi la 1/null
               nen truong hop nay chua bao gio xay ra), phep tru cp tho o thang bao
               hoa ±9999 vo nghia (khong phan anh dung muc do te hon). Thay bang so
               sanh truc tiep do-sau-mate: mate toi GAN hon (it nuoc hon) = te hon.
               Quy doi ~200cp/1 ply rut ngan, dong bo don vi voi mistakeLimit ben
               duoi de van roi dung tier Mistake/Blunder. */
            if (mateBest !== null && mateActual !== null && mateBest < 0 && mateActual < 0) {
                var mateWorsenPly = Math.abs(mateActual) - Math.abs(mateBest); // am = mate den nhanh hon
                if (mateWorsenPly < 0) cpLoss = Math.max(cpLoss, Math.abs(mateWorsenPly) * 200);
            }

            /* isUnique: uu tien bestGap THAT (tu best4rootmoves cua tomitank) khi co.
               bestGap = evalBest - eval2ndBest. Diem eval2ndBest thuong la CAN TREN
               (null-window fail-low), tuc bestGap tinh duoc co the THAP hon that —
               an toan mot chieu (co the bo lot Brilliant/Great that su hiem, khong
               bao gio gan sai nhan cho nuoc khong xung dang). Khi khong co du lieu
               (eval2ndBest=null) -> fallback numGoodAlt nhu truoc day.
               [CALIBRATION v2] Nguong 250 cu doi dong nhat voi UNIQUE_GAP_CP=100 dung
               trong _classifyBestLabel() (nhanh isBestMove) - 2 ham cung khai niem
               "doc nhat" nhung truoc do lech nguong nhau do CALIBRATION v2 chi sua 1
               trong 2 cho. Ly do giam (search thuc te chi ~1-1.2s, bestGap do duoc
               tu best4rootmoves thuong nho hon nhieu so voi phan tich sau offline)
               ap dung nhu nhau cho ca 2 ham. */
            var bestGap = (eval2ndBest !== null) ? (evalBest - eval2ndBest) : null;
            var isUnique = (bestGap !== null) ? (bestGap >= 100 * strictness) : (numGoodAlt <= 1);

            /* 1. Missed Mate — chi bao khi that su co nuoc khac tot hon ro ret (cpLoss
               dang ke). Neu cpLoss gan 0 (nuoc nay van la toi uu/gan toi uu theo
               cp-eval) thi KHONG che Great/Brilliant chi vi tin hieu mate (kem on
               dinh o search nong tren PPW3) chua kip xac nhan lai o vi tri sau —
               tranh gan nham "Missed Mate" cho dung nuoc dau tien cua 1 chuoi mate
               ma chi la mate-depth chua duoc engine "nhin thay lai" kip. */
            if (mateBest !== null && mateBest > 0 && (mateActual === null || mateActual <= 0)
                && cpLoss > 20 * strictness) return 'Missed Mate';
            if (mateActual !== null && mateActual > 0) return 'Best';

            /* 2. Missed Win — band logic tránh false positive ở thế cân bằng */
            function toBand(cp) {
                if (cp >= 800) return 'completelyWinning';
                if (cp >= 400) return 'clearlyWinning';
                if (cp >= 150) return 'better';
                if (cp > -150) return 'roughlyEqual';
                if (cp > -400) return 'worse';
                if (cp > -800) return 'clearlyLosing';
                return 'completelyLosing';
            }
            var beforeBand = toBand(evalBefore);
            var afterBand = toBand(evalActual);
            var hadWin = (beforeBand === 'completelyWinning' || beforeBand === 'clearlyWinning');
            var lostWin =
                (beforeBand === 'completelyWinning' && afterBand !== 'completelyWinning') ||
                (beforeBand === 'clearlyWinning' && (afterBand === 'roughlyEqual' || afterBand === 'worse' ||
                    afterBand === 'clearlyLosing' || afterBand === 'completelyLosing'));
            if (hadWin && lostWin && cpLoss >= 200 * strictness) return 'Missed Win';

            /* 3. Brilliant (isSacrifice=false ở nhánh !isBestMove — không trigger) */
            if (isSacrifice && materialLost >= 250 && Math.abs(evalBefore) < 400 &&
                cpLoss <= 20 * strictness && cpLossShallow >= 100 * strictness && isUnique) return 'Brilliant';

            /* 4. Great Defense (isUnique=false ở nhánh !isBestMove — không trigger) */
            if (evalBefore <= -400 && evalActual >= evalBefore + 150 &&
                cpLoss <= 20 * strictness && cpLossShallow >= 80 * strictness && isUnique) return 'Great Defense';

            /* 5. Great Move (isUnique=false ở nhánh !isBestMove — không trigger) */
            if (Math.abs(evalBefore) < 800 && cpLoss <= 20 * strictness && isUnique) return 'Great';

            /* [FIX CALIBRATION v4 — hieu chinh bang test thuc nghiem so voi chess.com
               tren nhieu van mau, xem ChessTwinkle_ClassifySystem.md]: winPct() quy
               doi cp -> % thang the kieu logistic (chuan lichess/chess.com), dung de
               "chan" Blunder khi van co da gan nhu an bai (thang/thua ro ret, winPct
               ngoai khoang 5-95%) — tranh dem thua Blunder cho nhung nuoc chi "thua
               them" trong 1 vi tri da hong tu truoc, khong con thuc su thay doi ket
               qua ván. */
            function winPct(cp) { return 100 / (1 + Math.pow(10, -cp / 400)); }
            var wp = winPct(evalBefore);

            /* [FIX gameStillOpen -> lam muot, CHI ap dung ben THUA — xac nhan bang
               replay that + classifyMove() that: 1 vi tri o wp~4.7% (evalBefore=
               -521) voi cpLoss THAT ~5 (khong he co thiet hai) van dung ra 'Mistake'
               dung nhu mong doi — nhung chi can nhieu do dac ~10-15cp (hoan toan
               binh thuong giua 2 lan search doc lap) day evalBefore qua phia con
               lai cua bien cung 5% la du lat "Blunder bat kha thi" thanh "Blunder
               kha di" cho CUNG 1 muc cpLoss. Thay bang he so nuong tay LIEN TUC,
               chi ap dung khi dang THUA (wp<20%) theo yeu cau — giu nguyen do khat
               khe khi dang thang (wp>95% van chi cho Mistake toi da, y het code
               cu, khong doi gi ben nay). Bat dau nuong tay tu wp=20% (tren muc nay
               khong nuong gi ca), tang lien tuc (d^2, cham luc dau — doc dan khi
               gan 0%), toi da nuong THEM 3 lan (tuc gap 4 lan nguong goc) tai
               wp=0%. Khac voi code cu (chan Blunder HOAN TOAN o vi tri da an bai),
               gio Blunder van luon KHA DI ve nguyen tac du dang thua nang — chi
               can thiet hai du lon theo dung ty le, khong con bi khoa cung. */
            var LOSING_LENIENCY_ONSET = 20;  /* wp% bat dau nuong tay (duoi muc nay moi tang) */
            var LOSING_LENIENCY_MAX = 3;   /* nuong THEM toi da 3 lan (=> 4x) tai wp=0% */
            var losingLeniency = 1;
            if (wp < LOSING_LENIENCY_ONSET) {
                var _d = (LOSING_LENIENCY_ONSET - wp) / LOSING_LENIENCY_ONSET; /* 0..1 */
                losingLeniency = 1 + _d * _d * LOSING_LENIENCY_MAX;
            }
            var winningDecided = wp > 95; /* [khong doi] giu y het hanh vi cu o phia dang thang */

            /* 5b. [FIX — hoc tu ChessCoach] Luoi an toan cho vi tri DANG THUA bi TE
               THEM ro ret: neu evalBefore da am (duoi -100) va sau nuoc di roi xuong
               duoi -250 voi cpLoss >=60*losingLeniency, ep toi thieu Blunder bat ke
               tier goc — tranh truong hop mistakeLimit noi rong o |evalBefore| lon
               (250) khien 1 nuoc thuc su lam sup do vi tri (nhung chua du 250cp tho
               de vao tier Blunder binh thuong) bi bao cao nhe hon thuc te (vd
               Peruvian 10...O-O-O??). Chi ap dung o nhanh !isBestMove (classifyMove
               luon o nhanh nay). Nguong 60 gio nhan them losingLeniency thay vi bi
               chan cung boi gameStillOpen. */
            if (evalBefore < -100 && cpLoss >= 60 * losingLeniency && evalActual < -250) return 'Blunder';

            /* 6. Dynamic thresholds — the can bang dung nguong chat hon.
               [v4] Nang 100->200 va 150->280 (xac nhan qua test thuc nghiem: cac
               nuoc cpLoss ~110-270 o day truoc kia bi bao Blunder qua tay so voi
               chess.com — dai da so chi la Mistake thuc su). */
            var absEval = Math.abs(evalBefore);
            var mistakeLimit = (absEval <= 150) ? 200 : (absEval <= 400) ? 280 : 250;
            mistakeLimit *= strictness;
            mistakeLimit *= losingLeniency; /* [FIX] chi >1x khi dang thua duoi 20% thang, lien tuc */

            if (cpLoss === 0) return 'Best';
            if (cpLoss <= mistakeLimit) return 'Mistake';
            /* [khong doi ben thang] wp>95% (dang thang tuyet doi) -> chi la Mistake
               du cpLoss tho lon, y het code cu. Ben thua gio KHONG con bi chan cung
               nua — da duoc xu ly qua mistakeLimit*losingLeniency o tren roi. */
            return winningDecided ? 'Mistake' : 'Blunder';
        }

    function _classifyBestLabel(mv, savedPlayerLegalCount, savedEval, playerGivesCheck, savedEval2nd) {
            var onlyEscape = (savedPlayerLegalCount <= 2);
            /* realBestGap: player-perspective, so sanh voi -savedEval (= evalBest tai
               vi tri player sap di, cung cong thuc voi classifyMove() nhanh khac). */
            var realBestGap = (typeof savedEval2nd === 'number' && isFinite(savedEval2nd))
                ? ((-savedEval) - savedEval2nd)
                : null;
            var realUnique = (realBestGap !== null && realBestGap >= UNIQUE_GAP_CP);

            /* [CALIBRATION v3] Nuoc chieu dan toi/xac nhan mate ep buoc — vuot qua
               moi cua so eval centipawn thong thuong, NHUNG chi tinh 'brilliant' khi
               quan vua di THAT SU "phoi ra" (o dich bi doi phuong tan cong), du doi
               phuong an that (vd 22...Kxh7) hay khong dam an vi an vao la mate nhanh
               hon (vd 26.Be2+). Neu o dich hoan toan an toan (vd 23.Neg4+, 24.h4+ —
               chi la nuoc chieu ep buoc binh thuong trong 1 chuoi mate da dinh san,
               khong co yeu to rui ro/hy sinh nao) thi KHONG cho brilliant o day nua —
               de roi xuong 'great' qua cac nhanh ben duoi (captureGreat/genuineEscape/
               realUniqueQuiet), tranh brilliant tran lan cho moi nuoc chieu trong
               chuoi King hunt dai (Lasker, Samackhat...). Dung attacked() thuan
               board-based (khong SEE) — re, khong ton engine call, dung dinh nghia
               "co the bi an" ma khong can biet doi phuong co an that hay khong. */
            if (playerGivesCheck && Math.abs(savedEval) >= MATE_EVAL_ABS &&
                attacked(gB, mv[1], -gPC)) return 'brilliant';

            /* [FIX brilliantIndirect — hoc tu ChessCoach, xem findHangingPieceValueExcept]
               Nuoc tot nhat cua engine (dang o nhanh isBestMove) nhung DE HO 1 quan
               KHAC (khong phai quan vua di) dang treo that — kieu "hy sinh gian tiep"
               ma sacPiece/playerPieceHangsAfterMove (chi xet dung o mv[1]) khong bat
               duoc, vi quan bi mat nam o 1 o hoan toan khac (vd 11.axb4!! bo ngo Xe
               a1 cho 11...Qxa1+, trong khi mv[1]=b4 chi la o tot vua doi tuong binh
               thuong). Dieu kien: quan treo do phai dang ke (>=250, tuong minor tro
               len) VA AI van danh gia vi tri nay khong qua te cho player (dung lai
               cua so GREAT_EVAL_FLOOR/CEIL da thiet lap cho captureGreat) — tranh gan
               brilliant cho nuoc chi don gian la thi quan mat trang ma khong co gi
               bu lai. LUU Y: day CHI hoat dong khi engine (o do sau thuc te dat duoc)
               da tu tin day la nuoc tot nhat (isBestMove=true) — neu do sau chua du
               de engine uu tien nuoc nay ngay tu dau (vd axb4 tren PPW3 depth 5-6
               thuc te, xem thao luan truoc), nuoc se khong bao gio roi vao nhanh nay
               ca, va fix nay khong the cuu duoc — day la gioi han ve do sau search,
               khong phai gioi han cua nhanh nhan dien nay. */
            /* [FIX hangElsewhere-preexisting — xác nhận bằng test thực tế 12.hxg3
               trong 1 ván thật]: bản gốc chỉ hỏi "SAU nước đi có quân nào khác đang
               treo không", không hỏi "quân đó có treo TỪ TRƯỚC nước đi hay không".
               Kết quả: 1 nước đi hoàn toàn bình thường (recapture bắt buộc, không hy
               sinh gì) vẫn bị gắn brilliant nếu tình cờ có 1 quân KHÁC đã treo sẵn từ
               trước đó vì lý do không liên quan (ví dụ 1 Mã bị exchange-SEE dương do
               vị trí, tồn tại độc lập với nước đang xét). Test thực nghiệm trên file
               này: sau 12.hxg3, findHangingPieceValueExcept trả về 320 (Mã e5) — NHƯNG
               giá trị đó đã tồn tại y hệt (thậm chí ở mức 500) ngay TRƯỚC hxg3 rồi,
               không phải do hxg3 gây ra. Fix: so sánh thêm với board TRƯỚC nước đi
               (mv._boardBefore, loại trừ đúng ô xuất phát mv[0] vì quân đó đã rời đi)
               — chỉ tính brilliant khi mức treo đó MỚI xuất hiện do nước này. */
            var _hangElsewhere = findHangingPieceValueExcept(gB, gPC, mv[1]);
            var _hangBefore = mv._boardBefore ? findHangingPieceValueExcept(mv._boardBefore, gPC, mv[0]) : 0;
            if (_hangElsewhere >= 250 && _hangBefore < 250 && savedEval > GREAT_EVAL_FLOOR && savedEval <= GREAT_EVAL_CEIL) return 'brilliant';

            /* CF5: greatDef chỉ có ý nghĩa khi AI đang thắng vừa phải (300..600).
               Nếu AI thắng > 600 thì player đang thua nặng — "great defense" vô nghĩa,
               chỉ là chọn cách thua ít thảm hơn. */
            if (savedPlayerLegalCount <= 3 && savedEval > 300 && savedEval <= 600 && !onlyEscape) return 'greatDef';
            /* Bổ sung: search xác nhận đây là nước PHÒNG THỦ độc nhất (gap lớn) dù
               không khớp điều kiện escape-square cũ (vd còn nhiều nước đi hợp lệ
               nhưng chỉ 1 nước thực sự giữ được thế). */
            if (!onlyEscape && realUnique && savedEval > 300 && savedEval <= 600) return 'greatDef';
            var _capVal = mv[2] ? PVAL[typ(mv[2])] : 0;
            var _ownVal = (mv._boardBefore) ? PVAL[typ(mv._boardBefore[mv[0]])] : 0;
            /* [CALIBRATION v2 — SỬA BUG] _isRecapture bản gốc chỉ hỏi "đối phương vừa
               ĐẾN ô này" (gLast[1]===mv[1]), không quan tâm nước đó có phải một nước
               ĂN QUÂN hay không — nên 1 nước ăn quân đi tới ô mà đối thủ vừa mới ĐẨY
               QUÂN tới (không ăn gì) bị tính nhầm là "recapture" và mất quyền Great.
               Recapture đúng nghĩa: đối phương vừa ĂN MỘT QUÂN tại chính ô này
               (gLast[2] khác rỗng), không chỉ là "vừa đến". */
            var _isRecapture = !!(gLast && gLast[1] === mv[1] && gLast[2]);
            var hasCapture = !!(_capVal >= CAPTURE_GREAT_MIN_VAL && !_isRecapture);
            /* [CALIBRATION v2] cua so noi rong o GREAT_EVAL_FLOOR/CEIL (xem ghi chu
               dau ham) thay vi hard-code -200..600 */
            var captureGreat = (hasCapture && savedEval > GREAT_EVAL_FLOOR && savedEval <= GREAT_EVAL_CEIL);
            /* CF5: genuineEscape và great chỉ có ý nghĩa khi AI đang thắng vừa phải */
            var genuineEscape = (savedPlayerLegalCount <= 3 && savedEval > 400 && savedEval <= 600);
            /* Bổ sung: nước yên tĩnh (không capture, không check) nhưng search xác
               nhận độc nhất vô nhị trong thế cân bằng/hơi lệch — heuristic cũ hoàn
               toàn bỏ sót trường hợp này vì nó chỉ nhìn capture/check/escape-count. */
            var realUniqueQuiet = (realUnique && savedEval > GREAT_EVAL_FLOOR && savedEval <= GREAT_EVAL_CEIL);
            if (!onlyEscape && (captureGreat || (playerGivesCheck && savedEval > GREAT_EVAL_FLOOR && savedEval <= GREAT_EVAL_CEIL) || genuineEscape || realUniqueQuiet)) return 'great';
            return 'best';
        }

    function sqCoords(s, orientation) {
        var r = 0, c = 0;
        if (typeof s === 'string' && s.length >= 2) {
            c = s.charCodeAt(0) - 97; // 'a' -> 0, 'h' -> 7
            r = 8 - parseInt(s.charAt(1), 10); // '8' -> 0, '1' -> 7
        } else if (typeof s === 'number') {
            r = rk(s);
            c = fl(s);
        } else if (s && typeof s.r === 'number' && typeof s.c === 'number') {
            r = s.r;
            c = s.c;
        }
        var visualR = (orientation === 'b') ? 7 - r : r;
        var visualC = (orientation === 'b') ? 7 - c : c;
        return { x: visualC + 0.5, y: visualR + 0.5 };
    }

    function ensureSvgDefs(svgEl) {
        if (!svgEl) return;
        var defs = svgEl.querySelector ? svgEl.querySelector('defs') : null;
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            defs.innerHTML =
                '<marker id="arr-grn" markerWidth="2.2" markerHeight="2.2" refX="1.5" refY="1.1" orient="auto">' +
                    '<polygon points="0 0,2.2 1.1,0 2.2" fill="rgba(26,122,26,0.85)" />' +
                '</marker>' +
                '<marker id="arr-teal" markerWidth="2.2" markerHeight="2.2" refX="1.5" refY="1.1" orient="auto">' +
                    '<polygon points="0 0,2.2 1.1,0 2.2" fill="rgba(0,150,136,0.85)" />' +
                '</marker>' +
                '<marker id="arr-pur" markerWidth="2.2" markerHeight="2.2" refX="1.5" refY="1.1" orient="auto">' +
                    '<polygon points="0 0,2.2 1.1,0 2.2" fill="rgba(120,26,154,0.85)" />' +
                '</marker>';
            svgEl.insertBefore(defs, svgEl.firstChild);
        }
    }

    function drawArrow(svgEl, from, to, color, orientation) {
        if (!svgEl) return;
        ensureSvgDefs(svgEl);
        var g = svgEl.querySelector ? svgEl.querySelector('#svg-arrows') : document.getElementById('svg-arrows');
        if (!g) {
            g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('id', 'svg-arrows');
            svgEl.appendChild(g);
        }
        var fc = sqCoords(from, orientation);
        var tc = sqCoords(to, orientation);
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
        var stroke = { green: 'rgba(26,122,26,0.85)', teal: 'rgba(0,150,136,0.85)', purple: 'rgba(120,26,154,0.85)' }[color] || 'rgba(26,122,26,0.85)';
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        var d = len < 1.5 ? 'M' + sx + ',' + sy + ' L' + ex + ',' + ey
            : 'M' + sx + ',' + sy + ' Q' + (mid.x + px) + ',' + (mid.y + py) + ' ' + ex + ',' + ey;
        path.setAttribute('d', d);
        path.setAttribute('stroke', stroke);
        path.setAttribute('stroke-width', String(sw));
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#' + markId + ')');
        g.appendChild(path);
        svgEl.style.display = 'block';
    }

    function clearArrows(svgEl) {
        if (!svgEl) return;
        var g = svgEl.querySelector ? svgEl.querySelector('#svg-arrows') : document.getElementById('svg-arrows');
        if (g) g.innerHTML = '';
        svgEl.style.display = 'none';
    }

    function renderTacticalArrows(svgEl, bestMove, punishMove, label, orientation) {
        clearArrows(svgEl);
        if (!svgEl) return;
        var isMistakeOrBlunder = (label === 'mistake' || label === 'blunder' || label === 'missedWin' || label === 'missedMate');
        if (!isMistakeOrBlunder && !bestMove) return;

        if (bestMove) {
            var bFrom = bestMove.from || (typeof bestMove === 'string' ? bestMove.slice(0, 2) : null);
            var bTo = bestMove.to || (typeof bestMove === 'string' ? bestMove.slice(2, 4) : null);
            if (bFrom && bTo) {
                drawArrow(svgEl, bFrom, bTo, 'green', orientation);
            }
        }
        if (punishMove && isMistakeOrBlunder) {
            var pFrom = punishMove.from || (typeof punishMove === 'string' ? punishMove.slice(0, 2) : null);
            var pTo = punishMove.to || (typeof punishMove === 'string' ? punishMove.slice(2, 4) : null);
            if (pFrom && pTo) {
                drawArrow(svgEl, pFrom, pTo, 'purple', orientation);
            }
        }
    }

    root.LABEL_TEXT = LABEL_TEXT;
    root.LABEL_CSS = LABEL_CSS;
    root.REVIEW_BADGE_MAP = REVIEW_BADGE_MAP;
    root.winPct = winPct;
    root.seeFull = seeFull;
    root.seeNegative = seeNegative;
    root.playerMissedHanging = playerMissedHanging;
    root.playerPieceHangsAfterMove = playerPieceHangsAfterMove;
    root.findHangingPieceValueExcept = findHangingPieceValueExcept;
    root.classifyMove = classifyMove;
    root._classifyBestLabel = _classifyBestLabel;
    root.drawArrow = drawArrow;
    root.clearArrows = clearArrows;
    root.renderTacticalArrows = renderTacticalArrows;

    root.ChessReview = {
        LABEL_TEXT: LABEL_TEXT,
        LABEL_CSS: LABEL_CSS,
        REVIEW_BADGE_MAP: REVIEW_BADGE_MAP,
        winPct: winPct,
        seeFull: seeFull,
        seeNegative: seeNegative,
        playerMissedHanging: playerMissedHanging,
        playerPieceHangsAfterMove: playerPieceHangsAfterMove,
        findHangingPieceValueExcept: findHangingPieceValueExcept,
        classifyMove: classifyMove,
        classifyBestLabel: _classifyBestLabel,
        sqCoords: sqCoords,
        drawArrow: drawArrow,
        clearArrows: clearArrows,
        renderTacticalArrows: renderTacticalArrows
    };

})(typeof window !== "undefined" ? window : this);
