import { zzfx, ZZFX } from 'zzfx';

export const BEEP = {
    sound: true,
    vibro: true,
}

ZZFX.volume = 0.7;
export function beepButton(mult = 1) {
    if (!BEEP.sound) return;
    zzfx(0.5, .05, 220 + 50 * mult, 0, 0, .1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0); // Sound Default
    vibro(2)
    return
}
export function preBeepButton(mult = 1) {
    if (!BEEP.sound) return;
    zzfx(0.5, .05, 180, 0, 0, .05, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0); // Sound Default
    vibro(1)
    return;
}

export function beepLevelComplete(vol = 1) {
    if (!BEEP.sound) return;
    zzfx(1.7 * vol, .05, 579 * 0.5, .01, 0.0, .15, 5, 1.9, 0, 0, 296, .08, 0, 0, 0, .1, .08, .7, .02, 0, -720);
    vibro([20, 20, 40])
}

export function beepLevelStart(vol = 1) {
    if (!BEEP.sound) return;
    zzfx(1.7 * vol, .05, 579, .01, 0.15, .15, 5, 1.9, 0, 0, 296, .08, 0, 0, 0, .1, .08, .7, .02, 0, -720);
    vibro([40, 20]);
}

function vibro(param) {
    if (!BEEP.vibro) return;
    try {
        if (navigator.vibrate) navigator.vibrate(param);
    } catch (e) {
    }
}

function unlockAudio() {
    if (ZZFX.audioContext.state === 'suspended') {
        //console.log(ZZFX.audioContext.state, "RESUMING")
        ZZFX.audioContext.resume();
    }
}

// example usage
// document.addEventListener('touchstart', unlockAudio, { once: true });
// document.addEventListener('click', unlockAudio, { once: true });