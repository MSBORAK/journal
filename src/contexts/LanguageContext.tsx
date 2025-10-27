import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getTranslationSync, 
  getCurrentLanguage, 
  setLanguage, 
  supportedLanguages, 
  Language,
  preloadTranslations 
} from '../services/languageService';

interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (language: string) => Promise<void>;
  t: (key: string) => string;
  supportedLanguages: Language[];
  isLoading: boolean;
  isEnglish: boolean; // Helper to check if current language is English
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<string>('tr');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      // Preload all translations
      await preloadTranslations();
      
      // Load saved language
      const savedLanguage = await getCurrentLanguage();
      setCurrentLanguageState(savedLanguage);
    } catch (error) {
      console.error('Error initializing language:', error);
      setCurrentLanguageState('tr');
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentLanguage = async (language: string) => {
    try {
      await setLanguage(language);
      setCurrentLanguageState(language);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const t = (key: string): string => {
    return getTranslationSync(key, currentLanguage);
  };

  const isEnglish = currentLanguage === 'en';

  const value: LanguageContextType = {
    currentLanguage,
    setCurrentLanguage,
    t,
    supportedLanguages,
    isLoading,
    isEnglish
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
