import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  name: string;
  label: string;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    accent: string;
    secondary: string;
    border: string;
    shadow: string;
  };
}

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeName: string) => Promise<void>;
  themes: Theme[];
}

const themes: Theme[] = [
  {
    name: 'light',
    label: '✨ Gün Işığı',
    colors: {
      primary: '#a855f7',
      background: '#fefefe',
      card: '#ffffff',
      text: '#1f2937',
      accent: '#f8fafc',
      secondary: '#6b7280',
      border: '#e2e8f0',
      shadow: '#000000',
    },
  },
  {
    name: 'dark',
    label: '🌙 Gece Işıltısı',
    colors: {
      primary: '#8b5cf6',
      background: '#0f0f23',
      card: '#1a1a2e',
      text: '#e2e8f0',
      accent: '#16213e',
      secondary: '#94a3b8',
      border: '#334155',
      shadow: '#000000',
    },
  },
  {
    name: 'ocean',
    label: '🌊 Okyanus Esintisi',
    colors: {
      primary: '#0891b2',
      background: '#f0f9ff',
      card: '#ffffff',
      text: '#0e7490',
      accent: '#e0f2fe',
      secondary: '#0284c7',
      border: '#7dd3fc',
      shadow: '#000000',
    },
  },
  {
    name: 'sunset',
    label: '🌅 Gün Batımı',
    colors: {
      primary: '#ea580c',
      background: '#fff7ed',
      card: '#ffffff',
      text: '#9a3412',
      accent: '#fed7aa',
      secondary: '#dc2626',
      border: '#fdba74',
      shadow: '#000000',
    },
  },
  {
    name: 'forest',
    label: '🌲 Orman Derinlikleri',
    colors: {
      primary: '#059669',
      background: '#f0fdf4',
      card: '#ffffff',
      text: '#065f46',
      accent: '#dcfce7',
      secondary: '#047857',
      border: '#86efac',
      shadow: '#000000',
    },
  },
  {
    name: 'lavender',
    label: '💜 Lavanta Rüyası',
    colors: {
      primary: '#8b5cf6',
      background: '#faf5ff',
      card: '#ffffff',
      text: '#6b21a8',
      accent: '#f3e8ff',
      secondary: '#7c3aed',
      border: '#c4b5fd',
      shadow: '#000000',
    },
  },
  {
    name: 'rose',
    label: '🌹 Gül Bahçesi',
    colors: {
      primary: '#e11d48',
      background: '#fff1f2',
      card: '#ffffff',
      text: '#9f1239',
      accent: '#ffe4e6',
      secondary: '#be123c',
      border: '#fecaca',
      shadow: '#000000',
    },
  },
  {
    name: 'midnight',
    label: '🌌 Gece Yarısı',
    colors: {
      primary: '#6366f1',
      background: '#0f0f23',
      card: '#1e1e3f',
      text: '#e0e7ff',
      accent: '#312e81',
      secondary: '#8b5cf6',
      border: '#4338ca',
      shadow: '#000000',
    },
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('selectedTheme');
      if (storedTheme) {
        const theme = themes.find(t => t.name === storedTheme);
        if (theme) {
          setCurrentTheme(theme);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (themeName: string) => {
    try {
      const theme = themes.find(t => t.name === themeName);
      if (theme) {
        setCurrentTheme(theme);
        await AsyncStorage.setItem('selectedTheme', themeName);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
