export const SIZE = 100;
export function COLOR(color) {
    switch (color) {
        case 0:
            return "#aaa";
        case 1:
            return "#39f" //"#5af";
        case 2:
            return "#f93"//"#fb0";
        case 4:
            return "#5e9";
        case 8:
            return "#a6e";

        case 100:
            return "#444";
        case 101:
            return "#456";
        case 102:
            return "#654";
        case 104:
            return "#465";
        case 108:
            return "#546";
        default:
            return color < 100 ? "#aaa" : "#444";
    }
}

export const TRANS_DURATION = 200;
