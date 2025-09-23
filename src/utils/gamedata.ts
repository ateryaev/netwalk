import type { Array2d } from "./array2d";
import { toXY, type XY } from "./xy";

export const TOP = 0b1000;
export const RIGHT = 0b0100;
export const BOTTOM = 0b0010;
export const LEFT = 0b0001;

export type DIR = number; //one of TOP/RIGHT/BOTTOM/LEFT
export type FIGURE = number; //combination of DIRs
export type COLOR = number; //pure colors are power of 2, 0 means no color, others are mix colors

export type Cell = {
    figure: FIGURE;
    source: COLOR;
}

export interface GameData extends Array2d<Cell> {
    bordered: boolean,
    mode: number,
    level: number,
    taps: number,
}

export function isMix(color: number): boolean {
    return (color & (color - 1)) !== 0;
}

export function isOff(color: number): boolean {
    return color * 1 === 0;
}

export function isEnd(figure: number): boolean {
    return (figure === 0b1000 || figure === 0b0100 || figure === 0b0010 || figure === 0b0001)
}

export function isOn(color: number): boolean {
    return (color & (color - 1)) === 0 && color > 0;
}

export function rotateFigure(figure: number, times: number = 1) {
    times = times % 4;
    return (figure >> times) | (figure << (4 - times)) & 0b1111;
}

// export function invertDir(dir: DIR): number {
//     return (dir >> 2) | (dir << 2) & 0b1111;
// }

export function invertFigure(figure: number): number {
    return (figure >> 2) | (figure << 2) & 0b1111;
}

export function toDirs(figure: number): number[] {
    return [TOP, RIGHT, BOTTOM, LEFT].filter((dir) => figure & dir);
}

export function moveXY(xy: Readonly<XY>, dir: DIR): XY {
    const { x, y } = xy;
    switch (dir) {
        case TOP: return toXY(x, y - 1);
        case RIGHT: return toXY(x + 1, y);
        case BOTTOM: return toXY(x, y + 1);
        case LEFT: return toXY(x - 1, y);
    }
    return xy;
}