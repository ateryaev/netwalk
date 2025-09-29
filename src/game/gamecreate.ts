import { GameManager } from "./gamemanager";
import { BOTTOM, invertFigure, isEnd, LEFT, moveXY, RIGHT, rotateFigure, TOP, type DIR, type GameData } from "./gamedata";
import { rnd } from "../utils/numbers";
import { addXY, bymodXY, isSameXY, loopXY, operXY, toXY, type RectXY, type XY } from "../utils/xy";
import { createArray2d } from "../utils/array2d";
import { GAME_LEVEL_COLORS, GAME_LEVEL_EMPTY, GAME_LEVEL_SIZE, GAME_MODE_BORDERED } from "./gameconstants";
import { createRnd } from "../utils/rnd";
import { createGameTutorial } from "./gametutorials";

//type initSource = (manager: GameManager, cellRect: RectXY, color: number) => XY[];
//function emptyDirs(manager: GameManager, cellXY: XY, hasBorders: boolean): DIR[];


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

export function createGame(mode: number, level: number): GameData {

    if (mode === 0 && level === 0) {
        return createGameTutorial();
    }
    const rndFunc = createRnd(mode * 995 + level * 13 + 23);
    console.log("CREATE GAME", rndFunc(2), rndFunc(2), rndFunc(2), rndFunc(2), rndFunc(2));

    const size = GAME_LEVEL_SIZE(mode, level);
    const empty = GAME_LEVEL_EMPTY(mode, level); //not used now
    const colors = GAME_LEVEL_COLORS(mode, level); //not used now
    console.log("CREATE GAME", { mode, level, size, empty, colors });
    const cols = size.x;
    const rows = size.y;
    const bordered = GAME_MODE_BORDERED[mode];
    const game: GameData = { bordered, taps: 0, mode, level, hintText: undefined, hintXY: undefined, ...createArray2d(size) };

    game.forEach((_, index) => { game.set(index, { figure: 0, source: 0 }) })

    const manager = new GameManager(game);

    const source = rnd(1);

    const sourceXY1 = operXY(Math.floor, toXY((cols - 1) / 2, (rows - 0) / 2));
    const sourceXY2 = operXY(Math.floor, toXY((cols - 1) / 2, (rows - 0) / 4));
    const sourceXY3 = operXY(Math.floor, toXY((cols - 1) / 2, (rows - 0) * 3 / 4));

    let ends: XY[] = [];

    if (colors === 1) {
        const ends1 = initSource(manager, { at: sourceXY1, size: toXY(1, 1) }, 0b0001 << source);
        ends = ends.concat(ends1);
    } else if (colors === 2) {
        const ends2 = initSource(manager, { at: sourceXY2, size: toXY(1, 1) }, (0b0001 << (source + 1) % 4));
        const ends3 = initSource(manager, { at: sourceXY3, size: toXY(1, 1) }, (0b0001 << (source + 2) % 4));
        ends = ends.concat(ends2).concat(ends3);
    } else {
        const ends1 = initSource(manager, { at: sourceXY1, size: toXY(1, 1) }, 0b0001 << source);
        const ends2 = initSource(manager, { at: sourceXY2, size: toXY(1, 1) }, (0b0001 << (source + 1) % 4));
        const ends3 = initSource(manager, { at: sourceXY3, size: toXY(1, 1) }, (0b0001 << (source + 2) % 4));
        ends = ends.concat(ends1).concat(ends2).concat(ends3);
    }


    //TODO: make sure all sources having at least one exit
    //TODO: make sure no sources using all exits

    for (let i = 0; i < cols * rows * 2 && ends.length > 0; i++) {
        const fromIdx = rndFunc(ends.length - 1);
        const end = ends[fromIdx];
        const cell = manager.cellAt(end);
        const canGoTo = emptyDirs(manager, end, bordered);

        if (canGoTo.length > 0) {
            const dir = canGoTo[rndFunc(canGoTo.length - 1)];
            cell.figure |= dir;
            const opXy = moveXY(end, dir);
            const opCell = manager.cellAt(opXy);
            opCell.figure |= invertFigure(dir);
            ends.push(opXy);
        } else {
            ends.splice(fromIdx, 1);
        }
    }

    //console.log("GAME CREATED1:", game.data()[0].figure.toString(2).padStart(4, "0"))

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

    for (let i = 0; i < empty; i++) {
        const allEnds = getAllEnds();
        if (allEnds.length > 0)
            deleteEnd(allEnds[rndFunc(allEnds.length - 1)])
    }

    //SHUFLE:

    // game.forEach((_, xy) => {
    //     const times = rnd(3);//0, 1, 2, 3
    //     for (let i = 0; i < times; i++) manager.rotateAtXY(xy);
    // })

    //console.log("GAME CREATED2:", game.data()[0].figure.toString(2).padStart(4, "0"))

    shufleGame(game);
    return game;
}

export function shufleGame(game: GameData) {
    const manager = new GameManager(game);
    game.forEach((_, xy) => {
        const times = rnd(3);//0, 1, 2, 3
        for (let i = 0; i < times; i++) manager.rotateAtXY(xy);
    })
}
