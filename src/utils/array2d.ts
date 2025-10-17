import { bymod, indexToXy, xyToIndex } from "./numbers";
import { type XY } from "./xy";

export type Array2d<Type> = {
    size: XY;
    data: Type[];
    get: (xy: XY) => Type,
    set: (at: XY, val: Type) => void,
    forEach: (callback: (val: Type, index: XY) => void) => void
}

export function createArray2d<Type>(size: XY): Array2d<Type> {

    const arr: Array2d<Type> = {
        size: size,
        data: Array.from({ length: size.x * size.y }),
        get: function (xy: XY) {
            const x = bymod(xy.x, size.x);
            const y = bymod(xy.y, size.y);
            const val = this.data[xyToIndex({ x, y }, size.x)];
            return val;
        },
        set: function (xy: XY, val: any) {
            const x = bymod(xy.x, size.x);
            const y = bymod(xy.y, size.y);
            this.data[xyToIndex({ x, y }, size.x)] = val;
        },

        forEach: function (callback: (val: any, index: XY) => void) {
            this.data.forEach((val, dataIndex) => {
                callback(val, indexToXy(dataIndex, size.x));
            });
        }

    };

    return arr;
}