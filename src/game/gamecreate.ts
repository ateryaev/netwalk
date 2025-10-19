import { BOTTOM, cellFromDir, invertFigure, isEnd, LEFT, moveXY, RIGHT, rotateFigure, TOP, type DIR, type GameData } from "./gamedata";
import { addXY, bymodXY, isSameXY, loopXY, subXY, toXY, XY1, type RectXY, type XY } from "../utils/xy";
import { createArray2d } from "../utils/array2d";
import { CREATE_RND_FUNC, GAME_LEVEL_EMPTY, GAME_LEVEL_SIZE, GAME_LEVEL_SOURCES, GAME_MODE_BORDERED } from "./gameconstants";
import { createGameTutorial0, createGameTutorial1, createGameTutorial2, createGameTutorial3, createGameTutorial4 } from "./gametutorials";

function initSource(game: GameData, cellRect: RectXY, color: number) {

    let overlap = false;
    loopXY(addXY(cellRect.size, toXY(2, 2)), (xy) => {
        const cellXY = addXY(subXY(cellRect.at, XY1), xy);
        const cell = game.get(cellXY)!;
        if (cell.source !== 0 || cell.figure !== 0) {
            overlap = true;
        }
    });

    if (overlap) return null;

    const ends: XY[] = [];
    loopXY(cellRect.size, (xy) => {
        const cellXY = addXY(cellRect.at, xy);
        const cell = game.get(cellXY)!;
        cell.source = color;

        if (cellXY.y > cellRect.at.y) cell.figure |= TOP;
        if (cellXY.x > cellRect.at.x) cell.figure |= LEFT;
        if (cellXY.y < cellRect.at.y + cellRect.size.y - 1) cell.figure |= BOTTOM;
        if (cellXY.x < cellRect.at.x + cellRect.size.x - 1) cell.figure |= RIGHT;
        ends.push(cellXY)
    });

    return ends;
}

function emptyDirs(game: GameData, cellXY: XY, hasBorders: boolean = true): DIR[] {
    const dirs: DIR[] = [TOP, RIGHT, BOTTOM, LEFT];
    const available: DIR[] = [];
    dirs.forEach((dir) => {
        const newXY = moveXY(cellXY, dir);
        if (hasBorders && !isSameXY(newXY, bymodXY(newXY, game.size))) return;
        const neib = game.get(newXY);

        if (neib!.figure === 0 && !neib!.source) {
            available.push(dir);
        }
    });
    return available;
}

function generateNewEnd(game: GameData, ends: XY[], rndFunc: (max: number) => number, bordered: boolean) {
    const fromIdx = rndFunc(ends.length - 1);
    const end = ends[fromIdx];
    const cell = game.get(end);
    const canGoTo = emptyDirs(game, end, bordered);

    if (canGoTo.length > 0) {
        const dir = canGoTo[rndFunc(canGoTo.length - 1)];
        cell!.figure |= dir;
        const opXy = moveXY(end, dir);
        const opCell = game.get(opXy);
        opCell!.figure |= invertFigure(dir);
        ends.push(opXy);
    } else {
        ends.splice(fromIdx, 1);
    }
    return ends;
}

export function createGame(mode: number, level: number): GameData {

    if (mode === 0 && level === 0) {
        return createGameTutorial0();
    }
    if (mode === 1 && level === 0) {
        return createGameTutorial1();
    }
    if (mode === 2 && level === 0) {
        return createGameTutorial2();
    }
    if (mode === 3 && level === 0) {
        return createGameTutorial3();
    }
    if (mode === 4 && level === 0) {
        return createGameTutorial4();
    }
    //const rndFunc =  createRnd(mode * 995 + level * 13 + 23);
    const rndFunc = CREATE_RND_FUNC(mode, level, 991);
    console.log("CREATE GAME RND:", rndFunc(2), rndFunc(2), rndFunc(2), rndFunc(2), rndFunc(2));

    const size = GAME_LEVEL_SIZE(mode, level);
    const empty = GAME_LEVEL_EMPTY(mode, level);
    const cols = size.x;
    const rows = size.y;
    const bordered = GAME_MODE_BORDERED[mode];
    const game: GameData = {
        bordered, taps: 0, mode, level,
        hintXY: undefined,
        ...createArray2d(size)
    };





    // const sourceXY1 = operXY(Math.floor, toXY((cols - 1) / 2, (rows - 0) / 2));
    // const sourceXY2 = operXY(Math.floor, toXY((cols - 1) / 2, (rows - 0) / 4));
    // const sourceXY3 = operXY(Math.floor, toXY((cols - 1) / 2, (rows - 0) * 3 / 4));


    const firstColor = rndFunc(1);
    let ends: XY[] = [];


    game.forEach((_, index) => { game.set(index, { figure: 0, source: 0 }) })

    const sourceSizes = GAME_LEVEL_SOURCES(mode, level);
    const colors = sourceSizes.length;
    console.log("CREATE GAME", { mode, level, empty, colors, W: size.x, H: size.y });

    let colorsPool = colors;
    let trialsPool = colors * 4;


    while (colorsPool > 0 && trialsPool > 0) {
        trialsPool--;
        const size = sourceSizes[colorsPool - 1];
        const at = toXY(rndFunc(cols - size.x), rndFunc(rows - size.y));
        //const at = toXY(rnd(cols - size.x), rnd(rows - size.y));
        let endsN = initSource(game, { at, size }, 0b0001 << (firstColor + colorsPool) % 4);
        if (endsN) {
            console.log("SOURCE CREATED AT:", at, "SIZE:", size);
            endsN = generateNewEnd(game, endsN, rndFunc, bordered);
            ends = ends.concat(endsN);
            colorsPool--;
        }
    }
    console.log("SOURCE ENDS CREATED, REMAINING COLORS/TRIALS:", colorsPool, trialsPool);

    //TODO: make sure all sources having at least one exit
    //TODO: make sure no sources using all exits

    for (let i = 0; i < cols * rows * 2 && ends.length > 0; i++) {
        ends = generateNewEnd(game, ends, rndFunc, bordered);
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
        const cell = game.get(xy)!;
        if (!isEnd(cell.figure) || cell.source) return;
        const ocell = cellFromDir(game, xy, cell.figure);
        const odir = rotateFigure(cell.figure, 2);
        cell.figure = 0;
        ocell.figure &= ~odir;
    }

    for (let i = 0; i < empty; i++) {
        const allEnds = getAllEnds();
        if (allEnds.length > 0)
            deleteEnd(allEnds[rndFunc(allEnds.length - 1)])
    }

    // shufleGame(game);
    // game.taps = 0;
    return game;
}

