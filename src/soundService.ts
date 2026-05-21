// Sound service using Web Audio API (avoids ERR_CACHE_OPERATION_NOT_SUPPORTED)
class SoundService {
  private static instance: SoundService;
  private audioContext: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private isEnabled = true;
  private subscribers: Function[] = [];

  private constructor() {
    this.initializeAudioContext();
  }

  static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  // Load and decode a sound file into an AudioBuffer
  async preloadSound(name: string, path: string) {
    if (this.buffers.has(name)) return;

    try {
      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      this.buffers.set(name, audioBuffer);
    } catch (error) {
      console.warn(`Failed to load sound "${name}":`, error);
    }
  }

  // Play a sound by name
  playSound(name: string, volume: number = 0.5) {
    if (!this.isEnabled || !this.audioContext) return;

    const buffer = this.buffers.get(name);
    if (!buffer) {
      console.warn(`Sound "${name}" not loaded`);
      return;
    }

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start(0);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.subscribers.forEach(callback => callback(this.isEnabled));
  }

  // Get enabled status
  isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  // Subscribe to sound enabled changes
  subscribeToSoundChanges(callback: (enabled: boolean) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Play button click sound (convenience method)
  playButtonClick(volume: number = 0.255) {
    this.playSound('buttonClick', volume);
  }

  // Clean up
  cleanup() {
    this.buffers.clear();
  }
}

// Export singleton instance
export const soundService = SoundService.getInstance();

// Preload common sounds
soundService.preloadSound('buttonClick', '/Sound/button-click.wav');
soundService.preloadSound('notification', '/Sound/push-notification.wav');
