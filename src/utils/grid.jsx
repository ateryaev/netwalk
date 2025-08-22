// to render game items in viewport with wrap around scrolling
// grid.startLeft = 0; //means it shows first item in the first col, if 1 - then it shows second item in the first col
// grid.startTop = 0; //means it shows first item in the first row, if 1 - then it shows second item in the first row
// start position of the grig are floating point numbers, so you can set it to 0.5 to show half of the first item
// grid.width = 3; //how many items shown in a row
// grid.height = 3; //how many items shown in a column
// 


export function itemIndexAt(startLeft, startTop, gridCol, gridRow) {
    // calculate the index {col, row} of the item in the grid based on the gridCol and gridRow
    //use startLeft and startTop to calculate the index
    // const colOffset = grid.startLeft % 1; //fractional part of the start
    // const rowOffset = grid.startTop % 1; //fractional part of the start
    const col = gridCol + Math.floor(startLeft);
    const row = gridRow + Math.floor(startTop);
    return { col, row };
}

