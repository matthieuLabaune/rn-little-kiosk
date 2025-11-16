import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, DEFAULT_SETTINGS } from '../config/settingsModel';

const SETTINGS_KEY = '@kioskSettings';

export class ConfigStorage {
  static async loadSettings(): Promise<AppSettings> {
    try {
      const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
      if (jsonValue != null) {
        const stored = JSON.parse(jsonValue);
        // Merge avec les defaults pour ajouter de nouvelles options
        return { ...DEFAULT_SETTINGS, ...stored };
      }
    } catch (e) {
      console.error('Erreur chargement config:', e);
    }
    return DEFAULT_SETTINGS;
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const jsonValue = JSON.stringify(settings);
      await AsyncStorage.setItem(SETTINGS_KEY, jsonValue);
    } catch (e) {
      console.error('Erreur sauvegarde config:', e);
    }
  }

  static async resetSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
    } catch (e) {
      console.error('Erreur reset config:', e);
    }
  }

  static async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> {
    const settings = await this.loadSettings();
    settings[key] = value;
    await this.saveSettings(settings);
  }
}
