import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_ENABLED_KEY = 'sound_enabled';

export class SoundService {
  private static instance: SoundService;
  private sounds: { [key: string]: Audio.Sound } = {};
  private isEnabled: boolean = true;

  private constructor() {
    this.initializeSounds();
  }

  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  private async initializeSounds() {
    try {
      // Load sound settings
      const soundEnabled = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      this.isEnabled = soundEnabled !== 'false';

      // Pre-load common sounds
      await this.loadSound('success', require('../../assets/sounds/success-340660.mp3'));
      await this.loadSound('tap', require('../../assets/sounds/ui-click-43196.mp3'));
      await this.loadSound('notification', require('../../assets/sounds/bell-notification-337658.mp3'));
    } catch (error) {
      console.log('Sound initialization error:', error);
    }
  }

  private async loadSound(name: string, source: any) {
    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,
        isLooping: false,
        volume: 0.7,
      });
      this.sounds[name] = sound;
    } catch (error) {
      console.log(`Failed to load sound ${name}:`, error);
      // Ses dosyası yoksa sessiz çalış
    }
  }

  public async playSound(soundName: string, volume: number = 0.7) {
    if (!this.isEnabled) return;

    try {
      const sound = this.sounds[soundName];
      if (sound) {
        await sound.setVolumeAsync(volume);
        await sound.replayAsync();
      } else {
        console.log(`Sound ${soundName} not loaded`);
      }
    } catch (error) {
      console.log(`Failed to play sound ${soundName}:`, error);
      // Don't throw error, just log it
    }
  }

  public async setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    await AsyncStorage.setItem(SOUND_ENABLED_KEY, enabled.toString());
  }

  public isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  // Specific sound methods
  public async playSuccess() {
    await this.playSound('success', 0.8);
  }

  public async playTap() {
    await this.playSound('tap', 0.5);
  }


  public async playNotification() {
    await this.playSound('notification', 0.6);
  }

  public async unloadAll() {
    try {
      await Promise.all(
        Object.values(this.sounds).map(sound => sound.unloadAsync())
      );
      this.sounds = {};
    } catch (error) {
      console.log('Failed to unload sounds:', error);
    }
  }
}

// Export singleton instance
export const soundService = SoundService.getInstance();
