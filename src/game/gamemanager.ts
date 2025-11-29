import type { Cell, GameData } from "./gamedata";
import { BOTTOM, invertFigure, isEnd, isMix, isOn, LEFT, moveXY, RIGHT, rotateFigure, toDirs, TOP, type DIR } from "./gamedata";
import { addXY, bymodXY, distXY, isSameXY, loopXY, toXY, type RectXY, type XY } from "../utils/xy";
import { createArray2d, type Array2d } from "../utils/array2d";
import { createGame } from "./gamecreate";
import { CREATE_RND_FUNC } from "./gameconstants";
//import { createGame } from "./gamecreate";

export class GameManager {
    private game: GameData;

    private colors: Array2d<number>;
    private counters: Map<number, number>;
    private connections: Array2d<number>;
    private preConnections: Array2d<number>;

    private preColors: Array2d<number>;

    constructor(mode: number, level: number) {
        console.log("CREATE", mode, level)
        this.game = createGame(mode, level);
        level > 0 && this.shufleGame();
        this.colors = this.calcColors();
        this.counters = this.calcCounters();
        this.connections = this.calcConnections();
        this.preColors = this.colors;
        this.preConnections = this.connections;
    }

    // constructor(game: GameData) {
    //     this.game = game;
    //     this.colors = this.calcColors();
    //     this.counters = this.calcCounters();
    //     this.connections = this.calcConnections();
    //     this.preColors = this.colors;
    // }

    endCounters(): Map<number, number> {
        return this.counters;
    }

    connectionAt(xy: XY, rotateAt: XY) {
        rotateAt;
        // if (rotateAt && isSameXY(xy, rotateAt)) return 0;
        return this.connections.get(xy) || 0;
    }
    preConnectionAt(xy: XY) {
        return this.preConnections.get(xy) || 0;
    }

    level() { return this.game.level; }
    mode() { return this.game.mode; }
    hint() { return this.game.hintXY?.[0] || null; }
    taps() { return this.game.taps; }
    size(): Readonly<XY> { return this.game.size }
    bordered(): boolean { return this.game.bordered; }
    isSolved(): boolean { return this.counters.get(0) === 0; }
    colorAt(xy: XY): number { return this.colors.get(xy) || 0; }
    preColorAt(xy: XY): number { return this.preColors.get(xy) || 0; }

    //connectionAt(xy: XY, connections: Array2d<number>) { return connections.get(xy) || 0; }

    figureAt(xy: XY): number { return this.cellAt(xy).figure; }
    sourceAt(xy: XY): number { return this.cellAt(xy).source; }
    cellAt(xy: XY) { return this.game.get(xy) || { figure: 0, source: 0 }; }

    cellAtDir(xy: XY, dir: DIR): Cell {
        const { x, y } = xy;
        if (this.game.bordered) {
            const emptyCell = { figure: 0, source: 0 };
            if (x === 0 && dir === LEFT) return emptyCell;
            if (y === 0 && dir === TOP) return emptyCell;
            if (x === this.game.size.x - 1 && dir === RIGHT) return emptyCell;
            if (y === this.game.size.y - 1 && dir === BOTTOM) return emptyCell;
        }
        return this.cellAt(moveXY(xy, dir));
    }

