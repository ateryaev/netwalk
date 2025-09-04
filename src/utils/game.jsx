import { BOTTOM, DIRS, LEFT, RIGHT, TOP, TRANS_DURATION } from "./cfg";
import { bymod } from "./helpers";

function invertDir(dir) {
    return {
        [TOP]: BOTTOM,
        [RIGHT]: LEFT,
        [BOTTOM]: TOP,
        [LEFT]: RIGHT
    }[dir];
}

export function extractDirs(figure) {
    return DIRS.filter(dir => figure & dir);
}

export function create(cols, rows) {
    const game = {
        cells: [],
        cols,
        rows,
        ends: 0,
        endsOn: 0,
        atXY: null,
        isConnected: null,
        rotateAtXY: null,
        rotatedOn: 0
    };

    //create empty cells
    for (let row = 0; row < rows; row++) {
        game.cells[row] = [];
        for (let col = 0; col < cols; col++) {
            game.cells[row][col] = {
                x: col,
                y: row,
                source: 0,
                on: false,
                figure: 0
            };
        }
    }

    return game;
}

export function countProgress(game) {
    let counts = {
        total: 0,
        colors: {
            0: 0,
            1: 0,
            2: 0,
            3: 0
        }
    };

    for (let row = 0; row < game.rows; row++) {
        for (let col = 0; col < game.cols; col++) {
            const cell = game.cells[row][col];
            if (cell.figure === 0) continue;
            if (cell.source) continue;
            counts.total++;

            if (!counts.colors[cell.on]) counts.colors[cell.on] = 0;
            counts.colors[cell.on]++;

        }
    }
    console.log("countProgress", counts);
    return counts;
}

function atXY(game, x, y) {
    x = bymod(x, game.cols);
    y = bymod(y, game.rows);
    return game.cells[y][x];
}
function atXYD(game, x, y, dir) {

    switch (dir) {
        case TOP: return atXY(game, x, y - 1);
        case RIGHT: return atXY(game, x + 1, y);
        case BOTTOM: return atXY(game, x, y + 1);
        case LEFT: return atXY(game, x - 1, y);
        default: return null;
    }
}


export function getRtConnections(game, now, x, y) {
    const cell = atXY(game, x, y);

    if (now - cell.rotatedOn < TRANS_DURATION) return 0;
    let rtConnections = 0;
    extractDirs(cell.figure).forEach((dir) => {
        const ocell = atXYD(game, x, y, dir);
        if (ocell.figure & invertDir(dir)) {
            if (cell.on === ocell.on) {
                if (now - ocell.rotatedOn >= TRANS_DURATION) rtConnections |= dir;
            }
        }
    })
    return rtConnections;
}