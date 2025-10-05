export function minmax(value: number, min: number, max: number): number {
    if (min > max) [min, max] = [max, min];
    return Math.max(min, Math.min(max, value));
}

export function bymod(value: number, mod: number): number {
    return ((value % mod) + mod) % mod;
}

export function rnd(max: number): number {
    return Math.floor(Math.random() * (max + 1));
}

export function progress(when: number, duration: number): number {
    const now = performance.now();
    return minmax((now - when) / duration, 0.0, 1.0);
}

export function progressToCurve(progress: number, curve: number[]): number {
    if (progress <= 0) return curve[0];
    if (progress >= 1) return curve[curve.length - 1];
    const idx = progress * (curve.length - 1);
    const idx0 = Math.floor(idx);
    const idx1 = Math.ceil(idx);
    if (idx0 === idx1) return curve[idx0];
    const p = idx - idx0;
    return curve[idx0] + (curve[idx1] - curve[idx0]) * p;
}

export function xyToIndex(xy: Readonly<{ x: number, y: number }>, width: number): number {
    return xy.y * width + xy.x;
}

export function indexToXy(index: number, width: number): { x: number, y: number } {
    return {
        x: index % width,
        y: Math.floor(index / width)
    };
}

export function fromto(from: number, to: number, progress: number): number {
    //done - if from-to is very small
    const result = (from + (to - from) * progress);
    return (Math.abs(result - to) < 0.1) ? to : result;
}