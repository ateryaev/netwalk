import { GameManager } from "./gamemanager";
import { BOTTOM, invertFigure, isEnd, LEFT, moveXY, RIGHT, rotateFigure, TOP, type DIR, type GameData } from "./gamedata";
import { rnd } from "./numbers";
import { addXY, bymodXY, isSameXY, loopXY, toXY, type RectXY, type XY } from "./xy";
import { createArray2d } from "./array2d";

function initSource(manager: GameManager, cellRect: RectXY, color: number) {

    const ends: XY[] = [];
    loopXY(cellRect.size, (xy) => {
        const cellXY = addXY(cellRect.at, xy);
        const cell = manager.cellAt(cellXY);
        cell.source = color;

        if (cellXY.y > cellRect.at.y) cell.figure |= TOP;
        if (cellXY.x > cellRect.at.x) cell.figure |= LEFT;
        if (cellXY.y < cellRect.at.y + cellRect.size.y - 1) cell.figure |= BOTTOM;
        if (cellXY.x < cellRect.at.x + cellRect.size.x - 1) cell.figure |= RIGHT;
        ends.push(cellXY)
    });

    return ends;
}

function emptyDirs(manager: GameManager, cellXY: XY, hasBorders: boolean = true): DIR[] {
    const dirs: DIR[] = [TOP, RIGHT, BOTTOM, LEFT];
    const available: DIR[] = [];
    dirs.forEach((dir) => {
        const newXY = moveXY(cellXY, dir);
        if (hasBorders && !isSameXY(newXY, bymodXY(newXY, manager.size()))) return;
        const neib = manager.cellAt(newXY);

        if (neib.figure === 0 && !neib.source) {
            available.push(dir);
        }
    });
    return available;
}

export function createGame(cols: number, rows: number, bordered: boolean = true): GameData {

    const game: GameData = { bordered, ...createArray2d(toXY(cols, rows)) };

    game.forEach((_, index) => { game.set(index, { figure: 0, source: 0 }) })

    const manager = new GameManager(game);
    const ends1 = initSource(manager, { at: toXY(2, 1), size: toXY(1, 1) }, 0b0001);
    const ends2 = initSource(manager, { at: toXY(2, 3), size: toXY(2, 2) }, 0b0010);
    const ends = ends1.concat(ends2);

    //TODO: make sure all sources having at least one exit
    //TODO: make sure no sources using all exits

    for (let i = 0; i < cols * rows * 2 && ends.length > 0; i++) {
        const fromIdx = rnd(ends.length - 1);
        const end = ends[fromIdx];
        const cell = manager.cellAt(end);
        const canGoTo = emptyDirs(manager, end, bordered);

        if (canGoTo.length > 0) {
            const dir = canGoTo[rnd(canGoTo.length - 1)];
            cell.figure |= dir;
            const opXy = moveXY(end, dir);
            const opCell = manager.cellAt(opXy);
            opCell.figure |= invertFigure(dir);
            ends.push(opXy);
        } else {
            ends.splice(fromIdx, 1);
        }
    }

    console.log("GAME CREATED1:", game.data()[0].figure.toString(2).padStart(4, "0"))

    //REMOVE SOME ENDS:

    function getAllEnds(): XY[] {
        const ends: XY[] = [];
        game.forEach((cell, xy) => {
            if (isEnd(cell.figure) && !cell.source) ends.push(xy);
        })
        return ends;
    }

    function deleteEnd(xy: XY) {
        const cell = manager.cellAt(xy);
        if (!isEnd(cell.figure) || cell.source) return;
        const ocell = manager.cellAtDir(xy, cell.figure);
        const odir = rotateFigure(cell.figure, 2);
        cell.figure = 0;
        ocell.figure &= ~odir;
    }

    for (let i = 0; i < game.size.x * game.size.y * 0.1; i++) {
        const allEnds = getAllEnds();
        if (allEnds.length > 0)
            deleteEnd(allEnds[rnd(allEnds.length - 1)])
    }

    //SHUFLE:

    // game.forEach((_, xy) => {
    //     const times = rnd(3);//0, 1, 2, 3
    //     for (let i = 0; i < times; i++) manager.rotateAtXY(xy);
    // })

    console.log("GAME CREATED2:", game.data()[0].figure.toString(2).padStart(4, "0"))


    return game;
}