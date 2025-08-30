//import { getSettings } from "./GameData";

let actx = null;

export function beep(vol, freq, delay, duration) {
    //if (!getSettings().sound) return;
    try {
        delay += 0.02;
        vol *= 0.9;
        if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
        let osc = actx.createOscillator();
        let gn = actx.createGain();
        osc.connect(gn)
        osc.frequency.value = freq;
        osc.type = "triangle";
        gn.connect(actx.destination);

        gn.gain.cancelScheduledValues(actx.currentTime);
        gn.gain.setValueAtTime(0.0001, actx.currentTime);
        gn.gain.linearRampToValueAtTime(vol, actx.currentTime + delay);
        gn.gain.linearRampToValueAtTime(0.0001, actx.currentTime + delay + duration);

        osc.start(actx.currentTime);
        osc.stop(actx.currentTime + delay + 0.02 + duration)
    } catch (e) {
        //ignore
    }
}

function vibro(param) {

    try {
        //if (window.RunNative("vibrate")) return;
        if (navigator.vibrate) navigator.vibrate(param);
    } catch (e) {
        //ignore
    }
}

export function beepButton() {
    beep(0.2, 50, 0, 0.05);
}

export function preBeepButton() {
    vibro(1);
}

export function beepSwipe(index) {
    beep(0.4, 30, 0, 0.05);
    vibro(1)
}

export function beepSwipeComplete() {
    beep(1, 87, 0, 0.1);
    beep(1, 87, 0.05, 0.1);
    vibro([40, 20, 20])
}

export function beepSwipeCancel() {
    beep(1, 73, 0, 0.1);
    beep(1, 73, 0.05, 0.1);
    vibro([20, 20, 40])
}

export function beepSolve() {
    beep(1, 110, 0.1, 0.2);
}
