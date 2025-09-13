export type XY = {
    x: number;
    y: number;
}
export type RectXY = {
    at: XY;
    size: XY;
}

type RoXY = Readonly<XY>

export function toRectXY(at: XY, size: XY): RectXY {
    return { at, size }
}
export function toXY(x: number, y: number): XY {
    return { x, y };
}

export function eventToXY(event: Readonly<{
    clientX: number,
    clientY: number,
    currentTarget: {
        getBoundingClientRect: () => { left: number, top: number }
    }
}>): XY {
    const rect = event.currentTarget.getBoundingClientRect();
    return toXY(event.clientX - rect.left, event.clientY - rect.top);
}

export function addXY(a: RoXY, b: RoXY): XY {
    return toXY(a.x + b.x, a.y + b.y);
}

export function mulXY(a: RoXY, k: number): XY {
    return toXY(a.x * k, a.y * k);
}

export function lenXY(xy: RoXY): number {
    return Math.sqrt(xy.x * xy.x + xy.y * xy.y);
}

export function distXY(a: RoXY, b: RoXY): number {
    return lenXY(addXY(a, mulXY(b, -1)));
}

export function midXY(a: RoXY, b: RoXY): XY {
    return mulXY(addXY(a, b), 0.5);
}

export function subXY(a: RoXY, b: RoXY): XY {
    return toXY(a.x - b.x, a.y - b.y);
}

export function divXY(a: RoXY, k: number): XY {
    return toXY(a.x / k, a.y / k);
}

export function midXYArray(arr: RoXY[]): XY {
    if (arr.length === 0) return toXY(0, 0);
    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < arr.length; i++) {
        sumX += arr[i].x;
        sumY += arr[i].y;
    }
    return toXY(sumX / arr.length, sumY / arr.length);
}

export function distXYArray(arr: RoXY[]): number {
    const center = midXYArray(arr);
    let totalDistance = 0;
    for (let i = 0; i < arr.length; i++) {
        totalDistance += distXY(arr[i], center);
    }
    return totalDistance / arr.length;
}

export function printXY(title: string, xy: RoXY, ...args: any) {
    console.log(`${title}: ${xy.x.toFixed(2)} x ${xy.y.toFixed(2)}`, ...args)
}

export function loopXY(range: XY, callback: (item: XY) => void) {
    for (let x = 0; x < range.x; x++) {
        for (let y = 0; y < range.y; y++) {
            callback({ x, y });
        }
    }
}

export function bymodXY(value: XY, mod: XY): XY {
    const x = ((value.x % mod.x) + mod.x) % mod.x;
    const y = ((value.y % mod.y) + mod.y) % mod.y;
    return { x, y };
}

export function isSameXY(xy1: XY, xy2: XY): boolean {
    return xy1.x === xy2.x && xy1.y === xy2.y;
}

export function operXY(func: (...args: number[]) => number, ...xys: XY[]) {

    const xx = xys.map((xy) => xy.x);
    const yy = xys.map((xy) => xy.y);
    return toXY(func(...xx), func(...yy));
}