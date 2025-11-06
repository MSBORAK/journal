import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getTranslationSync, 
  getCurrentLanguage, 
  setLanguage, 
  getDeviceLanguage,
  supportedLanguages, 
  Language,
  preloadTranslations 
} from '../services/languageService';

interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (language: string, userId?: string) => Promise<void>;
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
  const [currentLanguage, setCurrentLanguageState] = useState<string>('en'); // Varsayılan olarak İngilizce (cihaz diline göre değişecek)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      // Preload all translations
      await preloadTranslations();
      
      // Load saved language or device language
      // getCurrentLanguage() içinde zaten getDeviceLanguage() çağrılıyor
      const language = await getCurrentLanguage();
      
      // Dil seçilmediyse cihaz dilini ayarla
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (!savedLanguage) {
        const deviceLang = getDeviceLanguage();
        await setLanguage(deviceLang);
        setCurrentLanguageState(deviceLang);
        console.log(`✅ Language initialized with device language: ${deviceLang}`);
      } else {
        setCurrentLanguageState(language);
        console.log(`✅ Language initialized with saved language: ${language}`);
      }
    } catch (error) {
      console.error('Error initializing language:', error);
      // Hata durumunda cihaz dilini kullan
      try {
        const deviceLang = getDeviceLanguage();
        setCurrentLanguageState(deviceLang);
      } catch (e) {
        setCurrentLanguageState('en'); // Son çare olarak İngilizce
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentLanguage = async (language: string, userId?: string) => {
    try {
      await setLanguage(language);
      setCurrentLanguageState(language);
      
      // Dil değiştiğinde bildirimleri yeniden zamanla (senkronizasyon)
      // UI ve bildirimler aynı anda güncellenmeli
      try {
        const { scheduleAllNotifications } = await import('../services/notificationService');
        await scheduleAllNotifications(userId);
        console.log('✅ Bildirimler dil değişikliğinde yeniden zamanlandı');
      } catch (notifError) {
        console.error('Error rescheduling notifications on language change:', notifError);
      }
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
