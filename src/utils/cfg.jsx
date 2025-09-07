export const TOP = 0b1000;
export const RIGHT = 0b0100;
export const BOTTOM = 0b0010;
export const LEFT = 0b0001;
export const DIRS = [TOP, RIGHT, BOTTOM, LEFT];

export const SIZE = 100;


export function COLOR(color) {
    switch (color) {
        case 0:
            return "#aaa";
        case 1:
            return "#5af";
        case 2:
            return "#fb0";
        case 4:
            return "#05DF72";
        case 8:
            return "#ED6AFF";
        default:
            return "#f66"; // Default for mix
    }
}

// export const COLORS = [
//     "#aaa",
//     "#5af",
//     "#fb0",
//     "oklch(70.4% 0.191 22.216)",
//     "#daa"];
export const RADS = { [RIGHT]: Math.PI / 2, [BOTTOM]: Math.PI, [LEFT]: Math.PI * 3 / 2, [TOP]: 0 }
export const TRANS_DURATION = 150;

export const SOURCE_1x1 = 0;