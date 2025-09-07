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

export function isMix(color) {
    return (color & (color - 1)) !== 0;
}

export function isOff(color) {
    return color * 1 === 0;
}

export function isOn(color) {
    return (color & (color - 1)) === 0 && color > 0;
}

export function countProgress(game) {
    let counts = {
        total: 0,
        colors: {
            0: 0,
            1: 0,
            2: 0,
            4: 0,
            8: 0,
            333: 0
        }
    };

    for (let row = 0; row < game.rows; row++) {
        for (let col = 0; col < game.cols; col++) {
            const cell = game.cells[row][col];
            if (cell.figure === 0) continue;
            if (cell.source) continue;

            counts.total++;
            const color = isMix(cell.on) ? 333 : cell.on;

            if (!counts.colors[color]) counts.colors[color] = 0;
            counts.colors[color]++;

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
export function atXYD(game, x, y, dir) {

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

// getSourceRect(game, x, y) - return source position and size on the field using some source coors in the any place of source
// return {x,y,cols, rows} left top source cell and size of source
// source can be 1x1, 1xN, Nx1, 2x2

export function getCellRect(game, x, y) {
    const cell = atXY(game, x, y);
    let left = x, right = x, top = y, bottom = y;

    if (cell.source) {
        // Expand left and right
        while (atXY(game, left - 1, y).source === cell.source) left--;
        while (atXY(game, right + 1, y).source === cell.source) right++;

        // Expand top and bottom
        while (atXY(game, x, top - 1).source === cell.source) top--;
        while (atXY(game, x, bottom + 1).source === cell.source) bottom++;
    }

    return {
        x: left,
        y: top,
        cols: right - left + 1,
        rows: bottom - top + 1
    };
}

// rotateSourceRect({x,y,cols, rows}) - change all perimeter cell figures like it rotates as one body
// e.g. if 1x1: cell.figure = (cell.figure >> 1) | (cell.figure << 3) & 0b1111; // Rotate left
// if 1x2: top figure top goes to top figure right, but top figure right goes to bottom figure right, 
//e.t.c
export function rotateCell(game, x, y) {
    const cell = atXY(game, x, y);
    if (!cell.source) return (cell.figure >> 1) | (cell.figure << 3) & 0b1111;

    const cell_l = atXYD(game, x, y, LEFT);
    const cell_t = atXYD(game, x, y, TOP);
    const cell_r = atXYD(game, x, y, RIGHT);
    const cell_b = atXYD(game, x, y, BOTTOM);

    let newFigure = 0;

    if (cell_l.source === cell.source) {
        newFigure |= cell_l.figure & TOP;
        newFigure |= LEFT;
    } else {
        newFigure |= cell.figure & LEFT ? TOP : 0;
    }

    if (cell_t.source === cell.source) {
        newFigure |= cell_t.figure & RIGHT;
        newFigure |= TOP;
    } else {
        newFigure |= cell.figure & TOP ? RIGHT : 0;
    }
    if (cell_r.source === cell.source) {
        newFigure |= cell_r.figure & BOTTOM;
        newFigure |= RIGHT;
    } else {
        newFigure |= cell.figure & RIGHT ? BOTTOM : 0;
    }
    if (cell_b.source === cell.source) {
        newFigure |= cell_b.figure & LEFT;
        newFigure |= BOTTOM;
    } else {
        newFigure |= cell.figure & BOTTOM ? LEFT : 0;
    }
    return newFigure;
}

// export function getSourceShape(game, x, y) {
//     const cell = atXY(game, x, y);
//     if (!cell.source) return 0;

//     //if 
//     let shape = 0;
//     extractDirs(cell.figure).forEach((dir) => {
//         const ocell = atXYD(game, x, y, dir);
//         if (ocell.source === cell.source) {
//             shape |= dir;
//         }
//     })
//     return shape;
// }

export function initSource(game, x, y, cols, rows, color) {
    //loop rect area
    const ends = []
    for (let row = y; row < y + rows; row++) {
        for (let col = x; col < x + cols; col++) {
            const cell = atXY(game, col, row);
            cell.source = color;
            if (row > y) cell.figure |= TOP;
            if (col > x) cell.figure |= LEFT;
            if (row < y + rows - 1) cell.figure |= BOTTOM;
            if (col < x + cols - 1) cell.figure |= RIGHT;
            cell.on = color;
            ends.push({ x: col, y: row })
        }
    }
    return ends;
}