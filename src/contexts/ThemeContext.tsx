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
      primary: '#ffffff',
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
      primary: '#3b82f6',
      background: '#0f172a',
      card: '#1e293b',
      text: '#f8fafc',
      accent: '#334155',
      secondary: '#94a3b8',
      border: '#475569',
      shadow: '#000000',
    },
  },
  {
    name: 'ocean',
    label: '🌊 Okyanus Esintisi',
    colors: {
      primary: '#0ea5e9',
      background: '#f0f9ff',
      card: '#e0f2fe',
      text: '#0c4a6e',
      accent: '#bae6fd',
      secondary: '#0369a1',
      border: '#7dd3fc',
      shadow: '#000000',
    },
  },
  {
    name: 'forest',
    label: '🌲 Orman Derinlikleri',
    colors: {
      primary: '#16a34a',
      background: '#f0fdf4',
      card: '#dcfce7',
      text: '#14532d',
      accent: '#bbf7d0',
      secondary: '#15803d',
      border: '#86efac',
      shadow: '#000000',
    },
  },
  {
    name: 'lavender',
    label: '💜 Lavanta Rüyası',
    colors: {
      primary: '#a855f7',
      background: '#faf5ff',
      card: '#f3e8ff',
      text: '#581c87',
      accent: '#e9d5ff',
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
      background: '#fdf2f8',
      card: '#fce7f3',
      text: '#831843',
      accent: '#f9a8d4',
      secondary: '#be185d',
      border: '#f472b6',
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
    <ThemeContext.Provider value={{ 
      currentTheme, 
      setTheme, 
      themes
    }}>
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
