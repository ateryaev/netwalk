import { SIZE, TRANS_DURATION } from "./cfg";
import { drawBG, drawBgCell, drawSelection, drawSourceFg, drawTransform } from "./gamedraw";
import type { GameManager } from "./gamemanager";
import { progress } from "./numbers";
import { addXY, bymodXY, isSameXY, loopXY, mulXY, subXY, toXY, type XY } from "./xy";

//renderGame(ctx, manager, game.size, viewGridSize, startViewCell)
export function renderGameBg(ctx: any, manager: GameManager, viewGridSize: XY, startingCell: XY) {
    drawBG(ctx, manager.size(), viewGridSize, startingCell);

    // draw bg chees grid
    loopXY(viewGridSize, (viewXY) => {
        const viewCellXY = addXY(startingCell, viewXY);
        const cellXY = bymodXY(viewCellXY, manager.size());

        const isOuterCell = (manager.bordered()) &&
            (viewCellXY.x < 0 || viewCellXY.y < 0 ||
                viewCellXY.x >= manager.size().x || viewCellXY.y >= manager.size().y);

        ctx.save();
        ctx.translate(viewXY.x * SIZE, viewXY.y * SIZE);
        const isOdd = ((cellXY.x + cellXY.y) % 2) === 0;
        if (isOuterCell) {
            //drawBgCell(ctx, isOdd, false, false, toXY(1, 1));
        } else {
            const cell = manager.cellAt(cellXY);
            const cellRect = manager.getCellRect(cellXY);
            const skipRenderInside = !isSameXY(cellXY, cellRect.at);

            if (!skipRenderInside) {
                //const isOdd = ((viewCellXY.x + viewCellXY.y) % 2) === 0;

                drawBgCell(ctx, isOdd, cell.source > 0, cell.figure === 0, cellRect.size);
            }
        }
        ctx.restore();
    });
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

export function renderSourceFgs(ctx: any, manager: GameManager, viewGridSize: XY, startViewCell: XY) {
    // Draw all sources foreground

    loopXY(viewGridSize, (viewXY) => {

        const viewCellXY = addXY(startViewCell, viewXY);
        if (manager.bordered()) {
            if (viewCellXY.x < 0 || viewCellXY.y < 0) return;
            if (viewCellXY.x >= manager.size().x || viewCellXY.y >= manager.size().y) return;
        }
        const cellXY = bymodXY(viewCellXY, manager.size());
        const cell = manager.cellAt(cellXY);
        if (cell.source === 0) return;
        const rect = manager.getCellRect(cellXY);
        const delta = subXY(rect.at, cellXY);
        const rectStartPos = addXY(viewXY, delta);
        const rectDelta = toXY(Math.min(0, rectStartPos.x), Math.min(0, rectStartPos.y));
        if (!isSameXY(subXY(rect.at, rectDelta), cellXY)) return;
        const trans = mulXY(addXY(viewXY, delta), SIZE);
        drawTransform(ctx, trans, () => drawSourceFg(ctx, cell.source, rect.size));
    });

}
