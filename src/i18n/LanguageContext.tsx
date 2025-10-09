import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import trTranslations from './locales/tr.json';
import enTranslations from './locales/en.json';

export type SupportedLanguage = 'tr' | 'en';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  tr: trTranslations,
  en: enTranslations,
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('tr');
  const [isLoading, setIsLoading] = useState(true);

  // AsyncStorage'dan dil tercihini yükle
  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('@language_preference');
      if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage as SupportedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: SupportedLanguage) => {
    try {
      await AsyncStorage.setItem('@language_preference', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let translation: any = translations[language];

    // Nested key'leri traverse et
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Key bulunamazsa key'i döndür
      }
    }

    if (typeof translation !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // Parametreleri değiştir ({{param}} formatında)
    if (params) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return translation;
  };

  // Loading sırasında çocukları render etme
  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Convenience hook for translations
export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};
