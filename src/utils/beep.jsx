import { zzfx, ZZFX } from 'zzfx';

export const BEEP = {
    sound: true,
    vibro: true,
}

ZZFX.volume = 0.7;
export function beepButton(mult = 1) {
    //if (!BEEP.sound) return;
    BEEP.sound && zzfx(0.5, .05, 220 + 50 * mult, 0, 0, .1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0); // Sound Default
    BEEP.vibro && vibro(2)
    return
}
export function preBeepButton(mult = 1) {
    BEEP.sound && zzfx(0.5, .05, 180, 0, 0, .05, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0); // Sound Default
    BEEP.vibro && vibro(1)
    return;
}

export function beepLevelComplete(vol = 1) {
    if (!BEEP.sound) return;
    BEEP.sound && zzfx(1.7 * vol, .05, 579 * 0.5, .01, 0.0, .15, 5, 1.9, 0, 0, 296, .08, 0, 0, 0, .1, .08, .7, .02, 0, -720);
    BEEP.vibro && vibro([20, 20, 40])
}

function vibro(param) {
    if (!BEEP.vibro) return;
    try {
        if (navigator.vibrate) navigator.vibrate(param);
    } catch (e) {
    }
}
