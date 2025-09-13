import { bymod, indexToXy, xyToIndex } from "./numbers";
import { type XY } from "./xy";

export type Array2d<Type> = {
    size: XY;
    get: (xy: XY) => Type | undefined,
    set: (at: XY, val: Type) => void,
    data: () => Type[],
    forEach: (callback: (val: Type, index: XY) => void) => void
}

export function createArray2d<Type>(size: XY): Array2d<Type> {

    const data: Type[] = Array.from({ length: size.x * size.y });
    const arr: Array2d<Type> = {
        size: size,
        get: (xy: XY) => {
            const x = bymod(xy.x, size.x);
            const y = bymod(xy.y, size.y);
            const val = data[xyToIndex({ x, y }, size.x)];
            return val;
        },
        set: (xy: XY, val: any) => {
            const x = bymod(xy.x, size.x);
            const y = bymod(xy.y, size.y);
            data[xyToIndex({ x, y }, size.x)] = val;
        },
        data: () => data,
        forEach: (callback: (val: any, index: XY) => void) => {
            data.forEach((val, dataIndex) => {
                callback(val, indexToXy(dataIndex, size.x));
            });
        }

    };

    return arr;
}