import Sound from 'react-native-sound';
import { AppState, AppStateStatus } from 'react-native';

interface SoundConfig {
  filename: string;
  numberOfLoops?: number;
  volume?: number;
}

class CommonAudioManagerClass {
  private backgroundMusic: Sound | null = null;
  private gameBackgroundMusic: Sound | null = null;
  private isInitialized: boolean = false;
  private appStateSubscription: any = null;
  private loadingPromises: Map<string, Promise<Sound>> = new Map();

  constructor() {
    this.initializeAudioSystem();
    this.setupAppStateListener();
  }

  private initializeAudioSystem() {
    if (this.isInitialized) {return;}

    // Enable playback in silent mode on iOS
    Sound.setCategory('Playback');
    this.isInitialized = true;
  }

  private setupAppStateListener() {
    // Handle app lifecycle to prevent memory leaks
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // Pause audio when app goes to background to save battery
      this.pauseAllAudio();
    } else if (nextAppState === 'active') {
      // Resume audio when app becomes active (if it was playing)
      this.resumeAudio();
    }
  };

  private async loadSound(config: SoundConfig): Promise<Sound> {
    const { filename, numberOfLoops = 0, volume = 1.0 } = config;

    // Check if we're already loading this sound
    if (this.loadingPromises.has(filename)) {
      return this.loadingPromises.get(filename)!;
    }

    const loadPromise = new Promise<Sound>((resolve, reject) => {
      const sound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.error(`Error loading sound ${filename}:`, error);
          this.loadingPromises.delete(filename);
          reject(error);
          return;
        }

        sound.setNumberOfLoops(numberOfLoops);
        sound.setVolume(volume);
        resolve(sound);
        this.loadingPromises.delete(filename);
      });
    });

    this.loadingPromises.set(filename, loadPromise);
    return loadPromise;
  }

  private releaseSoundSafely(sound: Sound | null): Promise<void> {
    return new Promise((resolve) => {
      if (!sound) {
        resolve();
        return;
      }

      // Stop the sound first, then release
      sound.stop(() => {
        sound.release();
        resolve();
      });
    });
  }

  async playBackgroundMusic(): Promise<void> {
    try {
      // Stop existing background music to prevent overlapping
      if (this.backgroundMusic) {
        await this.releaseSoundSafely(this.backgroundMusic);
        this.backgroundMusic = null;
      }

      this.backgroundMusic = await this.loadSound({
        filename: 'basic_background_music.mp3',
        numberOfLoops: -1, // Loop indefinitely
        volume: 0.7,
      });

      this.backgroundMusic.play((success) => {
        if (!success) {
          console.error('Basic background music playback failed');
          this.releaseSoundSafely(this.backgroundMusic);
          this.backgroundMusic = null;
        }
      });
    } catch (error) {
      console.error('Failed to play background music:', error);
    }
  }

  async stopBackgroundMusic(): Promise<void> {
    if (this.backgroundMusic) {
      await this.releaseSoundSafely(this.backgroundMusic);
      this.backgroundMusic = null;
    }
  }

  async playGameBackgroundMusic(): Promise<void> {
    try {
      // Stop existing game music to prevent overlapping
      if (this.gameBackgroundMusic) {
        await this.releaseSoundSafely(this.gameBackgroundMusic);
        this.gameBackgroundMusic = null;
      }

      this.gameBackgroundMusic = await this.loadSound({
        filename: 'find_it_background_music.mp3',
        numberOfLoops: -1, // Loop indefinitely
        volume: 0.6,
      });

      this.gameBackgroundMusic.play((success) => {
        if (!success) {
          console.error('Game background music playback failed');
          this.releaseSoundSafely(this.gameBackgroundMusic);
          this.gameBackgroundMusic = null;
        }
      });
    } catch (error) {
      console.error('Failed to play game background music:', error);
    }
  }

  async stopGameBackgroundMusic(): Promise<void> {
    if (this.gameBackgroundMusic) {
      await this.releaseSoundSafely(this.gameBackgroundMusic);
      this.gameBackgroundMusic = null;
    }
  }

  async initBackgroundMusic(): Promise<void> {
    // Clean initialization that prevents memory leaks
    await Promise.all([
      this.stopGameBackgroundMusic(),
      this.stopBackgroundMusic(),
    ]);
  }

  private pauseAllAudio() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
    if (this.gameBackgroundMusic) {
      this.gameBackgroundMusic.pause();
    }
  }

  private resumeAudio() {
    if (this.backgroundMusic) {
      this.backgroundMusic.play();
    }
    if (this.gameBackgroundMusic) {
      this.gameBackgroundMusic.play();
    }
  }

  setVolume(type: 'background' | 'game', volume: number) {
    const clampedVolume = Math.max(0, Math.min(1, volume));

    if (type === 'background' && this.backgroundMusic) {
      this.backgroundMusic.setVolume(clampedVolume);
    } else if (type === 'game' && this.gameBackgroundMusic) {
      this.gameBackgroundMusic.setVolume(clampedVolume);
    }
  }

  getCurrentVolume(type: 'background' | 'game'): number {
    if (type === 'background' && this.backgroundMusic) {
      return this.backgroundMusic.getVolume();
    } else if (type === 'game' && this.gameBackgroundMusic) {
      return this.gameBackgroundMusic.getVolume();
    }
    return 0;
  }

  isPlaying(type: 'background' | 'game'): boolean {
    if (type === 'background' && this.backgroundMusic) {
      return this.backgroundMusic.isPlaying();
    } else if (type === 'game' && this.gameBackgroundMusic) {
      return this.gameBackgroundMusic.isPlaying();
    }
    return false;
  }

  // Clean shutdown method for app termination
  async cleanup(): Promise<void> {
    // Clear app state listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    // Wait for any pending loads to complete and then cleanup
    await Promise.all(Array.from(this.loadingPromises.values()));

    // Clean up all audio resources
    await Promise.all([
      this.stopBackgroundMusic(),
      this.stopGameBackgroundMusic(),
    ]);

    this.loadingPromises.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const CommonAudioManager = new CommonAudioManagerClass();
