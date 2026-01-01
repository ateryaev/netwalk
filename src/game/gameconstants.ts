import { rnd } from "../utils/numbers";
import { createRnd } from "../utils/rnd";
import { toXY, XY1, type XY } from "../utils/xy";

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

export const GAME_MODE_EMPTIES = [50, 40, 30, 20, 10];
export const GAME_MODE_EMPTIES_NAMES = [
    "many",
    "some",
    "moderate",
    "few",
    "almost no"];

export const GAME_MODE_BORDERED = [true, true, false, false, false];

export function GAME_LEVEL_SIZE(mode: number, level: number): XY {
    if (level === 0) return toXY(5, 5); //tutorial levels are 5x5
    const x = Math.floor(Math.sqrt(level)) + 4 + mode;
    const y = x;
    return { x, y };
}

export function GAME_LEVEL_RANDOM(mode: number, level: number): boolean {
    if (level === 0) return false;
    if (level % (20 - mode * 2) === 0) return true;
    return false;
}

export function CREATE_RND_FUNC(mode: number, level: number, seed: number): (max: number) => number {
    const isRandomRnd = GAME_LEVEL_RANDOM(mode, level);
    const rndFunc = isRandomRnd ? rnd : createRnd(mode * (1000 + seed) + level + seed / 2);
    return rndFunc;
}

export function GAME_LEVEL_COLORS(mode: number, level: number): number {
    const rndFunc = CREATE_RND_FUNC(mode, level, 100);
    let maxColors = [1, 2, 3, 4, 4][mode];
    return rndFunc(maxColors - 1) + 1;
}

export function GAME_LEVEL_SOURCES(mode: number, level: number): XY[] {
    const count = GAME_LEVEL_COLORS(mode, level);
    let possibleSizes: XY[] = [];

    if (mode === 0 && level >= 40) possibleSizes = [XY1, XY1, toXY(1, 2), toXY(2, 1)];
    else if (mode === 0) possibleSizes = [XY1];
    else if (mode === 1) possibleSizes = [XY1, XY1, toXY(1, 2), toXY(2, 1)];
    else if (mode === 2) possibleSizes = [XY1, XY1, toXY(1, 2), toXY(2, 1)];
    else if (mode === 3) possibleSizes = [XY1, XY1, toXY(1, 2), toXY(2, 1), toXY(2, 2)];
    else if (mode === 4 && level >= 40) possibleSizes = [XY1, XY1, toXY(1, 2), toXY(2, 1), toXY(2, 2), toXY(3, 1), toXY(1, 3), XY1];
    else if (mode === 4) possibleSizes = [XY1, XY1, toXY(1, 2), toXY(2, 1), toXY(2, 2)];

    const rndFunc = CREATE_RND_FUNC(mode, level, 101);
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(possibleSizes[rndFunc(possibleSizes.length - 1)]);
    }
    return result;
}


export function GAME_LEVEL_EMPTY(mode: number, level: number): number {
    const rndFunc = CREATE_RND_FUNC(mode, level, 211);

    const max = Math.max(1, GAME_MODE_EMPTIES[mode] - Math.floor(level / 10)); //-1% every 10 levels
    const min = mode === 4 ? 0 : Math.max(0, max / 2);

    const size = GAME_LEVEL_SIZE(mode, level);
    const minEmpty = Math.floor(size.x * size.y * min / 100);
    const maxEmpty = Math.floor(size.x * size.y * max / 100);
    return rndFunc(maxEmpty - minEmpty) + minEmpty;
}

export function GAME_MODE_SCORE(mode: number, levels: number): number {
    return [100, 200, 400, 800, 1600][mode] * levels;
}

export function GAME_MODE_TO_UNLOCK(mode: number, preSolved: number): number {
    //return 0; //unlock all modes for now
    if (mode === 0) return 0;
    if (preSolved === 0) return Infinity;
    const needed = [5, 10, 15, 20];
    return Math.max(needed[mode - 1] - preSolved, 0);
}
