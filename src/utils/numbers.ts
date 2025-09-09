export function minmax(value: number, min: number, max: number): number {
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
