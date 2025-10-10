import { zzfx } from 'zzfx';

export function beepButton(mult = 1) {
    zzfx(1, .05, 220 + 50 * mult, 0, 0, .1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0); // Sound Default
    vibro(2)
    return
}
export function preBeepButton(mult = 1) {
    zzfx(1, .05, 180, 0, 0, .1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0); // Sound Default
    vibro(1)
    return;
}

export function beepLevelComplete() {
    setTimeout(() => zzfx(1.7, .05, 579, .01, 0, .15, 5, 1.9, 0, 0, 296, .08, 0, 0, 0, .1, .08, .7, .02, 0, -720), 80);
    vibro([20, 20, 40])
}

export function beepLevelStart() {
    setTimeout(() => zzfx(1.7, .05, 579 * 0.75, .01, 0, .15, 5, 1.9, 0, 0, 296, .08, 0, 0, 0, .1, .08, .7, .02, 0, -720), 80);
    vibro([40, 20]);
}

function vibro(param) {
    try {
        if (navigator.vibrate) navigator.vibrate(param);
    } catch (e) {
    }
}

