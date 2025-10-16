import { beepButton, beepLevelComplete } from "../utils/beep";
import { drawStar } from "../utils/canvas";
import { rnd } from "../utils/numbers";
import { toXY, type XY } from "../utils/xy";
import { COLOR } from "./cfg";
import { isEnd } from "./gamedata";

const stars: { x: number, y: number, color: string, size: number }[] = [];

export function createEffect(duration: number = 1000) {
    const startedOn = performance.now();

    const data = {
        index: -1, // how many full seconds passed
        progress: 0, // 0..1 progress in current second
        shake: 0, // -2..2 shake offset in current half second
        visibility: 0, // 0..1 visibility factor in last half second
        switched: false, // whether switched to next second in last update
    }

    const update = () => {
        const oldIndex = data.index;
        const age = performance.now() - startedOn;
        data.index = Math.floor(age / duration);
        data.progress = (age % duration) / duration;
        data.shake = data.progress < 0.4 ? age / 20 % 4 - 2 : 0;
        data.visibility = Math.min(1, (1 - data.progress) * 2);
        data.switched = (oldIndex !== data.index);
        return data;
    };

    const get = () => { return data; };

    return { get, update };
}

export function produceEndingEffect(ctx: CanvasRenderingContext2D, size: XY, phase: any) {
    if (!phase) return;
    const { index, shake, visibility, switched } = phase;

    let dx = shake;
    let dy = 200 * (1 - visibility);

    if (switched) {
        //just restarted
        stars.length = 0;
        const volume = 1 - (index / 3) * 0.7;
        if (index < 4) beepLevelComplete(volume);
        for (let i = 0; i < 5; i++) {
            stars.push({
                ...toXY(Math.random() * size.x, Math.random() * size.y),
                color: COLOR(1 << rnd(3)),
                size: Math.random(),
            });
        }
    }

    stars.forEach((star) => {
        ctx.globalAlpha = visibility * 0.5;
        drawStar(ctx, star.x + dx, star.y + dy * (0.5 + star.size * 0.5), 25 + 25 * star.size, star.color);
    });

}

export function playRotatedFx(figure: number, source: number) {
    if (figure === 0) {
        return;
    } else if (figure === 0b1111 && !source) {
        beepButton(0.5);
    } else if (source) {
        beepButton(0.7);
    } else if (figure === 0b1010 || figure === 0b0101) {
        beepButton(0.9);
    } else if (figure === 0b1100 || figure === 0b0011 || figure === 0b0110 || figure === 0b1001) {
        beepButton(1.1);
    } else if (isEnd(figure)) {
        beepButton(1.5);
    } else {
        beepButton(1.3);
    }
}