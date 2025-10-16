import { COLOR, SIZE } from "./cfg";
import { drawTransform, midColor } from "../utils/canvas";
import type { GameManager } from "./gamemanager";
import { progressToCurve } from "../utils/numbers";
import { addXY, bymodXY, isSameXY, loopXY, mulXY, subXY, toXY, type XY } from "../utils/xy";
import { drawCircle, drawRoundRect, strokeCircle, strokeLine } from "../utils/canvas";
import { BOTTOM, LEFT, RIGHT, TOP } from "./gamedata";

function drawEmptyCell(ctx: any, isOdd: boolean) {
    const alpha = ctx.globalAlpha;
    ctx.globalAlpha = 0.5;
    const color = !isOdd ? "#484848" : "#555";
    strokeCircle(ctx, SIZE / 2, SIZE / 2, 30, 6, color);
    strokeLine(ctx, SIZE / 2 - 18, SIZE / 2 - 18, SIZE / 2 + 18, SIZE / 2 + 18, 6, color);
    strokeLine(ctx, SIZE / 2 + 18, SIZE / 2 - 18, SIZE / 2 - 18, SIZE / 2 + 18, 6, color);
    ctx.globalAlpha = alpha
}

export function drawSelection(ctx: any, progress: number, cellSize: XY) {
    const gap = 0;
    const insideW = SIZE * cellSize.x - gap * 2;
    const insideH = SIZE * cellSize.y - gap * 2;
    const size = 8;
    const phase = (performance.now() % 300);
    ctx.globalAlpha = (phase > 150 ? 0.75 : 0.5) * progress
    ctx.beginPath();
    ctx.moveTo(gap, gap + size);
    ctx.lineTo(gap, gap);
    ctx.lineTo(gap + size, gap);

    ctx.moveTo(insideW + gap, gap + size);
    ctx.lineTo(insideW + gap, gap);
    ctx.lineTo(insideW + gap - size, gap);
    ctx.moveTo(gap, insideH + gap - size);
    ctx.lineTo(gap, insideH + gap);
    ctx.lineTo(gap + size, insideH + gap);
    ctx.moveTo(insideW + gap, insideH + gap - size);
    ctx.lineTo(insideW + gap, insideH + gap);
    ctx.lineTo(insideW + gap - size, insideH + gap);

    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#fff";
    ctx.stroke();
}

//renderGame(ctx, manager, game.size, viewGridSize, startViewCell)
export function renderGameBg(ctx: any, manager: GameManager, viewGridSize: XY, startingCell: XY, progressFX: any) {

    //ctx.clearRect(0, 0, viewGridSize.x * SIZE, viewGridSize.y * SIZE);
    const animate = (progressFX?.index === 1 || progressFX?.index % 10 === 2);
    const animatedY = Math.floor(progressFX.progress * manager.size().y);
    //const animateProgress = progressFX.progress * manager.size().y - animatedY;
    const efx = progressToCurve(progressFX.progress, [0, 1, 1, 0])

    // draw bg chees grid
    loopXY(viewGridSize, (viewXY) => {
        const viewCellXY = addXY(startingCell, viewXY);
        const cellXY = bymodXY(viewCellXY, manager.size());

        const isOuterCell = (manager.bordered() || true) &&
            (viewCellXY.x < 0 || viewCellXY.y < 0 ||
                viewCellXY.x >= manager.size().x || viewCellXY.y >= manager.size().y);

        ctx.save();
        ctx.translate(viewXY.x * SIZE, viewXY.y * SIZE);
        const isOdd = ((viewCellXY.x + viewCellXY.y) % 2) === 0;

        if (isOuterCell) {
            ctx.fillStyle = isOdd ? "#313131" : "#363636";
            ctx.fillRect(0, 0, SIZE, SIZE);
            ctx.globalAlpha = 1;
        } else {
            ctx.fillStyle = isOdd ? "#484848" : "#555";

            if (animate && manager.size().y - cellXY.y - 1 === animatedY && !isOdd) {
                ctx.fillStyle = midColor(ctx.fillStyle, "#666", efx);
            }

            ctx.fillRect(0, 0, SIZE, SIZE);
            manager.cellAt(cellXY).figure === 0 && drawEmptyCell(ctx, isOdd)
        }
        ctx.restore();
    });
}

export function renderSelect(ctx: any, selected: any, manager: GameManager, startViewCell: XY) {
    if (!selected) return;
    //draw selection
    const selectProgress = 1;//progress(selected.when, TRANS_DURATION);
    if (selectProgress > 0) {
        const cellRect = manager.getCellRect(selected.at);
        const gameXY = bymodXY(selected.at, manager.size());
        const pos = subXY(selected.at, startViewCell);
        const delta = subXY(cellRect.at, gameXY);
        const trans = mulXY(addXY(pos, delta), SIZE);
        const phase = 1;// selected.active ? selectProgress : 1 - selectProgress;
        drawTransform(ctx, trans, () => drawSelection(ctx, phase, cellRect.size));
    }
}

function drawHint(ctx: any) {
    const dur = 900;
    const phase = (performance.now() % dur);
    ctx.globalAlpha = (phase > dur / 2 ? 0.1 : 0.0);
    ctx.fillStyle = "#fff";
    //ctx.fillRect(0, 0, SIZE, SIZE);
    drawCircle(ctx, SIZE / 2, SIZE / 2, 60, "#fff");
    drawCircle(ctx, SIZE / 2, SIZE / 2, 40, "#000");
}

