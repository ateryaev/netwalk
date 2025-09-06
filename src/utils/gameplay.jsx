import { bymod, rnd } from "./helpers";
import { TOP, RIGHT, BOTTOM, LEFT, DIRS } from "./cfg";
import { countProgress } from "./game";
// const TOP = 0b1000;
// const RIGHT = 0b0100;
// const BOTTOM = 0b0010;
// const LEFT = 0b0001;
// const DIRS = [TOP, RIGHT, BOTTOM, LEFT];


export function createGame(cols, rows) {
    const game = {
        cells: [],
        cols,
        rows,
        ends: 0,
        endsOn: 0,
        atXY: null,
        isConnected: null,
        rotateAtXY: null,
    };

    //create empty cells
    for (let row = 0; row < rows; row++) {
        game.cells[row] = [];
        for (let col = 0; col < cols; col++) {
            game.cells[row][col] = {
                x: col,
                y: row,
                source: 0,      // 0 - regular cell, 1 - blue source, 2 - orange
                on: 0,          // 0 - off, 1 - blue, 2 - orange, 3 - red-mix
                figure: 0,      // 4 bits TRBL
                connections: 0, // 4 bits TRBL
                rotatedOn: 0, // time user click on cell
                switchedOn: 0, // time color was changed
                onBefore: 0, // 0..3 previous color
            };
        }
    }

    function countEnds() {
        let count = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = game.cells[row][col];
                if (cell.figure === 0) continue;
                if (cell.source) continue;
                const dirs = figureToDirs(cell.figure);
                if (dirs.length === 1) count++;
            }
        }
        return count;
    }

    function countEndsOn() {
        let count = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = game.cells[row][col];
                if (cell.figure === 0) continue;
                if (cell.source) continue;
                const dirs = figureToDirs(cell.figure);
                if (dirs.length === 1 && cell.on) count++;
            }
        }
        console.log("ENDS ON", count);
        return count;
    }

    function atXY(x, y) {
        x = bymod(x, cols);
        y = bymod(y, rows);
        return game.cells[y][x] || null;
    }

    game.atXY = atXY;

    //function isEmptyCell(x, y)


    function emptyDirs(x, y) {
        const dirs = [];
        DIRS.forEach((dir) => {
            if (atXYD(x, y, dir).figure === 0) {
                dirs.push(dir);

            }

        });
        return dirs;
    }

    function figureToDirs(figure) {
        const dirs = [];
        DIRS.forEach((dir) => {
            (figure & dir) && dirs.push(dir);
        });
        return dirs;
    }

    function atXYD(x, y, dir) {

        switch (dir) {
            case TOP: return atXY(x, y - 1);
            case RIGHT: return atXY(x + 1, y);
            case BOTTOM: return atXY(x, y + 1);
            case LEFT: return atXY(x - 1, y);
            default: return null;
        }
    }

    function oppositeDir(dir) {
        switch (dir) {
            case TOP: return BOTTOM;
            case RIGHT: return LEFT;
            case BOTTOM: return TOP;
            case LEFT: return RIGHT;
            default: return null;
        }
    }



    //check if a cell is connected in a given direction to neighboring cell
    function isConnected(x, y, dir) {
        const cell = atXY(x, y);

        const pf = cell.figure;// posedFigure(cell.figure, cell.pos);
        if ((pf & dir) === 0) return false; // No connection in this direction

        //console.log(dir.toString(2));
        const oppositeCell = atXYD(x, y, dir);
        const opf = oppositeCell.figure;//posedFigure(oppositeCell.figure, oppositeCell.pos);
        //console.log(pf.toString(2).padStart(4, "0"), dir.toString(2).padStart(4, "0"), opf.toString(2).padStart(4, "0"));
        //console.log((opf & oppositeDir(dir)) !== 0)

        if (cell.on !== oppositeCell.on) return false;
        // const now = performance.now();
        //  if ((now - cell.rotatedOn < 250) || (now - oppositeCell.rotatedOn < 250)) return false;

        return (opf & oppositeDir(dir)) !== 0; // Check if the opposite cell is connected back
    }

    game.isConnected = isConnected;

    function rotateAtXY(x, y) {
        const cell = atXY(x, y);
        if (!cell) return;
        if (!cell.source) {
            cell.figure = (cell.figure >> 1) | (cell.figure << 3) & 0b1111; // Rotate left
            cell.rotatedOn = performance.now()
        } else {
            //let cell1 = null;
            let cellUp = atXY(x, y - 1);
            let cellDown = atXY(x, y + 1);

            const [cell1, cell2] = cellUp.source ? [cellUp, cell] : [cell, cellDown];

            const figure1 = cell1.figure;
            const figure2 = cell2.figure;

            let newFigure1 = BOTTOM;
            let newFigure2 = TOP;
            if (figure2 & LEFT) newFigure1 |= LEFT;
            if (figure1 & LEFT) newFigure1 |= TOP;
            if (figure1 & TOP) newFigure1 |= RIGHT;

            if (figure1 & RIGHT) newFigure2 |= RIGHT;
            if (figure2 & RIGHT) newFigure2 |= BOTTOM;
            if (figure2 & BOTTOM) newFigure2 |= LEFT;

            cell1.figure = newFigure1;
            cell2.figure = newFigure2;
            cell1.rotatedOn = performance.now()
            cell2.rotatedOn = performance.now()
        }
    }

    game.rotateAtXY = rotateAtXY;

    function updateOnFromSource(x, y) {
        //return;
        const sourceCell = atXY(x, y);
        const color = sourceCell.source;
        sourceCell.on |= color;
        const actives = [sourceCell];

        for (let i = 0; i < actives.length; i++) {

            const cell = actives[i];
            const pf = cell.figure;

            figureToDirs(pf).forEach((dir) => {
                const od = oppositeDir(dir);
                const oc = atXYD(cell.x, cell.y, dir);
                const opf = oc.figure;//posedFigure(oc.figure, oc.pos);
                const connected = (opf & od);
                const sameColor = (oc.on & color);
                if (oc.done & color) return; // Skip if already processed by the source
                if (oc.source) return;
                if (connected && !sameColor) {
                    actives.push(oc);
                    oc.on |= color;
                }
            });
            cell.done |= cell.on; // Mark as done to avoid reprocessing
        }
    }

    function updateOnStates() {

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = atXY(col, row);
                cell.onBefore = cell.on;
                cell.on = 0;
                //cell.rotatedOn = performance.now()
                // cell.connections = 0b0000;
                // if (game.isConnected(col, row, TOP)) cell.connections |= TOP;
                // if (game.isConnected(col, row, RIGHT)) cell.connections |= RIGHT;
                // if (game.isConnected(col, row, BOTTOM)) cell.connections |= BOTTOM;
                // if (game.isConnected(col, row, LEFT)) cell.connections |= LEFT;

                cell.done = cell.source; // Reset done state
                cell.on = cell.source ? cell.source : 0;


            }
        }


        updateOnFromSource(serverCol, serverRow, 1);
        updateOnFromSource(serverCol, serverRow + 1, 1);
        updateOnFromSource(serverCol + 1, serverRow, 2);
        updateOnFromSource(serverCol + 1, serverRow + 1, 2);


        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = atXY(col, row);
                if (cell.on !== cell.onBefore) {
                    cell.switchedOn = performance.now();
                }
                cell.connections = 0b0000;
                if (game.isConnected(col, row, TOP)) cell.connections |= TOP;
                if (game.isConnected(col, row, RIGHT)) cell.connections |= RIGHT;
                if (game.isConnected(col, row, BOTTOM)) cell.connections |= BOTTOM;
                if (game.isConnected(col, row, LEFT)) cell.connections |= LEFT;

            }
        }
        game.endsOn = countEndsOn();
        console.log("ENDS ON 1", game.endsOn);
        return;
    }


    game.updateOnStates = updateOnStates;

    const serverCol = Math.floor(cols / 2 - 1);
    const serverRow = Math.floor(rows / 2 - 1);

    atXY(serverCol, serverRow).source = 0b01;
    atXY(serverCol, serverRow + 1).source = 0b01;
    atXY(serverCol, serverRow).figure = BOTTOM;
    atXY(serverCol, serverRow + 1).figure = TOP

    atXY(serverCol + 1, serverRow).source = 0b10;
    atXY(serverCol + 1, serverRow + 1).source = 0b10;
    atXY(serverCol + 1, serverRow).figure = BOTTOM;
    atXY(serverCol + 1, serverRow + 1).figure = TOP

    const ends = [
        { x: serverCol, y: serverRow },
        { x: serverCol + 1, y: serverRow },
        { x: serverCol, y: serverRow + 1 },
        { x: serverCol + 1, y: serverRow + 1 }
    ];



    for (let i = 0; i < 40 * 40; i++) {
        // console.log(`CAN GO FROM ${ends.length}`, i);
        if (ends.length === 0) {
            console.log("No more ends to process", i);
            break;
        }
        let fromIdx = i < 2 ? i : rnd(ends.length - 1);

        const end = ends[fromIdx];
        //console.log(`START FROM ${end.x},${end.y}`);

        //for (let end of ends) {
        const cell = atXY(end.x, end.y);
        const canGoTo = emptyDirs(end.x, end.y);

        if (canGoTo.length > 0) {
            const dir = canGoTo[rnd(canGoTo.length - 1)];
            cell.figure |= dir;
            // console.log(`FROM ${end.x},${end.y} to ${dir}`, cell.figure.toString(2).padStart(4, '0'), canGoTo);
            const oppositeCell = atXYD(end.x, end.y, dir);
            if (oppositeCell.source) {
                console.log("SOURCE!", cell.x, cell.y, "->", oppositeCell.x, oppositeCell.y);
            }
            ends.push({ x: oppositeCell.x, y: oppositeCell.y });
            oppositeCell.figure |= oppositeDir(dir);
        }

        //loop through ends and remove all having no unused dirs
        for (let j = ends.length - 1; j >= 0; j--) {
            const endCell = atXY(ends[j].x, ends[j].y);
            const cnt = emptyDirs(endCell.x, endCell.y).length;
            if (cnt === 0) {
                ends.splice(j, 1);
            }
            if (cnt === 1 && endCell.source) {
                ends.splice(j, 1);
            }
        }

    }


    game.ends = countEnds();

    game.shufle = function () {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const times = rnd(2);
                for (let i = 0; i < times; i++) rotateAtXY(col, row);
            }
        }
    }

    //game.shufle();

    updateOnStates();
    game.counts = countProgress(game);
    return game;


}