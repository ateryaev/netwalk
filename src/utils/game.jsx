import { DIRS } from "./cfg";

function figureToDirs(figure) {
    const dirs = [];
    DIRS.forEach((dir) => {
        (figure & dir) && dirs.push(dir);
    });
    return dirs;
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

export function countEndsOn(game) {
    let count = 0;
    for (let row = 0; row < game.rows; row++) {
        for (let col = 0; col < game.cols; col++) {
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

export function countProgress(game) {
    let counts = {
        total: 0,
        colors: {
            0: 0,
            3: 0
        }
    };


    for (let row = 0; row < game.rows; row++) {
        for (let col = 0; col < game.cols; col++) {
            const cell = game.cells[row][col];
            if (cell.figure === 0) continue;
            //if (cell.source) continue;
            counts.total++;

            if (!counts.colors[cell.on]) counts.colors[cell.on] = 0;
            counts.colors[cell.on]++;

        }
    }
    console.log("countProgress", counts);
    return counts;
}

export function countEnds(game) {
    let count = 0;
    for (let row = 0; row < game.rows; row++) {
        for (let col = 0; col < game.cols; col++) {
            const cell = game.cells[row][col];
            if (cell.figure === 0) continue;
            if (cell.source) continue;
            const dirs = figureToDirs(cell.figure);
            if (dirs.length === 1) count++;
        }
    }
    return count;
}