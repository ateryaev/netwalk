import type { Cell, GameData } from "./gamedata";
import { BOTTOM, LEFT, moveXY, RIGHT, rotateFigure, TOP, type DIR } from "./gamedata";
import { addXY, bymodXY, isSameXY, loopXY, toXY, type RectXY, type XY } from "./xy";

export class GameManager {
    private game: GameData;

    constructor(game: GameData) {
        this.game = game;
    }

    size(): Readonly<XY> {
        return this.game.size
    }
    bordered(): boolean {
        return this.game.bordered;
    }
    cellAt(x: number, y: number): Cell;
    cellAt(xy: { x: number; y: number }): Cell;

    cellAt(arg1: number | XY, arg2?: number): Cell {
        const isXY = (typeof arg1 !== 'number');
        const x = isXY ? arg1.x : arg1;
        const y = isXY ? arg1.y : (arg2 as number);
        return this.game.get({ x, y }) || { figure: 0, source: 0 };
    }

    cellAtDir(xy: { x: number; y: number }, dir: DIR): Cell {
        return this.cellAt(moveXY(xy, dir));
    }

    getCellRect(xy: XY): RectXY {

        const cell = this.cellAt(xy);
        let left = xy.x, right = xy.x, top = xy.y, bottom = xy.y;

        if (cell.source > 0) {
            while (this.cellAt(left - 1, xy.y).source === cell.source) left--;
            while (this.cellAt(right + 1, xy.y).source === cell.source) right++;
            while (this.cellAt(xy.x, top - 1).source === cell.source) top--;
            while (this.cellAt(xy.x, bottom + 1).source === cell.source) bottom++;
        }

        return {
            at: bymodXY(toXY(left, top), this.game.size),
            size: toXY(right - left + 1, bottom - top + 1)
        };
    }

    isSameCell(xy1: XY, xy2: XY): boolean {
        const rect2 = this.getCellRect(xy2);
        const rect1 = this.getCellRect(xy1);
        return isSameXY(rect1.at, rect2.at);
        //return xy1.x >= rect2.x && xy1.x < rect2.x + rect2.cols && xy1.y >= rect2.y && xy1.y < rect2.y + rect2.rows;
    }

    findAllSources(): XY[] {
        const sources: XY[] = [];
        this.game.forEach((cell, xy) => {
            if (cell.source) {
                sources.push(xy);
            }
        })
        return sources;
    }

    getRotatedFigureAt(x: number, y: number): number {
        const xy = toXY(x, y);
        const cell = this.cellAt(xy);
        if (!cell.source) return rotateFigure(cell.figure);

        let newFigure = 0;

        const dirs: DIR[] = [TOP, RIGHT, BOTTOM, LEFT];
        dirs.forEach((dir) => {
            const neib = this.cellAt(moveXY(xy, dir));
            if (neib.source === cell.source) {
                newFigure |= (neib.figure & rotateFigure(dir)) | dir;
            } else {
                newFigure |= rotateFigure(cell.figure & dir);
            }
        });

        return newFigure;
    }

    rotateAtXY(xy: XY) {
        const rect = this.getCellRect(xy);

        const newFigures: any[] = [];
        loopXY(rect.size, (dxy: XY) => {
            const cellXY = addXY(dxy, rect.at);
            newFigures.push({ xy: cellXY, figure: this.getRotatedFigureAt(cellXY.x, cellXY.y) })
        });

        newFigures.forEach((item: any) => {
            this.cellAt(item.xy).figure = item.figure;
        });
    }
}
