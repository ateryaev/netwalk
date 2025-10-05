const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let activeOscillators = [];

function beepStopAll() {
    activeOscillators.forEach(osc => osc.stop());
    activeOscillators = [];
}

function beep(frequency, duration, volume = 1, delay = 0) {
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = frequency;
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime + delay);
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    const now = audioContext.currentTime;
    gainNode.gain.value = 0;
    gainNode.gain.setValueAtTime(0, now + delay);
    gainNode.gain.linearRampToValueAtTime(volume, now + delay + duration * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + duration * 0.9);
    gainNode.gain.linearRampToValueAtTime(0, now + delay + duration);
    osc.start();
    osc.stop(now + delay + duration);
    activeOscillators.push(osc);
}

export function beepButton(mult = 1) {

    //beepStopAll();
    beep(553 * mult, 0.05, 1, 0);
    vibro(2)
}

export function preBeepButton(mult = 1) {
    beepStopAll();
    beep(659 * mult, 0.05, 0.25);
    vibro(1)
}

export function beepLevelComplete() {
    setTimeout(() => beep(553, 0.1), 200);
    setTimeout(() => beep(659, 0.1), 300);
    setTimeout(() => beep(784, 0.1), 400);
    vibro([20, 20, 40])
}

export function beepLevelStart() {
    setTimeout(() => beep(784, 0.1), 100);
    setTimeout(() => beep(659, 0.1), 200);
    setTimeout(() => beep(553, 0.1), 300);
    vibro([40, 20]);
}

function vibro(param) {
    try {
        if (navigator.vibrate) navigator.vibrate(param);
    } catch (e) {
    }
}

