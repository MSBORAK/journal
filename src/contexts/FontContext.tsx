import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FontConfig {
  name: string;
  size: number;
  weight: 'normal' | 'bold';
  family?: string;
}

interface FontContextType {
  fontConfig: FontConfig;
  setFontConfig: (config: FontConfig) => void;
  loadFontConfig: () => Promise<void>;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

const defaultFontConfig: FontConfig = {
  name: 'system',
  size: 16,
  weight: 'normal',
};

export const FontProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontConfig, setFontConfigState] = useState<FontConfig>(defaultFontConfig);

  const loadFontConfig = async () => {
    try {
      const savedFont = await AsyncStorage.getItem('selectedFont');
      if (savedFont) {
        const fontOptions = {
          system: { name: 'system', size: 16, weight: 'normal' as const },
          large: { name: 'large', size: 18, weight: 'normal' as const },
          small: { name: 'small', size: 14, weight: 'normal' as const },
          bold: { name: 'bold', size: 16, weight: 'bold' as const },
          comfortable: { name: 'comfortable', size: 17, weight: 'normal' as const },
          compact: { name: 'compact', size: 15, weight: 'normal' as const },
          elegant: { name: 'elegant', size: 16, weight: 'bold' as const },
          readable: { name: 'readable', size: 16, weight: 'normal' as const },
        };
        
        const config = fontOptions[savedFont as keyof typeof fontOptions] || defaultFontConfig;
        setFontConfigState(config);
      }
    } catch (error) {
      console.error('Error loading font config:', error);
    }
  };

  const setFontConfig = async (config: FontConfig) => {
    try {
      await AsyncStorage.setItem('selectedFont', config.name);
      setFontConfigState(config);
    } catch (error) {
      console.error('Error saving font config:', error);
    }
  };

  useEffect(() => {
    loadFontConfig();
  }, []);

  return (
    <FontContext.Provider value={{ fontConfig, setFontConfig, loadFontConfig }}>
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
};
