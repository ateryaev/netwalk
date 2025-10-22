import { sleep } from "./helpers";

export default
    class MusicPlayer {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.gain = this.ctx.createGain();
        this.gain.connect(this.ctx.destination);
        this.audio = null;
        this.source = null;
        this.fadeTime = 2.0;

        document.body.addEventListener("pointerup", () => this.ctx.resume());
        this.timeout = null;

    }

    async resume(url) {
        console.log("CURRENT SRC:", this.audio?.filename);

        clearTimeout(this.timeout);
        this.timeout = null;
        this.gain.gain.cancelScheduledValues(this.ctx.currentTime);

        if (this.audio && this.audio.filename !== url) {
            //teardown current track
            await this.pause();
        }

        if (this.audio?.filename !== url) {
            console.log("STARTING NEW", url)
            this.audio = new Audio(url);
            this.audio.filename = url;
            this.audio.loop = false;
            this.audio.crossOrigin = "anonymous";
            this.audio.volume = 0.25;
            this.audio.playbackRate = 0.9;
            this.gain.gain.value = 0;
            const track = this.ctx.createMediaElementSource(this.audio);
            track.connect(this.gain);
        }

        if (this.timeout) return; // pause was ran during await resume
        await this.ctx.resume();
        await this.audio.play();
        if (this.timeout) return; // pause was ran during await resume

        const currentGain = this.gain.gain.value;
        const duration = this.fadeTime * (1 - currentGain);

        console.log("RESUMING FROM:", currentGain)
        this.gain.gain.setValueAtTime(currentGain, this.ctx.currentTime);
        if (currentGain < 0.0001) {
            console.log("RESUMING WITH DELAY!");
            this.gain.gain.setValueAtTime(currentGain, this.ctx.currentTime + duration);
            this.gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + duration * 2);
        } else {
            this.gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + duration);
        }
    }

    async pause() {
        if (!this.audio) return;

        const currentGain = this.gain.gain.value;
        const duration = this.fadeTime * (currentGain);
        console.log("PAUSING FROM", this.gain.gain.value, "DURATION:", duration)
        this.gain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.gain.gain.setValueAtTime(currentGain, this.ctx.currentTime);
        this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);

        clearTimeout(this.timeout);
        await new Promise(resolve => {
            this.timeout = setTimeout(() => {
                this.audio.pause();
                this.timeout = null;
                resolve();
            }, duration * 1000);
        });
    }
}
