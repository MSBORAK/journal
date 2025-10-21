import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTranslation, getCurrentLanguage, setLanguage, supportedLanguages, Language } from '../services/languageService';

interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (language: string) => Promise<void>;
  t: (key: string) => string;
  supportedLanguages: Language[];
  isLoading: boolean;
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
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        setCurrentLanguageState(savedLanguage);
      } else {
        // Default language
        setCurrentLanguageState('tr');
      }
    } catch (error) {
      console.error('Error loading language:', error);
      setCurrentLanguageState('tr');
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentLanguage = async (language: string) => {
    try {
      await AsyncStorage.setItem('selectedLanguage', language);
      setCurrentLanguageState(language);
      await setLanguage(language);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const t = (key: string): string => {
    return getTranslation(key, currentLanguage);
  };

  const value: LanguageContextType = {
    currentLanguage,
    setCurrentLanguage,
    t,
    supportedLanguages,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
