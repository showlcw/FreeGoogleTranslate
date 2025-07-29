// Audio Manager - Handle all game sounds and music

class AudioManager extends EventEmitter {
    constructor() {
        super();
        this.sounds = {};
        this.settings = {
            bgmVolume: 0.7,
            sfxVolume: 0.8,
            muted: false
        };
        
        this.currentBGM = null;
        this.audioContext = null;
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupAudioElements();
        this.createAudioContext();
        this.preloadSounds();
    }
    
    loadSettings() {
        const saved = Storage.get('gameSettings', {});
        if (saved.bgmVolume !== undefined) this.settings.bgmVolume = saved.bgmVolume / 100;
        if (saved.sfxVolume !== undefined) this.settings.sfxVolume = saved.sfxVolume / 100;
        if (saved.muted !== undefined) this.settings.muted = saved.muted;
    }
    
    setupAudioElements() {
        // Get existing audio elements
        this.sounds.bgm = document.getElementById('bgm');
        this.sounds.move = document.getElementById('move-sound');
        this.sounds.eliminate = document.getElementById('eliminate-sound');
        this.sounds.victory = document.getElementById('victory-sound');
        this.sounds.defeat = document.getElementById('defeat-sound');
        
        // Set initial volumes
        Object.values(this.sounds).forEach(audio => {
            if (audio) {
                audio.volume = audio.id === 'bgm' ? this.settings.bgmVolume : this.settings.sfxVolume;
            }
        });
    }
    
    createAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    preloadSounds() {
        // Since we don't have actual audio files, we'll create synthetic sounds
        this.createSyntheticSounds();
    }
    
    createSyntheticSounds() {
        if (!this.audioContext) return;
        
        // Create sound effects using Web Audio API
        this.syntheticSounds = {
            click: () => this.createTone(800, 0.1, 'square'),
            eliminate: () => this.createElimateSound(),
            victory: () => this.createVictorySound(),
            defeat: () => this.createDefeatSound(),
            move: () => this.createTone(400, 0.15, 'sine'),
            collect: () => this.createCollectSound(),
            bomb: () => this.createBombSound(),
            unlock: () => this.createUnlockSound()
        };
    }
    
    createTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(this.settings.sfxVolume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    createElimateSound() {
        if (!this.audioContext) return;
        
        // Create a burst of frequencies for elimination effect
        const frequencies = [600, 800, 1000];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.2, 'square');
            }, index * 50);
        });
    }
    
    createVictorySound() {
        if (!this.audioContext) return;
        
        // Ascending melody for victory
        const melody = [523, 659, 784, 1047]; // C, E, G, C
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.3, 'sine');
            }, index * 200);
        });
    }
    
    createDefeatSound() {
        if (!this.audioContext) return;
        
        // Descending tone for defeat
        const frequencies = [400, 350, 300, 250];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.4, 'sawtooth');
            }, index * 100);
        });
    }
    
    createCollectSound() {
        if (!this.audioContext) return;
        
        // Quick ascending chime
        const frequencies = [800, 1000, 1200];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.1, 'sine');
            }, index * 30);
        });
    }
    
    createBombSound() {
        if (!this.audioContext) return;
        
        // Explosion effect - noise burst
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 100;
        
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        
        gainNode.gain.setValueAtTime(this.settings.sfxVolume * 0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        // Frequency modulation for explosion effect
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
    
    createUnlockSound() {
        if (!this.audioContext) return;
        
        // Magical unlock sound
        const frequencies = [523, 659, 784, 1047, 1319]; // C major pentatonic
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.15, 'sine');
            }, index * 80);
        });
    }
    
    playSound(soundName, options = {}) {
        if (this.settings.muted) return;
        
        // Play synthetic sound if available
        if (this.syntheticSounds && this.syntheticSounds[soundName]) {
            this.syntheticSounds[soundName]();
            return;
        }
        
        // Fallback to audio elements
        const audio = this.sounds[soundName];
        if (audio) {
            audio.currentTime = 0;
            audio.volume = (audio.id === 'bgm' ? this.settings.bgmVolume : this.settings.sfxVolume) * (options.volume || 1);
            
            const playPromise = audio.play();
            if (playPromise) {
                playPromise.catch(e => {
                    console.warn('Audio play failed:', e);
                });
            }
        }
    }
    
    playBGM(trackName = 'bgm') {
        if (this.settings.muted) return;
        
        // Stop current BGM
        this.stopBGM();
        
        const bgm = this.sounds[trackName];
        if (bgm) {
            bgm.volume = this.settings.bgmVolume;
            bgm.loop = true;
            
            const playPromise = bgm.play();
            if (playPromise) {
                playPromise.then(() => {
                    this.currentBGM = bgm;
                }).catch(e => {
                    console.warn('BGM play failed:', e);
                });
            }
        }
    }
    
    stopBGM() {
        if (this.currentBGM) {
            this.currentBGM.pause();
            this.currentBGM.currentTime = 0;
            this.currentBGM = null;
        }
    }
    
    pauseBGM() {
        if (this.currentBGM) {
            this.currentBGM.pause();
        }
    }
    
    resumeBGM() {
        if (this.currentBGM && this.currentBGM.paused && !this.settings.muted) {
            const playPromise = this.currentBGM.play();
            if (playPromise) {
                playPromise.catch(e => {
                    console.warn('BGM resume failed:', e);
                });
            }
        }
    }
    
    setVolume(type, volume) {
        // Volume should be 0-100
        const normalizedVolume = Math.max(0, Math.min(100, volume)) / 100;
        
        if (type === 'bgm') {
            this.settings.bgmVolume = normalizedVolume;
            if (this.currentBGM) {
                this.currentBGM.volume = normalizedVolume;
            }
        } else if (type === 'sfx') {
            this.settings.sfxVolume = normalizedVolume;
        }
        
        this.saveSettings();
    }
    
    mute(muted = true) {
        this.settings.muted = muted;
        
        if (muted) {
            this.pauseBGM();
        } else {
            this.resumeBGM();
        }
        
        this.saveSettings();
        this.emit('muteChanged', muted);
    }
    
    isMuted() {
        return this.settings.muted;
    }
    
    saveSettings() {
        const settings = Storage.get('gameSettings', {});
        settings.bgmVolume = Math.round(this.settings.bgmVolume * 100);
        settings.sfxVolume = Math.round(this.settings.sfxVolume * 100);
        settings.muted = this.settings.muted;
        Storage.set('gameSettings', settings);
    }
    
    // Game-specific sound effects
    playBlockClick() {
        this.playSound('click');
    }
    
    playBlockElimination() {
        this.playSound('eliminate');
    }
    
    playPlayerMove() {
        this.playSound('move');
    }
    
    playLevelComplete() {
        this.playSound('victory');
    }
    
    playLevelFailed() {
        this.playSound('defeat');
    }
    
    playItemCollected() {
        this.playSound('collect');
    }
    
    playBombUse() {
        this.playSound('bomb');
    }
    
    playKeyUse() {
        this.playSound('unlock');
    }
    
    playHintUse() {
        this.playSound('click');
    }
    
    // Context management for mobile browsers
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('Audio context resumed');
            });
        }
    }
    
    // Handle visibility change (pause audio when tab is hidden)
    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseBGM();
        } else {
            this.resumeBGM();
            this.resumeAudioContext();
        }
    }
}

// Initialize audio context on user interaction (required by browsers)
document.addEventListener('click', function initAudio() {
    if (window.audioManager) {
        window.audioManager.resumeAudioContext();
    }
    document.removeEventListener('click', initAudio);
}, { once: true });

document.addEventListener('touchstart', function initAudioTouch() {
    if (window.audioManager) {
        window.audioManager.resumeAudioContext();
    }
    document.removeEventListener('touchstart', initAudioTouch);
}, { once: true });

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (window.audioManager) {
        window.audioManager.handleVisibilityChange();
    }
});