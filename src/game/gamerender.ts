import { SIZE, TRANS_DURATION } from "../utils/cfg";
import { drawBG, drawBgCell, drawHint, drawSelection, drawSourceFg, drawTransform } from "./gamedraw";
import type { GameManager } from "./gamemanager";
import { progress } from "../utils/numbers";
import { addXY, bymodXY, isSameXY, loopXY, mulXY, subXY, toXY, type XY } from "../utils/xy";

//renderGame(ctx, manager, game.size, viewGridSize, startViewCell)
export function renderGameBg(ctx: any, manager: GameManager, viewGridSize: XY, startingCell: XY) {

    ctx.clearRect(0, 0, viewGridSize.x * SIZE, viewGridSize.y * SIZE);

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
            //ctx.globalAlpha = 0.5;
            drawBgCell(ctx, isOdd, false, false, toXY(1, 1));
            //ctx.globalAlpha = 1;
            //ctx.globalAlpha = 0.5;
            ctx.fillStyle = isOdd ? "#313131" : "#363636";
            ctx.fillRect(0, 0, SIZE, SIZE);
            ctx.globalAlpha = 1;
        } else {
            const cell = manager.cellAt(cellXY);
            const cellRect = manager.getCellRect(cellXY);
            const skipRenderInside = !isSameXY(cellXY, cellRect.at);

            if (!skipRenderInside) {
                //const isOdd = ((viewCellXY.x + viewCellXY.y) % 2) === 0;

                //drawBgCell(ctx, isOdd, cell.source > 0, cell.figure === 0, cellRect.size);
                drawBgCell(ctx, isOdd, false, cell.figure === 0, cellRect.size);
            }
        }
        ctx.restore();
    });
    false &&
        drawBG(ctx, manager.size(), viewGridSize, startingCell);
}

export function renderSelect(ctx: any, selected: any, manager: GameManager, startViewCell: XY) {
    //draw selection
    const selectProgress = progress(selected.when, TRANS_DURATION);
    if (selectProgress > 0) {
        ctx.save();
        const cellRect = manager.getCellRect(selected.at);
        const gameXY = bymodXY(selected.at, manager.size());
        const pos = subXY(selected.at, startViewCell);
        const delta = subXY(cellRect.at, gameXY);
        const trans = mulXY(addXY(pos, delta), SIZE);
        ctx.translate(trans.x, trans.y);
        drawSelection(ctx, selected.active ? selectProgress : 1 - selectProgress, cellRect.size);
        ctx.restore();
    }
}

export function renderHint(ctx: any, gameXY: any, startViewCell: XY) {
    //draw selection
    ctx.save();

    const pos = subXY(gameXY, startViewCell);
    const delta = subXY(gameXY, gameXY);
    const trans = mulXY(addXY(pos, delta), SIZE);
    ctx.translate(trans.x, trans.y);
    drawHint(ctx);
    ctx.restore();

}

export function renderSourceFgs(ctx: any, manager: GameManager, viewGridSize: XY, startViewCell: XY) {
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
            drawTransform(ctx, trans, () => drawSourceFg(ctx, cell.source, rect.size));
        else drawTransform(ctx, trans, () => drawSourceFg(ctx, cell.source + 100, rect.size));
    });

}
