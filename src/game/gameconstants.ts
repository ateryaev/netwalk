import { createRnd } from "../utils/rnd";
import { type XY } from "../utils/xy";

export const GAME_MODES = [
    "Too young to loose", //only one color, many empties, bordered (basic tutorial), 5x5+
    "Hey, not too rough", //1-2 colors, some empties, bordered (multiple color tutorial), 6x6+
    "Hurt me plenty", //1-3 colors, few empties, looped (looped tutorial), 7x7+
    "Ultra-Violence",//1-4 colors, very few empties, looped (4 colors tutorial), 8x8+
    "Nightmare" //1-4 colors, almost no empties, looped, +broken cells with extra dirs (tutorial about broken cells), 9x9+
];

export const GAME_MODE_TUTORIALS = [
    "basic principles",
    "one more color",
    "earth is round",
    "four elements",
    "not so obvious"
];

export const GAME_MODE_EMPTIES = [
    [25, 50],
    [10, 25],
    [5, 10],
    [0, 5],
    [0, 1]
];

export const GAME_MODE_BORDERED = [true, true, false, false, false];

export const GAME_COLORS = 4;

//sizes: 5x5, 5x6, 6x6, 6x7, 7x7, 7x8, 8x8, 8x9, 9x9, 9x10, 10x10, 10x11, 11x11, 11x12, 12x12
//times:   5,   6,   6,   7,   7,   8,    8,   9,    9,   10,    10,   11,    11,   12,    12
//every size must be played GAME_SIZE(idx+1) - GAME_SIZE(idx) times
// export function GAME_SIZE(index: number): XY {
//     const size = 5 + Math.floor(index / 2);
//     const extra = index % 2;
//     return toXY(size, size + extra);
// }

export function GAME_LEVEL_SIZE(mode: number, level: number): XY {
    mode;
    const startSize = 5;
    const clampLevel = startSize * startSize + level;
    const x = Math.floor(Math.sqrt(clampLevel));
    let y = (clampLevel >= x * (x + 1)) ? x + 1 : x;
    return { x, y };
}

export function GAME_LEVEL_RANDOM(mode: number, level: number): boolean {
    mode;
    if (level === 0) return false;
    if (level === 8) return true;
    const startSize = 5;
    const clampLevel = startSize * startSize + level;
    const x = Math.floor(Math.sqrt(clampLevel));
    return x === Math.sqrt(clampLevel);
}

export function GAME_LEVEL_COLORS(mode: number, level: number): number {
    const rndFunc = createRnd(mode * 1000 + level + 100);
    let maxColors = 1;
    if (level > 5) maxColors = 2;
    if (level > 20) maxColors = 3;
    if (level > 40) maxColors = 4;
    return rndFunc(maxColors) + 1;
}

export function GAME_LEVEL_EMPTY(mode: number, level: number): number {
    const rndFunc = createRnd(mode * 999 + level);
    const [min, max] = GAME_MODE_EMPTIES[mode];
    const size = GAME_LEVEL_SIZE(mode, level);
    const minEmpty = Math.floor(size.x * size.y * min / 100);
    const maxEmpty = Math.floor(size.x * size.y * max / 100);
    return rndFunc(maxEmpty - minEmpty) + minEmpty;
}

export function GAME_MODE_SCORE(mode: number, levels: number): number {
    return (mode + 1) * levels * 100;
}

export function GAME_MODE_AVAILABLE(mode: number, preSolved: number): boolean {
    if (mode === 0) return true;
    const needed = [10, 10, 10, 10];
    return preSolved >= needed[mode - 1];
}

export function GAME_MODE_TO_UNLOCK(mode: number, preSolved: number): number {
    if (mode === 0) return 0;
    if (preSolved === 0) return 9999;
    const needed = [10, 10, 10, 10];
    return Math.max(needed[mode - 1] - preSolved, 0);
}