export function renderHint(ctx: any, gameXY: any, startViewCell: XY) {
    if (!gameXY) return;
    const pos = subXY(gameXY, startViewCell);
    const delta = subXY(gameXY, gameXY);
    const trans = mulXY(addXY(pos, delta), SIZE);
    drawTransform(ctx, trans, () => drawHint(ctx));
}

function drawSourceFg(ctx: any, color: number, size: XY, outer: boolean, progressFX: any, solvedFX: any) {
    const count = (size.x * 2 - 1) * (size.y * 2 - 1);

    drawRoundRect(ctx, 15, 15, (SIZE * size.x) - 30, (SIZE * size.y) - 30, 20, COLOR(color));

    const s = 40;
    const g = 10;
    const d = 30;

    let dx = solvedFX?.shake || 0;

    for (let i = 0; i < size.x * 2 - 1; i++) {
        for (let j = 0; j < size.y * 2 - 1; j++) {
            drawRoundRect(ctx, d + i * (s + g), d + j * (s + g), s, s, 10, "#444");
            if (outer) continue;
            if (solvedFX) {
                let c = midColor("#eee", COLOR(color), 1 - solvedFX.visibility);
                drawCircle(ctx, dx + d + i * (s + g) + s / 2, d + j * (s + g) + s / 2, 12, c);
            } else if ((progressFX?.index % (count)) === (i * (size.y * 2 - 1) + j)) {
                let c = midColor("#eee", COLOR(color), 1 - progressFX.visibility);
                if (count === 1 && progressFX?.index % 2 === 0) c = COLOR(color);
                drawCircle(ctx, dx + d + i * (s + g) + s / 2, d + j * (s + g) + s / 2, 12, c);
            } else {
                drawCircle(ctx, d + i * (s + g) + s / 2, d + j * (s + g) + s / 2, 12, COLOR(color));
            }
        }
    }
}

export function renderSourceFgs(ctx: any, manager: GameManager, viewGridSize: XY, startViewCell: XY, progressFX: any, solvedFX: any) {
    // Draw all sources foreground

    loopXY(viewGridSize, (viewXY) => {

        const viewCellXY = addXY(startViewCell, viewXY);
        const isOuterCell = (viewCellXY.x < 0 || viewCellXY.y < 0 ||
            viewCellXY.x >= manager.size().x || viewCellXY.y >= manager.size().y);
        if (manager.bordered() && isOuterCell) return;

        const cellXY = bymodXY(viewCellXY, manager.size());
        const cell = manager.cellAt(cellXY);
        if (cell.source === 0) return;
        const rect = manager.getCellRect(cellXY);
        const delta = subXY(rect.at, cellXY);
        const rectStartPos = addXY(viewXY, delta);
        const rectDelta = toXY(Math.min(0, rectStartPos.x), Math.min(0, rectStartPos.y));
        if (!isSameXY(subXY(rect.at, rectDelta), cellXY)) return;
        const trans = mulXY(addXY(viewXY, delta), SIZE);
        if (!isOuterCell)
            drawTransform(ctx, trans, () => drawSourceFg(ctx, cell.source, rect.size, false, progressFX, solvedFX));
        else drawTransform(ctx, trans, () => drawSourceFg(ctx, cell.source + 100, rect.size, true, progressFX, solvedFX));
    });

}

export function drawNewFigure(ctx: any, figure: number, conns: number, color: string) {
    const d = 12;
    const r = 25;
    const s2 = SIZE / 2;
    ctx.lineWidth = 16;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, SIZE, SIZE);
    ctx.clip();

    ctx.beginPath();

    if (figure & TOP) {
        ctx.moveTo(s2, conns & TOP ? 0 : d);
        ctx.lineTo(s2, s2 - r);
    }

    if (figure & RIGHT) {
        ctx.moveTo(SIZE - (conns & RIGHT ? 0 : d), s2);
        ctx.lineTo(s2 + r, s2);
    }

    if (figure & BOTTOM) {
        ctx.moveTo(s2, SIZE - (conns & BOTTOM ? 0 : d));
        ctx.lineTo(s2, s2 + r);
    }
    if (figure & LEFT) {
        ctx.moveTo((conns & LEFT ? 0 : d), s2);
        ctx.lineTo(s2 - r, s2);
    }
    if (figure & BOTTOM && figure & LEFT) {
        ctx.moveTo(s2 - r, s2);
        ctx.arcTo(s2, s2, s2, s2 + r, r);
        ctx.lineTo(s2, SIZE - d);
    }
    if (figure & BOTTOM && figure & RIGHT) {
        ctx.moveTo(s2, s2 + r);
        ctx.arcTo(s2, s2, s2 + r, s2, r);
        ctx.lineTo(SIZE - d, s2);
    }
    if (figure & TOP && figure & LEFT) {
        ctx.moveTo(s2 - r, s2);
        ctx.arcTo(s2, s2, s2, s2 - r, r);
        ctx.lineTo(s2, d);
    }

    if (figure & TOP && figure & RIGHT) {
        ctx.moveTo(s2, s2 - r);
        ctx.arcTo(s2, s2, s2 + r, s2, r);
        ctx.lineTo(SIZE - d, s2);
    }

    if (figure & TOP && figure & BOTTOM) {
        ctx.moveTo(s2, s2 - r);
        ctx.lineTo(s2, s2 + r);
    }
    if (figure & LEFT && figure & RIGHT) {
        ctx.moveTo(s2 - r, s2);
        ctx.lineTo(s2 + r, s2);
    }
    ctx.stroke();
    ctx.restore();
}
