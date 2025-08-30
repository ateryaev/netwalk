export function XY(x, y) {
    return { x: x, y: y };
}
export function EventXY(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = event.clientX - rect.left;
    const relY = event.clientY - rect.top;
    return { x: relX, y: relY };
}

// export function WH(w, h) {
//     return { w: w, h: h };
// }

export function addXY(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}
export function subXY(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}
export function mulXY(a, k) {
    return { x: a.x * k, y: a.y * k };
}
export function divXY(a, k) {
    return { x: a.x / k, y: a.y / k };
}

export function distXY(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function midXY(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function midXYArray(arr) {
    if (arr.length === 0) return { x: 0, y: 0 };
    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < arr.length; i++) {
        sumX += arr[i].x;
        sumY += arr[i].y;
    }
    return { x: sumX / arr.length, y: sumY / arr.length };
}

export function distXYArray(arr) {
    const center = midXYArray(arr);
    let totalDistance = 0;
    for (let i = 0; i < arr.length; i++) {
        totalDistance += distXY(arr[i], center);
    }
    return totalDistance / arr.length;
}

export function minmax(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function printXY(title, xy, ...args) {
    console.log(`${title}: ${xy.x.toFixed(2)} x ${xy.y.toFixed(2)}`, ...args)
}