    getCellRect(xy: XY): RectXY {
        const cell = this.cellAt(xy);
        let left = xy.x, right = xy.x, top = xy.y, bottom = xy.y;

        if (cell.source > 0) {
            while (this.cellAt(toXY(left - 1, xy.y)).source === cell.source) left--;
            while (this.cellAt(toXY(right + 1, xy.y)).source === cell.source) right++;
            while (this.cellAt(toXY(xy.x, top - 1)).source === cell.source) top--;
            while (this.cellAt(toXY(xy.x, bottom + 1)).source === cell.source) bottom++;
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

    getRotatedFigureAt(x: number, y: number): { figure: number, conn: number } {
        const xy = toXY(x, y);
        const cell = this.cellAt(xy);
        const conn = this.connections?.get(xy) || 0;
        if (!cell.source) return { figure: rotateFigure(cell.figure), conn: rotateFigure(conn) };

        let newFigure = 0;
        let newConn = 0;

        const dirs: DIR[] = [TOP, RIGHT, BOTTOM, LEFT];
        dirs.forEach((dir) => {
            const neib = this.cellAt(moveXY(xy, dir));
            const neibConn = this.connections.get(moveXY(xy, dir));
            if (neib.source === cell.source) {
                newFigure |= (neib.figure & rotateFigure(dir)) | dir;
                newConn |= (neibConn & rotateFigure(dir)) | dir;
            } else {
                newFigure |= rotateFigure(cell.figure & dir);
                newConn |= rotateFigure(conn & dir);
            }
        });

        return { figure: newFigure, conn: newConn };
    }

    canRotateAt(xy: XY): boolean {
        const nxy = bymodXY(xy, this.size());
        if (this.isSolved()) return false;
        if (this.bordered() && !isSameXY(xy, nxy)) return false;
        if (this.game.hintXY && !this.game.hintXY.find((hxy) => isSameXY(hxy, nxy))) {
            return false;
        }
        return true;
    }

    rotateAtXY(xy: XY) {
        const rect = this.getCellRect(xy);
        const newFigures: any[] = [];

        loopXY(rect.size, (dxy: XY) => {
            const cellXY = addXY(dxy, rect.at);
            const rotated = this.getRotatedFigureAt(cellXY.x, cellXY.y);
            newFigures.push({ xy: cellXY, rotated })
        });

        newFigures.forEach((item: any) => {
            this.cellAt(item.xy).figure = item.rotated.figure;
            this.connections?.set(item.xy, item.rotated.conn);
        });

        this.preColors = this.colors;

        this.preConnections = this.connections;

        this.colors = this.calcColors();
        this.connections = this.calcConnections();
        this.counters = this.calcCounters();

        if (this.game.hintXY) {
            //remove first occurance of cellXY from hints
            this.game.hintXY = this.game.hintXY.filter((hxy) => !isSameXY(hxy, xy));
        }

        // make it work for 1111 or 0000 in big source
        // const figure = this.figureAt(xy);
        // if (figure !== 0b1111) 
        this.game.taps++;
    }

    calcColors() {
        const sources = this.findAllSources();
        const newColors = createArray2d<number>(this.size());
        sources.forEach((sxy) => {
            newColors.set(sxy, this.cellAt(sxy).source);
            const actives = [sxy];
            const color = newColors.get(sxy) || 0;
            for (let i = 0; i < actives.length; i++) {
                const xy = actives[i];
                const cell = this.cellAt(xy);
                toDirs(cell.figure).forEach((dir) => {
                    const xy2 = moveXY(xy, dir);

                    if (this.bordered() && !isSameXY(xy2, bymodXY(xy2, this.size()))) return;

                    const cell2 = this.cellAtDir(xy, dir);
                    const isConnected = (cell2.figure & invertFigure(dir));
                    const color2 = newColors.get(xy2) || 0;
                    const includesColor = (color2 & color);
                    if (!cell2.source && isConnected && !includesColor) {
                        newColors.set(xy2, color2 | color);
                        actives.push(xy2);
                    }
                });
            }
        });
        return newColors;
    }

    calcCounters(): Map<number, number> {
        const newCounter = new Map<number, number>;
        newCounter.set(0, 0);
        this.colors.forEach((color, xy) => {
            const cell = this.cellAt(xy);
            if (cell.source) {
                newCounter.set(cell.source, newCounter.get(cell.source) || 0);
            } else if (isEnd(cell.figure)) {
                color = color || 0;
                color = isMix(color) ? 0 : color;
                const oldCount = newCounter.get(color) || 0;
                newCounter.set(color, oldCount + 1);
            }
        });
        return newCounter;
    }

    calcConnections(): Array2d<number> {
        const connections = createArray2d<number>(this.size());
        connections.forEach((_, xy) => {
            let conns = 0b0000;
            toDirs(this.cellAt(xy).figure).forEach((dir) => {
                const xy2 = moveXY(xy, dir);
                const cell2 = this.cellAtDir(xy, dir);
                const color1 = this.colors.get(xy);
                const color2 = this.colors.get(xy2);
                if (color1 === color2) {
                    conns |= (invertFigure(cell2.figure) & dir);
                }
            });
            connections.set(xy, conns);
        });
        return connections;
    }

    findClosestXY(fromXY: XY, color: number): XY | null {
        let dist = 9999;
        let closestXY = null;
        loopXY(this.game.size, (xy) => {
            const cell = this.cellAt(xy);
            const cellColor = this.colors.get(xy) || 0;
            if ((isOn(color) && cell.source === color) ||
                (isEnd(cell.figure) && !isOn(cellColor) && !isOn(color))) {
                const newDist = distXY(fromXY, xy);
                if (newDist < dist) {
                    closestXY = xy;
                    dist = newDist;
                }
            }
        });
        return closestXY;
    }

    shufleGame() {
        const rndFunc = CREATE_RND_FUNC(this.game.mode, this.game.level, 99);
        this.game.forEach((_, xy) => {
            const times = rndFunc(3);//0, 1, 2, 3
            for (let i = 0; i < times; i++) this.rotateAtXY(xy);
        });
        this.game.taps = 0;
    }
}
