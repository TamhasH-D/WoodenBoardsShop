/**
 * Sound utilities for chat notifications
 */

class SoundManager {
  constructor() {
    this.sounds = new Map();
    this.enabled = true;
    this.volume = 0.5;
    
    // Initialize sounds
    this.initializeSounds();
  }

  /**
   * Initialize sound files
   */
  initializeSounds() {
    const soundFiles = {
      newMessage: this.createBeepSound(800, 200), // High beep for new messages
      messageSent: this.createBeepSound(600, 100), // Lower beep for sent messages
      notification: this.createBeepSound(1000, 150), // Notification sound
      error: this.createBeepSound(300, 300), // Error sound
      connect: this.createBeepSound(900, 100), // Connection sound
      disconnect: this.createBeepSound(400, 200) // Disconnection sound
    };

    Object.entries(soundFiles).forEach(([name, audio]) => {
      this.sounds.set(name, audio);
    });
  }

  /**
   * Create a beep sound using Web Audio API
   */
  createBeepSound(frequency = 800, duration = 200) {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      return () => {
        if (!this.enabled) return;
        
        // Create oscillator
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure oscillator
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        // Configure gain (volume)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
        
        // Play sound
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
      };
    } catch (error) {
      console.warn('Web Audio API not supported, using fallback');
      return () => {}; // Silent fallback
    }
  }

  /**
   * Play a sound by name
   */
  play(soundName) {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      try {
        sound();
      } catch (error) {
        console.warn(`Failed to play sound: ${soundName}`, error);
      }
    }
  }

  /**
   * Enable/disable sounds
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    
    // Save preference to localStorage
    try {
      localStorage.setItem('chat_sounds_enabled', enabled.toString());
    } catch (error) {
      console.warn('Failed to save sound preference', error);
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Save preference to localStorage
    try {
      localStorage.setItem('chat_sounds_volume', this.volume.toString());
    } catch (error) {
      console.warn('Failed to save volume preference', error);
    }
  }

  /**
   * Load preferences from localStorage
   */
  loadPreferences() {
    try {
      const enabledPref = localStorage.getItem('chat_sounds_enabled');
      if (enabledPref !== null) {
        this.enabled = enabledPref === 'true';
      }
      
      const volumePref = localStorage.getItem('chat_sounds_volume');
      if (volumePref !== null) {
        this.volume = parseFloat(volumePref) || 0.5;
      }
    } catch (error) {
      console.warn('Failed to load sound preferences', error);
    }
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get current volume
   */
  getVolume() {
    return this.volume;
  }
}

// Create singleton instance
const soundManager = new SoundManager();

// Load preferences on initialization
soundManager.loadPreferences();

// Export convenience functions
export const playSound = (soundName) => soundManager.play(soundName);
export const setSoundsEnabled = (enabled) => soundManager.setEnabled(enabled);
export const setSoundVolume = (volume) => soundManager.setVolume(volume);
export const isSoundsEnabled = () => soundManager.isEnabled();
export const getSoundVolume = () => soundManager.getVolume();

// Export sound names for consistency
export const SOUNDS = {
  NEW_MESSAGE: 'newMessage',
  MESSAGE_SENT: 'messageSent',
  NOTIFICATION: 'notification',
  ERROR: 'error',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect'
};

export default soundManager;
