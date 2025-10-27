/**
 * Professional i18n Service
 * Turkish and English language support with JSON files
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const supportedLanguages: Language[] = [
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  }
];

export const defaultLanguage = 'tr';

// Translation cache
let translationsCache: { [key: string]: any } = {};

// Load translations from JSON files
const loadTranslations = async (language: string): Promise<any> => {
  try {
    if (translationsCache[language]) {
      return translationsCache[language];
    }

    // Import JSON files dynamically
    let translations;
    if (language === 'tr') {
      translations = require('../locales/tr.json');
    } else if (language === 'en') {
      translations = require('../locales/en.json');
    } else {
      translations = require('../locales/tr.json'); // fallback to Turkish
    }

    translationsCache[language] = translations;
    return translations;
  } catch (error) {
    console.error(`Error loading translations for ${language}:`, error);
    // Fallback to Turkish
    if (language !== 'tr') {
      return loadTranslations('tr');
    }
    return {};
  }
};

// Get nested translation value using dot notation
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

export const getTranslation = async (key: string, language: string = 'tr'): Promise<string> => {
  try {
    const translations = await loadTranslations(language);
    const value = getNestedValue(translations, key);
    return value || key; // Return key if translation not found
  } catch (error) {
    console.error(`Error getting translation for key ${key}:`, error);
    return key;
  }
};

// Synchronous version for immediate use (uses cache)
export const getTranslationSync = (key: string, language: string = 'tr'): string => {
  try {
    const translations = translationsCache[language];
    if (!translations) {
      return key;
    }
    const value = getNestedValue(translations, key);
    return value || key;
  } catch (error) {
    console.error(`Error getting sync translation for key ${key}:`, error);
    return key;
  }
};

export const getCurrentLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
    return savedLanguage || defaultLanguage;
  } catch (error) {
    console.error('Error loading language:', error);
    return defaultLanguage;
  }
};

export const setLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('selectedLanguage', language);
    // Preload translations for the new language
    await loadTranslations(language);
    console.log(`Language set to: ${language}`);
  } catch (error) {
    console.error('Error setting language:', error);
  }
};

// Preload all translations
export const preloadTranslations = async (): Promise<void> => {
  try {
    await Promise.all([
      loadTranslations('tr'),
      loadTranslations('en')
    ]);
  } catch (error) {
    console.error('Error preloading translations:', error);
  }
};
