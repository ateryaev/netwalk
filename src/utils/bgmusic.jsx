export const MUSIC = {
    off: false
}

class MusicPlayer {
    constructor() {
        this.audioElement = new Audio();
        this.audioElement.preload = 'metadata'; // Enable streaming
        this.audioElement.controls = false;
        this.audioContext = null;
        this.gainNode = null;
        this.volume = 0.25;
        this.isPlaying = false;
        this.currentTrack = null;
        this.userInteracted = false; // Track if user has interacted
    }

    // Initialize AudioContext for effects/volume control
    init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;
        const sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
        sourceNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
    }

    // Play a track
    async play(trackUrl) {
        if (MUSIC.off) return;
        if (!this.audioContext) this.init();

        // Stop current track with fade-out if needed
        if (this.isPlaying) {
            await this.stop(0); // Stop immediately
        }

        this.setVolume(this.volume);
        // Set new track
        this.audioElement.src = trackUrl;
        this.currentTrack = trackUrl;

        // Handle autoplay policy
        const startPlayback = async () => {
            try {
                // Resume AudioContext if suspended
                if (this.audioContext.state === 'suspended') {
                    console.log(this.audioContext.state, "RESUMING");
                    await this.audioContext.resume();
                }
                const now = this.audioContext.currentTime;
                //this.gainNode.gain.setValueAtTime(this.volume, now);

                this.gainNode.gain.value = 0.001; // Start from near silence
                //this.gainNode.gain.linearRampToValueAtTime(this.volume, now + 2);
                this.gainNode.gain.exponentialRampToValueAtTime(this.volume, now + 2);


                await this.audioElement.play();
                this.isPlaying = true;
                this.userInteracted = true; // Mark user interaction
            } catch (error) {
                console.error('Playback failed:', error);
            }
        };

        startPlayback();
        // Start playback
        // if (this.userInteracted) {
        //     startPlayback();
        // } else {
        //     // Wait for user interaction (e.g., click)
        //     document.addEventListener('click', startPlayback, { once: true });
        // }
    }

    // Stop with optional fade-out
    async stop(fadeDuration = 0) {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        if (fadeDuration > 0) {
            // Fade out
            const now = this.audioContext.currentTime;
            //this.gainNode.gain.setValueAtTime(this.volume, now);
            this.gainNode.gain.linearRampToValueAtTime(0.001, now + fadeDuration);

            // Pause after fade completes
            await new Promise(resolve => setTimeout(resolve, fadeDuration * 1000));
        }

        this.audioElement.pause();
        this.isPlaying = false;
    }

    // Set volume (0 to 1)
    setVolume(volume) {
        this.volume = Math.min(Math.max(volume, 0), 1);
        if (this.gainNode) {
            this.gainNode.gain.value = this.volume;
        }
    }

    // Cleanup
    cleanup() {
        this.audioElement.pause();
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }
}

export default MusicPlayer;
