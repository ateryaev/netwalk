type TypeXY = {
    x: number;
    y: number;
}
type RoTypeXY = Readonly<TypeXY>

export function XY(x: number, y: number): TypeXY {
    return { x, y };
}

export function eventToXY(event: Readonly<{
    clientX: number,
    clientY: number,
    currentTarget: {
        getBoundingClientRect: () => { left: number, top: number }
    }
}>): TypeXY {
    const rect = event.currentTarget.getBoundingClientRect();
    return XY(event.clientX - rect.left, event.clientY - rect.top);
}

export function addXY(a: RoTypeXY, b: RoTypeXY): TypeXY {
    return XY(a.x + b.x, a.y + b.y);
}

export function mulXY(a: RoTypeXY, k: number): TypeXY {
    return XY(a.x * k, a.y * k);
}

export function lenXY(xy: RoTypeXY): number {
    return Math.sqrt(xy.x * xy.x + xy.y * xy.y);
}

export function distXY(a: RoTypeXY, b: RoTypeXY): number {
    return lenXY(addXY(a, mulXY(b, -1)));
}

export function midXY(a: RoTypeXY, b: RoTypeXY): TypeXY {
    return mulXY(addXY(a, b), 0.5);
}

export function subXY(a: RoTypeXY, b: RoTypeXY): TypeXY {
    return XY(a.x - b.x, a.y - b.y);
}

export function divXY(a: RoTypeXY, k: number): TypeXY {
    return XY(a.x / k, a.y / k);
}

export function midXYArray(arr: RoTypeXY[]): TypeXY {
    if (arr.length === 0) return XY(0, 0);
    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < arr.length; i++) {
        sumX += arr[i].x;
        sumY += arr[i].y;
    }
    return XY(sumX / arr.length, sumY / arr.length);
}

export function distXYArray(arr: RoTypeXY[]): number {
    const center = midXYArray(arr);
    let totalDistance = 0;
    for (let i = 0; i < arr.length; i++) {
        totalDistance += distXY(arr[i], center);
    }
    return totalDistance / arr.length;
}

export function printXY(title: string, xy: RoTypeXY, ...args: any) {
    console.log(`${title}: ${xy.x.toFixed(2)} x ${xy.y.toFixed(2)}`, ...args)
}
