import type { Cell, GameData } from "./gamedata";
import { BOTTOM, LEFT, moveXY, RIGHT, rotateFigure, TOP, type DIR } from "./gamedata";
import { toXY, type XY } from "./xy";

export class GameManager {
    private game: GameData;

    constructor(game: GameData) {
        this.game = game;
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

    getCellRect(x: number, y: number) {
        const cell = this.cellAt(x, y);
        let left = x, right = x, top = y, bottom = y;
        if (cell.source > 0) {
            while (this.cellAt(left - 1, y).source === cell.source) left--;
            while (this.cellAt(right + 1, y).source === cell.source) right++;
            while (this.cellAt(x, top - 1).source === cell.source) top--;
            while (this.cellAt(x, bottom + 1).source === cell.source) bottom++;
        }

        return {
            x: left,
            y: top,
            cols: right - left + 1,
            rows: bottom - top + 1
        };
    }

    isSameCell(xy1: XY, xy2: XY): boolean {
        const rect2 = this.getCellRect(xy2.x, xy2.y);
        return xy1.x >= rect2.x && xy1.x < rect2.x + rect2.cols && xy1.y >= rect2.y && xy1.y < rect2.y + rect2.rows;
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

    rotateAtXY(x: number, y: number) {
        const rect = this.getCellRect(x, y);

        const newFigures = [];
        for (let sx = rect.x; sx < rect.x + rect.cols; sx++) {
            for (let sy = rect.y; sy < rect.y + rect.rows; sy++) {
                newFigures.push({ x: sx, y: sy, figure: this.getRotatedFigureAt(sx, sy) })
            }
        }

        newFigures.forEach((item) => {
            this.cellAt(item.x, item.y).figure = item.figure;
        })
    }
}
